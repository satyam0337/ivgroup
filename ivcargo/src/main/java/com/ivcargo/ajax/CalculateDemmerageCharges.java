package com.ivcargo.ajax;

import java.io.PrintWriter;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONException;
import org.json.JSONObject;

import com.businesslogic.DamerageChargeBLL;
import com.framework.Action;
import com.iv.constant.properties.GenerateCashReceiptPropertiesConstant;
import com.iv.logsapp.LogWriter;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.exception.ExceptionProcess;
import com.iv.utils.utility.CollectionUtility;
import com.ivcargo.utils.CacheManip;
import com.ivcargo.utils.JsonUtility;
import com.platform.dao.ConsignmentDetailsDao;
import com.platform.dao.ConsignmentSummaryDao;
import com.platform.dao.GenerateCashReceiptModelDao;
import com.platform.dao.WayBillBookingChargesDao;
import com.platform.dto.ConfigParam;
import com.platform.dto.ConsignmentDetails;
import com.platform.dto.ConsignmentSummary;
import com.platform.dto.DeliveryRateMaster;
import com.platform.dto.Executive;
import com.platform.dto.WayBillBookingCharges;
import com.platform.dto.configuration.modules.GenerateCashReceiptDTO;
import com.platform.dto.model.GenerateCashReceiptModel;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Converter;

public class CalculateDemmerageCharges implements Action {

	private static final String TRACE_ID = "CalculateDemmerageCharges";

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {

		PrintWriter						out							= null;
		JSONObject						jsonObjectIn				= null;
		JSONObject						jsonObjectOut				= null;

		try {

			response.setContentType("application/json"); // Setting response for JSON Content

			out						= response.getWriter();
			jsonObjectOut			= new JSONObject();
			jsonObjectIn			= new JSONObject(request.getParameter("json"));

			if(request.getSession().getAttribute("executive") == null) {
				jsonObjectOut.put("errorDescription", "You have been logged out. Please login again.");
				out.println(jsonObjectOut);
				return;
			}

			out.println(calculateDemmerageCharges(request, jsonObjectIn));

		} catch (final Exception _e) {
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR,_e);
			jsonObjectOut			= new JSONObject();
			try {
				jsonObjectOut.put("errorDescription", CargoErrorList.SYSTEM_ERROR_DESCRIPTION);
			} catch (final JSONException e) {
				LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR,_e);
			}
			out.println(jsonObjectOut);
		} finally {
			out.flush();
			out.close();
			out							= null;
			jsonObjectIn				= null;
			jsonObjectOut				= null;
		}
	}

	@SuppressWarnings("unchecked")
	private JSONObject calculateDemmerageCharges(HttpServletRequest request, JSONObject jsonObjectIn) throws Exception {

		WayBillBookingCharges[]					waybillBookingChgs			= null;
		HashMap<Long, ConsignmentSummary> 		consignmentSumHsmp			= null;
		Timestamp								demurrageFromDate			= null;
		ValueObject 							inValObjDemurrage 			= null;
		ConsignmentDetails[]					consignmnDetArr				= null;
		HashMap<Long, ConsignmentDetails[]>	 	consignmentDet				= null;
		ConsignmentSummary						consSumMod					= null;
		GenerateCashReceiptModel				waybillMod					= null;
		Executive								executive					= null;
		ValueObject								valObjOut					= null;
		ValueObject								valObjIn					= null;
		ValueObject								crConfig					= null;
		CacheManip								cache						= null;
		var									isPendingDeliveryTableEntry	= false;
		var 									damerage 					= 0D;
		var									corporateAccountId			= 0L;
		var									wayBillId					= 0L;
		var									lessFeesDays					= 0L;
		var									chargeableDays					= 0L;
		var									storageDays						= 0L;
		ValueObject 							damerageVal 					= null;
		ValueObject 							finalDamerageVal 				= null;
		short									configTypeId					= 0;
		ArrayList<ConsignmentDetails>			articalRateList							= null;
		ConsignmentSummary						otherRateList							= null;

		try {

			cache						= new CacheManip(request);
			finalDamerageVal			= new ValueObject();
			articalRateList				= new ArrayList<>();
			otherRateList				= new ConsignmentSummary();

			valObjIn			= JsonUtility.convertJsontoValueObject(jsonObjectIn);
			executive			= (Executive) request.getSession().getAttribute("executive");

			crConfig			= cache.getGenerateCRConfiguration(request, executive.getAccountGroupId());

			corporateAccountId	= valObjIn.getLong("corporateAccountId", 0);
			wayBillId			= valObjIn.getLong("waybillId", 0);

			if(cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_PENDING_DELIVERY_STOCK_TABLE_ENTRY) == ConfigParam.CONFIG_KEY_PENDING_DELIVERY_STOCK_TABLE_ENTRY_ALLOWED)
				isPendingDeliveryTableEntry = true;

			if(isPendingDeliveryTableEntry)
				waybillMod = GenerateCashReceiptModelDao.getInstance().getDataForGenerateCashReceiptFromPendingDeliveryStock(executive.getAccountGroupId(), wayBillId);
			else
				waybillMod = GenerateCashReceiptModelDao.getInstance().getDataForGenerateCashReceiptByWayBillId(executive.getAccountGroupId(), wayBillId);

			final var lrTypeList = CollectionUtility.getLongListFromString(crConfig.getString(GenerateCashReceiptPropertiesConstant.LR_TYPES_FOR_DEMURRAGE_CALCULATION, "0"));

			if(waybillMod != null) {
				waybillBookingChgs 	= WayBillBookingChargesDao.getInstance().getWayBillCharges(waybillMod.getWayBillId());
				consignmentDet 		= ConsignmentDetailsDao.getInstance().getConsignmentDetailsArrayByWayBillIds(""+waybillMod.getWayBillId());

				consignmnDetArr = consignmentDet.get(waybillMod.getWayBillId());

				consignmentSumHsmp 	= ConsignmentSummaryDao.getInstance().getLimitedConsignmentDetails(""+waybillMod.getWayBillId());
				consSumMod 		  	= consignmentSumHsmp.get(waybillMod.getWayBillId());

				if(crConfig.getBoolean(GenerateCashReceiptDTO.APPLY_RATE_AUTO, false) && lrTypeList.contains(waybillMod.getWayBillTypeId())) {

					demurrageFromDate = waybillMod.getCreationDateTimeStamp();

					inValObjDemurrage = new ValueObject();
					inValObjDemurrage.put("executive", executive);
					inValObjDemurrage.put("corporateAccountId", corporateAccountId);
					inValObjDemurrage.put("consignment", consignmnDetArr);
					inValObjDemurrage.put("summary", consSumMod);
					inValObjDemurrage.put("wayBillBookingCharges", waybillBookingChgs);
					inValObjDemurrage.put("bookingTotal", waybillMod.getBookingTotal());
					inValObjDemurrage.put("demurrageFromDate", demurrageFromDate);
					inValObjDemurrage.put("status", waybillMod.getStatus());
					inValObjDemurrage.put("wayBillStatusAllowForDemurrage", crConfig.getString(GenerateCashReceiptDTO.WAYBILL_STATUS_ALLOW_FOR_DEMURRAGE_CALCULATION, null));
					inValObjDemurrage.put("minimumBookingAmountForDemurrageCalculation", crConfig.getDouble(GenerateCashReceiptDTO.MINIMUM_BOOKING_TOTAL_FOR_DEMURRAGE_CALCULATION, 0.0));
					inValObjDemurrage.put(GenerateCashReceiptPropertiesConstant.DAMERAGE_APPLICABLE_ON_ACTUAL_WEIGHT, crConfig.getBoolean(GenerateCashReceiptPropertiesConstant.DAMERAGE_APPLICABLE_ON_ACTUAL_WEIGHT,false));

					final var	demurrageBLL 	 = new DamerageChargeBLL();

					damerageVal 		= demurrageBLL.calculateDamerage(inValObjDemurrage);

					if(damerageVal != null) {
						lessFeesDays		= damerageVal.getLong("lessFeesDays",0);
						chargeableDays		= damerageVal.getLong("chargeableDays",0);
						storageDays			= damerageVal.getLong("storageDays",0);
						configTypeId		= damerageVal.getShort("configTypeId",(short)0);
						damerage			= damerageVal.getDouble("demurrageAmount",0.00);

						if(configTypeId == DeliveryRateMaster.CONFIG_TYPE_QUANTITY_ID)
							articalRateList			= (ArrayList<ConsignmentDetails>) damerageVal.get("demurrageAmountList");
						else
							otherRateList			= (ConsignmentSummary) damerageVal.get("demurrageAmountList");
					}

					finalDamerageVal.put("configTypeId", configTypeId);
					finalDamerageVal.put("lessFeesDays", lessFeesDays);
					finalDamerageVal.put("chargeableDays", chargeableDays);
					finalDamerageVal.put("storageDays", storageDays);
					finalDamerageVal.put("damerage", damerage);

					if(articalRateList != null && !articalRateList.isEmpty())
						finalDamerageVal.put("articalRateList", Converter.dtoArrayListtoArrayListWithHashMapConversion(articalRateList));

					if(otherRateList != null)
						finalDamerageVal.put("otherRateList", Converter.DtoToHashMap(otherRateList));
				}
			}

			valObjOut = new ValueObject();
			valObjOut.put("damerage", damerage);
			valObjOut.put("finalDamerageVal", finalDamerageVal);

			return JsonUtility.convertionToJsonObjectForResponse(valObjOut);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}
}
