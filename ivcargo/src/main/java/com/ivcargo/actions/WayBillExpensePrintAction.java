package com.ivcargo.actions;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.waybill.FormTypesBLL;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.reports.ReportView;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.ConsignmentSummaryDao;
import com.platform.dao.CustomerDetailsDao;
import com.platform.dao.DispatchLedgerDao;
import com.platform.dao.DispatchSummaryDao;
import com.platform.dao.LHPVDao;
import com.platform.dao.ReceivedSummaryDao;
import com.platform.dao.VoucherDetailsDao;
import com.platform.dao.WayBillDao;
import com.platform.dao.WayBillExpenseDao;
import com.platform.dao.reports.WayBillDetailsDAO;
import com.platform.dto.ChargeTypeMaster;
import com.platform.dto.ConsignmentDetails;
import com.platform.dto.ConsignmentSummary;
import com.platform.dto.CustomerDetails;
import com.platform.dto.DispatchLedger;
import com.platform.dto.Executive;
import com.platform.dto.ExpenseDetails;
import com.platform.dto.ExpenseVoucherDetails;
import com.platform.dto.LHPV;
import com.platform.dto.ReceivedSummary;
import com.platform.dto.WayBill;
import com.platform.dto.WayBillCharges;
import com.platform.dto.WayBillType;
import com.platform.dto.constant.WayBillStatusConstant;
import com.platform.dto.model.ReportViewModel;
import com.platform.dto.model.WayBillDeatailsModel;
import com.platform.utils.Utility;

public class WayBillExpensePrintAction implements Action {

	@Override
	@SuppressWarnings("unchecked")
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	 			error 					= null;

		ExpenseVoucherDetails 				voucherDetails 			= null;
		HashMap<Long, ConsignmentSummary> 	consignmentSummaryColl 	= null;
		ConsignmentSummary					consignmentSummary		= null;
		HashMap<Long, WayBill>				wayBillColl				= null;
		WayBill								wayBill					= null;
		CacheManip							cacheManip				= null;
		Executive							executive				= null;
		ExpenseDetails[]					wayBillExpenses			= null;
		HashMap<Long, WayBillDeatailsModel> wayBillDetails 			= null;
		WayBillCharges[]					wayBillCharges			= null;
		ConsignmentDetails[]				consignmentDetails		= null;
		Long[] 								wayBillIdArray 			= null;
		ValueObject							valOut					= null;
		HashMap<Long, CustomerDetails> 		consignorHM				= null;
		HashMap<Long, CustomerDetails> 		consigneeHM				= null;
		long								dispatchLedgerId		= 0;
		HashMap<Long, DispatchLedger> 		dispatchLedgerHM		= null;
		DispatchLedger	  					dispatchLedger			= null;
		HashMap<Long, ReceivedSummary>		turHM					= null;
		ReceivedSummary						receivedSumm			= null;
		LHPV 								lhpv					= null;
		StringBuilder 						packingType				= null;
		ReportViewModel						reportViewModel			= null;
		FormTypesBLL						formTypesBLL			= null;
		String 								formTypeStr				= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			formTypesBLL			= new FormTypesBLL();

			cacheManip				= new CacheManip(request);
			executive				= cacheManip.getExecutive(request);
			voucherDetails			= VoucherDetailsDao.getInstance().getVoucherDetailsById(JSPUtility.GetLong(request, "voucherDetailsId", 0));

			consignmentSummaryColl	= ConsignmentSummaryDao.getInstance().getLimitedConsignmentDetails(""+voucherDetails.getId());
			consignmentSummary		= consignmentSummaryColl.get(voucherDetails.getId());
			formTypeStr				= formTypesBLL.getFormTypeNames(voucherDetails.getId());

			voucherDetails.setQuantity(consignmentSummary.getQuantity());
			voucherDetails.setActualWeight(consignmentSummary.getActualWeight());
			voucherDetails.setChargeWeight(consignmentSummary.getChargeWeight());
			voucherDetails.setDeliveryToId(consignmentSummary.getDeliveryTo());
			voucherDetails.setFormTypeName(formTypeStr);

			valOut					= WayBillDao.getInstance().getWayBillDetails(""+voucherDetails.getId());
			consignorHM				= CustomerDetailsDao.getInstance().getConsignorDetailsByWayBillId(Utility.GetLongArrayToString((Long[])valOut.get("wbIdArr")));
			consigneeHM				= CustomerDetailsDao.getInstance().getConsigneeDetailsByWayBillId(Utility.GetLongArrayToString((Long[])valOut.get("wbIdArr")));
			wayBillColl				= (HashMap<Long, WayBill>)valOut.get("WayBillHM");
			wayBill					= wayBillColl.get(voucherDetails.getId());

			voucherDetails.setBookedDateTime(wayBill.getBookingDateTime());
			voucherDetails.setSourceBranchId(wayBill.getSourceBranchId());
			voucherDetails.setSourceBranch(cacheManip.getGenericBranchDetailCache(request, voucherDetails.getSourceBranchId()).getName());
			voucherDetails.setDestinationBranchId(wayBill.getDestinationBranchId());
			voucherDetails.setDestinationBranch(cacheManip.getGenericBranchDetailCache(request,voucherDetails.getDestinationBranchId()).getName());
			voucherDetails.setWayBillTypeId((short) wayBill.getWayBillTypeId());
			voucherDetails.setWayBillType(WayBillType.getWayBillTypeShortNameByWayBilTypeId(voucherDetails.getWayBillTypeId()));
			voucherDetails.setConsignorName(consignorHM.get(wayBill.getWayBillId()).getName());
			voucherDetails.setConsignorAddress(consignorHM.get(wayBill.getWayBillId()).getAddress());
			voucherDetails.setConsigneeName(consigneeHM.get(wayBill.getWayBillId()).getName());
			voucherDetails.setConsigneeAddress(consigneeHM.get(wayBill.getWayBillId()).getAddress());
			voucherDetails.setConsignorInvoiceNo(wayBill.getConsignorInvoiceNo());
			voucherDetails.setDeclaredValue(wayBill.getDeclaredValue());
			voucherDetails.setBranch(cacheManip.getGenericBranchDetailCache(request, voucherDetails.getBranchId()).getName());

			if(wayBill.getStatus() != WayBillStatusConstant.WAYBILL_STATUS_BOOKED){
				dispatchLedgerId = DispatchSummaryDao.getInstance().getDispatchLedgerIdfromWayWayBillId(""+voucherDetails.getId());
				dispatchLedgerHM = DispatchLedgerDao.getInstance().getDispatchLedgerDetailsByLSIds(""+dispatchLedgerId);

				if(dispatchLedgerHM != null) {
					dispatchLedger 	 = dispatchLedgerHM.get(dispatchLedgerId);

					if(dispatchLedger.getDestinationBranchId() > 0 )
						dispatchLedger.setDestinationBranch(cacheManip.getGenericBranchDetailCache(request, dispatchLedger.getDestinationBranchId()).getName());
					else
						dispatchLedger.setDestinationBranch("");
					request.setAttribute("dispatchLedger", dispatchLedger);

					if(dispatchLedger.getLhpvId() > 0){
						lhpv = LHPVDao.getInstance().getLHPVDetailsWithCancel(dispatchLedger.getLhpvId());
						lhpv.setLhpvBranchName(cacheManip.getGenericBranchDetailCache(request,  lhpv.getlHPVBranchId()).getName());

						if(lhpv.getBlhpvId() > 0)
							lhpv.setbLHPVBranchName(cacheManip.getGenericBranchDetailCache(request, lhpv.getbLHPVBranchId()).getName());

						request.setAttribute("lhpv", lhpv);
					}
				}

				if(dispatchLedgerId > 0){
					turHM =	ReceivedSummaryDao.getInstance().getTURDetailsByLSIds(""+dispatchLedgerId);

					if(!turHM.isEmpty()){
						receivedSumm = turHM.get(voucherDetails.getId());

						if(receivedSumm != null)
							receivedSumm.setTurBranch(cacheManip.getGenericBranchDetailCache(request, receivedSumm.getTurBranchId()).getName());

						request.setAttribute("receivedSummary", receivedSumm);
					}
				}
			}

			wayBillIdArray 		= new Long[1];
			wayBillIdArray[0] 	= voucherDetails.getId();
			wayBillDetails 		= WayBillDetailsDAO.getInstance().getWayBillDetails(wayBillIdArray ,true ,ChargeTypeMaster.WAYBILL_CHARGETYPE_BOTH ,false ,(short)0 ,true);
			wayBillCharges		= wayBillDetails.get(voucherDetails.getId()).getWayBillCharges();
			consignmentDetails	= wayBillDetails.get(voucherDetails.getId()).getConsignmentDetails();
			wayBillExpenses 	= WayBillExpenseDao.getInstance().getWayBillExpenseDetailsByVoucherId(voucherDetails.getExepenseVoucherDetailsId(), executive.getAccountGroupId());

			for (final WayBillCharges wayBillCharge : wayBillCharges)
				wayBillCharge.setName(cacheManip.getChargeTypeMasterById(request, wayBillCharge.getWayBillChargeMasterId()).getChargeName());

			packingType = new StringBuilder();

			for (final ConsignmentDetails consignmentDetail : consignmentDetails)
				packingType.append(consignmentDetail.getPackingTypeName()+" / ");

			voucherDetails.setPackingTypeName(packingType.substring(0,packingType.length()-2));// Maximum 3 Packing Type Are Allowed For LMT

			request.setAttribute("voucherDetails", voucherDetails);
			request.setAttribute("wayBillExpenses", wayBillExpenses);
			request.setAttribute("wayBillCharges", wayBillCharges);

			reportViewModel = new ReportViewModel();
			reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);
			request.setAttribute("ReportViewModel",reportViewModel);

			request.setAttribute("nextPageToken", "success_"+executive.getAccountGroupId());

		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		} finally {
			voucherDetails 			= null;
			consignmentSummaryColl 	= null;
			consignmentSummary		= null;
			wayBillColl				= null;
			wayBill					= null;
			cacheManip				= null;
			executive				= null;
			wayBillExpenses			= null;
			wayBillDetails			= null;
			wayBillCharges			= null;
			wayBillIdArray 			= null;
			valOut					= null;
			consignorHM				= null;
			consigneeHM				= null;
			dispatchLedgerHM		= null;
			dispatchLedger			= null;
			turHM					= null;
			receivedSumm			= null;
			lhpv					= null;
			packingType 			= null;
		}
	}
}
