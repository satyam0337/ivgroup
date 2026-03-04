package com.ivcargo.reports;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.dto.constant.ExecutiveTypeConstant;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionInstanceUtil;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.Executive;
import com.platform.dto.configuration.report.common.CommonReportsConfigurationDTO;

public class InitializeUndeliveredToPayWayBillReportAction implements Action{

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	error 			= null;
		ActionInstanceUtil 		actionUtil2 	= null;
		Executive   			executive	 	= null;
		CacheManip 				cache 			= null;
		ValueObject				confValObj		= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error))
				return;
			cache 			= new CacheManip(request);
			executive 		= cache.getExecutive(request);

			confValObj 		= cache.getCommonReportsConfiguration(request, executive.getAccountGroupId());

			request.setAttribute(ActionStaticUtil.IS_ALL_BRANCHES_NEED_TO_SHOW,true);
			request.setAttribute(ActionStaticUtil.IS_ALL_CITY_NEED_TO_SHOW, false);
			request.setAttribute("confValObj", confValObj);

			if(confValObj.getBoolean(CommonReportsConfigurationDTO.CHANGE_LABEL_SOURCE_SUB_REGION_TO_FROM_CITY,false))
				request.setAttribute("fromSubregionLabel", "From City");

			request.setAttribute("cityBranchLabel", "From Branch");

			ActionStepsUtil.setExecutiveCoreReportPermissionsInRequest(request, executive);

			actionUtil2 = new ActionInstanceUtil();
			actionUtil2.setExecutiveTypeBooleanInRequest(request, executive, true);

			if(executive.getExecutiveType()==ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN)
				request.setAttribute("subRegionForGroup", cache.getSubRegionsByGroupId(request, executive.getAccountGroupId()));

			ActionStaticUtil.setNextPageToken(request, ActionStaticUtil.SUCCESS);
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		} finally{
			error 			= null;
			actionUtil2 	= null;
			executive	 	= null;
			cache 			= null;
		}
	}
}