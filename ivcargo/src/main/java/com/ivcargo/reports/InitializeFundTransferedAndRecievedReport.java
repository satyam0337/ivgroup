package com.ivcargo.reports;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.utils.constant.FundTransferTypeConstant;
import com.ivcargo.actionUtility.ActionInstanceUtil;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.platform.dto.Executive;

public class InitializeFundTransferedAndRecievedReport implements Action {

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		Executive   			executive 	= null;
		HashMap<String,Object>	error 		= null;
		ActionInstanceUtil 		actionUtil2 = null;
		Map<Short, String> 		fundTransRecTypeHM	= null;
		
		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			
			if(ActionStaticUtil.isSystemError(request,error))
				return;
			
			executive = ActionStaticUtil.getExecutive(request);
			
			fundTransRecTypeHM	= new LinkedHashMap<>();
			
			fundTransRecTypeHM.put(FundTransferTypeConstant.FUNDTRANSFER_STATUS_TRANSFERING, FundTransferTypeConstant.FUNDTRANSFER_NAME_TRANSFERING);
			fundTransRecTypeHM.put(FundTransferTypeConstant.FUNDTRANSFER_STATUS_RECEIVING, FundTransferTypeConstant.FUNDTRANSFER_NAME_RECEIVING);
			fundTransRecTypeHM.put(FundTransferTypeConstant.FUNDTRANSFER_TRANSFERING_RECEIVING_BOTH, FundTransferTypeConstant.FUNDTRANSFER_NAME_TRANSFERING_RECEIVING_BOTH);

			request.setAttribute(ActionStaticUtil.IS_ALL_REGION_NEED_TO_SHOW, false);
			request.setAttribute(ActionStaticUtil.IS_ALL_AREA_NEED_TO_SHOW, false);
			request.setAttribute(ActionStaticUtil.IS_ALL_BRANCHES_NEED_TO_SHOW, false);
			request.setAttribute("fundTransRecTypeHM", fundTransRecTypeHM);

			ActionStepsUtil.setInitializeBranchesSelectionInRequest(request, executive);
			ActionStepsUtil.setExecutiveCoreReportPermissionsInRequest(request, executive);

			actionUtil2 = new ActionInstanceUtil();
			actionUtil2.setExecutiveTypeBooleanInRequest(request, executive, true);

			ActionStaticUtil.setNextPageToken(request, ActionStaticUtil.SUCCESS);
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		} finally {
			executive		 	= null;
			error				= null;
			actionUtil2 		= null;
		}
	}
}