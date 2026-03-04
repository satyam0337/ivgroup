package com.ivcargo.reports;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.TimeZone;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.CreditPaidBookingBLL;
import com.framework.Action;
import com.iv.logsapp.LogWriter;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionInstanceUtil;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.Executive;

public class CreditPaidBookingReportAction implements Action {

	private static final String TRACE_ID = "CreditPaidBookingReportAction";
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		// TODO Auto-generated method stub
		HashMap<String,Object>	error 					= null;
		Executive        		executive   			= null;
		SimpleDateFormat   		dateFormatForTimeLog 	= null;
		Timestamp        		fromDate       			= null;
		Timestamp        		toDate         			= null;
		ValueObject 			valObjSelection			= null;
		ValueObject 			objectOut 				= null;
		ValueObject 			valInObj				= null;
		long 					branchId				= 0;
		ActionInstanceUtil 		actionUtil2				= null;
		CreditPaidBookingBLL 	creditPaidBookingBLL 	= null;
		CacheManip 				cacheManip 				= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error)){
				return;
			}
			long startTime = System.currentTimeMillis();
			new InitializeCreditPaidBookingReportAction().execute(request, response);

			creditPaidBookingBLL	= new CreditPaidBookingBLL();
			valInObj	= new ValueObject();
			actionUtil2 = new ActionInstanceUtil(); 	
			fromDate	= ActionStaticUtil.getFromToDate(request, ActionStaticUtil.FROMDATE, ActionStaticUtil.FROMTIME);
			toDate		= ActionStaticUtil.getFromToDate(request, ActionStaticUtil.TODATE, ActionStaticUtil.TOTIME);
			executive   = ActionStaticUtil.getExecutive(request);
			cacheManip 	= new CacheManip(request);

			valObjSelection = actionUtil2.reportSelection(request, executive);
			branchId 		= (Long)valObjSelection.get("branchId");
			request.setAttribute("agentName", executive.getName());

			valInObj.put("executive", executive);
			valInObj.put("fromDate", fromDate);
			valInObj.put("toDate", toDate);
			valInObj.put("branchId", branchId);
			valInObj.put("branchesColl", cacheManip.getGenericBranchesDetail(request));

			objectOut = creditPaidBookingBLL.getCreditPaidBookingDetails(valInObj);

			if(objectOut == null){
				ActionStaticUtil.setRequestAttribute(request, ActionStaticUtil.NO_RECORDS_FOUND, true);
				return;
			}

			request.setAttribute("noOfPackages", objectOut.get("noOfPackages"));
			request.setAttribute("chgWgt", objectOut.get("chgWgt"));
			request.setAttribute("totalAmount", objectOut.get("totalAmount"));
			request.setAttribute("CreditPaidBookingModel",objectOut.get("CreditPaidBookingModel"));

			ActionStaticUtil.setReportViewModel(request);
			ActionStaticUtil.setNextPageToken(request, ActionStaticUtil.SUCCESS);

			dateFormatForTimeLog = new SimpleDateFormat("mm:ss");
			dateFormatForTimeLog.setTimeZone(TimeZone.getTimeZone("GMT"));
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO,"=====Report Generated CreditPaidBookingReportAction "+executive.getAccountGroupId()+" "+executive.getBranchId()+" "+executive.getExecutiveId()+" in "+dateFormatForTimeLog.format(new Date(System.currentTimeMillis()-startTime)));
		} catch (Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		} finally {
			error 					= null;
			executive   			= null;
			dateFormatForTimeLog 	= null;
			fromDate       			= null;
			toDate         			= null;
			valObjSelection			= null;
			objectOut 				= null;
			valInObj				= null;
			actionUtil2				= null;
			creditPaidBookingBLL 	= null;
			cacheManip 				= null;
		}
	}
}