package com.ivcargo.reports;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.properties.constant.report.GodownStockReportConfigurationConstant;
import com.iv.utils.CollectionUtility;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.GodownDao;
import com.platform.dto.Executive;
import com.platform.dto.WayBillType;
import com.platform.dto.constant.WayBillTypeConstant;

public class InitializeDateWiseGodownStockReportAction implements Action {

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>		error 		= null;
		Executive 					executive 	= null;
		var						showWayBillTypeSelection	= false;
		List<WayBillType>     		wayBillTypeList				= null;
		WayBillType					wayBillType					= null;
		String						wayBillTypeIds				= null;
		List<Long> 					wayBillTypeIdList			= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var cache = new CacheManip(request);
			executive = cache.getExecutive(request);

			final var	configuration					= ReadAllConfigurationsBllImpl.getInstance().getReportConfigurationData(ReportIdentifierConstant.GODOWN_STOCK_REPORT, executive.getAccountGroupId());
			showWayBillTypeSelection		= (boolean) configuration.getOrDefault(GodownStockReportConfigurationConstant.SHOW_WAY_BILL_TYPE_SELECTION, false);

			if(showWayBillTypeSelection) {
				wayBillTypeIds 		= configuration.getOrDefault(GodownStockReportConfigurationConstant.WAY_BILL_TYPES, "0").toString();
				wayBillTypeIdList 	= CollectionUtility.getLongListFromString(wayBillTypeIds);

				if(wayBillTypeIdList != null) {
					wayBillTypeList = new ArrayList<>();

					for (final Long element : wayBillTypeIdList) {
						wayBillType	= new WayBillType();

						wayBillType.setWayBillTypeId(element);
						wayBillType.setWayBillType(WayBillTypeConstant.getWayBillTypeNameByWayBilTypeId(element));
						wayBillTypeList.add(wayBillType);
					}
				}
			}

			request.setAttribute(ActionStaticUtil.IS_ALL_REGION_NEED_TO_SHOW, false);
			request.setAttribute(ActionStaticUtil.IS_ALL_AREA_NEED_TO_SHOW, false);
			request.setAttribute(ActionStaticUtil.IS_ALL_BRANCHES_NEED_TO_SHOW, false);
			request.setAttribute("showWayBillTypeSelection", showWayBillTypeSelection);
			request.setAttribute("wayBillTypeList", wayBillTypeList);
			request.setAttribute("isShowToPayAmtCol", configuration.getOrDefault(GodownStockReportConfigurationConstant.IS_SHOW_TO_PAY_AMT_COL,false));

			ActionStaticUtil.executiveTypeWiseSelection3(request, cache, executive);

			if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_BRANCHADMIN
					|| executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_EXECUTIVE)
				request.setAttribute("GodownList", GodownDao.getInstance().getGodownList(executive.getBranchId(), executive.getAccountGroupId()));

			ActionStaticUtil.setExecutiveCoreReportPermissionsInRequest(request, executive);
			ActionStaticUtil.setExecutiveTypeBooleanInRequest(request, executive, true);

			request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}
}