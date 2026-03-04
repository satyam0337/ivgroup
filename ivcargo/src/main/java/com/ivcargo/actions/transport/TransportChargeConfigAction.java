package com.ivcargo.actions.transport;

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
import com.platform.dto.AliasNameConstants;
import com.platform.dto.DispatchLedger;
import com.platform.dto.Executive;
import com.platform.dto.configuration.mindateselection.ModuleWiseMinDateSelectionConfigurationDTO;
import com.platform.dto.model.BusinessFunctionConstants;
import com.platform.dto.model.OutboundmanifestReportModel;
import com.platform.dto.model.ReportViewModel;
import com.platform.resource.CargoErrorList;

public class TransportChargeConfigAction implements Action {

	private static final String TRACE_ID = "TransportChargeConfigAction";

	public void execute(HttpServletRequest request, HttpServletResponse response) {

		HashMap<String,Object>	 		error 					= null;
		Executive        				executive				= null;
		CacheManip 						cManip					= null;
		DispatchLedger[] 				dispatchLedgers			= null;
		DispatchLedger 					dispatchLedger			= null;
		OutboundmanifestReportModel[] 	reportModel 			= null;
		ReportViewModel 				reportViewModel 		= null;
		SimpleDateFormat 				dateFormatForTimeLog 	= null;
		Timestamp						minDateTimeStamp		= null;

		try {

			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error)){
				return;
			}
			long startTime = System.currentTimeMillis();
			new InitializeTransportChargeConfigAction().execute(request, response);

			executive	= (Executive) request.getSession().getAttribute(AliasNameConstants.EXECUTIVE);
			cManip		= new CacheManip(request);
			
			minDateTimeStamp	= cManip.getModuleWiseMinDateToGetData(request, executive.getAccountGroupId(),
									ModuleWiseMinDateSelectionConfigurationDTO.OCTROI_ENTRY_MIN_DATE_ALLOW, 
									ModuleWiseMinDateSelectionConfigurationDTO.OCTROI_ENTRY_MIN_DATE);

			long branchId = 0;
			/*long destinationCityId   = 0;*/
			long destinationSubRegionId   = 0;
			long destinationBranchId = 0;
			if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_GROUPADMIN) {
				destinationSubRegionId 	= JSPUtility.GetLong(request, "destinationSubRegionId", 0);
				destinationBranchId = JSPUtility.GetLong(request, "destinationBranchId", 0);
			} else {
				destinationSubRegionId 	= executive.getSubRegionId();
				destinationBranchId = executive.getBranchId();
				branchId = executive.getBranchId();
			}
			long sourceSubRegionId 		= JSPUtility.GetLong(request, "originSubRegionId", 0);
			long sourceBranchId 	= JSPUtility.GetLong(request, "originBranchId", 0);
			long dispatchLedgerId	= JSPUtility.GetLong(request, "dispatchLedgerId" ,0);

			request.setAttribute("destbranches", cManip.getBothTypeOfBranchesDetails(request, ""+executive.getAccountGroupId(), ""+destinationSubRegionId));
			request.setAttribute("srcbranches", cManip.getBothTypeOfBranchesDetails(request, ""+executive.getAccountGroupId(), ""+sourceSubRegionId));

			if(dispatchLedgerId > 0) {
				if(minDateTimeStamp != null) {
					dispatchLedger = DispatchLedgerDao.getInstance().getLSForChargeConfigFromMinDate(""+dispatchLedgerId, executive.getAccountGroupId(), branchId, minDateTimeStamp);
				} else {
					dispatchLedger = DispatchLedgerDao.getInstance().getLSForChargeConfig(""+dispatchLedgerId ,executive.getAccountGroupId() ,branchId);
				}

				if(dispatchLedger != null) {
					reportModel = new OutboundmanifestReportModel[1];
					reportModel[0] = getReportModel(request ,dispatchLedger ,cManip ,executive);
				} else {
					LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO, (String) error.get("errorCode")+" "+(String) error.get("errorDescription"));
					error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
					error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
					request.setAttribute("cargoError", error);
				}

			} else {
				if(minDateTimeStamp != null) {
					dispatchLedgers = DispatchLedgerDao.getInstance().getLSListForChargeConfigFromMinDate(sourceSubRegionId, sourceBranchId, destinationSubRegionId, destinationBranchId, executive.getAccountGroupId(), minDateTimeStamp);
				} else {
					dispatchLedgers = DispatchLedgerDao.getInstance().getLSListForChargeConfig(sourceSubRegionId, sourceBranchId, destinationSubRegionId, destinationBranchId, executive.getAccountGroupId());
				}

				if(dispatchLedgers != null) {
					reportModel = new OutboundmanifestReportModel[dispatchLedgers.length];
					for(int index=0; index<dispatchLedgers.length ;index++) {
						reportModel[index] = getReportModel(request ,dispatchLedgers[index] ,cManip ,executive);
					}

				} else {
					LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO, (String) error.get("errorCode")+" "+(String) error.get("errorDescription"));
					error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
					error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
					request.setAttribute("cargoError", error);
				}
			}

			reportViewModel = new ReportViewModel();
			reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);
			request.setAttribute("ReportViewModel",reportViewModel);
			request.setAttribute("report", reportModel);
			request.setAttribute("nextPageToken", "success");

			dateFormatForTimeLog = new SimpleDateFormat("mm:ss");
			dateFormatForTimeLog.setTimeZone(TimeZone.getTimeZone("GMT"));
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO,"=====Report Generated "+BusinessFunctionConstants.CHARGECONFIG +" "+executive.getAccountGroupId()+" "+executive.getBranchId()+" "+executive.getExecutiveId()+" in "+dateFormatForTimeLog.format(new Date(System.currentTimeMillis()-startTime)));                

		} catch (Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		} finally {

		}

	}

	private OutboundmanifestReportModel getReportModel(HttpServletRequest request ,DispatchLedger dispatchLedgers ,CacheManip cManip ,Executive executive) throws Exception {

		OutboundmanifestReportModel reportModel = new OutboundmanifestReportModel();

		reportModel.setLsNumber(dispatchLedgers.getLsNumber());
		reportModel.setLsBranchId(dispatchLedgers.getLsBranchId());
		reportModel.setDispatchLedgerId(dispatchLedgers.getDispatchLedgerId());
		reportModel.setWayBillSourceSubRegion(cManip.getGenericSubRegionById(request, dispatchLedgers.getSourceSubRegionId()).getName());
		reportModel.setWayBillSourceBranch(cManip.getGenericBranchDetailCache(request,dispatchLedgers.getSourceBranchId()).getName());

		if(dispatchLedgers.getDestinationSubRegionId() > 0) {
			reportModel.setWayBillDestinationSubRegion(cManip.getGenericSubRegionById(request, dispatchLedgers.getDestinationSubRegionId()).getName());
		}
		/*if(dispatchLedgers.getDestinationCityId() > 0 && dispatchLedgers.getDestinationBranchId() > 0) {*/
		if(dispatchLedgers.getDestinationBranchId() > 0) {
			reportModel.setWayBillDestinationBranch(cManip.getGenericBranchDetailCache(request,dispatchLedgers.getDestinationBranchId()).getName());
		} else {
			reportModel.setWayBillDestinationBranch(dispatchLedgers.getDeliveryPlace());
		}

		reportModel.setConsignorName(dispatchLedgers.getTripName());
		reportModel.setDispatchDate(dispatchLedgers.getTripDateTime());
		reportModel.setVehicleNumber(dispatchLedgers.getVehicleNumber());
		reportModel.setDriver(dispatchLedgers.getDriverName());
		reportModel.setCleaner(dispatchLedgers.getCleanerName());
		reportModel.setBranchTransfer(dispatchLedgers.isBranchTransfer());

		return reportModel;
	}
}