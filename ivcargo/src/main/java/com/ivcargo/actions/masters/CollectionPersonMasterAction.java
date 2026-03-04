package com.ivcargo.actions.masters;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.constant.properties.master.CollectionPersonMasterConfigurationConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;

public class CollectionPersonMasterAction implements Action{
	public static final String TRACE_ID = "CollectionPersonMasterAction";

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>				error 							= null;
		final String 								strResponse 					= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	cache = new CacheManip(request);
			final var	executive = cache.getExecutive(request);
			final var	configuration				= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.COLLECTION_PERSON_MASTER);

			request.setAttribute(CollectionPersonMasterConfigurationConstant.GROUP_LEVEL_COLLECTION_PERSON, configuration.getOrDefault(CollectionPersonMasterConfigurationConstant.GROUP_LEVEL_COLLECTION_PERSON, false));
			request.setAttribute(CollectionPersonMasterConfigurationConstant.REGION_LEVEL_COLLECTION_PERSON, configuration.getOrDefault(CollectionPersonMasterConfigurationConstant.REGION_LEVEL_COLLECTION_PERSON, false));
			request.setAttribute(CollectionPersonMasterConfigurationConstant.SUB_REGION_LEVEL_COLLECTION_PERSON, configuration.getOrDefault(CollectionPersonMasterConfigurationConstant.SUB_REGION_LEVEL_COLLECTION_PERSON, false));
			request.setAttribute(CollectionPersonMasterConfigurationConstant.BRANCH_LEVEL_COLLECTION_PERSON, configuration.getOrDefault(CollectionPersonMasterConfigurationConstant.BRANCH_LEVEL_COLLECTION_PERSON, false));
			request.setAttribute(CollectionPersonMasterConfigurationConstant.IS_PHONE_NUMBER_MANDATORY, configuration.getOrDefault(CollectionPersonMasterConfigurationConstant.IS_PHONE_NUMBER_MANDATORY, false));
			request.setAttribute(CollectionPersonMasterConfigurationConstant.IS_MOBILE_NUMBER_MANDATORY, configuration.getOrDefault(CollectionPersonMasterConfigurationConstant.IS_MOBILE_NUMBER_MANDATORY, false));

			final var filter = JSPUtility.GetInt(request, "filter",0);
			request.setAttribute("nextPageToken", "success");

			if(filter != 0) {
				response.sendRedirect("CollectionPersonMaster.do?pageId=265&eventId=1&message="+strResponse);
				request.setAttribute("message",strResponse);
			}
		} catch (final Exception _e) {
			ActionStaticUtil.catchActionException(request, _e, error);
		}

	}
}