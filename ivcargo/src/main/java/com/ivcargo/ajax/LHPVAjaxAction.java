
package com.ivcargo.ajax;

//~--- non-JDK imports --------------------------------------------------------

import java.io.PrintWriter;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONObject;

import com.businesslogic.LHPVBLL;
import com.businesslogic.print.LHPVPrintBLL;
import com.framework.Action;
import com.iv.constant.properties.TDSPropertiesConstant;
import com.iv.constant.properties.lhpv.LHPVPropertiesConstant;
import com.iv.constant.properties.lhpv.LhpvPrintConfigurationConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.logsapp.LogWriter;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.exception.ExceptionProcess;
import com.iv.utils.utility.CollectionUtility;
import com.iv.utils.utility.Utility;
import com.ivcargo.reports.ReportView;
import com.ivcargo.utils.CacheManip;
import com.ivcargo.utils.JsonUtility;
import com.platform.dto.AliasNameConstants;
import com.platform.dto.Branch;
import com.platform.dto.ConfigParam;
import com.platform.dto.DispatchLedger;
import com.platform.dto.Executive;
import com.platform.dto.ExecutiveFeildPermissionDTO;
import com.platform.dto.LHPV;
import com.platform.dto.LorryHire;
import com.platform.dto.configuration.mindateselection.ModuleWiseMinDateSelectionConfigurationDTO;
import com.platform.dto.constant.FeildPermissionsConstant;
import com.platform.dto.constant.LHPVConstant;
import com.platform.dto.model.ReportViewModel;
import com.platform.jsonconstant.JsonConstant;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Converter;

public class LHPVAjaxAction implements Action {

	public static final String TRACE_ID = LHPVAjaxAction.class.getName();

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {

		PrintWriter						out							= null;
		JSONObject						jsonObjectIn				= null;
		JSONObject						jsonObjectOut				= null;
		short							filter						= 0;

		try {

			response.setContentType("application/json"); // Setting response for JSON Content

			out						= response.getWriter();
			jsonObjectOut			= new JSONObject();
			jsonObjectIn			= new JSONObject(request.getParameter("json"));
			filter					= Utility.getShort(jsonObjectIn.get("filter"));

			if(request.getSession().getAttribute("executive") == null) {
				jsonObjectOut.put("errorDescription", "You have been logged out. Please login again.");
				out.println(jsonObjectOut);
				return;
			}

			switch (filter) {
			case 1: {
				out.println(initialize(request, jsonObjectOut));
				break;
			}
			case 2: {
				out.println(getDataToCreateLHPVByVehicleNumber(request, jsonObjectOut, jsonObjectIn));
				break;
			}
			case 3: {
				out.println(getDataToCreateLHPVLSNumber(request, jsonObjectOut, jsonObjectIn));
				break;
			}
			case 4: {
				out.println(getLHPVDataToPrint(request, jsonObjectIn));
				break;
			}
			case 5: {
				out.println(getLHPVNumberOnVechileNumber(jsonObjectIn));
				break;
			}
			default: {
				jsonObjectOut.put("errorDescription", "Unknown Request");
				out.println(jsonObjectOut);
				break;
			}
			}
		} catch (final Exception _e) {
			LogWriter.writeLog(LHPVAjaxAction.TRACE_ID, LogWriter.LOG_LEVEL_ERROR, _e);
			try {
				jsonObjectOut			= new JSONObject();
				jsonObjectOut.put("errorCode", CargoErrorList.SYSTEM_ERROR);
				jsonObjectOut.put("errorDescription", CargoErrorList.SYSTEM_ERROR_DESCRIPTION);
			} catch (final Exception e) {
				LogWriter.writeLog(LHPVAjaxAction.TRACE_ID, LogWriter.LOG_LEVEL_ERROR, ""+e);
				e.printStackTrace();
			}
			out.println(jsonObjectOut);
		} finally {
			out.flush();
			out.close();
			out							= null;
			jsonObjectIn				= null;
			jsonObjectOut				= null;
		}
	}

	private JSONObject initialize(HttpServletRequest request, JSONObject jsonObjectOut) throws Exception {
		Executive					executive									= null;
		ValueObject					valObjOut									= null;
		CacheManip					cache										= null;
		Map<Object, Object>			configuration								= null;
		Map<Long, ExecutiveFeildPermissionDTO>	executiveFeildPermissionsHM		= null;
		short	 					manualLHPVDaysAllowed						= 0;
		var						isAllowBackDateInAutoLhpv					= false;
		var						isAllowManualLhpv							= false;
		Map<Object, Object>			tdsConfiguration							= null;
		var						sameSequenceForLsAndLhpv					= false;
		var 					disableLhpvCharges 							= false;
		List<Long>					lhpvChargeIdsToDisableList					= null;

		try {
			valObjOut			= JsonUtility.convertJsontoValueObject(jsonObjectOut);

			cache				= new CacheManip(request);

			executive					= cache.getExecutive(request);
			manualLHPVDaysAllowed		= cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_MAX_DAYS_OF_OPERATION_BEFORE_CASHSTATEMENT_ENTRY_ID);
			executiveFeildPermissionsHM	= cache.getExecutiveFieldPermission(request);
			tdsConfiguration			= cache.getTDSConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.LHPV);
			configuration				= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.LHPV);
			sameSequenceForLsAndLhpv	= (Boolean) configuration.getOrDefault(LHPVPropertiesConstant.SAME_SEQUENCE_FOR_LS_AND_LHPV, false);
			disableLhpvCharges			= (Boolean) configuration.getOrDefault(LHPVPropertiesConstant.DISABLE_LHPV_CHARGES, false);

			isAllowBackDateInAutoLhpv	= executiveFeildPermissionsHM.get(FeildPermissionsConstant.BACK_DATE_IN_AUTO_LHPV) != null;
			isAllowManualLhpv			= executiveFeildPermissionsHM.get(FeildPermissionsConstant.ALLOW_MANUAL_LHPV) != null;

			if(disableLhpvCharges)
				lhpvChargeIdsToDisableList	= CollectionUtility.getLongListFromString((String) configuration.getOrDefault(LHPVPropertiesConstant.LHPV_CHARGE_IDS_TO_DISABLE, null));

			valObjOut.put(AliasNameConstants.EXECUTIVE, Converter.DtoToHashMap(executive));
			valObjOut.put(LHPVPropertiesConstant.LHPV_CONFIGURATION, configuration);
			valObjOut.put("ManualLHPVDaysAllowed", manualLHPVDaysAllowed);
			valObjOut.put("VehicleDetails", false);
			valObjOut.put("isAllowBackDateInAutoLhpv", isAllowBackDateInAutoLhpv);
			valObjOut.put("isAllowManualLhpv", isAllowManualLhpv);
			valObjOut.put(TDSPropertiesConstant.TDS_CONFIGURATION, tdsConfiguration);
			valObjOut.put("sameSequenceForLsAndLhpv", sameSequenceForLsAndLhpv);
			valObjOut.put("disableLhpvCharges", disableLhpvCharges);
			valObjOut.put("lhpvChargeIdsToDisableList", lhpvChargeIdsToDisableList);

			if((boolean) configuration.getOrDefault(LHPVPropertiesConstant.IS_TRUCK_LOAD_TYPE_REQUIRED, false))
				valObjOut.put("truckLoadType", LHPVConstant.getLHPVTruckLoadTYpe());

			JsonConstant.getInstance().setOutputConstantForLHPVModule(valObjOut);

			return JsonUtility.convertionToJsonObjectForResponse(valObjOut);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private JSONObject getDataToCreateLHPVByVehicleNumber(HttpServletRequest request, JSONObject jsonObjectOut, JSONObject jsonObjectIn) throws Exception {
		LorryHire 									lorryHire 							= null;
		LHPV 										lhpv 								= null;
		ValueObject									valueObjectFromBLL					= null;
		DispatchLedger[] 							dispatchLedgerArr 					= null;
		String 										lhpvNo								= null;
		var 										ddmInterBranchLSNoForAppend 		= "";
		var  										vehicleMasterId						= 0L;
		short										typeOfLHPV							= 0;

		try {
			final var	cacheManip			= new CacheManip(request);
			final var	executive			= cacheManip.getExecutive(request);
			final var	valueObjectIn		= JsonUtility.convertJsontoValueObject(jsonObjectIn);
			final var	valueObjectOut		= JsonUtility.convertJsontoValueObject(jsonObjectOut);

			final var	minDateTimeStamp	= cacheManip.getModuleWiseMinDateToGetData(request, executive.getAccountGroupId(),
					ModuleWiseMinDateSelectionConfigurationDTO.LHPV_MIN_DATE_ALLOW,
					ModuleWiseMinDateSelectionConfigurationDTO.LHPV_MIN_DATE);

			final Map<Long, ExecutiveFeildPermissionDTO>	executiveFeildPermissions	= cacheManip.getExecutiveFieldPermission(request);

			final var	isInterBranchLSAllowForCreateLHPV = executiveFeildPermissions != null && executiveFeildPermissions.get(FeildPermissionsConstant.CREATE_LHPV_FOR_INTER_BRANCH_LS) != null;

			final var	configValue 			= cacheManip.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_TRUCK_ENGAGEMENT_FOR_GROUP);
			final var	configValueForJagruti 	= cacheManip.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_JAGRUTI_LHPV_CALCULATION_FOR_GROUP);

			if(valueObjectIn.containsKey("vehicleMasterId"))
				vehicleMasterId = Long.parseLong(valueObjectIn.get("vehicleMasterId").toString());
			else if(valueObjectIn.containsKey("lhpvNo"))
				lhpvNo			= valueObjectIn.get("lhpvNo").toString();

			if(valueObjectIn.containsKey("ddmInterBranchLSNoForAppend"))
				ddmInterBranchLSNoForAppend 	= valueObjectIn.get("ddmInterBranchLSNoForAppend").toString();

			final var	configuration						= cacheManip.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.LHPV);
			final var	calculateAdvanceFromTruckDlyTopayLR	= (Boolean) configuration.getOrDefault(LHPVPropertiesConstant.CALCULATE_ADVANCE_FROM_TRUCK_DLY_TOPAY_LR, false);
			final var	calculateAdvanceFromTopayLRTotal	= (Boolean) configuration.getOrDefault(LHPVPropertiesConstant.CALCULATE_ADVANCE_FROM_TOPAY_LR_TOTAL, false);
			final var	checkLhpvLsAvailabilityForExecutive	= (Boolean) configuration.getOrDefault(LHPVPropertiesConstant.CHECK_LHPV_LS_AVAILABILITY_FOR_EXECUTIVE, false);
			final short	lhpvLsAvailabilityBy				= Utility.getShort(configuration.getOrDefault(LHPVPropertiesConstant.LHPV_LS_AVAILABILITY_BY, "0").toString());
			final var	subRegionWiseLhpvCreation			= (Boolean) configuration.getOrDefault(LHPVPropertiesConstant.SUB_REGION_WISE_LHPV_CREATION, false);
			final var	branchWiseLhpvCreation				= (Boolean) configuration.getOrDefault(LHPVPropertiesConstant.BRANCH_WISE_LHPV_CREATION, false);

			if((boolean) configuration.getOrDefault(LHPVPropertiesConstant.LHPV_OF_DDM, false))
				typeOfLHPV		= Short.parseShort(valueObjectIn.get("typeOfLHPV").toString());
			else
				typeOfLHPV		= LHPVConstant.TYPE_OF_LHPV_ID_NORMAL;

			valueObjectIn.put("vehicleMasterId", vehicleMasterId);
			valueObjectIn.put(AliasNameConstants.EXECUTIVE, executive);
			valueObjectIn.put("branchColl", cacheManip.getGenericBranchesDetail(request));
			valueObjectIn.put("subregionColl", cacheManip.getAllSubRegionDataForGroup(request, executive.getAccountGroupId()));
			valueObjectIn.put("isInterBranchLSAllowForCreateLHPV", isInterBranchLSAllowForCreateLHPV);
			valueObjectIn.put("configValue", configValue);
			valueObjectIn.put("executive", executive);
			valueObjectIn.put("ddmInterBranchLSNoForAppend", ddmInterBranchLSNoForAppend);
			valueObjectIn.put("lhpvNo", lhpvNo);
			valueObjectIn.put("configValueForJagruti", configValueForJagruti);
			valueObjectIn.put(LHPVPropertiesConstant.CALCULATE_ADVANCE_FROM_TRUCK_DLY_TOPAY_LR, calculateAdvanceFromTruckDlyTopayLR);
			valueObjectIn.put(LHPVPropertiesConstant.CALCULATE_ADVANCE_FROM_TOPAY_LR_TOTAL, calculateAdvanceFromTopayLRTotal);
			valueObjectIn.put("checkLhpvLsAvailabilityForExecutive", checkLhpvLsAvailabilityForExecutive);
			valueObjectIn.put("lhpvLsAvailabilityBy", lhpvLsAvailabilityBy);
			valueObjectIn.put("typeOfLHPV", typeOfLHPV);
			valueObjectIn.put(AliasNameConstants.MIN_DATE_TIMESTAMP, minDateTimeStamp);
			valueObjectIn.put("subRegionWiseLhpvCreation", subRegionWiseLhpvCreation);
			valueObjectIn.put("branchWiseLhpvCreation", branchWiseLhpvCreation);

			if(typeOfLHPV == LHPVConstant.TYPE_OF_LHPV_ID_NORMAL)
				valueObjectFromBLL 	= LHPVBLL.getInstance().getLSDetailsFromLoadingSheet(valueObjectIn);
			else if(typeOfLHPV == LHPVConstant.TYPE_OF_LHPV_ID_DDM)
				valueObjectFromBLL	= LHPVBLL.getInstance().getDDMDetailsToCreateLHPV(valueObjectIn);

			if(valueObjectFromBLL != null) {
				dispatchLedgerArr 	= (DispatchLedger[]) valueObjectFromBLL.get("dispatchLedgerArr");
				lorryHire 			= (LorryHire) valueObjectFromBLL.get("lorryHire");
				lhpv 				= (LHPV) valueObjectFromBLL.get("lhpv");
			}

			if(dispatchLedgerArr != null && dispatchLedgerArr.length > 0) {
				final var	vehicle = cacheManip.getVehicleNumber(request, executive.getAccountGroupId(), dispatchLedgerArr[0].getVehicleNumberMasterId());

				valueObjectOut.put("dispatchLedgerJsonArray", Converter.arrayDtotoArrayListWithHashMapConversion(dispatchLedgerArr));

				if(vehicle != null)
					valueObjectOut.put("vehicle", Converter.DtoToHashMap(vehicle));

				if(lorryHire != null)
					valueObjectOut.put("lorryHirejsonObj", Converter.DtoToHashMap(lorryHire));

				if(lhpv != null)
					valueObjectOut.put("lhpvjsonObj", Converter.DtoToHashMap(lhpv));

				valueObjectOut.put("configValueForJagruti", configValueForJagruti);
				valueObjectOut.put("typeOfLHPV", typeOfLHPV);
			} else
				valueObjectOut.put("error", "" + CargoErrorList.NO_RECORDS_DESCRIPTION);

			return JsonUtility.convertionToJsonObjectForResponse(valueObjectOut);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private JSONObject getDataToCreateLHPVLSNumber(HttpServletRequest request, JSONObject jsonObjectOut, JSONObject jsonObjectIn) throws Exception {
		DispatchLedger[] 			dispatchLedgerArr 				= null;

		try {
			final var	cacheManip					= new CacheManip(request);

			final var	executive					= cacheManip.getExecutive(request);
			final var	valueObjectIn				= JsonUtility.convertJsontoValueObject(jsonObjectIn);
			final var	valueObjectOut				= JsonUtility.convertJsontoValueObject(jsonObjectOut);

			final var	minDateTimeStamp			= cacheManip.getModuleWiseMinDateToGetData(request, executive.getAccountGroupId(),
					ModuleWiseMinDateSelectionConfigurationDTO.LHPV_MIN_DATE_ALLOW,
					ModuleWiseMinDateSelectionConfigurationDTO.LHPV_MIN_DATE);

			final var	configuration	= cacheManip.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.LHPV);

			valueObjectIn.put(AliasNameConstants.EXECUTIVE, executive);
			valueObjectIn.put("branchColl", cacheManip.getGenericBranchesDetail(request));
			valueObjectIn.put("subregionColl", cacheManip.getAllSubRegionDataForGroup(request, executive.getAccountGroupId()));
			valueObjectIn.put(AliasNameConstants.LS_NUMBER, valueObjectIn.get("lsNumber").toString());
			valueObjectIn.put(AliasNameConstants.MIN_DATE_TIMESTAMP, minDateTimeStamp);
			valueObjectIn.put(LHPVPropertiesConstant.LHPV_CONFIGURATION, configuration);

			final var	valueObjectFromBLL			= LHPVBLL.getInstance().getLHPVDataFromDispatchByLSNumber(valueObjectIn);

			if(valueObjectFromBLL != null)
				dispatchLedgerArr = (DispatchLedger[]) valueObjectFromBLL.get("dispatchLedgerArr");

			if(dispatchLedgerArr != null && dispatchLedgerArr.length > 0) {
				final var	vehicle = cacheManip.getVehicleNumber(request, executive.getAccountGroupId(), dispatchLedgerArr[0].getVehicleNumberMasterId());

				valueObjectOut.put("dispatchLedgerJsonArray", Converter.arrayDtotoArrayListWithHashMapConversion(dispatchLedgerArr));

				if(vehicle != null)
					valueObjectOut.put("vehicle", Converter.DtoToHashMap(vehicle));
			} else
				valueObjectOut.put("error", "" + CargoErrorList.NO_RECORDS_DESCRIPTION);

			return JsonUtility.convertionToJsonObjectForResponse(valueObjectOut);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private JSONObject getLHPVDataToPrint(HttpServletRequest request, JSONObject jsonObjectIn) throws Exception {
		try {
			final var	lhpvPrintBLL		= new LHPVPrintBLL();
			final var	cacheManip			= new CacheManip(request);
			final var	reportView			= new ReportView();
			var			reportViewModel		= new ReportViewModel();

			final var	executive			= cacheManip.getExecutive(request);
			final var	valObjIn			= JsonUtility.convertJsontoValueObject(jsonObjectIn);
			final var	executiveFeildPermissionsHM	= cacheManip.getExecutiveFieldPermission(request);

			final var	showDestinationRegionWisePrint	= executiveFeildPermissionsHM.get(FeildPermissionsConstant.SHOW_DESTINATION_REGION_WISE_LHPV_PRINT) != null;

			valObjIn.put(AliasNameConstants.EXECUTIVE, executive);

			final var	allBranches			= cacheManip.getGenericBranchesDetail(request);

			final var	branch		= (Branch) allBranches.get(executive.getBranchId() + "");

			valObjIn.put(AliasNameConstants.ALL_BRANCHES, allBranches);
			valObjIn.put(AliasNameConstants.ACCOUNT_GROUP, cacheManip.getAccountGroupById(request, executive.getAccountGroupId()));
			valObjIn.put(AliasNameConstants.ALL_SUB_REGIONS, cacheManip.getAllSubRegions(request));
			valObjIn.put(AliasNameConstants.ALL_REGIONS, cacheManip.getAllRegions(request));
			valObjIn.put(AliasNameConstants.ACCOUNT_GROUP, cacheManip.getAccountGroupByAccountGroupId(request, executive.getAccountGroupId()));
			valObjIn.put(LhpvPrintConfigurationConstant.LHPV_PRINT_CONFIGURATION, cacheManip.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.LHPV_PRINT));

			final var	valObjOut			= lhpvPrintBLL.getDataToPrintLHPV(valObjIn);
			request.setAttribute("customAddressBranchId", valObjOut.get("customAddressBranchId"));
			request.setAttribute("customAddressIdentifer", valObjOut.get("customAddressIdentifer"));
			valObjOut.put(AliasNameConstants.EXECUTIVE, Converter.DtoToHashMap(executive));
			valObjOut.put("LoggedInBranchDetails", Converter.DtoToHashMap(branch));

			if(request.getParameter("isOriginal") != null)
				valObjOut.put("isOriginal", Boolean.parseBoolean(request.getParameter("isOriginal").toString()));

			reportViewModel		= reportView.populateReportViewModel(request, reportViewModel);

			valObjOut.put("ReportViewModel", Converter.DtoToHashMap(reportViewModel));
			valObjOut.put("truckLoadTypeConstant", LHPVConstant.getLHPVTruckLoadTYpe());
			valObjOut.put("showDestinationRegionWisePrint", showDestinationRegionWisePrint);

			JsonConstant.getInstance().setOutputConstantForLHPVModule(valObjOut);

			return JsonUtility.convertionToJsonObjectForResponse(valObjOut);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private JSONObject getLHPVNumberOnVechileNumber(JSONObject jsonObjectIn) throws Exception {
		try {
			final var	valObjIn			= JsonUtility.convertJsontoValueObject(jsonObjectIn);
			final var	outValObj			= LHPVBLL.getInstance().getLHPVNumberByVechileNumber(valObjIn);

			return JsonUtility.convertionToJsonObjectForResponse(outValObj);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}
}
