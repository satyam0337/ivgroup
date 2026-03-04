package com.ivcargo.reports;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.dto.constant.ExecutiveTypeConstant;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.reports.BranchWiseToPayeeDispatchDAO;
import com.platform.dto.Branch;
import com.platform.dto.Executive;
import com.platform.dto.model.BranchWiseToPayeeDispatchReportModel;
import com.platform.dto.model.CityWiseCollectionModel;
import com.platform.resource.CargoErrorList;

public class BranchWiseToPayeeDispatchReportAction implements Action {

	@Override
	@SuppressWarnings("unchecked")
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>					error 					= null;
		Executive								executive				= null;
		Branch[]								branches				= null;
		ValueObject								valueInObject			= null;
		ValueObject								valueOutObject			= null;
		SimpleDateFormat						sdf						= null;
		Timestamp								fromDateT				= null;
		Timestamp								toDateT					= null;
		CacheManip								cacheManip				= null;
		BranchWiseToPayeeDispatchReportModel[]	reportModel 			= null;
		HashMap<Long,Object>					collMap					= null;
		CityWiseCollectionModel					model					= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeBranchWiseToPayeeDispatchReportAction().execute(request, response);

			cacheManip = new CacheManip(request);

			executive = cacheManip.getExecutive(request);
			long selectedDestSubRegion = 0;

			// Get the Selected  Combo values
			if (request.getParameter("TosubRegion") != null)
				selectedDestSubRegion  = Long.parseLong(JSPUtility.GetString(request, "TosubRegion","-1"));

			if(selectedDestSubRegion > 0) {
				//Get all selected source Branches
				branches = cacheManip.getBothTypeOfBranchesDetails(request, "" + executive.getAccountGroupId(), "" + selectedDestSubRegion);
				request.setAttribute("destBranches", branches);
			}

			valueInObject = new ValueObject();

			long destSubRegionId 	= 0;
			long destBranchId 	= 0;

			sdf			= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			fromDateT	= new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00").getTime());
			toDateT		= new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate") + " 23:59:59").getTime());

			if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN) {
				destSubRegionId 	= Long.parseLong(request.getParameter("TosubRegion"));
				destBranchId 		= Long.parseLong(request.getParameter("SelectDestBranch"));
			} else
				destBranchId = executive.getBranchId();

			valueInObject.put("destSubRegionId", destSubRegionId);
			valueInObject.put("destBranchId", destBranchId);
			valueInObject.put("fromDate", fromDateT);
			valueInObject.put("toDate", toDateT);
			valueInObject.put("accountGroupId", executive.getAccountGroupId());

			valueOutObject	= BranchWiseToPayeeDispatchDAO.getInstance().getReportForBranch(valueInObject);
			reportModel		= (BranchWiseToPayeeDispatchReportModel[]) valueOutObject.get("BranchWiseToPayeeDispatchReportModel");
			collMap			= (HashMap<Long, Object>) valueOutObject.get("BranchWiseToPayeeCollection");

			if(reportModel != null) {
				for (final BranchWiseToPayeeDispatchReportModel element : reportModel) {
					element.setWayBillSourceBranch(cacheManip.getGenericBranchDetailCache(request, element.getWayBillSourceBranchId()).getName());
					element.setWayBillSourceSubRegion(cacheManip.getGenericSubRegionById(request, element.getWayBillSourceSubRegionId()).getName());

					if(collMap.get(element.getWayBillSourceBranchId()) != null) {
						model = (CityWiseCollectionModel) collMap.get(element.getWayBillSourceBranchId());

						if(model != null) {
							model.setBranchName(cacheManip.getGenericBranchDetailCache(request, model.getBranchId()).getName());
							model.setSubRegionName(cacheManip.getGenericSubRegionById(request, model.getSubRegionId()).getName());
						}
					}
				}

				request.setAttribute("BranchWiseToPayeeDispatchReportModel", reportModel);
				request.setAttribute("BranchWiseToPayeeCollection", collMap);
			} else {
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}

			ActionStaticUtil.setReportViewModel(request);
			request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		} finally {
			error 					= null;
			executive				= null;
			branches				= null;
			valueInObject			= null;
			valueOutObject			= null;
			sdf						= null;
			fromDateT				= null;
			toDateT					= null;
			cacheManip				= null;
			reportModel 			= null;
			collMap					= null;
			model					= null;
		}
	}
}
