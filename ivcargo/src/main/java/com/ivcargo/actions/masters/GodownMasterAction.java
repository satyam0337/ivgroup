package com.ivcargo.actions.masters;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.dto.constant.ExecutiveTypeConstant;
import com.iv.utils.DateTime.DateTimeUtility;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.GodownDao;
import com.platform.dto.Branch;
import com.platform.dto.Executive;
import com.platform.dto.Godown;
import com.platform.resource.CargoErrorList;

public class GodownMasterAction implements Action{
	public static final String TRACE_ID = "GodownMasterAction";

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {

		HashMap<String,Object>	 error 					= null;
		int filter =0;
		String strResponse                              = null;
		CacheManip           cache                      = new CacheManip(request);
		Branch branch 									= null;
		Godown[] godownArr                              = null;
		long 	  newGodownId = 0;

		try{

			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final Executive loggedInExec = cache.getExecutive(request);
			filter = JSPUtility.GetInt(request, "filter",0);
			final long godownId = JSPUtility.GetLong(request, "selectedGodownId",0);
			final Godown  godown = new Godown();

			switch (filter) {
			case 1:	//Add Godown For Branch

				godown.setBranchId(JSPUtility.GetLong(request, "branch"));
				godown.setAccountGroupId(loggedInExec.getAccountGroupId());
				godown.setName(JSPUtility.GetString(request, "name"));
				godown.setAddress(JSPUtility.GetString(request, "address"));
				godown.setContactPersonName(JSPUtility.GetString(request, "contactPerson"));
				godown.setMobileNumber(JSPUtility.GetString(request, "mobileNumber"));
				godown.setPhoneNumber(JSPUtility.GetString(request, "phoneNumber"));
				godown.setMarkForDelete(false);
				godown.setCreationDateTime(DateTimeUtility.getCurrentTimeStamp());

				newGodownId = GodownDao.getInstance().insert(godown);

				if(newGodownId > 0)
					strResponse =  CargoErrorList.MASTER_DATA_INSERT_SUCCESS_DESCRIPTION ;
				else
					strResponse = "Godown Insert "+CargoErrorList.MASTER_DATA_OPERATION_FAILURE_DESCRIPTION;

				break;

			case 2:	//Update Godown
				godown.setGodownId(godownId);
				godown.setName(JSPUtility.GetString(request, "name"));
				godown.setAddress(JSPUtility.GetString(request, "address"));
				godown.setPincode(JSPUtility.GetLong(request, "pinCode",0));
				godown.setContactPersonName(JSPUtility.GetString(request, "contactPerson"));
				godown.setMobileNumber(JSPUtility.GetString(request, "mobileNumber"));
				godown.setPhoneNumber(JSPUtility.GetString(request, "phoneNumber"));
				godown.setMarkForDelete(false);

				strResponse = GodownDao.getInstance().update(godown);
				break;

			case 3:	//Delete Godown
				strResponse =  GodownDao.getInstance().delete(godownId);
				break;

			default:
				break;
			}

			ActionStaticUtil.executiveTypeWiseSelection(request, cache, loggedInExec);

			if(loggedInExec.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_BRANCHADMIN){
				godownArr = GodownDao.getInstance().getGodownList(loggedInExec.getBranchId(), loggedInExec.getAccountGroupId());
				branch       = cache.getGenericBranchDetailCache(request,loggedInExec.getBranchId());
				request.setAttribute("godownArr", godownArr);
				request.setAttribute("branch", branch);
			}

			request.setAttribute("nextPageToken", "success");

			if(filter != 0) {
				response.sendRedirect("Masters.do?pageId=229&eventId=1&message="+strResponse);
				request.setAttribute("message",strResponse);
			}
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		} finally{
			strResponse					 = null;
			cache 						 = null;
			branch 						 = null;
			godownArr                    = null;
		}
	}
}
