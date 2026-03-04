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
import com.platform.dao.ExecutiveDao;
import com.platform.dao.InvoiceCertificationClearanceDao;
import com.platform.dao.InvoiceCertificationDao;
import com.platform.dao.OctroiAgentMasterDao;
import com.platform.dto.AliasNameConstants;
import com.platform.dto.Executive;
import com.platform.dto.InvoiceCertification;
import com.platform.dto.OctroiAgentMaster;
import com.platform.dto.OctroiBillClearance;
import com.platform.dto.configuration.mindateselection.ModuleWiseMinDateSelectionConfigurationDTO;
import com.platform.dto.model.BusinessFunctionConstants;
import com.platform.dto.model.ReportViewModel;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

public class GetOctroiBillClearanceDataAction implements Action {

	private static final String TRACE_ID = GetOctroiBillClearanceDataAction.class.getName();

	public void execute(HttpServletRequest request, HttpServletResponse response) {
		// TODO Auto-generated method stub
		HashMap<String,Object>	 		error 					= null;
		Executive							executive 			= null;
		CacheManip 							cManip 				= null;
		ReportViewModel 					reportViewModel 	= null;
		SimpleDateFormat 					dateFormatForTimeLog= null;
		InvoiceCertification[] 				invoiceCert			= null;
		ValueObject							outValObject		= null;
		Long[]								invoiceCertIdArray	= null;
		String								partialInvIdStr		= null;
		HashMap<Long, OctroiBillClearance> invCertClearanceHM	= null;
		OctroiBillClearance					billClearance		= null;
		OctroiAgentMaster					octAgnt				= null;
		Timestamp							minDateTimeStamp	= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request, error)) {
				return;
			}
			
			long startTime = System.currentTimeMillis();
			new InitializeOctroiBillClearanceAction().execute(request, response);

			executive 		= (Executive) request.getSession().getAttribute(AliasNameConstants.EXECUTIVE);
			long agentId 	= JSPUtility.GetLong(request, "octroiAgent", 0);
			cManip	  		=  new CacheManip(request);
			
			minDateTimeStamp	= cManip.getModuleWiseMinDateToGetData(request, executive.getAccountGroupId(), 
									ModuleWiseMinDateSelectionConfigurationDTO.OCTROI_INVOICE_PAYMENT_MIN_DATE_ALLOW, 
									ModuleWiseMinDateSelectionConfigurationDTO.OCTROI_INVOICE_PAYMENT_MIN_DATE);

			if(agentId != 0) {
				if(minDateTimeStamp != null) {
					outValObject	= InvoiceCertificationDao.getInstance().getDetailsForOctroiBillClearanceFromMinDate(agentId, executive.getAccountGroupId(), minDateTimeStamp);
				} else {
					outValObject	= InvoiceCertificationDao.getInstance().getDetailsForOctroiBillClearance(agentId, executive.getAccountGroupId());
				}
				
				octAgnt		= OctroiAgentMasterDao.getInstance().getOctroiAgentDetailsById(agentId);
			} else {
				LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO, (String) error.get("errorCode")+" "+(String) error.get("errorDescription"));
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
				return ;
			}

			if(outValObject != null) {

				invoiceCert			= (InvoiceCertification[])outValObject.get("invoiceCertArr");
				invoiceCertIdArray 	= (Long[])outValObject.get("invoiceIdArray");

				if(invoiceCert != null && invoiceCertIdArray != null) {

					if(invoiceCertIdArray.length > 0) {

						partialInvIdStr 	= Utility.GetLongArrayToString(invoiceCertIdArray);
						invCertClearanceHM 	= InvoiceCertificationClearanceDao.getInstance().getPartialOctroiBillClearanceDetails(partialInvIdStr);

						for(long key : invCertClearanceHM.keySet()){

							billClearance = invCertClearanceHM.get(key);

							billClearance.setExecutiveName(ExecutiveDao.getInstance().findByExecutiveId(billClearance.getExecutiveId()).getName());
							billClearance.setBranchName(cManip.getGenericBranchDetailCache(request,billClearance.getBranchId()).getName());
							billClearance.setAgentName(octAgnt.getName());
						}
						request.setAttribute("BillClearanceDetails", invCertClearanceHM);
					}

					for(int i = 0; i < invoiceCert.length; i++){
						invoiceCert[i].setExecutiveName(ExecutiveDao.getInstance().findByExecutiveId(invoiceCert[i].getExecutiveId()).getName());
						invoiceCert[i].setBranchName(cManip.getGenericBranchDetailCache(request,  invoiceCert[i].getBranchId()).getName());
						invoiceCert[i].setAgentName(octAgnt.getName());
					}

					request.setAttribute("BillDetailsForBillClearance", invoiceCert);
					request.setAttribute("octAgnt",octAgnt);
					reportViewModel = new ReportViewModel();
					reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);
					request.setAttribute("ReportViewModel", reportViewModel);

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
			request.setAttribute("nextPageToken", "success");

			dateFormatForTimeLog = new SimpleDateFormat("mm:ss");
			dateFormatForTimeLog.setTimeZone(TimeZone.getTimeZone("GMT"));
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO,"=====Report Generated "+BusinessFunctionConstants.CREDITORPAYMENTMODULE +" "+executive.getAccountGroupId()+" "+executive.getBranchId()+" "+executive.getExecutiveId()+" in "+dateFormatForTimeLog.format(new Date(System.currentTimeMillis()-startTime)));

		} catch (Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		} finally {
			executive 			= null;
			cManip				= null;
			reportViewModel 	= null;
			dateFormatForTimeLog= null;
			invoiceCert			= null;
			outValObject		= null;
			invoiceCertIdArray	= null;
			partialInvIdStr		= null;
			invCertClearanceHM	= null;
			billClearance		= null;
			billClearance		= null;
			octAgnt				= null;
			minDateTimeStamp	= null;
		}
	}
}
