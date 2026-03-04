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
import com.platform.dao.WayBillDao;
import com.platform.dao.WayBillIncomeDao;
import com.platform.dao.WayBillIncomeVoucherDetailsDao;
import com.platform.dao.reports.WayBillDetailsDAO;
import com.platform.dto.ChargeTypeMaster;
import com.platform.dto.ConsignmentDetails;
import com.platform.dto.ConsignmentSummary;
import com.platform.dto.CustomerDetails;
import com.platform.dto.DispatchLedger;
import com.platform.dto.Executive;
import com.platform.dto.LHPV;
import com.platform.dto.ReceivedSummary;
import com.platform.dto.WayBill;
import com.platform.dto.WayBillCharges;
import com.platform.dto.WayBillIncome;
import com.platform.dto.WayBillIncomeVoucherDetails;
import com.platform.dto.WayBillType;
import com.platform.dto.model.ReportViewModel;
import com.platform.dto.model.WayBillDeatailsModel;
import com.platform.utils.Utility;

public class WayBillIncomePrintAction implements Action {

	@Override
	@SuppressWarnings("unchecked")
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		// TODO Auto-generated method stub

		HashMap<String,Object>	 			error 						= null;
		WayBillIncomeVoucherDetails 		wayBillIncomeVoucherDetails = null;
		HashMap<Long, ConsignmentSummary> 	consignmentSummaryColl 		= null;
		ConsignmentSummary					consignmentSummary			= null;
		HashMap<Long, WayBill>				wayBillColl					= null;
		WayBill								wayBill						= null;
		CacheManip							cacheManip					= null;
		Executive							executive					= null;
		WayBillIncome[]						wayBillIncomes				= null;
		ValueObject							valOut						= null;
		HashMap<Long, CustomerDetails> 		consignorHM					= null;
		HashMap<Long, CustomerDetails> 		consigneeHM					= null;
		long								dispatchLedgerId			= 0;
		HashMap<Long, DispatchLedger> 		dispatchLedgerHM			= null;
		DispatchLedger	  					dispatchLedger				= null;
		HashMap<Long, ReceivedSummary>		turHM						= null;
		ReceivedSummary						receivedSumm				= null;
		LHPV 								lhpv						= null;
		ConsignmentDetails[]				consignmentDetails			= null;
		Long[] 								wayBillIdArray 				= null;
		HashMap<Long, WayBillDeatailsModel> wayBillDetails 				= null;
		WayBillCharges[]					wayBillCharges				= null;
		StringBuilder 						packingType					= null;
		ReportViewModel						reportViewModel				= null;
		FormTypesBLL						formTypesBLL				= null;
		String								formTypeName				= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error))
				return;

			executive					= (Executive) request.getSession().getAttribute("executive");
			cacheManip					= new CacheManip(request);
			formTypesBLL				= new FormTypesBLL();

			wayBillIncomeVoucherDetails = WayBillIncomeVoucherDetailsDao.getInstance().getWayBillIncomeVoucherDetailsById(JSPUtility.GetLong(request, "wayBillIncomeVoucherDetailsId", 0));

			if(wayBillIncomeVoucherDetails.getWayBillId() >0){
				consignmentSummaryColl	= ConsignmentSummaryDao.getInstance().getLimitedConsignmentDetails(""+wayBillIncomeVoucherDetails.getWayBillId());
				consignmentSummary		= consignmentSummaryColl.get(wayBillIncomeVoucherDetails.getWayBillId());
				formTypeName			= formTypesBLL.getFormTypeNames(wayBillIncomeVoucherDetails.getWayBillId());

				if(consignmentSummary != null){
					wayBillIncomeVoucherDetails.setQuantity(consignmentSummary.getQuantity());
					wayBillIncomeVoucherDetails.setActualWeight(consignmentSummary.getActualWeight());
					wayBillIncomeVoucherDetails.setChargeWeight(consignmentSummary.getChargeWeight());
					wayBillIncomeVoucherDetails.setDeliveryToId(consignmentSummary.getDeliveryTo());
					//wayBillIncomeVoucherDetails.setFormTypeId(consignmentSummary.getFormTypeId());
					wayBillIncomeVoucherDetails.setFormTypeName(formTypeName);
				}

				valOut		= WayBillDao.getInstance().getWayBillDetails(""+wayBillIncomeVoucherDetails.getWayBillId());

				if(valOut != null){
					consignorHM	= CustomerDetailsDao.getInstance().getConsignorDetailsByWayBillId(Utility.GetLongArrayToString((Long[])valOut.get("wbIdArr")));
					consigneeHM	= CustomerDetailsDao.getInstance().getConsigneeDetailsByWayBillId(Utility.GetLongArrayToString((Long[])valOut.get("wbIdArr")));
					wayBillColl	= (HashMap<Long, WayBill>)valOut.get("WayBillHM");

					wayBill		= wayBillColl.get(wayBillIncomeVoucherDetails.getWayBillId());

					wayBillIncomeVoucherDetails.setBookedDateTime(wayBill.getCreationDateTimeStamp());
					wayBillIncomeVoucherDetails.setSourceBranchId(wayBill.getSourceBranchId());
					wayBillIncomeVoucherDetails.setSourceBranch(cacheManip.getGenericBranchDetailCache(request,wayBillIncomeVoucherDetails.getSourceBranchId()).getName());
					wayBillIncomeVoucherDetails.setDestinationBranchId(wayBill.getDestinationBranchId());
					wayBillIncomeVoucherDetails.setDestinationBranch(cacheManip.getGenericBranchDetailCache(request, wayBillIncomeVoucherDetails.getDestinationBranchId()).getName());
					wayBillIncomeVoucherDetails.setWayBillTypeId((short) wayBill.getWayBillTypeId());
					wayBillIncomeVoucherDetails.setWayBillType(WayBillType.getWayBillTypeShortNameByWayBilTypeId(wayBillIncomeVoucherDetails.getWayBillTypeId()));
					wayBillIncomeVoucherDetails.setConsignorName(consignorHM.get(wayBill.getWayBillId()).getName());
					wayBillIncomeVoucherDetails.setConsignorAddress(consignorHM.get(wayBill.getWayBillId()).getAddress());
					wayBillIncomeVoucherDetails.setConsigneeName(consigneeHM.get(wayBill.getWayBillId()).getName());
					wayBillIncomeVoucherDetails.setConsigneeAddress(consigneeHM.get(wayBill.getWayBillId()).getAddress());
					wayBillIncomeVoucherDetails.setConsignorInvoiceNo(wayBill.getConsignorInvoiceNo());
					wayBillIncomeVoucherDetails.setDeclaredValue(wayBill.getDeclaredValue());
					wayBillIncomeVoucherDetails.setBranch(cacheManip.getGenericBranchDetailCache(request,wayBillIncomeVoucherDetails.getBranchId()).getName());

					if(wayBill.getStatus() != WayBill.WAYBILL_STATUS_BOOKED){
						dispatchLedgerId = DispatchSummaryDao.getInstance().getDispatchLedgerIdfromWayWayBillId(""+wayBillIncomeVoucherDetails.getWayBillId());
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
								lhpv.setLhpvBranchName(cacheManip.getGenericBranchDetailCache(request,lhpv.getlHPVBranchId()).getName());
								if(lhpv.getBlhpvId() > 0)
									lhpv.setbLHPVBranchName(cacheManip.getGenericBranchDetailCache(request,lhpv.getbLHPVBranchId()).getName());
								request.setAttribute("lhpv", lhpv);
							}
						}

						if(dispatchLedgerId > 0){
							turHM =	ReceivedSummaryDao.getInstance().getTURDetailsByLSIds(""+dispatchLedgerId);

							if(!turHM.isEmpty()){
								receivedSumm = turHM.get(wayBillIncomeVoucherDetails.getWayBillId());
								receivedSumm.setTurBranch(cacheManip.getGenericBranchDetailCache(request,receivedSumm.getTurBranchId()).getName());
								request.setAttribute("receivedSummary", receivedSumm);
							}
						}
					}
				}

				wayBillIdArray 		= new Long[1];
				wayBillIdArray[0] 	= wayBillIncomeVoucherDetails.getWayBillId();
				wayBillDetails 		= WayBillDetailsDAO.getInstance().getWayBillDetails(wayBillIdArray ,true ,ChargeTypeMaster.WAYBILL_CHARGETYPE_BOTH ,false ,(short)0 ,true);
				wayBillCharges		= wayBillDetails.get(wayBillIncomeVoucherDetails.getWayBillId()).getWayBillCharges();
				consignmentDetails	= wayBillDetails.get(wayBillIncomeVoucherDetails.getWayBillId()).getConsignmentDetails();

				for (final WayBillCharges wayBillCharge : wayBillCharges)
					wayBillCharge.setName(cacheManip.getChargeTypeMasterById(request, wayBillCharge.getWayBillChargeMasterId()).getChargeName());

				packingType = new StringBuilder();

				for (final ConsignmentDetails consignmentDetail : consignmentDetails)
					packingType.append(consignmentDetail.getPackingTypeName()+" / ");

				wayBillIncomeVoucherDetails.setPackingTypeName(packingType.substring(0,packingType.length()-2));// Maximum 3 Packing Type Are Allowed For LMT
			}

			wayBillIncomes = WayBillIncomeDao.getInstance().getWayBillIncomeDetailsByVoucherId(wayBillIncomeVoucherDetails.getWayBillIncomeVoucherDetailsId(), executive.getAccountGroupId());

			request.setAttribute("WayBillIncomeVoucherDetails", wayBillIncomeVoucherDetails);
			request.setAttribute("wayBillIncomes", wayBillIncomes);
			request.setAttribute("wayBillCharges", wayBillCharges);

			reportViewModel = new ReportViewModel();
			reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);
			request.setAttribute("ReportViewModel",reportViewModel);

			request.setAttribute("nextPageToken", "success_"+executive.getAccountGroupId());

		} catch (final Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		} finally {
			wayBillIncomeVoucherDetails = null;
			consignmentSummaryColl 		= null;
			consignmentSummary			= null;
			wayBillColl					= null;
			wayBill						= null;
			cacheManip					= null;
			executive					= null;
			wayBillIncomes				= null;
			valOut						= null;
			consignorHM					= null;
			consigneeHM					= null;
			dispatchLedgerId			= 0;
			dispatchLedgerHM			= null;
			dispatchLedger				= null;
			turHM						= null;
			receivedSumm				= null;
			lhpv						= null;
			consignmentDetails			= null;
			wayBillIdArray 				= null;
			wayBillDetails 				= null;
			wayBillCharges				= null;
			packingType					= null;
		}
	}
}
