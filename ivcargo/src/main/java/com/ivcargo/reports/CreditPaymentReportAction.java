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
import com.iv.dto.constant.ReportIdentifierConstant;
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
import com.platform.dto.CustomerDetails;
import com.platform.dto.Executive;
import com.platform.dto.ExecutiveFeildPermissionDTO;
import com.platform.dto.TransportCommonMaster;
import com.platform.dto.configuration.report.collection.CreditPaymentReportConfigurationDTO;
import com.platform.dto.model.BLHPVCreditAmountTxn;
import com.platform.dto.model.CreditWayBillTxn;
import com.platform.dto.model.CreditWayBillTxnCleranceSummary;
import com.platform.resource.CargoErrorList;

public class CreditPaymentReportAction implements Action {

	@Override
	@SuppressWarnings("unchecked")
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	 									error 									= null;
		Map<Long, CreditWayBillTxn> 								reportHM	 							= null;
		CacheManip 					    							cManip 				    				= null;
		SimpleDateFormat 											sdf            							= null;
		Timestamp        											fromDate       							= null;
		Timestamp        											toDate         							= null;
		Set<Long>													executiveIdArray						= null;
		Set<Long> 													creditWayBillIdArray					= null;
		BLHPVCreditAmountTxn[]										blhpvCreditAmountTxns					= null;
		String														collectionPersonIds						= null;
		HashMap<Long, Executive>        							executiveHM								= null;
		CreditWayBillTxn											reportModel								= null;
		String														wayBillIdStr							= null;
		CreditWayBillTxnCleranceSummary								creditWayBillTxnClearanceSum 			= null;
		List<CreditWayBillTxnCleranceSummary>						creditWayBillTxnCleranceSummaryArray	= null;
		Map<Long, CreditWayBillTxnCleranceSummary> 					creditWayBillTxnClearanceSumHM		 	= null;
		List<CreditWayBillTxnCleranceSummary>						creditWayBillTxnCleranceSummaryList  	= null;
		HashMap<Long, CollectionPersonMaster>						collectionPersonHM						= null;
		HashMap<Long, ArrayList<CreditWayBillTxnCleranceSummary>>	collPersonWiseHM						= null;
		TreeMap<String, CreditWayBillTxnCleranceSummary>			finalcollPersonWiseHM					= null;
		ArrayList<CreditWayBillTxnCleranceSummary>					collPersonAL							= null;
		HashMap<Long,CustomerDetails>								consigneeDetailHM						= null;
		HashMap<Long,CustomerDetails>								consignorDetailHM						= null;
		Map<Long, Double>											creditWbTxnIdWiseTDSAmount				= null;
		Map<Long, Set<String>>										panNumberHM								= null;
		String 														panNumbers								= null;
		long 							branchId				= 0;
		short							txnType					= 0;
		double							receivedAmt				= 0;
		double							grandAmt				= 0;
		double							totalReceivedAmt		= 0;
		double							totalGrandAmt			= 0;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			collPersonWiseHM		= new HashMap<>();
			finalcollPersonWiseHM 	= new TreeMap<>();

			new InitializeCreditPaymentReportAction().execute(request, response);

			sdf			= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			fromDate	= new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00").getTime());
			toDate		= new Timestamp(sdf.parse(JSPUtility.GetString(request, "toDate") + " 23:59:59").getTime());
			cManip  	= new CacheManip(request);
			txnType		= JSPUtility.GetShort(request, "txnType", (short)0);
			
			final var executive   = cManip.getExecutive(request);
			final Map<Long, ExecutiveFeildPermissionDTO>	execFldPermissionsHM 	= cManip.getExecutiveFieldPermission(request);
			
			final var 	creditPaymentConfig						= ReadAllConfigurationsBllImpl.getInstance().getOldReportConfigurationData(ReportIdentifierConstant.CREDIT_PAYMENT_REPORT, executive.getAccountGroupId());
			final var	isSearchDataForOwnBranchOnly			= creditPaymentConfig.getBoolean(CreditPaymentReportConfigurationDTO.IS_SEARCH_DATA_FOR_OWN_BRANCH_ONLY, false);
			final var	customErrorOnOtherBranchDetailSearch	= creditPaymentConfig.getBoolean(CreditPaymentReportConfigurationDTO.CUSTOM_ERROR_ON_OTHER_BRANCH_DETAIL_SEARCH, false);
			final var 	isAllowToSearchAllBranchReportData		= execFldPermissionsHM != null && execFldPermissionsHM.containsKey(FeildPermissionsConstant.ALLOW_TO_SEARCH_ALL_BRANCH_REPORT_DATA);
			final var 	locationMappingList    					= cManip.getAssignedLocationsIdListByLocationIdId(request, executive.getBranchId(), executive.getAccountGroupId());
			
			ActionStaticUtil.executiveTypeWiseBranches(request, cManip, executive);

			if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_GROUPADMIN || executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_REGIONADMIN || executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_SUBREGIONADMIN)
				branchId 	= JSPUtility.GetLong(request, "branch", 0);
			else
				branchId 	= executive.getBranchId();

			request.setAttribute("agentName", executive.getName());

			if(txnType == TransportCommonMaster.TXN_TYPE_LR_ID) {
				final ValueObject valueObject = CreditWayBillTxnClearanceSummaryDAO.getInstance().getReceivedCreditRecords(branchId, executive.getAccountGroupId(), fromDate, toDate);

				creditWayBillTxnCleranceSummaryList		= (List<CreditWayBillTxnCleranceSummary>) valueObject.get("creditWayBillTxnCleranceSummaryList");
				creditWayBillTxnClearanceSumHM			= (Map<Long, CreditWayBillTxnCleranceSummary>) valueObject.get("creditWayBillTxnClearanceSumHM");

				if(creditWayBillTxnClearanceSumHM != null && !creditWayBillTxnClearanceSumHM.isEmpty()) {
					if(isSearchDataForOwnBranchOnly && !isAllowToSearchAllBranchReportData){
						creditWayBillTxnCleranceSummaryList	= ListFilterUtility.filterList(creditWayBillTxnCleranceSummaryList, element -> executive.getBranchId() == element.getSourceBranchId()
									|| executive.getBranchId() == element.getDestinationBranchId() || locationMappingList != null && (locationMappingList.contains(element.getSourceBranchId()) || locationMappingList.contains(element.getDestinationBranchId())));

						if (ObjectUtils.isNotEmpty(creditWayBillTxnCleranceSummaryList)) {
				            final List<CreditWayBillTxnCleranceSummary> summaryList = creditWayBillTxnCleranceSummaryList;
				            creditWayBillTxnClearanceSumHM.keySet().removeIf(txnId ->summaryList.stream().noneMatch(summary -> summary.getCreditWayBillTxnId() == txnId));
				        } else {
				            creditWayBillTxnClearanceSumHM.clear();
				        }
					}
				
					if(creditWayBillTxnClearanceSumHM != null && !creditWayBillTxnClearanceSumHM.isEmpty()) {
						creditWayBillTxnCleranceSummaryArray	= new ArrayList<>(creditWayBillTxnClearanceSumHM.values());
						
						if(creditWayBillTxnCleranceSummaryList != null) {
							creditWbTxnIdWiseTDSAmount	= creditWayBillTxnCleranceSummaryList.stream()
									.collect(Collectors.groupingBy(CreditWayBillTxnCleranceSummary::getCreditWayBillTxnId,
											Collectors.reducing(0.0, CreditWayBillTxnCleranceSummary::getTdsAmount, Double::sum)));
							panNumberHM					= creditWayBillTxnCleranceSummaryList.stream().filter(cw -> cw.getPanNumber() != null).collect(Collectors.groupingBy(CreditWayBillTxnCleranceSummary::getCreditWayBillTxnId,
									Collectors.mapping(CreditWayBillTxnCleranceSummary::getPanNumber, Collectors.toSet())));
						}
						
						creditWayBillIdArray 	= creditWayBillTxnCleranceSummaryArray.stream().map(CreditWayBillTxnCleranceSummary::getCreditWayBillTxnId).collect(Collectors.toSet());
						executiveIdArray		= creditWayBillTxnCleranceSummaryArray.stream().map(CreditWayBillTxnCleranceSummary::getReceivedByExecutiveId).collect(Collectors.toSet());
						
						reportHM	 			= CreditWayBillTxnDAO.getInstance().getReceivedCreditRecords(CollectionUtility.getStringFromLongSet(creditWayBillIdArray));
						executiveHM				= ExecutiveDao.getInstance().getExecutiveDetailsByExecutiveIds(CollectionUtility.getStringFromLongSet(executiveIdArray));
						
						wayBillIdStr		= reportHM.values().stream().map(cw -> Long.toString(cw.getWayBillId())).collect(Collectors.joining(","));
						collectionPersonIds	= reportHM.values().stream().filter(cw -> cw.getCollectionPersonId() != 0).map(cw -> Long.toString(cw.getCollectionPersonId())).collect(Collectors.joining(","));
						
						if(!StringUtils.isEmpty(collectionPersonIds))
							collectionPersonHM 	= CollectionPersonMasterDao.getInstance().getCollectionPersonDetailsByIds(collectionPersonIds);
						
						if(!StringUtils.isEmpty(wayBillIdStr)) {
							consigneeDetailHM = CustomerDetailsDao.getInstance().getConsigneeDetailsByWayBillId(wayBillIdStr);
							consignorDetailHM = CustomerDetailsDao.getInstance().getConsignorDetailsByWayBillId(wayBillIdStr);
						}
						
						for (final CreditWayBillTxnCleranceSummary element : creditWayBillTxnCleranceSummaryArray) {
							reportModel = reportHM.get(element.getCreditWayBillTxnId());
							panNumbers	= null;
							
							if(panNumberHM != null) {
								final Set<String> panList	= panNumberHM.get(element.getCreditWayBillTxnId());
								panNumbers	= CollectionUtility.getStringFromStringSet(panList);
							}
							
							element.setSourceBranch(cManip.getGenericBranchDetailCache(request, reportModel.getSourceBranchId()).getName());
							element.setReceivedByExecutiveName(executiveHM.get(element.getReceivedByExecutiveId()).getName());
							element.setReceivedByBranch(cManip.getGenericBranchDetailCache(request,element.getReceivedByBranchId()).getName());
							element.setRemark(element.getRemark() == null ? "--" :element.getRemark());
							element.setChequeNumber(element.getChequeNumber() == null ? "--" :element.getChequeNumber());
							element.setBankName(element.getBankName() == null ? "--" :element.getBankName());
							element.setCreationDateTime(reportModel.getCreationDateTimeStamp());
							element.setPanNumber(panNumbers == null || "".equals(panNumbers) ? "--" : panNumbers);
							
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
									collPersonAL 	= new ArrayList<>();
									collPersonAL.add(element);
									collPersonWiseHM.put(element.getCollectionPersonId(), collPersonAL);
								} else
									collPersonAL.add(element);
							}
							
							if(creditWbTxnIdWiseTDSAmount != null && creditWbTxnIdWiseTDSAmount.get(element.getCreditWayBillTxnId()) != null)
								element.setTdsAmount(creditWbTxnIdWiseTDSAmount.get(element.getCreditWayBillTxnId()));
							else
								element.setTdsAmount(0);
						}
						
						for(final Map.Entry<Long, ArrayList<CreditWayBillTxnCleranceSummary>> entry : collPersonWiseHM.entrySet()) {
							receivedAmt	 = 0;
							grandAmt	 = 0;
							collPersonAL = entry.getValue();
							
							for (final CreditWayBillTxnCleranceSummary element : collPersonAL) {
								receivedAmt		 += element.getReceivedAmount();
								grandAmt 		 += element.getGrandTotal();
							}
							
							totalReceivedAmt += receivedAmt;
							totalGrandAmt	 += grandAmt;
							
							creditWayBillTxnClearanceSum = new CreditWayBillTxnCleranceSummary();
							
							creditWayBillTxnClearanceSum.setReceivedAmount(receivedAmt);
							creditWayBillTxnClearanceSum.setGrandTotal(grandAmt);
							creditWayBillTxnClearanceSum.setCollectionPersonName(collPersonAL.get(0).getCollectionPersonName());
							finalcollPersonWiseHM.put(creditWayBillTxnClearanceSum.getCollectionPersonName() + "_" + entry.getKey(), creditWayBillTxnClearanceSum);
						}
						
						if(finalcollPersonWiseHM.size() > 0) {
							request.setAttribute("finalcollPersonWiseHM", finalcollPersonWiseHM);
							request.setAttribute("totalReceivedAmt", totalReceivedAmt);
							request.setAttribute("totalGrandAmt", totalGrandAmt);
						}
						
						request.setAttribute("CreditWayBillTxn", creditWayBillTxnCleranceSummaryArray.toArray(new CreditWayBillTxnCleranceSummary[creditWayBillTxnCleranceSummaryArray.size()]));
					}else if(customErrorOnOtherBranchDetailSearch){
						error.put("errorCode", CargoErrorList.OTHER_BRANCH_REPORT_DATA_SEARCH_ERROR);
						if(branchId > 0)
							error.put("errorDescription", "Kindly Contact Source Branch For Report");
						else
							error.put("errorDescription", "Kindly Contact Respective Branches For Report");

						request.setAttribute("cargoError", error);
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
			} else if (txnType == TransportCommonMaster.TXN_TYPE_BLHPV_ID) {
				final ValueObject objectOut = BLHPVCreditAmountTxnDAO.getInstance().getReceivedBLHPVCreditRecords(branchId, executive.getAccountGroupId(), fromDate, toDate);

				if(objectOut != null) {

					blhpvCreditAmountTxns = (BLHPVCreditAmountTxn[])objectOut.get("BLHPVCreditAmountTxn");

					blhpvCreditAmountTxns = Arrays.stream(blhpvCreditAmountTxns).filter(report -> executive.getBranchId() == report.getReceivedByBranchId()
							|| (locationMappingList != null && locationMappingList.contains(report.getReceivedByBranchId()))).toArray(BLHPVCreditAmountTxn[]::new);

					if(blhpvCreditAmountTxns != null) {
						for (final BLHPVCreditAmountTxn blhpvCreditAmountTxn : blhpvCreditAmountTxns) {
							if(blhpvCreditAmountTxn.getChequeNumber() == null)
								blhpvCreditAmountTxn.setChequeNumber("--");

							if(blhpvCreditAmountTxn.getBankName() == null)
								blhpvCreditAmountTxn.setBankName("--");

							if(blhpvCreditAmountTxn.getRemark() == null)
								blhpvCreditAmountTxn.setRemark("--");
						}

						request.setAttribute("BLHPVCreditAmountTxn", blhpvCreditAmountTxns);

					} else if(customErrorOnOtherBranchDetailSearch){
						error.put("errorCode", CargoErrorList.OTHER_BRANCH_REPORT_DATA_SEARCH_ERROR);
						if(branchId > 0)
							error.put("errorDescription", "Kindly Contact Source Branch For Report");
						else
							error.put("errorDescription", "Kindly Contact Respective Branches For Report");

						request.setAttribute("cargoError", error);
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
			}

			ActionStaticUtil.setReportViewModel(request);
			request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}
}