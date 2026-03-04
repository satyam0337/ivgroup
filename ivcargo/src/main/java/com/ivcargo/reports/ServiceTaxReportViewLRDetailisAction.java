package com.ivcargo.reports;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.WayBillTaxDetailsDao;
import com.platform.dto.Executive;
import com.platform.dto.WayBillTaxDetails;
import com.platform.resource.CargoErrorList;

public class ServiceTaxReportViewLRDetailisAction implements Action {

	public static final String TRACE_ID = "ServiceTaxReportViewLRDetailisAction";

	public void execute(HttpServletRequest request, HttpServletResponse response) {

		HashMap<String,Object>	 		error 					= null;
		Executive 						executive 				= null;
		CacheManip 						cManip 					= null;
		WayBillTaxDetails[]				waybillTaxDetails		= null;
		String							wayBillNumber			= null;
		long							wayBillId				= 0;
		short							taxTxnTypeId			= 0;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error)){
				return;
			}

			cManip 			= new CacheManip(request);
			executive 		= (Executive) request.getSession().getAttribute("executive");
			wayBillId		= Long.parseLong(request.getParameter("wayBillId"));
			taxTxnTypeId	= Short.parseShort(request.getParameter("taxTxnTypeId"));
			wayBillNumber	= request.getParameter("wayBillNumber");

			if(wayBillId > 0 && taxTxnTypeId > 0){

				waybillTaxDetails = WayBillTaxDetailsDao.getInstance().getWayBillTaxDetails(executive.getAccountGroupId(), wayBillId, taxTxnTypeId, (short)2);
				for(int index = 0; index < waybillTaxDetails.length; index++) {
					waybillTaxDetails[index].setBranchName(cManip.getBranchById(request, executive.getAccountGroupId(), waybillTaxDetails[index].getBranchId()).getName());
				}

				request.setAttribute("waybillTaxDetails",waybillTaxDetails); 
				request.setAttribute("wayBillNumber",wayBillNumber); 
			}else {
				error.put("errorCode", CargoErrorList.NO_RECORDS);
				error.put("errorDescription", CargoErrorList.NO_RECORDS_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}
			request.setAttribute("nextPageToken", "success");

		} catch (Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		} finally {
			executive 				= null;
			cManip 					= null;
			waybillTaxDetails		= null;
		}
	}

}