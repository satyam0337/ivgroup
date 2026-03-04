package com.ivcargo.reports;

//~--- non-JDK imports --------------------------------------------------------

import java.util.ArrayList;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.logsapp.LogWriter;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.DispatchLedgerDao;
import com.platform.dto.DispatchLedgerModel;
import com.platform.dto.Executive;
import com.platform.dto.model.ReportViewModel;
import com.platform.resource.CargoErrorList;

public class VehicleConfigHamaliViewLHPVAction implements Action {
	private static final String TRACE_ID = "VehicleConfigHamaliViewLHPVAction";

	@Override
	@SuppressWarnings("unchecked")
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	 					error 					= null;
		Executive									executive      			= null;
		CacheManip									cManip 					= null;
		ReportViewModel								reportViewModel 		= null;
		ArrayList<DispatchLedgerModel>				dispatchList			= null;
		DispatchLedgerModel							dispatchLedger			= null;
		ValueObject									valObject				= null;
		HashMap<Long, ArrayList<DispatchLedgerModel>>	dispatchColl		= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error))
				return;
			final long   lhpvId	   		  = JSPUtility.GetLong(request, "lhpvId");
			final short  loadedById    	  = JSPUtility.GetShort(request, "loadedById");
			final short  vehicleTypeId 	  = JSPUtility.GetShort(request, "vehicleTypeId");
			final double totalLoadingTimeHamali = JSPUtility.GetDouble(request, "totalLoadingTimeHamali");

			request.setAttribute("totalLoadingTimeHamali", totalLoadingTimeHamali);
			executive	= (Executive) request.getSession().getAttribute("executive");
			cManip 		= new CacheManip(request);

			if(lhpvId > 0 && loadedById > 0 && vehicleTypeId > 0){

				valObject = DispatchLedgerDao.getInstance().getLimitedDispatchDataByLHPVIds(""+lhpvId, executive.getAccountGroupId());

				if(valObject != null) {
					dispatchColl  		  = (HashMap<Long, ArrayList<DispatchLedgerModel>>)valObject.get("dispatchColl");

					for(final long key : dispatchColl.keySet()){
						dispatchList = dispatchColl.get(key);
						for (final DispatchLedgerModel element : dispatchList) {
							dispatchLedger = element;

							if(dispatchLedger.getSourceBranchId() > 0)
								dispatchLedger.setSourceBranch(cManip.getBranchById(request, executive.getAccountGroupId(), dispatchLedger.getSourceBranchId()).getName());

							if(dispatchLedger.getDestinationBranchId() > 0)
								dispatchLedger.setDestinationBranch(cManip.getBranchById(request, executive.getAccountGroupId(), dispatchLedger.getDestinationBranchId()).getName());
							request.setAttribute("lhpvNumber", dispatchLedger.getlHPVNumber());
						}
					}
					request.setAttribute("dispatchColl", dispatchColl);
					reportViewModel = new ReportViewModel();
					reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);

				} else {
					LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO, (String) error.get("errorCode")+" "+(String) error.get("errorDescription"));
					error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
					error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
					request.setAttribute("cargoError", error);
				}	request.setAttribute("ReportViewModel",reportViewModel);

			} else {
				LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO, (String) error.get("errorCode")+" "+(String) error.get("errorDescription"));
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}
			request.setAttribute("nextPageToken", "success");

		} catch (final Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		} finally {
			executive      			= null;
			cManip 					= null;
			reportViewModel 		= null;
			dispatchList			= null;
			dispatchLedger			= null;
			valObject				= null;
			dispatchColl			= null;
		}
	}
}
