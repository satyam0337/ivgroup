package com.ivcargo.reports;

import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.reports.collection.FTLCollectionReportBLL;
import com.framework.Action;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.properties.constant.DisplayDataWithinDateRangePropertiesConstant;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.message.Message;
import com.ivcargo.actionUtility.ActionInstanceUtil;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.configuration.report.collection.FtlCollectionReportConfigurationDTO;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

public class FTLCollectionReportAction implements Action{

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	error 					= null;
		String					branchIds				= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeFTLCollectionReportAction().execute(request, response);

			final var	ftlCollectionReportBLL	= new FTLCollectionReportBLL();
			final var	valInObj 				= new ValueObject();
			final var	actionUtil2 			= new ActionInstanceUtil();
			final var	fromDate				= ActionStaticUtil.getFromToDate(request, ActionStaticUtil.FROMDATE, ActionStaticUtil.FROMTIME);
			final var	toDate					= ActionStaticUtil.getFromToDate(request, ActionStaticUtil.TODATE, ActionStaticUtil.TOTIME);
			final var	executive   			= ActionStaticUtil.getExecutive(request);
			final var	cache					= new CacheManip(request);
			final var	displayDataConfig		= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.DISPLAY_DATA_CONFIGURATION);
			final Map<?, ?>	execFldPermissionsHM 	= cache.getExecutiveFieldPermission(request);
			final var	valObjSelection = actionUtil2.reportSelection(request, executive);
			final var	branchId 		= (Long)valObjSelection.get("branchId");
			request.setAttribute("agentName", executive.getName());

			final var configuration							= ReadAllConfigurationsBllImpl.getInstance().getOldReportConfigurationData(ReportIdentifierConstant.FTL_COLLECTION_REPORT, executive.getAccountGroupId());
			final var customErrorOnOtherBranchDetailSearch	= configuration.getBoolean(FtlCollectionReportConfigurationDTO.CUSTOM_ERROR_ON_OTHER_BRANCH_DETAIL_SEARCH,false);
			final var locationMappingList    				= cache.getAssignedLocationsIdListByLocationIdId(request, executive.getBranchId(), executive.getAccountGroupId());
			
			if(branchId > 0) {
				final var	assignedLocationIdList = cache.getAssignedLocationsIdListByLocationIdId(request, branchId, executive.getAccountGroupId());

				if(!assignedLocationIdList.contains(branchId))
					assignedLocationIdList.add(branchId);

				branchIds = Utility.GetLongArrayListToString(assignedLocationIdList);
			}else {
				ActionStaticUtil.executiveTypeWiseBranches(request, cache, executive);
				branchIds	= ActionStaticUtil.getPhysicalBranchIds1(request, cache, executive);
			}

			valInObj.put("fromDate", fromDate);
			valInObj.put("toDate", toDate);
			valInObj.put("branchIds", branchIds);
			valInObj.put("accountGroupId", executive.getAccountGroupId());
			valInObj.put("branchesColl", cache.getGenericBranchesDetail(request));
			valInObj.put("getSubRegionByBranchId", request.getAttribute("getSubRegionByBranchId"));
			valInObj.put(DisplayDataWithinDateRangePropertiesConstant.DISPLAY_DATA_CONFIGURATION_CONSTANT, displayDataConfig);
			valInObj.put("executive", executive);
			valInObj.put("execFldPermissionsHM", execFldPermissionsHM);
			valInObj.put("configuration", configuration);
			valInObj.put("locationMappingList", locationMappingList);

			final var	valObj = ftlCollectionReportBLL.getFTLCollecion(valInObj);

			if(valObj == null) {
				ActionStaticUtil.setRequestAttribute(request, ActionStaticUtil.NO_RECORDS_FOUND, true);
				return;
			}
			if(valObj != null && valObj.containsKey(Message.MESSAGE)){
				if(customErrorOnOtherBranchDetailSearch){
					error.put("errorCode", CargoErrorList.OTHER_BRANCH_REPORT_DATA_SEARCH_ERROR);
					if(branchId > 0)
						error.put("errorDescription", "Kindly Contact Source Branch For Report");
					else
						error.put("errorDescription", "Kindly Contact Respective Branches For Report");

					request.setAttribute("cargoError", error);
				}else {
					error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
					error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
					request.setAttribute("cargoError", error);
				}
				return;
			}

			request.setAttribute("ReportData",valObj.get("ReportData"));
			request.setAttribute("Total",valObj.get("Total"));
			request.setAttribute("TotalFreight", valObj.get("TotalFreight"));
			request.setAttribute("consignmentSummaryHM", valObj.get("consignmentSummaryHM"));
			request.setAttribute("creditWayBillHshmp", valObj.get("creditWayBillHshmp"));
			request.setAttribute("deliveryContactDetailsHM", valObj.get("deliveryContactDetailsHM"));

			ActionStaticUtil.setReportViewModel(request);
			ActionStaticUtil.setNextPageToken(request, ActionStaticUtil.SUCCESS);
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}

	}
}
