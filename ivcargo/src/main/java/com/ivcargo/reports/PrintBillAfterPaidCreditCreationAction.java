package com.ivcargo.reports;

import java.util.ArrayList;
import java.util.HashMap;

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
import com.platform.dao.RateMasterDao;
import com.platform.dao.WayBillDao;
import com.platform.dao.WayBillIncomeDao;
import com.platform.dao.reports.CreditWayBillTxnDAO;
import com.platform.dao.reports.WayBillDetailsDAO;
import com.platform.dto.BillDetailsForPrintingBill;
import com.platform.dto.Branch;
import com.platform.dto.ChargeTypeMaster;
import com.platform.dto.ConsignmentDetails;
import com.platform.dto.ConsignmentSummary;
import com.platform.dto.Executive;
import com.platform.dto.RateMaster;
import com.platform.dto.TransportCommonMaster;
import com.platform.dto.WayBill;
import com.platform.dto.WayBillCharges;
import com.platform.dto.WayBillDetailsForPrintingBill;
import com.platform.dto.WayBillIncome;
import com.platform.dto.WayBillTaxTxn;
import com.platform.dto.constant.WayBillTypeConstant;
import com.platform.dto.model.CreditWayBillTxn;
import com.platform.dto.model.ReportViewModel;
import com.platform.dto.model.WayBillDeatailsModel;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

public class PrintBillAfterPaidCreditCreationAction implements Action {
	private static final String TRACE_ID = "PrintBillAfterPaidCreditCreationAction";

	public void execute(HttpServletRequest request, HttpServletResponse response) {
		// TODO Auto-generated method stub
		HashMap<String,Object>	 			error 				= null;
		CacheManip							cache 				= null;
		Executive							executive			= null;
		Branch								branch				= null;
		ReportViewModel 					reportViewModel 	= null;
		BillDetailsForPrintingBill			bill 				= null;
		WayBillDetailsForPrintingBill[]		wayBills			= null;
		ValueObject							valueOutObject		= null;
		Long[]								wayBillIdArray		= null;
		HashMap<Long, WayBillDeatailsModel> wayBillDetails 		= null;
		//HashMap<Long, CustomerDetails>		consigneeDetails	= null;
		ConsignmentDetails[] 				consDetails 		= null;
		String 								packageDetails 		= null;
		WayBillCharges[]					wayBillCharges		= null;
		WayBillTaxTxn[]  					taxes   			= null;
		StringBuffer						otherChargeDetails	= null;
		WayBillIncome 						wbIncome 			= null;
		ArrayList<WayBillIncome> 			wbIncomeArr 		= null;
		HashMap<Long, ArrayList<WayBillIncome>>	wbIncomeCol		= null;
		HashMap<Long, ConsignmentSummary> 	consSmry 	   		= null;
		RateMaster[] 						rate  				= null;
		short								transactionTypeId	= 0;
		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error)){
				return;
			}
			long billId = JSPUtility.GetLong(request, "billId" ,0);
			transactionTypeId = JSPUtility.GetShort(request, "transactionType" ,(short)0);
			executive	= (Executive) request.getSession().getAttribute("executive");
			cache		= new CacheManip(request);

			bill = CreditWayBillTxnDAO.getInstance().getBillDetailsForPaidCreditPrintingBill(billId);

			// Print Work is Incomplete Please Get Necessary Detail Consignor Name

			if(bill != null) {

				branch = cache.getGenericBranchDetailCache(request,bill.getBranchId());
				bill.setBranchName(branch.getName());
				bill.setBranchAddress(branch.getAddress());
				request.setAttribute("BillDetailsForPrintingBill", bill);

				valueOutObject = CreditWayBillTxnDAO.getInstance().getPaidCreditWayBillDetailsForPrintingBill(billId);

				if(valueOutObject != null) {

					wayBills 		= (WayBillDetailsForPrintingBill[])valueOutObject.get("WayBillDetailsForPrintingBill");
					wayBillIdArray 	= (Long[])valueOutObject.get("WayBillIdArray");
					if(wayBills != null && wayBillIdArray != null) {
						String wayBillIdsStr = Utility.GetLongArrayToString(wayBillIdArray);
						//Get Way Bill details 
						HashMap<Long, WayBill> wbDtls = WayBillDao.getInstance().getWayBillsByWayBillIds(wayBillIdsStr);
						//consigneeDetails = CustomerDetailsDao.getInstance().getConsigneeDetailsByWayBillId(Utility.GetLongArrayToString(wayBillIdArray));
						if(transactionTypeId == CreditWayBillTxn.TXN_TYPE_BOOKING_ID){
							wayBillDetails = WayBillDetailsDAO.getInstance().getWayBillDetails(wayBillIdArray ,true ,ChargeTypeMaster.WAYBILL_CHARGETYPE_BOOKING ,true ,WayBillTaxTxn.WAYBILL_TAX_TXN_TYPE_BOOKING ,true);
						}else if(transactionTypeId == CreditWayBillTxn.TXN_TYPE_DELIVERY_ID){
							wayBillDetails = WayBillDetailsDAO.getInstance().getWayBillDetails(wayBillIdArray ,true ,ChargeTypeMaster.WAYBILL_CHARGETYPE_BOTH ,true ,WayBillTaxTxn.WAYBILL_TAX_TXN_TYPE_BOTH ,true);
						}
						wbIncomeCol = WayBillIncomeDao.getInstance().getWayBillIncomeByWayBillIdArray(wayBillIdsStr);
						consSmry 	= ConsignmentSummaryDao.getInstance().getLimitedConsignmentDetails(wayBillIdsStr);

						for (int i = 0; i < wayBills.length; i++) {

							if(wayBills[i].getDestinationBranchId() > 0 ){
								wayBills[i].setDestinationSubRegion(cache.getGenericSubRegionById(request, wayBills[i].getDestinationSubRegionId()).getName());
								wayBills[i].setDestinationBranch(cache.getGenericBranchDetailCache(request,wayBills[i].getDestinationBranchId()).getName());
							}else{
								//WayBill wb = wbDtls.get(wayBills[i].getWayBillId());
								/*if(wb.getDeliveryPlaceId() > 0){
									wayBills[i].setDestinationCity("");
									wayBills[i].setDestinationBranch(wb.getDeliveryPlace());
								}else{
									wayBills[i].setDestinationCity("");
									wayBills[i].setDestinationBranch("");
								}*/
							}
							//wayBills[i].setConsigneeName(consigneeDetails.get(wayBills[i].getWayBillId()).getName());	
							consDetails 	= wayBillDetails.get(wayBills[i].getWayBillId()).getConsignmentDetails();
							packageDetails 	= "";
							int totalPkgQty = 0;
							double otherCharges = 0;
							otherChargeDetails = new StringBuffer();
							for (int j=0; j<consDetails.length; j++){
								totalPkgQty += consDetails[j].getQuantity();
								if (j != consDetails.length-1){
									packageDetails += consDetails[j].getQuantity()+" "+consDetails[j].getPackingTypeName()+" / ";
								} else {
									packageDetails += consDetails[j].getQuantity()+" "+consDetails[j].getPackingTypeName();
								}
							}
							wayBills[i].setPackageDetails(packageDetails);
							wayBills[i].setQuantity(totalPkgQty);
							//WayBill Charges
							wayBillCharges = wayBillDetails.get(wayBills[i].getWayBillId()).getWayBillCharges();

							for (int j = 0; j < wayBillCharges.length; j++) {
								if(wayBills[i].getTransactionType() == wayBillCharges[j].getChargeType() ){

									if(wayBillCharges[j].getWayBillChargeMasterId() == ChargeTypeMaster.FREIGHT) {
										wayBills[i].setFreightCharge(wayBills[i].getFreightCharge() + wayBillCharges[j].getChargeAmount());
									} else if(wayBillCharges[j].getWayBillChargeMasterId() == ChargeTypeMaster.HAMALI) {
										wayBills[i].setHamaliCharge(wayBills[i].getHamaliCharge() + wayBillCharges[j].getChargeAmount());
									} else{
										if(wayBillCharges[j].getChargeAmount()>0){
											otherCharges += wayBillCharges[j].getChargeAmount();
											otherChargeDetails.append(cache.getChargeTypeMasterById(request, wayBillCharges[j].getWayBillChargeMasterId()).getChargeName()+" : "+Math.round(wayBillCharges[j].getChargeAmount())+", ");
											//wayBills[i].setOtherCharge(wayBills[i].getOtherCharge() + wayBillCharges[j].getChargeAmount());
										}
									}
								}
							}
							//Tax Details
							taxes = wayBillDetails.get(wayBills[i].getWayBillId()).getWayBillTaxTxn();
							for (int j = 0; j < taxes.length; j++) {

								if(wayBills[i].getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID
										&& wayBills[i].getTransactionType() == taxes[j].getTaxTxnType()){
									wayBills[i].setTaxAmount(taxes[j].getTaxAmount());
									wayBills[i].setUnAddedTaxAmount(taxes[j].getUnAddedTaxAmount());
								}else if(wayBills[i].getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT
										&& taxes[j].getTaxTxnType() == CreditWayBillTxn.TXN_TYPE_DELIVERY_ID){
									wayBills[i].setTaxAmount(taxes[j].getTaxAmount());
									wayBills[i].setUnAddedTaxAmount(taxes[j].getUnAddedTaxAmount());
								}else if(wayBills[i].getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY){
									wayBills[i].setTaxAmount(taxes[j].getTaxAmount());
									wayBills[i].setUnAddedTaxAmount(taxes[j].getUnAddedTaxAmount());
								}
							}
							//Get Remark
							wayBills[i].setRemark(wbDtls.get( wayBills[i].getWayBillId()).getRemark());

							//Way bill Income
							if(wbIncomeCol != null) {
								wbIncomeArr = wbIncomeCol.get(wayBills[i].getWayBillId());
								if(wbIncomeArr!=null){
									for(int j=0; j < wbIncomeArr.size(); j++) {
										wbIncome = wbIncomeArr.get(j);
										otherCharges += wbIncome.getAmount();
										otherChargeDetails.append(wbIncome.getIncomeName() +" : "+ Math.round(wbIncome.getAmount())+", ");
									}
								}
							}

							//Get the rate
							rate = RateMasterDao.getInstance().getRateMasterForCorporate(wayBills[i].getSourceBranchId(), wayBills[i].getDestinationBranchId(),executive.getAccountGroupId(), wayBills[i].getCreditorId(), TransportCommonMaster.RATE_CATEGORY_CREDITOR);
							//long rateOnPackingType = 0;
							if(rate != null){
								for (int j = 0; j < rate.length; j++) {
									if(rate[j].getChargeTypeMasterId()== ChargeTypeMaster.FREIGHT){
										/*if(rate[j].getMinWeight()== 1 && rate[j].getMaxWeight()==1){
											}else if(rate[j].getMinWeight()== 0 && rate[j].getMaxWeight()==0){
												rateOnPackingType = rate[j].getPackingTypeId(); 
											}*/
										wayBills[i].setRate(rate[j].getRate()); 
									}
								}
							}

							if(consSmry != null){
								wayBills[i].setChargeTypeId(consSmry.get(wayBills[i].getWayBillId()).getChargeTypeId());

								switch (wayBills[i].getChargeTypeId()) {
								case TransportCommonMaster.CHARGETYPE_ID_FIX:
									wayBills[i].setRateType("FIXED");
									wayBills[i].setRate(0.0);
									break;
								case TransportCommonMaster.CHARGETYPE_ID_WEIGHT :
									wayBills[i].setRateType(" (W)");
									break;
								case TransportCommonMaster.CHARGETYPE_ID_QUANTITY:
									wayBills[i].setRateType(" (Q)");
									break;
								default:
									break;
								}

								wayBills[i].setBookingTypeId(consSmry.get(wayBills[i].getWayBillId()).getBookingTypeId());
								if(wayBills[i].getBookingTypeId()== TransportCommonMaster.BOOKING_TYPE_FTL_ID){
									wayBills[i].setRateType(TransportCommonMaster.getBookingType(wayBills[i].getBookingTypeId()));
									wayBills[i].setRate(0.0);
								}
							}
							//Set otherCharges
							wayBills[i].setOtherCharge(otherCharges);
							//Set Other Charges Details
							if(otherChargeDetails.length() > 0){
								wayBills[i].setOtherChargeDetails(otherChargeDetails.toString().substring(0, otherChargeDetails.length()- 2));
							}
							//Set GrandTotal
							wayBills[i].setGrandTotal(	wayBills[i].getFreightCharge()+	wayBills[i].getHamaliCharge()+otherCharges);

						}
						request.setAttribute("WayBillDetailsForPrintingBill", wayBills);
					}
				}

				reportViewModel = new ReportViewModel();
				reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);
				request.setAttribute("ReportViewModel",reportViewModel);

			} else {
				LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, CargoErrorList.SYSTEM_ERROR + "");
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}

			request.setAttribute("nextPageToken", "success_"+executive.getAccountGroupId());

		} catch (Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		} finally {
			bill				= null;
			cache 				= null;
			executive			= null;
			reportViewModel 	= null;
			branch				= null;
			wayBills			= null;
			valueOutObject		= null;
			wayBillIdArray		= null;
			wayBillDetails 		= null;
			consDetails 		= null;
			packageDetails 		= null;
		}
	}
}
