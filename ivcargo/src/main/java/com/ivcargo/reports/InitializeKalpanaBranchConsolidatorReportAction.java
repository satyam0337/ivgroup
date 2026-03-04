package com.ivcargo.reports;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionInstanceUtil;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.Executive;
import com.platform.dto.configuration.report.common.CommonReportsConfigurationDTO;

public class InitializeKalpanaBranchConsolidatorReportAction implements Action{

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	error 		= null;
		Executive 				executive 	= null;
		ActionInstanceUtil 		actionUtil2 = null;
		CacheManip				cacheManip	= null;
		ValueObject							confValObj					= null;
		boolean								allowTimeLocking											= false;
		String								startHour													= "";
		String								endHour														= "";
		boolean isTargetAfterStartAndBeforeEnd = false;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			cacheManip		= new CacheManip(request);
			executive 		= cacheManip.getExecutive(request);
			
			confValObj 						= cacheManip.getCommonReportsConfiguration(request, executive.getAccountGroupId());
			allowTimeLocking				= confValObj.getBoolean(CommonReportsConfigurationDTO.ALLOW_TIME_LOCKING,false);
			startHour						= confValObj.getString(CommonReportsConfigurationDTO.START_HOUR,"0");
			endHour							= confValObj.getString(CommonReportsConfigurationDTO.END_HOUR,"0");
			
			if(allowTimeLocking)
				isTargetAfterStartAndBeforeEnd = DateTimeUtility.checkCurrentTimeBetweenTime(startHour,endHour);
			
			request.setAttribute(ActionStaticUtil.IS_ALL_BRANCHES_NEED_TO_SHOW,false);
			request.setAttribute(ActionStaticUtil.IS_ALL_AREA_NEED_TO_SHOW, false);
			request.setAttribute("isTargetAfterStartAndBeforeEnd", isTargetAfterStartAndBeforeEnd);

			executive = cacheManip.getExecutive(request);
			ActionStepsUtil.setExecutiveCoreReportPermissionsInRequest(request, executive);

			actionUtil2 = new ActionInstanceUtil();
			actionUtil2.setExecutiveTypeBooleanInRequest(request, executive, true);

			if(executive.getExecutiveType()==Executive.EXECUTIVE_TYPE_GROUPADMIN)
				request.setAttribute("subRegionForGroup", cacheManip.getSubRegionsByGroupId(request, executive.getAccountGroupId()));

			request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		} finally{
			error 		= null;
			executive 	= null;
			actionUtil2 = null;
		}
	}
}
