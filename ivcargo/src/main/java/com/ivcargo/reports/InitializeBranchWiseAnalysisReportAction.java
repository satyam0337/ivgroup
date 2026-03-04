package com.ivcargo.reports;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.constant.properties.report.BranchWiseAnalysisReportConstant;
import com.iv.dto.constant.BusinessFunctionConstants;
import com.iv.dto.constant.FeildPermissionsConstant;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.dto.constant.WayBillStatusConstant;
import com.iv.utils.constant.Constant;
import com.iv.utils.utility.CollectionUtility;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.configuration.report.common.CommonReportsConfigurationDTO;
import com.platform.dto.constant.ExecutiveTypeConstant;

public class InitializeBranchWiseAnalysisReportAction implements Action {

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>					 error 								= null;
		List<WayBillStatusConstant> 		 	 wayBillStatusListForSelection		= null;
		var									 	isSubRegionAllow					= false;
		var									 	isBranchAllow						= false;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	executive 		= ActionStaticUtil.getExecutive(request);
			final var	cacheManip 		= new CacheManip(request);

			if(executive == null) {
				ActionStaticUtil.throwInvalidSessionError(request, error);
				return;
			}

			if(!ActionStaticUtil.isAllowToAccessOperation(error, cacheManip, request, BusinessFunctionConstants.BRANCH_WISE_ANALYSIS_REPORT, BusinessFunctionConstants.PERMISSION_TYPE_REPORT)) {
				request.setAttribute(Constant.IS_ALLOW_TO_ACCESS_REPORT, false);
				return;
			}

			final var	execSubRegionId	= executive.getSubRegionId();
			final var	confValObj 		= cacheManip.getCommonReportsConfiguration(request, executive.getAccountGroupId());
			final var	branches		= cacheManip.getBranchesArrayBySubRegionId(request, executive.getAccountGroupId(), execSubRegionId);

			final var	executiveFeildPermissions				= cacheManip.getExecutiveFieldPermission(request);

			final var	reportConfig							= ReadAllConfigurationsBllImpl.getInstance().getReportConfigurationData(ReportIdentifierConstant.BRANCH_WISE_ANALYSIS, executive.getAccountGroupId());
			final var	commonConfig							= cacheManip.getCommonReportsConfiguration(request, executive.getAccountGroupId());
			final var	wayBillStatus							= (String) reportConfig.getOrDefault(BranchWiseAnalysisReportConstant.WAY_BILL_STATUS_LIST, "");
			final var	wayBillStatusList						= CollectionUtility.getShortListFromString(wayBillStatus);
			final var	showGroupMergingBranchData				= commonConfig.getBoolean(CommonReportsConfigurationDTO.IS_SHOW_GROUP_MERGING_BRANCH_DATA, false);
			final var	executiveWiseAreaSelection				= (boolean) reportConfig.getOrDefault(BranchWiseAnalysisReportConstant.EXECUTIVE_WISE_AREA_SELECTION, false);

			if(wayBillStatusList != null) {
				wayBillStatusListForSelection = new ArrayList<>();

				for (final Short element : wayBillStatusList)
					if(element > 0) {
						final var wayBillStatusConstant	= new WayBillStatusConstant();

						wayBillStatusConstant.setWayBillStatusId(element);
						wayBillStatusConstant.setWayBillStatusName(WayBillStatusConstant.getWayBillStatusType(element));
						wayBillStatusListForSelection.add(wayBillStatusConstant);
					}
			}

			request.setAttribute(ActionStaticUtil.IS_ALL_AREA_NEED_TO_SHOW, true);
			request.setAttribute(ActionStaticUtil.IS_ALL_BRANCHES_NEED_TO_SHOW, true);
			request.setAttribute(ActionStaticUtil.IS_ALL_TO_AREA_NEED_TO_SHOW, true);
			request.setAttribute(ActionStaticUtil.IS_ALL_ENDBRANCH_NEED_TO_SHOW, true);
			request.setAttribute(ActionStaticUtil.IS_EXECUTIVE_NEED_TO_SHOW, false);
			request.setAttribute(ActionStaticUtil.IS_ALL_WAYBILL_STATUS_OPTION_NEED_TO_SHOW, true);
			request.setAttribute("confValObj", confValObj);
			request.setAttribute("fromSubregionLabel", reportConfig.getOrDefault(BranchWiseAnalysisReportConstant.FROM_SUBREGION_LABEL, ""));
			request.setAttribute("cityBranchLabel", reportConfig.getOrDefault(BranchWiseAnalysisReportConstant.CITY_BRANCH_LABEL, ""));
			request.setAttribute("toSubRegionLabel", reportConfig.getOrDefault(BranchWiseAnalysisReportConstant.TO_SUB_REGION_LABEL, ""));
			request.setAttribute("toBranchLabel", reportConfig.getOrDefault(BranchWiseAnalysisReportConstant.TO_BRANCH_LABEL, ""));
			request.setAttribute(BranchWiseAnalysisReportConstant.MAX_DAYS_TO_FIND_REPORT, reportConfig.getOrDefault(BranchWiseAnalysisReportConstant.MAX_DAYS_TO_FIND_REPORT, 31));
			request.setAttribute(BranchWiseAnalysisReportConstant.NO_OF_MONTHS_ALLOWED, reportConfig.getOrDefault(BranchWiseAnalysisReportConstant.NO_OF_MONTHS_ALLOWED, 1));

			ActionStaticUtil.setExecutiveCoreReportPermissionsInRequest(request, executive);
			ActionStaticUtil.setExecutiveTypeBooleanInRequest(request, executive, true);

			final var	allsubregionsdataforgrouparray = cacheManip.getSubRegionsByGroupId(request, executive.getAccountGroupId(), showGroupMergingBranchData);

			if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN
					|| (boolean) reportConfig.getOrDefault(BranchWiseAnalysisReportConstant.SOURCE_BRANCH_SELECTION_FOR_NORMAL_USER, false)) {
				isSubRegionAllow	= true;
				isBranchAllow		= true;
			}

			if(executiveWiseAreaSelection)
				if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_REGIONADMIN) {
					isSubRegionAllow	= true;
					isBranchAllow		= true;
				} else if (executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_SUBREGIONADMIN) {
					isSubRegionAllow	= false;
					isBranchAllow		= true;
				}

			final var	showDownloadToExcelOption	= executiveFeildPermissions != null && executiveFeildPermissions.get(FeildPermissionsConstant.GENERATE_BRANCH_WISE_ANALYSIS_REPORT_EXCEL) != null;

			if(!isSubRegionAllow && isBranchAllow) request.setAttribute("branches", branches);

			request.setAttribute("reportConfig", reportConfig);
			request.setAttribute("executiveWiseAreaSelection", executiveWiseAreaSelection);
			request.setAttribute("isSubRegionAllow", isSubRegionAllow);
			request.setAttribute("isBranchAllow", isBranchAllow);
			request.setAttribute("subRegionForGroup", allsubregionsdataforgrouparray);
			request.setAttribute("TosubRegionForGroup", allsubregionsdataforgrouparray);
			request.setAttribute("wayBillStatusListForSelection", wayBillStatusListForSelection);
			request.setAttribute(CommonReportsConfigurationDTO.IS_SHOW_GROUP_MERGING_BRANCH_DATA, showGroupMergingBranchData);
			request.setAttribute("showDownloadToExcelOption", showDownloadToExcelOption);
			request.setAttribute("wayBillType", cacheManip.getAllWayBillType(request));
			request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}
}