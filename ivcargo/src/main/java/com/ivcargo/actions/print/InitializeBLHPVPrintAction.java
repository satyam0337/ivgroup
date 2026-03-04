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
 * @author Anant Chaudhary	05-06-2016
 *
 */
public class InitializeBLHPVPrintAction implements Action {

	/* (non-Javadoc)
	 * @see com.framework.Action#execute(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
	 */
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String, Object>	 				error 							= null;
		long									blhpvId							= 0;
		Executive								executive						= null;
		
		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request, error)) {
				return;
			}
			
			executive 			= (Executive) request.getSession().getAttribute(Executive.EXECUTIVE);
			blhpvId 			= JSPUtility.GetLong(request, "blhpvId", 0);
			
			request.setAttribute("blhpvId", blhpvId);
			
			request.setAttribute("nextPageToken", "success_" + executive.getAccountGroupId());
		} catch (Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		} finally {
			error 							= null;
			executive						= null;
		}
	}

}
