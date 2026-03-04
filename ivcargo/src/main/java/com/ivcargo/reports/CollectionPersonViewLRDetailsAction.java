package com.ivcargo.reports;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.HashMap;
import java.util.SortedMap;
import java.util.TreeMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.CustomerDetailsDao;
import com.platform.dao.DeliveryContactDetailsDao;
import com.platform.dao.reports.CollectionPersonWiseSummaryReportDAO;
import com.platform.dao.reports.CreditWayBillTxnClearanceSummaryDAO;
import com.platform.dto.Bill;
import com.platform.dto.CustomerDetails;
import com.platform.dto.DeliveryContactDetails;
import com.platform.dto.model.CreditWayBillTxn;
import com.platform.dto.model.CreditWayBillTxnCleranceSummary;
import com.platform.dto.model.ReportViewModel;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

public class CollectionPersonViewLRDetailsAction implements Action {

	public static final String TRACE_ID = "CollectionPersonViewLRDetailsAction";

	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	 		error 					= null;
		CacheManip 						cManip 					= null;
		String							wayBillIds				= null;
		HashMap<Long, CustomerDetails>	consignorColl			= null;
		HashMap<Long, CustomerDetails>	consigneeColl			= null;
		CustomerDetails					consignor				= null;
		CustomerDetails					consignee				= null;
		ValueObject						outValueObject			= null;
		Timestamp						fromDate				= null;
		Timestamp						toDate					= null;
		SimpleDateFormat 				sdf            			= null;
		CreditWayBillTxn[]				reportModel				= null;
		CreditWayBillTxn				model					= null;
		Long[]							wayBillIdArray			= null;
		Long[]							creditWBTxnIdArray		= null;
		SortedMap<String, CreditWayBillTxn> creditCollHM		= null;
		ReportViewModel					reportViewModel			= null;
		HashMap<Long, DeliveryContactDetails> 	delivertHM		= null;
		DeliveryContactDetails					delConDet		= null;
		String							creditWBTxnIds			= null;
		CreditWayBillTxnCleranceSummary		creditWayBillTxnClearanceSum 		= null;
		HashMap<Long, CreditWayBillTxnCleranceSummary> 	creditWayBillTxnClearanceSumHM		= null;
		short							txnTypeId			= 0;
		String							paymentStatusIds	= null;
		long							collectionPersonId	= 0;
		long							branchId			= 0;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error)){
				return;
			}
			cManip 				= new CacheManip(request);
			branchId			= JSPUtility.GetLong(request,"branchId");
			collectionPersonId	= JSPUtility.GetLong(request,"collectionPersonId");
			paymentStatusIds 	= JSPUtility.GetString(request,"paymentStatusId");
			txnTypeId 			= JSPUtility.GetShort(request,"txnTypeId");
			sdf					= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			fromDate			= new Timestamp((sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00")).getTime());
			toDate				= new Timestamp((sdf.parse(JSPUtility.GetString(request, "toDate") + " 23:59:59")).getTime());

			if(collectionPersonId > 0 && branchId > 0 && paymentStatusIds != null && txnTypeId > 0){
				
				outValueObject = CollectionPersonWiseSummaryReportDAO.getInstance().getCollectionPersonDataForLRDetails(collectionPersonId, branchId, txnTypeId, paymentStatusIds, fromDate, toDate);

				if(outValueObject != null){

					reportModel 		= (CreditWayBillTxn[])outValueObject.get("reportModelArr");
					wayBillIdArray 		= (Long[]) outValueObject.get("wayBillIdArray");
					creditWBTxnIdArray 	= (Long[]) outValueObject.get("creditWBTxnIdArray");

					creditWBTxnIds = Utility.GetLongArrayToString(creditWBTxnIdArray);
					creditWayBillTxnClearanceSumHM	= CreditWayBillTxnClearanceSummaryDAO.getInstance().getCreditWayBillTxnSummaryByCreditWayBillTxnIds(creditWBTxnIds);

					wayBillIds          = Utility.GetLongArrayToString(wayBillIdArray); 
					consignorColl 		= CustomerDetailsDao.getInstance().getConsignorDetailsByWayBillId(wayBillIds);
					consigneeColl 		= CustomerDetailsDao.getInstance().getConsigneeDetailsByWayBillId(wayBillIds);
					delivertHM			= DeliveryContactDetailsDao.getInstance().getDeliveryContactDetailsForBLHPV(wayBillIds);

					creditCollHM 		=  new TreeMap<String, CreditWayBillTxn>();

					for(int index = 0; index < reportModel.length; index++) {

						if(creditWayBillTxnClearanceSumHM != null && creditWayBillTxnClearanceSumHM.size() > 0){
							creditWayBillTxnClearanceSum = creditWayBillTxnClearanceSumHM.get(reportModel[index].getCreditWayBillTxnId());
						}
						model = new CreditWayBillTxn();

						consignor = consignorColl.get(reportModel[index].getWayBillId());
						consignee = consigneeColl.get(reportModel[index].getWayBillId());

						model.setWayBillId(reportModel[index].getWayBillId());
						model.setWayBillNumber(reportModel[index].getWayBillNumber());
						model.setConsignor(consignor.getName());
						model.setConsignee(consignee.getName());
						model.setSourceBranch(cManip.getGenericBranchDetailCache(request, reportModel[index].getSourceBranchId()).getName());
						model.setDestinationBranch(cManip.getGenericBranchDetailCache(request, reportModel[index].getDestinationBranchId()).getName());
						model.setExecutiveName(reportModel[index].getExecutiveName());
						if(creditWayBillTxnClearanceSum != null && creditWayBillTxnClearanceSum.getReceivedByBranchId() > 0){
							model.setReceivedByBranch(cManip.getGenericBranchDetailCache(request, creditWayBillTxnClearanceSum.getReceivedByBranchId()).getName());
						} else {
							model.setReceivedByBranch("");
						}
						model.setGrandTotal(reportModel[index].getGrandTotal());
						if(reportModel[index].getPaymentStatus() == Bill.BILL_CLEARANCE_STATUS_DUE_PAYMENT_ID){
							model.setPendingAmount(reportModel[index].getGrandTotal());
						} else if(reportModel[index].getPaymentStatus() == Bill.BILL_CLEARANCE_STATUS_CLEAR_PAYMENT_ID){
							model.setReceivedAmount(creditWayBillTxnClearanceSum != null ? creditWayBillTxnClearanceSum.getReceivedAmount() : 0);
						} else if(reportModel[index].getPaymentStatus() == Bill.BILL_CLEARANCE_STATUS_NEGOTIATED_ID){
							model.setNegotiatedAmount(reportModel[index].getGrandTotal() - (creditWayBillTxnClearanceSum != null ? creditWayBillTxnClearanceSum.getReceivedAmount() : 0));
							model.setReceivedAmount(creditWayBillTxnClearanceSum != null ? creditWayBillTxnClearanceSum.getReceivedAmount() : 0);
						} else if(reportModel[index].getPaymentStatus() == Bill.BILL_CLEARANCE_STATUS_PARTIAL_PAYMENT_ID){
							model.setReceivedAmount((creditWayBillTxnClearanceSum != null ? creditWayBillTxnClearanceSum.getReceivedAmount() : 0));
							model.setPendingAmount(reportModel[index].getGrandTotal() - (creditWayBillTxnClearanceSum != null ? creditWayBillTxnClearanceSum.getReceivedAmount() : 0));
						}
						if(delivertHM != null){
							delConDet = delivertHM.get(reportModel[index].getWayBillId());
							if(delConDet != null){
								model.setWayBillDeliveryNumber(delConDet.getWayBillDeliveryNumber());
							}
						}
						creditCollHM.put(reportModel[index].getWayBillNumber()+"_"+reportModel[index].getWayBillId(), model);
					}
					request.setAttribute("creditCollHM",creditCollHM); 
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
			reportViewModel = new ReportViewModel();
			reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);

			request.setAttribute("ReportViewModel",reportViewModel);
			request.setAttribute("nextPageToken", "success");

		} catch (Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		} finally {
			cManip 					= null;
			wayBillIds				= null;
			consignorColl			= null;
			consigneeColl			= null;
			consignor				= null;
			consignee				= null;
			outValueObject			= null;
			fromDate				= null;
			toDate					= null;
			sdf            			= null;
			reportModel				= null;
			model					= null;
			wayBillIdArray			= null;
			creditCollHM			= null;
		}

	}
}