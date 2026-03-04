package com.ivcargo.reports;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.logsapp.LogWriter;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.reports.CreditWayBillTxnDAO;
import com.platform.dto.WayBillDetailsForGeneratingBill;
import com.platform.resource.CargoErrorList;

public class ViewPaidCreditBillSummaryAction implements Action {
	private static final String TRACE_ID = "ViewPaidCreditBillSummaryAction";

	public void execute(HttpServletRequest request, HttpServletResponse response) {
		// TODO Auto-generated method stub

		HashMap<String,Object>	 			error 				= null;
		WayBillDetailsForGeneratingBill[]	bills 				= null;
		CacheManip							cache 				= null;
		ValueObject							valueobject			= null;

		try {

			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error)){
				return;
			}

			long billId		= JSPUtility.GetLong(request, "billId" ,0);
			valueobject		= CreditWayBillTxnDAO.getInstance().getPaidCreditWayBillDetailsForViewBillSummary(billId);
			cache			= new CacheManip(request);

			if(valueobject != null) {

				bills = (WayBillDetailsForGeneratingBill[])valueobject.get("modelArr");

				for (int i = 0; i < bills.length; i++) {
					
					bills[i].setSourceBranch(cache.getGenericBranchDetailCache(request,bills[i].getSourceBranchId()).getName());
					bills[i].setSourceSubRegionId(cache.getGenericBranchDetailCache(request,bills[i].getSourceBranchId()).getSubRegionId());
					bills[i].setSourceSubRegion(cache.getGenericSubRegionById(request, bills[i].getSourceSubRegionId()).getName());
					
					bills[i].setDestinationBranch(cache.getGenericBranchDetailCache(request,bills[i].getDestinationBranchId()).getName());
					bills[i].setDestinationSubRegionId(cache.getGenericBranchDetailCache(request, bills[i].getDestinationBranchId()).getSubRegionId());
					bills[i].setDestinationSubRegion(cache.getGenericSubRegionById(request, bills[i].getDestinationBranchId()).getName());
					
				}

				request.setAttribute("WayBillDetailsForGeneratingBill", bills);

			} else {
				LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, CargoErrorList.SYSTEM_ERROR + "");
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}

			request.setAttribute("nextPageToken", "success");

		} catch (Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		} finally {
			bills				= null;
			cache 				= null;
		}
	}
}