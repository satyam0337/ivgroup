package com.ivcargo.actions.ddmSettlement;

import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.constant.properties.DDMSettlementPropertiesConstant;
import com.iv.logsapp.LogWriter;
import com.iv.utils.constant.Constant;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.Executive;
import com.platform.dto.constant.ModuleIdentifierConstant;

public class DDMSettlementSuccessPrintAction implements Action {

	public static final String TRACE_ID = "DDMSettlementSuccessPrintAction";

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		try {
			final HashMap<String, Object>	error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request, error))
				return;

			request.setAttribute(Constant.DELIVERY_RUN_SHEET_LEDGER_ID, JSPUtility.GetLong(request, Constant.DELIVERY_RUN_SHEET_LEDGER_ID, 0));
			request.setAttribute("deliveryContactDetailsId", JSPUtility.GetLong(request, "deliveryContactDetailsId", 0));

			final CacheManip	cache			= new CacheManip(request);
			final Executive		executive		= cache.getExecutive(request);

			final Map<Object, Object>	ddmSettlementPrintConfig	= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.DDM_SETTLEMENT);

			request.setAttribute(DDMSettlementPropertiesConstant.DDM_SETTLEMENT_DETAILS_PRINT_IN_DDM_PRINT, (boolean) ddmSettlementPrintConfig.getOrDefault(DDMSettlementPropertiesConstant.DDM_SETTLEMENT_DETAILS_PRINT_IN_DDM_PRINT, false));
			request.setAttribute(Constant.MODULE_ID, JSPUtility.GetLong(request, "moduleIdentifier", 0));
			request.setAttribute(Constant.MR_NUMBER, JSPUtility.GetString(request, Constant.MR_NUMBER, null));
			request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			e.printStackTrace();
			LogWriter.writeLog("LOGINVALIDATOR", LogWriter.LOG_LEVEL_ERROR, e);
		}

	}
}
