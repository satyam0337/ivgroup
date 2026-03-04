package com.ivcargo.actions.transport;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.StringJoiner;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.CRTxnBLL;
import com.businesslogic.CreditPaymentModuleBLL;
import com.businesslogic.bankpayment.BankPaymentBLL;
import com.businesslogic.properties.GeneralConfiguration;
import com.businesslogic.properties.impl.PropertyConfigValueBLLImpl;
import com.businesslogic.tds.TDSTxnDetailsBLL;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.constant.properties.LRCreditConfigurationConstant;
import com.iv.constant.properties.TDSPropertiesConstant;
import com.iv.constant.properties.cashstatement.CashStatementPropertiesConstant;
import com.iv.dao.impl.sequencecounter.OnAccountSequenceCounterDaoImpl;
import com.iv.dto.OnAccount;
import com.iv.dto.sequencecounter.OnAccountSequenceCounter;
import com.iv.logsapp.LogWriter;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.constant.AccountGroupConstant;
import com.iv.utils.constant.Constant;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.exception.ExceptionProcess;
import com.iv.utils.message.MessageList;
import com.iv.utils.utility.CollectionUtility;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.DeliveryContactDetailsDao;
import com.platform.dao.ShortCreditConfigLimitDao;
import com.platform.dao.WayBillDao;
import com.platform.dao.reports.CreditWayBillTxnClearanceSummaryDAO;
import com.platform.dto.AliasNameConstants;
import com.platform.dto.BankPayment;
import com.platform.dto.BookingWayBillTxn;
import com.platform.dto.CRTxn;
import com.platform.dto.ChequeBounceModel;
import com.platform.dto.CreditWayBillTxnClearance;
import com.platform.dto.DeliveryContactDetails;
import com.platform.dto.DiscountDetails;
import com.platform.dto.Executive;
import com.platform.dto.ManualTransaction;
import com.platform.dto.PropertiesFileConstants;
import com.platform.dto.ShortCreditConfigLimit;
import com.platform.dto.WayBill;
import com.platform.dto.WayBillInfo;
import com.platform.dto.configuration.modules.BankStatementConfigurationDTO;
import com.platform.dto.configuration.modules.CashStatementConfigurationDTO;
import com.platform.dto.configuration.modules.PartyWiseLedgerAccountsDTO;
import com.platform.dto.constant.BillClearanceStatusConstant;
import com.platform.dto.constant.CreditPaymentTypeConstant;
import com.platform.dto.constant.FeildPermissionsConstant;
import com.platform.dto.constant.ModuleIdentifierConstant;
import com.platform.dto.constant.PaymentTypeConstant;
import com.platform.dto.model.CreditWayBillTxn;
import com.platform.dto.model.CreditWayBillTxnCleranceSummary;
import com.platform.dto.tds.TDSTxnDetails;
import com.platform.resource.CargoErrorList;
import com.platform.utils.PropertiesUtility;
import com.platform.utils.TokenGenerator;
import com.platform.utils.Utility;

public class CreditPaymentModuleAction implements Action {

	private static final String TRACE_ID = "CreditPaymentModuleAction";

	boolean			bankPaymentOperationRequired			= false;
	boolean			chequeBounceRequired					= false;

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>							error 									= null;
		final CreditWayBillTxn[] 								creditWayBillTxns						= null;
		ArrayList<CreditWayBillTxn>						creditWBTxnList 						= null;
		WayBill[]										wayBillArr								= null;
		WayBillInfo[]									wayBillInfoArray						= null;
		BookingWayBillTxn[]								bookingWayBillTxnArray					= null;
		HashMap<Long, WayBill> 							lrColl  								= null;
		CreditWayBillTxnClearance			  			creditWayBillTxnClearance				= null;
		CreditWayBillTxnClearance[] 		  			creditWayBillTxnClearanceArr  			= null;
		CreditWayBillTxnCleranceSummary		  			creditWayBillTxnCleranceSummaryMdl 		= null;
		ArrayList<CreditWayBillTxnCleranceSummary> 		creditWayBillTxnClearanceSummaryList 	= null;
		HashMap<Long, DeliveryContactDetails> 			delConColl								= null;
		DeliveryContactDetails[]						delConDetArray 							= null;
		var											prevReceivedAmt							= 0.00;
		var 											count 									= 0;
		CRTxn[]											crTxnArray								= null;
		var											isTDSAllow								= false;
		HashMap<Long, BankPayment>    					bankPaymentHM							= null;
		ChequeBounceModel								chequeBounceModel						= null;
		ShortCreditConfigLimit							shortCreditConfigLimit					= null;
		var											totalShortCreditAmount					= 0D;
		short											shortCreditPaymentType_0				= 0;
		var									isAllowClubEntryForMultipleShortCreditPayment	= false;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request, error))
				return;

			final var	cacheManip						= new CacheManip(request);
			final var	wayBillList		 				= new ArrayList<WayBill>();
			final var	wayBillInfoList					= new ArrayList<WayBillInfo>();
			final List<Long>	wayBillIdList					= new ArrayList<>();
			final List<Long>	creditWayBillTxnIdList 			= new ArrayList<>();
			final var	txnTypeHM						= new HashMap<Long, Short>();
			final var	executive 						= cacheManip.getExecutive(request);
			var	createDate 						= DateTimeUtility.getCurrentTimeStamp();
			final var	valueInObject					= new ValueObject();
			final var	creditWayBillTxnClearanceList 	= new ArrayList<CreditWayBillTxnClearance>();
			final var totalBillCount 		= JSPUtility.GetInt(request, "TotalBillCount", 0);
			var indexForVal 				= 0;
			final var searchById			= JSPUtility.GetShort(request, "searchById", (short) 0);
			final var	creditWBStr						= new StringJoiner(",");
			final var	discountDetailsHM				= new HashMap<Long, DiscountDetails>();
			final List<Long>	deliveryTxnWayBillIdList 		= new ArrayList<>();
			final var	crIdList						= new ArrayList<Long>();
			final var	dcdHM							= new HashMap<Long, DeliveryContactDetails>();
			final var	crtxnBll						= new CRTxnBLL();
			final var	tdsTxnDetailsHM					= new HashMap<Long, TDSTxnDetails>();
			final var	tdsTxnDetailsBLL				= new TDSTxnDetailsBLL();
			final var	chequeBounceModelHM				= new HashMap<Long, ChequeBounceModel>();
			final var	generalConfiguration			= cacheManip.getGeneralConfiguration(request, executive.getAccountGroupId());
			bankPaymentOperationRequired	= generalConfiguration.getBoolean(GeneralConfiguration.BANK_PAYMENT_OPERATION_REQUIRED, false);
			chequeBounceRequired			= generalConfiguration.getBoolean(GeneralConfiguration.CHEQUE_BOUNCE_REQUIRED, false);
			final var	token							= JSPUtility.GetString(request, "token", null);

			final var	lrCreditConfigConfiguration		= cacheManip.getOldConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.SHORT_CREDIT_PAYMENT);
			final var	isDiscountAllow					= PropertiesUtility.isAllow(lrCreditConfigConfiguration.getString(LRCreditConfigurationConstant.IS_DISCOUNT_COLUMN_DISPLAY, "true"));

			final var	shortCreditConfigLimitAllowed				= lrCreditConfigConfiguration.getBoolean(LRCreditConfigurationConstant.SHORT_CREDIT_CONFIG_LIMIT_ALLOWED, false);
			final var	isAllowClaimEntry							= lrCreditConfigConfiguration.getBoolean(LRCreditConfigurationConstant.IS_ALLOW_CLAIM_ENTRY,false);
			final var	checkPartyMasterId							= lrCreditConfigConfiguration.getBoolean(LRCreditConfigurationConstant.CHECK_PARTY_MASTER_ID, false);
			final var	singleEntryForMultiplePayment				= lrCreditConfigConfiguration.getBoolean(LRCreditConfigurationConstant.SINGLE_ENTRY_FOR_MULTIPLE_PAYMENT, false);
			final var	isMoneyReceiptRequired						= lrCreditConfigConfiguration.getBoolean(LRCreditConfigurationConstant.IS_MONEY_RECEIPT_REQUIRED,false);
			final var	isOnlySingleMoneyReceiptNumberRequired		= lrCreditConfigConfiguration.getBoolean(LRCreditConfigurationConstant.IS_ONLY_SINGLE_MONEY_RECEIPT_NUMBER_REQUIRED,false);
			final var	isShowClubEntryForMultipleShortCreditPayment= lrCreditConfigConfiguration.getBoolean(LRCreditConfigurationConstant.IS_SHOW_CLUB_ENTRY_FOR_MULTIPLE_SHORT_CREDIT_PAYMENT,false);
			final var	redirectTypeOfSelectionPage					= lrCreditConfigConfiguration.getBoolean(LRCreditConfigurationConstant.REDIRECT_TYPE_OF_SELECTION_PAGE,false);
			final var	clearPartyWiseMultiplePaymentInSinglePaymentMode	= lrCreditConfigConfiguration.getBoolean(LRCreditConfigurationConstant.CLEAR_PARTY_WISE_MULTIPLE_PAYMENT_IN_SINGLE_PAYMENT_MODE,false);
			final var	settleOnlySelectedLrs						= lrCreditConfigConfiguration.getBoolean(LRCreditConfigurationConstant.SETTLE_ONLY_SELECTED_LRS,false);
			final var	tokenWiseCheckingForDuplicateTransaction	= lrCreditConfigConfiguration.getBoolean(LRCreditConfigurationConstant.TOKEN_WISE_CHECKING_FOR_DUPLICATE_TRANSACTION,false);
			final var	allowOnAccountEntryOnSinglePaymentReceive	= lrCreditConfigConfiguration.getBoolean(LRCreditConfigurationConstant.ALLOW_ON_ACCOUNT_ENTRY_ON_SINGLE_PAYMENT_RECEIVE, false) && JSPUtility.GetShort(request, "paryWisePaymentMode", (short) 0) > 0;

			final HashMap<?, ?>	execFldPermissions	= cacheManip.getExecutiveFieldPermission(request);

			final var	allowBackDateEntryForCreditPayment		= execFldPermissions != null && execFldPermissions.get(FeildPermissionsConstant.ALLOW_BACK_DATE_ENTRY_FOR_SHORT_CREDIT_PAYMENT) != null;

			if(allowBackDateEntryForCreditPayment)
				createDate			= DateTimeUtility.appendTimeToDate(JSPUtility.GetString(request, "BackDate"));

			final var	cashStatementConfig				= cacheManip.getCashStatementConfiguration(request, executive.getAccountGroupId());
			final var	bankStatementConfig				= cacheManip.getBankStatementConfiguration(request, executive.getAccountGroupId());
			final var	tdsConfiguration				= cacheManip.getTDSConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.SHORT_CREDIT_PAYMENT);
			final var	partyWiseLedgerConfig			= PropertyConfigValueBLLImpl.getInstance().getConfiguration(executive, PropertiesFileConstants.PARTY_WISE_LEDGER_ACCOUNTS_CONFIG);

			if(tdsConfiguration != null)
				isTDSAllow					= (Boolean) tdsConfiguration.getOrDefault(TDSPropertiesConstant.IS_TDS_ALLOW, false);

			if(bankPaymentOperationRequired && request.getParameterValues("paymentCheckBox") != null) {
				final var			valObjIn	= new ValueObject();

				valObjIn.put("paymentValuesArr", request.getParameterValues("paymentCheckBox"));
				valObjIn.put(ModuleIdentifierConstant.MODULE_ID, ModuleIdentifierConstant.SHORT_CREDIT_PAYMENT);
				bankPaymentHM		= BankPaymentBLL.getInstance().createDtoForPayment(valObjIn, executive);
			}

			final var	searchType = JSPUtility.GetLong(request, "typeOfSelectionId", 0);

			if(clearPartyWiseMultiplePaymentInSinglePaymentMode && searchById == CreditPaymentTypeConstant.CREDIT_PAYMENT_TYPE_PARTY_WISE)
				shortCreditPaymentType_0	= JSPUtility.GetShort(request, "paryWisePaymentMode", (short) 0);
			else
				shortCreditPaymentType_0	= JSPUtility.GetShort(request, "paymentMode_CreditClearanceTable-1", (short) 0);

			//On Account Sequence Counter Validation

			if(JSPUtility.GetLong(request, "partyMasterId", 0) > 0 && allowOnAccountEntryOnSinglePaymentReceive) {
				var 		onAccountSequenceCounter	= new OnAccountSequenceCounter();

				onAccountSequenceCounter.setAccountGroupId(executive.getAccountGroupId());
				onAccountSequenceCounter.setSequenceType(OnAccountSequenceCounter.ON_ACCOUNT_SEQUENCE_AUTO);
				onAccountSequenceCounter 	= OnAccountSequenceCounterDaoImpl.getInstance().getOnAccountSequenceCounter(onAccountSequenceCounter);

				if (onAccountSequenceCounter == null) {
					error.put(CargoErrorList.ERROR_CODE, CargoErrorList.ON_ACCOUNT_SEQUENCE_COUNTER);
					error.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.ON_ACCOUNT_SEQUENCE_COUNTER_NOT_FOUND);
					request.setAttribute(CargoErrorList.CARGO_ERROR, error);
					request.setAttribute(ActionStaticUtil.NEXTPAGETOKEN, Constant.FAILURE);
					return;
				}

				if (onAccountSequenceCounter.getNextVal() < onAccountSequenceCounter.getMinRange() || onAccountSequenceCounter.getNextVal() > onAccountSequenceCounter.getMaxRange()) {
					error.put(CargoErrorList.ERROR_CODE, MessageList.ON_ACCOUNT_SEQUENCE_COUNTER_OVER);
					request.setAttribute(CargoErrorList.CARGO_ERROR, error);
					request.setAttribute(ActionStaticUtil.NEXTPAGETOKEN, Constant.FAILURE);
					return;
				}

				System.out.println("onAccountSequenceCounter ,,,  " + onAccountSequenceCounter);
				valueInObject.put("onAccountSequenceCounter", onAccountSequenceCounter);
				valueInObject.put(Constant.CORPORATE_ACCOUNT_ID, JSPUtility.GetLong(request, Constant.CORPORATE_ACCOUNT_ID, 0));
				valueInObject.put("receivePartyAmt", JSPUtility.GetLong(request, "receivePartyAmt", 0));
				valueInObject.put("isOnAccountTransaction", JSPUtility.GetLong(request, "partyMasterId", 0) > 0);
			}

			for (var i = 0; i < totalBillCount; i++) {
				indexForVal = i + 1;

				if(settleOnlySelectedLrs && !JSPUtility.GetChecked(request, "check1_"+indexForVal))
					continue;

				if(JSPUtility.GetDouble(request, "receiveAmt_"+indexForVal, 0.00) > 0 || JSPUtility.GetShort(request, "hiddenPaymentStatus_" + indexForVal, (short) 0) == PaymentTypeConstant.PAYMENT_TYPE_STATUS_BAD_DEBT_ID) {
					if(searchById != CreditPaymentTypeConstant.MULTIPLE_CREDIT_WAYBILL_TXN_CLEAR || !checkPartyMasterId && !singleEntryForMultiplePayment && !isShowClubEntryForMultipleShortCreditPayment || count == 0) {
						creditWBTxnList  					 = new ArrayList<>();
						creditWayBillTxnClearance 			 = new CreditWayBillTxnClearance();
						creditWayBillTxnClearanceSummaryList = new ArrayList<>();
					}

					if(chequeBounceRequired && JSPUtility.GetShort(request, "isAllowChequePayment_" + indexForVal, (short) 0) > 0) {
						chequeBounceModel	= createPartyWiseChequeBounceDto(request, indexForVal, executive);

						if(chequeBounceModel != null)
							chequeBounceModelHM.put(JSPUtility.GetLong(request, "partyMasterIdNo_" + indexForVal,0), chequeBounceModel);
					}

					final var	creditWayBillTxn	= createDtoToSetCreditWayBillTxn(request, indexForVal);

					creditWBTxnList.add(creditWayBillTxn);
					creditWayBillTxnIdList.add(creditWayBillTxn.getCreditWayBillTxnId());

					final var	creditWayBillTxnClearanceSummary	= createDtoToSetCreditWayBillTxnCleranceSummary(request, executive, searchById, indexForVal, createDate, isTDSAllow, bankPaymentHM,isAllowClaimEntry, shortCreditPaymentType_0);

					if(creditWayBillTxnClearanceSummary.getPaymentType() == (short) 0) {
						error.put(CargoErrorList.ERROR_CODE, CargoErrorList.PAYMENT_TYPE_MISSING);
						error.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.PAYMENT_TYPE_MISSING_DESCRIPTION);
						request.setAttribute(CargoErrorList.CARGO_ERROR, error);
						request.setAttribute(ActionStaticUtil.NEXTPAGETOKEN, Constant.FAILURE);
						return;
					}

					if(shortCreditConfigLimitAllowed)
						totalShortCreditAmount += creditWayBillTxnClearanceSummary.getReceivedAmount();

					creditWayBillTxnClearanceSummaryList.add(creditWayBillTxnClearanceSummary);

					if(isTDSAllow) {
						final var	tdsAmount	= JSPUtility.GetDouble(request, "tdsAmt_" + indexForVal,0.0);

						if(tdsAmount > 0.0) {
							final var valueObjectForTds	= new ValueObject();

							valueObjectForTds.put("tdsAmount", JSPUtility.GetDouble(request, "tdsAmt_" + indexForVal));
							valueObjectForTds.put("txnAmount", JSPUtility.GetDouble(request, "txnAmount_" + indexForVal));
							valueObjectForTds.put("tdsRate", JSPUtility.GetDouble(request, "tdsRate_" + indexForVal, 0));
							valueObjectForTds.put(Constant.PAN_NUMBER, JSPUtility.GetString(request, "panNumber_" + indexForVal));
							valueObjectForTds.put(Constant.TAN_NUMBER, JSPUtility.GetString(request, "tanNumber_" + indexForVal));

							tdsTxnDetailsHM.put(creditWayBillTxnClearanceSummary.getWayBillId(), tdsTxnDetailsBLL.getTDSTxnDetailsDTOForShortCreditPayment(valueObjectForTds, creditWayBillTxnClearanceSummary));
						}
					}

					/*
					 * Method getting from below
					 */
					creditWayBillTxnClearance	= createDtoToSetCreditWayBillTxnClearance(request, creditWayBillTxnClearance, creditWayBillTxnClearanceSummary, executive, indexForVal, createDate, searchById, creditWBTxnList, creditWayBillTxnClearanceSummaryList, isTDSAllow);

					if(executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_BATCO)
						LogWriter.writeLog(TRACE_ID,LogWriter.LOG_LEVEL_INFO,"searchById...."+searchById+"====count==="+count);

					if(searchById != CreditPaymentTypeConstant.MULTIPLE_CREDIT_WAYBILL_TXN_CLEAR || !checkPartyMasterId && !singleEntryForMultiplePayment && !isShowClubEntryForMultipleShortCreditPayment)
						creditWayBillTxnClearanceList.add(creditWayBillTxnClearance);
					else {
						if(count == 0)
							creditWayBillTxnClearanceList.add(creditWayBillTxnClearance);

						isAllowClubEntryForMultipleShortCreditPayment	= true;
					}

					creditWBStr.add(creditWayBillTxn.getWayBillId() + "");

					if(isDiscountAllow && (creditWayBillTxn.getPaymentStatus() == BillClearanceStatusConstant.BILL_CLEARANCE_STATUS_NEGOTIATED_ID
							|| creditWayBillTxn.getPaymentStatus() == BillClearanceStatusConstant.BILL_CLEARANCE_STATUS_BAD_DEBT_ID)) {
						final var discountDetails	= discountDetailsHM.get(creditWayBillTxn.getWayBillId());

						if(discountDetails == null)
							discountDetailsHM.put(creditWayBillTxn.getWayBillId(), createDtoToSetDiscountDetails(request, creditWayBillTxn, executive, indexForVal, createDate));
					}

					final var	diff = Utility.getDayDiffBetweenTwoDates(creditWayBillTxnClearanceSummary.getReceivedDateTime(), createDate);

					if(diff > 0)
						creditWayBillTxnClearanceSummary.setManualTransaction(createManualTransactionDto(creditWayBillTxnClearanceSummary, createDate));

					count++;
				}
			}

			if(executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_BATCO && creditWayBillTxnClearanceList != null && !creditWayBillTxnClearanceList.isEmpty())
				LogWriter.writeLog(TRACE_ID,LogWriter.LOG_LEVEL_INFO,"creditWayBillTxnClearanceListmain...."+creditWayBillTxnClearanceList.size());

			if(shortCreditConfigLimitAllowed) {
				shortCreditConfigLimit = ShortCreditConfigLimitDao.getInstance().getShortCreditConfigLimit(executive.getBranchId(), executive.getAccountGroupId());

				if(shortCreditConfigLimit != null && shortCreditConfigLimit.getCreditType() == ShortCreditConfigLimit.CREDIT_TYPE_BRANCH_LEVEL && shortCreditConfigLimit.getBalance() != shortCreditConfigLimit.getCreditLimit())
					if(shortCreditConfigLimit.getBalance() + totalShortCreditAmount >= shortCreditConfigLimit.getCreditLimit())
						shortCreditConfigLimit.setBalance(shortCreditConfigLimit.getCreditLimit());
					else
						shortCreditConfigLimit.setBalance(shortCreditConfigLimit.getBalance() + totalShortCreditAmount);
			}

			if(creditWayBillTxnClearanceList != null && !creditWayBillTxnClearanceList.isEmpty()) {
				final var	creditWayBillTxnIds = CollectionUtility.getStringFromLongList(creditWayBillTxnIdList);
				final var	creditSummColl 		= CreditWayBillTxnClearanceSummaryDAO.getInstance().getCreditWayBillTxnSummaryByCreditWayBillTxnIds(creditWayBillTxnIds);

				for(var i = 0; i < creditWayBillTxnClearanceList.size(); i++) {
					creditWayBillTxnClearanceSummaryList 	 = creditWayBillTxnClearanceList.get(i).getCreditWayBillTxnCleranceSummaryList();

					if(creditWayBillTxnClearanceSummaryList != null && !creditWayBillTxnClearanceSummaryList.isEmpty())
						for(var j = 0; j < creditWayBillTxnClearanceSummaryList.size(); j++)
							if(creditWayBillTxnClearanceSummaryList.get(j).getPaymentStatus() == BillClearanceStatusConstant.BILL_CLEARANCE_STATUS_NEGOTIATED_ID
							|| creditWayBillTxnClearanceSummaryList.get(j).getPaymentStatus() == BillClearanceStatusConstant.BILL_CLEARANCE_STATUS_BAD_DEBT_ID) {
								prevReceivedAmt = 0.00;

								if(creditSummColl != null) {
									creditWayBillTxnCleranceSummaryMdl = creditSummColl.get(creditWayBillTxnClearanceSummaryList.get(j).getCreditWayBillTxnId());

									if(creditWayBillTxnCleranceSummaryMdl != null)
										prevReceivedAmt = creditWayBillTxnCleranceSummaryMdl.getReceivedAmount();
								}

								final var wayBillInfo	= new WayBillInfo();
								wayBillInfo.setWayBillId(creditWayBillTxnClearanceSummaryList.get(j).getWayBillId());

								if(creditWayBillTxnClearanceSummaryList.get(j).getTxnTypeId() == CreditWayBillTxn.TXN_TYPE_BOOKING_ID) {
									wayBillInfo.setBookingDiscount(creditWayBillTxnClearanceSummaryList.get(j).getGrandTotal() - (creditWayBillTxnClearanceSummaryList.get(j).getReceivedAmount() + prevReceivedAmt));
									creditWayBillTxnClearanceSummaryList.get(j).setDiscountAmount(wayBillInfo.getBookingDiscount());
								} else if(creditWayBillTxnClearanceSummaryList.get(j).getTxnTypeId() == CreditWayBillTxn.TXN_TYPE_DELIVERY_ID) {
									wayBillInfo.setDeliveryDiscount(creditWayBillTxnClearanceSummaryList.get(j).getGrandTotal() - (creditWayBillTxnClearanceSummaryList.get(j).getReceivedAmount() + prevReceivedAmt));
									creditWayBillTxnClearanceSummaryList.get(j).setDiscountAmount(wayBillInfo.getDeliveryDiscount());
								}

								txnTypeHM.put(wayBillInfo.getWayBillId(), creditWayBillTxnClearanceSummaryList.get(j).getTxnTypeId());
								wayBillInfoList.add(wayBillInfo);
								wayBillIdList.add(wayBillInfo.getWayBillId());

								deliveryTxnWayBillIdList.add(wayBillInfo.getWayBillId());
							}
				}
			}

			if(wayBillInfoList != null && !wayBillInfoList.isEmpty()) {
				final var	wayBillIds = CollectionUtility.getStringFromLongList(wayBillIdList);
				lrColl	   = WayBillDao.getInstance().getWayBillsByWayBillIds(wayBillIds);

				if(deliveryTxnWayBillIdList != null && !deliveryTxnWayBillIdList.isEmpty())
					delConColl = DeliveryContactDetailsDao.getInstance().getDeliveryContactDetails(CollectionUtility.getStringFromLongList(deliveryTxnWayBillIdList));

				wayBillInfoArray 		= new WayBillInfo[wayBillInfoList.size()];
				bookingWayBillTxnArray 	= new BookingWayBillTxn[wayBillInfoList.size()];
				wayBillInfoList.toArray(wayBillInfoArray);

				for(var i = 0; i < wayBillInfoArray.length; i++) {
					wayBillInfoArray[i].setAccountGroupId(lrColl.get(wayBillInfoArray[i].getWayBillId()).getAccountGroupId());
					wayBillInfoArray[i].setBookingBranchId(lrColl.get(wayBillInfoArray[i].getWayBillId()).getBookingBranchId());
					wayBillInfoArray[i].setSourceBranchId(lrColl.get(wayBillInfoArray[i].getWayBillId()).getSourceBranchId());
					wayBillInfoArray[i].setDestinationBranchId(lrColl.get(wayBillInfoArray[i].getWayBillId()).getDestinationBranchId());
					wayBillInfoArray[i].setBookingDateTime(lrColl.get(wayBillInfoArray[i].getWayBillId()).getBookingDateTime());
					wayBillInfoArray[i].setWayBillTypeId(lrColl.get(wayBillInfoArray[i].getWayBillId()).getWayBillTypeId());
					wayBillInfoArray[i].setBookingTotal(lrColl.get(wayBillInfoArray[i].getWayBillId()).getBookingTotal() - wayBillInfoArray[i].getBookingDiscount());
					wayBillInfoArray[i].setBookingDiscount(lrColl.get(wayBillInfoArray[i].getWayBillId()).getBookingDiscount() + wayBillInfoArray[i].getBookingDiscount());
					wayBillInfoArray[i].setDeliveryTotal(lrColl.get(wayBillInfoArray[i].getWayBillId()).getDeliveryTotal() - wayBillInfoArray[i].getDeliveryDiscount());
					wayBillInfoArray[i].setDeliveryDiscount(lrColl.get(wayBillInfoArray[i].getWayBillId()).getDeliveryDiscount() + wayBillInfoArray[i].getDeliveryDiscount());
					wayBillInfoArray[i].setGrandTotal(wayBillInfoArray[i].getBookingTotal() + wayBillInfoArray[i].getDeliveryTotal());
					wayBillInfoArray[i].setBookingChargesSum(lrColl.get(wayBillInfoArray[i].getWayBillId()).getBookingChargesSum());
					wayBillInfoArray[i].setBookingTimeServiceTax(lrColl.get(wayBillInfoArray[i].getWayBillId()).getBookingTimeServiceTax());
					wayBillInfoArray[i].setDeliveryChargesSum(lrColl.get(wayBillInfoArray[i].getWayBillId()).getDeliveryChargesSum());
					wayBillInfoArray[i].setDeliveryTimeServiceTax(lrColl.get(wayBillInfoArray[i].getWayBillId()).getDeliveryTimeServiceTax());

					bookingWayBillTxnArray[i] = new BookingWayBillTxn();
					bookingWayBillTxnArray[i].setWayBillId(wayBillInfoArray[i].getWayBillId());
					bookingWayBillTxnArray[i].setAmount(wayBillInfoArray[i].getBookingChargesSum());
					bookingWayBillTxnArray[i].setDiscountPercent(lrColl.get(wayBillInfoArray[i].getWayBillId()).getBookingDiscountPercentage() > 0);

					if(bookingWayBillTxnArray[i].isDiscountPercent())
						bookingWayBillTxnArray[i].setDiscount(wayBillInfoArray[i].getBookingDiscountPercentage());
					else
						bookingWayBillTxnArray[i].setDiscount(wayBillInfoArray[i].getBookingDiscount());

					bookingWayBillTxnArray[i].setGrandTotal(wayBillInfoArray[i].getBookingTotal());

					final var	wayBillObj	= new WayBill();
					wayBillObj.setWayBillId(wayBillInfoArray[i].getWayBillId());
					wayBillObj.setTxnTypeId(txnTypeHM.get(wayBillInfoArray[i].getWayBillId()));
					wayBillObj.setDiscount(wayBillInfoArray[i].getBookingDiscount());
					wayBillObj.setDeliveryDiscount(wayBillInfoArray[i].getDeliveryDiscount());
					wayBillObj.setGrandTotal(wayBillInfoArray[i].getGrandTotal());

					wayBillList.add(wayBillObj);

					if(delConColl != null && delConColl.size() > 0) {
						final var	delConDet 	= delConColl.get(wayBillInfoArray[i].getWayBillId());

						if(delConDet != null) {
							delConDet.setDeliverySumCharges(wayBillInfoArray[i].getDeliveryChargesSum());
							delConDet.setDeliveryTimeTax(wayBillInfoArray[i].getDeliveryTimeServiceTax());
							delConDet.setDeliveryDiscount(wayBillInfoArray[i].getDeliveryDiscount());
							delConDet.setDeliveryTotal(wayBillInfoArray[i].getDeliveryTotal());
							delConDet.setGrandTotal(wayBillInfoArray[i].getGrandTotal());

							crIdList.add(delConDet.getCrId());
							dcdHM.put(wayBillInfoArray[i].getWayBillId(), delConDet);
						}
					}
				}
			}

			if(crIdList != null && !crIdList.isEmpty()) {
				var	outValueObject         = DeliveryContactDetailsDao.getInstance().getDeliveryDetailsByCRIds(Utility.getStringFromArrayList(crIdList));

				if(crIdList != null && !crIdList.isEmpty()){
					final var	crTxnInObject = new ValueObject();
					crTxnInObject.put("crIdList", crIdList);
					crTxnInObject.put("dcdHM", dcdHM);
					crTxnInObject.put("wayBillHM", lrColl);

					outValueObject = crtxnBll.calculateCRAmount(crTxnInObject);

					if(outValueObject != null)
						crTxnArray = (CRTxn[])outValueObject.get("crTxnArray");
				}
				final var crTxnInObject = new ValueObject();
				crTxnInObject.put("crIdList", crIdList);
				crTxnInObject.put("dcdHM", dcdHM);
				crTxnInObject.put("wayBillHM", lrColl);

				outValueObject = crtxnBll.calculateCRAmount(crTxnInObject);

				if(outValueObject != null)
					crTxnArray = (CRTxn[])outValueObject.get("crTxnArray");
			}

			if(wayBillList != null && !wayBillList.isEmpty()){
				wayBillArr = new WayBill[wayBillList.size()];
				wayBillList.toArray(wayBillArr);
			}

			creditWayBillTxnClearanceArr = new CreditWayBillTxnClearance[creditWayBillTxnClearanceList.size()];
			creditWayBillTxnClearanceList.toArray(creditWayBillTxnClearanceArr);

			if(delConColl != null && delConColl.size() > 0)
				delConDetArray = delConColl.values().toArray(new DeliveryContactDetails[delConColl.size()]);

			valueInObject.put("CreditWayBillTxn", creditWayBillTxns);
			valueInObject.put("CreditWayBillTxnClearanceArr", creditWayBillTxnClearanceArr);
			valueInObject.put("wayBillInfoArray", wayBillInfoArray);
			valueInObject.put("bookingWayBillTxnArray", bookingWayBillTxnArray);
			valueInObject.put("creditWBIds", creditWBStr.toString());

			if(discountDetailsHM != null && discountDetailsHM.size() > 0)
				valueInObject.put("discountDetailsHM", discountDetailsHM);

			valueInObject.put("wayBillArr", wayBillArr);
			valueInObject.put("crTxnArray", crTxnArray);
			valueInObject.put("delConDetArray", delConDetArray);
			valueInObject.put(AliasNameConstants.EXECUTIVE, executive);
			valueInObject.put(CashStatementConfigurationDTO.CASH_STATEMENT_CONFIGURATION, cashStatementConfig);
			valueInObject.put(BankStatementConfigurationDTO.BANK_STATEMENT_CONFIGURATION, bankStatementConfig);
			valueInObject.put(LRCreditConfigurationConstant.LR_CREDIT_CONFIGURATION, lrCreditConfigConfiguration);
			valueInObject.put(AliasNameConstants.TDS_TXN_DETAILS_HM, tdsTxnDetailsHM);
			valueInObject.put(BankPayment.BANK_PAYMENT, bankPaymentHM);
			valueInObject.put("searchById", searchById);
			valueInObject.put("chequeBounceModelHM", chequeBounceModelHM);
			valueInObject.put("shortCreditConfigLimit", shortCreditConfigLimit);
			valueInObject.put("isAllowClaimEntry", isAllowClaimEntry);
			valueInObject.put("isAllowClubEntryForMultipleShortCreditPayment", isAllowClubEntryForMultipleShortCreditPayment);
			valueInObject.put("paymentType", JSPUtility.GetShort(request, "paryWisePaymentMode", (short) 0));

			if(allowOnAccountEntryOnSinglePaymentReceive && valueInObject.get("onAccountSequenceCounter") != null) {
				final var onAccount = createOnAccountDTO(valueInObject, executive);
				onAccount.setOnAccountNumber(Long.toString(((OnAccountSequenceCounter) valueInObject.get("onAccountSequenceCounter")).getNextVal()));
				valueInObject.put("onAccount", onAccount);
				partyWiseLedgerConfig.put(CashStatementPropertiesConstant.DATA_FOR_ON_ACCOUNT, "On Account");
			}

			valueInObject.put(PartyWiseLedgerAccountsDTO.PARTY_WISE_LEDGER_CONFIGURATION, partyWiseLedgerConfig);

			final var	moduleBLL		= new CreditPaymentModuleBLL();

			if(tokenWiseCheckingForDuplicateTransaction) {
				if(token == null || !token.equals(request.getSession().getAttribute(TokenGenerator.SHORT_CREDIT_PAYMENT_TOKEN_KEY))) {
					error.put("errorCode", CargoErrorList.RECEIVE_ERROR);
					error.put("errorDescription", "Request already submitted, please wait!");
					request.setAttribute("cargoError", error);
					request.setAttribute("nextPageToken", "failure");
					return;
				}

				request.getSession().setAttribute(TokenGenerator.SHORT_CREDIT_PAYMENT_TOKEN_KEY, null);
			}

			final var	valueOutObject	= moduleBLL.receiveCreditPaymentAmount(valueInObject);

			final var	creditWayBillTxnId		= valueOutObject.getLong("creditWayBillTxnId", 0);

			if (valueOutObject.getString(Constant.STATUS) != null && Constant.SUCCESS.equals(valueOutObject.get(Constant.STATUS).toString())) {
				final var successMessage = "Credit payment received successfully.";

				if(redirectTypeOfSelectionPage)
					response.sendRedirect("CreditPaymentModule.do?pageId=236&eventId=1&successMsgAfterBillClear=1&isMoneyReceiptRequired="+isMoneyReceiptRequired+"&isOnlySingleMoneyReceiptNumberRequired="+isOnlySingleMoneyReceiptNumberRequired+"&searchById="+searchById+"&creditWayBillTxnId="+creditWayBillTxnId+"&successMessage="+successMessage+"&creditWayBillTxnId="+ creditWayBillTxnId
							+"&typeOfSelection="+searchType);
				else
					response.sendRedirect("CreditPaymentModule.do?pageId=236&eventId=1&successMsgAfterBillClear=1&isMoneyReceiptRequired="+isMoneyReceiptRequired+"&isOnlySingleMoneyReceiptNumberRequired="+isOnlySingleMoneyReceiptNumberRequired+"&searchById="+searchById+"&creditWayBillTxnId="+creditWayBillTxnId+"&successMessage="+successMessage+"&creditWayBillTxnId="+ creditWayBillTxnId);
			} else {
				if (valueOutObject.getString(Constant.STATUS) != null && "paymentDone".equals(valueOutObject.get(Constant.STATUS).toString())) {
					error.put(CargoErrorList.ERROR_CODE, CargoErrorList.BILL_CLEARANCE_PAYMENT_DONE_ERROR);
					error.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.BILL_CLEARANCE_PAYMENT_DONE_ERROR_DESCRIPTION);
				} else if (valueOutObject.getString(Constant.STATUS) != null && "isLRFoundForCreditPayment".equals(valueOutObject.get(Constant.STATUS).toString())) {
					error.put(CargoErrorList.ERROR_CODE, CargoErrorList.SHORT_CREDIT_LR_NOT_FOUND_FOR_PAYMENT_ERROR);
					error.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.SHORT_CREDIT_LR_NOT_FOUND_FOR_PAYMENT_ERROR_DESCRIPTION);
				} else if (valueOutObject.getString(CargoErrorList.ERROR_DESCRIPTION) != null && valueOutObject.getInt(CargoErrorList.ERROR_CODE) > 0) {
					error.put(CargoErrorList.ERROR_CODE, valueOutObject.getInt(CargoErrorList.ERROR_CODE));
					error.put(CargoErrorList.ERROR_DESCRIPTION, valueOutObject.getString(CargoErrorList.ERROR_DESCRIPTION));
				} else {
					error.put(CargoErrorList.ERROR_CODE, CargoErrorList.CREDIT_WAYBILL_CLEARANCE_ERROR);
					error.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.CREDIT_WAYBILL_CLEARANCE_ERROR_DESCRIPTION);
				}

				request.setAttribute(CargoErrorList.CARGO_ERROR, error);
				request.setAttribute(ActionStaticUtil.NEXTPAGETOKEN, Constant.FAILURE);
			}
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}
	}

	private ChequeBounceModel createPartyWiseChequeBounceDto(final HttpServletRequest request,	final int indexForVal, final Executive executive) throws Exception{
		try {
			final var	chequeBounceModel	= new ChequeBounceModel();

			chequeBounceModel.setCorporateAccountId(JSPUtility.GetLong(request, "partyMasterIdNo_" + indexForVal, 0));
			chequeBounceModel.setAccountGroupId(executive.getAccountGroupId());
			chequeBounceModel.setBranchId(executive.getBranchId());
			chequeBounceModel.setIsAllowChequePayment(JSPUtility.GetShort(request, "isAllowChequePayment_" + indexForVal, (short) 0));

			return chequeBounceModel;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private CreditWayBillTxnCleranceSummary createDtoToSetCreditWayBillTxnCleranceSummary(final HttpServletRequest request, final Executive executive, final short searchById, final int indexForVal, final Timestamp createDate, final boolean isTDSAllow, final HashMap<Long, BankPayment> bankPayemntHM,final boolean isAllowClaimEntry, final short shortCreditPaymentType_0) throws Exception {
		BankPayment						bankPayment								= null;

		try {
			final var	sdf         					= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");

			final var	creditWayBillTxnClearanceSummary		= new CreditWayBillTxnCleranceSummary();

			creditWayBillTxnClearanceSummary.setAccountGroupId(executive.getAccountGroupId());
			creditWayBillTxnClearanceSummary.setWayBillId(JSPUtility.GetLong(request, "billId_" + indexForVal, 0));
			creditWayBillTxnClearanceSummary.setWayBillNumber(JSPUtility.GetString(request, "billNumber_" + indexForVal, ""));
			creditWayBillTxnClearanceSummary.setGrandTotal(JSPUtility.GetDouble(request, "grandTotal_" + indexForVal, 0.00));
			creditWayBillTxnClearanceSummary.setBranchId(JSPUtility.GetLong(request, "branchId_" + indexForVal,0));

			creditWayBillTxnClearanceSummary.setPaymentType(JSPUtility.GetShort(request, "hiddenPaymentMode_" + indexForVal, (short) 0));
			creditWayBillTxnClearanceSummary.setTxnTypeId(Short.parseShort(request.getParameter("txnTypeId_" + indexForVal)));
			creditWayBillTxnClearanceSummary.setBalanceAmount(JSPUtility.GetDouble(request, "balanceAmt_" + indexForVal, 0.00));

			if(creditWayBillTxnClearanceSummary.getBalanceAmount() <= 0)
				creditWayBillTxnClearanceSummary.setPaymentStatus(PaymentTypeConstant.PAYMENT_TYPE_STATUS_CLEAR_PAYMENT_ID);
			else
				creditWayBillTxnClearanceSummary.setPaymentStatus(JSPUtility.GetShort(request, "hiddenPaymentStatus_" + indexForVal, (short) 0));

			if(bankPaymentOperationRequired) {
				if(bankPayemntHM != null) {
					if(shortCreditPaymentType_0 > 0)
						bankPayment		= bankPayemntHM.get((long) 0);
					else
						bankPayment		= bankPayemntHM.get(creditWayBillTxnClearanceSummary.getWayBillId());

					if(bankPayment != null) {
						creditWayBillTxnClearanceSummary.setChequeDate(bankPayment.getChequeDate());
						creditWayBillTxnClearanceSummary.setBankName(bankPayment.getIssueBank());

						if(creditWayBillTxnClearanceSummary.getPaymentType() == PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID
								|| creditWayBillTxnClearanceSummary.getPaymentType() == PaymentTypeConstant.PAYMENT_TYPE_ONLINE_NEFT_ID
								|| creditWayBillTxnClearanceSummary.getPaymentType() == PaymentTypeConstant.PAYMENT_TYPE_ONLINE_RTGS_ID)
							creditWayBillTxnClearanceSummary.setChequeNumber(bankPayment.getChequeNumber());
						else if(creditWayBillTxnClearanceSummary.getPaymentType() == PaymentTypeConstant.PAYMENT_TYPE_CREDIT_CARD_ID
								|| creditWayBillTxnClearanceSummary.getPaymentType() == PaymentTypeConstant.PAYMENT_TYPE_DEBIT_CARD_ID)
							creditWayBillTxnClearanceSummary.setChequeNumber(bankPayment.getCardNo());
						else if(creditWayBillTxnClearanceSummary.getPaymentType() == PaymentTypeConstant.PAYMENT_TYPE_IMPS_ID
								|| creditWayBillTxnClearanceSummary.getPaymentType() == PaymentTypeConstant.PAYMENT_TYPE_PAYTM_ID
								|| creditWayBillTxnClearanceSummary.getPaymentType() == PaymentTypeConstant.PAYMENT_TYPE_UPI_ID
								|| creditWayBillTxnClearanceSummary.getPaymentType() == PaymentTypeConstant.PAYMENT_TYPE_PHONE_PAY_ID
								|| creditWayBillTxnClearanceSummary.getPaymentType() == PaymentTypeConstant.PAYMENT_TYPE_GOOGLE_PAY_ID
								|| creditWayBillTxnClearanceSummary.getPaymentType() == PaymentTypeConstant.PAYMENT_TYPE_WHATSAPP_PAY_ID)
							creditWayBillTxnClearanceSummary.setChequeNumber(bankPayment.getReferenceNumber());
					}
				}
			} else if(creditWayBillTxnClearanceSummary.getPaymentType() == PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID
					|| creditWayBillTxnClearanceSummary.getPaymentType() == PaymentTypeConstant.PAYMENT_TYPE_ONLINE_NEFT_ID
					|| creditWayBillTxnClearanceSummary.getPaymentType() == PaymentTypeConstant.PAYMENT_TYPE_ONLINE_RTGS_ID) {
				creditWayBillTxnClearanceSummary.setChequeDate(new Timestamp(sdf.parse(JSPUtility.GetString(request, "chequeDate_" + indexForVal) + " 00:00:00").getTime()));
				creditWayBillTxnClearanceSummary.setChequeNumber(JSPUtility.GetString(request, "chequeNumber_" + indexForVal, ""));
				creditWayBillTxnClearanceSummary.setBankName(JSPUtility.GetString(request, "bankName_" + indexForVal, "").toUpperCase());
			}

			creditWayBillTxnClearanceSummary.setReceivedDateTime(createDate);

			if(isTDSAllow)
				creditWayBillTxnClearanceSummary.setReceivedAmount(JSPUtility.GetDouble(request, "txnAmount_" + indexForVal, 0.00));
			else
				creditWayBillTxnClearanceSummary.setReceivedAmount(JSPUtility.GetDouble(request, "receiveAmt_" + indexForVal, 0.00));

			if(isAllowClaimEntry)
				creditWayBillTxnClearanceSummary.setClaimAmount(JSPUtility.GetDouble(request, "claimAmt_" + indexForVal, 0.00));

			creditWayBillTxnClearanceSummary.setReceivedByExecutiveId(executive.getExecutiveId());
			creditWayBillTxnClearanceSummary.setReceivedByBranchId(executive.getBranchId());
			creditWayBillTxnClearanceSummary.setRemark(JSPUtility.GetString(request, "remark_" + indexForVal, "").toUpperCase());
			creditWayBillTxnClearanceSummary.setCreditWayBillTxnId(JSPUtility.GetLong(request, "creditWayBillTxnId_" + indexForVal, 0));
			creditWayBillTxnClearanceSummary.setStatementNumber(JSPUtility.GetLong(request, "statementNo_" + indexForVal, 0));

			if(searchById == CreditPaymentTypeConstant.MULTIPLE_CREDIT_WAYBILL_TXN_CLEAR)
				creditWayBillTxnClearanceSummary.setClearanceTypeId(searchById);

			return creditWayBillTxnClearanceSummary;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private CreditWayBillTxnClearance createDtoToSetCreditWayBillTxnClearance(final HttpServletRequest request, final CreditWayBillTxnClearance creditWayBillTxnClearance, final CreditWayBillTxnCleranceSummary creditWayBillTxnCleranceSummary, final Executive executive, final int indexForVal, final Timestamp createDate, final short searchById, final ArrayList<CreditWayBillTxn> creditWBTxnList, final ArrayList<CreditWayBillTxnCleranceSummary> creditWayBillTxnClearanceSummaryList, final boolean isTDSAllow) throws Exception {
		var				receiveAmt		= 0.00;

		try {
			if(isTDSAllow)
				receiveAmt				= JSPUtility.GetDouble(request, "txnAmount_" + indexForVal, 0.00);
			else
				receiveAmt				= JSPUtility.GetDouble(request, "receiveAmt_" + indexForVal, 0.00);

			creditWayBillTxnClearance.setTotalReceivedAmount(creditWayBillTxnClearance.getTotalReceivedAmount() + receiveAmt);
			creditWayBillTxnClearance.setGrandTotal(creditWayBillTxnClearance.getGrandTotal() + JSPUtility.GetDouble(request, "grandTotal_" + indexForVal, 0.00));
			creditWayBillTxnClearance.setAccountgroupId(executive.getAccountGroupId());
			creditWayBillTxnClearance.setBranchId(creditWayBillTxnCleranceSummary.getBranchId());
			creditWayBillTxnClearance.setReceivedByBranchId(executive.getBranchId());
			creditWayBillTxnClearance.setReceivedByExecutiveId(executive.getExecutiveId());
			creditWayBillTxnClearance.setCreationDateTimeStamp(createDate);
			creditWayBillTxnClearance.setPaymentStatus(JSPUtility.GetShort(request, "hiddenPaymentStatus_" + indexForVal, (short) 0));
			creditWayBillTxnClearance.setPaymentMode(creditWayBillTxnCleranceSummary.getPaymentType());
			creditWayBillTxnClearance.setPartyMasterId(JSPUtility.GetLong(request, "partyMasterIdNo_" + indexForVal, 0));
			creditWayBillTxnClearance.setChequeDate(creditWayBillTxnCleranceSummary.getChequeDate());
			creditWayBillTxnClearance.setChequeNumber(creditWayBillTxnCleranceSummary.getChequeNumber());
			creditWayBillTxnClearance.setBankName(creditWayBillTxnCleranceSummary.getBankName());

			if(searchById == CreditPaymentTypeConstant.MULTIPLE_CREDIT_WAYBILL_TXN_CLEAR)
				creditWayBillTxnClearance.setRemark(JSPUtility.GetString(request, "remark_CreditClearanceTable^" + indexForVal, "").toUpperCase());
			else
				creditWayBillTxnClearance.setRemark(creditWayBillTxnCleranceSummary.getRemark());

			creditWayBillTxnClearance.setCreditWayBillTxnList(creditWBTxnList);
			creditWayBillTxnClearance.setCreditWayBillTxnCleranceSummaryList(creditWayBillTxnClearanceSummaryList);

			return creditWayBillTxnClearance;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private CreditWayBillTxn createDtoToSetCreditWayBillTxn(final HttpServletRequest request, final int indexForVal) throws Exception {
		try {
			final var		creditWayBillTxn = new CreditWayBillTxn();

			creditWayBillTxn.setWayBillId(JSPUtility.GetLong(request, "billId_" + indexForVal, 0));
			creditWayBillTxn.setBalanceAmount(JSPUtility.GetDouble(request, "balanceAmt_" + indexForVal, 0));

			if(creditWayBillTxn.getBalanceAmount() <= 0)
				creditWayBillTxn.setPaymentStatus(PaymentTypeConstant.PAYMENT_TYPE_STATUS_CLEAR_PAYMENT_ID);
			else
				creditWayBillTxn.setPaymentStatus(JSPUtility.GetShort(request, "hiddenPaymentStatus_" + indexForVal, (short) 0));

			creditWayBillTxn.setPaymentType(JSPUtility.GetShort(request, "hiddenPaymentMode_" + indexForVal, (short) 0));
			creditWayBillTxn.setTxnTypeId(Short.parseShort(request.getParameter("txnTypeId_" + indexForVal)));
			creditWayBillTxn.setCreditWayBillTxnId(JSPUtility.GetLong(request, "creditWayBillTxnId_" + indexForVal, 0));

			return creditWayBillTxn;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private DiscountDetails createDtoToSetDiscountDetails(final HttpServletRequest request, final CreditWayBillTxn creditWayBillTxn, final Executive executive, final int indexForVal, final Timestamp createDate) throws Exception {
		try {
			final var	discountDetails = new DiscountDetails();
			discountDetails.setWaybillId(creditWayBillTxn.getWayBillId());

			if(creditWayBillTxn.getTxnTypeId() == CreditWayBillTxn.TXN_TYPE_BOOKING_ID)
				discountDetails.setDiscountType(DiscountDetails.DISCOUNT_TYPE_BOOKING);
			else
				discountDetails.setDiscountType(DiscountDetails.DISCOUNT_TYPE_DELIVERY);

			discountDetails.setDiscountMasterId(JSPUtility.GetInt(request, "discountTypes_" + indexForVal));
			discountDetails.setAmount(JSPUtility.GetDouble(request, "balanceAmt_" + indexForVal));
			discountDetails.setStatus(true);

			discountDetails.setAccountGroupId(executive.getAccountGroupId());
			discountDetails.setBranchId(executive.getBranchId());
			discountDetails.setDiscountDateTime(createDate);
			discountDetails.setExecutiveId(executive.getExecutiveId());

			return discountDetails;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	@SuppressWarnings("unchecked")
	public OnAccount createOnAccountDTO(final ValueObject valueInObject, final Executive executive) throws Exception {
		try {
			final var	onAccount = new OnAccount();
			final var	bankPaymentHM	= (HashMap<Long, BankPayment>) valueInObject.get(BankPayment.BANK_PAYMENT);

			onAccount.setAccountGroupId(executive.getAccountGroupId());
			onAccount.setBranchId(executive.getBranchId());
			onAccount.setExecutiveId(executive.getExecutiveId());
			onAccount.setPartyMasterId(valueInObject.getLong(Constant.CORPORATE_ACCOUNT_ID, 0));
			onAccount.setPartyName(valueInObject.getString(Constant.PARTY_NAME, ""));
			onAccount.setCreationDateTime(DateTimeUtility.appendTimeToDate(valueInObject.getString(Constant.CREATEDATE)));
			onAccount.setSystemDateTime(DateTimeUtility.getCurrentTimeStamp());
			onAccount.setTotalAmount(valueInObject.getDouble("receivePartyAmt", 0));
			onAccount.setBalanceAmount(onAccount.getTotalAmount());
			onAccount.setRemark(valueInObject.getString(Constant.REMARK, null));
			onAccount.setPaymentType(valueInObject.getShort("paymentType", (short)0));

			if(bankPaymentHM != null) {
				final var bankPayment = bankPaymentHM.get((long)0);

				if (bankPayment != null) {
					if (bankPayment.getChequeNumber() != null)
						onAccount.setChequeNumber(bankPayment.getChequeNumber());
					else
						onAccount.setChequeNumber(bankPayment.getCardNo());

					onAccount.setChequeDate(bankPayment.getChequeDate());
					onAccount.setBankName(bankPayment.getIssueBank());
					onAccount.setBankAccountId(bankPayment.getBankAccountId());
				}
			}

			onAccount.setTxnTypeId(OnAccount.TXN_TYPE_INSERT);
			onAccount.setStatus(OnAccount.ON_ACCOUNT_BILL_CREATE);

			return onAccount;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private ManualTransaction createManualTransactionDto(final CreditWayBillTxnCleranceSummary creditWayBillTxnCleranceSummary, final Timestamp systemDate) throws Exception {
		try {
			final var	manualTransaction = new ManualTransaction();

			manualTransaction.setAccountGroupId(creditWayBillTxnCleranceSummary.getAccountGroupId());
			manualTransaction.setNumber(creditWayBillTxnCleranceSummary.getWayBillNumber());
			manualTransaction.setExecutiveId(creditWayBillTxnCleranceSummary.getReceivedByExecutiveId());
			manualTransaction.setBranchId(creditWayBillTxnCleranceSummary.getReceivedByBranchId());
			manualTransaction.setCreationDateTime(creditWayBillTxnCleranceSummary.getReceivedDateTime());
			manualTransaction.setActualDateTime(systemDate);

			manualTransaction.setCreditAmount(creditWayBillTxnCleranceSummary.getReceivedAmount());
			manualTransaction.setPaymentTypeId(creditWayBillTxnCleranceSummary.getPaymentType());
			manualTransaction.setManualTypeId(ManualTransaction.SHORT_CREDIT_CLERANCE);

			if(PaymentTypeConstant.getBankPaymentList().contains(creditWayBillTxnCleranceSummary.getPaymentType())) {
				manualTransaction.setChequeNumber(creditWayBillTxnCleranceSummary.getChequeNumber());
				manualTransaction.setBankName(creditWayBillTxnCleranceSummary.getBankName());
				manualTransaction.setChequeDate(creditWayBillTxnCleranceSummary.getChequeDate());
			} else {
				manualTransaction.setChequeNumber(null);
				manualTransaction.setBankName(null);
				manualTransaction.setChequeDate(null);
			}

			manualTransaction.setRemark(creditWayBillTxnCleranceSummary.getRemark());

			return manualTransaction;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}
}