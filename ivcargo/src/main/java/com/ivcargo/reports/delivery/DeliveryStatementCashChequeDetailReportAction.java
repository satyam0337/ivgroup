package com.ivcargo.reports.delivery;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.SortedMap;
import java.util.StringJoiner;
import java.util.TreeMap;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.ObjectUtils;
import org.apache.commons.lang3.StringUtils;

import com.businesslogic.displaydata.DisplayDataConfigurationBll;
import com.businesslogic.properties.impl.PropertyConfigValueBLLImpl;
import com.businesslogic.tds.TDSTxnDetailsBLL;
import com.businesslogic.waybill.FormTypesBLL;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.constant.properties.GeneralConfigurationPropertiesConstant;
import com.iv.dto.constant.BusinessFunctionConstants;
import com.iv.dto.constant.DeliveryStatusConstant;
import com.iv.dto.constant.FeildPermissionsConstant;
import com.iv.dto.constant.InfoForDeliveryConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.dto.constant.PaymentTypeConstant;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.dto.constant.TransCargoAccountGroupConstant;
import com.iv.dto.constant.WayBillStatusConstant;
import com.iv.dto.constant.WayBillTypeConstant;
import com.iv.properties.constant.report.DlyStmtCashChequeDetailsReportConfigurationConstant;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.constant.AccountGroupConstant;
import com.iv.utils.constant.Constant;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.exception.ExceptionProcess;
import com.iv.utils.utility.CollectionUtility;
import com.iv.utils.utility.ListFilterUtility;
import com.iv.utils.utility.SortUtils;
import com.iv.utils.utility.SplitLRNumber;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.reports.delivery.initialize.InitializeDeliveryStatementCashChequeDetailReportAction;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.ConsignmentSummaryDao;
import com.platform.dao.CustomerDetailsDao;
import com.platform.dao.DeliveryContactDetailsDao;
import com.platform.dao.ExecutiveDao;
import com.platform.dao.GodownDao;
import com.platform.dao.GodownStockSummaryDao;
import com.platform.dao.WayBillBookingChargesDao;
import com.platform.dao.WayBillDeliveryChargesDao;
import com.platform.dao.WayBillHistoryDao;
import com.platform.dao.WayBillTaxTxnDao;
import com.platform.dao.reports.CancelledDeliveryReportDao;
import com.platform.dao.reports.CreditWayBillTxnClearanceSummaryDAO;
import com.platform.dao.reports.CreditWayBillTxnDAO;
import com.platform.dao.reports.DeliveryStatementCashChequeDetailDAO;
import com.platform.dto.AliasNameConstants;
import com.platform.dto.Branch;
import com.platform.dto.CustomGroupMapper;
import com.platform.dto.CustomerDetails;
import com.platform.dto.DiscountDetails;
import com.platform.dto.Executive;
import com.platform.dto.GodownStockReportForPendingDeliveryModel;
import com.platform.dto.GodownStockSummary;
import com.platform.dto.PropertiesFileConstants;
import com.platform.dto.SubRegion;
import com.platform.dto.TransportCommonMaster;
import com.platform.dto.WayBillBookingCharges;
import com.platform.dto.WayBillDeliveryCharges;
import com.platform.dto.WayBillTaxTxn;
import com.platform.dto.constant.ReportWiseDisplayZeroAmountConstant;
import com.platform.dto.model.CancelledDeliveryReportModel;
import com.platform.dto.model.ChargeTypeModel;
import com.platform.dto.model.CreditWayBillTxn;
import com.platform.dto.model.CreditWayBillTxnCleranceSummary;
import com.platform.dto.model.DeliveryCustomerModel;
import com.platform.dto.model.DeliveryStatementCashChequeDetailReport;
import com.platform.resource.CargoErrorList;
import com.platform.utils.PropertiesUtility;
import com.platform.utils.Utility;

public class DeliveryStatementCashChequeDetailReportAction implements Action {

	private static final String TRACE_ID	= DeliveryStatementCashChequeDetailReportAction.class.getName();

	@Override
	@SuppressWarnings({ "unchecked" })
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String, Object>	 							error 											= null;
		HashMap<Long, CreditWayBillTxn> 					lrColl  										= null;
		HashMap<Long, CustomerDetails>						consigneeDetails								= null;
		HashMap<Long, CustomerDetails>						consignorDetails								= null;
		var 												branchId										= 0L;
		var 												isDiscountShow 									= false;
		Map<Long, Double>									wbIdWiseTDSAmt									= null;
		var													tdsAmt											= 0D;
		var													totalTDSAmt										= 0D;
		var													isShowAmountZero								= false;
		ArrayList<Long>										deliveryChargeIdListforNotShow					= null;
		ChargeTypeModel[] 									newDeliveryCharges 								= null;
		DeliveryStatementCashChequeDetailReport[]			sourceAndDestinationRegionWiseArray			    = null;
		var												    sourceRegionId									= 0L;
		var												    destinationRegionId								= 0L;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request, error))
				return;

			new InitializeDeliveryStatementCashChequeDetailReportAction().execute(request, response);

			if(JSPUtility.GetString(request, "fromDate") == null || JSPUtility.GetString(request, "toDate") == null) {
				ActionStaticUtil.catchActionException(request, error, "Select Proper From Date and To Date !");
				return;
			}

			final var	fromDate	= DateTimeUtility.getStartOfDayTimeStamp(JSPUtility.GetString(request, "fromDate"));
			final var	toDate		= DateTimeUtility.getEndOfDayTimeStamp(JSPUtility.GetString(request, "toDate"));

			final var	objectIn		= new ValueObject();
			final var	cache			= new CacheManip(request);
			final var	executive		= cache.getExecutive(request);
			var			srcBranchIds	= new ArrayList<Long>();
			final var	formTypesBLL	= new FormTypesBLL();

			if(!ActionStaticUtil.isAllowToAccessOperation(error, cache, request, BusinessFunctionConstants.DELIVERY_STATEMENT_CASH_CHEQUE_DETAIL_REPORT, BusinessFunctionConstants.PERMISSION_TYPE_REPORT)) {
				request.setAttribute(Constant.IS_ALLOW_TO_ACCESS_REPORT, false);
				return;
			}

			final var	executiveId		= JSPUtility.GetLong(request, "executiveId", 0);

			List<DeliveryStatementCashChequeDetailReport> reportModel	= null;

			final var	minDate			   = cache.getMinDateInReports(request, executive.getAccountGroupId());
			final var	minDateTimeStamp   = DateTimeUtility.getTimeStamp(minDate);
			final var	execFldPermissionsHM = cache.getExecutiveFieldPermission(request);

			ActionStaticUtil.executiveTypeWiseBranches(request, cache, executive);

			if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_GROUPADMIN || executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_REGIONADMIN || executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_SUBREGIONADMIN)
				branchId 		= JSPUtility.GetLong(request, "branch", 0);
			else
				branchId 		= executive.getBranchId();

			objectIn.put("deliveryPaymentTypeId", JSPUtility.GetShort(request, "deliveryPaymentType", (short) 0));
			objectIn.put("destBranchId", branchId);
			objectIn.put("accountGroupId", executive.getAccountGroupId());
			objectIn.put("fromDate", fromDate);
			objectIn.put("toDate", toDate);
			objectIn.put("executiveId", executiveId);
			objectIn.put("deliveryBillTypeId", JSPUtility.GetShort(request, "deliveryPaymentType", (short) 0));
			objectIn.put("lrTypeId", JSPUtility.GetShort(request, "lrType", (short) 0));
			objectIn.put("billTypeId", JSPUtility.GetShort(request, "billType", (short) 0));
			objectIn.put("billSelectionId", JSPUtility.GetShort(request, "billSelectionId", (short) 0));

			ActionStaticUtil.setRequestAttribute(request,"customAddressBranchId", branchId);
			ActionStaticUtil.setRequestAttribute(request,"customAddressIdentifer", CustomGroupMapper.IDENTIFIER_DELIVERY);

			final var	valueObjDlyReport			= ReadAllConfigurationsBllImpl.getInstance().getOldReportConfigurationData(ReportIdentifierConstant.DELIVERY_STATEMENT_CASH_CHEQUE_DETAIL_REPORT, executive.getAccountGroupId());
			final var	destination					= valueObjDlyReport.getString(DlyStmtCashChequeDetailsReportConfigurationConstant.DESTINATION_COLUMN_ALLOW, "false");
			final var	displayBillTypeColumn		= valueObjDlyReport.getString(DlyStmtCashChequeDetailsReportConfigurationConstant.DISPLAY_BILL_TYPE_COLUMN, "false");
			final var	showPaymentTypeWiseSummary	= valueObjDlyReport.getBoolean(DlyStmtCashChequeDetailsReportConfigurationConstant.SHOW_WAYBILL_SOURCE_WISE_PAYMENT_TYPE_SUMMARY, false);
			final var	isDDShow					= Utility.getBoolean(valueObjDlyReport.getString(DlyStmtCashChequeDetailsReportConfigurationConstant.DISPLAY_DD_CHARGE_COLUMN, "false"));
			final var	showSeperateColumnForCrNoAndPartyName	= Utility.getBoolean(valueObjDlyReport.getString(DlyStmtCashChequeDetailsReportConfigurationConstant.SHOW_SEPERATE_COLUMN_FOR_CR_NO_AND_PARTY_NAME,"false"));
			final var	showStandardDateFormat	= Utility.getBoolean(valueObjDlyReport.getString(DlyStmtCashChequeDetailsReportConfigurationConstant.SHOW_STANDARD_DATE_FORMAT,"false"));
			final var	showPendingDeliveryGodownStockSummary	= valueObjDlyReport.getBoolean(DlyStmtCashChequeDetailsReportConfigurationConstant.SHOW_PENDING_DELIVERY_GODOWN_STOCK_SUMMARY, false);
			final var	showTopayFrghtAndDelChrgsSummaryTable	= valueObjDlyReport.getBoolean(DlyStmtCashChequeDetailsReportConfigurationConstant.SHOW_TOPAY_FRGHT_AND_DEL_CHRGS_SUMMARY_TABLE, false);
			final var	showMessageForConvCharge				= valueObjDlyReport.getBoolean(DlyStmtCashChequeDetailsReportConfigurationConstant.SHOW_MESSAGE_FOR_CONV_CHARGE, false);
			final var	showDeliveryDiscountTypeColumn			= valueObjDlyReport.getBoolean(DlyStmtCashChequeDetailsReportConfigurationConstant.SHOW_DELIVERY_DISCOUNT_TYPE_COLUMN, false);
			final var	showBookingFreightColumn	= PropertiesUtility.isAllow(valueObjDlyReport.getString(DlyStmtCashChequeDetailsReportConfigurationConstant.SHOW_BOOKING_FREIGHT_COLUMN,"false"));
			final var	showOtherChargeColumn		= PropertiesUtility.isAllow(valueObjDlyReport.getString(DlyStmtCashChequeDetailsReportConfigurationConstant.SHOW_OTHER_CHARGE_COLUMN,"false"));
			final var	sortByCRNumber				= PropertiesUtility.isAllow(valueObjDlyReport.getString(DlyStmtCashChequeDetailsReportConfigurationConstant.SORT_BY_CR_NUMBER,"false"));
			final var	showColumnWithZeroAmount	= PropertiesUtility.isAllow(valueObjDlyReport.getString(DlyStmtCashChequeDetailsReportConfigurationConstant.SHOW_COLUMN_WITH_ZERO_AMOUNT,"false"));
			final var	showPopForXpAnd7Print	= PropertiesUtility.isAllow(valueObjDlyReport.getString(DlyStmtCashChequeDetailsReportConfigurationConstant.SHOW_POP_FOR_XP_AND_7_PRINT,"false"));
			final var	showDeliveryCashChequeTotalColumnBold	= PropertiesUtility.isAllow(valueObjDlyReport.getString(DlyStmtCashChequeDetailsReportConfigurationConstant.SHOW_DELIVERY_CASH_CHEQUE_TOTAL_COLUMN_BOLD,"false"));
			final var	showServiceTaxColumn		= valueObjDlyReport.getBoolean(DlyStmtCashChequeDetailsReportConfigurationConstant.SHOW_SERVICE_TAX_COLUMN, true);
			final var	showLimitedDeliveryCharges	= valueObjDlyReport.getBoolean(DlyStmtCashChequeDetailsReportConfigurationConstant.SHOW_LIMITED_DELIVERY_CHARGES, false);
			final var	deliveryChargeIdsforNotShow	= valueObjDlyReport.getString(DlyStmtCashChequeDetailsReportConfigurationConstant.DELIVERY_CHARGES_IDS_FOR_NOT_SHOW, "0");
			final var	showSourceAndDestinationRegionWiseData = valueObjDlyReport.getBoolean(DlyStmtCashChequeDetailsReportConfigurationConstant.SHOW_SOURCE_AND_DESTINATION_REGION_WISE_DATA, false);
			final var	sourceAndDestinationRegionIds = valueObjDlyReport.getString(DlyStmtCashChequeDetailsReportConfigurationConstant.SOURCE_AND_DESTINATION_REGION_IDS, "0");
			final var	showGSTNumber 				  = valueObjDlyReport.getBoolean(DlyStmtCashChequeDetailsReportConfigurationConstant.SHOW_GST_NUMBER, false);
			final var	showDecValue 				  = valueObjDlyReport.getBoolean(DlyStmtCashChequeDetailsReportConfigurationConstant.SHOW_DEC_VALUE, false);
			final var	showCommodity 				  = valueObjDlyReport.getBoolean(DlyStmtCashChequeDetailsReportConfigurationConstant.SHOW_COMMODITY, false);
			final var	showMobNo	 				  = valueObjDlyReport.getBoolean(DlyStmtCashChequeDetailsReportConfigurationConstant.SHOW_MOB_NO, false);
			final var	showMrNumberInCrNumberColumn  = valueObjDlyReport.getBoolean(DlyStmtCashChequeDetailsReportConfigurationConstant.SHOW_MR_NUMBER_IN_CR_NUMBER_COLUMN, false);
			final var	showDeliveryClaimColumn		  = valueObjDlyReport.getBoolean(DlyStmtCashChequeDetailsReportConfigurationConstant.SHOW_DELIVERY_CLAIM_COLUMN, false);
			final var	showDoorDeliveryColumn		  = PropertiesUtility.isAllow(valueObjDlyReport.getString(DlyStmtCashChequeDetailsReportConfigurationConstant.SHOW_DOOR_DELIVERY_COLUMN,"false"));
			final var	showBookingCartageColumn	  = PropertiesUtility.isAllow(valueObjDlyReport.getString(DlyStmtCashChequeDetailsReportConfigurationConstant.SHOW_BOOKING_CARTAGE_COLUMN,"false"));
			final var	allowWhereClauseLogic		  = valueObjDlyReport.getBoolean(DlyStmtCashChequeDetailsReportConfigurationConstant.ALLOW_WHERE_CLAUSE_LOGIC, false);
			final var	fontSizeForNtcs	 			 		= valueObjDlyReport.getBoolean(DlyStmtCashChequeDetailsReportConfigurationConstant.FONT_SIZE_FOR_NTCS, false);
			final var	showDeliveryChargesWiseSummary 		= valueObjDlyReport.getBoolean(DlyStmtCashChequeDetailsReportConfigurationConstant.SHOW_DELIVERY_CHARGES_WISE_SUMMARY, false);
			final var	showCrNoPartyNameColumnInPrint		= valueObjDlyReport.getBoolean(DlyStmtCashChequeDetailsReportConfigurationConstant.SHOW_CR_NO_PARTY_NAME_COLUMN_IN_PRINT, true);
			final var	showExecuteNameColumnInPrint		= valueObjDlyReport.getBoolean(DlyStmtCashChequeDetailsReportConfigurationConstant.SHOW_EXECUTE_NAME_COLUMN_IN_PRINT, true);
			final var	showDeliveryAtColumn				= valueObjDlyReport.getBoolean(DlyStmtCashChequeDetailsReportConfigurationConstant.SHOW_DELIVERYAT_COLUMN, false);
			final var	removeSpecificColumnFromPrintForPsr = valueObjDlyReport.getBoolean(DlyStmtCashChequeDetailsReportConfigurationConstant.REMOVE_SPECIFIC_COLUMN_FROM_PRINT_FOR_PSR, false);
			final var	isSearchDataForOwnBranchOnly 		= valueObjDlyReport.getBoolean(DlyStmtCashChequeDetailsReportConfigurationConstant.IS_SEARCH_DATA_FOR_OWN_BRANCH_ONLY, false);
			final var	showShortCreditDeliveredLrPaymentReceivedSummary	= valueObjDlyReport.getBoolean(DlyStmtCashChequeDetailsReportConfigurationConstant.SHOW_SHORT_CREDIT_DELIVERED_LR_PAYMENT_RECEIVED_SUMMARY, false);
			final var	showLSCreationDate					= valueObjDlyReport.getBoolean(DlyStmtCashChequeDetailsReportConfigurationConstant.SHOW_LS_CREATION_DATE, false);
			final var	allowPartialDdmDetails		  		= valueObjDlyReport.getBoolean(DlyStmtCashChequeDetailsReportConfigurationConstant.SHOW_PARTIAL_DDM_DETAILS, false);

			final var 	isAllowToSearchAllBranchReportData		= execFldPermissionsHM != null && execFldPermissionsHM.get(FeildPermissionsConstant.ALLOW_TO_SEARCH_ALL_BRANCH_REPORT_DATA) != null;
			final var	locationMappMod 						= cache.getAssignedLocationsIdListByLocationIdId(request, executive.getBranchId(), executive.getAccountGroupId());
			final var	showWeightRateColumn 					= valueObjDlyReport.getBoolean(DlyStmtCashChequeDetailsReportConfigurationConstant.SHOW_WEIGHT_RATE_COLUMN, false);
			final var	showCancelledCRData						= valueObjDlyReport.getBoolean(DlyStmtCashChequeDetailsReportConfigurationConstant.SHOW_CANCELLED_CR_DATA, false);

			final var	generalConfigurationMap					= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.GENERAL_CONFIGURATION);
			final var	customPaymentTypeForDeliveredTBBLRInCash = (String) generalConfigurationMap.getOrDefault(GeneralConfigurationPropertiesConstant.CUSTOM_PAYMENT_TYPE_FOR_DELIVERED_TBB_LR_IN_CASH, "Cash");
			final var	showDivisionNameColumn							= valueObjDlyReport.getBoolean(DlyStmtCashChequeDetailsReportConfigurationConstant.SHOW_DIVISION_NAME_COLUMN, false);
			final var	showTdsAmountColumn						= valueObjDlyReport.getBoolean(DlyStmtCashChequeDetailsReportConfigurationConstant.SHOW_TDS_AMOUNT_COLUMN, false);
			final var	deductTDSFromGrandTotal					= valueObjDlyReport.getBoolean(DlyStmtCashChequeDetailsReportConfigurationConstant.DEDUCT_TDS_FROM_GRAND_TOTAL, false);

			if(allowWhereClauseLogic || showCancelledCRData) {
				final var whereClause	= queryString(branchId, fromDate, toDate, request, showCancelledCRData);

				if(showCancelledCRData)
					reportModel = DeliveryStatementCashChequeDetailDAO.getInstance().getDeliveryStatementAndCancelledCRData(whereClause);
				else
					reportModel = DeliveryStatementCashChequeDetailDAO.getInstance().getDeliveryStatementCashChequeData(whereClause);
			} else if (executiveId > 0)
				reportModel = DeliveryStatementCashChequeDetailDAO.getInstance().getDeliveryStatementCashChequeDetailsByExecutiveId(objectIn);
			else
				reportModel = DeliveryStatementCashChequeDetailDAO.getInstance().getDeliveryStatementCashChequeDetails(objectIn);

			if(allowPartialDdmDetails) {
				final var reportData = DeliveryStatementCashChequeDetailDAO.getInstance().getDeliveryStatementCashChequeData(getWhereClause(branchId, fromDate, toDate, request));

				if(ObjectUtils.isNotEmpty(reportData)) {
					if(ObjectUtils.isEmpty(reportModel))
						reportModel	= new ArrayList<>();

					reportModel.addAll(reportData);
				}
			}

			if(showCancelledCRData) {
				final var cancelCrModel = getDeliveryCancelledLRData(request, cache, getWhereclause(objectIn));

				var totalCancelAmount 		= 0.00;

				if(cancelCrModel != null && cancelCrModel.length > 0)
					totalCancelAmount	= CollectionUtility.sum(Arrays.asList(cancelCrModel), CancelledDeliveryReportModel::getCancelCRAmount);

				request.setAttribute("totalCancelAmount", totalCancelAmount);
			}

			if(StringUtils.isNotEmpty(deliveryChargeIdsforNotShow))
				deliveryChargeIdListforNotShow = Utility.GetLongArrayListFromString(deliveryChargeIdsforNotShow, ",");

			if(showSourceAndDestinationRegionWiseData && StringUtils.isNotEmpty(sourceAndDestinationRegionIds)) {
				sourceRegionId 		= Long.parseLong(sourceAndDestinationRegionIds.split("_")[0]);
				destinationRegionId = Long.parseLong(sourceAndDestinationRegionIds.split("_")[1]);
			}

			final var	configuration									= PropertyConfigValueBLLImpl.getInstance().getConfiguration(executive, PropertiesFileConstants.REPORT_WISE_DISPLAY_ZERO_AMOUNT_CONSTANT);
			final var	isAmountZeroForDlyStmtCashChequeDetailReport	= configuration.getBoolean(ReportWiseDisplayZeroAmountConstant.DLY_STMT_CASH_CHEQUE_DETAIL_REPORT, false);
			final var	displayDataConfig								= cache.getDisplayDataConfiguration(request, executive.getAccountGroupId());
			final var	valueObjectIn									= new ValueObject();
			final var	sourceAndDestinationRegionWiseList				= new ArrayList<DeliveryStatementCashChequeDetailReport>();

			request.setAttribute("destination", destination);
			request.setAttribute("displayBillTypeColumn", displayBillTypeColumn);
			request.setAttribute("isDDShow", isDDShow);
			request.setAttribute("dlystmtcashchequereportconfig", valueObjDlyReport);
			request.setAttribute(DlyStmtCashChequeDetailsReportConfigurationConstant.SHOW_SEPERATE_COLUMN_FOR_CR_NO_AND_PARTY_NAME, showSeperateColumnForCrNoAndPartyName);
			request.setAttribute(DlyStmtCashChequeDetailsReportConfigurationConstant.SHOW_STANDARD_DATE_FORMAT, showStandardDateFormat);
			request.setAttribute(DlyStmtCashChequeDetailsReportConfigurationConstant.SHOW_PENDING_DELIVERY_GODOWN_STOCK_SUMMARY, showPendingDeliveryGodownStockSummary);
			request.setAttribute(DlyStmtCashChequeDetailsReportConfigurationConstant.SHOW_TOPAY_FRGHT_AND_DEL_CHRGS_SUMMARY_TABLE, showTopayFrghtAndDelChrgsSummaryTable);
			request.setAttribute(DlyStmtCashChequeDetailsReportConfigurationConstant.SHOW_MESSAGE_FOR_CONV_CHARGE, showMessageForConvCharge);
			request.setAttribute(DlyStmtCashChequeDetailsReportConfigurationConstant.SHOW_DELIVERY_DISCOUNT_TYPE_COLUMN, showDeliveryDiscountTypeColumn);
			request.setAttribute("showBookingFreightColumn", showBookingFreightColumn);
			request.setAttribute("showOtherChargeColumn", showOtherChargeColumn);
			request.setAttribute("showDeliveryCashChequeTotalColumnBold", showDeliveryCashChequeTotalColumnBold);
			request.setAttribute(DlyStmtCashChequeDetailsReportConfigurationConstant.SHOW_COLUMN_WITH_ZERO_AMOUNT, showColumnWithZeroAmount);
			request.setAttribute(DlyStmtCashChequeDetailsReportConfigurationConstant.SHOW_POP_FOR_XP_AND_7_PRINT, showPopForXpAnd7Print);
			request.setAttribute("showServiceTaxColumn", showServiceTaxColumn);
			request.setAttribute("showLimitedDeliveryCharges", showLimitedDeliveryCharges);
			request.setAttribute("showGSTNumber", showGSTNumber);
			request.setAttribute("showDecValue", showDecValue);
			request.setAttribute("showCommodity", showCommodity);
			request.setAttribute("showMobNo", showMobNo);
			request.setAttribute("branchObj", cache.getGenericBranchDetailCache(request, branchId));
			request.setAttribute(DlyStmtCashChequeDetailsReportConfigurationConstant.SHOW_DELIVERY_CLAIM_COLUMN, showDeliveryClaimColumn);
			request.setAttribute("showDoorDeliveryColumn", showDoorDeliveryColumn);
			request.setAttribute("showBookingCartageColumn", showBookingCartageColumn);
			request.setAttribute("fontSizeForNtcs", fontSizeForNtcs);
			request.setAttribute("showDeliveryChargesWiseSummary", showDeliveryChargesWiseSummary);
			request.setAttribute("showCrNoPartyNameColumnInPrint", showCrNoPartyNameColumnInPrint);
			request.setAttribute("showExecuteNameColumnInPrint", showExecuteNameColumnInPrint);
			request.setAttribute("removeSpecificColumnFromPrintForPsr", removeSpecificColumnFromPrintForPsr);
			request.setAttribute("showLSCreationDate", showLSCreationDate);

			request.setAttribute("showBillCreditDetailsSummary", valueObjDlyReport.getBoolean(DlyStmtCashChequeDetailsReportConfigurationConstant.SHOW_BILL_CREDIT_DETAILS_SUMMARY,true));
			request.setAttribute(DlyStmtCashChequeDetailsReportConfigurationConstant.SHOW_BOOKING_DATE_IN_CASHLESS_DATA, valueObjDlyReport.getBoolean(DlyStmtCashChequeDetailsReportConfigurationConstant.SHOW_BOOKING_DATE_IN_CASHLESS_DATA, false));
			request.setAttribute(DlyStmtCashChequeDetailsReportConfigurationConstant.SHOW_ARTICLE_COLUMN, valueObjDlyReport.getBoolean(DlyStmtCashChequeDetailsReportConfigurationConstant.SHOW_ARTICLE_COLUMN, false));
			request.setAttribute(DlyStmtCashChequeDetailsReportConfigurationConstant.SHOW_WEIGHT_COLUMN_ON_CASHLESS_DATA, valueObjDlyReport.getBoolean(DlyStmtCashChequeDetailsReportConfigurationConstant.SHOW_WEIGHT_COLUMN_ON_CASHLESS_DATA, false));
			request.setAttribute(DlyStmtCashChequeDetailsReportConfigurationConstant.SHOW_DELIVERYAT_COLUMN, showDeliveryAtColumn);
			request.setAttribute(DlyStmtCashChequeDetailsReportConfigurationConstant.SHOW_SHORT_CREDIT_DELIVERED_LR_PAYMENT_RECEIVED_SUMMARY, showShortCreditDeliveredLrPaymentReceivedSummary);
			request.setAttribute(DlyStmtCashChequeDetailsReportConfigurationConstant.SHOW_WEIGHT_RATE_COLUMN, showWeightRateColumn);
			request.setAttribute(DlyStmtCashChequeDetailsReportConfigurationConstant.SHOW_DIVISION_NAME_COLUMN, showDivisionNameColumn);

			if(showPendingDeliveryGodownStockSummary) {
				final var	gdwnStockRprtForPendinDelivery	= new GodownStockReportForPendingDeliveryModel();
				gdwnStockRprtForPendinDelivery.setBranchId(branchId);
				gdwnStockRprtForPendinDelivery.setAccountGroupId(executive.getAccountGroupId());
				final var	gdwnStockRprtForPendinDeliveryArr	= GodownStockSummaryDao.getInstance().getGodownStockDetailsForPendingDeliveryByBranchId(gdwnStockRprtForPendinDelivery,minDateTimeStamp);

				if(gdwnStockRprtForPendinDeliveryArr != null && !gdwnStockRprtForPendinDeliveryArr.isEmpty())
					request.setAttribute(GodownStockReportForPendingDeliveryModel.GODOWN_STOCK_REPORT_FOR_PENDING_DELIVERY, getFinalGdwnStockRprtForPendinDelivery(gdwnStockRprtForPendinDeliveryArr));
			}

			var sameDayTotal = 0D;
			var differentDayTotal = 0D;
			var balanceAmt = 0D;

			if(showShortCreditDeliveredLrPaymentReceivedSummary) {
				final var	creditWayBillTxnArray		= CreditWayBillTxnDAO.getInstance().getCreditWayBillTxnDetailByAccountGroupId(branchId, executive.getAccountGroupId(), fromDate, toDate);

				if(creditWayBillTxnArray != null && !creditWayBillTxnArray.isEmpty())
					for (final CreditWayBillTxn element : creditWayBillTxnArray) {
						if(element.getReceivedAmount() > 0 && element.getCreationDateTimeStamp().toLocalDateTime().toLocalDate().equals(element.getReceivedDateTime().toLocalDateTime().toLocalDate()))
							sameDayTotal += element.getReceivedAmount();

						if(element.getPaymentStatus() == PaymentTypeConstant.PAYMENT_TYPE_STATUS_DUE_PAYMENT_ID)
							balanceAmt += element.getGrandTotal();
						else if(element.getPaymentStatus() == PaymentTypeConstant.PAYMENT_TYPE_STATUS_PARTIAL_PAYMENT_ID)
							balanceAmt += element.getGrandTotal() - element.getReceivedAmount();
					}

				final var	creditWayBillTxnCleranceSummaryArray = CreditWayBillTxnClearanceSummaryDAO.getInstance().getDeliveredLRReceivedCreditPaymentRecords(branchId, executive.getAccountGroupId(), fromDate, toDate);

				if(creditWayBillTxnCleranceSummaryArray != null && !creditWayBillTxnCleranceSummaryArray.isEmpty())
					for (final CreditWayBillTxnCleranceSummary element : creditWayBillTxnCleranceSummaryArray)
						if(element.getReceivedAmount() > 0 && !element.getCreationDateTime().toLocalDateTime().toLocalDate().equals(element.getReceivedDateTime().toLocalDateTime().toLocalDate()))
							differentDayTotal += element.getReceivedAmount();

				if(sameDayTotal > 0 || differentDayTotal > 0 || balanceAmt > 0) {
					final var creditWayBillTxnModel	= new CreditWayBillTxn();
					creditWayBillTxnModel.setSameDayReceivedAmtTotal(sameDayTotal);
					creditWayBillTxnModel.setOtherDayReceivedAmtTotal(differentDayTotal);
					creditWayBillTxnModel.setShrtCrdtBalanceAmountTotal(balanceAmt);
					request.setAttribute("creditWayBillTxnModel", creditWayBillTxnModel);
				}
			}

			final var	valueOutObject = GodownStockSummaryDao.getInstance().getGodownStockSummaryData(executive.getAccountGroupId(), branchId, fromDate, toDate);

			if(valueOutObject != null) {
				final var	godownStockSummaryArr 	= (GodownStockSummary[])valueOutObject.get("godownStockSummaryArr");
				final var	godownIdArr 			= (Long[])valueOutObject.get("godownIdArr");
				var	godownIdsString     	= Arrays.toString(godownIdArr);
				godownIdsString 		= godownIdsString.replace("[", "");
				godownIdsString 		= godownIdsString.replace("]", "");

				if(godownStockSummaryArr != null && godownIdArr != null) {
					final var	godownMapList 	= new HashMap<Long, ArrayList<GodownStockSummary>>();
					final var	godownMap 		= GodownDao.getInstance().getGodownNameByIds(godownIdsString);

					for (final GodownStockSummary element : godownStockSummaryArr) {
						var	godownStockSummaryList = godownMapList.get(element.getGodownId());

						if(godownStockSummaryList != null) {
							element.setGodownName(godownMap.get(element.getGodownId()));
							godownStockSummaryList.add(element);
						} else {
							godownStockSummaryList = new ArrayList<>();
							element.setGodownName(godownMap.get(element.getGodownId()));
							godownStockSummaryList.add(element);
							godownMapList.put(element.getGodownId(), godownStockSummaryList);
						}
					}

					request.setAttribute("godownMapList",godownMapList);
				}
			}

			if(ObjectUtils.isNotEmpty(reportModel) && isSearchDataForOwnBranchOnly && !isAllowToSearchAllBranchReportData)
				reportModel = ListFilterUtility.filterList(reportModel, element -> executive.getBranchId() == element.getSourceBranchId() || executive.getBranchId() == element.getDestinationBranchId()
				|| locationMappMod != null && (locationMappMod.contains(element.getSourceBranchId()) || locationMappMod.contains(element.getDestinationBranchId())));

			if(ObjectUtils.isNotEmpty(reportModel)) {
				reportModel	= SortUtils.sortList(reportModel, DeliveryStatementCashChequeDetailReport::getDeliveryDateTime);
				final var wayBillIds	= reportModel.stream().map(e -> Long.toString(e.getWayBillId())).collect(Collectors.joining(Constant.COMMA));
				final var wbIdsForColl	= reportModel.stream().filter(e -> e.getPaymentTypeId() == PaymentTypeConstant.PAYMENT_TYPE_CREDIT_ID).map(e -> Long.toString(e.getWayBillId())).collect(Collectors.joining(Constant.COMMA));
				final var executiveIds	= reportModel.stream().map(e -> Long.toString(e.getExecutiveId())).collect(Collectors.joining(Constant.COMMA));
				final var dcdIds		= reportModel.stream().map(e -> Long.toString(e.getDeliveryContactDetailsId())).collect(Collectors.joining(Constant.COMMA));
				final Map<Long, Long> 	wbIdWithDcd	= reportModel.stream().collect(Collectors.toMap(DeliveryStatementCashChequeDetailReport::getWayBillId, DeliveryStatementCashChequeDetailReport::getDeliveryContactDetailsId, (e1, e2) -> e2));

				if(StringUtils.isNotEmpty(dcdIds)) {
					final var	valInObj = new ValueObject();
					valInObj.put(AliasNameConstants.WB_ID_ARRAY, wayBillIds);
					valInObj.put(AliasNameConstants.DCD_ID, dcdIds);
					valInObj.put(AliasNameConstants.WB_ID_WISE_DCD_IDS, wbIdWithDcd);

					wbIdWiseTDSAmt 		= TDSTxnDetailsBLL.getTDSAmoutForDelivery(valInObj);
				}

				final var	executiveHM  = ExecutiveDao.getInstance().getExecutiveDetailsByExecutiveIds(executiveIds);

				if(StringUtils.isNotEmpty(wbIdsForColl) && executive.getAccountGroupId() != AccountGroupConstant.ACCOUNT_GROUP_ID_LMT)
					lrColl		 = CreditWayBillTxnDAO.getInstance().getCollectionPersonByWayBillIds(wbIdsForColl);

				final var	wayBillIdWiseDeliverychargesHM 	= WayBillDeliveryChargesDao.getInstance().getWayBillIdWiseChargesMap(wayBillIds);
				final var	wayBillTaxTxnHM				   	= WayBillTaxTxnDao.getInstance().getWayBillDeliveryTaxTxn(wayBillIds);
				final var	wayBillIdWiseBookingchargesHM	= WayBillBookingChargesDao.getInstance().getWayBillIdWiseChargesMap(wayBillIds);

				final var	cnsgmtSumaryColl		= ConsignmentSummaryDao.getInstance().getLimitedConsignmentDetails(wayBillIds);
				final var	wayBillBookDataColl		= WayBillHistoryDao.getInstance().getWayBillDetailsByStatus(wayBillIds, WayBillStatusConstant.WAYBILL_STATUS_BOOKED);
				final var	wayBillRcveDataColl		= WayBillHistoryDao.getInstance().getWayBillDetailsByStatus(wayBillIds, WayBillStatusConstant.WAYBILL_STATUS_RECEIVED);
				final var	delConColl				= DeliveryContactDetailsDao.getInstance().getDeliveryContactDetailsForBLHPV(wayBillIds);
				final var	formTypesWithName		= formTypesBLL.getFormTypesWithName(wayBillIds);

				if(valueObjDlyReport.getBoolean("showConsigneeNameColumn", false) || valueObjDlyReport.getBoolean("showWaybillTypeWisePartyName",false))
					consigneeDetails 		= CustomerDetailsDao.getInstance().getConsigneeDetailsByWayBillId(wayBillIds);

				if(valueObjDlyReport.getBoolean("showConsignorNameColumn",false) || valueObjDlyReport.getBoolean("showWaybillTypeWisePartyName",false))
					consignorDetails		= CustomerDetailsDao.getInstance().getConsignorDetailsByWayBillId(wayBillIds);

				final var	paymentTypeColl			= new HashMap<Short, Double>();
				final SortedMap<String, CreditWayBillTxn>	executiveWiseHM			= new TreeMap<>();
				final SortedMap<String, CreditWayBillTxn>	collectionPersonWiseHM	= new TreeMap<>();
				final SortedMap<String, DeliveryCustomerModel>	dlyCustWiseHM			= new TreeMap<>();
				final SortedMap<String, DeliveryStatementCashChequeDetailReport>	billingPartyHm			= new TreeMap<>();

				valueObjectIn.put("executive", executive);
				valueObjectIn.put("execFldPermissionsHM", execFldPermissionsHM);

				for (final DeliveryStatementCashChequeDetailReport element : reportModel) {
					tdsAmt = 0;
					Map<Long,WayBillDeliveryCharges>	chrageMasterIdWiseHM 		= null;
					HashMap<Long,WayBillBookingCharges>	chrageMasterIdWiseBookingHM = null;
					ArrayList<WayBillTaxTxn>	wayBillTaxTxList			= null;

					if(wbIdWiseTDSAmt != null && wbIdWiseTDSAmt.get(element.getWayBillId()) != null)
						tdsAmt		= wbIdWiseTDSAmt.get(element.getWayBillId());

					if(isAmountZeroForDlyStmtCashChequeDetailReport){
						valueObjectIn.put("wayBillTypeId", element.getWayBillTypeId());

						isShowAmountZero = DisplayDataConfigurationBll.isAllowToDisplayZeroAmount(displayDataConfig, valueObjectIn);
					}

					totalTDSAmt += tdsAmt;

					element.setTdsAmount(tdsAmt);

					srcBranchIds.add(element.getSourceBranchId());

					//set source name
					final var	srcbranch	= cache.getGenericBranchDetailCache(request,element.getSourceBranchId());
					element.setSourceBranch(srcbranch.getName());
					element.setSourceSubRegionId(srcbranch.getSubRegionId());
					element.setSourceSubRegion(cache.getGenericSubRegionById(request, srcbranch.getSubRegionId()).getName());
					//set source name

					//set destination name
					final var	destbranch	= cache.getGenericBranchDetailCache(request,element.getDestinationBranchId());
					element.setDestinationBranch(destbranch.getName());
					element.setDestinationSubRegionId(destbranch.getSubRegionId());
					element.setDestinationSubRegion(cache.getGenericSubRegionById(request, destbranch.getSubRegionId()).getName());
					//set destination name

					if(isShowAmountZero) {
						element.setDeliveryDiscount(0);
						element.setGrandTotal(0);
						element.setTdsAmount(0);
					}

					if(element.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID)
						element.setPaidAmount(element.getGrandTotal());
					else if(element.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY || element.getPaymentTypeId() == PaymentTypeConstant.PAYMENT_TYPE_BILL_CREDIT_ID) {
						element.setTopayAmount(element.getGrandTotal() - (element.getDeliveryAmount() - element.getDeliveryDiscount()));

						if(showTdsAmountColumn && deductTDSFromGrandTotal)
							element.setGrandTotal(element.getGrandTotal() - element.getTdsAmount());
					}

					if(element.getDeliveryDiscount() > 0 && !isDiscountShow)
						isDiscountShow = true;

					if(wayBillIdWiseDeliverychargesHM != null && wayBillIdWiseDeliverychargesHM.size() > 0)
						chrageMasterIdWiseHM 	= wayBillIdWiseDeliverychargesHM.get(element.getWayBillId());

					if(wayBillIdWiseBookingchargesHM != null && wayBillIdWiseBookingchargesHM.size() > 0)
						chrageMasterIdWiseBookingHM	= wayBillIdWiseBookingchargesHM.get(element.getWayBillId());

					final var	chargeCollection		= new HashMap<Long,Double>();
					final var	bookingChargeCollection	= new HashMap<Long,Double>();

					if(isShowAmountZero) {
						chrageMasterIdWiseHM		= null;
						chrageMasterIdWiseBookingHM	= null;
					}

					if(showCancelledCRData && element.getDeliveryStatus() == DeliveryStatusConstant.CR_STATUS_CANCELLED) {
						if(element.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY)
							element.setTopayAmount(element.getCancelledCRAmount());

						element.setGrandTotal(element.getCancelledCRAmount());
						element.setDeliveryAmount(0);
						chrageMasterIdWiseHM		= null;
						chrageMasterIdWiseBookingHM	= null;
					}

					if(chrageMasterIdWiseHM != null)
						chrageMasterIdWiseHM.entrySet().stream().map(Map.Entry<Long, WayBillDeliveryCharges>::getValue).forEach((final var wbDLYCharges) -> chargeCollection.put(wbDLYCharges.getWayBillChargeMasterId(), wbDLYCharges.getChargeAmount()));

					//booking charges
					if(chrageMasterIdWiseBookingHM != null)
						chrageMasterIdWiseBookingHM.entrySet().stream().map(Map.Entry<Long, WayBillBookingCharges>::getValue).forEach((final var wbBKGCharges) -> bookingChargeCollection.put(wbBKGCharges.getWayBillChargeMasterId(), wbBKGCharges.getChargeAmount()));

					if(element.getDiscountMasterId() > 0)
						element.setDiscountType(DiscountDetails.getDiscountType(element.getDiscountMasterId()));
					else
						element.setDiscountType("--");

					element.setChargesCollection(chargeCollection);
					element.setBookingchargesCollection(bookingChargeCollection);
					//end

					if(wayBillTaxTxnHM != null && wayBillTaxTxnHM.size() > 0) {
						wayBillTaxTxList = wayBillTaxTxnHM.get(element.getWayBillId());

						if(wayBillTaxTxList != null && !wayBillTaxTxList.isEmpty())
							wayBillTaxTxList.forEach((final WayBillTaxTxn element2) -> element.setServiceTaxAmount(element.getServiceTaxAmount() + element2.getTaxAmount()));
					}

					final var	consignmentSummary = cnsgmtSumaryColl.get(element.getWayBillId());

					if(consignmentSummary == null || wayBillBookDataColl.get(element.getWayBillId()) == null) continue;

					element.setActualWeight(consignmentSummary.getActualWeight());
					element.setQuantity(consignmentSummary.getQuantity());
					element.setWeightRate(consignmentSummary.getWeigthFreightRate());

					if(consignorDetails != null && valueObjDlyReport.getBoolean(DlyStmtCashChequeDetailsReportConfigurationConstant.SHOW_BILL_CREDIT_DETAILS_SUMMARY,true)
							&& PaymentTypeConstant.PAYMENT_TYPE_BILL_CREDIT_ID == element.getPaymentTypeId() && WayBillTypeConstant.WAYBILL_TYPE_CREDIT == element.getWayBillTypeId() ) {
						final var customerDetails = consignorDetails.get(element.getWayBillId());
						element.setPartyName(customerDetails.getBillingPartyName());
						element.setBillingPartyId(	customerDetails.getBillingPartyId());
					}

					if(showCommodity && consignmentSummary != null) {
						final var	commodity	= cache.getCommodityDetails(request, executive.getAccountGroupId(), consignmentSummary.getCommodityMasterId());

						if(commodity != null)
							element.setCommodityName(commodity.getName());
						else
							element.setCommodityName("--");
					} else
						element.setCommodityName("--");

					if(formTypesWithName.get(element.getWayBillId()) != null)
						element.setFormTypeName(formTypesWithName.get(element.getWayBillId()));
					else
						element.setFormTypeName("-----");

					element.setDeclaredValue(consignmentSummary.getDeclaredValue());

					if (consignmentSummary.getInvoiceNo() == null)
						element.setInvoiceNumber("--");
					else
						element.setInvoiceNumber(consignmentSummary.getInvoiceNo());

					element.setDeliveryTypeName(InfoForDeliveryConstant.getInfoForDelivery(element.getDeliveryTypeId()));
					element.setBookDateTime(wayBillBookDataColl.get(element.getWayBillId()).getCreationDateTimeStamp());

					if(sortByCRNumber) {
						final var 	pair	= SplitLRNumber.getNumbers(element.getWayBillDeliveryNumber());

						element.setDestBranchCode(pair != null && pair.getBranchCode() instanceof String ? pair.getBranchCode().toString() : "");
						element.setCrNumberWithoutBranchCode(pair != null && pair.getLrNumber() instanceof Long ? (long) pair.getLrNumber() : 0);
					}

					if(wayBillRcveDataColl != null && wayBillRcveDataColl.get(element.getWayBillId()) != null)
						element.setReceivDateTime(wayBillRcveDataColl.get(element.getWayBillId()).getCreationDateTimeStamp());

					//Collection Person Wise Summary (Start)
					if(lrColl != null && lrColl.size() > 0 && lrColl.get(element.getWayBillId()) != null) {
						element.setCollectionPersonName(lrColl.get(element.getWayBillId()).getCollectionPersonName());
						element.setCollectionPersonId(lrColl.get(element.getWayBillId()).getCollectionPersonId());

						if(element.getCollectionPersonId() > 0) {
							var	collPerMdl	= collectionPersonWiseHM.get(element.getCollectionPersonName()+"_"+element.getCollectionPersonId());

							if(collPerMdl == null) {
								collPerMdl = new CreditWayBillTxn();
								collPerMdl.setShortCreditAmount(element.getGrandTotal());
								collPerMdl.setTotalAmount(collPerMdl.getShortCreditAmount());
								collPerMdl.setQuantity(element.getQuantity());
								collPerMdl.setTotalNoOfLR(1);
								collectionPersonWiseHM.put(element.getCollectionPersonName() + "_" + element.getCollectionPersonId(), collPerMdl);
							} else {
								collPerMdl.setShortCreditAmount(collPerMdl.getShortCreditAmount() + element.getGrandTotal());
								collPerMdl.setTotalAmount(collPerMdl.getShortCreditAmount());
								collPerMdl.setQuantity(collPerMdl.getQuantity() + element.getQuantity());
								collPerMdl.setTotalNoOfLR(collPerMdl.getTotalNoOfLR() + 1);
							}
						}
					}

					//Collection Person Wise Summary (End)

					element.setExecutiveName(executiveHM.get(element.getExecutiveId()).getName());

					if(executive.getAccountGroupId() != TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_LMT && element.getExecutiveId() > 0) {
						var	model	= executiveWiseHM.get(element.getExecutiveName() + "_" + element.getExecutiveId());

						if(model == null) {
							model = new CreditWayBillTxn();

							if(element.getPaymentTypeId() == TransportCommonMaster.PAYMENT_TYPE_CASH_ID)
								model.setCashAmount(element.getGrandTotal());
							else if(element.getPaymentTypeId() == TransportCommonMaster.PAYMENT_TYPE_CHEQUE_ID)
								model.setChequeAmount(element.getGrandTotal());
							else if(element.getPaymentTypeId() == TransportCommonMaster.PAYMENT_TYPE_CREDIT_ID)
								model.setShortCreditAmount(element.getGrandTotal());
							else if(element.getPaymentTypeId() == TransportCommonMaster.PAYMENT_TYPE_BILL_CREDIT_ID)
								model.setBillCreditAmount(element.getGrandTotal());

							final var	paymentTypeHm = new HashMap<Short, Double>();
							paymentTypeHm.put(element.getPaymentTypeId(),element.getGrandTotal());
							model.setPaymentTypeWiseAmtHM(paymentTypeHm);
							model.setTotalAmount(model.getCashAmount() + model.getChequeAmount()+ model.getShortCreditAmount());
							executiveWiseHM.put(element.getExecutiveName() + "_" + element.getExecutiveId(), model);
						} else {
							if(element.getPaymentTypeId() == TransportCommonMaster.PAYMENT_TYPE_CASH_ID)
								model.setCashAmount(model.getCashAmount() +  element.getGrandTotal());
							else if(element.getPaymentTypeId() == TransportCommonMaster.PAYMENT_TYPE_CHEQUE_ID)
								model.setChequeAmount(model.getChequeAmount() + element.getGrandTotal());
							else if(element.getPaymentTypeId() == TransportCommonMaster.PAYMENT_TYPE_CREDIT_ID)
								model.setShortCreditAmount(model.getShortCreditAmount() + element.getGrandTotal());
							else if(element.getPaymentTypeId() == TransportCommonMaster.PAYMENT_TYPE_BILL_CREDIT_ID)
								model.setBillCreditAmount(model.getBillCreditAmount() + element.getGrandTotal());

							var	paymentTypeHm = model.getPaymentTypeWiseAmtHM();

							if(paymentTypeHm == null ) {
								paymentTypeHm = new HashMap<>();
								paymentTypeHm.put(element.getPaymentTypeId(),element.getGrandTotal());
							} else if(paymentTypeHm.get(element.getPaymentTypeId()) == null)
								paymentTypeHm.put(element.getPaymentTypeId(), element.getGrandTotal());
							else
								paymentTypeHm.put(element.getPaymentTypeId(), element.getGrandTotal() + paymentTypeHm.get(element.getPaymentTypeId()));

							model.setPaymentTypeWiseAmtHM(paymentTypeHm);
							model.setTotalAmount(model.getCashAmount() + model.getChequeAmount()+ model.getShortCreditAmount()+ model.getBillCreditAmount());
						}
					}

					//Delivery Customer Wise Collection (Start)
					if(element.getDeliveryCustomerId() > 0) {
						var	deliveryCustomerModel = dlyCustWiseHM.get(element.getDeliveredToName( ) + "_" + element.getDeliveryCustomerId());

						if(deliveryCustomerModel == null) {
							deliveryCustomerModel = new DeliveryCustomerModel();

							if(element.getPaymentTypeId() == PaymentTypeConstant.PAYMENT_TYPE_CASH_ID)
								deliveryCustomerModel.setCashAmount(element.getGrandTotal());
							else if(element.getPaymentTypeId() == PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID)
								deliveryCustomerModel.setChequeAmount(element.getGrandTotal());
							else if(element.getPaymentTypeId() == PaymentTypeConstant.PAYMENT_TYPE_CREDIT_ID)
								deliveryCustomerModel.setShortCreditAmount(element.getGrandTotal());

							deliveryCustomerModel.setTotalQty(element.getQuantity());
							deliveryCustomerModel.setTotalNoOfLR(1);
							deliveryCustomerModel.setTotalAmount(deliveryCustomerModel.getCashAmount() + deliveryCustomerModel.getChequeAmount()+ deliveryCustomerModel.getShortCreditAmount());
							dlyCustWiseHM.put(element.getDeliveredToName() + "_" + element.getDeliveryCustomerId(), deliveryCustomerModel);
						} else {
							if(element.getPaymentTypeId() == PaymentTypeConstant.PAYMENT_TYPE_CASH_ID)
								deliveryCustomerModel.setCashAmount(deliveryCustomerModel.getCashAmount() +  element.getGrandTotal());
							else if(element.getPaymentTypeId() == PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID)
								deliveryCustomerModel.setChequeAmount(deliveryCustomerModel.getChequeAmount() + element.getGrandTotal());
							else if(element.getPaymentTypeId() == PaymentTypeConstant.PAYMENT_TYPE_CREDIT_ID)
								deliveryCustomerModel.setShortCreditAmount(deliveryCustomerModel.getShortCreditAmount() + element.getGrandTotal());

							deliveryCustomerModel.setTotalQty(deliveryCustomerModel.getTotalQty() + element.getQuantity());
							deliveryCustomerModel.setTotalNoOfLR(deliveryCustomerModel.getTotalNoOfLR() + 1);
							deliveryCustomerModel.setTotalAmount(deliveryCustomerModel.getCashAmount() + deliveryCustomerModel.getChequeAmount()+ deliveryCustomerModel.getShortCreditAmount());
						}
					}
					//Delivery Customer Wise Collection (End)

					if(element.getBillingPartyId() > 0 && element.getPaymentTypeId() == PaymentTypeConstant.PAYMENT_TYPE_BILL_CREDIT_ID) {
						var	billingPartyModel = billingPartyHm.get(element.getPartyName() + "_" + element.getBillingPartyId());

						if(billingPartyModel == null) {
							billingPartyModel = new DeliveryStatementCashChequeDetailReport();

							billingPartyModel.setBillingPartyId(element.getBillingPartyId());
							billingPartyModel.setPartyName(element.getPartyName());
							billingPartyModel.setTotalQuantity(element.getQuantity());
							billingPartyModel.setTotalLR(1);
							billingPartyModel.setTotalAmount(element.getGrandTotal());

							billingPartyHm.put(element.getPartyName() + "_" + element.getBillingPartyId(), billingPartyModel);
						} else {
							billingPartyModel.setTotalQuantity(billingPartyModel.getTotalQuantity() +  element.getQuantity());
							billingPartyModel.setTotalLR(billingPartyModel.getTotalLR() + 1);
							billingPartyModel.setTotalAmount(billingPartyModel.getTotalAmount() + element.getGrandTotal());
						}
					}

					//payment type wise collection (start)
					final var	delConDet = delConColl.get(element.getWayBillId());

					if(delConDet != null)
						if(paymentTypeColl.get(delConDet.getPaymentType()) != null)
							paymentTypeColl.put(delConDet.getPaymentType(), paymentTypeColl.get(delConDet.getPaymentType()) + element.getGrandTotal());
						else
							paymentTypeColl.put(delConDet.getPaymentType(), element.getGrandTotal());

					if(showSourceAndDestinationRegionWiseData && srcbranch.getRegionId() == sourceRegionId && destbranch.getRegionId() == destinationRegionId)
						sourceAndDestinationRegionWiseList.add(element);

					if(showMrNumberInCrNumberColumn && element.getMrNumber() != null)
						element.setWayBillDeliveryNumber(element.getMrNumber());

					element.setWayBillTypeStr(WayBillTypeConstant.getWayBillTypeNameByWayBilTypeId(element.getWayBillTypeId()));

					if(element.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT && element.getPaymentTypeId() == PaymentTypeConstant.PAYMENT_TYPE_CASH_ID)
						element.setPaymentTypeName(customPaymentTypeForDeliveredTBBLRInCash);
					else
						element.setPaymentTypeName(PaymentTypeConstant.getPaymentType(element.getPaymentTypeId()));
				}

				if(sourceAndDestinationRegionWiseList != null && !sourceAndDestinationRegionWiseList.isEmpty()) {
					sourceAndDestinationRegionWiseArray = new DeliveryStatementCashChequeDetailReport[sourceAndDestinationRegionWiseList.size()];
					sourceAndDestinationRegionWiseList.toArray(sourceAndDestinationRegionWiseArray);
				}

				final var	subRegionIdWiseCashSummaryHM 		= new HashMap<Long, DeliveryStatementCashChequeDetailReport>();
				final var	subRegionIdWiseShrtCreditSummaryHM 	= new HashMap<Long, DeliveryStatementCashChequeDetailReport>();
				final var	subRegionWiseTotalAmtCashHM  		= new HashMap<Long, Double>();
				final var	subRegionWiseTotalAmtShrtCreditHM 	= new HashMap<Long, Double>();

				if((valueObjDlyReport.getBoolean("showWayBillSourceWiseSummary", false)
						|| valueObjDlyReport.getBoolean("showWayBillSourceWiseDiscountSummary", false)
						|| showPaymentTypeWiseSummary) && srcBranchIds != null && !srcBranchIds.isEmpty()) {
					final var	branchesColl 				= cache.getGenericBranchesDetail(request);
					final var	subRegionColl				= cache.getAllSubRegions(request);
					srcBranchIds 				= Utility.removeLongDuplicateElementsFromArrayList(srcBranchIds);
					final var	branchSubRegionIdHM			= new HashMap<Long,Long>();
					final var	subRegionIdWiseSummaryHM 	= new HashMap<Long, DeliveryStatementCashChequeDetailReport>();
					final var	subRegionWiseTotalAmtHM		= new HashMap<Long, Double>();
					final var	chrgWiseTotalAmt 			= new DeliveryStatementCashChequeDetailReport();
					final var	cashChrgWiseTotalAmt		= new DeliveryStatementCashChequeDetailReport();
					final var	shrtCreditChrgWiseTotalAmt	= new DeliveryStatementCashChequeDetailReport();

					final var	reportModelClone = new DeliveryStatementCashChequeDetailReport[reportModel.size()];

					for(var i = 0; i < reportModel.size(); i++) {
						reportModelClone[i] = (DeliveryStatementCashChequeDetailReport) reportModel.get(i).clone();
						reportModelClone[i].setChargesCollection((HashMap<Long, Double>) reportModel.get(i).getChargesCollection().clone());
					}

					for (final Long srcBranchId : srcBranchIds) {
						final var	branch	= (Branch)branchesColl.get(Long.toString(srcBranchId));
						branchSubRegionIdHM.put(branch.getBranchId(), branch.getSubRegionId());
					}

					if(reportModelClone != null && reportModelClone.length > 0 && !showPaymentTypeWiseSummary) {
						for (final DeliveryStatementCashChequeDetailReport element : reportModelClone) {
							final var	subRegionId 	= branchSubRegionIdHM.get(element.getSourceBranchId());

							final var		rptModel = subRegionIdWiseSummaryHM.get(subRegionId);

							if(rptModel == null) {
								final var	subRegion	= (SubRegion) subRegionColl.get(subRegionId);
								element.setSubRegionName(subRegion.getName());

								subRegionIdWiseSummaryHM.put(subRegionId, element);
							} else {
								rptModel.setTopayAmount(rptModel.getTopayAmount() + element.getTopayAmount());

								final var	chargesCollection 		= rptModel.getChargesCollection();
								final var	chargesCollectionNew 	= element.getChargesCollection();

								for(final Map.Entry<Long, Double> entry1 : chargesCollectionNew.entrySet()) {
									final long	key = entry1.getKey();

									if(chargesCollection.get(key) != null)
										chargesCollection.put(key, chargesCollection.get(key) + entry1.getValue());
									else
										chargesCollection.put(key, entry1.getValue());
								}

								rptModel.setServiceTaxAmount(rptModel.getServiceTaxAmount() + element.getServiceTaxAmount());

								if(isDiscountShow)
									rptModel.setDeliveryDiscount(rptModel.getDeliveryDiscount() + element.getDeliveryDiscount());
							}

							final var	subRegionTotalAmt = element.getGrandTotal();

							if(subRegionWiseTotalAmtHM.get(subRegionId) == null)
								subRegionWiseTotalAmtHM.put(subRegionId, subRegionTotalAmt);
							else
								subRegionWiseTotalAmtHM.put(subRegionId, subRegionWiseTotalAmtHM.get(subRegionId) + subRegionTotalAmt);
						}

						for(final Map.Entry<Long, DeliveryStatementCashChequeDetailReport> entry : subRegionIdWiseSummaryHM.entrySet()) {
							final var detailReport = entry.getValue();

							chrgWiseTotalAmt.setTopayAmount(chrgWiseTotalAmt.getTopayAmount() + detailReport.getTopayAmount());

							var	chargesCollection	= chrgWiseTotalAmt.getChargesCollection();

							if(chargesCollection != null && chargesCollection.size() > 0) {
								final var	chargesCollectionNew = detailReport.getChargesCollection();

								for(final Map.Entry<Long, Double> entry1 : chargesCollectionNew.entrySet()) {
									final long chrgId	= entry1.getKey();
									chargesCollection.put(chrgId, (chargesCollection.get(chrgId) != null ? chargesCollection.get(chrgId) : 0) + entry1.getValue());
								}
							} else {
								chargesCollection = new HashMap<>();
								final var	chargesCollectionNew = detailReport.getChargesCollection();

								for(final Map.Entry<Long, Double> entry1 : chargesCollectionNew.entrySet())
									chargesCollection.put(entry1.getKey(), entry1.getValue());

								chrgWiseTotalAmt.setChargesCollection(chargesCollection);
							}

							chrgWiseTotalAmt.setServiceTaxAmount(chrgWiseTotalAmt.getServiceTaxAmount() + detailReport.getServiceTaxAmount());

							if(isDiscountShow || valueObjDlyReport.getBoolean("showWayBillSourceWiseDiscountSummary", false))
								chrgWiseTotalAmt.setDeliveryDiscount(chrgWiseTotalAmt.getDeliveryDiscount() + detailReport.getDeliveryDiscount());
						}
					}

					DeliveryStatementCashChequeDetailReport	rptModel	 = null;

					if(showPaymentTypeWiseSummary && reportModelClone != null && reportModelClone.length > 0) {
						for (final DeliveryStatementCashChequeDetailReport element : reportModelClone) {
							final var	subRegionId 	= branchSubRegionIdHM.get(element.getSourceBranchId());

							if(element.getPaymentTypeId() != PaymentTypeConstant.PAYMENT_TYPE_CASH_ID
									&& element.getPaymentTypeId() != PaymentTypeConstant.PAYMENT_TYPE_CREDIT_ID)
								continue;

							if(element.getPaymentTypeId() == PaymentTypeConstant.PAYMENT_TYPE_CASH_ID)
								rptModel = subRegionIdWiseCashSummaryHM.get(subRegionId);
							else if(element.getPaymentTypeId() == PaymentTypeConstant.PAYMENT_TYPE_CREDIT_ID)
								rptModel = subRegionIdWiseShrtCreditSummaryHM.get(subRegionId);

							if(rptModel == null) {
								final var	subRegion	= (SubRegion) subRegionColl.get(subRegionId);
								element.setSubRegionName(subRegion.getName());

								if(element.getPaymentTypeId() == PaymentTypeConstant.PAYMENT_TYPE_CASH_ID)
									subRegionIdWiseCashSummaryHM.put(subRegionId, element);
								else if(element.getPaymentTypeId() == PaymentTypeConstant.PAYMENT_TYPE_CREDIT_ID)
									subRegionIdWiseShrtCreditSummaryHM.put(subRegionId, element);
							} else {
								rptModel.setTopayAmount(rptModel.getTopayAmount() + element.getTopayAmount());

								final var	chargesCollection 		= rptModel.getChargesCollection();

								if(element.getPaymentTypeId() == PaymentTypeConstant.PAYMENT_TYPE_CASH_ID) {
									final var	chargesCollectionCashNew = element.getChargesCollection();

									for(final Map.Entry<Long, Double> entry1 : chargesCollectionCashNew.entrySet()) {
										final long key	= entry1.getKey();

										if(chargesCollection.get(key) != null)
											chargesCollection.put(key, chargesCollection.get(key) + entry1.getValue());
										else
											chargesCollection.put(key, entry1.getValue());
									}
								}  else if(element.getPaymentTypeId() == PaymentTypeConstant.PAYMENT_TYPE_CREDIT_ID) {
									final var	chargesCollectionShrtCreditNew = element.getChargesCollection();

									for(final Map.Entry<Long, Double> entry1 : chargesCollectionShrtCreditNew.entrySet()) {
										final long key	= entry1.getKey();

										if(chargesCollection.get(key) != null)
											chargesCollection.put(key, chargesCollection.get(key) + entry1.getValue());
										else
											chargesCollection.put(key, entry1.getValue());
									}
								}

								rptModel.setServiceTaxAmount(rptModel.getServiceTaxAmount() + element.getServiceTaxAmount());

								if(isDiscountShow)
									rptModel.setDeliveryDiscount(rptModel.getDeliveryDiscount() + element.getDeliveryDiscount());
							}

							final var	subRegionTotalAmt = element.getGrandTotal();

							if(element.getPaymentTypeId() == PaymentTypeConstant.PAYMENT_TYPE_CASH_ID) {
								if(subRegionWiseTotalAmtCashHM.get(subRegionId) == null)
									subRegionWiseTotalAmtCashHM.put(subRegionId, subRegionTotalAmt);
								else
									subRegionWiseTotalAmtCashHM.put(subRegionId, subRegionWiseTotalAmtCashHM.get(subRegionId) + subRegionTotalAmt);
							} else if(element.getPaymentTypeId() == PaymentTypeConstant.PAYMENT_TYPE_CREDIT_ID)
								if(subRegionWiseTotalAmtShrtCreditHM.get(subRegionId) == null)
									subRegionWiseTotalAmtShrtCreditHM.put(subRegionId, subRegionTotalAmt);
								else
									subRegionWiseTotalAmtShrtCreditHM.put(subRegionId, subRegionWiseTotalAmtShrtCreditHM.get(subRegionId) + subRegionTotalAmt);
						}

						for(final Map.Entry<Long, DeliveryStatementCashChequeDetailReport> entry : subRegionIdWiseCashSummaryHM.entrySet()) {
							final var	detailReport = entry.getValue();

							cashChrgWiseTotalAmt.setTopayAmount(cashChrgWiseTotalAmt.getTopayAmount() + detailReport.getTopayAmount());

							var	chargesCollection	= cashChrgWiseTotalAmt.getChargesCollection();

							if(chargesCollection != null && chargesCollection.size() > 0) {
								final var	chargesCollectionCashNew = detailReport.getChargesCollection();

								for(final Map.Entry<Long, Double> entry1 : chargesCollectionCashNew.entrySet()) {
									final long key	= entry1.getKey();
									chargesCollection.put(key, (chargesCollection.get(key) != null ? chargesCollection.get(key) : 0) + entry1.getValue());
								}
							} else {
								chargesCollection = new HashMap<>();
								final var	chargesCollectionCashNew = detailReport.getChargesCollection();

								for(final Map.Entry<Long, Double> entry1 : chargesCollectionCashNew.entrySet())
									chargesCollection.put(entry1.getKey(), entry1.getValue());

								cashChrgWiseTotalAmt.setChargesCollection(chargesCollection);
							}

							cashChrgWiseTotalAmt.setServiceTaxAmount(cashChrgWiseTotalAmt.getServiceTaxAmount() + detailReport.getServiceTaxAmount());

							if(isDiscountShow)
								cashChrgWiseTotalAmt.setDeliveryDiscount(cashChrgWiseTotalAmt.getDeliveryDiscount() + detailReport.getDeliveryDiscount());
						}

						for(final Map.Entry<Long, DeliveryStatementCashChequeDetailReport> entry : subRegionIdWiseShrtCreditSummaryHM.entrySet()) {
							final var	detailReport = entry.getValue();

							shrtCreditChrgWiseTotalAmt.setTopayAmount(shrtCreditChrgWiseTotalAmt.getTopayAmount() + detailReport.getTopayAmount());

							var	chargesCollection	= shrtCreditChrgWiseTotalAmt.getChargesCollection();

							if(chargesCollection != null && chargesCollection.size() > 0) {
								final var	chargesCollectionShrtCreditNew = detailReport.getChargesCollection();

								for(final Map.Entry<Long, Double> entry1 : chargesCollectionShrtCreditNew.entrySet()) {
									final long chrgId	= entry1.getKey();
									chargesCollection.put(chrgId, (chargesCollection.get(chrgId) != null ? chargesCollection.get(chrgId) : 0) + entry1.getValue());
								}
							} else {
								chargesCollection = new HashMap<>();
								final var	chargesCollectionShrtCreditNew = detailReport.getChargesCollection();

								for(final Map.Entry<Long, Double> entry1 : chargesCollectionShrtCreditNew.entrySet())
									chargesCollection.put(entry1.getKey(), entry1.getValue());

								shrtCreditChrgWiseTotalAmt.setChargesCollection(chargesCollection);
							}

							shrtCreditChrgWiseTotalAmt.setServiceTaxAmount(shrtCreditChrgWiseTotalAmt.getServiceTaxAmount() + detailReport.getServiceTaxAmount());

							if(isDiscountShow)
								shrtCreditChrgWiseTotalAmt.setDeliveryDiscount(shrtCreditChrgWiseTotalAmt.getDeliveryDiscount() + detailReport.getDeliveryDiscount());
						}
					}

					request.setAttribute("chrgWiseTotalAmt",chrgWiseTotalAmt);
					request.setAttribute("subRegionIdWiseSummaryHM",subRegionIdWiseSummaryHM);
					request.setAttribute("subRegionWiseTotalAmtHM",subRegionWiseTotalAmtHM);
					request.setAttribute("cashChrgWiseTotalAmt",cashChrgWiseTotalAmt);
					request.setAttribute("subRegionIdWiseCashSummaryHM",subRegionIdWiseCashSummaryHM);
					request.setAttribute("subRegionWiseTotalAmtCashHM",subRegionWiseTotalAmtCashHM);
					request.setAttribute("shrtCreditChrgWiseTotalAmt",shrtCreditChrgWiseTotalAmt);
					request.setAttribute("subRegionIdWiseShrtCreditSummaryHM",subRegionIdWiseShrtCreditSummaryHM);
					request.setAttribute("subRegionWiseTotalAmtShrtCreditHM",subRegionWiseTotalAmtShrtCreditHM);
					request.setAttribute("showPaymentTypeWiseSummary",showPaymentTypeWiseSummary);
				}

				if(sortByCRNumber)
					reportModel	= SortUtils.sortList(reportModel, DeliveryStatementCashChequeDetailReport::getDestBranchCode, DeliveryStatementCashChequeDetailReport::getCrNumberWithoutBranchCode);

				final var reportModelArray = new DeliveryStatementCashChequeDetailReport [reportModel.size()];
				reportModel.toArray(reportModelArray);

				request.setAttribute("billingPartyHm",billingPartyHm);
				request.setAttribute("DeliveryStatementCashChequeDetailReport",reportModelArray);
				request.setAttribute("paymentTypeColl",paymentTypeColl);
				request.setAttribute("executiveWiseHM",executiveWiseHM);
				request.setAttribute("dlyCustWiseHM",dlyCustWiseHM);
				request.setAttribute("collectionPersonWiseHM",collectionPersonWiseHM);
				request.setAttribute("isDiscountShow",isDiscountShow);
				request.setAttribute("consigneeDetails",consigneeDetails);
				request.setAttribute("consignorDetails",consignorDetails);
				request.setAttribute(AliasNameConstants.TOTAL_TDS_AMOUNT, totalTDSAmt);
				request.setAttribute("sourceAndDestinationRegionWiseArray",sourceAndDestinationRegionWiseArray);

				final var	deliveryCharges 	= cache.getDeliveryCharges(request, executive.getBranchId());

				final var	deliveryChargeList 	= new ArrayList<ChargeTypeModel>();

				if(showLimitedDeliveryCharges) {
					if(deliveryCharges != null && deliveryCharges.length > 0) {
						for (final ChargeTypeModel deliveryCharge : deliveryCharges)
							if(deliveryChargeIdListforNotShow != null && !deliveryChargeIdListforNotShow.isEmpty() && !deliveryChargeIdListforNotShow.contains(deliveryCharge.getChargeTypeMasterId()))
								deliveryChargeList.add(deliveryCharge);

						if(deliveryChargeList != null && !deliveryChargeList.isEmpty()) {
							newDeliveryCharges = new ChargeTypeModel[deliveryChargeList.size()];
							deliveryChargeList.toArray(newDeliveryCharges);
						} else
							newDeliveryCharges = new ChargeTypeModel[0];
					}

					request.setAttribute("DeliveryCharges",newDeliveryCharges);
				} else
					request.setAttribute("DeliveryCharges",deliveryCharges);

				request.setAttribute("BookingCharges", cache.getBookingCharges(request, executive.getBranchId()));
			} else {
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}

			ActionStaticUtil.setReportViewModel(request);
			request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}

	private GodownStockReportForPendingDeliveryModel getFinalGdwnStockRprtForPendinDelivery(final ArrayList<GodownStockReportForPendingDeliveryModel> gdwnStockRprtForPendinDeliveryArr) throws Exception {
		try {
			final var		godownStockReportForPendingDeliveryModel	= new GodownStockReportForPendingDeliveryModel();

			godownStockReportForPendingDeliveryModel.setTotalLRs(gdwnStockRprtForPendinDeliveryArr.stream().count());
			godownStockReportForPendingDeliveryModel.setTotalQuantity(gdwnStockRprtForPendinDeliveryArr.stream().mapToLong(GodownStockReportForPendingDeliveryModel::getQuantity).sum());
			godownStockReportForPendingDeliveryModel.setTotalWeight(gdwnStockRprtForPendinDeliveryArr.stream().mapToDouble(GodownStockReportForPendingDeliveryModel::getActualWeight).sum());
			godownStockReportForPendingDeliveryModel.setTotalToPayAmount(gdwnStockRprtForPendinDeliveryArr.stream().filter(a -> a.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY).mapToDouble(GodownStockReportForPendingDeliveryModel::getBookingAmount).sum());
			godownStockReportForPendingDeliveryModel.setTotalPaidAmount(gdwnStockRprtForPendinDeliveryArr.stream().filter(a -> a.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID).mapToDouble(GodownStockReportForPendingDeliveryModel::getBookingAmount).sum());
			godownStockReportForPendingDeliveryModel.setTotalTBBAmount(gdwnStockRprtForPendinDeliveryArr.stream().filter(a -> a.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT).mapToDouble(GodownStockReportForPendingDeliveryModel::getBookingAmount).sum());

			return godownStockReportForPendingDeliveryModel;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private String queryString(final long branchId, final Timestamp fromDate, final Timestamp toDate, final HttpServletRequest request,
			boolean showCancelledCRData) throws Exception {
		try {
			final var deliveryPaymentType	= JSPUtility.GetShort(request, "deliveryPaymentType", (short) 0);
			final var lrType				= JSPUtility.GetShort(request, "lrType", (short) 0);
			final var billSelectionId		= JSPUtility.GetShort(request, "billSelectionId", (short) 0);
			final var billType				= JSPUtility.GetShort(request, "billType", (short) 0);
			final var deliveryTypeId		= JSPUtility.GetShort(request, "deliveryTypeId", (short) 0);
			final var executiveId			= JSPUtility.GetLong(request, "executiveId", 0);
			final var divisionId			= JSPUtility.GetLong(request, Constant.DIVISION_ID, 0);

			final var	whereClause	= new StringJoiner(" ");

			if(showCancelledCRData) {
				whereClause.add("dcd.DeliveryDateTime >= '" + fromDate + "'");
				whereClause.add("AND dcd.DeliveryDateTime <= '" + toDate + "'");
			} else {
				whereClause.add("WB.CreationDateTimeStamp >= '" + fromDate + "'");
				whereClause.add("AND WB.CreationDateTimeStamp <= '" + toDate + "'");
				whereClause.add("AND WB.status = 9");
				whereClause.add("AND dcd.[Status] = 1");
			}

			if(branchId > 0)
				if(showCancelledCRData)
					whereClause.add("AND dcd.BranchId = " + branchId);
				else
					whereClause.add("AND WB.BranchId = " + branchId);

			if(deliveryPaymentType > 0)
				whereClause.add("AND dcd.PaymentType = " + deliveryPaymentType);
			else
				whereClause.add("AND dcd.PaymentType <> 7");

			if (lrType > 0) whereClause.add("AND WB.WayBillTypeId = " + lrType);
			if (executiveId > 0) whereClause.add("AND dcd.SettledByExecutiveId = " + executiveId);
			if (billSelectionId > 0) whereClause.add("AND cs.BillSelectionId = " + billSelectionId);
			if (billType > 0) whereClause.add("AND ftd.FormTypesId = " + billType);
			if (deliveryTypeId > 0) whereClause.add("AND WB.DeliveryTypeId = " + deliveryTypeId);
			if (divisionId > 0) whereClause.add("AND cs.DivisionId = " + divisionId);

			whereClause.add("ORDER BY CRNo,dcd.DeliveryDateTime");

			return whereClause.toString();
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private String getWhereclause(final ValueObject objectIn) throws Exception {
		try {
			final var destBranchId			= objectIn.getLong("destBranchId");
			final var accountGroupId		= objectIn.getLong("accountGroupId");
			final var executiveId			= objectIn.getLong("executiveId");
			final var deliveryPaymentType	= objectIn.getShort("deliveryPaymentType");
			final var lrTypeId				= objectIn.getShort("lrTypeId");

			final var	whereClause	= new StringJoiner(" ");

			whereClause.add("WB.CreationDateTimeStamp >= '" + objectIn.get("fromDate") + "'");
			whereClause.add("AND WB.CreationDateTimeStamp <= '" + objectIn.get("toDate") + "'");
			whereClause.add("AND WB.status = 15 ");

			if(destBranchId > 0)
				whereClause.add("AND WB.BranchId = " + destBranchId);

			if(accountGroupId > 0)
				whereClause.add("AND WB.AccountGroupId = " + accountGroupId);

			if(deliveryPaymentType > 0)
				whereClause.add("AND dcd.PaymentType = " + deliveryPaymentType);
			else
				whereClause.add("AND dcd.PaymentType <> 7");

			if (lrTypeId > 0)
				whereClause.add("AND WB.WayBillTypeId = " + lrTypeId);

			if (executiveId > 0)
				whereClause.add("AND dcd.SettledByExecutiveId = " + executiveId);

			whereClause.add("ORDER BY WB.CreationDateTimeStamp");

			return whereClause.toString();
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private CancelledDeliveryReportModel[] getDeliveryCancelledLRData( final HttpServletRequest request, final CacheManip cache, String whereClause) throws Exception {
		try {
			final var vo = CancelledDeliveryReportDao.getInstance().getCancelledDeliveryDetails(whereClause);

			if (vo != null) {
				final var	reportModel = (CancelledDeliveryReportModel[])vo.get("CancelledDeliveryReport");
				final var	wayBillIdArr= (Long[]) vo.get("WayBillIdArray");

				if(reportModel != null && wayBillIdArr != null) {
					final var	wayBillIds = Utility.GetLongArrayToString(wayBillIdArr);

					final var	conSumHM	= ConsignmentSummaryDao.getInstance().getLimitedConsignmentDetails(wayBillIds);
					final var	wayBillBookDataColl = WayBillHistoryDao.getInstance().getWayBillDetailsByStatus(wayBillIds, WayBillStatusConstant.WAYBILL_STATUS_BOOKED);
					final var	wayBillRcveDataColl = WayBillHistoryDao.getInstance().getWayBillDetailsByStatus(wayBillIds, WayBillStatusConstant.WAYBILL_STATUS_RECEIVED);

					for (final CancelledDeliveryReportModel element : reportModel) {
						element.setSourceBranch(cache.getGenericBranchDetailCache(request,element.getSourceBranchId()).getName());

						if (element.getDestinationBranchId() > 0)
							element.setDestinationBranch(cache.getGenericBranchDetailCache(request,element.getDestinationBranchId()).getName());
						else
							element.setDestinationBranch(element.getDeliveryPlace());

						final var	consignmentSummary = conSumHM.get(element.getWayBillId());
						element.setActualWeight(consignmentSummary.getActualWeight());
						element.setQuantity(consignmentSummary.getQuantity());

						element.setBookDateTime(wayBillBookDataColl.get(element.getWayBillId()).getCreationDateTimeStamp());
						element.setReceivDateTime(wayBillRcveDataColl.get(element.getWayBillId()).getCreationDateTimeStamp());

						if(!ObjectUtils.isEmpty(WayBillStatusConstant.getStatus(element.getLrCurrentStatusId())))
							element.setLrCurrentStatusString(WayBillStatusConstant.getStatus(element.getLrCurrentStatusId()));
						else
							element.setLrCurrentStatusString("--");

						element.setGrandTotal(element.getCancelCRAmount());
					}
				}

				request.setAttribute("CancelledDeliveryStatementCashChequeDetailReport",reportModel);

				return reportModel;
			}

			return null;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private String getWhereClause(final long branchId, final Timestamp fromDate, final Timestamp toDate, final HttpServletRequest request) throws Exception {
		try {
			final var deliveryPaymentType	= JSPUtility.GetShort(request, "deliveryPaymentType", (short) 0);
			final var lrType				= JSPUtility.GetShort(request, "lrType", (short) 0);
			final var billSelectionId		= JSPUtility.GetShort(request, "billSelectionId", (short) 0);
			final var billType				= JSPUtility.GetShort(request, "billType", (short) 0);
			final var deliveryTypeId		= JSPUtility.GetShort(request, "deliveryTypeId", (short) 0);
			final var executiveId			= JSPUtility.GetLong(request, "executiveId", 0);
			final var divisionId			= JSPUtility.GetLong(request, Constant.DIVISION_ID, 0);

			final var	whereClause	= new StringJoiner(" ");

			whereClause.add("WB.CreationDateTimeStamp >= '" + fromDate + "'");
			whereClause.add("AND WB.CreationDateTimeStamp <= '" + toDate + "'");
			whereClause.add("AND WB.status In (20,22,23)");
			whereClause.add("AND dcd.[Status] In (5,6)");

			if(branchId > 0) whereClause.add("AND WB.BranchId = " + branchId);

			if(deliveryPaymentType > 0)
				whereClause.add("AND dcd.PaymentType = " + deliveryPaymentType);
			else
				whereClause.add("AND dcd.PaymentType NOT In (7,27,28)");

			if (lrType > 0) whereClause.add("AND WB.WayBillTypeId = " + lrType);
			if (executiveId > 0) whereClause.add("AND dcd.SettledByExecutiveId = " + executiveId);
			if (billSelectionId > 0) whereClause.add("AND cs.BillSelectionId = " + billSelectionId);
			if (billType > 0) whereClause.add("AND ftd.FormTypesId = " + billType);
			if (deliveryTypeId > 0) whereClause.add("AND WB.DeliveryTypeId = " + deliveryTypeId);
			if (divisionId > 0) whereClause.add("AND cs.DivisionId = " + divisionId);

			whereClause.add("ORDER BY CRNo,dcd.DeliveryDateTime");

			return whereClause.toString();
		} catch (final Exception e) {
			e.printStackTrace();
			throw e;
		}
	}
}