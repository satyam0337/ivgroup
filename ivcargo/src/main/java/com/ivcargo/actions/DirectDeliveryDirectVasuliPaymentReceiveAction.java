package com.ivcargo.actions;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.DeliveryBLL;
import com.framework.Action;
import com.iv.logsapp.LogWriter;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.reports.DirectDeliveryDirectVasuliReportAction;
import com.platform.dto.Executive;
import com.platform.resource.CargoErrorList;

public class DirectDeliveryDirectVasuliPaymentReceiveAction implements Action{

	private static final String TRACE_ID = "DirectDeliveryDirectVasuliPaymentReceiveAction";

	public void execute(HttpServletRequest request, HttpServletResponse response) {
		// TODO Auto-generated method stub

		HashMap<String,Object>	 error 		= null;
		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error)){
				return;
			}
			Executive 			executive 			= (Executive)request.getSession().getAttribute("executive");
			String[] 			wayBillIdsStrArr 	= request.getParameterValues("checkbox");
			StringBuffer 		str 				= new StringBuffer();

			for(int i = 0; i < wayBillIdsStrArr.length ; i++){
				str.append(wayBillIdsStrArr[i]);
				if(i!=(wayBillIdsStrArr.length-1)){
					str.append(",");
				}
			}
			String wayBillStr = str.toString();

			ValueObject valueInObject = new ValueObject();
			ValueObject valueOutObject = null;

			valueInObject.put("wayBillStr", wayBillStr);
			valueInObject.put("executive", executive);

			DeliveryBLL deliveryBLL = new DeliveryBLL();
			valueOutObject = deliveryBLL.paymentReceiveOfDirectDeliveryDirectVasuli(valueInObject);

			if(valueOutObject != null){
				String status = valueOutObject.get("status").toString();

				if(status.equals("success")){

					new DirectDeliveryDirectVasuliReportAction().execute(request, response);
					request.setAttribute("TotalWayBillDelivered", wayBillIdsStrArr.length);
					request.setAttribute("nextPageToken", "success");
				}
			}else{
				LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO, (String) error.get("errorCode") + " " +(String) error.get("errorDescription"));
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
				request.setAttribute("nextPageToken", "failure");
			}
		} catch (Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		}

	}
}