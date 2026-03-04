package com.ivcargo.actions;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;

public class InitializeUpdateCustomerAction implements Action {

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	 	error 						= null;
		long 						wayBillId 					= 0;
		double						freightAmount				= 0.00;
		boolean						isUpdateCustomer			= false;
		boolean						isUpdateTBBCustomer			= false;
		boolean						isUpdateCustomerWithRate	= false;
		boolean						isUpdateBillingParty		= false;
		String						billingPartyName			= "";

		try {

			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			if(request.getParameter("isUpdateTBBCustomer") != null)
				isUpdateTBBCustomer			= Boolean.parseBoolean(request.getParameter("isUpdateTBBCustomer"));

			if(request.getParameter("isUpdateCustomerWithRate") != null)
				isUpdateCustomerWithRate	= Boolean.parseBoolean(request.getParameter("isUpdateCustomerWithRate"));

			if(request.getParameter("isUpdateCustomer") != null)
				isUpdateCustomer			= Boolean.parseBoolean(request.getParameter("isUpdateCustomer"));

			if(request.getParameter("isUpdateBillingParty") != null)
				isUpdateBillingParty		= Boolean.parseBoolean(request.getParameter("isUpdateBillingParty"));

			wayBillId 					= Long.parseLong(request.getParameter("wayBillId"));

			if(request.getParameter("billingPartyName") != null)
				billingPartyName		= request.getParameter("billingPartyName");
			else if(request.getParameter("creditorName") != null)
				billingPartyName		= request.getParameter("creditorName");

			if(request.getParameter("freightAmount") != null)
				freightAmount			= Double.parseDouble(request.getParameter("freightAmount"));

			request.setAttribute("isUpdateCustomer", isUpdateCustomer);
			request.setAttribute("isUpdateTBBCustomer", isUpdateTBBCustomer);
			request.setAttribute("isUpdateCustomerWithRate", isUpdateCustomerWithRate);
			request.setAttribute("isUpdateBillingParty", isUpdateBillingParty);
			request.setAttribute("wayBillId", wayBillId);
			request.setAttribute("billingPartyName", billingPartyName);
			request.setAttribute("redirectFilter", request.getParameter("redirectFilter"));
			request.setAttribute("freightAmount", freightAmount);

			request.setAttribute("nextPageToken", "success");

		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}
	}
}