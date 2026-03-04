package com.ivcargo.reports;

import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.PaidCollectionDetailReportBll;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.dto.constant.BusinessFunctionConstants;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.constant.Constant;
import com.iv.utils.constant.DateTimeFormatConstant;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.message.Message;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.configuration.report.LrPaidStatementReportConfigDTO;
import com.platform.dto.model.LHPVCompanyDetails;
import com.platform.dto.model.PaidCollectionDetailReport;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

public class PaidCollectionDetailReportAction implements Action {

	@Override
	@SuppressWarnings("unchecked")
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	 		error 				= null;
		String							branchIds										= null;

		short   filter			= 0;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			final var	cache 	        = new CacheManip(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			if(!ActionStaticUtil.isAllowToAccessOperation(error, cache, request, BusinessFunctionConstants.PAID_COLLECTION_DETAIL, BusinessFunctionConstants.PERMISSION_TYPE_REPORT)) {
				request.setAttribute(Constant.IS_ALLOW_TO_ACCESS_REPORT, false);
				return;
			}
			new InitializePaidCollectionDetailReportAction().execute(request, response);

			final var	executive       = cache.getExecutive(request);

			final var	configuration 					= ReadAllConfigurationsBllImpl.getInstance().getOldReportConfigurationData(ReportIdentifierConstant.LR_PAID_STATEMENT_DETAIL, executive.getAccountGroupId());
			final var	bookingcharges 					= cache.getBookingCharges(request, executive.getBranchId());
			final var	showDateColumn					= configuration.getBoolean(LrPaidStatementReportConfigDTO.SHOW_DATE_COLUMN,true);
			final var	showFromBranchColumn			= configuration.getBoolean(LrPaidStatementReportConfigDTO.SHOW_FROM_BRANCH_COLUMN,false);
			final var	showToBranchColumn				= configuration.getBoolean(LrPaidStatementReportConfigDTO.SHOW_TO_BRANCH_COLUMN,false);
			final var	showChargeWeightColumn			= configuration.getBoolean(LrPaidStatementReportConfigDTO.SHOW_CHARGE_WEIGHT_COLUMN,false);
			final var	showStatusColumn				= configuration.getBoolean(LrPaidStatementReportConfigDTO.SHOW_STATUS_COLUMN,true);
			final var 	showRemarkColumn 				= configuration.getBoolean(LrPaidStatementReportConfigDTO.SHOW_REMARK_COLUMN,false);
			final var	showCommissionAndTotalWithoutCommission	 = configuration.getBoolean(LrPaidStatementReportConfigDTO.SHOW_COMMISSION_AND_TOTAL_WITHOUT_COMMISSION,true);
			final var	operationalBranchEntryForPaidLr	= configuration.getBoolean(LrPaidStatementReportConfigDTO.OPERATIONAL_BRANCH_ENTRY_FOR_PAID_LR, false);
			final var	customErrorOnOtherBranchDetailSearch	 = configuration.getBoolean(LrPaidStatementReportConfigDTO.CUSTOM_ERROR_ON_OTHER_BRANCH_DETAIL_SEARCH, false);

			final var	execFldPermissions 				= cache.getExecutiveFieldPermission(request);
			request.setAttribute(LrPaidStatementReportConfigDTO.SHOW_DATE_COLUMN, showDateColumn);
			request.setAttribute(LrPaidStatementReportConfigDTO.SHOW_FROM_BRANCH_COLUMN, showFromBranchColumn);
			request.setAttribute(LrPaidStatementReportConfigDTO.SHOW_TO_BRANCH_COLUMN, showToBranchColumn);
			request.setAttribute(LrPaidStatementReportConfigDTO.SHOW_CHARGE_WEIGHT_COLUMN, showChargeWeightColumn);
			request.setAttribute(LrPaidStatementReportConfigDTO.SHOW_STATUS_COLUMN, showStatusColumn);
			request.setAttribute(LrPaidStatementReportConfigDTO.SHOW_COMMISSION_AND_TOTAL_WITHOUT_COMMISSION, showCommissionAndTotalWithoutCommission);
			request.setAttribute(LrPaidStatementReportConfigDTO.SHOW_REMARK_COLUMN, showRemarkColumn);
			request.setAttribute("bookingcharges", bookingcharges);
			request.setAttribute(LrPaidStatementReportConfigDTO.SHOW_BANK_NAME_COLUMN, configuration.getBoolean(LrPaidStatementReportConfigDTO.SHOW_BANK_NAME_COLUMN, false));

			if(JSPUtility.GetString(request, "fromDate") == null || JSPUtility.GetString(request, "toDate") == null) {
				ActionStaticUtil.catchActionException(request, error, "Select Proper From Date and To Date !");
				return;
			}

			final var	fromDate	= DateTimeUtility.getStartTimestampFromDateString(JSPUtility.GetString(request, "fromDate"), DateTimeFormatConstant.DD_MM_YY_HH_MM_SS);
			final var	toDate		= DateTimeUtility.getEndTimestampFromDateString(JSPUtility.GetString(request, "toDate"), DateTimeFormatConstant.DD_MM_YY_HH_MM_SS);
			final var	objectIn 		= new ValueObject();

			ActionStaticUtil.executiveTypeWiseBranches(request, cache, executive);

			var	branchId 	= JSPUtility.GetLong(request, "branch", 0);

			if(branchId == 0)
				branchId 	= executive.getBranchId();

			if(!operationalBranchEntryForPaidLr) {
				final var	assignedLocationIdList = cache.getAssignedLocationsIdListByLocationIdId(request, branchId, executive.getAccountGroupId());

				if(!assignedLocationIdList.contains(branchId))
					assignedLocationIdList.add(branchId);

				branchIds = Utility.GetLongArrayListToString(assignedLocationIdList);
			} else {
				branchIds	= Long.toString(branchId);
				filter		= 1;
			}

			objectIn.put("fromDate", fromDate);
			objectIn.put("toDate", toDate);
			objectIn.put("branchId", branchId);
			objectIn.put("executive", executive);
			objectIn.put("branchIds", branchIds);
			objectIn.put("filter", filter);
			objectIn.put("configuration", configuration);
			objectIn.put("execFldPermissions", execFldPermissions);
			objectIn.put("assignedLocationList", cache.getAssignedLocationsIdListByLocationIdId(request, executive.getBranchId(), executive.getAccountGroupId()));

			final var	displayDataConfig	= cache.getDisplayDataConfiguration(request, executive.getAccountGroupId());
			final var	branchColl			= cache.getGenericBranchesDetail(request);

			final var	bll = new PaidCollectionDetailReportBll();
			final var	objectOut = bll.processReport(objectIn, displayDataConfig, branchColl);

			if(objectOut != null && objectOut.containsKey(Message.MESSAGE)) {
				if(customErrorOnOtherBranchDetailSearch){
					error.put("errorCode", CargoErrorList.OTHER_BRANCH_REPORT_DATA_SEARCH_ERROR);
					if(branchId > 0)
						error.put("errorDescription", "Kindly Contact Source Branch For Report");
					else
						error.put("errorDescription", "Kindly Contact Respective Branches For Report");
				}else {
					error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
					error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				}
				request.setAttribute("cargoError", error);
				return;
			}

			if(objectOut != null && objectOut.getHtData().size() > 0) {
				final var	wbCollection			= (Map<Long, PaidCollectionDetailReport>) objectOut.get("wbCollection");
				final var	cancelledWbCol			= (Map<Long, PaidCollectionDetailReport>) objectOut.get("cancelledWbCol");

				if(wbCollection != null && wbCollection.size() > 0 || cancelledWbCol != null && cancelledWbCol.size() > 0)
					objectOut.put("executiveWiseDetails", configuration.getString(LrPaidStatementReportConfigDTO.EXECUTIVE_WISE_LR_PAID_STATEMENT_DETAILS, "false"));

				request.setAttribute("PaidCollectionDetailReport", objectOut);
			} else {
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}

			ActionStaticUtil.setRequestAttribute(request,"customAddressBranchId", branchId);
			ActionStaticUtil.setRequestAttribute(request,"customAddressIdentifer", LHPVCompanyDetails.IDENTIFIER_BOOKING);
			ActionStaticUtil.setReportViewModel(request);

			request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}
}