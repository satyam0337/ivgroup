package com.ivcargo.reports;

import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.CustomerOrderBLL;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.dto.CustomerOrder;
import com.iv.dto.constant.CustomerOrderStatusConstant;
import com.iv.utils.Utility;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.constant.DateTimeFormatConstant;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.Executive;
import com.platform.dto.model.ReportViewModel;
import com.platform.resource.CargoErrorList;

public class CustomerOrderReportAction implements Action {

	@Override
	@SuppressWarnings("unchecked")
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>				error 						= null;
		ReportViewModel 					reportViewModel 			= null;
		ValueObject 						outValObj 					= null;
		Map<Long, CustomerOrder> 			customerOrdersCol 			= null;
		short 								statusId 					= 1;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	executive	= (Executive) request.getSession().getAttribute("executive");

			if(executive != null){
				new InitializeCustomerOrderReportAction().execute(request, response);
				final var	cache 		= new CacheManip(request);
				final var	inValObj 	= new ValueObject();
				final var	bll 		= new CustomerOrderBLL();

				if(request.getParameter("statusId") != null)
					statusId 	= Short.parseShort(request.getParameter("statusId"));

				final var	fromDate	= DateTimeUtility.getStartOfDayTimeStamp(JSPUtility.GetString(request, "fromDate"));
				final var	toDate		= DateTimeUtility.getEndOfDayTimeStamp(JSPUtility.GetString(request, "toDate"));

				ActionStaticUtil.executiveTypeWiseBranches(request, cache, executive);

				final var	branchIds		= ActionStaticUtil.getBranchIdsWithAssignedLocation1(request, cache, executive);

				inValObj.put("executive", executive);
				inValObj.put("statusId", statusId);
				inValObj.put("fromDate", fromDate);
				inValObj.put("toDate", toDate);
				inValObj.put("branchIds", branchIds);
				outValObj = bll.getCustomerOrderReportDetails(inValObj);

				if(outValObj != null)
					customerOrdersCol = (Map <Long, CustomerOrder>) outValObj.get("customerOrders");
				else {
					error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
					error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
					request.setAttribute("cargoError", error);
				}

				// update From cache
				if(customerOrdersCol != null) {
					for (final Map.Entry<Long, CustomerOrder> entry : customerOrdersCol.entrySet()) {
						final var customerOrder = entry.getValue();

						if(customerOrder != null) {
							var branch	= cache.getGenericBranchDetailCache(request,customerOrder.getSourceBranchId());

							customerOrder.setSourceSubRegionName(cache.getGenericSubRegionById(request, branch.getSubRegionId()).getName());
							customerOrder.setSourceBranch(branch.getName() + " (" + customerOrder.getSourceSubRegionName() + ")");

							branch	= cache.getGenericBranchDetailCache(request,customerOrder.getDestinationBranchId());

							customerOrder.setDestinationSubRegionName(cache.getGenericSubRegionById(request, branch.getSubRegionId()).getName());
							customerOrder.setDestinationBranch(branch.getName() + " (" + customerOrder.getDestinationSubRegionName() + ")");

							customerOrder.setOrderByBranchName(cache.getGenericBranchDetailCache(request, customerOrder.getOrderByBranchId()).getName());
							customerOrder.setMarketingPersonName(Utility.checkedNullCondition(customerOrder.getMarketingPersonName(), (short) 1));
							customerOrder.setMarketingPersonNumber(Utility.checkedNullCondition(customerOrder.getMarketingPersonNumber(), (short) 1));
							customerOrder.setContactPerson(Utility.checkedNullCondition(customerOrder.getContactPerson(), (short) 1));
							customerOrder.setCreationDateStr(DateTimeUtility.getDateFromTimeStamp(customerOrder.getCreationDateTime(), DateTimeFormatConstant.DD_MM_YYYY_HH_MM_A));
							customerOrder.setServiceDateStr(DateTimeUtility.getDateFromTimeStamp(customerOrder.getServiceDate(), DateTimeFormatConstant.DD_MM_YYYY_HH_MM_A));
							customerOrder.setVehicleNumber(Utility.checkedNullCondition(customerOrder.getVehicleNumber(), (short) 1));
							customerOrder.setStatus(CustomerOrderStatusConstant.getStatusName(customerOrder.getStatusId()));
							customerOrder.setRemark(Utility.checkedNullCondition(customerOrder.getRemark(), (short) 1));
							customerOrder.setOrderByExecutiveName(customerOrder.getOrderByExecutiveName() + " (" + customerOrder.getOrderByBranchName() + ")");
						}
					}
					request.setAttribute("customerOrdersCol", customerOrdersCol);
				} else {
					error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
					error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
					request.setAttribute("cargoError", error);
				}

				reportViewModel = new ReportViewModel();
				reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);
				request.setAttribute("ReportViewModel",reportViewModel);

				request.setAttribute("nextPageToken", "success");
			}else {
				error.put("errorCode", CargoErrorList.SESSION_INVALID);
				error.put("errorDescription", CargoErrorList.SESSION_INVALID_DESCRIPTION);
				request.setAttribute("error", error);
			}
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}
}
