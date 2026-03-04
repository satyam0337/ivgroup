package com.ivcargo.actions.masters;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.framework.JSPUtility;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.CommodityDao;
import com.platform.dto.Commodity;
import com.platform.dto.Executive;
import com.platform.resource.CargoErrorList;

public class CommodityMasterAction implements Action {

	public static final String TRACE_ID = "CommodityMasterAction";

	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	 error 	= null;
		String		strResponse 	= null;
		Commodity	commodity		= null;
		Executive	executive		= null;
		CacheManip	cache			= null;
		int			filter			= 0;
		long		newCommodityId	= 0;

		try {

			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error)){
				return;
			}
			strResponse = null;
			commodity	= new Commodity();
			cache		= new CacheManip(request);
			executive	= (Executive) request.getSession().getAttribute("executive");
			filter		= JSPUtility.GetInt(request, "filter",0);

			switch (filter) {

			case 1:	//Add Commodity

				commodity.setName(JSPUtility.GetString(request, "name", "").toUpperCase());
				commodity.setDescription(JSPUtility.GetString(request, "description", "").toUpperCase());
				commodity.setMarkForDelete(false);
				commodity.setAccountGroupId(executive.getAccountGroupId());

				newCommodityId = CommodityDao.getInstance().insert(commodity);

				if(newCommodityId > 0) {
					// Add New Commodity to cache
					cache.refreshCacheForCommodity(request, executive.getAccountGroupId());
					strResponse = CargoErrorList.MASTER_DATA_INSERT_SUCCESS_DESCRIPTION;
				} else {
					strResponse = "Commodity Insert"+CargoErrorList.MASTER_DATA_OPERATION_FAILURE_DESCRIPTION;
				}

				break;

			case 2:	//Update Commodity

				commodity.setCommodityId(JSPUtility.GetInt(request, "selectedCommodityId"));
				commodity.setName(JSPUtility.GetString(request, "name", "").toUpperCase());
				commodity.setDescription(JSPUtility.GetString(request, "description", "").toUpperCase());

				strResponse = CommodityDao.getInstance().update(commodity);

				if(strResponse == CargoErrorList.MASTER_DATA_UPDATE_SUCCESS_DESCRIPTION){
					// Update Commodity to cache
					cache.refreshCacheForCommodity(request, executive.getAccountGroupId());
				}

				break;

			case 3:	//Delete Commodity

				commodity.setCommodityId(JSPUtility.GetInt(request, "selectedCommodityId"));
				commodity.setAccountGroupId(executive.getAccountGroupId());

				strResponse = CommodityDao.getInstance().delete(commodity);

				if(strResponse == CargoErrorList.MASTER_DATA_DELETE_SUCCESS_DESCRIPTION){
					// Update Commodity to cache
					cache.refreshCacheForCommodity(request, executive.getAccountGroupId());
				}

				break;

			default:
				break;
			}

			request.setAttribute("nextPageToken", "success");
			if(filter != 0) {
				response.sendRedirect("CommodityMaster.do?pageId=244&eventId=1&message="+strResponse);
				request.setAttribute("message",strResponse);
			}

		} catch (Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		} finally {
			strResponse = null;
			commodity	= null;
			executive	= null;
		}

	}
}