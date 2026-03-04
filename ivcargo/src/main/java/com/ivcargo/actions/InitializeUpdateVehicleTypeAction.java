package com.ivcargo.actions;

//~--- non-JDK imports --------------------------------------------------------

import java.util.HashMap;
import java.util.LinkedHashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.City;
import com.platform.dto.CityForGroup;

public class InitializeUpdateVehicleTypeAction implements Action {

	public static final String TRACE_ID = "InitializeUpdateVehicleTypeAction";

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	error 			= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	cacheManip	= new CacheManip(request);

			final var	executive	= cacheManip.getExecutive(request);
			final var	cityForGroup= cacheManip.getAllCitiesForGroup(request, executive.getAccountGroupId());
			final var	city		= cacheManip.getCityData(request);
			final HashMap<Long,String>	cityList	= new LinkedHashMap<>();

			for (final CityForGroup element : cityForGroup)
				cityList.put(element.getCityId(), ((City) city.get(Long.toString(element.getCityId()))).getName());

			request.setAttribute("cityList", cityList);
			request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}
}
