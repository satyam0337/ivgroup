package com.ivcargo.actions;

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
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.reports.ReportView;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.DispatchLedgerDao;
import com.platform.dto.Branch;
import com.platform.dto.DispatchLedger;
import com.platform.dto.Executive;
import com.platform.dto.SubRegion;
import com.platform.dto.model.BusinessFunctionConstants;
import com.platform.dto.model.OutboundmanifestReportModel;
import com.platform.dto.model.ReportViewModel;
import com.platform.resource.CargoErrorList;

public class ChargeConfigAction implements Action {
	private static final String TRACE_ID = "ChargeConfigAction";

	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	 error 	= null;
		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error)){
				return;
			}

			long startTime = System.currentTimeMillis();
			new InitializeChargeConfigAction().execute(request, response);

			Executive        executive      = (Executive) request.getSession().getAttribute("executive");
			SimpleDateFormat sdf            = new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			Timestamp        fromDate       = new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00").getTime());
			Timestamp        toDate         = new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate") + " 23:59:59").getTime());

			long 		destinationSubRegionId 	= JSPUtility.GetLong(request, "destinationSubRegionId", 0);
			CacheManip 	cManip 				= new CacheManip(request);
			Branch[] 	branches 			= cManip.getBothTypeOfBranchesDetails(request, ""+executive.getAccountGroupId(), ""+destinationSubRegionId);
			request.setAttribute("branches", branches);

			DispatchLedger[] 				dispatchReport 	= null;
			OutboundmanifestReportModel[] 	reportModel 	= null;

			dispatchReport = DispatchLedgerDao.getInstance().getDispatchLedgerForChargeConfig(JSPUtility.GetLong(request, "originSubRegionId", 0),destinationSubRegionId,JSPUtility.GetLong(request, "destinationBranchId", 0),executive.getAccountGroupId(),fromDate,toDate);

			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_DEBUG, "dispatchReport" + dispatchReport);			
			
			if(dispatchReport != null) {
				reportModel = new OutboundmanifestReportModel[dispatchReport.length];
				for(int index=0; index<dispatchReport.length ;index++) {
					

					
					/*if(srcSubRegion == null){
						srcSubRegion = SubRegionDao.getInstance().getSubRegionById(dispatchReport[index].getSourceSubRegionId());
					}*/
					
					/*if(descSubRegion == null) {
						descSubRegion = SubRegionDao.getInstance().getSubRegionById(dispatchReport[index].getDestinationSubRegionId());
					}*/
					
					Branch srcBranch = cManip.getGenericBranchDetailCache(request,dispatchReport[index].getSourceBranchId());
					SubRegion srcSubRegion = cManip.getGenericSubRegionById(request, srcBranch.getSubRegionId());					
					/*if(srcBranch == null){
						srcBranch = BranchDao.getInstance().findByBranchId(dispatchReport[index].getSourceBranchId()); 
					}*/
					
					Branch descBranch = cManip.getGenericBranchDetailCache(request, dispatchReport[index].getDestinationBranchId());
					SubRegion descSubRegion = cManip.getGenericSubRegionById(request, descBranch.getSubRegionId());
					
					/*if(descBranch == null){
						descBranch = BranchDao.getInstance().findByBranchId(dispatchReport[index].getDestinationBranchId()); 
					}*/
					
					reportModel[index] = new OutboundmanifestReportModel();
					reportModel[index].setDispatchLedgerId(dispatchReport[index].getDispatchLedgerId());
					reportModel[index].setWayBillSourceSubRegion(srcSubRegion.getName());
					reportModel[index].setWayBillSourceBranch(srcBranch.getName());
					reportModel[index].setWayBillDestinationSubRegion(descSubRegion.getName());
					reportModel[index].setWayBillDestinationBranch(descBranch.getName());
					reportModel[index].setConsignorName(dispatchReport[index].getTripName());
					reportModel[index].setDispatchDate(dispatchReport[index].getTripDateTime());
					reportModel[index].setVehicleNumber(dispatchReport[index].getVehicleNumber());
					reportModel[index].setDriver(dispatchReport[index].getDriverName());
					reportModel[index].setCleaner(dispatchReport[index].getCleanerName());
					reportModel[index].setBranchTransfer(dispatchReport[index].isBranchTransfer());
				}

				/*int reportId = new Random().nextInt(10000);
	                session.setAttribute(reportId+"",reportModel);
	                request.setAttribute("reportId", reportId);*/
				request.setAttribute("report", reportModel);
				ReportViewModel reportViewModel =new ReportViewModel();
				reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);
				request.setAttribute("ReportViewModel",reportViewModel);
			} else {
				LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO, (String) error.get("errorCode") + "" + (String) error.get("errorDescription"));
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}

			request.setAttribute("nextPageToken", "success");

			SimpleDateFormat dateFormatForTimeLog =new SimpleDateFormat("mm:ss");
			dateFormatForTimeLog.setTimeZone(TimeZone.getTimeZone("GMT"));
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO,"=====Report Generated "+BusinessFunctionConstants.CHARGECONFIG +" "+executive.getAccountGroupId()+
					" "+executive.getBranchId()+" "+executive.getExecutiveId()+" in "+dateFormatForTimeLog.format(new Date(System.currentTimeMillis()-startTime)));                
		} catch (Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		}
	}

}