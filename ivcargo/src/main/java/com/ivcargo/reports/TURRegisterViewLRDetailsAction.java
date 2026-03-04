package com.ivcargo.reports;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.TimeZone;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.logsapp.LogWriter;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.TURRegisterDao;
import com.platform.dto.Branch;
import com.platform.dto.Executive;
import com.platform.dto.TURRegisterReportModel;
import com.platform.dto.configuration.report.TurReportConfigurationDTO;
import com.platform.dto.model.BusinessFunctionConstants;

public class TURRegisterViewLRDetailsAction implements Action {

	private static final String TRACE_ID = "TURRegisterViewLRDetailsAction";
	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	 				error 								= null;
		Executive        						executive      						= null;
		CacheManip 								cManip 								= null;
		SimpleDateFormat 						dateForTimeLog 						= null;
		Branch									branch								= null;
		TURRegisterReportModel 					bkgchargeModel						= null;
		HashMap<Long,TURRegisterReportModel> 	bkGChargeCollection					= null;
		ValueObject								turConfiguration					= null;
		var									showToPayColumn						= false;
		var									showPaidColumn						= false;
		var									showTBBColumn						= false;
		var									showToPayServiceTax					= false;
		var									hideLRCount							= false;
		var									showBookingCharges					= false;
		var									hideFreightCharge					= false;
		var									showToPayFrghtAmtAfterDlyBilCrdt	= false;
		var									isAmountShowOnce					= false;
		var									showArrivalDateTimeColumn			= false;
		var									showLorryHireColumn					= false;
		var									showLorryHireAdvanceColumn			= false;
		var									showLorryHireBalanceColumn			= false;
		var									showViewLRDetails					= false;
		var									receiveLedgerId						= 0L;
		ArrayList<TURRegisterReportModel>       resultList							= null;
		TURRegisterReportModel[]				resultArray							= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error))
				return;
			final var startTime = System.currentTimeMillis();

			executive	= (Executive) request.getSession().getAttribute("executive");
			cManip 		= new CacheManip(request);
			receiveLedgerId = JSPUtility.GetLong(request, "receivedLedgerId",0);

			final var accountGroupId = executive.getAccountGroupId();

			turConfiguration			    	= ReadAllConfigurationsBllImpl.getInstance().getOldReportConfigurationData(ReportIdentifierConstant.TUR_REGISTER, executive.getAccountGroupId());
			showToPayColumn						= turConfiguration.getBoolean(TurReportConfigurationDTO.SHOW_TOPAY_COLUMN, false);
			showPaidColumn						= turConfiguration.getBoolean(TurReportConfigurationDTO.SHOW_PAID_COLUMN, false);
			showTBBColumn						= turConfiguration.getBoolean(TurReportConfigurationDTO.SHOW_TBB_COLUMN, false);
			showToPayServiceTax					= turConfiguration.getBoolean(TurReportConfigurationDTO.SHOW_TOPAY_SERVICE_TAX, false);
			hideLRCount							= turConfiguration.getBoolean(TurReportConfigurationDTO.HIDE_LR_COUNT, false);
			showBookingCharges					= turConfiguration.getBoolean(TurReportConfigurationDTO.SHOW_BOOKING_CHARGES, false);
			hideFreightCharge					= turConfiguration.getBoolean(TurReportConfigurationDTO.HIDE_FREIGHT_CHARGE, false);
			isAmountShowOnce					= turConfiguration.getBoolean(TurReportConfigurationDTO.IS_AMOUNT_SHOW_ONCE);
			showToPayFrghtAmtAfterDlyBilCrdt 	= turConfiguration.getBoolean(TurReportConfigurationDTO.SHOW_TO_PAY_FREIGHT_AMT_AFTER_DELIVERY_BILL_CREDIT, false);
			showArrivalDateTimeColumn			= turConfiguration.getBoolean(TurReportConfigurationDTO.SHOW_ARRIVAL_DATE_TIME_COLUMN, false);
			showLorryHireColumn					= turConfiguration.getBoolean(TurReportConfigurationDTO.SHOW_LORRY_HIRE_COLUMN, false);
			showLorryHireAdvanceColumn			= turConfiguration.getBoolean(TurReportConfigurationDTO.SHOW_LORRY_HIRE_ADVANCE_COLUMN, false);
			showLorryHireBalanceColumn			= turConfiguration.getBoolean(TurReportConfigurationDTO.SHOW_LORRY_HIRE_BALANCE_COLUMN, false);
			showViewLRDetails					= turConfiguration.getBoolean(TurReportConfigurationDTO.SHOW_VIEW_LR_DETAILS, false);

			resultList		 					= TURRegisterDao.getInstance().getTURAmount(receiveLedgerId,showToPayFrghtAmtAfterDlyBilCrdt,isAmountShowOnce);

			if(showBookingCharges)
				bkGChargeCollection		        = TURRegisterDao.getInstance().getTurBookingChargesByReceivedLedgerId(receiveLedgerId, accountGroupId, isAmountShowOnce);

			if(resultList != null && resultList.size() > 0){

				for (final TURRegisterReportModel element : resultList) {

					branch	= cManip.getGenericBranchDetailCache(request,element.getSourceBranchId());
					element.setSourceBranch(branch.getName());

					branch	= cManip.getGenericBranchDetailCache(request,element.getDestinationBranchId());
					element.setDestinationBranch(branch.getName());

					element.setSourceBranch(cManip.getGenericBranchDetailCache(request,element.getSourceBranchId()).getName());

					if(showBookingCharges && bkGChargeCollection != null){
						bkgchargeModel	= 	bkGChargeCollection.get(element.getWayBillId());
						if(bkgchargeModel != null){
							element.setWayBillCarreirRiskCharge(bkgchargeModel.getWayBillCarreirRiskCharge());
							element.setWayBillCrInsuranceCharge(bkgchargeModel.getWayBillCrInsuranceCharge());
							element.setWayBillBhCharge(bkgchargeModel.getWayBillBhCharge());
						}
					}
				}

				resultArray = new TURRegisterReportModel[resultList.size()];
				resultList.toArray(resultArray);
			}

			request.setAttribute("report", resultArray);
			request.setAttribute("showToPayColumn", showToPayColumn);
			request.setAttribute("showPaidColumn", showPaidColumn);
			request.setAttribute(TurReportConfigurationDTO.SHOW_TBB_COLUMN, showTBBColumn);
			request.setAttribute(TurReportConfigurationDTO.SHOW_TOPAY_SERVICE_TAX, showToPayServiceTax);
			request.setAttribute(TurReportConfigurationDTO.HIDE_LR_COUNT, hideLRCount);
			request.setAttribute(TurReportConfigurationDTO.SHOW_BOOKING_CHARGES, showBookingCharges);
			request.setAttribute(TurReportConfigurationDTO.HIDE_FREIGHT_CHARGE, hideFreightCharge);
			request.setAttribute(TurReportConfigurationDTO.SHOW_ARRIVAL_DATE_TIME_COLUMN, showArrivalDateTimeColumn);
			request.setAttribute(TurReportConfigurationDTO.SHOW_LORRY_HIRE_COLUMN, showLorryHireColumn);
			request.setAttribute(TurReportConfigurationDTO.SHOW_LORRY_HIRE_ADVANCE_COLUMN, showLorryHireAdvanceColumn);
			request.setAttribute(TurReportConfigurationDTO.SHOW_LORRY_HIRE_BALANCE_COLUMN, showLorryHireBalanceColumn);
			request.setAttribute(TurReportConfigurationDTO.SHOW_VIEW_LR_DETAILS, showViewLRDetails);
			request.setAttribute(TurReportConfigurationDTO.SHOW_RECEIVED_THROUGH, turConfiguration.getBoolean(TurReportConfigurationDTO.SHOW_RECEIVED_THROUGH, false));

			ActionStaticUtil.setReportViewModel(request);
			request.setAttribute("nextPageToken", "success");

			dateForTimeLog = new SimpleDateFormat("mm:ss");
			dateForTimeLog.setTimeZone(TimeZone.getTimeZone("GMT"));
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO,"=====Report Generated "+BusinessFunctionConstants.LSBOOKINGREGISTER +" "+executive.getAccountGroupId()+" "+executive.getBranchId()+" "+executive.getExecutiveId()+" in "+dateForTimeLog.format(new Date(System.currentTimeMillis()-startTime)));
		} catch (final Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		} finally {
			error 					= null;
			executive      			= null;
			cManip 					= null;
			dateForTimeLog 			= null;
			branch					= null;
		}
	}
}