package com.ivcargo.actions;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.ReceivablesBLL;
import com.framework.Action;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;

public class WayBillStatusSummaryAction implements Action {

	public void execute(HttpServletRequest request, HttpServletResponse response) {


		// TODO Auto-generated method stub
		HashMap<String,Object>	error 	= null;
		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error)){
				return;
			}

			long dispatchLedgerId = Long.parseLong(request.getParameter("dispatchLedgerId"));
			ValueObject inValObj         = new ValueObject();

			inValObj.put("dispatchLedgerId", dispatchLedgerId);

			ReceivablesBLL  receivablesBLL = new ReceivablesBLL();
			ValueObject outValObj = receivablesBLL.getReceivablesWaybillByDispatchLedger(inValObj);

			request.setAttribute("WayBillReceivableModel",outValObj.get("WayBillReceivableModel"));
			request.setAttribute("nextPageToken", "success");


		} catch (Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		}
	}
}
