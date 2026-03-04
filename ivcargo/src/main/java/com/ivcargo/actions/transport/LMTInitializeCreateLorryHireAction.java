package com.ivcargo.actions.transport;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.bll.tds.impl.TDSTxnDetailsBllImpl;
import com.iv.bll.utils.PaymentTypeSelectionUtility;
import com.iv.constant.properties.TDSPropertiesConstant;
import com.iv.constant.properties.tes.TruckEngagementSlipPropertiesConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.exception.ExceptionProcess;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.LorryHireSequenceCounterDao;
import com.platform.dao.VehicleAgentMasterDao;
import com.platform.dto.AliasNameConstants;
import com.platform.utils.Converter;

public class LMTInitializeCreateLorryHireAction implements Action {

	private static final String TRACE_ID = "LMTInitializeCreateLorryHireAction";

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	error 			= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	cache						= new CacheManip(request);
			final var	executive					= cache.getExecutive(request);
			final var	vtForGroup					= cache.getVehicleTypeForGroup(request, executive.getAccountGroupId());

			// Check If VehicleTypeForGroup is Missing
			if (vtForGroup  == null || vtForGroup.length <= 0)
				response.sendRedirect("SearchWayBill.do?pageId=0&eventId=1&filter=8");

			final var	configuration				= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.TRUCK_ENGAGEMENT_SLIP);

			final var	validateLorryHireSequenceCounter	= (boolean) configuration.getOrDefault(TruckEngagementSlipPropertiesConstant.VALIDATE_LORRY_HIRE_SEQUENCE_COUNTER, false);

			final HashMap<?, ?>	execFldPermissions = cache.getExecutiveFieldPermission(request);

			request.setAttribute("CityList", cache.getCityListWithName(request, executive));
			request.setAttribute("vehicleTypeForGroup", vtForGroup);
			request.setAttribute("subRegionForGroup", cache.getSubRegionsByGroupId(request, executive.getAccountGroupId()));

			if(validateLorryHireSequenceCounter) {
				var isValidSequenceCounter	= true;
				final var	lorryHireSequenceCounter = LorryHireSequenceCounterDao.getInstance().getLorryHireSequenceCounterDetail(executive.getAccountGroupId(), executive.getBranchId());

				if(lorryHireSequenceCounter == null || lorryHireSequenceCounter.getMinRange() == 0 && lorryHireSequenceCounter.getMaxRange() == 0
						|| lorryHireSequenceCounter.getNextVal() >= lorryHireSequenceCounter.getMaxRange())
					isValidSequenceCounter	= false;

				request.setAttribute("isValidSequenceCounter", isValidSequenceCounter);
			}

			final var		paymentTypeVO	= new ValueObject();
			paymentTypeVO.put("accountGroupId", executive.getAccountGroupId());
			paymentTypeVO.put(ModuleIdentifierConstant.MODULE_ID, ModuleIdentifierConstant.TRUCK_ENGAGEMENT_SLIP);
			paymentTypeVO.put("ExecutiveFeildPermission", Converter.hashMapWithDtoToHashMapConversion(execFldPermissions));
			final var	paymentTypeArr		= PaymentTypeSelectionUtility.getModuleWisePermissionBasePaymentTypeSelection(paymentTypeVO);

			final var	tdsConfiguration	= cache.getTDSConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.TRUCK_ENGAGEMENT_SLIP);

			request.setAttribute(AliasNameConstants.TDS_CHARGE_ARRAY, TDSTxnDetailsBllImpl.getTDSChargesList(tdsConfiguration));

			final var	vaForGroup	= VehicleAgentMasterDao.getInstance().getVehicleAgentDetails(executive.getAccountGroupId());

			request.setAttribute(TruckEngagementSlipPropertiesConstant.TES_CONFIGURATION, configuration);
			request.setAttribute(TruckEngagementSlipPropertiesConstant.VALIDATE_DRIVER_NAME, configuration.getOrDefault(TruckEngagementSlipPropertiesConstant.VALIDATE_DRIVER_NAME, false));
			request.setAttribute(TruckEngagementSlipPropertiesConstant.VALIDATE_MOBILE_NUMBER, configuration.getOrDefault(TruckEngagementSlipPropertiesConstant.VALIDATE_MOBILE_NUMBER, false));
			request.setAttribute("agentsForgroup", vaForGroup);
			request.setAttribute("paymentTypeArr", paymentTypeArr);
			request.setAttribute(TDSPropertiesConstant.IS_TDS_ALLOW, tdsConfiguration.getOrDefault(TDSPropertiesConstant.IS_TDS_ALLOW, false));
			request.setAttribute(TDSPropertiesConstant.IS_PAN_NUMBER_REQUIRED, tdsConfiguration.getOrDefault(TDSPropertiesConstant.IS_PAN_NUMBER_REQUIRED, false));
			request.setAttribute(TDSPropertiesConstant.IS_PAN_NUMBER_MANDETORY, tdsConfiguration.getOrDefault(TDSPropertiesConstant.IS_PAN_NUMBER_MANDETORY, false));

			request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
		}
	}
}