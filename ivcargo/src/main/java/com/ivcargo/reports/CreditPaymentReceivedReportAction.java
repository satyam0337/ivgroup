package com.ivcargo.reports;
import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.ObjectUtils;
import org.apache.commons.lang3.StringUtils;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.dto.constant.FeildPermissionsConstant;
import com.iv.dto.constant.PaymentTypeConstant;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.utility.CollectionUtility;
import com.iv.utils.utility.ListFilterUtility;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.CollectionPersonMasterDao;
import com.platform.dao.CustomerDetailsDao;
import com.platform.dao.ExecutiveDao;
import com.platform.dao.reports.BLHPVCreditAmountTxnDAO;
import com.platform.dao.reports.CreditWayBillTxnClearanceSummaryDAO;
import com.platform.dao.reports.CreditWayBillTxnDAO;
import com.platform.dto.CollectionPersonMaster;
import com.platform.dto.CustomGroupMapper;
import com.platform.dto.CustomerDetails;
import com.platform.dto.Executive;
import com.platform.dto.TransportCommonMaster;
import com.platform.dto.configuration.report.collection.CreditPaymentReportConfigurationDTO;
import com.platform.dto.constant.BillClearanceStatusConstant;
import com.platform.dto.model.BLHPVCreditAmountTxn;
import com.platform.dto.model.CreditWayBillTxn;
import com.platform.dto.model.CreditWayBillTxnCleranceSummary;
import com.platform.dto.model.ReportViewModel;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

public class CreditPaymentReceivedReportAction implements Action {

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	 		error 					= null;
//		Executive        				executive   			= null;
		Map<Long, CreditWayBillTxn> 	reportHM	 			= null;
		CacheManip 					    cManip 				    = null;
		ReportViewModel 				reportViewModel 		= null;
		SimpleDateFormat 				sdf            			= null;
		Timestamp        				fromDate       			= null;
		Timestamp        				toDate         			= null;
		ValueObject 					objectOut 				= null;
		Set<Long> 							executiveIdArray		= null;
		Set<Long>							creditWayBillIdArray	= null;
		BLHPVCreditAmountTxn[]			blhpvCreditAmountTxns	= null;
		String							collectionPersonIds		= null;
		HashMap<Long, Executive>        executiveHM				= null;
		CreditWayBillTxn				reportModel				= null;
		String								wayBillIdStr		= null;
		CreditWayBillTxnCleranceSummary		creditWayBillTxnClearanceSum 			= null;
		List<CreditWayBillTxnCleranceSummary> 	creditWayBillTxnCleranceSummaryArray	= null;
		HashMap<Long, CollectionPersonMaster>	collectionPersonHM	= null;
		Map<Long, List<CreditWayBillTxnCleranceSummary>>			collPersonWiseHM		= null;
		TreeMap<String, CreditWayBillTxnCleranceSummary>			finalcollPersonWiseHM	= null;
		List<CreditWayBillTxnCleranceSummary>						collPersonAL			= null;
		HashMap<Long,CustomerDetails>								consigneeDetailHM		= null;
		HashMap<Long,CustomerDetails>								consignorDetailHM		= null;
		long 							branchId				= 0;
		short							txnType					= 0;
		double							receivedAmt			= 0;
		double							grandAmt			= 0;
		double							totalReceivedAmt	= 0;
		double							totalGrandAmt		= 0;
		HashMap<Short, Double> 			paymentTypeWiseAmtHM			= null;
		HashMap<Short, Double> 			blhpvAmtPaymentTypeWiseAmtHM	= null;
		short							billSelectionId		= 0;

		try {

			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			collPersonWiseHM				= new HashMap<Long, List<CreditWayBillTxnCleranceSummary>>();
			finalcollPersonWiseHM 			= new TreeMap<String, CreditWayBillTxnCleranceSummary>();
			paymentTypeWiseAmtHM			= new HashMap<Short, Double>();
			blhpvAmtPaymentTypeWiseAmtHM	= new HashMap<Short, Double>();

			new InitializeCreditPaymentReportAction().execute(request, response);

			sdf			= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			fromDate	= new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00").getTime());
			toDate		= new Timestamp(sdf.parse(JSPUtility.GetString(request, "toDate") + " 23:59:59").getTime());
			cManip  	= new CacheManip(request);
//			executive   = cManip.getExecutive(request);
			txnType		= JSPUtility.GetShort(request, "txnType", (short)0);
			billSelectionId = JSPUtility.GetShort(request, "billSelectionId",(short)0);

			final var executive   							= cManip.getExecutive(request);
			final var creditPaymentConfig					= ReadAllConfigurationsBllImpl.getInstance().getOldReportConfigurationData(ReportIdentifierConstant.CREDIT_PAYMENT_REPORT, executive.getAccountGroupId());
			final var isSearchDataForOwnBranchOnly			= creditPaymentConfig.getBoolean(CreditPaymentReportConfigurationDTO.IS_SEARCH_DATA_FOR_OWN_BRANCH_ONLY, false);
			final var customErrorOnOtherBranchDetailSearch	= creditPaymentConfig.getBoolean(CreditPaymentReportConfigurationDTO.CUSTOM_ERROR_ON_OTHER_BRANCH_DETAIL_SEARCH, false);
			final Map<?, ?>	execFldPermissionsHM 			= cManip.getExecutiveFieldPermission(request);
			final var isAllowToSearchAllBranchReportData	= execFldPermissionsHM != null && execFldPermissionsHM.containsKey(FeildPermissionsConstant.ALLOW_TO_SEARCH_ALL_BRANCH_REPORT_DATA);
			final var locationMappingList    				= cManip.getAssignedLocationsIdListByLocationIdId(request, executive.getBranchId(), executive.getAccountGroupId());
			
			ActionStaticUtil.executiveTypeWiseBranches(request, cManip, executive);

			if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_GROUPADMIN || executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_REGIONADMIN || executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_SUBREGIONADMIN)
				branchId 	= JSPUtility.GetLong(request, "branch", 0);
			else
				branchId 	= executive.getBranchId();

			request.setAttribute("agentName", executive.getName());

			if(txnType == TransportCommonMaster.TXN_TYPE_LR_ID) {
				creditWayBillTxnCleranceSummaryArray = CreditWayBillTxnClearanceSummaryDAO.getInstance().getReceivedCreditPaymentRecords(branchId, executive.getAccountGroupId(), fromDate, toDate,billSelectionId);
				
				if(creditWayBillTxnCleranceSummaryArray != null && !creditWayBillTxnCleranceSummaryArray.isEmpty()) {
					if(isSearchDataForOwnBranchOnly && !isAllowToSearchAllBranchReportData){
						creditWayBillTxnCleranceSummaryArray = ListFilterUtility.filterList(creditWayBillTxnCleranceSummaryArray, element -> executive.getBranchId() == element.getBranchId()
								|| executive.getBranchId() == element.getReceivedByBranchId() || locationMappingList != null && (locationMappingList.contains(element.getBranchId()) || locationMappingList.contains(element.getReceivedByBranchId())));
					}
					
					if(!ObjectUtils.isEmpty(creditWayBillTxnCleranceSummaryArray)){
						creditWayBillIdArray	= creditWayBillTxnCleranceSummaryArray.stream().map(CreditWayBillTxnCleranceSummary::getCreditWayBillTxnId).collect(Collectors.toSet());
						executiveIdArray		= creditWayBillTxnCleranceSummaryArray.stream().map(CreditWayBillTxnCleranceSummary::getReceivedByExecutiveId).collect(Collectors.toSet());
	
						reportHM 			= CreditWayBillTxnDAO.getInstance().getReceivedCreditRecords(CollectionUtility.getStringFromLongSet(creditWayBillIdArray));
	
						wayBillIdStr		= reportHM.values().stream().map(cw -> Long.toString(cw.getWayBillId())).collect(Collectors.joining(","));
						collectionPersonIds	= reportHM.values().stream().filter(cw -> cw.getCollectionPersonId() != 0).map(cw -> Long.toString(cw.getCollectionPersonId())).collect(Collectors.joining(","));
	
						executiveHM			= ExecutiveDao.getInstance().getExecutiveDetailsByExecutiveIds(CollectionUtility.getStringFromLongSet(executiveIdArray));
	
						if(!StringUtils.isEmpty(collectionPersonIds))
							collectionPersonHM 	= CollectionPersonMasterDao.getInstance().getCollectionPersonDetailsByIds(collectionPersonIds);
	
						if(!StringUtils.isEmpty(wayBillIdStr)) {
							consigneeDetailHM = CustomerDetailsDao.getInstance().getConsigneeDetailsByWayBillId(wayBillIdStr);
							consignorDetailHM = CustomerDetailsDao.getInstance().getConsignorDetailsByWayBillId(wayBillIdStr);
						}
	
						for (final CreditWayBillTxnCleranceSummary element : creditWayBillTxnCleranceSummaryArray) {
							reportModel = reportHM.get(element.getCreditWayBillTxnId());
	
							element.setSourceBranch(cManip.getGenericBranchDetailCache(request, reportModel.getSourceBranchId()).getName());
							element.setReceivedByExecutiveName(executiveHM.get(element.getReceivedByExecutiveId()).getName());
							element.setReceivedByBranch(cManip.getGenericBranchDetailCache(request,element.getReceivedByBranchId()).getName());
							element.setRemark(Utility.checkedNullCondition(element.getRemark(), (short) 1));
							element.setChequeNumber(Utility.checkedNullCondition(element.getChequeNumber(), (short) 1));
							element.setBankName(Utility.checkedNullCondition(element.getBankName(), (short) 1));
	
							if(element.getPaymentStatus() > 0)
								element.setPaymentStatusName(BillClearanceStatusConstant.getBillClearanceStatus(element.getPaymentStatus()));
	
							element.setCreationDateTime(reportModel.getCreationDateTimeStamp());
							element.setBookingDateTime(reportModel.getBookingDateTime());
							if(reportModel.getWayBillDispatchDateTime() != null)
								element.setDispatchDateTimeStr(DateTimeUtility.getDateFromTimeStamp(reportModel.getWayBillDispatchDateTime()));
							else
								element.setDispatchDateTimeStr("--");
	
							if(reportModel.getCollectionPersonId() != 0) {
								element.setCollectionPersonId(reportModel.getCollectionPersonId());
	
								if(collectionPersonHM.get(reportModel.getCollectionPersonId()) != null)
									element.setCollectionPersonName(collectionPersonHM.get(reportModel.getCollectionPersonId()).getName());
							} else
								element.setCollectionPersonName("--");
	
							if(consigneeDetailHM.get(element.getWayBillId()) != null) {
								element.setConsigneeName(consigneeDetailHM.get(element.getWayBillId()).getName());
								element.setConsigneeId(consigneeDetailHM.get(element.getWayBillId()).getCustomerDetailsId());
							}
	
							if(consignorDetailHM.get(element.getWayBillId()) != null) {
								element.setConsignorName(consignorDetailHM.get(element.getWayBillId()).getName());
								element.setConsignorId(consignorDetailHM.get(element.getWayBillId()).getCustomerDetailsId());
							}
	
							if(element.getCollectionPersonId() != 0) {
								collPersonAL = collPersonWiseHM.get(element.getCollectionPersonId());
	
								if(collPersonAL == null) {
									collPersonAL 	= new ArrayList<CreditWayBillTxnCleranceSummary>();
									collPersonAL.add(element);
									collPersonWiseHM.put(element.getCollectionPersonId(), collPersonAL);
								} else
									collPersonAL.add(element);
							}
	
							if(paymentTypeWiseAmtHM.get(element.getPaymentType()) == null)
								paymentTypeWiseAmtHM.put(element.getPaymentType(), element.getReceivedAmount());
							else
								paymentTypeWiseAmtHM.put(element.getPaymentType(), paymentTypeWiseAmtHM.get(element.getPaymentType()) + element.getReceivedAmount());
	
	
							if(element.getPaymentStatus() == PaymentTypeConstant.PAYMENT_TYPE_STATUS_NEGOTIATED_ID)
								element.setDiscountAmount(element.getGrandTotal()-element.getTotalReceivedAmount());
							else
								element.setDiscountAmount(0);
	
						}
	
						for(final Map.Entry<Long, List<CreditWayBillTxnCleranceSummary>> entry : collPersonWiseHM.entrySet()) {
							receivedAmt	 = 0;
							grandAmt	 = 0;
							collPersonAL = entry.getValue();
	
							receivedAmt	= collPersonAL.stream().map(CreditWayBillTxnCleranceSummary::getReceivedAmount).mapToDouble(Double::doubleValue).sum();
							grandAmt	= collPersonAL.stream().map(CreditWayBillTxnCleranceSummary::getGrandTotal).mapToDouble(Double::doubleValue).sum();
	
							totalReceivedAmt += receivedAmt;
							totalGrandAmt	 += grandAmt;
	
							creditWayBillTxnClearanceSum = new CreditWayBillTxnCleranceSummary();
	
							creditWayBillTxnClearanceSum.setReceivedAmount(receivedAmt);
							creditWayBillTxnClearanceSum.setGrandTotal(grandAmt);
							creditWayBillTxnClearanceSum.setCollectionPersonName(collPersonAL.get(0).getCollectionPersonName());
							finalcollPersonWiseHM.put(creditWayBillTxnClearanceSum.getCollectionPersonName() + "_" + entry.getKey(), creditWayBillTxnClearanceSum);
						}
	
						if(finalcollPersonWiseHM.size() > 0){
							request.setAttribute("finalcollPersonWiseHM", finalcollPersonWiseHM);
							request.setAttribute("totalReceivedAmt", totalReceivedAmt);
							request.setAttribute("totalGrandAmt", totalGrandAmt);
	
						}
						request.setAttribute("CreditWayBillTxn", creditWayBillTxnCleranceSummaryArray.toArray(new CreditWayBillTxnCleranceSummary[creditWayBillTxnCleranceSummaryArray.size()]));
						request.setAttribute("paymentTypeWiseAmtHM", paymentTypeWiseAmtHM);
					} else {
						if (customErrorOnOtherBranchDetailSearch) {
							error.put("errorCode", CargoErrorList.OTHER_BRANCH_REPORT_DATA_SEARCH_ERROR);
							if (branchId > 0)
								error.put("errorDescription", "Kindly Contact Source Branch For Report");
							else
								error.put("errorDescription", "Kindly Contact Respective Branches For Report");

							request.setAttribute("cargoError", error);
						} else {
							error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
							error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
							request.setAttribute("cargoError", error);
						}
					}
				}else{
						error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
						error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
						request.setAttribute("cargoError", error);						
					}

			} else if (txnType == TransportCommonMaster.TXN_TYPE_BLHPV_ID) {

				objectOut = BLHPVCreditAmountTxnDAO.getInstance().getReceivedBLHPVCreditRecords(branchId, executive.getAccountGroupId(), fromDate, toDate);

				if(objectOut != null) {

					blhpvCreditAmountTxns = (BLHPVCreditAmountTxn[])objectOut.get("BLHPVCreditAmountTxn");

					if(!ObjectUtils.isEmpty(blhpvCreditAmountTxns) && isSearchDataForOwnBranchOnly && !isAllowToSearchAllBranchReportData){
						blhpvCreditAmountTxns = Arrays.stream(blhpvCreditAmountTxns).filter(report -> executive.getBranchId() == report.getReceivedByBranchId()
								|| (locationMappingList != null && (locationMappingList.contains(report.getReceivedByBranchId())))).toArray(BLHPVCreditAmountTxn[]::new);
					}					
					
					if(!ObjectUtils.isEmpty(blhpvCreditAmountTxns)){
						for (final BLHPVCreditAmountTxn blhpvCreditAmountTxn : blhpvCreditAmountTxns) {

							blhpvCreditAmountTxn.setChequeNumber(Utility.checkedNullCondition(blhpvCreditAmountTxn.getChequeNumber(), (short) 1));
							blhpvCreditAmountTxn.setBankName(Utility.checkedNullCondition(blhpvCreditAmountTxn.getBankName(), (short) 1));
							blhpvCreditAmountTxn.setRemark(Utility.checkedNullCondition(blhpvCreditAmountTxn.getRemark(), (short) 1));

							if(blhpvAmtPaymentTypeWiseAmtHM.get(blhpvCreditAmountTxn.getPaymentType()) == null)
								blhpvAmtPaymentTypeWiseAmtHM.put(blhpvCreditAmountTxn.getPaymentType(), blhpvCreditAmountTxn.getSettledAmount());
							else
								blhpvAmtPaymentTypeWiseAmtHM.put(blhpvCreditAmountTxn.getPaymentType(), blhpvAmtPaymentTypeWiseAmtHM.get(blhpvCreditAmountTxn.getPaymentType()) + blhpvCreditAmountTxn.getSettledAmount());
						}

						request.setAttribute("BLHPVCreditAmountTxn", blhpvCreditAmountTxns);
						request.setAttribute("blhpvAmtPaymentTypeWiseAmtHM", blhpvAmtPaymentTypeWiseAmtHM);

					} else {
						if(customErrorOnOtherBranchDetailSearch){
							error.put("errorCode", CargoErrorList.OTHER_BRANCH_REPORT_DATA_SEARCH_ERROR);
							if(branchId > 0)
								error.put("errorDescription", "Kindly Contact Source Branch For Report");
							else
								error.put("errorDescription", "Kindly Contact Respective Branches For Report");

							request.setAttribute("cargoError", error);
						}else{
							error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
							error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
							request.setAttribute("cargoError", error);						
						}
					}

				} else {
					error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
					error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
					request.setAttribute("cargoError", error);
				}
			}
			ActionStaticUtil.setRequestAttribute(request,"customAddressBranchId", branchId);
			ActionStaticUtil.setRequestAttribute(request,"customAddressIdentifer", CustomGroupMapper.IDENTIFIER_BOOKING);
			reportViewModel = new ReportViewModel();
			reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);
			request.setAttribute("ReportViewModel",reportViewModel);

			request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}
}
