package com.ivcargo.actions;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.dto.constant.BusinessFunctionConstants;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;

public class InitializePartyTransferAction implements Action {

	public static final String TRACE_ID = "InitializePartyTransferAction";

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	error 	= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			final var		cacheManip	= new CacheManip(request);

			if(!ActionStaticUtil.isAllowToAccessOperation(error, cacheManip, request, BusinessFunctionConstants.PARTYDATATRANSFER) || ActionStaticUtil.isSystemError(request,error))
				return;

			request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}
	}

}