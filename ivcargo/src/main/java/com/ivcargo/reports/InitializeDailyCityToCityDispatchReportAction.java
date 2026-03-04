package com.ivcargo.reports;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;

public class InitializeDailyCityToCityDispatchReportAction implements Action {

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	error = null;
		CacheManip				cacheManip	= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			cacheManip		= new CacheManip(request);

			request.setAttribute("wayBillTypeAll", cacheManip.getAllWayBillType(request));
			request.setAttribute("nextPageToken", "success");

		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}
	}
}

