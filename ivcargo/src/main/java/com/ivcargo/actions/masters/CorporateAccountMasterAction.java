package com.ivcargo.actions.masters;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.properties.impl.PropertyConfigValueBLLImpl;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.utils.utility.SortUtils;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.PropertiesFileConstants;
import com.platform.dto.configuration.modules.PartyMasterConfigurationDTO;
import com.platform.dto.constant.ExecutiveTypeConstant;

public class CorporateAccountMasterAction implements Action{

	public static final String TRACE_ID = "CorporeateAccountMasterAction";

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String, Object>			error 						= null;
		final String					strResponse					= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	cache		= new CacheManip(request);
			final var	exec		= cache.getExecutive(request);
			final var	filter		= JSPUtility.GetInt(request, "filter", 0);

			final var	configuration				= PropertyConfigValueBLLImpl.getInstance().getConfiguration(exec, PropertiesFileConstants.PARTY_MASTER_CONFIG);
			final var	emailAddressFeildMandatory	= configuration.getBoolean(PartyMasterConfigurationDTO.EMAIL_ADDRESS_FEILD_MANDATORY, false);
			final var	contactPersonFeildMandatory	= configuration.getBoolean(PartyMasterConfigurationDTO.CONTACT_PERSON_FEILD_MANDATORY,true);
			final var	phoneNumberFeildMandatory	= configuration.getBoolean(PartyMasterConfigurationDTO.PHONE_NUMBER_FEILD_MANDATORY,true);
			final var	customPartyType				= configuration.getBoolean(PartyMasterConfigurationDTO.CUSTOM_PARTY_TYPE,false);
			final var	showRegionSubregionBranchSelectionToAllUser = configuration.getBoolean(PartyMasterConfigurationDTO.SHOW_REION_SUBREION_BRANCH_SELECTION_TO_ALL_USER,false);

			request.setAttribute("emailAddressFeildMandatory", emailAddressFeildMandatory);
			request.setAttribute(PartyMasterConfigurationDTO.CONTACT_PERSON_FEILD_MANDATORY, contactPersonFeildMandatory);
			request.setAttribute(PartyMasterConfigurationDTO.PHONE_NUMBER_FEILD_MANDATORY, phoneNumberFeildMandatory);
			request.setAttribute(PartyMasterConfigurationDTO.CUSTOM_PARTY_TYPE, customPartyType);
			request.setAttribute("configuration", configuration);
			request.setAttribute(PartyMasterConfigurationDTO.SHOW_REION_SUBREION_BRANCH_SELECTION_TO_ALL_USER, showRegionSubregionBranchSelectionToAllUser);

			if(exec.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN
					|| showRegionSubregionBranchSelectionToAllUser) {
				final HashMap<Long, String>	cityList	= cache.getAllGroupCityIdList(request, exec);
				request.setAttribute("cityList", SortUtils.sortHashMapByValues(cityList));
			} else if(exec.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_REGIONADMIN)
				request.setAttribute("regionCities", cache.getCitiesByRegionId(request, exec.getAccountGroupId(), exec.getRegionId()));
			else if(exec.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_SUBREGIONADMIN)
				request.setAttribute("subRegionCities", cache.getCitiesBySubRegionId(request, exec.getAccountGroupId(), exec.getSubRegionId()));
			else if(exec.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_BRANCHADMIN
					|| exec.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_EXECUTIVE) {
				request.setAttribute("branchCity", cache.getCityById(request, exec.getCityId()));
				request.setAttribute("branch", cache.getBranchById(request, exec.getAccountGroupId(), exec.getBranchId()));
			}

			if(showRegionSubregionBranchSelectionToAllUser)
				request.setAttribute("regionForGroup", cache.getRegionsByGroupId(request, exec.getAccountGroupId()));
			else
				ActionStaticUtil.executiveTypeWiseSelection1(request, cache, exec);

			request.setAttribute("nextPageToken", "success");

			if(filter != 0) {
				response.sendRedirect("PartyMaster.do?pageId=201&eventId=1&message="+strResponse);
				request.setAttribute("message",strResponse);
			}
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}
}
