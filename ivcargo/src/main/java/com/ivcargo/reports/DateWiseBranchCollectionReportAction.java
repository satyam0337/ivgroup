package com.ivcargo.reports;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.TimeZone;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.logsapp.LogWriter;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.reports.DateWiseBranchCollectionReportDao;
import com.platform.dto.Branch;
import com.platform.dto.Executive;
import com.platform.dto.model.BusinessFunctionConstants;
import com.platform.resource.CargoErrorList;

public class DateWiseBranchCollectionReportAction implements Action{

	private static final String TRACE_ID = "DateWiseBranchCollectionReportAction";
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	error 					= null;
		CacheManip 				cache 					= null;
		SimpleDateFormat 		sdf        	 			= null;
		Executive   			executive 				= null;
		ValueObject 			objectIn 				= null;
		Timestamp        		fromDate    			= null;
		Timestamp        		toDate     				= null;
		ValueObject 			objectOut 				= null;
		Branch[] 				branches 				= null;
		SimpleDateFormat 		dateFormatForTimeLog	= null;
		long startTime			= 0;
		long selectedSubRegion	= 0;
		long selectedBranch		= 0;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error)){
				return;
			}
			startTime 	= System.currentTimeMillis();
			new InitializeDateWiseBranchCollectionReportAction().execute(request, response);

			cache		= new CacheManip(request);
			executive 	= (Executive) request.getSession().getAttribute("executive");

			sdf         = new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			fromDate    = new Timestamp((sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00")).getTime());
			toDate      = new Timestamp((sdf.parse(JSPUtility.GetString(request, "toDate") + " 23:59:59")).getTime());

			selectedSubRegion	=JSPUtility.GetLong(request, "subRegion",0);
			selectedBranch  =JSPUtility.GetLong(request, "branch",0);

			objectIn 	= new ValueObject();
			objectIn.put("sourceSubRegionId", selectedSubRegion);
			objectIn.put("sourceBranchId", selectedBranch);
			objectIn.put("fromDate", fromDate);
			objectIn.put("toDate", toDate);
			objectIn.put("accountGroupId", executive.getAccountGroupId());

			//Get all Branches

			branches 	= cache.getBothTypeOfBranchesDetails(request, ""+executive.getAccountGroupId(), ""+selectedSubRegion);
			request.setAttribute("branches", branches);
			objectOut 		= DateWiseBranchCollectionReportDao.getInstance().getDateWiseBranchCollection(objectIn);

			if(objectOut != null){
				request.setAttribute("dateWiseBranchCollection",objectOut.get("dateWiseBranchCollection"));
				ActionStaticUtil.setReportViewModel(request);
				request.setAttribute("nextPageToken", "success");

				dateFormatForTimeLog = new SimpleDateFormat("mm:ss");
				dateFormatForTimeLog.setTimeZone(TimeZone.getTimeZone("GMT"));
				LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO,"=====Report Generated "+BusinessFunctionConstants.DATE_WISE_BRANCH_COLLECTION_REPORT+" ViewDetail "+executive.getAccountGroupId()+" "+executive.getBranchId()+" "+executive.getExecutiveId()+" in "+dateFormatForTimeLog.format(new Date(System.currentTimeMillis()-startTime)));
			} else {
				LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO, (String) error.get("errorCode")+" "+(String) error.get("errorDescription"));
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}
		} catch (Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		}finally{
			error 					= null;
			cache 					= null;
			sdf        	 			= null;
			executive 				= null;
			objectIn 				= null;
			fromDate    			= null;
			toDate     				= null;
			objectOut 				= null;
			branches 				= null;
			dateFormatForTimeLog	= null;
		}
	}
}