package com.ivcargo.reports;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.properties.impl.PropertyConfigValueBLLImpl;
import com.framework.Action;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionInstanceUtil;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.platform.dto.Executive;
import com.platform.dto.PropertiesFileConstants;
import com.platform.dto.constant.ReportWiseDisplayZeroAmountConstant;

public class InitializeBookingBranchSummaryReportAction implements Action{

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	error 		= null;
		Executive 				executive 	= null;
		ActionInstanceUtil 		actionUtil2 = null;
		ValueObject				configuration 		= null;
		boolean					showHamaliChargeColumn			= false;
		boolean					showDoorDeliveryChargeColumn	= false;


		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			executive = ActionStaticUtil.getExecutive(request);
			
			configuration	= PropertyConfigValueBLLImpl.getInstance().getConfiguration(executive, PropertiesFileConstants.REPORT_WISE_DISPLAY_ZERO_AMOUNT_CONSTANT);

			showHamaliChargeColumn	= configuration.getBoolean(ReportWiseDisplayZeroAmountConstant.SHOW_HAMALI_CHARGE_COLUMN, false);
			showDoorDeliveryChargeColumn	= configuration.getBoolean(ReportWiseDisplayZeroAmountConstant.SHOW_DOOR_DELIVERY_CHARGE_COLUMN, false);

			request.setAttribute(ActionStaticUtil.IS_ALL_REGION_NEED_TO_SHOW, false);
			request.setAttribute(ActionStaticUtil.IS_ALL_AREA_NEED_TO_SHOW, true);
			request.setAttribute(ActionStaticUtil.IS_ALL_BRANCHES_NEED_TO_SHOW, true);
			request.setAttribute("showHamaliChargeColumn", showHamaliChargeColumn);
			request.setAttribute("showDoorDeliveryChargeColumn", showDoorDeliveryChargeColumn);


			ActionStepsUtil.setInitializeBranchesSelectionInRequest(request, executive);
			ActionStepsUtil.setExecutiveCoreReportPermissionsInRequest(request, executive);

			actionUtil2 = new ActionInstanceUtil();
			actionUtil2.setExecutiveTypeBooleanInRequest(request, executive, true);

			ActionStaticUtil.setNextPageToken(request, ActionStaticUtil.SUCCESS);
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		} finally {
			error 		= null;
			executive 	= null;
			actionUtil2 = null;
		}
	}
}