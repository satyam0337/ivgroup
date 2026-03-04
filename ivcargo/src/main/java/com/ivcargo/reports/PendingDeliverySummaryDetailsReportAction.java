package com.ivcargo.reports;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.ChargeConfigBLL;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.ConsignmentSummaryDao;
import com.platform.dao.CustomerDetailsDao;
import com.platform.dao.reports.PendingDeliverySummaryReportDAO;
import com.platform.dto.ChargeTypeMaster;
import com.platform.dto.ConsignmentSummary;
import com.platform.dto.CustomerDetails;
import com.platform.dto.WayBillType;
import com.platform.dto.model.PendingDeliverySummaryReport;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

public class PendingDeliverySummaryDetailsReportAction implements Action {
	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	 		error 					= null;
		WayBillType						wayBillType 			= null;
		HashMap<Long,ConsignmentSummary> conSumColl 			= null;
		HashMap<Long,CustomerDetails> 	consignorList			= null;
		HashMap<Long,CustomerDetails> 	consigneeList			= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	cache 		= new CacheManip(request);
			final var	executive	= cache.getExecutive(request);
			final var	sdf			= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			final var	fromDate	= new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00").getTime());
			final var	toDate		= new Timestamp(sdf.parse(JSPUtility.GetString(request, "toDate") + " 23:59:59").getTime());
			final var	objectIn	= new ValueObject();

			final var	configuration = ReadAllConfigurationsBllImpl.getInstance().getReportConfigurationData(ReportIdentifierConstant.PENDING_DELIVERY_SUMMARY_REPORT, executive.getAccountGroupId());

			objectIn.put("fromDate", fromDate);
			objectIn.put("toDate", toDate);
			objectIn.put("SourceCityId", JSPUtility.GetLong(request ,"scrCity" ,0));
			objectIn.put("SourceBranchId", JSPUtility.GetLong(request ,"scrBranch" ,0));
			objectIn.put("DestinationCityId", JSPUtility.GetLong(request ,"desCity" ,0));
			objectIn.put("DestinationBranchId", JSPUtility.GetLong(request ,"desBranch" ,0));
			objectIn.put("accountGroupId", executive.getAccountGroupId());

			if(JSPUtility.GetLong(request ,"scrCity" ,0) == 0 && JSPUtility.GetLong(request ,"scrBranch" ,0) == 0)
				objectIn.put("filter", 0);
			else
				objectIn.put("filter", 1);

			final var	objectOut = PendingDeliverySummaryReportDAO.getInstance().getReport(objectIn);

			if(objectOut != null) {
				final var	reportModel 		= (PendingDeliverySummaryReport[])objectOut.get("PendingDeliverySummaryReportModel");
				final var	wayBillIdArray 		= (Long[]) objectOut.get("WayBillIdArray");
				final var	strForChargeConfig	= objectOut.get("strForChargeConfig").toString();
				final var	strForWayBillCharge	= objectOut.get("strForWayBillCharge").toString();

				if(reportModel != null && wayBillIdArray != null) {
					if(wayBillIdArray.length > 0) {
						final var	wayBillIds = Utility.GetLongArrayToString(wayBillIdArray);

						if(wayBillIds != null && wayBillIds.length() > 0) {
							conSumColl		= ConsignmentSummaryDao.getInstance().getLimitedConsignmentDetails(wayBillIds);
							consignorList	= CustomerDetailsDao.getInstance().getConsignorDetailsByWayBillId(wayBillIds);
							consigneeList	= CustomerDetailsDao.getInstance().getConsigneeDetailsByWayBillId(wayBillIds);
						}
					}

					objectIn.put("strForChargeConfig", strForChargeConfig);
					objectIn.put("strForWayBillCharge", strForWayBillCharge);
					objectIn.put("chargeTypeMasterId", ChargeTypeMaster.RECEIPT);

					final var	chargeConfigBLL  		= new ChargeConfigBLL();
					final var	wayBillChargeCollection = chargeConfigBLL.getWayBillChargeAmount(objectIn);

					for (final PendingDeliverySummaryReport element : reportModel) {
						if(conSumColl != null && conSumColl.size() > 0) {
							final var	consignmentSummary = conSumColl.get(element.getWayBillId());

							if(consignmentSummary != null)
								element.setNoOfPackages((int)consignmentSummary.getQuantity());
						}

						if(consignorList != null) {
							final var	consignor = consignorList.get(element.getWayBillId());

							if(consignor != null)
								element.setConsignorName(consignor.getName());
						}

						if(consigneeList != null) {
							final var	consignee = consigneeList.get(element.getWayBillId());

							if(consignee != null) {
								element.setConsigneeName(consignee.getName());
								element.setConsigneeMobileNo(consignee.getMobileNumber());
							}
						}

						element.setWayBillSourceSubRegion(cache.getGenericSubRegionById(request, element.getWayBillSourceSubRegionId()).getName());
						element.setWayBillSourceBranch(cache.getGenericBranchDetailCache(request, element.getWayBillSourceBranchId()).getName());
						element.setWayBillDestinationSubRegion(cache.getGenericSubRegionById(request, element.getWayBillDestinationSubRegionId()).getName());
						element.setWayBillDestinationBranch(cache.getGenericBranchDetailCache(request, element.getWayBillDestinationBranchId()).getName());

						if(wayBillChargeCollection.get(element.getWayBillId()) != null)
							element.setReceiptAmount(wayBillChargeCollection.get(element.getWayBillId()));
						else
							element.setReceiptAmount(0);

						wayBillType = cache.getWayBillTypeById(request, element.getWayBillTypeId());
						if(element.isManual())
							element.setWayBillType(wayBillType.getWayBillType()+WayBillType.WAYBILL_TYPE_MANUAL);
						else
							element.setWayBillType(wayBillType.getWayBillType());
					}
					request.setAttribute("ReportModel",reportModel);
					request.setAttribute("showConsigneeMobileNo", configuration.getOrDefault("showConsigneeMobileNo", false));
					ActionStaticUtil.setReportViewModel(request);
					request.setAttribute("nextPageToken", "success");
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
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}
	}
}