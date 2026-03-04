/**
 *
 */
package com.ivcargo.ajax;

import java.io.PrintWriter;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONObject;

import com.businesslogic.fund.FundReceiveBll;
import com.businesslogic.properties.GeneralConfiguration;
import com.framework.Action;
import com.iv.utils.exception.ExceptionProcess;
import com.ivcargo.utils.CacheManip;
import com.ivcargo.utils.JsonUtility;
import com.platform.dto.AliasNameConstants;
import com.platform.dto.configuration.modules.BankStatementConfigurationDTO;
import com.platform.dto.configuration.modules.CashStatementConfigurationDTO;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

/**
 * @author Administrator
 *
 */
public class FundReceiveAjaxAction implements Action {

	public static final String TRACE_ID = "FundReceiveAjaxAction";

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		PrintWriter						out							= null;
		JSONObject						jsonObjectIn				= null;
		JSONObject						jsonObjectOut				= null;
		short							filter						= 0;

		try {
			response.setContentType("application/json"); // Setting response for JSON Content

			out						= response.getWriter();
			jsonObjectOut			= new JSONObject();
			jsonObjectIn			= new JSONObject(request.getParameter("json"));
			filter					= Utility.getShort(jsonObjectIn.get("filter"));

			if(request.getSession().getAttribute("executive") == null) {
				jsonObjectOut.put("errorDescription", "You have been logged out. Please login again.");
				out.println(jsonObjectOut);
				return;
			}

			switch (filter) {
			case 1 -> out.println(fundReceive(request, jsonObjectOut, jsonObjectIn));
			case 2 -> out.println(rejectFundReceive(request, jsonObjectOut, jsonObjectIn));
			default -> {
				jsonObjectOut.put("errorDescription", "Unknown Request");
				out.println(jsonObjectOut);
			}
			}
		} catch (final Exception _e) {
			try {
				jsonObjectOut			= new JSONObject();
				jsonObjectOut.put("errorCode", CargoErrorList.SYSTEM_ERROR);
				jsonObjectOut.put("errorDescription", CargoErrorList.SYSTEM_ERROR_DESCRIPTION);
			} catch (final Exception e) {
				ExceptionProcess.execute(e, TRACE_ID);
				e.printStackTrace();
			}
			out.println(jsonObjectOut);
		} finally {
			out.flush();
			out.close();
		}
	}

	private JSONObject fundReceive(final HttpServletRequest request, final JSONObject jsonObjectOut, final JSONObject jsonObjectIn) throws Exception {
		try {
			final var	valObjIn			= JsonUtility.convertJsontoValueObject(jsonObjectIn);
			final var	valObjOut			= JsonUtility.convertJsontoValueObject(jsonObjectOut);

			final var	caManip				= new CacheManip(request);
			final var	fundReceiveBll		= new FundReceiveBll();

			final var	executive			= caManip.getExecutive(request);

			valObjIn.put(CashStatementConfigurationDTO.CASH_STATEMENT_CONFIGURATION, caManip.getCashStatementConfiguration(request, executive.getAccountGroupId()));
			valObjIn.put("branchcache", caManip.getGenericBranchesDetail(request));
			valObjIn.put(AliasNameConstants.EXECUTIVE, executive);
			valObjIn.put(BankStatementConfigurationDTO.BANK_STATEMENT_CONFIGURATION, caManip.getBankStatementConfiguration(request, executive.getAccountGroupId()));
			valObjIn.put(GeneralConfiguration.GENERAL_CONFIGURATION, caManip.getGeneralConfiguration(request, executive.getAccountGroupId()));

			final var	jsobj				= fundReceiveBll.receiveFund(valObjOut, valObjIn);

			return JsonUtility.convertionToJsonObjectForResponse(jsobj);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private JSONObject rejectFundReceive(final HttpServletRequest request, final JSONObject jsonObjectOut, final JSONObject jsonObjectIn) throws Exception {
		try {
			final var	valObjIn			= JsonUtility.convertJsontoValueObject(jsonObjectIn);
			final var	valObjOut			= JsonUtility.convertJsontoValueObject(jsonObjectOut);

			final var	caManip				= new CacheManip(request);
			final var	fundReceiveBll		= new FundReceiveBll();

			final var	executive			= caManip.getExecutive(request);

			valObjIn.put(CashStatementConfigurationDTO.CASH_STATEMENT_CONFIGURATION, caManip.getCashStatementConfiguration(request, executive.getAccountGroupId()));
			valObjIn.put("branchcache", caManip.getGenericBranchesDetail(request));
			valObjIn.put(AliasNameConstants.EXECUTIVE, executive);
			valObjIn.put(BankStatementConfigurationDTO.BANK_STATEMENT_CONFIGURATION, caManip.getBankStatementConfiguration(request, executive.getAccountGroupId()));
			valObjIn.put(GeneralConfiguration.GENERAL_CONFIGURATION, caManip.getGeneralConfiguration(request, executive.getAccountGroupId()));

			final var	jsobj				= fundReceiveBll.receiveFund(valObjOut, valObjIn);

			return JsonUtility.convertionToJsonObjectForResponse(jsobj);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}
}
