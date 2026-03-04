package com.ivcargo.reports;

import java.util.ArrayList;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.ConsignmentSummaryDao;
import com.platform.dao.CustomerDetailsDao;
import com.platform.dao.ExecutiveDao;
import com.platform.dao.reports.DoorDeliverWayBillDAO;
import com.platform.dto.Branch;
import com.platform.dto.ConfigParam;
import com.platform.dto.ConsignmentSummary;
import com.platform.dto.CustomerDetails;
import com.platform.dto.Executive;
import com.platform.dto.WayBillType;
import com.platform.dto.model.DoorDeliverWayBillReportModel;
import com.platform.dto.model.ReportViewModel;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

public class DoorDeliverWayBillReportAction implements Action {

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {

		HashMap<String,Object>			error 					= null;
		Long[]							wayBillIdsArr			= null;
		Long[]							execIdsArr				= null;
		String							strWayBillIds			= null;
		String							strExecIds				= null;
		Executive						executive				= null;
		CacheManip						cManip					= null;
		ValueObject						valueInObject			= null;
		ValueObject						valueOutObject			= null;
		String							branchesIds				= null;
		ReportViewModel 				reportViewModel			= null;
		ArrayList<Long> 				wayBillAccessibility	= null;
		StringBuilder					wayBillForBT			= null;
		WayBillType						wayBillType				= null;
		HashMap<Long,CustomerDetails>	consignorHM				= null;
		HashMap<Long,CustomerDetails>	consigneeHM 			= null;
		HashMap<Long,Executive>			executiveHM 			= null;
		DoorDeliverWayBillReportModel[]	reportModel				= null;
		Branch							branch					= null;
		HashMap<Long, ConsignmentSummary>	consignmentSummaryHM	= null;
		short							configValue				= 0;
		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeDoorDeliverWayBillReportAction().execute(request, response);

			cManip 			= new CacheManip(request);
			executive 		= cManip.getExecutive(request);
			valueInObject   = new ValueObject();

			ActionStaticUtil.executiveTypeWiseBranches(request, cManip, executive);

			branchesIds		= ActionStaticUtil.getPhysicalBranchIds(request, cManip, executive);

			valueInObject.put("branchesIds", branchesIds);
			valueInObject.put("executive", executive);

			valueOutObject = DoorDeliverWayBillDAO.getInstance().getDoorDeliverWayBillData(valueInObject);

			if(valueOutObject != null) {

				reportModel		= (DoorDeliverWayBillReportModel[])valueOutObject.get("ReportModel");
				wayBillIdsArr	= (Long[])valueOutObject.get("wayBillIdsArr");
				execIdsArr		= (Long[])valueOutObject.get("execIdsArr");

				reportViewModel = new ReportViewModel();
				reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);
				request.setAttribute("ReportViewModel",reportViewModel);

				if(reportModel != null) {

					wayBillAccessibility	= new ArrayList<Long>();
					wayBillForBT 			= new StringBuilder();
					configValue 			= cManip.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_DELIVERY_ACCESSIBILITY);

					if(wayBillIdsArr.length > 0) {
						strWayBillIds 	= Utility.GetLongArrayToString(wayBillIdsArr);
						consignorHM		= CustomerDetailsDao.getInstance().getConsignorDetailsByWayBillId(strWayBillIds);
						consigneeHM		= CustomerDetailsDao.getInstance().getConsigneeDetailsByWayBillId(strWayBillIds);
						consignmentSummaryHM = ConsignmentSummaryDao.getInstance().getLimitedConsignmentDetails(strWayBillIds);
					}
					

					if(execIdsArr.length > 0) {
						strExecIds	= Utility.GetLongArrayToString(execIdsArr);
						executiveHM	= ExecutiveDao.getInstance().getExecutiveDetailsByExecutiveIds(strExecIds);
					}

					for (int i = 0; i < reportModel.length; i++) {

						reportModel[i].setConsignorName(consignorHM.get(reportModel[i].getWayBillId()).getName());
						reportModel[i].setConsigneeName(consigneeHM.get(reportModel[i].getWayBillId()).getName());
						reportModel[i].setExecutive(executiveHM.get(reportModel[i].getExecutiveId()).getName());
						reportModel[i].setActualWeight(consignmentSummaryHM.get(reportModel[i].getWayBillId()).getActualWeight());
						reportModel[i].setNoOfPackages(consignmentSummaryHM.get(reportModel[i].getWayBillId()).getQuantity());
						 

						wayBillAccessibility	= wayBillAccessibility(reportModel[i],configValue,wayBillAccessibility,executive);
						branch					= cManip.getBranchById(request, executive.getAccountGroupId(), reportModel[i].getWayBillSourceBranchId());
						if (branch != null)
							reportModel[i].setWayBillSourceBranch(branch.getName());
						else
							reportModel[i].setWayBillSourceBranch("--");

						if (branch.getSubRegionId() >= 0)
							reportModel[i].setWayBillSourceSubRegion(cManip.getGenericSubRegionById(request, branch.getSubRegionId()).getName());
						else
							reportModel[i].setWayBillSourceSubRegion("--");

						branch					= cManip.getBranchById(request, executive.getAccountGroupId(), reportModel[i].getWayBillDestinationBranchId());
						if (branch != null)
							reportModel[i].setWayBillDestinationBranch(branch.getName());

						if (branch != null && branch.getSubRegionId() >= 0)
							reportModel[i].setWayBillDestinationSubRegion(cManip.getSubRegionByIdAndGroupId(request, branch.getSubRegionId(), executive.getAccountGroupId()).getName());
						else
							reportModel[i].setWayBillDestinationSubRegion("--");

						wayBillType = cManip.getWayBillTypeById(request, reportModel[i].getWayBillTypeId());
						if(reportModel[i].isManual())
							reportModel[i].setWayBillType(wayBillType.getWayBillType()+WayBillType.WAYBILL_TYPE_MANUAL);
						else
							reportModel[i].setWayBillType(wayBillType.getWayBillType());

						wayBillForBT.append(""+reportModel[i].getWayBillId());
						if(i != reportModel.length-1)
							wayBillForBT.append(",");
					}

					request.setAttribute("WayBillAccessibility", wayBillAccessibility);
					request.setAttribute("ReportData", reportModel);
					request.setAttribute("nextPageToken", "success");
				}
			}else{
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
				request.setAttribute("nextPageToken", "success");
			}
		} catch (final Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
			request.setAttribute("cargoError", error);
			request.setAttribute("nextPageToken", "failure");
		} finally {
			error 					= null;
			wayBillIdsArr			= null;
			execIdsArr				= null;
			strWayBillIds			= null;
			strExecIds				= null;
			executive				= null;
			cManip					= null;
			valueInObject			= null;
			valueOutObject			= null;
			branchesIds				= null;
			reportViewModel			= null;
			wayBillAccessibility	= null;
			wayBillForBT			= null;
			wayBillType				= null;
			consignorHM				= null;
			consigneeHM 			= null;
			executiveHM 			= null;
			reportModel				= null;
		}
	}

	public ArrayList<Long> wayBillAccessibility(DoorDeliverWayBillReportModel reportModel ,short configValue ,ArrayList<Long> wayBillAccessibility ,Executive executive){

		if(configValue == ConfigParam.CONFIG_KEY_DELIVERED_ACCESSIBILITY_BRANCH
				&& reportModel.getWayBillDestinationBranchId() == executive.getBranchId()
				|| configValue == ConfigParam.CONFIG_KEY_DELIVERED_ACCESSIBILITY_AGENCY
				&& reportModel.getDestinationAgencyId() == executive.getAgencyId()
				|| configValue == ConfigParam.CONFIG_KEY_DELIVERED_ACCESSIBILITY_CITY
				&& reportModel.getWayBillDestinationSubRegionId() == executive.getSubRegionId())
			wayBillAccessibility.add(reportModel.getWayBillId());

		return wayBillAccessibility;
	}
}