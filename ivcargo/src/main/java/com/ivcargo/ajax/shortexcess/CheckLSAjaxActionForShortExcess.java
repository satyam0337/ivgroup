/**
 *
 */
package com.ivcargo.ajax.shortexcess;

import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONObject;

import com.businesslogic.shortexcess.DamageReceiveBLL;
import com.businesslogic.shortexcess.ExcessReceiveBLL;
import com.businesslogic.shortexcess.ShortReceiveBLL;
import com.framework.Action;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.logsapp.LogWriter;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.utils.CacheManip;
import com.ivcargo.utils.JsonUtility;
import com.platform.dto.AliasNameConstants;
import com.platform.dto.Branch;
import com.platform.dto.Executive;
import com.platform.dto.ExecutiveFeildPermissionDTO;
import com.platform.dto.configuration.modules.shortexcess.ShortRegisterConfigurationDTO;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

/**
 * @author Administrator
 *
 */
public class CheckLSAjaxActionForShortExcess implements Action {

	private static final String TRACE_ID = CheckLSAjaxActionForShortExcess.class.getName();

	HashMap<Long, ExecutiveFeildPermissionDTO>		execFldPermissionsHM				= null;

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
			case 1: {
				out.println(checkLSDetailsInShortModule(request, jsonObjectIn));
				break;
			}
			case 2: {
				out.println(checkLSDetailsInDamageModule(request, jsonObjectIn));
				break;
			}
			case 3: {
				out.println(checkLSDetailsInExcessModule(request, jsonObjectIn));
				break;
			}
			default: {
				jsonObjectOut.put("errorDescription", "Unknown Request");
				out.println(jsonObjectOut);
				break;
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
			out							= null;
			jsonObjectIn				= null;
			jsonObjectOut				= null;
		}
	}

	private JSONObject checkLSDetailsInShortModule(final HttpServletRequest request, final JSONObject jsonObjectIn) throws Exception {

		ValueObject								jsobj								= null;
		ValueObject								valObjIn							= null;
		ShortReceiveBLL							shortReceiveBLL						= null;
		HashMap<Long, Branch> 					branchesHM   						= null;
		var									doNotAllowShortEntryAfterBlhpvCreation	= false;
		List<Branch>							branchesList						= null;

		try {
			final var	cache    					= new CacheManip(request);
			final var	executive		    		= cache.getExecutive(request);

			if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_GROUPADMIN)
				branchesHM = cache.getAllActiveBranches(request, executive.getAccountGroupId(), executive.getExecutiveType(), executive.getAccountGroupId());
			else if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_REGIONADMIN)
				branchesHM = cache.getAllActiveBranches(request, executive.getAccountGroupId(), executive.getExecutiveType(), executive.getRegionId());

			final var	shortExcessConfig	  = cache.getOldConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.SHORT_RECEIVE_LR);

			if(shortExcessConfig != null)
				doNotAllowShortEntryAfterBlhpvCreation	= shortExcessConfig.getBoolean(ShortRegisterConfigurationDTO.DO_NOT_ALLOW_SHORT_ENTRY_AFTER_BLHPV_CREATION, false);

			execFldPermissionsHM = cache.getExecutiveFieldPermission(request);

			shortReceiveBLL		= new ShortReceiveBLL();

			valObjIn			= JsonUtility.convertJsontoValueObject(jsonObjectIn);

			if(branchesHM != null && branchesHM.size() > 0)
				branchesList	= new ArrayList<>(branchesHM.values());

			valObjIn.put(AliasNameConstants.EXECUTIVE, executive);
			valObjIn.put("execFldPermissionsHM", execFldPermissionsHM);
			valObjIn.put("doNotAllowShortEntryAfterBlhpvCreation", doNotAllowShortEntryAfterBlhpvCreation);

			jsobj = shortReceiveBLL.checkLSDetails(valObjIn);

			jsobj.put("branchesList", branchesList);

			return JsonUtility.convertionToJsonObjectForResponse(jsobj);
		} catch (final Exception e) {
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, e);
			throw e;
		}
	}

	private JSONObject checkLSDetailsInDamageModule(final HttpServletRequest request, final JSONObject jsonObjectIn) throws Exception {

		Executive								executive							= null;
		ValueObject								jsobj								= null;
		ValueObject								valObjIn							= null;
		DamageReceiveBLL						damageReceiveBLL					= null;
		try {

			executive		    = (Executive) request.getSession().getAttribute(AliasNameConstants.EXECUTIVE);
			damageReceiveBLL	= new DamageReceiveBLL();

			valObjIn			= JsonUtility.convertJsontoValueObject(jsonObjectIn);

			valObjIn.put(AliasNameConstants.EXECUTIVE, executive);

			jsobj = damageReceiveBLL.checkLSDetails(valObjIn);

			return JsonUtility.convertionToJsonObjectForResponse(jsobj);
		} catch (final Exception e) {
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, e);
			throw e;
		} finally {
			executive							= null;
			jsobj								= null;
			valObjIn							= null;
		}
	}

	private JSONObject checkLSDetailsInExcessModule(final HttpServletRequest request, final JSONObject jsonObjectIn) throws Exception {

		Executive								executive							= null;
		ValueObject								jsobj								= null;
		ValueObject								valObjIn							= null;
		ExcessReceiveBLL						excessReceiveBLL					= null;
		try {

			executive		    = (Executive) request.getSession().getAttribute(AliasNameConstants.EXECUTIVE);
			excessReceiveBLL	= new ExcessReceiveBLL();

			valObjIn			= JsonUtility.convertJsontoValueObject(jsonObjectIn);

			valObjIn.put(AliasNameConstants.EXECUTIVE, executive);

			jsobj = excessReceiveBLL.checkLSDetails(valObjIn);

			return JsonUtility.convertionToJsonObjectForResponse(jsobj);
		} catch (final Exception e) {
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, e);
			throw e;
		} finally {
			executive							= null;
			jsobj								= null;
			valObjIn							= null;
		}
	}
}
