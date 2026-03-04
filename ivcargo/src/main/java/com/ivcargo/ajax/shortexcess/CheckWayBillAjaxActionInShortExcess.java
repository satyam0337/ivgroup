/**
 *
 */
package com.ivcargo.ajax.shortexcess;

import java.io.PrintWriter;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONObject;

import com.businesslogic.shortexcess.ClaimEntryBLL;
import com.businesslogic.shortexcess.DamageReceiveBLL;
import com.businesslogic.shortexcess.ExcessReceiveBLL;
import com.businesslogic.shortexcess.ShortReceiveBLL;
import com.framework.Action;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.logsapp.LogWriter;
import com.iv.utils.constant.Constant;
import com.iv.utils.constant.properties.ReceiveConfigurationPropertiesConstant;
import com.iv.utils.exception.ExceptionProcess;
import com.ivcargo.utils.CacheManip;
import com.ivcargo.utils.JsonUtility;
import com.platform.dto.AliasNameConstants;
import com.platform.dto.Executive;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

/**
 * @author Administrator
 *
 */
public class CheckWayBillAjaxActionInShortExcess implements Action {

	private static final String TRACE_ID = CheckWayBillAjaxActionInShortExcess.class.getName();

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response){
		PrintWriter						out					= null;
		JSONObject						jsonObjectIn		= null;
		JSONObject						jsonObjectOut		= null;
		short							filter				= 0;

		try {
			response.setContentType("application/json"); // Setting response for JSON Content

			out						= response.getWriter();
			jsonObjectOut			= new JSONObject();
			jsonObjectIn			= new JSONObject(request.getParameter("json"));
			filter					= Utility.getShort(jsonObjectIn.get("filter"));

			if(request.getSession().getAttribute(AliasNameConstants.EXECUTIVE) == null) {
				jsonObjectOut.put("errorDescription", "You have been logged out. Please login again.");
				out.println(jsonObjectOut);
				return;
			}

			switch (filter) {
			case 1 -> out.println(checkWayBillDetailsInShortModule(request, jsonObjectIn));
			case 2 -> out.println(checkWayBillDetailsInDamageModule(request, jsonObjectIn));
			case 3 -> out.println(checkWayBillDetailsInExcessModule(request, jsonObjectIn));
			case 4 -> out.println(checkWayBillDetailsInClaimModule(request, jsonObjectIn));
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
				LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, e);
				e.printStackTrace();
			}
			out.println(jsonObjectOut);
		} finally {
			out.flush();
			out.close();
		}
	}

	private JSONObject checkWayBillDetailsInShortModule(final HttpServletRequest request, final JSONObject jsonObjectIn) throws Exception {
		try {
			final var	cache				= new CacheManip(request);
			final var	executive		    = cache.getExecutive(request);
			final var	shortReceiveBLL		= new ShortReceiveBLL();

			final var	valObjIn			= JsonUtility.convertJsontoValueObject(jsonObjectIn);

			valObjIn.put(AliasNameConstants.EXECUTIVE, executive);
			valObjIn.put(Constant.IS_ACTIVE_TCE_GROUP, cache.isTceActive(request, executive.getAccountGroupId()));

			final var	jsobj = shortReceiveBLL.checkWayBillDetails(valObjIn);

			return JsonUtility.convertionToJsonObjectForResponse(jsobj);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private JSONObject checkWayBillDetailsInDamageModule(final HttpServletRequest request, final JSONObject jsonObjectIn) throws Exception {
		try {
			final var	damageReceiveBLL	= new DamageReceiveBLL();
			final var	cache				= new CacheManip(request);
			final var	executive		    = cache.getExecutive(request);

			final var	valObjIn			= JsonUtility.convertJsontoValueObject(jsonObjectIn);

			valObjIn.put(Executive.EXECUTIVE, executive);
			valObjIn.put(Constant.IS_ACTIVE_TCE_GROUP, cache.isTceActive(request, executive.getAccountGroupId()));

			final var	jsobj = damageReceiveBLL.checkWayBillDetails(valObjIn);

			return JsonUtility.convertionToJsonObjectForResponse(jsobj);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private JSONObject checkWayBillDetailsInExcessModule(final HttpServletRequest request, final JSONObject jsonObjectIn) throws Exception {
		try {
			final var	cache					= new CacheManip(request);
			final var	executive		    	= cache.getExecutive(request);
			final var	excessReceiveBLL		= new ExcessReceiveBLL();

			final var	valObjIn			= JsonUtility.convertJsontoValueObject(jsonObjectIn);

			final var	receiveConfig		= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.RECEIVE);
			final var	execFieldPermissions = cache.getExecutiveFieldPermission(request);
			final var	branches			= cache.getGenericBranchesDetail(request);

			valObjIn.put(Executive.EXECUTIVE, executive);
			valObjIn.put(ReceiveConfigurationPropertiesConstant.RECEIVE_CONFIGUARTION, receiveConfig);
			valObjIn.put("execFieldPermissions", execFieldPermissions);
			valObjIn.put(AliasNameConstants.ALL_BRANCHES, branches);
			valObjIn.put(Constant.IS_ACTIVE_TCE_GROUP, cache.isTceActive(request, executive.getAccountGroupId()));

			final var	jsobj = excessReceiveBLL.checkWayBillDetails(valObjIn);

			return JsonUtility.convertionToJsonObjectForResponse(jsobj);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private JSONObject checkWayBillDetailsInClaimModule(final HttpServletRequest request, final JSONObject jsonObjectIn) throws Exception {
		try {
			final var	claimEntryBLL			= new ClaimEntryBLL();
			final var	cacheManip 				= new CacheManip(request);

			final var	executive		    	= cacheManip.getExecutive(request);
			final var	valObjIn				= JsonUtility.convertJsontoValueObject(jsonObjectIn);

			valObjIn.put(AliasNameConstants.EXECUTIVE, executive);
			valObjIn.put(Constant.IS_ACTIVE_TCE_GROUP, cacheManip.isTceActive(request, executive.getAccountGroupId()));

			final var	jsobj = claimEntryBLL.checkWayBillDetails(valObjIn);

			return JsonUtility.convertionToJsonObjectForResponse(jsobj);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}
}
