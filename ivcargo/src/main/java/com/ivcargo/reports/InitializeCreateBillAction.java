package com.ivcargo.reports;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.CorporateAccountBLL;
import com.framework.Action;
import com.iv.bll.impl.bill.EditCreditorInvoiceBllImpl;
import com.iv.bll.utils.BookingWayBillSelectionUtility;
import com.iv.constant.properties.ConfigParamPropertiesConstant;
import com.iv.constant.properties.GroupConfigurationPropertiesConstant;
import com.iv.constant.properties.LrViewConfigurationPropertiesConstant;
import com.iv.constant.properties.invoice.CreditorInvoicePropertiesConstant;
import com.iv.dao.impl.companyheadmaster.CompanyHeadMasterDaoImpl;
import com.iv.dto.constant.ExecutiveTypeConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.constant.DateTimeFormatConstant;
import com.iv.utils.constant.PodWayBillPropertiesConstant;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.utility.Utility;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.reports.CreditWayBillPaymentDAO;
import com.platform.dto.AliasNameConstants;
import com.platform.dto.ConfigParam;
import com.platform.dto.CorporateAccount;
import com.platform.dto.ExecutiveFeildPermissionDTO;
import com.platform.dto.configuration.modules.GroupConfigurationPropertiesDTO;
import com.platform.dto.constant.FeildPermissionsConstant;
import com.platform.dto.constant.WayBillTypeConstant;

public class InitializeCreateBillAction implements Action {
	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	 				error 									= null;
		ArrayList<CorporateAccount> 			creditorList							= null;
		CorporateAccount[] 						creditorDetails 						= null;
		var										noOfDays	  							= 0;
		final var								isAdditionalRemarkAvailable				= false;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	cManip				= new CacheManip(request);
			final var	executive 			= cManip.getExecutive(request);
			final var	valueObjectIn		= new ValueObject();

			final var	lrViewConfiguration						= cManip.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.LR_SEARCH);
			final var	configParamConfiguration				= cManip.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.CONFIG_PARAM);
			final var 	invoiceConfigHM							= cManip.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.CREATE_INVOICE);
			final var	groupConfig								= cManip.getGroupConfiguration(request, executive.getAccountGroupId());
			final var	regions									= cManip.getAllRegions(request);
			final var	subRegions								= cManip.getAllSubRegions(request);
			final var	branches								= cManip.getGenericBranchesDetail(request);
			final var	branchIds								= cManip.getBranchIdsByExecutiveType(request, executive);
			final var	accountGroup							= cManip.getAccountGroupById(request, executive.getAccountGroupId());
			final var 	showEditConsignmentColumn				= (boolean) invoiceConfigHM.getOrDefault(CreditorInvoicePropertiesConstant.SHOW_EDIT_CONSIGNMENT_COLUMN, false);
			final var	isRegionWiseSelectionAllow				= (boolean) invoiceConfigHM.getOrDefault(CreditorInvoicePropertiesConstant.IS_REGION_WISE_SELECTION_ALLOW, false);
			final var	allowBackDate							= (boolean) invoiceConfigHM.getOrDefault(CreditorInvoicePropertiesConstant.ALLOW_BACK_DATE, false);
			final var 	showCompanyNameSelection				= (boolean) invoiceConfigHM.getOrDefault(CreditorInvoicePropertiesConstant.SHOW_COMPANY_NAME_SELECTION, false);
			final var	hideAllOptionInAreaSelection			= (boolean)	invoiceConfigHM.getOrDefault(CreditorInvoicePropertiesConstant.HIDE_ALL_OPTION_IN_AREA_SELECTION, false);
			final var 	showOnlyActiveParties					= (boolean) invoiceConfigHM.getOrDefault(CreditorInvoicePropertiesConstant.SHOW_ONLY_ACTIVE_PARTY, false);

			valueObjectIn.put(GroupConfigurationPropertiesDTO.GROUP_CONFIGURATION, groupConfig);
			valueObjectIn.put(AliasNameConstants.ALL_REGIONS, regions);
			valueObjectIn.put(AliasNameConstants.ALL_SUB_REGIONS, subRegions);
			valueObjectIn.put(AliasNameConstants.ALL_BRANCHES, branches);
			valueObjectIn.put(AliasNameConstants.ACCOUNT_GROUP, accountGroup);
			valueObjectIn.put("isCreditorParty", true);

			if(!hideAllOptionInAreaSelection)
				if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN)
					request.setAttribute(ActionStaticUtil.IS_ALL_REGION_NEED_TO_SHOW, true);
				else if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_REGIONADMIN)
					request.setAttribute(ActionStaticUtil.IS_ALL_AREA_NEED_TO_SHOW, true);
				else if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_SUBREGIONADMIN)
					request.setAttribute(ActionStaticUtil.IS_ALL_BRANCHES_NEED_TO_SHOW, true);

			ActionStaticUtil.executiveTypeWiseSelection1(request, cManip, executive);

			if(!isRegionWiseSelectionAllow || isRegionWiseSelectionAllow && (executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_EXECUTIVE ||
					executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_BRANCHADMIN)) {

				if((boolean) invoiceConfigHM.getOrDefault(CreditorInvoicePropertiesConstant.BILLING_BRANCH_WISE_BILL_CREATION_ALLOWED, false))
					creditorList	= CreditWayBillPaymentDAO.getInstance().getCreditorDetailsByBillingBranch(executive.getAccountGroupId(), branchIds);
				else if((boolean) invoiceConfigHM.getOrDefault(CreditorInvoicePropertiesConstant.SHOW_CREDITOR_DETAILS_BY_BILLING_PARTY_BRANCH_MAP, false))
					creditorList	= CreditWayBillPaymentDAO.getInstance().getCreditorDetailsbyBillingPartyBranchMap(executive.getAccountGroupId(), branchIds);
				else
					creditorList	= CreditWayBillPaymentDAO.getInstance().getCreditorDetails(executive.getAccountGroupId(), branchIds);

				if(showOnlyActiveParties)
					creditorList = new ArrayList<>(creditorList.stream().filter(e -> !e.isMarkForDeleteForParty()).toList());

				creditorDetails	= CorporateAccountBLL.getInstance().getPartyListByPartyIdentifiers(creditorList, valueObjectIn);
			}

			if((boolean) invoiceConfigHM.getOrDefault(CreditorInvoicePropertiesConstant.SHOW_LAST_INVOICE_DATE_IN_BACK_DATE, false)) {
				final var	billData	= CreditWayBillPaymentDAO.getInstance().getLastBillData(executive.getBranchId(), executive.getAccountGroupId());

				if(billData != null)
					request.setAttribute("lastBillDate", DateTimeUtility.getDateFromTimeStamp(billData.getLastBillDate(), DateTimeFormatConstant.DD_MM_YYYY));
			}

			final var	taxTypeStrHm = new EditCreditorInvoiceBllImpl().getTaxTypeWithPercentageHM(invoiceConfigHM, executive.getAccountGroupId());

			if(showCompanyNameSelection)
				request.setAttribute("companyList", CompanyHeadMasterDaoImpl.getInstance().getAllGroupWiseCompanyNameById(executive.getAccountGroupId()));

			request.setAttribute("CreditorDetails", creditorDetails);
			request.setAttribute(PodWayBillPropertiesConstant.IS_POD_REQUIRED, false);
			request.setAttribute("PodRequiredForInvoiceCreation", false);
			request.setAttribute("isAdditionalRemarkAvailable", isAdditionalRemarkAvailable);
			request.setAttribute(LrViewConfigurationPropertiesConstant.ALLOW_TO_ADD_AND_VIEW_LR_EXPENSE, lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.ALLOW_TO_ADD_AND_VIEW_LR_EXPENSE, false));
			request.setAttribute("transportModeList", cManip.getTransportationModeForGroupList(request, executive.getAccountGroupId()));
			request.setAttribute(CreditorInvoicePropertiesConstant.IS_WS_INVOICE_PRINT_NEEDED, (boolean) invoiceConfigHM.getOrDefault(CreditorInvoicePropertiesConstant.IS_WS_INVOICE_PRINT_NEEDED,false));
			request.setAttribute("showStatiscalCharge", Utility.isIdExistInLongList(invoiceConfigHM, CreditorInvoicePropertiesConstant.SUB_REGION_IDS_TO_SHOW_STATISCAL_CHARGE, executive.getSubRegionId()));
			request.setAttribute("invoiceConfigHM", invoiceConfigHM);
			request.setAttribute("podConfigHM", cManip.getPODWayBillConfiguration(request, executive.getAccountGroupId()));
			request.setAttribute("WayBillTypeConstant", WayBillTypeConstant.getWayBillTypeConstant().getHtData());
			request.setAttribute("taxTypeStrHm", taxTypeStrHm);

			if((boolean) invoiceConfigHM.getOrDefault(CreditorInvoicePropertiesConstant.IS_DIVISION_WISE_BILL_CREATION_ALLOW, false))
				request.setAttribute("divisionSelectionList", cManip.getDivisionMasterList(request, executive.getAccountGroupId()));

			if((boolean) invoiceConfigHM.getOrDefault(CreditorInvoicePropertiesConstant.SHOW_BILL_SELECTION_OPTION, false)) {
				final var groupConfigValObj	= cManip.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.BOOKING);
				request.setAttribute("billSelectionList", BookingWayBillSelectionUtility.getBillSelectionListForModule(groupConfigValObj));
			}

			// All Back Days Entry allow only Cash Statement Back Date Configuration
			final var	tallyTRFAllowed					= (boolean) configParamConfiguration.getOrDefault(ConfigParamPropertiesConstant.TALLY_TRANSFER_ALLOWED, false);
			final var	moduleWiseDaysConfigAllowed		= (boolean) configParamConfiguration.getOrDefault(ConfigParamPropertiesConstant.ALLOW_MODULE_WISE_DAYS, false);

			if (moduleWiseDaysConfigAllowed && !tallyTRFAllowed)
				noOfDays = (int) configParamConfiguration.getOrDefault(ConfigParamPropertiesConstant.DAYS_FOR_MANUAL_INVOICE, 0);
			else
				noOfDays = cManip.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_MAX_DAYS_OF_OPERATION_BEFORE_CASHSTATEMENT_ENTRY_ID);

			request.setAttribute("ManualInvoiceDaysAllowed", noOfDays);

			final Map<Long, ExecutiveFeildPermissionDTO> execFldPermissions 	= cManip.getExecutiveFieldPermission(request);

			request.setAttribute("editConsgnmntPermission", showEditConsignmentColumn && execFldPermissions.get(FeildPermissionsConstant.EDIT_CONSIGNMENT) != null);
			request.setAttribute("podHoldPermission", execFldPermissions.get(FeildPermissionsConstant.POD_HOLD) != null);
			request.setAttribute("editTBBCustPermission", execFldPermissions.get(FeildPermissionsConstant.EDIT_TBB_CUSTOMER) != null);
			request.setAttribute("collectionPersonPermission", execFldPermissions.get(FeildPermissionsConstant.COLLECTION_PERSON_FOR_TBB) != null);
			request.setAttribute(CreditorInvoicePropertiesConstant.ALLOW_BACK_DATE, allowBackDate || !allowBackDate && execFldPermissions.get(FeildPermissionsConstant.ALLOW_BACK_DATE_IN_CREDITOR_INVOICE) != null);
			request.setAttribute(GroupConfigurationPropertiesConstant.ADDITIONAL_REMARK_FEILD_LEBEL, groupConfig.getString(GroupConfigurationPropertiesConstant.ADDITIONAL_REMARK_FEILD_LEBEL, "Additional Remark"));
			request.setAttribute("nextPageToken", "success_" + executive.getAccountGroupId());
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}
}