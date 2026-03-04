package com.ivcargo.reports;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.platform.dao.GodownDao;
import com.platform.dto.Executive;
import com.platform.dto.Godown;

public class InitializeScrapGodownStockReportAction implements Action {


	public void execute(HttpServletRequest request, HttpServletResponse response) {

		// TODO Auto-generated method stub
		HashMap<String,Object>	error 	= null;
		Executive executive = null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error)){
				return;
			}

			executive = (Executive) request.getSession().getAttribute("executive");
			if(executive.getExecutiveType()==Executive.EXECUTIVE_TYPE_GROUPADMIN){
				request.setAttribute("GodownList", GodownDao.getInstance().getGroupGodownList(executive.getAccountGroupId(), Godown.GODOWN_TYPE_SCRAP_ID, false));
			}else if(executive.getExecutiveType()==Executive.EXECUTIVE_TYPE_BRANCHADMIN
					|| executive.getExecutiveType()==Executive.EXECUTIVE_TYPE_EXECUTIVE){
				request.setAttribute("GodownList", GodownDao.getInstance().getGodownListByBranch(executive.getBranchId(), executive.getAccountGroupId(), Godown.GODOWN_TYPE_SCRAP_ID, false));
			}
			request.setAttribute(ActionStaticUtil.NOTODATE, true);
			request.setAttribute("nextPageToken", "success");

		} catch (Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		} finally {
			executive = null;
		}
	}
}
