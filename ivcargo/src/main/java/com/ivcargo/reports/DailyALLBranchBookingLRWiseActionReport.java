package com.ivcargo.reports;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.Arrays;
import java.util.HashMap;
import java.util.TreeMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.ObjectUtils;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.dto.constant.FeildPermissionsConstant;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.reports.initialize.InitializeDailyALLBranchBookingLRWiseReport;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.ConsignmentSummaryDao;
import com.platform.dao.CustomerDetailsDao;
import com.platform.dao.reports.DailyALLBranchBookingLRWiseReportDAO;
import com.platform.dto.Executive;
import com.platform.dto.configuration.report.collection.DailyAllBranchLRWiseReportDTO;
import com.platform.dto.model.DailyALLBranchBookingLRWiseReportModel;
import com.platform.dto.model.ReportViewModel;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

public class DailyALLBranchBookingLRWiseActionReport implements Action{

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	error 	= null;

		TreeMap<String,DailyALLBranchBookingLRWiseReportModel>  				lrWiseMap = null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeDailyALLBranchBookingLRWiseReport().execute(request, response);

			final var	sdf         = new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			final var	executive 	= (Executive) request.getSession().getAttribute("executive");
			final var	fromDate    = new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00").getTime());
			final var	toDate      = new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate") + " 23:59:59").getTime());
			final var	objectIn 	= new ValueObject();
			objectIn.put("fromDate", fromDate);
			objectIn.put("toDate", toDate);
			objectIn.put("accountGroupId", executive.getAccountGroupId());
			final var	objectOut 	= DailyALLBranchBookingLRWiseReportDAO.getInstance().getDailyALLBranchBookingLRWiseReportData(objectIn);
			final var	cache 		= new CacheManip(request);

			final var deliveryLocationList					= cache.getAssignedLocationsIdListByLocationIdId(request, executive.getBranchId(), executive.getAccountGroupId());
			final var configObject							= ReadAllConfigurationsBllImpl.getInstance().getOldReportConfigurationData(ReportIdentifierConstant.BOOKING_SUMMARY_REPORT, executive.getAccountGroupId());
			final var execFldPermissionsHM 					= cache.getExecutiveFieldPermission(request);
			final var customErrorOnOtherBranchDetailSearch	= configObject.getBoolean(DailyAllBranchLRWiseReportDTO.CUSTOM_ERROR_ON_OTHER_BRANCH_DETAIL_SEARCH,false);
			final var isSearchDataForOwnBranchOnly			= configObject.getBoolean(DailyAllBranchLRWiseReportDTO.IS_SEARCH_DATA_FOR_OWN_BRANCH_ONLY, false);
			final var isAllowToSearchAllBranchReportData	= execFldPermissionsHM != null && execFldPermissionsHM.containsKey(FeildPermissionsConstant.ALLOW_TO_SEARCH_ALL_BRANCH_REPORT_DATA);
			final var	valObjSelection 					= ActionStaticUtil.reportSelection(request, executive);
			final long	branchId 							= (Long)valObjSelection.get("branchId");
			
			if(objectOut != null){
				final var	wayBillIdArray 	= (Long[])objectOut.get("WayBillIdArray");
				final var	wayBillIdsStr	= Utility.GetLongArrayToString(wayBillIdArray);
				final var	pkgsColl		= ConsignmentSummaryDao.getInstance().getLimitedConsignmentDetails(wayBillIdsStr);//Get Packages Data for both Summary & Details
				final var	consignorColl	= CustomerDetailsDao.getInstance().getConsignorDetailsByWayBillId(wayBillIdsStr);
				final var	consigneeColl 	= CustomerDetailsDao.getInstance().getConsigneeDetailsByWayBillId(wayBillIdsStr);

				final var	branchMap = new TreeMap<String,TreeMap<String,DailyALLBranchBookingLRWiseReportModel>>();

				var	reportModel     = (DailyALLBranchBookingLRWiseReportModel[])objectOut.get("reportModelArr");
				
				if(ObjectUtils.isNotEmpty(reportModel) && isSearchDataForOwnBranchOnly && !isAllowToSearchAllBranchReportData){
					reportModel = Arrays.stream(reportModel).filter(report -> executive.getBranchId() == report.getWayBillSourceBranchId()
							|| executive.getBranchId() == report.getWayBillDestinationBranchId()
							|| (deliveryLocationList != null && (deliveryLocationList.contains(report.getWayBillSourceBranchId())
							|| deliveryLocationList.contains(report.getWayBillDestinationBranchId())))).toArray(DailyALLBranchBookingLRWiseReportModel[]::new);
				}
				
				if(ObjectUtils.isNotEmpty(reportModel)){
					for (final DailyALLBranchBookingLRWiseReportModel element : reportModel) {
						element.setNoOfPackages(pkgsColl.get(element.getWayBillId()).getQuantity());
						element.setConsignorName(consignorColl.get(element.getWayBillId()).getName());
						element.setConsigneeName(consigneeColl.get(element.getWayBillId()).getName());
						element.setWayBillSourceBranch(cache.getBranchById(request, executive.getAccountGroupId(), element.getWayBillSourceBranchId()).getName());
						element.setWayBillType(cache.getWayBillTypeById(request, element.getWayBillTypeId()).getWayBillType());
	
						if(element.isManual())
							element.setWayBillType(element.getWayBillType()+"(Manual)");
	
						if(branchMap.containsKey(element.getWayBillSourceBranch()))
							lrWiseMap = branchMap.get(element.getWayBillSourceBranch());
						else
							lrWiseMap = new TreeMap<>();
	
						lrWiseMap.put(element.getWayBillNumber(), element);
						branchMap.put(element.getWayBillSourceBranch(), lrWiseMap);
					}
	
					request.setAttribute("report", reportModel);
					request.setAttribute("BranchMap", branchMap);
	
					var	reportViewModel = new ReportViewModel();
	
					reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);
					request.setAttribute("ReportViewModel",reportViewModel);
	
					request.setAttribute("nextPageToken", "success");
				}else if(customErrorOnOtherBranchDetailSearch){
					error.put("errorCode", CargoErrorList.OTHER_BRANCH_REPORT_DATA_SEARCH_ERROR);
					if(branchId > 0)
						error.put("errorDescription", "Kindly Contact Source Branch For Report");
					else
						error.put("errorDescription", "Kindly Contact Respective Branches For Report");

					request.setAttribute("cargoError", error);
				}else{
						error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
						error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
						request.setAttribute("cargoError", error);
				}
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
