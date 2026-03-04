package com.ivcargo.reports;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.Arrays;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.ObjectUtils;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.dto.constant.FeildPermissionsConstant;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.WayBillDao;
import com.platform.dao.WayBillHistoryDao;
import com.platform.dao.reports.PendingUnloadingDAO;
import com.platform.dto.WayBill;
import com.platform.dto.configuration.report.TurReportConfigurationDTO;
import com.platform.dto.model.PendingUnloadingReport;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

public class PendingUnloadingReportAction implements Action {

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		// TODO Auto-generated method stub

		HashMap<String,Object>						error 				= null;
		SimpleDateFormat 							sdf               	= null;
		Timestamp        							fromDate          	= null;
		Timestamp        							toDate            	= null;
		ValueObject 								objectIn 			= null;
		ValueObject 								objectOut 			= null;
		CacheManip									cManip				= null;
		PendingUnloadingReport[] 					reportModel 		= null;
		Long[]										wayBillIdArr		= null;
		String 										wayBillIds 			= null;
		HashMap<Long, WayBill>						wayBillBookDataColl	= null;
		WayBill										wayBill				= null;
		HashMap<Long, WayBill> 						amtColl 			= null;
		String		branchesIds					= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializePendingUnloadingReportAction().execute(request, response);

			sdf			= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			fromDate	= new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00").getTime());
			toDate		= new Timestamp(sdf.parse(JSPUtility.GetString(request, "toDate") + " 23:59:59").getTime());
			objectIn	= new ValueObject();
			objectOut	= new ValueObject();
			cManip		= new CacheManip(request);
			final var executive	= cManip.getExecutive(request);

			ActionStaticUtil.executiveTypeWiseBranches(request, cManip, executive);

			final var configuration							= ReadAllConfigurationsBllImpl.getInstance().getOldReportConfigurationData(ReportIdentifierConstant.PENDING_UNLOADING_REPORT, executive.getAccountGroupId());
			final var isSearchDataForOwnBranchOnly			= configuration.getBoolean(TurReportConfigurationDTO.IS_SEARCH_DATA_FOR_OWN_BRANCH_ONLY, false);
			final var customErrorOnOtherBranchDetailSearch	= configuration.getBoolean(TurReportConfigurationDTO.CUSTOM_ERROR_ON_OTHER_BRANCH_DETAIL_SEARCH, false);
			final var assignedLocationList 					= cManip.getAssignedLocationsIdListByLocationIdId(request, executive.getBranchId(), executive.getAccountGroupId());
			final var execFldPermissionsHM 					= cManip.getExecutiveFieldPermission(request);
			final var isAllowToSearchAllBranchReportData	= execFldPermissionsHM != null && execFldPermissionsHM.containsKey(FeildPermissionsConstant.ALLOW_TO_SEARCH_ALL_BRANCH_REPORT_DATA);
			final var	valObjSelection 					= ActionStaticUtil.reportSelection(request, executive);
			final long	branchId 							= (Long)valObjSelection.get("branchId");
			
			branchesIds	= ActionStaticUtil.getBranchIds(request, cManip, executive);

			objectIn.put("accountGroupId", executive.getAccountGroupId());
			objectIn.put("fromDate", fromDate);
			objectIn.put("toDate", toDate);
			objectIn.put("branchesIds", branchesIds);

			objectOut = PendingUnloadingDAO.getInstance().getPendingUnloading(objectIn);

			if(objectOut != null) {
				reportModel = (PendingUnloadingReport[])objectOut.get("PendingUnloadingReport");
				wayBillIdArr= (Long[])objectOut.get("WayBillIdArray");

				if(!ObjectUtils.isEmpty(reportModel) && isSearchDataForOwnBranchOnly && !isAllowToSearchAllBranchReportData){
					reportModel = Arrays.stream(reportModel).filter(report -> executive.getBranchId() == report.getSourceBranchId()
									|| executive.getBranchId() == report.getDestinationBranchId() || (assignedLocationList != null && (assignedLocationList.contains(report.getSourceBranchId())
									|| assignedLocationList.contains(report.getDestinationBranchId())))).toArray(PendingUnloadingReport[]::new);
				
					if(reportModel != null)
						wayBillIdArr = Arrays.stream(reportModel).map(PendingUnloadingReport::getWayBillId).toArray(Long[]::new);
				}

				if(ObjectUtils.isNotEmpty(reportModel)) {
					wayBillIds = Utility.GetLongArrayToString(wayBillIdArr);

					wayBillBookDataColl = WayBillHistoryDao.getInstance().getWayBillDetailsByStatus(wayBillIds, WayBill.WAYBILL_STATUS_BOOKED);
					amtColl 			= WayBillDao.getInstance().getLimitedLRDetailsbyLRIds(wayBillIds);

					for (final PendingUnloadingReport element : reportModel) {

						element.setSourceBranch(cManip.getGenericBranchDetailCache(request,element.getSourceBranchId()).getName());
						element.setSourceSubRegionId(cManip.getGenericBranchDetailCache(request,element.getSourceBranchId()).getSubRegionId());
						element.setSourceSubRegion(cManip.getGenericSubRegionById(request, element.getSourceSubRegionId()).getName());
						wayBill = wayBillBookDataColl.get(element.getWayBillId());
						element.setBookDateTime(wayBill.getCreationDateTimeStamp());
						element.setWayBillType(wayBill.getWayBillType());

						element.setGrandTotal(amtColl.get(element.getWayBillId()).getGrandTotal());

						if(element.getDestinationBranchId() > 0)
							element.setDestinationBranch(cManip.getGenericBranchDetailCache(request,element.getDestinationBranchId()).getName());
					}

					request.setAttribute("PendingUnloadingReport",reportModel);
				} else if(customErrorOnOtherBranchDetailSearch){
					error.put("errorCode", CargoErrorList.OTHER_BRANCH_REPORT_DATA_SEARCH_ERROR);
					if(branchId > 0)
						error.put("errorDescription", "Kindly Contact Source Branch For Report");
					else
						error.put("errorDescription", "Kindly Contact Respective Branches For Report");

					request.setAttribute("cargoError", error);
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
			sdf               	= null;
			fromDate          	= null;
			toDate            	= null;
			objectIn 			= null;
			objectOut 			= null;
			cManip				= null;
			reportModel 		= null;
			wayBillIdArr		= null;
			wayBillIds 			= null;
			wayBillBookDataColl	= null;
			wayBill				= null;
			amtColl 			= null;
			branchesIds			= null;
		}
	}
}