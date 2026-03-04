package com.ivcargo.reports;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.FundClearanceBLL;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.Executive;
import com.platform.dto.FundTransfer;
import com.platform.dto.TransportCommonMaster;
import com.platform.resource.CargoErrorList;

public class FundClearanceAction implements Action {

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	error 				= null;
		Executive				executive			= null;
		String					branchesIds			= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	filter = JSPUtility.GetInt(request, "filter",0);

			switch (filter) {
			case 1 :
				final var	cManip		= new CacheManip(request);
				executive	= cManip.getExecutive(request);

				if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_GROUPADMIN)
					branchesIds = cManip.getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_GROUP,0);
				else if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_REGIONADMIN)
					branchesIds = cManip.getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_REGION,executive.getRegionId());

				final var	valueInObject = new ValueObject();
				valueInObject.put("accountGroupId", executive.getAccountGroupId());
				valueInObject.put("branchesIds", branchesIds);

				final var	fundClearanceBLL = new FundClearanceBLL();
				final var	valueOutObject	 = fundClearanceBLL.getFundClearanceDataData(valueInObject);

				if(valueOutObject != null) {
					final var	fundTransferArray 	= (FundTransfer[]) valueOutObject.get("fundTransferArray");

					if(fundTransferArray != null && fundTransferArray.length > 0) {
						for (final FundTransfer aFundTransferArray : fundTransferArray) {
							final var fromBranch	= cManip.getBranchById(request, executive.getAccountGroupId(), aFundTransferArray.getFromBranchId());
							final var toBranch		= cManip.getBranchById(request, executive.getAccountGroupId(), aFundTransferArray.getToBranchId());

							aFundTransferArray.setFromBranchName(fromBranch != null ? fromBranch.getName() : "--");
							aFundTransferArray.setToBranchName(toBranch != null ? toBranch.getName() : "--");
						}

						request.setAttribute("fundTransferArray",fundTransferArray);
					}
				} else {
					error.put("errorCode", CargoErrorList.NO_RECORDS);
					error.put("errorDescription", CargoErrorList.NO_RECORDS_DESCRIPTION);
					request.setAttribute("cargoError", error);
				}
			default:
				break;
			}

			request.setAttribute("nextPageToken", "success");
		}	catch (final Exception _e) {
			ActionStaticUtil.catchActionException(request, _e, error);
		}

	}
}
