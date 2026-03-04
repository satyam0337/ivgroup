
package com.ivcargo.actions;

//~--- non-JDK imports --------------------------------------------------------

import java.io.PrintWriter;
import java.net.URLDecoder;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashMap;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONObject;

import com.businesslogic.CorporateAccountBLL;
import com.businesslogic.DiscountMasterBLL;
import com.businesslogic.GenerateCashReceiptBLL;
import com.businesslogic.properties.GeneralConfiguration;
import com.businesslogic.tds.TDSTxnDetailsBLL;
import com.businesslogic.utils.SequenceCounterBLL;
import com.framework.Action;
import com.iv.bll.impl.properties.GenerateCRConfigurationBllImpl;
import com.iv.bll.utils.BookingWayBillSelectionUtility;
import com.iv.bll.utils.PaymentTypeSelectionUtility;
import com.iv.constant.properties.GeneralConfigurationPropertiesConstant;
import com.iv.constant.properties.GenerateCRMultipleLRConfigurationConstant;
import com.iv.constant.properties.LrViewConfigurationPropertiesConstant;
import com.iv.constant.properties.PaymentTypePropertiesConstant;
import com.iv.constant.properties.TDSPropertiesConstant;
import com.iv.constant.properties.lhpv.LHPVPropertiesConstant;
import com.iv.dto.TransportListMaster;
import com.iv.dto.constant.BusinessFunctionConstants;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.dto.master.TaxModel;
import com.iv.logsapp.LogWriter;
import com.iv.properties.constant.DisplayDataWithinDateRangePropertiesConstant;
import com.iv.utils.constant.Constant;
import com.iv.utils.constant.PodWayBillPropertiesConstant;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.exception.ExceptionProcess;
import com.ivcargo.utils.CacheManip;
import com.ivcargo.utils.JsonUtility;
import com.platform.dto.AccountGroupTieUpConfiguration;
import com.platform.dto.AliasNameConstants;
import com.platform.dto.Branch;
import com.platform.dto.ConfigParam;
import com.platform.dto.DeliverySequenceCounter;
import com.platform.dto.Executive;
import com.platform.dto.WayBillTaxDetails;
import com.platform.dto.configuration.master.DisplayDataConfigurationDTO;
import com.platform.dto.configuration.mindateselection.ModuleWiseMinDateSelectionConfigurationDTO;
import com.platform.dto.configuration.modules.BankStatementConfigurationDTO;
import com.platform.dto.configuration.modules.CashStatementConfigurationDTO;
import com.platform.dto.configuration.modules.DashBoardConfigurationDTO;
import com.platform.dto.configuration.modules.GenerateCashReceiptDTO;
import com.platform.dto.configuration.modules.GroupConfigurationPropertiesDTO;
import com.platform.dto.configuration.modules.LrCostConfigurationDTO;
import com.platform.dto.constant.FeildPermissionsConstant;
import com.platform.jsonconstant.JsonConstant;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Converter;
import com.platform.utils.Utility;

public class GenerateCRMultipleLRAjaxAction implements Action {

	public static final String TRACE_ID = "GenerateCRMultipleLRAjaxAction";

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
			case 1: {
				out.println(getConfigForGenerateCR(request, jsonObjectOut));
				break;
			}
			case 2: {
				out.println(getWayBillData(request,jsonObjectOut,jsonObjectIn));
				break;
			}
			case 3: {
				out.println(generateCR(request,response,jsonObjectOut,jsonObjectIn));
				break;
			}
			default: {
				jsonObjectOut.put("errorDescription", "Unknown Request");
				out.println(jsonObjectOut);
				break;
			}
			}
		} catch (final Exception _e) {
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, _e);
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

	private JSONObject getConfigForGenerateCR(final HttpServletRequest request,final JSONObject jsonObjectOut) throws Exception {
		var 					chargeIdToBifurcate				= 0L;
		var						chargeNameToBifurcate			= "";
		var 					validatePhonePeTxn				= false;

		try {
			final var	cache						= new CacheManip(request);
			final var	valObjOut					= JsonUtility.convertJsontoValueObject(jsonObjectOut);
			final var	executive					= cache.getExecutive(request);
			final var	tdsTxnDetailsBLL			= new TDSTxnDetailsBLL();
			final var	corporateAccountBLL			= new CorporateAccountBLL();
			final var	paymentTypeValObj			= new ValueObject();

			final var	configuration			= GenerateCRConfigurationBllImpl.getInstance().getPropertyForGenerateCRForMultipleLR(executive.getAccountGroupId());
			final var	loggedInExecutiveBranch	= cache.getGenericBranchDetailCache(request, executive.getBranchId());
			final var	execFunctions			= cache.getExecFunctions(request);

			final var	allowToBifurcateCharge  = (boolean) configuration.get(GenerateCRMultipleLRConfigurationConstant.ALLOW_TO_BIFURCATE_CHARGE);

			if(allowToBifurcateCharge)
				chargeIdToBifurcate	= Long.parseLong(configuration.getOrDefault(GenerateCRMultipleLRConfigurationConstant.CHARGE_ID_TO_BIFURCATE, 0).toString());

			final var	accountGroup			= cache.getAccountGroupById(request, executive.getAccountGroupId());
			final var	deliverChgs				= cache.getActiveDeliveryCharges(request, executive.getBranchId());
			final var	groupConfiguration		= cache.getGroupConfiguration(request, executive.getAccountGroupId());
			final var	tdsConfiguration		= cache.getTDSConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.GENERATE_CR);
			final var	generateCrConfiguration	= cache.getGenerateCRConfiguration(request, executive.getAccountGroupId());
			final var	generalConfiguration	= cache.getGeneralConfiguration(request, executive.getAccountGroupId());

			valObjOut.put("deliverChgs", Converter.arrayDtotoArrayListWithHashMapConversion(deliverChgs));

			if ((boolean) configuration.getOrDefault(GenerateCRMultipleLRConfigurationConstant.MANUAL_DELIVERY_SEQUENCE_COUNTER, false)) {
				final var	sequenceCounterBLL	= new SequenceCounterBLL();
				final var	deliverySequenceCounter	= sequenceCounterBLL.getDeliverySequenceCounter(executive, DeliverySequenceCounter.DELIVERY_SEQUENCE_MANUAL);

				if (deliverySequenceCounter != null)
					valObjOut.put("DeliverySequenceCounter", Converter.DtoToHashMap(deliverySequenceCounter));
			}

			final var isBranchTypeDelivery = loggedInExecutiveBranch.getBranchType() == Branch.BRANCH_TYPE_DELIVERY || loggedInExecutiveBranch.getBranchType() == Branch.BRANCH_TYPE_BOOKING_DELIVERY_BOTH;

			if((boolean) configuration.getOrDefault(GenerateCRMultipleLRConfigurationConstant.CHECK_BRANCH_TYPE_TO_ALLOW_DELIVERY, false)
					&& !isBranchTypeDelivery && execFunctions != null && execFunctions.containsKey(BusinessFunctionConstants.GENERATE_CR_MODULE_FOR_MULTIPLE_LR))
				valObjOut.put(CargoErrorList.ERROR_DESCRIPTION, "Your Branch is not Delivery Branch, Contact Admin !");

			final var	chargeTypeMaster	= cache.getChargeTypeMasterById(request,chargeIdToBifurcate);

			if(chargeTypeMaster != null)
				chargeNameToBifurcate	= chargeTypeMaster.getChargeName();

			valObjOut.put("ManualCRDaysAllowed", cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_MAX_DAYS_OF_OPERATION_BEFORE_CASHSTATEMENT_ENTRY_ID));

			final HashMap<?, ?>	execFldPermissions	= cache.getExecutiveFieldPermission(request);

			if(execFldPermissions.get(FeildPermissionsConstant.DELIVERY_DISCOUNT) != null) {
				final var	discountMasterBLL	= new DiscountMasterBLL();
				valObjOut.put("discountTypes", discountMasterBLL.getDiscountTypes());
				valObjOut.put("isDeliveryDiscountAllow", true);
			}

			final var	creditDelivery = cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_CREDIT_DELIVERY);

			valObjOut.put("showbillCredit", creditDelivery == ConfigParam.CONFIG_KEY_CREDIT_DELIVERY_YES);

			final var phonePayPaymentTypeConfiguration	= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.PAYMENT_TYPE, ModuleIdentifierConstant.PHONE_PE_API);

			if((boolean) phonePayPaymentTypeConfiguration.getOrDefault(PaymentTypePropertiesConstant.VALIDATE_PHONEPE_TXN_DELIVERY, false)&&(execFldPermissions == null || execFldPermissions.get(FeildPermissionsConstant.DO_NOT_VALIDATE_PHONEPE_TXN) == null)) {
				validatePhonePeTxn		= (boolean) phonePayPaymentTypeConfiguration.getOrDefault(PaymentTypePropertiesConstant.VALIDATE_PHONEPE_TXN_DELIVERY, false);
				valObjOut.put(PaymentTypePropertiesConstant.VALIDATE_PHONEPE_TXN, validatePhonePeTxn);
			}

			paymentTypeValObj.put(Constant.EXECUTIVE_ID, executive.getExecutiveId());
			paymentTypeValObj.put(Constant.ACCOUNT_GROUP_ID, executive.getAccountGroupId());
			paymentTypeValObj.put(ModuleIdentifierConstant.MODULE_ID, ModuleIdentifierConstant.GENERATE_CR_FOR_MULTI_LR);
			paymentTypeValObj.put("ExecutiveFeildPermission", Converter.hashMapWithDtoToHashMapConversion(execFldPermissions));
			paymentTypeValObj.put(PaymentTypePropertiesConstant.VALIDATE_PHONEPE_TXN, validatePhonePeTxn);

			final var	paymentTypeArr	= PaymentTypeSelectionUtility.getModuleWisePermissionBasePaymentTypeSelection(paymentTypeValObj);

			final var	bankPaymentOperationRequired	= generalConfiguration.getBoolean(GeneralConfiguration.BANK_PAYMENT_OPERATION_REQUIRED);

			if(bankPaymentOperationRequired)
				configuration.put(GenerateCRMultipleLRConfigurationConstant.SHOW_PAYMENT_TYPE_ALL_SELECTION, true);

			valObjOut.put("taxes", Converter.dtoListtoListWithHashMapConversion(cache.getTaxes(request, executive)));
			valObjOut.put(Executive.EXECUTIVE, Converter.DtoToHashMap(executive));
			valObjOut.put("configuration", configuration);
			valObjOut.put(TDSPropertiesConstant.TDS_CONFIGURATION, tdsConfiguration);
			valObjOut.put("generateCrConfiguration", generateCrConfiguration);
			valObjOut.put("execFldPermissions", Converter.hashMapWithDtoToHashMapConversion(execFldPermissions));
			valObjOut.put("groupConfiguration", groupConfiguration);
			valObjOut.put("paymentTypeArr", Converter.arrayDtotoArrayListWithHashMapConversion(paymentTypeArr));
			valObjOut.put(ModuleIdentifierConstant.MODULE_ID, ModuleIdentifierConstant.GENERATE_CR_FOR_MULTI_LR);
			valObjOut.put(ModuleIdentifierConstant.INCOME_EXPENSE_MODULE_ID, ModuleIdentifierConstant.INCOME_TYPE_MODULE_ID);
			valObjOut.put(GeneralConfiguration.BANK_PAYMENT_OPERATION_REQUIRED, bankPaymentOperationRequired);
			valObjOut.put(GeneralConfiguration.BANK_ACCOUNT_NOT_MANDATORY, generalConfiguration.get(GeneralConfiguration.BANK_ACCOUNT_NOT_MANDATORY));
			valObjOut.put(GeneralConfiguration.CARD_NUMBER_NOT_MANDATORY, generalConfiguration.get(GeneralConfiguration.CARD_NUMBER_NOT_MANDATORY));
			valObjOut.put(GeneralConfigurationPropertiesConstant.GENERAL_CONFIGURATION, generalConfiguration);
			valObjOut.put("chargeNameToBifurcate", chargeNameToBifurcate);
			valObjOut.put("taxPaidByList", BookingWayBillSelectionUtility.getTaxPaidByList(configuration));
			valObjOut.put(PaymentTypePropertiesConstant.ALLOW_DYNAMIC_PHONEPE_QR_DELIVERY, phonePayPaymentTypeConfiguration.getOrDefault(PaymentTypePropertiesConstant.ALLOW_DYNAMIC_PHONEPE_QR_DELIVERY, false ));
			valObjOut.put(PaymentTypePropertiesConstant.ALLOW_TXN_DATE_TIME_PHONE_PE, phonePayPaymentTypeConfiguration.getOrDefault(PaymentTypePropertiesConstant.ALLOW_TXN_DATE_TIME_PHONE_PE, false));

			/*
			 * check and get service permission for generate CR
			 */
			if((boolean) configuration.getOrDefault(GenerateCRMultipleLRConfigurationConstant.ALLOW_PHOTO_SERVICE_ON_CR, false)) {
				final var valObjIn = new ValueObject();

				valObjIn.put("execFldPermissions", execFldPermissions);
				valObjIn.put(Executive.EXECUTIVE, executive);
				valObjOut.put("servicePermission", new GenerateCRAjaxAction().checkServicePermission(valObjIn));
			}

			final var	dbWiseSelfPartCA		= corporateAccountBLL.getDBWiseSelfPartyDetails(groupConfiguration, accountGroup);

			if(dbWiseSelfPartCA != null)
				valObjOut.put("dbWiseSelfPartCA", Converter.DtoToHashMap(dbWiseSelfPartCA));

			tdsTxnDetailsBLL.setDeliveryTimeTDSDetailsForTDSCalculation(valObjOut, null, tdsConfiguration, deliverChgs);

			JsonConstant.getInstance().setOutputConstant(valObjOut);

			return JsonUtility.convertionToJsonObjectForResponse(valObjOut);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private JSONObject getWayBillData(final HttpServletRequest request, final JSONObject jsonObjectOut, final JSONObject jsonObjectIn) throws Exception {

		Executive						executive					= null;
		CacheManip						cache						= null;
		ValueObject						valObjIn					= null;
		var							wayBillId					= 0L;
		ValueObject						valObjOut					= null;
		GenerateCashReceiptBLL			cashReceiptBLL				= null;
		short 							creditDelivery 				= 0;
		short							configValueForDelivery		= 0;
		var     						noOfDays  					= 0;
		HashMap<?, ?>					execFldPermissions			= null;
		var							isPendingDeliveryTableEntry	= false;
		ArrayList<Long>					deliveryLocationList		= null;
		final var					isReceiveAndCancelledDlyStatusAllowForGenerateCRForMultipleLR   = true;
		Timestamp						minDateTimeStamp			= null;
		ValueObject						displayDataConfig			= null;
		var							displayDataIfUndelivered	= false;

		try {

			cache				= new CacheManip(request);
			execFldPermissions	= cache.getExecutiveFieldPermission(request);

			valObjIn			= JsonUtility.convertJsontoValueObject(jsonObjectIn);
			valObjOut			= JsonUtility.convertJsontoValueObject(jsonObjectOut);

			executive			= cache.getExecutive(request);
			wayBillId			= valObjIn.getLong("WayBillId", 0);

			valObjIn.put(AliasNameConstants.EXECUTIVE, executive);
			valObjIn.put("branchesColl", cache.getGenericBranchesDetail(request));
			valObjIn.put("subregionColl", cache.getAllSubRegions(request));

			valObjIn.put("articleTypeForGroup", cache.getArticleTypeForGroup(request, executive.getAccountGroupId()));
			valObjIn.put("packingTypeForGroup", cache.getPackingTypeForGroup(request, executive.getAccountGroupId()));

			configValueForDelivery = cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_DELIVERY_ACCESSIBILITY);

			if(configValueForDelivery != 0)
				valObjIn.put("configValueForDelivery", configValueForDelivery);

			creditDelivery = cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_CREDIT_DELIVERY);

			if (creditDelivery == ConfigParam.CONFIG_KEY_CREDIT_DELIVERY_YES)
				valObjIn.put("showbillCredit", true);
			else
				valObjIn.put("showbillCredit", false);

			noOfDays = cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.BACK_DATE_DELIVERY_LOCKING_DAYS);

			valObjIn.put("execFldPermissions", execFldPermissions);
			valObjIn.put("noOfDays", noOfDays);

			isPendingDeliveryTableEntry = cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_PENDING_DELIVERY_STOCK_TABLE_ENTRY) == ConfigParam.CONFIG_KEY_PENDING_DELIVERY_STOCK_TABLE_ENTRY_ALLOWED;

			valObjIn.put("isPendingDeliveryTableEntry", isPendingDeliveryTableEntry);

			final var configValueForReceive	= cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_RECEIVABLES_ACCESSIBILITY);
			deliveryLocationList 		= cache.getAssignedLocationsIdListByLocationIdId(request, executive.getBranchId(), executive.getAccountGroupId());

			minDateTimeStamp			= cache.getModuleWiseMinDateToGetData(request, executive.getAccountGroupId(),
					ModuleWiseMinDateSelectionConfigurationDTO.GENERATE_CR_MIN_DATE_ALLOW,
					ModuleWiseMinDateSelectionConfigurationDTO.GENERATE_CR_MIN_DATE);

			displayDataConfig	= cache.getDisplayDataConfiguration(request, executive.getAccountGroupId());
			if(displayDataConfig!=null)
				displayDataIfUndelivered = Utility.getBoolean(displayDataConfig.get(DisplayDataConfigurationDTO.DISPLAY_DATA_IF_UNDELIVERED));

			valObjIn.put(AliasNameConstants.MIN_DATE_TIMESTAMP, minDateTimeStamp);
			valObjIn.put("deliveryLocationList", deliveryLocationList);
			valObjIn.put(GeneralConfiguration.GENERAL_CONFIGURATION, cache.getGeneralConfiguration(request, executive.getAccountGroupId()));
			valObjIn.put("isReceiveAndCancelledDlyStatusAllowForGenerateCRForMultipleLR", isReceiveAndCancelledDlyStatusAllowForGenerateCRForMultipleLR);
			valObjIn.put(LrViewConfigurationPropertiesConstant.LR_VIEW_CONFIGURATION_PROPERTY, cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.LR_SEARCH));
			valObjIn.put(GenerateCashReceiptDTO.GENERATE_CASH_RECEIPT_CONFIGURATION, cache.getGenerateCRConfiguration(request, executive.getAccountGroupId()));
			valObjIn.put("configValueForReceive", configValueForReceive);
			valObjIn.put(Constant.WAYBILL_ID, wayBillId);
			valObjIn.put("displayDataIfUndelivered", displayDataIfUndelivered);
			valObjIn.put(PodWayBillPropertiesConstant.POD_CONFIGURATION, cache.getPODWayBillConfiguration(request, executive.getAccountGroupId()));
			valObjIn.put(DisplayDataWithinDateRangePropertiesConstant.DISPLAY_DATA_CONFIGURATION_CONSTANT, cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.DISPLAY_DATA_CONFIGURATION));

			cashReceiptBLL	= new GenerateCashReceiptBLL();

			if(wayBillId > 0)
				valObjOut		= cashReceiptBLL.getDataForCashReceiptGeneration(valObjIn, valObjOut);
			else
				valObjOut		= cashReceiptBLL.getWayBillDetailsToGenereateCR(valObjIn, valObjOut);

			if (valObjOut == null) {
				valObjOut	= new ValueObject();
				valObjOut.put("userErrorDescription", CargoErrorList.NO_RECORDS_DESCRIPTION);
			}

			return JsonUtility.convertionToJsonObjectForResponse(valObjOut);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private JSONObject generateCR(final HttpServletRequest request, final HttpServletResponse response, final JSONObject jsonObjectOut, final JSONObject jsonObjectIn) throws Exception {
		CacheManip							cache								= null;
		ValueObject							valObjIn							= null;
		ValueObject							valObjOut							= null;
		GenerateCashReceiptBLL				cashReceiptBLL						= null;
		Executive							executive							= null;
		ValueObject							lrWiseJsonDeliveryDataValueObject	= null;
		JSONArray 							values 								= null;

		try {

			cache								= new CacheManip(request);
			cashReceiptBLL						= new GenerateCashReceiptBLL();
			valObjIn							= new ValueObject();
			lrWiseJsonDeliveryDataValueObject 	= new ValueObject();

			valObjIn				 			= JsonUtility.convertJsontoValueObject(jsonObjectIn);
			valObjOut				 			= JsonUtility.convertJsontoValueObject(jsonObjectOut);
			executive			 	 			= cache.getExecutive(request);

			values								 = jsonObjectIn.getJSONArray("lrWiseJsonDeliveryDataValueObject");

			for (var i = 0; i < values.length(); i++)
				lrWiseJsonDeliveryDataValueObject.put(i, JsonUtility.convertJsontoValueObject(values.getJSONObject(i)));

			valObjIn.put(Executive.EXECUTIVE, executive);
			valObjIn.put(Constant.NO_OF_DAYS, cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_MAX_DAYS_OF_OPERATION_BEFORE_CASHSTATEMENT_ENTRY_ID));
			valObjIn.put("duplicateManualSeq", cache.getConfigValue(request, executive.getAccountGroupId(),ConfigParam.CONFIG_KEY_DUPLICATE_MANUAL_AUTO_CR_SEQUENCE));
			valObjIn.put("deliveryCharge", cache.getActiveDeliveryCharges(request, executive.getBranchId()));
			valObjIn.put("Creditor_Payment_Module_Key", cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_CREDITOR_PAYMENT_MODULE));
			valObjIn.put("creditDelivery", cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_CREDIT_DELIVERY));
			valObjIn.put("configKeySTReport", cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_SERVICE_TAX_REPORT));
			valObjIn.put("configKeyPendingDeliveryTableEntry", cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_PENDING_DELIVERY_STOCK_TABLE_ENTRY));
			valObjIn.put("lrWiseJsonDeliveryDataValueObject", lrWiseJsonDeliveryDataValueObject);
			valObjIn.put("branchesColl", cache.getGenericBranchesDetail(request));
			valObjIn.put(GeneralConfiguration.GENERAL_CONFIGURATION, cache.getGeneralConfiguration(request, executive.getAccountGroupId()));
			valObjIn.put(AccountGroupTieUpConfiguration.ACCOUNT_GROUP_TIE_UP_CONFIGURATION_HM, cache.getAccountGroupTieUpConfiguration(request, executive.getAccountGroupId()));
			valObjIn.put(GroupConfigurationPropertiesDTO.GROUP_CONFIGURATION, cache.getGroupConfiguration(request, executive.getAccountGroupId()));
			valObjIn.put(WayBillTaxDetails.WAYBILL_TYPE_WISE_SERVICE_TAX_DATE, cache.wayBillTypeWiseServiceTaxDate(request, executive.getAccountGroupId()));
			valObjIn.put(LrCostConfigurationDTO.LR_COST_CONFIGURATION, cache.getGroupWiseLRCostConfiguration(request, executive.getAccountGroupId()));
			valObjIn.put(CashStatementConfigurationDTO.CASH_STATEMENT_CONFIGURATION, cache.getCashStatementConfiguration(request, executive.getAccountGroupId()));
			valObjIn.put(PodWayBillPropertiesConstant.POD_CONFIGURATION, cache.getPODWayBillConfiguration(request, executive.getAccountGroupId()));
			valObjIn.put(LHPVPropertiesConstant.LHPV_CONFIGURATION, cache.getLhpvConfiguration(request, executive.getAccountGroupId()));
			valObjIn.put(TransportListMaster.TRANSPORT_LIST, cache.getTransportList(request));
			valObjIn.put(BankStatementConfigurationDTO.BANK_STATEMENT_CONFIGURATION, cache.getBankStatementConfiguration(request, executive.getAccountGroupId()));
			valObjIn.put(GenerateCashReceiptDTO.GENERATE_CASH_RECEIPT_CONFIGURATION, cache.getGenerateCRConfiguration(request, executive.getAccountGroupId()));
			valObjIn.put("configValWBGTROffAllow", cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_WAYBILL_GRAND_TOTAL_ROUNDOFF));
			valObjIn.put("loggedInBranch", cache.getExecutiveBranch(request, executive.getBranchId()));
			valObjIn.put(TaxModel.TAX_MODEL_ARR, cache.getTaxes(request, executive));
			valObjIn.put(DashBoardConfigurationDTO.DASH_BOARD_CONFIGURATION, cache.getDashBoardConfiguration(request, executive.getAccountGroupId()));
			valObjIn.put("execFldPermissions", cache.getExecutiveFieldPermission(request));

			cache.getConfigurationData(request, executive.getAccountGroupId(), valObjIn);

			valObjOut	= cashReceiptBLL.generateCashReceiptForMultipleLR(valObjIn);

			if (valObjOut == null) {
				valObjOut	= new ValueObject();
				valObjOut.put("errorDescription", CargoErrorList.WAYBILL_NOT_FOUND_DESCRIPTION);
			}

			final var lCDateTime = Calendar.getInstance();

			// Save Photo
			try {
				if(valObjIn.get("image") != null) {
					valObjIn.put(com.iv.utils.constant.Constant.CR_ID, valObjOut.get(com.iv.utils.constant.Constant.CR_ID));
					valObjIn.put("image", URLDecoder.decode(valObjIn.get("image").toString(), "UTF-8"));
					new GenerateCRAjaxAction().executeServiceProcess(valObjIn);
				}
			} catch (final Exception e) {
				e.printStackTrace();
			}

			// created cookie for disabled cr print link after 10 minutes
			var currentCookieTime=lCDateTime.getTimeInMillis();
			currentCookieTime-=120000;
			final var cookieLife = 480000L;//  in milli seconds
			final var	expiryTime = cookieLife + currentCookieTime;
			final var cookie=new Cookie("CR_"+valObjOut.get("crId"),Long.toString(currentCookieTime)+"_"+expiryTime);
			cookie.setMaxAge(60*30);
			response.addCookie(cookie);

			return JsonUtility.convertionToJsonObjectForResponse(valObjOut);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}
}

