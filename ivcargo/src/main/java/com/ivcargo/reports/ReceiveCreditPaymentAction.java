package com.ivcargo.reports;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.CreditPaymentModuleBLL;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.logsapp.LogWriter;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.platform.dto.Executive;
import com.platform.resource.CargoErrorList;

public class ReceiveCreditPaymentAction implements Action {
	private static final String TRACE_ID = "ReceiveCreditPaymentAction";
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		// TODO Auto-generated method stub
		HashMap<String,Object>	 	error 					= null;
		try {

			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error)){
				return;
			}
			Executive 		executive 				= (Executive)request.getSession().getAttribute("executive");
			String[] 		wayBillIdsStrArr 		= request.getParameterValues("checkbox");
			StringBuffer 	str 					= new StringBuffer();
			ValueObject 	valueInObject 			= new ValueObject();
			ValueObject 	valueOutObject 			= null;
			String 			wayBillStr 				= null;
			short			paymentMode				= 0;
			String[] 		splitWBData				= new String[2];
			double			totalReceivablePayment 	= 0.00;

			for(int i = 0; i < wayBillIdsStrArr.length ; i++){
				splitWBData = wayBillIdsStrArr[i].split(",");

				str.append(splitWBData[0]);
				if(i!=(wayBillIdsStrArr.length-1)){
					str.append(",");
				}

				totalReceivablePayment += Double.parseDouble(splitWBData[1]);
			}
			wayBillStr = str.toString();

			if(request.getParameter("paymentMode") != null) {
				paymentMode = Short.parseShort(request.getParameter("paymentMode"));
			}

			valueInObject.put("wayBillStr", wayBillStr);
			valueInObject.put("totalPaymentReceived", JSPUtility.GetDouble(request, "totalPaymentReceived", 0));
			valueInObject.put("totalReceivablePayment", totalReceivablePayment);
			valueInObject.put("paymentMode", paymentMode);
			valueInObject.put("creditorId", JSPUtility.GetLong(request, "creditorId", 0));
			valueInObject.put("executive", executive);

			valueOutObject = new CreditPaymentModuleBLL().receiveCreditPayment(valueInObject);

			if(valueOutObject != null){
				String status = valueOutObject.get("status").toString();

				if(status.equals("success")){
					LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO,"===========WayBills successfully Delivered==== ");
					request.setAttribute("TotalWayBillDelivered", wayBillIdsStrArr.length);
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
	}
}
