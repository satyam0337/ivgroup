package com.ivcargo.actions.transport;

import java.io.PrintWriter;
import java.sql.Timestamp;
import java.util.Date;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.VehiclePendingForUnLoadinglBLL;
import com.businesslogic.modelcreator.GenerateValueObjectForLorryHireSummary;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.logsapp.LogWriter;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.platform.dto.Executive;
import com.platform.dto.LorryHireSummary;
import com.platform.dto.VehiclePendingForArrival;
import com.platform.dto.VehiclePendingForUnLoading;
import com.platform.resource.CargoErrorList;

public class VehicleUnloadingStartAction implements Action {

	public static final String TRACE_ID = "VehicleUnloadingStartAction";

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	 			error 								= null;
		Executive 					    executive 							= null;
		Timestamp					    createDate							= null;
		VehiclePendingForUnLoadinglBLL  vehiclePendingForUnLoadinglBLL		= null;
		ValueObject						valueInObject						= null;
		ValueObject						valueOutObject						= null;
		VehiclePendingForUnLoading		vehiclePendingForUnLoading			= null;
		PrintWriter						out									= null;
		LorryHireSummary				lorryHireSummary					= null;
		StringBuilder					strBfr								= null;
		long							undateCount         				= 0;
		long							lorryHireId							= 0;
		short							filter								= 0;

		try {

			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error))
				return;

			response.setContentType("text/plain");
			executive 			= (Executive)request.getSession().getAttribute("executive");
			lorryHireId			= JSPUtility.GetLong(request, "lorryHireId",0);
			out 				= response.getWriter();
			strBfr 				= new StringBuilder();

			if(lorryHireId > 0){

				createDate			= new Timestamp(new Date().getTime());
				vehiclePendingForUnLoading = setVehiclePendingForUnLoading(request, createDate);

				if(vehiclePendingForUnLoading.getStatus() == VehiclePendingForUnLoading.STATUS_UNLOADING_IN_PROGRESS)
					filter = 1;
				else if(vehiclePendingForUnLoading.getStatus() == VehiclePendingForUnLoading.STATUS_UNLOADING_COMPLETED)
					filter = 2;

				lorryHireSummary 	= setLorryHireSummaryParameter(request, executive, createDate);

				valueInObject 	= new ValueObject();
				valueInObject.put("vehiclePendingForUnLoading", vehiclePendingForUnLoading);
				valueInObject.put(LorryHireSummary.LORRY_HIRE_SUMMARY, lorryHireSummary);
				valueInObject.put("filter", filter);
				valueInObject.put("executive", executive);

				vehiclePendingForUnLoadinglBLL	= new VehiclePendingForUnLoadinglBLL();
				valueOutObject 		= vehiclePendingForUnLoadinglBLL.update(valueInObject);

				if(valueOutObject != null) {
					undateCount = Long.parseLong(valueOutObject.get("undateCount").toString());
					if(undateCount > 0)
						strBfr.append(undateCount);
					else
						strBfr.append(0);
				} else
					strBfr.append(0);
			} else
				strBfr.append("Error");

			out = response.getWriter();
			out.println(strBfr.toString());
			out.flush();
			request.setAttribute("nextPageToken", "success");

		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		} finally {
			if(out != null) out.close();
			executive 							= null;
			createDate							= null;
			vehiclePendingForUnLoadinglBLL		= null;
			valueInObject						= null;
			valueOutObject						= null;
			vehiclePendingForUnLoading			= null;
		}
	}

	private VehiclePendingForUnLoading setVehiclePendingForUnLoading(HttpServletRequest request, Timestamp createDate) throws Exception {

		VehiclePendingForUnLoading	vehiclePendingForUnLoading	= null;

		try {

			vehiclePendingForUnLoading	= new VehiclePendingForUnLoading();

			vehiclePendingForUnLoading.setVehiclePendingForUnLoadingId(JSPUtility.GetLong(request, "vehiclePendingForUnloadingId",0));
			vehiclePendingForUnLoading.setStatus(JSPUtility.GetShort(request, "status"));

			if(vehiclePendingForUnLoading.getStatus() == VehiclePendingForUnLoading.STATUS_UNLOADING_IN_PROGRESS)
				vehiclePendingForUnLoading.setUnloadingStartDateTime(createDate);
			else if(vehiclePendingForUnLoading.getStatus() == VehiclePendingForUnLoading.STATUS_UNLOADING_COMPLETED)
				vehiclePendingForUnLoading.setUnloadingEndDateTime(createDate);

			return vehiclePendingForUnLoading;

		} catch (final Exception e) {
			e.printStackTrace();
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, CargoErrorList.SYSTEM_ERROR + "" +e);
			throw e;
		} finally {
			vehiclePendingForUnLoading	= null;
		}
	}

	private LorryHireSummary setLorryHireSummaryParameter(HttpServletRequest request, Executive executive, Timestamp createDate) throws Exception {
		VehiclePendingForArrival	vehiclePendingForArrival	= null;

		try {
			vehiclePendingForArrival	= new VehiclePendingForArrival();

			vehiclePendingForArrival.setLorryHireId(JSPUtility.GetLong(request, "lorryHireId",0));
			vehiclePendingForArrival.setLorryHireNumber(JSPUtility.GetString(request, "lorryHireNumber",""));
			vehiclePendingForArrival.setRouteFromBranchId(JSPUtility.GetLong(request, "routeFromBranchId",0));
			vehiclePendingForArrival.setRouteToBranchId(JSPUtility.GetLong(request, "routeToBranchId",0));
			vehiclePendingForArrival.setPrevRouteBranchId(JSPUtility.GetLong(request, "prevRouteBranchId",0));
			vehiclePendingForArrival.setNextRouteBranchId(JSPUtility.GetLong(request, "nextRouteBranchId",0));
			vehiclePendingForArrival.setRouteBranchId(JSPUtility.GetLong(request, "routeBranchId",0));
			vehiclePendingForArrival.setVehicleNumberId(JSPUtility.GetLong(request, "vehicleNumberId", 0));
			vehiclePendingForArrival.setVehicleNumber(JSPUtility.GetString(request, "vehicleNumber", ""));
			vehiclePendingForArrival.setCapacity(JSPUtility.GetDouble(request, "capacity", 0.00));
			vehiclePendingForArrival.setDriverName(JSPUtility.GetString(request, "driverName", "").toUpperCase());
			vehiclePendingForArrival.setDriverMobileNo(JSPUtility.GetString(request, "driverMobileNumber", ""));
			vehiclePendingForArrival.setAvailableLoadingCapacity(JSPUtility.GetDouble(request, "availableLoadingCapacity", 0.00));
			vehiclePendingForArrival.setKilometer(JSPUtility.GetDouble(request, "kilometer", 0.00));
			vehiclePendingForArrival.setWeightToBeUnloaded(JSPUtility.GetDouble(request, "weightToBeUnloaded", 0.00));
			vehiclePendingForArrival.setTransactionDateTime(createDate);
			vehiclePendingForArrival.setSystemDateTime(createDate);
			vehiclePendingForArrival.setOperationTypeId(LorryHireSummary.OPERATION_TYPE_VEHICLE_UNLOADING_IN_PROGRESS_ID);

			return GenerateValueObjectForLorryHireSummary.getInstance().generateLorryHireSummaryValueObject(executive, vehiclePendingForArrival);
		} catch (final Exception e) {
			e.printStackTrace();
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, CargoErrorList.SYSTEM_ERROR + "" +e);
			throw e;
		}
	}
}