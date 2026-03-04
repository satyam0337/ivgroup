package com.ivcargo.actions.transport;

import java.util.HashMap;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.module.receive.ReceivablesWayBillBLL;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.dto.ExecutiveFunctionsModel;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.properties.constant.DisplayDataWithinDateRangePropertiesConstant;
import com.iv.utils.constant.properties.ReceiveConfigurationPropertiesConstant;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.reports.ReportView;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.ExecutiveDao;
import com.platform.dao.TURSequenceCounterDao;
import com.platform.dto.AliasNameConstants;
import com.platform.dto.ConfigParam;
import com.platform.dto.DispatchLedger;
import com.platform.dto.TURSequenceCounter;
import com.platform.dto.configuration.modules.GroupConfigurationPropertiesDTO;
import com.platform.dto.constant.FeildPermissionsConstant;
import com.platform.dto.model.ReportViewModel;
import com.platform.dto.model.WayBillReceivableModel;
import com.platform.resource.CargoErrorList;
import com.platform.utils.TokenGenerator;
import com.platform.utils.Utility;

public class TransportViewReceivableWaybillAction implements Action {

	@Override
	@SuppressWarnings("unchecked")
	public void execute(HttpServletRequest request, HttpServletResponse response) {

		HashMap<String,Object>	 							error 					= null;
		var												isForceReceive					= false;
		var 											flagToReceive					= false;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	cManip 				= new CacheManip(request);
			final var	executive			= cManip.getExecutive(request);
			final var	execFldPermissions 	= cManip.getExecutiveFieldPermission(request);
			final var	inValObj			= new ValueObject();

			final var	execFeildPermission = execFldPermissions.get(FeildPermissionsConstant.RECEIVE_AND_DELIVER_LR);

			final var	dispatchLedgerId 	= JSPUtility.GetLong(request, "dispatchLedgerId", 0);
			inValObj.put("dispatchLedgerId", dispatchLedgerId);
			inValObj.put("accountGroupId", executive.getAccountGroupId());

			final var	receiveConfig			= cManip.getReceiveConfiguration(request, executive.getAccountGroupId());
			final var	executiveBranch			= cManip.getBranchById(request, executive.getAccountGroupId(), executive.getBranchId());
			final var	reciveWithShortExcess	= (boolean) receiveConfig.getOrDefault(ReceiveConfigurationPropertiesConstant.IS_RECEIVE_WITH_SHORT_EXCESS, false);

			if(reciveWithShortExcess || execFeildPermission != null) {
				if(request.getParameter("isForceReceive") != null)
					isForceReceive	= Boolean.parseBoolean(request.getParameter("isForceReceive"));
				else
					isForceReceive	= JSPUtility.GetBoolean(request, "isForceReceive", false);

				if(request.getParameter("flag") != null)
					flagToReceive	= Boolean.parseBoolean(request.getParameter("flag"));
				else
					flagToReceive	= JSPUtility.GetBoolean(request, "flag", false);

				response.sendRedirect("ViewReceivableWayBillAction.do?pageId=221&eventId=10&dispatchLedgerId="+dispatchLedgerId+"&isForceReceive="+isForceReceive+"&flag="+flagToReceive);
			} else {
				final var	allBranches				= cManip.getGenericBranchesDetail(request);
				final var	allSubRegions			= cManip.getAllSubRegions(request);
				final var	packingType				= cManip.getAllPackingType(request, executive.getAccountGroupId());
				final var	receiveLocationList		= cManip.getAssignedLocationsIdListByLocationIdId(request, executive.getBranchId(), executive.getAccountGroupId());
				final var	vehicleNumberHM			= cManip.getALLVehicleNumberOfGroup(request, executive.getAccountGroupId());

				final var		valObjIn				= new ValueObject();
				var				valueObjectOut			= new ValueObject();

				valObjIn.put("dispatchLedgerId", dispatchLedgerId);
				valObjIn.put(AliasNameConstants.EXECUTIVE, executive);
				valObjIn.put(ReceiveConfigurationPropertiesConstant.RECEIVE_CONFIGUARTION, receiveConfig);
				valObjIn.put(GroupConfigurationPropertiesDTO.GROUP_CONFIGURATION, cManip.getGroupConfiguration(request, executive.getAccountGroupId()));
				valObjIn.put(AliasNameConstants.ALL_BRANCHES, allBranches);
				valObjIn.put(AliasNameConstants.ALL_SUB_REGIONS, allSubRegions);
				valObjIn.put("receiveLocationList", receiveLocationList);
				valObjIn.put("vehicleNumberHM", vehicleNumberHM);
				valObjIn.put(ExecutiveFunctionsModel.EXECUTIVE_FUNCTION, cManip.getExecFunctions(request));
				valObjIn.put("execFieldPermissions", execFldPermissions);
				valObjIn.put("isForceReceive", isForceReceive);
				valObjIn.put(DisplayDataWithinDateRangePropertiesConstant.DISPLAY_DATA_CONFIGURATION_CONSTANT, cManip.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.DISPLAY_DATA_CONFIGURATION));

				valueObjectOut	= ReceivablesWayBillBLL.getInstance().getReceivablesWaybillDetailsByDispatchLedger(valueObjectOut, valObjIn);

				request.setAttribute("allowReceiveInterBranchLs", receiveConfig.getOrDefault(ReceiveConfigurationPropertiesConstant.ALLOW_RECEIVED_INTER_BRANCH_LS_IN_LS_DESTIONATION_BRANCH, false));

				if(valueObjectOut != null) {
					if(!valueObjectOut.containsKey("godownsForOld") && valueObjectOut.containsKey("godownNotFound")) {
						response.sendRedirect("SearchWayBill.do?pageId=0&eventId=1&filter=11");
						return;
					}

					if(valueObjectOut.containsKey(CargoErrorList.ERROR_DESCRIPTION)) {
						error.put(CargoErrorList.ERROR_CODE, valueObjectOut.get(CargoErrorList.ERROR_CODE));
						error.put(CargoErrorList.ERROR_DESCRIPTION, valueObjectOut.get(CargoErrorList.ERROR_DESCRIPTION));
						request.setAttribute("cargoError", error);
						request.setAttribute("nextPageToken", "failure");
						return;
					}

					final var	wayBillRecModels		= (List<WayBillReceivableModel>) valueObjectOut.get("WayBillReceivableModelForOld");

					request.setAttribute("executiveBranch",executiveBranch);

					if(wayBillRecModels != null) {
						var	reportViewModel = new ReportViewModel();
						reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);
						request.setAttribute("ReportViewModel",reportViewModel);

						request.setAttribute("isInterBranchLs", false);
						request.setAttribute("checkReceivability", receiveConfig.getOrDefault(ReceiveConfigurationPropertiesConstant.CHECK_RECEIVABILITY, false));
						request.setAttribute("WayBillReceivableModel", wayBillRecModels.toArray(new WayBillReceivableModel[wayBillRecModels.size()]));
						request.setAttribute("ManualTURDaysAllowed",(int) cManip.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_MAX_DAYS_OF_OPERATION_BEFORE_CASHSTATEMENT_ENTRY_ID));
						request.setAttribute("GodownList", valueObjectOut.get("godownsForOld"));
						request.setAttribute("vehicleNumberId", wayBillRecModels.stream().filter(wb -> wb.getVehicleNumberId() > 0).findFirst().orElse(new WayBillReceivableModel()).getVehicleNumberId());

						if(valueObjectOut.containsKey("dispatchLedgerForOld")) {
							final var	dispatchLedger	= (DispatchLedger) valueObjectOut.get("dispatchLedgerForOld");

							request.setAttribute("lsNumber", dispatchLedger.getLsNumber());
							request.setAttribute("scrBranch", dispatchLedger.getSourceBranch());
							request.setAttribute("scrSubRegion", dispatchLedger.getSourceSubRegion());
							request.setAttribute("desBranch", dispatchLedger.getDestinationBranch());
							request.setAttribute("desSubRegion", dispatchLedger.getDestinationSubRegion());
							request.setAttribute("date", dispatchLedger.getTripDateTime());
							request.setAttribute("vehicleNo", dispatchLedger.getVehicleNumber());
							request.setAttribute("driver", Utility.checkedNullCondition(dispatchLedger.getDriverName(), (short) 1));
							request.setAttribute("cleaner", Utility.checkedNullCondition(dispatchLedger.getCleanerName(), (short) 1));
							request.setAttribute("driverNo", Utility.checkedNullCondition(dispatchLedger.getDriver1MobileNumber1(), (short) 1));
						}

						request.setAttribute("BranchExecutives", ExecutiveDao.getInstance().getActiveExecutiveByBranchId(executive.getBranchId()));
						request.setAttribute("receiveLocationList", receiveLocationList);
						request.setAttribute("DeliveryCharges",cManip.getActiveDeliveryCharges(request, executive.getBranchId()));
						//specify the sequenceCounter type for RANGE_INCREMENT(DB check) --- By Prakash
						request.setAttribute("TURSequenceCounter", TURSequenceCounterDao.getInstance().getTURSequenceCounterToDisplay(executive.getAccountGroupId(), executive.getBranchId(), TURSequenceCounter.TUR_SEQUENCE_MANUAL));
						request.setAttribute("receivedLedger", valueObjectOut.get("receivedLedgerForOld"));
					}

					request.setAttribute("discountTypes", valueObjectOut.get("discountTypes"));
					request.setAttribute("packingType", packingType);
					request.setAttribute("isDDDV", valueObjectOut.getBoolean("isDDDV", false));

					final var token = TokenGenerator.nextToken();
					request.setAttribute(TokenGenerator.RECEIVE_TOKEN_KEY, token);
					request.getSession().setAttribute(TokenGenerator.RECEIVE_TOKEN_KEY, token);

					request.setAttribute("showManualTUR", receiveConfig.getOrDefault(ReceiveConfigurationPropertiesConstant.SHOW_MANUAL_TUR, false));
					request.setAttribute("isRangeCheckInManualTUR", receiveConfig.getOrDefault(ReceiveConfigurationPropertiesConstant.RANGE_CHECK_IN_MANUAL_TUR, true));
					request.setAttribute("showGodownSelectionForDDDVLS", receiveConfig.getOrDefault(ReceiveConfigurationPropertiesConstant.SHOW_GODOWN_SELECTION_FOR_DDDV_LS,false));
				} else {
					error.put(CargoErrorList.ERROR_CODE, CargoErrorList.NO_RECORDS);
					error.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.NO_RECORDS_DESCRIPTION);
					request.setAttribute("cargoError", error);
				}

				request.setAttribute("nextPageToken", "success_" + executive.getAccountGroupId());
			}
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}
	}
}