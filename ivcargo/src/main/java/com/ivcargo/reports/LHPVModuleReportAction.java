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
import com.platform.dao.LHPVDao;
import com.platform.dto.Branch;
import com.platform.dto.Executive;
import com.platform.dto.LHPV;
import com.platform.dto.SubRegion;
import com.platform.dto.model.BusinessFunctionConstants;
import com.platform.resource.CargoErrorList;

public class LHPVModuleReportAction implements Action{

	private static final String TRACE_ID = "LHPVModuleReportAction";
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		// TODO Auto-generated method stub
		HashMap<String,Object>	error 		= null;
		Executive        	executive       = null;
		SimpleDateFormat 	sdf             = null;
		Timestamp        	fromDate        = null;
		Timestamp        	toDate          = null;
		CacheManip 			cacheManip 		= null;
		ValueObject			objectIn 		= null;
		ValueObject			objectOut 		= null;
		LHPV[] 				reportModel		= null;
		SimpleDateFormat dateFormatForTimeLog = null;
		SubRegion[]     	subRegionForGroup 		= null;
		HashMap<Long, Branch> subRegionBranches    	= null;
		long 				regionId    			= 0;
		long 				subRegionId 			= 0;
		long                branchId 				= 0;
		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error)){
				return;
			}

			long startTime = System.currentTimeMillis();
			new InitializeLHPVModuleReportAction().execute(request, response);

			executive       = (Executive) request.getSession().getAttribute("executive");
			sdf             = new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			fromDate        = new Timestamp((sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00")).getTime());
			toDate          = new Timestamp((sdf.parse(JSPUtility.GetString(request, "toDate") + " 23:59:59")).getTime());
			cacheManip 		= new CacheManip(request);

			if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_GROUPADMIN){
				regionId = Long.parseLong(request.getParameter("region"));
				subRegionId = Long.parseLong(request.getParameter("subRegion"));
				branchId = Long.parseLong(request.getParameter("branch"));

				// Get Combo values to restore
				subRegionForGroup = cacheManip.getSubRegionsByRegionId(request, regionId, executive.getAccountGroupId());
				subRegionBranches = cacheManip.getBranchesBySubRegionId(request,executive.getAccountGroupId(), subRegionId);
				request.setAttribute("subRegionForGroup", subRegionForGroup);
				request.setAttribute("subRegionBranches", subRegionBranches);
			}else if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_REGIONADMIN){
				regionId = executive.getRegionId();
				subRegionId = Long.parseLong(request.getParameter("subRegion"));
				branchId = Long.parseLong(request.getParameter("branch"));
				// Get Combo values to restore
				subRegionForGroup = cacheManip.getSubRegionsByRegionId(request, regionId, executive.getAccountGroupId());
				subRegionBranches = cacheManip.getBranchesBySubRegionId(request,executive.getAccountGroupId(), subRegionId);
				request.setAttribute("subRegionForGroup", subRegionForGroup);
				request.setAttribute("subRegionBranches", subRegionBranches);
			}else if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_SUBREGIONADMIN){
				regionId = executive.getRegionId();
				subRegionId = executive.getSubRegionId();
				branchId = Long.parseLong(request.getParameter("branch"));
				// Get Combo values to restore
				subRegionBranches = cacheManip.getBranchesBySubRegionId(request,executive.getAccountGroupId(), subRegionId);
				request.setAttribute("subRegionBranches", subRegionBranches);
			}else{
				regionId = executive.getRegionId();
				subRegionId = executive.getSubRegionId();
				branchId = executive.getBranchId();
			}

			objectIn 	= new ValueObject();

			objectIn.put("fromDate", fromDate);
			objectIn.put("toDate", toDate);
			objectIn.put("branchId", branchId);
			objectIn.put("accountGroupId", executive.getAccountGroupId());

			objectOut 	= LHPVDao.getInstance().getReportForBranch(objectIn);
			reportModel	= (LHPV[])objectOut.get("LHPVCollectionReportModel");

			if(reportModel != null) {
				/*reportViewModel = new ReportViewModel();
				reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);
				request.setAttribute("ReportViewModel",reportViewModel);
				 */
				ActionStaticUtil.setReportViewModel(request);
				request.setAttribute("ReportData", reportModel);

				dateFormatForTimeLog = new SimpleDateFormat("mm:ss");
				dateFormatForTimeLog.setTimeZone(TimeZone.getTimeZone("GMT"));
				LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO,"=====Report Generated "+BusinessFunctionConstants.LHPVMODULEREPORT +"  "+executive.getAccountGroupId()+
						" "+executive.getBranchId()+" "+executive.getExecutiveId()+" in "+dateFormatForTimeLog.format(new Date(System.currentTimeMillis()-startTime)));
			} else {
				LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, CargoErrorList.SYSTEM_ERROR + "");
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
				ActionStaticUtil.setReportViewModel(request);
				request.setAttribute("nextPageToken", "success");
			}
		} catch (Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		} finally {
			error 			= null;
			executive       = null;
			sdf             = null;
			fromDate        = null;
			toDate          = null;
			cacheManip 		= null;
			objectIn 		= null;
			objectOut 		= null;
			reportModel		= null;
			dateFormatForTimeLog 	= null;
			subRegionForGroup 		= null;
			subRegionBranches    	= null;
			regionId    			= 0;
			subRegionId 			= 0;
			branchId 				= 0;

		}
	}
}
