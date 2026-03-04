package com.ivcargo.actions.masters;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.BranchDetailsBLL;
import com.framework.Action;
import com.iv.constant.properties.master.BranchMasterConfigurationConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.reports.ReportView;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.model.ReportViewModel;

public class BranchDetailsGetDataAction implements Action {

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	 		error 					= null;
		ReportViewModel 				reportViewModel 		= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeBranchDetailsAction().execute(request, response);

			final var	cManip 		= new CacheManip(request);
			final var	executive	= cManip.getExecutive(request);

			ActionStaticUtil.executiveTypeWiseBranches(request, cManip, executive);

			final var	branchIds			= ActionStaticUtil.getBranchIdsWithAssignedLocation1(request, cManip, executive);
			final var	configuration   	= cManip.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.BRANCH_MASTER);

			final var	valueInobject = new ValueObject();
			valueInobject.put("branchIds", branchIds);
			valueInobject.put("branchesColl", cManip.getGenericBranchesDetail(request));
			valueInobject.put("citiescoll", cManip.getCityData(request));
			valueInobject.put("regionscoll", cManip.getAllRegions(request));
			valueInobject.put("subregionscoll", cManip.getAllSubRegions(request));

			final var	branchdetailsbll = new BranchDetailsBLL();
			request.setAttribute("BranchDetailsAction", branchdetailsbll.getBranchDetails(valueInobject));
			request.setAttribute("nextPageToken", "success");
			request.setAttribute("hidebutton", "ok");

			reportViewModel = new ReportViewModel();
			reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);

			request.setAttribute("accountGroupNameForPrint", reportViewModel.getAccountGroupName());
			request.setAttribute("ReportViewModel", reportViewModel);

			request.setAttribute(BranchMasterConfigurationConstant.SHOW_LATITUDE_FIELD, configuration.getOrDefault(BranchMasterConfigurationConstant.SHOW_LATITUDE_FIELD, false));
			request.setAttribute(BranchMasterConfigurationConstant.SHOW_LONGITUDE_FIELD, configuration.getOrDefault(BranchMasterConfigurationConstant.SHOW_LONGITUDE_FIELD, false));
			request.setAttribute(BranchMasterConfigurationConstant.SHOW_BRANCH_SERVICE_TYPE, configuration.getOrDefault(BranchMasterConfigurationConstant.SHOW_BRANCH_SERVICE_TYPE, false));

		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}
	}
}