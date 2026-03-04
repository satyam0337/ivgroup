package com.ivcargo.actions.transport;

//~--- non-JDK imports --------------------------------------------------------

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Calendar;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.StringJoiner;
import java.util.TimeZone;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.ObjectUtils;
import org.apache.commons.lang3.StringUtils;

import com.businesslogic.CreditPaymentModuleBLL;
import com.businesslogic.DamerageChargeBLL;
import com.businesslogic.DeliveryRateBLL;
import com.businesslogic.DispatchBLL;
import com.businesslogic.GenerateCashReceiptBLL;
import com.businesslogic.LRSearchBLL;
import com.businesslogic.TaxCalculationBLL;
import com.businesslogic.WayBillBll;
import com.businesslogic.displaydata.DisplayDataConfigurationBll;
import com.businesslogic.properties.GeneralConfiguration;
import com.businesslogic.shortexcess.DamageReceiveBLL;
import com.businesslogic.shortexcess.ExcessReceiveBLL;
import com.businesslogic.shortexcess.ShortReceiveBLL;
import com.businesslogic.utils.WayBillAccessibility;
import com.businesslogic.waybill.LRViewScreenBLL;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.bll.impl.lrsearch.LRSearchBllImpl;
import com.iv.bll.impl.master.deliveryrate.DeliveryRateMasterBllImpl;
import com.iv.bll.impl.properties.DisplayDataConfigurationBllImpl;
import com.iv.bll.impl.waybill.WayBillBookingRateBllImpl;
import com.iv.bll.utility.JsonUtility;
import com.iv.bll.utils.IDProofSelectionUtility;
import com.iv.constant.properties.CtoDetainConfigurationConstant;
import com.iv.constant.properties.GeneralConfigurationPropertiesConstant;
import com.iv.constant.properties.GenerateCashReceiptPropertiesConstant;
import com.iv.constant.properties.GroupConfigurationPropertiesConstant;
import com.iv.constant.properties.LrViewConfigurationPropertiesConstant;
import com.iv.constant.properties.STBSSettlementConfigurationConstant;
import com.iv.dao.impl.DoorPickupDetailsDaoImpl;
import com.iv.dao.impl.MoneyReceiptTxnDaoImpl;
import com.iv.dao.impl.PendingGoodsUndeliveredStockDaoImpl;
import com.iv.dao.impl.agentbranchhisab.AgentHisabCommissionSummaryDaoImpl;
import com.iv.dao.impl.agentbranchhisab.AgentHisabDispatchSummaryDaoImpl;
import com.iv.dao.impl.agentbranchhisab.PendingHisabByAgentBranchDaoImpl;
import com.iv.dao.impl.agentbranchhisab.PendingHisabForAgentBranchDaoImpl;
import com.iv.dao.impl.chequebounce.ChequeBounceDaoImpl;
import com.iv.dao.impl.crossingagent.CrossingAgentMasterDaoImpl;
import com.iv.dao.impl.delivery.PartialDeliveryStockArticleDetailsDaoImpl;
import com.iv.dao.impl.master.ExecutiveDaoImpl;
import com.iv.dao.impl.pendinglsforpayment.PendingLSPaymentBillSummaryDaoImpl;
import com.iv.dao.impl.shortcredit.ShortCreditCollectionSheetSettlementDaoImpl;
import com.iv.dto.MoneyReceiptTxn;
import com.iv.dto.bill.ShortCreditCollectionBillClearanceDto;
import com.iv.dto.constant.ApprovalTypeConstant;
import com.iv.dto.constant.BillClearanceStatusConstant;
import com.iv.dto.constant.BillSelectionConstant;
import com.iv.dto.constant.BookingChargeConstant;
import com.iv.dto.constant.BookingTypeConstant;
import com.iv.dto.constant.BranchServiceTypeConstant;
import com.iv.dto.constant.BusinessFunctionConstants;
import com.iv.dto.constant.BusinessTypeConstant;
import com.iv.dto.constant.CargoAccountGroupConstant;
import com.iv.dto.constant.ChargeTypeConstant;
import com.iv.dto.constant.ConnectivityTypeConstant;
import com.iv.dto.constant.CorporateAccountConstant;
import com.iv.dto.constant.DeclarationTypeConstant;
import com.iv.dto.constant.DeliveryChargeConstant;
import com.iv.dto.constant.ExecutiveTypeConstant;
import com.iv.dto.constant.FeildPermissionsConstant;
import com.iv.dto.constant.FormTypeConstant;
import com.iv.dto.constant.ForwardTypeConstant;
import com.iv.dto.constant.InfoForDeliveryConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.dto.constant.MovementTypeConstant;
import com.iv.dto.constant.PODStatusConstant;
import com.iv.dto.constant.PaymentTypeConstant;
import com.iv.dto.constant.PickupTypeConstant;
import com.iv.dto.constant.RateMasterConstant;
import com.iv.dto.constant.RiskAllocationConstant;
import com.iv.dto.constant.TaxMasterConstant;
import com.iv.dto.constant.TaxPaidByConstant;
import com.iv.dto.constant.TransCargoAccountGroupConstant;
import com.iv.dto.constant.TransportationCategoryConstant;
import com.iv.dto.constant.TransportationModeConstant;
import com.iv.dto.constant.WayBillStatusConstant;
import com.iv.dto.constant.WayBillTypeConstant;
import com.iv.dto.master.TaxMaster;
import com.iv.dto.master.TaxModel;
import com.iv.dto.model.ChequeBounceModel;
import com.iv.dto.pickupls.PickupLsReceive;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.constant.Color;
import com.iv.utils.constant.Constant;
import com.iv.utils.constant.CountryIdConstant;
import com.iv.utils.constant.DateTimeFormatConstant;
import com.iv.utils.constant.GoodsClassificationConstant;
import com.iv.utils.constant.PodWayBillPropertiesConstant;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.exception.ExceptionProcess;
import com.iv.utils.utility.CollectionUtility;
import com.iv.utils.utility.Utility;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.actions.GenerateCRAjaxAction;
import com.ivcargo.reports.ReportView;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.AgentCommisionBillingSummaryDao;
import com.platform.dao.BranchDao;
import com.platform.dao.BranchTransferDao;
import com.platform.dao.ChargeConfigDao;
import com.platform.dao.CollectionPersonMasterDao;
import com.platform.dao.ConfigDiscountDao;
import com.platform.dao.CorporateAccountDao;
import com.platform.dao.CustomerEnquiryDao;
import com.platform.dao.DeliveryRunSheetSummaryDao;
import com.platform.dao.DeliverySequenceCounterDao;
import com.platform.dao.DiscountDetailsDAO;
import com.platform.dao.DiscountMasterDAO;
import com.platform.dao.DispatchSummaryDao;
import com.platform.dao.ExecutiveDao;
import com.platform.dao.GodownDao;
import com.platform.dao.InvoiceCertificationSummaryDao;
import com.platform.dao.LHPVDao;
import com.platform.dao.PartyAgentCommissionModuleDao;
import com.platform.dao.PendingDeliveryStockDao;
import com.platform.dao.PendingDispatchStockDao;
import com.platform.dao.PreLoadingSheetSummaryDao;
import com.platform.dao.ReceivedLedgerDao;
import com.platform.dao.ReceivedSummaryDao;
import com.platform.dao.ReturnBookingDao;
import com.platform.dao.ShortCreditCollectionSheetLedgerDao;
import com.platform.dao.WayBillBookingChargesDao;
import com.platform.dao.WayBillChargeAmountDao;
import com.platform.dao.WayBillCrossingDao;
import com.platform.dao.WayBillDao;
import com.platform.dao.WayBillExpenseDao;
import com.platform.dao.WayBillIncomeDao;
import com.platform.dao.reports.BillSummaryDAO;
import com.platform.dao.reports.CreditWayBillTxnClearanceSummaryDAO;
import com.platform.dao.reports.CrossingAgentBillClearanceDAO;
import com.platform.dao.tdstxn.TDSTxnDetailsDAO;
import com.platform.dto.AliasNameConstants;
import com.platform.dto.Bill;
import com.platform.dto.BillSummary;
import com.platform.dto.Branch;
import com.platform.dto.BranchTransfer;
import com.platform.dto.CTODetainModel;
import com.platform.dto.ChargeTypeMaster;
import com.platform.dto.ConfigParam;
import com.platform.dto.ConsignmentDetails;
import com.platform.dto.ConsignmentSummary;
import com.platform.dto.ContainerDetails;
import com.platform.dto.CrossingAgentBillClearance;
import com.platform.dto.CustomerDetails;
import com.platform.dto.DeliveryContactDetails;
import com.platform.dto.DeliveryPending;
import com.platform.dto.DeliveryRateMaster;
import com.platform.dto.DeliveryRunSheetSummary;
import com.platform.dto.DeliverySequenceCounter;
import com.platform.dto.DiscountDetails;
import com.platform.dto.DispatchLedger;
import com.platform.dto.Executive;
import com.platform.dto.ExecutiveFeildPermissionDTO;
import com.platform.dto.GodownUnloadDetails;
import com.platform.dto.LocationsMapping;
import com.platform.dto.PODWaybillsDto;
import com.platform.dto.PackingTypeMaster;
import com.platform.dto.PendingDispatchStock;
import com.platform.dto.ReceiveSummaryData;
import com.platform.dto.Region;
import com.platform.dto.ReturnBooking;
import com.platform.dto.SubRegion;
import com.platform.dto.TransportCommonMaster;
import com.platform.dto.UserErrors;
import com.platform.dto.WayBill;
import com.platform.dto.WayBillChargeAmount;
import com.platform.dto.WayBillCharges;
import com.platform.dto.WayBillCrossing;
import com.platform.dto.WayBillTaxTxn;
import com.platform.dto.WayBillType;
import com.platform.dto.configuration.mindateselection.ModuleWiseMinDateSelectionConfigurationDTO;
import com.platform.dto.configuration.modules.GenerateCashReceiptDTO;
import com.platform.dto.configuration.modules.GroupConfigurationPropertiesDTO;
import com.platform.dto.model.ChargeTypeModel;
import com.platform.dto.model.CreditWayBillTxn;
import com.platform.dto.model.CreditWayBillTxnCleranceSummary;
import com.platform.dto.model.PackagesCollectionDetails;
import com.platform.dto.model.RecivablesDispatchLedger;
import com.platform.dto.model.ReportViewModel;
import com.platform.dto.model.WayBillModel;
import com.platform.dto.module.receive.TruckArrivalDetail;
import com.platform.dto.shortexcess.DamageReceive;
import com.platform.dto.shortexcess.ExcessReceive;
import com.platform.dto.shortexcess.ShortReceive;
import com.platform.dto.tds.TDSTxnDetails;
import com.platform.dto.tds.TDSTxnDetailsIdentifiers;
import com.platform.dto.waybill.FormTypes;
import com.platform.dto.waybill.WayBillChargesRemark;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Converter;

public class TransportViewWayBillAction implements Action {
	public static final String TRACE_ID = TransportViewWayBillAction.class.getName();
	public static final String DEMURRAGE_AMOUNT = "demurrageAmount";

	boolean											isAgentBranchComissionBillCreated	= false;
	CacheManip  									cache    							= null;
	boolean											isAllowToEdit						= true;
	boolean											isTokenWiseLR						= false;
	boolean											isLRinPLSState						= false;
	boolean											subRegionWiseLimitedPermission		= false;
	boolean											isAllowToPrint						= false;
	ValueObject		branchColl		= null;
	ValueObject		regionColl		= null;
	ValueObject		subRegionColl	= null;

	@Override
	@SuppressWarnings("unchecked")
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {

		HashMap<String, Object>	 					error 							= null;
		Branch										handlingBranch					= null;
		String										panNumberFromPartyMaster		= null;
		Branch	 									branch 							= null;
		SubRegion									srcSubRegion					= null;
		SubRegion									subRegion				  		= null;
		ArrayList<WayBillChargeAmount> 				wayBillChargeAmountList								= null;
		var											isDummyLR											= false;
		var											isOperationAllowedAfterCashStmt						= false;
		var											isLRExpAllowedToDestAfterCashStmt					= false;
		var											isCrossingAgentBillCreate 							= false;
		var			  								isIncomeExists										= false;
		var			  								isExpenseExists										= false;
		var											consineePanNumber									= "";
		Short										waybillStatus										= 0;
		var											showPaymentRequired									= false;
		var											showPaymentRequiredLink								= false;
		var											isShowAmountZero									= false;
		var											showWayBillSourceUpdateLink							= false;
		var 										tdsAmount 											= 0.00;
		WayBill										wayBillReturnBooking								= null;
		var 										returnWaybillId										= 0L;
		var 										returnWaybillNumber									= "";
		var											showAgentBillPrintButton							= false;
		var 										isOperationalBranch 								= false;
		var 										handlingAndOperational 								= "";
		var											showShortCreditPaymentLink							= true;
		var											showLRExpenseLink									= false;
		var											showLRExpenseViewLink								= true;
		var 										sourceBranchName									= "";

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			if( request.getParameter("printType") != null)
				waybillStatus =	JSPUtility.GetShort(request, "printType", (short) 0);

			var	wayBillId 			= JSPUtility.GetLong(request, "wayBillId", 0);

			cache		= new CacheManip(request);
			final var	executive 			= cache.getExecutive(request);
			branchColl			= cache.getGenericBranchesDetail(request);
			regionColl			= cache.getAllRegions(request);
			subRegionColl		= cache.getAllSubRegions(request);
			final var	execFunctions		= cache.getExecFunctions(request);

			if(execFunctions == null)
				return;

			final var	minDateTimeStamp	= cache.getModuleWiseMinDateToGetData(request, executive.getAccountGroupId(),
					ModuleWiseMinDateSelectionConfigurationDTO.LR_CREDIT_PAYMENT_MIN_DATE_ALLOW,
					ModuleWiseMinDateSelectionConfigurationDTO.LR_CREDIT_PAYMENT_MIN_DATE);

			if (wayBillId == 0 && request.getAttribute("wayBillId") != null)
				wayBillId = (Long) request.getAttribute("wayBillId");

			final var	execFldPermissionsHM = cache.getExecutiveFieldPermission(request);

			/**
			 * code for getting AccountGroupName Dynamically
			 */
			final var	reportView					= new ReportView();
			var	reportViewModel 			= new ReportViewModel();

			reportViewModel 			= reportView.populateReportViewModel(request, reportViewModel);
			request.setAttribute("reportViewModel", reportViewModel);

			final var	shortReceiveConfig			= cache.getOldConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.SHORT_RECEIVE_LR);
			final var	damageReceiveConfig			= cache.getOldConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.DAMAGE_RECEIVE_LR);
			final var	excessReceiveConfig			= cache.getOldConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.EXCESS_RECEIVE_LR);
			final var	generalConfiguration 		= cache.getOldConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.GENERAL_CONFIGURATION);
			final var	groupConfiguration			= cache.getOldConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.BOOKING);
			final var	generateCRConfVal			= cache.getOldConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.GENERATE_CR);
			final var	displayDataConfig			= cache.getOldConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.DISPLAY_DATA_CONFIGURATION);
			final var	podConfiguration			= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.POD_WAYBILL);
			final var	lrViewConfiguration			= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.LR_SEARCH);
			final var 	stbsSettlementConfig		= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.STBS_SETTLEMENT);
			final var	showZeroAmountInLr			= (boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.SHOW_ZERO_AMOUNT_IN_LR, false);
			final var	showSTBPrint				= (boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.SHOW_STB_PRINT, false);
			final var	appendHandlingBranchWithSourceBranch			= (boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.APPEND_HANDLING_BRANCH_WITH_SOURCE_BRANCH, false);
			final var	showBillingPartyAtConsigneeSideForBillCreditLR	= (boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.SHOW_BILLING_PARTY_AT_CONSIGNEE_SIDE_FOR_BILL_CREDIT_LR, false);
			final var	showHandlingBranchWithSubRegionInSourceBranch	= (boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.SHOW_HANDLING_BRANCH_WITH_SUBREGION_IN_SOURCE_BRANCH, false);

			final var	showViewUnclaimedGoodsNotice	= (boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.SHOW_VIEW_UNCLAIMED_GOODS_NOTICE, false);
			final var	hideLRCharges					= (boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.HIDE_LR_CHARGES, false);
			final var	lrCancelationLockingAfterDay	= (boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.LR_CANCELATION_LOCKING_AFTER_DAY, false);
			final var 	dontAllowLrCancelAfterNoOfDays 	= (int) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.DONT_ALLOW_LR_CANCEL_AFTER_NO_OF_DAYS, 0);
			final var	numberOfDigitToShowAtTheEndOfMobileNumber	= (int) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.NUMBER_OF_DIGIT_TO_SHOW_AT_THE_END_OF_MOBILE_NUMBER, 0);
			final var	numberOfDigitToShowAtBeginingOfMobileNumber	= (int) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.NUMBER_OF_DIGIT_TO_SHOW_AT_BEGINING_OF_MOBILE_NUMBER, 0);

			var	isNewSTBSPaymentScreen			= (boolean) stbsSettlementConfig.getOrDefault(STBSSettlementConfigurationConstant.IS_NEW_STBS_PAYMENT_SCREEN, false);

			if(Utility.isIdExistInLongList(stbsSettlementConfig, STBSSettlementConfigurationConstant.SUB_REGION_IDS_FOR_NEW_PAYMENT_SCREEN, executive.getSubRegionId()))
				isNewSTBSPaymentScreen = true;

			var 	hideEditButton			= false;
			var 	doNotAllowEditOptionBasedOnRegion 	= false;

			final var	valueInObj					= new ValueObject();

			final var	noOfDays 				= cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_MAX_DAYS_OF_OPERATION_BEFORE_CASHSTATEMENT_ENTRY_ID);

			final var	lrSearchBLL		= new LRSearchBLL();
			var	outValObj	= lrSearchBLL.findByWayBillId(wayBillId, executive.getAccountGroupId());

			if(outValObj == null)
				return;

			if (outValObj.containsKey(com.iv.utils.message.CargoErrorList.ERROR_DESCRIPTION)) {
				error.put("errorDescription", outValObj.get(com.iv.utils.message.CargoErrorList.ERROR_DESCRIPTION));
				request.setAttribute("cargoError", error);
				request.setAttribute("nextPageToken", "failure");
				return;
			}

			final var	wayBillModel = (WayBillModel) outValObj.get("wayBillModel");

			request.setAttribute("wayBillModel", wayBillModel);
			request.setAttribute("showSTBPrint", showSTBPrint);
			request.setAttribute("showViewUnclaimedGoodsNotice", showViewUnclaimedGoodsNotice);
			request.setAttribute("showBillingPartyAtConsigneeSideForBillCreditLR", showBillingPartyAtConsigneeSideForBillCreditLR);
			request.setAttribute("showBillingPartyGstn", lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.SHOW_BILLING_PARTY_GSTN, false));

			if (wayBillModel == null) {
				error.put("errorCode", CargoErrorList.WRONG_WAYBILL_ERROR);
				error.put("errorDescription", CargoErrorList.WRONG_WAYBILL_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
				request.setAttribute("nextPageToken", "failure");
				return;
			}

			final var	creditWBTxnColl					= wayBillModel.getCreditWBTxnColl();
			final var	consignmentSummary				= wayBillModel.getConsignmentSummary();
			final var	podWaybillsDto					= wayBillModel.getPodWaybillsDto();
			final var	consignmentDetailsList			= wayBillModel.getConsignmentDetails();
			final var	consignee 						= wayBillModel.getConsigneeDetails();
			final var	consignor 						= wayBillModel.getConsignorDetails();
			final var	wayBill 						= wayBillModel.getWayBill();
			final var	deliveryContactDetails 			= wayBillModel.getDeliveryContactDetails();
			final var	wayBillHistory 					= wayBillModel.getWayBillHistory();
			final var	branchTransfer 					= wayBillModel.getBranchTransfer();
			final var	wayBillCancellation 			= wayBillModel.getWayBillCancellation();
			final var	wayBillCharges 					= wayBillModel.getWayBillCharges();
			final var	wayBillTaxTxn 					= wayBillModel.getWayBillTaxTxn();
			final var	formTypesArr					= (FormTypes[]) outValObj.get("formTypesArr");
			final var	moneyReceiptTxn					= (MoneyReceiptTxn) outValObj.get(MoneyReceiptTxn.MONEY_RECEIPT_TXN);
			final var	truckArrivalDetails				= wayBillModel.getTruckArrivalDetails();
			final var	wayBillChargesRemark			= (WayBillChargesRemark[]) outValObj.get("wayBillChargesRemark");
			final var	ctoDetainModel					= wayBillModel.getCtoDetainModel();
			final var	doorPickupLedgerArr				= wayBillModel.getDoorPickupLedger();
			final var	creditWayBillPaymentModule		= wayBillModel.getCreditWayBillPaymentModule();
			final var	returnBooking					= ReturnBookingDao.getInstance().getReturnBookingDataWithMarkForDelete(wayBillId);
			final var	agentCommisionBillingModel 		= AgentCommisionBillingSummaryDao.getInstance().getAgentCommissionBillingDetailsByWaybillId(wayBillId);
			final var	billColl 						= BillSummaryDAO.getInstance().getBillDetailsByLRId(wayBill.getWayBillId());
			final var	drs 							= DeliveryRunSheetSummaryDao.getInstance().getDDMSettlementDataWayBillId(wayBill.getWayBillId());
			final var	dispatchLedgerId 				= DispatchSummaryDao.getInstance().getLastDispatchLedgerIdByWayBillId(wayBill.getWayBillId());

			final var	isLSBillCreated = dispatchLedgerId > 0 && PendingLSPaymentBillSummaryDaoImpl.getInstance().checkLSBillCreatedByDispatchLedgerId(dispatchLedgerId);
			final var	packageConditionHM				= cache.getPackageConditionNameHM(request);

			if(agentCommisionBillingModel != null && agentCommisionBillingModel.getWayBillId() > 0) {
				showAgentBillPrintButton 	= true;
				request.setAttribute("agentCommisionBillingNumber", agentCommisionBillingModel.getAgentCommisionBillingNumber());
			}

			request.setAttribute("showAgentBillPrintButton", showAgentBillPrintButton);

			final var	doNotAllowToShowEditLinks = consignmentSummary != null && StringUtils.isNotEmpty(consignmentSummary.getPaymentTxnId()) || deliveryContactDetails != null && StringUtils.isNotEmpty(deliveryContactDetails.getPaymentTxnId());

			final var	displayBookingCharges				= displayBookingChargesToAdminAndBookingBranchOnly(request, wayBill, execFldPermissionsHM, lrViewConfiguration, executive);

			final var	wayBillTypeWiseAllowEmailServices	= groupConfiguration.getString(GroupConfigurationPropertiesDTO.WAYBILL_TYPE_WISE_ALLOW_EMAIL_SERVICES,null);
			final var	roundOffServiceTaxAmount			= (boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.ROUND_OFF_SERVICE_TAX_AMOUNT, false);
			final var	applyDiscountThroughMaster			= groupConfiguration.getBoolean(GroupConfigurationPropertiesDTO.APPLY_DISCOUNT_THROUGH_MASTER);

			request.setAttribute("doorPickupDetails", doorPickupLedgerArr);
			request.setAttribute("applyDiscountThroughMaster", applyDiscountThroughMaster);
			request.setAttribute("showViewPdfButton", execFunctions.get(BusinessFunctionConstants.UPLOAD_LR_PDF) != null || groupConfiguration.getBoolean(GroupConfigurationPropertiesConstant.UPLOAD_INVOICE_DOCUMENTS));

			valueInObj.put(Executive.EXECUTIVE, executive);
			valueInObj.put("execFldPermissionsHM", execFldPermissionsHM);

			final var	srcBranch   		= (Branch) branchColl.get(Long.toString(wayBill.getSourceBranchId()));
			var			destBranch  		= (Branch) branchColl.get(Long.toString(wayBill.getDestinationBranchId()));
			final var	sourceRegion 		= (Region) regionColl.get(srcBranch.getRegionId());

			if(destBranch == null) {
				destBranch	= BranchDao.getInstance().findByBranchId(wayBill.getDestinationBranchId());
				branchColl.put(Long.toString(wayBill.getDestinationBranchId()), destBranch);
			}

			final var	destBranchRegion	= (Region) regionColl.get(destBranch.getRegionId());

			if(request.getSession().getAttribute("subRegionWiseLimitedPermission") != null)
				subRegionWiseLimitedPermission	= (boolean) request.getSession().getAttribute("subRegionWiseLimitedPermission");

			if(appendHandlingBranchWithSourceBranch && wayBill.getBookingTypeId() == BookingTypeConstant.BOOKING_TYPE_FTL_ID
					&& srcBranch.getTypeOfLocation() == Branch.TYPE_OF_LOCATION_OPERATIONAL_PLACE) {
				isOperationalBranch 	= true;
				handlingBranch  		= (Branch) branchColl.get(Long.toString(srcBranch.getHandlingBranchId()));

				if(handlingBranch != null)
					handlingAndOperational 	= handlingBranch.getName() + " - " + srcBranch.getName();
				else
					handlingAndOperational 	= srcBranch.getName();
			}

			final var startDateToAddOtherChargesInFreight			= (String) groupConfiguration.get(GroupConfigurationPropertiesConstant.START_DATE_TO_ADD_OTHER_CHARGES_IN_FREIGHT, "00-00-0000");

			final var condition = DateTimeUtility.isValidDate(startDateToAddOtherChargesInFreight, DateTimeFormatConstant.DD_MM_YYYY) && DateTimeUtility.getDayDiffBetweenTwoDates(DateTimeUtility.getTimeStamp(startDateToAddOtherChargesInFreight), wayBill.getBookingDateTime()) > 0;

			if(condition)
				request.setAttribute("otherChargesList", groupConfiguration.get(GroupConfigurationPropertiesConstant.OTHER_CHARGES_TO_ADD_IN_FREIGHT, "0"));

			if(showHandlingBranchWithSubRegionInSourceBranch) {
				srcSubRegion 			= (SubRegion) subRegionColl.get(srcBranch.getSubRegionId());
				handlingBranch  		= (Branch) branchColl.get(Long.toString(srcBranch.getHandlingBranchId()));

				if(handlingBranch != null && srcBranch.getTypeOfLocation() == Branch.TYPE_OF_LOCATION_OPERATIONAL_PLACE)
					sourceBranchName	= srcBranch.getName() + " ( " + handlingBranch.getName() + " ) " + " ( " + srcSubRegion.getName() + " )";
				else
					sourceBranchName	= srcBranch.getName() + " ( " + srcSubRegion.getName() + " )";
			}

			request.setAttribute("sourceBranchName", sourceBranchName);
			request.setAttribute("showHandlingBranchWithSubRegionInSourceBranch", showHandlingBranchWithSubRegionInSourceBranch);
			request.setAttribute("isOperationalBranch", isOperationalBranch);
			request.setAttribute("handlingAndOperational", handlingAndOperational);
			request.setAttribute("sourceRegion", sourceRegion);
			request.setAttribute("destBranchRegion", destBranchRegion);
			request.setAttribute(LrViewConfigurationPropertiesConstant.SHOW_CONVEY_COPY_COLUMN, lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.SHOW_CONVEY_COPY_COLUMN, false));
			request.setAttribute("srcBranchMobileNo", srcBranch.getMobileNumber());

			if(showZeroAmountInLr || execFldPermissionsHM.get(FeildPermissionsConstant.SHOW_LR_CHARGES) == null && hideLRCharges && executive.getExecutiveType() != ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN){
				valueInObj.put("wayBillTypeId", wayBill.getWayBillTypeId());
				valueInObj.put("hideLRCharges", hideLRCharges);

				isShowAmountZero = DisplayDataConfigurationBll.isAllowToDisplayZeroAmount(displayDataConfig, valueInObj);
			}

			final var	wayBillBll			= new WayBillBll();

			final var	allowRateInDecimal	= wayBillBll.lrWiseDecimalAmountAllow(groupConfiguration, wayBill.getWayBillTypeId());

			if(!allowRateInDecimal) {
				wayBill.setBookingChargesSum(Math.round(wayBill.getBookingChargesSum()));
				wayBill.setGrandTotal(Math.round(wayBill.getGrandTotal()));
				wayBill.setCancelledLRAmount(Math.round(wayBill.getCancelledLRAmount()));
				wayBill.setBookingDiscount(Math.round(wayBill.isDiscountPercent() ?	wayBill.getBookingDiscountPercentage() : wayBill.getBookingDiscount()));
				wayBill.setAgentCommission(Math.round(wayBill.getAgentCommission()));
				wayBill.setBookingTotal(Math.round(wayBill.getBookingTotal()));
			}

			final var	isBillCreated	= isBillCreated(billColl, wayBill);

			if(creditWBTxnColl != null)
				getShortCreditPaymentExtraDetails(request, creditWBTxnColl, wayBillModel, isNewSTBSPaymentScreen, executive);
			else if(wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DELIVERED || wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_PARTIAL_DELIVERED
					|| wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_PARTIAL_DUEDELIVERED || wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_PARTIAL_DUEUNDELIVERED)
				getDeliveryTimeTDSDetails(request, deliveryContactDetails, 0, null);

			request.setAttribute("CreditWBTxnColl", creditWBTxnColl);
			request.setAttribute("isNewSTBSPaymentScreen", isNewSTBSPaymentScreen);

			if(creditWayBillPaymentModule != null) {
				branch = cache.getGenericBranchDetailCache(request,creditWayBillPaymentModule.getBillingBranchId());
				creditWayBillPaymentModule.setBillingBranchName(branch != null ? branch.getName() : "");
				request.setAttribute("creditWayBillPaymentModule", creditWayBillPaymentModule);
			}

			if((boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.IS_CTO_DETAIN_ALLOWED, false)) {
				final var		ctoDetainProperties		= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.LR_BLOCKING);
				request.setAttribute(CtoDetainConfigurationConstant.CTO_DETAIN_STATUS_NAME, ctoDetainProperties.getOrDefault(CtoDetainConfigurationConstant.CTO_DETAIN_STATUS_NAME, "").toString());

				if(ctoDetainModel != null) {
					final var lockedByExecutive = ExecutiveDao.getInstance().findByExecutiveId(ctoDetainModel.getLockExecutiveId());

					ctoDetainModel.setLockCreationDateTimeStr(DateTimeUtility.getDateFromTimeStampWithAMPM(ctoDetainModel.getLockCreationDateTime()));
					ctoDetainModel.setReleaseCreationDateTimeStr(DateTimeUtility.getDateFromTimeStampWithAMPM(ctoDetainModel.getReleaseCreationDateTime()));
					ctoDetainModel.setLockRemark(Utility.checkedNullCondition(ctoDetainModel.getLockRemark(), (short) 1));
					ctoDetainModel.setReleaseRemark(Utility.checkedNullCondition(ctoDetainModel.getReleaseRemark(), (short) 1));
					ctoDetainModel.setLockedBy(lockedByExecutive != null ? lockedByExecutive.getName() : "");

					if(ctoDetainModel.getStatus() == CTODetainModel.DETAINED_STATUS)
						ctoDetainModel.setStatusString((String) ctoDetainProperties.getOrDefault(CtoDetainConfigurationConstant.CTO_DETAIN_STATUS_NAME, ""));
					else if(ctoDetainModel.getStatus() == CTODetainModel.RELEASED_STATUS)
						ctoDetainModel.setStatusString(CTODetainModel.RELEASED_STATUS_NAME_FOR_VIEW);
					else
						ctoDetainModel.setStatusString("--");
				}

				request.setAttribute("ctoDetainModel", ctoDetainModel);
			}

			setConsignmentSummaryOtherData(request, executive, consignmentSummary, displayBookingCharges, lrViewConfiguration, groupConfiguration);

			if(consignmentSummary.getDeliveryTo() == InfoForDeliveryConstant.DIRECT_DELIVERY_DIRECT_VASULI_ID) {
				final var deliveryDirectVasuli = wayBillModel.getDirectDeliveryDirectVasuli();

				if(deliveryDirectVasuli != null && deliveryDirectVasuli.getAmountReceivedDate() != null)
					request.setAttribute("DirectDeliveryDirectVasuliDone", deliveryDirectVasuli.getAmountReceivedDate());
			}

			request.setAttribute("DeliveryDebitMemo", wayBillModel.getDeliveryDebitMemo());
			request.setAttribute("InvoiceCertificationSummary", InvoiceCertificationSummaryDao.getInstance().getCertifiedInvoiceSummaryByWayBillId(wayBillId));

			for(final ConsignmentDetails element : consignmentDetailsList) {
				if(!displayBookingCharges)
					element.setAmount(0);

				if(!allowRateInDecimal)
					element.setAmount(Math.round(element.getAmount()));

				element.setPackingTypeName(Utility.checkedNullCondition(element.getPackingTypeName(), (short) 1));
				element.setSaidToContain(Utility.checkedNullCondition(element.getSaidToContain(), (short) 1));
				element.setGoodsClassificationName(GoodsClassificationConstant.getGoodsClassificationName(element.getGoodsClassificationId()));

				if(ObjectUtils.isNotEmpty(packageConditionHM))
					element.setPackageConditionName(Utility.checkedNullCondition(packageConditionHM.get(element.getPackageConditionMasterId()),(short) 1));
			}
			request.setAttribute("packageDetails", consignmentDetailsList);

			final var showBillingPartyGstn	= (boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.SHOW_BILLING_PARTY_GSTN, false);

			if(consignor.getBillingPartyId() > 0) {
				final var corporateColl = CorporateAccountDao.getInstance().getCorporateAccountDetails(Long.toString(consignor.getBillingPartyId()));

				if(corporateColl != null && corporateColl.get(consignor.getBillingPartyId()) != null) {
					consignor.setBillingPartyName(corporateColl.get(consignor.getBillingPartyId()).getName());

					if(showBillingPartyGstn)
						consignor.setBillingPartyGstn(corporateColl.get(consignor.getBillingPartyId()).getGstn());
				} else {
					consignor.setBillingPartyName("--");
					consignor.setBillingPartyGstn("--");
				}
			}

			if(consignee.getPartyMasterId() > 0) {
				final var	corporateAccount = CorporateAccountDao.getInstance().findByCorporateAccountId(consignee.getPartyMasterId());

				if(corporateAccount != null)
					panNumberFromPartyMaster = corporateAccount.getPanNumber();
			}

			if(panNumberFromPartyMaster != null && !"".equals(panNumberFromPartyMaster))
				consineePanNumber	= panNumberFromPartyMaster;

			request.setAttribute("consineePanNumber", consineePanNumber);
			request.setAttribute("BookingCharges", cache.getActiveBookingCharges(request, executive));
			request.setAttribute("DeliveryCharges", cache.getActiveDeliveryCharges(request, executive));

			if(wayBill != null) {
				wayBill.setSourceSubRegionId(srcBranch.getSubRegionId());
				wayBill.setDestinationSubRegionId(destBranch.getSubRegionId());

				if(!displayBookingCharges) {
					wayBill.setAgentCommission(0);
					wayBill.setBookingChargesSum(0);
					wayBill.setBookingTotal(0);
					wayBill.setGrandTotal(0.0);
				}

				if(isShowAmountZero) {
					wayBill.setAgentCommission(0);
					wayBill.setBookingChargesSum(0);
					wayBill.setBookingTotal(0);
					wayBill.setDeliveryTotal(0);
					wayBill.setGrandTotal(0.0);
					wayBill.setDeliveryDiscount(0);
				}
			}

			if ((boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.DUMMY_LR_MODULE_ALLOWED , false))
				isDummyLR	= WayBillDao.getInstance().checkDummyLR(wayBill.getWayBillId(), executive.getAccountGroupId());

			request.setAttribute("isDummyLR", isDummyLR);

			isTokenWiseLR			= WayBillDao.getInstance().checkTokenLR(wayBill.getWayBillId(), executive.getAccountGroupId());
			final var	preLoadingSheetSummary	= PreLoadingSheetSummaryDao.getInstance().getPreLoadingSheetSummaryByWayBillId(wayBill.getWayBillId(), executive.getAccountGroupId());

			if(lrCancelationLockingAfterDay && executive.getExecutiveType() != ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN) {
				final var	diffInDays	= DateTimeUtility.getDayDiffBetweenTwoDates(wayBill.getBookingDateTime(), DateTimeUtility.getCurrentTimeStamp());

				if(diffInDays > dontAllowLrCancelAfterNoOfDays) {
					isAllowToPrint					= true;
					subRegionWiseLimitedPermission	= true;
				}
			}

			if(wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_PARTIAL_DELIVERED || isTokenWiseLR || subRegionWiseLimitedPermission)
				isAllowToEdit	= false;

			if(preLoadingSheetSummary != null)
				isLRinPLSState	= true;

			request.setAttribute("isTokenWiseLR", isTokenWiseLR);

			final var	bookingDetail = WayBillDao.getInstance().getWayBillDetailsByStatus(Long.toString(wayBill.getWayBillId()), WayBillStatusConstant.WAYBILL_STATUS_BOOKED);

			if(bookingDetail != null) {
				tdsAmount = bookingDetail.get(wayBill.getWayBillId()).getTdsAmount();

				if(isAllowToEdit)
					isOperationAllowedAfterCashStmt		= com.iv.utils.Utility.isFunctionAllowed(bookingDetail.get(wayBill.getWayBillId()).getCreationDateTimeStamp(), noOfDays);
			}

			request.setAttribute("IsOperationAllowedAfterCashStmt", isOperationAllowedAfterCashStmt);
			request.setAttribute("tdsAmount", tdsAmount);
			request.setAttribute("IsShowEditLinkAfterCashStatementBackDays", lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.IS_SHOW_EDIT_LINK_AFTER_CASH_STATEMENT_BACK_DAYS, false));

			if(wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DELIVERED) {
				final var	isCRCancellationAllowedAfterCashStmt	= com.iv.utils.Utility.isFunctionAllowed(wayBill.getCreationDateTimeStamp(), noOfDays);
				request.setAttribute("isCRCancellationAllowedAfterCashStmt", isCRCancellationAllowedAfterCashStmt);

				if(wayBill.getBranchId() == executive.getBranchId()) {
					isLRExpAllowedToDestAfterCashStmt	= isCRCancellationAllowedAfterCashStmt;
					request.setAttribute("IsLRExpAllowedToDestAfterCashStmt", isLRExpAllowedToDestAfterCashStmt);
					request.setAttribute("IsLRIncAllowedToDestAfterCashStmt", isLRExpAllowedToDestAfterCashStmt);
				}
			} else if(wayBill.getSourceBranchId() == executive.getBranchId()) {
				request.setAttribute("IsLRExpAllowedToSrcAfterCashStmt", isOperationAllowedAfterCashStmt);
				request.setAttribute("IsLRIncAllowedToSrcAfterCashStmt", isOperationAllowedAfterCashStmt);
			}

			final var	assignedLocationIdList = cache.getAssignedLocationsIdListByLocationIdId(request, executive.getBranchId(), executive.getAccountGroupId());
			request.setAttribute("assignedLocationIdList", assignedLocationIdList);

			if(wayBill.getBookingCrossingAgentId() > 0) {
				final var	agentMaster = CrossingAgentMasterDaoImpl.getInstance().getCrossingAgentDetailsById(wayBill.getBookingCrossingAgentId());

				if(agentMaster != null)
					wayBill.setCrossingAgentName(agentMaster.getName());
			}

			// DeliveryContactDetails code done Here
			request.setAttribute("deliveryContactDetails", deliveryContactDetails);

			if(deliveryContactDetails != null) {
				final var cRByBranch	= (Branch) branchColl.get(Long.toString(deliveryContactDetails.getBranchId()));
				deliveryContactDetails.setConsolidateEWaybillNumber(Utility.checkedNullCondition(deliveryContactDetails.getConsolidateEWaybillNumber(), (short) 1));
				deliveryContactDetails.setCRByBranch(cRByBranch.getName());
				deliveryContactDetails.setCRByBranchAddress(cRByBranch.getAddress());
				deliveryContactDetails.setWayBillTypeId(ObjectUtils.isNotEmpty(wayBill) ? wayBill.getWayBillTypeId() : 0L);

				if(deliveryContactDetails.getVehicleNumberId() > 0)
					deliveryContactDetails.setVehicleNumber(cache.getVehicleNumber(request, executive.getAccountGroupId(), deliveryContactDetails.getVehicleNumberId()).getVehicleNumber());

				if(deliveryContactDetails.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT && deliveryContactDetails.getPaymentType() == PaymentTypeConstant.PAYMENT_TYPE_CASH_ID)
					deliveryContactDetails.setPaymentTypeName(generalConfiguration.getString(GeneralConfigurationPropertiesConstant.CUSTOM_PAYMENT_TYPE_FOR_DELIVERED_TBB_LR_IN_CASH, "Cash"));
				else
					deliveryContactDetails.setPaymentTypeName(PaymentTypeConstant.getPaymentType(deliveryContactDetails.getPaymentType()));

				if(deliveryContactDetails.getPaymentType() == PaymentTypeConstant.PAYMENT_TYPE_CROSSING_CREDIT_ID || (boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.GET_DELIVERY_CROSSING_AGENT_DETAILS_WITHOUT_DELIVERY, false)) {
					final var wayBillCrossing = WayBillCrossingDao.getInstance().getWayBillWiseAgentCrossingDetails(wayBillId);

					if(wayBillCrossing != null) {
						wayBillCrossing.setCrossingWayBillNo(Utility.checkedNullCondition(wayBillCrossing.getCrossingWayBillNo(), (short) 3));
						wayBillCrossing.setCrossingAgentName(Utility.checkedNullCondition(wayBillCrossing.getCrossingAgentName(), (short) 3));
					}

					request.setAttribute("WBWiseAgentCrossingDetails", wayBillCrossing);

					if(wayBillCrossing != null && wayBillCrossing.getCrossingAgentBillId() > 0) {
						isCrossingAgentBillCreate = true;
						final var billClearances = CrossingAgentBillClearanceDAO.getInstance().getCrossingAgentBillClearanceDetailsForView(Long.toString(wayBillCrossing.getCrossingAgentBillId()));

						if(billClearances != null)
							for (final CrossingAgentBillClearance billClearance : billClearances)
								billClearance.setBranchName(((Branch) branchColl.get(Long.toString(billClearance.getBranchId()))).getName());

						request.setAttribute("CrossingAgentBillClearanceDetails", billClearances);
					}
				}
			}

			final var	bookedExecutive = ExecutiveDao.getInstance().findByExecutiveId(wayBill.getExecutiveId());

			var	wbBookingDateTime 		= wayBill.getBookingDateTime();

			if(wayBillHistory != null) {
				wbBookingDateTime = wayBillHistory.getCreationDateTimeStamp();

				if(waybillStatus == WayBillStatusConstant.WAYBILL_STATUS_BOOKED) {
					wayBill.setCreationDateTimeStamp(wayBillHistory.getCreationDateTimeStamp());
					wayBill.setRemark(wayBillHistory.getRemark());
				}
			}

			final var wbBookingDateTimeStr	= DateTimeUtility.getDateFromTimeStampWithAMPM(wbBookingDateTime);

			request.setAttribute("BookingDateTime", wbBookingDateTime);
			request.setAttribute("wbBookingDateTimeStr", wbBookingDateTimeStr);
			request.setAttribute("bookedExecutive", bookedExecutive.getName());

			final var	bookedByExecutive = ExecutiveDao.getInstance().findByExecutiveId(wayBill.getBookedByExecutiveId());
			request.setAttribute("bookedByExecutive", ObjectUtils.isNotEmpty(bookedByExecutive) ? Utility.checkedNullCondition(bookedByExecutive.getName(), (short) 1) : "");

			if(branchTransfer != null)
				request.setAttribute("branchTransfer", branchTransfer);

			request.setAttribute("wayBillCancellation", wayBillCancellation);

			/*Display Booking Charges*/
			displayBookingAmount(request, wayBillCharges, displayBookingCharges, allowRateInDecimal, isShowAmountZero, executive);
			final var	htbookingCount		= (HashMap<Long, WayBillCharges>) request.getAttribute("BookingWayBillCharges");

			final var allowToAddMultipleInvoiceDetail	= groupConfiguration.getBoolean(GroupConfigurationPropertiesConstant.ALLOW_TO_ADD_MULTIPLE_INVOICE_DETAIL, false);
			var allowToEditInvoiceDetails				= allowToAddMultipleInvoiceDetail && execFldPermissionsHM.get(FeildPermissionsConstant.ALLOW_EDIT_LR_INVOICE_DETAILS) != null;
			final var isInsuranceService	= htbookingCount != null && htbookingCount.get((long) BookingChargeConstant.REIMBURSEMENT_OF_INSURANCE_PREMIUM) != null;

			if(isInsuranceService)
				allowToEditInvoiceDetails = false;

			request.setAttribute("allowToEditInvoiceDetails", allowToEditInvoiceDetails);

			final var	discountDetails 	= new DiscountDetails();

			final var	configDiscount		= ConfigDiscountDao.getInstance().getDiscountChargesByWayBillId(wayBill.getWayBillId());
			final var	discountDetailsAL 	= DiscountDetailsDAO.getInstance().getDiscountByWaybillId(wayBill.getWayBillId());

			if(ObjectUtils.isNotEmpty(discountDetailsAL)) {
				discountDetails.setAmount(discountDetailsAL.get(0).getAmount());
				discountDetails.setDiscountType(discountDetailsAL.get(0).getDiscountType());
			}

			request.setAttribute("showConfigDiscountEffect", lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.SHOW_CONFIG_DISCOUNT_EFFECT, false));
			request.setAttribute("removeDisplayDeliveryCharges", lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.REMOVE_DISPLAY_DELIVERY_CHARGES, false));
			request.setAttribute("showWaybillTypeWiseConfigDiscount", Utility.isIdExistInLongList(lrViewConfiguration, LrViewConfigurationPropertiesConstant.SHOW_WAY_BILL_TYPE_WISE_CONFIG_DISCOUNT_EFFECT, wayBill.getWayBillTypeId()));
			request.setAttribute("configDiscount", configDiscount);
			request.setAttribute("discountDetails", discountDetails);
			request.setAttribute("wayBillCharges", wayBillCharges);

			//Get last Godown Details
			final var	godownUnloadDetails = getGodownUnloadDetails(wayBill, lrViewConfiguration);

			request.setAttribute("lastGoDownUnload", godownUnloadDetails);
			request.setAttribute("displayBookingCharges", displayBookingCharges);
			request.setAttribute("isShowAmountZero", isShowAmountZero);
			request.setAttribute("allowRateInDecimal", allowRateInDecimal);

			setTaxDetails(request, wayBillModel, destBranch, srcBranch, executive);

			if ((boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.SHOW_CONSIGNEE_AND_CONSIGNOR_MOBILE_NUMBER_WITH_ASTE_RISK, false)) {
				consignee.setMobileNumber(Utility.showAstrickInNumber(consignee.getMobileNumber(),numberOfDigitToShowAtBeginingOfMobileNumber, numberOfDigitToShowAtTheEndOfMobileNumber));
				consignor.setMobileNumber(Utility.showAstrickInNumber(consignor.getMobileNumber(),numberOfDigitToShowAtBeginingOfMobileNumber, numberOfDigitToShowAtTheEndOfMobileNumber));
			}

			request.setAttribute("consignee", consignee);
			request.setAttribute("consignor", consignor);

			var	isEditBillingPartyAllowed 	= false;
			var showLRIncomeExpenseLink 	= true;

			if(wayBill.getWayBillTypeId() != WayBillTypeConstant.WAYBILL_TYPE_FOC && isBillCreated) {
				branch 	= (Branch) branchColl.get(Long.toString(billColl.getBillBranchId()));
				billColl.setBillBranchName(branch.getName());

				if(billColl.getStatus() == BillClearanceStatusConstant.BILL_CLEARANCE_STATUS_CLEAR_PAYMENT_ID
						|| billColl.getStatus() == BillClearanceStatusConstant.BILL_CLEARANCE_STATUS_NEGOTIATED_ID
						|| billColl.getStatus() == BillClearanceStatusConstant.BILL_CLEARANCE_STATUS_PARTIAL_PAYMENT_ID) {
					showLRIncomeExpenseLink = false;
					isEditBillingPartyAllowed = com.iv.utils.Utility.isFunctionAllowed(billColl.getCreationTimestamp(), noOfDays);
				}

				billColl.setStatusName(BillClearanceStatusConstant.getBillClearanceStatus(billColl.getStatus()));
				billColl.setCreationTimeStampStr(DateTimeUtility.getDateFromTimeStampWithAMPM(billColl.getCreationTimestamp()));

				request.setAttribute("BillObj", billColl);
			}

			var	allowToAddAndViewLRExpense	= (boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.ALLOW_TO_ADD_AND_VIEW_LR_EXPENSE, false);
			var	allowToAddAndViewLRIncome	= (boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.ALLOW_TO_ADD_AND_VIEW_LR_INCOME, false);
			var	updateBookingPaymentMode	= (boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.UPDATE_BOOKING_PAYMENT_MODE, false);
			var	showConsignmentDetails		= (boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.SHOW_CONSIGNMENT_DETAILS, false);
			var	showRemarkDetails			= (boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.SHOW_REMARK_DETAILS, false);

			if(subRegionWiseLimitedPermission) {
				allowToAddAndViewLRExpense 	= false;
				allowToAddAndViewLRIncome 	= false;
				showLRExpenseLink			= false;
				showLRIncomeExpenseLink		= false;
				updateBookingPaymentMode	= false;
				showConsignmentDetails		= false;
				showRemarkDetails			= false;
				showShortCreditPaymentLink	= false;
			}

			if(execFldPermissionsHM.get(FeildPermissionsConstant.ALLOW_PARTIAL_DELIVERY) != null) {
				final var partialDeliveryStockArticleDetails = PartialDeliveryStockArticleDetailsDaoImpl.getInstance().checkForWayBillId(wayBillId);
				request.setAttribute("showPartialConsignmentDetails", partialDeliveryStockArticleDetails != null);
			}

			if((boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.ALLOW_TO_ADD_AND_VIEW_LR_EXPENSE_WHEN_LR_DELIVERED, false) && wayBill.getStatus() != WayBillStatusConstant.WAYBILL_STATUS_DELIVERED)
				allowToAddAndViewLRExpense = false;

			request.setAttribute("allowToAddAndViewLRExpense", allowToAddAndViewLRExpense);
			request.setAttribute("allowToAddAndViewLRIncome", allowToAddAndViewLRIncome);
			request.setAttribute("updateBookingPaymentMode", updateBookingPaymentMode && !doNotAllowToShowEditLinks);
			request.setAttribute("showConsignmentDetails", showConsignmentDetails);
			request.setAttribute("showRemarkDetails", showRemarkDetails);
			request.setAttribute(GroupConfigurationPropertiesConstant.ALLOW_CASH_ON_DELIVERY, groupConfiguration.getBoolean(GroupConfigurationPropertiesConstant.ALLOW_CASH_ON_DELIVERY, false));
			request.setAttribute(LrViewConfigurationPropertiesConstant.SHOW_VEHICLE_LIVE_LOCATION, lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.SHOW_VEHICLE_LIVE_LOCATION, false));
			request.setAttribute("showShortCreditPaymentLink", showShortCreditPaymentLink);
			request.setAttribute(LrViewConfigurationPropertiesConstant.SHOW_IS_VALUATION_CHRG_SELECTED, lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.SHOW_IS_VALUATION_CHRG_SELECTED, false));
			request.setAttribute(LrViewConfigurationPropertiesConstant.SHOW_DOOR_DELIVERY_DISTANCE, lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.SHOW_DOOR_DELIVERY_DISTANCE, false));
			request.setAttribute("isRiskCoverageCheckbox", groupConfiguration.getBoolean(GroupConfigurationPropertiesConstant.CHECKBOX_TO_APPLY_RISK_COVERAGE_ON_DECLARE_VALUE, false));
			request.setAttribute("isInsuranceRateCheckbox", groupConfiguration.getBoolean(GroupConfigurationPropertiesConstant.SHOW_CHECKBOX_AND_INPUT_TO_CAL_INSURANCE_ON_DECLARE_VALUE, false));

			final var	allowToAddLRExpenseAfterCashStatementDays			= (boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.ALLOW_TO_ADD_LR_EXPENSE_AFTER_CASH_STATEMENT_DAYS, false);

			if(wayBill.getStatus() != WayBillStatusConstant.WAYBILL_STATUS_CANCELLED && (executive.getBranchId() == wayBill.getBookingBranchId()
					|| executive.getBranchId() == wayBill.getBranchId())
					&& showLRIncomeExpenseLink && (isLRExpAllowedToDestAfterCashStmt || isOperationAllowedAfterCashStmt || allowToAddLRExpenseAfterCashStatementDays) && isAllowToEdit) {
				showLRExpenseLink	= true;
				request.setAttribute("showLRExpenseLink", showLRExpenseLink);
			}

			if((boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.SHOW_LR_EXP_VIEW_TO_DEST_OR_SRC_BRANCH_OR_GROUPADMIN, false)
					&& wayBill.getSourceBranchId() != executive.getBranchId()
					&& executive.getBranchId() != wayBill.getDestinationBranchId()
					&& executive.getExecutiveType() != ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN)
				showLRExpenseViewLink = false;

			request.setAttribute("showLRExpenseViewLink", showLRExpenseViewLink);

			if(!showLRExpenseLink && !showLRExpenseViewLink)
				allowToAddAndViewLRExpense	= false;

			request.setAttribute(LrViewConfigurationPropertiesConstant.ALLOW_TO_ADD_AND_VIEW_LR_EXPENSE, allowToAddAndViewLRExpense);

			displayUnitPerRate(request, consignmentSummary, consignmentDetailsList, htbookingCount, lrViewConfiguration, executive);
			displayBookingAndDeliveryGSTPaid(request, wayBillTaxTxn, consignmentSummary, deliveryContactDetails, lrViewConfiguration);

			final var	disableEditOptions	= (boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.DISABLE_EDIT_OPTIONS_AFTER_DEFINED_DATE_OF_EVERY_MONTH, false);

			if(disableEditOptions)
				hideEditButton = LRSearchBllImpl.getInstance().checkDateToRemoveEditOptions(wayBill.getBookingDateTime(), lrViewConfiguration);

			final var srcDestRegionIdsForCharges = groupConfiguration.getString(GroupConfigurationPropertiesConstant.SRC_DEST_REGION_IDS_FOR_CHARGES, null);

			if (groupConfiguration.getBoolean(GroupConfigurationPropertiesConstant.APPLY_REGION_TO_REGION_PERCENTAGE_CHARGE_RATE_ON_BOOKING_TOTAL, false)
					&& srcDestRegionIdsForCharges != null) {
				final var longHashMap		= CollectionUtility.getLongWithLongHashMapFromStringArray(srcDestRegionIdsForCharges, Constant.COMMA);

				if(longHashMap.containsKey(srcBranch.getRegionId())) {
					final var regionsList	= longHashMap.get(srcBranch.getRegionId());
					doNotAllowEditOptionBasedOnRegion = regionsList.contains(destBranch.getRegionId());
				}

				if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN)
					doNotAllowEditOptionBasedOnRegion = false;
			}

			if(isAllowToEdit) {
				request.setAttribute("showLRIncomeExpenseLink", showLRIncomeExpenseLink);
				request.setAttribute("IsEditBillingPartyAllowedAfterCashStmt", isEditBillingPartyAllowed);
				request.setAttribute(LrViewConfigurationPropertiesConstant.UPDATE_BOOKING_DATE, lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.UPDATE_BOOKING_DATE,false));

				// WayBill Booking Remark Update
				showWayBillRemarkUpdateLink(request, wayBill, executive, execFldPermissionsHM);
				// WayBill Booking Private Marka Update
				allowToUpdatePrivateMarka(request, wayBill, executive, execFldPermissionsHM);
				// WayBill Form 403 / 402 Update
				showWayBillFormTypeUpdateLink(request, wayBill, executive, execFldPermissionsHM, lrViewConfiguration);
				//WayBill Booking Additional Remark Update
				allowToUpdateAdditionalRemark(request, execFldPermissionsHM);
				updateDivision(request, wayBill, execFldPermissionsHM);

				showEditGodownUpdateLink(request, wayBill, godownUnloadDetails, execFldPermissionsHM, executive);
				// WayBill Declared Value Update
				showWayBillDelcaredValueUpdateLink(request, wayBill, executive, execFldPermissionsHM);
				// WayBill Invoice Number Update

				if(!isInsuranceService && !allowToAddMultipleInvoiceDetail)
					showWayBillInvoiceNoUpdateLink(request, wayBill, executive, execFldPermissionsHM);

				showUpdateOTLRLink(request, wayBill, execFldPermissionsHM);
				showWayBillVehicleTypeUpdateLink(request, wayBill, consignmentSummary, executive, execFldPermissionsHM, groupConfiguration);

				// WayBill Delivery At Update
				showWayBillDeliveryAtUpdateLink(request, wayBill, execFldPermissionsHM, srcBranch, executive, destBranch);

				showWayBillBookingTypeUpdateLink(request, wayBill, isBillCreated, execFldPermissionsHM, srcBranch, lrViewConfiguration, executive, generalConfiguration);

				if(!doNotAllowToShowEditLinks)
					showEditDeliveryPaymentLink(request, wayBill, deliveryContactDetails, execFldPermissionsHM);

				//WayBill Booking With Bill-Estimate Update
				allowToUpdateWithBillEstimate(request, wayBill, srcBranch, execFldPermissionsHM, executive);

				//WayBill Booking Category Type Update
				allowToUpdateCategoryType(request, srcBranch, execFldPermissionsHM, executive);

				//WayBill Booking With Gst Type Update
				allowToUpdateGstType(request, executive, srcBranch, execFldPermissionsHM);

				showEditDeliveryDateLink(request, wayBill, deliveryContactDetails, execFldPermissionsHM, executive);
			}

			//chk for manual delivery sequence
			if(executive.getAccountGroupId() == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_VISHAL_TOURIST)
				//specify the sequenceCounter type for RANGE_INCREMENT(DB check) --- By Prakash
				request.setAttribute("DeliverySequenceCounter", DeliverySequenceCounterDao.getInstance().getDeliverySequenceCounterNextValue(executive.getAccountGroupId(), executive.getBranchId(), DeliverySequenceCounter.DELIVERY_SEQUENCE_MANUAL));

			//Credit Delivery Configuration code Starts
			if(checkReceiveStatusForEdit(wayBill))
				request.setAttribute("creditDelivery", cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_CREDIT_DELIVERY));

			//Door Delivery Configuration code Starts
			isConfigDoorDelivery(request, wayBill, consignmentSummary, execFldPermissionsHM);
			//Door Delivery Configuration code End

			if(wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DISPATCHED
					|| wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_RECEIVED
					|| wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CANCELLED_DELIVERY
					|| wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DUEUNDELIVERED
					|| wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DELIVERED
					|| wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CREDIT_DELIVERED) {
				final var	rcvdSmryData = ReceivedSummaryDao.getInstance().getLuggageDetailsAfterReceive(wayBillId);

				if(rcvdSmryData != null) {
					for (final ReceiveSummaryData element : rcvdSmryData) {
						if(element.getBranchId() > 0)
							branch	= (Branch) branchColl.get(Long.toString(element.getBranchId()));
						else
							branch	= (Branch) branchColl.get(Long.toString(wayBill.getSourceBranchId()));

						element.setBranch(branch.getName());
						element.setSubRegionId(branch.getSubRegionId());

						element.setSubRegion(((SubRegion) subRegionColl.get(element.getSubRegionId())).getName());
						element.setTurNumber(Utility.checkedNullCondition(element.getTurNumber(), (short) 1));
					}

					request.setAttribute("ReceiveSummaryData", rcvdSmryData);
				}
			}

			if(!subRegionWiseLimitedPermission)
				getShortExcessDamageDetails(request, wayBill, executive);

			request.setAttribute("TopayToPaidAmount", 0);

			if(wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_BOOKED && executive.getAccountGroupId() == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_LMT){
				// Check If Income Exists On WayBill
				isIncomeExists  = WayBillIncomeDao.getInstance().getIncomeDetailsByWayBillId(wayBillId, TransportCommonMaster.CHARGE_TYPE_LR);

				// Check If Expense Exists On WayBill
				isExpenseExists = WayBillExpenseDao.getInstance().getExpenseDetailsByWayBillId(wayBillId, TransportCommonMaster.CHARGE_TYPE_LR);
			}

			request.setAttribute("isIncomeExists",  isIncomeExists);
			request.setAttribute("isExpenseExists", isExpenseExists);

			//Receive Single WayBill Calculation
			if(wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DISPATCHED) {
				final var 	dispatchBLL 		= new DispatchBLL();
				final var 	isAccountGroupSame 	= wayBill.getAccountGroupId() == wayBill.getBookedForAccountGroupId();

				final var 	configValue 	= cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_RECEIVABLES_ACCESSIBILITY);
				final var	receiveLocationList 		= cache.getAssignedLocationsIdListByLocationIdId(request, executive.getBranchId(), executive.getAccountGroupId());
				receiveLocationList.add(executive.getBranchId());

				outValObj = dispatchBLL.getDispacthLedgerByWBIdANDWBAccessibilityForTransport(wayBill.getWayBillId(), executive, configValue, isAccountGroupSame, receiveLocationList, branchColl, lrViewConfiguration);

				if(outValObj != null) {
					final var recivablesDispatchLedger = (RecivablesDispatchLedger) outValObj.get(RecivablesDispatchLedger.RECIVABLES_DISPATCH_LEDGER);

					if(recivablesDispatchLedger != null) {
						branch		= cache.getGenericBranchDetailCache(request, recivablesDispatchLedger.getSourceBranchId());
						subRegion 	= branch != null ? (SubRegion) subRegionColl.get(branch.getSubRegionId()) : null;

						recivablesDispatchLedger.setSourceBranch(branch.getName());
						recivablesDispatchLedger.setSourceSubRegionId(branch.getSubRegionId());
						recivablesDispatchLedger.setSourceSubRegion(subRegion != null ? subRegion.getName() : "");

						if(recivablesDispatchLedger.getDestinationBranchId() > 0) {
							branch		= cache.getGenericBranchDetailCache(request, recivablesDispatchLedger.getDestinationBranchId());
							subRegion	= (SubRegion) subRegionColl.get(branch.getSubRegionId());

							recivablesDispatchLedger.setDestinationBranch(branch.getName());
							recivablesDispatchLedger.setDestinationSubRegionId(branch.getSubRegionId());
							recivablesDispatchLedger.setDestinationSubRegion(subRegion != null ? subRegion.getName() : "");
						} else
							recivablesDispatchLedger.setDestinationBranch("");

						var flagToReceive = outValObj.getBoolean("flagToReceive", false);

						if(execFldPermissionsHM.get(FeildPermissionsConstant.RECEIVE_SINGLE_LR) == null)
							flagToReceive	= false;

						final var wayBillModels = DispatchSummaryDao.getInstance().getReceivablesWaybillByDispatchLedger(recivablesDispatchLedger.getDispatchLedgerId());
						request.setAttribute(RecivablesDispatchLedger.RECIVABLES_DISPATCH_LEDGER, recivablesDispatchLedger);
						request.setAttribute("flagToReceive", flagToReceive);
						request.setAttribute("totalWayBillCount", wayBillModels != null ? wayBillModels.length : 0);
						final var receivedLedger = ReceivedLedgerDao.getInstance().getReceivedLedgerId(recivablesDispatchLedger.getDispatchLedgerId());
						request.setAttribute("receivedLedger", receivedLedger);
					}
				}
			}
			//End of Receive Single WayBill Calculation
			//START : Dispatch details for LMT Delivery Print (for Vehicle Number)
			if(wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DELIVERED || (boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.SHOW_VEHICLE_NUMBER_OF_DISPATCH, false) && wayBill.getStatus() != WayBillStatusConstant.WAYBILL_STATUS_BOOKED) {
				final var dispatchBLL = new DispatchBLL();
				final var valObjIn 	= new ValueObject();
				valObjIn.put("waybillid", wayBill.getWayBillId());

				final var valObjOut = dispatchBLL.getOutboundManifestForPrint(valObjIn);

				if(valObjOut != null) {
					final var dispatchLedger = (DispatchLedger[]) valObjOut.get("dispatchLedgers");
					request.setAttribute("dispatchVehicleNumber", dispatchLedger[0].getVehicleNumber());

					if((boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.SHOW_VEHICLE_NUMBER_OF_DISPATCH, false))
						request.setAttribute("lastDispatchVehicleNumber", dispatchLedger[dispatchLedger.length - 1].getVehicleNumber());
				}
			}
			//END : Dispatch details for LMT Delivery Print (for Vehicle Number)

			if(generalConfiguration.getBoolean(GeneralConfiguration.ALLOW_PENDING_AGENT_COMMISSION_BILLING_STOCK_ENTRY, false))
				isAgentBranchComissionBillCreated = AgentCommisionBillingSummaryDao.getInstance().getAgentCommisionBillingDetails(wayBill.getAccountGroupId(), wayBill.getWayBillId());

			if(isAllowToEdit) {
				//For Updating WayBill Source

				if(execFldPermissionsHM != null && execFldPermissionsHM.get(FeildPermissionsConstant.EDIT_LR_SOURCE) != null) {
					if(srcBranch != null && (srcBranch.getStatus() == Branch.BRANCH_DEACTIVE || srcBranch.isMarkForDelete()))
						showWayBillSourceUpdateLink = false;
					else {
						final var	editLrSouceValObj			= new ValueObject();
						editLrSouceValObj.put("wayBill", wayBill);
						editLrSouceValObj.put("sourceBranch", srcBranch);
						editLrSouceValObj.put("noOfDays", noOfDays);
						editLrSouceValObj.put(LrViewConfigurationPropertiesConstant.LR_VIEW_CONFIGURATION_PROPERTY, lrViewConfiguration);

						showWayBillSourceUpdateLink = LRViewScreenBLL.getInstance().showEditLrSourceLink(editLrSouceValObj);
					}

					request.setAttribute("showWayBillSourceUpdateLink", showWayBillSourceUpdateLink);
				}

				final var	updateTransportationMode	= (boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.UPDATE_TRANSPORTATION_MODE, false);

				if(updateTransportationMode) {
					final var	transportationModeValObj	= new ValueObject();

					transportationModeValObj.put("execFldPermissionsHM", execFldPermissionsHM);
					transportationModeValObj.put(Executive.EXECUTIVE, executive);
					transportationModeValObj.put("srcBranch", srcBranch);
					transportationModeValObj.put("wayBill", wayBill);

					request.setAttribute("showUpdateTransportationModeLink", LRViewScreenBLL.getInstance().showUpdateTransportationModeLink(transportationModeValObj));
				}

				//For Updating Way Bill Type Started
				if(!hideEditButton) {
					if(!isLSBillCreated)
						showWayBillTypeUpdateLink(request, wayBill, isBillCreated, execFldPermissionsHM, srcBranch, lrViewConfiguration, deliveryContactDetails, executive);
					//For Updating Way Bill Type End

					//For Edit WayBillCharges Start
					if(!doNotAllowEditOptionBasedOnRegion && !doNotAllowToShowEditLinks && !isLSBillCreated)
						showLRRateEditLink(request, wayBillModel, wayBill, isBillCreated, execFldPermissionsHM, srcBranch, destBranch, executive, drs);
					/**
					 * Show Edit Customer On Transport View Page - Start
					 */
					showEditCustomerLink(request, wayBill, isBillCreated, execFldPermissionsHM, srcBranch, destBranch, executive);
				}

				showEditBillingBranchLink(request, wayBill, isBillCreated, execFldPermissionsHM);

				showEditRecoveryBranchLink(request, consignmentSummary, deliveryContactDetails, wayBill, execFldPermissionsHM,creditWBTxnColl, executive);
				/**
				 * Edit Customer End
				 */
				request.setAttribute("showEditBookingRateLink", execFldPermissionsHM.get(FeildPermissionsConstant.ALLOW_CALCULATE_COMMISSION_ON_DIFF_BOOKING_RATE) != null
						&& WayBillBookingRateBllImpl.getInstance().isCalculateCommissionOnDiffRate(groupConfiguration.getHtData(), wayBill.getWayBillTypeId(), wayBill.getSourceBranchId(), consignmentSummary.getChargeTypeId()));
			}

			final var	partyGstNumberNotFound 	= (boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.SHOW_LR_PRINT_BASED_ON_GSTN, false) && StringUtils.isEmpty(consignor.getGstn()) && StringUtils.isEmpty(consignee.getGstn());
			final var doNotOpenCrPrintInEditLrRate =  wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DELIVERED && (boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.DO_NOT_OPEN_CR_PRINT_IN_EDIT_LR_RATE, false);

			if(isTokenWiseLR || partyGstNumberNotFound || doNotOpenCrPrintInEditLrRate)
				request.setAttribute("doNotPrint", "true" );

			if(!subRegionWiseLimitedPermission) {
				//For Updating WayBill Destination, Calculation Started
				if(!hideEditButton && !doNotAllowEditOptionBasedOnRegion && !isLSBillCreated) {
					showWayBillDestinationUpdateLink(request, wayBill, consignmentSummary, isBillCreated, execFldPermissionsHM, lrViewConfiguration, executive);
					//For Updating WayBill Destination, Calculation End

					//For Edit Consignment Start
					if(!doNotAllowToShowEditLinks)
						showEditConsignmentLinks(request, wayBill, isBillCreated, execFldPermissionsHM, srcBranch, destBranch, lrViewConfiguration, executive);
					//For Edit Consignment , End
				}

				showResendOTPLinkForDeliveryLR(request, wayBill, execFldPermissionsHM, lrViewConfiguration, executive);
			} else
				request.setAttribute("resendOTPLinkForDeliveryLR", false);

			//For Form Number details
			getFormNumber(request, formTypesArr);

			//get STBS details
			getSTBSDetails(request, creditWBTxnColl, lrViewConfiguration);
			//For Edit WayBillCharges Start, End

			//Branch Transfer WayBill Details
			if(checkReceiveStatusForEdit(wayBill)
					|| wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CREDIT_DELIVERED)
				request.setAttribute("BTWB", BranchTransferDao.getInstance().getBranchTransferDetails(wayBill.getWayBillId()));

			request.setAttribute("accountGroup", cache.getAccountGroupById(request, executive.getAccountGroupId()));
			request.setAttribute("branch", branchColl.get(Long.toString(wayBill.getBranchId())));
			request.setAttribute(Executive.EXECUTIVE, executive);

			if(srcBranch != null)
				srcBranch.setSubRegionName(((SubRegion) subRegionColl.get(srcBranch.getSubRegionId())).getName());

			request.setAttribute("srcBranch", srcBranch);
			request.setAttribute("srcSubRegion", subRegionColl.get(wayBill.getSourceSubRegionId()));
			request.setAttribute("destSubRegion", subRegionColl.get(wayBill.getDestinationSubRegionId()));
			request.setAttribute("ddmDetails", drs);

			LocationsMapping 	locationMap 	= null;
			var 				destBranchName	= "";

			if(destBranch != null) {
				subRegion	= (SubRegion) subRegionColl.get(destBranch.getSubRegionId());
				destBranch.setSubRegionName(subRegion.getName());
				destBranch.setSubRegionCode(subRegion.getSubRegionCode());
				locationMap = cache.getActiveLocationMapping(request, executive.getAccountGroupId(), destBranch.getBranchId());

				if(destBranch.getTypeOfLocation() == Branch.TYPE_OF_LOCATION_OPERATIONAL_PLACE)
					if(locationMap != null)
						destBranch.setHandlingBranchName(((Branch) branchColl.get(Long.toString(locationMap.getLocationId()))).getName());
					else {
						final var	valueObjectIn	= new ValueObject();
						valueObjectIn.put(AliasNameConstants.BRANCH_NAME, destBranch.getName());
						error.put("errorCode", CargoErrorList.HANDLING_BRANCH_NAME_ERROR);
						error.put("errorDescription", CargoErrorList.errorDescription(CargoErrorList.HANDLING_BRANCH_NAME_ERROR, valueObjectIn));
						request.setAttribute("cargoError", error);
						request.setAttribute("nextPageToken", "failure");
					}

				if(destBranch.getHandlingBranchName() != null)
					destBranchName	= destBranch.getName() + " ( " + destBranch.getHandlingBranchName() + " ) " + " ( " + destBranch.getSubRegionName() + " )";
				else
					destBranchName	= destBranch.getName() + " ( " + destBranch.getSubRegionName() + " )";
			}

			request.setAttribute("destBranch", destBranch);
			request.setAttribute("destBranchName", destBranchName);
			request.setAttribute("noOfArticle", Integer.toString(wayBillModel.getNoOfArticle()));
			request.setAttribute("noOfPackages", Long.toString(wayBillModel.getNoOfPackages()));

			if(wayBill.isManual())
				wayBill.setWayBillType(WayBillTypeConstant.getWayBillTypeNameByWayBilTypeId(wayBill.getWayBillTypeId()) + WayBillType.WAYBILL_TYPE_MANUAL_2);
			else
				wayBill.setWayBillType(WayBillTypeConstant.getWayBillTypeNameByWayBilTypeId(wayBill.getWayBillTypeId()));

			final var rateConfiguration = cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_RATE_CONFIGURATION);

			if(rateConfiguration == ConfigParam.CONFIG_KEY_VALUE_RATE_CONFIGURATION_MANUAL || rateConfiguration == ConfigParam.CONFIG_KEY_VALUE_RATE_CONFIGURATION_AUTO)
				request.setAttribute("isDisplayable", true);

			if(wayBill.getStatus() != WayBillStatusConstant.WAYBILL_STATUS_DELIVERED
					&& wayBill.getAccountGroupId() == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_LMT)
				request.setAttribute("CustomerEnquiryCount", CustomerEnquiryDao.getInstance().getCustomerEnquiryCount(wayBillId));

			request.setAttribute("reprint", request.getSession().getAttribute("reprint") == null || (Boolean) request.getSession().getAttribute("reprint"));

			request.setAttribute("isRePrint", JSPUtility.GetBoolean(request, "isRePrint",true));

			request.getSession().setAttribute("reprint", true);

			var	actualWeight	= 0D;
			var  chargedWeight	= 0D;
			var  length       	= 0D;
			var  breadth       	= 0D;
			var  height        	= 0D;
			var  quantity      	= 0L;
			final var	pakgMaster    			= new PackingTypeMaster[consignmentDetailsList.length];
			final var	packagesCollection 		= new HashMap<Long, PackagesCollectionDetails>();

			for (var i = 0; i < consignmentDetailsList.length; i++) {
				final var	packageId     = consignmentDetailsList[i].getPackingTypeMasterId();
				pakgMaster[i] = cache.getPackingTypeMasterById(request, packageId);
				actualWeight  += consignmentDetailsList[i].getActualWeight();
				chargedWeight += consignmentDetailsList[i].getChargeWeight();
				length        += consignmentDetailsList[i].getLength();
				breadth       += consignmentDetailsList[i].getBreadth();
				height        += consignmentDetailsList[i].getHeight();
				quantity	  += consignmentDetailsList[i].getQuantity();
			}

			request.setAttribute("packagesCollection", packagesCollection);
			request.setAttribute("pakgMaster", pakgMaster);
			request.setAttribute("actualWeight",  actualWeight);
			request.setAttribute("chargedWeight", chargedWeight+actualWeight);
			request.setAttribute("cft", length + " X " + breadth + " X " + height);
			request.setAttribute("quantity", quantity);

			if (request.getParameter("rp") != null)
				request.setAttribute("rp", JSPUtility.GetInt(request, "rp", 1));

			// Setting delivery charges in case of it is in RECEVIED status.....
			displayDeliveryCharges(request, wayBill, consignmentSummary, consignor, consignmentDetailsList, wbBookingDateTime, bookedExecutive, executive, destBranch, lrViewConfiguration, generateCRConfVal);

			// Setting booking and delivery amount in case of it is in Delivery status.....
			if(wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DELIVERED
					|| wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DUEDELIVERED
					|| wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DUEUNDELIVERED
					|| wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CREDIT_DELIVERED
					|| wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_PARTIAL_DELIVERED
					|| wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CANCEL_PARTIAL_DELIVERED
					|| wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_PARTIAL_DUEDELIVERED
					|| wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_PARTIAL_DUEUNDELIVERED)
				displayBookingAndDeliveryAmount(request, wayBill, wayBillCharges, displayBookingCharges, allowRateInDecimal);

			/* condition for CR Cancellation */
			getFlagForCRCancellation(request, wayBill, deliveryContactDetails, isCrossingAgentBillCreate, creditWBTxnColl, isBillCreated, execFldPermissionsHM, lrViewConfiguration, executive);
			/* condition for CR cancellation ends here */

			setLrAndCrPrintBasedOnCookie(request, wayBill, execFldPermissionsHM, lrViewConfiguration);

			request.setAttribute("wayBill", wayBill);
			request.setAttribute("LoggedInBranchDetails", branchColl.get(Long.toString(executive.getBranchId())));

			// Condition for edit Manual wayBill number stars here
			getFlagForUpdateWayBillManualNumber(request, wayBill, srcBranch, execFldPermissionsHM, executive);

			// Condition for LR Cancellation stars here
			if(!hideEditButton)
				isLRAllowForCancellation(request, wayBill, creditWBTxnColl, isBillCreated, lrViewConfiguration, groupConfiguration, executive);

			//Short Credit Payment (Start)
			getShortCreditPaymentDetails(request, consignmentSummary, deliveryContactDetails, wayBill, minDateTimeStamp, execFldPermissionsHM, executive);
			//Short Credit Payment (End)
			/*Setting for WayBill Update */
			if(request.getParameter("updateDestination") == null || Integer.parseInt(request.getParameter("updateDestination")) != 1){
				if(wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DELIVERED
						|| wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DUEDELIVERED
						|| wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CREDIT_DELIVERED)
					request.setAttribute("nextPageToken", "successDeliveryPrintWayBill_"+executive.getAccountGroupId());

				if(wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CREDIT_DELIVERED)
					request.setAttribute("nextPageToken", "successDDMPrintWayBill_"+executive.getAccountGroupId());
			} else
				request.setAttribute("nextPageToken", "afterUpdateWayBill");

			request.setAttribute("ManualCRDaysAllowed",noOfDays);

			final var dateFormatForTimeLog =new SimpleDateFormat("mm:ss");
			dateFormatForTimeLog.setTimeZone(TimeZone.getTimeZone("GMT"));

			//Get DiscountTypes
			request.setAttribute("discountTypes", DiscountMasterDAO.getInstance().getDiscountTypes());

			if(generalConfiguration != null) {
				var	bookingTimeExcludeChargeIds 		= generalConfiguration.getString(GeneralConfiguration.BookingTimeExcludeChargeIds, null);
				bookingTimeExcludeChargeIds 		= com.platform.utils.Utility.getBookingTimeExcludeChargeIds(bookingTimeExcludeChargeIds);

				if(bookingTimeExcludeChargeIds != null && !bookingTimeExcludeChargeIds.isEmpty())
					wayBillChargeAmountList = WayBillChargeAmountDao.getInstance().getWayBillChargeAmountByWayBillIdAndChargeMasterIds(Long.toString(wayBillId), bookingTimeExcludeChargeIds);
			}

			request.setAttribute("wayBillChargeAmountList", wayBillChargeAmountList);

			deliveryTimePhoto(request, executive, execFldPermissionsHM);

			if(wayBill.getBookingTimeServiceTax() > 0) {
				request.setAttribute("tax1", 0.00);
				request.setAttribute("tax2", 0.00);
			}

			request.setAttribute("truckArrivalDetails", truckArrivalDetails);

			var	wayBillCurrentStatus		= getWayBillCurrentStatusDetails(request, wayBill, godownUnloadDetails, generateCRConfVal, lrViewConfiguration, generalConfiguration);

			if(returnBooking != null && returnBooking.getOriginalWayBillId() > 0 && returnBooking.getNewWayBillId() > 0 && wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DELIVERED) {
				wayBillCurrentStatus = "<span style = 'background-color: #E77072; color: #FFF'> " + WayBillStatusConstant.WAYBILL_STATUS_RETURNED_NAME +  "</span>";
				returnWaybillId 		= returnBooking.getNewWayBillId();
				wayBillReturnBooking    = WayBillDao.getInstance().getByWayBillId(returnBooking.getNewWayBillId());

				if(wayBillReturnBooking != null)
					returnWaybillNumber = wayBillReturnBooking.getWayBillNumber();
			} else if(returnBooking != null && returnBooking.getOldWayBillId() > 0) {
				returnWaybillId 		= returnBooking.getOldWayBillId();
				wayBillReturnBooking    = WayBillDao.getInstance().getByWayBillId(returnBooking.getOldWayBillId());

				if(wayBillReturnBooking != null)
					returnWaybillNumber = wayBillReturnBooking.getWayBillNumber();
			}

			request.setAttribute("wayBillCurrentStatus",wayBillCurrentStatus);
			request.setAttribute("returnWaybillId",returnWaybillId);
			request.setAttribute("returnWaybillNumber",returnWaybillNumber);

			var formTypeStr	= "NA";
			String formTypeIds	= null;

			if(ObjectUtils.isNotEmpty(formTypesArr)) {
				formTypeStr	= Stream.of(formTypesArr).map(FormTypes::getFormTypesName).collect(Collectors.joining(","));
				formTypeIds	= Stream.of(formTypesArr).map(ft -> ft.getFormTypesId() + "").collect(Collectors.joining(","));
			}

			getPODRelatedPermission(request, podConfiguration, podWaybillsDto, wayBill, execFldPermissionsHM);

			if(groupConfiguration.getBoolean(GroupConfigurationPropertiesDTO.SHOW_PAYMENT_REQUIRED_FEILD,false) && !subRegionWiseLimitedPermission) {
				showPaymentRequired	= true;

				showPaymentRequiredLink	= showPaymentRequired && execFldPermissionsHM.get(FeildPermissionsConstant.EDIT_PAYMENT_REQUIRED) != null;
			}

			if(groupConfiguration.getBoolean(GroupConfigurationPropertiesDTO.SHOW_CONSO_EWAYBILL_NO_LINK,false))
				request.setAttribute("showConsoEwaybillLink", true);

			/*
			 * Get Discount Config Related Permissions
			 */
			allowEditConfigDiscount(request, wayBill, execFldPermissionsHM, lrViewConfiguration);

			checkToTakeLRAndCRPrint(request, wayBill, consignor, consignee, creditWBTxnColl, consignmentSummary, deliveryContactDetails, executive);
			checkToTakeLRPdfEmail(request, wayBill, wayBillTypeWiseAllowEmailServices, execFldPermissionsHM);
			getLinkForLRPrint(request, executive, wayBillId, wayBill, consignmentSummary, lrViewConfiguration);
			crossingHireDetails(request, wayBill);
			allowEditVehicleNumber(request, wayBill, groupConfiguration, execFldPermissionsHM, srcBranch, executive);

			request.setAttribute("formTypes", formTypesArr);
			request.setAttribute("wayBillChargesRemark", wayBillChargesRemark);
			request.setAttribute("formTypeStr", formTypeStr);
			request.setAttribute("formTypeIds", formTypeIds);
			request.setAttribute(LrViewConfigurationPropertiesConstant.LR_VIEW_CONFIGURATION_PROPERTY, lrViewConfiguration);
			request.setAttribute("shortReceiveConfig", shortReceiveConfig);
			request.setAttribute("damageReceiveConfig", damageReceiveConfig);
			request.setAttribute("excessReceiveConfig", excessReceiveConfig);
			request.setAttribute("showPaymentRequired", showPaymentRequired);
			request.setAttribute("showPaymentRequiredLink", showPaymentRequiredLink);
			request.setAttribute("allowRateInDecimal", allowRateInDecimal);
			request.setAttribute(LrViewConfigurationPropertiesConstant.SHOW_FRIGHT_UP_TO_DESTINATION, (boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.SHOW_FRIGHT_UP_TO_DESTINATION, false));
			request.setAttribute("roundOffServiceTaxAmount", roundOffServiceTaxAmount);
			request.setAttribute("isAllowToEnterIDProof", IDProofSelectionUtility.isAllowToEnterIDProofDetails(ModuleIdentifierConstant.BOOKING, executive.getAccountGroupId()));
			request.setAttribute("isAllowToEnterDeliveryIDProof", IDProofSelectionUtility.isAllowToEnterIDProofDetails(ModuleIdentifierConstant.GENERATE_CR, executive.getAccountGroupId()));
			request.setAttribute(GenerateCashReceiptDTO.SHOW_DEMURRAGE_CALCULATION, generateCRConfVal.getBoolean(GenerateCashReceiptDTO.SHOW_DEMURRAGE_CALCULATION,false));
			request.setAttribute(GenerateCashReceiptDTO.DELIVERED_TO_NAME_LEBEL, generateCRConfVal.getString(GenerateCashReceiptDTO.DELIVERED_TO_NAME_LEBEL));
			request.setAttribute(GenerateCashReceiptDTO.DELIVERED_TO_PHONE_NUMBER_LEBEL, generateCRConfVal.getString(GenerateCashReceiptDTO.DELIVERED_TO_PHONE_NUMBER_LEBEL));
			request.setAttribute(GroupConfigurationPropertiesConstant.ARTICLE_DETAILS_LEBEL, groupConfiguration.getString(GroupConfigurationPropertiesConstant.ARTICLE_DETAILS_LEBEL));
			request.setAttribute(GroupConfigurationPropertiesConstant.ARTICLE_FEILD_LEBEL, groupConfiguration.getString(GroupConfigurationPropertiesConstant.ARTICLE_FEILD_LEBEL));
			request.setAttribute(GroupConfigurationPropertiesConstant.CHARGE_TYPE_ARTICLE_LEBEL, groupConfiguration.getString(GroupConfigurationPropertiesConstant.CHARGE_TYPE_ARTICLE_LEBEL));
			request.setAttribute(GroupConfigurationPropertiesConstant.SAID_TO_CONTAINS_LEBEL, groupConfiguration.getString(GroupConfigurationPropertiesConstant.SAID_TO_CONTAINS_LEBEL));
			request.setAttribute(GroupConfigurationPropertiesConstant.CONSIGNOR_FEILD_LEBEL, groupConfiguration.getString(GroupConfigurationPropertiesConstant.CONSIGNOR_FEILD_LEBEL));
			request.setAttribute(GroupConfigurationPropertiesConstant.CONSIGNEE_FEILD_LEBEL, groupConfiguration.getString(GroupConfigurationPropertiesConstant.CONSIGNEE_FEILD_LEBEL));
			request.setAttribute(GroupConfigurationPropertiesConstant.ALLOW_CASH_ON_DELIVERY, groupConfiguration.getString(GroupConfigurationPropertiesConstant.ALLOW_CASH_ON_DELIVERY));
			request.setAttribute(GroupConfigurationPropertiesDTO.ALLOW_ROUND_OFF_ON_GRAND_TOTAL,groupConfiguration.getBoolean(GroupConfigurationPropertiesDTO.ALLOW_ROUND_OFF_ON_GRAND_TOTAL,false) );
			request.setAttribute(LrViewConfigurationPropertiesConstant.SHOW_BOOKING_CHARGE_PANEL, (boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.SHOW_BOOKING_CHARGE_PANEL, true));
			request.setAttribute(LrViewConfigurationPropertiesConstant.SHOW_DELIVERY_CHARGE_PANEL, (boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.SHOW_DELIVERY_CHARGE_PANEL, true));

			if(deliveryContactDetails != null)
				getLinkForCRPrint(request, wayBillId, deliveryContactDetails.getCrId(), consignmentSummary, generateCRConfVal, executive);

			checkAccessibilityForDelivery(request, executive, wayBill, execFldPermissionsHM, lrViewConfiguration, drs);
			checkToViewChequeBounceDetails(request, wayBill, executive);

			request.setAttribute("isMoneyReceiptPrintAllowed", moneyReceiptTxn != null && moneyReceiptTxn.getStatus() != MoneyReceiptTxn.MONEY_RECEIPT_STATUS_CANCELLED  && groupConfiguration.getBoolean(GroupConfigurationPropertiesDTO.IS_MONEY_RECEIPT_REQUIRED) && Utility.isIdExistInLongList(groupConfiguration.getHtData(), GroupConfigurationPropertiesConstant.WAY_BILL_TYPE_IDS_FOR_MONEY_RECEIPT, wayBill.getWayBillTypeId()));
			request.setAttribute("isMoneyReceiptPrintAllowedForDelivery", deliveryContactDetails != null && deliveryContactDetails.getMoneyReceiptTxnId() > 0 && generateCRConfVal.getBoolean(GroupConfigurationPropertiesConstant.IS_MONEY_RECEIPT_REQUIRED, false) && Utility.isIdExistInLongList(generateCRConfVal.getHtData(), GenerateCashReceiptDTO.WAY_BILL_TYPE_IDS_FOR_MONEY_RECEIPT, wayBill.getWayBillTypeId()));
			request.setAttribute(LrViewConfigurationPropertiesConstant.ALLOW_INVOICE_CREATION_FOR_PAID_AND_TO_PAY_LR, checkForInvoiceCreation(moneyReceiptTxn, wayBill, executive, deliveryContactDetails, lrViewConfiguration));
			request.setAttribute("allowToResendSms", execFldPermissionsHM.get(FeildPermissionsConstant.SHOW_SMS_RESEND_BUTTON_ON_LR_VIEW) != null);
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}
	}

	private boolean showStockOutStatus(final WayBill wayBill) throws Exception {
		try {
			final var	pendingGoodsUndeliveredStock	= PendingGoodsUndeliveredStockDaoImpl.getInstance().getPendingGoodsUndeliveredStockDetailsByWayBillId(wayBill.getWayBillId());

			return pendingGoodsUndeliveredStock != null;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}

	}

	private void checkToViewChequeBounceDetails(final HttpServletRequest request, final WayBill wayBill, final Executive executive) throws Exception {
		var							showChequeBounceDetailLink				= false;

		try {
			if(wayBill != null && wayBill.getWayBillId() > 0) {
				final var	chequeBounceModel		= new ChequeBounceModel();

				chequeBounceModel.setWayBillId(wayBill.getWayBillId());
				chequeBounceModel.setAccountGroupId(executive.getAccountGroupId());

				final var	lrChequeBounceDetailList	= ChequeBounceDaoImpl.getInstance().getBookingChequeBounceDetailsByWayBillId(chequeBounceModel);
				showChequeBounceDetailLink 	= lrChequeBounceDetailList != null && !lrChequeBounceDetailList.isEmpty();

				if(!showChequeBounceDetailLink) {
					final var	crChequeBounceDetailList	= ChequeBounceDaoImpl.getInstance().getDeliveryChequeBounceDetailsByWayBillId(chequeBounceModel);
					showChequeBounceDetailLink 	= crChequeBounceDetailList != null && !crChequeBounceDetailList.isEmpty();
				}

				if(!showChequeBounceDetailLink) {
					final var 	shortCreditChequeBounceDetailList	= ChequeBounceDaoImpl.getInstance().getShortCreditChequeBounceDetailsByWayBillId(chequeBounceModel);
					showChequeBounceDetailLink 			= shortCreditChequeBounceDetailList != null && !shortCreditChequeBounceDetailList.isEmpty();
				}
			}

			request.setAttribute("showChequeBounceDetailLink", showChequeBounceDetailLink);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private void setLrAndCrPrintBasedOnCookie(final HttpServletRequest request, final WayBill wayBill, final HashMap<Long, ExecutiveFeildPermissionDTO> execFldPermissionsHM, final Map<Object, Object> lrViewConfiguration) throws Exception {
		Cookie[] 		cookies 						= null;
		var 			showLRPrintBasedOnCookies 		= true;
		var 			showCRPrintBasedOnCookies 		= true;

		try {
			if ((boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.SHOW_LR_PRINT_BASED_ON_COOKIES , false)) {
				showLRPrintBasedOnCookies	= false;
				// Get an array of Cookies associated with this domain
				cookies = request.getCookies();

				if (cookies != null)
					for (final Cookie cookie2 : cookies)
						if (StringUtils.equalsIgnoreCase("LR_" + wayBill.getWayBillId(), cookie2.getName())
								|| StringUtils.equalsIgnoreCase(Long.toString(wayBill.getWayBillId()) + "lr", cookie2.getValue())) {
							final var 	s 				= "" + cookie2.getValue();
							final var 	times 			= s.split("_");
							final var 	time1 			= Long.parseLong(times[0]);
							final var 	time2 			= Long.parseLong(times[1]);
							final var 	lCDateTime 		= Calendar.getInstance();
							final var 	machineTime 	= lCDateTime.getTimeInMillis();

							if (time1 < machineTime && machineTime < time2) {
								showLRPrintBasedOnCookies	= true;
								break;
							}
						}
			}

			if ((boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.SHOW_CR_PRINT_BASED_ON_COOKIES , false)) {
				showCRPrintBasedOnCookies	= false;
				// Get an array of Cookies associated with this domain
				cookies = request.getCookies();

				if( cookies != null )
					for (final Cookie cookie2 : cookies)
						if(StringUtils.equalsIgnoreCase("CR_" + wayBill.getWayBillId(), cookie2.getName())
								|| StringUtils.equalsIgnoreCase(Long.toString(wayBill.getWayBillId()) + "cr", cookie2.getValue()))
						{
							final var 	s			= "" + cookie2.getValue();
							final var 	times		= s.split("_");
							final var 	time1		= Long.parseLong(times[0]);
							final var 	time2		= Long.parseLong(times[1]);
							final var 	lCDateTime 	= Calendar.getInstance();
							final var 	machineTime	= lCDateTime.getTimeInMillis();

							showCRPrintBasedOnCookies	= time1 < machineTime && machineTime<time2;
						}
			}

			if(execFldPermissionsHM != null && execFldPermissionsHM.get(FeildPermissionsConstant.BOOKING_LR_PRINT_AFTER_DISPATCH) != null)
				showLRPrintBasedOnCookies = true;

			if(execFldPermissionsHM != null && execFldPermissionsHM.get(FeildPermissionsConstant.CR_PRINT_ON_COOKIE) != null)
				showCRPrintBasedOnCookies = true;

			request.setAttribute("showLRPrintBasedOnCookies", showLRPrintBasedOnCookies);
			request.setAttribute("showCRPrintBasedOnCookies", showCRPrintBasedOnCookies);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private void getFlagForUpdateWayBillManualNumber(final HttpServletRequest request, final WayBill wayBill, final Branch srcBranch, final HashMap<Long, ExecutiveFeildPermissionDTO> execFldPermissionsHM, final Executive executive) throws Exception {
		var 	isEditManualWayBillNumberAllowed 	= false;

		try {
			if(wayBill.getStatus() != WayBillStatusConstant.WAYBILL_STATUS_DELIVERED
					&& wayBill.getStatus() != WayBillStatusConstant.WAYBILL_STATUS_CANCELLED && wayBill.isManual()
					&& execFldPermissionsHM.get(FeildPermissionsConstant.EDIT_MANUAL_WAYBILL_NUMBER) != null)
			{
				isEditManualWayBillNumberAllowed = isOperationAllowedForExecutive(request, srcBranch, executive);

				if(wayBill.getBookingCrossingAgentId() > 0)
					isEditManualWayBillNumberAllowed = false;
			}

			if(!Boolean.parseBoolean(request.getAttribute("IsOperationAllowedAfterCashStmt").toString()))
				isEditManualWayBillNumberAllowed = false;

			request.setAttribute("isEditManualWayBillNumberAllowed", isEditManualWayBillNumberAllowed);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private boolean isBillCreated(final BillSummary billColl, final WayBill wayBill) {
		if(billColl != null)
			wayBill.setWayBillBillId(billColl.getBillId());

		return billColl != null ;
	}

	private void isLRAllowForCancellation(final HttpServletRequest request, final WayBill wayBill, final HashMap<Short, CreditWayBillTxn> creditWBColl, final boolean isBillCreated, final Map<Object, Object> lrViewConfiguration,
			final ValueObject groupConfiguration, final Executive executive) throws Exception {
		var						isLRAllowForCancellation				= true;
		var						isDummyLR								= false;
		String					messageToCancelLR						= null;

		try {
			final var	execFldPermissionsHM		= cache.getExecutiveFieldPermission(request);
			final var	isIncomeExists				= (boolean) request.getAttribute("isIncomeExists");
			final var	isExpenseExists				= (boolean) request.getAttribute("isExpenseExists");

			if(creditWBColl != null) {
				var	crdtWbTxnPymtDtls = creditWBColl.get(CreditWayBillTxn.TXN_TYPE_BOOKING_ID);

				if(checkShortCreditPaymentStatusForEditLRRate(crdtWbTxnPymtDtls))
					isLRAllowForCancellation	= false;

				crdtWbTxnPymtDtls = creditWBColl.get(CreditWayBillTxn.TXN_TYPE_DELIVERY_ID);

				if(checkShortCreditPaymentStatusForEditLRRate(crdtWbTxnPymtDtls))
					isLRAllowForCancellation	= false;
			}

			if (request.getAttribute("isDummyLR") != null)
				isDummyLR		= Boolean.parseBoolean(request.getAttribute("isDummyLR").toString());

			final var assignedLocationIdList = cache.getAssignedLocationsIdListByLocationIdId(request, executive.getBranchId(), executive.getAccountGroupId());

			final var lrCancelledLockingInCashStatementConfig	= (boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.LR_CANCELLED_LOCKING_IN_CASH_STATEMENT_CONFIG, false);
			final var isOperationAllowedAfterCashStmt			= Boolean.parseBoolean(request.getAttribute("IsOperationAllowedAfterCashStmt").toString());
			final var lrCancelationLockingAfterDay 				= (boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.LR_CANCELATION_LOCKING_AFTER_DAY, false);
			final var dontAllowLrCancelAfterNoOfDays 			= (int) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.DONT_ALLOW_LR_CANCEL_AFTER_NO_OF_DAYS, 0);

			final var	allowLrCancelation = (boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.ALLOW_TO_CANCEL_LR_AFTER_DISPATCH_AND_RECEIVE, false) && execFldPermissionsHM.get(FeildPermissionsConstant.ALLOW_TO_CANCEL_LR_AFTER_DISPATCH_AND_RECEIVE) != null
					&& executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN
					&& (wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DISPATCHED || wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_RECEIVED)
					&& !isBillCreated && !isDummyLR;

			final var isAllowCancelLrAndBill = wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_BOOKED
					&& wayBill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID;

			if(!isBillCreated && wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_BOOKED && isLRAllowForCancellation && !isDummyLR || allowLrCancelation || isAllowCancelLrAndBill)
				isLRAllowForCancellation	= execFldPermissionsHM.get(FeildPermissionsConstant.WAYBILL_CANCELLATION) != null
				&& (executive.getBranchId() == wayBill.getSourceBranchId() || executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN
				&& groupConfiguration.getBoolean(GroupConfigurationPropertiesDTO.CENTRALIZED_CANCELLATION, false)
				|| assignedLocationIdList != null && assignedLocationIdList.contains(wayBill.getSourceBranchId()))
				|| allowLrCancelation
				|| execFldPermissionsHM.get(FeildPermissionsConstant.WAYBILL_CANCELLATION) != null && assignedLocationIdList != null && assignedLocationIdList.contains(wayBill.getSourceBranchId()) ;
			else
				isLRAllowForCancellation	= false;

			if(lrCancelledLockingInCashStatementConfig && isLRAllowForCancellation)
				isLRAllowForCancellation = isOperationAllowedAfterCashStmt;

			if(isIncomeExists || isExpenseExists)
				isLRAllowForCancellation = false;

			if(isLRAllowForCancellation && (boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.ALLOW_TIME_FOR_LR_CANCELLATION, false)) {
				final var hoursObj = DateTimeUtility.getDayDiffBetweenTwoDatesInHoursAndMinutes(wayBill.getActualBookingDateTime(), DateTimeUtility.getCurrentTimeStamp());
				final var diffHours  		= hoursObj.getLong("diffHours", 0);
				final var diffMinutes  		= hoursObj.getLong("diffMinutes", 0);
				final var hourTimeForLRCancellation		= (int) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.HOURS_TIME_FOR_LR_CANCELLATION, 0);
				final var minutesTimeForLrCancellation	= (int) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.MINUTES_TIME_FOR_LR_CANCELLATION, 0);

				if(diffHours > hourTimeForLRCancellation && hourTimeForLRCancellation > 0) {
					isLRAllowForCancellation = false;
					messageToCancelLR = "LR Cancellation is not allowed for " + hourTimeForLRCancellation + " hours old LR";
				}

				if(diffMinutes > minutesTimeForLrCancellation && minutesTimeForLrCancellation > 0 && executive.getExecutiveType() != ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN) {
					isLRAllowForCancellation = false;
					messageToCancelLR = "You Can Not Cancel LR After " + minutesTimeForLrCancellation + " Miuntes of Booking. So, Please Contact Admin";
				}
			}

			if(lrCancelationLockingAfterDay && executive.getExecutiveType() != ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN) {
				final var diffInDays	= DateTimeUtility.getDayDiffBetweenTwoDates(wayBill.getBookingDateTime(), DateTimeUtility.getCurrentTimeStamp());
				final var branchIdList 	= CollectionUtility.getLongListFromString((String) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.BRANCHES_FOR_NOT_ALLOW_LR_CANCELLATION, ""));

				if(diffInDays > dontAllowLrCancelAfterNoOfDays && (ObjectUtils.isEmpty(branchIdList) || branchIdList.contains(executive.getBranchId()))) {
					isLRAllowForCancellation	= false;
					messageToCancelLR 	= "LR Cancellation is not allowed for " + diffInDays + " day old LR";
				}
			}

			if((boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.ALLOW_ONLY_ADMIN_TO_CANCEL_PAID_LR, false)
					&& executive.getExecutiveType() != ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN)
				isLRAllowForCancellation = wayBill.getWayBillTypeId() != WayBillTypeConstant.WAYBILL_TYPE_PAID;

			final var doorPickupDetailStatus = DoorPickupDetailsDaoImpl.getInstance().getDoorPickupStatusByWaybillId(wayBill.getWayBillId());

			if (doorPickupDetailStatus == PickupLsReceive.PICKUP_LS_DISPATCH_STATUS && wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_BOOKED)
				isLRAllowForCancellation = false;

			request.setAttribute("isLRAllowForCancellation", isLRAllowForCancellation);
			request.setAttribute("messageToCancelLR", messageToCancelLR);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private void getShortCreditPaymentExtraDetails(final HttpServletRequest request, final HashMap<Short, CreditWayBillTxn> creditWBTxnColl, final WayBillModel wayBillModel, final boolean isNewSTBSPaymentScreen, final Executive executive) throws Exception {
		String					panNumber						= null;
		var						totalTDSAmount					= 0.0;

		try {
			if(isNewSTBSPaymentScreen) {
				final var shrtCredtIds = creditWBTxnColl.values().stream().map(e -> Long.toString(e.getShortCreditLedgerId())).collect(Collectors.joining(Constant.COMMA));

				final var shortCreditList = ShortCreditCollectionSheetSettlementDaoImpl.getInstance().getShortCreditBillDetailsByWhereClause(getWhereClauseForSTBSBill(executive.getAccountGroupId(), shrtCredtIds));

				if(ObjectUtils.isNotEmpty(shortCreditList)){
					final var shortCreditBillHm	  =  shortCreditList.stream().collect(Collectors.toMap(ShortCreditCollectionBillClearanceDto::getShortCreditCollectionLedgerId, Function.identity(), (e1, e2) -> e1));

					for(final Map.Entry<Short, CreditWayBillTxn> entry : creditWBTxnColl.entrySet()) {
						final var model 			= entry.getValue();
						final var shortCreditModel	= shortCreditBillHm.getOrDefault(model.getShortCreditLedgerId(), null);

						if(shortCreditModel != null)
							model.setPaymentStatus(shortCreditModel.getPaymentStatus());
					}
				}
			}

			var	crdtWbTxn = creditWBTxnColl.get(CreditWayBillTxn.TXN_TYPE_BOOKING_ID);

			final var	creditWayBillTxnCleranceSummArr	= wayBillModel.getCreditWayBillTxnCleranceSummArr();
			final var	wayBill 						= wayBillModel.getWayBill();
			final var	deliveryContactDetails 			= wayBillModel.getDeliveryContactDetails();

			if(crdtWbTxn != null) {
				if(crdtWbTxn.getCollectionPersonId() > 0 )
					request.setAttribute("CollectionPersonBKG", CollectionPersonMasterDao.getInstance().getCollectionPersonDetailsById(crdtWbTxn.getCollectionPersonId()));

				final var	branch = (Branch) branchColl.get(Long.toString(crdtWbTxn.getReceivedByBranchId()));
				crdtWbTxn.setBranchName(branch != null ? branch.getName() : "");
				crdtWbTxn.setPaymentStatusName(Bill.getBillClearanceStatusName(crdtWbTxn.getPaymentStatus()));
				crdtWbTxn.setWayBillTypeId(wayBill.getWayBillTypeId());

				if(crdtWbTxn.getRecoveryBranchId() > 0) {
					final var	recoveryBranch = (Branch) branchColl.get(Long.toString(crdtWbTxn.getRecoveryBranchId()));
					crdtWbTxn.setRecoveryBranchName(recoveryBranch != null ? recoveryBranch.getName() : "");
				}

				if(creditWayBillTxnCleranceSummArr != null) {
					totalTDSAmount = creditWayBillTxnCleranceSummArr.stream().map(CreditWayBillTxnCleranceSummary::getTdsAmount).mapToDouble(Double::doubleValue).sum();
					panNumber = getPanNumber(creditWayBillTxnCleranceSummArr, crdtWbTxn.getCreditWayBillTxnId());
				}

				if(panNumber != null)
					request.setAttribute(AliasNameConstants.BOOKING_TIME_PANNUMBER, panNumber);
			}

			crdtWbTxn = creditWBTxnColl.get(CreditWayBillTxn.TXN_TYPE_DELIVERY_ID);

			if(crdtWbTxn != null) {
				if(crdtWbTxn.getCollectionPersonId() > 0)
					request.setAttribute("CollectionPersonDLY", CollectionPersonMasterDao.getInstance().getCollectionPersonDetailsById(crdtWbTxn.getCollectionPersonId()));

				final var	branch = (Branch) branchColl.get(Long.toString(crdtWbTxn.getReceivedByBranchId()));
				crdtWbTxn.setBranchName(branch != null ? branch.getName() : "");
				crdtWbTxn.setPaymentStatusName(Bill.getBillClearanceStatusName(crdtWbTxn.getPaymentStatus()));
				crdtWbTxn.setWayBillTypeId(wayBill.getWayBillTypeId());

				if(crdtWbTxn.getRecoveryBranchId() > 0) {
					final var	recoveryBranch = (Branch) branchColl.get(Long.toString(crdtWbTxn.getRecoveryBranchId()));
					crdtWbTxn.setRecoveryBranchName(recoveryBranch != null ? recoveryBranch.getName() : "");
				}

				if(creditWayBillTxnCleranceSummArr != null) {
					totalTDSAmount = creditWayBillTxnCleranceSummArr.stream().map(CreditWayBillTxnCleranceSummary::getTdsAmount).mapToDouble(Double::doubleValue).sum();
					panNumber = getPanNumber(creditWayBillTxnCleranceSummArr, crdtWbTxn.getCreditWayBillTxnId());
				}

				if(panNumber != null)
					request.setAttribute(AliasNameConstants.DELIVERY_TIME_PANNUMBER, panNumber);
			}

			request.setAttribute("CreditWayBillTxnForPaymentDetails", crdtWbTxn);

			if(creditWayBillTxnCleranceSummArr != null) {
				for (final CreditWayBillTxnCleranceSummary element : creditWayBillTxnCleranceSummArr) {
					final var	branch = (Branch) branchColl.get(Long.toString(element.getReceivedByBranchId()));
					element.setBranchName(branch != null ? branch.getName() : "");
					element.setPaymentStatusName(Bill.getBillClearanceStatusName(element.getPaymentStatus()));
					element.setExecutiveName(ExecutiveDao.getInstance().getExecutiveMasterById(element.getReceivedByExecutiveId()).getName());
				}

				request.setAttribute("CreditWayBillTxnForPaymentDetailsArr", creditWayBillTxnCleranceSummArr);
			}

			// show TDS Amount On View LR Screen
			if(wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DELIVERED || wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_PARTIAL_DELIVERED
					|| wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_PARTIAL_DUEDELIVERED || wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_PARTIAL_DUEUNDELIVERED)
				getDeliveryTimeTDSDetails(request, deliveryContactDetails, totalTDSAmount, panNumber);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private void getDeliveryTimeTDSDetails(final HttpServletRequest request, final DeliveryContactDetails deliveryContactDetails, final double totalTDSAmount, final String panNumber) throws Exception  {
		TDSTxnDetails		 	tdsTxnDetails					= null;

		if(deliveryContactDetails != null && deliveryContactDetails.getDeliveryContactDetailsId() > 0) {
			tdsTxnDetails	= TDSTxnDetailsDAO.getInstance().getTDSTxnDetails(TDSTxnDetailsIdentifiers.TDSTXNDETAILS_IDENTIFIER_DELIVERY_CONTACT_DETAILS, deliveryContactDetails.getDeliveryContactDetailsId());

			if(tdsTxnDetails != null)
				request.setAttribute("tdsTxnDetails", tdsTxnDetails);
		}

		if(tdsTxnDetails == null && totalTDSAmount > 0)
			request.setAttribute(AliasNameConstants.DELIVERY_TIME_TDS_AMOUNT, totalTDSAmount);

		if(panNumber == null && tdsTxnDetails != null && tdsTxnDetails.getPanNumber() != null)
			request.setAttribute(AliasNameConstants.DELIVERY_TIME_PANNUMBER, tdsTxnDetails.getPanNumber());
	}

	private void getSTBSDetails(final HttpServletRequest request, final HashMap<Short, CreditWayBillTxn> creditWBTxnColl, final Map<Object, Object> lrViewConfiguration) throws Exception {
		try {
			if(creditWBTxnColl != null) {
				var	creditWBTxn = creditWBTxnColl.get(CreditWayBillTxn.TXN_TYPE_BOOKING_ID);

				if(creditWBTxn != null && creditWBTxn.getShortCreditLedgerId() != 0)
					setBookingShortCreditDetails(request, creditWBTxn, lrViewConfiguration);

				creditWBTxn = creditWBTxnColl.get(CreditWayBillTxn.TXN_TYPE_DELIVERY_ID);

				if(creditWBTxn != null && creditWBTxn.getShortCreditLedgerId() != 0)
					setDeliveryShortCreditDetails(request, creditWBTxn, lrViewConfiguration);
			}
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private void setBookingShortCreditDetails(final HttpServletRequest request, final CreditWayBillTxn creditWBTxn, final Map<Object, Object> lrViewConfiguration) throws Exception {
		final var	shortCreditLedgDto = ShortCreditCollectionSheetLedgerDao.getInstance().getShortCreditLedgerDataForPrint(creditWBTxn.getShortCreditLedgerId());

		if (shortCreditLedgDto == null)
			return;

		request.setAttribute("shortCreditLedgerNumber", shortCreditLedgDto.getBillNumber());

		final var	stbsBranch1  = (Branch) branchColl.get(Long.toString(shortCreditLedgDto.getBillBranchId()));

		if(stbsBranch1 != null)
			request.setAttribute("ShortCredBillBranch1", stbsBranch1.getName());

		var isEditRateAndConsignmentNotAllowAfterSTBS			= false;

		if(creditWBTxn.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID)
			isEditRateAndConsignmentNotAllowAfterSTBS = (boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.IS_EDIT_RATE_AND_CONSIGNMENT_NOT_ALLOW_AFTER_STBS, false);

		request.setAttribute("isEditRateAndConsignmentNotAllowAfterSTBS", isEditRateAndConsignmentNotAllowAfterSTBS);
	}

	private void setDeliveryShortCreditDetails(final HttpServletRequest request, final CreditWayBillTxn creditWBTxn, final Map<Object, Object> lrViewConfiguration) throws Exception {
		final var	shortCreditLedgDto = ShortCreditCollectionSheetLedgerDao.getInstance().getShortCreditLedgerDataForPrint(creditWBTxn.getShortCreditLedgerId());

		if (shortCreditLedgDto == null)
			return;

		request.setAttribute("ShortCredBillNumber", shortCreditLedgDto.getBillNumber());

		final var	stbsBranch1  = (Branch) branchColl.get(Long.toString(shortCreditLedgDto.getBillBranchId()));

		if(stbsBranch1 != null)
			request.setAttribute("ShortCredBillBranch", stbsBranch1.getName());

		var isEditRateAndConsignmentNotAllowAfterSTBS			= false;

		if(creditWBTxn.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY)
			isEditRateAndConsignmentNotAllowAfterSTBS = (boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.IS_EDIT_RATE_AND_CONSIGNMENT_NOT_ALLOW_AFTER_STBS,false);

		request.setAttribute("isEditRateAndConsignmentNotAllowAfterSTBS", isEditRateAndConsignmentNotAllowAfterSTBS);
	}

	private boolean checkUserForEditConsignment(final WayBill wayBill, final Executive executive, final Branch destBranch, final Branch srcBranch, final Branch loginBranch, final Map<Object, Object> lrViewConfiguration) {
		return executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN
				|| wayBill.getBookingBranchId() == executive.getBranchId()
				|| destBranch.getSubRegionId() == executive.getSubRegionId() && executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_SUBREGIONADMIN
				|| srcBranch.getSubRegionId() == executive.getSubRegionId() && executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_SUBREGIONADMIN
				|| destBranch.getRegionId() == executive.getRegionId() && executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_REGIONADMIN
				|| srcBranch.getRegionId() == executive.getRegionId() && executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_REGIONADMIN
				|| destBranch.getBranchId() == executive.getBranchId()
				|| (boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.ALLOW_TO_EDIT_CONSIGNMENT_FOR_CROSSING_BRANCH, false)
				&& loginBranch.isCrossingHub() && wayBill.getBranchId() == executive.getBranchId();
	}

	private boolean checkLRStatusWithPermissionForEditConsignment(final WayBill wayBill, final HashMap<Long, ExecutiveFeildPermissionDTO> execFldPermissionsHM) {
		return wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_BOOKED && execFldPermissionsHM.get(FeildPermissionsConstant.EDIT_CONSIGNMENT) != null
				|| wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DISPATCHED && execFldPermissionsHM.get(FeildPermissionsConstant.EDIT_CONSIGNMENT_AFTER_DISPATCH) != null
				|| wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_RECEIVED && execFldPermissionsHM.get(FeildPermissionsConstant.EDIT_CONSIGNMENT_AFTER_RECEIVE) != null
				|| wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DUEDELIVERED && execFldPermissionsHM.get(FeildPermissionsConstant.EDIT_CONSIGNMENT_AFTER_DDM_DUEDELIVERED) != null
				|| wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DUEUNDELIVERED && execFldPermissionsHM.get(FeildPermissionsConstant.EDIT_CONSIGNMENT_AFTER_DDM_DUEUNDELIVERED) != null
				|| wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CANCELLED_DELIVERY && execFldPermissionsHM.get(FeildPermissionsConstant.EDIT_CONSIGNMENT_AFTER_CANCELED_DELIVERY) != null;
	}

	private void showEditConsignmentLinks(final HttpServletRequest request, final WayBill wayBill, final boolean isBillCreated, final HashMap<Long, ExecutiveFeildPermissionDTO> execFldPermissionsHM, final Branch srcBranch, final Branch destBranch,
			final Map<Object, Object> lrViewConfiguration, final Executive executive) throws Exception {
		try {
			final var	loginBranch   		= cache.getGenericBranchDetailCache(request, executive.getBranchId());

			var	showConsignmentEditLink = checkUserForEditConsignment(wayBill, executive, destBranch, srcBranch, loginBranch, lrViewConfiguration)
					&& checkLRStatusWithPermissionForEditConsignment(wayBill, execFldPermissionsHM);

			if((boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.ALLOW_TO_EDIT_CONSIGNMENT_FOR_TBB_AFTER_DELIVERY, false)
					&& wayBill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT
					&& wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DELIVERED
					&& execFldPermissionsHM.get(FeildPermissionsConstant.EDIT_CONSIGNMENT) != null)
				showConsignmentEditLink = true;

			final var showUpdateConsignmentLinkAfterAgentCommissionDone 	= (boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.SHOW_UPDATE_CONSIGNMENT_LINK_AFTER_AGENT_COMMISSION_DONE, false);
			final var partyAgentCommissionExist 							= PartyAgentCommissionModuleDao.getInstance().CheckForPartyAgentCommissionExist(wayBill.getAccountGroupId(), wayBill.getWayBillId());

			if(isBillCreated || isLRinPLSState || !showUpdateConsignmentLinkAfterAgentCommissionDone && partyAgentCommissionExist
					|| isAgentBranchComissionBillCreated)
				showConsignmentEditLink = false;

			request.setAttribute("showConsignmentEditLink", showConsignmentEditLink);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private boolean checkUserForEditCustomer(final WayBill wayBill, final Executive executive, final Branch srcBranch, final Branch destBranch) {
		return executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN
				|| wayBill.getBookingBranchId() == executive.getBranchId()
				|| destBranch.getSubRegionId() == executive.getSubRegionId() && executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_SUBREGIONADMIN
				|| srcBranch.getSubRegionId() == executive.getSubRegionId() && executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_SUBREGIONADMIN
				|| destBranch.getRegionId() == executive.getRegionId() && executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_REGIONADMIN
				|| srcBranch.getRegionId() == executive.getRegionId() && executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_REGIONADMIN
				|| destBranch.getBranchId() == executive.getBranchId();
	}

	private boolean checkReceiveStatusForEdit(final WayBill wayBill) {
		return wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_RECEIVED
				|| wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CANCELLED_DELIVERY
				|| wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DUEDELIVERED
				|| wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DUEUNDELIVERED;
	}

	private boolean checkLRStatusWithPermissionForEditCustomer(final WayBill wayBill, final HashMap<Long, ExecutiveFeildPermissionDTO> execFldPermissionsHM) {
		return wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_BOOKED && execFldPermissionsHM.get(FeildPermissionsConstant.EDIT_CUSTOMER_AFTER_BOOKING) != null
				|| wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DISPATCHED && execFldPermissionsHM.get(FeildPermissionsConstant.EDIT_CUSTOMER_AFTER_DISPATCH) != null
				|| checkReceiveStatusForEdit(wayBill) && execFldPermissionsHM.get(FeildPermissionsConstant.EDIT_CUSTOMER_AFTER_RECEIVE) != null
				|| wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CANCELLED_DELIVERY && execFldPermissionsHM.get(FeildPermissionsConstant.EDIT_CUSTOMER_AFTER_CANCELLED_DELIVERY) != null
				|| wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_ARRIVED && execFldPermissionsHM.get(FeildPermissionsConstant.EDIT_CUSTOMER_AFTER_ARRIVE) != null;
	}

	private boolean isCashStatementEntryAllowed(final HttpServletRequest request) {
		return request.getAttribute("IsOperationAllowedAfterCashStmt") != null && (boolean) request.getAttribute("IsOperationAllowedAfterCashStmt")
				|| request.getAttribute("IsShowEditLinkAfterCashStatementBackDays") != null && (boolean) request.getAttribute("IsShowEditLinkAfterCashStatementBackDays");
	}

	private void showEditCustomerLink(final HttpServletRequest request, final WayBill wayBill, final boolean isBillCreated, final HashMap<Long, ExecutiveFeildPermissionDTO> execFldPermissionsHM, final Branch srcBranch, final Branch destBranch, final Executive executive) throws Exception {
		var 			showEditCustomerLink		= false;
		var 			showTBBCustUpdateLink 		= false;
		var 			showBillingPartyUpdateLink 	= false;

		try {
			if(checkUserForEditCustomer(wayBill, executive, srcBranch, destBranch)
					&& checkLRStatusWithPermissionForEditCustomer(wayBill, execFldPermissionsHM)
					&& wayBill.getWayBillTypeId() != WayBillTypeConstant.WAYBILL_TYPE_CREDIT
					&& isCashStatementEntryAllowed(request))
				showEditCustomerLink	= true;

			if(!showEditCustomerLink && execFldPermissionsHM.get(FeildPermissionsConstant.EDIT_CUSTOMER_AFTER_DELIVERY) != null
					&& wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DELIVERED
					&& wayBill.getWayBillTypeId() != WayBillTypeConstant.WAYBILL_TYPE_CREDIT)
				showEditCustomerLink	= true;

			if(wayBill.getStatus() != WayBillStatusConstant.WAYBILL_STATUS_CANCELLED
					&& wayBill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT
					&& execFldPermissionsHM.get(FeildPermissionsConstant.EDIT_TBB_CUSTOMER) != null)
				showTBBCustUpdateLink = !isBillCreated;

			if(wayBill.getStatus() != WayBillStatusConstant.WAYBILL_STATUS_CANCELLED
					&& wayBill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT
					&& execFldPermissionsHM.get(FeildPermissionsConstant.EDIT_BILLING_PARTY) != null)
				showBillingPartyUpdateLink = !isBillCreated;

			if(execFldPermissionsHM.get(FeildPermissionsConstant.EDIT_CUSTOMER_AFTER_DELIVERY) != null
					&& wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DELIVERED
					&& wayBill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT)
				showTBBCustUpdateLink	= true;

			request.setAttribute("showEditCustomerLink", showEditCustomerLink);
			request.setAttribute("showTBBCustUpdateLink", showTBBCustUpdateLink);
			request.setAttribute("showBillingPartyUpdateLink", showBillingPartyUpdateLink);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private void showEditBillingBranchLink(final HttpServletRequest request, final WayBill wayBill, final boolean isBillCreated, final HashMap<Long, ExecutiveFeildPermissionDTO> execFldPermissionsHM) throws Exception {
		var 			showBillingBranchUpdateLink 	= false;

		try {
			if(wayBill.getStatus() != WayBillStatusConstant.WAYBILL_STATUS_CANCELLED
					&& wayBill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT
					&& execFldPermissionsHM.get(FeildPermissionsConstant.EDIT_BILLING_BRANCH) != null)
				showBillingBranchUpdateLink = !isBillCreated;

			request.setAttribute("showBillingBranchUpdateLink", showBillingBranchUpdateLink);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private void showResendOTPLinkForDeliveryLR(final HttpServletRequest request, final WayBill wayBill, final HashMap<Long, ExecutiveFeildPermissionDTO> execFldPermissionsHM, final Map<Object, Object> lrViewConfiguration, final Executive executive) throws Exception {
		var						resendOTPLinkForDeliveryLR		= false;

		try {
			final var	showResendOtpDaysWIse 	= (boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.SHOW_RESEND_DELIVERY_OTP_DAYS_WISE, false );

			if(execFldPermissionsHM.get(FeildPermissionsConstant.SEND_OTP_FOR_LR_DELIVERY) != null) {
				final var	isPendingDeliveryTableEntry = cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_PENDING_DELIVERY_STOCK_TABLE_ENTRY) == ConfigParam.CONFIG_KEY_PENDING_DELIVERY_STOCK_TABLE_ENTRY_ALLOWED;

				if(isPendingDeliveryTableEntry) {
					resendOTPLinkForDeliveryLR		= true;

					if(showResendOtpDaysWIse && (executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_EXECUTIVE || executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_BRANCHADMIN)) {
						final var	dayDiff 		= DateTimeUtility.getDayDiffBetweenTwoDates(wayBill.getCreationDateTimeStamp(), DateTimeUtility.getCurrentTimeStamp());

						if(dayDiff > (int) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.ALLOW_DAYS_FOR_RESEND_DELIVERY_OTP, 0))
							resendOTPLinkForDeliveryLR		= false;
					}
				}
			}

			request.setAttribute("resendOTPLinkForDeliveryLR", resendOTPLinkForDeliveryLR);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private void isConfigDoorDelivery(final HttpServletRequest request, final WayBill wayBill, final ConsignmentSummary consignmentSummary, final HashMap<Long, ExecutiveFeildPermissionDTO> execFldPermissionsHM) throws Exception {
		try {
			if(checkReceiveStatusForEdit(wayBill))
				request.setAttribute("isConfigDoorDelivery", consignmentSummary.getDeliveryTo() == InfoForDeliveryConstant.DELIVERY_TO_BRANCH_ID && execFldPermissionsHM.get(FeildPermissionsConstant.GODOWN_DUE_DELIVERY) != null
				|| consignmentSummary.getDeliveryTo() == InfoForDeliveryConstant.DELIVERY_TO_DOOR_ID && execFldPermissionsHM.get(FeildPermissionsConstant.DOOR_DUE_DELIVERY) != null);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	@SuppressWarnings("unchecked")
	private void getShortExcessDamageDetails(final HttpServletRequest request, final WayBill wayBill, final Executive executive) throws Exception {
		try {
			final var	excessReceiveBLL= new ExcessReceiveBLL();

			var	valueObjectOut	= excessReceiveBLL.getExcessReceiveDetailsByWayBillId(wayBill.getWayBillId(), executive.getAccountGroupId());

			if(valueObjectOut != null) {
				request.setAttribute("excessReceiveList", valueObjectOut.get("newExcessReceiveList"));

				request.setAttribute("totalExcess",((List<ExcessReceive>)valueObjectOut.get("newExcessReceiveList")).size());

				final var	totalUnsettledExcess	= Utility.getInt(valueObjectOut.get("totalUnsettledExcess"));

				if(totalUnsettledExcess > 0)
					request.setAttribute("totalUnsettledExcess", totalUnsettledExcess);
			}

			final var	shortReceiveBLL		= new ShortReceiveBLL();

			valueObjectOut		= shortReceiveBLL.getShortReceiveDetailsByWayBillId(wayBill.getWayBillId(), executive.getAccountGroupId());

			if(valueObjectOut != null) {
				final var	totalUnsettledShort		= Utility.getInt(valueObjectOut.get("totalUnsettledShort"));

				request.setAttribute("shortReceiveList", valueObjectOut.get("newShortReceiveList"));
				request.setAttribute("totalShort", ((List<ShortReceive>)valueObjectOut.get("newShortReceiveList")).size());

				if(totalUnsettledShort > 0)
					request.setAttribute("totalUnsettledShort", totalUnsettledShort);
			}

			/*shailesh*/
			final var	damageReceiveBLL	= new DamageReceiveBLL();

			valueObjectOut		= damageReceiveBLL.getDamageReceiveDetailsByWayBillId(wayBill.getWayBillId(), executive.getAccountGroupId());

			if(valueObjectOut != null) {
				final var	totalUnsettledDamage		= Utility.getInt(valueObjectOut.get("totalUnsettledDamage"));

				request.setAttribute("damageReceiveList", valueObjectOut.get("newDamageReceiveList"));

				request.setAttribute("totalDamage", ((List<DamageReceive>)valueObjectOut.get("newDamageReceiveList")).size());

				if(totalUnsettledDamage > 0)
					request.setAttribute("totalUnsettledDamage", totalUnsettledDamage);
			}
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private String getPanNumber(final List<CreditWayBillTxnCleranceSummary> creditWayBillTxnCleranceSummArr, final long crdtWbTxnId) throws Exception {
		String					panNumber				= null;

		try {
			final Map<Long, Set<String>>	panNumberHM		= creditWayBillTxnCleranceSummArr.stream().filter(cw -> cw.getPanNumber() != null).collect(Collectors.groupingBy(CreditWayBillTxnCleranceSummary::getCreditWayBillTxnId,
					Collectors.mapping(CreditWayBillTxnCleranceSummary::getPanNumber, Collectors.toSet())));

			if(!panNumberHM.isEmpty()) {
				final var panList	= panNumberHM.get(crdtWbTxnId);
				panNumber	= CollectionUtility.getStringFromStringSet(panList);
			}

			return panNumber;
		} catch(final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private GodownUnloadDetails getGodownUnloadDetails(final WayBill wayBill, final Map<Object, Object> lrViewConfiguration) throws Exception {
		GodownUnloadDetails					godownUnloadDetails				= null;
		GodownUnloadDetails[] 				gdUnldDtlsArr 					= null;

		try {
			//Get last Godown Details
			if(wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DELIVERED)
				gdUnldDtlsArr = GenerateCashReceiptBLL.getInstance().getGoDownDetails(wayBill.getWayBillId());
			else if((boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.LAST_GO_DOWN_UNLOAD_AFTER_RECEIVE, false) && (wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_RECEIVED
					|| wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CREDIT_DELIVERED
					|| wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DUEUNDELIVERED
					|| wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CANCELLED_DELIVERY))
				gdUnldDtlsArr = GenerateCashReceiptBLL.getInstance().getGoDownDetails(wayBill.getWayBillId());
			else if(wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_ARRIVED)
				gdUnldDtlsArr = GenerateCashReceiptBLL.getInstance().getGoDownDetailsForArrivedLR(wayBill.getWayBillId());

			if(gdUnldDtlsArr != null)
				godownUnloadDetails		= gdUnldDtlsArr[0];

			return godownUnloadDetails;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private boolean displayBookingChargesToAdminAndBookingBranchOnly(final HttpServletRequest request, final WayBill wayBill, final HashMap<Long, ExecutiveFeildPermissionDTO> execFldPermissionsHM,
			final Map<Object, Object>	lrViewConfiguration, final Executive executive) throws Exception {
		var		displayBookingCharges	= true;

		try {
			if((boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.SHOW_LR_TYPE_WISE_BOOKING_AMOUNT_TO_BOOKING_BRANCH_AND_ADMIN, false)) {
				if(Utility.isIdExistInLongList(lrViewConfiguration, LrViewConfigurationPropertiesConstant.LR_TYPE_TO_SHOW_BOOKING_AMOUNT_TO_BRANCH_AND_ADMIN, wayBill.getWayBillTypeId()))
					displayBookingCharges		= executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN
					|| wayBill.getBookingBranchId() == executive.getBranchId()
					|| execFldPermissionsHM.get(FeildPermissionsConstant.ALLOW_CHARGE_DATA_DISPLAY) != null;
			} else if((boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.SHOW_LR_TYPE_WISE_BOOKING_AMOUNT_TO_GROUP_ADMIN, false)) {
				if(Utility.isIdExistInLongList(lrViewConfiguration, LrViewConfigurationPropertiesConstant.LR_TYPE_TO_SHOW_BOOKING_AMOUNT_TO_GROUP_ADMIN, wayBill.getWayBillTypeId()))
					displayBookingCharges		= executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN;
			} else if((boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.SHOW_CHARGES_TO_GROUPADMIN_AND_LR_EXECUTIVE, false)
					&& Utility.isIdExistInLongList(lrViewConfiguration, LrViewConfigurationPropertiesConstant.LR_TYPE_TO_SHOW_BOOKING_AMOUNT_TO_GROUP_ADMIN, wayBill.getWayBillTypeId()))
				displayBookingCharges		= executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN || executive.getExecutiveId() == wayBill.getBookedByExecutiveId();
			else {
				final var displayDataConfiguration	= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.DISPLAY_DATA_CONFIGURATION);

				displayDataConfiguration.put("execFeildPermission", execFldPermissionsHM);
				displayDataConfiguration.put(Constant.EXECUTIVE_TYPE, executive.getExecutiveType());
				displayDataConfiguration.put(Constant.MODULE_ID, ModuleIdentifierConstant.LR_SEARCH);

				displayBookingCharges	= !DisplayDataConfigurationBllImpl.getInstance().lrTypeWiseZeroAmountHM(displayDataConfiguration, wayBill.getWayBillTypeId());
			}

			return displayBookingCharges;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	@SuppressWarnings("unchecked")
	private String getWayBillCurrentStatusDetails(final HttpServletRequest request, final WayBill wayBill, final GodownUnloadDetails godownUnloadDetails, final ValueObject generateCRConfVal, final Map<Object, Object> lrViewConfiguration,
			final ValueObject generalConfiguration) throws Exception {
		var								wayBillCurrentStatus					= "";
		String							receivedAtBranchName					= null;
		String							receivedAt  							= null;
		var								wayBillArrivedStatus					= false;
		String							truckArrivedStatusDetails				= null;

		try {
			final var	deliveryPending 		= (DeliveryPending) request.getAttribute("DeliveryPending");

			if (wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_RECEIVED
					|| wayBill.getStatus() 	== WayBillStatusConstant.WAYBILL_STATUS_CANCELLED_DELIVERY)
				receivedAtBranchName		= cache.getGenericBranchDetailCache(request, wayBill.getBranchId()).getName();

			final var	branchTransfer			= (BranchTransfer) request.getAttribute("branchTransfer");
			final var	truckArrivalDetails		= (ArrayList<TruckArrivalDetail>) request.getAttribute("truckArrivalDetails");

			final var	showGodownNameDetails					= (boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.SHOW_GODOWN_NAME_DETAILS, false);
			final var	showIntransitStatusForDispatchedLR		= (boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.SHOW_INTRANSIT_STATUS_FOR_DISPATCHED_LR, false);
			final var	isShowGodownDeliveredForGodownReceived	= (boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.IS_SHOW_GODOWN_DELIVERED_FOR_GODOWN_RECEIVED,false);
			final var	isShowLossAndProfitForGodownReceived	= (boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.IS_SHOW_LOSS_AND_PROFIT_FOR_GODOWN_RECEIVED,false);
			final var	showVehicleTypeAfterDispatch			= (boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.SHOW_VEHICLE_TYPE_AFTER_DISPATCH,false);
			final var	isGoodsUndeliveredEntryAllowed			= generateCRConfVal.getBoolean(GenerateCashReceiptDTO.IS_GOODS_UNDELIVERED_ENTRY_ALLOWED, false);
			final var 	showIntransitStatusForDispatchedLRWithVehicleNo		= (boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.SHOW_INTRANSIT_STATUS_FOR_DISPATCHED_LR_WITH_VEHICLE_NO, false);
			final var 	showDispatchStatusForDispatchedLRWithVehicleNo		= (boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.SHOW_DISPATCH_STATUS_FOR_DISPATCHED_LR_WITH_VEHICLE_NO, false);

			if(ObjectUtils.isNotEmpty(truckArrivalDetails)) {
				final var	truckArrivalDetail		= truckArrivalDetails.get(0);
				final var	branch			= (Branch) branchColl.get(Long.toString(truckArrivalDetail.getArrivalBranchId()));
				wayBillArrivedStatus		= true;
				truckArrivedStatusDetails	= "<span style = 'background-color: #4C98A6; color: #FFF'>Truck Arrived </span>&nbsp; at ( " + branch.getName() + " ) on " + DateTimeUtility.getDateFromTimeStampWithAMPM(truckArrivalDetail.getArrivalDateTime());
			}

			if(deliveryPending != null && deliveryPending.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_PENDINGDELIVERY)
				wayBillCurrentStatus			= "<span style = 'background-color: #4C98A6; color: #FFF'>&nbsp; " + WayBillStatusConstant.getStatus(WayBillStatusConstant.WAYBILL_STATUS_PENDINGDELIVERY) + " &nbsp;</span>&nbsp; on " + DateTimeUtility.getDateFromTimeStampWithAMPM(deliveryPending.getTransactionTime());
			else if(deliveryPending != null && deliveryPending.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_FINALDELIVERY)
				wayBillCurrentStatus			= "<span style = 'background-color: #4C98A6; color: #FFF'>&nbsp; " + WayBillStatusConstant.getStatus(WayBillStatusConstant.WAYBILL_STATUS_FINALDELIVERY) + " &nbsp;</span>&nbsp; on " + DateTimeUtility.getDateFromTimeStampWithAMPM(deliveryPending.getTransactionTime());
			else if(wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_RECEIVED || wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_ARRIVED) {
				wayBillCurrentStatus			= "<span style = 'background-color: #4C98A6; color: #FFF'> " + WayBillStatusConstant.getStatus(wayBill.getStatus()) + " </span>";

				if(receivedAtBranchName != null) {
					receivedAt 					= receivedAtBranchName + (showGodownNameDetails && godownUnloadDetails != null ? " - " + godownUnloadDetails.getGodownName() : "");

					if(wayBill.getDestinationBranchId() != wayBill.getBranchId())
						wayBillCurrentStatus	= wayBillCurrentStatus + "<span style='color: red;'> at (" + receivedAt + " ) </span>";
					else
						wayBillCurrentStatus	= wayBillCurrentStatus + "<span> at (" + receivedAt + " ) </span>";
				}
			} else if(wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DISPATCHED) {
				final var	model	= (RecivablesDispatchLedger) request.getAttribute(RecivablesDispatchLedger.RECIVABLES_DISPATCH_LEDGER);

				if(wayBillArrivedStatus)
					wayBillCurrentStatus		= truckArrivedStatusDetails + "<span style = 'background-color: #990000; color: #FFF ;'>" + (branchTransfer != null ? " BT " : "") +  "</span>";
				else if(showIntransitStatusForDispatchedLRWithVehicleNo && model != null) {
					final var		intransitStatus	= "<span style = 'background-color: #4C98A6; color: #FFF ;font-size : 11px'> INTRANSIT From " + model.getSourceBranch() + " To " + model.getDestinationBranch() + "  " + model.getVehicleNumber() + "</span>";
					wayBillCurrentStatus		= intransitStatus + "<span style = 'background-color: #990000; color: #FFF ;'>" + (branchTransfer != null ? " BT " : "") +  "</span>";
				}else if(showDispatchStatusForDispatchedLRWithVehicleNo && model != null) {
					final var		intransitStatus	= "<span style = 'background-color: #4C98A6; color: #FFF ;font-size : 11px'> DISPATCH From " + model.getSourceBranch() + " To " + model.getDestinationBranch() + "  " + model.getVehicleNumber() + "</span>";
					wayBillCurrentStatus		= intransitStatus + "<span style = 'background-color: #990000; color: #FFF ;'>" + (branchTransfer != null ? " BT " : "") +  "</span>";
				} else if(showIntransitStatusForDispatchedLR && model != null) {
					final var		intransitStatus	= "<span style = 'background-color: #4C98A6; color: #FFF ;'> INTRANSIT From " + model.getSourceBranch() + " To " + model.getDestinationBranch() +  "</span>";
					wayBillCurrentStatus		= intransitStatus + "<span style = 'background-color: #990000; color: #FFF ;'>" + (branchTransfer != null ? " BT " : "") +  "</span>";
				} else if(showVehicleTypeAfterDispatch)
					wayBillCurrentStatus		= "<span style = 'background-color: #4C98A6; color: #FFF'> " + WayBillStatusConstant.getStatus(wayBill.getStatus()) + (model != null && model.getVehicleTypeString() != null ? "- By " + model.getVehicleTypeString() :"") + " </span>"
							+ "<span style = 'background-color: #990000; color: #FFF ;'>" + (branchTransfer != null ? " BT " : "") +  "</span>";
				else
					wayBillCurrentStatus		= "<span style = 'background-color: #4C98A6; color: #FFF'> " + WayBillStatusConstant.getStatus(wayBill.getStatus()) + " </span>"
							+ "<span style = 'background-color: #990000; color: #FFF ;'>" + (branchTransfer != null ? " BT " : "") +  "</span>";
			} else if(isTokenWiseLR)
				wayBillCurrentStatus			= "<span style = 'background-color: #E77072; color: #FFF'> " + WayBillStatusConstant.WAYBILL_STATUS_PARTIAL_BOOKED_NAME +  "</span>";
			else if(isLRinPLSState)
				wayBillCurrentStatus			= "<span style = 'background-color: #E77072; color: #FFF'> " + WayBillStatusConstant.WAYBILL_STATUS_PRE_DISPATCH +  "</span>";
			else if(wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_GODOWN_RECEIVED) {
				var statusName	= "";

				if(isShowGodownDeliveredForGodownReceived)
					statusName	= "GODOWN DELIVERED";
				else if(isShowLossAndProfitForGodownReceived)
					statusName	= "L and P";
				else
					statusName	= WayBillStatusConstant.getStatus(wayBill.getStatus());

				wayBillCurrentStatus	= "<span style = 'background-color: #4C98A6; color: #FFF'> " + statusName + " </span>"
						+ "<span style = 'background-color: #990000; color: #FFF ;'>" + (branchTransfer != null ? " BT " : "") +  "</span>";
			} else {
				var statusName	= "";

				if(wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DUEDELIVERED)
					statusName	= generalConfiguration.getString(GeneralConfigurationPropertiesConstant.DUE_DELIVERED_STATUS_NAME);
				else if(wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DUEUNDELIVERED)
					statusName	= generalConfiguration.getString(GeneralConfigurationPropertiesConstant.DUE_UNDELIVERED_STATUS_NAME);
				else if(wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DISPATCHED)
					statusName	= generalConfiguration.getString(GeneralConfigurationPropertiesConstant.DISPATCHED_STATUS_NAME);
				else
					statusName	= WayBillStatusConstant.getStatus(wayBill.getStatus());

				wayBillCurrentStatus	= "<span style = 'background-color: #4C98A6; color: #FFF'> " + statusName + " </span>"
						+ "<span style = 'background-color: #990000; color: #FFF ;'>" + (branchTransfer != null ? " BT " : "") +  "</span>";
			}

			if(!wayBillArrivedStatus)
				wayBillCurrentStatus			= wayBillCurrentStatus + "&nbsp; on " + DateTimeUtility.getDateFromTimeStampWithAMPM(wayBill.getCreationDateTimeStamp());

			if(isGoodsUndeliveredEntryAllowed && showStockOutStatus(wayBill))
				wayBillCurrentStatus			= wayBillCurrentStatus + "&nbsp; <span style = 'background-color: #4C98A6; color: #FFF'> ( STOCK PENDING ) </span>";

			return wayBillCurrentStatus;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private void getLinkForLRPrint(final HttpServletRequest request, final Executive executive, final long wayBillId, final WayBill wayBill, final ConsignmentSummary consignmentSummary,
			final Map<Object, Object>	lrViewConfiguration) throws Exception {
		var			lrPrintLink									= "";
		var			lrPrintPreviewLink							= "";
		var			lrPrintWithPdfExport						= false;
		var 		userWiseOldPrint							= false;

		try {
			if(!(boolean) request.getAttribute("isLrAllow") && !(boolean) request.getAttribute("lrExportToPDFWithoutLRPrint"))
				return;

			final var	groupConfiguration					= cache.getGroupConfiguration(request, executive.getAccountGroupId());
			var			isWSLRPrintNeeded					= groupConfiguration.getBoolean(GroupConfigurationPropertiesDTO.IS_WS_LR_PRINT_NEEDED, false);
			final var	branchWiseWSPrintAllow				= groupConfiguration.getBoolean(GroupConfigurationPropertiesDTO.IS_BRANCH_WISE_WS_PRINT_ALLOW, false);
			final var	branchCodeListForNewLRWSPrint		= groupConfiguration.getString(GroupConfigurationPropertiesDTO.BRANCH_CODE_LIST_FOR_NEW_WS_LR_PRINT, "00000");
			final var	branchCodeListForNewLRWSPrintList	= CollectionUtility.getLongListFromString(branchCodeListForNewLRWSPrint);
			final var	branchFoundForNewLRWSPrintFlow 		= branchCodeListForNewLRWSPrintList.contains(executive.getBranchId());
			final var	isOldPrintNeeded					= (boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.IS_OLD_PRINT_NEEDED, false);
			final var	isAllowSameAsNetLrPrintForNetcWithoutBill	= groupConfiguration.getBoolean(GroupConfigurationPropertiesDTO.IS_ALLOW_SAME_AS_NET_LR_PRINT_FOR_NETC_WITHOUT_BILL, false);
			var			standardPdfPrintAllowed				= groupConfiguration.getBoolean(GroupConfigurationPropertiesDTO.STANDARD_PDF_PRINT_ALLOWED, false);
			final var	userWiseOldPrintList				= CollectionUtility.getLongListFromString(groupConfiguration.getString(GroupConfigurationPropertiesConstant.USER_IDS_FOR_SHOW_OLD_PRINT, "0"));
			final var	subRegionWisePdfPrintAllowed		= groupConfiguration.getBoolean(GroupConfigurationPropertiesConstant.SUB_REGION_WISE_PDF_PRINT_ALLOWED, false);
			final var	subRegionsForPdfPrint				= subRegionWisePdfPrintAllowed && CollectionUtility.getLongListFromString(groupConfiguration.getString(GroupConfigurationPropertiesConstant.SUB_REGIONS_FOR_PDF_PRINT)).contains(executive.getSubRegionId());
			final var	isLrPrintExportToPdf 				= (boolean) request.getAttribute("isLrPrintExportToPdf");

			if(ObjectUtils.isNotEmpty(userWiseOldPrintList) && userWiseOldPrintList.contains(executive.getExecutiveId()))
				userWiseOldPrint = true;

			if(isWSLRPrintNeeded && branchWiseWSPrintAllow && !branchFoundForNewLRWSPrintFlow || userWiseOldPrint)
				isWSLRPrintNeeded		= false;

			if(isOldPrintNeeded && wayBill.getBookingDateTime().before(DateTimeUtility.getTimeStamp("01-07-2017"))
					|| isAllowSameAsNetLrPrintForNetcWithoutBill && consignmentSummary.getBillSelectionId() == BillSelectionConstant.BOOKING_WITHOUT_BILL)
				lrPrintLink				= "edit.do?pageId=300&eventId=1&printType='+waybillStatus+'&wayBillId=" + wayBillId + "' , 'newwindow', config='height=0,width=0, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no";
			else if(isWSLRPrintNeeded) {
				lrPrintLink				= "printWayBill.do?pageId=340&eventId=10&modulename=lrPrint&masterid=" + wayBillId + "&isRePrint=true','newwindow', config='height=300,width=425, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no";
				lrPrintPreviewLink		= "printWayBill.do?pageId=340&eventId=10&modulename=lrPrint&masterid=" + wayBillId + "&isRePrint=true&isPreview=true','newwindow', config='height=300,width=425, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no";
			} else
				lrPrintLink				= "edit.do?pageId=300&eventId=1&printType='+waybillStatus+'&wayBillId=" + wayBillId  + "', 'newwindow', config='height=0,width=0, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no";

			if(!subRegionWisePdfPrintAllowed) {
				if(isLrPrintExportToPdf) {
					if(isWSLRPrintNeeded && !standardPdfPrintAllowed)
						lrPrintWithPdfExport 		= true;
					else if(!standardPdfPrintAllowed)
						standardPdfPrintAllowed		= true;
				} else
					standardPdfPrintAllowed = false;
			} else if(subRegionsForPdfPrint) {
				standardPdfPrintAllowed = isLrPrintExportToPdf;
				lrPrintWithPdfExport = !isLrPrintExportToPdf;
			} else {
				standardPdfPrintAllowed = false;
				lrPrintWithPdfExport = isLrPrintExportToPdf;
			}

			request.setAttribute("lrPrintLink", lrPrintLink);
			request.setAttribute("lrPrintPreviewLink", lrPrintPreviewLink);
			request.setAttribute(GroupConfigurationPropertiesDTO.STANDARD_PDF_PRINT_ALLOWED, standardPdfPrintAllowed);
			request.setAttribute("lrPrintWithPdfExport", lrPrintWithPdfExport);
		} catch(final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private void getLinkForCRPrint(final HttpServletRequest request, final long wayBillId, final long crId, final ConsignmentSummary consignmentSummary, final ValueObject generateCRConfVal, final Executive executive) throws Exception {
		var				crPrintLink					= "";
		final var		isCrPdfAllow				= false;
		var				isCrPrintExportToPdf		= false;

		try {
			if(!(boolean) request.getAttribute("isCrAllow"))
				return;

			final var	isOldFlowNeededForCR						= generateCRConfVal.getBoolean(GenerateCashReceiptDTO.IS_OLD_FLOW_NEEDED, false);
			final var	generateCashReciptPrintFromNewFlow			= generateCRConfVal.getBoolean(GenerateCashReceiptDTO.GENERATE_CASH_RECEIPT_PRINT_FROM_NEW_FLOW, false);
			final var	isWSCRPrintNeeded							= generateCRConfVal.getBoolean(GenerateCashReceiptDTO.IS_WS_CR_PRINT_NEEDED, false);
			final var	multiCRPrintNeeded							= generateCRConfVal.getBoolean(GenerateCashReceiptDTO.MULTI_CR_PRINT_NEEDED, false);
			final var	allowBranchWiseCRPrint						= generateCRConfVal.getBoolean(GenerateCashReceiptDTO.ALLOW_BRANCH_WISE_CR_PRINT, false);
			final var	isOldFlowNeededIfBranchNotFoundForWs		= generateCRConfVal.getBoolean(GenerateCashReceiptDTO.IS_OLD_FLOW_NEEDED_IF_BRANCH_NOT_FOUND_FOR_WS, false);
			final var	branchCodeListForNewCRWSPrint				= generateCRConfVal.getString(GenerateCashReceiptDTO.BRANCH_CODE_LIST_FOR_NEW_CR_WS_PRINT_FLOW,"0000");
			final var	singleCrPrintWithMultiLrNeeded				= generateCRConfVal.getBoolean(GenerateCashReceiptDTO.SINGLE_CR_PRINT_WITH_MULTI_LR_NEEDED, false);
			final var	isAllowSameAsNetCrPrintForNetcWithoutBill	= generateCRConfVal.getBoolean(GenerateCashReceiptDTO.IS_ALLOW_SAME_AS_NET_CR_PRINT_FOR_NETC_WITHOUT_BILL, false);
			final var	multipleCrPrint 							= generateCRConfVal.getBoolean(GenerateCashReceiptDTO.MULTIPLE_CR_PRINT_FOR_NEW_FLOW, false);

			final var	branchCodeListForNewCRWSPrintList	= CollectionUtility.getLongListFromString(branchCodeListForNewCRWSPrint);
			final var	branchFoundForNewCRWSPrintFlow 		= branchCodeListForNewCRWSPrintList.contains(executive.getBranchId());

			if(generateCashReciptPrintFromNewFlow)
				crPrintLink						= "GenerateCRPrint.do?pageId=302&eventId=2&crId=" + crId + "&isRePrint=false', 'newwindow', config='height=600,width=850, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no";
			else if(isWSCRPrintNeeded) {
				if(allowBranchWiseCRPrint) {
					if(branchFoundForNewCRWSPrintFlow) {
						isCrPrintExportToPdf	= true;
						crPrintLink	= "printWayBill.do?pageId=340&eventId=10&modulename=crPrint&masterid=" + crId + "&isCrPdfAllow="+isCrPdfAllow+"','newwindow', config='height=300,width=425, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no";
					} else if(isOldFlowNeededIfBranchNotFoundForWs)
						crPrintLink	= "GenerateCRPrint.do?pageId=3&eventId=5&wayBillId=" + wayBillId + "&isRePrint=false', 'newwindow', config='height=600,width=850, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no";
					else
						crPrintLink	= "GenerateCRPrint.do?pageId=3&eventId=10&wayBillId="+wayBillId+"&isRePrint='+false, 'newwindow', config='height=600,width=850, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no";
				} else if(!multiCRPrintNeeded)
					crPrintLink	= "printWayBill.do?pageId=340&eventId=10&modulename=multiCRPrint&masterid=" + crId + "','newwindow', config='height=300,width=425, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no";
				else if(isAllowSameAsNetCrPrintForNetcWithoutBill && consignmentSummary.getBillSelectionId() == BillSelectionConstant.BOOKING_WITHOUT_BILL)
					crPrintLink		= "GenerateCRPrint.do?pageId=302&eventId=1&wayBillId=" + wayBillId + "&isRePrint=false', 'newwindow', config='height=600,width=850, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no";
				else {
					isCrPrintExportToPdf	= true;
					if(singleCrPrintWithMultiLrNeeded)
						crPrintLink	= "printWayBill.do?pageId=340&eventId=10&modulename=singlecrmultilrprint&masterid=" + crId + "&isCrPdfAllow="+isCrPdfAllow+"&multipleCrPrint="+multipleCrPrint+"','newwindow', config='height=300,width=425, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no";
					else
						crPrintLink	= "printWayBill.do?pageId=340&eventId=10&modulename=crPrint&masterid=" + crId + "&isCrPdfAllow="+isCrPdfAllow+"&multipleCrPrint="+multipleCrPrint+"','newwindow', config='height=300,width=425, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no";
				}
			} else if(isOldFlowNeededForCR)
				crPrintLink		= "GenerateCRPrint.do?pageId=3&eventId=5&wayBillId=" + wayBillId + "&isRePrint=false', 'newwindow', config='height=600,width=850, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no";
			else
				crPrintLink		= "GenerateCRPrint.do?pageId=302&eventId=1&wayBillId=" + wayBillId + "&isRePrint=false', 'newwindow', config='height=600,width=850, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no";

			if(!(boolean) request.getAttribute("isCrPrintExportToPdf"))
				isCrPrintExportToPdf	= false;

			request.setAttribute("crPrintLink", crPrintLink);
			request.setAttribute("isCrPrintExportToPdf", isCrPrintExportToPdf);
		} catch(final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private void checkAccessibilityForDelivery(final HttpServletRequest request, final Executive executive, final WayBill wayBillModel, final HashMap<Long, ExecutiveFeildPermissionDTO> execFldPermissionsHM,
			final Map<Object, Object> lrViewConfiguration, final DeliveryRunSheetSummary drs) throws Exception {
		var 						flag 					= true;
		var							userErrorId 			= 0;
		var 						errorAssociatedToNumber = "";
		var							showDeliveryCharges		= false;
		ReturnBooking				returnBooking			= null;

		try {
			final var	deliveryLocationList 		= cache.getAssignedLocationsIdListByLocationIdId(request, executive.getBranchId(), executive.getAccountGroupId());
			final var	configValue					= cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_DELIVERY_ACCESSIBILITY);
			final var	branchesColl				= cache.getGenericBranchesDetail(request);
			final var	isWayBillAccessibility		= WayBillAccessibility.checkWayBillAccessibility(wayBillModel, executive, configValue, branchesColl, deliveryLocationList, lrViewConfiguration);

			if(checkReceiveStatusForEdit(wayBillModel) || wayBillModel.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CREDIT_DELIVERED) {
				if(isWayBillAccessibility)
					flag = false;

				if(drs != null && drs.getPaymentType() == (short) 0) {
					flag 					= true;
					userErrorId 			= UserErrors.ERROR_ID_DELIVERY_NOT_TOBE_SHOWN_DUE_TO_PRESENT_IN_DDM;
					errorAssociatedToNumber = drs.getDdmNumber();
				}
			}

			//In case of DDDV allow delivery for source
			if(wayBillModel.getDeliveryTypeId() == InfoForDeliveryConstant.DIRECT_DELIVERY_DIRECT_VASULI_ID
					&& wayBillModel.getSourceBranchId() == executive.getBranchId())
				flag 	= false;

			//if TBB/Paid - FTL then allow delivery for source
			if( wayBillModel.getBookingTypeId() == BookingTypeConstant.BOOKING_TYPE_FTL_ID
					&& (wayBillModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT || wayBillModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID)
					&& wayBillModel.getSourceBranchId() == executive.getBranchId())
				flag 	= false;

			showDeliveryCharges = (boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.DISPLAY_DELIVERY_CHARGES, false)
					&& checkReceiveStatusForEdit(wayBillModel);

			if((wayBillModel.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_RECEIVED
					|| wayBillModel.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CANCELLED_DELIVERY
					|| wayBillModel.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DUEUNDELIVERED)
					&& execFldPermissionsHM.get(FeildPermissionsConstant.RETURN_BOOKING) != null) {

				returnBooking = ReturnBookingDao.getInstance().getReturnBookingDataWithMarkForDelete(wayBillModel.getWayBillId());

				request.setAttribute("showLRReturnBookingLink", returnBooking == null && isWayBillAccessibility);
			}

			request.setAttribute("flag", flag);
			request.setAttribute("userErrorId", userErrorId);
			request.setAttribute("errorAssociatedToNumber", errorAssociatedToNumber);
			request.setAttribute("showDeliveryCharges", showDeliveryCharges);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private boolean checkBlhpvForCRCancellation(final WayBill wayBill) throws Exception {
		var	isFlagForCRCancellation		= true;

		try {
			final var	dispatchLedgerId = DispatchSummaryDao.getInstance().getLastDispatchLedgerIdByWayBillId(wayBill.getWayBillId());

			if(dispatchLedgerId > 0) {
				final var	lhpvId = LHPVDao.getInstance().getLHPVIdByDispatchLedgerId(dispatchLedgerId);

				if(lhpvId > 0) {
					final var	lhpv = LHPVDao.getInstance().getLHPVDetails(lhpvId);

					isFlagForCRCancellation = lhpv == null || lhpv.getBlhpvId() <= 0 || lhpv.getbLHPVNumber() == null;
				}
			}

			return isFlagForCRCancellation;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private void getFlagForCRCancellation(final HttpServletRequest request, final WayBill wayBill, final DeliveryContactDetails deliveryContactDetails, final boolean isCrossingAgentBillCreate, final HashMap<Short, CreditWayBillTxn> creditWBTxnColl, final boolean isBillCreated
			, final HashMap<?, ?> execFldPermissionsHM, final Map<Object, Object> lrViewConfiguration, final Executive executive) throws Exception {
		var 							isFlagForCRCancellation 					= false;
		CreditWayBillTxn				creditWBTxn									= null;
		var								isCRCancellationAllowedAfterCashStmt		= false;
		var								messageToCancelCR							= "";
		var								isBranchHisabSettledForAgentBranch			= false;

		try {
			final var	generateCRConfVal							= cache.getGenerateCRConfiguration(request, executive.getAccountGroupId());
			final var	wbBranch									= cache.getGenericBranchDetailCache(request, wayBill.getBranchId());
			final var	centralizedCrCancellation					= generateCRConfVal.getBoolean(GenerateCashReceiptDTO.CENTRALIZED_CR_CANCELLATION, false);
			final var	isAllowCrCancelForTBBLrAfterBillCreation	= (boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.IS_ALLOW_CR_CANCEL_FOR_TBB_LR_AFTER_BILL_CREATION, false);
			final var	crCancelledLockingInCashStatementConfig		= (boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.CR_CANCELLED_LOCKING_IN_CASH_STATEMENT_CONFIG, false);
			final var	isAllowCRCancellationLocking				= generateCRConfVal.getBoolean(GenerateCashReceiptDTO.IS_ALLOW_CR_CANCELLATION_LOCKING, false);
			final var	crCancelltionAllowedAfterDays				= generateCRConfVal.getInt(GenerateCashReceiptDTO.CR_CANCELLTION_ALLOWED_AFTER_DAYS, 0);
			final var	diffInDays									= DateTimeUtility.getDayDiffBetweenTwoDates(wayBill.getCreationDateTimeStamp(), DateTimeUtility.getCurrentTimeStamp());
			final var 	allowDeliveryCancellationAfterLocking		= execFldPermissionsHM.get(FeildPermissionsConstant.ALLOW_DELIVERY_CANCELLATION_AFTER_LOCKING);
			final var	agentBranchHisabNeededForDelivery			= generateCRConfVal.getBoolean(GenerateCashReceiptPropertiesConstant.AGENT_BRANCH_HISAB_NEEDED_FOR_DELIVERY, false);

			if(request.getAttribute("isCRCancellationAllowedAfterCashStmt") != null)
				isCRCancellationAllowedAfterCashStmt	= (boolean) request.getAttribute("isCRCancellationAllowedAfterCashStmt");

			var	isAllowCentralizedCrCancellation	= centralizedCrCancellation && (executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN
					|| wbBranch.getRegionId() == executive.getRegionId() && executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_REGIONADMIN
					|| wbBranch.getSubRegionId() == executive.getSubRegionId() && executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_SUBREGIONADMIN);

			if(isAllowCentralizedCrCancellation && generateCRConfVal.getBoolean(GenerateCashReceiptPropertiesConstant.IS_ALLOW_CENTRALIZED_DELIVERY_CANCELLATION_PERMISSION_BASED, false))
				isAllowCentralizedCrCancellation = execFldPermissionsHM.get(FeildPermissionsConstant.IS_ALLOW_CENTRALIZED_CR_CANCELLATION) != null;

			if(agentBranchHisabNeededForDelivery)
				isBranchHisabSettledForAgentBranch 	= AgentHisabCommissionSummaryDaoImpl.getInstance().getDeliveryCommissionHisabByAgentBranchByWaybillId(String.valueOf(wayBill.getWayBillId()));

			if(wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DELIVERED
					&& execFldPermissionsHM.get(FeildPermissionsConstant.DELIVERY_CANCELLATION) != null
					&& (wayBill.getBranchId() == executive.getBranchId() || centralizedCrCancellation && isAllowCentralizedCrCancellation)
					&& !isCrossingAgentBillCreate
					&& deliveryContactDetails != null
					&& !deliveryContactDetails.isMultiple())
			{
				if(creditWBTxnColl != null)
					creditWBTxn 		= creditWBTxnColl.get(CreditWayBillTxn.TXN_TYPE_DELIVERY_ID);

				if(creditWBTxn != null && creditWBTxn.getShortCreditLedgerId() > 0) {
					isFlagForCRCancellation = false;
					final var	shortCreditLedgDto = ShortCreditCollectionSheetLedgerDao.getInstance().getShortCreditLedgerDataForPrint(creditWBTxn.getShortCreditLedgerId());

					if(shortCreditLedgDto != null) {
						request.setAttribute("ShortCredBillNumber", shortCreditLedgDto.getBillNumber());

						final var	stbsBranch  = cache.getGenericBranchDetailCache(request, shortCreditLedgDto.getBillBranchId());

						if(stbsBranch != null)
							request.setAttribute("ShortCredBillBranch", stbsBranch.getName());
					}
				} else if(checkShortCreditPaymentStatusForEditLRRate(creditWBTxn))
					isFlagForCRCancellation = false;
				else {
					if(executive.getAccountGroupId() == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_LMT)
						isFlagForCRCancellation	= checkBlhpvForCRCancellation(wayBill);
					else
						isFlagForCRCancellation = true;

					final var isAllowToCancelDeliveryAndInvoice = wayBill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY
							&& wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DELIVERED;

					if(isBillCreated && !isAllowToCancelDeliveryAndInvoice)
						isFlagForCRCancellation = isAllowCrCancelForTBBLrAfterBillCreation && !wayBill.isDeliveryTimeTBB();
				}

				if(crCancelledLockingInCashStatementConfig && isFlagForCRCancellation)
					isFlagForCRCancellation			= isCRCancellationAllowedAfterCashStmt;

				final var 	hourTimeForCRCancellation	= generateCRConfVal.getInt(GenerateCashReceiptPropertiesConstant.HOURS_TIME_FOR_CR_CANCELLATION, 0);
				final var 	hoursObj 					= DateTimeUtility.getDayDiffBetweenTwoDatesInHoursAndMinutes(wayBill.getDeliveryDateTime(), DateTimeUtility.getCurrentTimeStamp());
				final var 	totalMinutesDiff			= hoursObj.getLong("totalMinutesDiff", 0);

				if(allowDeliveryCancellationAfterLocking == null)
					if(isAllowCRCancellationLocking && diffInDays >= crCancelltionAllowedAfterDays) {
						isFlagForCRCancellation = false;
						messageToCancelCR =  "You are not allow to cancel CR After " + crCancelltionAllowedAfterDays + " day !";
					} else if(hourTimeForCRCancellation > 0 && totalMinutesDiff > hourTimeForCRCancellation * 60) {
						isAllowCentralizedCrCancellation = false;
						isFlagForCRCancellation = false;
						messageToCancelCR = "CR Cancellation is not allowed for " + hourTimeForCRCancellation + " hours old CR";
					}
			}

			if(isAgentBranchComissionBillCreated || isBranchHisabSettledForAgentBranch)
				isFlagForCRCancellation	= false;

			request.setAttribute("isFlagForCRCancellation", isFlagForCRCancellation);
			request.setAttribute("isAllowCentralizedCrCancellation", isAllowCentralizedCrCancellation);
			request.setAttribute("messageToCancelCR", messageToCancelCR);

		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private void getBookingAndDeliveryShortCreditDetails(final HttpServletRequest request, final WayBill wayBill, final Timestamp minDateTimeStamp, final short txnTypeId, final Executive executive) throws Exception {
		try {
			final var	outValObj 				= CreditPaymentModuleBLL.getInstance().getCreditPaymentDataForSingleWayBill(executive.getAccountGroupId(), txnTypeId, wayBill.getWayBillNumber(), (short) 1, minDateTimeStamp, (short) 0);

			if(outValObj != null) {
				final var	creditWayBillTxn 		= (CreditWayBillTxn[]) outValObj.get("CreditWayBillTxn");
				final var	creditWayBillTxnIdArray = (Long[]) outValObj.get("creditWayBillTxnIdArray");

				if(ObjectUtils.isNotEmpty(creditWayBillTxnIdArray)) {
					final var	creditWayBillTxnIds			= CollectionUtility.getStringFromLongList(Arrays.asList(creditWayBillTxnIdArray));
					final var	valueObjectFromCreditWBTxn	= CreditWayBillTxnClearanceSummaryDAO.getInstance().getCreditWayBillTxnClearanceDetails(creditWayBillTxnIds);

					if(valueObjectFromCreditWBTxn != null)
						request.setAttribute("creditWayBillTxnClearanceSumHM", valueObjectFromCreditWBTxn.get("creditWayBillTxnClearanceSumHM"));
				}

				if(executive.getBranchId() == creditWayBillTxn[0].getBranchId())
					request.setAttribute("creditWayBillTxn", creditWayBillTxn[0]);
			}
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private void getShortCreditPaymentDetails(final HttpServletRequest request, final ConsignmentSummary consignmentSummary, final DeliveryContactDetails deliveryContactDetails, final WayBill wayBill, final Timestamp minDateTimeStamp, final HashMap<?, ?> execFldPermissionsHM, final Executive executive) throws Exception {
		try {
			if(execFldPermissionsHM.get(FeildPermissionsConstant.SHORT_CREDIT_PAYMENT_ON_LR_VIEW) != null && consignmentSummary != null && consignmentSummary.getPaymentType() == PaymentTypeConstant.PAYMENT_TYPE_CREDIT_ID)
				getBookingAndDeliveryShortCreditDetails(request, wayBill, minDateTimeStamp, CreditWayBillTxn.TXN_TYPE_BOOKING_ID, executive);

			if(execFldPermissionsHM.get(FeildPermissionsConstant.SHORT_CREDIT_PAYMENT_ON_LR_VIEW) != null && deliveryContactDetails != null && deliveryContactDetails.getPaymentType() == PaymentTypeConstant.PAYMENT_TYPE_CREDIT_ID)
				getBookingAndDeliveryShortCreditDetails(request, wayBill, minDateTimeStamp, CreditWayBillTxn.TXN_TYPE_DELIVERY_ID, executive);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private boolean checkUserForEditLRRate(final WayBill wayBill, final Executive executive, final Branch srcBranch, final Branch destBranch) {
		return executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN
				|| wayBill.getSourceBranchId() == executive.getBranchId()
				|| destBranch.getSubRegionId() == executive.getSubRegionId() && executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_SUBREGIONADMIN
				|| srcBranch.getSubRegionId() == executive.getSubRegionId() && executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_SUBREGIONADMIN
				|| destBranch.getRegionId() == executive.getRegionId() && executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_REGIONADMIN
				|| srcBranch.getRegionId() == executive.getRegionId() && executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_REGIONADMIN
				|| destBranch.getBranchId() == executive.getBranchId();
	}

	private boolean checkLRStatusWithPermissionForPaidEditLRRate(final WayBill wayBill, final DeliveryRunSheetSummary drs, final HashMap<Long, ExecutiveFeildPermissionDTO> execFldPermissionsHM) {
		return (wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_BOOKED
				|| wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DISPATCHED
				|| wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_RECEIVED
				|| wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CANCELLED_DELIVERY) && execFldPermissionsHM.get(FeildPermissionsConstant.EDIT_PAID_LR_RATE) != null
				|| drs != null && wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DUEDELIVERED;
	}

	private boolean checkLRStatusWithPermissionForTopayEditLRRate(final WayBill wayBill, final DeliveryRunSheetSummary drs, final HashMap<Long, ExecutiveFeildPermissionDTO> execFldPermissionsHM) {
		return wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_BOOKED && execFldPermissionsHM.get(FeildPermissionsConstant.EDIT_TOPAY_LR_RATE_AFTER_BOOKING) != null
				|| wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DISPATCHED && execFldPermissionsHM.get(FeildPermissionsConstant.EDIT_TOPAY_LR_RATE_AFTER_DISPATCH) != null
				|| wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_RECEIVED && execFldPermissionsHM.get(FeildPermissionsConstant.EDIT_TOPAY_LR_RATE_AFTER_RECEIVE) != null
				|| wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CANCELLED_DELIVERY && execFldPermissionsHM.get(FeildPermissionsConstant.EDIT_TOPAY_LR_RATE_AFTER_CANCELLED_DELIVERY) != null
				|| drs != null && wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DUEDELIVERED;
	}

	private boolean checkLRStatusWithPermissionForTBBEditLRRate(final WayBill wayBill, final DeliveryRunSheetSummary drs, final HashMap<Long, ExecutiveFeildPermissionDTO> execFldPermissionsHM) {
		return wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_BOOKED && execFldPermissionsHM.get(FeildPermissionsConstant.EDIT_TBB_LR_RATE_AFTER_BOOKING) != null
				|| wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DISPATCHED && execFldPermissionsHM.get(FeildPermissionsConstant.EDIT_TBB_LR_RATE_AFTER_DISPATCH) != null
				|| wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_RECEIVED && execFldPermissionsHM.get(FeildPermissionsConstant.EDIT_TOPAY_LR_RATE_AFTER_RECEIVE) != null
				|| wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CANCELLED_DELIVERY && execFldPermissionsHM.get(FeildPermissionsConstant.EDIT_TOPAY_LR_RATE_AFTER_CANCELLED_DELIVERY) != null
				|| drs != null && wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DUEDELIVERED;
	}

	private boolean checkLRTypeWiseEditLRRatePermission(final WayBill wayBill, final DeliveryRunSheetSummary drs, final HashMap<Long, ExecutiveFeildPermissionDTO> execFldPermissionsHM, final Executive executive, final Branch srcBranch, final Branch destBranch, final Map<Object, Object> lrViewConfiguration) {
		return wayBill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID && checkLRStatusWithPermissionForPaidEditLRRate(wayBill, drs, execFldPermissionsHM) && checkUserForEditLRRate(wayBill, executive, srcBranch, destBranch)
				|| wayBill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY && checkLRStatusWithPermissionForTopayEditLRRate(wayBill, drs, execFldPermissionsHM) && checkUserForEditLRRate(wayBill, executive, srcBranch, destBranch)
				|| (boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.ALLOW_TO_EDIT_LR_RATE_FOR_TBB, false) && wayBill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT && checkLRStatusWithPermissionForTBBEditLRRate(wayBill, drs, execFldPermissionsHM);
	}

	private boolean checkLRTypeWisePermissionForEditLRRate(final WayBill wayBill, final HashMap<Long, ExecutiveFeildPermissionDTO> execFldPermissionsHM) {
		return wayBill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY && execFldPermissionsHM.get(FeildPermissionsConstant.EDIT_TOPAY_LR_RATE) != null
				|| wayBill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID && execFldPermissionsHM.get(FeildPermissionsConstant.EDIT_PAID_LR_RATE) != null
				|| wayBill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT && execFldPermissionsHM.get(FeildPermissionsConstant.EDIT_LR_RATE) != null;
	}

	private boolean checkLRStatusForTBBEditLRRate(final WayBill wayBill) {
		return wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_BOOKED
				|| wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DISPATCHED
				|| wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_RECEIVED
				|| wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CANCELLED_DELIVERY
				|| wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DELIVERED;
	}

	private boolean checkEditPermissionForNormalUserAfterReceive(final WayBill wayBill, final Executive executive) {
		return (executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_EXECUTIVE || executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_BRANCHADMIN)
				&& wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_RECEIVED
				&& wayBill.getBranchId() != executive.getBranchId();
	}

	private boolean checkShortCreditPaymentStatusForEditLRRate(final CreditWayBillTxn creditWBTxn) {
		return creditWBTxn != null && (creditWBTxn.getPaymentStatus() == BillClearanceStatusConstant.BILL_CLEARANCE_STATUS_CLEAR_PAYMENT_ID
				|| creditWBTxn.getPaymentStatus() == BillClearanceStatusConstant.BILL_CLEARANCE_STATUS_NEGOTIATED_ID
				|| creditWBTxn.getPaymentStatus() == BillClearanceStatusConstant.BILL_CLEARANCE_STATUS_PARTIAL_PAYMENT_ID);
	}

	private boolean checkCrossingAgentBillForEdit(final WayBill wayBill) {
		WayBillCrossing[] waybillCrossArr = null;

		try {
			waybillCrossArr = WayBillCrossingDao.getInstance().getWayBillCrossingDetailsByWayBillIds(Long.toString(wayBill.getWayBillId()));
		} catch (final Exception e) {
			e.printStackTrace();
		}

		return ObjectUtils.isNotEmpty(waybillCrossArr);
	}

	private boolean checkLRTypeWisePermissionForEditLRRate(final HttpServletRequest request, final WayBill wayBill, final HashMap<Long, ExecutiveFeildPermissionDTO> execFldPermissionsHM) {
		return wayBill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY && execFldPermissionsHM.get(FeildPermissionsConstant.EDIT_TOPAY_LR_RATE) != null
				|| wayBill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID && execFldPermissionsHM.get(FeildPermissionsConstant.EDIT_PAID_LR_RATE) != null
				&& isCashStatementEntryAllowed(request);
	}

	private void showLRRateEditLink(final HttpServletRequest request, final WayBillModel wayBillModel, final WayBill wayBill, final boolean isBillCreated, final HashMap<Long, ExecutiveFeildPermissionDTO> execFldPermissionsHM, final Branch srcBranch, final Branch destBranch, final Executive executive, final DeliveryRunSheetSummary drs) throws Exception {
		var 							showLRRateEditLink 							= false;
		CreditWayBillTxn				creditWBTxn									= null;
		var								allowToEditRateForOwnReceivedLR				= true;
		var								isPaymentDone								= false;
		var 							showLRRateEditLinkAfterDelivery 			= false;

		try {
			final var	lrViewConfiguration				= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.LR_SEARCH);
			final var	allowStatusWiseEditRate			= (boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.ALLOW_STATUS_WISE_EDIT_RATE, false);
			final var	showLRRateEditLinkAfterDDM		= (boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.SHOW_LR_RATE_EDIT_LINK_AFTER_DDM, false);

			final var	creditWBTxnColl					= wayBillModel.getCreditWBTxnColl();

			if(creditWBTxnColl != null)
				creditWBTxn 	= creditWBTxnColl.get(CreditWayBillTxn.TXN_TYPE_BOOKING_ID);

			if(allowStatusWiseEditRate) {
				if(wayBill.getStatus() != WayBillStatusConstant.WAYBILL_STATUS_DELIVERED && wayBill.getStatus() != WayBillStatusConstant.WAYBILL_STATUS_CANCELLED
						&& checkLRTypeWiseEditLRRatePermission(wayBill, drs, execFldPermissionsHM, executive, srcBranch, destBranch, lrViewConfiguration)
						&& isCashStatementEntryAllowed(request)) {
					showLRRateEditLink = true;

					if(checkCrossingAgentBillForEdit(wayBill)
							|| checkShortCreditPaymentStatusForEditLRRate(creditWBTxn))
						showLRRateEditLink = false;

					if(showLRRateEditLink && drs != null && wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DUEDELIVERED
							&& drs.getPaymentType() != PaymentTypeConstant.PAYMENT_TYPE_DUE_UNDELIVERED_ID)
						showLRRateEditLink = false;

					if((boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.DONT_ALLOW_TO_EDIT_RATE_FOR_NORMAL_USER, false)
							&& checkEditPermissionForNormalUserAfterReceive(wayBill, executive))
						allowToEditRateForOwnReceivedLR	= false;
				}
			} else {
				if(wayBill.getStatus() != WayBillStatusConstant.WAYBILL_STATUS_DELIVERED && wayBill.getStatus() != WayBillStatusConstant.WAYBILL_STATUS_CANCELLED && checkLRTypeWisePermissionForEditLRRate(request, wayBill, execFldPermissionsHM)) {
					final var	wbBranch 		= cache.getGenericBranchDetailCache(request, wayBill.getBranchId());

					if(checkCrossingAgentBillForEdit(wayBill)
							|| checkShortCreditPaymentStatusForEditLRRate(creditWBTxn)) { // Checking  Crossing Agent Bill And CreditWayBillTaxTxn Payment  Status
						isPaymentDone	   = true;
						showLRRateEditLink = false;
					} else if(wayBill.getDestinationBranchId() > 0) {
						if(wbBranch.getSubRegionId() == srcBranch.getSubRegionId()
								|| wbBranch.getSubRegionId() == destBranch.getSubRegionId()
								|| executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN)
							showLRRateEditLink = true;

						if((wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_RECEIVED
								|| wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CANCELLED_DELIVERY
								|| wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DUEUNDELIVERED)
								&& (executive.getAccountGroupId() == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_NEW_ERA_TRANPORTS
								|| executive.getAccountGroupId() == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_NEW_ERA_TRANPORTS_CO
								|| executive.getAccountGroupId() == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_AAKASH
								|| executive.getAccountGroupId() == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_ARR
								|| executive.getAccountGroupId() == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_MAHARAJA))
							showLRRateEditLink = true;
					} else {
						showLRRateEditLink = wbBranch.getBranchId() != wayBill.getSourceBranchId()
								|| wayBill.getStatus() != WayBillStatusConstant.WAYBILL_STATUS_RECEIVED && wayBill.getStatus() != WayBillStatusConstant.WAYBILL_STATUS_CANCELLED_DELIVERY;

						if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN)
							showLRRateEditLink = true;
					}

					if((executive.getAccountGroupId() == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_SNGT
							|| executive.getAccountGroupId() == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_KATIRA)
							&& isBillCreated)
						showLRRateEditLink = false;

					if(showLRRateEditLink && drs != null && wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DUEDELIVERED
							&& drs.getPaymentType() != PaymentTypeConstant.PAYMENT_TYPE_DUE_UNDELIVERED_ID)
						showLRRateEditLink = false;

					if((boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.DONT_ALLOW_TO_EDIT_RATE_FOR_NORMAL_USER, false)
							&& checkLRTypeWisePermissionForEditLRRate(wayBill, execFldPermissionsHM)
							&& checkEditPermissionForNormalUserAfterReceive(wayBill, executive))
						allowToEditRateForOwnReceivedLR	= false;
				}

				if((boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.ALLOW_TO_EDIT_LR_RATE_FOR_TBB, false)) {
					if(checkLRStatusForTBBEditLRRate(wayBill)
							&& wayBill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT
							&& execFldPermissionsHM.get(FeildPermissionsConstant.EDIT_LR_RATE) != null)
						showLRRateEditLink = !isBillCreated;

					if((boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.DONT_ALLOW_TO_EDIT_RATE_FOR_NORMAL_USER, false)
							&& wayBill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT && execFldPermissionsHM.get(FeildPermissionsConstant.EDIT_LR_RATE) != null
							&& checkEditPermissionForNormalUserAfterReceive(wayBill, executive))
						allowToEditRateForOwnReceivedLR	= false;
				}

				if(isAgentBranchComissionBillCreated)
					showLRRateEditLink	= false;

				if(wayBill.getWayBillTypeId() != WayBillTypeConstant.WAYBILL_TYPE_CREDIT) {
					showLRRateEditLink = checkUserForEditLRRate(wayBill, executive, srcBranch, destBranch)
							&& (wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_BOOKED || wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DISPATCHED
							|| wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_RECEIVED || wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CANCELLED_DELIVERY)
							&& checkLRTypeWisePermissionForEditLRRate(wayBill, execFldPermissionsHM);

					if(isPaymentDone)
						showLRRateEditLink = false;
				}

				if(showLRRateEditLinkAfterDDM || execFldPermissionsHM.get(FeildPermissionsConstant.SHOW_LR_RATE_EDIT_LINK_AFTER_DDM) != null && (wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DUEDELIVERED
						|| wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DUEUNDELIVERED)
						&& checkLRTypeWisePermissionForEditLRRate(wayBill, execFldPermissionsHM)) {

					if(!isPaymentDone)
						showLRRateEditLink 				= true;

					if(showLRRateEditLink)
						showLRRateEditLink = !isBillCreated;
				}

				if(isPaymentDone && wayBill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID && wayBill.getStatus() != WayBillStatusConstant.WAYBILL_STATUS_CANCELLED
						&& execFldPermissionsHM.get(FeildPermissionsConstant.EDIT_PAID_LR_RATE_AFTER_SHORT_CREDIT_PAYMENT) != null)
					showLRRateEditLink	= true;

				if(wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DELIVERED
						&& (execFldPermissionsHM.get(FeildPermissionsConstant.EDIT_PAID_LR_RATE_AFTER_DELIEVRY) != null && wayBill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID ||
						execFldPermissionsHM.get(FeildPermissionsConstant.EDIT_TO_PAY_LR_RATE_AFTER_DELIEVRY) != null && wayBill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY)) {
					showLRRateEditLink 				= true;
					showLRRateEditLinkAfterDelivery = true;
				}
			}

			if(creditWBTxn != null && creditWBTxn.getShortCreditLedgerId() > 0)
				showLRRateEditLink = false;

			request.setAttribute("ddmDetails", drs);

			if(showLRRateEditLink && wayBill.getAccountGroupId() != wayBill.getBookedForAccountGroupId()
					&& executive.getAccountGroupId() != wayBill.getAccountGroupId())
				showLRRateEditLink = false;

			request.setAttribute("showLRRateEditLink", showLRRateEditLink);
			request.setAttribute("allowToEditRateForOwnReceivedLR", allowToEditRateForOwnReceivedLR);
			request.setAttribute("showLRRateEditLinkAfterDelivery", showLRRateEditLinkAfterDelivery);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private void showWayBillFormTypeUpdateLink(final HttpServletRequest request, final WayBill wayBill, final Executive executive, final HashMap<Long, ExecutiveFeildPermissionDTO> execFldPermissionsHM, final Map<Object, Object> lrViewConfiguration) throws Exception {
		var showWayBillFormTypeUpdateLink 	= false;

		try {
			if(wayBill.getStatus() != WayBillStatusConstant.WAYBILL_STATUS_CANCELLED
					&& wayBill.getStatus() != WayBillStatusConstant.WAYBILL_STATUS_DELIVERED) {

				showWayBillFormTypeUpdateLink = checkSourceAndDestinationBranchForEdit(wayBill, executive)
						&& (wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_BOOKED && execFldPermissionsHM.get(FeildPermissionsConstant.EDIT_LR_FORM_TYPE_AFTER_BOOKING) != null
						|| wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DISPATCHED && execFldPermissionsHM.get(FeildPermissionsConstant.EDIT_LR_FORM_TYPE_AFTER_DISPATCH) != null
						|| checkReceiveStatusForEdit(wayBill) && execFldPermissionsHM.get(FeildPermissionsConstant.EDIT_LR_FORM_TYPE_AFTER_RECEIVE) != null);

				if((boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.UPDATE_FORM_TYPE, false))
					showWayBillFormTypeUpdateLink 	= true;
			}

			request.setAttribute("showWayBillFormTypeUpdateLink", showWayBillFormTypeUpdateLink);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private boolean checkSourceAndDestinationBranchForEdit(final WayBill wayBill, final Executive executive) {
		return wayBill.getSourceBranchId() == executive.getBranchId() || wayBill.getBookingBranchId() == executive.getBranchId() || wayBill.getDestinationBranchId() == executive.getBranchId() || executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN;
	}

	private void showWayBillRemarkUpdateLink(final HttpServletRequest request, final WayBill wayBill, final Executive executive, final HashMap<Long, ExecutiveFeildPermissionDTO> execFldPermissionsHM) {
		var showWayBillRemarkUpdateLink = wayBill.getStatus() != WayBillStatusConstant.WAYBILL_STATUS_CANCELLED && wayBill.getStatus() != WayBillStatusConstant.WAYBILL_STATUS_DELIVERED
				&& checkSourceAndDestinationBranchForEdit(wayBill, executive)
				&& (wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_BOOKED && execFldPermissionsHM.get(FeildPermissionsConstant.EDIT_LR_BOOKING_REMARK_AFTER_BOOKING) != null
				|| wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DISPATCHED && execFldPermissionsHM.get(FeildPermissionsConstant.EDIT_LR_BOOKING_REMARK_AFTER_DISPATCH) != null
				|| checkReceiveStatusForEdit(wayBill) && execFldPermissionsHM.get(FeildPermissionsConstant.EDIT_LR_BOOKING_REMARK_AFTER_RECEIVE) != null);

		if(wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DELIVERED && execFldPermissionsHM.get(FeildPermissionsConstant.EDIT_LR_BOOKING_REMARK_AFTER_DELIVERY) != null)
			showWayBillRemarkUpdateLink = true;

		request.setAttribute("showWayBillRemarkUpdateLink", showWayBillRemarkUpdateLink);
	}

	private void allowToUpdatePrivateMarka(final HttpServletRequest request, final WayBill wayBill, final Executive executive, final HashMap<Long, ExecutiveFeildPermissionDTO> execFldPermissionsHM) {
		var allowToUpdatePrivateMarka = false;

		if(wayBill.getStatus() != WayBillStatusConstant.WAYBILL_STATUS_CANCELLED && wayBill.getStatus() != WayBillStatusConstant.WAYBILL_STATUS_DELIVERED
				&& checkSourceAndDestinationBranchForEdit(wayBill, executive)
				&& (wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_BOOKED && execFldPermissionsHM.get(FeildPermissionsConstant.EDIT_LR_BOOKING_PRIVATE_MARKA_AFTER_BOOKING) != null
				|| wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DISPATCHED && execFldPermissionsHM.get(FeildPermissionsConstant.EDIT_LR_BOOKING_PRIVATE_MARKA_AFTER_DISPATCH) != null
				|| wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_RECEIVED && execFldPermissionsHM.get(FeildPermissionsConstant.EDIT_LR_BOOKING_PRIVATE_MARKA_AFTER_RECEIVE) != null))
			allowToUpdatePrivateMarka = true;

		request.setAttribute("allowToUpdatePrivateMarka", allowToUpdatePrivateMarka);
	}

	private void allowToUpdateAdditionalRemark(final HttpServletRequest request, final HashMap<Long, ExecutiveFeildPermissionDTO> execFldPermissionsHM) {
		request.setAttribute("allowToUpdateAdditionalRemark", execFldPermissionsHM.get(FeildPermissionsConstant.EDIT_ADDITIONAL_REMARK) != null);
	}

	private void showWayBillVehicleTypeUpdateLink(final HttpServletRequest request, final WayBill wayBill, final ConsignmentSummary consignmentSummary, final Executive executive, final HashMap<Long, ExecutiveFeildPermissionDTO> execFldPermissionsHM, final ValueObject groupConfiguration) {
		request.setAttribute("showWayBillVehicleTypeUpdateLink", wayBill.getStatus() != WayBillStatusConstant.WAYBILL_STATUS_CANCELLED
				&& wayBill.getStatus() != WayBillStatusConstant.WAYBILL_STATUS_DELIVERED
				&& (consignmentSummary.getBookingTypeId() == BookingTypeConstant.BOOKING_TYPE_FTL_ID
				|| wayBill.getBookingTypeId() == BookingTypeConstant.BOOKING_TYPE_SUNDRY_ID && groupConfiguration.getBoolean(GroupConfigurationPropertiesConstant.SHOW_VEHICLE_NUMBER_AND_VEHICLE_TYPE_ON_SUNDRY, false)
				|| wayBill.getBookingTypeId() == BookingTypeConstant.DIRECT_DELIVERY_DIRECT_VASULI_ID && groupConfiguration.getBoolean(GroupConfigurationPropertiesConstant.SHOW_TRUCK_TYPE_ON_DDDV, false))
				&& (wayBill.getSourceBranchId() == executive.getBranchId() || executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN)
				&& execFldPermissionsHM.get(FeildPermissionsConstant.EDIT_LR_VEHICLE_TYPE) != null);
	}

	private void allowToUpdateCategoryType(final HttpServletRequest request, final Branch srcBranch, final Map<Long, ExecutiveFeildPermissionDTO> execFldPermissionsHM, final Executive executive) throws Exception {
		var 	allowToUpdateCategoryType 	= false;

		try {
			if (execFldPermissionsHM.get(FeildPermissionsConstant.EDIT_CATEGORY_TYPE_AFTER_BOOKING) != null)
				allowToUpdateCategoryType	= checkUserWiseEditAllow(request, executive, srcBranch);

			request.setAttribute("allowToUpdateCategoryType", allowToUpdateCategoryType);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private void allowToUpdateWithBillEstimate(final HttpServletRequest request, final WayBill wayBill, final Branch srcBranch, final Map<Long, ExecutiveFeildPermissionDTO> execFldPermissionsHM, final Executive executive) throws Exception {
		var 	allowToUpdateWithBillEstimate 	= false;

		try {
			if (wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_BOOKED
					&& execFldPermissionsHM.get(FeildPermissionsConstant.EDIT_WITH_BILL_ESTIMATE_AFTER_BOOKING) != null) {
				allowToUpdateWithBillEstimate	= checkUserWiseEditAllow(request, executive, srcBranch);

				if (wayBill.getBookingCrossingAgentId() > 0)
					allowToUpdateWithBillEstimate = false;
			}

			request.setAttribute("allowToUpdateWithBillEstimate", allowToUpdateWithBillEstimate);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private boolean checkUserWiseEditAllow(final HttpServletRequest request, final Executive executive, final Branch srcBranch) throws Exception {
		final var	branch	= cache.getGenericBranchDetailCache(request, executive.getBranchId());

		return switch (executive.getExecutiveType()) {
		case ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN -> true;
		case ExecutiveTypeConstant.EXECUTIVE_TYPE_REGIONADMIN -> branch.getRegionId() == srcBranch.getRegionId();
		case ExecutiveTypeConstant.EXECUTIVE_TYPE_SUBREGIONADMIN -> branch.getSubRegionId() == srcBranch.getSubRegionId();
		default -> srcBranch.getBranchId() == executive.getBranchId();
		};
	}

	private void showEditGodownUpdateLink(final HttpServletRequest request, final WayBill wayBill, final GodownUnloadDetails godownUnloadDetails, final HashMap<Long, ExecutiveFeildPermissionDTO> execFldPermissionsHM, final Executive executive) throws Exception {
		String		receivedAt  				= null;

		try {
			final var showEditGodownUpdateLink = wayBill.getStatus() != WayBillStatusConstant.WAYBILL_STATUS_CANCELLED && wayBill.getStatus() != WayBillStatusConstant.WAYBILL_STATUS_DELIVERED
					&& wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_RECEIVED && execFldPermissionsHM.get(FeildPermissionsConstant.EDIT_GODOWN_AFTER_RECEIVE) != null;

			if(showEditGodownUpdateLink && godownUnloadDetails != null) {
				final var	godowns = GodownDao.getInstance().getGodownList(godownUnloadDetails.getGodownBranchId(), executive.getAccountGroupId());

				if(godowns != null && godowns.length > 1)
					request.setAttribute("godownCount", godowns.length);
			}

			if (wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_RECEIVED
					|| wayBill.getStatus() 	== WayBillStatusConstant.WAYBILL_STATUS_CANCELLED_DELIVERY) {
				final var	receivedAtBranchName		= cache.getGenericBranchDetailCache(request, wayBill.getBranchId()).getName();

				if(receivedAtBranchName != null)
					receivedAt = receivedAtBranchName + (godownUnloadDetails != null ? " - " + godownUnloadDetails.getGodownName():"");

				request.setAttribute("ReceivedAt", receivedAt);
				request.setAttribute("godownId", godownUnloadDetails != null ? godownUnloadDetails.getGodownId() : 0);
				request.setAttribute("ReceivedAtBranchId", godownUnloadDetails != null ? godownUnloadDetails.getGodownBranchId() : 0);
			}

			request.setAttribute("showEditGodownUpdateLink", showEditGodownUpdateLink);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private void showWayBillDelcaredValueUpdateLink(final HttpServletRequest request, final WayBill wayBill, final Executive executive, final HashMap<Long, ExecutiveFeildPermissionDTO> execFldPermissionsHM) {
		final var showWayBillDelcaredValueUpdateLink = checkSourceAndDestinationBranchForEdit(wayBill, executive)
				&& (wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_BOOKED && execFldPermissionsHM.get(FeildPermissionsConstant.EDIT_LR_DECLARED_VALUE_AFTER_BOOKING) != null
				|| wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DISPATCHED && execFldPermissionsHM.get(FeildPermissionsConstant.EDIT_LR_DECLARED_VALUE_AFTER_DISPATCH) != null
				|| checkReceiveStatusForEdit(wayBill) && execFldPermissionsHM.get(FeildPermissionsConstant.EDIT_LR_DECLARED_VALUE_AFTER_RECEIVE) != null);

		request.setAttribute("showWayBillDelcaredValueUpdateLink", showWayBillDelcaredValueUpdateLink);
	}

	private void showWayBillInvoiceNoUpdateLink(final HttpServletRequest request, final WayBill wayBill, final Executive executive, final HashMap<Long, ExecutiveFeildPermissionDTO> execFldPermissionsHM) {
		// WayBill Invoice Number Update
		final var showWayBillInvoiceNoUpdateLink = checkSourceAndDestinationBranchForEdit(wayBill, executive)
				&& (wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_BOOKED && execFldPermissionsHM.get(FeildPermissionsConstant.EDIT_LR_INVOICE_NUMBER_AFTER_BOOKING) != null
				|| wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DISPATCHED && execFldPermissionsHM.get(FeildPermissionsConstant.EDIT_LR_INVOICE_NUMBER_AFTER_DISPATCH) != null
				|| checkReceiveStatusForEdit(wayBill) && execFldPermissionsHM.get(FeildPermissionsConstant.EDIT_LR_INVOICE_NUMBER_AFTER_RECEIVE) != null
				|| wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DELIVERED && execFldPermissionsHM.get(FeildPermissionsConstant.EDIT_LR_INVOICE_NUMBER_AFTER_DELIVERY) != null);

		request.setAttribute("showWayBillInvoiceNoUpdateLink", showWayBillInvoiceNoUpdateLink);
	}

	private void showUpdateOTLRLink(final HttpServletRequest request, final WayBill wayBill, final HashMap<Long, ExecutiveFeildPermissionDTO> execFldPermissionsHM) {
		request.setAttribute("showUpdateOTLRLink", wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_BOOKED && execFldPermissionsHM.get(FeildPermissionsConstant.UPDATE_OTLR_AFTER_BOOKING) != null
				|| wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DISPATCHED && execFldPermissionsHM.get(FeildPermissionsConstant.UPDATE_OTLR_AFTER_DISPATCH) != null	);
	}

	private void showEditDeliveryPaymentLink(final HttpServletRequest request, final WayBill wayBill, final DeliveryContactDetails deliveryContactDetails, final HashMap<Long, ExecutiveFeildPermissionDTO> execFldPermissionsHM) {
		request.setAttribute("showEditDeliveryPaymentLink", wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DELIVERED && deliveryContactDetails != null && !deliveryContactDetails.isMultiple() && deliveryContactDetails.getPaymentType() != PaymentTypeConstant.PAYMENT_TYPE_CROSSING_CREDIT_ID && execFldPermissionsHM.get(FeildPermissionsConstant.EDIT_DELIVERY_PAYMENT) != null);
	}

	private void showWayBillDeliveryAtUpdateLink(final HttpServletRequest request, final WayBill wayBill, final HashMap<Long, ExecutiveFeildPermissionDTO> execFldPermissionsHM, final Branch srcBranch, final Executive executive, final Branch destBranch) throws Exception {
		try {
			final var	showWayBillDeliveryAtUpdateLink = (wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_BOOKED && execFldPermissionsHM.get(FeildPermissionsConstant.EDIT_LR_DELIVERY_TO_AFTER_BOOKING) != null
					|| wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DISPATCHED && execFldPermissionsHM.get(FeildPermissionsConstant.EDIT_LR_DELIVERY_TO_AFTER_DISPATCH) != null
					|| checkReceiveStatusForEdit(wayBill) && execFldPermissionsHM.get(FeildPermissionsConstant.EDIT_LR_DELIVERY_TO_AFTER_RECEIVE) != null
					|| wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DELIVERED && execFldPermissionsHM.get(FeildPermissionsConstant.EDIT_LR_DELIVERY_TO_AFTER_DELIVERY) != null)
					&& (checkUserTypeWiseSorceUserPermission(executive, srcBranch, srcBranch.getBranchId())
							|| (checkReceiveStatusForEdit(wayBill) || wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DELIVERED) && checkUserTypeWiseSorceUserPermission(executive, destBranch, destBranch.getBranchId()));

			request.setAttribute("showWayBillDeliveryAtUpdateLink", showWayBillDeliveryAtUpdateLink);
		} catch (final NullPointerException e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private boolean checkUserTypeWiseSorceUserPermission(final Executive executive, final Branch srcBranch, final long branchId) {
		return executive.getBranchId() == branchId
				|| executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_SUBREGIONADMIN && executive.getSubRegionId() == srcBranch.getSubRegionId()
				|| executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_REGIONADMIN && executive.getRegionId() == srcBranch.getRegionId()
				|| executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN;
	}

	private void showWayBillBookingTypeUpdateLink(final HttpServletRequest request, final WayBill wayBill, final boolean isBillCreated, final HashMap<?, ?> execFldPermissionsHM, final Branch srcBranch
			, final Map<Object, Object>	lrViewConfiguration, final Executive executive, final ValueObject generalConfiguration) throws Exception {
		var 				showWayBillBookingTypeUpdateLink 	= false;

		try {
			final var	updateBookingTypeOnlyForTbbLr		= (boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.UPDATE_BOOKING_TYPE_ONLY_FOR_TBBLR, false);

			if(wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_BOOKED && execFldPermissionsHM.get(FeildPermissionsConstant.EDIT_LR_BOOKING_TYPE_AFTER_BOOKING) != null
					|| wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DISPATCHED && execFldPermissionsHM.get(FeildPermissionsConstant.EDIT_LR_BOOKING_TYPE_AFTER_DISPATCH) != null
					|| checkReceiveStatusForEdit(wayBill) && execFldPermissionsHM.get(FeildPermissionsConstant.EDIT_LR_BOOKING_TYPE_AFTER_RECEIVED) != null
					|| wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DELIVERED && execFldPermissionsHM.get(FeildPermissionsConstant.EDIT_LR_BOOKING_TYPE_AFTER_DELIVERY) != null
					|| wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CANCELLED_DELIVERY && execFldPermissionsHM.get(FeildPermissionsConstant.EDIT_LR_BOOKING_TYPE_AFTER_CANCELLED_DELIVERY) != null
					) {
				if((wayBill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT && updateBookingTypeOnlyForTbbLr || !updateBookingTypeOnlyForTbbLr)
						&& checkUserTypeWiseSorceUserPermission(executive, srcBranch, srcBranch.getBranchId()))
					showWayBillBookingTypeUpdateLink = true;

				if(updateBookingTypeOnlyForTbbLr) {
					if(wayBill.getWayBillTypeId()  == WayBillTypeConstant.WAYBILL_TYPE_PAID
							&& (wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_BOOKED
							|| wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DISPATCHED
							|| wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_RECEIVED))
						showWayBillBookingTypeUpdateLink = true;

					if(wayBill.getWayBillTypeId()  == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY
							&& (wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_BOOKED
							|| wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DISPATCHED
							|| wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_RECEIVED))
						showWayBillBookingTypeUpdateLink = true;
				}

				if(isBillCreated)
					showWayBillBookingTypeUpdateLink = false;

				if(generalConfiguration.getBoolean(GeneralConfigurationPropertiesConstant.DO_NOT_ALLOW_LR_DETAIL_CHANGE_AFTER_AGENT_BRANCH_HISAB_SETTLED, false)) {
					final var 	isBranchHisabSettledForAgentBranch	= PendingHisabForAgentBranchDaoImpl.getInstance() .getHisabDetailsForAgentBranchByWaybillId(wayBill.getWayBillId());
					final var  	isBranchHisabSettledByAgentBranch	= PendingHisabByAgentBranchDaoImpl.getInstance().getHisabDetailsByAgentBranchByWaybillId(wayBill.getWayBillId());
					final var  	isAgentBranchHisabSettledForDispatch = AgentHisabDispatchSummaryDaoImpl.getInstance().getAgentHisabDispatchSummaryDetails("ds.WayBillId = " + wayBill.getWayBillId());
					final var  	isAgentBranchHisabSettledForCommission = AgentHisabCommissionSummaryDaoImpl.getInstance().getAgenBranchtCommissionHisabDetailsByAgentBranchByWaybillId(wayBill.getWayBillId());

					if(isBranchHisabSettledForAgentBranch || isBranchHisabSettledByAgentBranch || isAgentBranchHisabSettledForDispatch || isAgentBranchHisabSettledForCommission)
						showWayBillBookingTypeUpdateLink = false;
				}

			}

			request.setAttribute("showWayBillBookingTypeUpdateLink", showWayBillBookingTypeUpdateLink);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private boolean checkLRStatusWiseEditLRTypePermission(final WayBill wayBill, final HashMap<Long, ExecutiveFeildPermissionDTO> execFldPermissionsHM, final DeliveryContactDetails deliveryContactDetails) {
		return wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_BOOKED && execFldPermissionsHM.get(FeildPermissionsConstant.EDIT_LR_TYPE_AFTER_BOOKING) != null
				|| wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DISPATCHED && execFldPermissionsHM.get(FeildPermissionsConstant.EDIT_LR_TYPE_AFTER_DISPATCH) != null
				|| wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DUEDELIVERED && execFldPermissionsHM.get(FeildPermissionsConstant.EDIT_LR_TYPE_AFTER_DDM_DUEDELIVERED) != null
				|| wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DUEUNDELIVERED && execFldPermissionsHM.get(FeildPermissionsConstant.EDIT_LR_TYPE_AFTER_DDM_DUEUNDELIVERED) != null
				|| (wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_RECEIVED || wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DUEUNDELIVERED) && execFldPermissionsHM.get(FeildPermissionsConstant.EDIT_LR_TYPE_AFTER_RECEIVED) != null
				|| wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CANCELLED_DELIVERY && execFldPermissionsHM.get(FeildPermissionsConstant.EDIT_LR_TYPE_AFTER_CR_CANCELLED) != null
				|| wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DELIVERED && deliveryContactDetails != null && deliveryContactDetails.getPaymentType() == PaymentTypeConstant.PAYMENT_TYPE_CROSSING_CREDIT_ID && execFldPermissionsHM.get(FeildPermissionsConstant.EDIT_LR_TYPE_AFTER_CROSSING_AGENT_DELIVERY) != null;
	}

	private boolean isEditAllowForDestinationBranch(final WayBill wayBill, final ArrayList<Long> deliveryLocationList, final Executive executive) {
		return deliveryLocationList.contains(wayBill.getDestinationBranchId()) && deliveryLocationList.contains(wayBill.getBranchId())
				|| executive.getBranchId() == wayBill.getDestinationBranchId()
				|| executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN;
	}

	private boolean checkPermissionForEditLRTypeAtDestination(final WayBill wayBill, final ArrayList<Long> deliveryLocationList, final HashMap<Long, ExecutiveFeildPermissionDTO> execFldPermissionsHM, final Executive executive) {
		return execFldPermissionsHM.get(FeildPermissionsConstant.EDIT_LR_TYPE_AT_DESTINATION) != null
				&& (wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_RECEIVED || wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CANCELLED_DELIVERY || wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DUEUNDELIVERED)
				&& isEditAllowForDestinationBranch(wayBill, deliveryLocationList, executive);
	}

	private void showWayBillTypeUpdateLink(final HttpServletRequest request, final WayBill wayBill, final boolean isBillCreated, final HashMap<Long, ExecutiveFeildPermissionDTO> execFldPermissionsHM,
			final Branch srcBranch, final Map<Object, Object> lrViewConfiguration, final DeliveryContactDetails deliveryContactDetails, final Executive executive) throws Exception {
		var					showWayBillTypeUpdateLink		= false;
		WayBillCrossing		wayBillCrossingModel			= null;

		try {
			final var	deliveryLocationList 	= cache.getAssignedLocationsIdListByLocationIdId(request, executive.getBranchId(), executive.getAccountGroupId());

			if((wayBill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY || wayBill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT)
					&& (checkLRStatusWiseEditLRTypePermission(wayBill, execFldPermissionsHM, deliveryContactDetails)
							|| checkPermissionForEditLRTypeAtDestination(wayBill, deliveryLocationList, execFldPermissionsHM, executive))) {
				if(wayBill.getBookingCrossingAgentId() > 0 || deliveryContactDetails != null && !deliveryContactDetails.isMultiple()
						&& deliveryContactDetails.getPaymentType() == PaymentTypeConstant.PAYMENT_TYPE_CROSSING_CREDIT_ID)
					wayBillCrossingModel	= WayBillCrossingDao.getInstance().getWayBillCrossingAgentDataByWayBillId(wayBill.getWayBillId());

				if (wayBillCrossingModel != null || checkCrossingAgentBillForEdit(wayBill))
					showWayBillTypeUpdateLink	= false;
				else {
					showWayBillTypeUpdateLink 	= checkUserTypeWiseSorceUserPermission(executive, srcBranch, wayBill.getBookingBranchId());

					if(isEditAllowForDestinationBranch(wayBill, deliveryLocationList, executive))
						showWayBillTypeUpdateLink = true;

					if(wayBill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT && isBillCreated)
						showWayBillTypeUpdateLink = false;

					//For cancelled CR, only ToPay LR is allowed
					if(wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CANCELLED_DELIVERY && wayBill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY)
						showWayBillTypeUpdateLink = true;
				}

				if(showWayBillTypeUpdateLink && (boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.ALLOW_LR_TYPE_EDIT_ONLY_TO_CREATION_BRANCH_OR_GROUP_ADMIN, false))
					showWayBillTypeUpdateLink = executive.getBranchId() == srcBranch.getBranchId() || executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN;
			}

			if(wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DELIVERED && (wayBill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY || wayBill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT) && deliveryContactDetails != null && deliveryContactDetails.getPaymentType() != PaymentTypeConstant.PAYMENT_TYPE_CROSSING_CREDIT_ID
					|| isAgentBranchComissionBillCreated || wayBill.getAccountGroupId() != executive.getAccountGroupId())
				showWayBillTypeUpdateLink = false;

			request.setAttribute("showWayBillTypeUpdateLink", showWayBillTypeUpdateLink);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private void showWayBillDestinationUpdateLink(final HttpServletRequest request, final WayBill wayBill, final ConsignmentSummary consignmentSummary, final boolean isBillCreated, final HashMap<?, ?> execFldPermissionsHM
			, final Map<Object, Object> lrViewConfiguration, final Executive executive) throws Exception {
		var 								showWayBillDestinationUpdateLink			= false;
		var									pendingQuantity		  						= 0L;
		var									allowToEditDestForOwnReceivedLR				= true;

		try {
			final var	quantityMismatchCheckingToEditDestination		= (boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.QUANTITY_MISMATCH_CHECKING_TO_EDIT_DESTINATION, true);

			final var	isPendingDeliveryTableEntry = cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_PENDING_DELIVERY_STOCK_TABLE_ENTRY) == ConfigParam.CONFIG_KEY_PENDING_DELIVERY_STOCK_TABLE_ENTRY_ALLOWED;

			if(wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_BOOKED && execFldPermissionsHM.get(FeildPermissionsConstant.EDIT_AFTER_BOOKING) != null
					|| (wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_RECEIVED
					|| wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CANCELLED_DELIVERY) && execFldPermissionsHM.get(FeildPermissionsConstant.EDIT_AFTER_RECEIVED) != null
					|| wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DISPATCHED && execFldPermissionsHM.get(FeildPermissionsConstant.EDIT_AFTER_DISPATCH) != null)
				showWayBillDestinationUpdateLink = true;

			if(wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DELIVERED && execFldPermissionsHM.get(FeildPermissionsConstant.EDIT_DESTINATION_AFTER_DELIVERY) != null)
				showWayBillDestinationUpdateLink = true;

			if(wayBill.getDestinationBranchId() <= 0)
				showWayBillDestinationUpdateLink = false;

			if(showWayBillDestinationUpdateLink && wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DISPATCHED)
				showWayBillDestinationUpdateLink = !DispatchSummaryDao.getInstance().getLastDispatchSummaryOfWayBill(wayBill.getWayBillId());

			if(showWayBillDestinationUpdateLink && wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_RECEIVED) {
				if(isPendingDeliveryTableEntry) {
					final var	pendingDeliveryStock = PendingDeliveryStockDao.getInstance().checkForWayBillId(wayBill.getWayBillId());

					if(quantityMismatchCheckingToEditDestination
							&& pendingDeliveryStock != null
							&& pendingDeliveryStock.getPendingQuantity() != consignmentSummary.getQuantity())
						showWayBillDestinationUpdateLink = false;
				}

				final var	pdsList = PendingDispatchStockDao.getInstance().getPendingDispatchQuantityByWayBillId(wayBill.getWayBillId(), wayBill.getBranchId());

				if(pdsList != null && !pdsList.isEmpty()) {
					pendingQuantity	= pdsList.stream().mapToLong(PendingDispatchStock::getPendingQuantity).sum();

					if(quantityMismatchCheckingToEditDestination && pendingQuantity != consignmentSummary.getQuantity())
						showWayBillDestinationUpdateLink = false;
				}
			}

			if((boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.DONOT_ALLOW_TO_UPDATE_DESTINATION_FOR_NORMAL_USER, false)
					&& execFldPermissionsHM.get(FeildPermissionsConstant.EDIT_AFTER_RECEIVED) != null
					&& checkEditPermissionForNormalUserAfterReceive(wayBill, executive))
				allowToEditDestForOwnReceivedLR = false;

			if(showWayBillDestinationUpdateLink)
				showWayBillDestinationUpdateLink		= isCashStatementEntryAllowed(request) || isTokenWiseLR;

			if(isBillCreated)
				showWayBillDestinationUpdateLink = false;

			request.setAttribute("allowToEditDestForOwnReceivedLR", allowToEditDestForOwnReceivedLR);
			request.setAttribute("showWayBillDestinationUpdateLink", showWayBillDestinationUpdateLink);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private void getFormNumber(final HttpServletRequest request, final FormTypes[] formTypesArr) throws Exception {
		final var	formNumberDetails		= new StringJoiner(",");

		try {
			if(formTypesArr != null && formTypesArr.length > 0)
				for (final FormTypes element : formTypesArr)
					if(element.getFormNumber() != null) {
						final var	formNumber		= Utility.checkedNullCondition(element.getFormNumber(), (short) 1);

						if(element.getFormTypesId() == FormTypeConstant.E_SUGAM_NO_ID)
							formNumberDetails.add("<b>E-Sugam Number : </b>" + formNumber);
						else if(element.getFormTypesId() == FormTypeConstant.WAYBILL_AND_CC_ID)
							formNumberDetails.add("<b>WayBill+CC Number : </b>" + formNumber);
						else if(element.getFormTypesId() == FormTypeConstant.E_WAYBILL_ID)
							formNumberDetails.add("<b>E-WayBill Number : </b>" + formNumber);
						else if(element.getFormTypesId() == FormTypeConstant.HSN_CODE)
							formNumberDetails.add("<b>HSN Code : </b>" + formNumber);
						else if(element.getFormTypesId() == FormTypeConstant.SAC_CODE)
							formNumberDetails.add("<b>SAC Code : </b>" + formNumber);
						else
							formNumberDetails.add("<b>WayBill Number : </b>" + formNumber);
					}

			if(formNumberDetails.length() == 0) return;

			request.setAttribute("formNumberDetails", formNumberDetails.toString());
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private void getPODRelatedPermission(final HttpServletRequest request, final Map<Object, Object> podConfiguration, final PODWaybillsDto podWaybillsDto, final WayBill wayBill, final HashMap<Long, ExecutiveFeildPermissionDTO> execFldPermissionsHM) throws Exception {
		try {
			final var	uploadPOD						= (boolean) podConfiguration.getOrDefault(PodWayBillPropertiesConstant.UPLOAD_POD, false);
			final var	receivePOD						= (boolean) podConfiguration.getOrDefault(PodWayBillPropertiesConstant.RECEIVE_POD, false);
			final var	showPODRequiredFeildAtBooking	= (boolean) podConfiguration.getOrDefault(PodWayBillPropertiesConstant.SHOW_POD_REQUIRED_FEILD_AT_BOOKING, false);
			var	showPODRequired					= showPODRequiredFeildAtBooking;

			if(podWaybillsDto != null) {
				final var podStatus 	= new StringBuilder();

				final var isCrosiing = new StringBuilder();

				if(podWaybillsDto.isCrossing())
					isCrosiing.append("Crossing");

				if(uploadPOD) {
					if(podWaybillsDto.isPODUploaded()) {
						final var uploadedDate	= DateTimeUtility.getDateFromTimeStampWithAMPM(podWaybillsDto.getPodUploadTimeStamp());
						request.setAttribute("displayPODUploadLink", true);
						podStatus.append(getPODStatus(Color.GREEN, Color.WHITE, PODStatusConstant.POD_STATUS_UPLOADED_NAME + " ( on " + uploadedDate + ")", podWaybillsDto.getPodStatus(), isCrosiing));
					} else
						podStatus.append(getPODStatus(Color.RED, Color.WHITE, PODStatusConstant.POD_STATUS_NOT_UPLOADED_NAME, podWaybillsDto.getPodStatus(), isCrosiing));
				} else if(receivePOD) {
					if(podWaybillsDto.isPODRecevied()) {
						final var receivedDate	= DateTimeUtility.getDateFromTimeStampWithAMPM(podWaybillsDto.getPodRecievedDateTimestamp());
						podStatus.append(getPODStatus(Color.GREEN, Color.WHITE, PODStatusConstant.POD_STATUS_RECEIVED_NAME + " ( on " + receivedDate + ")", podWaybillsDto.getPodStatus(), isCrosiing));
					} else
						podStatus.append(getPODStatus(Color.RED, Color.WHITE, PODStatusConstant.POD_STATUS_NOT_RECEIVED_NAME, podWaybillsDto.getPodStatus(), isCrosiing));
				} else
					podStatus.append("<span style = 'background-color: " + Color.RED + "; color: " + Color.WHITE + "'> POD - " + PODStatusConstant.getDispatchStatus(podWaybillsDto.getPodStatus()) + " " + isCrosiing.toString() + " </span>");

				request.setAttribute("podStatus", podStatus.toString());

				request.setAttribute("isDispatched", true);

				/*
				 * POD Dispatch Status is Pending then Show POD Required
				 */
				showPODRequired	= showPODRequiredFeildAtBooking && podWaybillsDto.getPodStatus() == PODStatusConstant.POD_DISPATCH_STATUS_PENDING;
			}

			final var	showPODEditRemarkLink 		= execFldPermissionsHM.get(FeildPermissionsConstant.EDIT_POD_REMARK) != null && wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DELIVERED
					&& podWaybillsDto != null && podWaybillsDto.isPODRecevied() && podWaybillsDto.isPODUploaded();

			final var	showPODRequiredEditLink		= showPODRequired && execFldPermissionsHM.get(FeildPermissionsConstant.EDIT_POD_REQUIRED) != null;

			request.setAttribute("showPODRequired", showPODRequired);
			request.setAttribute("showPODRequiredEditLink", showPODRequiredEditLink);
			request.setAttribute("showPODEditRemarkLink", showPODEditRemarkLink);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private String getPODStatus(final String bgColor, final String color, final String podStatusName, final short podStatus, final StringBuilder isCrosiing) {
		return "<span style = 'background-color: " + bgColor + "; color: " + color + "'> POD - " + podStatusName + " / " + PODStatusConstant.getDispatchStatus(podStatus) + " " + isCrosiing.toString() +"</span>";
	}

	private void allowEditConfigDiscount(final HttpServletRequest request, final WayBill wayBill, final HashMap<Long, ExecutiveFeildPermissionDTO> execFldPermissionsHM, final Map<Object, Object> lrViewConfiguration) throws Exception {
		try {
			final var	isConfigDiscountAllow				= (boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.IS_CONFIG_DISCOUNT_ALLOW, false);
			final var	allowConfigDiscountOfOwnBranch 		= (boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.ALLOW_CONFIG_DISCOUNT_OF_OWN_BRANCH, false);
			final var	showDiscountConfigForToPayOnly		= (boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.SHOW_DISCOUNT_CONFIG_FOR_TOPAY_ONLY, false);

			var allowEditConfigDiscountOfOwnBranch	= execFldPermissionsHM.get(FeildPermissionsConstant.ALLOW_CONFIG_DISCOUNT) != null
					&& (wayBill.getStatus() ==  WayBillStatusConstant.WAYBILL_STATUS_RECEIVED
					|| wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CANCELLED_DELIVERY
					|| wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DUEUNDELIVERED)
					&& wayBill.getWayBillTypeId() != WayBillTypeConstant.WAYBILL_TYPE_FOC
					&& (allowConfigDiscountOfOwnBranch || isConfigDiscountAllow);

			if(showDiscountConfigForToPayOnly && allowEditConfigDiscountOfOwnBranch)
				allowEditConfigDiscountOfOwnBranch	= wayBill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY;

			request.setAttribute("allowEditConfigDiscountOfOwnBranch", allowEditConfigDiscountOfOwnBranch);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private void checkToTakeLRAndCRPrint(final HttpServletRequest request, final WayBill wayBillForAll, final CustomerDetails consignorObj, final CustomerDetails consigneeObj, final HashMap<Short, CreditWayBillTxn> creditWBTxnColl, final ConsignmentSummary consignmentSummary, final DeliveryContactDetails deliveryContactDetails, final Executive executive) throws Exception {
		var 						isLrAllow 					       	 	= false;
		var 						isCrAllow 					        	= false;
		var							lrExportToPDFWithoutLRPrint				= false;
		var							noOfDaysDifference						= 0L;
		Timestamp 					creatationDate 							= null;
		Timestamp 					deliveryDate 							= null;
		CreditWayBillTxn			creditWBTxn								= null;
		CreditWayBillTxn			creditWBDeliveryTxn						= null;

		try {
			final var	execFldPermissionsHM					= cache.getExecutiveFieldPermission(request);
			final var	lrViewConfiguration						= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.LR_SEARCH);
			final var	groupConfiguration						= cache.getGroupConfiguration(request, executive.getAccountGroupId());
			final var	generateCRConfVal						= cache.getGenerateCRConfiguration(request, executive.getAccountGroupId());
			final var	showLRPrintAfterDispatch				= (boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.SHOW_LR_PRINT_AFTER_DISPATCH, false);
			final var	bookingLRPrintAfterDispatch				= execFldPermissionsHM.get(FeildPermissionsConstant.BOOKING_LR_PRINT_AFTER_DISPATCH);
			final var	allowLrPrintAfterShortCreditPayment		= execFldPermissionsHM.get(FeildPermissionsConstant.ALLOW_LR_PRINT_AFTER_SHORTCREDIT_PAYMENT);
			final var	allowCrPrintAfterShortCreditPayment		= execFldPermissionsHM.get(FeildPermissionsConstant.ALLOW_CR_PRINT_AFTER_SHORTCREDIT_PAYMENT);
			final var	showLRPrintBasedOnCookies				= Utility.getBoolean(request.getAttribute("showLRPrintBasedOnCookies"));
			final var	showCRPrintBasedOnCookies				= Utility.getBoolean(request.getAttribute("showCRPrintBasedOnCookies"));
			final var	doNotShowLrPrintLinkAfterDelivery 		= (boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.DO_NOT_SHOW_LR_PRINT_LINK_AFTER_DELIVERY, false);
			final var	doNotShowCrPrintLinkAfterDelivery 		= (boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.DO_NOT_SHOW_CR_PRINT_LINK_AFTER_DELIVERY, false);
			final var	doNotShowLrCrLinkAfterNoOfDays	  		= (int) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.DO_NOT_SHOW_LR_CR_LINK_AFTER_NO_OF_DAYS,0);
			final var	doNotShowLRAndCRPrintAfterSomeDays 	 	= (boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.DO_NOT_SHOW_LR_AND_CR_PRINT_AFTER_SOME_DAYS,false);
			final var	doNotAllowLRPrintForshortCreditPayment 	= groupConfiguration.getBoolean(GroupConfigurationPropertiesDTO.DO_NOT_ALLOW_LR_PRINT_FOR_SHORT_CREDIT_PAYMENT,false);
			final var	doNotAllowCRPrintForshortCreditPayment 	= generateCRConfVal.getBoolean(GenerateCashReceiptDTO.DO_NOT_ALLOW_CR_PRINT_FOR_SHORT_CREDIT_PAYMENT,false);
			final var	bookingBranch							= cache.getBranchById(request, wayBillForAll.getAccountGroupId(), wayBillForAll.getBookingBranchId());
			final var	deliveryBranch							= cache.getBranchById(request, wayBillForAll.getAccountGroupId(), wayBillForAll.getDeliveryBranchId());
			final var	lrTypeIdsForPrint						= groupConfiguration.getString(GroupConfigurationPropertiesDTO.LR_TYPE_IDS_FOR_PRINT);

			if((showLRPrintAfterDispatch || bookingLRPrintAfterDispatch != null) && (wayBillForAll.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_BOOKED
					|| wayBillForAll.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DISPATCHED
					|| wayBillForAll.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_RECEIVED
					|| wayBillForAll.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_ARRIVED
					|| wayBillForAll.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CANCELLED_DELIVERY)) {
				if(showLRPrintBasedOnCookies)
					isLrAllow = true;
			} else if(wayBillForAll.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DELIVERED
					|| wayBillForAll.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DUEDELIVERED) {
				if(showCRPrintBasedOnCookies)
					isCrAllow = true;
			} else if(wayBillForAll.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_BOOKED && showLRPrintBasedOnCookies)
				isLrAllow = true;

			if((boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.SHOW_LR_PRINT_IN_ALL_STATUS, false)
					&& wayBillForAll.getStatus() != WayBillStatusConstant.WAYBILL_STATUS_CANCELLED)
				isLrAllow = true;

			if((boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.SHOW_LR_PRINT_OPTION_AFTER_DDM_CREATE, false)
					&&	(wayBillForAll.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DUEDELIVERED
					|| wayBillForAll.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DUEUNDELIVERED))
				isLrAllow = true;

			if((boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.SHOW_LR_PRINT_BASED_ON_GSTN, false))
				isLrAllow 	= StringUtils.isNotEmpty(consignorObj.getGstn()) || StringUtils.isNotEmpty(consigneeObj.getGstn());

			final var	lrPrintPermission = execFldPermissionsHM.get(FeildPermissionsConstant.LR_PRINT_PERMISSION);

			if((boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.SHOW_PRINT_ON_PERMISSION_BASED, false)
					&& wayBillForAll.getStatus() != WayBillStatusConstant.WAYBILL_STATUS_DELIVERED && lrPrintPermission != null && wayBillForAll.getStatus() != WayBillStatusConstant.WAYBILL_STATUS_CANCELLED)
				isLrAllow = true;

			if((boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.SHOW_CHARGES_TO_GROUPADMIN_AND_LR_EXECUTIVE, false)) {
				isLrAllow = true;

				if(Utility.isIdExistInLongList(lrViewConfiguration, LrViewConfigurationPropertiesConstant.LR_TYPE_TO_SHOW_BOOKING_AMOUNT_TO_GROUP_ADMIN, wayBillForAll.getWayBillTypeId()))
					isLrAllow = executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_GROUPADMIN || executive.getExecutiveId() == wayBillForAll.getBookedByExecutiveId();
			} else if(isLrAllow || wayBillForAll.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DELIVERED && lrPrintPermission != null && showLRPrintBasedOnCookies)
				isLrAllow		= true;

			if(!isAllowToEdit && !isAllowToPrint) {
				isLrAllow	= false;
				isCrAllow	= false;
			}

			if((boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.SHOW_LR_PRINT_EXECUTIVE_PERMISSION_BASED, false))
				isLrAllow = execFldPermissionsHM.get(FeildPermissionsConstant.LR_PRINT_PERMISSION_BASED) != null && wayBillForAll.getStatus() != WayBillStatusConstant.WAYBILL_STATUS_CANCELLED;

			if(doNotShowLRAndCRPrintAfterSomeDays && executive.getExecutiveType() != ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN && wayBillForAll.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DELIVERED) {
				creatationDate 		= DateTimeUtility.getCurrentTimeStamp();
				deliveryDate   		= wayBillForAll.getDeliveryDateTime();
				noOfDaysDifference 	= DateTimeUtility.getDayDiffBetweenTwoDates(deliveryDate,creatationDate);

				if(noOfDaysDifference > doNotShowLrCrLinkAfterNoOfDays) {
					if(doNotShowLrPrintLinkAfterDelivery)
						isLrAllow 	= false;

					if(doNotShowCrPrintLinkAfterDelivery)
						isCrAllow	= false;
				}
			}

			if(creditWBTxnColl != null) {
				creditWBTxn 		= creditWBTxnColl.get(CreditWayBillTxn.TXN_TYPE_BOOKING_ID);
				creditWBDeliveryTxn = creditWBTxnColl.get(CreditWayBillTxn.TXN_TYPE_DELIVERY_ID);
			}

			if(doNotAllowLRPrintForshortCreditPayment && allowLrPrintAfterShortCreditPayment == null
					&& bookingBranch.getSubRegionId() == SubRegion.SUBREGION_ID_SCC_HEAD_OFFICE
					&& consignmentSummary.getPaymentType() == PaymentTypeConstant.PAYMENT_TYPE_CREDIT_ID
					&& (creditWBTxn == null || creditWBTxn.getPaymentStatus() != BillClearanceStatusConstant.BILL_CLEARANCE_STATUS_CLEAR_PAYMENT_ID
					&& creditWBTxn.getPaymentStatus() != BillClearanceStatusConstant.BILL_CLEARANCE_STATUS_NEGOTIATED_ID))
				isLrAllow = false;

			if(doNotAllowCRPrintForshortCreditPayment && allowCrPrintAfterShortCreditPayment == null
					&& deliveryBranch != null
					&& deliveryBranch.getSubRegionId() == SubRegion.SUBREGION_ID_SCC_HEAD_OFFICE
					&& deliveryContactDetails != null && deliveryContactDetails.getPaymentType() == PaymentTypeConstant.PAYMENT_TYPE_CREDIT_ID
					&& (creditWBDeliveryTxn == null || creditWBDeliveryTxn.getPaymentStatus() != BillClearanceStatusConstant.BILL_CLEARANCE_STATUS_CLEAR_PAYMENT_ID
					&& creditWBDeliveryTxn.getPaymentStatus() != BillClearanceStatusConstant.BILL_CLEARANCE_STATUS_NEGOTIATED_ID))
				isCrAllow = false;

			var	isLrPrintExportToPdf	= isLrAllow && execFldPermissionsHM.get(FeildPermissionsConstant.LR_PRINT_EXPORT_TO_PDF) != null;
			final var	isCrPrintExportToPdf	= isCrAllow && execFldPermissionsHM.get(FeildPermissionsConstant.CR_PRINT_EXPORT_TO_PDF) != null;

			if(!isLrAllow && wayBillForAll.getStatus() != WayBillStatusConstant.WAYBILL_STATUS_CANCELLED && (boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.LR_EXPORT_TO_PDF_WITHOUT_LR_PRINT, false)
					&& execFldPermissionsHM.get(FeildPermissionsConstant.LR_PRINT_EXPORT_TO_PDF) != null) {
				lrExportToPDFWithoutLRPrint = true;
				isLrPrintExportToPdf		= true;
			}

			if(isLrAllow && lrTypeIdsForPrint != null && !"0".equals(StringUtils.trim(lrTypeIdsForPrint))) {
				final var waybillTypeList	= CollectionUtility.getLongListFromString(lrTypeIdsForPrint);

				if(!waybillTypeList.contains(wayBillForAll.getWayBillTypeId())) isLrAllow = false;
			}

			request.setAttribute("isLrAllow", isLrAllow);
			request.setAttribute("isLrPreviewAllow", isLrAllow && (boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.SHOW_LR_PRINT_PREVIEW_BUTTON, false));
			request.setAttribute("isCrAllow", isCrAllow);
			request.setAttribute("isLrPrintExportToPdf", isLrPrintExportToPdf);
			request.setAttribute("isCrPrintExportToPdf", isCrPrintExportToPdf);
			request.setAttribute("lrExportToPDFWithoutLRPrint", lrExportToPDFWithoutLRPrint);

		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private void checkToTakeLRPdfEmail(final HttpServletRequest request, final WayBill wayBillForAll, final String wayBillTypeWiseAllowEmailServices, final HashMap<Long, ExecutiveFeildPermissionDTO> execFldPermissionsHM) throws Exception {
		var 							allowEmailServices			= false;

		try {
			final var	lrPdfEmailPermission = execFldPermissionsHM.get(FeildPermissionsConstant.LR_PDF_EMAIL_PERMISSION);

			if(lrPdfEmailPermission != null && wayBillForAll.getStatus() != WayBillStatusConstant.WAYBILL_STATUS_CANCELLED) {
				final var	wayBillTypeList		= CollectionUtility.getLongListFromString(wayBillTypeWiseAllowEmailServices);

				allowEmailServices 	= wayBillTypeList != null && !wayBillTypeList.isEmpty() && wayBillTypeList.contains(wayBillForAll.getWayBillTypeId());
			}

			request.setAttribute("allowEmailServices", allowEmailServices);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private void displayUnitPerRate(final HttpServletRequest request, final ConsignmentSummary consignmentSummary, final ConsignmentDetails[] consignment, final HashMap<Long, WayBillCharges> htbookingCount,
			final Map<Object, Object> lrViewConfiguration, final Executive executive) throws Exception {
		var					unitPerRate				= "";

		try {
			if(consignmentSummary.getChargeTypeId() == ChargeTypeConstant.CHARGETYPE_ID_WEIGHT
					&& consignmentSummary.getRateApplyOnChargeType() == ChargeTypeConstant.CHARGETYPE_ID_QUANTITY) {
				if(consignment[0].getAmount() > 0)
					unitPerRate	= consignment[0].getAmount() + " / Article ";
				else if(consignmentSummary.getAmount() > 0 && consignment[0].getQuantity() > 0)
					unitPerRate	= consignmentSummary.getAmount() / consignment[0].getQuantity() + " / Article ";

				if(!"".equals(unitPerRate))
					unitPerRate	= "Article Rate : " + unitPerRate;
			} else if(consignmentSummary.getChargeTypeId() == ChargeTypeConstant.CHARGETYPE_ID_QUANTITY
					&& consignmentSummary.getRateApplyOnChargeType() == ChargeTypeConstant.CHARGETYPE_ID_WEIGHT) {
				var	freightAmt	= 0.0;

				if(htbookingCount != null && htbookingCount.get((long) BookingChargeConstant.FREIGHT) != null)
					freightAmt		= htbookingCount.get((long) BookingChargeConstant.FREIGHT).getChargeAmount();

				unitPerRate	= "Weight Rate : " + Utility.round(freightAmt / consignmentSummary.getChargeWeight(), 2) + " / kg";
			}

			if("".equals(unitPerRate)) {
				if(consignmentSummary.getChargeTypeId() == ChargeTypeConstant.CHARGETYPE_ID_WEIGHT)
					unitPerRate	= "Weight Rate : " + consignmentSummary.getWeigthFreightRate() + " / kg";

				if(consignmentSummary.getChargeTypeId() == ChargeTypeConstant.CHARGETYPE_ID_KILO_METER)
					unitPerRate		= "Rate/Km : " + consignmentSummary.getWeigthFreightRate();
			}

			if((boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.DISPLAY_RATES_OF_ARTICLE_AND_WEIGHT, false)) {
				if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN
						&& (boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.SHOW_WEIGHT_RATE, false) &&
						(consignmentSummary.getChargeTypeId() == ChargeTypeConstant.CHARGETYPE_ID_WEIGHT || consignmentSummary.getRateApplyOnChargeType() == ChargeTypeConstant.CHARGETYPE_ID_WEIGHT)) {
					if(consignmentSummary.getChargeTypeId() == ChargeTypeConstant.CHARGETYPE_ID_QUANTITY
							&& consignmentSummary.getRateApplyOnChargeType() == ChargeTypeConstant.CHARGETYPE_ID_WEIGHT)
						unitPerRate = unitPerRate + " (<span style = 'background-color: #E77072; color: #FFF'>Rate applied on Weight</span>)";

					if(consignmentSummary.getRateApplyOnChargeType() == ChargeTypeConstant.CHARGETYPE_ID_QUANTITY)
						unitPerRate = unitPerRate + " (<span style = 'background-color: #E77072; color: #FFF'>Rate applied on Quantity</span>)";

					request.setAttribute("unitPerRate", unitPerRate);
				}
			} else
				request.setAttribute("unitPerRate", unitPerRate);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	@SuppressWarnings("unchecked")
	private void displayDeliveryCharges(final HttpServletRequest request, final WayBill wayBill, final ConsignmentSummary consignmentSummary, final CustomerDetails consignor, final ConsignmentDetails[] consignment, final Timestamp wbBookingDateTime, final Executive bookedExecutive, final Executive executive, final Branch destBranch, final Map<Object, Object> lrViewConfiguration, final ValueObject generateCRConfVal) throws Exception {
		var 								chargeConfigAmount 				= 0.00;
		var 								damerage 						= 0D;
		short								configTypeId					= 0;
		var									corporateAccountId				= 0L;
		short								categoryTypeId					= 0;
		List<TaxModel> 						taxes 							= null;
		ArrayList<ConsignmentDetails>		articalRateList					= null;
		ConsignmentSummary					otherRateList					= null;
		var									lessFeesDays					= 0L;
		var									chargeableDays					= 0L;
		var									storageDays						= 0L;
		var									hamali							= 0D;
		var									bfc								= 0D;
		var									rc								= 0D;
		var									other							= 0D;
		var									doorDelivery					= 0D;


		try {
			// Charge Config Amount (start)

			final var	branchCache				= cache.getGenericBranchesDetail(request);
			final var	groupConfiguration		= cache.getGroupConfiguration(request, executive.getAccountGroupId());

			final var	finalDamerageVal		= new ValueObject();

			if(wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DISPATCHED
					|| checkReceiveStatusForEdit(wayBill)
					|| wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CREDIT_DELIVERED
					|| wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DELIVERED)
				chargeConfigAmount = ChargeConfigDao.getInstance().getChargeAmountForSingleWayBill(Long.toString(wayBill.getWayBillId()));

			request.setAttribute("chargeConfigAmount", chargeConfigAmount);
			// Charge Config Amount (end)

			if(consignor.getCorporateAccountId() > 0 && consignor.getPartyType() == CorporateAccountConstant.PARTY_TYPE_TBB) {
				corporateAccountId 	= consignor.getCorporateAccountId();
				categoryTypeId	 	= RateMasterConstant.CATEGORY_TYPE_TBB_ID;
			} else if(consignor.getCorporateAccountId() > 0 && consignor.getPartyType() == CorporateAccountConstant.PARTY_TYPE_GENERAL) {
				corporateAccountId 	= consignor.getCorporateAccountId();
				categoryTypeId	 	= RateMasterConstant.CATEGORY_TYPE_PARTY_ID;
			} else
				categoryTypeId	 	= RateMasterConstant.CATEGORY_TYPE_GENERAL_ID;

			// Damerage Calculation For LMT
			//also add condition to WayBillModelDao.getInstance().getWayBillModel()

			if ((boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.DISPLAY_DELIVERY_CHARGES_BEFORE_DELIVERY, false)) {
				final var generateCRConfigurationValObj = cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.GENERATE_CR);

				final var valueObj = new HashMap<>();

				valueObj.put(Constant.EXECUTIVE_ID, wayBill.getExecutiveId());
				valueObj.put(Constant.WAYBILL_ID, wayBill.getWayBillId());
				valueObj.put(Constant.ACCOUNT_GROUP_ID, wayBill.getAccountGroupId());
				valueObj.put(Constant.BRANCH_ID, wayBill.getBranchId());
				valueObj.put(GenerateCashReceiptPropertiesConstant.GENERATE_CASH_RECEIPT_CONFIGURATION, generateCRConfigurationValObj);

				final var calculatedRateHM = DeliveryRateMasterBllImpl.getInstance().getDeliveryRateFromRateMaster(valueObj);

				if(calculatedRateHM != null && !calculatedRateHM.isEmpty()) {
					hamali 			= calculatedRateHM.getOrDefault((long) DeliveryChargeConstant.HAMALI_DELIVERY, 0d);
					bfc 			= calculatedRateHM.getOrDefault((long) DeliveryChargeConstant.BFC, 0d);
					rc 				= calculatedRateHM.getOrDefault((long) DeliveryChargeConstant.RC, 0d);
					other 			= calculatedRateHM.getOrDefault((long) DeliveryChargeConstant.OTHER_DELIVERY, 0d);
					doorDelivery 	= calculatedRateHM.getOrDefault((long) DeliveryChargeConstant.DOOR_DELIVERY_DELIVERY, 0d);
				}
			}

			final var lrTypeList = CollectionUtility.getLongListFromString(generateCRConfVal.getString(GenerateCashReceiptPropertiesConstant.LR_TYPES_FOR_DEMURRAGE_CALCULATION, "0"));

			if(lrTypeList.contains(wayBill.getWayBillTypeId()) && (wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_RECEIVED
					|| wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DUEUNDELIVERED
					|| wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CANCELLED_DELIVERY))
				if(executive.getAccountGroupId() == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_LMT || executive.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNT_GROUP_ID_FALCON_CARGO) {
					final var	waybillBookingChgs 	= WayBillBookingChargesDao.getInstance().getWayBillCharges(wayBill.getWayBillId());

					final var	inValObjDemurrage = new ValueObject();
					inValObjDemurrage.put("executive", bookedExecutive);
					inValObjDemurrage.put("corporateAccountId", corporateAccountId);
					inValObjDemurrage.put("consignment", consignment);
					inValObjDemurrage.put("summary", consignmentSummary);
					inValObjDemurrage.put("bookingTotal", wayBill.getBookingTotal());
					inValObjDemurrage.put("demurrageFromDate", wayBill.getCreationDateTimeStamp());
					inValObjDemurrage.put("status", wayBill.getStatus());
					inValObjDemurrage.put("wayBillBookingCharges", waybillBookingChgs);
					inValObjDemurrage.put(GenerateCashReceiptPropertiesConstant.DAMERAGE_APPLICABLE_ON_ACTUAL_WEIGHT, generateCRConfVal.getBoolean(GenerateCashReceiptPropertiesConstant.DAMERAGE_APPLICABLE_ON_ACTUAL_WEIGHT, false));

					final var	demurrageBLL = new DamerageChargeBLL();

					final var	damerageVal = demurrageBLL.calculateDamerage(inValObjDemurrage);

					if(damerageVal != null) {
						lessFeesDays		= damerageVal.getLong("lessFeesDays",0);
						chargeableDays		= damerageVal.getLong("chargeableDays",0);
						storageDays			= damerageVal.getLong("storageDays",0);
						configTypeId		= damerageVal.getShort("configTypeId",(short)0);
						damerage			= damerageVal.getDouble("demurrageAmount",0.00);

						if(configTypeId == DeliveryRateMaster.CONFIG_TYPE_QUANTITY_ID)
							articalRateList			= (ArrayList<ConsignmentDetails>) damerageVal.get("demurrageAmountList");
						else
							otherRateList			= (ConsignmentSummary) damerageVal.get("demurrageAmountList");
					}

					finalDamerageVal.put("configTypeId", configTypeId);
					finalDamerageVal.put("lessFeesDays", lessFeesDays);
					finalDamerageVal.put("chargeableDays", chargeableDays);
					finalDamerageVal.put("storageDays", storageDays);
					finalDamerageVal.put("damerage", damerage);

					if(articalRateList != null && !articalRateList.isEmpty())
						finalDamerageVal.put("articalRateList", Converter.dtoArrayListtoArrayListWithHashMapConversion(articalRateList));

					if(otherRateList != null)
						finalDamerageVal.put("otherRateList", Converter.DtoToHashMap(otherRateList));

					final var damergaeObj = JsonUtility.convertionToJsonObjectForResponse(finalDamerageVal);

					request.setAttribute("demarageJsonObject", damergaeObj);

					// NEW CODE USING DamerageChargeBLL :: END

				} else if(executive.getAccountGroupId() == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_KHTC) {
					final var	inValObjDemurrage = new ValueObject();
					inValObjDemurrage.put("accountGroupId", executive.getAccountGroupId());
					inValObjDemurrage.put("consignmentSummary", consignmentSummary);

					if(executive.getAccountGroupId() == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_KHTC)
						inValObjDemurrage.put("demurrageFromDate", wbBookingDateTime);
					else
						inValObjDemurrage.put("demurrageFromDate", wayBill.getCreationDateTimeStamp());

					final var	demurrageBLL = new DamerageChargeBLL();

					if(executive.getRegionId() != Region.REGION_ID_KUTCH)
						damerage = demurrageBLL.calculateDamerageForTransport(inValObjDemurrage);
				}

			request.setAttribute("demurrageAmount", damerage);
			// End Of Damerage Calculation

			if(checkReceiveStatusForEdit(wayBill)
					|| wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CREDIT_DELIVERED) {
				var	deliveryCharges = cache.getActiveDeliveryCharges(request, executive);

				if(deliveryCharges != null) {
					final var	dlvryChgs = new LinkedHashMap<Long, ChargeTypeModel>();

					for (final ChargeTypeModel deliveryCharge : deliveryCharges) {
						final var	charge = new ChargeTypeModel();
						charge.setChargeName(deliveryCharge.getChargeName());
						charge.setChargeTypeMasterId(deliveryCharge.getChargeTypeMasterId());
						dlvryChgs.put(deliveryCharge.getChargeTypeMasterId(),charge);
					}

					//Set Pre configured Delivery  Charges
					final var deliveryRateBLL = new DeliveryRateBLL();
					final var deliveryRates = deliveryRateBLL.getDeliveryRatesForBranch(executive.getAccountGroupId(), executive.getBranchId(), corporateAccountId, categoryTypeId);

					if(deliveryRates != null ) {
						final var rcRateArr = new ArrayList<DeliveryRateMaster>();
						var rcMaxLimit 			= 0D;
						var rcMaxRate 			= 0D;
						var octroiServiceAmount 	= 0.00;

						for (final DeliveryRateMaster deliveryRate : deliveryRates) {
							final var chg =  dlvryChgs.get(deliveryRate.getChargeTypeMasterId());

							if(chg != null) {
								if (deliveryRate.getChargeTypeMasterId() == DeliveryChargeConstant.RC) {
									rcRateArr.add(deliveryRate);
									rcMaxLimit =  rcMaxLimit > deliveryRate.getMinWeight() ? rcMaxLimit : deliveryRate.getMinWeight();

									if(deliveryRate.getMinWeight() == rcMaxLimit && deliveryRate.getMaxWeight() == 0)
										rcMaxRate = deliveryRate.getRate();
								} else if (deliveryRate.getChargeTypeMasterId() == DeliveryChargeConstant.HAMALI_DELIVERY)
									chg.setChargeAmount(chg.getChargeAmount() + deliveryRate.getRate() * consignmentSummary.getChargeWeight());
								else {
									if(deliveryRate.getChargeTypeMasterId() == DeliveryChargeConstant.OCTROI_SERVICE) {
										request.setAttribute("octroiServiceCharge", deliveryRate.getRate());

										if(chargeConfigAmount > 0)
											octroiServiceAmount = chargeConfigAmount * deliveryRate.getRate() / 100 ;
									}

									chg.setChargeAmount(chg.getChargeAmount() + deliveryRate.getRate());
								}

								dlvryChgs.put(deliveryRate.getChargeTypeMasterId(), chg);
							}
						}

						if(rcRateArr != null && !rcRateArr.isEmpty()) {
							var totalQty = 0;

							for (final ConsignmentDetails element : consignment)
								totalQty += element.getQuantity();

							if(totalQty >= rcMaxLimit) {
								final var rcChg = dlvryChgs.get((long) DeliveryChargeConstant.RC);
								rcChg.setChargeAmount(totalQty * rcMaxRate);
								dlvryChgs.put(rcChg.getChargeTypeMasterId(), rcChg);
							} else
								for (final DeliveryRateMaster rcRate : rcRateArr)
									if(totalQty >= rcRate.getMinWeight() && totalQty <= rcRate.getMaxWeight()) {
										final var rcChg = dlvryChgs.get((long) DeliveryChargeConstant.RC);
										rcChg.setChargeAmount(totalQty * rcRate.getRate());
										dlvryChgs.put(rcChg.getChargeTypeMasterId(), rcChg);
									}
						}

						deliveryCharges = dlvryChgs.values().toArray(new ChargeTypeModel[dlvryChgs.size()]);

						var	octSrvAmt	= 0D;

						for(final ChargeTypeModel chargeTypeModel : deliveryCharges) {
							if(chargeTypeModel.getChargeTypeMasterId() == DeliveryChargeConstant.OCTROI_DELIVERY && chargeConfigAmount > 0)
								chargeTypeModel.setChargeAmount(chargeConfigAmount);
							else if(chargeTypeModel.getChargeTypeMasterId() == DeliveryChargeConstant.DAMERAGE && damerage > 0)
								chargeTypeModel.setChargeAmount(damerage);
							else if(chargeTypeModel.getChargeTypeMasterId() == DeliveryChargeConstant.OCTROI_SERVICE && octroiServiceAmount > 0)
								chargeTypeModel.setChargeAmount(octroiServiceAmount);
							else if(chargeTypeModel.getChargeTypeMasterId() == DeliveryChargeConstant.HAMALI_DELIVERY && hamali > 0)
								chargeTypeModel.setChargeAmount(hamali);
							else if(chargeTypeModel.getChargeTypeMasterId() == DeliveryChargeConstant.BFC && bfc > 0)
								chargeTypeModel.setChargeAmount(bfc);
							else if(chargeTypeModel.getChargeTypeMasterId() == DeliveryChargeConstant.RC && rc > 0)
								chargeTypeModel.setChargeAmount(rc);
							else if(chargeTypeModel.getChargeTypeMasterId() == DeliveryChargeConstant.OTHER_DELIVERY && other > 0)
								chargeTypeModel.setChargeAmount(other);
							else if(chargeTypeModel.getChargeTypeMasterId() == DeliveryChargeConstant.DOOR_DELIVERY_DELIVERY && doorDelivery > 0)
								chargeTypeModel.setChargeAmount(doorDelivery);

							if(chargeTypeModel.getChargeTypeMasterId() == DeliveryChargeConstant.OCTROI_DELIVERY) {
								final var octAmt	= chargeTypeModel.getChargeAmount();

								if(octAmt >= chargeConfigAmount)
									octSrvAmt	= Math.round(octAmt * octroiServiceAmount / 100);
							}

							if(chargeTypeModel.getChargeTypeMasterId() == DeliveryChargeConstant.OCTROI_SERVICE && octSrvAmt > 0)
								chargeTypeModel.setChargeAmount(octSrvAmt);
						}
					}

					request.setAttribute("deliChar", deliveryCharges);
				}

				final var	sourceBranch 	= (Branch) branchCache.get(Long.toString(wayBill.getSourceBranchId()));

				if(groupConfiguration.getBoolean(GroupConfigurationPropertiesDTO.ALLOW_COMPANY_WISE_TAX, false)) {
					final var	taxModelHm		= cache.getTaxMasterForGroupDataHM(request, executive);
					taxes			= TaxCalculationBLL.getInstance().getCompanyWiseTaxes(taxModelHm, branchCache, wayBill.getWayBillTypeId(), executive.getAccountGroupId(), destBranch, sourceBranch, consignor);
				} else
					taxes 			= cache.getTaxes(request, executive);

				request.setAttribute(TaxModel.TAX_MODEL_ARR, taxes);
			}
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private void displayBookingAmount(final HttpServletRequest request, final WayBillCharges[] wayBillCharges, final boolean displayBookingCharges, final boolean allowRateInDecimal, final boolean isShowAmountZero,
			final Executive executive) throws Exception {
		try {
			final var	wayBillChargesCol 	= new HashMap<Long, WayBillCharges>();
			final var	htbookingCount		= new HashMap<Long, WayBillCharges>();

			final var	bookingChargesHm	= cache.getBookingChargesHm(request, executive);
			final var 	chargeTypeMasterVal = cache.getChargeTypeMasterData(request);

			if(wayBillCharges != null)
				for (final WayBillCharges wayBillCharge : wayBillCharges) {
					final var	chargeTypeMaster 	= (ChargeTypeMaster) chargeTypeMasterVal.get(Long.toString(wayBillCharge.getWayBillChargeMasterId()));

					if(chargeTypeMaster == null) continue;

					if(bookingChargesHm != null && bookingChargesHm.get(wayBillCharge.getWayBillChargeMasterId()) != null)
						wayBillCharge.setName(bookingChargesHm.get(wayBillCharge.getWayBillChargeMasterId()).getDisplayName());
					else if(chargeTypeMaster != null)
						wayBillCharge.setName(chargeTypeMaster.getChargeName());

					if(!displayBookingCharges && wayBillCharge.getChargeType() == ChargeTypeMaster.WAYBILL_CHARGETYPE_BOOKING
							|| isShowAmountZero)
						wayBillCharge.setChargeAmount(0);

					if(!allowRateInDecimal)
						wayBillCharge.setChargeAmount(Math.round(wayBillCharge.getChargeAmount()));

					if(wayBillCharge.getChargeType() == ChargeTypeMaster.WAYBILL_CHARGETYPE_BOOKING)
						htbookingCount.put(wayBillCharge.getWayBillChargeMasterId(), wayBillCharge);

					wayBillChargesCol.put(wayBillCharge.getWayBillChargeMasterId(), wayBillCharge);
				}

			request.setAttribute("BookingWayBillCharges", htbookingCount);
			request.setAttribute("wayBillChargesCol", wayBillChargesCol);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private void displayBookingAndDeliveryAmount(final HttpServletRequest request, final WayBill wayBill, final WayBillCharges[] wayBillCharges, final boolean displayBookingCharges, final boolean allowRateInDecimal) throws Exception {
		try {
			final var	htbookingCount	= new HashMap<Long, WayBillCharges>();
			final var	htdeliveryCount	= new HashMap<Long, WayBillCharges>();

			final var chargeTypeMasterVal = cache.getChargeTypeMasterData(request);

			if(wayBillCharges != null)
				for (final WayBillCharges wayBillCharge : wayBillCharges) {
					final var	chargeTypeMaster = (ChargeTypeMaster) chargeTypeMasterVal.get(Long.toString(wayBillCharge.getWayBillChargeMasterId()));

					if(chargeTypeMaster == null)
						continue;

					wayBillCharge.setName(chargeTypeMaster.getChargeName());

					if(wayBillCharge.getChargeType() == ChargeTypeMaster.WAYBILL_CHARGETYPE_BOOKING) {
						final var bookingWayBillCharges 	= bookingChargesAfterDelivery(wayBillCharge, displayBookingCharges, allowRateInDecimal);
						htbookingCount.put(bookingWayBillCharges.getWayBillChargeMasterId(), bookingWayBillCharges);
					} else if(wayBillCharge.getChargeType() == ChargeTypeMaster.WAYBILL_CHARGETYPE_DELIVERY) {
						final var deliveryWayBillCharges = deliveryCharges(wayBillCharge);
						htdeliveryCount.put(deliveryWayBillCharges.getWayBillChargeMasterId(), deliveryWayBillCharges);
					}
				}

			if(!allowRateInDecimal)
				wayBill.setGrandTotal(Math.round(wayBill.getGrandTotal()));
			else
				wayBill.setGrandTotal(wayBill.getGrandTotal());

			request.setAttribute("BookingWayBillCharges", htbookingCount);
			request.setAttribute("DeliveryWayBillCharges", htdeliveryCount);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private WayBillCharges bookingChargesAfterDelivery(final WayBillCharges wayBillCharge, final boolean displayBookingCharges, final boolean allowRateInDecimal) {
		final var bookingWayBillCharges 	= new WayBillCharges();
		bookingWayBillCharges.setAccountGroupId(wayBillCharge.getAccountGroupId());

		if(!displayBookingCharges)
			wayBillCharge.setChargeAmount(0);
		else if(!allowRateInDecimal)
			wayBillCharge.setChargeAmount(Math.round(wayBillCharge.getChargeAmount()));
		else
			wayBillCharge.setChargeAmount(wayBillCharge.getChargeAmount());

		bookingWayBillCharges.setChargeAmount(wayBillCharge.getChargeAmount());
		bookingWayBillCharges.setChargeType(wayBillCharge.getChargeType());
		bookingWayBillCharges.setMarkForDelete(wayBillCharge.isMarkForDelete());
		bookingWayBillCharges.setName(wayBillCharge.getName());
		bookingWayBillCharges.setWayBillChargeMasterId(wayBillCharge.getWayBillChargeMasterId());
		bookingWayBillCharges.setWayBillChargesId(wayBillCharge.getWayBillChargesId());
		bookingWayBillCharges.setWayBillId(wayBillCharge.getWayBillId());

		return bookingWayBillCharges;
	}

	private WayBillCharges deliveryCharges(final WayBillCharges wayBillCharge) {
		final var deliveryWayBillCharges = new WayBillCharges();
		deliveryWayBillCharges.setAccountGroupId(wayBillCharge.getAccountGroupId());
		deliveryWayBillCharges.setChargeAmount(wayBillCharge.getChargeAmount());
		deliveryWayBillCharges.setChargeType(wayBillCharge.getChargeType());
		deliveryWayBillCharges.setMarkForDelete(wayBillCharge.isMarkForDelete());
		deliveryWayBillCharges.setName(wayBillCharge.getName());
		deliveryWayBillCharges.setWayBillChargeMasterId(wayBillCharge.getWayBillChargeMasterId());
		deliveryWayBillCharges.setWayBillChargesId(wayBillCharge.getWayBillChargesId());
		deliveryWayBillCharges.setWayBillId(wayBillCharge.getWayBillId());

		return deliveryWayBillCharges;
	}

	private void displayBookingAndDeliveryGSTPaid(final HttpServletRequest request, final WayBillTaxTxn[] billTaxTxn, final ConsignmentSummary consignmentSummary, final DeliveryContactDetails deliveryContactDetails, final Map<Object, Object> lrViewConfiguration) throws Exception {
		var taxAmt						= 0.00;
		var unaddedAmt					= 0.00;
		var	bookingGSTPaidBy			= "";
		var	deliveryGSTPaidBy			= "";

		try {
			final var	roundOffServiceTaxAmount	= (boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.ROUND_OFF_SERVICE_TAX_AMOUNT, false);

			if(ObjectUtils.isNotEmpty(billTaxTxn)) {
				taxAmt		= Stream.of(billTaxTxn).filter(a -> a.getTaxTxnType() == WayBillTaxTxn.WAYBILL_TAX_TXN_TYPE_BOOKING)
						.mapToDouble(WayBillTaxTxn :: getTaxAmount).sum();

				unaddedAmt	= Stream.of(billTaxTxn).filter(a -> a.getTaxTxnType() == WayBillTaxTxn.WAYBILL_TAX_TXN_TYPE_BOOKING)
						.mapToDouble(WayBillTaxTxn :: getUnAddedTaxAmount).sum();

				if(roundOffServiceTaxAmount)
					unaddedAmt	= Math.round(unaddedAmt);

				bookingGSTPaidBy	= (consignmentSummary.getTaxBy() > 0 ? TaxPaidByConstant.getTaxPaidBy(consignmentSummary.getTaxBy()) : " ")
						+ (taxAmt > 0 ? " ( Rs " + taxAmt + " /- )" : " ( Rs " + unaddedAmt + " /- )");
			} else
				bookingGSTPaidBy	= TaxPaidByConstant.getTaxPaidBy(consignmentSummary.getTaxBy());

			if(deliveryContactDetails != null && ObjectUtils.isNotEmpty(billTaxTxn)) {
				taxAmt		= Stream.of(billTaxTxn).filter(a -> a.getTaxTxnType() == WayBillTaxTxn.WAYBILL_TAX_TXN_TYPE_DELIVERY)
						.mapToDouble(WayBillTaxTxn :: getTaxAmount).sum();

				unaddedAmt	= Stream.of(billTaxTxn).filter(a -> a.getTaxTxnType() == WayBillTaxTxn.WAYBILL_TAX_TXN_TYPE_DELIVERY)
						.mapToDouble(WayBillTaxTxn :: getUnAddedTaxAmount).sum();

				deliveryGSTPaidBy	= TaxPaidByConstant.getTaxPaidBy(deliveryContactDetails.getTaxBy())
						+ (taxAmt > 0 ? " ( Rs "+ Math.round(taxAmt) + " /- )" : " ( Rs " + Math.round(unaddedAmt) + " /- )");

				request.setAttribute("deliveryGSTPaidBy", deliveryGSTPaidBy);
			}

			if((boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.SHOW_GST_UPLOADED_STATUS, false))
				if(consignmentSummary.getTaxBy() == TaxPaidByConstant.TAX_PAID_BY_CONSINGOR_ID || consignmentSummary.getTaxBy() == TaxPaidByConstant.TAX_PAID_BY_CONSINGEE_ID)
					request.setAttribute("gstUpdateStatus", Boolean.TRUE.equals(consignmentSummary.getGstUpdated()) ? WayBill.GST_STATUS_UPLOAD_STR : WayBill.GST_STATUS_PENDING_STR);
				else
					request.setAttribute("gstUpdateStatus", TaxPaidByConstant.TAX_PAID_BY_NOT_APPLICABLE_NAME);

			request.setAttribute("bookingGSTPaidBy", bookingGSTPaidBy);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private void crossingHireDetails(final HttpServletRequest request, final WayBill wayBill) throws Exception {
		WayBillCrossing 	wayBillCrossingObj		= null;
		String				crossingAgentName		= null;

		try {
			final List<WayBillCrossing> 	wayBillCrossingList = WayBillCrossingDao.getInstance().getCrossingHireDetails(wayBill.getWayBillId());

			if(wayBillCrossingList != null && !wayBillCrossingList.isEmpty()) {
				wayBillCrossingObj	= new WayBillCrossing();

				for(final WayBillCrossing wayBillCrossing : wayBillCrossingList)
					if(wayBillCrossing.getTxnTypeId() == WayBillCrossing.TRANSACTION_TYPE_DELIVERY_CROSSING && wayBillCrossing.getCrossingHire() > 0)
						wayBillCrossingObj.setCrossingHireDly(wayBillCrossing.getCrossingHire());
					else if(wayBillCrossing.getTxnTypeId() == WayBillCrossing.TRANSACTION_TYPE_BOOKING_CROSSING && wayBillCrossing.getCrossingHire() > 0 )
						wayBillCrossingObj.setCrossingHire(wayBillCrossing.getCrossingHire());

				crossingAgentName = wayBillCrossingList.get(0).getCrossingAgentName();
			}

			request.setAttribute("wayBillCrossingObj", wayBillCrossingObj);
			request.setAttribute("crossingAgentName", crossingAgentName);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private void allowEditVehicleNumber(final HttpServletRequest request, final WayBill wayBill, final ValueObject groupConfiguration, final HashMap<Long, ExecutiveFeildPermissionDTO> execFldPermissionsHM, final Branch srcBranch, final Executive executive) throws Exception {
		try {
			request.setAttribute("showEditLrVehicleNumberLink", wayBill.getBookingCrossingAgentId() <= 0
					&& groupConfiguration.getBoolean(GroupConfigurationPropertiesConstant.VEHICLE_NUMBER, false)
					&& execFldPermissionsHM != null && execFldPermissionsHM.get(FeildPermissionsConstant.EDIT_LR_VEHCILE_NUMBER) != null
					&& (wayBill.getBookingTypeId() != BookingTypeConstant.BOOKING_TYPE_SUNDRY_ID
					|| wayBill.getBookingTypeId() == BookingTypeConstant.BOOKING_TYPE_SUNDRY_ID && groupConfiguration.getBoolean(GroupConfigurationPropertiesConstant.SHOW_VEHICLE_NUMBER_AND_VEHICLE_TYPE_ON_SUNDRY, false)
					|| wayBill.getBookingTypeId() == BookingTypeConstant.DIRECT_DELIVERY_DIRECT_VASULI_ID && groupConfiguration.getBoolean(GroupConfigurationPropertiesConstant.SHOW_TRUCK_NUMBER_ON_DDDV, false)
					|| groupConfiguration.getBoolean(GroupConfigurationPropertiesConstant.IS_SHOW_VEHICLE_NUMBER_FOR_ALL_BOOKING_TYPE, false))
					&& wayBill.getStatus() != WayBillStatusConstant.WAYBILL_STATUS_CANCELLED
					&& wayBill.getStatus() != WayBillStatusConstant.WAYBILL_STATUS_DELIVERED
					&& checkUserTypeWiseSorceUserPermission(executive, srcBranch, srcBranch.getBranchId()));
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private void setConsignmentSummaryOtherData(final HttpServletRequest request, final Executive executive, final ConsignmentSummary consignmentSummary, final boolean displayBookingCharges, final Map<Object, Object> lrViewConfiguration, final ValueObject groupConfiguration) throws Exception {
		Branch							branch							= null;

		try {
			final var	commodity		= cache.getCommodityDetails(request, executive.getAccountGroupId(), consignmentSummary.getCommodityMasterId());
			final var	categoryTypeHM	= cache.getCategoryTypesForGroup(request, executive.getAccountGroupId());
			final var	transportModeHm	= cache.getTransportationModeForGroup(request, executive.getAccountGroupId());
			final var	divisionHM		= cache.getDivisionMasterNameHM(request, executive.getAccountGroupId());

			consignmentSummary.setCommodityName(commodity != null ? commodity.getName() : "--");

			if(categoryTypeHM != null)
				consignmentSummary.setCategoryTypeName(categoryTypeHM.get(consignmentSummary.getCategoryTypeId()));

			if(consignmentSummary.getFreightUptoBranchId() > 0) {
				branch = cache.getGenericBranchDetailCache(request,consignmentSummary.getFreightUptoBranchId());
				consignmentSummary.setFreightUptoBranchName(branch.getName());
			} else
				consignmentSummary.setFreightUptoBranchName("");

			if(consignmentSummary.getBillSelectionId() == BillSelectionConstant.BOOKING_WITH_BILL)
				consignmentSummary.setBillSelectionName(BillSelectionConstant.BOOKING_WITH_BILL_NAME);
			else if(consignmentSummary.getBillSelectionId() == BillSelectionConstant.BOOKING_WITHOUT_BILL)
				consignmentSummary.setBillSelectionName(BillSelectionConstant.BOOKING_WITHOUT_BILL_NAME);
			else if(consignmentSummary.getBillSelectionId() == BillSelectionConstant.BOOKING_GST_BILL)
				consignmentSummary.setBillSelectionName(BillSelectionConstant.BOOKING_GST_BILL_NAME);

			consignmentSummary.setExciseInvoiceName(TransportCommonMaster.getExciseInvoice(consignmentSummary.getExciseInvoice()));
			consignmentSummary.setConsignmentInsuredName(TransportCommonMaster.getConsignmentInsured(consignmentSummary.getConsignmentInsured()));

			if(!displayBookingCharges) {
				consignmentSummary.setAmount(0);
				consignmentSummary.setWeigthFreightRate(0);
				consignmentSummary.setVisibleRate(0);
			}

			if(consignmentSummary.getVehicleTypeId() != 0) {
				final var vehicleType = cache.getVehicleType(request, consignmentSummary.getAccountGroupId(), consignmentSummary.getVehicleTypeId());

				if(vehicleType != null)
					consignmentSummary.setVehicleTypeName(vehicleType.getName());
			}

			consignmentSummary.setBookingTypeName(BookingTypeConstant.getBookingType(consignmentSummary.getBookingTypeId()));

			if(consignmentSummary.getBookingTypeId() == BookingTypeConstant.BOOKING_TYPE_FTL_ID && !consignmentSummary.isFTLBookingScreen())
				consignmentSummary.setBookingTypeName(groupConfiguration.getString(GroupConfigurationPropertiesConstant.BOOKING_TYPE_FTL_NAME));

			consignmentSummary.setChargeTypeName(StringUtils.upperCase(ChargeTypeConstant.getChargeType(consignmentSummary.getChargeTypeId())));
			consignmentSummary.setWeightUnitName("Kg");

			if((boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.ALLOW_WEIGHTS_IN_METRIC_TONS, false)
					&& consignmentSummary.getBookingTypeId() == BookingTypeConstant.DIRECT_DELIVERY_DIRECT_VASULI_ID) {
				consignmentSummary.setWeightUnitName("MT");
				consignmentSummary.setActualWeight(consignmentSummary.getActualWeight() / 1000);
				consignmentSummary.setChargeWeight(consignmentSummary.getChargeWeight() / 1000);
			}

			if(consignmentSummary.isFTLBookingScreen() && consignmentSummary.getChargeTypeId() == ChargeTypeConstant.CHARGETYPE_ID_METRIC_TON)
				consignmentSummary.setWeightUnitName("MT");

			if((boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.WEIGHT_SHOW_WITHOUT_DECIMAL, false)) {
				consignmentSummary.setActualWeight(Math.round(consignmentSummary.getActualWeight()));
				consignmentSummary.setChargeWeight(Math.round(consignmentSummary.getChargeWeight()));
			}

			if(executive.getCountryId() == CountryIdConstant.NIGERIA && consignmentSummary.getDeliveryTo() == InfoForDeliveryConstant.DELIVERY_TO_BRANCH_ID)
				consignmentSummary.setConsignmentSummaryDeliveryToString(InfoForDeliveryConstant.DELIVERY_TO_TERMINAL_NAME);
			else
				consignmentSummary.setConsignmentSummaryDeliveryToString(InfoForDeliveryConstant.getInfoForDelivery(consignmentSummary.getDeliveryTo()));

			consignmentSummary.setVehicleTypeName(Utility.checkedNullCondition(consignmentSummary.getVehicleTypeName(), (short) 1));

			if(consignmentSummary.getPrivateMarka() != null)
				consignmentSummary.setPrivateMarka(Utility.checkedNullCondition(consignmentSummary.getPrivateMarka(), null));

			if(consignmentSummary.getPurchaseOrderNumber() != null)
				consignmentSummary.setPurchaseOrderNumber(Utility.checkedNullCondition(consignmentSummary.getPurchaseOrderNumber(), null));

			if(consignmentSummary.getRfqNumber() != null)
				consignmentSummary.setRfqNumber(Utility.checkedNullCondition(consignmentSummary.getRfqNumber(), null));

			if(consignmentSummary.getShipmentNumber() != null)
				consignmentSummary.setShipmentNumber(Utility.checkedNullCondition(consignmentSummary.getShipmentNumber(), null));

			if(consignmentSummary.getBillOfEntriesNumber() != null)
				consignmentSummary.setBillOfEntriesNumber(Utility.checkedNullCondition(consignmentSummary.getBillOfEntriesNumber(), null));

			if(consignmentSummary.getEstimatedDeliveryDate() != null)
				consignmentSummary.setEstimatedDeliveryDateStr(DateTimeUtility.getDateFromTimeStamp(consignmentSummary.getEstimatedDeliveryDate()));

			if(consignmentSummary.getCargoType() > 0)
				consignmentSummary.setCargoTypeName(ContainerDetails.getCargoTypeNameByCargoTypeId(consignmentSummary.getCargoType()));

			if(consignmentSummary.getFocApprovedById() > 0) {
				final var approvedData	= ExecutiveDaoImpl.getInstance().getExecutiveDetailsByExecutiveIds(Long.toString(consignmentSummary.getFocApprovedById()));

				if(approvedData != null && !approvedData.isEmpty())
					consignmentSummary.setFocApprovedByName(approvedData.get(consignmentSummary.getFocApprovedById()).getExecutiveName());
			}

			consignmentSummary.setInvoiceDateStr(DateTimeUtility.getDateFromTimeStamp(consignmentSummary.getInvoiceDate()));
			consignmentSummary.setInvoiceNo(Utility.checkedNullCondition(consignmentSummary.getInvoiceNo(), (short) 1));
			consignmentSummary.setBusinessType(BusinessTypeConstant.getBusinessTypeHM().get(consignmentSummary.getBusinessTypeId()));

			if(consignmentSummary.getBranchServiceTypeId() != null && consignmentSummary.getBranchServiceTypeId() > 0)
				consignmentSummary.setBranchServiceTypeName(BranchServiceTypeConstant.getBranchServiceType(consignmentSummary.getBranchServiceTypeId()));

			if(consignmentSummary.getRiskAllocation() > 0)
				consignmentSummary.setRiskAllocationName(RiskAllocationConstant.getRiskAllocationName(consignmentSummary.getRiskAllocation()));

			if(consignmentSummary.getTransportationCategoryId() > 0)
				consignmentSummary.setTransportationCategoryName(TransportationCategoryConstant.getTransportationCategoryTypeHm().get(consignmentSummary.getTransportationCategoryId()));

			if(consignmentSummary.getTaxTypeId() > 0)
				consignmentSummary.setTaxTypeName(CorporateAccountConstant.getTaxTypeName(consignmentSummary.getTaxTypeId()));

			if(consignmentSummary.getPickupTypeId() > 0)
				consignmentSummary.setPickupTypeName(PickupTypeConstant.getPickupType(consignmentSummary.getPickupTypeId()));

			if(consignmentSummary.getApprovalTypeId() != null && consignmentSummary.getApprovalTypeId() > 0)
				consignmentSummary.setApprovalTypeName(ApprovalTypeConstant.getApprovalType(consignmentSummary.getApprovalTypeId()));

			if(consignmentSummary.getSealNumber() != null)
				consignmentSummary.setSealNumber(Utility.checkedNullCondition(consignmentSummary.getSealNumber(), null));

			if(consignmentSummary.getVehiclePONumber() != null)
				consignmentSummary.setVehiclePONumber(Utility.checkedNullCondition(consignmentSummary.getVehiclePONumber(), null));

			if(consignmentSummary.getForwardTypeId() != null && consignmentSummary.getForwardTypeId() > 0)
				consignmentSummary.setForwardTypeName(ForwardTypeConstant.getForwardType(consignmentSummary.getForwardTypeId()));

			if (StringUtils.isNotEmpty(consignmentSummary.getDeclarationTypeId()))
				consignmentSummary.setDeclarationTypeName(DeclarationTypeConstant.getDeclarationTypes(consignmentSummary.getDeclarationTypeId()));

			final var	trForGroup = transportModeHm.get(consignmentSummary.getTransportationModeId());

			if(trForGroup != null)
				consignmentSummary.setTransportationModeName(trForGroup.getShortName() != null ? trForGroup.getShortName() : trForGroup.getTransportModeName());

			if(consignmentSummary.getConnectivityTypeId() != null && consignmentSummary.getConnectivityTypeId() > 0)
				consignmentSummary.setConnectivityTypeName(ConnectivityTypeConstant.getConnectivityType(consignmentSummary.getConnectivityTypeId()));

			if(consignmentSummary.getDataLoggerNumber() != null)
				consignmentSummary.setDataLoggerNumber(Utility.checkedNullCondition(consignmentSummary.getDataLoggerNumber(), null));

			if(ObjectUtils.isNotEmpty(divisionHM))
				consignmentSummary.setDivisionName(divisionHM.get(consignmentSummary.getDivisionId()));

			if(consignmentSummary.getMovementTypeId() != null)
				if(consignmentSummary.getMovementTypeId() == MovementTypeConstant.MOVEMENT_TYPE_DIRECT)
					consignmentSummary.setMovementTypeStr(MovementTypeConstant.MOVEMENT_TYPE_DIRECT_NAME);
				else if(consignmentSummary.getMovementTypeId() == MovementTypeConstant.MOVEMENT_TYPE_CROSSING)
					consignmentSummary.setMovementTypeStr(MovementTypeConstant.MOVEMENT_TYPE_CROSSING_NAME);

			request.setAttribute("consignmentSummary", consignmentSummary);
			request.setAttribute("freightUptoBranch", branch);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private void setTaxDetails(final HttpServletRequest request, final WayBillModel wayBillModel, final Branch destBranch, final Branch srcBranch, final Executive executive) throws Exception {
		List<TaxModel> 			taxes 								= null;
		WayBillTaxTxn[]			bookingTaxTxn						= null;
		var						destnationSubRegionIdForOverNite	= 0L;

		try {
			final var	wayBillTaxTxn 			= wayBillModel.getWayBillTaxTxn();
			final var	consignor 				= wayBillModel.getConsignorDetails();
			final var	consignmentSummary		= wayBillModel.getConsignmentSummary();
			final var	wayBill 				= wayBillModel.getWayBill();
			final var	groupConfiguration		= cache.getGroupConfiguration(request, executive.getAccountGroupId());
			final var	lrViewConfiguration		= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.LR_SEARCH);

			if(groupConfiguration.getBoolean(GroupConfigurationPropertiesDTO.CUSTOM_TAX_AMOUNT_CALCULATION, false)
					&& CollectionUtility.getLongListFromString(groupConfiguration.getString(GroupConfigurationPropertiesDTO.SUB_REGION_IDS_FOR_OVERNITE, "0")).contains(destBranch.getSubRegionId()))
				destnationSubRegionIdForOverNite = destBranch.getSubRegionId();

			request.setAttribute("roundOffServiceTaxAmount", (boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.ROUND_OFF_SERVICE_TAX_AMOUNT, false));

			if(wayBillTaxTxn != null) {
				final var	taxModelHm				= cache.getTaxMasterForGroupDataHM(request, executive);
				final var	branchdata 				= cache.getGenericBranchesDetail(request);

				if(groupConfiguration.getBoolean(GroupConfigurationPropertiesDTO.ALLOW_COMPANY_WISE_TAX, false))
					taxes	= TaxCalculationBLL.getInstance().getCompanyWiseTaxes(taxModelHm, branchdata, wayBill.getWayBillTypeId(), executive.getAccountGroupId(), destBranch, srcBranch, consignor);

				if(groupConfiguration.getBoolean(GroupConfigurationPropertiesDTO.ALLOW_TRANSPORT_MODE_WISE_TAX, false))
					taxes	= TaxCalculationBLL.getInstance().getTransportaionModeWiseTaxes(taxModelHm, executive.getAccountGroupId(), consignmentSummary.getTransportationModeId());

				if(groupConfiguration.getBoolean(GroupConfigurationPropertiesConstant.ALLOW_TRANSPORT_CATEGORY_WISE_TAX, false))
					taxes	= TaxCalculationBLL.getInstance().getTransportaionCategoryWiseTaxes(taxModelHm, executive.getAccountGroupId(), consignmentSummary.getTransportationCategoryId());

				manipulateWayBillTaxTxnDetails(request, wayBillTaxTxn, taxes, executive, consignmentSummary, destnationSubRegionIdForOverNite);

				final List<WayBillTaxTxn>	bookingTaxTxnArrList	= Stream.of(wayBillTaxTxn).filter(a -> a.getTaxTxnType() == WayBillTaxTxn.WAYBILL_TAX_TXN_TYPE_BOOKING)
						.collect(CollectionUtility.getList());

				if(!bookingTaxTxnArrList.isEmpty()) {
					bookingTaxTxn = new WayBillTaxTxn[bookingTaxTxnArrList.size()];
					bookingTaxTxnArrList.toArray(bookingTaxTxn);
				}
			}

			request.setAttribute("wayBillTaxTxn", wayBillTaxTxn);
			request.setAttribute("bookingTaxTxn", bookingTaxTxn);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private void manipulateWayBillTaxTxnDetails(final HttpServletRequest request, final WayBillTaxTxn[] wayBillTaxTxn, final List<TaxModel> taxes, final Executive executive,
			final ConsignmentSummary consignmentSummary, final long destnationSubRegionIdForOverNite) throws Exception {
		final var	displayBookingCharges    = (boolean) request.getAttribute("displayBookingCharges");

		for (final WayBillTaxTxn element : wayBillTaxTxn) {
			TaxMaster 	taxMaster 		= null;
			TaxModel	taxModel		= null;

			if(ObjectUtils.isNotEmpty(taxes)) {
				for(final TaxModel companyWiseTaxModel : taxes)
					if(companyWiseTaxModel.getTaxMasterId() == element.getTaxMasterId()) {
						taxMaster	= cache.getTaxMasterById(request, element.getTaxMasterId());
						taxModel	= companyWiseTaxModel;
					}
			} else {
				taxMaster 	= cache.getTaxMasterById(request, element.getTaxMasterId());
				taxModel	= cache.getTaxMasterForGroupByTaxMasterId(request, executive, element.getTaxMasterId());
			}

			if(taxMaster == null)
				continue;

			if(!displayBookingCharges && element.getTaxTxnType() == WayBillTaxTxn.WAYBILL_TAX_TXN_TYPE_BOOKING || (boolean) request.getAttribute("isShowAmountZero")) {
				element.setTaxAmount(0);
				element.setUnAddedTaxAmount(0);
			}

			if(!(boolean) request.getAttribute("allowRateInDecimal"))
				element.setTaxAmount((boolean) request.getAttribute("roundOffServiceTaxAmount") ? Math.round(element.getTaxAmount()) : element.getTaxAmount());

			if(taxModel != null && element.getPercentTaxAmount() == 0)
				element.setPercentTaxAmount(taxModel.getTaxAmount());

			element.setTaxName(taxMaster.getTaxMasterName());

			if(consignmentSummary.getTransportationModeId() == TransportationModeConstant.TRANSPORTATION_MODE_AIR_ID || destnationSubRegionIdForOverNite > 0  || consignmentSummary.getTransportationCategoryId() == TransportationCategoryConstant.TRANSPORTATION_CATEGORY_COURIER_ID)
				element.setPercentTaxAmount(element.getTaxMasterId() == TaxMasterConstant.IGST_MASTER_ID ? TaxMasterConstant.TAX_PERCENT_18 : TaxMasterConstant.TAX_PERCENT_9);
		}
	}

	private void showEditDeliveryDateLink(final HttpServletRequest request, final WayBill wayBill, final DeliveryContactDetails deliveryContactDetails, final Map<Long, ExecutiveFeildPermissionDTO> execFldPermissionsHM, final Executive executive) {
		request.setAttribute("showEditDeliveryDateLink", wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DELIVERED && deliveryContactDetails != null && !deliveryContactDetails.isMultiple()
				&& execFldPermissionsHM.get(FeildPermissionsConstant.EDIT_TBB_LR_DELIVERY_DATE_FOR_GROUP_ADMIN) != null
				&& executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN);
	}

	private void allowToUpdateGstType(final HttpServletRequest request, final Executive executive, final Branch srcBranch, final Map<Long, ExecutiveFeildPermissionDTO> execFldPermissionsHM) throws Exception {
		try {
			request.setAttribute("allowToUpdateGstType", execFldPermissionsHM.get(FeildPermissionsConstant.EDIT_GST_TYPE_AFTER_BOOKING) != null
					&& checkUserWiseEditAllow(request, executive, srcBranch));
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private boolean checkForInvoiceCreation(MoneyReceiptTxn moneyReceiptTxn, final WayBill wayBill, final Executive executive, final DeliveryContactDetails deliveryContactDetails, final Map<Object, Object> lrViewConfiguration) throws Exception {
		try {
			final var 	allowInvoiceCreationForPaidAndToPayLR = (boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.ALLOW_INVOICE_CREATION_FOR_PAID_AND_TO_PAY_LR, false);

			if(!allowInvoiceCreationForPaidAndToPayLR || wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CANCELLED)
				return false;

			if(wayBill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID && moneyReceiptTxn == null && wayBill.getBookingBranchId() == executive.getBranchId())
				return true;

			if(wayBill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY && wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DELIVERED) {
				moneyReceiptTxn			= MoneyReceiptTxnDaoImpl.getInstance().getMoneyReceiptTxnDetails1(deliveryContactDetails.getDeliveryContactDetailsId(), ModuleIdentifierConstant.GENERATE_CR);
				return moneyReceiptTxn == null && deliveryContactDetails.getSettledByBranchId() == executive.getBranchId();
			}

			return false;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private void deliveryTimePhoto(final HttpServletRequest request, final Executive executive, final HashMap<Long, ExecutiveFeildPermissionDTO> execFldPermissionsHM) {
		try {
			var	valueInObject 			= new ValueObject();
			final var	generateCrAjaxAction 	= new GenerateCRAjaxAction();

			valueInObject.put(Executive.EXECUTIVE, executive);
			valueInObject.put("execFldPermissions", execFldPermissionsHM);

			valueInObject = generateCrAjaxAction.checkServicePermission(valueInObject);

			if(valueInObject != null) {
				request.setAttribute("isShowDeliveryPhotoTxnLink", valueInObject.getBoolean("isPhotoTxnService", false));
				request.setAttribute("isShowDeliverySignatureTxnLink", valueInObject.getBoolean("isSignatureTxnService", false));
			}
		} catch (final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private void showEditRecoveryBranchLink(final HttpServletRequest request, final ConsignmentSummary consignmentSummary, final DeliveryContactDetails deliveryContactDetails, final WayBill wayBill, final HashMap<?, ?> execFldPermissionsHM, final HashMap<Short, CreditWayBillTxn> creditWBTxnColl, final Executive executive) throws Exception {
		var		showBkgRecoveryBranchUpdateLink 	= false;
		var		showDlyRecoveryBranchUpdateLink 	= false;

		try {
			if(wayBill.getStatus() != WayBillStatusConstant.WAYBILL_STATUS_CANCELLED && execFldPermissionsHM.get(FeildPermissionsConstant.EDIT_RECOVERY_BRANCH) != null && creditWBTxnColl != null) {
				var	crdtWbTxn = creditWBTxnColl.get(CreditWayBillTxn.TXN_TYPE_BOOKING_ID);

				if(crdtWbTxn != null && consignmentSummary != null && consignmentSummary.getPaymentType() == PaymentTypeConstant.PAYMENT_TYPE_CREDIT_ID
						&& crdtWbTxn.getPaymentStatus() == BillClearanceStatusConstant.BILL_CLEARANCE_STATUS_DUE_PAYMENT_ID && crdtWbTxn.getShortCreditLedgerId() <= 0){
					final var	srcBranch = (Branch) branchColl.get(Long.toString(crdtWbTxn.getBranchId()));

					showBkgRecoveryBranchUpdateLink  = isOperationAllowedForExecutive(request, srcBranch, executive);
				}

				crdtWbTxn = creditWBTxnColl.get(CreditWayBillTxn.TXN_TYPE_DELIVERY_ID);

				if (crdtWbTxn != null && deliveryContactDetails != null && deliveryContactDetails.getPaymentType() == PaymentTypeConstant.PAYMENT_TYPE_CREDIT_ID
						&& crdtWbTxn.getPaymentStatus() == BillClearanceStatusConstant.BILL_CLEARANCE_STATUS_DUE_PAYMENT_ID && crdtWbTxn.getShortCreditLedgerId() <= 0) {
					final var srcBranch = (Branch) branchColl.get(Long.toString(crdtWbTxn.getBranchId()));

					showDlyRecoveryBranchUpdateLink = isOperationAllowedForExecutive(request, srcBranch, executive);
				}
			}

			request.setAttribute("showBkgRecoveryBranchUpdateLink", showBkgRecoveryBranchUpdateLink);
			request.setAttribute("showDlyRecoveryBranchUpdateLink", showDlyRecoveryBranchUpdateLink);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private boolean isOperationAllowedForExecutive(final HttpServletRequest request, final Branch srcBranch, final Executive executive) throws Exception {
		if(srcBranch == null)
			return false;

		final var executiveTypeId		= executive.getExecutiveType();
		final var sourceRegionId		= srcBranch.getRegionId();
		final var sourceSubRegionId		= srcBranch.getSubRegionId();
		final var execBranchId			= executive.getBranchId();
		final var execRegionId			= cache.getGenericBranchDetailCache(request, execBranchId).getRegionId();
		final var execSubRegionId		= cache.getGenericBranchDetailCache(request, execBranchId).getSubRegionId();

		return switch (executiveTypeId) {
		case ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN -> true;
		case ExecutiveTypeConstant.EXECUTIVE_TYPE_REGIONADMIN -> execRegionId == sourceRegionId;
		case ExecutiveTypeConstant.EXECUTIVE_TYPE_SUBREGIONADMIN -> execSubRegionId == sourceSubRegionId;
		default -> srcBranch.getBranchId() == execBranchId;
		};
	}

	private String getWhereClauseForSTBSBill(final long accountGroupId, final String ids) throws Exception {
		final var whereClause = new StringJoiner(" AND ");

		try {
			whereClause.add("sccl.AccountGroupId = " + accountGroupId);
			whereClause.add("sccl.ShortCreditCollectionLedgerId In (" + ids + ")");

		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}

		return whereClause.toString();
	}

	private void updateDivision(final HttpServletRequest request, final WayBill wayBill, final HashMap<Long, ExecutiveFeildPermissionDTO> execFldPermissionsHM) {
		request.setAttribute("updateDivision", wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_BOOKED && execFldPermissionsHM.get(FeildPermissionsConstant.UPDATE_LR_DIVISION_AFTER_BOOKING) != null);
	}
}
