package com.ivcargo.reports;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.logsapp.LogWriter;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.platform.dao.InvoiceCertificationSummaryDao;
import com.platform.dto.InvoiceCertificationSummary;
import com.platform.dto.model.ReportViewModel;
import com.platform.resource.CargoErrorList;

public class ViewCertifiedInvoiceReportAction implements Action {

	private static final String TRACE_ID = "ViewCertifiedInvoiceReportAction";

	public void execute(HttpServletRequest request, HttpServletResponse response) {
		// TODO Auto-generated method stub
		HashMap<String,Object>	 		error 					= null;
		InvoiceCertificationSummary[]	reportModel 			= null;
		ReportViewModel 				reportViewModel 		= null;
		ValueObject 					objectOut 				= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error)){
				return;
			}

			long invoiceCertificationId = JSPUtility.GetLong(request, "InvoiceCertificationId" ,0);

			objectOut 	= InvoiceCertificationSummaryDao.getInstance().getCertifiedInvoiceSummaryById(invoiceCertificationId);

			if(objectOut != null) {

				reportModel 	= (InvoiceCertificationSummary[])objectOut.get("InvoiceCertificationSummary");

				if (reportModel != null) {

					request.setAttribute("InvoiceCertificationSummary", reportModel);

				} else {
					LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO, (String) error.get("errorCode")+ " " +(String) error.get("errorDescription"));
					error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
					error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
					request.setAttribute("cargoError", error);
				}

				reportViewModel = new ReportViewModel();
				reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);
				request.setAttribute("ReportViewModel",reportViewModel);

			} else {
				LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO, (String) error.get("errorCode")+ " " +(String) error.get("errorDescription"));
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}

			request.setAttribute("nextPageToken", "success");

		} catch (Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		} finally {
			reportModel 			= null;
			reportViewModel 		= null;
			objectOut 				= null;
		}

	}
}