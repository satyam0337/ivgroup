package com.ivcargo.reports;

//~--- non-JDK imports --------------------------------------------------------

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.CrossingAgentBLL;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.Branch;
import com.platform.dto.Executive;
import com.platform.dto.SubRegion;
import com.platform.dto.WayBillCrossing;
import com.platform.dto.WayBillType;
import com.platform.dto.model.ReportViewModel;
import com.platform.dto.model.SourceWiseWayBillCrossingSummary;
import com.platform.resource.CargoErrorList;

public class CrossingAgentReportAction implements Action {
	public static final String TRACE_ID = "CrossingAgentReportAction";

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {

		HashMap<String,Object>	error = null;
		short filter = 0;
		var branchId = 0L;
		var regionId = 0L;
		var subRegionId = 0L;
		CacheManip cache = null;
		Executive executive = null;
		var crossingAgentId = 0L;
		Timestamp fromDate = null;
		Timestamp toDate = null;
		String branchIdStr = null;
		ArrayList<Long> branchIdArr = null;
		SubRegion[] subRegionForGroup = null;
		HashMap<Long, Branch> regionBranches = null;
		HashMap<Long, Branch> subRegionBranches = null;
		final var inValObj = new ValueObject();
		final var caBll = new CrossingAgentBLL();
		final var sdf = new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
		SourceWiseWayBillCrossingSummary					srcWiseWBCrossing 		= null;
		Branch		sourceBranch		= null;
		Branch		destinationBranch	= null;


		try {

			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			cache = new CacheManip(request);
			executive = (Executive) request.getSession().getAttribute("executive");
			crossingAgentId = JSPUtility.GetLong(request, "crossingAgent");
			branchId = JSPUtility.GetLong(request, "sourceBranch",0);
			fromDate = new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00").getTime());
			toDate = new Timestamp(sdf.parse(JSPUtility.GetString(request, "toDate") + " 23:59:59").getTime());

			new InitializeCrossingAgentReportAction().execute(request, response);

			final var isSearchBySource = request.getParameter("searchBySource") != null;

			if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_GROUPADMIN){
				if(isSearchBySource){
					regionId = Long.parseLong(request.getParameter("region"));
					subRegionId = Long.parseLong(request.getParameter("subRegion"));
					branchId = Long.parseLong(request.getParameter("branch"));
					// Get Combo values to restore
					subRegionForGroup = cache.getSubRegionsByRegionId(request, regionId, executive.getAccountGroupId());
					subRegionBranches = cache.getBranchesBySubRegionId(request,executive.getAccountGroupId(), subRegionId);
					request.setAttribute("subRegionForGroup", subRegionForGroup);
					request.setAttribute("subRegionBranches", subRegionBranches);
				} else if(crossingAgentId > 0){
					// Branch Id 0 (For all)
					branchIdArr = new ArrayList<>();
					branchIdArr.add(0L);
				}
			}else if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_REGIONADMIN){
				regionId = executive.getRegionId();
				if(isSearchBySource){
					subRegionId = Long.parseLong(request.getParameter("subRegion"));
					branchId = Long.parseLong(request.getParameter("branch"));
					// Get Combo values to restore
					request.setAttribute("subRegionForGroup", cache.getSubRegionsByRegionId(request, regionId, executive.getAccountGroupId()));
					request.setAttribute("subRegionBranches", cache.getBranchesBySubRegionId(request,executive.getAccountGroupId(), subRegionId));
				} else if(crossingAgentId > 0){
					// Branch Id array of Region
					regionBranches = cache.getBranchesByRegionId(request,executive.getAccountGroupId(), regionId);
					branchIdArr = new ArrayList<>();
					for (final Long key : regionBranches.keySet())
						branchIdArr.add(regionBranches.get(key).getBranchId());
				}
			}else if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_SUBREGIONADMIN){
				regionId = executive.getRegionId();
				subRegionId = executive.getSubRegionId();
				subRegionBranches = cache.getBranchesBySubRegionId(request,executive.getAccountGroupId(), subRegionId);
				if(isSearchBySource){
					branchId = Long.parseLong(request.getParameter("branch"));
					// Get Combo values to restore
					request.setAttribute("subRegionBranches", subRegionBranches);
				} else if(crossingAgentId > 0){
					// Branch Id array of SubRegion
					branchIdArr = new ArrayList<>();
					for (final Long key : subRegionBranches.keySet())
						branchIdArr.add(subRegionBranches.get(key).getBranchId());
				}
			}else{
				regionId = executive.getRegionId();
				subRegionId = executive.getSubRegionId();
				branchId = executive.getBranchId();
				if(crossingAgentId > 0){
					branchIdArr = new ArrayList<>();
					branchIdArr.add(executive.getBranchId());
				}
			}

			if(executive.getExecutiveType()== Executive.EXECUTIVE_TYPE_GROUPADMIN && crossingAgentId >0)
				filter=1;

			inValObj.put("crossingAgentId", crossingAgentId);
			inValObj.put("srcBranchId", branchId);
			if(branchIdArr != null){
				branchIdStr = branchIdArr.toString();
				branchIdStr = branchIdStr.substring(1, branchIdStr.length()-1);
			}
			inValObj.put("branchIdStr",branchIdStr);
			inValObj.put("fromDate",fromDate);
			inValObj.put("toDate",toDate);
			inValObj.put("executive",executive);
			inValObj.put("filter",filter);

			final var	outValObj = caBll.getCrossingAgentReportData(inValObj);

			if(outValObj != null && outValObj.get("WayBillIdArray")!= null && outValObj.get("wayBillCrossingArr")!=null){
				final var wayBillIdArray = (Long[]) outValObj.get("WayBillIdArray");
				var wayBillIdArrStr = wayBillIdArray.toString();
				wayBillIdArrStr = wayBillIdArrStr.substring(1, wayBillIdArrStr.length()-1);
				final var wbcArr = (WayBillCrossing[]) outValObj.get("wayBillCrossingArr");
				final var	srcWiseCrossingColl = new HashMap<Long, SourceWiseWayBillCrossingSummary>();
				var topayAmt = 0.00;
				var sourceBranchId = 0L;

				for (final WayBillCrossing element : wbcArr) {
					sourceBranch      = cache.getGenericBranchDetailCache(request, element.getSourceBranchId());
					destinationBranch = cache.getGenericBranchDetailCache(request, element.getDestinationBranchId());

					element.setSourceSubRegion(cache.getGenericSubRegionById(request, sourceBranch.getSubRegionId()).getName());
					element.setSourceBranch(sourceBranch.getName());

					if(element.getDestinationBranchId() > 0){
						element.setDestinationSubRegion(cache.getGenericSubRegionById(request,destinationBranch.getSubRegionId()).getName());
						element.setDestinationBranch(destinationBranch.getName());
					} else
						element.setDestinationBranch("--");

					sourceBranchId = element.getSourceBranchId();

					//Source Wise Collection (Start)
					srcWiseWBCrossing = srcWiseCrossingColl.get(sourceBranchId);
					topayAmt = 0;

					if(element.getWayBillTypeId() == WayBillType.WAYBILL_TYPE_TO_PAY)
						topayAmt = element.getGrandTotal();

					if(srcWiseWBCrossing == null) {
						srcWiseWBCrossing = new SourceWiseWayBillCrossingSummary();
						final var srcBranch = cache.getGenericBranchDetailCache(request,sourceBranchId);
						srcWiseWBCrossing.setTopayLRAmt(topayAmt);
						srcWiseWBCrossing.setCrossingHire(element.getCrossingHire());
						srcWiseWBCrossing.setRecoveryAmt(topayAmt - element.getCrossingHire());
						srcWiseWBCrossing.setSourceBranchId(srcBranch.getBranchId());
						srcWiseWBCrossing.setSourceBranch(srcBranch.getName());

						srcWiseCrossingColl.put(srcBranch.getBranchId(), srcWiseWBCrossing);
					} else {
						srcWiseWBCrossing.setTopayLRAmt(srcWiseWBCrossing.getTopayLRAmt() + topayAmt);
						srcWiseWBCrossing.setCrossingHire(srcWiseWBCrossing.getCrossingHire() + element.getCrossingHire());
						srcWiseWBCrossing.setRecoveryAmt(srcWiseWBCrossing.getRecoveryAmt() + (topayAmt - element.getCrossingHire()));
					}
				}

				var reportViewModel = new ReportViewModel();
				reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);
				request.setAttribute("ReportViewModel",reportViewModel);
				request.setAttribute("srcWiseCrossingColl", srcWiseCrossingColl);
				request.setAttribute("reportModel",wbcArr);
			}else {
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
				request.setAttribute("nextPageToken", "success");
			}
			request.setAttribute("nextPageToken", "success");

		} catch (final Exception _e) {
			ActionStaticUtil.catchActionException(request, _e, error);
		}
	}

}