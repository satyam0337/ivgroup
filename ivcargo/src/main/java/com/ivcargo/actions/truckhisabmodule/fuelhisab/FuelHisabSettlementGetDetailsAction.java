package com.ivcargo.actions.truckhisabmodule.fuelhisab;

import java.io.PrintWriter;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONObject;

import com.businesslogic.truckhisabmodule.FuelHisabSettlementBll;
import com.framework.Action;
import com.iv.logsapp.LogWriter;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.message.Message;
import com.iv.utils.message.MessageList;
import com.iv.utils.message.MessageUtility;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.ivcargo.utils.JsonUtility;
import com.platform.dto.Branch;
import com.platform.dto.Executive;
import com.platform.dto.VehicleNumberMaster;
import com.platform.dto.truckhisabmodule.FuelHisabSettlement;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Converter;
import com.platform.utils.Utility;

public class FuelHisabSettlementGetDetailsAction implements Action{

	private static final String TRACE_ID	= FuelHisabSettlementGetDetailsAction.class.getName();

	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String, Object> 	error 			= null;
		boolean						isError			= false;
		try {
			error	= new HashMap<String, Object>();
			isError	= ActionStaticUtil.isSystemError(request, error);
			if (!isError) {
				JSONObject				requestJsonObject			= null;
				JSONObject				responseJsonObject			= null;
				Executive				executive					= null;
				short					dataFilter					= 0;
				ValueObject				valueObject					= null;
				FuelHisabSettlementBll	fuelHisabSettlementBll		= null;
				PrintWriter				out							= null;
				try {
					response.setContentType("application/json");
					out 				= response.getWriter();
					responseJsonObject	= new JSONObject();

					if(request.getSession().getAttribute(Executive.EXECUTIVE) == null) {
						responseJsonObject.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.SESSION_INVALID_DESCRIPTION);
						out.println(responseJsonObject);
						return;
					}
					executive	= (Executive) request.getSession().getAttribute(Executive.EXECUTIVE);

					if (request.getParameter(FuelHisabSettlement.REQUEST_DATA_OBJECT)	== null) {
						responseJsonObject.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.REQUEST_DATA_NOT_FOUND_DESCRIPTION);
						out.println(responseJsonObject);
						return;
					}
					requestJsonObject	= new JSONObject(request.getParameter(FuelHisabSettlement.REQUEST_DATA_OBJECT));
					if (requestJsonObject.get(FuelHisabSettlement.DATA_FILTER)	== null) {
						responseJsonObject.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.REQUEST_DATA_NOT_FOUND_DESCRIPTION);
						out.println(responseJsonObject);
						return;
					}

					dataFilter	= Utility.getShort(requestJsonObject.get(FuelHisabSettlement.DATA_FILTER));

					valueObject	= new ValueObject();
					valueObject.put(FuelHisabSettlement.REQUEST_DATA_OBJECT, JsonUtility.convertJsontoValueObject(requestJsonObject));
					valueObject.put(Executive.EXECUTIVE, executive);

					fuelHisabSettlementBll	= new FuelHisabSettlementBll();

					switch(dataFilter) {
					case FuelHisabSettlement.GET_FUEL_RECEIPT_LHPV_DDM_AND_INT_BRANCH_LS_DETAILS :
						out.println(getFuelReceiptLHPVDDMAndIntBranchLSDetails(request, response, fuelHisabSettlementBll, valueObject));
						break;
					case FuelHisabSettlement.VALIDATE_WAYBILL :
						out.println(validateWayBillNumber(request, response, fuelHisabSettlementBll, valueObject));
						break;
					default :
						break;
					}
					out.flush();
				} catch (final Exception e) {
					ActionStepsUtil.catchActionException(request, e, error);
				} finally {
					out.close();
					requestJsonObject			= null;
					responseJsonObject			= null;
					executive					= null;
					valueObject					= null;
					fuelHisabSettlementBll		= null;
					out							= null;
				}
			}
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		} finally {
			error	= null;
		}
	}

	private JSONObject getFuelReceiptLHPVDDMAndIntBranchLSDetails (HttpServletRequest request, HttpServletResponse response, FuelHisabSettlementBll fuelHisabSettlementBll, ValueObject valueObject) throws Exception {
		ValueObject		valueOutObject		= null;
		JSONObject		jsonReturn			= null;
		try {
			getCacheManipData(valueObject, request);
			valueOutObject	= fuelHisabSettlementBll.getFuelReceiptLHPVDDMAndIntBranchLSDetails(valueObject);
			jsonReturn = JsonUtility.convertionToJsonObjectForResponse(valueOutObject);
			return jsonReturn;
		} catch (final Exception e) {
			e.printStackTrace();
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, "error = "+e);
			throw e;
		} finally {
			valueOutObject		= null;
			jsonReturn			= null;
		}
	}

	private JSONObject validateWayBillNumber (HttpServletRequest request, HttpServletResponse response, FuelHisabSettlementBll fuelHisabSettlementBll, ValueObject valueObject) throws Exception {
		ValueObject		valueOutObject		= null;
		JSONObject		jsonReturn			= null;
		try {
			getCacheManipData(valueObject, request);
			valueOutObject	= fuelHisabSettlementBll.validateWayBillNumber(valueObject);
			jsonReturn		= new JSONObject();
			if (valueOutObject != null)
				jsonReturn = JsonUtility.convertionToJsonObjectForResponse(valueOutObject);
			else {
				valueOutObject	= new ValueObject();
				valueObject.clear();
				valueObject	= MessageUtility.setError(MessageList.WAY_BILL_NOT_FOUND);
				valueOutObject.put(Message.MESSAGE, Converter.DtoToHashMap(valueObject.get(Message.MESSAGE)));
				jsonReturn = JsonUtility.convertionToJsonObjectForResponse(valueOutObject);
			}
			return jsonReturn;
		} catch (final Exception e) {
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
		} catch (final Exception e) {
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
