package com.ivcargo.actions.transport;

//~--- non-JDK imports --------------------------------------------------------

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.StringJoiner;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.BranchWiseDispatchConfigDao;
import com.platform.dao.CrossingAgentMasterDao;
import com.platform.dao.LSSequenceCounterDao;
import com.platform.dao.OutboundCargoDao;
import com.platform.dao.VehicleAgentMasterDao;
import com.platform.dao.master.CrossingBranchMasterDao;
import com.platform.dto.Branch;
import com.platform.dto.BranchWiseDispatchConfig;
import com.platform.dto.ConfigParam;
import com.platform.dto.CrossingAgentMaster;
import com.platform.dto.Executive;
import com.platform.dto.LSSequenceCounter;
import com.platform.dto.SubRegion;
import com.platform.dto.configuration.modules.LsConfigurationDTO;
import com.platform.dto.master.CrossingBranchMap;
import com.platform.utils.TokenGenerator;
import com.platform.utils.Utility;

public class InitializeTransportDispatchWayBillAction implements Action {
	public static final String TRACE_ID = "InitializeTransportDispatchWayBillAction";

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {

		Executive		executive					= null;
		CacheManip		cache						= null;
		String			routingAllowed				= null;
		SubRegion[]		subRegionsForDispatch		= null;
		String[]		otherBranchesForDispatch	= null;

		CrossingAgentMaster[]				crossingAgents									= null;
		Map<Long, Branch>					crossingBranchHM								= null;
		HashMap<String,String>				crossingSubRegionBranchList						= null;
		HashMap<Long, Branch> 				exeRegionBranchesHM								= null;
		ArrayList<Long>						exeRegionBranchesAL								= null;
		HashMap<String,Object>	 			error 											= null;
		HashMap<Long, CrossingBranchMap> 	newCrossingBranchHM 							= null;
		String								crossingSubregionBranchAllowForTransCargo		= null;
		String								isNewCrossingBranchAllow						= null;
		ValueObject							dispatchPropertyValObj							= null;
		String								isLoadingHamaliRateAllow						= null;
		String								crossingAgentWiseDestinationPopulate			= null;
		String								isUnLoadingHamaliRateAllow						= null;
		String								isCrossingHireRateAllow							= null;
		String								applyRatesAfterAddToDispatch					= null;
		String								applyCrossingRateOnLRSearch						= null;
		String								showCredtDebitInfo								= null;
		String								isDoorDeliveryRateAllow							= null;
		String								isManualLsDateValidationCheck					= null;
		var								validateRemark									= false;
		ArrayList<Long> 					transportList	= null;
		var								tokenWiseCheckingForDuplicateTransaction		= false;

		try {

			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			cache					= new CacheManip(request);
			executive				= cache.getExecutive(request);
			transportList			= cache.getTransportList(request);

			if(transportList.contains(executive.getAccountGroupId()))
				//specify the sequenceCounter type for RANGE_INCREMENT(DB check) --- By Prakash
				request.setAttribute("LSSequenceCounter", LSSequenceCounterDao.getInstance().getLSSequenceCounterToDisplay(executive.getAccountGroupId(), executive.getBranchId(), LSSequenceCounter.LS_SEQUENCE_MANUAL));

			//Added by Anant Chaudhary	21-12-2015
			dispatchPropertyValObj					= cache.getLsConfiguration(request, executive.getAccountGroupId());

			isLoadingHamaliRateAllow				= dispatchPropertyValObj.getString(LsConfigurationDTO.IS_LOADING_HAMALI_RATE_ALLOW, "false");
			isUnLoadingHamaliRateAllow				= dispatchPropertyValObj.getString(LsConfigurationDTO.IS_UNLOADING_HAMALI_RATE_ALLOW, "false");
			isCrossingHireRateAllow					= dispatchPropertyValObj.getString(LsConfigurationDTO.IS_CROSSING_HIRE_RATE_ALLOW, "false");
			crossingAgentWiseDestinationPopulate	= dispatchPropertyValObj.getString(LsConfigurationDTO.CROSSING_AGENT_WISE_DESTINATION_POPULATE, "true");
			applyRatesAfterAddToDispatch			= dispatchPropertyValObj.getString(LsConfigurationDTO.APPLY_RATES_AFTER_ADD_TO_DISPATCH, "true");
			applyCrossingRateOnLRSearch				= dispatchPropertyValObj.getString(LsConfigurationDTO.APPLY_CROSSING_RATE_ON_LR_SEARCH, "false");
			showCredtDebitInfo						= dispatchPropertyValObj.getString(LsConfigurationDTO.SHOW_CREDIT_DEBIT_INFO, "false");
			isDoorDeliveryRateAllow					= dispatchPropertyValObj.getString(LsConfigurationDTO.IS_DOOR_DELIVERY_RATE_ALLOW, "false");
			isManualLsDateValidationCheck			= dispatchPropertyValObj.getString(LsConfigurationDTO.IS_MANUAL_LS_DATE_VALIDATION_CHECK, "true");
			validateRemark							= dispatchPropertyValObj.getBoolean(LsConfigurationDTO.VALIDATE_REMARK, false);
			tokenWiseCheckingForDuplicateTransaction= dispatchPropertyValObj.getBoolean(LsConfigurationDTO.TOKEN_WISE_CHECKING_FOR_DUPLICATE_TRANSACTION, false);

			request.setAttribute(LsConfigurationDTO.VALIDATE_REMARK, validateRemark);
			//Routing Allowed For Group Coding Started
			routingAllowed = "";
			final var rateConfigValue = cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_ROUTING_ALLOWED);

			if(rateConfigValue == ConfigParam.CONFIG_KEY_ROUTING_ALLOWED_YES){
				routingAllowed = "YES";

				crossingSubRegionBranchList	= new LinkedHashMap<>();
				crossingBranchHM			= cache.getCrossingBranches(request, executive.getAccountGroupId());

				crossingSubregionBranchAllowForTransCargo	= dispatchPropertyValObj.getString(LsConfigurationDTO.CROSSING_SUBREGION_BRANCH_ALLOW_FOR_TRANSCARGO, "false");
				isNewCrossingBranchAllow					= dispatchPropertyValObj.getString(LsConfigurationDTO.NEW_BRANCH_CROSSING_MAP_ALLOW, "false");

				if("true".equals(isNewCrossingBranchAllow))
					newCrossingBranchHM 	= CrossingBranchMasterDao.getInstance().getCrossingBranches(executive.getBranchId(), executive.getAccountGroupId());

				if("true".equals(crossingSubregionBranchAllowForTransCargo)) {
					if("true".equals(isNewCrossingBranchAllow)) {
						if(newCrossingBranchHM != null && newCrossingBranchHM.size() > 0)
							for(final Map.Entry<Long, CrossingBranchMap> entry : newCrossingBranchHM.entrySet()) {
								final var	crossingBranchMap	= entry.getValue();

								final var	crossingBranch		= cache.getGenericBranchDetailCache(request, crossingBranchMap.getCrossingBranchId());

								if(crossingBranch != null && crossingBranch.getStatus() == Branch.BRANCH_ACTIVE
										&& !crossingBranch.isMarkForDelete())
									crossingSubRegionBranchList.put(crossingBranch.getBranchId() + "_" + crossingBranch.getSubRegionId(), crossingBranch.getName() + "_" + cache.getGenericSubRegionById(request, crossingBranch.getSubRegionId()).getName());
							}
					} else
						for(final Map.Entry<Long, Branch> entry : crossingBranchHM.entrySet()) {
							final var	crossingBranch = entry.getValue();

							if(executive.getRegionId() != crossingBranch.getRegionId()
									&& crossingBranch.getStatus() == Branch.BRANCH_ACTIVE
									&& !crossingBranch.isMarkForDelete())
								crossingSubRegionBranchList.put(crossingBranch.getBranchId() + "_" + crossingBranch.getSubRegionId(), crossingBranch.getName() + "_" + cache.getGenericSubRegionById(request, crossingBranch.getSubRegionId()).getName());
						}

					exeRegionBranchesHM = cache.getBranchesByRegionId(request, executive.getAccountGroupId(), executive.getRegionId());

					if(exeRegionBranchesHM.size() > 0) {
						exeRegionBranchesAL	= (ArrayList<Long>) exeRegionBranchesHM.entrySet().stream().map(Entry::getKey).collect(Collectors.toList());

						if(!exeRegionBranchesAL.isEmpty()) {
							request.setAttribute("exeRegionBranchesAL", exeRegionBranchesAL);
							request.setAttribute("exeRegionBranchesHM", exeRegionBranchesHM);
						}
					}

				} else if("true".equals(isNewCrossingBranchAllow)) {
					if(newCrossingBranchHM != null && newCrossingBranchHM.size() > 0)
						for(final Map.Entry<Long, CrossingBranchMap> entry : newCrossingBranchHM.entrySet()) {
							final var	crossingBranchMap	= entry.getValue();

							final var	crossingBranch		= cache.getGenericBranchDetailCache(request, crossingBranchMap.getDestinationMapId());

							if(crossingBranch != null && crossingBranch.getStatus() == Branch.BRANCH_ACTIVE
									&& !crossingBranch.isMarkForDelete())
								crossingSubRegionBranchList.put(crossingBranch.getBranchId() + "_" + crossingBranch.getSubRegionId(), crossingBranch.getName() + "_" + cache.getGenericSubRegionById(request, crossingBranch.getSubRegionId()).getName());
						}
				} else
					for(final Map.Entry<Long, Branch> entry : crossingBranchHM.entrySet()) {
						final var	crossingBranch = entry.getValue();

						if(crossingBranch != null && crossingBranch.getStatus() == Branch.BRANCH_ACTIVE
								&& !crossingBranch.isMarkForDelete())
							crossingSubRegionBranchList.put(crossingBranch.getBranchId() + "_" + crossingBranch.getSubRegionId(), crossingBranch.getName() + "_" + cache.getGenericSubRegionById(request, crossingBranch.getSubRegionId()).getName());
					}

				request.setAttribute("CrossingSubRegionBranchList", crossingSubRegionBranchList);

			} else if(rateConfigValue == ConfigParam.CONFIG_KEY_ROUTING_ALLOWED_NO)
				routingAllowed = "NO";

			request.setAttribute("routingAllowed", routingAllowed);
			//Routing Allowed For Group Coding End

			request.setAttribute("isAllowAllOptionInDestinationList", "true".equals(dispatchPropertyValObj.getString(LsConfigurationDTO.AllowAllOptionInDestinationList, "false")));

			request.setAttribute("isRangeCheckInManualLS", dispatchPropertyValObj.getBoolean(LsConfigurationDTO.RangeCheckInManualLS, true));
			request.setAttribute("showManualLS", dispatchPropertyValObj.getBoolean(LsConfigurationDTO.ShowManualLS, false));

			final var	dispatchConfigValue 			= cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_DISPATCH_ACCESSIBILITY);
			final var	branchWiseDispatchConfigValue 	= cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_BRANCH_WISE_DISPATCH);
			final var	dispatchBranchListStr 			= new StringBuilder();
			final var	dispatchBranchIdsStr 			= new StringJoiner(",");

			final List<Long>	subRegionIdsArr			=  new ArrayList<>();

			final var	assignedLocationIdList	= cache.getAssignedLocationsIdListByLocationIdId(request, executive.getBranchId(), executive.getAccountGroupId());
			assignedLocationIdList.add(executive.getBranchId());

			final var	allAssignedLocationIds	= Utility.getStringFromArrayList(assignedLocationIdList);
			final var	dispatchBranchIdsArr	= OutboundCargoDao.getInstance().getDestinationBranchIdsForDispatch(executive.getAccountGroupId(),executive.getBranchId(),executive.getSubRegionId(), dispatchConfigValue, allAssignedLocationIds);

			if(dispatchConfigValue == ConfigParam.CONFIG_KEY_DISPATCH_ACCESSIBILITY_BRANCH
					&& branchWiseDispatchConfigValue == ConfigParam.CONFIG_KEY_BRANCH_WISE_DISPATCH_YES){
				final var	branchWiseDispatchConfig = BranchWiseDispatchConfigDao.getInstance().getBranchWiseDispatchConfig(executive.getAccountGroupId());

				if(branchWiseDispatchConfig  != null){
					for (final BranchWiseDispatchConfig element : branchWiseDispatchConfig)
						if(element.getBranchId() == executive.getBranchId()) {
							otherBranchesForDispatch = element.getBranchesAllowed().split(",");
							break;
						}

					if(otherBranchesForDispatch!= null && dispatchBranchIdsArr != null)
						for (final String element : otherBranchesForDispatch) {
							final var	br = cache.getGenericBranchDetailCache(request, Long.parseLong(element));

							if(br != null && br.getStatus() == Branch.BRANCH_ACTIVE)
								dispatchBranchIdsArr.addAll(OutboundCargoDao.getInstance().getDestinationBranchIdsForDispatch(br.getAccountGroupId(),br.getBranchId(),br.getSubRegionId(), dispatchConfigValue,""+br.getBranchId()));
						}
				}
			}

			if(dispatchBranchIdsArr != null){
				for (final Long element : dispatchBranchIdsArr) {
					final var	br = cache.getGenericBranchDetailCache(request, element);

					if(br.getStatus() == Branch.BRANCH_ACTIVE) {
						if(!subRegionIdsArr.contains(br.getSubRegionId()))
							subRegionIdsArr.add(br.getSubRegionId());

						final var branchDetails = br.getSubRegionId() + "_" + br.getSubRegionId() + "_" + br.getBranchId() + "=" + br.getName() + ";";

						if(!dispatchBranchListStr.toString().contains(branchDetails))
							dispatchBranchListStr.append( branchDetails );

						dispatchBranchIdsStr.add(br.getBranchId() + "");
					}
				}

				// Create Sub Region List
				if(subRegionIdsArr != null){
					subRegionsForDispatch = new SubRegion [subRegionIdsArr.size()];

					for (var i = 0; i < subRegionIdsArr.size(); i++)
						subRegionsForDispatch[i] = cache.getGenericSubRegionById(request, subRegionIdsArr.get(i));
				}

				// Create Agent List
				if(dispatchBranchIdsStr.length() > 0)
					crossingAgents = CrossingAgentMasterDao.getInstance().getCrossingAgentByBranchIds(dispatchBranchIdsStr.toString());
			}

			request.setAttribute("dispatchBranchListStr", dispatchBranchListStr.toString());
			request.setAttribute("dispatchBranchIdsStr", dispatchBranchIdsStr.toString());
			request.setAttribute("subRegionList", subRegionsForDispatch);
			request.setAttribute("crossingAgents", crossingAgents);

			/*********************Make Shared Branches Collection (Start)*******************/
			request.setAttribute("sharedBranches", cache.getSharedBranchesList(request, executive.getAccountGroupId()));
			/*********************Make Shared Branches Collection (End)*******************/

			final var	vtForGroup	= cache.getVehicleTypeForGroup(request, executive.getAccountGroupId());
			final var	vaForGroup	= VehicleAgentMasterDao.getInstance().getVehicleAgentDetails(executive.getAccountGroupId());
			final var	allGroupBranches = cache.getAllGroupBranches(request, executive.getAccountGroupId());

			request.setAttribute("ManualLSDaysAllowed", (int) cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_MAX_DAYS_OF_OPERATION_BEFORE_CASHSTATEMENT_ENTRY_ID));

			final var	srcBranch = cache.getGenericBranchDetailCache(request, executive.getBranchId());

			if(srcBranch.getBranchCode() != null)
				request.setAttribute("srcBranchCode",srcBranch.getBranchCode());

			if(tokenWiseCheckingForDuplicateTransaction) {
				final var token 	= TokenGenerator.nextToken();
				request.getSession().setAttribute(TokenGenerator.TOKEN_VALUE, token);
				request.setAttribute(TokenGenerator.TOKEN_VALUE, token);
			}

			ActionStaticUtil.setReportViewModel(request);

			request.setAttribute("vehicleTypeForGroup",vtForGroup);
			request.setAttribute("agentsForgroup",vaForGroup);
			request.setAttribute("allGroupBranches", allGroupBranches);
			request.setAttribute("isLoadingHamaliRateAllow", isLoadingHamaliRateAllow);
			request.setAttribute("CrossingAgentWiseDestinationPopulate", crossingAgentWiseDestinationPopulate);
			request.setAttribute("applyRatesAfterAddToDispatch", applyRatesAfterAddToDispatch);
			request.setAttribute("applyCrossingRateOnLRSearch", applyCrossingRateOnLRSearch);
			request.setAttribute("showCredtDebitInfo", showCredtDebitInfo);
			request.setAttribute("isDoorDeliveryRateAllow", isDoorDeliveryRateAllow);
			request.setAttribute("isManualLsDateValidationCheck", isManualLsDateValidationCheck);
			request.setAttribute("isUnLoadingHamaliRateAllow", isUnLoadingHamaliRateAllow);
			request.setAttribute("isCrossingHireRateAllow", isCrossingHireRateAllow);
			request.setAttribute("nextPageToken", "success_"+executive.getAccountGroupId());
		} catch (final Exception _e) {
			ActionStaticUtil.catchActionException(request, _e, error);
		}
	}
}