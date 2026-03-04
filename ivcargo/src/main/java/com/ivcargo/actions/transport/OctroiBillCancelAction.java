package com.ivcargo.actions.transport;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.logsapp.LogWriter;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.platform.dao.InvoiceCertificationDao;
import com.platform.dao.InvoiceCertificationSummaryDao;
import com.platform.dto.InvoiceCertification;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

public class OctroiBillCancelAction implements Action {
	private static final String TRACE_ID = "OctroiBillCancelAction";

	public void execute(HttpServletRequest request, HttpServletResponse response) {
		// TODO Auto-generated method stub
		HashMap<String,Object>	error 			= null;

		String[] 				billIdsStrArr	= null;
		StringBuffer 			str 			= null;
		String					wayBillIdstr	= null;
		InvoiceCertification[] 	bills 			= null;
		Long[]					wayBillIdArr	= null;
		ValueObject				valOut			= null;

		try {

			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error)){
				return;
			}

			billIdsStrArr	= request.getParameterValues("checkbox");
			str 			= new StringBuffer();
			bills			= new InvoiceCertification[billIdsStrArr.length];

			for(int i = 0; i < billIdsStrArr.length ; i++){
				str.append(billIdsStrArr[i]);
				if(i!=(billIdsStrArr.length-1)){
					str.append(",");
				}

				bills[i] = new InvoiceCertification();
				bills[i].setInvoiceCertificationId(Long.parseLong(billIdsStrArr[i]));
				bills[i].setStatus(InvoiceCertification.INVOICE_CLEARANCE_STATUS_CANCELLED_ID);
			}

			valOut	= InvoiceCertificationSummaryDao.getInstance().getInvoiceSummaryDetailsByInvoiceCertificationIds(str.toString());

			if(valOut != null){
				wayBillIdArr 	= (Long[])valOut.get("wayBillIdArr");
				wayBillIdstr 	= Utility.GetLongArrayToString(wayBillIdArr);

				LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO, "-- OctroiBillIDs to be cancle "+str);

				if(InvoiceCertificationDao.getInstance().cancleBill(wayBillIdstr,bills,str.toString()) == 1){
					LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO,"===========Bill successfully cancled==== ");
					response.sendRedirect("BillAfterCreation.do?pageId=215&eventId=4&successMsgAfterBillCancle=1");
				} 
				else {
					LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO, (String) error.get("errorCode")+" "+(String) error.get("errorDescription"));
					error.put("errorCode", CargoErrorList.BILL_NUMBER_ERROR);
					error.put("errorDescription", CargoErrorList.BILL_NUMBER_ERROR_DESCRIPTION);
					request.setAttribute("cargoError", error);
					request.setAttribute("nextPageToken", "failure");
				}
			}else {
				LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO, (String) error.get("errorCode")+" "+(String) error.get("errorDescription"));
				error.put("errorCode", CargoErrorList.BILL_NUMBER_ERROR);
				error.put("errorDescription", CargoErrorList.BILL_NUMBER_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
				request.setAttribute("nextPageToken", "failure");
			}
		} catch (Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		} finally {
			billIdsStrArr	= null;
			str 			= null;
			bills 			= null;
		}
	}
}
