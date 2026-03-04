package com.ivcargo.reports;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.bll.utils.BookingWayBillSelectionUtility;
import com.iv.dto.constant.BusinessFunctionConstants;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.utils.constant.Constant;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.configuration.report.LSBookingRegisterReportConfigurationDTO;

public class InitializeLSBookingRegisterReportAction implements Action {

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>				error 					 = null;

		try {
			final var	cacheManip 	= new CacheManip(request);
			error 		= ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	executive = ActionStaticUtil.getExecutive(request);

			if(executive == null) {
				ActionStaticUtil.throwInvalidSessionError(request, error);
				return;
			}

			if(!ActionStaticUtil.isAllowToAccessOperation(error, cacheManip, request, BusinessFunctionConstants.LS_BOOKING_REGISTER, BusinessFunctionConstants.PERMISSION_TYPE_REPORT)) {
				request.setAttribute(Constant.IS_ALLOW_TO_ACCESS_REPORT, false);
				return;
			}

			request.setAttribute(ActionStaticUtil.IS_ALL_REGION_NEED_TO_SHOW, true);
			request.setAttribute(ActionStaticUtil.IS_ALL_AREA_NEED_TO_SHOW, true);
			request.setAttribute(ActionStaticUtil.IS_ALL_BRANCHES_NEED_TO_SHOW, true);

			final var	lsRegRptconfig		= ReadAllConfigurationsBllImpl.getInstance().getOldReportConfigurationData(ReportIdentifierConstant.LS_BOOKING_REGISTER_REPORT, executive.getAccountGroupId());

			final var	showBillSelection	= lsRegRptconfig.getBoolean(LSBookingRegisterReportConfigurationDTO.SHOW_BILL_SELECTION);

			request.setAttribute(LSBookingRegisterReportConfigurationDTO.SHOW_BILL_SELECTION, showBillSelection);

			ActionStaticUtil.setInitializeBranchesSelectionInRequest(request, executive);
			ActionStaticUtil.setExecutiveCoreReportPermissionsInRequest(request, executive);
			ActionStaticUtil.setExecutiveTypeBooleanInRequest(request, executive, true);

			final var destsubRegionForGroup =cacheManip.getSubRegionsByGroupId(request, executive.getAccountGroupId());
			request.setAttribute("destsubRegionForGroup", destsubRegionForGroup);

			final var	billSelectionConfigHM	= cacheManip.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.BOOKING);

			request.setAttribute("billSelectionList", BookingWayBillSelectionUtility.getBillSelectionListForReport(billSelectionConfigHM, false));

			ActionStaticUtil.setNextPageToken(request, ActionStaticUtil.SUCCESS);
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}
}