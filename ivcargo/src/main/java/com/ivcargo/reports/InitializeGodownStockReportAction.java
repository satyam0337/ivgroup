package com.ivcargo.reports;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.bll.utils.BookingWayBillSelectionUtility;
import com.iv.dto.constant.ExecutiveTypeConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.properties.constant.report.GodownStockReportConfigurationConstant;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.utility.CollectionUtility;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.GodownDao;
import com.platform.dao.PackingGroupTypeMasterDao;
import com.platform.dto.WayBillType;
import com.platform.dto.configuration.master.DisplayDataConfigurationDTO;
import com.platform.dto.constant.WayBillTypeConstant;

public class InitializeGodownStockReportAction implements Action {

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String, Object>		error 						= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var 	cache 		= new CacheManip(request);
			final var	executive 	= cache.getExecutive(request);

			final var	configuration					= ReadAllConfigurationsBllImpl.getInstance().getReportConfigurationData(ReportIdentifierConstant.GODOWN_STOCK_REPORT, executive.getAccountGroupId());
			final var	showWayBillTypeSelection		= (boolean) configuration.getOrDefault(GodownStockReportConfigurationConstant.SHOW_WAY_BILL_TYPE_SELECTION, false);
			final var 	showPackingGroupSelection		= (boolean) configuration.getOrDefault(GodownStockReportConfigurationConstant.SHOW_PACKING_GROUP_SELECTION,false);

			final var	displayDataConfig				= cache.getDisplayDataConfiguration(request, executive.getAccountGroupId());
			final var	minYear							= displayDataConfig.getInt(DisplayDataConfigurationDTO.YEAR, 0);

			final var	billSelectionConfigHM	= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.BOOKING);

			if(showWayBillTypeSelection) {
				final var	wayBillTypeIdList 	= CollectionUtility.getLongListFromString(configuration.getOrDefault(GodownStockReportConfigurationConstant.WAY_BILL_TYPES, "0").toString());

				if(wayBillTypeIdList != null) {
					final List<WayBillType>	wayBillTypeList = new ArrayList<>();

					wayBillTypeIdList.stream().mapToLong(Long::valueOf).forEach((final var wayBillTypeId) -> {
						final var	wayBillType	= new WayBillType();

						wayBillType.setWayBillTypeId(wayBillTypeId);
						wayBillType.setWayBillType(WayBillTypeConstant.getWayBillTypeNameByWayBilTypeId(wayBillTypeId));
						wayBillTypeList.add(wayBillType);
					});

					request.setAttribute("wayBillTypeList", wayBillTypeList);
				}
			}

			if(showPackingGroupSelection) {
				final var	packingGroupTypeMasterArray = PackingGroupTypeMasterDao.getInstance().findAllByAccountGroupId(executive.getAccountGroupId());

				if(packingGroupTypeMasterArray != null)
					request.setAttribute("packingGroupTypeMasterArray", packingGroupTypeMasterArray);
			}

			ActionStaticUtil.setExecutiveTypeBooleanInRequest(request, executive, true);

			final var isGroupAdmin				= (boolean) request.getAttribute(ExecutiveTypeConstant.EXECUTIVE_TYPE_NAME_GROUPADMIN);
			final var isRegionAdmin				= (boolean) request.getAttribute(ExecutiveTypeConstant.EXECUTIVE_TYPE_NAME_REGIONADMIN);
			final var isSubRegionAdmin			= (boolean) request.getAttribute(ExecutiveTypeConstant.EXECUTIVE_TYPE_NAME_SUBREGIONADMIN);

			request.setAttribute(ActionStaticUtil.IS_ALL_REGION_NEED_TO_SHOW, false);
			request.setAttribute(ActionStaticUtil.IS_ALL_AREA_NEED_TO_SHOW, false);
			request.setAttribute(ActionStaticUtil.IS_ALL_BRANCHES_NEED_TO_SHOW, (boolean) configuration.getOrDefault(ActionStaticUtil.IS_ALL_BRANCHES_NEED_TO_SHOW, false) && (isGroupAdmin || isRegionAdmin || isSubRegionAdmin));
			request.setAttribute("showDownloadToExcelOption", false);
			request.setAttribute("billSelectionList", BookingWayBillSelectionUtility.getBillSelectionListForReport(billSelectionConfigHM, false));
			request.setAttribute("yearRangeList", DateTimeUtility.getYearRangeList(minYear));

			configuration.entrySet().forEach((final Map.Entry<Object, Object> entry) -> request.setAttribute(entry.getKey().toString(), entry.getValue()));

			if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_BRANCHADMIN
					|| executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_EXECUTIVE)
				request.setAttribute("GodownList", GodownDao.getInstance().getGodownList(executive.getBranchId(), executive.getAccountGroupId()));

			ActionStaticUtil.executiveTypeWiseSelection1(request, cache, executive);
			ActionStaticUtil.setExecutiveCoreReportPermissionsInRequest(request, executive);
			ActionStaticUtil.setNextPageToken(request, ActionStaticUtil.SUCCESS);
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}
}