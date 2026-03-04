package com.ivcargo.actions;

import java.util.HashMap;
import java.util.LinkedHashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.Executive;
import com.platform.dto.SubRegion;

public class InitializeChargeConfigAction implements Action  {

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	 error 	= null;
		CacheManip				cacheManip	= null;

		try {

			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			cacheManip				= new CacheManip(request);
			final Executive   executive = cacheManip.getExecutive(request);
			final SubRegion[] subRegionForGroup = cacheManip.getSubRegionsByGroupId(request, executive.getAccountGroupId());
			final HashMap<Long, String> subRegionList = new LinkedHashMap<Long, String>();

			for (final SubRegion element : subRegionForGroup)
				subRegionList.put(element.getSubRegionId(), element.getName());

			request.setAttribute("subRegionList", subRegionList);

			request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}
	}

}