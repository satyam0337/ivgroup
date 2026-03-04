package com.ivcargo.actions.masters;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.ExecutiveMasterBLL;
import com.businesslogic.properties.impl.PropertyConfigValueBLLImpl;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.bll.impl.properties.DisplayDataConfigurationBllImpl;
import com.iv.constant.properties.SearchConfigPropertiesConstant;
import com.iv.constant.properties.master.ExecutiveMasterConfigurationConstant;
import com.iv.dao.impl.AccountGroupPermissionsDaoImpl;
import com.iv.dto.constant.BusinessFunctionConstants;
import com.iv.dto.constant.ExecutiveTypeConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.logsapp.LogWriter;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.exception.ExceptionProcess;
import com.iv.utils.utility.AESEncryptDecrypt;
import com.iv.utils.webService.WSUtility;
import com.iv.utils.webService.WebServiceURI;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.ExecutiveDao;
import com.platform.dao.StateDao;
import com.platform.dto.Branch;
import com.platform.dto.Executive;
import com.platform.dto.PropertiesFileConstants;
import com.platform.dto.constant.FeildPermissionsConstant;
import com.platform.resource.CargoErrorList;

public class ExecutiveMasterAction implements Action {

	public static final String TRACE_ID = "ExecutiveMasterAction";

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>			error 								= null;
		String							strResponse							= null;
		Executive						exec								= null;
		ValueObject						outValObj							= null;
		Executive[]						executiveArr						= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	cache						= new CacheManip(request);

			if(!ActionStaticUtil.isAllowToAccessOperation(error, cache, request, BusinessFunctionConstants.EXECUTIVE_MASTER))
				return;

			final var	inValObj					= new ValueObject();
			final var	bll							= new ExecutiveMasterBLL();
			final var 	loggedInExec				= cache.getExecutive(request);
			final var	allStates					= StateDao.getInstance().findStatesByAccountGroupId(loggedInExec.getAccountGroupId());
			final var	dataBaseConfig				= PropertyConfigValueBLLImpl.getInstance().getConfiguration(loggedInExec, PropertiesFileConstants.DATABASE_CONFIG_PROPERTIES);
			final var	executiveMasterConfig		= cache.getConfiguration(request, loggedInExec.getAccountGroupId(), ModuleIdentifierConstant.EXECUTIVE_MASTER);
			final var	showExecutiveDetailsLink	= (boolean) executiveMasterConfig.getOrDefault(ExecutiveMasterConfigurationConstant.SHOW_EXECUTIVE_DETAILS_LINK, true);
			final var	enforceStrictPasswordPolicy	= (boolean) executiveMasterConfig.getOrDefault(ExecutiveMasterConfigurationConstant.ENFORCE_STRICT_PASSWORD_POLICY, false);
			final var	allowToShowIsMarketingPerson = (boolean) executiveMasterConfig.getOrDefault(ExecutiveMasterConfigurationConstant.ALLOW_TO_SHOW_IS_MARKETING_PERSON, false);
			final var	searchConfiguration			= cache.getSearchConfiguration(request, loggedInExec.getAccountGroupId());
			final var	prevExecutiveData			= ExecutiveDao.getInstance().getExecutiveMasterById(JSPUtility.GetLong(request, "selectedExecutiveId",0));
			final var	accountGroupId				= loggedInExec.getAccountGroupId();
			final var	displayDataConfig			= cache.getConfiguration(request, accountGroupId, ModuleIdentifierConstant.DISPLAY_DATA_CONFIGURATION);
			var			displayOnlyActiveUser 		= DisplayDataConfigurationBllImpl.getInstance().displayOnlyActiveUserInModule(displayDataConfig, ModuleIdentifierConstant.EXECUTIVE_MASTER);
			final var	preAccGrpPermission			= AccountGroupPermissionsDaoImpl.getInstance().getGroupLevelFeildPermission(accountGroupId, FeildPermissionsConstant.SHOW_DEACTIVATE_USER);

			final var	execFldPermissions1 		= cache.getExecutiveFieldPermission(request);
			final var	allowEditCurrentPassword 	= execFldPermissions1.get(FeildPermissionsConstant.EDIT_CURRENT_PASSWORD) != null;

			if(preAccGrpPermission != null && !preAccGrpPermission.isMarkForDelete())
				displayOnlyActiveUser = false;

			inValObj.put("dataBaseConfig", dataBaseConfig);

			final var	filter		= JSPUtility.GetInt(request, "filter",0);
			final var	executiveId = JSPUtility.GetLong(request, "selectedExecutiveId",0);

			switch (filter) {
			case 1 -> {
				exec = new Executive();
				exec.setAccountGroupId(loggedInExec.getAccountGroupId());
				exec.setCountryId(loggedInExec.getCountryId());
				setExecutive(request, exec, cache);
				final var branchTypeId = cache.getGenericBranchDetailCache(request,exec.getBranchId()).getBranchType();
				inValObj.put("loggedInExec", loggedInExec);
				inValObj.put("executive", exec);
				inValObj.put("branchTypeId", branchTypeId);
				inValObj.put(SearchConfigPropertiesConstant.SEARCH_CONFIGURATION, searchConfiguration);

				outValObj = bll.createExecutive(inValObj);

				if (outValObj != null && outValObj.get("response") != null)
					strResponse = (String) outValObj.get("response");
				else
					strResponse = CargoErrorList.MASTER_DATA_OPERATION_FAILURE_DESCRIPTION;
			}
			case 2 -> {

				exec = new Executive();
				exec.setExecutiveId(executiveId);
				exec.setAccountGroupId(loggedInExec.getAccountGroupId());
				exec.setCountryId(loggedInExec.getCountryId());
				setExecutive(request, exec, cache);
				inValObj.put("loggedInExec", loggedInExec);
				inValObj.put("executive", exec);
				inValObj.put("allowEditCurrentPassword", allowEditCurrentPassword);
				inValObj.put("prevExecData", prevExecutiveData);
				outValObj = bll.updateExecutive(inValObj);

				if (outValObj != null && outValObj.get("response") != null)
					strResponse = (String) outValObj.get("response");
				else
					strResponse = CargoErrorList.MASTER_DATA_OPERATION_FAILURE_DESCRIPTION;

				Thread.sleep(2000);
				refreshExecutiveFromWs(exec);
			}
			case 4 -> {
				inValObj.put("executiveId", executiveId);
				inValObj.put("status", Executive.EXECUTIVE_DEACTIVE);
				inValObj.put("prevExecData", prevExecutiveData);
				inValObj.put("loggedInExec", loggedInExec);
				outValObj = bll.changeExecutiveStatus(inValObj);

				if (outValObj != null && outValObj.get("response") != null)
					strResponse = (String) outValObj.get("response");
				else
					strResponse = CargoErrorList.MASTER_DATA_OPERATION_FAILURE_DESCRIPTION;
			}
			case 5 -> {
				inValObj.put("executiveId", executiveId);
				inValObj.put("status", Executive.EXECUTIVE_ACTIVE);
				inValObj.put("prevExecData", prevExecutiveData);
				inValObj.put("loggedInExec", loggedInExec);
				outValObj = bll.changeExecutiveStatus(inValObj);

				if (outValObj != null && outValObj.get("response") != null)
					strResponse = (String) outValObj.get("response");
				else
					strResponse = CargoErrorList.MASTER_DATA_OPERATION_FAILURE_DESCRIPTION;
			}
			default -> {
				break;
			}
			}

			ActionStaticUtil.executiveTypeWiseSelection(request, cache, loggedInExec);

			if(loggedInExec.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_BRANCHADMIN) {
				if(displayOnlyActiveUser)
					executiveArr	= ExecutiveDao.getInstance().getActiveExecutiveByBranchId(loggedInExec.getBranchId());
				else
					executiveArr 	= ExecutiveDao.getInstance().findByBranchId(loggedInExec.getBranchId());

				request.setAttribute("executiveArr", executiveArr);
				request.setAttribute("city", cache.getCityById(request, loggedInExec.getCityId()));
				request.setAttribute("branch", cache.getGenericBranchDetailCache(request, loggedInExec.getBranchId()));
			}

			request.setAttribute("allStates", allStates);

			request.setAttribute("nextPageToken", "withoutAgency");
			request.setAttribute("displayActiveUser", displayOnlyActiveUser);

			if(filter != 0) {
				response.sendRedirect("Masters.do?pageId=210&eventId=1&message="+strResponse);
				request.setAttribute("message",strResponse);
			}

			request.setAttribute("showExecutiveDetailsLink", showExecutiveDetailsLink);
			request.setAttribute("allowEditCurrentPassword", allowEditCurrentPassword);
			request.setAttribute("allowToShowIsMarketingPerson", allowToShowIsMarketingPerson);
			request.setAttribute("enforceStrictPasswordPolicy", enforceStrictPasswordPolicy);

		} catch (final Exception e) {
			Thread.currentThread().interrupt();
			ActionStepsUtil.catchActionException(request, e, error);
		}
	}

	private void setExecutive(final HttpServletRequest request, final Executive exec, final CacheManip cache) {

		Branch branch = null;

		try {
			exec.setLogin(JSPUtility.GetString(request, "login"));
			exec.setPassword(AESEncryptDecrypt.decrypt(JSPUtility.GetString(request, "password")));
			exec.setName(JSPUtility.GetString(request, "name"));
			exec.setExecutiveType((short)JSPUtility.GetInt(request, "executiveType"));
			exec.setStateId(JSPUtility.GetLong(request, "state"));
			exec.setCityId(JSPUtility.GetLong(request, "city"));
			exec.setBranchId(JSPUtility.GetLong(request, "branch"));
			branch = cache.getGenericBranchDetailCache(request,exec.getBranchId());
			exec.setAgencyId(JSPUtility.GetLong(request, "agency",branch.getAgencyId()));
			exec.setAddress(JSPUtility.GetString(request, "address"));
			exec.setPincode(JSPUtility.GetLong(request, "pinCode",0));
			exec.setContactPersonName(JSPUtility.GetString(request, "contactPerson"));
			exec.setMobileNumber(JSPUtility.GetString(request, "mobileNumber1"));
			exec.setPhoneNumber(JSPUtility.GetString(request, "phoneNumber1"));
			exec.setFaxNumber(JSPUtility.GetString(request, "faxNumber"));
			exec.setEmailAddress(JSPUtility.GetString(request, "emailAddress"));
			exec.setMobileNumber2(JSPUtility.GetString(request, "mobileNumber2"));
			exec.setPhoneNumber2(JSPUtility.GetString(request, "phoneNumber2"));
			exec.setPreviousPassword(JSPUtility.GetString(request, "previousPassword"));
			exec.setCurrentPassword(JSPUtility.GetString(request, "curretnPassword"));
			exec.setStatus((short) 0);
			exec.setMarkForDelete(false);
			exec.setMarketingPerson(JSPUtility.GetChecked(request, "isMarketingPerson"));
			exec.setAllowMobNotif(JSPUtility.GetChecked(request, "allowMobNotification"));
		} catch (final Exception e) {
			e.printStackTrace();
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, e);
		}
	}

	public void refreshExecutiveFromWs(final Executive executive) throws Exception {
		try {
			final var module	= new StringBuilder();
			module.append("&executiveId=" + executive.getExecutiveId());
			WSUtility.callPostWebService(WSUtility.getWebServiceUrl("" + WebServiceURI.REFRESH_EXECUTIVE_MASTER), module.toString());
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}
}