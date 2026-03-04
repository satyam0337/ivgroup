package com.ivcargo.ajax;

import java.util.StringJoiner;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringUtils;
import org.springframework.web.client.RestTemplate;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.utils.constant.Constant;
import com.iv.utils.constant.properties.ServerIPAddressConfigurationConstant;
import com.iv.utils.exception.ExceptionProcess;
import com.iv.utils.message.ServerIPAddressList;
import com.iv.utils.webService.WSUtility;
import com.iv.utils.webService.WebServiceURI;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.Executive;


public class RefreshCacheAction implements Action {

	private static final String TRACE_ID = "RefreshCacheAction";

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		var				accountGroupId			= 0L;
		var				sourceBranchId			= 0L;

		try {
			final var	cache			= new CacheManip(request);
			final var	executive		= cache.getExecutive(request);

			if(request.getAttribute(Constant.ACCOUNT_GROUP_ID) != null)
				accountGroupId  = (long) request.getAttribute(Constant.ACCOUNT_GROUP_ID);
			else if(request.getParameter(Constant.ACCOUNT_GROUP_ID) != null)
				accountGroupId  = Long.parseLong(request.getParameter(Constant.ACCOUNT_GROUP_ID));

			if(accountGroupId == 0 && executive != null)
				accountGroupId = executive.getAccountGroupId();

			if(executive != null)
				sourceBranchId 	= executive.getBranchId();
			else if(request.getAttribute(Constant.BRANCH_ID) != null)
				sourceBranchId  = (long) request.getAttribute(Constant.BRANCH_ID);

			final var	moduleId	= JSPUtility.GetInt(request, Constant.MODULE_ID, 0);

			if(moduleId > 0)
				cache.refreshData(request, moduleId, accountGroupId);
			else {
				request.setAttribute(Constant.ACCOUNT_GROUP_ID, accountGroupId);
				request.setAttribute(Constant.BRANCH_ID, sourceBranchId);

				cache.refreshAllData(request);
				cache.refreshGroupWiseData(request, accountGroupId);
				cache.refreshBranchPermissionData(request, accountGroupId, sourceBranchId);
			}

			final var	stringBuilder	= new StringBuilder();
			stringBuilder.append("&accountGroupId=" + accountGroupId);
			stringBuilder.append("&sourceBranchId=" + sourceBranchId);

			WSUtility.callPostWebService(WSUtility.getWebServiceUrl(Integer.toString(WebServiceURI.UPDATE_CACHE_DATA)), stringBuilder.toString());

			if(executive != null) {
				stringBuilder.append("&executiveId = " + executive.getExecutiveId());
				WSUtility.callPostWebService(WSUtility.getWebServiceUrl(Integer.toString(WebServiceURI.UPDATE_EXECUTIVE_FUNCTION)), stringBuilder.toString());
			}

			if(sourceBranchId > 0)
				WSUtility.callPostWebService(WSUtility.getWebServiceUrl(Integer.toString(WebServiceURI.UPDATE_DESTINATION_BRANCH_MAPPING)), stringBuilder.toString());

			refreshCache(request, executive, cache, accountGroupId);
		} catch (final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private void refreshCache(final HttpServletRequest request, final Executive executive, final CacheManip cache, final long accountGroupId) {
		try {
			final var ipAddressConfiguration 	= cache.getConfiguration(request, ModuleIdentifierConstant.SERVER_IP_ADDRESS);
			final var serverIPAddressList		= (String) ipAddressConfiguration.getOrDefault(ServerIPAddressConfigurationConstant.SERVER_IP_ADDRESS_LIST, "");

			if(request.getParameter("refresCacheExternal") == null && executive != null && (boolean) ipAddressConfiguration.getOrDefault(ServerIPAddressConfigurationConstant.LOAD_BALANCER_ACTIVE + executive.getServerIdentifier(), false)) {
				if(!ServerIPAddressList.validateValidIPWithServerIPAddressList(serverIPAddressList))
					return;

				final var loadBalancerInstances = ((String) ipAddressConfiguration.get(ServerIPAddressConfigurationConstant.LOAD_BALANCER_INSTANCES + executive.getServerIdentifier())).split(",");

				final var url = new StringJoiner("&");

				final var	accountGroup	= cache.getAccountGroupById(request, accountGroupId);

				for (final String element : loadBalancerInstances) {
					url.add(StringUtils.trim(element) + StringUtils.trim((String) ipAddressConfiguration.get(ServerIPAddressConfigurationConstant.REFESH_CACHE_OTHER_INSTANCE_URL)));
					url.add("username=" + executive.getLogin());
					url.add("password=" + executive.getPassword());
					url.add("accountGroupCode=" + accountGroup.getAccountGroupCode());
					url.add("refresCacheExternal=true");
				}

				if(url.length() > 1)
					new RestTemplate().getForObject(url.toString(), String.class);
			}
		} catch (final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
		}
	}

}