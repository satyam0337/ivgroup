package com.ivcargo.reports;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.properties.constant.TrafficWiseSearchPropertiesConstant;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.exception.ExceptionProcess;
import com.iv.utils.utility.CollectionUtility;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.ConsignmentSummaryDao;
import com.platform.dao.reports.TrafficSearchDataDao;
import com.platform.dto.ConsignmentDetails;
import com.platform.dto.ConsignmentSummary;
import com.platform.dto.CustomerDetails;
import com.platform.dto.Executive;
import com.platform.dto.PackingTypeMaster;
import com.platform.dto.WayBill;
import com.platform.dto.WayBillType;
import com.platform.dto.constant.WayBillStatusConstant;
import com.platform.dto.constant.WayBillTypeConstant;
import com.platform.dto.model.ReportViewModel;
import com.platform.dto.model.WayBillViewModel;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

public class TrafficWiseViewLRDetailsAction implements Action {

	private static final String TRACE_ID = "TrafficWiseViewLRDetailsAction";

	CacheManip 							cacheManip 				= null;
	Executive        					executive   			= null;

	@Override
	@SuppressWarnings("unchecked")
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	 			error 					= null;

		try {

			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var startTime = System.currentTimeMillis();

			cacheManip     = new CacheManip(request);
			executive      = cacheManip.getExecutive(request);
			final var	valuesSource   = request.getParameter("sourceBranch");
			var	valuesDestination  = request.getParameter("todestBranchIds");
			final var	configuration 	   = cacheManip.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.TRAFFIC_SUMMARY);
			final var	showOperationalBranchDataInHandling  = (boolean) configuration.getOrDefault(TrafficWiseSearchPropertiesConstant.SHOW_OPERATIONAL_BRANCH_DATA_IN_HANDLING, false);

			if(valuesSource != null && !",".equals(valuesSource) && !"".equals(valuesSource)){
				if(valuesDestination != null && !",".equals(valuesDestination) && !"".equals(valuesDestination)){
					if(showOperationalBranchDataInHandling) {
						final var	assignedLocationListHM = cacheManip.getAssignedLocationsByLocationIds(request, valuesDestination, executive.getAccountGroupId());
						final List<Long>	deliveryLocationList   = assignedLocationListHM.entrySet().stream().map(Map.Entry::getValue).flatMap(Collection::stream).collect(Collectors.toList());
						valuesDestination 	   = CollectionUtility.getLongArrayListToString(deliveryLocationList);
					}

					final var	inValObj = new ValueObject();
					inValObj.put("srcBranchIds", valuesSource);
					inValObj.put("destBranchIds", valuesDestination);
					inValObj.put("accountGroupId", executive.getAccountGroupId());

					final var	objectOut = TrafficSearchDataDao.getInstance().getTrafficWiseViewLRDetails(inValObj);

					if(objectOut != null){

						final var	wayBillIdArray   = (Long[])objectOut.get("wayBillIdArray");
						final var	resultList		 = (ArrayList<WayBillViewModel>)objectOut.get("wayBillList");

						final var	wayBillIds	   = Utility.GetLongArrayToString(wayBillIdArray);
						final var	consignmentSummaryHM 	= ConsignmentSummaryDao.getInstance().getLimitedConsignmentDetails(wayBillIds);

						if(resultList != null && resultList.size() > 0){
							final var	pendingDispatchResult 	= new LinkedHashMap<Long, WayBillViewModel>();
							final var  currentTimeStamp = new Timestamp(startTime);

							resultList.forEach((final WayBillViewModel list) -> {
								PackingTypeMaster packingTypeMaster = null;

								try {
									packingTypeMaster = cacheManip.getPackingTypeMasterById(request, list.getPackingTypeMasterId());
								} catch (final Exception e) {
									e.printStackTrace();
								}

								if(pendingDispatchResult.get(list.getWayBillId()) != null) {
									final var model = pendingDispatchResult.get(list.getWayBillId());

									if (packingTypeMaster != null)
										model.setTotalPackagesTypeQuantity(model.getTotalPackagesTypeQuantity() + " / "	+ list.getPendingDispatchArticleQuantity() + " "+ packingTypeMaster.getName());

									pendingDispatchResult.put(model.getWayBillId(), model);
								} else {
									final var model = list;

									model.setWayBillType(WayBillType.getWayBillTypeNameByWayBilTypeId(list.getWayBillTypeId()));
									model.setGrandTotal(model.getGrandTotal());
									model.setCreationDateTimeStamp(model.getCreationDateTimeStamp());
									model.setActualWeight(model.getPendingWeight());
									model.setChargeWeigth(model.getChargeWeigth());
									model.setTotalQuantity(model.getPendingQuantity());

									try {
										model.setNoOfDays(Utility.getDayDiffBetweenTwoDates(model.getBookingDateTimeStamp(),currentTimeStamp ));
									} catch (final Exception e1) {
										e1.printStackTrace();
									}

									if (packingTypeMaster != null)
										model.setTotalPackagesTypeQuantity(list.getPendingDispatchArticleQuantity() + " "+ packingTypeMaster.getName());

									if(consignmentSummaryHM != null && consignmentSummaryHM.get(list.getWayBillId()) != null)
										model.setActualQuantity(consignmentSummaryHM.get(list.getWayBillId()).getQuantity());
									else
										model.setActualQuantity(0);

									try {
										var	branch = cacheManip.getGenericBranchDetailCache(request, model.getDestinationBranchId());
										model.setDestinationBranch(branch.getName());

										branch = cacheManip.getGenericBranchDetailCache(request, model.getSourceBranchId());
										model.setSourceBranch(branch.getName());
										pendingDispatchResult.put(model.getWayBillId(), model);
									} catch (final Exception e) {
										ExceptionProcess.execute(e, TRACE_ID);
									}
								}
							});

							if(pendingDispatchResult != null && pendingDispatchResult.size() > 0){
								final var	wayBillViewList = new ArrayList<>(pendingDispatchResult.values());

								final var	wayBillViewArray = new WayBillViewModel[wayBillViewList.size()];
								wayBillViewList.toArray(wayBillViewArray);

								request.setAttribute("wayBillViewList",	wayBillViewArray);
							}
						} else {
							error.put("errorCode", CargoErrorList.NO_RECORDS);
							error.put("errorDescription", CargoErrorList.NO_RECORDS_DESCRIPTION);
							request.setAttribute("cargoError", error);
						}
						request.setAttribute("nextPageToken", "success");
					}
				} else {
					error.put("errorCode", CargoErrorList.DESTINATION_BRANCH_MISSING);
					error.put("errorDescription", CargoErrorList.DESTINATION_BRANCH_MISSING_DESCRIPTION);
					request.setAttribute("cargoError", error);
				}
			} else {
				error.put("errorCode", CargoErrorList.SOURCE_BRANCH_MISSING);
				error.put("errorDescription", CargoErrorList.SOURCE_BRANCH_MISSING_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}

			var	reportViewModel = new ReportViewModel();
			reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);

			request.setAttribute("ReportViewModel",reportViewModel);
			request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}


	public WayBillViewModel populateWayBillViewModel(final HttpServletRequest request, final WayBill wayBill ,final ArrayList<ConsignmentDetails> consignmentDetails ,final CustomerDetails consignor ,final CustomerDetails consignee ,final ConsignmentSummary consignmentSummary) throws Exception {
		final var wayBillViewModel = new WayBillViewModel();

		wayBillViewModel.setCreationDateTimeStamp(wayBill.getCreationDateTimeStamp());
		wayBillViewModel.setDestinationBranchId(wayBill.getDestinationBranchId());
		wayBillViewModel.setExecutiveId(wayBill.getExecutiveId());

		var	branch = cacheManip.getGenericBranchDetailCache(request, wayBill.getDestinationBranchId());
		wayBillViewModel.setDestinationBranch(branch.getName());

		branch = cacheManip.getGenericBranchDetailCache(request, wayBill.getSourceBranchId());
		wayBillViewModel.setSourceBranch(branch.getName());

		wayBillViewModel.setStatusValue(WayBillStatusConstant.getStatus(wayBill.getStatus()));
		wayBillViewModel.setStatus(wayBill.getStatus());
		wayBillViewModel.setWayBillId(wayBill.getWayBillId());
		wayBillViewModel.setWayBillNumber(wayBill.getWayBillNumber());

		wayBillViewModel.setWayBillTypeId(wayBill.getWayBillTypeId());
		wayBillViewModel.setWayBillType(WayBillTypeConstant.getWayBillTypeNameByWayBilTypeId(wayBill.getWayBillTypeId()));
		wayBillViewModel.setRemark(wayBill.getRemark());
		wayBillViewModel.setGrandTotal(wayBill.getGrandTotal());
		wayBillViewModel.setConsignerName(consignor.getName());
		wayBillViewModel.setConsigneeName(consignee.getName());
		wayBillViewModel.setConsigneePhoneNo(consignee.getPhoneNumber());

		Double 			totalWeight    			= 0.0;
		var   			totalQuantity  	= 0L;
		final var 	pkgDetails 		= new StringBuilder();

		for(var i=0;i<consignmentDetails.size();i++) {
			totalWeight 	+= consignmentDetails.get(i).getActualWeight();
			totalQuantity 	+= consignmentDetails.get(i).getQuantity();

			if(i == 0)
				pkgDetails.append(consignmentDetails.get(i).getQuantity()+" "+consignmentDetails.get(i).getPackingTypeName());
			else
				pkgDetails.append("/ "+consignmentDetails.get(i).getQuantity()+" "+consignmentDetails.get(i).getPackingTypeName());
		}

		wayBillViewModel.setTotalPackagesTypeQuantity(pkgDetails.toString());
		wayBillViewModel.setTotalWeight(totalWeight);
		wayBillViewModel.setTotalQuantity(totalQuantity);
		wayBillViewModel.setActualWeight(consignmentSummary.getActualWeight());
		wayBillViewModel.setChargeWeigth(consignmentSummary.getChargeWeight());
		wayBillViewModel.setDeliveryTo(consignmentSummary.getDeliveryTo());

		return wayBillViewModel;
	}
}
