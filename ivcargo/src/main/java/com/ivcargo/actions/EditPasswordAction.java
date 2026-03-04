package com.ivcargo.actions;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.ExecutiveMasterBLL;
import com.businesslogic.properties.impl.PropertyConfigValueBLLImpl;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.security.PasswordUtils;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.platform.dto.Executive;
import com.platform.dto.PropertiesFileConstants;

public class EditPasswordAction implements Action{
	public static final String TRACE_ID   = "EditPasswordAction";

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {

		HashMap<String,Object>	 	error 					= null;
		final var executive = (Executive) request.getSession().getAttribute("executive");
		PropertyConfigValueBLLImpl		propertyConfigValueBLLImpl			= null;
		ValueObject						dataBaseConfig						= null;
		ValueObject						inValObj							= null;
		ValueObject						outValObj							= null;
		ExecutiveMasterBLL				bll									= null;
		Executive						exec								= null;
		String							strResponse							= null;

		try {

			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var oldPassword = JSPUtility.GetString(request, "oldPassword" );
			final var newPassword = JSPUtility.GetString(request, "newPassword");
			
			bll							= new ExecutiveMasterBLL();
			inValObj					= new ValueObject();
			propertyConfigValueBLLImpl	= new PropertyConfigValueBLLImpl();
			dataBaseConfig				= propertyConfigValueBLLImpl.getConfiguration(executive, PropertiesFileConstants.DATABASE_CONFIG_PROPERTIES);

			exec = executive.clone();
			exec.setPassword(newPassword);
			exec.setPreviousPassword(newPassword);
			inValObj.put("dataBaseConfig", dataBaseConfig);
			inValObj.put("loggedInExec", executive);
			inValObj.put("executive", exec);
			inValObj.put("prevExecData", exec);
			inValObj.put("fromUpdatePassword", true);
			

			if (PasswordUtils.checkPassword(oldPassword, executive.getPassword())){
				outValObj = bll.updateExecutive(inValObj);

				if (outValObj != null && outValObj.get("response") != null)
					strResponse = "success";
				else
					strResponse = "wrongOldPassword";
				request.setAttribute("updateMsg", strResponse);
			} else
				request.setAttribute("updateMsg", "wrongOldPassword");
			request.setAttribute("nextPageToken", "success");


		}
		catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}
	}

}