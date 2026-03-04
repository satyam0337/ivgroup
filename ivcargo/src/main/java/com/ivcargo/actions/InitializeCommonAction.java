package com.ivcargo.actions;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.constant.properties.HeaderConfigurationConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.utils.constant.LoginPageConfigurationConstant;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.SequenceCounterDao;
import com.platform.dto.constant.CargoAccountGroupConstant;
import com.platform.dto.constant.TransCargoAccountGroupConstant;

public class InitializeCommonAction implements Action{
	public static final String TRACE_ID = "InitializeCommonAction";

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	 		error 							= null;
		var								groupwise						= false;
		var								photoMasterSpecific				= false;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request, error))
				return;

			final var 	cache	= new CacheManip(request);
			final var	executive 	= cache.getExecutive(request);

			if (executive == null) {
				ActionStaticUtil.throwInvalidSessionError(request, error);
				return;
			}

			final var 	headerConfig= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.HEADER);

			if(request.getSession().getAttribute(LoginPageConfigurationConstant.ANNOUNCEMENT_PAGE_GROUP_SPECIFIC) != null)
				groupwise		= Boolean.parseBoolean(request.getSession().getAttribute(LoginPageConfigurationConstant.ANNOUNCEMENT_PAGE_GROUP_SPECIFIC).toString());

			if(request.getSession().getAttribute(LoginPageConfigurationConstant.ALLOW_PHOTO_MASTER_SPECIFIC_FILE) != null)
				photoMasterSpecific = Boolean.parseBoolean(request.getSession().getAttribute(LoginPageConfigurationConstant.ALLOW_PHOTO_MASTER_SPECIFIC_FILE).toString());

			if(executive.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNTGORUPID_SRS_TRAVELS) {
				final var	initializeViewBranchCodeAction = new InitializeViewBranchCodeAction();
				initializeViewBranchCodeAction.execute(request, response);
				request.setAttribute("SequenceCounterForGroup", SequenceCounterDao.getInstance().getSequenceCounterForGroup(executive.getAccountGroupId()));
			}


			request.setAttribute(HeaderConfigurationConstant.ANNOUNEMENT_IMAGE, headerConfig.getOrDefault(HeaderConfigurationConstant.ANNOUNEMENT_IMAGE, null));
			request.setAttribute(HeaderConfigurationConstant.ANNOUNEMENT_CONTENT, headerConfig.getOrDefault(HeaderConfigurationConstant.ANNOUNEMENT_CONTENT, null));
			request.setAttribute("nextPageToken", groupwise ? "success_" + executive.getAccountGroupId() :  photoMasterSpecific ? "success_" + TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_LMT : "success");

		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}
	}
}
