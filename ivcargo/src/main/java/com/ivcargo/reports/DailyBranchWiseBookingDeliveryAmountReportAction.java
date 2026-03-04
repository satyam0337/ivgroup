package com.ivcargo.reports;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.logsapp.LogWriter;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.platform.dao.reports.DailyBranchWiseBookingDeliveryAmountReportDao;
import com.platform.dto.Executive;
import com.platform.dto.model.ReportViewModel;

public class DailyBranchWiseBookingDeliveryAmountReportAction implements Action {

	public void execute(HttpServletRequest request, HttpServletResponse response) {
		// TODO Auto-generated method stub
		HashMap<String,Object>	 error 		= null;
		try{

			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error)){
				return;
			}
			Executive   		executive 	= (Executive) request.getSession().getAttribute("executive");
			ValueObject 		objectIn 	= new ValueObject();
			ValueObject 		objectOut 	= new ValueObject();
			objectIn.put("accountGroupId", executive.getAccountGroupId());
			objectIn.put("Year",JSPUtility.GetString(request, "GroupSelectYear"));
			objectOut = DailyBranchWiseBookingDeliveryAmountReportDao.getInstance().getDailyBranchWiseBookingDispatchAmountReportDao(objectIn);
			request.setAttribute("LinkedHashMap",objectOut.get("LinkedHashMap"));		
			InitializeDailyBranchWiseBookingDeliveryAmountReportAction is=new InitializeDailyBranchWiseBookingDeliveryAmountReportAction();
			is.execute(request, response);
			ReportView reportView=new ReportView();	
			ReportViewModel reportViewModel=new ReportViewModel();
			reportViewModel=reportView.populateReportViewModel(request, reportViewModel);
			request.setAttribute("ReportViewModel",reportViewModel);
			request.setAttribute("nextPageToken", "success");

		}catch (Exception _e){
			_e.printStackTrace();
			LogWriter.writeLog("LOGINVALIDATOR", LogWriter.LOG_LEVEL_ERROR,_e);
			//				error.put("errorCode", CargoErrorList.SYSTEM_ERROR);
			//				error.put("errorDescription", CargoErrorList.SYSTEM_ERROR_DESCRIPTION);
			request.setAttribute("cargoError", error);
			request.setAttribute("nextPageToken", "failure");
			//ActionStepsUtil.catchActionException(request, e, error);
		}
	}
}
