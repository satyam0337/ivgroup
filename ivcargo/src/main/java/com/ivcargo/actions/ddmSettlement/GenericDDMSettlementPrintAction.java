package com.ivcargo.actions.ddmSettlement;

import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.ddmSettlement.DDMSettlementPrintBLL;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.constant.properties.DDMSettlementPropertiesConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.properties.constant.DisplayDataWithinDateRangePropertiesConstant;
import com.iv.utils.constant.Constant;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.AliasNameConstants;
import com.platform.dto.Executive;
import com.platform.resource.CargoErrorList;

public class GenericDDMSettlementPrintAction implements Action {

	public static final String 		TRACE_ID 		= "GenericDDMSettlementPrintAction";

	Executive                  		executive		= null;
	CacheManip       				cache           = null;

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	 			error 							= null;
		ValueObject 						inValObj        	 			= null;
		Map<Object, Object>					ddmSettlemetnPropertiesHM		= null;
		DDMSettlementPrintBLL				ddmSettlementPrintBLL			= null;
		ValueObject 						valOutObj 						= null;
		String								isSearchModule					= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			cache					= new CacheManip(request);
			executive 				= cache.getExecutive(request);
			inValObj         		= new ValueObject();
			final var deliveryRunSheetLedgerId   = JSPUtility.GetLong(request, "deliveryRunSheetLedgerId");
			isSearchModule			= JSPUtility.GetString(request, "isSearchModule", "false");

			var displayDataConfig	= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.DISPLAY_DATA_CONFIGURATION);

			displayDataConfig.put(Constant.EXEC_FEILD_PERMISSION, cache.getExecutiveFieldPermission(request));
			displayDataConfig.put(Constant.EXECUTIVE_TYPE, executive.getExecutiveType());

			inValObj.put(AliasNameConstants.DELIVERY_RUN_SHEET_LEDGER_ID, deliveryRunSheetLedgerId);
			inValObj.put(AliasNameConstants.EXECUTIVE, executive);
			inValObj.put(AliasNameConstants.ALL_BRANCHES, cache.getGenericBranchesDetail(request));
			inValObj.put(AliasNameConstants.ALL_SUBREGIONS, cache.getAllSubRegions(request));
			inValObj.put(AliasNameConstants.ACCOUNT_GROUP, cache.getAccountGroupById(request, executive.getAccountGroupId()));
			inValObj.put(DisplayDataWithinDateRangePropertiesConstant.DISPLAY_DATA_CONFIGURATION_CONSTANT, displayDataConfig);

			ddmSettlementPrintBLL	= new DDMSettlementPrintBLL();
			valOutObj				= ddmSettlementPrintBLL.getDDMSettlementPrintData(inValObj);

			if(valOutObj == null) {
				error.put("errorCode", CargoErrorList.NO_RECORDS);
				error.put("errorDescription", CargoErrorList.NO_RECORDS_DESCRIPTION);
				request.setAttribute("cargoError", error);
				request.setAttribute("nextPageToken", "success_"+executive.getAccountGroupId());
				return;
			}

			ddmSettlemetnPropertiesHM	= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.DDM_SETTLEMENT);

			request.setAttribute("ReportViewModel", valOutObj.get("ReportViewModel"));
			request.setAttribute("LoggedInBranchDetails", valOutObj.get("LoggedInBranchDetails"));
			request.setAttribute("ddmSettlementSummaryModel", valOutObj.get("ddmSettlementSummaryModel"));
			request.setAttribute("srcWiseCrossingColl", valOutObj.get("srcWiseCrossingColl"));
			request.setAttribute("dispatchLedger", valOutObj.get("dispatchLedger"));
			request.setAttribute("wayBillViewList", valOutObj.get("wayBillViewList"));
			request.setAttribute("Type",valOutObj.get("Type"));
			request.setAttribute(DDMSettlementPropertiesConstant.DDM_SETTLEMENT_DETAILS_PRINT_IN_DDM_PRINT, (boolean) ddmSettlemetnPropertiesHM.getOrDefault(DDMSettlementPropertiesConstant.DDM_SETTLEMENT_DETAILS_PRINT_IN_DDM_PRINT,false));

			if("true".equals(isSearchModule))
				request.setAttribute("isSearchModule",true);

			if((boolean) ddmSettlemetnPropertiesHM.getOrDefault(DDMSettlementPropertiesConstant.GROUP_SPECIFIC_DDM_SETTLEMENT_PRINT, false))
				request.setAttribute("nextPageToken", "success_" + executive.getAccountGroupId());
			else
				ActionStaticUtil.setNextPageToken(request, ActionStaticUtil.SUCCESS);
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}
	}
}