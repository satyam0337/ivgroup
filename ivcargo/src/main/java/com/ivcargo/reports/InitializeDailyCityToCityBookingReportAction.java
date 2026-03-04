package com.ivcargo.reports;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.properties.constant.report.DailyCityToCityBookingReportConfigurationConstant;
import com.iv.utils.constant.Constant;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.Region;

public class InitializeDailyCityToCityBookingReportAction implements Action {

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>				error				 = null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	cache				= new CacheManip(request);
			final var	executive 			= cache.getExecutive(request);
			final var	configuration 		= ReadAllConfigurationsBllImpl.getInstance().getReportConfigurationData(ReportIdentifierConstant.DAILY_CITY_TO_CITY_BOOKING_REPORT, executive.getAccountGroupId());
			final var	showDateRange		= (boolean) configuration.getOrDefault(DailyCityToCityBookingReportConfigurationConstant.SHOW_DATE_RANGE,false);
			final var	confValObj 			= cache.getCommonReportsConfiguration(request, executive.getAccountGroupId());
			final var	wayBillTypeResult 	= cache.getAllWayBillType(request);
			var	regions 			= cache.getRegionsByGroupId(request, executive.getAccountGroupId());
			final var	regionArrNew		= new Region[regions.length + 1];

			for(var i = 0; i < regions.length; i++)
				regionArrNew[i]	= regions[i];

			final var	region		= new Region();

			region.setName(Constant.INPUT_ALL_VALUE);
			region.setRegionId(Constant.INPUT_ALL_ID_ZERO);

			regionArrNew[regionArrNew.length - 1]	= region;

			regions		= regionArrNew;

			request.setAttribute("regions", regions);

			request.setAttribute("wayBillTypeAll", wayBillTypeResult);
			request.setAttribute("nextPageToken", "success");
			request.setAttribute("confValObj", confValObj);
			request.setAttribute("showDateRange", showDateRange);
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}
}
