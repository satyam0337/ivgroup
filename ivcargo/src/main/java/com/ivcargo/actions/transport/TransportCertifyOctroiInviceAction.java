package com.ivcargo.actions.transport;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.InvoiceCertificationBLL;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.logsapp.LogWriter;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.exception.ExceptionProcess;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.platform.dto.Executive;
import com.platform.dto.InvoiceCertification;
import com.platform.dto.InvoiceCertificationSummary;
import com.platform.resource.CargoErrorList;

public class TransportCertifyOctroiInviceAction implements Action {

	public static final String 			TRACE_ID 				= "TransportCertifyOctroiInviceAction";

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	 		error 						= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	executive 					= (Executive) request.getSession().getAttribute("executive");
			final var	invoiceCertification 		= getInvoiceCertificationDTO(request ,executive);
			var	valueInObject				= getInvoiceCertificationSummaryDTO(request);
			final var	invoiceCertificationSummary = (InvoiceCertificationSummary[])valueInObject.get("invoiceCertificationSummaries");
			final var	wayBillIds					= (String)valueInObject.get("wayBillIds");
			valueInObject				= new ValueObject();

			valueInObject.put("InvoiceCertification", invoiceCertification);
			valueInObject.put("InvoiceCertificationSummary", invoiceCertificationSummary);
			valueInObject.put("wayBillIds", wayBillIds);

			if(new InvoiceCertificationBLL().getWayBillDetailsForGeneratingBillByWayBillIds(valueInObject) == 1)
				response.sendRedirect("AfterInvoiceCertification.do?pageId=220&eventId=4&successMsg="+invoiceCertification.getInvoiceNumber());
			else {
				error.put("errorCode", CargoErrorList.SYSTEM_ERROR);
				error.put("errorDescription", CargoErrorList.SYSTEM_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
				request.setAttribute("nextPageToken", "failure");
			}

		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}

	}

	private ValueObject getInvoiceCertificationSummaryDTO(HttpServletRequest request) throws Exception {
		InvoiceCertificationSummary[] 	invoiceCertificationSummaries 	= null;
		String[] 						checkedValues					= null;
		StringBuilder					wayBillIds						= null;
		ValueObject						valOutObj						= null;

		try {
			wayBillIds		 				= new StringBuilder();
			checkedValues 					= request.getParameterValues("checkBoxForLr");
			invoiceCertificationSummaries 	= new InvoiceCertificationSummary[checkedValues.length];
			valOutObj						= new ValueObject();

			for (var i = 0; i < checkedValues.length; i++) {
				invoiceCertificationSummaries[i] = new InvoiceCertificationSummary();
				invoiceCertificationSummaries[i].setDispatchLedgerId(JSPUtility.GetLong(request, "dispatchLedgerId"+checkedValues[i], 0));
				invoiceCertificationSummaries[i].setWayBillId(JSPUtility.GetLong(request, "wayBillId"+checkedValues[i], 0));
				invoiceCertificationSummaries[i].setWayBillNumber(JSPUtility.GetString(request, "wayBillNo"+checkedValues[i], ""));
				invoiceCertificationSummaries[i].setMoneyReceiptNumber(JSPUtility.GetString(request, "MRN"+checkedValues[i], ""));
				invoiceCertificationSummaries[i].setbFormNumber(JSPUtility.GetString(request, "BFN"+checkedValues[i], ""));
				invoiceCertificationSummaries[i].setAmount(JSPUtility.GetDouble(request, "amount"+checkedValues[i], 0.00));

				wayBillIds.append(invoiceCertificationSummaries[i].getWayBillId()+",");
			}

			valOutObj.put("invoiceCertificationSummaries", invoiceCertificationSummaries);
			valOutObj.put("wayBillIds", wayBillIds.deleteCharAt(wayBillIds.length()-1).toString());

			return valOutObj;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private InvoiceCertification getInvoiceCertificationDTO(HttpServletRequest request ,Executive executive) throws Exception {

		InvoiceCertification 	invoiceCertification 	= null;
		SimpleDateFormat 		sdf						= null;

		try {

			sdf = new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			invoiceCertification = new InvoiceCertification();
			invoiceCertification.setInvoiceNumber(JSPUtility.GetString(request, "invoiceNo", ""));
			invoiceCertification.setVehicleNumberMasterId(JSPUtility.GetLong(request, "VehicleNumberId", 0));
			invoiceCertification.setInvoiceDate(new Timestamp(sdf.parse(JSPUtility.GetString(request, "invoiceDate") + " 00:00:00").getTime()));
			invoiceCertification.setCreationDate(new Timestamp(new Date().getTime()));
			invoiceCertification.setOctroiCharge(JSPUtility.GetDouble(request, "Octroi", 0));
			invoiceCertification.setServiceCharge(JSPUtility.GetDouble(request, "Service", 0));
			invoiceCertification.setClearanceCharge(JSPUtility.GetDouble(request, "Clearance", 0));
			invoiceCertification.setCollectionCharge(JSPUtility.GetDouble(request, "Collection", 0));
			invoiceCertification.setFormCharge(JSPUtility.GetDouble(request, "Form", 0));
			invoiceCertification.setOtherCharge(JSPUtility.GetDouble(request, "Other", 0));
			invoiceCertification.setGrandTotal(JSPUtility.GetDouble(request, "Grand", 0));
			invoiceCertification.setExecutiveId(executive.getExecutiveId());
			invoiceCertification.setBranchId(executive.getBranchId());
			/*invoiceCertification.setCityId(executive.getCityId());*/
			invoiceCertification.setAccountGroupId(executive.getAccountGroupId());
			invoiceCertification.setAgentId(JSPUtility.GetLong(request, "agentId", 0));

			return invoiceCertification;

		} catch (final Exception e) {
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR," Error Populating" + e.getMessage());
			throw e;
		} finally {
			invoiceCertification 	= null;
			sdf						= null;
		}
	}
}