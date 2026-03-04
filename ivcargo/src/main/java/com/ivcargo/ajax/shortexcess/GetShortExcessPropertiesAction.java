/**
 *
 */
package com.ivcargo.ajax.shortexcess;

import java.io.PrintWriter;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONObject;

import com.framework.Action;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.exception.ExceptionProcess;
import com.ivcargo.utils.CacheManip;
import com.ivcargo.utils.JsonUtility;
import com.platform.dto.Executive;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Converter;
import com.platform.utils.Utility;

/**
 * @author admin
 *
 */
public class GetShortExcessPropertiesAction implements Action {

	private static final String TRACE_ID = GetShortExcessPropertiesAction.class.getName();
	/* (non-Javadoc)
	 * @see com.framework.Action#execute(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
	 */
	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		CacheManip						cacheManip			= null;
		Executive						executive			= null;
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
			cacheManip				= new CacheManip(request);
			executive				= cacheManip.getExecutive(request);

			if(executive == null) {
				jsonObjectOut.put(CargoErrorList.ERROR_DESCRIPTION, "You have been logged out. Please login again.");
				out.println(jsonObjectOut);
				return;
			}

			switch (filter) {
			case 1:
				out.println(getShortReceiveProperties(request, executive));
				break;
			case 2:
				out.println(getDamageReceiveProperties(request, executive));
				break;
			case 3:
				out.println(getExcessReceiveProperties(request, executive));
				break;
			case 4:
				out.println(getClaimEntryProperties(request, executive));
				break;
			case 5:
				out.println(getShortReceiveSettlementProperties(request, executive));
				break;
			case 6:
				out.println(getExcessReceiveSettlementProperties(request, executive));
				break;
			case 7:
				out.println(getDamageReceiveSettlementProperties(request, executive));
				break;
			default:
				jsonObjectOut.put(CargoErrorList.ERROR_DESCRIPTION, "Unknown Request");
				out.println(jsonObjectOut);
				break;
			}
		} catch (final Exception e1) {
			try {
				jsonObjectOut			= new JSONObject();
				jsonObjectOut.put(CargoErrorList.ERROR_CODE, CargoErrorList.SYSTEM_ERROR);
				jsonObjectOut.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.SYSTEM_ERROR_DESCRIPTION);
			} catch (final Exception e) {
				ExceptionProcess.execute(e, TRACE_ID);
				e.printStackTrace();
			}

			if(out != null) out.println(jsonObjectOut);
		} finally {
			if(out != null) {
				out.flush();
				out.close();
			}
		}
	}

	private JSONObject getShortReceiveProperties(final HttpServletRequest request, final Executive executive) throws Exception {
		try {
			final var	cache				= new CacheManip(request);
			final var	valueObjectOut		= new ValueObject();

			valueObjectOut.put("shortReceiveConfig", cache.getOldConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.SHORT_RECEIVE_LR));

			return JsonUtility.convertionToJsonObjectForResponse(valueObjectOut);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private JSONObject getShortReceiveSettlementProperties(final HttpServletRequest request, final Executive executive) throws Exception {
		try {
			final var	cache				= new CacheManip(request);
			final var	valueObjectOut		= new ValueObject();

			valueObjectOut.put("shortReceiveSettlementConfig", cache.getOldConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.SHORT_REGISTER_SETTLEMENT));

			return JsonUtility.convertionToJsonObjectForResponse(valueObjectOut);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private JSONObject getExcessReceiveSettlementProperties(final HttpServletRequest request, final Executive executive) throws Exception {
		try {
			final var	cache    			= new CacheManip(request);
			final var	valueObjectOut		= new ValueObject();

			valueObjectOut.put("excessReceiveSettlementConfig", cache.getOldConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.EXCESS_REGISTER_SETTLEMENT));

			return JsonUtility.convertionToJsonObjectForResponse(valueObjectOut);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private JSONObject getDamageReceiveSettlementProperties(final HttpServletRequest request, final Executive executive) throws Exception {
		try {
			final var	cache				= new CacheManip(request);
			final var	valueObjectOut		= new ValueObject();

			valueObjectOut.put("damageReceiveSettlementConfig", cache.getOldConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.DAMAGE_REGISTER_SETTLEMENT));

			return JsonUtility.convertionToJsonObjectForResponse(valueObjectOut);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private JSONObject getDamageReceiveProperties(final HttpServletRequest request, final Executive executive) throws Exception {
		try {
			final var	cache				= new CacheManip(request);
			final var	valueObjectOut		= new ValueObject();

			valueObjectOut.put("damageReceiveConfig", cache.getOldConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.DAMAGE_RECEIVE_LR));

			return JsonUtility.convertionToJsonObjectForResponse(valueObjectOut);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private JSONObject getExcessReceiveProperties(final HttpServletRequest request, final Executive executive) throws Exception {
		try {
			final var	cacheManip				= new CacheManip(request);
			final var	valueObjectOut			= new ValueObject();

			final var	configuration			= cacheManip.getOldConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.EXCESS_RECEIVE_LR);

			final var	packingType 			= cacheManip.getAllPackingType(request, executive.getAccountGroupId());

			valueObjectOut.put("excessReceiveConfig", configuration);

			if(packingType != null)
				valueObjectOut.put("packingType", Converter.arrayDtotoArrayListWithHashMapConversion(packingType));

			return JsonUtility.convertionToJsonObjectForResponse(valueObjectOut);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private JSONObject getClaimEntryProperties(final HttpServletRequest request, final Executive executive) throws Exception {
		try {
			final var	cache				= new CacheManip(request);
			final var	valueObjectOut		= new ValueObject();

			valueObjectOut.put("claimEntryConfig", cache.getOldConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.CLAIM_ENTRY_MODULE));

			return JsonUtility.convertionToJsonObjectForResponse(valueObjectOut);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}
}
