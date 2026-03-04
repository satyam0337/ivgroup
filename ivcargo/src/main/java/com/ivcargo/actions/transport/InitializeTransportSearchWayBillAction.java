package com.ivcargo.actions.transport;

//~--- non-JDK imports --------------------------------------------------------

import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.properties.impl.PropertyConfigValueBLLImpl;
import com.framework.Action;
import com.iv.bll.impl.SearchBllImpl;
import com.iv.constant.properties.BranchExpensePropertiesConstant;
import com.iv.constant.properties.DoorPickupLSPropertiesConstant;
import com.iv.constant.properties.STBSConfigurationConstant;
import com.iv.constant.properties.STBSSettlementConfigurationConstant;
import com.iv.constant.properties.SearchConfigPropertiesConstant;
import com.iv.constant.properties.invoice.BillPaymentConfigurationConstant;
import com.iv.constant.properties.invoice.CreditorInvoicePropertiesConstant;
import com.iv.constant.properties.lhpv.LHPVPropertiesConstant;
import com.iv.dto.constant.FeildPermissionsConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.utils.CollectionUtility;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.PropertiesFileConstants;
import com.platform.dto.configuration.modules.LsPrintConfigurationDTO;

public class InitializeTransportSearchWayBillAction implements Action {

	public static final String TRACE_ID = "InitializeTransportSearchWayBillAction";

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String, Object>		error 									= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request, error))
				return;

			final var 	cache   		= new CacheManip(request);
			final var	executive 		= cache.getExecutive(request);
			final var	transportList	= cache.getTransportList(request);
			final var	searchBllImpl	= new SearchBllImpl();
			final Map<Long, ?>	execFldPermissions	= cache.getExecutiveFieldPermission(request);

			if(executive == null) {
				ActionStaticUtil.throwInvalidSessionError(request, error);
				return;
			}

			final var	dispatchLsPrintConfiguration			= PropertyConfigValueBLLImpl.getInstance().getConfiguration(executive, PropertiesFileConstants.LS_PRINT_LOAD_CONFIG);
			final var	searchConfiguration						= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.SEARCH_CONFIGURATION);
			final var	lhpvConfigHM							= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.LHPV);
			final var	expenseConfiguration					= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.BRANCH_EXPENSE);
			final var	configurationSTBS						= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.STBS);
			final var	configurationSTBSSettlement				= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.STBS_SETTLEMENT);
			final var	doorPickupLSConfig						= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.DOOR_PICKUP_DISPATCH);
			final var	billConfiguration						= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.CREATE_INVOICE);
			final var	billPaymentConfig						= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.BILL_PAYMENT);

			var	showLHPVHistory							= (boolean) lhpvConfigHM.getOrDefault(LHPVPropertiesConstant.SHOW_LHPV_HISTORY, false);

			if((boolean) lhpvConfigHM.getOrDefault(LHPVPropertiesConstant.SHOW_EXECUTIVE_WISE_LHPV_HISTORY, false))
				showLHPVHistory 				= CollectionUtility.getLongListFromString((String) lhpvConfigHM.getOrDefault(LHPVPropertiesConstant.EXECUTIVE_IDS_WISE_LHPV_HISTORY, "0")).contains(executive.getExecutiveId());

			request.setAttribute("selectionList", searchBllImpl.getSelectionCriteriaForSearch(searchConfiguration, true));

			lhpvConfigHM.put(LHPVPropertiesConstant.SHOW_LHPV_HISTORY, showLHPVHistory);

			request.setAttribute(SearchConfigPropertiesConstant.SEARCH_CONFIGURATION, searchConfiguration);
			request.setAttribute(LHPVPropertiesConstant.LHPV_CONFIGURATION, lhpvConfigHM);
			request.setAttribute(LsPrintConfigurationDTO.DISPATCH_PRINT_FROM_OLD_FLOW, dispatchLsPrintConfiguration.getBoolean(LsPrintConfigurationDTO.DISPATCH_PRINT_FROM_OLD_FLOW, false));
			request.setAttribute("defaultDispatchPrint", dispatchLsPrintConfiguration.getBoolean(LsPrintConfigurationDTO.DEFAULT_DISPATCH_PRINT, false));
			request.setAttribute("transportSearchModuleForCargo", cache.getTransportSearchModuleForCargo(request, executive.getAccountGroupId()));
			request.setAttribute("showBillDetailsOnSearch", searchConfiguration.getOrDefault(SearchConfigPropertiesConstant.SHOW_BILL_DETAILS_ON_SEARCH, false));
			request.setAttribute("ShowDownloadToExcelForBillOnSearch", searchConfiguration.getOrDefault(SearchConfigPropertiesConstant.SHOW_DOWNLOAD_TO_EXCEL_FOR_BILL_ON_SEARCH, false));
			request.setAttribute("downloadToPDFForBillOnSearch", searchConfiguration.getOrDefault(SearchConfigPropertiesConstant.DOWNLOAD_TO_PDF_FOR_BILL_ON_SEARCH, false));

			request.setAttribute(LsPrintConfigurationDTO.SHOW_MINIFIED_PRINT_AND_LR_DETAILS_BUTTON, dispatchLsPrintConfiguration.getBoolean(LsPrintConfigurationDTO.SHOW_MINIFIED_PRINT_AND_LR_DETAILS_BUTTON, false));
			request.setAttribute(LsPrintConfigurationDTO.DISPLAY_MINIFIED_LS_LINK, dispatchLsPrintConfiguration.getBoolean(LsPrintConfigurationDTO.DISPLAY_MINIFIED_LS_LINK, false));
			request.setAttribute(BranchExpensePropertiesConstant.BRANCH_EXPENSE_PRINT_NEW_FLOW_ALLOW, expenseConfiguration.getOrDefault(BranchExpensePropertiesConstant.BRANCH_EXPENSE_PRINT_NEW_FLOW_ALLOW, false));
			request.setAttribute(SearchConfigPropertiesConstant.IS_LHPV_REPRINT_ALLOWED, searchConfiguration.getOrDefault(SearchConfigPropertiesConstant.IS_LHPV_REPRINT_ALLOWED, false));
			request.setAttribute(STBSSettlementConfigurationConstant.SHOW_STBS_MR_PRINT, configurationSTBSSettlement.getOrDefault(STBSSettlementConfigurationConstant.SHOW_STBS_MR_PRINT, false));
			request.setAttribute(BillPaymentConfigurationConstant.SHOW_MR_PRINT, billPaymentConfig.getOrDefault(BillPaymentConfigurationConstant.SHOW_MR_PRINT, false));
			request.setAttribute(CreditorInvoicePropertiesConstant.BRANCH_CODE_WISE_BILL_NUMBER_GENERATION, billConfiguration.getOrDefault(CreditorInvoicePropertiesConstant.BRANCH_CODE_WISE_BILL_NUMBER_GENERATION, false));
			request.setAttribute(CreditorInvoicePropertiesConstant.IS_WS_INVOICE_PRINT_NEEDED, billConfiguration.getOrDefault(CreditorInvoicePropertiesConstant.IS_WS_INVOICE_PRINT_NEEDED, false));
			request.setAttribute(LsPrintConfigurationDTO.SHOW_DIFFERENT_LS_SUMMARY_PRINT, dispatchLsPrintConfiguration.getBoolean(LsPrintConfigurationDTO.SHOW_DIFFERENT_LS_SUMMARY_PRINT, false));
			request.setAttribute(SearchConfigPropertiesConstant.SEARCH_TYPE_BRANCH_TEXT_BOX_HIDE, searchConfiguration.getOrDefault(SearchConfigPropertiesConstant.SEARCH_TYPE_BRANCH_TEXT_BOX_HIDE, false));
			request.setAttribute(STBSConfigurationConstant.ALLOW_BRANCH_WISE_SEQUENCE_COUNTER, configurationSTBS.getOrDefault(STBSConfigurationConstant.ALLOW_BRANCH_WISE_SEQUENCE_COUNTER, false));
			request.setAttribute(SearchConfigPropertiesConstant.SHOW_VASULI_PRINT, searchConfiguration.getOrDefault(SearchConfigPropertiesConstant.SHOW_VASULI_PRINT, false));
			request.setAttribute(LsPrintConfigurationDTO.IS_ALLOW_LS_PRINT_LOCKING, dispatchLsPrintConfiguration.getBoolean(LsPrintConfigurationDTO.IS_ALLOW_LS_PRINT_LOCKING, false));
			request.setAttribute(STBSConfigurationConstant.ALLOW_SUBREGION_WISE_SEQUENCE_COUNTER, configurationSTBS.getOrDefault(STBSConfigurationConstant.ALLOW_SUBREGION_WISE_SEQUENCE_COUNTER, false));
			request.setAttribute(DoorPickupLSPropertiesConstant.ALLOW_EDIT_PICKUP_LS_LORRY_HIRE_AMOUNT, (boolean) doorPickupLSConfig.getOrDefault(DoorPickupLSPropertiesConstant.ALLOW_EDIT_PICKUP_LS_LORRY_HIRE_AMOUNT, false) && execFldPermissions.get(FeildPermissionsConstant.ALLOW_EDIT_PICKUP_LS_LORRY_HIRE_AMOUNT) != null);
			request.setAttribute(DoorPickupLSPropertiesConstant.ALLOW_EDIT_PICKUP_LS_VEHICLE_NUMBER, (boolean) doorPickupLSConfig.getOrDefault(DoorPickupLSPropertiesConstant.ALLOW_EDIT_PICKUP_LS_VEHICLE_NUMBER, false) && execFldPermissions.get(FeildPermissionsConstant.ALLOW_EDIT_PUCKUP_LS_VEHICLE_NUMBER) != null);
			request.setAttribute(DoorPickupLSPropertiesConstant.ALLOW_EDIT_PICKUP_LS_SOURCE_AND_DESTINATION, (boolean) doorPickupLSConfig.getOrDefault(DoorPickupLSPropertiesConstant.ALLOW_EDIT_PICKUP_LS_SOURCE_AND_DESTINATION, false) && execFldPermissions.get(FeildPermissionsConstant.ALLOW_EDIT_PICKUP_LS_SOURCE_AND_DESTINATION) != null);
			request.setAttribute(DoorPickupLSPropertiesConstant.ALLOW_EDIT_PICKUP_LS_DATE, (boolean) doorPickupLSConfig.getOrDefault(DoorPickupLSPropertiesConstant.ALLOW_EDIT_PICKUP_LS_DATE, false) && execFldPermissions.get(FeildPermissionsConstant.ALLOW_EDIT_PICKUP_LS_DATE) != null);
			request.setAttribute(SearchConfigPropertiesConstant.SHOW_SUPPLIER_NO_CHECKBOX, searchConfiguration.getOrDefault(SearchConfigPropertiesConstant.SHOW_SUPPLIER_NO_CHECKBOX, false));
			request.setAttribute(SearchConfigPropertiesConstant.SHOW_EDIT_LS_HISTORY_BUTTON, searchConfiguration.getOrDefault(SearchConfigPropertiesConstant.SHOW_EDIT_LS_HISTORY_BUTTON, false));

			request.setAttribute("cityList", cache.getCityListWithName(request, executive));

			if(transportList.contains(executive.getAccountGroupId()) || cache.getTransportSearchModuleForCargo(request, executive.getAccountGroupId()))
				request.setAttribute("nextPageToken", "success");
			else
				request.setAttribute("nextPageToken", "success_cargo");
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}
}
