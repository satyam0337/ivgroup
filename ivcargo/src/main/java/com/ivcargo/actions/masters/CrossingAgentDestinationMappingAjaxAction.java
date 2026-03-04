package com.ivcargo.actions.masters;

import java.io.PrintWriter;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.CrossingAgentDestinationMapMasterBLL;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.logsapp.LogWriter;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.Executive;

public class CrossingAgentDestinationMappingAjaxAction implements Action{

	public static final String TRACE_ID = "CrossingAgentDestinationMappingAjaxAction";

	public void execute(HttpServletRequest request, HttpServletResponse response) {

		long 						crossingAgentId 	= 0;
		Executive					 executive 			= null;
		StringBuffer 				destinationBranches	= null;
		ValueObject					valueinObject		= null;
		CrossingAgentDestinationMapMasterBLL crosAgentBll = null;
		CacheManip					cache				= null;
		PrintWriter 				  out				= null;

		HashMap<String,Object>		error 				= null;

		try{

			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error)){
				return;
			}
			response.setContentType("text/plain");
			executive 	=	(Executive) request.getSession().getAttribute("executive");
			if(executive != null){
				crossingAgentId = JSPUtility.GetLong(request, "crossingAgentId");
				if(crossingAgentId != 0){
					crosAgentBll = new CrossingAgentDestinationMapMasterBLL();
					valueinObject = new ValueObject();
					cache = new CacheManip(request);
					valueinObject.put("crossingAgentId", crossingAgentId);
					valueinObject.put("branchColl",cache.getGenericBranchesDetail(request) );
					destinationBranches = crosAgentBll.getDestinationBranchesforCrossingAgent(valueinObject); 

					try {
						out = response.getWriter();
						out.println(destinationBranches);
						out.flush();
					} catch (Exception e) {
						LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_DEBUG, "");
					} finally {
						out.close();
					}
					
				}
			}

		}catch(Exception e){
			ActionStepsUtil.catchActionException(request, e, error);
		}

	}
}
