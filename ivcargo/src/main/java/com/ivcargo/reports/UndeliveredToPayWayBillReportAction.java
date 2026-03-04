package com.ivcargo.reports;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.dto.constant.ExecutiveTypeConstant;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.reports.UndeliveredToPayWayBillDAO;
import com.platform.dto.model.UndeliveredToPayWayBillModel;
import com.platform.resource.CargoErrorList;

public class UndeliveredToPayWayBillReportAction implements Action {

	@Override
	@SuppressWarnings("unchecked")
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	error 				= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request, error))
				return;

			new InitializeUndeliveredToPayWayBillReportAction().execute(request, response);

			final var	sdf			= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			final var	fromDate	= new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00").getTime());
			final var	toDate		= new Timestamp(sdf.parse(JSPUtility.GetString(request, "toDate") + " 23:59:59").getTime());
			var   	branchId 				= 0L;
			var   	subRegionId 			= 0L;

			final var	objectIn   = new ValueObject();
			final var	cacheManip = new CacheManip(request);

			final var	executive	= cacheManip.getExecutive(request);

			// Get the Selected  Combo values
			final var	selectedSubRegion  =  JSPUtility.GetLong(request, "subRegion", 0);

			//Get all Branches
			request.setAttribute("branches", cacheManip.getBothTypeOfBranchesDetails(request, Long.toString(executive.getAccountGroupId()), Long.toString(selectedSubRegion)));

			if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN) {
				branchId = Long.parseLong(request.getParameter("branch"));

				if(branchId == 0) {
					subRegionId = JSPUtility.GetLong(request, "subRegion", 0);
					objectIn.put("subRegionId", subRegionId);
				}
			} else if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_EXECUTIVE || executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_BRANCHADMIN || executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_LIMITED)
				branchId = executive.getBranchId();

			objectIn.put("branchId", branchId);
			objectIn.put("executive", executive);
			objectIn.put("fromDate", fromDate);
			objectIn.put("toDate", toDate);

			final var	objectOut = UndeliveredToPayWayBillDAO.getInstance().getReportForBranch(objectIn);

			final var	hashMap = (HashMap<String, UndeliveredToPayWayBillModel>) objectOut.get("Collection");

			request.setAttribute("branchId", branchId);
			request.setAttribute("subRegionId", subRegionId);

			if(hashMap != null && hashMap.size() > 0) {
				request.setAttribute("Collection", hashMap);
				ActionStaticUtil.setReportViewModel(request);
				request.setAttribute("nextPageToken", "success");
			} else {
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}
}