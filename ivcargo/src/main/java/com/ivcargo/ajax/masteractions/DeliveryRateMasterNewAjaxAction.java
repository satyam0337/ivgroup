package com.ivcargo.ajax.masteractions;

import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONException;
import org.json.JSONObject;

import com.businesslogic.ChargeMasterForGroupBLL;
import com.businesslogic.DeliveryChargeConfigurationBLL;
import com.businesslogic.DeliveryRateBLL;
import com.framework.Action;
import com.iv.constant.properties.master.DeliveryRatePropertiesConstant;
import com.iv.dto.constant.ExecutiveTypeConstant;
import com.iv.dto.constant.FeildPermissionsConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.utils.constant.Constant;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.exception.ExceptionProcess;
import com.iv.utils.utility.CollectionUtility;
import com.ivcargo.utils.CacheManip;
import com.ivcargo.utils.JsonUtility;
import com.platform.dto.ChargeTypeMaster;
import com.platform.dto.DeliveryRateMaster;
import com.platform.dto.Executive;
import com.platform.dto.constant.ChargeTypeConstant;
import com.platform.dto.constant.RateMasterConstant;
import com.platform.jsonconstant.JsonConstant;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Converter;
import com.platform.utils.Utility;

public class DeliveryRateMasterNewAjaxAction implements Action {

	private static final String TRACE_ID = "DeliveryRateMasterNewAjaxAction";

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {

		PrintWriter						out							= null;
		JSONObject						jsonObjectIn				= null;
		JSONObject						jsonObjectOut				= null;
		short							filter						= 0;
		CacheManip						cacheManip					= null;
		Executive						executive					= null;

		try {

			response.setContentType("application/json"); // Setting response for JSON Content

			out						= response.getWriter();
			jsonObjectOut			= new JSONObject();
			jsonObjectIn			= new JSONObject(request.getParameter("json"));
			filter					= Utility.getShort(jsonObjectIn.get("filter"));

			cacheManip				= new CacheManip(request);
			executive				= cacheManip.getExecutive(request);

			if(executive == null) {
				jsonObjectOut.put("errorDescription", "You have been logged out. Please login again.");
				out.println(jsonObjectOut);
				return;
			}
			jsonObjectIn.put("executiveId", executive.getExecutiveId());

			switch (filter) {
			case 1 -> out.println(initilize(request, executive, jsonObjectOut));
			case 2 -> out.println(addCRSectionCharge(executive, jsonObjectIn));
			case 3 -> out.println(updateApplicableChargeFlag(executive, jsonObjectIn));
			case 4 -> out.println(updateChargeEditAmount(executive, jsonObjectIn));
			case 5 -> out.println(addChargeTypeWiseCharges(executive, jsonObjectIn));
			case 8 -> out.println(getChargeWiseRate(request, executive, jsonObjectIn));
			case 9 -> out.println(updateRateMasterRate(jsonObjectIn));
			case 10 -> out.println(deleteRateMasterRate(jsonObjectIn, executive));
			case 12 -> out.println(addPercentwiseCharge(executive, jsonObjectIn));
			case 13 -> out.println(addDemurrageCharge(executive, jsonObjectIn));
			case 14 -> out.println(insertUpdateChargeMasterForGroup(request, executive, jsonObjectIn));
			case 15 -> out.println(addOctroiSectionCharge(executive, jsonObjectIn));
			case 16 -> out.println(getDemurrageRate(request, executive, jsonObjectIn));
			case 17 -> out.println(addDDMLorryHireRate(executive, jsonObjectIn));
			case 18 -> out.println(getDDMLorryHireRate(request, executive, jsonObjectIn));
			default -> {
				jsonObjectOut.put("errorDescription", CargoErrorList.REQUEST_FILTER_UNDEFINED_DESCRIPTION);
				out.println(jsonObjectOut);
			}
			}

		} catch (final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
			jsonObjectOut			= new JSONObject();
			try {
				jsonObjectOut.put("errorDescription", CargoErrorList.SYSTEM_ERROR_DESCRIPTION);
			} catch (final JSONException e1) {
				ExceptionProcess.execute(e1, TRACE_ID);
			}
			if(out != null) out.println(jsonObjectOut);
		} finally {
			if(out != null) {
				out.flush();
				out.close();
			}
		}
	}

	// setting data for initialization
	private JSONObject initilize(final HttpServletRequest request, final Executive executive, final JSONObject jsonObjectOut) throws Exception {
		try {
			final var	cache				= new CacheManip(request);

			final var	valObjOut			= JsonUtility.convertJsontoValueObject(jsonObjectOut);

			final var	configuration	 	= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.DELIVERY_RATE_MASTER);
			final HashMap<?, ?>	execFldPermissions	= cache.getExecutiveFieldPermission(request);

			final var	crLevelCharges  = CollectionUtility.getLongListFromString((String) configuration.get(DeliveryRatePropertiesConstant.CR_LEVEL_SECTION_CHARGES_LIST));

			final var	packingType	= cache.getAllPackingType(request, executive.getAccountGroupId());

			if (packingType != null)
				valObjOut.put("packingType", Converter.arrayDtotoArrayListWithHashMapConversion(packingType));

			final var charges 			= cache.getActiveDeliveryCharges(request, executive.getBranchId());
			final var bookingCharges	= cache.getActiveBookingCharges(request, executive.getBranchId());

			valObjOut.put("charges", Converter.arrayDtotoArrayListWithHashMapConversion(charges));
			valObjOut.put("bookingCharges", Converter.arrayDtotoArrayListWithHashMapConversion(bookingCharges));

			final var	customChargeMasterList = new ArrayList<ChargeTypeMaster>();
			customChargeMasterList.add(cache.getChargeTypeMasterById(request, ChargeTypeMaster.OCTROI_SERVICE));
			customChargeMasterList.add(cache.getChargeTypeMasterById(request, ChargeTypeMaster.OCTROI_FORM));
			customChargeMasterList.add(cache.getChargeTypeMasterById(request, ChargeTypeMaster.DAMERAGE));

			final var	customChargeMasterArray = new ChargeTypeMaster[customChargeMasterList.size()];
			customChargeMasterList.toArray(customChargeMasterArray);

			valObjOut.put("customCharges", Converter.arrayDtotoArrayListWithHashMapConversion(customChargeMasterArray));

			final var	vehicleType = cache.getVehicleTypeForGroup(request, executive.getAccountGroupId());

			if (vehicleType  != null && vehicleType.length > 0)
				valObjOut.put("vehicleType", Converter.arrayDtotoArrayListWithHashMapConversion(vehicleType));

			if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN){
				final var regionForGroup = cache.getRegionsByGroupId(request, executive.getAccountGroupId());
				valObjOut.put("destRegionAreas", Converter.arrayDtotoArrayListWithHashMapConversion(regionForGroup));
			} else if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_REGIONADMIN) {
				final var subRegionForGroup = cache.getSubRegionsByRegionId(request, executive.getRegionId(), executive.getAccountGroupId());
				valObjOut.put("destSubRegionAreas", Converter.arrayDtotoArrayListWithHashMapConversion(subRegionForGroup));
			} else if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_SUBREGIONADMIN) {
				final var execBranch = cache.getBranchById(request, executive.getAccountGroupId(), executive.getBranchId());
				final var subRegionBranches = cache.getPhysicalBranchesBySubRegionId(request,execBranch.getAccountGroupId(), execBranch.getSubRegionId());
				valObjOut.put("destBranches", new JSONObject(subRegionBranches));
			}

			valObjOut.put("executive", Converter.DtoToHashMap(executive));
			valObjOut.put("configuration", configuration);
			valObjOut.put("execFldPermissions", Converter.hashMapWithDtoToHashMapConversion(execFldPermissions));
			valObjOut.put("showDDMLorryHireMaster", execFldPermissions.get(FeildPermissionsConstant.SHOW_DDM_LORRY_HIRE_MASTER) != null);
			valObjOut.put("crLevelCharges", crLevelCharges);

			setOutputConstant(valObjOut);

			return JsonUtility.convertionToJsonObjectForResponse(valObjOut);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	// set java constant to use in javascript
	private void setOutputConstant(final ValueObject valueObjectOut) throws Exception {
		try {

			valueObjectOut.put("ChargeTypeMaster", JsonConstant.getChargeTypeMaster());
			valueObjectOut.put("RateMaster", RateMasterConstant.getRateMasterConstant());
			valueObjectOut.put("ChargeTypeConstant", ChargeTypeConstant.getChargeTypeConstant());
			valueObjectOut.put("TransportCommonMaster", JsonConstant.getTransportCommonMaster());
			valueObjectOut.put("Branch", JsonConstant.getBranch());
			valueObjectOut.put("CorporateAccount", JsonConstant.getCorporateAccount());
			valueObjectOut.put("PartyMaster", JsonConstant.getPartyMaster());
			valueObjectOut.put("DeliveryChargeConfiguration", JsonConstant.getDeliveryChargeConfiguration());
			valueObjectOut.put("CustomerDetails", JsonConstant.getCustomerDetails());
			valueObjectOut.put("ExecutiveCon", JsonConstant.getExecutive());
			valueObjectOut.put("DeliveryRateMaster", JsonConstant.getDeliveryRateMaster());

		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	// add LR section charges
	private JSONObject addCRSectionCharge(final Executive executive, final JSONObject jsonObjectIn) throws Exception {
		try {
			final var	deliveryconfigurationBLL	= new DeliveryChargeConfigurationBLL();

			final var	valObjIn			= JsonUtility.convertJsontoValueObject(jsonObjectIn);
			valObjIn.put("executive", executive);

			if (!valObjIn.containsKey("crcharges")) {
				final var object = new JSONObject();
				object.put("errorDescription", CargoErrorList.LR_SECTION_CHARGES_NOT_FOUND_DESCRIPTION);
				return object;
			}

			final var	crcharges			= JsonUtility.convertJsontoValueObject(new JSONObject(jsonObjectIn.get("crcharges").toString()));
			valObjIn.put("crcharges", crcharges);
			final var	valObjOut	= deliveryconfigurationBLL.saveCRSectionCharge(valObjIn);

			final var object = JsonUtility.convertionToJsonObjectForResponse(valObjOut);
			object.put("Success", true);
			return object;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private JSONObject addPercentwiseCharge(final Executive executive, final JSONObject jsonObjectIn) throws Exception {
		try {
			final var	configurationBLL	= new DeliveryChargeConfigurationBLL();

			final var	valObjIn			= JsonUtility.convertJsontoValueObject(jsonObjectIn);
			valObjIn.put("executive", executive);

			final var	valObjOut	= configurationBLL.savePercentWiseCRSectionCharge(valObjIn);

			final var object = JsonUtility.convertionToJsonObjectForResponse(valObjOut);
			object.put("Success", true);

			return object;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	// add or update charge applicable flag
	private JSONObject updateApplicableChargeFlag(final Executive executive, final JSONObject jsonObjectIn) throws Exception {
		try {
			final var	configurationBLL	= new DeliveryChargeConfigurationBLL();
			final var	valObjIn			= JsonUtility.convertJsontoValueObject(jsonObjectIn);

			valObjIn.put("executive", executive);
			final var	valObjOut	= configurationBLL.updateChargeApplicable(valObjIn);

			final var object = JsonUtility.convertionToJsonObjectForResponse(valObjOut);
			object.put("Success", true);
			return object;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	// add or update charge applicable flag
	private JSONObject insertUpdateChargeMasterForGroup(final HttpServletRequest request, final Executive executive, final JSONObject jsonObjectIn) throws Exception {
		try {
			final var	chargeMasterForGroupBLL	= new ChargeMasterForGroupBLL();
			final var	valObjIn				= JsonUtility.convertJsontoValueObject(jsonObjectIn);
			final var	cache					= new CacheManip(request);

			valObjIn.put("executive", executive);
			final var	valObjOut	= chargeMasterForGroupBLL.insertUpdateChargeMasterForGroup(valObjIn);

			if(valObjOut != null && valObjOut.getBoolean("Success",true)) {
				cache.refreshCacheForDeliveryChargesOld(request, executive.getAccountGroupId());
				cache.refreshCacheForDeliveryCharges(request, executive.getAccountGroupId());
			}

			final var object = JsonUtility.convertionToJsonObjectForResponse(valObjOut);
			object.put("Success", true);
			return object;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	// add or update editable permission and charge edit amount
	private JSONObject updateChargeEditAmount(final Executive executive, final JSONObject jsonObjectIn) throws Exception {
		try {
			final var	configurationBLL	= new DeliveryChargeConfigurationBLL();
			final var	valObjIn			= JsonUtility.convertJsontoValueObject(jsonObjectIn);

			valObjIn.put("executive", executive);

			final var object = JsonUtility.convertionToJsonObjectForResponse(configurationBLL.updateChargeEditAmount(valObjIn));
			object.put("Success", true);

			return object;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	// add or update route wise charges in rate master
	private JSONObject addChargeTypeWiseCharges(final Executive executive, final JSONObject jsonObjectIn) throws Exception {
		try {
			final var	rateMasterBLL		= new DeliveryRateBLL();

			final var	valObjIn			= JsonUtility.convertJsontoValueObject(jsonObjectIn);
			valObjIn.put("executive", executive);

			return JsonUtility.convertionToJsonObjectForResponse(rateMasterBLL.insertRates(valObjIn));
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	// get Route charges
	private JSONObject getChargeWiseRate(final HttpServletRequest request, final Executive executive, final JSONObject jsonObjectIn) throws Exception {
		JSONObject						object						= null;

		try {
			final var	cache				= new CacheManip(request);
			final var	rateMasterBLL		= new DeliveryRateBLL();

			final var	valObjIn			= JsonUtility.convertJsontoValueObject(jsonObjectIn);
			final var	packingTypeMaster	= cache.getPackingTypeMasterData(request);

			valObjIn.put("executive", executive);
			valObjIn.put("branchcache", cache.getGenericBranchesDetail(request));
			valObjIn.put("packingTypeMaster", packingTypeMaster);
			valObjIn.put("charges", cache.getActiveDeliveryCharges(request, executive.getBranchId()));

			final var	valObjOut	= rateMasterBLL.getChargeWiseRate(valObjIn);

			if(valObjOut == null) {
				object	= new JSONObject();
				object.put("empty", true);
				return object;
			}

			object = JsonUtility.convertionToJsonObjectForResponse(valObjOut);
			object.put("Success", true);

			return object;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private JSONObject getDemurrageRate(final HttpServletRequest request, final Executive executive, final JSONObject jsonObjectIn) throws Exception {
		JSONObject						object						= null;

		try {
			final var	cache				= new CacheManip(request);
			final var	rateMasterBLL		= new DeliveryRateBLL();

			final var	valObjIn			= JsonUtility.convertJsontoValueObject(jsonObjectIn);
			final var	packingTypeMaster	= cache.getPackingTypeMasterData(request);

			valObjIn.put("executive", executive);
			valObjIn.put("branchcache", cache.getGenericBranchesDetail(request));
			valObjIn.put("packingTypeMaster", packingTypeMaster);
			valObjIn.put("charges", cache.getActiveDeliveryCharges(request, executive.getBranchId()));

			final var	valObjOut	= rateMasterBLL.getDemurrageRate(valObjIn);

			if(valObjOut == null) {
				object	= new JSONObject();
				object.put("empty", true);
				return object;
			}

			object = JsonUtility.convertionToJsonObjectForResponse(valObjOut);
			object.put("Success", true);

			return object;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	// update rate in ratemaster table
	private JSONObject updateRateMasterRate(final JSONObject jsonObjectIn) throws Exception {
		try {
			final var	rateMasterBLL		= new DeliveryRateBLL();

			final var	valObjIn			= JsonUtility.convertJsontoValueObject(jsonObjectIn);

			final var	object = JsonUtility.convertionToJsonObjectForResponse(rateMasterBLL.updateDeliveryRateMasterRate(valObjIn));

			object.put("Success", true);

			return object;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	// delete rate in ratemaster table
	private JSONObject deleteRateMasterRate(final JSONObject jsonObjectIn, Executive executive) throws Exception {
		try {
			final var	rateMasterBLL		= new DeliveryRateBLL();

			final var	valObjIn			= JsonUtility.convertJsontoValueObject(jsonObjectIn);

			valObjIn.put(Constant.EXECUTIVE_ID, executive.getExecutiveId());

			final var	object = JsonUtility.convertionToJsonObjectForResponse(rateMasterBLL.deleteDeliveryRateMasterRate(valObjIn));
			object.put("Success", true);

			return object;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	// add demurrage rate
	private JSONObject addDemurrageCharge(final Executive executive, final JSONObject jsonObjectIn) throws Exception {
		try {
			final var	rateMasterBLL		= new DeliveryRateBLL();
			final var	valObjIn			= JsonUtility.convertJsontoValueObject(jsonObjectIn);

			valObjIn.put("executive", executive);

			return JsonUtility.convertionToJsonObjectForResponse(rateMasterBLL.insertRates(valObjIn));
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	// add Octroi section charges
	private JSONObject addOctroiSectionCharge(final Executive executive, final JSONObject jsonObjectIn) throws Exception {
		try {
			final var	rateMasterBLL		= new DeliveryRateBLL();

			final var	valObjIn			= JsonUtility.convertJsontoValueObject(jsonObjectIn);
			final var	values				= jsonObjectIn.getJSONArray("octroiChargeWiseDataValueObject");

			final var octroiChargeWiseObj = new ValueObject();

			for (var i = 0; i < values.length(); i++)
				octroiChargeWiseObj.put(i, JsonUtility.convertJsontoValueObject(values.getJSONObject(i)));

			valObjIn.put("executive", executive);
			valObjIn.put("octroiChargeWiseObj", octroiChargeWiseObj);

			if (!valObjIn.containsKey("octroiChargeWiseObj")) {
				final var object = new JSONObject();
				object.put("errorDescription", CargoErrorList.LR_SECTION_CHARGES_NOT_FOUND_DESCRIPTION);
				return object;
			}

			final var object = JsonUtility.convertionToJsonObjectForResponse(rateMasterBLL.insertRates(valObjIn));
			object.put("Success", true);

			return object;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private JSONObject addDDMLorryHireRate(final Executive executive, final JSONObject jsonObjectIn) throws Exception {
		try {
			final var	rateMasterBLL		= new DeliveryRateBLL();

			final var	valObjIn			= JsonUtility.convertJsontoValueObject(jsonObjectIn);
			valObjIn.put("executive", executive);
			valObjIn.put("rateType", DeliveryRateMaster.DDM_RATE_TYPE_ID);

			return JsonUtility.convertionToJsonObjectForResponse(rateMasterBLL.insertRates(valObjIn));
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private JSONObject getDDMLorryHireRate(final HttpServletRequest request, final Executive executive, final JSONObject jsonObjectIn) throws Exception {
		JSONObject						object						= null;

		try {
			final var	cache				= new CacheManip(request);
			final var	rateMasterBLL		= new DeliveryRateBLL();

			final var	valObjIn			= JsonUtility.convertJsontoValueObject(jsonObjectIn);
			final var	packingTypeMaster	= cache.getPackingTypeMasterData(request);

			valObjIn.put("executive", executive);
			valObjIn.put("branchcache", cache.getGenericBranchesDetail(request));
			valObjIn.put("packingTypeMaster", packingTypeMaster);
			valObjIn.put("charges", cache.getActiveDeliveryCharges(request, executive.getBranchId()));
			valObjIn.put("rateType", DeliveryRateMaster.DDM_RATE_TYPE_ID);

			final var	valObjOut	= rateMasterBLL.getDDMLorryHireRate(valObjIn);

			if(valObjOut == null) {
				object	= new JSONObject();
				object.put("empty", true);
				return object;
			}

			object = JsonUtility.convertionToJsonObjectForResponse(valObjOut);
			object.put("Success", true);

			return object;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}
}
