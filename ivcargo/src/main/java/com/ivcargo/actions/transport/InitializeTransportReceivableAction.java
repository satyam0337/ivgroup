package com.ivcargo.actions.transport;

import java.util.ArrayList;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.Executive;
import com.platform.dto.LocationsMapping;
import com.platform.dto.SubRegion;
import com.platform.dto.constant.ExecutiveTypeConstant;

public class InitializeTransportReceivableAction implements Action {

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {

		HashMap<String,Object>		error 					= null;
		Executive   				executive 				= null;
		CacheManip 					cache 					= null;
		SubRegion[]					grupSubRegionArr		= null;
		ArrayList<LocationsMapping> locationMappingList		= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request, error))
				return;

			cache 			= new CacheManip(request);
			executive 		= cache.getExecutive(request);

			ActionStaticUtil.executiveTypeWiseSelection3(request, cache, executive);

			if (executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_EXECUTIVE
					|| executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_BRANCHADMIN) {
				locationMappingList = cache.getAssignedLocationsByLocationIdId(request, executive.getBranchId(), executive.getAccountGroupId());
				request.setAttribute("locationMappingList", locationMappingList);
			}

			grupSubRegionArr = cache.getSubRegionsByGroupId(request, executive.getAccountGroupId());
			request.setAttribute("grupSubRegionArr", grupSubRegionArr);
			request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}
	}
}