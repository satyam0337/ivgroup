package com.ivcargo.reports;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.dao.impl.bill.BillDaoImpl;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.constant.Constant;
import com.iv.utils.utility.CollectionUtility;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.CorporateAccountDao;
import com.platform.dao.reports.BillRegisterDao;
import com.platform.dto.Bill;
import com.platform.dto.CustomGroupMapper;
import com.platform.dto.configuration.report.account.PartyBillRegisterReportConfigurationDTO;
import com.platform.dto.model.BillRegisterReportModel;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

public class BillRegisterReportAction implements Action {

	public static final String TRACE_ID = "BillRegisterReportAction";

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {

		HashMap<String,Object>	 		error 								= null;
		final var 						branchId							= 0L;
		var 							isShowExecutiveNameColumn 			= false;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	cache			= new CacheManip(request);

			new InitializeBillRegisterReportAction().execute(request, response);

			final var	sdf			= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			final var	fromDate	= new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00").getTime());
			final var	toDate		= new Timestamp(sdf.parse(JSPUtility.GetString(request, "toDate") + " 23:59:59").getTime());

			final var	executive   = cache.getExecutive(request);

			final var	propertyConfig					= ReadAllConfigurationsBllImpl.getInstance().getOldReportConfigurationData(ReportIdentifierConstant.BILL_REGISTER_REPORT, executive.getAccountGroupId());

			final var	showPrintPartyNameColumn    	= propertyConfig.getBoolean(PartyBillRegisterReportConfigurationDTO.SHOW_PRINT_PARTY_NAME_COLUMN);
			final var	showPrintPartyMobNoColumn    	= propertyConfig.getBoolean(PartyBillRegisterReportConfigurationDTO.SHOW_PRINT_PARTY_MOB_NO_COLUMN);
			final var	showPrintPartyGSTNColumn     	= propertyConfig.getBoolean(PartyBillRegisterReportConfigurationDTO.SHOW_PRINT_PARTY_GSTN_COLUMN);
			final var	addAdditionalChargeInGrandTotal = propertyConfig.getBoolean(PartyBillRegisterReportConfigurationDTO.ADD_ADDITIONAL_CHARGE_IN_GRAND_TOTAL);
			final var	showExecutiveNameColumn			= propertyConfig.getBoolean(PartyBillRegisterReportConfigurationDTO.SHOW_EXECUTIVE_NAME_COLUMN);
			final var	executiveIdsToShowExecutiveName	= propertyConfig.getString(PartyBillRegisterReportConfigurationDTO.EXECUTIVE_IDS_TO_SHOW_EXECUTIVE_NAME);
			final var	showTotalAmountInDecimal    	= propertyConfig.getBoolean(PartyBillRegisterReportConfigurationDTO.SHOW_TOTAL_AMOUNT_IN_DECIMAL);
			final var	showAssignedBillingPartyBranchNameColumn    				= propertyConfig.getBoolean(PartyBillRegisterReportConfigurationDTO.SHOW_ASSIGNED_BILLINGPARTY_BRANCH_NAME_COLUMN);
			final var	addLrIncomeInInvoiceAmount    	= propertyConfig.getBoolean(PartyBillRegisterReportConfigurationDTO.ADD_LR_INCOME_IN_INVOICE_AMOUNT);

			ActionStaticUtil.executiveTypeWiseBranches(request, cache, executive);

			final var	branchIds	= ActionStaticUtil.getPhysicalBranchIds1(request, cache, executive);

			request.setAttribute("agentName", executive.getName());

			final var	objectOut = BillRegisterDao.getInstance().getBillRegister(branchIds, executive.getAccountGroupId(), fromDate, toDate);

			if(objectOut != null) {
				final var	reportModel 		= (BillRegisterReportModel[]) objectOut.get("BillRegisterReportModel");
				final var	billIdArray 		= (Long[]) objectOut.get("BillIdArray");
				final var	corporateIdArray	= (Long[]) objectOut.get("CorporateIdArray");

				if (reportModel != null && billIdArray != null && corporateIdArray!= null) {
					Map<Long, Double> lrIncomeDetails = null;
					final var	corporateIdStr  = Utility.GetLongArrayToString(corporateIdArray);
					final var	corpAccMap 		= CorporateAccountDao.getInstance().getCorporateAccountDetails(corporateIdStr);

					if(addLrIncomeInInvoiceAmount)
						lrIncomeDetails = BillDaoImpl.getInstance().getLrIncomeAmount(CollectionUtility.getLongArrayToString(billIdArray));

					final var	curDate			= DateTimeUtility.getCurrentTimeStamp();

					for (final BillRegisterReportModel element : reportModel) {
						final var	creditorObj   	= corpAccMap.get(element.getCreditorId());
						final var	coorporateObj 	= corpAccMap.get(element.getCorporateAccountIdForPrint());

						if(lrIncomeDetails != null)
							element.setIncomeAmount(lrIncomeDetails.getOrDefault(element.getBillId(), 0.0));

						element.setCustomerName(creditorObj.getName());

						if(showPrintPartyNameColumn && coorporateObj != null)
							element.setCustomerNameForPrint(Utility.checkedNullCondition(coorporateObj.getName(), (short)1));

						element.setStatus(Bill.getBillClearanceStatusName(element.getStatusId()));
						element.setDayDifference(Utility.getDayDiffBetweenTwoDates(element.getCreationDateTimeStamp(), curDate));
						element.setCorporateAccountGSTN(Utility.checkedNullCondition(creditorObj.getGstn(), (short)1));
						element.setCorporateAccountMobileNo(Utility.checkedNullCondition(creditorObj.getMobileNumber(), (short)1));

						if(showAssignedBillingPartyBranchNameColumn) {
							final var billingBranch	= cache.getGenericBranchDetailCache(request, creditorObj.getBranchId());

							element.setBillingBranch(billingBranch != null ? billingBranch.getName() : "");
						}
					}

					if(showExecutiveNameColumn && executiveIdsToShowExecutiveName != null) {
						final var	executiveIdsToShowExecutiveNameList	= CollectionUtility.getLongListFromString(executiveIdsToShowExecutiveName);
						isShowExecutiveNameColumn	= executiveIdsToShowExecutiveNameList.contains(executive.getExecutiveId());
					}

					request.setAttribute("BillRegisterReportModel", reportModel);
					request.setAttribute(PartyBillRegisterReportConfigurationDTO.SHOW_PRINT_PARTY_NAME_COLUMN, showPrintPartyNameColumn);
					request.setAttribute(PartyBillRegisterReportConfigurationDTO.SHOW_PRINT_PARTY_MOB_NO_COLUMN, showPrintPartyMobNoColumn);
					request.setAttribute(PartyBillRegisterReportConfigurationDTO.SHOW_PRINT_PARTY_GSTN_COLUMN, showPrintPartyGSTNColumn);
					request.setAttribute(PartyBillRegisterReportConfigurationDTO.ADD_ADDITIONAL_CHARGE_IN_GRAND_TOTAL, addAdditionalChargeInGrandTotal);
					request.setAttribute(PartyBillRegisterReportConfigurationDTO.SHOW_EXECUTIVE_NAME_COLUMN, showExecutiveNameColumn);
					request.setAttribute("isShowExecutiveNameColumn", isShowExecutiveNameColumn);
					request.setAttribute(PartyBillRegisterReportConfigurationDTO.SHOW_TOTAL_AMOUNT_IN_DECIMAL, showTotalAmountInDecimal);
					request.setAttribute(PartyBillRegisterReportConfigurationDTO.SHOW_ASSIGNED_BILLINGPARTY_BRANCH_NAME_COLUMN, showAssignedBillingPartyBranchNameColumn);
					request.setAttribute(PartyBillRegisterReportConfigurationDTO.ADD_LR_INCOME_IN_INVOICE_AMOUNT, addLrIncomeInInvoiceAmount);
				} else {
					error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
					error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
					request.setAttribute("cargoError", error);
				}
			} else {
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}

			ActionStaticUtil.setRequestAttribute(request,"customAddressBranchId", branchId);
			ActionStaticUtil.setRequestAttribute(request,"customAddressIdentifer", CustomGroupMapper.IDENTIFIER_BOOKING);

			ActionStaticUtil.setReportViewModel(request);
			request.setAttribute("nextPageToken", Constant.SUCCESS);

		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}
	}
}