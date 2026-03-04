package com.ivcargo.reports;

//~--- non-JDK imports --------------------------------------------------------

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.SortedMap;
import java.util.TimeZone;
import java.util.TreeMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.logsapp.LogWriter;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.AllotedVehicleDetailsReportDao;
import com.platform.dto.AllotedVehicleWiseDetails;
import com.platform.dto.Executive;
import com.platform.dto.TransportCommonMaster;
import com.platform.dto.VehicleNumberMaster;
import com.platform.dto.model.BusinessFunctionConstants;
import com.platform.resource.CargoErrorList;

public class AllotedVehicleDetailsReportAction implements Action {

	private static final String TRACE_ID = "AllotedVehicleDetailsReportAction";
	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	 		error 			= null;
		Executive        				executive      	= null;
		SimpleDateFormat 				sdf            	= null;
		Timestamp        				fromDate       	= null;
		Timestamp        				toDate         	= null;
		CacheManip 						cManip 			= null;
		SimpleDateFormat 				dateForTimeLog 	= null;
		String							branchIds		= null;
		ValueObject                     outValueObject          = null;
		AllotedVehicleWiseDetails[] 	reportArr 				= null;
		VehicleNumberMaster				vehicle					= null;
		AllotedVehicleWiseDetails		model					= null;
		SortedMap<String,AllotedVehicleWiseDetails> allotedVehicleHM = null;
		var 							regionId    			= 0L;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error))
				return;
			final var startTime = System.currentTimeMillis();
			new InitializeAllotedVehicleDetailsReportAction().execute(request, response);

			executive	= (Executive) request.getSession().getAttribute("executive");
			sdf			= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			fromDate	= new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00").getTime());
			toDate		= new Timestamp(sdf.parse(JSPUtility.GetString(request, "toDate") + " 23:59:59").getTime());
			cManip 		= new CacheManip(request);

			final var accountGroupId 	= executive.getAccountGroupId();
			regionId	= Long.parseLong(request.getParameter("region"));

			branchIds = cManip.getPhysicalBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_REGION, regionId);

			outValueObject = AllotedVehicleDetailsReportDao.getInstance().getAllotedVehicleData(fromDate, toDate, branchIds, accountGroupId);
			if(outValueObject != null){

				reportArr = (AllotedVehicleWiseDetails[])outValueObject.get("reportArr");
				if(reportArr != null) {

					allotedVehicleHM = new TreeMap<>();
					for (final AllotedVehicleWiseDetails element : reportArr) {

						model = new AllotedVehicleWiseDetails();

						model.setAllotedVehicleWiseDetailsId(element.getAllotedVehicleWiseDetailsId());
						model.setAccountGroupId(element.getAccountGroupId());
						model.setVehicleNumberId(element.getVehicleNumberId());
						model.setVehicleNumber(element.getVehicleNumber());
						model.setSourceBranchId(element.getSourceBranchId());
						model.setDestinatinBranchId(element.getDestinatinBranchId());
						model.setBranchId(element.getBranchId());
						model.setTypeOfOperation(element.getTypeOfOperation());
						model.setNumber(element.getNumber());
						model.setCommonId(element.getCommonId());
						model.setCreationTimeStamp(element.getCreationTimeStamp());
						model.setActualTimeStamp(element.getActualTimeStamp());

						vehicle = cManip.getVehicleNumber(request, accountGroupId, element.getVehicleNumberId());

						element.setAllotedRegionId(vehicle.getAllotedRegionId());
						element.setAllotedRegionName(cManip.getRegionByIdAndGroupId(request, vehicle.getAllotedRegionId(), accountGroupId).getName());
						model.setAllotedRegionId(element.getAllotedRegionId());
						model.setAllotedRegionName(element.getAllotedRegionName());

						allotedVehicleHM.put(model.getVehicleNumber()+"_"+model.getVehicleNumberId(), model);
					}
					request.setAttribute("allotedVehicleHM", allotedVehicleHM);
				} else {
					LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO, (String) error.get("errorCode")+" "+(String) error.get("errorDescription"));
					error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
					error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
					request.setAttribute("cargoError", error);
				}
			} else {
				LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO, (String) error.get("errorCode")+" "+(String) error.get("errorDescription"));
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}
			ActionStaticUtil.setReportViewModel(request);
			request.setAttribute("nextPageToken", "success");

			dateForTimeLog = new SimpleDateFormat("mm:ss");
			dateForTimeLog.setTimeZone(TimeZone.getTimeZone("GMT"));
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO,"=====Report Generated "+BusinessFunctionConstants.LSBOOKINGREGISTER +" "+executive.getAccountGroupId()+" "+executive.getBranchId()+" "+executive.getExecutiveId()+" in "+dateForTimeLog.format(new Date(System.currentTimeMillis()-startTime)));
		} catch (final Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		} finally {
			error 			= null;
			executive      	= null;
			sdf            	= null;
			fromDate       	= null;
			toDate         	= null;
			cManip 			= null;
			dateForTimeLog 	= null;
			branchIds		= null;
			outValueObject  = null;
			reportArr 		= null;
			vehicle			= null;
			model			= null;
			allotedVehicleHM= null;
		}
	}
}