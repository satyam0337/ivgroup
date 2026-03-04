package com.ivcargo.actions.truckhisabmodule;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.bll.impl.properties.TollExpensesDetailsConfigurationBllImpl;
import com.iv.dto.model.tollExpensesDetails.TollExpensesDetailsModel;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.Executive;
import com.platform.dto.configuration.mindateselection.ModuleWiseMinDateSelectionConfigurationDTO;

public class InitializeTruckHisabSettlementAction implements Action {

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String, Object> error = null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if (ActionStaticUtil.isSystemError(request, error))
				return;

			final var	cache			= new CacheManip(request);
			final var	executive	= (Executive) request.getSession().getAttribute("executive");
			final var	accountGroupWiseTollExepenseConfig	= TollExpensesDetailsConfigurationBllImpl.getInstance().getTollExpensesDetailsPropertyByAccountGroupId(executive.getAccountGroupId());

			final var	minDateTimeStamp		= cache.getModuleWiseMinDateToGetData(request, executive.getAccountGroupId(),ModuleWiseMinDateSelectionConfigurationDTO.FAST_TAG_DATA_MIN_DATE_ALLOW,ModuleWiseMinDateSelectionConfigurationDTO.FAST_TAG_DATA_MIN_DATE);

			if(accountGroupWiseTollExepenseConfig != null)
				request.setAttribute(TollExpensesDetailsModel.SHOW_FAST_TAG_TOLL_DETAILS, accountGroupWiseTollExepenseConfig.getOrDefault(TollExpensesDetailsModel.SHOW_FAST_TAG_TOLL_DETAILS, false));

			request.setAttribute("minDateTimeStamp", minDateTimeStamp != null ? minDateTimeStamp.getTime() : null);
			request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}
}

