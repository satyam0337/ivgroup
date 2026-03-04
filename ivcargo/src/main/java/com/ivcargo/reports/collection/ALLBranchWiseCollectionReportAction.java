package com.ivcargo.reports.collection;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.ALLBranchWiseCollectionBLL;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.dto.constant.ExecutiveTypeConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.properties.constant.report.AllBranchWiseCollectionReportConfigurationConstant;
import com.iv.utils.constant.Constant;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.reports.collection.initialize.InitializeALLBranchWiseCollectionReportAction;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.CustomGroupMapper;
import com.platform.dto.Executive;

public class ALLBranchWiseCollectionReportAction implements Action {

	private static final String TRACE_ID = "ALLBranchWiseCollectionReportAction";

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String, Object>		error 						= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request, error))
				return;

			final var startTime = System.currentTimeMillis();

			new InitializeALLBranchWiseCollectionReportAction().execute(request, response);

			final var	objectIn 	= new ValueObject();

			final var	fromDate	= ActionStaticUtil.getFromToDate(request, ActionStaticUtil.FROMDATE, ActionStaticUtil.FROMTIME);
			final var	toDate		= ActionStaticUtil.getFromToDate(request, ActionStaticUtil.TODATE, ActionStaticUtil.TOTIME);

			final var	cache		= new CacheManip(request);
			final var	executive   = cache.getExecutive(request);

			ActionStaticUtil.executiveTypeWiseBranches(request, cache, executive);

			var	regionId 	= JSPUtility.GetLong(request, "region", 0);
			var	subRegionId = JSPUtility.GetLong(request, "subRegion", 0);
			final var	branchId 	= JSPUtility.GetLong(request, "branch", 0);

			if(regionId == 0 && executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_REGIONADMIN)
				regionId	= executive.getRegionId();

			if(subRegionId == 0 && executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_SUBREGIONADMIN)
				subRegionId	= executive.getSubRegionId();

			objectIn.put(Constant.FROM_DATE, fromDate);
			objectIn.put(Constant.TO_DATE, toDate);
			objectIn.put(Constant.ACCOUNT_GROUP_ID, executive.getAccountGroupId());
			objectIn.put(Constant.REGION_ID, regionId);
			objectIn.put(Constant.SUB_REGION_ID, subRegionId);
			objectIn.put(Constant.BRANCH_ID, branchId);
			objectIn.put("exeType", executive.getExecutiveType());
			objectIn.put(Executive.EXECUTIVE, executive);
			objectIn.put("branchesColl", cache.getGenericBranchesDetail(request));

			final var	displayDataConfig		= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.DISPLAY_DATA_CONFIGURATION);
			final var	configuration			= ReadAllConfigurationsBllImpl.getInstance().getOldReportConfigurationData(ReportIdentifierConstant.ALL_BRANCH_WISE_COLLECTION_REPORT, executive.getAccountGroupId());


			final var	objectOut = ALLBranchWiseCollectionBLL.getInstance().getAllBranchWiseCollection(objectIn, configuration, displayDataConfig);

			if(objectOut == null) {
				ActionStaticUtil.setRequestAttribute(request, ActionStaticUtil.NO_RECORDS_FOUND, true);
				ActionStaticUtil.setReportViewModel(request);
				ActionStaticUtil.setNextPageToken(request, ActionStaticUtil.SUCCESS);
				ActionStaticUtil.getReportElapsedTime(TRACE_ID, executive, startTime);
				return;
			}

			if(objectOut.get("showSubRegionAndBranchSelection") != null) {
				final var		showDefaultAllOptnInSelectionField	= JSPUtility.GetBoolean(request, "showSubRegionAndBranchSelection", false);

				if(showDefaultAllOptnInSelectionField) {
					ActionStaticUtil.executiveTypeWiseBranches(request, cache, executive);

					if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN) {
						regionId	= JSPUtility.GetLong(request, "region", 0);
						subRegionId = JSPUtility.GetLong(request, "subRegion", 0);
					} else if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_REGIONADMIN) {
						regionId	= executive.getRegionId();
						subRegionId = JSPUtility.GetLong(request, "subRegion", 0);
					} else if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_SUBREGIONADMIN) {
						regionId	= executive.getRegionId();
						subRegionId = executive.getSubRegionId();
					}
				}
			}

			objectOut.getHtData().entrySet().forEach(e -> {
				request.setAttribute(e.getKey().toString(), e.getValue());
			});

			request.setAttribute("isLaserPrintOnly", true);
			request.setAttribute("isForAllBranch", true);
			request.setAttribute(AllBranchWiseCollectionReportConfigurationConstant.SHOW_QUANTITY_CLOUMN, configuration.getBoolean(AllBranchWiseCollectionReportConfigurationConstant.SHOW_QUANTITY_CLOUMN, false));

			ActionStaticUtil.setRequestAttribute(request,"customAddressBranchId", executive.getBranchId());
			ActionStaticUtil.setRequestAttribute(request,"customAddressIdentifer", CustomGroupMapper.IDENTIFIER_BOOKING);
			ActionStaticUtil.setReportViewModel(request);
			ActionStaticUtil.setNextPageToken(request, ActionStaticUtil.SUCCESS);
			ActionStaticUtil.getReportElapsedTime(TRACE_ID, executive, startTime);
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}
}