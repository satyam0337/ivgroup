/**
 *
 */
package com.ivcargo.ajax.masteractions.partymaster;

import java.io.PrintWriter;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONObject;

import com.businesslogic.CorporateAccountBLL;
import com.framework.Action;
import com.iv.dto.constant.FeildPermissionsConstant;
import com.iv.utils.exception.ExceptionProcess;
import com.ivcargo.utils.CacheManip;
import com.ivcargo.utils.JsonUtility;
import com.platform.dto.AliasNameConstants;
import com.platform.dto.configuration.modules.GroupConfigurationPropertiesDTO;
import com.platform.resource.CargoErrorList;

/**
 * @author Anant Chaudhary	04-08-2016
 *
 */
public class CorporatePartySaveAjaxAction implements Action {

	private static final String TRACE_ID = CorporatePartySaveAjaxAction.class.getName();
	/* (non-Javadoc)
	 * @see com.framework.Action#execute(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
	 */
	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		PrintWriter		out				= null;
		JSONObject		jsonObjectIn	= null;
		JSONObject		jsonObjectOut	= null;

		try {
			response.setContentType("application/json"); // Setting response for JSON Content

			out				= response.getWriter();

			if(request.getParameter("json") != null)
				jsonObjectIn	= new JSONObject(request.getParameter("json"));

			if(request.getSession().getAttribute(AliasNameConstants.EXECUTIVE) == null) {
				jsonObjectOut			= new JSONObject();
				jsonObjectOut.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.errorDescription(CargoErrorList.LOGGED_OUT, null));
				out.println(jsonObjectOut);
				return;
			}

			out.println(saveParty(request, jsonObjectIn));
		} catch (final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
			try {
				jsonObjectOut	= JsonUtility.setError(CargoErrorList.SYSTEM_ERROR, CargoErrorList.SYSTEM_ERROR_DESCRIPTION);
			} catch (final Exception e1) {
				ExceptionProcess.execute(e1, TRACE_ID);
			}
			out.println(jsonObjectOut);
		} finally {
			if (out != null) {
				out.flush();
				out.close();
			}
		}
	}

	private JSONObject saveParty(final HttpServletRequest request, final JSONObject jsonObjectIn) throws Exception {
		try {
			final var	corporateAccountBLL	= new CorporateAccountBLL();

			final var	cache				= new CacheManip(request);
			final var	executive			= cache.getExecutive(request);
			final var	execFldPermissions	= cache.getExecutiveFieldPermission(request);
			final var	valObjIn			= JsonUtility.convertJsontoValueObject(jsonObjectIn);

			final var	branchId			= jsonObjectIn.optLong("partyBranchId", 0);

			valObjIn.put(GroupConfigurationPropertiesDTO.GROUP_CONFIGURATION, cache.getGroupConfiguration(request, executive.getAccountGroupId()));
			valObjIn.put(AliasNameConstants.EXECUTIVE, executive);
			valObjIn.put("branch", cache.getBranchById(request, executive.getAccountGroupId(), branchId));
			valObjIn.put(AliasNameConstants.ACCOUNT_GROUP, cache.getAccountGroupById(request, executive.getAccountGroupId()));
			valObjIn.put("savePartyWithDuplicateGstNumber", execFldPermissions != null && execFldPermissions.get(FeildPermissionsConstant.ALLOW_TO_SAVE_PARTY_WITH_DUPLICATE_GST_NUMBER) != null);

			return new JSONObject(corporateAccountBLL.saveCorporateParty(valObjIn).getHtData());
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}
}
