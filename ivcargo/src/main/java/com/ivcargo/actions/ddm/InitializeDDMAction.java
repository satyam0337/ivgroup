package com.ivcargo.actions.ddm;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.StringJoiner;
import java.util.TreeMap;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.ObjectUtils;

import com.framework.Action;
import com.iv.bll.utils.BookingWayBillSelectionUtility;
import com.iv.constant.properties.DDMConfigurationConstant;
import com.iv.constant.properties.GroupConfigurationPropertiesConstant;
import com.iv.dto.constant.FeildPermissionsConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.utils.exception.ExceptionProcess;
import com.iv.utils.utility.CollectionUtility;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actions.ConfigParamAction;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.DoorDeliveryMemoDao;
import com.platform.dto.AliasNameConstants;
import com.platform.dto.Branch;
import com.platform.dto.Executive;
import com.platform.dto.SubRegion;
import com.platform.dto.model.ChargeTypeModel;
import com.platform.utils.Utility;

public class InitializeDDMAction implements Action {

	private static final String TRACE_ID = "InitializeDDMAction";

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String, Object>	 	error					= null;
		List<Long>  				bookingChargeIdsList	= null;

		try {
			error 	= ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request, error))
				return;

			final var 	cache 				= new CacheManip(request);
			final var	executive 			= cache.getExecutive(request);
			final HashMap<?, ?>	execFldPermissions	= cache.getExecutiveFieldPermission(request);

			final var ddmConfiguration					= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.CREATE_DDM);
			final var groupConfigValObj					= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.BOOKING);
			final var isAllowNewDDMScreen				= (boolean) ddmConfiguration.getOrDefault(DDMConfigurationConstant.IS_NEW_DDM_CREATION, false);
			final var showBookingCharges				= (boolean) ddmConfiguration.getOrDefault(DDMConfigurationConstant.SHOW_BOOKING_CHARGES, false);
			final var showBranchCodeOnLRNumberField		= (boolean) ddmConfiguration.getOrDefault(DDMConfigurationConstant.SHOW_BRANCH_CODE_ON_LR_NUMBER_FIELD, false);

			request.setAttribute(AliasNameConstants.IS_DESTINATION_TO_SHOW, (boolean) ddmConfiguration.getOrDefault(DDMConfigurationConstant.IS_LOCATION_TYPE_REQUIRED, false));
			request.setAttribute(ActionStaticUtil.IS_BOTH_TYPE_BRANCHES_NEEDED, true);

			ActionStaticUtil.setInitializeBranchesSelectionInRequest(request, executive);
			ActionStaticUtil.setExecutiveCoreReportPermissionsInRequest(request, executive);
			ActionStaticUtil.getAssignedLocationsByLocationId(request, executive.getAccountGroupId(), executive.getBranchId(), true);

			ActionStaticUtil.getAssignedLocationsIdListByLocationIdId(request, executive, true, cache);
			ActionStaticUtil.getBranchesByRegionId(request, executive, true, cache);
			ActionStaticUtil.getSubRegionsByGroupId(request, executive.getAccountGroupId(),  true, cache);

			setDestinationBranchSelectionForDDM(request, executive, cache);

			ActionStaticUtil.setBranchSelectionBooleans(request, executive);

			final var actBkgcharges		= cache.getActiveBookingCharges(request, executive.getBranchId());

			Map<Short, Map<Long, String>> bookingChargesSequence	= Stream.of(actBkgcharges)
					.collect(Collectors.groupingBy(ChargeTypeModel::getSequence,
							Collectors.toMap(ChargeTypeModel::getChargeTypeMasterId, ChargeTypeModel::getChargeName, (e1, e2) -> e1, TreeMap::new)));

			final var actDelcharges 			= cache.getActiveDeliveryCharges(request, executive.getBranchId());

			Map<Short, Map<Long, String>> deliveryChargesSequence	= Stream.of(actDelcharges)
					.collect(Collectors.groupingBy(ChargeTypeModel::getSequence,
							Collectors.toMap(ChargeTypeModel::getChargeTypeMasterId, ChargeTypeModel::getChargeName, (e1, e2) -> e1, TreeMap::new)));

			bookingChargesSequence	= CollectionUtility.sortMapByKeys(bookingChargesSequence);
			deliveryChargesSequence	= CollectionUtility.sortMapByKeys(deliveryChargesSequence);

			if(showBookingCharges)
				bookingChargeIdsList	= CollectionUtility.getLongListFromString((String) ddmConfiguration.getOrDefault(DDMConfigurationConstant.BOOKING_CHARGE_IDS_TO_SHOW, null));

			if(showBranchCodeOnLRNumberField) {
				final Map<Long, Long> branchIdPairHM = Utility.getLongHashMapFromStringArray((String) ddmConfiguration.getOrDefault(DDMConfigurationConstant.BRANCHID_PAIR_TO_SHOW_BRANCH_CODE_ON_LRNUMBER_FIELD, null), ",");

				if(branchIdPairHM.containsKey(executive.getBranchId())) {
					final var branchObj = cache.getBranchById(request, executive.getAccountGroupId(),  branchIdPairHM.get(executive.getBranchId()));
					request.setAttribute("branchCode", branchObj.getBranchCode() + "/");
				}
			}

			request.setAttribute(Executive.EXECUTIVE, executive);
			request.setAttribute(AliasNameConstants.IS_GODOWN_TO_SHOW, (boolean) ddmConfiguration.getOrDefault(DDMConfigurationConstant.IS_GODOWN_TO_SHOW, false));
			request.setAttribute("bookingChargeIdsList", bookingChargeIdsList);
			request.setAttribute(AliasNameConstants.ACTIVE_BOOKING_CHARGES, bookingChargesSequence);
			request.setAttribute(AliasNameConstants.ACTIVE_DELIVERY_CHARGES, deliveryChargesSequence);
			request.setAttribute("defaultDeliveryAtSelection", (boolean) ddmConfiguration.getOrDefault(DDMConfigurationConstant.DEFAULT_DELIVERY_AT_SELECTION, false));
			request.setAttribute("showOpeningKilometer", (boolean) ddmConfiguration.getOrDefault(DDMConfigurationConstant.SHOW_OPENING_KILOMETER, false));
			request.setAttribute("deliveryAtSelectionVal", (int) ddmConfiguration.getOrDefault(DDMConfigurationConstant.DELIVERY_AT_SELECTION_VAL, 0));
			request.setAttribute("isAllowNewDDMScreen", isAllowNewDDMScreen);
			request.setAttribute("executiveBranchId", executive.getBranchId());
			request.setAttribute("defaultLogingInBranchInTruckDestination", (boolean) ddmConfiguration.getOrDefault(DDMConfigurationConstant.DEFAULT_LOGING_IN_BRANCH_IN_TRUCK_DESTINATION, false));
			request.setAttribute("showBranchCodeOnLRNumberField", showBranchCodeOnLRNumberField);
			request.setAttribute("showLrWiseLorryHireColumn", execFldPermissions.get(FeildPermissionsConstant.SHOW_LR_WISE_LORRY_HIRE_COLUMN) != null);
			request.setAttribute(DDMConfigurationConstant.SHOW_CUSTOMER_OPTION_FOR_LR_SEARCH, (boolean) ddmConfiguration.getOrDefault(DDMConfigurationConstant.SHOW_CUSTOMER_OPTION_FOR_LR_SEARCH, false));
			request.setAttribute(DDMConfigurationConstant.IS_ALLOW_MANUAL_CR_WITHOUT_SEQ_COUNTER, (boolean) ddmConfiguration.getOrDefault(DDMConfigurationConstant.IS_ALLOW_MANUAL_CR_WITHOUT_SEQ_COUNTER, false));
			request.setAttribute(GroupConfigurationPropertiesConstant.SHOW_DIVISION_SELECTION, (boolean) groupConfigValObj.getOrDefault(GroupConfigurationPropertiesConstant.SHOW_DIVISION_SELECTION, false));

			if((boolean) ddmConfiguration.getOrDefault(DDMConfigurationConstant.ALLOW_BILL_SELECTION, false))
				request.setAttribute("billSelectionList", BookingWayBillSelectionUtility.getBillSelectionListForModule(groupConfigValObj));

			if((boolean) groupConfigValObj.getOrDefault(GroupConfigurationPropertiesConstant.SHOW_DIVISION_SELECTION, false))
				request.setAttribute("divisionSelectionList", cache.getDivisionMasterList(request, executive.getAccountGroupId()));

			if(isAllowNewDDMScreen)
				request.setAttribute(ActionStaticUtil.NEXTPAGETOKEN, ActionStaticUtil.SUCCESS + "_new");
			else
				request.setAttribute(ActionStaticUtil.NEXTPAGETOKEN, ActionStaticUtil.SUCCESS);
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}

	private void setDestinationBranchSelectionForDDM(final HttpServletRequest request,final Executive executive,final CacheManip cache) throws Exception {
		try {
			final var	isDestinationBranchSelection = ConfigParamAction.isDestBranchSelectionForDDM(request, cache, executive);

			request.setAttribute("isDestinationBranchSelection", isDestinationBranchSelection);

			if(!isDestinationBranchSelection)
				return;

			setDispatchBranchList(request, cache, executive);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private void setDispatchBranchList(final HttpServletRequest request, final CacheManip cache, final Executive executive) throws Exception {
		try {
			var	destinationBranchIdList = DoorDeliveryMemoDao.getInstance().getDestinationBranchIdsForDoorDeliveryMemo(executive.getAccountGroupId(), executive.getBranchId());

			if(ObjectUtils.isEmpty(destinationBranchIdList))
				return;

			destinationBranchIdList	= Utility.removeLongDuplicateElementsFromArrayList(destinationBranchIdList);

			final List<Long>	subRegionIdList 			= new ArrayList<>();
			final var	destinationBranchListStr	= new StringJoiner(";");
			final List<SubRegion>	subRegionsForDispatch		= new ArrayList<>();

			final var branches 		= cache.getGenericBranchesDetail(request);
			final var subRegions	= cache.getAllSubRegions(request);

			for (final Long element : destinationBranchIdList) {
				final var	branch = (Branch) branches.get(Long.toString(element));

				if(!subRegionIdList.contains(branch.getSubRegionId())) {
					subRegionsForDispatch.add((SubRegion) subRegions.get(branch.getSubRegionId()));
					subRegionIdList.add(branch.getSubRegionId());
				}

				destinationBranchListStr.add(branch.getSubRegionId() + "_" + branch.getSubRegionId() + "_" + branch.getBranchId() + "=" + branch.getName());
			}

			request.setAttribute("dispatchBranchListStr", destinationBranchListStr.toString());
			request.setAttribute("subRegionList", subRegionsForDispatch.toArray(new SubRegion[subRegionsForDispatch.size()]));
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}
}