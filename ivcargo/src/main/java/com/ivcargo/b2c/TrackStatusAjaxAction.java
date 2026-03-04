package com.ivcargo.b2c;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.bll.impl.TrackStatusBllImpl;
import com.iv.utils.exception.ExceptionProcess;

public class TrackStatusAjaxAction implements Action {
	private static final String TRACE_ID = TrackStatusAjaxAction.class.getName();

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		try {
			response.setContentType("application/json; charset=UTF-8");
			response.addHeader("Access-Control-Allow-Origin", "*");
			response.addHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE, HEAD");
			response.addHeader("Access-Control-Allow-Headers", "X-PINGOTHER, Origin, X-Requested-With, Content-Type, Accept");
			response.addHeader("Access-Control-Max-Age", "1728000");

			final var printout = response.getWriter();

			final var	accountGroupId	= JSPUtility.GetLong(request, "accountGroupId", 0);
			final var	wayBillNumber	= JSPUtility.GetString(request, "wayBillNumber", null);

			TrackStatusBllImpl.getInstance().handleLRTracking(accountGroupId, wayBillNumber, printout);
		} catch (final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
		}
	}
}