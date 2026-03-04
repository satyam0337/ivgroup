/**
 * Anant 11-Jun-2024 2:33:17 pm 2024
 */
package com.ivcargo.actions.intercepter;

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.iv.utils.exception.ExceptionProcess;
import com.iv.utils.request.UserAgentHelper;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.platform.dto.Executive;

public class PermissionRequestProcessor implements Filter {

	private static final String TRACE_ID = PermissionRequestProcessor.class.getName();

	@Override
	public void init(final FilterConfig filterConfig) throws ServletException {

	}

	@Override
	public void doFilter(final ServletRequest request, final ServletResponse response, final FilterChain chain)
			throws IOException, ServletException {
		try {
			final var httpRequest 	= (HttpServletRequest) request;
			final var httpResponse 	= (HttpServletResponse) response;
			final var session		= httpRequest.getSession();

			// Allow access to the login page without requiring a user session
			final var actionName 	= httpRequest.getServletPath();

			if ("/login".equals(actionName) || "/Login.do".equals(actionName) || "/Logout".equals(actionName) || "/Logout.do".equals(actionName)) {
				chain.doFilter(request, response);
				return;
			}

			final var	executive = (Executive) session.getAttribute(Executive.EXECUTIVE);

			if(executive != null) {
				final var	userAgentHelper	= new UserAgentHelper(httpRequest);

				final var fullURL 	= userAgentHelper.getFullURL();

				final var error 	= new HashMap<String, Object>();

				if(!ActionStaticUtil.isPermissionExist(httpRequest, getParameters(fullURL), error, executive)) {
					final var	rd = request.getRequestDispatcher("/jsp/error.jsp");
					rd.forward(httpRequest, httpResponse);
					return;
				}
			}

			chain.doFilter(request, response);
		} catch (final Exception e) {
			System.err.println("inside exception fileter");
			chain.doFilter(request, response);
		}
	}

	@Override
	public void destroy() {
		// TODO Auto-generated method stub
	}

	protected Map<String, String> getParameters(final String fullUrl) {
		try {
			final var url = new URL(fullUrl);
			final var value = url.getQuery();

			final Map<String, String> map	= new HashMap<>();

			final var values = value.split("&");

			for (final String par : values)
				map.put(par.split("=")[0], par.split("=")[1]);

			return map;
		} catch (final MalformedURLException e) {
			ExceptionProcess.execute(e, TRACE_ID);
		}

		return null;
	}

}
