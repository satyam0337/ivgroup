package com.ivcargo.b2c;

import java.io.PrintWriter;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.bll.impl.properties.LRTrackingConfigurationBllImpl;
import com.iv.constant.properties.LRTrackingPropertiesConstant;
import com.iv.logsapp.LogWriter;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.webService.WSUtility;
import com.iv.utils.webService.WebServiceURI;

public class FreightCalculatorAjaxAction  implements Action {

	private static final String TRACE_ID = FreightCalculatorAjaxAction.class.getName();

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		long 					accountGroupId		= 0;
		long 					bookingBranchId		= 0;
		long 					destinationBranchId	= 0;
		long 					articles			= 0;
		double 					weight				= 0;
		StringBuilder 			module				= null;
		ValueObject     		outValueObject		= null;
		double 					declaredValue		= 0.00;
		Map<Object, Object>		lrTrackingConfigObj	= null;
		boolean					lrTrackingAllow		= false;

		try {

			response.setContentType("application/json; charset=UTF-8");
			response.addHeader("Access-Control-Allow-Origin", "*");
			response.addHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE, HEAD");
			response.addHeader("Access-Control-Allow-Headers", "X-PINGOTHER, Origin, X-Requested-With, Content-Type, Accept");
			response.addHeader("Access-Control-Max-Age", "1728000");

			final PrintWriter printout 	= response.getWriter();

			if(request.getParameter("accountGroupId") != null)
				accountGroupId		= Long.parseLong(request.getParameter("accountGroupId"));

			if(request.getParameter("bookingBranchId") != null)
				bookingBranchId		= Long.parseLong(request.getParameter("bookingBranchId"));

			if(request.getParameter("destinationBranchId") != null)
				destinationBranchId	= Long.parseLong(request.getParameter("destinationBranchId"));

			if(request.getParameter("articles") != null)
				articles			= Long.parseLong(request.getParameter("articles"));

			if(request.getParameter("weight") != null)
				weight				= Double.parseDouble(request.getParameter("weight"));

			if(request.getParameter("invoiceValue") != null)
				declaredValue				= Double.parseDouble(request.getParameter("invoiceValue"));

			if(accountGroupId > 0)
				lrTrackingConfigObj	= LRTrackingConfigurationBllImpl.getInstance().getLRTrackingProperties(accountGroupId);

			if(lrTrackingConfigObj != null)
				lrTrackingAllow		= (Boolean) lrTrackingConfigObj.getOrDefault(LRTrackingPropertiesConstant.LR_TRACKING_ALLOW, false);

			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_DEBUG, "lrTrackingAllow = " + lrTrackingAllow);

			module	= new StringBuilder();
			module.append("&accountGroupId=" + accountGroupId);
			module.append("&bookingBranchId=" + bookingBranchId);
			module.append("&destinationBranchId=" + destinationBranchId);
			module.append("&articles=" + articles);
			module.append("&weight=" + weight);
			module.append("&declaredValue=" + declaredValue);

			if(lrTrackingAllow)
				outValueObject = WSUtility.callPostWebService(WSUtility.getWebServiceUrl("" + WebServiceURI.FREIGHT_CALCULATOR), module.toString());

			if(outValueObject != null && outValueObject.get(WSUtility.WEB_SERVICE_RESULT) != null) {
				printout.print(outValueObject.get(WSUtility.WEB_SERVICE_RESULT));
				printout.flush();
			} else {
				outValueObject	= new ValueObject();
				outValueObject.put("notallowed", "Not allowed");
				printout.println(outValueObject);
			}
		} catch (final Exception e) {
			e.printStackTrace();
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR,e);
		}
	}

}
