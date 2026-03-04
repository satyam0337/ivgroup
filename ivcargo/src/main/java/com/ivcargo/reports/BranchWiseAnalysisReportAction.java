package com.ivcargo.reports;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringUtils;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.bll.impl.reports.miscellaneous.BranchWiseAnalysisReportBllImpl;
import com.iv.constant.properties.report.BranchWiseAnalysisReportConstant;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.utils.constant.Constant;
import com.iv.utils.exception.ExceptionProcess;
import com.iv.utils.message.Message;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.Branch;
import com.platform.dto.Executive;
import com.platform.dto.TransportCommonMaster;
import com.platform.resource.CargoErrorList;

public class BranchWiseAnalysisReportAction implements Action{

	private static final String TRACE_ID = BranchWiseAnalysisReportAction.class.getName();

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	 			error 					= null;
		Branch[]    						branches  				= null;
		var									srcMergeGroupId			= 0L;
		var									destMergeGroupId		= 0L;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeBranchWiseAnalysisReportAction().execute(request, response);

			final var	cManip 								= new CacheManip(request);
			final var	executive         					= cManip.getExecutive(request);
			final var	reportConfig						= ReadAllConfigurationsBllImpl.getInstance().getReportConfigurationData(ReportIdentifierConstant.BRANCH_WISE_ANALYSIS, executive.getAccountGroupId());

			final var	showOperationBranch					= (boolean) reportConfig.getOrDefault(BranchWiseAnalysisReportConstant.SHOW_OPERATION_BRANCH, false);

			var 	sourceSubRegionId  			= 0L;
			var 	destinationSubRegionId    	= 0L;
			var 	sourceBrachId 				= JSPUtility.GetLong(request, "branch", 0);
			final var 	destinationBranchId  	= JSPUtility.GetLong(request, "SelectDestBranch", 0);
			final var	isSubRegionAllow	= JSPUtility.GetBoolean(request, "isSubRegionAllow", false);
			final var	isBranchAllow		= JSPUtility.GetBoolean(request, "isBranchAllow", false);

			var	mergeGroupSubRegionStr	= request.getParameter("subRegion");

			if(mergeGroupSubRegionStr != null)
				if(StringUtils.contains(mergeGroupSubRegionStr, "_"))
					srcMergeGroupId		= Long.parseLong(mergeGroupSubRegionStr.split("_")[1]);
				else
					sourceSubRegionId 	= Long.parseLong(mergeGroupSubRegionStr);

			mergeGroupSubRegionStr	= request.getParameter("TosubRegion");

			if(mergeGroupSubRegionStr != null)
				if(StringUtils.contains(mergeGroupSubRegionStr, "_"))
					destMergeGroupId		= Long.parseLong(mergeGroupSubRegionStr.split("_")[1]);
				else
					destinationSubRegionId	= Long.parseLong(mergeGroupSubRegionStr);

			if(!isBranchAllow && !isSubRegionAllow)
				sourceBrachId		= executive.getBranchId();
			else if(isBranchAllow && !isSubRegionAllow)
				sourceSubRegionId	= executive.getSubRegionId();

			final var	selectionType = JSPUtility.GetLong(request, "selectionType",0);

			final var	objectIn  = new HashMap<>();

			if(selectionType > 0 && selectionType == 1)
				getSourceDestinationBranches(request, objectIn, destinationBranchId, destinationSubRegionId, destMergeGroupId, sourceBrachId, sourceSubRegionId, srcMergeGroupId);
			else
				getSourceDestinationBranches(request, objectIn, sourceBrachId, sourceSubRegionId, srcMergeGroupId, destinationBranchId, destinationSubRegionId, destMergeGroupId);

			objectIn.put(Constant.FROM_DATE, JSPUtility.GetString(request, "fromDate"));
			objectIn.put(Constant.TO_DATE, JSPUtility.GetString(request, "toDate"));
			objectIn.put("wayBillStatusId", JSPUtility.GetLong(request, "WayBillStatus", 0));
			objectIn.put(Constant.EXECUTIVE_ID, executive.getAccountGroupId());
			objectIn.put("lrMode", JSPUtility.GetShort(request, "lrMode", (short) 3));
			objectIn.put(Constant.WAY_BILL_TYPE_ID, JSPUtility.GetLong(request, "WayBillType", 0));
			objectIn.put(BranchWiseAnalysisReportConstant.BRANCH_WISE_ANALYSIS_REPORT_CONFIGURATION, reportConfig);
			objectIn.put(Constant.SUB_REGION_ID, sourceSubRegionId);
			objectIn.put(Constant.ACCOUNT_GROUP_ID, executive.getAccountGroupId());

			//Get all selected source Branches
			if(showOperationBranch) {
				final var	branchesHM  = cManip.getBranchesBySubRegionId(request, executive.getAccountGroupId(), destinationSubRegionId);
				final var	branchList 	= new ArrayList<>(branchesHM.values());
				branches	= new Branch[branchList.size()];
				branchList.toArray(branches);
			} else if(destinationSubRegionId > 0)
				branches 	= cManip.getBranchesArrayBySubRegionId(request, executive.getAccountGroupId(), destinationSubRegionId);
			else if(destMergeGroupId > 0)
				branches 	= cManip.getAssignedBranchArrayByAssignedAccountGroupId(request, executive.getAccountGroupId(), destMergeGroupId);

			request.setAttribute("destBranches", branches);

			if(sourceSubRegionId > 0)
				branches 	= cManip.getBranchesArrayBySubRegionId(request, executive.getAccountGroupId(), sourceSubRegionId);
			else if(srcMergeGroupId > 0)
				branches 	= cManip.getAssignedBranchArrayByAssignedAccountGroupId(request, executive.getAccountGroupId(), srcMergeGroupId);

			request.setAttribute("branches", branches);
			request.setAttribute("branch", sourceBrachId);

			final var	objectOutObj		= BranchWiseAnalysisReportBllImpl.getInstance().getBranchWiseAnalysisReportData(objectIn, reportConfig);

			if(!objectOutObj.containsKey(Message.MESSAGE)) {
				final var 	bookingCharges  = cManip.getBookingCharges(request, executive.getBranchId());

				objectOutObj.keySet().forEach((final Object obj) -> request.setAttribute(obj.toString(), objectOutObj.get(obj.toString())));

				request.setAttribute("wayBillCharges", bookingCharges);
				request.setAttribute("nextPageToken", "success");
			} else {
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}

			request.setAttribute("subRegion", sourceSubRegionId);
			request.setAttribute("branch", sourceBrachId);
			request.setAttribute("selectDestBranch", destinationBranchId);
			request.setAttribute("toSubRegion", destinationSubRegionId);
			request.setAttribute("selectionType", selectionType);

			ActionStaticUtil.setReportViewModel(request);
		} catch (final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}

	private void getSourceDestinationBranches(final HttpServletRequest request, final Map<Object, Object> valueObjectIn, final long sourceBrachId, final long sourceSubRegionId, final long srcMergeGroupId, final long destinationBranchId, final long destinationSubRegionId, final long destMergeGroupId) {
		String				srcBranches		= null;
		String				destBranches	= null;
		CacheManip 			cManip 			= null;
		Executive			executive		= null;

		try {
			cManip 			= new CacheManip(request);
			executive       = cManip.getExecutive(request);

			if(sourceBrachId > 0)
				srcBranches = Long.toString(sourceBrachId);//With Source Branch , No Dest Branch
			else if(sourceSubRegionId > 0)
				srcBranches = cManip.getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_SUBREGION, sourceSubRegionId);
			else if(srcMergeGroupId > 0)
				srcBranches	= cManip.getAssignedBranchStringByAssignedAccountGroupId(request, executive.getAccountGroupId(), srcMergeGroupId);

			if(destinationBranchId > 0)
				destBranches = Long.toString(destinationBranchId);
			else if(destinationSubRegionId > 0)
				destBranches = cManip.getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_SUBREGION, destinationSubRegionId);
			else if(destMergeGroupId > 0)
				destBranches = cManip.getAssignedBranchStringByAssignedAccountGroupId(request, executive.getAccountGroupId(), destMergeGroupId);

			valueObjectIn.put("srcBranches", srcBranches);
			valueObjectIn.put("destBranches", destBranches);
		} catch (final Exception e) {
			e.printStackTrace();
		}
	}
}
