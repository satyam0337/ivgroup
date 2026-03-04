package com.ivcargo.actions.masters;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.dao.impl.master.IncomeExpenseChargeDaoImpl;
import com.iv.dto.master.IncomeExpenseChargeMaster;
import com.iv.resource.ResourceManager;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.platform.dto.Executive;
import com.platform.resource.CargoErrorList;

public class IncomeExpenseChargeMasterAction implements Action{
	public static final String TRACE_ID = "IncomeExpenseChargeMasterAction";

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {

		HashMap<String,Object>	error 	= null;
		String		strResponse			= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			var	newChargeId			= 0L;
			var	isChargeExists		= true;

			final var	exec				= (Executive)request.getSession().getAttribute("executive");
			final var	filter				= JSPUtility.GetInt(request, "filter",0);
			final var	commonChargeName	= JSPUtility.GetString(request, "commonChargeName");
			final var	selectCharge		= (short)JSPUtility.GetInt(request, "selectCharge",0);
			final var	expenseType			= (short)JSPUtility.GetInt(request, "expenseType",0);
			final var	selectedChargeId	= (short)JSPUtility.GetInt(request, "selectedChargeId",0);

			final var	inexChargeMaster	= new IncomeExpenseChargeMaster();

			inexChargeMaster.setChargeName(commonChargeName);
			inexChargeMaster.setChargeDescription(JSPUtility.GetString(request, "description"));
			inexChargeMaster.setAccountGroupId(exec.getAccountGroupId());
			inexChargeMaster.setTypeId(expenseType);
			inexChargeMaster.setChargeType(selectCharge);
			inexChargeMaster.setMappingChargeTypeId((short)JSPUtility.GetInt(request, "mappingChargeType", 0));
			inexChargeMaster.setMarkForDelete(false);
			inexChargeMaster.setStatus(false);
			inexChargeMaster.setRegionId(0L);
			inexChargeMaster.setSubRegionId(0L);

			switch (filter) {

			case 1:	//Add Charge
				isChargeExists = IncomeExpenseChargeDaoImpl.getInstance().isChargeExits(commonChargeName, expenseType, exec.getAccountGroupId());

				if(!isChargeExists) {
					final var	conn	= ResourceManager.getConnection();

					newChargeId	= IncomeExpenseChargeDaoImpl.getInstance().insert(inexChargeMaster, conn);

					ResourceManager.freeConnection(conn);

					if(newChargeId > 0)
						strResponse =  CargoErrorList.MASTER_DATA_INSERT_SUCCESS_DESCRIPTION ;
					else
						strResponse = "Charge Insert "+CargoErrorList.MASTER_DATA_OPERATION_FAILURE_DESCRIPTION;
				} else
					strResponse = "Charge Name already Exists !";

				break;
			case 2:	//Update Charge
				inexChargeMaster.setChargeId(selectedChargeId);

				final var	conn	= ResourceManager.getConnection();

				strResponse = IncomeExpenseChargeDaoImpl.getInstance().update(inexChargeMaster, conn);

				ResourceManager.freeConnection(conn);

				break;
			case 3:	//Deactivate City
				strResponse = IncomeExpenseChargeDaoImpl.getInstance().changeIncomeExpenseStatus(selectedChargeId, selectCharge, IncomeExpenseChargeMaster.INCOME_EXPENSE_CHARGE_DEACTIVE, exec.getAccountGroupId());
				break;
			case 4:	//Activate City
				strResponse = IncomeExpenseChargeDaoImpl.getInstance().changeIncomeExpenseStatus(selectedChargeId, selectCharge, IncomeExpenseChargeMaster.INCOME_EXPENSE_CHARGE_ACTIVE, exec.getAccountGroupId());
				break;

			default:
				break;
			}

			request.setAttribute("nextPageToken", "success");
			if(filter != 0) {
				response.sendRedirect("IncomeExpenseChargeMaster.do?pageId=225&eventId=1&message="+strResponse);
				request.setAttribute("message",strResponse);
			}

		} catch (final Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		}
	}
}
