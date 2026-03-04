package com.ivcargo.reports;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.platform.dao.reports.ChargeConfigReportDAO;
import com.platform.dto.Executive;
import com.platform.dto.model.ReportViewModel;
import com.platform.resource.CargoErrorList;

public class ChargeConfigReportAction implements Action{
	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	 	error 					= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeChargeConfigReportAction().execute(request, response);

			final var 	sdf               	= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			final var	fromDate          	= new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00").getTime());
			final var	toDate            	= new Timestamp(sdf.parse(JSPUtility.GetString(request, "toDate") + " 23:59:59").getTime());
			final var	valueInObject		= new ValueObject();
			final var	executive         	= (Executive) request.getSession().getAttribute("executive");

			valueInObject.put("fromDate", fromDate);
			valueInObject.put("toDate", toDate);
			valueInObject.put("accountGroupId", executive.getAccountGroupId());

			final var chargeConfigHM = ChargeConfigReportDAO.getInstance().getChargeConfigDetailsForReport(valueInObject);

			if(chargeConfigHM.size() > 0){
				var reportViewModel =new ReportViewModel();
				reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);
				request.setAttribute("ReportViewModel",reportViewModel);
			} else {
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}

			request.setAttribute("chargeConfigHM", chargeConfigHM);
			request.setAttribute("nextPageToken", "success");

		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}
	}

}