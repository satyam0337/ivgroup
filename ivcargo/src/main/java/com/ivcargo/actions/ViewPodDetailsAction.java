package com.ivcargo.actions;

import java.util.ArrayList;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.PODWaybillsDao;
import com.platform.dto.Executive;
import com.platform.dto.PODDispatch;
import com.platform.dto.constant.PODStatusConstant;

public class ViewPodDetailsAction implements Action {

	public static final String TRACE_ID = "ViewPodDetailsAction";

	public void execute(HttpServletRequest request, HttpServletResponse response) {

		HashMap<String,Object>	 	error 					= null;
		CacheManip 					cManip					= null;
		Executive  					executive				= null;
		long						wayBillId				= 0;
		ArrayList<PODDispatch> 		podDispatchList			= null;
		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error)){
				return;
			}
			executive	= (Executive)request.getSession().getAttribute("executive");
			cManip 		= new CacheManip(request);
			if(request.getParameter("wayBillId")!=null){
				wayBillId = Long.parseLong(request.getParameter("wayBillId").toString());
			}
			podDispatchList = PODWaybillsDao.getInstance().getPODHistoryByWayBillId(wayBillId);
			for(PODDispatch podDispatch:podDispatchList){
				podDispatch.setDispatchByBranchStr(cManip.getBranchById(request, executive.getAccountGroupId(), podDispatch.getDispatchByBranchId()).getName());
				if(PODStatusConstant.POD_DISPATCH_STATUS_BOOKED==podDispatch.getStatus()){
					podDispatch.setStatusStr(PODStatusConstant.POD_DISPATCH_STATUS_BOOKED_STRING);
				}else if(PODStatusConstant.POD_DISPATCH_STATUS_CANCEL==podDispatch.getStatus()){
					podDispatch.setStatusStr(PODStatusConstant.POD_DISPATCH_STATUS_CANCEL_STRING);
				}else if(PODStatusConstant.POD_DISPATCH_STATUS_RECEIVE==podDispatch.getStatus()){
					podDispatch.setStatusStr(PODStatusConstant.POD_DISPATCH_STATUS_RECEIVE_STRING);
				}else{
					podDispatch.setStatusStr("--");
				}
				
			}
			request.setAttribute("podDispatchList", podDispatchList);
			request.setAttribute("nextPageToken", "success");

		} catch (Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		} finally {
			cManip					= null;
			executive				= null;
			podDispatchList			= null;
		}
	}
}