package com.ivcargo.actions.transport;

//~--- non-JDK imports --------------------------------------------------------

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.ObjectUtils;
import org.apache.commons.lang3.StringUtils;

import com.businesslogic.CRCancellationBLL;
import com.businesslogic.properties.GeneralConfiguration;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.constant.properties.GenerateCashReceiptPropertiesConstant;
import com.iv.constant.properties.LrViewConfigurationPropertiesConstant;
import com.iv.constant.properties.lhpv.LHPVPropertiesConstant;
import com.iv.dao.impl.pod.PODDispatchSummaryDaoImpl;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.utils.constant.Constant;
import com.iv.utils.constant.PodWayBillPropertiesConstant;
import com.iv.utils.constant.properties.ReceiveConfigurationPropertiesConstant;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.ConfigParam;
import com.platform.dto.WayBillTaxDetails;
import com.platform.dto.configuration.modules.BankStatementConfigurationDTO;
import com.platform.dto.configuration.modules.CashStatementConfigurationDTO;
import com.platform.dto.configuration.modules.DashBoardConfigurationDTO;
import com.platform.dto.configuration.modules.GenerateCashReceiptDTO;
import com.platform.dto.configuration.modules.GroupConfigurationPropertiesDTO;
import com.platform.dto.configuration.modules.LrCostConfigurationDTO;
import com.platform.resource.CargoErrorList;

public class CRCancellationAction implements Action {

	public static final String TRACE_ID = "CRCancellationAction";

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>			error 									= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	inValObj							= new ValueObject();
			final var	cache								= new CacheManip(request);
			final var	cancellationBLL 					= new CRCancellationBLL();
			final var	executive							= cache.getExecutive(request);
			final var	wayBillId							= JSPUtility.GetLong(request, "wayBillId", 0);
			final var	remark								= JSPUtility.GetString(request, "crCancellationRemark", null);
			final var	consignorId 						= JSPUtility.GetLong(request, "consignorId",0);
			final var	consignorName 						= JSPUtility.GetString(request, "consignorName", "");
			final var	crId		  						= JSPUtility.GetLong(request, "crId",0);
			final var	transportList						= cache.getTransportList(request);
			final var	transportSearchModuleForCargo		= cache.getTransportSearchModuleForCargo(request, executive.getAccountGroupId());
			final var	generateCrConfig					= cache.getGenerateCRConfiguration(request, executive.getAccountGroupId());
			final var	isAllowCentralizedCrCancellation	= generateCrConfig.getBoolean(GenerateCashReceiptPropertiesConstant.CENTRALIZED_CR_CANCELLATION, false);
			final var	actualCancelledByExecutiveId		= JSPUtility.GetLong(request, "cancelCrForExecutive", 0);
			final var	configParamHM						= cache.getConfigParamData(request, executive.getAccountGroupId());
			final var	podConfiguration					= cache.getPODWayBillConfiguration(request, executive.getAccountGroupId());
			final HashMap<?, ?>	execFldPermissions			= cache.getExecutiveFieldPermission(request);

			if(StringUtils.isEmpty(consignorName)) {
				error.put(CargoErrorList.ERROR_DESCRIPTION, "Consignor Name Missing !");
				request.setAttribute("cargoError", error);
				request.setAttribute("nextPageToken", "failure");
				return;
			}

			if((boolean) podConfiguration.getOrDefault(PodWayBillPropertiesConstant.IS_POD_REQUIRED, false)
					&& generateCrConfig.getBoolean(GenerateCashReceiptPropertiesConstant.CHECK_POD_DISPATCH_STATUS, false)
					&& !(boolean) podConfiguration.getOrDefault(PodWayBillPropertiesConstant.IS_ALLOW_AUTO_POD_DELETE_AFTER_CR_CANCELLATION, false)) {
				final var podDispatchSummaries = PODDispatchSummaryDaoImpl.getInstance().getPODDispatchSummaryByWayBillIdOld(wayBillId);

				if(ObjectUtils.isNotEmpty(podDispatchSummaries)) {
					error.put(CargoErrorList.ERROR_DESCRIPTION, "POD of LR has been Dispacth, You cannot cancel Delivery, Receive POD First !");
					request.setAttribute("cargoError", error);
					request.setAttribute("nextPageToken", "failure");
					return;
				}
			}

			inValObj.put("wayBillId", wayBillId);
			inValObj.put("remark", remark);
			inValObj.put("executive", executive);
			inValObj.put("chargeValueObject", cache.getChargeTypeMasterData(request));
			inValObj.put("taxValueObject", cache.getTaxMasterData(request));
			inValObj.put("consignorId", consignorId);
			inValObj.put("consignorName", consignorName);

			if(isAllowCentralizedCrCancellation && actualCancelledByExecutiveId > 0)
				inValObj.put("actualCancelledByExecutiveId", actualCancelledByExecutiveId);
			else
				inValObj.put("actualCancelledByExecutiveId", executive.getExecutiveId());

			inValObj.put("isServiceTaxReport", configParamHM.getOrDefault(ConfigParam.CONFIG_KEY_SERVICE_TAX_REPORT, (short) 0) == ConfigParam.CONFIG_KEY_VALUE_SERVICE_TAX_REPORT_ALLOWED);
			inValObj.put("isCreditorOutStandingSummaryReport", configParamHM.getOrDefault(ConfigParam.CONFIG_KEY_CREDITOR_OUTSTANDING_SUMMARY_REPORT, (short) 0) == ConfigParam.CONFIG_KEY_VALUE_CREDITOR_OUTSTANDING_SUMMARY_REPORT_ALLOWED);
			inValObj.put("isArrivalTruckDetailReport", configParamHM.getOrDefault(ConfigParam.CONFIG_KEY_ARRIVAL_TRUCK_DETAILS_REPORT, (short) 0) == ConfigParam.CONFIG_KEY_CONFIG_KEY_ARRIVAL_TRUCK_DETAILS_REPORT_ALLOWED);
			inValObj.put("branchesColl", cache.getGenericBranchesDetail(request));
			inValObj.put("configValueForDelivery", configParamHM.getOrDefault(ConfigParam.CONFIG_KEY_DELIVERY_ACCESSIBILITY, (short) 0));
			inValObj.put("deliveryLocationList", cache.getAssignedLocationsIdListByLocationIdId(request, executive.getBranchId(), executive.getAccountGroupId()));
			inValObj.put("isPendingDeliveryTableEntry", configParamHM.getOrDefault(ConfigParam.CONFIG_KEY_PENDING_DELIVERY_STOCK_TABLE_ENTRY, (short) 0) == ConfigParam.CONFIG_KEY_PENDING_DELIVERY_STOCK_TABLE_ENTRY_ALLOWED);
			inValObj.put("configValueOfPDS", configParamHM.getOrDefault(ConfigParam.CONFIG_KEY_PENDING_DELIVERY_STOCK_TABLE_ENTRY_AT_BOOKING_LEVEL, (short) 0));
			inValObj.put(GeneralConfiguration.GENERAL_CONFIGURATION, cache.getGeneralConfiguration(request, executive.getAccountGroupId()));
			inValObj.put("crId", crId);
			inValObj.put("accountGroupTieUpConfigurationHM", cache.getAccountGroupTieUpConfiguration(request, executive.getAccountGroupId()));
			inValObj.put(GroupConfigurationPropertiesDTO.GROUP_CONFIGURATION, cache.getGroupConfiguration(request, executive.getAccountGroupId()));
			inValObj.put(LrCostConfigurationDTO.LR_COST_CONFIGURATION, cache.getGroupWiseLRCostConfiguration(request, executive.getAccountGroupId()));
			inValObj.put(CashStatementConfigurationDTO.CASH_STATEMENT_CONFIGURATION, cache.getCashStatementConfiguration(request, executive.getAccountGroupId()));
			inValObj.put(BankStatementConfigurationDTO.BANK_STATEMENT_CONFIGURATION, cache.getBankStatementConfiguration(request, executive.getAccountGroupId()));
			inValObj.put(WayBillTaxDetails.WAYBILL_TYPE_WISE_SERVICE_TAX_DATE, cache.wayBillTypeWiseServiceTaxDate(request, executive.getAccountGroupId()));
			inValObj.put(PodWayBillPropertiesConstant.POD_CONFIGURATION, podConfiguration);
			inValObj.put(LHPVPropertiesConstant.LHPV_CONFIGURATION, cache.getLhpvConfiguration(request, executive.getAccountGroupId()));
			inValObj.put(GenerateCashReceiptDTO.GENERATE_CASH_RECEIPT_CONFIGURATION, generateCrConfig);
			inValObj.put(ReceiveConfigurationPropertiesConstant.RECEIVE_CONFIGUARTION, cache.getReceiveConfiguration(request, executive.getAccountGroupId()));
			inValObj.put(DashBoardConfigurationDTO.DASH_BOARD_CONFIGURATION, cache.getDashBoardConfiguration(request, executive.getAccountGroupId()));
			inValObj.put(LrViewConfigurationPropertiesConstant.LR_VIEW_CONFIGURATION_PROPERTY, cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.LR_SEARCH));
			inValObj.put("execFldPermissions", execFldPermissions);
			inValObj.put("phonePayPaymentTypeConfiguration", cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.PAYMENT_TYPE, ModuleIdentifierConstant.PHONE_PE_API));

			final var	outValObject = cancellationBLL.crCancellationProcess(inValObj);

			if(outValObject != null && Constant.SUCCESS.equals(outValObject.get(Constant.STATUS))) {
				if(transportList.contains(executive.getAccountGroupId()) || transportSearchModuleForCargo) {
					response.sendRedirect("editWaybill.do?pageId=3&eventId=8&wayBillId="+wayBillId+"&flag="+false);
					request.setAttribute("nextPageToken", Constant.SUCCESS);
				} else
					response.sendRedirect("editWaybill.do?pageId=2&eventId=6&wayBillId="+wayBillId+"&flag="+false);
			} else {
				if(outValObject == null || outValObject.get(Constant.STATUS) == null) {
					error.put(CargoErrorList.ERROR_CODE, CargoErrorList.CR_CANCELLATION_ERROR);
					error.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.errorDescription(CargoErrorList.CR_CANCELLATION_ERROR, null));
				} else if(outValObject.get(Constant.STATUS).equals(CargoErrorList.PARTIAL_DELIVERED_LR_ERROR)) {
					error.put(CargoErrorList.ERROR_CODE, CargoErrorList.PARTIAL_DELIVERED_LR_ERROR);
					error.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.PARTIAL_DELIVERED_LR_ERROR_DESCRIPTION);
				} else if(outValObject.get(Constant.STATUS).equals(CargoErrorList.SHORT_CREDIT_PAYMENT_RECEIVED_ERROR)) {
					error.put(CargoErrorList.ERROR_CODE, CargoErrorList.SHORT_CREDIT_PAYMENT_RECEIVED_ERROR);
					error.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.errorDescription(CargoErrorList.SHORT_CREDIT_PAYMENT_RECEIVED_ERROR, null));
				} else if(outValObject.get(Constant.STATUS).equals(CargoErrorList.AGENT_BILL_VALIDATE_ERROR)) {
					error.put(CargoErrorList.ERROR_CODE, CargoErrorList.AGENT_BILL_VALIDATE_ERROR);
					error.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.errorDescription(CargoErrorList.AGENT_BILL_VALIDATE_ERROR, null));
				}

				request.setAttribute("cargoError", error);
				request.setAttribute("nextPageToken", "failure");
			}
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}
	}
}