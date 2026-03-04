/**
 *
 */
package com.ivcargo.b2c;

import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import com.iv.constant.properties.HeaderConfigurationConstant;
import com.iv.dao.impl.ClientLocationInfoDaoImpl;
import com.iv.dto.ClientLocationInfo;
import com.iv.utils.constant.Constant;
import com.iv.utils.request.ClientAddress;
import com.iv.utils.request.UserAgentHelper;
import com.iv.utils.utility.Utility;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.Executive;

/**
 * @author AJ
 *
 */
public class ClientInfo {

	public static final String TRACE_ID = ClientInfo.class.getName();

	public static ClientLocationInfo getClientInfo(final HttpServletRequest request) {
		try {
			final var	cacheManip	= new CacheManip(request);
			final var	executive 	= cacheManip.getExecutive(request);

			final var	userAgentHelper	= new UserAgentHelper(request);

			return insertData(request, userAgentHelper, executive);
		} catch (final Exception e) {
			return new ClientLocationInfo();
		}
	}

	public static ClientLocationInfo getClientInfoForWS(final HttpServletRequest request, final Executive executive, final String url) {
		try {
			final var	userAgentHelper	= new UserAgentHelper(request);
			userAgentHelper.setFullURL(url);

			return insertData(request, userAgentHelper, executive);
		} catch (final Exception e) {
			return new ClientLocationInfo();
		}
	}

	private static ClientLocationInfo insertData(final HttpServletRequest request, final UserAgentHelper userAgentHelper, final Executive executive) {
		Map<Object, Object>	headerConfig			= null;
		var					insertUserActivityLog	= false;

		try {
			final var	cacheManip	= new CacheManip(request);

			if(executive != null) {
				headerConfig			= cacheManip.getHeaderConfiguration(request, executive.getAccountGroupId());
				insertUserActivityLog	= (Boolean) headerConfig.getOrDefault(HeaderConfigurationConstant.INSERT_USER_ACTIVITY_LOG, false);
			}

			final var macAddress	= (String) request.getSession().getAttribute(Constant.MAC_ADDRESS);

			final var	clientLocationInfo	= new ClientLocationInfo();

			clientLocationInfo.setUrl(Utility.decodeUrl(userAgentHelper.getFullURL()));
			clientLocationInfo.setPreviousUrl(userAgentHelper.getReferer());
			clientLocationInfo.setIpAddress(ClientAddress.getClientIPAddress(request));
			clientLocationInfo.setMacAddress(macAddress != null ? macAddress : ClientAddress.getClientMACAddress());
			clientLocationInfo.setBrowserInfo(userAgentHelper.getBrowserName().toString());
			clientLocationInfo.setUserAgent(userAgentHelper.getUserAgent());
			clientLocationInfo.setDeviceType(userAgentHelper.getDeviceType());

			if(insertUserActivityLog && (request.getAttribute(Constant.FROM_API) == null
					|| Boolean.FALSE.equals(request.getAttribute(Constant.FROM_API)))) {
				clientLocationInfo.setAccountGroupId(executive.getAccountGroupId());
				clientLocationInfo.setExecutiveId(executive.getExecutiveId());
				ClientLocationInfoDaoImpl.getInstance().insertUserActivity(clientLocationInfo);
				request.removeAttribute(Constant.FROM_API);
			}

			return clientLocationInfo;
		} catch (final Exception e) {
			return new ClientLocationInfo();
		}
	}
}