package com.ivcargo.reports;

import java.io.PrintWriter;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONObject;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.logsapp.LogWriter;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.DispatchLedgerDao;
import com.platform.dao.VehicleAgentMasterDao;
import com.platform.dao.VehicleNumberMasterDao;
import com.platform.dto.City;
import com.platform.dto.DispatchLedger;
import com.platform.dto.Executive;
import com.platform.dto.VehicleAgentMaster;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

public class PendingBLHPVLedgerReportAjaxAction implements Action{

	private static final String TRACE_ID = "PendingBLHPVLedgerReportAjaxAction";

	String 		lhpvId	 				= null;
	long 		accountGropuId	 		= 0;
	Executive 	executive  				= null;

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	 error 	= null;
		CacheManip 		cacheManip	= null;
		StringBuilder 	strBfr 		= null;
		PrintWriter		out			= null;
		String			strQry		= null;
		JSONObject		jObject		= null;
		JSONArray 		jArray		= null;
		Map<Long, List<DispatchLedger>>		dispatchColl			= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;
			response.setContentType("application/json"); // Setting response for JSON Content
			cacheManip		= new CacheManip(request);
			executive	= (Executive) request.getSession().getAttribute("executive");

			strBfr		= new StringBuilder();
			jArray = new JSONArray();

			final short filter = Short.parseShort(request.getParameter("filter"));
			switch (filter) {

			case 1: //Get Crossing Hub Branches

				if(executive != null)
					try {
						strQry = null;
						strBfr = new StringBuilder();
						ArrayList<VehicleAgentMaster> vehicleAgentList = null;
						HashMap<Long, City>     regionCities    = null;
						HashMap<Long, City>     subRegionCities = null;
						Iterator<Long> iter =null;

						if (request.getParameter("term")!=null){
							strQry =request.getParameter("term");
							vehicleAgentList = VehicleAgentMasterDao.getInstance().findByNameForMaster(strQry,executive.getAccountGroupId());
							if (vehicleAgentList != null )
								if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_GROUPADMIN)
									for (final VehicleAgentMaster element : vehicleAgentList) {
										jObject	= new JSONObject();
										jObject.put("label",element.getName());
										jObject.put("id",element.getVehicleAgentMasterId());
										jArray.put(jObject);
									}
								else  if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_REGIONADMIN){
									regionCities = cacheManip.getCitiesByRegionId(request, executive.getAccountGroupId(), executive.getRegionId());
									iter = regionCities.keySet().iterator();
									while(iter.hasNext()){
										final long key = Long.parseLong(iter.next().toString());
										for (final VehicleAgentMaster element : vehicleAgentList)
											if(key == element.getCityId()){
												jObject	= new JSONObject();
												jObject.put("label",element.getName());
												jObject.put("id",element.getVehicleAgentMasterId());
												jArray.put(jObject);
											}
									}
								}else  if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_SUBREGIONADMIN){
									subRegionCities = cacheManip.getCitiesBySubRegionId(request, executive.getAccountGroupId(), executive.getSubRegionId());
									iter = subRegionCities.keySet().iterator();
									while(iter.hasNext()){
										final long key = Long.parseLong(iter.next().toString());
										for (final VehicleAgentMaster element : vehicleAgentList)
											if(key == element.getCityId()){
												jObject	= new JSONObject();
												jObject.put("label",element.getName());
												jObject.put("id",element.getVehicleAgentMasterId());
												jArray.put(jObject);
											}
									}
								}else  if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_BRANCHADMIN
										|| executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_EXECUTIVE)
									for (final VehicleAgentMaster element : vehicleAgentList)
										if(element.getCityId() == executive.getCityId()){
											jObject	= new JSONObject();
											jObject.put("label",element.getName());
											jObject.put("id",element.getVehicleAgentMasterId());
											jArray.put(jObject);
										}
						} else {
							jObject	= new JSONObject();
							jObject.put("label", "norecord");
							jObject.put("id", "0");
							jArray.put(jObject);
						}
					} catch(final Exception e) {
						e.printStackTrace();
						LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_DEBUG," EXCEPTION in filter "+filter+": " +e);
						strBfr.append(e);
					}
				else {
					jObject	= new JSONObject();
					jObject.put("label","You are logged out, Please login again !");
					jObject.put("id","You are logged out, Please login again !");
					jArray.put(jObject);
				}

				out = response.getWriter();
				out.println(jArray);
				out.flush();
				break;
			case 2 :
				CacheManip										cManip 					= null;
				List<DispatchLedger>							dispatchList			= null;
				JSONObject			 							jsonObjectGet			= null;
				JSONObject										jsonObjectOut			= null;

				try{
					error = ActionStaticUtil.getSystemErrorColl(request);

					if(ActionStaticUtil.isSystemError(request,error))
						return;

					response.setContentType("application/json"); // Setting response for JSON Content

					out				= response.getWriter();
					jsonObjectOut	= new JSONObject();
					jsonObjectGet	= new JSONObject(request.getParameter("json"));
					cManip 		= new CacheManip(request);
					final SimpleDateFormat	sdf 					= new SimpleDateFormat("dd-MM-yy");
					lhpvId			= jsonObjectGet.get("LhpvId")+"";
					accountGropuId	= Utility.getLong(jsonObjectGet.get("AccountGroupId"));
					executive 		= (Executive) request.getSession().getAttribute("executive");

					dispatchColl = DispatchLedgerDao.getInstance().getLHPVDataByLHPVIds( lhpvId,executive.getAccountGroupId(),"");

					if(dispatchColl != null) {
						for(final long key : dispatchColl.keySet()){
							dispatchList = dispatchColl.get(key);

							for (final DispatchLedger dispatchLedger : dispatchList) {
								if(dispatchLedger.getSourceBranchId() > 0)
									dispatchLedger.setSourceBranch(cManip.getBranchById(request, executive.getAccountGroupId(), dispatchLedger.getSourceBranchId()).getName());

								if(dispatchLedger.getDestinationBranchId() > 0)
									dispatchLedger.setDestinationBranch(cManip.getBranchById(request, executive.getAccountGroupId(), dispatchLedger.getDestinationBranchId()).getName());

								if(dispatchLedger.getTripDateTime()!=null)
									dispatchLedger.setTripDateTimeForString(sdf.format(dispatchLedger.getTripDateTime()));
							}
						}

						jsonObjectOut.put("dispatchColl", dispatchLedgerValueObject(dispatchList));
					}else {
						error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
						error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
						request.setAttribute("cargoError", error);
					}

					out.println(jsonObjectOut);

				}catch(final Exception _e){
					ActionStepsUtil.catchActionException(request, _e, error);
				}

				break;
			case 3 :
				out				= response.getWriter();
				if (executive != null)
					try {
						short routeTypeId;
						strQry = null;
						strBfr = new StringBuilder();
						LinkedHashMap <Long, String> vehicleNoList = null;

						routeTypeId = JSPUtility.GetShort(request, "routeTypeId",(short)0);

						if (request.getParameter("term")!=null){
							strQry =request.getParameter("term");

							vehicleNoList = VehicleNumberMasterDao.getInstance().findByName(executive.getAccountGroupId(),strQry,routeTypeId);
							if (vehicleNoList != null )
								for (final Long key : vehicleNoList.keySet()) {
									jObject	= new JSONObject();
									jObject.put("label",vehicleNoList.get(key));
									jObject.put("id",key);
									jArray.put(jObject);
								}
						} else {
							jObject	= new JSONObject();
							jObject.put("label", "norecord");
							jObject.put("id", "0");
							jArray.put(jObject);
						}
					}catch(final Exception e){
						e.printStackTrace();
						LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_DEBUG," EXCEPTION : " +e);
						out.println(e);
					}
				else {
					jObject	= new JSONObject();
					jObject.put("label","You are logged out, Please login again !");
					jObject.put("id","You are logged out, Please login again !");
					jArray.put(jObject);
				}

				out.println(jArray);
				out.flush();
				break;
			}

		} catch (final Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		} finally {
			out.close();
			cacheManip		= null;
			executive 	= null;
			strBfr 		= null;
			out			= null;
			strQry		= null;
		}
	}

	private JSONArray dispatchLedgerValueObject(List<DispatchLedger> dispatchColl) throws Exception {

		JSONArray valueObject	= null;

		try {

			if (dispatchColl != null) {
				valueObject	= new JSONArray();

				for (final DispatchLedger dispatchLedger : dispatchColl)
					valueObject.put(new JSONObject(dispatchLedger));
			}
			return valueObject;

		} catch (final Exception e) {
			throw e;
		} finally {
			valueObject	= null;
		}
	}

}