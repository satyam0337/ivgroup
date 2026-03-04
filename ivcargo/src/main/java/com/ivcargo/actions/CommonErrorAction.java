package com.ivcargo.actions;

//~--- non-JDK imports --------------------------------------------------------

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.platform.resource.CargoErrorList;

public class CommonErrorAction implements Action {

	public static final String TRACE_ID = "CommonErrorAction";

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String, Object>	error 			= null;
		short 					filter			= 0;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request, error))
				return;

			filter = Short.parseShort(request.getParameter("filter"));

			switch (filter) {
			case 1:
				error.put(CargoErrorList.ERROR_CODE, CargoErrorList.WAYBILL_NO_OUT_OF_RANGE);
				error.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.WAYBILL_NO_OUT_OF_RANGE_DESCRIPTION);
				break;
			case 2:
				error.put(CargoErrorList.ERROR_CODE, CargoErrorList.SEQUENCE_COUNTER_MISSING);
				error.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.SEQUENCE_COUNTER_MISSING_DESCRIPTION);
				break;
			case 3:
				error.put(CargoErrorList.ERROR_CODE, CargoErrorList.ARTICLE_TYPE_MISSING);
				error.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.ARTICLE_TYPE_MISSING_DESCRIPTION);
				break;
			case 4:
				error.put(CargoErrorList.ERROR_CODE, CargoErrorList.WAYBILL_TYPE_MISSING);
				error.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.WAYBILL_TYPE_MISSING_DESCRIPTION);
				break;
			case 5:
				error.put(CargoErrorList.ERROR_CODE, CargoErrorList.PACKING_TYPE_MISSING);
				error.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.PACKING_TYPE_MISSING_DESCRIPTION);
				break;
			case 6:
				error.put(CargoErrorList.ERROR_CODE, CargoErrorList.DELIVERY_POINT_MISSING);
				error.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.DELIVERY_POINT_MISSING_DESCRIPTION);
				break;
			case 7:
				error.put(CargoErrorList.ERROR_CODE, CargoErrorList.BOOKING_CHARGES_MISSING);
				error.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.BOOKING_CHARGES_MISSING_DESCRIPTION);
				break;
			case 8:
				error.put(CargoErrorList.ERROR_CODE, CargoErrorList.VEHICLE_TYPE_FOR_GROUP_MISSING);
				error.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.VEHICLE_TYPE_FOR_GROUP_MISSING_DESCRIPTION);
				break;
			case 9:
				error.put(CargoErrorList.ERROR_CODE, CargoErrorList.REGION_FOR_GROUP_MISSING);
				error.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.REGION_FOR_GROUP_MISSING_DESCRIPTION);
				break;
			case 10:
				error.put(CargoErrorList.ERROR_CODE, CargoErrorList.VEHICLE_AGENT_FOR_GROUP_MISSING);
				error.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.VEHICLE_AGENT_FOR_GROUP_MISSING_DESCRIPTION);
				break;
			case 11:
				error.put(CargoErrorList.ERROR_CODE, CargoErrorList.GODOWN_FOR_BRANCH_MISSING);
				error.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.GODOWN_FOR_BRANCH_MISSING_DESCRIPTION);
				break;
			case 12:
				error.put(CargoErrorList.ERROR_CODE, CargoErrorList.DELIVERY_CHARGES_MISSING);
				error.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.DELIVERY_CHARGES_MISSING_DESCRIPTION);
				break;
			case 13:
				error.put(CargoErrorList.ERROR_CODE, CargoErrorList.VEHICLE_NUMBER_MISSING);
				error.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.VEHICLE_NUMBER_MISSING_DESCRIPTION);
				break;
			case 14:
				error.put(CargoErrorList.ERROR_CODE, CargoErrorList.SOURCE_BRANCH_MISSING);
				error.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.SOURCE_BRANCH_MISSING_DESCRIPTION);
				break;
			case 15:
				error.put(CargoErrorList.ERROR_CODE, CargoErrorList.LS_NOT_FOUND);
				error.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.LS_NOT_FOUND_DESCRIPTION);
				break;
			case 16:
				error.put(CargoErrorList.ERROR_CODE, CargoErrorList.LS_RECEIVED);
				error.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.LS_RECEIVED_DESCRIPTION);
				break;
			case 17:
				error.put(CargoErrorList.ERROR_CODE, CargoErrorList.NO_RECORDS_TO_INSERT_INTO_VEHICLE_HAMALI);
				error.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.NO_RECORDS_TO_INSERT_INTO_VEHICLE_HAMALI_DESCRIPTION);
				break;
			case 18:
				error.put(CargoErrorList.ERROR_CODE, CargoErrorList.TRAFFIC_CONFIGURATION_ERROR);
				error.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.TRAFFIC_CONFIGURATION_ERROR_DESCRIPTION);
				break;
			case 19:
				error.put(CargoErrorList.ERROR_CODE, CargoErrorList.ACCESS_DENIED_ERROR);
				error.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.ACCESS_DENIED_ERROR_DESCRIPTION);
				break;
			case 20:
				error.put(CargoErrorList.ERROR_CODE, CargoErrorList.NO_RECORDS_TO_INSERT_INTO_OFFICE_EXPENSE);
				error.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.NO_RECORDS_TO_INSERT_INTO_OFFICE_EXPENSE_DESCRIPTION);
				break;
			case 21:
				error.put(CargoErrorList.ERROR_CODE, CargoErrorList.LHPV_EDIT_ERROR);
				error.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.LHPV_EDIT_ERROR_DESCRIPTION);
				break;
			case 22:
				error.put(CargoErrorList.ERROR_DESCRIPTION, "Executive Branch not found !");
				break;
			case 23:
				error.put(CargoErrorList.ERROR_DESCRIPTION, "Request For Same Report Is Already Processing, Please Try After Completing Ongoing Request!");
				break;
			case 24:
				error.put(CargoErrorList.ERROR_DESCRIPTION, "RC For This Vehicle Is Expired, Please Select New Vehicle");
				break;
			case 25:
				error.put(CargoErrorList.ERROR_DESCRIPTION, "Money Receipt Not Generated !");
				break;
			default:
				break;
			}

			request.setAttribute(CargoErrorList.CARGO_ERROR, error);
			request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}
	}
}