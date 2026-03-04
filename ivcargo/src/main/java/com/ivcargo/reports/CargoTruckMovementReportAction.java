package com.ivcargo.reports;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.TimeZone;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.logsapp.LogWriter;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.ConsignmentSummaryDao;
import com.platform.dao.DispatchSummaryDao;
import com.platform.dao.WayBillDao;
import com.platform.dao.reports.CargoTruckMovementReportDao;
import com.platform.dto.ConsignmentSummary;
import com.platform.dto.Executive;
import com.platform.dto.WayBill;
import com.platform.dto.constant.WayBillTypeConstant;
import com.platform.dto.model.BusinessFunctionConstants;
import com.platform.dto.model.CargoTruckMovementReportModel;
import com.platform.dto.model.ReportViewModel;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;
@Deprecated
public class CargoTruckMovementReportAction implements Action {

	private static final String TRACE_ID = "CargoTruckMovementReportAction";

	@SuppressWarnings("unchecked")
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		// TODO Auto-generated method stub
		HashMap<String,Object>	error 		= null;
		Executive   		executive 		= null;
		ValueObject 		objectIn 		= null;
		SimpleDateFormat 	sdf         	= null;
		Timestamp        	fromDate    	= null;
		Timestamp        	toDate      	= null;
		ValueObject			objectOut		= null;

		ReportViewModel 	reportViewModel = null;
		SimpleDateFormat 	dateForTimeLog 	= null;
		CacheManip			cache			= null;

		CargoTruckMovementReportModel[]  	reportModel 			= null;
		WayBill								waybill					= null;
		ConsignmentSummary					consignmentSummary		= null;
		Long[] 								dispatchLedgerIdsArray 	= null;
		String								dispatchLedgerIds		= null;
		ArrayList<Long>						waybillIdsArrayList		= null;
		ValueObject							objectOutDispatchSummary				= null;
		ArrayList<Long>						waybillIdsArrayListOfDispatchLedger		= null;
		Long[] 								waybillIdsArray 		= null;
		Long[] 								waybillIdsArrayLong 	= null;
		String								waybillIds				= null;
		HashMap<Long, ArrayList<Long>>		dispatchLedgerHM		= null;
		HashMap<Long, WayBill> 				wayBillHM				= null;
		HashMap<Long, ConsignmentSummary> 	conSumHM				= null;

		long	startTime   		= 0;
		long 	vehicleMasterId 	= 0;
		double 	waybillbookingTotal	= 0;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error)){
				return;
			}
			startTime = System.currentTimeMillis();
			new InitializeTruckMovementReportAction().execute(request, response);

			executive 		= (Executive) request.getSession().getAttribute("executive");
			objectIn 		= new ValueObject();
			sdf         	= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			fromDate    	= new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00").getTime());
			toDate      	= new Timestamp(sdf.parse(JSPUtility.GetString(request, "toDate") + " 23:59:59").getTime());
			vehicleMasterId = JSPUtility.GetLong(request, "selectedVehicleNo");

			objectIn.put("fromDate", fromDate);
			objectIn.put("toDate", toDate);
			objectIn.put("accountGroupId", executive.getAccountGroupId());
			objectIn.put("vehicleMasterId", vehicleMasterId);
			objectOut 		= CargoTruckMovementReportDao.getInstance().getCargoTruckMovementReport(objectIn);

			if(objectOut!=null){

				reportModel 			= (CargoTruckMovementReportModel[]) objectOut.get("CargoTruckMovementReportModel");
				if(reportModel != null) {
					dispatchLedgerIdsArray	= (Long[])objectOut.get("dispatchLedgerIdsArr");
					dispatchLedgerIds		= Utility.GetLongArrayToString(dispatchLedgerIdsArray);

					objectOutDispatchSummary= DispatchSummaryDao.getInstance().getDispatchSummaryByDispatchLedgerIds(dispatchLedgerIds);
					dispatchLedgerHM		= new HashMap<Long, ArrayList<Long>>();				
					dispatchLedgerHM	  	= (HashMap<Long, ArrayList<Long>>) objectOutDispatchSummary.get("dispachLedgerWithWaybillids");

					waybillIdsArrayList 	= (ArrayList<Long>) objectOutDispatchSummary.get("waybillIdsForCreatingString");
					waybillIdsArrayList 	= Utility.removeLongDuplicateElementsFromArrayList(waybillIdsArrayList);
					waybillIdsArrayLong 	= new Long[waybillIdsArrayList.size()];
					waybillIdsArrayList.toArray(waybillIdsArrayLong);
					waybillIds				= Utility.GetLongArrayToString(waybillIdsArrayLong);

					wayBillHM 				= WayBillDao.getInstance().getLimitedLRDetailsbyLRIds(waybillIds);
					conSumHM 				= ConsignmentSummaryDao.getInstance().getLimitedConsignmentDetails(waybillIds);

					cache = new CacheManip(request);

					for(int i=0; i<reportModel.length; i++) {
						//reportModel[i].setSourceCityName(cache.getCityById(request, reportModel[i].getSourceCityId()).getName());
						reportModel[i].setSourceBranchName(cache.getGenericBranchDetailCache(request, reportModel[i].getSourceBranchId()).getName());
						//reportModel[i].setDestinationCityName(cache.getCityById(request, reportModel[i].getDestinationCityId()).getName());
						reportModel[i].setDestinationBranchName(cache.getGenericBranchDetailCache(request, reportModel[i].getDestinationBranchId()).getName());

						waybillIdsArrayListOfDispatchLedger	= dispatchLedgerHM.get(reportModel[i].getDispatchLedgerId());

						if(waybillIdsArrayListOfDispatchLedger != null) {

							waybillIdsArray	= new Long[waybillIdsArrayListOfDispatchLedger.size()];
							waybillIdsArrayListOfDispatchLedger.toArray(waybillIdsArray);

							for(int j=0; j<waybillIdsArray.length; j++) {
								waybill				= wayBillHM.get(waybillIdsArray[j]);
								consignmentSummary	= conSumHM.get(waybillIdsArray[j]);
								waybillbookingTotal	= waybill.getBookingTotal();
								if(waybill.getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_PAID){
									reportModel[i].setBookingPaidAmount(reportModel[i].getBookingPaidAmount() + waybillbookingTotal);
									reportModel[i].setPaidNoOfPkgs(reportModel[i].getPaidNoOfPkgs() + consignmentSummary.getQuantity());
								}else if(waybill.getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_TO_PAY){
									reportModel[i].setBookingToPayAmount(reportModel[i].getBookingToPayAmount() + waybillbookingTotal);								
									reportModel[i].setToPayNoOfPkgs(reportModel[i].getToPayNoOfPkgs() + consignmentSummary.getQuantity());
								}else if(waybill.getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_FOC){
									reportModel[i].setFocNoOfPkgs(reportModel[i].getFocNoOfPkgs() + consignmentSummary.getQuantity());
								}else if(waybill.getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_CREDIT){
									reportModel[i].setBookingCreditAmount(reportModel[i].getBookingCreditAmount() + waybillbookingTotal);								
									reportModel[i].setCreditNoOfPkgs(reportModel[i].getCreditNoOfPkgs() + consignmentSummary.getQuantity());
								}						
								reportModel[i].setNumberOfPackages(reportModel[i].getNumberOfPackages() + consignmentSummary.getQuantity());
								reportModel[i].setBookingTotalAmount(reportModel[i].getBookingTotalAmount()+waybillbookingTotal);
							}
						}
					}

					request.setAttribute("reportModel",reportModel);
					reportViewModel = new ReportViewModel();
					reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);
					request.setAttribute("ReportViewModel",reportViewModel);
				}

			} else {
				LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO, (String) error.get("errorCode")+" "+(String) error.get("errorDescription"));
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}

			request.setAttribute("nextPageToken", "success");
			dateForTimeLog = new SimpleDateFormat("mm:ss.SSS");
			dateForTimeLog.setTimeZone(TimeZone.getTimeZone("GMT"));
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO,"=====Report Generated "+BusinessFunctionConstants.CARGOTRUCKMOVEMENTREPORT+" "+executive.getAccountGroupId()+" "+executive.getBranchId()+" "+executive.getExecutiveId()+" in "+dateForTimeLog.format(new Date(System.currentTimeMillis()-startTime)));

		} catch (Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);

		} finally {
			executive 							= null;
			objectIn 							= null;
			sdf         						= null;
			fromDate    						= null;
			toDate      						= null;
			objectOut							= null;
			objectOutDispatchSummary			= null;
			reportViewModel 					= null;
			dateForTimeLog 						= null;
			cache								= null;

			reportModel 						= null;
			waybill								= null;
			consignmentSummary					= null;
			dispatchLedgerIdsArray 				= null;
			dispatchLedgerIds					= null;
			waybillIdsArrayList					= null;

			waybillIdsArrayListOfDispatchLedger	= null;
			waybillIdsArray 					= null;
			waybillIdsArrayLong 				= null;
			waybillIds							= null;
			dispatchLedgerHM					= null;
			wayBillHM							= null;
			conSumHM							= null;
		}
	}
}
