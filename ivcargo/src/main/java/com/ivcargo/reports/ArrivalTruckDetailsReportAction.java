package com.ivcargo.reports;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.SortedMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.ArrivalTruckDetailsDao;
import com.platform.dto.ArrivalTruckDetails;
import com.platform.dto.Executive;
import com.platform.dto.VehicleNumberMaster;
import com.platform.resource.CargoErrorList;

public class ArrivalTruckDetailsReportAction implements Action {
	@Override
	@SuppressWarnings("unchecked")
	public void execute(HttpServletRequest request, HttpServletResponse response) {

		HashMap<String,Object>	 		error 				= null;
		Executive        				executive      		= null;
		CacheManip 						cManip 				= null;
		String							branchIds			= null;
		ValueObject                     outValueObject      = null;
		ArrayList<ArrivalTruckDetails>	arrivalTruckDetailList	   = null;
		HashMap<Long,VehicleNumberMaster>	vehicleNumberHM		   = null;
		SortedMap<Short, SortedMap<String, ArrayList<ArrivalTruckDetails>>> ownerWiseColl	  		 = null;
		SortedMap<String, ArrayList<ArrivalTruckDetails>>  					arrivalTruckDetailColl	 = null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeArrivalTruckDetailsReportAction().execute(request, response);

			cManip 		= new CacheManip(request);
			executive	= cManip.getExecutive(request);

			ActionStaticUtil.executiveTypeWiseBranches(request, cManip, executive);

			branchIds	= ActionStaticUtil.getBranchIds(request, cManip, executive);

			vehicleNumberHM = cManip.getALLVehicleNumberOfGroup(request, executive.getAccountGroupId());
			outValueObject  = ArrivalTruckDetailsDao.getInstance().getArrivalVehicleData(branchIds, executive.getAccountGroupId(), vehicleNumberHM);

			if(outValueObject != null){

				ownerWiseColl 		 = (SortedMap<Short, SortedMap<String, ArrayList<ArrivalTruckDetails>>>)outValueObject.get("ownerWiseColl");
				if(ownerWiseColl != null && ownerWiseColl.size() > 0) {

					for(final Short key : ownerWiseColl.keySet()){
						arrivalTruckDetailColl = ownerWiseColl.get(key);

						for(final String key1 : arrivalTruckDetailColl.keySet()){
							arrivalTruckDetailList = arrivalTruckDetailColl.get(key1);

							for (final ArrivalTruckDetails model : arrivalTruckDetailList) {
								model.setLsSourceBranch(cManip.getGenericBranchDetailCache(request, model.getLsSourceBranchId()).getName());
								model.setLsDestinationBranch(cManip.getGenericBranchDetailCache(request, model.getLsDestinatinBranchId()).getName());
								model.setLhpvSourceBranch(cManip.getGenericBranchDetailCache(request, model.getLhpvSourceBranchId()).getName());

								if(model.getLhpvDestinatinBranchId() > 0)
									model.setLhpvDestinationBranch(cManip.getGenericBranchDetailCache(request, model.getLhpvDestinatinBranchId()).getName());
								else
									model.setLhpvDestinationBranch("");
							}
						}
					}
					request.setAttribute("ownerWiseColl", ownerWiseColl);
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
			executive      		= null;
			cManip 				= null;
			branchIds			= null;
			outValueObject      = null;
			arrivalTruckDetailList	   	= null;
			vehicleNumberHM		   		= null;
			ownerWiseColl	  		 	= null;
			arrivalTruckDetailColl	 	= null;
		}
	}
}
