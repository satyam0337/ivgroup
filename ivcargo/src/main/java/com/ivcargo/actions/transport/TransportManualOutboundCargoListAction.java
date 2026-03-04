package com.ivcargo.actions.transport;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringUtils;

import com.businesslogic.OutboundCargoBLL;
import com.businesslogic.waybill.FormTypesBLL;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.reports.ReportView;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.BranchTransferDao;
import com.platform.dao.ConsignmentSummaryDao;
import com.platform.dao.CustomerDetailsDao;
import com.platform.dao.ExecutiveDao;
import com.platform.dao.RateMasterDao;
import com.platform.dto.AccountGroup;
import com.platform.dto.AliasNameConstants;
import com.platform.dto.Branch;
import com.platform.dto.ChargeTypeMaster;
import com.platform.dto.City;
import com.platform.dto.ConsignmentSummary;
import com.platform.dto.CustomerDetails;
import com.platform.dto.ECargoConstantFile;
import com.platform.dto.Executive;
import com.platform.dto.PackingTypeMaster;
import com.platform.dto.PendingDispatchStock;
import com.platform.dto.PendingDispatchStockAritcleDetails;
import com.platform.dto.WayBill;
import com.platform.dto.WayBillType;
import com.platform.dto.configuration.mindateselection.ModuleWiseMinDateSelectionConfigurationDTO;
import com.platform.dto.constant.WayBillStatusConstant;
import com.platform.dto.model.ReportViewModel;
import com.platform.dto.model.WayBillViewModel;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

public class TransportManualOutboundCargoListAction implements Action {

	public static final String TRACE_ID = "TransportManualOutboundCargoListAction";
	CacheManip 	cache 		= null;
	Executive	executive	= null;
	City 		city  		= null;
	Branch 		branch 		= null;
	WayBillType wayBillType = null;
	//ArrayList<CrossingRate> crossingRates = null;
	HashMap<Short, Double>  branchDispatchRates = null;

	@Override
	@SuppressWarnings("unchecked")
	public void execute(HttpServletRequest request, HttpServletResponse response) {

		HashMap<String,Object>	error = null;
		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error))
				return;
			cache		= new CacheManip(request);
			executive	= (Executive) request.getSession().getAttribute("executive");
			final var inValObj      		= new ValueObject();
			var      wayBillNumber 		= JSPUtility.GetString(request, "wayBillNumber", "");
			var        destinationCityId 	= 0L;
			var        destinationBranchId = JSPUtility.GetLong(request, "destBranchId", 0);
			final var        crossingAgentId 	= JSPUtility.GetLong(request, "crossingAgentId", 0);
			WayBillViewModel									wayBillViewModel		= null;
			WayBill												wayBill					= null;
			ValueObject											valueObject				= null;
			PendingDispatchStock								pdsModel				= null;
			ArrayList<PendingDispatchStockAritcleDetails>       pdsaDetailsList			= null;
			String												formTypeName			= null;

			if (destinationCityId == 0 && destinationBranchId == 0 && wayBillNumber == "") {
				destinationCityId   = (Long) request.getAttribute("destCityId");
				destinationBranchId = (Long) request.getAttribute("destBranchId");
				wayBillNumber       = (String) request.getAttribute("wayBillNumber");
			}

			if (executive.getAccountGroupId()== ECargoConstantFile.ACCOUNTGROUPID_LMT)
				//crossingRates = CrossingRatesDao.getInstance().getCrossingRates(executive.getAccountGroupId(), executive.getCityId(), executive.getBranchId(), destinationCityId, destinationBranchId, crossingAgentId);
				branchDispatchRates = RateMasterDao.getInstance().getDispatchRatesForBranch(executive.getBranchId());

			final var	executiveArr			= ExecutiveDao.getInstance().findByBranchId(executive.getBranchId());
			final var	exeIdArr				= new Long[executiveArr.length];

			for(var i = 0;i < executiveArr.length ; i++)
				exeIdArr[i] = executiveArr[i].getExecutiveId();

			final var	executiveStr			= Utility.GetLongArrayToString(exeIdArr);

			branch = cache.getGenericBranchDetailCache(request,destinationBranchId);
			destinationCityId =  branch.getCityId();
			request.setAttribute("destCityId", destinationCityId);
			request.setAttribute("destBranchId", destinationBranchId);
			request.setAttribute("crossingAgentId", crossingAgentId);

			city = cache.getCityById(request, executive.getCityId());
			request.setAttribute("srcCity", city.getName());

			request.setAttribute("srcBranch", branch.getName());
			request.setAttribute("wayBillNumber", wayBillNumber);
			//Routing Value set
			request.setAttribute("routingAllowed", request.getParameter("routing"));

			inValObj.put("isAgentBooking", (long)0);
			inValObj.put(AccountGroup.ACCOUNT_GROUP_ID, executive.getAccountGroupId());
			inValObj.put("statusFilter", 1);
			inValObj.put("Filter", (short)1);
			inValObj.put("sourceBranchId", executive.getBranchId());
			inValObj.put("executiveId", executive.getExecutiveId());
			inValObj.put("executiveStr", executiveStr);

			final var	minDateTimeStamp		= cache.getModuleWiseMinDateToGetData(request, executive.getAccountGroupId(),
					ModuleWiseMinDateSelectionConfigurationDTO.MANUAL_LOADING_SHEET_MIN_DATE_ALLOW,
					ModuleWiseMinDateSelectionConfigurationDTO.MANUAL_LOADING_SHEET_MIN_DATE);

			inValObj.put(AliasNameConstants.MIN_DATE_TIMESTAMP, minDateTimeStamp);

			final var outboundCargoBLL = new OutboundCargoBLL();
			ValueObject      outValObj  = null;
			final var	formTypesBLL			= new FormTypesBLL();

			var reportViewModel =new ReportViewModel();
			reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);
			request.setAttribute("ReportViewModel",reportViewModel);



			//if(branchIds == null || branchIds.length() <= 0) {
			final var 	branchIds = ""+JSPUtility.GetLong(request, "srcBranchId", 0);
			//}

			inValObj.put(AliasNameConstants.BRANCH_IDS, branchIds);

			if (StringUtils.isNotBlank(wayBillNumber)) {
				inValObj.put(AliasNameConstants.WAYBILL_NUMBER, wayBillNumber);
				inValObj.put("searchType", 1);
				outValObj = outboundCargoBLL.searchWayBillByWayBillNumber(inValObj);
			} else {

				inValObj.put("destBranchesString", ""+destinationBranchId);

				if (destinationBranchId != 0) {
					city      = cache.getCityById(request, destinationCityId);
					request.setAttribute("destCity", city.getName());
					branch = cache.getBranchById(request, executive.getAccountGroupId(), destinationCityId,destinationBranchId);
					request.setAttribute("destBranch", branch.getName());
				} else {
					city      = cache.getCityById(request, destinationCityId);
					request.setAttribute("destCity", city.getName());
				}
				outValObj = outboundCargoBLL.findPendingDispatchStockData(inValObj);
			}
			if(outValObj == null || outValObj != null && outValObj.getHtData().size() <= 0) {
				error.put("errorCode", CargoErrorList.NO_RECORDS);
				error.put("errorDescription", CargoErrorList.NO_RECORDS_DESCRIPTION);
				request.setAttribute("cargoError", error);
				request.setAttribute("nextPageToken", "success_"+executive.getAccountGroupId());
				return ;
			}

			final var  	pdsValObjectHM			= (LinkedHashMap<Long, ValueObject>)outValObj.get("pdsValObjectHM");
			final var	wayBillIdList 			= (ArrayList<Long>)outValObj.get("wayBillIdList");
			final var 	wayBillIds				= Utility.getStringFromArrayList(wayBillIdList);
			final var 	consignor 				= CustomerDetailsDao.getInstance().getConsignorDetailsByWayBillId(wayBillIds);
			final var 	consignee 				= CustomerDetailsDao.getInstance().getConsigneeDetailsByWayBillId(wayBillIds);
			final var 	consignmentSummary 		= ConsignmentSummaryDao.getInstance().getLimitedConsignmentDetails(wayBillIds);
			final var 	wayBillViewList			= new ArrayList<WayBillViewModel>();
			final var 	formTypesWithName		= formTypesBLL.getFormTypesWithName(wayBillIds);

			for(final Long key : pdsValObjectHM.keySet()) {
				valueObject = pdsValObjectHM.get(key);
				wayBill     		= (WayBill)valueObject.get("wayBill_" + key);
				pdsModel			= (PendingDispatchStock)valueObject.get("pdsModel_" + key);
				pdsaDetailsList		= (ArrayList<PendingDispatchStockAritcleDetails> )valueObject.get("pdsaDetailsList_" + key);
				formTypeName		= formTypesWithName.get(wayBill.getWayBillId());

				wayBillViewModel = populateWayBillViewModel(request, wayBill,pdsaDetailsList,consignor.get(wayBill.getWayBillId()) ,consignee.get(wayBill.getWayBillId()),consignmentSummary.get(wayBill.getWayBillId()), pdsModel, formTypeName);
				wayBillViewList.add(wayBillViewModel);
			}

			final var	wayBillViewArray		= new WayBillViewModel[wayBillViewList.size()];
			wayBillViewList.toArray(wayBillViewArray);
			request.setAttribute("BTWayBillsCollection", BranchTransferDao.getInstance().getWayBills(wayBillIds));
			request.setAttribute("wayBillViewList", wayBillViewArray);
			request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}
	}


	public WayBillViewModel populateWayBillViewModel(HttpServletRequest request, WayBill wayBill ,ArrayList<PendingDispatchStockAritcleDetails>  pdsaDetailsList ,CustomerDetails consignor ,CustomerDetails consignee ,ConsignmentSummary consignmentSummary, PendingDispatchStock  pdsModel, String formTypeName) throws Exception {

		PackingTypeMaster	packingTypeMaster	= null;

		final var wayBillViewModel = new WayBillViewModel();

		wayBillViewModel.setCreationDateTimeStamp(wayBill.getCreationDateTimeStamp());
		wayBillViewModel.setDestinationBranchId(wayBill.getDestinationBranchId());
		wayBillViewModel.setSourceBranchId(wayBill.getSourceBranchId());
		wayBillViewModel.setExecutiveId(wayBill.getExecutiveId());

		if(wayBill.getDestinationBranchId() > 0) {
			branch = cache.getGenericBranchDetailCache(request,wayBill.getDestinationBranchId());
			wayBillViewModel.setDestinationBranch(branch.getName());
		} else
			wayBillViewModel.setDestinationBranch(wayBill.getDeliveryPlace());

		branch	= cache.getGenericBranchDetailCache(request,wayBillViewModel.getSourceBranchId());
		wayBillViewModel.setSourceBranch(branch.getName());
		wayBillViewModel.setSourceSubRegionId(branch.getSubRegionId());

		var 	branchDetail	    = cache.getGenericBranchDetailCache(request, wayBill.getSourceBranchId());
		var  	subregionDetail		= cache.getGenericSubRegionById(request, branchDetail.getSubRegionId());
		wayBillViewModel.setSourceSubRegion(subregionDetail.getName());

		branchDetail		= null;
		subregionDetail 	= null;

		branchDetail     = cache.getGenericBranchDetailCache(request, wayBill.getDestinationBranchId());
		subregionDetail  = cache.getGenericSubRegionById(request, branchDetail.getSubRegionId());
		wayBillViewModel.setDestinationSubRegion(subregionDetail.getName());

		branch	= cache.getGenericBranchDetailCache(request,wayBillViewModel.getDestinationBranchId());
		wayBillViewModel.setDestinationBranch(branch.getName());
		wayBillViewModel.setDestinationSubRegionId(branch.getSubRegionId());

		wayBillViewModel.setStatusValue(WayBillStatusConstant.getStatus(wayBill.getStatus()));
		wayBillViewModel.setStatus(wayBill.getStatus());
		wayBillViewModel.setWayBillId(wayBill.getWayBillId());
		wayBillViewModel.setWayBillNumber(wayBill.getWayBillNumber());

		wayBillType = cache.getWayBillTypeById(request, wayBill.getWayBillTypeId());

		if(wayBill.isManual())
			wayBillViewModel.setWayBillType(wayBillType.getWayBillType()+WayBillType.WAYBILL_TYPE_MANUAL);
		else
			wayBillViewModel.setWayBillType(wayBillType.getWayBillType());

		wayBillViewModel.setWayBillTypeId(wayBill.getWayBillTypeId());
		wayBillViewModel.setRemark(wayBill.getRemark());
		wayBillViewModel.setGrandTotal(wayBill.getGrandTotal());
		wayBillViewModel.setConsignerName(consignor.getName());
		wayBillViewModel.setConsigneeName(consignee.getName());
		wayBillViewModel.setConsigneePhoneNo(consignee.getPhoneNumber());

		var   			totalQuantity  	= 0L;
		var			quantity		= 0L;
		final var 	pkgDetails 		= new StringBuilder();

		for(var i = 0; i < pdsaDetailsList.size(); i++) {
			quantity  			= pdsaDetailsList.get(i).getQuantity();
			packingTypeMaster 	= cache.getPackingTypeMasterById(request, pdsaDetailsList.get(i).getPackingTypeMasterId());

			if(i == 0)
				pkgDetails.append(quantity + " " + packingTypeMaster.getName());
			else
				pkgDetails.append("/ " + quantity + " " + packingTypeMaster.getName());

			totalQuantity += quantity;
		}

		wayBillViewModel.setTotalPackagesTypeQuantity(pkgDetails.toString());
		wayBillViewModel.setTotalQuantity(totalQuantity);
		wayBillViewModel.setTotalWeight(pdsModel.getPendingWeight());
		wayBillViewModel.setActualWeight(pdsModel.getPendingWeight());
		wayBillViewModel.setFormTypeName(formTypeName);
		wayBillViewModel.setDeliveryTo(consignmentSummary.getDeliveryTo());
		wayBillViewModel.setBranchId(wayBill.getBranchId());

		if(branchDispatchRates != null && branchDispatchRates.size() > 0 && consignmentSummary != null){
			final var chargedWt = consignmentSummary.getChargeWeight();

			if(branchDispatchRates.get(ChargeTypeMaster.NET_LOADING) != null)
				wayBillViewModel.setNetLoading(chargedWt * branchDispatchRates.get(ChargeTypeMaster.NET_LOADING));

			if(branchDispatchRates.get(ChargeTypeMaster.NET_UNLOADING) != null)
				wayBillViewModel.setNetUnloading(chargedWt * branchDispatchRates.get(ChargeTypeMaster.NET_UNLOADING));
		}
		return wayBillViewModel;
	}
}
