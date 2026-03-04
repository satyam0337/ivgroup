package com.ivcargo.reports;

//~--- non-JDK imports --------------------------------------------------------

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.dto.constant.ExecutiveTypeConstant;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.ExecutiveDao;
import com.platform.dto.Executive;

public class InitializeReportAction implements Action {

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	 	error 					= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final CacheManip cache = new CacheManip(request);

			final Executive   executive = cache.getExecutive(request);
			Executive[] execu     = null;

			if (executive.getExecutiveType()==ExecutiveTypeConstant.EXECUTIVE_TYPE_BRANCHADMIN) {
				execu = ExecutiveDao.getInstance().findByBranchId(executive.getBranchId());
				request.setAttribute("execu", execu);
			}

			request.setAttribute("wayBillType", cache.getAllWayBillType(request));
			request.setAttribute("nextPageToken", "success");

		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}
	}
}
