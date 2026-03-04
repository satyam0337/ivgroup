package com.ivcargo.reports;

//~--- non-JDK imports --------------------------------------------------------

import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.dto.constant.InfoForDeliveryConstant;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;

public class InitializeToPayDoorGodownStockReportAction implements Action {

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>				error							= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	cacheManip	= new CacheManip(request);

			final var	executive 	= cacheManip.getExecutive(request);

			request.setAttribute("wayBillType", cacheManip.getAllWayBillType(request));

			final Map<Short, String>	deliveryTypeHM	= new HashMap<>();

			deliveryTypeHM.put(InfoForDeliveryConstant.DELIVERY_TO_BRANCH_ID, InfoForDeliveryConstant.DELIVERY_TO_BRANCH_NAME);
			deliveryTypeHM.put(InfoForDeliveryConstant.DELIVERY_TO_DOOR_ID, InfoForDeliveryConstant.DELIVERY_TO_DOOR_NAME);
			deliveryTypeHM.put(InfoForDeliveryConstant.DIRECT_DELIVERY_DIRECT_VASULI_ID, InfoForDeliveryConstant.DIRECT_DELIVERY_DIRECT_VASULI_NAME);
			deliveryTypeHM.put(InfoForDeliveryConstant.DELIVERY_TO_TRUCK_DELIVERY_ID, InfoForDeliveryConstant.DELIVERY_TO_TRUCK_DELIVERY_NAME);

			request.setAttribute(ActionStaticUtil.IS_ALL_REGION_NEED_TO_SHOW, false);
			request.setAttribute(ActionStaticUtil.IS_ALL_AREA_NEED_TO_SHOW, true);
			request.setAttribute(ActionStaticUtil.IS_ALL_BRANCHES_NEED_TO_SHOW, true);
			request.setAttribute("deliveryTypeHM", deliveryTypeHM);

			request.setAttribute(ActionStaticUtil.IS_BOTH_TYPE_BRANCHES_NEEDED,false);
			ActionStepsUtil.setInitializeBranchesSelectionInRequest(request, executive);
			ActionStepsUtil.setExecutiveCoreReportPermissionsInRequest(request, executive);
			ActionStaticUtil.setExecutiveTypeBooleanInRequest(request, executive, true);
			ActionStaticUtil.setNextPageToken(request, ActionStaticUtil.SUCCESS);
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}
}