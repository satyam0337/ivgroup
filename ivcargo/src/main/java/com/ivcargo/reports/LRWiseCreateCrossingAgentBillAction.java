package com.ivcargo.reports;

import java.sql.Timestamp;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.StringJoiner;
import java.util.TreeMap;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.bll.impl.crossingagentbill.CrossingAgentBillBllImpl;
import com.iv.bll.impl.sequencecounter.SequenceCounterBllImpl;
import com.iv.dao.impl.WayBillCrossingDaoImpl;
import com.iv.dto.WayBillCrossing;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.properties.constant.CrossingAgentBillPropertiesConstant;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.constant.Constant;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.CrossingAgentBillSequenceCounterDao;
import com.platform.dao.DuplicateTransactionCheckDao;
import com.platform.dto.Branch;
import com.platform.dto.CrossingAgentBill;
import com.platform.dto.CrossingAgentBillSequenceCounter;
import com.platform.dto.Executive;
import com.platform.dto.constant.WayBillTypeConstant;
import com.platform.resource.CargoErrorList;

public class LRWiseCreateCrossingAgentBillAction implements Action {
	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {

		HashMap<String,Object>	 					error 												= null;
		Executive 									executive 		  									= null;
		String[] 									wayBillIdsStrArr 									= null;
		Long[]										wayBillIdsArray 									= null;
		Timestamp									manualInvoiceDate									= null;
		CrossingAgentBillSequenceCounter 			crossingAgentBillSequenceCounter					= null;
		Timestamp 									createDate 											= null;
		CacheManip									cManip												= null;
		Branch										sourceBranch										= null;
		String 										invoiceNumber 										= null;
		var 									isNumberExits										= false;
		short  										txnTypeId 											= 0;
		var   										crossingAgentId	   									= 0L;
		var   										manualInvoiceNumber 								= 0L;
		String   									supplierNo 								            = null;
		Timestamp 									supllierBillDate 									= null;
		String   									totalAmt 								            = null;
		var                                        selectedCheckboxCount                               = 0;
		var                                     crossingHireAmount                                   = 0D;
		Timestamp									fromDate										= null;
		Timestamp									toDate											= null;
		try {

			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;
			wayBillIdsStrArr	= request.getParameterValues("checkbox");
			executive 			= (Executive)request.getSession().getAttribute("executive");
			txnTypeId 		 	= JSPUtility.GetShort(request, "txnId",(short)0);
			crossingAgentId		= JSPUtility.GetLong(request, "billingCrossingAgentId",0);

			createDate 			= DateTimeUtility.getCurrentTimeStamp();
			final var	str 			 	= new StringJoiner(Constant.COMMA);
			wayBillIdsArray 	= new Long[wayBillIdsStrArr.length];
			cManip		  		= new CacheManip(request);

			final var	configuration= cManip.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.CROSSING_AGENT_BILL);

			sourceBranch 					= cManip.getBranchById(request, executive.getAccountGroupId(), executive.getBranchId());

			final var	isAllowWithoutSequneceCounter  						= (boolean) configuration.getOrDefault(CrossingAgentBillPropertiesConstant.ALLOW_WITHOUT_SEQUENCECOUNTER,false);
			final var	bookingCrossingSettlementCalculationOnTopay 		= (boolean) configuration.getOrDefault(CrossingAgentBillPropertiesConstant.BOOKING_CROSSING_SETTELMENT_CALCULATION_ON_TOPAY,false);
			final var	deliveryCrossingSettlementCalculationOnTopay 		= (boolean) configuration.getOrDefault(CrossingAgentBillPropertiesConstant.DELIVERY_CROSSING_SETTELMENT_CALCULATION_ON_TOPAY,false);
			final var	isShowType											= (boolean) configuration.getOrDefault(CrossingAgentBillPropertiesConstant.IS_SHOW_CROSSING_AGENT_TYPE,false);
			final var	showCrossingHireAndExtraAmount						= (boolean) configuration.getOrDefault(CrossingAgentBillPropertiesConstant.SHOW_CROSSING_HIRE_AND_EXTRA_AMOUNT,false);
			final var	billNumberFormat									= (int) configuration.getOrDefault(CrossingAgentBillPropertiesConstant.SEQUENCE_NUMBER_FORMAT, 0);
			final var	prefixCode											= (String) configuration.getOrDefault(CrossingAgentBillPropertiesConstant.CODE_FOR_SEQUENCE_NUMBER_GENERATION, "");

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

			final var	isManualInvoice = request.getParameter("isManualInvoice") != null;

			if(request.getParameter("manualInvoiceDate") != null)
				manualInvoiceDate = DateTimeUtility.appendTimeToDate(JSPUtility.GetString(request, "manualInvoiceDate"));

			if(request.getParameter("manualInvoiceNumber") != null)
				manualInvoiceNumber = Long.parseLong(request.getParameter("manualInvoiceNumber"));

			if(request.getParameter("supplierNo") != null)
				supplierNo = request.getParameter("supplierNo");

			if(request.getParameter("fromDate") != null)
				fromDate = DateTimeUtility.getStartOfDayTimeStamp(JSPUtility.GetString(request, "fromDate"));

			if(request.getParameter("toDate") != null)
				toDate = DateTimeUtility.getStartOfDayTimeStamp(JSPUtility.GetString(request, "toDate"));

			for (var i = 0; i < wayBillIdsStrArr.length; i++)
				wayBillIdsArray[i] = Long.parseLong(wayBillIdsStrArr[i]);
			
			if(request.getParameter("totalAmt") != null && !"0".equals(request.getParameter("totalAmt"))) {
				totalAmt = request.getParameter("totalAmt");

				selectedCheckboxCount = wayBillIdsArray.length;

				crossingHireAmount = Double.parseDouble(totalAmt) / selectedCheckboxCount;
			}

			if(request.getParameter("supllierBillDate") != null)
				supllierBillDate = DateTimeUtility.appendTimeToDate(JSPUtility.GetString(request, "supllierBillDate"));

			if(!isShowType)
				txnTypeId = CrossingAgentBill.CROSSINGAGENTBILL_DELIVERY_ID;

			if(txnTypeId > 0){
				for (final Long element : wayBillIdsArray)
					str.add(Long.toString(element));

				final var	valueInObject 			= new ValueObject();
				valueInObject.put("waybillId", str.toString());
				valueInObject.put("txnTypeId",txnTypeId);
				valueInObject.put("accountGroupId",executive.getAccountGroupId());
				valueInObject.put("crossingAgentId",crossingAgentId);

				final var	wbcArrayList		= WayBillCrossingDaoImpl.getInstance().getWayBillCrossingDetailsForGeneratingLRWiseBill(valueInObject);

				final Map<Long, List<WayBillCrossing>>	wayBillCrossingHM	    = wbcArrayList.stream().collect(Collectors.groupingBy(WayBillCrossing :: getWayBillId));

				final Map<String, WayBillCrossing>	wbCrossingColl			= new TreeMap<>();

				wbcArrayList.clear();

				wayBillCrossingHM.keySet().stream().map(wayBillCrossingHM::get).forEach((final var wbcListFromDB) -> {
					if(wbcListFromDB.size() > 1) {
						var	wbcDB = wbcListFromDB.stream().filter(obj -> obj.getCrossingHire() > 0).findFirst().orElse(null);

						if (wbcDB == null)
							wbcDB = wbcListFromDB.stream().findFirst().orElse(null);

						if(wbcDB != null)
							wbcArrayList.add(wbcDB);
					} else
						wbcArrayList.add(wbcListFromDB.get(0));
				});

				for (final WayBillCrossing wbc : wbcArrayList) {
					if(showCrossingHireAndExtraAmount && crossingHireAmount > 0)
						wbc.setCrossingHire(crossingHireAmount);

					var	wayBillCrossing	= wbCrossingColl.get(wbc.getWayBillId() + "_" + wbc.getWayBillNumber());

					if(wayBillCrossing == null) {
						wayBillCrossing = new WayBillCrossing();
						wayBillCrossing.setWayBillCrossingId(wbc.getWayBillCrossingId());
						wayBillCrossing.setWayBillId(wbc.getWayBillId());
						wayBillCrossing.setTxnTypeId(wbc.getTxnTypeId());
						wayBillCrossing.setDispatchLedgerId(wbc.getDispatchLedgerId());
						wayBillCrossing.setCrossingAgentId(wbc.getCrossingAgentId());
						wayBillCrossing.setLsNumber(wbc.getLsNumber());
						wayBillCrossing.setNetLoading(wbc.getNetLoading());
						wayBillCrossing.setNetUnloading(wbc.getNetUnloading());

						if(wbc.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY)
							wayBillCrossing.setTopayAmount(wbc.getBookingTotal());
						else if(wbc.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID)
							wayBillCrossing.setPaidAmount(wbc.getBookingTotal());

						wayBillCrossing.setLocalTempoBhada(wbc.getLocalTempoBhada());
						wayBillCrossing.setDoorDelivery(wbc.getDoorDelivery());
						wayBillCrossing.setCrossingHire(wbc.getCrossingHire());

						if(txnTypeId == CrossingAgentBill.CROSSINGAGENTBILL_DELIVERY_ID) {
							if(deliveryCrossingSettlementCalculationOnTopay)
								wayBillCrossing.setNetAmount(wayBillCrossing.getTopayAmount() - (wbc.getCrossingHire() + wbc.getDoorDelivery()));
							else
								wayBillCrossing.setNetAmount(wayBillCrossing.getTopayAmount() + wbc.getLocalTempoBhada() - wbc.getCrossingHire());
						} else if(txnTypeId == CrossingAgentBill.CROSSINGAGENTBILL_BOOKING_ID)
							if(bookingCrossingSettlementCalculationOnTopay)
								wayBillCrossing.setNetAmount(-(wayBillCrossing.getTopayAmount() - wbc.getCrossingHire()));
							else
								wayBillCrossing.setNetAmount(wayBillCrossing.getPaidAmount() - wbc.getCrossingHire());

						wbCrossingColl.put(wbc.getWayBillId() + "_" + wbc.getWayBillNumber(), wayBillCrossing);
					}
				}

				wbcArrayList.clear();
				wbcArrayList.addAll(wbCrossingColl.values());

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
						isNumberExits 	= DuplicateTransactionCheckDao.getInstance().checkDuplicateTxnForFinancialYear(invoiceNumber, executive.getBranchId(), executive.getAccountGroupId(), (short)16,manualInvoiceDate);
					} else {
						invoiceNumber	= SequenceCounterBllImpl.getInstance().getGeneratedSequence(configuration, sourceBranch.getBranchCode(), crossingAgentBillSequenceCounter.getNextVal());

						isNumberExits = DuplicateTransactionCheckDao.getInstance().checkDuplicateTxnForFinancialYear(invoiceNumber, executive.getBranchId(), executive.getAccountGroupId(), (short)16,createDate);
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
							valueInObject.put("wbCrossingArrayList", wbcArrayList);
							valueInObject.put("remark", JSPUtility.GetString(request, "remark"));
							valueInObject.put("billno", invoiceNumber);
							valueInObject.put("crossingAgentId",crossingAgentId);
							valueInObject.put("txnTypeId",txnTypeId);
							valueInObject.put("supplierNo",supplierNo);
							valueInObject.put("supllierBillDate",supllierBillDate);
							valueInObject.put("configuration", configuration);
							valueInObject.put("fromDate",fromDate );
							valueInObject.put("toDate", toDate);

							final var	valueOutObject = CrossingAgentBillBllImpl.getInstance().createLRWiseCrossingAgentBill(valueInObject);

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
				}else{
					error.put("errorCode", CargoErrorList.CROSSING_AGENT_DUPLICATE_NUMBER);
					error.put("errorDescription", CargoErrorList.CROSSING_AGENT_DUPLICATE_NUMBER_DESCRIPTION);
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
			ActionStepsUtil.catchActionException(request, e, error);
		}
	}

}