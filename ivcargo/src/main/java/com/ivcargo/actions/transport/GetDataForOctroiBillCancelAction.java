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
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.reports.ReportView;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.InvoiceCertificationDao;
import com.platform.dto.AliasNameConstants;
import com.platform.dto.Executive;
import com.platform.dto.InvoiceCertification;
import com.platform.dto.configuration.mindateselection.ModuleWiseMinDateSelectionConfigurationDTO;
import com.platform.dto.model.BusinessFunctionConstants;
import com.platform.dto.model.ReportViewModel;
import com.platform.resource.CargoErrorList;

public class GetDataForOctroiBillCancelAction implements Action {

	private static final String TRACE_ID =  GetDataForOctroiBillCancelAction.class.getName();

	public void execute(HttpServletRequest request, HttpServletResponse response) {
		// TODO Auto-generated method stub

		HashMap<String,Object>	 		error 				= null;
		Executive						executive 			= null;
		CacheManip 						cache 				= null;
		ReportViewModel 				reportViewModel 	= null;
		SimpleDateFormat 				dateFormatForTimeLog= null;
		InvoiceCertification[] 			bills 				= null;
		ValueObject						outValObject		= null;
		Timestamp						minDateTimeStamp	= null;

		try {

			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error)){
				return;
			}

			long startTime = System.currentTimeMillis();
			new InitializeOctroiBillCancellationAction().execute(request, response);

			cache 				= new CacheManip(request);
			executive 			= (Executive) request.getSession().getAttribute(AliasNameConstants.EXECUTIVE);
			minDateTimeStamp	= cache.getModuleWiseMinDateToGetData(request, executive.getAccountGroupId(), 
									ModuleWiseMinDateSelectionConfigurationDTO.OCTROI_BILL_CANCEL_MIN_DATE_ALLOW, 
									ModuleWiseMinDateSelectionConfigurationDTO.OCTROI_BILL_CANCEL_MIN_DATE);
			
			long agentId 	= JSPUtility.GetLong(request, "AgentId", 0);

			if(agentId != 0) {
				outValObject 	= InvoiceCertificationDao.getInstance().getOctroiBillDetailsForCancellation(agentId,executive.getAccountGroupId(), minDateTimeStamp);

				if(outValObject != null) {

					bills = (InvoiceCertification[])outValObject.get("BillDetailsForCancelingBill");

					if(bills != null) {

						for (int i = 0; i < bills.length; i++) {
							bills[i].setBranchId(bills[i].getBranchId());
							bills[i].setBranchName((cache.getGenericBranchDetailCache(request,bills[i].getBranchId())).getName());
							bills[i].setVehicleNumber(cache.getVehicleNumber(request, executive.getAccountGroupId(),bills[i].getVehicleNumberMasterId()).getVehicleNumber());
						}
						request.setAttribute("BillDetailsForCancelingBill", bills);

						reportViewModel = new ReportViewModel();
						reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);
						request.setAttribute("ReportViewModel",reportViewModel);

					} else {
						LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, CargoErrorList.SYSTEM_ERROR + "");
						error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
						error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
						request.setAttribute("cargoError", error);
					}

				} else {
					LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, CargoErrorList.SYSTEM_ERROR + "");
					error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
					error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
					request.setAttribute("cargoError", error);
				}

			} else {
				LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO, (String) error.get("errorCode")+" "+(String) error.get("errorDescription"));
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}

			request.setAttribute("nextPageToken", "success");

			dateFormatForTimeLog = new SimpleDateFormat("mm:ss");
			dateFormatForTimeLog.setTimeZone(TimeZone.getTimeZone("GMT"));
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO,"=====Report Generated "+BusinessFunctionConstants.CREDITORPAYMENTMODULE +" "+executive.getAccountGroupId()+" "+executive.getBranchId()+" "+executive.getExecutiveId()+" in "+dateFormatForTimeLog.format(new Date(System.currentTimeMillis()-startTime)));

		} catch (Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);			
		} finally {
			executive 			= null;
			cache 				= null;
			reportViewModel 	= null;
			dateFormatForTimeLog= null;
			bills 				= null;
			outValObject		= null;
			bills 				= null;
			minDateTimeStamp	= null;
		}

	}
}