package com.ivcargo.reports;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.HashMap;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.ObjectUtils;
import org.apache.commons.lang3.StringUtils;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.utils.constant.Constant;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.reports.VehicleNumberWiseDispatchDAO;
import com.platform.dto.Branch;
import com.platform.dto.SubRegion;
import com.platform.dto.model.ReportViewModel;
import com.platform.dto.model.ViewWayBillsForVehicleNumberModel;
import com.platform.resource.CargoErrorList;

public class ViewWayBillsAction implements Action {

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	 error 		= null;
		String 		vehicleNoIdsStr 	= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	cache			= new CacheManip(request);
			final var 	wayBillTypeId 	= JSPUtility.GetLong(request, "wayBillTypeId", 0);
			final var 	srcBranchId		= JSPUtility.GetLong(request, "srcBranchId", 0);
			final var 	destBranchId	= JSPUtility.GetLong(request, "destBranchId", 0);
			final var 	filter 			= JSPUtility.GetShort(request, "filter", (short) 0);
			final var 	vehicleNumberId	= JSPUtility.GetLong(request, "vehicleNumberId", 0);
			final var	routeType		= JSPUtility.GetInt(request, "routeType");
			final var	sdf				= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			final var	executive		= cache.getExecutive(request);
			final var 	subRegions		= cache.getAllSubRegions(request);
			final var 	branches 		= cache.getGenericBranchesDetail(request);
			final var	fromDate		= new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00").getTime());
			final var	toDate			= new Timestamp(sdf.parse(JSPUtility.GetString(request, "toDate") + " 23:59:59").getTime());
			final var	objectIn		= new ValueObject();

			objectIn.put("filter", filter);
			objectIn.put("accountGroupId", executive.getAccountGroupId());
			objectIn.put("wayBillTypeId", wayBillTypeId);
			objectIn.put("srcBranchId", srcBranchId);
			objectIn.put("destBranchId", destBranchId);
			objectIn.put("fromDate", fromDate);
			objectIn.put("toDate", toDate);
			objectIn.put("vehicleNumberId", vehicleNumberId);

			final var	groupVehicleNos = cache.getAllVehicleNumberList(request, executive.getAccountGroupId());

			if(routeType <= 0) {
				error.put("errorCode", CargoErrorList.ELEMENT_NOT_FOUND);
				error.put("errorDescription", CargoErrorList.ELEMENT_NOT_FOUND_DESCRIPTION+" : Route Type");
				request.setAttribute("cargoError", error);
				request.setAttribute("nextPageToken", "failure");
				return;
			}
			switch (routeType) {
			case 1 -> {
				if(groupVehicleNos != null)
					vehicleNoIdsStr	= groupVehicleNos.stream().map(e -> Long.toString(e.getVehicleNumberMasterId())).collect(Collectors.joining(Constant.COMMA));
			}
			case 2 -> vehicleNoIdsStr = Long.toString(vehicleNumberId);
			case 3 -> {
				if(groupVehicleNos != null)
					vehicleNoIdsStr	= groupVehicleNos.stream().filter(element -> StringUtils.endsWith(element.getVehicleNumber(), "D") || StringUtils.endsWith(element.getVehicleNumber(), "d")).map(e -> Long.toString(e.getVehicleNumberMasterId())).collect(Collectors.joining(Constant.COMMA));
			}
			case 4 -> {
				if(groupVehicleNos != null)
					vehicleNoIdsStr	= groupVehicleNos.stream().filter(element -> StringUtils.endsWith(element.getVehicleNumber(), "U") || StringUtils.endsWith(element.getVehicleNumber(), "u")).map(e -> Long.toString(e.getVehicleNumberMasterId())).collect(Collectors.joining(Constant.COMMA));
			}
			default -> {
				break;
			}
			}

			objectIn.put("vehicleNoIds", vehicleNoIdsStr);
			final var	reportModel = VehicleNumberWiseDispatchDAO.getInstance().getWayBillsForView(objectIn);

			if(ObjectUtils.isNotEmpty(reportModel)) {
				var				reportViewModel = new ReportViewModel();
				reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);
				request.setAttribute("ReportViewModel",reportViewModel);

				for (final ViewWayBillsForVehicleNumberModel element : reportModel) {
					final var	srcBranch 		= (Branch) branches.get(Long.toString(element.getSourceBranchId()));
					final var	srcSubRegion	= (SubRegion) subRegions.get(srcBranch.getSubRegionId());
					final var	destBranch 		= (Branch) branches.get(Long.toString(element.getDestinationBranchId()));
					final var	destSubRegion	= (SubRegion) subRegions.get(destBranch.getSubRegionId());

					element.setSourceSubRegionId(srcBranch.getSubRegionId());
					element.setDestinationSubRegionId(destBranch.getSubRegionId());

					element.setSourceSubRegion(srcSubRegion.getName());
					element.setSourceBranch(srcBranch.getName());
					element.setDestinationSubRegion(destSubRegion.getName());
					element.setDestinationBranch(destBranch.getName());
				}

				request.setAttribute("reportModel", reportModel);
			} else {
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}

			request.setAttribute("nextPageToken", "success");
		} catch (final Exception _e) {
			ActionStaticUtil.catchActionException(request, _e, error);
		}
	}
}
