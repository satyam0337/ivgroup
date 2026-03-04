package com.ivcargo.actions.transport;

//~--- non-JDK imports --------------------------------------------------------

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.LHPVBLL;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.ExecutiveDao;
import com.platform.dto.ConfigParam;
import com.platform.dto.Executive;
import com.platform.dto.configuration.modules.LrCostConfigurationDTO;

public class LHPVCancellationAction implements Action {

	public static final String TRACE_ID = "LHPVCancellationAction";

	public void execute(HttpServletRequest request, HttpServletResponse response) {

		HashMap<String,Object>	 error 					= null;
		ValueObject 		inValObj					= null;
		LHPVBLL				lhpvbll						= null;
		Executive			executive					= null;
		boolean				isArrivalTruckDetailReport 	= false;
		long				lhpvId						= 0;
		CacheManip			cache						= null;
		long				deliveryRunSheetLedgerId	= 0;
		String				cancelLhpvRemark			= null;
		long 				cancelLhpvExecutiveId		= 0;
		Executive			cancelLhpvExecutive			= null;
		
		try {

			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error)){
				return;
			}
			
			inValObj					= new ValueObject();
			lhpvbll						= new LHPVBLL();
			executive					= (Executive) request.getSession().getAttribute("executive");
			lhpvId						= JSPUtility.GetLong(request, "lhpvId", 0);
			deliveryRunSheetLedgerId	= JSPUtility.GetLong(request, "deliveryRunSheetLedgerId", 0);
			cancelLhpvRemark			= request.getParameter("cancelLhpvRemark");
			cancelLhpvExecutiveId		= JSPUtility.GetLong(request, "cancelLhpvForExecutive", executive.getExecutiveId());
			cache						= new CacheManip(request);
				
			cancelLhpvExecutive 		= ExecutiveDao.getInstance().findByExecutiveId(cancelLhpvExecutiveId);
			
			if(cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_ARRIVAL_TRUCK_DETAILS_REPORT) == ConfigParam.CONFIG_KEY_CONFIG_KEY_ARRIVAL_TRUCK_DETAILS_REPORT_ALLOWED) {
				isArrivalTruckDetailReport = true;
			}

			inValObj.put("lhpvId", lhpvId);
			inValObj.put("deliveryRunSheetLedgerId", deliveryRunSheetLedgerId);
			inValObj.put("executive", executive);
			inValObj.put("cancelLhpvExecutiveId", cancelLhpvExecutiveId);
			inValObj.put("cancelLhpvExecutive", cancelLhpvExecutive);
			inValObj.put("isArrivalTruckDetailReport", isArrivalTruckDetailReport);
			inValObj.put("cancelLhpvRemark", cancelLhpvRemark);

			inValObj.put(LrCostConfigurationDTO.LR_COST_CONFIGURATION, cache.getGroupWiseLRCostConfiguration(request, executive.getAccountGroupId()));
			lhpvbll.lhpvCancellationProcess(inValObj);

			response.sendRedirect("editWaybill.do?pageId=5&eventId=3&wayBillNumber="+request.getParameter("noSearched")+"&TypeOfNumber="+request.getParameter("typeOfNoSearched"));

		} catch (Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		} finally {
			inValObj	= null;
			executive	= null;
			lhpvbll		= null;
		}

	}
}