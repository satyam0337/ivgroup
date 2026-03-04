package com.ivcargo.reports;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.ConsignmentSummaryDao;
import com.platform.dao.DispatchSummaryDao;
import com.platform.dao.ReceivedSummaryDao;
import com.platform.dao.WayBillHistoryDao;
import com.platform.dao.reports.LateDispatchDetailsDao;
import com.platform.dto.Branch;
import com.platform.dto.ConsignmentSummary;
import com.platform.dto.DispatchLedger;
import com.platform.dto.Executive;
import com.platform.dto.ReceivedSummary;
import com.platform.dto.model.LateDispatchDetailsModel;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

public class LateDispatchDetailsReportAction implements Action {

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		// TODO Auto-generated method stub

		HashMap<String,Object>	 			error 					= null;
		Executive        					executive   			= null;
		LateDispatchDetailsModel[] 			reportModel 			= null;
		CacheManip 							cManip 					= null;
		SimpleDateFormat 					sdf            			= null;
		Timestamp        					fromDate       			= null;
		Timestamp        					toDate         			= null;
		ValueObject							valueOutObject			= null;
		Long[]								wbIdArray				= null;
		String								wbIdStr					= null;
		HashMap<Long, Timestamp> 			bookingDateTime			= null;
		ArrayList<DispatchLedger> 			lsColl					= null;
		DispatchLedger						disLedg					= null;
		Timestamp        					tripDate       			= null;
		Timestamp        					bookDate       			= null;
		ArrayList<LateDispatchDetailsModel> reportDataColl			= null;
		LateDispatchDetailsModel[]			finalData				= null;
		HashMap<Long, ConsignmentSummary> 	csColl					= null;
		ConsignmentSummary					conSum					= null;
		StringBuilder						dispatchLedgerStr		= null;
		HashMap<Long, ReceivedSummary>		turColl					= null;
		ReceivedSummary						receivedSummary			= null;
		Branch								sourceBranch			= null;
		Branch								destinationBranch		= null;
		long branchId		= 0;
		long dayDiff		= 0;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeLateDispatchDetailsReportAction().execute(request, response);

			sdf			= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			fromDate	= new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00").getTime());
			toDate		= new Timestamp(sdf.parse(JSPUtility.GetString(request, "toDate") + " 23:59:59").getTime());
			cManip 	    = new CacheManip(request);
			executive   = cManip.getExecutive(request);

			ActionStaticUtil.executiveTypeWiseBranches(request, cManip, executive);

			if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_GROUPADMIN || executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_REGIONADMIN || executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_SUBREGIONADMIN)
				branchId = Long.parseLong(request.getParameter("branch"));
			else
				branchId = executive.getBranchId();

			request.setAttribute("agentName", executive.getName());

			valueOutObject = LateDispatchDetailsDao.getInstance().getLateDispatchDetails(branchId ,executive.getAccountGroupId() ,fromDate ,toDate);
			if(valueOutObject != null) {

				reportModel = (LateDispatchDetailsModel[])valueOutObject.get("LateDispatchDetailsModel");
				wbIdArray	= (Long[])valueOutObject.get("wbIdArray");

				if (reportModel != null && wbIdArray != null) {

					dispatchLedgerStr	= new StringBuilder();
					reportDataColl		= new ArrayList<LateDispatchDetailsModel>();
					sdf					= new SimpleDateFormat("dd-MM-yyyy");
					wbIdStr				= Utility.GetLongArrayToString(wbIdArray);
					if(wbIdStr.length() > 0) {
						bookingDateTime	= WayBillHistoryDao.getInstance().getBookedDateFromWayBillHistory(wbIdStr);
						lsColl			= DispatchSummaryDao.getInstance().getDispatchDetails(wbIdStr, branchId, executive.getAccountGroupId());
						csColl			= ConsignmentSummaryDao.getInstance().getLimitedConsignmentDetails(wbIdStr);
					}

					for (final LateDispatchDetailsModel element : reportModel)
						if(lsColl != null)
							for (final DispatchLedger element2 : lsColl) {
								disLedg = element2;
								if(disLedg != null) {
									//condition applied if more then 1 records are there for same branch
									if(element.getWayBillId() == disLedg.getWayBillId() && !sdf.format(element.getCreationTimeStamp()).equals(sdf.format(disLedg.getTripDateTime())))
										dispatchLedgerStr.append(disLedg.getDispatchLedgerId()+",");
									if(element.getWayBillId() == disLedg.getWayBillId() && sdf.format(element.getCreationTimeStamp()).equals(sdf.format(disLedg.getTripDateTime())))
										element.setTripDate(disLedg.getTripDateTime());
								}
							}

					if(dispatchLedgerStr.length() > 0)
						turColl = ReceivedSummaryDao.getInstance().getTURDetailsByLSIds(dispatchLedgerStr.substring(0, dispatchLedgerStr.length() - 1).toString());

					for (final LateDispatchDetailsModel element : reportModel) {

						if(bookingDateTime != null)
							if(bookingDateTime.get(element.getWayBillId()) != null)
								element.setBookedDate(bookingDateTime.get(element.getWayBillId()));

						if(csColl != null) {
							conSum = csColl.get(element.getWayBillId());
							if(conSum != null) {
								element.setNoOfArticle(conSum.getQuantity());
								element.setActualWeight(conSum.getActualWeight());
							}
						}

						if(turColl != null) {
							receivedSummary = turColl.get(element.getWayBillId());
							if(receivedSummary != null) {

								tripDate = element.getTripDate();

								bookDate = receivedSummary.getWayBillReceivedTime();

								dayDiff = Utility.getDayDiffBetweenTwoDates(bookDate, tripDate);
								element.setDaysLate(dayDiff);
							}
						}

						if(lsColl != null)
							for (final DispatchLedger element2 : lsColl) {
								disLedg = element2;
								//condition applied if more then 1 records are there for same branch
								if(disLedg != null && element.getWayBillId() == disLedg.getWayBillId() && sdf.format(element.getCreationTimeStamp()).equals(sdf.format(disLedg.getTripDateTime()))) {
									element.setTripDate(disLedg.getTripDateTime());
									tripDate = disLedg.getTripDateTime();

									bookDate = element.getBookedDate();

									dayDiff = Utility.getDayDiffBetweenTwoDates(bookDate, tripDate);
									element.setDaysLate(dayDiff);
								}
							}

						sourceBranch = cManip.getGenericBranchDetailCache(request, element.getSourceBranchId());
						element.setSourceSubRegion(cManip.getGenericSubRegionById(request,sourceBranch.getSubRegionId()).getName());
						element.setSourceBranch(sourceBranch.getName());

						destinationBranch = cManip.getGenericBranchDetailCache(request, element.getDestinationBranchId());
						element.setDestinationSubRegion(cManip.getGenericSubRegionById(request, destinationBranch.getSubRegionId()).getName());
						element.setDestinationBranch(destinationBranch.getName());

						//if dispatch date is late [ greater then 0 ]
						if(element.getDaysLate() > 0)
							reportDataColl.add(element);
					}

					if(reportDataColl != null && reportDataColl.size() > 0) {
						finalData = new LateDispatchDetailsModel[reportDataColl.size()];
						reportDataColl.toArray(finalData);
						request.setAttribute("LateDispatchDetailsModel", finalData);
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
			error 					= null;
			executive   			= null;
			reportModel 			= null;
			cManip 					= null;
			sdf            			= null;
			fromDate       			= null;
			toDate         			= null;
			valueOutObject			= null;
			wbIdArray				= null;
			wbIdStr					= null;
			bookingDateTime			= null;
			lsColl					= null;
			disLedg					= null;
			tripDate       			= null;
			bookDate       			= null;
			reportDataColl			= null;
			finalData				= null;
			csColl					= null;
			conSum					= null;
			dispatchLedgerStr		= null;
			turColl					= null;
			receivedSummary			= null;
		}
	}
}