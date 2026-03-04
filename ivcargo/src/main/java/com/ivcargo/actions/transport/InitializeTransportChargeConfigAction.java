package com.ivcargo.actions.transport;

import java.util.HashMap;
import java.util.LinkedHashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.Executive;
import com.platform.dto.SubRegion;

public class InitializeTransportChargeConfigAction implements Action {

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		CacheManip				cacheManip			= null;
		HashMap<String,Object>	error 				= null;
		Executive   			executive 			= null;
		SubRegion[] 			subRegionForGroup	= null;
		ValueObject    			subRegion        	= null;
		HashMap<Long, String> 	subRegionList 		= null;

		try {

			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			cacheManip	= new CacheManip(request);
			executive 	= cacheManip.getExecutive(request);
			subRegionForGroup= cacheManip.getSubRegionsByGroupId(request, executive.getAccountGroupId());
			subRegion        = cacheManip.getAllSubRegions(request);
			subRegionList 	= new LinkedHashMap<Long, String>();

			for (final SubRegion element : subRegionForGroup)
				subRegionList.put(element.getSubRegionId(), ((SubRegion) subRegion.get(element.getSubRegionId())).getName());

			request.setAttribute("subRegionList", subRegionList);

			request.setAttribute("nextPageToken", "success");

		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		} finally {
			executive 	= null;
			subRegionForGroup= null;
			subRegion        = null;
			subRegionList 	= null;
		}
	}

}
