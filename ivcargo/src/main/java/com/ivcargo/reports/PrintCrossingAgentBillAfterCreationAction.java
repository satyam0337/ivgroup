package com.ivcargo.reports;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.ObjectUtils;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.dao.impl.DispatchSummaryDaoImpl;
import com.iv.dao.impl.crossingagentbill.CrossingAgentBillingChargesDaoImpl;
import com.iv.dao.impl.crossingagentbill.LRWiseCrossingAgentBillSummaryDaoImpl;
import com.iv.dto.DispatchSummary;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.dto.constant.WayBillTypeConstant;
import com.iv.dto.crossingagentbill.CrossingAgentBillingCharges;
import com.iv.dto.crossingagentbill.LRWiseCrossingAgentBillSummary;
import com.iv.properties.constant.CrossingAgentBillPropertiesConstant;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.constant.DateTimeFormatConstant;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.DispatchLedgerDao;
import com.platform.dao.reports.CrossingAgentBillClearanceDAO;
import com.platform.dao.reports.CrossingAgentBillDAO;
import com.platform.dao.reports.CrossingAgentBillSummaryDAO;
import com.platform.dto.CrossingAgentBill;
import com.platform.dto.CrossingAgentBillPrintModel;
import com.platform.dto.CrossingAgentBillSummary;
import com.platform.dto.DispatchLedger;
import com.platform.dto.VehicleNumberMaster;
import com.platform.dto.model.ReportViewModel;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;


public class PrintCrossingAgentBillAfterCreationAction implements Action {
	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	 				error 							= null;
		CrossingAgentBillPrintModel[]			modelArr						= null;
		List<CrossingAgentBillSummary>			crossingAgentBillSummaryArr		= null;
		List<LRWiseCrossingAgentBillSummary> 	lrWiseCrossingAgentBillSummary 	= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var billId 	= JSPUtility.GetLong(request, "billId" ,0);
			final var cache		= new CacheManip(request);
			final var executive	= cache.getExecutive(request);

			final var	configuration		= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.CROSSING_AGENT_BILL);
			final var 	allowRoundOffAmount	= (boolean) configuration.getOrDefault(CrossingAgentBillPropertiesConstant.ALLOW_ROUND_OFF_AMOUNT, false);
			final var	accountGroup		= cache.getAccountGroupById(request, executive.getAccountGroupId());

			final var	bill = CrossingAgentBillDAO.getInstance().getCrossingAgentBillDetailsForPrintingBill(billId);

			if(bill != null) {
				final var	branch = cache.getBranchById(request, executive.getAccountGroupId(), bill.getBranchId());
				bill.setBranchName(branch.getName());
				bill.setBranchAddress(branch.getAddress());
				bill.setBranchPhoneNumber(branch.getMobileNumber());
				request.setAttribute("BillDetailsForPrintingBill", bill);

				final var				billClearance	= CrossingAgentBillClearanceDAO.getInstance().getCrossingAgentBillClearanceDetailsForView(Long.toString(billId));

				if(billClearance != null)
					request.setAttribute("BillClearanceDetailsForPrintBill", billClearance);

				if(bill.getBillTypeId() == CrossingAgentBill.CROSSINGAGENT_BILL_TYPE_LR_WISE_ID)
					lrWiseCrossingAgentBillSummary 	= LRWiseCrossingAgentBillSummaryDaoImpl.getInstance().getWayBillDetailsForPrintingBill(billId);
				else
					crossingAgentBillSummaryArr 	= CrossingAgentBillSummaryDAO.getInstance().getWayBillDetailsForPrintingBill(billId);

				if(ObjectUtils.isEmpty(crossingAgentBillSummaryArr) && ObjectUtils.isEmpty(lrWiseCrossingAgentBillSummary)) {
					error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
					error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
					request.setAttribute("cargoError", error);
					request.setAttribute("nextPageToken", "failure");
					return;
				}

				final Map<String, CrossingAgentBillPrintModel>	crossingAgentBillPrintHM = new TreeMap<>();
				final Map<Long, VehicleNumberMaster>				vehicleNumberHM				= cache.getALLVehicleNumberOfGroup(request, executive.getAccountGroupId());

				if(ObjectUtils.isNotEmpty(crossingAgentBillSummaryArr)) {
					final var dispatchIdsStr = crossingAgentBillSummaryArr.stream().map(e -> Long.toString(e.getDispatchLedgerId())).collect(Collectors.joining(","));
					final Map<Long, DispatchLedger>	lsColl				  = DispatchLedgerDao.getInstance().getDispatchLedgerDetailsByLSIds(dispatchIdsStr);

					final var dispatchSummaries			= DispatchSummaryDaoImpl.getInstance().getLimitedDispatchSummaryByDispatchLedgerIds(dispatchIdsStr);
					final var dispatchSummaryHM			= dispatchSummaries.stream().collect(Collectors.groupingBy(DispatchSummary::getDispatchLedgerId));
					final var crossingAgentChargeMap	= CrossingAgentBillingChargesDaoImpl.getInstance().getCrossingAgentBillingChargesMap(billId, dispatchIdsStr);

					for (final CrossingAgentBillSummary element : crossingAgentBillSummaryArr) {
						final var model = new CrossingAgentBillPrintModel();

						final var dispatchLedger	= lsColl.get(element.getDispatchLedgerId());
						final var lrWiseList		= dispatchSummaryHM.get(element.getDispatchLedgerId());
						final var dispatchChargeMap = crossingAgentChargeMap.get(element.getDispatchLedgerId());

						if(ObjectUtils.isNotEmpty(lrWiseList))
							model.setTbbAmount(lrWiseList.stream().filter(e -> e.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT).mapToDouble(e -> Math.round(e.getBookingTotal())).sum());

						model.setCrossingAgentBillId(element.getCrossingAgentBillId());
						model.setBillNumber(element.getBillNumber());
						model.setDispatchLedgerId(element.getDispatchLedgerId());
						model.setLsNumber(element.getLsNumber());
						model.setPaidAmount(element.getPaidAmount());
						model.setTopayAmount(element.getTopayAmount());
						model.setCrossingHire(element.getCrossingHire());
						model.setNetAmount(allowRoundOffAmount ? Math.round(element.getNetAmount()) : element.getNetAmount());
						model.setDoorDelivery(element.getDoorDelivery());
						model.setActualWeight(dispatchLedger.getTotalActualWeight());
						model.setQuantity(dispatchLedger.getTotalNoOfPackages());
						model.setSourceBranchId(dispatchLedger.getSourceBranchId());
						model.setDestinationBranchId(dispatchLedger.getDestinationBranchId());
						model.setSourceBranch(cache.getBranchById(request, executive.getAccountGroupId(), dispatchLedger.getSourceBranchId()).getName());
						model.setDestinationBranch(cache.getBranchById(request, executive.getAccountGroupId(), dispatchLedger.getDestinationBranchId()).getName());
						model.setTripDateTime(dispatchLedger.getTripDateTime());
						model.setLorryHire(element.getLorryHire());
						model.setTripDateTimeStr(DateTimeUtility.getDateFromTimeStamp(model.getTripDateTime(), DateTimeFormatConstant.YYYY_MM_DD));
						model.setHamali(element.getHamali());
						model.setTotalAmt(model.getTbbAmount() + model.getPaidAmount() + model.getTopayAmount());

						final var vehicle = vehicleNumberHM.get(dispatchLedger.getVehicleNumberMasterId());

						if(vehicle != null) {
							model.setVehicleNumber(Utility.checkedNullCondition(vehicle.getVehicleNumber(), (short) 1));
							model.setCapacity(vehicle.getVehicleTypeCapacity());
						} else
							model.setVehicleNumber("--");

						if (dispatchChargeMap != null && !dispatchChargeMap.isEmpty()) {
							model.setChargeHM(dispatchChargeMap.values().stream().collect(Collectors.toMap(CrossingAgentBillingCharges::getChargeId, CrossingAgentBillingCharges::getChargeAmount, (e1, e2) -> e1)));
							model.setTopayChargeHM(dispatchChargeMap.values().stream().collect(Collectors.toMap(CrossingAgentBillingCharges::getChargeId, CrossingAgentBillingCharges::getToPayChargeAmount, (e1, e2) -> e1)));
							model.setPaidChargeHM(dispatchChargeMap.values().stream().collect(Collectors.toMap(CrossingAgentBillingCharges::getChargeId, CrossingAgentBillingCharges::getPaidChargeAmount, (e1, e2) -> e1)));
							model.setTbbChargeHM(dispatchChargeMap.values().stream().collect(Collectors.toMap(CrossingAgentBillingCharges::getChargeId, CrossingAgentBillingCharges::getTbbChargeAmount, (e1, e2) -> e1)));
						}

						crossingAgentBillPrintHM.put(model.getTripDateTimeStr() + "_" + model.getDispatchLedgerId(), model);
					}

					if(crossingAgentBillPrintHM != null && crossingAgentBillPrintHM.size() > 0) {
						final List<CrossingAgentBillPrintModel>	modelList = new ArrayList<>(crossingAgentBillPrintHM.values());
						modelArr = new CrossingAgentBillPrintModel[modelList.size()];
						modelList.toArray(modelArr);
					}

					request.setAttribute("CrossingAgentBillDetailsForPrintingBill", modelArr);
					request.setAttribute("loggedInBranch", cache.getGenericBranchDetailCache(request, executive.getBranchId()));
					request.setAttribute("accountGroup", accountGroup);
				}

				if(lrWiseCrossingAgentBillSummary != null && !lrWiseCrossingAgentBillSummary.isEmpty()) {
					final var dispatchIdsStr = lrWiseCrossingAgentBillSummary.stream().map(e -> Long.toString(e.getDispatchLedgerId())).collect(Collectors.joining(","));
					final Map<Long, DispatchLedger>	lsColl				  = DispatchLedgerDao.getInstance().getDispatchLedgerDetailsByLSIds(dispatchIdsStr);

					for (final LRWiseCrossingAgentBillSummary element : lrWiseCrossingAgentBillSummary) {
						final var model = new CrossingAgentBillPrintModel();

						if(lsColl != null) {
							final var	dispatchLedger	= lsColl.get(element.getDispatchLedgerId());

							if(dispatchLedger != null) {
								model.setTripDateTime(dispatchLedger.getTripDateTime());
								model.setTripDateTimeStr(DateTimeUtility.getDateFromTimeStamp(model.getTripDateTime(), DateTimeFormatConstant.YYYY_MM_DD));
								model.setLsNumber(dispatchLedger.getLsNumber());
								model.setSourceBranchId(dispatchLedger.getSourceBranchId());
								model.setDestinationBranchId(dispatchLedger.getDestinationBranchId());
								model.setSourceBranch(cache.getBranchById(request, executive.getAccountGroupId(), dispatchLedger.getSourceBranchId()).getName());
								model.setDestinationBranch(cache.getBranchById(request, executive.getAccountGroupId(), dispatchLedger.getDestinationBranchId()).getName());
								final var vehicle = vehicleNumberHM.get(dispatchLedger.getVehicleNumberMasterId());

								if(vehicle != null)
									model.setVehicleNumber(Utility.checkedNullCondition(vehicle.getVehicleNumber(), (short) 1));
								else
									model.setVehicleNumber("--");
							}
						}

						model.setWayBillSourceBranchId(element.getWayBillSourceBranchId());
						model.setWayBillDestinationBranchId(element.getWayBillDestinationBranchId());
						model.setWayBillSourceBranch(cache.getBranchById(request, executive.getAccountGroupId(), model.getWayBillSourceBranchId()).getName());
						model.setWayBillDestinationBranch(cache.getBranchById(request, executive.getAccountGroupId(), model.getWayBillDestinationBranchId()).getName());
						model.setCrossingAgentBillId(element.getCrossingAgentBillId());
						model.setBillNumber(element.getBillNumber());
						model.setDispatchLedgerId(element.getDispatchLedgerId());
						model.setPaidAmount(element.getPaidAmount());
						model.setTopayAmount(element.getTopayAmount());
						model.setCrossingHire(element.getCrossingHire());
						model.setNetAmount(allowRoundOffAmount ? Math.round(element.getNetAmount()) : element.getNetAmount());
						model.setDoorDelivery(element.getDoorDelivery());
						model.setWayBillActualWeight(element.getActualWeight());
						model.setWayBillChargeWeight(element.getChargeWeight());
						model.setWayBillQuantity(element.getQuantity());
						model.setWayBillId(element.getWayBillId());
						model.setWayBillNumber(element.getWayBillNumber());
						model.setConsignorName(element.getConsignorName());
						model.setConsigneeName(element.getConsigneeName());
						model.setSaidToContain(element.getSaidToContain());
						model.setWayBillType(WayBillTypeConstant.getWayBillTypeNameByWayBilTypeId(element.getWayBillTypeId()));
						crossingAgentBillPrintHM.put(model.getWayBillId() + "_" + model.getWayBillNumber(), model);
					}

					if(crossingAgentBillPrintHM != null && crossingAgentBillPrintHM.size() > 0) {
						final List<CrossingAgentBillPrintModel>	modelList = new ArrayList<>(crossingAgentBillPrintHM.values());
						modelArr = new CrossingAgentBillPrintModel[modelList.size()];
						modelList.toArray(modelArr);
					}

					request.setAttribute("CrossingAgentBillDetailsForPrintingBill", modelArr);
					request.setAttribute("loggedInBranch", cache.getGenericBranchDetailCache(request, executive.getBranchId()));
					request.setAttribute("accountGroup", accountGroup);
				}

				var	reportViewModel = new ReportViewModel();
				reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);
				request.setAttribute("ReportViewModel",reportViewModel);
				request.setAttribute("isCrossingHireInfoShow", (boolean) configuration.getOrDefault(CrossingAgentBillPropertiesConstant.IS_CROSSING_HIRE_INFO_SHOW, false));
				request.setAttribute("isDoorDeliveryChargeShow", configuration.getOrDefault(CrossingAgentBillPropertiesConstant.IS_DOOR_DELIVERY_CHARGE_SHOW, false));
				request.setAttribute("isHamaliChargeShow", configuration.getOrDefault(CrossingAgentBillPropertiesConstant.IS_HAMALI_CHARGE_SHOW, false));
			} else {
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}

			request.setAttribute("nextPageToken", "success_" + executive.getAccountGroupId());
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}
}