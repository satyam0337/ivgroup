package com.ivcargo.actions;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.BranchTransferBLL;
import com.framework.Action;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.GodownDao;
import com.platform.dto.Branch;
import com.platform.dto.Executive;
import com.platform.dto.Godown;
import com.platform.dto.VehicleNumberMaster;

public class InitializeBranchTransferAction implements Action{

	@Override
	@SuppressWarnings("unchecked")
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	error 	= null;
		try {

			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final CacheManip cacheManip = new CacheManip(request);
			final Executive executive = cacheManip.getExecutive(request);
			final String branchString = cacheManip.getBranchesWithGroupingBranches(request, ""+executive.getAccountGroupId(), ""+executive.getCityId(), executive.getBranchId(), Branch.BRANCH_TYPE_DELIVERY);

			final String[] commaSepratedBranch = branchString.split(",");
			String[] equalSepratedBranch = null;
			final HashMap<Long,String> branchDetails = new HashMap<Long,String>();

			for (int i = 1; i < commaSepratedBranch.length; i++) {
				equalSepratedBranch = commaSepratedBranch[i].split("=");

				if(i == commaSepratedBranch.length - 1)
					equalSepratedBranch[1] = equalSepratedBranch[1].substring(0, equalSepratedBranch[1].lastIndexOf(":"));

				branchDetails.put(Long.parseLong(equalSepratedBranch[1]), equalSepratedBranch[0]);
			}

			final BranchTransferBLL btBll = new  BranchTransferBLL();
			ValueObject outValObj;
			final ValueObject inValObj = new ValueObject();
			HashMap<Long, String> subRegionList = null;
			final ValueObject allSubRegion = cacheManip.getAllSubRegions(request);

			inValObj.put("allSubRegion", allSubRegion);
			inValObj.put(Executive.EXECUTIVE, executive);

			outValObj = btBll.getDestCityListForBranchTransfer(inValObj);

			if(outValObj.get("subRegionList") != null )
				subRegionList = (HashMap<Long, String>) outValObj.get("subRegionList");

			request.setAttribute("subRegionList", subRegionList);
			request.setAttribute("branchDetails", branchDetails);
			request.setAttribute("godownDetails", GodownDao.getInstance().getGroupGodownList(executive.getAccountGroupId(), Godown.GODOWN_TYPE_SCRAP_ID, false));

			final VehicleNumberMaster[] vehicleNumberMaster = cacheManip.getVehicleNumber(request, executive.getAccountGroupId());

			if (vehicleNumberMaster != null)
				request.setAttribute("vehicleNumberMaster", vehicleNumberMaster);

			request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}
	}

}