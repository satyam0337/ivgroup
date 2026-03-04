package com.ivcargo.actions;

//~--- non-JDK imports --------------------------------------------------------


import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.logsapp.LogWriter;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.platform.dto.CustomerDetails;
import com.platform.dto.Executive;
import com.platform.dto.WayBill;
import com.platform.dto.model.WayBillModel;

public class EditWayBillAction implements Action {
	public static final String TRACE_ID   = "EditWayBillAction";
	Executive                  executive  = null;

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	 	error 					= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			executive  = (Executive) request.getSession().getAttribute("executive");

			final WayBillModel wayBillModel = new WayBillModel();
			final WayBill      wayBill      = createWayBilldto(request);

			wayBill.setWayBillId(JSPUtility.GetLong(request, "wayBillId"));
			wayBillModel.setWayBill(wayBill);

			final CustomerDetails consignorDetails = createConsignordto(request);

			wayBillModel.setConsignorDetails(consignorDetails);

			final CustomerDetails consigneeDetails = createConsigneedto(request);

			wayBillModel.setConsigneeDetails(consigneeDetails);

			final ValueObject inValObj = new ValueObject();

			inValObj.put("wayBillModel", wayBillModel);

			final Action viewWayBillAction = new ViewWayBillAction();

			viewWayBillAction.execute(request, response);
			request.setAttribute("nextPageToken", request.getAttribute("nextPageToken"));
		} catch (final Exception e) {
			e.printStackTrace();
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, e);
		}
	}

	private CustomerDetails createConsignordto(HttpServletRequest request) {
		final CustomerDetails customerDetails = new CustomerDetails();

		try {
			customerDetails.setAccountGroupId(executive.getAccountGroupId());
			customerDetails.setAddress(JSPUtility.GetString(request, "consignorAddress"));

			customerDetails.setContactPerson(JSPUtility.GetString(request, "consignorContactPerson", ""));
			customerDetails.setCorporateAccountId(JSPUtility.GetLong(request, "consignorCortAccId", 0));
			customerDetails.setCountryId(executive.getCountryId());
			customerDetails.setDepartment(JSPUtility.GetString(request, "consignorDepartment", ""));
			customerDetails.setEmailAddress(JSPUtility.GetString(request, "consignorEmail", ""));
			customerDetails.setFaxNumber(JSPUtility.GetString(request, "consignorFax", ""));
			customerDetails.setMobileNumber(JSPUtility.GetString(request, " consignorMobile", ""));
			customerDetails.setName(JSPUtility.GetString(request, "consignorName"));
			customerDetails.setPhoneNumber(JSPUtility.GetString(request, "consignorPhn", ""));
			customerDetails.setPincode(JSPUtility.GetLong(request, "consignorPin"));
			customerDetails.setStateId(executive.getStateId());
		} catch (final Exception e) {
			e.printStackTrace();
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, e);
		}

		return customerDetails;
	}

	private CustomerDetails createConsigneedto(HttpServletRequest request) {
		final CustomerDetails customerDetails = new CustomerDetails();

		try {
			customerDetails.setAccountGroupId(executive.getAccountGroupId());
			customerDetails.setAddress(JSPUtility.GetString(request, "consigneeAddress"));

			customerDetails.setContactPerson(JSPUtility.GetString(request, "consigneeContactPerson", ""));
			customerDetails.setCorporateAccountId(JSPUtility.GetLong(request, "consigneeCortAccId", 0));
			customerDetails.setCountryId(executive.getCountryId());
			customerDetails.setDepartment(JSPUtility.GetString(request, "consigneeDepartment", ""));
			customerDetails.setEmailAddress(JSPUtility.GetString(request, "consigneeEmail", ""));
			customerDetails.setFaxNumber(JSPUtility.GetString(request, "consigneeFax", ""));
			customerDetails.setMobileNumber(JSPUtility.GetString(request, " consigneeMobile", ""));
			customerDetails.setName(JSPUtility.GetString(request, "consigneeName"));
			customerDetails.setPhoneNumber(JSPUtility.GetString(request, "consigneePhn", ""));
			customerDetails.setPincode(JSPUtility.GetLong(request, "consigneePin"));
			customerDetails.setStateId(executive.getStateId());
		} catch (final Exception e) {
			e.printStackTrace();
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, e);
		}

		return customerDetails;
	}

	private WayBill createWayBilldto(HttpServletRequest request) {
		final WayBill wayBill = new WayBill();

		try {
			wayBill.setAccountGroupId(executive.getAccountGroupId());
			wayBill.setAgencyId(executive.getAgencyId());
			wayBill.setBranchId(executive.getBranchId());
			wayBill.setConsignorInvoiceNo(JSPUtility.GetString(request, "consignorInvoiceNo", ""));
			wayBill.setConveyedCopyAttach(JSPUtility.GetBoolean(request, "conveyedCopyAttach", false));
			wayBill.setConsignorInvoiceNo(JSPUtility.GetString(request, "consignorInvoiceNo", ""));
			wayBill.setDeclaredValue(JSPUtility.GetLong(request, "declaredValue", 0));
			wayBill.setDestinationBranchId(JSPUtility.GetLong(request, "destinationBranchId"));

			wayBill.setDiscountPercent(JSPUtility.GetBoolean(request, "isDiscountPercent", false));
			wayBill.setExecutiveId(executive.getExecutiveId());
			wayBill.setGrandTotal(JSPUtility.GetLong(request, "grandTotal"));
			wayBill.setSaidToContain(JSPUtility.GetString(request, "saidToContain", ""));
			wayBill.setSourceBranchId(executive.getBranchId());

			wayBill.setSourceSubRegionId(executive.getSubRegionId());
			wayBill.setWayBillTypeId(JSPUtility.GetLong(request, "wayBillType"));
		} catch (final Exception e) {
			e.printStackTrace();
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, e);
		}

		return wayBill;
	}
}
