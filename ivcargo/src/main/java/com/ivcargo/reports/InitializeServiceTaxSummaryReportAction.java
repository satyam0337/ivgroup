package com.ivcargo.reports;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.properties.impl.PropertyConfigValueBLLImpl;
import com.framework.Action;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionInstanceUtil;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.platform.dto.Executive;
import com.platform.dto.PropertiesFileConstants;
import com.platform.dto.configuration.report.account.ServiceTaxSummaryReportConfigurationDTO;
import com.platform.utils.PropertiesUtility;

public class InitializeServiceTaxSummaryReportAction implements Action{

	public void execute(HttpServletRequest request, HttpServletResponse response) {
		// TODO Auto-generated method stub
		HashMap<String,Object>				error 							= null;
		Executive							executive						= null;
		ActionInstanceUtil 					actionUtil2 					= null;
		PropertyConfigValueBLLImpl 			propertyConfigValueBLLImpl 		= null;
		ValueObject 						configuration 					= null;
		boolean								showBkgTotalAmt					= false;
		boolean								showDlyTotalAmt					= false;
		boolean								showBillTotalAmt				= false;
		
		try {
			
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error)){
				return;
			}
			
			executive 						= ActionStaticUtil.getExecutive(request);
			propertyConfigValueBLLImpl 		= new PropertyConfigValueBLLImpl();
			configuration					= new ValueObject();
			
			configuration 					= propertyConfigValueBLLImpl.getConfiguration(executive, PropertiesFileConstants.SERVICE_TAX_SUMMARY_REPORT_CONFIG);
			
			showBkgTotalAmt					= PropertiesUtility.isAllow(configuration.get(ServiceTaxSummaryReportConfigurationDTO.ST_SUMMARY_REPORT_SHOW_BKG_TOTAL_AMT) + "");
			showDlyTotalAmt					= PropertiesUtility.isAllow(configuration.get(ServiceTaxSummaryReportConfigurationDTO.ST_SUMMARY_REPORT_SHOW_DLY_TOTAL_AMT) + "");
			showBillTotalAmt				= PropertiesUtility.isAllow(configuration.get(ServiceTaxSummaryReportConfigurationDTO.ST_SUMMARY_REPORT_SHOW_BILL_TOTAL_AMT) + "");
			

			request.setAttribute(ActionStaticUtil.IS_ALL_REGION_NEED_TO_SHOW, false);
			request.setAttribute(ActionStaticUtil.IS_ALL_AREA_NEED_TO_SHOW, true);
			request.setAttribute(ActionStaticUtil.IS_ALL_BRANCHES_NEED_TO_SHOW, true);	
			request.setAttribute("showBkgTotalAmt", showBkgTotalAmt);	
			request.setAttribute("showDlyTotalAmt", showDlyTotalAmt);	
			request.setAttribute("showBillTotalAmt", showBillTotalAmt);	

			ActionStepsUtil.setInitializeBranchesSelectionInRequest(request, executive);
			ActionStepsUtil.setExecutiveCoreReportPermissionsInRequest(request, executive);

			actionUtil2 = new ActionInstanceUtil();
			actionUtil2.setExecutiveTypeBooleanInRequest(request, executive, true);

			ActionStaticUtil.setNextPageToken(request, ActionStaticUtil.SUCCESS);
			
		} catch (Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		} finally {
			error 		= null;
			executive	= null;
			actionUtil2 = null;
		}
	}
}