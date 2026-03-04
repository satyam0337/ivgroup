/**
 * Lenovo 05-Nov-2025 9:02:32 pm 2025
 */
package com.ivcargo.utils;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Stream;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.lang3.ObjectUtils;

import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.cache.CacheKeyList;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.dto.master.configuration.AccountGroupConfiguration;
import com.iv.dto.master.configuration.Configuration;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.exception.ExceptionProcess;

public class ConfigurationCache {
	private static final String TRACE_ID = ConfigurationCache.class.getName();

	private static class Singleton {
		private static final ConfigurationCache INSTANCE = new ConfigurationCache();
	}

	public static ConfigurationCache getInstance() {
		return Singleton.INSTANCE;
	}

	private Object getContextAttribute(final HttpServletRequest request, final String key) {
		return request.getServletContext().getAttribute(key);
	}

	private void setContextAttribute(final HttpServletRequest request, final String key, final Object value) {
		request.getServletContext().setAttribute(key, value);
	}

	public Map<Object, Object> getConfigurationData(final HttpServletRequest request, final long accountGroupId, final long moduleIdentifier, final long subModuleId) throws Exception {
		final Map<Object, Object>		configurationHM	= new HashMap<>();

		Stream.of(getDefaultConfig(request, moduleIdentifier, subModuleId),// Get configuration for the given module-submodule
				accountGroupId > 0 && isModuleWithSubModule(moduleIdentifier, subModuleId) ? getGroupConfig(request, accountGroupId, moduleIdentifier, 0) : null, // Merge with group mail configuration
						accountGroupId > 0 ? getGroupConfig(request, accountGroupId, moduleIdentifier, subModuleId) : null,// Merge with group configuration
								isModuleWithSubModule(moduleIdentifier, subModuleId) ? getCommonConfigurationData(request, moduleIdentifier, 0) : null, // Merge with common mail configuration
										getCommonConfigurationData(request, moduleIdentifier, subModuleId)// Merge with common configuration
				).filter(ObjectUtils::isNotEmpty)
		.forEach(configurationHM::putAll);

		return configurationHM;
	}

	//this method is for with submodule and without submodule means 0
	private boolean isModuleWithSubModule(final long moduleIdentifier, final long subModuleId) {
		return moduleIdentifier == ModuleIdentifierConstant.MAIL_CONFIGURATION && subModuleId > 0;
	}

	@SuppressWarnings("unchecked")
	private Map<Object, Object> getDefaultConfig(final HttpServletRequest request, final long moduleIdentifier, final long subModuleId) throws Exception {
		final var	defaultKey	= Configuration.CONFIGURATION;
		final var key = moduleIdentifier + "_" + subModuleId;

		try {
			var groupConfigHM	= (Map<String, Map<Object, Object>>) getContextAttribute(request, defaultKey);

			// If configuration not found in cache, reload it
			if(groupConfigHM == null || groupConfigHM.isEmpty())
				groupConfigHM	= refreshConfiguration(request, defaultKey);

			// Get configuration for the given module-submodule
			return groupConfigHM.getOrDefault(key, new HashMap<>());
		} catch (final Exception e) {
			return ReadAllConfigurationsBllImpl.getInstance().getConfigurationData(moduleIdentifier, 0, subModuleId);
		}
	}

	private Map<String, Map<Object, Object>> refreshConfiguration(final HttpServletRequest request, final String defaultKey) throws Exception {
		try {
			final var	configurationModels	= ReadAllConfigurationsBllImpl.getInstance().getConfigurationFromDB();

			setContextAttribute(request, defaultKey, configurationModels);

			return configurationModels;
		} catch (final Exception e) {
			return ReadAllConfigurationsBllImpl.getInstance().getConfigurationFromDB();
		}
	}

	@SuppressWarnings("unchecked")
	private void refreshConfiguration(final HttpServletRequest request, final long moduleId, final long subModuleId, final String defaultKey) throws Exception {
		final var key = moduleId + "_" + subModuleId;

		try {
			//get configuration from memcache
			final var groupConfigHM	= (Map<String, Map<Object, Object>>) getContextAttribute(request, defaultKey);

			if(ObjectUtils.isEmpty(groupConfigHM)) {
				refreshConfiguration(request, defaultKey);// If the cache key doesn't exist, refresh the configuration data for the group
				return;
			}

			//override module wise configuration
			groupConfigHM.put(key, ReadAllConfigurationsBllImpl.getInstance().getModuleWiseConfigurationFromDB(moduleId, subModuleId).getOrDefault(key, new HashMap<>()));

			setContextAttribute(request, defaultKey, groupConfigHM);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	@SuppressWarnings("unchecked")
	private Map<Object, Object> getGroupConfig(final HttpServletRequest request, final long accountGroupId, final long moduleIdentifier, final long subModuleId) throws Exception {
		final var groupKey	= AccountGroupConfiguration.ACCOUNT_GROUP_CONFIGURATION + "_" + accountGroupId;
		final var cacheKey	= moduleIdentifier + "_" + subModuleId;

		try {
			var groupConfigHM	= (Map<String, Map<Object, Object>>) getContextAttribute(request, groupKey);

			// If configuration not found in cache, reload it
			if(groupConfigHM == null || groupConfigHM.isEmpty())
				groupConfigHM	= refreshGroupConfiguration(request, accountGroupId, groupKey);

			// Get configuration for the given module-submodule
			return groupConfigHM.getOrDefault(cacheKey, new HashMap<>());
		} catch (final Exception e) {
			return ReadAllConfigurationsBllImpl.getInstance().getConfigurationData(moduleIdentifier, accountGroupId, subModuleId);
		}
	}

	@SuppressWarnings("unchecked")
	private Map<String, Map<Object, Object>> refreshGroupConfiguration(final HttpServletRequest request, final long accountGroupId, final long moduleId, final long subModuleId, final String groupKey) throws Exception {
		final var key = moduleId + "_" + subModuleId;

		try {
			final var groupConfigHM	= (Map<String, Map<Object, Object>>) getContextAttribute(request, groupKey);

			if(groupConfigHM == null || groupConfigHM.isEmpty())
				return refreshGroupConfiguration(request, accountGroupId, groupKey);// If the cache key doesn't exist, refresh the configuration data for the group

			// Override the group configuration with the module-wise configurations
			groupConfigHM.put(key, ReadAllConfigurationsBllImpl.getInstance().getModuleWiseGroupConfigurationFromDB(accountGroupId, moduleId, subModuleId).getOrDefault(key, new HashMap<>()));

			setContextAttribute(request, groupKey, groupConfigHM);

			return groupConfigHM;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	@SuppressWarnings("unchecked")
	private Map<Object, Object> getCommonConfigurationData(final HttpServletRequest request, final long moduleId, final long subModuleId) throws Exception {
		final var sharedKey	= CacheKeyList.SHARED_CONFIGURATION;
		final var key = moduleId + "_" + subModuleId;

		try {
			var configuration 	= (Map<String, Map<Object, Object>>) getContextAttribute(request, sharedKey);

			if(configuration == null || configuration.isEmpty())
				configuration	= refreshCommonConfiguration(request, sharedKey);

			return configuration.getOrDefault(key, new HashMap<>());
		} catch (final Exception e) {
			return ReadAllConfigurationsBllImpl.getInstance().getCommonConfigurationData(moduleId, subModuleId);
		}
	}

	public Map<String, Map<Object, Object>> refreshCommonConfiguration(final HttpServletRequest request, final String sharedKey) throws Exception {
		try {
			final var	configurationModelsHM		= ReadAllConfigurationsBllImpl.getInstance().getCommonConfigurationData();

			setContextAttribute(request, sharedKey, configurationModelsHM);

			return configurationModelsHM;
		} catch (final Exception e) {
			return ReadAllConfigurationsBllImpl.getInstance().getCommonConfigurationData();
		}
	}

	public Map<Object, Object> getConfigurationData(final HttpServletRequest request, final long accountGroupId, final long moduleIdentifier) throws Exception {
		return getConfigurationData(request, accountGroupId, moduleIdentifier, 0);
	}

	public Map<Object, Object> getConfigurationData(final HttpServletRequest request, final long moduleIdentifier) throws Exception {
		return getConfigurationData(request, moduleIdentifier, 0, 0);
	}

	/*
	 * Get and Store all group specific configuration from DB
	 */
	private Map<String, Map<Object, Object>> refreshGroupConfiguration(final HttpServletRequest request, final long accountGroupId, final String groupKey) throws Exception {
		try {
			final var	configurationModels	= ReadAllConfigurationsBllImpl.getInstance().getGroupConfigurationFromDB(accountGroupId);

			setContextAttribute(request, groupKey, configurationModels);

			return configurationModels;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public void refreshGroupConfiguration(final HttpServletRequest request, final long accountGroupId, final long moduleId, final long subModuleId) throws Exception {
		refreshGroupConfiguration(request, accountGroupId, moduleId, subModuleId, AccountGroupConfiguration.ACCOUNT_GROUP_CONFIGURATION + "_" + accountGroupId);
	}

	public void refreshConfiguration(final HttpServletRequest request, final long moduleId, final long subModuleId) throws Exception {
		refreshConfiguration(request, moduleId, subModuleId, Configuration.CONFIGURATION);
	}

	public void refreshCommonConfiguration(final HttpServletRequest request) throws Exception {
		refreshCommonConfiguration(request, CacheKeyList.SHARED_CONFIGURATION);
	}

	public void cacheGroupWiseConfiguration(final HttpServletRequest request) {
		try {
			final var	groupWiseConfigHM	= ReadAllConfigurationsBllImpl.getInstance().getGroupWiseConfigurationFromDB();

			if(!groupWiseConfigHM.isEmpty())
				for(final Map.Entry<Long, Map<String, Map<Object, Object>>> entry : groupWiseConfigHM.entrySet())
					setContextAttribute(request, AccountGroupConfiguration.ACCOUNT_GROUP_CONFIGURATION + "_" + entry.getKey(), entry.getValue());
		} catch (final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public ValueObject getOldConfigurationData(final HttpServletRequest request, final long accountGroupId, final long moduleIdentifier) throws Exception {
		final var key	 = AccountGroupConfiguration.ACCOUNT_GROUP_CONFIGURATION + "_" + accountGroupId + "_" + moduleIdentifier;

		try {
			var configuration 	= (ValueObject) getContextAttribute(request, key);

			if(configuration == null)
				configuration = refreshOldConfiguration(request, moduleIdentifier, accountGroupId);

			return configuration;
		} catch (final Exception e) {
			return ReadAllConfigurationsBllImpl.getInstance().getOldAccountGroupConfiguration(moduleIdentifier, accountGroupId);
		}
	}

	public ValueObject refreshOldConfiguration(final HttpServletRequest request, final long moduleIdentifier, final long accountGroupId) throws Exception {
		final var key	 = AccountGroupConfiguration.ACCOUNT_GROUP_CONFIGURATION + "_" + accountGroupId + "_" + moduleIdentifier;

		try {
			final var	configurationModelsHM		= ReadAllConfigurationsBllImpl.getInstance().getOldAccountGroupConfiguration(moduleIdentifier, accountGroupId);

			setContextAttribute(request, key, configurationModelsHM);

			return configurationModelsHM;
		} catch (final Exception e) {
			return ReadAllConfigurationsBllImpl.getInstance().getOldAccountGroupConfiguration(moduleIdentifier, accountGroupId);
		}
	}
}
