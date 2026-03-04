package com.ivcargo.actions.masters;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.ivcore.ExecutePendingTaskForPojoFromWayBillTxnCheckerBll;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.logsapp.LogWriter;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionInstanceUtil;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.Executive;
import com.platform.resource.CargoErrorList;

public class ExecutePendingTaskForWayBillTxnCheckerMasterAction implements Action {

	public static final String TRACE_ID = "ExecutePendingTaskForWayBillTxnCheckerMasterAction";

	public void execute(HttpServletRequest request, HttpServletResponse response) {

		HashMap<String,Object>	 			error 				= null;
		ExecutePendingTaskForPojoFromWayBillTxnCheckerBll 	bll = null;
		Executive							executive			= null;
		String								strResponse			= null;
		String								branchesIds			= null;
		CacheManip  						cache				= null;
		ActionInstanceUtil					utils				= null;
		ValueObject							outValueObject		= null;
		int			filter		= 0;
		long		regionId	= 0;
		long		subRegionId = 0;
		long		srcBranchId = 0;
		
		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error)){
				return;
			}
			executive	= (Executive) request.getSession().getAttribute("executive");
			filter		= JSPUtility.GetInt(request, "filter",0);
			cache 	    = new CacheManip(request);

			if(filter != 0) {

				utils = new ActionInstanceUtil();
				outValueObject = utils.reportSelection(request, executive);

				regionId 	= Long.parseLong(outValueObject.get("regionId").toString());
				subRegionId = Long.parseLong(outValueObject.get("subRegionId").toString());
				srcBranchId = Long.parseLong(outValueObject.get("branchId").toString());

				branchesIds = ActionStepsUtil.getAllBranchIdsByUserSelection(request, cache, regionId, subRegionId, srcBranchId, executive.getAccountGroupId());
				//LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_DEBUG, "branchesIds "+branchesIds);
				LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, "-- Pending Akka Task Start");

				bll = new ExecutePendingTaskForPojoFromWayBillTxnCheckerBll();
				//bll.processPendingData(WayBillTxnChecker.DURATION_IN_MINUTES_ZERO);
				bll.processPendingDataByBranchId(branchesIds);

				strResponse = CargoErrorList.MASTER_DATA_INSERT_SUCCESS_DESCRIPTION;
			}

			request.setAttribute("nextPageToken", "success");

			ActionStepsUtil.setInitializeBranchesSelectionInRequest(request, executive);

			if(filter != 0) {
				response.sendRedirect("PendingDataRefresherMaster.do?pageId=296&eventId=1&message="+strResponse);
				request.setAttribute("message",strResponse);
			}

		} catch (Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		} finally {
			bll 		= null;
			executive	= null;
			strResponse = null;
			cache		= null;
		}
	}
}
