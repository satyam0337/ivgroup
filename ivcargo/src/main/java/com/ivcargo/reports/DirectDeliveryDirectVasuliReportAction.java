package com.ivcargo.reports;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.TimeZone;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.logsapp.LogWriter;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.reports.DirectDeliveryDirectVasuliDAO;
import com.platform.dto.Branch;
import com.platform.dto.ConfigParam;
import com.platform.dto.Executive;
import com.platform.dto.SubRegion;
import com.platform.dto.WayBillType;
import com.platform.dto.model.BusinessFunctionConstants;
import com.platform.dto.model.DirectDeliveryDirectVasuliReportModel;
import com.platform.resource.CargoErrorList;

public class DirectDeliveryDirectVasuliReportAction implements Action {

	private static final String TRACE_ID = "DirectDeliveryDirectVasuliReportAction";

	CacheManip	cache	= null;
	
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		// TODO Auto-generated method stub

		HashMap<String,Object>	error 			= null;
		SubRegion[] subRegionForGroup  			= null;
		HashMap<Long, Branch> subRegionBranches = null;
		long 		regionId    				= 0;
		long 		subRegionId    				= 0;
		long 		srcBranchId					= 0;
		Executive 	executive 					= (Executive)request.getSession().getAttribute("executive");
		Branch		branch 						=  null;
		
		
		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error)){
				return;
			}

			cache 						= new CacheManip(request);
			
			long startTime = System.currentTimeMillis();
			new InitializeDirectDeliveryDirectVasuliReportAction().execute(request, response);

			ValueObject valueInObject  = new ValueObject();
			// Get the Selected Combo values
			if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_GROUPADMIN){
				regionId = Long.parseLong(request.getParameter("region"));
				subRegionId = Long.parseLong(request.getParameter("subRegion"));
				srcBranchId = Long.parseLong(request.getParameter("branch"));

				// Get Combo values to restore
				subRegionForGroup = cache.getSubRegionsByRegionId(request, regionId, executive.getAccountGroupId());
				subRegionBranches = cache.getBranchesBySubRegionId(request,executive.getAccountGroupId(), subRegionId);
				request.setAttribute("subRegionForGroup", subRegionForGroup);
				request.setAttribute("subRegionBranches", subRegionBranches);
			}else if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_REGIONADMIN){
				regionId = executive.getRegionId();
				subRegionId = Long.parseLong(request.getParameter("subRegion"));
				srcBranchId = Long.parseLong(request.getParameter("branch"));
				// Get Combo values to restore
				subRegionForGroup = cache.getSubRegionsByRegionId(request, regionId, executive.getAccountGroupId());
				subRegionBranches = cache.getBranchesBySubRegionId(request,executive.getAccountGroupId(), subRegionId);
				request.setAttribute("subRegionForGroup", subRegionForGroup);
				request.setAttribute("subRegionBranches", subRegionBranches);
			}else if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_SUBREGIONADMIN){
				regionId = executive.getRegionId();
				subRegionId = executive.getSubRegionId();
				srcBranchId = Long.parseLong(request.getParameter("branch"));
				// Get Combo values to restore
				subRegionBranches = cache.getBranchesBySubRegionId(request,executive.getAccountGroupId(), subRegionId);
				request.setAttribute("subRegionBranches", subRegionBranches);
			}else{
				regionId = executive.getRegionId();
				subRegionId = executive.getSubRegionId();
				srcBranchId = executive.getBranchId();
			}

			//Get all Branches
			//branches = cManip.getBothTypeOfBranchesDetails(request, ""+executive.getAccountGroupId(), ""+selectedCity);
			//request.setAttribute("branches", branches);

			ValueObject valueOutObject = null;

			valueInObject.put("regionId", regionId);
			valueInObject.put("subRegionId", subRegionId);
			valueInObject.put("srcBranchId", srcBranchId);
			valueInObject.put("executive", executive);

			valueOutObject = DirectDeliveryDirectVasuliDAO.getInstance().getDirectDeliveryDirectVasuliData(valueInObject);
			DirectDeliveryDirectVasuliReportModel[] reportModel = (DirectDeliveryDirectVasuliReportModel[])valueOutObject.get("ReportModel");

			/*ReportViewModel reportViewModel = new ReportViewModel();
			reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);
			request.setAttribute("ReportViewModel",reportViewModel);*/

			if(reportModel != null){

				ArrayList<Long> wayBillAccessibility	= new ArrayList<Long>();
				StringBuffer 	wayBillForBT 			= new StringBuffer();
				short 			configValue 			= cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_DISPATCH_ACCESSIBILITY);

				for (int i = 0; i < reportModel.length; i++) {
					wayBillAccessibility = wayBillAccessibility(request, reportModel[i],configValue,wayBillAccessibility,executive);

					branch	= cache.getGenericBranchDetailCache(request,reportModel[i].getWayBillSourceBranchId());
					reportModel[i].setWayBillSourceBranch(branch.getName());
					reportModel[i].setWayBillSourceSubRegionId(branch.getSubRegionId());


					branch	= cache.getGenericBranchDetailCache(request,reportModel[i].getWayBillDestinationBranchId());
					reportModel[i].setWayBillDestinationBranch(branch.getName());
					reportModel[i].setWayBillDestinationSubRegionId(branch.getSubRegionId());

					
					if(reportModel[i].getWayBillDestinationBranchId() > 0) {
						reportModel[i].setWayBillDestinationBranch(cache.getGenericBranchDetailCache(request,reportModel[i].getWayBillDestinationBranchId()).getName());
					}/*else {
						reportModel[i].setWayBillDestinationBranch("");
					}*/

					WayBillType wayBillType = cache.getWayBillTypeById(request, reportModel[i].getWayBillTypeId());
					if(reportModel[i].isManual()){
						reportModel[i].setWayBillType(wayBillType.getWayBillType()+WayBillType.WAYBILL_TYPE_MANUAL);
					}else{
						reportModel[i].setWayBillType(wayBillType.getWayBillType());
					}

					wayBillForBT.append(""+reportModel[i].getWayBillId());
					if(i != reportModel.length-1){
						wayBillForBT.append(",");
					}
				}

				request.setAttribute("WayBillAccessibility", wayBillAccessibility);
				request.setAttribute("ReportData", reportModel);
				ActionStaticUtil.setReportViewModel(request);
				request.setAttribute("nextPageToken", "success");

				SimpleDateFormat dateFormatForTimeLog =new SimpleDateFormat("mm:ss");
				dateFormatForTimeLog.setTimeZone(TimeZone.getTimeZone("GMT"));
				LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO,"=====Report Generated "+BusinessFunctionConstants.DUEDELIVEREDWAYBILLREPORT +" "+executive.getAccountGroupId()+
						" "+executive.getBranchId()+" "+executive.getExecutiveId()+" in "+dateFormatForTimeLog.format(new Date(System.currentTimeMillis()-startTime)));
			}else{
				LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO, (String) error.get("errorCode")+" "+(String) error.get("errorDescription"));
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
				request.setAttribute("nextPageToken", "success");
			}
		} catch (Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		}finally{
			error 					= null;
			subRegionForGroup  		= null;
			subRegionBranches 		= null;
			regionId    			= 0;
			subRegionId    			= 0;
			srcBranchId				= 0;
			executive 				= null;
			cache 					= null;
		}
	}

	public ArrayList<Long> wayBillAccessibility(HttpServletRequest request, DirectDeliveryDirectVasuliReportModel reportModel ,short configValue ,ArrayList<Long> wayBillAccessibility ,Executive executive){

		try {
			
			if(configValue == ConfigParam.CONFIG_KEY_DELIVERED_ACCESSIBILITY_BRANCH 
					&& reportModel.getWayBillSourceBranchId() == executive.getBranchId()) {
				wayBillAccessibility.add(reportModel.getWayBillId());
			}else if(configValue == ConfigParam.CONFIG_KEY_DELIVERED_ACCESSIBILITY_AGENCY 
					&& reportModel.getWayBillSourceAgencyId() == executive.getAgencyId()) {
				wayBillAccessibility.add(reportModel.getWayBillId());
			}else if(configValue == ConfigParam.CONFIG_KEY_DELIVERED_ACCESSIBILITY_CITY 
					&& cache.getGenericBranchDetailCache(request, reportModel.getWayBillSourceBranchId()).getCityId() == executive.getCityId()) {
				wayBillAccessibility.add(reportModel.getWayBillId());
			}
			
		} catch (Exception e) {
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, e);
		}
		
		return wayBillAccessibility;
	}
}