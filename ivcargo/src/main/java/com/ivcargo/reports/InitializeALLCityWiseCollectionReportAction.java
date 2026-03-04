package com.ivcargo.reports;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.dto.constant.BusinessFunctionConstants;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.utils.constant.Constant;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.Region;
import com.platform.dto.configuration.report.collection.AllCityWiseCollectionReportConfigurationDTO;

public class InitializeALLCityWiseCollectionReportAction implements Action{

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		// TODO Auto-generated method stub
		HashMap<String,Object>	 error 	= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	cache		= new CacheManip(request);
			final var	executive = ActionStaticUtil.getExecutive(request);

			if(executive == null) {
				ActionStaticUtil.throwInvalidSessionError(request, error);
				return;
			}

			if(!ActionStaticUtil.isAllowToAccessOperation(error, cache, request, BusinessFunctionConstants.ALL_CITY_WISE_COLLECTION_REPORT_NEW, BusinessFunctionConstants.PERMISSION_TYPE_REPORT)) {
				request.setAttribute(Constant.IS_ALLOW_TO_ACCESS_REPORT, false);
				return;
			}

			var	regions 						= cache.getRegionsByGroupId(request, executive.getAccountGroupId());
			final var	configuration					= ReadAllConfigurationsBllImpl.getInstance().getOldReportConfigurationData(ReportIdentifierConstant.ALL_CITY_WISE_COLLECTION_REPORT, executive.getAccountGroupId());
			final var	showRegionSelection				= configuration.getBoolean(AllCityWiseCollectionReportConfigurationDTO.SHOW_REGION_SELECTION);
			final var	regionArrNew					= new Region[regions.length + 1];

			for(var i = 0; i < regions.length; i++)
				regionArrNew[i]	= regions[i];

			final var	region		= new Region();

			region.setName(Constant.INPUT_ALL_VALUE);
			region.setRegionId(Constant.INPUT_ALL_ID_ZERO);

			regionArrNew[regionArrNew.length - 1]	= region;

			regions		= regionArrNew;

			request.setAttribute("regions", regions);

			request.setAttribute(AllCityWiseCollectionReportConfigurationDTO.SHOW_REGION_SELECTION, showRegionSelection);
			request.setAttribute("nextPageToken", "success");

		} catch (final Exception _e) {
			ActionStaticUtil.catchActionException(request, _e, error);
		}
	}

}