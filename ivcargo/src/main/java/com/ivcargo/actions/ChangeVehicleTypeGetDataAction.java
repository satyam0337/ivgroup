package com.ivcargo.actions;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.ChangeVehicleTypeBLL;
import com.framework.Action;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.Executive;

public class ChangeVehicleTypeGetDataAction implements Action{

	public static final String TRACE_ID = "ChangeVehicleTypeGetDataAction";

	public void execute(HttpServletRequest request, HttpServletResponse response) {

		HashMap<String,Object>	 	error 					= null;

		Executive		executive	= null;
		String 			LSNumber	= null;
		ValueObject		valObj		= null;
		ValueObject		valOuntObj	= null;
		CacheManip		cache		= null;

		try {	
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error)){
				return;
			}
			valObj	= new ValueObject();
			cache 	= new CacheManip(request);

			LSNumber = request.getParameter("LSNumber").toString().trim();

			if(LSNumber != null && !LSNumber.equals("")){
				executive = (Executive) request.getSession().getAttribute("executive");

				valObj.put("LSNumber", Long.parseLong(LSNumber));
				valObj.put("branchesColl", cache.getGenericBranchesDetail(request));
				valObj.put("accGrpId", executive.getAccountGroupId());

				ChangeVehicleTypeBLL changeVehicleTypebll = new ChangeVehicleTypeBLL();
				valOuntObj = changeVehicleTypebll.chengeLRVehicleType(valObj);

				request.setAttribute("wbReceivableModelHM", valOuntObj.get("wbReceivableModelHM"));
				request.setAttribute("ErrorMsg", valOuntObj.get("ErrorMsg"));
				request.setAttribute("isErrorMsg", valOuntObj.get("isErrorMsg"));
			}else{
				request.setAttribute("wbReceivableModelHM", null);
				request.setAttribute("ErrorMsg", "Enter Valid Loading Sheet Number");
				request.setAttribute("isErrorMsg", true);
			}

			request.setAttribute("nextPageToken", "success");

		} catch (Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		} finally {
			executive	= null;
			LSNumber	= null;
			valObj		= null;
			valOuntObj	= null;
			cache		= null;
		}
	}
}
