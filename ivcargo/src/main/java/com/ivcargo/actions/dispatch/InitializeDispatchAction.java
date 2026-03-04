package com.ivcargo.actions.dispatch;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringUtils;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.bll.impl.api.ApiDataBllImpl;
import com.iv.dto.constant.BusinessFunctionConstants;
import com.iv.httpclient.OkHttpUtility;
import com.iv.utils.exception.ExceptionProcess;
import com.iv.utils.webService.WSUtility;
import com.iv.utils.webService.WebServiceURI;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.CustomGroupMapper;
import com.platform.dto.Executive;
import com.platform.dto.configuration.modules.LsConfigurationDTO;
import com.platform.utils.PropertiesUtility;
import com.platform.utils.Utility;

/**
 * Initialize the module
 */
public class InitializeDispatchAction implements Action {
	public static final String TRACE_ID = InitializeDispatchAction.class.getName();

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	error		= null;

		try {
			//check if request consist of any error in request object
			error = ActionStaticUtil.getSystemErrorColl(request);

			//check for session if valid then only proceed and if there is any system error
			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	modulename	= request.getParameter("modulename");

			if(modulename != null && BusinessFunctionConstants.modulesWithoutSession().contains(modulename)
					&& JSPUtility.GetShort(request, "redirectFilter", (short) 0) == 1) {
				request.setAttribute("isShowHeader", false);
				request.setAttribute("nextPageToken", "success");
				return;
			}

			final var	cache			= new CacheManip(request);
			final var	executive		= cache.getExecutive(request);

			if (executive == null) {
				ActionStaticUtil.throwInvalidSessionError(request, error);
				return;
			}

			final var	branch			= cache.getBranchById(request, executive.getAccountGroupId(), executive.getBranchId());
			final var	accountGroup	= cache.getAccountGroupById(request, executive.getAccountGroupId());
			final var	configuration	= cache.getLsConfiguration(request, executive.getAccountGroupId());

			if(branch != null)
				branch.setPhoneNumber(Utility.checkedNullCondition(branch.getPhoneNumber(), (short) 1));

			if(branch == null)
				response.sendRedirect("Failure.do?pageId=0&eventId=1&filter=22");

			request.setAttribute("executiveBranch", branch);
			request.setAttribute("executiveAccountGroupName", accountGroup.getName());
			request.setAttribute("customAddressBranchId", executive.getBranchId());
			request.setAttribute("customAddressIdentifer", CustomGroupMapper.IDENTIFIER_BOOKING);

			ActionStaticUtil.setReportViewModel(request);

			setMappls(request, executive, modulename);

			request.setAttribute("oldJSPForPrint", PropertiesUtility.isAllow(configuration.getString(LsConfigurationDTO.TRANSPORT_OLD_FLOW_LS_PRINT,"false")));
			request.setAttribute("oldDispatchPrint", PropertiesUtility.isAllow(configuration.getString(LsConfigurationDTO.CARGO_OLD_FLOW_LS_PRINT,"false")));
			request.setAttribute("isNewBS", BusinessFunctionConstants.modulesWithNewDesign().contains(modulename));
			request.setAttribute("isShowHeader", true);

			//return success if there is no error
			request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}

	private void setMappls(final HttpServletRequest request, final Executive executive, final String modulename) {
		try {
			if(modulename != null && StringUtils.equalsIgnoreCase(modulename, "mapplsMapSearch")) {
				final var responseStr = OkHttpUtility.sendOKHttpRequest(ApiDataBllImpl.getInstance().getMapplsApi());

				if(StringUtils.contains(responseStr, "error")) {
					final var module    = new StringBuilder();
					module.append("&accountGroupId=" + executive.getAccountGroupId());
					module.append("&sourceBranchId=" + executive.getBranchId());
					module.append("&executiveId=" + executive.getExecutiveId());

					WSUtility.callPostWebService(WSUtility.getWebServiceUrl(Integer.toString(WebServiceURI.GENERATE_MAPPLS_API_TOKEN)), module.toString());
				}

				request.setAttribute("mapplsApiUrl", ApiDataBllImpl.getInstance().getMapplsApi());
				request.setAttribute("mapplsAccessToken", ApiDataBllImpl.getInstance().getMapplsAccessToken());
			}
		} catch (final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
		}
	}
}