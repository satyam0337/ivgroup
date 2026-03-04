package com.ivcargo.reports;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.bll.impl.properties.BookingCrossingAgentDetilsReportConfigurationBllImpl;
import com.iv.constant.properties.BookingCrossingAgentDetailsReportConstant;
import com.ivcargo.actionUtility.ActionInstanceUtil;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.platform.dto.Executive;

public class InitializeBookingCrossingAgentWayBillReportAction implements Action {
	
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	error 		= null;
		Executive 				executive 	= null;
		ActionInstanceUtil 		actionUtil2 = null;
		HashMap<Object, Object>       bookingCrossingAgentDetailsProperties = null;
		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error)){
				return;
			}		
			executive = ActionStaticUtil.getExecutive(request);			
			
			
			bookingCrossingAgentDetailsProperties = new BookingCrossingAgentDetilsReportConfigurationBllImpl().getBookingCrossingAgentDetilsGetData(executive.getAccountGroupId());
		
			request.setAttribute(ActionStaticUtil.IS_ALL_REGION_NEED_TO_SHOW, false);
			request.setAttribute(ActionStaticUtil.IS_ALL_BRANCHES_NEED_TO_SHOW, true);
			request.setAttribute(ActionStaticUtil.IS_ALL_AREA_NEED_TO_SHOW, true);
			request.setAttribute("showAllButtonCrossingAgent", bookingCrossingAgentDetailsProperties.get(BookingCrossingAgentDetailsReportConstant.SHOW_ALL_OPTION_FOR_CROSSING_AGENT));
			request.setAttribute(ActionStaticUtil.IS_BOTH_TYPE_BRANCHES_NEEDED,false);
			
			ActionStepsUtil.setInitializeBranchesSelectionInRequest(request, executive);

			ActionStepsUtil.setExecutiveCoreReportPermissionsInRequest(request, executive);

			actionUtil2 = new ActionInstanceUtil();
			actionUtil2.setExecutiveTypeBooleanInRequest(request, executive, true);

			ActionStaticUtil.setNextPageToken(request, ActionStaticUtil.SUCCESS);			
		} catch (Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		}
		finally{
			error 		= null;
			executive 	= null;
			actionUtil2 = null;
		}
	}
}