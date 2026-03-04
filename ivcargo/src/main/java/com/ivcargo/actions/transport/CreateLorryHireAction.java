package com.ivcargo.actions.transport;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.LorryHireBLL;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.logsapp.LogWriter;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.platform.dto.Executive;
import com.platform.dto.LorryHire;
import com.platform.dto.constant.LorryHireConstant;
import com.platform.dto.constant.PaymentTypeConstant;
import com.platform.resource.CargoErrorList;

public class CreateLorryHireAction implements Action {

	public static final String TRACE_ID = "CreateLorryHireAction";

	public void execute(HttpServletRequest request, HttpServletResponse response) {

		HashMap<String,Object>	error 	= null;
		Executive 		executive 		= null;
		LorryHire		lorryHire		= null;
		LorryHireBLL	lorryHireBLL	= null;
		ValueObject		valueInObject	= null;
		ValueObject		valueOutObject	= null;
		long			lorryHireId		= 0;

		try {

			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error)){
				return;
			}
			executive 		= (Executive)request.getSession().getAttribute("executive");
			lorryHireId		= JSPUtility.GetLong(request, "selectedLorryHireId",0);
			lorryHire 		= setLorryHire(request, executive);
			valueInObject 	= new ValueObject();
			lorryHireBLL	= new LorryHireBLL();

			lorryHire.setLorryHireId(lorryHireId);
			valueInObject.put("lorryHire", lorryHire);
			valueInObject.put("executive", executive);

			if(lorryHireId > 0) {
				valueOutObject = lorryHireBLL.updateLorryHire(valueInObject);
			} else {
				valueOutObject = lorryHireBLL.createLorryHire(valueInObject);
			}


			if(valueOutObject != null) {
				response.sendRedirect("LorryHireAfterCreation.do?pageId=234&eventId=3&lorryHireId="+valueOutObject.get("lorryHireId"));
			} else {
				error.put("errorCode", CargoErrorList.SYSTEM_ERROR);
				error.put("errorDescription", CargoErrorList.SYSTEM_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
				request.setAttribute("nextPageToken", "failure");
			}

		} catch (Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		} finally {
			executive 		= null;
			lorryHire		= null;
			lorryHireBLL	= null;
			valueInObject	= null;
			valueOutObject	= null;
		}

	}

	private LorryHire setLorryHire(HttpServletRequest request, Executive executive) throws Exception {

		LorryHire			lorryHire	= null;
		Timestamp			createDate	= null;
		String 				dt			= null;
		String 				strDate		= null;
		SimpleDateFormat 	sdf			= null;
		Date 				fDate		= null;
		Timestamp 			date		= null;

		try {

			lorryHire	= new LorryHire();
			createDate	= new Timestamp(new Date().getTime());

			lorryHire.setAccountGroupId(executive.getAccountGroupId());
			lorryHire.setExecutiveId(executive.getExecutiveId());
			lorryHire.setBranchId(executive.getBranchId());
			lorryHire.setLorryHireDateTime(createDate);
			lorryHire.setLorrySupplierName(JSPUtility.GetString(request, "lorrySupplierName", "").toUpperCase());
			lorryHire.setSupplierMobileNo(JSPUtility.GetString(request, "supplierMobileNumber", ""));
			lorryHire.setDriverName(JSPUtility.GetString(request, "driverName", "").toUpperCase());
			lorryHire.setDriverMobileNo(JSPUtility.GetString(request, "mobileNumber", ""));
			lorryHire.setVehicleNumberId(JSPUtility.GetLong(request, "selectedVehicleNoId", 0));
			lorryHire.setVehicleNumber(JSPUtility.GetString(request, "searchVehicle", ""));
			lorryHire.setSourceBranchId(JSPUtility.GetLong(request, "sourceBranchId", 0));
			lorryHire.setDestinationBranchId(JSPUtility.GetLong(request, "destinationBranchId", 0));
			lorryHire.setVehicleTypeId(JSPUtility.GetLong(request, "vehicleType", 0));
			lorryHire.setRatePerTon(JSPUtility.GetDouble(request, "ratePerTon", 0.00));
			lorryHire.setRatePerTrip(JSPUtility.GetDouble(request, "ratePerTrip", 0.00));
			lorryHire.setTotalLorryHireAmount(JSPUtility.GetDouble(request, "totalLorryHire", 0.00));
			lorryHire.setAdvanceAmount(JSPUtility.GetDouble(request, "advanceLorryHire", 0.00));
			lorryHire.setBalanceAmount(JSPUtility.GetDouble(request, "balanceLorryHire", 0.00));
			lorryHire.setBalancePayableAtBranchId(JSPUtility.GetLong(request, "balancePayableBranchId", 0));

			if(request.getParameter("searchCorporate") != null && JSPUtility.GetLong(request, "consignorCorpId") > 0 ){
				lorryHire.setMaterialOwnerName(JSPUtility.GetString(request, "creditorName", "").toUpperCase());
			} else {
				lorryHire.setMaterialOwnerName(JSPUtility.GetString(request, "materialOwner", "").toUpperCase());
			}
			
			lorryHire.setCreditorId(JSPUtility.GetLong(request, "consignorCorpId",0));
			lorryHire.setAmountOfWayBill(JSPUtility.GetDouble(request, "billAmount", 0.00));
			lorryHire.setMarketingOfficerName(JSPUtility.GetString(request, "marketingOfficerName", "").toUpperCase());
			lorryHire.setPaymentType(JSPUtility.GetShort(request, "paymentType", (short)0));
			lorryHire.setLoadedBy(JSPUtility.GetShort(request, "loadedBy", (short)0));
			lorryHire.setLorrySupplierContactPerson(JSPUtility.GetString(request, "supplierContactPerson", "").toUpperCase());
			lorryHire.setAdvancePaidByBranchId(JSPUtility.GetLong(request, "advancePaidByBranchId",0));
			lorryHire.setDriverMasterId(JSPUtility.GetLong(request, "driverMasterId", 0));

			//Cheque Date Date calculation (Start)
			dt = JSPUtility.GetString(request, "chequeDate", "");
			if (dt == "") {
			} else {
				try {
					strDate = dt + " 00:00:00";
					sdf		= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
					fDate	= sdf.parse(strDate);
					date	= new Timestamp(fDate.getTime());
					lorryHire.setChequeDate(date);
				} catch (Exception e) {
					e.printStackTrace();
					LogWriter.writeLog("LOGINVALIDATOR", LogWriter.LOG_LEVEL_ERROR, e);
				}
			}
			//Cheque Date Date calculation (End)
			lorryHire.setChequeNumber(JSPUtility.GetString(request, "chequeNo", null));
			lorryHire.setChequeAmount(JSPUtility.GetDouble(request, "chequeAmount", 0.00));
			lorryHire.setBankName(JSPUtility.GetString(request, "bankName", null));
			lorryHire.setStatus(LorryHireConstant.STATUS_LORRY_HIRED);
			lorryHire.setRouteFromBranchIds(request.getParameter("fromBranchIds"));
			lorryHire.setRouteToBranchIds(request.getParameter("toBranchIds"));

			if(lorryHire.getPaymentType() != PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID) {
				lorryHire.setChequeDate(null);
				lorryHire.setChequeNumber(null);
				lorryHire.setChequeAmount(0.00);
				lorryHire.setBankName(null);
			}

			return lorryHire;

		} catch (Exception e) {
			e.printStackTrace();
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, e);
			throw e;
		} finally {
			lorryHire	= null;
			createDate	= null;
			dt			= null;
			strDate		= null;
			sdf			= null;
			fDate		= null;
			date		= null;
		}
	}
}