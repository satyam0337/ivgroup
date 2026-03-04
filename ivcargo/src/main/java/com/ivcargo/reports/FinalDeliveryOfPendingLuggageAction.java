package com.ivcargo.reports;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.DeliveryPendingBLL;
import com.framework.Action;
import com.iv.logsapp.LogWriter;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.platform.dto.Executive;
import com.platform.resource.CargoErrorList;

public class FinalDeliveryOfPendingLuggageAction implements Action{

	private static final String TRACE_ID = "FinalDeliveryOfPendingLuggageAction";
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		// TODO Auto-generated method stub
		HashMap<String,Object>	error 				= null;
		Executive 				executive  			= null;
		String[] 				wayBillIdsStrArr 	= null;
		HashMap<Long, String> 	wayBillDetials 		= null;
		String[]				splitedValue		= null;
		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error)){
				return;
			}
			new InitializePendingLuggageReportAction().execute(request, response);

			executive 			= (Executive)request.getSession().getAttribute("executive");
			wayBillIdsStrArr 	= request.getParameterValues("checkbox");
			wayBillDetials 		= new HashMap<Long, String>();
			splitedValue		= new String[2];

			for(int i = 0; i < wayBillIdsStrArr.length ; i++){
				splitedValue = wayBillIdsStrArr[i].split(",");
				wayBillDetials.put(Long.parseLong(splitedValue[0]) , splitedValue[1]);
			}

			ValueObject valueInObject = new ValueObject();
			ValueObject valueOutObject = null;

			valueInObject.put("executive", executive);
			valueInObject.put("wayBillDetials", wayBillDetials);

			DeliveryPendingBLL deliveryPendingBLL = new DeliveryPendingBLL();
			valueOutObject = deliveryPendingBLL .insertMultiData(valueInObject);

			if(valueOutObject != null){
				String status = valueOutObject.get("status").toString();

				if(status.equals("success")){

					PendingLuggageReportAction action = new PendingLuggageReportAction();  
					action.execute(request, response);
					LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO,"===========WayBills successfully Delivered==== ");
					request.setAttribute("TotalWayBillDelivered", wayBillIdsStrArr.length);
					ActionStaticUtil.setReportViewModel(request);
					request.setAttribute("nextPageToken", "success");
				}else{
					LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO,"===========WayBills Not successfully Delivered==== ");
				}
			}else{
				LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO, (String) error.get("errorCode")+" "+(String) error.get("errorDescription"));
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
				request.setAttribute("nextPageToken", "failure");
			}
		} catch (Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		}
		finally{
			error 				= null;
			executive  			= null;
			wayBillIdsStrArr 	= null;
			wayBillDetials 		= null;
			splitedValue		= null;
		}
	}
}