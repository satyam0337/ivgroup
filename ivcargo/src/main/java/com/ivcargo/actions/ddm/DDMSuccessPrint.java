package com.ivcargo.actions.ddm;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.DispatchBLL;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.constant.properties.DDMConfigurationConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.utils.exception.ExceptionProcess;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.DeliveryContactDetailsDao;
import com.platform.resource.CargoErrorList;

public class DDMSuccessPrint implements Action{

	public static final String TRACE_ID = "DDMSuccessPrint";

	@SuppressWarnings("unchecked")
	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		var				deliveryRunSheetLedgerId 		= 0L;

		try {
			final var cacheManip 	= new CacheManip(request);

			var error = (HashMap<String, Object>) request.getAttribute("error");

			if(request.getParameter("deliveryRunSheetLedgerId") != null) {
				deliveryRunSheetLedgerId	= JSPUtility.GetLong(request, "deliveryRunSheetLedgerId");
				request.setAttribute("deliveryRunSheetLedgerId", deliveryRunSheetLedgerId);
				request.setAttribute("DDMNo", JSPUtility.GetString(request, "DDMNo"));
			}

			final var executive	= cacheManip.getExecutive(request);

			if(executive == null) {
				if(error == null) error	= new HashMap<>();

				error.put("errorCode", CargoErrorList.SESSION_INVALID);
				error.put("errorDescription", CargoErrorList.SESSION_INVALID_DESCRIPTION);
				ActionStaticUtil.setRequestAttribute(request, "cargoError", error);
				ActionStaticUtil.setNextPageToken(request, ActionStaticUtil.NEEDLOGIN);
				return;
			}

			final var ddmPropertiesHM 	= cacheManip.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.CREATE_DDM);

			if((boolean) ddmPropertiesHM.getOrDefault(DDMConfigurationConstant.LR_WISE_CR_PRINT, false) && deliveryRunSheetLedgerId > 0) {
				final var dispatchBLL = new DispatchBLL();

				request.setAttribute("Waybills", dispatchBLL.createModelForPrint(deliveryRunSheetLedgerId,(short)1));
				request.setAttribute("isLRWiseCRTableShow", true);
				request.setAttribute("isLRWiseCRTableShowForNewFlow", (boolean) ddmPropertiesHM.getOrDefault(DDMConfigurationConstant.LR_WISE_CR_PRINT_FOR_NEW_FLOW, false));
				request.setAttribute("deliveryContactDetails", DeliveryContactDetailsDao.getInstance().getDeliveryContactDetailsForCRPrint(deliveryRunSheetLedgerId));
				request.setAttribute("isWsCrPrintNeeded", (boolean) ddmPropertiesHM.getOrDefault(DDMConfigurationConstant.IS_WS_CR_PRINT_NEEDED, false));
				request.setAttribute("hideChargesIfDoorDelivery", (boolean) ddmPropertiesHM.getOrDefault(DDMConfigurationConstant.HIDE_CHARGES_IF_DOOR_DELIVERY, false));
				request.setAttribute(DDMConfigurationConstant.MULTIPLE_CR_PRINT_AT_SINGLE_CLICK, (boolean) ddmPropertiesHM.getOrDefault(DDMConfigurationConstant.MULTIPLE_CR_PRINT_AT_SINGLE_CLICK, false));
				request.setAttribute("multiCRPrintNeeded", (boolean) ddmPropertiesHM.getOrDefault(DDMConfigurationConstant.MULTI_CRPRINT_NEEDED, false));
				request.setAttribute(DDMConfigurationConstant.IS_ALLOW_LR_WISE_CR_PRINT_FROM_NEW_FLOW, (boolean) ddmPropertiesHM.getOrDefault(DDMConfigurationConstant.IS_ALLOW_LR_WISE_CR_PRINT_FROM_NEW_FLOW, false));
			}
			request.setAttribute("isWsDDMPrintNeeded", (boolean) ddmPropertiesHM.getOrDefault(DDMConfigurationConstant.IS_WS_DDM_PRINT_NEEDED, false));
			request.setAttribute("BranchId", executive.getBranchId());
			request.setAttribute("BranchName", cacheManip.getBranchById(request, executive.getAccountGroupId(), executive.getBranchId()).getName());

			if(error != null && error.size() > 0 && error.containsKey("errorCode")) {
				request.setAttribute("cargoError", error);
				request.setAttribute("nextPageToken", "needlogin");
			} else
				request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			e.printStackTrace();
			ExceptionProcess.execute(e, TRACE_ID);
		}

	}
}
