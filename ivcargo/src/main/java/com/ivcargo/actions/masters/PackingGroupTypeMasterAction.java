package com.ivcargo.actions.masters;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.framework.JSPUtility;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.platform.dao.PackingGroupTypeMasterDao;
import com.platform.dto.Executive;
import com.platform.dto.PackingGroupTypeMaster;
import com.platform.resource.CargoErrorList;

public class PackingGroupTypeMasterAction implements Action{
	public static final String TRACE_ID = "PackingGroupTypeMasterAction";

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {

		HashMap<String,Object>	error 							= null;
		String 					strResponse 					= null;
		PackingGroupTypeMaster 	packingGroupType 				= null;
		int 					filter 							=0;
		Executive 				executive						= null;

		try{

			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error))
				return;
			executive = (Executive) request.getSession().getAttribute("executive");
			filter = JSPUtility.GetInt(request, "filter",0);
			packingGroupType = new PackingGroupTypeMaster();

			switch (filter) {
			case 1:	//Add PackingGroup Type
				packingGroupType.setPackingGroupTypeName(JSPUtility.GetString(request, "name"));
				packingGroupType.setMFD(false);
				packingGroupType.setCreatedBy(executive.getExecutiveId());
				packingGroupType.setModifiedBy(executive.getExecutiveId());
				packingGroupType.setAccountGroupId(executive.getAccountGroupId());
				packingGroupType.setStatus(JSPUtility.GetShort(request, "status"));
				final long newPackingGroupTypeId = PackingGroupTypeMasterDao.getInstance().insert(packingGroupType);
				if(newPackingGroupTypeId > 0)
					strResponse  = CargoErrorList.MASTER_DATA_INSERT_SUCCESS_DESCRIPTION;
				else
					strResponse = "PackingGroupTypeMaster Insert "+CargoErrorList.MASTER_DATA_OPERATION_FAILURE_DESCRIPTION;

				break;
			case 2:	//Update Packing Group Type
				packingGroupType.setPackingGroupTypeName(JSPUtility.GetString(request, "name"));
				packingGroupType.setPackingGroupTypeId(JSPUtility.GetLong(request, "packingGroupTypeId"));
				packingGroupType.setMFD(false);
				packingGroupType.setModifiedBy(executive.getExecutiveId());
				packingGroupType.setStatus(JSPUtility.GetShort(request, "status"));
				strResponse = PackingGroupTypeMasterDao.getInstance().update(packingGroupType);
				break;
			case 3:	//Delete Packing Type
				packingGroupType.setPackingGroupTypeId(JSPUtility.GetInt(request, "packingGroupTypeId"));
				packingGroupType.setMFD(true);
				packingGroupType.setModifiedBy(executive.getExecutiveId());

				// Remove the following code for delete if PackingTypeMasterForGroup is ready
				strResponse = PackingGroupTypeMasterDao.getInstance().delete(packingGroupType);
				break;
			default:
				break;
			}
			request.setAttribute("nextPageToken", "success");
			if(filter != 0) {
				response.sendRedirect("PackingGroupTypeMaster.do?pageId=308&eventId=1&message="+strResponse);
				request.setAttribute("message",strResponse);
			}
		} catch (final Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		}

	}
}