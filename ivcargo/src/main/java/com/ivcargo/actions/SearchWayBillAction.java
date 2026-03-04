package com.ivcargo.actions;

//~--- non-JDK imports --------------------------------------------------------

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.ObjectUtils;
import org.apache.commons.lang3.StringUtils;

import com.businesslogic.LRSearchBLL;
import com.businesslogic.utils.WayBillAccessibility;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.bll.impl.properties.DisplayDataConfigurationBllImpl;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.AliasNameConstants;
import com.platform.dto.ConfigParam;
import com.platform.dto.WayBill;
import com.platform.dto.configuration.master.DisplayDataConfigurationDTO;
import com.platform.dto.configuration.mindateselection.ModuleWiseMinDateSelectionConfigurationDTO;
import com.platform.dto.constant.WayBillStatusConstant;
import com.platform.dto.constant.WayBillTypeConstant;
import com.platform.dto.model.WayBillViewModel;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

public class SearchWayBillAction implements Action {

	public static final String TRACE_ID = SearchWayBillAction.class.getName();


	@SuppressWarnings("unchecked")
	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	error 	= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeSearchWayBillAction().execute(request, response);

			final var 			cacheManip 			= new CacheManip(request);

			final var executive = cacheManip.getExecutive(request);
			request.setAttribute("executive", executive);

			final var inValObj 			= new ValueObject();
			final var lrSearchBLL		= new LRSearchBLL();
			List<WayBillViewModel>     wayBillModel = null;
			final var 	destinationCityId	= JSPUtility.GetLong(request, "destinationCityId", 0);
			final var 	destinationBranchId = JSPUtility.GetLong(request, "destinationBranchId", 0);
			final var 	originCityId		= JSPUtility.GetLong(request, "originCityId", 0);
			final var 	originBranchId		= JSPUtility.GetLong(request, "sourceBranchId", 0);
			final var 	wayBillNumber 		= JSPUtility.GetString(request, "wayBillNumber", "");

			final var	branchesObj				= cacheManip.getGenericBranchesDetail(request);
			final var	searchConfiguration		= cacheManip.getSearchConfiguration(request, executive.getAccountGroupId());
			final var	subregionObj			= cacheManip.getAllSubRegions(request);
			final var	execFldPermissions 		= cacheManip.getExecutiveFieldPermission(request);

			inValObj.put("accountGroupId", executive.getAccountGroupId());

			final var	displayDataConfig			= cacheManip.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.DISPLAY_DATA_CONFIGURATION);

			final var lrSearchMinDate	= cacheManip.getModuleWiseMinDateToGetData(request, executive.getAccountGroupId(),
					ModuleWiseMinDateSelectionConfigurationDTO.LR_SEARCH_MIN_DATE_ALLOW,
					ModuleWiseMinDateSelectionConfigurationDTO.LR_SEARCH_MIN_DATE);

			//Get All Branches for origin City And Destination City
			final var 	displayDataIfUndelivered	= Utility.getBoolean(displayDataConfig.get(DisplayDataConfigurationDTO.DISPLAY_DATA_IF_UNDELIVERED));

			if (originCityId != 0)
				request.setAttribute("originCityBranches", cacheManip.getBothTypeOfBranchesDetails(request, Long.toString(executive.getAccountGroupId()), Long.toString(originCityId)));

			if (destinationCityId != 0)
				request.setAttribute("destCityBranches", cacheManip.getBothTypeOfBranchesDetails(request, Long.toString(executive.getAccountGroupId()), Long.toString(destinationCityId)));

			inValObj.put(AliasNameConstants.EXECUTIVE, executive);
			inValObj.put(AliasNameConstants.ALL_BRANCHES, branchesObj);
			inValObj.put(AliasNameConstants.ALL_SUB_REGIONS, subregionObj);
			inValObj.put(AliasNameConstants.EXEC_FEILD_PERMISSIONS, execFldPermissions);
			inValObj.put("deliveryLocationList", cacheManip.getAssignedLocationsIdListByLocationIdId(request, executive.getBranchId(), executive.getAccountGroupId()));
			inValObj.put(ModuleWiseMinDateSelectionConfigurationDTO.LR_SEARCH_MIN_DATE, lrSearchMinDate);

			if (StringUtils.isNotEmpty(wayBillNumber)) {
				inValObj.put("wayBillNumber", wayBillNumber);

				inValObj.put(AliasNameConstants.WAYBILL_NUMBER, wayBillNumber);
				inValObj.put(AliasNameConstants.WAYBILL_ID, 0);
				inValObj.put("showAllLRForSearch", true);

				final var	valOutObj 	= lrSearchBLL.searchAllWayBills(inValObj, displayDataConfig, searchConfiguration);

				if(valOutObj != null && valOutObj.containsKey("wayBillArray"))
					wayBillModel = (List<WayBillViewModel>) valOutObj.get("wayBillArray");
			} else {
				final var 	sdf      = new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");

				final var	fDate    = sdf.parse(JSPUtility.GetString(request, "FromDate", DateTimeUtility.getCurrentDateString("dd-MM-yyyy")) + " 00:00:00");
				final var	tDate    = sdf.parse(JSPUtility.GetString(request, "ToDate", DateTimeUtility.getCurrentDateString("dd-MM-yyyy")) + " 23:59:59");
				final var	status	 = JSPUtility.GetShort(request, "status", (short) 0);

				final var	fromDate = new Timestamp(fDate.getTime());
				final var	toDate   = new Timestamp(tDate.getTime());

				inValObj.put("sourceCityId", originCityId);
				inValObj.put("sourceBranchId", originBranchId);
				inValObj.put("destinationBranchId", destinationBranchId);
				inValObj.put("destinationCityId", destinationCityId);
				inValObj.put("fromDate", fromDate);
				inValObj.put("toDate", toDate);
				inValObj.put("status", status);

				wayBillModel = lrSearchBLL.searchWayBillByOriginAndDestination(inValObj, displayDataConfig, searchConfiguration);
			}

			if(ObjectUtils.isNotEmpty(wayBillModel)) {
				final List<Long>    	wayBillAccessibility	= new ArrayList<>();
				final var 	wayBill 				= new WayBill[wayBillModel.size()];

				final var configValue 				= cacheManip.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_DELIVERY_ACCESSIBILITY);
				final var assignedLocationIdList	= cacheManip.getAssignedLocationsIdListByLocationIdId(request, executive.getBranchId(), executive.getAccountGroupId());
				final var lrViewConfiguration		= cacheManip.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.LR_SEARCH);

				for (var i = 0; i < wayBillModel.size(); i++) {
					wayBill[i] 				= populateWayBill(request, wayBillModel.get(i), cacheManip);

					if(WayBillAccessibility.checkWayBillAccessibility(wayBill[i], executive, configValue, branchesObj, assignedLocationIdList, lrViewConfiguration))
						wayBillAccessibility.add(wayBillModel.get(i).getWayBillId());
				}

				if(wayBillModel.size() == 1) {
					final var flag = wayBillModel.get(0).getStatus() != WayBillStatusConstant.WAYBILL_STATUS_RECEIVED && wayBillModel.get(0).getStatus() != WayBillStatusConstant.WAYBILL_STATUS_DUEDELIVERED
							&& wayBillModel.get(0).getStatus() != WayBillStatusConstant.WAYBILL_STATUS_CANCELLED_DELIVERY && wayBillModel.get(0).getStatus() != WayBillStatusConstant.WAYBILL_STATUS_DUEUNDELIVERED
							&& wayBillModel.get(0).getStatus() != WayBillStatusConstant.WAYBILL_STATUS_CREDIT_DELIVERED || wayBillAccessibility.isEmpty() || !wayBillAccessibility.contains(wayBillModel.get(0).getWayBillId());

					final var	displayWayBill = !flag && displayDataIfUndelivered;

					final var	isDisplayData = DisplayDataConfigurationBllImpl.getInstance().isDisplayData(displayDataConfig, wayBillModel.get(0).getCreationDateTimeStamp(), displayWayBill, execFldPermissions, false, null);

					if(isDisplayData) {
						if(wayBillModel.get(0).getIsTceBooking() != null && Boolean.TRUE.equals(wayBillModel.get(0).getIsTceBooking()))
							response.sendRedirect("editWaybill.do?pageId=340&eventId=13&modulename=tceLRSearchDetails&masterid=" + wayBillModel.get(0).getWayBillId() + "&id=search");
						else
							response.sendRedirect("editWaybill.do?pageId=2&eventId=6&wayBillId=" + wayBillModel.get(0).getWayBillId() +"&id=search");
					} else {
						error.put("errorCode", CargoErrorList.NO_RECORDS);
						error.put("errorDescription", CargoErrorList.NO_RECORDS_DESCRIPTION);
						request.setAttribute("cargoError", error);
						request.setAttribute("nextPageToken", "success");
					}
				} else {
					request.setAttribute("WayBillAccessibility", wayBillAccessibility);
					request.setAttribute("wayBillViewList", wayBillModel);
					request.setAttribute("nextPageToken", "success");
				}
			} else {
				error.put("errorCode", CargoErrorList.NO_RECORDS);
				error.put("errorDescription", CargoErrorList.NO_RECORDS_DESCRIPTION);
				request.setAttribute("cargoError", error);
				request.setAttribute("nextPageToken", "success");
			}
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}
	}

	public WayBill populateWayBill(final HttpServletRequest request, final WayBillViewModel wayBillModel, final CacheManip cache) throws Exception {
		final var wayBill = new WayBill();

		var	 branch = cache.getGenericBranchDetailCache(request, wayBillModel.getDestinationBranchId());
		wayBill.setDestinationSubRegionId(branch.getSubRegionId());
		wayBill.setDestinationBranch(branch.getName());

		branch	 = cache.getGenericBranchDetailCache(request, wayBillModel.getSourceBranchId());

		wayBill.setSourceBranch(branch.getName());
		wayBill.setSourceSubRegionId(branch.getSubRegionId());

		var	subRegion = cache.getGenericSubRegionById(request, wayBill.getSourceSubRegionId());
		wayBill.setSourceSubRegion(subRegion.getName());

		subRegion = cache.getGenericSubRegionById(request, wayBill.getDestinationSubRegionId());
		wayBill.setDestinationSubRegion(subRegion.getName());

		if(wayBillModel.isManual())
			wayBill.setWayBillType(WayBillTypeConstant.getWayBillTypeNameByWayBilTypeId(wayBillModel.getWayBillTypeId()) + WayBillTypeConstant.WAYBILL_TYPE_MANUAL);
		else
			wayBill.setWayBillType(WayBillTypeConstant.getWayBillTypeNameByWayBilTypeId(wayBillModel.getWayBillTypeId()));

		wayBill.setCreationDateTimeStamp(wayBillModel.getCreationDateTimeStamp());
		wayBill.setStatus(wayBillModel.getStatus());
		wayBill.setWayBillId(wayBillModel.getWayBillId());
		wayBill.setWayBillNumber(wayBillModel.getWayBillNumber());
		wayBill.setAccountGroupId(wayBillModel.getAccountGroupId());
		wayBill.setBookedForAccountGroupId(wayBillModel.getBookedForAccountGroupId());
		wayBill.setWayBillTypeId(wayBillModel.getWayBillTypeId());
		wayBill.setBookingDateTime(wayBillModel.getBookingDateTimeStamp());
		wayBill.setSourceBranchId(wayBillModel.getSourceBranchId());
		wayBill.setDestinationBranchId(wayBillModel.getDestinationBranchId());
		wayBill.setBranchId(wayBillModel.getBranchId());
		wayBill.setDeliveryTypeId(wayBillModel.getDeliveryTypeId());

		wayBillModel.setSourceBranch(wayBill.getSourceBranch());
		wayBillModel.setDestinationBranch(wayBill.getDestinationBranch());
		wayBillModel.setSourceSubRegion(wayBill.getSourceSubRegion());
		wayBillModel.setDestinationSubRegion(wayBill.getDestinationSubRegion());
		wayBillModel.setWayBillType(wayBill.getWayBillType());

		return wayBill;
	}
}