package com.ivcargo.reports;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.HashMap;
import java.util.LinkedHashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.ObjectUtils;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.dto.constant.ExecutiveTypeConstant;
import com.iv.dto.constant.WayBillTypeConstant;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.reports.BranchStatisticsReportDAO;
import com.platform.dto.Executive;
import com.platform.dto.TransportCommonMaster;
import com.platform.dto.model.BranchStatisticsReport;
import com.platform.dto.model.BranchStatisticsReportModel;
import com.platform.resource.CargoErrorList;

public class BranchStatisticsReportAction implements Action {

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	error 				= null;
		String					strBranches			= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeBranchStatisticsReportAction().execute(request, response);

			final var	executive         	= (Executive) request.getSession().getAttribute("executive");
			final var	sdf               	= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			final var	fromDate          	= new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00").getTime());
			final var	toDate            	= new Timestamp(sdf.parse(JSPUtility.GetString(request, "toDate") + " 23:59:59").getTime());
			final var	cache				= new CacheManip(request);
			var 	selectedCity= 0L;
			var   	branchId 	= 0L;

			if(executive.getExecutiveType()==ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN){
				selectedCity  	= JSPUtility.GetLong(request, "subRegion", 0);
				branchId 		= Long.parseLong(request.getParameter("branch"));

				if(branchId == 0)
					strBranches = cache.getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_SUBREGION, selectedCity);
				else
					strBranches = Long.toString(branchId);
			} else {
				selectedCity	= executive.getSubRegionId();
				branchId 		= executive.getBranchId();
				strBranches 	= Long.toString(branchId);
			}

			//Get all Branches
			request.setAttribute("branches", cache.getBranchesArrayBySubRegionId(request, executive.getAccountGroupId(), selectedCity));

			final var	reportModel = BranchStatisticsReportDAO.getInstance().getBranchStatisticsReport(executive.getAccountGroupId(), fromDate, toDate, strBranches);

			if(ObjectUtils.isNotEmpty(reportModel)) {
				final HashMap<Long,BranchStatisticsReportModel> 	sourceCityWiseData		= new LinkedHashMap<>();
				final HashMap<Long,BranchStatisticsReportModel> 	destinationCityWiseData	= new LinkedHashMap<>();

				for (final BranchStatisticsReport element : reportModel) {
					var	branch = cache.getGenericBranchDetailCache(request, element.getSourceBranchId());

					//-----------------------------Source City Wise Data--------------------------------------------
					if(branch.getSubRegionId() == selectedCity){
						var	model = sourceCityWiseData.get(element.getDestinationBranchId());

						if(model == null){
							model = new BranchStatisticsReportModel();

							model.setSourceSubRegionName(cache.getGenericSubRegionById(request, element.getSourceSubRegionId()).getName());
							model.setSourceBranchName(cache.getGenericBranchDetailCache(request, element.getSourceBranchId()).getName());
							model.setDestinationSubRegionName(cache.getGenericSubRegionById(request, element.getDestinationSubRegionId()).getName());
							model.setDestinationBranchName(cache.getGenericBranchDetailCache(request, element.getDestinationBranchId()).getName());

							if(element.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID)
								model.setTotalPaidAmount(element.getGrandTotal());
							else if(element.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY)
								model.setTotalToPayAmount(element.getGrandTotal());
							else if(element.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT)
								model.setTotalCreditAmount(element.getGrandTotal());

							sourceCityWiseData.put(element.getDestinationBranchId() ,model);
						} else if(element.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID)
							model.setTotalPaidAmount(model.getTotalPaidAmount() + element.getGrandTotal());
						else if(element.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY)
							model.setTotalToPayAmount(model.getTotalToPayAmount() + element.getGrandTotal());
						else if(element.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT)
							model.setTotalCreditAmount(model.getTotalCreditAmount() + element.getGrandTotal());
					}
					//-----------------------------Source City Wise Data--------------------------------------------

					//-----------------------------Destination City Wise Data--------------------------------------------

					branch = cache.getGenericBranchDetailCache(request, element.getDestinationBranchId());

					if(branch.getSubRegionId() == selectedCity){
						var	modelDest = destinationCityWiseData.get(element.getSourceBranchId());

						if(modelDest == null) {
							modelDest = new BranchStatisticsReportModel();

							modelDest.setSourceSubRegionName(cache.getGenericSubRegionById(request, element.getSourceSubRegionId()).getName());
							modelDest.setSourceBranchName(cache.getGenericBranchDetailCache(request, element.getSourceBranchId()).getName());
							modelDest.setDestinationSubRegionName(cache.getGenericSubRegionById(request, element.getDestinationSubRegionId()).getName());
							modelDest.setDestinationBranchName(cache.getGenericBranchDetailCache(request, element.getDestinationBranchId()).getName());

							if(element.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID)
								modelDest.setTotalPaidAmount(element.getGrandTotal());
							else if(element.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY)
								modelDest.setTotalToPayAmount(element.getGrandTotal());
							else if(element.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT)
								modelDest.setTotalCreditAmount(element.getGrandTotal());

							destinationCityWiseData.put(element.getSourceBranchId() ,modelDest);

						} else if(element.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID)
							modelDest.setTotalPaidAmount(modelDest.getTotalPaidAmount() + element.getGrandTotal());
						else if(element.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY)
							modelDest.setTotalToPayAmount(modelDest.getTotalToPayAmount() + element.getGrandTotal());
						else if(element.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT)
							modelDest.setTotalCreditAmount(modelDest.getTotalCreditAmount() + element.getGrandTotal());
					}
					//-----------------------------Destination City Wise Data--------------------------------------------

				}

				request.setAttribute("sourceCityWiseData",sourceCityWiseData);
				request.setAttribute("destinationCityWiseData",destinationCityWiseData);

				ActionStaticUtil.setReportViewModel(request);
				request.setAttribute("nextPageToken", "success");
			} else {
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}
}