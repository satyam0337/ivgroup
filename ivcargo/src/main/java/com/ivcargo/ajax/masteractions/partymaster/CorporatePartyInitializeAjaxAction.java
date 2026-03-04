/**
 *
 */
package com.ivcargo.ajax.masteractions.partymaster;

import java.io.PrintWriter;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONObject;

import com.businesslogic.properties.impl.PropertyConfigValueBLLImpl;
import com.framework.Action;
import com.iv.logsapp.LogWriter;
import com.iv.utils.constant.PodWayBillPropertiesConstant;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.exception.ExceptionProcess;
import com.ivcargo.utils.CacheManip;
import com.ivcargo.utils.JsonUtility;
import com.platform.dto.AliasNameConstants;
import com.platform.dto.Executive;
import com.platform.dto.PropertiesFileConstants;
import com.platform.dto.configuration.modules.PartyMasterConfigurationDTO;
import com.platform.dto.constant.CorporateAccountConstant;
import com.platform.dto.constant.PODRequiredConstant;
import com.platform.dto.constant.PartyMasterConstant;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

/**
 * @author Administrator
 *
 */
public class CorporatePartyInitializeAjaxAction implements Action {

	public static final String TRACE_ID = CorporatePartyInitializeAjaxAction.class.getName();

	/* (non-Javadoc)
	 * @see com.framework.Action#execute(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
	 */
	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		// TODO Auto-generated method stub

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

			if(request.getSession().getAttribute(AliasNameConstants.EXECUTIVE) == null) {
				jsonObjectOut.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.errorDescription(CargoErrorList.LOGGED_OUT, null));
				out.println(jsonObjectOut);
				return;
			}

			switch (filter) {
			case 1: {
				out.println(initializePartyMaster(request, jsonObjectIn));
				break;
			}
			default: {
				jsonObjectOut.put("errorDescription", "Unknown Request");
				out.println(jsonObjectOut);
				break;
			}
			}
		} catch (final Exception e) {
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, e);
			try {
				jsonObjectOut	= JsonUtility.setError(CargoErrorList.SYSTEM_ERROR, CargoErrorList.SYSTEM_ERROR_DESCRIPTION);
			} catch (final Exception e1) {
				LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, ""+e1);
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

	private JSONObject initializePartyMaster(HttpServletRequest request, JSONObject jsonObjectIn) throws Exception {
		CacheManip						cache						= null;
		Executive						executive					= null;
		ValueObject						valObjIn					= null;
		ValueObject						partyMasterConfig			= null;
		boolean							chargedWeightRoundOffConfig		= false;
		String							roundOffValues					= null;
		String[]						roundOffValueStr				= null;
		short[]							roundOffValueArray				= null;

		try {
			cache				= new CacheManip(request);
			executive			= cache.getExecutive(request);
			valObjIn			= JsonUtility.convertJsontoValueObject(jsonObjectIn);

			partyMasterConfig	= PropertyConfigValueBLLImpl.getInstance().getConfiguration(executive, PropertiesFileConstants.PARTY_MASTER_CONFIG);

			chargedWeightRoundOffConfig	= partyMasterConfig.getBoolean(PartyMasterConfigurationDTO.SHOW_CHARGED_WEIGHT_ROUND, false);

			if(chargedWeightRoundOffConfig) {
				roundOffValues			= partyMasterConfig.getString(PartyMasterConfigurationDTO.ROUND_OFF_VALUES, "0");

				if(roundOffValues != null && !"".equals(roundOffValues) && !"0".equals(roundOffValues)) {
					roundOffValueStr	= roundOffValues.split(",");

					roundOffValueArray 	= new short[roundOffValueStr.length];

					for(int i = 0; i < roundOffValueStr.length; i++)
						roundOffValueArray[i] = Short.parseShort(roundOffValueStr[i]);

					valObjIn.put("roundOffValueArray", roundOffValueArray);
				}
			}

			valObjIn.put("partyMasterConfig", partyMasterConfig);
			valObjIn.put(PodWayBillPropertiesConstant.POD_CONFIGURATION, cache.getPODWayBillConfiguration(request, executive.getAccountGroupId()));
			valObjIn.put("CorporateAccountConstant", CorporateAccountConstant.getCorporateAccountConstant());
			valObjIn.put("PODRequiredConstant", PODRequiredConstant.getPODRequiredConstants());
			valObjIn.put("PartyMasterConstant", PartyMasterConstant.getPartyMasterConstant());
			valObjIn.put("configuration", cache.getGroupConfiguration(request, executive.getAccountGroupId()));

			return JsonUtility.convertionToJsonObjectForResponse(valObjIn);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		} finally {
			executive					= null;
			valObjIn					= null;
			partyMasterConfig			= null;
		}
	}
}
