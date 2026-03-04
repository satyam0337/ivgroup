package com.ivcargo.reports;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.ALLCityWiseCollectionBLL;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.dto.constant.ExecutiveTypeConstant;
import com.iv.utils.constant.Constant;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.Executive;
import com.platform.dto.configuration.report.collection.AllCityWiseCollectionReportConfigurationDTO;

public class ALLCityWiseCollectionReportAction implements Action {

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>								error 									= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeALLCityWiseCollectionReportAction().execute(request, response);

			final var	sdf         = new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			final var	objectIn 	= new ValueObject();
			final var	fromDate    = new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00").getTime());
			final var	toDate      = new Timestamp(sdf.parse(JSPUtility.GetString(request, "toDate") + " 23:59:59").getTime());
			final var	cache		= new CacheManip(request);
			final var	executive 	= cache.getExecutive(request);

			final var	regionId = JSPUtility.GetLong(request, "region",0);

			objectIn.put(Constant.FROM_DATE, fromDate);
			objectIn.put(Constant.TO_DATE, toDate);
			objectIn.put(Constant.ACCOUNT_GROUP_ID, executive.getAccountGroupId());
			objectIn.put(Constant.REGION_ID, regionId);
			objectIn.put(Constant.SUB_REGION_ID, executive.getSubRegionId());
			objectIn.put(Constant.BRANCH_ID, executive.getBranchId());
			objectIn.put("exeType", executive.getExecutiveType());
			objectIn.put("subregionColl",  cache.getAllSubRegions(request));
			objectIn.put(Executive.EXECUTIVE,  executive);

			final var	displayDataConfig			= cache.getDisplayDataConfiguration(request, executive.getAccountGroupId());

			if(regionId > 0)
				objectIn.put("exeType", ExecutiveTypeConstant.EXECUTIVE_TYPE_REGIONADMIN);

			final var	accountGroupHM		= cache.getAccountGroupHM(request);

			final var	objectOut 	= ALLCityWiseCollectionBLL.getInstance().getAllCityWiseCollection(objectIn, displayDataConfig, accountGroupHM);

			if(objectOut == null) {
				ActionStaticUtil.setRequestAttribute(request, ActionStaticUtil.NO_RECORDS_FOUND, true);
				ActionStaticUtil.setNextPageToken(request, ActionStaticUtil.SUCCESS);
				error.put("errorCode", ActionStaticUtil.NO_RECORDS_FOUND);
				request.setAttribute("cargoError", error);
				return;
			}

			request.setAttribute(AllCityWiseCollectionReportConfigurationDTO.SHOW_REGION_SELECTION, objectOut.get(AllCityWiseCollectionReportConfigurationDTO.SHOW_REGION_SELECTION));
			request.setAttribute("allCityWiseCollectionMap", objectOut.get("allCityWiseCollectionMap"));

			ActionStaticUtil.setReportViewModel(request);
			ActionStaticUtil.setNextPageToken(request, ActionStaticUtil.SUCCESS);
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}

	}
}