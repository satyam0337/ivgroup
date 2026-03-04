package com.ivcargo.reports;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.properties.impl.PropertyConfigValueBLLImpl;
import com.framework.Action;
import com.iv.dto.constant.AliasNameConstants;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionInstanceUtil;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.platform.dto.Executive;
import com.platform.dto.PropertiesFileConstants;
import com.platform.dto.model.ReportViewModel;

public class InitializeArrivalTruckDetailsReportAction implements Action {

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	error 		= null;
		Executive 				executive 	= null;
		ActionInstanceUtil 		actionUtil2 = null;
		ReportViewModel 		reportViewModel 			= null;
		String					accountGroupNameForPrint	= null;
		SimpleDateFormat		sdf							= null;
		String					currentDate					= null;
		ValueObject				vehiclePendingForArrivalObj			= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error))
				return;
			executive = ActionStaticUtil.getExecutive(request);

			request.setAttribute(ActionStaticUtil.IS_ALL_REGION_NEED_TO_SHOW, false);
			request.setAttribute(ActionStaticUtil.IS_ALL_AREA_NEED_TO_SHOW, true);
			request.setAttribute(ActionStaticUtil.IS_ALL_BRANCHES_NEED_TO_SHOW, true);

			ActionStepsUtil.setInitializeBranchesSelectionInRequest(request, executive);
			ActionStepsUtil.setExecutiveCoreReportPermissionsInRequest(request, executive);

			actionUtil2 = new ActionInstanceUtil();
			actionUtil2.setExecutiveTypeBooleanInRequest(request, executive, true);

			ActionStaticUtil.setNextPageToken(request, ActionStaticUtil.SUCCESS);

			sdf			= new SimpleDateFormat("dd-MM-yyyy");
			currentDate	= sdf.format(new Date().getTime());
			request.setAttribute("currentDate",currentDate);

			reportViewModel = new ReportViewModel();
			reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);
			request.setAttribute("ReportViewModel",reportViewModel);
			accountGroupNameForPrint = reportViewModel.getAccountGroupName();
			request.setAttribute("accountGroupNameForPrint",accountGroupNameForPrint);

			request.setAttribute("nextPageToken", "success");

			vehiclePendingForArrivalObj		= PropertyConfigValueBLLImpl.getInstance().getConfiguration(executive, PropertiesFileConstants.VEHICLE_PENDING_FOR_ARRIVAL);

			if(vehiclePendingForArrivalObj != null)
				request.setAttribute(AliasNameConstants.LOADING_COMPLETE_MAX_TIME_IN_HOURS, vehiclePendingForArrivalObj.getInt(AliasNameConstants.LOADING_COMPLETE_MAX_TIME_IN_HOURS,0));

		} catch (final Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		}
		finally{
			error 		= null;
			executive 	= null;
			actionUtil2 = null;
		}
	}
}