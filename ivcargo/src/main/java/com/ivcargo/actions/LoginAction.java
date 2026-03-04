
/**
 *
 */
package com.ivcargo.actions;

import java.io.File;
import java.io.IOException;
import java.sql.Timestamp;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.commons.lang3.ObjectUtils;
import org.apache.commons.lang3.StringUtils;

import com.businesslogic.ExecutiveBLL;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.bll.impl.AccountGroupBllImpl;
import com.iv.bll.impl.ExecutiveFunctionsBllImpl;
import com.iv.bll.impl.master.BranchBllImpl;
import com.iv.cache.impl.CacheDataImpl;
import com.iv.constant.properties.GroupConfigurationPropertiesConstant;
import com.iv.constant.properties.HeaderConfigurationConstant;
import com.iv.constant.properties.master.SyncWithNexusPropertiesConstant;
import com.iv.convertor.DataObjectConvertor;
import com.iv.dao.impl.ExecutiveFunctionsDaoImpl;
import com.iv.dao.impl.LoginSessionNetworkDataDaoImpl;
import com.iv.dao.impl.master.BranchDaoImpl;
import com.iv.dao.impl.master.ExecutiveDaoImpl;
import com.iv.dto.Executive;
import com.iv.dto.ExecutiveFunctionsModel;
import com.iv.dto.LoginSessionNetworkData;
import com.iv.dto.constant.BusinessFunctionConstants;
import com.iv.dto.constant.ConfigKeyConstant;
import com.iv.dto.constant.CustomerPlanTypeConstant;
import com.iv.dto.constant.FeildPermissionsConstant;
import com.iv.dto.constant.MenuGroupConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.dto.master.BusinessFunctions;
import com.iv.dto.model.BranchModel;
import com.iv.dto.model.ExecutiveModel;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.constant.Constant;
import com.iv.utils.constant.LoginPageConfigurationConstant;
import com.iv.utils.constant.properties.FolderLocationPropertiesConstant;
import com.iv.utils.constant.properties.ServerIPAddressConfigurationConstant;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.exception.ExceptionProcess;
import com.iv.utils.file.FileUtility;
import com.iv.utils.request.UserAgentHelper;
import com.iv.utils.utility.Utility;
import com.iv.utils.webService.WSUtility;
import com.iv.utils.webService.WebServiceURI;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.ExecutiveFeildPermissionDAO;
import com.platform.dto.AccountGroup;
import com.platform.dto.ExecutiveFeildPermissionDTO;
import com.platform.resource.CargoErrorList;

/**
 * @author Anant
 *
 */
public class LoginAction implements Action {
	public static final String TRACE_ID = LoginAction.class.getName();

	private static final String USER_MANAGER		= "usermanager";

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		var			isAutoBooking		= true;

		try {
			final var	ipAddress				= JSPUtility.GetString(request, Constant.IP_ADDRESS, null);
			final var	executiveId				= JSPUtility.GetLong(request, Constant.EXECUTIVE_ID, 0);
			final var	sessionObj				= request.getSession();
			var			executiveAkka			= (Executive) request.getAttribute(ExecutiveModel.EXECUTIVE_MODEL);

			if(executiveAkka == null)
				executiveAkka			= ExecutiveDaoImpl.getInstance().getExecutiveMaster(executiveId);

			if(executiveAkka == null || sessionObj == null) {
				final var	error	= new HashMap<String, Object>();
				ActionStaticUtil.throwInvalidSessionError(request, error);
				return;
			}

			final var 	cache			= new CacheManip(request);

			final var	executive		= ExecutiveBLL.getInstance().createDTOForExecutiveAkka(executiveAkka);
			final var	execFunctions 	= ExecutiveFunctionsDaoImpl.getInstance().findByExecutiveId(executiveAkka.getExecutiveId());

			if(ObjectUtils.isEmpty(execFunctions)) {
				final var	error	= new HashMap<String, Object>();
				ActionStaticUtil.throwInvalidSessionError(request, error);
				return;
			}

			final var	configuration				= cache.getConfiguration(request, executiveAkka.getAccountGroupId(), ModuleIdentifierConstant.LOGIN);
			final var 	headerConfig				= cache.getHeaderConfiguration(request, executiveAkka.getAccountGroupId());
			final var	folderLocationConfig		= cache.getConfiguration(request, ModuleIdentifierConstant.FOLDER_LOCATION);
			final var	serverIPAddressPropObj		= cache.getConfiguration(request, ModuleIdentifierConstant.SERVER_IP_ADDRESS);
			final var	groupConfig					= cache.getConfiguration(request, executiveAkka.getAccountGroupId(), ModuleIdentifierConstant.BOOKING);
			// code for getting Home Page after Login
			var			defaultLoginMessagePage			= (boolean) configuration.getOrDefault(LoginPageConfigurationConstant.DEFAULT_LOGIN_MESSAGE_PAGE, false);
			var			announcementPageGroupSpecific	= (boolean) configuration.getOrDefault(LoginPageConfigurationConstant.ANNOUNCEMENT_PAGE_GROUP_SPECIFIC, false);
			var			showDefaultPageAsManualLR   	= (boolean) configuration.getOrDefault(LoginPageConfigurationConstant.SHOW_DEFAULT_PAGE_AS_MANUAL_LR, false);
			final var	expiryDateTimeStr				= (String) configuration.getOrDefault(LoginPageConfigurationConstant.EXPIRY_DATE_FOR_DEFAULT_LOGIN_MESSAGE_PAGE, null);
			var 		allowPhotoMasterSpecificFile	= (boolean) configuration.getOrDefault(LoginPageConfigurationConstant.ALLOW_PHOTO_MASTER_SPECIFIC_FILE, false);

			final var	branchModel					= BranchDaoImpl.getInstance().findByBranchId(executiveAkka.getBranchId());

			if(branchModel == null) {
				final var	error	= new HashMap<String, Object>();
				error.put(CargoErrorList.ERROR_CODE, CargoErrorList.SESSION_INVALID);
				error.put(CargoErrorList.ERROR_DESCRIPTION, "Branch Not Found !");
				request.setAttribute(CargoErrorList.CARGO_ERROR, error);
				request.setAttribute(ActionStaticUtil.NEXTPAGETOKEN, "failure");
				return;
			}

			final var	execFeildPermissions		= ExecutiveFeildPermissionDAO.getInstance().findByExecutiveId(executiveAkka.getExecutiveId());
			final var 	businessMap					= cache.getBusinessFunctions(request);
			final var	groupobj 					= cache.getAccountGroupById(request, executiveAkka.getAccountGroupId());
			final var	wayBillTypes 				= cache.getWayBillTypeList(request, executiveAkka.getAccountGroupId());

			final var	currentDateTime	= DateTimeUtility.getCurrentTimeStamp();

			if(defaultLoginMessagePage && expiryDateTimeStr != null) {
				final var	expiryDateTime			= DateTimeUtility.getDateTimeFromStr(expiryDateTimeStr);
				defaultLoginMessagePage	= expiryDateTime.getTime() > currentDateTime.getTime();
			}

			if(defaultLoginMessagePage) {
				announcementPageGroupSpecific	= false;
				allowPhotoMasterSpecificFile	= false;
			}

			configuration.put("defaultLoginMessagePage", defaultLoginMessagePage);
			configuration.put("announcementPageGroupSpecific", announcementPageGroupSpecific);
			configuration.put("allowPhotoMasterSpecificFile", allowPhotoMasterSpecificFile);

			setExecutiveExtraInformation(request, executive, executiveAkka, groupobj, branchModel, cache);

			cache.getWebsiteURL(request);

			final var	subRegionWiseLimitedPermission	= Utility.isIdExistInLongList(configuration, LoginPageConfigurationConstant.SHOW_EXECUTIVE_FUNCTIONS_BY_SUB_REGION_ID, executiveAkka.getSubRegionId());

			if(serverIPAddressPropObj != null)
				headerConfig.put(ServerIPAddressConfigurationConstant.NOTIFICATION_HOST_URL, serverIPAddressPropObj.get(ServerIPAddressConfigurationConstant.NOTIFICATION_HOST_URL));

			refreshMemcache(executiveAkka, groupConfig);

			getGroupLogo(executiveAkka, headerConfig, folderLocationConfig, sessionObj);

			final var executiveFeildPermissionsAkka	= cacheExecutiveFeildPermissions(execFeildPermissions, sessionObj, subRegionWiseLimitedPermission);

			if((boolean) groupConfig.getOrDefault(GroupConfigurationPropertiesConstant.SHOW_ONLY_MANUAL_BOOKING, false) && Utility.isIdExistInLongList(groupConfig, GroupConfigurationPropertiesConstant.BRANCH_IDS_TO_SHOW_MANUAL_BOOKING, executive.getBranchId())
					|| executiveFeildPermissionsAkka.get(FeildPermissionsConstant.ALLOW_ONLY_MANUAL_BOOKING) != null) {
				showDefaultPageAsManualLR	= true;
				isAutoBooking				= false;
			}

			configuration.put("showDefaultPageAsManualLR", showDefaultPageAsManualLR);

			final Map<Object, Object> groupedConfigHM	= new HashMap<>(configuration);

			groupedConfigHM.putAll(headerConfig);
			groupedConfigHM.putAll(groupConfig);

			final var	master 			= cache.getTransportList(request);
			cache.addGroupInTransportListMaster(request, executiveAkka.getAccountGroupId(), master);

			final var changeBookingUrl = showDefaultPageAsManualLR && !isAutoBooking;

			final var 	executiveFunctionsAkka	= ExecutiveFunctionsBllImpl.getInstance().setDataForExecutiveFunctions(executiveAkka, execFunctions, groupedConfigHM, changeBookingUrl, businessMap);
			final var	headerList				= ExecutiveFunctionsBllImpl.getInstance().getHeaderList(executiveFunctionsAkka, executiveAkka, branchModel.getBranchType(), headerConfig, master, businessMap);

			checkWayBillTypeBooking(request, executiveFunctionsAkka, wayBillTypes, headerList, isAutoBooking);

			ExecutiveFunctionsBllImpl.getInstance().setGroupLevelHeaderPermissions(headerConfig, executiveFunctionsAkka, businessMap);

			/**
			 * Memcached hit to cache application data
			 */
			CacheDataImpl.getInstance().initialize(executiveAkka);
			CacheDataImpl.getInstance().setExcutive(executiveAkka);
			CacheDataImpl.getInstance().initializeExecutiveFunction(executiveFunctionsAkka, executive.getExecutiveId());

			if(!executiveFeildPermissionsAkka.isEmpty())
				CacheDataImpl.getInstance().initializeExecutiveFeildPermission(executiveFeildPermissionsAkka, executive.getExecutiveId());

			//	showTCEPermissions(request, cache, executiveAkka, executiveFunctionsAkka, businessMap, serverIPAddressPropObj);

			var	usermanager = (ValueObject) sessionObj.getServletContext().getAttribute(USER_MANAGER);

			if(usermanager == null) usermanager = new ValueObject();

			usermanager.put(sessionObj.getId(), executiveAkka.getExecutiveId());
			sessionObj.getServletContext().setAttribute(USER_MANAGER, usermanager);
			sessionObj.getServletContext().setAttribute("gtag", ExecutiveFunctionsBllImpl.setGoogleAnalyticData(executiveAkka, headerConfig));
			sessionObj.setMaxInactiveInterval((int) configuration.getOrDefault(LoginPageConfigurationConstant.MAX_SESSION_INACTIVE_INTERVAL, 30) * 60);

			sessionObj.setAttribute("subRegionWiseLimitedPermission", subRegionWiseLimitedPermission);
			sessionObj.setAttribute(ExecutiveFunctionsModel.EXECUTIVE_FUNCTION, executiveFunctionsAkka);
			sessionObj.setAttribute("headerList", headerList);
			sessionObj.setAttribute(HeaderConfigurationConstant.REPORT_SIDE_NAVIGATION_MENU, headerConfig.getOrDefault(HeaderConfigurationConstant.REPORT_SIDE_NAVIGATION_MENU, false));
			sessionObj.setAttribute(HeaderConfigurationConstant.SHOW_USER_FAVOURITES, headerConfig.getOrDefault(HeaderConfigurationConstant.SHOW_USER_FAVOURITES, false));
			sessionObj.setAttribute("currDate", DateTimeUtility.getCurrentDateString());
			sessionObj.setAttribute(Constant.USER_NAME, request.getParameter(Constant.USER_NAME));
			sessionObj.setAttribute(Constant.PASSWORD, request.getParameter(Constant.PASSWORD));
			sessionObj.setAttribute(Constant.ACCOUNT_GROUP_CODE, request.getParameter(Constant.ACCOUNT_GROUP_CODE));
			sessionObj.setAttribute(Constant.MAC_ADDRESS, request.getParameter(Constant.MAC_ADDRESS));
			sessionObj.setAttribute(LoginPageConfigurationConstant.ANNOUNCEMENT_PAGE_GROUP_SPECIFIC, announcementPageGroupSpecific);
			sessionObj.setAttribute(LoginPageConfigurationConstant.ALLOW_PHOTO_MASTER_SPECIFIC_FILE, allowPhotoMasterSpecificFile);
			sessionObj.setAttribute("fullGroupName", groupobj.getDescription() != null && groupobj.getDescription().length() > 30 ? StringUtils.upperCase(groupobj.getAccountGroupCode()) : groupobj.getDescription());

			if(groupobj.getPlanTypeId() != null && groupobj.getPlanTypeId() > 0)
				sessionObj.setAttribute("planTypeName", CustomerPlanTypeConstant.getTypeHM().get(groupobj.getPlanTypeId()));

			//Session Variable to hold BranchId for default Search Input text
			sessionObj.setAttribute("branchId", executiveAkka.getBranchId());
			//Session Variable to hold Branch Name for header
			sessionObj.setAttribute("branchName", executiveAkka.getBranchName());
			sessionObj.setAttribute("userNameWithArea", executiveAkka.getExecutiveName() + " (" + executiveAkka.getBranchName() + " - " + executiveAkka.getSubRegionName() + ")");

			cache.checkApplicationCache(request, executive);

			final var	userAgentHelper	= new UserAgentHelper(request);

			final var referer	= userAgentHelper.getReferer();

			if((boolean) configuration.getOrDefault(LoginPageConfigurationConstant.INSERT_LOGIN_SESSION_DATA, false))
				executiveAkka.setLoginSessionNetworkDataId(insertUserSessionData(executiveAkka, currentDateTime, ipAddress, userAgentHelper));

			sessionObj.setAttribute(Executive.EXECUTIVE, executive);
			sessionObj.setAttribute(ExecutiveModel.EXECUTIVE_MODEL, executiveAkka);

			if(referer != null && referer.contains("modulename")) {
				sendRedirect(request, response, referer);
				return;
			}

			redirectOnPage(request, response, executiveAkka, headerConfig, businessMap, executiveFunctionsAkka, configuration);
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e);
		}
	}

	private long insertUserSessionData(final Executive executive, final Timestamp currentDateTime, final String ipAddress, UserAgentHelper userAgentHelper) {
		var						loginSessionNetworkDataId		= 0L;

		try {
			final var	loginSessionNetworkData = new LoginSessionNetworkData();

			loginSessionNetworkData.setExecutiveId(executive.getExecutiveId());
			loginSessionNetworkData.setAccountGroupId(executive.getAccountGroupId());
			loginSessionNetworkData.setLogInDateTime(currentDateTime);
			loginSessionNetworkData.setIpAddress(ipAddress);
			loginSessionNetworkData.setLoginFlag(LoginSessionNetworkData.USER_ATTEMPT_LOG_IN);
			loginSessionNetworkData.setBrowserInfo(userAgentHelper.getBrowserName().toString());

			loginSessionNetworkDataId = new LoginSessionNetworkDataDaoImpl().insert(loginSessionNetworkData);
		} catch (final Exception e) {
			e.printStackTrace();
		}

		return loginSessionNetworkDataId;
	}

	private void refreshMemcache(final com.iv.dto.Executive executiveAkka, final Map<Object, Object> groupConfig) {
		try {
			final var module	= new StringBuilder();
			module.append("&accountGroupId=" + executiveAkka.getAccountGroupId());
			module.append("&sourceBranchId=" + executiveAkka.getBranchId());
			module.append("&executiveId=" + executiveAkka.getExecutiveId());

			WSUtility.callPostWebService(WSUtility.getWebServiceUrl(Integer.toString(WebServiceURI.INITIALIZE_CACHE_DATA)), "");

			if((boolean) groupConfig.getOrDefault(GroupConfigurationPropertiesConstant.IS_DEFAULT_DESTINATION_NEEDED, false))
				WSUtility.callPostWebService(WSUtility.getWebServiceUrl(Integer.toString(WebServiceURI.DESTINATION_BRANCH_MAPPING)), module.toString());
		} catch(final Exception e) {
			e.printStackTrace();
		}
	}

	private void getGroupLogo(final com.iv.dto.Executive executive, final Map<Object, Object> headerConfig,
			final Map<Object, Object> folderLocationConfig, final HttpSession sessionObj) {
		try {
			String	logoPath	= null;
			var img	= "";

			if((boolean) headerConfig.getOrDefault(HeaderConfigurationConstant.IS_BRANCH_WISE_LOGO_DISPLAY, false) && Utility.isIdExistInLongList(headerConfig, HeaderConfigurationConstant.BRANCH_LIST_FOR_LOGO_DISPLAY, executive.getBranchId()))
				img = "_1";

			if(Utility.getBoolean(folderLocationConfig, FolderLocationPropertiesConstant.LOGO_PATH_WITH_REAL_PATH) && sessionObj != null)
				logoPath	= (String) sessionObj.getAttribute(Constant.WEBSITE_PATH) + (String) folderLocationConfig.get(FolderLocationPropertiesConstant.GROUP_LOGO_IMAGE_PATH);
			else
				logoPath	= (String) folderLocationConfig.get(FolderLocationPropertiesConstant.LOGO_PATH + "_" + executive.getServerIdentifier());

			logoPath	= logoPath + File.separator + executive.getAccountGroupId() + img;

			logoPath 	= FileUtility.checkAndGetImagePathWithDifferentExtension(logoPath);

			if(logoPath != null && sessionObj != null)
				sessionObj.setAttribute(Constant.LOGO_PATH, Utility.subStringFromLastSeperator(replaceBackwardWithForwardSlash(logoPath), Constant.FORWARD_SLASH, 3));
		} catch (final Exception e) {
			e.printStackTrace();
		}
	}

	private String replaceBackwardWithForwardSlash(final String logoPath) {
		return logoPath.replace(Constant.BACKWARD_SLASH, Constant.FORWARD_SLASH);
	}

	private void checkWayBillTypeBooking(final HttpServletRequest request, final Map<String, com.iv.dto.ExecutiveFunctionsModel> executivePermissions, final List<Short> wayBillTypes, final Map<String, com.iv.dto.ExecutiveFunctionsModel> headerList,
			final boolean isAutoBooking) {
		try {
			final var	session	= request.getSession();

			setAutoBooking(session, executivePermissions, wayBillTypes, isAutoBooking);
			session.setAttribute("isManualPermitted", ExecutiveFunctionsBllImpl.setManualBooking(executivePermissions, wayBillTypes, headerList));
			session.setAttribute("isLocalBookingPermitted", ExecutiveFunctionsBllImpl.setLocalBooking(executivePermissions, wayBillTypes, headerList));
			session.setAttribute("isFtlBookingPermitted", ExecutiveFunctionsBllImpl.setFTLBooking(executivePermissions, wayBillTypes, headerList));
		} catch (final Exception e) {
			e.printStackTrace();
		}
	}

	private void setAutoBooking(final HttpSession session, final Map<String, com.iv.dto.ExecutiveFunctionsModel> executivePermissions, final List<Short> wayBillTypes,
			final boolean isAutoBooking) {
		var					paidBookingAllow				= false;
		var					topayBookingAllow				= false;
		var					tbbBookingAllow					= false;
		var					focBookingAllow					= false;

		try {
			final var	execFunctions = executivePermissions.get(BusinessFunctionConstants.CREATE_WAY_BILL);
			final var isPaidBookingPermission	= executivePermissions.containsKey(BusinessFunctionConstants.WAYBILL_TYPE_PAID);
			final var isTopayBookingPermission	= executivePermissions.containsKey(BusinessFunctionConstants.WAYBILL_TYPE_TOPAY);
			final var isTbbBookingPermission	= executivePermissions.containsKey(BusinessFunctionConstants.WAYBILL_TYPE_CREDITOR);
			final var isFocBookingPermission	= executivePermissions.containsKey(BusinessFunctionConstants.WAYBILL_TYPE_FOC);

			if(execFunctions != null && isAutoBooking) {
				paidBookingAllow	= wayBillTypes.contains(ConfigKeyConstant.CONFIG_KEY_WAYBILLTYPE_PAID) && isPaidBookingPermission;
				topayBookingAllow	= wayBillTypes.contains(ConfigKeyConstant.CONFIG_KEY_WAYBILLTYPE_TO_PAY) && isTopayBookingPermission;
				tbbBookingAllow		= wayBillTypes.contains(ConfigKeyConstant.CONFIG_KEY_WAYBILLTYPE_CREDITOR) && isTbbBookingPermission;
				focBookingAllow		= wayBillTypes.contains(ConfigKeyConstant.CONFIG_KEY_WAYBILLTYPE_FOC) && isFocBookingPermission;
			}

			session.setAttribute("paidBookingAllow", paidBookingAllow);
			session.setAttribute("topayBookingAllow", topayBookingAllow);
			session.setAttribute("tbbBookingAllow", tbbBookingAllow);
			session.setAttribute("focBookingAllow", focBookingAllow);

			session.setAttribute("isPaidBookingPermission", isPaidBookingPermission);
			session.setAttribute("isTopayBookingPermission", isTopayBookingPermission);
			session.setAttribute("isTbbBookingPermission", isTbbBookingPermission);
			session.setAttribute("isFocBookingPermission", isFocBookingPermission);
		} catch (final Exception e) {
			e.printStackTrace();
		}
	}

	private void setExecutiveExtraInformation(final HttpServletRequest request, final com.platform.dto.Executive executive, final Executive executiveAkka, final AccountGroup groupobj, final BranchModel branch, final CacheManip cache) throws Exception {
		executive.setServerIdentifier(groupobj.getServerIdentifier());
		executiveAkka.setServerIdentifier(groupobj.getServerIdentifier());
		//Set regionId and SubRegionId
		executive.setRegionId(branch.getRegionId());
		executiveAkka.setRegionId(branch.getRegionId());
		executive.setSubRegionId(branch.getSubRegionId());
		executiveAkka.setSubRegionId(branch.getSubRegionId());

		//set Executive Branch Name
		executive.setBranchName(branch.getBranchName());
		executiveAkka.setBranchName(branch.getBranchName());
		//set Executive City Name
		executive.setCityName(cache.getCityAtLoginTime(request, executive.getCityId()).getName());
		//set Executive Region Name
		executive.setRegionName(cache.getRegionAtLoginTime(request, executive.getRegionId()).getName());
		executiveAkka.setRegionName(executive.getRegionName());
		//set Executive Sub Region Name
		executive.setSubRegionName(cache.getSubRegionAtLoginTime(request, executive.getSubRegionId()).getName());
		executiveAkka.setSubRegionName(executive.getSubRegionName());
	}

	private Map<Long, com.iv.dto.ExecutiveFeildPermissionDTO> cacheExecutiveFeildPermissions(final ExecutiveFeildPermissionDTO[] execFeildPermissions, final HttpSession sessionObj, final boolean subRegionWiseLimitedPermission) throws Exception {
		final var			executiveFeildPermissions		= new HashMap<Long, ExecutiveFeildPermissionDTO>();
		final Map<Long, com.iv.dto.ExecutiveFeildPermissionDTO>		executiveFeildPermissionsAkka  	= new HashMap<>();

		if (execFeildPermissions != null && !subRegionWiseLimitedPermission)
			for(final ExecutiveFeildPermissionDTO exDto : execFeildPermissions) {
				executiveFeildPermissions.put(exDto.getFeildPermissionId(), exDto);
				executiveFeildPermissionsAkka.put(exDto.getFeildPermissionId(), DataObjectConvertor.convertObject(exDto, com.iv.dto.ExecutiveFeildPermissionDTO.class));
			}

		sessionObj.setAttribute("enableRightClick", executiveFeildPermissions.get(FeildPermissionsConstant.ENABLE_RIGHT_CLICK) != null);
		sessionObj.setAttribute("datepickerForTodateSelection", executiveFeildPermissions.get(FeildPermissionsConstant.DATEPICKER_FOR_TODATE_SELECT) != null);
		sessionObj.setAttribute("excelButtonPermission", executiveFeildPermissions.get(FeildPermissionsConstant.EXCEL_BUTTON) != null);
		sessionObj.setAttribute("execFeildPermissions", executiveFeildPermissions);

		return executiveFeildPermissionsAkka;
	}

	public void showTCEPermissions(final HttpServletRequest request, final CacheManip cacheManip, final com.iv.dto.Executive executive, final Map<String, com.iv.dto.ExecutiveFunctionsModel> executiveFunctionsAkka,
			final Map<String, BusinessFunctions> businessMap, final Map<Object, Object> serverIPAddressPropHM) {
		try {
			final var tcePropertyHm		= cacheManip.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.SYNC_WITH_TCE_NEXUS);

			final var seContext = request.getSession().getServletContext();

			if(!(boolean) tcePropertyHm.getOrDefault(SyncWithNexusPropertiesConstant.CHECK_GROUP_ACTIVE, false)) {
				seContext.setAttribute(Constant.IS_ACTIVE_TCE_GROUP + "_" + executive.getAccountGroupId(), null);
				seContext.setAttribute(Constant.IS_ACTIVE_TCE_BRANCH + "_" + executive.getBranchId(), null);
			}

			var isActiveTCEGroup	= Boolean.TRUE.equals(seContext.getAttribute(Constant.IS_ACTIVE_TCE_GROUP + "_" + executive.getAccountGroupId()));
			var isActiveTCEBranch	= Boolean.TRUE.equals(seContext.getAttribute(Constant.IS_ACTIVE_TCE_BRANCH + "_" + executive.getBranchId()));

			if(!isActiveTCEGroup)
				isActiveTCEGroup	= AccountGroupBllImpl.getInstance().checkGroupActiveInTCE(executive.getAccountGroupId(), tcePropertyHm, serverIPAddressPropHM);

			if(!isActiveTCEBranch)
				isActiveTCEBranch	= BranchBllImpl.getInstance().checkBranchActiveInTCE(executive.getBranchId(), tcePropertyHm, serverIPAddressPropHM);

			if(isActiveTCEGroup || isActiveTCEBranch) {
				ExecutiveFunctionsBllImpl.getInstance().setPermissionsForTCEGroup(executiveFunctionsAkka, businessMap, isActiveTCEGroup, isActiveTCEBranch);
				seContext.setAttribute(Constant.IS_ACTIVE_TCE_GROUP + "_" + executive.getAccountGroupId(), isActiveTCEGroup);
				seContext.setAttribute(Constant.IS_ACTIVE_TCE_BRANCH + "_" + executive.getBranchId(), isActiveTCEBranch);
			}

			if(!isActiveTCEGroup)
				executiveFunctionsAkka.entrySet().removeIf(e -> e.getValue().getMenuGrpId() == MenuGroupConstant.MENU_GROUP_TCE);
		} catch (final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private void redirectOnPage(final HttpServletRequest request, final HttpServletResponse response, final Executive executiveAkka,
			final Map<Object, Object> headerConfig, final Map<String, BusinessFunctions> businessMap, final Map<String, com.iv.dto.ExecutiveFunctionsModel> executiveFunctionsAkka,
			Map<Object, Object> configuration) {
		try {
			final var redirectUrl	= ExecutiveFunctionsBllImpl.getHomePageUrl(executiveAkka, headerConfig, businessMap, executiveFunctionsAkka, configuration);

			sendRedirect(request, response, redirectUrl);
		} catch (final Exception e) {
			request.setAttribute(ActionStaticUtil.NEXTPAGETOKEN, "login"); //Show Login Page
		}
	}

	private void sendRedirect(final HttpServletRequest request, final HttpServletResponse response, String redirectUrl) throws IOException {
		if (redirectUrl != null && !response.isCommitted()) {
			response.sendRedirect(redirectUrl);
			return;
		}

		request.setAttribute(ActionStaticUtil.NEXTPAGETOKEN, "home"); //Show home Page to Limited type
	}

}
