package com.ivcargo.actions;

//~--- non-JDK imports --------------------------------------------------------

import java.io.PrintWriter;
import java.util.Arrays;
import java.util.Calendar;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringUtils;
import org.json.JSONObject;

import com.businesslogic.WayBillBll;
import com.businesslogic.print.WayBillPrintFormatterBll;
import com.businesslogic.properties.GeneralConfiguration;
import com.businesslogic.properties.impl.PropertyConfigValueBLLImpl;
import com.businesslogic.utils.SequenceCounterBLL;
import com.framework.Action;
import com.iv.bll.impl.BranchWayBillandTypeConfigurationBllImpl;
import com.iv.bll.impl.OperationLockingBllImpl;
import com.iv.bll.impl.creditlimit.CreditLimitTransactionBllImpl;
import com.iv.bll.impl.properties.DisplayDataConfigurationBllImpl;
import com.iv.bll.validation.BookingDataValidation;
import com.iv.cache.CacheData;
import com.iv.cache.impl.CacheDataImpl;
import com.iv.constant.properties.GeneralConfigurationPropertiesConstant;
import com.iv.constant.properties.GroupConfigurationPropertiesConstant;
import com.iv.constant.properties.LRPdfPrintProperties;
import com.iv.constant.properties.LrViewConfigurationPropertiesConstant;
import com.iv.constant.properties.PaymentTypePropertiesConstant;
import com.iv.constant.properties.TDSPropertiesConstant;
import com.iv.constant.properties.UploadPdfDetailsPropertiesConstant;
import com.iv.constant.properties.customgroupaddress.CustomGroupAddressPropertiesConstant;
import com.iv.constant.properties.dispatch.ManualLSConfigurationConstant;
import com.iv.constant.properties.invoice.CreditorInvoicePrintPropertiesConstant;
import com.iv.constant.properties.lrprint.LRPrintPropertiesConstant;
import com.iv.convertor.DataObjectConvertor;
import com.iv.convertor.JsonConvertor;
import com.iv.dao.impl.master.BranchCommissionMasterDaoImpl;
import com.iv.dao.impl.prepaid.BranchWisePrepaidAmountDaoImpl;
import com.iv.dto.BranchWisePrepaidAmount;
import com.iv.dto.ExecutiveFunctionsModel;
import com.iv.dto.TransportListMaster;
import com.iv.dto.constant.BookingTypeConstant;
import com.iv.dto.commission.BranchCommission;
import com.iv.dto.constant.CommisionTypeConstant;
import com.iv.dto.constant.FileExtensionConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.dto.master.AccountGroupPermission;
import com.iv.dto.master.DivisionMaster;
import com.iv.dto.master.PackageConditionMaster;
import com.iv.dto.master.TaxModel;
import com.iv.dto.model.BranchModel;
import com.iv.dto.model.PrintHeaderModel;
import com.iv.dto.photoandsignatureservice.Service;
import com.iv.dto.waybill.ContainerDetails;
import com.iv.dto.waybill.FormTypes;
import com.iv.dto.waybill.LRInvoiceDetails;
import com.iv.dto.waybill.WBNumberTypeDetail;
import com.iv.dto.waybill.WayBillChargesRemark;
import com.iv.logsapp.LogWriter;
import com.iv.properties.constant.DisplayDataWithinDateRangePropertiesConstant;
import com.iv.utils.CollectionUtility;
import com.iv.utils.constant.AccountGroupConstant;
import com.iv.utils.constant.Constant;
import com.iv.utils.constant.PodWayBillPropertiesConstant;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.exception.ExceptionProcess;
import com.iv.utils.message.Message;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.reports.ReportView;
import com.ivcargo.utils.CacheManip;
import com.ivcargo.utils.JsonUtility;
import com.ivcargo.utils.services.ServicePermissionUtility;
import com.platform.dao.WayBillDao;
import com.platform.dto.AccountGroupTieUpConfiguration;
import com.platform.dto.AliasNameConstants;
import com.platform.dto.Branch;
import com.platform.dto.BranchPermission;
import com.platform.dto.ConfigParam;
import com.platform.dto.Executive;
import com.platform.dto.PropertiesFileConstants;
import com.platform.dto.WayBill;
import com.platform.dto.configuration.discountlimit.ModuleWiseDiscountLimitConfigurationDTO;
import com.platform.dto.configuration.modules.BankStatementConfigurationDTO;
import com.platform.dto.configuration.modules.CashStatementConfigurationDTO;
import com.platform.dto.configuration.modules.DashBoardConfigurationDTO;
import com.platform.dto.configuration.modules.DummyLRConfigurationDTO;
import com.platform.dto.configuration.modules.GroupConfigurationPropertiesDTO;
import com.platform.dto.configuration.modules.LrCostConfigurationDTO;
import com.platform.dto.constant.FeildPermissionsConstant;
import com.platform.dto.constant.TaxMasterConstant;
import com.platform.dto.constant.WayBillTypeConstant;
import com.platform.dto.model.ChargeTypeModel;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Converter;
import com.platform.utils.TokenGenerator;
import com.platform.utils.Utility;

public class WayBillAjaxAction implements Action {

	public static final String TRACE_ID = "WayBillAjaxAction";

	private static final String SHOW_LR_NUMBER_POPUP	= "showLRNumberPopup";

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

			if(request.getSession().getAttribute(Executive.EXECUTIVE) == null) {
				jsonObjectOut.put(CargoErrorList.ERROR_DESCRIPTION, "You have been logged out. Please login again.");
				out.println(jsonObjectOut);
				return;
			}

			switch (filter) {
			case 1 -> out.println(initilizeWB(request, jsonObjectOut, jsonObjectIn));
			case 2 -> out.println(createWB(request, response, jsonObjectOut, jsonObjectIn));
			case 3 -> out.println(checkDuplicateLR(request, jsonObjectOut, jsonObjectIn));
			case 4 -> out.println(checkDuplicateLRByAgentId(request, jsonObjectOut, jsonObjectIn));
			case 5 -> out.println(initilizeDummyWB(request, jsonObjectOut, jsonObjectIn));
			case 6 -> out.println(deleteUsedDummyLR(request));
			case 7 -> out.println(checkWayBillTypeAndDestinationBranchWiseBooking(request, jsonObjectIn));
			case 8 -> out.println(getAgentCommission(request, jsonObjectOut, jsonObjectIn));
			case 9 -> out.println(showPopup(request));
			default -> {
				jsonObjectOut.put(CargoErrorList.ERROR_DESCRIPTION, "Unknown Request");
				out.println(jsonObjectOut);
			}
			}
		} catch (final Exception e1) {
			try {
				jsonObjectOut			= new JSONObject();
				jsonObjectOut.put(CargoErrorList.ERROR_CODE, CargoErrorList.SYSTEM_ERROR);
				jsonObjectOut.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.SYSTEM_ERROR_DESCRIPTION);
				generateToken(request, null, jsonObjectOut);
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

	private JSONObject deleteUsedDummyLR(final HttpServletRequest request) throws Exception{
		try {
			final var	executive	= (Executive) request.getSession().getAttribute(Executive.EXECUTIVE);
			WayBillDao.getInstance().deleteUsedDummyLR(executive.getAccountGroupId(), executive.getBranchId());

			final var jsonObject	= new JSONObject();
			jsonObject.put("success", "Data Deleted Successfully");

			return jsonObject;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private JSONObject getAgentCommission(final HttpServletRequest request, final JSONObject jsonObjectOut,final JSONObject jsonObjectIn) throws Exception{
		try {
			final var	cache				= new CacheManip(request);
			final var	executive			= cache.getExecutive(request);
			final var	groupConfiguration 	= cache.getGroupConfiguration(request, executive.getAccountGroupId());
			final var	valObjIn			= JsonUtility.convertJsontoValueObject(jsonObjectIn);
			final var	valObjOut			= JsonUtility.convertJsontoValueObject(jsonObjectOut);
			final var	wayBillBll			= new WayBillBll();

			wayBillBll.getAgentCommission(groupConfiguration, valObjOut, valObjIn);

			return JsonUtility.convertionToJsonObjectForResponse(valObjOut);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private JSONObject checkWayBillTypeAndDestinationBranchWiseBooking(final HttpServletRequest request, final JSONObject jsonObjectIn) throws Exception {
		ValueObject				jsobj			= null;
		var						flag 			= true;

		try {
			final var	valObjIn			= JsonUtility.convertJsontoValueObject(jsonObjectIn);
			final var	cache				= new CacheManip(request);
			final var	executive			= cache.getExecutive(request);
			final var	groupConfiguration 	= cache.getGroupConfiguration(request, executive.getAccountGroupId());
			final var	destinationBranchId = valObjIn.getLong(Constant.DESTINATION_BRANCH_ID, 0);
			final var	sourceBranchId		= valObjIn.getLong(Constant.SOURCE_BRANCH_ID, 0);
			final var	destBranch			= cache.getBranchById(request, executive.getAccountGroupId(), destinationBranchId);
			final var	srcBranch			= cache.getBranchById(request, executive.getAccountGroupId(), sourceBranchId > 0 ? sourceBranchId : executive.getBranchId());
			final var	bookingLockingForAgentBranches = groupConfiguration.getBoolean(GroupConfigurationPropertiesConstant.BOOKING_LOCKING_FOR_AGENT_BRANCHES, false);
			final var	wayBillTypeId  		 = valObjIn.getLong(Constant.WAY_BILL_TYPE_ID, 0);

			valObjIn.put(Constant.DESTINATION_SUB_REGION_ID, destBranch.getSubRegionId());
			valObjIn.put(Constant.DESTINATION_REGION_ID, destBranch.getRegionId());
			valObjIn.put(Constant.DESTINATION_CITY_ID, destBranch.getCityId());
			valObjIn.put(GroupConfigurationPropertiesConstant.CITY_TO_CITY_BOOKING_LOCKING, groupConfiguration.getBoolean(GroupConfigurationPropertiesConstant.CITY_TO_CITY_BOOKING_LOCKING, false));

			if(bookingLockingForAgentBranches && destinationBranchId > 0) {
				final var	waybillTypeLockingForAgentBranches = groupConfiguration.getString(GroupConfigurationPropertiesConstant.WAYBILL_TYPE_LOCKING_FOR_AGENT_BRANCHES,null);

				if(StringUtils.contains(waybillTypeLockingForAgentBranches, Long.toString(wayBillTypeId)) && destBranch.isAgentBranch())
					flag = false;
			} else if(groupConfiguration.getBoolean(GroupConfigurationPropertiesConstant.WAYBILL_TYPE_AND_DESTINATION_WISE_BOOKING_LOCKING_WITH_NEW, false)) {
				final var rules	= cache.getBranchWayBillTypeConfigurationForGroup(request, executive.getAccountGroupId());

				final var src	= DataObjectConvertor.convertObject(srcBranch, BranchModel.class);
				final var dest	= DataObjectConvertor.convertObject(destBranch, BranchModel.class);

				src.setBranchCityId(srcBranch.getCityId());
				dest.setBranchCityId(destBranch.getCityId());

				flag = BranchWayBillandTypeConfigurationBllImpl.getInstance().isAllowed(src, dest, wayBillTypeId, rules);
			} else {
				final var executive1 = new com.iv.dto.Executive();
				executive1.setAccountGroupId(executive.getAccountGroupId());
				executive1.setRegionId(srcBranch.getRegionId());
				executive1.setSubRegionId(srcBranch.getSubRegionId());
				executive1.setBranchId(srcBranch.getBranchId());
				executive1.setExecutiveCityId(srcBranch.getCityId());

				flag = BranchWayBillandTypeConfigurationBllImpl.getInstance().getSourceAndDestinationWiseWayBillTypeBookingFlag(valObjIn, executive1);
			}

			jsobj	= new ValueObject();
			jsobj.put("flag", flag);

			return JsonUtility.convertionToJsonObjectForResponse(jsobj);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private JSONObject initilizeDummyWB(final HttpServletRequest request, final JSONObject jsonObjectOut,
			final JSONObject jsonObjectIn) throws Exception {
		try {
			final var	cache						= new CacheManip(request);
			final var	wayBillBll					= new WayBillBll();

			final var	valObjIn					= JsonUtility.convertJsontoValueObject(jsonObjectIn);
			final var	valObjOut					= JsonUtility.convertJsontoValueObject(jsonObjectOut);

			final var	executive					= cache.getExecutive(request);
			final List<Short>	showWayBillTypes 			= cache.getWayBillTypeList(request, executive.getAccountGroupId());

			final var	configuration				= PropertyConfigValueBLLImpl.getInstance().getConfiguration(executive, PropertiesFileConstants.DUMMY_LR_CONFIGURATION);

			final var	subRegion					= cache.getAllSubRegions(request);

			final var	activeBookingCharges		= cache.getActiveBookingCharges(request, executive.getBranchId());
			final var	groupConfiguration 	 		= cache.getGroupConfiguration(request, executive.getAccountGroupId());

			if(configuration.getBoolean(GroupConfigurationPropertiesConstant.VEHICLE_TYPE, false))
				valObjIn.put("vehicleTypes", cache.getVehicleTypeForGroup(request, executive.getAccountGroupId()));

			if(configuration.getBoolean(GroupConfigurationPropertiesConstant.DOCUMENT_TYPE_SELECTION, false))
				valObjIn.put("articleTypeForGroup", cache.getArticleTypeForGroup(request, executive.getAccountGroupId()));

			valObjIn.put("GroupWayBillTypes", cache.getGroupWayBillTypes(request, executive.getAccountGroupId()));

			if(configuration.getBoolean(GroupConfigurationPropertiesConstant.COMMODITY_TYPE, false))
				valObjIn.put("commodities", cache.getCommodityForGroup(request, executive.getAccountGroupId()));

			valObjIn.put("packingType", cache.getAllPackingType(request, executive.getAccountGroupId()));

			final var	combinedConfiguration		= new ValueObject();

			if(groupConfiguration != null)
				combinedConfiguration.putAll(groupConfiguration);

			combinedConfiguration.putAll(configuration);

			final HashMap<?, ?>	execFldPermissions			= cache.getExecutiveFieldPermission(request);

			valObjIn.put(Executive.EXECUTIVE, executive);
			valObjIn.put("executiveBranch", cache.getExecutiveBranch(request, executive.getBranchId()));
			valObjIn.put(GroupConfigurationPropertiesDTO.GROUP_CONFIGURATION, combinedConfiguration);
			valObjIn.put("branchcache", cache.getGenericBranchesDetail(request));
			valObjIn.put("subRegion", subRegion);
			valObjIn.put("showWayBillTypes", showWayBillTypes);
			valObjIn.put("execFldPermissions", execFldPermissions);
			valObjIn.put(ExecutiveFunctionsModel.EXECUTIVE_FUNCTION, cache.getExecFunctions(request));

			valObjIn.put(AliasNameConstants.ACCOUNT_GROUP, cache.getAccountGroupById(request, executive.getAccountGroupId()));
			valObjIn.put(TDSPropertiesConstant.TDS_CONFIGURATION, cache.getTDSConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.BOOKING));
			valObjIn.put(TransportListMaster.TRANSPORT_LIST, cache.getTransportList(request));
			valObjOut.put(PodWayBillPropertiesConstant.POD_CONFIGURATION, cache.getPODWayBillConfiguration(request, executive.getAccountGroupId()));

			final var	chargeMasterIds 	= combinedConfiguration.getString(DummyLRConfigurationDTO.CHARGE_MASTER_IDS, "00000");
			final var 	chargeMasterIdsList	= CollectionUtility.getLongListFromString(chargeMasterIds);
			final var	chargeModelList		= Stream.of(activeBookingCharges).filter(c -> chargeMasterIdsList.contains(c.getChargeTypeMasterId())).toList();

			if (!chargeModelList.isEmpty())
				valObjIn.put("charges", chargeModelList.toArray(new ChargeTypeModel[chargeModelList.size()]));

			valObjOut.put("loggedInBranch", Converter.DtoToHashMap(cache.getExecutiveBranch(request, executive.getBranchId())));
			valObjOut.put("configuration", combinedConfiguration);

			valObjOut.put("servicePermission", "");
			valObjIn.put("isDummyLR", true);
			valObjIn.put(PaymentTypePropertiesConstant.PHONE_PAY_PAYMENT_TYPE_CONFIGURATION, cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.PAYMENT_TYPE, ModuleIdentifierConstant.PHONE_PE_API));

			final var	jsobj 			= wayBillBll.initilize(valObjOut,  valObjIn);

			final var object 			= JsonUtility.convertionToJsonObjectForResponse(jsobj);

			if(request.getSession().getAttribute(Constant.SHORTCUT_PARAM) != null) {
				object.put(Constant.SHORTCUT_PARAM, request.getSession().getAttribute(Constant.SHORTCUT_PARAM));
				request.getSession().removeAttribute(Constant.SHORTCUT_PARAM);
			}

			return object;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private JSONObject initilizeWB(final HttpServletRequest request, final JSONObject jsonObjectOut, final JSONObject jsonObjectIn) throws Exception {
		String							destinationBranch					= null;
		var 							discountInPercent					= 0;
		BranchWisePrepaidAmount			branchWisePrepaidAmount				= null;
		var								isTokenThroughLRBooking				= false;
		var								showLRNumberPopup					= true;
		var								srcBranchWisePrepaidAmtAndCreditLimitEntry	= false;

		try {
			final var	cache				= new CacheManip(request);
			final var	wayBillBll			= new WayBillBll();
			final CacheData	cacheData		= new CacheDataImpl();

			final var	valObjIn			= JsonUtility.convertJsontoValueObject(jsonObjectIn);
			final var	valObjOut			= JsonUtility.convertJsontoValueObject(jsonObjectOut);
			final var	executive			= cache.getExecutive(request);
			final var	wayBillType			= cache.getAllWayBillType(request);
			final var	showWayBillTypes 	= cache.getWayBillTypeList(request, executive.getAccountGroupId());
			final var	configuration		= cache.getGroupConfiguration(request, executive.getAccountGroupId());
			final var	isUsingTokenBooking = configuration.getBoolean(GroupConfigurationPropertiesConstant.BRANCH_WISE_TOKEN_BOOKING, false);

			if(configuration.getBoolean(GroupConfigurationPropertiesConstant.ALLOW_WORKING_HOURS_FOR_BRANCH, false)) {
				final var	jsonObj	= isLockBooking(request, executive);

				if(jsonObj != null)
					return JsonUtility.convertionToJsonObjectForResponse(jsonObj);
			}

			if(isUsingTokenBooking)
				isTokenThroughLRBooking 	= CollectionUtility.getLongListFromString(configuration.getString(GroupConfigurationPropertiesConstant.BRANCH_ID_FOR_TOKEN_BOOKING, "0")).contains(executive.getBranchId());

			if(configuration.getBoolean(GroupConfigurationPropertiesConstant.VEHICLE_TYPE, false))
				valObjIn.put("vehicleTypes", cache.getVehicleTypeForGroup(request, executive.getAccountGroupId()));

			if(configuration.getBoolean(GroupConfigurationPropertiesConstant.DOCUMENT_TYPE_SELECTION, false))
				valObjIn.put("articleTypeForGroup", cache.getArticleTypeForGroup(request, executive.getAccountGroupId()));

			valObjIn.put("GroupWayBillTypes", cache.getGroupWayBillTypes(request, executive.getAccountGroupId()));

			if(configuration.getBoolean(GroupConfigurationPropertiesConstant.COMMODITY_TYPE, false))
				valObjIn.put("commodities", cache.getCommodityForGroup(request, executive.getAccountGroupId()));

			valObjIn.put("packingType", cache.getAllPackingType(request, executive.getAccountGroupId()));

			final var	generalConfiguration= cache.getGeneralConfiguration(request, executive.getAccountGroupId());
			final var 	displayDataConfig	= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.DISPLAY_DATA_CONFIGURATION);
			final var	subRegion			= cache.getAllSubRegions(request);

			final HashMap<?, ?>	execFldPermissions			= cache.getExecutiveFieldPermission(request);
			final var	isDefaultDestinationNeeded	= configuration.getBoolean(GroupConfigurationPropertiesConstant.IS_DEFAULT_DESTINATION_NEEDED,false);
			final var	manualLrOnAutoConfigValue	= cache.getBranchPermissionConfigValue(request, executive.getBranchId(), BranchPermission.BRANCH_PERMISSION_CONFIG_KEY_MANUAL_LRNO_ONAUTO);
			final var	maxNoOfDaysAllowBeforeCashStmtEntry = cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_MAX_DAYS_OF_OPERATION_BEFORE_CASHSTATEMENT_ENTRY_ID);

			configuration.put(GeneralConfiguration.BANK_PAYMENT_OPERATION_REQUIRED, generalConfiguration.get(GeneralConfiguration.BANK_PAYMENT_OPERATION_REQUIRED));
			configuration.put(GeneralConfiguration.CHEQUE_BOUNCE_REQUIRED, generalConfiguration.get(GeneralConfiguration.CHEQUE_BOUNCE_REQUIRED));
			configuration.put(GeneralConfiguration.IS_ALLOW_BOOKING_LOCKING_WHEN_CHEQUE_BOUNCE, generalConfiguration.get(GeneralConfiguration.IS_ALLOW_BOOKING_LOCKING_WHEN_CHEQUE_BOUNCE));
			configuration.put(GeneralConfiguration.IS_ALLOW_DELIVERY_LOCKING_WHEN_CHEQUE_BOUNCE, generalConfiguration.get(GeneralConfiguration.IS_ALLOW_DELIVERY_LOCKING_WHEN_CHEQUE_BOUNCE));
			configuration.put(GeneralConfiguration.BRANCH_WISE_DATA_HIDE, generalConfiguration.get(GeneralConfiguration.BRANCH_WISE_DATA_HIDE));
			configuration.put(GeneralConfiguration.BRANCH_IDS_TO_HIDE, generalConfiguration.get(GeneralConfiguration.BRANCH_IDS_TO_HIDE));
			configuration.put(GeneralConfiguration.BOOKING_CHARGE_IDS, generalConfiguration.get(GeneralConfiguration.BOOKING_CHARGE_IDS));
			configuration.put(GroupConfigurationPropertiesConstant.IS_ALLOW_TO_SHOW_BILLING_PARTY_GSTN, configuration.getBoolean(GroupConfigurationPropertiesConstant.IS_ALLOW_TO_SHOW_BILLING_PARTY_GSTN, false) || executive.getAccountGroupId() > AccountGroupConstant.ACCOUNT_GROUP_ID_SEVA ? "true" : "false");

			final var	allowPrepaidAmount					= configuration.getBoolean(GroupConfigurationPropertiesConstant.ALLOW_PREPAID_AMOUNT);
			final var	allowRechargeRequestAtBookingPage	= configuration.getBoolean(GroupConfigurationPropertiesConstant.ALLOW_RECHARGE_REQUEST_AT_BOOKINGPAGE);
			final var 	allowBranchWisePrepaidAmount		= configuration.getBoolean(GroupConfigurationPropertiesConstant.ALLOW_BRANCH_WISE_PREPAID_AMOUNT, false);

			final var	subRegionIdArray = CollectionUtility.getLongListFromString(configuration.getString(GroupConfigurationPropertiesConstant.SUB_REGION_IDS_FOR_OVERNITE, "0"));

			discountInPercent	= cache.getModuleWiseDiscountLimit(request, executive.getAccountGroupId(),
					ModuleWiseDiscountLimitConfigurationDTO.BOOKING_DISCOUNT_LIMIT_ALLOW,
					ModuleWiseDiscountLimitConfigurationDTO.BOOKING_DISCOUNT_LIMIT_IN_PERCENT);

			if(configuration.getBoolean(GroupConfigurationPropertiesConstant.BRANCH_WISE_PARTY_AUTO_COMPLETE, true) ) {
				final var 	branchIdStringForAutocomplete =	configuration.getString(GroupConfigurationPropertiesConstant.BRANCH_ID_FOR_PARTY_AUTO_COMPLETE,"");
				final var 	branchIdListForAutocomplete   = CollectionUtility.getLongListFromString(branchIdStringForAutocomplete);

				if(!branchIdListForAutocomplete.isEmpty() && branchIdListForAutocomplete.contains(executive.getBranchId())) {
					configuration.put(GroupConfigurationPropertiesConstant.CONSIGNOR_NAME_AUTOCOMPLETE, Constant.TRUE);
					configuration.put(GroupConfigurationPropertiesConstant.CONSIGNEE_NAME_AUTOCOMPLETE, Constant.TRUE);
					configuration.put(GroupConfigurationPropertiesConstant.NEW_PARTY_AUTO_SAVE, Constant.TRUE);
					configuration.put(GroupConfigurationPropertiesConstant.VALIDATE_E_WAYBILL_NUMBER_BY_API, Constant.TRUE);
					configuration.put(GroupConfigurationPropertiesConstant.SHOW_EXTRA_SINGLEE_WAYBILL_FIELD, Constant.TRUE);
					configuration.put(GroupConfigurationPropertiesConstant.SHOW_DATA_BY_E_WAYBILL_API_ON_BOOKING_SCREEN, Constant.TRUE);
				} else {
					configuration.put(GroupConfigurationPropertiesConstant.CONSIGNOR_NAME_AUTOCOMPLETE, Constant.FALSE);
					configuration.put(GroupConfigurationPropertiesConstant.CONSIGNEE_NAME_AUTOCOMPLETE, Constant.FALSE);
					configuration.put(GroupConfigurationPropertiesConstant.NEW_PARTY_AUTO_SAVE, Constant.FALSE);
					configuration.put(GroupConfigurationPropertiesConstant.VALIDATE_E_WAYBILL_NUMBER_BY_API, Constant.FALSE);
					configuration.put(GroupConfigurationPropertiesConstant.SHOW_EXTRA_SINGLEE_WAYBILL_FIELD, Constant.FALSE);
					configuration.put(GroupConfigurationPropertiesConstant.SHOW_DATA_BY_E_WAYBILL_API_ON_BOOKING_SCREEN, Constant.FALSE);
				}
			}

			valObjIn.put(Executive.EXECUTIVE, executive);
			valObjIn.put(GroupConfigurationPropertiesDTO.GROUP_CONFIGURATION, configuration);
			valObjIn.put("branchcache", cache.getGenericBranchesDetail(request));
			valObjIn.put("subRegion", subRegion);
			valObjIn.put("wayBillType", wayBillType);
			valObjIn.put("showWayBillTypes", showWayBillTypes);
			valObjIn.put("execFldPermissions", execFldPermissions);
			valObjIn.put(ExecutiveFunctionsModel.EXECUTIVE_FUNCTION, cache.getExecFunctions(request));
			valObjIn.put("manualLrOnAutoConfigValue", manualLrOnAutoConfigValue);
			valObjIn.put(TDSPropertiesConstant.TDS_CONFIGURATION, cache.getTDSConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.BOOKING));
			valObjIn.put(TransportListMaster.TRANSPORT_LIST, cache.getTransportList(request));
			valObjIn.put(AliasNameConstants.ACCOUNT_GROUP, cache.getAccountGroupById(request, executive.getAccountGroupId()));
			valObjIn.put("transportModeList", cache.getTransportationModeForGroupList(request, executive.getAccountGroupId()));
			valObjIn.put("charges", cache.getActiveBookingCharges(request, executive.getBranchId()));
			valObjIn.put(TaxModel.TAX_MODEL_ARR, cache.getTaxes(request, executive));
			valObjIn.put("taxModelHm", cache.getTaxMasterForGroupDataHM(request, executive));
			valObjIn.put("executiveBranch", cache.getExecutiveBranch(request, executive.getBranchId()));
			valObjIn.put(PaymentTypePropertiesConstant.PHONE_PAY_PAYMENT_TYPE_CONFIGURATION, cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.PAYMENT_TYPE, ModuleIdentifierConstant.PHONE_PE_API));

			final var	loggedInExecutiveBranch		= cache.getGenericBranchDetailCache(request, executive.getBranchId());
			final var	loggedInExecutiveSubregion	= cache.getGenericSubRegionById(request, loggedInExecutiveBranch.getSubRegionId());

			if(allowBranchWisePrepaidAmount)
				srcBranchWisePrepaidAmtAndCreditLimitEntry		= CreditLimitTransactionBllImpl.getInstance().getBranchWisePrepaidAmtAndCreditLimitTxnEntry(executive.getBranchId(), configuration.getHtData());

			if(loggedInExecutiveBranch.isAgentBranch() && allowPrepaidAmount && (!allowBranchWisePrepaidAmount || srcBranchWisePrepaidAmtAndCreditLimitEntry)) {
				branchWisePrepaidAmount	= BranchWisePrepaidAmountDaoImpl.getInstance().getBranchWisePrepaidAmountByBranchId(executive.getAccountGroupId(), executive.getBranchId());
				valObjIn.put("branchWisePrepaidAmount", branchWisePrepaidAmount);
				valObjIn.put("allowPrepaidAmount", allowPrepaidAmount);
			}

			if(configuration.getBoolean(GroupConfigurationPropertiesConstant.UPLOAD_INVOICE_DOCUMENTS, false)) {
				final var uploadPdfProperties	= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.UPLOAD_PDF_DETAILS, ModuleIdentifierConstant.BOOKING);
				final var fileTypeExtensionIds	= (String) uploadPdfProperties.getOrDefault(UploadPdfDetailsPropertiesConstant.FILE_TYPE_EXTENTION_IDS, "");
				final var uploadPdfDetailsList	= Arrays.stream(fileTypeExtensionIds.split(",")).map(e -> FileExtensionConstant.getFileExtentionHM().get(Short.parseShort(e))).toList();

				valObjOut.put("uploadPdfDetailsList", uploadPdfDetailsList);

				configuration.put(UploadPdfDetailsPropertiesConstant.NO_OF_FILE_TO_UPLOAD, uploadPdfProperties.getOrDefault(UploadPdfDetailsPropertiesConstant.NO_OF_FILE_TO_UPLOAD, 0));
				configuration.put(UploadPdfDetailsPropertiesConstant.MAX_SIZE_OF_FILE_TO_UPLOAD, uploadPdfProperties.get(UploadPdfDetailsPropertiesConstant.MAX_SIZE_OF_FILE_TO_UPLOAD));
			}

			valObjOut.put(GroupConfigurationPropertiesConstant.ALLOW_RECHARGE_REQUEST_AT_BOOKINGPAGE, loggedInExecutiveBranch.isAgentBranch()  && allowRechargeRequestAtBookingPage && execFldPermissions.containsKey(FeildPermissionsConstant.ALLOW_TO_ADD_RECHARGE_REQUEST));
			valObjOut.put("loggedInExecutiveSubregion", loggedInExecutiveSubregion);
			valObjOut.put("loggedInBranch", Converter.DtoToHashMap(cache.getExecutiveBranch(request, executive.getBranchId())));
			valObjOut.put("loggedInExecutiveBranch", Converter.DtoToHashMap(loggedInExecutiveBranch)); // Do not change or remove this line
			valObjOut.put("configuration", configuration);
			valObjOut.put(GroupConfigurationPropertiesConstant.SUB_REGION_IDS_FOR_OVERNITE, subRegionIdArray);
			valObjOut.put("maxNoOfDaysAllowBeforeCashStmtEntry", maxNoOfDaysAllowBeforeCashStmtEntry);
			valObjOut.put(ModuleIdentifierConstant.MODULE_ID, ModuleIdentifierConstant.BOOKING);
			valObjOut.put(ModuleIdentifierConstant.INCOME_EXPENSE_MODULE_ID, ModuleIdentifierConstant.INCOME_TYPE_MODULE_ID);
			valObjOut.put(PodWayBillPropertiesConstant.POD_CONFIGURATION, cache.getPODWayBillConfiguration(request, executive.getAccountGroupId()));
			valObjOut.put("discountInPercent", discountInPercent);
			valObjOut.put("TaxMasterConstant", TaxMasterConstant.getTaxMasterConstant());
			valObjOut.put("ContainerDetails", ContainerDetails.getCargoTypeConstant());
			valObjOut.put("branchWisePrepaidAmount", branchWisePrepaidAmount);
			valObjOut.put(SHOW_LR_NUMBER_POPUP, showLRNumberPopup);
			valObjOut.put(GeneralConfigurationPropertiesConstant.GENERAL_CONFIGURATION, generalConfiguration.getHtData());
			valObjOut.put(Constant.IVCARGO_VIDEOS, cache.getModuleWiseVideos(request, ModuleIdentifierConstant.BOOKING));

			displayDataConfig.put(Constant.EXEC_FEILD_PERMISSION, execFldPermissions);
			displayDataConfig.put(Constant.EXECUTIVE_TYPE, executive.getExecutiveType());

			valObjOut.put(DisplayDataWithinDateRangePropertiesConstant.WAY_BILL_TYPE_ID_TO_SHOW_ZERO_AMOUNT, displayDataConfig.get(DisplayDataWithinDateRangePropertiesConstant.WAY_BILL_TYPE_ID_TO_SHOW_ZERO_AMOUNT));
			valObjOut.put(DisplayDataWithinDateRangePropertiesConstant.SHOW_ZERO_AMOUNT, DisplayDataConfigurationBllImpl.getInstance().isShowZeroAmountInModule(displayDataConfig, ModuleIdentifierConstant.BOOKING));

			if(isDefaultDestinationNeeded) {
				final var	destinationBranchMapping	= cacheData.getDestinationMappingBranchByAccountGroupAndBranchId(executive.getAccountGroupId(), executive.getBranchId());

				if(destinationBranchMapping != null) {
					final var	destinationBranchObj		= cache.getGenericBranchDetailCache(request, destinationBranchMapping.getDestinationBranchId() );
					final var	destinationSubRegion		= cache.getGenericSubRegionById(request, destinationBranchObj.getSubRegionId());

					if(destinationSubRegion != null)
						destinationBranch = destinationBranchObj.getName() + " ( " + destinationSubRegion.getName() + " )";
					else
						destinationBranch = destinationBranchObj.getName();

					final var	destinationBranchIds	= destinationBranchObj.getBranchId() + "_" + destinationBranchObj.getCityId() + "_" + destinationBranchObj.getStateId() + "_" + destinationBranchObj.getTypeOfLocation() + "_" + destinationBranchObj.getAccountGroupId();
					valObjOut.put("destinationBranch", destinationBranch);
					valObjOut.put("destinationBranchIds", destinationBranchIds);
				}
			}

			if(configuration.getBoolean(GroupConfigurationPropertiesConstant.SHOW_DIVISION_SELECTION))
				valObjOut.put(DivisionMaster.DIVISION_LIST, cache.getDivisionMasterList(request, executive.getAccountGroupId()));

			if(configuration.getBoolean(GroupConfigurationPropertiesConstant.PACKAGE_CONDITION_SELECTION))
				valObjOut.put(PackageConditionMaster.PACKAGE_CONDITION_LIST, cache.getPackageConditionList(request));

			final var	serviceObject	= checkServicePermission(valObjIn);
			valObjOut.put("servicePermission", serviceObject);
			valObjOut.put("isTokenThroughLRBooking", isTokenThroughLRBooking);
			valObjOut.put("isUsingTokenBooking", isUsingTokenBooking);

			generateToken(request, valObjOut, jsonObjectOut);

			final var	jsobj = wayBillBll.initilize(valObjOut, valObjIn);

			showLRNumberPopup = jsobj.getBoolean(SHOW_LR_NUMBER_POPUP);

			if(!showLRNumberPopup && request.getSession().getAttribute(SHOW_LR_NUMBER_POPUP) == null)
				request.getSession().setAttribute(SHOW_LR_NUMBER_POPUP, showLRNumberPopup);

			if(request.getSession().getAttribute(SHOW_LR_NUMBER_POPUP) != null)
				jsobj.put(SHOW_LR_NUMBER_POPUP, request.getSession().getAttribute(SHOW_LR_NUMBER_POPUP));

			jsobj.put("isPaidBookingPermission", request.getSession().getAttribute("isPaidBookingPermission"));
			jsobj.put("isTopayBookingPermission", request.getSession().getAttribute("isTopayBookingPermission"));
			jsobj.put("isTbbBookingPermission", request.getSession().getAttribute("isTbbBookingPermission"));
			jsobj.put("isFocBookingPermission", request.getSession().getAttribute("isFocBookingPermission"));

			final var object = JsonUtility.convertionToJsonObjectForResponse(jsobj);

			if(request.getSession().getAttribute(Constant.SHORTCUT_PARAM) != null) {
				object.put(Constant.SHORTCUT_PARAM, request.getSession().getAttribute(Constant.SHORTCUT_PARAM));
				request.getSession().removeAttribute(Constant.SHORTCUT_PARAM);
			}

			return object;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private JSONObject createWB(final HttpServletRequest request, final HttpServletResponse response, final JSONObject jsonObjectOut, final JSONObject jsonObjectIn) throws Exception {
		Branch							srcBranch							= null;
		Branch							handlingBranch						= null;
		ValueObject						jsobj								= null;
		List<Short> 					formTypesList						= null;
		HashMap<Object,Object>			objectOut 							= null;
		short							serverIdentifier					= 0;
		Branch							destHandlingBranch					= null;

		try {
			final var	cache					= new CacheManip(request);
			final var	billPrintFormatterBll 	= new WayBillPrintFormatterBll();
			final var	wayBillBll				= new WayBillBll();

			final var	valueObjectIn			= JsonUtility.convertJsontoValueObject(jsonObjectIn);
			final var	valObjOut				= JsonUtility.convertJsontoValueObject(jsonObjectOut);

			final var	executive				= cache.getExecutive(request);
			final var	configuration			= cache.getGroupConfiguration(request, executive.getAccountGroupId());
			final var	isManual				= valueObjectIn.getBoolean("isManual", false);

			if(isManual && configuration.getBoolean(GroupConfigurationPropertiesConstant.BACKEND_VALIDATION_FOR_DUPLICATE_MANUAL_NUMBER, false)) {
				final var	jsobjLrNumber 	= checkDuplicateLR(executive, valueObjectIn, valObjOut, configuration);

				if(jsobjLrNumber.containsKey(CargoErrorList.ERROR_DESCRIPTION))
					return JsonUtility.convertionToJsonObjectForResponse(jsobjLrNumber);
			}

			final var	packingTypeMaster			= cache.getPackingTypeMasterData(request);
			final var	execFeildPermission			= cache.getExecutiveFieldPermission(request);
			final var	subRegionCache				= cache.getAllSubRegions(request);

			final var	charges						= cache.getActiveBookingCharges(request, executive.getBranchId());
			final var	configValueSPR				= cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_SERVICE_TAX_REPORT);
			final var	configValueKPM				= cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_CREDITOR_PAYMENT_MODULE);
			final var	configValueMS				= cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_MAIL_SERVICE);
			final var	configValWBGTROffAllow		= cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_WAYBILL_GRAND_TOTAL_ROUNDOFF);
			final var	configValueOfPDS 			= cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_PENDING_DELIVERY_STOCK_TABLE_ENTRY_AT_BOOKING_LEVEL);
			final var	configValueOfPDSEntry		= cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_PENDING_DELIVERY_STOCK_TABLE_ENTRY);
			final var	manualLrOnAutoConfigValue	= cache.getBranchPermissionConfigValue(request, executive.getBranchId(), BranchPermission.BRANCH_PERMISSION_CONFIG_KEY_MANUAL_LRNO_ONAUTO);
			final var	loggedInBranch				= cache.getExecutiveBranch(request, executive.getBranchId());
			final var	lrViewConfiguration			= cache.getConfiguration(request, executive.getAccountGroupId(), com.iv.dto.constant.ModuleIdentifierConstant.LR_SEARCH);
			final var	accountGroup				= cache.getAccountGroupByAccountGroupId(request, executive.getAccountGroupId());
			var			tokenWiseCheckingForDuplicateTransaction	= configuration.getBoolean(GroupConfigurationPropertiesConstant.TOKEN_WISE_CHECKING_FOR_DUPLICATE_TRANSACTION, false);
			final var	sourceBranchAuto			= configuration.getBoolean(GroupConfigurationPropertiesConstant.SOURCE_BRANCH_AUTO, false);
			final var  	isOpenManual				= execFeildPermission != null && execFeildPermission.get(FeildPermissionsConstant.OPEN_MANUAL) != null;

			if(accountGroup != null)
				serverIdentifier = accountGroup.getServerIdentifier();

			if(configuration.getBoolean(GroupConfigurationPropertiesConstant.ALLOW_WORKING_HOURS_FOR_BRANCH, false)) {
				final var	jsonObj	= isLockBooking(request, executive);

				if(jsonObj != null)
					return JsonUtility.convertionToJsonObjectForResponse(jsonObj);
			}

			if(configuration.getBoolean(GroupConfigurationPropertiesConstant.MAKE_WEIGHT_MANDATORY_FOR_BRANCH_COMMISSION, false)) {
				final var	commission	= new BranchCommission();

				commission.setAccountGroupId(executive.getAccountGroupId());
				commission.setCommissionTypeId(CommisionTypeConstant.COMMISSION_TYPE_ON_WEIGHT_ID);
				commission.setTxnTypeId(2);
				commission.setWayBillTypeId(valueObjectIn.getLong(Constant.WAY_BILL_TYPE_ID));
				commission.setTxnBranchId(valueObjectIn.getLong(Constant.DESTINATION_BRANCH_ID));

				if(valueObjectIn.getLong("actualWeight", 0) <= 0 && Boolean.TRUE.equals(BranchCommissionMasterDaoImpl.getInstance().checkBranchCommisionOnLRType(commission))) {
					jsobj	= new ValueObject();
					jsobj.put(CargoErrorList.ERROR_DESCRIPTION, "Please Enter Actual Weight");

					return JsonUtility.convertionToJsonObjectForResponse(jsobj);
				}
			}

			final var	isDummyLR					= valueObjectIn.getBoolean("isDummyLR", false);
			final var	isTokenWiseLR				= valueObjectIn.getBoolean("isTokenWiseLR", false);
			final var	isLocalBookingLR			= valueObjectIn.getBoolean("isLocalBookingLR", false);
			final var	isFTLBookingScreen			= valueObjectIn.getBoolean("isFTLBookingScreen", false);
			final var	sequenceTypeSelection		= valueObjectIn.getShort("SequenceTypeSelection", (short) 0);
			final var	isReturnBookingLR			= valueObjectIn.getBoolean("isReturnBookingLR", false);
			final var	token						= valueObjectIn.getString("token", null);

			if(configuration.getBoolean(GroupConfigurationPropertiesConstant.CHECK_LR_TYPE_PERMISSIONS_WHILE_BOOKING_LR, false)) {
				final var jsonObject = checkLRTypesPermission(request, valueObjectIn);
				if(jsonObject != null) return jsonObject;
			}

			if(isManual || isReturnBookingLR || sourceBranchAuto || isTokenWiseLR || isFTLBookingScreen && isOpenManual)
				srcBranch				= cache.getGenericBranchDetailCache(request, valueObjectIn.getLong("sourceBranchId", 0));
			else {
				srcBranch				= cache.getGenericBranchDetailCache(request, executive.getBranchId());
				valueObjectIn.put("sourceBranchId", executive.getBranchId());
			}

			if(srcBranch == null) {
				jsobj	= new ValueObject();
				jsobj.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.SOURCE_BRANCH_MISSING_DESCRIPTION);

				return JsonUtility.convertionToJsonObjectForResponse(jsobj);
			}

			final var	jsonObj = validateWaybillData(executive, valueObjectIn, request, configuration);

			if(jsonObj != null)
				return JsonUtility.convertionToJsonObjectForResponse(jsonObj);

			if (!isDummyLR && !isTokenWiseLR && !isLocalBookingLR && !isReturnBookingLR)
				formTypesList			= getFormTypes(valueObjectIn);

			final var	destBranch					= cache.getGenericBranchDetailCache(request, valueObjectIn.getLong("destinationBranchId", 0));

			if(destBranch == null) {
				jsobj	= new ValueObject();
				jsobj.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.DESTINATION_BRANCH_MISSING_DESCRIPTION);

				return JsonUtility.convertionToJsonObjectForResponse(jsobj);
			}

			final var	handlingBranchId			= ActionStaticUtil.getHandlingBranchIdByBranchId(request, srcBranch, executive.getAccountGroupId());
			final var	destHandlingBranchId		= ActionStaticUtil.getHandlingBranchIdByBranchId(request, destBranch, executive.getAccountGroupId());

			if(handlingBranchId > 0)
				handlingBranch = cache.getBranchById(request, executive.getAccountGroupId(), handlingBranchId);

			if(destHandlingBranchId > 0)
				destHandlingBranch = cache.getBranchById(request, executive.getAccountGroupId(), destHandlingBranchId);

			final var	branchNetworkConfiguration	= configuration.getBoolean(GroupConfigurationPropertiesConstant.BRANCH_NETWORK_CONFIGURATION, false);
			final var	wrongBranch			= wayBillBll.checkForWrongDestination(branchNetworkConfiguration, srcBranch.getAccountGroupId(), destBranch.getAccountGroupId());

			final Map<Long, Branch>	srcSubRegnBranches	= cache.getBranchesBySubRegionId(request, executive.getAccountGroupId(), srcBranch.getSubRegionId());
			final Map<Long, Branch>	destSubRegnBranches	= cache.getBranchesBySubRegionId(request, executive.getAccountGroupId(), destBranch.getSubRegionId());

			if(wrongBranch) {
				jsobj	= new ValueObject();
				jsobj.put(CargoErrorList.ERROR_CODE, CargoErrorList.WRONG_BRANCHFORCITY_ERROR);
				jsobj.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.WRONG_BRANCHFORCITY_ERROR_DESCRIPTION);

				return JsonUtility.convertionToJsonObjectForResponse(jsobj);
			}

			final var configMap = cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.CREDITOR_INVOICE_PRINT);

			valueObjectIn.put(GroupConfigurationPropertiesDTO.GROUP_CONFIGURATION, configuration);
			valueObjectIn.put("accountGroup", accountGroup);
			valueObjectIn.put(Executive.EXECUTIVE, executive);
			valueObjectIn.put("destBranch", destBranch);
			valueObjectIn.put("srcSubRegnBranches", srcSubRegnBranches);
			valueObjectIn.put("destSubRegnBranches", destSubRegnBranches);
			valueObjectIn.put("sourceBranch", srcBranch);
			valueObjectIn.put("branchcache", cache.getGenericBranchesDetail(request));
			valueObjectIn.put("citycache", cache.getCityData(request));
			valueObjectIn.put("charges", charges);
			valueObjectIn.put("packingTypeMaster", packingTypeMaster);
			valueObjectIn.put("configValueSPR", configValueSPR);
			valueObjectIn.put("configValueKPM", configValueKPM);
			valueObjectIn.put("configValueMS", configValueMS);
			valueObjectIn.put("configValWBGTROffAllow", configValWBGTROffAllow);
			valueObjectIn.put("branchesColl", cache.getGenericBranchesDetail(request));
			valueObjectIn.put("configValueOfPDS", configValueOfPDS);
			valueObjectIn.put("configValueOfPDSEntry", configValueOfPDSEntry);
			valueObjectIn.put("manualLrOnAutoConfigValue", manualLrOnAutoConfigValue);
			valueObjectIn.put(GeneralConfiguration.GENERAL_CONFIGURATION, cache.getGeneralConfiguration(request, executive.getAccountGroupId()));
			valueObjectIn.put(FormTypes.FORM_TYPES_LIST, formTypesList);
			valueObjectIn.put("wbNumberTypeList", getWBNumberTypeDetails(jsonObjectIn));
			valueObjectIn.put("wayBillChargesRemarkArr", getRemarkDetailOnBookingCharge(jsonObjectIn));
			valueObjectIn.put("containerDetailsArr", getContainerDetails(jsonObjectIn));
			valueObjectIn.put(TaxModel.TAX_MODEL_ARR, cache.getTaxes(request, executive));
			valueObjectIn.put("taxModelHm", cache.getTaxMasterForGroupDataHM(request, executive));
			valueObjectIn.put("executiveBranch", loggedInBranch);
			valueObjectIn.put(LRInvoiceDetails.INVOICE_DETAILS_ARR, getInvoiceDetails(jsonObjectIn));
			valueObjectIn.put(DisplayDataWithinDateRangePropertiesConstant.DISPLAY_DATA_CONFIGURATION_CONSTANT, cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.DISPLAY_DATA_CONFIGURATION));
			valueObjectIn.put("ddmCongigurationHM", cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.CREATE_DDM));

			if(configuration.getBoolean(GroupConfigurationPropertiesConstant.ALLOW_DISPATCH_IN_BOOKING_BRANCH, false))
				valueObjectIn.put("handlingBranchId", executive.getBranchId());
			else
				valueObjectIn.put("handlingBranchId", handlingBranchId);

			valueObjectIn.put("destHandlingBranchId", destHandlingBranchId);
			valueObjectIn.put("CashStmtEntryAllowed", cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_CASH_STATEMENT_TABLE_ENTRY));
			valueObjectIn.put(AccountGroupTieUpConfiguration.ACCOUNT_GROUP_TIE_UP_CONFIGURATION_HM,cache.getAccountGroupTieUpConfiguration(request, executive.getAccountGroupId()));
			valueObjectIn.put(LrCostConfigurationDTO.LR_COST_CONFIGURATION, cache.getGroupWiseLRCostConfiguration(request, executive.getAccountGroupId()));
			valueObjectIn.put("sequenceTypeSelection", sequenceTypeSelection);
			valueObjectIn.put(BankStatementConfigurationDTO.BANK_STATEMENT_CONFIGURATION, cache.getBankStatementConfiguration(request, executive.getAccountGroupId()));
			valueObjectIn.put(PodWayBillPropertiesConstant.POD_CONFIGURATION, cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.POD_WAYBILL));
			valueObjectIn.put("serverIdentifier", serverIdentifier);
			valueObjectIn.put(TDSPropertiesConstant.TDS_CONFIGURATION, cache.getTDSConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.BOOKING));
			valueObjectIn.put(TransportListMaster.TRANSPORT_LIST, cache.getTransportList(request));
			valueObjectIn.put("subRegionCache", subRegionCache);
			valueObjectIn.put("execFeildPermission",execFeildPermission);
			valueObjectIn.put(LRPrintPropertiesConstant.LR_PRINT_PROPERTIES, cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.LR_PRINT));
			valueObjectIn.put(LRPdfPrintProperties.LR_PDF_PRINT_PROPERTIES, cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.LR_PDF_PRINT));
			valueObjectIn.put(GroupConfigurationPropertiesConstant.ALLOW_AUTO_SEQUENCE_COUNTER_FOR_MANUAL, configuration.getBoolean(GroupConfigurationPropertiesConstant.ALLOW_AUTO_SEQUENCE_COUNTER_FOR_MANUAL, false));
			valueObjectIn.put(DashBoardConfigurationDTO.DASH_BOARD_CONFIGURATION, cache.getDashBoardConfiguration(request, executive.getAccountGroupId()));
			valueObjectIn.put(CashStatementConfigurationDTO.CASH_STATEMENT_CONFIGURATION, cache.getCashStatementConfiguration(request, executive.getAccountGroupId()));
			valueObjectIn.put(Constant.WEBSITE_PATH, cache.getWebsiteRealPath(request));
			valueObjectIn.put(Constant.IV_CARGO_URL, cache.getWebsiteURL(request));
			valueObjectIn.put(TDSPropertiesConstant.BILL_PAYMENT_TDS_PROPERTY, cache.getTDSConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.BILL_PAYMENT));
			valueObjectIn.put("isOpenManual", isOpenManual);
			valueObjectIn.put(CreditorInvoicePrintPropertiesConstant.OPEN_INVOICE_PRINT_POPUP_AFTER_BKG_DLY, configMap.getOrDefault(CreditorInvoicePrintPropertiesConstant.OPEN_INVOICE_PRINT_POPUP_AFTER_BKG_DLY, false));
			valueObjectIn.put(ManualLSConfigurationConstant.MANUAL_LS_CONFIGURATION, cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.MANUAL_LS));
			valueObjectIn.put(GroupConfigurationPropertiesConstant.SHOW_NEXT_LR_NUMBER_IN_MANUAL_AUTO, configuration.getBoolean(GroupConfigurationPropertiesConstant.SHOW_NEXT_LR_NUMBER_IN_MANUAL_AUTO, false));

			if(isFTLBookingScreen && isOpenManual)
				valueObjectIn.put(Constant.SOURCE_BRANCH_ID, srcBranch.getBranchId());

			cache.getConfigurationData(request, executive.getAccountGroupId(), valueObjectIn);

			if(jsonObjectIn.has("billArray"))
				valueObjectIn.put("billArray", JsonConvertor.toValueObjectFromJsonString(jsonObjectIn.getString("billArray")));

			if(isLocalBookingLR || isTokenWiseLR || isReturnBookingLR || isFTLBookingScreen)
				tokenWiseCheckingForDuplicateTransaction    = false;

			if(tokenWiseCheckingForDuplicateTransaction) {
				if(token == null || !token.equals(request.getSession().getAttribute(TokenGenerator.BOOKING_TOKEN_KEY + token))) {
					jsobj	= new ValueObject();
					jsobj.put(CargoErrorList.ERROR_DESCRIPTION, "Data already submitted, Please wait. ");

					return JsonUtility.convertionToJsonObjectForResponse(jsobj);
				}
				request.getSession().setAttribute(TokenGenerator.BOOKING_TOKEN_KEY + token, null);
			}

			if(isManual)
				jsobj 		= wayBillBll.createManualWayBill(valObjOut, valueObjectIn);
			else
				jsobj 		= wayBillBll.createAutoWayBill(valObjOut, valueObjectIn);

			if(jsobj.getLong(CargoErrorList.ERROR_CODE) <= 0 && jsobj.getLong(Constant.WAYBILL_ID) > 0) {
				final var showQrCodeWithOutGSTNo	= configuration.getBoolean(GroupConfigurationPropertiesConstant.SHOW_QR_CODE_WITH_OUT_GST_NO, false);

				if(jsobj.getBoolean(GroupConfigurationPropertiesConstant.IS_WS_LR_PRINT_NEEDED) && jsobj.getBoolean("isLRPrintAllow") || showQrCodeWithOutGSTNo) {
					final var objectForPrintData	= (ValueObject) jsobj.get("objectForPrintData");
					final var wayBill				= (WayBill) objectForPrintData.get(WayBill.WAYBILL);

					objectForPrintData.put(PrintHeaderModel.PRINT_HEADER_MODEL, ReportView.getInstance().setPrintHeaderModel(request, executive, wayBill.getSourceBranchId(), CustomGroupAddressPropertiesConstant.IDENTIFIER_BOOKING));
					objectForPrintData.put("loggedInBranch", loggedInBranch);
					objectForPrintData.put("handlingBranch", handlingBranch);
					objectForPrintData.put("destHandlingBranch", destHandlingBranch);
					objectForPrintData.put(PodWayBillPropertiesConstant.POD_CONFIGURATION, cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.POD_WAYBILL));
					objectForPrintData.put("isDummyLR", isDummyLR);
					objectForPrintData.put("citycache", cache.getCityData(request));
					objectForPrintData.put("branchcache", cache.getGenericBranchesDetail(request));
					objectForPrintData.put("subRegionCache", subRegionCache);
					objectForPrintData.put(ExecutiveFunctionsModel.EXECUTIVE_FUNCTION, cache.getExecFunctions(request));
					objectForPrintData.put(AccountGroupPermission.ACCOUNT_GROUP_PERMISSION, cache.getGroupPermissionHMByIdAndType(request, executive.getAccountGroupId()));
					objectForPrintData.put("sourceStateId", srcBranch.getStateId());
					objectForPrintData.put("destinationStateId", destBranch.getStateId());

					objectOut	= billPrintFormatterBll.getDataToPrintWayBill(objectForPrintData);
				}

				generateToken(request, jsobj, null);
				jsobj.remove("objectForPrintData");
			} else if(jsobj != null && jsobj.getLong(CargoErrorList.ERROR_CODE) > 0 && generateTokenForSelectedToken(jsobj.getLong(CargoErrorList.ERROR_CODE)))
				generateToken(request, jsobj, null);

			jsobj.put(LrViewConfigurationPropertiesConstant.COOKIE_TIME_FOR_LR_PRINT, lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.COOKIE_TIME_FOR_LR_PRINT,0));
			jsobj.put("redirectTo", 1);
			final var object = JsonUtility.convertionToJsonObjectForResponse(jsobj);

			// created cookie for disabled LR print link after 10 minutes
			setCookie(response, jsobj);

			object.put("objectOut", objectOut);

			return object;
		} catch (final Exception e) {
			generateToken(request, jsobj, null);
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private List<Short> getFormTypes(final ValueObject valObjIn) throws Exception {
		try {
			return CollectionUtility.getShortListFromString(valObjIn.getString("FormTypes", null));
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private List<WBNumberTypeDetail> getWBNumberTypeDetails(final JSONObject jsonObjectIn) {
		try {
			return JsonConvertor.parseJsonObjectsToList(jsonObjectIn, "WBNumberTypeArr", WBNumberTypeDetail.class);
		} catch (final Exception e) {
			return Collections.emptyList();
		}
	}

	private List<ContainerDetails> getContainerDetails(final JSONObject jsonObjectIn) {
		try {
			return JsonConvertor.parseJsonObjectsToList(jsonObjectIn, "containerDetailsArray", ContainerDetails.class);
		} catch (final Exception e) {
			return Collections.emptyList();
		}
	}

	private List<WayBillChargesRemark> getRemarkDetailOnBookingCharge(final JSONObject jsonObjectIn) {
		try {
			return JsonConvertor.parseJsonObjectsToList(jsonObjectIn, "wayBillBookingChargeRemarkArray", WayBillChargesRemark.class);
		} catch (final Exception e) {
			return Collections.emptyList();
		}
	}

	private void setCookie(final HttpServletResponse response, final ValueObject jsobj) throws Exception {
		try {

			final var lCDateTime = Calendar.getInstance();

			var currentCookieTime	= lCDateTime.getTimeInMillis();
			currentCookieTime		-= 120000;
			var cookieLife			= 480000L;//  in milli seconds

			if(jsobj.getLong(LrViewConfigurationPropertiesConstant.COOKIE_TIME_FOR_LR_PRINT) > 0)
				cookieLife = jsobj.getLong(LrViewConfigurationPropertiesConstant.COOKIE_TIME_FOR_LR_PRINT);

			final var	expiryTime	= cookieLife + currentCookieTime;
			final var cookie	= new Cookie("LR_" + jsobj.get("wayBillId"), Long.toString(currentCookieTime) + "_" + expiryTime);
			cookie.setMaxAge(60 * 30);
			response.addCookie(cookie);

		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private JSONObject checkDuplicateLR(final HttpServletRequest request, final JSONObject jsonObjectOut, final JSONObject jsonObjectIn) throws Exception {
		try {
			final var	cache				= new CacheManip(request);
			final var	executive			= cache.getExecutive(request);
			final var	configuration		= cache.getGroupConfiguration(request, executive.getAccountGroupId());
			final var	valObjIn			= JsonUtility.convertJsontoValueObject(jsonObjectIn);
			final var	valObjOut			= JsonUtility.convertJsontoValueObject(jsonObjectOut);

			final var	jsobj 	= checkDuplicateLR(executive, valObjIn, valObjOut, configuration);

			return JsonUtility.convertionToJsonObjectForResponse(jsobj);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private ValueObject checkDuplicateLR(final Executive executive, final ValueObject valObjIn, final ValueObject valObjOut, final ValueObject configuration) throws Exception {
		try {
			valObjIn.put(Executive.EXECUTIVE, executive);
			valObjIn.put(GroupConfigurationPropertiesConstant.DO_NOT_ALLOW_DUPLICATE_MANUAL_LR_NUMBER, configuration.getBoolean(GroupConfigurationPropertiesConstant.DO_NOT_ALLOW_DUPLICATE_MANUAL_LR_NUMBER,false));
			valObjIn.put(GroupConfigurationPropertiesConstant.IS_DUMMY_LR_SEQUENCE_CHECK, configuration.getBoolean(GroupConfigurationPropertiesConstant.IS_DUMMY_LR_SEQUENCE_CHECK,false));
			valObjIn.put(GroupConfigurationPropertiesConstant.ALLOW_AUTO_SEQUENCE_COUNTER_FOR_MANUAL, configuration.getBoolean(GroupConfigurationPropertiesConstant.ALLOW_AUTO_SEQUENCE_COUNTER_FOR_MANUAL,false));
			valObjIn.put(GroupConfigurationPropertiesConstant.FORMAT_SPECIFIER_FOR_WAY_BILL_NUMBER, configuration.getString(GroupConfigurationPropertiesConstant.FORMAT_SPECIFIER_FOR_WAY_BILL_NUMBER, "0"));
			valObjIn.put(GroupConfigurationPropertiesConstant.BRANCH_CODE_AND_ALPHA_SEPARATOR_WISE_SEQUENCE, configuration.getBoolean(GroupConfigurationPropertiesConstant.BRANCH_CODE_AND_ALPHA_SEPARATOR_WISE_SEQUENCE,false));

			return SequenceCounterBLL.getInstance(executive.getBranchId()).checkDuplicateLR(valObjIn, valObjOut);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	/*
	 * Method For Check Lr Number Agent Wise
	 */
	private JSONObject checkDuplicateLRByAgentId(final HttpServletRequest request, final JSONObject jsonObjectOut, final JSONObject jsonObjectIn) throws Exception {
		try {
			final var	wayBillBll			= new WayBillBll();

			final var	valObjIn			= JsonUtility.convertJsontoValueObject(jsonObjectIn);
			final var	valObjOut			= JsonUtility.convertJsontoValueObject(jsonObjectOut);

			final var	executive			= (Executive) request.getSession().getAttribute(Executive.EXECUTIVE);

			valObjIn.put(Executive.EXECUTIVE, executive);

			final var	jsobj 	= wayBillBll.checkDuplicateLRByAgentId(valObjIn, valObjOut);

			return JsonUtility.convertionToJsonObjectForResponse(jsobj);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public ValueObject checkServicePermission(final ValueObject valObjIn) throws Exception {
		ValueObject			checkPermission			= null;

		try {
			final var	valObjOut	= new ValueObject();
			final var	valObjTemp	= new ValueObject();

			final var	executive			= (Executive) valObjIn.get(Executive.EXECUTIVE);
			final HashMap<?, ?>	execFldPermissions	= (HashMap<?, ?>) valObjIn.get("execFldPermissions");

			valObjTemp.put("userId", executive.getAccountGroupId()); // can be change in future

			if(execFldPermissions != null && execFldPermissions.get(FeildPermissionsConstant.ALLOW_BOOKING_TIME_PHOTO_SERVICE) != null) {
				valObjTemp.put("serviceId", Service.PHOTO_TRANSACTION);

				//photo service permission
				checkPermission   = ServicePermissionUtility.getServicePermission(valObjTemp);
			}

			valObjOut.put("isPhotoTxnService", checkPermission != null);

			return valObjOut;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private boolean generateTokenForSelectedToken(final long errorCode) {
		try {
			return WayBillBll.getErrorListForTokenGeneration().contains((int) errorCode);
		} catch (final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
		}

		return false;
	}

	private ValueObject returnMessage(final HttpServletRequest request, final String msg) throws Exception {
		final var	jsobj	= new ValueObject();
		jsobj.put(CargoErrorList.ERROR_DESCRIPTION, msg);
		generateToken(request, jsobj, null);
		return jsobj;
	}

	private ValueObject returnMessage(final HttpServletRequest request, final ValueObject jsobj) throws Exception {
		final var	message	= (Message) jsobj.get(Message.MESSAGE);
		jsobj.put(CargoErrorList.ERROR_DESCRIPTION, message.getDescription());
		generateToken(request, jsobj, null);
		return jsobj;
	}

	private void generateToken(final HttpServletRequest request, ValueObject jsonObjectOut, JSONObject jsonObject) {
		try {
			final var session = request.getSession();

			final var token = TokenGenerator.nextToken();

			if (token != null) {
				session.setAttribute(TokenGenerator.BOOKING_TOKEN_KEY + token, token);

				if(jsonObjectOut == null)
					jsonObjectOut	= new ValueObject();

				if(jsonObject == null)
					jsonObject	= new JSONObject();

				jsonObject.put("token", token);
				jsonObjectOut.put("token", token);
			}
		} catch (final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private ValueObject validateWaybillData(final Executive executive, final ValueObject valueObjectIn, final HttpServletRequest request, final ValueObject configuration) throws Exception {
		ValueObject			jsobj		= null;

		try {
			final var	subRegionIdsForPartyValidateList	= CollectionUtility.getLongListFromString(configuration.getString(GroupConfigurationPropertiesConstant.SUB_REGION_IDS_FOR_PARTY_VALIDATE, "0"));

			final var wayBillTypeId	= valueObjectIn.getLong(Constant.WAY_BILL_TYPE_ID, 0);

			if(subRegionIdsForPartyValidateList.contains(executive.getSubRegionId())
					&& (wayBillTypeId == WayBillTypeConstant.WAYBILL_TYPE_CREDIT && valueObjectIn.getLong("consignorCorpId", 0) == 0
					|| wayBillTypeId != WayBillTypeConstant.WAYBILL_TYPE_CREDIT && valueObjectIn.getLong("partyMasterId", 0) == 0
					|| valueObjectIn.getLong("consigneePartyMasterId", 0) == 0))
				return returnMessage(request, "Please Enter Valid Consignor/Consignee Party");

			if(configuration.getBoolean(GroupConfigurationPropertiesConstant.BLOCK_TOPAY_BOOKING_FOR_CONSIGNEE_BILLING_PARTY, false)
					&& wayBillTypeId == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY && valueObjectIn.getBoolean("isConsigneeTBBParty", false))
				return returnMessage(request, CargoErrorList.TBB_PARTY_TOPAY_ERROR_DESCRIPTION);

			if(configuration.getBoolean(GroupConfigurationPropertiesConstant.BLOCK_PAID_BOOKING_FOR_CONSIGNOR_BILLING_PARTY, false)
					&& wayBillTypeId == WayBillTypeConstant.WAYBILL_TYPE_PAID && valueObjectIn.getBoolean("isConsignorTBBParty", false))
				return returnMessage(request, CargoErrorList.TBB_PARTY_PAID_ERROR_DESCRIPTION);

			if(configuration.getBoolean(GroupConfigurationPropertiesConstant.GST_NUMBER_WISE_BOOKING, false)) {
				jsobj	= BookingDataValidation.getInstance().validateValidGSTNumber(valueObjectIn.getHtData(), configuration);

				if(jsobj != null)
					return returnMessage(request, jsobj);
			}

			if(configuration.getBoolean(GroupConfigurationPropertiesConstant.INVOICE_NO_VALIDATE_FOR_DUPLICATE_IN_SAME_DAY, false)) {
				jsobj	= BookingDataValidation.getInstance().validateDuplicateInvoiceNumberInSameDay(executive.getAccountGroupId(), valueObjectIn);

				if(jsobj != null)
					return returnMessage(request, jsobj);
			}

			return jsobj;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private JSONObject showPopup(final HttpServletRequest request) throws Exception {
		try {
			final var	jsonObject				= new JSONObject();

			if(request.getSession().getAttribute(SHOW_LR_NUMBER_POPUP) == null)
				request.getSession().setAttribute(SHOW_LR_NUMBER_POPUP, false);

			return jsonObject;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private List<LRInvoiceDetails> getInvoiceDetails(final JSONObject jsonObjectIn) {
		try {
			return JsonConvertor.parseJsonObjectsToList(jsonObjectIn, LRInvoiceDetails.INVOICE_DETAILS_ARR, LRInvoiceDetails.class);
		} catch (final Exception e) {
			return Collections.emptyList();
		}
	}

	private ValueObject isLockBooking(final HttpServletRequest request, final Executive executive) throws Exception {
		try {
			final var cache					= new CacheManip(request);
			final var operationLockingData	= cache.getOperationLockingData(request, executive);

			final var	jsonObj	= OperationLockingBllImpl.getInstance().isLockBooking(operationLockingData);

			if(jsonObj != null)
				return returnMessage(request, jsonObj);

			return null;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private JSONObject checkLRTypesPermission(final HttpServletRequest request, final ValueObject valueObjectIn) throws Exception {
		try {
			final var	paidBookingAllow			= (boolean) request.getSession().getAttribute("paidBookingAllow");
			final var	topayBookingAllow			= (boolean) request.getSession().getAttribute("topayBookingAllow");
			final var	tbbBookingAllow				= (boolean) request.getSession().getAttribute("tbbBookingAllow");
			final var	focBookingAllow				= (boolean) request.getSession().getAttribute("focBookingAllow");
			final var	wayBillTypeId				= valueObjectIn.getLong(Constant.WAY_BILL_TYPE_ID, 0);

			if(!paidBookingAllow && wayBillTypeId == WayBillTypeConstant.WAYBILL_TYPE_PAID || !topayBookingAllow && wayBillTypeId == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY
					|| !tbbBookingAllow && wayBillTypeId == WayBillTypeConstant.WAYBILL_TYPE_CREDIT || !focBookingAllow && wayBillTypeId == WayBillTypeConstant.WAYBILL_TYPE_FOC) {
				final var	jsobj	= new ValueObject();
				jsobj.put(CargoErrorList.ERROR_DESCRIPTION, "You don't have permission to book " + WayBillTypeConstant.getWayBillTypeNameByWayBilTypeId(wayBillTypeId) + " LR !");
				generateToken(request, jsobj, null);
				return JsonUtility.convertionToJsonObjectForResponse(jsobj);
			}
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}

		return null;
	}
}