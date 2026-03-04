package com.ivcargo.reports;

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
import com.ivcargo.utils.CacheManip;
import com.platform.dao.CustomerDetailsDao;
import com.platform.dao.DeliveryDebitMemoDao;
import com.platform.dao.WayBillDao;
import com.platform.dto.Branch;
import com.platform.dto.CustomerDetails;
import com.platform.dto.DeliveryDebitMemo;
import com.platform.dto.Executive;
import com.platform.dto.WayBill;
import com.platform.dto.WayBillType;
import com.platform.dto.model.ReportViewModel;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

public class DDMReportAction implements Action {

	private static final String TRACE_ID = "DDMReportAction";

	@SuppressWarnings("unchecked")
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		// TODO Auto-generated method stub
		HashMap<String,Object>	 			error 				= null;
		Executive        					executive         	= null;
		SimpleDateFormat 					sdf               	= null;
		Timestamp        					fromDate          	= null;
		Timestamp        					toDate            	= null;
		CacheManip							cManip				= null;
		ReportViewModel 					reportViewModel 	= null;
		SimpleDateFormat 					dateFormatForTimeLog= null;
		HashMap<Long, Branch> 				subRegionBranches	= null;
		HashMap<Long, DeliveryDebitMemo> 	ddmColl 			= null;
		DeliveryDebitMemo					deliveryDebitMemo	= null;
		ValueObject							valueOutObject		= null;
		Long[]								wayBillIdArray		= null;
		String 								wayBillIds			= null;
		HashMap<Long, CustomerDetails> 		consignorList		= null;
		CustomerDetails						consignor			= null;
		HashMap<Long, CustomerDetails> 		consigneeList		= null;
		CustomerDetails						consignee			= null;
		HashMap<Long, WayBill>				wayBillColl			= null;
		WayBill								wayBill				= null;
		long 		regionId    				= 0;
		long 		subRegionId    				= 0;
		long 		branchId					= 0;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error)){
				return;
			}

			long startTime = System.currentTimeMillis();
			new InitializeDDMReportAction().execute(request, response);

			executive	= (Executive) request.getSession().getAttribute("executive");
			sdf			= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			fromDate	= new Timestamp((sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00")).getTime());
			toDate		= new Timestamp((sdf.parse(JSPUtility.GetString(request, "toDate") + " 23:59:59")).getTime());
			cManip 		= new CacheManip(request);

			if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_GROUPADMIN){
				regionId = Long.parseLong(request.getParameter("region"));
				subRegionId = Long.parseLong(request.getParameter("subRegion"));
				branchId = Long.parseLong(request.getParameter("branch"));

				// Get Combo values to restore
				request.setAttribute("subRegionForGroup", cManip.getSubRegionsByRegionId(request, regionId, executive.getAccountGroupId()));
				request.setAttribute("subRegionBranches", cManip.getBranchesBySubRegionId(request,executive.getAccountGroupId(), subRegionId));
			}else if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_REGIONADMIN){
				regionId = executive.getRegionId();
				subRegionId = Long.parseLong(request.getParameter("subRegion"));
				branchId = Long.parseLong(request.getParameter("branch"));
				// Get Combo values to restore
				request.setAttribute("subRegionForGroup", cManip.getSubRegionsByRegionId(request, regionId, executive.getAccountGroupId()));
				request.setAttribute("subRegionBranches", cManip.getBranchesBySubRegionId(request,executive.getAccountGroupId(), subRegionId));
			}else if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_SUBREGIONADMIN){
				regionId = executive.getRegionId();
				subRegionId = executive.getSubRegionId();
				branchId = Long.parseLong(request.getParameter("branch"));
				// Get Combo values to restore
				subRegionBranches = cManip.getBranchesBySubRegionId(request,executive.getAccountGroupId(), subRegionId);
				request.setAttribute("subRegionBranches", subRegionBranches);
			}else{
				regionId = executive.getRegionId();
				subRegionId = executive.getSubRegionId();
				branchId = executive.getBranchId();
			}

			valueOutObject = DeliveryDebitMemoDao.getInstance().getDeliveredDebitMemoDetail(branchId, executive.getAccountGroupId(), fromDate, toDate);

			if(valueOutObject != null) {

				ddmColl 		= (HashMap<Long, DeliveryDebitMemo>)valueOutObject.get("ddmColl");
				wayBillIdArray 	= (Long[])valueOutObject.get("wayBillIdArray");

				if(ddmColl != null && wayBillIdArray != null && ddmColl.size() > 0 && wayBillIdArray.length > 0) {

					wayBillIds = Utility.GetLongArrayToString(wayBillIdArray);

					consignorList 	= CustomerDetailsDao.getInstance().getConsignorDetailsByWayBillId(wayBillIds);
					consigneeList 	= CustomerDetailsDao.getInstance().getConsigneeDetailsByWayBillId(wayBillIds);
					wayBillColl		= WayBillDao.getInstance().getLimitedLRDetails(wayBillIds);

					for (Long key : ddmColl.keySet()) {

						deliveryDebitMemo = ddmColl.get(key);

						consignee = consigneeList.get(key);
						if(consignee != null) {
							deliveryDebitMemo.setConsignee(consignee.getName());
						}

						consignor = consignorList.get(key);
						if(consignor != null) {
							deliveryDebitMemo.setConsignor(consignor.getName());
						}

						wayBill = wayBillColl.get(key);
						if(wayBill != null) {
							deliveryDebitMemo.setWayBillType(WayBillType.getWayBillTypeShortNameByWayBilTypeId(wayBill.getWayBillTypeId()));
						}
					}

					request.setAttribute("ddmColl",ddmColl);

					reportViewModel = new ReportViewModel();
					reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);
					request.setAttribute("ReportViewModel",reportViewModel);

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

			request.setAttribute("nextPageToken", "success");

			dateFormatForTimeLog = new SimpleDateFormat("mm:ss");
			dateFormatForTimeLog.setTimeZone(TimeZone.getTimeZone("GMT"));
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO,"=====Report Generated BookingBranchSummary "+executive.getAccountGroupId()+" "+executive.getBranchId()+" "+executive.getExecutiveId()+" in "+dateFormatForTimeLog.format(new Date(System.currentTimeMillis()-startTime)));

		} catch (Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		} finally {
			executive         	= null;
			sdf               	= null;
			fromDate          	= null;
			toDate            	= null;
			cManip				= null;
			reportViewModel 	= null;
			dateFormatForTimeLog= null;
			subRegionBranches	= null;
			ddmColl 			= null;
			deliveryDebitMemo	= null;
			valueOutObject		= null;
			wayBillIdArray		= null;
			wayBillIds			= null;
			consignorList		= null;
			consignor			= null;
			consigneeList		= null;
			consignee			= null;
			wayBillColl			= null;
			wayBill				= null;
		}
	}
}
