package com.ivcargo.reports;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.platform.dto.model.DayWiseDateModel;

public class InitializePartyWiseLedgerAccountsReportAction implements Action{

	public static final String TRACE_ID = "InitializePartyWiseLedgerAccountsReportAction";

	public void execute(HttpServletRequest request, HttpServletResponse response){

		HashMap<String,Object>	 	error 					= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			
			if(ActionStaticUtil.isSystemError(request,error)){
				return;
			}
			
			request.setAttribute("timeDurationHM", DayWiseDateModel.timeDurationHM);

			request.setAttribute("nextPageToken", "success");
		} catch (Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}
	}
}
