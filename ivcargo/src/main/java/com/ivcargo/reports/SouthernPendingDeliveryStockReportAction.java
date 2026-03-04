package com.ivcargo.reports;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.dto.constant.WayBillTypeConstant;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.ChargeConfigDao;
import com.platform.dao.ConsignmentSummaryDao;
import com.platform.dao.CustomerDetailsDao;
import com.platform.dao.reports.WayBilllReportDao;
import com.platform.dto.ChargeTypeMaster;
import com.platform.dto.TransportCommonMaster;
import com.platform.dto.configuration.mindateselection.ReportWiseMinDateSelectionConfigurationDTO;
import com.platform.dto.constant.ExecutiveTypeConstant;
import com.platform.dto.model.PendingStockReportModel;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

public class SouthernPendingDeliveryStockReportAction implements Action {

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	 					error 					= null;
		String										srcBranchesStr			= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeSouthernPendingDeliveryStockReportAction().execute(request, response);

			final var	cacheManip 		= new CacheManip(request);
			final var	executive      	= cacheManip.getExecutive(request);

			final var	minDateTimeStamp	= cacheManip.getReportWiseMinDateToGetData(request, executive.getAccountGroupId(),
					ReportWiseMinDateSelectionConfigurationDTO.PENDING_DELIVERY_STOCK_REPORT_MIN_DATE_ALLOW,
					ReportWiseMinDateSelectionConfigurationDTO.PENDING_DELIVERY_STOCK_REPORT_MIN_DATE);

			final var sCity 		= JSPUtility.GetLong(request, "subRegion", 0);
			final var dCity 		= JSPUtility.GetLong(request, "TosubRegion", 0);
			final var sBranch 	= JSPUtility.GetLong(request, "branch", 0);
			short filter	= 0;

			var destBranch = JSPUtility.GetLong(request, "SelectDestBranch", 0);

			if(executive.getExecutiveType() != ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN)
				destBranch = executive.getBranchId();

			if(sCity > 0){
				if(sBranch == 0)
					srcBranchesStr = cacheManip.getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_SUBREGION, sCity);
				else
					srcBranchesStr = Long.toString(sBranch);

				filter	= 1;
			}

			final var	outValObj = WayBilllReportDao.getInstance().getPendingDeliveryStockDetailsForSouthern(executive.getAccountGroupId(),filter,srcBranchesStr,destBranch,minDateTimeStamp);
			//Get all Branches
			request.setAttribute("branches", cacheManip.getBranchesArrayBySubRegionId(request, executive.getAccountGroupId(), sCity));
			request.setAttribute("destBranches", cacheManip.getBranchesArrayBySubRegionId(request, executive.getAccountGroupId(), dCity));

			request.setAttribute("agentName", executive.getName());

			if (outValObj == null || outValObj.get("PendingStockReportModel") == null) {
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			} else {
				final var	reportModel 			= (PendingStockReportModel[])outValObj.get("PendingStockReportModel");
				final var	strForChargeConfig		= outValObj.get("strForChargeConfig").toString();
				final var	strForWayBillCharge		= outValObj.get("strForWayBillCharge").toString();
				final var	wayBillIdArray 	 		= (Long[]) outValObj.get("WayBillIdArray");

				final var	wayBillChargeCollection = ChargeConfigDao.getInstance().getWayBillChargeAmount(strForChargeConfig ,strForWayBillCharge ,ChargeTypeMaster.RECEIPT);
				final var	wayBillIds 	 = Utility.GetLongArrayToString(wayBillIdArray);

				final var	consignorHM = CustomerDetailsDao.getInstance().getConsignorDetailsByWayBillId(wayBillIds);
				final var	consigneeHM = CustomerDetailsDao.getInstance().getConsigneeDetailsByWayBillId(wayBillIds);
				final var	pkgsColl	= ConsignmentSummaryDao.getInstance().getNoOfPackages(wayBillIds);//Get Packages Data for both Summary & Details

				if(reportModel != null && reportModel.length > 0){
					for (final PendingStockReportModel element : reportModel) {
						element.setWayBillSourceSubRegion(cacheManip.getGenericSubRegionById(request, element.getWayBillSourceSubRegionId()).getName());
						element.setWayBillSourceBranch(cacheManip.getGenericBranchDetailCache(request, element.getWayBillSourceBranchId()).getName());
						element.setWayBillDestinationSubRegion(cacheManip.getGenericSubRegionById(request, element.getWayBillDestinationSubRegionId()).getName());
						element.setWayBillDestinationBranch(cacheManip.getGenericBranchDetailCache(request, element.getWayBillDestinationBranchId()).getName());

						if(element.isManual())
							element.setWayBillType(WayBillTypeConstant.getWayBillTypeNameByWayBilTypeId(element.getWayBillTypeId()) + WayBillTypeConstant.WAYBILL_TYPE_MANUAL);
						else
							element.setWayBillType(WayBillTypeConstant.getWayBillTypeNameByWayBilTypeId(element.getWayBillTypeId()));

						if(wayBillChargeCollection.get(element.getWayBillId()) == null)
							element.setReceiptAmount(0.0);
						else
							element.setReceiptAmount(wayBillChargeCollection.get(element.getWayBillId()));

						final var	consignor	= consignorHM.get(element.getWayBillId());
						final var	consignee	= consigneeHM.get(element.getWayBillId());

						element.setConsignorName(consignor.getName());
						element.setConsigneeName(consignee.getName());
						element.setNoOfPackages(pkgsColl.get(element.getWayBillId()));
					}

					request.setAttribute("PendingStockReportModel", reportModel);
				} else {
					error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
					error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
					request.setAttribute("cargoError", error);
				}
			}

			ActionStaticUtil.setReportViewModel(request);
			request.setAttribute("nextPageToken", "success");
		} catch (final Exception _e) {
			ActionStaticUtil.catchActionException(request, _e, error);
		}
	}
}
