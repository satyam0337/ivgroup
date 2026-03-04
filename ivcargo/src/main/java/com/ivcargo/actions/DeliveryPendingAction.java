package com.ivcargo.actions;

import java.util.ArrayList;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.DeliveryPendingBLL;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.Executive;

public class DeliveryPendingAction implements Action{

	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	error = null;
		CacheManip				cacheManip								= null;
		ArrayList<Long> 		transportList							= null;
		boolean 				transportSearchModuleForCargo			= false;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error))
				return;
			final long 	waybillId	= Long.parseLong(request.getParameter("wayBillId"));
			final String 	wayBillNo	= request.getParameter("wayBillNo");
			final String 	deliveryPendingString = request.getParameter("DeliveryPendingString");

			final Executive executive = (Executive) request.getSession().getAttribute("executive");

			cacheManip							= new CacheManip(request);
			transportList						= cacheManip.getTransportList(request);
			transportSearchModuleForCargo		= cacheManip.getTransportSearchModuleForCargo(request, executive.getAccountGroupId());

			final ValueObject valueInObject = new ValueObject();
			valueInObject.put("WayBillId", waybillId);
			valueInObject.put("WayBillNo", wayBillNo);
			valueInObject.put("executive", executive);
			valueInObject.put("DeliveryPendingString", deliveryPendingString);
			valueInObject.put("Remark", JSPUtility.GetString(request, "PendingDeliveryRemark", ""));

			final DeliveryPendingBLL deliveryPendingBLL = new DeliveryPendingBLL();
			final ValueObject valueOutObject = deliveryPendingBLL.insertData(valueInObject);

			if(valueOutObject != null && valueOutObject.get("status").equals("success")){
				if(transportList.contains(executive.getAccountGroupId()) || transportSearchModuleForCargo)
					response.sendRedirect("SearchWayBill.do?pageId=3&eventId=8&wayBillId=" + waybillId +"&doNotPrint=" + true);
				else
					response.sendRedirect("SearchWayBill.do?pageId=2&eventId=6&wayBillId=" + waybillId +"&doNotPrint=" + true);
			} else
				request.setAttribute("nextPageToken", "failure");
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}

	}
}