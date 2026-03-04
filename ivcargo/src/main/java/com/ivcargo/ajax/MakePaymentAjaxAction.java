
package com.ivcargo.ajax;

//~--- non-JDK imports --------------------------------------------------------

import java.io.PrintWriter;
import java.text.SimpleDateFormat;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONObject;

import com.businesslogic.BillClearanceBLL;
import com.businesslogic.properties.GeneralConfiguration;
import com.framework.Action;
import com.iv.bll.tds.impl.TDSTxnDetailsBllImpl;
import com.iv.bll.utils.PaymentTypeSelectionUtility;
import com.iv.constant.properties.GeneralConfigurationPropertiesConstant;
import com.iv.constant.properties.TDSPropertiesConstant;
import com.iv.constant.properties.invoice.BillPaymentConfigurationConstant;
import com.iv.convertor.JsonConvertor;
import com.iv.logsapp.LogWriter;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.constant.Constant;
import com.iv.utils.constant.MediaTypeConstant;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.exception.ExceptionProcess;
import com.ivcargo.utils.CacheManip;
import com.ivcargo.utils.JsonUtility;
import com.platform.dao.reports.CreditWayBillPaymentDAO;
import com.platform.dto.AliasNameConstants;
import com.platform.dto.ConfigParam;
import com.platform.dto.Executive;
import com.platform.dto.WayBillDetailsForGeneratingBill;
import com.platform.dto.configuration.discountlimit.ModuleWiseDiscountLimitConfigurationDTO;
import com.platform.dto.configuration.modules.BankStatementConfigurationDTO;
import com.platform.dto.configuration.modules.CashStatementConfigurationDTO;
import com.platform.dto.configuration.modules.GroupConfigurationPropertiesDTO;
import com.platform.dto.constant.FeildPermissionsConstant;
import com.platform.dto.constant.ModuleIdentifierConstant;
import com.platform.dto.tds.TDSTxnDetailsIdentifiers;
import com.platform.jsonconstant.JsonConstant;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Converter;
import com.platform.utils.TokenGenerator;
import com.platform.utils.Utility;

public class MakePaymentAjaxAction implements Action {

	public static final String TRACE_ID = MakePaymentAjaxAction.class.getName();

	SimpleDateFormat  			sdf										= null;
	boolean						bankPaymentOperationRequired			= false;
	boolean						chequeBounceRequired					= false;

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		PrintWriter						out							= null;
		JSONObject						jsonObjectIn				= null;
		JSONObject						jsonObjectOut				= null;
		short							filter						= 0;

		try {
			response.setContentType(MediaTypeConstant.APPLICATION_JSON_VALUE); // Setting response for JSON Content

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
				out.println(initializeLoadBillClearancePanel(request));
				break;
			}
			case 2: {
				out.println(createInvoiceBill(request, jsonObjectIn));
				break;
			}
			case 3: {
				out.println(getLRDetails(request, jsonObjectIn));
				break;
			}
			default: {
				jsonObjectOut.put("errorDescription", "Unknown Request");
				out.println(jsonObjectOut);
				break;
			}
			}

		} catch (final Exception _e) {
			LogWriter.writeLog(MakePaymentAjaxAction.TRACE_ID, LogWriter.LOG_LEVEL_ERROR,_e);
			try {
				jsonObjectOut			= new JSONObject();
				jsonObjectOut.put("errorCode", CargoErrorList.SYSTEM_ERROR);
				jsonObjectOut.put("errorDescription", CargoErrorList.SYSTEM_ERROR_DESCRIPTION);
			} catch (final Exception e) {
				LogWriter.writeLog(MakePaymentAjaxAction.TRACE_ID, LogWriter.LOG_LEVEL_ERROR, ""+e);
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

	/**
	 * Initilize Bill Code start
	 **/
	private JSONObject initializeLoadBillClearancePanel(final HttpServletRequest request) throws Exception {
		String						previousDate		= null;

		try {
			final var 	valObjOut 			= new ValueObject();
			final var 	cacheManip			= new CacheManip(request);

			final var 	executive 			= cacheManip.getExecutive(request);
			final var 	configuration		= cacheManip.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.BILL_PAYMENT);
			final var 	generalConfig		= cacheManip.getGeneralConfiguration(request, executive.getAccountGroupId());

			configuration.put(GeneralConfiguration.BANK_PAYMENT_OPERATION_REQUIRED, generalConfig.getBoolean(GeneralConfiguration.BANK_PAYMENT_OPERATION_REQUIRED));
			configuration.put(GeneralConfiguration.CHEQUE_BOUNCE_REQUIRED, generalConfig.getBoolean(GeneralConfiguration.CHEQUE_BOUNCE_REQUIRED));

			final HashMap<?, ?> execFldPermissions	= cacheManip.getExecutiveFieldPermission(request);

			final var allowBackDateEntryForBillPayment	= execFldPermissions != null && execFldPermissions.get(FeildPermissionsConstant.ALLOW_BACK_DATE_ENTRY_FOR_BILL_PAYMENT) != null;

			final int	noOfDays = cacheManip.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_MAX_DAYS_OF_OPERATION_BEFORE_CASHSTATEMENT_ENTRY_ID);

			if(allowBackDateEntryForBillPayment)
				previousDate	= DateTimeUtility.getDateBeforeNoOfDays(noOfDays);

			final var paymentTypeVO	= new ValueObject();

			paymentTypeVO.put(Constant.EXECUTIVE_ID, executive.getExecutiveId());
			paymentTypeVO.put(Constant.ACCOUNT_GROUP_ID, executive.getAccountGroupId());
			paymentTypeVO.put(ModuleIdentifierConstant.MODULE_ID, ModuleIdentifierConstant.BILL_PAYMENT);
			paymentTypeVO.put("ExecutiveFeildPermission", Converter.hashMapWithDtoToHashMapConversion(execFldPermissions));

			final var paymentTypeArr		= PaymentTypeSelectionUtility.getModuleWisePermissionBasePaymentTypeSelection(paymentTypeVO);

			final var tdsConfiguration = cacheManip.getTDSConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.BILL_PAYMENT);

			valObjOut.put(BillPaymentConfigurationConstant.BILL_PAYMENT_CONFIGURATION, configuration);
			valObjOut.put("paymentTypeArr", Converter.arrayDtotoArrayListWithHashMapConversion(paymentTypeArr));
			valObjOut.put(TDSPropertiesConstant.TDS_CONFIGURATION, tdsConfiguration);
			valObjOut.put("tdsChargeList", TDSTxnDetailsBllImpl.getTDSChargesList(tdsConfiguration));
			valObjOut.put("TDSTxnDetailsIdentifiers", TDSTxnDetailsIdentifiers.getTDSTxnDetailsIdentifiers());
			valObjOut.put("allowBackDateEntryForBillPayment", allowBackDateEntryForBillPayment);
			valObjOut.put("noOfDays", noOfDays);
			valObjOut.put("previousDate", previousDate);
			valObjOut.put(ModuleIdentifierConstant.MODULE_ID, ModuleIdentifierConstant.BILL_PAYMENT);
			valObjOut.put(ModuleIdentifierConstant.INCOME_EXPENSE_MODULE_ID, ModuleIdentifierConstant.INCOME_TYPE_MODULE_ID);
			valObjOut.put(GeneralConfigurationPropertiesConstant.GENERAL_CONFIGURATION, generalConfig);
			valObjOut.put("allowBillClearancePartialPayment", execFldPermissions != null && execFldPermissions.get(FeildPermissionsConstant.ALLOW_BILL_CLEARANCE_PARTIAL_PAYMENT) != null);
			valObjOut.put("allowBillClearanceNegotiatedPayment", execFldPermissions != null && execFldPermissions.get(FeildPermissionsConstant.ALLOW_BILL_CLEARANCE_NEGOTIATED_PAYMENT) != null);
			valObjOut.put("discountInPercent", cacheManip.getModuleWiseDiscountLimit(request, executive.getAccountGroupId(),
					ModuleWiseDiscountLimitConfigurationDTO.BILL_PAYMENT_DISCOUNT_LIMIT_ALLOW,
					ModuleWiseDiscountLimitConfigurationDTO.BILL_PAYMENT_DISCOUNT_LIMIT_IN_PERCENT));

			JsonConstant.getInstance().setOutputConstantForMultipleInvoice(valObjOut);

			return JsonUtility.convertionToJsonObjectForResponse(valObjOut);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	/**
	 * Create Bill Code start
	 * */
	public JSONObject createInvoiceBill(final HttpServletRequest request, final JSONObject jsonObjectIn) throws Exception {
		try {
			final var	valueObjectIn		= JsonUtility.convertJsontoValueObject(jsonObjectIn);
			final var	cacheManip			= new CacheManip(request);
			final var	executive 			= cacheManip.getExecutive(request);

			final var tokenWiseCheckingForDuplicateTransaction = valueObjectIn.getBoolean("tokenWiseCheckingForDuplicateTransaction",false);
			final var token = valueObjectIn.getString("tokenValue", null);

			valueObjectIn.put(Executive.EXECUTIVE, executive);
			valueObjectIn.put(CashStatementConfigurationDTO.CASH_STATEMENT_CONFIGURATION, cacheManip.getCashStatementConfiguration(request, executive.getAccountGroupId()));
			valueObjectIn.put(TDSPropertiesConstant.BILL_PAYMENT_TDS_PROPERTY, cacheManip.getTDSConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.BILL_PAYMENT));
			valueObjectIn.put("noOfDays", cacheManip.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_MAX_DAYS_OF_OPERATION_BEFORE_CASHSTATEMENT_ENTRY_ID));
			valueObjectIn.put("execFldPermissions", cacheManip.getExecutiveFieldPermission(request));
			valueObjectIn.put(GeneralConfiguration.GENERAL_CONFIGURATION, cacheManip.getGeneralConfiguration(request, executive.getAccountGroupId()));
			valueObjectIn.put(BankStatementConfigurationDTO.BANK_STATEMENT_CONFIGURATION, cacheManip.getBankStatementConfiguration(request, executive.getAccountGroupId()));
			valueObjectIn.put("billArray", JsonConvertor.toValueObjectFromJsonString(jsonObjectIn.getString("billArray")));
			valueObjectIn.put("onAccountDetailsArr", JsonConvertor.toValueObjectFromJsonString(jsonObjectIn.optString("onAccountDetailsArr", null)));
			valueObjectIn.put(GroupConfigurationPropertiesDTO.GROUP_CONFIGURATION, cacheManip.getGroupConfiguration(request, executive.getAccountGroupId()));

			if(tokenWiseCheckingForDuplicateTransaction) {
				if(token == null || !token.equals(request.getSession().getAttribute(TokenGenerator.INVOICE_PAYMENT_TOKEN_KEY))) {
					final var	jsobj	= new ValueObject();
					jsobj.put(CargoErrorList.ERROR_DESCRIPTION, "Data already submitted, Please wait. ");

					return JsonUtility.convertionToJsonObjectForResponse(jsobj);
				}

				request.getSession().setAttribute(TokenGenerator.INVOICE_PAYMENT_TOKEN_KEY, null);
			}

			final var	valueObjectOut	= BillClearanceBLL.getInstance().makePayment(valueObjectIn);

			return JsonUtility.convertionToJsonObjectForResponse(valueObjectOut);
		} catch(final Exception e ){
			throw ExceptionProcess.execute(e, MakePaymentAjaxAction.TRACE_ID);
		}
	}

	private JSONObject getLRDetails(final HttpServletRequest request, final JSONObject jsonObjectIn) throws Exception{
		try {
			final var	valueObjectIn			= JsonUtility.convertJsontoValueObject(jsonObjectIn);

			final var 	billId 				= Utility.getLong(valueObjectIn.get("billId"));
			final var	cache				= new CacheManip(request);
			final var	jsonObjectResult	= new JSONObject();

			final var	valueobject			= CreditWayBillPaymentDAO.getInstance().getPartialWayBillDetailsForViewBillSummary(billId);

			if(valueobject != null) {
				final var	billsJsonArray 	= new JSONArray();
				final var	bills 			= (WayBillDetailsForGeneratingBill[])valueobject.get("modelArr");

				for (final WayBillDetailsForGeneratingBill bill : bills) {
					var	branch	= cache.getGenericBranchDetailCache(request,bill.getSourceBranchId());

					bill.setSourceBranch(branch.getName());
					bill.setSourceSubRegionId(branch.getSubRegionId());
					bill.setSourceSubRegion(cache.getGenericSubRegionById(request, branch.getSubRegionId()).getName());

					branch	= cache.getGenericBranchDetailCache(request,bill.getDestinationBranchId());

					bill.setDestinationBranch(branch.getName());
					bill.setDestinationSubRegionId(branch.getSubRegionId());
					bill.setDestinationSubRegion(cache.getGenericSubRegionById(request, branch.getSubRegionId()).getName());

					billsJsonArray.put(new JSONObject(bill));
				}

				jsonObjectResult.put("billsJsonArray", billsJsonArray);
			} else
				LogWriter.writeLog(MakePaymentAjaxAction.TRACE_ID, LogWriter.LOG_LEVEL_ERROR, "Error : " );

			return jsonObjectResult;
		} catch(final Exception e ) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

}
