package com.ivcargo.reports;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.HashMap;
import java.util.LinkedHashMap;
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
import com.platform.dto.Executive;
import com.platform.dto.SubRegion;
import com.platform.dto.constant.WayBillTypeConstant;
import com.platform.dto.model.ReportViewModel;
import com.platform.dto.model.VehicleNumberWiseDispatchModel;
import com.platform.dto.model.VehicleNumberWiseDispatchReportModel;
import com.platform.resource.CargoErrorList;

public class RouteWiseDispatchReportAction implements Action {

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	error 			= null;
		String					vehicleNoIdsStr = null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeRouteWiseDispatchReportAction().execute(request, response);

			final var 	cache			= new CacheManip(request);
			final var	executive 		= cache.getExecutive(request);
			final var 	subRegions		= cache.getAllSubRegions(request);
			final var 	branches 		= cache.getGenericBranchesDetail(request);
			final var	objectIn 		= new ValueObject();
			final var	sdf         	= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			final var	fromDate    	= new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00").getTime());
			final var	toDate      	= new Timestamp(sdf.parse(JSPUtility.GetString(request, "toDate") + " 23:59:59").getTime());
			final var	vehicleNoId		= JSPUtility.GetLong(request, "vehicleNumber",0);
			final var	routeType 		= JSPUtility.GetInt(request, "routeType");

			//Determine Route type
			/*Route Type value map
			 * 0 --> Select
			 * 1 --> ALL Route
			 * 2 --> Single Route
			 * 3 --> ALL Downward Route
			 * 4 --> ALL Upward Route
			 */

			if(routeType <= 0) {
				error.put("errorCode", CargoErrorList.ELEMENT_NOT_FOUND);
				error.put("errorDescription", CargoErrorList.ELEMENT_NOT_FOUND_DESCRIPTION+" : Route Type");
				request.setAttribute("cargoError", error);
				request.setAttribute("nextPageToken", "failure");
				return;
			}

			final var	groupVehicleNos = cache.getAllVehicleNumberList(request, executive.getAccountGroupId());

			switch (routeType) {
			case 1 -> {
				if(groupVehicleNos != null)
					vehicleNoIdsStr	= groupVehicleNos.stream().map(e -> Long.toString(e.getVehicleNumberMasterId())).collect(Collectors.joining(Constant.COMMA));
			}
			case 2 -> vehicleNoIdsStr = Long.toString(vehicleNoId);
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

			objectIn.put("fromDate", fromDate);
			objectIn.put("toDate", toDate);
			objectIn.put("accountGroupId", executive.getAccountGroupId());
			objectIn.put("vehicleNoIds", vehicleNoIdsStr);

			//get report Data
			final var	reportModel = VehicleNumberWiseDispatchDAO.getInstance().getRouteWiseDispatchReport(objectIn);

			if(ObjectUtils.isNotEmpty(reportModel)) {
				final var	srcWiseCollection	= new LinkedHashMap<String,LinkedHashMap<String,VehicleNumberWiseDispatchReportModel>>();

				for (final VehicleNumberWiseDispatchModel element : reportModel) {
					final var	key = element.getVehicleNumberMasterId() + "_" + element.getSourceBranchId() + "_" + element.getDestinationBranchId();
					var	destWiseCollection = srcWiseCollection.get(key);

					if(destWiseCollection == null) {
						destWiseCollection = new LinkedHashMap<>();
						getReportData(request, element, destWiseCollection, subRegions, branches, executive);
						srcWiseCollection.put(key, destWiseCollection);
					} else
						getReportData(request, element, destWiseCollection, subRegions, branches, executive);
				}

				request.setAttribute("reportModel", srcWiseCollection);

				var	reportViewModel = new ReportViewModel();
				reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);
				request.setAttribute("ReportViewModel",reportViewModel);
				request.setAttribute("nextPageToken", "success");
			} else {
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}

		} catch (final Exception _e) {
			ActionStaticUtil.catchActionException(request, _e, error);
		}
	}

	public void getReportData(final HttpServletRequest request, final VehicleNumberWiseDispatchModel reportModel
			, final LinkedHashMap <String, VehicleNumberWiseDispatchReportModel> destWiseCollection
			, final ValueObject subRegions, final ValueObject branches, final Executive executive) throws Exception {
		var	vehicleCollection = destWiseCollection.get(Long.toString(reportModel.getDestinationSubRegionId()));

		if(vehicleCollection == null) {
			vehicleCollection = new VehicleNumberWiseDispatchReportModel();

			final var	branch			= (Branch) branches.get(Long.toString(reportModel.getSourceBranchId()));
			final var	subRegion		= (SubRegion) subRegions.get(branch.getSubRegionId());

			final var	destBranch		= (Branch) branches.get(Long.toString(reportModel.getDestinationBranchId()));
			final var	destSubRegion	= (SubRegion) subRegions.get(destBranch.getSubRegionId());

			vehicleCollection.setSourceSubRegion(subRegion.getName());
			vehicleCollection.setSourceBranch(branch.getName());
			vehicleCollection.setDestinationSubRegion(destSubRegion.getName());
			vehicleCollection.setDestinationBranch(destBranch.getName());
			vehicleCollection.setSourceBranchId(reportModel.getSourceBranchId());
			vehicleCollection.setDestinationBranchId(reportModel.getDestinationBranchId());
			vehicleCollection.setVehicleNumber(reportModel.getVehicleNumber());
			vehicleCollection.setVehicleNumberMasterId(reportModel.getVehicleNumberMasterId());
			vehicleCollection.setSupervisor(reportModel.getSupervisor());

			if(reportModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID) {
				vehicleCollection.setTotalPaidAmount(reportModel.getGrandTotal());
				vehicleCollection.setTotalPaidPkgQuantity(reportModel.getTotalPkgQuantity());
			} else if(reportModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY) {
				vehicleCollection.setTotalToPayAmount(reportModel.getGrandTotal());
				vehicleCollection.setTotalToPayPkgQuantity(reportModel.getTotalPkgQuantity());
			} else if(reportModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT) {
				vehicleCollection.setTotalCreditAmount(reportModel.getGrandTotal());
				vehicleCollection.setTotalCreditPkgQuantity(reportModel.getTotalPkgQuantity());
			} else if(reportModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_FOC)
				vehicleCollection.setTotalFOCPkgQuantity(reportModel.getTotalPkgQuantity());

			destWiseCollection.put(Long.toString(destBranch.getSubRegionId()), vehicleCollection);
		} else if(reportModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID) {
			vehicleCollection.setTotalPaidAmount(vehicleCollection.getTotalPaidAmount() + reportModel.getGrandTotal());
			vehicleCollection.setTotalPaidPkgQuantity(vehicleCollection.getTotalPaidPkgQuantity() + reportModel.getTotalPkgQuantity());
		} else if(reportModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY) {
			vehicleCollection.setTotalToPayAmount(vehicleCollection.getTotalToPayAmount() + reportModel.getGrandTotal());
			vehicleCollection.setTotalToPayPkgQuantity(vehicleCollection.getTotalToPayPkgQuantity() + reportModel.getTotalPkgQuantity());
		} else if(reportModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT) {
			vehicleCollection.setTotalCreditAmount(vehicleCollection.getTotalCreditAmount() + reportModel.getGrandTotal());
			vehicleCollection.setTotalCreditPkgQuantity(vehicleCollection.getTotalCreditPkgQuantity() + reportModel.getTotalPkgQuantity());
		} else if(reportModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_FOC)
			vehicleCollection.setTotalFOCPkgQuantity(vehicleCollection.getTotalFOCPkgQuantity() + reportModel.getTotalPkgQuantity());
	}
}