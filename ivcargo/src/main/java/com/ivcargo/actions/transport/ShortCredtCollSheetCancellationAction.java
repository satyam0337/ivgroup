package com.ivcargo.actions.transport;

//~--- non-JDK imports --------------------------------------------------------

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.ShortCreditCollectionSheetBLL;
import com.businesslogic.properties.impl.PropertyConfigValueBLLImpl;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.constant.properties.GeneralConfigurationPropertiesConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.PropertiesFileConstants;

public class ShortCredtCollSheetCancellationAction implements Action {

	public static final String TRACE_ID = "ShortCredtCollSheetCancellationAction";

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {


		HashMap<String,Object>	 		error 						= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	inValObj					= new ValueObject();
			final var	cacheManip					= new CacheManip(request);
			final var	executive					= cacheManip.getExecutive(request);
			final var	id							= JSPUtility.GetLong(request, "shrtCredLedgerId", 0);
			final var	partyWiseLedgerConfig		= PropertyConfigValueBLLImpl.getInstance().getConfiguration(executive, PropertiesFileConstants.PARTY_WISE_LEDGER_ACCOUNTS_CONFIG);

			if(id > 0 && executive != null){
				inValObj.put("shrtCredLedgerId", id);
				final var	shortCreditBll = new ShortCreditCollectionSheetBLL();
				inValObj.put("executive", executive);
				inValObj.put("partyWiseLedgerConfig", partyWiseLedgerConfig);
				inValObj.put(GeneralConfigurationPropertiesConstant.GENERAL_CONFIGURATION, cacheManip.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.GENERAL_CONFIGURATION));
				shortCreditBll.cancelShortCreditLedger(inValObj);
			}

			response.sendRedirect("editWaybill.do?pageId=5&eventId=3&wayBillNumber="+request.getParameter("noSearched")+"&TypeOfNumber="+request.getParameter("typeOfNoSearched")/*+"&searchBy="+request.getParameter("searchByBranchName")+"&BranchId="+request.getParameter("searchByBranchId")+"&CityId="+request.getParameter("searchByCityId")*/);
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}
}