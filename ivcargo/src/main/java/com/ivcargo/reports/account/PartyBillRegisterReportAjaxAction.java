package com.ivcargo.reports.account;

//~--- non-JDK imports --------------------------------------------------------

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringUtils;
import org.json.JSONArray;
import org.json.JSONObject;

import com.framework.Action;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.dto.constant.BillClearanceStatusConstant;
import com.iv.dto.constant.FeildPermissionsConstant;
import com.iv.dto.constant.PaymentTypeConstant;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.constant.DateTimeFormatConstant;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.reports.account.initialize.InitializePartyBillRegisterReportAction;
import com.ivcargo.utils.CacheManip;
import com.ivcargo.utils.JsonUtility;
import com.platform.dao.reports.BillDAO;
import com.platform.dto.BillDetailsForPartyBill;
import com.platform.dto.Executive;
import com.platform.dto.model.DayWiseDateModel;
import com.platform.dto.model.ReportViewModel;
import com.platform.utils.Utility;

public class PartyBillRegisterReportAjaxAction implements Action {

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {

		HashMap<String,Object>	 			error 					= null;
		Timestamp        					fromDate       			= null;
		Timestamp        					toDate         			= null;
		JSONObject			 			    jsonObjectGet		    = null;
		JSONObject					        jsonObjectOut			= null;
		var									time		  			= 0;
		Calendar			           		calCurrentDateTime		= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			final var	cache = new CacheManip(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializePartyBillRegisterReportAction().execute(request, response);

			jsonObjectOut	= new JSONObject();
			jsonObjectGet	= new JSONObject(request.getParameter("json"));

			response.setContentType("application/json");

			if(jsonObjectGet.get("timeDuration") != null)
				try {
					time = Integer.parseInt(StringUtils.trim(jsonObjectGet.get("timeDuration").toString()));
				} catch (final NumberFormatException ne) {
					throw new Exception("ErrorCode.ATTRIBUTE_NOT_INTEGER"+"timeDuration");
				}

			if(time == DayWiseDateModel.DAY_WISE_CUSTOM_ID) {
				final var	sdf			= new SimpleDateFormat(DateTimeFormatConstant.DD_MM_YY_HH_MM_SS);

				if(jsonObjectGet.optString("fromDate", null) != null)
					fromDate	= new Timestamp(sdf.parse(jsonObjectGet.get("fromDate") + " 00:00:00").getTime());

				if(jsonObjectGet.optString("toDate", null) != null)
					toDate		= new Timestamp(sdf.parse(jsonObjectGet.get("toDate") + " 23:59:59").getTime());
			} else if(time == DayWiseDateModel.DAY_WISE_LAST_MONTH_ID) {

				/*
				 * Here we are formatting the date for getting report of 3 month , 6 month ,12 month
				 *
				 */
				calCurrentDateTime 	= Calendar.getInstance();

				calCurrentDateTime.add(Calendar.DATE, -(time-2));
				calCurrentDateTime.set(Calendar.DAY_OF_MONTH, 1);

				final var 	timeconvert = new Timestamp(calCurrentDateTime.getTimeInMillis());

				fromDate			= Utility.getDateTime(new SimpleDateFormat(DateTimeFormatConstant.DD_MM_YYYY).format(timeconvert));
				calCurrentDateTime 	= Calendar.getInstance();

				calCurrentDateTime.set(Calendar.DAY_OF_MONTH, 1);
				calCurrentDateTime.add(Calendar.DATE, -1);

				calCurrentDateTime.set(Calendar.HOUR_OF_DAY, 23);
				calCurrentDateTime.set(Calendar.MINUTE, 59);
				calCurrentDateTime.set(Calendar.SECOND, 59);

				final var timeconvert1=new Timestamp(calCurrentDateTime.getTimeInMillis());
				toDate	= Utility.getDateTime(new SimpleDateFormat(DateTimeFormatConstant.DD_MM_YY_HH_MM_SS).format(timeconvert1));

			} else {
				calCurrentDateTime 	= Calendar.getInstance();
				calCurrentDateTime.add(Calendar.DATE, -time);

				final var timeconvert = new Timestamp(calCurrentDateTime.getTimeInMillis());

				fromDate			= Utility.getDateTime(new SimpleDateFormat(DateTimeFormatConstant.DD_MM_YYYY).format(timeconvert));
				calCurrentDateTime 	= Calendar.getInstance();

				calCurrentDateTime.set(Calendar.HOUR_OF_DAY, 23);
				calCurrentDateTime.set(Calendar.MINUTE, 59);
				calCurrentDateTime.set(Calendar.SECOND, 59);

				final var timeconvert1 = new Timestamp(calCurrentDateTime.getTimeInMillis());

				toDate	= Utility.getDateTime(new SimpleDateFormat(DateTimeFormatConstant.DD_MM_YY_HH_MM_SS).format(timeconvert1));
			}

			final var	creditor    = Long.parseLong(jsonObjectGet.get("billingPartyId")+"");

			final var	executive	= (Executive) request.getSession().getAttribute("executive");

			final var	configuration	= ReadAllConfigurationsBllImpl.getInstance().getOldReportConfigurationData(ReportIdentifierConstant.PARTY_BILL_REGISTER_REPORT, executive.getAccountGroupId());

			final var accountGroupId 	= executive.getAccountGroupId();

			final var	reports		= BillDAO.getInstance().getCreditorDetailsByAccountgroupAndCreditor(fromDate, toDate, accountGroupId, creditor );
			request.setAttribute("agentName", executive.getName());

			if(reports != null)
				for (final BillDetailsForPartyBill report : reports) {
					report.setTransactionTypeString(PaymentTypeConstant.getPaymentType(report.getTransactionType()));
					report.setStatusBillString(BillClearanceStatusConstant.getBillClearanceStatus(report.getStatusBill()));

					report.setGrandTotal(report.getGrandTotal() + report.getAdditionalCharge());
					report.setCreationDateTimeStampBillString(DateTimeUtility.getDateFromTimeStampWithAMPM(report.getCreationDateTimeStampBill()));
					report.setCreationDateTimeStampBillClearanceString(DateTimeUtility.getDateFromTimeStampWithAMPM(report.getCreationDateTimeStampBillClearance()));
					report.setCheckDateString(DateTimeUtility.getDateFromTimeStamp(report.getCheckDate()));

					final var	branch	= cache.getGenericBranchDetailCache(request, report.getBranchId());
					report.setBranchName(branch.getName());

					report.setTotalAmount(report.getGrandTotal() - report.getServiceTax());
				}

			ActionStaticUtil.setReportViewModel(request);
			final var 		reportViewModel				= (ReportViewModel)request.getAttribute("ReportViewModel");

			jsonObjectOut.put("accountGroupNameForPrint", request.getAttribute("accountGroupNameForPrint"));
			jsonObjectOut.put("branchAddress", reportViewModel.getBranchAddress());
			jsonObjectOut.put("branchPhoneNumber", reportViewModel.getBranchPhoneNumber());
			jsonObjectOut.put("isDataPresent", true);
			jsonObjectOut.put("configuration", JsonUtility.convertionToJsonObjectForResponse(configuration));

			if(reports != null) {
				jsonObjectOut.put("isDataPresent", true);
				jsonObjectOut.put("partyBillRegister", partyBillRegisterJSONArray(reports));
				jsonObjectOut.put("fromDate", DateTimeUtility.getDateFromTimeStamp(fromDate));
				jsonObjectOut.put("toDate", DateTimeUtility.getDateFromTimeStamp(toDate));
				jsonObjectOut.put("isExcelButtonAllowed", request.getAttribute(Long.toString(FeildPermissionsConstant.EXCEL_BUTTON)));
			} else
				jsonObjectOut.put("isDataPresent",false);

			response.getWriter().println(jsonObjectOut);
			response.getWriter().flush();
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}

	private JSONArray partyBillRegisterJSONArray(final BillDetailsForPartyBill[] reports) throws Exception {
		try {
			final var	valueObject	= new JSONArray();

			for (final BillDetailsForPartyBill lSBookingRegisterReport : reports)
				valueObject.put(new JSONObject(lSBookingRegisterReport));

			return valueObject;
		} catch (final Exception e) {
			throw e;
		}
	}
}