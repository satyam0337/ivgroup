
package com.ivcargo.actions;

//~--- non-JDK imports --------------------------------------------------------

import java.io.PrintWriter;
import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.StringJoiner;
import java.util.function.Function;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringUtils;
import org.json.JSONArray;
import org.json.JSONObject;

import com.businesslogic.BillClearanceBLL;
import com.businesslogic.properties.GeneralConfiguration;
import com.framework.Action;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.constant.properties.invoice.BillPaymentConfigurationConstant;
import com.iv.dto.constant.TaxMasterConstant;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.constant.Constant;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.exception.ExceptionProcess;
import com.iv.utils.utility.CollectionUtility;
import com.iv.utils.utility.ListFilterUtility;
import com.iv.utils.utility.SortUtils;
import com.iv.utils.utility.SplitLRNumber;
import com.ivcargo.utils.CacheManip;
import com.ivcargo.utils.JsonUtility;
import com.platform.dao.CollectionPersonMasterDao;
import com.platform.dao.CorporateAccountDao;
import com.platform.dao.reports.BillClearanceDAO;
import com.platform.dao.reports.BillDAO;
import com.platform.dto.AliasNameConstants;
import com.platform.dto.BillClearance;
import com.platform.dto.BillDetailsForBillClearance;
import com.platform.dto.CollectionPersonMaster;
import com.platform.dto.CorporateAccount;
import com.platform.dto.Executive;
import com.platform.dto.configuration.mindateselection.ModuleWiseMinDateSelectionConfigurationDTO;
import com.platform.dto.configuration.modules.GroupConfigurationPropertiesDTO;
import com.platform.dto.constant.BillClearanceStatusConstant;
import com.platform.dto.constant.BillTypeConstant;
import com.platform.dto.constant.FeildPermissionsConstant;
import com.platform.dto.constant.ModuleIdentifierConstant;
import com.platform.jsonconstant.JsonConstant;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

public class BillClearanceAjaxAction implements Action {

	public static final String TRACE_ID = "BillClearanceAjaxAction";

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
			case 1 -> out.println(initilizeLoadBillClearanceConfig(request));
			case 2 -> out.println(loadBillClearance(request, jsonObjectIn));
			default -> {
				jsonObjectOut.put("errorDescription", "Unknown Request");
				out.println(jsonObjectOut);
			}
			}

		} catch (final Exception _e) {
			ExceptionProcess.execute(_e, TRACE_ID);
			try {
				jsonObjectOut			= new JSONObject();
				jsonObjectOut.put("errorCode", CargoErrorList.SYSTEM_ERROR);
				jsonObjectOut.put("errorDescription", CargoErrorList.SYSTEM_ERROR_DESCRIPTION);
			} catch (final Exception e) {
				ExceptionProcess.execute(e, TRACE_ID);
			}
		} finally {
			if(out != null) out.flush();
			if(out != null) out.close();
		}
	}

	private JSONObject initilizeLoadBillClearanceConfig(final HttpServletRequest request) throws Exception {
		try {
			final var 	billClearanceBLL 	= new BillClearanceBLL();
			final var 	valObjIn 			= new ValueObject();
			final var 	cManip				= new CacheManip(request);

			final var 	executive			= cManip.getExecutive(request);
			final var	branchIds			= cManip.getBranchIdsByExecutiveType(request, executive);
			final var 	accountGroup		= cManip.getAccountGroupById(request, executive.getAccountGroupId());
			final HashMap<?, ?> 		execFldPermissions	= cManip.getExecutiveFieldPermission(request);
			final var 	generalConfiguration= cManip.getGeneralConfiguration(request, executive.getAccountGroupId());
			final var	configuration		= ReadAllConfigurationsBllImpl.getInstance().getConfigurationData(ModuleIdentifierConstant.BILL_PAYMENT, executive.getAccountGroupId());

			valObjIn.put(AliasNameConstants.BRANCH_IDS, branchIds);
			valObjIn.put(AliasNameConstants.EXECUTIVE, executive);

			valObjIn.put(GroupConfigurationPropertiesDTO.GROUP_CONFIGURATION, cManip.getGroupConfiguration(request, executive.getAccountGroupId()));
			valObjIn.put(AliasNameConstants.ALL_REGIONS, cManip.getAllRegions(request));
			valObjIn.put(AliasNameConstants.ALL_SUB_REGIONS, cManip.getAllSubRegions(request));
			valObjIn.put(AliasNameConstants.ALL_BRANCHES, cManip.getGenericBranchesDetail(request));
			valObjIn.put(BillPaymentConfigurationConstant.BILL_PAYMENT_CONFIGURATION, configuration);
			valObjIn.put(AliasNameConstants.ACCOUNT_GROUP, accountGroup);

			final var jsobj = billClearanceBLL.initializeNewClearance(valObjIn);

			JsonConstant.getInstance().setOutputConstantForMultipleInvoice(jsobj);
			jsobj.put(BillPaymentConfigurationConstant.BILL_PAYMENT_CONFIGURATION, configuration);
			jsobj.put("allowChequeBouncePayment", execFldPermissions != null && execFldPermissions.get(FeildPermissionsConstant.ALLOW_CHEQUE_BOUNCE_PAYMENT) != null);
			jsobj.put("executive", executive);
			jsobj.put(GeneralConfiguration.CHEQUE_BOUNCE_REQUIRED, generalConfiguration.getBoolean(GeneralConfiguration.CHEQUE_BOUNCE_REQUIRED, false));
			jsobj.put(Constant.IVCARGO_VIDEOS, cManip.getModuleWiseVideos(request, ModuleIdentifierConstant.BILL_PAYMENT));

			return JsonUtility.convertionToJsonObjectForResponse(jsobj);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private JSONObject loadBillClearance(final HttpServletRequest request, final JSONObject jsonObjectIn) throws Exception {
		List<BillDetailsForBillClearance>		suppBills		 			= null;
		Map<Long, BillClearance>				billClearanceDetails		= null;
		Map<Long, CollectionPersonMaster>		collPersonHM				= null;
		Map<Long, CorporateAccount>				corpAccColl					= null;

		try {
			final var	cManip				= new CacheManip(request);
			final var 	jsonObjectResult	= new JSONObject();
			final var	executive			= cManip.getExecutive(request);
			final var	branchIds			= cManip.getBranchIdsByExecutiveType(request, executive);
			final short typeOfSelection		= Utility.getShort(jsonObjectIn.optString("typeOfSelection", "0"));
			final var	systemDate			= Utility.getCurrentDateTime();

			final var minDateTimeStamp	= cManip.getModuleWiseMinDateToGetData(request, executive.getAccountGroupId(),
					ModuleWiseMinDateSelectionConfigurationDTO.MULTIPLE_INVOICE_PAYMENT_MIN_DATE_ALLOW,
					ModuleWiseMinDateSelectionConfigurationDTO.MULTIPLE_INVOICE_PAYMENT_MIN_DATE);

			if(typeOfSelection == 0) {
				jsonObjectResult.put(CargoErrorList.ERROR_DESCRIPTION, "Selection not found, Please Clear Browser History and Check again !");
				return jsonObjectResult;
			}

			final var 	configuration	= ReadAllConfigurationsBllImpl.getInstance().getConfigurationData(ModuleIdentifierConstant.BILL_PAYMENT, executive.getAccountGroupId());
			final var	bills			= BillDAO.getInstance().getBillClearanceData(queryString(typeOfSelection, jsonObjectIn, branchIds, minDateTimeStamp, executive));

			if(bills == null || bills.isEmpty()) {
				jsonObjectResult.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.NO_RECORDS_DESCRIPTION);

				return jsonObjectResult;
			}

			final var taxesWiseBillHm = bills.stream().collect(Collectors.groupingBy(BillDetailsForBillClearance::getBillId,
					Collectors.groupingBy(BillDetailsForBillClearance::getTaxMasterId, Collectors.reducing(0.0, BillDetailsForBillClearance::getTaxAmount, Double::sum))));

			final var billWiseHm = bills.stream().collect(Collectors.toMap(BillDetailsForBillClearance::getBillId, Function.identity(), (e1, e2) -> e2));

			bills.clear();
			bills.addAll(billWiseHm.values());

			final var	billIdStr	= bills.stream().filter(e -> e.getStatus() == BillClearanceStatusConstant.BILL_CLEARANCE_STATUS_PARTIAL_PAYMENT_ID).map(e -> Long.toString(e.getBillId())).collect(Collectors.joining(Constant.COMMA));
			final var	collIdStr	= bills.stream().filter(e -> e.getCollectionPersonId() > 0).map(e -> Long.toString(e.getCollectionPersonId())).collect(Collectors.joining(Constant.COMMA));
			final var	corpIdStr	= bills.stream().filter(e -> e.getCreditorId() > 0).map(e -> Long.toString(e.getCreditorId())).collect(Collectors.joining(Constant.COMMA));

			if(!StringUtils.isEmpty(billIdStr))
				billClearanceDetails = BillClearanceDAO.getInstance().getBillClearanceDetails(billIdStr);

			if(!StringUtils.isEmpty(collIdStr))
				collPersonHM		= CollectionPersonMasterDao.getInstance().getCollectionPersonDetailsByIds(collIdStr);

			if(!StringUtils.isEmpty(corpIdStr))
				corpAccColl 		= CorporateAccountDao.getInstance().getCorporateAccountDetails(corpIdStr);

			final var isSupplementryBill = bills.stream().anyMatch(e -> e.getBillTypeId() == BillTypeConstant.SUPPLEMENTARY_BILL_TYPE_ID);

			final var showSuppBillRowAfterBillDetails			= (boolean) configuration.getOrDefault(BillPaymentConfigurationConstant.SHOW_SUPP_BILL_ROW_AFTER_BILL_DETAILS, false);

			if(showSuppBillRowAfterBillDetails && typeOfSelection == BillClearanceStatusConstant.SEARCH_BY_BILL_NO)
				suppBills	= BillDAO.getInstance().getBillClearanceData(queryStringForSuppBill(bills, jsonObjectIn, minDateTimeStamp, executive, isSupplementryBill));

			final List<BillDetailsForBillClearance>	finalList			= new ArrayList<>();

			for (final BillDetailsForBillClearance bill : bills) {
				if(corpAccColl != null && corpAccColl.get(bill.getCreditorId()) != null)
					bill.setCreditorName(corpAccColl.get(bill.getCreditorId()).getName());

				if(collPersonHM != null && collPersonHM.get(bill.getCollectionPersonId()) != null)
					bill.setCollectionPersonName(collPersonHM.get(bill.getCollectionPersonId()).getName());
				else
					bill.setCollectionPersonName("--");

				final var branch = cManip.getGenericBranchDetailCache(request, bill.getBranchId());

				if(bill.getBillNumber() != null) bill.setBillNumber(StringUtils.trim(bill.getBillNumber()));

				bill.setBranchName(branch.getName());
				bill.setCreationDateTimeStampString(DateTimeUtility.getDateFromTimeStamp(bill.getCreationDateTimeStamp()));
				bill.setAccountGroupId(executive.getAccountGroupId());

				if(bill.getStatus() != BillClearanceStatusConstant.BILL_CLEARANCE_STATUS_PARTIAL_PAYMENT_ID) {
					bill.setClearanceStatusName(BillClearanceStatusConstant.getBillClearanceStatus(bill.getStatus()));
					bill.setNoOfDays(Utility.getDayDiffBetweenTwoDates(bill.getCreationDateTimeStamp(), systemDate));
					bill.setGrandTotal(bill.getGrandTotal() + bill.getAdditionalCharge() + bill.getIncomeAmount());
					bill.setBalAmount(bill.getGrandTotal());
				} else {
					final var billClearance 	= billClearanceDetails.get(bill.getBillId());

					if(billClearance != null && billClearance.getStatus() != BillClearanceStatusConstant.BILL_CLEARANCE_STATUS_CANCELLED_ID) {
						bill.setClearanceStatusName(BillClearanceStatusConstant.getBillClearanceStatus(billClearance.getStatus()));
						bill.setNoOfDays(Utility.getDayDiffBetweenTwoDates(billClearance.getCreationDateTimeStamp(), systemDate));
						bill.setGrandTotal(billClearance.getGrandTotal());
						bill.setBalAmount(billClearance.getGrandTotal() - billClearance.getTotalReceivedAmount());
					}
				}

				setTaxes(taxesWiseBillHm, bill);

				if((boolean) configuration.getOrDefault(BillPaymentConfigurationConstant.BILL_NUMBER_WISE_SORTING, false))
					spiltBillNumber(bill);

				if (showSuppBillRowAfterBillDetails && typeOfSelection != BillClearanceStatusConstant.SEARCH_BY_CREDITOR && typeOfSelection != BillClearanceStatusConstant.SEARCH_BY_MULTIPLE_BILL && suppBills != null && !suppBills.isEmpty() && !isSupplementryBill)
					suppBills.forEach((final BillDetailsForBillClearance suppBill) -> bill.setSuppBillNumber(suppBill.getBillNumber()));

				if(bill.getGrandTotal() > 0)
					finalList.add(bill);
			}

			if (showSuppBillRowAfterBillDetails && (typeOfSelection == BillClearanceStatusConstant.SEARCH_BY_CREDITOR || typeOfSelection == BillClearanceStatusConstant.SEARCH_BY_MULTIPLE_BILL)) {
				final List<BillDetailsForBillClearance>	creditorBillList	= ListFilterUtility.filterList(finalList, a -> a.getBillTypeId() == BillTypeConstant.NORMAL_BILL_TYPE_ID);
				final List<BillDetailsForBillClearance> suppBillList		= ListFilterUtility.filterList(finalList, a -> a.getBillTypeId() == BillTypeConstant.SUPPLEMENTARY_BILL_TYPE_ID);

				finalList.clear();

				if (!creditorBillList.isEmpty())
					creditorBillList.forEach((final BillDetailsForBillClearance normalBill) -> {
						if(normalBill.getBillNumber() != null) normalBill.setBillNumber(StringUtils.trim(normalBill.getBillNumber()));
						finalList.add(normalBill);

						final List<BillDetailsForBillClearance> filteredSuppList = ListFilterUtility.filterList(suppBillList, s -> normalBill.getBillId() == s.getReferenceBillId());

						if (!filteredSuppList.isEmpty()) {
							finalList.add(filteredSuppList.get(0));
							normalBill.setSuppBillNumber(filteredSuppList.get(0).getBillNumber());
						}
					});
				else if (!suppBillList.isEmpty())
					finalList.addAll(suppBillList);
			}

			final var	billsJsonArray = new JSONArray(getSortedData(finalList, configuration, executive));

			jsonObjectResult.put("billsJsonArray", billsJsonArray);
			jsonObjectResult.put("BillClearanceStatusConstant", BillClearanceStatusConstant.getBillClearanceStatusConstants().getHtData());
			jsonObjectResult.put(BillPaymentConfigurationConstant.SHOW_MESSAGE_PAYMENT_TYPE_CHANGE, (boolean) configuration.getOrDefault(BillPaymentConfigurationConstant.SHOW_MESSAGE_PAYMENT_TYPE_CHANGE, false));
			jsonObjectResult.put(BillPaymentConfigurationConstant.AUTO_APPEND_BILLS_FOR_PAYMENT, (boolean) configuration.getOrDefault(BillPaymentConfigurationConstant.AUTO_APPEND_BILLS_FOR_PAYMENT, false));
			jsonObjectResult.put(BillPaymentConfigurationConstant.ALLOW_PARTIAL_BILLS_IN_MULTIPLE_CLEAR, (boolean) configuration.getOrDefault(BillPaymentConfigurationConstant.ALLOW_PARTIAL_BILLS_IN_MULTIPLE_CLEAR, false));
			jsonObjectResult.put("showSuppBillRowAfterBillDetails", showSuppBillRowAfterBillDetails);

			return jsonObjectResult;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private String queryString(final short typeOfSelection, final JSONObject jsonObjectIn, final String branchIds, final Timestamp minDateTimeStamp,
			final Executive executive) throws Exception {
		var				branchId				= 0L;
		String			billNo					= null;

		try {
			final var	whereClause 		= new StringJoiner(" ");

			whereClause.add("b.AccountGroupId = " + executive.getAccountGroupId());
			whereClause.add("AND b.CustomerType = 1");

			switch (typeOfSelection) {
			case BillClearanceStatusConstant.SEARCH_BY_CREDITOR -> {
				final var	creditorId		= jsonObjectIn.optLong("CreditorId", 0);

				whereClause.add("AND b.[Status]	IN(1,3)");

				if(branchIds != null)
					whereClause.add("AND b.BranchId IN(" + branchIds + ")");

				if(creditorId > 0)
					whereClause.add("AND b.CreditorId = " + creditorId);

				if(minDateTimeStamp != null)
					whereClause.add("AND b.CreationDateTimeStamp >= '" + minDateTimeStamp + "'");
			}
			case BillClearanceStatusConstant.SEARCH_BY_BILL_NO -> {
				branchId			= Utility.getLong(jsonObjectIn.get("BranchId"));
				billNo				= jsonObjectIn.get("BillNumber").toString();
				whereClause.add("AND b.[Status] IN(1,3)");

				if(billNo != null && !"".equals(billNo))
					whereClause.add("AND b.BillNumber = '" + billNo + "'");

				if(branchId > 0)
					whereClause.add("AND b.BranchId = " + branchId);
			}
			case BillClearanceStatusConstant.SEARCH_BY_MULTIPLE_BILL -> {
				branchId			= Utility.getLong(jsonObjectIn.get("BranchId"));
				billNo				= jsonObjectIn.get("BillNumber").toString();
				whereClause.add("AND b.[Status]	IN(1)");

				if(billNo != null && !"".equals(billNo))
					whereClause.add("AND b.BillNumber = '" + billNo + "'");

				if(branchId > 0)
					whereClause.add("AND b.BranchId = " + branchId);
			}
			default -> {
				break;
			}
			}

			return whereClause.toString();
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private String queryStringForSuppBill(final List<BillDetailsForBillClearance> bills, final JSONObject jsonObjectIn, final Timestamp minDateTimeStamp,
			final Executive executive, final boolean isSupplementryBill) throws Exception {
		var				branchId				= 0L;
		String			refBillIds				= null;
		String			billIds					= null;
		String			refBillNumbers			= null;
		String			billNumbers				= null;

		try {
			if(jsonObjectIn.get("BranchId") != null)
				branchId			= Utility.getLong(jsonObjectIn.get("BranchId"));

			final var	whereClause 		= new StringJoiner(" ");

			whereClause.add("b.AccountGroupId = " + executive.getAccountGroupId());
			whereClause.add("AND b.CustomerType = 1");
			whereClause.add("AND b.[Status] IN(1,3)");

			if(minDateTimeStamp != null)
				whereClause.add("AND CreationDateTimeStamp >= '" + minDateTimeStamp + "'");

			if(branchId > 0)
				whereClause.add("AND b.BranchId = " + branchId);

			if(isSupplementryBill) {
				refBillIds		= bills.stream().map(a -> String.valueOf(a.getReferenceBillId())).collect(Collectors.joining(Constant.COMMA));
				refBillNumbers	= bills.stream().map(a -> String.valueOf(a.getReferenceBillNumber())).collect(Collectors.joining("','"));

				if(refBillIds != null && refBillIds.length() > 0)
					whereClause.add("AND b.BillId IN(" + refBillIds + ")");
				else
					whereClause.add("AND b.BillNumber IN('" + refBillNumbers + "')");
			} else {
				billIds			= bills.stream().map(a -> String.valueOf(a.getBillId())).collect(Collectors.joining(Constant.COMMA));
				billNumbers		= bills.stream().map(a -> String.valueOf(a.getBillNumber())).collect(Collectors.joining("','"));

				whereClause.add("AND b.BillTypeId = 2");

				if(billIds != null && billIds.length() > 0)
					whereClause.add("AND b.ReferenceBillId IN(" + billIds + ")");
				else
					whereClause.add("AND b.ReferenceBillNumber IN('" + billNumbers + "')");
			}

			return whereClause.toString();
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private void spiltBillNumber(final BillDetailsForBillClearance bill) {
		final var 	pair	= SplitLRNumber.getBillNumbers(bill.getBillNumber());

		bill.setBranchCode(pair != null && pair.getBranchCode() instanceof String ? pair.getBranchCode().toString() : "");

		if(pair != null)
			if(pair.getBillNumber() instanceof BigDecimal)
				bill.setBillNumberWithoutCode((BigDecimal) pair.getBillNumber());
			else if(pair.getBillNumber() instanceof Integer)
				bill.setBillNumberWithoutCode(new BigDecimal(Utility.getInt(pair.getBillNumber())));
			else if(pair.getBillNumber() instanceof Long)
				bill.setBillNumberWithoutCode(new BigDecimal(Utility.getLong(pair.getBillNumber())));
			else
				bill.setBillNumberWithoutCode(new BigDecimal(0));
	}

	private void setTaxes(final Map<Long, Map<Long, Double>> taxesWiseBillHm, final BillDetailsForBillClearance bill) {
		if (taxesWiseBillHm == null || taxesWiseBillHm.get(bill.getBillId()) == null)
			return;

		final var taxesWiseHm = taxesWiseBillHm.get(bill.getBillId());
		final double cgstAmt = taxesWiseHm.getOrDefault(TaxMasterConstant.CGST_MASTER_ID, 0.00);
		final double sgstAmt = taxesWiseHm.getOrDefault(TaxMasterConstant.SGST_MASTER_ID, 0.00);
		final double igstAmt = taxesWiseHm.getOrDefault(TaxMasterConstant.IGST_MASTER_ID, 0.00);
		bill.setCgstTax(cgstAmt);
		bill.setSgstTax(sgstAmt);
		bill.setIgstTax(igstAmt);
		bill.setTaxAmount(bill.getGrandTotal() - (cgstAmt + sgstAmt + igstAmt));
	}

	private List<BillDetailsForBillClearance> getSortedData(List<BillDetailsForBillClearance> billClearances, final Map<Object, Object> configuration, final Executive executive) throws Exception {
		try {
			final var 	subRegionList	= CollectionUtility.getLongListFromString((String) configuration.getOrDefault(BillPaymentConfigurationConstant.SUB_REGION_IDS_FOR_BIL_NUMBER_WISE_SORTING, "0"));

			if((boolean) configuration.getOrDefault(BillPaymentConfigurationConstant.BILL_DATE_WISE_SORTING, false))
				billClearances = SortUtils.sortList(billClearances, BillDetailsForBillClearance::getCreationDateTimeStamp);
			else if((boolean) configuration.getOrDefault(BillPaymentConfigurationConstant.BILL_NUMBER_WISE_SORTING, false) && (subRegionList.contains(executive.getSubRegionId()) || subRegionList.isEmpty()))
				billClearances = SortUtils.sortList(billClearances, BillDetailsForBillClearance::getBranchCode, BillDetailsForBillClearance::getBillNumberWithoutCode);

			return billClearances;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

}
