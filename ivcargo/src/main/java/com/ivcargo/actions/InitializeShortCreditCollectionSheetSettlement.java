package com.ivcargo.actions;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.constant.properties.STBSConfigurationConstant;
import com.iv.constant.properties.STBSSettlementConfigurationConstant;
import com.iv.dto.constant.FeildPermissionsConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.utils.utility.Utility;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;

public class InitializeShortCreditCollectionSheetSettlement implements Action{

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>			error 										= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var cache					= new CacheManip(request);
			final var executive 			= cache.getExecutive(request);
			final var execFldPermissions	= cache.getExecutiveFieldPermission(request);

			final var	configuration					= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.STBS);
			final var	stbsSettlementConfig			= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.STBS_SETTLEMENT);

			var			isNewSTBSPaymentScreen			= (boolean) stbsSettlementConfig.getOrDefault(STBSSettlementConfigurationConstant.IS_NEW_STBS_PAYMENT_SCREEN, false);

			/*
			 * Do not change this condition
			 */
			if(Utility.isIdExistInLongList(stbsSettlementConfig, STBSSettlementConfigurationConstant.SUB_REGION_IDS_FOR_NEW_PAYMENT_SCREEN, executive.getSubRegionId()))
				isNewSTBSPaymentScreen = true;

			ActionStaticUtil.executiveTypeWiseSelection1(request, cache, executive);

			request.setAttribute(STBSConfigurationConstant.STBS_BILL_NUMBER_FORMAT, (boolean) configuration.getOrDefault(STBSConfigurationConstant.STBS_BILL_NUMBER_FORMAT, false));
			request.setAttribute(STBSConfigurationConstant.ALLOW_STBS_CREATION_WITHOUT_COLLECTION_PERSON, (boolean) configuration.getOrDefault(STBSConfigurationConstant.ALLOW_STBS_CREATION_WITHOUT_COLLECTION_PERSON,false));
			request.setAttribute(STBSConfigurationConstant.ALLOW_SUBREGION_WISE_SEQUENCE_COUNTER, (boolean) configuration.getOrDefault(STBSConfigurationConstant.ALLOW_SUBREGION_WISE_SEQUENCE_COUNTER,false));
			request.setAttribute(STBSSettlementConfigurationConstant.SHOW_STBS_MR_PRINT, (boolean) stbsSettlementConfig.getOrDefault(STBSSettlementConfigurationConstant.SHOW_STBS_MR_PRINT, false));
			request.setAttribute(STBSSettlementConfigurationConstant.IS_NEW_STBS_PAYMENT_SCREEN, isNewSTBSPaymentScreen);
			request.setAttribute(STBSSettlementConfigurationConstant.SHOW_DATE_RANGE_SELECTION, (boolean) stbsSettlementConfig.getOrDefault(STBSSettlementConfigurationConstant.SHOW_DATE_RANGE_SELECTION, false));
			request.setAttribute("allowMultipleShortCreditBillSettlement", execFldPermissions.get(FeildPermissionsConstant.ALLOW_MULTIPLE_SHORT_CREDIT_BILL_SETTLEMENT) != null);
			request.setAttribute(STBSSettlementConfigurationConstant.SHOW_SETTLEMENT_TYPE_SELECTION, (boolean) stbsSettlementConfig.getOrDefault(STBSSettlementConfigurationConstant.SHOW_SETTLEMENT_TYPE_SELECTION, false));
			request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}
}