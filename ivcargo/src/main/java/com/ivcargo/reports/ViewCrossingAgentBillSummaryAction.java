package com.ivcargo.reports;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.utils.DateTime.DateTimeUtility;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.DispatchLedgerDao;
import com.platform.dao.reports.CrossingAgentBillClearanceDAO;
import com.platform.dao.reports.CrossingAgentBillSummaryDAO;
import com.platform.dto.CrossingAgentBill;
import com.platform.dto.CrossingAgentBillPrintModel;
import com.platform.dto.CrossingAgentBillSummary;
import com.platform.dto.DispatchLedger;
import com.platform.dto.Executive;
import com.platform.resource.CargoErrorList;

public class ViewCrossingAgentBillSummaryAction implements Action {
	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	 			error 				= null;
		CacheManip							cache 				= null;
		Executive							executive			= null;
		Map<Long, DispatchLedger>  			lsColl				= null;
		List<CrossingAgentBillSummary>		crossingAgentBillSummaryArr			= null;
		List<CrossingAgentBillPrintModel>	modelArr			= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final long billId 	= JSPUtility.GetLong(request, "billId" ,0);

			if(billId > 0) {
				crossingAgentBillSummaryArr		= CrossingAgentBillSummaryDAO.getInstance().getWayBillDetailsForPrintingBill(billId);
				cache			= new CacheManip(request);
				executive		= cache.getExecutive(request);

				if(crossingAgentBillSummaryArr != null && !crossingAgentBillSummaryArr.isEmpty()) {
					final String dispatchIdsStr = crossingAgentBillSummaryArr.stream().map(e -> e.getDispatchLedgerId() + "").collect(Collectors.joining(","));
					lsColl				  = DispatchLedgerDao.getInstance().getDispatchLedgerDetailsByLSIds(dispatchIdsStr);

					modelArr	 = new ArrayList<>();

					for(final CrossingAgentBillSummary crSummary : crossingAgentBillSummaryArr) {
						final DispatchLedger	dispatchLedger	= lsColl.get(crSummary.getDispatchLedgerId());

						final CrossingAgentBillPrintModel crModel = new CrossingAgentBillPrintModel();

						crModel.setDispatchLedgerId(crSummary.getDispatchLedgerId());
						crModel.setLsNumber(crSummary.getLsNumber());
						crModel.setPaidAmount(crSummary.getPaidAmount());
						crModel.setTopayAmount(crSummary.getTopayAmount());
						crModel.setCrossingHire(crSummary.getCrossingHire());
						crModel.setNetAmount(crSummary.getNetAmount());
						crModel.setSourceBranchId(dispatchLedger.getSourceBranchId());
						crModel.setDestinationBranchId(dispatchLedger.getDestinationBranchId());
						crModel.setSourceBranch(cache.getBranchById(request, executive.getAccountGroupId(), dispatchLedger.getSourceBranchId()).getName());
						crModel.setDestinationBranch(cache.getBranchById(request, executive.getAccountGroupId(), dispatchLedger.getDestinationBranchId()).getName());
						crModel.setTripDateTimeStr(DateTimeUtility.getDateFromTimeStamp(dispatchLedger.getTripDateTime()));

						modelArr.add(crModel);
					}

					if(Short.parseShort(request.getParameter("billStatusId")) == CrossingAgentBill.CROSSINGAGENTBILL_CLEARANCE_STATUS_PARTIAL_PAYMENT_ID)
						request.setAttribute("BillClearanceDetails", CrossingAgentBillClearanceDAO.getInstance().getCrossingAgentBillClearanceDetailsForView(""+billId));

					request.setAttribute("CrossingAgentBillDetailsForViewBill", modelArr);
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
			ActionStepsUtil.catchActionException(request, e, error);
		} finally {
			cache 			= null;     
			executive		= null;     
			lsColl			= null;     
			modelArr		= null;    
			crossingAgentBillSummaryArr = null; 
		}
	}
}