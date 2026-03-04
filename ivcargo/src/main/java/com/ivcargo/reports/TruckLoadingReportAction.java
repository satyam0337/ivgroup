package com.ivcargo.reports;

//~--- non-JDK imports --------------------------------------------------------

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.ObjectUtils;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.bll.impl.properties.DisplayDataConfigurationBllImpl;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.constant.Constant;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.utility.CollectionUtility;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.LhpvChargesForGroupDao;
import com.platform.dao.LhpvSettlementChargesDao;
import com.platform.dao.TruckLoadingReportDao;
import com.platform.dto.Branch;
import com.platform.dto.CustomGroupMapper;
import com.platform.dto.Executive;
import com.platform.dto.LhpvChargeTypeMaster;
import com.platform.dto.LhpvChargesForGroup;
import com.platform.dto.LocationsMapping;
import com.platform.dto.SubRegion;
import com.platform.dto.TransportCommonMaster;
import com.platform.dto.TruckLoadingModel;
import com.platform.dto.VehicleNumberMaster;
import com.platform.resource.CargoErrorList;

public class TruckLoadingReportAction implements Action {
	
	private static final String TRACE_ID = "TruckLoadingReportAction";
	@Override
	@SuppressWarnings("unchecked")
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {

		HashMap<String,Object>					error 					= null;
		ValueObject								lhpvSettChargesValObj	= null;
		HashMap<Long, HashMap<Long, Double>>   	lhpvchargesCollHshmp	= null;
		LhpvChargesForGroup[]					lhpvChargesArr 			= null;
		short									filterForAdmin			= 0;
		final var 								srcBranchId				= 0L;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var startTime = System.currentTimeMillis();
			new InitializeTruckLoadingReportAction().execute(request, response);

			final var	sdf			= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			final var	fromDate	= new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00").getTime());
			final var	toDate		= new Timestamp(sdf.parse(JSPUtility.GetString(request, "toDate") + " 23:59:59").getTime());
			final var	vehicleNoId = JSPUtility.GetLong(request, "selectedVehicleNo");
			final var	cManip 		= new CacheManip(request);
			final var	executive	= cManip.getExecutive(request);

			ActionStaticUtil.executiveTypeWiseBranches(request, cManip, executive);

			final var	branchesIds	= ActionStaticUtil.getPhysicalBranchIds(request, cManip, executive);

			request.setAttribute("agentName", executive.getName());

			if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_GROUPADMIN)
				filterForAdmin = 1;

			final var	outValObject = TruckLoadingReportDao.getInstance().getTruckLoadingDetails(branchesIds ,executive.getAccountGroupId() ,fromDate ,toDate,filterForAdmin,vehicleNoId);

			if(outValObject != null) {
				final var	resultList 			= (ArrayList<TruckLoadingModel>)outValObject.get("reportModelArr");
				//final var	lhpvIdStr			= (String) outValObject.get("lhpvIds");
				final var	truckLoadingHM		= new HashMap<Long, TruckLoadingModel>();
				final var	lhpvDispatchCollHM	= new HashMap<Long, HashMap<Long, TruckLoadingModel>>();

				if(resultList != null) {
					final var	allLhpvChargesValObj = LhpvChargesForGroupDao.getInstance().getallLHPVChargeByAccGrpId(executive.getAccountGroupId(), LhpvChargesForGroup.IDENTIFIER_TYPE_LHPV);

					if(allLhpvChargesValObj !=null)
						lhpvChargesArr = (LhpvChargesForGroup[]) allLhpvChargesValObj.get("modelArr");

					List<Long> lhpvIdList = resultList.stream().map(TruckLoadingModel::getLhpvId).distinct().collect(Collectors.toList());
					
					if(ObjectUtils.isNotEmpty(lhpvIdList)) {
						final var lhpvIdStr	= CollectionUtility.getStringFromLongList(lhpvIdList);
						lhpvSettChargesValObj = LhpvSettlementChargesDao.getInstance().getSetlementChargesByBlhpvIds(lhpvIdStr, LhpvChargesForGroup.IDENTIFIER_TYPE_LHPV);
						lhpvchargesCollHshmp = (HashMap<Long, HashMap<Long, Double>>) lhpvSettChargesValObj.get("chargesCollMainHshmp");
					}

					final var displayDataConfig	= cManip.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.DISPLAY_DATA_CONFIGURATION);
					displayDataConfig.put(Constant.EXEC_FEILD_PERMISSION, cManip.getExecutiveFieldPermission(request));
					displayDataConfig.put(Constant.EXECUTIVE_TYPE, executive.getExecutiveType());

					final var	lrTypeWiseZeroAmtHM	= DisplayDataConfigurationBllImpl.getInstance().lrTypeWiseZeroAmountHMReport(displayDataConfig, resultList.stream().filter(e -> e.getWayBillTypeId() > 0).map(TruckLoadingModel::getWayBillTypeId).collect(Collectors.toSet()), ReportIdentifierConstant.TRUCK_LOADING_REPORT);

					final ValueObject rawBranches =  cManip.getGenericBranchesDetail(request);
					final Map<Long, Branch> branchCache = new HashMap<>(rawBranches.size());
				
					for (Map.Entry<Object, Object> entry : rawBranches.getHtData().entrySet()) {

					    final Object key   = entry.getKey();
					    final Object value = entry.getValue();

					    if (key != null && value instanceof Branch) {
					        try {
					            final long branchId = Long.parseLong(key.toString());
					            branchCache.put(branchId, (Branch) value);
					        } catch (NumberFormatException ignore) {
					        }
					    }
					}

					// ---- Vehicle cache (Long → VehicleNumberMaster)
					final Map<Long, VehicleNumberMaster> vehicleCache = cManip.getALLVehicleNumberOfGroup(request, executive.getAccountGroupId());

					final ValueObject rawSubRegions = cManip.getAllSubRegions(request);

					final Map<Long, SubRegion> subRegionCache = new HashMap<>(rawSubRegions.size());

					for (Map.Entry<Object, Object> e : rawSubRegions.getHtData().entrySet()) {

					    if (e.getValue() instanceof SubRegion) {
					        try {
					            subRegionCache.put(
					                Long.parseLong(e.getKey().toString()),
					                (SubRegion) e.getValue()
					            );
					        } catch (Exception ignore) {
					        }
					    }
					}


					final List<LocationsMapping> locationMappings =
					        cManip.getLocationMappingListForGroup(
					                request,
					                executive.getAccountGroupId());

					final Map<Long, LocationsMapping> locationMappingByAssignedId =
					        new HashMap<>(locationMappings.size());

					for (LocationsMapping lm : locationMappings) {
					    locationMappingByAssignedId.put(lm.getAssignedLocationId(), lm);
					}

					for (final TruckLoadingModel reportModel : resultList) {

					    final long lhpvId = reportModel.getLhpvId();

					    /* ========== Freight Zero ========== */
					    if (lrTypeWiseZeroAmtHM.getOrDefault(reportModel.getWayBillTypeId(), false)) {
					        reportModel.setFreightAmount(0);
					    }

					    /* ========== Charges ========== */
					    if (lhpvchargesCollHshmp != null) {
					        final Map<Long, Double> chargesHM = lhpvchargesCollHshmp.get(lhpvId);
					        if (chargesHM != null) {
					            reportModel.setTotalAmount(
					                    chargesHM.getOrDefault((long) LhpvChargeTypeMaster.LORRY_HIRE, 0d));
					            reportModel.setAdvanceAmount(
					                    chargesHM.getOrDefault((long) LhpvChargeTypeMaster.ADVANCE_AMOUNT, 0d));
					            reportModel.setBalanceAmount(
					                    chargesHM.getOrDefault((long) LhpvChargeTypeMaster.BALANCE_AMOUNT, 0d));
					        }
					    }

					    /* ========== Balance Payable Branch ========== */
					    final long balanceBranchId = reportModel.getBalancePayableAtBranchId();
					    if (balanceBranchId > 0) {
					        final Branch branch = branchCache.get(balanceBranchId);
					        reportModel.setBalancePayableAtBranch(branch != null ? branch.getName() : "--");
					    } else {
					        reportModel.setBalancePayableAtBranch("--");
					    }

					    /* ========== Vehicle (CACHE HIT) ========== */
					    final VehicleNumberMaster vehicle =
					            vehicleCache.get(reportModel.getVehicleNumberMasterId());

					    if (vehicle != null) {
					        reportModel.setVehicleNumber(vehicle.getVehicleNumber());
					        reportModel.setVehicleOwnerName(vehicle.getRegisteredOwner());

					        final int owner = vehicle.getVehicleOwner();
					        if (owner == TransportCommonMaster.OWN_VEHICLE_ID)
					            reportModel.setVehicleOwner("O");
					        else if (owner == TransportCommonMaster.HIRED_VEHICLE_ID)
					            reportModel.setVehicleOwner("H");
					        else if (owner == TransportCommonMaster.ATTACHED_VEHICLE_ID)
					            reportModel.setVehicleOwner("A");
					    }

					    /* ========== Source / Destination Branch ========== */
					    final Branch srcBranch = branchCache.get(reportModel.getSourceBranchId());

					    if (srcBranch != null) {
					        final SubRegion subRegion = subRegionCache.get(srcBranch.getSubRegionId());
					        reportModel.setSubRegionName(
					            subRegion != null ? subRegion.getName() : "--"
					        );
					        reportModel.setSourceBranchString(srcBranch.getName());
					    } else {
					        reportModel.setSubRegionName("--");
					        reportModel.setSourceBranchString("--");
					    }

					    final Branch destBranch = branchCache.get(reportModel.getDestinationBranchId());
					    if (destBranch != null) {
					        reportModel.setDestinationBranchString(destBranch.getName());
					    }

					    /* ========== LS Destination ========== */
					    final Branch lsDestBranch =
					            branchCache.get(reportModel.getLsDestinationBranchId());

					    if (lsDestBranch != null) {

					        if (lsDestBranch.getTypeOfLocation()
					                == Branch.TYPE_OF_LOCATION_OPERATIONAL_PLACE) {

					            final LocationsMapping lm =
					                    locationMappingByAssignedId.get(lsDestBranch.getBranchId());

					            final Branch handlingBranch =
					                    lm != null ? branchCache.get(lm.getLocationId()) : null;

					            reportModel.setLsDestination(
					                    (handlingBranch != null ? handlingBranch.getName() : "--")
					                            + " (" + lsDestBranch.getName() + ")");

					        } else {
					            reportModel.setLsDestination(lsDestBranch.getName());
					        }
					    }


					    /* ========== LS Source ========== */
					    final Branch lsSourceBranch = branchCache.get(reportModel.getLsSourceBranchId());
					    if (lsSourceBranch != null) {
					        reportModel.setLsSource(lsSourceBranch.getName());
					    }

					    /* ========== Time ========== */
					    reportModel.setReceivedTimeStr(
					            DateTimeUtility.getTimeFromTimeStamp(
					                    reportModel.getReceivedLedgerDateTime()));

					    /* ========== Freight Accumulation ========== */
					    final TruckLoadingModel existing = truckLoadingHM.get(lhpvId);
					    if (existing != null) {
					        reportModel.setFreightAmount(
					                existing.getFreightAmount() + reportModel.getFreightAmount());
					    }
					    truckLoadingHM.put(lhpvId, reportModel);

					    /* ========== Dispatch Map ========== */
					    lhpvDispatchCollHM
					            .computeIfAbsent(lhpvId, k -> new HashMap<>())
					            .put(reportModel.getDispatchLedgerId(), reportModel);
					}

					/*
					for (final TruckLoadingModel reportModel : resultList) {
						final boolean	isShowAmountZero	= lrTypeWiseZeroAmtHM.getOrDefault(reportModel.getWayBillTypeId(), false);

						if(isShowAmountZero)
							reportModel.setFreightAmount(0);

						if(lhpvChargesArr != null && lhpvchargesCollHshmp != null && lhpvchargesCollHshmp.get(reportModel.getLhpvId()) != null) {
							final var	chargesHM	= lhpvchargesCollHshmp.get(reportModel.getLhpvId());

							reportModel.setTotalAmount(chargesHM.getOrDefault((long) LhpvChargeTypeMaster.LORRY_HIRE, 0d));
							reportModel.setAdvanceAmount(chargesHM.getOrDefault((long) LhpvChargeTypeMaster.ADVANCE_AMOUNT, 0d));
							reportModel.setBalanceAmount(chargesHM.getOrDefault((long) LhpvChargeTypeMaster.BALANCE_AMOUNT, 0d));
						}

						if(reportModel.getBalancePayableAtBranchId() > 0)
							reportModel.setBalancePayableAtBranch(cManip.getGenericBranchDetailCache(request, reportModel.getBalancePayableAtBranchId()).getName());
						else
							reportModel.setBalancePayableAtBranch("--");

						final var	vehicleNo   = cManip.getVehicleNumber(request, executive.getAccountGroupId(), reportModel.getVehicleNumberMasterId());

						reportModel.setVehicleNumber(vehicleNo.getVehicleNumber());
						reportModel.setVehicleOwnerName(vehicleNo.getRegisteredOwner());

						if(vehicleNo.getVehicleOwner() == TransportCommonMaster.OWN_VEHICLE_ID)
							reportModel.setVehicleOwner("O");
						else if(vehicleNo.getVehicleOwner() == TransportCommonMaster.HIRED_VEHICLE_ID)
							reportModel.setVehicleOwner("H");
						else if(vehicleNo.getVehicleOwner() == TransportCommonMaster.ATTACHED_VEHICLE_ID)
							reportModel.setVehicleOwner("A");

						if(reportModel.getSourceBranchId() > 0)
							reportModel.setSourceBranchString(cManip.getGenericBranchDetailCache(request, reportModel.getSourceBranchId()).getName());

						if(reportModel.getDestinationBranchId() > 0)
							reportModel.setDestinationBranchString(cManip.getGenericBranchDetailCache(request, reportModel.getDestinationBranchId()).getName());

						final var	subReId 		= cManip.getGenericBranchDetailCache(request, reportModel.getSourceBranchId()).getSubRegionId();
						final var	subregionName 	= cManip.getGenericSubRegionById(request, subReId).getName();
						final var	lsDestBranch 	= cManip.getGenericBranchDetailCache(request, reportModel.getLsDestinationBranchId());

						if(lsDestBranch != null)
							if(lsDestBranch.getTypeOfLocation() == Branch.TYPE_OF_LOCATION_OPERATIONAL_PLACE) {
								final var locationMap 			= cManip.getLocationMapping(request, executive.getAccountGroupId(), lsDestBranch.getBranchId());
								final var handlingBranchName	= cManip.getGenericBranchDetailCache(request, locationMap.getLocationId()).getName();
								reportModel.setLsDestination(handlingBranchName + " (" +lsDestBranch.getName() + ")");
							}else
								reportModel.setLsDestination(lsDestBranch.getName());

						reportModel.setSubRegionName(subregionName);
						reportModel.setLsSource(cManip.getGenericBranchDetailCache(request, reportModel.getLsSourceBranchId()).getName());
						reportModel.setReceivedTimeStr(DateTimeUtility.getTimeFromTimeStamp(reportModel.getReceivedLedgerDateTime()));

						if(truckLoadingHM.get(reportModel.getLhpvId()) != null)
							reportModel.setFreightAmount(truckLoadingHM.get(reportModel.getLhpvId()).getFreightAmount() + reportModel.getFreightAmount());

						truckLoadingHM.put(reportModel.getLhpvId(), reportModel);

						var	dispatchCollHM = lhpvDispatchCollHM.get(reportModel.getLhpvId());

						if(dispatchCollHM == null){
							dispatchCollHM = new HashMap<>();
							dispatchCollHM.put(reportModel.getDispatchLedgerId(), reportModel);
							lhpvDispatchCollHM.put(reportModel.getLhpvId(), dispatchCollHM);
						} else
							dispatchCollHM.put(reportModel.getDispatchLedgerId(), reportModel);
					}

					final List<TruckLoadingModel>	sortedResultList =  truckLoadingHM.values().stream().collect(Collectors.toList());
					sortedResultList.sort(Comparator.comparing(TruckLoadingModel::getCreationDateTimeStamp));

					final var	reports = new TruckLoadingModel[sortedResultList.size()];
					sortedResultList.toArray(reports);

					*/
					final List<TruckLoadingModel> sortedResultList =
					        new ArrayList<>(truckLoadingHM.values());

					sortedResultList.sort(
					        Comparator.comparing(TruckLoadingModel::getCreationDateTimeStamp));

					final TruckLoadingModel[] reports =
					        sortedResultList.toArray(new TruckLoadingModel[0]);

					request.setAttribute("report", reports);
					request.setAttribute("dispatchColl", lhpvDispatchCollHM);

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

			ActionStaticUtil.setRequestAttribute(request,"customAddressBranchId", srcBranchId);
			ActionStaticUtil.setRequestAttribute(request,"customAddressIdentifer", CustomGroupMapper.IDENTIFIER_BOOKING);

			ActionStaticUtil.setReportViewModel(request);
			ActionStaticUtil.getReportElapsedTime(TRACE_ID, executive, startTime);
			request.setAttribute("nextPageToken", "success");
		} catch (final Exception _e) {
			ActionStaticUtil.catchActionException(request, _e, error);
		}
	}
}
