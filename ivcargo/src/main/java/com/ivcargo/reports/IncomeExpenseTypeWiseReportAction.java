package com.ivcargo.reports;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.IncomeExpenseTypeWiseAjaxBLL;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.constant.properties.BranchWiseIncomeExpenseDeatilsConstant;
import com.iv.dto.constant.FeildPermissionsConstant;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.message.Message;
import com.iv.utils.utility.CollectionUtility;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.CustomGroupMapper;
import com.platform.dto.Executive;
import com.platform.resource.CargoErrorList;

public class IncomeExpenseTypeWiseReportAction implements Action {

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	 		error 					= null;
		var	regionId	= 0L;
		var	subRegionId = 0L;
		var	srcBranchId = 0L;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeIncomeExpenseTypeWiseReportAction().execute(request, response);

			final var	valueInobject 	= new ValueObject();
			final var	cache 			= new CacheManip(request);
			final var	executive 		= cache.getExecutive(request);

			ActionStaticUtil.executiveTypeWiseSelection1(request, cache, executive);

			if(request.getParameter("headid") != null){
				final var	sdf			= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
				final var	fromDate	= new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00").getTime());
				final var	toDate		= new Timestamp(sdf.parse(JSPUtility.GetString(request, "toDate") + " 23:59:59").getTime());
				final var	incExpType	= Integer.parseInt(request.getParameter("IncExpType"));
				final var	chargeType	= Integer.parseInt(request.getParameter("chargeType"));

				ActionStaticUtil.executiveTypeWiseBranches(request, cache, executive);
				
				final var execFldPermissionsHM 	= cache.getExecutiveFieldPermission(request);
				final var branchWiseIncomeExpenseReportDetailsProperties = ReadAllConfigurationsBllImpl.getInstance().getReportConfigurationData(ReportIdentifierConstant.INCOME_EXPENSE_HEADWISE_REPORT, executive.getAccountGroupId());
				final var customErrorOnOtherBranchDetailSearch			 = (boolean) branchWiseIncomeExpenseReportDetailsProperties.getOrDefault(BranchWiseIncomeExpenseDeatilsConstant.CUSTOM_ERROR_ON_OTHER_BRANCH_DETAIL_SEARCH, false);
				
				final var	branchIds				= ActionStaticUtil.getPhysicalBranchIds1(request, cache, executive);
				
				if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_GROUPADMIN) {
					regionId	= Long.parseLong(request.getParameter("region"));
					subRegionId = Long.parseLong(request.getParameter("subRegion"));
					srcBranchId = Long.parseLong(request.getParameter("branch"));
				} else if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_REGIONADMIN) {
					regionId	= executive.getRegionId();
					subRegionId = Long.parseLong(request.getParameter("subRegion"));
					srcBranchId = Long.parseLong(request.getParameter("branch"));
				} else if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_SUBREGIONADMIN) {
					regionId	= executive.getRegionId();
					subRegionId = executive.getSubRegionId();
					srcBranchId = Long.parseLong(request.getParameter("branch"));
				} else {
					regionId	= executive.getRegionId();
					subRegionId = executive.getSubRegionId();
					srcBranchId = executive.getBranchId();
				}

				valueInobject.put("comaSepHeaders", CollectionUtility.getStringFromStringArray(request.getParameterValues("headid"), ","));
				valueInobject.put("fromDate", fromDate);
				valueInobject.put("toDate", toDate);
				valueInobject.put("executive", executive);
				valueInobject.put("incExpType", incExpType);
				valueInobject.put("chargeType", chargeType);
				valueInobject.put("regionId",regionId);
				valueInobject.put("subRegionId",subRegionId);
				valueInobject.put("srcBranchId",branchIds);
				valueInobject.put("isAllowToSearchAllBranchReportData",execFldPermissionsHM != null && execFldPermissionsHM.containsKey(FeildPermissionsConstant.ALLOW_TO_SEARCH_ALL_BRANCH_REPORT_DATA));

				final var	valueoutObject =  IncomeExpenseTypeWiseAjaxBLL.getInstance().getIncomeExpenseReport(valueInobject);

				if(valueoutObject != null && valueoutObject.containsKey(Message.MESSAGE)) {
					if(customErrorOnOtherBranchDetailSearch){
						error.put("errorCode", CargoErrorList.OTHER_BRANCH_REPORT_DATA_SEARCH_ERROR);
						if(srcBranchId > 0)
							error.put("errorDescription", "Kindly Contact Source Branch For Report");
						else
							error.put("errorDescription", "Kindly Contact Respective Branches For Report");

						request.setAttribute("cargoError", error);
					}else {
						error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
						error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
						request.setAttribute("cargoError", error);
					}					
				}else if(valueoutObject.get("headWiseAmtColl")!= null && valueoutObject.get("dateWiseAmtColl")!=null){
					request.setAttribute("headWiseAmtColl", valueoutObject.get("headWiseAmtColl"));
					request.setAttribute("dateWiseAmtColl", valueoutObject.get("dateWiseAmtColl"));
					request.setAttribute("dateWiseHeadColl", valueoutObject.get("dateWiseHeadColl"));
					request.setAttribute("headWiseGrandTotalColl", valueoutObject.get("headWiseGrandTotalColl"));
					request.setAttribute("dateWiseGrandTotalColl", valueoutObject.get("dateWiseGrandTotalColl"));
					request.setAttribute("finalAmountTotal", valueoutObject.get("finalAmountTotal"));
					request.setAttribute("headValues", request.getParameterValues("headid"));
				}else{
					error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
					error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
					request.setAttribute("cargoError", error);
				}
			}

			ActionStaticUtil.setRequestAttribute(request,"customAddressBranchId", srcBranchId);
			ActionStaticUtil.setRequestAttribute(request,"customAddressIdentifer", CustomGroupMapper.IDENTIFIER_BOOKING);

			ActionStaticUtil.setReportViewModel(request);
			request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}
	}
}