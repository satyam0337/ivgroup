package com.ivcargo.reports;

import java.util.HashMap;
import java.util.LinkedHashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.ivcargo.actionUtility.ActionInstanceUtil;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.CityForGroup;
import com.platform.dto.Executive;

public class CitywiseVehicleNumberWiseDispatchInitializeAction implements Action{

	public void execute(HttpServletRequest request, HttpServletResponse response) {
		// TODO Auto-generated method stub
		HashMap<String,Object>	 	error 			= null;
		Executive					executive		= null;
		CityForGroup[]				cityForGroup	= null;
		HashMap<Long,String>		cityList		= null;
		CacheManip					cache			= null;
		ActionInstanceUtil 			actionUtil2 	= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error)){
				return;
			}
			executive	= ActionStaticUtil.getExecutive(request);
			cache		= new CacheManip(request);
			cityForGroup = cache.getAllCitiesForGroup(request, executive.getAccountGroupId());
			cityList	= new LinkedHashMap<Long, String>();

			ActionStepsUtil.setExecutiveCoreReportPermissionsInRequest(request, executive);

			actionUtil2 = new ActionInstanceUtil();
			actionUtil2.setExecutiveTypeBooleanInRequest(request, executive, true);	
			
			if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_GROUPADMIN){
				for (int i = 0; i < cityForGroup.length; i++) {
					cityList.put(cityForGroup[i].getCityId(), cityForGroup[i].getCityName());
				}
				request.setAttribute("cityList", cityList);
			}
			ActionStaticUtil.setNextPageToken(request, ActionStaticUtil.SUCCESS);
		} catch (Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		}
		finally{
			error 			= null;
			executive		= null;
			cityForGroup	= null;
			cityList		= null;
			cache			= null;
		}
	}
}