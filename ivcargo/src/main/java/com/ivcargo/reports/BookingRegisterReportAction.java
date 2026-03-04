package com.ivcargo.reports;

import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.BookingRegisterReportBLL;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.bll.impl.properties.DisplayDataConfigurationBllImpl;
import com.iv.constant.properties.BookingRegisterReportConfigPropertiesConstant;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.constant.Constant;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.message.Message;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.CustomGroupMapper;
import com.platform.resource.CargoErrorList;

public class BookingRegisterReportAction implements Action {

	@SuppressWarnings("unchecked")
	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>				error 						= 	null;
		short                               type                    	=	0;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeBookingRegisterReportAction().execute(request, response);

			final var	bookingRegisterReportBLL	= new BookingRegisterReportBLL();
			final var	valInObj 				= new ValueObject();
			final var	fromDate				= DateTimeUtility.getStartOfDayTimeStamp(JSPUtility.GetString(request, Constant.FROM_DATE));
			final var	toDate					= DateTimeUtility.getEndOfDayTimeStamp(JSPUtility.GetString(request, Constant.TO_DATE));
			final var	cacheManip				= new CacheManip(request);
			final var	executive   			= cacheManip.getExecutive(request);
			final var	execFldPermissionsHM 	= cacheManip.getExecutiveFieldPermission(request);
			final var	valObjSelection 		= ActionStaticUtil.reportSelection(request, executive);
			final var	branchId 				= (Long) valObjSelection.get("branchId");
			final var	billSelectionId			= JSPUtility.GetShort(request,"billSelectionId",(short)0);

			final var	configuration		= (Map<Object, Object>) request.getAttribute("configuration");

			final var	isAllowType = (boolean) configuration.getOrDefault(BookingRegisterReportConfigPropertiesConstant.DATA_FOR_TYPE, false);
			final var	customErrorOnOtherBranchDetailSearch = (boolean) configuration.getOrDefault(BookingRegisterReportConfigPropertiesConstant.CUSTOM_ERROR_ON_OTHER_BRANCH_DETAIL_SEARCH, false);

			if(isAllowType && request.getParameter("way") != null)
				type = Short.parseShort(request.getParameter("way"));
			else
				type = 1;

			request.setAttribute("agentName", executive.getName());

			final var	bookingCharges = cacheManip.getBookingCharges(request, executive.getBranchId());
			final var displayDataConfig	= cacheManip.getDisplayDataConfiguration(request, executive.getAccountGroupId());

			valInObj.put("branchId", branchId);
			valInObj.put("executive", executive);
			valInObj.put("execFldPermissionsHM", execFldPermissionsHM);
			valInObj.put("fromDate", fromDate);
			valInObj.put("toDate", toDate);
			valInObj.put("branchesColl", cacheManip.getGenericBranchesDetail(request));
			valInObj.put("BookingCharges", bookingCharges);
			valInObj.put("generalConfiguration", cacheManip.getGeneralConfiguration(request, executive.getAccountGroupId()));
			valInObj.put("showBranchCodeInReport", DisplayDataConfigurationBllImpl.getInstance().isDisplayBranchCode(ReportIdentifierConstant.BOOKING_REGISTER_REPORT, displayDataConfig.getHtData()));
			valInObj.put("bookingRegisterConfig", configuration);
			valInObj.put("deliveryLocationList", cacheManip.getAssignedLocationsIdListByLocationIdId(request, executive.getBranchId(), executive.getAccountGroupId()));
			valInObj.put("type", type);
			valInObj.put("displayDataConfig", displayDataConfig);
			valInObj.put("billSelectionId", billSelectionId);

			final var	valObj = bookingRegisterReportBLL.getBookingRegisterDetails(valInObj);

			if(valObj == null){
				ActionStaticUtil.setRequestAttribute(request, ActionStaticUtil.NO_RECORDS_FOUND, true);
				return;
			}
			if(valObj.containsKey(Message.MESSAGE)){
				if(customErrorOnOtherBranchDetailSearch){
					error.put("errorCode", CargoErrorList.OTHER_BRANCH_REPORT_DATA_SEARCH_ERROR);
					if(branchId > 0)
						error.put("errorDescription", "Kindly Contact Source Branch For Report");
					else
						error.put("errorDescription", "Kindly Contact Respective Branches For Report");
				}else {
					error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
					error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				}
				request.setAttribute("cargoError", error);
				return;
			}

			ActionStaticUtil.setRequestAttribute(request, "BookingRegisterModel", valObj.get("BookingRegisterModel"));
			ActionStaticUtil.setRequestAttribute(request, "autoBookedLRColl", valObj.get("autoBookedLRColl"));
			ActionStaticUtil.setRequestAttribute(request, "manualBookedLRColl", valObj.get("manualBookedLRColl"));
			ActionStaticUtil.setRequestAttribute(request, "cancelledWbCol", valObj.get("cancelledWbCol"));
			ActionStaticUtil.setRequestAttribute(request, "BookingCharges", valObj.get("BookingCharges"));

			ActionStaticUtil.setRequestAttribute(request,"auto_noOfPackages",valObj.get("auto_noOfPackages"));
			ActionStaticUtil.setRequestAttribute(request,"manual_noOfPackages",valObj.get("manual_noOfPackages"));
			ActionStaticUtil.setRequestAttribute(request,"cancel_noOfPackages",valObj.get("cancel_noOfPackages"));

			ActionStaticUtil.setRequestAttribute(request,"auto_actWgt",valObj.get("auto_actWgt"));
			ActionStaticUtil.setRequestAttribute(request,"manual_actWgt",valObj.get("manual_actWgt"));
			ActionStaticUtil.setRequestAttribute(request,"cancel_actWgt",valObj.get("cancel_actWgt"));

			ActionStaticUtil.setRequestAttribute(request,"auto_chgWgt",valObj.get("auto_chgWgt"));
			ActionStaticUtil.setRequestAttribute(request,"manual_chgWgt",valObj.get("manual_chgWgt"));
			ActionStaticUtil.setRequestAttribute(request,"cancel_chgWgt",valObj.get("cancel_chgWgt"));

			ActionStaticUtil.setRequestAttribute(request,"autototalWBChrg",valObj.get("autototalWBChrg"));
			ActionStaticUtil.setRequestAttribute(request,"manualtotalWBChrg",valObj.get("manualtotalWBChrg"));
			ActionStaticUtil.setRequestAttribute(request,"canceltotalWBChrg",valObj.get("canceltotalWBChrg"));

			request.setAttribute("chargesAllowedToView", valObj.get("chargesAllowedToView"));

			request.setAttribute("way", type);
			request.setAttribute("autoGrandTotal", valObj.get("autoGrandTotal"));
			request.setAttribute("autoSTTax", valObj.get("autoSTTax"));
			request.setAttribute("manualGrandTotal", valObj.get("manualGrandTotal"));
			request.setAttribute("manualSTTax", valObj.get("manualSTTax"));
			request.setAttribute("cancelGrandTotal", valObj.get("cancelGrandTotal"));
			request.setAttribute("cancelSTTax", valObj.get("cancelSTTax"));

			request.setAttribute("autoPaid", valObj.get("autoPaid"));
			request.setAttribute("autoTopay", valObj.get("autoTopay"));
			request.setAttribute("autoCredit", valObj.get("autoCredit"));

			request.setAttribute("manualPaid", valObj.get("manualPaid"));
			request.setAttribute("manualTopay", valObj.get("manualTopay"));
			request.setAttribute("manualCredit", valObj.get("manualCredit"));

			request.setAttribute("cancelPaid", valObj.get("cancelPaid"));
			request.setAttribute("cancelTopay", valObj.get("cancelTopay"));
			request.setAttribute("cancelCredit", valObj.get("cancelCredit"));

			request.setAttribute("cancelPaid", valObj.get("cancelPaid"));
			request.setAttribute("cancelTopay", valObj.get("cancelTopay"));
			request.setAttribute("cancelCredit", valObj.get("cancelCredit"));

			request.setAttribute("autoDeclaredvalue", valObj.get("autoDeclaredvalue"));
			request.setAttribute("manualDeclaredvalue", valObj.get("manualDeclaredvalue"));

			request.setAttribute("autoAmt", valObj.get("autoAmt"));
			request.setAttribute("manualAmt", valObj.get("manualAmt"));
			request.setAttribute("paidLoadingTotal", valObj.get("paidLoadingTotal"));
			request.setAttribute("showLHPVNumber", valObj.getBoolean("showLHPVNumber",false));
			request.setAttribute("showBookingTimeCrossingHire", valObj.getBoolean("showBookingTimeCrossingHire",false));
			request.setAttribute("showDeliveryTimeCrossingHire", valObj.getBoolean("showDeliveryTimeCrossingHire",false));
			request.setAttribute("showDeclaredValueInSummary", valObj.getBoolean("showDeclaredValueInSummary",false));
			request.setAttribute("showChargeWeightInSummary", valObj.getBoolean("showChargeWeightInSummary",false));
			request.setAttribute("showActualWeightInSummary", valObj.getBoolean("showActualWeightInSummary",false));
			request.setAttribute("showSourceAndDestinationColumn", valObj.getBoolean("showSourceAndDestinationColumn",false));
			request.setAttribute("showBillingPartyName", valObj.getBoolean("showBillingPartyName",false));
			request.setAttribute("showGstOrServiceTax", valObj.getBoolean("showGstOrServiceTax",false));

			ActionStaticUtil.setRequestAttribute(request,"customAddressBranchId", branchId);
			ActionStaticUtil.setRequestAttribute(request,"customAddressIdentifer", CustomGroupMapper.IDENTIFIER_BOOKING);

			if (valObj.get("accountGroupNameForPrint")!= null&& valObj.get("chargesAllowedToView")!= null)
				request.setAttribute("chargesAllowedToView",valObj.get("chargesAllowedToView"));

			ActionStaticUtil.setReportViewModel(request);
			ActionStaticUtil.setNextPageToken(request, ActionStaticUtil.SUCCESS);
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}
}