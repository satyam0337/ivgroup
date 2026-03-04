package com.ivcargo.ajax;

import java.io.PrintWriter;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.platform.dao.PartyTransferDao;
import com.platform.dto.Executive;
import com.platform.dto.PartyTransfer;

public class PartyTransferAjaxAction implements Action {

	public void execute(HttpServletRequest request, HttpServletResponse response) {
		// TODO Auto-generated method stub

		PrintWriter 				out				= null;
		HashMap<String,Object>	 	error 			= null;
		Executive		executive		= null;
		String			str				= null;
		PartyTransfer	fromParty		= null;
		String			resultString	= null;
		String			returnedResult	= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error)){
				return;
			}

			fromParty	  = new PartyTransfer();
			response.setContentType("text/plain");
			executive 	=	(Executive) request.getSession().getAttribute("executive");

			if(executive != null) {

				fromParty.setFromCorporateAccountIdWhenParty((Long.parseLong(request.getParameter("fromPartyId"))));	
				fromParty.setFromCorporateAccountIdWhenTBB((Long.parseLong(request.getParameter("fromTBBId")))); 
				fromParty.setAccountGroupId(executive.getAccountGroupId());
				if(fromParty.getFromCorporateAccountIdWhenParty() > 0) {
					out = response.getWriter();
					str="noResults";
					out.println(str);
					out.flush();
					request.setAttribute("nextPageToken", "success");
				} else {
					returnedResult=PartyTransferDao.getInstance().checkifFromPartyTransactionsExist(fromParty);
					out = response.getWriter();
					if(returnedResult != null) {
						resultString=returnedResult;
					} else {
						resultString="noResults";
					}
					out.println(resultString);
					out.flush();
					request.setAttribute("nextPageToken", "success");
				}
			}
		}catch (Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		} finally{
			out.close();
			executive		= null;
			str				= null;
			fromParty		= null;
			resultString	= null;
			returnedResult	= null;
		}

	}

}