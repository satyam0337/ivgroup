package com.ivcargo.actions;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.platform.dao.CustomerEnquiryDao;

public class InitializeCustomerEnquiryAction implements Action {

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	 error 	= null;
		final long wayBillId = Long.parseLong(request.getParameter("wayBillId"));

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			request.setAttribute("wayBillId", wayBillId);
			request.setAttribute("CustomerEnquiry", CustomerEnquiryDao.getInstance().getCustomerEnquiryDetails(wayBillId));
			request.setAttribute("wayBillNo", request.getParameter("wayBillNo"));
			request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}
	}
}
