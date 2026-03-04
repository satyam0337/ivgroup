package com.ivcargo.actions.transport;

import java.io.PrintWriter;
import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.EmptyVehicleBLL;
import com.businesslogic.LMTTrafficBLL;
import com.businesslogic.LorryHireRouteBLL;
import com.businesslogic.LorryHireSummaryBLL;
import com.businesslogic.modelcreator.GenerateValueObjectForLorryHireSummary;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.logsapp.LogWriter;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.LorryHireDao;
import com.platform.dto.EmptyVehicle;
import com.platform.dto.Executive;
import com.platform.dto.LorryHireRoute;
import com.platform.dto.LorryHireSummary;
import com.platform.dto.VehicleNumberMaster;
import com.platform.dto.VehiclePendingForArrival;
import com.platform.dto.VehiclePendingForLoading;
import com.platform.dto.VehiclePendingForUnLoading;
import com.platform.dto.constant.EmptyVehicleConstant;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

public class LorryHireSummaryAction implements Action {

	public static final String TRACE_ID = "LorryHireSummaryAction";

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	 		error 					= null;
		Executive 					executive 							= null;
		Timestamp					createDate							= null;
		LorryHireSummaryBLL			lorryHireSummaryBLL					= null;
		ValueObject					valueInObject						= null;
		ValueObject					valueOutObject						= null;
		LorryHireSummary			lorryHireSummary					= null;
		VehiclePendingForLoading	vehiclePendingForLoading			= null;
		VehiclePendingForUnLoading	vehiclePendingForUnLoading			= null;
		Timestamp					arrivalTransactionDate				= null;
		StringBuilder				strBfr								= null;
		ValueObject					createLorryHireSummaryObj			= null;
		EmptyVehicle				emptyVehicle						= null;
		PrintWriter					out									= null;
		String						arrivalDate 						= null;
		String						arrivalTime 						= null;
		String						amPm								= null;
		SimpleDateFormat 			sdf									= null;
		ArrayList<Long>             assignedLocationIdList   			= null;
		CacheManip 					cManip 								= null;
		long						lorryHireSummaryId  				= 0;
		long						lorryHireId							= 0;
		long						vehiclePendingForArrivalId			= 0;
		short						operationOnVehicleId				= 0;
		boolean						isLSExist							= false;
		boolean						isAllLSReceivedForEmptyVehicle		= false;
		HashMap<Long,VehicleNumberMaster>		vehicleObj				= null;

		try {

			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error))
				return;

			response.setContentType("text/plain");
			executive 			= (Executive)request.getSession().getAttribute("executive");
			lorryHireId			= JSPUtility.GetLong(request, "lorryHireId",0);
			vehiclePendingForArrivalId = JSPUtility.GetLong(request, "vehiclePendingForArrivalId",0);
			out 				= response.getWriter();
			strBfr 				= new StringBuilder();
			cManip 				= new CacheManip(request);

			if(lorryHireId > 0){

				sdf    					= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
				arrivalDate 			= JSPUtility.GetString(request, "arrivalDate");
				arrivalTime				= JSPUtility.GetString(request, "arrivalTime");
				amPm 					= JSPUtility.GetString(request, "ampm");
				arrivalTime 			= Utility.createTime(arrivalTime, amPm);
				createDate				= new Timestamp(new Date().getTime());
				arrivalTransactionDate 	= new Timestamp(sdf.parse(arrivalDate + " " + arrivalTime).getTime());

				assignedLocationIdList = cManip.getAssignedLocationsIdListByLocationIdId(request, executive.getBranchId(), executive.getAccountGroupId());
				if(!assignedLocationIdList.contains(executive.getBranchId()))
					assignedLocationIdList.add(executive.getBranchId());

				//operationOnVehicleId= JSPUtility.GetShort(request, "operationTypeId");
				isLSExist		= LorryHireDao.getInstance().getLorryHireDetailsByBranchId(Utility.GetLongArrayListToString(assignedLocationIdList), lorryHireId);
				if(isLSExist)
					operationOnVehicleId = LorryHireSummary.UNLOADING_ID;
				else
					operationOnVehicleId = LorryHireSummary.LOADING_ID;

				createLorryHireSummaryObj 	= setLorryHireSummaryParameter(request, executive, createDate, arrivalTransactionDate);
				if(operationOnVehicleId == LorryHireSummary.LOADING_ID)
					vehiclePendingForLoading = setVehiclePendingForLoading(request, executive, createDate, arrivalTransactionDate);
				else if(operationOnVehicleId == LorryHireSummary.UNLOADING_ID || operationOnVehicleId == LorryHireSummary.BOTH_ID){
					vehiclePendingForUnLoading = setVehiclePendingForUnLoading(request, executive, createDate, arrivalTransactionDate);
					vehiclePendingForLoading   = setVehiclePendingForLoading(request, executive, createDate, arrivalTransactionDate);
					if(operationOnVehicleId == LorryHireSummary.UNLOADING_ID)
						vehiclePendingForLoading.setAutomaticLoading(true);
				}

				lorryHireSummary 				= (LorryHireSummary) createLorryHireSummaryObj.get(LorryHireSummary.LORRY_HIRE_SUMMARY);
				isAllLSReceivedForEmptyVehicle	= LMTTrafficBLL.getInstance().checkAllLSReceiveForLorryHire(lorryHireSummary.getLorryHireId());

				if(lorryHireSummary.getRouteToBranchId() == lorryHireSummary.getRouteBranchId())
					if(isAllLSReceivedForEmptyVehicle)
						emptyVehicle = EmptyVehicleBLL.populateEmptyVehicleDTO(lorryHireSummary, executive, createDate,EmptyVehicleConstant.EMPTY_VEHICLE_STATUS_NOT_ENGAGED);
					else
						emptyVehicle = EmptyVehicleBLL.populateEmptyVehicleDTO(lorryHireSummary, executive, createDate,EmptyVehicleConstant.EMPTY_VEHICLE_STATUS_ENGAGED);

				vehicleObj		= cManip.getALLVehicleNumberOfGroup(request, executive.getAccountGroupId());
				valueInObject 	= new ValueObject();
				valueInObject.put("createLorryHireSummaryObj", createLorryHireSummaryObj);
				valueInObject.put("vehicleObj", vehicleObj);
				valueInObject.put("vehiclePendingForLoading", vehiclePendingForLoading);
				valueInObject.put("vehiclePendingForUnLoading", vehiclePendingForUnLoading);
				valueInObject.put("vehiclePendingForArrivalId", vehiclePendingForArrivalId);
				valueInObject.put("executive", executive);
				valueInObject.put("emptyVehicle", emptyVehicle);
				valueInObject.put("createDate", createDate);

				lorryHireSummaryBLL	= new LorryHireSummaryBLL();
				valueOutObject 		= lorryHireSummaryBLL.insert(valueInObject);

				if(valueOutObject != null) {
					lorryHireSummaryId = Long.parseLong(valueOutObject.get("lorryHireSummaryId").toString());
					if(lorryHireSummaryId > 0)
						strBfr.append(lorryHireSummaryId);
					else
						strBfr.append(0);
				} else
					strBfr.append(0);
			} else
				strBfr.append("Error");

			out = response.getWriter();
			out.println(strBfr.toString());
			out.flush();
			out.close();
			request.setAttribute("nextPageToken", "success");

		} catch (final Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		} finally {
			out.close();
			executive 							= null;
			createDate							= null;
			lorryHireSummaryBLL					= null;
			valueInObject						= null;
			valueOutObject						= null;
			lorryHireSummary					= null;
			vehiclePendingForLoading			= null;
			vehiclePendingForUnLoading			= null;
			arrivalTransactionDate				= null;
			createLorryHireSummaryObj			= null;
		}
	}

	private ValueObject setLorryHireSummaryParameter(HttpServletRequest request, Executive executive, Timestamp createDate, Timestamp arrivalTransactionDate) throws Exception {
		ValueObject			createLorryHireSummaryObj   = null;
		LorryHireRoute		lorryHireRoute				= null;
		ValueObject			valObj					    = null;
		LorryHireSummary	lorryHireSummary		 	= null;
		VehiclePendingForArrival vehiclePendingForArrival	= null;

		try {
			vehiclePendingForArrival	= new VehiclePendingForArrival();

			vehiclePendingForArrival.setLorryHireId(JSPUtility.GetLong(request, "lorryHireId", 0));
			vehiclePendingForArrival.setLorryHireNumber(JSPUtility.GetString(request, "lorryHireNumber", ""));
			vehiclePendingForArrival.setRouteFromBranchId(JSPUtility.GetLong(request, "routeFromBranchId", 0));
			vehiclePendingForArrival.setRouteToBranchId(JSPUtility.GetLong(request, "routeToBranchId", 0));
			vehiclePendingForArrival.setPrevRouteBranchId(JSPUtility.GetLong(request, "prevRouteBranchId", 0));
			vehiclePendingForArrival.setNextRouteBranchId(JSPUtility.GetLong(request, "nextRouteBranchId", 0));
			vehiclePendingForArrival.setRouteBranchId(JSPUtility.GetLong(request, "routeBranchId", 0));
			vehiclePendingForArrival.setVehicleNumberId(JSPUtility.GetLong(request, "vehicleNumberId", 0));
			vehiclePendingForArrival.setVehicleNumber(JSPUtility.GetString(request, "vehicleNumber", ""));
			vehiclePendingForArrival.setCapacity(JSPUtility.GetDouble(request, "capacity", 0.00));
			vehiclePendingForArrival.setDriverName(JSPUtility.GetString(request, "driverName", "").toUpperCase());
			vehiclePendingForArrival.setDriverMobileNo(JSPUtility.GetString(request, "driverMobileNumber", ""));
			vehiclePendingForArrival.setAvailableLoadingCapacity(JSPUtility.GetDouble(request, "availableLoadingCapacity", 0.00));
			vehiclePendingForArrival.setKilometer(JSPUtility.GetDouble(request, "kilometer", 0.00));
			vehiclePendingForArrival.setWeightToBeUnloaded(JSPUtility.GetDouble(request, "weightToBeUnloaded", 0.00));
			vehiclePendingForArrival.setTransactionDateTime(arrivalTransactionDate);
			vehiclePendingForArrival.setSystemDateTime(createDate);
			vehiclePendingForArrival.setOperationTypeId(LorryHireSummary.OPERATION_TYPE_VEHICLE_ARRIVED_ID);

			lorryHireSummary = GenerateValueObjectForLorryHireSummary.getInstance().generateLorryHireSummaryValueObject(executive, vehiclePendingForArrival);

			valObj	= new ValueObject();
			valObj.put("lorryHireId", lorryHireSummary.getLorryHireId());
			valObj.put("routeBranchId", lorryHireSummary.getRouteBranchId());
			valObj.put("systemDateTime", lorryHireSummary.getSystemDateTime());
			valObj.put("kilometer", lorryHireSummary.getKilometer());
			valObj.put("arrivalDateTime", arrivalTransactionDate);
			valObj.put("weightToBeUnload", lorryHireSummary.getWeightToBeUnloaded());
			valObj.put("availableLoadingCapacity", lorryHireSummary.getAvailableLoadingCapacity());

			lorryHireRoute 		= LorryHireRouteBLL.generateLorryHireRouteToUpdate(valObj);
			lorryHireRoute.setUpdateFilter(LorryHireRoute.FILTER_MARK_ARRIVED);

			createLorryHireSummaryObj	= new ValueObject();

			createLorryHireSummaryObj.put(LorryHireSummary.LORRY_HIRE_SUMMARY, lorryHireSummary);
			createLorryHireSummaryObj.put("lorryHireRoute", lorryHireRoute);
			// Create LorryHireRoute DTO For Update Data (end)

			return createLorryHireSummaryObj;
		} catch (final Exception e) {
			e.printStackTrace();
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, CargoErrorList.SYSTEM_ERROR +""+e);
			throw e;
		}
	}

	private VehiclePendingForLoading setVehiclePendingForLoading(HttpServletRequest request, Executive executive, Timestamp createDate, Timestamp  arrivalTransactionDate) throws Exception {

		VehiclePendingForLoading	vehiclePendingForLoading	= null;

		try {

			vehiclePendingForLoading	= new VehiclePendingForLoading();

			vehiclePendingForLoading.setLorryHireId(JSPUtility.GetLong(request, "lorryHireId",0));
			vehiclePendingForLoading.setLorryHireNumber(JSPUtility.GetString(request, "lorryHireNumber",""));
			vehiclePendingForLoading.setRouteFromBranchId(JSPUtility.GetLong(request, "routeFromBranchId",0));
			vehiclePendingForLoading.setRouteToBranchId(JSPUtility.GetLong(request, "routeToBranchId",0));
			vehiclePendingForLoading.setPrevRouteBranchId(JSPUtility.GetLong(request, "prevRouteBranchId",0));
			vehiclePendingForLoading.setNextRouteBranchId(JSPUtility.GetLong(request, "nextRouteBranchId",0));
			vehiclePendingForLoading.setRouteBranchId(JSPUtility.GetLong(request, "routeBranchId",0));
			vehiclePendingForLoading.setExecutiveId(executive.getExecutiveId());
			vehiclePendingForLoading.setBranchId(executive.getBranchId());
			vehiclePendingForLoading.setVehicleNumberId(JSPUtility.GetLong(request, "vehicleNumberId", 0));
			vehiclePendingForLoading.setVehicleNumber(JSPUtility.GetString(request, "vehicleNumber", ""));
			vehiclePendingForLoading.setCapacity(JSPUtility.GetDouble(request, "capacity", 0.00));
			vehiclePendingForLoading.setAvailableLoadingCapacity(JSPUtility.GetDouble(request, "availableLoadingCapacity", 0.00));
			vehiclePendingForLoading.setWeightToBeUnloaded(JSPUtility.GetDouble(request, "weightToBeUnloaded", 0.00));
			vehiclePendingForLoading.setDriverName(JSPUtility.GetString(request, "driverName", "").toUpperCase());
			vehiclePendingForLoading.setDriverMobileNo(JSPUtility.GetString(request, "driverMobileNumber", ""));
			vehiclePendingForLoading.setSystemDateTime(createDate);
			if(vehiclePendingForLoading.getRouteToBranchId() == vehiclePendingForLoading.getRouteBranchId())
				vehiclePendingForLoading.setStatus(VehiclePendingForLoading.STATUS_LOADING_COMPLETED);
			else
				vehiclePendingForLoading.setStatus(VehiclePendingForLoading.STATUS_PENDING_LOADING);
			vehiclePendingForLoading.setTransactionDateTime(arrivalTransactionDate);
			return vehiclePendingForLoading;

		} catch (final Exception e) {
			e.printStackTrace();
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, CargoErrorList.SYSTEM_ERROR +""+e);
			throw e;
		} finally {
			vehiclePendingForLoading	= null;
		}
	}

	private VehiclePendingForUnLoading setVehiclePendingForUnLoading(HttpServletRequest request, Executive executive, Timestamp createDate, Timestamp arrivalTransactionDate) throws Exception {

		VehiclePendingForUnLoading	vehiclePendingForUnLoading	= null;

		try {

			vehiclePendingForUnLoading	= new VehiclePendingForUnLoading();

			vehiclePendingForUnLoading.setLorryHireId(JSPUtility.GetLong(request, "lorryHireId",0));
			vehiclePendingForUnLoading.setLorryHireNumber(JSPUtility.GetString(request, "lorryHireNumber",""));
			vehiclePendingForUnLoading.setRouteFromBranchId(JSPUtility.GetLong(request, "routeFromBranchId",0));
			vehiclePendingForUnLoading.setRouteToBranchId(JSPUtility.GetLong(request, "routeToBranchId",0));
			vehiclePendingForUnLoading.setPrevRouteBranchId(JSPUtility.GetLong(request, "prevRouteBranchId",0));
			vehiclePendingForUnLoading.setNextRouteBranchId(JSPUtility.GetLong(request, "nextRouteBranchId",0));
			vehiclePendingForUnLoading.setRouteBranchId(JSPUtility.GetLong(request, "routeBranchId",0));
			vehiclePendingForUnLoading.setExecutiveId(executive.getExecutiveId());
			vehiclePendingForUnLoading.setBranchId(executive.getBranchId());
			vehiclePendingForUnLoading.setVehicleNumberId(JSPUtility.GetLong(request, "vehicleNumberId", 0));
			vehiclePendingForUnLoading.setVehicleNumber(JSPUtility.GetString(request, "vehicleNumber", ""));
			vehiclePendingForUnLoading.setCapacity(JSPUtility.GetDouble(request, "capacity", 0.00));
			vehiclePendingForUnLoading.setAvailableLoadingCapacity(JSPUtility.GetDouble(request, "availableLoadingCapacity", 0.00));
			vehiclePendingForUnLoading.setWeightToBeUnloaded(JSPUtility.GetDouble(request, "weightToBeUnloaded", 0.00));
			vehiclePendingForUnLoading.setKilometer(JSPUtility.GetDouble(request, "kilometer", 0.00));
			vehiclePendingForUnLoading.setDriverName(JSPUtility.GetString(request, "driverName", "").toUpperCase());
			vehiclePendingForUnLoading.setDriverMobileNo(JSPUtility.GetString(request, "driverMobileNumber", ""));
			vehiclePendingForUnLoading.setSystemDateTime(createDate);
			vehiclePendingForUnLoading.setStatus(VehiclePendingForUnLoading.STATUS_PENDING_UNLOADING);
			vehiclePendingForUnLoading.setTransactionDateTime(arrivalTransactionDate);

			return vehiclePendingForUnLoading;

		} catch (final Exception e) {
			e.printStackTrace();
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, CargoErrorList.SYSTEM_ERROR +""+e);
			throw e;
		} finally {
			vehiclePendingForUnLoading	= null;
		}
	}
}