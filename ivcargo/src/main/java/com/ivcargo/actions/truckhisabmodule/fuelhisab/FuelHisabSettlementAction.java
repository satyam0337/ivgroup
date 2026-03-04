package com.ivcargo.actions.truckhisabmodule.fuelhisab;

import java.io.PrintWriter;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map.Entry;

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
import com.ivcargo.utils.JsonUtility;
import com.platform.dto.Executive;
import com.platform.dto.truckhisabmodule.CollectionFuelHisabDetails;
import com.platform.dto.truckhisabmodule.DDMFuelHisabDetails;
import com.platform.dto.truckhisabmodule.FuelHisabSettlement;
import com.platform.dto.truckhisabmodule.FuelHisabVoucher;
import com.platform.dto.truckhisabmodule.InterBranchLSFuelHisabDetails;
import com.platform.dto.truckhisabmodule.LHPVFuelHisabDetails;
import com.platform.dto.truckhisabmodule.LocalFuelHisabDetails;
import com.platform.dto.truckhisabmodule.PumpReceipt;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Converter;

public class FuelHisabSettlementAction implements Action{

	private static final String TRACE_ID	= FuelHisabSettlementAction.class.getName();

	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String, Object> 	error 			= null;
		boolean						isError			= false;
		try {
			error	= new HashMap<String, Object>();
			isError	= ActionStaticUtil.isSystemError(request, error);
			if (!isError) {
				JSONObject				requestJsonDataObject		= null;
				JSONObject				responseJsonObject			= null;
				Executive				executive					= null;
				ValueObject				valueObject					= null;
				ValueObject				requestJsonObject			= null;
				FuelHisabSettlementBll	fuelHisabSettlementBll		= null;
				ValueObject				valueOutObject				= null;
				JSONObject				jsonReturn					= null;
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

					requestJsonDataObject	= new JSONObject(request.getParameter(FuelHisabSettlement.REQUEST_DATA_OBJECT));

					valueObject	= new ValueObject();
					requestJsonObject	= getValueObjectFromRequestJson(JsonUtility.convertJsontoValueObject(requestJsonDataObject), valueObject);
					valueObject.put(FuelHisabSettlement.REQUEST_DATA_OBJECT, requestJsonObject);
					valueObject.put(Executive.EXECUTIVE, executive);

					fuelHisabSettlementBll	= new FuelHisabSettlementBll();

					valueOutObject			= fuelHisabSettlementBll.saveFuelHisabVoucher(valueObject);
					if (valueOutObject.containsKey(Message.MESSAGE)) {
						valueOutObject.put(Message.MESSAGE, Converter.DtoToHashMap(valueOutObject.get(Message.MESSAGE)));
						jsonReturn 				= JsonUtility.convertionToJsonObjectForResponse(valueOutObject);
					} else {
						valueObject.clear();
						valueObject	= MessageUtility.setSuccess(MessageList.VOUCHER_GENERATED_SUCCESSFULLY);
						valueOutObject.put(Message.MESSAGE, Converter.DtoToHashMap(valueObject.get(Message.MESSAGE)));
						jsonReturn 				= JsonUtility.convertionToJsonObjectForResponse(valueOutObject);
					}
					out.println(jsonReturn);
					out.flush();
				} catch (final Exception e) {
					ActionStepsUtil.catchActionException(request, e, error);
				} finally {
					out.close();
					requestJsonDataObject		= null;
					responseJsonObject			= null;
					executive					= null;
					valueObject					= null;
					requestJsonObject			= null;
					fuelHisabSettlementBll		= null;
					valueOutObject				= null;
					jsonReturn					= null;
					out							= null;
				}
			}
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		} finally {
			error	= null;
		}
	}

	private ValueObject getValueObjectFromRequestJson(ValueObject requestJsonDataObject, ValueObject valueObject) throws Exception{
		ValueObject			valueOutObject		= null;
		ValueObject			lhpvDetailsObject	= null;
		ValueObject			ddmDetailsObject	= null;
		ValueObject			collectionObject	= null;
		ValueObject			localObject			= null;
		ValueObject			fuelReceiptObject	= null;
		ValueObject			intLSDetailsObject	= null;
		try {
			valueOutObject	= new ValueObject();
			if (requestJsonDataObject.containsKey("voucherHisabDetails"))
				valueOutObject.put(FuelHisabVoucher.FUEL_HISAB_VOUCHER, JsonUtility.convertJsontoValueObject((JSONObject)requestJsonDataObject.get("voucherHisabDetails")));
			if (requestJsonDataObject.containsKey("lhpvDetails")) {
				lhpvDetailsObject	= JsonUtility.convertJsontoValueObject((JSONObject) requestJsonDataObject.get("lhpvDetails"));
				lhpvDetailsObject	= convertInnerJsonObjectToValueObject(lhpvDetailsObject);
				valueOutObject.put(LHPVFuelHisabDetails.LHPV_FUEL_HISAB_DETAILS, lhpvDetailsObject);

			}
			if (requestJsonDataObject.containsKey("ddmDetails")) {
				ddmDetailsObject	= JsonUtility.convertJsontoValueObject((JSONObject)requestJsonDataObject.get("ddmDetails"));
				ddmDetailsObject	= convertInnerJsonObjectToValueObject(ddmDetailsObject);
				valueOutObject.put(DDMFuelHisabDetails.DDM_FUEL_HISAB_DETAILS, ddmDetailsObject);

			}
			if (requestJsonDataObject.containsKey("collectionDetails")) {
				collectionObject	= JsonUtility.convertJsontoValueObject((JSONObject)requestJsonDataObject.get("collectionDetails"));
				collectionObject	= convertInnerJsonObjectToValueObject(collectionObject);
				valueOutObject.put(CollectionFuelHisabDetails.COLLECTION_FUEL_HISAB_DETAILS, collectionObject);

			}
			if (requestJsonDataObject.containsKey("localDetails")) {
				localObject			= JsonUtility.convertJsontoValueObject((JSONObject)requestJsonDataObject.get("localDetails"));
				localObject			= convertInnerJsonObjectToValueObject(localObject);
				valueOutObject.put(LocalFuelHisabDetails.LOCAL_FUEL_HISAB_DETAILS, localObject);
			}
			if (requestJsonDataObject.containsKey("pendingFuelReceipt")) {
				fuelReceiptObject	= JsonUtility.convertJsontoValueObject((JSONObject)requestJsonDataObject.get("pendingFuelReceipt"));
				fuelReceiptObject	= convertInnerJsonObjectToValueObject(fuelReceiptObject);
				valueOutObject.put(PumpReceipt.PUMP_RECEIPT, fuelReceiptObject);
			}

			if (requestJsonDataObject.containsKey("intLSDetails")) {
				intLSDetailsObject = JsonUtility.convertJsontoValueObject((JSONObject) requestJsonDataObject.get("intLSDetails"));
				intLSDetailsObject = convertInnerJsonObjectToValueObject(intLSDetailsObject);
				valueOutObject.put(InterBranchLSFuelHisabDetails.INT_BRANCH_LS_FUEL_HISAB_DETAILS, intLSDetailsObject);
			}

			return valueOutObject;
		} catch (final Exception e) {
			e.printStackTrace();
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, "error = "+e);
			throw e;
		} finally {
			valueOutObject		= null;
			lhpvDetailsObject	= null;
			ddmDetailsObject	= null;
			collectionObject	= null;
			localObject			= null;
			fuelReceiptObject	= null;
		}
	}

	private ValueObject	convertInnerJsonObjectToValueObject(ValueObject valueObject) throws Exception {
		ValueObject							valueOutObject	= null;
		Iterator<Entry<Object, Object>> 	it				= null;
		Entry<Object, Object> 				pair			= null;
		try {
			valueOutObject	= new ValueObject();
			it = valueObject.getHtData().entrySet().iterator();
			while (it.hasNext()) {
				pair = it.next();
				valueOutObject.put(pair.getKey(), JsonUtility.convertJsontoValueObject((JSONObject)pair.getValue()));
				it.remove(); // avoids a ConcurrentModificationException
			}

			return valueOutObject;
		} catch (final Exception e) {
			e.printStackTrace();
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, "error = "+e);
			throw e;
		} finally {
			valueOutObject	= null;
			it				= null;
			pair			= null;
		}
	}
}
