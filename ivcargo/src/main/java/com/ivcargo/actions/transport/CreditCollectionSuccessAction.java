package com.ivcargo.actions.transport;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.reports.ReportView;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.ConsignmentSummaryDao;
import com.platform.dao.CustomerDetailsDao;
import com.platform.dao.WayBillDao;
import com.platform.dao.reports.CreditorPaymentModuleDAO;
import com.platform.dto.ConsignmentSummary;
import com.platform.dto.CustomerDetails;
import com.platform.dto.WayBill;
import com.platform.dto.model.CreditWayBillTxn;
import com.platform.dto.model.ReportViewModel;
import com.platform.utils.Utility;

public class CreditCollectionSuccessAction implements Action {

	@SuppressWarnings("unchecked")
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		// TODO Auto-generated method stub

		HashMap<String,Object>	 		error 					= null;
		String							wayBillIds				= "";
		HashMap<Long, WayBill> 			hashMap					= null;
		HashMap<Long, CustomerDetails>	consignorColl			= null;
		HashMap<Long, CustomerDetails>	consigneeColl			= null;
		HashMap<Long, ConsignmentSummary> consignmentSmryHM 	= null;
		WayBill							wayBill					= null;
		CacheManip						cManip					= null;
		ValueObject						valueOutObject			= null;
		String[]						strWayBillArr			= null;
		CreditWayBillTxn[] 				creditWayBillTxnsPrint	= null;
		String							collectionPersonName	= null;
		ReportViewModel					reportViewModel			= null;
		HashMap<Long,Double> 			wayBillTxnHM 			= null; 

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error)){
				return;
			}

			wayBillIds 				= JSPUtility.GetString(request, "wayBillIds");
			collectionPersonName	= JSPUtility.GetString(request, "collectionPersonName");
			strWayBillArr			= wayBillIds.split(",");
			valueOutObject 			= WayBillDao.getInstance().getWayBillDetails(wayBillIds);
			creditWayBillTxnsPrint	= new CreditWayBillTxn[strWayBillArr.length];
			cManip					= new CacheManip(request);

			if(valueOutObject != null) {

				hashMap 			= (HashMap<Long, WayBill>)valueOutObject.get("WayBillHM");
				consignmentSmryHM 	= ConsignmentSummaryDao.getInstance().getLimitedConsignmentDetails(wayBillIds);
				consignorColl		= CustomerDetailsDao.getInstance().getConsignorDetailsByWayBillId(Utility.GetLongArrayToString((Long[])valueOutObject.get("wbIdArr")));
				consigneeColl		= CustomerDetailsDao.getInstance().getConsigneeDetailsByWayBillId(Utility.GetLongArrayToString((Long[])valueOutObject.get("wbIdArr")));
				wayBillTxnHM 		= CreditorPaymentModuleDAO.getInstance().getCreditAmountByWayBillIds(wayBillIds);

				for(int i = 0 ; i < strWayBillArr.length; i++){

					wayBill					  = hashMap.get(Long.parseLong(strWayBillArr[i]));
					creditWayBillTxnsPrint[i] = new CreditWayBillTxn();

					creditWayBillTxnsPrint[i].setWayBillId(wayBill.getWayBillId());
					creditWayBillTxnsPrint[i].setWayBillNumber(wayBill.getWayBillNumber());
					creditWayBillTxnsPrint[i].setConsignor(consignorColl.get(wayBill.getWayBillId()).getName());
					creditWayBillTxnsPrint[i].setConsignee(consigneeColl.get(wayBill.getWayBillId()).getName());
					creditWayBillTxnsPrint[i].setActualWeight(consignmentSmryHM.get(wayBill.getWayBillId()).getActualWeight());
					creditWayBillTxnsPrint[i].setQuantity(consignmentSmryHM.get(wayBill.getWayBillId()).getQuantity());
					creditWayBillTxnsPrint[i].setSourceBranch(cManip.getGenericBranchDetailCache(request, wayBill.getSourceBranchId()).getName());

					if(wayBill.getDestinationBranchId() > 0){
						creditWayBillTxnsPrint[i].setDestinationBranch(cManip.getGenericBranchDetailCache(request, wayBill.getDestinationBranchId()).getName());
					}else{
						creditWayBillTxnsPrint[i].setDestinationBranch(wayBill.getDeliveryPlace());
					}

					creditWayBillTxnsPrint[i].setGrandTotal(wayBillTxnHM.get(wayBill.getWayBillId()));
					creditWayBillTxnsPrint[i].setCreationDateTimeStamp(wayBill.getCreationDateTimeStamp());
				}
			}

			reportViewModel = new ReportViewModel();
			reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);
			request.setAttribute("ReportViewModel",reportViewModel);

			request.setAttribute("CreditWayBillTxnsPrint", creditWayBillTxnsPrint);
			request.setAttribute("CollectionPersonName", collectionPersonName);
			request.setAttribute("nextPageToken", "success");

		} catch (Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		} finally {
			wayBillIds				= null;
			hashMap					= null;
			consignorColl			= null;
			consigneeColl			= null;
			consignmentSmryHM 		= null;
			wayBill					= null;
			cManip					= null;
			valueOutObject			= null;
			strWayBillArr			= null;
			creditWayBillTxnsPrint	= null;
			collectionPersonName	= null;
			reportViewModel			= null;
			wayBillTxnHM 			= null;
		}
	}
}
