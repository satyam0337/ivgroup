package com.ivcargo.actions.transport;

import java.sql.Timestamp;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.logsapp.LogWriter;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionErrors;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.InvoiceCertificationDao;
import com.platform.dto.AliasNameConstants;
import com.platform.dto.Executive;
import com.platform.dto.OctroiAgentMaster;
import com.platform.dto.configuration.mindateselection.ModuleWiseMinDateSelectionConfigurationDTO;

public class InitializeOctroiBillClearanceAction implements Action {
	private static final String TRACE_ID = InitializeOctroiBillClearanceAction.class.getName();

	public void execute(HttpServletRequest request, HttpServletResponse response) {

		// TODO Auto-generated method stub
		HashMap<String, Object>		 error 				= null;
		OctroiAgentMaster[] 		octroiAgentDetails	= null;
		Executive					executive			= null;
		ValueObject					invoiceClear		= null;
		CacheManip					cacheManip			= null;
		Timestamp					minDateTimeStamp	= null;

		try {
			
			error = ActionStaticUtil.getSystemErrorColl(request);
			
			if(ActionStaticUtil.isSystemError(request, error)) {
				return;
			}
			
			cacheManip		= new CacheManip(request);
			executive		= (Executive)request.getSession().getAttribute(AliasNameConstants.EXECUTIVE);
			
			minDateTimeStamp	= cacheManip.getModuleWiseMinDateToGetData(request, executive.getAccountGroupId(), 
									ModuleWiseMinDateSelectionConfigurationDTO.OCTROI_INVOICE_PAYMENT_MIN_DATE_ALLOW, 
									ModuleWiseMinDateSelectionConfigurationDTO.OCTROI_INVOICE_PAYMENT_MIN_DATE);
			
			if(minDateTimeStamp != null) {
				invoiceClear 	= (ValueObject) InvoiceCertificationDao.getInstance().getOctroiAgentDetailsForOctroiClearanceAndCancelFromMinDate(executive.getAccountGroupId(), (short)0, minDateTimeStamp);
			} else {
				invoiceClear 	= (ValueObject) InvoiceCertificationDao.getInstance().getOctroiAgentDetailsForOctroiClearanceAndCancel(executive.getAccountGroupId(), (short)0);
			}
			
			
			if(invoiceClear!= null) {
				octroiAgentDetails	= (OctroiAgentMaster[]) invoiceClear.get("octroiAgentArr");
			}
			
			request.setAttribute("octroiAgentDetails", octroiAgentDetails);
			request.setAttribute("nextPageToken", "success");

		} catch (Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, ActionErrors.CATCH_ACTION_EXCEPTION_DESCRIPTION);
		} finally {
			octroiAgentDetails	= null;
			executive			= null;
			invoiceClear		= null;
			cacheManip			= null;
			minDateTimeStamp	= null;
		}
	}
}
