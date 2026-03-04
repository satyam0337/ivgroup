package com.ivcargo.utils;

import java.sql.Timestamp;

//~--- non-JDK imports --------------------------------------------------------

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Calendar;
import java.util.Collection;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.StringJoiner;
import java.util.TreeMap;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.lang3.ObjectUtils;
import org.apache.commons.lang3.StringUtils;

import com.businesslogic.RegionBll;
import com.businesslogic.SubRegionBll;
import com.businesslogic.properties.GeneralConfiguration;
import com.businesslogic.properties.impl.PropertyConfigValueBLLImpl;
import com.framework.JSPUtility;
import com.iv.bll.impl.MinDateSelectionBllImpl;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.bll.impl.master.TransportationModeMasterBllImpl;
import com.iv.bll.impl.properties.CustomGroupAddressConfigBllImpl;
import com.iv.cache.CacheKeyList;
import com.iv.cache.PojoFilter;
import com.iv.cache.worker.Cache;
import com.iv.constant.properties.HeaderConfigurationConstant;
import com.iv.constant.properties.PaymentTypePropertiesConstant;
import com.iv.constant.properties.SearchConfigPropertiesConstant;
import com.iv.constant.properties.customgroupaddress.CustomGroupAddressPropertiesConstant;
import com.iv.constant.properties.master.CrossingAgentSourceMasterConfigurationConstant;
import com.iv.constant.properties.master.SyncWithNexusPropertiesConstant;
import com.iv.constant.properties.mindateselection.ReportWiseMinDateSelectionConstant;
import com.iv.convertor.DataObjectConvertor;
import com.iv.dao.impl.AccountGroupPermissionsDaoImpl;
import com.iv.dao.impl.ChargeTypeMasterDaoImpl;
import com.iv.dao.impl.ConfigParamDaoImpl;
import com.iv.dao.impl.IvcargoTrainingMaterialsDaoImpl;
import com.iv.dao.impl.configurationmap.BranchPincodeConfigurationDaoImpl;
import com.iv.dao.impl.master.ArticleTypeMasterDaoImpl;
import com.iv.dao.impl.master.BookingControlMasterDaoImpl;
import com.iv.dao.impl.master.BusinessFunctionsDaoImpl;
import com.iv.dao.impl.master.CategoryTypeMasterDaoImpl;
import com.iv.dao.impl.master.DivisionMasterDaoImpl;
import com.iv.dao.impl.master.HamalMasterDaoImpl;
import com.iv.dao.impl.master.OperationLockingDaoImpl;
import com.iv.dao.impl.master.PackageConditionMasterDaoImpl;
import com.iv.dao.impl.master.TaxMasterDaoImpl;
import com.iv.dao.impl.master.configuration.ConfigurationDaoImpl;
import com.iv.dto.ArticleTypeMaster;
import com.iv.dto.BranchWayBillTypeConfiguration;
import com.iv.dto.ConfigParam;
import com.iv.dto.ExecutiveFunctionsModel;
import com.iv.dto.IvcargoTrainingMaterials;
import com.iv.dto.OperationLocking;
import com.iv.dto.configurationmap.BranchPincodeConfiguration;
import com.iv.dto.constant.ConfigKeyConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.dto.constant.TransCargoAccountGroupConstant;
import com.iv.dto.master.AccountGroupPermission;
import com.iv.dto.master.BusinessFunctions;
import com.iv.dto.master.CategoryTypeMaster;
import com.iv.dto.master.DivisionMaster;
import com.iv.dto.master.HamalMaster;
import com.iv.dto.master.PackageConditionMaster;
import com.iv.dto.master.TaxMaster;
import com.iv.dto.master.TaxModel;
import com.iv.dto.master.TransportationModeForGroup;
import com.iv.properties.constant.DisplayDataWithinDateRangePropertiesConstant;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.constant.AccountGroupConstant;
import com.iv.utils.constant.Constant;
import com.iv.utils.constant.properties.FolderLocationPropertiesConstant;
import com.iv.utils.constant.properties.ServerIPAddressConfigurationConstant;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.exception.ExceptionProcess;
import com.iv.utils.request.ClientAddress;
import com.iv.utils.utility.CollectionUtility;
import com.iv.utils.utility.ListFilterUtility;
import com.iv.utils.utility.MapUtils;
import com.iv.utils.utility.Utility;
import com.iv.utils.webService.WSUtility;
import com.iv.utils.webService.WebServiceURI;
import com.platform.dao.AccountGroupDao;
import com.platform.dao.AccountGroupNetworkConfigurationDao;
import com.platform.dao.ArticleTypeForGroupDao;
import com.platform.dao.BranchBookingDestinationConfigDao;
import com.platform.dao.BranchBookingDestinationMapDao;
import com.platform.dao.BranchDao;
import com.platform.dao.BranchNetWorkConfigurationDao;
import com.platform.dao.BranchPermissionDao;
import com.platform.dao.BranchWiseDispatchConfigDao;
import com.platform.dao.ChargeTypeMasterDao;
import com.platform.dao.CityDao;
import com.platform.dao.CityForGroupDao;
import com.platform.dao.CommodityDao;
import com.platform.dao.CrossingAgentBookingSourceMapDao;
import com.platform.dao.CustomGroupMapperDao;
import com.platform.dao.DriverMasterDao;
import com.platform.dao.LocationsMappingDao;
import com.platform.dao.MarqueeDao;
import com.platform.dao.PackingTypeForGroupDao;
import com.platform.dao.PackingTypeMasterDao;
import com.platform.dao.RegionDao;
import com.platform.dao.SubRegionDao;
import com.platform.dao.VehicleNumberMasterDao;
import com.platform.dao.VehicleTypeDao;
import com.platform.dao.WayBillTypeDao;
import com.platform.dto.AccountGroup;
import com.platform.dto.AccountGroupNetworkConfiguration;
import com.platform.dto.AccountGroupTieUpConfiguration;
import com.platform.dto.ArticleTypeForGroup;
import com.platform.dto.Branch;
import com.platform.dto.BranchBookingDestinationConfig;
import com.platform.dto.BranchBookingDestinationMap;
import com.platform.dto.BranchNetWorkConfiguration;
import com.platform.dto.BranchPermission;
import com.platform.dto.BranchWiseDispatchConfig;
import com.platform.dto.ChargeTypeMaster;
import com.platform.dto.City;
import com.platform.dto.CityForGroup;
import com.platform.dto.Commodity;
import com.platform.dto.CrossingAgentBookingSourceMap;
import com.platform.dto.CustomGroupMapper;
import com.platform.dto.DriverMaster;
import com.platform.dto.Executive;
import com.platform.dto.ExecutiveFeildPermissionDTO;
import com.platform.dto.LocationsMapping;
import com.platform.dto.MarqueeMaster;
import com.platform.dto.PackingTypeForGroup;
import com.platform.dto.PackingTypeMaster;
import com.platform.dto.PropertiesFileConstants;
import com.platform.dto.Region;
import com.platform.dto.SubRegion;
import com.platform.dto.TransportCommonMaster;
import com.platform.dto.TransportListMaster;
import com.platform.dto.VehicleNumberMaster;
import com.platform.dto.VehicleType;
import com.platform.dto.WayBillTaxDetails;
import com.platform.dto.WayBillType;
import com.platform.dto.configuration.discountlimit.ModuleWiseDiscountLimitConfigurationDTO;
import com.platform.dto.configuration.master.DisplayDataConfigurationDTO;
import com.platform.dto.configuration.mindateselection.ModuleWiseMinDateSelectionConfigurationDTO;
import com.platform.dto.configuration.mindateselection.ReportWiseMinDateSelectionConfigurationDTO;
import com.platform.dto.configuration.modules.BankStatementConfigurationDTO;
import com.platform.dto.configuration.modules.CashStatementConfigurationDTO;
import com.platform.dto.configuration.modules.DashBoardConfigurationDTO;
import com.platform.dto.configuration.modules.DocumentCodeConfigurationDTO;
import com.platform.dto.configuration.modules.GroupConfigurationPropertiesDTO;
import com.platform.dto.configuration.modules.LsConfigurationDTO;
import com.platform.dto.configuration.report.common.CommonReportsConfigurationDTO;
import com.platform.dto.constant.CargoAccountGroupConstant;
import com.platform.dto.constant.ExecutiveTypeConstant;
import com.platform.dto.constant.FeildPermissionsConstant;
import com.platform.dto.constant.WayBillTypeConstant;
import com.platform.dto.model.ChargeTypeModel;
import com.platform.utils.PropertiesUtility;

public class CacheManip {
	private static final String TRACE_ID = "CACHEMANIP";

	private static final String BRANCH					= "branch";
	private static final String BRANCHES				= "branches";
	private static final String SUB_REGIONS				= "subRegions";
	private static final String REGIONS					= "regions";
	private static final String BRANCH_NETWORK_CONFIG	= "branchNetworkConfig";
	private static final String BRANCH_FOR_GROUP_FOR_CITY	= "branchForGroupForCity";
	private static final String ARTICLE_TYPE_MASTER			= "articleTypeMaster";
	private static final String ALL_ACCOUNT_GROUP_NETWORK_CONFIG			= "allAccountGroupNetworkConfig";
	private static final String IS_APPLICATION_CACHE_EXIST			= "isApplicationCacheExist";
	private static final String PACKING_TYPE_MASTER					= "packingTypeMaster";
	private static final String CITY_FOR_GROUP						= "cityForGroup";
	private static final String BRANCH_COLLECTION					= "branchCollection";
	private static final String PACKING_TYPE_FOR_GROUP				= "packingTypeForGroup";
	private static final String REGION_FOR_GROUP					= "regionForGroup";
	private static final String LOCATIONS_MAPPING_FOR_GROUP			= "locationsMappingForGroup";
	private static final String ALL_GROUP_BRANCHES					= "allGroupBranches";
	private static final String COMMODITIES							= "commodities";
	private static final String CROSSING_AGENT_BOOKING_SOURCE_MAP_FOR_GROUP		= "crossingAgentBookingSourceMapForGroup";
	private static final String CHARGES								= "charges";
	private static final String CHARGES_NEW							= "chargesNew";
	private static final String VEHICLE_NUMBER_MASTERS				= "vehicleNumberMasters";
	private static final String VEHICLE_TYPES						= "vehicleTypes";
	private static final String HAMAL_MASTERS						= "hamalMasters";
	private static final String TRANSPORTATION_MODE_FOR_GROUP		= "TransportationModeForGroup";
	private static final String DELIVERY_CHARGES					= "deliveryCharges";
	private static final String DELIVERY_CHARGES_NEW				= "deliveryChargesNew";
	private static final String CITY								= "city";
	private static final String GROUP								= "group";
	private static final String TAXES								= "taxes";
	private static final String EXEC_FEILD_PERMISSIONS				= "execFeildPermissions";
	private static final String DRIVER_MASTERS_FOR_ACCOUNT_GROUP	= "driverMastersForAccountGroup";
	private static final String WAY_BILL_TYPE						= "wayBillType";
	private static final String CHARGE_TYPE_MASTER					= "chargeTypeMaster";
	private static final String TAX_MASTER							= "taxMaster";
	private static final String WAY_BILL_TYPE_ALL					= "wayBillTypeAll";
	private static final String BRANCH_WISE_DISPATCH_CONFIG 		= "branchwisedispatchconfig";
	private static final String ARTICLE_TYPE_FOR_GROUP 				= "articleTypeForGroup";
	private static final String CONFIG_PARAM_GROUP 					= "configParamGroup";
	private static final String GROUP_WAY_BILL_TYPES 				= "GroupWayBillTypes";
	private static final String ACCOUNT_GROUP 						= "accountGroup";
	private static final String OPERATION_LOCKING					= "operationLocking";
	private static final String	DIVISION_LIST						= "divisionList";

	public CacheManip(final HttpServletRequest request) {
		checkApplicationCache(request);
	}

	public ValueObject getBranchData(final HttpServletRequest request, final long branchId) {
		var	branchData	= (ValueObject) getContextAttribute(request, BRANCH + branchId);

		if(branchData == null) {
			setContextAttribute(request, BRANCH + branchId, new ValueObject());
			branchData	= (ValueObject) getContextAttribute(request, BRANCH + branchId);
		}

		return branchData;
	}

	public ValueObject getCityData(final HttpServletRequest request) {
		try {
			var	cityObj	= (ValueObject) getContextAttribute(request, CITY);

			if(cityObj == null) {
				cacheAllCityData(request);
				cityObj	= (ValueObject) getContextAttribute(request, CITY);
			}

			return cityObj;
		} catch (final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
		}

		return new ValueObject();
	}

	public ValueObject getBranchesData(final HttpServletRequest request) {
		return (ValueObject) getContextAttribute(request, BRANCHES);
	}

	public boolean isCitiesDataExist(final HttpServletRequest request) {
		return (ValueObject) getContextAttribute(request, CITY) != null;
	}

	@SuppressWarnings("unchecked")
	public HashMap<Long, ExecutiveFeildPermissionDTO> getExecutiveFieldPermission(final HttpServletRequest request) {
		var execFldPermissions	= new HashMap<Long, ExecutiveFeildPermissionDTO>();

		if (request.getSession().getAttribute(EXEC_FEILD_PERMISSIONS) != null)
			execFldPermissions = (HashMap<Long, ExecutiveFeildPermissionDTO>) request.getSession().getAttribute(EXEC_FEILD_PERMISSIONS);

		return execFldPermissions;
	}

	public Executive getExecutive(final HttpServletRequest request) {
		return (Executive) request.getSession().getAttribute(Executive.EXECUTIVE);
	}

	public boolean isApplicationCacheExist(final HttpServletRequest request) {
		try {
			return request.getSession().getServletContext().getAttribute(IS_APPLICATION_CACHE_EXIST) != null && Boolean.parseBoolean(request.getSession().getServletContext().getAttribute(IS_APPLICATION_CACHE_EXIST).toString());
		} catch (final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
		}

		return false;
	}

	public ValueObject getAccountGroupDataById(final HttpServletRequest request, final long accountGroupId) {
		var	groupData	= (ValueObject) getContextAttribute(request, GROUP + accountGroupId);

		if(groupData == null) {
			setContextAttribute(request, GROUP + accountGroupId, new ValueObject());
			groupData	= (ValueObject) getContextAttribute(request, GROUP + accountGroupId);
		}

		return groupData;
	}

	public boolean isAccountGroupCacheExist(final HttpServletRequest request, final long accountGroupId) {
		final var		groupData	= getAccountGroupDataById(request, accountGroupId);

		return groupData != null;
	}

	public void checkApplicationCache(final HttpServletRequest request) {
		try {
			final var executive = (Executive) request.getSession().getAttribute(Executive.EXECUTIVE);

			checkApplicationCache(request, executive);
		} catch (final Exception err) {
			ExceptionProcess.execute(err, TRACE_ID);
		}
	}

	public void checkApplicationCache(final HttpServletRequest request, final Executive executive) {
		try {
			if(executive != null) {
				final var branchdata = (ValueObject) getContextAttribute(request, BRANCH + executive.getBranchId());

				if (branchdata != null) {
					final var expiryDate  = (Date) branchdata.get("expiryDate");
					final var currentDate = new Date();

					if (expiryDate == null || expiryDate.before(currentDate))
						cacheBranchData(request, executive);
				} else
					cacheBranchData(request, executive);
			}
		} catch (final Exception err) {
			ExceptionProcess.execute(err, TRACE_ID);
		}
	}

	public void refreshData(final HttpServletRequest request, final int masterId, final long accountGroupId) {
		try {
			switch (masterId) {
			case (int) ModuleIdentifierConstant.BRANCH_MASTER -> {
				refreshGenericBranchDetailCache(request);
				refreshBranchForGroupForCity(request, accountGroupId);
				refreshAllGroupBranchesData(request, accountGroupId);
				refreshCacheForLocationMapping(request, accountGroupId);
				refreshBranchPincodeDetailCache(request, accountGroupId);
			}
			case (int) ModuleIdentifierConstant.SUB_REGION_MASTER -> {
				refreshGenericSubRegionCache(request);
				refreshCacheForSubRegion(request, accountGroupId);
			}
			case (int) ModuleIdentifierConstant.REGION_MASTER -> {
				refreshGenericRegionCache(request);
				refreshCacheForRegion(request, accountGroupId);
			}
			case (int) ModuleIdentifierConstant.GROUP_MERGING_MASTER -> {
				refreshBranchNetworkConfiguration(request, accountGroupId);
				refreshAllAccountGroupNetworkConfig(request);
				refreshAccountGroupNetworkConfiguration(request, accountGroupId);
				refreshSubRegionsFromAccountGroupNetworkConfig(request, accountGroupId);
			}
			case (int) ModuleIdentifierConstant.PACKING_TYPE_MASTER -> refreshCacheForPackingTypeMaster(request);
			case (int) ModuleIdentifierConstant.PACKING_GROUP_MASTER -> refreshCacheForPackingTypeForGroup(request, accountGroupId);
			case (int) ModuleIdentifierConstant.TAX_MASTER_FOR_GROUP -> refreshTaxes(request, accountGroupId);
			case (int) ModuleIdentifierConstant.BUSINESS_FUNCTIONS_MASTER -> refreshBusinessFunctions(request);
			case (int) ModuleIdentifierConstant.ACCOUNT_GROUP_PERMISSION_MASTER -> refreshAccountGroupPermission(request, accountGroupId);
			case (int) ModuleIdentifierConstant.CONFIG_PARAM -> refreshConfigParam(request, accountGroupId);
			case (int) ModuleIdentifierConstant.CITY_FOR_GROUP_MASTER -> refreshCacheForCityForGroup(request, accountGroupId);
			case (int) ModuleIdentifierConstant.MARQUEE_MASTER -> refreshMarqueeMaster(request);
			case (int) ModuleIdentifierConstant.CITY_MASTER -> cacheAllCityData(request);
			case (int) ModuleIdentifierConstant.VEHICLE_NUMBER_MASTER -> refreshCacheForVehicleNumberMaster(request, accountGroupId);
			case (int) ModuleIdentifierConstant.VEHICLE_TYPE_MASTER -> refreshCacheForVehicleType(request, accountGroupId);
			case (int) ModuleIdentifierConstant.CATEGORY_TYPE_MASTER -> refreshCategoryTypes(request, accountGroupId);
			case (int) ModuleIdentifierConstant.COMODITY_MASTER -> refreshCacheForCommodity(request, accountGroupId);
			case (int) ModuleIdentifierConstant.ACCOUNT_GROUP_MASTER -> {
				refreshAllAccountGroupData(request);
				refreshTransportListMaster(request);
				refreshAccountGroup(request, accountGroupId);
			}
			case (int) ModuleIdentifierConstant.HAMAL_MASTER -> refreshCacheForHamalMaster(request, accountGroupId);
			case (int) ModuleIdentifierConstant.OPERATION_LOCKING -> refreshOperationLockingData(request, accountGroupId);
			case (int) ModuleIdentifierConstant.TRANSPORTATION_MODE_GROUP_MASTER -> refreshCacheForTransportationModeForGroup(request, accountGroupId);
			case (int) ModuleIdentifierConstant.CHARGE_MASTER -> {
				refreshCacheForBookingChargesOld(request, accountGroupId);
				refreshCacheForDeliveryChargesOld(request, accountGroupId);
				refreshCacheForBookingCharges(request, accountGroupId);
				refreshCacheForDeliveryCharges(request, accountGroupId);
			}
			case (int) ModuleIdentifierConstant.IVCARGO_TRAINING_MATERIALS_MASTER -> refreshCacheForIvcargoTrainingMaterials(request);
			case (int) ModuleIdentifierConstant.DIVISION_MASTER -> refreshCacheForDivisionMaster(request, accountGroupId);
			case (int) ModuleIdentifierConstant.BOOKING_CONTROL_MASTER -> refreshCacheForBranchWayBillTypeConfiguration(request, accountGroupId);
			default -> {
				break;
			}
			}
		} catch (final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public void refreshAllData(final HttpServletRequest request) throws Exception {
		refreshGenericBranchDetailCache(request);
		refreshGenericSubRegionCache(request);
		refreshGenericRegionCache(request);
		refreshAllAccountGroupNetworkConfig(request);
		refreshCacheForPackingTypeMaster(request);
		refreshBranchPincodeDetailCache(request);
		refreshBusinessFunctions(request);
	}

	public void refreshGroupWiseData(final HttpServletRequest request, final long accountGroupId) throws Exception {
		refreshCacheForRegion(request, accountGroupId);
		refreshCacheForSubRegion(request, accountGroupId);
		refreshBranchNetworkConfiguration(request, accountGroupId);
		refreshCacheForPackingTypeForGroup(request, accountGroupId);
		refreshAccountGroupPermission(request, accountGroupId);
		refreshCategoryTypes(request, accountGroupId);
		refreshAccountGroupNetworkConfiguration(request, accountGroupId);
		refreshTaxes(request, accountGroupId);
		refreshConfigParam(request, accountGroupId);
		refreshCacheForCityForGroup(request, accountGroupId);
		refreshBranchForGroupForCity(request, accountGroupId);
		refreshAllGroupBranchesData(request, accountGroupId);
		refreshCacheForVehicleNumberMaster(request, accountGroupId);
		refreshCacheForVehicleType(request, accountGroupId);
		refreshCacheForBranchWayBillTypeConfiguration(request, accountGroupId);
	}

	public void cacheAppData(final HttpServletRequest request) throws Exception {
		try {
			cacheAllChargeTypeMasterData(request);
			cacheAllLRTypeData(request);
			cacheAllTaxMasterData(request);
			refreshMarqueeMaster(request);

			setContextAttribute(request, "isApplicationCacheExist", true);
		} catch (final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
			throw new Exception("cache update error");
		}
	}

	private void cacheAllCityData(final HttpServletRequest request) throws Exception {
		try {
			//City Result
			final var cityResult = CityDao.getInstance().findAll();
			final var city       = new ValueObject();

			for (final City element : cityResult)
				city.put(Long.toString(element.getCityId()), element);

			setContextAttribute(request, CITY, city);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private void cacheAllChargeTypeMasterData(final HttpServletRequest request) throws Exception {
		try {
			//ChargeTypeMaster Result
			final var chargeTypeMasterResult = ChargeTypeMasterDao.getInstance().findAll();
			final var chargeTypeMaster       = new ValueObject();

			for (final ChargeTypeMaster chaMaster : chargeTypeMasterResult)
				chargeTypeMaster.put(Long.toString(chaMaster.getChargeTypeMasterId()), chaMaster);

			setContextAttribute(request, CHARGE_TYPE_MASTER, chargeTypeMaster);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private void cacheAllTaxMasterData(final HttpServletRequest request) throws Exception {
		try {
			//TaxMaster Result
			final var taxMasterResult	= TaxMasterDaoImpl.getInstance().findAll();
			final var taxMaster			= new HashMap<Long, TaxMaster>();

			taxMasterResult.forEach((final TaxMaster tm) -> taxMaster.put(tm.getTaxMasterId(), tm));

			setContextAttribute(request, TAX_MASTER, taxMaster);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public void refreshCacheForPackingTypeMaster(final HttpServletRequest request) throws Exception {
		try {
			final var packingTypeMasterResult = PackingTypeMasterDao.getInstance().findAll();
			final var packingTypeMaster       = new ValueObject();

			for (final PackingTypeMaster ptm : packingTypeMasterResult)
				if(StringUtils.isNotEmpty(ptm.getName()))
					packingTypeMaster.put(Long.toString(ptm.getPackingTypeMasterId()), ptm);

			setContextAttribute(request, PACKING_TYPE_MASTER, packingTypeMaster);
		} catch(final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public HashMap<Long, AccountGroup> refreshAllAccountGroupData(final HttpServletRequest request) throws Exception {
		try {
			final var  accountGroupHM	= AccountGroupDao.getInstance().getAllAccountGroup();
			setContextAttribute(request, "accountGroupHM", accountGroupHM);

			return accountGroupHM;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public void refreshTransportListMaster(final HttpServletRequest request) throws Exception {
		try {
			final var	accountGroupHM = getAccountGroupHM(request);

			final var transportList 	= TransportListMaster.getTransportList();

			accountGroupHM.keySet().stream().filter(groupId -> groupId > Long.parseLong(Integer.toString(CargoAccountGroupConstant.ACCOUNT_GROUP_ID_MECL))).forEach(transportList::add);

			setContextAttribute(request, TransportListMaster.TRANSPORT_LIST, transportList);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public void addGroupInTransportListMaster(final HttpServletRequest request, final long accountGroupId, final List<Long> master) {
		try {
			if(!master.contains(accountGroupId) && accountGroupId > Long.parseLong(Integer.toString(CargoAccountGroupConstant.ACCOUNT_GROUP_ID_MECL)))
				master.add(accountGroupId);
		} catch (final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	@SuppressWarnings("unchecked")
	public ArrayList<Long> getTransportList(final HttpServletRequest request) throws Exception {
		try {
			var	transportList	= (ArrayList<Long>) getContextAttribute(request, TransportListMaster.TRANSPORT_LIST);

			if(ObjectUtils.isEmpty(transportList)) {
				refreshTransportListMaster(request);
				transportList	= (ArrayList<Long>) getContextAttribute(request, TransportListMaster.TRANSPORT_LIST);
			}

			return transportList != null ? transportList : new ArrayList<>();
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public void cacheGroupData(final HttpServletRequest request, Executive executive) throws Exception {
		try {
			// If any kind of caching will done in this method then it should reflect in MultiLoginsCacheManip.cacheGroupData()
			final var	groupdata					= new ValueObject();
			var			accountGroupid				= 0L;

			if(executive == null) {
				if(request.getAttribute(Constant.ACCOUNT_GROUP_ID) != null)
					accountGroupid  = (long) request.getAttribute(Constant.ACCOUNT_GROUP_ID);

				executive		= new Executive();
				executive.setAccountGroupId(accountGroupid);
			}

			setContextAttribute(request, GROUP + executive.getAccountGroupId(), groupdata);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public void cacheBranchData(final HttpServletRequest request, final Executive executive) throws Exception {
		try {
			if(executive != null) {
				final var branchdata = new ValueObject();
				branchdata.put(BRANCH, BranchDao.getInstance().findByBranchId(executive.getBranchId()));

				final var cal		= DateTimeUtility.getCalenderInstance();
				cal.add(Calendar.HOUR, 1);
				final var d = cal.getTime();
				branchdata.put("expiryDate", d);

				setContextAttribute(request, BRANCH + executive.getBranchId(), branchdata);

				//Check Whether Data Exist or Not
				if(getContextAttribute(request, GROUP + executive.getAccountGroupId()) == null)
					cacheGroupData(request, executive);

				final var isApplicationCacheExist = getContextAttribute(request, "isApplicationCacheExist");

				//Check Whether Data Exist or Not
				if(isApplicationCacheExist != null) {
					if(!Boolean.parseBoolean(isApplicationCacheExist.toString()))
						cacheAppData(request);
				} else
					cacheAppData(request);
			}
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public void refreshCacheForPackingTypeMaster(final HttpServletRequest request, final long packingTypeMasterId) throws Exception {
		try {
			final var valObjPackingMaster 	= getPackingTypeMasterData(request);

			final var packingType 	= PackingTypeMasterDao.getInstance().findByPackingTypeMasterId(packingTypeMasterId);

			if(packingType != null)
				valObjPackingMaster.put(Long.toString(packingType.getPackingTypeMasterId()), packingType);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public VehicleNumberMaster[] refreshCacheForVehicleNumberMaster(final HttpServletRequest request, final long accountGroupId) throws Exception {
		VehicleNumberMaster[] 	vehicleNumberMasters	= null;

		try {
			final var		groupData 				= getAccountGroupDataById(request, accountGroupId);
			vehicleNumberMasters	= VehicleNumberMasterDao.getInstance().getVehicleNoForAccountGroup(accountGroupId);

			groupData.put(VEHICLE_NUMBER_MASTERS, vehicleNumberMasters);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}

		return vehicleNumberMasters;
	}

	public void refreshCacheForCityMaster(final HttpServletRequest request, final long cityId) throws Exception {
		try {
			final var valObjCity = (ValueObject) getContextAttribute(request, CITY);
			final var newCity = CityDao.getInstance().findCityByCityId(cityId);

			if(valObjCity != null)
				valObjCity.put(Long.toString(cityId), newCity);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	@SuppressWarnings("unchecked")
	private HashMap<Long, Branch> getAllGroupBranches(final ValueObject groupdata) throws Exception {
		return (HashMap<Long, Branch>) groupdata.get(ALL_GROUP_BRANCHES);
	}

	public void refreshCacheForBranch(final HttpServletRequest request, final long branchId) throws Exception {
		try {
			final var  	branch  	= BranchDao.getInstance().findByBranchId(branchId);

			final var	groupdata 				= getAccountGroupDataById(request, branch.getAccountGroupId());
			final var	branchForGroupForCity 	= getBranchForGroupForCity(request, branch.getAccountGroupId());
			final var	allGroupBranches 		= getAllGroupBranches(request, branch.getAccountGroupId());

			final var cachedCity = getCityById(request, branch.getCityId());
			branch.setCityName(cachedCity.getName());

			if(branchForGroupForCity != null) {
				var cityBranches = (ValueObject) branchForGroupForCity.get(CITY + branch.getCityId());

				if(cityBranches == null) {
					cityBranches	= new ValueObject();
					cityBranches.put(Long.toString(branch.getBranchId()), branch);
				}

				branchForGroupForCity.put(CITY + branch.getCityId(), cityBranches);
				groupdata.put(BRANCH_FOR_GROUP_FOR_CITY, branchForGroupForCity);
				setContextAttribute(request, GROUP + branch.getAccountGroupId(), groupdata);
			}

			if(allGroupBranches != null) {
				allGroupBranches.put(branch.getBranchId(), branch);
				groupdata.put(ALL_GROUP_BRANCHES, allGroupBranches);
			}
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public void refreshCacheForBranchesUnderCity(final HttpServletRequest request, final long cityId, final long accountGroupId) throws Exception {
		try {
			final var groupdata 				= getAccountGroupDataById(request, accountGroupId);
			final var branchForGroupForCity 	= getBranchForGroupForCity(request, accountGroupId);

			var br = BranchDao.getInstance().findByAccountGroupAndCityId(accountGroupId, cityId, true);
			final var cityBranches = new ValueObject();

			for (final Branch aBr : br) {
				final var	cachedCity	= getCityById(request, aBr.getCityId());
				aBr.setCityName(cachedCity.getName());
				cityBranches.put(Long.toString(aBr.getBranchId()), aBr);
			}

			br = BranchDao.getInstance().findByAccountGroupAndCityId(accountGroupId, cityId, false);

			for (final Branch aBr : br) {
				final var	cachedCity	= getCityById(request, aBr.getCityId());
				aBr.setCityName(cachedCity.getName());
				cityBranches.put(Long.toString(aBr.getBranchId()), aBr);
			}

			branchForGroupForCity.put(CITY + cityId, cityBranches);

			groupdata.put(BRANCH_FOR_GROUP_FOR_CITY, branchForGroupForCity);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public VehicleType[] refreshCacheForVehicleType(final HttpServletRequest request, final long accountGroupId) throws Exception {
		try {
			final var vehicleTypes = VehicleTypeDao.getInstance().getVehicleTypeForAccountGroup(accountGroupId);

			final var groupData = getAccountGroupDataById(request, accountGroupId);
			groupData.put(VEHICLE_TYPES, vehicleTypes);

			return vehicleTypes;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private List<HamalMaster> refreshCacheForHamalMaster(final HttpServletRequest request, final long accountGroupId) throws Exception {
		try {
			final var hamalMasters = HamalMasterDaoImpl.getInstance().getAllHamalMasterDeailsByAccountGroupId(accountGroupId);

			if(ObjectUtils.isNotEmpty(hamalMasters)) {
				final var groupData = getAccountGroupDataById(request, accountGroupId);
				groupData.put(HAMAL_MASTERS, hamalMasters);
			}

			return hamalMasters;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public Commodity[] refreshCacheForCommodity(final HttpServletRequest request, final long accountGroupId) throws Exception {
		try {
			final var	commodities = CommodityDao.getInstance().getCommodityByAccountGroupId(accountGroupId);

			final var	groupData	= getAccountGroupDataById(request, accountGroupId);
			groupData.put(COMMODITIES, commodities);

			return commodities;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public Region[] refreshCacheForRegion(final HttpServletRequest request, final long accountGroupId) throws Exception {
		try {
			final var groupData = getAccountGroupDataById(request, accountGroupId);
			final var regionForGroup = RegionDao.getInstance().getAllRegionByGroupId(accountGroupId);

			groupData.put(REGION_FOR_GROUP, regionForGroup);

			return regionForGroup;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public SubRegion[] refreshCacheForSubRegion(final HttpServletRequest request, final long accountGroupId) throws Exception {
		try {
			final var	commonReportsConfiguration		= getCommonReportsConfiguration(request, accountGroupId);
			final var	hideDeactivatedSubregion		= commonReportsConfiguration.getBoolean("hideDeactivatedSubregion", false);

			final var groupData = getAccountGroupDataById(request, accountGroupId);
			final var subRegionForGroup = SubRegionDao.getInstance().getAllSubRegionsForGroup(accountGroupId, hideDeactivatedSubregion);
			groupData.put("subRegionForGroup", subRegionForGroup);

			return subRegionForGroup;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public PackingTypeForGroup[] refreshCacheForPackingTypeForGroup(final HttpServletRequest request, final long accountGroupId) throws Exception {
		try {
			final var groupData = getAccountGroupDataById(request, accountGroupId);
			final var latestPackingTypeForGroup = PackingTypeForGroupDao.getInstance().findByAccountGroupId(accountGroupId);
			groupData.put(PACKING_TYPE_FOR_GROUP, latestPackingTypeForGroup);

			return latestPackingTypeForGroup;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public CityForGroup[] refreshCacheForCityForGroup(final HttpServletRequest request, final long accountGroupId) throws Exception {
		try {
			final var groupData = getAccountGroupDataById(request, accountGroupId);
			final var latestCityForGroup = CityForGroupDao.getInstance().findByAccountGroupId(accountGroupId);
			groupData.put(CITY_FOR_GROUP, latestCityForGroup);

			return latestCityForGroup;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public ValueObject getBranchForGroupForCity(final HttpServletRequest request, final long accountGroupId) throws Exception {
		try {
			final var	groupdata	= getAccountGroupDataById(request, accountGroupId);

			var branchForGroupForCity 	= (ValueObject) groupdata.get(BRANCH_FOR_GROUP_FOR_CITY);

			if(branchForGroupForCity == null)
				branchForGroupForCity 	= refreshBranchForGroupForCity(request, accountGroupId);

			return branchForGroupForCity;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public ValueObject refreshBranchForGroupForCity(final HttpServletRequest request, final long accountGroupId) throws Exception {
		try {
			final var branchForGroupForCity	= new ValueObject();
			final var cityForGroup = getAllCitiesForGroup(request, accountGroupId);

			for (final CityForGroup aCityForGroup : cityForGroup) {
				final var br = BranchDao.getInstance().findByAccountGroupAndCityId(accountGroupId, aCityForGroup.getCityId(), aCityForGroup.isGroupOwnCity());
				final var branch = new ValueObject();

				for (final Branch aBr : br) {
					aBr.setCityName(aCityForGroup.getCityName());
					branch.put(Long.toString(aBr.getBranchId()), aBr);
				}

				if(Boolean.FALSE.equals(branch.isEmpty()))
					branchForGroupForCity.put(CITY + aCityForGroup.getCityId(), branch);
			}

			final var	groupdata	= getAccountGroupDataById(request, accountGroupId);
			groupdata.put(BRANCH_FOR_GROUP_FOR_CITY, branchForGroupForCity);

			return branchForGroupForCity;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public List<LocationsMapping> refreshCacheForLocationMapping(final HttpServletRequest request, final long accountGroupId) throws Exception {
		try {
			final var groupData = getAccountGroupDataById(request, accountGroupId);
			final var locationsMappingForGroup = LocationsMappingDao.getInstance().getAllLocationsMapping(accountGroupId);
			groupData.put(LOCATIONS_MAPPING_FOR_GROUP, locationsMappingForGroup);

			return locationsMappingForGroup;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public List<CrossingAgentBookingSourceMap> refreshCacheForCrossingAgentBookingSourceMap(final HttpServletRequest request, final long accountGroupId) throws Exception {
		try {
			final var groupData = getAccountGroupDataById(request, accountGroupId);
			final var crossingAgentBookingSourceMapForGroup = CrossingAgentBookingSourceMapDao.getInstance().getCrossingAgentBookingSourceMapOfGroup(accountGroupId);
			groupData.put(CROSSING_AGENT_BOOKING_SOURCE_MAP_FOR_GROUP, crossingAgentBookingSourceMapForGroup);

			return crossingAgentBookingSourceMapForGroup;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public ChargeTypeModel[] refreshCacheForDeliveryChargesOld(final HttpServletRequest request, final long accountGroupId) throws Exception {
		try {
			final var	groupData	= getAccountGroupDataById(request, accountGroupId);
			var deliveryCharges 	= ChargeTypeMasterDao.getInstance().getChargeConfiguration(accountGroupId, 0, 0, ChargeTypeMaster.WAYBILL_CHARGETYPE_DELIVERY);

			if(deliveryCharges == null)
				deliveryCharges = new ChargeTypeModel[0];

			groupData.put(DELIVERY_CHARGES, deliveryCharges);

			return deliveryCharges;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public ChargeTypeModel[] refreshCacheForBookingChargesOld(final HttpServletRequest request, final long accountGroupId) throws Exception {
		try {
			final var	groupData		= getAccountGroupDataById(request, accountGroupId);
			var 		bookingCharges 	= ChargeTypeMasterDao.getInstance().getChargeConfiguration(accountGroupId, 0, 0, ChargeTypeMaster.WAYBILL_CHARGETYPE_BOOKING);

			if(bookingCharges == null)
				bookingCharges = new ChargeTypeModel[0];

			groupData.put(CHARGES, bookingCharges);

			return bookingCharges;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	@SuppressWarnings("unchecked")
	public List<Branch> getBranchForGroupForCity(final HttpServletRequest request, final String acc, final String city) throws Exception {
		try {
			if(Long.parseLong(StringUtils.trim(city)) <= 0)
				return Collections.emptyList();

			final var	branchForGroupForCity 	= getBranchForGroupForCity(request, Long.parseLong(StringUtils.trim(acc)));
			final var	branches              	= (ValueObject) branchForGroupForCity.get(CITY + Long.parseLong(StringUtils.trim(city)));

			if(branches == null)
				return Collections.emptyList();

			return new ArrayList<>((Collection<? extends Branch>) PojoFilter.cast(branches.getHtData().values(), Branch.class));
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public String getDeliveryBranchesForMultiLogins(final HttpServletRequest request, final String acc, final String city) throws Exception {
		String 		str 		= null;

		try {
			final Long	cityId		= Long.parseLong(StringUtils.trim(city));
			var branchList	= getBranchForGroupForCity(request, acc, city);

			branchList	= ListFilterUtility.filterList(branchList, br -> !br.isMarkForDelete() && (br.getBranchType() == Branch.BRANCH_TYPE_DELIVERY || br.getBranchType() == Branch.BRANCH_TYPE_BOOKING_DELIVERY_BOTH));

			for (final Branch br : branchList)
				str = str + "," + br.getName() + "=" + br.getBranchId() + "!" + br.getAccountGroupId() + "@" + br.getAgencyId();

			return str + ":" + cityId;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public String getBranchesWithGroupingBranches(final HttpServletRequest request, final String acc, final String city, final long branchId, final int branchTypeBookingOrDelivery) throws Exception{
		String 		str 					= null;

		try {
			final var accountGroupId 		= Utility.getLong(StringUtils.trim(acc));
			final var subRegionId         	= Utility.getLong(StringUtils.trim(city));
			final var branchCollection		= getGroupBranchCollection(request, branchId);

			final var branchList	= getAllActiveGroupBranchesList(request, accountGroupId);

			final List<Branch> brancOutList = ListFilterUtility.filterList(branchList, b -> b.getCityId() == subRegionId
					&& (b.getBranchType() == Branch.BRANCH_TYPE_BOOKING_DELIVERY_BOTH || b.getBranchType() == branchTypeBookingOrDelivery)
					&& (b.getMappingTypeId() == Branch.BRANCH_MAP_ID_OWN_BRANCH_AND_ASSIGNED || b.getMappingTypeId() == Branch.BRANCH_MAP_ID_NOT_OWN_BRANCH_AND_ASSIGNED && branchCollection != null && branchCollection.contains(b.getBranchId())));

			for (final Branch b : brancOutList)
				str = str + "," + b.getName() + "=" + b.getBranchId();

			return str + ":SubRegionId=" + subRegionId;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	// For Showing Delivery Branch Only(Start)
	public String getDeliveryBranches(final HttpServletRequest request, final String acc, final String city, final long branchId) throws Exception {
		String 		str 					= null;

		try {
			final var cityId         		= Utility.getLong(StringUtils.trim(city));
			final var branchList			= getBranchForGroupForCity(request, acc, city);
			final var branchCollection		= getGroupBranchCollection(request, branchId);

			final List<Branch> brancOutList		= ListFilterUtility.filterList(branchList, br -> !br.isMarkForDelete() && (br.getBranchType() == Branch.BRANCH_TYPE_DELIVERY || br.getBranchType() == Branch.BRANCH_TYPE_BOOKING_DELIVERY_BOTH)
					&& (br.getMappingTypeId() == Branch.BRANCH_MAP_ID_OWN_BRANCH_AND_ASSIGNED || br.getMappingTypeId() == Branch.BRANCH_MAP_ID_NOT_OWN_BRANCH_AND_ASSIGNED && branchCollection.contains(br.getBranchId())));

			for (final Branch br : brancOutList)
				str = str + "," + br.getName() + "=" + br.getBranchId();

			return str + ":CityId=" + cityId;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public Branch[] getDeliveryBranchesDetails(final HttpServletRequest request, final String acc, final String city) throws Exception {
		try {
			final var branchList	= getBranchForGroupForCity(request, acc, city);

			if(!branchList.isEmpty()) {
				final List<Branch>	arr		= new ArrayList<>(ListFilterUtility.filterList(branchList, br -> !br.isMarkForDelete() && (br.getBranchType() == Branch.BRANCH_TYPE_DELIVERY || br.getBranchType() == Branch.BRANCH_TYPE_BOOKING_DELIVERY_BOTH)));
				return convertBranchListToArray(arr);
			}

			return new Branch[0];
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private Branch[] convertBranchListToArray(final List<Branch> arr) {
		return arr.toArray(new Branch[arr.size()]);
	}

	// For Showing Booking Branch Only(Start)
	public String getBookingBranches(final HttpServletRequest request, final String acc, final String city, final boolean isOwnGroupBranchesRequired, final Executive executive) throws Exception {
		String 		str 					= null;

		try {
			final var branchList	= getBranchForGroupForCity(request, acc, city);
			List<Branch> filteredList	= ListFilterUtility.filterList(branchList, br -> br.getStatus() == Branch.BRANCH_ACTIVE && !br.isMarkForDelete());

			filteredList	= ListFilterUtility.filterList(filteredList, br -> br.getBranchType() == Branch.BRANCH_TYPE_BOOKING || br.getBranchType() == Branch.BRANCH_TYPE_BOOKING_DELIVERY_BOTH);

			if(executive.getAccountGroupId() != AccountGroupConstant.ACCOUNT_GORUP_ID_SOUTHERN && isOwnGroupBranchesRequired)
				filteredList	= ListFilterUtility.filterList(filteredList, br -> br.getMappingTypeId() == Branch.BRANCH_MAP_ID_OWN_BRANCH_AND_ASSIGNED);

			for (final Branch br : filteredList) {
				if(executive.getAccountGroupId() != AccountGroupConstant.ACCOUNT_GORUP_ID_SOUTHERN) {
					final var	branchObj = getGenericBranchDetailCache(request, br.getBranchId());

					if(branchObj.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_ROYAL_STAR)
						continue;
				}

				str = str + "," + br.getName() + "=" + br.getBranchId();
			}

			return str;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public Branch[] getBookingBranchesDetails(final HttpServletRequest request, final String acc, final String city) throws Exception {
		try {
			final var branchList	= getBranchForGroupForCity(request, acc, city);

			if(!branchList.isEmpty()) {
				final	List<Branch>	arr		= new ArrayList<>(ListFilterUtility.filterList(branchList, br -> !br.isMarkForDelete() && (br.getBranchType() == Branch.BRANCH_TYPE_BOOKING || br.getBranchType() == Branch.BRANCH_TYPE_BOOKING_DELIVERY_BOTH)));
				return convertBranchListToArray(arr);
			}

			return new Branch[0];
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}
	// For Showing Booking Branch Only(End)

	// For Showing Both Type Of Branches Only(Start)
	public String getBranches(final HttpServletRequest request, final String acc, final String city) throws Exception {
		String 		str 					= null;

		try {
			final	var branchList	= getBranchForGroupForCity(request, acc, city);

			for (final Branch br : branchList)
				if(!br.isMarkForDelete())
					str = str + "," + br.getName() + "=" + br.getBranchId();

			return str;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	// For Showing Both Type Of Branches Only(Start)
	public String getAllActiveBranches(final HttpServletRequest request, final String acc, final String city) throws Exception {
		String 		str 					= null;

		try {
			final	var branchList	= getBranchForGroupForCity(request, acc, city);
			final List<Branch> filteredList	= ListFilterUtility.filterList(branchList, br -> !br.isMarkForDelete() && br.getStatus() == Branch.BRANCH_ACTIVE);

			for (final Branch br : filteredList)
				str = str + "," + br.getName() + "=" + br.getBranchId();

			return str;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public String getPhysicalBranches(final HttpServletRequest request, final String acc, final String city) throws Exception {
		String 		str 					= null;

		try {
			final	var branchList	= getBranchForGroupForCity(request, acc, city);
			final List<Branch> filteredList	= ListFilterUtility.filterList(branchList, br -> !br.isMarkForDelete() && br.getStatus() == Branch.BRANCH_ACTIVE && br.getTypeOfLocation() == Branch.TYPE_OF_LOCATION_PHYSICAL);

			for (final Branch br : filteredList)
				str = str + "," + br.getName() + "=" + br.getBranchId();

			return str;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}

	}

	public Branch[] getBothTypeOfBranchesDetails(final HttpServletRequest request, final String acc, final String city) throws Exception {
		try {
			final	var branchList	= getBranchForGroupForCity(request, acc, city);

			if(!branchList.isEmpty()) {
				final	List<Branch>	arr		= new ArrayList<>(ListFilterUtility.filterList(branchList, br -> !br.isMarkForDelete()));
				return convertBranchListToArray(arr);
			}

			return new Branch[0];
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}
	// For Showing Both Type Of Branches Only(End)

	// For Showing Both Type Of Branches which are self branches of the loggedIn group(Start)
	public Branch[] getBothTypeOfSelfGroupBranchesDetails(final HttpServletRequest request, final String acc, final String city) throws Exception {
		try {
			final	var branchList	= getBranchForGroupForCity(request, acc, city);

			if(!branchList.isEmpty()) {
				final	List<Branch>	arr			= ListFilterUtility.filterList(branchList, br -> !br.isMarkForDelete() && br.getMappingTypeId() == Branch.BRANCH_MAP_ID_OWN_BRANCH_AND_ASSIGNED);

				arr.forEach(br -> br.setMultiBranchId(br.getBranchId() + "!" + br.getAccountGroupId() + "@" + br.getAgencyId()));

				return convertBranchListToArray(arr);
			}

			return new Branch[0];
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	// For Showing Both Type Of Branches which are self branches of the loggedIn group(Start)
	public String getBothTypeOfSelfGroupBranchesStringDetails(final HttpServletRequest request, final String acc, final String city) throws Exception {
		String 		str 					= null;

		try {
			final	var branchList	= getBranchForGroupForCity(request, acc, city);
			final	List<Branch>	arr			= ListFilterUtility.filterList(branchList, br -> !br.isMarkForDelete() && br.getMappingTypeId() == Branch.BRANCH_MAP_ID_OWN_BRANCH_AND_ASSIGNED);

			for (final Branch br : arr)
				str = str + "," + br.getName() + "=" + br.getBranchId() + "!" + br.getAccountGroupId() + "@" + br.getAgencyId();

			return str;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public Branch getBranchById(final HttpServletRequest request, final long accountGroupId, final long cityId, final long branchId) throws Exception {
		final	var branchForGroupForCity = getBranchForGroupForCity(request, accountGroupId);
		final	var branches              = (ValueObject) branchForGroupForCity.get(CITY + cityId);

		if(branches == null)
			return null;

		return (Branch) branches.get(Long.toString(branchId));
	}

	public Branch getBranchById(final HttpServletRequest request, final long accountGroupId, final long branchId) throws Exception {
		final var allGroupBranches = getAllGroupBranches(request, accountGroupId);

		// If cache exists and contains branch, return it
		if (allGroupBranches != null) {
			final var cachedBranch = allGroupBranches.get(branchId);

			if (cachedBranch != null)
				return cachedBranch;
		}

		// Fetch from DB once
		final var branch = BranchDao.getInstance().findByBranchId(branchId);

		// Populate cache if available
		if (branch != null && allGroupBranches != null)
			allGroupBranches.put(branch.getBranchId(), branch);

		return branch;
	}

	public List<Branch> getActiveBranchesBySubRegionId(final HttpServletRequest request, final long accountGroupId, final long subRegionId) throws Exception {
		List<Branch> 			branchList			= null;

		try {
			final var	subRegionBranches		= getBranchesBySubRegionId(request, accountGroupId, subRegionId);

			branchList				= ListFilterUtility.filterList(new ArrayList<>(subRegionBranches.values()), e -> !e.isMarkForDelete());
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}

		return branchList;
	}

	// Get Branches Details By SubRegionId (Start)
	public HashMap<Long, Branch> getBranchesBySubRegionId(final HttpServletRequest request, final long accountGroupId, final long subRegionId) throws Exception {
		try {
			final var	branchList 	= getAllGroupBranchesList(request, accountGroupId);
			final var	subRegionBranches 	= new HashMap<Long, Branch>();
			var cityId = 0L;

			for(final Branch br : branchList)
				if(br.getSubRegionId() == subRegionId) {
					subRegionBranches.put(br.getBranchId(), br);
					cityId = br.getCityId();
				}

			final var branchCityId	= cityId;

			final var	executive	= getExecutive(request);

			if(executive == null) return new HashMap<>();

			final var branchCollection = getGroupBranchCollection(request, executive.getBranchId());

			if (ObjectUtils.isNotEmpty(branchCollection) && branchList != null)
				subRegionBranches.putAll(branchList.parallelStream()
						.filter(b -> b.getCityId() == branchCityId)
						.collect(Collectors.toMap(Branch::getBranchId, b -> b)));

			return subRegionBranches;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	//Branch Merging branches populate
	public String getBranchesWithMergingBySubRegionId(final HttpServletRequest request, final long accountGroupId) throws Exception {
		try {
			final var	subRegionId		= JSPUtility.GetLong(request, "subRegionId", 0);
			final var	branchArr		= getBranchesWithMergingArrayBySubRegionId(request, accountGroupId, subRegionId);

			if(ObjectUtils.isEmpty(branchArr))
				return null;

			final List<Branch> branchList	= PojoFilter.filterList(Arrays.asList(branchArr), e -> e.getTypeOfLocation() == Branch.TYPE_OF_LOCATION_PHYSICAL && !e.isMarkForDelete());

			return branchList.stream().map(e -> e.getName() + "=" + e.getBranchId()).collect(Collectors.joining(Constant.COMMA));
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	@SuppressWarnings("unchecked")
	private List<AccountGroupNetworkConfiguration> getGroupWiseNetworkConfigData(final HttpServletRequest request, final long accountGroupId) throws Exception {
		List<AccountGroupNetworkConfiguration>	accountGroupNetworkList = null;

		try {
			final var groupdata = getAccountGroupDataById(request, accountGroupId);

			accountGroupNetworkList = (List<AccountGroupNetworkConfiguration>) groupdata.get("accountGroupNetwork");

			if(accountGroupNetworkList == null)
				accountGroupNetworkList	= refreshAccountGroupNetworkConfiguration(request, accountGroupId);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}

		return accountGroupNetworkList;
	}

	public List<AccountGroupNetworkConfiguration> refreshAccountGroupNetworkConfiguration(final HttpServletRequest request, final long accountGroupId) throws Exception {
		try {
			final var groupdata = getAccountGroupDataById(request, accountGroupId);
			final var	accountGroupNetworkList	= AccountGroupNetworkConfigurationDao.getInstance().findByAccountGroupId(accountGroupId);
			groupdata.put("accountGroupNetwork", accountGroupNetworkList);

			return accountGroupNetworkList;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	@SuppressWarnings("unchecked")
	public HashMap<Long, AccountGroup> getAccountGroupHM(final HttpServletRequest request) throws Exception {
		HashMap<Long, AccountGroup>	accountGroupHM = null;

		try {
			accountGroupHM = (HashMap<Long, AccountGroup>) getContextAttribute(request, "accountGroupHM");

			if(accountGroupHM == null)
				accountGroupHM	= refreshAllAccountGroupData(request);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}

		return accountGroupHM;
	}

	//Branch Merging SubRegion populate
	public List<SubRegion> getSubRegionWithMergingByAccountGroupId(final HttpServletRequest request, final long accountGroupId) throws Exception {
		final var subRegionObj		= getAllSubRegions(request);
		final var branches 			= getGenericBranchesDetail(request);
		final var accountGroupHM 	= getAccountGroupHM(request);

		final List<SubRegion> subRegions 			= new ArrayList<>();
		final List<Long> 		idsList			= new ArrayList<>();

		var	accountGroupNetworkList = getGroupWiseNetworkConfigData(request, accountGroupId);

		if(accountGroupNetworkList != null) {
			accountGroupNetworkList	= ListFilterUtility.filterList(accountGroupNetworkList, modal -> modal.getAssignBranchAccountGroupId() != accountGroupId);

			for(final AccountGroupNetworkConfiguration modal : accountGroupNetworkList) {
				final var branch    = (Branch) branches.get(Long.toString(modal.getAssignBranchId()));

				if(branch != null && !idsList.contains(branch.getSubRegionId())) {
					final var 	subregion		= (SubRegion) subRegionObj.get(branch.getSubRegionId());
					final var	accountGroup	= accountGroupHM.get(branch.getAccountGroupId());

					if(!StringUtils.contains(subregion.getName(), StringUtils.upperCase(accountGroup.getAccountGroupCode())))
						subregion.setName(subregion.getName() + " ( " + StringUtils.upperCase(accountGroup.getAccountGroupCode()) +" )");

					subRegions.add(subregion);
					idsList.add(branch.getSubRegionId());
				}
			}
		}

		return subRegions;
	}

	public String getBranchesStringWithMergingBySubRegionId(final HttpServletRequest request, final long accountGroupId, final long subRegionId) throws Exception {
		final var	data	= new StringJoiner(Constant.COMMA);

		var	accountGroupNetworkList = getGroupWiseNetworkConfigData(request, accountGroupId);

		if(accountGroupNetworkList != null) {
			accountGroupNetworkList	= ListFilterUtility.filterList(accountGroupNetworkList, modal -> modal.getAssignBranchAreaId() == subRegionId);

			for (final AccountGroupNetworkConfiguration modal : accountGroupNetworkList)  {
				final var branch = getGenericBranchDetailCache(request, modal.getAssignBranchId());
				data.add(Long.toString(branch.getBranchId()));
			}
		}

		return data.toString();
	}

	public Branch[] getBranchesWithMergingArrayBySubRegionId(final HttpServletRequest request, final long configAccountGroupId, final long subRegionId) throws Exception {
		final var	branchList	= new  ArrayList<Branch>();
		var	accountGroupNetworkList = getGroupWiseNetworkConfigData(request, configAccountGroupId);

		if(accountGroupNetworkList != null) {
			accountGroupNetworkList	= ListFilterUtility.filterList(accountGroupNetworkList, modal -> modal.getAssignBranchAreaId() == subRegionId);

			for (final AccountGroupNetworkConfiguration modal : accountGroupNetworkList)
				branchList.add(getGenericBranchDetailCache(request, modal.getAssignBranchId()));
		}

		return convertBranchListToArray(branchList);
	}

	public List<Branch> getBranchesWithMergingArrayByConfigAccountGroupId(final HttpServletRequest request, final long configAccountGroupId) throws Exception {
		final List<Branch>       branchList	= new  ArrayList<>();

		var	accountGroupNetworkList = getGroupWiseNetworkConfigData(request, configAccountGroupId);

		if(accountGroupNetworkList != null) {
			accountGroupNetworkList	= ListFilterUtility.filterList(accountGroupNetworkList, modal -> modal.getAssignBranchAccountGroupId() != configAccountGroupId);

			for(final AccountGroupNetworkConfiguration modal : accountGroupNetworkList)
				branchList.add(getGenericBranchDetailCache(request, modal.getAssignBranchId()));
		}

		return branchList;
	}

	public String getBranchesStringBySubRegionId(final HttpServletRequest request, final long accountGroupId, final long subRegionId) throws Exception {
		String str	= null;
		final var branchList = getAllGroupBranchesList(request, accountGroupId);

		for (final Branch br : branchList)
			if(br.getSubRegionId() == subRegionId)
				str = str + "," + br.getName() + "=" + br.getBranchId();

		return str;
	}

	public HashMap<Long, Branch> getPhysicalBranchesBySubRegionId(final HttpServletRequest request, final long accountGroupId, final long subRegionId) throws Exception {
		final var branchList = getAllGroupBranchesList(request, accountGroupId);
		final var subRegionBranches = new HashMap<Long, Branch>();

		final List<Branch> filteredList	= ListFilterUtility.filterList(branchList, br -> br.getSubRegionId() == subRegionId && br.getTypeOfLocation() == Branch.TYPE_OF_LOCATION_PHYSICAL && !br.isMarkForDelete());

		filteredList.stream().forEach(br -> subRegionBranches.put(br.getBranchId(), br));

		return subRegionBranches;
	}

	public HashMap<Long, Branch> getActivePhysicalBranchesBySubRegionId(final HttpServletRequest request, final long accountGroupId, final long subRegionId) throws Exception {
		final var branchList = getAllActiveGroupBranchesList(request, accountGroupId);
		final var subRegionBranches = new HashMap<Long, Branch>();

		final List<Branch> filteredList	= ListFilterUtility.filterList(branchList, br -> br.getSubRegionId() == subRegionId && br.getTypeOfLocation() == Branch.TYPE_OF_LOCATION_PHYSICAL);

		filteredList.stream().forEach(br -> subRegionBranches.put(br.getBranchId(), br));

		return subRegionBranches;
	}

	public Branch[] getBranchesArrayBySubRegionId(final HttpServletRequest request, final long accountGroupId, final long subRegionId) throws Exception {
		try {
			final var	branchesArrList		= getAllActiveGroupBranchesList(request, accountGroupId);

			final List<Branch> filteredList	= ListFilterUtility.filterList(branchesArrList, br -> br.getSubRegionId() == subRegionId && br.getTypeOfLocation() == Branch.TYPE_OF_LOCATION_PHYSICAL);

			return convertBranchListToArray(filteredList);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public HashMap<Long, Branch> getBranchesByRegionId(final HttpServletRequest request, final long accountGroupId, final long regionId) throws Exception {
		final var	branchesArrList		= getAllGroupBranchesList(request, accountGroupId);
		final List<Branch> filteredList	= ListFilterUtility.filterList(branchesArrList, br -> br.getRegionId() == regionId);

		final var regionBranches = new HashMap<Long, Branch>();
		filteredList.stream().forEach(br -> regionBranches.put(br.getBranchId(), br));

		return regionBranches;
	}

	public HashMap<Long, City> getCitiesByRegionId(final HttpServletRequest request, final long accountGroupId, final long regionId) throws Exception {
		final var	branchesArrList		= getAllGroupBranchesList(request, accountGroupId);
		final List<Branch> filteredList	= ListFilterUtility.filterList(branchesArrList, br -> br.getRegionId() == regionId);

		final var regionCities   = new HashMap<Long, City>();

		for(final Branch br : filteredList) {
			final var	city = regionCities.get(br.getCityId());

			if(city == null)
				regionCities.put(br.getCityId(), getCityById(request, br.getCityId()));
		}

		return regionCities;
	}

	public HashMap<Long, City> getCitiesBySubRegionId(final HttpServletRequest request, final long accountGroupId, final long subRegionId) throws Exception {
		final var	branchesArrList		= getAllGroupBranchesList(request, accountGroupId);
		final List<Branch> filteredList	= ListFilterUtility.filterList(branchesArrList, br -> br.getSubRegionId() == subRegionId);

		final var subRegionCities   = new HashMap<Long, City>();

		for(final Branch br : filteredList) {
			final var	city = subRegionCities.get(br.getCityId());

			if(city == null)
				subRegionCities.put(br.getCityId(), getCityById(request, br.getCityId()));
		}

		return subRegionCities;
	}

	public short getConfigValue(final HttpServletRequest request, final long accountGroupId, final short configKey) throws Exception {
		return getConfigParamData(request, accountGroupId).getOrDefault(configKey, (short) 0);
	}

	public Map<Short, Short> getConfigParamData(final HttpServletRequest request, final long accountGroupId) throws Exception {
		Map<Short, Short> 	configParamHM	= null;

		try {
			final var 	configParams 	= getConfigParam(request, accountGroupId);

			configParamHM	= configParams.stream()
					.collect(Collectors.toMap(ConfigParam::getConfigKey, cp1 -> Short.parseShort(Integer.toString(cp1.getConfigValue())), (e1, e2) -> e1));
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}

		return configParamHM;
	}

	private List<ConfigParam> refreshConfigParam(final HttpServletRequest request, final long accountGroupId) throws Exception {
		final var	groupdata	= getAccountGroupDataById(request, accountGroupId);
		final var configParams	= ConfigParamDaoImpl.getInstance().getConfigParam(accountGroupId);
		groupdata.put(CONFIG_PARAM_GROUP, configParams);

		return configParams;
	}

	@SuppressWarnings("unchecked")
	public List<ConfigParam> getConfigParam(final HttpServletRequest request, final long accountGroupId) throws Exception {
		try {
			final var	groupdata	= getAccountGroupDataById(request, accountGroupId);
			var	configParams	= (List<ConfigParam>) groupdata.get(CONFIG_PARAM_GROUP);

			if(configParams == null)
				configParams	= refreshConfigParam(request, accountGroupId);

			return configParams;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public WayBillType[] getGroupWayBillTypes(final HttpServletRequest request, final long accountGroupId) throws Exception {
		try {
			final var	groupdata			= getAccountGroupDataById(request, accountGroupId);
			var	groupWayBillTypes	= (WayBillType[]) groupdata.get(GROUP_WAY_BILL_TYPES);

			final List<WayBillType> 	wayBillTypeDetails 	= new ArrayList<>();

			if(groupWayBillTypes == null) {
				final var	configParams	= getConfigParam(request, accountGroupId);
				final List<ConfigParam> filteredList	= ListFilterUtility.filterList(configParams, e -> e.getConfigKey() != null && e.getConfigValue() != null && e.getConfigKey() == ConfigKeyConstant.CONFIG_KEY_WAYBILLTYPE
						&& e.getConfigValue() != ConfigKeyConstant.CONFIG_KEY_WAYBILLTYPE_MANUAL
						&& WayBillTypeConstant.getWayBillTypeNameByWayBilTypeId(Long.parseLong(Integer.toString(e.getConfigValue()))) != null);

				filteredList.forEach((final ConfigParam element) -> {
					final var wayBillType = new WayBillType();
					wayBillType.setWayBillTypeId(Long.parseLong(Integer.toString(element.getConfigValue())));
					wayBillType.setWayBillType(WayBillTypeConstant.getWayBillTypeNameByWayBilTypeId(wayBillType.getWayBillTypeId()));
					wayBillTypeDetails.add(wayBillType);
				});

				groupWayBillTypes	= wayBillTypeDetails.toArray(new WayBillType[wayBillTypeDetails.size()]);

				groupdata.put(GROUP_WAY_BILL_TYPES, groupWayBillTypes);
			}

			return groupWayBillTypes;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public BranchWiseDispatchConfig[] getBranchWiseDispatchConfig(final HttpServletRequest request, final long accountGroupId) throws Exception {
		try {
			final var	groupData 			= getAccountGroupDataById(request, accountGroupId);
			var	branchWiseDispatchConfig 	= (BranchWiseDispatchConfig[]) groupData.get(BRANCH_WISE_DISPATCH_CONFIG);

			if(branchWiseDispatchConfig == null) {
				branchWiseDispatchConfig	= BranchWiseDispatchConfigDao.getInstance().getBranchWiseDispatchConfig(accountGroupId);
				groupData.put(BRANCH_WISE_DISPATCH_CONFIG, branchWiseDispatchConfig);
			}

			return branchWiseDispatchConfig;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public String getBranchesString(final HttpServletRequest request, final long accountGroupId, final long branchId) throws Exception {
		final var 	branchWiseDispatchConfig 	= getBranchWiseDispatchConfig(request, accountGroupId);

		if(branchWiseDispatchConfig == null)
			return null;

		return Stream.of(branchWiseDispatchConfig)
				.filter(e -> e.getBranchId() == branchId).findFirst().orElse(new BranchWiseDispatchConfig()).getBranchesAllowed();
	}

	public City getCityById(final HttpServletRequest request, final long sourceCityId) throws Exception {
		try {
			final var city = getCityData(request);

			var cityObj	= (City) city.get(Long.toString(sourceCityId));

			if(cityObj == null) {
				cityObj	= CityDao.getInstance().findCityByCityId(sourceCityId);
				city.put(Long.toString(sourceCityId), cityObj);
				setContextAttribute(request, CITY, city);
			}

			return cityObj;
		} catch (final Exception e) {
			return CityDao.getInstance().findCityByCityId(sourceCityId);
		}
	}

	public City getCityAtLoginTime(final HttpServletRequest request, final long sourceCityId) throws Exception {
		if(isCitiesDataExist(request))
			return getCityById(request, sourceCityId);

		return CityDao.getInstance().findCityByCityId(sourceCityId);
	}

	public ValueObject getWayBillTypeData(final HttpServletRequest request) {
		ValueObject			valueObject		= null;

		try {
			valueObject		= (ValueObject) getContextAttribute(request, WAY_BILL_TYPE);

			if(valueObject == null) {
				cacheAllLRTypeData(request);
				valueObject		= (ValueObject) getContextAttribute(request, WAY_BILL_TYPE);
			}
		} catch (final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
		}

		return valueObject;
	}

	public WayBillType getWayBillTypeById(final HttpServletRequest request, final long wayBillTypeId) throws Exception {
		final var wayBillType = getWayBillTypeData(request);
		return (WayBillType) wayBillType.get(Long.toString(wayBillTypeId));
	}

	public PackingTypeMaster getPackingTypeMasterById(final HttpServletRequest request, final long packingTypeMasterId) throws Exception {
		final var packingTypeMaster = getPackingTypeMasterData(request);
		return (PackingTypeMaster) packingTypeMaster.get(Long.toString(packingTypeMasterId));
	}

	public ArticleTypeMaster getArticleTypeMasterById(final HttpServletRequest request, final long articleTypeMasterId) {
		final var articleTypeMaster = getArticleTypeMasterData(request);
		return articleTypeMaster.get(articleTypeMasterId);
	}

	public AccountGroup getAccountGroupById(final HttpServletRequest request, final long accountGroupId) throws Exception {
		final var groupdata = getAccountGroupDataById(request, accountGroupId);

		var	accountGroup	= (AccountGroup) groupdata.get(ACCOUNT_GROUP);

		if(accountGroup == null)
			accountGroup	= refreshAccountGroup(request, accountGroupId);

		return accountGroup;
	}

	private AccountGroup refreshAccountGroup(final HttpServletRequest request, final long accountGroupId) {
		AccountGroup		accountGroup	= null;

		try {
			final var groupData = getAccountGroupDataById(request, accountGroupId);

			accountGroup	= AccountGroupDao.getInstance().findByAccountGroupId(accountGroupId);
			groupData.put(ACCOUNT_GROUP, accountGroup);

			setContextAttribute(request, "IsAgentGroup" + accountGroup.getAccountGroupId(), accountGroup.isAgentGroup());
		} catch (final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
		}

		return accountGroup;
	}

	public ValueObject getChargeTypeMasterData(final HttpServletRequest request) {
		ValueObject				valueObject		= null;

		try {
			valueObject		= (ValueObject) getContextAttribute(request, CHARGE_TYPE_MASTER);

			if(valueObject == null)  {
				cacheAllChargeTypeMasterData(request);
				valueObject		= (ValueObject) getContextAttribute(request, CHARGE_TYPE_MASTER);
			}
		} catch (final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
		}

		return valueObject;
	}

	public ChargeTypeMaster getChargeTypeMasterById(final HttpServletRequest request, final long chargeTypeMasterId) throws Exception {
		final var chargeTypeMasterVal = getChargeTypeMasterData(request);
		return (ChargeTypeMaster) chargeTypeMasterVal.get(Long.toString(chargeTypeMasterId));
	}

	@SuppressWarnings("unchecked")
	public Map<Long, TaxMaster> getTaxMasterData(final HttpServletRequest request) {
		Map<Long, TaxMaster>				valueObject		= null;

		try {
			valueObject		= (Map<Long, TaxMaster>) getContextAttribute(request, TAX_MASTER);

			if(valueObject == null) {
				cacheAllTaxMasterData(request);
				valueObject		= (Map<Long, TaxMaster>) getContextAttribute(request, TAX_MASTER);
			}
		} catch (final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
		}

		return valueObject;
	}

	public TaxMaster getTaxMasterById(final HttpServletRequest request, final long taxMasterId) throws Exception {
		final var taxMasterResult = getTaxMasterData(request);
		return taxMasterResult.get(taxMasterId);
	}

	public TaxModel getTaxMasterForGroupByTaxMasterId(final HttpServletRequest request, final Executive executive, final long taxMasterId) throws Exception {
		final var 		taxes 		= getTaxes(request, executive);

		if(taxes != null)
			return taxes.stream().filter(e -> e.getTaxMasterId() == taxMasterId).findFirst().orElse(null);

		return null;
	}

	public Map<String, List<TaxModel>> getTaxMasterForGroupDataHM(final HttpServletRequest request, final Executive executive) throws Exception {
		try {
			final var 		taxArr 		= getTaxes(request, executive);

			if(ObjectUtils.isEmpty(taxArr))
				return Collections.emptyMap();

			Map<String, List<TaxModel>>	taxModelListHm 	= MapUtils.groupByClassifier(taxArr, t -> t.getTransportationCategoryId() > 0, TaxModel::getTransportCategoryIdWithGroupId);

			if(taxModelListHm.isEmpty())
				taxModelListHm 	= MapUtils.groupByClassifier(taxArr, t -> t.getTransportationModeId() > 0, TaxModel::getTransportModeIdWithGroupId);

			if(taxModelListHm.isEmpty())
				taxModelListHm 	= MapUtils.groupByClassifier(taxArr, t -> t.getTaxTypeId() > 0, TaxModel::getTaxTypeIdWithGroupId);

			if(taxModelListHm.isEmpty())
				taxModelListHm	= taxArr.stream().collect(Collectors.groupingBy(TaxModel::getMasterIdWithGroupId));

			if(ObjectUtils.isEmpty(taxModelListHm))
				return Collections.emptyMap();

			return taxModelListHm;
		} catch(final Exception e){
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public VehicleNumberMaster[] getVehicleNumber(final HttpServletRequest request, final long accountGroupId) throws Exception {
		try {
			final var	vnMasters 	= getAllVehicleNumberList(request, accountGroupId);

			if(ObjectUtils.isNotEmpty(vnMasters)) {
				final var	vehicleColl	= ListFilterUtility.filterList(vnMasters, e-> !e.isMarkForDelete() && (e.getRoutingType() == VehicleNumberMaster.ROUTE_TYPE_ROUTING
						|| e.getRoutingType() == VehicleNumberMaster.ROUTE_TYPE_ROUTING_AND_LOCAL));

				final var	finalVM = new VehicleNumberMaster[vehicleColl.size()];
				vehicleColl.toArray(finalVM);

				return finalVM;
			}

			return null;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public long getVehicleNumberIdByNumber(final HttpServletRequest request, final long accountGroupId, final String vehicleNumber) throws Exception {
		try {
			final var	vnMasters 	= getVehicleNumber(request, accountGroupId);

			if(ObjectUtils.isNotEmpty(vnMasters)) {
				final var	vehMaster = ListFilterUtility.findFirstItemOrNull(Arrays.asList(vnMasters), e -> StringUtils.equalsIgnoreCase(e.getVehicleNumber(), vehicleNumber));

				return vehMaster != null ? vehMaster.getVehicleNumberMasterId() : 0;
			}

			return 0;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private VehicleNumberMaster[] getALLVehicleNumber(final HttpServletRequest request, final long accountGroupId) throws Exception {
		final var groupData = getAccountGroupDataById(request, accountGroupId);
		var vehicleNumberMasters	= (VehicleNumberMaster[]) groupData.get(VEHICLE_NUMBER_MASTERS);

		if(vehicleNumberMasters == null)
			vehicleNumberMasters	= refreshCacheForVehicleNumberMaster(request, accountGroupId);

		return vehicleNumberMasters;
	}

	public List<VehicleNumberMaster> getAllVehicleNumberList(final HttpServletRequest request, final long accountGroupId) throws Exception {
		final var 	vehicleNumberMasters	= getALLVehicleNumber(request, accountGroupId);

		if(vehicleNumberMasters == null)
			return Collections.emptyList();

		return Arrays.asList(vehicleNumberMasters);
	}

	public HashMap<Long, VehicleNumberMaster> getALLVehicleNumberOfGroup(final HttpServletRequest request, final long accountGroupId) throws Exception {
		try {
			final var 	vehicleNumberMasters 	= getAllVehicleNumberList(request, accountGroupId);

			if(ObjectUtils.isNotEmpty(vehicleNumberMasters))
				return (HashMap<Long, VehicleNumberMaster>) vehicleNumberMasters.stream()
						.collect(Collectors.toMap(VehicleNumberMaster::getVehicleNumberMasterId, Function.identity(), (e1, e2) -> e1));

			return new HashMap<>();
		} catch (final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
		}

		return new HashMap<>();
	}

	public VehicleNumberMaster getVehicleNumber(final HttpServletRequest request, final long accountGroupId, final long vehicleNumberMasterId) throws Exception {
		VehicleNumberMaster	vnm	= null;

		try {
			final var	vehivHashMap	= getALLVehicleNumberOfGroup(request, accountGroupId);

			if(ObjectUtils.isNotEmpty(vehivHashMap))
				vnm	= vehivHashMap.get(vehicleNumberMasterId);

			if(vnm == null)
				vnm = VehicleNumberMasterDao.getInstance().getVehicleDetailsById(accountGroupId, vehicleNumberMasterId);

			return vnm != null ? vnm : new VehicleNumberMaster();
		} catch (final Exception e) {
			return VehicleNumberMasterDao.getInstance().getVehicleDetailsById(accountGroupId, vehicleNumberMasterId);
		}
	}

	public VehicleNumberMaster getVehicleNumberByNumber(final HttpServletRequest request, final long accountGroupId, final String vehicleNumber) throws Exception {
		try {
			final var	vehivHashMap	= getAllVehicleNumberList(request, accountGroupId);

			if(ObjectUtils.isEmpty(vehivHashMap))
				return null;

			return ListFilterUtility.findFirstItemOrNull(vehivHashMap, e -> StringUtils.equalsIgnoreCase(e.getVehicleNumber(), vehicleNumber));
		} catch (final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
		}

		return null;
	}

	public List<VehicleNumberMaster> getOwnVehicleNumberList(final HttpServletRequest request, final long accountGroupId, final long id, final short typeId) throws Exception {
		try {
			final var	vehivHashMap	= getAllVehicleNumberList(request, accountGroupId);

			if(ObjectUtils.isEmpty(vehivHashMap))
				return Collections.emptyList();

			return ListFilterUtility.filterList(vehivHashMap, e -> e.getVehicleOwner() == TransportCommonMaster.OWN_VEHICLE_ID
					&& (typeId == TransportCommonMaster.DATA_LEVEL_REGION_ID && e.getAllotedRegionId() == id
					|| typeId == TransportCommonMaster.DATA_LEVEL_SUB_REGION_ID && e.getAllotedSubRegionId() == id
					|| typeId == TransportCommonMaster.DATA_LEVEL_BRANCH_ID && e.getAllotedBranchId() == id));
		} catch (final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
		}

		return Collections.emptyList();
	}

	public CityForGroup getCityForGroupObj(final HttpServletRequest request, final long accountGroupId, final long cityId) throws Exception {
		try {
			final var	cityForGroup = getAllCitiesForGroup(request, accountGroupId);

			for (final CityForGroup aCityForGroup : cityForGroup)
				if(aCityForGroup.getCityId() == cityId)
					return aCityForGroup;

			return CityForGroupDao.getInstance().findByCityIdAndAccountGroupId(cityId, accountGroupId);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public CityForGroup[] getAllCitiesForGroup(final HttpServletRequest request, final long accountGroupId) throws Exception {
		try {
			final var	groupData = getAccountGroupDataById(request, accountGroupId);

			var	cityForGroups	= (CityForGroup[]) groupData.get(CITY_FOR_GROUP);

			if(cityForGroups == null)
				cityForGroups	= refreshCacheForCityForGroup(request, accountGroupId);

			return cityForGroups;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public HashMap<Long, CityForGroup> getAllCitiesForGroupHM(final HttpServletRequest request, final long accountGroupId) throws Exception {
		try {
			final var	cityForGroupHM		= new HashMap<Long,CityForGroup>();

			final var	cityForGroup = getAllCitiesForGroup(request, accountGroupId);

			if(cityForGroup != null && cityForGroup.length > 0)
				for (final CityForGroup aCityForGroup : cityForGroup)
					cityForGroupHM.put(aCityForGroup.getCityId(), aCityForGroup);

			return cityForGroupHM;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public VehicleType getVehicleType(final HttpServletRequest request, final long accountGroupId, final long vehicleTypeId) throws Exception {
		final var 	vehicleTypes 	= getVehicleTypeForGroup(request, accountGroupId);

		for (final VehicleType vehicleType : vehicleTypes)
			if(vehicleType.getVehicleTypeId() == vehicleTypeId)
				return vehicleType;

		return null;
	}

	public Region getRegionByIdAndGroupId(final HttpServletRequest request, final long regionId, final long accountGroupId) throws Exception {
		final var regionForGroup = getRegionsByGroupId(request, accountGroupId);
		return Stream.of(regionForGroup).filter(e -> e.getRegionId() == regionId).findFirst().orElse(new Region());
	}

	// Do Not Use For Report Purpose Because Of Mark For Delete
	public Region[] getRegionsByGroupId(final HttpServletRequest request, final long accountGroupId) throws Exception {
		final var groupData = getAccountGroupDataById(request, accountGroupId);

		var	regions	= (Region[]) groupData.get(REGION_FOR_GROUP);

		if(regions == null)
			regions	= refreshCacheForRegion(request, accountGroupId);

		return regions;
	}

	public SubRegion[] getSubRegionsByGroupId(final HttpServletRequest request, final long accountGroupId) throws Exception {
		final var groupData = getAccountGroupDataById(request, accountGroupId);

		var subRegionForGroup	= (SubRegion[]) groupData.get("subRegionForGroup");

		if(subRegionForGroup == null)
			subRegionForGroup	= refreshCacheForSubRegion(request, accountGroupId);

		return subRegionForGroup;
	}

	public SubRegion[] getSubRegionsByGroupId(final HttpServletRequest request, final long accountGroupId, final boolean showGroupMergingBranchData) throws Exception {
		if (showGroupMergingBranchData)
			return getSubRegionsFromAccountGroupNetworkConfig(request, accountGroupId);

		return getSubRegionsByGroupId(request, accountGroupId);
	}

	public SubRegion getSubRegionByIdAndGroupId(final HttpServletRequest request, final long subRegionId, final long accountGroupId) throws Exception {
		final var subRegionForGroup = getSubRegionsByGroupId(request, accountGroupId);
		return Stream.of(subRegionForGroup).filter(e -> e.getSubRegionId() == subRegionId).findFirst().orElse(new SubRegion());
	}

	public ValueObject getAllRegions(final HttpServletRequest request) throws Exception {
		try {
			var	valueObject = (ValueObject) getContextAttribute(request, REGIONS);

			if(valueObject == null) {
				refreshGenericRegionCache(request);
				valueObject = (ValueObject) getContextAttribute(request, REGIONS);
			}

			return valueObject;
		} catch(final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private boolean isRegionsDataExist(final HttpServletRequest request) {
		return (ValueObject) getContextAttribute(request, REGIONS) != null;
	}

	public ValueObject getAllSubRegions(final HttpServletRequest request) throws Exception {
		try {
			var	subRegions	= (ValueObject) getContextAttribute(request, SUB_REGIONS);

			if(subRegions == null) {
				refreshGenericSubRegionCache(request);
				subRegions	= (ValueObject) getContextAttribute(request, SUB_REGIONS);
			}

			return subRegions;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private boolean isSubRegionDataExist(final HttpServletRequest request) {
		return (ValueObject) getContextAttribute(request, SUB_REGIONS) != null;
	}

	public SubRegion getGenericSubRegionById(final HttpServletRequest request, final long subRegionId) throws Exception {
		try {
			final var subRegions	= getAllSubRegions(request);

			var	subRegion	= (SubRegion) subRegions.get(subRegionId);

			if(subRegion == null) {
				subRegion	= SubRegionDao.getInstance().getSubRegionById(subRegionId);
				subRegions.put(subRegionId, subRegion);
			}

			return subRegion;
		} catch (final Exception e) {
			return SubRegionDao.getInstance().getSubRegionById(subRegionId);
		}
	}

	public SubRegion getSubRegionAtLoginTime(final HttpServletRequest request, final long subRegionId) throws Exception {
		if(isSubRegionDataExist(request))
			return getGenericSubRegionById(request, subRegionId);

		return SubRegionDao.getInstance().getSubRegionById(subRegionId);

	}

	public Region getGenericRegionById(final HttpServletRequest request, final long regionId) throws Exception {
		try {
			final var regions	= getAllRegions(request);

			var	region	= (Region) regions.get(regionId);

			if(region == null) {
				region	= RegionDao.getInstance().getRegion(regionId);
				regions.put(regionId, region);
			}

			return region;
		} catch (final Exception e) {
			return RegionDao.getInstance().getRegion(regionId);
		}
	}

	public Region getRegionAtLoginTime(final HttpServletRequest request, final long regionId) throws Exception {
		if(isRegionsDataExist(request))
			return getGenericRegionById(request, regionId);

		return RegionDao.getInstance().getRegion(regionId);
	}

	public SubRegion[] getSubRegionsByRegionId(final HttpServletRequest request, final long regionId, final long accountGroupId) throws Exception {
		final var subRegionForGroup = getSubRegionsByGroupId(request, accountGroupId);

		if(subRegionForGroup == null)
			return new SubRegion[0];

		final List<SubRegion> subRegionsArr = ListFilterUtility.filterList(Arrays.asList(subRegionForGroup), s -> s.getRegionId() == regionId);

		return subRegionsArr.toArray(new SubRegion[subRegionsArr.size()]);
	}

	public SubRegion[] getActiveSubRegionsByRegionId(final HttpServletRequest request, final long regionId, final long accountGroupId) throws Exception {
		final var subRegionForGroup = getSubRegionsByRegionId(request, regionId, accountGroupId);

		final List<SubRegion> subRegionsArr = ListFilterUtility.filterList(Arrays.asList(subRegionForGroup), s -> !s.isMarkForDelete());

		return subRegionsArr.toArray(new SubRegion[subRegionsArr.size()]);
	}

	public Map<String, String> getBranchAndCityWiseDestinationByNameAndGroupId(final HttpServletRequest request, final String str, final long accountGroupId, final int branchType, final long locationId, final boolean isOwnGroupBranchesRequired, final boolean setAutocompleteOnInitialChar) throws Exception {
		try {
			final var	allGroupBranches 	= getAllActiveGroupBranchesList(request, accountGroupId);
			final var	branchCollection	= getGroupBranchCollection(request, locationId);
			final var 	subRegions			= getAllSubRegions(request);

			List<Branch> filteredList	= ListFilterUtility.filterList(allGroupBranches, branch -> setAutocompleteOnInitialChar && StringUtils.startsWith(StringUtils.lowerCase(branch.getName()), StringUtils.lowerCase(str))
					|| !setAutocompleteOnInitialChar && StringUtils.contains(StringUtils.lowerCase(branch.getName()), StringUtils.lowerCase(str)));

			filteredList	= filterBranchTypeWiseList(branchType, filteredList, branchCollection, isOwnGroupBranchesRequired);

			final Map<String, String>	destinationList 	= new TreeMap <>();

			for (final Branch branch : filteredList) {
				final var	genericBranch	= getGenericBranchDetailCache(request, branch.getBranchId());

				if(genericBranch != null) {
					final var	actualAccountGroupId = genericBranch.getAccountGroupId();
					destinationList.put(getBranchWithSubregionName(subRegions, branch), getDestinationIdStrWithLocation(branch) + "_" + actualAccountGroupId + "_" + branch.getBranchCode() + "_" + branch.getSubRegionId() + "_" + branch.getPincode() + "_" + branch.getRegionId() + "_" + branch.isAgentBranch() + "_" + branch.getGstn());
				}
			}

			return destinationList;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public Map<String, String> getDestinationListFromBranchNetworkConfigByBranchName(final HttpServletRequest request, final String str, final Branch branch) throws Exception {
		try {
			final Map<String, String>	destinationList 				 = new TreeMap<>();

			if(StringUtils.contains(StringUtils.lowerCase(branch.getName()), StringUtils.lowerCase(str)))
				destinationList.put(getDestinationBranchesWithSubRegion(request, branch), getDestinationIdStrWithLocation(branch) + "_" + branch.getAccountGroupId() + "_" + branch.getBranchCode() + "_" + branch.getSubRegionId( ) + "_" + branch.getPincode() + "_" + branch.getRegionId() + "_" + branch.isAgentBranch());

			return destinationList;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public Map<String, String> getDestinationListFromBranchNetworkConfigByBranchAndSubregionName(final HttpServletRequest request, final String str, final Branch branch) throws Exception {
		try {
			final Map<String, String>	destinationList 				 = new TreeMap<>();
			final var	destinationBranchesWithSubRegion = getDestinationBranchesWithSubRegion(request, branch);

			if(StringUtils.contains(StringUtils.lowerCase(destinationBranchesWithSubRegion), StringUtils.lowerCase(str)))
				destinationList.put(destinationBranchesWithSubRegion, getDestinationIdStrWithLocation(branch) + "_" + branch.getAccountGroupId() + "_" + branch.isAgentBranch());

			return destinationList;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	@SuppressWarnings("unchecked")
	private List<BranchNetWorkConfiguration> getBranchDataWiseBranchNetworkConfig(final HttpServletRequest request, final long branchId) throws Exception {
		try {
			final var	branchData				= getBranchData(request, branchId);

			var	branchNetworkConfigList = (List<BranchNetWorkConfiguration>) branchData.get(BRANCH_NETWORK_CONFIG);

			if(branchNetworkConfigList == null) {
				branchNetworkConfigList = BranchNetWorkConfigurationDao.getInstance().findByConfigBranchId(branchId);
				branchData.put(BRANCH_NETWORK_CONFIG, branchNetworkConfigList);
			}

			return branchNetworkConfigList;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public Map<String, String> getDestinationBranchListByBranchName(final HttpServletRequest request, final String str, final long branchId) throws Exception {
		try {
			final var	branchNetworkConfigList = getBranchDataWiseBranchNetworkConfig(request, branchId);

			final Map<String, String>	destinationList			= new TreeMap<>();

			if(branchNetworkConfigList != null)
				for(final BranchNetWorkConfiguration branchNetworkConfig : branchNetworkConfigList) {
					final var branch = getGenericBranchDetailCache(request, branchNetworkConfig.getAssignBranchId());

					if(isActiveBranch(branch))
						destinationList.putAll(getDestinationListFromBranchNetworkConfigByBranchName(request, str, branch));
				}

			return destinationList;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private boolean isActiveBranch(final Branch branch) {
		return branch != null && branch.getStatus() == Branch.BRANCH_ACTIVE && !branch.isMarkForDelete();
	}

	public Map<String, String> getDestinationBranchListByBranchAndSubregionName(final HttpServletRequest request, final String str, final long branchId) throws Exception {
		try {
			final var	branchNetworkConfigList = getBranchDataWiseBranchNetworkConfig(request, branchId);

			final Map<String, String>	destinationList 		= new TreeMap <>();

			if(branchNetworkConfigList != null)
				for(final BranchNetWorkConfiguration branchNetworkConfig : branchNetworkConfigList) {
					final var branch = getGenericBranchDetailCache(request, branchNetworkConfig.getAssignBranchId());

					if(isActiveBranch(branch))
						destinationList.putAll(getDestinationListFromBranchNetworkConfigByBranchAndSubregionName(request, str, branch));
				}

			return destinationList;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public Map<String, String> getDestinationBranchListByBranchAndCityName(final HttpServletRequest request, final String str, final long branchId, final boolean isDestinationCityWithBranches) throws Exception {
		try {
			final var	branchNetworkConfigList = getBranchDataWiseBranchNetworkConfig(request, branchId);
			final Map<String, String>	destinationList 		= new TreeMap <>();

			if(branchNetworkConfigList != null)
				for(final BranchNetWorkConfiguration branchNetworkConfig : branchNetworkConfigList) {
					final var branch = getGenericBranchDetailCache(request, branchNetworkConfig.getAssignBranchId());

					if(isActiveBranch(branch))
						destinationList.putAll(getDestinationListFromBranchNetworkConfigByBranchAndCityName(request, str, branch, isDestinationCityWithBranches));
				}

			return destinationList;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public Map<String, String> getDestinationBranchListByBranchAndPinCode(final HttpServletRequest request, final String str, final long branchId) throws Exception {
		try {
			final var	branchNetworkConfigList = getBranchDataWiseBranchNetworkConfig(request, branchId);

			final Map<String, String>	destinationList 		= new TreeMap <>();

			if(branchNetworkConfigList != null)
				for(final BranchNetWorkConfiguration branchNetworkConfig : branchNetworkConfigList) {
					final var branch = getGenericBranchDetailCache(request, branchNetworkConfig.getAssignBranchId());

					if(isActiveBranch(branch))
						destinationList.putAll(getDestinationListFromBranchNetworkConfigByBranchAndPinCode(request, str, branch));
				}

			return destinationList;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public Map<String, String> getDestinationListFromBranchNetworkConfigByBranchAndCityName(final HttpServletRequest request, final String str, final Branch branch, final boolean isDestinationCityWithBranches) throws Exception {
		try {
			final Map<String, String>	destinationList 				 = new TreeMap<>();
			final var	destinationBranchesWithCity		 =  isDestinationCityWithBranches ? getDestinationCityWithBranches(request, branch) : getDestinationBranchesWithCity(request, branch);

			if(StringUtils.contains(StringUtils.lowerCase(destinationBranchesWithCity), StringUtils.lowerCase(str)))
				destinationList.put(destinationBranchesWithCity, getDestinationIdStrWithLocation(branch) + "_" + branch.getAccountGroupId());

			return destinationList;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public Map<String, String> getDestinationListFromBranchNetworkConfigByBranchAndPinCode(final HttpServletRequest request, final String str, final Branch branch) throws Exception {
		try {
			final Map<String, String>	destinationList 				 = new TreeMap<>();
			final var	branchPincodeList				 = getBranchPincodesByBranch(request, branch.getAccountGroupId(), branch.getBranchId());

			if(branchPincodeList != null && !branchPincodeList.isEmpty())
				branchPincodeList.stream().filter(brPincodeList -> brPincodeList.getMarkForDelete() != null && !brPincodeList.getMarkForDelete()).forEach(brPincodeList -> {
					final var destinationBranchesWithPinCode 	= branch.getName() + " ( " + brPincodeList.getPincode() + " )";

					if(StringUtils.contains(StringUtils.lowerCase(destinationBranchesWithPinCode), StringUtils.lowerCase(str)))
						destinationList.put(destinationBranchesWithPinCode, getDestinationIdStrWithLocation(branch) + "_" + branch.getAccountGroupId() + "_" + branch.getBranchCode() + "_" + branch.getSubRegionId() + "_" + brPincodeList.getPincode());
				});
			else {
				final var	destinationBranchesWithSubRegion = getDestinationBranchesWithSubRegion(request, branch);

				if(StringUtils.contains(StringUtils.lowerCase(branch.getName()), StringUtils.lowerCase(str)))
					destinationList.put(destinationBranchesWithSubRegion, getDestinationIdStrWithLocation(branch) + "_" + branch.getAccountGroupId());
			}

			return destinationList;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public HashMap<Long, Branch> getAssignedBranchListByAssignedAccountGroupId(final HttpServletRequest request, final long configAccountGroupId, final long assignBranchAccountGroupId) throws Exception {
		try {
			final var	accountGroupNetworkList = getAllAccountGroupNetworkConfig(request);
			final var	assignedBranchHM		= new HashMap<Long, Branch>();

			if(ObjectUtils.isNotEmpty(accountGroupNetworkList))
				for(final AccountGroupNetworkConfiguration accountGroupNetworkConfig : accountGroupNetworkList)
					if(accountGroupNetworkConfig.getConfigAccountGroupId() == configAccountGroupId
					&& accountGroupNetworkConfig.getAssignBranchAccountGroupId() == assignBranchAccountGroupId) {
						final var branch = getGenericBranchDetailCache(request, accountGroupNetworkConfig.getAssignBranchId());

						if(isActiveBranch(branch))
							assignedBranchHM.put(branch.getBranchId(), branch);
					}

			return assignedBranchHM;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public Map<String, String> getAgentBranchDetailsByBranchChar(final HttpServletRequest request, final String str, final long accountGroupId) throws Exception {
		try {
			final var	allGroupBranches 	= getAllActiveGroupBranchesList(request, accountGroupId);
			final Map<String, String>	destinationList 	= new TreeMap <>();

			final List<Branch> filteredBranchList	= ListFilterUtility.filterList(allGroupBranches, branch -> branch.isAgentBranch()
					&& branch.getTypeOfLocation() == Branch.TYPE_OF_LOCATION_PHYSICAL
					&& StringUtils.contains(StringUtils.lowerCase(branch.getName()), StringUtils.lowerCase(str)));

			filteredBranchList.forEach((final Branch branch) -> destinationList.put(branch.getName(), branch.getBranchId() + "_" + Branch.getBranchType(branch.getBranchType()) + "_" + branch.getBranchType()));

			return destinationList;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public Map<String, String> getAssignedLocations(final HttpServletRequest request, final String str, final long accountGroupId, final long locationId) throws Exception {
		try {
			final var	allGroupBranches 	= getAllActiveGroupBranchesList(request, accountGroupId);
			final var	assignedLocationList = getAssignedLocationsIdListByLocationIdId(request, locationId, accountGroupId);
			final Map<String, String>	destinationList 	 = new TreeMap <>();

			final var	subRegions	= getAllSubRegions(request);

			final List<Branch> filteredBranchList	= ListFilterUtility.filterList(allGroupBranches, branch -> StringUtils.contains(StringUtils.lowerCase(branch.getName()), StringUtils.lowerCase(str))
					&& assignedLocationList.contains(branch.getBranchId()) || branch.getBranchId() == locationId);

			for(final Branch branch : filteredBranchList)
				destinationList.put(getBranchWithSubregionName(subRegions, branch), getDestinationIdStrWithLocation(branch));

			return destinationList;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	/*
	 * Created in CacheDataImpl.java
	 */
	public LinkedHashMap<String, String> getCrossingHubsByNameAndGroupId(final HttpServletRequest request, final String str, final long accountGroupId, final String otherBranchIds,final long branchid ) throws Exception {
		try {
			final var	otherBranchIdsList	= CollectionUtility.getLongListFromString(otherBranchIds);

			final var 	branchList			= getAllActiveGroupBranchesList(request, accountGroupId);
			final var	branchCollection	= getGroupBranchCollection(request, branchid);
			final var 	subRegions			= getAllSubRegions(request);

			final List<Branch> filteredBranchList	= ListFilterUtility.filterList(branchList, branch -> StringUtils.contains(StringUtils.lowerCase(branch.getName()), StringUtils.lowerCase(str))
					&& (branch.isCrossingHub() || otherBranchIdsList.contains(branch.getBranchId()))
					&& (branch.getMappingTypeId() == Branch.BRANCH_MAP_ID_OWN_BRANCH_AND_ASSIGNED || branch.getMappingTypeId() == Branch.BRANCH_MAP_ID_NOT_OWN_BRANCH_AND_ASSIGNED && branchCollection != null && branchCollection.contains(branch.getBranchId())));

			final var	destinationList 	= new LinkedHashMap <String, String>();

			for(final Branch branch : filteredBranchList)
				destinationList.put(getBranchWithSubregionName(subRegions, branch), getDestinationIdStr(branch));

			return destinationList;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private String getBranchWithSubregionName(final ValueObject subRegions, final Branch br) throws Exception {
		var	subRegion	= (SubRegion) subRegions.get(br.getSubRegionId());

		if(subRegion == null) {
			subRegion	= SubRegionDao.getInstance().getSubRegionById(br.getSubRegionId());
			subRegions.put(br.getSubRegionId(), subRegion);
		}

		if(subRegion != null && subRegion.getName() != null)
			return br.getName() + " ( " + StringUtils.upperCase(subRegion.getName()) + " )";

		return br.getName();
	}

	private String getBranchWithSubregionName(final SubRegion subRegion, final Branch br) {
		if(subRegion != null && subRegion.getName() != null)
			return br.getName() + " ( " + StringUtils.upperCase(subRegion.getName()) + " )";

		return br.getName();
	}

	public LinkedHashMap <String, String> getSourceDetails(final HttpServletRequest request, final String str, final Executive executive) throws Exception {
		try {
			final var	allGroupBranches 	= getAllActiveGroupBranchesList(request, executive.getAccountGroupId());
			final var 	subRegions			= getAllSubRegions(request);

			final var	execFldPermissions = getExecutiveFieldPermission(request);

			var	counter		= 0;
			var	applyType	= 0L;

			if(execFldPermissions.get(FeildPermissionsConstant.OWN_SUB_BRANCH_MANUAL) != null) {
				counter++;
				applyType = FeildPermissionsConstant.OWN_SUB_BRANCH_MANUAL;
			}

			if(execFldPermissions.get(FeildPermissionsConstant.OWN_BRANCH_MANUAL) != null) {
				counter++;
				applyType = FeildPermissionsConstant.OWN_BRANCH_MANUAL;
			}

			if(execFldPermissions.get(FeildPermissionsConstant.OPEN_MANUAL) != null) {
				counter++;
				applyType = FeildPermissionsConstant.OPEN_MANUAL;
			}

			if(counter <= 0)
				return null;

			if(counter >= 2)
				applyType = FeildPermissionsConstant.OWN_SUB_BRANCH_MANUAL;

			final var	destinationList = new LinkedHashMap <String, String>();

			List<Branch> filteredList	= ListFilterUtility.filterList(allGroupBranches, branch -> StringUtils.contains(StringUtils.lowerCase(branch.getName()), StringUtils.lowerCase(str)));

			if(applyType == FeildPermissionsConstant.OWN_SUB_BRANCH_MANUAL)
				filteredList	= ListFilterUtility.filterList(allGroupBranches, branch -> executive.getBranchId() == branch.getBranchId());
			else if(applyType == FeildPermissionsConstant.OWN_BRANCH_MANUAL)
				filteredList	= ListFilterUtility.filterList(allGroupBranches, branch -> executive.getSubRegionId() == branch.getSubRegionId());

			for(final Branch branch : filteredList)
				destinationList.put(getBranchWithSubregionName(subRegions, branch), getDestinationIdStrWithLocation(branch));

			return destinationList;//plz return always 0 size if no record found
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private boolean isExecutiveTypeWiseBranchData(final Branch branch, final short type, final long id) {
		return type == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN
				|| type == ExecutiveTypeConstant.EXECUTIVE_TYPE_REGIONADMIN && branch.getRegionId() == id
				|| type == ExecutiveTypeConstant.EXECUTIVE_TYPE_SUBREGIONADMIN && branch.getSubRegionId() == id
				|| type == ExecutiveTypeConstant.EXECUTIVE_TYPE_BRANCHADMIN && branch.getBranchId() == id;
	}

	public LinkedHashMap <String, String> getBranchAndCityWiseDestinationByRegionIdOrSubRegionId(final HttpServletRequest request, final String str, final long accountGroupId, final short executiveType, final long id) throws Exception {
		try {
			final var	allGroupBranches 	= getAllGroupBranchesList(request, accountGroupId);
			final var	destinationList 	= new LinkedHashMap<String, String>();

			final var	subRegions	= getAllSubRegions(request);

			final List<Branch>	filteredList	= ListFilterUtility.filterList(allGroupBranches, branch -> StringUtils.contains(StringUtils.lowerCase(branch.getName()), StringUtils.lowerCase(str))
					&& isExecutiveTypeWiseBranchData(branch, executiveType, id));

			for(final Branch branch : filteredList)
				destinationList.put(getBranchWithSubregionName(subRegions, branch), getDestinationIdStr(branch));

			return destinationList;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public LinkedHashMap<String,String> getPhysicalBranchAndCityWiseDestinationByRegionIdOrSubRegionId(final HttpServletRequest request, final String str, final long accountGroupId, final short executiveType, final long id, final short typeOfLocaion, final boolean showPhysicalOrOperationalBothBranch) throws Exception {
		try {
			final var	allGroupBranches 	= getAllGroupBranchesList(request, accountGroupId);
			final var	destinationList 	= new LinkedHashMap <String, String>();

			final var	subRegions	= getAllSubRegions(request);

			final List<Branch>	filteredList	= ListFilterUtility.filterList(allGroupBranches, branch -> StringUtils.contains(StringUtils.lowerCase(branch.getName()), StringUtils.lowerCase(str))
					&& (branch.getTypeOfLocation() == typeOfLocaion || showPhysicalOrOperationalBothBranch)
					&& isExecutiveTypeWiseBranchData(branch, executiveType, id));

			for(final Branch branch : filteredList)
				destinationList.put(getBranchWithSubregionName(subRegions, branch), getDestinationIdStr(branch));

			return destinationList;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private String filterBranchIdsOnDataType(final short type, final long id, final List<Branch> list) throws Exception {
		String		branchesStr	= null;

		try {
			switch (type) {
			case TransportCommonMaster.DATA_GROUP -> branchesStr	= list.stream().map(b -> Long.toString(b.getBranchId())).collect(Collectors.joining(","));
			case TransportCommonMaster.DATA_REGION -> branchesStr	= list.stream().filter(b -> b.getRegionId() == id)
					.map(b -> Long.toString(b.getBranchId())).collect(Collectors.joining(","));
			case TransportCommonMaster.DATA_SUBREGION -> branchesStr	= list.stream().filter(b -> b.getSubRegionId() == id)
					.map(b -> Long.toString(b.getBranchId())).collect(Collectors.joining(","));
			case TransportCommonMaster.DATA_CITY -> branchesStr	= list.stream().filter(b -> b.getCityId() == id)
					.map(b -> Long.toString(b.getBranchId())).collect(Collectors.joining(","));
			case TransportCommonMaster.DATA_AGENCY -> branchesStr	= list.stream().filter(b -> b.getAgencyId() == id)
					.map(b -> Long.toString(b.getBranchId())).collect(Collectors.joining(","));
			default -> {
				break;
			}
			}

			return branchesStr;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public String getBranchesStringById(final HttpServletRequest request, final long accountGroupId, final short type, final long id) throws Exception {
		try {
			final var	allGroupBranches	= getAllGroupBranchesList(request, accountGroupId);

			return filterBranchIdsOnDataType(type, id, allGroupBranches);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public String getSelfBranchesStringById(final HttpServletRequest request, final long accountGroupId, final short type, final long id) throws Exception {
		try {
			final var	allGroupBranches	= getAllGroupBranchesList(request, accountGroupId);
			final List<Branch>	filteredList	= ListFilterUtility.filterList(allGroupBranches, branch -> branch.getMappingTypeId() == Branch.BRANCH_MAP_ID_OWN_BRANCH_AND_ASSIGNED);

			return filterBranchIdsOnDataType(type, id, filteredList);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public HashMap<Long, Branch> getAllActiveBranches(final HttpServletRequest request, final long accountGroupId, final short type, final long id) throws Exception {
		try {
			final var	allGroupBranches	= getAllActiveGroupBranchesList(request, accountGroupId);
			final List<Branch> 	filteredList	= ListFilterUtility.filterList(allGroupBranches, branch -> branch.getTypeOfLocation() == Branch.TYPE_OF_LOCATION_PHYSICAL
					&& isExecutiveTypeWiseBranchData(branch, type, id));

			final var	branches			= new HashMap<Long, Branch>();

			filteredList.forEach((final Branch branch) -> branches.put(branch.getBranchId(), branch));

			return branches;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public String getPhysicalBranchesStringById(final HttpServletRequest request, final long accountGroupId, final short type, final long id) throws Exception {
		try {
			final var	allGroupBranches	= getAllGroupBranchesList(request, accountGroupId);

			final List<Branch> 	filteredList	= ListFilterUtility.filterList(allGroupBranches, branch -> branch.getTypeOfLocation() == Branch.TYPE_OF_LOCATION_PHYSICAL
					&& (!branch.isMarkForDelete() || branch.getStatus() == Branch.BRANCH_DEACTIVE));

			return filterBranchIdsOnDataType(type, id, filteredList);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public Commodity getCommodityDetails(final HttpServletRequest request, final long accountGroupId, final long commodityTypeMasterId) throws Exception {
		final var 	commodities		= getCommodityForGroup(request, accountGroupId);
		Commodity		commodity		= null;

		if(commodities != null)
			commodity	= Stream.of(commodities).filter(wb -> wb.getCommodityId() == commodityTypeMasterId).findFirst().orElse(null);

		return commodity;
	}

	public HashMap<Long, Branch> getCrossingBranches(final HttpServletRequest request, final long accountGroupId) throws Exception {
		try {
			final var	allCrossingBranches = new HashMap<Long, Branch>();
			final var	allGroupBranches	= getAllGroupBranchesList(request, accountGroupId);

			allGroupBranches.stream().filter(Branch::isCrossingHub).forEach(branch -> allCrossingBranches.put(branch.getBranchId(), branch));

			return allCrossingBranches;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public Map<Long, List<MarqueeMaster>> refreshMarqueeMaster(final HttpServletRequest request) throws Exception {
		Map<Long, List<MarqueeMaster>> marqueeHM = null;

		try {
			marqueeHM = MarqueeDao.getInstance().getMarqueesForCache(0, (short) 1);
			setContextAttribute(request, "marqueeHM", marqueeHM);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}

		return marqueeHM;
	}

	@SuppressWarnings("unchecked")
	public Map<Long, List<MarqueeMaster>> getMarquees(final HttpServletRequest request) throws Exception {
		Map<Long, List<MarqueeMaster>> 	marqueeHM 	= null;

		try {
			marqueeHM 	= (Map<Long, List<MarqueeMaster>>) getContextAttribute(request, "marqueeHM");

			if(marqueeHM == null)
				marqueeHM	= refreshMarqueeMaster(request);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}

		return marqueeHM;
	}

	public List<MarqueeMaster> getMarqueeList(final HttpServletRequest request) throws Exception {
		List<MarqueeMaster>				newList		= null;

		try {
			final var	marqueeHM 	= getMarquees(request);
			final var	executive	= getExecutive(request);

			if(marqueeHM != null && !marqueeHM.isEmpty()) {
				newList			= new ArrayList<>();

				for(final Map.Entry<Long, List<MarqueeMaster>> entry : marqueeHM.entrySet()) {
					final long 					key 		= entry.getKey();
					final var 	marqueeList	= entry.getValue();

					for(final MarqueeMaster mq : marqueeList) {
						final var 	marqueeView		= CollectionUtility.getStringListFromString(mq.getMarquee(), "`");

						if(marqueeView.size() >= 2 && (key == 0 || mq.getBranchList().contains(executive.getBranchId()))) {
							final var marquee	= new MarqueeMaster();
							marquee.setMarquee(marqueeView.get(0));
							marquee.setColor(marqueeView.get(1));
							newList.add(marquee);
						}
					}
				}
			}

			return newList;
		} catch(final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public void refreshGenericBranchDetailCache(final HttpServletRequest request) throws Exception {
		try {
			setContextAttribute(request, BRANCHES, BranchDao.getInstance().getAllBranches());
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public void refreshBranchPincodeDetailCache(final HttpServletRequest request) {
		try {
			final var	brArrayList	= BranchPincodeConfigurationDaoImpl.getInstance().getBranchPincodeDataFromPostgres();

			if(ObjectUtils.isNotEmpty(brArrayList))
				setContextAttribute(request, "branchPinCodeHm", brArrayList.stream().collect(Collectors.groupingBy(BranchPincodeConfiguration :: getConfigBranchId)));
		} catch (final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private Map<Long, List<BranchPincodeConfiguration>> refreshBranchPincodeDetailCache(final HttpServletRequest request, final long accountGroupId) throws Exception {
		try {
			final var	brArrayList	= BranchPincodeConfigurationDaoImpl.getInstance().getDataByAssignAccountGroupIdFromPostgres(accountGroupId);

			final var groupData = getAccountGroupDataById(request, accountGroupId);

			if(ObjectUtils.isNotEmpty(brArrayList)) {
				final Map<Long, List<BranchPincodeConfiguration>>	list = brArrayList.stream().collect(Collectors.groupingBy(BranchPincodeConfiguration :: getConfigBranchId));
				groupData.put("branchPinCodeHm", list);
				return list;
			}

			return Collections.emptyMap();
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public Branch getGenericBranchDetailCache(final HttpServletRequest request, final long branchId) throws Exception {
		try {
			final var branches = getGenericBranchesDetail(request);

			var	branch	= (Branch) branches.get(Long.toString(branchId));

			if(branch == null)
				branch	= BranchDao.getInstance().findByBranchId(branchId);

			return branch;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public ValueObject getGenericBranchesDetail(final HttpServletRequest request) throws Exception {
		try {
			var branches	= (ValueObject) getContextAttribute(request, BRANCHES);

			if(branches == null) {
				refreshGenericBranchDetailCache(request);
				branches	= (ValueObject) getContextAttribute(request, BRANCHES);
			}

			return branches;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public LocationsMapping[] getLocationMappingForGroup(final HttpServletRequest request, final long accountGroupId) throws Exception {
		try {
			final var	locationsMappingForGroup	= getLocationMappingListForGroup(request, accountGroupId);

			final var	locationMapArray = new LocationsMapping[locationsMappingForGroup.size()];
			locationsMappingForGroup.toArray(locationMapArray);

			return locationMapArray;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	@SuppressWarnings("unchecked")
	public List<LocationsMapping> getLocationMappingListForGroup(final HttpServletRequest request, final long accountGroupId) throws Exception {
		try {
			final var groupData = getAccountGroupDataById(request, accountGroupId);

			var	locationsMappingForGroup	= (List<LocationsMapping>) groupData.get(LOCATIONS_MAPPING_FOR_GROUP);

			if(locationsMappingForGroup == null)
				locationsMappingForGroup	= refreshCacheForLocationMapping(request, accountGroupId);

			return locationsMappingForGroup;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public List<LocationsMapping> getActiveLocationMappingForGroup(final HttpServletRequest request, final long accountGroupId) throws Exception {
		final var	locationsMappingForGroup	= getLocationMappingListForGroup(request, accountGroupId);

		return ListFilterUtility.filterList(locationsMappingForGroup, e -> !e.isMarkForDelete() && e.getStatus() == LocationsMapping.LOCATION_ACTIVE);
	}

	// Get Single Location Mapping Details (Start) For Transaction
	public LocationsMapping getLocationMappingDetailsByAssignedLocationId(final HttpServletRequest request, final long accountGroupId, final long assignedLocationId) throws Exception {
		final var locationMapArray = getActiveLocationMappingForGroup(request, accountGroupId);

		return getAssignedLocationsMapping(request, ListFilterUtility.filterList(locationMapArray, e -> e.getAssignedLocationId() == assignedLocationId));
	}

	private LocationsMapping getAssignedLocationsMapping(final HttpServletRequest request, final List<LocationsMapping> locationMapArray) throws Exception {
		LocationsMapping locationMap = null;

		if(!locationMapArray.isEmpty()) {
			locationMap	= locationMapArray.get(0);
			setAssignedBranchName(request, locationMap);
		}

		return locationMap;
	}

	// Get Single Location Mapping Details (Start)
	public LocationsMapping getLocationMapping(final HttpServletRequest request, final long accountGroupId, final long assignedLocationId) throws Exception {
		final var locationMapArray = getLocationMappingListForGroup(request, accountGroupId);

		return getAssignedLocationsMapping(request, ListFilterUtility.filterList(locationMapArray, e -> e.getAssignedLocationId() == assignedLocationId));
	}

	public LocationsMapping getActiveLocationMapping(final HttpServletRequest request, final long accountGroupId, final long assignedLocationId) throws Exception {
		final var locationMapArray = getLocationMappingListForGroup(request, accountGroupId);
		final List<LocationsMapping> locationMapList	= ListFilterUtility.filterList(locationMapArray, e -> !e.isMarkForDelete() && e.getAssignedLocationId() == assignedLocationId);

		return getAssignedLocationsMapping(request, locationMapList);
	}

	public ArrayList<LocationsMapping> getAssignedLocationsByLocationIdId(final HttpServletRequest request, final long locationId, final long accountGroupId) throws Exception {
		var assignedLocationArr = getActiveLocationMappingForGroup(request, accountGroupId);
		assignedLocationArr	= ListFilterUtility.filterList(assignedLocationArr, e -> e.getLocationId() == locationId);

		for (final LocationsMapping anAssignedLocationArr : assignedLocationArr)
			setAssignedBranchName(request, anAssignedLocationArr);

		return (ArrayList<LocationsMapping>) assignedLocationArr;
	}

	public HashMap<Long, ArrayList<Long>> getAssignedLocationsByLocationIds(final HttpServletRequest request, final String locationIds, final long accountGroupId) throws Exception {
		final var assignedLocationListHM = new HashMap<Long, ArrayList<Long>>();
		final var assignedLocationArr = getActiveLocationMappingForGroup(request, accountGroupId);
		final var locationIdsArr 	= CollectionUtility.getLongListFromString(locationIds);

		if(!assignedLocationArr.isEmpty())
			locationIdsArr.forEach((final Long aLocationIdsArr) -> assignedLocationArr.stream().filter((final LocationsMapping anAssignedLocationArr) -> anAssignedLocationArr.getLocationId() == aLocationIdsArr)
					.forEach((final LocationsMapping anAssignedLocationArr) -> {
						var	assignedLocationArrList = assignedLocationListHM.get(anAssignedLocationArr.getLocationId());

						if(assignedLocationArrList == null) {
							assignedLocationArrList = new ArrayList<>();
							assignedLocationArrList.add(anAssignedLocationArr.getAssignedLocationId());
							assignedLocationListHM.put(anAssignedLocationArr.getLocationId(), assignedLocationArrList);
						} else
							assignedLocationArrList.add(anAssignedLocationArr.getAssignedLocationId());
					}));

		return assignedLocationListHM;
	}

	private void setAssignedBranchName(final HttpServletRequest request, final LocationsMapping lMapping) throws Exception {
		final var	branch		= getGenericBranchDetailCache(request, lMapping.getAssignedLocationId());
		lMapping.setName(branch != null ? branch.getName() : "");
	}

	public ArrayList<LocationsMapping> getAssignedLocations(final HttpServletRequest request, final long locationId, final long accountGroupId) throws Exception {
		var assignedLocationArr = getLocationMappingListForGroup(request, accountGroupId);
		assignedLocationArr	= ListFilterUtility.filterList(assignedLocationArr, e -> e.getLocationId() == locationId);

		for (final LocationsMapping anAssignedLocationArr : assignedLocationArr)
			setAssignedBranchName(request, anAssignedLocationArr);

		return (ArrayList<LocationsMapping>) assignedLocationArr;
	}

	public ArrayList<Long> getAssignedLocationsIdListByLocationIdId(final HttpServletRequest request, final long locationId, final long accountGroupId) throws Exception {
		var assignedLocationArr = getActiveLocationMappingForGroup(request, accountGroupId);
		assignedLocationArr	= ListFilterUtility.filterList(assignedLocationArr, e -> e.getLocationId() == locationId);

		return (ArrayList<Long>) assignedLocationArr.stream().map(LocationsMapping::getAssignedLocationId).collect(CollectionUtility.getList());
	}

	public ArrayList<Long> getAllAssignedLocationsIdListByLocationIdId(final HttpServletRequest request, final long locationId, final long accountGroupId) throws Exception {
		var assignedLocationArr = getLocationMappingListForGroup(request, accountGroupId);
		assignedLocationArr	= ListFilterUtility.filterList(assignedLocationArr, e -> e.getLocationId() == locationId);

		return (ArrayList<Long>) assignedLocationArr.stream().map(LocationsMapping::getAssignedLocationId).collect(CollectionUtility.getList());
	}

	private List<Branch> branchTypeWiseBranchList(final int branchType, final List<Branch> filteredList) {
		if(branchType == Branch.BRANCH_TYPE_DELIVERY)
			return ListFilterUtility.filterList(filteredList, branch -> branch.getBranchType() == Branch.BRANCH_TYPE_BOOKING_DELIVERY_BOTH || branch.getBranchType() == Branch.BRANCH_TYPE_DELIVERY);

		if(branchType == Branch.BRANCH_TYPE_BOOKING)
			return ListFilterUtility.filterList(filteredList, branch -> branch.getBranchType() == Branch.BRANCH_TYPE_BOOKING_DELIVERY_BOTH || branch.getBranchType() == Branch.BRANCH_TYPE_BOOKING);

		return ListFilterUtility.filterList(filteredList, branch -> branch.getBranchType() == Branch.BRANCH_TYPE_BOOKING_DELIVERY_BOTH);
	}

	/*
	 * This method is Replaced in WebService with method getBranchWiseDestinationByNameWithOutDeliveryPlace() in AutoCompleteBllImpl.java file
	 */
	public LinkedHashMap <String, String> getBranchAndCityWiseDestinationByNameAndGroupIdWithOutDeliveryPlace(final HttpServletRequest request, final String str, final long accountGroupId, final int branchType) throws Exception {
		try {
			final var	allGroupBranches 	= getAllActiveGroupBranchesList(request, accountGroupId);
			final var	destinationList 	= new LinkedHashMap<String, String>();

			final var subRegions	= getAllSubRegions(request);

			List<Branch> filteredList	= ListFilterUtility.filterList(allGroupBranches, branch -> StringUtils.contains(StringUtils.lowerCase(branch.getName()), StringUtils.lowerCase(str)) && branch.getTypeOfLocation() != Branch.TYPE_OF_LOCATION_OPERATIONAL_PLACE);

			filteredList	= branchTypeWiseBranchList(branchType, filteredList);

			for(final Branch branch : filteredList)
				destinationList.put(getBranchWithSubregionName(subRegions, branch), getDestinationIdStr(branch));

			return destinationList;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public List<Branch> getActiveBranchListOnSelection(final HttpServletRequest request, final String str, final long accountGroupId) throws Exception {
		try {
			final var	allGroupBranches 	= getAllActiveGroupBranchesList(request, accountGroupId);

			return ListFilterUtility.filterList(allGroupBranches, b -> StringUtils.contains(StringUtils.lowerCase(b.getName()), StringUtils.lowerCase(str)));
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public LinkedHashMap<Long, String> getDeliveryPlace(final HttpServletRequest request, final String str, final long accountGroupId, final short filter) throws Exception {
		try {
			final var	allGroupBranches 	= getAllActiveGroupBranchesList(request, accountGroupId);

			final var	destinationList 	= new LinkedHashMap<Long, String>();

			List<Branch> filteredList	= ListFilterUtility.filterList(allGroupBranches, branch -> StringUtils.contains(StringUtils.lowerCase(branch.getName()), StringUtils.lowerCase(str)));

			if(filter == 1)
				filteredList	= ListFilterUtility.filterList(filteredList, branch -> branch.getTypeOfLocation() == Branch.TYPE_OF_LOCATION_OPERATIONAL_PLACE);
			else if(filter == 2)
				filteredList	= ListFilterUtility.filterList(filteredList, branch -> branch.getTypeOfLocation() == Branch.TYPE_OF_LOCATION_OPERATIONAL_PLACE
				&& branch.getBranchType() != Branch.BRANCH_TYPE_DELIVERY);

			filteredList.forEach((final Branch branch) -> destinationList.put(branch.getBranchId(), branch.getName()));

			return destinationList;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public LinkedHashMap <Long, String> getDeliveryPlaceAndBranchById(final HttpServletRequest request, final String str, final long accountGroupId, final short filter, final String otherBranchIds) throws Exception {
		try {
			final var	executive			= getExecutive(request);
			final var	configuration		= ReadAllConfigurationsBllImpl.getInstance().getConfigurationData(ModuleIdentifierConstant.CROSSING_AGENT_SOURCE_MASTER, executive.getAccountGroupId());
			final var 	isSourceBranchList	= (boolean) configuration.getOrDefault(CrossingAgentSourceMasterConfigurationConstant.IS_ALL_SOURCE_BRANCH_LIST_DISPLAY, false);

			final var	otherBranchIdsList	= CollectionUtility.getLongListFromString(otherBranchIds);
			final var	allGroupBranches 	= getAllActiveGroupBranchesList(request, accountGroupId);
			final var	destinationList 	= new LinkedHashMap <Long, String>();

			List<Branch> filteredList	= ListFilterUtility.filterList(allGroupBranches, branch -> StringUtils.contains(StringUtils.lowerCase(branch.getName()), StringUtils.lowerCase(str)));

			if(filter == 1)
				filteredList	= ListFilterUtility.filterList(filteredList, branch -> branch.getTypeOfLocation() == Branch.TYPE_OF_LOCATION_OPERATIONAL_PLACE || otherBranchIdsList.contains(branch.getBranchId()));
			else if(filter == 2)
				if(isSourceBranchList)
					filteredList	= ListFilterUtility.filterList(filteredList, branch -> executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN && (branch.getBranchType() != Branch.BRANCH_TYPE_DELIVERY
					|| otherBranchIdsList.contains(branch.getBranchId())));
				else
					filteredList	= ListFilterUtility.filterList(filteredList, branch -> branch.getTypeOfLocation() == Branch.TYPE_OF_LOCATION_OPERATIONAL_PLACE
					&& branch.getBranchType() != Branch.BRANCH_TYPE_DELIVERY || otherBranchIdsList.contains(branch.getBranchId()));

			filteredList.forEach(branch -> destinationList.put(branch.getBranchId(), branch.getName()));

			return destinationList;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	@SuppressWarnings("unchecked")
	public List<CrossingAgentBookingSourceMap> getCrossingAgentBookingSourceMap(final HttpServletRequest request, final long accountGroupId) throws Exception {
		try {
			final var	groupData 					= getAccountGroupDataById(request, accountGroupId);
			var	crossingAgentBookingSourceMapForGroup 	= (List<CrossingAgentBookingSourceMap>) groupData.get(CROSSING_AGENT_BOOKING_SOURCE_MAP_FOR_GROUP);

			if(crossingAgentBookingSourceMapForGroup == null)
				crossingAgentBookingSourceMapForGroup = refreshCacheForCrossingAgentBookingSourceMap(request, accountGroupId);

			return crossingAgentBookingSourceMapForGroup;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}

	}

	public LinkedHashMap <String, String> getCrossingAgentBookingSourceMap(final HttpServletRequest request, final long accountGroupId, final long crossingAgentId, final long branchId, final String str) throws Exception {
		try {
			var	crossingAgentBookingSourceMapForGroup 	= getCrossingAgentBookingSourceMap(request, accountGroupId);
			final var	destinationList = new LinkedHashMap <String, String>();

			if(ObjectUtils.isNotEmpty(crossingAgentBookingSourceMapForGroup)) {
				crossingAgentBookingSourceMapForGroup	= ListFilterUtility.filterList(crossingAgentBookingSourceMapForGroup, e -> e.getBookingCrossingAgentId() == crossingAgentId && e.getBookingBranchId() == branchId
						&& !e.isMarkForDelete() && e.getStatus() == CrossingAgentBookingSourceMap.CROSSING_AGENT_MAPPING_BRANCH_ACTIVE);

				for (final CrossingAgentBookingSourceMap e : crossingAgentBookingSourceMapForGroup) {
					final var	branch = getGenericBranchDetailCache(request, e.getBookingLocationId());

					if(isActiveBranch(branch) && StringUtils.contains(StringUtils.lowerCase(branch.getName()), StringUtils.lowerCase(str))) {
						final var	destination = branch.getName() + " ( " + getCityById(request, branch.getCityId()).getName() + " )";
						destinationList.put(destination, getDestinationIdStr(branch));
					}
				}
			}

			return destinationList;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private String getDestinationIdStr(final Branch branch) {
		return branch.getBranchId() + "_" + branch.getCityId() + "_" + branch.getStateId();
	}

	public String getDestinationIdStrWithLocation(final Branch branch) {
		return getDestinationIdStr(branch) + "_" + branch.getTypeOfLocation();
	}

	public ValueObject getGroupWiseLRCostConfiguration(final HttpServletRequest request, final long accountGroupId) throws Exception {
		return getOldConfiguration(request, accountGroupId, ModuleIdentifierConstant.LR_COST);
	}

	private String getConfigKey(final int key) {
		return switch (key) {
		case PropertiesFileConstants.CASH_STATEMENT_REPORT -> CashStatementConfigurationDTO.CASH_STATEMENT_CONFIGURATION;
		case PropertiesFileConstants.BANK_STATEMENT_CONFIG -> BankStatementConfigurationDTO.BANK_STATEMENT_CONFIGURATION;
		case PropertiesFileConstants.LS_LOAD_CONFIG -> LsConfigurationDTO.LS_CONFIGURATION;
		case PropertiesFileConstants.DOCUMENT_CODE_CONFIG -> DocumentCodeConfigurationDTO.DOCUMENT_CODE_CONFIGURATION;
		case PropertiesFileConstants.MODULE_WISE_MIN_DATE_SELECTION_CONFIG -> ModuleWiseMinDateSelectionConfigurationDTO.MODULE_WISE_MIN_DATE_SELECTION_CONFIGURATION;
		case PropertiesFileConstants.REPORT_WISE_MIN_DATE_SELECTION_CONFIG -> ReportWiseMinDateSelectionConfigurationDTO.REPORT_WISE_MIN_DATE_SELECTION_CONFIGURATION;
		case PropertiesFileConstants.MODULE_WISE_DISCOUNT_LIMIT_CONFIG -> ModuleWiseDiscountLimitConfigurationDTO.MODULE_WISE_DISCOUNT_LIMIT_CONFIGURATION;
		case PropertiesFileConstants.DASH_BOARD_CONFIG -> DashBoardConfigurationDTO.DASH_BOARD_CONFIGURATION;
		case PropertiesFileConstants.COMMON_REPORTS_CONFIG -> CommonReportsConfigurationDTO.COMMON_REPORTS_CONFIGURATION;
		default -> null;
		};
	}

	public ValueObject getOldConfiguration(final HttpServletRequest request, final long accountGroupId, final int key) throws Exception {
		try {
			final var	groupdata 	= getAccountGroupDataById(request, accountGroupId);
			final var 	configName	= getConfigKey(key);
			var	configuration	= (ValueObject) groupdata.get(configName);

			if(configuration == null) {
				configuration	= getConfiguration(accountGroupId, key);
				groupdata.put(configName, configuration);
			}

			return configuration;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public ValueObject getGeneralConfiguration(final HttpServletRequest request, final long accountGroupId) throws Exception {
		return getOldConfiguration(request, accountGroupId, ModuleIdentifierConstant.GENERAL_CONFIGURATION);
	}

	public void refreshOldConfiguration(final HttpServletRequest request, final long accountGroupId, final long moduleId) throws Exception {
		switch ((int) moduleId) {
		case (int) ModuleIdentifierConstant.CASH_STATEMENT_CONFIGURATION -> putConfigurationInGroupData(request, accountGroupId, PropertiesFileConstants.CASH_STATEMENT_REPORT);
		case (int) ModuleIdentifierConstant.BANK_STATEMENT_CONFIGURATION -> putConfigurationInGroupData(request, accountGroupId, PropertiesFileConstants.BANK_STATEMENT_CONFIG);
		case (int) ModuleIdentifierConstant.PARTY_LEDGER_CONFIGURATION -> putConfigurationInGroupData(request, accountGroupId, PropertiesFileConstants.PARTY_WISE_LEDGER_ACCOUNTS_CONFIG);
		default -> {
			break;
		}
		}
	}

	private void putConfigurationInGroupData(final HttpServletRequest request, final long accountGroupId, final int key) throws Exception {
		final var	groupdata = getAccountGroupDataById(request, accountGroupId);
		groupdata.put(getConfigKey(key), getConfiguration(accountGroupId, key));
	}

	private ValueObject getConfiguration(final long accountGroupId, final int moduleId) throws Exception {
		return PropertyConfigValueBLLImpl.getInstance().getConfiguration(accountGroupId, moduleId);
	}

	public ChargeTypeModel[] getBookingCharges(final HttpServletRequest request, final long branchId) throws Exception {
		try {
			final var	executive	= getExecutive(request);

			if(executive == null)
				return new ChargeTypeModel[0];

			final var	groupData	= getAccountGroupDataById(request, executive.getAccountGroupId());

			var	charges		= (ChargeTypeModel[]) groupData.get(CHARGES);

			if(charges == null)
				charges = refreshCacheForBookingChargesOld(request, executive.getAccountGroupId());

			return charges;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public ChargeTypeModel[] getActiveBookingCharges(final HttpServletRequest request, final long branchId) throws Exception {
		try {
			final var	charges		= getBookingCharges(request, branchId);
			final List<ChargeTypeModel>	chrgColl	= ListFilterUtility.filterList(Arrays.asList(charges), charge -> charge.getStatus() == ChargeTypeModel.CHARGE_STATUS_ACTIVE);

			final var	finalCharges = new ChargeTypeModel[chrgColl.size()];
			chrgColl.toArray(finalCharges);

			return finalCharges;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public ChargeTypeModel[] getDeliveryCharges(final HttpServletRequest request, final long branchId) throws Exception {
		try {
			final var	executive	= getExecutive(request);

			if (executive == null)
				return new ChargeTypeModel[0];

			final var groupData = getAccountGroupDataById(request, executive.getAccountGroupId());
			var charges = (ChargeTypeModel[]) groupData.get(DELIVERY_CHARGES);

			if(charges == null)
				charges = refreshCacheForDeliveryChargesOld(request, executive.getAccountGroupId());

			return charges;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public ChargeTypeModel[] getActiveDeliveryCharges(final HttpServletRequest request, final long branchId) throws Exception {
		try {
			final var	charges		= getDeliveryCharges(request, branchId);
			final List<ChargeTypeModel>	chrgColl	= ListFilterUtility.filterList(Arrays.asList(charges),  e -> e.getStatus() == ChargeTypeModel.CHARGE_STATUS_ACTIVE);

			final var	finalCharges = new ChargeTypeModel[chrgColl.size()];
			chrgColl.toArray(finalCharges);

			return finalCharges;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public ValueObject getAllRegionDataForGroup(final HttpServletRequest request, final long accountgroupid) throws Exception {
		try {
			final var	allregiondataforgroup = new ValueObject();
			final var	allregionsdataforgrouparray = getRegionsByGroupId(request, accountgroupid);

			for (final Region anAllregionsdataforgrouparray : allregionsdataforgrouparray)
				allregiondataforgroup.put(Long.toString(anAllregionsdataforgrouparray.getRegionId()), anAllregionsdataforgrouparray);

			return allregiondataforgroup;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public ValueObject getAllSubRegionDataForGroup(final HttpServletRequest request, final long accountgroupid) throws Exception {
		try {
			final var	allsubregiondataforgroup = new ValueObject();
			final var	allsubregionsdataforgrouparray = getSubRegionsByGroupId(request, accountgroupid);

			for (final SubRegion anAllsubregionsdataforgrouparray : allsubregionsdataforgrouparray)
				allsubregiondataforgroup.put(Long.toString(anAllsubregionsdataforgrouparray.getSubRegionId()), anAllsubregionsdataforgrouparray);

			return allsubregiondataforgroup;
		}catch(final Exception e){
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public ValueObject getGroupConfiguration(final HttpServletRequest request, final long accountGroupId) throws Exception {
		return getOldConfiguration(request, accountGroupId, ModuleIdentifierConstant.BOOKING);
	}

	public ValueObject getLsConfiguration(final HttpServletRequest request, final long accountGroupId) throws Exception {
		try {
			return getOldConfiguration(request, accountGroupId, PropertiesFileConstants.LS_LOAD_CONFIG);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public ValueObject getDocumentCodeConfiguration(final HttpServletRequest request, final long accountGroupId) throws Exception {
		try {
			return getOldConfiguration(request, accountGroupId, PropertiesFileConstants.DOCUMENT_CODE_CONFIG);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	@SuppressWarnings("unchecked")
	public HashMap<Long, ArrayList<Long>> getAccountGroupTieUpConfiguration(final HttpServletRequest request, final long accountGroupId) throws Exception {
		try {
			final var	groupdata 							= getAccountGroupDataById(request, accountGroupId);
			return (HashMap<Long, ArrayList<Long>>) groupdata.get(AccountGroupTieUpConfiguration.ACCOUNT_GROUP_TIE_UP_CONFIGURATION_HM);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public ValueObject getDisplayDataConfiguration(final HttpServletRequest request, final long accountGroupId) throws Exception {
		return getOldConfiguration(request, accountGroupId, ModuleIdentifierConstant.DISPLAY_DATA_CONFIGURATION);
	}

	@SuppressWarnings("unchecked")
	public String getMinDateInReports(final HttpServletRequest request, final long accountGroupId) throws Exception {
		var			date			= 0;
		var			month			= 0;
		var			year			= 0;

		try {
			final var	configuration		= getConfiguration(request, accountGroupId, ModuleIdentifierConstant.DISPLAY_DATA_CONFIGURATION);

			if((boolean) configuration.getOrDefault(DisplayDataWithinDateRangePropertiesConstant.HIDE_ALL_SYSTEM_DATA_BEFORE_CONFIGURED_DATE, false))
				return (String) configuration.getOrDefault(DisplayDataWithinDateRangePropertiesConstant.DATE_FOR_HIDE_ALL_SYSTEM_DATA, null);

			final var	allowCustomMinDate 				= (boolean) configuration.getOrDefault(DisplayDataConfigurationDTO.ALLOW_CUSTOM_MIN_DATE, false);
			final var	minDateSelectionConfigJson		= MinDateSelectionBllImpl.getInstance().getModuleWiseMinDateSelectionConfig(accountGroupId);

			final var	customMinDateValObj		= (Map<Object, Object>) minDateSelectionConfigJson.get(ReportWiseMinDateSelectionConstant.CUSTOM_MIN_DATE);

			final var	execFldPermissions = getExecutiveFieldPermission(request);

			final var	executive = getExecutive(request);

			if(execFldPermissions.get(FeildPermissionsConstant.ALLOW_TO_VIEW_OLD_DATA) != null) {
				date			= Utility.getInt(configuration, DisplayDataConfigurationDTO.DATE_TO_VIEW_OLD_DATA, 01);
				month			= Utility.getInt(configuration, DisplayDataConfigurationDTO.MONTH_TO_VIEW_OLD_DATA, 04);
				year			= Utility.getInt(configuration, DisplayDataConfigurationDTO.YEAR_TO_VIEW_OLD_DATA, 2000);
			} else {
				date			= Utility.getInt(configuration, DisplayDataConfigurationDTO.DATE, 01);
				month			= Utility.getInt(configuration, DisplayDataConfigurationDTO.MONTH, 04);
				year			= Utility.getInt(configuration, DisplayDataConfigurationDTO.YEAR, 2016);
			}

			if(execFldPermissions.get(FeildPermissionsConstant.NO_OF_DAYS_TO_VIEW_DATA) == null) {
				final var	noOfDays	= Utility.getInt(configuration, DisplayDataConfigurationDTO.NO_OF_DAYS_TO_VIEW_DATA, 0);

				if(noOfDays > 0 ) {
					final var	minDateString	= DateTimeUtility.getDateBeforeNoOfDays(noOfDays);
					final var	minDateArray	= minDateString.split("-");
					date			= Integer.parseInt(minDateArray[0]);
					month			= Integer.parseInt(minDateArray[1]);
					year			= Integer.parseInt(minDateArray[2]);
				}
			}

			final var	generalConfiguration = getConfiguration(request, accountGroupId, ModuleIdentifierConstant.GENERAL_CONFIGURATION);

			var	minDate			= date + "-" + month + "-" + year;

			if((boolean) generalConfiguration.getOrDefault(GeneralConfiguration.BRANCH_WISE_DATA_HIDE, false)) {
				final var	branchIdListToHide = CollectionUtility.getLongListFromString((String) generalConfiguration.getOrDefault(GeneralConfiguration.BRANCH_IDS_TO_HIDE,"0"));

				if(executive != null && branchIdListToHide.contains(executive.getBranchId())) {
					date			= (int) generalConfiguration.getOrDefault(GeneralConfiguration.DATA_HIDE_DATE, 01);
					month			= (int) generalConfiguration.getOrDefault(GeneralConfiguration.DATA_HIDE_MONTH, 04);
					year			= (int) generalConfiguration.getOrDefault(GeneralConfiguration.DATA_HIDE_YEAR, 2016);

					minDate			= date + "-" + month + "-" + year;
				}
			}

			if(allowCustomMinDate && execFldPermissions.get(FeildPermissionsConstant.ALLOW_TO_VIEW_OLD_DATA) == null && customMinDateValObj != null)
				minDate = MinDateSelectionBllImpl.getInstance().getCustomeMinDate(customMinDateValObj);

			return minDate;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public ValueObject getModuleWiseMinDateSelectionConfig(final HttpServletRequest request, final long accountGroupId) throws Exception {
		try {
			return getOldConfiguration(request, accountGroupId, PropertiesFileConstants.MODULE_WISE_MIN_DATE_SELECTION_CONFIG);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public Map<Object, Object> getSearchConfiguration(final HttpServletRequest request, final long accountGroupId) throws Exception {
		try {
			return getConfiguration(request, accountGroupId, ModuleIdentifierConstant.SEARCH_CONFIGURATION);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public boolean getTransportSearchModuleForCargo(final HttpServletRequest request, final long accountGroupId) throws Exception {
		try {
			final var	configuration	= getSearchConfiguration(request, accountGroupId);
			final var	executive		= getExecutive(request);

			if(executive == null) return false;

			final var	transportSearchModuleForCargo 		= (boolean) configuration.getOrDefault(SearchConfigPropertiesConstant.TRANSPORT_SEARCH_MODULE_FOR_CARGO, false);

			return transportSearchModuleForCargo || com.iv.utils.utility.Utility.isIdExistInLongList(configuration, SearchConfigPropertiesConstant.BRANCHS_FOR_TRANSPORT_SEARCH_MODULE, executive.getBranchId());
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public boolean getBranchWiseTransportSearchModuleForCargo(final HttpServletRequest request, final long accountGroupId) throws Exception {
		final var		branchWiseTransportSearchModuleForCargo = false;

		try {
			return branchWiseTransportSearchModuleForCargo;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	@SuppressWarnings("unchecked")
	public Timestamp getModuleWiseMinDateToGetData(final HttpServletRequest request, final long accountGroupId, final String allowConstant, final String minDateConstant) throws Exception {
		Timestamp					minDateTimeStamp			= null;

		try {
			final var diaplyDataConfig	= getConfiguration(request, accountGroupId, ModuleIdentifierConstant.DISPLAY_DATA_CONFIGURATION);

			if((boolean) diaplyDataConfig.getOrDefault(DisplayDataWithinDateRangePropertiesConstant.HIDE_ALL_SYSTEM_DATA_BEFORE_CONFIGURED_DATE, false))
				return DateTimeUtility.getTimeStamp((String) diaplyDataConfig.getOrDefault(DisplayDataWithinDateRangePropertiesConstant.DATE_FOR_HIDE_ALL_SYSTEM_DATA, null));

			final var	minDateSelectionConfig			= getModuleWiseMinDateSelectionConfig(request, accountGroupId);
			final var	allowCustomMinDate				= minDateSelectionConfig.getBoolean(ModuleWiseMinDateSelectionConfigurationDTO.ALLOW_CUSTOM_MIN_DATE, false);
			final var	minDateSelectionConfigJson		= MinDateSelectionBllImpl.getInstance().getModuleWiseMinDateSelectionConfig(accountGroupId);

			final var	customMinDateValObj		= (Map<Object, Object>) minDateSelectionConfigJson.get(ReportWiseMinDateSelectionConstant.CUSTOM_MIN_DATE);

			final var	execFldPermissions = getExecutiveFieldPermission(request);

			final var	minDateAllow		= PropertiesUtility.isAllow(minDateSelectionConfig.getString(allowConstant, "false"));

			if(execFldPermissions.get(FeildPermissionsConstant.ALLOW_TO_VIEW_OLD_DATA) != null)
				minDateTimeStamp	= DateTimeUtility.getTimeStamp(minDateSelectionConfig.getString(ModuleWiseMinDateSelectionConfigurationDTO.MIN_DATE_TO_VIEW_OLD_DATA, null));
			else if(minDateAllow)
				minDateTimeStamp	= DateTimeUtility.getTimeStamp(minDateSelectionConfig.getString(minDateConstant, null));

			if(minDateTimeStamp == null && execFldPermissions.get(FeildPermissionsConstant.NO_OF_DAYS_TO_VIEW_DATA) == null) {
				final var	noOfDays	= minDateSelectionConfig.getInt(ModuleWiseMinDateSelectionConfigurationDTO.NO_OF_DAYS_TO_VIEW_DATA, 0);

				if(noOfDays > 0)
					minDateTimeStamp	= DateTimeUtility.getTimeStamp(DateTimeUtility.getDateBeforeNoOfDays(noOfDays));
			}

			if(minDateTimeStamp == null && allowCustomMinDate && execFldPermissions.get(FeildPermissionsConstant.ALLOW_TO_VIEW_OLD_DATA) == null && customMinDateValObj != null)
				minDateTimeStamp	= DateTimeUtility.getTimeStamp(MinDateSelectionBllImpl.getInstance().getCustomeMinDate(customMinDateValObj));

			return minDateTimeStamp;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public ValueObject getReportWiseMinDateSelectionConfig(final HttpServletRequest request, final long accountGroupId) throws Exception {
		try {
			return getOldConfiguration(request, accountGroupId, PropertiesFileConstants.REPORT_WISE_MIN_DATE_SELECTION_CONFIG);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	@SuppressWarnings("unchecked")
	public Timestamp getReportWiseMinDateToGetData(final HttpServletRequest request, final long accountGroupId, final String allowConstant, final String minDateConstant) throws Exception {
		Timestamp					minDateTimeStamp			= null;

		try {
			final var diaplyDataConfig	= getConfiguration(request, accountGroupId, ModuleIdentifierConstant.DISPLAY_DATA_CONFIGURATION);

			if((boolean) diaplyDataConfig.getOrDefault(DisplayDataWithinDateRangePropertiesConstant.HIDE_ALL_SYSTEM_DATA_BEFORE_CONFIGURED_DATE, false))
				return DateTimeUtility.getTimeStamp((String) diaplyDataConfig.getOrDefault(DisplayDataWithinDateRangePropertiesConstant.DATE_FOR_HIDE_ALL_SYSTEM_DATA, null));

			final var	minDateSelectionConfig			= getReportWiseMinDateSelectionConfig(request, accountGroupId);
			final var	minDateSelectionConfigJson		= MinDateSelectionBllImpl.getInstance().getModuleWiseMinDateSelectionConfig(accountGroupId);

			final var	customMinDateValObj		= (Map<Object, Object>) minDateSelectionConfigJson.get(ReportWiseMinDateSelectionConstant.CUSTOM_MIN_DATE);

			final var	execFldPermissions = getExecutiveFieldPermission(request);

			final var	minDateAllow		= PropertiesUtility.isAllow(minDateSelectionConfig.getString(allowConstant, "false"));
			final var	allowCustomMinDate  = minDateSelectionConfig.getBoolean(ReportWiseMinDateSelectionConfigurationDTO.ALLOW_CUSTOM_MIN_DATE, false);

			if(execFldPermissions.get(FeildPermissionsConstant.ALLOW_TO_VIEW_OLD_DATA) != null)
				minDateTimeStamp	= DateTimeUtility.getTimeStamp(minDateSelectionConfig.getString(ReportWiseMinDateSelectionConfigurationDTO.MIN_DATE_TO_VIEW_OLD_DATA, null));
			else if(minDateAllow)
				minDateTimeStamp	= DateTimeUtility.getTimeStamp(minDateSelectionConfig.getString(minDateConstant, null));

			if(execFldPermissions.get(FeildPermissionsConstant.NO_OF_DAYS_TO_VIEW_DATA) == null) {
				final var	noOfDays	= minDateSelectionConfig.getInt(ReportWiseMinDateSelectionConfigurationDTO.NO_OF_DAYS_TO_VIEW_DATA, 0);

				if(noOfDays > 0)
					minDateTimeStamp	= DateTimeUtility.getTimeStamp(DateTimeUtility.getDateBeforeNoOfDays(noOfDays));
			}

			if(allowCustomMinDate && execFldPermissions.get(FeildPermissionsConstant.ALLOW_TO_VIEW_OLD_DATA) == null && customMinDateValObj != null)
				minDateTimeStamp	= DateTimeUtility.getTimeStamp(MinDateSelectionBllImpl.getInstance().getCustomeMinDate(customMinDateValObj));

			return minDateTimeStamp;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public ValueObject getCustomGroupAddressConfiguration(final HttpServletRequest request, final long accountGroupId) throws Exception {
		try {
			final var	groupdata 		= getAccountGroupDataById(request, accountGroupId);

			var	customGroup	= (ValueObject) groupdata.get(CustomGroupAddressPropertiesConstant.CUSTOM_GROUP_ADDRESS_PROPERTIES);

			if(customGroup == null) {
				customGroup	= CustomGroupAddressConfigBllImpl.getInstance().getCustomGroupAddressConfig(accountGroupId);
				groupdata.put(CustomGroupAddressPropertiesConstant.CUSTOM_GROUP_ADDRESS_PROPERTIES, customGroup);
			}

			return customGroup;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public ValueObject getDashBoardConfiguration(final HttpServletRequest request, final long accountGroupId) throws Exception {
		try {
			return getOldConfiguration(request, accountGroupId, PropertiesFileConstants.DASH_BOARD_CONFIG);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public ValueObject getCashStatementConfiguration(final HttpServletRequest request, final long accountGroupId) throws Exception {
		try {
			return getOldConfiguration(request, accountGroupId, PropertiesFileConstants.CASH_STATEMENT_REPORT);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public ValueObject getBankStatementConfiguration(final HttpServletRequest request, final long accountGroupId) throws Exception {
		try {
			return getOldConfiguration(request, accountGroupId, PropertiesFileConstants.BANK_STATEMENT_CONFIG);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public HashMap<Long, Short> getWayBillTypeWiseServiceTaxDate(final ValueObject configuration) throws Exception {
		try {
			final var	lrTypeWiseServiceTaxDateHM		= new HashMap<Long, Short>();

			lrTypeWiseServiceTaxDateHM.put(WayBillTypeConstant.WAYBILL_TYPE_PAID, (short) 1);
			lrTypeWiseServiceTaxDateHM.put(WayBillTypeConstant.WAYBILL_TYPE_TO_PAY, (short) 1);
			lrTypeWiseServiceTaxDateHM.put(WayBillTypeConstant.WAYBILL_TYPE_CREDIT, (short) 1);

			return lrTypeWiseServiceTaxDateHM;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	@SuppressWarnings("unchecked")
	public HashMap<Long, Short> wayBillTypeWiseServiceTaxDate(final HttpServletRequest request, final long accountGroupId) throws Exception {
		try {
			final var	groupdata 		= getAccountGroupDataById(request, accountGroupId);

			final var	configuration	= getGroupConfiguration(request, accountGroupId);

			var	lrTypeWiseHM	= (HashMap<Long, Short>) groupdata.get(WayBillTaxDetails.WAYBILL_TYPE_WISE_SERVICE_TAX_DATE);

			if(lrTypeWiseHM == null) {
				lrTypeWiseHM	= getWayBillTypeWiseServiceTaxDate(configuration);
				groupdata.put(WayBillTaxDetails.WAYBILL_TYPE_WISE_SERVICE_TAX_DATE, lrTypeWiseHM);
			}

			return lrTypeWiseHM;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public ValueObject getGenerateCRConfiguration(final HttpServletRequest request, final long accountGroupId) throws Exception {
		return getOldConfiguration(request, accountGroupId, ModuleIdentifierConstant.GENERATE_CR);
	}

	public ValueObject getCommonReportsConfiguration(final HttpServletRequest request, final long accountGroupId) throws Exception {
		try {
			return getOldConfiguration(request, accountGroupId, PropertiesFileConstants.COMMON_REPORTS_CONFIG);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public short getBranchPermissionConfigValue(final HttpServletRequest request, final long branchId, final short configKey) throws Exception {
		try {
			final var	executive			= getExecutive(request);
			final var	branchPermissions	= getBranchPermissionData(request, executive.getAccountGroupId(), branchId);

			if (ObjectUtils.isEmpty(branchPermissions))
				return 0;

			return branchPermissions.stream().filter(e -> e.getConfigKey() == configKey && e.getStatus() == BranchPermission.BRANCH_PERMISSION_ACTIVE)
					.findFirst().orElse(new BranchPermission()).getConfigValue();
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public Map<Long,String> getPackingTypeByNameAndGroupId(final HttpServletRequest request, final String str, final long accountGroupId) throws Exception {
		try {
			final var	genericPackingTypeMaster	= getPackingTypeMasterData(request);
			final var	packingTypeForGroup = getPackingTypeForGroup(request, accountGroupId);
			final Map <Long, String>	packingTypeHM		= new LinkedHashMap<>();

			if (ObjectUtils.isEmpty(packingTypeForGroup))
				return packingTypeHM;

			for (final PackingTypeForGroup aPackingTypeForGroup : packingTypeForGroup)
				if(!aPackingTypeForGroup.isMarkForDelete()) {
					final var	packingTypeMaster = (PackingTypeMaster) genericPackingTypeMaster.get(Long.toString(aPackingTypeForGroup.getTypeOfPackingMasterId()));

					if(packingTypeMaster != null && StringUtils.contains(StringUtils.lowerCase(packingTypeMaster.getName()), StringUtils.lowerCase(str)))
						packingTypeHM.put(packingTypeMaster.getPackingTypeMasterId(), packingTypeMaster.getName());
				}

			return packingTypeHM;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private DriverMaster[] getDriverMastersForAccountGroup(final HttpServletRequest request, final long accountGroupId) throws Exception {
		try {
			final var	groupData		= getAccountGroupDataById(request, accountGroupId);
			var	driverMasterForGroup 		= (DriverMaster[]) groupData.get(DRIVER_MASTERS_FOR_ACCOUNT_GROUP);

			if(driverMasterForGroup == null)
				driverMasterForGroup	= refreshDriverMasterForGroup(request, accountGroupId);

			return driverMasterForGroup;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public DriverMaster[] refreshDriverMasterForGroup(final HttpServletRequest request, final long accountGroupId) throws Exception {
		try {
			final var	groupData		= getAccountGroupDataById(request, accountGroupId);

			final var driverArr = DriverMasterDao.getInstance().findAll(accountGroupId);

			groupData.put(DRIVER_MASTERS_FOR_ACCOUNT_GROUP, driverArr);

			return driverArr;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public Map<Long, String> getDriverDetailsByNameAndGroupId(final HttpServletRequest request, final String str, final long accountGroupId) throws Exception {
		try {
			final var	driverMasterForGroup 		= getDriverMastersForAccountGroup(request, accountGroupId);

			if (ObjectUtils.isEmpty(driverMasterForGroup))
				return Collections.emptyMap();

			final Map<Long, String>	driverDetailsHM				= new LinkedHashMap<>();

			for (final DriverMaster aDriverMasterForGroup : driverMasterForGroup)
				if(!aDriverMasterForGroup.isMarkForDelete()) {
					final var	nameWithLicenseNo	= aDriverMasterForGroup.getName() + "(" + aDriverMasterForGroup.getLicenceNumber() + ")";

					if(StringUtils.contains(StringUtils.lowerCase(nameWithLicenseNo), StringUtils.lowerCase(str)))
						driverDetailsHM.put(aDriverMasterForGroup.getDriverMasterId(), nameWithLicenseNo);
				}

			return driverDetailsHM;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public void refreshGenericSubRegionCache(final HttpServletRequest request) throws Exception {
		try {
			setContextAttribute(request, SUB_REGIONS, SubRegionBll.getInstance().getAllSubRegions());
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public void refreshGenericRegionCache(final HttpServletRequest request) throws Exception {
		try {
			setContextAttribute(request, REGIONS, RegionBll.getInstance().getAllRegions());
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public void refreshAllAccountGroupNetworkConfig(final HttpServletRequest request) throws Exception {
		try {
			final var	accountGroupNetworkList = AccountGroupNetworkConfigurationDao.getInstance().getAllAccountGroupNetworkConfiguration();
			setContextAttribute(request, ALL_ACCOUNT_GROUP_NETWORK_CONFIG, accountGroupNetworkList);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	@SuppressWarnings("unchecked")
	public List<AccountGroupNetworkConfiguration> getAllAccountGroupNetworkConfig(final HttpServletRequest request) throws Exception {
		try {
			var	accountGroupNetworkList = (List<AccountGroupNetworkConfiguration>) getContextAttribute(request, ALL_ACCOUNT_GROUP_NETWORK_CONFIG);

			if(accountGroupNetworkList == null) {
				refreshAllAccountGroupNetworkConfig(request);
				accountGroupNetworkList = (List<AccountGroupNetworkConfiguration>) getContextAttribute(request, ALL_ACCOUNT_GROUP_NETWORK_CONFIG);
			}

			return accountGroupNetworkList;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public void refreshBranchNetworkConfiguration(final HttpServletRequest request, final long configAccountGroupId) throws Exception {
		try {
			final var	accountGroupNetworkList = getAllAccountGroupNetworkConfig(request);

			final List<Long>	asignedAccountGroupList = accountGroupNetworkList.parallelStream()
					.filter(b -> b.getConfigAccountGroupId() == configAccountGroupId)
					.map(AccountGroupNetworkConfiguration::getAssignBranchAccountGroupId)
					.sorted()
					.distinct()
					.collect(CollectionUtility.getList());

			if(!asignedAccountGroupList.isEmpty()) {
				final var assignedAccountGroupIds = CollectionUtility.getStringFromLongList(asignedAccountGroupList);

				final var branchNetworkConfigList = BranchNetWorkConfigurationDao.getInstance().findByAccountGroupIds(assignedAccountGroupIds);

				if(branchNetworkConfigList != null && !branchNetworkConfigList.isEmpty()) {
					final Map<Long, List<BranchNetWorkConfiguration>> branchWiseNetworkConfigListHM   = branchNetworkConfigList.stream()
							.collect(Collectors.groupingBy(BranchNetWorkConfiguration::getConfigBranchId));

					for(final Map.Entry<Long, List<BranchNetWorkConfiguration>> entry : branchWiseNetworkConfigListHM.entrySet()) {
						final var		branchdata = getBranchData(request, entry.getKey());

						if(entry.getValue() != null)
							branchdata.put(BRANCH_NETWORK_CONFIG, entry.getValue());
					}
				}
			}
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}
	//Added by Anant Chaudhary	04-04-2016

	//Start
	private String getDestinationBranchesWithSubRegion(final HttpServletRequest request, final Branch branch) throws Exception {
		try {
			final var	executive 	= getExecutive(request);

			if (executive == null)
				return null;

			final var 	groupConfig = getGroupConfiguration(request, executive.getAccountGroupId());
			final var	isSubRegionRequired = groupConfig.getBoolean(GroupConfigurationPropertiesDTO.IS_SUB_REGION_REQUIRED, false);

			final var	subRegion	= getGenericSubRegionById(request, branch.getSubRegionId());

			if(isSubRegionRequired && subRegion != null)
				return branch.getName() + " ( " + subRegion.getName() + " )";

			return branch.getName();
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	@SuppressWarnings("unchecked")
	public List<Long> getGroupBranchCollection(final HttpServletRequest request, final long branchId) throws Exception {
		try {
			var branchCollection	= (List<Long>) getContextAttribute(request, BRANCH_COLLECTION + branchId);

			if(branchCollection == null) {
				branchCollection = BranchDao.getInstance().getBranches(branchId);
				setContextAttribute(request, BRANCH_COLLECTION + branchId, branchCollection);
			}

			return branchCollection;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private List<Branch> filterBranchTypeWiseList(final int branchType, final List<Branch> filteredList, final List<Long> branchCollection, final boolean isOwnGroupBranchesRequired) {
		return switch (branchType) {
		case Branch.BRANCH_TYPE_DELIVERY -> ListFilterUtility.filterList(filteredList, branch -> isDeliveryBranch(branch, branchCollection, isOwnGroupBranchesRequired));
		case Branch.BRANCH_TYPE_BOOKING -> ListFilterUtility.filterList(filteredList, branch -> isBookingBranch(branch, branchCollection, isOwnGroupBranchesRequired));
		case Branch.BRANCH_TYPE_BOOKING_DELIVERY_BOTH -> ListFilterUtility.filterList(filteredList, branch -> isBothTypeBranch(branch, branchCollection, isOwnGroupBranchesRequired));
		default -> Collections.emptyList();
		};
	}

	private boolean isDeliveryBranch(final Branch branch, final List<Long> branchCollection, final boolean isOwnGroupBranchesRequired) {
		return (branch.getBranchType() == Branch.BRANCH_TYPE_BOOKING_DELIVERY_BOTH || branch.getBranchType() == Branch.BRANCH_TYPE_DELIVERY)
				&& (branch.getMappingTypeId() == Branch.BRANCH_MAP_ID_OWN_BRANCH_AND_ASSIGNED
				|| branch.getMappingTypeId() == Branch.BRANCH_MAP_ID_NOT_OWN_BRANCH_AND_ASSIGNED && !isOwnGroupBranchesRequired
				&& branchCollection != null && !branchCollection.isEmpty() && branchCollection.contains(branch.getBranchId()));
	}

	private boolean isBookingBranch(final Branch branch, final List<Long> branchCollection, final boolean isOwnGroupBranchesRequired) {
		return (branch.getBranchType() == Branch.BRANCH_TYPE_BOOKING_DELIVERY_BOTH || branch.getBranchType() == Branch.BRANCH_TYPE_BOOKING)
				&& (branch.getMappingTypeId() == Branch.BRANCH_MAP_ID_OWN_BRANCH_AND_ASSIGNED
				|| branch.getMappingTypeId() == Branch.BRANCH_MAP_ID_NOT_OWN_BRANCH_AND_ASSIGNED && !isOwnGroupBranchesRequired
				&& branchCollection != null && !branchCollection.isEmpty() && branchCollection.contains(branch.getBranchId()));
	}

	private boolean isBothTypeBranch(final Branch branch, final List<Long> branchCollection, final boolean isOwnGroupBranchesRequired) {
		return branch.getMappingTypeId() == Branch.BRANCH_MAP_ID_OWN_BRANCH_AND_ASSIGNED
				|| branch.getMappingTypeId() == Branch.BRANCH_MAP_ID_NOT_OWN_BRANCH_AND_ASSIGNED && !isOwnGroupBranchesRequired
				&& branchCollection != null && !branchCollection.isEmpty() && branchCollection.contains(branch.getBranchId());
	}

	public Map<String, String> getDestinationBranchWithSubregionWiseDestinationByNameAndGroupId(final HttpServletRequest request, final String str, final long accountGroupId, final int branchType, final long locationId, final boolean isOwnGroupBranchesRequired) throws Exception {
		try {
			final var 	allGroupBranches 	= getAllActiveGroupBranchesList(request, accountGroupId);
			final var	branchCollection	= getGroupBranchCollection(request, locationId);
			final Map<String, String>	destinationList 	= new TreeMap<>();

			final var filteredList	= filterBranchTypeWiseList(branchType, allGroupBranches, branchCollection, isOwnGroupBranchesRequired);

			filteredList.forEach(branch -> {
				try {
					final var destinationBranchesWithSubRegion	= getDestinationBranchesWithSubRegion(request, branch);
					final var actualAccountGroupId				= getGenericBranchDetailCache(request, branch.getBranchId()).getAccountGroupId();

					if(StringUtils.contains(StringUtils.lowerCase(destinationBranchesWithSubRegion), StringUtils.lowerCase(str)) && actualAccountGroupId != 0)
						destinationList.put(destinationBranchesWithSubRegion, getDestinationIdStrWithLocation(branch) + "_" + actualAccountGroupId);
				} catch (final Exception e) {
					e.printStackTrace();
				}
			});

			return destinationList;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public Map<String, String> getDestinationBranchWithCityWiseDestinationByNameAndGroupId(final HttpServletRequest request, final String str, final long accountGroupId, final int branchType, final long locationId, final boolean isOwnGroupBranchesRequired, final boolean isDestinationCityWithBranches) throws Exception {
		try {
			final var 	allGroupBranches 	= getAllActiveGroupBranchesList(request, accountGroupId);
			final var	branchCollection	= getGroupBranchCollection(request, locationId);
			final Map<String, String>	destinationList 	= new TreeMap<>();

			final var filteredList	= filterBranchTypeWiseList(branchType, allGroupBranches, branchCollection, isOwnGroupBranchesRequired);

			filteredList.forEach(branch -> {
				try {
					final var	destinationBranchesWithCity	= isDestinationCityWithBranches ? getDestinationCityWithBranches(request, branch) : getDestinationBranchesWithCity(request, branch);

					final var	actualAccountGroupId 	= getGenericBranchDetailCache(request, branch.getBranchId()).getAccountGroupId();

					if(StringUtils.contains(StringUtils.lowerCase(destinationBranchesWithCity), StringUtils.lowerCase(str)))
						destinationList.put(destinationBranchesWithCity, getDestinationIdStrWithLocation(branch) + "_" + actualAccountGroupId);
				} catch (final Exception e) {
					e.printStackTrace();
				}
			});

			return destinationList;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public Map<String, String> getDestinationBranchWithPinCodeWiseDestinationByNameAndGroupId(final HttpServletRequest request, final String str, final long accountGroupId, final int branchType, final long locationId, final boolean isOwnGroupBranchesRequired) throws Exception {
		try {
			final var	allGroupBranches 	= getAllActiveGroupBranchesList(request, accountGroupId);
			final var	branchCollection	= getGroupBranchCollection(request, locationId);
			final Map<String, String>	destinationList 	= new TreeMap<>();

			final var filteredList	= filterBranchTypeWiseList(branchType, allGroupBranches, branchCollection, isOwnGroupBranchesRequired);

			filteredList.forEach(branch -> {
				try {
					getPinCodeWiseDestinationBranchList(request, str, branch, destinationList);
				} catch (final Exception e) {
					e.printStackTrace();
				}
			});

			return destinationList;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private void getPinCodeWiseDestinationBranchList(final HttpServletRequest request, final String str, final Branch branch, final Map<String, String> destinationList) throws Exception {
		try {
			final var actualAccountGroupId 			= getGenericBranchDetailCache(request, branch.getBranchId()).getAccountGroupId();
			var branchPincodeList				= getBranchPincodesByBranch(request, actualAccountGroupId, branch.getBranchId());

			if (ObjectUtils.isNotEmpty(branchPincodeList))
				branchPincodeList = PojoFilter.filterList(branchPincodeList, e -> e.getMarkForDelete() != null && !e.getMarkForDelete());

			if (ObjectUtils.isNotEmpty(branchPincodeList))
				branchPincodeList.forEach((final BranchPincodeConfiguration brPincodeList) -> {
					final var	destinationBranchesWithPinCode = branch.getName() + " ( " + brPincodeList.getPincode() + " )";

					if (StringUtils.contains(StringUtils.lowerCase(destinationBranchesWithPinCode), StringUtils.lowerCase(str)))
						destinationList.put(destinationBranchesWithPinCode, getDestinationIdStrWithLocation(branch) + "_" + actualAccountGroupId + "_" + branch.getBranchCode() + "_" + branch.getSubRegionId() + "_" + brPincodeList.getPincode());
				});
			else {
				final var	subRegion = getGenericSubRegionById(request, branch.getSubRegionId());

				final var	destinationBranchesWithPinCode = getBranchWithSubregionName(subRegion, branch);

				if (StringUtils.contains(StringUtils.lowerCase(destinationBranchesWithPinCode), StringUtils.lowerCase(str)))
					destinationList.put(destinationBranchesWithPinCode, getDestinationIdStrWithLocation(branch) + "_" + branchOtherData2(actualAccountGroupId, branch));
			}
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private String branchOtherData2(final long actualAccountGroupId, final Branch branch) {
		return actualAccountGroupId + "_" + branch.getBranchCode() + "_" + branch.getSubRegionId() + "_" + branch.getPincode();
	}

	public String getDestinationBranchesWithCity(final HttpServletRequest request, final Branch branch) throws Exception {
		try {
			final var	city	= getCityById(request, branch.getCityId());

			if(city != null)
				return branch.getName() + " ( " + city.getName() + " )";

			return branch.getName();
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private String getDestinationCityWithBranches(final HttpServletRequest request, final Branch branch) throws Exception {
		try {
			final var	city	= getCityById(request, branch.getCityId());

			if(city != null)
				return city.getName() + " ( " + branch.getName() + " )";

			return branch.getName();
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	@SuppressWarnings("unchecked")
	private List<BranchPincodeConfiguration> getBranchPincodesByBranch(final HttpServletRequest request, final long accountGroupId, final long branchId) throws Exception {
		try {
			final var groupData = getAccountGroupDataById(request, accountGroupId);
			var	branchPinCodeHm = (Map<Long, List<BranchPincodeConfiguration>>) groupData.get("branchPinCodeHm");

			if(branchPinCodeHm == null)
				branchPinCodeHm	= refreshBranchPincodeDetailCache(request, accountGroupId);

			if(ObjectUtils.isNotEmpty(branchPinCodeHm))
				return branchPinCodeHm.get(branchId);

			return Collections.emptyList();
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private LinkedHashMap<Long, String> getCityList(final HttpServletRequest request, final List<Branch> branchList) throws Exception {
		final var	cityList		= new LinkedHashMap<Long, String>();

		try {
			final var	city			= getCityData(request);

			branchList.parallelStream()
			.map(Branch::getCityId)
			.sorted()
			.distinct()
			.collect(CollectionUtility.getList())
			.forEach(c -> {
				try {
					cityList.put(c, ((City) city.get(Long.toString(c))).getName());
				} catch (final Exception e) {
					e.printStackTrace();
				}
			});

			return cityList;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public Map<String, String> getBookingBranchAndCityWiseDestinationByNameAndGroupId(final HttpServletRequest request, final String str, final long accountGroupId, final int branchType , final long locationId,final long branchId,final boolean  isOwnGroupBranchesRequired) throws Exception {
		try {
			final var	allGroupBranches 	= getAllActiveGroupBranchesList(request, accountGroupId);
			final var	branchCollection	= getGroupBranchCollection(request, locationId);
			final var	branchBookingDestinationConfig = getSourceBranchWiseDestinationBranchConfigured(branchId);
			final var	subRegions			= getAllSubRegions(request);

			var filteredList	= filterBranchTypeWiseList(branchType, allGroupBranches, branchCollection, isOwnGroupBranchesRequired);
			filteredList	= ListFilterUtility.filterList(filteredList, branch -> StringUtils.contains(StringUtils.lowerCase(branch.getName()), StringUtils.lowerCase(str)));

			if(branchBookingDestinationConfig.getConfigType() != BranchBookingDestinationConfig.CONFIGTYPE_ALL) {
				final var	branchBookingDestinationMapHM  = BranchBookingDestinationMapDao.getInstance().getBranchBookingDestinationMapListByBranchId(branchId);

				filteredList	= ListFilterUtility.filterList(filteredList, branch ->
				branchBookingDestinationConfig.getConfigType() == BranchBookingDestinationConfig.CONFIGTYPE_INCLUDE && branchBookingDestinationMapHM.get(branch.getBranchId()) != null
				|| branchBookingDestinationConfig.getConfigType() == BranchBookingDestinationConfig.CONFIGTYPE_EXCLUDE && branchBookingDestinationMapHM.get(branch.getBranchId()) == null);
			}

			final Map<String, String>	destinationList 	= new TreeMap <>();

			for(final Branch branch : filteredList)
				destinationList.put(getBranchWithSubregionName(subRegions, branch), getDestinationIdStrWithLocation(branch));

			return destinationList;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private BranchBookingDestinationConfig getSourceBranchWiseDestinationBranchConfigured(final long  branchId) throws Exception{
		return BranchBookingDestinationConfigDao.getInstance().getBranchBookingDestinationConfigByBranchId(branchId);
	}

	public Map<String, String> getBookingDestinationBranchWithSubregionWiseDestinationByNameAndGroupId(final HttpServletRequest request, final String str, final long accountGroupId, final int branchType, final long locationId, final long executiveBranchId, final boolean isOwnGroupBranchesRequired) throws Exception {
		Map<Long, BranchBookingDestinationMap> 		branchBookingDestinationMapHM = null;

		try {
			final var	allGroupBranches 	= getAllActiveGroupBranchesList(request, accountGroupId);
			final var	branchCollection	= getGroupBranchCollection(request, locationId);
			final Map<String, String>	destinationList 	= new TreeMap<>();

			final var	branchBookingDestinationConfig 		= getSourceBranchWiseDestinationBranchConfigured(executiveBranchId);

			if(branchBookingDestinationConfig.getConfigType() != BranchBookingDestinationConfig.CONFIGTYPE_ALL)
				branchBookingDestinationMapHM  	= BranchBookingDestinationMapDao.getInstance().getBranchBookingDestinationMapListByBranchId(executiveBranchId);

			final var filteredList	= filterBranchTypeWiseList(branchType, allGroupBranches, branchCollection, isOwnGroupBranchesRequired);

			for(final Branch branch : filteredList) {
				final var	destinationBranchesWithSubRegion	= getDestinationBranchesWithSubRegion(request, branch);

				final var	flag		= StringUtils.contains(StringUtils.lowerCase(destinationBranchesWithSubRegion), StringUtils.lowerCase(str));

				if(flag && branchBookingDestinationConfig.getConfigType() == BranchBookingDestinationConfig.CONFIGTYPE_ALL)
					destinationList.put(destinationBranchesWithSubRegion, getDestinationIdStrWithLocation(branch));
				else if(flag && branchBookingDestinationConfig.getConfigType() != BranchBookingDestinationConfig.CONFIGTYPE_ALL)
					if(branchBookingDestinationConfig.getConfigType() == BranchBookingDestinationConfig.CONFIGTYPE_INCLUDE) {
						if(branchBookingDestinationMapHM != null && branchBookingDestinationMapHM.get(branch.getBranchId()) != null)
							destinationList.put(destinationBranchesWithSubRegion, getDestinationIdStrWithLocation(branch));
					} else if(branchBookingDestinationConfig.getConfigType() == BranchBookingDestinationConfig.CONFIGTYPE_EXCLUDE
							&& branchBookingDestinationMapHM != null && branchBookingDestinationMapHM.get(branch.getBranchId()) == null)
						destinationList.put(destinationBranchesWithSubRegion, getDestinationIdStrWithLocation(branch));
			}

			return destinationList;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public LinkedHashMap<Long, String> getAllGroupActiveBranchCityIdList(final HttpServletRequest request, final Executive executive) throws Exception {
		try {
			var branchList	= getAllGroupBranchesList(request, executive.getAccountGroupId());
			branchList	= ListFilterUtility.filterList(branchList, b -> b.getStatus() == Branch.BRANCH_ACTIVE && !b.isMarkForDelete());

			return getCityList(request, branchList);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public LinkedHashMap<Long, String> getAllGroupCityIdList(final HttpServletRequest request, final Executive executive) throws Exception {
		try {
			final var branchList	= getAllGroupBranchesList(request, executive.getAccountGroupId());

			return getCityList(request, branchList);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public LinkedHashMap<Long, String> getAllGroupBranchIdList(final HttpServletRequest request, final Executive executive) throws Exception {
		try {
			var branchList	= getAllGroupBranchesList(request, executive.getAccountGroupId());
			branchList	= ListFilterUtility.filterList(branchList, b -> b.getBranchId() == executive.getBranchId());

			return getCityList(request, branchList);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public LinkedHashMap<Long, String> getAllGroupSubRegionIdList(final HttpServletRequest request, final Executive executive) throws Exception {
		try {
			var branchList	= getAllGroupBranchesList(request, executive.getAccountGroupId());
			branchList	= ListFilterUtility.filterList(branchList, b -> b.getSubRegionId() == executive.getSubRegionId());

			return getCityList(request, branchList);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public LinkedHashMap<Long, String> getAllGroupRegionIdList(final HttpServletRequest request, final Executive executive) throws Exception {
		try {
			var branchList	= getAllGroupBranchesList(request, executive.getAccountGroupId());
			branchList	= ListFilterUtility.filterList(branchList, b -> b.getRegionId() == executive.getRegionId());

			return getCityList(request, branchList);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public LinkedHashMap<Long, String> getBranchesListByAccountGroupId(final HttpServletRequest request, final Executive executive, final String str) throws Exception {
		try {
			final var	allGroupBranches		= getAllGroupBranches(request, executive.getAccountGroupId());

			final var		branchesList 			= new LinkedHashMap<Long, String>();

			allGroupBranches.forEach((branchId, branch) -> {
				try {
					branchesList.putAll(getBranchesList(branch, str));
				} catch (final Exception e) {
					e.printStackTrace();
				}
			});

			return branchesList;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public LinkedHashMap<Long, String> getBranchesList(final Branch branch, final String str) throws Exception {
		try {
			final var	branchesList		= new LinkedHashMap<Long, String>();

			final var	branchName			= getBranchName(branch);

			if(branchName != null && StringUtils.contains(StringUtils.lowerCase(branchName), StringUtils.lowerCase(str)))
				branchesList.put(branch.getBranchId(), branch.getName());

			return branchesList;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private String getBranchName(final Branch branch) throws Exception {
		String		branchName		= null;

		try {
			if(branch != null)
				branchName		= branch.getName();

			return branchName;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public AccountGroup	getAccountGroupByAccountGroupId(final HttpServletRequest request, final long accountGroupId) throws Exception {
		AccountGroup		 accountGroup	= null;

		try {
			final Map<Long, AccountGroup>	accountGroupHM = getAccountGroupHM(request);

			if(accountGroupHM != null && !accountGroupHM.isEmpty())
				accountGroup = accountGroupHM.get(accountGroupId);

			if(accountGroup == null) accountGroup = AccountGroupDao.getInstance().findByAccountGroupId(accountGroupId);

			return accountGroup;
		} catch(final Exception e) {
			e.printStackTrace();
			throw e;
		}
	}

	public String getBranchIdsByExecutiveType(final HttpServletRequest request, final Executive executive) throws Exception{
		String 	branchIds = null;
		final var		id		  = 0;

		try {
			if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN)
				branchIds = getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_GROUP, id);
			else if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_REGIONADMIN)
				branchIds = getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_REGION, executive.getRegionId());
			else if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_SUBREGIONADMIN)
				branchIds = getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_SUBREGION, executive.getSubRegionId());
			else
				branchIds = Long.toString(executive.getBranchId());

			return branchIds;
		} catch (final Exception e){
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	@SuppressWarnings("unchecked")
	public CustomGroupMapper getCustomGroupData(final HttpServletRequest request, final long accountGroupId, final short identifier, final long branchId) throws Exception {
		CustomGroupMapper			customGroupMapper	= null;

		try {
			final var	groupData 			= getAccountGroupDataById(request, accountGroupId);
			var			customGroupMapperHM = (Map<Short, Map<Long, CustomGroupMapper>>) groupData.get(CustomGroupMapper.CUSTOM_GROUP_MAPPER);

			if(customGroupMapperHM == null)
				customGroupMapperHM	= refreshCustomGroupMapper(request, accountGroupId);

			if(customGroupMapperHM != null) {
				final var	customGroupHM		= customGroupMapperHM.get(identifier);

				if(customGroupHM != null)
					customGroupMapper   = customGroupHM.get(branchId);
			}

			return customGroupMapper;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public Map<Short, Map<Long, CustomGroupMapper>> refreshCustomGroupMapper(final HttpServletRequest request, final long accountGroupId) throws Exception {
		try {
			final var	groupData 			= getAccountGroupDataById(request, accountGroupId);
			final var customGroupMapperHM	= CustomGroupMapperDao.getInstance().getCustomGroupData(accountGroupId);
			groupData.put(CustomGroupMapper.CUSTOM_GROUP_MAPPER, customGroupMapperHM);

			return customGroupMapperHM;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public Map<Object, Object> getHeaderConfiguration(final HttpServletRequest request, final long accountGroupId) throws Exception {
		try {
			final var	configuration	= getConfiguration(request, accountGroupId, ModuleIdentifierConstant.HEADER);

			//402 - Seabird
			if(accountGroupId >= TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_SEABIRD)
				configuration.put(HeaderConfigurationConstant.SHOW_PENDING_BRANCH_REPORTS, true);

			return configuration;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public Map<Long, com.iv.dto.model.ChargeTypeModel> getBookingChargesHm(final HttpServletRequest request, final Executive executive) throws Exception {
		try {
			final var	charges			= getBookingCharges(request, executive);
			final var	finalCharges	= new HashMap<Long, com.iv.dto.model.ChargeTypeModel>();

			charges.forEach((final com.iv.dto.model.ChargeTypeModel charge) -> finalCharges.put(charge.getChargeTypeMasterId(), charge));

			return finalCharges;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public LinkedHashMap<String, String> getActivePhysicalBranchAndCityWiseDestinationByRegionIdOrSubRegionId(final HttpServletRequest request, final String str, final long accountGroupId, final short executiveType, final long id, final short typeOfLocaion, final boolean showPhysicalOrOperationalBothBranch) throws Exception {
		try {
			final var	allGroupBranches 	 = getAllActiveGroupBranchesList(request, accountGroupId);
			final var	destinationList 	= new LinkedHashMap <String, String>();

			final var subRegions	= getAllSubRegions(request);

			for(final Branch branch : allGroupBranches)
				if(StringUtils.contains(StringUtils.lowerCase(branch.getName()), StringUtils.lowerCase(str))
						&& (branch.getTypeOfLocation() == typeOfLocaion || showPhysicalOrOperationalBothBranch) && (executiveType == Executive.EXECUTIVE_TYPE_GROUPADMIN
						|| executiveType == Executive.EXECUTIVE_TYPE_REGIONADMIN && id == branch.getRegionId()
						|| executiveType == Executive.EXECUTIVE_TYPE_SUBREGIONADMIN && id == branch.getSubRegionId()
						|| id == branch.getBranchId()))
					destinationList.put(getBranchWithSubregionName(subRegions, branch), getDestinationIdStr(branch));

			return destinationList;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public int getModuleWiseDiscountLimit(final HttpServletRequest request, final long accountGroupId, final String discountLimitAllowConstant, final String discountLimitPercentConstant) throws Exception {
		var				discountPercent						= 0;

		try {
			final var	discountLimitConfig	= getModuleWiseDiscountLimitConfig(request, accountGroupId);

			final var	execFldPermissions = getExecutiveFieldPermission(request);

			final var	isDiscountLimitAllow				= PropertiesUtility.isAllow(discountLimitConfig.getString(ModuleWiseDiscountLimitConfigurationDTO.IS_DISCOUNT_LIMIT_ALLOW, "false"));
			final var	isModuleWiseDiscountLimitAllow		= PropertiesUtility.isAllow(discountLimitConfig.getString(discountLimitAllowConstant, "false"));

			if(isDiscountLimitAllow && isModuleWiseDiscountLimitAllow && execFldPermissions != null && execFldPermissions.get(FeildPermissionsConstant.SKIP_DISCOUNT) == null) {
				final var	discountPercentString	= discountLimitConfig.getString(discountLimitPercentConstant, null);

				if(discountPercentString != null)
					discountPercent			= Integer.parseInt(discountPercentString);
			}

			return discountPercent;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public ValueObject getModuleWiseDiscountLimitConfig(final HttpServletRequest request, final long accountGroupId) throws Exception {
		try {
			return getOldConfiguration(request, accountGroupId, PropertiesFileConstants.MODULE_WISE_DISCOUNT_LIMIT_CONFIG);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public String getOwnGroupBranchesStringById(final HttpServletRequest request, final long accountGroupId, final short type, final long id) throws Exception {
		try {
			final var	allGroupBranches	= getAllGroupBranchesList(request, accountGroupId);

			final var branchList	= allGroupBranches.stream().filter(e -> e.getMappingTypeId() == Branch.OWN_BRANCH).toList();

			return filterBranchIdsOnDataType(type, id, branchList);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public Map<String, String> getOperationalLocations(final HttpServletRequest request, final String str, final long accountGroupId, final long locationId) throws Exception {
		try {
			final var	allGroupBranches 	 = getAllActiveGroupBranchesList(request, accountGroupId);
			final Map<String, String>	destinationList 	 = new TreeMap <>();

			final var subRegions	= getAllSubRegions(request);
			final List<Branch> filteredList	= ListFilterUtility.filterList(allGroupBranches, br -> StringUtils.contains(StringUtils.lowerCase(br.getName()), StringUtils.lowerCase(str)) && (br.getTypeOfLocation() == Branch.TYPE_OF_LOCATION_OPERATIONAL_PLACE || br.getBranchId() == locationId));

			for(final Branch br : filteredList)
				destinationList.put(getBranchWithSubregionName(subRegions, br), br.getBranchId() + "_" + br.getCityId() + "_" + br.getStateId() + "_" + br.getTypeOfLocation());

			return destinationList;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public Map<String, String> getAllPhysicalAndOperationalLocations(final HttpServletRequest request, final String str, final long accountGroupId) throws Exception {
		try {
			final var	allGroupBranches 	 = getAllActiveGroupBranchesList(request, accountGroupId);
			final Map<String, String>	destinationList 	 = new TreeMap <>();

			final var subRegions	= getAllSubRegions(request);

			final List<Branch> filteredList	= ListFilterUtility.filterList(allGroupBranches, br -> StringUtils.contains(StringUtils.lowerCase(br.getName()), StringUtils.lowerCase(str)) && (br.getBranchType() == Branch.BRANCH_TYPE_BOOKING_DELIVERY_BOTH || br.getBranchType() == Branch.BRANCH_TYPE_DELIVERY));

			for(final Branch branch : filteredList)
				destinationList.put(getBranchWithSubregionName(subRegions, branch), getDestinationIdStrWithLocation(branch));

			return destinationList;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public Map<String, String> getAllPhysicalAndOperationalBySubRgionBranches(final HttpServletRequest request, final String str, final long accountGroupId,final long subRegionId) throws Exception {
		try {
			final var	subRegionBranches 	 = getBranchesBySubRegionId(request, accountGroupId, subRegionId);
			final Map<String, String>	sourceList 	 		 = new TreeMap <>();

			final var subRegions	= getAllSubRegions(request);

			for(final Map.Entry<Long, Branch> entry : subRegionBranches.entrySet()) {
				final var	branch 		= entry.getValue();

				if(!branch.isMarkForDelete()
						&& branch.getStatus() == Branch.BRANCH_ACTIVE
						&& StringUtils.contains(StringUtils.lowerCase(branch.getName()), StringUtils.lowerCase(str)) && (branch.getBranchType() == Branch.BRANCH_TYPE_BOOKING_DELIVERY_BOTH || branch.getBranchType() == Branch.BRANCH_TYPE_BOOKING))
					sourceList.put(getBranchWithSubregionName(subRegions, branch), getDestinationIdStrWithLocation(branch));
			}

			return sourceList;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public Map<String, String> getAllPhysicalAndOperationalDestinationBySubRgionBranches(final HttpServletRequest request, final String str, final long accountGroupId,final long subRegionId) throws Exception {
		try {
			final var	subRegionBranches 	 = getBranchesBySubRegionId(request, accountGroupId, subRegionId);
			final Map<String, String>	sourceList 	 		 = new TreeMap <>();

			final var subRegions	= getAllSubRegions(request);

			for (final Long key : subRegionBranches.keySet()) {
				final var	branch 	= subRegionBranches.get(key);

				if(!branch.isMarkForDelete()
						&& branch.getStatus() == Branch.BRANCH_ACTIVE
						&& StringUtils.contains(StringUtils.lowerCase(branch.getName()), StringUtils.lowerCase(str)) && (branch.getBranchType() == Branch.BRANCH_TYPE_BOOKING_DELIVERY_BOTH || branch.getBranchType() == Branch.BRANCH_TYPE_DELIVERY))
					sourceList.put(getBranchWithSubregionName(subRegions, branch), getDestinationIdStrWithLocation(branch) + "_" + branch.getAccountGroupId() + "_" + branch.getBranchCode() + "_" + branch.getSubRegionId() + "_" + branch.getPincode() + "_" + branch.getRegionId() + "_" + branch.isAgentBranch() + "_" + branch.getGstn());
			}

			return sourceList;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public Map<String, String> getAllPhysicalAndOperationalByRgionBranches(final HttpServletRequest request, final String str, final long accountGroupId,final long regionId) throws Exception {
		try {
			final var	regionBranches 	 = getBranchesByRegionId(request, accountGroupId, regionId);
			final Map<String, String>	sourceList 			 = new TreeMap <>();

			for (final Long key : regionBranches.keySet()) {
				final var	branch 		= regionBranches.get(key);

				if(!branch.isMarkForDelete()
						&& branch.getStatus() == Branch.BRANCH_ACTIVE
						&& StringUtils.contains(StringUtils.lowerCase(branch.getName()), StringUtils.lowerCase(str)) && (branch.getBranchType() == Branch.BRANCH_TYPE_BOOKING_DELIVERY_BOTH || branch.getBranchType() == Branch.BRANCH_TYPE_BOOKING))
					sourceList.put(getBranchWithRegionName(request, branch, accountGroupId), getDestinationIdStrWithLocation(branch));
			}

			return sourceList;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private String getBranchWithRegionName(final HttpServletRequest request, final Branch branch, final long accountGroupId) throws Exception {
		try {
			final var	region = getRegionByIdAndGroupId(request, branch.getRegionId(), accountGroupId);

			if(region != null)
				return branch.getName() + " ( " + StringUtils.upperCase(region.getName()) + " )";

			return branch.getName();
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public HashMap<Long, Branch> getWithoutMergingBranchesBySubRegionId(final HttpServletRequest request, final long accountGroupId, final long subRegionId) throws Exception {
		final var allGroupBranches = getAllGroupBranchesList(request, accountGroupId);
		final var subRegionBranches = new HashMap<Long, Branch>();

		allGroupBranches.stream().filter(br -> br.getSubRegionId() == subRegionId).forEach(br -> subRegionBranches.put(br.getBranchId(), br));

		return subRegionBranches;
	}

	public Map<Long, String> getSubRegionListByAccountGroupId(final HttpServletRequest request, final Executive executive, final String str) throws Exception {
		try {
			final var		subRegionArr		= getSubRegionsByGroupId(request, executive.getAccountGroupId());
			final List<SubRegion>	allSubRegionsList	= Arrays.asList(subRegionArr);

			final Map<Long, String>		finalSubRegionHM	= new HashMap<>();

			if(allSubRegionsList != null && !allSubRegionsList.isEmpty()) {
				final Map<Long, SubRegion>	subRegionHM		= allSubRegionsList.parallelStream()
						.collect(Collectors.toMap(SubRegion :: getSubRegionId, b -> b));

				if(!subRegionHM.isEmpty())
					subRegionHM.forEach((subRegionId, subRegion) -> {
						try {
							if(isSubRegionExists(subRegion, str))
								finalSubRegionHM.put(subRegionId, subRegion.getName());
						} catch (final Exception e) {
							e.printStackTrace();
						}
					});
			}

			return finalSubRegionHM;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public boolean isSubRegionExists(final SubRegion subRegion, final String str) throws Exception {
		try {
			return subRegion != null && subRegion.getName() != null
					&& StringUtils.contains(StringUtils.lowerCase(subRegion.getName()), StringUtils.lowerCase(str));
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public List<Branch> getBranchesWithGroupingBranchesList(final HttpServletRequest request, final String acc, final String city, final long branchId, final int branchTypeBookingOrDelivery) throws Exception{
		try {
			final Long	accountGroupId 			= Utility.getLong(StringUtils.trim(acc));
			final Long	subRegionId         	= Utility.getLong(StringUtils.trim(city));
			final var	branchCollection		= getGroupBranchCollection(request, branchId);

			final var branchList	= getAllActiveGroupBranchesList(request, accountGroupId);

			return ListFilterUtility.filterList(branchList, b -> b.getCityId() == subRegionId && (b.getBranchType() == Branch.BRANCH_TYPE_BOOKING_DELIVERY_BOTH || b.getBranchType() == branchTypeBookingOrDelivery)
					&& (b.getMappingTypeId() == Branch.BRANCH_MAP_ID_OWN_BRANCH_AND_ASSIGNED || b.getMappingTypeId() == Branch.BRANCH_MAP_ID_NOT_OWN_BRANCH_AND_ASSIGNED
					&& branchCollection.contains(b.getBranchId())));
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	@SuppressWarnings("unchecked")
	public Map<Long, ArticleTypeMaster> getArticleTypeMasterData(final HttpServletRequest request) {
		Map<Long, ArticleTypeMaster>			articleHM	= null;

		try {
			articleHM = (Map<Long, ArticleTypeMaster>) getContextAttribute(request, ARTICLE_TYPE_MASTER);

			if(articleHM == null)
				articleHM = refreshArticleTypeMasterData(request);
		} catch(final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
		}

		return articleHM;
	}

	private Map<Long, ArticleTypeMaster> refreshArticleTypeMasterData(final HttpServletRequest request) throws Exception {
		Map<Long, ArticleTypeMaster>			articleHM	= new HashMap<>();

		try {
			final var articleTypeMasterResult = ArticleTypeMasterDaoImpl.getInstance().findAll();

			if(ObjectUtils.isNotEmpty(articleTypeMasterResult)) {
				articleHM = articleTypeMasterResult.stream()
						.collect(Collectors.toMap(ArticleTypeMaster::getArticleTypeMasterId, Function.identity(), (e1, e2) -> e1));

				setContextAttribute(request, ARTICLE_TYPE_MASTER, articleHM);
			}
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}

		return articleHM;
	}

	public ValueObject getPackingTypeMasterData(final HttpServletRequest request) {
		ValueObject			valueObject	= null;

		try {
			valueObject = (ValueObject) getContextAttribute(request, PACKING_TYPE_MASTER);

			if(valueObject == null) {
				refreshCacheForPackingTypeMaster(request);
				valueObject = (ValueObject) getContextAttribute(request, PACKING_TYPE_MASTER);
			}
		} catch(final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
		}

		return valueObject;
	}

	public WayBillType[] getAllWayBillType(final HttpServletRequest request) {
		WayBillType[] wayBillTypeResult	= null;

		try {
			wayBillTypeResult		= (WayBillType[]) getContextAttribute(request, WAY_BILL_TYPE_ALL);

			if(wayBillTypeResult != null) {
				cacheAllLRTypeData(request);
				wayBillTypeResult	= (WayBillType[]) getContextAttribute(request, WAY_BILL_TYPE_ALL);
			}
		} catch (final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
		}

		return wayBillTypeResult;
	}

	private void cacheAllLRTypeData(final HttpServletRequest request) throws Exception {
		try {
			final var wayBillTypeResult = WayBillTypeDao.getInstance().findAll();
			final var   wayBillType       = new ValueObject();

			for (final WayBillType waBillType : wayBillTypeResult)
				wayBillType.put(Long.toString(waBillType.getWayBillTypeId()), waBillType);

			setContextAttribute(request, WAY_BILL_TYPE, wayBillType);
			setContextAttribute(request, WAY_BILL_TYPE_ALL, wayBillTypeResult);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public HashMap<Long, String> getCityListWithName(final HttpServletRequest request, final Executive executive) throws Exception {
		try {
			final var 			cityForGroup 	= getAllCitiesForGroup(request, executive.getAccountGroupId());

			final HashMap<Long, String>	cityList 		= new LinkedHashMap<>();

			for (final CityForGroup element : cityForGroup)
				cityList.put(element.getCityId(), element.getCityName());

			return cityList;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public HashMap<Long, Branch> getAllGroupBranches(final HttpServletRequest request, final long accountGroupId) throws Exception {
		try {
			final var groupdata = getAccountGroupDataById(request, accountGroupId);

			var	allGroupBranches	= getAllGroupBranches(groupdata);

			if(allGroupBranches == null) {
				allGroupBranches	= refreshAllGroupBranchesData(request, accountGroupId);
				groupdata.put(ALL_GROUP_BRANCHES, allGroupBranches);
			}

			return allGroupBranches;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	@SuppressWarnings("unchecked")
	private HashMap<Long, Branch> refreshAllGroupBranchesData(final HttpServletRequest request, final long accountGroupId) throws Exception {
		try {
			final var	allGroupBranches	= new HashMap<Long, Branch>();
			final var	branchForGroupForCity	= getBranchForGroupForCity(request, accountGroupId);

			final var defaultKeys	= branchForGroupForCity.keySet();

			for(final Object ob : defaultKeys)
				try {
					final var	branches	= (ValueObject) branchForGroupForCity.get(ob);
					final List<Branch>	branchList = new ArrayList<>((Collection<? extends Branch>) PojoFilter.cast(branches.getHtData().values(), Branch.class));

					branchList.forEach((final Branch br) -> allGroupBranches.put(br.getBranchId(), br));
				} catch (final Exception e) {
					ExceptionProcess.execute(e, TRACE_ID);
				}

			final var groupdata = getAccountGroupDataById(request, accountGroupId);
			groupdata.put(ALL_GROUP_BRANCHES, allGroupBranches);

			return allGroupBranches;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public List<Branch> getAllGroupBranchesList(final HttpServletRequest request, final long accountGroupId) throws Exception {
		final var	allGroupBranches 	 = getAllGroupBranches(request, accountGroupId);

		if(ObjectUtils.isEmpty(allGroupBranches))
			return Collections.emptyList();

		return allGroupBranches.values().stream().toList();
	}

	public List<Branch> getAllActiveGroupBranchesList(final HttpServletRequest request, final long accountGroupId) throws Exception {
		final var	allGroupBranches 	 = getAllGroupBranchesList(request, accountGroupId);

		return ListFilterUtility.filterList(allGroupBranches, e -> !e.isMarkForDelete() && e.getStatus() == Branch.BRANCH_ACTIVE);
	}

	public List<Branch> getAllActiveGroupBranchesByRegionId(final HttpServletRequest request, final long accountGroupId, final long regionId) throws Exception {
		final var	allGroupBranches 	 = getAllActiveGroupBranchesList(request, accountGroupId);

		return ListFilterUtility.filterList(allGroupBranches, e -> e.getRegionId() == regionId);
	}

	@SuppressWarnings("unchecked")
	public List<TaxModel> getTaxes(final HttpServletRequest request, final Executive executive) throws Exception {
		try {
			final var	groupdata		= getAccountGroupDataById(request, executive.getAccountGroupId());

			var	tax				= (List<TaxModel>) groupdata.get(TAXES);

			if(tax == null)
				tax = refreshTaxes(request, executive.getAccountGroupId());

			return tax;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public List<TaxModel> refreshTaxes(final HttpServletRequest request, final long accountGroupId) throws Exception {
		try {
			final var	tax = TaxMasterDaoImpl.getInstance().getOldTaxConfiguartion(accountGroupId);

			final var	groupdata		= getAccountGroupDataById(request, accountGroupId);
			groupdata.put(TAXES, tax);

			return tax;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	@SuppressWarnings("unchecked")
	public Map<String, ExecutiveFunctionsModel> getExecFunctions(final HttpServletRequest request) {
		return (Map<String, ExecutiveFunctionsModel>) request.getSession().getAttribute(ExecutiveFunctionsModel.EXECUTIVE_FUNCTION);
	}

	public PackingTypeMaster[] getPackingTypeData(final HttpServletRequest request, final long accountGroupId) throws Exception {
		try {
			final var	packingType 					= getPackingTypeDataList(request, accountGroupId);

			if(ObjectUtils.isEmpty(packingType))
				return new PackingTypeMaster[0];

			return packingType.toArray(new PackingTypeMaster[packingType.size()]);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public List<PackingTypeMaster> getPackingTypeDataList(final HttpServletRequest request, final long accountGroupId) throws Exception {
		try {
			final var 	packingTypeForGroup = getPackingTypeForGroup(request, accountGroupId);

			if(ObjectUtils.isEmpty(packingTypeForGroup))
				return Collections.emptyList();

			final var	packingTypeMaster	= getPackingTypeMasterData(request);
			final List<PackingTypeMaster>	packingType 					= new ArrayList<>();

			for (final PackingTypeForGroup element : packingTypeForGroup) {
				final var pacForGroup = (PackingTypeMaster) packingTypeMaster.get(Long.toString(element.getTypeOfPackingMasterId()));

				if(pacForGroup != null)
					packingType.add(pacForGroup);
			}

			return packingType;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public VehicleType[] getVehicleTypeForGroup(final HttpServletRequest request, final long accountGroupId) throws Exception {
		final var 	groupData 		= getAccountGroupDataById(request, accountGroupId);
		var 		vehicleTypes 	= (VehicleType[]) groupData.get(VEHICLE_TYPES);

		if(vehicleTypes == null)
			vehicleTypes	= refreshCacheForVehicleType(request, accountGroupId);

		return vehicleTypes;
	}

	public PackingTypeForGroup[] getPackingTypeForGroup(final HttpServletRequest request, final long accountGroupId) throws Exception {
		try {
			final var 		groupData 			= getAccountGroupDataById(request, accountGroupId);
			var 	latestPackingTypeForGroup 	= (PackingTypeForGroup[]) groupData.get(PACKING_TYPE_FOR_GROUP);

			if(latestPackingTypeForGroup == null)
				latestPackingTypeForGroup = refreshCacheForPackingTypeForGroup(request, accountGroupId);

			return latestPackingTypeForGroup;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public PackingTypeMaster[] getAllPackingType(final HttpServletRequest request, final long accountGroupId) throws Exception {
		try {
			final var 	packingTypeForGroups = getPackingTypeForGroup(request, accountGroupId);

			if (ObjectUtils.isEmpty(packingTypeForGroups))
				return null;

			final var    packingTypeMaster   = getPackingTypeMasterData(request);
			final List<PackingTypeMaster>	packingTypeForGrpArr = new ArrayList<>();

			for (final PackingTypeForGroup packingTypeForGroup : packingTypeForGroups)
				if(!packingTypeForGroup.isMarkForDelete() && packingTypeMaster.get(Long.toString(packingTypeForGroup.getTypeOfPackingMasterId())) != null)
					packingTypeForGrpArr.add((PackingTypeMaster) packingTypeMaster.get(Long.toString(packingTypeForGroup.getTypeOfPackingMasterId())));

			if(ObjectUtils.isEmpty(packingTypeForGrpArr)) return null;

			final var	packingType = new PackingTypeMaster[packingTypeForGrpArr.size()];
			packingTypeForGrpArr.toArray(packingType);

			return packingType;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public ArticleTypeForGroup[] getArticleTypeForGroup(final HttpServletRequest request, final long accountGroupId) throws Exception {
		try {
			final var 		groupData 		= getAccountGroupDataById(request, accountGroupId);
			var 	articleTypeForGroup 	= (ArticleTypeForGroup[]) groupData.get(ARTICLE_TYPE_FOR_GROUP);

			if(articleTypeForGroup == null) {
				articleTypeForGroup = ArticleTypeForGroupDao.getInstance().findByAccountGroupId(accountGroupId);
				groupData.put(ARTICLE_TYPE_FOR_GROUP, articleTypeForGroup);
			}

			return articleTypeForGroup;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public Commodity[] getCommodityForGroup(final HttpServletRequest request, final long accountGroupId) throws Exception {
		try {
			final var	groupData	= getAccountGroupDataById(request, accountGroupId);

			var	commodities	= (Commodity[]) groupData.get(COMMODITIES);

			if(commodities == null)
				commodities	= refreshCacheForCommodity(request, accountGroupId);

			return commodities;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	@SuppressWarnings("unchecked")
	public ArrayList<Short> getWayBillTypeList(final HttpServletRequest request, final long accountGroupId) throws Exception {
		ArrayList<Short>			wayBillTypes					= null;

		try {
			wayBillTypes		= (ArrayList<Short>) request.getSession().getAttribute("wayBillTypes");

			if(wayBillTypes == null) {
				final var	configParams	= getConfigParam(request, accountGroupId);

				// Get the WayBillType Permission
				wayBillTypes 	= (ArrayList<Short>) configParams.stream()
						.filter(e -> e.getConfigKey() == ConfigKeyConstant.CONFIG_KEY_WAYBILLTYPE)
						.map(e -> Short.parseShort(Integer.toString(e.getConfigValue()))).collect(CollectionUtility.getList());

				request.getSession().setAttribute("wayBillTypes", wayBillTypes);
			}
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}

		return wayBillTypes;
	}

	public AccountGroupNetworkConfiguration[] getAssignedAccountGroupNetwork(final HttpServletRequest request, final long accountGroupId) throws Exception {
		AccountGroupNetworkConfiguration[]			resultArray		= null;

		try {
			final var	groupData	= getAccountGroupDataById(request, accountGroupId);

			resultArray	= (AccountGroupNetworkConfiguration[]) groupData.get("assignedAccountGroupNetwork");

			if(resultArray == null) {
				resultArray		= AccountGroupNetworkConfigurationDao.getInstance().getAllAssignedAccountGroupByConfigAccountGroup(accountGroupId);
				groupData.put("assignedAccountGroupNetwork", resultArray);
			}
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}

		return resultArray;
	}

	public Map<String, String> getOperationalLocationsOfSubregion(final HttpServletRequest request, final String str, final long accountGroupId, final long subRegionId) throws Exception {
		try {
			final Map<String, String>	branchList 	 		 = new TreeMap <>();

			var branchesList	= getAllActiveGroupBranchesList(request, accountGroupId);

			branchesList	= ListFilterUtility.filterList(branchesList, e -> StringUtils.contains(StringUtils.lowerCase(e.getName()), StringUtils.lowerCase(str))
					&& e.getTypeOfLocation() == Branch.TYPE_OF_LOCATION_OPERATIONAL_PLACE
					&& e.getSubRegionId() == subRegionId);

			final var	subRegion	= getGenericSubRegionById(request, subRegionId);

			branchesList.forEach((final Branch branch) -> {
				final var	branchName = getBranchWithSubregionName(subRegion, branch);

				branchList.put(branchName, getDestinationIdStrWithLocation(branch));
			});

			return branchList;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public Branch getExecutiveBranch(final HttpServletRequest request, final long branchId) throws Exception {
		try {
			final var	branchData		= getBranchData(request, branchId);

			var	branch	= (Branch) branchData.get(BRANCH);

			if(branch == null) {
				branch     = BranchDao.getInstance().findByBranchId(branchId);
				branchData.put(BRANCH, branch);
			}

			return branch;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	@SuppressWarnings("unchecked")
	public ArrayList<Long> getSharedBranchesList(final HttpServletRequest request, final long accountGroupId) throws Exception {
		ArrayList<Long> sharedBranches = null;

		try {
			final var key	= "ActualAccountGroupDetails" + accountGroupId;
			var grpDetails = (HashMap<Long, Long>) getContextAttribute(request, key);

			if(grpDetails == null) {
				grpDetails		= BranchDao.getInstance().getActualAccountGroupDetails(accountGroupId);
				setContextAttribute(request, key, grpDetails);
			}

			sharedBranches	= (ArrayList<Long>) grpDetails.entrySet().stream().map(Entry::getKey).collect(CollectionUtility.getList());
		} catch (final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
		}

		return sharedBranches;
	}

	public Map<String, String> getSourceBranchAutocompleteForReverseEntry(final HttpServletRequest request, final long accountGroupId, final long branchId, final String strQry) throws Exception {
		List<Long> 				accountGroupIdListNotAllowedForReverseBooking 	= null;

		try {
			final var	groupConfig		= getGroupConfiguration(request, accountGroupId);
			final var	accountGroupHM	= getAccountGroupHM(request);
			final var 	subRegions		= getAllSubRegions(request);

			final var	isShowAccountGroupwithBranch			= groupConfig.getBoolean(GroupConfigurationPropertiesDTO.SHOW_ACCOUNTGROUP_IN_BRANCH_AUTOCOMPLETE_ON_BOOKING_PAGE, false);
			final var	showGroupMergingBranchInReverseBooking 	= groupConfig.getBoolean(GroupConfigurationPropertiesDTO.SHOW_GROUP_MERGING_BRANCH_IN_REVERSE_BOOKING, false);

			if(!showGroupMergingBranchInReverseBooking)
				accountGroupIdListNotAllowedForReverseBooking	= CollectionUtility.getLongListFromString(groupConfig.getString(GroupConfigurationPropertiesDTO.ACCOUNT_GROUP_ID_NOT_FOR_REVERSE_BOOKING));

			final var	branchNetworkConfigList			= BranchNetWorkConfigurationDao.getInstance().findByAssignBranchId(branchId);

			final Map <String, String>	destinationList			= new LinkedHashMap<>();

			for(final BranchNetWorkConfiguration branchNetworkConfig : branchNetworkConfigList) {
				final var	branch 		= getGenericBranchDetailCache(request, branchNetworkConfig.getConfigBranchId());

				if(branch == null || branch.getStatus() != Branch.BRANCH_ACTIVE || branch.isMarkForDelete()
						|| !StringUtils.contains(StringUtils.lowerCase(branch.getName()), StringUtils.lowerCase(strQry)))
					continue;

				if(showGroupMergingBranchInReverseBooking || !accountGroupIdListNotAllowedForReverseBooking.contains(branch.getAccountGroupId()))
					getSourceBranchesForReverseEntry(isShowAccountGroupwithBranch, branch, accountGroupHM, subRegions, destinationList);
			}

			return destinationList;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}

	}

	private void getSourceBranchesForReverseEntry(final boolean isShowAccountGroupwithBranch, final Branch branch, final HashMap<Long, AccountGroup> accountGroupHM, final ValueObject subRegions,
			final Map<String, String> destinationList) throws Exception {
		try {
			if(isShowAccountGroupwithBranch) {
				final var	accountGroup	= accountGroupHM.getOrDefault(branch.getAccountGroupId(), new AccountGroup());
				final var	subRegion		= (SubRegion) subRegions.get(branch.getSubRegionId());
				destinationList.put(getDestinationIdStrWithLocation(branch), branch.getName() + " ( " + subRegion.getName() + " )" + " ( " + accountGroup.getAccountGroupCode() + " ) ");
			} else
				destinationList.put(getDestinationIdStrWithLocation(branch), branch.getName());
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private SubRegion[] refreshSubRegionsFromAccountGroupNetworkConfig(final HttpServletRequest request, final long accountGroupId) throws Exception {
		try {
			final var groupdata = getAccountGroupDataById(request, accountGroupId);
			final var	accountGroupNetworkList	= SubRegionDao.getInstance().getAllSubRegionsForAccountGroupNetworkConfiguration(accountGroupId);

			if(accountGroupNetworkList != null)
				Arrays.asList(accountGroupNetworkList).forEach(f->{
					try {
						if(accountGroupId != f.getAccountGroupId())
							f.setName(f.getName() + " - " + f.getAccountGroupName());
					} catch (final Exception e3) {
						e3.printStackTrace();
					}
				});

			groupdata.put("subRegionFromAccountGroupNetwork", accountGroupNetworkList);

			return accountGroupNetworkList;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public SubRegion[] getSubRegionsFromAccountGroupNetworkConfig(final HttpServletRequest request, final long accountGroupId) throws Exception {
		try {
			final var groupdata = getAccountGroupDataById(request, accountGroupId);

			var	accountGroupNetworkList = (SubRegion[]) groupdata.get("subRegionFromAccountGroupNetwork");

			if(accountGroupNetworkList == null)
				accountGroupNetworkList	= refreshSubRegionsFromAccountGroupNetworkConfig(request, accountGroupId);

			return accountGroupNetworkList;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	@SuppressWarnings("unchecked")
	public Map<Long, BranchBookingDestinationMap> getBookingBranchSourceMap(final HttpServletRequest request, final long branchId) throws Exception {
		Map<Long, BranchBookingDestinationMap> 	branchBookingSourceMapHM	 	= null;

		try {
			final var	branchdata					= getBranchData(request, branchId);

			if(branchdata != null) {
				branchBookingSourceMapHM	= (Map<Long, BranchBookingDestinationMap>) branchdata.get("branchBookingSourceMapHM");

				if(branchBookingSourceMapHM == null) {
					final var	branchBookingDestinationConfig 	= BranchBookingDestinationConfigDao.getInstance().getBranchBookingDestinationConfigByBranchId(branchId);

					if(branchBookingDestinationConfig != null && branchBookingDestinationConfig.getConfigType() != BranchBookingDestinationConfig.CONFIGTYPE_ALL) {
						branchBookingSourceMapHM = BranchBookingDestinationMapDao.getInstance().getBranchBookingSourceMapListByBranchId(branchId);

						if(branchBookingSourceMapHM != null && branchBookingSourceMapHM.size() > 0)
							branchdata.put("branchBookingSourceMapHM", branchBookingSourceMapHM);
					}
				}
			}

			return branchBookingSourceMapHM;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	@SuppressWarnings("unchecked")
	public Map<Long, BranchBookingDestinationMap> getBookingBranchDestinationMap(final HttpServletRequest request, final long branchId) throws Exception {
		Map<Long, BranchBookingDestinationMap> 		branchBookingDestinationMapHM 	= null;

		try {
			final var	branchdata						= getBranchData(request, branchId);

			if(branchdata != null) {
				branchBookingDestinationMapHM	= (Map<Long, BranchBookingDestinationMap>) branchdata.get("branchBookingDestinationMapHM");

				if(branchBookingDestinationMapHM == null) {
					final var	branchBookingDestinationConfig 	= getSourceBranchWiseDestinationBranchConfigured(branchId);

					if(branchBookingDestinationConfig != null && branchBookingDestinationConfig.getConfigType() != BranchBookingDestinationConfig.CONFIGTYPE_ALL) {
						branchBookingDestinationMapHM  = BranchBookingDestinationMapDao.getInstance().getBranchBookingDestinationMapListByBranchId(branchId);

						if(branchBookingDestinationMapHM != null && branchBookingDestinationMapHM.size() > 0)
							branchdata.put("branchBookingDestinationMapHM", branchBookingDestinationMapHM);
					}
				}
			}

			return branchBookingDestinationMapHM;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	@SuppressWarnings("unchecked")
	public List<BranchPermission> getBranchPermissionData(final HttpServletRequest request, final long accountGroupId, final long branchId) throws Exception {
		try {
			final var	branchData			= getBranchData(request, branchId);
			var	branchPermissionList		= (List<BranchPermission>) branchData.get("branchPermissions");

			if(ObjectUtils.isEmpty(branchPermissionList)) {
				branchPermissionList		= BranchPermissionDao.getInstance().getBranchPermission(accountGroupId, branchId);
				branchData.put("branchPermissions", branchPermissionList);
			}

			return branchPermissionList;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public void refreshBranchPermissionData(final HttpServletRequest request, final long accountGroupId, final long branchId) throws Exception {
		try {
			final var	branchData		= getBranchData(request, branchId);
			branchData.put("branchPermissions", BranchPermissionDao.getInstance().getBranchPermission(accountGroupId, branchId));
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public String getWebsiteURL(final HttpServletRequest request) throws Exception {
		String			ivCargoUrl			= null;

		try {
			ivCargoUrl		= (String) request.getSession().getAttribute(Constant.IV_CARGO_URL);

			if(ivCargoUrl == null) {
				ivCargoUrl	= ClientAddress.getWebsiteURL(request);
				request.getSession().setAttribute(Constant.IV_CARGO_URL, ivCargoUrl);
				request.getSession().setAttribute(Constant.WEBSITE_PATH, getWebsiteRealPath(request));
			}

			if(request.getSession().getServletContext().getAttribute("isPathUpdated") == null) {
				updateWebsitePath(request);
				setContextAttribute(request, "isPathUpdated", true);
			}
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}

		return ivCargoUrl;
	}

	public void updateWebsitePath(final HttpServletRequest request) {
		try {
			if ("localhost".equals(request.getServerName())) return;

			final var ivCargoUrl	= (String) request.getSession().getAttribute(Constant.IV_CARGO_URL);
			final var realPath		= (String) request.getSession().getAttribute(Constant.WEBSITE_PATH);

			ConfigurationDaoImpl.getInstance().updateDefaultValue(ServerIPAddressConfigurationConstant.SERVER_HOST, ivCargoUrl, ModuleIdentifierConstant.SERVER_IP_ADDRESS);
			ConfigurationDaoImpl.getInstance().updateDefaultValue(FolderLocationPropertiesConstant.WEBSITE_REAL_PATH, realPath, ModuleIdentifierConstant.FOLDER_LOCATION);

			refreshMemcacheConfiguration();
		} catch(final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private void refreshMemcacheConfiguration() {
		try {
			WSUtility.callPostWebService(WSUtility.getWebServiceUrl(Integer.toString(WebServiceURI.REFRESH_CONFIGURATION)), "&moduleId=" + ModuleIdentifierConstant.SERVER_IP_ADDRESS);
			WSUtility.callPostWebService(WSUtility.getWebServiceUrl(Integer.toString(WebServiceURI.REFRESH_CONFIGURATION)), "&moduleId=" + ModuleIdentifierConstant.FOLDER_LOCATION);
		} catch (final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public String getWebsiteRealPath(final HttpServletRequest request) throws Exception {
		try {
			return request.getSession().getServletContext().getRealPath(Constant.FORWARD_SLASH);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public void refreshAccountGroupPermission(final HttpServletRequest request, final long accountGroupId) throws Exception {
		try {
			final var	resultList = AccountGroupPermissionsDaoImpl.getInstance().getByAccountGroupId(accountGroupId);
			setContextAttribute(request, AccountGroupPermission.ACCOUNT_GROUP_PERMISSION + "_" + accountGroupId, resultList);
			Cache.getInstance().set(CacheKeyList.ACCOUNT_GROUP_PERMISSION + "_" + accountGroupId, 0, resultList);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	@SuppressWarnings("unchecked")
	public List<AccountGroupPermission> getAccountGroupPermission(final HttpServletRequest request, final long accountGroupId) throws Exception {
		try {
			var	accountGroupPermissionList = (List<AccountGroupPermission>) getContextAttribute(request, AccountGroupPermission.ACCOUNT_GROUP_PERMISSION + "_" + accountGroupId);

			if(ObjectUtils.isEmpty(accountGroupPermissionList)) {
				refreshAccountGroupPermission(request, accountGroupId);
				accountGroupPermissionList = (List<AccountGroupPermission>) getContextAttribute(request, AccountGroupPermission.ACCOUNT_GROUP_PERMISSION + "_" + accountGroupId);
			}

			return accountGroupPermissionList;
		} catch(final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public Map<String, AccountGroupPermission> getGroupPermissionHMByIdAndType(final HttpServletRequest request, final long accountGroupId) throws Exception {
		try {
			var	accountGroupPermissionList	= getAccountGroupPermission(request, accountGroupId);

			if(accountGroupPermissionList == null)
				accountGroupPermissionList	= AccountGroupPermissionsDaoImpl.getInstance().getByAccountGroupId(accountGroupId);

			return accountGroupPermissionList.stream()
					.collect(Collectors.toMap(AccountGroupPermission::getPermissionIdWithTypeId, Function.identity(), (e1, e2) -> e1));
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private Object getContextAttribute(final HttpServletRequest request, final String key) {
		if(request.getSession(false) == null)
			return null;

		return request.getSession().getServletContext().getAttribute(key);
	}

	private void setContextAttribute(final HttpServletRequest request, final String key, final Object value) {
		request.getSession().getServletContext().setAttribute(key, value);
	}

	public Map<String, AccountGroupPermission> getGroupPermissionHMByUniqueName(final HttpServletRequest request, final long accountGroupId) throws Exception {
		try {
			var accountGroupPermissionList	= getAccountGroupPermission(request, accountGroupId);

			if(accountGroupPermissionList == null)
				accountGroupPermissionList	= AccountGroupPermissionsDaoImpl.getInstance().getByAccountGroupId(accountGroupId);

			return accountGroupPermissionList.stream().filter(e -> e.getUniqueName() != null)
					.collect(Collectors.toMap(AccountGroupPermission::getUniqueName, Function.identity(), (e1, e2) -> e1));
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public String getAssignedBranchStringByAssignedAccountGroupId(final HttpServletRequest request, final long configAccountGroupId, final long assignAccountGroupId) throws Exception {
		try {
			final Map<Long, Branch>	assignedBranchHM  = getAssignedBranchListByAssignedAccountGroupId(request, configAccountGroupId, assignAccountGroupId);

			if (ObjectUtils.isEmpty(assignedBranchHM)) return null;

			return assignedBranchHM.entrySet().stream().map(e -> Long.toString(e.getKey())).collect(Collectors.joining(","));
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public Branch[] getAssignedBranchArrayByAssignedAccountGroupId(final HttpServletRequest request, final long configAccountGroupId, final long assignAccountGroupId) throws Exception {
		try {
			final Map<Long, Branch>	assignedBranchHM  = getAssignedBranchListByAssignedAccountGroupId(request, configAccountGroupId, assignAccountGroupId);

			if (ObjectUtils.isEmpty(assignedBranchHM)) return null;

			return assignedBranchHM.values().toArray(new Branch[assignedBranchHM.size()]);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public List<Branch> getOwnGroupBranchesListById(final HttpServletRequest request, final long accountGroupId) throws Exception {
		try {
			final var branchList	= getAllGroupBranchesList(request, accountGroupId);

			return ListFilterUtility.filterList(branchList, branch -> branch.getMappingTypeId() == Branch.OWN_BRANCH);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	@SuppressWarnings("unchecked")
	public Map<Long, String> getCategoryTypesForGroup(final HttpServletRequest request, final long accountGroupId) throws Exception {
		Map<Long, String>			categoryTypeHM			= null;

		try {
			var	categoryTypeForGroup	= (List<CategoryTypeMaster>) getContextAttribute(request, CategoryTypeMaster.CATEGORY_TYPE_MASTER + "_" + accountGroupId);

			if (ObjectUtils.isEmpty(categoryTypeForGroup)) {
				refreshCategoryTypes(request, accountGroupId);
				categoryTypeForGroup	= (List<CategoryTypeMaster>) getContextAttribute(request, CategoryTypeMaster.CATEGORY_TYPE_MASTER + "_" + accountGroupId);
			}

			if(ObjectUtils.isNotEmpty(categoryTypeForGroup))
				categoryTypeHM	= categoryTypeForGroup.stream().filter(e -> !e.getMarkForDelete()).collect(Collectors.toMap(CategoryTypeMaster::getCategoryTypeId, CategoryTypeMaster::getName));

			return categoryTypeHM;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public void refreshCategoryTypes(final HttpServletRequest request, final long accountGroupId) throws Exception {
		try {
			setContextAttribute(request, CategoryTypeMaster.CATEGORY_TYPE_MASTER + "_" + accountGroupId, CategoryTypeMasterDaoImpl.getInstance().getAllCategoryType(accountGroupId));
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public Map<Object, Object> getTDSConfiguration(final HttpServletRequest request, final long accountGroupId, final long subModuleId) throws Exception {
		try {
			return getConfiguration(request, accountGroupId, ModuleIdentifierConstant.TDS, subModuleId);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public Map<Object, Object> getPODWayBillConfiguration(final HttpServletRequest request, final long accountGroupId) throws Exception {
		try {
			return getConfiguration(request, accountGroupId, ModuleIdentifierConstant.POD_WAYBILL);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public Map<Object, Object> getLhpvConfiguration(final HttpServletRequest request, final long accountGroupId) throws Exception {
		try {
			return getConfiguration(request, accountGroupId, ModuleIdentifierConstant.LHPV);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public Map<Object, Object> getReceiveConfiguration(final HttpServletRequest request, final long accountGroupId) throws Exception {
		try {
			return getConfiguration(request, accountGroupId, ModuleIdentifierConstant.RECEIVE);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public Map<Object, Object> getConfiguration(final HttpServletRequest request, final long moduleId) throws Exception {
		try {
			return getConfiguration(request, 0, moduleId);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public Map<Object, Object> getConfiguration(final HttpServletRequest request, final long accountGroupId, final long moduleId) throws Exception {
		try {
			return ConfigurationCache.getInstance().getConfigurationData(request, accountGroupId, moduleId);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public Map<Object, Object> getConfiguration(final HttpServletRequest request, final long accountGroupId, final long moduleId, final long subModuleId) throws Exception {
		try {
			return ConfigurationCache.getInstance().getConfigurationData(request, accountGroupId, moduleId, subModuleId);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public ValueObject getOldConfiguration(final HttpServletRequest request, final long accountGroupId, final long moduleId) throws Exception {
		try {
			return ConfigurationCache.getInstance().getOldConfigurationData(request, accountGroupId, moduleId);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	@SuppressWarnings("unchecked")
	public Map<String, BusinessFunctions> getBusinessFunctions(final HttpServletRequest request) throws Exception {
		try {
			var businessFunctionsHM	= (Map<String, BusinessFunctions>) getContextAttribute(request, BusinessFunctions.BUSINESS_FUNCTIONS);

			if(ObjectUtils.isEmpty(businessFunctionsHM)) {
				refreshBusinessFunctions(request);
				businessFunctionsHM	= (Map<String, BusinessFunctions>) getContextAttribute(request, BusinessFunctions.BUSINESS_FUNCTIONS);
			}

			return businessFunctionsHM;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public void refreshBusinessFunctions(final HttpServletRequest request) throws Exception {
		final var	businessFunctions	= BusinessFunctionsDaoImpl.getInstance().getAllBusinessFunctions();
		setContextAttribute(request, BusinessFunctions.BUSINESS_FUNCTIONS, businessFunctions.stream().collect(Collectors.toMap(BusinessFunctions::getUniqueName, Function.identity(), (e1, e2) -> e1)));
	}

	public void getConfigurationData(final HttpServletRequest request, final long accountGroupId, final ValueObject valueInObject) {
		try {
			valueInObject.put(PaymentTypePropertiesConstant.PHONE_PAY_PAYMENT_TYPE_CONFIGURATION, getConfiguration(request, accountGroupId, ModuleIdentifierConstant.PAYMENT_TYPE, ModuleIdentifierConstant.PHONE_PE_API));
			valueInObject.put(ServerIPAddressConfigurationConstant.SERVER_IP_ADDRESS, getConfiguration(request, ModuleIdentifierConstant.SERVER_IP_ADDRESS));
			valueInObject.put(SyncWithNexusPropertiesConstant.SYNC_WITH_NEXUS, getConfiguration(request, ModuleIdentifierConstant.SYNC_WITH_TCE_NEXUS));
			valueInObject.put(FolderLocationPropertiesConstant.FOLDER_LOCATION_CONFIGURATION, getConfiguration(request, ModuleIdentifierConstant.FOLDER_LOCATION));
		} catch (final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public boolean isTceActive(final HttpServletRequest request, final long accountGroupId) {
		return getContextAttribute(request, Constant.IS_ACTIVE_TCE_GROUP + "_" + accountGroupId) != null && (boolean) getContextAttribute(request, Constant.IS_ACTIVE_TCE_GROUP + "_" + accountGroupId) ;
	}

	public String getBranchesBySubRegionForReport(final HttpServletRequest request) throws Exception {
		try {
			final var	subRegionId	= JSPUtility.GetLong(request, Constant.SUB_REGION_ID, 0);
			final var 	isListAll	= JSPUtility.GetBoolean(request, "isListAll", false);
			final var	executive	= getExecutive(request);

			final var	subRegionBranches 		= getBranchesBySubRegionId(request, executive.getAccountGroupId(), subRegionId);
			final var	preAccGrpPermission		= AccountGroupPermissionsDaoImpl.getInstance().getGroupLevelFeildPermission(executive.getAccountGroupId(), FeildPermissionsConstant.SHOW_DEACTIVATE_BRANCH);

			final var showDeActivateBranch = preAccGrpPermission != null && !preAccGrpPermission.isMarkForDelete();

			final var	str = new StringJoiner(Constant.COMMA);

			if(ObjectUtils.isNotEmpty(subRegionBranches))
				if(isListAll) {//Get ALL (for Reports)
					if(showDeActivateBranch)
						for(final Map.Entry<Long, Branch> entry : subRegionBranches.entrySet()) {
							final var	branch	= entry.getValue();

							final var actualAccountGroupId = getGenericBranchDetailCache(request, branch.getBranchId()).getAccountGroupId();

							if(branch.getAccountGroupId() == actualAccountGroupId)
								str.add(branch.getName() + "=" + branch.getBranchId());
						}
					else
						for(final Map.Entry<Long, Branch> entry : subRegionBranches.entrySet()) {
							final var	branch	= entry.getValue();

							final var actualAccountGroupId = getGenericBranchDetailCache(request, branch.getBranchId()).getAccountGroupId();

							if(!branch.isMarkForDelete() && branch.getAccountGroupId() == actualAccountGroupId)
								str.add(branch.getName() + "=" + branch.getBranchId());
						}
				} else
					for(final Map.Entry<Long, Branch> entry : subRegionBranches.entrySet()) {
						final var	branch	= entry.getValue();

						final var actualAccountGroupId = getGenericBranchDetailCache(request, branch.getBranchId()).getAccountGroupId();

						if((!branch.isMarkForDelete() || branch.getStatus() == Branch.BRANCH_DEACTIVE) && branch.getAccountGroupId() == actualAccountGroupId)
							str.add(branch.getName() + "=" + branch.getBranchId());
					}

			return str.toString();
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public String getBranchesBySubRegionForReport1(final HttpServletRequest request, final Executive executive) throws Exception {
		Map<Long, Branch>	subRegionBranches 		= null;

		try {
			final var	subRegionId				= JSPUtility.GetLong(request, Constant.SUB_REGION_ID, 0);
			final var 	isListAll				= JSPUtility.GetBoolean(request, "isListAll", false);
			final var	hideDeactiveBranches 	= JSPUtility.GetBoolean(request, "hideDeactiveBranches", false);
			final var	isShowAllBranches		= JSPUtility.GetBoolean(request, "isShowAllBranches", false);
			final var	isAllOption				= JSPUtility.GetBoolean(request, "isAllOption", false);
			final var	commonReportConfig		= getCommonReportsConfiguration(request, executive.getAccountGroupId());

			if(commonReportConfig.getBoolean(CommonReportsConfigurationDTO.IS_SHOW_WITHOUT_MERGING_GROUP_BRANCH_DATA))
				subRegionBranches	= getWithoutMergingBranchesBySubRegionId(request, executive.getAccountGroupId(), subRegionId);
			else
				subRegionBranches	= getBranchesBySubRegionId(request, executive.getAccountGroupId(), subRegionId);

			final var	str = new StringJoiner(Constant.COMMA);

			if(ObjectUtils.isNotEmpty(subRegionBranches)) {
				List<Branch> 	branchList	= new ArrayList<>(subRegionBranches.values());

				if(hideDeactiveBranches)
					branchList	= PojoFilter.filterList(branchList, e -> e.getStatus() == Branch.BRANCH_ACTIVE);

				branchList	= ListFilterUtility.filterList(branchList, e -> !e.isMarkForDelete());

				if(!isListAll || !isShowAllBranches)
					branchList	= ListFilterUtility.filterList(branchList, e -> !e.isMarkForDelete() && e.getTypeOfLocation() == Branch.TYPE_OF_LOCATION_PHYSICAL);

				if(ObjectUtils.isEmpty(branchList)) return null;

				branchList.forEach(branch -> str.add(branch.getName() + "=" + branch.getBranchId()));

				if(isAllOption)
					str.add("All = -1");
			}

			return str.toString();
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public StringBuilder getDestinationBranches(final HttpServletRequest request, final Executive executive) throws Exception {
		try {
			final var strQry				= request.getParameter("q");

			if(strQry == null) return new StringBuilder();

			final var branchType						= JSPUtility.GetInt(request, "branchType", 0);
			final var locationId						= JSPUtility.GetLong(request, "locationId", 0);
			final var isOwnGroupBranchesRequired		= JSPUtility.GetBoolean(request, "IsOwnGroupBranchesRequired", false);
			final var isOwnBranchWithLocationsRequired	= JSPUtility.GetBoolean(request, "isOwnBranchWithLocationsRequired", true);
			final var isOwnBranchRequired				= JSPUtility.GetBoolean(request, "isOwnBranchRequired", true);
			final var doNotShowOperationalBranch 		= JSPUtility.GetBoolean(request, "doNotShowOperationalBranch", false);
			final var setAutocompleteOnInitialChar 		= JSPUtility.GetBoolean(request, "setAutocompleteOnInitialChar", false);

			final var destList = getBranchAndCityWiseDestinationByNameAndGroupId(request, strQry, executive.getAccountGroupId(), branchType, locationId, isOwnGroupBranchesRequired, setAutocompleteOnInitialChar);

			if(ObjectUtils.isEmpty(destList))
				return new StringBuilder();

			final List<Long>	assignedLocations = getAssignedLocationsIdListByLocationIdId(request, locationId, executive.getAccountGroupId());

			final var strBfr	= new StringBuilder();

			for(final Map.Entry<String, String> entry : destList.entrySet()) {
				final var branchCityMap			= entry.getValue();
				final var branchCityMapSlipted	= branchCityMap.split("_");
				final var branchId				= Long.parseLong(branchCityMapSlipted[0]);

				final var	isBranchAllowed = (isOwnBranchWithLocationsRequired || !assignedLocations.contains(branchId)) && (isOwnBranchRequired || executive.getBranchId() != branchId);

				final var	br = getBranchById(request, executive.getAccountGroupId(), branchId);

				if(doNotShowOperationalBranch && br.getTypeOfLocation() == Branch.TYPE_OF_LOCATION_OPERATIONAL_PLACE || !isBranchAllowed)
					continue;

				strBfr.append(entry.getKey()).append("|").append(entry.getValue()).append("\n");
			}

			return strBfr;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	@SuppressWarnings("unchecked")
	public List<com.iv.dto.model.ChargeTypeModel> getBookingCharges(final HttpServletRequest request, final Executive executive) throws Exception {
		try {
			final var	groupData	= getAccountGroupDataById(request, executive.getAccountGroupId());

			var	charges		= (List<com.iv.dto.model.ChargeTypeModel>) groupData.get(CHARGES_NEW);

			if(charges == null)
				charges = refreshCacheForBookingCharges(request, executive.getAccountGroupId());

			return charges;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public List<com.iv.dto.model.ChargeTypeModel> refreshCacheForBookingCharges(final HttpServletRequest request, final long accountGroupId) throws Exception {
		try {
			final var 	groupData 		= getAccountGroupDataById(request, accountGroupId);
			final var 	bookingCharges 	= ChargeTypeMasterDaoImpl.getInstance().getChargeConfiguration(accountGroupId, 0, 0, ChargeTypeMaster.WAYBILL_CHARGETYPE_BOOKING);

			groupData.put(CHARGES_NEW, bookingCharges);

			return bookingCharges;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	@SuppressWarnings("unchecked")
	public List<com.iv.dto.model.ChargeTypeModel> getDeliveryCharges(final HttpServletRequest request, final Executive executive) throws Exception {
		try {
			final var groupdata 		= getAccountGroupDataById(request, executive.getAccountGroupId());

			var	charges		= (List<com.iv.dto.model.ChargeTypeModel>) groupdata.get(DELIVERY_CHARGES_NEW);

			if(charges == null)
				charges = refreshCacheForDeliveryCharges(request, executive.getAccountGroupId());

			return charges;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public List<com.iv.dto.model.ChargeTypeModel> refreshCacheForDeliveryCharges(final HttpServletRequest request, final long accountGroupId) throws Exception {
		try {
			final var groupData 		= getAccountGroupDataById(request, accountGroupId);
			final var deliveryCharges 	= ChargeTypeMasterDaoImpl.getInstance().getChargeConfiguration(accountGroupId, 0, 0, ChargeTypeMaster.WAYBILL_CHARGETYPE_DELIVERY);

			groupData.put(DELIVERY_CHARGES_NEW, deliveryCharges);

			return deliveryCharges;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public ChargeTypeModel[] getActiveBookingCharges(final HttpServletRequest request, final Executive executive) throws Exception {
		try {
			return convertChargeListToArray(getBookingCharges(request, executive));
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public ChargeTypeModel[] getActiveDeliveryCharges(final HttpServletRequest request, final Executive executive) throws Exception {
		try {
			return convertChargeListToArray(getDeliveryCharges(request, executive));
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private ChargeTypeModel[] convertChargeListToArray(List<com.iv.dto.model.ChargeTypeModel> charges) {
		charges	= ListFilterUtility.filterList(charges,  e -> e.getStatus() == ChargeTypeModel.CHARGE_STATUS_ACTIVE);

		final List<ChargeTypeModel> newChargeList	= new ArrayList<>();

		charges.forEach((final com.iv.dto.model.ChargeTypeModel chModel) -> newChargeList.add(DataObjectConvertor.convertObject(chModel, ChargeTypeModel.class)));

		final var	finalCharges = new ChargeTypeModel[newChargeList.size()];
		newChargeList.toArray(finalCharges);

		return finalCharges;
	}

	@SuppressWarnings("unchecked")
	public List<HamalMaster> getHamalMasterList(final HttpServletRequest request, final long accountGroupId) throws Exception {
		try {
			final var groupdata 	= getAccountGroupDataById(request, accountGroupId);
			var hamalMasters		= (List<HamalMaster>) groupdata.get(HAMAL_MASTERS);

			if(hamalMasters == null)
				hamalMasters	= refreshCacheForHamalMaster(request, accountGroupId);

			return hamalMasters;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	@SuppressWarnings("unchecked")
	public OperationLocking getOperationLockingData(final HttpServletRequest request, final Executive executive) throws Exception {
		try {
			final var	groupdata		= getAccountGroupDataById(request, executive.getAccountGroupId());

			var	operationLockingData	= (Map<Long, OperationLocking>) groupdata.get(OPERATION_LOCKING);

			if(operationLockingData == null)
				operationLockingData = refreshOperationLockingData(request, executive.getAccountGroupId());

			return operationLockingData.getOrDefault(executive.getBranchId(), null);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public Map<Long, OperationLocking> refreshOperationLockingData(final HttpServletRequest request, final long accountGroupId) throws Exception {
		try {
			final var	operationLockingData = OperationLockingDaoImpl.getInstance().getOperationLockingData(accountGroupId);

			final var	groupdata		= getAccountGroupDataById(request, accountGroupId);
			groupdata.put(OPERATION_LOCKING, operationLockingData);

			return operationLockingData;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	@SuppressWarnings("unchecked")
	public List<TransportationModeForGroup> getTransportationModeForGroupList(final HttpServletRequest request, final long accountGroupId) throws Exception {
		try {
			final var groupdata 	= getAccountGroupDataById(request, accountGroupId);
			var tranportModes		= (List<TransportationModeForGroup>) groupdata.get(TRANSPORTATION_MODE_FOR_GROUP);

			if(tranportModes == null)
				tranportModes	= refreshCacheForTransportationModeForGroup(request, accountGroupId);

			return tranportModes;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private List<TransportationModeForGroup> refreshCacheForTransportationModeForGroup(final HttpServletRequest request, final long accountGroupId) throws Exception {
		try {
			final var tranportModes = TransportationModeMasterBllImpl.getInstance().getTransportationModeListForGroup(accountGroupId);

			if(ObjectUtils.isNotEmpty(tranportModes)) {
				final var groupData = getAccountGroupDataById(request, accountGroupId);
				groupData.put(TRANSPORTATION_MODE_FOR_GROUP, tranportModes);
			}

			return tranportModes;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public Map<Short, TransportationModeForGroup> getTransportationModeForGroup(final HttpServletRequest request, final long accountGroupId) throws Exception {
		try {
			final var	transportationModeGroupList	= getTransportationModeForGroupList(request, accountGroupId);

			return transportationModeGroupList.stream()
					.collect(Collectors.toMap(TransportationModeForGroup::getTransportModeId, Function.identity(), (e1, e2) -> e1));
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	@SuppressWarnings("unchecked")
	public Map<Object, Object> getReportConfiguration(final HttpServletRequest request, final long accountGroupId, final long reportId) throws Exception {
		try {
			final var key	= reportId + "_" + accountGroupId + "_report";
			var configuration	= (Map<Object, Object>) getContextAttribute(request, key);

			if(ObjectUtils.isEmpty(configuration)) {
				refreshReportConfiguration(request, accountGroupId, reportId);
				configuration		= (Map<Object, Object>) getContextAttribute(request, key);
			}

			return configuration;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public void refreshReportConfiguration(final HttpServletRequest request, final long accountGroupId, final long reportId) throws Exception {
		setContextAttribute(request, reportId + "_" + accountGroupId + "_report", ReadAllConfigurationsBllImpl.getInstance().getReportConfigurationData(reportId, accountGroupId));
	}

	@SuppressWarnings("unchecked")
	public Map<Long, List<IvcargoTrainingMaterials>> getIvcargoTrainingMaterialsList(final HttpServletRequest request) throws Exception {
		try {
			var list		= (List<IvcargoTrainingMaterials>) getContextAttribute(request, IvcargoTrainingMaterials.IVCARGO_TRAINING_MATERIALS);

			if(list == null)
				list	= refreshCacheForIvcargoTrainingMaterials(request);

			if(list != null)
				return list.stream().collect(Collectors.groupingBy(IvcargoTrainingMaterials::getModuleId));

			return Collections.emptyMap();
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private List<IvcargoTrainingMaterials> refreshCacheForIvcargoTrainingMaterials(final HttpServletRequest request) throws Exception {
		try {
			final var list = IvcargoTrainingMaterialsDaoImpl.getInstance().getIvcargoTrainingMaterialsList();

			if(ObjectUtils.isNotEmpty(list))
				setContextAttribute(request, IvcargoTrainingMaterials.IVCARGO_TRAINING_MATERIALS, list);

			return list;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public List<IvcargoTrainingMaterials> getModuleWiseVideos(final HttpServletRequest request, final long moduleId) {
		try {
			final var	trMap    = getIvcargoTrainingMaterialsList(request);

			return trMap.get(moduleId);
		} catch (final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
		}

		return Collections.emptyList();
	}

	private List<DivisionMaster> refreshCacheForDivisionMaster(final HttpServletRequest request, final long accountGroupId) throws Exception {
		try {
			final var divisionListForGroup = DivisionMasterDaoImpl.getInstance().getAllDivisionsByAccountGroupId(accountGroupId);

			if(ObjectUtils.isNotEmpty(divisionListForGroup)) {
				final var groupData = getAccountGroupDataById(request, accountGroupId);
				groupData.put(DIVISION_LIST, divisionListForGroup);
			}

			return divisionListForGroup;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	@SuppressWarnings("unchecked")
	public List<DivisionMaster> getDivisionMasterList(final HttpServletRequest request, final long accountGroupId) throws Exception {
		try {
			final var groupdata 	= getAccountGroupDataById(request, accountGroupId);
			var divisionList		= (List<DivisionMaster>) groupdata.get(DIVISION_LIST);

			if(divisionList == null)
				divisionList	= refreshCacheForDivisionMaster(request, accountGroupId);

			return divisionList;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public Map<Long, String> getDivisionMasterNameHM(final HttpServletRequest request, final long accountGroupId) throws Exception {
		try {
			final var divisionList = getDivisionMasterList(request, accountGroupId);

			if(ObjectUtils.isEmpty(divisionList))
				return Collections.emptyMap();

			return divisionList.stream()
					.collect(Collectors.toMap(DivisionMaster::getDivisionMasterId, DivisionMaster::getName, (e1, e2) -> e1));
		} catch(final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}

	}

	public List<TaxModel> getTaxesByDate(final HttpServletRequest request, final Executive executive, final Timestamp date) throws Exception {
		try {
			return getTaxesByDate(getTaxes(request, executive), date);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public List<TaxModel> getTaxesByDate(final List<TaxModel> tax, final Timestamp date) throws Exception {
		try {
			if(ObjectUtils.isEmpty(tax) || date == null)
				return Collections.emptyList();

			return ListFilterUtility.filterList(tax, e -> DateTimeUtility.isBetween(date, e.getValidFrom(), e.getValidTill()));
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	@SuppressWarnings("unchecked")
	public List<PackageConditionMaster> getPackageConditionList(final HttpServletRequest request) throws Exception {
		try {
			var list		= (List<PackageConditionMaster>) getContextAttribute(request, PackageConditionMaster.PACKAGE_CONDITION_LIST);

			if(ObjectUtils.isEmpty(list))
				list	= refreshCacheForPackageConditions(request);

			return list;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private List<PackageConditionMaster> refreshCacheForPackageConditions(final HttpServletRequest request) throws Exception {
		try {
			final var list = PackageConditionMasterDaoImpl.getInstance().getAllPackageConditions();

			if(ObjectUtils.isNotEmpty(list))
				setContextAttribute(request, PackageConditionMaster.PACKAGE_CONDITION_LIST, list);

			return list;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public Map<Long, String> getPackageConditionNameHM(final HttpServletRequest request) throws Exception {
		try {
			final var list = getPackageConditionList(request);

			if(ObjectUtils.isEmpty(list))
				return Collections.emptyMap();

			return list.stream()
					.collect(Collectors.toMap(PackageConditionMaster::getPackageConditionMasterId, PackageConditionMaster::getPackageConditionName, (e1, e2) -> e1));
		} catch(final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	@SuppressWarnings("unchecked")
	public List<BranchWayBillTypeConfiguration> getBranchWayBillTypeConfigurationForGroup(final HttpServletRequest request, final long accountGroupId) throws Exception {
		try {
			final var groupData = getAccountGroupDataById(request, accountGroupId);

			var	configList	= (List<BranchWayBillTypeConfiguration>) groupData.get(BranchWayBillTypeConfiguration.BRANCH_WAY_BILL_TYPE_CONFIGURATION);

			if(configList == null)
				configList	= refreshCacheForBranchWayBillTypeConfiguration(request, accountGroupId);

			return configList;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public List<BranchWayBillTypeConfiguration> refreshCacheForBranchWayBillTypeConfiguration(final HttpServletRequest request, final long accountGroupId) throws Exception {
		try {
			final var groupData = getAccountGroupDataById(request, accountGroupId);
			final var configList = BookingControlMasterDaoImpl.getInstance().getBranchWayBillTypeConfigDetails("AccountGroupId = " + accountGroupId);
			groupData.put(BranchWayBillTypeConfiguration.BRANCH_WAY_BILL_TYPE_CONFIGURATION, configList);

			return configList;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}
}