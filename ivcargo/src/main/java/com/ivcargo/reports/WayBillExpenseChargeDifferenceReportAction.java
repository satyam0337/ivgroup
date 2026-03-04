package com.ivcargo.reports;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.Arrays;
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
import com.platform.dao.ExpenseChargeDao;
import com.platform.dao.WayBillBookingChargesDao;
import com.platform.dao.WayBillDao;
import com.platform.dao.WayBillDeliveryChargesDao;
import com.platform.dao.WayBillExpenseDao;
import com.platform.dao.WayBillHistoryDao;
import com.platform.dto.Branch;
import com.platform.dto.Executive;
import com.platform.dto.ExpenseDetails;
import com.platform.dto.IncomeExpenseChargeMaster;
import com.platform.dto.TransportCommonMaster;
import com.platform.dto.WayBill;
import com.platform.dto.WayBillBookingCharges;
import com.platform.dto.WayBillDeliveryCharges;
import com.platform.dto.WayBillExpenseModelReport;
import com.platform.resource.CargoErrorList;

public class WayBillExpenseChargeDifferenceReportAction implements Action {

	private static final String TRACE_ID = "WayBillExpenseChargeDifferenceReportAction";

	public void execute(HttpServletRequest request, HttpServletResponse response) {
		// TODO Auto-generated method stub
		HashMap<String,Object>	 					error 						= null;
		Executive        							executive         			= null;
		SimpleDateFormat 							sdf               			= null;
		Timestamp        							fromDate          			= null;
		Timestamp        							toDate            			= null;
		ValueObject 								objectIn 					= null;
		ValueObject 								objectOut 					= null;
		SimpleDateFormat 							dateFormatForTimeLog		= null;
		ExpenseDetails[] 							reportModel					= null;
		CacheManip									cache						= null;
		Long[] 										wbIdArray 					= null;
		String 										wayBillIds 					= null;
		WayBillBookingCharges						wayBillBookingCharge		= null;
		WayBillDeliveryCharges						wayBillDeliveryCharge		= null;
		HashMap<String, WayBillBookingCharges>		wayBillBookingChargesColl	= null;
		HashMap<String, WayBillDeliveryCharges>		wayBillDeliveryChargesColl	= null;
		HashMap<String, WayBillExpenseModelReport> 	wayBillExpenseColl 			= null;
		WayBillExpenseModelReport 					report 						= null;
		HashMap<Long, WayBill> 						wayBillDetailsWBH			= null;
		HashMap<Long, WayBill> 						wayBillDetailsWB			= null;
		HashMap<Long, WayBill> 						wayBillDetailsFinal			= null;
		WayBill 									wayBill 					= null;
		HashMap<Long, IncomeExpenseChargeMaster> 	expenseChargeHM				= null;
		Short[] 									expenseChargeMasterIdArr 	= null;
		String 										strexpenseChargeMasterIds	= null;
		HashMap<Long, Branch>						subRegionBranches  			= null;
		String										branchesIds					= null;
		double wbChrgAmt = 0.00;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error)){
				return;
			}
			long startTime = System.currentTimeMillis();
			new InitializeWayBillExpenseChargeDifferenceReportAction().execute(request, response);

			executive	= (Executive) request.getSession().getAttribute("executive");
			sdf			= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			fromDate	= new Timestamp((sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00")).getTime());
			toDate		= new Timestamp((sdf.parse(JSPUtility.GetString(request, "toDate") + " 23:59:59")).getTime());
			objectIn	= new ValueObject();
			objectOut	= new ValueObject();
			cache 		= new CacheManip(request);

			long 	regionId	= 0;
			long 	subRegionId	= 0;
			long 	srcBranchId	= 0;

			// Get the Selected Combo values
			if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_GROUPADMIN) {

				regionId	= Long.parseLong(request.getParameter("region"));
				subRegionId = Long.parseLong(request.getParameter("subRegion"));
				srcBranchId = Long.parseLong(request.getParameter("branch"));

				// Get Combo values to restore
				subRegionBranches = cache.getBranchesBySubRegionId(request,executive.getAccountGroupId(), subRegionId);
				request.setAttribute("subRegionForGroup", cache.getSubRegionsByRegionId(request, regionId, executive.getAccountGroupId()));
				request.setAttribute("subRegionBranches", subRegionBranches);

			} else if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_REGIONADMIN) {

				regionId	= executive.getRegionId();
				subRegionId = Long.parseLong(request.getParameter("subRegion"));
				srcBranchId = Long.parseLong(request.getParameter("branch"));

				// Get Combo values to restore
				subRegionBranches = cache.getBranchesBySubRegionId(request,executive.getAccountGroupId(), subRegionId);
				request.setAttribute("subRegionForGroup", cache.getSubRegionsByRegionId(request, regionId, executive.getAccountGroupId()));
				request.setAttribute("subRegionBranches", subRegionBranches);

			} else if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_SUBREGIONADMIN) {

				regionId	= executive.getRegionId();
				subRegionId = executive.getSubRegionId();
				srcBranchId = Long.parseLong(request.getParameter("branch"));

				// Get Combo values to restore
				subRegionBranches = cache.getBranchesBySubRegionId(request,executive.getAccountGroupId(), subRegionId);
				request.setAttribute("subRegionBranches", subRegionBranches);

			} else {

				regionId	= executive.getRegionId();
				subRegionId = executive.getSubRegionId();
				srcBranchId = executive.getBranchId();
			}

			if(subRegionId == 0 && srcBranchId == 0) {
				branchesIds = cache.getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_REGION, regionId);
			} else if(subRegionId > 0 && srcBranchId == 0) {
				branchesIds = cache.getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_SUBREGION, subRegionId);
			} else if(subRegionId > 0 && srcBranchId > 0) {
				branchesIds = ""+srcBranchId;
			}

			objectIn.put("branchesIds", branchesIds);
			objectIn.put("fromDate", fromDate);
			objectIn.put("toDate", toDate);
			objectIn.put("accountGroupId", executive.getAccountGroupId());

			objectOut = WayBillExpenseDao.getInstance().getWayBillExpenseChargeDifference(objectIn);

			if(objectOut != null) {

				reportModel 			= (ExpenseDetails[])objectOut.get("WayBillExpense");
				wbIdArray				= (Long[])objectOut.get("wbIdArray");
				expenseChargeMasterIdArr= (Short[])objectOut.get("expenseChargeMasterIdArr");

				if(reportModel != null && wbIdArray != null) {

					wayBillExpenseColl 	= new HashMap<String, WayBillExpenseModelReport>();
					wayBillIds 			= Arrays.toString(wbIdArray);
					wayBillIds 			= wayBillIds.replace("[", "");
					wayBillIds 			= wayBillIds.replace("]", "");
					wayBillBookingChargesColl 	= WayBillBookingChargesDao.getInstance().getWayBillChargesMap(wayBillIds);
					wayBillDeliveryChargesColl 	= WayBillDeliveryChargesDao.getInstance().getWayBillChargesMap(wayBillIds);

					wayBillDetailsWBH 	= WayBillHistoryDao.getInstance().getWayBillDetailsByStatus(wayBillIds, WayBill.WAYBILL_STATUS_BOOKED);
					wayBillDetailsWB 	= WayBillDao.getInstance().getWayBillDetailsByStatus(wayBillIds, WayBill.WAYBILL_STATUS_BOOKED);
					wayBillDetailsFinal	= new HashMap<Long,WayBill>();

					if(wayBillDetailsWBH != null) {
						for(Long key: wayBillDetailsWBH.keySet()){
							wayBillDetailsFinal.put(key, wayBillDetailsWBH.get(key));
						}
					}

					if(wayBillDetailsWB != null) {
						for(Long key: wayBillDetailsWB.keySet()){
							wayBillDetailsFinal.put(key, wayBillDetailsWB.get(key));
						}
					}

					strexpenseChargeMasterIds = Arrays.toString(expenseChargeMasterIdArr);
					strexpenseChargeMasterIds = strexpenseChargeMasterIds.replace("[", "");
					strexpenseChargeMasterIds = strexpenseChargeMasterIds.replace("]", "");

					if(strexpenseChargeMasterIds != null && strexpenseChargeMasterIds.length() > 0) {
						expenseChargeHM = ExpenseChargeDao.getInstance().getExpenseChargeByExpenseChargeIds(strexpenseChargeMasterIds);
					}

					for (int i = 0; i < reportModel.length; i++) {

						reportModel[i].setMappingChargeTypeId(expenseChargeHM.get((long)reportModel[i].getExpenseChargeMasterId()).getMappingChargeTypeId());
						reportModel[i].setExpenseName(expenseChargeHM.get((long)reportModel[i].getExpenseChargeMasterId()).getChargeName());

						reportModel[i].setBranchName(cache.getGenericBranchDetailCache(request,reportModel[i].getBranchId()).getName());

						wbChrgAmt = 0.00;

						if(wayBillBookingChargesColl != null) {
							wayBillBookingCharge = wayBillBookingChargesColl.get(reportModel[i].getId()+"_"+reportModel[i].getMappingChargeTypeId());
							if(wayBillBookingCharge != null) {
								wbChrgAmt = wayBillBookingCharge.getChargeAmount();
							} else {
								wbChrgAmt = 0.00;
							}
						}

						if(wayBillDeliveryChargesColl != null) {
							wayBillDeliveryCharge = wayBillDeliveryChargesColl.get(reportModel[i].getId()+"_"+reportModel[i].getMappingChargeTypeId());
							if(wayBillDeliveryCharge != null) {
								wbChrgAmt = wayBillDeliveryCharge.getChargeAmount();
							} else {
								wbChrgAmt = 0.00;
							}
						}

						if(reportModel[i].getAmount() > wbChrgAmt) {

							wayBill = wayBillDetailsFinal.get(reportModel[i].getId());
							wayBill.setSourceBranch(cache.getGenericBranchDetailCache(request,wayBill.getSourceBranchId()).getName());

							report = new WayBillExpenseModelReport();

							report.setWayBillId(reportModel[i].getId());
							report.setWayBillNumber(reportModel[i].getNumber());
							report.setExpenseTypeId(reportModel[i].getTypeOfExpenseId());
							report.setExpenseDateTime(reportModel[i].getExpenseDateTime());
							report.setAmount(reportModel[i].getAmount());
							report.setBranchName(reportModel[i].getBranchName());
							report.setWayBillChargeAmount(wbChrgAmt);
							report.setSourceBranchName(wayBill.getSourceBranch());
							report.setBookingDateTime(wayBill.getCreationDateTimeStamp());
							report.setExpenseName(reportModel[i].getExpenseName());
							report.setStatus(reportModel[i].getStatus());

							wayBillExpenseColl.put(reportModel[i].getId()+"_"+reportModel[i].getMappingChargeTypeId(), report);
						}
					}

					//LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_DEBUG,"-- wayBillExpenseColl : "+wayBillExpenseColl.size());

					if(wayBillExpenseColl.size() > 0) {

						/*	reportViewModel = new ReportViewModel();
						reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);
						request.setAttribute("ReportViewModel",reportViewModel);*/

						request.setAttribute("wayBillExpenseColl",wayBillExpenseColl);

					} else {
						LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO, (String) error.get("errorCode")+ " " +(String) error.get("errorDescription"));
						error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
						error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
						request.setAttribute("cargoError", error);
					}

				} else {
					LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO, (String) error.get("errorCode")+ " " +(String) error.get("errorDescription"));
					error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
					error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
					request.setAttribute("cargoError", error);
				}

			} else {
				LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO, (String) error.get("errorCode")+ " " +(String) error.get("errorDescription"));
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}

			ActionStaticUtil.setReportViewModel(request);
			request.setAttribute("nextPageToken", "success");

			dateFormatForTimeLog = new SimpleDateFormat("mm:ss");
			dateFormatForTimeLog.setTimeZone(TimeZone.getTimeZone("GMT"));
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO,"=====Report Generated BillInformationCreditorWiseReport "+executive.getAccountGroupId()+" "+executive.getBranchId()+" "+executive.getExecutiveId()+" in "+dateFormatForTimeLog.format(new Date(System.currentTimeMillis()-startTime)));

		} catch (Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		} finally {
			error 						= null;
			executive         			= null;
			sdf               			= null;
			fromDate          			= null;
			toDate            			= null;
			objectIn 					= null;
			objectOut 					= null;
			dateFormatForTimeLog		= null;
			reportModel					= null;
			cache						= null;
			wbIdArray 					= null;
			wayBillIds 					= null;
			wayBillBookingCharge		= null;
			wayBillDeliveryCharge		= null;
			wayBillBookingChargesColl	= null;
			wayBillDeliveryChargesColl	= null;
			wayBillExpenseColl 			= null;
			report 						= null;
			wayBillDetailsWBH			= null;
			wayBillDetailsWB			= null;
			wayBillDetailsFinal			= null;
			wayBill 					= null;
			expenseChargeHM				= null;
			expenseChargeMasterIdArr 	= null;
			strexpenseChargeMasterIds	= null;
			subRegionBranches  			= null;
			branchesIds					= null;
		}
	}
}
