/**
 *
 */
package com.ivcargo.ajax;

import java.io.PrintWriter;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.ObjectUtils;
import org.json.JSONObject;

import com.businesslogic.DiscountMasterBLL;
import com.businesslogic.properties.GeneralConfiguration;
import com.framework.Action;
import com.iv.bll.tds.impl.TDSTxnDetailsBllImpl;
import com.iv.constant.properties.GeneralConfigurationPropertiesConstant;
import com.iv.constant.properties.LRCreditConfigurationConstant;
import com.iv.constant.properties.TDSPropertiesConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.logsapp.LogWriter;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.constant.Constant;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.exception.ExceptionProcess;
import com.ivcargo.utils.CacheManip;
import com.ivcargo.utils.JsonUtility;
import com.platform.dto.AliasNameConstants;
import com.platform.dto.ConfigParam;
import com.platform.dto.Executive;
import com.platform.dto.configuration.discountlimit.ModuleWiseDiscountLimitConfigurationDTO;
import com.platform.dto.configuration.mindateselection.ModuleWiseMinDateSelectionConfigurationDTO;
import com.platform.dto.constant.FeildPermissionsConstant;
import com.platform.jsonconstant.JsonConstant;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Converter;
import com.platform.utils.Utility;

/**
 * @author admin
 *
 */
public class ShortCreditPaymentModuleAjaxAction implements Action {

	public static final String TRACE_ID = ShortCreditPaymentModuleAjaxAction.class.getName();

	/* (non-Javadoc)
	 * @see com.framework.Action#execute(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
	 */
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

			if(request.getSession().getAttribute(AliasNameConstants.EXECUTIVE) == null) {
				jsonObjectOut.put("errorDescription", "You have been logged out. Please login again.");
				out.println(jsonObjectOut);
				return;
			}

			switch (filter) {
			case 1 -> out.println(loadShortCreditPayment(request));
			default -> {
				jsonObjectOut.put("errorDescription", "Unknown Request");
				out.println(jsonObjectOut);
			}
			}

		} catch (final Exception _e) {
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR,_e);
			try {
				jsonObjectOut			= new JSONObject();
				jsonObjectOut.put("errorCode", CargoErrorList.SYSTEM_ERROR);
				jsonObjectOut.put("errorDescription", CargoErrorList.SYSTEM_ERROR_DESCRIPTION);
			} catch (final Exception e) {
				LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, ""+e);
				e.printStackTrace();
			}
			out.println(jsonObjectOut);
		} finally {
			out.flush();
			out.close();
		}
	}

	private JSONObject loadShortCreditPayment(final HttpServletRequest request) throws Exception {
		String						previousDate						= null;

		try {
			final var	valObjOut 					= new ValueObject();
			final var	discountMasterBLL			= new DiscountMasterBLL();
			final var	cacheManip					= new CacheManip(request);

			final var	executive 						= cacheManip.getExecutive(request);
			final var	lrCreditConfigConfiguration		= cacheManip.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.SHORT_CREDIT_PAYMENT);
			final var 	tdsConfiguration				= cacheManip.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.TDS, ModuleIdentifierConstant.SHORT_CREDIT_PAYMENT);
			final var	generalConfiguration			= cacheManip.getGeneralConfiguration(request, executive.getAccountGroupId());
			final Map<?, ?>	execFldPermissions			= cacheManip.getExecutiveFieldPermission(request);
			String  	minDate							= null;

			final var	allowBackDateEntryForCreditPayment	= execFldPermissions != null && execFldPermissions.get(FeildPermissionsConstant.ALLOW_BACK_DATE_ENTRY_FOR_SHORT_CREDIT_PAYMENT) != null;

			final int	noOfDays = cacheManip.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_MAX_DAYS_OF_OPERATION_BEFORE_CASHSTATEMENT_ENTRY_ID);

			final var	minDateTimeStamp		= cacheManip.getModuleWiseMinDateToGetData(request, executive.getAccountGroupId(),
					ModuleWiseMinDateSelectionConfigurationDTO.LR_CREDIT_PAYMENT_MIN_DATE_ALLOW,
					ModuleWiseMinDateSelectionConfigurationDTO.LR_CREDIT_PAYMENT_MIN_DATE);

			if(minDateTimeStamp != null)
				minDate = DateTimeUtility.getDateFromTimeStamp(minDateTimeStamp);

			if(allowBackDateEntryForCreditPayment)
				previousDate		= DateTimeUtility.getDateBeforeNoOfDays(noOfDays);

			final var	discountList 		= discountMasterBLL.getDiscountTypeDetails();
			final var 	tdsChargeList		= TDSTxnDetailsBllImpl.getTDSChargesList(tdsConfiguration);

			var tdsRate	= 0.0;

			if(ObjectUtils.isNotEmpty(tdsChargeList))
				tdsRate	= tdsChargeList.get(0);

			valObjOut.put(LRCreditConfigurationConstant.LR_CREDIT_CONFIGURATION, lrCreditConfigConfiguration);
			valObjOut.put(TDSPropertiesConstant.TDS_CONFIGURATION, tdsConfiguration);
			valObjOut.put(LRCreditConfigurationConstant.IS_BACK_DATE_ENTRY_ALLOW, allowBackDateEntryForCreditPayment);
			valObjOut.put("searchByCollectionPersonAllow", execFldPermissions != null && execFldPermissions.get(FeildPermissionsConstant.LR_CREDIT_PAYMENT_SEARCH_BY_COLLECTION_PERSON) != null);
			valObjOut.put("previousDate", previousDate);
			valObjOut.put("tdsRate", tdsRate);
			valObjOut.put(ModuleIdentifierConstant.MODULE_ID, ModuleIdentifierConstant.SHORT_CREDIT_PAYMENT);
			valObjOut.put(ModuleIdentifierConstant.INCOME_EXPENSE_MODULE_ID, ModuleIdentifierConstant.INCOME_TYPE_MODULE_ID);
			valObjOut.put(Executive.EXECUTIVE, executive);
			valObjOut.put(GeneralConfiguration.CHEQUE_BOUNCE_REQUIRED, generalConfiguration.getBoolean(GeneralConfiguration.CHEQUE_BOUNCE_REQUIRED, false));
			valObjOut.put(GeneralConfigurationPropertiesConstant.GENERAL_CONFIGURATION, generalConfiguration);
			valObjOut.put("allowChequeBouncePayment", execFldPermissions != null && execFldPermissions.get(FeildPermissionsConstant.ALLOW_CHEQUE_BOUNCE_PAYMENT) != null);
			valObjOut.put("discountInPercent", cacheManip.getModuleWiseDiscountLimit(request, executive.getAccountGroupId(),
					ModuleWiseDiscountLimitConfigurationDTO.SHORT_CREDIT_PAYMENT_DISCOUNT_LIMIT_ALLOW,
					ModuleWiseDiscountLimitConfigurationDTO.SHORT_CREDIT_PAYMENT_DISCOUNT_LIMIT_IN_PERCENT));

			valObjOut.put("minDate", minDate);

			if(discountList != null)
				valObjOut.put("discountTypes", Converter.dtoArrayListtoArrayListWithHashMapConversion(discountList));

			JsonConstant.getInstance().setOutputConstantForLRCredit(valObjOut);

			valObjOut.put(Constant.IVCARGO_VIDEOS, cacheManip.getModuleWiseVideos(request, ModuleIdentifierConstant.SHORT_CREDIT_PAYMENT));

			return JsonUtility.convertionToJsonObjectForResponse(valObjOut);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}
}
