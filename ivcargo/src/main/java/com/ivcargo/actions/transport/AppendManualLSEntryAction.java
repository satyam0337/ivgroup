package com.ivcargo.actions.transport;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.ObjectUtils;
import org.apache.commons.lang3.StringUtils;

import com.businesslogic.TaxCalculationBLL;
import com.businesslogic.WayBillBll;
import com.businesslogic.modelcreator.CreateConsignmentDetailsDTO;
import com.businesslogic.modelcreator.CreateConsignmentSummaryDTO;
import com.businesslogic.modelcreator.CreateCreditWayBillPaymentModuleDTO;
import com.businesslogic.modelcreator.CreateCreditWayBillTxnDTO;
import com.businesslogic.modelcreator.CreateCustomerDetailsDTO;
import com.businesslogic.modelcreator.CreateDirectDeliveryDirectVasuliDTO;
import com.businesslogic.modelcreator.CreateDispatchArticleDetailsDTO;
import com.businesslogic.modelcreator.CreateDispatchSummaryDTO;
import com.businesslogic.modelcreator.CreateManualTransactionDTO;
import com.businesslogic.modelcreator.CreateWayBillBookingChargeDTO;
import com.businesslogic.modelcreator.CreateWayBillChargeAmountDTO;
import com.businesslogic.modelcreator.CreateWayBillCrossingPaymentModuleDTO;
import com.businesslogic.modelcreator.CreateWayBillDTO;
import com.businesslogic.modelcreator.CreateWayBillHistoryDTO;
import com.businesslogic.modelcreator.CreateWayBillInfoDTO;
import com.businesslogic.properties.GeneralConfiguration;
import com.businesslogic.utils.ActionConstants;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.constant.properties.dispatch.ManualLSConfigurationConstant;
import com.iv.dto.WayBillTaxTxn;
import com.iv.dto.constant.BillSelectionConstant;
import com.iv.dto.constant.BookingModeConstant;
import com.iv.dto.constant.BookingTypeConstant;
import com.iv.dto.constant.CargoAccountGroupConstant;
import com.iv.dto.constant.ChargeTypeConstant;
import com.iv.dto.constant.InfoForDeliveryConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.dto.constant.PaymentTypeConstant;
import com.iv.dto.constant.WayBillStatusConstant;
import com.iv.utils.constant.Constant;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.exception.ExceptionProcess;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.CorporateAccountDao;
import com.platform.dao.DispatchLedgerDao;
import com.platform.dao.DuplicateTransactionCheckDao;
import com.platform.dto.Branch;
import com.platform.dto.ConfigParam;
import com.platform.dto.ConsignmentDetails;
import com.platform.dto.ConsignmentSummary;
import com.platform.dto.CorporateAccount;
import com.platform.dto.CustomerDetails;
import com.platform.dto.DirectDeliveryDirectVasuli;
import com.platform.dto.DispatchArticleDetails;
import com.platform.dto.DispatchLedger;
import com.platform.dto.DispatchSummary;
import com.platform.dto.Executive;
import com.platform.dto.ManualTransaction;
import com.platform.dto.WayBill;
import com.platform.dto.WayBillBookingCharges;
import com.platform.dto.WayBillChargeAmount;
import com.platform.dto.WayBillCrossing;
import com.platform.dto.WayBillHistory;
import com.platform.dto.WayBillInfo;
import com.platform.dto.WayBillType;
import com.platform.dto.configuration.modules.CashStatementConfigurationDTO;
import com.platform.dto.configuration.modules.DashBoardConfigurationDTO;
import com.platform.dto.configuration.modules.GroupConfigurationPropertiesDTO;
import com.platform.dto.configuration.modules.LrCostConfigurationDTO;
import com.platform.dto.constant.BookingChargeConstant;
import com.platform.dto.constant.PODRequiredConstant;
import com.platform.dto.constant.TaxPaidByConstant;
import com.platform.dto.constant.TransCargoAccountGroupConstant;
import com.platform.dto.constant.WayBillTypeConstant;
import com.platform.dto.model.ChargeTypeModel;
import com.platform.dto.model.CreditWayBillPaymentModule;
import com.platform.dto.model.CreditWayBillTxn;
import com.platform.dto.model.TaxModel;
import com.platform.dto.model.WayBillModel;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

public class AppendManualLSEntryAction implements Action{

	public static final String TRACE_ID = "AppendManualLSEntryAction";

	Executive			executive	= null;
	CacheManip			cache		= null;
	Timestamp			createDate	= null;
	CorporateAccount	corporateAccount		= null;
	ValueObject			calenderValueObject	= null;
	Branch				wbSourceBranch			= null;
	Branch				wbDestBranch			= null;
	long				crossingAgentId		= 0;
	boolean				isWayBillGrandTotalRoundOffAllow	= false;

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {

		HashMap<String,Object>		error 								= null;
		DispatchLedger 				dispatchLedger						= null;
		WayBill						wayBill								= null;
		ManualTransaction[]			manualTransactionArr 				= null;
		var							actWghtOfSingleLR					= 0.00;
		var							quantityOfSingleLR					= 0L;
		var							uniqueId							= 0L;
		DispatchLedger				dispatchLedger2						= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error))
				return;

			executive = (Executive)request.getSession().getAttribute("executive");

			if(executive != null) {
				final var	now = Calendar.getInstance();
				calenderValueObject		= Utility.getCalanderInstance();
				final var totalNoOfWayBills 	= JSPUtility.GetInt(request, "totalLRCount");
				createDate 				= new Timestamp(now.getTimeInMillis());
				cache 					= new CacheManip(request);
				var isDuplicateLR 	= false;
				var	dispatchLedgerId		= Long.parseLong(request.getParameter("dispatchLedgerId"));

				if(dispatchLedgerId > 0)
					dispatchLedger = DispatchLedgerDao.getInstance().retriveValueForReceivedLedger(dispatchLedgerId);

				if(dispatchLedger!=null)
					dispatchLedger2 = dispatchLedger.clone();

				if(cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_WAYBILL_GRAND_TOTAL_ROUNDOFF) == ConfigParam.CONFIG_KEY_WAYBILL_GRAND_TOTAL_ROUNDOFF_ALLOWED)
					isWayBillGrandTotalRoundOffAllow = true;

				final var	generalConfiguration    = cache.getGeneralConfiguration(request, executive.getAccountGroupId());
				final var	lrCostConfiguration     = cache.getGroupWiseLRCostConfiguration(request, executive.getAccountGroupId());
				final var	groupConfig				= cache.getGroupConfiguration(request, executive.getAccountGroupId());

				final var	wayBillModelArr = new ArrayList<WayBillModel>();
				final var	wayBillNumbers 	= new ArrayList<String>();

				final var	wayBillHM			 		= new HashMap<Long, WayBill>();
				final var	consignorHM					= new HashMap<Long, CustomerDetails>();
				final var	consigneeHM					= new HashMap<Long, CustomerDetails>();
				final var	wayBillChargesHM	 		= new HashMap<Long, WayBillBookingCharges[]>();
				final var	wayBillTaxTxnHM		 		= new HashMap<Long, WayBillTaxTxn[]>();
				final var	consignmentDetailsHM 		= new HashMap<Long, ConsignmentDetails[]>();
				final var	consignmentSummaryHM 		= new HashMap<Long, ConsignmentSummary>();
				final var	billPaymentModuleHM	 		= new HashMap<Long, CreditWayBillPaymentModule>();
				final var	creditWayBillTxnHM	 		= new HashMap<Long, CreditWayBillTxn>();
				final var 	dispatchSummaryHM	 		= new HashMap<Long, DispatchSummary>();
				final var	wayBillHistoryHM	 		= new HashMap<Long, WayBillHistory>();
				final var	manualTransactionArrHM		= new HashMap<Long, ManualTransaction[]>();
				final var	wayBillChargeAmountArrHM	= new HashMap<Long, WayBillChargeAmount[]>();
				final var	directDeliveryDirectVasuliHM = new HashMap<Long, DirectDeliveryDirectVasuli>();
				final var	wayBillInfoHM				 = new HashMap<Long, WayBillInfo>();
				final var	dispatchArticleDetailsHM	 = new HashMap<Long, DispatchArticleDetails[]>();
				final var	createWayBillChargeAmountDTO = new CreateWayBillChargeAmountDTO();
				final var	createManualTransactionDTO	 = new CreateManualTransactionDTO();
				final var	createCreditWayBillTxnDTO	 = new CreateCreditWayBillTxnDTO();
				final var	createCreditWayBillPaymentModuleDTO = new CreateCreditWayBillPaymentModuleDTO();
				final var	createConsignmentSummaryDTO			= new CreateConsignmentSummaryDTO();
				final var	createWayBillDTO					= new CreateWayBillDTO();
				final var	createCustomerDetailsDTO			= new CreateCustomerDetailsDTO();
				final var	createWayBillBookingChargeDTO		= new CreateWayBillBookingChargeDTO();
				final var	createDispatchSummaryDTO			= new CreateDispatchSummaryDTO();
				final var	createWayBillHistoryDTO				= new CreateWayBillHistoryDTO();
				final var	createConsignmentDetailsDTO			= new CreateConsignmentDetailsDTO();
				final var	createDirectDeliveryDirectVasuliDTO	= new CreateDirectDeliveryDirectVasuliDTO();
				final var	createWayBillInfoDTO				= new CreateWayBillInfoDTO();
				final var	inValueObject				 		= new ValueObject();
				final var	createDispatchArticleDetailsDTO		= new CreateDispatchArticleDetailsDTO();
				final var	dispatchArticleValObj				= new ValueObject();
				final var	wayBillCrossingAgentModuleHM		= new HashMap<Long, WayBillCrossing>();
				final var	createWayBillCrossingPaymentModuleDTO = new CreateWayBillCrossingPaymentModuleDTO();
				final var	manualTransactionList 				= new ArrayList<ManualTransaction>();

				final var	manualLSconfigHM					= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.MANUAL_LS);
				final var	showBillSelection 					= (boolean) manualLSconfigHM.getOrDefault(ManualLSConfigurationConstant.SHOW_BILL_SELECTION, false);
				final var	appendCrossingLRInManualLS 			= (boolean) manualLSconfigHM.getOrDefault(ManualLSConfigurationConstant.APPEND_CROSSING_LR_IN_MANUAL_LS, false);

				if(appendCrossingLRInManualLS)
					crossingAgentId			= JSPUtility.GetLong(request, Constant.CROSSING_AGENT_ID,0);

				inValueObject.put("executive", executive);

				dispatchArticleValObj.put("executive", executive);
				dispatchArticleValObj.put("tripDateTime", dispatchLedger.getTripDateTime());
				dispatchArticleValObj.put("branchId", dispatchLedger.getLsBranch());

				//Create Way Bill model Array
				for (var i=1; i <= totalNoOfWayBills; i++ ){
					wayBill			= createWayBillDto(request, i, createWayBillDTO);

					if(wayBillNumbers.contains(wayBill.getWayBillNumber())) {
						//Way bill Already Exist Error
						error.put("errorCode", CargoErrorList.DUPLICATE_WAYBILL);
						error.put("errorDescription",CargoErrorList.DUPLICATE_WAYBILL_DESCRIPTION);
						request.setAttribute("cargoError", error);
						request.setAttribute("nextPageToken", "failure");
						return;
					}

					wayBillNumbers.add(wayBill.getWayBillNumber());

					calenderValueObject.put("dateStr", request.getParameter("LRDate_"+i));
					final var	diff = Utility.getDayDiffBetweenTwoDates(wayBill.getCreationDateTimeStamp(), createDate);

					if(crossingAgentId <= 0)
						// Manual LR Duplicate Check Also on Actual Booking Date Time
						isDuplicateLR = DuplicateTransactionCheckDao.getInstance().checkDuplicateTxnForFinancialYearForAutoGeneratedLR(wayBill.getWayBillNumber(), wayBill.getSourceBranchId(), executive.getAccountGroupId(), (short)10,wayBill.getActualBookingDateTime());

					if(isDuplicateLR) {
						//Way bill Already Exist Error
						error.put("errorCode", CargoErrorList.DUPLICATE_WAYBILL);
						error.put("errorDescription",CargoErrorList.DUPLICATE_WAYBILL_DESCRIPTION+" "+wayBill.getWayBillNumber());
						request.setAttribute("cargoError", error);
						request.setAttribute("nextPageToken", "failure");
						return;
					}
					uniqueId++;

					wbSourceBranch  = cache.getGenericBranchDetailCache(request, JSPUtility.GetLong(request, "LRSourceBranchId_" + i));
					wbDestBranch    = cache.getGenericBranchDetailCache(request, JSPUtility.GetLong(request, "LRDestinationBranchId_" + i));

					final var	consignmentDetails = createConsignmentsdto(request,wayBill,i, createConsignmentDetailsDTO);
					consignmentDetailsHM.put(uniqueId, consignmentDetails);

					final var consignorId = JSPUtility.GetLong(request,"consignorId_"+i,0);

					if(consignorId > 0)
						corporateAccount = CorporateAccountDao.getInstance().findByPartyIdForMaster(consignorId);

					final var	consignorDetails = createConsignorDto(request, wayBill, corporateAccount, i, createCustomerDetailsDTO);
					consignorDetails.setType(CustomerDetails.CUSTOMER_TYPE_CONSIGNOR_ID);
					consignorHM.put(uniqueId, consignorDetails);

					final var	consigneeDetails = createConsigneeDto(request, wayBill, i, createCustomerDetailsDTO);
					consigneeDetails.setType(CustomerDetails.CUSTOMER_TYPE_CONSIGNEE_ID);
					consigneeHM.put(uniqueId, consigneeDetails);

					final var	wayBillCharges = createManualChargesDto(request, wayBill, i, createWayBillBookingChargeDTO);
					wayBillChargesHM.put(uniqueId, wayBillCharges);

					final var	consignmentSummary = createConsignmentSummaryDto(request, wayBill, corporateAccount, i, createConsignmentSummaryDTO, crossingAgentId);
					quantityOfSingleLR	= consignmentSummary.getQuantity();
					actWghtOfSingleLR	= consignmentSummary.getActualWeight();

					if(showBillSelection)
						consignmentSummary.setBillSelectionId(BillSelectionConstant.BOOKING_WITH_BILL);

					//Tax Logic
					final var	valInForTax 	= new ValueObject();

					valInForTax.put(TaxModel.TAX_MODEL_ARR, cache.getTaxes(request, executive));
					valInForTax.put("discountedAmount",0);
					valInForTax.put("taxBy",consignmentSummary.getTaxBy());
					valInForTax.put(Constant.BILL_SELECTION_ID, consignmentSummary.getBillSelectionId());
					valInForTax.put("accountGroupId",executive.getAccountGroupId());
					valInForTax.put("charges",cache.getActiveBookingCharges(request, executive.getBranchId()));
					valInForTax.put("sourceBranch", wbSourceBranch);
					valInForTax.put("destinationBranch", wbDestBranch);
					valInForTax.put(CustomerDetails.CONSIGNOR_DETAILS, consignorDetails);
					valInForTax.put(CustomerDetails.CONSIGNEE_DETAILS, consigneeDetails);
					valInForTax.put(GroupConfigurationPropertiesDTO.GROUP_CONFIGURATION, groupConfig);
					valInForTax.put("wayBillTypeId", wayBill.getWayBillTypeId());
					valInForTax.put(Executive.EXECUTIVE, executive);

					final var	valOutForTax 	= TaxCalculationBLL.getInstance().calculateServiceTaxDetails(valInForTax);

					final var	wayBillTaxTxn 	= (WayBillTaxTxn[])valOutForTax.get("wayBillTaxTxn");
					final Double	taxes 	= Double.parseDouble(valOutForTax.get("taxes").toString());
					wayBill.setGrandTotal(wayBill.getGrandTotal()+ taxes);
					final Double taxFreeChargeAmt = Double.parseDouble(valOutForTax.get("taxFreeCharges").toString());

					if(ObjectUtils.isNotEmpty(wayBillTaxTxn))
						wayBillTaxTxnHM.put(uniqueId, wayBillTaxTxn);

					//if no ST applicable then set TaxBy id to 0
					if(ObjectUtils.isEmpty(wayBillTaxTxn))
						consignmentSummary.setTaxBy((short)0);

					consignmentSummaryHM.put(uniqueId, consignmentSummary);

					wayBill.setCreditorId(0);
					wayBill.setBookedForAccountGroupId(executive.getAccountGroupId());
					wayBill.setDeliveryPlace(consignmentSummary.getDeliveryPlace());
					wayBill.setDeliveryPlaceId(consignmentSummary.getDeliveryPlaceId());

					inValueObject.put("wayBill", wayBill);

					final var	wayBillInfo = createWayBillInfodto(request,taxes,createWayBillInfoDTO, i);

					wbSourceBranch  = cache.getGenericBranchDetailCache(request, wayBillInfo.getSourceBranchId());
					wbDestBranch    = cache.getGenericBranchDetailCache(request, wayBillInfo.getDestinationBranchId());

					inValueObject.put("wayBillInfo", wayBillInfo);
					inValueObject.put("wbSourceBranch", wbSourceBranch);
					inValueObject.put("wbDestBranch", wbDestBranch);
					inValueObject.put("wayBillCharges", wayBillCharges);
					inValueObject.put("branchId", wayBill.getBranchId());
					inValueObject.put("bookingDateTime", wayBillInfo.getBookingDateTime());
					inValueObject.put("generalConfiguration", generalConfiguration);

					final var	wayBillChargeAmountReturnList   = createWayBillChargeAmountDTO.getWayBillChargeAmountDTO(inValueObject);

					if(wayBillChargeAmountReturnList!=null && !wayBillChargeAmountReturnList.isEmpty()){
						final var	wayBillChargeAmountList = new ArrayList<WayBillChargeAmount>();

						for (final WayBillChargeAmount wayBillChargeAmt : wayBillChargeAmountReturnList)
							if (wayBillChargeAmt != null) {
								wayBillChargeAmountList.add(wayBillChargeAmt);

								if (diff > 0) {
									inValueObject.put("wayBillChargeAmount", wayBillChargeAmt);
									manualTransactionList.add(createManualTransactionDTO.getManualTransactionDTO(inValueObject));
								}
							}

						final var	wayBillChargeAmountArr = new WayBillChargeAmount[wayBillChargeAmountList.size()];
						wayBillChargeAmountList.toArray(wayBillChargeAmountArr);

						wayBillChargeAmountArrHM.put(uniqueId, wayBillChargeAmountArr);

					}
					//***************************************** Credit WayBill Payment Module DTO ***********************************************
					if(cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_CREDITOR_PAYMENT_MODULE) == ConfigParam.CONFIG_KEY_CREDITOR_PAYMENT_MODULE_YES
							&& wayBill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT) {
						inValueObject.put("billingPartyId", consignorDetails.getBillingPartyId());
						inValueObject.put("taxBy", consignmentSummary.getTaxBy());
						inValueObject.put("taxes", taxes);
						inValueObject.put("taxFreeChargeAmt", taxFreeChargeAmt);
						inValueObject.put("wayBillChargeAmountArrHM", wayBillChargeAmountArrHM);
						inValueObject.put("uniqueId", uniqueId);
						billPaymentModuleHM.put(uniqueId, createCreditWayBillPaymentModuleDTO.getCreditWayBillPaymentModuleDTO(inValueObject));
					}
					//***************************************** Credit WayBill Payment Module DTO ***********************************************

					//set CreditWayBillTxn Object
					if(consignmentSummary.getPaymentType() == PaymentTypeConstant.PAYMENT_TYPE_CREDIT_ID) {
						inValueObject.put("corporateAccountId", consignorDetails.getCorporateAccountId());
						creditWayBillTxnHM.put(uniqueId, createCreditWayBillTxnDTO.getCreditWayBillTxnDTO(inValueObject));
					}

					dispatchSummaryHM.put(uniqueId, createDispatchSummaryDTO(dispatchLedger, wayBill, createDispatchSummaryDTO, consignmentSummary));
					wayBillHistoryHM.put(uniqueId, createWayBillHistoryDTO(wayBill, createWayBillHistoryDTO));

					inValueObject.put("conSummary", consignmentSummary);

					if(diff > 0 && wayBill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID)
						manualTransactionList.add(createManualTransactionDTO.getManualTransactionDTO(inValueObject));

					wayBill.setCreationDateTimeStamp(dispatchLedger.getTripDateTime());
					wayBillHM.put(uniqueId, wayBill);

					if(crossingAgentId > 0){
						inValueObject.put("crossingAgentId", crossingAgentId);
						inValueObject.put("crossingHire", JSPUtility.GetDouble(request, "crossingHire_"+i,0.00));
						wayBillCrossingAgentModuleHM.put(uniqueId, createWayBillCrossingPaymentModuleDTO.getWayBillCrossingPaymentModuleDTO(inValueObject));
					}

					if(manualTransactionList != null && !manualTransactionList.isEmpty()){
						manualTransactionArr = new ManualTransaction[manualTransactionList.size()];
						manualTransactionList.toArray(manualTransactionArr);
						manualTransactionArrHM.put(uniqueId, manualTransactionArr);
					}

					inValueObject.put("grandTotal", wayBillInfo.getGrandTotal());

					if(consignmentSummary.getDeliveryTo() == InfoForDeliveryConstant.DIRECT_DELIVERY_DIRECT_VASULI_ID)
						directDeliveryDirectVasuliHM.put(uniqueId, createDirectDeliveryDirectVasuliDTO.getDirectDeliveryDirectVasuliDTODTO(inValueObject));

					wayBillInfoHM.put(uniqueId, wayBillInfo);

					dispatchArticleValObj.put("consignmentDetails", consignmentDetails);
					dispatchArticleValObj.put("branchId", dispatchLedger.getLsBranchId());

					dispatchArticleDetailsHM.put(uniqueId, createDispatchArticleDetailsDTO.getDispatchArticldto(dispatchArticleValObj));
				}

				//logic for update values in DispatchLedger  note: it runs only for single LR dont use it for multiple LR
				dispatchLedger.setTotalActualWeight(dispatchLedger.getTotalActualWeight() + actWghtOfSingleLR);
				dispatchLedger.setTotalNoOfPackages(dispatchLedger.getTotalNoOfPackages() + Integer.parseInt(Long.toString(quantityOfSingleLR)));
				dispatchLedger.setTotalNoOfWayBills(dispatchLedger.getTotalNoOfWayBills() + 1);
				dispatchLedger.setTransactionExecutiveId(executive.getExecutiveId());
				dispatchLedger.setDispatchExecutiveId(executive.getExecutiveId());

				if(dispatchLedger.getDestinationBranchId() == wayBill.getDestinationBranchId()) {
					if(wayBill.getDeliveryTypeId() == InfoForDeliveryConstant.DELIVERY_TO_DOOR_ID) {
						dispatchLedger.setTotalNoOfDoorDelivery(dispatchLedger.getTotalNoOfDoorDelivery() + 1);
						dispatchLedger.setTotalNoOfDoorDeliveryArticles(dispatchLedger.getTotalNoOfDoorDeliveryArticles() + Integer.parseInt(Long.toString(quantityOfSingleLR)));
					} else if(wayBill.getDeliveryTypeId() == InfoForDeliveryConstant.DELIVERY_TO_BRANCH_ID)
						dispatchLedger.setTotalNoOfGodownArticles(dispatchLedger.getTotalNoOfGodownArticles() + Integer.parseInt(Long.toString(quantityOfSingleLR)));
				} else
					dispatchLedger.setTotalNoOfCrossingArticles(dispatchLedger.getTotalNoOfCrossingArticles() + Integer.parseInt(Long.toString(quantityOfSingleLR)));

				dispatchLedger.setTotalNoOfForms(dispatchLedger.getTotalNoOfForms() + 1);

				final var	inValObj = new ValueObject();
				inValObj.put("wayBillModelArr", wayBillModelArr);
				inValObj.put("dispatchLedger", dispatchLedger);
				inValObj.put("wayBillHM",wayBillHM );
				inValObj.put("consignorHM",consignorHM);
				inValObj.put("consigneeHM",consigneeHM);
				inValObj.put("wayBillChargesHM", wayBillChargesHM );
				inValObj.put("wayBillTaxTxnHM", wayBillTaxTxnHM );
				inValObj.put("consignmentDetailsHM",consignmentDetailsHM);
				inValObj.put("consignmentSummaryHM",consignmentSummaryHM);
				inValObj.put("billPaymentModuleHM", billPaymentModuleHM );
				inValObj.put("creditWayBillTxnHM", creditWayBillTxnHM );
				inValObj.put("dispatchSummaryHM", dispatchSummaryHM );
				inValObj.put("wayBillHistoryHM", wayBillHistoryHM );
				inValObj.put("manualTransactionArrHM",manualTransactionArrHM);
				inValObj.put("wayBillChargeAmountArrHM",wayBillChargeAmountArrHM);
				inValObj.put("directDeliveryDirectVasuliHM",directDeliveryDirectVasuliHM);
				inValObj.put("wayBillInfoHM",wayBillInfoHM);
				inValObj.put("isManual", true);
				inValObj.put("executive", executive);
				inValObj.put("allBranchesColl", cache.getGenericBranchesDetail(request));
				inValObj.put("locationMapping", cache.getLocationMappingDetailsByAssignedLocationId(request,executive.getAccountGroupId(), dispatchLedger.getDestinationBranchId()));
				inValObj.put("dispatchArticleDetailsHM", dispatchArticleDetailsHM);
				inValObj.put("crossingAgentId", crossingAgentId);
				inValObj.put("wayBillCrossingAgentModuleHM", wayBillCrossingAgentModuleHM);
				inValObj.put(LrCostConfigurationDTO.LR_COST_CONFIGURATION, lrCostConfiguration);
				inValObj.put(GroupConfigurationPropertiesDTO.GROUP_CONFIGURATION, groupConfig);

				inValObj.put("accountGroupTieUpConfigurationHM", cache.getAccountGroupTieUpConfiguration(request, executive.getAccountGroupId()));

				inValObj.put("dispatchLedger2", dispatchLedger2);
				inValObj.put(GeneralConfiguration.GENERAL_CONFIGURATION, cache.getGeneralConfiguration(request, executive.getAccountGroupId()));
				inValObj.put(DashBoardConfigurationDTO.DASH_BOARD_CONFIGURATION, cache.getDashBoardConfiguration(request, executive.getAccountGroupId()));
				inValObj.put(CashStatementConfigurationDTO.CASH_STATEMENT_CONFIGURATION, cache.getCashStatementConfiguration(request, executive.getAccountGroupId()));
				inValObj.put(GeneralConfiguration.ALLOW_PENDING_AGENT_COMMISSION_BILLING_STOCK_ENTRY,generalConfiguration.getBoolean(GeneralConfiguration.ALLOW_PENDING_AGENT_COMMISSION_BILLING_STOCK_ENTRY,false));
				inValObj.put(GeneralConfiguration.WAY_BILL_TYPES_ALLOWED_FOR_AGENT_COMMISSION_BILLING_STOCK_ENTRY, generalConfiguration.getString(GeneralConfiguration.WAY_BILL_TYPES_ALLOWED_FOR_AGENT_COMMISSION_BILLING_STOCK_ENTRY,"0"));

				final var	wayBillBll			= new WayBillBll();
				final var	outValObj			= wayBillBll.generateAndDispatchWayBills(inValObj);
				dispatchLedgerId 	= (Long) outValObj.get("dispatchLedgerId");
				final var	wbNumForAppend		= outValObj.get("WBNumForAppend").toString();

				response.sendRedirect("AppendManualLSEntry.do?pageId=266&eventId=3&generatedLSNumber="+dispatchLedger.getLsNumber()+"&WBNumForAppend="+wbNumForAppend);

			}
		} catch (final Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		}
	}

	private WayBill createWayBillDto(final HttpServletRequest request, final int i, final CreateWayBillDTO   createWayBillDTO) throws Exception {
		try {
			final var	inValueObject = new ValueObject();
			inValueObject.put("executive", executive);
			inValueObject.put("wayBillNumber", JSPUtility.GetString(request, "LRNumber_"+i));
			calenderValueObject.put("dateStr", request.getParameter("LRDate_"+i));
			inValueObject.put("date", Utility.getDateTimeFromString(calenderValueObject));
			inValueObject.put("createDate", createDate);
			inValueObject.put("sourceBranchId", JSPUtility.GetLong(request, "LRSourceBranchId_"+i));
			inValueObject.put("destinationBranchId", JSPUtility.GetLong(request, "LRDestinationBranchId_"+i));
			inValueObject.put("wayBillTypeId", JSPUtility.GetLong(request, "LRType_"+i));
			inValueObject.put("wbCreationCategory", ActionConstants.TRANSPORT_MANUAL);
			inValueObject.put("amount", JSPUtility.GetDouble(request, "amount_"+i));
			inValueObject.put("discountedAmount",JSPUtility.GetDouble(request, "amount_"+i));
			inValueObject.put("wbCreationCategory", ActionConstants.TRANSPORT_MANUAL);
			inValueObject.put("saidToContain", JSPUtility.GetString(request, "saidToContain_"+i));
			inValueObject.put("bookingType", BookingTypeConstant.BOOKING_TYPE_SUNDRY_ID);

			if(JSPUtility.GetShort(request,"deliveryTo_"+i,(short)0) == 0)
				inValueObject.put("deliveryTo", InfoForDeliveryConstant.DELIVERY_TO_BRANCH_ID);
			else
				inValueObject.put("deliveryTo", JSPUtility.GetShort(request,"deliveryTo_"+i));

			inValueObject.put("remark", StringUtils.upperCase(JSPUtility.GetString(request, "remark_" + i, "")));
			inValueObject.put("bookingCrossingAgentId", crossingAgentId);
			inValueObject.put("isWayBillGrandTotalRoundOffAllow", isWayBillGrandTotalRoundOffAllow);

			final var	srcBranch = cache.getGenericBranchDetailCache(request, JSPUtility.GetLong(request, "LRSourceBranchId_"+i));
			inValueObject.put("handlingBranchId", ActionStaticUtil.getHandlingBranchIdByBranchId(request, srcBranch, executive.getAccountGroupId()));

			final var	destBranch = cache.getGenericBranchDetailCache(request, JSPUtility.GetLong(request, "LRDestinationBranchId_"+i));
			inValueObject.put("bookedForAccountGroupId", destBranch.getAccountGroupId());
			inValueObject.put(GroupConfigurationPropertiesDTO.GROUP_CONFIGURATION, cache.getGroupConfiguration(request, executive.getAccountGroupId()));
			inValueObject.put("accountGroupId", executive.getAccountGroupId());

			final var	wayBill	= createWayBillDTO.getWayBillDTO(inValueObject);
			wayBill.setStatus(WayBillStatusConstant.WAYBILL_STATUS_DISPATCHED);
			wayBill.setBookingMode(BookingModeConstant.BOOKING_MODE_APPEND_MANUAL_LS_ID);

			return wayBill;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private WayBillInfo createWayBillInfodto(final HttpServletRequest request, final double taxes, final CreateWayBillInfoDTO  createWayBillInfoDTO, final int i)throws Exception {
		try {
			final var	inValueObject = new ValueObject();
			inValueObject.put("amount", JSPUtility.GetDouble(request, "amount_"+i));
			inValueObject.put("bookingDiscount", 0.00);
			inValueObject.put("bookingDiscountPercentage",0.00);
			inValueObject.put("taxes", taxes);
			inValueObject.put("discountedAmount", JSPUtility.GetDouble(request, "amount_"+i));
			inValueObject.put("isWayBillGrandTotalRoundOffAllow", isWayBillGrandTotalRoundOffAllow);
			inValueObject.put("diffAmtAfterRoundOffForOther",JSPUtility.GetDouble(request, "diffAmtAfterRoundOffForOther", 0));
			inValueObject.put("wayBillTypeId", JSPUtility.GetLong(request, "LRType_"+i));
			inValueObject.put("wbCreationCategory", ActionConstants.TRANSPORT_MANUAL);
			inValueObject.put("sourceBranchId", JSPUtility.GetLong(request, "LRSourceBranchId_"+i));
			inValueObject.put("destinationBranchId", JSPUtility.GetLong(request, "LRDestinationBranchId_"+i));
			inValueObject.put("executive", executive);
			calenderValueObject.put("dateStr", request.getParameter("LRDate_"+i));
			inValueObject.put("date", Utility.getDateTimeFromString(calenderValueObject));
			inValueObject.put("createDate", createDate);
			inValueObject.put("bookingType", BookingTypeConstant.BOOKING_TYPE_SUNDRY_ID);

			if(JSPUtility.GetShort(request,"deliveryTo_"+i,(short)0) == 0)
				inValueObject.put("deliveryTo", InfoForDeliveryConstant.DELIVERY_TO_BRANCH_ID);
			else
				inValueObject.put("deliveryTo", JSPUtility.GetShort(request,"deliveryTo_"+i));

			final var	srcBranch = cache.getGenericBranchDetailCache(request, JSPUtility.GetLong(request, "LRSourceBranchId_"+i));
			inValueObject.put("handlingBranchId", ActionStaticUtil.getHandlingBranchIdByBranchId(request, srcBranch, executive.getAccountGroupId()));

			final var	destBranch = cache.getGenericBranchDetailCache(request, JSPUtility.GetLong(request, "LRDestinationBranchId_"+i));
			inValueObject.put("bookedForAccountGroupId", destBranch.getAccountGroupId());
			inValueObject.put(GroupConfigurationPropertiesDTO.GROUP_CONFIGURATION, cache.getGroupConfiguration(request, executive.getAccountGroupId()));
			inValueObject.put("accountGroupId", executive.getAccountGroupId());

			return createWayBillInfoDTO.createDTOForInsertion(inValueObject);

		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private ConsignmentDetails[] createConsignmentsdto(final HttpServletRequest request,final WayBill  wayBill ,final int i, final CreateConsignmentDetailsDTO	createConsignmentDetailsDTO) throws Exception {
		try {
			final var 		quantity 			= JSPUtility.GetLong(request, "quantity_" + i, 0);
			final var 		typeofPackingId 	= JSPUtility.GetLong(request, "packingType_" + i, 0);
			final var		consignmentGoodsId	= JSPUtility.GetLong(request, "consignmentGoodsId_" + i, 0);
			final Double 	actualWeightKg 		= JSPUtility.GetDouble(request, "actualWeight_" + i, 0);
			final var 		chargedWeightKg 	= actualWeightKg;
			final Double 	consignmentAmount	= JSPUtility.GetDouble(request, "amount_" + i, 0);
			final var 		saidToContain 		= JSPUtility.GetString(request, "saidToContain_" + i, null);

			final var	inValueObject 		= new ValueObject();
			inValueObject.put("articalTypeMasterId",0);
			inValueObject.put("length", JSPUtility.GetDouble(request, "length", 0.00));
			inValueObject.put("height", JSPUtility.GetDouble(request, "height", 0.00));
			inValueObject.put("breadth", JSPUtility.GetDouble(request, "breadth", 0.00));
			inValueObject.put("executive", executive);

			final var	values = typeofPackingId + "_" + actualWeightKg + "_" + chargedWeightKg + "_" + null + "_" + null + "_" + null + "_" + consignmentAmount + "_" + quantity + "_" + saidToContain + "_" + consignmentGoodsId;

			inValueObject.put("values", values);
			inValueObject.put("wayBill", wayBill);

			return createConsignmentDetailsDTO.getConsignmentDetailsDTO(inValueObject);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private CustomerDetails createConsignorDto(final HttpServletRequest request, final WayBill wayBill, final CorporateAccount corporateAccount, final int i, final CreateCustomerDetailsDTO  createCustomerDetailsDto) throws Exception {
		try {
			final var branch 		 = cache.getGenericBranchDetailCache(request, wayBill.getSourceBranchId());
			final var consignorId = JSPUtility.GetLong(request,"consignorId_"+i, 0);

			final var	inValueObject = new ValueObject();

			inValueObject.put("executive", executive);

			inValueObject.put("stateId", branch.getStateId());
			inValueObject.put("countryId", branch.getCountryId());
			inValueObject.put("customerType", CustomerDetails.CUSTOMER_TYPE_CONSIGNOR_ID);
			inValueObject.put("customerName", StringUtils.upperCase(JSPUtility.GetString(request, "consignorName_" + i)));
			inValueObject.put("billingPartyId", JSPUtility.GetLong(request,"billingPartyId_"+i, 0));

			if(corporateAccount != null){
				inValueObject.put("address", corporateAccount.getAddress()); // Do not make it null
				inValueObject.put("phoneNumber", corporateAccount.getPhoneNumber() != null ? corporateAccount.getPhoneNumber() : "0000000000");
			}else{
				inValueObject.put("address", ""); // Do not make it null
				inValueObject.put("phoneNumber", "0000000000");
			}

			if(wayBill.getWayBillTypeId()== WayBillType.WAYBILL_TYPE_CREDIT){
				inValueObject.put("partyType", CorporateAccount.PARTY_TYPE_TBB);
				if((executive.getAccountGroupId() == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_JAYRAM_TRANSPORTS
						||executive.getAccountGroupId() == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_MAHESH_TRANSPORT
						||executive.getAccountGroupId() == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_TARASVIN_TRANSPORT
						||executive.getAccountGroupId() == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_VEGA_TRANSPORT
						||executive.getAccountGroupId() == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_KHTC
						||executive.getAccountGroupId() == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_HTC
						||executive.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNT_GROUP_ID_RAMAN_HOLDING
						||executive.getAccountGroupId() == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_ACIPL
						||executive.getAccountGroupId() == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_NEW_DIAMOND
						||executive.getAccountGroupId() == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_GKR) && consignorId <= 0){
					inValueObject.put("corporateAccountId", 0);
					inValueObject.put("address", "");
					inValueObject.put("phoneNumber", "0000000000");
				} else
					inValueObject.put("corporateAccountId", consignorId);
			} else {
				inValueObject.put("partyType", CorporateAccount.PARTY_TYPE_GENERAL);
				inValueObject.put("corporateAccountId", JSPUtility.GetLong(request,"consignorId_"+i, 0));
			}

			inValueObject.put("contactPerson", "");
			inValueObject.put("emailAddress", null);
			inValueObject.put("faxNumber", null);
			inValueObject.put("department", null);
			inValueObject.put("consignorPin", 0);
			inValueObject.put("gstn", StringUtils.upperCase(JSPUtility.GetString(request, "consignorGstn_" + i, "")));

			return createCustomerDetailsDto.getCustomerDetailsDTO(inValueObject);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private CustomerDetails createConsigneeDto(final HttpServletRequest request, final WayBill wayBill, final int i, final CreateCustomerDetailsDTO  createCustomerDetailsDto) throws Exception {
		try {
			final var branch = cache.getGenericBranchDetailCache(request, wayBill.getDestinationBranchId());
			final var	inValueObject = new ValueObject();
			inValueObject.put("executive", executive);

			inValueObject.put("stateId", branch.getStateId());
			inValueObject.put("countryId", branch.getCountryId());
			inValueObject.put("partyType", CorporateAccount.PARTY_TYPE_GENERAL);
			inValueObject.put("address", ""); // Do not make it null
			inValueObject.put("phoneNumber", "0000000000");
			inValueObject.put("customerType", CustomerDetails.CUSTOMER_TYPE_CONSIGNEE_ID);
			inValueObject.put("customerName", StringUtils.upperCase(JSPUtility.GetString(request, "consigneeName_" + i)));
			inValueObject.put("billingPartyId", 0);
			inValueObject.put("corporateAccountId", JSPUtility.GetLong(request,"consigneeId_"+i, 0));
			inValueObject.put("contactPerson", "");
			inValueObject.put("emailAddress", null);
			inValueObject.put("faxNumber", null);
			inValueObject.put("department", null);
			inValueObject.put("consignorPin", 0);
			inValueObject.put("gstn", StringUtils.upperCase(JSPUtility.GetString(request, "consigneeGstn_" + i, "")));

			return createCustomerDetailsDto.getCustomerDetailsDTO(inValueObject);

		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private WayBillBookingCharges[] createManualChargesDto(final HttpServletRequest request,final WayBill wayBill, final int k, final CreateWayBillBookingChargeDTO  createWayBillBookingChargeDTO) throws Exception {
		try {
			final var	inValueObject 		  = new ValueObject();
			final var	wayBillChargeAmountHM = new HashMap<Long, Double>();

			final var	charges = cache.getBookingCharges(request, wayBill.getSourceBranchId());

			inValueObject.put("executive", executive);
			inValueObject.put("charges", charges);

			if(ObjectUtils.isNotEmpty(charges))
				for (final ChargeTypeModel charge : charges)
					if(charge.getChargeTypeMasterId()== BookingChargeConstant.FREIGHT)
						wayBillChargeAmountHM.put(charge.getChargeTypeMasterId(), JSPUtility.GetDouble(request,"amount_"+k,0));
					else
						wayBillChargeAmountHM.put(charge.getChargeTypeMasterId(),0.00);

			inValueObject.put("wayBillChargeAmountHM", wayBillChargeAmountHM);

			return createWayBillBookingChargeDTO.getCWayBillBookingChargeDTO(inValueObject);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private ConsignmentSummary createConsignmentSummaryDto(final HttpServletRequest request,final WayBill wayBill, final CorporateAccount corporateAccount, final int i, final CreateConsignmentSummaryDTO  createConsignmentSummaryDTO, final long crossingAgentId) throws Exception {
		short				taxBy			= 0;

		try {
			final var	inValueObject = new ValueObject();

			inValueObject.put("executive", executive);
			inValueObject.put("wayBill", wayBill);
			inValueObject.put("saidToContain", StringUtils.upperCase(JSPUtility.GetString(request, "saidToContain_" + i)));
			inValueObject.put("actualWeight", JSPUtility.GetDouble(request, "actualWeight_"+i,0));
			inValueObject.put("quantity", JSPUtility.GetLong(request,"quantity_"+i));
			inValueObject.put("amount", JSPUtility.GetDouble(request,"amount_"+i,0));

			if(JSPUtility.GetShort(request,"deliveryTo_"+i,(short)0) == 0)
				inValueObject.put("deliveryTo", InfoForDeliveryConstant.DELIVERY_TO_BRANCH_ID);
			else
				inValueObject.put("deliveryTo", JSPUtility.GetShort(request,"deliveryTo_"+i));

			if(executive.getAccountGroupId() == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_SNGT
					|| executive.getAccountGroupId() == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_KATIRA){
				if(wayBill.getWayBillTypeId()== WayBillTypeConstant.WAYBILL_TYPE_PAID){
					if(corporateAccount!= null && corporateAccount.isServiceTaxRequired())
						taxBy = TaxPaidByConstant.TAX_PAID_BY_TRANSPORTER_ID;
					else
						taxBy = TaxPaidByConstant.TAX_PAID_BY_CONSINGOR_ID;
				}else if(wayBill.getWayBillTypeId()== WayBillTypeConstant.WAYBILL_TYPE_TO_PAY)
					if(corporateAccount!= null && corporateAccount.isServiceTaxRequired())
						taxBy = TaxPaidByConstant.TAX_PAID_BY_TRANSPORTER_ID;
					else
						taxBy = TaxPaidByConstant.TAX_PAID_BY_CONSINGEE_ID;
			} else
				taxBy = TaxPaidByConstant.TAX_PAID_BY_CONSINGOR_ID;

			inValueObject.put("taxBy", taxBy);
			inValueObject.put("chargeWeight", JSPUtility.GetDouble(request, "actualWeight_"+i,0));
			inValueObject.put("bookingTypeId", BookingTypeConstant.BOOKING_TYPE_SUNDRY_ID);

			if(crossingAgentId > 0)
				inValueObject.put("paymentType", PaymentTypeConstant.PAYMENT_TYPE_CROSSING_CREDIT_ID);
			else if(wayBill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID)
				inValueObject.put("paymentType", PaymentTypeConstant.PAYMENT_TYPE_CASH_ID);
			else
				inValueObject.put("paymentType", (short)0);

			inValueObject.put("chargeTypeId", ChargeTypeConstant.CHARGETYPE_ID_FIX);
			inValueObject.put("invoiceNo", JSPUtility.GetString(request, "invoiceNo_"+i, null));
			inValueObject.put("invoiceDate", null);
			inValueObject.put("deliveryPlace", null);
			inValueObject.put("commodityMasterId", 0);
			inValueObject.put("declaredValue", 0.00);
			inValueObject.put("deliveryPlaceId", 0);
			inValueObject.put("vehicleTypeId", (short)0);
			inValueObject.put("freightUptoBranchId", 0);
			inValueObject.put("conveyedCopyAttach", false);

			if(wayBill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT)
				inValueObject.put("podRequired", PODRequiredConstant.POD_REQUIRED_YES_ID);
			else
				inValueObject.put("podRequired", PODRequiredConstant.POD_REQUIRED_NO_ID);

			return createConsignmentSummaryDTO.getConsignmentSummaryDTO(inValueObject);

		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private DispatchSummary createDispatchSummaryDTO (final DispatchLedger dispatchLedger, final WayBill wayBill, final CreateDispatchSummaryDTO  createDispatchSummaryDTO, final ConsignmentSummary  consignmentSummary) throws Exception {
		try {
			final var	inValueObject = new ValueObject();
			inValueObject.put("executive", executive);
			inValueObject.put("dispatchLedger", dispatchLedger);
			inValueObject.put("wayBill", wayBill);
			inValueObject.put("consignmentSummary", consignmentSummary);

			return createDispatchSummaryDTO.getDispatchSummaryDTO(inValueObject);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private WayBillHistory createWayBillHistoryDTO (final WayBill wayBill, final CreateWayBillHistoryDTO  createWayBillHistoryDTO) throws Exception {
		try {
			final var	inValueObject = new ValueObject();

			inValueObject.put("wayBill", wayBill);
			inValueObject.put("status", WayBillStatusConstant.WAYBILL_STATUS_BOOKED);

			return createWayBillHistoryDTO.getWayBillHistoryDTO(inValueObject);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}
}