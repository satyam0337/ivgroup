package com.ivcargo.actions.ddm;

import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.CorporateAccountBLL;
import com.businesslogic.ddm.DDMGetData;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.constant.properties.DDMConfigurationConstant;
import com.iv.constant.properties.GroupConfigurationPropertiesConstant;
import com.iv.dto.constant.FeildPermissionsConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.properties.constant.DisplayDataWithinDateRangePropertiesConstant;
import com.iv.utils.constant.Constant;
import com.iv.utils.exception.ExceptionProcess;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.actions.ConfigParamAction;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.AliasNameConstants;
import com.platform.dto.DoorDeliveryMemo;
import com.platform.dto.Executive;
import com.platform.dto.TransportCommonMaster;
import com.platform.dto.configuration.mindateselection.ModuleWiseMinDateSelectionConfigurationDTO;
import com.platform.dto.configuration.modules.GroupConfigurationPropertiesDTO;

public class DDMGetDataAction implements Action {

	private static final String TRACE_ID = DDMGetDataAction.class.getName();

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	 		error 					= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request, error))
				return;

			final var	cache				= new CacheManip(request);
			final var	executive 			= cache.getExecutive(request);
			final HashMap<?, ?>	execFldPermissions	= cache.getExecutiveFieldPermission(request);

			final var	allowDeliveryForBlackListedParty = execFldPermissions.get(FeildPermissionsConstant.ALLOW_DELIVERY_FOR_BLACK_LISTED_PARTY) != null;

			final var	ddmConfigurationHM		= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.CREATE_DDM);
			final var	minDateTimeStamp		= cache.getModuleWiseMinDateToGetData(request, executive.getAccountGroupId(),
					ModuleWiseMinDateSelectionConfigurationDTO.CREATE_DDM_MIN_DATE_ALLOW,
					ModuleWiseMinDateSelectionConfigurationDTO.CREATE_DDM_MIN_DATE);

			final var displayDataConfig	= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.DISPLAY_DATA_CONFIGURATION);
			final var groupConfig		= cache.getGroupConfiguration(request, executive.getAccountGroupId());

			displayDataConfig.put(Constant.EXEC_FEILD_PERMISSION, execFldPermissions);
			displayDataConfig.put(Constant.EXECUTIVE_TYPE, executive.getExecutiveType());

			ddmConfigurationHM.put(GroupConfigurationPropertiesConstant.DOOR_DELIVERY_CHARGE_ID, groupConfig.get(GroupConfigurationPropertiesConstant.DOOR_DELIVERY_CHARGE_ID));

			final Map<Object, Object>	valObj = new HashMap<>();

			final var destinationSubRegionId	= JSPUtility.GetLong(request, "destSubRegionId", 0);

			valObj.put(Executive.EXECUTIVE, executive);
			valObj.put(AliasNameConstants.IS_PENDING_DELIVERY_TABLE_ENTRY, ConfigParamAction.isPendingDelStockTblEntryAllow(request, cache, executive));
			valObj.put(AliasNameConstants.LOCATION_ID, JSPUtility.GetLong(request, "locationId", 0));
			valObj.put(Constant.BRANCH_ID, JSPUtility.GetLong(request, "branchId", 0));
			valObj.put(Constant.GODOWN_ID, JSPUtility.GetLong(request, "godownId", 0));
			valObj.put(Constant.DESTINATION_BRANCH_ID, JSPUtility.GetLong(request, "destBranchId", 0));
			valObj.put(Constant.DESTINATION_SUB_REGION_ID, destinationSubRegionId);
			valObj.put(AliasNameConstants.LOCATION_MAPPING_OF_GROUP, cache.getLocationMappingForGroup(request, executive.getAccountGroupId()));
			valObj.put(AliasNameConstants.ALL_GROUP_BRANCHES, cache.getAllGroupBranches(request, executive.getAccountGroupId()));
			valObj.put(AliasNameConstants.DELIVERY_FOR, JSPUtility.GetShort(request, "DeliveryFor", (short) 0));
			valObj.put(Constant.MIN_DATE_TIME_STAMP, minDateTimeStamp);
			valObj.put("accountGroup", cache.getAccountGroupById(request, executive.getAccountGroupId()));
			valObj.put(Constant.BILL_SELECTION_ID, JSPUtility.GetShort(request, "billSelection", (short) 0));
			valObj.put(DDMConfigurationConstant.DDM_CONFIGURATION, ddmConfigurationHM);
			valObj.put(DisplayDataWithinDateRangePropertiesConstant.DISPLAY_DATA_CONFIGURATION_CONSTANT, displayDataConfig);
			valObj.put("showLrWiseLorryHireColumn", execFldPermissions.get(FeildPermissionsConstant.SHOW_LR_WISE_LORRY_HIRE_COLUMN) != null);
			valObj.put(Constant.CONSIGNEE_CORPORATE_ACCOUNT_ID, JSPUtility.GetLong(request, "consigneeCorpAccId", 0));
			valObj.put(Constant.DIVISION_ID, JSPUtility.GetShort(request, "divisionSelection", (short) 0));

			if(destinationSubRegionId > 0) {
				final var	destinationBranchesIds	= cache.getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_SUBREGION, destinationSubRegionId);

				if(destinationBranchesIds != null)
					valObj.put("destinationBranchesIds", destinationBranchesIds);
			}

			final var	accountGroup		= cache.getAccountGroupById(request, executive.getAccountGroupId());

			final var	ddbWiseSelfPartyId		= CorporateAccountBLL.getInstance().getSelfPartyCorporateAccountId(groupConfig, accountGroup);

			final var	doorDeliveryMemoList	= DDMGetData.getInstance().getDataToGenerateDDM(valObj);

			if(!doorDeliveryMemoList.isEmpty()) {
				request.setAttribute(AliasNameConstants.DOOR_DELIVERY_DATA_ARRAY, doorDeliveryMemoList);
				request.setAttribute(AliasNameConstants.TOTAL_QUANTITY, doorDeliveryMemoList.stream().map(DoorDeliveryMemo::getQuantity).mapToLong(Long::longValue).sum());
				request.setAttribute(AliasNameConstants.TOTAL_ACTUAL_WEIGHT, doorDeliveryMemoList.stream().map(DoorDeliveryMemo::getActualWeight).mapToDouble(Double::doubleValue).sum());
				request.setAttribute(AliasNameConstants.TOTAL_GRAND_TOTAL, doorDeliveryMemoList.stream().map(DoorDeliveryMemo::getGrandTotal).mapToDouble(Double::doubleValue).sum());
				request.setAttribute(AliasNameConstants.IS_PENDING_DELIVERY_TABLE_ENTRY, ConfigParamAction.isPendingDelStockTblEntryAllow(request, cache, executive));
			}

			request.setAttribute("ddbWiseSelfPartyId", ddbWiseSelfPartyId);
			request.setAttribute(GroupConfigurationPropertiesDTO.SHOW_PARTY_IS_BLACK_LISTED_PARTY, groupConfig.getBoolean(GroupConfigurationPropertiesDTO.SHOW_PARTY_IS_BLACK_LISTED_PARTY, false));
			request.setAttribute("allowDeliveryForBlackListedParty", allowDeliveryForBlackListedParty);
			request.setAttribute("allowDDMCreationAfterPickUpLS", ddmConfigurationHM.getOrDefault(DDMConfigurationConstant.ALLOW_DDM_CREATION_AFTER_PICK_UP_LS, false));
			request.setAttribute(DDMConfigurationConstant.CHECK_DOOR_DELIVERY_AMOUNT, ddmConfigurationHM.getOrDefault(DDMConfigurationConstant.CHECK_DOOR_DELIVERY_AMOUNT, false));
			request.setAttribute(DDMConfigurationConstant.SHOW_BOOKING_DATE_AT_TIME_OF_DDM_CREATION, ddmConfigurationHM.getOrDefault(DDMConfigurationConstant.SHOW_BOOKING_DATE_AT_TIME_OF_DDM_CREATION, false));
			request.setAttribute(DDMConfigurationConstant.SELECTION_ORDER_WISE_DDM_CREATION, ddmConfigurationHM.getOrDefault(DDMConfigurationConstant.SELECTION_ORDER_WISE_DDM_CREATION, false));
			request.setAttribute(DDMConfigurationConstant.WAYBILL_TYPE_FOR_CHECKING_DOOR_DELIVERY_AMOUNT, ddmConfigurationHM.getOrDefault(DDMConfigurationConstant.WAYBILL_TYPE_FOR_CHECKING_DOOR_DELIVERY_AMOUNT, "0"));
			
			ActionStaticUtil.setNextPageToken(request, ActionStaticUtil.SUCCESS);
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
			ExceptionProcess.execute(e, TRACE_ID);
		}
	}
}