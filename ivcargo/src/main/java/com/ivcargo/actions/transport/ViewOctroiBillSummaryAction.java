package com.ivcargo.actions.transport;

import java.util.HashMap;

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
import com.platform.dao.InvoiceCertificationSummaryDao;
import com.platform.dto.Executive;
import com.platform.dto.InvoiceCertification;
import com.platform.dto.InvoiceCertificationSummary;
import com.platform.dto.model.ReportViewModel;
import com.platform.resource.CargoErrorList;

public class ViewOctroiBillSummaryAction implements Action {
	private static final String TRACE_ID = "ViewOctroiBillSummaryAction";

	public void execute(HttpServletRequest request, HttpServletResponse response) {
		// TODO Auto-generated method stub
		HashMap<String,Object>	 	error 					= null;
		CacheManip							cache 				= null;
		Executive							executive			= null;
		ValueObject							valueobject			= null;
		InvoiceCertificationSummary[]		invCertSummaryArr	= null;
		InvoiceCertification[]				invoiceCert			= null;
		ReportViewModel						reportViewModel		= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error)){
				return;
			}
			long billId 	= JSPUtility.GetLong(request, "billId" ,0);

			if(billId > 0){

				valueobject		= InvoiceCertificationSummaryDao.getInstance().getCertifiedInvoiceSummaryById(billId);
				executive		= (Executive) request.getSession().getAttribute("executive");
				cache			= new CacheManip(request);

				invoiceCert		= InvoiceCertificationDao.getInstance().getOctroiBillDetails(""+billId);

				if(invoiceCert != null){
					invoiceCert[0].setVehicleNumber(cache.getVehicleNumber(request, executive.getAccountGroupId(), invoiceCert[0].getVehicleNumberMasterId()).getVehicleNumber());
				}
				if(valueobject != null) {

					invCertSummaryArr = (InvoiceCertificationSummary[])valueobject.get("InvoiceCertificationSummary");

					/*if(Short.parseShort(request.getParameter("billStatusId")) == CrossingAgentBill.CROSSINGAGENTBILL_CLEARANCE_STATUS_PARTIAL_PAYMENT_ID) {
							billClearances = CrossingAgentBillClearanceDAO.getInstance().getCrossingAgentBillClearanceDetailsForView(""+billId);
							request.setAttribute("BillClearanceDetails", billClearances);
						}*/

					reportViewModel = new ReportViewModel();
					reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);
					request.setAttribute("ReportViewModel",reportViewModel);

					request.setAttribute("InvCertSummaryArr", invCertSummaryArr);
					request.setAttribute("InvoiceCert", invoiceCert);
					request.setAttribute("nextPageToken", "success");
				} else {
					LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, CargoErrorList.SYSTEM_ERROR + "");
					error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
					error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
					request.setAttribute("cargoError", error);
				}
			}else {
				LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, CargoErrorList.SYSTEM_ERROR + "");
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}

		}
		catch (Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		} finally {
			cache 			= null;     
			executive		= null;     
			valueobject		= null;     
			invCertSummaryArr= null;    
			invoiceCert		 = null; 

		}
	}
}
