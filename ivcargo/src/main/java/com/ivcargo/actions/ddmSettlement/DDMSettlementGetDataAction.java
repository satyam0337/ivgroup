package com.ivcargo.actions.ddmSettlement;

import java.io.PrintWriter;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONObject;

import com.businesslogic.ddmSettlement.DDMSettlementGetData;
import com.businesslogic.properties.GeneralConfiguration;
import com.framework.Action;
import com.iv.constant.properties.CtoDetainConfigurationConstant;
import com.iv.constant.properties.DDMSettlementPropertiesConstant;
import com.iv.constant.properties.GeneralConfigurationPropertiesConstant;
import com.iv.constant.properties.GenerateCashReceiptPropertiesConstant;
import com.iv.constant.properties.TDSPropertiesConstant;
import com.iv.constant.properties.TripHisabPropertiesConstant;
import com.iv.convertor.JsonConvertor;
import com.iv.dto.constant.FeildPermissionsConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.properties.constant.DisplayDataWithinDateRangePropertiesConstant;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.constant.Constant;
import com.iv.utils.constant.PodWayBillPropertiesConstant;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.webService.WSUtility;
import com.iv.utils.webService.WebServiceURI;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.reports.ReportView;
import com.ivcargo.utils.CacheManip;
import com.ivcargo.utils.JsonUtility;
import com.platform.dao.ShortCreditConfigLimitDao;
import com.platform.dto.AliasNameConstants;
import com.platform.dto.ConfigParam;
import com.platform.dto.DeliveryRunSheetLedger;
import com.platform.dto.Executive;
import com.platform.dto.configuration.discountlimit.ModuleWiseDiscountLimitConfigurationDTO;
import com.platform.dto.configuration.mindateselection.ModuleWiseMinDateSelectionConfigurationDTO;
import com.platform.dto.constant.ExecutiveTypeConstant;
import com.platform.dto.constant.PODDocumentTypeConstant;
import com.platform.dto.model.ReportViewModel;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Converter;

public class DDMSettlementGetDataAction implements Action {

	public static final String TRACE_ID = "DDMSettlementGetDataAction";

	@Override
	@SuppressWarnings("unchecked")
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {

		final HashMap<String,Object>	 	error 							= null;
		JSONObject 							jsonObjectOut					= null;
		PrintWriter							out								= null;
		ValueObject							valObjOut						= null;
		JSONObject							wbIdWiseDelCharges				= null;
		var									noOfDays						= 0;
		ValueObject							tripHisabModelObj				= null;
		LinkedHashMap<Object, Object>		tripHisabHM						= null;
		var									endKilometer					= 0.00;

		try {
			response.setContentType("application/json"); // Setting response for JSON Content
			out					= response.getWriter();
			jsonObjectOut		= new JSONObject();
			final var jsonObjectIn		= new JSONObject(request.getParameter("json"));

			if(request.getSession().getAttribute(AliasNameConstants.EXECUTIVE) == null) {
				jsonObjectOut.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.errorDescription(CargoErrorList.LOGGED_OUT, null));
				out.println(jsonObjectOut);
				return;
			}

			final var valObjToGetData		= JsonUtility.convertJsontoValueObject(jsonObjectIn);

			var	deliveryRunSheetLedgerId	= jsonObjectIn.optLong(AliasNameConstants.DELIVERY_RUN_SHEET_LEDGER_ID, 0);

			final var 	cache					= new CacheManip(request);
			final var 	dataValueObject			= new ValueObject();
			final var 	executive				= cache.getExecutive(request);
			final var 	execFeildPermission		= cache.getExecutiveFieldPermission(request);

			final var 	deliverChgs					= cache.getActiveDeliveryCharges(request, executive.getBranchId());
			final var	generalConfiguration		= cache.getGeneralConfiguration(request, executive.getAccountGroupId());
			final var 	ddmSettlementConfiguration	= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.DDM_SETTLEMENT);
			final var	configuration				= cache.getGenerateCRConfiguration(request, executive.getAccountGroupId());
			final var 	branchdata					= cache.getBranchData(request, executive.getBranchId());
			final var 	removeBranchNameForNormalExecutive	 	= (boolean) ddmSettlementConfiguration.getOrDefault(DDMSettlementPropertiesConstant.REMOVE_BRANCH_NAME_FOR_NORMAL_EXECUTIVE, false);

			final var 	ctoDetainProperties			= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.LR_BLOCKING);
			final var 	displayDataConfig			= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.DISPLAY_DATA_CONFIGURATION);

			valObjToGetData.put(AliasNameConstants.EXECUTIVE, executive);
			valObjToGetData.put(AliasNameConstants.DDM_NUMBER, jsonObjectIn.get(AliasNameConstants.DDM_NUMBER));
			valObjToGetData.put(AliasNameConstants.DELIVERY_RUN_SHEET_LEDGER_ID, deliveryRunSheetLedgerId);

			if(removeBranchNameForNormalExecutive && (executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_EXECUTIVE || executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_BRANCHADMIN))
				valObjToGetData.put(AliasNameConstants.BRANCH_ID, executive.getBranchId());
			else
				valObjToGetData.put(AliasNameConstants.BRANCH_ID, jsonObjectIn.get(AliasNameConstants.BRANCH_ID));

			valObjToGetData.put("ddmBranchId", jsonObjectIn.optLong("ddmBranchId", 0));
			valObjToGetData.put(AliasNameConstants.ALL_GROUP_BRANCHES, cache.getAllGroupBranches(request, executive.getAccountGroupId()));
			valObjToGetData.put(AliasNameConstants.ACTIVE_DELIVERY_CHARGES, deliverChgs);
			valObjToGetData.put(AliasNameConstants.EXECUTIVE_PERMISSIONS, cache.getExecutiveFieldPermission(request));
			valObjToGetData.put(GeneralConfiguration.GENERAL_CONFIGURATION, generalConfiguration);
			valObjToGetData.put(TDSPropertiesConstant.TDS_CONFIGURATION, cache.getTDSConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.DDM_SETTLEMENT));
			valObjToGetData.put(DDMSettlementPropertiesConstant.DDM_SETTLEMENT_CONFIG, ddmSettlementConfiguration);
			valObjToGetData.put("branchdata", branchdata);
			valObjToGetData.put(PodWayBillPropertiesConstant.POD_CONFIGURATION, cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.POD_WAYBILL));

			displayDataConfig.put(Constant.EXEC_FEILD_PERMISSION, execFeildPermission);
			displayDataConfig.put(Constant.EXECUTIVE_TYPE, executive.getExecutiveType());

			valObjToGetData.put(DisplayDataWithinDateRangePropertiesConstant.DISPLAY_DATA_CONFIGURATION_CONSTANT, displayDataConfig);

			final var	minDateTimeStamp			 = cache.getModuleWiseMinDateToGetData(request, executive.getAccountGroupId(),
					ModuleWiseMinDateSelectionConfigurationDTO.DDM_SETTLEMENT_MIN_DATE_ALLOW,
					ModuleWiseMinDateSelectionConfigurationDTO.DDM_SETTLEMENT_MIN_DATE);

			final var discountInPercent			=  cache.getModuleWiseDiscountLimit(request, executive.getAccountGroupId(),
					ModuleWiseDiscountLimitConfigurationDTO.DDM_SETTLEMENT_DISCOUNT_LIMIT_ALLOW,
					ModuleWiseDiscountLimitConfigurationDTO.DDM_SETTLEMENT_DISCOUNT_LIMIT_IN_PERCENT);

			final var allowBackDateForSettlement	 	= (boolean) ddmSettlementConfiguration.getOrDefault(DDMSettlementPropertiesConstant.ALLOW_BACK_DATE_FOR_SETTLEMENT, false);
			final var discountColumnPermissionBased	 	= (boolean) ddmSettlementConfiguration.getOrDefault(DDMSettlementPropertiesConstant.DISCOUNT_COLUMN_PERMISSION_BASED, false);
			final var allowBackTimeForSettlement	 	= (boolean) ddmSettlementConfiguration.getOrDefault(DDMSettlementPropertiesConstant.ALLOW_BACK_TIME_FOR_SETTLEMENT, false);

			final var tripHisabProperties			= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.TRIP_HISAB_SETTLEMENT);
			final boolean isTripHisabRequired = (Boolean) tripHisabProperties.getOrDefault(TripHisabPropertiesConstant.TRIP_HISAB_DDM_REQUIRED, false);

			if(execFeildPermission != null && execFeildPermission.get(FeildPermissionsConstant.ALLOW_BACK_DATE_IN_DDM_SETTLEMENT) != null && allowBackDateForSettlement)
				noOfDays 		= cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_MAX_DAYS_OF_OPERATION_BEFORE_CASHSTATEMENT_ENTRY_ID);

			final var	backDate		= DateTimeUtility.getDateBeforeNoOfDays(noOfDays);

			valObjToGetData.put(AliasNameConstants.MIN_DATE_TIMESTAMP, minDateTimeStamp);

			final var ddmSettlementGetData 	= new DDMSettlementGetData();

			if(discountColumnPermissionBased)
				ddmSettlementConfiguration.put(DDMSettlementPropertiesConstant.IS_DISCOUNT_SHOW, execFeildPermission != null && execFeildPermission.get(FeildPermissionsConstant.DISCOUNT_IN_DDM_SETTLEMENT) != null);

			ddmSettlementConfiguration.put(GenerateCashReceiptPropertiesConstant.READ_ONLY_DELIVERY_DISCOUNT, configuration.getBoolean(GenerateCashReceiptPropertiesConstant.READ_ONLY_DELIVERY_DISCOUNT, false));
			ddmSettlementConfiguration.put(GenerateCashReceiptPropertiesConstant.READ_ONLY_DELIVERY_DISCOUNT_FOR_TOPAY_ONLY, configuration.getBoolean(GenerateCashReceiptPropertiesConstant.READ_ONLY_DELIVERY_DISCOUNT_FOR_TOPAY_ONLY, false));

			if(deliveryRunSheetLedgerId > 0)
				valObjOut			= ddmSettlementGetData.getDDMSettlementData(valObjToGetData, dataValueObject);
			else
				valObjOut			= ddmSettlementGetData.getSettlementDataOfDDM(valObjToGetData, dataValueObject);

			if(valObjOut == null) {
				jsonObjectOut.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.errorDescription(CargoErrorList.NO_RECORDS, null));
				out.println(jsonObjectOut);
				return;
			}

			deliveryRunSheetLedgerId = valObjOut.getLong(AliasNameConstants.DELIVERY_RUN_SHEET_LEDGER_ID, 0);

			valObjOut.put("tripHisabProperties", tripHisabProperties);

			if(isTripHisabRequired && deliveryRunSheetLedgerId > 0) {
				final var tripHisab	= new StringBuilder();

				tripHisab.append("&accountGroupId=" + executive.getAccountGroupId());
				tripHisab.append("&deliveryRunSheetLedgerId=" + deliveryRunSheetLedgerId);
				tripHisab.append("&branchId="+ executive.getBranchId());
				tripHisab.append("&executiveId="+ executive.getExecutiveId());

				final var tripHisabObj = WSUtility.callPostWebService(WSUtility.getWebServiceUrl(Integer.toString(WebServiceURI.GET_TRIP_HISAB_DDM_DETAILS_BY_DELIVERY_RUN_SHEET_LEDGER_ID)), tripHisab.toString());

				if(tripHisabObj != null) {
					final var tripHisabObjStr = tripHisabObj.getString(WSUtility.WEB_SERVICE_RESULT);

					if(tripHisabObjStr != null)
						tripHisabModelObj   = JsonConvertor.toValueObjectFormSimpleJsonString(tripHisabObjStr);

					if(tripHisabModelObj != null)
						tripHisabHM   = (LinkedHashMap<Object, Object>) tripHisabModelObj.get("model");

					if(tripHisabHM != null)
						endKilometer = (double) tripHisabHM.getOrDefault("endKilometerReading",0);
				}
			}

			request.setAttribute("endKilometer", endKilometer);

			final var deliveryRunSheetLedgerArr	= (DeliveryRunSheetLedger[]) valObjOut.get(AliasNameConstants.DELIVERY_RUN_SHEET_LEDGER);

			valObjOut.put(AliasNameConstants.DELIVERY_RUN_SHEET_LEDGER, Converter.arrayDtotoArrayListWithHashMapConversion(deliveryRunSheetLedgerArr));

			if(deliveryRunSheetLedgerArr != null && deliveryRunSheetLedgerArr.length > 1) {
				jsonObjectOut 			= JsonUtility.convertionToJsonObjectForResponse(valObjOut);
				out.println(jsonObjectOut);
				return;
			}

			final Map<Long, String> delChargeIdWiseName		= (HashMap<Long, String>) valObjOut.get(AliasNameConstants.ACTIVE_DELIVERY_CHARGES);
			final var 		paymentTypePermission	= (ValueObject) valObjOut.get(AliasNameConstants.PAYMENT_TYPE_PERMISSIONS);
			final var 		discountTypes			= (ValueObject) valObjOut.get(AliasNameConstants.DISCOUNT_TYPES);

			if(valObjOut.get(AliasNameConstants.WB_ID_WISE_DELIVERY_CHARGES) != null) {
				final var wayBillIdWiseDeliverychargesHM	= (Map<Long, Map<Long, Double>>) valObjOut.get(AliasNameConstants.WB_ID_WISE_DELIVERY_CHARGES);

				if(wayBillIdWiseDeliverychargesHM != null && wayBillIdWiseDeliverychargesHM.size() > 0)
					wbIdWiseDelCharges			= ddmSettlementGetData.getJSONObjForWBIdWiseDelChrgs(wayBillIdWiseDeliverychargesHM);
			}

			final Map<Long, String>	panNumberHM						= (HashMap<Long, String>) valObjOut.get(AliasNameConstants.PAN_NUMBER_HM);
			final Map<Long, Short> 	shortCreditAllowOnTxnTypeHM		= (HashMap<Long, Short>) valObjOut.get(AliasNameConstants.SHORT_CREDIT_ALLOW_ON_TXN_TYPE_HM);
			final var 		deliveryChargeList				= (List<String>) valObjOut.get("deliveryChargeList");

			valObjOut.put(PodWayBillPropertiesConstant.POD_CONFIGURATION, cache.getPODWayBillConfiguration(request, executive.getAccountGroupId()));

			if((boolean) ddmSettlementConfiguration.getOrDefault(DDMSettlementPropertiesConstant.SHORT_CREDIT_CONFIG_LIMIT_ALLOWED,false))
				valObjOut.put("shortCreditConfigLimit", ShortCreditConfigLimitDao.getInstance().getShortCreditConfigLimit(executive.getBranchId(), executive.getAccountGroupId()));

			valObjOut.put("endKilometer", endKilometer);
			valObjToGetData.put(GeneralConfigurationPropertiesConstant.GENERAL_CONFIGURATION, generalConfiguration);

			jsonObjectOut 			= JsonUtility.convertionToJsonObjectForResponse(valObjOut);

			jsonObjectOut.put(AliasNameConstants.ACTIVE_DELIVERY_CHARGES, new JSONObject(delChargeIdWiseName));
			jsonObjectOut.put(AliasNameConstants.PAYMENT_TYPE_PERMISSIONS, JsonUtility.convertionToJsonObjectForResponse(paymentTypePermission));

			jsonObjectOut.put("chargeIdArray", new JSONArray(deliveryChargeList));

			if(discountTypes != null)
				jsonObjectOut.put(AliasNameConstants.DISCOUNT_TYPES, JsonUtility.convertionToJsonObjectForResponse(discountTypes));

			if(panNumberHM != null && panNumberHM.size() > 0)
				jsonObjectOut.put(AliasNameConstants.PAN_NUMBER_HM, new JSONObject(panNumberHM));

			if(shortCreditAllowOnTxnTypeHM != null)
				jsonObjectOut.put(AliasNameConstants.SHORT_CREDIT_ALLOW_ON_TXN_TYPE_HM, shortCreditAllowOnTxnTypeHM);

			if(wbIdWiseDelCharges != null)
				jsonObjectOut.put(AliasNameConstants.WB_ID_WISE_DELIVERY_CHARGES, wbIdWiseDelCharges);

			jsonObjectOut.put(Executive.EXECUTIVE, executive);
			jsonObjectOut.put(Constant.SUB_REGION_ID, executive.getSubRegionId());
			jsonObjectOut.put("allowBackDateForSettlement", allowBackDateForSettlement);
			jsonObjectOut.put(CtoDetainConfigurationConstant.CTO_DETAIN_STATUS_NAME, ctoDetainProperties.getOrDefault(CtoDetainConfigurationConstant.CTO_DETAIN_STATUS_NAME, ""));
			jsonObjectOut.put("backDate", backDate);
			jsonObjectOut.put("podDocumentTypeArr", Converter.arrayDtotoArrayListWithHashMapConversion(PODDocumentTypeConstant.setPODDocumentTypeArrForSelection()));
			jsonObjectOut.put("discountInPercent", discountInPercent);
			jsonObjectOut.put("allowBackTimeForSettlement", allowBackTimeForSettlement);

			var reportViewModel = new ReportViewModel();
			reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);

			out.println(jsonObjectOut);
		} catch (final Exception e) {
			jsonObjectOut.put("errorDescription", CargoErrorList.SYSTEM_ERROR_DESCRIPTION);
			out.println(jsonObjectOut);
			ActionStepsUtil.catchJSONException(jsonObjectOut,out);
			out.println(jsonObjectOut);
			ActionStepsUtil.catchActionException(request, e, error);
		} finally {
			if (out != null) {
				out.flush();
				out.close();
			}
		}
	}
}