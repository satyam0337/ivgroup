package com.ivcargo.reports;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.StringJoiner;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.utils.CollectionUtility;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.DeliveryRunSheetLedgerDao;
import com.platform.dao.DispatchLedgerDao;
import com.platform.dao.LHPVDao;
import com.platform.dao.LhpvChargesForGroupDao;
import com.platform.dao.LhpvSettlementChargesDao;
import com.platform.dto.Branch;
import com.platform.dto.CustomGroupMapper;
import com.platform.dto.DeliveryRunSheetLedger;
import com.platform.dto.DispatchLedger;
import com.platform.dto.LHPV;
import com.platform.dto.LhpvChargeTypeMaster;
import com.platform.dto.LhpvChargesForGroup;
import com.platform.dto.configuration.report.fleet.TruckMovementReportConfigurationDTO;
import com.platform.resource.CargoErrorList;

public class TruckMovementReportAction implements Action {

	@Override
	@SuppressWarnings("unchecked")
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>					error 							= null;
		LHPV[] 									reportModel 					= null;
		LhpvChargesForGroup[] 					lhpvChargesArr					= null;
		HashMap<Long, HashMap<Long, Double>>   	lhpvchargesCollHshmp  			= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeTruckMovementReportAction().execute(request, response);

			final var	whereClauseLS				= new StringJoiner(" ");
			final var	whereClauseDDM				= new StringJoiner(" ");
			List<DispatchLedger>	resultListIntLS				= new ArrayList<>();
			List<DeliveryRunSheetLedger>	resultListDDM				= new ArrayList<>();
			final var	cache 						= new CacheManip(request);
			final var	executive 					= cache.getExecutive(request);
			final var	objectIn 					= new ValueObject();
			final var	sdf         				= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			final var	fromDate    				= new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00").getTime());
			final var	toDate      				= new Timestamp(sdf.parse(JSPUtility.GetString(request, "toDate") + " 23:59:59").getTime());
			final var	vehicleNoId 				= JSPUtility.GetLong(request, "selectedVehicleNo");
			final var	configuration				= ReadAllConfigurationsBllImpl.getInstance().getOldReportConfigurationData(ReportIdentifierConstant.TRUCK_MOVEMENT_REPORT, executive.getAccountGroupId());
			final var	showPumpReceiptDetailsColumns	= configuration.getBoolean(TruckMovementReportConfigurationDTO.SHOW_PUMP_RECEIPT_DETAILS_COLUMNS,false);
			final var	showInterBranchLSData		= configuration.getBoolean(TruckMovementReportConfigurationDTO.SHOW_INTER_BRANCH_LS_DATA,false);
			final var	showDDMData					= configuration.getBoolean(TruckMovementReportConfigurationDTO.SHOW_DDM_DATA,false);

			objectIn.put("fromDate", fromDate);
			objectIn.put("toDate", toDate);
			objectIn.put("accountGroupId", executive.getAccountGroupId());
			objectIn.put("vehicleNoId", vehicleNoId);

			if(showInterBranchLSData) {
				whereClauseLS.add("ds.AccountGroupId = " + executive.getAccountGroupId());
				whereClauseLS.add("AND ds.TripDateTime >= '" + fromDate + "'");
				whereClauseLS.add("AND ds.TripDateTime <= '" + toDate + "'");
				whereClauseLS.add("AND ds.VehicleNumberMasterId = " + vehicleNoId);
				whereClauseLS.add("AND ds.TypeOfLS = 3");
				whereClauseLS.add("ORDER By TripDateTime");

				resultListIntLS	= DispatchLedgerDao.getInstance().getTruckMovementDataForInterBranchLS(whereClauseLS.toString());
			}

			if(showDDMData) {
				whereClauseDDM.add("drs.AccountGroupId = " + executive.getAccountGroupId());
				whereClauseDDM.add("AND drs.CreationDateTime >= '" + fromDate + "'");
				whereClauseDDM.add("AND drs.CreationDateTime <= '" + toDate + "'");
				whereClauseDDM.add("AND drs.VehicleId = " + vehicleNoId);
				whereClauseDDM.add("ORDER By CreationDateTime");

				resultListDDM	= DeliveryRunSheetLedgerDao.getInstance().getTruckMovementDataForDDM(whereClauseDDM.toString());
			}

			final var	resultArray = LHPVDao.getInstance().getTruckMovementData(objectIn);

			if(resultArray != null && resultArray.length > 0)
				if(showPumpReceiptDetailsColumns)
					reportModel = resultArray;
				else {
					final var	resultList  = new ArrayList<>(Arrays.asList(resultArray));
					resultList.sort(Comparator.comparing(LHPV::getCreationDateTimeStamp));

					final HashMap<Long, LHPV>	resultMap   = resultList.stream()
							.collect(Collectors.toMap(LHPV::getLhpvId, Function.identity(), (e1, e2) -> e1, LinkedHashMap::new));

					reportModel = resultMap.values().toArray(new LHPV[0]);
				}

			if(reportModel != null) {
				final var	allLhpvChargesValObj = LhpvChargesForGroupDao.getInstance().getallLHPVChargeByAccGrpId(executive.getAccountGroupId(), LhpvChargesForGroup.IDENTIFIER_TYPE_LHPV);

				if(allLhpvChargesValObj != null)
					lhpvChargesArr = (LhpvChargesForGroup[]) allLhpvChargesValObj.get("modelArr");

				final var	lhpvIdArray	= Stream.of(reportModel).map(LHPV::getLhpvId).collect(Collectors.toList());

				if(lhpvIdArray != null && !lhpvIdArray.isEmpty()){
					final var	lhpvIdStr 				= CollectionUtility.getStringFromLongList(lhpvIdArray);

					final var	lhpvSettChargesValObj 	=  LhpvSettlementChargesDao.getInstance().getSetlementChargesByBlhpvIds(lhpvIdStr, LhpvChargesForGroup.IDENTIFIER_TYPE_LHPV);
					lhpvchargesCollHshmp 	= (HashMap<Long, HashMap<Long, Double>>) lhpvSettChargesValObj.get("chargesCollMainHshmp");
				}

				for (final LHPV element : reportModel) {
					
					var chargesHM = (lhpvchargesCollHshmp != null) ? lhpvchargesCollHshmp.get(element.getLhpvId()) : null;

					if (chargesHM != null) {
					    element.setTotalAmount(chargesHM.getOrDefault((long) LhpvChargeTypeMaster.LORRY_HIRE, 0d));
					    element.setAdvanceAmount(chargesHM.getOrDefault((long) LhpvChargeTypeMaster.ADVANCE_AMOUNT, 0d));
					    element.setBalanceAmount(chargesHM.getOrDefault((long) LhpvChargeTypeMaster.BALANCE_AMOUNT, 0d));
					    element.setAdditionalTruckAdvance(chargesHM.getOrDefault((long) LhpvChargeTypeMaster.ADDITIONAL_TRUCK_ADVANCE, 0d));
					} else {
					    element.setTotalAmount(0d);
					    element.setAdvanceAmount(0d);
					    element.setBalanceAmount(0d);
					    element.setAdditionalTruckAdvance(0d);
					}

					element.setBranch(cache.getGenericBranchDetailCache(request, element.getBranchId()).getName());

					if(element.getDestinationBranchId() > 0) {
						final var destinationBranch = cache.getGenericBranchDetailCache(request, element.getDestinationBranchId());

						if(destinationBranch.getTypeOfLocation() == Branch.TYPE_OF_LOCATION_OPERATIONAL_PLACE) {
							final var	handlingBranchId = destinationBranch.getHandlingBranchId();

							if(handlingBranchId > 0) {
								final var	handlingBranch = cache.getGenericBranchDetailCache(request, handlingBranchId);
								element.setDestinationBranch(destinationBranch.getName() + " (" + handlingBranch.getName() + ") ");
							}
						} else
							element.setDestinationBranch(destinationBranch.getName());
					} else
						element.setDestinationBranch("--");

					if(element.getBlhpvId() > 0) {
						final var	branch = cache.getGenericBranchDetailCache(request, element.getbLHPVBranchId());
						final var	subRegion = cache.getGenericSubRegionById(request, branch.getSubRegionId());
						element.setbLHPVSubRegionId(subRegion.getSubRegionId());
						element.setbLHPVBranchName(branch.getName());
						element.setbLHPVSubRegionName(subRegion.getName());
					}
				}

				if(resultListIntLS != null && !resultListIntLS.isEmpty()) {
					for(final DispatchLedger model : resultListIntLS) {
						if(model.getSourceBranchId() > 0)
							model.setSourceBranch(cache.getGenericBranchDetailCache(request, model.getSourceBranchId()).getName());
						else
							model.setSourceBranch("--");

						if(model.getDestinationBranchId() > 0)
							model.setDestinationBranch(cache.getGenericBranchDetailCache(request, model.getDestinationBranchId()).getName());
						else
							model.setDestinationBranch("--");
					}

					request.setAttribute("interBranchLSModel", resultListIntLS);
				}

				if(resultListDDM != null && !resultListDDM.isEmpty()) {
					for(final DeliveryRunSheetLedger model : resultListDDM) {
						if(model.getSourceBranchId() > 0)
							model.setSourceBranch(cache.getGenericBranchDetailCache(request, model.getSourceBranchId()).getName());
						else
							model.setSourceBranch("--");

						if(model.getDestinationBranchId() > 0)
							model.setDestinationBranch(cache.getGenericBranchDetailCache(request, model.getDestinationBranchId()).getName());
						else
							model.setDestinationBranch("--");
					}

					request.setAttribute("ddmModel", resultListDDM);
				}

				request.setAttribute("LHPVCollectionReportModel",reportModel);
				request.setAttribute("truckMovementReportConfig",configuration);

			} else {
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}

			ActionStaticUtil.setRequestAttribute(request,"customAddressBranchId", executive.getBranchId());
			ActionStaticUtil.setRequestAttribute(request,"customAddressIdentifer", CustomGroupMapper.IDENTIFIER_BOOKING);

			ActionStaticUtil.setReportViewModel(request);
			request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}
}
