package com.ivcargo.actions;

//~--- non-JDK imports --------------------------------------------------------

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.StringJoiner;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.reports.ReportView;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.CrossingAgentMasterDao;
import com.platform.dao.OutboundCargoDao;
import com.platform.dao.master.CrossingBranchMasterDao;
import com.platform.dto.Branch;
import com.platform.dto.City;
import com.platform.dto.ConfigParam;
import com.platform.dto.CrossingAgentMaster;
import com.platform.dto.Executive;
import com.platform.dto.SubRegion;
import com.platform.dto.VehicleNumberMaster;
import com.platform.dto.VehicleType;
import com.platform.dto.configuration.modules.LsConfigurationDTO;
import com.platform.dto.constant.CargoAccountGroupConstant;
import com.platform.dto.master.CrossingBranchMap;
import com.platform.dto.model.ReportViewModel;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

public class InitializeListWayBillAction implements Action {
	public static final String TRACE_ID = "InitializeListWayBillAction";

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {

		HashMap<String, Object>				error 									= null;
		//		copy code
		StringBuilder						dispatchBranchListStr					= null;
		StringJoiner						dispatchBranchIdsStr					= null;
		List<Long>							subRegionIdsArr							= null;
		ArrayList<Long>						dispatchBranchIdsArr					= null;
		Executive   						executive 								= null;
		CacheManip 							cache 									= null;
		HashMap<String, String> 			crossingCityBranchList					= null;
		Map<Long, Branch> 					crossingBranchHM						= null;
		String[]							otherBranchesForDispatch				= null;
		Branch								br										= null;
		SubRegion[]							subRegionsForDispatch					= null;
		VehicleType[]						vtForGroup								= null;
		CrossingAgentMaster[]				crossingAgents							= null;
		Branch								crossingBranch							= null;
		ArrayList<Long>						assignedLocationIdList 	 				= null;
		String								allAssignedLocationIds					= null;
		int									maxNoOfDaysAllowBeforeCashStmtEntry		= 0;
		Map<Long, CrossingBranchMap> 		newCrossingBranchHM 					= null;
		CrossingBranchMap					crossingBranchMap						= null;
		String								crossingSubregionBranchAllowForCargo	= null;
		String								isNewCrossingBranchAllow				= null;
		ValueObject							dispatchPropertyValObj					= null;
		String								driverMobileNumber						= null;
		String								driverMobileNumberValidation			= null;
		String								cleanerName								= null;
		String								cleanerNameValidation					= null;
		boolean								vehicleNumberValidate					= false;
		ReportViewModel						reportViewModel 						= null;
		Branch								brancheColl								= null;
		boolean								hideDeactivatedSubregion				= false;
		ArrayList<Long> 					transportList							= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			cache   	= new CacheManip(request);
			executive 	= cache.getExecutive(request);
			brancheColl	= new Branch();

			final ValueObject   branches    	= cache.getGenericBranchesDetail(request);
			final ValueObject   city         	= cache.getCityData(request);
			final ValueObject	subRegions		= cache.getAllSubRegions(request);

			transportList					= cache.getTransportList(request);
			dispatchPropertyValObj			= cache.getLsConfiguration(request, executive.getAccountGroupId());

			request.setAttribute("srcBranch", branches.get(executive.getBranchId() + ""));

			crossingSubregionBranchAllowForCargo	= dispatchPropertyValObj.getString(LsConfigurationDTO.CROSSING_SUBREGION_BRANCH_ALLOW_FOR_CARGO, "false");

			if("true".equals(crossingSubregionBranchAllowForCargo)) {

				crossingCityBranchList 	= new LinkedHashMap<>();
				crossingBranchHM 		= cache.getCrossingBranches(request, executive.getAccountGroupId());

				//Added by Anant Chaudhary	21-12-2015

				isNewCrossingBranchAllow		= dispatchPropertyValObj.getString(LsConfigurationDTO.NEW_BRANCH_CROSSING_MAP_ALLOW, "false");

				if("true".equals(isNewCrossingBranchAllow))
					newCrossingBranchHM 	= CrossingBranchMasterDao.getInstance().getCrossingBranches(executive.getBranchId(), executive.getAccountGroupId());

				if(newCrossingBranchHM != null && newCrossingBranchHM.size() > 0)
					for(final Map.Entry<Long, CrossingBranchMap> entry : newCrossingBranchHM.entrySet()) {
						crossingBranchMap	= entry.getValue();

						crossingBranch		= (Branch) branches.get(crossingBranchMap.getCrossingBranchId() + "");
						final SubRegion	subRegion	= (SubRegion) subRegions.get(crossingBranch.getSubRegionId());

						crossingCityBranchList.put(crossingBranch.getBranchId() + "_" + crossingBranch.getSubRegionId(), crossingBranch.getName() + "_" + subRegion.getName());
					}
				else
					for(final Map.Entry<Long, Branch> entry : crossingBranchHM.entrySet()) {
						crossingBranch 	= entry.getValue();
						final SubRegion	subRegion	= (SubRegion) subRegions.get(crossingBranch.getSubRegionId());
						crossingCityBranchList.put(crossingBranch.getBranchId() + "_" + crossingBranch.getSubRegionId(), crossingBranch.getName() + "_" + subRegion.getName());
					}

				request.setAttribute("CrossingCityBranchList", crossingCityBranchList);
			}

			driverMobileNumber				= dispatchPropertyValObj.getString(LsConfigurationDTO.DRIVER_MOBILE_NUMBER, "false");
			driverMobileNumberValidation	= dispatchPropertyValObj.getString(LsConfigurationDTO.DRIVER_MOBILE_NUMBER_VALIDATION, "false");
			cleanerName						= dispatchPropertyValObj.getString(LsConfigurationDTO.CLEANER_NAME, "false");
			cleanerNameValidation			= dispatchPropertyValObj.getString(LsConfigurationDTO.CLEANER_NAME_VALIDATION, "false");
			vehicleNumberValidate			= dispatchPropertyValObj.getBoolean(LsConfigurationDTO.VEHICLE_NUMBER_VALIDATE,false);
			hideDeactivatedSubregion		= dispatchPropertyValObj.getBoolean(LsConfigurationDTO.HIDE_DEACTIVATED_SUBREGION,false);

			request.setAttribute("driverMobileNumber", driverMobileNumber);
			request.setAttribute("driverMobileNumberValidation", driverMobileNumberValidation);
			request.setAttribute("cleanerName", cleanerName);
			request.setAttribute("cleanerNameValidation", cleanerNameValidation);
			request.setAttribute("vehicleNumberValidate", vehicleNumberValidate);

			//Routing Allowed For Group Coding Started
			String routingAllowed = "";
			final short rateConfigValue = cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_ROUTING_ALLOWED);

			if(rateConfigValue == ConfigParam.CONFIG_KEY_ROUTING_ALLOWED_YES){
				routingAllowed = "YES";

				request.setAttribute("ALLCityList", cache.getAllGroupActiveBranchCityIdList(request, executive));

			} else if(rateConfigValue == ConfigParam.CONFIG_KEY_ROUTING_ALLOWED_NO)
				routingAllowed = "NO";

			request.setAttribute("routingAllowed", routingAllowed);
			//Routing Allowed For Group Coding End

			short 			dispatchConfigValue 			= cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_DISPATCH_ACCESSIBILITY);
			String 			branchIds						= cache.getBranchesString(request, executive.getAccountGroupId(), executive.getBranchId());
			Branch[] 		branchs;

			if(branchIds == null || branchIds.length() <= 0)
				branchIds = ""+executive.getBranchId();

			branchs = OutboundCargoDao.getInstance().getOutBoundCargoBranchesWithBranchWiseDispatchConfig(branchIds ,executive.getAccountGroupId());

			//************************************Vehicle Type Ajax ********************************************************

			if(executive.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNT_GROUP_ID_ROYAL_STAR)
				vtForGroup	= cache.getVehicleTypeForGroup(request, executive.getAccountGroupId());

			request.setAttribute("vehicleTypeForGroup",vtForGroup);
			/*********************Make Shared Branches Collection (Start)*******************/
			request.setAttribute("sharedBranches", cache.getSharedBranchesList(request, executive.getAccountGroupId()));
			/*********************Make Shared Branches Collection (End)*******************/

			final VehicleNumberMaster[] vehicleNumberMaster = cache.getVehicleNumber(request, executive.getAccountGroupId());

			if (vehicleNumberMaster != null) {
				request.setAttribute("vehicleNumberMaster", vehicleNumberMaster);

				final long dispatchLedgerId = JSPUtility.GetLong(request, "dispatchLedgerId", 0);

				if (dispatchLedgerId != 0)
					request.setAttribute("dispatchLedgerId", dispatchLedgerId);

			} else {
				error.put("errorCode", CargoErrorList.NO_RECORDS);
				error.put("errorDescription", CargoErrorList.NO_RECORDS_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}

			//copy code
			dispatchConfigValue 			= cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_DISPATCH_ACCESSIBILITY);
			branchIds						= cache.getBranchesString(request, executive.getAccountGroupId(), executive.getBranchId());

			if(branchIds == null || branchIds.length() <= 0)
				branchIds = ""+executive.getBranchId();

			dispatchBranchListStr 			= new StringBuilder();
			dispatchBranchIdsStr 			= new StringJoiner(",");

			if(executive.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNT_GROUP_ID_ROYAL_STAR) {

				branchs 				=  new Branch[0];
				subRegionIdsArr			=  new ArrayList<>();

				assignedLocationIdList	= cache.getAssignedLocationsIdListByLocationIdId(request, executive.getBranchId(), executive.getAccountGroupId());
				assignedLocationIdList.add(executive.getBranchId());
				allAssignedLocationIds	= Utility.getStringFromArrayList(assignedLocationIdList);
				dispatchBranchIdsArr	= OutboundCargoDao.getInstance().getDestinationBranchIdsForDispatch(executive.getAccountGroupId(),executive.getBranchId(),executive.getCityId(), dispatchConfigValue,allAssignedLocationIds);

				if(branchIds != null && !"".equals(branchIds))
					otherBranchesForDispatch = branchIds.split(",");

				if(otherBranchesForDispatch!= null && dispatchBranchIdsArr != null)
					for (final String element : otherBranchesForDispatch) {
						br = (Branch) branches.get(Long.parseLong(element) + "");

						if(br != null && br.getStatus() == Branch.BRANCH_ACTIVE)
							dispatchBranchIdsArr.addAll(OutboundCargoDao.getInstance().getDestinationBranchIdsForDispatch(br.getAccountGroupId(), br.getBranchId(), br.getCityId(), dispatchConfigValue,""+br.getBranchId()));
					}

				if(dispatchBranchIdsArr != null){
					for (final Long element : dispatchBranchIdsArr) {
						br = (Branch) branches.get(element + "");

						if(br.getStatus() == Branch.BRANCH_ACTIVE) {
							if(!subRegionIdsArr.contains(br.getSubRegionId()))
								subRegionIdsArr.add(br.getSubRegionId());

							final String branchDetails = br.getSubRegionId() + "_" + br.getCityId() + "_" + br.getBranchId() + "=" + br.getName() + ";";

							if(!dispatchBranchListStr.toString().contains(branchDetails))
								dispatchBranchListStr.append( branchDetails );

							dispatchBranchIdsStr.add(br.getBranchId() + "");
						}
					}

					// Create Sub Region List
					if(subRegionIdsArr != null){
						subRegionsForDispatch = new SubRegion [subRegionIdsArr.size()];

						for (int i = 0; i < subRegionIdsArr.size(); i++)
							subRegionsForDispatch[i] = (SubRegion) subRegions.get(subRegionIdsArr.get(i));
					}

					// Create Agent List
					if(dispatchBranchIdsStr.length() > 0)
						crossingAgents = CrossingAgentMasterDao.getInstance().getCrossingAgentByBranchIds(dispatchBranchIdsStr.toString());
				}

				branchs = OutboundCargoDao.getInstance().getOutBoundCargoBranchesWithBranchWiseDispatchConfig(allAssignedLocationIds ,executive.getAccountGroupId());

				request.setAttribute("dispatchBranchListStr", dispatchBranchListStr.toString());
				request.setAttribute("dispatchBranchIdsStr", dispatchBranchIdsStr.toString());
				request.setAttribute("subRegionList", subRegionsForDispatch);
				request.setAttribute("crossingAgents", crossingAgents);
				request.setAttribute("subRegionForGroup", cache.getSubRegionsByGroupId(request, executive.getAccountGroupId()));
			}

			final HashMap<Long, String> cityList = new LinkedHashMap<>();

			final ArrayList<Long>	cityIdAL	= new ArrayList<>();

			if(hideDeactivatedSubregion)
				for (final Branch branch : branchs) {
					brancheColl = 	(Branch) branches.get(branch.getBranchId()+"");

					if(brancheColl != null && !brancheColl.isMarkForDelete() && brancheColl.getStatus() == Branch.BRANCH_ACTIVE )
						cityIdAL.add( ((Branch)branches.get("" + branch.getBranchId())).getCityId() );
				}
			else
				for (final Branch branch : branchs)
					cityIdAL.add( ((Branch)branches.get("" + branch.getBranchId())).getCityId() );

			for (final Long cityId : cityIdAL)
				cityList.put(cityId, ((City) city.get("" + cityId)).getName());

			request.setAttribute("cityList", cityList);

			String previousDate;
			maxNoOfDaysAllowBeforeCashStmtEntry = cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_MAX_DAYS_OF_OPERATION_BEFORE_CASHSTATEMENT_ENTRY_ID);
			previousDate = getPreviousDate(executive, request, maxNoOfDaysAllowBeforeCashStmtEntry, transportList);

			final String currentDate  = getCurrentDate();
			request.setAttribute("currentDate", currentDate);
			request.setAttribute("previousDate", previousDate);

			reportViewModel = new ReportViewModel();

			reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);

			request.setAttribute("reportViewModel", reportViewModel);

			if(executive.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNT_GROUP_ID_ROYAL_STAR
					|| executive.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNT_GORUP_ID_KALPANA_CARGO)
				request.setAttribute("nextPageToken", "success_"+executive.getAccountGroupId());
			else
				request.setAttribute("nextPageToken", "success");

		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		} finally {
			error 							= null;
			dispatchBranchListStr			= null;
			dispatchBranchIdsStr			= null;
			subRegionIdsArr					= null;
			dispatchBranchIdsArr			= null;
			otherBranchesForDispatch		= null;
			br								= null;
			executive 						= null;
			cache 							= null;
			crossingCityBranchList			= null;
			crossingBranchHM				= null;
			subRegionsForDispatch			= null;
			vtForGroup						= null;
			crossingAgents					= null;
			assignedLocationIdList 	 		= null;
			allAssignedLocationIds			= null;
			newCrossingBranchHM 			= null;
			crossingBranchMap				= null;
			isNewCrossingBranchAllow		= null;
			dispatchPropertyValObj			= null;
			crossingBranch					= null;
			driverMobileNumber				= null;
			driverMobileNumberValidation	= null;
			cleanerName						= null;
			cleanerNameValidation			= null;
		}
	}

	private String getPreviousDate(Executive executive,
			HttpServletRequest request, int maxNoOfDaysAllowBeforeCashStmtEntry, ArrayList<Long> transportList) {
		String previousDate = null;
		final long MILLIS_IN_DAY  = (long) 1000 * 60 * 60 * 24;

		Date date = new Date();
		final SimpleDateFormat dateFormat = new SimpleDateFormat("dd-MM-yyyy");

		//ToTal Number Of Days Allowed

		if(maxNoOfDaysAllowBeforeCashStmtEntry > 0){
			date = new Date(date.getTime() - MILLIS_IN_DAY * maxNoOfDaysAllowBeforeCashStmtEntry);
			previousDate = dateFormat.format(date.getTime());
		} else if(maxNoOfDaysAllowBeforeCashStmtEntry != 0 || transportList.contains(executive.getAccountGroupId()))
			previousDate = dateFormat.format(date.getTime());
		else
			previousDate = getPrevDate();

		request.setAttribute("noOfDays",""+maxNoOfDaysAllowBeforeCashStmtEntry);

		//Below NumberOfDaysAllowed -1 ;Because Total Number Of Days Include Todays Date;Hence minus  ToDay DAte
		return previousDate;
	}

	public String getPrevDate() {//*
		final int MILLIS_IN_DAY = 1000 * 60 * 60 * 24;

		final Date date = new Date();
		final SimpleDateFormat dateFormat = new SimpleDateFormat("dd-MM-yyyy");
		return dateFormat.format(date.getTime() - MILLIS_IN_DAY);
	}

	public String getCurrentDate() {
		final Date date = new Date();
		final SimpleDateFormat dateFormat = new SimpleDateFormat("dd-MM-yyyy");
		return dateFormat.format(date.getTime());
	}
}
