package com.ivcargo.reports.account.initialize;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.ivcargo.actionUtility.ActionInstanceUtil;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.platform.dto.Executive;
import com.platform.dto.model.DayWiseDateModel;

public class InitializePartyBillRegisterReportAction implements Action {
	
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	error 		= null;
		Executive 				executive 	= null;
		ActionInstanceUtil 		actionUtil2 = null;
		
		try {
			
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error)){
				return;
			}
			
			executive = ActionStaticUtil.getExecutive(request);

			ActionStepsUtil.setExecutiveCoreReportPermissionsInRequest(request, executive);

			request.setAttribute("timeDurationHM", DayWiseDateModel.partyBillTimeDurationHM);
			
			actionUtil2 = new ActionInstanceUtil();
			actionUtil2.setExecutiveTypeBooleanInRequest(request, executive, true);
	
			ActionStaticUtil.setNextPageToken(request, ActionStaticUtil.SUCCESS);
		} catch (Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		} finally {
			error 		= null;
			executive 	= null;
			actionUtil2 = null;
		}
	}
}