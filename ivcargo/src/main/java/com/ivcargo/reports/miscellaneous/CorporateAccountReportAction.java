package com.ivcargo.reports.miscellaneous;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
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
import com.ivcargo.reports.ReportView;
import com.ivcargo.reports.miscellaneous.initiliaze.InitializeCorporateAccountAction;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.ChargeTypeMasterDao;
import com.platform.dao.ConsignmentSummaryDao;
import com.platform.dao.CorporateAccountDao;
import com.platform.dao.CustomerDetailsDao;
import com.platform.dao.WayBillBookingChargesDao;
import com.platform.dao.reports.DeliveryCreditorReportDAO;
import com.platform.dao.reports.WayBillDetailsDAO;
import com.platform.dao.reports.WayBilllReportDao;
import com.platform.dto.Branch;
import com.platform.dto.ChargeTypeMaster;
import com.platform.dto.ConsignmentDetails;
import com.platform.dto.ConsignmentSummary;
import com.platform.dto.CorporateAccount;
import com.platform.dto.CustomerDetails;
import com.platform.dto.Executive;
import com.platform.dto.WayBillBookingCharges;
import com.platform.dto.constant.CargoAccountGroupConstant;
import com.platform.dto.model.BusinessFunctionConstants;
import com.platform.dto.model.ChargeTypeModel;
import com.platform.dto.model.CorporateAccountReportModel;
import com.platform.dto.model.DeliveryCreditorReportModel;
import com.platform.dto.model.ReportViewModel;
import com.platform.dto.model.WayBillDeatailsModel;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

public class CorporateAccountReportAction implements Action {

	private static final String TRACE_ID = "CorporateAccountReportAction";

	public void execute(HttpServletRequest request, HttpServletResponse response) {
		// TODO Auto-generated method stub
		HashMap<String, Object>									error 						= null;
		CorporateAccountReportModel[]  							reportModelBooking  		= null;
		DeliveryCreditorReportModel[]  							reportModelDelivery 		= null;
		StringBuffer											wayBillIds					= null;
		ChargeTypeModel[] 										bookingChrgsOfGrpArr		= null; 
		ValueObject         									valueOutObject 				= null;
		ReportViewModel 										reportViewModel   			= null;
		CorporateAccount 										corp 						= null;
		HashMap<Long, HashMap<Long, WayBillBookingCharges>> 	wayBillBookingchargesHM		= null;
		HashMap<Long, ChargeTypeModel> 							bookingChrgsOfGrpHM			= null;		
		HashMap<Long, Double>									totalBookingChrgsAmt		= null;
		HashMap<Long, WayBillBookingCharges>					chargeWiseHM				= null;
		double 													lastAmt						= 0;
		Branch													srcBranch					= null;
		Branch													destBranch					= null;
		long  													corporateAccountId 			= 0;
		short 													corporateAccountType 		= 0;
		String													waybillIds					= null;
		HashMap<Long, ConsignmentSummary> 						conSmryHM					= null;
		ConsignmentSummary										consignmentSum				= null;
		Branch													branch						= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request, error)) {
				return;
			}

			long startTime = System.currentTimeMillis();

			new InitializeCorporateAccountAction().execute(request, response);

			Executive 			executive 	= (Executive) request.getSession().getAttribute("executive");
			SimpleDateFormat 	sdf 		= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			Timestamp 			fromDate 	= new Timestamp((sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00")).getTime());
			Timestamp 			toDate 		= new Timestamp((sdf.parse(JSPUtility.GetString(request, "toDate") + " 23:59:00")).getTime());

			ValueObject         valueInObject  = new ValueObject();

			bookingChrgsOfGrpHM		= new HashMap<Long, ChargeTypeModel>(); 
			corporateAccountId 		=  JSPUtility.GetLong(request, "CACC", 0);

			if(corporateAccountId != 0) {
				corp = CorporateAccountDao.getInstance().findByCorporateAccountId(corporateAccountId);                	
			} else {
				corporateAccountId = -1;
			}

			valueInObject.put("deliveryCreditorId", corporateAccountId);
			valueInObject.put("dateAllowed", true);
			valueInObject.put("fromDate", fromDate);
			valueInObject.put("toDate", toDate);

			corporateAccountType 		= corp.getCorporateAccountType();

			switch(corporateAccountType) {

			case 1:
				valueOutObject = WayBilllReportDao.getInstance().getCorporateAccount(fromDate, toDate, executive.getAccountGroupId(), corporateAccountId);

				if (valueOutObject != null) {

					reportModelBooking 		= (CorporateAccountReportModel[]) valueOutObject.get("CorporateAccountReportModel");
					Long[] 					wayBillIdArray 		= (Long[]) valueOutObject.get("WayBillIdArray");

					if(reportModelBooking != null && wayBillIdArray != null) {

						CacheManip 						cache 				= new CacheManip(request);	
						ConsignmentDetails[] 			consignmentDetails 	= null;
						long 							quantity 			= 0;
						String 							pkgDetail			= "" ; 

						if(executive.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNT_GORUP_ID_SUGAMA_TRAVELS
								||executive.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNT_GROUP_ID_ACE_TRANS) {
							//Get Acc Grp Booking Charges
							bookingChrgsOfGrpArr = ChargeTypeMasterDao.getInstance().getCharges(executive.getAccountGroupId() + "", ChargeTypeMaster.WAYBILL_CHARGETYPE_BOOKING);

							for(int i = 0; i < bookingChrgsOfGrpArr.length; i++) {
								bookingChrgsOfGrpHM.put(bookingChrgsOfGrpArr[i].getChargeTypeMasterId(), bookingChrgsOfGrpArr[i]);
							}
							//Get Acc Grp Booking Charges

							//Get WayBill Charges ( Start )
							wayBillIds = new StringBuffer();

							for(int i = 0; i < wayBillIdArray.length; i++) {
								wayBillIds.append(wayBillIdArray[i] + ",");
							}

							wayBillBookingchargesHM	= WayBillBookingChargesDao.getInstance().getWayBillIdWiseChargesMap(wayBillIds.substring(0, wayBillIds.length() - 1));
							//Get WayBill Charges ( End )

							totalBookingChrgsAmt = new HashMap<Long,Double>();				

							for(Long wayBillId : wayBillBookingchargesHM.keySet()){
								chargeWiseHM = wayBillBookingchargesHM.get(wayBillId);

								for(Long chargeId : chargeWiseHM.keySet()) {
									if(totalBookingChrgsAmt.get(chargeId) == null) {
										totalBookingChrgsAmt.put(chargeId, chargeWiseHM.get(chargeId).getChargeAmount());
									} else {
										lastAmt 	= totalBookingChrgsAmt.get(chargeId);
										totalBookingChrgsAmt.put(chargeId, lastAmt + chargeWiseHM.get(chargeId).getChargeAmount());
									}
								}
							}

							request.setAttribute("totalBookingChrgsAmt", totalBookingChrgsAmt);
							request.setAttribute("bookingChrgsOfGrpHM", bookingChrgsOfGrpHM);
							request.setAttribute("wayBillBookingchargesHM", wayBillBookingchargesHM);
						}


						//Get WayBill Details code ( Start )
						HashMap<Long, WayBillDeatailsModel> wayBillDetails = WayBillDetailsDAO.getInstance().getWayBillDetails(wayBillIdArray, false, (short)0, false, (short)0, true);
						//Get WayBill Details code ( End )

						waybillIds		= Utility.GetLongArrayToString(wayBillIdArray);
						conSmryHM 	 	= ConsignmentSummaryDao.getInstance().getConsignmentSummaryWeightsByWayBillIds(waybillIds);

						for (int i = 0; i < reportModelBooking.length; i++) {

							srcBranch   = cache.getGenericBranchDetailCache(request, reportModelBooking[i].getSourceBranchId());
							destBranch  = cache.getGenericBranchDetailCache(request, reportModelBooking[i].getDestinationBranchId());

							reportModelBooking[i].setWayBillSourceSubRegionId(srcBranch.getSubRegionId());
							reportModelBooking[i].setWayBillDestinationSubRegionId(destBranch.getSubRegionId());

							reportModelBooking[i].setWayBillSourceSubRegion((cache.getGenericSubRegionById(request, reportModelBooking[i].getWayBillSourceSubRegionId())).getName());
							reportModelBooking[i].setWayBillDestinationSubRegion((cache.getGenericSubRegionById(request, reportModelBooking[i].getWayBillDestinationSubRegionId())).getName());

							consignmentDetails 	= wayBillDetails.get(reportModelBooking[i].getWayBillId()).getConsignmentDetails();
							quantity 			= 0;
							pkgDetail			= "" ; 

							for (int j = 0; j < consignmentDetails.length; j++) {
								quantity = quantity + consignmentDetails[j].getQuantity();

								if(j == 0) {
									pkgDetail = pkgDetail + consignmentDetails[j].getQuantity() +" "+ consignmentDetails[j].getPackingTypeName();
								} else {
									pkgDetail = pkgDetail + "/ "+ consignmentDetails[j].getQuantity() +" "+ consignmentDetails[j].getPackingTypeName();
								}
							}
							reportModelBooking[i].setNoOfPackages(quantity);
							reportModelBooking[i].setTypeOfPackages(pkgDetail);

							if(conSmryHM != null) {
								consignmentSum		= conSmryHM.get(reportModelBooking[i].getWayBillId());
								reportModelBooking[i].setActualWeight(consignmentSum.getActualWeight());
							} else {
								reportModelBooking[i].setActualWeight(0.0);
							}

							if(executive.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNT_GORUP_ID_SUGAMA_TRAVELS
									||executive.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNT_GROUP_ID_ACE_TRANS){
								if(wayBillBookingchargesHM.get(reportModelBooking[i].getWayBillId()) != null){
									reportModelBooking[i].setWayBillBookingChargesHM(wayBillBookingchargesHM.get(reportModelBooking[i].getWayBillId()));
								}
							}
						}

						reportViewModel = new ReportViewModel();
						reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);

						request.setAttribute("ReportViewModel",reportViewModel);	

						request.setAttribute("agentName", executive.getName());
						request.setAttribute("fromDate", JSPUtility.GetString(request, "fromDate"));
						request.setAttribute("toDate", JSPUtility.GetString(request, "toDate"));

						if(corp != null) {
							request.setAttribute("corporateName", corp.getName());
						} /*else {
								request.setAttribute("corporateName", "All");
							}*/

						/*int reportId = new Random().nextInt(10000);
		                        session.setAttribute(reportId+"",reportModel);
		                        request.setAttribute("reportId", reportId);*/
						request.setAttribute("corporateAccountType", corporateAccountType);
						request.setAttribute("reportModelBooking", reportModelBooking);

						/*if(executive.getAccountGroupId() == ECargoConstantFile.ACCOUNTGROUPID_SUGAMA_TRAVELS ){
								totalBookingChrgsAmt = new HashMap<Long,Double>();				
								for(Long wayBillId : wayBillBookingchargesHM.keySet()){
									chargeWiseHM = wayBillBookingchargesHM.get(wayBillId);
									for(Long chargeId : chargeWiseHM.keySet()){
										if(totalBookingChrgsAmt.get(chargeId) == null){
											totalBookingChrgsAmt.put(chargeId, chargeWiseHM.get(chargeId).getChargeAmount());
										}else{
											lastAmt = totalBookingChrgsAmt.get(chargeId);
											totalBookingChrgsAmt.put(chargeId, lastAmt + chargeWiseHM.get(chargeId).getChargeAmount());
										}
									}
								}
								request.setAttribute("totalBookingChrgsAmt", totalBookingChrgsAmt);
								request.setAttribute("bookingChrgsOfGrpHM", bookingChrgsOfGrpHM);
								request.setAttribute("wayBillBookingchargesHM", wayBillBookingchargesHM);
							}*/

						request.setAttribute("nextPageToken", "success");

						SimpleDateFormat dateFormatForTimeLog =new SimpleDateFormat("mm:ss");
						dateFormatForTimeLog.setTimeZone(TimeZone.getTimeZone("GMT"));
						LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO,"=====Report Generated "+BusinessFunctionConstants.CORPORATEACCOUNTREPORT +" "+executive.getAccountGroupId()+
								" "+executive.getBranchId()+" "+executive.getExecutiveId()+" in "+dateFormatForTimeLog.format(new Date(System.currentTimeMillis()-startTime)));
					} else{
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
					request.setAttribute("ReportViewModel",reportViewModel);	
				}

				break;

			case 2:
				valueOutObject = DeliveryCreditorReportDAO.getInstance().getCreditDeliveryDetails(valueInObject);

				if (valueOutObject.getHtData().size() > 0 ){
					reportModelDelivery 	= (DeliveryCreditorReportModel[])valueOutObject.get("reportModels");
					Long[] 	wayBillIdArr 	= (Long[]) valueOutObject.get("wayBillIdArray");
					// Get consignor
					HashMap<Long, CustomerDetails> consignor = CustomerDetailsDao.getInstance().getConsignorDetailsByWayBillId(Utility.GetLongArrayToString(wayBillIdArr));

					if(reportModelDelivery != null) {

						CacheManip 		cache 					= new CacheManip(request);

						for(int i = 0; i < reportModelDelivery.length; i++) {

							branch	= cache.getGenericBranchDetailCache(request, reportModelDelivery[i].getWayBillSourceBranchId());
							reportModelDelivery[i].setWayBillSourceBranch(branch.getName());
							reportModelDelivery[i].setWayBillSourceSubRegionId(branch.getSubRegionId());
							reportModelDelivery[i].setWayBillSourceSubRegion(cache.getGenericSubRegionById(request, branch.getSubRegionId()).getName());

							branch	= cache.getGenericBranchDetailCache(request, reportModelDelivery[i].getWayBillDestinationBranchId());
							reportModelDelivery[i].setWayBillDestinationBranch(branch.getName());
							reportModelDelivery[i].setWayBillDestinationSubRegionId(branch.getSubRegionId());
							reportModelDelivery[i].setWayBillDestinationSubRegion(cache.getGenericSubRegionById(request, branch.getSubRegionId()).getName());

							reportModelDelivery[i].setConsignorName(consignor.get(reportModelDelivery[i].getWayBillId()).getName());
						}

						if(corp != null) {
							request.setAttribute("corporateName", corp.getName());
						}

						reportViewModel = new ReportViewModel();
						reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);

						request.setAttribute("ReportViewModel",reportViewModel);
						request.setAttribute("reportModelDelivery", reportModelDelivery);
						request.setAttribute("corporateAccountType", corporateAccountType);

						request.setAttribute("nextPageToken", "success");

						SimpleDateFormat dateFormatForTimeLog =new SimpleDateFormat("mm:ss");
						dateFormatForTimeLog.setTimeZone(TimeZone.getTimeZone("GMT"));
						LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO,"=====Report Generated "+BusinessFunctionConstants.DELIVERYCREDITORREPORT +" "+executive.getAccountGroupId()+
								" "+executive.getBranchId()+" "+executive.getExecutiveId()+" in "+dateFormatForTimeLog.format(new Date(System.currentTimeMillis()-startTime)));
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
					request.setAttribute("ReportViewModel",reportViewModel);	
				}

				break;

			case 3:
				valueOutObject = WayBilllReportDao.getInstance().getCorporateAccount(fromDate, toDate, executive.getAccountGroupId(), corporateAccountId);

				if (valueOutObject != null) {

					reportModelBooking   =  (CorporateAccountReportModel[])valueOutObject.get("CorporateAccountReportModel");

					if( reportModelBooking != null) {
						Long[]                 	 wayBillIdArray 	    = (Long[]) valueOutObject.get("WayBillIdArray");
						CacheManip 				 cache 			        = new CacheManip(request);	
						ConsignmentDetails[] 	 consignmentDetails 	= null;
						long 					 quantity 		        = 0;
						String 					 pkgDetail		        = "" ; 

						if(executive.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNT_GORUP_ID_SUGAMA_TRAVELS
								||executive.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNT_GROUP_ID_ACE_TRANS){
							//Get Acc Grp Booking Charges
							bookingChrgsOfGrpArr = ChargeTypeMasterDao.getInstance().getCharges(executive.getAccountGroupId()+"", ChargeTypeMaster.WAYBILL_CHARGETYPE_BOOKING);

							for(int i = 0; i < bookingChrgsOfGrpArr.length; i++){
								bookingChrgsOfGrpHM.put(bookingChrgsOfGrpArr[i].getChargeTypeMasterId(), bookingChrgsOfGrpArr[i]);
							}
							//Get Acc Grp Booking Charges

							//Get WayBill Charges ( Start )
							wayBillIds = new StringBuffer();

							for(int i = 0; i < wayBillIdArray.length; i++){
								wayBillIds.append(wayBillIdArray[i] + ",");
							}

							wayBillBookingchargesHM	= WayBillBookingChargesDao.getInstance().getWayBillIdWiseChargesMap(wayBillIds.substring(0, wayBillIds.length() - 1));
							//Get WayBill Charges ( End )

							totalBookingChrgsAmt = new HashMap<Long, Double>();

							if(wayBillBookingchargesHM.size() > 0){
								for(Long wayBillId : wayBillBookingchargesHM.keySet()) {
									chargeWiseHM 	= wayBillBookingchargesHM.get(wayBillId);

									for(Long chargeId : chargeWiseHM.keySet()){
										if(totalBookingChrgsAmt.get(chargeId) == null) {
											totalBookingChrgsAmt.put(chargeId, chargeWiseHM.get(chargeId).getChargeAmount());
										} else {
											lastAmt = totalBookingChrgsAmt.get(chargeId);
											totalBookingChrgsAmt.put(chargeId, lastAmt + chargeWiseHM.get(chargeId).getChargeAmount());
										}
									}
								}
							}

							request.setAttribute("totalBookingChrgsAmt", totalBookingChrgsAmt);
							request.setAttribute("bookingChrgsOfGrpHM", bookingChrgsOfGrpHM);
							request.setAttribute("wayBillBookingchargesHM", wayBillBookingchargesHM);
						}

						HashMap<Long, WayBillDeatailsModel> wayBillDetails = WayBillDetailsDAO.getInstance().getWayBillDetails(wayBillIdArray, false, (short)0, false, (short)0, true);

						waybillIds		= Utility.GetLongArrayToString(wayBillIdArray);
						conSmryHM 	 	= ConsignmentSummaryDao.getInstance().getConsignmentSummaryWeightsByWayBillIds(waybillIds);

						for (int i = 0; i < reportModelBooking.length; i++) {

							srcBranch   = cache.getGenericBranchDetailCache(request, reportModelBooking[i].getSourceBranchId());
							destBranch  = cache.getGenericBranchDetailCache(request, reportModelBooking[i].getDestinationBranchId());

							reportModelBooking[i].setWayBillSourceSubRegionId(srcBranch.getSubRegionId());
							reportModelBooking[i].setWayBillDestinationSubRegionId(destBranch.getSubRegionId());

							reportModelBooking[i].setWayBillSourceSubRegion((cache.getGenericSubRegionById(request, reportModelBooking[i].getWayBillSourceSubRegionId())).getName());
							reportModelBooking[i].setWayBillDestinationSubRegion((cache.getGenericSubRegionById(request, reportModelBooking[i].getWayBillDestinationSubRegionId())).getName());

							consignmentDetails 	= wayBillDetails.get(reportModelBooking[i].getWayBillId()).getConsignmentDetails();
							quantity 			= 0;
							pkgDetail			= "" ; 

							for (int j = 0; j < consignmentDetails.length; j++) {
								quantity 	= quantity + consignmentDetails[j].getQuantity();

								if(j == 0) {
									pkgDetail = pkgDetail + consignmentDetails[j].getQuantity() +" "+ consignmentDetails[j].getPackingTypeName();
								} else {
									pkgDetail = pkgDetail + "/ "+ consignmentDetails[j].getQuantity() +" "+ consignmentDetails[j].getPackingTypeName();
								}
							}

							reportModelBooking[i].setNoOfPackages(quantity);
							reportModelBooking[i].setTypeOfPackages(pkgDetail);

							if(conSmryHM != null) {
								consignmentSum		= conSmryHM.get(reportModelBooking[i].getWayBillId());
								reportModelBooking[i].setActualWeight(consignmentSum.getActualWeight());
							} else {
								reportModelBooking[i].setActualWeight(0.0);
							}
						}

						if(corp != null) {
							request.setAttribute("corporateName", corp.getName());
						} /*else {
								request.setAttribute("corporateName", "All");
							}*/
						reportViewModel = new ReportViewModel();
						reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);

					}
				}

				valueOutObject 	= DeliveryCreditorReportDAO.getInstance().getCreditDeliveryDetails(valueInObject);
				LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO,"=====Report Generated "+BusinessFunctionConstants.DELIVERYCREDITORREPORT +" "+valueOutObject.getHtData().size() 	);

				if(valueOutObject.getHtData().size() > 0 ) {

					reportModelDelivery = (DeliveryCreditorReportModel[])valueOutObject.get("reportModels");
					LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO,"=====Report Generated "+BusinessFunctionConstants.DELIVERYCREDITORREPORT +" "+reportModelDelivery);

					if(reportModelDelivery != null) {

						CacheManip 		cache 			        =   new CacheManip(request);	

						for(int i = 0; i < reportModelDelivery.length; i++) {

							branch	= cache.getGenericBranchDetailCache(request, reportModelDelivery[i].getWayBillSourceBranchId());
							reportModelDelivery[i].setWayBillSourceBranch(branch.getName());
							reportModelDelivery[i].setWayBillSourceSubRegionId(branch.getSubRegionId());
							reportModelDelivery[i].setWayBillSourceSubRegion(cache.getGenericSubRegionById(request, branch.getSubRegionId()).getName());

							branch	= cache.getGenericBranchDetailCache(request, reportModelDelivery[i].getWayBillDestinationBranchId());
							reportModelDelivery[i].setWayBillDestinationBranch(branch.getName());
							reportModelDelivery[i].setWayBillDestinationSubRegionId(branch.getSubRegionId());
							reportModelDelivery[i].setWayBillDestinationSubRegion(cache.getGenericSubRegionById(request, branch.getSubRegionId()).getName());

						}
						request.setAttribute("agentName", executive.getName());
						request.setAttribute("fromDate", JSPUtility.GetString(request, "fromDate"));
						request.setAttribute("toDate", JSPUtility.GetString(request, "toDate"));

						if(corp != null) {
							request.setAttribute("corporateName", corp.getName());
						}

						reportViewModel = new ReportViewModel();
						reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);
					}
				}	
				//request.setAttribute("corporateAccountType",corporateAccountType);

				request.setAttribute("ReportViewModel", reportViewModel);
				request.setAttribute("reportModelBooking", reportModelBooking);
				request.setAttribute("reportModelDelivery", reportModelDelivery);
				request.setAttribute("corporateAccountType", corporateAccountType);

				request.setAttribute("nextPageToken", "success");

				SimpleDateFormat dateFormatForTimeLog = new SimpleDateFormat("mm:ss");
				dateFormatForTimeLog.setTimeZone(TimeZone.getTimeZone("GMT"));
				LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO,"=====Report Generated "+BusinessFunctionConstants.DELIVERYCREDITORREPORT +" "+executive.getAccountGroupId()+
						" "+executive.getBranchId()+" "+executive.getExecutiveId()+" in "+dateFormatForTimeLog.format(new Date(System.currentTimeMillis()-startTime)));

				break;
			}

		} catch (Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		} finally {
			error 						= null;
			reportModelBooking  		= null;
			reportModelDelivery 		= null;
			wayBillIds					= null;
			bookingChrgsOfGrpArr		= null; 
			valueOutObject 				= null;
			reportViewModel   			= null;
			corp 						= null;
			wayBillBookingchargesHM		= null;
			bookingChrgsOfGrpHM			= null;		
			totalBookingChrgsAmt		= null;
			chargeWiseHM				= null;
			srcBranch					= null;
			destBranch					= null;
			waybillIds					= null;
			conSmryHM					= null;
			consignmentSum				= null;
		}
	}
}
