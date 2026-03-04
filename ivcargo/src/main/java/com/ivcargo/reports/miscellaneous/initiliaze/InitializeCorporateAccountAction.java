package com.ivcargo.reports.miscellaneous.initiliaze;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.CorporateAccountBLL;
import com.framework.Action;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.CorporateAccountDao;
import com.platform.dto.AliasNameConstants;
import com.platform.dto.CorporateAccount;
import com.platform.dto.configuration.modules.GroupConfigurationPropertiesDTO;

public class InitializeCorporateAccountAction implements Action {
	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String, Object>	 			error 						= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	cManip				= new CacheManip(request);
			final var	executive 			= cManip.getExecutive(request);
			final var	valueObjectIn		= new ValueObject();
			final var	corporateAccountBLL	= new CorporateAccountBLL();
			
			final var	groupConfig			= cManip.getGroupConfiguration(request, executive.getAccountGroupId());
			final var	regions				= cManip.getAllRegions(request);
			final var	subRegions			= cManip.getAllSubRegions(request);
			final var	branches			= cManip.getGenericBranchesDetail(request);
			final var	accountGroup		= cManip.getAccountGroupById(request, executive.getAccountGroupId());

			valueObjectIn.put(GroupConfigurationPropertiesDTO.GROUP_CONFIGURATION, groupConfig);
			valueObjectIn.put(AliasNameConstants.ALL_REGIONS, regions);
			valueObjectIn.put(AliasNameConstants.ALL_SUB_REGIONS, subRegions);
			valueObjectIn.put(AliasNameConstants.ALL_BRANCHES, branches);
			valueObjectIn.put(AliasNameConstants.ACCOUNT_GROUP, accountGroup);
			valueObjectIn.put("isCreditorParty", true);

			final List<CorporateAccount>	creditorList		 = CorporateAccountDao.getInstance().findAllCreditorsByAccountGroupId(executive.getAccountGroupId());

			request.setAttribute("corporateAcc", corporateAccountBLL.getPartyListByPartyIdentifiers((ArrayList<CorporateAccount>) creditorList, valueObjectIn));
			request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}
}
