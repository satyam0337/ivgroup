/**
 * 
 */
package com.ivcargo.actions.intercepter;

import java.io.IOException;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.platform.dto.Executive;

public class SessionCheckFilter implements Filter {

	public void doFilter(final ServletRequest request, final ServletResponse response, final FilterChain chain) throws IOException, ServletException {

		final var req = (HttpServletRequest) request;
		final var res = (HttpServletResponse) response;

		final var executive = (Executive) req.getSession().getAttribute("executive");

		if (executive == null) {
			res.sendRedirect("Logout.do?pageId=1&eventId=2");
			return;
		}

		chain.doFilter(request, response);
	}

	@Override
	public void init(final FilterConfig filterConfig) throws ServletException {
		// TODO Auto-generated method stub

	}

	@Override
	public void destroy() {
		// TODO Auto-generated method stub

	}
}
