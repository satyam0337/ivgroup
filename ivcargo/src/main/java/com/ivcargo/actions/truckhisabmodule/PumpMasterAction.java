/**
 *
 */
package com.ivcargo.actions.truckhisabmodule;

import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.ObjectUtils;
import org.json.JSONObject;

import com.businesslogic.truckhisabmodule.PumpMasterBLL;
import com.framework.Action;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.exception.ExceptionProcess;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actions.shortexcess.CommonFuctionToConvertArrayListToJSONArray;
import com.platform.dto.Executive;
import com.platform.dto.truckhisabmodule.PumpNameMaster;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

/**
 * @author Shailesh Khandare	09-01-2016
 *
 */
public class PumpMasterAction implements Action {

	private static final String TRACE_ID = "PumpMasterAction";

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	 						error 		= null;
		PrintWriter										out								= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			response.setContentType("application/json");
			out = response.getWriter();

			final var	getJsonObject 		= new JSONObject(request.getParameter("json"));
			final var	outJsonObject		= new JSONObject();

			final short	filter					= Utility.getShort(getJsonObject.get("Filter"));

			if(request.getSession().getAttribute("executive") == null) {
				outJsonObject.put("errorDescription", "You have been logged out. Please login again.");
				out.println(outJsonObject);
				return;
			}

			switch (filter) {
			case 1 -> out.println(insertPumpMaster(request, outJsonObject, getJsonObject));
			case 2 -> out.println(getPumpMaster(request, outJsonObject));
			case 3 -> out.println(updatePumpNameMaster(outJsonObject, getJsonObject));
			case 4 -> out.println(deteleFromPumpName(outJsonObject, getJsonObject));
			default -> {
				outJsonObject.put("errorDescription", "You have been logged out. Please login again.");
				out.println(outJsonObject);
			}
			}
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		} finally {
			if(out != null) {
				out.flush();
				out.close();
			}
		}
	}

	private JSONObject deteleFromPumpName(JSONObject outJsonObject, JSONObject getJsonObject) throws Exception {
		try {
			final var	valueObjectToBLL = new ValueObject();
			valueObjectToBLL.put("TollTypeMasterId", Utility.getLong(getJsonObject.get("TollTypeMasterId")));
			final var	pumpMasterBLL			= new PumpMasterBLL();

			final var	valueObjectFromBLL	= pumpMasterBLL.deletePumpNameTypeDetails(valueObjectToBLL);
			final var	flag 	= Utility.getLong(valueObjectFromBLL.get("flag"));

			if(flag > 0)
				outJsonObject.put("Sucess", "Sucess");
			else
				outJsonObject.put("error", "error");

			return outJsonObject;
		}catch(final Exception e){
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private JSONObject updatePumpNameMaster(JSONObject outJsonObject, JSONObject getJsonObject) throws Exception {
		try {
			final var	valueObjectToBLL 			= new ValueObject();

			valueObjectToBLL.put("TollTypeMasterId", Utility.getLong(getJsonObject.get("TollTypeMasterId")));
			valueObjectToBLL.put("Name1", getJsonObject.get("Name1") + "");
			valueObjectToBLL.put("Amount", getJsonObject.optDouble("Amount5", 0.0));
			valueObjectToBLL.put("MobileNo", getJsonObject.optString("MobileNo2", null));
			valueObjectToBLL.put("Address", getJsonObject.optString("Address2", null));

			final var	pumpMasterBLL			= new PumpMasterBLL();

			final var	valueObjectFromBLL	= pumpMasterBLL.updatePumpTypeDetails(valueObjectToBLL);
			final var	flag 	= Utility.getLong(valueObjectFromBLL.get("flag"));

			if(flag > 0)
				outJsonObject.put("Sucess", "Sucess");
			else
				outJsonObject.put("error", "error");

			return outJsonObject;
		} catch(final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}

	}

	@SuppressWarnings("unchecked")
	private JSONObject getPumpMaster(HttpServletRequest request, JSONObject outJsonObject) throws Exception  {
		try {
			final var	executive		= (Executive) request.getSession().getAttribute("executive");
			final var	pumpMasterBLL   = new PumpMasterBLL();
			final var	valueObjectToBLL = new ValueObject();
			var	pumpNameMasterList	= new ArrayList<PumpNameMaster>();
			final var	commonFun		= new CommonFuctionToConvertArrayListToJSONArray();
			valueObjectToBLL.put("accountGroupId", executive.getAccountGroupId());
			final var	valueObjectFromBLL	= pumpMasterBLL.getMiscTypeDetails(valueObjectToBLL);

			if(valueObjectFromBLL == null) {
				request.setAttribute("nextPageToken", "failure");
				outJsonObject.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				return outJsonObject;
			}

			if(valueObjectFromBLL.get("pumpNameMasterList") != null )
				pumpNameMasterList      = (ArrayList<PumpNameMaster>) valueObjectFromBLL.get("pumpNameMasterList");

			if(ObjectUtils.isNotEmpty(pumpNameMasterList))
				outJsonObject.put("pumpNameMasterColl", commonFun.getPumpNameJSONArrayObject(pumpNameMasterList));

			outJsonObject.put("executive",new JSONObject(executive));

			return outJsonObject;
		}catch(final Exception e){
			throw ExceptionProcess.execute(e, TRACE_ID);
		}

	}

	private JSONObject insertPumpMaster(HttpServletRequest request, JSONObject outJsonObject, JSONObject getJsonObject) throws Exception {
		try{
			final var	valueObjectToBLL	= new ValueObject();

			final var	executive		= (Executive) request.getSession().getAttribute("executive");
			valueObjectToBLL.put("executiveId", executive.getExecutiveId());
			valueObjectToBLL.put("accountGroupId", executive.getAccountGroupId());
			valueObjectToBLL.put("branchId", executive.getBranchId());
			valueObjectToBLL.put("Name", getJsonObject.get("Name")+"");
			valueObjectToBLL.put("Amount", getJsonObject.optDouble("Amount", 0.0));
			valueObjectToBLL.put("mobileNumber", getJsonObject.optString("mobileNumber", null));
			valueObjectToBLL.put("address", getJsonObject.optString("address", null));

			final var	pumpMasterBLL			= new PumpMasterBLL();

			final var	valueObjectFromBLL	= pumpMasterBLL.insertPumpNameMaster(valueObjectToBLL);

			if(valueObjectFromBLL == null) {
				request.setAttribute("nextPageToken", "failure");
				outJsonObject.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				return outJsonObject;
			}

			if(Utility.getLong(valueObjectFromBLL.get("flag")) > 0)
				outJsonObject.put("Success", "Success");

			outJsonObject.put("executive",new JSONObject(executive));

			return outJsonObject;
		} catch(final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}

	}
}
