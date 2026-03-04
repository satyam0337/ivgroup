package com.ivcargo.reports;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.dto.constant.BusinessFunctionConstants;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.utils.constant.Constant;
import com.ivcargo.actionUtility.ActionInstanceUtil;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.SubRegion;
import com.platform.dto.configuration.report.collection.FtlCollectionReportConfigurationDTO;

public class InitializeFTLCollectionReportAction implements Action {
	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	error 			= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	executive = ActionStaticUtil.getExecutive(request);
			final var	cacheManip		= new CacheManip(request);

			if(!ActionStaticUtil.isAllowToAccessOperation(error, cacheManip, request, BusinessFunctionConstants.FTL_COLLECTION_REPORT, BusinessFunctionConstants.PERMISSION_TYPE_REPORT)) {
				request.setAttribute(Constant.IS_ALLOW_TO_ACCESS_REPORT, false);
				return;
			}

			final var	configuration	= ReadAllConfigurationsBllImpl.getInstance().getOldReportConfigurationData(ReportIdentifierConstant.FTL_COLLECTION_REPORT, executive.getAccountGroupId());

			request.setAttribute(ActionStaticUtil.IS_ALL_REGION_NEED_TO_SHOW, configuration.getBoolean(FtlCollectionReportConfigurationDTO.IS_ALL_REGION_NEED_TO_SHOW,false));
			request.setAttribute(ActionStaticUtil.IS_ALL_AREA_NEED_TO_SHOW, configuration.getBoolean(FtlCollectionReportConfigurationDTO.IS_ALL_AREA_NEED_TO_SHOW,false));
			request.setAttribute(ActionStaticUtil.IS_ALL_BRANCHES_NEED_TO_SHOW, configuration.getBoolean(FtlCollectionReportConfigurationDTO.IS_ALL_BRANCHES_NEED_TO_SHOW,false));
			request.setAttribute(FtlCollectionReportConfigurationDTO.SHOW_LS_NO_COLOUMN,configuration.getBoolean(FtlCollectionReportConfigurationDTO.SHOW_LS_NO_COLOUMN,false));
			request.setAttribute(FtlCollectionReportConfigurationDTO.SHOW_TUR_NO_COLOUMN,configuration.getBoolean(FtlCollectionReportConfigurationDTO.SHOW_TUR_NO_COLOUMN,false));
			request.setAttribute(FtlCollectionReportConfigurationDTO.SHOW_LHPV_NO_COLOUMN,configuration.getBoolean(FtlCollectionReportConfigurationDTO.SHOW_LHPV_NO_COLOUMN,false));
			request.setAttribute(FtlCollectionReportConfigurationDTO.SHOW_BLHPV_NO_COLOUMN,configuration.getBoolean(FtlCollectionReportConfigurationDTO.SHOW_BLHPV_NO_COLOUMN,false));
			request.setAttribute(FtlCollectionReportConfigurationDTO.SHOW_INVOICE_NO_COLOUMN,configuration.getBoolean(FtlCollectionReportConfigurationDTO.SHOW_INVOICE_NO_COLOUMN,false));
			request.setAttribute(FtlCollectionReportConfigurationDTO.SHOW_CONSIGNOR_NAME_COLOUMN,configuration.getBoolean(FtlCollectionReportConfigurationDTO.SHOW_CONSIGNOR_NAME_COLOUMN,false));
			request.setAttribute(FtlCollectionReportConfigurationDTO.SHOW_CONSIGNEE_NAME_COLOUMN,configuration.getBoolean(FtlCollectionReportConfigurationDTO.SHOW_CONSIGNEE_NAME_COLOUMN,false));
			request.setAttribute(FtlCollectionReportConfigurationDTO.SHOW_LORRY_HIRE_AMOUNT_COLOUMN,configuration.getBoolean(FtlCollectionReportConfigurationDTO.SHOW_LORRY_HIRE_AMOUNT_COLOUMN,false));
			request.setAttribute(FtlCollectionReportConfigurationDTO.SHOW_FREIGHT_AMOUNT_COLOUMN,configuration.getBoolean(FtlCollectionReportConfigurationDTO.SHOW_FREIGHT_AMOUNT_COLOUMN,false));

			request.setAttribute(FtlCollectionReportConfigurationDTO.SHOW_ACTUAL_WEIGHT_COLOUMN,configuration.getBoolean(FtlCollectionReportConfigurationDTO.SHOW_ACTUAL_WEIGHT_COLOUMN,false));
			request.setAttribute(FtlCollectionReportConfigurationDTO.SHOW_CHARGE_WEIGHT_COLOUMN,configuration.getBoolean(FtlCollectionReportConfigurationDTO.SHOW_CHARGE_WEIGHT_COLOUMN,false));
			request.setAttribute(FtlCollectionReportConfigurationDTO.SHOW_CR_DATE_COLOUMN,configuration.getBoolean(FtlCollectionReportConfigurationDTO.SHOW_CR_DATE_COLOUMN,false));
			request.setAttribute(FtlCollectionReportConfigurationDTO.SHOW_AMOUNT_RECEIVED_COLOUMN,configuration.getBoolean(FtlCollectionReportConfigurationDTO.SHOW_AMOUNT_RECEIVED_COLOUMN,false));
			request.setAttribute(FtlCollectionReportConfigurationDTO.SHOW_PAYMENT_DETAIL_COLOUMN,configuration.getBoolean(FtlCollectionReportConfigurationDTO.SHOW_PAYMENT_DETAIL_COLOUMN,false));
			request.setAttribute(FtlCollectionReportConfigurationDTO.SHOW_VEHICLE_NO_COLOUMN,configuration.getBoolean(FtlCollectionReportConfigurationDTO.SHOW_VEHICLE_NO_COLOUMN,false));
			request.setAttribute(FtlCollectionReportConfigurationDTO.SHOW_DRIVER_NO_COLOUMN,configuration.getBoolean(FtlCollectionReportConfigurationDTO.SHOW_DRIVER_NO_COLOUMN,false));
			request.setAttribute(FtlCollectionReportConfigurationDTO.SHOW_POD_UPLOAD_STATUS_COLOUMN,configuration.getBoolean(FtlCollectionReportConfigurationDTO.SHOW_POD_UPLOAD_STATUS_COLOUMN,false));
			request.setAttribute(FtlCollectionReportConfigurationDTO.SHOW_POD_NUMBER_COLOUMN,configuration.getBoolean(FtlCollectionReportConfigurationDTO.SHOW_POD_NUMBER_COLOUMN,false));
			request.setAttribute(FtlCollectionReportConfigurationDTO.SHOW_POD_RECEIVED_STATUS_COLOUMN,configuration.getBoolean(FtlCollectionReportConfigurationDTO.SHOW_POD_RECEIVED_STATUS_COLOUMN,false));
			request.setAttribute(FtlCollectionReportConfigurationDTO.SHOW_POD_RECEIVED_NAME_COLOUMN,configuration.getBoolean(FtlCollectionReportConfigurationDTO.SHOW_POD_RECEIVED_NAME_COLOUMN,false));
			request.setAttribute(FtlCollectionReportConfigurationDTO.SHOW_POD_RECEIVED_DATE_COLOUMN,configuration.getBoolean(FtlCollectionReportConfigurationDTO.SHOW_POD_RECEIVED_DATE_COLOUMN,false));

			ActionStepsUtil.setInitializeBranchesSelectionInRequest(request, executive);
			ActionStepsUtil.setExecutiveCoreReportPermissionsInRequest(request, executive);

			final var	actionUtil2 = new ActionInstanceUtil();
			actionUtil2.setExecutiveTypeBooleanInRequest(request, executive, true);

			final var	subRegion = cacheManip.getSubRegionsByGroupId(request, executive.getAccountGroupId());

			final var	subRegionNameHM = new HashMap<>();

			for (final SubRegion element : subRegion)
				subRegionNameHM.put(element.getSubRegionId(), element.getName());

			request.setAttribute("getSubRegionByBranchId", subRegionNameHM);
			ActionStaticUtil.setNextPageToken(request, ActionStaticUtil.SUCCESS);
		} catch (final Exception _e) {
			ActionStaticUtil.catchActionException(request, _e, error);
		}
	}
}
