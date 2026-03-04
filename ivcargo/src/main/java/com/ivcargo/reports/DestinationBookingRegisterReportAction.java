package com.ivcargo.reports;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.DestinatinBookingRegisterReportBLL;
import com.framework.Action;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionInstanceUtil;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.CustomGroupMapper;

public class DestinationBookingRegisterReportAction implements Action {

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>				error 						= 	null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeDestinationBookingRegisterReportAction().execute(request, response);

			final var	destinatinBookingRegisterReportBLL	= new DestinatinBookingRegisterReportBLL();
			final var	valInObj 	= new ValueObject();
			final var	actionUtil2 = new ActionInstanceUtil();
			final var	cacheManip	= new CacheManip(request);
			final var	executive   = cacheManip.getExecutive(request);

			final var	valObjSelection = actionUtil2.reportSelection(request, executive);
			final var	branchId 		= (Long)valObjSelection.get("branchId");

			request.setAttribute("agentName", executive.getName());

			final var	deliveryLocationList   = cacheManip.getAssignedLocationsIdListByLocationIdId(request,branchId, executive.getAccountGroupId());

			if(deliveryLocationList != null && deliveryLocationList.size() <= 0)
				deliveryLocationList.add(branchId);

			valInObj.put("branchId", branchId);
			valInObj.put("executive", executive);
			valInObj.put("branchesColl", cacheManip.getGenericBranchesDetail(request));
			valInObj.put("deliveryLocationList", deliveryLocationList);

			final var	valObj = destinatinBookingRegisterReportBLL.getDestinationBookingRegisterDetails(valInObj);

			if(valObj == null) {
				ActionStaticUtil.setRequestAttribute(request, ActionStaticUtil.NO_RECORDS_FOUND, true);
				return;
			}

			ActionStaticUtil.setRequestAttribute(request, "DestinationBookingRegisterModel", valObj.get("DestinationBookingRegisterModel"));
			ActionStaticUtil.setRequestAttribute(request,"customAddressBranchId", branchId);
			ActionStaticUtil.setRequestAttribute(request,"customAddressIdentifer", CustomGroupMapper.IDENTIFIER_BOOKING);

			if (valObj.get("accountGroupNameForPrint")!= null&& valObj.get("chargesAllowedToView")!= null)
				request.setAttribute("chargesAllowedToView",valObj.get("chargesAllowedToView"));

			ActionStaticUtil.setReportViewModel(request);
			ActionStaticUtil.setNextPageToken(request, ActionStaticUtil.SUCCESS);
		} catch (final Exception _e) {
			ActionStaticUtil.catchActionException(request, _e, error);
		}
	}
}