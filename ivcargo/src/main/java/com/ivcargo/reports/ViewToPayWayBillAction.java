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
import com.platform.dto.Executive;
import com.platform.dto.model.ReportViewModel;
import com.platform.dto.model.SourceCityUnDeliveredWayBillDetails;
import com.platform.dto.model.UndeliveredToPayWayBillReportModel;
import com.platform.resource.CargoErrorList;


public class ViewToPayWayBillAction implements Action {

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	 				error 				= null;

		Executive 								executive 			= null;
		SimpleDateFormat 						sdf        			= null;
		Timestamp        						fromDateT			= null;
		Timestamp        						toDateT    			= null;
		ValueObject 							objectIn 			= null;
		ValueObject 							objectOut 			= null;
		ReportViewModel 						reportViewModel 	= null;
		HashMap<Long, Object> 					srcCityUnDelvdHM	= null;
		UndeliveredToPayWayBillReportModel[] 	reportModel			= null;
		SourceCityUnDeliveredWayBillDetails 	model				= null;
		CacheManip 								cacheManip 			= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error))
				return;
			final long   branchId 	= Long.parseLong(request.getParameter("branchId"));
			final long   subRegionId 		= Long.parseLong(request.getParameter("subRegionId"));

			executive 	= (Executive) request.getSession().getAttribute("executive");
			sdf        	= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			fromDateT	= new Timestamp(sdf.parse(JSPUtility.GetString(request, "date") + " 00:00:00").getTime());
			toDateT    	= new Timestamp(sdf.parse(JSPUtility.GetString(request, "date") + " 23:59:59").getTime());
			objectIn 	= new ValueObject();
			objectOut 	= new ValueObject();
			cacheManip  = new CacheManip(request);

			objectIn.put("branchId", branchId);
			objectIn.put("subRegionId", subRegionId);
			objectIn.put("fromDateT", fromDateT);
			objectIn.put("toDateT", toDateT);
			objectIn.put("executive", executive);
			objectIn.put("status", request.getParameter("status"));

			objectOut= UndeliveredToPayWayBillDAO.getInstance().getToPayWayBillForBranch(objectIn);

			reportModel = (UndeliveredToPayWayBillReportModel[])objectOut.get("ReportModel");

			reportViewModel = new ReportViewModel();
			reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);
			request.setAttribute("ReportViewModel",reportViewModel);

			if(reportModel != null){

				srcCityUnDelvdHM = new HashMap<Long, Object>();

				for (final UndeliveredToPayWayBillReportModel element : reportModel) {

					// Set City & Branch name
					element.setWayBillSourceSubRegion(cacheManip.getGenericSubRegionById(request, element.getWayBillSourceSubRegionId()).getName());
					element.setWayBillSourceBranch(cacheManip.getGenericBranchDetailCache(request, element.getWayBillSourceBranchId()).getName());
					element.setWayBillDestinationSubRegion(cacheManip.getGenericSubRegionById(request, element.getWayBillDestinationSubRegionId()).getName());
					element.setWayBillDestinationBranch(cacheManip.getGenericBranchDetailCache(request, element.getWayBillDestinationBranchId()).getName());
					// Set City & Branch name

					model = (SourceCityUnDeliveredWayBillDetails)srcCityUnDelvdHM.get(element.getWayBillSourceSubRegionId());

					if(model == null) {
						model = new SourceCityUnDeliveredWayBillDetails();
						model.setSourceSubRegionName(element.getWayBillSourceSubRegion());
						model.setTotalNoOfPkgs(element.getNoOfPackages());
						model.setTotalAmount(element.getGrandTotal());
						srcCityUnDelvdHM.put(element.getWayBillSourceSubRegionId(), model);
					} else {
						model.setTotalNoOfPkgs(model.getTotalNoOfPkgs() + element.getNoOfPackages());
						model.setTotalAmount(model.getTotalAmount() + element.getGrandTotal());
					}
				}

				request.setAttribute("srcCityUnDelvdHM", srcCityUnDelvdHM);
				request.setAttribute("reportModel", reportModel);
				request.setAttribute("date", JSPUtility.GetString(request, "date"));
				request.setAttribute("subRegionId", subRegionId);
				request.setAttribute("status", request.getParameter("status"));
			} else {
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}
			request.setAttribute("nextPageToken", "success");
		} catch (final Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		} finally {
			executive 			= null;
			sdf        			= null;
			fromDateT			= null;
			toDateT    			= null;
			objectIn 			= null;
			objectOut 			= null;
			reportViewModel 	= null;
			srcCityUnDelvdHM	= null;
			reportModel			= null;
			model				= null;
			cacheManip 			= null;
		}
	}
}
