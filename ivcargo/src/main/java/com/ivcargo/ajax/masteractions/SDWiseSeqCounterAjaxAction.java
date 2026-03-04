
package com.ivcargo.ajax.masteractions;

//~--- non-JDK imports --------------------------------------------------------

import java.io.PrintWriter;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONObject;

import com.businesslogic.master.SDWiseSeqCounterBll;
import com.businesslogic.utils.SequenceCounterBLL;
import com.framework.Action;
import com.iv.bll.utils.BookingWayBillSelectionUtility;
import com.iv.constant.properties.GroupConfigurationPropertiesConstant;
import com.iv.constant.properties.master.SequenceCounterMasterConfigurationConstant;
import com.iv.dao.impl.sequencecounter.SourceDestinationWiseSequenceCounterDaoImpl;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.utils.constant.Constant;
import com.iv.utils.exception.ExceptionProcess;
import com.ivcargo.utils.CacheManip;
import com.ivcargo.utils.JsonUtility;
import com.platform.dto.Branch;
import com.platform.dto.Executive;
import com.platform.dto.SourceDestinationWiseSequenceCounter;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Converter;
import com.platform.utils.Utility;

public class SDWiseSeqCounterAjaxAction implements Action {

	public static final String TRACE_ID = "SDWiseSeqCounterAjaxAction";

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		PrintWriter						out							= null;
		JSONObject						jsonObjectIn				= null;
		JSONObject						jsonObjectOut				= null;
		short							filter						= 0;

		try {
			response.setContentType("application/json"); // Setting response for JSON Content

			out						= response.getWriter();
			jsonObjectOut			= new JSONObject();
			jsonObjectIn			= new JSONObject(request.getParameter("json"));
			filter					= Utility.getShort(jsonObjectIn.get("filter"));

			if(request.getSession().getAttribute(Executive.EXECUTIVE) == null) {
				jsonObjectOut.put(CargoErrorList.ERROR_DESCRIPTION, "You have been logged out. Please login again.");
				out.println(jsonObjectOut);
				return;
			}

			switch (filter) {
			case 1 -> out.println(initilizeSC(request, jsonObjectOut));
			case 2 -> out.println(getSDWiseLrSeqCounter(request, jsonObjectOut, jsonObjectIn));
			case 3 -> out.println(addSDWiseLrSeqCounter(request, jsonObjectOut, jsonObjectIn));
			case 4 -> out.println(getAllLrSeqCounter(request, jsonObjectIn));
			case 5 -> out.println(updateNextVal(request, jsonObjectOut, jsonObjectIn));
			case 6 -> out.println(addManualLrSeqCounter(request, jsonObjectOut, jsonObjectIn));
			case 7 -> out.println(getFilterWiseLrSeqCounter(request, jsonObjectIn));
			case 8 -> out.println(updateSrcDestWiseSeqCounter(request, jsonObjectOut, jsonObjectIn));
			default -> {
				jsonObjectOut.put("errorDescription", "Unknown Request");
				out.println(jsonObjectOut);
			}
			}
		} catch (final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
			try {
				jsonObjectOut			= new JSONObject();
				jsonObjectOut.put(CargoErrorList.ERROR_CODE, CargoErrorList.SYSTEM_ERROR);
				jsonObjectOut.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.SYSTEM_ERROR_DESCRIPTION);
			} catch (final Exception e1) {
				ExceptionProcess.execute(e1, TRACE_ID);
			}
			out.println(jsonObjectOut);
		} finally {
			if(out != null) {
				out.flush();
				out.close();
			}
		}
	}

	private JSONObject initilizeSC(final HttpServletRequest request,final JSONObject jsonObjectOut) throws Exception {
		try {
			final var	cache				= new CacheManip(request);

			final var	valObjOut			= JsonUtility.convertJsontoValueObject(jsonObjectOut);

			final var	loggedInExec		= cache.getExecutive(request);
			final var	city 				= cache.getAllCitiesForGroupHM(request, loggedInExec.getAccountGroupId());
			final var	configuration		= cache.getConfiguration(request, loggedInExec.getAccountGroupId(), ModuleIdentifierConstant.SEQUENCE_COUNTER_MASTER);
			final var 	groupConfig			= cache.getConfiguration(request, loggedInExec.getAccountGroupId(), ModuleIdentifierConstant.BOOKING);

			final var seqLvl 		= (int) groupConfig.getOrDefault(GroupConfigurationPropertiesConstant.SOURCE_DESTINATION_WISE_WAY_BILL_NUMBER_GENERATION_LEVEL, 0);
			final var cityWiseSeq 	= (boolean) configuration.getOrDefault(SequenceCounterMasterConfigurationConstant.IS_SOURCE_AND_DESTINATION_CITY_BRANCH_WISE_LR_NUMBER_GENERATION_LEVEL, false);

			final var sdBranchWiseSeq	=  (boolean) configuration.getOrDefault(SequenceCounterMasterConfigurationConstant.SHOW_SOURCE_DESTWISE_SEQ_SEQUENCE_COUNTER, false);

			valObjOut.put(Executive.EXECUTIVE, Converter.DtoToHashMap(loggedInExec));
			valObjOut.put("cityWiseSeq", seqLvl == SourceDestinationWiseSequenceCounter.SOURCE_CITY_DESTINATION_CITY_DESTINATION_BRANCH_LEVEL && cityWiseSeq);
			valObjOut.put("sourceCitySourceBranchDestinationCityDestinationBranchSequence", seqLvl == SourceDestinationWiseSequenceCounter.SOURCE_CITY_SOURCE_BRANCH_DESTINATION_CITY_DESTINATION_BRANCH_LEVEL);

			valObjOut.put("sdBranchWiseSeq", seqLvl == SourceDestinationWiseSequenceCounter.SOURCE_REGION_SOURCE_SUBREGION_SOURCE_BRANCH_DESTINATION_REGION_DESTINATION_SUBREGION_DESTINATION_BRANCH_LEVEL && sdBranchWiseSeq);
			valObjOut.put("configuration", configuration);
			valObjOut.put("isCityBranchLrSequenceCounter", (boolean) configuration.getOrDefault(SequenceCounterMasterConfigurationConstant.IS_CITY_BRANCH_LR_SEQUENCE_COUNTER,false));
			valObjOut.put("city",city);

			if(loggedInExec.getExecutiveType() == Executive.EXECUTIVE_TYPE_GROUPADMIN)
				valObjOut.put("regions", Converter.arrayDtotoArrayListWithHashMapConversion(cache.getRegionsByGroupId(request, loggedInExec.getAccountGroupId())));
			else if(loggedInExec.getExecutiveType() == Executive.EXECUTIVE_TYPE_REGIONADMIN)
				valObjOut.put("subRegions", Converter.arrayDtotoArrayListWithHashMapConversion(cache.getSubRegionsByRegionId(request, loggedInExec.getRegionId(), loggedInExec.getAccountGroupId())));
			else if(loggedInExec.getExecutiveType() == Executive.EXECUTIVE_TYPE_SUBREGIONADMIN)
				valObjOut.put("branchs", Converter.arrayDtotoArrayListWithHashMapConversion(cache.getBranchesArrayBySubRegionId(request, loggedInExec.getAccountGroupId(),loggedInExec.getSubRegionId())));

			valObjOut.put("billSelectionList", BookingWayBillSelectionUtility.getBillSelectionListForModule(groupConfig));
			valObjOut.put("maxRange", SourceDestinationWiseSequenceCounterDaoImpl.getInstance().getMaxRange(loggedInExec.getAccountGroupId()));

			return JsonUtility.convertionToJsonObjectForResponse(valObjOut);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private JSONObject updateNextVal(final HttpServletRequest request, final JSONObject jsonObjectOut, final JSONObject jsonObjectIn) throws Exception {
		try {
			final var	sdWiseSeqCounterBll	= new SDWiseSeqCounterBll();
			final var	cacheManip			= new CacheManip(request);

			final var	valObjIn			= JsonUtility.convertJsontoValueObject(jsonObjectIn);
			final var	valObjOut			= JsonUtility.convertJsontoValueObject(jsonObjectOut);
			final var	executive			= cacheManip.getExecutive(request);

			valObjIn.put(Executive.EXECUTIVE, executive);

			final var	jsobj = sdWiseSeqCounterBll.updateNextValue(valObjIn, valObjOut);

			return JsonUtility.convertionToJsonObjectForResponse(jsobj);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private JSONObject updateSrcDestWiseSeqCounter(final HttpServletRequest request, final JSONObject jsonObjectOut, final JSONObject jsonObjectIn) throws Exception {
		try {
			final var	cache 				= new CacheManip(request);

			final var	sdWiseSeqCounterBll	= new SDWiseSeqCounterBll();

			final var	valObjIn			= JsonUtility.convertJsontoValueObject(jsonObjectIn);
			final var	valObjOut			= JsonUtility.convertJsontoValueObject(jsonObjectOut);
			final var	executive			= cache.getExecutive(request);
			final var	branchcache			= cache.getGenericBranchesDetail(request);
			final var	subRegionCache		= cache.getAllSubRegions(request);
			final var	regioncache			= cache.getAllRegionDataForGroup(request, executive.getAccountGroupId());
			final var	cityCache			= cache.getAllCitiesForGroupHM(request, executive.getAccountGroupId());

			valObjIn.put(Executive.EXECUTIVE, executive);
			valObjIn.put("branchcache", branchcache);
			valObjIn.put("subRegionCache", subRegionCache);
			valObjIn.put("regioncache", regioncache);
			valObjIn.put("cityCache", cityCache);

			final var	jsobj = sdWiseSeqCounterBll.updateSrcDestWiseSeqCounter(valObjIn, valObjOut);

			return JsonUtility.convertionToJsonObjectForResponse(jsobj);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private JSONObject getSDWiseLrSeqCounter(final HttpServletRequest request, final JSONObject jsonObjectOut, final JSONObject jsonObjectIn) throws Exception {
		try {
			final var	sdWiseSeqCounterBll	= new SDWiseSeqCounterBll();
			final var	cacheManip			= new CacheManip(request);
			final var	valObjIn			= JsonUtility.convertJsontoValueObject(jsonObjectIn);
			final var	valObjOut			= JsonUtility.convertJsontoValueObject(jsonObjectOut);

			valObjIn.put(Executive.EXECUTIVE, cacheManip.getExecutive(request));

			final var	jsobj = sdWiseSeqCounterBll.getSDWiseLrSeqCounter(valObjIn, valObjOut);

			return JsonUtility.convertionToJsonObjectForResponse(jsobj);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private JSONObject getAllLrSeqCounter(final HttpServletRequest request, final JSONObject jsonObjectIn) throws Exception {
		try {
			final var	cache 				= new CacheManip(request);

			final var	sdWiseSeqCounterBll	= new SDWiseSeqCounterBll();
			final var	valObjIn			= JsonUtility.convertJsontoValueObject(jsonObjectIn);

			final var	executive			= cache.getExecutive(request);
			final var	branchcache			= cache.getGenericBranchesDetail(request);
			final var	subRegionCache		= cache.getAllSubRegions(request);
			final var	regioncache			= cache.getAllRegionDataForGroup(request, executive.getAccountGroupId());

			valObjIn.put(Executive.EXECUTIVE, executive);
			valObjIn.put("branchcache", branchcache);
			valObjIn.put("subRegionCache", subRegionCache);
			valObjIn.put("regioncache", regioncache);

			final var	jsobj = sdWiseSeqCounterBll.getAllLrSeqCounter(valObjIn);

			if(jsobj == null) {
				final var	object	= new JSONObject();
				object.put("empty", true);
				return object;
			}

			final var	object = JsonUtility.convertionToJsonObjectForResponse(jsobj);

			object.put("Success", true);

			return object;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private JSONObject getFilterWiseLrSeqCounter(final HttpServletRequest request, final JSONObject jsonObjectIn) throws Exception {
		try {
			final var	cache 				= new CacheManip(request);

			final var	sdWiseSeqCounterBll	= new SDWiseSeqCounterBll();
			final var	valObjIn			= JsonUtility.convertJsontoValueObject(jsonObjectIn);

			final var	executive			= cache.getExecutive(request);
			final var	branchcache			= cache.getGenericBranchesDetail(request);
			final var	subRegionCache		= cache.getAllSubRegions(request);
			final var	regioncache			= cache.getAllRegionDataForGroup(request, executive.getAccountGroupId());
			final var	destBranchCache		= cache.getGenericBranchesDetail(request);
			final var	cityCache			= cache.getAllCitiesForGroupHM(request, executive.getAccountGroupId());

			valObjIn.put(Executive.EXECUTIVE, executive);
			valObjIn.put("branchcache", branchcache);
			valObjIn.put("subRegionCache", subRegionCache);
			valObjIn.put("regioncache", regioncache);
			valObjIn.put("cityCache", cityCache);
			valObjIn.put("destBranchCache", destBranchCache);

			final var	jsobj = sdWiseSeqCounterBll.getFilterWiseLrSeqCounter(valObjIn);

			if(jsobj == null) {
				final var	object	= new JSONObject();
				object.put("empty", true);
				return object;
			}

			final var	object = JsonUtility.convertionToJsonObjectForResponse(jsobj);

			object.put("Success", true);

			return object;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private JSONObject addSDWiseLrSeqCounter(final HttpServletRequest request, final JSONObject jsonObjectOut, final JSONObject jsonObjectIn) throws Exception {
		try {
			final var	sdWiseSeqCounterBll	= new SDWiseSeqCounterBll();
			final var	cache 				= new CacheManip(request);

			final var	valObjIn			= JsonUtility.convertJsontoValueObject(jsonObjectIn);
			final var	valObjOut			= JsonUtility.convertJsontoValueObject(jsonObjectOut);
			final var	executive			= cache.getExecutive(request);
			final var	branches			= cache.getGenericBranchesDetail(request);
			final var	branchList			= cache.getBranchForGroupForCity(request, Long.toString(executive.getAccountGroupId()), valObjIn.getString(Constant.SOURCE_CITY_ID, "0"));
			final var	branch 				= (Branch) branches.get(Long.toString(valObjIn.getLong(Constant.SOURCE_BRANCH_ID, 0)));
			final var	execBranch 			= (Branch) branches.get(Long.toString(executive.getBranchId()));
			final var	destBranch			= (Branch) branches.get(Long.toString(valObjIn.getLong(Constant.DESTINATION_BRANCH_ID, 0)));

			valObjIn.put(Executive.EXECUTIVE, executive);
			valObjIn.put("branch", branch);
			valObjIn.put("destBranch", destBranch);
			valObjIn.put("branchList", branchList);
			valObjIn.put("execBranch", execBranch);
			valObjIn.put("configuration", cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.SEQUENCE_COUNTER_MASTER));
			valObjIn.put(GroupConfigurationPropertiesConstant.GROUP_CONFIGURATON, cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.BOOKING));

			final var	jsobj = sdWiseSeqCounterBll.addSDWiseLrSeqCounter(valObjIn, valObjOut);

			return JsonUtility.convertionToJsonObjectForResponse(jsobj);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private JSONObject addManualLrSeqCounter(final HttpServletRequest request, final JSONObject jsonObjectOut, final JSONObject jsonObjectIn) throws Exception {
		try {
			final var	sequenceCounterBll	= new SequenceCounterBLL();
			final var	cacheManip			= new CacheManip(request);

			final var	valObjIn			= JsonUtility.convertJsontoValueObject(jsonObjectIn);
			final var	valObjOut			= JsonUtility.convertJsontoValueObject(jsonObjectOut);
			final var	executive			= cacheManip.getExecutive(request);

			valObjIn.put(Executive.EXECUTIVE, executive);

			final var	jsobj = sequenceCounterBll.addManualLrSeqCounter(valObjIn, valObjOut);

			return JsonUtility.convertionToJsonObjectForResponse(jsobj);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}
}