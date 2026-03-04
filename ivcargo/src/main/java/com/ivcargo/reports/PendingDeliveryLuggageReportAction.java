package com.ivcargo.reports;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.ObjectUtils;
import org.apache.commons.lang3.StringUtils;

import com.businesslogic.DeliveryBLL;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.dto.constant.ExecutiveTypeConstant;
import com.iv.dto.constant.WayBillTypeConstant;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.ConsignmentDetailsDao;
import com.platform.dao.CustomerDetailsDao;
import com.platform.dto.Branch;
import com.platform.dto.Executive;
import com.platform.dto.TransportCommonMaster;
import com.platform.dto.model.PendingDeliveryLuggageReportModel;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

public class PendingDeliveryLuggageReportAction implements Action{

	public static final String TRACE_ID = "PendingDeliveryLuggageReportAction";
	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	 						error 				= null;
		String											srcBranches			= null;
		String											destBranches		= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializePendingDeliveryLuggageReportAction().execute(request, response);

			final var	cacheManip 	= new CacheManip(request);
			final var	executive 	= cacheManip.getExecutive(request);

			// Get the Selected  Combo values
			final var	selectedSourceSubRegion  =  JSPUtility.GetLong(request, "subRegion", 0);
			final var	selectedDestSubRegion  =  JSPUtility.GetLong(request, "TosubRegion", -1);

			//Get all selected source Branches
			final var	destBranchesArr	= new  ArrayList<>(cacheManip.getPhysicalBranchesBySubRegionId(request,executive.getAccountGroupId(), selectedDestSubRegion).values());
			var	branches = new Branch[destBranchesArr.size()];
			destBranchesArr.toArray(branches);
			request.setAttribute("destBranches", branches);

			final var	srcBranchesArr	= new  ArrayList<>(cacheManip.getPhysicalBranchesBySubRegionId(request,executive.getAccountGroupId(), selectedSourceSubRegion).values());
			branches = new Branch[srcBranchesArr.size()];
			srcBranchesArr.toArray(branches);
			request.setAttribute("branches", branches);

			final var	valueInObject	= new ValueObject();
			final var	deliveryBLL		= new DeliveryBLL();

			final var	sourceSubRegionId 	= JSPUtility.GetLong(request, "subRegion", 0);
			final var	sourceBranchId 		= JSPUtility.GetLong(request, "branch", 0);

			short 	filter 		= 0;
			var destSubRegionId	= 0L;
			var destBranchId	= 0L;

			final var	sdf        	= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			final var	fromDateT  	= new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00").getTime());
			final var	toDateT		= new Timestamp(sdf.parse(JSPUtility.GetString(request, "toDate") + " 23:59:59").getTime());

			if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN){
				destSubRegionId	= JSPUtility.GetLong(request, "TosubRegion", 0);
				destBranchId 	= JSPUtility.GetLong(request, "SelectDestBranch", 0);

				valueInObject.put("destSubRegionId", destSubRegionId);
			} else if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_BRANCHADMIN || executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_EXECUTIVE || executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_LIMITED)
				destBranchId 	= executive.getBranchId();

			if(sourceSubRegionId == 0 && sourceBranchId == 0) {
				//sourceCity & sourceBranch both non selected
				if(executive.getExecutiveType()==ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN) {
					//DestCity are always selected
					if(destBranchId == 0)
						//DestBranch is non selected
						destBranches = cacheManip.getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_SUBREGION, destSubRegionId);
					else
						//DestBranch is selected
						destBranches = Long.toString(destBranchId);
					filter = 1;
				} else if (executive.getExecutiveType()==ExecutiveTypeConstant.EXECUTIVE_TYPE_BRANCHADMIN
						|| executive.getExecutiveType()==ExecutiveTypeConstant.EXECUTIVE_TYPE_EXECUTIVE
						|| executive.getExecutiveType()==ExecutiveTypeConstant.EXECUTIVE_TYPE_LIMITED) {
					destBranches 	= Long.toString(destBranchId);
					filter 			= 1;
				}
			} else {
				if(sourceSubRegionId != 0 && sourceBranchId == 0)
					srcBranches = cacheManip.getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_SUBREGION, sourceSubRegionId);
				else
					srcBranches = Long.toString(sourceBranchId);

				if(executive.getExecutiveType()==Executive.EXECUTIVE_TYPE_GROUPADMIN) {
					//DestCity are always selected
					if(destBranchId == 0)
						//DestBranch is non selected
						destBranches = cacheManip.getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_SUBREGION, destSubRegionId);
					else
						//DestBranch is selected
						destBranches = Long.toString(destBranchId);
					filter = 2;
				} else if (executive.getExecutiveType()==ExecutiveTypeConstant.EXECUTIVE_TYPE_BRANCHADMIN
						|| executive.getExecutiveType()==ExecutiveTypeConstant.EXECUTIVE_TYPE_EXECUTIVE
						|| executive.getExecutiveType()==ExecutiveTypeConstant.EXECUTIVE_TYPE_LIMITED) {
					destBranches 	= Long.toString(destBranchId);
					filter 			= 2;
				}
			}

			valueInObject.put("filter", filter);
			valueInObject.put("fromDate", fromDateT);
			valueInObject.put("toDate", toDateT);
			valueInObject.put("accountGroupId", executive.getAccountGroupId());
			valueInObject.put("srcBranches", srcBranches);
			valueInObject.put("destBranches", destBranches);

			if(filter == 1 && StringUtils.isEmpty(destBranches) || filter == 2 && (StringUtils.isEmpty(srcBranches) || StringUtils.isEmpty(destBranches))) {
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
				request.setAttribute("nextPageToken", "success");
				return;
			}

			final var	objOut	= deliveryBLL.getPendingDeliveryLuggageData(valueInObject);

			if(objOut != null) {
				final var	reportModels = (PendingDeliveryLuggageReportModel[])objOut.get("reportModelArr");
				final HashMap<Long,PendingDeliveryLuggageReportModel>	reportModelHM = new LinkedHashMap<>();

				final var	wayBillIdArray 	= (Long[])objOut.get("WayBillIdArray");
				final var	wayBillIdsStr	= Utility.GetLongArrayToString(wayBillIdArray);
				final var	conColl			= ConsignmentDetailsDao.getInstance().getConsignmentDetailsArrayByWayBillIds(wayBillIdsStr);
				final var	consignorColl 	= CustomerDetailsDao.getInstance().getConsignorDetailsByWayBillId(wayBillIdsStr);
				final var	consigneeColl 	= CustomerDetailsDao.getInstance().getConsigneeDetailsByWayBillId(wayBillIdsStr);

				if(ObjectUtils.isEmpty(consignorColl) || ObjectUtils.isEmpty(consigneeColl)) {
					error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
					error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
					request.setAttribute("cargoError", error);
					return;
				}

				for (final PendingDeliveryLuggageReportModel reportModel : reportModels) {
					var	model = reportModelHM.get(reportModel.getWayBillId());

					if(model == null) {
						model = new PendingDeliveryLuggageReportModel();

						// Set City & Branch name
						model.setWayBillSourceSubRegion(cacheManip.getGenericSubRegionById(request, reportModel.getWayBillSourceSubRegionId()).getName());
						model.setWayBillSourceBranch(cacheManip.getGenericBranchDetailCache(request, reportModel.getWayBillSourceBranchId()).getName());
						model.setWayBillDestinationSubRegion(cacheManip.getGenericSubRegionById(request, reportModel.getWayBillDestinationSubRegionId()).getName());
						model.setWayBillDestinationBranch(cacheManip.getGenericBranchDetailCache(request, reportModel.getWayBillDestinationBranchId()).getName());
						// Set City & Branch name

						if(reportModel.isManual())
							model.setWayBillType(WayBillTypeConstant.getWayBillTypeNameByWayBilTypeId(reportModel.getWayBillTypeId()) + WayBillTypeConstant.WAYBILL_TYPE_MANUAL);
						else model.setWayBillType(WayBillTypeConstant.getWayBillTypeNameByWayBilTypeId(reportModel.getWayBillTypeId()));

						// Set Pkg Details : START
						final var	conArr = conColl.get(reportModel.getWayBillId());
						final var pkgDtls=new StringBuilder();
						var noOfPkgs = 0L;

						if(ObjectUtils.isNotEmpty(conArr))
							for (var j=0; j<conArr.length; j++){
								if (j != conArr.length-1)
									pkgDtls.append(conArr[j].getQuantity()).append(" ").append(conArr[j].getPackingTypeName()).append(" / ");
								else
									pkgDtls.append(conArr[j].getQuantity()).append(" ").append(conArr[j].getPackingTypeName());

								noOfPkgs += conArr[j].getQuantity();
							}

						model.setPackingType(pkgDtls.toString());
						model.setNoOfPackages(noOfPkgs);
						// Set Pkg Details : END

						model.setWayBillNumber(reportModel.getWayBillNumber());
						model.setReceivedTime(reportModel.getReceivedTime());

						final var	customerDetails		= consignorColl.get(reportModel.getWayBillId());
						final var	consigneeDetails	= consigneeColl.get(reportModel.getWayBillId());

						model.setConsignorName(customerDetails != null ? customerDetails.getName() : "");

						if(consigneeDetails != null) {
							model.setConsigneeName(consigneeDetails.getName());
							model.setConsigneeNo(consigneeDetails.getPhoneNumber());
						} else {
							model.setConsigneeName("");
							model.setConsigneeNo("");
						}

						if(reportModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY)
							model.setGrandTotal(reportModel.getGrandTotal());
						else
							model.setGrandTotal(0.00);

						model.setNoOfDays(reportModel.getNoOfDays());

						reportModelHM.put(reportModel.getWayBillId(), model);
					}
				}

				request.setAttribute("ReportData", reportModelHM);
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
