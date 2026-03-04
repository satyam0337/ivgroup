package com.ivcargo.reports;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.ObjectUtils;

import com.businesslogic.reports.LHPV.PendingBLHPVLedgerReportBLL;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.dto.constant.FeildPermissionsConstant;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.properties.constant.report.PendingBlhpvLedgerReportConfigurationConstant;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.constant.Constant;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.utility.ListFilterUtility;
import com.ivcargo.actionUtility.ActionInstanceUtil;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.AliasNameConstants;
import com.platform.dto.CustomGroupMapper;
import com.platform.dto.Executive;
import com.platform.dto.LHPVModel;
import com.platform.dto.configuration.mindateselection.ReportWiseMinDateSelectionConfigurationDTO;
import com.platform.dto.constant.ExecutiveTypeConstant;
import com.platform.resource.CargoErrorList;

public class PendingBLHPVLedgerReportAction implements Action {

	private static final String TRACE_ID = PendingBLHPVLedgerReportAction.class.getName();

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	 		error 						= null;
		var 							branchId					= 0L;

		try {
			error 						= ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var startTime = System.currentTimeMillis();
			new PendingBLHPVLedgerReportInitializeAction().execute(request, response);

			final var	cManip 		= new CacheManip(request);
			final var	executive	= cManip.getExecutive(request);
			final var 	actionUtil2 = new ActionInstanceUtil();

			final var	minDateTimeStamp	= cManip.getReportWiseMinDateToGetData(request, executive.getAccountGroupId(),
					ReportWiseMinDateSelectionConfigurationDTO.PENDING_BLHPV_LEDGER_REPORT_MIN_DATE_ALLOW,
					ReportWiseMinDateSelectionConfigurationDTO.PENDING_BLHPV_LEDGER_REPORT_MIN_DATE);

			final var check = JSPUtility.GetString(request, "check", "");

			final var	selectedVehicleNo 		= JSPUtility.GetLong(request, "selectedVehicleNo",0);
			final var	selectedVehicleAgentId 	= JSPUtility.GetLong(request, "selectedVehicleAgentId",0);

			final var	configuration				= ReadAllConfigurationsBllImpl.getInstance().getOldReportConfigurationData(ReportIdentifierConstant.PENDING_BLHPV_LEDGER_REPORT, executive.getAccountGroupId());
			final var	showNetPayableAmt			= configuration.getBoolean(PendingBlhpvLedgerReportConfigurationConstant.SHOW_NET_PAYABLE_AMT, false);
			final var	showPrintOption				= configuration.getBoolean(PendingBlhpvLedgerReportConfigurationConstant.SHOW_PRINT_OPTION, false);
			final var	showBranchWiseSelection		= configuration.getBoolean(PendingBlhpvLedgerReportConfigurationConstant.SHOW_BRANCH_WISE_SELECTION, false);
			final var	showLHPVAdvanceStatus		= configuration.getBoolean(PendingBlhpvLedgerReportConfigurationConstant.SHOW_LHPV_ADVANCE_STATUS, false);
			final var    valObjSelection 			= actionUtil2.reportSelection(request, executive);
			final var 	customErrorOnOtherBranchDetailSearch	= configuration.getBoolean(PendingBlhpvLedgerReportConfigurationConstant.CUSTOM_ERROR_ON_OTHER_BRANCH_DETAIL_SEARCH,false);
			final var 	isSearchDataForOwnBranchOnly			= configuration.getBoolean(PendingBlhpvLedgerReportConfigurationConstant.IS_SEARCH_DATA_FOR_OWN_BRANCH_ONLY, false);
			final var 	execFldPermissionsHM 					= cManip.getExecutiveFieldPermission(request);
			final var 	isAllowToSearchAllBranchReportData		= execFldPermissionsHM != null && execFldPermissionsHM.containsKey(FeildPermissionsConstant.ALLOW_TO_SEARCH_ALL_BRANCH_REPORT_DATA);
			final var 	assignedLocationList 					= cManip.getAssignedLocationsIdListByLocationIdId(request, executive.getBranchId(), executive.getAccountGroupId());

			request.setAttribute("agentName", executive.getName());
			request.setAttribute("showNetPayableAmt", showNetPayableAmt);
			request.setAttribute("showPrintOption", showPrintOption);
			request.setAttribute("showLHPVAdvanceStatus", showLHPVAdvanceStatus);

			var	regionId 	= JSPUtility.GetLong(request, "region", 0);
			var	subRegionId = JSPUtility.GetLong(request, "subRegion", 0);

			if (showBranchWiseSelection || "byPayBranch".equals(check)) {
				ActionStaticUtil.executiveTypeWiseBranches(request, cManip, executive);

				if (executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN || executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_REGIONADMIN || executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_SUBREGIONADMIN)
					branchId = JSPUtility.GetLong(request, "branch", 0);
				else
					branchId         = (Long)valObjSelection.get("branchId");

				regionId         = (Long)valObjSelection.get("regionId");
				subRegionId      = (Long)valObjSelection.get("subRegionId");
			}

			final var	valueInObject = new ValueObject();

			valueInObject.put("selectedVehicleNo", selectedVehicleNo);
			valueInObject.put("selectedVehicleAgentId", selectedVehicleAgentId);
			valueInObject.put(Constant.ACCOUNT_GROUP_ID, executive.getAccountGroupId());
			valueInObject.put("branchColl", cManip.getGenericBranchesDetail(request));
			valueInObject.put(AliasNameConstants.VEHICLE_NUMBER_MASTER, cManip.getALLVehicleNumberOfGroup(request, executive.getAccountGroupId()));
			valueInObject.put(Executive.EXECUTIVE, executive);
			valueInObject.put(Constant.MIN_DATE_TIME_STAMP, minDateTimeStamp);
			valueInObject.put(Constant.BRANCH_ID, branchId);
			valueInObject.put(Constant.REGION_ID, regionId);
			valueInObject.put(Constant.SUB_REGION_ID, subRegionId);
			valueInObject.put("isPayableBranchChecked", "byPayBranch".equals(check));

			if(request.getParameter("searchByDate") != null || "byDate".equals(check)) {
				valueInObject.put(Constant.FROM_DATE, DateTimeUtility.getStartOfDayTimeStamp(JSPUtility.GetString(request, "fromDate")));
				valueInObject.put(Constant.TO_DATE, DateTimeUtility.getEndOfDayTimeStamp(JSPUtility.GetString(request, "toDate")));
			}

			var	reports = PendingBLHPVLedgerReportBLL.getInstance().getDataFromReport(valueInObject);

			if(ObjectUtils.isEmpty(reports)) {
				ActionStaticUtil.setRequestAttribute(request, ActionStaticUtil.NO_RECORDS_FOUND, true);
				ActionStaticUtil.setNextPageToken(request, ActionStaticUtil.SUCCESS);
				ActionStaticUtil.getReportElapsedTime(TRACE_ID, executive, startTime);
			}

			if(!ObjectUtils.isEmpty(reports) && isSearchDataForOwnBranchOnly && !isAllowToSearchAllBranchReportData)
				reports = ListFilterUtility.filterList(reports, element -> executive.getBranchId() == element.getSourceBranchId()
				|| executive.getBranchId() == element.getDestinationBranchId()
				|| assignedLocationList != null && (assignedLocationList.contains(element.getSourceBranchId()) || assignedLocationList.contains(element.getDestinationBranchId())));

			if(ObjectUtils.isEmpty(reports)) {
				if(customErrorOnOtherBranchDetailSearch) {
					error.put("errorCode", CargoErrorList.OTHER_BRANCH_REPORT_DATA_SEARCH_ERROR);
					if(branchId > 0)
						error.put("errorDescription", "Kindly Contact Source Branch For Report");
					else
						error.put("errorDescription", "Kindly Contact Respective Branches For Report");
				} else {
					error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
					error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				}
				request.setAttribute("cargoError", error);

				ActionStaticUtil.setNextPageToken(request, ActionStaticUtil.SUCCESS);
				ActionStaticUtil.getReportElapsedTime(TRACE_ID, executive, startTime);
				return;
			}

			final var		reportSorted	= new LHPVModel[reports.size()];
			reports.toArray(reportSorted);

			ActionStaticUtil.setRequestAttribute(request,"customAddressBranchId", branchId);
			ActionStaticUtil.setRequestAttribute(request,"customAddressIdentifer", CustomGroupMapper.IDENTIFIER_BOOKING);

			ActionStaticUtil.setReportViewModel(request);
			ActionStaticUtil.setRequestAttribute(request, "reports", reportSorted);

			ActionStaticUtil.setNextPageToken(request, ActionStaticUtil.SUCCESS);
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}
}