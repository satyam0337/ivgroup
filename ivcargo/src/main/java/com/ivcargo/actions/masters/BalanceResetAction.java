package com.ivcargo.actions.masters;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.logsapp.LogWriter;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.platform.dao.IncomeChargeDao;
import com.platform.dao.IncomeExpenseChargeDao;
import com.platform.dto.Executive;
import com.platform.dto.IncomeExpenseChargeMaster;
import com.platform.dto.IncomeExpenseMappingMasterdto;
import com.platform.resource.CargoErrorList;

public class BalanceResetAction implements Action {

	public static final String TRACE_ID = "BalanceResetAction";

	public void execute(HttpServletRequest request, HttpServletResponse response) {

		HashMap<String,Object>	 		error 				= null;
		Executive						executive			= null;
		IncomeExpenseChargeMaster		expModel			= null;
		IncomeExpenseChargeMaster		incModel			= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error)){
				return;
			}
			
			executive	= (Executive)request.getSession().getAttribute("executive");
			expModel	= IncomeExpenseChargeDao.getInstance().getExpenseChargeMasterId(executive.getAccountGroupId(), IncomeExpenseMappingMasterdto.DEBIT_CASH_STATEMENT_BALANCE_RESETER);
			
			incModel	= IncomeChargeDao.getInstance().getIncomeChargeMasterId(executive.getAccountGroupId(), IncomeExpenseMappingMasterdto.CREDIT_CASH_STATEMENT_BALANCE_RESETER);

			if(expModel == null || incModel == null) {
				LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO, (String) error.get("errorCode") + " " + (String) error.get("errorDescription"));
				error.put("errorCode", CargoErrorList.EXPENSE_INCOME_TYPE_DETAILS);
				error.put("errorDescription", CargoErrorList.EXPENSE_INCOME_TYPE_DETAILS_DESCRIPTION);
				request.setAttribute("cargoError", error);
				request.setAttribute("nextPageToken", "failure");
			} else {
				request.setAttribute("nextPageToken", "success");
			}

		} catch (Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		} finally {
			executive			= null;
			expModel			= null;
			incModel			= null;
		}
	}
}
