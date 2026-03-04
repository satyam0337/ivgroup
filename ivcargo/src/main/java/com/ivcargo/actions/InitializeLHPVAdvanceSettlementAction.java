package com.ivcargo.actions;

import java.util.ArrayList;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.properties.GeneralConfiguration;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.bll.tds.impl.TDSTxnDetailsBllImpl;
import com.iv.bll.utils.PaymentTypeSelectionUtility;
import com.iv.constant.properties.LhpvAdvanceSettlementPropertiesConstant;
import com.iv.constant.properties.TDSPropertiesConstant;
import com.iv.dto.constant.FeildPermissionsConstant;
import com.iv.dto.constant.IncomeExpenseChargeTypeConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.BankAccountDao;
import com.platform.dao.BranchDao;
import com.platform.dao.IncomeExpenseChargeDao;
import com.platform.dto.Branch;
import com.platform.dto.ConfigParam;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Converter;

public class InitializeLHPVAdvanceSettlementAction implements Action{
	public static final String TRACE_ID = "InitializeLHPVAdvanceSettlementAction";

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {

		HashMap<String,Object>	 						error 								= null;
		com.iv.dto.constant.PaymentTypeConstant[] 		paymentTypeArr						= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	paymentDetailsOnly = JSPUtility.GetBoolean(request, "paymentDetailsOnly",false);

			final var	lhpvId 	   = JSPUtility.GetLong(request, "lhpvId1",0);
			final var	lhpvNumber = JSPUtility.GetString(request, "lhpvNo1","");
			final var	cacheManip						= new CacheManip(request);
			final var	executive 						= cacheManip.getExecutive(request);
			final var	generalConfiguration			= cacheManip.getGeneralConfiguration(request, executive.getAccountGroupId());
			final var	regionList						= cacheManip.getRegionsByGroupId(request, executive.getAccountGroupId());
			final var	tdsConfiguration				= cacheManip.getTDSConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.LHPV_TRUCK_ADVANCE);
			final var 	branchArr 						= BranchDao.getInstance().findByAccountGroupId(executive.getAccountGroupId());
			final HashMap<?, ?>	execFldPermissions		= cacheManip.getExecutiveFieldPermission(request);
			final var	configuration					= cacheManip.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.LHPV_TRUCK_ADVANCE);
			final var	incomeExpenseMappingIds			= (String) configuration.getOrDefault(LhpvAdvanceSettlementPropertiesConstant.INCOME_EXPENSE_MAPPING_IDS, "");
			final var 	incomeExpenseChargeMasterList 	= IncomeExpenseChargeDao.getInstance().getIncomeExpenseChargeMasterByMappingIds(executive.getAccountGroupId(), incomeExpenseMappingIds, IncomeExpenseChargeTypeConstant.CHARGE_TYPE_OFFICE);
			final var	bankAccountList					= BankAccountDao.getInstance().getAllBankAccount(executive.getAccountGroupId());
			var			currentDate  					= DateTimeUtility.getCurrentDateString();
			final var	currentTimeStamp				= DateTimeUtility.getCurrentTimeStamp().getTime();

			if(execFldPermissions != null && execFldPermissions.get(FeildPermissionsConstant.BACK_DATE_IN_LATE_NIGHT_ENTRY) != null)
				if(DateTimeUtility.checkTimeExistBetweenTimeSlot(currentTimeStamp))
					currentDate		= DateTimeUtility.getYesterdayDate();
				else
					currentDate 	= DateTimeUtility.getCurrentDateString();

			final var	debitToBranch = execFldPermissions != null && execFldPermissions.get(FeildPermissionsConstant.DEBIT_TO_BRANCH) != null;

			final var	branchList = new ArrayList<Branch>();

			for (final Branch element : branchArr)
				if(element.getBranchId() != executive.getBranchId() && !element.isMarkForDelete())
					branchList.add(element);

			final var	maxNoOfDaysAllowBeforeCashStmtEntry = cacheManip.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_MAX_DAYS_OF_OPERATION_BEFORE_CASHSTATEMENT_ENTRY_ID);
			final var	previousDate 						= DateTimeUtility.getDateBeforeNoOfDays(maxNoOfDaysAllowBeforeCashStmtEntry);

			request.setAttribute(LhpvAdvanceSettlementPropertiesConstant.ALLOW_DATE_PICKER_FOR_CHEQUE_DATE, configuration.getOrDefault(LhpvAdvanceSettlementPropertiesConstant.ALLOW_DATE_PICKER_FOR_CHEQUE_DATE, false));
			request.setAttribute(LhpvAdvanceSettlementPropertiesConstant.FUEL_PUMP_SELECTION_FOR_CREDIT_ACCOUNT, configuration.getOrDefault(LhpvAdvanceSettlementPropertiesConstant.FUEL_PUMP_SELECTION_FOR_CREDIT_ACCOUNT, false));
			request.setAttribute(LhpvAdvanceSettlementPropertiesConstant.CREDIT_SLIP_NUMBER_FEILD, configuration.getOrDefault(LhpvAdvanceSettlementPropertiesConstant.CREDIT_SLIP_NUMBER_FEILD, false));
			request.setAttribute(LhpvAdvanceSettlementPropertiesConstant.CHEQUE_GIVEN_TO_FEILD, configuration.getOrDefault(LhpvAdvanceSettlementPropertiesConstant.CHEQUE_GIVEN_TO_FEILD, false));
			request.setAttribute("regionList",regionList);
			request.setAttribute("bankAccountList",bankAccountList);
			request.setAttribute("executiveRegionId",executive.getRegionId());
			request.setAttribute("paymentDetailsOnly", paymentDetailsOnly);
			request.setAttribute("lhpvNo1", lhpvNumber);
			request.setAttribute("lhpvId1", lhpvId);
			request.setAttribute("currentDate", currentDate);
			request.setAttribute("noOfDays",""+maxNoOfDaysAllowBeforeCashStmtEntry);
			request.setAttribute("previousDate",""+previousDate);
			request.setAttribute("debitToBranch",debitToBranch);
			request.setAttribute("branchList",branchList);
			request.setAttribute(LhpvAdvanceSettlementPropertiesConstant.PAYMENT_MODE_SELECTION, configuration.getOrDefault(LhpvAdvanceSettlementPropertiesConstant.PAYMENT_MODE_SELECTION, false));

			final var		paymentTypeVO	= new ValueObject();
			paymentTypeVO.put("executiveId", executive.getExecutiveId());
			paymentTypeVO.put("accountGroupId", executive.getAccountGroupId());
			paymentTypeVO.put(ModuleIdentifierConstant.MODULE_ID, ModuleIdentifierConstant.LHPV_TRUCK_ADVANCE);
			paymentTypeVO.put("ExecutiveFeildPermission", Converter.hashMapWithDtoToHashMapConversion(execFldPermissions));
			paymentTypeArr		= PaymentTypeSelectionUtility.getModuleWisePermissionBasePaymentTypeSelection(paymentTypeVO);

			request.setAttribute("paymentTypeArr", paymentTypeArr);
			request.setAttribute(GeneralConfiguration.BANK_PAYMENT_OPERATION_REQUIRED, generalConfiguration.getBoolean(GeneralConfiguration.BANK_PAYMENT_OPERATION_REQUIRED, false));
			request.setAttribute(TDSPropertiesConstant.TDS_CONFIGURATION, tdsConfiguration);
			request.setAttribute("tdsChargeList", TDSTxnDetailsBllImpl.getTDSChargesList(tdsConfiguration));

			if(incomeExpenseChargeMasterList != null && !incomeExpenseChargeMasterList.isEmpty()){
				request.setAttribute("incomeExpenseChargeMaster", incomeExpenseChargeMasterList);
				request.setAttribute("nextPageToken", "success");
			} else {
				error.put("errorCode", CargoErrorList.EXPENSE_TYPE_DETAILS);
				error.put("errorDescription", CargoErrorList.EXPENSE_TYPE_DETAILS_DESCRIPTION);
				request.setAttribute("cargoError", error);
				request.setAttribute("nextPageToken", "failure");
			}
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}
	}
}