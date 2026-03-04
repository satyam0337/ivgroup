package com.ivcargo.actions.masters;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.ObjectUtils;

import com.framework.Action;
import com.iv.constant.properties.master.CrossingRateMasterConfigurationConstant;
import com.iv.dao.impl.crossingagent.CrossingAgentMasterDaoImpl;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.utils.utility.CollectionUtility;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.resource.CargoErrorList;

public class InitializeCrossingRateMasterAction implements Action{
	public static final String TRACE_ID = "InitializeCrossingRateMasterAction";

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,	Object>		error 						= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request, error))
				return;

			final var 	cache 			= new CacheManip(request);
			final var	executive		= cache.getExecutive(request);

			final var configuration		= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.CROSSING_RATE_MASTER);

			configuration.entrySet().forEach((final Map.Entry<Object, Object> entry) -> request.setAttribute(entry.getKey().toString(), entry.getValue()));

			final var chargeIds = (String) configuration.getOrDefault(CrossingRateMasterConfigurationConstant.CROSSING_CHARGES_IDS, null);

			if(ObjectUtils.isEmpty(chargeIds)) {
				error.put("errorCode", CargoErrorList.SYSTEM_ERROR);
				error.put("errorDescription", CargoErrorList.SYSTEM_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
				request.setAttribute("nextPageToken", "failure");
				return;
			}

			final var chargeIdArr = CollectionUtility.getLongListFromString(chargeIds);
			final Map<Long, String> chargeHashMap = new LinkedHashMap<>();

			for(final Long id : chargeIdArr)
				chargeHashMap.put(id, cache.getChargeTypeMasterById(request, id).getChargeName());

			request.setAttribute("chargeHashMap", chargeHashMap);

			ActionStaticUtil.executiveTypeWiseSelection1(request, cache, executive);

			final var	packingType 		= cache.getPackingTypeData(request, executive.getAccountGroupId());

			// Check If packingTypeForGroup are Missing
			if (ObjectUtils.isEmpty(packingType))
				response.sendRedirect("SearchWayBill.do?pageId=0&eventId=1&filter=5");

			request.setAttribute("packingType", packingType);

			final var	crossingAgent 	= CrossingAgentMasterDaoImpl.getInstance().getAllCrossingAgentDetailsByAccountGroupId(executive.getAccountGroupId());

			if(crossingAgent != null)
				request.setAttribute("crossingAgent", crossingAgent);

			request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}
}