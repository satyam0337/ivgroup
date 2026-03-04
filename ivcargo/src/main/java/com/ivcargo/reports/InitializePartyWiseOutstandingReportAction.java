package com.ivcargo.reports;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.platform.dto.Executive;
import com.platform.dto.configuration.modules.PartyWiseOutstandingConfigurationDTO;
import com.platform.utils.PropertiesUtility;

public class InitializePartyWiseOutstandingReportAction implements Action{

	public static final String TRACE_ID = "InitializePartyWiseOutstandingReportAction";

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response){
		HashMap<String,Object>	 	error 					= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	executive				= (Executive)request.getSession().getAttribute("executive");
			final var	configuration			= ReadAllConfigurationsBllImpl.getInstance().getOldReportConfigurationData(ReportIdentifierConstant.PARTY_WISE_OUTSTANDING_REPORT, executive.getAccountGroupId());
			final var	isShowDateForReport 	= PropertiesUtility.isAllow(configuration.get(PartyWiseOutstandingConfigurationDTO.DATA_FOR_SHOW_DATE_FOR_REPORT)+"");
			final var	showPartyNumberColumn	= PropertiesUtility.isAllow(configuration.get(PartyWiseOutstandingConfigurationDTO.SHOW_PARTY_NUMBER_COLUMN)+"");
			final var	showBillClearanceLink	= PropertiesUtility.isAllow(configuration.get(PartyWiseOutstandingConfigurationDTO.SHOW_BILL_CLEARANCE_LINK)+"");
			final var	replaceCreditDebitLabels= PropertiesUtility.isAllow(configuration.get(PartyWiseOutstandingConfigurationDTO.REPLACE_CREDIT_DEBIT_LABELS)+"");

			request.setAttribute("nextPageToken", "success");
			request.setAttribute(PartyWiseOutstandingConfigurationDTO.DATA_FOR_SHOW_DATE_FOR_REPORT, isShowDateForReport);
			request.setAttribute(PartyWiseOutstandingConfigurationDTO.SHOW_PARTY_NUMBER_COLUMN, showPartyNumberColumn);
			request.setAttribute(PartyWiseOutstandingConfigurationDTO.SHOW_BILL_CLEARANCE_LINK, showBillClearanceLink);
			request.setAttribute(PartyWiseOutstandingConfigurationDTO.REPLACE_CREDIT_DEBIT_LABELS, replaceCreditDebitLabels);
		} catch (final Exception _e) {
			ActionStaticUtil.catchActionException(request, _e, error);
		}
	}
}
