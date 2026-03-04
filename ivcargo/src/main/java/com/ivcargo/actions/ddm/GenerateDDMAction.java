package com.ivcargo.actions.ddm;

import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringUtils;
import org.json.JSONArray;
import org.json.JSONObject;

import com.businesslogic.ddm.GenerateDDMBLL;
import com.framework.Action;
import com.iv.bll.impl.properties.TripHisabSettlementConfigBllImpl;
import com.iv.constant.properties.DDMConfigurationConstant;
import com.iv.constant.properties.TripHisabPropertiesConstant;
import com.iv.dto.constant.FeildPermissionsConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.dto.constant.VehicleOwnerConstant;
import com.iv.dto.master.TaxModel;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.constant.Constant;
import com.iv.utils.constant.PodWayBillPropertiesConstant;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.exception.ExceptionProcess;
import com.iv.utils.utility.CollectionUtility;
import com.iv.utils.webService.WSUtility;
import com.iv.utils.webService.WebServiceURI;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.AliasNameConstants;
import com.platform.dto.ConfigParam;
import com.platform.dto.DoorDeliveryMemo;
import com.platform.dto.Executive;
import com.platform.dto.ExpenseVoucherPaymentDetails;
import com.platform.dto.configuration.modules.DocumentCodeConfigurationDTO;
import com.platform.dto.configuration.modules.LrCostConfigurationDTO;
import com.platform.dto.constant.PaymentTypeConstant;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

public class GenerateDDMAction implements Action{

	public static final String 	TRACE_ID  	= "GenerateDDMAction";


	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>			error 							= null;
		PrintWriter						out								= null;
		JSONObject						jsonObjectOut					= null;
		var							paymentType						= PaymentTypeConstant.PAYMENT_TYPE_CASH_ID;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			response.setContentType("application/json"); // Setting response for JSON Content
			out					= response.getWriter();
			jsonObjectOut		= new JSONObject();

			if(request.getParameter("json") == null) {
				jsonObjectOut.put(CargoErrorList.ERROR_DESCRIPTION, "Data not found to generate DDM, Try again after clear browser history!");
				out.println(jsonObjectOut);
				return;
			}

			final var jsonObjectIn		= new JSONObject(request.getParameter("json"));

			if (request.getAttribute("paymentType") != null)
				paymentType	= Utility.getShort(request.getAttribute("paymentType"));

			if(request.getSession().getAttribute("executive") == null) {
				jsonObjectOut.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.errorDescription(CargoErrorList.LOGGED_OUT, null));
				out.println(jsonObjectOut);
				return;
			}

			final var	cache 							= new CacheManip(request);
			final var	executive 						= cache.getExecutive(request);
			final HashMap<?, ?>			execFldPermissions				= cache.getExecutiveFieldPermission(request);
			final var	ddmPropertiesHM 				= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.CREATE_DDM);
			final var	valueInObject					= getRequestData(request, executive, cache, jsonObjectIn, execFldPermissions, ddmPropertiesHM);
			final var	expenseVoucherPaymentDetails	= createExpenseVoucherPaymentDetails(jsonObjectIn, paymentType);
			final var	tripHisabProperties				= TripHisabSettlementConfigBllImpl.getInstance().getTripHisabSettlementProperties(executive.getAccountGroupId());
			final var	isTripHisabDDMRequired			= (boolean) tripHisabProperties.getOrDefault(TripHisabPropertiesConstant.TRIP_HISAB_DDM_REQUIRED, false);
			final var	vehicleType						= jsonObjectIn.optInt("vehicleType", 0);

			if(valueInObject == null) {
				jsonObjectOut.put(CargoErrorList.ERROR_DESCRIPTION, "Invalid Vehicle Number");
				out.println(jsonObjectOut);
				return;
			}

			valueInObject.put(AliasNameConstants.ACTIVE_DELIVERY_CHARGES, cache.getActiveDeliveryCharges(request, executive.getBranchId()));
			valueInObject.put("expenseVoucherPaymentDetails", expenseVoucherPaymentDetails);
			valueInObject.put("execFldPermissions", execFldPermissions);
			valueInObject.put("srcBranch", cache.getGenericBranchDetailCache(request, executive.getBranchId()));
			valueInObject.put(DocumentCodeConfigurationDTO.DOCUMENT_CODE_CONFIGURATION, cache.getDocumentCodeConfiguration(request, executive.getAccountGroupId()));
			valueInObject.put(TaxModel.TAX_MODEL_ARR, cache.getTaxes(request, executive));
			valueInObject.put(DDMConfigurationConstant.DDM_CONFIGURATION, ddmPropertiesHM);
			valueInObject.put(PodWayBillPropertiesConstant.POD_CONFIGURATION, cache.getPODWayBillConfiguration(request, executive.getAccountGroupId()));

			final var	outValObj 		= GenerateDDMBLL.getInstance().createDDMWithExpenseVoucher(valueInObject);

			if(outValObj == null) {
				jsonObjectOut.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.errorDescription(CargoErrorList.SYSTEM_ERROR, null));
				out.println(jsonObjectOut);
				return;
			}

			if(outValObj.get(AliasNameConstants.ERROR_DESCRIPTION) != null){
				jsonObjectOut.put(CargoErrorList.ERROR_DESCRIPTION, outValObj.get(AliasNameConstants.ERROR_DESCRIPTION));
				out.println(jsonObjectOut);
				return;
			}

			final var	deliveryRunSheetLedgerId = outValObj.getLong("deliveryRunSheetLedgerId", 0);

			final var vehicleOwnerList = CollectionUtility.getShortListFromString((String) tripHisabProperties.getOrDefault(TripHisabPropertiesConstant.VEHICLE_OWNER_TYPE_IDS, VehicleOwnerConstant.OWN_VEHICLE_ID + ""));

			if(deliveryRunSheetLedgerId > 0 && isTripHisabDDMRequired && vehicleOwnerList.contains(Short.parseShort(Integer.toString(vehicleType)))) {
				final var	tripHisabDDM	= new StringBuilder();

				tripHisabDDM.append("&ravanaExpenseEle=" + jsonObjectIn.optDouble("ravanaExpense", 0.00));
				tripHisabDDM.append("&kilometerReadingEle=" + jsonObjectIn.optDouble("kilometerReading", 0.00));
				tripHisabDDM.append("&dieselLiterEle=" + jsonObjectIn.optDouble("dieselLiter", 0.00));
				tripHisabDDM.append("&dieselRatePerLiterEle=" + jsonObjectIn.optDouble("dieselRatePerLiter", 0.00));
				tripHisabDDM.append("&dieselLiterByEle_primary_key=" + jsonObjectIn.optInt("dieselLiterBy", 0));
				tripHisabDDM.append("&tripHisabRemarkEle=" + jsonObjectIn.optString("tripHisabRemark", ""));
				tripHisabDDM.append("&deliveryRunSheetLedgerId=" + deliveryRunSheetLedgerId);
				tripHisabDDM.append("&vehicleNumberMasterId=" + jsonObjectIn.optLong("selectedVehicleNumberMasterId", 0));
				tripHisabDDM.append("&driverMasterId=" + jsonObjectIn.optLong("driverId", 0));
				tripHisabDDM.append("&accountGroupId=" + executive.getAccountGroupId());
				tripHisabDDM.append("&branchId=" + executive.getBranchId());
				tripHisabDDM.append("&executiveId=" + executive.getExecutiveId());
				tripHisabDDM.append("&vehicleType=" + vehicleType);
				tripHisabDDM.append("&DDMNumber=" + outValObj.getString("DDMNo",""));

				if(valueInObject.getBoolean("isManualDDM",false))
					tripHisabDDM.append("&manualDDMDate=" + valueInObject.getString("manualDDMDate",""));
				else
					tripHisabDDM.append("&manualDDMDate=" + DateTimeUtility.getCurrentDateString());

				WSUtility.callPostWebService(WSUtility.getWebServiceUrl(Integer.toString(WebServiceURI.PROCESS_TRIP_HISAB_AFTER_DDM_CREATION)), tripHisabDDM.toString());
			}

			if (deliveryRunSheetLedgerId <= 0) {
				jsonObjectOut.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.DDM_ERROR_DESCRIPTION);
				out.println(jsonObjectOut);
				return;
			}

			jsonObjectOut.put("deliveryRunSheetLedgerId", deliveryRunSheetLedgerId);
			jsonObjectOut.put("DDMNo", outValObj.get("DDMNo").toString());

			out.println(jsonObjectOut);
		} catch (final Exception e) {
			ActionStaticUtil.catchJSONException(jsonObjectOut,out);
			out.println(jsonObjectOut);
			ActionStaticUtil.catchActionException(request, e, error);
		} finally {
			if (out != null) {
				out.flush();
				out.close();
			}
		}
	}

	private ValueObject getRequestData (final HttpServletRequest request, final Executive executive, final CacheManip cache, final JSONObject jsonObjectIn, final HashMap<?, ?> execFldPermissions,
			final Map<Object, Object> ddmPropertiesHM) throws Exception {
		var 		destinationId 			= 0L;
		var			ddmLorryHire			= 0.00;

		try {
			final var	isDefaultDestinationId 				= (boolean) ddmPropertiesHM.getOrDefault(DDMConfigurationConstant.IS_DEFAULT_DESTINATION_ID, false);
			final var	truckNumberValidation				= (boolean) ddmPropertiesHM.getOrDefault(DDMConfigurationConstant.TRUCK_NUMBER_VALIDATION, false);
			final var	manualDDMWithoutSequence		= (boolean) ddmPropertiesHM.getOrDefault(DDMConfigurationConstant.MANUAL_DDM_WITHOUT_SEQUENCE, false);

			final var	reqParamValObj	= new ValueObject();

			if(jsonObjectIn.get("selectedVehicleNumberMasterId") == null && jsonObjectIn.get("vehicleNumber") == null )
				return null;

			final var	vehicleNumberId = jsonObjectIn.optLong("selectedVehicleNumberMasterId", 0);

			if(vehicleNumberId <= 0 && truckNumberValidation)
				return null;

			reqParamValObj.put("vehicleNumberMasterId", jsonObjectIn.optLong("selectedVehicleNumberMasterId", 0));

			destinationId = jsonObjectIn.optLong("destinationBranchId", 0);

			if(destinationId > 0)
				reqParamValObj.put("destinationBranchId", destinationId);
			else
				reqParamValObj.put("destinationBranchId", executive.getBranchId());

			if(isDefaultDestinationId)
				reqParamValObj.put("destinationBranchId", 0);

			reqParamValObj.put("executiveAccountGroupId", executive.getAccountGroupId());
			reqParamValObj.put("executiveBranchId", executive.getBranchId());
			reqParamValObj.put("executiveId", executive.getExecutiveId());
			reqParamValObj.put("allGenericBranches", cache.getGenericBranchesDetail(request));
			reqParamValObj.put(Constant.REMARK, jsonObjectIn.optString(Constant.REMARK, ""));
			reqParamValObj.put("vehicleNumber", StringUtils.upperCase(jsonObjectIn.optString("vehicleNumber", "")));
			reqParamValObj.put("driverName", StringUtils.upperCase(jsonObjectIn.optString("driverName", "")));
			reqParamValObj.put("driverMobileNumber", jsonObjectIn.optString("driverMobileNumber", "0000000000"));
			reqParamValObj.put("driverId", jsonObjectIn.optLong("driverId", 0));
			reqParamValObj.put("vehicleAgent", jsonObjectIn.optString("vehicleAgent", null));
			reqParamValObj.put("totalActualWeight", jsonObjectIn.optDouble("totalActualWeight", 0.0));
			reqParamValObj.put("totalNoOfForms", jsonObjectIn.optLong("totalNoOfForms", 0));
			reqParamValObj.put("totalNoOfPackages", jsonObjectIn.optLong("totalNoOfPackages", 0));
			reqParamValObj.put("totalNoOfWayBills", jsonObjectIn.optLong("totalNoOfWayBills", 0));
			reqParamValObj.put("deliveryExecutiveName", StringUtils.upperCase(jsonObjectIn.optString("deliveryExecutiveName", "")));
			reqParamValObj.put("deliveryExecutiveNumber", StringUtils.upperCase(jsonObjectIn.optString("deliveryExecutiveNumber", "")));
			reqParamValObj.put("isManualDDM", jsonObjectIn.optBoolean("isManualDDM", false));
			reqParamValObj.put("newConsigneeCorpAccId", jsonObjectIn.optLong("newConsigneeCorpAccId", 0));
			reqParamValObj.put("articleRate", jsonObjectIn.optDouble("articleRate", 0));
			reqParamValObj.put(Constant.COLLECTION_PERSON_ID, jsonObjectIn.optLong(Constant.COLLECTION_PERSON_ID, 0));
			reqParamValObj.put(Constant.BILL_SELECTION_ID, jsonObjectIn.optLong(Constant.BILL_SELECTION_ID, 0));
			reqParamValObj.put(Constant.VEHICLE_AGENT_MASTER_ID, jsonObjectIn.optLong(Constant.VEHICLE_AGENT_MASTER_ID, 0));
			reqParamValObj.put(Constant.HAMAL_MASTER_ID, jsonObjectIn.optLong(Constant.HAMAL_MASTER_ID, 0));
			reqParamValObj.put(Constant.DIVISION_ID, jsonObjectIn.optLong(Constant.DIVISION_ID, 0));

			if(isDefaultDestinationId)
				reqParamValObj.put("truckDestination", StringUtils.upperCase(jsonObjectIn.optString("truckDestination", "")));

			if(jsonObjectIn.optBoolean("isManualDDM", false)) {
				if(execFldPermissions.get(FeildPermissionsConstant.MANUAL_DDM_WITH_AUTO_DDM_SEQUENCE) != null)
					reqParamValObj.put("manualDDMDate", jsonObjectIn.optString("manualDDMDate", null));

				if(execFldPermissions.get(FeildPermissionsConstant.MANUAL_DDM_WITH_MANUAL_DDM_SEQUENCE) != null || manualDDMWithoutSequence){
					reqParamValObj.put("manualDDMDate", jsonObjectIn.optString("manualDDMDate", null));
					reqParamValObj.put("manualDDMNumber", jsonObjectIn.optString("manualDDMNumber", null));
				}
			}

			reqParamValObj.put("openingkilometerEle", jsonObjectIn.optDouble("openingkilometerEle",0));
			reqParamValObj.put(Constant.LOADER_NAME, jsonObjectIn.optString(Constant.LOADER_NAME, null));
			reqParamValObj.put(Constant.DELIVERY_MAN_1, jsonObjectIn.optString(Constant.DELIVERY_MAN_1, null));
			reqParamValObj.put(Constant.DELIVERY_MAN_2, jsonObjectIn.optString(Constant.DELIVERY_MAN_2, null));

			final var	waybillIdArray = (JSONArray) jsonObjectIn.get("waybillIdArray");

			final var	wbIdArray	= new Long[waybillIdArray.length()];

			for(var i = 0; i < waybillIdArray.length(); i++)
				wbIdArray[i] = waybillIdArray.getLong(i);

			reqParamValObj.put("wbIdArray", wbIdArray);
			reqParamValObj.put("deliveryCharges", cache.getActiveDeliveryCharges(request, executive.getBranchId()));

			final var	waybillDetailsHsmp = new HashMap<Long, DoorDeliveryMemo>();

			for(var i = 0; i < waybillIdArray.length(); i++) {
				final var	doorDeliveryMemo = new DoorDeliveryMemo();

				doorDeliveryMemo.setWayBillId(Long.parseLong(waybillIdArray.get(i).toString()));
				doorDeliveryMemo.setActualWeight(jsonObjectIn.optDouble("lrActualWeight_" + doorDeliveryMemo.getWayBillId(), 0d));
				doorDeliveryMemo.setWayBillNumber(jsonObjectIn.getString("wayBillNumber_" + doorDeliveryMemo.getWayBillId()));
				doorDeliveryMemo.setWayBillTypeId(jsonObjectIn.optLong("wayBillType_" + doorDeliveryMemo.getWayBillId(), 0));
				doorDeliveryMemo.setLrWiseLorryHireAmount(jsonObjectIn.optDouble("lrWiseLorryHireAmount_" + doorDeliveryMemo.getWayBillId(), 0.00));
				doorDeliveryMemo.setManualCRNo(jsonObjectIn.optString("manualCRNo_" + doorDeliveryMemo.getWayBillId(), null));

				if(doorDeliveryMemo.getLrWiseLorryHireAmount() > 0)
					ddmLorryHire += doorDeliveryMemo.getLrWiseLorryHireAmount();

				waybillDetailsHsmp.put(doorDeliveryMemo.getWayBillId(), doorDeliveryMemo);
			}

			reqParamValObj.put("ddmLorryHire", ddmLorryHire > 0 ? ddmLorryHire : jsonObjectIn.optString("ddmLorryHire", null));
			reqParamValObj.put("waybillDetailsHsmp", waybillDetailsHsmp);

			reqParamValObj.put("configValueForExpenseVoucherAllowed", cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_WAYBILL_EXPENSE_TALLY_TRANSFER_APPLICABLE_ID));
			reqParamValObj.put("configValueOfPDS", cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_PENDING_DELIVERY_STOCK_TABLE_ENTRY_AT_BOOKING_LEVEL));
			reqParamValObj.put("executive", executive);
			reqParamValObj.put("generalConfiguration", cache.getGeneralConfiguration(request, executive.getAccountGroupId()));

			reqParamValObj.put("WBWiseData", convertJSONData(jsonObjectIn));
			reqParamValObj.put(LrCostConfigurationDTO.LR_COST_CONFIGURATION, cache.getGroupWiseLRCostConfiguration(request, executive.getAccountGroupId()));

			return reqParamValObj;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private ValueObject convertJSONData (final JSONObject jsonObject) throws Exception {
		try {
			if(jsonObject == null || jsonObject.length() <= 0)
				return null;

			final var	valObj	= new ValueObject();
			final var	wbIdsAL	= new ArrayList<Long>();

			final var keys 		= jsonObject.keys();

			while(keys.hasNext()) {
				final var	key = keys.next();

				try { // for json object inside json object
					getWBWiseDetails(jsonObject.getJSONObject(key), valObj, wbIdsAL);
				} catch(final Exception e){ // for String value inside json object ex. deliveryrunsheetledgerid etc..
					valObj.put(key, jsonObject.get(key).toString());
				}
			}

			valObj.put(AliasNameConstants.WAYBILL_IDS, wbIdsAL);

			return valObj;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public void getWBWiseDetails(final JSONObject wbWiseObject, final ValueObject valObj, final ArrayList<Long> wbIdsAL) throws Exception {
		try {
			if (wbWiseObject != null && wbWiseObject.length() > 0) {
				final var	wbWisekeys	= wbWiseObject.keys();

				while (wbWisekeys.hasNext()) {
					final var	wbId 	= wbWisekeys.next();
					final var	wbObj	= wbWiseObject.getJSONObject(wbId);

					wbIdsAL.add(Long.parseLong(wbId));

					valObj.put("deliveredToName_" + wbId, wbObj.optString("deliveredToName", null));
					valObj.put("deliveredToPhoneNo_" + wbId, wbObj.optString("deliveredToPhoneNo", null));
					valObj.put("remark_" + wbId, wbObj.optString(Constant.REMARK, null));
					valObj.put("discount_" + wbId, wbObj.optDouble("discount", 0));
					valObj.put("discountTypes_" + wbId, wbObj.optInt("discountTypes", 0));

					final var	wbChargesObj		= (JSONObject)wbObj.get("wbCharges");

					final var	wbChargeIdWiseAmt 	= getWBCharges(wbChargesObj);
					valObj.put("wbCharges_" + wbId, wbChargeIdWiseAmt);
				}
			}
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public HashMap<Long, Double> getWBCharges (final JSONObject wbChargesObj) throws Exception {
		try {

			if(wbChargesObj == null || wbChargesObj.length() <= 0)
				return null;

			final var 	chargeIds			= wbChargesObj.keys();
			final var	wbChargeIdWiseAmt	= new HashMap<Long, Double>();

			while (chargeIds.hasNext()) {
				final var	chargeId 		= chargeIds.next();
				final var	chargeAmount 	= wbChargesObj.optDouble(chargeId, 0.0);

				wbChargeIdWiseAmt.put(Long.parseLong(StringUtils.trim(chargeId.split("_")[1])), chargeAmount);
			}

			return wbChargeIdWiseAmt;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private ExpenseVoucherPaymentDetails createExpenseVoucherPaymentDetails(final JSONObject getJsonObject, final short paymentType) throws Exception{
		try {
			final var	expenseVoucherPaymentDetails	= new ExpenseVoucherPaymentDetails();

			switch (paymentType) {
			case PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID :
				expenseVoucherPaymentDetails.setPaymentMode(PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID);
				expenseVoucherPaymentDetails.setPaymentModeName(PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_NAME);
				expenseVoucherPaymentDetails.setChequeNumber(getJsonObject.optString("chequeNumber", null));

				if (getJsonObject.get("chequedatepicker") != null)
					expenseVoucherPaymentDetails.setChequeDateTime(DateTimeUtility.appendTimeToDate(getJsonObject.get("chequedatepicker").toString()));

				expenseVoucherPaymentDetails.setBankAccountId(Utility.getLong(getJsonObject.optLong("bankAccountId", 0)));

				if (getJsonObject.get("bankAccountName") != null)
					expenseVoucherPaymentDetails.setBankAccountName(StringUtils.upperCase(getJsonObject.get("bankAccountName").toString()));

				if (getJsonObject.get("chequeGivenTo") != null)
					expenseVoucherPaymentDetails.setChequeGivenTo(StringUtils.upperCase(getJsonObject.get("chequeGivenTo").toString()));

				if (getJsonObject.get("paymentGivenByBranch") != null)
					expenseVoucherPaymentDetails.setPaymentMadeToBranchId(Utility.getLong(getJsonObject.get("paymentGivenByBranch")));
				break;
			case PaymentTypeConstant.PAYMENT_TYPE_LHPV_ADVANCE_CREDIT_ID :
				expenseVoucherPaymentDetails.setPaymentMode(PaymentTypeConstant.PAYMENT_TYPE_LHPV_ADVANCE_CREDIT_ID);
				expenseVoucherPaymentDetails.setPaymentModeName(PaymentTypeConstant.PAYMENT_TYPE_LHPV_ADVANCE_CREDIT_NAME);
				expenseVoucherPaymentDetails.setChequeNumber(getJsonObject.optString("creditSlipNumber", null));

				if (getJsonObject.get("creditdatepicker") != null)
					expenseVoucherPaymentDetails.setChequeDateTime(DateTimeUtility.appendTimeToDate(getJsonObject.get("creditdatepicker").toString()));

				expenseVoucherPaymentDetails.setCreditAccountId(getJsonObject.optLong("creditAccountId", 0));
				break;
			case PaymentTypeConstant.PAYMENT_TYPE_CASH_ID :
			default :
				expenseVoucherPaymentDetails.setPaymentMode(PaymentTypeConstant.PAYMENT_TYPE_CASH_ID);
				expenseVoucherPaymentDetails.setPaymentModeName(PaymentTypeConstant.PAYMENT_TYPE_CASH_NAME);
				break;
			}

			return expenseVoucherPaymentDetails;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}
}