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
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.ConsignmentDetailsDao;
import com.platform.dao.ConsignmentSummaryDao;
import com.platform.dao.CrossingExpenseReportDao;
import com.platform.dao.CustomerDetailsDao;
import com.platform.dao.WayBillDao;
import com.platform.dto.ConsignmentDetails;
import com.platform.dto.ConsignmentSummary;
import com.platform.dto.CustomerDetails;
import com.platform.dto.Executive;
import com.platform.dto.TransportCommonMaster;
import com.platform.dto.WayBill;
import com.platform.dto.model.CrossingExpense;
import com.platform.dto.model.ReportViewModel;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

public class CrossingExpenseViewBranchAction implements Action {

	private static final String TRACE_ID = "CrossingExpenseViewBranchAction";

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		// TODO Auto-generated method stub

		HashMap<String,Object>	 			error 					= null;
		Executive        					executive   			= null;
		CrossingExpense[] 					reportModel 			= null;
		Long[] 								wayBillIdArray			= null;
		CacheManip 							cacheManip 				= null;
		ReportViewModel 					reportViewModel 		= null;
		SimpleDateFormat   					dateFormatForTimeLog 	= null;
		SimpleDateFormat 					sdf            			= null;
		Timestamp        					fromDate       			= null;
		Timestamp        					toDate         			= null;
		ValueObject 						objectOut 				= null;
		HashMap<Long, ConsignmentSummary> 	conSumColl 				= null;
		HashMap<Long, WayBill> 				lrColl  				= null;
		String								wayBillStr				= null;
		//HashMap<Long,WayBillTaxTxn >		taxDtlsCol				= null;
		HashMap<Long, CustomerDetails> 		consignor				= null;
		HashMap<Long, CustomerDetails> 		consignee				= null;
		HashMap<Long, ArrayList<ConsignmentDetails>> conDtlsCol 	= null;
		ArrayList<ConsignmentDetails> 		conDtlsArr				= null;
		ConsignmentDetails 					consgnmnt 				= null;
		StringBuilder 						pkgDetails 				= null;
		long								reportType				= 0;
		long								commonId				= 0;
		long								crossingId				= 0;
		String								srcBranchId				= null;
		String								crossingBranchId		= null;
		long								subRegionId				= 0;
		String							    branchIds				= null;

		try {

			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final long startTime = System.currentTimeMillis();

			sdf			= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			fromDate	= new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00").getTime());
			toDate		= new Timestamp(sdf.parse(JSPUtility.GetString(request, "toDate") + " 23:59:59").getTime());

			executive   = (Executive) request.getSession().getAttribute("executive");
			cacheManip  = new CacheManip(request);
			reportType  = Long.parseLong(request.getParameter("reportType"));
			commonId  	= JSPUtility.GetLong(request,"commonId");
			crossingId	= JSPUtility.GetLong(request,"crossingId");
			subRegionId = JSPUtility.GetLong(request,"subRegionId",0);

			if(subRegionId > 0)
				branchIds = cacheManip.getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_SUBREGION, subRegionId);

			if(reportType > 0){

				if(reportType == TransportCommonMaster.INCOMING_ID){
					if(crossingId <= 0)
						srcBranchId			= branchIds;
					else
						srcBranchId			= ""+crossingId;

					crossingBranchId	    = ""+commonId;
					objectOut = CrossingExpenseReportDao.getInstance().getWayBillCrossingDetailsBySourceAndCrossingBranchId(executive.getAccountGroupId(), srcBranchId, crossingBranchId, fromDate, toDate);
				} else if(reportType == TransportCommonMaster.OUTGOING_ID){
					if(crossingId <= 0)
						crossingBranchId	= branchIds;
					else
						crossingBranchId	= ""+crossingId;

					srcBranchId			    =  ""+commonId;
					objectOut = CrossingExpenseReportDao.getInstance().getWayBillCrossingDetailsBySourceAndCrossingBranchId(executive.getAccountGroupId(), srcBranchId, crossingBranchId, fromDate, toDate);
				}

				if(objectOut != null) {

					reportModel 	= (CrossingExpense[])objectOut.get("wayBillCrossingArr");
					wayBillIdArray 	= (Long[]) objectOut.get("WayBillIdArray");

					wayBillStr 		= Utility.GetLongArrayToString(wayBillIdArray);

					lrColl			= WayBillDao.getInstance().getLimitedLRDetails(wayBillStr);
					conSumColl 		= ConsignmentSummaryDao.getInstance().getConsignmentSummaryWeightsByWayBillIds(wayBillStr);
					consignor 		= CustomerDetailsDao.getInstance().getConsignorDetailsByWayBillId(wayBillStr);
					consignee 		= CustomerDetailsDao.getInstance().getConsigneeDetailsByWayBillId(wayBillStr);
					conDtlsCol 		= ConsignmentDetailsDao.getInstance().getConsignmentDetailsByWayBillIds(wayBillStr);


					if (reportModel != null && wayBillIdArray != null) {

						for (final CrossingExpense element : reportModel) {

							conDtlsArr = null;
							element.setSourceBranch(cacheManip.getGenericBranchDetailCache(request,element.getSourceBranchId()).getName());
							if(element.getDestinationBranchId() > 0)
								element.setDestinationBranch(cacheManip.getGenericBranchDetailCache(request,element.getDestinationBranchId()).getName());
							else
								element.setDestinationBranch("--");

							element.setConsignor(consignor.get(element.getWayBillId()).getName());
							element.setConsignee(consignee.get(element.getWayBillId()).getName());
							element.setWayBillTypeId(lrColl.get(element.getWayBillId()).getWayBillTypeId());
							element.setWayBillType(lrColl.get(element.getWayBillId()).getWayBillType());
							element.setActualWeight(conSumColl.get(element.getWayBillId()).getActualWeight());
							element.setPackageQuantity(conSumColl.get(element.getWayBillId()).getQuantity());
							element.setGrandTotal(lrColl.get(element.getWayBillId()).getGrandTotal());
							element.setTaxAmount(lrColl.get(element.getWayBillId()).getBookingTimeServiceTax());
							element.setBookingDateTime(lrColl.get(element.getWayBillId()).getBookingDateTime());
							element.setBookingDateTimeStr(DateTimeUtility.getDateFromTimeStampWithAMPM(element.getBookingDateTime()));
							
							conDtlsArr = conDtlsCol.get(element.getWayBillId());
							pkgDetails = new StringBuilder();

							for(int j=0;j<conDtlsArr.size();j++) {
								consgnmnt = conDtlsArr.get(j);
								if(j == 0) {
									pkgDetails.append(consgnmnt.getQuantity()+" "+consgnmnt.getPackingTypeName());
									element.setWayBillNumber(consgnmnt.getWayBillNumber());
								} else
									pkgDetails.append("/ "+consgnmnt.getQuantity()+" "+consgnmnt.getPackingTypeName());
							}
							element.setPackageDetails(pkgDetails.toString());
						}

						request.setAttribute("reportModel", reportModel);

					} else {
						LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO, (String) error.get("errorCode")+" "+(String) error.get("errorDescription"));
						error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
						error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
						request.setAttribute("cargoError", error);
					}
				} else {
					LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO, (String) error.get("errorCode")+" "+(String) error.get("errorDescription"));
					error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
					error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
					request.setAttribute("cargoError", error);
				}

				reportViewModel = new ReportViewModel();
				reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);
				request.setAttribute("ReportViewModel",reportViewModel);

			} else {
				LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO, (String) error.get("errorCode")+" "+(String) error.get("errorDescription"));
				error.put("errorCode", CargoErrorList.REPORT_TYPE_MISSING);
				error.put("errorDescription", CargoErrorList.REPORT_TYPE_MISSING_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}
			request.setAttribute("nextPageToken", "success");

			dateFormatForTimeLog = new SimpleDateFormat("mm:ss");
			dateFormatForTimeLog.setTimeZone(TimeZone.getTimeZone("GMT"));
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO,"=====Report Generated CrossingExpenseViewBranchAction "+executive.getAccountGroupId()+" "+executive.getBranchId()+" "+executive.getExecutiveId()+" in "+dateFormatForTimeLog.format(new Date(System.currentTimeMillis()-startTime)));

		} catch (final Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		} finally {
			executive   		= null;
			reportModel 		= null;
			cacheManip 			= null;
			reportViewModel 	= null;
			dateFormatForTimeLog= null;
			sdf            		= null;
			fromDate       		= null;
			toDate         		= null;
			objectOut 			= null;
			wayBillIdArray		= null;
			conSumColl 			= null;
			lrColl  			= null;
			wayBillStr			= null;

		}
	}
}