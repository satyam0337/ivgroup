package com.ivcargo.ajax;

import java.io.PrintWriter;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONObject;

import com.framework.Action;
import com.iv.convertor.JsonConvertor;
import com.iv.utils.constant.Constant;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.exception.ExceptionProcess;
import com.iv.utils.webService.WSUtility;
import com.iv.utils.webService.WebServiceURI;
import com.ivcargo.utils.JsonUtility;
import com.platform.resource.CargoErrorList;

public class GroupSetupAjaxAction implements Action{

	private static final String TRACE_ID = "GroupSetupAjaxAction";

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response){
		PrintWriter		out				= null;
		JSONObject		jsonObjectOut	= null;

		try {

			response.setContentType("application/json; charset=UTF-8");
			response.addHeader("Access-Control-Allow-Origin", "*");
			response.addHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE, HEAD");
			response.addHeader("Access-Control-Allow-Headers", "X-PINGOTHER, Origin, X-Requested-With, Content-Type, Accept");
			response.addHeader("Access-Control-Max-Age", "1728000");

			out				= response.getWriter();
			final var	filter			= Short.parseShort(request.getParameter("filter"));

			switch (filter) {
			case 1 -> out.println(initializeGroupSetup(response));
			case 2 -> out.println(getCityListByStateId(request, response));
			case 3 -> out.println(verifyMobileNumber(request, response));
			case 4 -> out.println(verifyEmail(request, response));
			case 5 -> out.println(createGroup(request, response));
			case 6 -> out.println(checkDuplicateGroupCode(request, response));
			case 7 -> out.println(getStateListByCountryId(request, response));
			default -> {
				jsonObjectOut	= new JSONObject();
				jsonObjectOut.put("errorDescription", "Unknown Request");
				out.println(jsonObjectOut);
			}
			}

		} catch (final Exception _e) {
			try {
				jsonObjectOut	= JsonUtility.setError(CargoErrorList.SYSTEM_ERROR, CargoErrorList.SYSTEM_ERROR_DESCRIPTION);
			} catch (final Exception e) {
				ExceptionProcess.execute(e, TRACE_ID);
			}
			out.println(jsonObjectOut);
		} finally {
			if (out != null) {
				out.flush();
				out.close();
			}
		}
	}

	private JSONObject initializeGroupSetup(final HttpServletResponse response) throws Exception {
		final var str = """
				""";

		try {
			response.setContentType(Constant.APPLICATION_JSON);

			final var	stateValObj 	= WSUtility.callPostWebService(WSUtility.getWebServiceUrl(Integer.toString(WebServiceURI.INITIALIZE_GROUP_SETUP)), str);
			final var	serviceResult	= stateValObj.getString(WSUtility.WEB_SERVICE_RESULT);

			final var	serviceResultValObj	= JsonConvertor.toValueObjectFormSimpleJsonString(serviceResult);

			return JsonUtility.convertionToJsonObjectForResponse(serviceResultValObj);
		} catch(final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
			return JsonUtility.setError(CargoErrorList.SYSTEM_ERROR, CargoErrorList.SYSTEM_ERROR_DESCRIPTION);
		}
	}

	private JSONObject getCityListByStateId(final HttpServletRequest request, final HttpServletResponse response) throws Exception {
		try {
			final var	module			= new StringBuilder();

			module.append("&stateEle_primary_key=" + request.getParameter("stateId"));

			response.setContentType("application/json");

			final var	jsonObjectOut 	= WSUtility.callPostWebService(WSUtility.getWebServiceUrl(Integer.toString(WebServiceURI.GET_CITY_LIST_BY_STATE_ID)), module.toString());
			final var	serviceResult	= jsonObjectOut.getString(WSUtility.WEB_SERVICE_RESULT);

			final var	serviceResultValObj   = JsonConvertor.toValueObjectFormSimpleJsonString(serviceResult);

			return JsonUtility.convertionToJsonObjectForResponse(serviceResultValObj);
		} catch(final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
			return JsonUtility.setError(CargoErrorList.SYSTEM_ERROR, CargoErrorList.SYSTEM_ERROR_DESCRIPTION);
		}
	}

	private JSONObject checkDuplicateGroupCode(final HttpServletRequest request, final HttpServletResponse response) throws Exception {
		try {
			final var	module			= new StringBuilder();

			module.append("&accountGroupCode=" + request.getParameter("accountGroupCode"));

			response.setContentType("application/json");

			final var	jsonObjectOut 	= WSUtility.callPostWebService(WSUtility.getWebServiceUrl(Integer.toString(WebServiceURI.CHECK_DUPLICATE_GROUP_CODE)), module.toString());
			final var	serviceResult	= jsonObjectOut.getString(WSUtility.WEB_SERVICE_RESULT);

			final var	serviceResultValObj   = JsonConvertor.toValueObjectFormSimpleJsonString(serviceResult);

			return JsonUtility.convertionToJsonObjectForResponse(serviceResultValObj);
		} catch(final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
			return JsonUtility.setError(CargoErrorList.SYSTEM_ERROR, CargoErrorList.SYSTEM_ERROR_DESCRIPTION);
		}
	}

	private JSONObject verifyMobileNumber(final HttpServletRequest request, final HttpServletResponse response) throws Exception {
		try {
			final var	module			= new StringBuilder();
			module.append("&mobileNumber=" + request.getParameter("mobileNumber"));

			response.setContentType("application/json");

			final var	jsonObjectOut 	= WSUtility.callPostWebService(WSUtility.getWebServiceUrl(Integer.toString(WebServiceURI.MOBILE_NUMBER_VERIFICATION)), module.toString());
			final var	serviceResult	= jsonObjectOut.getString(WSUtility.WEB_SERVICE_RESULT);

			final var	serviceResultValObj   = JsonConvertor.toValueObjectFormSimpleJsonString(serviceResult);

			return JsonUtility.convertionToJsonObjectForResponse(serviceResultValObj);
		} catch(final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
			return JsonUtility.setError(CargoErrorList.SYSTEM_ERROR, CargoErrorList.SYSTEM_ERROR_DESCRIPTION);
		}
	}

	private JSONObject verifyEmail(final HttpServletRequest request, final HttpServletResponse response) throws Exception {
		try {
			final var	module			= new StringBuilder();

			module.append("&EmailAddress=" + request.getParameter("EmailAddress"));

			response.setContentType("application/json");

			final var	jsonObjectOut 	= WSUtility.callPostWebService(WSUtility.getWebServiceUrl(Integer.toString(WebServiceURI.EMAIL_VERIFICATION)), module.toString());
			final var	serviceResult	= jsonObjectOut.getString(WSUtility.WEB_SERVICE_RESULT);

			final var	serviceResultValObj   = JsonConvertor.toValueObjectFormSimpleJsonString(serviceResult);

			return JsonUtility.convertionToJsonObjectForResponse(serviceResultValObj);
		} catch(final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
			return JsonUtility.setError(CargoErrorList.SYSTEM_ERROR, CargoErrorList.SYSTEM_ERROR_DESCRIPTION);
		}
	}

	private JSONObject createGroup(final HttpServletRequest request, final HttpServletResponse response) throws Exception {
		JSONObject			jsonObject				= null;

		try {
			final var	module			= new StringBuilder();
			final var	jsonObj			= setInputParamas(module,request);

			if(jsonObj != null && jsonObj.has(CargoErrorList.ERROR_CODE))
				return JsonUtility.setError(jsonObj.getInt(CargoErrorList.ERROR_CODE), jsonObj.getString(CargoErrorList.ERROR_DESCRIPTION));

			response.setContentType(Constant.APPLICATION_JSON);

			final var	jsonObjectOut 	= WSUtility.callPostWebService(WSUtility.getWebServiceUrl(Integer.toString(WebServiceURI.CREATE_GROUP)), module.toString());

			if(jsonObjectOut != null) {
				final var	serviceResult	= jsonObjectOut.getString(WSUtility.WEB_SERVICE_RESULT);

				final var	serviceResultValObj   = JsonConvertor.toValueObjectFormSimpleJsonString(serviceResult);

				jsonObject		= JsonUtility.convertionToJsonObjectForResponse(serviceResultValObj);

				if(jsonObject != null) {
					if(jsonObject.has(Constant.ACCOUNT_GROUP_ID) && jsonObject.getLong(Constant.ACCOUNT_GROUP_ID) > 0)
						request.setAttribute(Constant.ACCOUNT_GROUP_ID, jsonObject.getLong(Constant.ACCOUNT_GROUP_ID));

					if(request.getAttribute(Constant.ACCOUNT_GROUP_ID) != null) {
						final var	refreshObj	= new RefreshCacheAction();
						refreshObj.execute(request, response);
					}
				}
			}

			return jsonObject;
		} catch(final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
			return JsonUtility.setError(CargoErrorList.SYSTEM_ERROR, CargoErrorList.SYSTEM_ERROR_DESCRIPTION);
		}
	}

	private JSONObject setInputParamas(final StringBuilder module, final HttpServletRequest request) throws Exception {
		final JSONObject 			object 			= null;

		try {
			if(validateParameter(request,"groupTypeId") != null)
				return validateParameter(request,"groupTypeId");

			if(validateParameter(request,"lastName") != null)
				return validateParameter(request,"lastName");

			if(validateParameter(request,"executiveName") != null)
				return validateParameter(request,"executiveName");

			if(validateParameter(request,"accountGroupName") != null)
				return validateParameter(request,"accountGroupName");

			if(validateParameter(request,"accountGroupCode") != null)
				return validateParameter(request,"accountGroupCode");

			if(validateParameter(request,"accountGroupDescription") != null)
				return validateParameter(request,"accountGroupDescription");

			if(validateParameter(request,"accountGroupAddress") != null)
				return validateParameter(request,"accountGroupAddress");

			if(validateParameter(request,"contactPersonName") != null)
				return validateParameter(request,"contactPersonName");

			if(validateParameter(request,"stateId") != null)
				return validateParameter(request,"stateId");

			if(validateParameter(request,"CityId") != null)
				return validateParameter(request,"CityId");

			if(validateParameter(request, Constant.COUNTRY_ID) != null)
				return validateParameter(request, Constant.COUNTRY_ID);

			if(validateParameter(request,"MobileNumber") != null)
				return validateParameter(request,"MobileNumber");

			if(validateParameter(request,"EmailAddress") != null)
				return validateParameter(request,"EmailAddress");

			if(validateParameter(request,"regionName") != null)
				return validateParameter(request,"regionName");

			if(validateParameter(request,"subRegionName") != null)
				return validateParameter(request,"subRegionName");

			if(validateParameter(request,"branchName") != null)
				return validateParameter(request,"branchName");

			if(validateParameter(request,"branchCode") != null)
				return validateParameter(request,"branchCode");

			if(validateParameter(request,"branchDisplayName") != null)
				return validateParameter(request,"branchDisplayName");

			if(validateParameter(request,"subscriptionDays") != null)
				return validateParameter(request,"subscriptionDays");

			if(validateParameter(request,"address") != null)
				return validateParameter(request,"address");

			if(validateParameter(request,"serverId") != null)
				return validateParameter(request,"serverId");

			module.append("&groupTypeId=" + request.getParameter("groupTypeId"));
			module.append("&lastName=" + request.getParameter("lastName"));
			module.append("&executiveName=" + request.getParameter("executiveName"));
			module.append("&accountGroupName=" + request.getParameter("accountGroupName"));
			module.append("&accountGroupCode=" + request.getParameter("accountGroupCode"));
			module.append("&accountGroupDescription=" + request.getParameter("accountGroupDescription"));
			module.append("&accountGroupAddress=" + request.getParameter("accountGroupAddress"));
			module.append("&contactPersonName=" + request.getParameter("contactPersonName"));
			module.append("&stateId=" + request.getParameter("stateId"));
			module.append("&CityId=" + request.getParameter("CityId"));
			module.append("&CountryId=" + request.getParameter(Constant.COUNTRY_ID));
			module.append("&MobileNumber=" + request.getParameter("MobileNumber"));
			module.append("&EmailAddress=" + request.getParameter("EmailAddress"));
			module.append("&regionName=" + request.getParameter("regionName"));
			module.append("&subRegionName=" + request.getParameter("subRegionName"));
			module.append("&branchName=" + request.getParameter("branchName"));
			module.append("&branchCode=" + request.getParameter("branchCode"));
			module.append("&branchDisplayName=" + request.getParameter("branchDisplayName"));
			module.append("&subscriptionDays=" + request.getParameter("subscriptionDays"));
			module.append("&address=" + request.getParameter("address"));
			module.append("&serverId=" + request.getParameter("serverId"));
			module.append("&allowTaxCharges=" + request.getParameter("allowTaxCharges"));

			return object;
		} catch (final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
			return JsonUtility.setError(CargoErrorList.SYSTEM_ERROR, CargoErrorList.SYSTEM_ERROR_DESCRIPTION);
		}
	}

	private JSONObject validateParameter(final HttpServletRequest request, final String parameter) throws Exception {
		final JSONObject 			object 			= null;

		try {
			if(!request.getParameterMap().containsKey(parameter)) {
				final var	jsobj	= new ValueObject();
				jsobj.put("errorCode", CargoErrorList.NO_RECORDS);
				jsobj.put("errorDescription", parameter + " not found.");

				return JsonUtility.convertionToJsonObjectForResponse(jsobj);
			}

			return object;
		} catch (final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
			return JsonUtility.setError(CargoErrorList.SYSTEM_ERROR, CargoErrorList.SYSTEM_ERROR_DESCRIPTION);
		}
	}

	private JSONObject getStateListByCountryId(final HttpServletRequest request, final HttpServletResponse response) throws Exception {
		try {
			final var	module			= new StringBuilder();

			module.append("&CountryId=" + request.getParameter(Constant.COUNTRY_ID));

			response.setContentType(Constant.APPLICATION_JSON);

			final var	jsonObjectOut 	= WSUtility.callPostWebService(WSUtility.getWebServiceUrl(Integer.toString(WebServiceURI.GET_STATE_BY_COUNTRY_ID)), module.toString());
			final var	serviceResult	= jsonObjectOut.getString(WSUtility.WEB_SERVICE_RESULT);

			final var	serviceResultValObj   = JsonConvertor.toValueObjectFormSimpleJsonString(serviceResult);

			return JsonUtility.convertionToJsonObjectForResponse(serviceResultValObj);
		} catch(final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
			return JsonUtility.setError(CargoErrorList.SYSTEM_ERROR, CargoErrorList.SYSTEM_ERROR_DESCRIPTION);
		}
	}
}