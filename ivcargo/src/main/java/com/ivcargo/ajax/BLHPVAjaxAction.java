/**
 *
 */
package com.ivcargo.ajax;

import java.io.PrintWriter;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONObject;

import com.businesslogic.print.BLHPVPrintBLL;
import com.framework.Action;
import com.iv.utils.exception.ExceptionProcess;
import com.ivcargo.reports.ReportView;
import com.ivcargo.utils.CacheManip;
import com.ivcargo.utils.JsonUtility;
import com.platform.dto.Branch;
import com.platform.dto.ECargoConstantFile;
import com.platform.dto.Executive;
import com.platform.dto.constant.LHPVChargeTypeConstant;
import com.platform.dto.model.ReportViewModel;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Converter;
import com.platform.utils.Utility;

/**
 * @author Anant Chaudhary	03-06-2016
 *
 */
public class BLHPVAjaxAction implements Action {

	public static final String TRACE_ID = "LHPVAjaxAction";

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {

		PrintWriter						out							= null;
		JSONObject						jsonObjectOut				= null;

		try {
			response.setContentType("application/json"); // Setting response for JSON Content

			out						= response.getWriter();
			jsonObjectOut			= new JSONObject();
			final var	jsonObjectIn			= new JSONObject(request.getParameter("json"));
			final short	filter					= Utility.getShort(jsonObjectIn.get("filter"));

			if(request.getSession().getAttribute("executive") == null) {
				jsonObjectOut.put("errorDescription", "You have been logged out. Please login again.");
				out.println(jsonObjectOut);
				return;
			}

			if (filter == 4)
				out.println(getBLHPVDataToPrint(request, jsonObjectIn));
		} catch (final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
			try {
				jsonObjectOut			= new JSONObject();
				jsonObjectOut.put("errorCode", CargoErrorList.SYSTEM_ERROR);
				jsonObjectOut.put("errorDescription", CargoErrorList.SYSTEM_ERROR_DESCRIPTION);
			} catch (final Exception e1) {
				ExceptionProcess.execute(e1, TRACE_ID);
				e1.printStackTrace();
			}

			if(out != null)
				out.println(jsonObjectOut);
		} finally {
			if(out != null) {
				out.flush();
				out.close();
			}
		}
	}

	private JSONObject getBLHPVDataToPrint(HttpServletRequest request, JSONObject jsonObjectIn) throws Exception {
		try {
			final var	blhpvPrintBLL		= new BLHPVPrintBLL();
			final var	cacheManip			= new CacheManip(request);
			final var	reportView			= new ReportView();

			final var	executive			= cacheManip.getExecutive(request);
			final var	valObjIn			= JsonUtility.convertJsontoValueObject(jsonObjectIn);

			valObjIn.put(Executive.EXECUTIVE, executive);

			final var	allBranches			= cacheManip.getGenericBranchesDetail(request);

			final var	branch				= (Branch) allBranches.get(executive.getBranchId() + "");

			valObjIn.put("allBranches", allBranches);
			valObjIn.put("accountGroup", cacheManip.getAccountGroupById(request, executive.getAccountGroupId()));

			final var	valObjOut			= blhpvPrintBLL.getDataToPrintBLhpv(valObjIn);

			request.setAttribute("customAddressBranchId", valObjOut.get("customAddressBranchId"));
			request.setAttribute("customAddressIdentifer", valObjOut.get("customAddressIdentifer"));

			valObjOut.put(ECargoConstantFile.EXECUTIVE, Converter.DtoToHashMap(executive));
			valObjOut.put("LoggedInBranchDetails", Converter.DtoToHashMap(branch));
			valObjOut.put("LhpvChargeTypeMaster", LHPVChargeTypeConstant.getLhpvChargeTypeConstant());

			var	reportViewModel		= new ReportViewModel();
			reportViewModel		= reportView.populateReportViewModel(request, reportViewModel);

			valObjOut.put("ReportViewModel", Converter.DtoToHashMap(reportViewModel));

			return JsonUtility.convertionToJsonObjectForResponse(valObjOut);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}
}
