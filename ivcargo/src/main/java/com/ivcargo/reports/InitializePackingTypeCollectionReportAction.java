package com.ivcargo.reports;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.dto.constant.ExecutiveTypeConstant;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.configuration.report.collection.PackingTypeCollectionReportConfigurationDTO;
import com.platform.utils.PropertiesUtility;

public class InitializePackingTypeCollectionReportAction implements Action{

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	error 				= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	cache			= new CacheManip(request);
			final var	executive 		= cache.getExecutive(request);
			final var	confValObj 		= cache.getCommonReportsConfiguration(request, executive.getAccountGroupId());

			request.setAttribute(ActionStaticUtil.IS_ALL_BRANCHES_NEED_TO_SHOW,true);
			request.setAttribute(ActionStaticUtil.IS_ALL_CITY_NEED_TO_SHOW, false);
			request.setAttribute(ActionStaticUtil.IS_ALL_AREA_NEED_TO_SHOW, false);
			request.setAttribute(ActionStaticUtil.IS_ALL_ENDBRANCH_NEED_TO_SHOW, true);
			request.setAttribute(ActionStaticUtil.IS_ALL_TO_AREA_NEED_TO_SHOW, false);
			request.setAttribute(ActionStaticUtil.IS_EXECUTIVE_NEED_TO_SHOW, true);
			request.setAttribute("confValObj", confValObj);

			ActionStaticUtil.setExecutiveCoreReportPermissionsInRequest(request, executive);

			final var	configuration 						= ReadAllConfigurationsBllImpl.getInstance().getOldReportConfigurationData(ReportIdentifierConstant.PACKING_TYPE_COLLECTION_REPORT, executive.getAccountGroupId());
			final var	displayDestinationBranchWiseData 	= PropertiesUtility.isAllow(configuration.getString(PackingTypeCollectionReportConfigurationDTO.DISPLAY_DESTINATION_BRANCH_WISE_DATA, "false"));

			ActionStaticUtil.setExecutiveTypeBooleanInRequest(request, executive, true);

			request.setAttribute(PackingTypeCollectionReportConfigurationDTO.FROM_SUBREGION_LABEL, configuration.getString(PackingTypeCollectionReportConfigurationDTO.FROM_SUBREGION_LABEL));
			request.setAttribute(PackingTypeCollectionReportConfigurationDTO.CITY_BRANCH_LABEL, configuration.getString(PackingTypeCollectionReportConfigurationDTO.CITY_BRANCH_LABEL));
			request.setAttribute(PackingTypeCollectionReportConfigurationDTO.TO_SUB_REGION_LABEL, configuration.getString(PackingTypeCollectionReportConfigurationDTO.TO_SUB_REGION_LABEL));
			request.setAttribute(PackingTypeCollectionReportConfigurationDTO.TO_BRANCH_LABEL, configuration.getString(PackingTypeCollectionReportConfigurationDTO.TO_BRANCH_LABEL));

			if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN) {
				final var	allsubregionsdataforgrouparray = cache.getSubRegionsByGroupId(request, executive.getAccountGroupId());
				request.setAttribute("subRegionForGroup", allsubregionsdataforgrouparray);
				request.setAttribute("TosubRegionForGroup", allsubregionsdataforgrouparray);
				request.setAttribute(PackingTypeCollectionReportConfigurationDTO.DISPLAY_DESTINATION_BRANCH_WISE_DATA, displayDestinationBranchWiseData);
			}

			request.setAttribute("packingType", cache.getPackingTypeDataList(request, executive.getAccountGroupId()));
			request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}
}