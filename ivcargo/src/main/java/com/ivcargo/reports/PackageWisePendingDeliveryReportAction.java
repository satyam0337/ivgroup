package com.ivcargo.reports;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.PackageWisePendingDeliveryBLL;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.dto.constant.ExecutiveTypeConstant;
import com.iv.dto.constant.WayBillTypeConstant;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.PackingTypeMaster;
import com.platform.dto.WayBill;
import com.platform.dto.WayBillType;
import com.platform.dto.model.PackageWisePendingDeliveryReportModel;
import com.platform.dto.model.PackagesCollectionDetails;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

public class PackageWisePendingDeliveryReportAction  implements Action{

	public static final String TRACE_ID = " PackageWisePendingDeliveryReportAction ";
	@Override
	@SuppressWarnings("unchecked")
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	error 		= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializePackageWisePendingDeliveryReportAction().execute(request, response);

			final var	cacheManip 	= new CacheManip(request);
			final var	executive 	= cacheManip.getExecutive(request);


			// Get the Selected  Combo values
			final var selectedSourceCity		= JSPUtility.GetLong(request, "subRegion", 0);
			final var selectedDestCity			= JSPUtility.GetLong(request, "TosubRegion", -1);

			//Get all selected source Branches
			request.setAttribute("destBranches", cacheManip.getBranchesArrayBySubRegionId(request, executive.getAccountGroupId(), selectedDestCity));
			request.setAttribute("srcBranches", cacheManip.getBranchesArrayBySubRegionId(request, executive.getAccountGroupId(), selectedSourceCity));

			String packingTypeIds = null;
			var destBranchId 	= 0L;
			var packingTypeFilter = 0L;
			final var sourceCityId 	= Long.parseLong(request.getParameter("subRegion"));
			final var sourceBranchId = Long.parseLong(request.getParameter("branch"));

			if(request.getParameter("radioCheck")!=null){
				packingTypeFilter = "letterButton".equals(request.getParameter("radioCheck")) ? 1 : 0;
				packingTypeIds = PackingTypeMaster.PACKING_TYPE_LETTER+","+PackingTypeMaster.PACKING_TYPE_LIFFAFA+","+PackingTypeMaster.PACKING_TYPE_PACKET;
			}

			final var	sdf        	= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			final var	fromDate  	= new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00").getTime());
			final var	toDate		= new Timestamp(sdf.parse(JSPUtility.GetString(request, "toDate") + " 23:59:59").getTime());

			final var	valueInObject	= new ValueObject();
			valueInObject.put("sourceCityId", sourceCityId);
			valueInObject.put("sourceBranchId", sourceBranchId);
			valueInObject.put("fromDate", fromDate);
			valueInObject.put("toDate", toDate);
			valueInObject.put("executive", executive);
			valueInObject.put("packingTypeIds",packingTypeIds);
			valueInObject.put("packingTypeFilter",packingTypeFilter);

			if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN) {
				final var destCityId		= JSPUtility.GetLong(request, "TosubRegion", 0);
				destBranchId 	= JSPUtility.GetLong(request, "SelectDestBranch", 0);
				valueInObject.put("destCityId", destCityId);
			} else if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_BRANCHADMIN
					|| executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_EXECUTIVE
					|| executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_LIMITED)
				destBranchId 	= executive.getBranchId();

			valueInObject.put("destBranchId", destBranchId);

			final var	valueOutObject	= PackageWisePendingDeliveryBLL.getInstance().getPackageWisePendingDeliveryData(valueInObject);

			if(valueOutObject != null) {
				final var	reportModels    = (List<PackageWisePendingDeliveryReportModel>) valueOutObject.get("resultList");
				final var	dlvryCancelledWbs= (HashMap<Long, WayBill>) valueOutObject.get("dlvryCancelledWbs");

				final var	packageWiseCollection  = new HashMap<Long, PackagesCollectionDetails>();

				for (final PackageWisePendingDeliveryReportModel reportModel : reportModels)
					if(reportModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY) {
						var	packageModel = packageWiseCollection.get(reportModel.getPackingTypeId());

						if(packageModel == null) {
							packageModel = new PackagesCollectionDetails();
							packageModel.setPackagesTypeName(cacheManip.getPackingTypeMasterById(request, reportModel.getPackingTypeId()).getName());
							packageModel.setTotalQuantity(packageModel.getTotalQuantity() + reportModel.getNoOfPackages());
							packageModel.setTotalAmount(reportModel.getGrandTotal());

							packageWiseCollection.put(reportModel.getPackingTypeId(), packageModel);
						} else {
							packageModel.setTotalQuantity(packageModel.getTotalQuantity() + reportModel.getNoOfPackages());
							packageModel.setTotalAmount(reportModel.getGrandTotal());
						}
					}

				final HashMap<Long,PackageWisePendingDeliveryReportModel>	reportModelHM = new LinkedHashMap<>();

				for (final PackageWisePendingDeliveryReportModel reportModel : reportModels) {
					var	models = reportModelHM.get(reportModel.getWayBillId());

					if(models == null) {
						models = new PackageWisePendingDeliveryReportModel();
						models.setWayBillId(reportModel.getWayBillId());
						models.setWayBillSourceSubRegion(cacheManip.getGenericSubRegionById(request, reportModel.getWayBillSourceSubRegionId()).getName());
						models.setWayBillSourceBranch(cacheManip.getGenericBranchDetailCache(request, reportModel.getWayBillSourceBranchId()).getName());
						models.setWayBillDestinationSubRegion(cacheManip.getGenericSubRegionById(request, reportModel.getWayBillDestinationSubRegionId()).getName());
						models.setWayBillDestinationBranch(cacheManip.getGenericBranchDetailCache(request, reportModel.getWayBillDestinationBranchId()).getName());

						if(reportModel.isManual())
							models.setWayBillType(WayBillTypeConstant.getWayBillTypeNameByWayBilTypeId(reportModel.getWayBillTypeId()) + WayBillType.WAYBILL_TYPE_MANUAL);
						else
							models.setWayBillType(WayBillTypeConstant.getWayBillTypeNameByWayBilTypeId(reportModel.getWayBillTypeId()));

						models.setWayBillNumber(reportModel.getWayBillNumber());
						models.setReceivedTime(reportModel.getReceivedTime());
						models.setConsignorName(reportModel.getConsignorName());
						models.setConsigneeName(reportModel.getConsigneeName());
						models.setConsigneeNo(reportModel.getConsigneeNo());

						if(reportModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY)
							models.setGrandTotal(reportModel.getGrandTotal());
						else
							models.setGrandTotal(0.00);

						models.setNoOfDays(reportModel.getNoOfDays());
						models.setPackingType(reportModel.getNoOfPackages() + " " + cacheManip.getPackingTypeMasterById(request, reportModel.getPackingTypeId()).getName());
						models.setNoOfPackages(reportModel.getNoOfPackages());

						reportModelHM.put(reportModel.getWayBillId(), models);
					} else {
						models.setPackingType(models.getPackingType() + " /\n" + reportModel.getNoOfPackages() + "-" + cacheManip.getPackingTypeMasterById(request, reportModel.getPackingTypeId()).getName());
						models.setNoOfPackages(models.getNoOfPackages() + reportModel.getNoOfPackages());
					}

					//Delivery Cancelled LRs
					if(dlvryCancelledWbs != null) {
						final var	wayBill = dlvryCancelledWbs.get(models.getWayBillId());

						if(wayBill != null) {
							models.setNoOfDays(Utility.getDayDiffBetweenTwoDates(wayBill.getCreationDateTimeStamp(), DateTimeUtility.getCurrentTimeStamp()));
							models.setReceivedTime(wayBill.getCreationDateTimeStamp());
						}
					}
				}

				request.setAttribute("ReportData", reportModelHM);
				request.setAttribute("packageWiseCollection",packageWiseCollection );
				ActionStaticUtil.setReportViewModel(request);
				request.setAttribute("nextPageToken", "success");
			} else {
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}
}
