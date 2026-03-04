/**
 *
 */
package com.ivcargo.ajax;

import java.io.PrintWriter;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONObject;

import com.businesslogic.CorporateAccountBLL;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.constant.properties.GroupConfigurationPropertiesConstant;
import com.iv.constant.properties.master.RateMasterPropertiesConstant;
import com.iv.logsapp.LogWriter;
import com.iv.utils.constant.Constant;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.exception.ExceptionProcess;
import com.ivcargo.utils.CacheManip;
import com.ivcargo.utils.JsonUtility;
import com.platform.dto.AliasNameConstants;
import com.platform.dto.Executive;
import com.platform.dto.GroupConfigurationProperties;
import com.platform.dto.configuration.modules.GroupConfigurationPropertiesDTO;
import com.platform.dto.constant.CorporateAccountConstant;
import com.platform.dto.constant.CustomerDetailsConstant;
import com.platform.resource.CargoErrorList;

/**
 * @author Anant Chaudhary	04-08-2016
 *
 */
public class PartyAutocompleteAjaxAction implements Action {

	private static final String TRACE_ID = PartyAutocompleteAjaxAction.class.getName();
	/* (non-Javadoc)
	 * @see com.framework.Action#execute(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
	 */
	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		PrintWriter		out				= null;
		JSONObject		jsonObjectOut	= null;

		try {
			response.setContentType(Constant.APPLICATION_JSON); // Setting response for JSON Content

			out				= response.getWriter();

			if(request.getSession().getAttribute(Executive.EXECUTIVE) == null) {
				jsonObjectOut			= new JSONObject();
				jsonObjectOut.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.LOGGED_OUT_DESCRIPTION);
				out.println(jsonObjectOut);
				return;
			}

			out.println(getPartyDetailsAutocomplete(request));
		} catch (final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
			try {
				jsonObjectOut	= JsonUtility.setError(CargoErrorList.SYSTEM_ERROR, CargoErrorList.SYSTEM_ERROR_DESCRIPTION);
			} catch (final Exception e1) {
				LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, ""+e1);
				e.printStackTrace();
			}
			out.println(jsonObjectOut);
		} finally {
			if (out != null) {
				out.flush();
				out.close();
			}
		}
	}

	private JSONArray getPartyDetailsAutocomplete(final HttpServletRequest request) throws Exception {
		JSONArray						jArray								= null;
		String 							partyType 							= null;
		List<Map<Object, Object>>		personList							= null;
		var								isNumberAutocomplete				= false;
		short							partyGetIdentifier					= 0;

		try {
			final var	corporateAccountBLL		= new CorporateAccountBLL();

			final var	valObjIn				= new ValueObject();

			final var	cache					= new CacheManip(request);
			final var	executive				= cache.getExecutive(request);
			final var	configuration			= cache.getGroupConfiguration(request, executive.getAccountGroupId());
			final var	regions					= cache.getAllRegions(request);
			final var	subRegions				= cache.getAllSubRegions(request);
			final var	branches				= cache.getGenericBranchesDetail(request);
			final var	accountGroup			= cache.getAccountGroupById(request, executive.getAccountGroupId());

			if(request.getParameter("isNumberAutocomplete") != null) {
				isNumberAutocomplete	= Boolean.parseBoolean(request.getParameter("isNumberAutocomplete"));
				partyGetIdentifier		= configuration.getShort(GroupConfigurationPropertiesConstant.PARTY_GET_IDENTIFIER_IN_MOBILE_AUTOCOMPLETE, (short) 1);
			}

			final var	showRateConfiguredSignInPartyName	= JSPUtility.GetBoolean(request, "showRateConfiguredSignInPartyName", false);
			final var	partyCodeWiseBooking				= JSPUtility.GetBoolean(request, "partyCodeWiseBooking", false);
			final var	gstNumberWiseBooking				= JSPUtility.GetBoolean(request, "gstNumberWiseBooking", false);
			final var	wayBillTypeId						= JSPUtility.GetLong(request, Constant.WAY_BILL_TYPE_ID, 0);
			final var	searchPartyOnAllDest				= JSPUtility.GetBoolean(request, "searchPartyOnAllDest", false);
			final var	isAllowNewGstNumberOnAutoSave		= JSPUtility.GetBoolean(request, "isAllowNewGstNumberOnAutoSave", false);

			valObjIn.put(GroupConfigurationPropertiesDTO.GROUP_CONFIGURATION, configuration);
			valObjIn.put(AliasNameConstants.EXECUTIVE, executive);
			valObjIn.put(AliasNameConstants.ALL_REGIONS, regions);
			valObjIn.put(AliasNameConstants.ALL_SUB_REGIONS, subRegions);
			valObjIn.put(AliasNameConstants.ALL_BRANCHES, branches);
			valObjIn.put(AliasNameConstants.ACCOUNT_GROUP, accountGroup);
			valObjIn.put(AliasNameConstants.SOURCE_BRANCH_ID, JSPUtility.GetLong(request, AliasNameConstants.SOURCE_BRANCH_ID, 0));

			final var	destinationBranchId = JSPUtility.GetLong(request, "destinationId", 0);

			valObjIn.put(AliasNameConstants.DESTINATION_BRANCH_ID, destinationBranchId);
			valObjIn.put("consignorId", JSPUtility.GetLong(request, "consignorId", 0));

			if(request.getParameter("partyType") == null)
				partyType = "1,2,3";
			else
				partyType = request.getParameter("partyType");

			valObjIn.put(AliasNameConstants.PARTY_TYPE, partyType);
			valObjIn.put(AliasNameConstants.BILLING, request.getParameter("billing"));
			valObjIn.put(AliasNameConstants.CREDITOR_TYPE, request.getParameter("creditorType"));
			valObjIn.put(GroupConfigurationPropertiesDTO.IS_BLACK_LIST_PARTY_CHECKING_ALLOW, request.getParameter("isBlackListPartyCheckingAllow"));
			valObjIn.put("moduleFilterForBlackListPartyChecking", request.getParameter("moduleFilterForBlackListPartyChecking"));
			valObjIn.put(GroupConfigurationPropertiesDTO.SHOW_RATE_CONIFIGURED_SIGN_IN_PARTY_NAME, showRateConfiguredSignInPartyName);
			valObjIn.put(GroupConfigurationPropertiesDTO.PARTY_CODE_WISE_BOOKING, partyCodeWiseBooking);
			valObjIn.put(Constant.WAY_BILL_TYPE_ID, wayBillTypeId);
			valObjIn.put(GroupConfigurationPropertiesDTO.GST_NUMBER_WISE_BOOKING, gstNumberWiseBooking);
			valObjIn.put(RateMasterPropertiesConstant.PARTY_AUTO_COMPLETE_WITH_NAME_AND_GST, request.getParameter(RateMasterPropertiesConstant.PARTY_AUTO_COMPLETE_WITH_NAME_AND_GST));

			final var	customerType 	= JSPUtility.GetShort(request, AliasNameConstants.CUSTOMER_TYPE, (short) 0);

			valObjIn.put(AliasNameConstants.CUSTOMER_TYPE, customerType);

			if((!isNumberAutocomplete || partyGetIdentifier == CorporateAccountConstant.BRANCH_LEVEL_PARTY_GET_IDENTIFIER_IN_MOBILE) && customerType == CustomerDetailsConstant.CUSTOMER_TYPE_CONSIGNEE_ID && !gstNumberWiseBooking && destinationBranchId == 0 && !searchPartyOnAllDest) {
				final var	jsonObject	= new JSONObject();

				jsonObject.put(Constant.AUTOCOMPLETE_LABEL, "Please Select Destination");
				jsonObject.put(Constant.AUTOCOMPLETE_ID, "0");

				jArray	= new JSONArray();

				jArray.put(jsonObject);
				return jArray;
			}

			if (request.getParameter(Constant.AUTOCOMPLETE_REQUEST_PARAM) != null) {
				valObjIn.put("strQry", request.getParameter(Constant.AUTOCOMPLETE_REQUEST_PARAM));

				if(isNumberAutocomplete)
					personList 			= corporateAccountBLL.getPartyDetailsByNumbers(valObjIn);
				else
					personList 			= corporateAccountBLL.getPartyDetails(valObjIn);
			}

			if(personList != null) {
				jArray	= new JSONArray();

				for (final Map<Object, Object> element : personList)
					jArray.put(new JSONObject(element));
			}

			if(jArray != null && jArray.length() < 1)
				if(isAllowNewGstNumberOnAutoSave) {
					final var jObject	= new JSONObject();
					jObject.put(Constant.AUTOCOMPLETE_LABEL, request.getParameter("term"));
					jArray.put(jObject);
				} else
					jArray.put(setAutocompleteResponse(request));

			return jArray;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private JSONObject setAutocompleteResponse(final HttpServletRequest request) throws Exception {
		try {
			final var	jObject	= new JSONObject();

			jObject.put(Constant.AUTOCOMPLETE_ID, "0");

			if(request.getParameter("responseFilter") != null) {
				final var resType = Short.parseShort(request.getParameter("responseFilter"));

				switch (resType) {
				case GroupConfigurationProperties.AUTOCOMPLETE_RESPONSE_NORECORD -> jObject.put(Constant.AUTOCOMPLETE_LABEL, "No Record Found");
				case GroupConfigurationProperties.AUTOCOMPLETE_RESPONSE_SAMEDATA -> jObject.put(Constant.AUTOCOMPLETE_LABEL, request.getParameter("term") + " (New)");
				case GroupConfigurationProperties.AUTOCOMPLETE_RESPONSE_SAMEDATAWITHOUTNEW -> jObject.put(Constant.AUTOCOMPLETE_LABEL, request.getParameter("term"));
				default -> jObject.put(Constant.AUTOCOMPLETE_LABEL, "No Record Found");
				}
			}

			return jObject;

		} catch (final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
			final var	jObject	= new JSONObject();
			jObject.put(Constant.AUTOCOMPLETE_LABEL, "Some Error occoured While Fetching.");
			jObject.put(Constant.AUTOCOMPLETE_ID, "0");
			return jObject;
		}
	}
}