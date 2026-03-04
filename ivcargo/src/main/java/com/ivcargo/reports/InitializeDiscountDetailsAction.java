package com.ivcargo.reports;

import java.util.ArrayList;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.utils.utility.CollectionUtility;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.platform.dao.DiscountMasterDAO;
import com.platform.dto.DiscountDetails;
import com.platform.dto.configuration.modules.DiscountDetailsReportConfigurationDTO;

public class InitializeDiscountDetailsAction implements Action{

	public static final String TRACE_ID = "InitializeDiscountDetailsAction";
	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	error 				= null;
		ArrayList<DiscountDetails>     		discountDetailsList				= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	executive = ActionStaticUtil.getExecutive(request);

			final var	configuration 					= ReadAllConfigurationsBllImpl.getInstance().getOldReportConfigurationData(ReportIdentifierConstant.DISCOUNT_DETAILS_REPORT, executive.getAccountGroupId());
			final var	showSearchByDateSelection		= configuration.getBoolean(DiscountDetailsReportConfigurationDTO.SHOW_SEARCH_BY_DATE_SELECTION);
			final var	showDiscountPercentageCol		= configuration.getBoolean(DiscountDetailsReportConfigurationDTO.SHOW_DISCOUNT_PERCENTAGE_COL);
			final var	showBookingDate					= configuration.getBoolean(DiscountDetailsReportConfigurationDTO.SHOW_BOOKING_DATE,false);

			if(showSearchByDateSelection) {
				final var	discountDateTypeIdList = CollectionUtility.getShortListFromString(configuration.getString(DiscountDetailsReportConfigurationDTO.SEARCH_BY_DATE_IDS,"0"));

				if(discountDateTypeIdList != null) {
					discountDetailsList = new ArrayList<>();

					for (final Short element : discountDateTypeIdList) {
						final var	discountDateType	= new DiscountDetails();

						discountDateType.setDiscountDateTypeId(element);
						discountDateType.setDiscountDateTypeName(DiscountDetails.getDiscountDateType(element));
						discountDetailsList.add(discountDateType);
					}
				}
			}

			request.setAttribute(ActionStaticUtil.IS_ALL_REGION_NEED_TO_SHOW, true);
			request.setAttribute(ActionStaticUtil.IS_ALL_AREA_NEED_TO_SHOW, true);
			request.setAttribute(ActionStaticUtil.IS_ALL_BRANCHES_NEED_TO_SHOW, true);
			request.setAttribute("showSearchByDateSelection", showSearchByDateSelection);
			request.setAttribute("showDiscountPercentageCol", showDiscountPercentageCol);
			request.setAttribute("discountDetailsList", discountDetailsList);
			request.setAttribute("showBookingDate", showBookingDate);
			request.setAttribute("discountTypes", DiscountMasterDAO.getInstance().getDiscountTypes());

			ActionStaticUtil.setInitializeBranchesSelectionInRequest(request, executive);
			ActionStaticUtil.setExecutiveCoreReportPermissionsInRequest(request, executive);
			ActionStaticUtil.setExecutiveTypeBooleanInRequest(request, executive, true);

			// Get DiscountTypes
			ActionStaticUtil.setNextPageToken(request, ActionStaticUtil.SUCCESS);
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}
}