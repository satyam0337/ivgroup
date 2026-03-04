package com.ivcargo.actions.masters;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.bll.impl.master.AccountGroupPermissionsBllImpl;
import com.iv.bll.utils.BookingWayBillSelectionUtility;
import com.iv.constant.properties.DDMConfigurationConstant;
import com.iv.constant.properties.GroupConfigurationPropertiesConstant;
import com.iv.constant.properties.invoice.CreditorInvoicePropertiesConstant;
import com.iv.constant.properties.lhpv.LHPVPropertiesConstant;
import com.iv.constant.properties.master.SequenceCounterMasterConfigurationConstant;
import com.iv.dto.constant.BusinessFunctionConstants;
import com.iv.dto.constant.ConfigKeyConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.utils.constant.properties.ReceiveConfigurationPropertiesConstant;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.constant.FeildPermissionsConstant;

public class SequenceCounterMasterAction implements Action{
	public static final String TRACE_ID = "SequenceCounterMasterAction";

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>			error 								= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	cache			= new CacheManip(request);
			final var	loggedInExec	= cache.getExecutive(request);

			final var	execFieldPermissions	= cache.getExecutiveFieldPermission(request);
			final var	groupConfiguration		= cache.getGroupConfiguration(request, loggedInExec.getAccountGroupId());
			final var	configuration			= cache.getConfiguration(request, loggedInExec.getAccountGroupId(), ModuleIdentifierConstant.SEQUENCE_COUNTER_MASTER);
			final var	reciveConfig			= cache.getConfiguration(request, loggedInExec.getAccountGroupId(), ModuleIdentifierConstant.RECEIVE);
			final var	ddmConfig				= cache.getConfiguration(request, loggedInExec.getAccountGroupId(), ModuleIdentifierConstant.CREATE_DDM);
			final var	invoiceConfig			= cache.getConfiguration(request, loggedInExec.getAccountGroupId(), ModuleIdentifierConstant.CREATE_INVOICE);
			final var	lhpvProperties 			= cache.getConfiguration(request, loggedInExec.getAccountGroupId(), ModuleIdentifierConstant.LHPV);

			final var	accountGroupPermissionHM	= cache.getGroupPermissionHMByUniqueName(request, loggedInExec.getAccountGroupId());

			request.setAttribute("billSelectionList", BookingWayBillSelectionUtility.getBillSelectionListForModule(groupConfiguration.getHtData()));
			request.setAttribute(GroupConfigurationPropertiesConstant.IS_GSTN_NUMBER_AND_MONTH_WISE_SEQUENCE_COUNTER, groupConfiguration.getBoolean(GroupConfigurationPropertiesConstant.IS_GSTN_NUMBER_AND_MONTH_WISE_SEQUENCE_COUNTER, false));
			request.setAttribute("isLrSequenceCounter", configuration.getOrDefault(SequenceCounterMasterConfigurationConstant.IS_LR_SEQUENCE_COUNTER, false));
			request.setAttribute("isLSSequenceCounter", configuration.getOrDefault(SequenceCounterMasterConfigurationConstant.IS_LS_SEQUENCE_COUNTER, true));
			request.setAttribute("isSDWiseLSSequenceCounter", configuration.getOrDefault(SequenceCounterMasterConfigurationConstant.IS_SD_WISE_LS_SEQUENCE_COUNTER, false));
			request.setAttribute("isLhpvSequenceCounter", configuration.getOrDefault(SequenceCounterMasterConfigurationConstant.IS_LHPV_SEQUENCE_COUNTER, false));
			request.setAttribute("partyLevelSequenceAllowed", configuration.getOrDefault(SequenceCounterMasterConfigurationConstant.PARTY_LEVEL_SEQUENCE_ALLOWED, false));
			request.setAttribute("branchCodeWiseWayBillNumberGeneration", configuration.getOrDefault(SequenceCounterMasterConfigurationConstant.BRANCH_CODE_WISE_WAY_BILL_NUMBER_GENERATION, false));
			request.setAttribute("isCityBranchLrSequenceCounter", configuration.getOrDefault(SequenceCounterMasterConfigurationConstant.IS_CITY_BRANCH_LR_SEQUENCE_COUNTER, false));
			request.setAttribute(SequenceCounterMasterConfigurationConstant.SHOW_MANUAL_LR_SEQUENCE_COUNTER, configuration.getOrDefault(SequenceCounterMasterConfigurationConstant.SHOW_MANUAL_LR_SEQUENCE_COUNTER, false));
			request.setAttribute(SequenceCounterMasterConfigurationConstant.SHOW_LR_SEQUENCE_VIEW_ALL_BTN, configuration.getOrDefault(SequenceCounterMasterConfigurationConstant.SHOW_LR_SEQUENCE_VIEW_ALL_BTN, false));
			request.setAttribute(SequenceCounterMasterConfigurationConstant.EXECITIVE_WISE_ALLOW_TO_EDIT_LR_SEQUENCE, configuration.getOrDefault(SequenceCounterMasterConfigurationConstant.EXECITIVE_WISE_ALLOW_TO_EDIT_LR_SEQUENCE, false));
			request.setAttribute("allowToEditLRSequence", execFieldPermissions != null && execFieldPermissions.get(FeildPermissionsConstant.ALLOW_TO_EDIT_LR_SEQUENCE) != null);
			request.setAttribute(GroupConfigurationPropertiesConstant.GROUP_LEVEL_SEQUENCE_COUNTER, groupConfiguration.getBoolean(GroupConfigurationPropertiesConstant.GROUP_LEVEL_SEQUENCE_COUNTER, false));
			request.setAttribute(SequenceCounterMasterConfigurationConstant.LR_TYPE_WISE_SEQUENCE_COUNTER, configuration.getOrDefault(SequenceCounterMasterConfigurationConstant.LR_TYPE_WISE_SEQUENCE_COUNTER, false));
			request.setAttribute(SequenceCounterMasterConfigurationConstant.IS_PICKUP_LS_SEQUENCE_COUNTER, configuration.getOrDefault(SequenceCounterMasterConfigurationConstant.IS_PICKUP_LS_SEQUENCE_COUNTER, false));
			request.setAttribute(SequenceCounterMasterConfigurationConstant.IS_TRUCK_ARRIVAL_SEQUENCE_COUNTER, reciveConfig.getOrDefault(ReceiveConfigurationPropertiesConstant.TRUCK_ARRIVAL_NUMBER, false));
			request.setAttribute(GroupConfigurationPropertiesConstant.IS_MONEY_RECEIPT_REQUIRED, groupConfiguration.getBoolean(GroupConfigurationPropertiesConstant.IS_MONEY_RECEIPT_REQUIRED, false));
			request.setAttribute(GroupConfigurationPropertiesConstant.LR_SEQUENCE_ON_BILL_SELECTION, groupConfiguration.getBoolean(GroupConfigurationPropertiesConstant.LR_SEQUENCE_ON_BILL_SELECTION, false));
			request.setAttribute(DDMConfigurationConstant.BILL_SELECTION_WISE_DDM_SEQUENCE, (boolean) ddmConfig.getOrDefault(DDMConfigurationConstant.BILL_SELECTION_WISE_DDM_SEQUENCE, false));
			request.setAttribute("isPendingLSPaymentSequenceCounter", accountGroupPermissionHM != null && !AccountGroupPermissionsBllImpl.getInstance().isGroupLevelPermission(accountGroupPermissionHM, BusinessFunctionConstants.PENDING_LS_FOR_PAYMENT));
			request.setAttribute("isConsolidatedBlhpvSequenceCounter", accountGroupPermissionHM != null && AccountGroupPermissionsBllImpl.getInstance().isGroupLevelPermission(accountGroupPermissionHM, BusinessFunctionConstants.CONSOLIDATED_BLHPV));
			request.setAttribute(CreditorInvoicePropertiesConstant.BILL_SELECTION_WISE_INVOICE_SEQUENCE_COUNTER, (boolean) invoiceConfig.getOrDefault(CreditorInvoicePropertiesConstant.BILL_SELECTION_WISE_INVOICE_SEQUENCE_COUNTER, false));
			request.setAttribute(GroupConfigurationPropertiesConstant.DIVISION_WISE_SEQUENCE_COUNTER, groupConfiguration.getBoolean(GroupConfigurationPropertiesConstant.DIVISION_WISE_SEQUENCE_COUNTER, false));
			request.setAttribute("divisionSelectionList", cache.getDivisionMasterList(request, loggedInExec.getAccountGroupId()));
			request.setAttribute("displayOnlyPhysicalBranch", configuration.getOrDefault(SequenceCounterMasterConfigurationConstant.DISPLAY_ONLY_PHYSICAL_BRANCH, true));
			request.setAttribute(LHPVPropertiesConstant.ALLOW_DIVISION_WISE_LHPV_SEQUENCE_COUNTER, (boolean) lhpvProperties.getOrDefault(LHPVPropertiesConstant.ALLOW_DIVISION_WISE_LHPV_SEQUENCE_COUNTER, false));
			request.setAttribute(CreditorInvoicePropertiesConstant.IS_DIVISION_WISE_INVOICE_SEQUENCE, (boolean) invoiceConfig.getOrDefault(CreditorInvoicePropertiesConstant.IS_DIVISION_WISE_INVOICE_SEQUENCE, false));

			ActionStaticUtil.executiveTypeWiseSelection(request, cache, loggedInExec);

			request.setAttribute("crSequenceCounterCheck", cache.getConfigValue(request, loggedInExec.getAccountGroupId(), ConfigKeyConstant.CONFIG_KEY_DUPLICATE_MANUAL_AUTO_CR_SEQUENCE) != 0);
			request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}

}