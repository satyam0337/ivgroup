package com.ivcargo.reports;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.CrossingAgentBillClearanceBLL;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.dto.constant.PaymentTypeConstant;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.CrossingAgentBill;
import com.platform.dto.CrossingAgentBillClearance;
import com.platform.dto.Executive;
import com.platform.dto.configuration.modules.CashStatementConfigurationDTO;
import com.platform.resource.CargoErrorList;

public class CrossingAgentBillClearanceAction implements Action {
	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	 				error 				= null;
		List<CrossingAgentBillClearance> 		billClearancesList 	= null;
		CrossingAgentBillClearance 				billClearance 		= null;
		Executive   							executive 			= null;
		Timestamp 								createDate 			= null;
		List<CrossingAgentBill>					bills				= null;
		ValueObject								valueInObject		= null;
		CrossingAgentBillClearanceBLL			billClearanceBLL	= null;
		SimpleDateFormat 						sdf         		= null;
		CacheManip								cManip				= null;
		String 									branchIds			= null;
		ValueObject								configuration		= null;

		try {

			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			cManip				= new CacheManip(request);

			billClearancesList 	= new ArrayList<>();
			executive 			= cManip.getExecutive(request);
			configuration		= cManip.getCashStatementConfiguration(request, executive.getAccountGroupId());
			createDate 			= DateTimeUtility.getCurrentTimeStamp();
			valueInObject		= new ValueObject();
			sdf         		= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			final int totalBillCount 	= JSPUtility.GetInt(request, "TotalBillCount", 0);
			int indexForVal 	= 0;

			for (int i = 0; i < totalBillCount; i++) {
				indexForVal = i + 1;

				if(JSPUtility.GetDouble(request, "receiveAmt_"+indexForVal, 0.00) > 0) {
					billClearance = new CrossingAgentBillClearance();

					billClearance.setCrossingAgentBillId(JSPUtility.GetLong(request, "billId_" + indexForVal, 0));
					billClearance.setBillNumber(JSPUtility.GetString(request, "billNumber_" + indexForVal, ""));
					billClearance.setCrossingAgentId(JSPUtility.GetLong(request, "creditorId_" + indexForVal, 0));
					billClearance.setCreationDateTimeStamp(createDate);
					billClearance.setGrandTotal(JSPUtility.GetDouble(request, "grandTotal_" + indexForVal, 0.00));
					billClearance.setTotalReceivedAmount(JSPUtility.GetDouble(request, "receiveAmt_" + indexForVal, 0.00));
					billClearance.setStatus(Short.parseShort(request.getParameter("paymentStatus_" + indexForVal)));
					billClearance.setPaymentMode(Short.parseShort(request.getParameter("paymentMode_" + indexForVal)));

					if(billClearance.getPaymentMode() == PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID) {
						billClearance.setChequeDate(new Timestamp(sdf.parse(JSPUtility.GetString(request, "chequeDate_" + indexForVal)  +  " 00:00:00").getTime()));
						billClearance.setChequeNumber(JSPUtility.GetString(request, "chequeNumber_" + indexForVal, ""));
						billClearance.setRemark(JSPUtility.GetString(request, "remark_" + indexForVal, "").toUpperCase());
					}

					if(billClearance.getGrandTotal() < 0)
						billClearance.setTotalReceivedAmount(- billClearance.getTotalReceivedAmount());

					billClearance.setAccountGroupId(executive.getAccountGroupId());
					billClearance.setExecutiveId(executive.getExecutiveId());
					billClearance.setBranchId(executive.getBranchId());

					billClearancesList.add(billClearance);
				}
			}

			bills	= new ArrayList<>();

			for (final CrossingAgentBillClearance crClearance : billClearancesList) {
				final CrossingAgentBill cBill = new CrossingAgentBill();
				cBill.setCrossingAgentBillId(crClearance.getCrossingAgentBillId());
				cBill.setStatus(crClearance.getStatus());

				bills.add(cBill);
			}

			branchIds		= cManip.getBranchIdsByExecutiveType(request, executive);

			valueInObject.put("BillClearance", billClearancesList);

			valueInObject.put("Bill", bills);
			valueInObject.put("executive", executive);
			valueInObject.put("branchIds", branchIds);
			valueInObject.put(CashStatementConfigurationDTO.CASH_STATEMENT_CONFIGURATION, configuration);

			billClearanceBLL = new CrossingAgentBillClearanceBLL();

			if(billClearanceBLL.billClearanceProcess(valueInObject) == 1)
				response.sendRedirect("BillAfterCreation.do?pageId=249&eventId=4&successMsgAfterBillClear=1");
			else {
				error.put("errorCode", CargoErrorList.BILL_CLEARANCE_ERROR);
				error.put("errorDescription", CargoErrorList.BILL_CLEARANCE_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
				request.setAttribute("nextPageToken", "failure");
			}
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		} finally {
			billClearancesList 	= null;
			billClearance 		= null;
			executive 			= null;
			createDate 			= null;
			bills				= null;
			valueInObject		= null;
			billClearanceBLL	= null;
			sdf         		= null;
		}
	}
}