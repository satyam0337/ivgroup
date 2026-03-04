/**
 *
 */
package com.ivcargo.ajax;

import java.io.PrintWriter;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONObject;

import com.businesslogic.DispatchBLL;
import com.framework.Action;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.exception.ExceptionProcess;
import com.ivcargo.utils.JsonUtility;
import com.platform.dao.reports.CrossingAgentBillClearanceDAO;
import com.platform.dao.reports.CrossingAgentBillDAO;
import com.platform.dto.AliasNameConstants;
import com.platform.dto.CrossingAgentBill;
import com.platform.dto.CrossingAgentBillClearance;
import com.platform.dto.DeliveryRunSheet;
import com.platform.dto.Executive;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Converter;

/**
 * @author Anant Chaudhary	07-10-2016
 *
 */
public class TransportDispatchSuccessAjaxAction implements Action {

	private static final String TRACE_ID = TransportDispatchSuccessAjaxAction.class.getName();

	/* (non-Javadoc)
	 * @see com.framework.Action#execute(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
	 */
	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		PrintWriter		out				= null;
		JSONObject		jsonObjectIn	= null;
		JSONObject		jsonObjectOut	= null;

		try {
			response.setContentType("application/json"); // Setting response for JSON Content
			out				= response.getWriter();
			jsonObjectIn	= new JSONObject(request.getParameter("json"));

			if(request.getSession().getAttribute(AliasNameConstants.EXECUTIVE) == null) {
				jsonObjectOut			= new JSONObject();
				jsonObjectOut.put("errorDescription", "You have been logged out. Please login again.");
				out.println(jsonObjectOut);
				return;
			}

			out.println(loadTransportSuccessPage(request, jsonObjectIn));
		} catch (final Exception e) {
			try {
				jsonObjectOut	= JsonUtility.setError(CargoErrorList.SYSTEM_ERROR, CargoErrorList.SYSTEM_ERROR_DESCRIPTION);
			} catch (final Exception e1) {
				e.printStackTrace();
			}
			out.println(jsonObjectOut);
		} finally {
			if (out != null) {
				out.flush();
				out.close();
			}
			out							= null;
			jsonObjectIn				= null;
			jsonObjectOut				= null;
		}
	}

	private JSONObject loadTransportSuccessPage(HttpServletRequest request, JSONObject jsonObjectIn) throws Exception {
		ValueObject					valueObjectIn				= null;
		ValueObject					valueObjectOut				= null;
		Executive					executive					= null;
		long						dispatchLedgerId			= 0;
		DispatchBLL					dispatchBLL					= null;
		DeliveryRunSheet[]			deliveryRunSheets			= null;
		CrossingAgentBillClearance	crossingAgentBillClearance	= null;
		CrossingAgentBill			crossingAgentBill			= null;

		try {
			valueObjectOut	= new ValueObject();

			valueObjectIn	= JsonUtility.convertJsontoValueObject(jsonObjectIn);

			executive		= (Executive) request.getSession().getAttribute(AliasNameConstants.EXECUTIVE);

			if (valueObjectIn.get("dispatchLedgerId") != null && valueObjectIn.get("type") != null) {
				dispatchLedgerId	= valueObjectIn.getLong("dispatchLedgerId", 0);

				valueObjectOut.put("dispatchLedgerId", dispatchLedgerId);
				valueObjectOut.put("Type", valueObjectIn.get("type").toString());

				if(valueObjectIn.get("isCrossingFlow") != null && valueObjectIn.getLong("isCrossingFlow", 0) == 1) {
					dispatchBLL 		= new DispatchBLL();
					deliveryRunSheets	= dispatchBLL.createModelForPrint(valueObjectIn.getLong("dispatchLedgerId", 0), (short)0);

					valueObjectOut.put("Waybills", Converter.arrayDtotoArrayListWithHashMapConversion(deliveryRunSheets));
				}
			}

			crossingAgentBillClearance 	= CrossingAgentBillClearanceDAO.getInstance().getCrossingAgentBillClearanceDetails(dispatchLedgerId);
			crossingAgentBill			= CrossingAgentBillDAO.getInstance().getDispatchDetailsForGeneratingBill(dispatchLedgerId);

			valueObjectOut.put("crossingAgentBillClearance", Converter.DtoToHashMap(crossingAgentBillClearance));

			if(crossingAgentBill != null)
				valueObjectOut.put("crossingAgentBill", Converter.DtoToHashMap(crossingAgentBill));

			valueObjectOut.put(AliasNameConstants.EXECUTIVE, executive);

			return JsonUtility.convertionToJsonObjectForResponse(valueObjectOut);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}
}
