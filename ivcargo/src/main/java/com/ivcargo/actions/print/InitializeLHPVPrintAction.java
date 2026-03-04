/**
 *
 */
package com.ivcargo.actions.print;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.framework.JSPUtility;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.platform.dto.Executive;

/**
 * @author Anant Chaudhary	04-05-2016
 *
 */
public class InitializeLHPVPrintAction implements Action {

	/* (non-Javadoc)
	 * @see com.framework.Action#execute(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
	 */
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String, Object>	 					error 							= null;
		long										lhpvId							= 0;
		Executive									executive						= null;
		boolean						    			isLaserPrint					= false;


		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request, error))
				return;
			isLaserPrint = JSPUtility.GetBoolean(request, "isLaserPrint", false);

			executive 			= (Executive) request.getSession().getAttribute("executive");
			lhpvId 				= JSPUtility.GetLong(request, "lhpvId" ,0);
			request.setAttribute("lhpvId", lhpvId);

			request.setAttribute("nextPageToken", "success_" + executive.getAccountGroupId());

			if(isLaserPrint)
				request.setAttribute("nextPageToken", "success_ledger_"+executive.getAccountGroupId());
			else
				request.setAttribute("nextPageToken", "success_"+executive.getAccountGroupId());

		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		} finally {
			error 							= null;
			executive						= null;
		}

	}

}
