package com.ivcargo.actions.masters;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.ObjectUtils;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.constant.properties.HamaliMasterConfigurationConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.ConfigHamaliForVehicleTypeDao;
import com.platform.dto.Branch;
import com.platform.dto.ConfigHamaliMasterForVehicleType;
import com.platform.dto.Executive;
import com.platform.resource.CargoErrorList;

public class ConfigHamaliMasterForVehicleTypeAction implements Action {

	public static final String TRACE_ID = "ConfigHamaliMasterForVehicleTypeAction";

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>				error 						= null;
		String 								strResponse    				= null;
		Map<Long, Branch>					branchesHM					= null;
		List<Branch> 						branchList					= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	cache    								= new CacheManip(request);
			final var	executive								= cache.getExecutive(request);

			final var	filter 									= JSPUtility.GetInt(request, "filter",0);
			final var	selectedConfigHamaliForVehicleTypeId	= JSPUtility.GetLong(request, "selectedConfigHamaliForVehicleTypeId",0);

			final var	configHamaliForVehicleType 				= new ConfigHamaliMasterForVehicleType();

			final var	regionId	= JSPUtility.GetLong(request, "region", 0);
			final var	subRegionId	= JSPUtility.GetLong(request, "subRegion", 0);
			final var	branchId	= JSPUtility.GetLong(request, "branch", 0);

			if(branchId > 0) {
				final var	branch					= cache.getBranchById(request, executive.getAccountGroupId(), branchId);

				if(branch != null && !branch.isMarkForDelete() && branch.getStatus() == Branch.BRANCH_ACTIVE) {
					branchesHM				= new HashMap<>();
					branchesHM.put(branchId, branch);
				}
			} else if(regionId > 0 && subRegionId <= 0)
				branchList 				= cache.getAllActiveGroupBranchesByRegionId(request, executive.getAccountGroupId(), regionId);
			else if(regionId > 0 && subRegionId > 0 && branchId <= 0)
				branchList 				= cache.getActiveBranchesBySubRegionId(request, executive.getAccountGroupId(), subRegionId);
			else if(regionId <= 0)
				branchList				= cache.getAllActiveGroupBranchesList(request, executive.getAccountGroupId());

			if(branchList != null)
				branchesHM	= branchList.stream().collect(Collectors.toMap(Branch::getBranchId, Function.identity(), (e1, e2) -> e1));

			final var configuration = cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.VEHICLE_CONFIG_HAMALI_MASTER);

			final var showCustomHamaliConfigMaster		= (boolean) configuration.getOrDefault(HamaliMasterConfigurationConstant.SHOW_CUSTOM_HAMALI_CONFIG_MASTER, false);

			switch (filter) {
			case 1 -> {
				createConfigHamaliMasterForVehicleTypeDTO(request, error, configHamaliForVehicleType, executive, showCustomHamaliConfigMaster);

				if(ObjectUtils.isNotEmpty(branchesHM)) {
					final var values	= getHamaliAmountMap(configHamaliForVehicleType);
					ConfigHamaliForVehicleTypeDao.getInstance().insertConfigHamaliMasterForVehicleType(branchesHM, configHamaliForVehicleType, values);

					strResponse =  CargoErrorList.MASTER_DATA_INSERT_SUCCESS_DESCRIPTION ;
				} else
					strResponse = "Config Hamali For Vehicle Type insert "+CargoErrorList.MASTER_DATA_OPERATION_FAILURE_DESCRIPTION;
			}
			case 2 -> {
				configHamaliForVehicleType.setConfigHamaliForVehicleTypeId(selectedConfigHamaliForVehicleTypeId);
				createConfigHamaliMasterForVehicleTypeDTO(request, error, configHamaliForVehicleType, executive, showCustomHamaliConfigMaster);

				final var hamaliModulIdWiseAmtHM = getHamaliAmountMap(configHamaliForVehicleType);

				if(configHamaliForVehicleType.getHamaliConfigType() == ConfigHamaliMasterForVehicleType.CONFIG_HAMALI_LOADING_THAPPI_PER_TON_ID) {
					ConfigHamaliForVehicleTypeDao.getInstance().updateConfigHamaliRateByBranchId(branchesHM, configHamaliForVehicleType);

					strResponse  = CargoErrorList.MASTER_DATA_UPDATE_SUCCESS_DESCRIPTION;
				} else if(ObjectUtils.isNotEmpty(hamaliModulIdWiseAmtHM) && ObjectUtils.isNotEmpty(branchesHM)) {
					ConfigHamaliForVehicleTypeDao.getInstance().updateConfigHamaliForVehicleType(branchesHM, configHamaliForVehicleType, hamaliModulIdWiseAmtHM);
					strResponse  = CargoErrorList.MASTER_DATA_UPDATE_SUCCESS_DESCRIPTION;
				} else
					strResponse  = ConfigHamaliForVehicleTypeDao.getInstance().update(configHamaliForVehicleType);
			}
			case 3 -> {
				configHamaliForVehicleType.setConfigHamaliForVehicleTypeId(selectedConfigHamaliForVehicleTypeId);
				createConfigHamaliMasterForVehicleTypeDTO(request, error, configHamaliForVehicleType, executive, showCustomHamaliConfigMaster);

				if(configHamaliForVehicleType.getHamaliConfigType() == ConfigHamaliMasterForVehicleType.CONFIG_HAMALI_LOADING_THAPPI_PER_TON_ID ||
						configHamaliForVehicleType.getHamaliConfigType() == ConfigHamaliMasterForVehicleType.CONFIG_HAMALI_LOADINGPERTON_UNLOADINGPERTON_ID) {
					if(ObjectUtils.isNotEmpty(branchesHM))
						ConfigHamaliForVehicleTypeDao.getInstance().deleteConfigHamaliRateByBranchId(branchesHM, configHamaliForVehicleType);

					strResponse  = CargoErrorList.MASTER_DATA_DELETE_SUCCESS_DESCRIPTION;
				} else
					strResponse =  ConfigHamaliForVehicleTypeDao.getInstance().delete(selectedConfigHamaliForVehicleTypeId);
			}
			default -> {
				break;
			}
			}

			new InitializeConfigHamaliMasterForVehicleTypeAction().execute(request, response);
			request.setAttribute("nextPageToken", "success");

			if(filter != 0) {
				response.sendRedirect("ConfigHamaliMasterForVehicleType.jsp.do?pageId=230&eventId=2&message="+strResponse);
				request.setAttribute("message",strResponse);
			}
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}
	}

	public Map<Long, Double> getHamaliAmountMap(final ConfigHamaliMasterForVehicleType configHamaliForVehicleType) {
		final var hamaliModulIdWiseAmtHM = new HashMap<Long, Double>();

		if(configHamaliForVehicleType.getLsPerTon() > 0)
			hamaliModulIdWiseAmtHM.put(ModuleIdentifierConstant.DISPATCH, configHamaliForVehicleType.getLsPerTon());

		if(configHamaliForVehicleType.getDdmPerTon() > 0)
			hamaliModulIdWiseAmtHM.put(ModuleIdentifierConstant.CREATE_DDM, configHamaliForVehicleType.getDdmPerTon());

		if(configHamaliForVehicleType.getPickupLSPerTon() > 0)
			hamaliModulIdWiseAmtHM.put(ModuleIdentifierConstant.DOOR_PICKUP_DISPATCH, configHamaliForVehicleType.getPickupLSPerTon());

		return hamaliModulIdWiseAmtHM;
	}

	public void createConfigHamaliMasterForVehicleTypeDTO(final HttpServletRequest request, final HashMap<String,Object> error, final ConfigHamaliMasterForVehicleType configHamaliForVehicleType, final Executive executive,
			final boolean showCustomHamaliConfigMaster) {
		try {
			configHamaliForVehicleType.setAccountGroupId(executive.getAccountGroupId());
			configHamaliForVehicleType.setBranchId(JSPUtility.GetLong(request, "branch", 0));
			configHamaliForVehicleType.setVehicleTypeId((short)JSPUtility.GetLong(request, "vehicleType", 0));
			configHamaliForVehicleType.setBharai(JSPUtility.GetDouble(request, "bharai", 0));
			configHamaliForVehicleType.setThappi(JSPUtility.GetDouble(request, "thappi", 0));
			configHamaliForVehicleType.setWarai(JSPUtility.GetDouble(request, "warai", 0));
			configHamaliForVehicleType.setUtrai(JSPUtility.GetDouble(request, "utrai", 0));
			configHamaliForVehicleType.setLoadingTimeHamali(JSPUtility.GetDouble(request, "loadingTimeHamali", 0));
			configHamaliForVehicleType.setUnloadingTimeHamali(JSPUtility.GetDouble(request, "unloadingTimeHamali", 0));
			configHamaliForVehicleType.setLoadingPerTon(JSPUtility.GetDouble(request, "loadingPerTon", 0));
			configHamaliForVehicleType.setUnloadingPerTon(JSPUtility.GetDouble(request, "unloadingPerTon", 0));
			configHamaliForVehicleType.setHamaliConfigType(JSPUtility.GetShort(request, "hamaliConfigType", (short) 0));
			configHamaliForVehicleType.setLoadingLevyRate(JSPUtility.GetDouble(request, "loadingLevy", (short) 0));
			configHamaliForVehicleType.setThappiLevyRate(JSPUtility.GetDouble(request, "thappiLevy", (short) 0));
			configHamaliForVehicleType.setMarkForDelete(false);
			configHamaliForVehicleType.setLoadingPerArticle(JSPUtility.GetDouble(request, "loadingPerArticle", 0));
			configHamaliForVehicleType.setUnloadingPerArticle(JSPUtility.GetDouble(request, "unloadingPerArticle", 0));
			configHamaliForVehicleType.setLsPerTon(JSPUtility.GetDouble(request, "lsPerTon", 0));
			configHamaliForVehicleType.setDdmPerTon(JSPUtility.GetDouble(request, "ddmPerTon", 0));
			configHamaliForVehicleType.setPickupLSPerTon(JSPUtility.GetDouble(request, "pickupLsPerTon", 0));

			if(showCustomHamaliConfigMaster) {
				configHamaliForVehicleType.setThappi(JSPUtility.GetDouble(request, "loadingTimeThappi", 0));
				configHamaliForVehicleType.setLoadingPerTon(JSPUtility.GetDouble(request, "loadingTimeHamaliPerTon", 0));
			}
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}
	}
}