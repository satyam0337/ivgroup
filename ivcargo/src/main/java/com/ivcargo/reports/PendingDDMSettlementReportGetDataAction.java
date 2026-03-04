package com.ivcargo.reports;
import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.PendingDDMSettlementReportBLL;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.CustomGroupMapper;
import com.platform.dto.Executive;
import com.platform.dto.configuration.mindateselection.ReportWiseMinDateSelectionConfigurationDTO;

public class PendingDDMSettlementReportGetDataAction implements Action{

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {

		HashMap<String,Object>	 				error 					= null;
		Executive        						executive      			= null;
		String 									branchIds				= null;
		long 									srcBranchId				= 0;
		PendingDDMSettlementReportBLL      		pendingDDMSettlementdataBLL= null;
		CacheManip								cache					= null;
		ValueObject 							valueInobject 			= null;
		SimpleDateFormat						sdf             		= null;
		Timestamp								fromDate        		= null;
		Timestamp								toDate          		= null;
		ValueObject								valueobjectfromBLL		= null;
		Timestamp								minDateTimeStamp		= null;
		boolean									isViewAllData			= false;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializePendingDDMSettlementReportAction().execute(request, response);

			cache		  = new CacheManip(request);
			executive	  = cache.getExecutive(request);

			minDateTimeStamp	= cache.getReportWiseMinDateToGetData(request, executive.getAccountGroupId(),
					ReportWiseMinDateSelectionConfigurationDTO.PENDING_DDM_SETTLEMENT_REPORT_MIN_DATE_ALLOW,
					ReportWiseMinDateSelectionConfigurationDTO.PENDING_DDM_SETTLEMENT_REPORT_MIN_DATE);

			sdf           	= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			fromDate      	= new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00.000").getTime());
			toDate        	= new Timestamp(sdf.parse(JSPUtility.GetString(request, "toDate") + " 23:59:59.998").getTime());

			if(request.getParameter("viewAll") != null)
				isViewAllData = true;

			valueInobject = new ValueObject();

			ActionStaticUtil.executiveTypeWiseBranches(request, cache, executive);

			branchIds		= ActionStaticUtil.getPhysicalBranchIds1(request, cache, executive);

			if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_GROUPADMIN || executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_REGIONADMIN || executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_SUBREGIONADMIN)
				srcBranchId = Long.parseLong(request.getParameter("branch"));
			else
				srcBranchId = executive.getBranchId();

			valueInobject.put("branchesColl", cache.getGenericBranchesDetail(request));

			valueInobject.put("fromDate", fromDate);
			valueInobject.put("toDate", toDate);
			valueInobject.put("accountGroupId", executive.getAccountGroupId());
			valueInobject.put("branchIds", branchIds);
			valueInobject.put("minDateTimeStamp", minDateTimeStamp);
			valueInobject.put("isViewAllData", isViewAllData);

			pendingDDMSettlementdataBLL 	= new PendingDDMSettlementReportBLL();
			valueobjectfromBLL 				= pendingDDMSettlementdataBLL.getPendingDDMSettlementData(valueInobject);

			request.setAttribute("delRunSheetLedgerWiseReportHM", valueobjectfromBLL.get("delRunSheetLedgerWiseReportHM"));
			request.setAttribute("totalAmt", valueobjectfromBLL.get("totalAmt"));
			ActionStaticUtil.setRequestAttribute(request,"customAddressBranchId", srcBranchId);
			ActionStaticUtil.setRequestAttribute(request,"customAddressIdentifer", CustomGroupMapper.IDENTIFIER_DELIVERY);
			ActionStaticUtil.setReportViewModel(request);

			request.setAttribute("nextPageToken", "success");

		}catch (final Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		} finally {
			error 					= null;
			executive      			= null;
			branchIds				= null;
			pendingDDMSettlementdataBLL=null;
			cache					= null;
			valueInobject 			= null;
			sdf             		= null;
			fromDate        		= null;
			toDate          		= null;
			valueobjectfromBLL		= null;
			minDateTimeStamp		= null;
		}
	}
}