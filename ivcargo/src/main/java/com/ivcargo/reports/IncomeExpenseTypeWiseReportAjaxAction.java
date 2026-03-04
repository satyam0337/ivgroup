package com.ivcargo.reports;

import java.io.PrintWriter;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.IncomeExpenseHeadwiseDetailsReportBLL;
import com.businesslogic.IncomeExpenseTypeWiseAjaxBLL;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.dto.constant.ExecutiveTypeConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.ExecutiveFeildPermissionDTO;
import com.platform.dto.TransportCommonMaster;
import com.platform.dto.constant.FeildPermissionsConstant;

public class IncomeExpenseTypeWiseReportAjaxAction implements Action {

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		StringBuffer				 str 				= null;
		ValueObject					 valueInObject		= null;
		ValueObject					 valueOutObject		= null;
		PrintWriter 				 out				= null;
		short						 filter				= 0;
		String						 queryString		= null;

		HashMap<Long, ExecutiveFeildPermissionDTO>		execFldPermission		= null;
		ExecutiveFeildPermissionDTO						execFeildPermissions	= null;
		HashMap<String,Object>	 	error 				= null;

		try {

			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			response.setContentType("text/plain");

			final var	cacheManip		= new CacheManip(request);
			final var	executive 		= cacheManip.getExecutive(request);
			final var	chargeType = Integer.parseInt(request.getParameter("chargeType"));
			final var	incExpType = Integer.parseInt(request.getParameter("IncExpType"));

			var	regionId 	= JSPUtility.GetLong(request, "region", 0);
			var	subRegionId = JSPUtility.GetLong(request, "subRegion", 0);

			if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN) {
				regionId	= JSPUtility.GetLong(request, "region", 0);
				subRegionId = JSPUtility.GetLong(request, "subRegion", 0);
			} else if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_REGIONADMIN) {
				regionId	= executive.getRegionId();
				subRegionId = JSPUtility.GetLong(request, "subRegion", 0);
			} else {
				regionId	= executive.getRegionId();
				subRegionId = executive.getSubRegionId();
			}

			if(request.getParameter("filter")== null){
				//Deprecated done in AutoCompleteBllImpl.java

				valueInObject = new ValueObject();
				valueInObject.put("chargeType", chargeType);
				valueInObject.put("incExpType", incExpType);
				valueInObject.put("executive", executive);

				valueOutObject = IncomeExpenseTypeWiseAjaxBLL.getInstance().getIncomeExpenseHeadersAjax(valueInObject);

				out = response.getWriter();
				str = (StringBuffer) valueOutObject.get("resultHeaders") ;
				out.println(str);
				out.flush();
			}else{
				//Deprecated done in AutoCompleteBllImpl.java
				filter = Short.parseShort(request.getParameter("filter"));
				switch (filter) {
				case 2:
					queryString = request.getParameter("q");

					valueInObject = new ValueObject();
					valueInObject.put("chargeType", chargeType);
					valueInObject.put("incExpType", incExpType);
					valueInObject.put("executive", executive);
					valueInObject.put("queryString", queryString);
					valueInObject.put("regionId", regionId);
					valueInObject.put("subRegionId", subRegionId);
					valueInObject.put("branchExpenseConfig", cacheManip.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.BRANCH_EXPENSE));

					valueOutObject = IncomeExpenseHeadwiseDetailsReportBLL.getInstance().getIncomeExpenseHeadersAjax(valueInObject);

					out = response.getWriter();
					str = (StringBuffer) valueOutObject.get("resultHeaders") ;
					out.println(str);
					out.flush();

					break;
				case 3:
					//Deprecated done in AutoCompleteBllImpl.java y getActiveIncomeExpenseHeadersList()
					execFldPermission = cacheManip.getExecutiveFieldPermission(request);

					if(incExpType == TransportCommonMaster.CHARGE_TYPE_INCOME)
						execFeildPermissions = execFldPermission.get(FeildPermissionsConstant.BRANCH_INCOME_SEARCH_FIRST);
					else
						execFeildPermissions = execFldPermission.get(FeildPermissionsConstant.BRANCH_EXPENSE_SEARCH_FIRST);

					queryString = request.getParameter("q");

					valueInObject = new ValueObject();
					valueInObject.put("chargeType", chargeType);
					valueInObject.put("incExpType", incExpType);
					valueInObject.put("executive", executive);
					valueInObject.put("queryString", queryString);
					valueInObject.put("execFeildPermissions", execFeildPermissions);

					valueOutObject = IncomeExpenseHeadwiseDetailsReportBLL.getInstance().getActiveIncomeExpenseHeadersAjax(valueInObject);

					out = response.getWriter();
					str = (StringBuffer) valueOutObject.get("resultHeaders");
					out.println(str);
					out.flush();
					break;
				default:
					break;
				}
			}

			request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		} finally{
			if(out != null) out.close();
		}
	}
}