package com.ivcargo.reports;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.IncomeExpenseHeadwiseDetailsReportBLL;
import com.framework.Action;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.platform.dto.Executive;

public class IncomeExpenseHeadWiseDetailsAllHeadsReportAction implements Action {

	public void execute(HttpServletRequest request, HttpServletResponse response) {
		Executive  								executive 				= null;
		short									IncExpType				= 0;
		short									chargeType				= 0;
		ValueObject								valueInobject			= null;
		IncomeExpenseHeadwiseDetailsReportBLL	incExpbll				= null;
		ValueObject							    valueoutObject			= null;

		HashMap<String,Object>	 				error 					= null;
		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error)){
				return;
			}
			IncExpType = Short.parseShort(request.getParameter("IncExpType"));
			chargeType = Short.parseShort(request.getParameter("chargeType"));

			executive = (Executive) request.getSession().getAttribute("executive");
			valueInobject = new ValueObject();
			if(executive!= null && IncExpType > 0 && chargeType > 0){
				incExpbll = new  IncomeExpenseHeadwiseDetailsReportBLL();

				valueInobject.put("executive", executive);
				valueInobject.put("IncExpType", IncExpType);
				valueInobject.put("chargeType", chargeType);

				valueoutObject =  incExpbll.getAllHeads(valueInobject);
				if(valueoutObject != null){
					if(valueoutObject.get("incomeexpenseHeadsArr")!= null){
						request.setAttribute("incomeexpenseHeadsArr", valueoutObject.get("incomeexpenseHeadsArr"));	
					}
					if(valueoutObject.get("headName")!= null){
						request.setAttribute("headName", valueoutObject.get("headName"));	
					}
				}
			}

			request.setAttribute("nextPageToken", "success");

		} catch (Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		}
		finally{
			executive 				= null;
			valueInobject			= null;
			incExpbll				= null;
			valueoutObject			= null;
		}

	}
}