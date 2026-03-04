package com.ivcargo.actions;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.Executive;

public class InitializeReceivableAction implements Action {
	public static final String TRACE_ID = "InitializeReceivableAction";
	
	public void execute(HttpServletRequest request, HttpServletResponse response) {

		// TODO Auto-generated method stub
		HashMap<String,Object>		error 					= null;

		try {

			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error)) {
				return;
			}

			Executive   executive 	= (Executive) request.getSession().getAttribute("executive");
			CacheManip cacheManip 	= new CacheManip(request);
			
			HashMap<Long, String> cityList = cacheManip.getAllGroupActiveBranchCityIdList(request, executive);
			request.setAttribute("cityList", cityList);

			request.setAttribute("nextPageToken", "success");

		} catch (Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		}
	}
}