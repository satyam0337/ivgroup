package com.ivcargo.validators;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.JSPUtility;
import com.framework.Validator;
import com.iv.dto.Executive;
import com.iv.dto.constant.BusinessFunctionConstants;
import com.iv.dto.model.ExecutiveModel;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actions.LogoutUserAction;
import com.ivcargo.b2c.ClientInfo;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.AccountGroup;
import com.platform.resource.CargoErrorList;

public class CommonValidator implements Validator {
	public static final String TRACE_ID = CommonValidator.class.getName();

	@Override
	public HashMap<String, Object> validate(final HttpServletRequest request, final HttpServletResponse response) {
		final var error = new HashMap<String, Object>();

		try {
			final var	modulename	= request.getParameter("modulename");

			final var executive = (Executive) request.getSession().getAttribute(ExecutiveModel.EXECUTIVE_MODEL);

			if((modulename == null || !BusinessFunctionConstants.modulesWithoutSession().contains(modulename) || JSPUtility.GetShort(request, "redirectFilter", (short) 0) != 1) && executive == null)
				ActionStaticUtil.throwInvalidSessionError(request, error);
			else if(request.getParameter("webserviceURL") == null)
				ClientInfo.getClientInfo(request);

			if(executive != null) {
				final var cache	= new CacheManip(request);

				final var accountGroup = cache.getAccountGroupByAccountGroupId(request, executive.getAccountGroupId());

				if(accountGroup != null && accountGroup.getStatus() == AccountGroup.GROUP_DEACTIVE) {
					error.put(CargoErrorList.ERROR_CODE, CargoErrorList.SESSION_INVALID);
					error.put(CargoErrorList.ERROR_DESCRIPTION, "Group Is Deactivated !");
					request.setAttribute(CargoErrorList.CARGO_ERROR, error);
					ActionStaticUtil.setNextPageToken(request, ActionStaticUtil.NEEDLOGIN);
					new LogoutUserAction().execute(request, response);
				}
			}
		} catch(final Exception e) {
			error.put(CargoErrorList.ERROR_CODE, CargoErrorList.SYSTEM_ERROR);
			error.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.SYSTEM_ERROR_DESCRIPTION);
			request.setAttribute("error", error);
		}

		return error;
	}

}