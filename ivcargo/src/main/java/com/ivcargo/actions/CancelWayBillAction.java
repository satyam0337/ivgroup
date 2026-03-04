package com.ivcargo.actions;

//~--- non-JDK imports --------------------------------------------------------

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.WayBillBll;
import com.businesslogic.properties.GeneralConfiguration;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.constant.properties.GeneralConfigurationPropertiesConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.logsapp.LogWriter;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.WayBillDao;
import com.platform.dto.ConfigParam;
import com.platform.dto.Executive;
import com.platform.dto.WayBillTaxDetails;
import com.platform.dto.configuration.modules.BankStatementConfigurationDTO;
import com.platform.dto.configuration.modules.LrCostConfigurationDTO;
import com.platform.dto.constant.CargoAccountGroupConstant;
import com.platform.dto.constant.WayBillStatusConstant;
import com.platform.resource.CargoErrorList;

public class CancelWayBillAction implements Action {
	public static final String TRACE_ID = "CancelWayBillAction";
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	error 	= null;
		var	centerlizeCancelltaion  = false;
		var	isPendingDeliveryTableEntryAtBooking = false;
		short	configValueOfPDS	= 0;

		try {

			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error))
				return;


			final var        wayBillId    			= JSPUtility.GetLong(request, "wayBillId", 0);
			centerlizeCancelltaion			= JSPUtility.GetBoolean(request,"centerlizeCancelltaion");
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_DEBUG, "centerlizeCancelltaion-->"+centerlizeCancelltaion);
			final var 	isWayBillStatusExist 	= WayBillDao.getInstance().checkWayBillStatus(wayBillId, WayBillStatusConstant.WAYBILL_STATUS_CANCELLED);
			final List<Integer> 	adminCancelGroup	= Arrays.asList(CargoAccountGroupConstant.ACCOUNT_GROUP_ID_NEETA_TRAVELS,
					CargoAccountGroupConstant.ACCOUNT_GROUP_ID_ACE_TRANS,
					CargoAccountGroupConstant.ACCOUNTGORUPID_SHREE_RISHABH_TRAVELS,
					CargoAccountGroupConstant.ACCOUNTGORUPID_KUMAR_TRAVELS, 	
					CargoAccountGroupConstant.ACCOUNT_GROUP_ID_SAHAJANAND,
					CargoAccountGroupConstant.ACCOUNT_GORUP_ID_GUJRAT_TRAVELS,
					CargoAccountGroupConstant.ACCOUNT_GORUP_ID_ROYAL_EXPRESS,
					CargoAccountGroupConstant.ACCOUNT_GORUP_ID_SUGAMA_TRAVELS,
					CargoAccountGroupConstant.ACCOUNT_GROUP_ID_FALCON_CARGO,
					CargoAccountGroupConstant.ACCOUNT_GROUP_ID_ASHA_TRAVELS,
					CargoAccountGroupConstant.ACCOUNT_GORUP_ID_SOUTHERN,
					CargoAccountGroupConstant.ACCOUNT_GROUP_ID_ANAND,
					CargoAccountGroupConstant.ACCOUNT_GROUP_ID_KONDUSKAR_S_R_TRAVELS
					); 	
			//If WayBill already cancelled
			if(!isWayBillStatusExist){

				final var wayBillSourceBranchId    = JSPUtility.GetLong(request, "wayBillSourceBranchId", 0);
				final var cancelForExecutiveId  = JSPUtility.GetLong(request, "cancelForExecutive", 0);
				final var cancellationCharge = JSPUtility.GetDouble(request, "cancellationCharge",0);
				final var remark       = JSPUtility.GetString(request, "remark", "");
				final var cancelRemark = JSPUtility.GetString(request, "cancelRemark");
				final var cache		 = new CacheManip(request);
				final var inValObj     = new ValueObject();
				var		isServiceTaxReport	= false;
				var		isCreditorOutStandingSummaryReport	= false;

				final var executive = cache.getExecutive(request);

				final var	generalConfiguration			 	= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.GENERAL_CONFIGURATION);
				final var	isPendingPaymentModule			= (boolean) generalConfiguration.getOrDefault(GeneralConfiguration.IS_PENDING_PAYMENT_MODULE, false);

				if(executive.getBranchId() == wayBillSourceBranchId 
						|| executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_GROUPADMIN 
						&& (adminCancelGroup.contains((int) executive.getAccountGroupId())||centerlizeCancelltaion)
						){	
					inValObj.put("wayBillId", wayBillId);
					inValObj.put("cancellationCharge", cancellationCharge);
					inValObj.put("remark", remark + " # :" + cancelRemark);
					inValObj.put("cancelForExecutiveId", cancelForExecutiveId);
					inValObj.put("executive",executive);
					inValObj.put("adminCancelGroup",adminCancelGroup);
					inValObj.put("centerlizeCancelltaion",centerlizeCancelltaion);
					inValObj.put("isPendingPaymentModule", isPendingPaymentModule);

					if(cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_SERVICE_TAX_REPORT) == ConfigParam.CONFIG_KEY_VALUE_SERVICE_TAX_REPORT_ALLOWED)
						isServiceTaxReport = true;
					inValObj.put("isServiceTaxReport",isServiceTaxReport);

					if(cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_CREDITOR_OUTSTANDING_SUMMARY_REPORT) == ConfigParam.CONFIG_KEY_VALUE_CREDITOR_OUTSTANDING_SUMMARY_REPORT_ALLOWED)
						isCreditorOutStandingSummaryReport = true;
					inValObj.put("isCreditorOutStandingSummaryReport",isCreditorOutStandingSummaryReport);

					configValueOfPDS = cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_PENDING_DELIVERY_STOCK_TABLE_ENTRY_AT_BOOKING_LEVEL);
					if(configValueOfPDS > 0)
						isPendingDeliveryTableEntryAtBooking = true;

					inValObj.put("isPendingDeliveryTableEntryAtBooking",isPendingDeliveryTableEntryAtBooking);
					inValObj.put("branchesColl", cache.getGenericBranchesDetail(request));
					inValObj.put("accountGroupTieUpConfigurationHM", cache.getAccountGroupTieUpConfiguration(request, executive.getAccountGroupId()));
					inValObj.put("configuration", cache.getGroupConfiguration(request, executive.getAccountGroupId()));
					inValObj.put(LrCostConfigurationDTO.LR_COST_CONFIGURATION, cache.getGroupWiseLRCostConfiguration(request, executive.getAccountGroupId()));
					inValObj.put(WayBillTaxDetails.WAYBILL_TYPE_WISE_SERVICE_TAX_DATE, cache.wayBillTypeWiseServiceTaxDate(request, executive.getAccountGroupId()));
					inValObj.put(BankStatementConfigurationDTO.BANK_STATEMENT_CONFIGURATION, cache.getBankStatementConfiguration(request, executive.getAccountGroupId()));
					inValObj.put(GeneralConfigurationPropertiesConstant.GENERAL_CONFIGURATION, generalConfiguration);

					final var wayBillBll = new WayBillBll();
					final var outValObj  = wayBillBll.cancelWayBill(inValObj);
					final var status     = (String) outValObj.get("status");

					if (status == "success") {
						response.sendRedirect("SearchWayBill.do?pageId=2&eventId=6&wayBillId=" + wayBillId);
						request.setAttribute("nextPageToken", "success");
						request.setAttribute("WrongWayBillId", wayBillId);
						request.setAttribute("WrongWayBillNumber", wayBillId);
					} else {
						error.put("errorCode", CargoErrorList.WRONG_WAYBILL_ERROR);
						error.put("errorDescription", CargoErrorList.WRONG_WAYBILL_ERROR_DESCRIPTION);
						request.setAttribute("cargoError", error);
						request.setAttribute("nextPageToken", "failure");
					}
				} else {
					error.put("errorCode", CargoErrorList.WRONG_CANCELLATION_ERROR);
					error.put("errorDescription", CargoErrorList.WRONG_CANCELLATION_ERROR_DESCRIPTION);
					request.setAttribute("cargoError", error);
					request.setAttribute("nextPageToken", "failure");
				}

			} else {
				LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, ""+CargoErrorList.WAYBILL_CANCELLED_ERROR_DESCRIPTION);
				error.put("errorCode", CargoErrorList.WAYBILL_CANCELLED_ERROR);
				error.put("errorDescription", CargoErrorList.WAYBILL_CANCELLED_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
				request.setAttribute("nextPageToken", "failure");
			}

		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}finally {
		}
	}
}