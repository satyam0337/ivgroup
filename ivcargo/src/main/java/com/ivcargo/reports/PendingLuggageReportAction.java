package com.ivcargo.reports;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.PendingLuggageDao;
import com.platform.dto.Branch;
import com.platform.dto.ConfigParam;
import com.platform.dto.DeliveryPending;
import com.platform.dto.Executive;
import com.platform.dto.model.PendingLuggageReport;
import com.platform.resource.CargoErrorList;

public class PendingLuggageReportAction implements Action{

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	error 					= null;
		Executive        		executive       		= null;
		Branch[]    			branches  				= null;
		long 			 		selectedSubRegion    	=  0;
		CacheManip 				cache 					= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializePendingLuggageReportAction().execute(request, response);

			cache 				= new CacheManip(request);
			executive         	= cache.getExecutive(request);

			// Get the Selected  Combo values
			if (request.getParameter("SelectDestinationSubRegion")!=null)
				selectedSubRegion  =  Long.parseLong(JSPUtility.GetString(request, "subRegion")) ;

			//Get all Branches
			branches = cache.getBothTypeOfBranchesDetails(request, ""+executive.getAccountGroupId(), ""+selectedSubRegion);
			request.setAttribute("srcBranches", branches);
			// Get All Executives

			long   branchId = 0;
			final ValueObject objectIn = new ValueObject();

			if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_GROUPADMIN)
				branchId = Long.parseLong(request.getParameter("SelectDestBranch"));
			else
				branchId = executive.getBranchId();

			objectIn.put("branchId", branchId);
			objectIn.put("accountGroupId", executive.getAccountGroupId());

			final PendingLuggageReport[] pendingLuggageReports = PendingLuggageDao.getInstance().getPendingLuggage(objectIn);

			if(pendingLuggageReports != null){
				ArrayList<Long> 					wayBillAccessibility	= new ArrayList<Long>();
				final HashMap<Long, PendingLuggageReport> resultList 				= new LinkedHashMap<Long, PendingLuggageReport>();
				final CacheManip 							cManip 					= new CacheManip(request);
				final short 								configValue 			= cManip.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_DELIVERY_ACCESSIBILITY);

				for (final PendingLuggageReport pendingLuggageReport : pendingLuggageReports) {
					wayBillAccessibility = wayBillAccessibility(pendingLuggageReport,configValue,wayBillAccessibility,executive);
					pendingLuggageReport.setSourceSubRegion(cManip.getGenericSubRegionById(request, pendingLuggageReport.getSourceSubRegionId()).getName());
					pendingLuggageReport.setSourceBranch(cManip.getGenericBranchDetailCache(request, pendingLuggageReport.getSourceBranchId()).getName());

					if(pendingLuggageReport.getStatus() == DeliveryPending.STATUS_PENDING_DELIVERY)
						resultList.put(pendingLuggageReport.getWayBillId() ,pendingLuggageReport);
					else
						resultList.remove(pendingLuggageReport.getWayBillId());
				}

				request.setAttribute("PendingLuggageReport", resultList);
				request.setAttribute("WayBillAccessibility", wayBillAccessibility);
			}else {
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}

			ActionStaticUtil.setReportViewModel(request);
			request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		} finally{
			error 			= null;
			executive       = null;
			branches  		= null;
			cache 			= null;
		}
	}

	public ArrayList<Long> wayBillAccessibility(PendingLuggageReport reportModel ,short configValue ,ArrayList<Long> wayBillAccessibility ,Executive executive){

		if((configValue == ConfigParam.CONFIG_KEY_DELIVERED_ACCESSIBILITY_BRANCH
				&& reportModel.getDestinationBranchId() == executive.getBranchId()) || (configValue == ConfigParam.CONFIG_KEY_DELIVERED_ACCESSIBILITY_SUB_REGION
				&& reportModel.getDestinationSubRegionId() == executive.getSubRegionId()))
			wayBillAccessibility.add(reportModel.getWayBillId());
		return wayBillAccessibility;
	}
}