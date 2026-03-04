package com.ivcargo.reports;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.StringJoiner;
import java.util.TreeMap;
import java.util.function.Function;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.ObjectUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.BeanUtils;

import com.businesslogic.displaydata.DisplayDataConfigurationBll;
import com.businesslogic.properties.impl.PropertyConfigValueBLLImpl;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.constant.properties.report.BookingSummaryDestinationWiseReportPropertiesConstant;
import com.iv.dao.impl.reports.collection.BookingSummaryDestinationWiseReportDaoImpl;
import com.iv.dto.constant.BookingChargeConstant;
import com.iv.dto.constant.ExecutiveTypeConstant;
import com.iv.dto.constant.InfoForDeliveryConstant;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.dto.constant.WayBillStatusConstant;
import com.iv.dto.constant.WayBillTypeConstant;
import com.iv.dto.model.reports.collection.BookingSummaryDestinationWiseReportModel;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.exception.ExceptionProcess;
import com.iv.utils.utility.CollectionUtility;
import com.iv.utils.utility.SplitLRNumber;
import com.iv.utils.utility.Utility;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.Branch;
import com.platform.dto.CustomGroupMapper;
import com.platform.dto.Executive;
import com.platform.dto.PackingTypeMaster;
import com.platform.dto.PropertiesFileConstants;
import com.platform.dto.SubRegion;
import com.platform.dto.TransportCommonMaster;
import com.platform.dto.WayBill;
import com.platform.dto.WayBillType;
import com.platform.dto.constant.ReportWiseDisplayZeroAmountConstant;
import com.platform.resource.CargoErrorList;

public class BookingSummaryDestinationWiseReportAction implements Action {

	private static final String TRACE_ID = BookingSummaryDestinationWiseReportAction.class.getName();

	ValueObject		packingTypeMasterData		= null;
	ValueObject 	subRegions					= null;
	ValueObject 	branches					= null;

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>				error 					= null;
		List<Long>       								destAssignedLocationIdList  = null;
		List<BookingSummaryDestinationWiseReportModel>	reportListOutgoing					= null;
		List<BookingSummaryDestinationWiseReportModel>	reportListIncoming					= null;
		String 								destBranchIds 			= null;
		var 	branchId		= 0L;
		final var				whereClauseIn										= new StringJoiner(" ");
		final var				whereClauseOut										= new StringJoiner(" ");
		var							inComing											= false;
		var							outGoing											= false;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeBookingSummaryDestinationWiseReportAction().execute(request, response);

			final var	sdf			= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			final var	fromDate	= new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00").getTime());
			final var	toDate		= new Timestamp(sdf.parse(JSPUtility.GetString(request, "toDate") + " 23:59:59").getTime());

			final var	cacheManip  = new CacheManip(request);
			final var	executive   = cacheManip.getExecutive(request);
			final var	type		= Long.parseLong(request.getParameter("type"));
			final var	reportType	= Short.parseShort(request.getParameter("reportType"));
			final var	locationId	= JSPUtility.GetLong(request, "locationId", 0);
			final var	wayBillType	= JSPUtility.GetShort(request, "lrType" , (short) 0);
			subRegions				= cacheManip.getAllSubRegions(request);
			branches				= cacheManip.getGenericBranchesDetail(request);
			packingTypeMasterData	= cacheManip.getPackingTypeMasterData(request);

			final var	configuration			= PropertyConfigValueBLLImpl.getInstance().getConfiguration(executive, PropertiesFileConstants.REPORT_WISE_DISPLAY_ZERO_AMOUNT_CONSTANT);
			final var	reportConfig			= ReadAllConfigurationsBllImpl.getInstance().getOldReportConfigurationData(ReportIdentifierConstant.BOOKING_SUMMARY_DESTINATION_WISE_REPORT, executive.getAccountGroupId());
			final var	isAmountZero			= configuration.getBoolean(ReportWiseDisplayZeroAmountConstant.BOOKING_SUMMARY_DESTINATION_WISE, false);
			final var	displayDataConfig		= cacheManip.getDisplayDataConfiguration(request, executive.getAccountGroupId());
			final var	valueObjectIn			= new ValueObject();

			final var	showConsignorColumnInLrWiseDetail	= reportConfig.getBoolean(BookingSummaryDestinationWiseReportPropertiesConstant.SHOW_CONSIGNOR_COLUMN_IN_LR_WISE_DETAIL, false);
			final var	showConsigneeColumnInLrWiseDetail	= reportConfig.getBoolean(BookingSummaryDestinationWiseReportPropertiesConstant.SHOW_CONSIGNEE_COLUMN_IN_LR_WISE_DETAIL, false);
			final var	showCurrentStatusInLrWiseDetail		= reportConfig.getBoolean(BookingSummaryDestinationWiseReportPropertiesConstant.SHOW_CURRENT_STATUS_IN_LR_WISE_DETAIL, false);
			final var	showCurrentBranchInLrWiseDetail		= reportConfig.getBoolean(BookingSummaryDestinationWiseReportPropertiesConstant.SHOW_CURRENT_BRANCH_IN_LR_WISE_DETAIL, false);
			final var	showBothIncomingAndOutgoing			= reportConfig.getBoolean(BookingSummaryDestinationWiseReportPropertiesConstant.SHOW_BOTH_INCOMING_AND_OUTGOING, false);
			final var	showDeliveryAtInLrWiseDetail		= reportConfig.getBoolean(BookingSummaryDestinationWiseReportPropertiesConstant.SHOW_DELIVERY_AT_IN_LR_WISE_DETAIL, false);
			final var	showSourceColumnInLrWiseDetail		= reportConfig.getBoolean(BookingSummaryDestinationWiseReportPropertiesConstant.SHOW_SOURCE_COLUMN_IN_LR_WISE_DETAIL, false);
			final var	showDestinationColumnInLrWiseDetail	= reportConfig.getBoolean(BookingSummaryDestinationWiseReportPropertiesConstant.SHOW_DEATINATION_COLUMN_IN_LR_WISE_DETAIL, false);
			final var	showBookingChargesInLrWiseDetail	= reportConfig.getBoolean(BookingSummaryDestinationWiseReportPropertiesConstant.SHOW_BOOKING_CHARGES_IN_LR_WISE_DETAIL, false);
			final var   showBillingBranchSubregionInLRWiseDetails = reportConfig.getBoolean(BookingSummaryDestinationWiseReportPropertiesConstant.SHOW_BILLING_BRANCH_SUB_REGION_IN_LR_WISE_DETAIL, false);
			final var   showToPayFreightColumn 				= reportConfig.getBoolean(BookingSummaryDestinationWiseReportPropertiesConstant.SHOW_TO_PAY_FREIGHT_COLUMN, false);
			final var   showOtherChargeInBranchWiseSummary	= reportConfig.getBoolean(BookingSummaryDestinationWiseReportPropertiesConstant.SHOW_OTHER_CHARGE_IN_BRANCH_WISE_SUMMARY, false);

			final var	tosubRegionId 	= JSPUtility.GetLong(request, "tosubRegion", 0);
			final var	tobranchId 		= JSPUtility.GetLong(request, "tobranch", 0);

			valueObjectIn.put(Executive.EXECUTIVE, executive);
			valueObjectIn.put("execFldPermissionsHM", cacheManip.getExecutiveFieldPermission(request));
			valueObjectIn.put("isAmountZero", isAmountZero);
			valueObjectIn.put("reportType", reportType);
			valueObjectIn.put(BookingSummaryDestinationWiseReportPropertiesConstant.IS_ASSIGNED_LOCATIONS_NEED_TO_SHOW, reportConfig.getBoolean(BookingSummaryDestinationWiseReportPropertiesConstant.IS_ASSIGNED_LOCATIONS_NEED_TO_SHOW, false));

			if(type > 0 && reportType > 0) {
				ActionStaticUtil.executiveTypeWiseBranches(request, cacheManip, executive);

				var	branchIds	= ActionStaticUtil.getBranchIdsWithAssignedLocation(request, cacheManip, executive);

				if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN || executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_REGIONADMIN || executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_SUBREGIONADMIN)
					branchId = JSPUtility.GetLong(request, "branch", 0);
				else
					branchId = executive.getBranchId();

				if(branchIds == null)
					branchIds	= Long.toString(branchId);

				request.setAttribute("agentName", executive.getName());

				request.setAttribute("destsubRegionForGroup", cacheManip.getSubRegionsByGroupId(request, executive.getAccountGroupId()));
				request.setAttribute("destsubRegionBranches", cacheManip.getPhysicalBranchesBySubRegionId(request, executive.getAccountGroupId(), tosubRegionId));

				if(tosubRegionId > 0 && tobranchId <= 0)
					destBranchIds = cacheManip.getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_SUBREGION, tosubRegionId);
				else if(tosubRegionId > 0 && tobranchId > 0) {
					destAssignedLocationIdList = cacheManip.getAssignedLocationsIdListByLocationIdId(request, tobranchId, executive.getAccountGroupId());

					if(!destAssignedLocationIdList.contains(tobranchId))
						destAssignedLocationIdList.add(tobranchId);

					destBranchIds = CollectionUtility.getStringFromLongList(destAssignedLocationIdList);
				} else if(tobranchId > 0)
					destBranchIds = Long.toString(tobranchId);

				whereClauseIn.add("wb.AccountGroupId = " + executive.getAccountGroupId());
				whereClauseIn.add("AND wb.BookingDateTimeStamp >= '" + fromDate + "'");
				whereClauseIn.add("AND wb.BookingDateTimeStamp <= '" + toDate + "'");
				whereClauseIn.add("AND dwb.WayBillId IS NULL");

				if(wayBillType > 0)
					whereClauseIn.add("AND wb.WayBillTypeId = " + wayBillType);
				else
					whereClauseIn.add("AND wb.WayBillTypeId <> 3");

				whereClauseOut.add("wb.AccountGroupId = " + executive.getAccountGroupId());
				whereClauseOut.add("AND wb.BookingDateTimeStamp >= '" + fromDate + "'");
				whereClauseOut.add("AND wb.BookingDateTimeStamp <= '" + toDate + "'");

				if(wayBillType > 0)
					whereClauseOut.add("AND wb.WayBillTypeId = " + wayBillType);
				else
					whereClauseOut.add("AND wb.WayBillTypeId <> 3");

				whereClauseOut.add("AND dwb.WayBillId IS NULL");

				if(reportType == BookingSummaryDestinationWiseReportModel.BOOKINGSUMMARY_DESTINATIONWISE_BOTH) {
					inComing	= true;
					outGoing	= true;
				} else if(reportType == BookingSummaryDestinationWiseReportModel.BOOKINGSUMMARY_DESTINATIONWISE_INCOMING)
					inComing	= true;
				else
					outGoing	= true;

				if(inComing) {
					if(StringUtils.isNotEmpty(destBranchIds))
						whereClauseIn.add("AND wb.SourceBranchId IN(" + destBranchIds + ")");

					if(StringUtils.isNotEmpty(branchIds))
						whereClauseIn.add("AND wb.DestinationBranchId IN(" + branchIds + ")");

					reportListIncoming 	= BookingSummaryDestinationWiseReportDaoImpl.getInstance().getBookingDetailsFromWayBillAndWayBillHistory(whereClauseIn.toString());
				}

				if(outGoing) {
					if(StringUtils.isNotEmpty(branchIds))
						whereClauseOut.add("AND wb.SourceBranchId IN(" + branchIds + ")");

					if(StringUtils.isNotEmpty(destBranchIds))
						whereClauseOut.add("AND wb.DestinationBranchId IN(" + destBranchIds + ")");
					
					reportListOutgoing 	= BookingSummaryDestinationWiseReportDaoImpl.getInstance().getBookingDetailsFromWayBillAndWayBillHistory(whereClauseOut.toString());
				}

				request.setAttribute("locationMappingList", cacheManip.getAssignedLocationsByLocationIdId(request, branchId, executive.getAccountGroupId()));
				request.setAttribute("locationId", locationId);

				if(ObjectUtils.isEmpty(reportListOutgoing) && ObjectUtils.isEmpty(reportListIncoming)) {
					error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
					error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
					request.setAttribute("cargoError", error);
				} else {
					if(ObjectUtils.isNotEmpty(reportListOutgoing))
						setOutgoingData(request, reportListOutgoing, valueObjectIn, displayDataConfig, cacheManip);

					if(ObjectUtils.isNotEmpty(reportListIncoming))
						setIncomingData(request, reportListIncoming, valueObjectIn, displayDataConfig, cacheManip);

					getColspanSize(request, reportConfig);

					request.setAttribute("detailsTypeName", BookingSummaryDestinationWiseReportModel.getDetailsTypeName(reportType));
					request.setAttribute(BookingSummaryDestinationWiseReportPropertiesConstant.SHOW_BOOKING_CHARGES_IN_LR_WISE_DETAIL, showBookingChargesInLrWiseDetail);
					request.setAttribute("showConsignorColumnInLrWiseDetail", showConsignorColumnInLrWiseDetail);
					request.setAttribute("showConsigneeColumnInLrWiseDetail", showConsigneeColumnInLrWiseDetail);
					request.setAttribute("showDeliveryAtInLrWiseDetail", showDeliveryAtInLrWiseDetail);
					request.setAttribute("showDeliveryTimeTBBInLrWiseDetail", reportConfig.getBoolean(BookingSummaryDestinationWiseReportPropertiesConstant.SHOW_DELIVERY_TIME_TBB_IN_LR_WISE_DETAILS, false));
					request.setAttribute(BookingSummaryDestinationWiseReportPropertiesConstant.SHOW_STAX_COLUMN_IN_LR_WISE_DETAIL, reportConfig.getBoolean(BookingSummaryDestinationWiseReportPropertiesConstant.SHOW_STAX_COLUMN_IN_LR_WISE_DETAIL, false));
					request.setAttribute(BookingSummaryDestinationWiseReportPropertiesConstant.SHOW_LS_NO_COLUMN_IN_LR_WISE_DETAIL, reportConfig.getBoolean(BookingSummaryDestinationWiseReportPropertiesConstant.SHOW_LS_NO_COLUMN_IN_LR_WISE_DETAIL, false));
					request.setAttribute(BookingSummaryDestinationWiseReportPropertiesConstant.SHOW_CR_NO_COLUMN_IN_LR_WISE_DETAIL, reportConfig.getBoolean(BookingSummaryDestinationWiseReportPropertiesConstant.SHOW_CR_NO_COLUMN_IN_LR_WISE_DETAIL, false));
					request.setAttribute("showCurrentStatusInLrWiseDetail", showCurrentStatusInLrWiseDetail);
					request.setAttribute("showCurrentBranchInLrWiseDetail", showCurrentBranchInLrWiseDetail);
					request.setAttribute("showBothIncomingAndOutgoing", showBothIncomingAndOutgoing);
					request.setAttribute("showSourceColumnInLrWiseDetail", showSourceColumnInLrWiseDetail);
					request.setAttribute("showDestinationColumnInLrWiseDetail", showDestinationColumnInLrWiseDetail);
					request.setAttribute(BookingSummaryDestinationWiseReportPropertiesConstant.SHOW_BILLING_BRANCH_SUB_REGION_IN_LR_WISE_DETAIL, showBillingBranchSubregionInLRWiseDetails);
					request.setAttribute("type", type);
					request.setAttribute("showToPayFreightColumn", showToPayFreightColumn);
					request.setAttribute(BookingSummaryDestinationWiseReportPropertiesConstant.SHOW_OTHER_CHARGE_IN_BRANCH_WISE_SUMMARY, showOtherChargeInBranchWiseSummary);
					request.setAttribute(BookingSummaryDestinationWiseReportPropertiesConstant.SHOW_TUR_NUMBER, reportConfig.getBoolean(BookingSummaryDestinationWiseReportPropertiesConstant.SHOW_TUR_NUMBER, false));
					request.setAttribute(BookingSummaryDestinationWiseReportPropertiesConstant.SHOW_RECEIVE_BRANCH_NAME, reportConfig.getBoolean(BookingSummaryDestinationWiseReportPropertiesConstant.SHOW_RECEIVE_BRANCH_NAME, false));

				}
			} else {
				error.put("errorCode", CargoErrorList.REPORT_TYPE_MISSING);
				error.put("errorDescription", CargoErrorList.REPORT_TYPE_MISSING_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}

			ActionStaticUtil.setRequestAttribute(request,"customAddressBranchId", branchId);
			ActionStaticUtil.setRequestAttribute(request,"customAddressIdentifer", CustomGroupMapper.IDENTIFIER_BOOKING);
			ActionStaticUtil.setReportViewModel(request);
			request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			e.printStackTrace();
			ActionStepsUtil.catchActionException(request, e, error);
		}
	}

	private void setOutgoingData(final HttpServletRequest request, List<BookingSummaryDestinationWiseReportModel>	reportList,
			final ValueObject valueObjectIn, final ValueObject displayDataConfig, final CacheManip cacheManip) throws Exception {
		Map<String, Map<String, BookingSummaryDestinationWiseReportModel>>		summarySubRegionWiseHM				= null;
		Map<Long, Boolean> 														lrTypeWiseZeroAmtHM					= null;

		try {
			final var	type		= Short.parseShort(request.getParameter("type"));
			final var	executive	= (Executive) valueObjectIn.get(Executive.EXECUTIVE);

			final var isAmountZero	= valueObjectIn.getBoolean("isAmountZero");
			final var isAssignedLocationsNeedToShow	= valueObjectIn.getBoolean(BookingSummaryDestinationWiseReportPropertiesConstant.IS_ASSIGNED_LOCATIONS_NEED_TO_SHOW, false);

			reportList	= reportList.stream().filter(e -> e.getStatus() != WayBillStatusConstant.WAYBILL_STATUS_CANCELLED
					&& e.getSourceBranchId() > 0 && e.getDestinationBranchId() > 0).collect(CollectionUtility.getList());

			if(reportList.isEmpty())
				return;

			final Map<Long, Map<Long, Double>>	wayBillWiseChargeAmountHM	= reportList.stream()
					.collect(Collectors.groupingBy(BookingSummaryDestinationWiseReportModel::getWayBillId,
							Collectors.toMap(BookingSummaryDestinationWiseReportModel::getWayBillChargeMasterId, BookingSummaryDestinationWiseReportModel::getChargeAmount, (e1, e2) -> e2)));

			final Map<Long, String>	wayBillBookingChargeNameHM	= reportList.stream()
					.filter(e -> e.getChargeDisplayName() != null)
					.collect(Collectors.toMap(BookingSummaryDestinationWiseReportModel::getWayBillChargeMasterId, BookingSummaryDestinationWiseReportModel::getChargeDisplayName, (e1, e2) -> e2));

			final Map<Long, BookingSummaryDestinationWiseReportModel>	lrWiseDataHM		= reportList.stream().collect(Collectors.toMap(BookingSummaryDestinationWiseReportModel::getWayBillId, Function.identity(), (e1, e2) -> e1));
			final Map<Long, Map<Long, BookingSummaryDestinationWiseReportModel>>	consignmentFilHM	= reportList.stream().collect(Collectors.groupingBy(BookingSummaryDestinationWiseReportModel::getWayBillId,
					Collectors.toMap(BookingSummaryDestinationWiseReportModel::getConsignmentDetailsId, Function.identity(), (e1, e2) -> e1)));

			if(isAmountZero) {
				final Set<Long>	wayBillTypeIdList	= reportList.stream().filter(e -> e.getWayBillTypeId() > 0).map(BookingSummaryDestinationWiseReportModel::getWayBillTypeId).collect(Collectors.toSet());
				lrTypeWiseZeroAmtHM	= DisplayDataConfigurationBll.lrTypeWiseZeroAmountHM(displayDataConfig, valueObjectIn, wayBillTypeIdList);
			}

			for(final Map.Entry<Long, BookingSummaryDestinationWiseReportModel> entry : lrWiseDataHM.entrySet()) {
				final var finalModel	= entry.getValue();

				final var 	sourceBranch		= (Branch) branches.get(Long.toString(finalModel.getSourceBranchId()));
				final var 	srcSubRegion		= (SubRegion) subRegions.get(sourceBranch.getSubRegionId());
				var 		destinationBranch	= (Branch) branches.get(Long.toString(finalModel.getDestinationBranchId()));
				final var billingBranch		= (Branch) branches.get(Long.toString(finalModel.getBillingBranchId()));
				SubRegion 	destSubRegion		= null;

				if(isAssignedLocationsNeedToShow)
					destSubRegion		= (SubRegion) subRegions.get(destinationBranch.getSubRegionId());

				var branchIdForMap	= 0L;

				if(destinationBranch != null && destinationBranch.getTypeOfLocation() == Branch.TYPE_OF_LOCATION_OPERATIONAL_PLACE) {
					final var locationsMapping = cacheManip.getActiveLocationMapping(request, executive.getAccountGroupId(), destinationBranch.getBranchId());

					if(locationsMapping != null)
						branchIdForMap = locationsMapping.getLocationId();
				} else if(destinationBranch != null)
					branchIdForMap = destinationBranch.getBranchId();

				if(branchIdForMap > 0)
					destinationBranch		= (Branch) branches.get(Long.toString(branchIdForMap));

				setBranchDetails(sourceBranch, srcSubRegion, destinationBranch, destSubRegion, finalModel, billingBranch);

				finalModel.setNoOfLR(1);

				setZeroAmount(finalModel, lrTypeWiseZeroAmtHM, wayBillWiseChargeAmountHM);

				finalModel.setNoOfPkgs(finalModel.getQuantity());
				
				final var turBranch			= (Branch) branches.get(Long.toString(finalModel.getTurBranchId()));
				finalModel.setTurBranchName(turBranch == null ? "--" : turBranch.getName());

				if(type == BookingSummaryDestinationWiseReportModel.BOOKINGSUMMARY_DESTINATIONWISE_TYPE_DETAIL_ID)
					setLRWiseSummary(finalModel, consignmentFilHM);
			}
			
			reportList.clear();
			reportList.addAll(lrWiseDataHM.values());

			if(type == BookingSummaryDestinationWiseReportModel.BOOKINGSUMMARY_DESTINATIONWISE_TYPE_SUMMARY_ID) {
				final Comparator<BookingSummaryDestinationWiseReportModel> compareByName = Comparator
						.comparing(BookingSummaryDestinationWiseReportModel::getDestinationSubRegionName)
						.thenComparing(BookingSummaryDestinationWiseReportModel::getDestinationBranch);

				reportList	= reportList.stream().sorted(compareByName).collect(CollectionUtility.getList());
			} else
				reportList	= allowCustomSorting(reportList);

			Map<String, Map<String, List<BookingSummaryDestinationWiseReportModel>>>	subRegionWiseLRData	= reportList.stream().collect(Collectors.groupingBy(BookingSummaryDestinationWiseReportModel::getDestSubRegionNameWithId,
					Collectors.groupingBy(BookingSummaryDestinationWiseReportModel::getDestinationBranch, LinkedHashMap::new, CollectionUtility.getList())));
			subRegionWiseLRData	= CollectionUtility.sortMapByKeys(subRegionWiseLRData);

			final List<BookingSummaryDestinationWiseReportModel> 	bookList = new ArrayList<>();

			/*
			 * Copying one list to another list
			 * without affecting in original list
			 * while changing something in new list object
			 */
			reportList.forEach((final BookingSummaryDestinationWiseReportModel source) -> {
				final var target = new BookingSummaryDestinationWiseReportModel();
				BeanUtils.copyProperties(source, target);
				bookList.add(target);
			});

			final Map<String, BookingSummaryDestinationWiseReportModel>	destSubRegionWiseSummary	= bookList.stream()
					.collect(Collectors.toMap(BookingSummaryDestinationWiseReportModel::getDestSubRegionNameWithId, Function.identity(), (v1, v2) -> v1 = mergeDestinationSubRegionWise(v1, v2), LinkedHashMap::new));

			if(type == BookingSummaryDestinationWiseReportModel.BOOKINGSUMMARY_DESTINATIONWISE_TYPE_SUMMARY_ID) {
				summarySubRegionWiseHM	= reportList.stream()
						.collect(Collectors.groupingBy(BookingSummaryDestinationWiseReportModel::getDestSubRegionNameWithId, Collectors.toMap(BookingSummaryDestinationWiseReportModel::getDestBranchNameWithId, Function.identity(), (v1, v2) -> v1 = mergeDestinationSubRegionWise(v1, v2), LinkedHashMap::new)));
				summarySubRegionWiseHM	= CollectionUtility.sortMapByKeys(summarySubRegionWiseHM);
			}

			final Map<String, BookingSummaryDestinationWiseReportModel>	wayBillWiseChargeDetailsHM = reportList.stream()
					.collect(Collectors.toMap(BookingSummaryDestinationWiseReportModel::getDestSubRegionNameWithId, Function.identity(), (e1, e2) -> e1));

			final Map<Long, Double>	wayBillTotalBookingChargeAmtHM	= wayBillWiseChargeDetailsHM.values().stream()
					.collect(Collectors.groupingBy(BookingSummaryDestinationWiseReportModel::getWayBillChargeMasterId,
							Collectors.reducing(0.0, BookingSummaryDestinationWiseReportModel::getChargeAmount, Double::sum)));

			request.setAttribute("subRegionWiseData", subRegionWiseLRData);
			request.setAttribute("summarySubRegionWiseHM", summarySubRegionWiseHM);
			request.setAttribute("subRegionWiseSummary", destSubRegionWiseSummary);
			request.setAttribute("wayBillBookingChargeName", wayBillBookingChargeNameHM);
			request.setAttribute("wayBillTotalBookingChargeAmt", wayBillTotalBookingChargeAmtHM);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, null);
		}
	}

	private List<BookingSummaryDestinationWiseReportModel> allowCustomSorting(final List<BookingSummaryDestinationWiseReportModel> reportList) throws Exception {
		try {
			final Comparator<BookingSummaryDestinationWiseReportModel> compareByName = Comparator
					.comparing(BookingSummaryDestinationWiseReportModel::getDestinationSubRegionName)
					.thenComparing(BookingSummaryDestinationWiseReportModel::getDestinationBranch)
					.thenComparing(BookingSummaryDestinationWiseReportModel::getIsManual)
					.thenComparing(BookingSummaryDestinationWiseReportModel::getWayBillBranchCode)
					.thenComparing(BookingSummaryDestinationWiseReportModel::getWayBillNumberWithoutBranchCode);

			return reportList.stream().sorted(compareByName).collect(CollectionUtility.getList());
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, BookingSummaryDestinationWiseReportAction.class.getName());
		}
	}

	private List<BookingSummaryDestinationWiseReportModel> allowCustomIncomingSorting(final List<BookingSummaryDestinationWiseReportModel> reportList) throws Exception {
		try {
			final Comparator<BookingSummaryDestinationWiseReportModel> compareByName = Comparator
					.comparing(BookingSummaryDestinationWiseReportModel::getSourceSubRegionName)
					.thenComparing(BookingSummaryDestinationWiseReportModel::getSourceBranch)
					.thenComparing(BookingSummaryDestinationWiseReportModel::getIsManual)
					.thenComparing(BookingSummaryDestinationWiseReportModel::getWayBillBranchCode)
					.thenComparing(BookingSummaryDestinationWiseReportModel::getWayBillNumberWithoutBranchCode);

			return reportList.stream().sorted(compareByName).collect(CollectionUtility.getList());
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, BookingSummaryDestinationWiseReportAction.class.getName());
		}
	}

	private void setLRWiseSummary(final BookingSummaryDestinationWiseReportModel finalModel, final Map<Long, Map<Long, BookingSummaryDestinationWiseReportModel>> consignmentFilHM) {
		try {
			final var	consignmentHM	= consignmentFilHM.get(finalModel.getWayBillId());

			final var packingStr = new StringJoiner(" / ");

			for(final Map.Entry<Long, BookingSummaryDestinationWiseReportModel> entry1 : consignmentHM.entrySet()) {
				final var	boModel = entry1.getValue();

				final var packingTypeMaster = (PackingTypeMaster) packingTypeMasterData.get(boModel.getPackingTypeMasterId());

				packingStr.add(packingTypeMaster != null ? packingTypeMaster.getName() : "");
			}

			if(finalModel.getCurrentStatus() > 0) {
				finalModel.setStatus(finalModel.getCurrentStatus());
				finalModel.setStatusStr(WayBill.getStatus(finalModel.getCurrentStatus()));

				final var branch = (Branch) branches.get(Long.toString(finalModel.getCurrentBranchId()));

				finalModel.setCurrentBranch(branch != null ? branch.getName() : "--");
			}

			finalModel.setWayBillType(WayBillType.getWayBillTypeShortNameByWayBilTypeId(finalModel.getWayBillTypeId()));
			finalModel.setDeliveryAt(InfoForDeliveryConstant.getInfoForDelivery(finalModel.getDeliveryTo()));
			finalModel.setConsignerName(Utility.checkedNullCondition(finalModel.getConsignerName(), (short) 2));
			finalModel.setConsigneeName(Utility.checkedNullCondition(finalModel.getConsigneeName(), (short) 2));
			finalModel.setCrNumber(Utility.checkedNullCondition(finalModel.getCrNumber(), (short) 1));
			finalModel.setLsNumber(Utility.checkedNullCondition(finalModel.getLsNumber(), (short) 1));
			finalModel.setPackages(packingStr.toString());
			finalModel.setSaidToContain(consignmentHM.values().stream().filter(e -> e.getSaidToContain() != null).map(BookingSummaryDestinationWiseReportModel::getSaidToContain).collect(Collectors.joining(" / ")));

			setLRNumberWithoutBranchCode(finalModel);

			finalModel.setCreationDateTimeStampStr(DateTimeUtility.getDateFromTimeStamp(finalModel.getCreationDateTimeStamp()));
		} catch (final Exception e) {
			ExceptionProcess.execute(e, BookingSummaryDestinationWiseReportAction.class.getName());
		}
	}

	private void setLRNumberWithoutBranchCode(final BookingSummaryDestinationWiseReportModel finalModel) {
		try {
			final var 	pair	= SplitLRNumber.getNumbers(finalModel.getWayBillNumber());

			finalModel.setWayBillBranchCode(pair.getBranchCode() instanceof String ? pair.getBranchCode().toString() : "");
			finalModel.setWayBillNumberWithoutBranchCode(pair.getLrNumber() instanceof Long ? (long) pair.getLrNumber() : 0);
		} catch (final Exception e) {
			finalModel.setWayBillBranchCode(finalModel.getWayBillNumber());
			finalModel.setWayBillNumberWithoutBranchCode(0L);
		}
	}

	public static BookingSummaryDestinationWiseReportModel mergeDestinationSubRegionWise(final BookingSummaryDestinationWiseReportModel first, final BookingSummaryDestinationWiseReportModel second) {
		first.setNoOfPkgs(first.getNoOfPkgs() + second.getNoOfPkgs());
		first.setPaidAmout(first.getPaidAmout() + second.getPaidAmout());
		first.setTopayAmount(first.getTopayAmount() + second.getTopayAmount());
		first.setCreditAmount(first.getCreditAmount() + second.getCreditAmount());
		first.setActualWeight(first.getActualWeight() + second.getActualWeight());
		first.setGrandTotal(first.getGrandTotal() + second.getGrandTotal());
		first.setServiceTax(first.getServiceTax() + second.getServiceTax());
		first.setNoOfLR(first.getNoOfLR() + second.getNoOfLR());
		first.setToPayFreight(Optional.ofNullable(first.getToPayFreight()).orElse(0.0) + Optional.ofNullable(second.getToPayFreight()).orElse(0.0));
		first.setOtherCharge(Optional.ofNullable(first.getOtherCharge()).orElse(0.0) + Optional.ofNullable(second.getOtherCharge()).orElse(0.0));

		return first;
	}

	private void setIncomingData(final HttpServletRequest request, List<BookingSummaryDestinationWiseReportModel>	reportList,
			final ValueObject valueObjectIn, final ValueObject displayDataConfig, final CacheManip cacheManip) throws Exception {
		Map<String, Map<String, BookingSummaryDestinationWiseReportModel>>		summarySubRegionWiseHMIncoming		= null;
		Map<Long, Boolean> 														lrTypeWiseZeroAmtHM					= null;

		try {
			final var	type		= Short.parseShort(request.getParameter("type"));
			final var	executive	= (Executive) valueObjectIn.get(Executive.EXECUTIVE);

			final var isAmountZero	= valueObjectIn.getBoolean("isAmountZero");
			final var isAssignedLocationsNeedToShow	= valueObjectIn.getBoolean(BookingSummaryDestinationWiseReportPropertiesConstant.IS_ASSIGNED_LOCATIONS_NEED_TO_SHOW, false);

			reportList	= reportList.stream().filter(e -> e.getStatus() != WayBillStatusConstant.WAYBILL_STATUS_CANCELLED
					&& e.getSourceBranchId() > 0 && e.getDestinationBranchId() > 0).collect(CollectionUtility.getList());

			if(reportList.isEmpty())
				return;

			final Map<Long, Map<Long, Double>>	wayBillWiseChargeAmountHM	= reportList.stream()
					.collect(Collectors.groupingBy(BookingSummaryDestinationWiseReportModel::getWayBillId,
							Collectors.toMap(BookingSummaryDestinationWiseReportModel::getWayBillChargeMasterId, BookingSummaryDestinationWiseReportModel::getChargeAmount, (e1, e2) -> e2)));

			final Map<Long, String>	wayBillBookingChargeNameHM	= reportList.stream()
					.filter(e -> e.getChargeDisplayName() != null)
					.collect(Collectors.toMap(BookingSummaryDestinationWiseReportModel::getWayBillChargeMasterId, BookingSummaryDestinationWiseReportModel::getChargeDisplayName, (e1, e2) -> e2));

			final Map<Long, BookingSummaryDestinationWiseReportModel>	lrWiseDataHM		= reportList.stream().collect(Collectors.toMap(BookingSummaryDestinationWiseReportModel::getWayBillId, Function.identity(), (e1, e2) -> e2));
			final Map<Long, Map<Long, BookingSummaryDestinationWiseReportModel>>	consignmentFilHM	= reportList.stream().collect(Collectors.groupingBy(BookingSummaryDestinationWiseReportModel::getWayBillId,
					Collectors.toMap(BookingSummaryDestinationWiseReportModel::getConsignmentDetailsId, Function.identity(), (e1, e2) -> e1)));

			if(isAmountZero) {
				final Set<Long>	wayBillTypeIdList	= reportList.stream().filter(e -> e.getWayBillTypeId() > 0).map(BookingSummaryDestinationWiseReportModel::getWayBillTypeId).collect(Collectors.toSet());
				lrTypeWiseZeroAmtHM	= DisplayDataConfigurationBll.lrTypeWiseZeroAmountHM(displayDataConfig, valueObjectIn, wayBillTypeIdList);
			}

			for(final Map.Entry<Long, BookingSummaryDestinationWiseReportModel> entry : lrWiseDataHM.entrySet()) {
				final var finalModel	= entry.getValue();

				var 			sourceBranch		= (Branch) branches.get(Long.toString(finalModel.getSourceBranchId()));
				SubRegion 		srcSubRegion		= null;

				if(isAssignedLocationsNeedToShow)
					srcSubRegion		= (SubRegion) subRegions.get(sourceBranch.getSubRegionId());

				final var destinationBranch	= (Branch) branches.get(Long.toString(finalModel.getDestinationBranchId()));
				final var destSubRegion		= (SubRegion) subRegions.get(destinationBranch.getSubRegionId());
				final var billingBranch		= (Branch) branches.get(Long.toString(finalModel.getBillingBranchId()));

				final var turBranch			= (Branch) branches.get(Long.toString(finalModel.getTurBranchId()));
				finalModel.setTurBranchName(turBranch == null ? "--" : turBranch.getName());

				var branchIdForMap	= 0L;

				if(sourceBranch != null && sourceBranch.getTypeOfLocation() == Branch.TYPE_OF_LOCATION_OPERATIONAL_PLACE) {
					final var locationsMapping = cacheManip.getActiveLocationMapping(request, executive.getAccountGroupId(), sourceBranch.getBranchId());

					if(locationsMapping != null)
						branchIdForMap = locationsMapping.getLocationId();
				} else if(sourceBranch != null)
					branchIdForMap = sourceBranch.getBranchId();

				if(branchIdForMap > 0)
					sourceBranch	= (Branch) branches.get(Long.toString(branchIdForMap));

				setBranchDetails(sourceBranch, srcSubRegion, destinationBranch, destSubRegion, finalModel, billingBranch);

				finalModel.setNoOfLR(1);

				setZeroAmount(finalModel, lrTypeWiseZeroAmtHM, wayBillWiseChargeAmountHM);

				finalModel.setNoOfPkgs(finalModel.getQuantity());

				if(type == BookingSummaryDestinationWiseReportModel.BOOKINGSUMMARY_DESTINATIONWISE_TYPE_DETAIL_ID)
					setLRWiseSummary(finalModel, consignmentFilHM);
			}

			reportList.clear();
			reportList.addAll(lrWiseDataHM.values());

			if(type == BookingSummaryDestinationWiseReportModel.BOOKINGSUMMARY_DESTINATIONWISE_TYPE_SUMMARY_ID) {
				final Comparator<BookingSummaryDestinationWiseReportModel> compareByName = Comparator
						.comparing(BookingSummaryDestinationWiseReportModel::getSourceSubRegionName)
						.thenComparing(BookingSummaryDestinationWiseReportModel::getSourceBranch);

				reportList	= reportList.stream().sorted(compareByName).collect(CollectionUtility.getList());
			} else
				reportList	= allowCustomIncomingSorting(reportList);

			Map<String, Map<String, List<BookingSummaryDestinationWiseReportModel>>>	subRegionWiseDataIncoming	= reportList.stream().collect(Collectors.groupingBy(BookingSummaryDestinationWiseReportModel::getSourceSubRegionName,
					Collectors.groupingBy(BookingSummaryDestinationWiseReportModel::getSourceBranch, TreeMap::new, CollectionUtility.getList())));

			subRegionWiseDataIncoming	= CollectionUtility.sortMapByKeys(subRegionWiseDataIncoming);

			final List<BookingSummaryDestinationWiseReportModel> 	bookList = new ArrayList<>();

			/*
			 * Copying one list to another list
			 * without affecting in original list
			 * while changing something in new list object
			 */
			reportList.forEach((final BookingSummaryDestinationWiseReportModel source) -> {
				final var target = new BookingSummaryDestinationWiseReportModel();
				BeanUtils.copyProperties(source, target);
				bookList.add(target);
			});

			final Map<String, BookingSummaryDestinationWiseReportModel>	subRegionWiseSummaryIncoming	= bookList.stream()
					.collect(Collectors.toMap(BookingSummaryDestinationWiseReportModel::getSourceSubRegionNameWithId, Function.identity(), (v1, v2) -> v1 = mergeDestinationSubRegionWise(v1, v2), LinkedHashMap::new));

			if(type == BookingSummaryDestinationWiseReportModel.BOOKINGSUMMARY_DESTINATIONWISE_TYPE_SUMMARY_ID) {
				summarySubRegionWiseHMIncoming		= reportList.stream()
						.collect(Collectors.groupingBy(BookingSummaryDestinationWiseReportModel::getSourceSubRegionNameWithId, Collectors.toMap(BookingSummaryDestinationWiseReportModel::getSourceBranchNameWithId, Function.identity(), (v1, v2) -> v1 = mergeDestinationSubRegionWise(v1, v2), LinkedHashMap::new)));
				summarySubRegionWiseHMIncoming		= CollectionUtility.sortMapByKeys(summarySubRegionWiseHMIncoming);
			}

			final Map<String, BookingSummaryDestinationWiseReportModel>	wayBillWiseChargeDetailsHM = reportList.stream()
					.collect(Collectors.toMap(BookingSummaryDestinationWiseReportModel::getSourceSubRegionNameWithId, Function.identity(), (e1, e2) -> e1));

			final Map<Long, Double>	wayBillTotalBookingChargeAmtHM	= wayBillWiseChargeDetailsHM.values().stream()
					.collect(Collectors.groupingBy(BookingSummaryDestinationWiseReportModel::getWayBillChargeMasterId,
							Collectors.reducing(0.0, BookingSummaryDestinationWiseReportModel::getChargeAmount, Double::sum)));

			request.setAttribute("subRegionWiseDataIncoming", subRegionWiseDataIncoming);
			request.setAttribute("summarySubRegionWiseHMIncoming", summarySubRegionWiseHMIncoming);
			request.setAttribute("subRegionWiseSummaryIncoming", subRegionWiseSummaryIncoming);
			request.setAttribute("wayBillBookingChargeNameIncoming", wayBillBookingChargeNameHM);
			request.setAttribute("wayBillTotalBookingChargeAmtIncoming", wayBillTotalBookingChargeAmtHM);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private void setBranchDetails(final Branch sourceBranch, SubRegion srcSubRegion, final Branch destinationBranch, SubRegion destSubregion, final BookingSummaryDestinationWiseReportModel finalModel, final Branch billingBranch) {
		try {
			SubRegion  billingBranchSubregion	= null;

			if(srcSubRegion == null)
				srcSubRegion		= (SubRegion) subRegions.get(sourceBranch.getSubRegionId());

			finalModel.setSourceBranch(sourceBranch.getName());
			finalModel.setSourceBranchId(sourceBranch.getBranchId());
			finalModel.setSourceSubRegionId(srcSubRegion.getSubRegionId());
			finalModel.setSourceSubRegionName(srcSubRegion.getName() != null ? srcSubRegion.getName() : "");

			if(destSubregion == null)
				destSubregion	= (SubRegion) subRegions.get(destinationBranch.getSubRegionId());

			finalModel.setDestinationBranchId(destinationBranch.getBranchId());
			finalModel.setDestinationBranch(destinationBranch.getName());
			finalModel.setDestinationSubRegionId(destSubregion.getSubRegionId());
			finalModel.setDestinationSubRegionName(destSubregion.getName() != null ? destSubregion.getName() : "");

			if(billingBranch != null && billingBranch.getSubRegionId() > 0) {
				billingBranchSubregion		= (SubRegion) subRegions.get(billingBranch.getSubRegionId());
				finalModel.setBillingBranchSubRegionId(billingBranchSubregion != null ? billingBranchSubregion.getSubRegionId() : 0);
				finalModel.setBillingBranchSubRegionName(billingBranchSubregion != null ? billingBranchSubregion.getName() : "");
			} else
				finalModel.setBillingBranchSubRegionName("");

		} catch (final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private void setZeroAmount(final BookingSummaryDestinationWiseReportModel finalModel, final Map<Long, Boolean> lrTypeWiseZeroAmtHM, final Map<Long, Map<Long, Double>> wayBillWiseChargeAmountHM) {
		try {
			if(lrTypeWiseZeroAmtHM != null && lrTypeWiseZeroAmtHM.get(finalModel.getWayBillTypeId())) {
				finalModel.setGrandTotal(0d);
				finalModel.setServiceTax(0d);
				finalModel.setPaidAmout(0d);
				finalModel.setTopayAmount(0d);
				finalModel.setCreditAmount(0d);
			} else {
				final var wayBillWiseChargeAmount = wayBillWiseChargeAmountHM.getOrDefault(finalModel.getWayBillId(), null);
				finalModel.setWayBillChargeAmountHM(wayBillWiseChargeAmount);

				if(ObjectUtils.isNotEmpty(wayBillWiseChargeAmount)) {
					if(finalModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY)
						finalModel.setToPayFreight(wayBillWiseChargeAmount.get((long) BookingChargeConstant.FREIGHT));
					
					finalModel.setOtherCharge(wayBillWiseChargeAmount.get((long) BookingChargeConstant.OTHER_BOOKING));
				}
			}
		} catch (final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	@SuppressWarnings("unchecked")
	private void getColspanSize(final HttpServletRequest request, final ValueObject reportConfig) {
		var 				colspan								= 10;
		var 				inColspan							= 10;
		var 				brWiseSumColSpan					= 11;
		var 				subWiseSumColSpan					= 9;

		try {
			if(reportConfig.getBoolean(BookingSummaryDestinationWiseReportPropertiesConstant.SHOW_DELIVERY_AT_IN_LR_WISE_DETAIL, false)) {
				++colspan;
				++inColspan;
			}

			if(reportConfig.getBoolean(BookingSummaryDestinationWiseReportPropertiesConstant.SHOW_SOURCE_COLUMN_IN_LR_WISE_DETAIL, false)) ++colspan;

			if(reportConfig.getBoolean(BookingSummaryDestinationWiseReportPropertiesConstant.SHOW_DEATINATION_COLUMN_IN_LR_WISE_DETAIL, false)) ++inColspan;

			if(reportConfig.getBoolean(BookingSummaryDestinationWiseReportPropertiesConstant.SHOW_CONSIGNOR_COLUMN_IN_LR_WISE_DETAIL, false)) {
				++colspan;
				++inColspan;
			}

			if(reportConfig.getBoolean(BookingSummaryDestinationWiseReportPropertiesConstant.SHOW_CONSIGNEE_COLUMN_IN_LR_WISE_DETAIL, false)) {
				++colspan;
				++inColspan;
			}

			if(reportConfig.getBoolean(BookingSummaryDestinationWiseReportPropertiesConstant.SHOW_CHRAGE_WEIGHT_COLUMN, false)) {
				++colspan;
				++inColspan;
				++brWiseSumColSpan;
				++subWiseSumColSpan;
			}

			if(reportConfig.getBoolean(BookingSummaryDestinationWiseReportPropertiesConstant.SHOW_TO_PAY_FREIGHT_COLUMN, false)) {
				++brWiseSumColSpan;
				++subWiseSumColSpan;
			}

			if(reportConfig.getBoolean(BookingSummaryDestinationWiseReportPropertiesConstant.SHOW_STAX_COLUMN_IN_LR_WISE_DETAIL, false)) {
				++colspan;
				++inColspan;
			}

			final var	wayBillBookingChargeNameHM			= (Map<Long, String>) request.getAttribute("wayBillBookingChargeName");
			final var	wayBillBookingChargeNameIncoming	= (Map<Long, String>) request.getAttribute("wayBillBookingChargeNameIncoming");

			if(reportConfig.getBoolean(BookingSummaryDestinationWiseReportPropertiesConstant.SHOW_BOOKING_CHARGES_IN_LR_WISE_DETAIL, false ) && wayBillBookingChargeNameHM != null)
				colspan += wayBillBookingChargeNameHM.size();

			if(reportConfig.getBoolean(BookingSummaryDestinationWiseReportPropertiesConstant.SHOW_BOOKING_CHARGES_IN_LR_WISE_DETAIL, false) && wayBillBookingChargeNameIncoming != null)
				inColspan += wayBillBookingChargeNameIncoming.size();

			if(reportConfig.getBoolean(BookingSummaryDestinationWiseReportPropertiesConstant.SHOW_LS_NO_COLUMN_IN_LR_WISE_DETAIL, false)) {
				++colspan;
				++inColspan;
			}

			if(reportConfig.getBoolean(BookingSummaryDestinationWiseReportPropertiesConstant.SHOW_CR_NO_COLUMN_IN_LR_WISE_DETAIL, false)) {
				++colspan;
				++inColspan;
			}

			if(reportConfig.getBoolean(BookingSummaryDestinationWiseReportPropertiesConstant.SHOW_CURRENT_STATUS_IN_LR_WISE_DETAIL, false)) {
				++colspan;
				++inColspan;
			}

			if(reportConfig.getBoolean(BookingSummaryDestinationWiseReportPropertiesConstant.SHOW_CURRENT_BRANCH_IN_LR_WISE_DETAIL, false)) {
				++colspan;
				++inColspan;
			}
			
			if(reportConfig.getBoolean(BookingSummaryDestinationWiseReportPropertiesConstant.SHOW_TUR_NUMBER, false)) {
				++colspan;
				++inColspan;
			}
			
			if(reportConfig.getBoolean(BookingSummaryDestinationWiseReportPropertiesConstant.SHOW_RECEIVE_BRANCH_NAME, false)) {
				++colspan;
				++inColspan;
			}

			request.setAttribute("colspan", colspan);
			request.setAttribute("inColspan", inColspan);
			request.setAttribute("brWiseSumColSpan", brWiseSumColSpan);
			request.setAttribute("subWiseSumColSpan", subWiseSumColSpan);
		} catch (final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
		}
	}
}