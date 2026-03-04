
package com.ivcargo.actions;

//~--- non-JDK imports --------------------------------------------------------

import java.io.PrintWriter;
import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.HashMap;
import java.util.TimeZone;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONObject;

import com.businesslogic.CorporateAccountBLL;
import com.businesslogic.DiscountMasterBLL;
import com.businesslogic.GenerateCashReceiptBLL;
import com.businesslogic.properties.GeneralConfiguration;
import com.businesslogic.properties.impl.PropertyConfigValueBLLImpl;
import com.businesslogic.tds.TDSTxnDetailsBLL;
import com.businesslogic.utils.SequenceCounterBLL;
import com.framework.Action;
import com.iv.akka.Actor;
import com.iv.akka.Constant;
import com.iv.bll.impl.OperationLockingBllImpl;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.bll.impl.properties.SendSMSPropertyConfigBllImpl;
import com.iv.bll.utils.IDProofSelectionUtility;
import com.iv.bll.utils.PaymentTypeSelectionUtility;
import com.iv.constant.properties.GeneralConfigurationPropertiesConstant;
import com.iv.constant.properties.GenerateCashReceiptPropertiesConstant;
import com.iv.constant.properties.IDProofPropertiesConstant;
import com.iv.constant.properties.LrViewConfigurationPropertiesConstant;
import com.iv.constant.properties.PaymentTypePropertiesConstant;
import com.iv.constant.properties.TDSPropertiesConstant;
import com.iv.constant.properties.invoice.CreditorInvoicePrintPropertiesConstant;
import com.iv.constant.properties.lhpv.LHPVPropertiesConstant;
import com.iv.dao.impl.prepaid.BranchWisePrepaidAmountDaoImpl;
import com.iv.dto.TransportListMaster;
import com.iv.dto.constant.BusinessFunctionConstants;
import com.iv.dto.constant.FeildPermissionsConstant;
import com.iv.dto.constant.IDProofConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.dto.master.TaxModel;
import com.iv.dto.photoandsignatureservice.Service;
import com.iv.logsapp.LogWriter;
import com.iv.properties.constant.DisplayDataWithinDateRangePropertiesConstant;
import com.iv.utils.CollectionUtility;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.constant.DateTimeFormatConstant;
import com.iv.utils.constant.MediaTypeConstant;
import com.iv.utils.constant.PodWayBillPropertiesConstant;
import com.iv.utils.constant.properties.SendSMSPropertiesConstant;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.exception.ExceptionProcess;
import com.ivcargo.actors.PhotoServiceActor;
import com.ivcargo.actors.SignatureServiceActor;
import com.ivcargo.utils.CacheManip;
import com.ivcargo.utils.JsonUtility;
import com.ivcargo.utils.services.ServicePermissionUtility;
import com.platform.dao.GodownDao;
import com.platform.dao.ShortCreditConfigLimitDao;
import com.platform.dao.reports.CreditWayBillTxnDAO;
import com.platform.dto.AccountGroupTieUpConfiguration;
import com.platform.dto.AliasNameConstants;
import com.platform.dto.Branch;
import com.platform.dto.ConfigParam;
import com.platform.dto.DeliverySequenceCounter;
import com.platform.dto.Executive;
import com.platform.dto.PropertiesFileConstants;
import com.platform.dto.WayBillTaxDetails;
import com.platform.dto.configuration.discountlimit.ModuleWiseDiscountLimitConfigurationDTO;
import com.platform.dto.configuration.master.DisplayDataConfigurationDTO;
import com.platform.dto.configuration.mindateselection.ModuleWiseMinDateSelectionConfigurationDTO;
import com.platform.dto.configuration.modules.BankStatementConfigurationDTO;
import com.platform.dto.configuration.modules.CashStatementConfigurationDTO;
import com.platform.dto.configuration.modules.DashBoardConfigurationDTO;
import com.platform.dto.configuration.modules.DocumentCodeConfigurationDTO;
import com.platform.dto.configuration.modules.GenerateCashReceiptDTO;
import com.platform.dto.configuration.modules.GroupConfigurationPropertiesDTO;
import com.platform.dto.configuration.modules.LrCostConfigurationDTO;
import com.platform.dto.configuration.modules.PartyWiseLedgerAccountsDTO;
import com.platform.dto.constant.PODDocumentTypeConstant;
import com.platform.dto.constant.WayBillStatusConstant;
import com.platform.dto.model.CreditWayBillTxn;
import com.platform.jsonconstant.JsonConstant;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Converter;
import com.platform.utils.PropertiesUtility;
import com.platform.utils.Utility;


public class GenerateCRAjaxAction implements Action {

	public static final String TRACE_ID = GenerateCRAjaxAction.class.getName();

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {

		PrintWriter						out							= null;
		JSONObject						jsonObjectOut				= null;

		try {
			response.setContentType(MediaTypeConstant.APPLICATION_JSON_VALUE); // Setting response for JSON Content

			out						= response.getWriter();
			jsonObjectOut			= new JSONObject();
			final var	jsonObjectIn			= new JSONObject(request.getParameter("json"));
			final short	filter					= Utility.getShort(jsonObjectIn.get(com.iv.utils.constant.Constant.FILTER));

			if(request.getSession().getAttribute(Executive.EXECUTIVE) == null) {
				jsonObjectOut.put(CargoErrorList.ERROR_DESCRIPTION, "You have been logged out. Please login again.");
				out.println(jsonObjectOut);
				return;
			}

			System.out.println("filter ::"+filter);
			switch (filter) {
			case 1 -> out.println(initilizeGCR(request, jsonObjectOut, jsonObjectIn));
			case 2 -> out.println(getWayBillData(request, jsonObjectOut, jsonObjectIn));
			case 3 -> out.println(generateCR(request,response,jsonObjectIn));
			default -> {
				jsonObjectOut.put(CargoErrorList.ERROR_DESCRIPTION, "Unknown Request");
				out.println(jsonObjectOut);
			}
			}
		} catch (final Exception e) {
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, e);
			try {
				if(jsonObjectOut == null)
					jsonObjectOut	= new JSONObject();

				jsonObjectOut.put(CargoErrorList.ERROR_CODE, CargoErrorList.SYSTEM_ERROR);
				jsonObjectOut.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.SYSTEM_ERROR_DESCRIPTION);
			} catch (final Exception e1) {
				LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, ""+e1);
				e.printStackTrace();
			}

			if(out != null)
				out.println(jsonObjectOut);
		} finally {
			if(out != null) {
				out.flush();
				out.close();
			}
		}
	}

	private JSONObject initilizeGCR(final HttpServletRequest request, final JSONObject jsonObjectOut, final JSONObject jsonObjectIn) throws Exception {
		DeliverySequenceCounter						deliverySequenceCounter		= null;

		try {
			final var	cache				= new CacheManip(request);

			final var	tdsTxnDetailsBLL	= new TDSTxnDetailsBLL();

			final var	valObjIn			= JsonUtility.convertJsontoValueObject(jsonObjectIn);
			final var	valObjOut			= JsonUtility.convertJsontoValueObject(jsonObjectOut);

			final var	executive			= cache.getExecutive(request);
			final HashMap<?, ?>	execFldPermissions	= cache.getExecutiveFieldPermission(request);
			final var	execFunctions		= cache.getExecFunctions(request);
			final var	loggedInExecutiveBranch		= cache.getGenericBranchDetailCache(request, executive.getBranchId());

			valObjIn.put("execFldPermissions", execFldPermissions);
			valObjIn.put(Executive.EXECUTIVE, executive);

			final var	accountGroup			= cache.getAccountGroupById(request, executive.getAccountGroupId());
			final var	deliverChgs				= cache.getActiveDeliveryCharges(request, executive.getBranchId());
			final var	bookingChgs				= cache.getActiveBookingCharges(request, executive.getBranchId());
			final var	configuration			= cache.getGenerateCRConfiguration(request, executive.getAccountGroupId());
			final var	tdsConfiguration		= cache.getTDSConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.GENERATE_CR);
			final var	groupConfiguration		= cache.getGroupConfiguration(request, executive.getAccountGroupId());
			final var	generalConfiguration	= cache.getGeneralConfiguration(request, executive.getAccountGroupId());
			final var	branchListForNewCRPrint	= CollectionUtility.getLongListFromString(configuration.getString(GenerateCashReceiptDTO.BRANCH_CODE_LIST_FOR_NEW_CR_WS_PRINT_FLOW, "00000"));
			final var	allowPrepaidAmount		= configuration.getBoolean(GenerateCashReceiptPropertiesConstant.ALLOW_PREPAID_AMOUNT, false);
			final var	allowRechargeRequestAtBookingPage	= groupConfiguration.getBoolean(GroupConfigurationPropertiesDTO.ALLOW_RECHARGE_REQUEST_AT_BOOKINGPAGE);
			final var	receivedSMSProperties				= SendSMSPropertyConfigBllImpl.getInstance().getSMSProperty(executive.getAccountGroupId(), ModuleIdentifierConstant.RECEIVE);

			valObjOut.put("branchOnNewCRPrint", branchListForNewCRPrint.contains(executive.getBranchId()));
			valObjOut.put("bookingChgs", Converter.arrayDtotoArrayListWithHashMapConversion(bookingChgs));
			valObjOut.put("deliverChgs", Converter.arrayDtotoArrayListWithHashMapConversion(deliverChgs));
			configuration.put(GeneralConfiguration.CHEQUE_BOUNCE_REQUIRED, generalConfiguration.getBoolean(GeneralConfiguration.CHEQUE_BOUNCE_REQUIRED, false));
			configuration.put(GeneralConfiguration.IS_ALLOW_BOOKING_LOCKING_WHEN_CHEQUE_BOUNCE, generalConfiguration.getBoolean(GeneralConfiguration.IS_ALLOW_BOOKING_LOCKING_WHEN_CHEQUE_BOUNCE, false));
			configuration.put(GeneralConfiguration.IS_ALLOW_DELIVERY_LOCKING_WHEN_CHEQUE_BOUNCE, generalConfiguration.getBoolean(GeneralConfiguration.IS_ALLOW_DELIVERY_LOCKING_WHEN_CHEQUE_BOUNCE, false));
			configuration.put(GeneralConfiguration.BANK_PAYMENT_OPERATION_REQUIRED,generalConfiguration.getBoolean(GeneralConfiguration.BANK_PAYMENT_OPERATION_REQUIRED));

			final var	taxes 		= cache.getTaxes(request, executive);

			valObjOut.put("taxes", Converter.dtoListtoListWithHashMapConversion(taxes));
			final var	godownList	= GodownDao.getInstance().getGodownList(executive.getBranchId(), executive.getAccountGroupId());

			final var isBranchTypeDelivery = loggedInExecutiveBranch.getBranchType() == Branch.BRANCH_TYPE_DELIVERY || loggedInExecutiveBranch.getBranchType() == Branch.BRANCH_TYPE_BOOKING_DELIVERY_BOTH;

			if(configuration.getBoolean(GenerateCashReceiptPropertiesConstant.CHECK_BRANCH_TYPE_TO_ALLOW_DELIVERY, false)
					&& !isBranchTypeDelivery && execFunctions != null && execFunctions.containsKey(BusinessFunctionConstants.GENERATE_CR_MODULE_FOR_SINGLE_LR))
				valObjOut.put(CargoErrorList.ERROR_DESCRIPTION, "Your Branch is not Delivery Branch, Contact Admin !");

			if (configuration.containsKey(GenerateCashReceiptDTO.DELIVERY_SEQUENCE_COUNTER) && "true".equals(configuration.get(GenerateCashReceiptDTO.DELIVERY_SEQUENCE_COUNTER).toString())) {
				if (configuration.containsKey(GenerateCashReceiptDTO.GROUP_LEVEL_DELIVERY_SEQUENCE_COUNTER) && "true".equals(configuration.get(GenerateCashReceiptDTO.GROUP_LEVEL_DELIVERY_SEQUENCE_COUNTER).toString()))
					deliverySequenceCounter		= SequenceCounterBLL.getInstance(executive.getBranchId()).getGroupLevelDeliverySequenceCounter(executive, DeliverySequenceCounter.DELIVERY_SEQUENCE_MANUAL);
				else
					deliverySequenceCounter		= SequenceCounterBLL.getInstance(executive.getBranchId()).getDeliverySequenceCounter(executive, DeliverySequenceCounter.DELIVERY_SEQUENCE_MANUAL);

				if (deliverySequenceCounter != null)
					valObjOut.put("DeliverySequenceCounter", Converter.DtoToHashMap(deliverySequenceCounter));
			}

			valObjOut.put("ManualCRDaysAllowed", cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_MAX_DAYS_OF_OPERATION_BEFORE_CASHSTATEMENT_ENTRY_ID));

			if(execFldPermissions.get(FeildPermissionsConstant.DELIVERY_DISCOUNT) != null) {
				final var	discountMasterBLL	= new DiscountMasterBLL();

				valObjOut.put("discountTypes", discountMasterBLL.getDiscountTypes());
				valObjOut.put("isDeliveryDiscountAllow", true);
			}

			valObjOut.put("showbillCredit", cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_CREDIT_DELIVERY) == ConfigParam.CONFIG_KEY_CREDIT_DELIVERY_YES);
			valObjOut.put(Executive.EXECUTIVE, Converter.DtoToHashMap(executive));
			valObjOut.put("execFldPermissions", Converter.hashMapWithDtoToHashMapConversion(execFldPermissions));

			/*
			 * check and get service permission for generate CR
			 */
			final var	serviceObject	= checkServicePermission(valObjIn);
			valObjOut.put("servicePermission", serviceObject);

			/*
			 * branch wise show consignee feild
			 */
			var	wayBillTypeWiseDiscountAmountOnChangeOfConsigneePartyRate	= configuration.getBoolean(GenerateCashReceiptDTO.WAY_BILL_TYPE_WISE_DISCOUNT_AMOUNT_ON_CHANGE_OF_CONSIGNEE_PARTY_RATE, false);

			if(wayBillTypeWiseDiscountAmountOnChangeOfConsigneePartyRate) {
				final var branchIdsList = CollectionUtility.getLongListFromString(configuration.getString(GenerateCashReceiptPropertiesConstant.BRANCHES_TO_CHANGE_CONSIGNEE_PARTY_RATE, "0"));
				wayBillTypeWiseDiscountAmountOnChangeOfConsigneePartyRate	= branchIdsList.contains(executive.getBranchId());
			}

			if (configuration.getBoolean(GenerateCashReceiptDTO.PHOTO_SERVICE_VALIDATE) && !serviceObject.getBoolean("isPhotoTxnService"))
				configuration.put(GenerateCashReceiptDTO.PHOTO_SERVICE_VALIDATE, "false");

			if (configuration.getBoolean(GenerateCashReceiptDTO.SIGNATURE_SERVICE_VALIDATE) && !serviceObject.getBoolean("isSignatureTxnService"))
				configuration.put(GenerateCashReceiptDTO.SIGNATURE_SERVICE_VALIDATE, "false");

			if(configuration.getBoolean(GenerateCashReceiptDTO.SHORT_CREDIT_CONFIG_LIMIT_ALLOWED)) {
				final var	shortCreditConfigLimit = ShortCreditConfigLimitDao.getInstance().getShortCreditConfigLimit(executive.getBranchId(), executive.getAccountGroupId());

				if(shortCreditConfigLimit != null)
					valObjOut.put("shortCreditConfigLimit", Converter.DtoToHashMap(shortCreditConfigLimit));
			}

			if(loggedInExecutiveBranch.isAgentBranch() && allowPrepaidAmount) {
				valObjOut.put("branchWisePrepaidAmount", BranchWisePrepaidAmountDaoImpl.getInstance().getBranchWisePrepaidAmountByBranchId(executive.getAccountGroupId(),executive.getBranchId()));
				valObjOut.put("allowPrepaidAmount", true);
			}

			valObjOut.put(GroupConfigurationPropertiesDTO.ALLOW_RECHARGE_REQUEST_AT_BOOKINGPAGE, loggedInExecutiveBranch.isAgentBranch()  && allowRechargeRequestAtBookingPage && execFldPermissions.containsKey(FeildPermissionsConstant.ALLOW_TO_ADD_RECHARGE_REQUEST));

			valObjOut.put("configuration", configuration);
			valObjOut.put("GodownList", Converter.arrayDtotoArrayListWithHashMapConversion(godownList));

			final var	dbWiseSelfPartCA		= CorporateAccountBLL.getInstance().getDBWiseSelfPartyDetails(groupConfiguration, accountGroup);

			if(dbWiseSelfPartCA != null)
				valObjOut.put("dbWiseSelfPartCA", Converter.DtoToHashMap(dbWiseSelfPartCA));

			if(configuration.getBoolean(GenerateCashReceiptDTO.DELIVERY_LOCK)) {
				final var valueObjectOut	= OperationLockingBllImpl.getInstance().checkForDeliveryOperationLocking(executive.getAccountGroupId(), executive.getBranchId());

				if(valueObjectOut.containsKey(CargoErrorList.ERROR_DESCRIPTION)) valObjOut.put(CargoErrorList.ERROR_DESCRIPTION, valueObjectOut.get(CargoErrorList.ERROR_DESCRIPTION));
			}

			valObjOut.put("podDocumentTypeArr", Converter.arrayDtotoArrayListWithHashMapConversion(PODDocumentTypeConstant.setPODDocumentTypeArrForSelection()));

			tdsTxnDetailsBLL.setDeliveryTimeTDSDetailsForTDSCalculation(valObjOut, null, tdsConfiguration, deliverChgs);
			JsonConstant.getInstance().setOutputConstant(valObjOut);

			var validatePhonePeTxn	= false;

			final var phonePayPaymentTypeConfiguration	= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.PAYMENT_TYPE, ModuleIdentifierConstant.PHONE_PE_API);

			if((boolean) phonePayPaymentTypeConfiguration.getOrDefault(PaymentTypePropertiesConstant.VALIDATE_PHONEPE_TXN_DELIVERY, false)&&(execFldPermissions == null || execFldPermissions.get(FeildPermissionsConstant.DO_NOT_VALIDATE_PHONEPE_TXN) == null)) {
				validatePhonePeTxn		= (boolean) phonePayPaymentTypeConfiguration.getOrDefault(PaymentTypePropertiesConstant.VALIDATE_PHONEPE_TXN_DELIVERY, false);
				valObjOut.put(PaymentTypePropertiesConstant.VALIDATE_PHONEPE_TXN, validatePhonePeTxn);
			}

			valObjOut.put(PaymentTypePropertiesConstant.IS_GENERATE_QR_CODE_PHONE_PEFOR_UPI_ALLOW, phonePayPaymentTypeConfiguration != null && (boolean) phonePayPaymentTypeConfiguration.getOrDefault(PaymentTypePropertiesConstant.IS_GENERATE_QR_CODE_PHONE_PEFOR_UPI_ALLOW, false));
			valObjOut.put(PaymentTypePropertiesConstant.DEDUCT_PERCENT_AMOUNT, phonePayPaymentTypeConfiguration.getOrDefault(PaymentTypePropertiesConstant.DEDUCT_PERCENT_AMOUNT, 0.0));
			valObjOut.put(PaymentTypePropertiesConstant.IS_DEDUCT_CHARGES, phonePayPaymentTypeConfiguration.getOrDefault(PaymentTypePropertiesConstant.IS_DEDUCT_CHARGES, false ));
			valObjOut.put(PaymentTypePropertiesConstant.ALLOW_DYNAMIC_PHONEPE_QR_DELIVERY, phonePayPaymentTypeConfiguration.getOrDefault(PaymentTypePropertiesConstant.ALLOW_DYNAMIC_PHONEPE_QR_DELIVERY, false ));
			valObjOut.put(PaymentTypePropertiesConstant.ALLOW_TO_SEND_QR_ON_WHATSAPP, phonePayPaymentTypeConfiguration != null && (boolean) phonePayPaymentTypeConfiguration.getOrDefault(PaymentTypePropertiesConstant.ALLOW_TO_SEND_QR_ON_WHATSAPP, false));
			valObjOut.put(PaymentTypePropertiesConstant.ALLOW_TXN_DATE_TIME_PHONE_PE, phonePayPaymentTypeConfiguration.getOrDefault(PaymentTypePropertiesConstant.ALLOW_TXN_DATE_TIME_PHONE_PE, false));
			valObjOut.put(PaymentTypePropertiesConstant.ALLOW_STANDARD_CUSTOM_FLOW_PHONE_PE, phonePayPaymentTypeConfiguration != null && (boolean) phonePayPaymentTypeConfiguration.getOrDefault(PaymentTypePropertiesConstant.ALLOW_STANDARD_CUSTOM_FLOW_PHONE_PE, false));

			final var		paymentTypeVO	= new ValueObject();
			paymentTypeVO.put(com.iv.utils.constant.Constant.EXECUTIVE_ID, executive.getExecutiveId());
			paymentTypeVO.put(com.iv.utils.constant.Constant.ACCOUNT_GROUP_ID, executive.getAccountGroupId());
			paymentTypeVO.put(ModuleIdentifierConstant.MODULE_ID, ModuleIdentifierConstant.GENERATE_CR);
			paymentTypeVO.put("ExecutiveFeildPermission", Converter.hashMapWithDtoToHashMapConversion(execFldPermissions));
			paymentTypeVO.put(PaymentTypePropertiesConstant.VALIDATE_PHONEPE_TXN, validatePhonePeTxn);
			final var	paymentTypeArr		= PaymentTypeSelectionUtility.getModuleWisePermissionBasePaymentTypeSelection(paymentTypeVO);

			final var	idProofHM				= ReadAllConfigurationsBllImpl.getInstance().getConfigurationData(ModuleIdentifierConstant.ID_PROOF_CONFIGURATION, executive.getAccountGroupId(), ModuleIdentifierConstant.GENERATE_CR);
			final var	idProofConstantArr		= IDProofSelectionUtility.getModuleWiseIDProofSelection(idProofHM);

			final var	discountInPercent		= cache.getModuleWiseDiscountLimit(request, executive.getAccountGroupId(),
					ModuleWiseDiscountLimitConfigurationDTO.DELIVERY_DISCOUNT_LIMIT_ALLOW,
					ModuleWiseDiscountLimitConfigurationDTO.DELIVERY_DISCOUNT_LIMIT_IN_PERCENT);

			valObjOut.put("idProofConstantArr", Converter.arrayDtotoArrayListWithHashMapConversion(idProofConstantArr));
			valObjOut.put("IDProofConstant", IDProofConstant.getIDProofConstant());
			valObjOut.put(IDProofPropertiesConstant.ID_PROOF_ENTRY_ALLOW, idProofHM.getOrDefault(IDProofPropertiesConstant.ID_PROOF_ENTRY_ALLOW, false));
			valObjOut.put(IDProofPropertiesConstant.MAX_FILE_SIZE_TO_ALLOW, idProofHM.getOrDefault(IDProofPropertiesConstant.MAX_FILE_SIZE_TO_ALLOW, 1024));

			valObjOut.put("paymentTypeArr", Converter.arrayDtotoArrayListWithHashMapConversion(paymentTypeArr));
			valObjOut.put(ModuleIdentifierConstant.MODULE_ID, ModuleIdentifierConstant.GENERATE_CR);
			valObjOut.put(ModuleIdentifierConstant.INCOME_EXPENSE_MODULE_ID, ModuleIdentifierConstant.INCOME_TYPE_MODULE_ID);
			valObjOut.put(SendSMSPropertiesConstant.SEND_OTP_FOR_LR_DELIVERY, receivedSMSProperties.getOrDefault(SendSMSPropertiesConstant.SEND_OTP_FOR_LR_DELIVERY, false));
			valObjOut.put(GroupConfigurationPropertiesDTO.GROUP_CONFIGURATION, groupConfiguration);
			valObjOut.put(PodWayBillPropertiesConstant.POD_CONFIGURATION, cache.getPODWayBillConfiguration(request, executive.getAccountGroupId()));
			valObjOut.put("discountInPercent", discountInPercent);
			valObjOut.put(GeneralConfigurationPropertiesConstant.GENERAL_CONFIGURATION, generalConfiguration);
			valObjOut.put(GenerateCashReceiptDTO.WAY_BILL_TYPE_WISE_DISCOUNT_AMOUNT_ON_CHANGE_OF_CONSIGNEE_PARTY_RATE, wayBillTypeWiseDiscountAmountOnChangeOfConsigneePartyRate);
			valObjOut.put(TDSPropertiesConstant.TDS_CONFIGURATION, tdsConfiguration);
			valObjOut.put("GenerateAndValidateQROnUPIRechargePermission", execFldPermissions.get(FeildPermissionsConstant.GENERATE_AND_VALIDATE_QR_ON_UPI_RECHARGE) != null);
			valObjOut.put("showPatialDeliveryButton", execFldPermissions.get(FeildPermissionsConstant.ALLOW_PARTIAL_DELIVERY) != null);

			return JsonUtility.convertionToJsonObjectForResponse(valObjOut);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private JSONObject getWayBillData(final HttpServletRequest request, final JSONObject jsonObjectOut, final JSONObject jsonObjectIn) throws Exception {
		var							displayDataIfUndelivered	            = false;
		var 						shortCreditDeliveryLocking				= false;
		var 						completeDeliveryLocking					= false;
		Timestamp 					beforeTime								= null;

		try {
			final var	cache				= new CacheManip(request);
			final HashMap<?, ?>	execFldPermissions	= cache.getExecutiveFieldPermission(request);

			final var	valObjIn			= JsonUtility.convertJsontoValueObject(jsonObjectIn);
			var	valObjOut			= JsonUtility.convertJsontoValueObject(jsonObjectOut);

			final var	executive			= cache.getExecutive(request);
			final var	wayBillId			= valObjIn.getLong("WayBillId", 0);

			valObjIn.put(AliasNameConstants.EXECUTIVE, executive);
			valObjIn.put("branchesColl", cache.getGenericBranchesDetail(request));
			valObjIn.put("subregionColl", cache.getAllSubRegions(request));

			final var	crConfiguration							= cache.getGenerateCRConfiguration(request, executive.getAccountGroupId());
			final var	showReceivedLrDirectly					= PropertiesUtility.isAllow(crConfiguration.get(GenerateCashReceiptDTO.SHOW_RECEIVED_LR_DIRECTLY) + "");
			final var	showDeliveryCharges						= crConfiguration.getBoolean(GenerateCashReceiptDTO.SHOW_DELIVERY_CHARGES,false);
			final var	showDemurrageCalculation				= crConfiguration.getBoolean(GenerateCashReceiptDTO.SHOW_DEMURRAGE_CALCULATION,false);
			final var	disableDeliveryIfPaymentNotReceived		= crConfiguration.getBoolean(GenerateCashReceiptDTO.DISABLE_DELIVERY_IF_PAYMENT_NOT_RECEIVED, false);
			final var	shortCreditDeliveryLockingBeforeDays	= crConfiguration.getInt(GenerateCashReceiptDTO.SHORT_CREDIT_DELIVERY_LOCKING_BEFORE_DAYS, 0);
			final var	completeDeliveryLockingBeforeDays		= crConfiguration.getInt(GenerateCashReceiptDTO.COMPLETE_DELIVERY_LOCKING_BEFORE_DAYS, 0);
			final var	receivedSMSProperties					= SendSMSPropertyConfigBllImpl.getInstance().getSMSProperty(executive.getAccountGroupId(), ModuleIdentifierConstant.RECEIVE);
			final var 	sendOTPForLrDelivery					= (boolean) receivedSMSProperties.getOrDefault(SendSMSPropertiesConstant.SEND_OTP_FOR_LR_DELIVERY, false);

			valObjIn.put("articleTypeForGroup", cache.getArticleTypeForGroup(request, executive.getAccountGroupId()));
			valObjIn.put("packingTypeForGroup", cache.getPackingTypeForGroup(request, executive.getAccountGroupId()));

			final var	configValueForDelivery = cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_DELIVERY_ACCESSIBILITY);

			if(configValueForDelivery != 0)
				valObjIn.put("configValueForDelivery", configValueForDelivery);

			valObjIn.put("showbillCredit", cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_CREDIT_DELIVERY) == ConfigParam.CONFIG_KEY_CREDIT_DELIVERY_YES);
			valObjIn.put("execFldPermissions", execFldPermissions);

			valObjIn.put(com.iv.utils.constant.Constant.NO_OF_DAYS, cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.BACK_DATE_DELIVERY_LOCKING_DAYS));
			valObjIn.put("isPendingDeliveryTableEntry", cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_PENDING_DELIVERY_STOCK_TABLE_ENTRY) == ConfigParam.CONFIG_KEY_PENDING_DELIVERY_STOCK_TABLE_ENTRY_ALLOWED);

			final var configValueForReceive	= cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_RECEIVABLES_ACCESSIBILITY);

			final var	deliveryLocationList 		= cache.getAssignedLocationsIdListByLocationIdId(request, executive.getBranchId(), executive.getAccountGroupId());

			final var	minDateTimeStamp			= cache.getModuleWiseMinDateToGetData(request, executive.getAccountGroupId(),
					ModuleWiseMinDateSelectionConfigurationDTO.GENERATE_CR_MIN_DATE_ALLOW,
					ModuleWiseMinDateSelectionConfigurationDTO.GENERATE_CR_MIN_DATE);

			final var	displayDataConfig	= cache.getDisplayDataConfiguration(request, executive.getAccountGroupId());

			if(displayDataConfig != null)
				displayDataIfUndelivered = Utility.getBoolean(displayDataConfig.get(DisplayDataConfigurationDTO.DISPLAY_DATA_IF_UNDELIVERED));

			valObjIn.put(AliasNameConstants.MIN_DATE_TIMESTAMP, minDateTimeStamp);
			valObjIn.put("deliveryLocationList", deliveryLocationList);
			valObjIn.put(GeneralConfiguration.GENERAL_CONFIGURATION, cache.getGeneralConfiguration(request, executive.getAccountGroupId()));
			valObjIn.put(GenerateCashReceiptDTO.GENERATE_CASH_RECEIPT_CONFIGURATION, crConfiguration);
			valObjIn.put(LrViewConfigurationPropertiesConstant.LR_VIEW_CONFIGURATION_PROPERTY, cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.LR_SEARCH));
			valObjIn.put("configValueForReceive", configValueForReceive);
			valObjIn.put(com.iv.utils.constant.Constant.WAYBILL_ID, wayBillId);
			valObjIn.put("displayDataIfUndelivered", displayDataIfUndelivered);
			valObjIn.put("showDeliveryCharges", showDeliveryCharges);
			valObjIn.put("showDemurrageCalculation", showDemurrageCalculation);
			valObjIn.put(PodWayBillPropertiesConstant.POD_CONFIGURATION, cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.POD_WAYBILL));
			valObjIn.put(DisplayDataWithinDateRangePropertiesConstant.DISPLAY_DATA_CONFIGURATION_CONSTANT, cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.DISPLAY_DATA_CONFIGURATION));
			valObjIn.put(SendSMSPropertiesConstant.SEND_OTP_FOR_LR_DELIVERY, sendOTPForLrDelivery);

			final var	cashReceiptBLL	= new GenerateCashReceiptBLL();

			if(wayBillId > 0)
				valObjOut		= cashReceiptBLL.getDataForCashReceiptGeneration(valObjIn, valObjOut);
			else
				valObjOut		= cashReceiptBLL.getWayBillDetailsToGenereateCR(valObjIn, valObjOut);

			if(disableDeliveryIfPaymentNotReceived) {
				final var	consigneePartyId = valObjOut.getLong("ConsigneePartyMasterId",0);

				if(consigneePartyId > 0) {
					final var	creditWayBillTxn = new CreditWayBillTxn();

					creditWayBillTxn.setAccountGroupId(executive.getAccountGroupId());
					creditWayBillTxn.setPartyMasterId(consigneePartyId);
					creditWayBillTxn.setTxnTypeId(CreditWayBillTxn.TXN_TYPE_DELIVERY_ID);
					creditWayBillTxn.setWayBillStatus(WayBillStatusConstant.WAYBILL_STATUS_DELIVERED);

					final var	creditWayBillObj = CreditWayBillTxnDAO.getInstance().getDeliveredWaybillByConsigneePartyId(creditWayBillTxn);

					if(creditWayBillObj != null) {
						final var	currentTimeLong	 = DateTimeUtility.getCurrentTimeStamp().getTime();
						final var	creationDatetime = DateTimeUtility.getStartOfDayTimeStamp(DateTimeUtility.getDateFromTimeStamp(creditWayBillObj.getCreationDateTimeStamp()));

						if(shortCreditDeliveryLockingBeforeDays > 0) {
							beforeTime					= new Timestamp(currentTimeLong - DateTimeFormatConstant.MILLIS_IN_DAY * ((long) shortCreditDeliveryLockingBeforeDays + 1));
							beforeTime					= DateTimeUtility.getStartOfDayTimeStamp(DateTimeUtility.getDateFromTimeStamp(beforeTime));
							shortCreditDeliveryLocking  = creationDatetime.before(beforeTime);
						}

						if(completeDeliveryLockingBeforeDays > 0) {
							beforeTime					= new Timestamp(currentTimeLong - DateTimeFormatConstant.MILLIS_IN_DAY * ((long) completeDeliveryLockingBeforeDays + 1));
							beforeTime					= DateTimeUtility.getStartOfDayTimeStamp(DateTimeUtility.getDateFromTimeStamp(beforeTime));
							completeDeliveryLocking		= creationDatetime.before(beforeTime);
						}
					}
				}
			}

			if (valObjOut == null) {
				valObjOut	= new ValueObject();
				valObjOut.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.NO_RECORDS_DESCRIPTION);
			}


			valObjOut.put("showReceivedLrDirectly", showReceivedLrDirectly);
			valObjOut.put("showDeliveryCharges", showDeliveryCharges);
			valObjOut.put("showDemurrageCalculation", showDemurrageCalculation);
			valObjOut.put("shortCreditDeliveryLocking", shortCreditDeliveryLocking);
			valObjOut.put("completeDeliveryLocking", completeDeliveryLocking);
			valObjOut.put("configuration", crConfiguration);
			valObjOut.put(SendSMSPropertiesConstant.SEND_OTP_FOR_LR_DELIVERY, sendOTPForLrDelivery);

			return JsonUtility.convertionToJsonObjectForResponse(valObjOut);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private JSONObject generateCR(final HttpServletRequest request, final HttpServletResponse response, final JSONObject jsonObjectIn) throws Exception {
		try {
			final Long requestWayBillId	= jsonObjectIn.getLong(com.iv.utils.constant.Constant.WAYBILL_ID);

			if (request.getSession().getAttribute("generateCRWayBillId") != null)
				return new JSONObject().put(com.iv.utils.constant.Constant.SUCCESS, true);

			request.getSession().setAttribute("generateCRWayBillId", requestWayBillId);

			final var	cache						= new CacheManip(request);

			if(jsonObjectIn.get(com.iv.utils.constant.Constant.DELIVERED_TO_NAME) != null)
				jsonObjectIn.put(com.iv.utils.constant.Constant.DELIVERED_TO_NAME, Utility.convertHexToString((String) jsonObjectIn.get(com.iv.utils.constant.Constant.DELIVERED_TO_NAME)));

			if(jsonObjectIn.has(com.iv.utils.constant.Constant.RECEIVER_TO_NAME) && jsonObjectIn.get(com.iv.utils.constant.Constant.RECEIVER_TO_NAME) != null)
				jsonObjectIn.put(com.iv.utils.constant.Constant.RECEIVER_TO_NAME, Utility.convertHexToString((String) jsonObjectIn.get(com.iv.utils.constant.Constant.RECEIVER_TO_NAME)));

			if(jsonObjectIn.get(com.iv.utils.constant.Constant.DELIVERY_REMARK) != null)
				jsonObjectIn.put(com.iv.utils.constant.Constant.DELIVERY_REMARK, Utility.convertHexToString((String) jsonObjectIn.get(com.iv.utils.constant.Constant.DELIVERY_REMARK)));

			if(jsonObjectIn.has(com.iv.utils.constant.Constant.NAME) && jsonObjectIn.get(com.iv.utils.constant.Constant.NAME) != null)
				jsonObjectIn.put(com.iv.utils.constant.Constant.NAME, Utility.convertHexToString((String) jsonObjectIn.get(com.iv.utils.constant.Constant.NAME)));

			final var	valObjIn				= JsonUtility.convertJsontoValueObject(jsonObjectIn);
			final var	executive				= cache.getExecutive(request);
			final HashMap<?, ?>	execFldPermissions		= cache.getExecutiveFieldPermission(request);

			final var branchdata 			= cache.getBranchData(request, executive.getBranchId());
			final var configuration			= cache.getGenerateCRConfiguration(request, executive.getAccountGroupId());
			final var partyWiseLedgerConfig	= PropertyConfigValueBLLImpl.getInstance().getConfiguration(executive, PropertiesFileConstants.PARTY_WISE_LEDGER_ACCOUNTS_CONFIG);
			final var configMap 			= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.CREDITOR_INVOICE_PRINT);

			valObjIn.put(Executive.EXECUTIVE, executive);
			valObjIn.put("branchdata", branchdata);
			valObjIn.put(com.iv.utils.constant.Constant.NO_OF_DAYS, cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_MAX_DAYS_OF_OPERATION_BEFORE_CASHSTATEMENT_ENTRY_ID));
			valObjIn.put("duplicateManualSeq", cache.getConfigValue(request, executive.getAccountGroupId(),ConfigParam.CONFIG_KEY_DUPLICATE_MANUAL_AUTO_CR_SEQUENCE));
			valObjIn.put("deliveryCharge", cache.getActiveDeliveryCharges(request, executive.getBranchId()));
			valObjIn.put("Creditor_Payment_Module_Key", cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_CREDITOR_PAYMENT_MODULE));
			valObjIn.put("creditDelivery", cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_CREDIT_DELIVERY));
			valObjIn.put("configKeySTReport", cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_SERVICE_TAX_REPORT));
			valObjIn.put("configKeyPendingDeliveryTableEntry", cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_PENDING_DELIVERY_STOCK_TABLE_ENTRY));
			valObjIn.put("branchesColl", cache.getGenericBranchesDetail(request));
			valObjIn.put("cityColl", cache.getAllCitiesForGroupHM(request, executive.getAccountGroupId()));
			valObjIn.put("execFldPermissions", execFldPermissions);
			valObjIn.put(DocumentCodeConfigurationDTO.DOCUMENT_CODE_CONFIGURATION, cache.getDocumentCodeConfiguration(request, executive.getAccountGroupId()));

			valObjIn.put(WayBillTaxDetails.WAYBILL_TYPE_WISE_SERVICE_TAX_DATE, cache.wayBillTypeWiseServiceTaxDate(request, executive.getAccountGroupId()));
			valObjIn.put(AccountGroupTieUpConfiguration.ACCOUNT_GROUP_TIE_UP_CONFIGURATION_HM, cache.getAccountGroupTieUpConfiguration(request, executive.getAccountGroupId()));
			valObjIn.put(GeneralConfiguration.GENERAL_CONFIGURATION, cache.getGeneralConfiguration(request, executive.getAccountGroupId()));
			valObjIn.put(LrCostConfigurationDTO.LR_COST_CONFIGURATION, cache.getGroupWiseLRCostConfiguration(request, executive.getAccountGroupId()));
			valObjIn.put(GroupConfigurationPropertiesDTO.GROUP_CONFIGURATION, cache.getGroupConfiguration(request, executive.getAccountGroupId()));
			valObjIn.put(CashStatementConfigurationDTO.CASH_STATEMENT_CONFIGURATION, cache.getCashStatementConfiguration(request, executive.getAccountGroupId()));
			valObjIn.put(GenerateCashReceiptDTO.GENERATE_CASH_RECEIPT_CONFIGURATION, configuration);
			valObjIn.put(PodWayBillPropertiesConstant.POD_CONFIGURATION, cache.getPODWayBillConfiguration(request, executive.getAccountGroupId()));
			valObjIn.put("configValWBGTROffAllow", cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_WAYBILL_GRAND_TOTAL_ROUNDOFF));
			valObjIn.put(BankStatementConfigurationDTO.BANK_STATEMENT_CONFIGURATION, cache.getBankStatementConfiguration(request, executive.getAccountGroupId()));
			valObjIn.put(LHPVPropertiesConstant.LHPV_CONFIGURATION, cache.getLhpvConfiguration(request, executive.getAccountGroupId()));
			valObjIn.put(TransportListMaster.TRANSPORT_LIST, cache.getTransportList(request));
			valObjIn.put(PartyWiseLedgerAccountsDTO.PARTY_WISE_LEDGER_CONFIGURATION, partyWiseLedgerConfig);
			valObjIn.put("valObjPackingMaster", cache.getPackingTypeMasterData(request));
			valObjIn.put("loggedInBranch", cache.getExecutiveBranch(request, executive.getBranchId()));
			valObjIn.put(TaxModel.TAX_MODEL_ARR, cache.getTaxes(request, executive));
			valObjIn.put(DashBoardConfigurationDTO.DASH_BOARD_CONFIGURATION, cache.getDashBoardConfiguration(request, executive.getAccountGroupId()));
			valObjIn.put(CreditorInvoicePrintPropertiesConstant.OPEN_INVOICE_PRINT_POPUP_AFTER_BKG_DLY, configMap.getOrDefault(CreditorInvoicePrintPropertiesConstant.OPEN_INVOICE_PRINT_POPUP_AFTER_BKG_DLY, false));

			cache.getConfigurationData(request, executive.getAccountGroupId(), valObjIn);

			var	valObjOut	= GenerateCashReceiptBLL.getInstance().generateCashReceipt(valObjIn);

			if (valObjOut == null) {
				valObjOut	= new ValueObject();
				valObjOut.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.WAYBILL_NOT_FOUND_DESCRIPTION);
			}

			final var	lrViewConfiguration			= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.LR_SEARCH);

			//new code
			valObjIn.put(com.iv.utils.constant.Constant.CR_ID, valObjOut.get(com.iv.utils.constant.Constant.CR_ID));

			final var lCDateTime = Calendar.getInstance();

			// created cookie for disabled cr print link after 10 minutes
			var currentCookieTime	= lCDateTime.getTimeInMillis();
			currentCookieTime	-= 120000;
			var cookieLife = 480000;//  in milli seconds

			if((int) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.COOKIE_TIME_FOR_CRPRINT,0) > 0)
				cookieLife = (int) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.COOKIE_TIME_FOR_CRPRINT, 0);

			final var	expiryTime = cookieLife + currentCookieTime;

			final var cookie = new Cookie("CR_" + valObjOut.get(com.iv.utils.constant.Constant.WAYBILL_ID), Long.toString(currentCookieTime) + "_" + expiryTime);

			cookie.setMaxAge(60 * 30);
			response.addCookie(cookie);

			final var	dateFormatForTimeLog = new SimpleDateFormat("mm:ss");
			dateFormatForTimeLog.setTimeZone(TimeZone.getTimeZone("GMT"));

			final var object = JsonUtility.convertionToJsonObjectForResponse(valObjOut);

			request.getSession().removeAttribute("generateCRWayBillId");

			valObjIn.put(GenerateCashReceiptDTO.PHOTO_SERVICE_ON_DEPOSIT, configuration.getBoolean(GenerateCashReceiptDTO.PHOTO_SERVICE_ON_DEPOSIT));
			valObjIn.put(GenerateCashReceiptDTO.SIGNATURE_SERVICE_ON_DEPOSIT, configuration.getBoolean(GenerateCashReceiptDTO.SIGNATURE_SERVICE_ON_DEPOSIT));

			executeServiceProcess(valObjIn);

			return object;
		} catch (final Exception e) {
			request.getSession().removeAttribute("generateCRWayBillId");
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public void executeServiceProcess(final ValueObject valObjIn) throws Exception {
		try {
			final HashMap<?, ?>	execFldPermissions	= (HashMap<?, ?>) valObjIn.get("execFldPermissions");

			final var	photoObject		= new ValueObject();
			photoObject.put("image", valObjIn.get("image"));
			photoObject.put(Executive.EXECUTIVE, valObjIn.get(Executive.EXECUTIVE));
			photoObject.put(com.iv.utils.constant.Constant.CR_ID, valObjIn.get(com.iv.utils.constant.Constant.CR_ID));
			photoObject.put(GenerateCashReceiptDTO.PHOTO_SERVICE_ON_DEPOSIT, valObjIn.getBoolean(GenerateCashReceiptDTO.PHOTO_SERVICE_ON_DEPOSIT));

			if(execFldPermissions.get(FeildPermissionsConstant.ALLOW_PHOTO_SERVICE_ON_CR) != null) {
				photoObject.put(Constant.CLASS_NAME, PhotoServiceActor.getFullClassName());
				photoObject.put(Constant.METHOD_NAME, PhotoServiceActor.METHOD_NAME_PROCESS_PHOTO_SERVICE);
				Actor.run(photoObject);
			}

			final var	signatureObject		= new ValueObject();
			signatureObject.put("signature", valObjIn.get("signature"));
			signatureObject.put(Executive.EXECUTIVE, valObjIn.get(Executive.EXECUTIVE));
			signatureObject.put(com.iv.utils.constant.Constant.CR_ID, valObjIn.get(com.iv.utils.constant.Constant.CR_ID));
			signatureObject.put(GenerateCashReceiptDTO.SIGNATURE_SERVICE_ON_DEPOSIT, valObjIn.getBoolean(GenerateCashReceiptDTO.SIGNATURE_SERVICE_ON_DEPOSIT, false));

			if(execFldPermissions.get(FeildPermissionsConstant.ALLOW_SIGNATURE_SERVICE_ON_CR) != null) {
				signatureObject.put(Constant.CLASS_NAME, SignatureServiceActor.getFullClassName());
				signatureObject.put(Constant.METHOD_NAME, SignatureServiceActor.METHOD_NAME_PROCESS_SIGNATURE_SERVICE);
				Actor.run(signatureObject);
			}

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

			if(execFldPermissions != null) {
				if(execFldPermissions.get(FeildPermissionsConstant.ALLOW_PHOTO_SERVICE_ON_CR) != null) {
					valObjTemp.put("serviceId", Service.PHOTO_TRANSACTION);

					//photo service permission
					checkPermission   = ServicePermissionUtility.getServicePermission(valObjTemp);

					valObjOut.put("isPhotoTxnService", checkPermission != null);
				} else
					valObjOut.put("isPhotoTxnService", false);

				if(execFldPermissions.get(FeildPermissionsConstant.ALLOW_SIGNATURE_SERVICE_ON_CR) != null) {
					valObjTemp.put("serviceId", Service.SIGNATURE_TRANSACTION);

					//signature service permission
					checkPermission   = ServicePermissionUtility.getServicePermission(valObjTemp);

					valObjOut.put("isSignatureTxnService", checkPermission != null);
				} else
					valObjOut.put("isSignatureTxnService", false);
			}

			return valObjOut;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}
}