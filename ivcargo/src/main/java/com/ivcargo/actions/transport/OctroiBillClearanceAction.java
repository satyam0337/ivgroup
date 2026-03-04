package com.ivcargo.actions.transport;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.OctroiBillClearanceBll;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.logsapp.LogWriter;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.platform.dao.OctroiAgentMasterDao;
import com.platform.dto.Executive;
import com.platform.dto.InvoiceCertification;
import com.platform.dto.OctroiAgentMaster;
import com.platform.dto.OctroiBillClearance;
import com.platform.dto.TransportCommonMaster;
import com.platform.resource.CargoErrorList;

public class OctroiBillClearanceAction implements Action {
	private static final String TRACE_ID = "OctroiBillClearanceAction";

	public void execute(HttpServletRequest request, HttpServletResponse response) {
		// TODO Auto-generated method stub
		HashMap<String,Object>	 	error 					= null;
		OctroiBillClearance[]					billClearances 		= null;
		ArrayList<OctroiBillClearance> 			billClearancesList 	= null;
		OctroiBillClearance		 				billClearance 		= null;
		Executive   							executive 			= null;
		Timestamp 								createDate 			= null;
		InvoiceCertification[]					bills				= null;
		ValueObject								valueInObject		= null;
		OctroiBillClearanceBll					billClearanceBLL	= null;
		SimpleDateFormat 						sdf         		= null;
		StringBuffer							invCertIds			= null;
		HashMap<Long, OctroiAgentMaster>		octroiAgentMasterHM	= null;
		StringBuilder							octroiAgentIds		= null;
		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error)){
				return;
			}
			billClearancesList 	= new ArrayList<OctroiBillClearance>();
			executive 			= (Executive) request.getSession().getAttribute("executive");
			createDate 			= new Timestamp(new Date().getTime());
			valueInObject		= new ValueObject();
			sdf         		= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			int totalBillCount 	= JSPUtility.GetInt(request, "TotalBillCount", 0);
			octroiAgentIds		= new StringBuilder();
			int indexForVal 	= 0;
			//double receivedAmtLimit = 0.00;

			for (int i = 0; i < totalBillCount; i++) {

				indexForVal = i + 1;
				//receivedAmtLimit = JSPUtility.GetDouble(request, "receivedAmtLimit_"+indexForVal, 0.00);

				//if(JSPUtility.GetDouble(request, "receiveAmt_"+indexForVal, 0.00) > receivedAmtLimit) {
				if(JSPUtility.GetDouble(request, "receiveAmt_"+indexForVal, 0.00) > 0) {

					billClearance = new OctroiBillClearance();

					billClearance.setInvoiceCertificationId(JSPUtility.GetLong(request, "billId_"+indexForVal, 0));
					billClearance.setInvoiceNumber(JSPUtility.GetString(request, "billNumber_"+indexForVal, ""));
					billClearance.setAgentId(JSPUtility.GetLong(request, "creditorId_"+indexForVal, 0));
					billClearance.setCreationDateTimeStamp(createDate);
					billClearance.setGrandTotal(JSPUtility.GetDouble(request, "grandTotal_"+indexForVal, 0.00));
					billClearance.setTotalPaidAmount(JSPUtility.GetDouble(request, "receiveAmt_"+indexForVal, 0.00));
					billClearance.setStatus(Short.parseShort(request.getParameter("paymentStatus_"+indexForVal)));
					billClearance.setPaymentMode(Short.parseShort(request.getParameter("paymentMode_"+indexForVal)));

					if(billClearance.getPaymentMode() == TransportCommonMaster.PAYMENT_TYPE_CHEQUE_ID) {
						billClearance.setChequeDate(new Timestamp((sdf.parse(JSPUtility.GetString(request, "chequeDate_"+indexForVal) + " 00:00:00")).getTime()));
						billClearance.setChequeNumber(JSPUtility.GetString(request, "chequeNumber_"+indexForVal, ""));
						billClearance.setRemark(JSPUtility.GetString(request, "remark_"+indexForVal, "").toUpperCase());
					} else {
						billClearance.setChequeDate(null);
						billClearance.setChequeNumber(null);
						//billClearance.setRemark(null);
					}

					billClearance.setAccountGroupId(executive.getAccountGroupId());
					billClearance.setExecutiveId(executive.getExecutiveId());
					billClearance.setBranchId(executive.getBranchId());
					/*billClearance.setCityId(executive.getCityId());*/
					octroiAgentIds.append(billClearance.getAgentId()+",");


					billClearancesList.add(billClearance);
				}
			}

			billClearances  = new OctroiBillClearance[billClearancesList.size()];
			billClearancesList.toArray(billClearances);
			octroiAgentMasterHM = OctroiAgentMasterDao.getInstance().getOctroiAgentByAgentIds(octroiAgentIds.substring(0, octroiAgentIds.lastIndexOf(",")));
			bills 		= new InvoiceCertification[billClearances.length];
			invCertIds	= new StringBuffer();
			for (int i = 0; i < billClearances.length; i++) {

				bills[i] = new InvoiceCertification();
				bills[i].setInvoiceCertificationId(billClearances[i].getInvoiceCertificationId());
				bills[i].setStatus(billClearances[i].getStatus());

				invCertIds.append(bills[i].getInvoiceCertificationId()+",");
			}

			valueInObject.put("BillClearance", billClearances);
			valueInObject.put("Bill", bills);
			valueInObject.put("invCertIds", invCertIds.deleteCharAt(invCertIds.length()-1).toString());
			valueInObject.put("executive", executive);
			valueInObject.put("octroiAgentMasterHM", octroiAgentMasterHM);
			billClearanceBLL = new OctroiBillClearanceBll();
			if(billClearanceBLL.billClearanceProcess(valueInObject) == 1){
				LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO,"===========Octroi Bills Cleared successfully==== ");
				//request.setAttribute("successMsg", billSequenceCounter.getNextVal());
				//request.setAttribute("nextPageToken", "success");
				response.sendRedirect("BillAfterCreation.do?pageId=249&eventId=4&successMsgAfterOctroiBillClear=1");
			} else {
				LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO, (String) error.get("errorCode")+" "+(String) error.get("errorDescription"));
				error.put("errorCode", CargoErrorList.BILL_CLEARANCE_ERROR);
				error.put("errorDescription", CargoErrorList.BILL_CLEARANCE_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
				request.setAttribute("nextPageToken", "failure");
			}

		} catch (Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		} finally {
			billClearances 		= null; 
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
