package com.ivcargo.actions.transport;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.framework.JSPUtility;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.ExecutiveDao;
import com.platform.dao.LorryHireDao;
import com.platform.dao.VehiclePendingForArrivalDao;
import com.platform.dto.Executive;
import com.platform.dto.LorryHire;
import com.platform.dto.constant.TransCargoAccountGroupConstant;
import com.platform.utils.Utility;

public class GetLorryHireDetailsAction implements Action {

	public void execute(HttpServletRequest request, HttpServletResponse response) {
		// TODO Auto-generated method stub
		HashMap<String,Object>	 		error 					= null;
		LorryHire 			lorryHire 						= null;
		CacheManip			cacheManip						= null;
		Executive			executive						= null;
		String				lorryHireNumber					= null;
		boolean				isMarkArrived  					= false;
		
		try {

			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error)){
				return;
			}

			executive 			= (Executive)request.getSession().getAttribute("executive");
			lorryHireNumber		= JSPUtility.GetString(request, "lorryHireNumber", "");

			new InitializeCreateLorryHireAction().execute(request, response);

			lorryHire = 	LorryHireDao.getInstance().getLorryHireDetailById((short)2,0,lorryHireNumber,executive.getAccountGroupId());

			if(lorryHire != null) {

				cacheManip	= new CacheManip(request);

				lorryHire.setSourceBranch(cacheManip.getGenericBranchDetailCache(request,lorryHire.getSourceBranchId()).getName());
				lorryHire.setDestinationBranch(cacheManip.getGenericBranchDetailCache(request,lorryHire.getDestinationBranchId()).getName());
				lorryHire.setBranch(cacheManip.getGenericBranchDetailCache(request,lorryHire.getBranchId()).getName());

				if(lorryHire.getBalancePayableAtBranchId() > 0) {
					lorryHire.setBalancePayableAtBranch(cacheManip.getGenericBranchDetailCache(request, lorryHire.getBalancePayableAtBranchId()).getName());
				} else {
					lorryHire.setBalancePayableAtBranch("");
				}

				lorryHire.setlHPVNo(Utility.checkedNullCondition(lorryHire.getlHPVNo(), (short) 1));
				lorryHire.setChequeNumber(Utility.checkedNullCondition(lorryHire.getChequeNumber(), (short) 1));
				lorryHire.setBankName(Utility.checkedNullCondition(lorryHire.getBankName(), (short) 1));
				lorryHire.setExecutiveName(ExecutiveDao.getInstance().getExecutiveDetailsByExecutiveIds(""+lorryHire.getExecutiveId()).get(lorryHire.getExecutiveId()).getName());
				lorryHire.setAdvancePaidByBranchName(cacheManip.getGenericBranchDetailCache(request, lorryHire.getAdvancePaidByBranchId()).getName());
				lorryHire.setLorrySupplierContactPerson(Utility.checkedNullCondition(lorryHire.getLorrySupplierContactPerson(), (short) 2));
				lorryHire.setSubRegionId(cacheManip.getGenericBranchDetailCache(request,lorryHire.getBranchId()).getSubRegionId());
				lorryHire.setRegionId(cacheManip.getGenericBranchDetailCache(request,lorryHire.getBranchId()).getRegionId());

				isMarkArrived = VehiclePendingForArrivalDao.getInstance().checkLorryHireRouteMarkArrived(lorryHire.getLorryHireId(), (short)2);
				lorryHire.setAvailableForCancel(isMarkArrived);
				request.setAttribute("lorryHireId", lorryHire.getLorryHireId());
			}

			request.setAttribute("lorryHire", lorryHire);

			if(executive.getAccountGroupId() == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_LMT){
				request.setAttribute("nextPageToken", "success_"+executive.getAccountGroupId());
			}else{
				request.setAttribute("nextPageToken", "success");
			}

		} catch (Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		} finally {
			lorryHire 						= null;
			cacheManip						= null;
			executive						= null;
			lorryHireNumber					= null;
		}
	}
}