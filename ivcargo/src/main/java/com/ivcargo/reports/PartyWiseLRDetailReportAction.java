package com.ivcargo.reports;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.StringJoiner;
import java.util.function.Function;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.ObjectUtils;
import org.apache.commons.lang3.StringUtils;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.bll.impl.properties.DisplayDataConfigurationBllImpl;
import com.iv.bll.impl.waybill.WayBillBookingChargesBllImpl;
import com.iv.constant.properties.GeneralConfigurationPropertiesConstant;
import com.iv.constant.properties.report.PartyWiseLrDetailsConfigurationDTO;
import com.iv.dao.impl.waybill.LRInvoiceDetailsDaoImpl;
import com.iv.dto.constant.BillClearanceStatusConstant;
import com.iv.dto.constant.ChargeTypeConstant;
import com.iv.dto.constant.ExecutiveTypeConstant;
import com.iv.dto.constant.InfoForDeliveryConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.dto.constant.PaymentTypeConstant;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.dto.constant.WayBillStatusConstant;
import com.iv.dto.constant.WayBillTypeConstant;
import com.iv.dto.waybill.LRInvoiceDetails;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.constant.Constant;
import com.iv.utils.constant.DateTimeFormatConstant;
import com.iv.utils.exception.ExceptionProcess;
import com.iv.utils.utility.CollectionUtility;
import com.iv.utils.utility.SortUtils;
import com.iv.utils.utility.SplitLRNumber;
import com.iv.utils.utility.Utility;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.reports.BillClearanceDAO;
import com.platform.dao.reports.PartyWiseLRDetailCustDao;
import com.platform.dto.AliasNameConstants;
import com.platform.dto.BillClearance;
import com.platform.dto.Branch;
import com.platform.dto.CustomGroupMapper;
import com.platform.dto.Executive;
import com.platform.dto.configuration.mindateselection.ReportWiseMinDateSelectionConfigurationDTO;
import com.platform.dto.constant.BookingChargeConstant;
import com.platform.dto.model.DayWiseDateModel;
import com.platform.dto.model.PartyWiseLRDetailModel;
import com.platform.resource.CargoErrorList;

public class PartyWiseLRDetailReportAction implements Action {

	private static final String TRACE_ID = PartyWiseLRDetailReportAction.class.getName();

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String, Object> 						error 						    = null;
		Timestamp										fromDate       				    = null;
		Timestamp										toDate         				    = null;
		var												srcBranchId 				    = 0L;
		var 											actualWeight				    = 0.0;
		var 											amount						    = 0.0;
		StringJoiner									whereClause1			     	= null;
		Map<Long, Map<Long, PartyWiseLRDetailModel>> 	creditWaybillTxnSummaryHM		= null;
		HashMap<Long, BillClearance> 					billClearanceDetails			= null;
		Map<Long, String> 								invoiceNohm 					= null;
		Map<Long, String> 								invoiceDatehm 					= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializePartyWiseLRDetailReportAction().execute(request, response);

			final var	cacheManip  = new CacheManip(request);
			final var	executive   = cacheManip.getExecutive(request);

			final var	minDateTimeStamp	= cacheManip.getReportWiseMinDateToGetData(request, executive.getAccountGroupId(),
					ReportWiseMinDateSelectionConfigurationDTO.PARTY_WISE_LR_DETAILS_REPORT_MIN_DATE_ALLOW,
					ReportWiseMinDateSelectionConfigurationDTO.PARTY_WISE_LR_DETAILS_REPORT_MIN_DATE);

			final var	generalConfig	= cacheManip.getGeneralConfiguration(request, executive.getAccountGroupId());

			ActionStaticUtil.executiveTypeWiseSelection1(request, cacheManip, executive);

			final var	configuration			    			= ReadAllConfigurationsBllImpl.getInstance().getReportConfigurationData(ReportIdentifierConstant.PARTY_WISE_LR_DETAIL, executive.getAccountGroupId());
			final var	showDestinationBranchWiseData			= (boolean) configuration.getOrDefault(PartyWiseLrDetailsConfigurationDTO.SHOW_DESTINATION_BRANCH_WISE_DATA,false);
			final var	showBookingRateCol						= (boolean) configuration.getOrDefault(PartyWiseLrDetailsConfigurationDTO.SHOW_BOOKING_RATE_COL,false);
			final var	showAllOptionWithBillingPartySelection 	= (boolean) configuration.getOrDefault(PartyWiseLrDetailsConfigurationDTO.SHOW_ALL_OPTION_WITH_BILLING_PARTY_SELECTION,false);
			final var	allowBookingDateWiseSorting				= (boolean) configuration.getOrDefault(PartyWiseLrDetailsConfigurationDTO.ALLOW_BOOKING_DATE_WISE_SORTING,false);
			final var	allowLrNoWiseSorting					= (boolean) configuration.getOrDefault(PartyWiseLrDetailsConfigurationDTO.ALLOW_LR_NO_WISE_SORTING,false);
			final var	showMultipleInvoiceDetails				= (boolean) configuration.getOrDefault(PartyWiseLrDetailsConfigurationDTO.SHOW_MULTIPLE_INVOICE_DETAILS, false);
			final var	showBookingVehicleType					= (boolean) configuration.getOrDefault(PartyWiseLrDetailsConfigurationDTO.SHOW_BOOKING_VEHICLE_TYPE, false);

			configuration.entrySet().forEach((final Map.Entry<Object, Object> entry) -> request.setAttribute(entry.getKey().toString(), entry.getValue()));

			final var	time 					= JSPUtility.GetInt(request, "timeDuration");
			final var	wayBillStatus 			= JSPUtility.GetShort(request, "wayBillStatus");

			if(time == DayWiseDateModel.DAY_WISE_LAST_THIRTY_DAY_ID) {
				fromDate	= DateTimeUtility.getStartOfDayTimeStamp(JSPUtility.GetString(request, Constant.FROM_DATE));
				toDate		= DateTimeUtility.getEndOfDayTimeStamp(JSPUtility.GetString(request, Constant.TO_DATE));
			} else {
				fromDate	= DateTimeUtility.getStartOfDayTimeStamp(DateTimeUtility.getDateBeforeNoOfDays(time));
				toDate		= DateTimeUtility.getCurrentDateTimeAsRange().getTimestamp(Constant.TO_DATE);
			}

			final var	fromDateStr = DateTimeUtility.getDateFromTimeStamp(fromDate);
			final var	toDateStr 	= DateTimeUtility.getDateFromTimeStamp(toDate);

			ActionStaticUtil.executiveTypeWiseBranches(request, cacheManip, executive);

			final var	branchIds		= ActionStaticUtil.getBranchIdsWithAssignedLocation1(request, cacheManip, executive);

			if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN || executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_REGIONADMIN || executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_SUBREGIONADMIN)
				srcBranchId = JSPUtility.GetLong(request, Branch.BRANCH, 0);
			else
				srcBranchId = executive.getBranchId();

			final var	partyNameId = JSPUtility.GetLong(request, "partyId", 0);
			final var	partyType	= JSPUtility.GetShort(request, "partySelection", (short) 0);

			ActionStaticUtil.setRequestAttribute(request,"customAddressBranchId", srcBranchId);
			ActionStaticUtil.setRequestAttribute(request,"customAddressIdentifer", CustomGroupMapper.IDENTIFIER_BOOKING);

			request.setAttribute("timeDuration", time);
			request.setAttribute("partyName", partyNameId);
			request.setAttribute("partySelection", partyType);
			request.setAttribute("wayBillStatus", wayBillStatus);
			request.setAttribute("fromDateStr", fromDateStr);
			request.setAttribute("toDateStr", toDateStr);

			final var	whereClause	= getWhereClauseData(executive, fromDate, toDate, minDateTimeStamp, showAllOptionWithBillingPartySelection, wayBillStatus, partyNameId, partyType);

			if(StringUtils.isNotEmpty(branchIds))
				whereClause.add("AND bwbt.BranchId IN (" + branchIds + ")");

			if(showDestinationBranchWiseData) {
				whereClause1	= getWhereClauseData(executive, fromDate, toDate, minDateTimeStamp, showAllOptionWithBillingPartySelection, wayBillStatus, partyNameId, partyType);

				if(StringUtils.isNotEmpty(branchIds))
					whereClause1.add("AND bwbt.DestinationBranchId IN (" + branchIds + ")");
			}

			var	partyWiseLrDetailsReportList = PartyWiseLRDetailCustDao.getInstance().getPartyWiseAllLRDetailReports(whereClause, whereClause1);

			if (ObjectUtils.isNotEmpty(partyWiseLrDetailsReportList)) {
				final Map<Long, PartyWiseLRDetailModel>	partyWiseLrDetailsReportHM	= partyWiseLrDetailsReportList.stream().collect(Collectors.toMap(PartyWiseLRDetailModel::getWayBillId, Function.identity(), (e1, e2) -> e1));

				final var wayBillIds = partyWiseLrDetailsReportList.stream()
						.map(PartyWiseLRDetailModel -> String.valueOf(PartyWiseLRDetailModel.getWayBillId()))
						.collect(Collectors.joining(Constant.COMMA));

				final var	wayBillIdWiseBookingchargesHM = WayBillBookingChargesBllImpl.getInstance().getWayBillIdWiseChargesMapHM(wayBillIds);

				final Map<Long, Map<Long, PartyWiseLRDetailModel>>	consignmentDetailsHM	= partyWiseLrDetailsReportList.stream().collect(Collectors.groupingBy(PartyWiseLRDetailModel::getWayBillId,
						Collectors.toMap(PartyWiseLRDetailModel::getConsignmentDetailsId, Function.identity(), (e1, e2) -> e1)));

				if((boolean) configuration.getOrDefault(PartyWiseLrDetailsConfigurationDTO.SHOW_RECEIVED_AMOUNT_COLUMN, false) || (boolean) configuration.getOrDefault(PartyWiseLrDetailsConfigurationDTO.SHOW_PAYMENT_CLEAR_DATE, false)) {
					creditWaybillTxnSummaryHM = partyWiseLrDetailsReportList.stream().filter(e -> e.getCreditWayBillTxnClearanceBranchId() > 0).collect(Collectors.groupingBy(PartyWiseLRDetailModel::getWayBillId,
							Collectors.toMap(PartyWiseLRDetailModel::getCreditWayBillTxnClearanceSummaryId, Function.identity(), (e1, e2) -> e1)));

					final List<Long>	billids = partyWiseLrDetailsReportList.stream().map(PartyWiseLRDetailModel::getBillId).collect(Collectors.toList());

					if(!billids.isEmpty())
						billClearanceDetails = BillClearanceDAO.getInstance().getBillClearanceDetails(CollectionUtility.getStringFromLongList(billids));
				}

				final var displayDataConfig	= cacheManip.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.DISPLAY_DATA_CONFIGURATION);
				displayDataConfig.put(Constant.EXEC_FEILD_PERMISSION, cacheManip.getExecutiveFieldPermission(request));
				displayDataConfig.put(Constant.EXECUTIVE_TYPE, executive.getExecutiveType());

				if(showMultipleInvoiceDetails) {
					final var wayBillIdsString 	= partyWiseLrDetailsReportList.stream().map(e -> String.valueOf(e.getWayBillId())).collect(Collectors.joining(Constant.COMMA));
					final var invoiceDetailsCol = LRInvoiceDetailsDaoImpl.getInstance().getInvoiceBillDetaByWayBillIds(wayBillIdsString);

					if(ObjectUtils.isNotEmpty(invoiceDetailsCol)) {
						invoiceNohm = invoiceDetailsCol.stream().collect(Collectors.groupingBy(LRInvoiceDetails :: getWayBillId,
								Collectors.mapping(LRInvoiceDetails::getInvoiceNumber, Collectors.joining(Constant.COMMA))));
						
						invoiceDatehm = invoiceDetailsCol.stream().collect(Collectors.groupingBy(LRInvoiceDetails :: getWayBillId,
								Collectors.mapping(LRInvoiceDetails::getInvoiceDate, Collectors.joining(Constant.COMMA))));
					}
				}

				final var	lrTypeWiseZeroAmtHM	= DisplayDataConfigurationBllImpl.getInstance().lrTypeWiseZeroAmountHMReport(displayDataConfig, partyWiseLrDetailsReportHM.values().stream().filter(e -> e.getWayBillTypeId() > 0).map(PartyWiseLRDetailModel::getWayBillTypeId).collect(Collectors.toSet()), ReportIdentifierConstant.PARTY_WISE_LR_DETAIL);

				for (final Map.Entry<Long, PartyWiseLRDetailModel> entry : partyWiseLrDetailsReportHM.entrySet()) {
					final var obj	= entry.getValue();

					if(obj.getBillId() > 0 && billClearanceDetails != null) {
						final var	billClearanceData = billClearanceDetails.get(obj.getBillId());

						if(billClearanceData != null) {
							final var	percentageAmtReceived	= billClearanceData.getTotalReceivedAmount() / billClearanceData.getGrandTotal() * 100;
							obj.setPaymentClearDateStr(DateTimeUtility.getDateFromTimeStamp(billClearanceData.getCreationDateTimeStamp(), DateTimeFormatConstant.DD_MM_YY));
							obj.setPaymentReceivedBranch(cacheManip.getBranchById(request, executive.getAccountGroupId(), billClearanceData.getBranchId()).getName());

							if(percentageAmtReceived > 0)
								obj.setReceivedAmount(obj.getWaybillamount() * percentageAmtReceived / 100);
						}
					} else if(creditWaybillTxnSummaryHM != null) {
						final Map<Long, PartyWiseLRDetailModel>	creditWaybillTxnSummaryDataHm = creditWaybillTxnSummaryHM.get(obj.getWayBillId());
						if(ObjectUtils.isNotEmpty(creditWaybillTxnSummaryDataHm)){
							final List<PartyWiseLRDetailModel> creditWaybillTxnSummaryList = new ArrayList<>(creditWaybillTxnSummaryDataHm.values());
							
							final PartyWiseLRDetailModel model = creditWaybillTxnSummaryList.get(creditWaybillTxnSummaryList.size() - 1);
							
							obj.setReceivedAmount(creditWaybillTxnSummaryDataHm.values().stream().mapToDouble(PartyWiseLRDetailModel::getReceivedAmount).sum());
							obj.setPaymentClearDateStr(DateTimeUtility.getDateFromTimeStamp(model.getPaymentClearDate(), DateTimeFormatConstant.DD_MM_YY));
							obj.setPaymentReceivedBranch(cacheManip.getBranchById(request, executive.getAccountGroupId(), model.getCreditWayBillTxnClearanceBranchId()).getName());
							
						}

					}

					final boolean	isShowAmountZero	= lrTypeWiseZeroAmtHM.getOrDefault(obj.getWayBillTypeId(), false);

					obj.setSourceBranch(cacheManip.getGenericBranchDetailCache(request, obj.getSourceBranchId()).getName());
					obj.setDestinationBranch(cacheManip.getGenericBranchDetailCache(request, obj.getDestinationBranchId()).getName());
					obj.setWayBillType(WayBillTypeConstant.getWayBillTypeNameByWayBilTypeId(obj.getWayBillTypeId()));
					obj.setLhpvNo(Utility.checkedNullCondition(obj.getLhpvNo(), (short) 1));
					obj.setLorryHireAmount(obj.getLorryHireAmount());

					if(obj.getWaybillStatusId() == WayBillStatusConstant.WAYBILL_STATUS_DUEDELIVERED)
						obj.setWaybillStatus(generalConfig.getString(GeneralConfigurationPropertiesConstant.DUE_DELIVERED_STATUS_NAME));
					else if(obj.getWaybillStatusId() == WayBillStatusConstant.WAYBILL_STATUS_DUEUNDELIVERED)
						obj.setWaybillStatus(generalConfig.getString(GeneralConfigurationPropertiesConstant.DUE_UNDELIVERED_STATUS_NAME));
					else if(obj.getWaybillStatusId() == WayBillStatusConstant.WAYBILL_STATUS_DISPATCHED)
						obj.setWaybillStatus(generalConfig.getString(GeneralConfigurationPropertiesConstant.DISPATCHED_STATUS_NAME));
					else
						obj.setWaybillStatus(WayBillStatusConstant.getStatus(obj.getWaybillStatusId()));

					obj.setWaybillStatus(obj.getWaybillStatus() != null ? obj.getWaybillStatus() : "--");
					obj.setCurrentBranch(cacheManip.getGenericBranchDetailCache(request, obj.getWayBillBranchId()).getName());
					obj.setBillNumber(obj.getBillNumber() != null ? obj.getBillNumber() + " (" + cacheManip.getBranchById(request, executive.getAccountGroupId(), obj.getBillingBranchId()).getName()+ ")" : "--");
					obj.setBillStatusString(BillClearanceStatusConstant.getBillClearanceStatus(obj.getBillStatus()));
					obj.setDeliveryPaymentTypeName(PaymentTypeConstant.getPaymentType(obj.getDeliveryPaymentType()));
					obj.setDeliveryPaymentModeName(PaymentTypeConstant.getPaymentType(obj.getDeliveryPaymentMode()));
					obj.setPaymentStatusName(PaymentTypeConstant.getPaymentTypeStatus(obj.getPaymentStatus()));
					obj.setStbsNumber(Utility.checkedNullCondition(obj.getStbsNumber(), (short) 1));
					obj.setConsignorGST(Utility.checkedNullCondition(obj.getConsignorGST(), (short) 1));
					obj.setConsigneeGST(Utility.checkedNullCondition(obj.getConsigneeGST(), (short) 1));
					obj.setSaidToContain(Utility.checkedNullCondition(obj.getSaidToContain(), (short) 2));
					obj.setCrNumber(Utility.checkedNullCondition(obj.getCrNumber(), (short) 1));
					obj.setInvoicedateStr(DateTimeUtility.getDateFromTimeStamp(obj.getInvoicedate(), DateTimeFormatConstant.DD_MM_YY));
					
					if(StringUtils.isEmpty(obj.getInvoiceNo()))
						obj.setInvoiceNo(invoiceNohm != null ? invoiceNohm.getOrDefault(obj.getWayBillId(), "--") : "--");
					else
						obj.setInvoiceNo(Utility.checkedNullCondition(obj.getInvoiceNo(), (short) 1));

					
					if(StringUtils.isEmpty(obj.getInvoicedateStr()))
						obj.setInvoicedateStr(invoiceDatehm != null ? invoiceDatehm.getOrDefault(obj.getWayBillId(), "--") : "--");
					else
						obj.setInvoicedateStr(Utility.checkedNullCondition(obj.getInvoicedateStr(), (short) 1));
					
					obj.setBillingPartyName(Utility.checkedNullCondition(obj.getBillingPartyName(), (short) 1));
					obj.setVehicleNumber(Utility.checkedNullCondition(obj.getVehicleNumber(), (short) 1));
					obj.setLsVehicleNumber(Utility.checkedNullCondition(obj.getLsVehicleNumber(), (short) 1));
					obj.seteWayBillNumber(Utility.checkedNullCondition(obj.geteWayBillNumber(), (short) 1));
					obj.setStbsBillPaymentStatusName(PaymentTypeConstant.getPaymentTypeStatus(obj.getStbsPaymentStatus()));
					obj.setLrDispatchDateStr(DateTimeUtility.getDateFromTimeStamp(obj.getLrDispatchDate(), DateTimeFormatConstant.DD_MM_YY));
					obj.setBookedDateStr(DateTimeUtility.getDateFromTimeStamp(obj.getBookedDate(), DateTimeFormatConstant.DD_MM_YY));
					obj.setDeliveryDateStr(DateTimeUtility.getDateFromTimeStamp(obj.getDeliveryDate(), DateTimeFormatConstant.DD_MM_YY));
					obj.setBookingPaymentTypeName(PaymentTypeConstant.getPaymentType(obj.getBookingPaymentType()));
					obj.setBookingBankName(obj.getBookingBankName() == null ? "" : obj.getBookingBankName());
					obj.setBookingPaymentModeName(PaymentTypeConstant.getPaymentType(obj.getBookingPaymentMode()));

					if(obj.getBillCoverLetterBranchId() > 0)
						obj.setBillCoverLetterBranch(cacheManip.getGenericBranchDetailCache(request, obj.getBillCoverLetterBranchId()).getName());
					else
						obj.setBillCoverLetterBranch("--");

					obj.setBillCoverLetterDateStr(DateTimeUtility.getDateFromTimeStamp(obj.getBillCoverLetterDate(), DateTimeFormatConstant.DD_MM_YY));
					obj.setBillCoverLetterNumber(Utility.checkedNullCondition(obj.getBillCoverLetterNumber(), (short) 1));

					if(obj.getBookingBillingBranchId() > 0)
						obj.setBillingBranchName(cacheManip.getGenericBranchDetailCache(request, obj.getBookingBillingBranchId()).getName());
					else
						obj.setBillingBranchName("--");

					obj.setBillDateStr(DateTimeUtility.getDateFromTimeStamp(obj.getBillDate(), DateTimeFormatConstant.DD_MM_YY));

					if(isShowAmountZero)
						obj.setGrandTotal(0);

					if(showBookingRateCol && !isShowAmountZero) {
						amount			= obj.getAmount();
						actualWeight	= obj.getWeightRate();
					}

					var	consignmentHM	= consignmentDetailsHM.get(obj.getWayBillId());

					if(consignmentHM == null) consignmentHM	= new HashMap<>();

					final var saidToContainStr = consignmentHM.values().stream().filter(cd -> cd.getSaidToContain() != null).map(PartyWiseLRDetailModel::getSaidToContain).collect(Collectors.joining(","));

					final var packingTpeCommaSepWithQty = consignmentHM.values().stream() .map(cd-> cd.getConsignmentDetailsQuantity() + "-" + cd.getPackingTypeName())
							.collect(Collectors.joining(","));

					if(showBookingRateCol && !isShowAmountZero) {
						final var	finalAmountStr	= consignmentHM.values().stream().filter(pd -> pd.getChargeTypeId() == ChargeTypeConstant.CHARGE_TYPE_UNIT_QUANTITY).map(pd -> pd.getConsignmentDetailsQuantity() + "-" + pd.getPackingTypeName()).collect(Collectors.joining(","));

						if(obj.getChargeTypeId() == ChargeTypeConstant.CHARGE_TYPE_UNIT_WEIGHT) {
							if(obj.getWeightRate() > 0)
								obj.setBookingRate(Double.toString(obj.getWeightRate()));
							else if(obj.getAmount() > 0 && obj.getActualWeight() > 0.0 && actualWeight > 0)
								obj.setBookingRate(Double.toString(amount / actualWeight));
						} else if(obj.getChargeTypeId() == ChargeTypeConstant.CHARGE_TYPE_UNIT_FIX)
							obj.setBookingRate(Double.toString(obj.getAmount()));
						else if(obj.getChargeTypeId() == ChargeTypeConstant.CHARGE_TYPE_UNIT_QUANTITY)
							obj.setBookingRate(finalAmountStr);
					}

					obj.setSaidToContain(saidToContainStr);
					obj.setPackingTypeWithQty(packingTpeCommaSepWithQty);
					obj.setDeliveryToName(InfoForDeliveryConstant.getInfoForDelivery(obj.getDeliveryToId()));

					if(obj.getVehicleTypeId() > 0) {
						final var	vehicleType = cacheManip.getVehicleType(request, executive.getAccountGroupId(), obj.getVehicleTypeId());
						obj.setVehicleTypeName(vehicleType != null ? vehicleType.getName() : "");
					} else
						obj.setVehicleTypeName("--");
					
					if(showBookingVehicleType){
						if(obj.getBookingVehicleTypeId() > 0) {
							final var	vehicleType = cacheManip.getVehicleType(request, executive.getAccountGroupId(),obj.getBookingVehicleTypeId());
							obj.setVehicleTypeName(vehicleType != null ? vehicleType.getName() : "");
						} else
							obj.setVehicleTypeName("--");
					}

					if(wayBillIdWiseBookingchargesHM != null && wayBillIdWiseBookingchargesHM.size() > 0 && !isShowAmountZero) {
						final var	bookingChargeHM = wayBillIdWiseBookingchargesHM.get(obj.getWayBillId());

						if(bookingChargeHM != null) {
							obj.setCartageCharge(bookingChargeHM.getOrDefault((long) BookingChargeConstant.CARTAGE_CHARGE, 0d));
							obj.setDoorDeliveryCharge(bookingChargeHM.getOrDefault((long) BookingChargeConstant.DOOR_DELIVERY_BOOKING, 0d));
							obj.setFreightAmount(bookingChargeHM.getOrDefault((long) BookingChargeConstant.FREIGHT, 0d));
							obj.setOtherCharge(bookingChargeHM.getOrDefault((long) BookingChargeConstant.OTHER_BOOKING, 0d));
							obj.setUnloadingCharge(bookingChargeHM.getOrDefault((long) BookingChargeConstant.UNLOADING_BOOKING, 0d));
						}
					}

					splitAndSetLRNumber(obj);
				}

				partyWiseLrDetailsReportList.clear();
				partyWiseLrDetailsReportList.addAll(partyWiseLrDetailsReportHM.values());

				if (allowBookingDateWiseSorting)
					partyWiseLrDetailsReportList = SortUtils.sortList(partyWiseLrDetailsReportList, PartyWiseLRDetailModel::getBookedDate);

				if (allowLrNoWiseSorting)
					partyWiseLrDetailsReportList = SortUtils.sortList(partyWiseLrDetailsReportList, PartyWiseLRDetailModel::getBranchCode, PartyWiseLRDetailModel::getWayBillNumberWithoutBranchCode);

				request.setAttribute("PartyWiseLRDetailModel", partyWiseLrDetailsReportList);
			} else {
				error.put(AliasNameConstants.ERROR_CODE, CargoErrorList.REPORT_NOTFOUND);
				error.put(AliasNameConstants.ERROR_DESCRIPTION, CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute(CargoErrorList.CARGO_ERROR, error);
			}

			ActionStaticUtil.setReportViewModel(request);
			request.setAttribute("nextPageToken", Constant.SUCCESS);
			request.setAttribute("showMultipleInvoiceDetails", showMultipleInvoiceDetails);
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}
	}

	private void splitAndSetLRNumber(final PartyWiseLRDetailModel obj) {
		try {
			final var 	pair	= SplitLRNumber.getNumbers(obj.getWayBillNumber());

			obj.setBranchCode(pair != null && pair.getBranchCode() instanceof String ? pair.getBranchCode().toString() : Constant.BLANK);
			obj.setWayBillNumberWithoutBranchCode(pair != null && pair.getLrNumber() instanceof Long ? (Long) pair.getLrNumber() : 0L);

		} catch (final Exception e) {
			obj.setBranchCode(Constant.BLANK);
			obj.setWayBillNumberWithoutBranchCode(0L);
		}
	}

	private StringJoiner getWhereClauseData(final Executive executive, final Timestamp fromDate, final Timestamp toDate,
			final Timestamp minDateTimeStamp, final boolean showAllOptionWithBillingPartySelection, final short wayBillStatus, final long partyNameId, final short partyType) throws Exception {
		try {
			final var	whereClause	= new StringJoiner(" ");

			whereClause.add("bwbt.Status = 1");
			whereClause.add("AND bwbt.AccountGroupID = " + executive.getAccountGroupId());
			whereClause.add("AND bwbt.BookingDateTimeStamp >= '" + fromDate + "'");
			whereClause.add("AND bwbt.BookingDateTimeStamp <= '" + toDate + "'");

			if(minDateTimeStamp != null)
				whereClause.add("AND bwbt.BookingDateTimeStamp >= '" + minDateTimeStamp + "'");

			if(showAllOptionWithBillingPartySelection) {
				if(partyType == 3)
					whereClause.add("AND cust.BillingPartyId = " + partyNameId);
				else if(partyType == 1 || partyType == 2)
					whereClause.add("AND cust.CorporateAccountId = " + partyNameId);
				else {
					whereClause.add("AND (cust.CorporateAccountId = " + partyNameId);
					whereClause.add("OR cust.BillingPartyId = " + partyNameId + ")");
				}
			} else
				whereClause.add("AND cust.CorporateAccountId = " + partyNameId);

			if(partyType == 1 || partyType == 2)
				whereClause.add("AND cust.Type = " + partyType);

			if(wayBillStatus > 0)
				whereClause.add("AND wb.Status = " + wayBillStatus);

			return whereClause;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}
}