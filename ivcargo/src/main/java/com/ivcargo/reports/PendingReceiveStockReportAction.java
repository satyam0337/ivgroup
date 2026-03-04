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
import com.ivcargo.utils.CacheManip;
import com.platform.dao.reports.UndeliveredToPayWayBillDAO;
import com.platform.dto.Branch;
import com.platform.dto.Executive;
import com.platform.dto.model.UndeliveredToPayWayBillReportModel;
import com.platform.resource.CargoErrorList;

@Deprecated
public class PendingReceiveStockReportAction implements Action{

	@Override
	@SuppressWarnings("rawtypes")
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object> error 		= null;
		Executive        	executive   	= null;
		SimpleDateFormat 	sdf         	= null;
		Timestamp        	fromDate    	= null;
		Timestamp        	toDate      	= null;
		Branch[]    		branches		= null;
		long 				selectedSubRegion    =  0;
		long   				branchId 		=  0;
		final long   		agencyId 		=  0;
		long   				subRegionId 	=  0;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializePendingReceiveStockReportAction().execute(request, response);

			sdf         	= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			fromDate    	= new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00").getTime());
			toDate      	= new Timestamp(sdf.parse(JSPUtility.GetString(request, "toDate") + " 23:59:59").getTime());

			final ValueObject objectIn 	= new ValueObject();
			ValueObject objectOut 	= new ValueObject();
			final CacheManip 	cacheManip 	= new CacheManip(request);

			executive   	= cacheManip.getExecutive(request);

			// Get the Selected  Combo values
			if(request.getParameter("subRegion")!=null)
				selectedSubRegion  =  Long.parseLong(JSPUtility.GetString(request, "subRegion")) ;

			//Get all Branches
			branches = cacheManip.getBothTypeOfBranchesDetails(request, ""+executive.getAccountGroupId(), ""+selectedSubRegion);
			request.setAttribute("branches", branches);

			if(executive.getExecutiveType()==Executive.EXECUTIVE_TYPE_GROUPADMIN){
				branchId = Long.parseLong(request.getParameter("branch"));

				if(branchId == 0){
					subRegionId = Long.parseLong(request.getParameter("subRegion"));
					objectIn.put("subRegionId", subRegionId);
				}
			} else if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_EXECUTIVE || executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_BRANCHADMIN || executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_LIMITED)
				branchId = executive.getBranchId();

			objectIn.put("branchId", branchId);
			objectIn.put("executive", executive);
			objectIn.put("fromDate", fromDate);
			objectIn.put("toDate", toDate);

			objectOut= UndeliveredToPayWayBillDAO.getInstance().getReportForBranch(objectIn);
			final UndeliveredToPayWayBillReportModel[] reportModel = (UndeliveredToPayWayBillReportModel[])objectOut.get("ReportModel");

			request.setAttribute("branchId", branchId);
			request.setAttribute("subRegionId", subRegionId);
			request.setAttribute("agencyId", agencyId);

			if(reportModel != null) {
				final HashMap hashMap = (HashMap)objectOut.get("Collection");
				request.setAttribute("Collection", hashMap);
				ActionStaticUtil.setReportViewModel(request);
				request.setAttribute("nextPageToken", "success");
			} else {
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		} finally{
			error 			= null;
			executive   	= null;
			sdf         	= null;
			fromDate    	= null;
			toDate      	= null;
			branches		= null;
		}
	}
}