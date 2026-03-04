package com.ivcargo.reports;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.properties.constant.CrossingAgentBillPropertiesConstant;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.reports.CrossingAgentBillPaymentDAO;
import com.platform.dto.CrossingAgentBill;
import com.platform.dto.configuration.mindateselection.ModuleWiseMinDateSelectionConfigurationDTO;
import com.platform.dto.model.ReportViewModel;
import com.platform.resource.CargoErrorList;

public class GetDataForCancelingCrossingAgentBillAction implements Action {
	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	 		error 				= null;
		ValueObject						outValObject		= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeCrossingAgentBillCancleAction().execute(request, response);

			final var	cManip	  = new CacheManip(request);
			final var	executive = cManip.getExecutive(request);

			final var	configuration	= cManip.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.CROSSING_AGENT_BILL);

			final var crossingAgentId = JSPUtility.GetLong(request, "CrossingAgentId", 0);
			var	txnTypeId 		 	 = JSPUtility.GetShort(request, "txnType", (short)0);
			final var	allowRoundOffAmount	= (boolean) configuration.getOrDefault(CrossingAgentBillPropertiesConstant.ALLOW_ROUND_OFF_AMOUNT, false);

			final var	minDateTimeStamp	= cManip.getModuleWiseMinDateToGetData(request, executive.getAccountGroupId(),
					ModuleWiseMinDateSelectionConfigurationDTO.CROSSING_AGENT_INVOICE_CANCEL_MIN_DATE_ALLOW,
					ModuleWiseMinDateSelectionConfigurationDTO.CROSSING_AGENT_INVOICE_CANCEL_MIN_DATE);

			if(!(boolean) configuration.getOrDefault(CrossingAgentBillPropertiesConstant.IS_SHOW_CROSSING_AGENT_TYPE, false))
				txnTypeId = CrossingAgentBill.CROSSINGAGENTBILL_DELIVERY_ID;

			if(crossingAgentId != 0 && txnTypeId > 0) {
				final var	branchIds	= cManip.getBranchIdsByExecutiveType(request, executive);

				if(minDateTimeStamp != null)
					outValObject = CrossingAgentBillPaymentDAO.getInstance().getCrossingAgentBillDetailsForCancelingBillFromMinDate(crossingAgentId, branchIds, txnTypeId, minDateTimeStamp);
				else
					outValObject = CrossingAgentBillPaymentDAO.getInstance().getCrossingAgentBillDetailsForCancelingBill(crossingAgentId, branchIds, txnTypeId);

				if(outValObject != null) {
					final var	bills = (CrossingAgentBill[])outValObject.get("BillDetailsForCancelingBill");

					if(bills != null) {
						for (final CrossingAgentBill bill : bills) {
							bill.setBranchId(bill.getBranchId());

							final var	branch	= cManip.getBranchById(request, executive.getAccountGroupId(), bill.getBranchId());
							bill.setBranchName(branch.getName());
							bill.setSubRegionName(cManip.getGenericSubRegionById(request, branch.getSubRegionId()).getName());
							bill.setCreationDateTimeStampStr(DateTimeUtility.getDateFromTimeStamp(bill.getCreationDateTimeStamp(), "dd-MM-yyyy"));
							bill.setNetAmount(allowRoundOffAmount ? Math.round(bill.getNetAmount()) : bill.getNetAmount());
						}

						request.setAttribute("BillDetailsForCancelingBill", bills);

						var	reportViewModel = new ReportViewModel();
						reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);
						request.setAttribute("ReportViewModel",reportViewModel);
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
			} else {
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}

			request.setAttribute("nextPageToken", "success");
		} catch (final Exception _e) {
			ActionStaticUtil.catchActionException(request, _e, error);
		}
	}
}