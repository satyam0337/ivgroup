package com.ivcargo.reports;

//~--- non-JDK imports --------------------------------------------------------

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.TimeZone;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.BookingCrossingAgentWayBillReportBLL;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.logsapp.LogWriter;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionInstanceUtil;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.Executive;
import com.platform.dto.TransportCommonMaster;

public class BookingCrossingAgentWayBillReportAction implements Action {

	private static final String TRACE_ID = "BookingCrossingAgentWayBillReportAction";
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	 				error 									= null;
		Executive        						executive      							= null;
		Timestamp        						fromDate       							= null;
		Timestamp        						toDate         							= null;
		CacheManip 								cManip 									= null;
		SimpleDateFormat 						dateForTimeLog 							= null;
		String 									branchIds								= null;
		ValueObject 							valInObj 								= null;
		ValueObject 							valObj 									= null;
		ValueObject								valObjSelection							= null;
		BookingCrossingAgentWayBillReportBLL 	bookingCrossingAgentWayBillReportBLL	= null;
		ActionInstanceUtil						actionUtil2								= null;
		long 	regionId    		= 0;
		long 	subRegionId    		= 0;
		long 	srcBranchId			= 0;
		long 	accountGroupId		= 0; 	
		long 	crossingAgentId		= 0; 

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error)){
				return;
			}
			long startTime = System.currentTimeMillis();
			new InitializeBookingCrossingAgentWayBillReportAction().execute(request, response);

			bookingCrossingAgentWayBillReportBLL	= new BookingCrossingAgentWayBillReportBLL();
			valInObj 	= new ValueObject();
			actionUtil2 = new ActionInstanceUtil(); 	
			fromDate	= ActionStaticUtil.getFromToDate(request, ActionStaticUtil.FROMDATE, ActionStaticUtil.FROMTIME);
			toDate		= ActionStaticUtil.getFromToDate(request, ActionStaticUtil.TODATE, ActionStaticUtil.TOTIME);
			executive   = ActionStaticUtil.getExecutive(request);
			cManip		= new CacheManip(request);
			valObj 		= new ValueObject();

			accountGroupId 		= executive.getAccountGroupId();
			crossingAgentId 	= JSPUtility.GetLong(request,"crossingAgentId",0);
			valObjSelection = new ValueObject();
			
			if(crossingAgentId >= 0){

				request.setAttribute(ActionStaticUtil.IS_BOTH_TYPE_BRANCHES_NEEDED,false);
				valObjSelection = actionUtil2.reportSelection(request, executive);
				regionId 	= (Long)valObjSelection.get("regionId");
				subRegionId = (Long)valObjSelection.get("subRegionId");
				request.setAttribute("agentName", executive.getName());

				if(subRegionId == 0 && srcBranchId == 0) {
					branchIds = cManip.getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_REGION, regionId);
				} else if(subRegionId > 0 && srcBranchId == 0) {
					branchIds = cManip.getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_SUBREGION, subRegionId);
				} else if(subRegionId > 0 && srcBranchId > 0) {
					branchIds = ""+srcBranchId;
				}

				valInObj.put("branchIds", branchIds);
				valInObj.put("fromDate", fromDate);
				valInObj.put("toDate", toDate);
				valInObj.put("accountGroupId", accountGroupId);
				valInObj.put("crossingAgentId", crossingAgentId);
				valInObj.put("branchesColl", cManip.getGenericBranchesDetail(request));
				valObj = bookingCrossingAgentWayBillReportBLL.getBookingCrossingAgentDetails(valInObj);

				if(valObj == null){
					ActionStaticUtil.setRequestAttribute(request, ActionStaticUtil.NO_RECORDS_FOUND, true);
					return;
				}

			}

			request.setAttribute("bookingCrossingAgentHM", valObj.get("bookingCrossingAgentHM"));
			request.setAttribute("noOfArt", valObj.get("noOfArt"));
			request.setAttribute("actualWght", valObj.get("actualWght"));
			request.setAttribute("grandTotal", valObj.get("grandTotal"));
			request.setAttribute("crHire", valObj.get("crHire"));

			ActionStaticUtil.setReportViewModel(request);
			ActionStaticUtil.setNextPageToken(request, ActionStaticUtil.SUCCESS);

			dateForTimeLog = new SimpleDateFormat("mm:ss");
			dateForTimeLog.setTimeZone(TimeZone.getTimeZone("GMT"));
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO,"=====Report Generated BookingCrossingAgentReportAction"+" "+executive.getAccountGroupId()+" "+executive.getBranchId()+" "+executive.getExecutiveId()+" in "+dateForTimeLog.format(new Date(System.currentTimeMillis()-startTime)));                
		} catch (Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		} finally {
			error 									= null;
			executive      							= null;
			fromDate       							= null;
			toDate         							= null;
			cManip 									= null;
			dateForTimeLog 							= null;
			branchIds								= null;
			valInObj 								= null;
			valObj 									= null;
			valObjSelection							= null;
			bookingCrossingAgentWayBillReportBLL	= null;
			actionUtil2								= null;
		}
	}
}