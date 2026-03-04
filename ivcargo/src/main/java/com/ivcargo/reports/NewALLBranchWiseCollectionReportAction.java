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
import com.ivcargo.reports.initialize.InitializeNewALLBranchWiseCollectionReport;
import com.platform.dao.reports.NewAllBranchWiseCollectionReportDao;
import com.platform.dto.Executive;
import com.platform.dto.model.ReportViewModel;
import com.platform.resource.CargoErrorList;

public class NewALLBranchWiseCollectionReportAction implements Action{

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	error 	= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeNewALLBranchWiseCollectionReport().execute(request, response);

			final var 	sdf         = new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			final var   		executive 	= (Executive) request.getSession().getAttribute("executive");
			final var 		objectIn 	= new ValueObject();
			var 		objectOut 	= new ValueObject();
			final var        	fromDate    = new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00").getTime());
			final var        	toDate      = new Timestamp(sdf.parse(JSPUtility.GetString(request, "toDate") + " 23:59:59").getTime());
			var reportViewModel =new ReportViewModel();

			objectIn.put("fromDate", fromDate);
			objectIn.put("toDate", toDate);
			objectIn.put("accountGroupId", executive.getAccountGroupId());

			objectOut 		= NewAllBranchWiseCollectionReportDao.getInstance().getAllBranchWiseCollectionReportDao(objectIn);
			reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);

			if(objectOut != null){
				request.setAttribute("ReportViewModel",reportViewModel);
				request.setAttribute("allBranchWiseCollection",objectOut.get("allBranchWiseCollection"));
				request.setAttribute("nextPageToken", "success");
			} else {
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}
		} catch (final Exception _e) {
			ActionStaticUtil.catchActionException(request, _e, error);
		}
	}
}
