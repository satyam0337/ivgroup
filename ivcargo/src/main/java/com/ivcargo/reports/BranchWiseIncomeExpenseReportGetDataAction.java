package com.ivcargo.reports;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.bll.impl.reports.incomeexpense.BranchWiseIncomeExpenseReportGetDataBllImpl;
import com.iv.dto.constant.FeildPermissionsConstant;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.utils.constant.Constant;
import com.iv.utils.message.Message;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.CustomGroupMapper;
import com.platform.dto.Executive;
import com.platform.dto.configuration.report.incomeexpense.IncomeExpenseHeadwiseDetailsReportConfigurationDTO;
import com.platform.resource.CargoErrorList;

public class BranchWiseIncomeExpenseReportGetDataAction implements Action{
	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	 							error 					= null;
		var 												srcBranchId				= 0L;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeBranchWiseIncomeExpenseReportAction().execute(request, response);
			final var	cManip 		  = new CacheManip(request);
			final var	executive	  = cManip.getExecutive(request);
			final var	sdf           = new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			final var	fromDate      = new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00").getTime());
			final var	toDate        = new Timestamp(sdf.parse(JSPUtility.GetString(request, "toDate") + " 23:59:59").getTime());
			final var	valueInobject = new HashMap<>();

			ActionStaticUtil.executiveTypeWiseBranches(request, cManip, executive);

			final var execFldPermissionsHM 	= cManip.getExecutiveFieldPermission(request);
			final var	configuration = ReadAllConfigurationsBllImpl.getInstance().getReportConfigurationData(ReportIdentifierConstant.BRANCH_WISE_INC_EXP_SUMMARY, executive.getAccountGroupId());

			final var customErrorOnOtherBranchDetailSearch	= (boolean) configuration.getOrDefault(IncomeExpenseHeadwiseDetailsReportConfigurationDTO.CUSTOM_ERROR_ON_OTHER_BRANCH_DETAIL_SEARCH, false);

			final var	branchIds	= ActionStaticUtil.getPhysicalBranchIds1(request, cManip, executive);

			if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_GROUPADMIN || executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_REGIONADMIN || executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_SUBREGIONADMIN)
				srcBranchId = Long.parseLong(request.getParameter("branch"));
			else
				srcBranchId = executive.getBranchId();

			valueInobject.put(Constant.FROM_DATE, fromDate);
			valueInobject.put(Constant.TO_DATE, toDate);
			valueInobject.put("selectCharge", request.getParameter("selectCharge"));
			valueInobject.put("expenseType", request.getParameter("expenseType"));
			valueInobject.put(Constant.ACCOUNT_GROUP_ID, executive.getAccountGroupId());
			valueInobject.put("branchIds", branchIds);
			valueInobject.put(Constant.EXECUTIVE_BRANCH_ID, executive.getBranchId());
			valueInobject.put("isAllowToSearchAllBranchReportData", execFldPermissionsHM != null && execFldPermissionsHM.containsKey(FeildPermissionsConstant.ALLOW_TO_SEARCH_ALL_BRANCH_REPORT_DATA));

			final var	branchWiseIncomeExpenseReportGetDataBLL 	= new BranchWiseIncomeExpenseReportGetDataBllImpl();
			final var	valueobjectfromBLL 							= branchWiseIncomeExpenseReportGetDataBLL.getBranchWiseIncomeExpenseReportGetDataBLL(valueInobject, configuration);

			if(valueobjectfromBLL.containsKey(Message.MESSAGE)) {
				if(customErrorOnOtherBranchDetailSearch) {
					error.put("errorCode", CargoErrorList.OTHER_BRANCH_REPORT_DATA_SEARCH_ERROR);

					if(srcBranchId > 0)
						error.put("errorDescription", "Kindly Contact Source Branch For Report");
					else
						error.put("errorDescription", "Kindly Contact Respective Branches For Report");
				} else {
					error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
					error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				}

				request.setAttribute("cargoError", error);
			} else {
				request.setAttribute("branchwise_income_expense_reportFromAction", valueobjectfromBLL.get("sortedDateWiseHM"));
				request.setAttribute("formParameters", valueInobject);
				request.setAttribute("sortedBranchHeaderHM", valueobjectfromBLL.get("sortedBranchHeaderHM"));
				request.setAttribute("sortedDateWiseTotalAmount", valueobjectfromBLL.get("sortedDateWiseTotalAmount"));
				request.setAttribute(Constant.FROM_DATE, fromDate);
				request.setAttribute(Constant.TO_DATE, toDate);
			}

			ActionStaticUtil.setRequestAttribute(request,"customAddressBranchId", srcBranchId);
			ActionStaticUtil.setRequestAttribute(request,"customAddressIdentifer", CustomGroupMapper.IDENTIFIER_BOOKING);

			ActionStaticUtil.setReportViewModel(request);
			request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}
}