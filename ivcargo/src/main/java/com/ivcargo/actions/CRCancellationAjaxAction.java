
package com.ivcargo.actions;

//~--- non-JDK imports --------------------------------------------------------

import java.io.PrintWriter;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONObject;

import com.businesslogic.CRCancellationBLL;
import com.businesslogic.properties.GeneralConfiguration;
import com.framework.Action;
import com.iv.bll.impl.properties.GenerateCRConfigurationBllImpl;
import com.iv.constant.properties.GenerateCRMultipleLRConfigurationConstant;
import com.iv.constant.properties.LrViewConfigurationPropertiesConstant;
import com.iv.constant.properties.lhpv.LHPVPropertiesConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.logsapp.LogWriter;
import com.iv.utils.constant.PodWayBillPropertiesConstant;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.utils.CacheManip;
import com.ivcargo.utils.JsonUtility;
import com.platform.dto.AccountGroupTieUpConfiguration;
import com.platform.dto.AliasNameConstants;
import com.platform.dto.ConfigParam;
import com.platform.dto.DeliveryContactDetailsModel;
import com.platform.dto.Executive;
import com.platform.dto.TransportListMaster;
import com.platform.dto.WayBillTaxDetails;
import com.platform.dto.configuration.mindateselection.ModuleWiseMinDateSelectionConfigurationDTO;
import com.platform.dto.configuration.modules.BankStatementConfigurationDTO;
import com.platform.dto.configuration.modules.CashStatementConfigurationDTO;
import com.platform.dto.configuration.modules.GenerateCashReceiptDTO;
import com.platform.dto.configuration.modules.GroupConfigurationPropertiesDTO;
import com.platform.dto.configuration.modules.LrCostConfigurationDTO;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

public class CRCancellationAjaxAction implements Action {

	public static final String TRACE_ID = CRCancellationAjaxAction.class.getName();

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
			case 1: {
				out.println(getCRData(request, jsonObjectOut, jsonObjectIn));
				break;
			}
			case 2: {
				out.println(cancelCRForMultipleLR(request, jsonObjectOut, jsonObjectIn));
				break;
			}
			default: {
				jsonObjectOut.put("errorDescription", "Unknown Request");
				out.println(jsonObjectOut);
				break;
			}
			}
		} catch (final Exception _e) {
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR,_e);
			try {
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
			out							= null;
			jsonObjectIn				= null;
			jsonObjectOut				= null;
			filter						= 0;
		}
	}

	private JSONObject getCRData(final HttpServletRequest request, final JSONObject jsonObjectOut, final JSONObject jsonObjectIn) throws Exception {

		Executive						executive					= null;
		CacheManip						cache						= null;
		ValueObject						valObjIn					= null;
		ValueObject						valObjOut					= null;
		CRCancellationBLL				crCancellationBLL			= null;
		HashMap<?, ?>					execFldPermissions			= null;
		DeliveryContactDetailsModel[]	deliveryArr					= null;
		Timestamp						minDateTimeStamp			= null;

		try {
			cache				= new CacheManip(request);
			execFldPermissions	= (HashMap<?, ?>) request.getSession().getAttribute(AliasNameConstants.EXEC_FEILD_PERMISSIONS);

			valObjIn			= JsonUtility.convertJsontoValueObject(jsonObjectIn);
			valObjOut			= JsonUtility.convertJsontoValueObject(jsonObjectOut);
			executive			= (Executive) request.getSession().getAttribute(AliasNameConstants.EXECUTIVE);

			minDateTimeStamp	= cache.getModuleWiseMinDateToGetData(request, executive.getAccountGroupId(),
					ModuleWiseMinDateSelectionConfigurationDTO.CANCEL_CR_MIN_DATE_ALLOW,
					ModuleWiseMinDateSelectionConfigurationDTO.CANCEL_CR_MIN_DATE);

			valObjIn.put(AliasNameConstants.EXECUTIVE, executive);
			valObjIn.put(AliasNameConstants.ALL_BRANCHES, cache.getGenericBranchesDetail(request));
			valObjIn.put(AliasNameConstants.EXEC_FEILD_PERMISSIONS, execFldPermissions);
			valObjIn.put(AliasNameConstants.MIN_DATE_TIMESTAMP, minDateTimeStamp);
			valObjIn.put(GenerateCashReceiptDTO.GENERATE_CASH_RECEIPT_CONFIGURATION, cache.getGenerateCRConfiguration(request, executive.getAccountGroupId()));

			crCancellationBLL	= new CRCancellationBLL();

			valObjOut			= crCancellationBLL.getDataForCrCancellation(valObjIn);

			if (valObjOut == null) {
				jsonObjectOut.put("userErrorDescription", CargoErrorList.NO_RECORDS_DESCRIPTION);
				return jsonObjectOut;
			}

			if(valObjOut.get("errorDescription") != null){
				jsonObjectOut.put("userErrorDescription", valObjOut.get("errorDescription"));
				return jsonObjectOut;
			}
			if(valObjOut.get("userErrorDescription") != null){
				jsonObjectOut.put("userErrorDescription", valObjOut.get("userErrorDescription"));
				return jsonObjectOut;
			}

			if(valObjOut.containsKey("deliveryArr")) {
				deliveryArr = (DeliveryContactDetailsModel[])valObjOut.get("deliveryArr");
				jsonObjectOut.put("deliveryArr", getJSONObjForDeliveryContactDetailsModels(deliveryArr));
			}

			jsonObjectOut.put("centralizedMultiLRSingleCRCancellation", valObjOut.getBoolean("centralizedMultiLRSingleCRCancellation", false));
			jsonObjectOut.put("showCancelleddByExecutiveList", valObjOut.getBoolean("showCancelleddByExecutiveList",false));

			return jsonObjectOut;
		} catch (final Exception e) {
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, e);
			throw e;
		} finally {
			executive				= null;
			cache					= null;
			valObjIn				= null;
			valObjOut				= null;
		}
	}

	private JSONArray getJSONObjForDeliveryContactDetailsModels(final DeliveryContactDetailsModel[]	modelArray) throws Exception{

		JSONArray	jsonaArray		= null;

		try {

			jsonaArray		= new JSONArray();

			if(modelArray == null || modelArray.length <= 0)
				return jsonaArray;

			for (final DeliveryContactDetailsModel element : modelArray)
				jsonaArray.put(new JSONObject(element));

			return jsonaArray;

		} catch (final Exception e) {
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, "Error : "+e);
			throw e;
		} finally {
			jsonaArray		= null;
		}
	}

	private JSONObject cancelCRForMultipleLR(final HttpServletRequest request, final JSONObject jsonObjectOut, final JSONObject jsonObjectIn) throws Exception {

		CacheManip							cache							= null;
		ValueObject							valObjIn						= null;
		ValueObject							valObjOut						= null;
		CRCancellationBLL					crCancellationBLL				= null;
		Executive							executive						= null;
		ValueObject							lrWiseJsonValueObject			= null;
		JSONArray 							values 							= null;
		ArrayList<Long>                     deliveryLocationList			= null;

		try {

			cache					= new CacheManip(request);
			crCancellationBLL		= new CRCancellationBLL();
			valObjIn				= new ValueObject();

			valObjIn				 = JsonUtility.convertJsontoValueObject(jsonObjectIn);
			valObjOut				 = JsonUtility.convertJsontoValueObject(jsonObjectOut);
			executive			 	 = cache.getExecutive(request);
			values					 = jsonObjectIn.getJSONArray("lrWiseJsonValueObject");
			lrWiseJsonValueObject	 = new ValueObject();

			final var	configuration			 = GenerateCRConfigurationBllImpl.getInstance().getPropertyForGenerateCRForMultipleLR(executive.getAccountGroupId());

			for (var i = 0; i < values.length(); i++)
				lrWiseJsonValueObject.put(i, JsonUtility.convertJsontoValueObject(values.getJSONObject(i)));

			deliveryLocationList 		= cache.getAssignedLocationsIdListByLocationIdId(request, executive.getBranchId(), executive.getAccountGroupId());

			valObjIn.put("executive", executive);
			valObjIn.put("lrWiseJsonValueObject", lrWiseJsonValueObject);
			valObjIn.put("chargeValueObject", cache.getChargeTypeMasterData(request));
			valObjIn.put("taxValueObject", cache.getTaxMasterData(request));
			valObjIn.put("branchesColl", cache.getGenericBranchesDetail(request));
			valObjIn.put("deliveryLocationList", deliveryLocationList);
			valObjIn.put("configValueOfPDS", cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_PENDING_DELIVERY_STOCK_TABLE_ENTRY_AT_BOOKING_LEVEL));
			valObjIn.put("configValueForDelivery", cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_DELIVERY_ACCESSIBILITY));
			valObjIn.put("configKeySTReport", cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_SERVICE_TAX_REPORT));
			valObjIn.put("configKeyPendingDeliveryTableEntry", cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_PENDING_DELIVERY_STOCK_TABLE_ENTRY));
			valObjIn.put(AccountGroupTieUpConfiguration.ACCOUNT_GROUP_TIE_UP_CONFIGURATION_HM, cache.getAccountGroupTieUpConfiguration(request, executive.getAccountGroupId()));
			valObjIn.put(GeneralConfiguration.GENERAL_CONFIGURATION, cache.getGeneralConfiguration(request, executive.getAccountGroupId()));
			valObjIn.put(GenerateCashReceiptDTO.GENERATE_CASH_RECEIPT_CONFIGURATION, cache.getGenerateCRConfiguration(request, executive.getAccountGroupId()));
			valObjIn.put(LrCostConfigurationDTO.LR_COST_CONFIGURATION, cache.getGroupWiseLRCostConfiguration(request, executive.getAccountGroupId()));
			valObjIn.put(GroupConfigurationPropertiesDTO.GROUP_CONFIGURATION, cache.getGroupConfiguration(request, executive.getAccountGroupId()));
			valObjIn.put(WayBillTaxDetails.WAYBILL_TYPE_WISE_SERVICE_TAX_DATE, cache.wayBillTypeWiseServiceTaxDate(request, executive.getAccountGroupId()));
			valObjIn.put(CashStatementConfigurationDTO.CASH_STATEMENT_CONFIGURATION, cache.getCashStatementConfiguration(request, executive.getAccountGroupId()));
			valObjIn.put(BankStatementConfigurationDTO.BANK_STATEMENT_CONFIGURATION, cache.getBankStatementConfiguration(request, executive.getAccountGroupId()));
			valObjIn.put(PodWayBillPropertiesConstant.POD_CONFIGURATION, cache.getPODWayBillConfiguration(request, executive.getAccountGroupId()));
			valObjIn.put(LHPVPropertiesConstant.LHPV_CONFIGURATION, cache.getLhpvConfiguration(request, executive.getAccountGroupId()));
			valObjIn.put(TransportListMaster.TRANSPORT_LIST, cache.getTransportList(request));
			valObjIn.put(GenerateCRMultipleLRConfigurationConstant.CENTRALIZED_MULTI_LR_SINGLE_CR_CANCELLATION, configuration.getOrDefault(GenerateCRMultipleLRConfigurationConstant.CENTRALIZED_MULTI_LR_SINGLE_CR_CANCELLATION, false));
			valObjIn.put(LrViewConfigurationPropertiesConstant.LR_VIEW_CONFIGURATION_PROPERTY, cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.LR_SEARCH));
			valObjIn.put("phonePayPaymentTypeConfiguration", cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.PAYMENT_TYPE, ModuleIdentifierConstant.PHONE_PE_API));

			valObjOut	= crCancellationBLL.crCancellationProcessForMultipleLR(valObjIn);

			if (valObjOut == null) {
				valObjOut	= new ValueObject();
				valObjOut.put("errorDescription", CargoErrorList.WAYBILL_NOT_FOUND_DESCRIPTION);
			}

			return JsonUtility.convertionToJsonObjectForResponse(valObjOut);
		} catch (final Exception e) {
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, e);
			throw e;
		} finally {
			executive				= null;
			cache					= null;
			valObjIn				= null;
			valObjOut				= null;
		}
	}
}
