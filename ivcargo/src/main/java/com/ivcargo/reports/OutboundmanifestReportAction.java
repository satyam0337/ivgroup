package com.ivcargo.reports;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringUtils;

import com.businesslogic.OutboundmanifestReportBLL;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.properties.constant.report.DispatchedStockReportConfigurationConstant;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.TransportCommonMaster;
import com.platform.dto.constant.FeildPermissionsConstant;
import com.platform.dto.model.OutboundmanifestReportModel;

public class OutboundmanifestReportAction implements Action {

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	 		error 						= null;
		String							branchesStr					= null;
		String 							sourceBranchIds				= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeOutboundAction().execute(request, response);

			final var	fromDate			       = ActionStaticUtil.getFromToDate(request, ActionStaticUtil.FROMDATE, ActionStaticUtil.FROMTIME);
			final var	toDate				       = ActionStaticUtil.getFromToDate(request, ActionStaticUtil.FROMDATE, ActionStaticUtil.TOTIME);
			final var	executive   		       = ActionStaticUtil.getExecutive(request);
			final var	destinationCityId	       = JSPUtility.GetLong(request, "TosubRegion", 0);
			final var	accountGroupId		       = executive.getAccountGroupId();
			final var	sourceBranchId		       = JSPUtility.GetLong(request, "branch", 0);
			final var	cManip						= new CacheManip(request);

			final var 	executiveFeildPermission = cManip.getExecutiveFieldPermission(request);

			final var	selectedCity = JSPUtility.GetLong(request, "subRegion", 0);

			final var	configuration  					= ReadAllConfigurationsBllImpl.getInstance().getReportConfigurationData(ReportIdentifierConstant.DISPATCHED_STOCK_REPORT, executive.getAccountGroupId());
			final var	showConsolidateEwaybillNo		= (boolean) configuration.getOrDefault(DispatchedStockReportConfigurationConstant.SHOW_CONSOLIDATE_EWAYBILLNO,false);

			final var	allowGenerateConsolidateEWaybillForAnyBranch	= executiveFeildPermission != null && executiveFeildPermission.containsKey(FeildPermissionsConstant.ALLOW_GENERATE_COSOLIDATE_EWAYBILL_FOR_ANY_BRANCH)
					&& !executiveFeildPermission.get(FeildPermissionsConstant.ALLOW_GENERATE_COSOLIDATE_EWAYBILL_FOR_ANY_BRANCH).isMarkForDelete();

			request.setAttribute("allowGenerateConsolidateEWaybillForAnyBranch", allowGenerateConsolidateEWaybillForAnyBranch);
			request.setAttribute("showConsolidateEwaybillNo", showConsolidateEwaybillNo);
			request.setAttribute("agentName", executive.getName());
			request.setAttribute("fromDate", JSPUtility.GetString(request, "fromDate") + " 00:00:00");
			request.setAttribute("toDate", JSPUtility.GetString(request, "fromDate") + " 23:59:59");

			final var	branches = cManip.getBranchesArrayBySubRegionId(request, executive.getAccountGroupId(), selectedCity);
			request.setAttribute("branches", branches);

			if(selectedCity == 0 && sourceBranchId == 0)
				sourceBranchIds = cManip.getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_GROUP, executive.getAccountGroupId());
			else if(sourceBranchId == 0)
				sourceBranchIds = cManip.getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_SUBREGION, selectedCity);
			else
				sourceBranchIds = Long.toString(sourceBranchId);

			if(destinationCityId == 0)
				branchesStr	= cManip.getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_GROUP, executive.getAccountGroupId());
			else
				branchesStr = cManip.getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_SUBREGION, destinationCityId);

			if(StringUtils.isEmpty(branchesStr)) {
				ActionStaticUtil.setRequestAttribute(request, ActionStaticUtil.NO_RECORDS_FOUND, true);
				ActionStaticUtil.setNextPageToken(request, ActionStaticUtil.SUCCESS);
				return;
			}

			final var	valInObj = new ValueObject();
			valInObj.put("citiesColl", cManip.getAllSubRegions(request));
			valInObj.put("branchesColl", cManip.getGenericBranchesDetail(request));
			valInObj.put("fromDate", fromDate);
			valInObj.put("toDate", toDate);
			valInObj.put("sourceBranchIds", sourceBranchIds);
			valInObj.put("branchesStr", branchesStr);
			valInObj.put("accountGroupId", accountGroupId);
			valInObj.put("executive", executive);

			final var	outboundmanifestReportBLL = new OutboundmanifestReportBLL();
			final var	valOutObj = outboundmanifestReportBLL.getDataForOutboundManifest(valInObj);

			if(valOutObj == null){
				ActionStaticUtil.setRequestAttribute(request, ActionStaticUtil.NO_RECORDS_FOUND, true);
				ActionStaticUtil.setNextPageToken(request, ActionStaticUtil.SUCCESS);
				return;
			}

			if(valOutObj.get("reportModel") != null) {
				final var	reportModel	= (OutboundmanifestReportModel[]) valOutObj.get("reportModel");
				request.setAttribute("lsBranchId", reportModel[0].getLsBranchId());
			}

			request.setAttribute("flagForIsCrossingAgent", valOutObj.get("flagForIsCrossingAgent"));
			request.setAttribute("report", valOutObj.get("reportModel"));
			request.setAttribute("isLaserPrintOnly", true);

			ActionStaticUtil.setReportViewModel(request);
			ActionStaticUtil.setNextPageToken(request, ActionStaticUtil.SUCCESS);
		} catch (final Exception _e) {
			ActionStaticUtil.catchActionException(request, _e, error);
		}
	}
}