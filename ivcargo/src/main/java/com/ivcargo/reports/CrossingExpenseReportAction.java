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
import com.platform.dao.ConsignmentSummaryDao;
import com.platform.dao.CrossingExpenseReportDao;
import com.platform.dao.WayBillDao;
import com.platform.dto.Branch;
import com.platform.dto.ConsignmentSummary;
import com.platform.dto.Executive;
import com.platform.dto.SubRegion;
import com.platform.dto.TransportCommonMaster;
import com.platform.dto.WayBill;
import com.platform.dto.WayBillType;
import com.platform.dto.model.CrossingExpense;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

public class CrossingExpenseReportAction implements Action {

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	 			error 					= null;
		Executive        					executive   			= null;
		CrossingExpense[] 					reportModel 			= null;
		Long[] 								wayBillIdArray			= null;
		CacheManip 							cacheManip 				= null;
		SimpleDateFormat 					sdf            			= null;
		Timestamp        					fromDate       			= null;
		Timestamp        					toDate         			= null;
		ValueObject 						objectOut 				= null;
		HashMap<Long, ConsignmentSummary> 	conSumColl 				= null;
		HashMap<Long, WayBill> 				lrColl  				= null;
		String								wayBillStr				= null;
		CrossingExpense						crossingExpense			= null;
		SubRegion 							subregion  				= null;
		Branch								commonBranch		 	= null;
		String								branchIds				= null;
		SortedMap<String,CrossingExpense>	srcSubRegionWiseSummary = null;
		SortedMap<String,CrossingExpense>	branchWiseSummary 		= null;
		SortedMap<String,SortedMap<String,CrossingExpense>>	detailSubRegionWiseSummary = null;
		long								reportType				= 0;
		double								topayAmt				= 0.00;
		final long								totalNoOfLR 			= 1;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeCrossingExpenseReportReportAction().execute(request, response);

			sdf			= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			fromDate	= new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00").getTime());
			toDate		= new Timestamp(sdf.parse(JSPUtility.GetString(request, "toDate") + " 23:59:59").getTime());

			cacheManip  = new CacheManip(request);
			executive   = cacheManip.getExecutive(request);
			reportType  = Long.parseLong(request.getParameter("reportType"));

			if(reportType > 0){
				ActionStaticUtil.executiveTypeWiseBranches(request, cacheManip, executive);

				branchIds		= ActionStaticUtil.getBranchIds(request, cacheManip, executive);

				if(reportType == TransportCommonMaster.INCOMING_ID)
					objectOut = CrossingExpenseReportDao.getInstance().getWayBillCrossingDetailsBySourceBranchIds(executive.getAccountGroupId(), branchIds, fromDate, toDate);
				else if(reportType == TransportCommonMaster.OUTGOING_ID)
					objectOut = CrossingExpenseReportDao.getInstance().getWayBillCrossingDetails(executive.getAccountGroupId(), branchIds, fromDate, toDate);

				if(objectOut != null) {

					reportModel 	= (CrossingExpense[])objectOut.get("wayBillCrossingArr");
					wayBillIdArray 	= (Long[]) objectOut.get("WayBillIdArray");

					wayBillStr 		= Utility.GetLongArrayToString(wayBillIdArray);

					lrColl			= WayBillDao.getInstance().getLimitedLRDetails(wayBillStr);
					conSumColl 		= ConsignmentSummaryDao.getInstance().getConsignmentSummaryWeightsByWayBillIds(wayBillStr);

					srcSubRegionWiseSummary = new TreeMap<String, CrossingExpense>();

					if (reportModel != null && wayBillIdArray != null) {

						for (final CrossingExpense element : reportModel) {

							topayAmt = 0;
							if(reportType == TransportCommonMaster.INCOMING_ID)
								commonBranch = cacheManip.getBranchById(request,executive.getAccountGroupId(), element.getCrossingBranchId());
							else if(reportType == TransportCommonMaster.OUTGOING_ID)
								commonBranch = cacheManip.getBranchById(request,executive.getAccountGroupId(), element.getSourceBranchId());

							subregion	= cacheManip.getGenericSubRegionById(request, commonBranch.getSubRegionId());

							element.setSourceBranch(commonBranch.getName());
							element.setSourceBranchId(commonBranch.getBranchId());
							element.setSubRegionId(subregion.getSubRegionId());
							element.setSubRegionName(subregion.getName());
							element.setWayBillTypeId(lrColl.get(element.getWayBillId()).getWayBillTypeId());
							element.setWayBillType(lrColl.get(element.getWayBillId()).getWayBillType());
							element.setActualWeight(conSumColl.get(element.getWayBillId()).getActualWeight());
							element.setPackageQuantity(conSumColl.get(element.getWayBillId()).getQuantity());
							element.setGrandTotal(lrColl.get(element.getWayBillId()).getGrandTotal());
							element.setTaxAmount(lrColl.get(element.getWayBillId()).getBookingTimeServiceTax());
							if(element.getWayBillTypeId() == WayBillType.WAYBILL_TYPE_TO_PAY)
								topayAmt = element.getGrandTotal();

							crossingExpense	= srcSubRegionWiseSummary.get(element.getSubRegionName()+"_"+element.getSubRegionId());
							if(crossingExpense == null){
								crossingExpense	= new CrossingExpense();
								crossingExpense.setCrossingHire(element.getCrossingHire());
								crossingExpense.setTopayAmount(topayAmt);
								crossingExpense.setRecoveryAmount(topayAmt - element.getCrossingHire());
								crossingExpense.setActualWeight(element.getActualWeight());
								crossingExpense.setPackageQuantity(element.getPackageQuantity());
								crossingExpense.setSubRegionId(element.getSubRegionId());
								crossingExpense.setSubRegionName(element.getSubRegionName());
								crossingExpense.setTaxAmount(element.getTaxAmount());
								crossingExpense.setTotalNoOfLR(totalNoOfLR);
								crossingExpense.setNetLoading(element.getNetLoading());
								crossingExpense.setNetUnloading(element.getNetUnloading());

								srcSubRegionWiseSummary.put(element.getSubRegionName()+"_"+element.getSubRegionId(), crossingExpense);
							} else {
								crossingExpense.setTopayAmount(crossingExpense.getTopayAmount() + topayAmt);
								crossingExpense.setCrossingHire(crossingExpense.getCrossingHire() + element.getCrossingHire());
								crossingExpense.setRecoveryAmount(crossingExpense.getRecoveryAmount() + (topayAmt - element.getCrossingHire()));
								crossingExpense.setActualWeight(crossingExpense.getActualWeight() + element.getActualWeight());
								crossingExpense.setPackageQuantity(crossingExpense.getPackageQuantity() + element.getPackageQuantity());
								crossingExpense.setTaxAmount(crossingExpense.getTaxAmount() + element.getTaxAmount());
								crossingExpense.setTotalNoOfLR(crossingExpense.getTotalNoOfLR() + 1);
								crossingExpense.setNetLoading(crossingExpense.getNetLoading() +	element.getNetLoading());
								crossingExpense.setNetUnloading(crossingExpense.getNetUnloading() + element.getNetUnloading());

							}

						}
						detailSubRegionWiseSummary = new TreeMap<String, SortedMap<String,CrossingExpense>>();

						for (final CrossingExpense element : reportModel) {

							topayAmt = 0;
							if(element.getWayBillTypeId() == WayBillType.WAYBILL_TYPE_TO_PAY)
								topayAmt = element.getGrandTotal();

							branchWiseSummary = detailSubRegionWiseSummary.get(element.getSubRegionName()+"_"+element.getSubRegionId());
							if(branchWiseSummary == null){
								branchWiseSummary = new TreeMap<String, CrossingExpense>();
								crossingExpense   = new CrossingExpense();

								crossingExpense.setCrossingHire(element.getCrossingHire());
								crossingExpense.setTopayAmount(topayAmt);
								crossingExpense.setRecoveryAmount(topayAmt - element.getCrossingHire());
								crossingExpense.setActualWeight(element.getActualWeight());
								crossingExpense.setPackageQuantity(element.getPackageQuantity());
								crossingExpense.setSubRegionId(element.getSubRegionId());
								crossingExpense.setSubRegionName(element.getSubRegionName());
								crossingExpense.setTaxAmount(element.getTaxAmount());
								crossingExpense.setTotalNoOfLR(totalNoOfLR);
								crossingExpense.setNetLoading(element.getNetLoading());
								crossingExpense.setNetUnloading(element.getNetUnloading());

								branchWiseSummary.put(element.getSourceBranch()+"_"+element.getSourceBranchId(), crossingExpense);
								detailSubRegionWiseSummary.put(element.getSubRegionName()+"_"+element.getSubRegionId(), branchWiseSummary);

							} else {

								crossingExpense = branchWiseSummary.get(element.getSourceBranch()+"_"+element.getSourceBranchId());
								if(crossingExpense == null){

									crossingExpense   = new CrossingExpense();
									crossingExpense.setCrossingHire(element.getCrossingHire());
									crossingExpense.setTopayAmount(topayAmt);
									crossingExpense.setRecoveryAmount(topayAmt - element.getCrossingHire());
									crossingExpense.setActualWeight(element.getActualWeight());
									crossingExpense.setPackageQuantity(element.getPackageQuantity());
									crossingExpense.setSubRegionId(element.getSubRegionId());
									crossingExpense.setSubRegionName(element.getSubRegionName());
									crossingExpense.setTaxAmount(element.getTaxAmount());
									crossingExpense.setTotalNoOfLR(totalNoOfLR);
									crossingExpense.setNetLoading(element.getNetLoading());
									crossingExpense.setNetUnloading(element.getNetUnloading());

									branchWiseSummary.put(element.getSourceBranch()+"_"+element.getSourceBranchId(), crossingExpense);

								} else {
									crossingExpense.setTopayAmount(crossingExpense.getTopayAmount() + topayAmt);
									crossingExpense.setCrossingHire(crossingExpense.getCrossingHire() + element.getCrossingHire());
									crossingExpense.setRecoveryAmount(crossingExpense.getRecoveryAmount() + (topayAmt - element.getCrossingHire()));
									crossingExpense.setActualWeight(crossingExpense.getActualWeight() + element.getActualWeight());
									crossingExpense.setPackageQuantity(crossingExpense.getPackageQuantity() + element.getPackageQuantity());
									crossingExpense.setTaxAmount(crossingExpense.getTaxAmount() + element.getTaxAmount());
									crossingExpense.setTotalNoOfLR(crossingExpense.getTotalNoOfLR() + 1);
									crossingExpense.setNetLoading(crossingExpense.getNetLoading() +	element.getNetLoading());
									crossingExpense.setNetUnloading(crossingExpense.getNetUnloading() + element.getNetUnloading());
								}
							}
						}
						request.setAttribute("srcSubRegionWiseSummary", srcSubRegionWiseSummary);
						request.setAttribute("detailSubRegionWiseSummary", detailSubRegionWiseSummary);

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
			} else {
				error.put("errorCode", CargoErrorList.REPORT_TYPE_MISSING);
				error.put("errorDescription", CargoErrorList.REPORT_TYPE_MISSING_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}
			ActionStaticUtil.setReportViewModel(request);
			request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		} finally {
			error 					= null;
			executive   			= null;
			reportModel 			= null;
			wayBillIdArray			= null;
			cacheManip 				= null;
			sdf            			= null;
			fromDate       			= null;
			toDate         			= null;
			objectOut 				= null;
			conSumColl 				= null;
			lrColl  				= null;
			wayBillStr				= null;
			crossingExpense			= null;
			subregion  				= null;
			commonBranch		 	= null;
			branchIds				= null;
			srcSubRegionWiseSummary = null;
			branchWiseSummary 		= null;
			detailSubRegionWiseSummary= null;
		}
	}
}