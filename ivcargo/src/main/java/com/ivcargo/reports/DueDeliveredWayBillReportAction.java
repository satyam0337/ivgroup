package com.ivcargo.reports;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.TimeZone;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.logsapp.LogWriter;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.BranchTransferDao;
import com.platform.dao.ConsignmentSummaryDao;
import com.platform.dao.CustomerDetailsDao;
import com.platform.dao.ExecutiveDao;
import com.platform.dao.reports.DueDeliveredWayBillDAO;
import com.platform.dto.AliasNameConstants;
import com.platform.dto.Branch;
import com.platform.dto.ConfigParam;
import com.platform.dto.ConsignmentSummary;
import com.platform.dto.CustomerDetails;
import com.platform.dto.Executive;
import com.platform.dto.TransportCommonMaster;
import com.platform.dto.WayBillType;
import com.platform.dto.configuration.mindateselection.ReportWiseMinDateSelectionConfigurationDTO;
import com.platform.dto.constant.ExecutiveTypeConstant;
import com.platform.dto.constant.WayBillTypeConstant;
import com.platform.dto.model.BusinessFunctionConstants;
import com.platform.dto.model.DueDeliveredWayBillReportModel;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

public class DueDeliveredWayBillReportAction implements Action {

	private static final String TRACE_ID = DueDeliveredWayBillReportAction.class.getName();

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		// TODO Auto-generated method stub
		HashMap<String, Object> 			error 						= null;
		Branch[] 							branches 					= null;
		Executive	 						executive 					= null;
		CacheManip 							cManip 						= null;
		ValueObject 						valueInObject	 			= null;
		ValueObject 						valueOutObject 				= null;
		ArrayList<Long> 					wayBillAccessibility	 	= null;
		StringBuilder 						wayBillForBT 				= null;
		WayBillType 						wayBillType 				= null;
		SimpleDateFormat 					dateFormatForTimeLog 		= null;
		DueDeliveredWayBillReportModel[]	reportModel 				= null;
		String 								destBranches 				= null;
		Long[] 								wbIdsArr	 				= null;
		Long[] 								executiveIdsArr 			= null;
		String 								wbIds 						= null;
		String 								executiveIds 				= null;
		HashMap<Long, CustomerDetails> 		consignorList 				= null;
		CustomerDetails 					consignor 					= null;
		HashMap<Long, CustomerDetails> 		consigneeList 				= null;
		CustomerDetails 					consignee 					= null;
		HashMap<Long, ConsignmentSummary> 	summaryList 				= null;
		ConsignmentSummary 					summary 					= null;
		HashMap<Long, Executive> 			executiveList 				= null;
		Executive	 						executiveForReport 			= null;
		Timestamp							minDateTimeStamp			= null;
		short 								configValue 				= 0;
		long 								destBranchId 				= 0;
		long 								selectedCity 				= 0;
		long 								startTime 					= 0;

		try {
			error 	= ActionStaticUtil.getSystemErrorColl(request);
			if (ActionStaticUtil.isSystemError(request, error))
				return;

			startTime = System.currentTimeMillis();
			new InitializeDueDeliveredWayBillReportAction().execute(request, response);

			executive 	= (Executive) request.getSession().getAttribute(AliasNameConstants.EXECUTIVE);
			cManip 		= new CacheManip(request);

			minDateTimeStamp	= cManip.getReportWiseMinDateToGetData(request, executive.getAccountGroupId(),
					ReportWiseMinDateSelectionConfigurationDTO.DUE_DELIVERED_WAYBILL_REPORT_MIN_DATE_ALLOW,
					ReportWiseMinDateSelectionConfigurationDTO.DUE_DELIVERED_WAYBILL_REPORT_MIN_DATE);

			// Get the Selected Combo values
			if (request.getParameter("subRegion") != null)
				selectedCity = Long.parseLong(JSPUtility.GetString(request,"subRegion"));

			// Get all Branches
			branches = cManip.getBranchesArrayBySubRegionId(request, executive.getAccountGroupId(), selectedCity);
			request.setAttribute("branches", branches);

			valueInObject = new ValueObject();

			if (executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN) {
				destBranchId = Long.parseLong(request.getParameter("branch"));
				if (destBranchId == 0)
					destBranches = cManip.getBranchesStringById(request,executive.getAccountGroupId(),TransportCommonMaster.DATA_SUBREGION, selectedCity);
				else
					destBranches = "" + destBranchId;
			} else {
				destBranchId = executive.getBranchId();
				destBranches = "" + destBranchId;
			}

			valueInObject.put("destBranches", destBranches);
			valueInObject.put(AliasNameConstants.EXECUTIVE, executive);
			valueInObject.put(AliasNameConstants.MIN_DATE_TIMESTAMP, minDateTimeStamp);

			valueOutObject = DueDeliveredWayBillDAO.getInstance().getDueDeliveredWayBillData(valueInObject);

			if (valueOutObject != null) {

				reportModel = (DueDeliveredWayBillReportModel[]) valueOutObject.get("ReportModel");

				if (reportModel != null) {

					wayBillAccessibility 	= new ArrayList<Long>();
					wayBillForBT 			= new StringBuilder();
					configValue = cManip.getConfigValue(request,executive.getAccountGroupId(),ConfigParam.CONFIG_KEY_DELIVERY_ACCESSIBILITY);

					wbIdsArr = (Long[]) valueOutObject.get("wbIdsArr");

					if (wbIdsArr != null && wbIdsArr.length > 0) {
						wbIds = Utility.GetLongArrayToString(wbIdsArr);
						if (wbIds != null && wbIds.length() > 0) {
							summaryList = ConsignmentSummaryDao.getInstance().getLimitedConsignmentDetails(wbIds);
							consignorList = CustomerDetailsDao.getInstance().getConsignorDetailsByWayBillId(wbIds);
							consigneeList = CustomerDetailsDao.getInstance().getConsigneeDetailsByWayBillId(wbIds);
						}
					}

					executiveIdsArr = (Long[]) valueOutObject.get("executiveIdsArr");

					if (executiveIdsArr != null && executiveIdsArr.length > 0) {
						executiveIds = Utility.GetLongArrayToString(executiveIdsArr);
						if (executiveIds != null && executiveIds.length() > 0)
							executiveList = ExecutiveDao.getInstance().getExecutiveDetailsByExecutiveIds(executiveIds);
					}

					for (int i = 0; i < reportModel.length; i++) {

						if (consignorList != null) {
							consignor = consignorList.get(reportModel[i].getWayBillId());
							if (consignor != null)
								reportModel[i].setConsignorName(consignor.getName());
						}
						if (consigneeList != null) {
							consignee = consigneeList.get(reportModel[i].getWayBillId());
							if (consignee != null)
								reportModel[i].setConsigneeName(consignee.getName());
						}
						if (summaryList != null) {
							summary = summaryList.get(reportModel[i].getWayBillId());
							if (summary != null)
								reportModel[i].setNoOfPackages(summary.getQuantity());
						}
						if (executiveList != null) {
							executiveForReport = executiveList.get(reportModel[i].getExecutiveId());

							if (executiveForReport != null)
								reportModel[i].setExecutive(executiveForReport.getName());
						}

						reportModel[i].setDestinationAgencyId(cManip.getGenericBranchDetailCache(request, reportModel[i].getWayBillDestinationBranchId()).getAgencyId());
						reportModel[i].setWayBillSourceSubRegion(cManip.getGenericSubRegionById(request,reportModel[i].getWayBillSourceSubRegionId()).getName());
						reportModel[i].setWayBillSourceBranch(cManip.getGenericBranchDetailCache(request,reportModel[i].getWayBillSourceBranchId()).getName());
						reportModel[i].setWayBillDestinationSubRegion(cManip.getGenericSubRegionById(request,reportModel[i].getWayBillDestinationSubRegionId()).getName());
						reportModel[i].setWayBillDestinationBranch(cManip.getGenericBranchDetailCache(request,reportModel[i].getWayBillDestinationBranchId()).getName());

						wayBillAccessibility = wayBillAccessibility(reportModel[i], configValue, wayBillAccessibility, executive);

						wayBillType = cManip.getWayBillTypeById(request, reportModel[i].getWayBillTypeId());

						if (reportModel[i].isManual())
							reportModel[i].setWayBillType(wayBillType.getWayBillType() + WayBillTypeConstant.WAYBILL_TYPE_MANUAL);
						else
							reportModel[i].setWayBillType(wayBillType.getWayBillType());

						wayBillForBT.append("" + reportModel[i].getWayBillId());

						if (i != reportModel.length - 1)
							wayBillForBT.append(",");
					}

					request.setAttribute("BTWayBillsCollection", BranchTransferDao.getInstance().getWayBills(wayBillForBT.toString()));
					request.setAttribute("WayBillAccessibility", wayBillAccessibility);
					request.setAttribute("ReportData", reportModel);
					ActionStaticUtil.setReportViewModel(request);
					request.setAttribute("nextPageToken", "success");

					dateFormatForTimeLog = new SimpleDateFormat("mm:ss");
					dateFormatForTimeLog.setTimeZone(TimeZone.getTimeZone("GMT"));
					LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO, "=====Report Generated "
							+ BusinessFunctionConstants.DUEDELIVEREDWAYBILLREPORT
							+ " "
							+ executive.getAccountGroupId()
							+ " "
							+ executive.getBranchId()
							+ " "
							+ executive.getExecutiveId()
							+ " in "
							+ dateFormatForTimeLog.format(new Date(System.currentTimeMillis() - startTime)));

				} else {
					LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO,(String) error.get("errorCode")+" "+(String) error.get("errorDescription"));
					error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
					error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
					request.setAttribute("cargoError", error);
					request.setAttribute("nextPageToken", "success");
				}
			} else {
				LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO,(String) error.get("errorCode")+" "+(String) error.get("errorDescription"));
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
				request.setAttribute("nextPageToken", "success");
			}

		} catch (final Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		} finally {
			error 						= null;
			branches 					= null;
			executive 					= null;
			cManip 						= null;
			valueInObject	 			= null;
			valueOutObject 				= null;
			wayBillAccessibility	 	= null;
			wayBillForBT 				= null;
			wayBillType 				= null;
			dateFormatForTimeLog 		= null;
			reportModel 				= null;
			destBranches 				= null;
			wbIdsArr	 				= null;
			executiveIdsArr 			= null;
			wbIds 						= null;
			executiveIds 				= null;
			consignorList 				= null;
			consignor 					= null;
			consigneeList 				= null;
			consignee 					= null;
			summaryList 				= null;
			summary 					= null;
			executiveList 				= null;
			executiveForReport 			= null;
		}
	}

	public ArrayList<Long> wayBillAccessibility(
			DueDeliveredWayBillReportModel reportModel, short configValue,
			ArrayList<Long> wayBillAccessibility, Executive executive) {

		if ((configValue == ConfigParam.CONFIG_KEY_DELIVERED_ACCESSIBILITY_BRANCH
				&& reportModel.getWayBillDestinationBranchId() == executive
				.getBranchId()) || (configValue == ConfigParam.CONFIG_KEY_DELIVERED_ACCESSIBILITY_AGENCY
				&& reportModel.getDestinationAgencyId() == executive
				.getAgencyId()))
			wayBillAccessibility.add(reportModel.getWayBillId());
		else if (configValue == ConfigParam.CONFIG_KEY_DELIVERED_ACCESSIBILITY_CITY
				&& reportModel.getWayBillDestinationSubRegionId() == executive
				.getSubRegionId())
			wayBillAccessibility.add(reportModel.getWayBillId());

		return wayBillAccessibility;
	}
}