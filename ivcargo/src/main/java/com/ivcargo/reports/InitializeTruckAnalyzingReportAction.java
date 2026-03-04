package com.ivcargo.reports;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONObject;

import com.framework.Action;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.ivcargo.utils.JsonUtility;
import com.platform.dto.AccountGroup;
import com.platform.dto.Branch;
import com.platform.dto.Executive;
import com.platform.jsonconstant.JsonConstant;
import com.platform.utils.Converter;

/**
 * Initialize the module
 */
public class InitializeTruckAnalyzingReportAction implements Action {
	public static final String TRACE_ID = InitializeTruckAnalyzingReportAction.class.getName();

	public void execute(HttpServletRequest request, HttpServletResponse response) {

		HashMap<String,Object>	error 				= null;
		Executive 				executive 			= null;
		CacheManip				cache				= null;
		Branch					branch				= null;
		AccountGroup			accountGroup		= null;
		ValueObject				print				= null;
		ValueObject				valueObject			= null;
		try {

			//check if request consist of any error in request object
			error = ActionStaticUtil.getSystemErrorColl(request);

			//check for session if valid then only proceed and if there is any system error
			if(ActionStaticUtil.isSystemError(request,error)){
				return;
			}
			cache = new CacheManip(request);
			executive 		= (Executive) request.getSession().getAttribute("executive");
			
			branch = cache.getBranchById(request, executive.getAccountGroupId(), executive.getBranchId());
			
			accountGroup = cache.getAccountGroupById(request, executive.getAccountGroupId());
			
			request.setAttribute("executiveBranch", branch);
			request.setAttribute("executiveAccountGroupName", accountGroup.getName());
			
			print = new ValueObject();
			
			print.put("executive", Converter.DtoToHashMap(executive));
			JsonConstant.getInstance().setOutputConstant(print);
			valueObject		= new ValueObject();
			valueObject.put("printJson", print);
			
			JSONObject object = JsonUtility.convertionToJsonObjectForResponse(valueObject);
			
			request.setAttribute("printJsonObject", object);
			//return success if there is no error
			request.setAttribute("nextPageToken", "success");
		} catch (Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		} finally {
			error = null;
		}
	}
}