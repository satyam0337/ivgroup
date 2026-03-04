package com.ivcargo.actions;

import java.io.PrintWriter;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONObject;

import com.framework.Action;
import com.iv.bll.tds.impl.TDSTxnDetailsBllImpl;
import com.iv.constant.properties.GeneralConfigurationPropertiesConstant;
import com.iv.constant.properties.STBSConfigurationConstant;
import com.iv.constant.properties.TDSPropertiesConstant;
import com.iv.dto.constant.FeildPermissionsConstant;
import com.iv.logsapp.LogWriter;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.exception.ExceptionProcess;
import com.ivcargo.utils.CacheManip;
import com.ivcargo.utils.JsonUtility;
import com.platform.dto.ConfigParam;
import com.platform.dto.Executive;
import com.platform.dto.configuration.discountlimit.ModuleWiseDiscountLimitConfigurationDTO;
import com.platform.dto.constant.ModuleIdentifierConstant;
import com.platform.dto.constant.PaymentTypeConstant;
import com.platform.dto.constant.StbsBillClearanceConstant;
import com.platform.resource.CargoErrorList;

public class STBSAjaxAction implements Action {

	public static final String TRACE_ID = "STBSAjaxAction";

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		PrintWriter						out							= null;
		JSONObject						jsonObjectOut				= null;
		try {
			response.setContentType("application/json"); // Setting response for JSON Content

			out						= response.getWriter();
			jsonObjectOut			= new JSONObject();
			new JSONObject(request.getParameter("json"));

			if(request.getSession().getAttribute("executive") == null) {
				jsonObjectOut.put("errorDescription", "You have been logged out. Please login again.");
				out.println(jsonObjectOut);
				return;
			}

			out.println(loadSTBSConfig(request, jsonObjectOut));

		} catch (final Exception e) {
			try {
				if(jsonObjectOut != null) {
					jsonObjectOut.put("errorCode", CargoErrorList.SYSTEM_ERROR);
					jsonObjectOut.put("errorDescription", CargoErrorList.SYSTEM_ERROR_DESCRIPTION);
				}
			} catch (final Exception e1) {
				LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, ""+e1);
				e.printStackTrace();
			}
			if(out != null) out.println(jsonObjectOut);
		} finally{
			if(out != null) {
				out.flush();
				out.close();
			}
		}
	}
	/**
	 * Load STBS configuration.
	 * **/
	private JSONObject loadSTBSConfig(HttpServletRequest request,JSONObject jsonObjectOut) throws Exception {
		ValueObject					valObjOut						= null;
		Executive					executive						= null;
		Map<Object, Object>			configuration					= null;
		Map<Object, Object>			stbsSettlementConfig			= null;
		CacheManip					cache							= null;
		ValueObject					generalConfiguration			= null;
		Map<Object, Object>			tdsConfiguration				= null;
		var							noOfDays						= 0;
		String						previousDate					= null;
		var				allowBackDateEntryForStbsSettlement		= false;
		HashMap<?, ?> 		execFldPermissions						= null;

		try {
			valObjOut				= JsonUtility.convertJsontoValueObject(jsonObjectOut);
			cache 					= new CacheManip(request);
			executive				= cache.getExecutive(request);
			configuration			= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.STBS);
			stbsSettlementConfig	= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.STBS_SETTLEMENT);
			generalConfiguration	= cache.getGeneralConfiguration(request, executive.getAccountGroupId());
			tdsConfiguration		= cache.getTDSConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.STBS_SETTLEMENT);
			execFldPermissions		= cache.getExecutiveFieldPermission(request);

			allowBackDateEntryForStbsSettlement		= execFldPermissions != null && execFldPermissions.containsKey(FeildPermissionsConstant.ALLOW_BACK_DATE_IN_STBS_SETTLEMENT);

			noOfDays 				= cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_MAX_DAYS_OF_OPERATION_BEFORE_CASHSTATEMENT_ENTRY_ID);

			stbsSettlementConfig.put(STBSConfigurationConstant.ALLOW_STBS_CREATION_WITHOUT_COLLECTION_PERSON, configuration.getOrDefault(STBSConfigurationConstant.ALLOW_STBS_CREATION_WITHOUT_COLLECTION_PERSON, false));

			if(allowBackDateEntryForStbsSettlement)
				previousDate	= DateTimeUtility.getDateBeforeNoOfDays(noOfDays);

			valObjOut.put("configuration", stbsSettlementConfig);
			valObjOut.put("executive", executive);
			valObjOut.put("StbsBillClearanceConstant", StbsBillClearanceConstant.getStbsBillClearanceConstant());
			valObjOut.put("PaymentTypeConstant", PaymentTypeConstant.getPaymentTypeConstants());
			valObjOut.put(ModuleIdentifierConstant.MODULE_ID, ModuleIdentifierConstant.STBS_SETTLEMENT);
			valObjOut.put("ModuleIdentifierConstant", ModuleIdentifierConstant.getModuleIdentifierConstants());
			valObjOut.put(ModuleIdentifierConstant.INCOME_EXPENSE_MODULE_ID, ModuleIdentifierConstant.INCOME_TYPE_MODULE_ID);
			valObjOut.put(TDSPropertiesConstant.TDS_CONFIGURATION, tdsConfiguration);
			valObjOut.put(GeneralConfigurationPropertiesConstant.GENERAL_CONFIGURATION, generalConfiguration);
			valObjOut.put("previousDate", previousDate);
			valObjOut.put("allowBackDateEntryForStbsSettlement", allowBackDateEntryForStbsSettlement);
			valObjOut.put("discountInPercent", cache.getModuleWiseDiscountLimit(request, executive.getAccountGroupId(),
					ModuleWiseDiscountLimitConfigurationDTO.STBS_SETTLEMENT_DISCOUNT_LIMIT_ALLOW,
					ModuleWiseDiscountLimitConfigurationDTO.STBS_SETTLEMENT_DISCOUNT_LIMIT_IN_PERCENT));
			valObjOut.put("tdsChargesArray", TDSTxnDetailsBllImpl.getTDSChargesList(tdsConfiguration));

			return JsonUtility.convertionToJsonObjectForResponse(valObjOut);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}
}