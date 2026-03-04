package com.ivcargo.actions.transport;

//~--- non-JDK imports --------------------------------------------------------

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.properties.impl.PropertyConfigValueBLLImpl;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.constant.properties.BLhpvPrintConfigurationConstant;
import com.iv.constant.properties.lhpv.LHPVPropertiesConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.properties.constant.CrossingAgentBillPropertiesConstant;
import com.iv.properties.constant.LoadingSheetPropertyConstant;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.reports.CrossingAgentBillClearanceDAO;
import com.platform.dto.PropertiesFileConstants;
import com.platform.dto.configuration.modules.LsPrintConfigurationDTO;

public class TransportDispatchLedgerIdAction implements Action {

	public static final String TRACE_ID = "TransportDispatchLedgerIdAction";

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {

		HashMap<String, Object>	 	error 							= null;
		var 						dispatchLedgerId 				= 0L;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request, error))
				return;

			final var	cacheManip	= new CacheManip(request);
			final var	executive 					= cacheManip.getExecutive(request);

			final var	propertyConfigValueBLLImpl	= PropertyConfigValueBLLImpl.getInstance();
			final var	lhpvConfigHM				= cacheManip.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.LHPV);
			final var	crossingLsConfiguration		= cacheManip.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.CROSSING_AGENT_BILL);
			final var	lsConfiguration				= cacheManip.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.DISPATCH);
			final var	blhpvConfiguration			= cacheManip.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.BLHPV_PRINT);
			final var	dispatchLsPrintConfiguration= propertyConfigValueBLLImpl.getConfiguration(executive, PropertiesFileConstants.LS_PRINT_LOAD_CONFIG);

			request.setAttribute(LHPVPropertiesConstant.LHPV_PRINT_FROM_NEW_FLOW, lhpvConfigHM.getOrDefault(LHPVPropertiesConstant.LHPV_PRINT_FROM_NEW_FLOW, false));
			request.setAttribute("AdvCreateInvoiceBillShow", crossingLsConfiguration.getOrDefault(CrossingAgentBillPropertiesConstant.ADV_CREATE_INVOICE_BILL_SHOW, false));
			request.setAttribute("doNotOpenPrintPopupAfterDispatch", lsConfiguration.getOrDefault(LoadingSheetPropertyConstant.DO_NOT_OPEN_PRINT_POPUP_AFTER_DISPATCH, false));
			request.setAttribute("defaultDispatchPrint", dispatchLsPrintConfiguration.getBoolean(LsPrintConfigurationDTO.DEFAULT_DISPATCH_PRINT, false));
			request.setAttribute("dispatchPrintFromOldFlow", dispatchLsPrintConfiguration.getBoolean(LsPrintConfigurationDTO.DISPATCH_PRINT_FROM_OLD_FLOW, false));
			request.setAttribute("blhpvPrintFromNewFlow", blhpvConfiguration.getOrDefault(BLhpvPrintConfigurationConstant.BLHPV_PRINT_FROM_NEW_FLOW, false));
			request.setAttribute(LsPrintConfigurationDTO.SHOW_DIFFERENT_LS_SUMMARY_PRINT, dispatchLsPrintConfiguration.getBoolean(LsPrintConfigurationDTO.SHOW_DIFFERENT_LS_SUMMARY_PRINT, false));
			request.setAttribute("isAllowLsPrintLocking", dispatchLsPrintConfiguration.getBoolean(LsPrintConfigurationDTO.IS_ALLOW_LS_PRINT_LOCKING, false));

			if (request.getParameter("wayBillId") != null)
				request.setAttribute("wayBillId", JSPUtility.GetLong(request, "wayBillId"));

			if (request.getParameter("dispatchLedgerId") != null && request.getParameter("Type") != null) {
				dispatchLedgerId	= JSPUtility.GetLong(request, "dispatchLedgerId");
				request.setAttribute("dispatchLedgerId", dispatchLedgerId);
				request.setAttribute("Type", JSPUtility.GetString(request, "Type"));

				final var	crossingAgentBillClearance 	= CrossingAgentBillClearanceDAO.getInstance().getCrossingAgentBillClearanceDetails(dispatchLedgerId);

				request.setAttribute("crossingAgentBillClearance", crossingAgentBillClearance);
			}

			if(request.getParameter("lhpvId") != null)
				request.setAttribute("lhpvId", request.getParameter("lhpvId"));

			if(request.getParameter("DataByBranchId") != null)
				request.setAttribute("DataByBranchId", request.getParameter("DataByBranchId"));

			if(request.getParameter("NotDispatchedWB") != null)
				request.setAttribute("NotDispatchedWB", request.getParameter("NotDispatchedWB"));

			if (request.getParameter("typeOfLHPV") != null)
				request.setAttribute("typeOfLHPV", request.getParameter("typeOfLHPV"));

			request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}

}