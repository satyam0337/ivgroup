/**
 *
 */
package com.ivcargo.ajax;

import java.io.PrintWriter;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.CorporateAccountBLL;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.exception.ExceptionProcess;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.AliasNameConstants;
import com.platform.dto.configuration.modules.GroupConfigurationPropertiesDTO;

/**
 * @author Anant Chaudhary	04-08-2016
 *
 */
public class PartyAutocompleteWithStringBufferAjaxAction implements Action {

	private static final String TRACE_ID = PartyAutocompleteWithStringBufferAjaxAction.class.getName();
	/* (non-Javadoc)
	 * @see com.framework.Action#execute(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
	 */
	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		PrintWriter					out							= null;
		String						partyType					= null;
		short						customerType				= 0;

		try {
			out = response.getWriter();
			response.setContentType("text/plain");

			final var	cacheManip			= new CacheManip(request);
			final var	strBfr				= new StringBuilder();
			final var	valObjIn			= new ValueObject();
			final var	corporateAccountBLL	= new CorporateAccountBLL();

			final var	executive			= cacheManip.getExecutive(request);

			if(executive == null) {
				final HashMap<String, Object> error	= null;
				ActionStaticUtil.throwInvalidSessionError(request, error);
				return;
			}

			final var	configuration		= cacheManip.getGroupConfiguration(request, executive.getAccountGroupId());
			final var	regions				= cacheManip.getAllRegions(request);
			final var	subRegions			= cacheManip.getAllSubRegions(request);
			final var	branches			= cacheManip.getGenericBranchesDetail(request);
			final var	accountGroup		= cacheManip.getAccountGroupById(request, executive.getAccountGroupId());

			valObjIn.put(GroupConfigurationPropertiesDTO.GROUP_CONFIGURATION, configuration);
			valObjIn.put(AliasNameConstants.EXECUTIVE, executive);
			valObjIn.put(AliasNameConstants.ALL_REGIONS, regions);
			valObjIn.put(AliasNameConstants.ALL_SUB_REGIONS, subRegions);
			valObjIn.put(AliasNameConstants.ALL_BRANCHES, branches);
			valObjIn.put(AliasNameConstants.ACCOUNT_GROUP, accountGroup);

			if(request.getParameter("partyType") == null)
				partyType = "1,2,3";
			else
				partyType = request.getParameter("partyType");

			valObjIn.put(AliasNameConstants.PARTY_TYPE, partyType);
			valObjIn.put(AliasNameConstants.BILLING, request.getParameter("billing"));
			valObjIn.put(AliasNameConstants.CREDITOR_TYPE, request.getParameter("creditorType"));
			customerType 	= JSPUtility.GetShort(request, "customerType", (short) 0);
			valObjIn.put(AliasNameConstants.CUSTOMER_TYPE, customerType);
			valObjIn.put("showDeletedParty", JSPUtility.GetBoolean(request, "showDeletedParty", false));
			valObjIn.put("gstNumberWiseBooking", JSPUtility.GetBoolean(request, "gstNumberWiseBooking", false));
			valObjIn.put("showDeletedPartyWithDeletedLabel", JSPUtility.GetBoolean(request, "showDeletedPartyWithDeletedLabel", false));
			valObjIn.put(AliasNameConstants.DESTINATION_BRANCH_ID, JSPUtility.GetLong(request, "destinationBranchId" ,0));
			valObjIn.put(AliasNameConstants.SOURCE_BRANCH_ID, JSPUtility.GetLong(request, "sourceBranchId" ,0));

			if (request.getParameter("?q") != null) {
				final var	strQry 			= request.getParameter("?q");

				valObjIn.put("strQry", strQry);

				final var	customerList 			= corporateAccountBLL.getPartyDetails(valObjIn);

				if (customerList != null)
					for (final Map<Object, Object> corporateAccountDetails : customerList)
						if(corporateAccountDetails != null)
							strBfr.append(corporateAccountDetails.get("label") + "|" + corporateAccountDetails.get("id") + "\n");
			} else
				strBfr.append("No data found !");

			out.println(strBfr.toString());
			out.flush();
		} catch (final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
		} finally {
			if(out != null) out.close();
		}
	}
}