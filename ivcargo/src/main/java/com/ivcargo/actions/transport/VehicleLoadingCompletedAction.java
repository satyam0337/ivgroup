package com.ivcargo.actions.transport;

import java.io.PrintWriter;
import java.sql.Timestamp;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.LMTTrafficBLL;
import com.businesslogic.VehiclePendingForLoadinglBLL;
import com.businesslogic.modelcreator.GenerateValueObjectForLorryHireSummary;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.logsapp.LogWriter;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.ExecutiveDao;
import com.platform.dto.Branch;
import com.platform.dto.Executive;
import com.platform.dto.LorryHireRoute;
import com.platform.dto.LorryHireSummary;
import com.platform.dto.VehicleNumberMaster;
import com.platform.dto.VehiclePendingForArrival;
import com.platform.dto.VehiclePendingForLoading;
import com.platform.resource.CargoErrorList;

public class VehicleLoadingCompletedAction implements Action {

	public static final String TRACE_ID = "VehicleLoadingCompletedAction";

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	 		error 					= null;
		Executive 					    executive 							= null;
		Timestamp					    createDate							= null;
		VehiclePendingForLoadinglBLL  	vehiclePendingForLoadinglBLL		= null;
		ValueObject						valueInObject						= null;
		ValueObject						valueOutObject						= null;
		PrintWriter						out									= null;
		StringBuilder					strBfr								= null;
		LorryHireSummary				lorryHireSummary					= null;
		VehiclePendingForLoading		vehiclePendingForLoading			= null;
		Timestamp						estimatedArrivalTime				= null;
		LorryHireRoute					lorryHireRoute						= null;
		long							undateCount         				= 0;
		long							lorryHireId							= 0;
		int								nextBranchEstimationHours			= 0;
		CacheManip						cache								= null;
		HashMap<Long,VehicleNumberMaster>		vehicleObj					= null;
		boolean							isPrevBranchLoadingComplete			= false;
		long							routeBranchId						= 0;
		Branch							routeBranch							= null;

		try {

			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error))
				return;

			response.setContentType("text/plain");
			executive 			= (Executive)request.getSession().getAttribute("executive");
			lorryHireId			= JSPUtility.GetLong(request, "lorryHireId",0);
			isPrevBranchLoadingComplete = JSPUtility.GetBoolean(request, "isPrevBranchLoadingComplete", false);
			routeBranchId               = JSPUtility.GetLong(request, "routeBranchId",0);
			out 				= response.getWriter();
			strBfr 				= new StringBuilder();
			cache						= new CacheManip(request);

			if(lorryHireId > 0){
				if(isPrevBranchLoadingComplete) {
					routeBranch = cache.getGenericBranchDetailCache(request, routeBranchId);
					if(routeBranch != null && routeBranch.getTypeOfLocation() == Branch.TYPE_OF_LOCATION_OPERATIONAL_PLACE) {
						executive = ExecutiveDao.getInstance().getExecutiveByBranchId(routeBranch.getHandlingBranchId());
					} else {
						executive = ExecutiveDao.getInstance().getExecutiveByBranchId(routeBranchId);
					}
				}

				createDate				    = new Timestamp(new Date().getTime());
				lorryHireSummary		 	= setLorryHireSummaryParameter(request, executive, createDate);
				vehiclePendingForLoading	= setVehiclePendingForLoading(request, executive);
				nextBranchEstimationHours	= JSPUtility.GetInt(request, "nextBranchEstimationTime");

				lorryHireRoute = LMTTrafficBLL.getInstance().getLorryHireRouteForLoadingComplete(createDate, lorryHireSummary);

				final Calendar	cal = Calendar.getInstance();
				cal.setTime(createDate);
				cal.add(Calendar.HOUR_OF_DAY, nextBranchEstimationHours);
				estimatedArrivalTime	= new Timestamp(cal.getTime().getTime());
				vehicleObj		= cache.getALLVehicleNumberOfGroup(request, executive.getAccountGroupId());

				valueInObject 	= new ValueObject();

				valueInObject.put(LorryHireSummary.LORRY_HIRE_SUMMARY, lorryHireSummary);
				valueInObject.put("vehiclePendingForLoading", vehiclePendingForLoading);
				valueInObject.put("estimatedArrivalTime", estimatedArrivalTime);
				valueInObject.put("lorryHireRoute", lorryHireRoute);
				valueInObject.put("executive", executive);
				valueInObject.put("vehicleObj", vehicleObj);

				vehiclePendingForLoadinglBLL	= new VehiclePendingForLoadinglBLL();
				valueOutObject 		= vehiclePendingForLoadinglBLL.update(valueInObject);

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
			vehiclePendingForLoadinglBLL		= null;
			valueInObject						= null;
			valueOutObject						= null;
			lorryHireSummary					= null;
			vehiclePendingForLoading			= null;
			estimatedArrivalTime				= null;
			lorryHireRoute						= null;
		}
	}

	private VehiclePendingForLoading setVehiclePendingForLoading(HttpServletRequest request, Executive executive) throws Exception {

		VehiclePendingForLoading	vehiclePendingForLoading	= null;

		try {

			vehiclePendingForLoading = new VehiclePendingForLoading();

			vehiclePendingForLoading.setStatus(JSPUtility.GetShort(request, "status"));
			vehiclePendingForLoading.setLorryHireId(JSPUtility.GetLong(request, "lorryHireId",0));
			vehiclePendingForLoading.setBranchId(executive.getBranchId());

			return vehiclePendingForLoading;

		} catch (final Exception e) {
			e.printStackTrace();
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, CargoErrorList.SYSTEM_ERROR +""+e);
			throw e;
		} finally {
			vehiclePendingForLoading	= null;
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
			vehiclePendingForArrival.setOperationTypeId(LorryHireSummary.OPERATION_TYPE_VEHICLE_LOADING_ID);

			return GenerateValueObjectForLorryHireSummary.getInstance().generateLorryHireSummaryValueObject(executive, vehiclePendingForArrival);
		} catch (final Exception e) {
			e.printStackTrace();
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, CargoErrorList.SYSTEM_ERROR +""+e);
			throw e;
		}
	}
}