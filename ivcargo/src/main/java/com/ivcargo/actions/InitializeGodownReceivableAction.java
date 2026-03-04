package com.ivcargo.actions;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.GodownDao;
import com.platform.dto.Executive;
import com.platform.dto.Godown;

public class InitializeGodownReceivableAction implements Action {

	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	error 	= null;
		
		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			
			if(ActionStaticUtil.isSystemError(request, error))
				return;

			CacheManip 	cacheManip = new CacheManip(request);
			Executive   executive = cacheManip.getExecutive(request);
			
			HashMap<Long, String> cityList = cacheManip.getAllGroupActiveBranchCityIdList(request, executive);

			HashMap<Long, String> godownCityList = new LinkedHashMap<Long, String>();

			Godown[] godownArr = GodownDao.getInstance().getGroupGodownList(executive.getAccountGroupId(), Godown.GODOWN_TYPE_SCRAP_ID, false);
			
			if(godownArr!= null){
				for (Map.Entry<Long, String> entry : cityList.entrySet()) {
					for (int j = 0; j < godownArr.length; j++) {
						long cityId1 = cacheManip.getGenericBranchDetailCache(request, godownArr[j].getBranchId()).getCityId();
						
						if(cityId1 == entry.getKey())
							godownCityList.put(entry.getKey(), entry.getValue());
					}
				}
			}

			request.setAttribute("godownCityList", godownCityList);
			request.setAttribute("nextPageToken", "success");
		} catch (Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}
	}
}
