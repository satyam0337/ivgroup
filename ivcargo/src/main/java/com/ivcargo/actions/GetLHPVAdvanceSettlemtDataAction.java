package com.ivcargo.actions;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringUtils;

import com.businesslogic.ExpenseSettlementBLL;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.constant.properties.LhpvAdvanceSettlementPropertiesConstant;
import com.iv.dto.constant.FeildPermissionsConstant;
import com.iv.dto.constant.LHPVChargeTypeConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.utils.constant.Constant;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.utility.CollectionUtility;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.reports.ReportView;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.LHPV;
import com.platform.dto.model.ReportViewModel;
import com.platform.resource.CargoErrorList;

public class GetLHPVAdvanceSettlemtDataAction implements Action {

	@SuppressWarnings("unchecked")
	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>			error 						= null;
		ValueObject						valueOutObject				= null;
		short							filter						= 1;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeLHPVAdvanceSettlementAction().execute(request, response);

			final var	cManip							= new CacheManip(request);
			final var	executive   					= cManip.getExecutive(request);
			final var	lhpvNumber						= JSPUtility.GetString(request, "lhpvNo", "");
			var			lhpvId							= JSPUtility.GetLong(request, "lhpvId1", 0);
			final var	expenseChargeMasterId 			= JSPUtility.GetShort(request,"expenseChargeMasterId", (short) 0);
			final var	mappingChargeTypeId 			= JSPUtility.GetShort(request,"mappingChargeTypeId", (short) 0);

			request.setAttribute("expenseChargeMasterId", expenseChargeMasterId);
			request.setAttribute("mappingChargeTypeId", mappingChargeTypeId);

			final var	configuration									= cManip.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.LHPV_TRUCK_ADVANCE);
			final var	lhpvChargeTypeMasterIds							= (String) configuration.getOrDefault(LhpvAdvanceSettlementPropertiesConstant.STRING_MAPPING_TO_LHPV_CHARGE_ID_FROM_INCOME_EXPENSE_IDS, "");
			final var	isLSRequiredChecking							= (boolean) configuration.getOrDefault(LhpvAdvanceSettlementPropertiesConstant.LS_REQUIRED_CHECKING, false);
			final var	isAllowRedirectToLhpvAdvanceSettlement			= (boolean) configuration.getOrDefault(LhpvAdvanceSettlementPropertiesConstant.IS_ALLOW_REDIRECT_TO_LHPV_ADVANCE_SETTLEMENT, false);
			final var	showLHPVAdditionalAdvanceSettlementToAll		= (boolean) configuration.getOrDefault(LhpvAdvanceSettlementPropertiesConstant.SHOW_LHPV_ADDITIONAL_ADVANCE_SETTLEMENT_TO_ALL, false);
			final var	lhpvChargeIdsForSettlementToAll					= (String) configuration.getOrDefault(LhpvAdvanceSettlementPropertiesConstant.LHPV_CHARGE_IDS_FOR_SETTLEMENT_TO_ALL, "");
			final Map<?, ?>	execFeildPermissions						= cManip.getExecutiveFieldPermission(request);
			final var	allowCentralizedLHPVTruckAdvanceSettlement 		= execFeildPermissions != null && execFeildPermissions.containsKey(FeildPermissionsConstant.ALLOW_CENTRALIZED_LHPV_TRUCK_ADVANCE_SETTLEMENT);

			final var lhpvChargeTypeMasterIdsMap = CollectionUtility.getShortWithLongHashMapFromStringArray(lhpvChargeTypeMasterIds, Constant.COMMA);

			final var lhpvChargeTypeMasterId = lhpvChargeTypeMasterIdsMap.getOrDefault(mappingChargeTypeId, 0L);

			if(showLHPVAdditionalAdvanceSettlementToAll && lhpvChargeIdsForSettlementToAll != null) {
				final var	lhpvChargeIdListForSettlementToAll = CollectionUtility.getLongListFromString(lhpvChargeIdsForSettlementToAll);

				if(lhpvChargeIdListForSettlementToAll.contains((long) lhpvChargeTypeMasterId))
					filter = 2;
			}

			if(isAllowRedirectToLhpvAdvanceSettlement && request.getParameter("lhpvId2") != null && !"null".equals(request.getParameter("lhpvId2")))
				lhpvId		= JSPUtility.GetLong(request, "lhpvId2",0);

			if(allowCentralizedLHPVTruckAdvanceSettlement && lhpvChargeTypeMasterId == LHPVChargeTypeConstant.ADVANCE_AMOUNT)
				filter = 2;

			request.setAttribute("lhpvId1", lhpvId);

			final var	settlementBLL= new ExpenseSettlementBLL();

			if (StringUtils.isNotEmpty(lhpvNumber) && expenseChargeMasterId > 0 && lhpvChargeTypeMasterId > 0) {
				final var	inValObj = new ValueObject();
				inValObj.put(Constant.LHPV_NUMBER, lhpvNumber);
				inValObj.put(Constant.LHPV_ID, lhpvId);
				inValObj.put(Constant.ACCOUNT_GROUP_ID, executive.getAccountGroupId());
				inValObj.put("expenseChargeMasterId", expenseChargeMasterId);
				inValObj.put("lhpvChargeTypeMasterId", lhpvChargeTypeMasterId);
				inValObj.put(Constant.REGION_ID, executive.getRegionId());
				inValObj.put("isLSRequiredChecking", isLSRequiredChecking);
				inValObj.put(Constant.FILTER, filter);
				inValObj.put("branches", cManip.getGenericBranchesDetail(request));

				valueOutObject = settlementBLL.getLHPVDetailForAdvanceSettlement(inValObj);
			}

			if(valueOutObject != null) {
				final var lhpvList	= (List<LHPV>) valueOutObject.get("lhpvList");

				if(lhpvList != null)
					request.setAttribute("lhpvList", lhpvList);
				else {
					if(isLSRequiredChecking && !valueOutObject.getBoolean("isLSCreated", false)) {
						error.put("errorCode", CargoErrorList.LS_NOT_FOUND_FOR_LHPV);
						error.put("errorDescription", CargoErrorList.LS_NOT_FOUND_FOR_LHPV_DESCRIPTION);
						request.setAttribute("errorDescription", CargoErrorList.LS_NOT_FOUND_FOR_LHPV_DESCRIPTION);
						request.setAttribute("cargoError", error);
						return;
					}

					request.setAttribute("lhpv", valueOutObject.get(LHPV.LHPV));
					request.setAttribute("expenseSettlementArr", valueOutObject.get("expenseSettlementArr"));
				}
			} else {
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}

			var	reportViewModel = new ReportViewModel();
			reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);
			request.setAttribute("ReportViewModel",reportViewModel);

			request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}
}
