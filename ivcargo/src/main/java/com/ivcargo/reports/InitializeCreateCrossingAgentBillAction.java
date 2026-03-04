package com.ivcargo.reports;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.constant.properties.ConfigParamPropertiesConstant;
import com.iv.dto.constant.FeildPermissionsConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.properties.constant.CrossingAgentBillPropertiesConstant;
import com.iv.utils.DateTime.DateTimeUtility;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.reports.CrossingAgentBillPaymentDAO;

public class InitializeCreateCrossingAgentBillAction implements Action {

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	 			error 									= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	cManip			= new CacheManip(request);
			final var	executive 		= cManip.getExecutive(request);

			final var	configuration					= cManip.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.CROSSING_AGENT_BILL);
			final var	configParamConfiguration		= cManip.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.CONFIG_PARAM);
			final var	isBookingAgent					= (boolean) configuration.getOrDefault(CrossingAgentBillPropertiesConstant.IS_BOOKING_AGENT, false);
			final var	isLrWiseCrossingAgentBill	 	= (boolean) configuration.getOrDefault(CrossingAgentBillPropertiesConstant.IS_LR_WISE_CROSSING_AGENT_BILL, false);

			final var	noOfDays						= (int) configParamConfiguration.getOrDefault(ConfigParamPropertiesConstant.DAYS_FOR_MANUAL_CROSSING_INVOICE, 0);
			final var	previousDate					= DateTimeUtility.getDateBeforeNoOfDays(noOfDays);

			final var	exHashMap	= cManip.getExecutiveFieldPermission(request);

			request.setAttribute("isShowCrossingAgentType", (boolean) configuration.getOrDefault(CrossingAgentBillPropertiesConstant.IS_SHOW_CROSSING_AGENT_TYPE, false));
			request.setAttribute("isShowBLHPVAmount", (boolean) configuration.getOrDefault(CrossingAgentBillPropertiesConstant.IS_SHOW_BLHPV_AMOUNT, false));
			request.setAttribute("showselectdateoption", (boolean) configuration.getOrDefault(CrossingAgentBillPropertiesConstant.SHOW_SELECT_DATE_OPTION , false));
			request.setAttribute("isAllowManualCrossingAgentInvoice", exHashMap.get(FeildPermissionsConstant.ALLOW_MANUAL_CROSSING_AGENT_INVOICE) != null);

			final var	branchIds				= cManip.getBranchIdsByExecutiveType(request, executive);

			request.setAttribute("noOfDays",noOfDays);
			request.setAttribute("previousDate", previousDate);
			request.setAttribute("CrossingAgentDetails", CrossingAgentBillPaymentDAO.getInstance().getCrossingAgentDetails(executive.getAccountGroupId(), branchIds, isBookingAgent));

			if(!isLrWiseCrossingAgentBill)
				request.setAttribute("nextPageToken", "success");
			else
				request.setAttribute("nextPageToken", "success_lr");
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}

}