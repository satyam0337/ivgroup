package com.ivcargo.actions;

//~--- non-JDK imports --------------------------------------------------------

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.properties.impl.PropertyConfigValueBLLImpl;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.OutboundCargoDao;
import com.platform.dao.master.CrossingBranchMasterDao;
import com.platform.dto.Branch;
import com.platform.dto.City;
import com.platform.dto.ConfigParam;
import com.platform.dto.ECargoConstantFile;
import com.platform.dto.PropertiesFileConstants;
import com.platform.dto.SubRegion;
import com.platform.dto.configuration.modules.LsConfigurationDTO;
import com.platform.dto.master.CrossingBranchMap;
import com.platform.resource.CargoErrorList;
import com.platform.utils.PropertiesUtility;
import com.platform.utils.TokenGenerator;

public class InitializeListWayBillActionForCrossing implements Action {
	public static final String TRACE_ID = "InitializeListWayBillActionForCrossing";

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {

		HashMap<String,Object>	 			error 							= null;
		HashMap<Long, CrossingBranchMap> 	newCrossingBranchHM 			= null;
		CrossingBranchMap					crossingBranchMap				= null;
		String								isNewCrossingBranchAllow		= null;
		ValueObject							dispatchPropertyValObj			= null;
		Branch								crossingBranch					= null;
		HashMap<String, String> 			crossingCityBranchList 			= null;
		var								vehicleNumberValidate			= false;
		var					tokenWiseCheckingForDuplicateTransaction	= false;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request, error))
				return;

			final var 		cache   			= new CacheManip(request);
			final var   	executive 			= cache.getExecutive(request);

			dispatchPropertyValObj			= PropertyConfigValueBLLImpl.getInstance().getConfiguration(executive, PropertiesFileConstants.LS_LOAD_CONFIG);

			vehicleNumberValidate			= PropertiesUtility.isAllow(dispatchPropertyValObj.get(LsConfigurationDTO.VEHICLE_NUMBER_VALIDATE) + "");
			tokenWiseCheckingForDuplicateTransaction	= dispatchPropertyValObj.getBoolean(LsConfigurationDTO.TOKEN_WISE_CHECKING_FOR_DUPLICATE_TRANSACTION, false);

			request.setAttribute("vehicleNumberValidate", vehicleNumberValidate);

			final var 		srcBranch = cache.getGenericBranchDetailCache(request,executive.getBranchId());
			request.setAttribute("srcBranch", srcBranch);

			//Routing Allowed For Group Coding Started
			var routingAllowed = "";
			final var rateConfigValue = cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_ROUTING_ALLOWED);

			if(rateConfigValue == ConfigParam.CONFIG_KEY_ROUTING_ALLOWED_YES){
				routingAllowed = "YES";

				crossingCityBranchList = new LinkedHashMap<>();

				//Added by Anant Chaudhary	21-12-2015

				isNewCrossingBranchAllow		= dispatchPropertyValObj.getString(LsConfigurationDTO.NEW_BRANCH_CROSSING_MAP_ALLOW, "false");

				if("true".equals(isNewCrossingBranchAllow))
					newCrossingBranchHM 	= CrossingBranchMasterDao.getInstance().getCrossingBranches(executive.getBranchId(), executive.getAccountGroupId());

				final var branches 		= cache.getGenericBranchesDetail(request);
				final var subRegions	= cache.getAllSubRegions(request);

				if(newCrossingBranchHM != null && newCrossingBranchHM.size() > 0)
					for(final Map.Entry<Long, CrossingBranchMap> entry : newCrossingBranchHM.entrySet()) {
						crossingBranchMap	= entry.getValue();
						crossingBranch		= (Branch) branches.get(crossingBranchMap.getCrossingBranchId() + "");

						if(crossingBranch.getStatus() == Branch.BRANCH_ACTIVE) {
							final var	subRegion	= (SubRegion) subRegions.get(crossingBranch.getSubRegionId());
							crossingCityBranchList.put(crossingBranch.getBranchId() + "_" + crossingBranch.getSubRegionId(), crossingBranch.getName() + "_" + subRegion.getName());
						}
					}
				else {
					final Map<Long, Branch> crossingBranchHM1 = cache.getCrossingBranches(request, executive.getAccountGroupId());

					for(final Map.Entry<Long, Branch> entry : crossingBranchHM1.entrySet()) {
						crossingBranch = entry.getValue();

						if(crossingBranch.getStatus() == Branch.BRANCH_ACTIVE && !crossingBranch.isMarkForDelete()) {
							final var	subRegion	= (SubRegion) subRegions.get(crossingBranch.getSubRegionId());
							crossingCityBranchList.put(crossingBranch.getBranchId() + "_" + crossingBranch.getSubRegionId(), crossingBranch.getName() + "_" + subRegion.getName());
						}
					}
				}

				request.setAttribute("CrossingCityBranchList", crossingCityBranchList);

			} else if(rateConfigValue == ConfigParam.CONFIG_KEY_ROUTING_ALLOWED_NO)
				routingAllowed = "NO";

			request.setAttribute("routingAllowed", routingAllowed);
			//Routing Allowed For Group Coding End

			final var 			dispatchConfigValue 			= cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_DISPATCH_ACCESSIBILITY);
			final var 			branchWiseDispatchConfigValue 	= cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_BRANCH_WISE_DISPATCH);
			final var 			branchIds						= cache.getBranchesString(request, executive.getAccountGroupId(), executive.getBranchId());
			Branch[] 		branchs		 					= {};

			if(dispatchConfigValue == ConfigParam.CONFIG_KEY_DISPATCH_ACCESSIBILITY_BRANCH
					&& branchWiseDispatchConfigValue == ConfigParam.CONFIG_KEY_BRANCH_WISE_DISPATCH_YES
					&& branchIds != null)
				branchs = OutboundCargoDao.getInstance().getOutBoundCargoBranchesWithBranchWiseDispatchConfig(branchIds, executive.getAccountGroupId());
			else
				branchs = OutboundCargoDao.getInstance().getOutBoundCargoBranchs(executive.getAccountGroupId(), executive.getBranchId(), executive.getCityId(), dispatchConfigValue);

			final var    branches     = cache.getGenericBranchesDetail(request);
			final var    city         = cache.getCityData(request);
			final HashMap<Long, String> cityList = new LinkedHashMap<>();

			final var	cityIdAL	= new ArrayList<Long>();

			for (final Branch branch : branchs)
				cityIdAL.add( ((Branch)branches.get("" + branch.getBranchId())).getCityId() );

			for (final Long cityId : cityIdAL)
				cityList.put(cityId, ((City) city.get("" + cityId)).getName());

			request.setAttribute("cityList", cityList);

			/*********************Make Shared Branches Collection (Start)*******************/
			request.setAttribute("sharedBranches", cache.getSharedBranchesList(request, executive.getAccountGroupId()));
			/*********************Make Shared Branches Collection (End)*******************/

			if(tokenWiseCheckingForDuplicateTransaction) {
				final var token 	= TokenGenerator.nextToken();
				request.getSession().setAttribute(TokenGenerator.TOKEN_VALUE, token);
				request.setAttribute(TokenGenerator.TOKEN_VALUE, token);
			}

			//End

			final var vehicleNumberMaster = cache.getVehicleNumber(request, executive.getAccountGroupId());

			if (vehicleNumberMaster != null) {
				request.setAttribute("vehicleNumberMaster", vehicleNumberMaster);

				final var dispatchLedgerId = JSPUtility.GetLong(request, "dispatchLedgerId", 0);

				if (dispatchLedgerId != 0)
					request.setAttribute("dispatchLedgerId", dispatchLedgerId);

				if(executive.getAccountGroupId() == ECargoConstantFile.ACCOUNTGORUPID_SRS_TRAVELS)
					request.setAttribute("nextPageToken", "success_" + executive.getAccountGroupId());
				else
					request.setAttribute("nextPageToken", "success");
			} else {
				error.put("errorCode", CargoErrorList.NO_RECORDS);
				error.put("errorDescription", CargoErrorList.NO_RECORDS_DESCRIPTION);
				request.setAttribute("cargoError", error);
				request.setAttribute("nextPageToken", "success");
			}
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}
	}
}
