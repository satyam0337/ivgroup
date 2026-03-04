package com.ivcargo.reports;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.HashMap;
import java.util.TreeMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.constant.Constant;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.ConsignmentSummaryDao;
import com.platform.dao.CorporateAccountDao;
import com.platform.dao.DispatchSummaryDao;
import com.platform.dao.reports.UnbilledRegisterDestinationWiseDAO;
import com.platform.dto.Branch;
import com.platform.dto.ConsignmentSummary;
import com.platform.dto.CorporateAccount;
import com.platform.dto.DispatchLedger;
import com.platform.dto.Executive;
import com.platform.dto.configuration.modules.UnbuildRegisterDestinationWiseReportConfigurationDTO;
import com.platform.dto.model.UnbilledRegisterDestinationWiseReport;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

public class UnbilledRegisterDestinationWiseReportAction implements Action {

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>					error 				= null;
		UnbilledRegisterDestinationWiseReport 	model				= null;
		HashMap<Long, DispatchLedger>			lsColl				= null;
		HashMap<Long, ConsignmentSummary>		conSumHM			= null;
		HashMap<Long, CorporateAccount>			corpAccHM			= null;
		var									branchId 				= 0L;
		var 								destBranchIdForMap 		= 0L;
		String 								destBranchNameForMap 	= null;
		Timestamp							fromDate				= null;
		Timestamp							toDate					= null;
		String 								fromDateStr				= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeUnbilledRegisterDestinationWiseReportAction().execute(request, response);

			final var	sdf			= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			final var	sdfForSort	= new SimpleDateFormat("yyyy-MM-dd");

			final var	monthDuration	= JSPUtility.GetInt(request, "timeDuration", 0);

			if(monthDuration > 0) {
				fromDateStr	= DateTimeUtility.getPreviousDateByMonth(DateTimeUtility.getCurrentTimeStamp(), monthDuration);
				fromDate	= DateTimeUtility.getTimeStamp(fromDateStr);
				toDate		= (Timestamp)DateTimeUtility.getCurrentDateTimeAsRange().get(Constant.TO_DATE);
			} else {
				fromDate	= new Timestamp(sdf.parse(JSPUtility.GetString(request, Constant.FROM_DATE) + " 00:00:00").getTime());
				toDate		= new Timestamp(sdf.parse(JSPUtility.GetString(request, Constant.TO_DATE) + " 23:59:59").getTime());
			}

			final var	objectIn	= new ValueObject();
			final var	cache       = new CacheManip(request);
			final var	executive	= cache.getExecutive(request);

			final var	configuration 					= ReadAllConfigurationsBllImpl.getInstance().getOldReportConfigurationData(ReportIdentifierConstant.UNBILLED_REGISTER_DESTINATION_WISE_REPORT, executive.getAccountGroupId());
			final var	showBillingBranchWiseRecord	 	= configuration.getBoolean(UnbuildRegisterDestinationWiseReportConfigurationDTO.SHOW_BILLING_BRANCH_WISE_RECORD,false);
			final var	showBookingDate				 	= configuration.getBoolean(UnbuildRegisterDestinationWiseReportConfigurationDTO.SHOW_BOOKING_DATE, false);

			ActionStaticUtil.executiveTypeWiseBranches(request, cache, executive);

			if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_GROUPADMIN || executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_REGIONADMIN || executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_SUBREGIONADMIN)
				branchId = Long.parseLong(request.getParameter("branch"));
			else
				branchId = executive.getBranchId();

			final var	assignedLocationIdList = cache.getAssignedLocationsIdListByLocationIdId(request, branchId, executive.getAccountGroupId());

			if(!assignedLocationIdList.contains(branchId))
				assignedLocationIdList.add(branchId);

			final var	branchIds = Utility.GetLongArrayListToString(assignedLocationIdList);

			objectIn.put("fromDate", fromDate);
			objectIn.put("toDate", toDate);
			objectIn.put("branchIds", branchIds);
			objectIn.put("accountGroupId", executive.getAccountGroupId());
			objectIn.put("showBillingBranchWiseRecord", showBillingBranchWiseRecord);

			final var	objectOut = UnbilledRegisterDestinationWiseDAO.getInstance().getUnbilledRegisterDestinationWise(objectIn);

			if(objectOut != null) {
				final var	reportModel 	= (UnbilledRegisterDestinationWiseReport[])objectOut.get("UnbilledRegisterDestinationWiseReport");
				final var	lrIdsArr		= (Long[]) objectOut.get("WayBillIds");
				final var	corporateIdsArr	= (Long[]) objectOut.get("corporateIdsArr");

				if(reportModel != null && lrIdsArr != null) {
					final var	destDataColl	= new TreeMap<String, TreeMap<String,UnbilledRegisterDestinationWiseReport>>();

					if(lrIdsArr.length > 0) {
						final var	lrIds = Utility.GetLongArrayToString(lrIdsArr);

						if(lrIds != null && lrIds.length() > 0) {
							lsColl 	= DispatchSummaryDao.getInstance().getDispatchDetailsCollection(lrIds, branchIds, executive.getAccountGroupId());
							conSumHM= ConsignmentSummaryDao.getInstance().getLimitedConsignmentDetails(lrIds);
						}
					}

					if(corporateIdsArr.length > 0) {
						final var	corporateIds = Utility.GetLongArrayToString(corporateIdsArr);

						if(corporateIds != null && corporateIds.length()>0 )
							corpAccHM = CorporateAccountDao.getInstance().getCorporateAccountDetails(corporateIds);
					}

					for (final UnbilledRegisterDestinationWiseReport element : reportModel) {
						element.setActualWeight(conSumHM.get(element.getWayBillId()).getActualWeight());
						element.setQuantity((int)conSumHM.get(element.getWayBillId()).getQuantity());
						element.setAmount(conSumHM.get(element.getWayBillId()).getAmount());
						element.setCreditorName(corpAccHM.get(element.getCreditorId()).getName());
						element.setSourceBranch(cache.getGenericBranchDetailCache(request,element.getSourceBranchId()).getName());
						element.setDestinationBranch(cache.getGenericBranchDetailCache(request, element.getDestinationBranchId()).getName());

						if(lsColl != null && lsColl.get(element.getWayBillId()) != null)
							element.setVehicleNo(lsColl.get(element.getWayBillId()).getVehicleNumber());
						else
							element.setVehicleNo("--");

						if(conSumHM != null && conSumHM.get(element.getWayBillId()).getBookedBy() != null)
							element.setBookedBy(conSumHM.get(element.getWayBillId()).getBookedBy());
						else
							element.setBookedBy("--");

						final var	branch = cache.getGenericBranchDetailCache(request,element.getDestinationBranchId());

						if(branch != null && branch.getTypeOfLocation() == Branch.TYPE_OF_LOCATION_OPERATIONAL_PLACE) {
							final var	locationsMapping = cache.getLocationMapping(request, executive.getAccountGroupId(), branch.getBranchId());

							if(locationsMapping != null) {
								destBranchIdForMap		= locationsMapping.getLocationId();
								destBranchNameForMap	= cache.getGenericBranchDetailCache(request,destBranchIdForMap).getName();
							}
						} else {
							destBranchIdForMap		= element.getDestinationBranchId();
							destBranchNameForMap	= element.getDestinationBranch();
						}

						var	dataColl = destDataColl.get(destBranchNameForMap + "_" + destBranchIdForMap);

						if(dataColl == null) {
							dataColl	= new TreeMap<>();
							model		= new UnbilledRegisterDestinationWiseReport();
							model.setCreationDateTimeStamp(element.getCreationDateTimeStamp());
							model.setWayBillId(element.getWayBillId());
							model.setWayBillNumber(element.getWayBillNumber());
							model.setSourceBranchId(element.getSourceBranchId());
							model.setSourceBranch(element.getSourceBranch());
							model.setDestinationBranchId(element.getDestinationBranchId());
							model.setDestinationBranch(element.getDestinationBranch());
							model.setActualWeight(element.getActualWeight());
							model.setQuantity(element.getQuantity());
							model.setAmount(element.getAmount());
							model.setCreditorName(element.getCreditorName());
							model.setCreditorId(element.getCreditorId());
							model.setVehicleNo(element.getVehicleNo());
							model.setBookedBy(element.getBookedBy());
							model.setBookingDateTime(element.getBookingDateTime());
							model.setGrandTotal(element.getGrandTotal());
							

							if(showBookingDate)
								dataColl.put(sdfForSort.format(element.getBookingDateTime()) + "_" + element.getWayBillId(), model);
							else
								dataColl.put(sdfForSort.format(element.getCreationDateTimeStamp()) + "_" + element.getWayBillId(), model);

							destDataColl.put(destBranchNameForMap + "_" + destBranchIdForMap, dataColl);
						} else {
							if(showBookingDate)
								model = dataColl.get(sdfForSort.format(element.getBookingDateTime()) + "_" + element.getWayBillId());
							else
								model = dataColl.get(sdfForSort.format(element.getCreationDateTimeStamp()) + "_" + element.getWayBillId());

							if(model == null) {
								model = new UnbilledRegisterDestinationWiseReport();
								model.setCreationDateTimeStamp(element.getCreationDateTimeStamp());
								model.setWayBillId(element.getWayBillId());
								model.setWayBillNumber(element.getWayBillNumber());
								model.setSourceBranchId(element.getSourceBranchId());
								model.setSourceBranch(element.getSourceBranch());
								model.setDestinationBranchId(element.getDestinationBranchId());
								model.setDestinationBranch(element.getDestinationBranch());
								model.setActualWeight(element.getActualWeight());
								model.setQuantity(element.getQuantity());
								model.setAmount(element.getAmount());
								model.setCreditorName(element.getCreditorName());
								model.setCreditorId(element.getCreditorId());
								model.setVehicleNo(element.getVehicleNo());
								model.setBookedBy(element.getBookedBy());
								model.setBookingDateTime(element.getBookingDateTime());
								model.setGrandTotal(element.getGrandTotal());

								if(showBookingDate)
									dataColl.put(sdfForSort.format(element.getBookingDateTime()) + "_" + element.getWayBillId(), model);
								else
									dataColl.put(sdfForSort.format(element.getCreationDateTimeStamp()) + "_" + element.getWayBillId(), model);

							} else {
								model.setActualWeight(model.getActualWeight() + element.getActualWeight());
								model.setQuantity(model.getQuantity() + element.getQuantity());
								model.setAmount(model.getAmount() + element.getAmount());
							}
						}
					}

					request.setAttribute("destDataColl",destDataColl);
					request.setAttribute(UnbuildRegisterDestinationWiseReportConfigurationDTO.SHOW_BOOKED_BY_COLUMN, configuration.getBoolean(UnbuildRegisterDestinationWiseReportConfigurationDTO.SHOW_BOOKED_BY_COLUMN, false));
					request.setAttribute(UnbuildRegisterDestinationWiseReportConfigurationDTO.SHOW_BOOKING_DATE, showBookingDate);

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
			ActionStaticUtil.catchActionException(request, _e, error);
		}
	}
}