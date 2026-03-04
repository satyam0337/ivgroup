package com.ivcargo.reports;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.logsapp.LogWriter;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.ConsignmentDetailsDao;
import com.platform.dao.CustomerDetailsDao;
import com.platform.dao.GodownReceivedSummaryDao;
import com.platform.dto.ConsignmentDetails;
import com.platform.dto.CustomerDetails;
import com.platform.dto.Executive;
import com.platform.dto.GodownReceivedSummary;
import com.platform.dto.configuration.report.ScrapGodownConfigurationDTO;
import com.platform.dto.constant.WayBillTypeConstant;
import com.platform.dto.model.ReportViewModel;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

public class ScrapGodownStockReportAction implements Action {

	private static final String TRACE_ID = "ScrapGodownStockReportAction";

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		// TODO Auto-generated method stub
		HashMap<String,Object>	 	error 					= null;

		ReportViewModel 					reportViewModel = null;
		SimpleDateFormat 					sdf            	= null;
		Timestamp        					upToDate       	= null;
		GodownReceivedSummary[]				godownStockArr	= null;
		CacheManip							cache			= null;
		Executive        					executive       = null;
		ValueObject							valueOutObject	= null;
		Long[] 								wayBillIdArray	= null;
		String								wayBillIdStr	= null;
		HashMap<Long, CustomerDetails>		consignorColl	= null;
		HashMap<Long, CustomerDetails>		consigneeColl	= null;
		HashMap<Long, ArrayList<ConsignmentDetails>> consignmentDetailsHm = null;
		var 						showBookingDate			= false;
		var 						showArticleDetails		= false;
		ValueObject 					scrapGodownConfiguration = null;
		var godownId = 0L;

		try {

			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeScrapGodownStockReportAction().execute(request, response);

			sdf			= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			upToDate	= new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate") + " 23:59:59").getTime());
			godownId	= JSPUtility.GetLong(request, "godownId" ,0);
			cache		= new CacheManip(request);
			executive	= (Executive) request.getSession().getAttribute("executive");

			scrapGodownConfiguration    = ReadAllConfigurationsBllImpl.getInstance().getOldReportConfigurationData(ReportIdentifierConstant.SCRAP_GODOWN_STOCK_REPORT, executive.getAccountGroupId());

			showBookingDate 			= scrapGodownConfiguration.getBoolean(ScrapGodownConfigurationDTO.SHOW_BOOKING_DATE, false);
			showArticleDetails 			= scrapGodownConfiguration.getBoolean(ScrapGodownConfigurationDTO.SHOW_ARTICLE_DETAILS, false);

			valueOutObject = GodownReceivedSummaryDao.getInstance().getScrapGodownStockReportData(godownId, upToDate);

			if(valueOutObject != null) {
				godownStockArr	= (GodownReceivedSummary[])valueOutObject.get("receivedSummaryArr");
				wayBillIdArray		= (Long[])valueOutObject.get("wayBillIdArray");

				if(godownStockArr != null && wayBillIdArray != null) {

					wayBillIdStr	= Utility.GetLongArrayToString(wayBillIdArray);

					consignorColl 			= CustomerDetailsDao.getInstance().getConsignorDetailsByWayBillId(wayBillIdStr);
					consigneeColl 			= CustomerDetailsDao.getInstance().getConsigneeDetailsByWayBillId(wayBillIdStr);
					consignmentDetailsHm 	= ConsignmentDetailsDao.getInstance().getConsignmentDetailsByWayBillIds(wayBillIdStr);

					for (final GodownReceivedSummary element : godownStockArr) {
						element.setWayBillType(WayBillTypeConstant.getWayBillTypeNameByWayBilTypeId(element.getWayBillTypeId()));

						final var		branch		= cache.getBranchById(request, executive.getAccountGroupId(), element.getSourceBranchId());
						final var	subRegion	= cache.getGenericSubRegionById(request, branch.getSubRegionId());

						element.setSourceBranch(branch.getName());
						element.setSourceSubregion(subRegion.getName());
						element.setDestinationBranch(cache.getBranchById(request, executive.getAccountGroupId(), element.getDestinationBranchId()).getName());
						element.setConsignorName(consignorColl.get(element.getWayBillId()).getName());
						element.setConsigneeName(consigneeColl.get(element.getWayBillId()).getName());
					}

					request.setAttribute("godownStockArr",godownStockArr);
					request.setAttribute("consignmentDetailsHm",consignmentDetailsHm);
					request.setAttribute("showBookingDate",showBookingDate);
					request.setAttribute("showArticleDetails",showArticleDetails);

					reportViewModel = new ReportViewModel();
					reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);
					request.setAttribute("ReportViewModel",reportViewModel);

					request.setAttribute("nextPageToken", "success");

				} else {
					LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO, (String) error.get("errorCode")+" "+(String) error.get("errorDescription"));
					error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
					error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
					request.setAttribute("cargoError", error);
				}

			} else {
				LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO, (String) error.get("errorCode")+" "+(String) error.get("errorDescription"));
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}

			request.setAttribute("nextPageToken", "success");

		} catch (final Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		} finally {
			reportViewModel 		= null;
			sdf            			= null;
			upToDate       			= null;
			cache					= null;
			executive         		= null;
			valueOutObject			= null;
			wayBillIdArray			= null;
		}
	}
}
