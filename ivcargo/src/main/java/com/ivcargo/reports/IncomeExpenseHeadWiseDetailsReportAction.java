package com.ivcargo.reports;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.IncomeExpenseHeadwiseDetailsReportBLL;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.dto.constant.FeildPermissionsConstant;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.message.Message;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.CustomGroupMapper;
import com.platform.dto.Executive;
import com.platform.dto.configuration.report.incomeexpense.IncomeExpenseHeadwiseDetailsReportConfigurationDTO;
import com.platform.resource.CargoErrorList;

public class IncomeExpenseHeadWiseDetailsReportAction implements Action {

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	 				error 					= null;
		var	srcBranchId = 0L;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeIncomeExpenseHeadWiseDetailsReportAction().execute(request, response);

			final var	valueInobject = new ValueObject();
			final var	cache = new CacheManip(request);
			final var	executive = cache.getExecutive(request);

			ActionStaticUtil.executiveTypeWiseSelection1(request, cache, executive);

			if(request.getParameter("headId") != null){
				final var	headValue = Short.parseShort(request.getParameter("headId")) ;
				final var	sdf			= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
				final var	fromDate	= new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00").getTime());
				final var	toDate		= new Timestamp(sdf.parse(JSPUtility.GetString(request, "toDate") + " 23:59:59").getTime());
				final var	incExpbll   = new IncomeExpenseHeadwiseDetailsReportBLL();
				final var	incExpType	= JSPUtility.GetInt(request, "IncExpType", 0);
				final var	chargeType	= JSPUtility.GetInt(request, "chargeType", 0);

				ActionStaticUtil.executiveTypeWiseBranches(request, cache, executive);

				final var execFldPermissionsHM 	= cache.getExecutiveFieldPermission(request);
				final var branchId 				= JSPUtility.GetLong(request, "branch", 0);
				final var configuration			= ReadAllConfigurationsBllImpl.getInstance().getOldReportConfigurationData(ReportIdentifierConstant.INCOME_EXPENSE_HEADWISE_DETAIL, executive.getAccountGroupId());
				final var customErrorOnOtherBranchDetailSearch	= configuration.getBoolean(IncomeExpenseHeadwiseDetailsReportConfigurationDTO.CUSTOM_ERROR_ON_OTHER_BRANCH_DETAIL_SEARCH, false);

				final var	branchIds		= ActionStaticUtil.getPhysicalBranchIds1(request, cache, executive);

				if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_GROUPADMIN || executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_REGIONADMIN || executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_SUBREGIONADMIN)
					srcBranchId = Long.parseLong(request.getParameter("branch"));
				else
					srcBranchId = executive.getBranchId();

				valueInobject.put("fromDate", fromDate);
				valueInobject.put("headid", headValue);
				valueInobject.put("toDate", toDate);
				valueInobject.put("branchesColl", cache.getGenericBranchesDetail(request));
				valueInobject.put("executive", executive);
				valueInobject.put("incExpType", incExpType);
				valueInobject.put("chargeType", chargeType);
				valueInobject.put("srcBranchId",branchIds);
				valueInobject.put("vehicleNumberMasterHM", cache.getALLVehicleNumberOfGroup(request, executive.getAccountGroupId()));
				valueInobject.put("isAllowToSearchAllBranchReportData",execFldPermissionsHM != null && execFldPermissionsHM.containsKey(FeildPermissionsConstant.ALLOW_TO_SEARCH_ALL_BRANCH_REPORT_DATA));

				final var	valueoutObject = incExpbll.getIncomeExpenseHeadWiseDetailReport(valueInobject);

				if(valueoutObject.containsKey(Message.MESSAGE)) {
					if(customErrorOnOtherBranchDetailSearch) {
						error.put("errorCode", CargoErrorList.OTHER_BRANCH_REPORT_DATA_SEARCH_ERROR);

						if(branchId > 0)
							error.put("errorDescription", "Kindly Contact Source Branch For Report");
						else
							error.put("errorDescription", "Kindly Contact Respective Branches For Report");
					} else {
						error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
						error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
					}

					request.setAttribute("cargoError", error);
				} else if(valueoutObject.get("incExpNBookedSt") != null || valueoutObject.get("incExpCancSt")!= null) {
					request.setAttribute("incExpNBookedSt", valueoutObject.get("incExpNBookedSt"));
					request.setAttribute("incExpCancSt", valueoutObject.get("incExpCancSt"));
					request.setAttribute("showLRNumer", valueoutObject.get("showLRNumer"));
					request.setAttribute("showConsignorName", valueoutObject.get("showConsignorName"));
					request.setAttribute("showConsigneeName", valueoutObject.get("showConsigneeName"));
					request.setAttribute("showVehicleNumber", valueoutObject.get("showVehicleNumber"));
					request.setAttribute("showVehicleAgentName", valueoutObject.get("showVehicleAgentName"));
				} else {
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
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}
}