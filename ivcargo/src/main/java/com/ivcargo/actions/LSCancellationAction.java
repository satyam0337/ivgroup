package com.ivcargo.actions;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.LSCancellationBLL;
import com.framework.Action;
import com.iv.constant.properties.LrViewConfigurationPropertiesConstant;
import com.iv.dto.TransportListMaster;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.properties.constant.LoadingSheetPropertyConstant;
import com.iv.utils.constant.Constant;
import com.iv.utils.constant.PodWayBillPropertiesConstant;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.DispatchLedgerDao;
import com.platform.dto.ConfigParam;
import com.platform.dto.DispatchLedger;
import com.platform.dto.Executive;
import com.platform.dto.TransportCommonMaster;
import com.platform.dto.configuration.modules.CashStatementConfigurationDTO;
import com.platform.dto.configuration.modules.GroupConfigurationPropertiesDTO;
import com.platform.dto.configuration.modules.LrCostConfigurationDTO;
import com.platform.dto.configuration.modules.LsConfigurationDTO;

public class LSCancellationAction implements Action{

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	 error 			= null;
		final var				isPendingDeliveryTableEntry	= false;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	dispatchLedgerId 	= Long.parseLong(request.getParameter("dispatchLedgerId"));
			final var	status 				= Short.parseShort(request.getParameter("status"));
			final var	isManual 			= Boolean.parseBoolean(request.getParameter("isManual"));
			final var	lHPVId 				= Long.parseLong(request.getParameter("LHPVId"));
			final var	lsNumber 			= request.getParameter("LSNumber");
			final var	lsCancellationBLL 	= new LSCancellationBLL();
			final var	valueInObj 			= new ValueObject();
			final var	cache				= new CacheManip(request);
			final var	executive			= (Executive) request.getSession().getAttribute("executive");
			final var	branchOperationLocking 			= Boolean.parseBoolean(request.getParameter("branchOperationLocking"));
			final var	dispatchLedger		= DispatchLedgerDao.getInstance().getDispatchLedgerByDispatchLedgerId(dispatchLedgerId);
			final var	lsConfiguration			= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.DISPATCH);

			final var	allowLsCancellationAfterLHPVCreation		= (boolean) lsConfiguration.getOrDefault(LoadingSheetPropertyConstant.ALLOW_LS_CANCELLATION_AFTER_LHPV_CREATION, false);

			if(!isManual && status == DispatchLedger.DISPATCHLEDGER_WAYBILL_STATUS_DISPATCHED && (lHPVId == 0 || lHPVId > 0 && allowLsCancellationAfterLHPVCreation) && lsNumber != null){ // remove compultion of status bcoz u worked it on initialize action
				valueInObj.put("dispatchLedgerId", dispatchLedgerId);
				valueInObj.put("executive", executive);
				valueInObj.put("isPendingDeliveryTableEntry", isPendingDeliveryTableEntry);
				valueInObj.put("configValueForDelivery", cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_DELIVERY_ACCESSIBILITY));
				valueInObj.put("deliveryLocationList", cache.getAssignedLocationsIdListByLocationIdId(request, executive.getBranchId(), executive.getAccountGroupId()));
				valueInObj.put("branchesColl", cache.getGenericBranchesDetail(request));
				valueInObj.put("locationMapping", cache.getLocationMappingDetailsByAssignedLocationId(request,executive.getAccountGroupId(), dispatchLedger.getDestinationBranchId()));
				valueInObj.put(LrCostConfigurationDTO.LR_COST_CONFIGURATION, cache.getGroupWiseLRCostConfiguration(request, executive.getAccountGroupId()));
				valueInObj.put("lhpvId",lHPVId);
				valueInObj.put(PodWayBillPropertiesConstant.POD_CONFIGURATION, cache.getPODWayBillConfiguration(request, executive.getAccountGroupId()));
				valueInObj.put(CashStatementConfigurationDTO.CASH_STATEMENT_CONFIGURATION, cache.getCashStatementConfiguration(request, executive.getAccountGroupId()));
				valueInObj.put("LSNumber", lsNumber);
				valueInObj.put(Constant.BRANCH_ID, executive.getBranchId());
				valueInObj.put("moduleId", ModuleIdentifierConstant.DISPATCH);
				valueInObj.put(GroupConfigurationPropertiesDTO.BRANCH_OPERATION_LOCKING, branchOperationLocking);
				valueInObj.put(GroupConfigurationPropertiesDTO.GROUP_CONFIGURATION, cache.getGroupConfiguration(request, executive.getAccountGroupId()));
				valueInObj.put(TransportListMaster.TRANSPORT_LIST, cache.getTransportList(request));
				valueInObj.put(LsConfigurationDTO.LS_CONFIGURATION, lsConfiguration);
				valueInObj.put(LrViewConfigurationPropertiesConstant.LR_VIEW_CONFIGURATION_PROPERTY, cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.LR_SEARCH));
				valueInObj.put(LoadingSheetPropertyConstant.ALLOW_LS_CANCELLATION_AFTER_LHPV_CREATION, allowLsCancellationAfterLHPVCreation);

				if(lsCancellationBLL.cancelLS(valueInObj))
					response.sendRedirect("TransportSearchWayBillAction.do?pageId=5&eventId=3&wayBillId="+dispatchLedgerId+"&wayBillNumber="+lsNumber+"&TypeOfNumber="+TransportCommonMaster.LS_SEARCH_TYPE_ID+"&BranchId="+0+"&CityId="+0+"&searchBy="+"");
			}
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}
}
