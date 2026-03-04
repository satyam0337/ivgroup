package com.ivcargo.reports;

import java.util.ArrayList;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.PendingDirectDeliveryDirectVasuliReportBLL;
import com.framework.Action;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.Executive;
import com.platform.dto.model.PendingDirectDeliveryDirectVasuliModel;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

public class PendingDirectDeliveryDirectVasuliReportAction implements Action {
	@Override
	@SuppressWarnings("unchecked")
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	 		error 					= null;
		Executive        				executive      			= null;
		CacheManip 						cManip 					= null;
		ValueObject                     outValueObject          = null;
		ValueObject                     inValueObject           = null;
		PendingDirectDeliveryDirectVasuliReportBLL 				pendingDDDVBLL		= null;
		HashMap<Long, PendingDirectDeliveryDirectVasuliModel>	pendingDDDVHM		= null;
		PendingDirectDeliveryDirectVasuliModel   				pendingDDDVModel	= null;

		ArrayList<Long>                 assignedLocationIdList	= null;
		String							branchIds				= null;
		long 							branchId				= 0;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializePendingDirectDeliveryDirectVasuliReportAction().execute(request, response);

			cManip 		= new CacheManip(request);
			executive	= cManip.getExecutive(request);

			final long accountGroupId 	= executive.getAccountGroupId();

			ActionStaticUtil.executiveTypeWiseBranches(request, cManip, executive);

			if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_GROUPADMIN || executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_REGIONADMIN || executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_SUBREGIONADMIN)
				branchId = Long.parseLong(request.getParameter("branch"));
			else
				branchId = executive.getBranchId();

			assignedLocationIdList = cManip.getAssignedLocationsIdListByLocationIdId(request, branchId, executive.getAccountGroupId());

			if(!assignedLocationIdList.contains(branchId))
				assignedLocationIdList.add(branchId);

			branchIds = Utility.GetLongArrayListToString(assignedLocationIdList);

			inValueObject = new ValueObject();
			inValueObject.put("sourceBranchId", branchIds);
			inValueObject.put("accountGroupId", accountGroupId);

			pendingDDDVBLL = new PendingDirectDeliveryDirectVasuliReportBLL();
			outValueObject = pendingDDDVBLL.getPackageWisePendingDeliveryData(inValueObject);

			if(outValueObject != null){

				pendingDDDVHM = (HashMap<Long, PendingDirectDeliveryDirectVasuliModel>)outValueObject.get("pendingDDDVHM");

				if(pendingDDDVHM != null) {

					for(final long key : pendingDDDVHM.keySet()) {

						pendingDDDVModel = pendingDDDVHM.get(key);
						pendingDDDVModel.setBranchName(cManip.getBranchById(request, accountGroupId, pendingDDDVModel.getSourceBranchId()).getName());
						pendingDDDVModel.setDeliveryPlaceName(cManip.getBranchById(request, accountGroupId, pendingDDDVModel.getDeliveryPlaceId()).getName());

					}
					request.setAttribute("pendingDDDVHM", pendingDDDVHM);
				} else {
					error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
					error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
					request.setAttribute("cargoError", error);
				}
			} else {
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}

			ActionStaticUtil.setReportViewModel(request);
			request.setAttribute("nextPageToken", "success");
		} catch (final Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		} finally {
			error 					= null;
			executive      			= null;
			cManip 					= null;
			outValueObject          = null;
			inValueObject           = null;
			pendingDDDVBLL			= null;
			pendingDDDVHM			= null;
			pendingDDDVModel		= null;
			assignedLocationIdList	= null;
			branchIds				= null;
		}
	}
}