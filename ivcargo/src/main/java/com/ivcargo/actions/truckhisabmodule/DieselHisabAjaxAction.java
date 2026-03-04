/**
 *
 */
package com.ivcargo.actions.truckhisabmodule;

import java.io.PrintWriter;
import java.sql.Timestamp;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.ObjectUtils;
import org.json.JSONObject;

import com.businesslogic.truckhisabmodule.DieselHisabDetailsBll;
import com.framework.Action;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.exception.ExceptionProcess;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actions.shortexcess.CommonFuctionToConvertArrayListToJSONArray;
import com.platform.dto.Executive;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

/**
 * @author Shailesh 04-06-2016
 */
public class DieselHisabAjaxAction implements Action {

	private static final String TRACE_ID = "DieselHisabAjaxAction";
	Timestamp 							createDate 						= null;

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	error 				= null;
		PrintWriter				out					= null;
		JSONObject				outJsonObject		= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			response.setContentType("application/json");
			out = response.getWriter();

			final var	getJsonObject 		= new JSONObject(request.getParameter("json"));
			outJsonObject		= new JSONObject();

			final short	filter					= Utility.getShort(getJsonObject.get("Filter"));

			if(request.getSession().getAttribute("executive") == null) {
				outJsonObject.put("errorDescription", "You have been logged out. Please login again.");
				out.println(outJsonObject);
				return;
			}

			switch (filter) {
			case 1 -> out.println(getPumpReceiptByVheicleId(request, outJsonObject, getJsonObject));
			default -> {
				outJsonObject.put("errorDescription", "You have been logged out. Please login again.");
				out.println(outJsonObject);
			}
			}
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		} finally {
			out.flush();
			out.close();
		}
	}

	private JSONObject getPumpReceiptByVheicleId(final HttpServletRequest request, final JSONObject outJsonObject, final JSONObject getJsonObject) throws Exception {
		try {
			final var	commonFun			= new CommonFuctionToConvertArrayListToJSONArray();
			final var	executive			= (Executive) request.getSession().getAttribute("executive");

			final var	valueObjectToBLL	= new ValueObject();

			valueObjectToBLL.put("accountGroupId", executive.getAccountGroupId());
			valueObjectToBLL.put("VehicleId", getJsonObject.optLong("VehicleId", 0));

			final var	dieselHisabDetailsBll			= new DieselHisabDetailsBll();

			final var	pumpReceiptArrayList	= dieselHisabDetailsBll.getPumpReceiptDetailsByVehicleId(valueObjectToBLL);

			if(ObjectUtils.isEmpty(pumpReceiptArrayList)) {
				request.setAttribute("nextPageToken", "failure");
				outJsonObject.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				return outJsonObject;
			}

			outJsonObject.put("pumpReceiptArrayListColl", commonFun.getPumpReceiptJSONArrayObject(pumpReceiptArrayList));
			outJsonObject.put("executive", new JSONObject(executive));

			return outJsonObject;
		} catch(final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}
}
