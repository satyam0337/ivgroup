package com.ivcargo.reports;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.BranchWiseIncExpDetailsBLL;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.constant.properties.BranchWiseIncomeExpenseDeatilsConstant;
import com.iv.dto.constant.FeildPermissionsConstant;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.message.Message;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.ExecutiveDao;
import com.platform.dto.CustomGroupMapper;
import com.platform.dto.Executive;
import com.platform.dto.TransportCommonMaster;
import com.platform.dto.configuration.report.incomeexpense.IncomeExpenseHeadwiseDetailsReportConfigurationDTO;
import com.platform.resource.CargoErrorList;

public class BranchWiseIncomeExpenseDetailsGetDataAction implements Action{

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	 			error 					= null;
		var 								srcBranchId				= 0L;
		var 								executiveId				= 0L;
		var								isExist					= false;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeBranchWiseIncomeExpenseDetailsAction().execute(request, response);

			final var	cManip 			= new CacheManip(request);
			final var	executive		= cManip.getExecutive(request);
			final var	sdf				= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			final var	fromDate		= new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00").getTime());
			final var	toDate			= new Timestamp(sdf.parse(JSPUtility.GetString(request, "toDate") + " 23:59:59").getTime());
			final var	valueInobject 	= new ValueObject();
			final var	showChargeTypeLRAndOffice 		= (boolean)request.getAttribute(BranchWiseIncomeExpenseDeatilsConstant.SHOW_CHARGE_TYPE_LR_AND_OFFICE);
			final var	doNotShowAutoCreatedVoucherData = (boolean)request.getAttribute(BranchWiseIncomeExpenseDeatilsConstant.DO_NOT_SHOW_AUTO_CREATED_VOUCHER_DATA);
			final var showBlhpvDetails = (boolean)request.getAttribute(BranchWiseIncomeExpenseDeatilsConstant.SHOW_BLHPV_DETAILS);


			ActionStaticUtil.executiveTypeWiseBranches(request, cManip, executive);

			
			final var execFldPermissionsHM 					= cManip.getExecutiveFieldPermission(request);			
			final var configuration							= ReadAllConfigurationsBllImpl.getInstance().getOldReportConfigurationData(ReportIdentifierConstant.BRANCH_WISE_INC_EXP_DETAILS, executive.getAccountGroupId());
			final var customErrorOnOtherBranchDetailSearch	= configuration.getBoolean(IncomeExpenseHeadwiseDetailsReportConfigurationDTO.CUSTOM_ERROR_ON_OTHER_BRANCH_DETAIL_SEARCH, false);
			final var isSearchDataForOwnBranchOnly			= configuration.getBoolean(IncomeExpenseHeadwiseDetailsReportConfigurationDTO.IS_SEARCH_DATA_FOR_OWN_BRANCH_ONLY, false);

			
			final var	branchIds	= ActionStaticUtil.getPhysicalBranchIds1(request, cManip, executive);

			if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_GROUPADMIN || executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_REGIONADMIN || executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_SUBREGIONADMIN) {
				srcBranchId = Long.parseLong(request.getParameter("branch"));
				executiveId = Long.parseLong(request.getParameter("executiveId"));
			} else {
				srcBranchId = executive.getBranchId();
				executiveId = executive.getExecutiveId();
			}

			if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_BRANCHADMIN)
				executiveId = Long.parseLong(request.getParameter("executiveId"));

			request.setAttribute("execs", ExecutiveDao.getInstance().findByBranchId(srcBranchId));

			valueInobject.put("branchesColl", cManip.getGenericBranchesDetail(request));
			valueInobject.put("fromDate", fromDate);
			valueInobject.put("toDate", toDate);
			valueInobject.put("selectCharge", request.getParameter("selectCharge"));
			valueInobject.put("expenseType", request.getParameter("expenseType"));
			valueInobject.put("accountGroupId", executive.getAccountGroupId());
			valueInobject.put("branchIds", branchIds);
			valueInobject.put("executiveId", executiveId);
			valueInobject.put(BranchWiseIncomeExpenseDeatilsConstant.SHOW_CHARGE_TYPE_LR_AND_OFFICE, showChargeTypeLRAndOffice);
			valueInobject.put(BranchWiseIncomeExpenseDeatilsConstant.DO_NOT_SHOW_AUTO_CREATED_VOUCHER_DATA, doNotShowAutoCreatedVoucherData);
			valueInobject.put(BranchWiseIncomeExpenseDeatilsConstant.IS_SEARCH_DATA_FOR_OWN_BRANCH_ONLY,isSearchDataForOwnBranchOnly);
			valueInobject.put("isAllowToSearchAllBranchReportData",execFldPermissionsHM != null && execFldPermissionsHM.containsKey(FeildPermissionsConstant.ALLOW_TO_SEARCH_ALL_BRANCH_REPORT_DATA));
			valueInobject.put("executive", executive);

			final var	branchwiseincexpdetailsbll 	= new BranchWiseIncExpDetailsBLL();

			final Map<Short, ValueObject>	incExpDetailsHM	= new HashMap<>();

			if(Integer.parseInt(request.getParameter("selectCharge")) == TransportCommonMaster.CHARGE_TYPE_ALL) {
				valueInobject.put("selectCharge",TransportCommonMaster.CHARGE_TYPE_INCOME+"");
				var	valueobjectfromBLL 			= branchwiseincexpdetailsbll.getBranchWiseIncExpDetails(valueInobject);
				var	dataFound					= valueobjectfromBLL.getBoolean("dataFound", true);
				isExist							= valueobjectfromBLL.containsKey(Message.MESSAGE);
				
				if(dataFound)
					incExpDetailsHM.put(TransportCommonMaster.CHARGE_TYPE_INCOME, valueobjectfromBLL);

				valueInobject.put("selectCharge",TransportCommonMaster.CHARGE_TYPE_EXPENSES+"");
				valueobjectfromBLL 			= branchwiseincexpdetailsbll.getBranchWiseIncExpDetails(valueInobject);
				
				if(isExist || !dataFound)
					isExist = valueobjectfromBLL.containsKey(Message.MESSAGE);
				
				dataFound					= valueobjectfromBLL.getBoolean("dataFound", true);

				if(dataFound)
					incExpDetailsHM.put(TransportCommonMaster.CHARGE_TYPE_EXPENSES, valueobjectfromBLL);
			} else {
				final var	valueobjectfromBLL 			= branchwiseincexpdetailsbll.getBranchWiseIncExpDetails(valueInobject);
				final var	dataFound					= valueobjectfromBLL.getBoolean("dataFound", true);
				isExist									= valueobjectfromBLL.containsKey(Message.MESSAGE);

				if(dataFound)
					incExpDetailsHM.put(Short.parseShort(request.getParameter("selectCharge")), valueobjectfromBLL);
			}

			if(showBlhpvDetails && !incExpDetailsHM.isEmpty()) {
				valueInobject.put("incExpDetailsHM", incExpDetailsHM);
				final var blhpvDatailsObj = branchwiseincexpdetailsbll.getBLHPVDetails(valueInobject);
				
				final var blhpvBookingHm 	= blhpvDatailsObj.get("blhpvBookingHm", null);
				final var blhpvCancelHm 	= blhpvDatailsObj.get("blhpvCancelHm", null);
				final var dateWiseBlhpvHm 	= blhpvDatailsObj.get("dateWiseBlhpvHm", null);
				
				request.setAttribute("blhpvBookingHm", blhpvBookingHm);
				request.setAttribute("blhpvCancelHm", blhpvCancelHm);
				request.setAttribute("dateWiseBlhpvHm", dateWiseBlhpvHm);
			}
			
			if(isExist){
				if(customErrorOnOtherBranchDetailSearch){
					error.put("errorCode", CargoErrorList.OTHER_BRANCH_REPORT_DATA_SEARCH_ERROR);
					if(srcBranchId > 0)
						error.put("errorDescription", "Kindly Contact Source Branch For Report");
					else
						error.put("errorDescription", "Kindly Contact Respective Branches For Report");
				}else {
					error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
					error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				}
				request.setAttribute("cargoError", error);
			}else {
				request.setAttribute("incExpDetailsHM", incExpDetailsHM);
				request.setAttribute("dataFound", !incExpDetailsHM.isEmpty());
			}


			ActionStaticUtil.setRequestAttribute(request,"customAddressBranchId", srcBranchId);
			ActionStaticUtil.setRequestAttribute(request,"customAddressIdentifer", CustomGroupMapper.IDENTIFIER_BOOKING);

			ActionStaticUtil.setReportViewModel(request);
			request.setAttribute("nextPageToken", "success");
		}catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}
	}
}