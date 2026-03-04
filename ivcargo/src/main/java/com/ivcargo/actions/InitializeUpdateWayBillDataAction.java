package com.ivcargo.actions;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.platform.dao.CustomerDetailsDao;
import com.platform.dto.CorporateAccount;
import com.platform.dto.CustomerDetails;

public class InitializeUpdateWayBillDataAction implements Action {

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	 error 	= null;
		CustomerDetails consignor = null;
		CustomerDetails consignee = null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final long wayBillId 		= Long.parseLong(request.getParameter("wayBillId"));
			final short wbStatus 		= Short.parseShort(request.getParameter("wbStatus"));

			final String sourceBranchId=request.getParameter("sourceBranchId");
			final String destinationBranchId=request.getParameter("destinationBranchId");

			consignor          = CustomerDetailsDao.getInstance().getCustomerDetailsByWayBillIdAndType((short)1, wayBillId, CustomerDetails.CUSTOMER_TYPE_CONSIGNOR_ID);
			consignee          = CustomerDetailsDao.getInstance().getCustomerDetailsByWayBillIdAndType((short)2, wayBillId, CustomerDetails.CUSTOMER_TYPE_CONSIGNEE_ID);

			request.setAttribute("wayBillId", wayBillId);
			request.setAttribute("wbStatus", wbStatus);
			request.setAttribute("sourceBranchId", sourceBranchId);
			request.setAttribute("destinationBranchId", destinationBranchId);

			request.setAttribute("consignor", consignor);
			request.setAttribute("consignee", consignee);

			if(consignor.getPartyType()==CorporateAccount.PARTY_TYPE_TBB){
				request.setAttribute("corporateAccountId", consignor.getCorporateAccountId());
				request.setAttribute("partyMasterId", 0);
			}else{
				request.setAttribute("corporateAccountId",0);
				request.setAttribute("partyMasterId", consignor.getCorporateAccountId());
			}

			request.setAttribute("nextPageToken", "success");

		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		} finally {
			consignor = null;
			consignee = null;
		}
	}
}
