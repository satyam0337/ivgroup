package com.ivcargo.reports;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.framework.JSPUtility;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actions.masters.InitializeExecutiveTrafficAction;
import com.platform.dao.TrafficExecutiveDao;
import com.platform.dto.Executive;
import com.platform.dto.TrafficExecutive;
import com.platform.resource.CargoErrorList;

public class TrafficExecutiveAction implements Action {
	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	 			error 			= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	executive 	= (Executive) request.getSession().getAttribute("executive");

			final var	values		= request.getParameterValues("Executive");

			if(values.length > 0){
				final var	trafficExecutiveArr = new TrafficExecutive[values.length];

				for(var i = 0 ; i < values.length; i++){
					trafficExecutiveArr[i] = new TrafficExecutive();
					trafficExecutiveArr[i].setExecutiveId(Long.parseLong(values[i]));
					trafficExecutiveArr[i].setTrafficMasterId(JSPUtility.GetLong(request,"trafficId_" + Long.parseLong(values[i])));
					trafficExecutiveArr[i].setAccountGroupId(executive.getAccountGroupId());
					trafficExecutiveArr[i].setBranchId(executive.getBranchId());
					trafficExecutiveArr[i].setMarkForDelete(false);
				}

				final var	strResponse =  TrafficExecutiveDao.getInstance().insert(trafficExecutiveArr);
				new InitializeExecutiveTrafficAction().execute(request, response);

				response.sendRedirect("BranchWiseTrafficConfiguration.do?pageId=257&eventId=3&message="+strResponse);
				request.setAttribute("message",strResponse);

				request.setAttribute("nextPageToken", "success");
			} else {
				error.put("errorCode", CargoErrorList.BILL_SEQUENCE_COUNTER_MISSING);
				error.put("errorDescription", CargoErrorList.BILL_SEQUENCE_COUNTER_MISSING_DESCRIPTION);
				request.setAttribute("cargoError", error);
				request.setAttribute("nextPageToken", "failure");
			}

		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}

}