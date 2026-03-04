package com.ivcargo.reports;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.StringJoiner;
import java.util.TreeMap;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.ObjectUtils;
import org.apache.commons.lang3.StringUtils;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.dao.impl.DeliveryRunSheetLedgerDaoImpl;
import com.iv.dto.DeliveryRunSheetLedger;
import com.iv.dto.constant.ExecutiveTypeConstant;
import com.iv.dto.constant.FeildPermissionsConstant;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.dto.constant.VehicleOwnerConstant;
import com.iv.properties.constant.report.LhpvRegisterReportConfigurationConstant;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.constant.Constant;
import com.iv.utils.constant.DateTimeFormatConstant;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.exception.ExceptionProcess;
import com.iv.utils.utility.CollectionUtility;
import com.iv.utils.utility.ListFilterUtility;
import com.iv.utils.utility.MapUtils;
import com.iv.utils.utility.SortUtils;
import com.iv.utils.utility.SplitLRNumber;
import com.iv.utils.utility.Utility;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.BLHPVDao;
import com.platform.dao.DispatchLedgerDao;
import com.platform.dao.LHPVDao;
import com.platform.dao.LhpvChargesForGroupDao;
import com.platform.dao.LhpvSettlementChargesDao;
import com.platform.dto.BLHPV;
import com.platform.dto.Branch;
import com.platform.dto.DispatchLedger;
import com.platform.dto.Executive;
import com.platform.dto.LHPV;
import com.platform.dto.LHPVModel;
import com.platform.dto.LhpvChargeTypeMaster;
import com.platform.dto.LhpvChargesForGroup;
import com.platform.dto.SubRegion;
import com.platform.dto.TransportCommonMaster;
import com.platform.dto.VehicleNumberMaster;
import com.platform.dto.constant.LHPVConstant;
import com.platform.dto.model.LHPVCompanyDetails;
import com.platform.resource.CargoErrorList;

public class LHPVDetailsReportAction implements Action {

	private static final String TRACE_ID 					= "LHPVDetailsReportAction";
	ValueObject			branchesObj							= null;
	ValueObject			subRegionObj						= null;

	@Override
	@SuppressWarnings("unchecked")
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	 					error 								= null;
		String										branchesIds							= null;
		Map<Long, List<DispatchLedger>>				dispatchColl						= null;
		Branch										branch								= null;
		SubRegion 									subRegion							= null;
		LhpvChargesForGroup[]						lhpvChargesArr						= null;
		Map<Long, Map<Long, DeliveryRunSheetLedger>>	lhpvWiseDDMHM					= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeLHPVDetailsReportAction().execute(request, response);

			final Map<Long, Integer>	packgesPerLHPVId = new HashMap<>();
			final Map<Long, Double>		weightPerLHPVId = new HashMap<>();
			final Map<Long, Double>		lhpvFrtAmtHm = new HashMap<>();
			final Map<Long, Double>		lhpvBkgAmtHm = new HashMap<>();
			final Map<Long, Double>		lhpvChgWghtHm = new HashMap<>();
			final Map<Long, Double>		lhpvActualWghtHm = new HashMap<>();

			final var	fromDate	= DateTimeUtility.getStartOfDayTimeStamp(JSPUtility.GetString(request, "fromDate"));
			final var	toDate		= DateTimeUtility.getEndOfDayTimeStamp(JSPUtility.GetString(request, "toDate"));
			//toDate.setNanos(999000000);
			final var	cManip 			= new CacheManip(request);
			final var	executive		= cManip.getExecutive(request);
			branchesObj		= cManip.getGenericBranchesDetail(request);
			subRegionObj	= cManip.getAllSubRegions(request);

			final var	configuration					= ReadAllConfigurationsBllImpl.getInstance().getReportConfigurationData(ReportIdentifierConstant.LHPV_REGISTER_REPORT, executive.getAccountGroupId());
			final var	showExecutiveWiseLHPVHistory	= (boolean) configuration.getOrDefault(LhpvRegisterReportConfigurationConstant.SHOW_EXECUTIVE_WISE_LHPV_HISTORY,false);
			final var	exectiveIdsForLHPVHistory		= (String) configuration.getOrDefault(LhpvRegisterReportConfigurationConstant.EXECUTIVE_IDS_WISE_LHPV_HISTORY, null);

			final var	sortingByLhpvNumber							= (boolean) configuration.getOrDefault(LhpvRegisterReportConfigurationConstant.SORTING_BY_LHPV_NUMBER,false);
			final var	isShowAdvVoucherSettlementColumn			= (boolean) configuration.getOrDefault(LhpvRegisterReportConfigurationConstant.IS_SHOW_ADV_VOUCHER_SETTLEMENT_COLUMN,false);
			final var	showDifferentAmountOnNormalAndCrossingLrs	= (boolean) configuration.getOrDefault(LhpvRegisterReportConfigurationConstant.SHOW_DIFFERENT_AMOUNT_ON_NORMAL_AND_CROSSING_LRS, false);
			final var	isAllRegionNeedToShow						= (boolean) configuration.getOrDefault(LhpvRegisterReportConfigurationConstant.IS_ALL_REGION_NEED_TO_SHOW, false);
			final var	showBasicFreightAmountColumn				= (boolean) configuration.getOrDefault(LhpvRegisterReportConfigurationConstant.SHOW_BASIC_FREIGHT_AMOUNT_COLUMN, false);
			final var	showLSTotalColumn							= (boolean) configuration.getOrDefault(LhpvRegisterReportConfigurationConstant.SHOW_LS_TOTAL_COLUMN, false);
			final var	lhpvDateForSorting							= (boolean) configuration.getOrDefault(LhpvRegisterReportConfigurationConstant.LHPV_DATE_FOR_SORTING, false);
			final var	showLHPVWiseBookingTotalColumn				= (boolean) configuration.getOrDefault(LhpvRegisterReportConfigurationConstant.SHOW_LHPV_WISE_BOOKING_TOTAL_COLUMN, false);
			final var	showTruckAdvDateColumn						= (boolean) configuration.getOrDefault(LhpvRegisterReportConfigurationConstant.SHOW_TRUCK_ADV_DATE_COLUMN, false);
			final var	showAdditionalAdvDateColumn					= (boolean) configuration.getOrDefault(LhpvRegisterReportConfigurationConstant.SHOW_ADDITIONAL_ADV_DATE_COLUMN, false);
			final var	showAdditionalAdvPaymentTypeColumn			= (boolean) configuration.getOrDefault(LhpvRegisterReportConfigurationConstant.SHOW_ADDITIONAL_ADV_PAYMENT_TYPE_COLUMN, false);
			final var	showTruckAdvPaymentTypeColumn				= (boolean) configuration.getOrDefault(LhpvRegisterReportConfigurationConstant.SHOW_TRUCK_ADV_PAYMENT_TYPE_COLUMN, false);
			final var	renameColumnName							= (boolean) configuration.getOrDefault(LhpvRegisterReportConfigurationConstant.RENAME_COLUMN_NAME, false);
			final var 	showPaymentDetailsLink						= (boolean) configuration.getOrDefault(LhpvRegisterReportConfigurationConstant.SHOW_PAYMENT_DETAILS_LINK, false);
			final var	allowReportDataSearchForOwnBranchOnly		= (boolean) configuration.getOrDefault(LhpvRegisterReportConfigurationConstant.IS_SEARCH_DATA_FOR_OWN_BRANCH_ONLY,false);
			final var	showChargeWeightColumn						= (boolean) configuration.getOrDefault(LhpvRegisterReportConfigurationConstant.SHOW_CHARGE_WEIGHT_COLUMN, false);
			final var	showActualWeightColumn						= (boolean) configuration.getOrDefault(LhpvRegisterReportConfigurationConstant.SHOW_ACTUAL_WEIGHT_COLUMN, false);
			final var	showWeightColumn							= (boolean) configuration.getOrDefault(LhpvRegisterReportConfigurationConstant.SHOW_WEIGHT_COLUMN, false);
			final var	showDdmDetailsForLhpv						= (boolean) configuration.getOrDefault(LhpvRegisterReportConfigurationConstant.SHOW_DDM_DETAILS_FOR_LHPV, false);

			final Map<?, ?>	executiveFieldPermissions 				= cManip.getExecutiveFieldPermission(request);
			final var isAllowToSearchAllBranchReportData			= executiveFieldPermissions != null && executiveFieldPermissions.get(FeildPermissionsConstant.ALLOW_TO_SEARCH_ALL_BRANCH_REPORT_DATA) != null;
			final var	locationMappMod 							= cManip.getAssignedLocationsIdListByLocationIdId(request, executive.getBranchId(), executive.getAccountGroupId());

			ActionStaticUtil.executiveTypeWiseBranches(request, cManip, executive);

			if (isAllRegionNeedToShow)
				branchesIds = ActionStaticUtil.getPhysicalBranchIds1(request, cManip, executive);
			else
				branchesIds = ActionStaticUtil.getPhysicalBranchIds(request, cManip, executive);

			// Get the Selected Combo values
			var	srcBranchId = JSPUtility.GetLong(request, "branch", 0);

			final var vehicleAgentId = JSPUtility.GetLong(request, "selectedSearchVehicleAgent",0);
			final var driverMasterId = JSPUtility.GetLong(request, "selectedSearchDriver",0);

			if(srcBranchId == 0)
				srcBranchId = executive.getBranchId();

			final Map<Long, VehicleNumberMaster>	vehicleNumberMasterHM	= cManip.getALLVehicleNumberOfGroup(request, executive.getAccountGroupId());

			request.setAttribute("agentName", executive.getName());
			ActionStaticUtil.setRequestAttribute(request,"customAddressBranchId", srcBranchId);
			ActionStaticUtil.setRequestAttribute(request,"customAddressIdentifer", LHPVCompanyDetails.IDENTIFIER_BOOKING);

			if(StringUtils.isEmpty(branchesIds)) {
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
				request.setAttribute("nextPageToken", "success");
				return;
			}

			var	resultList = LHPVDao.getInstance().getLHPVDetailsWithWhereClause(getWhereClause(vehicleAgentId, branchesIds, executive, fromDate, toDate, driverMasterId, request));

			if(ObjectUtils.isNotEmpty(resultList) && allowReportDataSearchForOwnBranchOnly && !isAllowToSearchAllBranchReportData)
				resultList = ListFilterUtility.filterList(resultList, element -> executive.getBranchId() == element.getLhpvBranchId() || executive.getBranchId() == element.getBalancePayableAtBranchId()
				|| locationMappMod != null && (locationMappMod.contains(element.getLhpvBranchId()) || locationMappMod.contains(element.getBalancePayableAtBranchId())));

			final Map<Long, LHPVModel> singleResultMap = MapUtils.toMap(resultList, LHPVModel::getLhpvId);
			resultList = new ArrayList<>(singleResultMap.values());

			if(ObjectUtils.isNotEmpty(resultList)) {
				final var	blhpvIdStr 	= CollectionUtility.joinIds(resultList, LHPVModel::getBlhpvId);
				final var	lhpvIdStr 	= CollectionUtility.joinIds(resultList, LHPVModel::getLhpvId);
				final Map<Long, BLHPV>	blhpvHM		= BLHPVDao.getInstance().getBLHPVDetailsByBLHPVIds(blhpvIdStr);

				final var	allLhpvChargesValObj = LhpvChargesForGroupDao.getInstance().getallLHPVChargeByAccGrpId(executive.getAccountGroupId(), LhpvChargesForGroup.IDENTIFIER_TYPE_LHPV);

				if(allLhpvChargesValObj != null)
					lhpvChargesArr = (LhpvChargesForGroup[]) allLhpvChargesValObj.get("modelArr");

				final var	lhpvSettChargesValObj 	= LhpvSettlementChargesDao.getInstance().getSetlementChargesByBlhpvIds(lhpvIdStr, LhpvChargesForGroup.IDENTIFIER_TYPE_LHPV);
				final var	lhpvchargesCollHshmp 	= (HashMap<Long, HashMap<Long, Double>>) lhpvSettChargesValObj.get("chargesCollMainHshmp");

				final var	lhpvIds			= CollectionUtility.joinFilteredUnique(resultList, e -> e.getStatus() == LHPVConstant.STATUS_BOOKED, LHPVModel::getLhpvId);
				final var	cancleLhpvIds	= CollectionUtility.joinFilteredUnique(resultList, e -> e.getStatus() == LHPVConstant.STATUS_CANCELLED, LHPVModel::getLhpvId);

				if(showDifferentAmountOnNormalAndCrossingLrs || showBasicFreightAmountColumn || showLSTotalColumn || showLHPVWiseBookingTotalColumn || showChargeWeightColumn || showActualWeightColumn)
					dispatchColl = DispatchLedgerDao.getInstance().getLHPVAndLRDataByLHPVIds(lhpvIds, executive.getAccountGroupId(), cancleLhpvIds);
				else
					dispatchColl = DispatchLedgerDao.getInstance().getLHPVDataByLHPVIds(lhpvIds, executive.getAccountGroupId(), cancleLhpvIds);

				if(ObjectUtils.isNotEmpty(dispatchColl))
					filterLhpvWiseDispatchDetails(dispatchColl, packgesPerLHPVId, weightPerLHPVId, lhpvFrtAmtHm, lhpvBkgAmtHm, lhpvChgWghtHm, lhpvActualWghtHm);

				if(showDdmDetailsForLhpv) {
					final var ddmDetailsList  = DeliveryRunSheetLedgerDaoImpl.getInstance().getDDMDetailsByWhereClause(getDDMDetailsByWhereClause(lhpvIds, executive.getAccountGroupId()));

					if(ObjectUtils.isNotEmpty(ddmDetailsList)) {
						for (final DeliveryRunSheetLedger ddmLedger : ddmDetailsList) {
							final var srcBranch = (Branch) branchesObj.get(Long.toString(ddmLedger.getDeliveryRunSheetLedgerSourceBranchId()));
							final var destBranch = (Branch) branchesObj.get(Long.toString(ddmLedger.getDeliveryRunSheetLedgerDestinationBranchId()));
							ddmLedger.setDeliveryRunSheetLedgerSourceBranchName(srcBranch.getName());
							ddmLedger.setDeliveryRunSheetLedgerDestinationBranchName(destBranch.getName());
							ddmLedger.setCreationDateTimeString(DateTimeUtility.getDateFromTimeStamp(ddmLedger.getDeliveryRunSheetLedgerCreationDateTime()));
						}

						lhpvWiseDDMHM	= MapUtils.groupBy(ddmDetailsList, DeliveryRunSheetLedger::getDeliveryRunSheetLedgerLhpvId, DeliveryRunSheetLedger::getDeliveryRunSheetLedgerId);
					}
				}

				for (final LHPVModel report : resultList) {
					report.setAgentName(report.getAgentName() != null ? report.getAgentName() : "--");

					if(sortingByLhpvNumber)
						setLHPVNumber(report);

					branch    	= (Branch) branchesObj.get(Long.toString(report.getBalancePayableAtBranchId()));

					report.setBalancePayableAtBranch(branch != null ? branch.getName() : "--");

					final var	vMaster	= vehicleNumberMasterHM.get(report.getVehicleNumberMasterId());

					if(vMaster != null) {
						report.setVehicleNumber(vMaster.getVehicleNumber());
						report.setVehicleOwner(vMaster.getVehicleOwner());
						report.setVehicleOwnerTypeName(VehicleOwnerConstant.getVehicleOwner(vMaster.getVehicleOwner()));
						report.setVehicleAgentName(vMaster.getRegisteredOwner());
						report.setPanNumber(Utility.checkedNullCondition(vMaster.getPanNumber(), (short) 1));
					} else {
						report.setVehicleNumber("--");
						report.setVehicleAgentName("--");
						report.setPanNumber("--");
					}

					branch    	= (Branch) branchesObj.get(Long.toString(report.getSourceBranchId()));

					if(branch != null) {
						report.setSourceBranchString(branch.getName());

						subRegion	= (SubRegion) subRegionObj.get(branch.getSubRegionId());

						report.setSourceSubRegionId(branch.getSubRegionId());
						report.setSourceSubRegionName(subRegion.getName());
					} else
						report.setSourceSubRegionName("");

					branch    	= (Branch) branchesObj.get(Long.toString(report.getDestinationBranchId()));
					report.setDestinationBranchString(branch != null ? branch.getName() : "--");

					if(report.getBlhpvId() > 0) {
						final var blhpv = blhpvHM.get(report.getBlhpvId());
						report.setBlhpvNumber(blhpv.getbLHPVNumber());
						report.setBlhpvDateTime(blhpv.getCreationDateTimeStamp());
						report.setBlhpvBranchId(blhpv.getbLHPVBranchId());

						branch = (Branch) branchesObj.get(Long.toString(report.getBlhpvBranchId()));
						report.setBlhpvBranch(branch.getName());

						subRegion	= (SubRegion) subRegionObj.get(branch.getSubRegionId());
						report.setBlhpvSubRegionName(subRegion.getName());
					}

					if(lhpvChargesArr != null) {
						if(lhpvchargesCollHshmp != null && lhpvchargesCollHshmp.containsKey(report.getLhpvId())) {
							final Map<Long, Double>	chargesHM	= lhpvchargesCollHshmp.get(report.getLhpvId());

							report.setTotalAmount(chargesHM.getOrDefault((long) LhpvChargeTypeMaster.LORRY_HIRE, 0.0));
							report.setAdvanceAmount(chargesHM.getOrDefault((long) LhpvChargeTypeMaster.ADVANCE_AMOUNT, 0.0));
							report.setBalanceAmount(chargesHM.getOrDefault((long) LhpvChargeTypeMaster.BALANCE_AMOUNT, 0.0));
							report.setRefund(chargesHM.getOrDefault((long) LhpvChargeTypeMaster.REFUND_AMOUNT, 0.0));
							report.setDoorDeliveryAmount(chargesHM.getOrDefault((long) LhpvChargeTypeMaster.DOOR_DELIVERY, 0.0));
						} else {
							report.setTotalAmount(0);
							report.setAdvanceAmount(0);
							report.setBalanceAmount(0);
						}

						for (final LhpvChargesForGroup element : lhpvChargesArr)
							if(!LhpvChargeTypeMaster.getNecessaryCharges().contains(Short.parseShort(Long.toString(element.getLhpvChargeTypeMasterId())))
									&& lhpvchargesCollHshmp != null && lhpvchargesCollHshmp.get(report.getLhpvId()) != null && lhpvchargesCollHshmp.get(report.getLhpvId()).get(element.getLhpvChargeTypeMasterId()) != null)
								if(element.getOperationType() == LhpvChargesForGroup.OPERATION_TYPE_ADD)
									report.setAdditionCharges(report.getAdditionCharges() + lhpvchargesCollHshmp.get(report.getLhpvId()).get(element.getLhpvChargeTypeMasterId()));
								else if(element.getOperationType() == LhpvChargesForGroup.OPERATION_TYPE_SUBTRACT && element.getLhpvChargeTypeMasterId() != Long.parseLong(LhpvChargeTypeMaster.ADVANCE_AMOUNT + "") )
									report.setDeductionCharges(report.getDeductionCharges() + lhpvchargesCollHshmp.get(report.getLhpvId()).get(element.getLhpvChargeTypeMasterId()));
					}

					//get Vehicle Owner Name And Pan Number: end
					if(isShowAdvVoucherSettlementColumn)
						report.setAdvVoucherSettlmentStatusStr(LHPVConstant.getVoucherSettlementStatus(report.getAdvVoucherSettlmentStatus()));

					if (report.getStatus() == LHPVConstant.STATUS_BOOKED) {
						report.setTotalNoOfPackages(packgesPerLHPVId.getOrDefault(report.getLhpvId(), 0));
						report.setTotalActualWeight(weightPerLHPVId.getOrDefault(report.getLhpvId(), 0d));
						report.setFreightAmount(lhpvFrtAmtHm.getOrDefault(report.getLhpvId(), 0d));
						report.setBookingTotal(lhpvBkgAmtHm.getOrDefault(report.getLhpvId(), 0d));
						report.setTotalChargeWeight(lhpvChgWghtHm.getOrDefault(report.getLhpvId(), 0d));
						report.setTotalLrActualWeight(lhpvActualWghtHm.getOrDefault(report.getLhpvId(), 0d));
					}

					report.setCreationDateTimeString(DateTimeUtility.getDateFromTimeStamp(report.getCreationDateTimeStamp(), DateTimeFormatConstant.DD_MM_YY));
					report.setStatusName(LHPV.getLHPVStatus(report.getStatus()));
					report.setBlhpvDateTimeString(DateTimeUtility.getDateFromTimeStamp(report.getBlhpvDateTime(), DateTimeFormatConstant.DD_MM_YY));
				}

				if(sortingByLhpvNumber)
					resultList	 = SortUtils.sortList(resultList, LHPVModel::getLhpvBranchCode, LHPVModel::getLhpvNumberForSorting);
				else if(lhpvDateForSorting)
					resultList	 = SortUtils.sortList(resultList, LHPVModel::getCreationDateTimeStamp);

				if(showExecutiveWiseLHPVHistory && StringUtils.isNotEmpty(exectiveIdsForLHPVHistory))
					request.setAttribute("showLHPVHistory", CollectionUtility.getLongListFromString(exectiveIdsForLHPVHistory).contains(executive.getExecutiveId()));

				request.setAttribute("subRegionWiseData", resultList.stream().filter(e -> e.getVehicleOwner() != TransportCommonMaster.HIRED_VEHICLE_ID).collect(Collectors.groupingBy(LHPVModel::getSubRegionNameWithId, TreeMap::new, CollectionUtility.getList())));
				request.setAttribute("subRegionWiseDataForHiredVehilce", resultList.stream().filter(e -> e.getVehicleOwner() == TransportCommonMaster.HIRED_VEHICLE_ID).collect(Collectors.groupingBy(LHPVModel::getSubRegionNameWithId, TreeMap::new, CollectionUtility.getList())));
				request.setAttribute("dispatchColl", dispatchColl);
				request.setAttribute("lhpvWiseDDMHM", lhpvWiseDDMHM);

				configuration.entrySet().forEach((final Map.Entry<Object, Object> entry) -> request.setAttribute(entry.getKey().toString(), entry.getValue()));

				request.setAttribute("showTruckAdvDateColumn", showTruckAdvDateColumn);
				request.setAttribute("showAdditionalAdvDateColumn", showAdditionalAdvDateColumn);
				request.setAttribute("showAdditionalAdvPaymentTypeColumn", showAdditionalAdvPaymentTypeColumn);
				request.setAttribute("showTruckAdvPaymentTypeColumn", showTruckAdvPaymentTypeColumn);
				request.setAttribute("renameColumnName", renameColumnName);
				request.setAttribute(LhpvRegisterReportConfigurationConstant.SHOW_PAYMENT_DETAILS_LINK, showPaymentDetailsLink);
				request.setAttribute("freightAmountColumnFlag", showBasicFreightAmountColumn && executive.getExecutiveType() != ExecutiveTypeConstant.EXECUTIVE_TYPE_EXECUTIVE);
				request.setAttribute(LhpvRegisterReportConfigurationConstant.SHOW_CHARGE_WEIGHT_COLUMN, showChargeWeightColumn);
				request.setAttribute(LhpvRegisterReportConfigurationConstant.SHOW_ACTUAL_WEIGHT_COLUMN, showActualWeightColumn);
				request.setAttribute(LhpvRegisterReportConfigurationConstant.SHOW_WEIGHT_COLUMN, showWeightColumn);
				request.setAttribute(LhpvRegisterReportConfigurationConstant.SHOW_DDM_DETAILS_FOR_LHPV, showDdmDetailsForLhpv);
				request.setAttribute(LhpvRegisterReportConfigurationConstant.SHOW_OPENING_AND_CLOSING_KM_COLUMNS, (boolean) configuration.getOrDefault(LhpvRegisterReportConfigurationConstant.SHOW_OPENING_AND_CLOSING_KM_COLUMNS, false));

			} else {
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}

			ActionStaticUtil.setReportViewModel(request);

			request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}

	private void setLHPVNumber(final LHPVModel report) {
		try {
			final var 	pair	= SplitLRNumber.getNumbers(report.getLhpvNumber());

			report.setLhpvBranchCode(pair != null && pair.getBranchCode() instanceof String ? pair.getBranchCode().toString() : "");
			report.setLhpvNumberForSorting(pair != null && pair.getLrNumber() instanceof Long ? (long) pair.getLrNumber() : 0);
		} catch (final Exception e) {
			ExceptionProcess.execute(e, LHPVDetailsReportAction.class.getName());
		}
	}

	private String getWhereClause(final long vehicleAgentId, final String branchIds, final Executive executive, final Timestamp fdate, final Timestamp tdate, final long driverMasterId, final HttpServletRequest request) throws Exception {
		final var whereClause = new StringJoiner(" AND ");

		try {
			whereClause.add("l.CreationDateTimeStamp >= '" + fdate + "'");
			whereClause.add("l.CreationDateTimeStamp <= '" + tdate + "'");
			whereClause.add("l.AccountGroupId = " + executive.getAccountGroupId());
			whereClause.add("l.BranchId IN (" + branchIds + ") ");

			if(vehicleAgentId > 0)
				whereClause.add("vam.VehicleAgentMasterId = " + vehicleAgentId);

			if(driverMasterId > 0)
				whereClause.add("l.DriverMasterId = " + driverMasterId);

			final var divisionId	= JSPUtility.GetLong(request, Constant.DIVISION_ID, 0);

			if (divisionId > 0) whereClause.add("l.DivisionId = " + divisionId);

			return whereClause.toString();
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private void filterLhpvWiseDispatchDetails(final Map<Long, List<DispatchLedger>> dispatchColl, final Map<Long, Integer> packgesPerLHPVId, final Map<Long, Double> weightPerLHPVId, final Map<Long, Double> lhpvFreightHm, final Map<Long, Double> lhpvBkgHm, final Map<Long, Double> lhpvChgWghtHm, final Map<Long, Double> lhpvActualWghtHm) throws Exception {
		try {
			for(final Map.Entry<Long, List<DispatchLedger>> entry : dispatchColl.entrySet()) {
				final var dispatchList = entry.getValue();

				final Map<Long, List<DispatchLedger>> dispatchWiseLrsHM	= dispatchList.stream().collect(Collectors.groupingBy(DispatchLedger::getDispatchLedgerId));

				dispatchList.clear();

				var	totalPackages = 0;
				var	totalActualWeight = 0D;
				var	totalFreight = 0D;
				var	bookingTotal = 0D;
				var totalChargeWeight = 0D;
				var totalLrActualWeight = 0D;

				for (final Map.Entry<Long, List<DispatchLedger>> entry1 : dispatchWiseLrsHM.entrySet()) {
					final var dispatchListNew 	= entry1.getValue();
					final var dispatchLedger 	= dispatchListNew.get(0);

					totalPackages		+= dispatchLedger.getTotalNoOfPackages();
					totalActualWeight	+= dispatchLedger.getTotalActualWeight();
					totalFreight		+= CollectionUtility.sum(dispatchListNew, DispatchLedger::getFreightAmount);
					totalChargeWeight	+= CollectionUtility.sum(dispatchListNew, DispatchLedger::getTotalChargeWeight);
					totalLrActualWeight	+= CollectionUtility.sum(dispatchListNew, DispatchLedger::getTotalLrActualWeight);

					dispatchLedger.setGrandTotalAmount(CollectionUtility.sum(dispatchListNew, DispatchLedger::getBookingTotal));

					bookingTotal	+= dispatchLedger.getGrandTotalAmount();

					var	branch	= (Branch) branchesObj.get(Long.toString(dispatchLedger.getSourceBranchId()));

					dispatchLedger.setSourceBranch(branch != null ? branch.getName() : "-");

					branch		= (Branch) branchesObj.get(Long.toString(dispatchLedger.getDestinationBranchId()));
					dispatchLedger.setDestinationBranch(branch != null ? branch.getName() : "-");

					dispatchLedger.setTurNumber(Utility.checkedNullCondition(dispatchLedger.getTurNumber(), (short) 2));
					dispatchLedger.setTripDateTimeForString(DateTimeUtility.getDateFromTimeStamp(dispatchLedger.getTripDateTime(), DateTimeFormatConstant.DD_MM_YY));
					dispatchLedger.setDirectAmount(CollectionUtility.sumAnyNumber(dispatchListNew, DispatchLedger::getFreightAmount, e -> e.getWayBillDestinationBranchId() == e.getDestinationBranchId()));
					dispatchLedger.setConnectingAmount(CollectionUtility.sumAnyNumber(dispatchListNew, DispatchLedger::getFreightAmount, e -> e.getWayBillDestinationBranchId() != e.getDestinationBranchId()));

					dispatchList.add(dispatchLedger);
				}

				dispatchColl.put(entry.getKey(), dispatchList);
				packgesPerLHPVId.put(entry.getKey(), totalPackages); // lhpv id and total weight in each
				weightPerLHPVId.put(entry.getKey(), totalActualWeight); // lhpv id and total packges in each
				lhpvFreightHm.put(entry.getKey(), totalFreight);
				lhpvBkgHm.put(entry.getKey(), bookingTotal);
				lhpvChgWghtHm.put(entry.getKey(), totalChargeWeight);
				lhpvActualWghtHm.put(entry.getKey(), totalLrActualWeight);
			}
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, LHPVDetailsReportAction.class.getName());
		}
	}

	private String getDDMDetailsByWhereClause(String lhpvIds, final long accountGroupId) throws Exception {
		final var whereClause = new StringJoiner(" AND ");

		try {
			whereClause.add("drsl.LhpvId IN (" + lhpvIds + ")");
			whereClause.add("drsl.AccountGroupId = "+ accountGroupId);

			return whereClause.toString();
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}
}
