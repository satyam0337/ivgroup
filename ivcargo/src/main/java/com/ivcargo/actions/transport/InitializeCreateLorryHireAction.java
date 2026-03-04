package com.ivcargo.actions.transport;

import java.util.Arrays;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.exception.ExceptionProcess;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.VehicleAgentMasterDao;
import com.platform.dto.Executive;
import com.platform.dto.SubRegion;
import com.platform.dto.VehicleAgentMaster;
import com.platform.dto.VehicleType;
import com.platform.dto.constant.TransCargoAccountGroupConstant;

public class InitializeCreateLorryHireAction implements Action {

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	error 			= null;
		Executive 				executive		= null;
		VehicleType[]			vtForGroup 		= null;
		CacheManip				cache			= null;
		VehicleAgentMaster[]	vaForGroup		= null;
		List<Integer> 	customViewPageGroupList	= null;

		try {

			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			customViewPageGroupList = Arrays.asList(TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_NEW_ERA_TRANPORTS_CO
					,TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_TARASVIN_TRANSPORT
					,TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_VEGA_TRANSPORT);

			cache		= new CacheManip(request);
			executive	= cache.getExecutive(request);
			vtForGroup	= cache.getVehicleTypeForGroup(request, executive.getAccountGroupId());

			// Check If VehicleTypeForGroup is Missing
			if (vtForGroup  == null || vtForGroup.length <= 0)
				response.sendRedirect("SearchWayBill.do?pageId=0&eventId=1&filter=8");

			request.setAttribute("CityList", getAllSubRegionList(request ,executive));
			request.setAttribute("vehicleTypeForGroup", vtForGroup);
			request.setAttribute("subRegionForGroup", cache.getSubRegionsByGroupId(request, executive.getAccountGroupId()));

			if(customViewPageGroupList.contains((int) executive.getAccountGroupId())){
				vaForGroup	= VehicleAgentMasterDao.getInstance().getVehicleAgentDetails(executive.getAccountGroupId());
				request.setAttribute("agentsForgroup",vaForGroup);
				request.setAttribute("nextPageToken", "success_"+executive.getAccountGroupId());
			} else
				request.setAttribute("nextPageToken", "success");

		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		} finally {
			executive	= null;
			vtForGroup 	= null;
			cache		= null;
			customViewPageGroupList = null;
		}
	}

	private HashMap<Long, String> getAllSubRegionList(HttpServletRequest request ,Executive executive) throws Exception {
		CacheManip				cacheManip			= null;
		SubRegion[] 			subRegionForGroup 	= null;
		ValueObject 			subRegion 			= null;
		HashMap<Long, String> 	subRegionList 		= null;

		try {
			cacheManip			= new CacheManip(request);
			subRegionForGroup 	= cacheManip.getSubRegionsByGroupId(request, executive.getAccountGroupId());
			subRegion 			= cacheManip.getAllSubRegions(request);
			subRegionList 		= new LinkedHashMap<>();

			for (final SubRegion element : subRegionForGroup)
				subRegionList.put(element.getSubRegionId(), ((SubRegion) subRegion.get(element.getSubRegionId())).getName());

			return subRegionList;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, InitializeCreateLorryHireAction.class.getName());
		} finally {
			subRegionForGroup 	= null;
			subRegion 			= null;
			subRegionList 		= null;
		}
	}
}