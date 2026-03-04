package com.ivcargo.reports.cashStatement;

import java.io.PrintWriter;
import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.ObjectUtils;
import org.json.JSONArray;
import org.json.JSONObject;

import com.framework.Action;
import com.iv.bll.impl.reports.collection.CashStatementReportBllImpl;
import com.iv.constant.properties.cashstatement.CashStatementPropertiesConstant;
import com.iv.dto.CashStatementTxn;
import com.iv.dto.constant.ExecutiveTypeConstant;
import com.iv.dto.constant.FeildPermissionsConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.dto.constant.PaymentTypeConstant;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.logsapp.LogWriter;
import com.iv.utils.Utility;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.constant.Constant;
import com.iv.utils.exception.ExceptionProcess;
import com.iv.utils.utility.CollectionUtility;
import com.iv.utils.utility.ListFilterUtility;
import com.iv.utils.utility.SortUtils;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.Branch;
import com.platform.dto.configuration.modules.CashStatementConfigurationDTO;
import com.platform.resource.CargoErrorList;
import com.platform.utils.PropertiesUtility;

public class CashStatementReportAjaxAction implements Action {

	private static final String TRACE_ID = "CashStatementReportAjaxAction";

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
			case 1 -> out.println(getCashStatementDetails(request, jsonObjectIn));
			default -> {
				jsonObjectOut.put("errorDescription", "Unknown Request");
				out.println(jsonObjectOut);
			}
			}

		} catch (final Exception _e) {
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

	private JSONObject getCashStatementDetails(final HttpServletRequest request,final JSONObject jsonObjectIn) throws Exception {
		var							isAccessDenied								= false;
		Branch						selectedBranch								= null;
		var							isFromDateOpenigBalanceExists				= false;

		try {
			final var	sdf					= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss.SSS");
			final var	fromDate			= new Timestamp(sdf.parse(jsonObjectIn.get(Constant.FROM_DATE) + " 00:00:00.000").getTime());
			final var	toDate				= new Timestamp(sdf.parse(jsonObjectIn.get(Constant.TO_DATE) + " 23:59:59.998").getTime());
			final var	cacheManip			= new CacheManip(request);
			final var	executive			= cacheManip.getExecutive(request);
			final var	branch				= cacheManip.getBranchById(request, executive.getAccountGroupId(), executive.getBranchId());
			final var	valueInObject		= new HashMap<>();
			final var	jsonObjectResult	= new JSONObject();
			final var	configuration		= cacheManip.getCashStatementConfiguration(request, executive.getAccountGroupId());
			final var	accountGroup		= cacheManip.getAccountGroupByAccountGroupId(request, executive.getAccountGroupId());
			final var cashStatementConfig	= cacheManip.getReportConfiguration(request, executive.getAccountGroupId(), ReportIdentifierConstant.CASH_STATEMENT_REPORT);
			final var	isAllowCashStatement					= PropertiesUtility.isAllow(configuration.get(CashStatementConfigurationDTO.DATA_FOR_CASH_STATEMENT)+"");
			var		isShowSeparateTablesForCashAndCashlessEntry			= (boolean) cashStatementConfig.getOrDefault(CashStatementPropertiesConstant.IS_SHOW_SEPARATE_TABLES_FOR_CASH_AND_CASHLESS_ENTRY, false);
			final var	showBankAccountNameAndNumber					= (boolean) cashStatementConfig.getOrDefault(CashStatementPropertiesConstant.SHOW_BANK_ACCOUNT_NAME_AND_NUMBER, false);
			final var	showBankAccountNumberAndDescription				= (boolean) cashStatementConfig.getOrDefault(CashStatementPropertiesConstant.SHOW_BANK_ACCOUNT_NUMBER_AND_DESCRIPTION, false);
			final var	showTestingModeMessage							= (boolean) cashStatementConfig.getOrDefault(CashStatementPropertiesConstant.SHOW_TESTING_MODE_MESSAGE, false);
			final var	isSearchDataForOwnBranchOnly					= (boolean) cashStatementConfig.getOrDefault(CashStatementPropertiesConstant.IS_SEARCH_DATA_FOR_OWN_BRANCH_ONLY, false);
			final var	execFldPermissionsHM 							= cacheManip.getExecutiveFieldPermission(request);
			final var 	isAllowToSearchAllBranchReportData				= execFldPermissionsHM != null && execFldPermissionsHM.containsKey(FeildPermissionsConstant.ALLOW_TO_SEARCH_ALL_BRANCH_REPORT_DATA);
			final var 	locationMappingList 							= cacheManip.getAssignedLocationsIdListByLocationIdId(request, executive.getBranchId(), executive.getAccountGroupId());
			final var 	showFundTransferReportLink						= (boolean) cashStatementConfig.getOrDefault(CashStatementPropertiesConstant.SHOW_FUND_TRANSFER_REPORT_LINK, false);
			final var	roundOffOpeningClosingBalance					= (boolean) cashStatementConfig.getOrDefault(CashStatementPropertiesConstant.ROUND_OFF_OPENING_CLOSING_BALANCE, false);

			var	subRegionId = jsonObjectIn.optLong("Area", 0);
			var	branchId 	= jsonObjectIn.optLong("Branch", 0);

			if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_SUBREGIONADMIN)
				subRegionId = executive.getSubRegionId();
			else if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_BRANCHADMIN || executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_EXECUTIVE) {
				subRegionId = executive.getSubRegionId();
				branchId 	= executive.getBranchId();
			}

			if(branchId > 0)
				selectedBranch = cacheManip.getBranchById(request, executive.getAccountGroupId(), branchId);

			if((boolean) cashStatementConfig.getOrDefault(CashStatementPropertiesConstant.BRANCH_AND_EXECUTIVE_WISE_REPORT_SEARCH, false)) {
				final var	branchIdsAndExecutiveIds  = (String) cashStatementConfig.getOrDefault(CashStatementPropertiesConstant.BRANCHIDS_AND_EXECUTIVEIDS_WISE_REPORT_SEARCH, "0_0:0");
				final var 	longHashMap			= CollectionUtility.getLongWithLongHashMapFromStringArray(branchIdsAndExecutiveIds, Constant.COMMA, Constant.COLON);

				if(longHashMap.containsKey(branchId)) {
					final var	executiveIdList = longHashMap.get(branchId);

					isAccessDenied = executiveIdList != null && !executiveIdList.contains(executive.getExecutiveId());
					jsonObjectResult.put("isAccessDenied", isAccessDenied);
				}
			}

			if(isAccessDenied)
				return jsonObjectResult;

			valueInObject.put(Constant.FROM_DATE, fromDate);
			valueInObject.put(Constant.TO_DATE, toDate);
			valueInObject.put(Constant.BRANCH_ID, branchId);
			valueInObject.put(Constant.ACCOUNT_GROUP_ID, executive.getAccountGroupId());
			valueInObject.put(CashStatementPropertiesConstant.CASH_STATEMENT_PROPERTY, cashStatementConfig);

			if((boolean) cashStatementConfig.getOrDefault(CashStatementPropertiesConstant.IS_SHOW_SEPARATE_TABLE_FOR_HEAD_OFFICE_ONLY, false)) {
				final var list = CollectionUtility.getLongListFromString((String) cashStatementConfig.getOrDefault(CashStatementPropertiesConstant.SUB_REGION_ID_TO_SHOW_CASH_AND_CASHLESS_TABLE, "0"));

				if(!list.contains(subRegionId))
					isShowSeparateTablesForCashAndCashlessEntry = false;
			}

			var	cashStatementTxns = CashStatementReportBllImpl.getInstance().getCashStatementOldReportDetails(valueInObject);

			if(ObjectUtils.isNotEmpty(cashStatementTxns) && isSearchDataForOwnBranchOnly && !isAllowToSearchAllBranchReportData)
				cashStatementTxns = ListFilterUtility.filterList(cashStatementTxns, element -> executive.getBranchId() == element.getBranchId()
				|| locationMappingList != null && locationMappingList.contains(element.getBranchId()));

			if(ObjectUtils.isNotEmpty(cashStatementTxns)) {
				if (roundOffOpeningClosingBalance)
					applyRoundingToOpeningAndClosingBalances(cashStatementTxns);

				List<CashStatementTxn>	cashStatementTxnList = new ArrayList<>();

				for (final CashStatementTxn cashStatementTxn2 : cashStatementTxns)
					if(cashStatementTxn2.getIdentifier() == CashStatementTxn.IDENTIFIER_FOR_OPENING_BALANCE) {
						if(!isFromDateOpenigBalanceExists && cashStatementTxn2.getTxnDateTime().equals(fromDate))
							isFromDateOpenigBalanceExists = true;

						if(!isFromDateOpenigBalanceExists) {
							final var	cashStatementTxn = (CashStatementTxn) cashStatementTxn2.clone();
							cashStatementTxn.setTxnDateTime(fromDate);
							cashStatementTxn.setTxnDateTimeString(DateTimeUtility.getDateFromTimeStamp(cashStatementTxn.getTxnDateTime()));
							cashStatementTxnList.add(cashStatementTxn);
							break;
						}
					}

				cashStatementTxnList.addAll(cashStatementTxns);

				if(isAllowCashStatement) {
					final var caStatementTxn = ListFilterUtility.findFirstItemOrNull(cashStatementTxnList, e -> e.getIdentifier() == CashStatementTxn.IDENTIFIER_FOR_OPENING_BALANCE
							|| e.getIdentifier() == CashStatementTxn.IDENTIFIER_FOR_CLOSING_BALANCE);

					if(caStatementTxn == null)
						cashStatementTxnList.addAll(CashStatementReportBllImpl.getInstance().getLastOpeningOrClosingBalance(branchId, fromDate, toDate, executive.getAccountGroupId()));
				}

				final var	billsJsonArray 				= new JSONArray();
				final var	cashEntriesJsonArray		= new JSONArray();
				final var	cashLessEntriesJsonArray 	= new JSONArray();

				cashStatementTxnList	= SortUtils.sortList(cashStatementTxnList, CashStatementTxn::getTxnDateTime);

				if (roundOffOpeningClosingBalance)
					applyRoundingToOpeningAndClosingBalances(cashStatementTxnList);

				for (final CashStatementTxn cashStatementTxn2 : cashStatementTxnList)
					if(isShowSeparateTablesForCashAndCashlessEntry) {
						if(isCashEntries(cashStatementTxn2))
							cashEntriesJsonArray.put(new JSONObject(cashStatementTxn2));
						else if(PaymentTypeConstant.getBankPaymentList().contains(cashStatementTxn2.getPaymentTypeId())
								|| cashStatementTxn2.getPaymentTypeId() == PaymentTypeConstant.PAYMENT_TYPE_LHPV_ADVANCE_CREDIT_ID
								|| cashStatementTxn2.getPaymentTypeId() == PaymentTypeConstant.PAYMENT_TYPE_EXPENSE_CREDIT_ID
								|| cashStatementTxn2.getPaymentTypeId() == PaymentTypeConstant.PAYMENT_TYPE_JOURNAL_ID
								) {
							setBankAccountNameNumberAndDescription(cashStatementTxn2, showBankAccountNameAndNumber, showBankAccountNumberAndDescription);
							cashLessEntriesJsonArray.put(new JSONObject(cashStatementTxn2));
						}
					} else {
						if(PaymentTypeConstant.getBankPaymentList().contains(cashStatementTxn2.getPaymentTypeId())
								|| cashStatementTxn2.getPaymentTypeId() == PaymentTypeConstant.PAYMENT_TYPE_LHPV_ADVANCE_CREDIT_ID
								|| cashStatementTxn2.getPaymentTypeId() == PaymentTypeConstant.PAYMENT_TYPE_EXPENSE_CREDIT_ID
								|| cashStatementTxn2.getPaymentTypeId() == PaymentTypeConstant.PAYMENT_TYPE_JOURNAL_ID)
							setBankAccountNameNumberAndDescription(cashStatementTxn2, showBankAccountNameAndNumber, showBankAccountNumberAndDescription);

						billsJsonArray.put(new JSONObject(cashStatementTxn2));
					}

				jsonObjectResult.put("billsJsonArray", billsJsonArray);
				jsonObjectResult.put("cashEntriesJsonArray", cashEntriesJsonArray);
				jsonObjectResult.put("cashLessEntriesJsonArray", cashLessEntriesJsonArray);
			} else if(isAllowCashStatement) {
				cashStatementTxns = CashStatementReportBllImpl.getInstance().getLastOpeningOrClosingBalance(branchId, fromDate, toDate, executive.getAccountGroupId());

				if(ObjectUtils.isNotEmpty(cashStatementTxns)) {
					if (roundOffOpeningClosingBalance)
						applyRoundingToOpeningAndClosingBalances(cashStatementTxns);

					final var	billsJsonArray 			= new JSONArray();
					final var	cashEntriesJsonArray	= new JSONArray();

					cashStatementTxns.forEach((final CashStatementTxn cashStatementTxn2) -> {
						billsJsonArray.put(new JSONObject(cashStatementTxn2));
						cashEntriesJsonArray.put(new JSONObject(cashStatementTxn2));
					});

					jsonObjectResult.put("billsJsonArray", billsJsonArray);
					jsonObjectResult.put("cashEntriesJsonArray", cashEntriesJsonArray);
				}
			}

			if(selectedBranch != null)
				jsonObjectResult.put("branchName", selectedBranch.getName());
			else
				jsonObjectResult.put("branchName", "--");

			jsonObjectResult.put("accountGroupNameForPrint", accountGroup.getDescription());
			jsonObjectResult.put("branchAddress", branch.getAddress());
			jsonObjectResult.put("branchPhoneNumber", branch.getPhoneNumber());
			jsonObjectResult.put(Constant.FROM_DATE, jsonObjectIn.get(Constant.FROM_DATE));
			jsonObjectResult.put(Constant.TO_DATE, jsonObjectIn.get(Constant.TO_DATE));
			jsonObjectResult.put(CashStatementPropertiesConstant.SHOW_TESTING_MODE_MESSAGE, showTestingModeMessage);
			jsonObjectResult.put(CashStatementPropertiesConstant.SHOW_FUND_TRANSFER_REPORT_LINK, showFundTransferReportLink);
			jsonObjectResult.put(CashStatementPropertiesConstant.IS_SHOW_SEPARATE_TABLES_FOR_CASH_AND_CASHLESS_ENTRY, isShowSeparateTablesForCashAndCashlessEntry);

			return jsonObjectResult;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private boolean isCashEntries(final CashStatementTxn cashStatementTxn2) {
		return cashStatementTxn2.getPaymentTypeId() == PaymentTypeConstant.PAYMENT_TYPE_CASH_ID || cashStatementTxn2.getPaymentTypeId() == PaymentTypeConstant.PAYMENT_TYPE_FUEL_CARD_ID
				|| cashStatementTxn2.getIdentifier() == CashStatementTxn.IDENTIFIER_FOR_OPENING_BALANCE
				|| cashStatementTxn2.getIdentifier() == CashStatementTxn.IDENTIFIER_FOR_CLOSING_BALANCE;
	}

	private boolean isIncomeExpense(final CashStatementTxn cashStatementTxn2) {
		return ModuleIdentifierConstant.expenseModuleList().contains(cashStatementTxn2.getModuleIdentifier()) && cashStatementTxn2.getCreditAmount() > 0
				|| ModuleIdentifierConstant.incomeModuleList().contains(cashStatementTxn2.getModuleIdentifier()) && cashStatementTxn2.getDebitAmount() > 0;
	}

	private void setBankAccountNameNumberAndDescription(final CashStatementTxn cashStatementTxn2, final boolean showBankAccountNameAndNumber, final boolean showBankAccountNumberAndDescription) {
		if(isIncomeExpense(cashStatementTxn2) || cashStatementTxn2.getBankAccountId() > 0)
			if(showBankAccountNameAndNumber)
				setBankNameAndNumber(cashStatementTxn2);
			else if(showBankAccountNumberAndDescription)
				setBankAccountNumberAndDescription(cashStatementTxn2);
	}

	private void setBankNameAndNumber(final CashStatementTxn cashStatementTxn2) {
		if(cashStatementTxn2.getOwnBankName() != null && cashStatementTxn2.getBankAccountNo() != null)
			cashStatementTxn2.setAccountName(cashStatementTxn2.getAccountName() + " (" + cashStatementTxn2.getOwnBankName() + " - " + cashStatementTxn2.getBankAccountNo() + ")");
		else if(cashStatementTxn2.getOwnBankName() != null)
			cashStatementTxn2.setAccountName(cashStatementTxn2.getAccountName() + " (" + cashStatementTxn2.getOwnBankName() + ")");
		else if(cashStatementTxn2.getBankAccountNo() != null)
			cashStatementTxn2.setAccountName(cashStatementTxn2.getAccountName() + " (" + cashStatementTxn2.getBankAccountNo() + ")");
	}

	private void setBankAccountNumberAndDescription(final CashStatementTxn cashStatementTxn2) {
		if(cashStatementTxn2.getBankAccountNo() != null && cashStatementTxn2.getBankAccountDescription() != null)
			cashStatementTxn2.setAccountName(cashStatementTxn2.getAccountName() + " - " + cashStatementTxn2.getBankAccountNo() + " (" + cashStatementTxn2.getBankAccountDescription() + ")");
		else if(cashStatementTxn2.getBankAccountNo() != null)
			cashStatementTxn2.setAccountName(cashStatementTxn2.getAccountName() + " (" + cashStatementTxn2.getBankAccountNo() + ")");
	}

	private void applyRoundingToOpeningAndClosingBalances(List<CashStatementTxn> txns) {
		if (txns == null) return;

		txns.stream()
		.filter(txn -> txn.getIdentifier() == CashStatementTxn.IDENTIFIER_FOR_OPENING_BALANCE
		|| txn.getIdentifier() == CashStatementTxn.IDENTIFIER_FOR_CLOSING_BALANCE)
		.forEach(txn -> {
			txn.setDebitAmount(Math.round(txn.getDebitAmount()));
			txn.setCreditAmount(Math.round(txn.getCreditAmount()));
		});
	}

}
