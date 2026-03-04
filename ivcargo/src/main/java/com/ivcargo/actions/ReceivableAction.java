package com.ivcargo.actions;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.framework.JSPUtility;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.DispatchLedgerDao;
import com.platform.dao.SubRegionDao;
import com.platform.dao.reports.ReceivablesDAO;
import com.platform.dto.Branch;
import com.platform.dto.DispatchLedger;
import com.platform.dto.Executive;
import com.platform.dto.SubRegion;
import com.platform.dto.TransportCommonMaster;
import com.platform.resource.CargoErrorList;

public class ReceivableAction implements Action{
	public void execute(HttpServletRequest request, HttpServletResponse response) {

		HashMap<String,Object>	error 	= null;
		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error)){
				return;
			}
			Executive   executive = (Executive) request.getSession().getAttribute("executive");

			CacheManip cacheManip = new CacheManip(request);
			HashMap<Long, String> cityList = cacheManip.getAllGroupActiveBranchCityIdList(request, executive);
			request.setAttribute("cityList", cityList);

			Branch destBranches [] = cacheManip.getBothTypeOfBranchesDetails(request, ""+executive.getAccountGroupId(), ""+executive.getCityId());
			request.setAttribute("destBranches", destBranches);

			long sourceCityId = Long.parseLong(request.getParameter("selectSourceCity"));
			String sourceBranchStr = cacheManip.getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_CITY, sourceCityId);
			long destBranchId = Long.parseLong(request.getParameter("selectBranch"));
			String fromDate = JSPUtility.GetString(request, "fromDate") + " 00:00:00";
			String toDate = JSPUtility.GetString(request, "toDate") + " 23:59:59";

			SimpleDateFormat sdf               = new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			java.util.Date   fDate             = sdf.parse(fromDate);
			java.util.Date   tDate             = sdf.parse(toDate);
			Timestamp        fromDateT          = new Timestamp(fDate.getTime());
			Timestamp        toDateT            = new Timestamp(tDate.getTime());

			ArrayList<Long> dispatchsummary = new ArrayList<Long>();
			dispatchsummary= ReceivablesDAO.getInstance().getdispatchLedgerByBranchId(destBranchId, fromDateT, toDateT, sourceBranchStr);

			if(dispatchsummary != null) {
				request.setAttribute("dispatchsummaryIdList", dispatchsummary);
				DispatchLedger[] dispatchLedgerarr = new DispatchLedger[dispatchsummary.size()];
				SubRegion[] srcSubRegion = new SubRegion[dispatchsummary.size()];
				SubRegion[] destSubRegion = new SubRegion[dispatchsummary.size()];
				for(int i = 0 ; i < dispatchsummary.size() ; i++ ) {
					dispatchLedgerarr[i] = DispatchLedgerDao.getInstance().retriveValueForReceivedLedger(dispatchsummary.get(i));
					srcSubRegion[i] = SubRegionDao.getInstance().getSubRegionById(dispatchLedgerarr[i].getSourceSubRegionId());
					destSubRegion[i] = SubRegionDao.getInstance().getSubRegionById(dispatchLedgerarr[i].getDestinationSubRegionId());
				}
				request.setAttribute("srcSubRegion", srcSubRegion);
				request.setAttribute("destSubRegion",destSubRegion);
				request.setAttribute("DispatchLedgerobj", dispatchLedgerarr);
				request.setAttribute("nextPageToken", "success");
			}else{
				error.put("errorCode", CargoErrorList.DISPATCH_ERROR);
				error.put("errorDescription", CargoErrorList.DISPATCH_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
				request.setAttribute("nextPageToken", "failure");
			}
		} catch (Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		}
	}
}
