package com.ivcargo.reports;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.bll.impl.properties.invoice.CreditorInvoiceConfigurationBllImpl;
import com.iv.constant.properties.invoice.CreditorInvoicePropertiesConstant;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.platform.dto.configuration.report.account.PartyBillRegisterReportConfigurationDTO;

public class InitializeBillRegisterReportAction implements Action {
	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>  			error 							= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var 	executive 				= ActionStaticUtil.getExecutive(request);
			final var	propertyConfig			= ReadAllConfigurationsBllImpl.getInstance().getOldReportConfigurationData(ReportIdentifierConstant.BILL_REGISTER_REPORT, executive.getAccountGroupId());
			final var 	creditorInvoiceConfig 	= CreditorInvoiceConfigurationBllImpl.getInstance().getCreditorInvoiceProperties(executive.getAccountGroupId());

			request.setAttribute(ActionStaticUtil.IS_ALL_REGION_NEED_TO_SHOW, true);
			request.setAttribute(ActionStaticUtil.IS_ALL_AREA_NEED_TO_SHOW, true);
			request.setAttribute(ActionStaticUtil.IS_ALL_BRANCHES_NEED_TO_SHOW, true);

			ActionStaticUtil.setInitializeBranchesSelectionInRequest(request, executive);
			ActionStaticUtil.setExecutiveCoreReportPermissionsInRequest(request, executive);
			ActionStaticUtil.setExecutiveTypeBooleanInRequest(request, executive, true);
			ActionStaticUtil.setNextPageToken(request, ActionStaticUtil.SUCCESS);

			request.setAttribute(PartyBillRegisterReportConfigurationDTO.GENERATE_TALLY_TRANSFER_EXCEL, propertyConfig.getBoolean(PartyBillRegisterReportConfigurationDTO.GENERATE_TALLY_TRANSFER_EXCEL, false));

			request.setAttribute(CreditorInvoicePropertiesConstant.IS_WS_INVOICE_PRINT_NEEDED, creditorInvoiceConfig.getOrDefault(CreditorInvoicePropertiesConstant.IS_WS_INVOICE_PRINT_NEEDED, false));
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}
}