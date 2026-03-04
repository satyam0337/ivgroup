/**
 *
 */
package com.ivcargo.actions.truckhisabmodule;

import java.io.PrintWriter;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONObject;

import com.businesslogic.truckhisabmodule.PrintReceiptBll;
import com.businesslogic.truckhisabmodule.PumpReceiptBll;
import com.framework.Action;
import com.iv.constant.properties.PumpReceiptConfigurationConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.logsapp.LogWriter;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.ivcargo.utils.JsonUtility;
import com.platform.dto.Branch;
import com.platform.dto.DeliveryRunSheetLedger;
import com.platform.dto.DispatchLedger;
import com.platform.dto.Executive;
import com.platform.dto.LHPV;
import com.platform.dto.VehicleNumberMaster;
import com.platform.dto.WayBill;
import com.platform.dto.truckhisabmodule.PumpReceipt;
import com.platform.dto.truckhisabmodule.PumpReceiptCollectionDetails;
import com.platform.dto.truckhisabmodule.PumpReceiptDDMDetails;
import com.platform.dto.truckhisabmodule.PumpReceiptDetails;
import com.platform.dto.truckhisabmodule.PumpReceiptInterBranchLSDetails;
import com.platform.dto.truckhisabmodule.PumpReceiptKilometerDetails;
import com.platform.dto.truckhisabmodule.PumpReceiptLHPVDetails;
import com.platform.dto.truckhisabmodule.PumpReceiptLocalDetails;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

/**
 * @author Shailesh 04-06-2016
 */
public class PrintReceiptAjaxAction implements Action {

	private static final String TRACE_ID = "PrintReceiptAjaxAction";
	Timestamp 							createDate 						= null;
	/**
	 * Json Action For getting all branches of Deliver and Both type
	 * */
	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {

		HashMap<String,Object>	 						error 		= null;
		// TODO Auto-generated method stub
		PrintWriter										out								= null;
		JSONObject										getJsonObject					= null;
		JSONObject										outJsonObject					= null;
		short											filter							= 0;
		try {

			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			response.setContentType("application/json");
			out = response.getWriter();

			getJsonObject 		= new JSONObject(request.getParameter("json"));
			outJsonObject		= new JSONObject();

			filter					= Utility.getShort(getJsonObject.get("Filter"));

			if(request.getSession().getAttribute("executive") == null) {
				outJsonObject.put("errorDescription", "You have been logged out. Please login again.");
				out.println(outJsonObject);
				return;
			}
			switch (filter) {
			case 1:
				out.println(getLhpvDetailsByLhpvNumber(request, outJsonObject, getJsonObject));
				break;

			case 2:
				out.println(getDDMDetailsByDDMNumber(request, outJsonObject, getJsonObject));
				break;

			case 3:
				out.println(getPetrolPumpName(request, response, outJsonObject, getJsonObject));
				break;

			case 4:
				out.println(getLRDetails(request, response, outJsonObject, getJsonObject));
				break;
			case 5:
				out.println(generatePumpReceipt (request, response, outJsonObject, getJsonObject));
				break;
			case 6:
				out.println(getLRDetails(request, response, outJsonObject, getJsonObject));
				break;
			case 7:
				out.println(getPumpReceiptDetailsForPrint (request, outJsonObject, getJsonObject));
				break;
			case 8:
				out.println(getLastPumpReceiptDetails(request, outJsonObject, getJsonObject));
				break;
			case 9:
				out.println(getLastLHPVDetails(request, outJsonObject, getJsonObject));
				break;
			case 10:
				out.println(getInterBranchLSDetails(request, outJsonObject, getJsonObject));
				break;
			default:
				outJsonObject.put("errorDescription", "You have been logged out. Please login again.");
				out.println(outJsonObject);
				break;
			}


		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		} finally {
			out.flush();
			out.close();
			out						= null;
			getJsonObject			= null;
			outJsonObject			= null;

		}
	}

	/**
	 * Get Driver details
	 * */
	private JSONObject getLhpvDetailsByLhpvNumber(final HttpServletRequest request, final JSONObject outJsonObject, final JSONObject getJsonObject) throws Exception {
		// TODO Auto-generated method stub
		ValueObject										valueObjectToBLL				= null;
		PrintReceiptBll									printReceiptBll					= null;
		Executive										executive						= null;
		ValueObject										valueObjectFromBLL				= null;
		LHPV											lhpv							= null;
		var											showAllVehicleData				= false;
		var											manualLHPVNumber				= false;

		try{

			valueObjectToBLL	= new ValueObject();
			final var	cache						= new CacheManip(request);
			executive		= cache.getExecutive(request);
			valueObjectToBLL.put("executiveId", executive.getExecutiveId());
			valueObjectToBLL.put("executive", executive);
			valueObjectToBLL.put("accountGroupId", executive.getAccountGroupId());

			if(getJsonObject.get("LhpvNumber") != null && Utility.getLong(getJsonObject.get("LhpvNumber")) > 0)
				valueObjectToBLL.put("LhpvNumber", getJsonObject.get("LhpvNumber")+"");

			if(getJsonObject.get("VehicleId") != null && Utility.getLong(getJsonObject.get("VehicleId")) > 0)
				valueObjectToBLL.put("VehicleId", getJsonObject.get("VehicleId")+"");

			final var	pumpReceiptConf				= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.PUMP_RECEIPT);
			showAllVehicleData			= (Boolean) pumpReceiptConf.getOrDefault(PumpReceiptConfigurationConstant.SHOW_ALL_VEHICLE_DATA, false);
			manualLHPVNumber			= (Boolean) pumpReceiptConf.getOrDefault(PumpReceiptConfigurationConstant.MANUAL_LHPV_NUMBER, false);

			valueObjectToBLL.put("showAllVehicleData", showAllVehicleData);

			printReceiptBll			= new PrintReceiptBll();
			valueObjectFromBLL		= printReceiptBll.getLhpvDetialsByLhpvNumber(valueObjectToBLL);

			if(valueObjectFromBLL == null) {
				request.setAttribute("nextPageToken", "failure");
				outJsonObject.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);

				return outJsonObject;
			}
			if(valueObjectFromBLL.get("errorDescription") != null){
				request.setAttribute("nextPageToken", "failure");
				outJsonObject.put("errorDescription", valueObjectFromBLL.getString("errorDescription",CargoErrorList.REPORT_ERROR_DESCRIPTION));
				return outJsonObject;
			}

			lhpv		  = (LHPV)valueObjectFromBLL.get("lhpv");
			final var distance =  valueObjectFromBLL.getLong("distance",0);
			if( lhpv == null){
				request.setAttribute("nextPageToken", "failure");
				outJsonObject.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				return outJsonObject;
			}
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_DEBUG, "@@getlHPVBranchId "+lhpv.getlHPVBranchId());
			lhpv.setlHPVBranchId(lhpv.getlHPVBranchId());

			outJsonObject.put("lhpvDto", new JSONObject(lhpv));
			outJsonObject.put("manualLHPVNumber", manualLHPVNumber);
			if(!showAllVehicleData)
				outJsonObject.put("distance", distance);

			return 	outJsonObject;
		}catch(final Exception e){
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR,e);
			throw e;
		}finally {
			valueObjectToBLL				= null;
			printReceiptBll					= null;
			executive						= null;
			valueObjectFromBLL				= null;
			lhpv							= null;
		}
	}


	/**
	 * Get Driver details
	 * */

	private JSONObject getDDMDetailsByDDMNumber(final HttpServletRequest request, final JSONObject outJsonObject, final JSONObject getJsonObject) throws Exception {
		// TODO Auto-generated method stub
		ValueObject										valueObjectToBLL				= null;
		PrintReceiptBll									printReceiptBll					= null;
		Executive										executive						= null;
		ValueObject										valueObjectFromBLL				= null;
		String											number							= null;
		var 											branchId						= 0L;
		CacheManip										cache							= null;
		var											manualDDMNumber					= false;
		DeliveryRunSheetLedger							deliveryRunSheetLedger			= null;

		try{

			valueObjectToBLL	= new ValueObject();
			cache				= new CacheManip(request);
			executive			= (Executive) request.getSession().getAttribute("executive");
			valueObjectToBLL.put("executiveId", executive.getExecutiveId());
			valueObjectToBLL.put("executive", executive);
			valueObjectToBLL.put("accountGroupId", executive.getAccountGroupId());
			valueObjectToBLL.put("genericBranch", cache.getGenericBranchesDetail(request));
			valueObjectToBLL.put("genericSubRegion", cache.getSubRegionsByGroupId(request, executive.getAccountGroupId()));

			if(getJsonObject.get("DDMNumber") != null && Utility.getLong(getJsonObject.get("DDMNumber")) > 0){
				number = getJsonObject.get("DDMNumber")+"";
				valueObjectToBLL.put("number", number);
			}
			if(getJsonObject.get("DDMBRANCHID") != null && Utility.getLong(getJsonObject.get("DDMBRANCHID")) > 0){
				branchId = Utility.getLong(getJsonObject.get("DDMBRANCHID"));
				valueObjectToBLL.put("branchId", branchId);
			}
			if(getJsonObject.get("VehicleId") != null && Utility.getLong(getJsonObject.get("VehicleId")) > 0)
				valueObjectToBLL.put("VehicleId", getJsonObject.get("VehicleId")+"");

			final var	pumpReceiptConf				= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.PUMP_RECEIPT);
			manualDDMNumber				= (Boolean) pumpReceiptConf.getOrDefault(PumpReceiptConfigurationConstant.MANUAL_DDM_NUMBER, false);

			printReceiptBll			= new PrintReceiptBll();

			valueObjectFromBLL	= printReceiptBll.getDDMDetialsByDDMNumber(valueObjectToBLL);

			if(valueObjectFromBLL == null) {
				request.setAttribute("nextPageToken", "failure");
				outJsonObject.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);

				return outJsonObject;
			}
			if(valueObjectFromBLL.get("errorDescription") != null){
				request.setAttribute("nextPageToken", "failure");
				outJsonObject.put("errorDescription", valueObjectFromBLL.getString("errorDescription",CargoErrorList.REPORT_ERROR_DESCRIPTION));
				return outJsonObject;
			}

			deliveryRunSheetLedger	= (DeliveryRunSheetLedger) valueObjectFromBLL.get("deliveryRunSheetLedger");

			if(deliveryRunSheetLedger == null) {
				request.setAttribute("nextPageToken", "failure");
				outJsonObject.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				return outJsonObject;
			}
			if(valueObjectFromBLL.get("errorDescription") != null){
				request.setAttribute("nextPageToken", "failure");
				outJsonObject.put("errorDescription", valueObjectFromBLL.getString("errorDescription",CargoErrorList.REPORT_ERROR_DESCRIPTION));
				return outJsonObject;
			}

			//dispatchReport			= (DispatchLedger)valueObjectFromBLL.get("dispatchReport");
			final var distance   	=  valueObjectFromBLL.getLong("distance",0);

			/*
			 * if( dispatchReport == null){ request.setAttribute("nextPageToken",
			 * "failure"); outJsonObject.put("errorDescription",
			 * CargoErrorList.REPORT_ERROR_DESCRIPTION); return outJsonObject; }
			 */

			//outJsonObject.put("dispatchReportDto", new JSONObject(dispatchReport));
			outJsonObject.put("deliveryRunSheetLedgerDto", new JSONObject(deliveryRunSheetLedger));
			outJsonObject.put("manualDDMNumber", manualDDMNumber);
			if(!manualDDMNumber)
				outJsonObject.put("distance", distance);

			return 	outJsonObject;
		}catch(final Exception e){
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR,e);
			throw e;
		}finally {

		}
	}

	/**
	 *
	 * @param request
	 * @param response
	 * @param outJsonObject
	 * @param getJsonObject
	 * @return
	 * @throws Exception
	 */

	private JSONObject getPetrolPumpName(final HttpServletRequest request, final HttpServletResponse response,
			JSONObject outJsonObject, final JSONObject getJsonObject) throws Exception {
		// TODO Auto-generated method stub
		ValueObject										valueObjectToBLL				= null;
		PrintReceiptBll									printReceiptBll					= null;
		Executive										executive						= null;
		ValueObject										valueObjectFromBLL				= null;

		try{

			valueObjectToBLL	= new ValueObject();

			executive		= (Executive) request.getSession().getAttribute("executive");
			valueObjectToBLL.put("executiveId", executive.getExecutiveId());
			valueObjectToBLL.put("executive", executive);
			valueObjectToBLL.put("accountGroupId", executive.getAccountGroupId());

			printReceiptBll			= new PrintReceiptBll();

			valueObjectFromBLL	= printReceiptBll.getDriverDetails(valueObjectToBLL);

			if(valueObjectFromBLL == null) {
				request.setAttribute("nextPageToken", "failure");
				outJsonObject.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);

				return outJsonObject;
			}
			return JsonUtility.convertionToJsonObjectForResponse(valueObjectFromBLL);
		}catch(final Exception e){
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR,e);
			throw e;
		}finally {

		}
	}

	/**
	 *
	 * @param request
	 * @param response
	 * @param outJsonObject
	 * @param getJsonObject
	 * @return
	 * @throws Exception
	 */


	private JSONObject getLRDetails(final HttpServletRequest request, final HttpServletResponse response,
			final JSONObject outJsonObject, final JSONObject getJsonObject) throws Exception {
		// TODO Auto-generated method stub
		ValueObject										valueObjectToBLL				= null;
		PrintReceiptBll									printReceiptBll					= null;
		Executive										executive						= null;
		ValueObject										valueObjectFromBLL				= null;
		String											lrnumber						= null;
		WayBill											wayBill							= null;
		var											manualLRNumber					= false;

		try{

			valueObjectToBLL	= new ValueObject();

			final var	cache						= new CacheManip(request);
			executive		= cache.getExecutive(request);
			valueObjectToBLL.put("executiveId", executive.getExecutiveId());
			valueObjectToBLL.put("executive", executive);
			valueObjectToBLL.put("accountGroupId", executive.getAccountGroupId());

			if(getJsonObject.get("LRNumber") != null && Utility.getLong(getJsonObject.get("LRNumber")) > 0){
				lrnumber = getJsonObject.get("LRNumber")+"";
				valueObjectToBLL.put("lrnumber", lrnumber);
			}

			final var	pumpReceiptConf				= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.PUMP_RECEIPT);
			manualLRNumber				= (Boolean) pumpReceiptConf.getOrDefault(PumpReceiptConfigurationConstant.MANUAL_LR_NUMBER, false);

			printReceiptBll			= new PrintReceiptBll();

			valueObjectFromBLL	= printReceiptBll.getLRDetialsByLrNumber(valueObjectToBLL);

			if(valueObjectFromBLL == null) {
				request.setAttribute("nextPageToken", "failure");
				outJsonObject.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);

				return outJsonObject;
			}
			wayBill	= (WayBill)valueObjectFromBLL.get("wayBill");
			final long distance =  (Long)valueObjectFromBLL.get("distance");
			if( wayBill == null){
				request.setAttribute("nextPageToken", "failure");
				outJsonObject.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				return outJsonObject;
			}

			outJsonObject.put("wayBillDto", new JSONObject(wayBill));
			outJsonObject.put("manualLRNumber", manualLRNumber);
			if(!manualLRNumber)
				outJsonObject.put("distance", distance);

			return 	outJsonObject;
		}catch(final Exception e){
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR,e);
			throw e;
		}finally {

		}
	}

	/**
	 * GeneratePumpReceipt Code Start Here
	 * @param request
	 * @param response
	 * @param outJsonObject
	 * @param getJsonObject
	 * @return
	 * @throws Exception
	 */
	private JSONObject generatePumpReceipt(final HttpServletRequest request, final HttpServletResponse response, JSONObject outJsonObject,
			final JSONObject getJsonObject)throws Exception  {
		ValueObject								valueObjectToBLL 					= null;
		var 									vehicleId							= 0L;
		var 									driverId							= 0L;
		String 									driverName							= null;
		JSONObject    							newJsonObject						= null;
		JSONArray								jsonLHPVArr							= null;
		JSONArray								jsonDDMArr							= null;
		JSONArray								jsonCollectionArr					= null;
		JSONArray								jsonLocationArr						= null;
		JSONArray								jsonPrintReciptArr					= null;
		JSONArray								jsonIntBranchLSArr					= null;
		PumpReceipt								pumpReceipt							= null;
		PumpReceiptDetails						pumpReceiptDetails					= null;
		PumpReceiptLHPVDetails					pumpReceiptLHPVDetails				= null;
		ArrayList<PumpReceiptLHPVDetails>		pumpReceiptLHPVDetailsArraylist		= null;
		PumpReceiptDDMDetails					pumpReceiptDDMDetails				= null;
		PumpReceiptCollectionDetails			pumpReceiptCollectionDetails		= null;
		PumpReceiptInterBranchLSDetails			pumpReceiptInterBranchLSDetails		= null;
		ArrayList<PumpReceiptDDMDetails>		pumpReceiptDDMDetailsArrlist		= null;
		PumpReceiptLocalDetails					pumpReceiptLocalDetails				= null;
		ArrayList<PumpReceiptLocalDetails>		pumpReceiptLocalDetailsArrlist		= null;
		ArrayList<PumpReceipt>					PumpReceiptArrlist					= null;
		ArrayList<PumpReceiptCollectionDetails>	pumpReceiptCollectionDetailsArrlist	= null;
		List<PumpReceiptInterBranchLSDetails>	pumpReceiptIntBrchLSDetailsArrlist	= null;
		Executive								executive							= null;
		PumpReceiptBll							pumpReceiptBll						= null;
		ValueObject								valueObjFromBLL						= null;
		Timestamp								settlementDate						= null;
		CacheManip       						cache								= null;
		Branch									branch								= null;
		VehicleNumberMaster						vehicle								= null;
		String									fromLocation						= null;
		String									toLocation							= null;
		PumpReceiptKilometerDetails				pumpReceiptKilometerDetails			= null;
		@SuppressWarnings("rawtypes")
		final
		var 					error 								= (HashMap) request.getAttribute("error");
		var									lorryHireDetailsRouteBy				= false;
		var									showOpeningClosingKM				= false;

		try{
			valueObjectToBLL 					= new ValueObject();
			executive							= (Executive) request.getSession().getAttribute("executive");
			pumpReceiptLHPVDetailsArraylist		= new ArrayList<>();
			pumpReceiptDDMDetailsArrlist		= new ArrayList<>();
			pumpReceiptCollectionDetailsArrlist	= new ArrayList<>();
			pumpReceiptLocalDetailsArrlist		= new ArrayList<>();
			pumpReceiptIntBrchLSDetailsArrlist	= new ArrayList<>();
			pumpReceiptDetails					= new PumpReceiptDetails();
			PumpReceiptArrlist					= new ArrayList<>();
			pumpReceipt							= new PumpReceipt();
			pumpReceiptBll						= new PumpReceiptBll();
			valueObjFromBLL						= new ValueObject();
			settlementDate						= new Timestamp(new Date().getTime());
			cache								= new CacheManip(request);
			pumpReceiptKilometerDetails			= new PumpReceiptKilometerDetails();

			final var	pumpReceiptConf				= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.PUMP_RECEIPT);
			lorryHireDetailsRouteBy		= (Boolean) pumpReceiptConf.getOrDefault(PumpReceiptConfigurationConstant.LORRY_HIRE_DETAILS_ROUTE_BY, false);
			showOpeningClosingKM		= (Boolean) pumpReceiptConf.getOrDefault(PumpReceiptConfigurationConstant.SHOW_OPENING_CLOSING_KM, false);

			valueObjectToBLL.put("executive", executive);

			if(getJsonObject.get("PumpReciptVehicleId") != null){
				valueObjectToBLL.put("PumpReciptVehicleId", Utility.getLong(getJsonObject.get("PumpReciptVehicleId")));
				vehicleId	= Utility.getLong(getJsonObject.get("PumpReciptVehicleId"));
			}
			if(getJsonObject.get("PumpReciptDriverName") != null){
				valueObjectToBLL.put("PumpReciptDriverName", getJsonObject.get("PumpReciptDriverName"));
				driverName	= getJsonObject.get("PumpReciptDriverName")+"";
			}

			driverId	= getJsonObject.optLong("PumpReciptDriverId", 0);

			valueObjectToBLL.put("PumpReciptDriverId", driverId);
			valueObjectToBLL.put("VehicleAverage", getJsonObject.optDouble("VehicleAverage", 0));
			valueObjectToBLL.put("TotalFuel", getJsonObject.optDouble("TotalFuel", 0));
			valueObjectToBLL.put("TotalKilometer", getJsonObject.optDouble("TotalKilometer", 0));
			valueObjectToBLL.put("Odometer", getJsonObject.optDouble("Odometer", 0));
			valueObjectToBLL.put("OpeningKilometer", getJsonObject.optDouble("OpeningKilometer", 0));
			valueObjectToBLL.put("OpeningKM", getJsonObject.optDouble("OpeningKM", 0));
			valueObjectToBLL.put("ClosingKM", getJsonObject.optDouble("ClosingKM", 0));
			valueObjectToBLL.put("lorryHireDetailsRouteBy", lorryHireDetailsRouteBy);

			if(getJsonObject.get("LHPVDETAILSARRAY") != null){
				jsonLHPVArr = getJsonObject.getJSONArray("LHPVDETAILSARRAY");

				for(var i = 0; i < jsonLHPVArr.length(); i++) {
					newJsonObject = new JSONObject();
					pumpReceiptLHPVDetails = new PumpReceiptLHPVDetails();
					newJsonObject	= jsonLHPVArr.getJSONObject(i);

					pumpReceiptLHPVDetails.setVehicleId(vehicleId);
					pumpReceiptLHPVDetails.setLhpvId(Utility.getLong(newJsonObject.get("LHPVID")));
					pumpReceiptLHPVDetails.setLhpvNumber(newJsonObject.get("LHPVNumber")+"");
					pumpReceiptLHPVDetails.setKilometer(Utility.getLong(newJsonObject.get("KILOMETER")));
					pumpReceiptLHPVDetails.setRemark(newJsonObject.get("REMARKS")+"");
					pumpReceiptLHPVDetails.setMarkForDelete(false);

					pumpReceiptLHPVDetailsArraylist.add(pumpReceiptLHPVDetails);
				}
			}

			if(getJsonObject.get("DDMDETAILSARRAY") != null){
				jsonDDMArr = getJsonObject.getJSONArray("DDMDETAILSARRAY");

				for(var i = 0; i < jsonDDMArr.length(); i++) {
					newJsonObject = new JSONObject();
					newJsonObject	= jsonDDMArr.getJSONObject(i);

					pumpReceiptDDMDetails = new PumpReceiptDDMDetails();
					pumpReceiptDDMDetails.setVehicleId(vehicleId);
					pumpReceiptDDMDetails.setDDMId(Utility.getLong(newJsonObject.get("DDMID")));
					pumpReceiptDDMDetails.setDdmNumber(newJsonObject.get("DDMNumber")+"");
					pumpReceiptDDMDetails.setKilometer(Utility.getLong(newJsonObject.get("KILOMETER")));
					pumpReceiptDDMDetails.setRemark(newJsonObject.get("REMARKS")+"");
					pumpReceiptDDMDetails.setMarkForDelete(false);

					pumpReceiptDDMDetailsArrlist.add(pumpReceiptDDMDetails);
				}
			}

			if(getJsonObject.get("COLLECTIONDETAILSARRAY") != null){
				jsonCollectionArr = getJsonObject.getJSONArray("COLLECTIONDETAILSARRAY");

				for(var i = 0; i < jsonCollectionArr.length(); i++) {
					newJsonObject = new JSONObject();
					newJsonObject	= jsonCollectionArr.getJSONObject(i);

					pumpReceiptCollectionDetails = new PumpReceiptCollectionDetails();
					pumpReceiptCollectionDetails.setVehicleId(vehicleId);
					pumpReceiptCollectionDetails.setWayBillId(Utility.getLong(newJsonObject.get("COLLECTIONID")));
					pumpReceiptCollectionDetails.setKilometer(Utility.getLong(newJsonObject.get("KILOMETER")));
					pumpReceiptCollectionDetails.setRemark(newJsonObject.get("REMARKS")+"");
					pumpReceiptCollectionDetails.setMarkForDelete(false);

					pumpReceiptCollectionDetailsArrlist.add(pumpReceiptCollectionDetails);
				}
			}

			if(getJsonObject.get("LOCATIONDETAILSARRAY") != null) {
				jsonLocationArr = getJsonObject.getJSONArray("LOCATIONDETAILSARRAY");

				for(var i = 0; i < jsonLocationArr.length(); i++) {
					newJsonObject = new JSONObject();
					newJsonObject	= jsonLocationArr.getJSONObject(i);

					fromLocation = newJsonObject.get("FromLocation")+"";
					toLocation   = newJsonObject.get("ToLocation")+"";

					pumpReceiptLocalDetails = new PumpReceiptLocalDetails();
					pumpReceiptLocalDetails.setFromLocation(fromLocation.toUpperCase());
					pumpReceiptLocalDetails.setToLocation(toLocation.toUpperCase());
					pumpReceiptLocalDetails.setKilometer(Utility.getLong(newJsonObject.get("KILOMETER")));
					pumpReceiptLocalDetails.setRemark(newJsonObject.get("REMARKS")+"");

					pumpReceiptLocalDetailsArrlist.add(pumpReceiptLocalDetails);
				}
			}

			if(getJsonObject.get("INTBRANCHLSDETAILSARRAY") != null) {
				jsonIntBranchLSArr	= getJsonObject.getJSONArray("INTBRANCHLSDETAILSARRAY");

				for(var i = 0; i < jsonIntBranchLSArr.length(); i++) {
					newJsonObject 					= new JSONObject();
					newJsonObject					= jsonIntBranchLSArr.getJSONObject(i);
					pumpReceiptInterBranchLSDetails	= new PumpReceiptInterBranchLSDetails();

					pumpReceiptInterBranchLSDetails.setVehicleId(vehicleId);
					pumpReceiptInterBranchLSDetails.setInterBranchLSId(Utility.getLong(newJsonObject.get("InterBranchLSID")));
					pumpReceiptInterBranchLSDetails.setInterBranchLSNumber(newJsonObject.get("InterBranchLSNo")+"");
					pumpReceiptInterBranchLSDetails.setKilometer(Utility.getLong(newJsonObject.get("KILOMETER")));
					pumpReceiptInterBranchLSDetails.setRemark(newJsonObject.get("REMARKS")+"");
					pumpReceiptInterBranchLSDetails.setMarkForDelete(false);

					pumpReceiptIntBrchLSDetailsArrlist.add(pumpReceiptInterBranchLSDetails);

				}
			}

			if(pumpReceiptLHPVDetailsArraylist != null || !pumpReceiptLHPVDetailsArraylist.isEmpty())
				valueObjectToBLL.put("pumpReceiptLHPVDetailsArraylist", pumpReceiptLHPVDetailsArraylist);

			if(pumpReceiptDDMDetailsArrlist != null || !pumpReceiptDDMDetailsArrlist.isEmpty())
				valueObjectToBLL.put("pumpReceiptDDMDetailsArrlist", pumpReceiptDDMDetailsArrlist);

			if(pumpReceiptCollectionDetailsArrlist != null || !pumpReceiptCollectionDetailsArrlist.isEmpty())
				valueObjectToBLL.put("pumpReceiptCollectionDetailsArrlist", pumpReceiptCollectionDetailsArrlist);

			if(pumpReceiptLocalDetailsArrlist != null || !pumpReceiptLocalDetailsArrlist.isEmpty())
				valueObjectToBLL.put("pumpReceiptLocalDetailsArrlist", pumpReceiptLocalDetailsArrlist);

			if(pumpReceiptIntBrchLSDetailsArrlist != null || !pumpReceiptIntBrchLSDetailsArrlist.isEmpty())
				valueObjectToBLL.put("pumpReceiptIntBrchLSDetailsArrlist", pumpReceiptIntBrchLSDetailsArrlist);

			setPumpReceiptDetails(pumpReceiptDetails,valueObjectToBLL,executive, showOpeningClosingKM);

			if(pumpReceiptDetails != null)
				valueObjectToBLL.put("pumpReceiptDetails", pumpReceiptDetails);

			setPumpReceiptKilometerDetails(pumpReceiptKilometerDetails,valueObjectToBLL,executive);

			if(pumpReceiptKilometerDetails != null)
				valueObjectToBLL.put("pumpReceiptKilometerDetails", pumpReceiptKilometerDetails);

			if(getJsonObject.get("PUMPRECIPTINSERTARRAY") != null){
				jsonPrintReciptArr = getJsonObject.getJSONArray("PUMPRECIPTINSERTARRAY");

				for(var i = 0; i < jsonPrintReciptArr.length(); i++) {
					newJsonObject = new JSONObject();
					newJsonObject	= jsonPrintReciptArr.getJSONObject(i);
					pumpReceipt = new PumpReceipt();
					pumpReceipt.setVehicleId(vehicleId);
					pumpReceipt.setDriverId(driverId);
					pumpReceipt.setFuelPumpId(Utility.getLong(newJsonObject.get("PumpNamesId")));
					//	pumpReceipt.setFuelToFillUp(Utility.getLong(newJsonObject.get("FuelToFillUp")));
					//pumpReceipt.setFuelUnitRate(Utility.getLong(newJsonObject.get("FuelUnitRate")));
					//	pumpReceipt.setFuelTotalRate(Utility.getLong(newJsonObject.get("FuelTotalRate")));
					pumpReceipt.setFuelToFillUp(Utility.getDouble(newJsonObject.get("FuelToFillUp")));
					pumpReceipt.setFuelUnitRate(Utility.getDouble(newJsonObject.get("FuelUnitRate")));
					pumpReceipt.setFuelTotalRate(Utility.getDouble(newJsonObject.get("FuelTotalRate")));
					pumpReceipt.setRemark(newJsonObject.get("Remark")+"");
					pumpReceipt.setCreateDateTime(settlementDate);
					pumpReceipt.setExecutiveId(executive.getExecutiveId());
					pumpReceipt.setBranachId(executive.getBranchId());
					pumpReceipt.setAccountGroupId(executive.getAccountGroupId());
					pumpReceipt.setMarkForDelete(false);
					branch = cache.getBranchById(request, executive.getAccountGroupId(), executive.getBranchId());
					pumpReceipt.setBranchName(branch.getName());
					pumpReceipt.setPumpName(newJsonObject.get("PumpName")+"");
					pumpReceipt.setDriverName(driverName);
					pumpReceipt.setExecutiveName(executive.getName());

					PumpReceiptArrlist.add(pumpReceipt);
				}
			}
			if(PumpReceiptArrlist != null || !PumpReceiptArrlist.isEmpty())
				valueObjectToBLL.put("PumpReceiptArrlist", PumpReceiptArrlist);

			valueObjectToBLL.put("genericBranch", cache.getGenericBranchesDetail(request));

			vehicle 	= cache.getVehicleNumber(request, executive.getAccountGroupId(), vehicleId);
			valueObjectToBLL.put("vehicle",vehicle);

			valueObjFromBLL	= pumpReceiptBll.processGeneratePumpReceipt(valueObjectToBLL);

			if(valueObjFromBLL == null) {
				request.setAttribute("nextPageToken", "failure");
				outJsonObject.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO, "jsonObjectPut = "+outJsonObject);
				return outJsonObject;
			}
			outJsonObject = JsonUtility.convertionToJsonObjectForResponse(valueObjFromBLL);

			if(Utility.getBoolean(valueObjFromBLL.get("sucess")))
				outJsonObject.put("Sucess", "Sucess");
			return outJsonObject;
		}catch(final Exception e){
			e.printStackTrace();
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR,e);
			//	error.put("errorCode", CargoErrorList.SYSTEM_ERROR);
			//error.put("errorDescription", CargoErrorList.SYSTEM_ERROR_DESCRIPTION);
			request.setAttribute("cargoError", error);
			request.setAttribute("nextPageToken", "failure");
			request.setAttribute("nextPageToken", "failure");
			outJsonObject.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO, "jsonObjectPut = "+outJsonObject);
			return outJsonObject;
		}finally {
			valueObjectToBLL 					= null;
			vehicleId							= 0;
			driverId							= 0;
			driverName							= null;
			newJsonObject						= null;
			jsonLHPVArr							= null;
			jsonDDMArr							= null;
			jsonCollectionArr					= null;
			jsonLocationArr						= null;
			jsonPrintReciptArr					= null;
			pumpReceipt							= null;
			pumpReceiptDetails					= null;
			pumpReceiptLHPVDetails				= null;
			pumpReceiptLHPVDetailsArraylist		= null;
			pumpReceiptDDMDetails				= null;
			pumpReceiptCollectionDetails		= null;
			pumpReceiptDDMDetailsArrlist		= null;
			pumpReceiptInterBranchLSDetails		= null;
			pumpReceiptIntBrchLSDetailsArrlist	= null;
			pumpReceiptLocalDetails				= null;
			pumpReceiptLocalDetailsArrlist		= null;
			PumpReceiptArrlist					= null;
			pumpReceiptCollectionDetailsArrlist	= null;
			executive							= null;
			pumpReceiptBll						= null;
			valueObjFromBLL						= null;
			settlementDate						= null;
			cache								= null;
			branch								= null;
		}
	}

	private void setPumpReceiptDetails(final PumpReceiptDetails pumpReceiptDetails, final ValueObject valueObjectToBLL, final Executive exception,
			final boolean showOpeningClosingKM) throws Exception {
		// TODO Auto-generated method stub
		try{
			pumpReceiptDetails.setVehicleId(Utility.getLong(valueObjectToBLL.get("PumpReciptVehicleId")));
			pumpReceiptDetails.setDriverId(Utility.getLong(valueObjectToBLL.get("PumpReciptDriverId")));
			pumpReceiptDetails.setVehicleAverage(Utility.getDouble(valueObjectToBLL.get("VehicleAverage")));
			pumpReceiptDetails.setTotalFuel(Utility.getDouble(valueObjectToBLL.get("TotalFuel")));
			pumpReceiptDetails.setTotalKilometer(Utility.getDouble(valueObjectToBLL.get("TotalKilometer")));
			pumpReceiptDetails.setExecutuiveId(exception.getExecutiveId());
			pumpReceiptDetails.setBranachId(exception.getBranchId());
			pumpReceiptDetails.setAccountGroupId(exception.getAccountGroupId());
			pumpReceiptDetails.setMarkForDelete(false);
			if(showOpeningClosingKM) {
				pumpReceiptDetails.setOpeningKilometer(Utility.getDouble(valueObjectToBLL.get("OpeningKM")));
				pumpReceiptDetails.setCurrentKilometer(Utility.getDouble(valueObjectToBLL.get("ClosingKM")));
			} else {
				pumpReceiptDetails.setOpeningKilometer(Utility.getDouble(valueObjectToBLL.get("OpeningKilometer")));
				pumpReceiptDetails.setCurrentKilometer(Utility.getDouble(valueObjectToBLL.get("Odometer")));
			}

		}catch(final Exception e){
			throw e;
		}
	}

	private void setPumpReceiptKilometerDetails(final PumpReceiptKilometerDetails pumpReceiptKilometerDetails, final ValueObject valueObjectToBLL, final Executive executive) throws Exception {
		// TODO Auto-generated method stub
		try{
			pumpReceiptKilometerDetails.setVehicleNumberMasterId(Utility.getLong(valueObjectToBLL.get("PumpReciptVehicleId")));
			pumpReceiptKilometerDetails.setAccountGroupId(executive.getAccountGroupId());
			pumpReceiptKilometerDetails.setLastUpdateDateTime(new Timestamp(new Date().getTime()));
			pumpReceiptKilometerDetails.setCurrentKilometer(Utility.getDouble(valueObjectToBLL.get("Odometer")));

		}catch(final Exception e){
			throw e;
		}
	}

	/**@author owner
	 * Method to get data for Pump Receipt print
	 * @param pump receipt id
	 **/

	private JSONObject getPumpReceiptDetailsForPrint(final HttpServletRequest request, JSONObject outJsonObject,
			final JSONObject getJsonObject) throws Exception {
		// TODO Auto-generated method stub
		ValueObject 						valueObjectToBLL 				= null;
		ValueObject 						valueObjFromBLL 				= null;
		Executive							executive						= null;
		PumpReceiptBll						pumpReceiptBll					= null;
		var								showAllVehicleData				= false;
		var								lorryHireDetailsRouteBy			= false;

		try{

			valueObjectToBLL			= 	 new  ValueObject();
			pumpReceiptBll				= 	 new  PumpReceiptBll();
			final var	cache						= new CacheManip(request);
			executive					= cache.getExecutive(request);
			final var	pumpReceiptConf				= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.PUMP_RECEIPT);
			showAllVehicleData			= (Boolean) pumpReceiptConf.getOrDefault(PumpReceiptConfigurationConstant.SHOW_ALL_VEHICLE_DATA, false);
			lorryHireDetailsRouteBy		= (Boolean) pumpReceiptConf.getOrDefault(PumpReceiptConfigurationConstant.LORRY_HIRE_DETAILS_ROUTE_BY, false);

			valueObjectToBLL.put("pumpReceiptId", Utility.getLong(getJsonObject.get("pumpReceiptId")));
			valueObjectToBLL.put("pumpReceiptDetailsId", Utility.getLong(getJsonObject.get("pumpReceiptDetailsId")));
			valueObjectToBLL.put("executive", executive);
			valueObjectToBLL.put("genericBranch", cache.getGenericBranchesDetail(request));
			valueObjectToBLL.put("showAllVehicleData", showAllVehicleData);
			valueObjectToBLL.put("lorryHireDetailsRouteBy", lorryHireDetailsRouteBy);
			valueObjFromBLL = pumpReceiptBll.getPumpReceiptDataForPrint(valueObjectToBLL);

			if(valueObjFromBLL == null) {
				request.setAttribute("nextPageToken", "failure");
				outJsonObject.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				return outJsonObject;
			}

			return JsonUtility.convertionToJsonObjectForResponse(valueObjFromBLL);
		}catch(final Exception e){
			throw e;
		}
	}

	/**@author owner
	 * Method to get data for Pump Receipt print
	 * @param pump receipt id
	 **/

	private JSONObject getLastPumpReceiptDetails(final HttpServletRequest request, final JSONObject outJsonObject,
			final JSONObject getJsonObject) throws Exception {
		// TODO Auto-generated method stub
		ValueObject 						valueObjectToBLL 				= null;
		Executive							executive						= null;
		PumpReceiptBll						pumpReceiptBll					= null;
		PumpReceipt							pumpReceipt						= null;
		CacheManip							cache							= null;
		VehicleNumberMaster					vehicleNumberMaster				= null;
		var								vehicleNumberId					= 0L;

		try{

			valueObjectToBLL		= 	 new  ValueObject();
			pumpReceiptBll			= 	 new  PumpReceiptBll();
			executive				=    (Executive) request.getSession().getAttribute("executive");
			cache					= 	 new CacheManip(request);
			vehicleNumberId 		= 	 Utility.getLong(getJsonObject.get("VEHICLEID"));
			vehicleNumberMaster    =    cache.getVehicleNumber(request, executive.getAccountGroupId(), vehicleNumberId);

			valueObjectToBLL.put("vehicleid", Utility.getLong(getJsonObject.get("VEHICLEID")));
			valueObjectToBLL.put("executive", executive);
			valueObjectToBLL.put("vehicleNumberMaster", vehicleNumberMaster);

			pumpReceipt	= pumpReceiptBll.getLastPumpReceiptDetailsByVehicleId(valueObjectToBLL);

			if(pumpReceipt == null) {
				request.setAttribute("nextPageToken", "failure");
				outJsonObject.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				return outJsonObject;
			}

			outJsonObject.put("pumpReceipt", new JSONObject(pumpReceipt));
			return outJsonObject;
		}catch(final Exception e){
			throw e;
		}
	}

	private JSONObject getLastLHPVDetails(final HttpServletRequest request, final JSONObject outJsonObject,
			final JSONObject getJsonObject) throws Exception {
		// TODO Auto-generated method stub
		ValueObject										valueObjectToBLL				= null;
		PrintReceiptBll									printReceiptBll					= null;
		Executive										executive						= null;
		ValueObject										valueObjectFromBLL				= null;
		LHPV											lhpv							= null;
		try{

			valueObjectToBLL	= new ValueObject();

			executive		= (Executive) request.getSession().getAttribute("executive");
			valueObjectToBLL.put("executiveId", executive.getExecutiveId());
			valueObjectToBLL.put("executive", executive);
			valueObjectToBLL.put("accountGroupId", executive.getAccountGroupId());

			if(getJsonObject.get("VehicleId") != null && Utility.getLong(getJsonObject.get("VehicleId")) > 0)
				valueObjectToBLL.put("VehicleId", getJsonObject.get("VehicleId")+"");
			printReceiptBll			= new PrintReceiptBll();
			valueObjectFromBLL		= printReceiptBll.getLastLHPVDetails(valueObjectToBLL);

			if(valueObjectFromBLL == null) {
				request.setAttribute("nextPageToken", "failure");
				outJsonObject.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);

				return outJsonObject;
			}
			if(valueObjectFromBLL.get("errorDescription") != null){
				request.setAttribute("nextPageToken", "failure");
				outJsonObject.put("errorDescription", valueObjectFromBLL.getString("errorDescription",CargoErrorList.REPORT_ERROR_DESCRIPTION));
				return outJsonObject;
			}

			lhpv		  = (LHPV)valueObjectFromBLL.get("lhpv");
			final var distance =  valueObjectFromBLL.getLong("distance",0);
			if( lhpv == null){
				request.setAttribute("nextPageToken", "failure");
				outJsonObject.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				return outJsonObject;
			}
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_DEBUG, "@@getlHPVBranchId "+lhpv.getlHPVBranchId());
			lhpv.setlHPVBranchId(lhpv.getlHPVBranchId());
			outJsonObject.put("lhpvDto", new JSONObject(lhpv));
			outJsonObject.put("distance", distance);

			return 	outJsonObject;
		}catch(final Exception e){
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR,e);
			throw e;
		}finally {
			valueObjectToBLL				= null;
			printReceiptBll					= null;
			executive						= null;
			valueObjectFromBLL				= null;
			lhpv							= null;
		}
	}

	private JSONObject getInterBranchLSDetails(final HttpServletRequest request, final JSONObject outJsonObject,
			final JSONObject getJsonObject) throws Exception {

		ValueObject										valueObjectToBLL				= null;
		Executive										executive						= null;
		PrintReceiptBll									printReceiptBll					= null;
		ValueObject										valueObjectFromBLL				= null;
		DispatchLedger									dispatchLedger					= null;
		CacheManip										cache							= null;
		var											manualIntBranchLSNumber			= false;
		try{

			valueObjectToBLL	= new ValueObject();
			cache				= new CacheManip(request);

			executive		= (Executive) request.getSession().getAttribute("executive");
			valueObjectToBLL.put("executive", executive);
			valueObjectToBLL.put("genericBranch", cache.getGenericBranchesDetail(request));


			if(getJsonObject.get("InterBranchLSNo") != null && Utility.getLong(getJsonObject.get("InterBranchLSNo")) > 0)
				valueObjectToBLL.put("InterBranchLSNo", getJsonObject.get("InterBranchLSNo")+"");

			if(getJsonObject.get("VehicleId") != null && Utility.getLong(getJsonObject.get("VehicleId")) > 0)
				valueObjectToBLL.put("VehicleId", getJsonObject.get("VehicleId")+"");

			final var	pumpReceiptConf				= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.PUMP_RECEIPT);
			manualIntBranchLSNumber		= (Boolean) pumpReceiptConf.getOrDefault(PumpReceiptConfigurationConstant.MANUAL_INT_BRANCH_LS_NUMBER, false);

			printReceiptBll			= new PrintReceiptBll();

			valueObjectFromBLL		= printReceiptBll.getInterBranchLSetialsByInterBranchLSNumber(valueObjectToBLL);

			if(valueObjectFromBLL == null) {
				request.setAttribute("nextPageToken", "failure");
				outJsonObject.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);

				return outJsonObject;
			}
			if(valueObjectFromBLL.get("errorDescription") != null){
				request.setAttribute("nextPageToken", "failure");
				outJsonObject.put("errorDescription", valueObjectFromBLL.getString("errorDescription",CargoErrorList.REPORT_ERROR_DESCRIPTION));
				return outJsonObject;
			}

			dispatchLedger	= (DispatchLedger) valueObjectFromBLL.get("dispatchLedger");

			if(dispatchLedger == null) {
				request.setAttribute("nextPageToken", "failure");
				outJsonObject.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				return outJsonObject;
			}

			final var distance   =  valueObjectFromBLL.getLong("distance",0);

			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_DEBUG, "@@dispatchLedger "+new JSONObject(dispatchLedger));

			outJsonObject.put("dispatchLedgerDto", new JSONObject(dispatchLedger));
			outJsonObject.put("manualIntBranchLSNumber", manualIntBranchLSNumber);
			if(!manualIntBranchLSNumber)
				outJsonObject.put("distance", distance);

			return outJsonObject;
		}catch(final Exception e){
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR,e);
			throw e;
		}finally {
			valueObjectToBLL				= null;
			valueObjectFromBLL				= null;
			executive						= null;
		}
	}
}
