package com.ivcargo.reports;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.framework.JSPUtility;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.reports.CreditWayBillTxnClearanceSummaryDAO;
import com.platform.dto.model.CreditWayBillTxnCleranceSummary;
import com.platform.resource.CargoErrorList;

public class ViewCreditWayBillTxnlSummaryAction implements Action {
	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	 			error 				= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	wayBillId		 	= JSPUtility.GetLong(request, "wayBillId");
			final var	creditWayBillTxnId 	= JSPUtility.GetLong(request, "creditWayBillTxnId");
			final var	cache 				= new CacheManip(request);

			if(creditWayBillTxnId > 0 && wayBillId > 0){
				final var	reportModelArray = CreditWayBillTxnClearanceSummaryDAO.getInstance().getCreditWayBillTxnClearanceDetailsByCreditWayBillTxnId(creditWayBillTxnId);

				if(reportModelArray != null) {
					for (final CreditWayBillTxnCleranceSummary element : reportModelArray)
						element.setReceivedByBranch(cache.getGenericBranchDetailCache(request, element.getReceivedByBranchId()).getName());

					request.setAttribute("reportModelArray", reportModelArray);
				} else {
					error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
					error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
					request.setAttribute("cargoError", error);
				}
			} else {
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}

			request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}

}