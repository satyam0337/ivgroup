package com.ivcargo.actions.transport;

//~--- non-JDK imports --------------------------------------------------------

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.WayBillBll;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.constant.properties.UpdateBookingTypeConfigurationConstant;
import com.iv.dto.constant.BookingTypeConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.logsapp.LogWriter;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.resource.CargoErrorList;

public class UpdateWayBillBookingTypeAction implements Action {

	private static final String TRACE_ID = "UpdateWayBillBookingTypeAction";

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	 error 		= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	cacheManip			= new CacheManip(request);
			final var	executive			= cacheManip.getExecutive(request);
			final var	wayBillId			= JSPUtility.GetLong(request, "wayBillId");
			final var	bookingTypeId	   	= JSPUtility.GetShort(request, "bookingType");
			final var	prevbookingTypeId  	= JSPUtility.GetShort(request, "prevBookingTypeId");
			final var	vehicleTypeId		= JSPUtility.GetLong(request, "vehicleType",0);

			final var	updateBookingTypeConfig = cacheManip.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.UPDATE_BOOKING_TYPE);

			if(bookingTypeId == prevbookingTypeId && bookingTypeId != BookingTypeConstant.BOOKING_TYPE_FTL_ID){
				LogWriter.writeLog(TRACE_ID,CargoErrorList.SYSTEM_ERROR , new Exception());
				error.put("errorCode", CargoErrorList.EDIT_WAYBILL_BOOKING_TYPE_ERROR);
				error.put("errorDescription", CargoErrorList.EDIT_WAYBILL_BOOKING_TYPE_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
				request.setAttribute("nextPageToken", "failure");
			} else if(wayBillId > 0 && bookingTypeId > 0){

				if(bookingTypeId == BookingTypeConstant.BOOKING_TYPE_FTL_ID && vehicleTypeId <= 0){
					LogWriter.writeLog(TRACE_ID,CargoErrorList.SYSTEM_ERROR , new Exception());
					error.put("errorCode", CargoErrorList.WAYBILL_VEHICLE_TYPE_MISSING_ERROR);
					error.put("errorDescription", CargoErrorList.WAYBILL_VEHICLE_TYPE_MISSING_ERROR_DESCRIPTION);
					request.setAttribute("cargoError", error);
					request.setAttribute("nextPageToken", "failure");
					return;
				}

				final var	valueInObject	= new ValueObject();
				final var	billBll 		= new WayBillBll();

				valueInObject.put("bookingTypeId", bookingTypeId);
				valueInObject.put("vehicleTypeId", vehicleTypeId);
				valueInObject.put("prevbookingTypeId", prevbookingTypeId);
				valueInObject.put("wayBillId", wayBillId);
				valueInObject.put("executive", executive);
				valueInObject.put("branchesColl", cacheManip.getGenericBranchesDetail(request));
				valueInObject.put("editBooingTypeOfSingleLROnChangeToDDDv", (boolean) updateBookingTypeConfig.getOrDefault(UpdateBookingTypeConfigurationConstant.EDIT_BOOING_TYPE_OF_SINGLE_LR_ON_CHANGE_TO_DDDV,false));
				valueInObject.put("charges", cacheManip.getActiveBookingCharges(request, executive.getBranchId()));

				final var	valueOutObject = billBll.updateLRBookingType(valueInObject);

				if(valueOutObject != null) {
					request.setAttribute("filter",1);
					request.setAttribute("wayBillId",wayBillId);
					request.setAttribute("nextPageToken", "success");
				} else {
					error.put("errorCode", CargoErrorList.EDIT_WAYBILL_BOOKING_TYPE_ERROR);
					error.put("errorDescription", CargoErrorList.EDIT_WAYBILL_BOOKING_TYPE_ERROR_DESCRIPTION);
					request.setAttribute("cargoError", error);
					request.setAttribute("nextPageToken", "failure");
				}
			} else {
				error.put("errorCode", CargoErrorList.WAYBILL_BOOKING_TYPE_MISSING_ERROR);
				error.put("errorDescription",CargoErrorList.WAYBILL_BOOKING_TYPE_MISSING_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
				request.setAttribute("nextPageToken", "failure");
			}
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}
	}
}
