package com.ivcargo.reports;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.HashMap;
import java.util.LinkedHashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.ChargeConfigBLL;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.reports.PendingDeliverySummaryReportDAO;
import com.platform.dto.Branch;
import com.platform.dto.ChargeTypeMaster;
import com.platform.dto.Executive;
import com.platform.dto.constant.WayBillTypeConstant;
import com.platform.dto.model.PendingDeliverySummaryReport;
import com.platform.dto.model.PendingDeliverySummaryReportModel;
import com.platform.resource.CargoErrorList;

public class PendingDeliverySummaryReportAction implements Action {

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>							error 				= null;
		Executive        								executive       	= null;
		SimpleDateFormat 								sdf             	= null;
		Timestamp        								fromDate        	= null;
		Timestamp        								toDate          	= null;
		Branch[]    									branches  			= null;
		CacheManip 										cache 				= null;
		ValueObject										objectIn			= null;
		ValueObject										objectOut			= null;
		Long[]											wayBillIdArray 		= null;
		String											strForChargeConfig	= null;
		String											strForWayBillCharge	= null;
		ChargeConfigBLL									chargeConfigBLL  	= null;
		HashMap<Long, Double>							wayBillChargeCollection = null;
		PendingDeliverySummaryReportModel				model 					= null;
		PendingDeliverySummaryReport[]					reportModel 			= null;
		HashMap<Long,PendingDeliverySummaryReportModel> sourceCityWiseData 		= null;
		long selectedDestCityId		= 0;
		long selectedDestBranchId	= 0;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializePendingDeliverySummaryReportAction().execute(request, response);

			sdf			= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			fromDate	= new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00").getTime());
			toDate		= new Timestamp(sdf.parse(JSPUtility.GetString(request, "toDate") + " 23:59:59").getTime());
			cache		= new CacheManip(request);
			executive	= cache.getExecutive(request);

			if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_GROUPADMIN) {
				selectedDestCityId 		= Long.parseLong(request.getParameter("subRegion"));
				selectedDestBranchId 	= Long.parseLong(request.getParameter("branch"));
			} else {
				selectedDestCityId 		= executive.getSubRegionId();
				selectedDestBranchId 	= executive.getBranchId();
			}

			//Get all Branches
			branches = cache.getBranchesArrayBySubRegionId(request,executive.getAccountGroupId(),selectedDestCityId);
			request.setAttribute("branches", branches);
			// Get All Executives

			objectIn = new ValueObject();
			objectIn.put("fromDate", fromDate);
			objectIn.put("toDate", toDate);
			objectIn.put("SourceCityId", 0);
			objectIn.put("SourceBranchId", 0);
			objectIn.put("DestinationCityId", selectedDestCityId);
			objectIn.put("DestinationBranchId", selectedDestBranchId);
			objectIn.put("accountGroupId", executive.getAccountGroupId());
			objectIn.put("filter", 0);

			objectOut = PendingDeliverySummaryReportDAO.getInstance().getReport(objectIn);

			if(objectOut != null) {
				reportModel 		= (PendingDeliverySummaryReport[])objectOut.get("PendingDeliverySummaryReportModel");
				wayBillIdArray 		= (Long[]) objectOut.get("WayBillIdArray");
				strForChargeConfig	= objectOut.get("strForChargeConfig").toString();
				strForWayBillCharge	= objectOut.get("strForWayBillCharge").toString();

				if(reportModel != null && wayBillIdArray != null) {
					objectIn.put("strForChargeConfig", strForChargeConfig);
					objectIn.put("strForWayBillCharge", strForWayBillCharge);
					objectIn.put("chargeTypeMasterId", ChargeTypeMaster.RECEIPT);

					chargeConfigBLL  			= new ChargeConfigBLL();
					wayBillChargeCollection  	= chargeConfigBLL.getWayBillChargeAmount(objectIn);
					sourceCityWiseData 			= new LinkedHashMap<Long,PendingDeliverySummaryReportModel>();

					for (final PendingDeliverySummaryReport element : reportModel) {

						if(wayBillChargeCollection.get(element.getWayBillId()) != null)
							element.setReceiptAmount(wayBillChargeCollection.get(element.getWayBillId()));
						else
							element.setReceiptAmount(0);

						model = sourceCityWiseData.get(element.getWayBillSourceBranchId());

						if(model == null){

							model = new PendingDeliverySummaryReportModel();

							model.setSourceSubRegionId(cache.getGenericBranchDetailCache(request,element.getWayBillSourceBranchId()).getSubRegionId());
							model.setSourceBranchId(element.getWayBillSourceBranchId());
							model.setSourceSubRegion(cache.getGenericSubRegionById(request,cache.getGenericBranchDetailCache(request,element.getWayBillSourceBranchId()).getSubRegionId()).getName());
							model.setSourceBranchName(cache.getGenericBranchDetailCache(request, element.getWayBillSourceBranchId()).getName());

							if(element.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID){
								model.setTotalPaidAmount(element.getGrandTotal());
								model.setTotalReceiptPaidAmount(element.getReceiptAmount());
							} else if(element.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY){
								model.setTotalToPayAmount(element.getGrandTotal());
								model.setTotalReceiptToPayAmount(element.getReceiptAmount());
							} else if(element.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT){
								model.setTotalCreditAmount(element.getGrandTotal());
								model.setTotalReceiptCreditAmount(element.getReceiptAmount());
							}

							sourceCityWiseData.put(element.getWayBillSourceBranchId() ,model);
						} else if(element.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID){
							model.setTotalPaidAmount(model.getTotalPaidAmount() + element.getGrandTotal());
							model.setTotalReceiptPaidAmount(model.getTotalReceiptPaidAmount() + element.getReceiptAmount());
						} else if(element.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY){
							model.setTotalToPayAmount(model.getTotalToPayAmount() + element.getGrandTotal());
							model.setTotalReceiptToPayAmount(model.getTotalReceiptToPayAmount() + element.getReceiptAmount());
						} else if(element.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT){
							model.setTotalCreditAmount(model.getTotalCreditAmount() + element.getGrandTotal());
							model.setTotalReceiptCreditAmount(model.getTotalReceiptCreditAmount() + element.getReceiptAmount());
						}
					}

					request.setAttribute("sourceCityWiseData",sourceCityWiseData);
					ActionStaticUtil.setReportViewModel(request);
					request.setAttribute("nextPageToken", "success");
				} else {
					error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
					error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
					request.setAttribute("cargoError", error);
				}
			} else {
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		} finally {
			error 						= null;
			executive       			= null;
			sdf             			= null;
			fromDate        			= null;
			toDate          			= null;
			branches  					= null;
			cache 						= null;
			objectIn					= null;
			objectOut					= null;
			wayBillIdArray 				= null;
			strForChargeConfig			= null;
			strForWayBillCharge			= null;
			chargeConfigBLL  			= null;
			wayBillChargeCollection 	= null;
			model 						= null;
			reportModel 				= null;
			sourceCityWiseData 			= null;
		}
	}
}
