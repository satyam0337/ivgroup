package com.ivcargo.actions;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.StringJoiner;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.ObjectUtils;
import org.apache.commons.lang3.StringUtils;

import com.businesslogic.OutboundCargoBLL;
import com.businesslogic.waybill.FormTypesBLL;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.dto.constant.WayBillTypeConstant;
import com.iv.utils.constant.Constant;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.reports.ReportView;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.BranchTransferDao;
import com.platform.dao.ConsignmentSummaryDao;
import com.platform.dao.CustomerDetailsDao;
import com.platform.dto.AliasNameConstants;
import com.platform.dto.Branch;
import com.platform.dto.ChargeTypeMaster;
import com.platform.dto.ConsignmentSummary;
import com.platform.dto.CustomerDetails;
import com.platform.dto.Executive;
import com.platform.dto.LocationsMapping;
import com.platform.dto.PackingTypeMaster;
import com.platform.dto.PendingDispatchStock;
import com.platform.dto.PendingDispatchStockAritcleDetails;
import com.platform.dto.SubRegion;
import com.platform.dto.WayBill;
import com.platform.dto.configuration.mindateselection.ModuleWiseMinDateSelectionConfigurationDTO;
import com.platform.dto.constant.WayBillStatusConstant;
import com.platform.dto.model.ReportViewModel;
import com.platform.dto.model.WayBillViewModel;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

public class InterBranchLSPopUpListAction implements Action {

	public static final String TRACE_ID = InterBranchLSPopUpListAction.class.getName();

	CacheManip 				cache 				= null;
	Executive				executive			= null;
	SubRegion 				subRegion  			= null;
	HashMap<Short, Double>  branchDispatchRates = null;
	ValueObject   			branches			= null;
	ValueObject				subRegions			= null;

	@Override
	@SuppressWarnings("unchecked")
	public void execute(HttpServletRequest request, HttpServletResponse response) {

		HashMap<String, Object>	 							error 					= null;
		final ArrayList<LocationsMapping> 						locationList			= null;
		LocationsMapping									location				= null;
		HashMap<Long, Branch> 								exeRegionBranchesHM		= null;
		ArrayList<Long>										exeRegionBranchesAL		= null;
		ArrayList<Long>										assignedLocationIdList  = null;
		String												allAssignedLocationIds	= null;
		LinkedHashMap<Long, ValueObject>  					pdsValObjectHM			= null;
		HashMap<Long, ConsignmentSummary> 					consignmentSummary 		= null;
		ArrayList<Long>										wayBillIdList 			= null;
		String 												wayBillIds				= null;
		ArrayList<WayBillViewModel> 						wayBillViewList			= null;
		WayBillViewModel[]									wayBillViewArray		= null;
		WayBillViewModel									wayBillViewModel		= null;
		WayBill												wayBill					= null;
		ValueObject      									outValObj  				= null;
		ValueObject											valueObject				= null;
		PendingDispatchStock								pdsModel				= null;
		OutboundCargoBLL 									outboundCargoBLL 		= null;
		ReportViewModel 									reportViewModel			= null;
		HashMap<Long, CustomerDetails> 						consignor 				= null;
		HashMap<Long, CustomerDetails> 						consignee 				= null;
		ArrayList<PendingDispatchStockAritcleDetails>       pdsaDetailsList			= null;
		Timestamp											minDateTimeStamp		= null;
		HashMap<Long, String>								formTypesWithName		= null;
		FormTypesBLL										formTypesBLL			= null;
		String												formTypeName			= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			cache		= new CacheManip(request);
			executive	= cache.getExecutive(request);
			branches    = cache.getGenericBranchesDetail(request);
			subRegions	= cache.getAllSubRegions(request);

			final var inValObj      		= new ValueObject();

			var      wayBillNumber 			= JSPUtility.GetString(request, "wayBillNumber", "");
			var        destinationSubRegionId 	= JSPUtility.GetLong(request, "destSubRegionId", 0);
			var        destinationBranchId 	= JSPUtility.GetLong(request, "destBranchId", 0);
			final var   crossingAgentId 		= JSPUtility.GetLong(request, "crossingAgentId", 0);
			final var  	billSelectionId 		= JSPUtility.GetShort(request, "billSelection", (short)0);
			boolean		disallowInterBranchLSForRegionsLR = JSPUtility.GetBoolean(request, "disallowInterBranchLSForRegionsLR",false);
			String 		sourceRegionIdList 	= JSPUtility.GetString(request, "sourceRegionIdsForRestrictInterBranchLS","0");
			final var   divisionId 			= JSPUtility.GetLong(request, Constant.DIVISION_ID, 0);

			if (destinationBranchId == 0 && "".equals(wayBillNumber)) {
				destinationSubRegionId  = (Long) request.getAttribute("destSubRegionId");
				destinationBranchId 	= (Long) request.getAttribute("destBranchId");
				wayBillNumber       	= (String) request.getAttribute("wayBillNumber");
			}

			request.setAttribute("destSubRegionId", destinationSubRegionId);
			request.setAttribute("destBranchId", destinationBranchId);
			request.setAttribute("crossingAgentId", crossingAgentId);
			request.setAttribute("billSelection", billSelectionId);

			subRegion = (SubRegion) subRegions.get(executive.getSubRegionId());
			request.setAttribute("srcSubRegion", subRegion.getName());

			var branch = (Branch) branches.get(executive.getBranchId() + "");
			request.setAttribute("srcBranch", branch.getName());
			request.setAttribute("wayBillNumber", wayBillNumber);

			inValObj.put("isAgentBooking", (long)0);
			inValObj.put(AliasNameConstants.ACCOUNTGROUP_ID, executive.getAccountGroupId());
			inValObj.put("statusFilter", 1);
			inValObj.put("Filter", (short)1);
			inValObj.put(AliasNameConstants.SOURCE_BRANCH_ID, executive.getBranchId());
			inValObj.put(AliasNameConstants.EXECUTIVE_ID, executive.getExecutiveId());

			minDateTimeStamp		= cache.getModuleWiseMinDateToGetData(request, executive.getAccountGroupId(),
					ModuleWiseMinDateSelectionConfigurationDTO.INTER_BRANCH_LS_MIN_DATE_ALLOW,
					ModuleWiseMinDateSelectionConfigurationDTO.INTER_BRANCH_LS_MIN_DATE);

			inValObj.put(AliasNameConstants.MIN_DATE_TIMESTAMP, minDateTimeStamp);

			outboundCargoBLL 	= new OutboundCargoBLL();
			reportViewModel 	= new ReportViewModel();
			formTypesBLL		= new FormTypesBLL();

			reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);

			request.setAttribute("ReportViewModel", reportViewModel);

			var 			branchIds = cache.getBranchesString(request, executive.getAccountGroupId(), executive.getBranchId());

			if(ObjectUtils.isEmpty(branchIds))
				branchIds = "" + executive.getBranchId();

			assignedLocationIdList	= cache.getAssignedLocationsIdListByLocationIdId(request, executive.getBranchId(), executive.getAccountGroupId());
			assignedLocationIdList.add(executive.getBranchId());
			allAssignedLocationIds	= Utility.getStringFromArrayList(assignedLocationIdList);

			if(StringUtils.isNotEmpty(branchIds))
				branchIds = allAssignedLocationIds+","+branchIds;

			if (disallowInterBranchLSForRegionsLR && branchIds != null && !branchIds.isEmpty()) {
				Set<String> regionIdSet = new HashSet<>(Arrays.asList(sourceRegionIdList.split(",")));
				String[] branchidArr = branchIds.split(",");
				List<String> validBranchIds = new ArrayList<>();

				for (String branchIdStr : branchidArr) {
					long branchId = Long.parseLong(branchIdStr);
					branch = cache.getGenericBranchDetailCache(request, branchId);
					long regionId = branch.getRegionId();
					if (!regionIdSet.contains(String.valueOf(regionId))) {
						validBranchIds.add(branchIdStr);
					}
				}

				branchIds = String.join(",", validBranchIds);

				if (branchIds.isEmpty()) {
					error.put("errorCode", CargoErrorList.NO_RECORDS);
					error.put("errorDescription", CargoErrorList.NO_RECORDS_DESCRIPTION);
					request.setAttribute("cargoError", error);
					request.setAttribute("nextPageToken", "failure");
					return;
				}
			}

			inValObj.put(AliasNameConstants.BRANCH_IDS, branchIds);

			if (StringUtils.isNotEmpty(wayBillNumber)) {
				inValObj.put(AliasNameConstants.WAYBILL_NUMBER, wayBillNumber);
				inValObj.put("searchType", 1);
				outValObj = outboundCargoBLL.searchWayBillByWayBillNumber(inValObj);
			} else {
				if(Long.parseLong(request.getParameter("destSubRegionId")) == -1 && Long.parseLong(request.getParameter("destBranchId")) == -1 && request.getParameter("destBranchesString") != null)
					inValObj.put("destBranchesString", request.getParameter("destBranchesString"));
				else
					inValObj.put("destBranchesString", ""+destinationBranchId);

				final var	destBranchesString = inValObj.getString("destBranchesString", null);

				if(destBranchesString != null && !"".equals(destBranchesString))
					outValObj = outboundCargoBLL.findPendingDispatchStockData(inValObj);
			}

			if(ObjectUtils.isEmpty(outValObj)) {
				error.put("errorCode", CargoErrorList.NO_RECORDS);
				error.put("errorDescription", CargoErrorList.NO_RECORDS_DESCRIPTION);
				request.setAttribute("cargoError", error);
				request.setAttribute("nextPageToken", "failure");
				return ;
			}

			pdsValObjectHM      = (LinkedHashMap<Long, ValueObject>)outValObj.get("pdsValObjectHM");
			wayBillIdList		= (ArrayList<Long>) outValObj.get("wayBillIdList");
			wayBillIds	  		= Utility.getStringFromArrayList(wayBillIdList);
			consignor 			= CustomerDetailsDao.getInstance().getConsignorDetailsByWayBillId(wayBillIds);
			consignee 			= CustomerDetailsDao.getInstance().getConsigneeDetailsByWayBillId(wayBillIds);
			consignmentSummary 	= ConsignmentSummaryDao.getInstance().getLimitedConsignmentDetails(wayBillIds);
			formTypesWithName	= formTypesBLL.getFormTypesWithName(wayBillIds);
			wayBillViewList		= new ArrayList<>();

			for(final Map.Entry<Long, ValueObject> entry : pdsValObjectHM.entrySet()) {
				valueObject 		= entry.getValue();
				wayBill     		= (WayBill) valueObject.get("wayBill_" + entry.getKey());
				pdsModel			= (PendingDispatchStock) valueObject.get("pdsModel_" + entry.getKey());
				pdsaDetailsList		= (ArrayList<PendingDispatchStockAritcleDetails> ) valueObject.get("pdsaDetailsList_" + entry.getKey());

				if(formTypesWithName != null)
					formTypeName		= formTypesWithName.get(wayBill.getWayBillId());
				else
					formTypeName		= "-----";

				wayBillViewModel = populateWayBillViewModel(request, wayBill, pdsaDetailsList, consignor.get(wayBill.getWayBillId()), consignee.get(wayBill.getWayBillId()), consignmentSummary.get(wayBill.getWayBillId()), destinationBranchId, pdsModel, formTypeName);
				wayBillViewList.add(wayBillViewModel);

				location	= cache.getLocationMappingDetailsByAssignedLocationId(request, executive.getAccountGroupId(), wayBillViewModel.getDestinationBranchId());

				if(location != null) {
					branch		= (Branch) branches.get(location.getLocationId() + "");

					wayBillViewModel.setLocationId(location.getLocationId());
					wayBillViewModel.setLocationSubRegionId(branch.getSubRegionId());
					wayBillViewModel.setLocationName(branch.getName());
				}
			}

			if(billSelectionId > 0 && !wayBillViewList.isEmpty())
				wayBillViewList = wayBillViewList.stream().filter(e -> e.getBillSelectionId() == billSelectionId).collect(Collectors.toCollection(ArrayList::new));

			if(divisionId > 0 && !wayBillViewList.isEmpty())
				wayBillViewList = wayBillViewList.stream().filter(e -> e.getDivisionId() == divisionId).collect(Collectors.toCollection(ArrayList::new));

			if(ObjectUtils.isEmpty(wayBillViewList)) {
				error.put("errorCode", CargoErrorList.NO_RECORDS);
				error.put("errorDescription", CargoErrorList.NO_RECORDS_DESCRIPTION);
				request.setAttribute("cargoError", error);
				request.setAttribute("nextPageToken", "failure");
				return ;
			}

			wayBillViewArray = new WayBillViewModel[wayBillViewList.size()];
			wayBillViewList.toArray(wayBillViewArray);

			request.setAttribute("BTWayBillsCollection", BranchTransferDao.getInstance().getWayBills(wayBillIds));
			request.setAttribute("wayBillViewList", wayBillViewArray);
			request.setAttribute("locationList", locationList);

			exeRegionBranchesHM = cache.getBranchesByRegionId(request, executive.getAccountGroupId(), executive.getRegionId());

			exeRegionBranchesAL = new ArrayList<>();

			if(exeRegionBranchesHM.size() > 0) {
				for(final Map.Entry<Long, Branch> entry : exeRegionBranchesHM.entrySet())
					exeRegionBranchesAL.add(entry.getValue().getBranchId());

				if(!exeRegionBranchesAL.isEmpty())
					request.setAttribute("exeRegionBranchesAL", exeRegionBranchesAL);
			}

			request.setAttribute("nextPageToken", "success");

		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}

	public WayBillViewModel populateWayBillViewModel(HttpServletRequest request, WayBill wayBill, ArrayList<PendingDispatchStockAritcleDetails> pdsaDetailsList ,CustomerDetails consignor ,CustomerDetails consignee ,ConsignmentSummary consignmentSummary,long destinationBranchId, PendingDispatchStock  pdsModel, String formTypeName) throws Exception {

		Branch 	  			branchDetail;
		SubRegion 			subregionDetail;
		PackingTypeMaster	packingTypeMaster 	= null;

		final var wayBillViewModel = new WayBillViewModel();

		wayBillViewModel.setCreationDateTimeStamp(wayBill.getCreationDateTimeStamp());
		wayBillViewModel.setExecutiveId(wayBill.getExecutiveId());

		branchDetail    = (Branch) branches.get(wayBill.getSourceBranchId() + "");
		wayBillViewModel.setSourceBranchId(branchDetail.getBranchId());
		wayBillViewModel.setSourceBranch(branchDetail.getName());

		subregionDetail = (SubRegion) subRegions.get(branchDetail.getSubRegionId());
		wayBillViewModel.setSourceSubRegionId(subregionDetail.getSubRegionId());
		wayBillViewModel.setSourceSubRegion(subregionDetail.getName());

		branchDetail    = (Branch) branches.get(wayBill.getDestinationBranchId() + "");
		wayBillViewModel.setDestinationBranchId(branchDetail.getBranchId());
		wayBillViewModel.setDestinationBranch(branchDetail.getName());

		subregionDetail = (SubRegion) subRegions.get(branchDetail.getSubRegionId());
		wayBillViewModel.setDestinationSubRegionId(subregionDetail.getSubRegionId());
		wayBillViewModel.setDestinationSubRegion(subregionDetail.getName());
		wayBillViewModel.setStatusValue(WayBillStatusConstant.getStatus(wayBill.getStatus()));
		wayBillViewModel.setStatus(wayBill.getStatus());
		wayBillViewModel.setWayBillId(wayBill.getWayBillId());
		wayBillViewModel.setWayBillNumber(wayBill.getWayBillNumber());

		if(wayBill.isManual())
			wayBillViewModel.setWayBillType(WayBillTypeConstant.getWayBillTypeNameByWayBilTypeId(wayBill.getWayBillTypeId()) + WayBillTypeConstant.WAYBILL_TYPE_MANUAL);
		else
			wayBillViewModel.setWayBillType(WayBillTypeConstant.getWayBillTypeNameByWayBilTypeId(wayBill.getWayBillTypeId()));

		wayBillViewModel.setWayBillTypeId(wayBill.getWayBillTypeId());
		wayBillViewModel.setRemark(wayBill.getRemark());
		wayBillViewModel.setGrandTotal(wayBill.getGrandTotal());
		wayBillViewModel.setConsignerName(consignor.getName());
		wayBillViewModel.setConsigneeName(consignee.getName());
		wayBillViewModel.setConsigneePhoneNo(consignee.getPhoneNumber());

		var   			totalQuantity  	= 0L;
		var			quantity		= 0L;
		final var 	pkgDetails 		= new StringJoiner("/ ");
		final var 	artDetails 		= new StringJoiner("@");

		for (final PendingDispatchStockAritcleDetails element : pdsaDetailsList) {
			quantity  = element.getQuantity();

			packingTypeMaster = cache.getPackingTypeMasterById(request, element.getPackingTypeMasterId());

			pkgDetails.add(quantity + " " + packingTypeMaster.getName());
			artDetails.add(packingTypeMaster.getPackingTypeMasterId() + "_" + quantity + "_" + element.getConsignmentDetailsId());
			totalQuantity += quantity;
		}

		wayBillViewModel.setTotalPackagesTypeQuantity(pkgDetails.toString());
		wayBillViewModel.setTotalQuantity(totalQuantity);
		wayBillViewModel.setTotalWeight(pdsModel.getPendingWeight());
		wayBillViewModel.setActualWeight(pdsModel.getPendingWeight());
		wayBillViewModel.setFormTypeName(formTypeName);
		wayBillViewModel.setDeliveryTo(consignmentSummary.getDeliveryTo());
		wayBillViewModel.setBillSelectionId(consignmentSummary.getBillSelectionId());
		wayBillViewModel.setDivisionId(consignmentSummary.getDivisionId());
		
		if(consignmentSummary.getFreightUptoBranchId() > 0) {
			final var		branch	= (Branch) branches.get(consignmentSummary.getFreightUptoBranchId() + "");
			wayBillViewModel.setFreightUptoBranchName(branch.getName());
		}

		if(branchDispatchRates != null && branchDispatchRates.size() > 0) {
			final var chargedWt = consignmentSummary.getChargeWeight();

			if(branchDispatchRates.get(ChargeTypeMaster.NET_LOADING) != null)
				wayBillViewModel.setNetLoading(chargedWt * branchDispatchRates.get(ChargeTypeMaster.NET_LOADING));

			if(branchDispatchRates.get(ChargeTypeMaster.NET_UNLOADING) != null)
				wayBillViewModel.setNetUnloading(chargedWt * branchDispatchRates.get(ChargeTypeMaster.NET_UNLOADING));
		}

		wayBillViewModel.setBookedForAccountGroupId(wayBill.getBookedForAccountGroupId());
		wayBillViewModel.setBranchId(wayBill.getBranchId());
		wayBillViewModel.setConsignmentWiseDetails(artDetails.toString());

		return wayBillViewModel;
	}
}