package com.ivcargo.reports.ddmRegister;

import java.util.HashMap;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.bll.utils.BookingWayBillSelectionUtility;
import com.iv.dto.constant.BillSelectionConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.properties.constant.report.DoorDeliveryMemoRegisterRoportConfigurationConstant;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.AliasNameConstants;

public class InitializeDDMRegisterAction implements Action {

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	 	error 					= null;
		List<BillSelectionConstant> billSelectionList		= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var 	cache 				= new CacheManip(request);
			final var	executive 			= cache.getExecutive(request);

			final var	ddmConfiguration	= ReadAllConfigurationsBllImpl.getInstance().getOldReportConfigurationData(ReportIdentifierConstant.DOOR_DELIVERY_MEMO_REGISTER, executive.getAccountGroupId());
			final var	allowBillSelection	= ddmConfiguration.getBoolean(DoorDeliveryMemoRegisterRoportConfigurationConstant.ALLOW_BILL_SELECTION,false);

			if(allowBillSelection) {
				final var groupConfigValObj	= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.BOOKING);
				billSelectionList		= BookingWayBillSelectionUtility.getBillSelectionListForReport(groupConfigValObj, ddmConfiguration.getBoolean(DoorDeliveryMemoRegisterRoportConfigurationConstant.SHOW_ALL_OPTION_IN_BILL_SELECTION, false));
			}

			request.setAttribute(ActionStaticUtil.IS_BOTH_TYPE_BRANCHES_NEEDED,true);
			ActionStaticUtil.setInitializeBranchesSelectionInRequest(request, executive);
			ActionStaticUtil.setExecutiveCoreReportPermissionsInRequest(request, executive);
			ActionStaticUtil.setBranchSelectionBooleans(request, executive);

			ActionStaticUtil.setInitializeBranchesSelectionInRequest(request, executive);
			ActionStaticUtil.setExecutiveCoreReportPermissionsInRequest(request, executive);
			ActionStaticUtil.setBranchSelectionBooleans(request, executive);
			request.setAttribute(AliasNameConstants.IS_DESTINATION_TO_SHOW, false);
			request.setAttribute("billSelectionList", billSelectionList);
			request.setAttribute("isShowVehicleNumberSelection", ddmConfiguration.getBoolean(DoorDeliveryMemoRegisterRoportConfigurationConstant.IS_SHOW_VEHICLE_NUMBER_SELECTION,false));
			request.setAttribute("vehicleWiseMultipleDDMPrint", ddmConfiguration.getBoolean(DoorDeliveryMemoRegisterRoportConfigurationConstant.VEHICLE_WISE_MULTIPLE_DDM_PRINT,false));

			ActionStaticUtil.setNextPageToken(request, ActionStaticUtil.SUCCESS);
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}
}