package com.ivcargo.reports;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.HashMap;
import java.util.SortedMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.BranchWiseServiceTaxReportBLL;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.Branch;
import com.platform.dto.Executive;
import com.platform.dto.model.BranchWiseServiceTaxSummaryReportModel;
import com.platform.resource.CargoErrorList;

public class BranchWiseServiceTaxSummaryReportAction  implements Action {

	@Override
	@SuppressWarnings("unchecked")
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	 		error 					= null;
		SimpleDateFormat 				sdf            			= null;
		CacheManip 					    cache 				    = null;
		Timestamp        				toDate         			= null;
		Timestamp        				fromDate       			= null;
		Executive        				executive   			= null;
		ValueObject 					objectOut				= null;
		ValueObject						valueInObject			= null;
		BranchWiseServiceTaxReportBLL   branchWiseSTReportBLL	= null;
		HashMap<Long,Branch>			allGroupBranches		= null;
		String  						branchesIds 			= null;
		SortedMap<String, BranchWiseServiceTaxSummaryReportModel>      resultSumaryBKGHM= null;
		SortedMap<String, BranchWiseServiceTaxSummaryReportModel>      resultSumaryDLYHM= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeServiceTaxSummaryReportAction().execute(request, response);

			sdf			= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			fromDate	= new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00").getTime());
			toDate		= new Timestamp(sdf.parse(JSPUtility.GetString(request, "toDate") + " 23:59:59").getTime());
			cache  		= new CacheManip(request);
			executive   = cache.getExecutive(request);

			ActionStaticUtil.executiveTypeWiseBranches(request, cache, executive);

			branchesIds	= ActionStaticUtil.getBranchIdsWithAssignedLocation(request, cache, executive);

			allGroupBranches = cache.getAllGroupBranches(request, executive.getAccountGroupId());

			valueInObject = new ValueObject();
			valueInObject.put("accountGroupId", executive.getAccountGroupId());
			valueInObject.put("branchesIds", branchesIds);
			valueInObject.put("fromDate", fromDate);
			valueInObject.put("toDate", toDate);
			valueInObject.put("allGroupBranches", allGroupBranches);

			branchWiseSTReportBLL = new BranchWiseServiceTaxReportBLL();
			objectOut	= branchWiseSTReportBLL.getBranchWiseServiceTax(valueInObject);

			if (objectOut != null) {
				if(objectOut.get("resultSumaryBKGHM") != null)
					resultSumaryBKGHM = (SortedMap<String, BranchWiseServiceTaxSummaryReportModel> )objectOut.get("resultSumaryBKGHM");

				if(objectOut.get("resultSumaryDLYHM") != null)
					resultSumaryDLYHM = (SortedMap<String, BranchWiseServiceTaxSummaryReportModel> )objectOut.get("resultSumaryDLYHM");

				request.setAttribute("resultSumaryBKGHM", resultSumaryBKGHM);
				request.setAttribute("resultSumaryDLYHM", resultSumaryDLYHM);
			} else {
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}

			ActionStaticUtil.setReportViewModel(request);
			request.setAttribute("nextPageToken", "success");
		} catch (final Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		} finally {
			error 					= null;
			sdf            			= null;
			cache 				    = null;
			toDate         			= null;
			fromDate       			= null;
			executive   			= null;
			objectOut				= null;
			valueInObject			= null;
			branchWiseSTReportBLL	= null;
			allGroupBranches		= null;
			branchesIds 			= null;
			resultSumaryBKGHM		= null;
			resultSumaryDLYHM		= null;
		}
	}
}