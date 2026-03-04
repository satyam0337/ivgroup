package com.ivcargo.actions.transport;

import java.sql.Timestamp;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.BalanceResetBLL;
import com.businesslogic.master.ExpenseVoucherBLL;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.bll.impl.properties.BranchExpenseConfigurationBllImpl;
import com.iv.constant.properties.BranchExpensePropertiesConstant;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.constant.Constant;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.IncomeChargeDao;
import com.platform.dao.IncomeExpenseChargeDao;
import com.platform.dto.Executive;
import com.platform.dto.ExpenseDetails;
import com.platform.dto.ExpenseVoucherDetails;
import com.platform.dto.ExpenseVoucherPaymentDetails;
import com.platform.dto.IncomeExpenseChargeMaster;
import com.platform.dto.IncomeExpenseMappingMasterdto;
import com.platform.dto.TransportCommonMaster;
import com.platform.dto.WayBillIncome;
import com.platform.dto.WayBillIncomeVoucherDetails;
import com.platform.dto.configuration.modules.DocumentCodeConfigurationDTO;
import com.platform.dto.constant.PaymentTypeConstant;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

public class ProcessBalanceReset implements Action {

	public static final String TRACE_ID = "ProcessBalanceReset";

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {

		HashMap<String,Object>	 		error 							= null;
		Executive						executive						= null;
		Timestamp						currentDatetime					= null;
		String							strResponse						= null;
		ExpenseDetails					expenseDetails					= null;
		ExpenseVoucherDetails			voucherDetails					= null;
		BalanceResetBLL					balanceResetBLL					= null;
		ValueObject						valueObject						= null;
		ValueObject						valueInObject					= null;
		String							paymentVoucherNumber			= null;
		IncomeExpenseChargeMaster		model							= null;
		WayBillIncome	 				wayBillIncome 					= null;
		WayBillIncomeVoucherDetails		incomeVoucherDetails			= null;
		ExpenseVoucherPaymentDetails	expenseVoucherPaymentDetails	= null;
		Map<Object, Object>				expenseConfiguration			= null;
		CacheManip						cacheManip						= null;
		boolean							numericExpenseVoucherNumber		= false;
		short							paymentType						= PaymentTypeConstant.PAYMENT_TYPE_CASH_ID;
		short							chargeMasterId					= 0;
		short							incomeExpenseTypeId				= 0;
		long							branchId						= 0;
		long							executiveId						= 0;

		try {

			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			valueInObject 		= new ValueObject();
			currentDatetime 	= new Timestamp(new Date().getTime());
			cacheManip			= new CacheManip(request);
			executive			= (Executive)request.getSession().getAttribute("executive");
			branchId			= JSPUtility.GetLong(request, "branchId", 0);
			executiveId			= JSPUtility.GetLong(request, "executiveId", 0);
			incomeExpenseTypeId = JSPUtility.GetShort(request, "balincomeExp", (short)0);

			if (request.getAttribute("paymentType") != null)
				paymentType		= Utility.getShort(request.getAttribute("paymentType"));

			expenseConfiguration			= BranchExpenseConfigurationBllImpl.getInstance().getBranchExpenseProperty(executive.getAccountGroupId());
			numericExpenseVoucherNumber		= (boolean) expenseConfiguration.getOrDefault(BranchExpensePropertiesConstant.NUMERIC_EXPENSE_VOUCHER_NUMBER,false);

			valueInObject.put(BranchExpensePropertiesConstant.NUMERIC_EXPENSE_VOUCHER_NUMBER, numericExpenseVoucherNumber);
			valueInObject.put(Executive.EXECUTIVE, executive);
			valueInObject.put(Constant.BRANCH_ID, branchId);
			valueInObject.put(DocumentCodeConfigurationDTO.DOCUMENT_CODE_CONFIGURATION, cacheManip.getDocumentCodeConfiguration(request, executive.getAccountGroupId()));
			valueInObject.put("srcBranch", cacheManip.getGenericBranchDetailCache(request, executive.getBranchId()));

			final ExpenseVoucherBLL expenseVoucherbll	= new ExpenseVoucherBLL();

			paymentVoucherNumber	= expenseVoucherbll.generateExpenseVoucherNumber(valueInObject);

			if(paymentVoucherNumber != null) {

				if(incomeExpenseTypeId == 1) {//Expense

					model			= IncomeExpenseChargeDao.getInstance().getExpenseChargeMasterId(executive.getAccountGroupId(), IncomeExpenseMappingMasterdto.DEBIT_CASH_STATEMENT_BALANCE_RESETER);
					chargeMasterId	= model.getChargeId();//ExpenseChargeMasterId

					expenseDetails 	= new ExpenseDetails();
					expenseDetails.setExpenseDateTime(currentDatetime);
					expenseDetails.setActualDateTime(currentDatetime);
					expenseDetails.setExpenseChargeMasterId(chargeMasterId);
					expenseDetails.setAmount(JSPUtility.GetDouble(request, "balcrDEText", 0.00));
					expenseDetails.setRemark(JSPUtility.GetString(request, "remark", "").toUpperCase());
					expenseDetails.setId(0);
					expenseDetails.setNumber("0");
					expenseDetails.setAccountGroupId(executive.getAccountGroupId());
					expenseDetails.setBranchId(branchId);
					expenseDetails.setExecutiveId(executiveId);
					expenseDetails.setPaymentVoucherNumber(paymentVoucherNumber);
					expenseDetails.setTypeOfExpenseId(TransportCommonMaster.CHARGE_TYPE_OFFICE);

					voucherDetails = new ExpenseVoucherDetails();
					voucherDetails.setCreationDateTime(currentDatetime);
					voucherDetails.setAccountGroupId(executive.getAccountGroupId());
					voucherDetails.setBranchId(branchId);
					voucherDetails.setExecutiveId(executiveId);
					voucherDetails.setTotalAmount(JSPUtility.GetDouble(request, "balcrDEText", 0.00));
					voucherDetails.setPaymentVoucherNumber(paymentVoucherNumber);
					voucherDetails.setTypeOfExpenseId(TransportCommonMaster.CHARGE_TYPE_OFFICE);
					voucherDetails.setExpenseDateTime(currentDatetime);

					valueInObject.put("voucherDetails", voucherDetails);
					valueInObject.put("expenseDetails", expenseDetails);

				} else if(incomeExpenseTypeId == 2) {//Income

					model			= IncomeChargeDao.getInstance().getIncomeChargeMasterId(executive.getAccountGroupId(), IncomeExpenseMappingMasterdto.CREDIT_CASH_STATEMENT_BALANCE_RESETER);
					chargeMasterId	= model.getChargeId();//IncomeChargeMasterId

					wayBillIncome 	= new WayBillIncome();
					wayBillIncome.setIncomeDateTime(currentDatetime);
					wayBillIncome.setActualDateTime(currentDatetime);
					wayBillIncome.setIncomeChargeId(chargeMasterId);
					wayBillIncome.setAmount(JSPUtility.GetDouble(request, "balcrDEText", 0.00));
					wayBillIncome.setRemark(JSPUtility.GetString(request, "remark", "").toUpperCase());
					wayBillIncome.setWayBillId(0);
					wayBillIncome.setWayBillNumber("0");
					wayBillIncome.setAccountGroupId(executive.getAccountGroupId());
					wayBillIncome.setBranchId(branchId);
					wayBillIncome.setExecutiveId(executiveId);
					wayBillIncome.setReceiptVoucherNumber(paymentVoucherNumber);
					wayBillIncome.setIncomeTypeId(TransportCommonMaster.CHARGE_TYPE_OFFICE);

					incomeVoucherDetails = new WayBillIncomeVoucherDetails();
					incomeVoucherDetails.setCreationDateTime(currentDatetime);
					incomeVoucherDetails.setAccountGroupId(executive.getAccountGroupId());
					incomeVoucherDetails.setBranchId(branchId);
					incomeVoucherDetails.setExecutiveId(executiveId);
					incomeVoucherDetails.setTotalAmount(JSPUtility.GetDouble(request, "balcrDEText", 0.00));
					incomeVoucherDetails.setReceiptVoucherNumber(paymentVoucherNumber);
					incomeVoucherDetails.setIncomeTypeId(TransportCommonMaster.CHARGE_TYPE_OFFICE);
					incomeVoucherDetails.setIncomeDateTime(currentDatetime);

					valueInObject.put("incomeVoucherDetails", incomeVoucherDetails);
					valueInObject.put("wayBillIncome", wayBillIncome);
				}
				expenseVoucherPaymentDetails	= createExpenseVoucherPaymentDetails(request,paymentType);
				valueInObject.put("executive", executive);
				valueInObject.put("expenseVoucherPaymentDetails", expenseVoucherPaymentDetails);
				balanceResetBLL = new BalanceResetBLL();
				valueObject     = balanceResetBLL.balanceProcess(valueInObject);
			}

			if(valueObject != null && Long.parseLong(valueObject.get("voucherDetailsId").toString()) > 0)
				strResponse =  CargoErrorList.MASTER_DATA_INSERT_SUCCESS_DESCRIPTION ;
			else
				strResponse = "Expense Charge "+CargoErrorList.MASTER_DATA_OPERATION_FAILURE_DESCRIPTION;

			request.setAttribute("nextPageToken", "success");
			response.sendRedirect("BalanceReset.do?pageId=292&eventId=1&message="+strResponse);
			request.setAttribute("message",strResponse);

		} catch (final Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		} finally {
			executive                  	=	null;
			currentDatetime   		    =	null;
			strResponse                 =	null;
			expenseDetails		      	=	null;
			voucherDetails          	=	null;
			balanceResetBLL	      		=	null;
			valueObject			      	=	null;
			valueInObject		      	=	null;
			paymentVoucherNumber		=	null;
			model       			=	null;
		}
	}

	private ExpenseVoucherPaymentDetails createExpenseVoucherPaymentDetails(HttpServletRequest request, short paymentType) throws Exception{

		ExpenseVoucherPaymentDetails	expenseVoucherPaymentDetails	= null;
		try {
			expenseVoucherPaymentDetails	= new ExpenseVoucherPaymentDetails();
			switch (paymentType) {
			case PaymentTypeConstant.PAYMENT_TYPE_CASH_ID :
				expenseVoucherPaymentDetails.setPaymentMode(PaymentTypeConstant.PAYMENT_TYPE_CASH_ID);
				expenseVoucherPaymentDetails.setPaymentModeName(PaymentTypeConstant.PAYMENT_TYPE_CASH_NAME);
				break;
			case PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID :
				expenseVoucherPaymentDetails.setPaymentMode(PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID);
				expenseVoucherPaymentDetails.setPaymentModeName(PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_NAME);
				if (request.getAttribute("chequeNumber") != null)
					expenseVoucherPaymentDetails.setChequeNumber(request.getAttribute("chequeNumber").toString());
				if (request.getAttribute("chequedatepicker") != null)
					expenseVoucherPaymentDetails.setChequeDateTime(DateTimeUtility.appendTimeToDate(request.getAttribute("chequedatepicker").toString()));
				if (request.getAttribute("bankAccountId") != null)
					expenseVoucherPaymentDetails.setBankAccountId(Utility.getLong(request.getAttribute("bankAccountId")));
				if (request.getAttribute("bankAccountName") != null)
					expenseVoucherPaymentDetails.setBankAccountName(request.getAttribute("bankAccountName").toString().toUpperCase());
				if (request.getAttribute("chequeGivenTo") != null)
					expenseVoucherPaymentDetails.setChequeGivenTo(request.getAttribute("chequeGivenTo").toString().toUpperCase());
				if (request.getAttribute("paymentGivenByBranch") != null)
					expenseVoucherPaymentDetails.setPaymentMadeToBranchId(Utility.getLong(request.getAttribute("paymentGivenByBranch")));
				break;
			case PaymentTypeConstant.PAYMENT_TYPE_LHPV_ADVANCE_CREDIT_ID :
				expenseVoucherPaymentDetails.setPaymentMode(PaymentTypeConstant.PAYMENT_TYPE_LHPV_ADVANCE_CREDIT_ID);
				expenseVoucherPaymentDetails.setPaymentModeName(PaymentTypeConstant.PAYMENT_TYPE_LHPV_ADVANCE_CREDIT_NAME);
				if (request.getAttribute("creditSlipNumber") != null)
					expenseVoucherPaymentDetails.setChequeNumber(request.getAttribute("creditSlipNumber").toString());
				if (request.getAttribute("creditdatepicker") != null)
					expenseVoucherPaymentDetails.setChequeDateTime(DateTimeUtility.appendTimeToDate(request.getAttribute("creditdatepicker").toString()));
				if (request.getAttribute("creditAccountId") != null)
					expenseVoucherPaymentDetails.setCreditAccountId(Utility.getLong(request.getAttribute("creditAccountId")));
				break;
			default :
				expenseVoucherPaymentDetails.setPaymentMode(PaymentTypeConstant.PAYMENT_TYPE_CASH_ID);
				expenseVoucherPaymentDetails.setPaymentModeName(PaymentTypeConstant.PAYMENT_TYPE_CASH_NAME);
				break;
			}
			return expenseVoucherPaymentDetails;
		} catch (final Exception e) {
			throw e;
		}
	}
}
