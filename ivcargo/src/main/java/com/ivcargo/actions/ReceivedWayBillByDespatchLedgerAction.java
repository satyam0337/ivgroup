package com.ivcargo.actions;

import java.util.HashMap;
import java.util.StringJoiner;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.ReceivablesBLL;
import com.framework.Action;
import com.iv.utils.constant.properties.ReceiveConfigurationPropertiesConstant;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.actions.transport.TransportReceivedWayBillAction;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.DispatchSummaryDao;
import com.platform.dto.Executive;
import com.platform.dto.model.WayBillReceivableModel;
import com.platform.resource.CargoErrorList;

public class ReceivedWayBillByDespatchLedgerAction implements Action {

	public static final String TRACE_ID  = "ReceivedWayBillByDespatchLedgerAction";

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {

		HashMap<String,Object>	 	error 					= null;
		Executive					executive				= null;
		WayBillReceivableModel[]	wayBillReceivableModels = null;
		StringJoiner				str						= null;
		String						waybillstr				= null;
		ValueObject					valueInObject			= null;
		ValueObject					valueOutObject			= null;
		CacheManip					cacheManip				= null;
		String						status					= null;
		long						dispatchLedgerId		= 0;
		long						dispatchLedgerWayBillCount= 0;

		try {

			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			executive					= (Executive) request.getSession().getAttribute("executive");
			dispatchLedgerId			= Long.parseLong(request.getParameter("DispatchLedgerId"));
			wayBillReceivableModels		= DispatchSummaryDao.getInstance().getReceivablesWaybillByDispatchLedger(dispatchLedgerId);
			dispatchLedgerWayBillCount	= wayBillReceivableModels.length;
			str							= new StringJoiner(",");

			for (final WayBillReceivableModel wayBillReceivableModel : wayBillReceivableModels)
				str.add(wayBillReceivableModel.getWayBillId() + "");

			waybillstr		= str.toString();
			valueInObject	= new ValueObject();
			valueOutObject	= new ValueObject();
			cacheManip		= new CacheManip(request);

			valueInObject.put("WayBillCount", wayBillReceivableModels.length);
			valueInObject.put("wayBillToReceived", waybillstr);
			valueInObject.put("DispatchLedgerWayBillCounter", dispatchLedgerWayBillCount);
			valueInObject.put("DispatchLedgerId", dispatchLedgerId);
			valueInObject.put("executive", executive);
			valueInObject.put(ReceiveConfigurationPropertiesConstant.RECEIVE_CONFIGUARTION, cacheManip.getReceiveConfiguration(request, executive.getAccountGroupId()));

			new TransportReceivedWayBillAction().setExtraData(request, cacheManip, valueInObject, executive);

			valueOutObject = ReceivablesBLL.getInstance().receivedWayBills(valueInObject);

			status = (String)valueOutObject.get("status");

			if ("success".equals(status)) {
				request.setAttribute("SuccessMessage", dispatchLedgerId);
				request.setAttribute("nextPageToken", "success");
			} else {
				error.put("errorCode", CargoErrorList.RECEIVE_ERROR);
				error.put("errorDescription", CargoErrorList.RECEIVE_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
				request.setAttribute("nextPageToken", "failure");
			}

			request.setAttribute("nextPageToken", "success");

		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		} finally {
			executive				= null;
			wayBillReceivableModels = null;
			str						= null;
			waybillstr				= null;
			valueInObject			= null;
			valueOutObject			= null;
			cacheManip				= null;
			status					= null;
		}
	}
}
