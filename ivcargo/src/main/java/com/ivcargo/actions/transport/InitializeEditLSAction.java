package com.ivcargo.actions.transport;

import java.util.Arrays;

//~--- non-JDK imports --------------------------------------------------------

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.properties.impl.PropertyConfigValueBLLImpl;
import com.framework.Action;
import com.iv.dto.constant.ExecutiveTypeConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.properties.constant.LoadingSheetPropertyConstant;
import com.iv.utils.DateTime.DateTimeUtility;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.DispatchArticleDetailsDao;
import com.platform.dao.DispatchSummaryDao;
import com.platform.dto.DispatchArticleDetails;
import com.platform.dto.Executive;
import com.platform.dto.PropertiesFileConstants;
import com.platform.dto.configuration.modules.LsConfigurationDTO;
import com.platform.dto.model.WayBillReceivableModel;

public class InitializeEditLSAction implements Action {

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	 					error 							= null;
		var										isAllowToDeleteAllLR			= false;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	executive		= (Executive) request.getSession().getAttribute("executive");

			final var	dispatchLedgerId = Long.parseLong(request.getParameter("dispatchLedgerId"));

			final var	wayBillModels					= DispatchSummaryDao.getInstance().getReceivablesWaybillDetailsByDispatchLedgerForTansport(dispatchLedgerId, executive.getAccountGroupId());
			final var	dispatchArticlDetailsArrayHM 	= DispatchArticleDetailsDao.getInstance().getDispatchArticleDetailsByDispatchLegerId(dispatchLedgerId);

			final var	lsEditConfig		= PropertyConfigValueBLLImpl.getInstance().getConfiguration(executive, PropertiesFileConstants.LS_LOAD_CONFIG);
			final var	isChargedWeightShow	= lsEditConfig.getBoolean(LsConfigurationDTO.IS_CHARGED_WEIGHT_SHOW,false);

			if(wayBillModels != null && !wayBillModels.isEmpty()) {
				isAllowToDeleteAllLR	= wayBillModels.size() < dispatchArticlDetailsArrayHM.size();

				final var	cacheManip = new CacheManip(request);
				final var lsConfiguration		= cacheManip.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.DISPATCH);
				final var validateEditLSTimeLimit 	= (boolean) lsConfiguration.getOrDefault(LoadingSheetPropertyConstant.VALIDATE_EDIT_LS_TIME_LIMIT, false);
				final var maxHoursForEditLS			= (int) lsConfiguration.getOrDefault(LoadingSheetPropertyConstant.MAX_HOURS_FOR_EDIT, 0);
				final var dispatchTripDateTimeStamp = wayBillModels.get(0).getTripDateTime();

				for (final WayBillReceivableModel wayBillModel : wayBillModels) {
					final var	dispatchArticleDetailsArray = dispatchArticlDetailsArrayHM.get(wayBillModel.getWayBillId());
					final var	totalQuantity = Arrays.asList(dispatchArticleDetailsArray).stream().map(DispatchArticleDetails::getQuantity).mapToLong(Long::longValue).sum();

					wayBillModel.setDispatchedQuantity((int)totalQuantity);
					wayBillModel.setSourceBranch(cacheManip.getGenericBranchDetailCache(request, wayBillModel.getSourceBranchId()).getName());

					if(wayBillModel.getDestinationBranchId() > 0)
						wayBillModel.setDestinationBranch(cacheManip.getGenericBranchDetailCache(request, wayBillModel.getDestinationBranchId()).getName());
					else
						wayBillModel.setDestinationBranch(wayBillModel.getDeliveryPlace());
				}

				request.setAttribute("wayBillModels", wayBillModels.toArray(new WayBillReceivableModel[wayBillModels.size()]));

				if(validateEditLSTimeLimit && executive.getExecutiveType() != ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN) {
					final var hoursObj =  DateTimeUtility.getDayDiffBetweenTwoDatesInHoursAndMinutes(dispatchTripDateTimeStamp, DateTimeUtility.getCurrentTimeStamp());
					final var dayDiff  = hoursObj.getLong("diffHours", 0);

					request.setAttribute("isAllowToEditLS", dayDiff <= maxHoursForEditLS);
					request.setAttribute("messageStr", "Cannot Edit LS after " + maxHoursForEditLS + " hrs. Contact Head Office.");
				}
			}

			request.setAttribute("isAllowToDeleteAllLR", isAllowToDeleteAllLR);
			request.setAttribute("nextPageToken", "success");
			request.setAttribute("isChargedWeightShow", isChargedWeightShow);
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}
	}

}