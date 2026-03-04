package com.ivcargo.actions;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.StringJoiner;
import java.util.function.Predicate;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.bll.utils.BookingWayBillSelectionUtility;
import com.iv.constant.properties.GroupConfigurationPropertiesConstant;
import com.iv.constant.properties.dispatch.InterBranchLSConfigurationConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.dto.constant.TransCargoAccountGroupConstant;
import com.iv.properties.constant.LoadingSheetPropertyConstant;
import com.iv.utils.constant.Constant;
import com.iv.utils.exception.ExceptionProcess;
import com.iv.utils.utility.CollectionUtility;
import com.iv.utils.utility.MapUtils;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.BranchWiseDispatchConfigDao;
import com.platform.dao.CrossingAgentMasterDao;
import com.platform.dao.LSSequenceCounterDao;
import com.platform.dao.OutboundCargoDao;
import com.platform.dao.VehicleAgentMasterDao;
import com.platform.dto.Branch;
import com.platform.dto.BranchWiseDispatchConfig;
import com.platform.dto.ConfigParam;
import com.platform.dto.CrossingAgentMaster;
import com.platform.dto.Executive;
import com.platform.dto.LSSequenceCounter;
import com.platform.dto.SubRegion;
import com.platform.dto.VehicleAgentMaster;
import com.platform.dto.VehicleType;
import com.platform.utils.Utility;

public class InitializeInterBranchLSAction implements Action {
	public static final String TRACE_ID = InitializeInterBranchLSAction.class.getName();

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {

		HashMap<String,Object>			error 							= null;
		SubRegion[]						subRegionsForDispatch			= null;
		VehicleType[]					vtForGroup						= null;
		String[]						otherBranchesForDispatch		= null;
		CrossingAgentMaster[]			crossingAgents					= null;
		VehicleAgentMaster[]			vaForGroup						= null;
		HashMap<Long,Branch>			allGroupBranches				= null;
		var							isRailwayBranch						= false;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	cache						= new CacheManip(request);
			final var 	executive	= cache.getExecutive(request);

			final var	regionBranchesHM 			= cache.getBranchesByRegionId(request, executive.getAccountGroupId(), executive.getRegionId());
			final var	interBranchLsConfiguration	= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.INTER_BRANCH_LS);
			final var	groupConfig					= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.BOOKING);
			final var	showManualLS				= (boolean) interBranchLsConfiguration.getOrDefault(InterBranchLSConfigurationConstant.SHOW_MANUAL_LS, false);
			final var	manualLSDaysAllowed			= (boolean) interBranchLsConfiguration.getOrDefault(InterBranchLSConfigurationConstant.MANUAL_LS_DAYS_ALLOWED, true);

			if((boolean) interBranchLsConfiguration.getOrDefault(LoadingSheetPropertyConstant.RAILWAY_BRANCH_WISE_DISPATCH, false))
				isRailwayBranch		= com.iv.utils.utility.Utility.isIdExistInLongList(interBranchLsConfiguration, LoadingSheetPropertyConstant.RAILWAY_BRANCH_IDS_FOR_DISPATCH, executive.getBranchId());

			if(showManualLS)
				request.setAttribute("LSSequenceCounter", LSSequenceCounterDao.getInstance().getLSSequenceCounterToDisplay(executive.getAccountGroupId(), executive.getBranchId(), LSSequenceCounter.LS_SEQUENCE_MANUAL));

			request.setAttribute(InterBranchLSConfigurationConstant.SHOW_MANUAL_LS, interBranchLsConfiguration.getOrDefault(InterBranchLSConfigurationConstant.SHOW_MANUAL_LS, false));
			request.setAttribute(InterBranchLSConfigurationConstant.RANGE_CHECK_IN_MANUAL_LS, interBranchLsConfiguration.getOrDefault(InterBranchLSConfigurationConstant.RANGE_CHECK_IN_MANUAL_LS, false));
			request.setAttribute(InterBranchLSConfigurationConstant.SHOW_MANUAL_LS_DATE, interBranchLsConfiguration.getOrDefault(InterBranchLSConfigurationConstant.SHOW_MANUAL_LS_DATE, false));
			request.setAttribute(InterBranchLSConfigurationConstant.IS_MANUAL_LS_DATE_VALIDATION_CHECK, interBranchLsConfiguration.getOrDefault(InterBranchLSConfigurationConstant.IS_MANUAL_LS_DATE_VALIDATION_CHECK, false));
			request.setAttribute(InterBranchLSConfigurationConstant.SRC_DEST_WISE_SEQ_COUNTER, interBranchLsConfiguration.getOrDefault(InterBranchLSConfigurationConstant.SRC_DEST_WISE_SEQ_COUNTER, false));
			request.setAttribute(InterBranchLSConfigurationConstant.IS_VALIDATE_DRIVER_NAME, (boolean) interBranchLsConfiguration.getOrDefault(InterBranchLSConfigurationConstant.IS_VALIDATE_DRIVER_NAME, true));
			request.setAttribute(InterBranchLSConfigurationConstant.IS_VALIDATE_DRIVER_NUMBER, (boolean) interBranchLsConfiguration.getOrDefault(InterBranchLSConfigurationConstant.IS_VALIDATE_DRIVER_NUMBER, true));
			request.setAttribute(InterBranchLSConfigurationConstant.REMOVE_CROSSING_FROM_INTERBRANCH, (boolean) interBranchLsConfiguration.getOrDefault(InterBranchLSConfigurationConstant.REMOVE_CROSSING_FROM_INTERBRANCH, false));
			request.setAttribute("isRailwayBranch", isRailwayBranch);
			request.setAttribute(LoadingSheetPropertyConstant.RAILWAY_BRANCH_IDS_FOR_DISPATCH, interBranchLsConfiguration.getOrDefault(LoadingSheetPropertyConstant.RAILWAY_BRANCH_IDS_FOR_DISPATCH, "0"));
			request.setAttribute(InterBranchLSConfigurationConstant.IS_SHOW_BILL_SELECTION, (boolean) interBranchLsConfiguration.getOrDefault(InterBranchLSConfigurationConstant.IS_SHOW_BILL_SELECTION, false));
			request.setAttribute(InterBranchLSConfigurationConstant.DISALLOW_INTER_BRANCH_LS_FOR_REGIONS_LR, (boolean) interBranchLsConfiguration.getOrDefault(InterBranchLSConfigurationConstant.DISALLOW_INTER_BRANCH_LS_FOR_REGIONS_LR, false));
			request.setAttribute(InterBranchLSConfigurationConstant.SOURCE_REGION_IDS_FOR_RESTRICT_INTER_BRANCH_LS, interBranchLsConfiguration.getOrDefault(InterBranchLSConfigurationConstant.SOURCE_REGION_IDS_FOR_RESTRICT_INTER_BRANCH_LS, "0"));
			request.setAttribute(GroupConfigurationPropertiesConstant.SHOW_DIVISION_SELECTION, (boolean) groupConfig.getOrDefault(GroupConfigurationPropertiesConstant.SHOW_DIVISION_SELECTION, false));

			final var	allPhysicalBranchesHM		= getPhysicalBranches(request, cache, interBranchLsConfiguration, executive);

			request.setAttribute("allPhysicalBranchesHM", allPhysicalBranchesHM);
			//Routing Allowed For Group Coding End

			final var	dispatchConfigValue 			= cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_DISPATCH_ACCESSIBILITY);
			final var	branchWiseDispatchConfigValue 	= cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_BRANCH_WISE_DISPATCH);
			final var	dispatchBranchListStr 			= new StringJoiner(";");
			final var	dispatchBranchIdsStr 			= new StringJoiner(",");
			final List<Long>	subRegionIdsArr					= new ArrayList<>();

			final var	assignedLocationIdList			= cache.getAssignedLocationsIdListByLocationIdId(request, executive.getBranchId(), executive.getAccountGroupId());
			assignedLocationIdList.add(executive.getBranchId());

			final var	allAssignedLocationIds			= Utility.getStringFromArrayList(assignedLocationIdList);
			final var	dispatchBranchIdsArr			= OutboundCargoDao.getInstance().getDestinationBranchIdsForDispatch(executive.getAccountGroupId(),executive.getBranchId(),executive.getSubRegionId(), dispatchConfigValue,allAssignedLocationIds);

			if(dispatchConfigValue == ConfigParam.CONFIG_KEY_DISPATCH_ACCESSIBILITY_BRANCH
					&& branchWiseDispatchConfigValue == ConfigParam.CONFIG_KEY_BRANCH_WISE_DISPATCH_YES) {
				final var	branchWiseDispatchConfig = BranchWiseDispatchConfigDao.getInstance().getBranchWiseDispatchConfig(executive.getAccountGroupId());

				if(branchWiseDispatchConfig  != null) {
					for (final BranchWiseDispatchConfig element : branchWiseDispatchConfig)
						if(element.getBranchId() == executive.getBranchId()) {
							otherBranchesForDispatch = element.getBranchesAllowed().split(",");
							break;
						}

					if(otherBranchesForDispatch!= null && dispatchBranchIdsArr != null)
						for (final String element : otherBranchesForDispatch) {
							final var	br = cache.getGenericBranchDetailCache(request, Long.parseLong(element));

							if(br != null && br.getStatus() == Branch.BRANCH_ACTIVE)
								dispatchBranchIdsArr.addAll(OutboundCargoDao.getInstance().getDestinationBranchIdsForDispatch(br.getAccountGroupId(), br.getBranchId(), br.getSubRegionId(), dispatchConfigValue,"" + br.getBranchId()));
						}
				}
			}

			if(dispatchBranchIdsArr != null){
				for (final Long element : dispatchBranchIdsArr) {
					final var	br = cache.getGenericBranchDetailCache(request,element);

					if(br.getStatus() == Branch.BRANCH_ACTIVE ) {
						if(!subRegionIdsArr.contains(br.getSubRegionId()))
							subRegionIdsArr.add(br.getSubRegionId());

						final var branchDetails = br.getSubRegionId() + "_" + br.getSubRegionId() + "_" + br.getBranchId() + "=" + br.getName();

						if(!dispatchBranchListStr.toString().contains(branchDetails))
							dispatchBranchListStr.add( branchDetails );

						dispatchBranchIdsStr.add(br.getBranchId() + "");
					}
				}

				// Create Sub Region List
				if(subRegionIdsArr != null) {
					subRegionsForDispatch = new SubRegion [subRegionIdsArr.size()];

					for (var i = 0; i < subRegionIdsArr.size(); i++)
						subRegionsForDispatch[i]	= cache.getGenericSubRegionById(request, subRegionIdsArr.get(i));
				}

				// Create Agent List
				if(dispatchBranchIdsStr.length() > 0)
					crossingAgents = CrossingAgentMasterDao.getInstance().getCrossingAgentByBranchIds(dispatchBranchIdsStr.toString());
			}

			final var	subRegionForGroup 				= OutboundCargoDao.getInstance().getOutBoundCargoCitiesWithBranchWiseDispatchConfig(allAssignedLocationIds ,executive.getAccountGroupId());

			request.setAttribute("dispatchBranchListStr", dispatchBranchListStr.toString());
			request.setAttribute("dispatchBranchIdsStr", dispatchBranchIdsStr.toString());
			request.setAttribute("subRegionList", subRegionsForDispatch);
			request.setAttribute("crossingAgents", crossingAgents);
			request.setAttribute("subRegionForGroup", cache.getSubRegionsByGroupId(request, executive.getAccountGroupId()));

			final var	subRegion		= cache.getAllSubRegions(request);
			final HashMap<Long,String>	subRegionList	= new LinkedHashMap<>();

			for (final SubRegion element : subRegionForGroup)
				subRegionList.put(element.getSubRegionId(), ((SubRegion) subRegion.get(element.getSubRegionId())).getName());

			request.setAttribute("subRegionForGroupList", subRegionList);

			/*********************Make Shared Branches Collection (Start)*******************/
			request.setAttribute("sharedBranches", cache.getSharedBranchesList(request, executive.getAccountGroupId()));
			/*********************Make Shared Branches Collection (End)*******************/

			if(executive.getAccountGroupId() != TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_LMT) {
				vtForGroup			= cache.getVehicleTypeForGroup(request, executive.getAccountGroupId());
				vaForGroup			= VehicleAgentMasterDao.getInstance().getVehicleAgentDetails(executive.getAccountGroupId());
				allGroupBranches 	= cache.getAllGroupBranches(request, executive.getAccountGroupId());
			}

			if(manualLSDaysAllowed)
				request.setAttribute("ManualLSDaysAllowed", (int) cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_MAX_DAYS_OF_OPERATION_BEFORE_CASHSTATEMENT_ENTRY_ID));

			request.setAttribute("vehicleTypeForGroup", vtForGroup);
			request.setAttribute("agentsForgroup", vaForGroup);
			request.setAttribute("allGroupBranches", allGroupBranches);

			if((boolean) interBranchLsConfiguration.getOrDefault(InterBranchLSConfigurationConstant.IS_SHOW_BILL_SELECTION, false)) {
				final var groupConfigValObj	= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.BOOKING);
				request.setAttribute("billSelectionList", BookingWayBillSelectionUtility.getBillSelectionListForModule(groupConfigValObj));
			}

			if((boolean) groupConfig.getOrDefault(GroupConfigurationPropertiesConstant.SHOW_DIVISION_SELECTION, false))
				request.setAttribute("divisionSelectionList", cache.getDivisionMasterList(request, executive.getAccountGroupId()));

			if(regionBranchesHM.size() > 0) {
				final var	exeRegionBranchesAL	= (ArrayList<Long>) regionBranchesHM.entrySet().stream().map(Entry::getKey).collect(CollectionUtility.getList());

				if(!exeRegionBranchesAL.isEmpty())
					request.setAttribute("exeRegionBranchesAL", exeRegionBranchesAL);
			}

			request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}

	private Map<String, String> getPhysicalBranches(HttpServletRequest request, CacheManip cache, Map<Object, Object> interBranchLsConfiguration, Executive executive) throws Exception {
		try {
			final var 	showCurrentBranchInDestinationList	= (boolean) interBranchLsConfiguration.getOrDefault(InterBranchLSConfigurationConstant.SHOW_CURRENT_BRANCH_IN_DESTINATION_LIST, true);
			final var	regionWisePhysicalBranches			= (boolean) interBranchLsConfiguration.getOrDefault(InterBranchLSConfigurationConstant.REGION_WISE_PHYSICAL_BRANCHES, true);
			final var	subregionWisePhysicalBranches		= (boolean) interBranchLsConfiguration.getOrDefault(InterBranchLSConfigurationConstant.SUBREGION_WISE_PHYSICAL_BRANCHES, true);
			final var	showRegionBranchesByRegionId		= (boolean) interBranchLsConfiguration.getOrDefault(InterBranchLSConfigurationConstant.SHOW_REGION_BRANCHES_BY_REGION_ID, false);

			final var	allPhysicalBranchesHM		= new HashMap<String, String>();

			if(regionWisePhysicalBranches) {
				final var	regionBranchesHM 					= cache.getBranchesByRegionId(request, executive.getAccountGroupId(), executive.getRegionId());
				final var filteredBranches = filterPhysicalBranches(regionBranchesHM.values(), showCurrentBranchInDestinationList, executive);

				if(!filteredBranches.isEmpty())
					allPhysicalBranchesHM.putAll(filteredBranches);
			} else if(subregionWisePhysicalBranches) {
				final var	subRegionBranchesHM					= cache.getBranchesBySubRegionId(request, executive.getAccountGroupId(), executive.getSubRegionId());
				final var filteredBranches = filterPhysicalBranches(subRegionBranchesHM.values(), showCurrentBranchInDestinationList, executive);

				if(!filteredBranches.isEmpty())
					allPhysicalBranchesHM.putAll(filteredBranches);
			} 
			
			if(showRegionBranchesByRegionId) {
				final var 	regionAndToRegionHM	= CollectionUtility.getLongWithLongHashMapFromStringArray((String) interBranchLsConfiguration.getOrDefault(InterBranchLSConfigurationConstant.REGION_TO_REGION_MAPPING, "0_0"), Constant.COMMA);
				final var branchDetailsList		= cache.getAllGroupBranchesList(request, executive.getAccountGroupId());

				if (!regionAndToRegionHM.isEmpty() && regionAndToRegionHM.containsKey(executive.getRegionId())) {
					final var destinationRegionIdList = regionAndToRegionHM.get(executive.getRegionId());

					final Map<Long, List<Branch>> branchesByRegion = MapUtils.groupBy(branchDetailsList, Branch::getRegionId);

					for(final Long destinationRegionId : destinationRegionIdList) {
						final var filteredBranches = filterPhysicalBranches(branchesByRegion.getOrDefault(destinationRegionId, List.of()), showCurrentBranchInDestinationList, executive);

						if(!filteredBranches.isEmpty())
							allPhysicalBranchesHM.putAll(filteredBranches);
					}
				}
			}

			return allPhysicalBranchesHM;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private Map<String, String> filterPhysicalBranches(final Collection<Branch> branches, final boolean showCurrentBranchInDestinationList, final Executive executive) {
		return MapUtils.filterToMap(
				branches,
				physicalBranchPredicate(showCurrentBranchInDestinationList, executive),
				Branch::getBranchWithSubRegionId,
				Branch::getName
				);
	}

	private Predicate<Branch> physicalBranchPredicate(boolean showCurrentBranchInDestinationList, Executive executive) {
		return b -> b.getTypeOfLocation() == Branch.TYPE_OF_LOCATION_PHYSICAL
				&& !b.isMarkForDelete() && b.getStatus() == 0
				&& (showCurrentBranchInDestinationList || executive.getBranchId() != b.getBranchId());
	}

}
