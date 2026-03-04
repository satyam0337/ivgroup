package com.ivcargo.actions;

import java.sql.Timestamp;

//~--- non-JDK imports --------------------------------------------------------

import java.util.HashMap;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.ShortCreditCollectionSheetBLL;
import com.businesslogic.properties.impl.PropertyConfigValueBLLImpl;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.constant.properties.GeneralConfigurationPropertiesConstant;
import com.iv.dao.impl.master.BillTaxMasterForGroupDaoImpl;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.dto.master.BillTaxMasterForGroup;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.constant.Constant;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.exception.ExceptionProcess;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.Executive;
import com.platform.dto.PropertiesFileConstants;
import com.platform.dto.configuration.modules.DocumentCodeConfigurationDTO;
import com.platform.resource.CargoErrorList;

public class ShortCreditCollectionPersonBillCreationAction implements Action {

	public static final String TRACE_ID = "ShortCreditCollectionPersonAction";

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {

		HashMap<String,Object>	 		error 											= null;
		Executive						executive										= null;
		String[]						checkboxValues									= null;
		ValueObject						valuInObject									= null;
		ShortCreditCollectionSheetBLL	shortCreditBll									= null;
		String							remark											= null;
		ValueObject						valuOutObject									= null;
		CacheManip						cacheManip										= null;
		var 						allowSTBSCreationWithoutCollectionPerson		= false;
		var 							collectionPersonId								= 0L;
		var 							partyMasterId									= 0L;
		ValueObject						partyWiseLedgerConfig							= null;
		Timestamp						stbsBillCreationDate							= null;
		Timestamp						stbsBillDueDate									= null;
		String							hsnCode											= null;
		List<BillTaxMasterForGroup> 	billTaxForGroupsCol	 							= null;
		var 							taxId											= 0;
		var 							applyTax										= false;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeShortCreditCollectionSheet().execute(request, response);

			allowSTBSCreationWithoutCollectionPerson	= Boolean.parseBoolean(request.getAttribute("allowSTBSCreationWithoutCollectionPerson").toString());

			cacheManip			= new CacheManip(request);
			executive			= cacheManip.getExecutive(request);

			partyWiseLedgerConfig		= PropertyConfigValueBLLImpl.getInstance().getConfiguration(executive, PropertiesFileConstants.PARTY_WISE_LEDGER_ACCOUNTS_CONFIG);

			if(request.getParameter("selectedCollectionPersonId") != null)
				collectionPersonId  = JSPUtility.GetLong(request, "selectedCollectionPersonId", 0);

			if(request.getParameter("partyId") != null)
				partyMasterId  = JSPUtility.GetLong(request, "partyId", 0);

			checkboxValues 		= request.getParameterValues("checkbox");

			if(request.getParameter(Constant.REMARK) != null)
				remark 	= request.getParameter(Constant.REMARK);

			if(request.getParameter(Constant.HSN_CODE) != null)
				hsnCode = request.getParameter(Constant.HSN_CODE);

			if(request.getParameter(Constant.TAX_ID) != null)
				taxId	= Short.parseShort(request.getParameter("taxId"));

			if (request.getParameter("applyTax") != null)
				applyTax = Boolean.parseBoolean(request.getParameter("applyTax"));

			if(JSPUtility.GetString(request, "stbsBillCreationDate", null) != null)
				stbsBillCreationDate	= DateTimeUtility.appendTimeToDate(JSPUtility.GetString(request, "stbsBillCreationDate"));

			if(JSPUtility.GetString(request, "stbsBillDueDate", null) != null)
				stbsBillDueDate	= DateTimeUtility.appendTimeToDate(JSPUtility.GetString(request, "stbsBillDueDate"));

			billTaxForGroupsCol		= BillTaxMasterForGroupDaoImpl.getInstance().getBillTaxMasterByAccountGroupId( executive.getAccountGroupId());

			if(executive != null && collectionPersonId != 0 && checkboxValues.length > 0 || allowSTBSCreationWithoutCollectionPerson) {
				shortCreditBll =  new ShortCreditCollectionSheetBLL();
				valuInObject   =  new ValueObject();

				valuInObject.put("checkboxValues", checkboxValues);
				valuInObject.put(Constant.COLLECTION_PERSON_ID, collectionPersonId);
				valuInObject.put(Constant.CORPORATE_ACCOUNT_ID, partyMasterId);
				valuInObject.put("executive", executive);
				valuInObject.put(Constant.REMARK, remark);
				valuInObject.put(DocumentCodeConfigurationDTO.DOCUMENT_CODE_CONFIGURATION, cacheManip.getDocumentCodeConfiguration(request, executive.getAccountGroupId()));
				valuInObject.put("srcBranch", cacheManip.getGenericBranchDetailCache(request, executive.getBranchId()));
				valuInObject.put("partyWiseLedgerConfig", partyWiseLedgerConfig);
				valuInObject.put("stbsBillCreationDate", stbsBillCreationDate);
				valuInObject.put("stbsBillDueDate", stbsBillDueDate);
				valuInObject.put(GeneralConfigurationPropertiesConstant.GENERAL_CONFIGURATION, cacheManip.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.GENERAL_CONFIGURATION));
				valuInObject.put(Constant.HSN_CODE, hsnCode);
				valuInObject.put(Constant.TAX_ID, taxId);
				valuInObject.put("billTaxForGroupsCol", billTaxForGroupsCol);
				valuInObject.put("applyTax", applyTax);
				valuInObject.put("stbsConfig", cacheManip.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.STBS));

				valuOutObject = shortCreditBll.insertInShortCreditCollecionSheet(valuInObject);

				if(valuOutObject.get(CargoErrorList.ERROR_CODE) != null) {
					error.put(CargoErrorList.ERROR_CODE, valuOutObject.getLong(CargoErrorList.ERROR_CODE));
					error.put(CargoErrorList.ERROR_DESCRIPTION, valuOutObject.getString(CargoErrorList.ERROR_DESCRIPTION));
					request.setAttribute("cargoError", error);
					request.setAttribute("nextPageToken", "failure");
					return;
				}

				request.setAttribute(Constant.BILL_NUMBER, valuOutObject.get(Constant.BILL_NUMBER));
				response.sendRedirect("ShortCreditCollectionSheet.do?pageId=286&eventId=1&billNumber="+ valuOutObject.get(Constant.BILL_NUMBER)+"&shortCreditLedgerId="+ valuOutObject.get("shortCreditLedgerId")+"&partyId="+ valuOutObject.get("partyId"));

			} else
				returnError(request, error);
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}
	}

	public void returnError(final HttpServletRequest request, final HashMap<String, Object> error) throws Exception {

		try {

			error.put(CargoErrorList.ERROR_CODE, CargoErrorList.NO_RECORDS);
			error.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.NO_RECORDS_DESCRIPTION);
			request.setAttribute("cargoError", error);

		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}
}