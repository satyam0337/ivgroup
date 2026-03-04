package com.ivcargo.reports;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.SortedMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.CreditorUnbilledRegisterReportBLL;
import com.framework.Action;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.reports.initialize.InitializeCreditorUnbilledRegisterReport;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.BillDetailsForBillClearance;
import com.platform.dto.CustomGroupMapper;
import com.platform.dto.configuration.mindateselection.ReportWiseMinDateSelectionConfigurationDTO;
import com.platform.dto.model.ReportViewModel;

public class CreditorUnbilledRegisterReportGetDataAction implements Action {

	@Override
	@SuppressWarnings("unchecked")
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	 						error 								= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeCreditorUnbilledRegisterReport().execute(request, response);

			final var	objectIn	= new ValueObject();
			final var	cache       = new CacheManip (request);
			final var	executive	= cache.getExecutive(request);

			final var	creditorUnbilledRegisterReportBLL = new CreditorUnbilledRegisterReportBLL();

			final var	minDateTimeStamp	= cache.getReportWiseMinDateToGetData(request, executive.getAccountGroupId(),
					ReportWiseMinDateSelectionConfigurationDTO.UNBILLED_REGISTER_REPORT_MIN_DATE_ALLOW,
					ReportWiseMinDateSelectionConfigurationDTO.UNBILLED_REGISTER_REPORT_MIN_DATE);

			objectIn.put("executive", executive);
			objectIn.put("creditorId", request.getParameter("selectedCorpId"));
			objectIn.put("accountGroupId", executive.getAccountGroupId());
			objectIn.put("branchesColl", cache.getGenericBranchesDetail(request));
			objectIn.put("minDateTimeStamp", minDateTimeStamp);

			final var	valueOutObj = creditorUnbilledRegisterReportBLL.getCreditorUnBilledDetails(objectIn);

			final var	billsColl	= (SortedMap<String, ArrayList<BillDetailsForBillClearance>>) valueOutObj.get("BillDetailsForBillClearance");

			if(billsColl != null && !billsColl.isEmpty())
				request.setAttribute("BillDetailsForBillClearance", billsColl);
			else
				request.setAttribute("cargoError", error);

			ActionStaticUtil.setRequestAttribute(request,"customAddressBranchId", executive.getBranchId());
			ActionStaticUtil.setRequestAttribute(request,"customAddressIdentifer", CustomGroupMapper.IDENTIFIER_BOOKING);

			var	reportViewModel = new ReportViewModel();
			reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);
			request.setAttribute("ReportViewModel",reportViewModel);

			request.setAttribute("accountGroupNameForPrint", reportViewModel.getAccountGroupName());

			request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}

	}
}