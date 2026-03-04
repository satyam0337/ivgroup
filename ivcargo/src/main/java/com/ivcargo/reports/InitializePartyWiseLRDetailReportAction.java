package com.ivcargo.reports;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.constant.properties.GeneralConfigurationPropertiesConstant;
import com.iv.constant.properties.report.PartyWiseLrDetailsConfigurationDTO;
import com.iv.dto.constant.ExecutiveTypeConstant;
import com.iv.dto.constant.FeildPermissionsConstant;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.dto.constant.WayBillStatusConstant;
import com.iv.utils.utility.CollectionUtility;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.model.DayWiseDateModel;
import com.platform.dto.model.PartyWiseLRDetailModel;

public class InitializePartyWiseLRDetailReportAction implements Action {

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	error 			= null;
		List<Long>				partyIdsList    = null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	cacheManip  		= new CacheManip(request);
			final var	executive   		= cacheManip.getExecutive(request);
			final var	execFldPermissions	= cacheManip.getExecutiveFieldPermission(request);

			final var	configuration = ReadAllConfigurationsBllImpl.getInstance().getReportConfigurationData(ReportIdentifierConstant.PARTY_WISE_LR_DETAIL, executive.getAccountGroupId());

			final var	generalConfig	= cacheManip.getGeneralConfiguration(request, executive.getAccountGroupId());

			var			showBranchWisePartyForNormalUser 		= (boolean) configuration.getOrDefault(PartyWiseLrDetailsConfigurationDTO.SHOW_BRANCH_WISE_PARTY_FOR_NORMAL_USER,false);
			final var	showAllOptionWithBillingPartySelection 	= (boolean) configuration.getOrDefault(PartyWiseLrDetailsConfigurationDTO.SHOW_ALL_OPTION_WITH_BILLING_PARTY_SELECTION,false);
			final var	partyIdsWithHtmlDataTableFormat	    	= (String) configuration.getOrDefault(PartyWiseLrDetailsConfigurationDTO.PARTY_ID_WITH_HTML_DATA_TABLE_FORMAT,"0_0");
			final var	isPartyWiseDifferentExcelFormat			= execFldPermissions != null && execFldPermissions.get(FeildPermissionsConstant.PARTY_WISE_DIFFERENT_EXCEL_FORMAT) != null;
			final var	showDownloadToExcelButton	    		= (boolean) configuration.getOrDefault(PartyWiseLrDetailsConfigurationDTO.SHOW_DOWNLOAD_TO_EXCEL_BUTTON,false);

			if(isPartyWiseDifferentExcelFormat) {
				partyIdsList		= new ArrayList<>();
				final var	partyIdsArr		= CollectionUtility.getStringListFromString(partyIdsWithHtmlDataTableFormat);

				if(!partyIdsArr.isEmpty())
					for (final String element : partyIdsArr)
						partyIdsList.add(Long.parseLong(element.split("_")[0]));
			}

			if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_EXECUTIVE
					|| executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_BRANCHADMIN && showBranchWisePartyForNormalUser)
				showBranchWisePartyForNormalUser = true;

			final Map<Integer, String>	partySelectionHM	= new LinkedHashMap<>();
			final Map<Short, String>	wayBillStatusHM		= new LinkedHashMap<>();

			if(showAllOptionWithBillingPartySelection) {
				partySelectionHM.put(PartyWiseLRDetailModel.PARTY_ALL, PartyWiseLRDetailModel.PARTY_ALL_NAME);
				partySelectionHM.put(PartyWiseLRDetailModel.PARTY_BILLINGPARTY, PartyWiseLRDetailModel.PARTY_BILLINGPARTY_NAME);
			} else
				partySelectionHM.put(PartyWiseLRDetailModel.PARTY_BOTH, PartyWiseLRDetailModel.PARTY_BOTH_NAME);

			partySelectionHM.put(PartyWiseLRDetailModel.PARTY_CONSIGNOR, PartyWiseLRDetailModel.PARTY_CONSIGNOR_NAME);
			partySelectionHM.put(PartyWiseLRDetailModel.PARTY_CONSIGNEE, PartyWiseLRDetailModel.PARTY_CONSIGNEE_NAME);

			wayBillStatusHM.put(WayBillStatusConstant.WAYBILL_STATUS_BOOKED, WayBillStatusConstant.WAYBILL_STATUS_BOOKED_NAME);
			wayBillStatusHM.put(WayBillStatusConstant.WAYBILL_STATUS_DISPATCHED, generalConfig.getString(GeneralConfigurationPropertiesConstant.DISPATCHED_STATUS_NAME));
			wayBillStatusHM.put(WayBillStatusConstant.WAYBILL_STATUS_RECEIVED, WayBillStatusConstant.WAYBILL_STATUS_RECEIVED_NAME);
			wayBillStatusHM.put(WayBillStatusConstant.WAYBILL_STATUS_DELIVERED, WayBillStatusConstant.WAYBILL_STATUS_DELIVERED_NAME);
			wayBillStatusHM.put(WayBillStatusConstant.WAYBILL_STATUS_DUEDELIVERED, generalConfig.getString(GeneralConfigurationPropertiesConstant.DUE_DELIVERED_STATUS_NAME));
			wayBillStatusHM.put(WayBillStatusConstant.WAYBILL_STATUS_DUEUNDELIVERED, generalConfig.getString(GeneralConfigurationPropertiesConstant.DUE_UNDELIVERED_STATUS_NAME));
			wayBillStatusHM.put(WayBillStatusConstant.WAYBILL_STATUS_CANCELLED_DELIVERY, WayBillStatusConstant.WAYBILL_STATUS_CANCELLED_DELIVERY_NAME);

			request.setAttribute(PartyWiseLrDetailsConfigurationDTO.SHOW_CR_NUMBER_COLUMN, (boolean) configuration.getOrDefault(PartyWiseLrDetailsConfigurationDTO.SHOW_CR_NUMBER_COLUMN,false));
			request.setAttribute(ActionStaticUtil.IS_ALL_REGION_NEED_TO_SHOW, true);
			request.setAttribute(ActionStaticUtil.IS_ALL_AREA_NEED_TO_SHOW, true);
			request.setAttribute(ActionStaticUtil.IS_ALL_BRANCHES_NEED_TO_SHOW, true);
			request.setAttribute(PartyWiseLrDetailsConfigurationDTO.SHOW_BRANCH_WISE_PARTY_FOR_NORMAL_USER, showBranchWisePartyForNormalUser);
			request.setAttribute(PartyWiseLrDetailsConfigurationDTO.SHOW_PARTY_TYPE_WISEDETAILS, (boolean) configuration.getOrDefault(PartyWiseLrDetailsConfigurationDTO.SHOW_PARTY_TYPE_WISEDETAILS,false));
			request.setAttribute("partySelectionHM", partySelectionHM);
			request.setAttribute("timeDurationHM", DayWiseDateModel.timeDurationHM);
			request.setAttribute("wayBillStatusHM", wayBillStatusHM);
			request.setAttribute(PartyWiseLrDetailsConfigurationDTO.IS_PARTY_WISE_DIFFERENT_EXCEL_FORMAT, isPartyWiseDifferentExcelFormat);
			request.setAttribute("partyIdsListForExcel", partyIdsList);
			request.setAttribute(PartyWiseLrDetailsConfigurationDTO.SHOW_DELETED_PARTY, (boolean) configuration.getOrDefault(PartyWiseLrDetailsConfigurationDTO.SHOW_DELETED_PARTY, false));
			request.setAttribute(PartyWiseLrDetailsConfigurationDTO.SHOW_DOWNLOAD_TO_EXCEL_BUTTON, showDownloadToExcelButton);
			request.setAttribute(PartyWiseLrDetailsConfigurationDTO.SEARCH_BY_GST_NUMBER_CHECKBOX, (boolean) configuration.getOrDefault(PartyWiseLrDetailsConfigurationDTO.SEARCH_BY_GST_NUMBER_CHECKBOX, false));
			request.setAttribute(PartyWiseLrDetailsConfigurationDTO.SHOW_DELETED_PARTY_WITH_DELETED_LABEL, (boolean) configuration.getOrDefault(PartyWiseLrDetailsConfigurationDTO.SHOW_DELETED_PARTY_WITH_DELETED_LABEL, false));
			request.setAttribute(PartyWiseLrDetailsConfigurationDTO.SHOW_BRANCH_WISE_PARTY_FOR_ALL_USER, (boolean) configuration.getOrDefault(PartyWiseLrDetailsConfigurationDTO.SHOW_BRANCH_WISE_PARTY_FOR_ALL_USER,false));

			ActionStaticUtil.setInitializeBranchesSelectionInRequest(request, executive);
			ActionStaticUtil.setExecutiveCoreReportPermissionsInRequest(request, executive);
			ActionStaticUtil.setExecutiveTypeBooleanInRequest(request, executive, true);
			ActionStaticUtil.setNextPageToken(request, ActionStaticUtil.SUCCESS);
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}
}