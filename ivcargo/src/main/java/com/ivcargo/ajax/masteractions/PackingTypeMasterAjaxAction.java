/**
 *
 */
package com.ivcargo.ajax.masteractions;

import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONObject;

import com.businesslogic.PackingTypeMasterBll;
import com.businesslogic.master.PackingGroupTypeBLL;
import com.businesslogic.properties.impl.PropertyConfigValueBLLImpl;
import com.framework.Action;
import com.iv.constant.properties.master.PackingTypeMasterConfigurationConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.exception.ExceptionProcess;
import com.ivcargo.utils.CacheManip;
import com.ivcargo.utils.JsonUtility;
import com.platform.dao.PackingGroupMappingDao;
import com.platform.dao.PackingGroupTypeMasterDao;
import com.platform.dao.PackingTypeMasterDao;
import com.platform.dto.ECargoConstantFile;
import com.platform.dto.Executive;
import com.platform.dto.PackingGroupMapping;
import com.platform.dto.PackingGroupTypeMaster;
import com.platform.dto.PackingTypeMaster;
import com.platform.dto.PropertiesFileConstants;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Converter;
import com.platform.utils.Utility;

/**
 * @author Ashish Tiwari	11-06-2016
 *
 */
public class PackingTypeMasterAjaxAction implements Action {

	public static final String TRACE_ID = "PackingTypeMasterAjax";

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {

		PrintWriter						out								= null;
		JSONObject						jsonObjectIn					= null;
		JSONObject						jsonObjectOut					= null;
		Executive 						executive						= null;
		short							filter							= 0;

		try {

			response.setContentType("application/json"); // Setting response for JSON Content

			out							= response.getWriter();
			jsonObjectOut				= new JSONObject();
			jsonObjectIn				= new JSONObject(request.getParameter("json"));
			final var cache	= new CacheManip(request);
			executive		 			= cache.getExecutive(request);

			if(executive == null) {
				jsonObjectOut.put("errorDescription", "You have been logged out. Please login again.");
				out.println(jsonObjectOut);
				return;
			}

			filter						= Utility.getShort(jsonObjectIn.get("filter"));
			final var	configuration				= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.PACKING_TYPE_MASTER);

			switch (filter) {
			case 1: {
				out.println(initilizeSC(request, jsonObjectOut, configuration));
				break;
			}
			case 2: {
				out.println(getPackingTypeDetails(request, jsonObjectOut, jsonObjectIn, configuration));
				break;
			}
			case 3: {
				out.println(addPackingTypeMaster(request, jsonObjectOut, jsonObjectIn, configuration));
				break;
			}
			case 4: {
				out.println(deletePackingTypeMaster(request, jsonObjectOut, jsonObjectIn, configuration));
				break;
			}
			case 5: {
				out.println(addPkgTypeGrp(request, jsonObjectOut, jsonObjectIn, configuration));
				break;
			}
			case 6: {
				out.println(updatePackingTypeMaster(request, jsonObjectOut, jsonObjectIn,configuration));
				break;
			}

			default: {
				jsonObjectOut.put("errorDescription", "Unknown Request");
				out.println(jsonObjectOut);
				break;
			}
			}
		} catch (final Exception e1) {
			try {
				jsonObjectOut			= new JSONObject();
				jsonObjectOut.put("errorCode", CargoErrorList.SYSTEM_ERROR);
				jsonObjectOut.put("errorDescription", CargoErrorList.SYSTEM_ERROR_DESCRIPTION);
			} catch (final Exception e) {
				e.printStackTrace();
			}
			if(out != null)	out.println(jsonObjectOut);
		} finally {
			if(out != null) {
				out.flush();
				out.close();
			}
		}
	}

	private JSONObject initilizeSC(final HttpServletRequest request, final JSONObject jsonObjectOut, final Map<Object, Object> configuration) throws Exception {

		ValueObject					valObjOut						= null;
		PackingGroupTypeMaster[]	packingGroupTypeMasterArray		= null;

		try {

			valObjOut			    	  = JsonUtility.convertJsontoValueObject(jsonObjectOut);

			final var executive 		  = (Executive) request.getSession().getAttribute(ECargoConstantFile.EXECUTIVE);

			packingGroupTypeMasterArray   = PackingGroupTypeMasterDao.getInstance().findAllByAccountGroupId(executive.getAccountGroupId());

			if(packingGroupTypeMasterArray != null && packingGroupTypeMasterArray.length > 0)
				valObjOut.put("packingGroupTypeMasterArray", Converter.arrayDtotoArrayListWithHashMapConversion(packingGroupTypeMasterArray));

			valObjOut.put("configuration", configuration);
			valObjOut.put(Executive.EXECUTIVE, Converter.DtoToHashMap(executive));

			return JsonUtility.convertionToJsonObjectForResponse(valObjOut);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private JSONObject getPackingTypeDetails(final HttpServletRequest request, final JSONObject jsonObjectOut, final JSONObject jsonObjectIn, final Map<Object, Object> configuration) throws Exception {

		ValueObject					valObjOut						= null;
		PackingTypeMasterBll 		packingTypeBll					= null;
		PackingGroupTypeBLL  		packingGroupTypeBLL				= null;
		PackingGroupMapping  		packingGroupMapping  			= null;
		PackingTypeMaster 			packingTypeMaster				= null;
		var							packingTypeMasterId				= 0;
		try {

			packingTypeMasterId			  = Utility.getInt(jsonObjectIn.get("packingTypeId"));

			valObjOut			    	  = JsonUtility.convertJsontoValueObject(jsonObjectOut);

			final var executive 		  = (Executive) request.getSession().getAttribute(ECargoConstantFile.EXECUTIVE);

			packingTypeBll				  = new PackingTypeMasterBll();
			packingGroupTypeBLL			  = new PackingGroupTypeBLL();

			packingTypeMaster 			  = packingTypeBll.getPackingTypeById(packingTypeMasterId);

			if((boolean) configuration.getOrDefault(PackingTypeMasterConfigurationConstant.IS_PACKING_GROUP_TYPE, false))
				packingGroupMapping 	  = packingGroupTypeBLL.getPackingGroupTypeById(packingTypeMasterId, executive.getAccountGroupId());

			if(packingGroupMapping != null)
				valObjOut.put("packingGroupMapping", Converter.DtoToHashMap(packingGroupMapping));

			valObjOut.put("configuration", configuration);
			valObjOut.put(Executive.EXECUTIVE, Converter.DtoToHashMap(executive));
			valObjOut.put("packingTypeMaster", Converter.DtoToHashMap(packingTypeMaster));

			return JsonUtility.convertionToJsonObjectForResponse(valObjOut);

		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private JSONObject addPackingTypeMaster(final HttpServletRequest request, final JSONObject jsonObjectOut, final JSONObject jsonObjectIn, final Map<Object, Object> configuration) throws Exception {

		ValueObject						valObjOut						= null;
		ValueObject						valObjIn						= null;
		Executive 						executive						= null;
		CacheManip 						cache							= null;
		PackingGroupMapping  			packingGroupMapping 			= null;
		ArrayList<PackingGroupMapping> 	packingGroupMappingList 		= null;
		PackingGroupMapping[]			packingGroupMappingArray 		= null;
		String 							strResponse						= null;
		String 							pkgTypeName						= null;
		var 							newPackingTypeForGroupId		= 0L;
		var 							pkgTypeGrpId					= 0;

		try {

			valObjOut			    	  	= JsonUtility.convertJsontoValueObject(jsonObjectOut);
			valObjIn					  	= JsonUtility.convertJsontoValueObject(jsonObjectIn);

			pkgTypeName 				  	= (String) valObjIn.get("pkgTypeName");
			pkgTypeGrpId				  	= Utility.getInt(jsonObjectIn.get("packingGrpId"));

			cache 						  	= new CacheManip(request);
			executive 		  			  	= cache.getExecutive(request);
			final var	packingTypeBll				  	= new PackingTypeMasterBll();
			final var	dataBaseConfig					= PropertyConfigValueBLLImpl.getInstance().getConfiguration(executive, PropertiesFileConstants.DATABASE_CONFIG_PROPERTIES);

			valObjIn.put(Executive.EXECUTIVE, executive);
			valObjIn.put("name", pkgTypeName.toUpperCase());
			valObjIn.put("dataBaseConfig", dataBaseConfig);

			final var	isPackingTypeExist 			  = packingTypeBll.isPackingTypeExits(pkgTypeName.toUpperCase());

			if(isPackingTypeExist)
				valObjOut.put("duplicate", isPackingTypeExist);
			else {
				if((boolean) configuration.getOrDefault(PackingTypeMasterConfigurationConstant.IS_PACKING_GROUP_TYPE, false)) {
					final var	newPackingTypeId = packingTypeBll.insertPackingType(valObjIn);

					if(newPackingTypeId > 0)
						newPackingTypeForGroupId = PackingTypeMasterDao.getInstance().insertForGroup(newPackingTypeId, executive.getAccountGroupId());

					if(newPackingTypeForGroupId > 0) {
						packingGroupMappingList = new ArrayList<>();

						packingGroupMapping		= createDtoToSetPackingGroup(newPackingTypeId, pkgTypeGrpId, executive);

						packingGroupMappingList.add(packingGroupMapping);

						packingGroupMappingArray = new PackingGroupMapping[packingGroupMappingList.size()];
						packingGroupMappingList.toArray(packingGroupMappingArray);

						strResponse = PackingGroupMappingDao.getInstance().update(packingGroupMappingArray);
					}

					if(CargoErrorList.MASTER_DATA_UPDATE_SUCCESS_DESCRIPTION.equals(strResponse)) {
						cache.refreshCacheForPackingTypeForGroup(request, executive.getAccountGroupId());
						valObjOut.put("addSuccessGrp", "true");
					}
				} else {
					packingTypeBll.insertPackingType(valObjIn);
					valObjOut.put("addSuccess", "true");
				}

				cache.refreshCacheForPackingTypeMaster(request);
			}

			return JsonUtility.convertionToJsonObjectForResponse(valObjOut);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private JSONObject deletePackingTypeMaster(final HttpServletRequest request, final JSONObject jsonObjectOut, final JSONObject jsonObjectIn, final Map<Object, Object> configuration) throws Exception {

		ValueObject					valObjOut						= null;
		PackingTypeMaster			packingTypeMaster				= null;
		CacheManip 					cache							= null;
		String 						strRspn							= null;
		String  					delGrpMap						= null;
		var							packingTypeMasterId				= 0;
		try {

			packingTypeMasterId			  = Utility.getInt(jsonObjectIn.get("packingTypeId"));

			valObjOut			    	  = JsonUtility.convertJsontoValueObject(jsonObjectOut);

			cache 						  = new CacheManip(request);
			final var executive 		  = cache.getExecutive(request);

			packingTypeMaster			  = new PackingTypeMaster();

			packingTypeMaster.setPackingTypeMasterId(packingTypeMasterId);
			packingTypeMaster.setMarkForDelete(true);

			if((boolean) configuration.getOrDefault(PackingTypeMasterConfigurationConstant.IS_PACKING_GROUP_TYPE, false)) {
				strRspn = PackingTypeMasterDao.getInstance().deleteForGroup(packingTypeMaster, executive.getAccountGroupId());

				if(CargoErrorList.MASTER_DATA_DELETE_SUCCESS_DESCRIPTION.equals(strRspn))
					delGrpMap	= PackingGroupMappingDao.getInstance().deleteForGroup(packingTypeMaster, executive.getAccountGroupId());

				if(CargoErrorList.MASTER_DATA_DELETE_SUCCESS_DESCRIPTION.equals(delGrpMap)) {
					// update cache
					valObjOut.put("delSuccess", "true");
					cache.refreshCacheForPackingTypeForGroup(request, executive.getAccountGroupId());
				}
			} else {
				strRspn = PackingTypeMasterDao.getInstance().deleteForGroup(packingTypeMaster, executive.getAccountGroupId());

				if(CargoErrorList.MASTER_DATA_DELETE_SUCCESS_DESCRIPTION.equals(strRspn)) {
					// update cache
					valObjOut.put("success", "true");
					cache.refreshCacheForPackingTypeForGroup(request, executive.getAccountGroupId());
				}
			}

			cache.refreshCacheForPackingTypeMaster(request);

			return JsonUtility.convertionToJsonObjectForResponse(valObjOut);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private JSONObject addPkgTypeGrp(final HttpServletRequest request, final JSONObject jsonObjectOut, final JSONObject jsonObjectIn, final Map<Object, Object> configuration) throws Exception {

		ValueObject						valObjOut						= null;
		CacheManip 						cache							= null;
		PackingGroupMapping  			packingGroupMapping 			= null;
		ArrayList<PackingGroupMapping> 	packingGroupMappingList 		= null;
		PackingGroupMapping[]			packingGroupMappingArray 		= null;
		String							strResponse						= null;
		var 							newPackingTypeForGroupId		= 0L;
		var								packingTypeMasterId				= 0;
		var								pkgTypeGrpId					= 0;

		try {

			packingTypeMasterId			  = Utility.getInt(jsonObjectIn.get("packingTypeId"));
			pkgTypeGrpId				  = Utility.getInt(jsonObjectIn.get("packingGrpId"));

			valObjOut			    	  = JsonUtility.convertJsontoValueObject(jsonObjectOut);

			cache 						  = new CacheManip(request);
			final var executive 		  = cache.getExecutive(request);

			if((boolean) configuration.getOrDefault(PackingTypeMasterConfigurationConstant.IS_PACKING_GROUP_TYPE, false)) {

				newPackingTypeForGroupId = PackingTypeMasterDao.getInstance().insertForGroup(packingTypeMasterId, executive.getAccountGroupId());

				if(newPackingTypeForGroupId > 0) {
					packingGroupMappingList = new ArrayList<>();
					packingGroupMapping		= createDtoToSetPackingGroup(packingTypeMasterId, pkgTypeGrpId, executive);

					packingGroupMappingList.add(packingGroupMapping);

					packingGroupMappingArray = new PackingGroupMapping[packingGroupMappingList.size()];
					packingGroupMappingList.toArray(packingGroupMappingArray);

					strResponse = PackingGroupMappingDao.getInstance().update(packingGroupMappingArray);
				}

				if(CargoErrorList.MASTER_DATA_UPDATE_SUCCESS_DESCRIPTION.equals(strResponse)) {
					valObjOut.put("addSuccessGrp", "true");
					cache.refreshCacheForPackingTypeForGroup(request, executive.getAccountGroupId());
				}
			} else {
				newPackingTypeForGroupId = PackingTypeMasterDao.getInstance().insertForGroup(packingTypeMasterId, executive.getAccountGroupId());

				strResponse =  newPackingTypeForGroupId > 0 ? CargoErrorList.MASTER_DATA_INSERT_SUCCESS_DESCRIPTION :
					CargoErrorList.MASTER_DATA_OPERATION_FAILURE_DESCRIPTION;

				if(CargoErrorList.MASTER_DATA_INSERT_SUCCESS_DESCRIPTION.equals(strResponse)){
					// update cache
					valObjOut.put("success", "true");
					cache.refreshCacheForPackingTypeForGroup(request, executive.getAccountGroupId());
				}
			}

			cache.refreshCacheForPackingTypeMaster(request);

			return JsonUtility.convertionToJsonObjectForResponse(valObjOut);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private JSONObject updatePackingTypeMaster(final HttpServletRequest request, final JSONObject jsonObjectOut, final JSONObject jsonObjectIn, final Map<Object, Object> configuration) throws Exception {

		ValueObject						valObjOut						= null;
		ValueObject						valObjIn						= null;
		CacheManip 						cache							= null;
		String 							pkgTypeName						= null;
		String							strResponse						= null;
		var								packingTypeMasterId				= 0;
		var								pkgTypeGrpId					= 0;
		ValueObject						dataBaseConfig					= null;

		try {
			valObjOut			    	  = JsonUtility.convertJsontoValueObject(jsonObjectOut);
			valObjIn					  = JsonUtility.convertJsontoValueObject(jsonObjectIn);

			packingTypeMasterId			  = Utility.getInt(jsonObjectIn.get("packingTypeId"));
			pkgTypeName 				  = (String) valObjIn.get("packingTypeName");
			pkgTypeGrpId				  = Utility.getInt(jsonObjectIn.get("packingGrpId"));

			cache 						  = new CacheManip(request);

			final var executive 		  = cache.getExecutive(request);
			dataBaseConfig				= PropertyConfigValueBLLImpl.getInstance().getConfiguration(executive, PropertiesFileConstants.DATABASE_CONFIG_PROPERTIES);

			if((boolean) configuration.getOrDefault(PackingTypeMasterConfigurationConstant.IS_PACKING_GROUP_TYPE, false)){
				final List<PackingGroupMapping>	packingGroupMappingList = new ArrayList<>();

				packingGroupMappingList.add(createDtoToSetPackingGroup(packingTypeMasterId, pkgTypeGrpId, executive));

				final var	packingGroupMappingArray = new PackingGroupMapping[packingGroupMappingList.size()];
				packingGroupMappingList.toArray(packingGroupMappingArray);

				PackingGroupMappingDao.getInstance().update(packingGroupMappingArray);
			}

			final var	packingTypeBll		  = new PackingTypeMasterBll();

			valObjIn.put(Executive.EXECUTIVE, executive);
			valObjIn.put("name", pkgTypeName.toUpperCase());
			valObjIn.put("packingTypeId", packingTypeMasterId);
			valObjIn.put("dataBaseConfig", dataBaseConfig);

			strResponse = packingTypeBll.updatePackingType(valObjIn);

			if(CargoErrorList.MASTER_DATA_UPDATE_SUCCESS_DESCRIPTION.equals(strResponse))
				valObjOut.put("success", "true");

			cache.refreshCacheForPackingTypeForGroup(request, executive.getAccountGroupId());
			cache.refreshCacheForPackingTypeMaster(request);

			return JsonUtility.convertionToJsonObjectForResponse(valObjOut);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private PackingGroupMapping createDtoToSetPackingGroup(final long newPackingTypeId, final long pkgTypeGrpId, final Executive executive) throws Exception {
		try {
			final var	packingGroupMapping 	= new PackingGroupMapping();

			packingGroupMapping.setPackingTypeMasterId(newPackingTypeId);
			packingGroupMapping.setPackingGroupTypeId(pkgTypeGrpId);
			packingGroupMapping.setAccountGroupId(executive.getAccountGroupId());
			packingGroupMapping.setCreatedBy(executive.getExecutiveId());
			packingGroupMapping.setModifiedBy(executive.getExecutiveId());
			packingGroupMapping.setMFD(false);

			return packingGroupMapping;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}
}
