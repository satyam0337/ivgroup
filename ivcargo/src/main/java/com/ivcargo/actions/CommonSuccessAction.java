package com.ivcargo.actions;

//~--- non-JDK imports --------------------------------------------------------

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;

public class CommonSuccessAction implements Action {
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		request.setAttribute("nextPageToken", "success");
	}
}
