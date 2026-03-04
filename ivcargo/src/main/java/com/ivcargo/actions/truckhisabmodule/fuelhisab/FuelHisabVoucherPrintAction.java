package com.ivcargo.actions.truckhisabmodule.fuelhisab;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONObject;

import com.businesslogic.truckhisabmodule.FuelHisabSettlementBll;
import com.framework.Action;
import com.iv.logsapp.LogWriter;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.ivcargo.utils.JsonUtility;
import com.platform.dto.Branch;
import com.platform.dto.Executive;
import com.platform.dto.VehicleNumberMaster;
import com.platform.dto.truckhisabmodule.FuelHisabSettlement;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

public class FuelHisabVoucherPrintAction implements Action{
	
	private static final String TRACE_ID	= FuelHisabVoucherPrintAction.class.getName();

	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String, Object> 	error 			= null;
		boolean						isError			= false;
		try {
			error	= new HashMap<String, Object>();
			isError	= ActionStaticUtil.isSystemError(request, error);
			if (!isError) {
				JSONObject				responseJsonObject			= null;
				Executive				executive					= null;
				short					dataFilter					= 0;
				ValueObject				valueObject					= null;
				long					fuelHisabVoucherId			= 0;
				FuelHisabSettlementBll	fuelHisabSettlementBll		= null;
				try {
					responseJsonObject	= new JSONObject();

					if(request.getSession().getAttribute(Executive.EXECUTIVE) == null) {
						responseJsonObject.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.SESSION_INVALID_DESCRIPTION);
						request.setAttribute("cargoError", responseJsonObject);
						request.setAttribute("nextPageToken", "needlogin");
					}
					executive	= (Executive) request.getSession().getAttribute(Executive.EXECUTIVE);

					if (request.getParameter(FuelHisabSettlement.DATA_FILTER)	== null) {
						responseJsonObject.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.REQUEST_DATA_NOT_FOUND_DESCRIPTION);
						request.setAttribute("cargoError", responseJsonObject);
						request.setAttribute("nextPageToken", "needlogin");
					}
					dataFilter	= Utility.getShort(request.getParameter(FuelHisabSettlement.DATA_FILTER));
					fuelHisabVoucherId	= Utility.getLong(request.getParameter(FuelHisabSettlement.FUEL_HISAB_SETTLEMENT_ID));

					valueObject	= new ValueObject();
					valueObject.put(Executive.EXECUTIVE, executive);
					valueObject.put(FuelHisabSettlement.FUEL_HISAB_SETTLEMENT_ID, fuelHisabVoucherId);

					fuelHisabSettlementBll	= new FuelHisabSettlementBll();

					switch(dataFilter) {
					case FuelHisabSettlement.PRINT_FUEL_HISAB_SETTLEMENT :
						responseJsonObject	= getFuelHisabVoucherPrintByFuelHisabVoucherId(request, response, fuelHisabSettlementBll, valueObject);
						request.setAttribute(FuelHisabSettlement.FUEL_HISAB_VOUCHER, responseJsonObject);
						request.setAttribute("nextPageToken", "success");
						break;
					default :
						break;
					}
				} catch (Exception e) {
					ActionStepsUtil.catchActionException(request, e, error);
				} finally {
					responseJsonObject			= null;
					executive					= null;
					valueObject					= null;
					fuelHisabSettlementBll		= null;
				}
			}
		} catch (Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		} finally {
			error	= null;
		}
	}

	private JSONObject getFuelHisabVoucherPrintByFuelHisabVoucherId(HttpServletRequest request,
			HttpServletResponse response, FuelHisabSettlementBll fuelHisabSettlementBll, ValueObject valueObject) throws Exception{
		ValueObject		valueOutObject		= null;
		JSONObject		jsonReturn			= null;
		try {
			getCacheManipData(valueObject, request);
			valueOutObject	= fuelHisabSettlementBll.getFuelHisabVoucherPrintByFuelHisabVoucherId(valueObject);
			jsonReturn = JsonUtility.convertionToJsonObjectForResponse(valueOutObject);
			return jsonReturn;
		} catch (Exception e) {
			e.printStackTrace();
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, "error = "+e);
			throw e;
		} finally {
			valueOutObject		= null;
			jsonReturn			= null;
		}
	}
	
	private void getCacheManipData(ValueObject valueObject, HttpServletRequest request) throws Exception {
		ValueObject							valObj		= null;
		HashMap<Long,VehicleNumberMaster>	vehicleObj	= null;
		CacheManip							cache		= null;
		Executive							executive	= null;
		try {
			cache		= new CacheManip(request);
			valObj		= cache.getGenericBranchesDetail(request);
			valueObject.put(Branch.BRANCH, valObj);
			executive	= (Executive) valueObject.get(Executive.EXECUTIVE);
			vehicleObj	= cache.getALLVehicleNumberOfGroup(request, executive.getAccountGroupId());
			valueObject.put(VehicleNumberMaster.VEHICLE_NUMBER_MASTER, vehicleObj);
		} catch (Exception e) {
			e.printStackTrace();
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, "error = "+e);
			throw e;
		} finally {
			valObj		= null;
			vehicleObj	= null;
			cache		= null;
			executive	= null;
		}
	}
}
