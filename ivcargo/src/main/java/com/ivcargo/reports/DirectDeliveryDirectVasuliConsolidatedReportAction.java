package com.ivcargo.reports;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.CustomerDetailsDao;
import com.platform.dao.DeliveryContactDetailsDao;
import com.platform.dao.reports.DirectDeliveryDirectVasuliDAO;
import com.platform.dto.Branch;
import com.platform.dto.CustomerDetails;
import com.platform.dto.DeliveryContactDetails;
import com.platform.dto.Executive;
import com.platform.dto.WayBillType;
import com.platform.dto.constant.DeliveryStatusConstant;
import com.platform.dto.model.DirectDeliveryDirectVasuliReportModel;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

public class DirectDeliveryDirectVasuliConsolidatedReportAction implements Action {

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		// TODO Auto-generated method stub

		HashMap<String,Object>	 error 				= null;
		Branch				branch					= null;
		Long[]				wayBillIdsArr			= null;
		String				strWayBillIds			= null;
		ValueObject			valueOutObjectBooked	= null;
		ValueObject			valueOutObjectPayment	= null;
		WayBillType			wayBillType				= null;
		Executive			executive				= null;
		CacheManip			cManip					= null;
		SimpleDateFormat	sdf						= null;
		Timestamp			fromDate				= null;
		Timestamp			toDate					= null;
		ValueObject			valueInObject			= null;
		DeliveryContactDetails			details				= null;
		HashMap<Long,CustomerDetails>	consignorHM			= null;
		HashMap<Long,CustomerDetails>	consigneeHM			= null;
		HashMap<Long,DeliveryContactDetails>				delyColl						= null;
		DirectDeliveryDirectVasuliReportModel[]				reportModel						= null;
		DirectDeliveryDirectVasuliReportModel[]				reportModelPayment				= null;
		ArrayList<DirectDeliveryDirectVasuliReportModel>	reportForPendingCRList			= null;
		DirectDeliveryDirectVasuliReportModel[]				reportModelForPendingCR			= null;
		DirectDeliveryDirectVasuliReportModel[]				reportModelForPendingCRPayment	= null;
		ArrayList<DirectDeliveryDirectVasuliReportModel>	reportForPendingCRListPayment	= null;
		long	regionId	= 0;
		long	subRegionId	= 0;
		long	srcBranchId	= 0;
		short	reportType	= 0;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeDirectDeliveryDirectVasuliConsolidatedReportAction().execute(request, response);

			valueInObject	= new ValueObject();
			cManip			= new CacheManip(request);
			executive		= cManip.getExecutive(request);
			sdf				= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			fromDate		= new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00").getTime());
			toDate			= new Timestamp(sdf.parse(JSPUtility.GetString(request, "toDate") + " 23:59:59").getTime());
			reportType		= JSPUtility.GetShort(request, "reportType");
			reportForPendingCRList			= new ArrayList<DirectDeliveryDirectVasuliReportModel>();
			reportForPendingCRListPayment	= new ArrayList<DirectDeliveryDirectVasuliReportModel>();

			ActionStaticUtil.executiveTypeWiseBranches(request, cManip, executive);

			// Get the Selected  Combo values
			if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_GROUPADMIN){
				regionId = Long.parseLong(request.getParameter("region"));
				subRegionId = Long.parseLong(request.getParameter("subRegion"));
				srcBranchId = Long.parseLong(request.getParameter("branch"));
			}else if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_REGIONADMIN){
				regionId = executive.getRegionId();
				subRegionId = Long.parseLong(request.getParameter("subRegion"));
				srcBranchId = Long.parseLong(request.getParameter("branch"));
			}else if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_SUBREGIONADMIN){
				regionId = executive.getRegionId();
				subRegionId = executive.getSubRegionId();
				srcBranchId = Long.parseLong(request.getParameter("branch"));
			}else{
				regionId = executive.getRegionId();
				subRegionId = executive.getSubRegionId();
				srcBranchId = executive.getBranchId();
			}

			valueInObject.put("regionId", regionId);
			valueInObject.put("subRegionId", subRegionId);
			valueInObject.put("srcBranchId", srcBranchId);
			valueInObject.put("executive", executive);
			valueInObject.put("fromDate", fromDate);
			valueInObject.put("toDate", toDate);
			valueInObject.put("isBooking", true);

			valueOutObjectBooked = DirectDeliveryDirectVasuliDAO.getInstance().getDirectDeliveryDirectVasuliConsolidatedData(valueInObject);

			if(valueOutObjectBooked != null) {

				reportModel		= (DirectDeliveryDirectVasuliReportModel[])valueOutObjectBooked.get("ReportModel");
				wayBillIdsArr	= (Long[])valueOutObjectBooked.get("wayBillIdsArr");

				if(reportModel != null) {

					strWayBillIds = Utility.GetLongArrayToString(wayBillIdsArr);

					if(strWayBillIds != null) {
						consignorHM = CustomerDetailsDao.getInstance().getConsignorDetailsByWayBillId(strWayBillIds);
						consigneeHM = CustomerDetailsDao.getInstance().getConsigneeDetailsByWayBillId(strWayBillIds);
						delyColl	= DeliveryContactDetailsDao.getInstance().getDeliveryContactDetails(strWayBillIds);
					}

					for (final DirectDeliveryDirectVasuliReportModel element : reportModel) {

						element.setConsignorName(consignorHM.get(element.getWayBillId()).getName());
						element.setConsigneeName(consigneeHM.get(element.getWayBillId()).getName());
						if(element.getLSDate() != null)
							element.setLSDateString(DateTimeUtility.getDateFromTimeStamp(element.getLSDate()));
						else
							element.setLSDateString("--");

						branch = cManip.getGenericBranchDetailCache(request, element.getWayBillSourceBranchId());
						element.setWayBillSourceBranch(branch.getName());
						element.setWayBillSourceSubRegionId(branch.getSubRegionId());
						element.setWayBillSourceSubRegion(cManip.getGenericSubRegionById(request, branch.getSubRegionId()).getName());

						if(element.getWayBillDestinationBranchId() > 0) {
							element.setWayBillDestinationBranch(cManip.getGenericBranchDetailCache(request, element.getWayBillDestinationBranchId()).getName());
							element.setWayBillDestinationSubRegionId(cManip.getGenericBranchDetailCache(request, element.getWayBillDestinationBranchId()).getSubRegionId());
							element.setWayBillDestinationSubRegion(cManip.getGenericSubRegionById(request, element.getWayBillDestinationSubRegionId()).getName());
						}

						wayBillType = cManip.getWayBillTypeById(request, element.getWayBillTypeId());
						if(element.isManual())
							element.setWayBillType(wayBillType.getWayBillType()+WayBillType.WAYBILL_TYPE_MANUAL);
						else
							element.setWayBillType(wayBillType.getWayBillType());
						if(delyColl != null && delyColl.size() > 0) {
							details = delyColl.get(element.getWayBillId());
							if(details != null) {
								element.setWayBillDeliveryNumber(details.getWayBillDeliveryNumber());
								element.setWayBillDeliveryStatus(DeliveryStatusConstant.getShortStatus(details.getStatus()));
								element.setWayBillDeliveryBranchId(details.getBranchId());
								element.setDcdId(details.getDeliveryContactDetailsId());
								if(details.getSettledByBranchId() > 0)
									element.setCrBranchName(cManip.getGenericBranchDetailCache(request,details.getSettledByBranchId()).getName());
								else
									element.setCrBranchName(" ");
							} else {
								element.setWayBillDeliveryNumber("");
								element.setWayBillDeliveryStatus("");
							}
						} else {
							element.setWayBillDeliveryNumber("");
							element.setWayBillDeliveryStatus("");
						}
						if(details != null){
							if(details.getStatus() != DeliveryStatusConstant.CR_STATUS_BOOKED )
								reportForPendingCRList.add(element);
						} else
							reportForPendingCRList.add(element);
					}
					if(reportType == DirectDeliveryDirectVasuliReportModel.FULL_DETAILS)
						request.setAttribute("ReportData", reportModel);
					else{
						reportModelForPendingCR = new DirectDeliveryDirectVasuliReportModel[reportForPendingCRList.size()];
						request.setAttribute("ReportData", reportForPendingCRList.toArray(reportModelForPendingCR));
					}
				}
			}

			valueInObject.put("isBooking", false);
			valueOutObjectPayment = DirectDeliveryDirectVasuliDAO.getInstance().getDirectDeliveryDirectVasuliConsolidatedData(valueInObject);

			if(valueOutObjectPayment != null) {

				reportModelPayment	= (DirectDeliveryDirectVasuliReportModel[])valueOutObjectPayment.get("ReportModel");
				wayBillIdsArr		= (Long[])valueOutObjectPayment.get("wayBillIdsArr");

				if(reportModelPayment != null){

					strWayBillIds = Utility.GetLongArrayToString(wayBillIdsArr);

					if(strWayBillIds != null) {
						consignorHM = CustomerDetailsDao.getInstance().getConsignorDetailsByWayBillId(strWayBillIds);
						consigneeHM = CustomerDetailsDao.getInstance().getConsigneeDetailsByWayBillId(strWayBillIds);
						delyColl	= DeliveryContactDetailsDao.getInstance().getDeliveryContactDetails(strWayBillIds);
					}

					for (final DirectDeliveryDirectVasuliReportModel element : reportModelPayment) {

						element.setConsignorName(consignorHM.get(element.getWayBillId()) != null ? consignorHM.get(element.getWayBillId()).getName() : "");
						element.setConsigneeName(consigneeHM.get(element.getWayBillId()) != null ? consigneeHM.get(element.getWayBillId()).getName() : "");

						branch	= cManip.getGenericBranchDetailCache(request,element.getWayBillSourceBranchId());
						element.setWayBillSourceBranch(branch.getName());
						element.setWayBillSourceSubRegionId(branch.getSubRegionId());
						element.setWayBillSourceSubRegion(cManip.getGenericSubRegionById(request, branch.getSubRegionId()).getName());

						if(element.getWayBillDestinationBranchId() > 0) {
							element.setWayBillDestinationBranch(cManip.getGenericBranchDetailCache(request, element.getWayBillDestinationBranchId()).getName());
							element.setWayBillDestinationSubRegionId(cManip.getGenericBranchDetailCache(request, element.getWayBillDestinationBranchId()).getSubRegionId());
							element.setWayBillDestinationSubRegion(cManip.getGenericSubRegionById(request, element.getWayBillDestinationSubRegionId()).getName());
						}

						wayBillType = cManip.getWayBillTypeById(request, element.getWayBillTypeId());
						if(element.isManual())
							element.setWayBillType(wayBillType.getWayBillType()+WayBillType.WAYBILL_TYPE_MANUAL);
						else
							element.setWayBillType(wayBillType.getWayBillType());
						if(delyColl != null && delyColl.size() > 0) {
							details = delyColl.get(element.getWayBillId());
							if(details != null) {
								element.setWayBillDeliveryNumber(details.getWayBillDeliveryNumber());
								element.setWayBillDeliveryStatus(DeliveryStatusConstant.getShortStatus(details.getStatus()));
								element.setWayBillDeliveryBranchId(details.getBranchId());
								element.setDcdId(details.getDeliveryContactDetailsId());
							} else {
								element.setWayBillDeliveryNumber("");
								element.setWayBillDeliveryStatus("");
							}
						} else {
							element.setWayBillDeliveryNumber("");
							element.setWayBillDeliveryStatus("");
						}
						if(details != null){
							if(details.getStatus() != DeliveryStatusConstant.CR_STATUS_BOOKED )
								reportForPendingCRListPayment.add(element);
						} else
							reportForPendingCRListPayment.add(element);
					}
					if(reportType == DirectDeliveryDirectVasuliReportModel.FULL_DETAILS)
						request.setAttribute("ReportPaymentData", reportModelPayment);
					else{
						reportModelForPendingCRPayment = new DirectDeliveryDirectVasuliReportModel[reportForPendingCRListPayment.size()];
						request.setAttribute("ReportPaymentData", reportForPendingCRListPayment.toArray(reportModelForPendingCRPayment));
					}
				}
			}

			if(reportType == DirectDeliveryDirectVasuliReportModel.FULL_DETAILS){
				if(valueOutObjectBooked == null && valueOutObjectPayment == null) {
					error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
					error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
					request.setAttribute("cargoError", error);
				}
			} else if(valueOutObjectBooked == null && valueOutObjectPayment == null ||reportForPendingCRListPayment.isEmpty()  && reportForPendingCRList.isEmpty()) {
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}
			ActionStaticUtil.setReportViewModel(request);
			request.setAttribute("nextPageToken", "success");
		} catch (final Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		} finally {
			error 					= null;
			wayBillIdsArr			= null;
			strWayBillIds			= null;
			valueOutObjectBooked	= null;
			valueOutObjectPayment	= null;
			wayBillType				= null;
			executive				= null;
			cManip					= null;
			sdf						= null;
			fromDate				= null;
			toDate					= null;
			valueInObject			= null;
			details				= null;
			consignorHM			= null;
			consigneeHM			= null;
			delyColl						= null;
			reportModel						= null;
			reportModelPayment				= null;
			reportForPendingCRList			= null;
			reportModelForPendingCR			= null;
			reportModelForPendingCRPayment	= null;
			reportForPendingCRListPayment	= null;
			regionId	= 0;
			subRegionId	= 0;
			srcBranchId	= 0;
			reportType	= 0;
		}
	}
}