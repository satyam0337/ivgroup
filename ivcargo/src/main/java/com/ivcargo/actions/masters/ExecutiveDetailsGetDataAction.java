package com.ivcargo.actions.masters;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringUtils;

import com.businesslogic.ExecutiveDetailsBLL;
import com.framework.Action;
import com.iv.constant.properties.master.ExecutiveMasterConfigurationConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.reports.ReportView;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.model.ReportViewModel;

public class ExecutiveDetailsGetDataAction implements Action{

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	 		error 					= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeExecutiveDetailsAction().execute(request, response);

			final var	cache 		= new CacheManip(request);
			final var	executive	= cache.getExecutive(request);

			final var	executiveMasterConfig		= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.EXECUTIVE_MASTER);

			ActionStaticUtil.executiveTypeWiseBranches(request, cache, executive);

			final var	branchIds		= ActionStaticUtil.getPhysicalBranchIds1(request, cache, executive);

			if(StringUtils.isEmpty(branchIds)) {
				ActionStaticUtil.catchActionException(request, error, "Branhes not found !");
				return;
			}

			final var	valueInobject = new ValueObject();

			valueInobject.put("branchIds", branchIds);
			valueInobject.put("branchesColl", cache.getGenericBranchesDetail(request));
			valueInobject.put("citiescoll", cache.getCityData(request));
			valueInobject.put("regionscoll", cache.getAllRegions(request));
			valueInobject.put("subregionscoll", cache.getAllSubRegions(request));
			valueInobject.put("showDeactivateBranchAndExecutiveInExeutiveDetails", (boolean) executiveMasterConfig.getOrDefault(ExecutiveMasterConfigurationConstant.SHOW_DEACTIVATE_BRANCH_AND_EXECUTIVE_IN_EXECUTIVE_DETAIILS, true));

			final var	executivedetailsbll = new ExecutiveDetailsBLL();

			request.setAttribute("ExecutiveDetailsAction", executivedetailsbll.getExecutiveDetails(valueInobject));
			request.setAttribute("nextPageToken", "success");
			request.setAttribute("hidebutton", "ok");

			var	reportViewModel = new ReportViewModel();
			reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);

			request.setAttribute("accountGroupNameForPrint", reportViewModel.getAccountGroupName());
			request.setAttribute("ReportViewModel",reportViewModel);
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}
}
