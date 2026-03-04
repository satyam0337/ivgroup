package com.ivcargo.validators;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Validator;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actions.InitializeUserAction;

public class PreLoginValidator  implements Validator {

	@Override
	public HashMap<String,Object> validate(final HttpServletRequest request,final HttpServletResponse response) throws Exception {
		final var error = new HashMap<String,Object>();

		if(request.getParameter("refresCacheExternal") == null && request.getSession().getServletContext().getAttribute("usermanager") != null) {
			final var usermanager = (ValueObject) request.getSession().getServletContext().getAttribute("usermanager");

			if(usermanager.get(request.getSession().getId()) != null)
				new InitializeUserAction().execute(request, response);

			request.getSession().getServletContext().setAttribute("usermanager", usermanager);
		} else if(request.getParameter("refresCacheExternal") != null)
			new InitializeUserAction().execute(request, response);

		return error;
	}
}