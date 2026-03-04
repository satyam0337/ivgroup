package com.ivcargo.actions;

import java.util.ArrayList;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.ShortCreditCollectionSheetSettlementBLL;
import com.businesslogic.properties.GeneralConfiguration;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.bll.tds.impl.TDSTxnDetailsBllImpl;
import com.iv.bll.utils.PaymentTypeSelectionUtility;
import com.iv.constant.properties.STBSConfigurationConstant;
import com.iv.constant.properties.STBSSettlementConfigurationConstant;
import com.iv.constant.properties.TDSPropertiesConstant;
import com.iv.dto.constant.FeildPermissionsConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.DiscountMasterDAO;
import com.platform.dto.Executive;
import com.platform.dto.ShortCreditCollectionBillClearanceDto;
import com.platform.dto.model.ShortCreditCollectionSheetBillSettlementModel;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Converter;

public class ShortCreditCollectionSheetSettlementBillSummaryAction implements Action{
	public static final String TRACE_ID      		= "ShortCreditCollectionSheetSettlementBillSummaryAction";
	boolean	bankPaymentOperationRequired			= false;

	@Override
	@SuppressWarnings("unchecked")
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	 								error 										= null;
		Executive												executive 									= null;
		ValueObject												valueInObject								= null;
		ShortCreditCollectionSheetSettlementBLL					shortCreditSettlBll							= null;
		CacheManip												cache										= null;
		ShortCreditCollectionSheetBillSettlementModel[]			shortCreditBillModelArr						= null;
		ValueObject												valueOutObject								= null;
		HashMap<Long, ShortCreditCollectionBillClearanceDto> 	shortCreditModIdClrMod 						= null;
		Long[]													wayBillIdArr								= null;
		ValueObject												paymentTypeVO								= null;
		com.iv.dto.constant.PaymentTypeConstant[] 				paymentTypeArr								= null;
		HashMap<?, ?>											execFldPermissions							= null;
		var 													billId										= 0L;
		ArrayList<String> 										discountTypes 								= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			executive 	= (Executive) request.getSession().getAttribute("executive");

			if(executive != null && request.getParameter("billId") != null){
				cache 						= new CacheManip(request);
				valueInObject 				= new ValueObject();
				shortCreditSettlBll 		= new ShortCreditCollectionSheetSettlementBLL();

				final var	stbsSettlementConfig			= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.STBS_SETTLEMENT);
				final var	configuration					= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.STBS);
				final var	generalConfiguration			= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.GENERAL_CONFIGURATION);
				final var	tdsConfiguration				= cache.getTDSConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.STBS_SETTLEMENT);

				billId 		= JSPUtility.GetLong(request, "billId",0);

				valueInObject.put("billId", billId);
				valueInObject.put("executive", executive);
				valueInObject.put("branchesColl", cache.getGenericBranchesDetail(request));

				execFldPermissions		= cache.getExecutiveFieldPermission(request);

				valueOutObject 			= shortCreditSettlBll.getShortCreditCollecionSheetSettlementDataWithBillId(valueInObject);

				shortCreditBillModelArr = (ShortCreditCollectionSheetBillSettlementModel[]) valueOutObject.get("shortCreditBillModelArr");
				shortCreditModIdClrMod 	= (HashMap<Long,ShortCreditCollectionBillClearanceDto>) valueOutObject.get("shortCreditModIdClrMod");

				wayBillIdArr			= (Long[]) valueOutObject.get("wayBillIdArr");

				paymentTypeVO			= new ValueObject();

				paymentTypeVO.put("executiveId", executive.getExecutiveId());
				paymentTypeVO.put("accountGroupId", executive.getAccountGroupId());
				paymentTypeVO.put(ModuleIdentifierConstant.MODULE_ID, ModuleIdentifierConstant.STBS_SETTLEMENT);
				paymentTypeVO.put("ExecutiveFeildPermission", Converter.hashMapWithDtoToHashMapConversion(execFldPermissions));

				paymentTypeArr			= PaymentTypeSelectionUtility.getModuleWisePermissionBasePaymentTypeSelection(paymentTypeVO);
				discountTypes 			= DiscountMasterDAO.getInstance().getDiscountTypes();

				request.setAttribute("paymentTypeArr", paymentTypeArr);
				request.setAttribute("shortCreditBillModelArr", shortCreditBillModelArr);
				request.setAttribute("shortCreditModIdClrMod", shortCreditModIdClrMod);
				request.setAttribute("stbsSumMod", valueOutObject.get("stbsSumMod"));
				request.setAttribute("wayBillIdArr", wayBillIdArr);
				request.setAttribute("discountTypes", discountTypes);
				request.setAttribute(STBSSettlementConfigurationConstant.ALLOW_TO_ENTER_RECEIVE_AMOUNT_BILL_WISE, stbsSettlementConfig.getOrDefault(STBSSettlementConfigurationConstant.ALLOW_TO_ENTER_RECEIVE_AMOUNT_BILL_WISE, false));
				request.setAttribute(STBSSettlementConfigurationConstant.IS_DISCOUNT_COLUMN_DISPLAY, stbsSettlementConfig.getOrDefault(STBSSettlementConfigurationConstant.IS_DISCOUNT_COLUMN_DISPLAY,false));
				request.setAttribute(STBSSettlementConfigurationConstant.REMARK_COLUMN_DISPLAY, stbsSettlementConfig.getOrDefault(STBSSettlementConfigurationConstant.REMARK_COLUMN_DISPLAY, false));
				request.setAttribute(STBSSettlementConfigurationConstant.SHOW_CHECKBOX_IN_STBS_SETTLEMENT, stbsSettlementConfig.getOrDefault(STBSSettlementConfigurationConstant.SHOW_CHECKBOX_IN_STBS_SETTLEMENT,false));
				request.setAttribute(STBSConfigurationConstant.ALLOW_STBS_CREATION_WITHOUT_COLLECTION_PERSON, configuration.getOrDefault(STBSConfigurationConstant.ALLOW_STBS_CREATION_WITHOUT_COLLECTION_PERSON,false));
				request.setAttribute(STBSConfigurationConstant.STBS_BILL_NUMBER_FORMAT, configuration.getOrDefault(STBSConfigurationConstant.STBS_BILL_NUMBER_FORMAT,false));
				request.setAttribute(GeneralConfiguration.BANK_PAYMENT_OPERATION_REQUIRED, generalConfiguration.getOrDefault(GeneralConfiguration.BANK_PAYMENT_OPERATION_REQUIRED, false));
				request.setAttribute(GeneralConfiguration.BANK_ACCOUNT_NOT_MANDATORY, generalConfiguration.getOrDefault(GeneralConfiguration.BANK_ACCOUNT_NOT_MANDATORY, false));
				request.setAttribute(TDSPropertiesConstant.TDS_CONFIGURATION, tdsConfiguration);
				request.setAttribute("tdsChargesArray", TDSTxnDetailsBllImpl.getTDSChargesList(tdsConfiguration));
				request.setAttribute("allowBackDateInSTBSSettlement", execFldPermissions != null && execFldPermissions.containsKey(FeildPermissionsConstant.ALLOW_BACK_DATE_IN_STBS_SETTLEMENT));

				request.setAttribute("nextPageToken", "success");
			} else
				request.setAttribute("nextPageToken", "needlogin");
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}
	}

	public void returnError(final HttpServletRequest request ,final HashMap<String, Object> error) throws Exception {
		try {

			error.put("errorCode", CargoErrorList.NO_RECORDS);
			error.put("errorDescription", CargoErrorList.NO_RECORDS_DESCRIPTION);
			request.setAttribute("cargoError", error);

		} catch (final Exception e) {
			throw e;
		}
	}
}