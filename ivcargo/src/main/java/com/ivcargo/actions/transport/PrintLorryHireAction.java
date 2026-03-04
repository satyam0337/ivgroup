package com.ivcargo.actions.transport;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.framework.JSPUtility;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.ExecutiveDao;
import com.platform.dao.LorryHireDao;
import com.platform.dto.Executive;
import com.platform.dto.LorryHire;
import com.platform.dto.constant.TransCargoAccountGroupConstant;
import com.platform.utils.Utility;

public class PrintLorryHireAction implements Action {

	public void execute(HttpServletRequest request, HttpServletResponse response) {
		// TODO Auto-generated method stub
		HashMap<String,Object>	 error 	= null;
		LorryHire 	lorryHire 	= null;
		CacheManip	cacheManip	= null;
		Executive	executive	= null;
		List<Integer> 	customViewPageGroupList	= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error)){
				return;
			}
			customViewPageGroupList = Arrays.asList(TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_JAYRAM_TRANSPORTS
					,TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_TARASVIN_TRANSPORT
					,TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_VEGA_TRANSPORT
					,TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_GKR);

			executive	= (Executive) request.getSession().getAttribute("executive");
			lorryHire   = LorryHireDao.getInstance().getLorryHireDetailById((short)1,JSPUtility.GetLong(request, "lorryHireId", 0),"",executive.getAccountGroupId());

			if(lorryHire != null) {

				executive 	= (Executive)request.getSession().getAttribute("executive");
				cacheManip	= new CacheManip(request);

				lorryHire.setSourceBranch(cacheManip.getGenericBranchDetailCache(request,lorryHire.getSourceBranchId()).getName());
				lorryHire.setDestinationBranch(cacheManip.getGenericBranchDetailCache(request,lorryHire.getDestinationBranchId()).getName());
				lorryHire.setBranch(cacheManip.getGenericBranchDetailCache(request,  lorryHire.getBranchId()).getName());
				
				if(lorryHire.getBalancePayableAtBranchId() > 0) {
					lorryHire.setBalancePayableAtBranch(cacheManip.getGenericBranchDetailCache(request, lorryHire.getBalancePayableAtBranchId()).getName());
				} else {
					lorryHire.setBalancePayableAtBranch("");
				}
				
				if(lorryHire.getlHPVNo() == null) {
					lorryHire.setlHPVNo("0");
				}
				
				lorryHire.setChequeNumber(Utility.checkedNullCondition(lorryHire.getChequeNumber(), (short) 1));
				lorryHire.setBankName(Utility.checkedNullCondition(lorryHire.getBankName(), (short) 1));
				lorryHire.setExecutiveName(ExecutiveDao.getInstance().getExecutiveDetailsByExecutiveIds(""+lorryHire.getExecutiveId()).get(lorryHire.getExecutiveId()).getName());
				lorryHire.setAdvancePaidByBranchName(cacheManip.getGenericBranchDetailCache(request, lorryHire.getAdvancePaidByBranchId()).getName());
				lorryHire.setLorrySupplierContactPerson(Utility.checkedNullCondition(lorryHire.getLorrySupplierContactPerson(), (short) 2));
			}

			request.setAttribute("LorryHire", lorryHire);

			if(customViewPageGroupList.contains((int) executive.getAccountGroupId())){
				request.setAttribute("nextPageToken", "success_1");
			}else{
				request.setAttribute("nextPageToken", "success");
			}

		} catch (Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		} finally {
			lorryHire	= null;
			cacheManip	= null;
			executive	= null;
		}
	}
}
