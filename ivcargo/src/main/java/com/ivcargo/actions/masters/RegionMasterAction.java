package com.ivcargo.actions.masters;

import java.util.HashMap;
import java.util.Objects;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringUtils;

import com.businesslogic.RegionBll;
import com.businesslogic.properties.impl.PropertyConfigValueBLLImpl;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.constant.properties.master.RegionMasterConfigurationConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.logsapp.LogWriter;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.Executive;
import com.platform.dto.PropertiesFileConstants;
import com.platform.dto.SubRegion;
import com.platform.resource.CargoErrorList;

public class RegionMasterAction implements Action{
	public static final String TRACE_ID = "RegionMasterAction";

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {

		HashMap<String,Object>	error		= null;
		String					strResponse	= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	cache		= new CacheManip(request);
			final var	executive	= cache.getExecutive(request);
			final var 	configuration = cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.REGION_MASTER);
			final var	showGSTNumber = (boolean)configuration.getOrDefault(RegionMasterConfigurationConstant.SHOW_GST_NUMBER, false);

			final var	filter = JSPUtility.GetInt(request, "filter", 0);

			switch (filter) {

			case 1:	//Add Region
				strResponse		= saveRegion(request, executive);
				break;

			case 2:	//Update Region
				strResponse		= updateRegion(request, executive);
				break;

			case 3:	//Delete Region
				strResponse		= deleteRegion(request, executive);
				break;

			default:
				break;
			}

			request.setAttribute(RegionMasterConfigurationConstant.SHOW_GST_NUMBER,showGSTNumber);
			request.setAttribute("nextPageToken", "success");

			if(filter != 0) {
				response.sendRedirect("RegionMaster.do?pageId=212&eventId=1&message="+strResponse);
				request.setAttribute("message",strResponse);
			}

		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}
	}

	/**
	 *
	 * @param request
	 * @param executive
	 * @return
	 * @throws Exception
	 */
	private String saveRegion(final HttpServletRequest request, final Executive executive) throws Exception {

		CacheManip					cache							= null;
		ValueObject					valueObjectIn					= null;
		RegionBll					regionBll						= null;
		var						newRegionId						= 0L;
		String						strResponse						= null;
		ValueObject					dataBaseConfig					= null;
		PropertyConfigValueBLLImpl	propertyConfigValueBLLImpl		= null;

		try {
			cache						= new CacheManip(request);
			regionBll					= new RegionBll();
			valueObjectIn				= new ValueObject();
			propertyConfigValueBLLImpl	= new PropertyConfigValueBLLImpl();
			dataBaseConfig				= propertyConfigValueBLLImpl.getConfiguration(executive, PropertiesFileConstants.DATABASE_CONFIG_PROPERTIES);

			valueObjectIn.put("executive", executive);
			valueObjectIn.put("name", JSPUtility.GetString(request, "name").toUpperCase());
			valueObjectIn.put("description", JSPUtility.GetString(request, "description"));
			valueObjectIn.put("accountGroupId", executive.getAccountGroupId());
			valueObjectIn.put("regionCode", JSPUtility.GetString(request, "regionCode").toUpperCase());
			valueObjectIn.put("gstNumber", JSPUtility.GetString(request, "gstNumber"));
			valueObjectIn.put("dataBaseConfig", dataBaseConfig);

			newRegionId = regionBll.insertRegion(valueObjectIn);

			if(newRegionId > 0) {
				// Update cache
				cache.refreshCacheForRegion(request, executive.getAccountGroupId());
				strResponse = CargoErrorList.MASTER_DATA_INSERT_SUCCESS_DESCRIPTION;
			} else
				strResponse = "Region Insert "+CargoErrorList.MASTER_DATA_OPERATION_FAILURE_DESCRIPTION;

			return strResponse;
		} catch (final Exception e) {
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_DEBUG, e);
			throw e;
		}
	}

	/**
	 *
	 * @param request
	 * @param executive
	 * @return
	 * @throws Exception
	 */
	private String updateRegion(final HttpServletRequest request, final Executive executive) throws Exception {

		CacheManip					cache							= null;
		ValueObject					valueObjectIn					= null;
		RegionBll					regionBll						= null;
		String						strResponse						= null;
		ValueObject					dataBaseConfig					= null;
		PropertyConfigValueBLLImpl	propertyConfigValueBLLImpl		= null;

		try {

			cache						= new CacheManip(request);
			regionBll					= new RegionBll();
			valueObjectIn				= new ValueObject();
			propertyConfigValueBLLImpl	= new PropertyConfigValueBLLImpl();
			dataBaseConfig				= propertyConfigValueBLLImpl.getConfiguration(executive, PropertiesFileConstants.DATABASE_CONFIG_PROPERTIES);

			valueObjectIn.put("executive", executive);
			valueObjectIn.put("selectedRegionId", JSPUtility.GetLong(request, "selectedRegionId"));
			valueObjectIn.put("name", JSPUtility.GetString(request, "name").toUpperCase());
			valueObjectIn.put("description", JSPUtility.GetString(request, "description"));
			valueObjectIn.put("regionCode", StringUtils.upperCase(JSPUtility.GetString(request, "regionCode", null)));
			valueObjectIn.put("gstNumber", StringUtils.upperCase(JSPUtility.GetString(request, "gstNumber", null)));
			valueObjectIn.put("dataBaseConfig", dataBaseConfig);

			strResponse = regionBll.updateRegion(valueObjectIn);

			if(Objects.equals(strResponse, CargoErrorList.MASTER_DATA_UPDATE_SUCCESS_DESCRIPTION))
				cache.refreshCacheForRegion(request, executive.getAccountGroupId());

			return strResponse;
		} catch (final Exception e) {
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_DEBUG, e);
			throw e;
		}
	}

	/**
	 *
	 * @param request
	 * @param executive
	 * @return
	 * @throws Exception
	 */
	private String deleteRegion(final HttpServletRequest request, final Executive executive) throws Exception {
		CacheManip					cache							= null;
		ValueObject					valueObjectIn					= null;
		RegionBll					regionBll						= null;
		String						strResponse						= null;
		ValueObject					dataBaseConfig					= null;
		PropertyConfigValueBLLImpl	propertyConfigValueBLLImpl		= null;
		SubRegion[]					subRegionArr					= null;
		var 						selectedRegionId				= 0L;
		var 						count							= 0L;

		try {
			cache						= new CacheManip(request);
			regionBll					= new RegionBll();
			valueObjectIn				= new ValueObject();
			propertyConfigValueBLLImpl	= new PropertyConfigValueBLLImpl();
			dataBaseConfig				= propertyConfigValueBLLImpl.getConfiguration(executive, PropertiesFileConstants.DATABASE_CONFIG_PROPERTIES);

			valueObjectIn.put("executive", executive);
			valueObjectIn.put("selectedRegionId", JSPUtility.GetLong(request, "selectedRegionId"));
			valueObjectIn.put("dataBaseConfig", dataBaseConfig);
			selectedRegionId = valueObjectIn.getLong("selectedRegionId",0);

			subRegionArr = cache.getSubRegionsByRegionId(request, selectedRegionId, executive.getAccountGroupId());

			if(subRegionArr != null && subRegionArr.length > 0) {
				for (final SubRegion element : subRegionArr)
					if(element.isMarkForDelete())
						count++;

				if(subRegionArr.length == count)
					strResponse	= regionBll.deleteRegion(valueObjectIn);
				else
					strResponse	= "Please Delete Subregions Of This Region First !";
			} else
				strResponse	= regionBll.deleteRegion(valueObjectIn);

			if(Objects.equals(strResponse, CargoErrorList.MASTER_DATA_DELETE_SUCCESS_DESCRIPTION))
				cache.refreshCacheForRegion(request, executive.getAccountGroupId());

			return strResponse;
		} catch (final Exception e) {
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_DEBUG, e);
			throw e;
		}
	}
}
