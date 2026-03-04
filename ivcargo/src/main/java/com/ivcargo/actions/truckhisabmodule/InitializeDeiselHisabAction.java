package com.ivcargo.actions.truckhisabmodule;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.constant.properties.PumpReceiptConfigurationConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.Executive;

public class InitializeDeiselHisabAction implements Action {

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		// TODO Auto-generated method stub
		HashMap<String,Object>	 						error 							= null;
		Executive										executive						= null;
		var											showAllVehicleData				= false;
		var											manualFuelUnitRate				= false;
		var											defaultReceipt					= false;
		var											showDDMSelection				= false;
		var											validateFuelUnitRate			= false;
		var											showOpeningClosingKM			= false;
		var											showInterBranchLsSelection		= false;
		var											mandotaryLhpvForRouteAndBoth	= false;
		var											mandotaryDDMAndIntLSForLocal	= false;
		var											validateClosingKM				= false;
		var											autoCalculateFuelInLiter		= false;
		var											showFuelUnitRateInDecimal		= false;

		try {

			error 		= ActionStaticUtil.getSystemErrorColl(request);
			final var cache	= new CacheManip(request);
			executive	= cache.getExecutive(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	pumpReceiptConf	= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.PUMP_RECEIPT);
			showAllVehicleData				= (Boolean) pumpReceiptConf.getOrDefault(PumpReceiptConfigurationConstant.SHOW_ALL_VEHICLE_DATA, false);
			defaultReceipt					= (Boolean) pumpReceiptConf.getOrDefault(PumpReceiptConfigurationConstant.DEFAULT_RECEIPT, false);
			showDDMSelection				= (Boolean) pumpReceiptConf.getOrDefault(PumpReceiptConfigurationConstant.SHOW_DDM_SELECTION, false);
			validateFuelUnitRate			= (Boolean) pumpReceiptConf.getOrDefault(PumpReceiptConfigurationConstant.VALIDATE_FUEL_UNIT_RATE, false);
			showOpeningClosingKM			= (Boolean) pumpReceiptConf.getOrDefault(PumpReceiptConfigurationConstant.SHOW_OPENING_CLOSING_KM, false);
			manualFuelUnitRate				= (Boolean) pumpReceiptConf.getOrDefault(PumpReceiptConfigurationConstant.MANUAL_FUEL_UNIT_RATE, false);
			showInterBranchLsSelection		= (Boolean) pumpReceiptConf.getOrDefault(PumpReceiptConfigurationConstant.SHOW_INTER_BRANCH_LS_SELECTION, false);
			mandotaryLhpvForRouteAndBoth	= (Boolean) pumpReceiptConf.getOrDefault(PumpReceiptConfigurationConstant.MANDOTARY_LHPV_FOR_ROUTE_AND_BOTH, false);
			mandotaryDDMAndIntLSForLocal	= (Boolean) pumpReceiptConf.getOrDefault(PumpReceiptConfigurationConstant.MANDOTARY_DDM_AND_INT_LS_FOR_LOCAL, false);
			validateClosingKM				= (Boolean) pumpReceiptConf.getOrDefault(PumpReceiptConfigurationConstant.VALIDATE_CLOSING_KM, false);
			autoCalculateFuelInLiter		= (Boolean) pumpReceiptConf.getOrDefault(PumpReceiptConfigurationConstant.AUTO_CALCULATE_FUEL_IN_LITER, false);
			showFuelUnitRateInDecimal		= (Boolean) pumpReceiptConf.getOrDefault(PumpReceiptConfigurationConstant.SHOW_FUEL_UNIT_RATE_IN_DECIMAL, false);

			request.setAttribute("showAllVehicleData", showAllVehicleData);
			request.setAttribute("manualFuelUnitRate", manualFuelUnitRate);
			request.setAttribute("showDDMSelection", showDDMSelection);
			request.setAttribute("validateFuelUnitRate", validateFuelUnitRate);
			request.setAttribute("showOpeningClosingKM", showOpeningClosingKM);
			request.setAttribute("showInterBranchLsSelection", showInterBranchLsSelection);
			request.setAttribute("mandotaryLhpvForRouteAndBoth", mandotaryLhpvForRouteAndBoth);
			request.setAttribute("mandotaryDDMAndIntLSForLocal", mandotaryDDMAndIntLSForLocal);
			request.setAttribute("validateClosingKM", validateClosingKM);
			request.setAttribute("autoCalculateFuelInLiter", autoCalculateFuelInLiter);
			request.setAttribute("showFuelUnitRateInDecimal", showFuelUnitRateInDecimal);

			if(defaultReceipt)
				request.setAttribute("nextPageToken", "success");
			else
				request.setAttribute("nextPageToken", "success_"+executive.getAccountGroupId());

		} catch (final Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		}
	}

}
