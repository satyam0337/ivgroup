package com.ivcargo.actions.masters;

import java.util.HashMap;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.SubRegionBll;
import com.businesslogic.properties.GeneralConfiguration;
import com.businesslogic.properties.impl.PropertyConfigValueBLLImpl;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.dao.impl.master.CountryMasterDaoImpl;
import com.iv.dto.constant.TransCargoAccountGroupConstant;
import com.iv.dto.master.CountryMaster;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.CityDao;
import com.platform.dao.CityForGroupDao;
import com.platform.dao.StateDao;
import com.platform.dto.City;
import com.platform.dto.CityForGroup;
import com.platform.dto.PropertiesFileConstants;
import com.platform.dto.State;
import com.platform.resource.CargoErrorList;

public class CityMasterAction implements Action {
	public static final String TRACE_ID = "CityMasterAction";

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	error 			= null;
		State[] 				allStates		= null;
		List<State> 			stateList		= null;
		List<CountryMaster> 	countryList		= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			String strResponse = null;
			final var  	city 	= new City();
			final var 	cache 	= new CacheManip(request);
			final var 	exec 	= cache.getExecutive(request);

			final var	transportList		= cache.getTransportList(request);
			final var	generalConfig		= cache.getGeneralConfiguration(request, exec.getAccountGroupId());

			final var 	allRegions	= cache.getRegionsByGroupId(request, exec.getAccountGroupId());

			if(generalConfig.getBoolean(GeneralConfiguration.DISPLAY_COUNTRY_OPTION)
					|| exec.getAccountGroupId() == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_IVCARGO)
				countryList	= new CountryMasterDaoImpl().getAllCountries();
			else
				allStates 	= StateDao.getInstance().findAll();

			if(allStates != null)
				stateList	= Stream.of(allStates).filter(e -> e.getCountryId() == exec.getCountryId()).collect(Collectors.toList());

			final var filter 	= JSPUtility.GetInt(request, "filter", 0);
			final var cityId 	= JSPUtility.GetInt(request, "selectedCityId", 0);
			final var countryId	= JSPUtility.GetLong(request, "country", 0);

			switch (filter) {
			case 1 -> {
				city.setName(JSPUtility.GetString(request, "name"));
				city.setStateId(JSPUtility.GetLong(request, "state"));
				city.setCountryId(countryId > 0 ? countryId : exec.getCountryId());
				city.setDescription(JSPUtility.GetString(request, "description"));
				city.setMarkForDelete(false);

				final var newCityId = CityDao.getInstance().insert(city);

				if(newCityId > 0){
					// add new city to cache
					cache.refreshCacheForCityMaster(request, newCityId);
					strResponse =  CargoErrorList.MASTER_DATA_INSERT_SUCCESS_DESCRIPTION ;

				} else
					strResponse = "City Insert "+CargoErrorList.MASTER_DATA_OPERATION_FAILURE_DESCRIPTION;
			}
			case 2 -> {
				city.setCityId(JSPUtility.GetLong(request, "selectedCityId"));
				city.setName(JSPUtility.GetString(request, "name"));
				city.setStateId(JSPUtility.GetLong(request, "state"));
				city.setCountryId(countryId > 0 ? countryId : exec.getCountryId());
				city.setDescription(JSPUtility.GetString(request, "description"));
				city.setMarkForDelete(false);

				strResponse = CityDao.getInstance().update(city);

				if(CargoErrorList.MASTER_DATA_UPDATE_SUCCESS_DESCRIPTION.equals(strResponse)){
					// update cache
					cache.refreshCacheForCityMaster(request, city.getCityId());
					cache.refreshCacheForCityForGroup(request, exec.getAccountGroupId());
				}
			}
			case 3 -> {
				city.setCityId(JSPUtility.GetInt(request, "selectedCityId"));
				city.setMarkForDelete(true);
				// Remove the following code for delete if CityMasterForGroup is ready

				strResponse = CityForGroupDao.getInstance().deleteForGroup(city.getCityId(), exec.getAccountGroupId());

				if(CargoErrorList.MASTER_DATA_DELETE_SUCCESS_DESCRIPTION.equals(strResponse)) {
					// update cache
					cache.refreshCacheForCityForGroup(request, exec.getAccountGroupId());
					cache.refreshCacheForBranchesUnderCity(request, city.getCityId(),exec.getAccountGroupId());
				}
			}
			case 4 -> {
				// Add new city to the Group
				final var newCityForGroupId = CityForGroupDao.getInstance().insertForGroup(cityId, exec.getAccountGroupId());
				ValueObject					dataBaseConfig					= null;

				if (!transportList.contains(exec.getAccountGroupId())) {
					final var	valueObjectIn	= new ValueObject();
					valueObjectIn.put("name", cache.getCityById(request, cityId).getName());
					valueObjectIn.put("description", cache.getCityById(request, cityId).getName());
					valueObjectIn.put("accountGroupId", exec.getAccountGroupId());
					valueObjectIn.put("region", JSPUtility.GetString(request, "region"));
					valueObjectIn.put("executive", exec);
					dataBaseConfig				= PropertyConfigValueBLLImpl.getInstance().getConfiguration(exec, PropertiesFileConstants.DATABASE_CONFIG_PROPERTIES);
					valueObjectIn.put("dataBaseConfig", dataBaseConfig);
					final var	subRegionBll	= new SubRegionBll();
					subRegionBll.insertSubRegion(valueObjectIn);
				}

				strResponse =  newCityForGroupId > 0 ? CargoErrorList.MASTER_DATA_INSERT_SUCCESS_DESCRIPTION :
					CargoErrorList.MASTER_DATA_OPERATION_FAILURE_DESCRIPTION;

				if(CargoErrorList.MASTER_DATA_INSERT_SUCCESS_DESCRIPTION.equals(strResponse)){
					// update cache
					cache.refreshCacheForCityForGroup(request, exec.getAccountGroupId());
					cache.refreshCacheForBranchesUnderCity(request,cityId,exec.getAccountGroupId());
				}
			}
			case 5 -> {
				strResponse = CityForGroupDao.getInstance().changeCityFroGroupStatus(cityId, exec.getAccountGroupId(), CityForGroup.CITY_FOR_GROUP_DEACTIVE);

				if(CargoErrorList.MASTER_DATA_UPDATE_SUCCESS_DESCRIPTION.equals(strResponse)){
					// update cache
					cache.refreshCacheForCityForGroup(request, exec.getAccountGroupId());
					cache.refreshCacheForBranchesUnderCity(request,cityId,exec.getAccountGroupId());
				}
			}
			case 6 -> {
				strResponse = CityForGroupDao.getInstance().changeCityFroGroupStatus(cityId, exec.getAccountGroupId(), CityForGroup.CITY_FOR_GROUP_ACTIVE);

				if(CargoErrorList.MASTER_DATA_UPDATE_SUCCESS_DESCRIPTION.equals(strResponse)){
					// update cache
					cache.refreshCacheForCityForGroup(request, exec.getAccountGroupId());
					cache.refreshCacheForBranchesUnderCity(request,cityId,exec.getAccountGroupId());
				}
			}
			default -> {
				break;
			}
			}

			request.setAttribute("countryList", countryList);
			request.setAttribute("allStates", stateList);
			request.setAttribute("allRegions", allRegions);
			request.setAttribute("isShowRegion", !transportList.contains(exec.getAccountGroupId()));
			request.setAttribute("nextPageToken", "success");

			if(filter != 0) {
				response.sendRedirect("CityMaster.do?pageId=207&eventId=1&message="+strResponse);
				request.setAttribute("message",strResponse);
			}
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}
	}
}
