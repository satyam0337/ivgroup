package com.ivcargo.actions.transport;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.reports.ReportView;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.Executive;
import com.platform.dto.constant.TransCargoAccountGroupConstant;
import com.platform.dto.model.ReportViewModel;

public class InitializeCreditCollectionModule implements Action {

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	error 				= null;
		Executive				executive			= null;
		CacheManip				cache				= null;
		ReportViewModel			reportViewModel		= null;
		List<Integer> 		customViewPageGroupList	= null;

		try {

			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			cache		= new CacheManip(request);
			executive	= cache.getExecutive(request);

			customViewPageGroupList = Arrays.asList(TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_JAYRAM_TRANSPORTS
					,TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_TARASVIN_TRANSPORT
					,TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_VEGA_TRANSPORT
					,TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_GKR);

			ActionStaticUtil.executiveTypeWiseSelection3(request, cache, executive);

			reportViewModel = new ReportViewModel();
			reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);
			request.setAttribute("ReportViewModel",reportViewModel);

			if(customViewPageGroupList.contains((int) executive.getAccountGroupId()))
				request.setAttribute("nextPageToken", "success_1");
			else
				request.setAttribute("nextPageToken", "success");

		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		} finally {
			executive			= null;
			cache				= null;
			reportViewModel		= null;
			customViewPageGroupList	= null;
		}
	}

}