package com.ivcargo.ajax;
import java.io.PrintWriter;
import java.util.HashMap;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONObject;

import com.businesslogic.properties.impl.PropertyConfigValueBLLImpl;
import com.framework.Action;
import com.iv.logsapp.LogWriter;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.platform.dto.Executive;
import com.platform.dto.PropertiesFileConstants;
import com.platform.dto.configuration.modules.LsPrintConfigurationDTO;
import com.platform.utils.PropertiesUtility;

public class JalaramPrintCookieAjaxAction implements Action{

	private static final String TRACE_ID = "JalaramPrintCookieAjaxAction";

	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>							error  = null;
		Executive									 executive = null;
		JSONObject		  						 jsonObjectGet = null;
		JSONObject		  						 jsonObjectOut = null;
		int 			         						filter = 0;
		ValueObject		  						 configuration = null;
		PropertyConfigValueBLLImpl	propertyConfigValueBLLImpl = null;
		int 		            					   filter1 = 0;
		boolean				    			  isAllowExecutive = false;
		boolean 								isAllowCookies = false;
		String 									  executiveIds = null;
		PrintWriter 							out				= null;
		/*
		 * Initializing the  propertyConfigValueBLLImpl & jsonObjectOut	
		 */
		propertyConfigValueBLLImpl = new PropertyConfigValueBLLImpl();
		jsonObjectOut	= new JSONObject();
		
		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error)){
				return;
			}
			executive		= (Executive)request.getSession().getAttribute("executive");

			/*
			 * Reading filter input because we are using same Action class for multiple type of request
			 * so according to filter input we are deciding the course of action
			 */
			filter=Integer.parseInt(request.getParameter("filter"));

		
			/*
			 * here we are reading the configuration from related file & checking against required
			 * here we are reading the cookie flag is true or false
			 * if true then we are reading the executive id to whom we want to show the
			 * cookie setting popup
			 */
			filter1				= PropertiesFileConstants.LS_PRINT_LOAD_CONFIG;
			configuration		= propertyConfigValueBLLImpl.getConfiguration(executive, filter1);
			isAllowCookies=PropertiesUtility.isAllow(configuration.get(LsPrintConfigurationDTO.COOKIES)+"");
			executiveIds=PropertiesUtility.getValue((configuration.get(LsPrintConfigurationDTO.EXECUTIVE_IDS)+""));
			String executiveIds1[]=executiveIds.split(",");
			if(isAllowCookies){
				for(String id:executiveIds1){
				
					if(Long.parseLong(id)==executive.getExecutiveId()){	
						isAllowExecutive=true;
						break;
					}
				}
			}
			/*filter ==1 
			 * for reading the cookies setting value from user i.e authorized user
			 * we are adding the cookie value in response
			 * 
			 * 
			 */
			if(filter==1){
							
				jsonObjectGet	= new JSONObject(request.getParameter("json"));
				response.setContentType("application/json"); 
				
				if(jsonObjectGet.get("tbb").equals("true")){
				
				Cookie tbb=new Cookie("tbb"+executive.getExecutiveId(),"true");
				tbb.setMaxAge(30*24*60*60);
				response.addCookie(tbb);
				
				}else{
					
					Cookie tbb=new Cookie("tbb"+executive.getExecutiveId(),"false");
					tbb.setMaxAge(30*24*60*60);
					response.addCookie(tbb);
					
				}
				if(jsonObjectGet.get("paid").equals("true")){
				
				Cookie paid=new Cookie("paid"+executive.getExecutiveId(),"true");
				paid.setMaxAge(30*24*60*60);
				response.addCookie(paid);
				
				}else{
					
					Cookie paid=new Cookie("paid"+executive.getExecutiveId(),"false");
					paid.setMaxAge(30*24*60*60);
					response.addCookie(paid);
					
				}
				jsonObjectOut.put("isAllowCookies", isAllowCookies);
				out = response.getWriter();
				out.println(jsonObjectOut);
				out.flush();
				return;
			}
			/*
			 * Filter==2
			 * This filter is only used to check that logged in user is authorized to show cookie 
			 * dialog or not
			 * 
			 */
			if(filter==2){
				jsonObjectOut.put("isAllowCookies", isAllowCookies);
				jsonObjectOut.put("isAllowExecutive", isAllowExecutive);
				jsonObjectOut.put("executive", executive.getExecutiveId());
				out = response.getWriter();
				out.println(jsonObjectOut);
				out.flush();
				return;

				
			}
			/*This code will execute only for opening cookie dialog
			 * 
			 */
			
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_DEBUG,"-- JalaramPrintCookieAjaxAction : ");
			response.setContentType("text/plain");
			request.setAttribute("nextPageToken", "success");
		} catch (Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		}finally{
			out.close();
			executive		= null;
		}
	}

}