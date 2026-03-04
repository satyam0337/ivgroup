package com.ivcargo.actions.masters;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.CrossingAgentDestinationMapMasterBLL;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.Executive;

public class CrossingAgentDestinationMappingAction implements Action{
	public static final String TRACE_ID = "CrossingAgentDestinationMappingAction";


	public void execute(HttpServletRequest request, HttpServletResponse response) {

		HashMap<String,Object>	error 	= null;
		try {

			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error)){
				return;
			}
			Executive 								executive 		= null;
			long 	 								crossingAgentId = 0;
			String[] 								branchList		= null;
			String 									branchSting 	= "";
			ValueObject  							valueInObject	= null;
			CacheManip	 							cache 			= null;
			CrossingAgentDestinationMapMasterBLL 	crosAgentBll 	= null;
			String									idsFromAjax		= "";

			executive 		= (Executive) request.getSession().getAttribute("executive");
			if(executive != null){

				valueInObject = new ValueObject();
				crosAgentBll = new CrossingAgentDestinationMapMasterBLL();
				cache= new CacheManip(request);
				idsFromAjax = request.getParameter("destinationBrancgesFromDbId");

				crossingAgentId = JSPUtility.GetLong(request, "selectedCrossingAgentId");
				branchList = request.getParameterValues("selectedBranchList");
				if(crossingAgentId != 0 && branchList != null){
					for(int i=0;i<branchList.length;i++){
						if(branchList != null){
							if(i != branchList.length-1){
								branchSting += branchList[i]+",";  	
							}else{
								branchSting += branchList[i];
							}
						}
					}
					valueInObject.put("executive", executive);
					valueInObject.put("idsFromAjax", idsFromAjax);
					valueInObject.put("crossingAgentId", crossingAgentId);
					valueInObject.put("branchSting", branchSting);
					valueInObject.put("branchesColl", cache.getGenericBranchesDetail(request));

					crosAgentBll.CrossingAgentDestinationMap(valueInObject);
				}
				response.sendRedirect("Master.do?pageId=284&eventId=1&selectedCrossingAgentId="+crossingAgentId);
			}else{
				request.setAttribute("nextPageToken", "needlogin");
			}
		}
		catch (Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		}finally{
		}
	}
}
