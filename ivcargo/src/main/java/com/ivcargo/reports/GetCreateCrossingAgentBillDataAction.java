package com.ivcargo.reports;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.SortedMap;
import java.util.TreeMap;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.ObjectUtils;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.constant.properties.ConfigParamPropertiesConstant;
import com.iv.dto.constant.FeildPermissionsConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.properties.constant.CrossingAgentBillPropertiesConstant;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.constant.Constant;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.exception.ExceptionProcess;
import com.iv.utils.utility.CollectionUtility;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.CrossingAgentBillSequenceCounterDao;
import com.platform.dao.DispatchLedgerDao;
import com.platform.dao.WayBillBookingChargesDao;
import com.platform.dao.WayBillCrossingDao;
import com.platform.dao.WayBillDao;
import com.platform.dao.reports.CrossingAgentBillPaymentDAO;
import com.platform.dto.ConfigParam;
import com.platform.dto.CrossingAgentBill;
import com.platform.dto.CrossingAgentBillSequenceCounter;
import com.platform.dto.DispatchLedger;
import com.platform.dto.Executive;
import com.platform.dto.ExecutiveFeildPermissionDTO;
import com.platform.dto.WayBill;
import com.platform.dto.WayBillCrossing;
import com.platform.dto.configuration.mindateselection.ModuleWiseMinDateSelectionConfigurationDTO;
import com.platform.dto.constant.BookingChargeConstant;
import com.platform.dto.constant.WayBillTypeConstant;
import com.platform.dto.model.ChargeTypeModel;
import com.platform.dto.model.ReportViewModel;
import com.platform.resource.CargoErrorList;

public class GetCreateCrossingAgentBillDataAction implements Action {
	private static final String TRACE_ID = GetCreateCrossingAgentBillDataAction.class.getName();

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	 				error 												= null;
		HashMap<Long , Double>					dlIdWiseblhpvAmount									= null;
		SortedMap<String, WayBillCrossing> 		wbCrossingColl										= null;
		var										totalNetLoading										= 0.00;
		var										totalNetUnLoading									= 0.00;
		var										totalCrossingHire									= 0.00;
		var										totalPaid											= 0.00;
		var										totalToPay											= 0.00;
		var										grandTotal											= 0.00;
		var										localTempoBhada										= 0.00;
		var										doorDelivery										= 0.00;
		final var								noOfDays	  										= 0;
		var 									blhpvAmount 										= 0D;
		var										totalTBB											= 0.00;
		Timestamp        						fromDate       										= null;
		Timestamp        						toDate         										= null;
		var										hamali												= 0.00;
		var 									halfPaidAmt											= 0.00;
		var 									halfTBBAmt											= 0.00;
		var                                     bookingTotal										= 0.00;
		var 		                            totalFreightAmount                                  =0.00 ;
		var 		                            totalPaidChargeAmount                        		= 0.00;
		var 		                            totalTopayChargeAmount                              = 0.00;
		var 		                            totalTbbChargeAmount                                = 0.00;
		final Map<Long, Map<Long, Double>> 		dispatchLedgerIdsWiseChargesAmountHM 				= new HashMap<>();
		ChargeTypeModel[] 						bookingCharges 										= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeCreateCrossingAgentBillAction().execute(request, response);
			final var	cache 		= new CacheManip(request);

			final var	executive = cache.getExecutive(request);

			final Map<Long, ExecutiveFeildPermissionDTO>	execFldPermissionsHM 	= cache.getExecutiveFieldPermission(request);

			final var configuration	= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.CROSSING_AGENT_BILL);

			final var crossingAgentId = JSPUtility.GetLong(request, "CrossingAgentId", 0);

			var	txnTypeId 		 	 = JSPUtility.GetShort(request, "txnType", (short)0);

			final var	configParamConfiguration		= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.CONFIG_PARAM);
			final var	minDateTimeStamp	= cache.getModuleWiseMinDateToGetData(request, executive.getAccountGroupId(),
					ModuleWiseMinDateSelectionConfigurationDTO.CROSSING_AGENT_INVOICE_MIN_DATE_ALLOW,
					ModuleWiseMinDateSelectionConfigurationDTO.CROSSING_AGENT_INVOICE_MIN_DATE);

			final var	previousDate	= DateTimeUtility.getDateBeforeNoOfDays((int) configParamConfiguration.getOrDefault(ConfigParamPropertiesConstant.DAYS_FOR_MANUAL_CROSSING_INVOICE, 0));

			if(!(boolean) configuration.getOrDefault(CrossingAgentBillPropertiesConstant.IS_SHOW_CROSSING_AGENT_TYPE,false))
				txnTypeId = CrossingAgentBill.CROSSINGAGENTBILL_DELIVERY_ID;

			final var	isShowBLHPVAmount								= (boolean) configuration.getOrDefault(CrossingAgentBillPropertiesConstant.IS_SHOW_BLHPV_AMOUNT, false);
			var			isLrWiseCrossingAgentBill						= (boolean) configuration.getOrDefault(CrossingAgentBillPropertiesConstant.IS_LR_WISE_CROSSING_AGENT_BILL, false);
			var			showSelectDateOption                            = (boolean) configuration.getOrDefault(CrossingAgentBillPropertiesConstant.SHOW_SELECT_DATE_OPTION, false);
			final var	lrWiseCrossingAgentBillOnlyForBkg				= (boolean) configuration.getOrDefault(CrossingAgentBillPropertiesConstant.LR_WISE_CROSSING_AGENT_BILL_ONLY_FOR_BKG, false);
			final var	lrWiseCrossingAgentBillOnlyForDly				= (boolean) configuration.getOrDefault(CrossingAgentBillPropertiesConstant.LR_WISE_CROSSING_AGENT_BILL_ONLY_FOR_DLY, false);
			final var	lsWiseCrossingAgentBillOnlyForBkg				= (boolean) configuration.getOrDefault(CrossingAgentBillPropertiesConstant.LS_WISE_CROSSING_AGENT_BILL_ONLY_FOR_BKG, false);
			final var	lsWiseCrossingAgentBillOnlyForDly				= (boolean) configuration.getOrDefault(CrossingAgentBillPropertiesConstant.LS_WISE_CROSSING_AGENT_BILL_ONLY_FOR_DLY, false);
			var			isAllowManualInvoiceBackDate					= (boolean)	configuration.getOrDefault(CrossingAgentBillPropertiesConstant.IS_ALLOW_MANUAL_INVOICE_BACK_DATE, false);
			final var	showBookingCharges								= (boolean)	configuration.getOrDefault(CrossingAgentBillPropertiesConstant.SHOW_BOOKING_CHARGES, false);
			final var 	bookingChargeIdsList 							= CollectionUtility.getLongListFromString( (String) configuration.getOrDefault(CrossingAgentBillPropertiesConstant.BOOKING_CHARGE_IDS_TO_SHOW, "0"));
			final var   activeCharges 									= cache.getActiveBookingCharges(request, executive.getBranchId());

			if(request.getParameter("searchByDate") != null)
				showSelectDateOption = true;
			else
				showSelectDateOption = false;

			final var	sdf					= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");

			if(JSPUtility.GetString(request, "fromDate", null) != null && showSelectDateOption)
				fromDate			= new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00").getTime());

			if(JSPUtility.GetString(request, "toDate", null) != null && showSelectDateOption)
				toDate				= new Timestamp(sdf.parse(JSPUtility.GetString(request, "toDate") + " 23:59:59").getTime());

			if(crossingAgentId != 0) {
				final var	branchIds					= cache.getBranchIdsByExecutiveType(request, executive);

				if (isLrWiseCrossingAgentBill) {
					if (txnTypeId == CrossingAgentBill.CROSSINGAGENTBILL_DELIVERY_ID && lsWiseCrossingAgentBillOnlyForDly || txnTypeId == CrossingAgentBill.CROSSINGAGENTBILL_BOOKING_ID && lsWiseCrossingAgentBillOnlyForBkg)
						isLrWiseCrossingAgentBill = false;
				} else if (txnTypeId == CrossingAgentBill.CROSSINGAGENTBILL_DELIVERY_ID && lrWiseCrossingAgentBillOnlyForDly || txnTypeId == CrossingAgentBill.CROSSINGAGENTBILL_BOOKING_ID && lrWiseCrossingAgentBillOnlyForBkg)
					isLrWiseCrossingAgentBill = true;

				if(!isLrWiseCrossingAgentBill) { //lswise
					if(txnTypeId == CrossingAgentBill.CROSSINGAGENTBILL_DELIVERY_ID) {
						List<WayBillCrossing>	waBillCrossings = null;

						if(showSelectDateOption)
							waBillCrossings = CrossingAgentBillPaymentDAO.getInstance().getWayBillCrossingDetailsForBill(crossingAgentId, branchIds,fromDate,toDate);
						else if(minDateTimeStamp != null)
							waBillCrossings = CrossingAgentBillPaymentDAO.getInstance().getWayBillCrossingDetailsForBillFromMinDate(crossingAgentId, branchIds, minDateTimeStamp);
						else
							waBillCrossings = CrossingAgentBillPaymentDAO.getInstance().getWayBillCrossingDetailsForBill(crossingAgentId, branchIds);

						if(waBillCrossings != null && !waBillCrossings.isEmpty()) {
							final var	wbcColl 	    = waBillCrossings.stream().collect(Collectors.groupingBy(WayBillCrossing::getDispatchLedgerId));
							final var	dispatchIds		= wbcColl.keySet().stream().map(e -> Long.toString(e)).collect(Collectors.joining(Constant.COMMA));
							final var	wayBillIdArray	= waBillCrossings.stream().map(WayBillCrossing::getWayBillId).collect(Collectors.toSet());

							final var	waybillIds		= CollectionUtility.getStringFromLongSet(wayBillIdArray);
							final var	lsColl 			= DispatchLedgerDao.getInstance().getDispatchLedgerDetailsByLSIds(dispatchIds);
							final var	waybillHM		= WayBillDao.getInstance().getLimitedLRDetails(waybillIds);
							final var	wayBillBookingchargesHM = WayBillBookingChargesDao.getInstance().getWayBillIdWiseChargesMap(waybillIds);

							if(showBookingCharges)
								bookingCharges = Arrays.stream(activeCharges).filter(charge -> bookingChargeIdsList.contains(charge.getChargeTypeMasterId())).toArray(ChargeTypeModel[]::new);

							wbCrossingColl	= new TreeMap<>();

							if(wbcColl != null && wbcColl.size() > 0)
								for(final long key : wbcColl.keySet()){
									final var	wbcArrList 			= wbcColl.get(key);
									final var	dispatchLedger		= lsColl.get(key);
									totalNetLoading		= 0.00;
									totalNetUnLoading   = 0.00;
									totalCrossingHire   = 0.00;
									totalPaid			= 0.00;
									totalToPay			= 0.00;
									localTempoBhada		= 0.00;
									doorDelivery		= 0.00;
									totalTBB			= 0.00;
									hamali				= 0.00;
									halfPaidAmt 		= 0.00;
									halfTBBAmt			= 0.00;
									bookingTotal		= 0.00;
									totalFreightAmount  = 0.00;

									for (final WayBillCrossing element : wbcArrList) {
										final var	waybill 		= waybillHM.get(element.getWayBillId());
										final var	chargeWiseHM	= wayBillBookingchargesHM.get(element.getWayBillId());

										if(waybill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID) {
											totalPaid += waybill.getBookingTotal();
											halfPaidAmt +=waybill.getBookingTotal()/2;
										} else if(waybill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY)
											totalToPay += waybill.getBookingTotal();
										else if(waybill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT) {
											totalTBB   += waybill.getBookingTotal();
											halfTBBAmt += waybill.getBookingTotal()/2;
										}

										bookingTotal        += totalPaid + totalToPay + totalTBB;

										if (showBookingCharges && chargeWiseHM != null && !chargeWiseHM.isEmpty() && dispatchLedger != null) {
											final var dispatchId = dispatchLedger.getDispatchLedgerId();

											final var dispatchIdWiseChargeMap = dispatchLedgerIdsWiseChargesAmountHM
													.computeIfAbsent(dispatchId, k -> new HashMap<>());

											for (final Long chargeId : chargeWiseHM.keySet())
												if (bookingChargeIdsList.contains(chargeId)) {
													final var chargeAmount = chargeWiseHM.get(chargeId).getChargeAmount();

													if(chargeId == BookingChargeConstant.FREIGHT)
														totalFreightAmount += chargeWiseHM.get(chargeId).getChargeAmount();

													dispatchIdWiseChargeMap.merge(chargeId, chargeAmount, Double::sum);

													if(waybill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID)
														totalPaidChargeAmount += chargeAmount;
													else if(waybill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY)
														totalTopayChargeAmount += chargeAmount;
													else if(waybill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT)
														totalTbbChargeAmount += chargeAmount;
												}
										}

										totalNetLoading		+= element.getNetLoading();
										totalNetUnLoading	+= element.getNetUnloading();
										totalCrossingHire	+= element.getCrossingHire();
										localTempoBhada		+= element.getLocalTempoBhada();
										doorDelivery		+= element.getDoorDelivery();
										hamali				+= element.getHamali();
									}

									if(dispatchLedger != null) {
										var	wayBillCrossing	= wbCrossingColl.get(dispatchLedger.getLsNumber() + "_" + key);

										if(wayBillCrossing == null) {
											final var	crossingValueObject = new ValueObject();

											crossingValueObject.put("dispatchLedger", dispatchLedger);
											crossingValueObject.put("executive", executive);
											crossingValueObject.put("crossingAgentId", crossingAgentId);
											crossingValueObject.put("totalNetLoading", totalNetLoading);
											crossingValueObject.put("totalNetUnLoading", crossingAgentId);
											crossingValueObject.put("totalCrossingHire", totalCrossingHire);
											crossingValueObject.put("totalToPay", totalToPay);
											crossingValueObject.put("totalPaid", totalPaid);
											crossingValueObject.put("localTempoBhada", localTempoBhada);
											crossingValueObject.put("doorDelivery", doorDelivery);
											crossingValueObject.put("totalTBB", totalTBB);
											crossingValueObject.put("fromDate", fromDate);
											crossingValueObject.put("toDate", toDate);
											crossingValueObject.put("hamali", hamali);
											crossingValueObject.put("halfPaidAmt", halfPaidAmt);
											crossingValueObject.put("halfTBBAmt", halfTBBAmt);
											crossingValueObject.put("bookingTotal", bookingTotal);

											crossingValueObject.put("totalFreightAmount", totalFreightAmount);
											crossingValueObject.put("totalAmount", totalToPay+totalTBB+totalPaid);

											wayBillCrossing = getDispatchWiseWayBillCrossing(crossingValueObject, cache, request);

											wbCrossingColl.put(wayBillCrossing.getLsNumber() + "_" + key, wayBillCrossing);
										}
									}
								}
						}
					} else if(txnTypeId == CrossingAgentBill.CROSSINGAGENTBILL_BOOKING_ID) {
						List<WayBillCrossing>	waBillCrossings = null;

						if(showSelectDateOption)
							waBillCrossings = WayBillCrossingDao.getInstance().getWayBillDetailsForGeneratingBillFromMinAndMaxDate(crossingAgentId, branchIds,fromDate,toDate);
						else if(minDateTimeStamp != null)
							waBillCrossings  = WayBillCrossingDao.getInstance().getWayBillDetailsForGeneratingBillFromMinDate(crossingAgentId, branchIds, minDateTimeStamp);
						else
							waBillCrossings  = WayBillCrossingDao.getInstance().getWayBillDetailsForGeneratingBill(crossingAgentId, branchIds);

						if(waBillCrossings != null && !waBillCrossings.isEmpty()) {
							final var	wbcColl 	    = waBillCrossings.stream().collect(Collectors.groupingBy(WayBillCrossing::getDispatchLedgerId));
							final var	dispatchIds		= wbcColl.keySet().stream().map(e -> Long.toString(e)).collect(Collectors.joining(Constant.COMMA));
							final var	wayBillIdArray	= waBillCrossings.stream().map(WayBillCrossing::getWayBillId).collect(Collectors.toSet());

							final var	waybillIds		= CollectionUtility.getStringFromLongSet(wayBillIdArray);
							final var	lsColl 			= DispatchLedgerDao.getInstance().getDispatchLedgerDetailsByLSIds(dispatchIds);
							final var	waybillHM		= WayBillDao.getInstance().getLimitedLRDetails(waybillIds);
							final var	wayBillBookingchargesHM = WayBillBookingChargesDao.getInstance().getWayBillIdWiseChargesMap(waybillIds);
							wbCrossingColl	= new TreeMap<>();

							if(showBookingCharges)
								bookingCharges = Arrays.stream(activeCharges).filter(charge -> bookingChargeIdsList.contains(charge.getChargeTypeMasterId())).toArray(ChargeTypeModel[]::new);

							if (isShowBLHPVAmount) {
								final var	blhpvAmountDetails	= DispatchLedgerDao.getInstance().getBlhpvAmountByDispatchLedgerIds(dispatchIds);

								if(blhpvAmountDetails != null && !blhpvAmountDetails.isEmpty()) {
									dlIdWiseblhpvAmount = new HashMap<>();

									for(final DispatchLedger blhpv : blhpvAmountDetails)
										if(dlIdWiseblhpvAmount.get(blhpv.getDispatchLedgerId()) == null)
											dlIdWiseblhpvAmount.put(blhpv.getDispatchLedgerId(), blhpv.getBalanceAmount());
								}
							}

							for(final Map.Entry<Long, List<WayBillCrossing>> entry : wbcColl.entrySet()) {
								final var	wbcArrList 			= entry.getValue();
								final var	dispatchLedger		= lsColl.get(entry.getKey());
								totalCrossingHire   = 0.00;
								totalPaid			= 0.00;
								totalToPay			= 0.00;
								grandTotal			= 0.00;
								blhpvAmount			= 0.00;
								totalTBB			= 0.00;
								doorDelivery		= 0.00;
								hamali				= 0.00;
								halfPaidAmt 		= 0.00;
								halfTBBAmt			= 0.00;
								bookingTotal		= 0.00;
								totalFreightAmount  = 0.00;

								for (final WayBillCrossing element : wbcArrList) {
									final var	waybill = waybillHM.get(element.getWayBillId());
									final var	chargeWiseHM	= wayBillBookingchargesHM.get(element.getWayBillId());

									if(waybill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID) {
										totalPaid += waybill.getBookingTotal();
										halfPaidAmt  += waybill.getBookingTotal()/2;
									} else if(waybill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY)
										totalToPay += waybill.getBookingTotal();
									else if(waybill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT) {
										totalTBB += waybill.getBookingTotal();
										halfTBBAmt   += waybill.getBookingTotal()/2;
									}

									bookingTotal        += totalPaid + totalToPay + totalTBB;

									if (showBookingCharges && chargeWiseHM != null && !chargeWiseHM.isEmpty() && dispatchLedger != null) {
										final var dispatchId = dispatchLedger.getDispatchLedgerId();

										final var dispatchIdWiseChargeMap = dispatchLedgerIdsWiseChargesAmountHM
												.computeIfAbsent(dispatchId, k -> new HashMap<>());

										for (final Long chargeId : chargeWiseHM.keySet())
											if (bookingChargeIdsList.contains(chargeId)) {
												final var chargeAmount = chargeWiseHM.get(chargeId).getChargeAmount();

												if(chargeId == BookingChargeConstant.FREIGHT)
													totalFreightAmount += chargeWiseHM.get(chargeId).getChargeAmount();

												dispatchIdWiseChargeMap.merge(chargeId, chargeAmount, Double::sum);

												if(waybill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID)
													totalPaidChargeAmount += chargeAmount;
												else if(waybill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY)
													totalTopayChargeAmount += chargeAmount;
												else if(waybill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT)
													totalTbbChargeAmount += chargeAmount;
											}
									}

									grandTotal 			+= waybill.getBookingTotal();
									totalCrossingHire 	+= element.getCrossingHire();
									doorDelivery 		+= element.getDoorDelivery();
									hamali 				+= element.getHamali();
								}

								var	wayBillCrossing	= wbCrossingColl.get(dispatchLedger.getLsNumber() + "_" + entry.getKey());

								if(wayBillCrossing == null) {
									if(dlIdWiseblhpvAmount != null && dlIdWiseblhpvAmount.get(dispatchLedger.getDispatchLedgerId()) != null)
										blhpvAmount = dlIdWiseblhpvAmount.get(dispatchLedger.getDispatchLedgerId());

									final var	crossingValueObject = new ValueObject();

									crossingValueObject.put("dispatchLedger", dispatchLedger);
									crossingValueObject.put("executive", executive);
									crossingValueObject.put("crossingAgentId", crossingAgentId);
									crossingValueObject.put("totalNetLoading", totalNetLoading);
									crossingValueObject.put("totalNetUnLoading", crossingAgentId);
									crossingValueObject.put("totalCrossingHire", totalCrossingHire);
									crossingValueObject.put("totalToPay", totalToPay);
									crossingValueObject.put("totalPaid", totalPaid);
									crossingValueObject.put("localTempoBhada", localTempoBhada);
									crossingValueObject.put("doorDelivery", doorDelivery);
									crossingValueObject.put("totalTBB", totalTBB);
									crossingValueObject.put("grandTotal", grandTotal);
									crossingValueObject.put("blhpvAmount", blhpvAmount);
									crossingValueObject.put("fromDate", fromDate);
									crossingValueObject.put("toDate", toDate);
									crossingValueObject.put("hamali", hamali);
									crossingValueObject.put("halfPaidAmt", halfPaidAmt);
									crossingValueObject.put("halfTBBAmt", halfTBBAmt);
									crossingValueObject.put("bookingTotal", bookingTotal);
									crossingValueObject.put("totalFreightAmount", totalFreightAmount);
									crossingValueObject.put("totalAmount", totalToPay+totalTBB+totalPaid);

									wayBillCrossing = getDispatchWiseWayBillCrossing(crossingValueObject, cache, request);

									wbCrossingColl.put(wayBillCrossing.getLsNumber() + "_" + entry.getKey(), wayBillCrossing);
								}
							}
						}
					}
				} else if(showSelectDateOption ) { // lrwise
					final var	wayBillCrossingList = CrossingAgentBillPaymentDAO.getInstance().getWayBillCrossingDetailsForLRWiseBill(crossingAgentId, branchIds,txnTypeId, minDateTimeStamp, fromDate, toDate);

					if(ObjectUtils.isNotEmpty(wayBillCrossingList)) {
						final var	wayBillIdArray	= wayBillCrossingList.stream().map(WayBillCrossing::getWayBillId).collect(Collectors.toSet());

						final var	waybillIds		= CollectionUtility.getStringFromLongSet(wayBillIdArray);
						final var	waybillHM		= WayBillDao.getInstance().getLimitedLRDetails(waybillIds);
						wbCrossingColl	= new TreeMap<>();

						if(wayBillCrossingList != null && !wayBillCrossingList.isEmpty())
							for (final WayBillCrossing element : wayBillCrossingList) {
								totalNetLoading										= 0.00;
								totalNetUnLoading									= 0.00;
								totalCrossingHire									= 0.00;
								totalPaid											= 0.00;
								totalToPay											= 0.00;
								localTempoBhada										= 0.00;
								doorDelivery										= 0.00;
								totalTBB											= 0.00;
								hamali												= 0.00;
								halfPaidAmt 										=0.00;
								halfTBBAmt											=0.00;
								bookingTotal										= 0.00;

								final var	waybill = waybillHM.get(element.getWayBillId());

								if(waybill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID) {
									totalPaid 	+= waybill.getBookingTotal();
									halfPaidAmt += waybill.getBookingTotal() / 2;
								} else if(waybill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY)
									totalToPay += waybill.getBookingTotal();
								else if(waybill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT) {
									totalTBB   += waybill.getBookingTotal();
									halfTBBAmt += waybill.getBookingTotal() / 2;
								}

								bookingTotal        += totalPaid + totalToPay + totalTBB;

								totalNetLoading		+= element.getNetLoading();
								totalNetUnLoading	+= element.getNetUnloading();
								totalCrossingHire	+= element.getCrossingHire();
								localTempoBhada		+= element.getLocalTempoBhada();
								doorDelivery		+= element.getDoorDelivery();
								hamali				+= element.getHamali();
								var	wayBillCrossing		= wbCrossingColl.get(waybill.getWayBillId() + "_" + waybill.geteWayBillNumber());

								if(wayBillCrossing == null) {
									final var	crossingValueObject = new ValueObject();

									crossingValueObject.put("executive", executive);
									crossingValueObject.put("crossingAgentId", crossingAgentId);
									crossingValueObject.put("totalNetLoading", totalNetLoading);
									crossingValueObject.put("totalNetUnLoading", totalNetUnLoading);
									crossingValueObject.put("totalCrossingHire", totalCrossingHire);
									crossingValueObject.put("totalToPay", totalToPay);
									crossingValueObject.put("totalPaid", totalPaid);
									crossingValueObject.put("localTempoBhada", localTempoBhada);
									crossingValueObject.put("doorDelivery", doorDelivery);
									crossingValueObject.put("totalTBB", totalTBB);
									crossingValueObject.put("waybill", waybill);
									crossingValueObject.put("waybillCrossing", element);
									crossingValueObject.put("fromDate", fromDate);
									crossingValueObject.put("toDate", toDate);
									crossingValueObject.put("hamali", hamali);
									crossingValueObject.put("halfTBBAmt", halfTBBAmt);
									crossingValueObject.put("halfPaidAmt", halfPaidAmt);
									crossingValueObject.put("bookingTotal", bookingTotal);

									wayBillCrossing = getLRWiseWayBillCrossing(crossingValueObject, cache, request);

									wbCrossingColl.put(waybill.getWayBillId() + "_" + waybill.getWayBillNumber(), wayBillCrossing);
								} else {
									wayBillCrossing.setNetLoading(wayBillCrossing.getNetLoading() + totalNetLoading);
									wayBillCrossing.setNetUnloading(wayBillCrossing.getNetUnloading() + totalNetUnLoading);
									wayBillCrossing.setCrossingHire(wayBillCrossing.getCrossingHire() + totalCrossingHire);
									wayBillCrossing.setLocalTempoBhada(wayBillCrossing.getLocalTempoBhada() + localTempoBhada);
									wayBillCrossing.setDoorDelivery(wayBillCrossing.getDoorDelivery() + doorDelivery);
									wayBillCrossing.setHamali(wayBillCrossing.getHamali() + hamali);
								}
							}
					}
				} else {
					final var	wayBillCrossingList = CrossingAgentBillPaymentDAO.getInstance().getWayBillCrossingDetailsForLRWiseBill(crossingAgentId, branchIds,txnTypeId, minDateTimeStamp);

					if(ObjectUtils.isNotEmpty(wayBillCrossingList)) {
						final var	wayBillIdArray	= wayBillCrossingList.stream().map(WayBillCrossing::getWayBillId).collect(Collectors.toSet());

						final var	waybillIds		= CollectionUtility.getStringFromLongSet(wayBillIdArray);
						final var	waybillHM		= WayBillDao.getInstance().getLimitedLRDetails(waybillIds);
						wbCrossingColl	= new TreeMap<>();

						if(wayBillCrossingList != null && !wayBillCrossingList.isEmpty())
							for (final WayBillCrossing element : wayBillCrossingList) {
								totalNetLoading										= 0.00;
								totalNetUnLoading									= 0.00;
								totalCrossingHire									= 0.00;
								totalPaid											= 0.00;
								totalToPay											= 0.00;
								localTempoBhada										= 0.00;
								doorDelivery										= 0.00;
								totalTBB											= 0.00;
								hamali												= 0.00;
								halfPaidAmt 										=0.00;
								halfTBBAmt											=0.00;
								bookingTotal										= 0.00;

								final var	waybill = waybillHM.get(element.getWayBillId());

								if(waybill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID) {
									totalPaid += waybill.getBookingTotal();
									halfPaidAmt += waybill.getBookingTotal() / 2;
								} else if(waybill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY)
									totalToPay += waybill.getBookingTotal();
								else if(waybill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT) {
									totalTBB   += waybill.getBookingTotal();
									halfTBBAmt += waybill.getBookingTotal() / 2;
								}

								bookingTotal        += totalPaid + totalToPay + totalTBB;

								totalNetLoading		+= element.getNetLoading();
								totalNetUnLoading	+= element.getNetUnloading();
								totalCrossingHire	+= element.getCrossingHire();
								localTempoBhada		+= element.getLocalTempoBhada();
								doorDelivery		+= element.getDoorDelivery();
								hamali				+= element.getHamali();

								var	wayBillCrossing		= wbCrossingColl.get(waybill.getWayBillId() + "_" + waybill.geteWayBillNumber());

								if(wayBillCrossing == null) {
									final var	crossingValueObject = new ValueObject();

									crossingValueObject.put("executive", executive);
									crossingValueObject.put("crossingAgentId", crossingAgentId);
									crossingValueObject.put("totalNetLoading", totalNetLoading);
									crossingValueObject.put("totalNetUnLoading", totalNetUnLoading);
									crossingValueObject.put("totalCrossingHire", totalCrossingHire);
									crossingValueObject.put("totalToPay", totalToPay);
									crossingValueObject.put("totalPaid", totalPaid);
									crossingValueObject.put("localTempoBhada", localTempoBhada);
									crossingValueObject.put("doorDelivery", doorDelivery);
									crossingValueObject.put("totalTBB", totalTBB);
									crossingValueObject.put("waybill", waybill);
									crossingValueObject.put("waybillCrossing", element);
									crossingValueObject.put("fromDate", fromDate);
									crossingValueObject.put("toDate", toDate);
									crossingValueObject.put("hamali", hamali);
									crossingValueObject.put("halfTBBAmt", halfTBBAmt);
									crossingValueObject.put("halfPaidAmt", halfPaidAmt);
									crossingValueObject.put("bookingTotal", bookingTotal);

									wayBillCrossing = getLRWiseWayBillCrossing(crossingValueObject, cache, request);

									wbCrossingColl.put(waybill.getWayBillId() + "_" + waybill.getWayBillNumber(), wayBillCrossing);
								}
							}
					}
				}

				if(wbCrossingColl != null && wbCrossingColl.size() > 0){
					final var	wbCrossingList = new ArrayList<>(wbCrossingColl.values());
					wbCrossingList.sort(Comparator.comparing(WayBillCrossing::getCreationDateTime));

					final var	wbCrossingMap = new LinkedHashMap<String, WayBillCrossing>();

					if(!isLrWiseCrossingAgentBill)
						wbCrossingList.forEach((final WayBillCrossing model) -> wbCrossingMap.put(model.getLsNumber() + "_" + model.getDispatchLedgerId(), model));
					else
						wbCrossingList.forEach((final WayBillCrossing model) -> wbCrossingMap.put(model.getWayBillNumber() + "_" + model.getWayBillId(), model));

					var	reportViewModel = new ReportViewModel();
					reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);

					request.setAttribute("ReportViewModel",reportViewModel);

					final var	crossingAgentBillSequenceCounter = CrossingAgentBillSequenceCounterDao.getInstance().getCrossingAgentBillSequenceCounterNextValue(executive.getAccountGroupId(), executive.getBranchId(), CrossingAgentBillSequenceCounter.CROSSINGAGENTBILL_SEQUENCE_MANUAL);

					request.setAttribute("wbCrossingColl", wbCrossingMap);
					request.setAttribute("crossingAgentBillSequenceCounter", crossingAgentBillSequenceCounter);
					request.setAttribute("isAllowWithoutSeqCounter", configuration.getOrDefault(CrossingAgentBillPropertiesConstant.ALLOW_WITHOUT_SEQUENCECOUNTER, false));
					request.setAttribute("BookingCrossingSettlementCalculationOnTopay", configuration.getOrDefault(CrossingAgentBillPropertiesConstant.BOOKING_CROSSING_SETTELMENT_CALCULATION_ON_TOPAY, false));
					request.setAttribute("isCrossingHireInfoShow", configuration.getOrDefault(CrossingAgentBillPropertiesConstant.IS_CROSSING_HIRE_INFO_SHOW, false));
					request.setAttribute("isDoorDeliveryChargeShow", configuration.getOrDefault(CrossingAgentBillPropertiesConstant.IS_DOOR_DELIVERY_CHARGE_SHOW, false));
					request.setAttribute("DeliveryCrossingSettlementCalculationOnTopay", configuration.getOrDefault(CrossingAgentBillPropertiesConstant.DELIVERY_CROSSING_SETTELMENT_CALCULATION_ON_TOPAY, false));
					request.setAttribute("dispatchLedgerIdsWiseChargesAmountHM", dispatchLedgerIdsWiseChargesAmountHM);
					request.setAttribute("bookingCharges", bookingCharges);
					request.setAttribute("totalPaidChargeAmount", totalPaidChargeAmount);
					request.setAttribute("totalTopayChargeAmount", totalTopayChargeAmount);
					request.setAttribute("totalTbbChargeAmount", totalTbbChargeAmount);

					if(!isAllowManualInvoiceBackDate && execFldPermissionsHM.getOrDefault(FeildPermissionsConstant.ALLOW_MANUAL_INVOICE_BACK_DATE,null) != null)
						isAllowManualInvoiceBackDate = true;

					request.setAttribute("isAllowManualInvoiceBackDate", isAllowManualInvoiceBackDate);
					request.setAttribute("ManualInvoiceDaysAllowed",(int)cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_MAX_DAYS_OF_OPERATION_BEFORE_CASHSTATEMENT_ENTRY_ID));
					request.setAttribute("showTBBAmountCol", configuration.getOrDefault(CrossingAgentBillPropertiesConstant.SHOW_TBB_AMOUNT_COL, false));
					request.setAttribute("showConsignorNameCol", configuration.getOrDefault(CrossingAgentBillPropertiesConstant.SHOW_CONSIGNOR_NAME_COL, false));
					request.setAttribute("showConsigneeNameCol", configuration.getOrDefault(CrossingAgentBillPropertiesConstant.SHOW_CONSIGNEE_NAME_COL, false));
					request.setAttribute("showInvoiceNoCol", configuration.getOrDefault(CrossingAgentBillPropertiesConstant.SHOW_INVOICE_NO_COL, false));
					request.setAttribute("showToPayAmountCol", configuration.getOrDefault(CrossingAgentBillPropertiesConstant.SHOW_TO_PAY_AMOUNT_COL, false));
					request.setAttribute("showPaidAmountCol", configuration.getOrDefault(CrossingAgentBillPropertiesConstant.SHOW_PAID_AMOUNT_COL, false));
					request.setAttribute("showSupplierBillNo", configuration.getOrDefault(CrossingAgentBillPropertiesConstant.SHOW_SUPPLIER_BILL_NO, false));
					request.setAttribute("showSupplierBillDate", configuration.getOrDefault(CrossingAgentBillPropertiesConstant.SHOW_SUPPLIER_BILL_DATE, false));
					request.setAttribute("showCrossingHireAndExtraAmount", configuration.getOrDefault(CrossingAgentBillPropertiesConstant.SHOW_CROSSING_HIRE_AND_EXTRA_AMOUNT, false));
					request.setAttribute("isHamaliChargeShow", configuration.getOrDefault(CrossingAgentBillPropertiesConstant.IS_HAMALI_CHARGE_SHOW, false));
					request.setAttribute("showVehicleNoCol", configuration.getOrDefault(CrossingAgentBillPropertiesConstant.SHOW_VEHICLE_NO_COL, false));
					request.setAttribute("showActualWeightCol", configuration.getOrDefault(CrossingAgentBillPropertiesConstant.SHOW_ACTUAL_WEIGHT_COL, false));
					request.setAttribute("showLocaltempoCol", configuration.getOrDefault(CrossingAgentBillPropertiesConstant.SHOW_LOCAL_TEMPO_COL, false));
					request.setAttribute("showCrossingHireCol", configuration.getOrDefault(CrossingAgentBillPropertiesConstant.SHOW_CROSSING_HIRE_COL, false));
					request.setAttribute("showNetAmountWithHalfPaidAndTBBAmount", configuration.getOrDefault(CrossingAgentBillPropertiesConstant.SHOW_NET_AMT_WITH_HALF_PAID_AND_TBB_AMT, false));
					request.setAttribute("showBookingTotalCol", configuration.getOrDefault(CrossingAgentBillPropertiesConstant.SHOW_BOOKING_TOTAL_COL, false));
					request.setAttribute("showToPayAmountColumn", configuration.getOrDefault(CrossingAgentBillPropertiesConstant.SHOW_TO_PAY_AMOUNT_COLUMN, true));
					request.setAttribute("showPaidAmountColumn", configuration.getOrDefault(CrossingAgentBillPropertiesConstant.SHOW_PAID_AMOUNT_COLUMN, true));
					request.setAttribute("showCommissionCol", configuration.getOrDefault(CrossingAgentBillPropertiesConstant.SHOW_COMMISSION_COL, false));
					request.setAttribute("showNetAmountCol", configuration.getOrDefault(CrossingAgentBillPropertiesConstant.SHOW_NET_AMOUNT_COL, true));
					request.setAttribute("showTotalAmountCol", configuration.getOrDefault(CrossingAgentBillPropertiesConstant.SHOW_TOTAL_AMOUNT_COL, false));
					request.setAttribute("showLrTypeWiseAmountSummaryTable", configuration.getOrDefault(CrossingAgentBillPropertiesConstant.SHOW_LR_TYPE_WISE_AMOUNT_SUMMARY_TABLE, false));
					request.setAttribute("showSrNumberCol", configuration.getOrDefault(CrossingAgentBillPropertiesConstant.SHOW_SR_NUMBER_COL, false));
					request.setAttribute("showCommissionButtonAndApplyOnFreight", configuration.getOrDefault(CrossingAgentBillPropertiesConstant.SHOW_COMMISSION_BUTTON_AND_APPLY_ON_FREIGHT, false));
					request.setAttribute("isAllowManualCrossingAgentInvoice", execFldPermissionsHM.get(FeildPermissionsConstant.ALLOW_MANUAL_CROSSING_AGENT_INVOICE) != null);
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

			request.setAttribute("noOfDays",noOfDays);
			request.setAttribute("previousDate", previousDate);

			if(!isLrWiseCrossingAgentBill)
				request.setAttribute("nextPageToken", "success");
			else
				request.setAttribute("nextPageToken", "success_lr");
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}

	private WayBillCrossing getDispatchWiseWayBillCrossing(final ValueObject valueObject, final CacheManip cache, final HttpServletRequest request) throws Exception {
		try {
			DispatchLedger		dispatchLedger	= null;
			dispatchLedger    = (DispatchLedger)valueObject.get("dispatchLedger");
			final var			executive		= (Executive)valueObject.get("executive");

			final var 	wayBillCrossing = new WayBillCrossing();

			wayBillCrossing.setActualWeight(dispatchLedger.getTotalActualWeight());
			wayBillCrossing.setDispatchLedgerId(dispatchLedger.getDispatchLedgerId());
			wayBillCrossing.setCrossingAgentId(valueObject.getLong("crossingAgentId",0));
			wayBillCrossing.setLsNumber(dispatchLedger.getLsNumber());
			wayBillCrossing.setNetLoading(valueObject.getDouble("totalNetLoading",0.00));
			wayBillCrossing.setNetUnloading(valueObject.getDouble("totalNetUnLoading",0.00));
			wayBillCrossing.setCrossingHire(valueObject.getDouble("totalCrossingHire",0.00));
			wayBillCrossing.setCreationDateTime(dispatchLedger.getTripDateTime());
			wayBillCrossing.setPackageQuantity(dispatchLedger.getTotalNoOfPackages());
			wayBillCrossing.setVehicleNumber(cache.getVehicleNumber(request, executive.getAccountGroupId(), dispatchLedger.getVehicleNumberMasterId()).getVehicleNumber());
			wayBillCrossing.setCrossingBranchId(dispatchLedger.getSourceBranchId());
			wayBillCrossing.setSourceBranchId(dispatchLedger.getSourceBranchId());
			wayBillCrossing.setDestinationBranchId(dispatchLedger.getDestinationBranchId());

			final var	srcBranch	= cache.getBranchById(request, executive.getAccountGroupId(), dispatchLedger.getSourceBranchId());
			final var	destBranch	= cache.getBranchById(request, executive.getAccountGroupId(), dispatchLedger.getDestinationBranchId());

			wayBillCrossing.setSourceBranch(srcBranch != null ? srcBranch.getName() : "");
			wayBillCrossing.setDestinationBranch(destBranch != null ? destBranch.getName() : "");
			wayBillCrossing.setTopayAmount(valueObject.getDouble("totalToPay",0.00));
			wayBillCrossing.setPaidAmount(valueObject.getDouble("totalPaid",0.00));
			wayBillCrossing.setLocalTempoBhada(valueObject.getDouble("localTempoBhada",0.00));
			wayBillCrossing.setDoorDelivery(valueObject.getDouble("doorDelivery",0.00));
			wayBillCrossing.setTbbAmount(valueObject.getDouble("totalTBB",0.00));
			wayBillCrossing.setBlhpvAmount(valueObject.getDouble("blhpvAmount",0.00));
			wayBillCrossing.setGrandTotal(valueObject.getDouble("grandTotal",0.00));
			wayBillCrossing.setFromDate(valueObject.getString("fromDate"));
			wayBillCrossing.setToDate(valueObject.getString("toDate"));
			wayBillCrossing.setHamali(valueObject.getDouble("hamali",0.00));
			wayBillCrossing.setHalfPaidAmt(valueObject.getDouble("halfPaidAmt",0.00));
			wayBillCrossing.setHalfTBBAmt(valueObject.getDouble("halfTBBAmt",0.00));
			wayBillCrossing.setBookingTotal(valueObject.getDouble("bookingTotal", 0.00));
			wayBillCrossing.setFreightAmount(valueObject.getDouble("totalFreightAmount",0.00));
			wayBillCrossing.setTotalAmount(valueObject.getDouble("totalAmount",0.00));

			if (dispatchLedger.getIsCommissionPercentage())
				wayBillCrossing.setCommission(wayBillCrossing.getFreightAmount() * dispatchLedger.getCommission() / 100);
			else
				wayBillCrossing.setCommission(dispatchLedger.getCommission());

			return wayBillCrossing;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}

	}

	private WayBillCrossing getLRWiseWayBillCrossing(final ValueObject	valueObject,final CacheManip	cache, final HttpServletRequest request) throws Exception {

		try {
			final var	executive		= (Executive) valueObject.get("executive");
			final var	waybill			= (WayBill) valueObject.get("waybill");
			final var	wbc				= (WayBillCrossing) valueObject.get("waybillCrossing");

			final var 	wayBillCrossing = new WayBillCrossing();

			wayBillCrossing.setActualWeight(wbc.getActualWeight());
			wayBillCrossing.setDispatchLedgerId(wbc.getDispatchLedgerId());
			wayBillCrossing.setCrossingAgentId(valueObject.getLong("crossingAgentId",0));
			wayBillCrossing.setLsNumber(wbc.getLsNumber());
			wayBillCrossing.setNetLoading(valueObject.getDouble("totalNetLoading",0.00));
			wayBillCrossing.setNetUnloading(valueObject.getDouble("totalNetUnLoading",0.00));
			wayBillCrossing.setCrossingHire(valueObject.getDouble("totalCrossingHire",0.00));
			wayBillCrossing.setCreationDateTime(wbc.getCreationDateTime());
			wayBillCrossing.setPackageQuantity(wbc.getPackageQuantity());
			wayBillCrossing.setVehicleNumber(cache.getVehicleNumber(request, executive.getAccountGroupId(), wbc.getVehicleNumberMasterId()).getVehicleNumber());
			wayBillCrossing.setCrossingBranchId(wbc.getCrossingBranchId());
			wayBillCrossing.setSourceBranchId(waybill.getSourceBranchId());
			wayBillCrossing.setDestinationBranchId(waybill.getDestinationBranchId());
			wayBillCrossing.setSourceBranch(cache.getBranchById(request, executive.getAccountGroupId(), wayBillCrossing.getSourceBranchId()).getName());
			wayBillCrossing.setDestinationBranch(cache.getBranchById(request, executive.getAccountGroupId(), wayBillCrossing.getDestinationBranchId()).getName());
			wayBillCrossing.setTopayAmount(valueObject.getDouble("totalToPay",0.00));
			wayBillCrossing.setPaidAmount(valueObject.getDouble("totalPaid",0.00));
			wayBillCrossing.setLocalTempoBhada(valueObject.getDouble("localTempoBhada",0.00));
			wayBillCrossing.setDoorDelivery(valueObject.getDouble("doorDelivery",0.00));
			wayBillCrossing.setTbbAmount(valueObject.getDouble("totalTBB",0.00));
			wayBillCrossing.setBlhpvAmount(valueObject.getDouble("blhpvAmount",0.00));
			wayBillCrossing.setGrandTotal(valueObject.getDouble("grandTotal",0.00));
			wayBillCrossing.setWayBillId(waybill.getWayBillId());
			wayBillCrossing.setWayBillNumber(waybill.getWayBillNumber());
			wayBillCrossing.setConsignorName(wbc.getConsignorName());
			wayBillCrossing.setConsigneeName(wbc.getConsigneeName());
			wayBillCrossing.setInvoiceNo(wbc.getInvoiceNo());
			wayBillCrossing.setFromDate(valueObject.getString("fromDate"));
			wayBillCrossing.setToDate(valueObject.getString("toDate"));
			wayBillCrossing.setHamali(valueObject.getDouble("hamali",0.00));
			wayBillCrossing.setHalfPaidAmt(valueObject.getDouble("halfPaidAmt",0.00));
			wayBillCrossing.setHalfTBBAmt(valueObject.getDouble("halfTBBAmt",0.00));
			wayBillCrossing.setBookingTotal(valueObject.getDouble("bookingTotal", 0.00));

			return wayBillCrossing;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}

	}
}