package com.ivcargo.reports.collection;

import java.sql.Timestamp;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.ALLBranchWiseCollectionOldBLL;
import com.framework.Action;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.reports.collection.initialize.InitializeALLBranchWiseCollectionOldReportAction;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.Executive;

public class ALLBranchWiseCollectionOldReportAction implements Action {

	private static final String TRACE_ID = "ALLBranchWiseCollectionOldReportAction";

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String, Object>		error 						= null;
		Executive					executive					= null;
		ValueObject					objectIn					= null;
		ValueObject					objectOut					= null;
		Timestamp					fromDate					= null;
		Timestamp					toDate						= null;
		ALLBranchWiseCollectionOldBLL	allBranchWiseCollectionBLL	= null;
		CacheManip					cacheManip					= null;

		try {

			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request, error))
				return;

			final long startTime = System.currentTimeMillis();

			new InitializeALLBranchWiseCollectionOldReportAction().execute(request, response);

			objectIn 	= new ValueObject();

			cacheManip	= new CacheManip(request);
			fromDate	= ActionStaticUtil.getFromToDate(request, ActionStaticUtil.FROMDATE, ActionStaticUtil.FROMTIME);
			toDate		= ActionStaticUtil.getFromToDate(request, ActionStaticUtil.TODATE, ActionStaticUtil.TOTIME);
			executive   = cacheManip.getExecutive(request);

			objectIn.put("fromDate", fromDate);
			objectIn.put("toDate", toDate);
			objectIn.put("accountGroupId", executive.getAccountGroupId());
			objectIn.put("branchesStr", ActionStaticUtil.getBranchesStringByExecutiveType(request, executive));
			objectIn.put("executive", executive);

			objectIn.put("branchesColl", cacheManip.getAllGroupBranches(request, executive.getAccountGroupId()));

			allBranchWiseCollectionBLL	= new ALLBranchWiseCollectionOldBLL();

			objectOut = allBranchWiseCollectionBLL.getAllBranchWiseCollection(objectIn);

			if(objectOut == null) {
				ActionStaticUtil.setRequestAttribute(request, ActionStaticUtil.NO_RECORDS_FOUND, true);
				ActionStaticUtil.setNextPageToken(request, ActionStaticUtil.SUCCESS);
				ActionStaticUtil.getReportElapsedTime(TRACE_ID, executive, startTime);
				return;
			}

			request.setAttribute("allBranchWiseCollectionMap", objectOut.get("allBranchWiseCollectionMap"));
			request.setAttribute("totalAmountHM", objectOut.get("totalAmountHM"));
			request.setAttribute("bkgDlytotalAmtHM", objectOut.get("bkgDlytotalAmtHM"));
			request.setAttribute("isLaserPrintOnly", true);
			request.setAttribute("isForAllBranch", true);
			request.setAttribute("branchWiseCommissionAllow", objectOut.get("branchWiseCommissionAllow"));
			request.setAttribute("toPayAmountDeductFromGrandTotal", objectOut.get("toPayAmountDeductFromGrandTotal"));
			request.setAttribute("bkgDlyTotalAmtCommissionHM", objectOut.get("bkgDlyTotalAmtCommissionHM"));
			request.setAttribute("commissionDeductedFromGrandTotal", objectOut.get("commissionDeductedFromGrandTotal"));

			ActionStaticUtil.setReportViewModel(request);
			ActionStaticUtil.setNextPageToken(request, ActionStaticUtil.SUCCESS);
			ActionStaticUtil.getReportElapsedTime(TRACE_ID, executive, startTime);

		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		} finally {
			error 						= null;
			executive					= null;
			objectIn					= null;
			objectOut					= null;
			fromDate					= null;
			toDate						= null;
			allBranchWiseCollectionBLL	= null;
		}
	}
}