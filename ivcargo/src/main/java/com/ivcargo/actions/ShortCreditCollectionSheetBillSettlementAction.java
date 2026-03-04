package com.ivcargo.actions;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.ShortCreditCollectionSheetSettlementBLL;
import com.businesslogic.bankpayment.BankPaymentBLL;
import com.businesslogic.moneyrecipt.MoneyReciptTxnBLL;
import com.businesslogic.properties.GeneralConfiguration;
import com.businesslogic.properties.impl.PropertyConfigValueBLLImpl;
import com.businesslogic.tds.TDSTxnDetailsBLL;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.constant.properties.STBSSettlementConfigurationConstant;
import com.iv.constant.properties.TDSPropertiesConstant;
import com.iv.dto.constant.FeildPermissionsConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.constant.Constant;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.ShortCreditConfigLimitDao;
import com.platform.dao.waybill.MoneyReceiptTxnDao;
import com.platform.dto.AliasNameConstants;
import com.platform.dto.BankPayment;
import com.platform.dto.DiscountDetails;
import com.platform.dto.Executive;
import com.platform.dto.MoneyReceiptTxn;
import com.platform.dto.MoneyReceiptTxnSequence;
import com.platform.dto.PropertiesFileConstants;
import com.platform.dto.ShortCreditCollectionBillClearanceDto;
import com.platform.dto.ShortCreditConfigLimit;
import com.platform.dto.configuration.modules.BankStatementConfigurationDTO;
import com.platform.dto.configuration.modules.CashStatementConfigurationDTO;
import com.platform.dto.configuration.modules.PartyWiseLedgerAccountsDTO;
import com.platform.dto.constant.BillClearanceStatusConstant;
import com.platform.dto.constant.PaymentTypeConstant;
import com.platform.dto.model.CreditWayBillTxn;
import com.platform.dto.tds.TDSTxnDetails;

public class ShortCreditCollectionSheetBillSettlementAction implements Action{
	public static final String TRACE_ID = "ShortCreditCollectionSheetBillSettlementAction";
	boolean	bankPaymentOperationRequired			= false;

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		CacheManip											cacheManip				= null;
		HashMap<String,Object>	 							error 					= null;
		Executive											executive 				= null;
		ValueObject											valueInObject			= null;
		ShortCreditCollectionSheetSettlementBLL 			shortCreditSettlBll		= null;
		String[]											waybillIds				= null;
		String												billNumber				= null;
		ValueObject											outValueObj				= null;
		SimpleDateFormat 									sdf               		= null;
		Collection<ShortCreditCollectionBillClearanceDto> 	stbsDto 				= null;
		ShortCreditCollectionBillClearanceDto[]				billClearanceDtoArr		= null;
		ValueObject											cashStatementConfig		= null;
		var 												billId					= 0L;
		short												transactionType			= 0;
		var												collectionPersonId		= 0L;
		ValueObject											generalConfiguration	= null;
		HashMap<Long, BankPayment>    						bankPayemntHM			= null;
		ValueObject											bankStatementConfig		= null;
		BankPayment											bankPayment				= null;
		var												selectAllforPaymentMode	= false;
		Map<Object, Object>									stbsSettlementConfig			= null;
		var												allowAllSelectionForSTBSBillClearance	= false;
		var 											isMoneyReceiptRequired	= false;
		MoneyReceiptTxnSequence								moneyReceiptTxnSequence	= null;
		MoneyReceiptTxnSequence 							moneyReceiptTxnSequenceOut	= null;
		MoneyReceiptTxn										moneyReceiptTxnDetails		= null;
		MoneyReciptTxnBLL									moneyReciptTxnBLL			= null;
		var											isDiscountAllow								= false;
		List<DiscountDetails>							discountDetailsAL							= null;

		var	creationDateTime = DateTimeUtility.getCurrentTimeStamp();
		var											isTDSAllow								= false;
		Map<Object, Object>								tdsConfiguration						= null;
		TDSTxnDetailsBLL								tdsTxnDetailsBLL						= null;
		HashMap<Long, TDSTxnDetails>					tdsTxnDetailsHM							= null;
		HashMap<?, ?> 									execFldPermissions						= null;
		var											allowBackDateInSTBSSettlement			= false;
		var											shortCreditConfigLimitAllowed			= false;
		ShortCreditConfigLimit							shortCreditConfigLimit					= null;
		var											totalShortCreditAmount					= 0D;
		ValueObject										partyWiseLedgerConfig					= null;
		var											accountName								= "";

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error))
				return;

			cacheManip						= new CacheManip(request);
			executive 						= cacheManip.getExecutive(request);
			stbsSettlementConfig			= cacheManip.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.STBS_SETTLEMENT);
			generalConfiguration			= cacheManip.getGeneralConfiguration(request, executive.getAccountGroupId());
			bankPaymentOperationRequired	= generalConfiguration.getBoolean(GeneralConfiguration.BANK_PAYMENT_OPERATION_REQUIRED, false);
			isMoneyReceiptRequired			= (boolean) stbsSettlementConfig.getOrDefault(STBSSettlementConfigurationConstant.IS_MONEY_RECEIPT_REQUIRED,false);
			isDiscountAllow 				= (boolean) stbsSettlementConfig.getOrDefault(STBSSettlementConfigurationConstant.IS_DISCOUNT_COLUMN_DISPLAY, false);
			shortCreditConfigLimitAllowed	= (boolean) stbsSettlementConfig.getOrDefault(STBSSettlementConfigurationConstant.SHORT_CREDIT_CONFIG_LIMIT_ALLOWED, false);
			tdsConfiguration				= cacheManip.getTDSConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.STBS_SETTLEMENT);
			isTDSAllow						= (Boolean) tdsConfiguration.getOrDefault(TDSPropertiesConstant.IS_TDS_ALLOW, false);
			execFldPermissions				= cacheManip.getExecutiveFieldPermission(request);
			discountDetailsAL				= new ArrayList<>();

			allowBackDateInSTBSSettlement	= execFldPermissions != null && execFldPermissions.containsKey(FeildPermissionsConstant.ALLOW_BACK_DATE_IN_STBS_SETTLEMENT);

			partyWiseLedgerConfig			= PropertyConfigValueBLLImpl.getInstance().getConfiguration(executive, PropertiesFileConstants.PARTY_WISE_LEDGER_ACCOUNTS_CONFIG);

			if(bankPaymentOperationRequired && request.getParameterValues("paymentCheckBox") != null) {
				final var			valObjIn	= new ValueObject();
				valObjIn.put("paymentValuesArr", request.getParameterValues("paymentCheckBox"));
				valObjIn.put(ModuleIdentifierConstant.MODULE_ID, ModuleIdentifierConstant.STBS_SETTLEMENT);
				bankPayemntHM		= BankPaymentBLL.getInstance().createDtoForPayment(valObjIn, executive);
			}

			if(executive != null && request.getParameter("billId") != null){
				valueInObject 		= new ValueObject();
				shortCreditSettlBll = new ShortCreditCollectionSheetSettlementBLL();
				tdsTxnDetailsBLL	= new TDSTxnDetailsBLL();
				tdsTxnDetailsHM		= new HashMap<>();
				sdf    				= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
				stbsDto  			= new ArrayList<>();
				waybillIds 			= request.getParameterValues("wayBillId");
				collectionPersonId  = Long.parseLong(request.getParameter("collectionPersonId")) ;
				billNumber 			= request.getParameter("billNumber");
				transactionType 	= Short.parseShort(request.getParameter("transactionType"));
				billId 				= JSPUtility.GetLong(request, "billId",0);
				allowAllSelectionForSTBSBillClearance = (boolean) stbsSettlementConfig.getOrDefault(STBSSettlementConfigurationConstant.ALLOW_ALL_SELECTION_FOR_STBS_BILL_CLEARANCE,false);

				if(allowAllSelectionForSTBSBillClearance)
					selectAllforPaymentMode = JSPUtility.GetBoolean(request, "selectAllforPaymentMode",false);

				cashStatementConfig	= cacheManip.getCashStatementConfiguration(request, executive.getAccountGroupId());
				bankStatementConfig = cacheManip.getBankStatementConfiguration(request, executive.getAccountGroupId());

				for (final String waybillIdStr : waybillIds)
					if("1".equals(waybillIdStr.split("_")[1])) {
						final Long	wayBillId = Long.parseLong(waybillIdStr.split("_")[0]);

						var recAmount	= 0D;

						if(isTDSAllow)
							recAmount		= JSPUtility.GetDouble(request, "txnAmount_" + wayBillId, 0.00);
						else
							recAmount		= JSPUtility.GetDouble(request, "receiveAmt_" + wayBillId, 0.00);

						short paymentType = 0;

						if(selectAllforPaymentMode)
							paymentType = JSPUtility.GetShort(request, "paymentMode", (short) 0);
						else
							paymentType = JSPUtility.GetShort(request, "paymentMode_" + wayBillId, (short) 0);

						final var paymentStatus = JSPUtility.GetShort(request, "paymentStatus_" + wayBillId, (short) 0);

						if(recAmount > 0 && paymentType > 0 && paymentStatus > 0 || paymentStatus == ShortCreditCollectionBillClearanceDto.STBS_CLEARANCE_STATUS_NOT_RECEIVED_ID) {
							if(allowBackDateInSTBSSettlement)
								creationDateTime			= DateTimeUtility.appendTimeToDate(JSPUtility.GetString(request, "backDate_" + wayBillId));

							final var billClearanceDto = new ShortCreditCollectionBillClearanceDto();
							billClearanceDto.setShortCreditCollectionLedgerId(billId);
							billClearanceDto.setShortCreditCollectionLedgerNumber(billNumber);
							billClearanceDto.setCollectionPersonId(collectionPersonId);
							billClearanceDto.setWayBillId(wayBillId);
							billClearanceDto.setWayBillNumber(request.getParameter("wayBillNumber_" + wayBillId));
							billClearanceDto.setPartyMasterId(JSPUtility.GetLong(request, "partyMasterId_" + wayBillId,0));
							billClearanceDto.setAmount(Double.parseDouble(request.getParameter("finalAmount_" + wayBillId)));
							billClearanceDto.setReceivedAmount(recAmount);
							billClearanceDto.setTransactionType(transactionType);
							billClearanceDto.setCreationDateTimestamp(creationDateTime);
							billClearanceDto.setPaymentMode(paymentType);
							billClearanceDto.setDiscountType(JSPUtility.GetShort(request, "discountTypes_" + wayBillId, (short) 0));

							if(bankPaymentOperationRequired) {
								if(bankPayemntHM != null)
									if(allowAllSelectionForSTBSBillClearance && selectAllforPaymentMode )
										bankPayment		= bankPayemntHM.get((long) 0);
									else
										bankPayment		= bankPayemntHM.get(billClearanceDto.getWayBillId());

								if(bankPayment != null) {
									bankPayment.setChequeAmount(recAmount);
									billClearanceDto.setChequeDate(bankPayment.getChequeDate());
									billClearanceDto.setBankName(bankPayment.getIssueBank());
									billClearanceDto.setChequeNumber(BankPaymentBLL.getChequeNumber(bankPayment));
								}
							} else if(PaymentTypeConstant.getBankPaymentList().contains(billClearanceDto.getPaymentMode())
									&& billClearanceDto.getPaymentStatus() != ShortCreditCollectionBillClearanceDto.STBS_CLEARANCE_STATUS_NOT_RECEIVED_ID){
								final var 	strDate = JSPUtility.GetString(request, "chequeDate_" + wayBillId, "") + " 00:00:00";
								final var 		fDate 	= sdf.parse(strDate);
								final var timedate= new Timestamp(fDate.getTime());
								billClearanceDto.setChequeDate(timedate);
								billClearanceDto.setChequeNumber(JSPUtility.GetString(request, "chequeNo_" + wayBillId, null));
								billClearanceDto.setChequeAmount(JSPUtility.GetDouble(request, "chequeAmount_" + wayBillId, 0));
								billClearanceDto.setBankName(JSPUtility.GetString(request, "bankName_" + wayBillId, null));
							}

							billClearanceDto.setAccountGroupId(executive.getAccountGroupId());
							billClearanceDto.setRemark(JSPUtility.GetString(request, "remark_" + wayBillId, null));
							billClearanceDto.setPaymentStatus(paymentStatus);
							billClearanceDto.setStatus(ShortCreditCollectionBillClearanceDto.STBS_SETTLEMENT_STATUS_UNBILLED_ID);
							billClearanceDto.setExecutiveId(executive.getExecutiveId());
							billClearanceDto.setBranchId(executive.getBranchId());
							billClearanceDto.setWaybillIds(waybillIdStr);
							stbsDto.add(billClearanceDto);

							if(shortCreditConfigLimitAllowed)
								totalShortCreditAmount += billClearanceDto.getReceivedAmount();

							if(isTDSAllow) {
								final var	tdsAmount	= JSPUtility.GetDouble(request, "tdsAmount_" + wayBillId, 0.0);

								if(tdsAmount > 0.0) {
									final var valueObjectForTds	= new ValueObject();

									valueObjectForTds.put(AliasNameConstants.TDS_AMOUNT, tdsAmount);
									valueObjectForTds.put("tdsRate", JSPUtility.GetDouble(request, "tdsRate_" + wayBillId, 0.00));
									valueObjectForTds.put("txnAmount", JSPUtility.GetDouble(request, "txnAmount_" + wayBillId, 0.00));
									valueObjectForTds.put(Constant.PAN_NUMBER, JSPUtility.GetString(request, "panNumber_" + wayBillId, null));
									valueObjectForTds.put(Constant.TAN_NUMBER, JSPUtility.GetString(request, "tanNumber_" + wayBillId, null));

									tdsTxnDetailsHM.put(wayBillId, tdsTxnDetailsBLL.getTDSTxnDetailsDTOForSTBS(valueObjectForTds, billClearanceDto));
								}

								if(isDiscountAllow && billClearanceDto.getPaymentStatus() == BillClearanceStatusConstant.BILL_CLEARANCE_STATUS_NEGOTIATED_ID)
									discountDetailsAL.add(createDtoToSetDiscountDetails(request, billClearanceDto, executive, wayBillId, creationDateTime));
							}
						}
					}

				if(shortCreditConfigLimitAllowed) {
					shortCreditConfigLimit = ShortCreditConfigLimitDao.getInstance().getShortCreditConfigLimit(executive.getBranchId(), executive.getAccountGroupId());

					if(shortCreditConfigLimit != null && shortCreditConfigLimit.getCreditType() == ShortCreditConfigLimit.CREDIT_TYPE_BRANCH_LEVEL
							&& shortCreditConfigLimit.getBalance() != shortCreditConfigLimit.getCreditLimit())
						if(shortCreditConfigLimit.getBalance() + totalShortCreditAmount >= shortCreditConfigLimit.getCreditLimit())
							shortCreditConfigLimit.setBalance(shortCreditConfigLimit.getCreditLimit());
						else
							shortCreditConfigLimit.setBalance(shortCreditConfigLimit.getBalance() + totalShortCreditAmount);
				}

				billClearanceDtoArr = new ShortCreditCollectionBillClearanceDto[stbsDto.size()];
				stbsDto.toArray(billClearanceDtoArr);

				if(bankStatementConfig != null) {
					accountName                     = bankStatementConfig.getString(BankStatementConfigurationDTO.DATA_FOR_STBS_SETTLEMENT,"");
					bankStatementConfig.put(BankStatementConfigurationDTO.ACCOUNT_NAME, accountName);
				}

				valueInObject.put("discountDetailsAL", discountDetailsAL);
				valueInObject.put("billClearanceDtoArr", billClearanceDtoArr);
				valueInObject.put("billId", billId);
				valueInObject.put("executive", executive);
				valueInObject.put("waybillIds", waybillIds);
				valueInObject.put(CashStatementConfigurationDTO.CASH_STATEMENT_CONFIGURATION, cashStatementConfig);
				valueInObject.put(BankStatementConfigurationDTO.BANK_STATEMENT_CONFIGURATION, bankStatementConfig);
				valueInObject.put(PartyWiseLedgerAccountsDTO.PARTY_WISE_LEDGER_CONFIGURATION, partyWiseLedgerConfig);
				valueInObject.put(BankPayment.BANK_PAYMENT, bankPayemntHM);
				valueInObject.put("allowAllSelectionForSTBSBillClearance", allowAllSelectionForSTBSBillClearance);
				valueInObject.put("selectAllforPaymentMode", selectAllforPaymentMode);
				valueInObject.put("isMoneyReceiptRequired", isMoneyReceiptRequired);
				valueInObject.put(AliasNameConstants.TDS_TXN_DETAILS_HM, tdsTxnDetailsHM);
				valueInObject.put("creationDateTime", creationDateTime);
				valueInObject.put("shortCreditConfigLimit", shortCreditConfigLimit);

				if(isMoneyReceiptRequired){
					moneyReceiptTxnSequence =new MoneyReceiptTxnSequence();
					moneyReciptTxnBLL		=new MoneyReciptTxnBLL();
					moneyReciptTxnBLL.createDTOMoneyReceiptSequnce(moneyReceiptTxnSequence, executive);
					moneyReceiptTxnSequenceOut = MoneyReceiptTxnDao.getInstance().getMoneyReceiptSequence(moneyReceiptTxnSequence);

					if(moneyReceiptTxnSequenceOut != null){
						moneyReceiptTxnSequenceOut.setMoneyReceiptNextSequence(""+moneyReceiptTxnSequenceOut.getNextVal());
						moneyReceiptTxnDetails  = moneyReciptTxnBLL.createMoneyReceiptDtoFor(executive, moneyReceiptTxnSequenceOut);
						moneyReceiptTxnDetails.setId(billId);
						moneyReceiptTxnDetails.setModuleIdentifier(ModuleIdentifierConstant.STBS_SETTLEMENT);
						moneyReceiptTxnDetails.setSourceBranchId(executive.getBranchId());
						moneyReceiptTxnDetails.setTxnDateTime(creationDateTime);
						valueInObject.put("moneyReceiptTxnDetails", moneyReceiptTxnDetails);
						outValueObj = shortCreditSettlBll.insertInShortCreditCollectionBillClearance(valueInObject);
						response.sendRedirect("ShortCreditCollectionSheet.do?pageId=286&eventId=5&bilNumber="+outValueObj.get("ledgerNumber")+"&billId="+billId);
						request.setAttribute("nextPageToken", "success");
					}

				}else {
					outValueObj = shortCreditSettlBll.insertInShortCreditCollectionBillClearance(valueInObject);
					response.sendRedirect("ShortCreditCollectionSheet.do?pageId=286&eventId=5&bilNumber="+outValueObj.get("ledgerNumber"));
					request.setAttribute("nextPageToken", "success");
				}
			} else
				request.setAttribute("nextPageToken", "needlogin");
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}
	}

	public DiscountDetails createDtoToSetDiscountDetails(HttpServletRequest request, ShortCreditCollectionBillClearanceDto billClearanceDto, Executive executive, Long wayBillId, Timestamp creationDateTime) throws Exception {
		DiscountDetails		discountDetails		= null;

		try {
			discountDetails = new DiscountDetails();
			discountDetails.setWaybillId(billClearanceDto.getWayBillId());

			if(billClearanceDto.getTransactionType() == CreditWayBillTxn.TXN_TYPE_BOOKING_ID)
				discountDetails.setDiscountType(DiscountDetails.DISCOUNT_TYPE_BOOKING);
			else
				discountDetails.setDiscountType(DiscountDetails.DISCOUNT_TYPE_DELIVERY);

			discountDetails.setDiscountMasterId(JSPUtility.GetInt(request, "discountTypes_" + wayBillId));
			discountDetails.setAmount(JSPUtility.GetDouble(request, "balanceAmt_" + wayBillId, 0));
			discountDetails.setStatus(true);

			discountDetails.setAccountGroupId(executive.getAccountGroupId());
			discountDetails.setBranchId(executive.getBranchId());
			discountDetails.setDiscountDateTime(creationDateTime);
			discountDetails.setExecutiveId(executive.getExecutiveId());

			return discountDetails;
		} catch (final Exception e) {
			e.printStackTrace();
			throw e;
		} finally {
			discountDetails		= null;
		}
	}
}