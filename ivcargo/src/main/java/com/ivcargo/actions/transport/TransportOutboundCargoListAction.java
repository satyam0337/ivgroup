package com.ivcargo.actions.transport;

import java.sql.Timestamp;

//~--- non-JDK imports --------------------------------------------------------

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.StringJoiner;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.OutboundCargoBLL;
import com.businesslogic.waybill.FormTypesBLL;
import com.businesslogic.waybill.WayBillViewModelBLL;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.dto.constant.WayBillTypeConstant;
import com.iv.utils.constant.Constant;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.exception.ExceptionProcess;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.reports.ReportView;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.BranchTransferDao;
import com.platform.dao.ConsignmentSummaryDao;
import com.platform.dao.CrossingRatesDao;
import com.platform.dao.CustomerDetailsDao;
import com.platform.dao.RateMasterDao;
import com.platform.dto.AliasNameConstants;
import com.platform.dto.Branch;
import com.platform.dto.ChargeTypeMaster;
import com.platform.dto.ConsignmentSummary;
import com.platform.dto.CrossingRate;
import com.platform.dto.CustomerDetails;
import com.platform.dto.DispatchLedger;
import com.platform.dto.Executive;
import com.platform.dto.LocationsMapping;
import com.platform.dto.PackingTypeMaster;
import com.platform.dto.PendingDispatchStock;
import com.platform.dto.PendingDispatchStockAritcleDetails;
import com.platform.dto.SubRegion;
import com.platform.dto.TransportCommonMaster;
import com.platform.dto.WayBill;
import com.platform.dto.configuration.mindateselection.ModuleWiseMinDateSelectionConfigurationDTO;
import com.platform.dto.configuration.modules.LsConfigurationDTO;
import com.platform.dto.constant.TransCargoAccountGroupConstant;
import com.platform.dto.constant.WayBillStatusConstant;
import com.platform.dto.model.ReportViewModel;
import com.platform.dto.model.WayBillViewModel;
import com.platform.resource.CargoErrorList;
import com.platform.utils.PropertiesUtility;
import com.platform.utils.Utility;

public class TransportOutboundCargoListAction implements Action {

	public static final String TRACE_ID = TransportOutboundCargoListAction.class.getName();
	CacheManip 				cache 								= null;
	Executive				executive							= null;
	SubRegion				subRegion							= null;
	Branch 					branch 								= null;
	ArrayList<CrossingRate> crossingRates 						= null;
	HashMap<Short, Double>  branchDispatchRates 				= null;
	ValueObject				lsConfiguration						= null;
	boolean					isCrossingRateAllow					= false;
	boolean					isLoadingHamaliRateAllow			= false;
	boolean					isUnLoadingHamaliRateAllow			= false;
	boolean					isCrossingHireRateAllow				= false;
	boolean					onlyCrossingHireAmountApplicable	= false;
	boolean					applyCrossingHireRateOnActualWeight	= false;
	String					showCredtDebitInfo					= null;

	@Override
	@SuppressWarnings("unchecked")
	public void execute(HttpServletRequest request, HttpServletResponse response) {

		HashMap<String, Object>	 							error 					= null;
		ValueObject 										inValObj      			= null;
		final ArrayList<LocationsMapping> 						locationList			= null;
		HashMap<Long, Branch> 								exeRegionBranchesHM		= null;
		ArrayList<Long>										exeRegionBranchesAL		= null;
		ArrayList<Long>										assignedLocationIdList  = null;
		String												allAssignedLocationIds	= null;
		HashMap<Long, CustomerDetails> 						consignor 				= null;
		HashMap<Long, CustomerDetails> 						consignee 				= null;
		LinkedHashMap<Long, ValueObject>  					pdsValObjectHM			= null;
		HashMap<Long, ConsignmentSummary> 					consignmentSummary 		= null;
		ArrayList<Long>										wayBillIdList 			= null;
		String 												wayBillIds				= null;
		ArrayList<WayBillViewModel> 						wayBillViewList			= null;
		WayBillViewModel[]									wayBillViewArray		= null;
		Timestamp											minDateTimeStamp		= null;
		WayBillViewModelBLL									wayBillViewModelBLL		= null;
		List<WayBillViewModel> 								wayBillViewModelList	= null;
		FormTypesBLL										formTypesBLL			= null;
		HashMap<Long, String> 								formTypeWithName		= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error))
				return;

			cache		= new CacheManip(request);
			executive	= cache.getExecutive(request);

			var			wayBillNumber 				= JSPUtility.GetString(request, "wayBillNumber", "");
			final var	destinationSubRegionId 		= JSPUtility.GetLong(request, "destSubRegionId", 0);
			var			destinationBranchId 		= JSPUtility.GetLong(request, "destBranchId", 0);
			final var 	crossingAgentId 			= JSPUtility.GetLong(request, "crossingAgentId", 0);


			lsConfiguration			= cache.getLsConfiguration(request, executive.getAccountGroupId());
			wayBillViewModelBLL		= new WayBillViewModelBLL();
			formTypesBLL			= new FormTypesBLL();

			if(destinationBranchId == 0 && "".equals(wayBillNumber)) {
				destinationBranchId = (Long) request.getAttribute("destBranchId");
				wayBillNumber       = (String) request.getAttribute("wayBillNumber");
			}

			isCrossingRateAllow						= PropertiesUtility.isAllow(lsConfiguration.getString(LsConfigurationDTO.IS_CROSSING_RATE_ALLOW, Constant.FALSE));
			isLoadingHamaliRateAllow				= PropertiesUtility.isAllow(lsConfiguration.getString(LsConfigurationDTO.IS_LOADING_HAMALI_RATE_ALLOW, Constant.TRUE));
			isUnLoadingHamaliRateAllow				= PropertiesUtility.isAllow(lsConfiguration.getString(LsConfigurationDTO.IS_UNLOADING_HAMALI_RATE_ALLOW, Constant.TRUE));
			isCrossingHireRateAllow					= PropertiesUtility.isAllow(lsConfiguration.getString(LsConfigurationDTO.IS_CROSSING_HIRE_RATE_ALLOW, Constant.TRUE));
			onlyCrossingHireAmountApplicable		= PropertiesUtility.isAllow(lsConfiguration.getString(LsConfigurationDTO.ONLY_CROSSING_HIRE_AMOUNT_APPLICABLE, Constant.FALSE));
			applyCrossingHireRateOnActualWeight		= PropertiesUtility.isAllow(lsConfiguration.getString(LsConfigurationDTO.APPLY_CROSSING_HIRE_RATE_ON_ACTUAL_WEIGHT, Constant.FALSE));
			showCredtDebitInfo						= lsConfiguration.getString(LsConfigurationDTO.SHOW_CREDIT_DEBIT_INFO, Constant.FALSE);

			if(isCrossingRateAllow) {
				crossingRates 		= CrossingRatesDao.getInstance().getCrossingRates(executive.getAccountGroupId(), executive.getBranchId(), destinationBranchId, crossingAgentId , CrossingRate.TXN_TYPE_DELIVERY);
				branchDispatchRates = RateMasterDao.getInstance().getDispatchRatesForBranch(executive.getBranchId());
			}

			request.setAttribute("destSubRegionId", destinationSubRegionId);
			request.setAttribute("destBranchId", destinationBranchId);
			request.setAttribute("crossingAgentId", crossingAgentId);

			subRegion = cache.getGenericSubRegionById(request, executive.getSubRegionId());
			request.setAttribute("srcSubRegion", subRegion.getName());

			branch = cache.getGenericBranchDetailCache(request,executive.getBranchId());
			request.setAttribute("srcBranch", branch.getName());
			request.setAttribute("wayBillNumber", wayBillNumber);
			//Routing Value set
			request.setAttribute("routingAllowed", request.getParameter("routing"));

			inValObj		= new ValueObject();

			inValObj.put("isAgentBooking", (long)0);
			inValObj.put(AliasNameConstants.ACCOUNTGROUP_ID, executive.getAccountGroupId());
			inValObj.put("statusFilter", 1);
			inValObj.put("Filter", (short)1);
			inValObj.put(AliasNameConstants.SOURCE_BRANCH_ID, executive.getBranchId());
			inValObj.put(AliasNameConstants.EXECUTIVE_ID, executive.getExecutiveId());

			minDateTimeStamp		= cache.getModuleWiseMinDateToGetData(request, executive.getAccountGroupId(),
					ModuleWiseMinDateSelectionConfigurationDTO.LOADING_SHEET_MIN_DATE_ALLOW,
					ModuleWiseMinDateSelectionConfigurationDTO.LOADING_SHEET_MIN_DATE);

			inValObj.put(AliasNameConstants.MIN_DATE_TIMESTAMP, minDateTimeStamp);

			final var outboundCargoBLL = new OutboundCargoBLL();
			ValueObject      outValObj  = null;

			var reportViewModel = new ReportViewModel();
			reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);
			request.setAttribute("ReportViewModel",reportViewModel);

			var 	branchIds = cache.getBranchesString(request, executive.getAccountGroupId(), executive.getBranchId());
			if(branchIds == null || branchIds.length() <= 0)
				branchIds = ""+executive.getBranchId();

			assignedLocationIdList	= cache.getAssignedLocationsIdListByLocationIdId(request, executive.getBranchId(), executive.getAccountGroupId());
			assignedLocationIdList.add(executive.getBranchId());
			allAssignedLocationIds	= Utility.getStringFromArrayList(assignedLocationIdList);

			if(branchIds != null && branchIds.length() > 0)
				branchIds = allAssignedLocationIds+","+branchIds;
			inValObj.put(AliasNameConstants.BRANCH_IDS, branchIds);

			if (wayBillNumber != null && !"".equals(wayBillNumber)) {
				inValObj.put(AliasNameConstants.WAYBILL_NUMBER, wayBillNumber);
				inValObj.put("searchType", 1);
				outValObj = outboundCargoBLL.searchWayBillByWayBillNumber(inValObj);
			} else {
				if(Long.parseLong(request.getParameter("destBranchId")) == -1 && request.getParameter("destBranchesString") != null)
					inValObj.put("destBranchesString", request.getParameter("destBranchesString"));
				else
					inValObj.put("destBranchesString", ""+destinationBranchId);

				final var	destBranchesString = inValObj.getString("destBranchesString", null);

				if(destBranchesString != null && !"".equals(destBranchesString))
					outValObj = outboundCargoBLL.findPendingDispatchStockData(inValObj);
			}

			if(outValObj == null || outValObj != null && outValObj.getHtData().size() <= 0) {
				error.put("errorCode", CargoErrorList.NO_RECORDS);
				error.put("errorDescription", CargoErrorList.NO_RECORDS_DESCRIPTION);
				request.setAttribute("cargoError", error);
				request.setAttribute("nextPageToken", "success_"+executive.getAccountGroupId());
				return ;
			}

			pdsValObjectHM      = (LinkedHashMap<Long, ValueObject>)outValObj.get("pdsValObjectHM");
			wayBillIdList		= (ArrayList<Long>)outValObj.get("wayBillIdList");
			wayBillIds	  		= Utility.getStringFromArrayList(wayBillIdList);
			consignor 			= CustomerDetailsDao.getInstance().getConsignorDetailsByWayBillId(wayBillIds);
			consignee 			= CustomerDetailsDao.getInstance().getConsigneeDetailsByWayBillId(wayBillIds);
			consignmentSummary 	= ConsignmentSummaryDao.getInstance().getLimitedConsignmentDetails(wayBillIds);
			wayBillViewList		= new ArrayList<>();
			formTypeWithName	= formTypesBLL.getFormTypesWithName(wayBillIds);

			for(final Map.Entry<Long, ValueObject> entry : pdsValObjectHM.entrySet()) {
				final var 	valueObject 		= entry.getValue();
				final var 	wayBill     		= (WayBill) valueObject.get("wayBill_" + entry.getKey());
				final var	pdsModel			= (PendingDispatchStock) valueObject.get("pdsModel_" + entry.getKey());
				final var	pdsaDetailsList		= (ArrayList<PendingDispatchStockAritcleDetails> ) valueObject.get("pdsaDetailsList_" + entry.getKey());
				final var	formTypeName		= formTypeWithName.get(wayBill.getWayBillId());

				final var 	wayBillCrossingRate	= getWeightOrQuantityWiseCrossingRate(wayBill, pdsaDetailsList, destinationBranchId, consignmentSummary.get(wayBill.getWayBillId()));
				final var 	wayBillViewModel 	= populateWayBillViewModel(request, wayBill, pdsaDetailsList, consignor.get(wayBill.getWayBillId()), consignee.get(wayBill.getWayBillId()),consignmentSummary.get(wayBill.getWayBillId()), pdsModel, wayBillCrossingRate, formTypeName);

				wayBillViewList.add(wayBillViewModel);

				final var location	= cache.getLocationMappingDetailsByAssignedLocationId(request, executive.getAccountGroupId(),wayBillViewModel.getDestinationBranchId());

				if(location != null){
					wayBillViewModel.setLocationId(location.getLocationId());
					wayBillViewModel.setLocationSubRegionId(cache.getGenericBranchDetailCache(request,location.getLocationId()).getSubRegionId());
					wayBillViewModel.setLocationName(cache.getGenericBranchDetailCache(request, location.getLocationId()).getName());
				}
			}

			wayBillViewArray = new WayBillViewModel[wayBillViewList.size()];
			wayBillViewList.toArray(wayBillViewArray);

			request.setAttribute("BTWayBillsCollection", BranchTransferDao.getInstance().getWayBills(wayBillIds));
			request.setAttribute("wayBillViewList", wayBillViewArray);
			request.setAttribute("locationList", locationList);
			request.setAttribute("showCredtDebitInfo", showCredtDebitInfo);

			wayBillViewModelList		= wayBillViewModelBLL.getWayBillViewModelListInSortedOrder(lsConfiguration, wayBillViewArray);

			request.setAttribute("wayBillViewModelList", wayBillViewModelList);

			if(executive.getAccountGroupId() == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_JAYRAM_TRANSPORTS
					|| executive.getAccountGroupId() == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_GKR){
				exeRegionBranchesHM = cache.getBranchesByRegionId(request, executive.getAccountGroupId(), executive.getRegionId());
				exeRegionBranchesAL = new ArrayList<>();

				if(exeRegionBranchesHM.size() > 0){
					for(final Map.Entry<Long, Branch> entry : exeRegionBranchesHM.entrySet())
						exeRegionBranchesAL.add(entry.getValue().getBranchId());

					if(!exeRegionBranchesAL.isEmpty()){
						request.setAttribute("exeRegionBranchesAL", exeRegionBranchesAL);
						request.setAttribute("exeRegionBranchesHM", exeRegionBranchesHM);
					}
				}
			}

			request.setAttribute("nextPageToken", "success_"+executive.getAccountGroupId());

		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}
	}

	public WayBillViewModel populateWayBillViewModel(HttpServletRequest request, WayBill wayBill, ArrayList<PendingDispatchStockAritcleDetails> pdsaDetailsList, CustomerDetails consignor, CustomerDetails consignee, ConsignmentSummary consignmentSummary, PendingDispatchStock  pdsModel, Map<Long, CrossingRate>	wayBillCrossingRate, String formTypeName) throws Exception {

		PackingTypeMaster	packingTypeMaster = null;

		final var wayBillViewModel = new WayBillViewModel();

		wayBillViewModel.setCreationDateTimeStamp(wayBill.getCreationDateTimeStamp());
		wayBillViewModel.setDestinationBranchId(wayBill.getDestinationBranchId());
		wayBillViewModel.setExecutiveId(wayBill.getExecutiveId());

		if(wayBill.getDestinationBranchId() > 0) {
			branch = cache.getGenericBranchDetailCache(request,wayBill.getDestinationBranchId());
			wayBillViewModel.setDestinationBranch(branch.getName());

			subRegion = cache.getGenericSubRegionById(request, branch.getSubRegionId());
			wayBillViewModel.setDestinationSubRegionId(branch.getSubRegionId());
			wayBillViewModel.setDestinationSubRegion(subRegion.getName());
		}

		var  branchDetail	    = cache.getGenericBranchDetailCache(request, wayBill.getSourceBranchId());
		var  subregionDetail	= cache.getGenericSubRegionById(request, branchDetail.getSubRegionId());
		wayBillViewModel.setSourceSubRegion(subregionDetail.getName());

		branchDetail		= null;
		subregionDetail 	= null;

		branchDetail    = cache.getGenericBranchDetailCache(request, wayBill.getDestinationBranchId());
		subregionDetail = cache.getGenericSubRegionById(request, branchDetail.getSubRegionId());

		if(subregionDetail != null)
			wayBillViewModel.setDestinationSubRegion(subregionDetail.getName());
		else
			wayBillViewModel.setDestinationSubRegion("");

		branch = cache.getGenericBranchDetailCache(request, wayBill.getSourceBranchId());
		wayBillViewModel.setSourceBranch(branch.getName());

		subRegion = cache.getGenericSubRegionById(request, branch.getSubRegionId());
		wayBillViewModel.setSourceSubRegion(subRegion.getName());

		wayBillViewModel.setStatusValue(WayBillStatusConstant.getStatus(wayBill.getStatus()));
		wayBillViewModel.setStatus(wayBill.getStatus());
		wayBillViewModel.setWayBillId(wayBill.getWayBillId());
		wayBillViewModel.setWayBillNumber(wayBill.getWayBillNumber());

		if(wayBill.isManual())
			wayBillViewModel.setWayBillType(WayBillTypeConstant.getWayBillTypeNameByWayBilTypeId(wayBill.getWayBillTypeId()) + WayBillTypeConstant.WAYBILL_TYPE_MANUAL);
		else
			wayBillViewModel.setWayBillType(WayBillTypeConstant.getWayBillTypeNameByWayBilTypeId(wayBill.getWayBillTypeId()));

		wayBillViewModel.setWayBillTypeId(wayBill.getWayBillTypeId());
		wayBillViewModel.setRemark(wayBill.getRemark() != null ? wayBill.getRemark().replace(";", "") : "NA");
		wayBillViewModel.setGrandTotal(wayBill.getGrandTotal());
		wayBillViewModel.setConsignerName(consignor.getName().replace(";", ""));
		wayBillViewModel.setConsigneeName(consignee.getName().replace(";", ""));
		wayBillViewModel.setConsigneePhoneNo(consignee.getPhoneNumber());

		var   			totalQuantity  	= 0L;
		var			quantity		= 0L;
		final var 	pkgDetails 		= new StringJoiner("/ ");

		for (final PendingDispatchStockAritcleDetails element : pdsaDetailsList) {
			quantity  = element.getQuantity();
			packingTypeMaster = cache.getPackingTypeMasterById(request, element.getPackingTypeMasterId());

			pkgDetails.add(quantity + " " + packingTypeMaster.getName());

			totalQuantity += quantity;
		}

		wayBillViewModel.setTotalPackagesTypeQuantity(pkgDetails.toString());
		wayBillViewModel.setTotalQuantity(totalQuantity);
		wayBillViewModel.setTotalWeight(pdsModel.getPendingWeight());
		wayBillViewModel.setActualWeight(pdsModel.getPendingWeight());
		wayBillViewModel.setFormTypeName(formTypeName);
		wayBillViewModel.setDeliveryTo(consignmentSummary.getDeliveryTo());
		wayBillViewModel.setConsignorInvoiceNo(consignmentSummary.getInvoiceNo());

		if(consignmentSummary.getFreightUptoBranchId() > 0) {
			wayBillViewModel.setFreightUptoBranchName(cache.getGenericBranchDetailCache(request,consignmentSummary.getFreightUptoBranchId()).getName());
			wayBillViewModel.setFreightUptoBranchId(consignmentSummary.getFreightUptoBranchId());
		}

		if(branchDispatchRates != null && branchDispatchRates.size() > 0 && consignmentSummary != null) {
			final var chargedWt = consignmentSummary.getChargeWeight();

			if(isLoadingHamaliRateAllow && branchDispatchRates.get(ChargeTypeMaster.NET_LOADING) != null)
				wayBillViewModel.setNetLoading(chargedWt * branchDispatchRates.get(ChargeTypeMaster.NET_LOADING));

			if(isUnLoadingHamaliRateAllow && branchDispatchRates.get(ChargeTypeMaster.NET_UNLOADING) != null)
				wayBillViewModel.setNetUnloading(chargedWt * branchDispatchRates.get(ChargeTypeMaster.NET_UNLOADING));
		}

		if(isCrossingHireRateAllow && wayBillCrossingRate != null && wayBillCrossingRate.size() > 0 && wayBillCrossingRate.get(wayBill.getWayBillId()) != null)
			wayBillViewModel.setCrossingHire(wayBillCrossingRate.get(wayBill.getWayBillId()).getRate());

		wayBillViewModel.setBookedForAccountGroupId(wayBill.getBookedForAccountGroupId());
		wayBillViewModel.setBillSelectionId(consignmentSummary.getBillSelectionId());
		wayBillViewModel.setBillSelectionName(TransportCommonMaster.getBillSelecion(consignmentSummary.getBillSelectionId()));
		wayBillViewModel.setBranchId(wayBill.getBranchId());

		return wayBillViewModel;
	}

	public Map<Long, CrossingRate> getWeightOrQuantityWiseCrossingRate(WayBill wayBill, ArrayList<PendingDispatchStockAritcleDetails> pdsaDetailsList, long dispatchDestBranchId, ConsignmentSummary consignmentSummary) throws Exception {
		Map<Long, CrossingRate>			wayBillCrossingRate 	= null;
		CrossingRate 					rate 					= null;
		CrossingRate					crossingRate			= null;
		var 							totalWeightRate			= 0.00;
		var 							totalQuantityRate		= 0.00;

		try {
			wayBillCrossingRate	= new HashMap<>();

			if(crossingRates != null && !crossingRates.isEmpty())
				for (final CrossingRate crossingRate2 : crossingRates) {

					rate 	= crossingRate2;

					if(rate.getDestinationBranchId() == wayBill.getDestinationBranchId())
						if(rate.isWeightType()) {//If weightType
							if(onlyCrossingHireAmountApplicable) {
								if(applyCrossingHireRateOnActualWeight) {
									if(rate.isRatePercentage())
										totalWeightRate += consignmentSummary.getActualWeight() * (rate.getRate() / 100);
									else
										totalWeightRate += consignmentSummary.getActualWeight() * rate.getRate();
								} else if(rate.isRatePercentage())
									totalWeightRate += consignmentSummary.getChargeWeight() * (rate.getRate() / 100);
								else
									totalWeightRate += consignmentSummary.getChargeWeight() * rate.getRate();
							} else if(rate.isRatePercentage())
								totalWeightRate += consignmentSummary.getChargeWeight() * ((rate.getRate() + DispatchLedger.DISPATCHLEDGER_EXTRA_CHARGE_RATE) / 100);
							else
								totalWeightRate += consignmentSummary.getChargeWeight() * (rate.getRate() + DispatchLedger.DISPATCHLEDGER_EXTRA_CHARGE_RATE);
						} else {
							var			quantity		= 0L;

							for (final PendingDispatchStockAritcleDetails element : pdsaDetailsList)
								if(element.getPackingTypeMasterId() == rate.getPackingTypeId()) {
									quantity = element.getQuantity();

									if(rate.isRatePercentage())
										totalQuantityRate += quantity * (rate.getRate() / 100);
									else
										totalQuantityRate += quantity * rate.getRate();
								}
						}
				}

			crossingRate = new CrossingRate();

			crossingRate.setWayBillId(wayBill.getWayBillId());

			if(totalWeightRate >= totalQuantityRate)
				crossingRate.setRate(totalWeightRate);
			else
				crossingRate.setRate(totalQuantityRate);

			wayBillCrossingRate.put(crossingRate.getWayBillId(), crossingRate);

			return wayBillCrossingRate;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		} finally {
			wayBillCrossingRate 	= null;
			rate 					= null;
			crossingRate			= null;
		}
	}
}