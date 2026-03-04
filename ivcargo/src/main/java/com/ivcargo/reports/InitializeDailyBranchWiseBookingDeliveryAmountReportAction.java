package com.ivcargo.reports;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.platform.dao.reports.DailyBranchWiseBookingDeliveryAmountReportDao;
import com.platform.dto.Executive;

public class InitializeDailyBranchWiseBookingDeliveryAmountReportAction implements Action {

	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	error 	= null;
		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error)){
				return;
			}
			Executive   		executive 	= (Executive) request.getSession().getAttribute("executive");
			ValueObject 		objectOut 	= new ValueObject();

			objectOut = DailyBranchWiseBookingDeliveryAmountReportDao.getInstance().getInitializeDailyBranchWiseBookingDispatchAmountReportDao(executive.getAccountGroupId());
			if(objectOut != null)
			{
				request.setAttribute("YearList",objectOut.get("YearList"));
				request.setAttribute("nextPageToken", "success");
			}
		} catch (Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		}
	}
}
