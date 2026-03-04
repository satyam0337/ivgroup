package com.ivcargo.actions.transport;

//~--- non-JDK imports --------------------------------------------------------

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.SortedMap;
import java.util.TreeMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.CreateBLHPVBLL;
import com.businesslogic.DispatchBLL;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.constant.properties.lhpv.LhpvPrintConfigurationConstant;
import com.iv.dao.impl.crossingagent.CrossingAgentMasterDaoImpl;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.dto.crossingagent.CrossingAgentMaster;
import com.iv.utils.constant.AccountGroupConstant;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.exception.ExceptionProcess;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.ConsignmentSummaryDao;
import com.platform.dao.CustomerDetailsDao;
import com.platform.dao.DispatchSummaryDao;
import com.platform.dao.DriverMasterDao;
import com.platform.dao.LHPVDao;
import com.platform.dao.VehicleAgentMasterDao;
import com.platform.dao.WayBillBookingChargesDao;
import com.platform.dao.WayBillCrossingDao;
import com.platform.dao.WayBillDao;
import com.platform.dao.WayBillTaxTxnDao;
import com.platform.dto.BillDetailsForPrintingBill;
import com.platform.dto.ChargeTypeMaster;
import com.platform.dto.ConsignmentSummary;
import com.platform.dto.Executive;
import com.platform.dto.LHPV;
import com.platform.dto.LHPVModel;
import com.platform.dto.WayBill;
import com.platform.dto.WayBillBookingCharges;
import com.platform.dto.WayBillCrossing;
import com.platform.dto.WayBillTaxTxn;
import com.platform.dto.constant.BookingChargeConstant;
import com.platform.dto.constant.WayBillTypeConstant;
import com.platform.dto.model.DispatchForLHPVPrintModel;
import com.platform.dto.model.ReportViewModel;
import com.platform.dto.model.WayBillForCrossingHire;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

public class PrintLHPVWithLSDetailsAction implements Action {

	public static final String 	TRACE_ID	= "PrintLHPVWithLSDetailsAction";
	CacheManip       			cache		= null;

	@Override
	@SuppressWarnings("unchecked")
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {

		HashMap<String,Object>	 error 			= null;
		LHPV				lhpv				= null;
		String				sourceBranchStr		= null;
		String				destBranchStr		= null;
		String				lsIds				= null;
		ArrayList<Long>		waybillIdsList		= null;
		Long[]				wayBillArr			= null;
		HashMap<Long,ArrayList<Long>>		dispachLedgerWithWBIdsMap	= null;
		HashMap<Long,Double>				wbIdWiseCrossingHire		= null;
		HashMap<Long,WayBill>				waybillHM					= null;
		HashMap<Long,ConsignmentSummary>	consignmentSummaryHM		= null;
		SortedMap<String,BillDetailsForPrintingBill>	billDetailsHM	= null;
		HashMap<Long, Boolean>	lsIdhashMap	= null;
		HashMap<Long, WayBillForCrossingHire> wayBillCrsgColl = null;
		ValueObject 	valueOutObjectForCharges = null;
		HashMap<Long, HashMap<Long, WayBillBookingCharges>> 	wayBillBookingchargesHM		= null;
		HashMap<Long, Double>	lsIdWiseCrossinghashMap	= null;
		ArrayList<Long>				crossingAgentIdList	= null;
		String						crossingAgentIds	= null;
		Map<Long, CrossingAgentMaster>	crossingAgentMasterHM			= null;
		CrossingAgentMaster				agentMaster   			= null;
		HashMap<Long, WayBillForCrossingHire> crossingAgentWiseHM = null;

		var	totalPaid			= 0.00;
		var	totalToPay			= 0.00;
		var	totalCredit			= 0.00;
		var	totalActualWeight	= 0.00;
		var		totalQuantity		= 0;
		var 	taxAmnt 			= 0D;
		var 	totalTaxAmnt 		= 0D;
		var  wbFCrossingHireAmt	= 0D;
		var totalLSCrossingHireAmount = 0D;
		var	doorDeliveryCharge	 = 0.0;
		var	totalDoorDeliveryCharge	 = 0.0;
		var	bookingCrossingAndCrossingHire = 0.00;

		try {

			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	dispatchLedgerId 	= JSPUtility.GetLong(request, "dispatchLedgerId" ,0);
			var	lhpvId 				= JSPUtility.GetLong(request, "lhpvId" ,0);
			cache				= new CacheManip(request);
			final var	executive 			= cache.getExecutive(request);
			final var	dispatchBLL			= new DispatchBLL();
			final var	inValObj			= new ValueObject();
			var	wayBillIds			= "";
			final var 	lhpvPrintConfigHM	= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.LHPV_PRINT);
			final var	accountGroup		= cache.getAccountGroupByAccountGroupId(request, executive.getAccountGroupId());
			final var	isLaserPrint 		= JSPUtility.GetBoolean(request, "isLaserPrint" ,false);

			final var	lhpvPrintChangesAllowedAfterDeliveryTimeBillCredit = (boolean) lhpvPrintConfigHM.getOrDefault(LhpvPrintConfigurationConstant.LHPV_PRINT_CHANGES_ALLOWED_AFTER_DELIVERY_TIME_BILL_CREDIT, false);

			inValObj.put("dispatchLedgerId", dispatchLedgerId);
			inValObj.put("lhpvId", lhpvId);
			inValObj.put("executive", executive);

			var	outValObj = dispatchBLL.getLHPVData(inValObj);

			if (outValObj != null) {
				final var	lhpvModels		= (LHPVModel[])outValObj.get("lHPVModelArr");
				var			reportViewModel = new ReportViewModel();
				final var	lhpvModel		= new LHPVModel();
				final var	lsForLhpvModel	= new DispatchForLHPVPrintModel[lhpvModels.length];

				if(outValObj.get("lhpvId") != null)
					lhpvId = (Long)outValObj.get("lhpvId");

				lsIds = Utility.GetLongArrayToString((Long[])outValObj.get("dispatchIdArr"));

				outValObj = DispatchSummaryDao.getInstance().getDispatchSummaryByDispatchLedgerIds(lsIds);

				inValObj.put("lhpvId", lhpvId);

				valueOutObjectForCharges = CreateBLHPVBLL.getInstance().getLHPVChargesForGroup(inValObj);

				if(outValObj != null) {
					lsIdhashMap 		 	  = (HashMap<Long, Boolean>) outValObj.get("dlForManual");
					dispachLedgerWithWBIdsMap = (HashMap<Long,ArrayList<Long>>)outValObj.get("dispachLedgerWithWaybillids");
					waybillIdsList			  = (ArrayList<Long>)outValObj.get("waybillIdsForCreatingString");
					wayBillArr				  = new Long[waybillIdsList.size()];
					wayBillIds				  = Utility.GetLongArrayToString(waybillIdsList.toArray(wayBillArr));
					waybillHM 				  = WayBillDao.getInstance().getLimitedLRDetails(wayBillIds);
					wayBillBookingchargesHM   = WayBillBookingChargesDao.getInstance().getWayBillIdWiseChargesMap(wayBillIds);
					consignmentSummaryHM      = ConsignmentSummaryDao.getInstance().getConsignmentSummaryWeightsByWayBillIds(wayBillIds);
				}

				lsIdWiseCrossinghashMap =  new HashMap<>();
				crossingAgentIdList 	=  new ArrayList<>() ;
				crossingAgentWiseHM     =  new HashMap<>();

				//Code to retrieve crossing hire during LS creation
				if((executive.getAccountGroupId()== AccountGroupConstant.ACCOUNT_GROUP_ID_HTC
						|| executive.getAccountGroupId()== AccountGroupConstant.ACCOUNT_GROUP_ID_KHTC
						|| executive.getAccountGroupId()== AccountGroupConstant.ACCOUNT_GROUP_ID_MAHESH
						) && lsIdhashMap != null){
					//Get Booking Crossing Amounts
					wayBillCrsgColl	   = WayBillCrossingDao.getInstance().getWayBillCrossingHireByWayBillIds(wayBillIds, WayBillCrossing.TRANSACTION_TYPE_BOOKING_CROSSING);

					if(wayBillCrsgColl != null){
						for (final Long wbId : wayBillCrsgColl.keySet()) {
							totalLSCrossingHireAmount += getCrossingHireAmount(wayBillCrsgColl.get(wbId));
							crossingAgentIdList.add(wayBillCrsgColl.get(wbId).getCrossingAgentId());
						}

						if(crossingAgentIdList != null && !crossingAgentIdList.isEmpty()) {
							crossingAgentIds = Utility.GetLongArrayListToString(crossingAgentIdList);
							crossingAgentMasterHM = CrossingAgentMasterDaoImpl.getInstance().getCrossingAgentDetails(crossingAgentIds);
						}
					}
				}

				lhpv = LHPVDao.getInstance().getLHPVDetails(lhpvId);
				lhpvModel.setVehicleCapacity(lhpv.getVehicleCapacity());
				lhpvModel.setLhpvTotalActualWeight(lhpv.getTotalActualWeight());
				lhpvModel.setWeightDifference(lhpv.getWeightDifference());
				lhpvModel.setRemark(lhpv.getRemark());

				for (var i = 0; i < lhpvModels.length; i++) {
					totalPaid			= 0.00;
					totalToPay			= 0.00;
					totalCredit			= 0.00;
					totalActualWeight   = 0.00;
					totalQuantity		= 0;

					if/*(lhpvModels[i].getBalancePayableAtCityId() > 0
							&& lhpvModels[i].getBalancePayableAtBranchId() > 0)*/
					(lhpvModels[i].getBalancePayableAtBranchId() > 0)
						lhpvModel.setBalancePayableAtBranch(cache.getGenericBranchDetailCache(request,lhpvModels[i].getBalancePayableAtBranchId()).getName());
					else
						lhpvModel.setBalancePayableAtBranch("");

					sourceBranchStr = cache.getGenericBranchDetailCache(request,lhpvModels[i].getSourceBranchId()).getName();

					if(lhpvModels[i].getDestinationBranchId() > 0)
						destBranchStr = cache.getGenericBranchDetailCache(request,lhpvModels[i].getDestinationBranchId()).getName();

					lhpvModel.setLoadedById(lhpvModels[i].getLoadedById());

					if(i == 0) {
						request.setAttribute("LoggedInBranchDetails", cache.getGenericBranchDetailCache(request,executive.getBranchId()));
						reportViewModel = populateReportViewModel(request,reportViewModel,lhpvModels[i], executive);
						request.setAttribute("ReportViewModel", reportViewModel);
						lhpvModel.setDispatchLedgerIds(""+lhpvModels[i].getDispatchLedgerId());
						lhpvModel.setSourceBranchString(sourceBranchStr);
						lhpvModel.setLhpvSourceBranch(cache.getGenericBranchDetailCache(request,lhpv.getlHPVBranchId()).getName());
						lhpvModel.setDestinationBranch(cache.getGenericBranchDetailCache(request, lhpv.getDestinationBranchId()).getName());
						lhpvModel.setDestinationBranchString(destBranchStr);
						lhpvModel.setLsNumber(""+lhpvModels[i].getLsNumber());

						//Vehicle Agent
						if(lhpvModels[i].getVehicleAgentId() > 0) {
							final var	vehicleAgentMaster = VehicleAgentMasterDao.getInstance().getSingleVehicleAgentDetails(lhpvModels[i].getVehicleAgentId());
							lhpvModel.setVehicleAgentName(vehicleAgentMaster.getName());
							lhpvModel.setPanNumber(vehicleAgentMaster.getPanNo());
						} else {
							if(executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_SNGT
									|| executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_KATIRA)
								lhpvModel.setVehicleAgentName(accountGroup.getDescription());
							else
								lhpvModel.setVehicleAgentName("");

							lhpvModel.setPanNumber("");
						}

						if(executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_KHTC)
							lhpvModel.setPanNumber(lhpvModels[i].getPanNumber());

						//Driver 1
						if(lhpvModels[i].getDriverId() > 0) {
							final var	driverMaster = DriverMasterDao.getInstance().getDriverDataById(lhpvModels[i].getDriverId(), executive.getAccountGroupId());
							lhpvModel.setDriverName(driverMaster.getName());
							lhpvModel.setDriverLicenceNumber(driverMaster.getLicenceNumber());
						} else {
							lhpvModel.setDriverName("");
							lhpvModel.setDriverLicenceNumber("");
						}
						// Get Driver1 mobile Number from first LHPV
						lhpvModel.setDriver1MobileNumber1(lhpvModels[i].getDriver1MobileNumber1() != null?lhpvModels[i].getDriver1MobileNumber1():"");
						lhpvModel.setDriver1MobileNumber2(lhpvModels[i].getDriver1MobileNumber2() != null?lhpvModels[i].getDriver1MobileNumber2():"");
						if(lhpvModel.getDriver1MobileNumber2().length() > 0 )
							//Get single string of the two mobile Numbers
							lhpvModel.setDriver1MobileNumber1(lhpvModel.getDriver1MobileNumber1() +", "+ lhpvModel.getDriver1MobileNumber2());

						//Driver 2
						if(lhpvModels[i].getDriver2Id() > 0) {
							final var	driverMaster = DriverMasterDao.getInstance().getDriverDataById(lhpvModels[i].getDriver2Id(), executive.getAccountGroupId());
							lhpvModel.setDriver2Name(driverMaster.getName());
							lhpvModel.setDriver2LicenceNumber(driverMaster.getLicenceNumber());
						} else {
							lhpvModel.setDriver2Name("");
							lhpvModel.setDriver2LicenceNumber("");
						}
					} else {
						lhpvModel.setLsNumber(lhpvModel.getLsNumber()+","+lhpvModels[i].getLsNumber());
						lhpvModel.setDispatchLedgerIds(lhpvModel.getDispatchLedgerIds()+" ,"+lhpvModels[i].getDispatchLedgerId());
						lhpvModel.setSourceBranchString(lhpvModel.getSourceBranchString()+" ,"+sourceBranchStr);
						lhpvModel.setDestinationBranchString(lhpvModel.getDestinationBranchString()+" ,"+destBranchStr);

						if(lhpvModel.getVehicleAgentName() == null) lhpvModel.setVehicleAgentName("");
						if(lhpvModel.getDriverName() == null) lhpvModel.setDriverName("");
						if(lhpvModel.getDriverLicenceNumber() == null) lhpvModel.setDriverLicenceNumber("");
						if(lhpvModel.getDriver2Name() == null) lhpvModel.setDriver2Name("");
						if(lhpvModel.getDriver2LicenceNumber() == null) lhpvModel.setDriver2LicenceNumber("");
						if(lhpvModel.getAgentName() == null) lhpvModel.setAgentName("");
					}

					lhpvModel.setTotalActualWeight(lhpvModel.getTotalActualWeight() + lhpvModels[i].getTotalActualWeight());
					lhpvModel.setTotalNoOfPackages(lhpvModel.getTotalNoOfPackages() + lhpvModels[i].getTotalNoOfPackages());
					lhpvModel.setTotalNoOfWayBills(lhpvModel.getTotalNoOfWayBills() + lhpvModels[i].getTotalNoOfWayBills());
					lhpvModel.setTotalNoOfDoorDelivery(lhpvModel.getTotalNoOfDoorDelivery() + lhpvModels[i].getTotalNoOfDoorDelivery());
					lhpvModel.setTotalNoOfForms(lhpvModel.getTotalNoOfForms() + lhpvModels[i].getTotalNoOfForms());
					lhpvModel.setVehicleNumber(lhpvModels[i].getVehicleNumber());
					lhpvModel.setLhpvId(lhpvModels[i].getLhpvId());
					lhpvModel.setCreationDateTimeStamp(lhpvModels[i].getCreationDateTimeStamp());
					lhpvModel.setTotalAmount(lhpvModels[i].getTotalAmount());
					lhpvModel.setAdvanceAmount(lhpvModels[i].getAdvanceAmount());
					lhpvModel.setBalanceAmount(lhpvModels[i].getBalanceAmount());
					lhpvModel.setBalancePayableAtBranchId(lhpvModels[i].getBalancePayableAtBranchId());
					lhpvModel.setMaterials(lhpvModels[i].getMaterials());
					lhpvModel.setRatePMT(lhpvModels[i].getRatePMT());
					lhpvModel.setUnloading(lhpvModels[i].getUnloading());
					lhpvModel.setDetaintion(lhpvModels[i].getDetaintion());
					lhpvModel.setOtherAdditionalCharge(lhpvModels[i].getOtherAdditionalCharge());
					lhpvModel.setDeduction(lhpvModels[i].getDeduction());
					lhpvModel.setToPayReceived(lhpvModels[i].getToPayReceived());
					lhpvModel.setRefund(lhpvModels[i].getRefund());
					lhpvModel.setLhpvNumber(lhpvModels[i].getLhpvNumber());
					lhpvModel.setLhpvBranchId(lhpvModels[i].getLhpvBranchId());
					lhpvModel.setAgentName(lhpvModels[i].getAgentName());

					waybillIdsList = dispachLedgerWithWBIdsMap.get(lhpvModels[i].getDispatchLedgerId());

					if(waybillIdsList != null) {
						if((boolean) lhpvPrintConfigHM.getOrDefault(LhpvPrintConfigurationConstant.DATA_FOR_CROSSING_HORE, false))
							wbIdWiseCrossingHire 	  = WayBillBookingChargesDao.getInstance().getWayBillChargeMapByWayBillIdsAndChargeMasterId(Utility.GetLongArrayListToString(waybillIdsList), ChargeTypeMaster.CROSSING_BOOKING);

						for (final Long element : waybillIdsList) {
							doorDeliveryCharge		= 0.0;
							final var	wayBill = waybillHM.get(element);
							final var	summary = consignmentSummaryHM.get(element);

							if(wbIdWiseCrossingHire!=null && wbIdWiseCrossingHire.get(element) != null)
								wbFCrossingHireAmt	+= wbIdWiseCrossingHire.get(element);

							if((boolean) lhpvPrintConfigHM.getOrDefault(LhpvPrintConfigurationConstant.DATA_SERVICE_TAX, false)){
								final var	wayBillTaxTxn			= WayBillTaxTxnDao.getInstance().getWayBillTaxTxn((short) 0, element);

								taxAmnt = 0;

								if(wayBillTaxTxn != null && wayBillTaxTxn.length > 0) {
									for (final WayBillTaxTxn element2 : wayBillTaxTxn)
										taxAmnt +=  element2.getTaxAmount();

									totalTaxAmnt += taxAmnt;
								}
							}

							if(wayBill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID)
								totalPaid += wayBill.getBookingTotal();
							else if(wayBill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY )
								totalToPay += wayBill.getBookingTotal();
							else if(wayBill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT)
								if(!lhpvPrintChangesAllowedAfterDeliveryTimeBillCredit && summary.isDeliveryTimeTBB())
									totalToPay += wayBill.getBookingTotal();
								else
									totalCredit += wayBill.getBookingTotal();

							totalActualWeight += summary.getActualWeight();
							totalQuantity	  += summary.getQuantity();

							final var	chargeWiseHM	= wayBillBookingchargesHM.get(element);

							if(chargeWiseHM != null){
								for(final Long chargeId : chargeWiseHM.keySet())
									if(chargeId == BookingChargeConstant.DOOR_DELIVERY_BOOKING)
										doorDeliveryCharge += chargeWiseHM.get(chargeId).getChargeAmount();

								totalDoorDeliveryCharge += doorDeliveryCharge;
							}

							agentMaster = null;

							if(wayBillCrsgColl != null){
								final var	wayBillCrossing = wayBillCrsgColl.get(element);

								if(wayBillCrossing != null) {
									if(lsIdWiseCrossinghashMap.get(lhpvModels[i].getDispatchLedgerId())  != null)
										lsIdWiseCrossinghashMap.put(lhpvModels[i].getDispatchLedgerId(),lsIdWiseCrossinghashMap.get(lhpvModels[i].getDispatchLedgerId()) + wayBillCrossing.getCrossingAmountHire());
									else
										lsIdWiseCrossinghashMap.put(lhpvModels[i].getDispatchLedgerId(),wayBillCrossing.getCrossingAmountHire());

									var	wbc = crossingAgentWiseHM.get(wayBillCrossing.getCrossingAgentId());

									if(wbc == null) {
										if(crossingAgentMasterHM != null)
											agentMaster = crossingAgentMasterHM.get(wayBillCrossing.getCrossingAgentId());

										wbc = new WayBillForCrossingHire();
										wbc.setCrossingAgentId(wayBillCrossing.getCrossingAgentId());
										wbc.setCrossingAmountHire(wayBillCrossing.getCrossingAmountHire());
										wbc.setNoOfPackages(summary.getQuantity());
										wbc.setActualWeight(summary.getActualWeight());
										wbc.setCrossingAgentName(agentMaster != null ? agentMaster.getName() : "");
										crossingAgentWiseHM.put(wayBillCrossing.getCrossingAgentId(), wbc);
									} else {
										wbc.setCrossingAmountHire(wayBillCrossing.getCrossingAmountHire()+wbc.getCrossingAmountHire());
										wbc.setNoOfPackages(summary.getQuantity() + wbc.getNoOfPackages());
										wbc.setActualWeight(summary.getActualWeight()+wbc.getActualWeight());
										wbc.setNoOfLR(wbc.getNoOfLR() + 1);
									}
								}
							}
						}
					}

					lsForLhpvModel[i] = new DispatchForLHPVPrintModel();
					lsForLhpvModel[i].setDispatchLedgerNumber(lhpvModels[i].getLsNumber());
					lsForLhpvModel[i].setDestinationBranch(destBranchStr);
					lsForLhpvModel[i].setNoOfWayBills(lhpvModels[i].getTotalNoOfWayBills());
					lsForLhpvModel[i].setTopayAmount(totalToPay);
					lsForLhpvModel[i].setPaidAmount(totalPaid);
					lsForLhpvModel[i].setTbbAmount(totalCredit);
					lsForLhpvModel[i].setNoOfPackages(totalQuantity);
					lsForLhpvModel[i].setActualWeight(totalActualWeight);
					lsForLhpvModel[i].setTotServiceTax(totalTaxAmnt);
					lsForLhpvModel[i].setTotCrossingHire(wbFCrossingHireAmt); // crossing hire charge during LR creation
					lsForLhpvModel[i].setTotalDoorDelivery(totalDoorDeliveryCharge);
					lsForLhpvModel[i].setDispatchLedgerId(lhpvModels[i].getDispatchLedgerId());

				}
				bookingCrossingAndCrossingHire = wbFCrossingHireAmt + totalLSCrossingHireAmount;

				if(request.getParameter("isOriginal") != null)
					request.setAttribute("isOriginal",Boolean.parseBoolean(request.getParameter("isOriginal").toString()));

				if(wayBillIds != null && wayBillIds.length() > 0){
					final var	creditorHM = CustomerDetailsDao.getInstance().getCorporateDetailsByWayBillId(wayBillIds);

					if(creditorHM != null && creditorHM.size() > 0){
						billDetailsHM	= new TreeMap<>();

						for(final Long key : waybillHM.keySet()){
							final var	wayBill = waybillHM.get(key);
							final var	summary = consignmentSummaryHM.get(key);

							if(wayBill != null && wayBill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT)
								if(!lhpvPrintChangesAllowedAfterDeliveryTimeBillCredit) {
									if(!summary.isDeliveryTimeTBB()) {
										final var	corporateConsignor = creditorHM.get(wayBill.getWayBillId());
										var	billPrint = billDetailsHM.get(corporateConsignor.getName()+"_"+corporateConsignor.getCorporateAccountId());

										if(billPrint == null){
											billPrint = new BillDetailsForPrintingBill();
											billPrint.setCreditorId(corporateConsignor.getCorporateAccountId());
											billPrint.setCreditorName(corporateConsignor.getName());
											billPrint.setQuantity(summary.getQuantity());
											billPrint.setWeight(summary.getActualWeight());
											billPrint.setGrandTotal(wayBill.getBookingTotal());
											billPrint.setNoOfLR(1);

											billDetailsHM.put(corporateConsignor.getName()+"_"+corporateConsignor.getCorporateAccountId(), billPrint);
										} else {
											billPrint.setQuantity(billPrint.getQuantity() +	summary.getQuantity());
											billPrint.setWeight(billPrint.getWeight() +	summary.getActualWeight());
											billPrint.setGrandTotal(billPrint.getGrandTotal() +	wayBill.getBookingTotal());
											billPrint.setNoOfLR(billPrint.getNoOfLR() + 1);
										}
									}
								} else {
									final var	corporateConsignor = creditorHM.get(wayBill.getWayBillId());
									var	billPrint = billDetailsHM.get(corporateConsignor.getName()+"_"+corporateConsignor.getCorporateAccountId());

									if(billPrint == null){
										billPrint = new BillDetailsForPrintingBill();
										billPrint.setCreditorId(corporateConsignor.getCorporateAccountId());
										billPrint.setCreditorName(corporateConsignor.getName());
										billPrint.setQuantity(summary.getQuantity());
										billPrint.setWeight(summary.getActualWeight());
										billPrint.setGrandTotal(wayBill.getBookingTotal());
										billPrint.setNoOfLR(1);

										billDetailsHM.put(corporateConsignor.getName()+"_"+corporateConsignor.getCorporateAccountId(), billPrint);
									} else {
										billPrint.setQuantity(billPrint.getQuantity() +	summary.getQuantity());
										billPrint.setWeight(billPrint.getWeight() +	summary.getActualWeight());
										billPrint.setGrandTotal(billPrint.getGrandTotal() +	wayBill.getBookingTotal());
										billPrint.setNoOfLR(billPrint.getNoOfLR() + 1);
									}
								}
						}
					}
				}

				request.setAttribute("billDetailsHM", billDetailsHM);
				request.setAttribute("ReportData", lhpvModel);
				request.setAttribute("LsForLhpvModel", lsForLhpvModel);
				request.setAttribute("AllLHPVCharges", valueOutObjectForCharges.get("lhvChrgesGrpArr"));
				request.setAttribute("chargesColl", valueOutObjectForCharges.get("chargesColl"));
				request.setAttribute("lhpvChargesHshmp", valueOutObjectForCharges.get("lhpvChargesHshmp"));
				request.setAttribute("TransportCrossingCharge", bookingCrossingAndCrossingHire);
				request.setAttribute("lsIdWiseCrossinghashMap", lsIdWiseCrossinghashMap);
				request.setAttribute("totalLSCrossingHireAmount", totalLSCrossingHireAmount);
				request.setAttribute("crossingAgentWiseHM", crossingAgentWiseHM);

				if(isLaserPrint)
					request.setAttribute("nextPageToken", "success_ledger_"+executive.getAccountGroupId());
				else
					request.setAttribute("nextPageToken", "success_"+executive.getAccountGroupId());
			} else {
				error.put("errorCode", CargoErrorList.NO_RECORDS);
				error.put("errorDescription", CargoErrorList.NO_RECORDS_DESCRIPTION);
				request.setAttribute("cargoError", error);
				request.setAttribute("nextPageToken", "success");
			}

		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}
	}

	public ReportViewModel populateReportViewModel(final HttpServletRequest request,final ReportViewModel reportViewModel ,final LHPVModel lhpv, final Executive executive) throws Exception{
		try {
			final var	branch = cache.getGenericBranchDetailCache(request,lhpv.getSourceBranchId());
			reportViewModel.setBranchPhoneNumber(branch.getPhoneNumber());
			reportViewModel.setBranchAddress(branch.getAddress());

			final var	accountGroup = cache.getAccountGroupById(request, executive.getAccountGroupId());
			reportViewModel.setAccountGroupName(accountGroup.getDescription());

			return  reportViewModel;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private Double getCrossingHireAmount( final WayBillForCrossingHire wayBillForCrsg) throws Exception{
		var crossingHireAmt = 0D;

		if(wayBillForCrsg != null)
			crossingHireAmt = wayBillForCrsg.getCrossingAmountHire();

		return crossingHireAmt;
	}
}