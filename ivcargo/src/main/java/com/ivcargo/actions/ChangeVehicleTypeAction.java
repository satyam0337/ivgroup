package com.ivcargo.actions;

import java.util.ArrayList;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.dto.constant.VehicleTypeConstant;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.platform.dto.WayBill;

public class ChangeVehicleTypeAction implements Action{

	public static final String TRACE_ID = "ChangeVehicleTypeAction";

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response){

		HashMap<String,Object>	 	error 					= null;
		var					Comm			= 0D;
		WayBill[]				waybillArr		= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	totalCount 		= Integer.parseInt(request.getParameter("totalCount"));
			final var	waybillAL	 	= new ArrayList<WayBill>();

			if(totalCount != 0){
				for(var i=1 ; i<=totalCount ; i++){
					final var	waybill	= new WayBill();
					final var	amtForComm = JSPUtility.GetDouble(request, "amtForComm_"+i);
					waybill.setWayBillId(JSPUtility.GetLong(request, "wayBillId_"+i));
					final var vehicleTypeId = JSPUtility.GetLong(request, "wbVehicleType_"+i);
					waybill.setVehicleTypeId(vehicleTypeId);

					if(vehicleTypeId == VehicleTypeConstant.VEHICLE_TYPE_BUS_ID)
						Comm = VehicleTypeConstant.VEHICLE_TYPE_BUS_COMM;
					else
						Comm = VehicleTypeConstant.VEHICLE_TYPE_TRUCK_COMM;

					waybill.setBookingCommission(amtForComm * Comm/100);
					waybillAL.add(waybill);
				}

				if(waybillAL != null && waybillAL.size() > 0){
					waybillArr = new WayBill[waybillAL.size()];
					waybillAL.toArray(waybillArr);

					request.setAttribute("updateSuccessfully", true);
				}else{
					request.setAttribute("ErrorMsg", "System Can not Update Vehicle Type");
					request.setAttribute("isErrorMsg", true);
				}
			}else{
				request.setAttribute("ErrorMsg", "No Data Found To Update Vehicle Type");
				request.setAttribute("isErrorMsg", true);
			}

			request.setAttribute("nextPageToken", "success");
		} catch (final Exception _e) {
			ActionStaticUtil.catchActionException(request, _e, error);
		}
	}
}
