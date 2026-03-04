/**
 *
 */
package com.ivcargo.ajax;

import java.io.PrintWriter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.ObjectUtils;
import org.apache.commons.lang3.StringUtils;
import org.json.JSONObject;

import com.businesslogic.ReceivablesBLL;
import com.businesslogic.module.receive.ReceivablesWayBillBLL;
import com.businesslogic.properties.GeneralConfiguration;
import com.framework.Action;
import com.iv.constant.properties.GeneralConfigurationPropertiesConstant;
import com.iv.constant.properties.lhpv.LHPVPropertiesConstant;
import com.iv.convertor.JsonConvertor;
import com.iv.dto.AccountGroup;
import com.iv.dto.ExecutiveFunctionsModel;
import com.iv.dto.TransportListMaster;
import com.iv.dto.constant.FeildPermissionsConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.logsapp.LogWriter;
import com.iv.properties.constant.DisplayDataWithinDateRangePropertiesConstant;
import com.iv.utils.constant.Constant;
import com.iv.utils.constant.PodWayBillPropertiesConstant;
import com.iv.utils.constant.properties.ReceiveConfigurationPropertiesConstant;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.exception.ExceptionProcess;
import com.iv.utils.utility.CollectionUtility;
import com.ivcargo.reports.ReportView;
import com.ivcargo.utils.CacheManip;
import com.ivcargo.utils.JsonUtility;
import com.platform.dto.AccountGroupTieUpConfiguration;
import com.platform.dto.AliasNameConstants;
import com.platform.dto.Branch;
import com.platform.dto.ConfigParam;
import com.platform.dto.Executive;
import com.platform.dto.SubRegion;
import com.platform.dto.TransportCommonMaster;
import com.platform.dto.WayBillTaxDetails;
import com.platform.dto.configuration.discountlimit.ModuleWiseDiscountLimitConfigurationDTO;
import com.platform.dto.configuration.mindateselection.ModuleWiseMinDateSelectionConfigurationDTO;
import com.platform.dto.configuration.modules.BankStatementConfigurationDTO;
import com.platform.dto.configuration.modules.CashStatementConfigurationDTO;
import com.platform.dto.configuration.modules.DashBoardConfigurationDTO;
import com.platform.dto.configuration.modules.DocumentCodeConfigurationDTO;
import com.platform.dto.configuration.modules.GenerateCashReceiptDTO;
import com.platform.dto.configuration.modules.GroupConfigurationPropertiesDTO;
import com.platform.dto.configuration.modules.LrCostConfigurationDTO;
import com.platform.dto.constant.ExecutiveTypeConstant;
import com.platform.dto.constant.VehicleNumberMasterConstant;
import com.platform.dto.model.ChargeTypeModel;
import com.platform.dto.model.ReportViewModel;
import com.platform.jsonconstant.JsonConstant;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Converter;
import com.platform.utils.TokenGenerator;
import com.platform.utils.Utility;

/**
 * @author Anant Chaudhary	06-07-2016
 *
 */
public class ViewReceivableWayBillAjaxAction implements Action {

	public static final String TRACE_ID = "ViewReceivableWayBillAjaxAction";

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		PrintWriter						out							= null;
		JSONObject						jsonObjectIn				= null;
		JSONObject						jsonObjectOut				= null;
		short							filter						= 0;

		try {
			response.setContentType("application/json"); // Setting response for JSON Content

			out						= response.getWriter();
			jsonObjectOut			= new JSONObject();
			jsonObjectIn			= new JSONObject(request.getParameter("json"));
			filter					= Utility.getShort(jsonObjectIn.get("filter"));

			if(request.getSession().getAttribute(Executive.EXECUTIVE) == null) {
				jsonObjectOut.put(CargoErrorList.ERROR_DESCRIPTION, "You have been logged out. Please login again.");
				out.println(jsonObjectOut);
				return;
			}

			switch (filter) {
			case 1 -> out.println(initialize(request, jsonObjectOut, jsonObjectIn));
			case 2 -> out.println(getLoadingSheetToReceive(request, jsonObjectOut, jsonObjectIn));
			case 3 -> out.println(getDataToReceiveWayBill(request, jsonObjectOut, jsonObjectIn));
			case 4 -> out.println(receiveWayBills(request, jsonObjectOut, jsonObjectIn));
			default -> {
				jsonObjectOut.put(CargoErrorList.ERROR_DESCRIPTION, "Unknown Request");
				out.println(jsonObjectOut);
			}
			}
		} catch (final Exception e) {
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, e);
			try {
				jsonObjectOut			= new JSONObject();
				jsonObjectOut.put("errorCode", CargoErrorList.SYSTEM_ERROR);
				jsonObjectOut.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.SYSTEM_ERROR_DESCRIPTION);
			} catch (final Exception e1) {
				LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, ""+e1);
				e.printStackTrace();
			}

			if(out != null) out.println(jsonObjectOut);
		} finally {
			if(out != null) {
				out.flush();
				out.close();
			}
		}
	}

	private JSONObject initialize(final HttpServletRequest request, final JSONObject jsonObjectOut, final JSONObject jsonObjectIn) throws Exception {
		var						receiveAndDeliverLR				= false;
		var						popupWindowToReceiveLS			= false;
		var						limitToShowPendingLS			= 0;

		try {
			final var	valObjIn			= JsonUtility.convertJsontoValueObject(jsonObjectIn);
			final var	valObjOut			= JsonUtility.convertJsontoValueObject(jsonObjectOut);

			final var	cache				= new CacheManip(request);

			final var	executive			= cache.getExecutive(request);
			final var	configuration		= cache.getReceiveConfiguration(request, executive.getAccountGroupId());
			final var	execFldPermissions	= cache.getExecutiveFieldPermission(request);

			if((boolean) configuration.getOrDefault(ReceiveConfigurationPropertiesConstant.POPUP_WINDOW_TO_RECEIVE_LS, false)) {
				popupWindowToReceiveLS		= (Boolean) configuration.getOrDefault(ReceiveConfigurationPropertiesConstant.POPUP_WINDOW_TO_RECEIVE_LS, false);

				if(execFldPermissions!= null && execFldPermissions.get(FeildPermissionsConstant.RECEIVE_AND_DELIVER_LR) != null
						|| (boolean) configuration.getOrDefault(ReceiveConfigurationPropertiesConstant.IS_RECEIVE_WITH_SHORT_EXCESS, false))
					popupWindowToReceiveLS	= false;
			}

			if(execFldPermissions != null && execFldPermissions.get(FeildPermissionsConstant.RECEIVE_AND_DELIVER_LR) != null)
				receiveAndDeliverLR	= true;

			if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN
					|| executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_REGIONADMIN
					|| executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_SUBREGIONADMIN)
				limitToShowPendingLS		= (int) configuration.getOrDefault(ReceiveConfigurationPropertiesConstant.LIMIT_TO_SHOW_PENDING_LS_FOR_ADMIN, 0);
			else
				limitToShowPendingLS		= (int) configuration.getOrDefault(ReceiveConfigurationPropertiesConstant.LIMIT_TO_SHOW_PENDING_LS, 0);

			valObjIn.put(AliasNameConstants.EXECUTIVE, executive);
			valObjIn.put("configuration", configuration);

			valObjOut.put(AliasNameConstants.EXECUTIVE, Converter.DtoToHashMap(executive));
			valObjOut.put("VehicleNumberMasterConstant", VehicleNumberMasterConstant.getVehicleNumberMasterConstant());
			valObjOut.put("configuration", configuration);
			valObjOut.put("ManualLHPVDaysAllowed", (int) cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_MAX_DAYS_OF_OPERATION_BEFORE_CASHSTATEMENT_ENTRY_ID));
			valObjOut.put("ExecutiveTypeConstant", ExecutiveTypeConstant.getExecutiveTypeConstant());
			valObjOut.put("popupWindowToReceiveLS", popupWindowToReceiveLS);
			valObjOut.put("receiveAndDeliverLR", receiveAndDeliverLR);
			valObjOut.put(Constant.LIMIT, limitToShowPendingLS);
			valObjOut.put(Constant.IS_ACTIVE_TCE_GROUP, cache.isTceActive(request, executive.getAccountGroupId()));
			valObjOut.put(Constant.IVCARGO_VIDEOS, cache.getModuleWiseVideos(request, ModuleIdentifierConstant.RECEIVE));

			return JsonUtility.convertionToJsonObjectForResponse(valObjOut);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private JSONObject getLoadingSheetToReceive(final HttpServletRequest request, final JSONObject jsonObjectOut, final JSONObject jsonObjectIn) throws Exception {
		var						regionId						= 0L;
		var						subRegionId						= 0L;
		var						branchId						= 0L;
		String					sourceBranchIds					= null;
		String					assingBranchIds					= null;
		String					receiveLocationIds				= null;
		String 					locationIdsStr 					= null;
		SubRegion 				subRegion						= null;
		List<Branch> 			branchArr						= null;

		try {
			final var	cache					= new CacheManip(request);

			final var	valueInObject			= JsonUtility.convertJsontoValueObject(jsonObjectIn);
			final var	valObjOut				= JsonUtility.convertJsontoValueObject(jsonObjectOut);
			final var	allBranches				= cache.getGenericBranchesDetail(request);
			final var	executive				= cache.getExecutive(request);
			final var	allSubRegions			= cache.getAllSubRegions(request);
			final var	allRegionsOfGroup		= cache.getAllRegionDataForGroup(request, executive.getAccountGroupId());
			final var	minDateTimeStamp		= cache.getModuleWiseMinDateToGetData(request, executive.getAccountGroupId(),
					ModuleWiseMinDateSelectionConfigurationDTO.RECEIVE_MIN_DATE_ALLOW,
					ModuleWiseMinDateSelectionConfigurationDTO.RECEIVE_MIN_DATE);

			final var	execFldPermissions		= cache.getExecutiveFieldPermission(request);

			final var	sourceSubRegionId		= valueInObject.getLong("selectSubRegion", 0);
			final var	locationId				= valueInObject.getLong("locationId", 0);

			final var	configValueValue		= cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_RECEIVABLES_ACCESSIBILITY);
			final var	receiveConfig			= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.RECEIVE);

			final var	isRecieveWithMergingBranch 			= (boolean) receiveConfig.getOrDefault(ReceiveConfigurationPropertiesConstant.IS_RECEIVE_WITH_MERGING_BRANCHES, false);

			valueInObject.put(AliasNameConstants.ALL_BRANCHES, allBranches);
			valueInObject.put(AliasNameConstants.ALL_SUB_REGIONS, allSubRegions);
			valueInObject.put(AliasNameConstants.ALL_REGIONS, allRegionsOfGroup);
			valueInObject.put("configValue_value", configValueValue);
			valueInObject.put(AliasNameConstants.EXECUTIVE, executive);
			valueInObject.put(AliasNameConstants.MIN_DATE_TIMESTAMP, minDateTimeStamp);
			valueInObject.put(ReceiveConfigurationPropertiesConstant.RECEIVE_CONFIGUARTION, receiveConfig);

			if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN) {
				regionId 		= valueInObject.getLong(Constant.REGION_ID, 0);
				subRegionId 	= valueInObject.getLong(Constant.SUB_REGION_ID, 0);
				branchId 		= valueInObject.getLong(Constant.BRANCH_ID, 0);
			} else if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_REGIONADMIN) {
				regionId 		= executive.getRegionId();
				subRegionId 	= valueInObject.getLong(Constant.SUB_REGION_ID, 0);
				branchId 		= valueInObject.getLong(Constant.BRANCH_ID, 0);
			} else if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_SUBREGIONADMIN) {
				regionId 		= executive.getRegionId();
				subRegionId 	= executive.getSubRegionId();
				branchId 		= valueInObject.getLong(Constant.BRANCH_ID, 0);
			} else {
				regionId 		= executive.getRegionId();
				subRegionId 	= executive.getSubRegionId();
				branchId 		= executive.getBranchId();
			}

			if(sourceSubRegionId > 0) {
				subRegion			= cache.getGenericSubRegionById(request, sourceSubRegionId);

				if(subRegion.getAccountGroupId() == executive.getAccountGroupId())
					sourceBranchIds 	= cache.getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_SUBREGION, sourceSubRegionId);
				else
					sourceBranchIds		= cache.getBranchesStringWithMergingBySubRegionId(request, executive.getAccountGroupId(), subRegion.getSubRegionId());
			} else {
				sourceBranchIds = cache.getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_GROUP, 0);

				if(isRecieveWithMergingBranch) {
					branchArr 		= cache.getBranchesWithMergingArrayByConfigAccountGroupId(request, executive.getAccountGroupId());
					assingBranchIds	= branchArr.stream().map(b -> Long.toString(b.getBranchId())).collect(Collectors.joining(","));
				}

				if(assingBranchIds != null)
					sourceBranchIds = sourceBranchIds + ',' + assingBranchIds;
			}

			final var	receiveLocationList = cache.getAssignedLocationsIdListByLocationIdId(request, executive.getBranchId(), executive.getAccountGroupId());

			if(ObjectUtils.isNotEmpty(receiveLocationList)) {
				receiveLocationIds	= CollectionUtility.getStringFromLongList(receiveLocationList);

				valueInObject.put("receiveLocationIds", receiveLocationIds);
			}

			final var	lsNo					= valueInObject.getString(AliasNameConstants.LS_NUMBER, null);
			final var	tlNo					= valueInObject.getString(Constant.TL_NUMBER, null);
			final var	vehicleNumberId 		= valueInObject.getLong(AliasNameConstants.VEHICLE_NUMBER_ID, 0);

			if(lsNo == null && tlNo == null && vehicleNumberId <= 0 && StringUtils.isEmpty(sourceBranchIds)) {
				valueInObject.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.NO_RECORDS_DESCRIPTION);
				return JsonUtility.convertionToJsonObjectForResponse(valueInObject);
			}

			if(regionId > 0)
				if(subRegionId == 0 && branchId == 0)
					locationIdsStr = cache.getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_REGION, regionId);
				else if(subRegionId > 0 && branchId == 0)
					locationIdsStr = cache.getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_SUBREGION, subRegionId);
				else if(subRegionId > 0 && branchId > 0)
					if(locationId > 0)
						locationIdsStr = Long.toString(locationId);
					else {
						final var	locationList = cache.getAssignedLocationsIdListByLocationIdId(request, branchId, executive.getAccountGroupId());

						if(ObjectUtils.isNotEmpty(locationList))
							locationIdsStr	= CollectionUtility.getStringFromLongList(locationList);
					}

			valueInObject.put(AliasNameConstants.LOCATION_IDS, locationIdsStr);
			valueInObject.put(AliasNameConstants.SOURCE_BRANCH_IDS, sourceBranchIds);
			valueInObject.put("DestinationBranch_value", branchId);
			valueInObject.put("receiveLocationList", receiveLocationList);
			valueInObject.put("execFldPermissions", execFldPermissions);
			valueInObject.put(AccountGroup.ACCOUNT_GROUP, cache.getAccountGroupHM(request));
			valueInObject.put(DisplayDataWithinDateRangePropertiesConstant.DISPLAY_DATA_CONFIGURATION_CONSTANT, cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.DISPLAY_DATA_CONFIGURATION));

			final var	valueOutObject		= ReceivablesWayBillBLL.getInstance().getLoadingSheetDetailToReceive(valObjOut, valueInObject);
			valueOutObject.put("State", JsonConstant.getState());

			return JsonUtility.convertionToJsonObjectForResponse(valueOutObject);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private JSONObject getDataToReceiveWayBill(final HttpServletRequest request, final JSONObject jsonObjectOut, final JSONObject jsonObjectIn) throws Exception {
		Map<Object, Object>								receiveAndDeliveryConfig		= null;
		Map<Object, Object>								combinedReceiveConfig			= null;
		var												receiveAndDelivery				= false;
		Map<Object, Object>								generalConfiguration			= null;
		ChargeTypeModel[]								deliveryCharges					= null;
		ValueObject										generateCRConfiguration			= null;
		Map<Object, Object>								podConfiguration				= null;

		try {
			final var	cache					= new CacheManip(request);
			var			reportViewModel 		= new ReportViewModel();

			final var	valObjIn				= JsonUtility.convertJsontoValueObject(jsonObjectIn);
			final var	valObjOut				= JsonUtility.convertJsontoValueObject(jsonObjectOut);
			final var	executive				= cache.getExecutive(request);
			final var	execFieldPermissions 	= cache.getExecutiveFieldPermission(request);

			final var	allowTruckDeliveryReceive	= execFieldPermissions.get(FeildPermissionsConstant.ALLOW_TRUCK_DELIVERY_RECEIVE) != null;

			final var	configuration			= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.RECEIVE);
			final var	tripHisabProperties		= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.TRIP_HISAB_SETTLEMENT);

			var	doNotAllowToReceiveLs			= (boolean) configuration.getOrDefault(ReceiveConfigurationPropertiesConstant.DO_NOT_ALLOW_TO_RECEIVE_LS, false);

			if(doNotAllowToReceiveLs && execFieldPermissions.get(FeildPermissionsConstant.ALLOW_TO_RECEIVE_LS) != null)
				doNotAllowToReceiveLs = false;

			final var	discountInPercent		= cache.getModuleWiseDiscountLimit(request, executive.getAccountGroupId(),
					ModuleWiseDiscountLimitConfigurationDTO.REC_AND_DLY_DISCOUNT_LIMIT_ALLOW,
					ModuleWiseDiscountLimitConfigurationDTO.REC_AND_DLY_DISCOUNT_LIMIT_IN_PERCENT);

			if(execFieldPermissions.get(FeildPermissionsConstant.RECEIVE_AND_DELIVER_LR) != null) receiveAndDelivery = true;

			if(receiveAndDelivery) {
				generalConfiguration 		= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.GENERAL_CONFIGURATION);
				deliveryCharges				= cache.getActiveDeliveryCharges(request, executive.getBranchId());
				generateCRConfiguration 	= cache.getGenerateCRConfiguration(request, executive.getAccountGroupId());
				podConfiguration			= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.POD_WAYBILL);
				receiveAndDeliveryConfig	= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.RECEIVE_AND_DELIVERY);
				valObjOut.put("deliveryCharges", Converter.arrayDtotoArrayListWithHashMapConversion(deliveryCharges));
			}

			combinedReceiveConfig	= new HashMap<>(configuration);
			if(receiveAndDeliveryConfig != null) combinedReceiveConfig.putAll(receiveAndDeliveryConfig);

			valObjIn.put(AliasNameConstants.EXECUTIVE, executive);
			valObjIn.put(ReceiveConfigurationPropertiesConstant.RECEIVE_CONFIGUARTION, combinedReceiveConfig);
			valObjIn.put(GeneralConfigurationPropertiesConstant.GENERAL_CONFIGURATION, generalConfiguration);
			valObjIn.put(GroupConfigurationPropertiesDTO.GROUP_CONFIGURATION, cache.getGroupConfiguration(request, executive.getAccountGroupId()));
			valObjIn.put(AliasNameConstants.ALL_BRANCHES, cache.getGenericBranchesDetail(request));
			valObjIn.put(AliasNameConstants.ALL_SUB_REGIONS, cache.getAllSubRegions(request));
			valObjIn.put("receiveLocationList", cache.getAssignedLocationsIdListByLocationIdId(request, executive.getBranchId(), executive.getAccountGroupId()));
			valObjIn.put("vehicleNumberHM", cache.getALLVehicleNumberOfGroup(request, executive.getAccountGroupId()));
			valObjIn.put(ExecutiveFunctionsModel.EXECUTIVE_FUNCTION, cache.getExecFunctions(request));
			valObjIn.put("execFieldPermissions", execFieldPermissions);
			valObjIn.put(PodWayBillPropertiesConstant.POD_CONFIGURATION, podConfiguration);
			valObjIn.put("discountInPercent", discountInPercent);
			valObjIn.put(GenerateCashReceiptDTO.GENERATE_CASH_RECEIPT_CONFIGURATION, generateCRConfiguration);
			valObjIn.put("receiveAndDelivery", receiveAndDelivery);
			valObjIn.put(AliasNameConstants.PACKING_TYPE_MASTER, cache.getAllPackingType(request, executive.getAccountGroupId()));
			valObjIn.put(DisplayDataWithinDateRangePropertiesConstant.DISPLAY_DATA_CONFIGURATION_CONSTANT, cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.DISPLAY_DATA_CONFIGURATION));

			reportViewModel 		= ReportView.getInstance().populateReportViewModel(request, reportViewModel);

			valObjOut.put(AliasNameConstants.REPORT_VIEW_MODEL, Converter.DtoToHashMap(reportViewModel));
			valObjOut.put("tripHisabProperties", tripHisabProperties);
			valObjOut.put("ManualTURDaysAllowed", cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_MAX_DAYS_OF_OPERATION_BEFORE_CASHSTATEMENT_ENTRY_ID));
			valObjOut.put("allowTruckDeliveryReceive", allowTruckDeliveryReceive);
			valObjOut.put("doNotAllowToReceiveLs", doNotAllowToReceiveLs);
			valObjOut.put("hamalLeaderList", cache.getHamalMasterList(request, executive.getAccountGroupId()));

			generateToken(request, valObjOut);

			final var	outValObj 		= ReceivablesWayBillBLL.getInstance().getReceivablesWaybillDetailsByDispatchLedger(valObjOut, valObjIn);

			if((boolean) combinedReceiveConfig.getOrDefault(ReceiveConfigurationPropertiesConstant.SHORT_EXCESS_ENTRY_ALLOW, false)) {
				outValObj.put("shortReceiveConfig", cache.getOldConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.SHORT_RECEIVE_LR));
				outValObj.put("excessReceiveConfig", cache.getOldConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.EXCESS_RECEIVE_LR));
				outValObj.put("damageReceiveConfig", cache.getOldConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.DAMAGE_RECEIVE_LR));
			}

			outValObj.remove("WayBillReceivableModelForOld");
			outValObj.remove("godownsForOld");
			outValObj.remove("receivedLedgerForOld");
			outValObj.remove("packingTypeForOld");
			outValObj.remove("dispatchLedgerForOld");

			return JsonUtility.convertionToJsonObjectForResponse(outValObj);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private JSONObject receiveWayBills(final HttpServletRequest request, final JSONObject jsonObjectOut, final JSONObject jsonObjectIn) throws Exception {
		Map<Object, Object>		receiveAndDeliveryConfig	= null;
		final var			tokenWiseCheckingForDuplicateTransaction= false;

		try {
			final var	valueInObject			= JsonUtility.convertJsontoValueObject(jsonObjectIn);

			final var	receiveAndDelivery		= valueInObject.getBoolean("receiveAndDelivery", false);

			final var	cacheManip				= new CacheManip(request);
			final var	executive				= cacheManip.getExecutive(request);

			final var	configParamHM			= cacheManip.getConfigParamData(request, executive.getAccountGroupId());
			final var	receiveConfig			= cacheManip.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.RECEIVE);

			if(receiveAndDelivery)
				receiveAndDeliveryConfig		= cacheManip.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.RECEIVE_AND_DELIVERY);

			final Map<Object, Object>	combinedReceiveConfig	= new HashMap<>(receiveConfig);

			if(receiveAndDeliveryConfig != null) combinedReceiveConfig.putAll(receiveAndDeliveryConfig);

			final var dispatchLedgerId 	= valueInObject.getLong("DispatchLedgerId", 0);

			if(request.getSession().getAttribute("receiveDispatchLedgerId") != null)
				jsonObjectOut.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.errorDescription(CargoErrorList.REQUEST_SUBMITTED, null));
			//return jsonObjectOut;

			if(tokenWiseCheckingForDuplicateTransaction) {
				final var	token		= valueInObject.getString("token", null);

				if(token == null || !token.equals(request.getSession().getAttribute(TokenGenerator.RECEIVE_TOKEN_KEY))) {
					jsonObjectOut.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.errorDescription(CargoErrorList.REQUEST_SUBMITTED, null));
					return jsonObjectOut;
				}

				request.getSession().setAttribute(TokenGenerator.RECEIVE_TOKEN_KEY, null);
			}

			request.getSession().setAttribute("receiveDispatchLedgerId", dispatchLedgerId);

			valueInObject.put("totalLRDetailsArr", JsonConvertor.toValueObjectFromJsonString(jsonObjectIn.getString("TotalLRDetailsArr")));
			valueInObject.put("receiveAndDeliveryConfig", receiveAndDeliveryConfig);
			valueInObject.put("vehicleNumberHM", cacheManip.getALLVehicleNumberOfGroup(request, executive.getAccountGroupId()));
			valueInObject.put(ReceiveConfigurationPropertiesConstant.RECEIVE_CONFIGUARTION, combinedReceiveConfig);
			valueInObject.put("vehicleNo", valueInObject.getString(Constant.VEHICLE_NUMBER));
			valueInObject.put("execFldPermissions", cacheManip.getExecutiveFieldPermission(request));
			valueInObject.put("configParamHM", configParamHM);
			valueInObject.put(Executive.EXECUTIVE, executive);
			valueInObject.put(Constant.NO_OF_DAYS, configParamHM.containsKey(ConfigParam.CONFIG_KEY_MAX_DAYS_OF_OPERATION_BEFORE_CASHSTATEMENT_ENTRY_ID) ? configParamHM.get(ConfigParam.CONFIG_KEY_MAX_DAYS_OF_OPERATION_BEFORE_CASHSTATEMENT_ENTRY_ID) : 0);
			valueInObject.put("deliveryLocationList", cacheManip.getAssignedLocationsIdListByLocationIdId(request, executive.getBranchId(), executive.getAccountGroupId()));
			valueInObject.put(WayBillTaxDetails.WAYBILL_TYPE_WISE_SERVICE_TAX_DATE, cacheManip.wayBillTypeWiseServiceTaxDate(request, executive.getAccountGroupId()));
			valueInObject.put(AccountGroupTieUpConfiguration.ACCOUNT_GROUP_TIE_UP_CONFIGURATION_HM, cacheManip.getAccountGroupTieUpConfiguration(request, executive.getAccountGroupId()));
			valueInObject.put(LrCostConfigurationDTO.LR_COST_CONFIGURATION, cacheManip.getGroupWiseLRCostConfiguration(request, executive.getAccountGroupId()));
			valueInObject.put(GroupConfigurationPropertiesDTO.GROUP_CONFIGURATION, cacheManip.getGroupConfiguration(request, executive.getAccountGroupId()));
			valueInObject.put(CashStatementConfigurationDTO.CASH_STATEMENT_CONFIGURATION, cacheManip.getCashStatementConfiguration(request, executive.getAccountGroupId()));
			valueInObject.put(TransportListMaster.TRANSPORT_LIST, cacheManip.getTransportList(request));
			valueInObject.put(LHPVPropertiesConstant.LHPV_CONFIGURATION, cacheManip.getLhpvConfiguration(request, executive.getAccountGroupId()));
			valueInObject.put(BankStatementConfigurationDTO.BANK_STATEMENT_CONFIGURATION, cacheManip.getBankStatementConfiguration(request, executive.getAccountGroupId()));
			valueInObject.put(GenerateCashReceiptDTO.GENERATE_CASH_RECEIPT_CONFIGURATION, cacheManip.getGenerateCRConfiguration(request, executive.getAccountGroupId()));
			valueInObject.put(DashBoardConfigurationDTO.DASH_BOARD_CONFIGURATION, cacheManip.getDashBoardConfiguration(request, executive.getAccountGroupId()));
			valueInObject.put(GeneralConfiguration.GENERAL_CONFIGURATION, cacheManip.getGeneralConfiguration(request, executive.getAccountGroupId()));
			valueInObject.put("configValWBGTROffAllow", configParamHM.get(ConfigParam.CONFIG_KEY_WAYBILL_GRAND_TOTAL_ROUNDOFF));
			valueInObject.put("CashStmtEntryAllowed", configParamHM.get(ConfigParam.CONFIG_KEY_CASH_STATEMENT_TABLE_ENTRY));
			valueInObject.put("configValueForDelivery", configParamHM.get(ConfigParam.CONFIG_KEY_DELIVERY_ACCESSIBILITY));
			valueInObject.put("isArrivalTruckDetailReport", configParamHM.containsKey(ConfigParam.CONFIG_KEY_ARRIVAL_TRUCK_DETAILS_REPORT)
					&& configParamHM.get(ConfigParam.CONFIG_KEY_ARRIVAL_TRUCK_DETAILS_REPORT) == ConfigParam.CONFIG_KEY_CONFIG_KEY_ARRIVAL_TRUCK_DETAILS_REPORT_ALLOWED);
			valueInObject.put("isPendingDeliveryTableEntry", configParamHM.containsKey(ConfigParam.CONFIG_KEY_PENDING_DELIVERY_STOCK_TABLE_ENTRY)
					&& configParamHM.get(ConfigParam.CONFIG_KEY_PENDING_DELIVERY_STOCK_TABLE_ENTRY) == ConfigParam.CONFIG_KEY_PENDING_DELIVERY_STOCK_TABLE_ENTRY_ALLOWED);
			valueInObject.put("isServiceTaxReport", configParamHM.containsKey(ConfigParam.CONFIG_KEY_SERVICE_TAX_REPORT)
					&& configParamHM.get(ConfigParam.CONFIG_KEY_SERVICE_TAX_REPORT) == ConfigParam.CONFIG_KEY_VALUE_SERVICE_TAX_REPORT_ALLOWED);
			valueInObject.put("branchesColl", cacheManip.getGenericBranchesDetail(request));
			valueInObject.put(PodWayBillPropertiesConstant.POD_CONFIGURATION, cacheManip.getPODWayBillConfiguration(request, executive.getAccountGroupId()));
			valueInObject.put(DocumentCodeConfigurationDTO.DOCUMENT_CODE_CONFIGURATION, cacheManip.getDocumentCodeConfiguration(request, executive.getAccountGroupId()));
			valueInObject.put("deliveryCharges", cacheManip.getActiveDeliveryCharges(request, executive.getBranchId()));

			return JsonUtility.convertionToJsonObjectForResponse(ReceivablesBLL.getInstance().receiveAndDeliverWayBills(valueInObject));
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private void generateToken(final HttpServletRequest request, ValueObject jsonObjectOut) {
		try {
			final var session = request.getSession();

			final var token = TokenGenerator.nextToken();

			if (token != null) {
				session.setAttribute(TokenGenerator.RECEIVE_TOKEN_KEY, token);

				if(jsonObjectOut == null)
					jsonObjectOut	= new ValueObject();

				jsonObjectOut.put("token", token);
			}
		} catch (final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
		}
	}
}
