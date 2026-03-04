package com.ivcargo.reports;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.StringJoiner;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.BillClearanceBLL;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.constant.properties.TDSPropertiesConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.Bill;
import com.platform.dto.BillClearance;
import com.platform.dto.Executive;
import com.platform.dto.MultipleBillClearance;
import com.platform.dto.TransportCommonMaster;
import com.platform.dto.configuration.modules.CashStatementConfigurationDTO;
import com.platform.dto.configuration.modules.GroupConfigurationPropertiesDTO;
import com.platform.dto.model.CreditWayBillTxn;
import com.platform.resource.CargoErrorList;

public class BillClearanceAction implements Action {
	Executive 	 executive  			= null;
	Timestamp 	 createDate 			= null;
	SimpleDateFormat  sdf				= null;
	short 		 searchById				= 0;

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		CacheManip					cacheManip				= null;
		HashMap<String,Object>	 	error 					= null;
		BillClearance[] 			billClearances 		= null;
		ArrayList<BillClearance> 	billClearancesList 	= null;
		BillClearance 				billClearance 		= null;
		Bill[]						bills				= null;
		ArrayList<Bill>             billList			= null;
		ValueObject					valueInObject		= null;
		final CreditWayBillTxn[] 	creditWayBillTxn	= null;
		StringJoiner				billIds				= null;
		ValueObject					outValueObj			= null;
		MultipleBillClearance		multipleBillClerance= null;
		Bill						bill				= null;
		ArrayList<MultipleBillClearance> multipleBillCleranceList 	= null;
		MultipleBillClearance[]		multipleBillCleranceArray	  	= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			cacheManip			= new CacheManip(request);
			billIds				= new StringJoiner(",");
			billList			= new ArrayList<>();
			valueInObject		= new ValueObject();
			multipleBillCleranceList = new ArrayList<>();
			executive 			= cacheManip.getExecutive(request);
			createDate 			= new Timestamp(new Date().getTime());
			sdf         		= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			searchById			= JSPUtility.GetShort(request, "searchById", (short)0);
			final int totalBillCount 	= JSPUtility.GetInt(request, "TotalBillCount", 0);
			int indexForVal 	= 0;
			int count			= 0;
			boolean isPaidCredit = false;

			for (int i = 0; i < totalBillCount; i++) {
				indexForVal = i + 1;

				if(JSPUtility.GetDouble(request, "receiveAmt_" + indexForVal, 0.00) > 0) {
					if(searchById != MultipleBillClearance.MULTIPLE_BILL_CLEAR || count == 0) {
						billClearancesList   = new ArrayList<>();
						multipleBillClerance = new MultipleBillClearance();
					}

					billClearance = new BillClearance();
					setBillClerance(request, billClearance,indexForVal);

					if(billClearance.getCreditorId() > 0)
						billClearance.setCustomerType(Bill.CUSTOMER_TYPE_TBB_LR_ID);
					else{
						billClearance.setCustomerType(Bill.CUSTOMER_TYPE_PAID_CREDIT_LR_ID);
						isPaidCredit = true;
					}

					billClearancesList.add(billClearance);
					billIds.add(billClearance.getBillId() + "");

					multipleBillClerance.setBillCleranceList(billClearancesList);
					setMultipleBillClerance(request, multipleBillClerance, billClearance, indexForVal);

					if(searchById != MultipleBillClearance.MULTIPLE_BILL_CLEAR || count == 0)
						multipleBillCleranceList.add(multipleBillClerance);

					bill = new Bill();
					bill.setBillId(billClearance.getBillId());
					bill.setStatus(billClearance.getStatus());

					billList.add(bill);
					count++;
				}
			}

			if(billList != null && !billList.isEmpty()) {
				bills = new Bill[billList.size()];
				billList.toArray(bills);
			}

			for(int i = 0; i < multipleBillCleranceList.size(); i++){
				billClearancesList     = multipleBillCleranceList.get(i).getBillCleranceList();

				if(billClearancesList != null && !billClearancesList.isEmpty()) {
					billClearances = new BillClearance[billClearancesList.size()];
					billClearancesList.toArray(billClearances);
					multipleBillCleranceList.get(i).setBillCleranceArray(billClearances);
				}
			}

			if(!multipleBillCleranceList.isEmpty()) {
				multipleBillCleranceArray = new MultipleBillClearance[multipleBillCleranceList.size()];
				multipleBillCleranceList.toArray(multipleBillCleranceArray);
			}

			valueInObject.put("Bill", bills);
			valueInObject.put("isPaidCredit", isPaidCredit);
			valueInObject.put("creditWayBillTxn", creditWayBillTxn);
			valueInObject.put("billIds", billIds.toString());
			valueInObject.put("multipleBillCleranceArray", multipleBillCleranceArray);
			valueInObject.put("executive", executive);
			valueInObject.put("typeOfSelection", searchById);
			valueInObject.put(CashStatementConfigurationDTO.CASH_STATEMENT_CONFIGURATION, cacheManip.getCashStatementConfiguration(request, executive.getAccountGroupId()));
			valueInObject.put(GroupConfigurationPropertiesDTO.GROUP_CONFIGURATION, cacheManip.getGroupConfiguration(request, executive.getAccountGroupId()));
			valueInObject.put(TDSPropertiesConstant.BILL_PAYMENT_TDS_PROPERTY, cacheManip.getTDSConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.BILL_PAYMENT));

			outValueObj 	 = BillClearanceBLL.getInstance().billClearanceProcess(valueInObject);

			if ("success".equals(outValueObj.get("status").toString()))
				response.sendRedirect("BillAfterCreation.do?pageId=215&eventId=4&successMsgAfterBillClear=1");
			else {
				if ("error".equals(outValueObj.get("status").toString())) {
					error.put("errorCode", CargoErrorList.BILL_CLEARANCE_ERROR);
					error.put("errorDescription", CargoErrorList.BILL_CLEARANCE_ERROR_DESCRIPTION);
				} else {
					error.put("errorCode", CargoErrorList.BILL_CLEARANCE_PAYMENT_DONE_ERROR);
					error.put("errorDescription", CargoErrorList.BILL_CLEARANCE_PAYMENT_DONE_ERROR_DESCRIPTION);
				}
				request.setAttribute("cargoError", error);
				request.setAttribute("nextPageToken", "failure");
			}
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		} finally {
			billClearances 		= null;
			billClearancesList 	= null;
			billClearance 		= null;
			executive 			= null;
			createDate 			= null;
			bills				= null;
			valueInObject		= null;
		}

	}

	private BillClearance setBillClerance(HttpServletRequest request, BillClearance billClearance, int indexForVal) throws Exception {
		billClearance.setBillId(JSPUtility.GetLong(request, "billId_" + indexForVal, 0));
		billClearance.setBillNumber(JSPUtility.GetString(request, "billNumber_" + indexForVal, ""));
		billClearance.setCreditorId(JSPUtility.GetLong(request, "creditorId_" + indexForVal, 0));
		billClearance.setCreationDateTimeStamp(createDate);
		billClearance.setGrandTotal(JSPUtility.GetDouble(request, "grandTotal_" + indexForVal, 0.00));
		billClearance.setTotalReceivedAmount(JSPUtility.GetDouble(request, "receiveAmt_" + indexForVal, 0.00));
		billClearance.setPaymentMode(Short.parseShort(request.getParameter("paymentMode_" + indexForVal)));
		billClearance.setBalanceAmount(JSPUtility.GetDouble(request, "balanceAmt_" + indexForVal, 0.00));

		if(billClearance.getBalanceAmount() <= 0)
			billClearance.setStatus(Bill.BILL_CLEARANCE_STATUS_CLEAR_PAYMENT_ID);
		else
			billClearance.setStatus(Short.parseShort(request.getParameter("paymentStatus_" + indexForVal)));

		if(billClearance.getPaymentMode() == TransportCommonMaster.PAYMENT_TYPE_CHEQUE_ID) {
			billClearance.setChequeDate(new Timestamp(sdf.parse(JSPUtility.GetString(request, "chequeDate_" + indexForVal)  +  " 00:00:00").getTime()));
			billClearance.setChequeNumber(JSPUtility.GetString(request, "chequeNumber_" + indexForVal, ""));
			billClearance.setRemark(JSPUtility.GetString(request, "remark_" + indexForVal, "").toUpperCase());
		} else {
			billClearance.setChequeDate(null);
			billClearance.setChequeNumber(null);
			billClearance.setRemark(null);
		}

		billClearance.setAccountGroupId(executive.getAccountGroupId());
		billClearance.setExecutiveId(executive.getExecutiveId());
		billClearance.setBranchId(executive.getBranchId());

		if(searchById == MultipleBillClearance.MULTIPLE_BILL_CLEAR)
			billClearance.setCleranceTypeId(searchById);

		return billClearance;
	}


	private  MultipleBillClearance  setMultipleBillClerance(HttpServletRequest  request,MultipleBillClearance multipleBillClerance, BillClearance billClearance, int indexForVal)  throws Exception {

		multipleBillClerance.setTotalReceivedAmount(billClearance.getTotalReceivedAmount() + multipleBillClerance.getTotalReceivedAmount());
		multipleBillClerance.setGrandTotal(billClearance.getGrandTotal() + multipleBillClerance.getGrandTotal());
		multipleBillClerance.setAccountgroupId(executive.getAccountGroupId());
		multipleBillClerance.setBranchId(JSPUtility.GetLong(request, "branchId_" + indexForVal,0));
		multipleBillClerance.setReceivedByBranchId(executive.getBranchId());
		multipleBillClerance.setReceivedByExecutiveId(executive.getExecutiveId());
		multipleBillClerance.setCreationDateTimeStamp(createDate);
		multipleBillClerance.setPaymentMode(Short.parseShort(request.getParameter("paymentMode_" + indexForVal)));

		if(multipleBillClerance.getPaymentMode() == TransportCommonMaster.PAYMENT_TYPE_CHEQUE_ID) {
			multipleBillClerance.setChequeDate(new Timestamp(sdf.parse(JSPUtility.GetString(request, "chequeDate_" + indexForVal) + " 00:00:00").getTime()));
			multipleBillClerance.setChequeNumber(JSPUtility.GetString(request, "chequeNumber_" + indexForVal, ""));
			multipleBillClerance.setBankName(JSPUtility.GetString(request, "bankName_" + indexForVal, "").toUpperCase());
		}

		if(searchById == MultipleBillClearance.MULTIPLE_BILL_CLEAR)
			multipleBillClerance.setRemark("Remark".equalsIgnoreCase(JSPUtility.GetString(request, "remark_multipleBillClerance^" + indexForVal, "").toUpperCase()) ? null :JSPUtility.GetString(request, "remark_multipleBillClerance^" + indexForVal, "").toUpperCase());
		else
			multipleBillClerance.setRemark("Remark".equalsIgnoreCase(JSPUtility.GetString(request, "remark_" + indexForVal, "").toUpperCase()) ? null :JSPUtility.GetString(request, "remark_" + indexForVal, "").toUpperCase());

		multipleBillClerance.setCreditorId(JSPUtility.GetLong(request, "creditorId_" + indexForVal, 0));

		return multipleBillClerance;
	}
}