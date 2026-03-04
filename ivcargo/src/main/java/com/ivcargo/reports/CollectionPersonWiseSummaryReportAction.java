package com.ivcargo.reports;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.HashMap;
import java.util.SortedMap;
import java.util.StringJoiner;
import java.util.TreeMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.dto.constant.BillClearanceStatusConstant;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.exception.ExceptionProcess;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.CollectionPersonMasterDao;
import com.platform.dao.ExecutiveDao;
import com.platform.dao.reports.CollectionPersonWiseSummaryReportDAO;
import com.platform.dao.reports.CreditWayBillTxnClearanceSummaryDAO;
import com.platform.dto.Branch;
import com.platform.dto.CollectionPersonMaster;
import com.platform.dto.Executive;
import com.platform.dto.SubRegion;
import com.platform.dto.model.CreditWayBillTxn;
import com.platform.dto.model.CreditWayBillTxnCleranceSummary;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

public class CollectionPersonWiseSummaryReportAction implements Action {

	private static final String TRACE_ID = "CollectionPersonWiseSummaryReportAction";
	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	 		error 					= null;
		Executive        				executive   			= null;
		CreditWayBillTxn[] 				reportModel 			= null;
		CacheManip 					    cManip 				    = null;
		SimpleDateFormat 				sdf            			= null;
		Timestamp        				fromDate       			= null;
		Timestamp        				toDate         			= null;
		ValueObject 					objectOut 				= null;
		SubRegion[]               		subRegionForGroup 		= null;
		HashMap<Long, Branch> 			subRegionBranches    	= null;
		Long[] 							collPersonIdArray 		= null;
		Long[] 							creditWBTxnIdArray 		= null;
		String							collPersonIds			= null;
		HashMap<Long, CollectionPersonMaster> collPersonHM		= null;
		String							creditWBTxnIds			= null;
		SortedMap<String, CreditWayBillTxn>				collectionPersonWiseHM			= null;
		CreditWayBillTxnCleranceSummary					creditWayBillTxnClearanceSum 	= null;
		HashMap<Long, CreditWayBillTxnCleranceSummary> 	creditWayBillTxnClearanceSumHM	= null;
		var 							regionId    			= 0L;
		var 							subRegionId    			= 0L;
		var 							branchId				= 0L;
		short							txnType					= 0;
		ValueObject						configrtion 			= null;
		Executive[]						execu					= null;
		var							showExecutiveNameSelection						= false;
		var							executiveId				= 0L;
		String 							whereclause 			= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeCreditPaymentReportAction().execute(request, response);
			sdf			= new SimpleDateFormat("dd-MM-yyyy hh:mm:ss");
			fromDate	= new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00").getTime());
			toDate		= new Timestamp(sdf.parse(JSPUtility.GetString(request, "toDate") + " 23:59:59").getTime());
			cManip  	= new CacheManip(request);
			executive   = cManip.getExecutive(request);
			configrtion = ReadAllConfigurationsBllImpl.getInstance().getOldReportConfigurationData(ReportIdentifierConstant.COLLECTION_PERSON_WISE_SUMMARY_REPORT, executive.getAccountGroupId());
			txnType		= JSPUtility.GetShort(request, "txnType", (short)0);
			showExecutiveNameSelection = Utility.getBoolean(configrtion.get("showExecutiveNameSelection"));

			if (showExecutiveNameSelection)
				executiveId = Long.parseLong(request.getParameter("executiveId"));

			if(txnType > 0){
				if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_GROUPADMIN){
					regionId 	= Long.parseLong(request.getParameter("region"));
					subRegionId = Long.parseLong(request.getParameter("subRegion"));
					branchId 	= Long.parseLong(request.getParameter("branch"));
					// Get Combo values to restore
					subRegionForGroup = cManip.getSubRegionsByRegionId(request, regionId, executive.getAccountGroupId());
					subRegionBranches = cManip.getBranchesBySubRegionId(request,executive.getAccountGroupId(), subRegionId);
					request.setAttribute("subRegionForGroup", subRegionForGroup);
					request.setAttribute("subRegionBranches", subRegionBranches);
				}else if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_REGIONADMIN){
					regionId 	= executive.getRegionId();
					subRegionId = Long.parseLong(request.getParameter("subRegion"));
					branchId 	= Long.parseLong(request.getParameter("branch"));
					// Get Combo values to restore
					subRegionForGroup = cManip.getSubRegionsByRegionId(request, regionId, executive.getAccountGroupId());
					subRegionBranches = cManip.getBranchesBySubRegionId(request,executive.getAccountGroupId(), subRegionId);
					request.setAttribute("subRegionForGroup", subRegionForGroup);
					request.setAttribute("subRegionBranches", subRegionBranches);
				}else if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_SUBREGIONADMIN){
					regionId 	= executive.getRegionId();
					subRegionId = executive.getSubRegionId();
					branchId 	= Long.parseLong(request.getParameter("branch"));
					// Get Combo values to restore
					subRegionBranches = cManip.getBranchesBySubRegionId(request,executive.getAccountGroupId(), subRegionId);
					request.setAttribute("subRegionBranches", subRegionBranches);
				}else{
					regionId 	= executive.getRegionId();
					subRegionId = executive.getSubRegionId();
					branchId 	= executive.getBranchId();
				}

				if(showExecutiveNameSelection) {
					execu 		= ExecutiveDao.getInstance().getActiveExecutiveByBranchId(branchId);
					request.setAttribute("execs", execu);
				}

				whereclause = getWhereClause(executive.getAccountGroupId(), branchId, txnType, fromDate, toDate, executiveId, showExecutiveNameSelection);

				objectOut = CollectionPersonWiseSummaryReportDAO.getInstance().getCollectionPersonData(whereclause);

				if(objectOut != null) {
					reportModel 		= (CreditWayBillTxn[])objectOut.get("reportModelArr");
					collPersonIdArray 	= (Long[]) objectOut.get("collPersonIdArray");
					creditWBTxnIdArray 	= (Long[]) objectOut.get("creditWBTxnIdArray");

					if (reportModel != null) {

						creditWBTxnIds = Utility.GetLongArrayToString(creditWBTxnIdArray);
						creditWayBillTxnClearanceSumHM	= CreditWayBillTxnClearanceSummaryDAO.getInstance().getCreditWayBillTxnSummaryByCreditWayBillTxnIds(creditWBTxnIds);

						collPersonIds = Utility.GetLongArrayToString(collPersonIdArray);
						collPersonHM  = CollectionPersonMasterDao.getInstance().getCollectionPersonDetailsByIds(collPersonIds);
						collectionPersonWiseHM = new TreeMap<>();

						for (final CreditWayBillTxn element : reportModel) {
							if(creditWayBillTxnClearanceSumHM != null && creditWayBillTxnClearanceSumHM.size() > 0)
								creditWayBillTxnClearanceSum = creditWayBillTxnClearanceSumHM.get(element.getCreditWayBillTxnId());

							element.setCollectionPersonName(collPersonHM.get(element.getCollectionPersonId()).getName());

							var model = collectionPersonWiseHM.get(element.getCollectionPersonName()+"_"+element.getCollectionPersonId());

							if(model == null){
								model = new CreditWayBillTxn();
								model.setCollectionPersonId(element.getCollectionPersonId());
								model.setCollectionPersonName(element.getCollectionPersonName());
								model.setGrandTotal(element.getGrandTotal());

								if(element.getPaymentStatus() == BillClearanceStatusConstant.BILL_CLEARANCE_STATUS_DUE_PAYMENT_ID)
									model.setPendingAmount(element.getGrandTotal());
								else if(element.getPaymentStatus() == BillClearanceStatusConstant.BILL_CLEARANCE_STATUS_CLEAR_PAYMENT_ID)
									model.setReceivedAmount(creditWayBillTxnClearanceSum != null ? creditWayBillTxnClearanceSum.getReceivedAmount() : 0);
								else if(element.getPaymentStatus() == BillClearanceStatusConstant.BILL_CLEARANCE_STATUS_NEGOTIATED_ID){
									model.setNegotiatedAmount(element.getGrandTotal() - (creditWayBillTxnClearanceSum != null ? creditWayBillTxnClearanceSum.getReceivedAmount() : 0));
									model.setReceivedAmount(creditWayBillTxnClearanceSum != null ? creditWayBillTxnClearanceSum.getReceivedAmount() : 0);
								} else if(element.getPaymentStatus() == BillClearanceStatusConstant.BILL_CLEARANCE_STATUS_PARTIAL_PAYMENT_ID){
									model.setReceivedAmount(creditWayBillTxnClearanceSum != null ? creditWayBillTxnClearanceSum.getReceivedAmount() : 0);
									model.setPendingAmount(element.getGrandTotal() - (creditWayBillTxnClearanceSum != null ? creditWayBillTxnClearanceSum.getReceivedAmount() : 0));
								}

								model.setBranchId(element.getBranchId());
								collectionPersonWiseHM.put(element.getCollectionPersonName()+"_"+element.getCollectionPersonId(), model);
							} else {
								model.setGrandTotal(model.getGrandTotal() + element.getGrandTotal());

								if(element.getPaymentStatus() == BillClearanceStatusConstant.BILL_CLEARANCE_STATUS_DUE_PAYMENT_ID)
									model.setPendingAmount(model.getPendingAmount() +  element.getGrandTotal());
								else if(element.getPaymentStatus() == BillClearanceStatusConstant.BILL_CLEARANCE_STATUS_CLEAR_PAYMENT_ID)
									model.setReceivedAmount(model.getReceivedAmount() + (creditWayBillTxnClearanceSum != null ? creditWayBillTxnClearanceSum.getReceivedAmount() : 0));
								else if(element.getPaymentStatus() == BillClearanceStatusConstant.BILL_CLEARANCE_STATUS_NEGOTIATED_ID){
									model.setNegotiatedAmount(model.getNegotiatedAmount() + (element.getGrandTotal() - (creditWayBillTxnClearanceSum != null ? creditWayBillTxnClearanceSum.getReceivedAmount() : 0)));
									model.setReceivedAmount(model.getReceivedAmount()+ (creditWayBillTxnClearanceSum != null ? creditWayBillTxnClearanceSum.getReceivedAmount() : 0));
								} else if(element.getPaymentStatus() == BillClearanceStatusConstant.BILL_CLEARANCE_STATUS_PARTIAL_PAYMENT_ID){
									model.setReceivedAmount(model.getReceivedAmount() +	(creditWayBillTxnClearanceSum != null ? creditWayBillTxnClearanceSum.getReceivedAmount() : 0));
									model.setPendingAmount(model.getPendingAmount() + (element.getGrandTotal() - (creditWayBillTxnClearanceSum != null ? creditWayBillTxnClearanceSum.getReceivedAmount() : 0)));
								}
							}
						}

						request.setAttribute("collectionPersonWiseHM", collectionPersonWiseHM);
						request.setAttribute("showNegotiatedAmount", Utility.getBoolean(configrtion.get("showNegotiatedAmount")));
						request.setAttribute("showExecutiveNameSelection", Utility.getBoolean(configrtion.get("showExecutiveNameSelection")));
					} else {
						request.setAttribute("showNegotiatedAmount", Utility.getBoolean(configrtion.get("showNegotiatedAmount")));
						request.setAttribute("showExecutiveNameSelection", Utility.getBoolean(configrtion.get("showExecutiveNameSelection")));
						error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
						error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
						request.setAttribute("cargoError", error);
					}
				} else {
					error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
					error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
					request.setAttribute("cargoError", error);
				}
			} else {
				error.put("errorCode", CargoErrorList.REPORT_TYPE_MISSING);
				error.put("errorDescription", CargoErrorList.REPORT_TYPE_MISSING_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}

			ActionStaticUtil.setReportViewModel(request);
			request.setAttribute("nextPageToken", "success");
			request.setAttribute("showNegotiatedAmount", Utility.getBoolean(configrtion.get("showNegotiatedAmount")));
			request.setAttribute("showExecutiveNameSelection", Utility.getBoolean(configrtion.get("showExecutiveNameSelection")));
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}
	}

	private String getWhereClause(final long accountGroupId, final long branchId, final short txnType, final Timestamp fromDate,
			final Timestamp toDate, final long executiveId, final boolean showExecutiveNameSelection) throws Exception {
		StringJoiner whereClause = null;

		try {
			whereClause = new StringJoiner(" ");

			whereClause.add("cwbt.AccountGroupId = " + accountGroupId);
			whereClause.add("AND cwbt.CreationDateTimeStamp >= '" + fromDate + "'");
			whereClause.add("AND cwbt.CreationDateTimeStamp <= '" + toDate + "'");
			whereClause.add("AND cwbt.CollectionPersonId > 0");

			if(branchId > 0)
				whereClause.add("AND cwbt.BranchId = " + branchId);

			if(txnType > 0)
				whereClause.add("AND cwbt.TxnTypeId = " + txnType);

			if(showExecutiveNameSelection && executiveId > 0)
				whereClause.add("AND cwbt.ExecutiveId = " + executiveId);

			return whereClause.toString();
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

}