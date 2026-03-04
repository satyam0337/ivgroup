package com.ivcargo.actions;

import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.properties.GeneralConfiguration;
import com.framework.Action;
import com.iv.bll.impl.properties.BranchExpenseConfigurationBllImpl;
import com.iv.constant.properties.BranchExpensePropertiesConstant;
import com.iv.dto.constant.FeildPermissionsConstant;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.ConfigParam;
import com.platform.dto.Executive;

public class InitializeBranchExpensesAction implements Action{
	public static final String TRACE_ID = "InitializeBranchExpensesAction";

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {

		HashMap<String,Object>	 						error 									= null;
		Executive 										executive 								= null;
		String 											previousDate 							= null;
		String 											currentDate  							= null;
		CacheManip										cacheManip								= null;
		int												maxNoOfDaysAllowBeforeCashStmtEntry		= 0;
		boolean											allowNewScreen							= false;
		ValueObject										generalConfiguration					= null;
		boolean											bankPaymentOperationRequired			= false;
		HashMap<?, ?>									execFldPermissions						= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			cacheManip			= new CacheManip(request);
			executive 			= cacheManip.getExecutive(request);
			execFldPermissions	= cacheManip.getExecutiveFieldPermission(request);

			if(executive != null) {
				currentDate  						= DateTimeUtility.getCurrentDateString();
				maxNoOfDaysAllowBeforeCashStmtEntry = cacheManip.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_MAX_DAYS_OF_OPERATION_BEFORE_CASHSTATEMENT_ENTRY_ID);

				final Map<Object, Object>	configuration	= BranchExpenseConfigurationBllImpl.getInstance().getBranchExpenseProperty(executive.getAccountGroupId());
				allowNewScreen						= (boolean) configuration.get(BranchExpensePropertiesConstant.ALLOW_NEW_SCREEN);
				generalConfiguration				= cacheManip.getGeneralConfiguration(request, executive.getAccountGroupId());
				bankPaymentOperationRequired		= generalConfiguration.getBoolean(GeneralConfiguration.BANK_PAYMENT_OPERATION_REQUIRED, false);

				if(execFldPermissions != null && execFldPermissions.get(FeildPermissionsConstant.MANUAL_DAYS_FOR_OFFICE_EXPENSE) != null)
					previousDate 					= DateTimeUtility.getDateBeforeNoOfDays(maxNoOfDaysAllowBeforeCashStmtEntry);
				else
					previousDate					= currentDate;

				request.setAttribute("currentDate", currentDate);
				request.setAttribute("noOfDays",""+maxNoOfDaysAllowBeforeCashStmtEntry);
				request.setAttribute("previousDate",""+previousDate);
				request.setAttribute("voucherDetailsId", request.getParameter("voucherDetailsId"));
				request.setAttribute("voucherType", request.getParameter("voucherType"));
				request.setAttribute("paymentVoucherSequenceNumber", request.getParameter("paymentVoucherSequenceNumber"));

				if (allowNewScreen || bankPaymentOperationRequired)
					request.setAttribute("nextPageToken", "success_new");
				else
					request.setAttribute("nextPageToken", "success");
			} else
				request.setAttribute("nextPageToken", "needlogin");
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}
	}
}