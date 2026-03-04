package com.ivcargo.reports;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.LHPVDao;
import com.platform.dao.LorryHireDao;
import com.platform.dto.Executive;
import com.platform.dto.LorryHire;
import com.platform.dto.TransportCommonMaster;
import com.platform.dto.VehicleNumberMaster;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

public class LorryHireReportAction implements Action {

	@Override
	@SuppressWarnings("unchecked")
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	 	error 				= null;
		Executive        			executive         	= null;
		SimpleDateFormat 			sdf               	= null;
		Timestamp        			fromDate          	= null;
		Timestamp        			toDate            	= null;
		CacheManip					cManip				= null;
		HashMap<Long, LorryHire> 	lhColl 				= null;
		ValueObject					valueOutObject		= null;
		LorryHire					lorryHire 			= null;
		VehicleNumberMaster			vehicle				= null;
		Long[]						lhpvIdArr			= null;
		HashMap<Long, Timestamp> 	lhpvColl  			= null;
		String						lhpvIds				= null;
		String						branchIds			= null;
		short		filter		= 0;
		long		vehicleNoId	= 0;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeLorryHireReportAction().execute(request, response);

			sdf			= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			fromDate	= new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00").getTime());
			toDate		= new Timestamp(sdf.parse(JSPUtility.GetString(request, "toDate") + " 23:59:59").getTime());
			cManip 		= new CacheManip(request);
			executive	= cManip.getExecutive(request);

			ActionStaticUtil.executiveTypeWiseBranches(request, cManip, executive);

			if(request.getParameter("selectedVehicleNoId") != null
					&& JSPUtility.GetLong(request, "selectedVehicleNoId", 0) > 0) {
				filter		= 1;
				vehicleNoId = JSPUtility.GetLong(request, "selectedVehicleNoId", 0);
			}

			if(filter != 1)
				branchIds		= ActionStaticUtil.getPhysicalBranchIds1(request, cManip, executive);

			valueOutObject = LorryHireDao.getInstance().getLorryHireReportData(filter, branchIds, executive.getAccountGroupId(), fromDate, toDate, vehicleNoId);

			if(valueOutObject != null) {

				lhColl    = (HashMap<Long, LorryHire>)valueOutObject.get("lhColl");
				lhpvIdArr = (Long[])valueOutObject.get("lhpvIdArr");

				if(lhColl != null && lhColl.size() > 0) {

					if(lhpvIdArr != null && lhpvIdArr.length > 0){
						lhpvIds	=	Utility.GetLongArrayToString(lhpvIdArr);
						lhpvColl = 	LHPVDao.getInstance().getLHPVCreateTimeByLHPVIds(lhpvIds);
					}

					for(final Long key : lhColl.keySet()) {
						lorryHire = lhColl.get(key);
						vehicle   = cManip.getVehicleNumber(request, executive.getAccountGroupId(), lorryHire.getVehicleNumberId());

						lorryHire.setSourceBranch(cManip.getGenericBranchDetailCache(request, lorryHire.getSourceBranchId()).getName());
						lorryHire.setDestinationBranch(cManip.getGenericBranchDetailCache(request, lorryHire.getDestinationBranchId()).getName());
						lorryHire.setVehicleOwner(TransportCommonMaster.getVehicleOwnerABBRName(vehicle.getVehicleOwner()));
						lorryHire.setVehicleOwnerId(vehicle.getVehicleOwner());

						if(lhpvColl != null && lhpvColl.size() > 0 && lhpvColl.get(lorryHire.getlHPVId()) != null)
							lorryHire.setLhpvDate(lhpvColl.get(lorryHire.getlHPVId()));
					}

					request.setAttribute("lhColl",lhColl);
				} else {
					error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
					error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
					request.setAttribute("cargoError", error);
				}
			} else {
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}
			ActionStaticUtil.setReportViewModel(request);
			request.setAttribute("nextPageToken", "success");
		} catch (final Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		} finally {
			error 				= null;
			executive         	= null;
			sdf               	= null;
			fromDate          	= null;
			toDate            	= null;
			cManip				= null;
			lhColl 				= null;
			valueOutObject		= null;
			lorryHire 			= null;
			vehicle				= null;
			lhpvIdArr			= null;
			lhpvColl  			= null;
			lhpvIds				= null;
			branchIds			= null;
		}
	}
}