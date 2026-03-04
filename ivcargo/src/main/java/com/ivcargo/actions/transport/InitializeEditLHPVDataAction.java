package com.ivcargo.actions.transport;

//~--- non-JDK imports --------------------------------------------------------

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.constant.properties.lhpv.LHPVPropertiesConstant;
import com.iv.dto.constant.ExecutiveTypeConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.utils.DateTime.DateTimeUtility;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.LHPVDao;
import com.platform.dto.Executive;

public class InitializeEditLHPVDataAction implements Action {

	public static final String TRACE_ID = "InitializeEditLHPVDataAction";

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {

		HashMap<String,Object>	 error 		= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	executive	= (Executive) request.getSession().getAttribute("executive");
			final var	lhpvId		= JSPUtility.GetLong(request, "lhpvId", 0);
			final var	cache		= new CacheManip(request);

			final var lhpvConfig					= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.LHPV);
			final var lhpvEditRemarkRequired		= (boolean) lhpvConfig.getOrDefault(LHPVPropertiesConstant.LHPV_EDIT_REMARK_REQUIRED, false);
			final var isOnlyPhysicalBranchShowInLhpvEditData		= (boolean) lhpvConfig.getOrDefault(LHPVPropertiesConstant.IS_ONLY_PHYSICAL_BRANCH_SHOW_IN_LHPV_EDIT_DATA, false);
			final var maxHoursForEdit					= (int) lhpvConfig.getOrDefault(LHPVPropertiesConstant.MAX_HOURS_FOR_EDIT, 0);
			final var validateDestinationAndPayableBranchTimeLimit	= (boolean) lhpvConfig.getOrDefault(LHPVPropertiesConstant.VALIDATE_EDIT_LHPV_DESTINATION_AND_PAYABLE_BRANCH_TIME_LIMIT, false);

			if(lhpvId > 0){
				final var	lhpv = LHPVDao.getInstance().getLimitedLHPVDataForEdit(lhpvId);
				final var	balPayableBranch = cache.getBranchById(request,executive.getAccountGroupId(), lhpv.getBalancePayableAtBranchId());

				if(lhpv.getBalancePayableAtBranchId() > 0) {
					request.setAttribute("balPayableBranchId",balPayableBranch.getBranchId());
					request.setAttribute("balPayableSubRegionId",balPayableBranch.getSubRegionId());
					request.setAttribute("balPayableSubRegionBranches", cache.getBranchesBySubRegionId(request, executive.getAccountGroupId(), balPayableBranch.getSubRegionId()));
				}

				if(lhpv.getDestinationBranchId() > 0) {
					final var	destBranch		 = cache.getBranchById(request,executive.getAccountGroupId(), lhpv.getDestinationBranchId());
					request.setAttribute("destBranchId",destBranch.getBranchId());
					request.setAttribute("destSubRegionId",destBranch.getSubRegionId());
					request.setAttribute("destSubRegionBranches", cache.getBranchesBySubRegionId(request, executive.getAccountGroupId(), destBranch.getSubRegionId()));
					request.setAttribute("destBranch", destBranch);
				}

				if(validateDestinationAndPayableBranchTimeLimit && executive.getExecutiveType() != ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN) {
					final var hoursObj =  DateTimeUtility.getDayDiffBetweenTwoDatesInHoursAndMinutes(lhpv.getCreationDateTimeStamp(), DateTimeUtility.getCurrentTimeStamp());
					final var dayDiff  = hoursObj.getLong("diffHours", 0);

					request.setAttribute("isAllowToEditLHPV", dayDiff <= maxHoursForEdit);
					request.setAttribute("messageStr", "Cannot Edit LHPV After " + maxHoursForEdit + " hrs. Contact Head Office.");
				}

				request.setAttribute("lhpvId",lhpvId);
				request.setAttribute("lhpv",lhpv);
				request.setAttribute("lhpvNo",lhpv.getlHPVNumber());
				request.setAttribute("subRegionForGroup", cache.getSubRegionsByGroupId(request, executive.getAccountGroupId()));
				request.setAttribute("nextPageToken", "success");
				request.setAttribute("lhpvEditRemarkRequired", lhpvEditRemarkRequired);
				request.setAttribute("isOnlyPhysicalBranchShowInLhpvEditData", isOnlyPhysicalBranchShowInLhpvEditData);
			}
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}

	}
}