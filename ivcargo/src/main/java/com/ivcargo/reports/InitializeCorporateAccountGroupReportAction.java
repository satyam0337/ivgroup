package com.ivcargo.reports;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.platform.dao.CorporateAccountDao;
import com.platform.dto.CorporateAccount;
import com.platform.dto.Executive;

public class InitializeCorporateAccountGroupReportAction implements Action {
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		// TODO Auto-generated method stub
		HashMap<String,Object>	error = null;
		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error)){
				return;
			}
			Executive   executive = (Executive) request.getSession().getAttribute("executive");
			CorporateAccount[] corporate = CorporateAccountDao.getInstance().findByAccountGroupId(executive.getAccountGroupId()); 
			request.setAttribute("corporateAcc", corporate);
			request.setAttribute("nextPageToken", "success");
		} catch (Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		}
	}
}
