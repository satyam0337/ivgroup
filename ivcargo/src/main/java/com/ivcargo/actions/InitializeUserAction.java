package com.ivcargo.actions;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.commons.lang3.StringUtils;

import com.businesslogic.ExecutiveBLL;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.dto.Executive;
import com.iv.dto.constant.FeildPermissionsConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.dto.model.ExecutiveModel;
import com.iv.utils.constant.Constant;
import com.iv.utils.constant.LoginPageConfigurationConstant;
import com.iv.utils.constant.properties.ServerIPAddressConfigurationConstant;
import com.iv.utils.message.Message;
import com.iv.utils.message.MessageList;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.ExecutiveFeildPermissionDAO;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

public class InitializeUserAction implements Action {

	public static final String TRACE_ID = InitializeUserAction.class.getName();

	private static final String OTP_DETAILS_HM	= "otpDetailsHM";
	private static final String NEED_LOGIN		= "needlogin";

	@SuppressWarnings({ "unchecked" })
	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String, Object> 		error 		= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request, error))
				return;

			final var	sessionValidationAction = new SessionValidationAction();
			sessionValidationAction.execute(request, response);

			if(error == null)
				error	= new HashMap<>();

			final var	validLogin			= validateUserLogin(request, response, error);

			if(request.getAttribute(LoginPageConfigurationConstant.IS_OTP_BASED_LOGIN) != null
					&& (boolean) request.getAttribute(LoginPageConfigurationConstant.IS_OTP_BASED_LOGIN)) {
				final var otpDetailsHM	= (Map<Object, Object>) request.getAttribute(OTP_DETAILS_HM);

				if(otpDetailsHM != null) {
					final var	executive	= (Executive) request.getAttribute(ExecutiveModel.EXECUTIVE_MODEL);
					request.setAttribute(Constant.MOBILE_NUMBER, executive.getExecutiveMobileNumber());
					request.setAttribute(Constant.EXECUTIVE_ID, executive.getExecutiveId());
					request.setAttribute(OTP_DETAILS_HM, otpDetailsHM);
					request.setAttribute("nextPageToken", "success_otp");
				} else
					request.setAttribute(ActionStaticUtil.NEXTPAGETOKEN, NEED_LOGIN);
			} else if(validLogin) {
				final var loginAction	= new LoginAction();
				loginAction.execute(request, response);
			} else {
				request.setAttribute(CargoErrorList.CARGO_ERROR, error);
				request.setAttribute(ActionStaticUtil.NEXTPAGETOKEN, NEED_LOGIN);
			}
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}

	private boolean validateUserLogin(final HttpServletRequest request, final HttpServletResponse response, final HashMap<String, Object> error) throws Exception {
		Executive		executiveAkka					= null;
		var				validLogin						= true;

		try {
			final var	sessionObj		= request.getSession();

			if (error.size() > 0 && error.containsKey(CargoErrorList.ERROR_CODE)) {
				executiveAkka	= (Executive) sessionObj.getAttribute(ExecutiveModel.EXECUTIVE_MODEL);
				validLogin		= checkForDuplicateSession(request, response, executiveAkka, sessionObj, error);
			} else {
				final var cache = new CacheManip(request);
				final Map<Object, Object> valueInObject  = new HashMap<>();

				valueInObject.put(Constant.USER_NAME, JSPUtility.GetString(request, Constant.USER_NAME));
				valueInObject.put(Constant.PASSWORD, JSPUtility.GetString(request, Constant.PASSWORD));
				valueInObject.put(Constant.ACCOUNT_GROUP_CODE, JSPUtility.GetString(request, Constant.ACCOUNT_GROUP_CODE));
				valueInObject.put(Constant.MAC_ADDRESS, JSPUtility.GetString(request, Constant.MAC_ADDRESS, null));
				valueInObject.put(ServerIPAddressConfigurationConstant.SERVER_IP_ADDRESS, cache.getConfiguration(request, ModuleIdentifierConstant.SERVER_IP_ADDRESS));
				valueInObject.put(Constant.IV_CARGO_URL, cache.getWebsiteURL(request));
				valueInObject.put("branches", cache.getBranchesData(request));

				final var	configuration	= ExecutiveBLL.getInstance().validateUserBreforeLogin(valueInObject);

				if(configuration.containsKey(Message.MESSAGE))
					validLogin	= setErrorMessages(request, error, configuration);
				else {
					final var	allowToLoginFromAnyBrowser	= (boolean) configuration.getOrDefault(LoginPageConfigurationConstant.ALLOW_TO_LOGIN_FROM_ANY_BROWSER, false);

					executiveAkka		= (Executive) configuration.get(Executive.EXECUTIVE);

					if(!JSPUtility.GetBoolean(request, Constant.IS_FIRE_FOX_BROWSER, false) && !allowToLoginFromAnyBrowser && ExecutiveFeildPermissionDAO.getInstance().getDetailsByExecutiveAndPermissionId(executiveAkka.getExecutiveId(), FeildPermissionsConstant.ALLOW_TO_LOGIN_FROM_ANY_BROWSER) == null)
						validLogin	= setInvalidBrowserError(request, error);
					else {
						final var	isOTPBasedLogin	= (boolean) configuration.getOrDefault(LoginPageConfigurationConstant.IS_OTP_BASED_LOGIN, false)
								&& ExecutiveFeildPermissionDAO.getInstance().getDetailsByExecutiveAndPermissionId(executiveAkka.getExecutiveId(), FeildPermissionsConstant.DO_NOT_ALLOW_OTP_BASED_LOGIN) == null;

						if(isOTPBasedLogin)
							setOtpBasedLoginInformation(request, executiveAkka, error, isOTPBasedLogin);
					}
				}
			}

			request.setAttribute(ExecutiveModel.EXECUTIVE_MODEL, executiveAkka);
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}

		return validLogin;
	}

	private boolean checkForDuplicateSession(final HttpServletRequest request, final HttpServletResponse response, final Executive executive, final HttpSession sessionObj,
			final Map<String, Object> error) throws IOException {
		final var	username			= JSPUtility.GetString(request, Constant.USER_NAME);
		final var	password			= JSPUtility.GetString(request, Constant.PASSWORD);
		final var	accountGroupCode	= JSPUtility.GetString(request, Constant.ACCOUNT_GROUP_CODE);

		if(executive == null || username == null || password == null || accountGroupCode == null || !StringUtils.equalsIgnoreCase(username, (String) sessionObj.getAttribute(Constant.USER_NAME)) || !StringUtils.equalsIgnoreCase(password, (String) sessionObj.getAttribute(Constant.PASSWORD))
				|| !StringUtils.equalsIgnoreCase(accountGroupCode, (String) sessionObj.getAttribute(Constant.ACCOUNT_GROUP_CODE)) || (Integer) error.get(CargoErrorList.ERROR_CODE) != CargoErrorList.MULTIPLE_ACCOUNT_LOGIN_ERROR) {
			request.setAttribute(CargoErrorList.CARGO_ERROR, error);
			request.setAttribute(ActionStaticUtil.NEXTPAGETOKEN, NEED_LOGIN);
			return false;
		}

		response.sendRedirect("SearchWayBill.do?pageId=2&eventId=1");

		return true;
	}

	private void setOtpBasedLoginInformation(final HttpServletRequest request, final Executive executive, final Map<String, Object> error, final boolean isOTPBasedLogin) throws Exception {
		if(executive.getExecutiveMobileNumber() == null || !Utility.checkValidMobileNumber(executive.getExecutiveMobileNumber())) {
			error.put(CargoErrorList.ERROR_CODE, "0");
			error.put(CargoErrorList.ERROR_DESCRIPTION, "Mobile Number not Found, Please contact to Head Office to Update Mobile Number !");
			request.setAttribute(CargoErrorList.CARGO_ERROR, error);
			request.setAttribute(ActionStaticUtil.NEXTPAGETOKEN, NEED_LOGIN);
		} else
			request.setAttribute(OTP_DETAILS_HM, ExecutiveBLL.getInstance().sendOtpToUser(executive.getExecutiveId()));

		request.setAttribute(LoginPageConfigurationConstant.IS_OTP_BASED_LOGIN, isOTPBasedLogin);
	}

	private boolean setErrorMessages(final HttpServletRequest request, final Map<String, Object> error, final Map<Object, Object> configuration) {
		final var	message	= (Message) configuration.get(Message.MESSAGE);
		error.put(CargoErrorList.ERROR_CODE, message.getMessageId());
		error.put(CargoErrorList.ERROR_DESCRIPTION, message.getDescription());
		error.put(Constant.IV_CARGO_URL, configuration.get(Constant.IV_CARGO_URL));
		error.put(LoginPageConfigurationConstant.REDIRECT_TO_RIGHT_WEBSITE, message.getMessageId() == MessageList.PERMISSIONS_FOR_USER && configuration.get(Constant.IV_CARGO_URL) != null && (boolean) configuration.getOrDefault(LoginPageConfigurationConstant.REDIRECT_TO_RIGHT_WEBSITE, false));
		request.setAttribute(CargoErrorList.CARGO_ERROR, error);
		request.setAttribute(ActionStaticUtil.NEXTPAGETOKEN, "failure");
		return false;
	}

	private boolean setInvalidBrowserError(final HttpServletRequest request, final Map<String, Object> error) {
		error.put(CargoErrorList.ERROR_CODE, CargoErrorList.INVALID_BROWSER_LOGIN);
		error.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.INVALID_BROWSER_LOGIN_DESCRIPTION);
		request.setAttribute(CargoErrorList.CARGO_ERROR, error);
		request.setAttribute(ActionStaticUtil.NEXTPAGETOKEN, NEED_LOGIN);
		return false;
	}
}