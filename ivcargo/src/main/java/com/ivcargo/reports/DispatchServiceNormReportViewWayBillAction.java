package com.ivcargo.reports;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.framework.JSPUtility;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.ConsignmentSummaryDao;
import com.platform.dao.CustomerDetailsDao;
import com.platform.dao.WayBillDao;
import com.platform.dto.model.DispatchServiceNormReportViewWayBillModel;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

public class DispatchServiceNormReportViewWayBillAction implements Action {

	public static final String TRACE_ID = "DispatchServiceNormReportViewWayBillAction";

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {

		HashMap<String,Object>	 		error 					= null;
		final var							delimiter			= ",";

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	cManip 		= new CacheManip(request);
			final var	wayBillIds  = request.getParameter("wayBillIds");
			final var	branchName  = request.getParameter("branchName");
			final var	dayValue 	= JSPUtility.GetShort(request,"dayValue", (short) 0);
			final var	isCrossing  = JSPUtility.GetBoolean(request,"isCrossing", false);

			if(wayBillIds != null) {
				final var	wayBillIdArr    = Utility.GetLongArrayFromString(wayBillIds,delimiter);

				if(wayBillIdArr != null) {
					final var	wayBillHM	= WayBillDao.getInstance().getLimitedLRDetails(wayBillIds);

					final var	consignorColl 	= CustomerDetailsDao.getInstance().getConsignorDetailsByWayBillId(wayBillIds);
					final var	consigneeColl 	= CustomerDetailsDao.getInstance().getConsigneeDetailsByWayBillId(wayBillIds);
					final var	consignmentSmryHM = ConsignmentSummaryDao.getInstance().getConsignmentSummaryWeightsByWayBillIds(wayBillIds);

					final var	dispatchViewHM 	= new HashMap<>();

					for (final Long element : wayBillIdArr) {
						final var	dsrViewWayBillModel = new DispatchServiceNormReportViewWayBillModel();

						final var	wayBill = wayBillHM.get(element);
						final var	consignor = consignorColl.get(element);
						final var	consignee = consigneeColl.get(element);
						final var	cSummary = consignmentSmryHM.get(element);

						dsrViewWayBillModel.setWayBillId(wayBill.getWayBillId());
						dsrViewWayBillModel.setWayBillNumber(wayBill.getWayBillNumber());
						dsrViewWayBillModel.setGrandTotal(wayBill.getGrandTotal());
						dsrViewWayBillModel.setConsignerName(consignor.getName());
						dsrViewWayBillModel.setConsigneeName(consignee.getName());
						dsrViewWayBillModel.setSourceBranch(cManip.getGenericBranchDetailCache(request,wayBill.getSourceBranchId()).getName());
						dsrViewWayBillModel.setDestinationBranch(cManip.getGenericBranchDetailCache(request, wayBill.getDestinationBranchId()).getName());
						dsrViewWayBillModel.setActualWeight(cSummary.getActualWeight());

						dispatchViewHM.put(element, dsrViewWayBillModel);
					}

					request.setAttribute("dispatchViewHM",dispatchViewHM);
					request.setAttribute("dayValue",dayValue);
					request.setAttribute("isCrossing",isCrossing);
					request.setAttribute("branchName",branchName);
				} else {
					error.put("errorCode", CargoErrorList.NO_RECORDS);
					error.put("errorDescription", CargoErrorList.NO_RECORDS_DESCRIPTION);
					request.setAttribute("cargoError", error);
				}
			} else {
				error.put("errorCode", CargoErrorList.NO_RECORDS);
				error.put("errorDescription", CargoErrorList.NO_RECORDS_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}

			request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}
	}
}