package com.ivcargo.actions;

//~--- non-JDK imports --------------------------------------------------------

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.dao.impl.LoginSessionNetworkDataDaoImpl;
import com.iv.dto.Executive;
import com.iv.dto.LoginSessionNetworkData;
import com.iv.dto.model.ExecutiveModel;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.exception.ExceptionProcess;

public class LogoutUserAction implements Action {
	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		try {
			final var session	= request.getSession(false);

			if(session == null)
				return;

			final var executive = (Executive) session.getAttribute(ExecutiveModel.EXECUTIVE_MODEL);

			if(executive != null && executive.getLoginSessionNetworkDataId() > 0) {
				final var	loginSessionNetworkData = new LoginSessionNetworkData();

				loginSessionNetworkData.setLoginNetworkSessionDataId(executive.getLoginSessionNetworkDataId());
				loginSessionNetworkData.setLogOutDateTime(DateTimeUtility.getCurrentTimeStamp());
				loginSessionNetworkData.setLoginFlag(LoginSessionNetworkData.USER_ATTEMPT_LOG_OUT);

				new LoginSessionNetworkDataDaoImpl().updateLogOutTimeInLoginSessionNetworkData(loginSessionNetworkData);
			}

			session.removeAttribute(Executive.EXECUTIVE);
			session.removeAttribute(ExecutiveModel.EXECUTIVE_MODEL);
			session.invalidate();

			request.setAttribute("nextPageToken", "success");
		} catch(final Exception ex) {
			ExceptionProcess.executeWithoutSentry(ex, LogoutUserAction.class.getName());
		}
	}
}