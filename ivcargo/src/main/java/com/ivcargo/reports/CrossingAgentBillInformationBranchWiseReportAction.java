package com.ivcargo.reports;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringUtils;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.constant.Constant;
import com.iv.utils.constant.DateTimeFormatConstant;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.utility.CollectionUtility;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.DispatchLedgerDao;
import com.platform.dao.WayBillDao;
import com.platform.dao.reports.CrossingAgentBillInformationBranchWiseDAO;
import com.platform.dao.reports.CrossingAgentBillSummaryDAO;
import com.platform.dto.Branch;
import com.platform.dto.DispatchLedger;
import com.platform.dto.Executive;
import com.platform.dto.SubRegion;
import com.platform.dto.TransportCommonMaster;
import com.platform.dto.WayBill;
import com.platform.dto.configuration.report.CrossingAgentBilledInformationReportConfigurationDTO;
import com.platform.dto.model.CrossingAgentBillInformationBranchWiseReport;
import com.platform.dto.model.ReportViewModel;
import com.platform.resource.CargoErrorList;

public class CrossingAgentBillInformationBranchWiseReportAction implements Action {

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	 										error 				= null;
		Executive        												executive         	= null;
		SimpleDateFormat 												sdf               	= null;
		Timestamp        												fromDate          	= null;
		Timestamp        												toDate            	= null;
		ValueObject 													objectIn 			= null;
		ReportViewModel 												reportViewModel 	= null;
		Map<String, Map<String, Map<String, CrossingAgentBillInformationBranchWiseReport>>> subRegionWiseData 	= null;
		Map<String, List<CrossingAgentBillInformationBranchWiseReport>>						agentWiseColl  		= null;
		List<CrossingAgentBillInformationBranchWiseReport>									reportModel			= null;
		CacheManip						cache				= null;
		String							branchIds			= null;
		Map<Long, String>				lrBillSumColl			= null;
		Map<Long, String>				lsBillSumColl			= null;
		var				quantity		= 0;
		var			actualWeight	= 0.00;
		Short			reportType		= 0;
		Short			mainReportType	= 0;
		var			crossingAgentId	= 0L;
		final var id = 0L;
		ValueObject					reportConfig								= null;
		var						showCrossingAgentBilledInformationLrWise	= false;
		var     					monthDuration    							= 0;
		String 						fromDateStr       							= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeCrossingAgentBillInformationBranchWiseReportAction().execute(request, response);

			monthDuration   = JSPUtility.GetInt(request, "timeDuration", 0);

			sdf			= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");

			if(monthDuration > 0) {
				fromDateStr	= DateTimeUtility.getPreviousDateByMonth(DateTimeUtility.getCurrentTimeStamp(), monthDuration);
				fromDate	= DateTimeUtility.getTimeStamp(fromDateStr);
				toDate		= DateTimeUtility.getCurrentTimeStamp();
			} else {
				fromDate	= new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00").getTime());
				toDate		= new Timestamp(sdf.parse(JSPUtility.GetString(request, "toDate") + " 23:59:59").getTime());
			}

			objectIn	= new ValueObject();
			cache       = new CacheManip(request);
			executive	= cache.getExecutive(request);
			reportType			= JSPUtility.GetShort(request, "reportType",(short)0);
			mainReportType		= JSPUtility.GetShort(request, "mainReportType");
			crossingAgentId		= JSPUtility.GetLong(request, "crossingAgentId",0);
			reportConfig	= ReadAllConfigurationsBllImpl.getInstance().getOldReportConfigurationData(ReportIdentifierConstant.CROSSING_AGENT_BILL_INFORMATION_BRANCH_WISE_REPORT, executive.getAccountGroupId());
			showCrossingAgentBilledInformationLrWise		= reportConfig.getBoolean(CrossingAgentBilledInformationReportConfigurationDTO.SHOW_CROSSING_AGENT_BILLED_INFORMATION_LR_WISE, false);

			if(mainReportType > 0 && (reportType > 0 || crossingAgentId > 0)) {
				if(reportType > 0) {
					ActionStaticUtil.executiveTypeWiseBranches(request, cache, executive);

					branchIds		= ActionStaticUtil.getPhysicalBranchIds(request, cache, executive);
				} else if (crossingAgentId > 0)
					if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_GROUPADMIN)
						branchIds = cache.getPhysicalBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_GROUP, id);
					else if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_REGIONADMIN)
						branchIds = cache.getPhysicalBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_REGION, executive.getRegionId());
					else if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_SUBREGIONADMIN)
						branchIds = cache.getPhysicalBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_SUBREGION, executive.getSubRegionId());
					else
						branchIds = ""+executive.getBranchId();

				objectIn.put(Constant.FROM_DATE, fromDate);
				objectIn.put(Constant.TO_DATE, toDate);
				objectIn.put("branchIds", branchIds);
				objectIn.put(Constant.ACCOUNT_GROUP_ID, executive.getAccountGroupId());

				request.setAttribute("monthDuration", monthDuration);
				request.setAttribute("fromDate", fromDate);
				request.setAttribute("toDate", toDate);

				if(mainReportType == CrossingAgentBillInformationBranchWiseReport.CROSSINGAGENT_BILLINFROMATION_REPORT_TYPE_BRANCH)
					reportModel = CrossingAgentBillInformationBranchWiseDAO.getInstance().getCrossingAgentBillInformationBranchWise(objectIn);
				else if(mainReportType == CrossingAgentBillInformationBranchWiseReport.CROSSINGAGENT_BILLINFROMATION_REPORT_TYPE_AGENT){
					objectIn.put(Constant.CROSSING_AGENT_ID, crossingAgentId);
					reportModel = CrossingAgentBillInformationBranchWiseDAO.getInstance().getCrossingAgentBillInformationAgentWise(objectIn);
				}

				if(reportModel != null && !reportModel.isEmpty()) {
					final var	lrWiseCrossingAgentBillIds	= reportModel.stream().filter(a -> a.getBillTypeId() == CrossingAgentBillInformationBranchWiseReport.CROSSING_AGENT_BILL_ON_LR_NUMBER)
							.map(e -> Long.toString(e.getCrossingAgentBillId())).collect(Collectors.joining(","));

					var	lsWiseCrossingAgentBillIds	= reportModel.stream().filter(a -> a.getBillTypeId() == CrossingAgentBillInformationBranchWiseReport.CROSSING_AGENT_BILL_ON_LS_NUMBER)
							.map(e -> Long.toString(e.getCrossingAgentBillId())).collect(Collectors.joining(","));

					if(showCrossingAgentBilledInformationLrWise) {
						if(StringUtils.isNotEmpty(lrWiseCrossingAgentBillIds))
							lrBillSumColl				= CrossingAgentBillSummaryDAO.getInstance().getCrossingAgentBillDetailsOnWayBillByBillIds(lrWiseCrossingAgentBillIds);

						if(StringUtils.isNotEmpty(lsWiseCrossingAgentBillIds))
							lsBillSumColl				= CrossingAgentBillSummaryDAO.getInstance().getCrossingAgentBillDetailsByBillIds(lsWiseCrossingAgentBillIds);

					} else {
						lsWiseCrossingAgentBillIds	= reportModel.stream().map(e -> e.getCrossingAgentBillId() + "").collect(Collectors.joining(","));
						lsBillSumColl				= CrossingAgentBillSummaryDAO.getInstance().getCrossingAgentBillDetailsByBillIds(lsWiseCrossingAgentBillIds);
					}

					final var 	branches	= cache.getGenericBranchesDetail(request);
					final var	subRegions	= cache.getAllSubRegions(request);

					for (final CrossingAgentBillInformationBranchWiseReport element : reportModel) {
						final var branch = (Branch) branches.get(element.getBranchId() + "");
						element.setBranchName(branch.getName());
						String 					disStr 	 		= null;

						if(lrBillSumColl != null && !lrBillSumColl.isEmpty())
							disStr 	 		= lrBillSumColl.get(element.getCrossingAgentBillId());

						if(lsBillSumColl != null && !lsBillSumColl.isEmpty())
							disStr 	 		= lsBillSumColl.get(element.getCrossingAgentBillId());

						final var 				subregion  		= (SubRegion) subRegions.get(branch.getSubRegionId());

						element.setSubRegionId(branch.getSubRegionId());
						element.setSubRegionName(subregion.getName());

						element.setBillDateTimeStr(DateTimeUtility.getDateFromTimeStamp(element.getBillDateTime(), DateTimeFormatConstant.DD_MM_YY));

						actualWeight	= 0.0;
						quantity		= 0;

						if(showCrossingAgentBilledInformationLrWise) {
							if(StringUtils.isNotEmpty(disStr)) {
								final Map<Long, WayBill>	lrColl	 		= WayBillDao.getInstance().getLRDetails(disStr);

								for(final Map.Entry<Long, WayBill> entry : lrColl.entrySet()) {
									final var wayBill = entry.getValue();
									actualWeight   += wayBill.getActualWeight();
									quantity	   += wayBill.getWayBillConsignmentQuantity();
								}
							}
						} else if(StringUtils.isNotEmpty(disStr)) {
							final Map<Long, DispatchLedger>	lsColl	 		= DispatchLedgerDao.getInstance().getDispatchLedgerDetailsByLSIds(disStr);

							for(final Map.Entry<Long, DispatchLedger> entry : lsColl.entrySet()) {
								final var dispatchLedger = entry.getValue();
								actualWeight   += dispatchLedger.getTotalActualWeight();
								quantity	   += dispatchLedger.getTotalNoOfPackages();
							}
						}

						element.setQuantity(quantity);
						element.setActualWeight(actualWeight);
					}

					if(mainReportType == CrossingAgentBillInformationBranchWiseReport.CROSSINGAGENT_BILLINFROMATION_REPORT_TYPE_BRANCH) {
						final Comparator<CrossingAgentBillInformationBranchWiseReport> compareByName = Comparator
								.comparing(CrossingAgentBillInformationBranchWiseReport::getSubRegionName)
								.thenComparing(CrossingAgentBillInformationBranchWiseReport::getBranchName)
								.thenComparing(CrossingAgentBillInformationBranchWiseReport::getName);

						reportModel	= reportModel.stream().sorted(compareByName).collect(CollectionUtility.getList());

						if(reportType == CrossingAgentBillInformationBranchWiseReport.CROSSINGAGENT_BILLINFROMATION_BRANCHWISE)
							subRegionWiseData	= reportModel.stream().collect(Collectors.groupingBy(CrossingAgentBillInformationBranchWiseReport::getSubRegionNameWithId,
									Collectors.groupingBy(CrossingAgentBillInformationBranchWiseReport::getBranchNameWithId, Collectors.toMap(CrossingAgentBillInformationBranchWiseReport::getAgentNameWithBilllId, Function.identity(), (e1, e2) -> e1))));
						else if(reportType == CrossingAgentBillInformationBranchWiseReport.CROSSINGAGENT_BILLINFROMATION_AGENTWISE)
							agentWiseColl		= reportModel.stream().collect(Collectors.groupingBy(CrossingAgentBillInformationBranchWiseReport::getAgentNameWithAgentId));
					}

					request.setAttribute("reportModel", reportModel);
					request.setAttribute("subRegionWiseData", subRegionWiseData);
					request.setAttribute("agentWiseColl", agentWiseColl);

					reportViewModel = new ReportViewModel();
					reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);
					request.setAttribute("ReportViewModel",reportViewModel);
				} else {
					error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
					error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
					request.setAttribute("cargoError", error);
				}
			} else {
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}

			request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}
}
