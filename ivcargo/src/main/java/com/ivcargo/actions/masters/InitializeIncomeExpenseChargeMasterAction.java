package com.ivcargo.actions.masters;

import java.util.ArrayList;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.dto.constant.IncomeExpenseMappingConstant;
import com.iv.utils.CollectionUtility;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.IncomeExpenseMappingMasterDao;
import com.platform.dto.Executive;
import com.platform.dto.IncomeExpenseMappingMasterdto;

public class InitializeIncomeExpenseChargeMasterAction implements Action{
	public static final String TRACE_ID = "InitializeIncomeExpenseChargeMasterAction ";

	public void execute(HttpServletRequest request, HttpServletResponse response) {

		HashMap<String,Object>	error = null;
		CacheManip	cacheManip	= null;
		Executive	executive	= null;
		ArrayList<IncomeExpenseMappingMasterdto> IncomeExpenseDropList = null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error)){
				return;
			}
			cacheManip	= new CacheManip(request);
			executive	= (Executive) request.getSession().getAttribute("executive");

			IncomeExpenseDropList = IncomeExpenseMappingMasterDao.getInstance().getIncomeExpenseMappingMaster();
			IncomeExpenseDropList = (ArrayList<IncomeExpenseMappingMasterdto>)IncomeExpenseDropList.parallelStream().filter(b -> b.getIncomeExpenseMappingMasterId() != IncomeExpenseMappingConstant.LOADING_HAMALI
					 && b.getIncomeExpenseMappingMasterId() != IncomeExpenseMappingConstant.UNLOADING_HAMALI).collect(CollectionUtility.getList());
			
			request.setAttribute("IncomeExpenseDropList", IncomeExpenseDropList);
			request.setAttribute("BookingCharges",cacheManip.getActiveBookingCharges(request, executive.getBranchId()));
			request.setAttribute("DeliveryCharges",cacheManip.getActiveDeliveryCharges(request, executive.getBranchId()));
			request.setAttribute("nextPageToken", "success");

		} catch (Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		} finally {
			cacheManip	= null;
			executive	= null;
		}
	}

}