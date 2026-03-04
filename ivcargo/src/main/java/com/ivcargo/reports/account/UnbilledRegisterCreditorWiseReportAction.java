package com.ivcargo.reports.account;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.function.Function;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.constant.properties.UnbilledRegisterCreditorReportConfigPropertiesConstant;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.dto.constant.WayBillStatusConstant;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.constant.Constant;
import com.iv.utils.constant.DateTimeFormatConstant;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.utility.CollectionUtility;
import com.iv.utils.utility.SortUtils;
import com.iv.utils.utility.SplitLRNumber;
import com.iv.utils.utility.Utility;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.reports.account.initialize.InitializeUnbilledRegisterCreditorWiseReportAction;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.reports.UnbilledRegisterCreditorWiseDAO;
import com.platform.dto.Branch;
import com.platform.dto.CustomGroupMapper;
import com.platform.dto.Executive;
import com.platform.dto.configuration.mindateselection.ReportWiseMinDateSelectionConfigurationDTO;
import com.platform.dto.model.UnbilledRegisterCreditorWiseReport;
import com.platform.resource.CargoErrorList;

public class UnbilledRegisterCreditorWiseReportAction implements Action {
	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	 			error 									= null;
		Timestamp        					fromDate          						= null;
		Timestamp        					toDate            						= null;
		final String						accountGroupNameForPrint				= null;
		var    								branchId 		 						= 0L;
		String 								fromDateStr       						= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request, error))
				return;

			new InitializeUnbilledRegisterCreditorWiseReportAction().execute(request, response);

			final var	cache       = new CacheManip (request);
			final var	executive							= cache.getExecutive(request);
			final var	sdf									= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			final var	configuration						= ReadAllConfigurationsBllImpl.getInstance().getOldReportConfigurationData(ReportIdentifierConstant.UNBILLED_REGISTER_CREDITOR_WISE_REPORT, executive.getAccountGroupId());
			final var	showBillingBranchWiseRecord			= configuration.getBoolean(UnbilledRegisterCreditorReportConfigPropertiesConstant.SHOW_BILLING_BRANCH_WISE_RECORD, false);
			final var	showGrandTotalInFreightColumn		= configuration.getBoolean(UnbilledRegisterCreditorReportConfigPropertiesConstant.SHOW_GRAND_TOTAL_IN_FREIGHT_COLUMN, false);
			final var	showBillingTotalInFreightColumn		= configuration.getBoolean(UnbilledRegisterCreditorReportConfigPropertiesConstant.SHOW_BILLING_TOTAL_IN_FREIGHT_COLUMN, false);

			final var	monthDuration   = JSPUtility.GetInt(request, "timeDuration", 0);

			if(monthDuration > 0) {
				fromDateStr	= DateTimeUtility.getPreviousDateByMonth(DateTimeUtility.getCurrentTimeStamp(), monthDuration);
				fromDate	= DateTimeUtility.getTimeStamp(fromDateStr);
				toDate		= (Timestamp)DateTimeUtility.getCurrentDateTimeAsRange().get(Constant.TO_DATE);
			} else {
				fromDate	= new Timestamp(sdf.parse(JSPUtility.GetString(request, Constant.FROM_DATE) + " 00:00:00").getTime());
				toDate		= new Timestamp(sdf.parse(JSPUtility.GetString(request, Constant.TO_DATE) + " 23:59:59").getTime());
			}

			final var	objectIn	= new ValueObject();

			final var	minDateTimeStamp					= cache.getReportWiseMinDateToGetData(request, executive.getAccountGroupId(),
					ReportWiseMinDateSelectionConfigurationDTO.UNBILLED_REGISTER_CREDITOR_WISE_REPORT_MIN_DATE_ALLOW,
					ReportWiseMinDateSelectionConfigurationDTO.UNBILLED_REGISTER_CREDITOR_WISE_REPORT_MIN_DATE);

			ActionStaticUtil.executiveTypeWiseBranches(request, cache, executive);

			if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_GROUPADMIN || executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_REGIONADMIN || executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_SUBREGIONADMIN)
				branchId 		= Long.parseLong(request.getParameter(Branch.BRANCH));
			else
				branchId 		= executive.getBranchId();

			final var	branchesIds			= ActionStaticUtil.getBranchIdsWithAssignedLocation(request, cache, executive);

			if(minDateTimeStamp != null && DateTimeUtility.compareTwoDates(minDateTimeStamp, fromDate) > 0)
				objectIn.put(Constant.FROM_DATE, minDateTimeStamp);
			else
				objectIn.put(Constant.FROM_DATE, fromDate);

			final var	creditorId	= JSPUtility.GetLong(request, "selectedCorpId", 0);
			final var	selectedDestBranchId	= JSPUtility.GetLong(request, "SelectDestBranch", 0);
			objectIn.put(Constant.TO_DATE, toDate);
			objectIn.put("branchesIds", branchesIds);
			objectIn.put(Constant.ACCOUNT_GROUP_ID, executive.getAccountGroupId());
			objectIn.put("showBillingBranchWiseRecord",showBillingBranchWiseRecord);
			objectIn.put(Constant.BILLING_PARTY_ID, creditorId);
			objectIn.put(Constant.DESTINATION_BRANCH_ID, selectedDestBranchId);

			if(configuration.getBoolean(UnbilledRegisterCreditorReportConfigPropertiesConstant.IS_ASSIGNED_DEST_LOCATIONS_NEED_TO_SHOW, false))
				if(selectedDestBranchId > 0 && JSPUtility.GetLong(request, "destLocationId", 0) <= 0) {
					final var destAssignedLocationIdList = cache.getAssignedLocationsIdListByLocationIdId(request, selectedDestBranchId, executive.getAccountGroupId());

					if(!destAssignedLocationIdList.contains(selectedDestBranchId))
						destAssignedLocationIdList.add(selectedDestBranchId);

					objectIn.put("destLocationIds",  CollectionUtility.getStringFromLongList(destAssignedLocationIdList));
				}else
					objectIn.put("destLocationIds",  Long.toString(JSPUtility.GetLong(request, "destLocationId", 0)));

			var	reportModel = UnbilledRegisterCreditorWiseDAO.getInstance().getUnbilledRegisterCreditorWiseDetails(objectIn);

			request.setAttribute("monthDuration", monthDuration);

			final var branchcoll = cache.getGenericBranchesDetail(request);

			if(reportModel != null && !reportModel.isEmpty()) {
				final Map<Long, UnbilledRegisterCreditorWiseReport>	lrWiseHM		= reportModel.stream()
						.collect(Collectors.toMap(UnbilledRegisterCreditorWiseReport::getWayBillId, Function.identity(), (e1, e2) -> e2));

				for(final Map.Entry<Long, UnbilledRegisterCreditorWiseReport> entry : lrWiseHM.entrySet()) {
					final var	element	= entry.getValue();

					element.setAmount(showGrandTotalInFreightColumn ? element.getGrandAmount() : element.getConsignmentAmount());

					if(showBillingTotalInFreightColumn)
						element.setAmount(element.getLrAmount());

					element.setCreditorName(Utility.checkedNullCondition(element.getCreditorName(), (short) 3));
					element.setVehicleNo(Utility.checkedNullCondition(element.getVehicleNo(), (short) 1));

					final  var	sourceBranch	= (Branch) branchcoll.get(Long.toString(element.getSourceBranchId()));

					if(sourceBranch.getHandlingBranchId() > 0 && sourceBranch.getTypeOfLocation() == Branch.TYPE_OF_LOCATION_OPERATIONAL_PLACE) {
						final var sourceHandlingBranch = (Branch) branchcoll.get(Long.toString(sourceBranch.getHandlingBranchId()));
						element.setSourceHandlingBranch(sourceHandlingBranch != null ? sourceHandlingBranch.getName() : "");
					}

					element.setSourceBranch(sourceBranch.getName());
					element.setSourceSubRegionId(sourceBranch.getSubRegionId());

					final  var	destBranch	= (Branch) branchcoll.get(Long.toString(element.getDestinationBranchId()));

					if(destBranch.getHandlingBranchId() > 0 && destBranch.getTypeOfLocation() == Branch.TYPE_OF_LOCATION_OPERATIONAL_PLACE) {
						final var destHandlingBranch = (Branch) branchcoll.get(Long.toString(destBranch.getHandlingBranchId()));
						element.setDestHandlingBranch(destHandlingBranch != null ? destHandlingBranch.getName() : "");
					}

					element.setDestinationBranch(destBranch.getName());
					element.setDestinationSubRegionId(destBranch.getSubRegionId());
					element.setDestinationBranch(cache.getGenericBranchDetailCache(request, element.getDestinationBranchId()).getName());
					element.setCreationDateTimeStampStr(DateTimeUtility.getDateFromTimeStamp(element.getCreationDateTimeStamp(), DateTimeFormatConstant.DD_MM_YY));
					element.setDeliveryDateTimeStr(DateTimeUtility.getDateFromTimeStamp(element.getDeliveryDateTime(), DateTimeFormatConstant.DD_MM_YY));
					element.setLsNumber(Utility.checkedNullCondition(element.getLsNumber(), (short) 1));
					element.setInvoiceNumber(Utility.checkedNullCondition(element.getInvoiceNumber(), (short) 1));
					element.setVehicleAgentName(Utility.checkedNullCondition(element.getVehicleAgentName(), (short) 1));
					element.setAdditionalRemark(Utility.checkedNullCondition(element.getAdditionalRemark(), (short) 1));
					element.setBookedBy(Utility.checkedNullCondition(element.getBookedBy(), (short) 1));
					element.setBookingDateTimeStr(DateTimeUtility.getDateFromTimeStamp(element.getBookingDateTime(), DateTimeFormatConstant.DD_MM_YY));
					element.setPodDispatchNumber(Utility.checkedNullCondition(element.getPodDispatchNumber(), (short) 1));
					element.setPodReceiveStatus(element.getPodReceivedDateTimeStamp() != null ? "Received" : "Not Received");
					element.setPodUploadedStatus(element.getPodUploadTimeStamp() != null ? "Uploaded" : "Not Uploaded");
					element.setWaybillStatus(Utility.checkedNullCondition(WayBillStatusConstant.getStatus(element.getWayBillStatusId()), (short) 1));
					element.setPodReceivedDateTimeStr(DateTimeUtility.getDateFromTimeStamp(element.getPodReceivedDateTimeStamp(), DateTimeFormatConstant.DD_MM_YY));

					if(element.getPodReceivedByExecutiveName() == null)
						element.setPodReceivedByExecutiveName("--");

					final var 	pair	= SplitLRNumber.getNumbers(element.getWayBillNumber());

					element.setWayBillBranchCode(pair != null && pair.getBranchCode() instanceof String ? pair.getBranchCode().toString() : "");
					element.setLrNumberWithoutBranchCode(pair != null && pair.getLrNumber() instanceof Long ? (long) pair.getLrNumber() : 0);
				}

				reportModel.clear();
				reportModel.addAll(lrWiseHM.values());

				reportModel	= SortUtils.sortList(reportModel, UnbilledRegisterCreditorWiseReport::getCreditorName, UnbilledRegisterCreditorWiseReport::getCreationDateTimeStamp,
						UnbilledRegisterCreditorWiseReport::getWayBillBranchCode, UnbilledRegisterCreditorWiseReport::getLrNumberWithoutBranchCode);

				final Map<String, List<UnbilledRegisterCreditorWiseReport>>	creditorDataColl 	= reportModel.stream().collect(Collectors.groupingBy(UnbilledRegisterCreditorWiseReport::getCreditorNameWithId, TreeMap::new, CollectionUtility.getList()));

				request.setAttribute("creditorDataColl", creditorDataColl);
				request.setAttribute(UnbilledRegisterCreditorReportConfigPropertiesConstant.DELIVERY_DATE_COLUMN_DISPLAY, configuration.getBoolean(UnbilledRegisterCreditorReportConfigPropertiesConstant.DELIVERY_DATE_COLUMN_DISPLAY, false));
				request.setAttribute(UnbilledRegisterCreditorReportConfigPropertiesConstant.SHOW_LR_WISE_ROUND_OF_AMOUNT, configuration.getBoolean(UnbilledRegisterCreditorReportConfigPropertiesConstant.SHOW_LR_WISE_ROUND_OF_AMOUNT, false));
				request.setAttribute("accountGroupNameForPrint", accountGroupNameForPrint);
				request.setAttribute(UnbilledRegisterCreditorReportConfigPropertiesConstant.SHOW_PARTY_SELECTION, configuration.getBoolean(UnbilledRegisterCreditorReportConfigPropertiesConstant.SHOW_PARTY_SELECTION, false));
				request.setAttribute(UnbilledRegisterCreditorReportConfigPropertiesConstant.SHOW_CONSIGNOR_NAME, configuration.getBoolean(UnbilledRegisterCreditorReportConfigPropertiesConstant.SHOW_CONSIGNOR_NAME, false));
				request.setAttribute(UnbilledRegisterCreditorReportConfigPropertiesConstant.SHOW_CONSIGNEE_NAME, configuration.getBoolean(UnbilledRegisterCreditorReportConfigPropertiesConstant.SHOW_CONSIGNEE_NAME, false));
				request.setAttribute(UnbilledRegisterCreditorReportConfigPropertiesConstant.SHOW_VEHICLE_AGENT_NAME, configuration.getBoolean(UnbilledRegisterCreditorReportConfigPropertiesConstant.SHOW_VEHICLE_AGENT_NAME, false));
				request.setAttribute(UnbilledRegisterCreditorReportConfigPropertiesConstant.SHOW_LS_NUMBER, configuration.getBoolean(UnbilledRegisterCreditorReportConfigPropertiesConstant.SHOW_LS_NUMBER, false));
				request.setAttribute(UnbilledRegisterCreditorReportConfigPropertiesConstant.SHOW_INVOICE_NO_COLUMN, configuration.getBoolean(UnbilledRegisterCreditorReportConfigPropertiesConstant.SHOW_INVOICE_NO_COLUMN, false));
				request.setAttribute(UnbilledRegisterCreditorReportConfigPropertiesConstant.SHOW_ADDITIONAL_REMARK_COLUMN, configuration.getBoolean(UnbilledRegisterCreditorReportConfigPropertiesConstant.SHOW_ADDITIONAL_REMARK_COLUMN, false));
				request.setAttribute(UnbilledRegisterCreditorReportConfigPropertiesConstant.SHOW_VEHICLE_NUBER_COLUMN, configuration.getBoolean(UnbilledRegisterCreditorReportConfigPropertiesConstant.SHOW_VEHICLE_NUBER_COLUMN, false));
				request.setAttribute(UnbilledRegisterCreditorReportConfigPropertiesConstant.SHOW_BOOKING_TOTAL_COLUMN, configuration.getBoolean(UnbilledRegisterCreditorReportConfigPropertiesConstant.SHOW_BOOKING_TOTAL_COLUMN, false));
				request.setAttribute(UnbilledRegisterCreditorReportConfigPropertiesConstant.SHOW_BOOKED_BY_COLUMN, configuration.getBoolean(UnbilledRegisterCreditorReportConfigPropertiesConstant.SHOW_BOOKED_BY_COLUMN, false));
				request.setAttribute(UnbilledRegisterCreditorReportConfigPropertiesConstant.SHOW_BOOKING_DATE, configuration.getBoolean(UnbilledRegisterCreditorReportConfigPropertiesConstant.SHOW_BOOKING_DATE, false));
				request.setAttribute(UnbilledRegisterCreditorReportConfigPropertiesConstant.SHOW_POD_DISPATCH_NUMBER_COLUMN, configuration.getBoolean(UnbilledRegisterCreditorReportConfigPropertiesConstant.SHOW_POD_DISPATCH_NUMBER_COLUMN, false));
				request.setAttribute(UnbilledRegisterCreditorReportConfigPropertiesConstant.SHOW_POD_RECEIVE_STATUS_COLUMN, configuration.getBoolean(UnbilledRegisterCreditorReportConfigPropertiesConstant.SHOW_POD_RECEIVE_STATUS_COLUMN, false));
				request.setAttribute(UnbilledRegisterCreditorReportConfigPropertiesConstant.SHOW_POD_UPLOAD_STATUS_COLUMN, configuration.getBoolean(UnbilledRegisterCreditorReportConfigPropertiesConstant.SHOW_POD_UPLOAD_STATUS_COLUMN, false));
				request.setAttribute(UnbilledRegisterCreditorReportConfigPropertiesConstant.SHOW_WAYBILL_STATUS_COLUMN, configuration.getBoolean(UnbilledRegisterCreditorReportConfigPropertiesConstant.SHOW_WAYBILL_STATUS_COLUMN, false));
				request.setAttribute(UnbilledRegisterCreditorReportConfigPropertiesConstant.SHOW_SOURCE_HANDLING_BRANCH, configuration.getBoolean(UnbilledRegisterCreditorReportConfigPropertiesConstant.SHOW_SOURCE_HANDLING_BRANCH, false));
				request.setAttribute(UnbilledRegisterCreditorReportConfigPropertiesConstant.SHOW_DEST_HANDLING_BRANCH, configuration.getBoolean(UnbilledRegisterCreditorReportConfigPropertiesConstant.SHOW_DEST_HANDLING_BRANCH, false));
				request.setAttribute(UnbilledRegisterCreditorReportConfigPropertiesConstant.SHOW_DESTINATION_BRANCH_SELECTION, configuration.getBoolean(UnbilledRegisterCreditorReportConfigPropertiesConstant.SHOW_DESTINATION_BRANCH_SELECTION, false));

			} else {
				error.put(CargoErrorList.ERROR_CODE, CargoErrorList.REPORT_NOTFOUND);
				error.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}

			ActionStaticUtil.setRequestAttribute(request,"customAddressBranchId", branchId);
			ActionStaticUtil.setRequestAttribute(request,"customAddressIdentifer", CustomGroupMapper.IDENTIFIER_BOOKING);
			ActionStaticUtil.setReportViewModel(request);
			request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}
}
