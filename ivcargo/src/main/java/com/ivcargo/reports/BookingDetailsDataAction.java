package com.ivcargo.reports;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Predicate;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.BookingDetailsReportBLL;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.bll.impl.properties.DisplayDataConfigurationBllImpl;
import com.iv.dto.constant.FeildPermissionsConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.utils.CollectionUtility;
import com.iv.utils.constant.Constant;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.message.Message;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.reports.BookingDetailsDao;
import com.platform.dto.CustomGroupMapper;
import com.platform.dto.WayBillBookingCharges;
import com.platform.dto.configuration.report.collection.BookingDetailsReportConfigurationDTO;
import com.platform.dto.model.ChargeTypeModel;
import com.platform.resource.CargoErrorList;

public class BookingDetailsDataAction implements Action {

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>			error		 			= null;
		final short 					filter					= 5;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new BookingDetailsInitializeAction().execute(request, response);

			final var	bookingDetailsReportBLL		= new BookingDetailsReportBLL();
			final var	finalBookingChargesHM		= new HashMap<String, WayBillBookingCharges>();
			final var	chargeIdWiseSum				= new HashMap<Long, Double>();
			final var	valInObj	= new ValueObject();

			if(JSPUtility.GetString(request, Constant.FROM_DATE) == null
					|| JSPUtility.GetString(request, Constant.TO_DATE) == null) {
				error.put(CargoErrorList.ERROR_DESCRIPTION, "Please, Select proper From Date and To Date");
				request.setAttribute("error", error);
				return;
			}

			final var	fromDate	= ActionStaticUtil.getFromToDate(request, Constant.FROM_DATE, ActionStaticUtil.FROMTIME);
			final var	toDate		= ActionStaticUtil.getFromToDate(request, Constant.TO_DATE, ActionStaticUtil.TOTIME);

			final var	cManip  	= new CacheManip(request);
			final var	executive   = cManip.getExecutive(request);

			final var	valObjSelection = ActionStaticUtil.reportSelection(request, executive);
			final long	branchId 	= (Long)valObjSelection.get("branchId");

			request.setAttribute("agentName", executive.getName());

			final var	locationId		    = JSPUtility.GetLong(request, "locationId" ,0);
			final var	groupConfiguration	= ReadAllConfigurationsBllImpl.getInstance().getOldReportConfigurationData(ReportIdentifierConstant.BOOKING_DETAILS, executive.getAccountGroupId());
			final var	showBookingCharges	= groupConfiguration.getBoolean(BookingDetailsReportConfigurationDTO.SHOW_BOOKING_CHARGES, false);
			final var	chargeIdsToShow		= groupConfiguration.getString(BookingDetailsReportConfigurationDTO.CHARGE_IDS_TO_SHOW);
			final var	chargeIdsToShowList	= CollectionUtility.getLongListFromString(chargeIdsToShow);
			final var	displayDataConfig	= cManip.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.DISPLAY_DATA_CONFIGURATION);

			final var	showBranchCodeInReport = DisplayDataConfigurationBllImpl.getInstance().isDisplayBranchCode(ReportIdentifierConstant.BOOKING_DETAILS, displayDataConfig);

			final var 	execFldPermissionsHM 	= cManip.getExecutiveFieldPermission(request);
			final var	customErrorOnOtherBranchDetailSearch	= groupConfiguration.getBoolean(BookingDetailsReportConfigurationDTO.CUSTOM_ERROR_ON_OTHER_BRANCH_DETAIL_SEARCH, false);
			final var	locationMappingList     = cManip.getAssignedLocationsByLocationIdId(request, branchId, executive.getAccountGroupId());

			valInObj.put("branchId", branchId);
			valInObj.put("executive", executive);
			valInObj.put("fromDate", fromDate);
			valInObj.put("toDate", toDate);
			valInObj.put("branchesColl", cManip.getGenericBranchesDetail(request));
			valInObj.put("showBranchCodeInReport", showBranchCodeInReport);
			valInObj.put("locationId", locationId);
			valInObj.put(BookingDetailsReportConfigurationDTO.SHOW_GST_AMOUNT_COL, groupConfiguration.getBoolean(BookingDetailsReportConfigurationDTO.SHOW_GST_AMOUNT_COL, false));
			valInObj.put("deliveryLocationList", locationMappingList);
			valInObj.put(FeildPermissionsConstant.ALLOW_TO_SEARCH_ALL_BRANCH_REPORT_DATA, execFldPermissionsHM != null && execFldPermissionsHM.containsKey(FeildPermissionsConstant.ALLOW_TO_SEARCH_ALL_BRANCH_REPORT_DATA));
			valInObj.put(BookingDetailsReportConfigurationDTO.IS_SEARCH_DATA_FOR_OWN_BRANCH_ONLY, groupConfiguration.getBoolean(BookingDetailsReportConfigurationDTO.IS_SEARCH_DATA_FOR_OWN_BRANCH_ONLY, false));

			final var	valObj = bookingDetailsReportBLL.getBookingDetails(valInObj);

			request.setAttribute("locationMappingList", locationMappingList);
			request.setAttribute("locationId", locationId);

			if(valObj == null) {
				ActionStaticUtil.setRequestAttribute(request, ActionStaticUtil.NO_RECORDS_FOUND, true);
				return;
			}
			if(valObj.containsKey(Message.MESSAGE)) {
				if(customErrorOnOtherBranchDetailSearch){
					error.put("errorCode", CargoErrorList.OTHER_BRANCH_REPORT_DATA_SEARCH_ERROR);
					if(branchId > 0)
						error.put("errorDescription", "Kindly Contact Source Branch For Report");
					else
						error.put("errorDescription", "Kindly Contact Respective Branches For Report");
				}else {
					error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
					error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				}
				request.setAttribute("cargoError", error);
				return;
			}

			if(showBookingCharges){
				final var	chargeTypeModels	= cManip.getBookingCharges(request, executive.getBranchId());
				final var	chargeTypeModelList	= (ArrayList<ChargeTypeModel>) Arrays.stream(chargeTypeModels).collect(Collectors.toList());

				final Predicate<ChargeTypeModel> personPredicate = p-> !chargeIdsToShowList.contains(p.getChargeTypeMasterId());
				chargeTypeModelList.removeIf(personPredicate);

				final Map<Long, String>	chargeTypeModelHM		= chargeTypeModelList.stream().collect(
						Collectors.toMap(ChargeTypeModel::getChargeTypeMasterId, ChargeTypeModel :: getChargeName));

				final var	wayBillBookingChargesHM	=	BookingDetailsDao.getInstance().getWayBillBookingChargesInTimeRange(branchId ,executive.getAccountGroupId() ,fromDate  ,toDate ,executive.getRegionId() ,executive.getSubRegionId() ,filter, true, (short)0);

				wayBillBookingChargesHM.entrySet().forEach((final Map.Entry<String, WayBillBookingCharges> entry) -> {
					final var billBookingCharges = entry.getValue();

					if(chargeIdsToShowList.contains(billBookingCharges.getWayBillChargeMasterId())) {
						billBookingCharges.setName(chargeTypeModelHM.get(billBookingCharges.getWayBillChargeMasterId()));
						finalBookingChargesHM.put(entry.getKey(), billBookingCharges);

						if(chargeIdWiseSum.get(billBookingCharges.getWayBillChargeMasterId()) == null)
							chargeIdWiseSum.put(billBookingCharges.getWayBillChargeMasterId(), billBookingCharges.getChargeAmount());
						else
							chargeIdWiseSum.put(billBookingCharges.getWayBillChargeMasterId(),chargeIdWiseSum.get(billBookingCharges.getWayBillChargeMasterId()) + billBookingCharges.getChargeAmount());
					}
				});

				ActionStaticUtil.setRequestAttribute(request, "chargeTypeModelHM", chargeTypeModelHM);
				ActionStaticUtil.setRequestAttribute(request, "finalBookingChargesHM", finalBookingChargesHM);
				ActionStaticUtil.setRequestAttribute(request, "wayBillBookingChargesHM", wayBillBookingChargesHM);
				ActionStaticUtil.setRequestAttribute(request, "chargeIdWiseSum", chargeIdWiseSum);
			}

			ActionStaticUtil.setRequestAttribute(request, "BookingDetailsModel", valObj.get("BookingDetailsModel"));
			ActionStaticUtil.setRequestAttribute(request, "totalNoOfPackages", valObj.get("totalNoOfPackages"));
			ActionStaticUtil.setRequestAttribute(request, "totalActualWeight", valObj.get("totalActualWeight"));
			ActionStaticUtil.setRequestAttribute(request, "totalChargedWeight", valObj.get("totalChargedWeight"));
			ActionStaticUtil.setRequestAttribute(request, "totalTaxAmount", valObj.get("totalTaxAmount"));
			ActionStaticUtil.setRequestAttribute(request, "totalToPayTotal", valObj.get("totalToPayTotal"));
			ActionStaticUtil.setRequestAttribute(request, "totalPaidTotal", valObj.get("totalPaidTotal"));
			ActionStaticUtil.setRequestAttribute(request, "totalTbbTotal", valObj.get("totalTbbTotal"));
			ActionStaticUtil.setRequestAttribute(request, "totalBookingCommission", valObj.get("totalBookingCommission"));
			ActionStaticUtil.setRequestAttribute(request, "customAddressBranchId", branchId);
			ActionStaticUtil.setRequestAttribute(request, "customAddressIdentifer", CustomGroupMapper.IDENTIFIER_BOOKING);
			ActionStaticUtil.setReportViewModel(request);
			ActionStaticUtil.setNextPageToken(request, ActionStaticUtil.SUCCESS);
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}
}