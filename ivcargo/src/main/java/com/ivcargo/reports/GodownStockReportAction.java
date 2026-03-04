package com.ivcargo.reports;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.StringJoiner;
import java.util.function.Function;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.displaydata.DisplayDataConfigurationBll;
import com.businesslogic.properties.impl.PropertyConfigValueBLLImpl;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.dao.impl.DeliveryContactDetailsDaoImpl;
import com.iv.dto.DeliveryContactDetails;
import com.iv.dto.constant.ExecutiveTypeConstant;
import com.iv.dto.constant.FormTypeConstant;
import com.iv.dto.constant.InfoForDeliveryConstant;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.properties.constant.report.GodownStockReportConfigurationConstant;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.constant.Constant;
import com.iv.utils.constant.DateTimeFormatConstant;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.exception.ExceptionProcess;
import com.iv.utils.utility.SortUtils;
import com.iv.utils.utility.SplitLRNumber;
import com.iv.utils.utility.Utility;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.ChargeConfigDao;
import com.platform.dao.GodownDao;
import com.platform.dao.GodownUnloadDetailsDao;
import com.platform.dto.Branch;
import com.platform.dto.CustomGroupMapper;
import com.platform.dto.GodownUnloadDetails;
import com.platform.dto.PropertiesFileConstants;
import com.platform.dto.SubRegion;
import com.platform.dto.configuration.mindateselection.ReportWiseMinDateSelectionConfigurationDTO;
import com.platform.dto.configuration.modules.GenerateCashReceiptDTO;
import com.platform.dto.constant.ReportWiseDisplayZeroAmountConstant;
import com.platform.dto.constant.WayBillTypeConstant;
import com.platform.resource.CargoErrorList;

public class GodownStockReportAction implements Action {
	private static final String TRACE_ID = "GodownStockReportAction";

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	 			error 					= null;
		List<GodownUnloadDetails>			godownUnloadDetailList	= null;
		Map<Long, GodownUnloadDetails>		pendingDeliveryColl		= null;
		Map<Long, GodownUnloadDetails>		crossingColl			= null;
		ArrayList<DeliveryContactDetails>	deliveryContactDetailsList	= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeGodownStockReportAction().execute(request, response);

			final var	cacheManip	= new CacheManip(request);
			final var	executive	= cacheManip.getExecutive(request);

			final var	configuration					= ReadAllConfigurationsBllImpl.getInstance().getReportConfigurationData(ReportIdentifierConstant.GODOWN_STOCK_REPORT, executive.getAccountGroupId());
			final var	generateCRConfig				= cacheManip.getGenerateCRConfiguration(request, executive.getAccountGroupId());
			final var	isShowToPayAmtCol				= (boolean) configuration.getOrDefault(GodownStockReportConfigurationConstant.IS_SHOW_TO_PAY_AMT_COL,false);
			final var	isGoodsUndeliveredEntryAllowed	= generateCRConfig.getBoolean(GenerateCashReceiptDTO.IS_GOODS_UNDELIVERED_ENTRY_ALLOWED,false);
			final var	reportConfig					= PropertyConfigValueBLLImpl.getInstance().getConfiguration(executive, PropertiesFileConstants.REPORT_WISE_DISPLAY_ZERO_AMOUNT_CONSTANT);
			final var	isAmountZeroForGodownStockReport= reportConfig.getBoolean(ReportWiseDisplayZeroAmountConstant.GODOWN_STOCK_REPORT, false);
			final var	displayDataConfig				= cacheManip.getDisplayDataConfiguration(request, executive.getAccountGroupId());
			var			showDownloadToExcelOption		= (boolean) configuration.getOrDefault(GodownStockReportConfigurationConstant.SHOW_DOWNLOAD_TO_EXCEL_OPTION, false);
			final var	valueObjectIn					= new ValueObject();
			final var	execFldPermissionsHM 			= cacheManip.getExecutiveFieldPermission(request);
			final var	sortByUnloadDateWise			= (boolean) configuration.getOrDefault(GodownStockReportConfigurationConstant.SORT_BY_UNLOAD_DATE_WISE, false);
			final var	lrCountToSendReportRequest		= (int) configuration.getOrDefault(GodownStockReportConfigurationConstant.LR_COUNT_TO_SEND_REPORT_REQUEST, 0);
			final var 	allowCustomSorting				= (boolean) configuration.getOrDefault(GodownStockReportConfigurationConstant.ALLOW_CUSTOM_SORTING, false);
			final var 	showFullLRTypeName				= (boolean) configuration.getOrDefault(GodownStockReportConfigurationConstant.SHOW_FULL_LR_TYPE_NAME, false);

			final var	minDateTimeStamp	= cacheManip.getReportWiseMinDateToGetData(request, executive.getAccountGroupId(),
					ReportWiseMinDateSelectionConfigurationDTO.GODOWN_STOCK_REPORT_MIN_DATE_ALLOW,
					ReportWiseMinDateSelectionConfigurationDTO.GODOWN_STOCK_REPORT_MIN_DATE);

			ActionStaticUtil.executiveTypeWiseBranches(request, cacheManip, executive);

			var	branchId 	= JSPUtility.GetLong(request, "branch", 0);

			if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_EXECUTIVE
					|| executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_BRANCHADMIN)
				branchId 	= executive.getBranchId();

			request.setAttribute("GodownList", GodownDao.getInstance().getGodownList(branchId, executive.getAccountGroupId()));

			final var	wayBillTypeId  	= JSPUtility.GetLong(request, "wayBillTypeId" ,0);
			final var	deliveryTypeId 	= JSPUtility.GetShort(request, "deliveryTypeId", (short) 0);
			final var	formTypeId		= JSPUtility.GetShort(request, "formTypeId", (short) 0);
			final var	packingGroupId	= JSPUtility.GetLong(request, "packingGroupId", 0);
			final var	billSelectionId	= JSPUtility.GetShort(request, "billSelectionId", (short) 0);
			final var	yearRangeSelection	= JSPUtility.GetShort(request, "YearRange", (short) 0);
			final var	godownId		= JSPUtility.GetLong(request, "godownId" ,0);
			final var	subRegionId		= JSPUtility.GetLong(request, "subRegion", 0);
			final var 	yearRange 		= DateTimeUtility.getFinancialYearDates(JSPUtility.GetString(request, "selectedYearRange", null));

			final var	whereClause = new StringJoiner(" AND ");

			if(branchId > 0)
				whereClause.add("gud.BranchId = " + branchId);

			if(subRegionId > 0)
				whereClause.add("br.subRegionId = " + subRegionId);

			if(yearRangeSelection == 2)
				request.setAttribute("showTillDate", "Till Date: " + DateTimeUtility.getCurrentDateString());
			else if(yearRangeSelection == 3) {//upto date
				if(JSPUtility.GetString(request, "fromDate") != null) {
					final var fromDate = DateTimeUtility.getEndOfDayTimeStamp(JSPUtility.GetString(request, "fromDate"));

					whereClause.add("gud.CreationDateTime <= '" + fromDate + "'");
				}

				request.setAttribute("showUptoDate", "Upto Date: " + JSPUtility.GetString(request, "fromDate"));
			} else if(yearRange != null) {
				final var  dateWithMonth = yearRange.split(Constant.FORWARD_SLASH);
				whereClause.add("gud.CreationDateTime >= '" + dateWithMonth[0] + "'");
				whereClause.add("gud.CreationDateTime <= '" + dateWithMonth[1] + "'");
			} else if(JSPUtility.GetString(request, "fromDate") != null && JSPUtility.GetString(request, "toDate") != null) {
				final var	fromDate	= DateTimeUtility.getStartOfDayTimeStamp(JSPUtility.GetString(request, "fromDate"));
				final var	toDate		= DateTimeUtility.getEndOfDayTimeStamp(JSPUtility.GetString(request, "toDate"));

				whereClause.add("gud.CreationDateTime >= '" + fromDate + "'");
				whereClause.add("gud.CreationDateTime <= '" + toDate + "'");
			}

			if(godownId > 0)
				whereClause.add("gud.GodownId = " + godownId);

			whereClause.add("gud.[Status] = 1");

			if(minDateTimeStamp != null)
				whereClause.add("gud.CreationDateTime >= '" + minDateTimeStamp + "'");

			if(wayBillTypeId > 0)
				whereClause.add("wb.WayBillTypeId = " + wayBillTypeId);

			if(deliveryTypeId > 0)
				whereClause.add("wb.DeliveryTypeId = " + deliveryTypeId);

			if (formTypeId > 0)
				whereClause.add("ftd.FormTypesId = " + formTypeId);

			if (packingGroupId > 0)
				whereClause.add("pgtm.PackingGroupTypeId = " + packingGroupId);

			if(isGoodsUndeliveredEntryAllowed)
				whereClause.add("pg.WayBillId is Null" );

			if(billSelectionId > 0)
				whereClause.add("cgms.BillSelectionId = " + billSelectionId);

			if(GodownUnloadDetailsDao.getInstance().getGodownStockReportDataCount(whereClause.toString()) > lrCountToSendReportRequest) {
				request.setAttribute("excelMailRequest", true);
				showDownloadToExcelOption	= false;
			} else
				godownUnloadDetailList = GodownUnloadDetailsDao.getInstance().getGodownStockReportData(whereClause.toString());

			if(godownUnloadDetailList != null && !godownUnloadDetailList.isEmpty()) {
				final var branches 		= cacheManip.getGenericBranchesDetail(request);
				final var subRegions	= cacheManip.getAllSubRegions(request);

				final Map<Long, GodownUnloadDetails>	godownUnloadColl	= godownUnloadDetailList.stream()
						.collect(Collectors.toMap(GodownUnloadDetails::getWayBillId, Function.identity(), (e1, e2) -> e1, LinkedHashMap::new));
				final Map<Long, String>	packingTypeHM		= godownUnloadDetailList.stream().collect(Collectors.groupingBy(GodownUnloadDetails::getWayBillId,
						Collectors.mapping(e -> e.getArtQuantity() + " - " + e.getPackingTypeName(), Collectors.joining(", "))));
				final Map<Long, String>	saidToContainHM		= godownUnloadDetailList.stream().collect(Collectors.groupingBy(GodownUnloadDetails::getWayBillId,
						Collectors.mapping(GodownUnloadDetails::getSaidToContain, Collectors.joining(", "))));

				final var	wayBillIdStr			= godownUnloadColl.entrySet().stream().map(e -> Long.toString(e.getKey())).collect(Collectors.joining(","));
				final var	chargeMapCollection  	= ChargeConfigDao.getInstance().getChargeAmountForMultipleWayBills(wayBillIdStr);

				valueObjectIn.put("executive", executive);
				valueObjectIn.put("execFldPermissionsHM", execFldPermissionsHM);

				for (final Map.Entry<Long, GodownUnloadDetails> entry : godownUnloadColl.entrySet()) {
					final var	godownUnloadDetails = entry.getValue();

					if(isAmountZeroForGodownStockReport) {
						valueObjectIn.put("wayBillTypeId", godownUnloadDetails.getWayBillTypeId());

						if(DisplayDataConfigurationBll.isAllowToDisplayZeroAmount(displayDataConfig, valueObjectIn))
							godownUnloadDetails.setGrandTotal(0);
					}

					if(godownUnloadDetails.getFormtypeid() == FormTypeConstant.CC_ATTACHED_FORM_ID )
						godownUnloadDetails.setCcAtteched("CC Attached");
					else
						godownUnloadDetails.setCcAtteched("--");

					godownUnloadDetails.setPackingTypeName(packingTypeHM.getOrDefault(entry.getKey(), "--"));
					godownUnloadDetails.setQuantity(godownUnloadDetails.getTotalQuantity() - godownUnloadDetails.getShortLuggage());
					godownUnloadDetails.setSaidToContain(saidToContainHM != null ? saidToContainHM.getOrDefault(entry.getKey(), "--") : "--");

					var	branch		= (Branch) branches.get(Long.toString(godownUnloadDetails.getSourceBranchId()));
					var	subRegion	= (SubRegion) subRegions.get(branch.getSubRegionId());

					godownUnloadDetails.setSourceBranch(branch.getName());
					godownUnloadDetails.setSourceSubRegionId(branch.getSubRegionId());
					godownUnloadDetails.setSourceSubRegion(subRegion.getName());

					if(godownUnloadDetails.getDestinationBranchId() > 0 ) {
						branch		= (Branch) branches.get(Long.toString(godownUnloadDetails.getDestinationBranchId()));
						subRegion	= (SubRegion) subRegions.get(branch.getSubRegionId());

						godownUnloadDetails.setDestinationBranch(branch.getName());
						godownUnloadDetails.setDestinationSubRegionId(branch.getSubRegionId());
						godownUnloadDetails.setDestinationSubRegion(subRegion.getName());
					} else {
						godownUnloadDetails.setDestinationSubRegion("");
						godownUnloadDetails.setDestinationBranch("DDDV");
					}

					if(showFullLRTypeName || godownUnloadDetails.getWayBillTypeId() != WayBillTypeConstant.WAYBILL_TYPE_CREDIT)
						godownUnloadDetails.setWayBillType(WayBillTypeConstant.getWayBillTypeNameByWayBilTypeId(godownUnloadDetails.getWayBillTypeId()));
					else
						godownUnloadDetails.setWayBillType(WayBillTypeConstant.getWayBillTypeShortNameByWayBilTypeId(godownUnloadDetails.getWayBillTypeId()));

					if(chargeMapCollection != null && chargeMapCollection.size() > 0) {
						final var	chargeAmount = chargeMapCollection.get(entry.getKey());

						if(chargeAmount != null)
							godownUnloadDetails.setOctroiAmount(chargeAmount);
					}

					branch = (Branch) branches.get(Long.toString(godownUnloadDetails.getDestinationBranchId()));

					if(branch != null && branch.getTypeOfLocation() == Branch.TYPE_OF_LOCATION_OPERATIONAL_PLACE) {
						final var	locationsMapping = cacheManip.getLocationMapping(request, executive.getAccountGroupId(), branch.getBranchId());

						if(locationsMapping != null)
							branchId = locationsMapping.getLocationId();
						else
							branchId = godownUnloadDetails.getDestinationBranchId();
					} else
						branchId = godownUnloadDetails.getDestinationBranchId();

					godownUnloadDetails.setCrossing(godownUnloadDetails.getBranchId() != branchId);
					godownUnloadDetails.setBookingDateTimeStr(DateTimeUtility.getDateFromTimeStamp(godownUnloadDetails.getBookingDateTime(), DateTimeFormatConstant.DD_MM_YY));
					godownUnloadDetails.setUnloadDateTimeStr(DateTimeUtility.getDateFromTimeStamp(godownUnloadDetails.getCreationDateTime(), DateTimeFormatConstant.DD_MM_YY));
					godownUnloadDetails.setDeliveryType(InfoForDeliveryConstant.getInfoForDelivery(godownUnloadDetails.getDeliveryTypeId()));
					godownUnloadDetails.setPackingGroupName(Utility.checkedNullCondition(godownUnloadDetails.getPackingGroupName(), (short) 1));
					godownUnloadDetails.setPrivateMark(Utility.checkedNullCondition(godownUnloadDetails.getPrivateMark(), (short) 1));
					godownUnloadDetails.setInvoiceNumber(Utility.checkedNullCondition(godownUnloadDetails.getInvoiceNumber(), (short) 1));

					if(isShowToPayAmtCol)
						godownUnloadDetails.setTopayAmount(godownUnloadDetails.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY ? godownUnloadDetails.getGrandTotal() : 0D);
					else
						godownUnloadDetails.setTopayAmount(0D);

					if(allowCustomSorting) {
						final var 	pair	= SplitLRNumber.getNumbers(godownUnloadDetails.getWayBillNumber());
						godownUnloadDetails.setNewLRnumber(pair != null && pair.getLrNumber() instanceof Long ? (long) pair.getLrNumber() : 0);
					}
				}

				godownUnloadDetailList.clear();
				godownUnloadDetailList.addAll(godownUnloadColl.values());

				if(allowCustomSorting)
					godownUnloadDetailList	= SortUtils.sortList(godownUnloadDetailList, GodownUnloadDetails::getSourceBranch, GodownUnloadDetails::isManual, GodownUnloadDetails::getNewLRnumber);
				else
					godownUnloadDetailList	= SortUtils.sortList(godownUnloadDetailList, GodownUnloadDetails::getCreationDateTime, GodownUnloadDetails::getBookingDateTime);

				if(sortByUnloadDateWise) {
					crossingColl = godownUnloadDetailList.stream().filter(GodownUnloadDetails::isCrossing)
							.sorted(Comparator.comparing(GodownUnloadDetails::getCreationDateTime,Comparator.reverseOrder()))
							.collect(Collectors.toMap(GodownUnloadDetails::getWayBillId, Function.identity(), (e1, e2) -> e1, LinkedHashMap::new));

					pendingDeliveryColl = godownUnloadDetailList.stream().filter(e -> !e.isCrossing())
							.sorted(Comparator.comparing(GodownUnloadDetails::getCreationDateTime,Comparator.reverseOrder()))
							.collect(Collectors.toMap(GodownUnloadDetails::getWayBillId, Function.identity(), (e1, e2) -> e1, LinkedHashMap::new));
				} else {
					crossingColl = godownUnloadDetailList.stream().filter(GodownUnloadDetails::isCrossing)
							.collect(Collectors.toMap(GodownUnloadDetails::getWayBillId, Function.identity(), (e1, e2) -> e1, LinkedHashMap::new));

					pendingDeliveryColl	= godownUnloadDetailList.stream().filter(e -> !e.isCrossing())
							.collect(Collectors.toMap(GodownUnloadDetails::getWayBillId, Function.identity(), (e1, e2) -> e1, LinkedHashMap::new));
				}

				if(crossingColl != null) {
					final var	valueObjectOut = calculateSummary(crossingColl, true);

					request.setAttribute("paidCrossingTotal", valueObjectOut.getDouble("paidCrossingTotal", 0.0));
					request.setAttribute("toPayCrossingTotal", valueObjectOut.getDouble("toPayCrossingTotal", 0.0));
					request.setAttribute("tbbCrossingTotal", valueObjectOut.getDouble("tbbCrossingTotal", 0.0));
				}

				if(pendingDeliveryColl != null) {
					final var	valueObjectOut = calculateSummary(pendingDeliveryColl, false);

					request.setAttribute("paidTotal", valueObjectOut.getDouble("paidTotal", 0.0));
					request.setAttribute("toPayTotal", valueObjectOut.getDouble("toPayTotal", 0.0));
					request.setAttribute("tbbTotal", valueObjectOut.getDouble("tbbTotal", 0.0));
				}

				final var	totalGodownUnloadDetailsHM	= getTotalUnloadDetails(godownUnloadDetailList);

				if(isGoodsUndeliveredEntryAllowed)
					deliveryContactDetailsList	= DeliveryContactDetailsDaoImpl.getInstance().getStockOutPendingLRsDetailsForReport(godownId);

				request.setAttribute("godownUnloadDetails", godownUnloadColl);
				request.setAttribute("pendingDeliveryColl",  pendingDeliveryColl);
				request.setAttribute("deliveryContactDetailsList", deliveryContactDetailsList);
				request.setAttribute("crossingColl", crossingColl);
				request.setAttribute("totalGodownUnloadDetailsHM", totalGodownUnloadDetailsHM);
				request.setAttribute("showDownloadToExcelOption", showDownloadToExcelOption);

				configuration.entrySet().forEach((final Map.Entry<Object, Object> entry) -> request.setAttribute(entry.getKey().toString(), entry.getValue()));
			} else {
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}

			ActionStaticUtil.setRequestAttribute(request,"customAddressBranchId", branchId);
			ActionStaticUtil.setRequestAttribute(request,"customAddressIdentifer", CustomGroupMapper.IDENTIFIER_DELIVERY);

			ActionStaticUtil.setReportViewModel(request);
			request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}

	private Map<Long, GodownUnloadDetails> getTotalUnloadDetails(final List<GodownUnloadDetails> result) throws Exception {
		try {
			final Map<Long, GodownUnloadDetails>	map			= new HashMap<>();

			for(final GodownUnloadDetails e : result) {
				var	godownUnloadDetails	= map.get(e.getWayBillTypeId());

				if(godownUnloadDetails == null) {
					godownUnloadDetails	= (GodownUnloadDetails) e.clone();

					map.put(e.getWayBillTypeId(), godownUnloadDetails);
				} else
					merge(godownUnloadDetails, e);
			}

			return map;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public void merge(final GodownUnloadDetails first, final GodownUnloadDetails second) {
		first.setOctroiAmount(first.getOctroiAmount() + second.getOctroiAmount());
		first.setActualWeight(first.getActualWeight() + second.getActualWeight());
		first.setGrandTotal(first.getGrandTotal() + second.getGrandTotal());
		first.setDeclaredValue(first.getDeclaredValue() + second.getDeclaredValue());
		first.setQuantity(first.getQuantity() + second.getQuantity());
		first.setWayBillType(first.getWayBillType());
	}

	private ValueObject calculateSummary(final Map<Long, GodownUnloadDetails> godownUnloadColl, final boolean isCrossing) throws Exception {
		try {
			final var	paidTotal		= godownUnloadColl.values().stream().filter(e -> e.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID).mapToDouble(GodownUnloadDetails::getGrandTotal).sum();
			final var	toPayTotal		= godownUnloadColl.values().stream().filter(e -> e.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY).mapToDouble(GodownUnloadDetails::getGrandTotal).sum();
			final var	tbbTotal		= godownUnloadColl.values().stream().filter(e -> e.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT).mapToDouble(GodownUnloadDetails::getGrandTotal).sum();

			final var	valueObjectOut = new ValueObject();

			if(isCrossing) {
				valueObjectOut.put("paidCrossingTotal", paidTotal);
				valueObjectOut.put("toPayCrossingTotal", toPayTotal);
				valueObjectOut.put("tbbCrossingTotal", tbbTotal);
			} else {
				valueObjectOut.put("paidTotal", paidTotal);
				valueObjectOut.put("toPayTotal", toPayTotal);
				valueObjectOut.put("tbbTotal", tbbTotal);
			}

			return valueObjectOut;
		} catch(final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}
}
