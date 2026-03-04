package com.ivcargo.reports;

import java.sql.Timestamp;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.StringJoiner;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.dto.constant.BillClearanceStatusConstant;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.constant.Constant;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.utility.CollectionUtility;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.reports.BillClearanceDAO;
import com.platform.dao.reports.BillInformationCreditorWiseDAO;
import com.platform.dto.Bill;
import com.platform.dto.CustomGroupMapper;
import com.platform.dto.Executive;
import com.platform.dto.constant.BillTypeConstant;
import com.platform.dto.model.BillInformationCreditorWiseReport;
import com.platform.dto.model.ReportViewModel;
import com.platform.resource.CargoErrorList;

public class BillInformationCreditorWiseReportAction implements Action {

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	 	error 			= null;
		var 						branchId		= 0L;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeBillInformationCreditorWiseReportAction().execute(request, response);

			final var	objectIn	= new ValueObject();
			final var	cacheManip  = new CacheManip(request);
			final var	executive	= cacheManip.getExecutive(request);

			ActionStaticUtil.executiveTypeWiseBranches(request, cacheManip, executive);

			if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_GROUPADMIN || executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_REGIONADMIN || executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_SUBREGIONADMIN)
				branchId 		= JSPUtility.GetLong(request, "branch", 0);
			else
				branchId 		= executive.getBranchId();

			final var	status = BillClearanceStatusConstant.BILL_CLEARANCE_STATUS_CLEAR_PAYMENT_ID + "," + BillClearanceStatusConstant.BILL_CLEARANCE_STATUS_DUE_PAYMENT_ID + "," + BillClearanceStatusConstant.BILL_CLEARANCE_STATUS_PARTIAL_PAYMENT_ID+","+Bill.BILL_CLEARANCE_STATUS_NEGOTIATED_ID;
			final var	billType = ""+BillTypeConstant.NORMAL_BILL_TYPE_ID;

			objectIn.put(Constant.FROM_DATE, DateTimeUtility.getStartOfDayTimeStamp(JSPUtility.GetString(request, Constant.FROM_DATE)));
			objectIn.put(Constant.TO_DATE, DateTimeUtility.getEndOfDayTimeStamp(JSPUtility.GetString(request, Constant.TO_DATE)));
			objectIn.put("branchIds", ""+branchId);
			objectIn.put("accountGroupId", executive.getAccountGroupId());
			objectIn.put("status", status);
			objectIn.put("billType", billType);

			final var whereClause	= getBillInformationCreditorWiseWhereClause(objectIn);

			final var	branch = cacheManip.getGenericBranchDetailCache(request, branchId);

			final var	reportModel = BillInformationCreditorWiseDAO.getInstance().getBillInformationCreditorWise(whereClause);

			if(!reportModel.isEmpty()) {
				final HashMap<String, HashMap<Long, BillInformationCreditorWiseReport>>	creditorDataColl = new LinkedHashMap<>();

				final var	billIdsStr = CollectionUtility.getStringFromLongSet(reportModel.stream().map(BillInformationCreditorWiseReport::getBillId).collect(Collectors.toSet()));
				final var	billClrArr = BillClearanceDAO.getInstance().getLimitedDetailsByBillIds(billIdsStr, status);

				for (final BillInformationCreditorWiseReport element : reportModel) {
					var	dataColl = creditorDataColl.get(element.getCreditorId() + "_" + element.getCreditorName());

					if(dataColl == null) {
						dataColl	= new LinkedHashMap<>();
						final var	model		= (BillInformationCreditorWiseReport) element.clone();
						model.setBranchName(branch.getName());
						model.setSubRegionName(cacheManip.getGenericSubRegionById(request, branch.getSubRegionId()).getName());

						if(billClrArr != null) {
							final var	bill = billClrArr.get(element.getBillId());

							if(bill != null)
								model.setReceivedAmount(bill.getTotalReceivedAmount());
						}

						dataColl.put(element.getBillId(), model);
						creditorDataColl.put(element.getCreditorId() + "_" + element.getCreditorName(), dataColl);
					} else {
						var	model = dataColl.get(element.getBillId());

						if(model == null) {
							model = (BillInformationCreditorWiseReport) element.clone();

							model.setBranchName(branch.getName());
							model.setSubRegionName(cacheManip.getGenericSubRegionById(request, branch.getSubRegionId()).getName());

							if(billClrArr != null) {
								final var	bill = billClrArr.get(element.getBillId());

								if(bill != null)
									model.setReceivedAmount(bill.getTotalReceivedAmount());
							}

							dataColl.put(element.getBillId(), model);
						}
					}
				}

				request.setAttribute("creditorDataColl", creditorDataColl);

				var	reportViewModel = new ReportViewModel();
				reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);
				request.setAttribute("ReportViewModel",reportViewModel);
			} else {
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}

			ActionStaticUtil.setRequestAttribute(request,"customAddressBranchId", branchId);
			ActionStaticUtil.setRequestAttribute(request,"customAddressIdentifer", CustomGroupMapper.IDENTIFIER_BOOKING);
			ActionStaticUtil.setReportViewModel(request);
			request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}

	private String getBillInformationCreditorWiseWhereClause(ValueObject objectIn) throws Exception {
		final var fromDate			= (Timestamp) objectIn.get(Constant.FROM_DATE);
		final var toDate			= (Timestamp) objectIn.get(Constant.TO_DATE);
		final var branchIds			= objectIn.getString("branchIds");
		final var accountGroupId	= objectIn.getLong("accountGroupId", 0);
		final var billTypeIds		= objectIn.getString("billType");

		final var whereClause = new StringJoiner(" AND ");

		whereClause.add("b.CreationDateTimeStamp >= '" + fromDate + "'");
		whereClause.add("b.CreationDateTimeStamp <= '" + toDate + "'");
		whereClause.add("b.BranchId IN (" + branchIds + ")");
		whereClause.add("b.AccountGroupId = " + accountGroupId);
		whereClause.add("b.CustomerType = 1");
		whereClause.add("b.BillTypeId IN (" + billTypeIds + ")");

		return whereClause.toString();
	}
}