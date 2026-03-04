package com.ivcargo.reports;

import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.bll.utils.BookingWayBillSelectionUtility;
import com.iv.constant.properties.BookingRegisterReportConfigPropertiesConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.utils.utility.Utility;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;

public class InitializeBookingRegisterReportAction implements Action {

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>				error							= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	cache 		= new CacheManip(request);
			final var	executive 	= cache.getExecutive(request);

			request.setAttribute(ActionStaticUtil.IS_ALL_REGION_NEED_TO_SHOW, false);
			request.setAttribute(ActionStaticUtil.IS_ALL_AREA_NEED_TO_SHOW, false);
			request.setAttribute(ActionStaticUtil.IS_ALL_BRANCHES_NEED_TO_SHOW, false);

			final var	configuration				= ReadAllConfigurationsBllImpl.getInstance().getReportConfigurationData(ReportIdentifierConstant.BOOKING_REGISTER_REPORT, executive.getAccountGroupId());

			var	type				  				= (boolean) configuration.getOrDefault(BookingRegisterReportConfigPropertiesConstant.DATA_FOR_TYPE,false);
			final var	executiveWiseShowType  		= (boolean) configuration.getOrDefault(BookingRegisterReportConfigPropertiesConstant.EXECUTIVE_WISE_SHOW_TYPE,false);

			if(type && executiveWiseShowType)
				type = Utility.isIdExistInLongList(configuration, BookingRegisterReportConfigPropertiesConstant.EXECUTIVE_IDS_TO_SHOW_TYPE, executive.getExecutiveId());

			final var	billSelectionConfigHM	= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.BOOKING);

			request.setAttribute("configuration", configuration);
			request.setAttribute(BookingRegisterReportConfigPropertiesConstant.DATA_FOR_TYPE, type);
			request.setAttribute(BookingRegisterReportConfigPropertiesConstant.BOOKING_USER_NAME, (boolean) configuration.getOrDefault(BookingRegisterReportConfigPropertiesConstant.BOOKING_USER_NAME, false));
			request.setAttribute(BookingRegisterReportConfigPropertiesConstant.NET_INCOME_FORMULA, (boolean) configuration.getOrDefault(BookingRegisterReportConfigPropertiesConstant.NET_INCOME_FORMULA, false));
			request.setAttribute(BookingRegisterReportConfigPropertiesConstant.SHOW_DECLARED_VALUE, (boolean) configuration.getOrDefault(BookingRegisterReportConfigPropertiesConstant.SHOW_DECLARED_VALUE, false));
			request.setAttribute(BookingRegisterReportConfigPropertiesConstant.SHOW_SAID_TO_CONTAIN, (boolean) configuration.getOrDefault(BookingRegisterReportConfigPropertiesConstant.SHOW_SAID_TO_CONTAIN, false));
			request.setAttribute(BookingRegisterReportConfigPropertiesConstant.SHOW_INVOICE_NUMBER, (boolean) configuration.getOrDefault(BookingRegisterReportConfigPropertiesConstant.SHOW_INVOICE_NUMBER, false));
			request.setAttribute(BookingRegisterReportConfigPropertiesConstant.SHOW_CURRENT_BRANCH, (boolean) configuration.getOrDefault(BookingRegisterReportConfigPropertiesConstant.SHOW_CURRENT_BRANCH, false));
			request.setAttribute(BookingRegisterReportConfigPropertiesConstant.IS_ALLOW_CUSTOM_FONT_FOR_BOOKING_REGISTER, (boolean) configuration.getOrDefault(BookingRegisterReportConfigPropertiesConstant.IS_ALLOW_CUSTOM_FONT_FOR_BOOKING_REGISTER, false));
			request.setAttribute(BookingRegisterReportConfigPropertiesConstant.SHOW_BILL_SELECTION, (boolean) configuration.getOrDefault(BookingRegisterReportConfigPropertiesConstant.SHOW_BILL_SELECTION, false));
			request.setAttribute("billSelectionList", BookingWayBillSelectionUtility.getBillSelectionListForReport(billSelectionConfigHM, false));
			request.setAttribute(BookingRegisterReportConfigPropertiesConstant.SHOW_CONSIGNEE_MOBILE_NUMBER, (boolean) configuration.getOrDefault(BookingRegisterReportConfigPropertiesConstant.SHOW_CONSIGNEE_MOBILE_NUMBER, false));

			final Map<Short, String>	typeHM	= new HashMap<>();
			typeHM.put((short) 1, "OUTGOING");
			typeHM.put((short) 2, "INCOMING");

			request.setAttribute("typeHM", typeHM);

			ActionStepsUtil.setInitializeBranchesSelectionInRequest(request, executive);
			ActionStepsUtil.setExecutiveCoreReportPermissionsInRequest(request, executive);
			ActionStaticUtil.setExecutiveTypeBooleanInRequest(request, executive, true);
			ActionStaticUtil.setNextPageToken(request, ActionStaticUtil.SUCCESS);
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}
}