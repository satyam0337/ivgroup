package com.ivcargo.reports;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.dto.constant.ExecutiveTypeConstant;
import com.iv.dto.constant.PaymentTypeConstant;
import com.iv.dto.constant.WayBillStatusConstant;
import com.iv.dto.constant.WayBillTypeConstant;
import com.iv.utils.constant.Constant;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.reports.BranchSummaryDAO;
import com.platform.dto.Executive;
import com.platform.dto.model.BranchConsolidatorCreditDatails;
import com.platform.dto.model.BranchConsolidatorModel;
import com.platform.dto.model.BranchConsolidatorToPayeeDatails;
import com.platform.dto.model.BranchSummaryReportModel;
import com.platform.resource.CargoErrorList;


public class BranchSummaryReportAction implements Action {

	@Override
	@SuppressWarnings({ "rawtypes", "unchecked" })
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	 			error 				= null;
		Executive   						executive 			= null;
		ValueObject 						objectIn 			= null;
		SimpleDateFormat 					sdf         		= null;
		Timestamp        					fromDate   			= null;
		Timestamp        					toDate				= null;
		List<BranchSummaryReportModel>		reportModel 		= null;
		CacheManip							cManip				= null;
		String 								wayBillType 		= null;
		HashMap 							cityHM 				= null;
		HashMap 							branchHM			= null;
		HashMap	 							executiveHM			= null;
		HashMap 							cityInfo 			= null;
		HashMap 							branchInfo 			= null;
		BranchConsolidatorToPayeeDatails 	branchConsolidatorToPayeeDatails 		= null;
		BranchConsolidatorCreditDatails 	branchConsolidatorCreditDatails 		= null;
		BranchConsolidatorToPayeeDatails  	branchConsolidatorToPayeeManualDatails 	= null;
		BranchConsolidatorCreditDatails 	branchConsolidatorCreditManualDatails 	= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeBranchSummaryReportAction().execute(request, response);

			cManip 		= new CacheManip(request);
			executive 	= cManip.getExecutive(request);
			objectIn 	= new ValueObject();
			sdf         = new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			fromDate    = new Timestamp(sdf.parse(JSPUtility.GetString(request, Constant.FROM_DATE) + " 00:00:00").getTime());
			toDate		= new Timestamp(sdf.parse(JSPUtility.GetString(request, Constant.TO_DATE) + " 23:59:59").getTime());

			objectIn.put(Constant.FROM_DATE, fromDate);
			objectIn.put(Constant.TO_DATE, toDate);
			objectIn.put(Executive.EXECUTIVE, executive);

			if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN){
				final long selectedCity  = Long.parseLong(request.getParameter("subRegion"));
				objectIn.put("selectedCity", selectedCity);
			}

			reportModel = BranchSummaryDAO.getInstance().getBranchWiseDataReport(objectIn);

			if(reportModel != null && !reportModel.isEmpty()) {
				short showAgentCommission = 0;
				short showAgentCommissionTopay = 0;
				cityHM 		= new LinkedHashMap();
				cityInfo 	= new LinkedHashMap();
				branchInfo 	= new LinkedHashMap();

				for (final BranchSummaryReportModel element : reportModel) {
					element.setWayBillSourceSubRegion(cManip.getGenericSubRegionById(request, element.getSourceSubRegionId()).getName());
					element.setWayBillSourceBranch(cManip.getGenericBranchDetailCache(request, element.getSourceBranchId()).getName());
					element.setBranchName(cManip.getGenericBranchDetailCache(request, element.getBranchId()).getName());
					element.setSubRegionId(cManip.getGenericBranchDetailCache(request, element.getBranchId()).getSubRegionId());
					element.setSubRegionName(cManip.getGenericSubRegionById(request, element.getSubRegionId()).getName());
					element.setWayBillDestinationSubRegion(cManip.getGenericSubRegionById(request, element.getDestinationSubRegionId()).getName());
					element.setWayBillDestinationBranch(cManip.getGenericBranchDetailCache(request, element.getDestinationBranchId()).getName());

					if(element.getAgentCommission() > 0 && element.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID)
						showAgentCommission++;

					if(element.getAgentCommission() > 0 && element.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY)
						showAgentCommissionTopay++;

					wayBillType = WayBillTypeConstant.getWayBillTypeNameByWayBilTypeId(element.getWayBillTypeId());

					if(element.isManual())
						element.setWayBillType(wayBillType + WayBillTypeConstant.WAYBILL_TYPE_MANUAL);
					else
						element.setWayBillType(wayBillType);

					cityInfo.put(element.getSubRegionId(), element.getSubRegionName());
					branchInfo.put(element.getBranchId(), element.getBranchName());

					branchHM = (HashMap) cityHM.get(element.getSubRegionId());

					if(branchHM == null) {
						branchHM = new LinkedHashMap();

						executiveHM 							= (HashMap) branchHM.get(element.getBranchId());
						branchConsolidatorToPayeeDatails 		= (BranchConsolidatorToPayeeDatails) branchHM.get("ToPayee" + element.getBranchId());//it Stores ToPayee Collection Details
						branchConsolidatorCreditDatails 		= (BranchConsolidatorCreditDatails) branchHM.get("Credit" + element.getBranchId());//it Stores Credit Collection Details
						branchConsolidatorToPayeeManualDatails 	= (BranchConsolidatorToPayeeDatails) branchHM.get("TManual" + element.getBranchId());//it Stores ToPayee Manual Collection Details
						branchConsolidatorCreditManualDatails 	= (BranchConsolidatorCreditDatails) branchHM.get("CManual" + element.getBranchId());//it Stores Credit Manual Collection Details

						if(executiveHM == null && branchConsolidatorToPayeeDatails == null && branchConsolidatorCreditDatails == null && branchConsolidatorToPayeeManualDatails == null && branchConsolidatorCreditManualDatails == null) {
							executiveHM 							= new LinkedHashMap();
							branchConsolidatorToPayeeDatails 		= new BranchConsolidatorToPayeeDatails();
							branchConsolidatorCreditDatails 		= new BranchConsolidatorCreditDatails();
							branchConsolidatorToPayeeManualDatails 	= new BranchConsolidatorToPayeeDatails();
							branchConsolidatorCreditManualDatails 	= new BranchConsolidatorCreditDatails();

							populateDataForToPayeeANDCreditor(branchConsolidatorToPayeeDatails, branchConsolidatorCreditDatails, branchConsolidatorToPayeeManualDatails, branchConsolidatorCreditManualDatails, element);
							populateData(executiveHM, element);

							branchHM.put(element.getBranchId(), executiveHM);
							branchHM.put("ToPayee" + element.getBranchId(), branchConsolidatorToPayeeDatails);
							branchHM.put("Credit" + element.getBranchId(), branchConsolidatorCreditDatails);
							branchHM.put("TManual" + element.getBranchId(), branchConsolidatorToPayeeManualDatails);
							branchHM.put("CManual" + element.getBranchId(), branchConsolidatorCreditManualDatails);
						} else {
							populateDataForToPayeeANDCreditor(branchConsolidatorToPayeeDatails, branchConsolidatorCreditDatails, branchConsolidatorToPayeeManualDatails, branchConsolidatorCreditManualDatails, element);

							if(executiveHM != null)
								populateData(executiveHM, element);
						}

						cityHM.put(element.getSubRegionId(), branchHM);
					} else {
						executiveHM 							= (HashMap) branchHM.get(element.getBranchId());
						branchConsolidatorToPayeeDatails 		= (BranchConsolidatorToPayeeDatails) branchHM.get("ToPayee" + element.getBranchId());//it Stores ToPayee Collection Details
						branchConsolidatorCreditDatails 		= (BranchConsolidatorCreditDatails) branchHM.get("Credit" + element.getBranchId());//it Stores Credit Collection Details
						branchConsolidatorToPayeeManualDatails 	= (BranchConsolidatorToPayeeDatails) branchHM.get("TManual" + element.getBranchId());//it Stores ToPayee Manual Collection Details
						branchConsolidatorCreditManualDatails 	= (BranchConsolidatorCreditDatails) branchHM.get("CManual" + element.getBranchId());//it Stores Credit Manual Collection Details

						if(executiveHM == null && branchConsolidatorToPayeeDatails == null && branchConsolidatorCreditDatails == null) {
							executiveHM 							= new LinkedHashMap();
							branchConsolidatorToPayeeDatails 		= new BranchConsolidatorToPayeeDatails();
							branchConsolidatorCreditDatails 		= new BranchConsolidatorCreditDatails();
							branchConsolidatorToPayeeManualDatails 	= new BranchConsolidatorToPayeeDatails();
							branchConsolidatorCreditManualDatails 	= new BranchConsolidatorCreditDatails();

							populateDataForToPayeeANDCreditor(branchConsolidatorToPayeeDatails, branchConsolidatorCreditDatails, branchConsolidatorToPayeeManualDatails, branchConsolidatorCreditManualDatails, element);
							populateData(executiveHM, element);

							branchHM.put(element.getBranchId(), executiveHM);
							branchHM.put("ToPayee" + element.getBranchId(), branchConsolidatorToPayeeDatails);
							branchHM.put("Credit" + element.getBranchId(), branchConsolidatorCreditDatails);
							branchHM.put("TManual" + element.getBranchId(), branchConsolidatorToPayeeManualDatails);
							branchHM.put("CManual" + element.getBranchId(), branchConsolidatorCreditManualDatails);
						} else {
							populateDataForToPayeeANDCreditor(branchConsolidatorToPayeeDatails, branchConsolidatorCreditDatails, branchConsolidatorToPayeeManualDatails, branchConsolidatorCreditManualDatails, element);
							populateData(executiveHM, element);
						}
					}
				}

				request.setAttribute("Collection", cityHM);
				request.setAttribute("cityInfo", cityInfo);
				request.setAttribute("branchInfo", branchInfo);
				request.setAttribute("showAgentCommission", showAgentCommission);
				request.setAttribute("showAgentCommissionTopay", showAgentCommissionTopay);
				ActionStaticUtil.setReportViewModel(request);
				request.setAttribute("nextPageToken", "success");
			} else{
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		} finally {
			error 				= null;
			executive 			= null;
			objectIn 			= null;
			sdf         		= null;
			fromDate   			= null;
			toDate				= null;
			reportModel 		= null;
			cManip				= null;
			wayBillType 		= null;
			cityHM 				= null;
			branchHM			= null;
			executiveHM			= null;
			cityInfo 			= null;
			branchInfo 			= null;
			branchConsolidatorToPayeeDatails 		= null;
			branchConsolidatorCreditDatails 		= null;
			branchConsolidatorToPayeeManualDatails 	= null;
			branchConsolidatorCreditManualDatails 	= null;
		}
	}

	public void populateDataForToPayeeANDCreditor(BranchConsolidatorToPayeeDatails branchConsolidatorToPayeeDatails, BranchConsolidatorCreditDatails branchConsolidatorCreditDatails, BranchConsolidatorToPayeeDatails branchConsolidatorToPayeeManualDatails, BranchConsolidatorCreditDatails branchConsolidatorCreditManualDatails, BranchSummaryReportModel reportModel) {
		//----------------------------------------------------ToPayee & Credit----------------------------------------------------------------------------------------------------------------------------------------------
		if(reportModel.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_BOOKED && reportModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY && !reportModel.isManual()) {
			branchConsolidatorToPayeeDatails.setToPayeeBookingTotal(branchConsolidatorToPayeeDatails.getToPayeeBookingTotal() + reportModel.getGrandTotal());
			branchConsolidatorToPayeeDatails.setTotal(branchConsolidatorToPayeeDatails.getTotal() + reportModel.getGrandTotal());
		}

		if(reportModel.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CANCELLED && reportModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY && !reportModel.isManual()) {
			branchConsolidatorToPayeeDatails.setToPayeeCancellationTotal(branchConsolidatorToPayeeDatails.getToPayeeCancellationTotal() + (reportModel.getGrandTotal() - reportModel.getAmount()));
			branchConsolidatorToPayeeDatails.setTotal(branchConsolidatorToPayeeDatails.getTotal() - (reportModel.getGrandTotal() - reportModel.getAmount()));
		}

		if(reportModel.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_BOOKED && reportModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT && !reportModel.isManual()) {
			branchConsolidatorCreditDatails.setCreditBookingTotal(branchConsolidatorCreditDatails.getCreditBookingTotal() + reportModel.getGrandTotal());
			branchConsolidatorCreditDatails.setTotal(branchConsolidatorCreditDatails.getTotal() + reportModel.getGrandTotal());
		}

		if(reportModel.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CANCELLED && reportModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT && !reportModel.isManual()) {
			branchConsolidatorCreditDatails.setCreditCancellationTotal(branchConsolidatorCreditDatails.getCreditCancellationTotal() + (reportModel.getGrandTotal() - reportModel.getAmount()));
			branchConsolidatorCreditDatails.setTotal(branchConsolidatorCreditDatails.getTotal() - (reportModel.getGrandTotal() - reportModel.getAmount()));
		}
		//----------------------------------------------------ToPayee & Credit----------------------------------------------------------------------------------------------------------------------------------------------

		//----------------------------------------------------ToPayee & Credit Manual----------------------------------------------------------------------------------------------------------------------------------------------
		if(reportModel.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_BOOKED  && reportModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY && reportModel.isManual()){
			branchConsolidatorToPayeeManualDatails.setToPayeeBookingTotal(branchConsolidatorToPayeeManualDatails.getToPayeeBookingTotal() + reportModel.getGrandTotal());
			branchConsolidatorToPayeeManualDatails.setTotal(branchConsolidatorToPayeeManualDatails.getTotal() + reportModel.getGrandTotal());
		}

		if(reportModel.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CANCELLED && reportModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY && reportModel.isManual()) {
			branchConsolidatorToPayeeManualDatails.setToPayeeCancellationTotal(branchConsolidatorToPayeeManualDatails.getToPayeeCancellationTotal() + (reportModel.getGrandTotal() - reportModel.getAmount()));
			branchConsolidatorToPayeeManualDatails.setTotal(branchConsolidatorToPayeeManualDatails.getTotal() - (reportModel.getGrandTotal() - reportModel.getAmount()));
		}

		if(reportModel.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_BOOKED && reportModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT && reportModel.isManual()) {
			branchConsolidatorCreditManualDatails.setCreditBookingTotal(branchConsolidatorCreditManualDatails.getCreditBookingTotal() + reportModel.getGrandTotal());
			branchConsolidatorCreditManualDatails.setTotal(branchConsolidatorCreditManualDatails.getTotal() + reportModel.getGrandTotal());
		}

		if(reportModel.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CANCELLED && reportModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT && reportModel.isManual()) {
			branchConsolidatorCreditManualDatails.setCreditCancellationTotal(branchConsolidatorCreditManualDatails.getCreditCancellationTotal() + (reportModel.getGrandTotal() - reportModel.getAmount()));
			branchConsolidatorCreditManualDatails.setTotal(branchConsolidatorCreditManualDatails.getTotal() - (reportModel.getGrandTotal() - reportModel.getAmount()));
		}
	}

	@SuppressWarnings({ "rawtypes", "unchecked" })
	public void populateData(HashMap hashMap, BranchSummaryReportModel reportModel) {
		BranchConsolidatorModel model	= (BranchConsolidatorModel) hashMap.get(reportModel.getExecutiveId());

		if(model == null) {
			model = new BranchConsolidatorModel();

			model.setExecutiveName(reportModel.getExecutive());

			if(reportModel.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_BOOKED)
				if(reportModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID)
					model.setAgentCommission(reportModel.getAgentCommission());
				else if(reportModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY)
					model.setAgentCommissionToPay(reportModel.getAgentCommission());

			if(reportModel.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_BOOKED && reportModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID && !reportModel.isManual()){
				if(reportModel.isDiscountPercent())
					model.setTotalBookingDiscountCount(reportModel.getAmount() * reportModel.getDiscount() / 100);
				else
					model.setTotalBookingDiscountCount(reportModel.getDiscount());

				model.setPaidTotal(model.getPaidTotal() + reportModel.getGrandTotal());
			} else if(reportModel.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_BOOKED && reportModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID && reportModel.isManual()){
				if(reportModel.isDiscountPercent())
					model.setTotalBookingDiscountManualCount(reportModel.getAmount() * reportModel.getDiscount() / 100);
				else
					model.setTotalBookingDiscountManualCount(reportModel.getDiscount());

				model.setPaidManualTotal(reportModel.getGrandTotal());
			} else if(reportModel.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CANCELLED) {
				//if cancellation amount will comes then we use this.
				if(reportModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID)
					model.setCancellationTotal(reportModel.getGrandTotal() - reportModel.getAmount());
				else if(reportModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY)
					model.setCancellationTotal(- reportModel.getAmount());
				else model.setCancellationTotal(model.getCancellationTotal() + 0.00);
			} else if(reportModel.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DELIVERED && reportModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY)
				model.setToPayDeliveryTotal(reportModel.getGrandTotal());
			else if(reportModel.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DELIVERED && reportModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID)
				model.setPaidDeliveryTotal(reportModel.getDeliveryAmount() - reportModel.getDeliveryDiscount());
			else if(reportModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_FOC && reportModel.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_BOOKED)
				model.setFOCWayBillCountBooked(1);
			else if(reportModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_FOC && reportModel.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DISPATCHED)
				model.setFOCWayBillCountDispatch(1);
			else if(reportModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_FOC && reportModel.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_RECEIVED)
				model.setFOCWayBillCountReceived(1);
			else if(reportModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_FOC && reportModel.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DELIVERED)
				model.setFOCWayBillCountDelivered(1);
			else if(reportModel.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CREDIT_DELIVERED)
				model.setCreditDeliveryTotal(reportModel.getGrandTotal());

			if(reportModel.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_BOOKED && reportModel.getPaymentTypeBooking() == PaymentTypeConstant.PAYMENT_TYPE_PHONE_PAY_ID) 
				model.setPhonePeBookingTotal(reportModel.getGrandTotal());
			else if(reportModel.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CANCELLED && reportModel.getPaymentTypeBooking() == PaymentTypeConstant.PAYMENT_TYPE_PHONE_PAY_ID) 
				model.setPhonePeBookingTotal(- reportModel.getGrandTotal());

			if(reportModel.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DELIVERED && reportModel.getPaymentTypeDelivery() == PaymentTypeConstant.PAYMENT_TYPE_PHONE_PAY_ID)
				if(reportModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID)
					model.setPhonePeDeliveryTotal(reportModel.getDeliveryAmount());
				else if(reportModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY)
					model.setPhonePeDeliveryTotal(reportModel.getGrandTotal() - reportModel.getDeliveryDiscount());

			hashMap.put(reportModel.getExecutiveId(), model);
		} else {
			model.setExecutiveName(reportModel.getExecutive());

			if(reportModel.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_BOOKED)
				if(reportModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID)
					model.setAgentCommission(model.getAgentCommission() + reportModel.getAgentCommission());
				else if(reportModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY)
					model.setAgentCommissionToPay(model.getAgentCommissionToPay() + reportModel.getAgentCommission());

			if(reportModel.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_BOOKED && reportModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID && !reportModel.isManual()) {
				if(reportModel.isDiscountPercent())
					model.setTotalBookingDiscountCount(model.getTotalBookingDiscountCount() + reportModel.getAmount() * reportModel.getDiscount() / 100);
				else
					model.setTotalBookingDiscountCount(model.getTotalBookingDiscountCount() + reportModel.getDiscount());

				model.setPaidTotal(model.getPaidTotal() + reportModel.getGrandTotal());
			} else if(reportModel.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_BOOKED && reportModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID && reportModel.isManual()) {
				if(reportModel.isDiscountPercent())
					model.setTotalBookingDiscountManualCount(model.getTotalBookingDiscountManualCount() + reportModel.getAmount() * reportModel.getDiscount() / 100);
				else
					model.setTotalBookingDiscountManualCount(model.getTotalBookingDiscountManualCount() + reportModel.getDiscount());

				model.setPaidManualTotal(model.getPaidManualTotal() + reportModel.getGrandTotal());
			} else if(reportModel.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CANCELLED) {
				//if cancellation amount will comes then we use this.
				if(reportModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID)
					model.setCancellationTotal(model.getCancellationTotal() + (reportModel.getGrandTotal() - reportModel.getAmount()));
				else if(reportModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY)
					model.setCancellationTotal(model.getCancellationTotal() + - reportModel.getAmount());
				else model.setCancellationTotal(model.getCancellationTotal()+0.00);
			} else if(reportModel.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DELIVERED && reportModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY)
				model.setToPayDeliveryTotal(model.getToPayDeliveryTotal() + reportModel.getGrandTotal());
			else if(reportModel.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DELIVERED && reportModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID)
				model.setPaidDeliveryTotal(model.getPaidDeliveryTotal() + reportModel.getDeliveryAmount() - reportModel.getDeliveryDiscount());
			else if(reportModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_FOC && reportModel.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_BOOKED)
				model.setFOCWayBillCountBooked(model.getFOCWayBillCountBooked() + 1);
			else if(reportModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_FOC && reportModel.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DISPATCHED)
				model.setFOCWayBillCountDispatch(model.getFOCWayBillCountDispatch() + 1);
			else if(reportModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_FOC && reportModel.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_RECEIVED)
				model.setFOCWayBillCountReceived(model.getFOCWayBillCountReceived() + 1);
			else if(reportModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_FOC && reportModel.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DELIVERED)
				model.setFOCWayBillCountDelivered(model.getFOCWayBillCountDelivered() + 1);
			else if(reportModel.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CREDIT_DELIVERED)
				model.setCreditDeliveryTotal(model.getCreditDeliveryTotal() + reportModel.getGrandTotal());

			if(reportModel.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_BOOKED && reportModel.getPaymentTypeBooking() == PaymentTypeConstant.PAYMENT_TYPE_PHONE_PAY_ID) 
				model.setPhonePeBookingTotal(model.getPhonePeBookingTotal() + reportModel.getGrandTotal());
			else if(reportModel.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CANCELLED && reportModel.getPaymentTypeBooking() == PaymentTypeConstant.PAYMENT_TYPE_PHONE_PAY_ID) 
				model.setPhonePeBookingTotal(model.getPhonePeBookingTotal() - reportModel.getGrandTotal());

			if(reportModel.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DELIVERED && reportModel.getPaymentTypeDelivery() == PaymentTypeConstant.PAYMENT_TYPE_PHONE_PAY_ID)
				if(reportModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID)
					model.setPhonePeDeliveryTotal(model.getPhonePeDeliveryTotal() + reportModel.getDeliveryAmount() - reportModel.getDeliveryDiscount());
				else if(reportModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY)
					model.setPhonePeDeliveryTotal(model.getPhonePeDeliveryTotal() + reportModel.getGrandTotal() - reportModel.getDeliveryDiscount());
		}
	}
}