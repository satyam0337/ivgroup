
package com.ivcargo.actions;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.FundClearanceBLL;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.dto.fundtransfer.FundTransferApprove;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.ExecutiveDao;
import com.platform.dto.Executive;
import com.platform.dto.FundTransfer;
import com.platform.dto.FundTransferConstant;
import com.platform.resource.CargoErrorList;

public class ViewFundTransferDetailsAction implements Action {

	public static final String TRACE_ID = "ViewFundTransferDetailsAction";

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {

		HashMap<String,Object>	 	error 					= null;
		FundTransfer[]  			fundTransferArray		= null;
		Executive 					executive 				= null;
		CacheManip 					cManip 					= null;
		FundClearanceBLL			fundClearanceBLL		= null;
		ValueObject					valueObject				= null;
		ValueObject					valueInObject			= null;
		String						executiveIds			= null;
		HashMap<Long, Executive>	executiveHM				= null;
		var	fundTransferId = 0L;

		try {

			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			executive 	= (Executive) request.getSession().getAttribute("executive");
			cManip 		= new CacheManip(request);
			fundTransferId 	= JSPUtility.GetLong(request,"fundTransferId");

			if(fundTransferId > 0){

				fundClearanceBLL = new FundClearanceBLL();

				valueInObject = new ValueObject();
				valueInObject.put("accountGroupId", executive.getAccountGroupId());
				valueInObject.put("fundTransferId", fundTransferId);

				valueObject = fundClearanceBLL.getFundDetailsForView(valueInObject);

				if(valueObject != null){

					fundTransferArray = (FundTransfer[])valueObject.get("fundTransferArray");
					executiveIds      = (String)valueObject.get("executiveIds");
					executiveHM       = ExecutiveDao.getInstance().getExecutiveDetailsByExecutiveIds(executiveIds);

					for (final FundTransfer element : fundTransferArray) {
						final var	toBranch = cManip.getGenericBranchDetailCache(request,element.getToBranchId());
						element.setFromBranchName(cManip.getGenericBranchDetailCache(request,element.getFromBranchId()).getName());
						element.setToBranchName(toBranch != null ?  toBranch.getName() : FundTransferConstant.FUNDTRANSFER_TYPE_BANK_NAME);
						element.setBranchName(cManip.getGenericBranchDetailCache(request, element.getBranchId()).getName());
						element.setExecutiveName(executiveHM.get(element.getExecutiveId()).getName());
						element.setDateTimeStampStr(DateTimeUtility.getDateFromTimeStampWithAMPM(element.getDateTimeStamp()));

						if(element.getFundTransferAppoveStatus() == FundTransferApprove.FUND_TRANSFER_APPROVAL_STATUS_APPROVE)
							element.setStatusString(FundTransferApprove.FUND_TRANSFER_APPROVAL_STATUS_APPROVE_STRING);
						else if(element.getFundTransferAppoveStatus() == FundTransferApprove.FUND_TRANSFER_APPROVAL_STATUS_REJECT)
							element.setStatusString(FundTransferConstant.FUNDTRANSFER_NAME_REJECTED);
						else if(element.getStatus() == FundTransferConstant.FUNDTRANSFER_STATUS_TRANSFERED)
							element.setStatusString(FundTransferConstant.FUNDTRANSFER_NAME_TRANSFERED);
						else if(element.getStatus() == FundTransferConstant.FUNDTRANSFER_STATUS_REJECTED)
							element.setStatusString(FundTransferConstant.FUNDTRANSFER_NAME_REJECTED);
						else
							element.setStatusString(FundTransferConstant.FUNDTRANSFER_NAME_RECEIVIED);
					}

					request.setAttribute("fundTransferArray",fundTransferArray);
				}else {
					error.put("errorCode", CargoErrorList.NO_RECORDS);
					error.put("errorDescription", CargoErrorList.NO_RECORDS_DESCRIPTION);
					request.setAttribute("cargoError", error);
				}
			}else {
				error.put("errorCode", CargoErrorList.NO_RECORDS);
				error.put("errorDescription", CargoErrorList.NO_RECORDS_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}
			request.setAttribute("nextPageToken", "success");

		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}

	}
}
