package com.ivcargo.reports;


import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringUtils;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.properties.constant.report.DailyCityToCityDispatchReportConfigurationConstant;
import com.iv.utils.constant.Constant;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.reports.DailyCityToCityDispatchReportDAO;
import com.platform.dto.Executive;
import com.platform.dto.SubRegion;
import com.platform.dto.model.DailyCityToCityDispatchReportModel;
import com.platform.dto.model.ReportViewModel;
import com.platform.resource.CargoErrorList;

public class DailyCityToCityDispatchReportAction implements Action{

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>					error 					= null;
		Timestamp       						toDate          		= null;
		Map<String, Double>						srcCityData				= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeDailyCityToCityDispatchReportAction().execute(request, response);

			final var	objectIn 		= new ValueObject();
			final var	sdf    			= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			final var	executive 		= (Executive)request.getSession().getAttribute(Executive.EXECUTIVE);
			final var	fromDate        = new Timestamp(sdf.parse(JSPUtility.GetString(request, Constant.FROM_DATE) + " 00:00:00").getTime());

			if(JSPUtility.GetString(request, Constant.TO_DATE, null) != null)
				toDate      = new Timestamp(sdf.parse(JSPUtility.GetString(request, Constant.TO_DATE) + " 23:59:59").getTime());
			else
				toDate      = new Timestamp(sdf.parse(JSPUtility.GetString(request, Constant.FROM_DATE) + " 23:59:59").getTime());

			final var	wayBillTypeId 	= JSPUtility.GetLong(request, "WayBillType");
			final var	selectId 		= JSPUtility.GetShort(request, "Select", (short) 0);
			final var	cache			= new CacheManip(request);

			final var	configuration 				= ReadAllConfigurationsBllImpl.getInstance().getReportConfigurationData(ReportIdentifierConstant.DAILY_CITY_TO_CITY_DISPATCH_REPORT, executive.getAccountGroupId());
			final var	showAccountGroupCodeWithDestBranchNameForMergingData	= (boolean) configuration.getOrDefault(DailyCityToCityDispatchReportConfigurationConstant.SHOW_ACCOUNT_GROUP_CODE_WITH_DEST_BRANCH_NAME_FOR_MERGING_DATA,false);

			objectIn.put(Constant.FROM_DATE, fromDate);
			objectIn.put(Constant.TO_DATE, toDate);
			objectIn.put(Constant.ACCOUNT_GROUP_ID, executive.getAccountGroupId());
			objectIn.put(Constant.WAY_BILL_TYPE_ID, wayBillTypeId);
			objectIn.put("selectId", selectId);

			final var	objectOut = DailyCityToCityDispatchReportDAO.getInstance().getReportData(objectIn);

			final var	reportModel = (DailyCityToCityDispatchReportModel[])objectOut.get("reportModel");

			if(reportModel != null && reportModel.length > 0){
				final var	subRegionData	= cache.getAllSubRegions(request);
				final var	accountGroupHM	= cache.getAccountGroupHM(request);

				final Map<String, Map<String, Double>>	destCityData		= new LinkedHashMap<>();
				final List<String>	srcSubRegionList	= new ArrayList<>();
				final Map<String, Double>	srcCityGrandData	= new HashMap<>();

				for(final DailyCityToCityDispatchReportModel dctc : reportModel) {
					final var	srcSubRegion		= (SubRegion) subRegionData.get(dctc.getSourceSubRegionId());
					final var	destSubRegion		= (SubRegion) subRegionData.get(dctc.getDestinationSubRegionId());
					String		destSubRegionName	= null;

					if(dctc.getGrandTotal() > 0 && !srcSubRegionList.contains(srcSubRegion.getName()))
						srcSubRegionList.add(srcSubRegion.getName());

					if(destSubRegion != null && showAccountGroupCodeWithDestBranchNameForMergingData && executive.getAccountGroupId() != destSubRegion.getAccountGroupId()) {
						final var	destAccountGroup	= accountGroupHM.get(destSubRegion.getAccountGroupId());
						destSubRegionName	= destSubRegion.getName() + " (" + StringUtils.upperCase(destAccountGroup.getAccountGroupCode()) + ")";
					} else
						destSubRegionName	= destSubRegion.getName();

					srcCityData	= destCityData.get(destSubRegionName);

					if(srcCityData == null) {
						srcCityData	= new LinkedHashMap<>();

						srcCityData.put(srcSubRegion.getName(), dctc.getGrandTotal());
						destCityData.put(destSubRegionName, srcCityData);
					} else if(srcCityData.get(srcSubRegion.getName()) != null)
						srcCityData.put(srcSubRegion.getName(), dctc.getGrandTotal() + srcCityData.get(srcSubRegion.getName()));
					else
						srcCityData.put(srcSubRegion.getName(), dctc.getGrandTotal() + 0.0);

					if(srcCityGrandData.get(srcSubRegion.getName()) != null)
						srcCityGrandData.put(srcSubRegion.getName(), dctc.getGrandTotal() + srcCityGrandData.get(srcSubRegion.getName()));
					else
						srcCityGrandData.put(srcSubRegion.getName(), dctc.getGrandTotal());
				}

				var	reportViewModel = new ReportViewModel();
				reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);

				request.setAttribute("ReportViewModel",reportViewModel);
				request.setAttribute("srcSubRegionList", srcSubRegionList);
				request.setAttribute("destCityData", destCityData);
				request.setAttribute("srcCityData", srcCityData);
				request.setAttribute("srcCityGrandData", srcCityGrandData);
				request.setAttribute("nextPageToken", Constant.SUCCESS);
			} else {
				error.put(CargoErrorList.ERROR_CODE, CargoErrorList.REPORT_NOTFOUND);
				error.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute(CargoErrorList.CARGO_ERROR, error);
			}
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}
}