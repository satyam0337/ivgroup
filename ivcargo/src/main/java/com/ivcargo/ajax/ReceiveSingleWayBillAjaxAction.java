/**
 *
 */
package com.ivcargo.ajax;

import java.io.PrintWriter;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONObject;

import com.businesslogic.ReceivablesBLL;
import com.framework.Action;
import com.iv.logsapp.LogWriter;
import com.iv.utils.constant.properties.ReceiveConfigurationPropertiesConstant;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actions.transport.TransportReceivedWayBillAction;
import com.ivcargo.utils.CacheManip;
import com.ivcargo.utils.JsonUtility;
import com.platform.dao.ReceivedSummaryDao;
import com.platform.dto.Executive;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

/**
 * @author admin
 *
 */
public class ReceiveSingleWayBillAjaxAction implements Action {

	private static final String TRACE_ID = "ReceiveSingleWayBillAjaxAction";

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		PrintWriter						out							= null;
		JSONObject						jsonObjectIn				= null;
		JSONObject						jsonObjectOut				= null;

		try {

			response.setContentType("application/json"); // Setting response for JSON Content

			out						= response.getWriter();
			jsonObjectOut			= new JSONObject();
			jsonObjectIn			= new JSONObject(request.getParameter("json"));

			if(request.getSession().getAttribute("executive") == null) {
				jsonObjectOut.put("errorDescription", "You have been logged out. Please login again.");
				out.println(jsonObjectOut);
				return;
			}

			out.println(receiveSingleWayBill(request, jsonObjectOut, jsonObjectIn));
		} catch (final Exception _e) {
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR,_e);
			try {
				jsonObjectOut.put("errorCode", CargoErrorList.SYSTEM_ERROR);
				jsonObjectOut.put("errorDescription", CargoErrorList.SYSTEM_ERROR_DESCRIPTION);
			} catch (final Exception e) {
				LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, ""+e);
				e.printStackTrace();
			}
			out.println(jsonObjectOut);
		} finally {
			out.flush();
			out.close();
			out							= null;
			jsonObjectIn				= null;
			jsonObjectOut				= null;
		}
	}

	private JSONObject receiveSingleWayBill(HttpServletRequest request, JSONObject jsonObjectOut, JSONObject jsonObjectIn) throws Exception {
		ValueObject 			valObjIn					= null;
		ValueObject 			valObjOut					= null;
		Executive 				executive 					= null;
		StringBuilder			wayBillIdToReceive			= null;
		ValueObject				valueInObject				= null;
		ValueObject				valueOutObject				= null;
		String					status						= null;
		String					wayBillNumber				= null;
		long					wayBillToReceivedAsLong		= 0;
		long					dispatchLedgerWayBillCount	= 0;
		long					dispatchLedgerId			= 0;
		boolean					isWayBillAllowForReceive	= true;
		CacheManip 				cache 						= null;

		try {

			cache 				= new CacheManip(request);

			valObjIn			= JsonUtility.convertJsontoValueObject(jsonObjectIn);
			valObjOut			= JsonUtility.convertJsontoValueObject(jsonObjectOut);

			executive 					= (Executive) request.getSession().getAttribute("executive");
			dispatchLedgerWayBillCount	= Utility.getLong(valObjIn.get("dispatchLedgerWayBillCount"));
			dispatchLedgerId			= Utility.getLong(valObjIn.get("dispatchLedgerId"));
			wayBillToReceivedAsLong		= Utility.getLong(valObjIn.get("WayBillId"));
			wayBillNumber				= valObjIn.get("wayBillNumber").toString();

			wayBillIdToReceive			= new StringBuilder();
			wayBillIdToReceive.append(wayBillToReceivedAsLong);

			isWayBillAllowForReceive	= ReceivedSummaryDao.getInstance().checkWayBillsForReceive(wayBillIdToReceive.toString(), dispatchLedgerId);

			if(isWayBillAllowForReceive) {

				valueInObject	= new ValueObject();
				valueOutObject	= new ValueObject();

				valueInObject.put("WayBillCount", 1);
				valueInObject.put("wayBillToReceived", wayBillToReceivedAsLong + "");
				valueInObject.put("DispatchLedgerWayBillCounter", dispatchLedgerWayBillCount);
				valueInObject.put("DispatchLedgerId", dispatchLedgerId);
				valueInObject.put("executive", executive);
				valueInObject.put(ReceiveConfigurationPropertiesConstant.RECEIVE_CONFIGUARTION, cache.getReceiveConfiguration(request, executive.getAccountGroupId()));

				new TransportReceivedWayBillAction().setExtraData(request, cache, valueInObject, executive);

				valueOutObject	= ReceivablesBLL.getInstance().receivedWayBills(valueInObject);
				status			= (String) valueOutObject.get("status");

				if("success".equals(status)) {
					valObjOut.put("wayBillId", wayBillToReceivedAsLong);
					valObjOut.put("wayBillNumber", wayBillNumber);
				} else {
					valObjOut.put("errorCode", CargoErrorList.RECEIVE_ERROR);
					valObjOut.put("errorDescription", CargoErrorList.RECEIVE_ERROR_DESCRIPTION);
				}
			} else {
				valObjOut.put("errorCode", CargoErrorList.DUPLICATE_RECEIVE_ERROR);
				valObjOut.put("errorDescription", CargoErrorList.DUPLICATE_RECEIVE_ERROR_DESCRIPTION );
			}

			final JSONObject object = JsonUtility.convertionToJsonObjectForResponse(valObjOut);
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO, object+"");
			return object;
		} catch (final Exception e) {
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, e);
			throw e;
		} finally {
			executive				= null;
			cache					= null;
			valObjIn				= null;
			valObjOut				= null;
		}
	}
}
