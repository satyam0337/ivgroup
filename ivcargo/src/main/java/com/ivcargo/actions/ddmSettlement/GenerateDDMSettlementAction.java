package com.ivcargo.actions.ddmSettlement;

import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringUtils;
import org.json.JSONObject;

import com.businesslogic.ddmSettlement.DDMSettlementBLL;
import com.businesslogic.properties.GeneralConfiguration;
import com.businesslogic.properties.impl.PropertyConfigValueBLLImpl;
import com.framework.Action;
import com.iv.constant.properties.DDMConfigurationConstant;
import com.iv.constant.properties.DDMSettlementPropertiesConstant;
import com.iv.constant.properties.lhpv.LHPVPropertiesConstant;
import com.iv.dto.TransportListMaster;
import com.iv.dto.constant.PaymentTypeConstant;
import com.iv.dto.master.TaxModel;
import com.iv.utils.constant.Constant;
import com.iv.utils.constant.PodWayBillPropertiesConstant;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.exception.ExceptionProcess;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.actions.ConfigParamAction;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.AccountGroupTieUpConfiguration;
import com.platform.dto.AliasNameConstants;
import com.platform.dto.ConfigParam;
import com.platform.dto.PropertiesFileConstants;
import com.platform.dto.WayBillTaxDetails;
import com.platform.dto.configuration.modules.BankStatementConfigurationDTO;
import com.platform.dto.configuration.modules.CashStatementConfigurationDTO;
import com.platform.dto.configuration.modules.GenerateCashReceiptDTO;
import com.platform.dto.configuration.modules.GroupConfigurationPropertiesDTO;
import com.platform.dto.configuration.modules.LrCostConfigurationDTO;
import com.platform.dto.constant.ModuleIdentifierConstant;
import com.platform.resource.CargoErrorList;
import com.platform.utils.TokenGenerator;
import com.platform.utils.Utility;

public class GenerateDDMSettlementAction implements Action {

	public static final String TRACE_ID = "GenerateDDMSettlementAction";

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	 		error 								= null;
		PrintWriter						out									= null;
		JSONObject						jsonObjectIn						= null;
		JSONObject						jsonObjectOut						= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeDDMSettlementAction().execute(request, response);

			response.setContentType("application/json"); // Setting response for JSON Content

			out					= response.getWriter();
			jsonObjectOut		= new JSONObject();

			if(request.getParameter("json") == null) {
				jsonObjectOut.put(AliasNameConstants.ERROR_DESCRIPTION, "Requested data not found !");
				out.println(jsonObjectOut);
				return;
			}

			jsonObjectIn		= new JSONObject(request.getParameter("json"));

			if(request.getSession().getAttribute("executive") == null) {
				jsonObjectOut.put(AliasNameConstants.ERROR_DESCRIPTION, "You have been logged out. Please login again.");
				out.println(jsonObjectOut);
				return;
			}

			final var	cache						= new CacheManip(request);
			final var	executive					= cache.getExecutive(request);
			final var	ddmSettlementConfig			= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.DDM_SETTLEMENT);
			final var	ddmConfig					= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.CREATE_DDM);
			final var	valObj						= new ValueObject();
			final var	isServiceTax				= (boolean) ddmSettlementConfig.getOrDefault(DDMSettlementPropertiesConstant.IS_SERVICE_TAX_PAID_BY_SHOW, false);
			final var	bankStatementConfig			= cache.getBankStatementConfiguration(request, executive.getAccountGroupId());
			final var	token						= jsonObjectIn.getString("token");
			final var 	tokenWiseCheckingForDuplicateTransaction	= (boolean) ddmSettlementConfig.getOrDefault(DDMSettlementPropertiesConstant.TOKEN_WISE_CHECKING_FOR_DUPLICATE_TRANSACTION, false);

			if(tokenWiseCheckingForDuplicateTransaction) {
				if(token == null || !token.equals(request.getSession().getAttribute(TokenGenerator.DDM_SETTLEMENT_KEY))) {
					error.put("errorCode", CargoErrorList.RECEIVE_ERROR);
					jsonObjectOut.put(AliasNameConstants.ERROR_DESCRIPTION, "Request already submitted, please wait!");
					out.println(jsonObjectOut);
					request.setAttribute("cargoError", error);
					request.setAttribute("nextPageToken", "failure");
					return;
				}

				request.getSession().setAttribute(TokenGenerator.DDM_SETTLEMENT_KEY, null);
			}

			bankStatementConfig.put(BankStatementConfigurationDTO.ACCOUNT_NAME, bankStatementConfig.getString(BankStatementConfigurationDTO.DATA_FOR_DDM_SETTLEMENT));
			ddmSettlementConfig.put(DDMConfigurationConstant.WAY_BILL_TYPE_WISE_CR_NO_GENERATION_NEEDED, ddmConfig.getOrDefault(DDMConfigurationConstant.WAY_BILL_TYPE_WISE_CR_NO_GENERATION_NEEDED, false));
			ddmSettlementConfig.put(DDMConfigurationConstant.WAYBILL_TYPE_IDS_FOR_CR_NO_GENERATION, ddmConfig.getOrDefault(DDMConfigurationConstant.WAYBILL_TYPE_IDS_FOR_CR_NO_GENERATION, "0"));
			ddmSettlementConfig.put(DDMConfigurationConstant.ALLOW_DDM_CREATION_AFTER_ALL_DDM_SETTLED, ddmConfig.getOrDefault(DDMConfigurationConstant.ALLOW_DDM_CREATION_AFTER_ALL_DDM_SETTLED, false));

			valObj.put(AliasNameConstants.EXECUTIVE, executive);
			valObj.put(AliasNameConstants.ALL_GROUP_BRANCHES, cache.getAllGroupBranches(request, executive.getAccountGroupId()));
			valObj.put(AliasNameConstants.ACTIVE_DELIVERY_CHARGES, cache.getActiveDeliveryCharges(request, executive.getBranchId()));
			valObj.put(AliasNameConstants.EXECUTIVE_PERMISSIONS, cache.getExecutiveFieldPermission(request));
			valObj.put(AliasNameConstants.IS_PENDING_DELIVERY_TABLE_ENTRY, ConfigParamAction.isPendingDelStockTblEntryAllow(request, cache, executive));
			valObj.put(AliasNameConstants.CREDITOR_PAYMENT_MODULE_KEY, cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_CREDITOR_PAYMENT_MODULE));
			valObj.put(AliasNameConstants.IS_SERVICE_TAX_REPORT, ConfigParamAction.isServiceTaxReportAllow(request, cache, executive));
			valObj.put(AliasNameConstants.REQUEST_DATA, convertJSONData(jsonObjectIn, isServiceTax));
			valObj.put("branchesColl", cache.getGenericBranchesDetail(request));
			valObj.put(WayBillTaxDetails.WAYBILL_TYPE_WISE_SERVICE_TAX_DATE, cache.wayBillTypeWiseServiceTaxDate(request, executive.getAccountGroupId()));
			valObj.put(AccountGroupTieUpConfiguration.ACCOUNT_GROUP_TIE_UP_CONFIGURATION_HM, cache.getAccountGroupTieUpConfiguration(request, executive.getAccountGroupId()));
			valObj.put(GeneralConfiguration.GENERAL_CONFIGURATION, cache.getGeneralConfiguration(request, executive.getAccountGroupId()));
			valObj.put(LrCostConfigurationDTO.LR_COST_CONFIGURATION, cache.getGroupWiseLRCostConfiguration(request, executive.getAccountGroupId()));
			valObj.put(GroupConfigurationPropertiesDTO.GROUP_CONFIGURATION, cache.getGroupConfiguration(request, executive.getAccountGroupId()));
			valObj.put(CashStatementConfigurationDTO.CASH_STATEMENT_CONFIGURATION, cache.getCashStatementConfiguration(request, executive.getAccountGroupId()));
			valObj.put(PodWayBillPropertiesConstant.POD_CONFIGURATION, cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.POD_WAYBILL));
			valObj.put(DDMSettlementPropertiesConstant.DDM_SETTLEMENT_CONFIG, ddmSettlementConfig);
			valObj.put(BankStatementConfigurationDTO.BANK_STATEMENT_CONFIGURATION, bankStatementConfig);
			valObj.put(LHPVPropertiesConstant.LHPV_CONFIGURATION, cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.LHPV));
			valObj.put(GenerateCashReceiptDTO.GENERATE_CASH_RECEIPT_CONFIGURATION, cache.getGenerateCRConfiguration(request, executive.getAccountGroupId()));
			valObj.put(TransportListMaster.TRANSPORT_LIST, cache.getTransportList(request));
			valObj.put("partyWiseLedgerConfig", PropertyConfigValueBLLImpl.getInstance().getConfiguration(executive, PropertiesFileConstants.PARTY_WISE_LEDGER_ACCOUNTS_CONFIG));
			valObj.put(TaxModel.TAX_MODEL_ARR, cache.getTaxes(request, executive));
			valObj.put("configValWBGTROffAllow", cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_WAYBILL_GRAND_TOTAL_ROUNDOFF));

			final var	valOutObj 			= DDMSettlementBLL.getInstance().makeDDMSettlement(valObj);

			if(valOutObj == null) {
				jsonObjectOut.put(AliasNameConstants.ERROR_DESCRIPTION, CargoErrorList.NO_RECORDS_DESCRIPTION);
				out.println(jsonObjectOut);
				return;
			}

			if(valOutObj != null && valOutObj.containsKey(AliasNameConstants.ERROR_DESCRIPTION)) {
				jsonObjectOut.put(AliasNameConstants.ERROR_DESCRIPTION, valOutObj.get(AliasNameConstants.ERROR_DESCRIPTION));
				out.println(jsonObjectOut);
				return;
			}

			jsonObjectOut.put(AliasNameConstants.DELIVERY_RUN_SHEET_LEDGER_ID, valOutObj.get(AliasNameConstants.DELIVERY_RUN_SHEET_LEDGER_ID));
			jsonObjectOut.put("deliveryContactDetailsId", valOutObj.getLong("deliveryContactDetailsId", 0));
			jsonObjectOut.put(ModuleIdentifierConstant.MODULE_ID, valOutObj.getLong(ModuleIdentifierConstant.MODULE_ID, 0));
			jsonObjectOut.put("mrNumber", valOutObj.getString("mrNumber", null));

			out.println(jsonObjectOut);
		} catch (final Exception e) {
			ActionStepsUtil.catchJSONException(jsonObjectOut,out);
			if(out != null) out.println(jsonObjectOut);
			ActionStepsUtil.catchActionException(request, e, error);
		} finally {
			if (out != null) {
				out.flush();
				out.close();
			}
		}
	}

	private ValueObject convertJSONData(final JSONObject jsonObject, final boolean isServiceTax) throws Exception {
		try {
			if(jsonObject == null || jsonObject.length() <= 0)
				return null;

			final var	valObj	= new ValueObject();
			final var	wbIdsAL	= new ArrayList<Long>();

			final var keys 		= jsonObject.keys();

			while(keys.hasNext()) {
				final var	key = keys.next();

				try { // for json object inside json object

					final var	wbWiseObject 	= jsonObject.getJSONObject(key);

					getWBWiseDetails(wbWiseObject, valObj, wbIdsAL, isServiceTax);
				} catch(final Exception e) { // for String value inside json object ex. deliveryrunsheetledgerid etc..
					valObj.put(key, jsonObject.get(key).toString());
				}
			}

			valObj.put(AliasNameConstants.WAYBILL_IDS, wbIdsAL);

			return valObj;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public void getWBWiseDetails(final JSONObject wbWiseObject, final ValueObject valObj, final ArrayList<Long> wbIdsAL, final boolean isServiceTax) throws Exception {
		try {
			if(wbWiseObject != null && wbWiseObject.length() > 0) {
				final var	wbWisekeys	= wbWiseObject.keys();

				while (wbWisekeys.hasNext()) {
					final var	wbId 		= wbWisekeys.next();
					final var	wbJsonObj	= wbWiseObject.getJSONObject(wbId);

					wbIdsAL.add(Long.parseLong(wbId));

					valObj.put("deliveryPaymentType_" + wbId, wbJsonObj.optInt("deliveryPaymentType", PaymentTypeConstant.PAYMENT_TYPE_CASH_ID));
					valObj.put("crNumber_" + wbId, wbJsonObj.optString("crNumber", null));
					valObj.put("deliveredToName_" + wbId, wbJsonObj.optString("deliveredToName", null));
					valObj.put("deliveredToPhoneNo_" + wbId, wbJsonObj.optString("deliveredToPhoneNo", null));
					valObj.put("deliveryContactDetailsId_" + wbId, wbJsonObj.optLong("deliveryContactDetailsId", 0));
					valObj.put("chequeDate_" + wbId, wbJsonObj.optString("chequeDate", null));
					valObj.put("chequeNo_" + wbId, wbJsonObj.optString("chequeNo", null));
					valObj.put("chequeAmount_" + wbId, wbJsonObj.optDouble("chequeAmount", 0));
					valObj.put("bankName_" + wbId, wbJsonObj.optString("bankName", null));
					valObj.put("selectedDeliveryCreditorId_" + wbId, wbJsonObj.optLong("selectedDeliveryCreditorId", 0));
					valObj.put("commissionAmt_" + wbId, wbJsonObj.optDouble("commissionAmt", 0.0));
					valObj.put("selectedCollectionPersonId_" + wbId, wbJsonObj.optLong("selectedCollectionPersonId", 0));
					valObj.put("recoveryBranchId_" + wbId, wbJsonObj.optLong(Constant.RECOVERY_BRANCH_ID, 0));
					valObj.put("manualCRNo_" + wbId, wbJsonObj.optString("manualCRNo", null));

					if(wbJsonObj.has("discount")) {
						valObj.put("discount_" + wbId, wbJsonObj.optDouble("discount", 0));
						valObj.put("discountTypes_" + wbId, wbJsonObj.get("discountTypes").toString());
					}

					valObj.put("podStatus_" + wbId, wbJsonObj.optInt("podStatus", 0));
					valObj.put("podDocType_" + wbId, wbJsonObj.optInt("podDocType", 0));
					valObj.put("remark_" + wbId, wbJsonObj.optString("remark", null));
					valObj.put("createDate_" + wbId, wbJsonObj.optString("createDate", null));
					valObj.put("paidLoading_" + wbId, wbJsonObj.get("paidLoading").toString());
					valObj.put("consignorId_" + wbId, wbJsonObj.get("consignorId").toString());
					valObj.put("wayBillNumber_" + wbId, wbJsonObj.get("wayBillNumber").toString());
					valObj.put("receiverName_" + wbId, wbJsonObj.optString("receiverName", null));
					valObj.put("isStbsCreationAllow_" + wbId, wbJsonObj.optBoolean("isStbsCreationAllow", false));
					valObj.put("createTime_" + wbId, wbJsonObj.optString("createTime", null));

					if(isServiceTax) {
						valObj.put("taxBy_" + wbId, wbJsonObj.get("taxBy").toString());
						valObj.put("STPaidBy_" + wbId, wbJsonObj.get("stPaidBy").toString());

						final var	taxesArr	= wbJsonObj.getJSONArray("Taxes");

						if(taxesArr != null && taxesArr.length() > 0)
							for(var i = 0; i < taxesArr.length(); i++) {
								final var	taxObj		= taxesArr.getJSONObject(i);

								final var taxMasterId	= taxObj.optLong("taxMasterId", 0);

								valObj.put("tax_" + taxMasterId + "_" + wbId, Utility.getDouble(taxObj.get("taxValue")));
								valObj.put("unAddedST_" + taxMasterId + "_" + wbId, Utility.getDouble(taxObj.get("unAddedST")));
								valObj.put("actualTax_" + taxMasterId + "_" + wbId, Utility.getDouble(taxObj.get("actualTax")));
								valObj.put("calculateSTOnAmount_" + taxMasterId + "_" + wbId, Utility.getDouble(taxObj.get("calculateSTOnAmount")));
							}
					}

					if(wbJsonObj.optDouble("tdsAmount", 0) > 0) {
						valObj.put("tdsAmount_" + wbId, wbJsonObj.optDouble("tdsAmount", 0));
						valObj.put("tdsOnAmount_" + wbId, wbJsonObj.optDouble("tdsOnAmount", 0));
						valObj.put("panNumber_" + wbId, wbJsonObj.optString("panNumber", null));
					}

					final var	wbChargesObj		= (JSONObject) wbJsonObj.get("wbCharges");

					valObj.put("wbCharges_" + wbId, getWBCharges(wbChargesObj));
				}
			}
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public HashMap<Long, Double> getWBCharges(final JSONObject wbChargesObj) throws Exception {
		try {
			if(wbChargesObj == null || wbChargesObj.length() <= 0)
				return null;

			final var	chargeIds			= wbChargesObj.keys();
			final var	wbChargeIdWiseAmt	= new HashMap<Long, Double>();

			while (chargeIds.hasNext()) {
				final var	chargeId = chargeIds.next();

				final var	chargeAmount =  wbChargesObj.optDouble(chargeId, 0);

				wbChargeIdWiseAmt.put(Long.parseLong(StringUtils.trim(chargeId.split("_")[1])), chargeAmount);
			}

			return wbChargeIdWiseAmt;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}
}