package com.ivcargo.actions;

//~--- non-JDK imports --------------------------------------------------------

import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.logsapp.LogWriter;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.WayBillDao;
import com.platform.dto.Branch;
import com.platform.dto.Executive;
import com.platform.dto.TransportCommonMaster;
import com.platform.dto.WayBill;
import com.platform.resource.CargoErrorList;

public class GetDataToUpdateVehicleTypeAction implements Action {

	public static final String TRACE_ID = "GetDataToUpdateVehicleTypeAction";

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {

		HashMap<String,Object>	 	error 					= null;
		CacheManip	cache			= null;
		String		branchIds		= null;
		Executive	executive		= null;
		String		srcBranchesStr	= null;
		String		destBranchesStr	= null;
		Branch[]	srcBranches		= null;
		Branch[]	destBranches	= null;
		WayBill		wayBill			= null;
		HashMap<Long,WayBill> wbColl= null;
		Branch		branch			= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeUpdateVehicleTypeAction().execute(request, response);

			cache		= new CacheManip(request);
			executive	= cache.getExecutive(request);
			branchIds	= cache.getBranchesString(request, executive.getAccountGroupId(), executive.getBranchId());

			final long sCity	= JSPUtility.GetLong(request, "SCity",0) ;
			final long dCity	= JSPUtility.GetLong(request, "DCity", 0);
			final long sBranch= JSPUtility.GetLong(request, "SBranch", 0);
			final long dBranch= JSPUtility.GetLong(request, "DBranch", 0);

			if(sBranch == 0)
				srcBranchesStr = cache.getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_CITY, sCity);
			else
				srcBranchesStr = ""+sBranch;

			if(dCity == 0 && dBranch == 0)
				destBranchesStr = cache.getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_GROUP, executive.getAccountGroupId());
			else if(dCity > 0 && dBranch == 0)
				destBranchesStr = cache.getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_CITY, dCity);
			else
				destBranchesStr = ""+dBranch;

			//Get all Source Branches
			srcBranches = cache.getBothTypeOfBranchesDetails(request, ""+executive.getAccountGroupId(), ""+sCity);
			request.setAttribute("srcBranches", srcBranches);

			//Get all Source Branches
			destBranches = cache.getBothTypeOfBranchesDetails(request, ""+executive.getAccountGroupId(), ""+dCity);
			request.setAttribute("destBranches", destBranches);

			if("".equals(branchIds))
				branchIds = ""+executive.getBranchId();

			wbColl = WayBillDao.getInstance().getDataForUpdateVehicleType(srcBranchesStr, destBranchesStr, executive.getAccountGroupId());

			if(wbColl != null && wbColl.size() > 0) {
				for(final Map.Entry<Long, WayBill> entry : wbColl.entrySet()) {
					wayBill	= entry.getValue();

					if(wayBill != null) {
						branch = cache.getGenericBranchDetailCache(request, wayBill.getSourceBranchId());
						wayBill.setSourceSubRegionId(branch.getSubRegionId());
						wayBill.setSourceCity(cache.getGenericSubRegionById(request, wayBill.getSourceSubRegionId()).getName());
						wayBill.setSourceBranch(branch.getName());

						branch = cache.getGenericBranchDetailCache(request, wayBill.getDestinationBranchId());
						wayBill.setDestinationSubRegionId(branch.getSubRegionId());
						wayBill.setDestinationSubRegion(cache.getGenericSubRegionById(request, wayBill.getDestinationSubRegionId()).getName());
						wayBill.setDestinationBranch(branch.getName());
					}
				}

				request.setAttribute("wbColl", wbColl);

			} else {
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO, error.get("errorCode").toString() + " " +(String) error.get("errorDescription"));
				request.setAttribute("cargoError", error);
			}

			request.setAttribute("nextPageToken", "success");

		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		} finally {
			cache			= null;
			branchIds		= null;
			executive		= null;
			srcBranchesStr	= null;
			destBranchesStr	= null;
			srcBranches		= null;
			destBranches	= null;
			wayBill			= null;
			wbColl			= null;
		}
	}
}
