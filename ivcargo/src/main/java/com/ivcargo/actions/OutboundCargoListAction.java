package com.ivcargo.actions;

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
import com.businesslogic.waybill.WayBillViewModelBLL;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.reports.ReportView;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.BranchTransferDao;
import com.platform.dao.CustomerDetailsDao;
import com.platform.dto.AccountGroup;
import com.platform.dto.AliasNameConstants;
import com.platform.dto.Branch;
import com.platform.dto.CustomerDetails;
import com.platform.dto.Executive;
import com.platform.dto.PackingTypeMaster;
import com.platform.dto.PendingDispatchStock;
import com.platform.dto.PendingDispatchStockAritcleDetails;
import com.platform.dto.SubRegion;
import com.platform.dto.TransportCommonMaster;
import com.platform.dto.WayBill;
import com.platform.dto.WayBillType;
import com.platform.dto.configuration.mindateselection.ModuleWiseMinDateSelectionConfigurationDTO;
import com.platform.dto.configuration.modules.LsConfigurationDTO;
import com.platform.dto.constant.WayBillStatusConstant;
import com.platform.dto.model.ReportViewModel;
import com.platform.dto.model.WayBillViewModel;
import com.platform.resource.CargoErrorList;
import com.platform.utils.PropertiesUtility;
import com.platform.utils.Utility;

public class OutboundCargoListAction implements Action {

	public static final String TRACE_ID = OutboundCargoListAction.class.getName();
	CacheManip			cache 			 = null;
	ValueObject   branches	= null;
	ValueObject	subRegions	= null;
	ValueObject packingTypeMasterObj = null;

	@Override
	@SuppressWarnings("unchecked")
	public void execute(HttpServletRequest request, HttpServletResponse response) {

		HashMap<String,Object>	 							error 					= null;
		Executive 											executive		 		= null;
		ValueObject 										inValObj      			= null;
		String      										wayBillNumber 			= null;
		OutboundCargoBLL 									outboundCargoBLL 		= null;
		ValueObject      									outValObj  				= null;
		ReportViewModel 									reportViewModel 		= null;
		HashMap<Long, CustomerDetails> 						consignor 				= null;
		HashMap<Long, CustomerDetails> 						consignee 				= null;
		WayBill        										wayBill       			= null;
		ArrayList<WayBillViewModel>							wayBillViewArrList 		= null;
		String 												branchIds				= null;
		String 												wayBillIds 				= null;
		ValueObject											lsConfiguration			= null;
		List<WayBillViewModel>  							wayBillViewModelList	= null;
		WayBillViewModelBLL									wayBillViewModelBLL		= null;
		ArrayList<Long>										wayBillIdList 			= null;
		WayBillViewModel[]									wayBillViewArray		= null;
		WayBillViewModel									wayBillViewModel		= null;
		Branch 												branch			 		= null;
		ValueObject											valueObject				= null;
		PendingDispatchStock								pdsModel				= null;
		LinkedHashMap<Long, ValueObject>  					pdsValObjectHM			= null;
		ArrayList<PendingDispatchStockAritcleDetails>       pdsaDetailsList			= null;
		Timestamp											minDateTimeStamp		= null;
		var												destinationCityId 		= 0L;
		var												destinationBranchId 	= 0L;
		var												showAstrikForEwayBillLrs	= false;
		var													showPrivateMark				= false;


		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request, error))
				return;

			cache 				= new CacheManip(request);
			executive			= cache.getExecutive(request);
			branches    		= cache.getGenericBranchesDetail(request);
			packingTypeMasterObj= cache.getPackingTypeMasterData(request);
			subRegions			= cache.getAllSubRegions(request);
			inValObj      			= new ValueObject();
			wayBillNumber 			= JSPUtility.GetString(request, "wayBillNumber", "");
			destinationCityId 		= JSPUtility.GetLong(request, "destCityId", 0);
			destinationBranchId 	= JSPUtility.GetLong(request, "destBranchId", 0);
			lsConfiguration			= cache.getLsConfiguration(request, executive.getAccountGroupId());
			wayBillViewModelBLL		= new WayBillViewModelBLL();

			showAstrikForEwayBillLrs 		= lsConfiguration.getBoolean(LsConfigurationDTO.SHOW_ASTRIK_FOR_EWAY_BILL_LRS);
			showPrivateMark					= lsConfiguration.getBoolean(LsConfigurationDTO.SHOW_PRIVATE_MARK);

			request.setAttribute("destBranchId", destinationBranchId);
			request.setAttribute(LsConfigurationDTO.SHOW_ASTRIK_FOR_EWAY_BILL_LRS, showAstrikForEwayBillLrs);
			request.setAttribute(LsConfigurationDTO.SHOW_PRIVATE_MARK, showPrivateMark);

			branch = (Branch) branches.get(executive.getBranchId() + "");
			request.setAttribute("srcBranch", branch.getName());

			request.setAttribute("wayBillNumber", wayBillNumber);
			//Routing Value set
			request.setAttribute("routingAllowed", request.getParameter("routing"));

			inValObj.put("isAgentBooking", (long)0);
			inValObj.put(AccountGroup.ACCOUNT_GROUP_ID, executive.getAccountGroupId());
			inValObj.put("statusFilter", 1);
			inValObj.put("Filter", (short)2);
			inValObj.put("sourceBranchId", executive.getBranchId());
			inValObj.put("executiveId", executive.getExecutiveId());

			minDateTimeStamp		= cache.getModuleWiseMinDateToGetData(request, executive.getAccountGroupId(),
					ModuleWiseMinDateSelectionConfigurationDTO.DISPATCH_MIN_DATE_ALLOW,
					ModuleWiseMinDateSelectionConfigurationDTO.DISPATCH_MIN_DATE);

			inValObj.put(AliasNameConstants.MIN_DATE_TIMESTAMP, minDateTimeStamp);

			outboundCargoBLL = new OutboundCargoBLL();

			reportViewModel = new ReportViewModel();
			reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);
			request.setAttribute("ReportViewModel",reportViewModel);

			branchIds	= cache.getBranchesString(request, executive.getAccountGroupId(), executive.getBranchId());

			if(branchIds == null || branchIds.isEmpty())
				branchIds = ""+executive.getBranchId();

			inValObj.put(AliasNameConstants.BRANCH_IDS, branchIds);

			if (wayBillNumber != null && !"".equals(wayBillNumber)) {
				inValObj.put(AliasNameConstants.WAYBILL_NUMBER, wayBillNumber);
				inValObj.put("searchType", 1);
				outValObj = outboundCargoBLL.searchWayBillByWayBillNumber(inValObj);
			} else {
				if(destinationCityId == -1 && destinationBranchId == -1)
					inValObj.put("destBranchesString", ""+cache.getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_GROUP, executive.getAccountGroupId()));
				else if (destinationBranchId != 0)
					inValObj.put("destBranchesString", ""+destinationBranchId);
				else
					inValObj.put("destBranchesString", ""+cache.getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_CITY, destinationCityId));

				if (destinationBranchId > 0) {
					request.setAttribute("destCity", cache.getCityById(request, destinationCityId).getName());
					branch = (Branch) branches.get(destinationBranchId + "");
					request.setAttribute("destBranch", branch.getName());
				} else if (destinationCityId > 0)
					request.setAttribute("destCity", cache.getCityById(request, destinationCityId).getName());

				outValObj = outboundCargoBLL.findPendingDispatchStockData(inValObj);
			}

			if(outValObj == null || outValObj != null && outValObj.size() <= 0) {
				error.put("errorCode", CargoErrorList.NO_RECORDS);
				error.put("errorDescription", CargoErrorList.NO_RECORDS_DESCRIPTION);
				request.setAttribute("cargoError", error);
				request.setAttribute("nextPageToken", "success");
				return ;
			}

			pdsValObjectHM      = (LinkedHashMap<Long, ValueObject>)outValObj.get("pdsValObjectHM");
			wayBillIdList		= (ArrayList<Long>)outValObj.get("wayBillIdList");
			wayBillIds	  		= Utility.getStringFromArrayList(wayBillIdList);
			consignor 			= CustomerDetailsDao.getInstance().getConsignorDetailsByWayBillId(wayBillIds);
			consignee 			= CustomerDetailsDao.getInstance().getConsigneeDetailsByWayBillId(wayBillIds);
			wayBillViewArrList  = new ArrayList<>();

			for(final Map.Entry<Long, ValueObject> entry : pdsValObjectHM.entrySet()) {
				valueObject 		= entry.getValue();
				wayBill     		= (WayBill)valueObject.get("wayBill_" + entry.getKey());
				pdsModel			= (PendingDispatchStock)valueObject.get("pdsModel_" + entry.getKey());
				pdsaDetailsList		= (ArrayList<PendingDispatchStockAritcleDetails>) valueObject.get("pdsaDetailsList_" + entry.getKey());

				wayBillViewModel = populateWayBillViewModel(request, wayBill, pdsaDetailsList, consignor.get(wayBill.getWayBillId()), consignee.get(wayBill.getWayBillId()), pdsModel, lsConfiguration);

				wayBillViewArrList.add(wayBillViewModel);
			}

			if(!wayBillViewArrList.isEmpty()) {
				wayBillViewArray = new WayBillViewModel[wayBillViewArrList.size()];
				wayBillViewArrList.toArray(wayBillViewArray);

				request.setAttribute("BTWayBillsCollection", BranchTransferDao.getInstance().getWayBills(wayBillIds));
				request.setAttribute("wayBillViewList", wayBillViewArray);

				wayBillViewModelList		= wayBillViewModelBLL.getWayBillViewModelListInSortedOrder(lsConfiguration, wayBillViewArray);

				request.setAttribute("wayBillViewModelList", wayBillViewModelList);
			} else {
				error.put("errorCode", CargoErrorList.NO_RECORDS);
				error.put("errorDescription", CargoErrorList.NO_RECORDS_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}

			request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		} finally {
			inValObj      		= null;
			wayBillNumber 		= null;
			outboundCargoBLL 	= null;
			outValObj  			= null;
			reportViewModel 	= null;
			consignor 			= null;
			consignee 			= null;
			wayBill       		= null;
			branchIds			= null;
			wayBillIds 			= null;
			wayBillViewModel 	= null;
			wayBillViewArrList 	= null;
		}
	}

	public WayBillViewModel populateWayBillViewModel(HttpServletRequest request, WayBill wayBill ,ArrayList<PendingDispatchStockAritcleDetails>       pdsaDetailsList ,CustomerDetails consignor ,CustomerDetails consignee, PendingDispatchStock  pdsModel, ValueObject lsConfiguration) throws Exception {

		boolean			showBkgDateOnDispatch;
		SubRegion		subRegion;
		Branch 			branch;

		showBkgDateOnDispatch	= PropertiesUtility.isAllow(lsConfiguration.getString(LsConfigurationDTO.SHOW_BKG_DATE_ON_DISPATCH));

		final var wayBillViewModel = new WayBillViewModel();

		if(showBkgDateOnDispatch)
			wayBillViewModel.setCreationDateTimeStamp(wayBill.getBookingDateTime());
		else
			wayBillViewModel.setCreationDateTimeStamp(wayBill.getCreationDateTimeStamp());

		wayBillViewModel.setExecutiveId(wayBill.getExecutiveId());
		wayBillViewModel.setDestinationBranchId(wayBill.getDestinationBranchId());

		branch 		= (Branch) branches.get(wayBill.getDestinationBranchId() + "");
		subRegion	= (SubRegion) subRegions.get(branch.getSubRegionId());

		wayBillViewModel.setDestinationBranch(branch.getName());
		wayBillViewModel.setDestinationSubRegionId(branch.getSubRegionId());
		wayBillViewModel.setDestinationSubRegion(subRegion.getName());

		branch 		= (Branch) branches.get(wayBill.getSourceBranchId() + "");
		subRegion	= (SubRegion) subRegions.get(branch.getSubRegionId());

		wayBillViewModel.setSourceBranch(branch.getName());
		wayBillViewModel.setSourceSubRegionId(branch.getSubRegionId());
		wayBillViewModel.setSourceSubRegion(subRegion.getName());
		wayBillViewModel.setStatusValue(WayBillStatusConstant.getStatus(wayBill.getStatus()));
		wayBillViewModel.setStatus(wayBill.getStatus());
		wayBillViewModel.setWayBillId(wayBill.getWayBillId());
		wayBillViewModel.setWayBillNumber(wayBill.getWayBillNumber());

		final var wayBillType = cache.getWayBillTypeById(request, wayBill.getWayBillTypeId());

		if(wayBill.isManual())
			wayBillViewModel.setWayBillType(wayBillType.getWayBillType()+WayBillType.WAYBILL_TYPE_MANUAL);
		else
			wayBillViewModel.setWayBillType(wayBillType.getWayBillType());

		wayBillViewModel.setRemark(wayBill.getRemark());
		wayBillViewModel.setGrandTotal(wayBill.getGrandTotal());
		wayBillViewModel.setConsignerName(consignor.getName());
		wayBillViewModel.setConsigneeName(consignee.getName());
		wayBillViewModel.setConsigneePhoneNo(consignee.getPhoneNumber());
		wayBillViewModel.setFormTypeId(wayBill.getFormTypeId());
		wayBillViewModel.setEwayBillNumber(wayBill.geteWayBillNumber());

		if(wayBill.getConsignmentSummaryPrivateMark() != null)
			wayBillViewModel.setPrivateMarka(wayBill.getConsignmentSummaryPrivateMark());

		var   				totalQuantity   	= 0L;
		final var 	packageDetails 		= new StringJoiner("/ ");
		var				quantity			= 0L;
		PackingTypeMaster	packingTypeMaster 	= null;

		for (final PendingDispatchStockAritcleDetails element : pdsaDetailsList) {
			quantity  			= element.getQuantity();
			packingTypeMaster	= (PackingTypeMaster) packingTypeMasterObj.get("" + element.getPackingTypeMasterId());
			packageDetails.add(quantity + " " + packingTypeMaster.getName());
			totalQuantity += quantity;
		}

		wayBillViewModel.setTotalWeight(pdsModel.getPendingWeight());
		wayBillViewModel.setActualWeight(pdsModel.getPendingWeight());
		wayBillViewModel.setPackageDetails(packageDetails.toString());
		wayBillViewModel.setTotalQuantity(totalQuantity);
		wayBillViewModel.setBookedForAccountGroupId(wayBill.getBookedForAccountGroupId());
		wayBillViewModel.setBranchId(wayBill.getBranchId());

		return wayBillViewModel;
	}
}