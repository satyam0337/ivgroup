package com.ivcargo.actions;

import java.util.ArrayList;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.constant.properties.UpdateBookingTypeConfigurationConstant;
import com.iv.constant.properties.UpdateDeliveryTypeConstant;
import com.iv.dto.constant.InfoForDeliveryConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.utils.CollectionUtility;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.DispatchSummaryDao;
import com.platform.dao.ReceivedSummaryDao;
import com.platform.dao.WayBillDao;
import com.platform.dto.configuration.modules.GroupConfigurationPropertiesDTO;
import com.platform.dto.constant.WayBillStatusConstant;
import com.platform.dto.constant.WayBillTypeConstant;
import com.platform.utils.Utility;


public class InitializeUpdateWayBillAction implements Action {

	@Override
	@SuppressWarnings("unchecked")
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String, Object>	error 					                = null;
		var					isDDDVOptionShow     	                = true;
		short				defaultDeliveryTo						= 0;
		var					cellId									= ""; // set from loading sheet module for delivery At
		var					flagForSrcSubRegion						= false;
		var					flagForDestBranch						= false;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	cache					= new CacheManip(request);
			final var	wayBillId				= Long.parseLong(request.getParameter("wayBillId"));
			final var	deliveryTo				= JSPUtility.GetShort(request, "deliveryTo",(short)1);
			final var	setDefaultDeliveryTo	= JSPUtility.GetBoolean(request, "setDefaultDeliveryTo",false);

			if(setDefaultDeliveryTo) {
				defaultDeliveryTo	= JSPUtility.GetShort(request, "defaultDeliveryTo",deliveryTo);
				cellId				= JSPUtility.GetString(request, "cellId","");
			}

			final var	executive		= cache.getExecutive(request);
			final var	vehicleType		= cache.getVehicleTypeForGroup(request, executive.getAccountGroupId());
			final var	redirectFilter	= request.getParameter("redirectFilter");

			final var waybill = WayBillDao.getInstance().getLimitedWayBillDataByBillId(wayBillId);

			final var	updateDeliveryTypeConfig 	= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.UPDATE_LR_DELIVERY_TO);
			final var	updateBookingTypeConfig 	= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.UPDATE_BOOKING_TYPE);
			final var	groupConfig				 = cache.getGroupConfiguration(request, executive.getAccountGroupId());
			final var	branchObj				 = cache.getBranchById(request, executive.getAccountGroupId(), waybill.getWayBillSrcBranchId());

			final var	deliveryToIdList = CollectionUtility.getShortListFromString((String) updateDeliveryTypeConfig.getOrDefault(UpdateDeliveryTypeConstant.DELIVERYTO_IDS, "0"));
			final var	deliveryToList	 =	new ArrayList<InfoForDeliveryConstant>();

			final var	validateBookingGodownDelvryForBranches = groupConfig.getBoolean(GroupConfigurationPropertiesDTO.VALIDATE_BOOKING_GODOWN_DELIVRY_FOR_BRANCHES,false);

			final var	subregionIdsForGodownDelvryList 	= CollectionUtility.getLongListFromString(groupConfig.getString(GroupConfigurationPropertiesDTO.SUBREGION_IDS_FOR_GODOWN_DELIVERY,null));
			final var	branchIdForGodownDelvryList 	  	= CollectionUtility.getLongListFromString(groupConfig.getString(GroupConfigurationPropertiesDTO.BRANCH_IDS_FOR_GODOWN_DELIVERY,null));

			final var	isReceiveCheck		 				= JSPUtility.GetBoolean(request, "isReceiveCheck", false);
			final var	showPassengerOptionOnlyForPaidLR	= (boolean) updateDeliveryTypeConfig.getOrDefault(UpdateDeliveryTypeConstant.SHOW_PASSENGER_OPTION_ONLY_FOR_PAID_LR, false);

			if(showPassengerOptionOnlyForPaidLR && waybill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_BOOKED && waybill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID)
				deliveryToIdList.forEach((final Short element) -> {
					final var	deliveryToUpdate = new InfoForDeliveryConstant();
					deliveryToUpdate.setDeliveryToId(element);
					deliveryToUpdate.setDeliveryToName(InfoForDeliveryConstant.getInfoForDelivery(element));
					deliveryToList.add(deliveryToUpdate);
				});
			else
				for (final Short element : deliveryToIdList)
					if(element != InfoForDeliveryConstant.DELIVERY_TO_PASSENGER_ID) {
						final var	deliveryToUpdate = new InfoForDeliveryConstant();
						deliveryToUpdate.setDeliveryToId(element);
						deliveryToUpdate.setDeliveryToName(InfoForDeliveryConstant.getInfoForDelivery(element));
						deliveryToList.add(deliveryToUpdate);
					}

			var	deliveryToArray	 = new InfoForDeliveryConstant[deliveryToList.size()];
			deliveryToArray  =  deliveryToList.toArray(deliveryToArray);

			if(isReceiveCheck) {
				final var	dispatchValueObject  = DispatchSummaryDao.getInstance().geDispacthLedgerIdfromWaybillId(wayBillId);

				if(dispatchValueObject != null && dispatchValueObject.get("dispatchLedgerId") != null) {
					final var	dispatchLedgerIdList = (ArrayList<Long>) dispatchValueObject.get("dispatchLedgerId");

					if(dispatchLedgerIdList != null && !dispatchLedgerIdList.isEmpty()){
						final var	dispatchLedgerIds 	 = Utility.GetLongArrayListToString(dispatchLedgerIdList);
						final var	wayBillIdsArr		 = DispatchSummaryDao.getInstance().getWayBillIdsByDispatchLedgerIds(dispatchLedgerIds);

						if(wayBillIdsArr != null && !wayBillIdsArr.isEmpty()){
							final var	receivedWayBillIdList 	= ReceivedSummaryDao.getInstance().getWayBillData(Utility.GetLongArrayListToString(wayBillIdsArr));

							if(receivedWayBillIdList != null && !receivedWayBillIdList.isEmpty())
								isDDDVOptionShow 	= false;
						}
					}
				}
			}

			if(waybill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DUEDELIVERED || waybill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DUEUNDELIVERED)
				isDDDVOptionShow 	= false;

			if(validateBookingGodownDelvryForBranches) {
				flagForSrcSubRegion = subregionIdsForGodownDelvryList != null && !subregionIdsForGodownDelvryList.isEmpty()
						&& subregionIdsForGodownDelvryList.contains(branchObj.getSubRegionId());

				flagForDestBranch = branchIdForGodownDelvryList != null && !branchIdForGodownDelvryList.isEmpty()
						&& branchIdForGodownDelvryList.contains(waybill.getDestBranchId());
			}

			request.setAttribute("vehicleType", vehicleType);
			request.setAttribute("wayBillId", wayBillId);
			request.setAttribute("nextPageToken", "success");
			request.setAttribute("isDDDVOptionShow", isDDDVOptionShow);
			request.setAttribute("deliveryToArray",deliveryToArray);
			request.setAttribute("deliveryTo",deliveryTo);
			request.setAttribute("setErrorMsg", (boolean) updateBookingTypeConfig.getOrDefault(UpdateBookingTypeConfigurationConstant.SHOW_ALERT_MESSAGE_FOR_RATE_CHANGE, false));

			if(setDefaultDeliveryTo) {
				request.setAttribute("defaultDeliveryTo",defaultDeliveryTo);
				request.setAttribute("setDefaultDeliveryTo",setDefaultDeliveryTo);
				request.setAttribute("cellId",cellId);
			}

			request.setAttribute("showPassengerOptionOnlyForPaidLR",showPassengerOptionOnlyForPaidLR);
			request.setAttribute("redirectFilter",redirectFilter);
			request.setAttribute("flagForDestBranch",flagForDestBranch);
			request.setAttribute("flagForSrcSubRegion",flagForSrcSubRegion);
			request.setAttribute("validateBookingGodownDelvryForBranches",validateBookingGodownDelvryForBranches);
			request.setAttribute("godownId",InfoForDeliveryConstant.DELIVERY_TO_BRANCH_ID);

		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}
	}

}
