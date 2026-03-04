
package com.ivcargo.actions.masters;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.OctroiAgentMasterDao;
import com.platform.dto.City;
import com.platform.dto.Executive;
import com.platform.dto.OctroiAgentMaster;

public class OctroiAgentMasterAction implements Action{
	public static final String TRACE_ID = "OctroiAgentMasterAction";

	public void execute(HttpServletRequest request, HttpServletResponse response) {
	
		HashMap<String,Object>	error 			= null;
		String 				  strResponse      = null;
		HashMap<Long, City>   regionCities     = null;
		HashMap<Long, City>   subRegionCities  = null;
		CacheManip            cache            = null;; 

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			
			if(ActionStaticUtil.isSystemError(request,error)){
				return;
			}
			
			int filter =0;
			OctroiAgentMaster  agent = new OctroiAgentMaster();

			cache            = new CacheManip(request); 
			Executive 	exec = cache.getExecutive(request);
			ValueObject city = cache.getCityData(request);

			filter = JSPUtility.GetInt(request, "filter",0);

			switch (filter) {

			case 1:	//Add Octroi Agent

				agent.setName(JSPUtility.GetString(request, "name"));
				agent.setAddress(JSPUtility.GetString(request, "address"));
				agent.setAccountGroupId(exec.getAccountGroupId());
				agent.setCityId(JSPUtility.GetLong(request, "city"));
				agent.setStateId(((City) city.get("" +agent.getCityId())).getStateId()); 
				agent.setCountryId(exec.getCountryId()); 
				agent.setPincode(JSPUtility.GetLong(request, "pinCode"));
				agent.setContactPerson(JSPUtility.GetString(request, "contactPerson"));
				agent.setPhoneNumber(JSPUtility.GetString(request, "phoneNumber1"));
				agent.setMobileNumber(JSPUtility.GetString(request, "mobileNumber1"));
				agent.setPhoneNumber2(JSPUtility.GetString(request, "phoneNumber2"));
				agent.setMobileNumber2(JSPUtility.GetString(request, "mobileNumber2"));
				agent.setFaxNumber(JSPUtility.GetString(request, "faxNumber"));
				agent.setEmailId(JSPUtility.GetString(request, "emailAddress"));
				agent.setMarkForDelete(false);

				strResponse = OctroiAgentMasterDao.getInstance().insert(agent);

				break;
			case 2:	//Update Octroi Agent

				agent.setOctroiAgentMasterId(JSPUtility.GetLong(request, "selectedOctroiAgentId"));
				agent.setName(JSPUtility.GetString(request, "name"));
				agent.setAddress(JSPUtility.GetString(request, "address"));
				agent.setAccountGroupId(exec.getAccountGroupId());
				agent.setCityId(JSPUtility.GetLong(request, "city"));
				agent.setStateId(((City) city.get("" +agent.getCityId())).getStateId()); 
				agent.setCountryId(exec.getCountryId()); 
				agent.setPincode(JSPUtility.GetLong(request, "pinCode"));
				agent.setContactPerson(JSPUtility.GetString(request, "contactPerson"));
				agent.setPhoneNumber(JSPUtility.GetString(request, "phoneNumber1"));
				agent.setMobileNumber(JSPUtility.GetString(request, "mobileNumber1"));
				agent.setPhoneNumber2(JSPUtility.GetString(request, "phoneNumber2"));
				agent.setMobileNumber2(JSPUtility.GetString(request, "mobileNumber2"));
				agent.setFaxNumber(JSPUtility.GetString(request, "faxNumber"));
				agent.setEmailId(JSPUtility.GetString(request, "emailAddress"));
				agent.setMarkForDelete(false); 

				strResponse = OctroiAgentMasterDao.getInstance().update(agent);

				break;
			case 3:	//Delete Octroi Agent

				strResponse =  OctroiAgentMasterDao.getInstance().delete(JSPUtility.GetInt(request, "selectedOctroiAgentId"));

				break;
			default:
				break;
			}
			
			if(exec.getExecutiveType() == Executive.EXECUTIVE_TYPE_GROUPADMIN){
				request.setAttribute("cityList", cache.getCityListWithName(request, exec));
			}else if(exec.getExecutiveType() == Executive.EXECUTIVE_TYPE_REGIONADMIN){
				regionCities = cache.getCitiesByRegionId(request, exec.getAccountGroupId(), exec.getRegionId());
				request.setAttribute("regionCities", regionCities); 
			}else if(exec.getExecutiveType() == Executive.EXECUTIVE_TYPE_SUBREGIONADMIN){
				subRegionCities = cache.getCitiesBySubRegionId(request, exec.getAccountGroupId(), exec.getSubRegionId());
				request.setAttribute("subRegionCities", subRegionCities); 
			}
			//request.setAttribute("allStates", allStates);
			request.setAttribute("nextPageToken", "success");
			if(filter != 0) {
				response.sendRedirect("OctroiAgentMaster.do?pageId=237&eventId=1&message="+strResponse);
				request.setAttribute("message",strResponse);
			}
		} catch (Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		} finally {
			strResponse  = null;
			regionCities = null;
			subRegionCities = null;
			cache        = null;
		}
	}
}
