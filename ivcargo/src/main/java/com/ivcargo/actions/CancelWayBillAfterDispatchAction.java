package com.ivcargo.actions;

//~--- non-JDK imports --------------------------------------------------------
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.WayBillBll;
import com.businesslogic.properties.GeneralConfiguration;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.constant.properties.GeneralConfigurationPropertiesConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.WayBillDao;
import com.platform.dto.ConfigParam;
import com.platform.dto.WayBill;
import com.platform.dto.WayBillTaxDetails;
import com.platform.dto.configuration.modules.LrCostConfigurationDTO;
import com.platform.dto.constant.CargoAccountGroupConstant;
import com.platform.dto.constant.ExecutiveTypeConstant;
import com.platform.resource.CargoErrorList;

public class CancelWayBillAfterDispatchAction implements Action {
	public static final String TRACE_ID = "CancelWayBillAfterDispatchAction";
	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {

		HashMap<String,Object>	error 	= null;
		ValueObject				groupConfig							= null;

		try {

			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var        wayBillId    			= JSPUtility.GetLong(request, "wayBillId", 0);
			final var 	isWayBillStatusExist 	= WayBillDao.getInstance().checkWayBillStatus(wayBillId, WayBill.WAYBILL_STATUS_CANCELLED);

			//If WayBill already cancelled
			if(!isWayBillStatusExist){

				final var        wayBillSourceBranchId   = JSPUtility.GetLong(request, "wayBillSourceBranchId", 0);
				final var		wayBillExecutiveId		= JSPUtility.GetLong(request, "wayBillExecutiveId",0);
				final var        cancelForExecutiveId  	= JSPUtility.GetLong(request, "cancelForExecutive", 0);
				final var        dispatchLedgerId  		= JSPUtility.GetLong(request, "dispatchLedgerId", 0);
				final var         dispatchLedgerWbCount 	= JSPUtility.GetInt(request, "dispatchLedgerWayBillCount", 0);
				final var      cancellationCharge 		= JSPUtility.GetDouble(request, "cancellationCharge",0);
				final var      remark       			= JSPUtility.GetString(request, "remark", "");
				final var      cancelRemark 			= JSPUtility.GetString(request, "cancelRemark");
				final var inValObj     			= new ValueObject();
				final var	cache					= new CacheManip(request);
				var		isServiceTaxReport		= false;
				var		isCreditorOutStandingSummaryReport   = false;
				var		isPendingDeliveryTableEntryAtBooking = false;
				short		configValueOfPDS		= 0;
				final var executive 	= cache.getExecutive(request);
				groupConfig					= cache.getGroupConfiguration(request, executive.getAccountGroupId());

				if(executive.getBranchId() == wayBillSourceBranchId || executive.getExecutiveId() == wayBillExecutiveId
						|| executive.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNTGORUPID_KUMAR_TRAVELS
						&& executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN
						|| executive.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNT_GORUP_ID_SUGAMA_TRAVELS
						&& executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN
						|| executive.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNT_GROUP_ID_FALCON_CARGO
						){	// plz also chk in WayBillBll.cancelWayBillAfterDispatch
					inValObj.put("wayBillId", wayBillId);
					inValObj.put("cancellationCharge", cancellationCharge);
					inValObj.put("remark", remark + " # :" + cancelRemark);
					inValObj.put("cancelForExecutiveId", cancelForExecutiveId);
					inValObj.put("executive",executive);
					inValObj.put("dispatchLedgerId",dispatchLedgerId);
					inValObj.put("dispatchLedgerWbCount",dispatchLedgerWbCount);

					isServiceTaxReport = cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_SERVICE_TAX_REPORT) == ConfigParam.CONFIG_KEY_VALUE_SERVICE_TAX_REPORT_ALLOWED;

					inValObj.put("isServiceTaxReport",isServiceTaxReport);

					isCreditorOutStandingSummaryReport = cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_CREDITOR_OUTSTANDING_SUMMARY_REPORT) == ConfigParam.CONFIG_KEY_VALUE_CREDITOR_OUTSTANDING_SUMMARY_REPORT_ALLOWED;

					inValObj.put("isCreditorOutStandingSummaryReport",isCreditorOutStandingSummaryReport);

					configValueOfPDS = cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_PENDING_DELIVERY_STOCK_TABLE_ENTRY_AT_BOOKING_LEVEL);

					if(configValueOfPDS > 0)
						isPendingDeliveryTableEntryAtBooking = true;

					inValObj.put("isPendingDeliveryTableEntryAtBooking",isPendingDeliveryTableEntryAtBooking);
					inValObj.put("branchesColl", cache.getGenericBranchesDetail(request));
					inValObj.put("configuration", groupConfig);
					inValObj.put(LrCostConfigurationDTO.LR_COST_CONFIGURATION, cache.getGroupWiseLRCostConfiguration(request, executive.getAccountGroupId()));
					inValObj.put(WayBillTaxDetails.WAYBILL_TYPE_WISE_SERVICE_TAX_DATE, cache.wayBillTypeWiseServiceTaxDate(request, executive.getAccountGroupId()));

					final var	generalConfiguration			 	= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.GENERAL_CONFIGURATION);

					inValObj.put("isPendingPaymentModule", generalConfiguration.getOrDefault(GeneralConfiguration.IS_PENDING_PAYMENT_MODULE, false));
					inValObj.put(GeneralConfigurationPropertiesConstant.GENERAL_CONFIGURATION, generalConfiguration);

					final var  wayBillBll = new WayBillBll();
					final var outValObj  = wayBillBll.cancelWayBillAfterDispatch(inValObj);
					final var      status     = (String) outValObj.get("status");

					if ("success".equals(status)) {
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
				error.put("errorCode", CargoErrorList.WAYBILL_CANCELLED_ERROR);
				error.put("errorDescription", CargoErrorList.WAYBILL_CANCELLED_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
				request.setAttribute("nextPageToken", "failure");
			}
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}
	}

}