package com.ivcargo.reports;

//~--- non-JDK imports --------------------------------------------------------

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.StringJoiner;
import java.util.TreeMap;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.ObjectUtils;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.bll.impl.LHPVBllImpl;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.constant.properties.report.BlhpvRegisterReportConstant;
import com.iv.dao.impl.LHPVSettlementChargesDaoImpl;
import com.iv.dao.impl.LhpvChargesForGroupDaoImpl;
import com.iv.dao.impl.lhpv.LHPVDaoImpl;
import com.iv.dao.impl.master.VehicleNumberMasterDaoImpl;
import com.iv.dao.impl.reports.account.BLHPVRegisterReportDaoImpl;
import com.iv.dao.impl.txn.BLHPVCreditAmountTxnDaoImpl;
import com.iv.dto.DispatchLedger;
import com.iv.dto.LhpvChargesForGroup;
import com.iv.dto.constant.ExecutiveTypeConstant;
import com.iv.dto.constant.FeildPermissionsConstant;
import com.iv.dto.constant.LHPVChargeTypeConstant;
import com.iv.dto.constant.PaymentTypeConstant;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.dto.constant.VehicleOwnerConstant;
import com.iv.dto.model.BLHPVCreditAmountTxn;
import com.iv.dto.model.reports.account.BLHPVRegisterReportModel;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.constant.Constant;
import com.iv.utils.constant.DateTimeFormatConstant;
import com.iv.utils.exception.ExceptionProcess;
import com.iv.utils.utility.CollectionUtility;
import com.iv.utils.utility.ListFilterUtility;
import com.iv.utils.utility.Utility;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.CustomGroupMapper;
import com.platform.dto.Executive;
import com.platform.resource.CargoErrorList;

public class BlhpvRegisterReportAction implements Action {

	private static final String TRACE_ID 					= "BlhpvRegisterReportAction";

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	 							error 							= null;
		Map<Long, Map<Long, Double>>   						blhpvchargesCollHshmp			= null;
		var 												srcBranchId						= 0L;
		Map<Long, Double> 									pendingAmountsForBlhpvHM		= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeBlhpvRegisterReportAction().execute(request, response);

			final var	sdf			= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			final var	fromDate	= new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00").getTime());
			final var	toDate		= new Timestamp(sdf.parse(JSPUtility.GetString(request, "toDate") + " 23:59:59").getTime());
			final var	cManip 		= new CacheManip(request);
			final var	executive	= cManip.getExecutive(request);

			ActionStaticUtil.executiveTypeWiseBranches(request, cManip, executive);

			final var	branchesIds	= ActionStaticUtil.getPhysicalBranchIds1(request, cManip, executive);

			if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN || executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_REGIONADMIN || executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_SUBREGIONADMIN)
				srcBranchId = JSPUtility.GetLong(request, "branch", 0);
			else
				srcBranchId = executive.getBranchId();

			final var	blhpvConfiguration			= ReadAllConfigurationsBllImpl.getInstance().getReportConfigurationData(ReportIdentifierConstant.BLHPV_REGISTER_REPORT, executive.getAccountGroupId());
			final var	hideLsDetailsColumn			= (boolean) blhpvConfiguration.getOrDefault(BlhpvRegisterReportConstant.HIDE_LS_DETAILS_COLUMN, false);
			final var	subRegionWiseOwnVehicleData	= (boolean) blhpvConfiguration.getOrDefault(BlhpvRegisterReportConstant.SUB_REGION_WISE_OWN_VEHICLE_DATA, false);
			final var	blhpvNumberWiseSortig		= (boolean) blhpvConfiguration.getOrDefault(BlhpvRegisterReportConstant.BLHPV_NUMBER_WISE_SORTING, true);
			final var	showTdsChargeColumn			= (boolean) blhpvConfiguration.getOrDefault(BlhpvRegisterReportConstant.SHOW_TDS_CHARGE_COLUMN, false);
			final var	showPendingBlhpvAmount		= (boolean) blhpvConfiguration.getOrDefault(BlhpvRegisterReportConstant.SHOW_PENDING_BLHPV_AMOUNT, false);

			final Map<?, ?>	executiveFieldPermissions 				= cManip.getExecutiveFieldPermission(request);
			final var isAllowToSearchAllBranchReportData			= executiveFieldPermissions != null && executiveFieldPermissions.get(FeildPermissionsConstant.ALLOW_TO_SEARCH_ALL_BRANCH_REPORT_DATA) != null;
			final var	isSearchDataForOwnBranchOnly				= (boolean) blhpvConfiguration.getOrDefault(BlhpvRegisterReportConstant.IS_SEARCH_DATA_FOR_OWN_BRANCH_ONLY, false);
			final var	locationMappMod 							= cManip.getAssignedLocationsIdListByLocationIdId(request, executive.getBranchId(), executive.getAccountGroupId());

			request.setAttribute("agentName", executive.getName());
			request.setAttribute(BlhpvRegisterReportConstant.IS_OWN_HIRED_VEHICLE_WISE_SUMMARY_SHOW, blhpvConfiguration.getOrDefault(BlhpvRegisterReportConstant.IS_OWN_HIRED_VEHICLE_WISE_SUMMARY_SHOW, false));
			request.setAttribute(BlhpvRegisterReportConstant.SHOW_BLHPV_REFUND, blhpvConfiguration.getOrDefault(BlhpvRegisterReportConstant.SHOW_BLHPV_REFUND, false));
			ActionStaticUtil.setRequestAttribute(request,"customAddressBranchId", srcBranchId);
			ActionStaticUtil.setRequestAttribute(request,"customAddressIdentifer", CustomGroupMapper.IDENTIFIER_DELIVERY);

			var	reports = BLHPVRegisterReportDaoImpl.getInstance().getBLHPVDetails(getWhereClause(branchesIds, executive, fromDate, toDate, request));

			if(ObjectUtils.isNotEmpty(reports) && isSearchDataForOwnBranchOnly && !isAllowToSearchAllBranchReportData)
				reports = ListFilterUtility.filterList(reports, element -> executive.getBranchId() == element.getBranchId()
				|| executive.getBranchId() == element.getLhpvBranchId() || locationMappMod != null && (locationMappMod.contains(element.getBranchId()) || locationMappMod.contains(element.getLhpvBranchId())));

			if(ObjectUtils.isNotEmpty(reports)) {
				final Set<Long> vehicleArr	= reports.stream().map(BLHPVRegisterReportModel::getVehicleId).collect(Collectors.toSet());
				final Set<Long> lhpvIdArr	= reports.stream().map(BLHPVRegisterReportModel::getLhpvId).collect(Collectors.toSet());
				final Set<Long> blhpvIdArr	= reports.stream().map(BLHPVRegisterReportModel::getBlhpvId).collect(Collectors.toSet());

				final var	vehicleHM  	= VehicleNumberMasterDaoImpl.getInstance().getVehicleDetailsMap(CollectionUtility.getStringFromLongSet(vehicleArr));
				final var	lhpvIds		= CollectionUtility.getStringFromLongSet(lhpvIdArr);

				final var	dispatchColl 	= LHPVBllImpl.getInstance().getLimitedDispatchLedgerDataByLHPVIds(lhpvIds, executive.getAccountGroupId(), "");

				if(ObjectUtils.isNotEmpty(blhpvIdArr))
					blhpvchargesCollHshmp 	= LHPVSettlementChargesDaoImpl.getInstance().getLHPVSetlementChargesByIds(CollectionUtility.getStringFromLongSet(blhpvIdArr), LhpvChargesForGroup.IDENTIFIER_TYPE_BLHPV);

				if(showPendingBlhpvAmount && ObjectUtils.isNotEmpty(blhpvIdArr)) {
					final var	blhpvWithPendingAmountHM = BLHPVCreditAmountTxnDaoImpl.getInstance().getReceivedBLHPVCreditAmountTxn(whereClause(CollectionUtility.getStringFromLongSet(blhpvIdArr), executive.getAccountGroupId()));
					pendingAmountsForBlhpvHM = calculateBlhpvPendingAmount(blhpvWithPendingAmountHM);
				}

				final var	lhpvHM					= LHPVDaoImpl.getInstance().getLHPVDetailsByLHPVIds(lhpvIds);
				final var	lhpvChargesArr 			= LhpvChargesForGroupDaoImpl.getInstance().getAllLHPVChargeByAccGrpId(executive.getAccountGroupId(), (short)0);
				final var	lhpvchargesCollHshmp 	= LHPVSettlementChargesDaoImpl.getInstance().getLHPVSetlementChargesByIds(lhpvIds, LhpvChargesForGroup.IDENTIFIER_TYPE_LHPV);

				final Map<String, List<BLHPVRegisterReportModel>>	subRegionWiseData		= new TreeMap<>();
				final Map<String, List<BLHPVRegisterReportModel>>	subRegionWiseDataOwn	= new TreeMap<>();

				for (final BLHPVRegisterReportModel report : reports) {
					final var lhpvModel = lhpvHM.get(report.getLhpvId());

					if(lhpvModel == null)
						continue;

					if(blhpvNumberWiseSortig && report.getBlhpvNumber() != null && Utility.isAllDigit(report.getBlhpvNumber()))
						report.setBlhpvNumberForSort(Long.parseLong(report.getBlhpvNumber()));
					else
						report.setBlhpvNumberForSort(0);

					report.setVehicleNumber(vehicleHM.get(report.getVehicleId()).getVehicleNumber());
					report.setBranchName(cManip.getBranchById(request, executive.getAccountGroupId(), report.getBranchId()).getName());
					report.setLhpvSourceBranchId(lhpvModel.getSourceBranchId());
					report.setLhpvSourceBranch(cManip.getBranchById(request, executive.getAccountGroupId(), report.getLhpvSourceBranchId()).getName());
					report.setBlhpvDate(DateTimeUtility.getDateFromTimeStamp(report.getDate(), DateTimeFormatConstant.DD_MM_YY));
					report.setLhpvDateStr(DateTimeUtility.getDateFromTimeStamp(lhpvModel.getCreationDateTimeStamp(), DateTimeFormatConstant.DD_MM_YY));
					report.setLhpvUnloading(lhpvModel.getUnloading());
					report.setLhpvDetaintion(lhpvModel.getDetaintion());
					report.setLhpvOtherAdditionalCharge(lhpvModel.getOtherAdditionalCharge());
					report.setLhpvDeduction(lhpvModel.getDeduction());
					report.setLhpvToPayReceived(lhpvModel.getToPayReceived());
					report.setLhpvRefund(lhpvModel.getRefund());

					if(lhpvChargesArr != null) {
						if(lhpvchargesCollHshmp != null && lhpvchargesCollHshmp.containsKey(report.getLhpvId())) {
							final var	chargesHM	= lhpvchargesCollHshmp.get(report.getLhpvId());

							report.setAdvancePaid(chargesHM.getOrDefault((long) LHPVChargeTypeConstant.ADVANCE_AMOUNT, 0.0));
							report.setTotal(chargesHM.getOrDefault((long) LHPVChargeTypeConstant.LORRY_HIRE, 0.0));
						} else {
							report.setAdvancePaid(0);
							report.setTotal(0);
						}

						if(blhpvchargesCollHshmp != null && blhpvchargesCollHshmp.containsKey(report.getBlhpvId())) {
							final var	chargesHM	= blhpvchargesCollHshmp.get(report.getBlhpvId());

							report.setActualBalanceAmountTaken(chargesHM.getOrDefault((long) LHPVChargeTypeConstant.ACTUAL_BALANCE, 0.0));
							report.setBlhpvRefund(chargesHM.getOrDefault((long) LHPVChargeTypeConstant.ACTUAL_REFUND, 0.0));
							report.setTdsCharge(chargesHM.getOrDefault((long) LHPVChargeTypeConstant.TDS, 0.0));
						} else {
							report.setActualBalanceAmountTaken(0);
							report.setBlhpvRefund(0);
						}

						for (final LhpvChargesForGroup element : lhpvChargesArr)
							if(element.getIdentifier() == LhpvChargesForGroup.IDENTIFIER_TYPE_LHPV) {
								if(!LHPVChargeTypeConstant.getNecessaryCharges().contains(Short.parseShort(Long.toString(element.getLhpvChargeTypeMasterId())))
										&& lhpvchargesCollHshmp != null && lhpvchargesCollHshmp.get(report.getLhpvId()) != null && lhpvchargesCollHshmp.get(report.getLhpvId()).get(element.getLhpvChargeTypeMasterId()) != null) {
									final var	lhpvCharges	= lhpvchargesCollHshmp.get(report.getLhpvId());

									if(element.getOperationType() == LHPVChargeTypeConstant.OPERATION_TYPE_ADD)
										report.setAdditionCharges(report.getAdditionCharges() + lhpvCharges.get(element.getLhpvChargeTypeMasterId()));
									else if(element.getOperationType() == LHPVChargeTypeConstant.OPERATION_TYPE_SUBTRACT && element.getLhpvChargeTypeMasterId() != Long.parseLong(LHPVChargeTypeConstant.ADVANCE_AMOUNT + ""))
										report.setDeductionCharges(report.getDeductionCharges() + lhpvCharges.get(element.getLhpvChargeTypeMasterId()));
								}
							} else if(blhpvchargesCollHshmp != null && blhpvchargesCollHshmp.get(report.getBlhpvId()) != null && blhpvchargesCollHshmp.get(report.getBlhpvId()).get(element.getLhpvChargeTypeMasterId()) != null) {
								final var	blhpvCharges	= blhpvchargesCollHshmp.get(report.getBlhpvId());

								if(element.getOperationType() == LHPVChargeTypeConstant.OPERATION_TYPE_ADD)
									report.setBlhpvadditionCharges(report.getBlhpvadditionCharges() + blhpvCharges.getOrDefault(element.getLhpvChargeTypeMasterId(), 0d));
								else if(element.getOperationType() == LHPVChargeTypeConstant.OPERATION_TYPE_SUBTRACT && element.getLhpvChargeTypeMasterId() != Long.parseLong(LHPVChargeTypeConstant.ADVANCE_AMOUNT + ""))
									report.setBlhpvdeductionCharges(report.getBlhpvdeductionCharges() + blhpvCharges.getOrDefault(element.getLhpvChargeTypeMasterId(), 0d));
							}
					}

					var	branch		= cManip.getBranchById(request, executive.getAccountGroupId(), report.getBranchId());
					var	subRegion	= cManip.getGenericSubRegionById(request, branch.getSubRegionId());
					report.setSubRegionId(branch.getSubRegionId());
					report.setSubRegionName(subRegion.getName());

					if(pendingAmountsForBlhpvHM != null && pendingAmountsForBlhpvHM.containsKey(report.getBlhpvId()))
						report.setPendingBlhpvAmount(Math.round(pendingAmountsForBlhpvHM.getOrDefault(report.getBlhpvId(), 0.0)));
					else if(report.getPaymentMode() == PaymentTypeConstant.PAYMENT_TYPE_CREDIT_ID)
						report.setPendingBlhpvAmount(Math.round(report.getActualBalanceAmountTaken()));

					if(report.getVehicleOwner() == VehicleOwnerConstant.OWN_VEHICLE_ID && subRegionWiseOwnVehicleData) {
						branch		= cManip.getBranchById(request, executive.getAccountGroupId(), report.getAllotedBranchId());
						subRegion	= cManip.getGenericSubRegionById(request, branch.getSubRegionId());

						final var	subReId				= branch.getSubRegionId();
						final var	subRegionName		= subRegion.getName();
						var	bLHPVModelListOwn	= subRegionWiseDataOwn.get(subRegionName + "_" + subReId);

						if(bLHPVModelListOwn == null) {
							bLHPVModelListOwn = new ArrayList<>();
							bLHPVModelListOwn.add(report);

							if(blhpvNumberWiseSortig)
								bLHPVModelListOwn.sort(Comparator.comparing(BLHPVRegisterReportModel::getBlhpvNumberForSort));

							subRegionWiseDataOwn.put(subRegionName + "_" + subReId, bLHPVModelListOwn);
						} else {
							bLHPVModelListOwn.add(report);

							if(blhpvNumberWiseSortig)
								bLHPVModelListOwn.sort(Comparator.comparing(BLHPVRegisterReportModel::getBlhpvNumberForSort));
						}
					} else {
						final var	subReId			= branch.getSubRegionId();
						final var	subRegionName	= subRegion.getName();
						var	bLHPVModelList	= subRegionWiseData.get(subRegionName + "_" + subReId);

						if(bLHPVModelList == null) {
							bLHPVModelList = new ArrayList<>();
							bLHPVModelList.add(report);

							if(blhpvNumberWiseSortig)
								bLHPVModelList.sort(Comparator.comparing(BLHPVRegisterReportModel::getBlhpvNumberForSort));

							subRegionWiseData.put(subRegionName + "_" + subReId, bLHPVModelList);
						} else {
							bLHPVModelList.add(report);

							if(blhpvNumberWiseSortig)
								bLHPVModelList.sort(Comparator.comparing(BLHPVRegisterReportModel::getBlhpvNumberForSort));
						}
					}
				}

				if(ObjectUtils.isNotEmpty(dispatchColl))
					for(final Map.Entry<Long, List<DispatchLedger>> entry : dispatchColl.entrySet()) {
						final var dispatchList = entry.getValue();

						for (final DispatchLedger element : dispatchList) {
							element.setTripDateTimeForString(DateTimeUtility.getDateFromTimeStamp(element.getTripDateTime()));

							if(element.getSourceBranchId() > 0)
								element.setSourceBranch(cManip.getBranchById(request, executive.getAccountGroupId(), element.getSourceBranchId()).getName());

							if(element.getDestinationBranchId() > 0)
								element.setDestinationBranch(cManip.getBranchById(request, executive.getAccountGroupId(), element.getDestinationBranchId()).getName());
						}
					}

				request.setAttribute("subRegionWiseData", subRegionWiseData);
				request.setAttribute("subRegionWiseDataOwn", subRegionWiseDataOwn);
				request.setAttribute(BlhpvRegisterReportConstant.SHOW_TDS_CHARGE_COLUMN, showTdsChargeColumn);
				request.setAttribute(BlhpvRegisterReportConstant.SHOW_PENDING_BLHPV_AMOUNT, showPendingBlhpvAmount);

				if(!hideLsDetailsColumn)
					request.setAttribute("dispatchColl", dispatchColl);
			} else {
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}

			ActionStaticUtil.setReportViewModel(request);

			request.setAttribute("nextPageToken", "success");
		} catch (final Exception _e) {
			ActionStaticUtil.catchActionException(request, _e, error);
		}
	}

	private String whereClause(String blhpvIds, long accountGroupId) {
		final var whereClause = new StringJoiner(" AND ");

		whereClause.add("bat.BlhpvId IN (" + blhpvIds + ")");
		whereClause.add("bat.AccountGroupId = " + accountGroupId);
		whereClause.add("bat.Status <> " + BLHPVCreditAmountTxn.STATUS_PAYMENT_CANCELLED);
		
		return whereClause.toString();
	}

	private Map<Long, Double> calculateBlhpvPendingAmount(Map<Long, List<BLHPVCreditAmountTxn>> blhpvWithPendingAmountHM) {
		if (blhpvWithPendingAmountHM == null || blhpvWithPendingAmountHM.isEmpty())
			return Collections.emptyMap();

		return blhpvWithPendingAmountHM.entrySet().stream().collect(Collectors.toMap(Map.Entry::getKey, entry -> {
			final var listObj = entry.getValue();
			final var totalAmount = listObj.get(0).getTotalAmount();
			final var totalSettleAmount = listObj.stream().mapToDouble(BLHPVCreditAmountTxn::getSettledAmount).sum();

			return totalAmount - totalSettleAmount;
		}));
	}
	
	private String getWhereClause(final String branchesIds, final Executive executive, final Timestamp fdate, final Timestamp tdate,final HttpServletRequest request) throws Exception {
		final var whereClause = new StringJoiner(" AND ");
		final var divisionId = JSPUtility.GetLong(request, Constant.DIVISION_ID, 0);

		try {
			whereClause.add("b.CreationDateTimeStamp >= '" + fdate + "'");
			whereClause.add("b.CreationDateTimeStamp <= '" + tdate + "'");
			whereClause.add("b.AccountGroupId = " + executive.getAccountGroupId());
			whereClause.add("b.BranchId IN (" + branchesIds + ") ");

			whereClause.add("b.Status <> " + 2);

			if (divisionId > 0) whereClause.add("l.DivisionId = " + divisionId);
			
			return whereClause.toString();
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}
	
}
