package com.ivcargo.actions;

import java.util.HashMap;
import java.util.Map;
import java.util.StringJoiner;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.ReceivablesBLL;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.utils.constant.properties.ReceiveConfigurationPropertiesConstant;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.actions.transport.TransportReceivedWayBillAction;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.ReceivedSummaryDao;
import com.platform.dto.Executive;
import com.platform.resource.CargoErrorList;
import com.platform.utils.TokenGenerator;

public class ReceivedWayBillAction implements Action{

	public static final String TRACE_ID  = "ReceivedWayBillAction";

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	 error 					= null;

		Executive				executive 				= null;
		StringJoiner			wayBillIdsForReceive 	= null;
		String[] 				wayBillToReceived		= null;
		HashMap<Long,Long>		wbGodowns				= null;
		HashMap<Long,String>	wbRemarks				= null;
		CacheManip				cacheManip				= null;
		Long[]					wayBill					= null;
		String					status					= null;
		ValueObject				valueInObject			= null;
		ValueObject				valueOutObject			= null;
		boolean					isWayBillAllowForReceive = true;
		boolean	isGodownTransfer		= false;
		long	dispatchLedgerWBCount 	= 0;
		long	dispatchLedgerId 		= 0;
		long	noOfPackages 			= 0;
		Map<Object, Object>		receiveConfig			= null;
		boolean					tokenWiseCheckingForDuplicateTransaction			= false;
		String					token												= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error))
				return;

			executive 				= (Executive) request.getSession().getAttribute("executive");
			wayBillIdsForReceive 	= new StringJoiner(",");
			isGodownTransfer		= JSPUtility.GetBoolean(request, "isGodownTransfer", false);
			wayBillToReceived		= request.getParameterValues("wayBills");
			dispatchLedgerWBCount 	= Long.parseLong(request.getParameter("DispatchLedgerCount"));
			dispatchLedgerId 		= Long.parseLong(request.getParameter("DispatchLedgerId"));
			noOfPackages 			= Long.parseLong(request.getParameter("noOfPackages"));
			token					= JSPUtility.GetString(request, "token", "");
			wbGodowns				= isGodownTransfer ? new HashMap<>(): null;
			wbRemarks				= isGodownTransfer ? new HashMap<>(): null;
			cacheManip				= new CacheManip(request);
			wayBill					= new Long[wayBillToReceived.length];

			for(int i = 0; i < wayBillToReceived.length ; i++) {
				wayBill[i]	= Long.parseLong(wayBillToReceived[i]);
				wayBillIdsForReceive.add(wayBillToReceived[i]);

				if(wbGodowns != null)
					wbGodowns.put(wayBill[i], JSPUtility.GetLong(request, "godownId_"+wayBill[i]));

				if(wbRemarks != null)
					wbRemarks.put(wayBill[i], JSPUtility.GetString(request, "remark_"+wayBill[i]));
			}

			receiveConfig							= cacheManip.getReceiveConfiguration(request, executive.getAccountGroupId());
			tokenWiseCheckingForDuplicateTransaction= (Boolean) receiveConfig.getOrDefault(ReceiveConfigurationPropertiesConstant.TOKEN_WISE_CHECKING_FOR_DUPLICATE_TRANSACTION, false);

			isWayBillAllowForReceive	= ReceivedSummaryDao.getInstance().checkWayBillsForReceive(wayBillIdsForReceive.toString(), dispatchLedgerId);

			// Check if any of the wayBills already Received
			if(isWayBillAllowForReceive) {

				valueInObject	= new ValueObject();
				valueOutObject	= new ValueObject();

				valueInObject.put("WayBillCount", wayBill.length);
				valueInObject.put("wayBillToReceived", wayBillIdsForReceive.toString());
				valueInObject.put("DispatchLedgerWayBillCounter", dispatchLedgerWBCount);
				valueInObject.put("DispatchLedgerId", dispatchLedgerId);
				valueInObject.put("isGodownTransfer", isGodownTransfer);
				valueInObject.put("wbGodowns", wbGodowns);
				valueInObject.put("wbRemarks", wbRemarks);
				valueInObject.put("executive", executive);
				valueInObject.put(ReceiveConfigurationPropertiesConstant.RECEIVE_CONFIGUARTION, receiveConfig);

				new TransportReceivedWayBillAction().setExtraData(request, cacheManip, valueInObject, executive);

				if(tokenWiseCheckingForDuplicateTransaction) {
					if(token == null || !token.equals(request.getSession().getAttribute(TokenGenerator.RECEIVE_TOKEN_KEY))) {
						error.put("errorCode", CargoErrorList.RECEIVE_ERROR);
						error.put("errorDescription", "Request already submitted, please wait!");
						request.setAttribute("cargoError", error);
						request.setAttribute("nextPageToken", "failure");
						return;
					}
					request.getSession().setAttribute(TokenGenerator.RECEIVE_TOKEN_KEY, null);
				}

				valueOutObject = ReceivablesBLL.getInstance().receivedWayBills(valueInObject);

				status = (String)valueOutObject.get("status");

				if ("success".equals(status)) {
					request.setAttribute("SuccessMessage", dispatchLedgerId);
					request.setAttribute("noOfPackages", noOfPackages);
					request.setAttribute("SelectedWayBill", wayBill.length);
					request.setAttribute("LSNo", valueOutObject.get("LSNo"));
					request.setAttribute("DispatchLedgerTotalWayBill", dispatchLedgerWBCount);
					request.setAttribute("noOfPackagesOfSelectedWayBills", Long.parseLong(valueOutObject.get("noOfPackagesOfSelectedWayBills").toString()));
					request.setAttribute("nextPageToken", "success");

				} else {
					error.put("errorCode", CargoErrorList.RECEIVE_ERROR);
					error.put("errorDescription", CargoErrorList.RECEIVE_ERROR_DESCRIPTION);
					request.setAttribute("cargoError", error);
					request.setAttribute("nextPageToken", "failure");
				}
			} else {
				error.put("errorCode", CargoErrorList.DUPLICATE_RECEIVE_ERROR);
				error.put("errorDescription", CargoErrorList.DUPLICATE_RECEIVE_ERROR_DESCRIPTION );
				request.setAttribute("cargoError", error);
				request.setAttribute("nextPageToken", "failure");
			}
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		} finally {
			executive 				= null;
			wayBillIdsForReceive 	= null;
			wayBillToReceived		= null;
			wbGodowns				= null;
			wbRemarks				= null;
			cacheManip				= null;
			wayBill					= null;
			status					= null;
			valueInObject			= null;
			valueOutObject			= null;
		}
	}
}
