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
import com.platform.dto.ConsignmentSummary;
import com.platform.dto.CustomerDetails;
import com.platform.dto.WayBill;
import com.platform.dto.model.DispatchServiceNormReportViewWayBillModel;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

public class DeliveryServiceNormReportViewWayBillAction implements Action {

	public static final String TRACE_ID = "DeliveryServiceNormReportViewWayBillAction";

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {

		HashMap<String,Object>	 		error 					= null;
		CacheManip 						cManip 					= null;
		String							wayBillIds				= null;
		String							branchName				= null;
		HashMap<Long , WayBill>         wayBillHM				= null;
		HashMap<Long, CustomerDetails>	consignorColl			= null;
		HashMap<Long, CustomerDetails>	consigneeColl			= null;
		Long[]							wayBillIdArr			= null;
		CustomerDetails					consignor				= null;
		CustomerDetails					consignee				= null;
		WayBill							wayBill					= null;
		DispatchServiceNormReportViewWayBillModel dsrViewWayBillModel = null;
		HashMap<Long, DispatchServiceNormReportViewWayBillModel> dispatchViewHM = null;
		HashMap<Long, ConsignmentSummary> consignmentSmryHM  = null;
		ConsignmentSummary cSummary = null;
		final String							delimiter			= ",";
		boolean 						isCrossing			= false;
		short							dayValue			= 0;

		try {

			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error))
				return;
			cManip 		= new CacheManip(request);
			wayBillIds  = request.getParameter("wayBillIds");
			branchName  = request.getParameter("branchName");
			dayValue 	= JSPUtility.GetShort(request,"dayValue");
			isCrossing  = JSPUtility.GetBoolean(request,"isCrossing");

			if(wayBillIds != null){

				wayBillIdArr    = Utility.GetLongArrayFromString(wayBillIds,delimiter);

				if(wayBillIdArr != null){

					wayBillHM	= WayBillDao.getInstance().getLimitedLRDetails(wayBillIds);

					consignorColl 	= CustomerDetailsDao.getInstance().getConsignorDetailsByWayBillId(wayBillIds);
					consigneeColl 	= CustomerDetailsDao.getInstance().getConsigneeDetailsByWayBillId(wayBillIds);
					consignmentSmryHM = ConsignmentSummaryDao.getInstance().getConsignmentSummaryWeightsByWayBillIds(wayBillIds);

					dispatchViewHM 	= new HashMap<Long, DispatchServiceNormReportViewWayBillModel>();

					for (final Long element : wayBillIdArr) {

						dsrViewWayBillModel = new DispatchServiceNormReportViewWayBillModel();

						wayBill   = wayBillHM.get(element);
						consignor = consignorColl.get(element);
						consignee = consigneeColl.get(element);
						cSummary = consignmentSmryHM.get(element);

						dsrViewWayBillModel.setWayBillId(wayBill.getWayBillId());
						dsrViewWayBillModel.setWayBillNumber(wayBill.getWayBillNumber());
						dsrViewWayBillModel.setGrandTotal(wayBill.getGrandTotal());
						dsrViewWayBillModel.setConsignerName(consignor.getName());
						dsrViewWayBillModel.setConsigneeName(consignee.getName());
						dsrViewWayBillModel.setSourceBranch(cManip.getGenericBranchDetailCache(request,wayBill.getSourceBranchId()).getName());
						dsrViewWayBillModel.setDestinationBranch(cManip.getGenericBranchDetailCache(request,wayBill.getDestinationBranchId()).getName());
						/*if(wayBill.getDestinationCityId()  <= 0 && wayBill.getDestinationBranchId() <= 0){
							dsrViewWayBillModel.setDestinationBranch(dpHM.get(wayBill.getDeliveryPlaceId()).getName());
						}else{
							dsrViewWayBillModel.setDestinationBranch(cManip.getBranchById(request, executive.getAccountGroupId(),wayBill.getDestinationBranchId()).getName());
						}*/

						dsrViewWayBillModel.setActualWeight(cSummary.getActualWeight());

						dispatchViewHM.put(element, dsrViewWayBillModel);
					}
					request.setAttribute("dispatchViewHM",dispatchViewHM);
					request.setAttribute("dayValue",dayValue);
					request.setAttribute("isCrossing",isCrossing);
					request.setAttribute("branchName",branchName);
				}else {
					error.put("errorCode", CargoErrorList.NO_RECORDS);
					error.put("errorDescription", CargoErrorList.NO_RECORDS_DESCRIPTION);
					request.setAttribute("cargoError", error);
				}
			}else {
				error.put("errorCode", CargoErrorList.NO_RECORDS);
				error.put("errorDescription", CargoErrorList.NO_RECORDS_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}
			request.setAttribute("nextPageToken", "success");

		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		} finally {
			cManip 					= null;
			wayBillIds				= null;
			wayBillHM				= null;
			consignorColl			= null;
			consigneeColl			= null;
			wayBillIdArr			= null;
			dispatchViewHM 			= null;
			consignor				= null;
			consignee				= null;
			wayBill					= null;
			consignmentSmryHM  		= null;
			cSummary 				= null;
		}
	}
}
