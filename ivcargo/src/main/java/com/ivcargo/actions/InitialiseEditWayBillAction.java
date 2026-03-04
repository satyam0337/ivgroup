package com.ivcargo.actions;

//~--- non-JDK imports --------------------------------------------------------

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.utils.CollectionUtility;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.utility.EncryptDecryptUtility;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.configuration.modules.GenerateCashReceiptDTO;
import com.platform.dto.configuration.modules.GroupConfigurationPropertiesDTO;
import com.platform.resource.CargoErrorList;
import com.platform.utils.PropertiesUtility;
import com.platform.utils.Utility;

public class InitialiseEditWayBillAction implements Action {
	public static final String TRACE_ID = "InitialiseEditWayBillAction";

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {

		HashMap<String,Object>	 	error 								= null;
		CacheManip					cacheManip							= null;
		ValueObject					confValObj							= null;
		ValueObject					generateCRConfVal					= null;
		var						isWSLRPrintNeeded					= false;
		var						isWSCRPrintNeeded					= false;
		var						defaultPrintWindowHeight			= "300";
		var						defaultPrintWindowWidth				= "425";
		var						centerlizeCancelltaion				= false;
		var						standardLrRemarkAllowed				= false;
		String						remarkTemplates						= null;
		ArrayList<String> 			remarkTemplateList					= null;
		String 						deliveryChargeCalculatePerArticleByBranchId	= null;
		String 						branchIdsForChangeInPerArticleAfterSomeQuantity	= null;
		List<Long> 					deliveryChargeCalculateArr			= null;
		List<Long> 					branchIdsForChangeInPerArticle		= null;
		var						isCalculateDeliveryCharge			= false;
		var						isChangePerArticle					= false;
		ValueObject					generateCRConfig					= null;
		var							allowBranchWiseCRPrint					= false;
		String							branchCodeListForNewCRWSPrint			= null;
		ArrayList<Long> 				branchCodeListForNewCRWSPrintList		= null;
		var 						allowRateInDecimal 						= false;

		try {

			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;


			cacheManip 				= new CacheManip(request);
			final var executive 	= cacheManip.getExecutive(request);
			confValObj 				= cacheManip.getGroupConfiguration(request, executive.getAccountGroupId());
			generateCRConfVal 		= cacheManip.getGenerateCRConfiguration(request, executive.getAccountGroupId());
			generateCRConfig		= cacheManip.getGenerateCRConfiguration(request, executive.getAccountGroupId());

			isWSLRPrintNeeded					= PropertiesUtility.isAllow(confValObj.getString(GroupConfigurationPropertiesDTO.IS_WS_LR_PRINT_NEEDED, "false"));
			centerlizeCancelltaion				= PropertiesUtility.isAllow(confValObj.getString(GroupConfigurationPropertiesDTO.CENTRALIZED_CANCELLATION, "false"));
			isWSCRPrintNeeded					= PropertiesUtility.isAllow(generateCRConfVal.getString(GenerateCashReceiptDTO.IS_WS_CR_PRINT_NEEDED, "false"));
			allowRateInDecimal					= confValObj.getBoolean(GroupConfigurationPropertiesDTO.ALLOW_RATE_IN_DECIMAL, false);

			defaultPrintWindowHeight			= confValObj.getString(GroupConfigurationPropertiesDTO.DEFAULT_PRINT_WINDOW_HEIGHT);
			defaultPrintWindowWidth				= confValObj.getString(GroupConfigurationPropertiesDTO.DEFAULT_PRINT_WINDOW_WIDTH);
			standardLrRemarkAllowed				= confValObj.getBoolean(GroupConfigurationPropertiesDTO.STANDARD_LR_REMARK_ALLOWED);

			deliveryChargeCalculatePerArticleByBranchId 	= generateCRConfig.getString(GenerateCashReceiptDTO.DELIVERY_CHARGE_CALCULATE_PER_ARTICLE_BY_BRANCH_ID,"");
			branchIdsForChangeInPerArticleAfterSomeQuantity = generateCRConfig.getString(GenerateCashReceiptDTO.BRANCH_IDS_FOR_CHANGE_IN_PER_ARTICLE_AFTER_SOME_QUANTITY,"");

			deliveryChargeCalculateArr			 	= CollectionUtility.getLongListFromString(deliveryChargeCalculatePerArticleByBranchId);
			branchIdsForChangeInPerArticle			= CollectionUtility.getLongListFromString(branchIdsForChangeInPerArticleAfterSomeQuantity);

			if(deliveryChargeCalculateArr.contains(executive.getBranchId()))
				isCalculateDeliveryCharge = true;

			if(branchIdsForChangeInPerArticle.contains(executive.getBranchId()))
				isChangePerArticle		= true;

			allowBranchWiseCRPrint				= generateCRConfig.getBoolean(GenerateCashReceiptDTO.ALLOW_BRANCH_WISE_CR_PRINT, false);

			if(isWSCRPrintNeeded && allowBranchWiseCRPrint) {
				branchCodeListForNewCRWSPrint		= generateCRConfVal.getString(GenerateCashReceiptDTO.BRANCH_CODE_LIST_FOR_NEW_CR_WS_PRINT_FLOW,"0000");
				branchCodeListForNewCRWSPrintList	= Utility.GetLongArrayListFromString(branchCodeListForNewCRWSPrint, ",");
				isWSCRPrintNeeded			 		= branchCodeListForNewCRWSPrintList.contains(executive.getBranchId());
			}

			if(standardLrRemarkAllowed) {
				remarkTemplates = confValObj.getString(GroupConfigurationPropertiesDTO.REMARK_TEMPLATES);
				remarkTemplateList = Utility.GetStringArrayListFromString(remarkTemplates, "_");
			}

			request.setAttribute("defaultPrintWindowHeight", defaultPrintWindowHeight);
			request.setAttribute("defaultPrintWindowWidth", defaultPrintWindowWidth);
			request.setAttribute("standardLrRemarkAllowed", standardLrRemarkAllowed);
			request.setAttribute("remarkTemplateList", remarkTemplateList);
			request.setAttribute("isCalculateDeliveryCharge", isCalculateDeliveryCharge);
			request.setAttribute("isChangePerArticle", isChangePerArticle);
			request.setAttribute("allowRateInDecimal", allowRateInDecimal);

			final var enwayBillId	= JSPUtility.GetString(request, "enwayBillId", null);

			request.setAttribute("wayBillId", enwayBillId != null ? EncryptDecryptUtility.decryptLong(enwayBillId) : JSPUtility.GetLong(request, "wayBillId", 0));

			if(request.getParameter("id") != null)
				request.setAttribute("OpenPopUp","true" );

			if(request.getParameter("doNotPrint") != null && Boolean.parseBoolean(request.getParameter("doNotPrint")))
				request.setAttribute("doNotPrint","true" );

			final var viewWayBillAction = new ViewWayBillAction();
			viewWayBillAction.execute(request, response);

			if(request.getParameter("discountAmt")!=null)
				request.setAttribute("discountAmt", JSPUtility.GetDouble(request, "discountAmt"));

			request.setAttribute("executive", executive);
			request.setAttribute("isWSLRPrintNeeded", isWSLRPrintNeeded);
			request.setAttribute("isWSCRPrintNeeded", isWSCRPrintNeeded);
			request.setAttribute("accountGroupId", executive.getAccountGroupId());
			request.setAttribute("centerlizeCancelltaion", centerlizeCancelltaion);

			if(request.getAttribute("wayBillModel") == null) {
				error.put("errorCode", CargoErrorList.NO_RECORDS);
				error.put("errorDescription", CargoErrorList.NO_RECORDS_DESCRIPTION);
				request.setAttribute("cargoError", error);
				request.setAttribute("nextPageToken", "failure");
			} else
				request.setAttribute("nextPageToken", "success_"+executive.getAccountGroupId());
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}
	}
}