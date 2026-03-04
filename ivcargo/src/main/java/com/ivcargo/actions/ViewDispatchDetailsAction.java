package com.ivcargo.actions;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.DispatchBLL;
import com.businesslogic.ddm.GenerateDDMBLL;
import com.framework.Action;
import com.iv.bll.impl.loadingsheet.LoadingSheetToTripSheetBllImpl;
import com.iv.constant.properties.LrViewConfigurationPropertiesConstant;
import com.iv.constant.properties.SearchConfigPropertiesConstant;
import com.iv.dto.constant.BusinessFunctionConstants;
import com.iv.dto.constant.DispatchLedgerConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.properties.constant.LoadingSheetPropertyConstant;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.reports.ReportView;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.BranchDao;
import com.platform.dao.DispatchSummaryDao;
import com.platform.dao.LHPVDao;
import com.platform.dto.Branch;
import com.platform.dto.DeliveryRunSheetLedger;
import com.platform.dto.DispatchLedger;
import com.platform.dto.DispatchSummary;
import com.platform.dto.SubRegion;
import com.platform.dto.constant.WayBillStatusConstant;
import com.platform.dto.model.ReportViewModel;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

public class ViewDispatchDetailsAction implements Action {

	public static final String TRACE_ID = "ViewDispatchDetailsAction";

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	 		error 							= null;
		var 							lrReceivedCount 				= 0;
		var								subRegionWiseLimitedPermission	= false;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	cManip 						= new CacheManip(request);
			final var	executive 					= cManip.getExecutive(request);
			final var	dispatchBLL					= new DispatchBLL();
			final var	inValObj					= new ValueObject();
			final var	configuration				= cManip.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.LR_SEARCH);
			final var	lsPropertyConfig			= cManip.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.DISPATCH);
			final var	syncPropObj 				= cManip.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.SYNC_WITH_IV_FLEET);
			final var	wayBillId 					= Long.parseLong(request.getParameter("wayBillId"));
			final var	subregionCollection 		= cManip.getAllSubRegions(request);

			inValObj.put("waybillid", wayBillId);

			final var	outValObj 					= dispatchBLL.getOutboundManifestForPrint(inValObj);
			final var	searchConfiguration			= cManip.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.SEARCH_CONFIGURATION);
			final var	execFunctions    			= cManip.getExecFunctions(request);

			if(request.getSession().getAttribute("subRegionWiseLimitedPermission") != null)
				subRegionWiseLimitedPermission	= (boolean) request.getSession().getAttribute("subRegionWiseLimitedPermission");

			if(execFunctions == null) {
				error.put("errorCode", CargoErrorList.GROUP_PERMISSIONS_MISSING);
				error.put("errorDescription", CargoErrorList.GROUP_PERMISSIONS_MISSING_DESCRIPTION);
				request.setAttribute("cargoError", error);
				request.setAttribute("nextPageToken", "failure");
				return;
			}

			final var	execFeildPermissionForTransportSearch = execFunctions.get(BusinessFunctionConstants.TRANSPORTSEARCHWAYBILL);

			request.setAttribute("execPermissionBasedSearchLr", searchConfiguration.getOrDefault(SearchConfigPropertiesConstant.EXEC_PERMISSION_BASED_SEARCH_LR, false));
			request.setAttribute("execFeildPermissionForTransportSearch", execFeildPermissionForTransportSearch);

			if(outValObj != null) {
				final var	dispatchLedger = (DispatchLedger[]) outValObj.get("dispatchLedgers");

				if(dispatchLedger != null) {
					for (final DispatchLedger element : dispatchLedger) {
						lrReceivedCount = 0;

						if(element.getDestinationBranchId() > 0){
							var	descBranch 	= cManip.getGenericBranchDetailCache(request, element.getDestinationBranchId());

							if(descBranch == null)
								descBranch = BranchDao.getInstance().findByBranchId(element.getDestinationBranchId());

							element.setDestinationBranch(descBranch.getName());
							element.setDestinationSubRegionId(cManip.getGenericBranchDetailCache(request, element.getDestinationBranchId()).getSubRegionId());
							element.setDestinationSubRegion(cManip.getGenericSubRegionById(request, element.getDestinationSubRegionId()).getName());
						} else {
							final var	descBranch 	= cManip.getGenericBranchDetailCache(request, element.getDeliveryPlaceId());

							if(descBranch != null && descBranch.getTypeOfLocation() == Branch.TYPE_OF_LOCATION_OPERATIONAL_PLACE)
								element.setDestinationBranch(descBranch.getName());
							else {
								element.setDestinationSubRegion("");
								element.setDestinationBranch("");
							}
						}

						if(element.getDispatchExecutive() != null)
							element.setDispatchExecutive(element.getDispatchExecutive());
						else
							element.setDispatchExecutive("--");

						if(element.getlHPVNumber() != null) {
							final var	lhpv = LHPVDao.getInstance().getLHPVDetailsWithCancel(element.getLhpvId());

							if(lhpv.getBlhpvId() > 0) {
								final var	branch 		= cManip.getGenericBranchDetailCache(request, lhpv.getbLHPVBranchId());
								final var	subRegion 	= (SubRegion) subregionCollection.get(branch.getSubRegionId());

								element.setBlhpvId(lhpv.getBlhpvId());
								element.setBlhpvNumber(lhpv.getbLHPVNumber());
								element.setBlhpvBranchId(lhpv.getbLHPVBranchId());
								element.setBlhpvBranchName(branch.getName());
								element.setBlhpvSubRegionId(branch.getSubRegionId());
								element.setBlhpvSubRegionName(subRegion.getName());
							}
						}

						element.setSourceBranch(cManip.getGenericBranchDetailCache(request, element.getSourceBranchId()).getName());
						element.setSourceSubRegionId(cManip.getGenericBranchDetailCache(request, element.getSourceBranchId()).getSubRegionId());
						element.setSourceSubRegion(cManip.getGenericSubRegionById(request, element.getSourceSubRegionId()).getName());
						element.setlHPVNumber(Utility.checkedNullCondition(element.getlHPVNumber(), (short) 1));
						element.setLhpvRemark(Utility.checkedNullCondition(element.getLhpvRemark(), (short) 1));
						element.setDriverName(Utility.checkedNullCondition(element.getDriverName(), (short) 1));
						element.setCleanerName(Utility.checkedNullCondition(element.getCleanerName(), (short) 1));
						element.setRemark(Utility.checkedNullCondition(element.getRemark(), (short) 1));
						element.setVehicleAgentName(Utility.checkedNullCondition(element.getVehicleAgentName(), (short) 1));

						if(element.getStatus() == DispatchLedgerConstant.DISPATCHLEDGER_WAYBILL_STATUS_DISPATCHED)
							element.setDispatchStatusDetails("Intransit");
						else if (element.getStatus() == DispatchLedgerConstant.DISPATCHLEDGER_WAYBILL_STATUS_RECEIVED)
							element.setDispatchStatusDetails("TRUCK Arrived and Goods received");
						else
							element.setDispatchStatusDetails("--");

						var isLSReceive	= false;

						if(element.getStatus() == DispatchLedgerConstant.DISPATCHLEDGER_WAYBILL_STATUS_RECEIVED)
							isLSReceive = true;
						else if(element.getLhpvId() > 0)
							isLSReceive = LHPVDao.getInstance().anyLSReceivedWithInLHPV(Long.toString(element.getLhpvId()));

						if(subRegionWiseLimitedPermission)
							isLSReceive = true;

						final var isBlhpvCreated		= element.getBlhpvId() > 0;

						element.setEditVehicleNumber((boolean) lsPropertyConfig.getOrDefault(LoadingSheetPropertyConstant.ALLOW_EDIT_VEHICLE, false) && element.getVehicleNumber() != null
								&& !isLSReceive && element.getStatus() != DispatchLedgerConstant.DISPATCHLEDGER_WAYBILL_STATUS_CANCELLED
								&& !isBlhpvCreated);

						element.setVehicleNumber(Utility.checkedNullCondition(element.getVehicleNumber(), (short) 1));
						element.setBlhpvNumber(Utility.checkedNullCondition(element.getBlhpvNumber(), (short) 1));
						element.setConsolidatedEwaybillNumber(Utility.checkedNullCondition(element.getConsolidatedEwaybillNumber(), (short) 1));

						if((boolean) lsPropertyConfig.getOrDefault(LoadingSheetPropertyConstant.VALIDATE_TRIP_SHEET_BY_STATUS_FROM_FLEET, false) && element.getTripSheetId() != null && element.getTripSheetId() > 0)
							element.setTripSheetStatus(LoadingSheetToTripSheetBllImpl.getInstance().getTripSheetStatusByTripSheetId(element.getTripSheetId(), syncPropObj));
						else
							element.setTripSheetStatus((short) 0);

						final var	dispatchSummaryList	= DispatchSummaryDao.getInstance().getDispatchSumaryReceivedStatus(element.getDispatchLedgerId());

						if(dispatchSummaryList != null) {
							for (final DispatchSummary element2 : dispatchSummaryList)
								if(element2.getReceivedSummaryStatus() == WayBillStatusConstant.WAYBILL_STATUS_RECEIVED)
									lrReceivedCount++;

							if(lrReceivedCount > 0 && lrReceivedCount != dispatchSummaryList.size())
								element.setStatus(DispatchLedgerConstant.DISPATCHLEDGER_WAYBILL_STATUS_PARTIAL_RECEIVED);

							element.setAnyLrReceived(lrReceivedCount > 0);
						}
					}

					setDDMDetails(inValObj, request);
					request.setAttribute("dispatchLedger", dispatchLedger);
					request.setAttribute("isStatusShow", configuration.getOrDefault(LrViewConfigurationPropertiesConstant.IS_SHOW_STATUS_IN_LS_DETAILS, false));
					request.setAttribute("isLhpvRemarkShow", configuration.getOrDefault(LrViewConfigurationPropertiesConstant.SHOW_LHPV_REMARK_IN_LS_DETAILS, false));
					request.setAttribute("showVehicleType", configuration.getOrDefault(LrViewConfigurationPropertiesConstant.SHOW_VEHICLE_TYPE_IN_LS_DETAILS, false));
					request.setAttribute("showVehicleAgentNameInLSDetails", configuration.getOrDefault(LrViewConfigurationPropertiesConstant.SHOW_VEHICLE_AGENT_NAME_IN_LS_DETAILS, false));
					request.setAttribute("showCrossingAgentBillNumberInLsDetails", configuration.getOrDefault(LrViewConfigurationPropertiesConstant.SHOW_CROSSING_AGENT_BILL_NUMBER_IN_LS_DETAILS, false));
					request.setAttribute("showCrossingAgentNameInLsDetails", configuration.getOrDefault(LrViewConfigurationPropertiesConstant.SHOW_CROSSING_AGENT_NAME_IN_LS_DETAILS, false));
					request.setAttribute("showDriver2Name", configuration.getOrDefault(LrViewConfigurationPropertiesConstant.SHOW_DRIVER2_NAME_IN_LS_DETAILS, false));
					request.setAttribute("showBagNumber", (boolean) lsPropertyConfig.getOrDefault(LoadingSheetPropertyConstant.SHOW_BAG_NUMBER, false));

					var	reportViewModel = new ReportViewModel();
					reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);
					request.setAttribute("ReportViewModel",reportViewModel);
				} else {
					error.put("errorCode", CargoErrorList.NO_RECORDS);
					error.put("errorDescription", CargoErrorList.NO_RECORDS_DESCRIPTION);
					request.setAttribute("cargoError", error);
				}
			} else {
				error.put("errorCode", CargoErrorList.NO_RECORDS);
				error.put("errorDescription", CargoErrorList.NO_RECORDS_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}

			request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}
	}

	private void setDDMDetails(final ValueObject inValObj, final HttpServletRequest request) throws Exception {
		HashMap<String,Object>	error = null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			final var	generateDDMBLL	= new GenerateDDMBLL();
			final var	cManipDDM 		= new CacheManip(request);

			final var	executive 	= cManipDDM.getExecutive(request);
			final var	valObjDDM = generateDDMBLL.getOutboundManifestForDDMPrint(inValObj);

			if(valObjDDM != null){
				final var	deliveryRunSheetLedger = (DeliveryRunSheetLedger[]) valObjDDM.get("DeliveryRunSheetLedgers");

				if(deliveryRunSheetLedger != null) {

					for (final DeliveryRunSheetLedger element : deliveryRunSheetLedger) {
						if(element.getDestinationBranchId() > 0) {
							final var	descBranch 		= cManipDDM.getGenericBranchDetailCache(request, element.getDestinationBranchId());
							element.setDestinationBranch(descBranch.getName());
						} else
							element.setDestinationBranch(element.getTruckDestination());

						final var	srcBranch 		= cManipDDM.getGenericBranchDetailCache(request, element.getSourceBranchId());

						element.setSourceBranch(srcBranch.getName());

						if(element.getVehicleId() > 0) {
							final var	vehicleNumber 	= cManipDDM.getVehicleNumber(request, executive.getAccountGroupId(), element.getVehicleId());

							if(vehicleNumber != null)
								element.setVehicleNumber(vehicleNumber.getVehicleNumber());
						}

						element.setDriverName(Utility.checkedNullCondition(element.getDriverName(), (short) 1));
						element.setCleanerName(Utility.checkedNullCondition(element.getCleanerName(), (short) 1));
						element.setConsolidateEWaybillNumber(Utility.checkedNullCondition(element.getConsolidateEWaybillNumber(), (short) 1));
						element.setLhpvNumber(Utility.checkedNullCondition(element.getLhpvNumber(), (short) 1));
						element.setBlhpvNumber(Utility.checkedNullCondition(element.getBlhpvNumber(), (short) 1));
						element.setVehicleAgentName(Utility.checkedNullCondition(element.getVehicleAgentName(), (short) 1));

					}

					request.setAttribute("deliveryRunSheetLedger", deliveryRunSheetLedger);
				} else {
					error.put("errorCode", CargoErrorList.NO_RECORDS);
					error.put("errorDescription", CargoErrorList.NO_RECORDS_DESCRIPTION);
					request.setAttribute("cargoError", error);
				}
			}
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}
	}

}