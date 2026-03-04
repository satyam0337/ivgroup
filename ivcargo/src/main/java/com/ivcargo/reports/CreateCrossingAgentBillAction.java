package com.ivcargo.reports;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.StringJoiner;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.ObjectUtils;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.bll.impl.crossingagentbill.CrossingAgentBillBllImpl;
import com.iv.bll.impl.sequencecounter.SequenceCounterBllImpl;
import com.iv.dao.impl.WayBillCrossingDaoImpl;
import com.iv.dto.WayBillCrossing;
import com.iv.dto.constant.BookingChargeConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.dto.crossingagentbill.CrossingAgentBillingCharges;
import com.iv.properties.constant.CrossingAgentBillPropertiesConstant;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.constant.AccountGroupConstant;
import com.iv.utils.constant.Constant;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.utility.CollectionUtility;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.CrossingAgentBillSequenceCounterDao;
import com.platform.dao.DispatchLedgerDao;
import com.platform.dao.DuplicateTransactionCheckDao;
import com.platform.dao.WayBillBookingChargesDao;
import com.platform.dao.WayBillDao;
import com.platform.dto.CrossingAgentBill;
import com.platform.dto.CrossingAgentBillSequenceCounter;
import com.platform.dto.DispatchLedger;
import com.platform.dto.WayBillBookingCharges;
import com.platform.dto.constant.CrossingChargeConstant;
import com.platform.dto.constant.WayBillTypeConstant;
import com.platform.resource.CargoErrorList;

public class CreateCrossingAgentBillAction implements Action {
	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {

		HashMap<String,Object>	 					error 												= null;
		Timestamp									manualInvoiceDate									= null;
		CrossingAgentBillSequenceCounter 			crossingAgentBillSequenceCounter					= null;
		String 										invoiceNumber 										= null;
		var 									isNumberExits										= false;
		var   										crossingAgentId	   									= 0L;
		var   										manualInvoiceNumber 								= 0L;
		Timestamp									fromDate											= null;
		Timestamp									toDate												= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	dispatchIdsStrArr	= request.getParameterValues("checkbox");
			var			txnTypeId 		 	= JSPUtility.GetShort(request, "txnId",(short)0);

			final var	createDate 			= DateTimeUtility.getCurrentTimeStamp();
			final var	str 			 	= new StringJoiner(",");
			final var	dispatchIdsArray 	= new Long[dispatchIdsStrArr.length];
			final var	cManip		  		= new CacheManip(request);
			final var	executive 			= cManip.getExecutive(request);

			/**
			 * Reading Property file for configuration
			 */
			final var	configuration		= cManip.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.CROSSING_AGENT_BILL);

			final var	sourceBranch 					= cManip.getBranchById(request, executive.getAccountGroupId(), executive.getBranchId());

			final var	isAllowWithoutSequneceCounter  						= (boolean) configuration.getOrDefault(CrossingAgentBillPropertiesConstant.ALLOW_WITHOUT_SEQUENCECOUNTER,false);
			final var	bookingCrossingSettlementCalculationOnTopay 		= (boolean) configuration.getOrDefault(CrossingAgentBillPropertiesConstant.BOOKING_CROSSING_SETTELMENT_CALCULATION_ON_TOPAY,false);
			final var	deliveryCrossingSettlementCalculationOnTopay 		= (boolean) configuration.getOrDefault(CrossingAgentBillPropertiesConstant.DELIVERY_CROSSING_SETTELMENT_CALCULATION_ON_TOPAY,false);
			final var	isShowBLHPVAmount									= (boolean) configuration.getOrDefault(CrossingAgentBillPropertiesConstant.IS_SHOW_BLHPV_AMOUNT,false);
			final var	showNetAmountWithHalfPaidAndTBBAmount				= (boolean)	configuration.getOrDefault(CrossingAgentBillPropertiesConstant.SHOW_NET_AMT_WITH_HALF_PAID_AND_TBB_AMT, false);
			final var	billNumberFormat									= (int) configuration.getOrDefault(CrossingAgentBillPropertiesConstant.SEQUENCE_NUMBER_FORMAT, 0);
			final var	prefixCode											= (String) configuration.getOrDefault(CrossingAgentBillPropertiesConstant.CODE_FOR_SEQUENCE_NUMBER_GENERATION, "");
			final var	showBookingCharges									= (boolean)	configuration.getOrDefault(CrossingAgentBillPropertiesConstant.SHOW_BOOKING_CHARGES, false);
			final var	showCommissionCol									= (boolean)	configuration.getOrDefault(CrossingAgentBillPropertiesConstant.SHOW_COMMISSION_COL, false);
			final var 	bookingChargeIdsforCrossingAgentBilling 			= CollectionUtility.getLongListFromString( (String) configuration.getOrDefault(CrossingAgentBillPropertiesConstant.BOOKING_CHARGE_IDS_FOR_CROSSING_AGENT_BILLING, "0"));

			final var	isManualInvoice = request.getParameter("isManualInvoice") != null;

			if(request.getParameter("manualInvoiceDate") != null)
				manualInvoiceDate = DateTimeUtility.appendTimeToDate(JSPUtility.GetString(request, "manualInvoiceDate"));

			final var	commissionEle = JSPUtility.GetDouble(request, "commissionEle", 0);

			if(request.getParameter("manualInvoiceNumber") != null && isManualInvoice)
				manualInvoiceNumber = Long.parseLong(request.getParameter("manualInvoiceNumber"));

			if(request.getParameter("fromDate") != null)
				fromDate = DateTimeUtility.getStartOfDayTimeStamp(JSPUtility.GetString(request, "fromDate"));

			if(request.getParameter("toDate") != null)
				toDate = DateTimeUtility.getStartOfDayTimeStamp(JSPUtility.GetString(request, "toDate"));

			if(!(boolean) configuration.getOrDefault(CrossingAgentBillPropertiesConstant.IS_SHOW_CROSSING_AGENT_TYPE, false))
				txnTypeId = CrossingAgentBill.CROSSINGAGENTBILL_DELIVERY_ID;

			if(billNumberFormat > 0)
				if(sourceBranch == null || SequenceCounterBllImpl.getInstance().isNotBranchCode(billNumberFormat, sourceBranch.getBranchCode())) {
					error.put("errorCode", CargoErrorList.BRANCH_CODE_NOT_DEFINE_ERROR);
					error.put("errorDescription", CargoErrorList.BRANCH_CODE_NOT_DEFINE_ERROR_DESCRIPTION);
					request.setAttribute("cargoError", error);
					request.setAttribute("nextPageToken", "failure");
					return;
				} else if(SequenceCounterBllImpl.getInstance().isPrefixNotDefined(billNumberFormat, prefixCode)) {
					error.put("errorCode", CargoErrorList.BRANCH_CODE_NOT_DEFINE_ERROR);
					error.put("errorDescription", "Prefix code is not defined !");
					request.setAttribute("cargoError", error);
					request.setAttribute("nextPageToken", "failure");
					return;
				}

			if(txnTypeId > 0) {
				for(var i = 0; i < dispatchIdsArray.length; i++) {
					dispatchIdsArray[i] = Long.parseLong(dispatchIdsStrArr[i]);
					str.add(Long.toString(dispatchIdsArray[i]));
				}

				final var	valueInObject 			= new ValueObject();
				valueInObject.put("dispatchStr", str.toString());
				valueInObject.put("txnTypeId", txnTypeId);

				final var	wayBillCrossingList 	= WayBillCrossingDaoImpl.getInstance().getWayBillCrossingDetailsForGeneratingBill(str.toString(), txnTypeId);

				final var	wbCrossingBills			= wayBillCrossingList.stream().collect(Collectors.groupingBy(WayBillCrossing::getDispatchLedgerId));
				final var	waybillIds				= wayBillCrossingList.stream().map(e -> Long.toString(e.getWayBillId())).collect(Collectors.joining(Constant.COMMA));
				final var	lsIdsArray				= wbCrossingBills.keySet().parallelStream().map(e -> e).toList();

				if(lsIdsArray.size() == dispatchIdsArray.length) {
					final var	lsColl 	  = DispatchLedgerDao.getInstance().getDispatchLedgerDetailsByLSIds(str.toString());
					final var	waybillHM = WayBillDao.getInstance().getLimitedLRDetails(waybillIds);
					final var	wayBillBookingchargesHM = WayBillBookingChargesDao.getInstance().getWayBillIdWiseChargesMap(waybillIds);

					final Map<Long, Map<Long, CrossingAgentBillingCharges>> dispatchLedgerIdsWiseChargesMap = new HashMap<>();

					final var	wbCrossingArrayList = new ArrayList<WayBillCrossing>();

					final Map<Long, Double>		dlIdWiseblhpvAmount		= new HashMap<>();

					if(isShowBLHPVAmount) {
						final List<DispatchLedger>	blhpvAmountDetails	= DispatchLedgerDao.getInstance().getBlhpvAmountByDispatchLedgerIds(str.toString());

						if(ObjectUtils.isNotEmpty(blhpvAmountDetails))
							for(final DispatchLedger blhpv : blhpvAmountDetails)
								if(dlIdWiseblhpvAmount.get(blhpv.getDispatchLedgerId()) == null)
									dlIdWiseblhpvAmount.put(blhpv.getDispatchLedgerId(), blhpv.getBalanceAmount());
					}

					if(wbCrossingBills != null && wbCrossingBills.size() > 0) {
						for(final Map.Entry<Long, List <WayBillCrossing>> entry : wbCrossingBills.entrySet()) {
							final var	wbCrossingList  = entry.getValue();
							final var	dispatchLedger	= lsColl.get(entry.getKey());
							final Map<Long, CrossingAgentBillingCharges> chargeAmountMap = new HashMap<>();

							var	totalNetLoading		= 0.00;
							var	totalNetUnLoading   = 0.00;
							var	totalCrossingHire   = 0.00;
							var	totalPaid			= 0.00;
							var	totalToPay			= 0.00;
							var	totalLocalTempoBhada= 0.00;
							var	totalDoorDelivery   = 0.00;
							var	blhpvAmount			= 0.00;
							var	totalHamali			= 0.00;
							var	totalTbb			= 0.00;
							var	totalFreightAmount  = 0.00;
							var	totalPickupChargeAmountForToPay  = 0.00;
							var	totalDoorDeliveryAmountForToPay  = 0.00;
							var	totalCrossingChargeAmountForToPay  = 0.00;

							for (final WayBillCrossing element : wbCrossingList) {
								final var	waybill = waybillHM.get(element.getWayBillId());

								if(waybill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID)
									totalPaid += waybill.getBookingTotal();
								else if(waybill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY)
									totalToPay += waybill.getBookingTotal();
								else if(waybill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT)
									totalTbb += waybill.getBookingTotal();

								totalNetLoading   	+= element.getNetLoading();
								totalNetUnLoading 	+= element.getNetUnloading();
								crossingAgentId	  	= element.getCrossingAgentId();
								totalCrossingHire 	+= element.getCrossingHire();
								totalLocalTempoBhada += element.getLocalTempoBhada();
								totalDoorDelivery 	+= element.getDoorDelivery();
								totalHamali			+= element.getHamali();

								final var	chargeWiseHM	= wayBillBookingchargesHM.get(element.getWayBillId());

								if (showBookingCharges && chargeWiseHM != null && chargeWiseHM.size() > 0)
									for (final Map.Entry<Long, WayBillBookingCharges> entry1 : chargeWiseHM.entrySet()) {
										final long chargeId	= entry1.getKey();
										final var wbCharges = entry1.getValue();

										final var chargeAmount = wbCharges.getChargeAmount();

										if (bookingChargeIdsforCrossingAgentBilling.contains(chargeId)) {
											if (chargeId == BookingChargeConstant.FREIGHT)
												totalFreightAmount += wbCharges.getChargeAmount();

											if(waybill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY)
												if (chargeId == BookingChargeConstant.PICKUP)
													totalPickupChargeAmountForToPay += wbCharges.getChargeAmount();
												else if (chargeId == BookingChargeConstant.CROSSING_BOOKING)
													totalCrossingChargeAmountForToPay += wbCharges.getChargeAmount();
												else if (chargeId == BookingChargeConstant.DOOR_DELIVERY_BOOKING)
													totalDoorDeliveryAmountForToPay += wbCharges.getChargeAmount();

											var	crAgentBillingCharges = chargeAmountMap.get(chargeId);

											if(crAgentBillingCharges == null) {
												crAgentBillingCharges	= new CrossingAgentBillingCharges();

												crAgentBillingCharges.setChargeId(chargeId);
												crAgentBillingCharges.setChargeAmount(chargeAmount);
												crAgentBillingCharges.setPaidChargeAmount(waybill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID ? chargeAmount : 0);
												crAgentBillingCharges.setToPayChargeAmount(waybill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY ? chargeAmount : 0);
												crAgentBillingCharges.setTbbChargeAmount(waybill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT ? chargeAmount : 0);
												crAgentBillingCharges.setAccountGroupId(executive.getAccountGroupId());

												chargeAmountMap.put(chargeId, crAgentBillingCharges);
											} else {
												crAgentBillingCharges.setChargeAmount(crAgentBillingCharges.getChargeAmount() + chargeAmount);

												if(waybill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID)
													crAgentBillingCharges.setPaidChargeAmount(crAgentBillingCharges.getPaidChargeAmount() + chargeAmount);

												if(waybill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY)
													crAgentBillingCharges.setToPayChargeAmount(crAgentBillingCharges.getToPayChargeAmount() + chargeAmount);

												if(waybill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT)
													crAgentBillingCharges.setTbbChargeAmount(crAgentBillingCharges.getTbbChargeAmount() + chargeAmount);
											}
										}
									}
							}

							final var	wayBillCrossing = new WayBillCrossing();
							wayBillCrossing.setDispatchLedgerId(dispatchLedger.getDispatchLedgerId());
							wayBillCrossing.setCrossingAgentId(crossingAgentId);
							wayBillCrossing.setLsNumber(dispatchLedger.getLsNumber());
							wayBillCrossing.setNetLoading(totalNetLoading);
							wayBillCrossing.setNetUnloading(totalNetUnLoading);
							wayBillCrossing.setCrossingHire(totalCrossingHire);
							wayBillCrossing.setTopayAmount(totalToPay);
							wayBillCrossing.setPaidAmount(totalPaid);
							wayBillCrossing.setLocalTempoBhada(totalLocalTempoBhada);
							wayBillCrossing.setDoorDelivery(totalDoorDelivery);
							wayBillCrossing.setHamali(totalHamali);
							wayBillCrossing.setFreightAmount(totalFreightAmount);

							if(commissionEle > 0)
								wayBillCrossing.setCommission(wayBillCrossing.getFreightAmount() * commissionEle / 100);
							else if (dispatchLedger.getIsCommissionPercentage())
								wayBillCrossing.setCommission(wayBillCrossing.getFreightAmount() * dispatchLedger.getCommission() / 100);
							else
								wayBillCrossing.setCommission(dispatchLedger.getCommission());

							if(showCommissionCol && wayBillCrossing.getCommission() > 0) {
								final var	crCharges = new CrossingAgentBillingCharges();

								crCharges.setChargeId((long) CrossingChargeConstant.CROSSING_COMMISSION);
								crCharges.setChargeAmount(wayBillCrossing.getCommission());
								crCharges.setPaidChargeAmount(0D);
								crCharges.setToPayChargeAmount(0D);
								crCharges.setTbbChargeAmount(0D);
								crCharges.setAccountGroupId(executive.getAccountGroupId());

								chargeAmountMap.put(crCharges.getChargeId(), crCharges);
							}

							if(!chargeAmountMap.isEmpty())
								dispatchLedgerIdsWiseChargesMap.put(dispatchLedger.getDispatchLedgerId(), chargeAmountMap);

							if(txnTypeId == CrossingAgentBill.CROSSINGAGENTBILL_DELIVERY_ID) {
								if(executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_STL)
									wayBillCrossing.setNetAmount(totalFreightAmount - wayBillCrossing.getCommission() - (totalToPay - totalPickupChargeAmountForToPay - totalDoorDeliveryAmountForToPay - totalCrossingChargeAmountForToPay));
								else if(deliveryCrossingSettlementCalculationOnTopay)
									wayBillCrossing.setNetAmount(totalToPay - (totalCrossingHire + totalDoorDelivery + totalHamali));
								else if(showNetAmountWithHalfPaidAndTBBAmount)
									wayBillCrossing.setNetAmount(totalToPay - (totalPaid/2 + totalTbb/2 ));
								else
									wayBillCrossing.setNetAmount(totalToPay + totalLocalTempoBhada - totalCrossingHire);
							} else if(txnTypeId == CrossingAgentBill.CROSSINGAGENTBILL_BOOKING_ID) {
								if(dlIdWiseblhpvAmount.get(dispatchLedger.getDispatchLedgerId()) != null)
									blhpvAmount = dlIdWiseblhpvAmount.get(dispatchLedger.getDispatchLedgerId());

								if(executive.getAccountGroupId()== AccountGroupConstant.ACCOUNT_GROUP_ID_STL)
									wayBillCrossing.setNetAmount(totalFreightAmount - wayBillCrossing.getCommission() - (totalToPay - totalPickupChargeAmountForToPay - totalDoorDeliveryAmountForToPay - totalCrossingChargeAmountForToPay));
								else if(bookingCrossingSettlementCalculationOnTopay)
									wayBillCrossing.setNetAmount(-(totalToPay - totalCrossingHire));
								else if(blhpvAmount != 0)
									wayBillCrossing.setNetAmount(totalToPay - totalCrossingHire - blhpvAmount);
								else
									wayBillCrossing.setNetAmount(totalPaid - totalCrossingHire);
							}

							wbCrossingArrayList.add(wayBillCrossing);
						}

						//Create Bill Number
						if(isManualInvoice && isAllowWithoutSequneceCounter) {
							crossingAgentBillSequenceCounter = new CrossingAgentBillSequenceCounter();
							crossingAgentBillSequenceCounter.setNextVal(manualInvoiceNumber);
						} else if(isManualInvoice && !isAllowWithoutSequneceCounter)
							crossingAgentBillSequenceCounter = CrossingAgentBillSequenceCounterDao.getInstance().getCrossingAgentBillSequenceCounterNextValue(executive.getAccountGroupId(), executive.getBranchId(),CrossingAgentBillSequenceCounter.CROSSINGAGENTBILL_SEQUENCE_MANUAL);
						else
							crossingAgentBillSequenceCounter = CrossingAgentBillSequenceCounterDao.getInstance().getCrossingAgentBillSequenceCounter(executive.getAccountGroupId(), executive.getBranchId());

						valueInObject.put("manualInvoiceDate", manualInvoiceDate);
						/**
						 * Here we are checking for duplicate invoice number
						 */
						if(crossingAgentBillSequenceCounter != null)
							if(isManualInvoice && manualInvoiceDate != null) {
								valueInObject.put("manualInvoiceDate", manualInvoiceDate);
								invoiceNumber	= Long.toString(crossingAgentBillSequenceCounter.getNextVal());
								isNumberExits 	= DuplicateTransactionCheckDao.getInstance().checkDuplicateTxnForFinancialYear(invoiceNumber, executive.getBranchId(), executive.getAccountGroupId(), (short) 16, manualInvoiceDate);
							} else {
								configuration.put(Constant.CREATEDATE, createDate);

								invoiceNumber	= SequenceCounterBllImpl.getInstance().getGeneratedSequence(configuration, sourceBranch.getBranchCode(), crossingAgentBillSequenceCounter.getNextVal());
								isNumberExits	= DuplicateTransactionCheckDao.getInstance().checkDuplicateTxnForFinancialYear(invoiceNumber, executive.getBranchId(), executive.getAccountGroupId(), (short) 16, createDate);
							}

						/**
						 * If invoice already created then we are not allowing to create
						 */
						if(!isNumberExits) {
							if(crossingAgentBillSequenceCounter != null) {
								if(isManualInvoice || crossingAgentBillSequenceCounter.getNextVal() >= crossingAgentBillSequenceCounter.getMinRange() && crossingAgentBillSequenceCounter.getNextVal() <= crossingAgentBillSequenceCounter.getMaxRange()) {
									final var executive2	= new com.iv.dto.Executive();

									executive2.setAccountGroupId(executive.getAccountGroupId());
									executive2.setBranchId(executive.getBranchId());
									executive2.setExecutiveId(executive.getExecutiveId());

									valueInObject.put("executive", executive2);
									valueInObject.put("wbCrossingArrayList", wbCrossingArrayList);
									valueInObject.put("remark", JSPUtility.GetString(request, "remark"));
									valueInObject.put("billno", invoiceNumber);
									valueInObject.put("crossingAgentId", crossingAgentId);
									valueInObject.put("txnTypeId", txnTypeId);
									valueInObject.put("configuration", configuration);
									valueInObject.put("dispatchLedgerIdsWiseChargesMap", dispatchLedgerIdsWiseChargesMap);
									valueInObject.put("fromDate", fromDate);
									valueInObject.put("toDate", toDate);

									final var	valueOutObject = CrossingAgentBillBllImpl.getInstance().createCrossingAgentBillOld(valueInObject);

									if(valueOutObject != null)
										response.sendRedirect("CrossingAgentBillAfterCreation.do?pageId=249&eventId=4&successMsg="+Long.parseLong(valueOutObject.get("crossingAgentBillId").toString())+"&billNumber="+valueOutObject.get("billno").toString());
									else {
										error.put("errorCode", CargoErrorList.BILL_NUMBER_ERROR);
										error.put("errorDescription", CargoErrorList.BILL_NUMBER_ERROR_DESCRIPTION);
										request.setAttribute("cargoError", error);
										request.setAttribute("nextPageToken", "failure");
									}
								} else {
									error.put("errorCode", CargoErrorList.BILL_SEQUENCE_COUNTER_MISSING);
									error.put("errorDescription", CargoErrorList.BILL_SEQUENCE_COUNTER_MISSING_DESCRIPTION);
									request.setAttribute("cargoError", error);
									request.setAttribute("nextPageToken", "failure");
								}
							} else {
								error.put("errorCode", CargoErrorList.CROSSINGAGENT_BILL_SEQUENCE_COUNTER_MISSING);
								error.put("errorDescription", CargoErrorList.CROSSINGAGENT_SEQUENCE_COUNTER_MISSING_DESCRIPTION);
								request.setAttribute("cargoError", error);
								request.setAttribute("nextPageToken", "failure");
							}
						} else {
							error.put("errorCode", CargoErrorList.CROSSING_AGENT_DUPLICATE_NUMBER);
							error.put("errorDescription", CargoErrorList.CROSSING_AGENT_DUPLICATE_NUMBER_DESCRIPTION);
							request.setAttribute("cargoError", error);
							request.setAttribute("nextPageToken", "failure");
						}
					}
				} else {
					error.put("errorCode", CargoErrorList.SOME_LR_ALREADY_BILLED);
					error.put("errorDescription", CargoErrorList.SOME_LR_ALREADY_BILLED_DESCRIPTION);
					request.setAttribute("cargoError", error);
					request.setAttribute("nextPageToken", "failure");
				}
			} else {
				error.put("errorCode", CargoErrorList.TRANSACTION_TYPE_MISSING );
				error.put("errorDescription", CargoErrorList.TRANSACTION_TYPE_MISSING_DESCRIPTION);
				request.setAttribute("cargoError", error);
				request.setAttribute("nextPageToken", "failure");
			}
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}

}