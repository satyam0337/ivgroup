package com.ivcargo.reports;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.HashMap;

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
import com.platform.dto.AllotedVehicleWiseSummary;
import com.platform.dto.Executive;
import com.platform.dto.SubRegion;
import com.platform.dto.VehicleNumberMaster;
import com.platform.dto.model.ReportViewModel;
import com.platform.resource.CargoErrorList;

public class AllotedVehicleViewDetailsAction implements Action {

	public static final String TRACE_ID = "AllotedVehicleViewDetailsAction";

	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	 		error 					= null;

		CacheManip 						cManip 					= null;
		Executive 						executive 				= null;
		ValueObject						outValueObject			= null;
		Timestamp						fromDate				= null;
		Timestamp						toDate					= null;
		SimpleDateFormat 				sdf            			= null;
		AllotedVehicleWiseDetails[]		reportArr				= null;
		VehicleNumberMaster				vehicle					= null;
		ReportViewModel					reportViewModel			= null;
		SubRegion						subRegion				= null;
		String							accountGroupNameForPrint	= null;
		long							vehicleNumberId	= 0;
		AllotedVehicleWiseSummary		summary			= null;
		long  lsCount			= 0;    
		long  lorryHireCount	= 0;          
		long  lhpvCount			= 0;      
		long  turCount			= 0;            
		long  blhpvCount		= 0;          
		long  ddmCount			= 0;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error)){
				return;
			}

			cManip 				= new CacheManip(request);
			executive 			= (Executive) request.getSession().getAttribute("executive");
			vehicleNumberId		= JSPUtility.GetLong(request,"vehicleNumberId");
			sdf					= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			fromDate			= new Timestamp((sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00")).getTime());
			toDate				= new Timestamp((sdf.parse(JSPUtility.GetString(request, "toDate") + " 23:59:59")).getTime());

			if(vehicleNumberId > 0){

				outValueObject = AllotedVehicleDetailsReportDao.getInstance().getAllotedVehicleDataByVehicleId(fromDate, toDate, vehicleNumberId, executive.getAccountGroupId());

				if(outValueObject != null){

					reportArr = (AllotedVehicleWiseDetails[])outValueObject.get("reportArr");

					if(reportArr != null) {

						for(int index=0; index < reportArr.length ;index++) {

							vehicle = cManip.getVehicleNumber(request, executive.getAccountGroupId(), reportArr[index].getVehicleNumberId());

							reportArr[index].setAllotedRegionId(vehicle.getAllotedRegionId());
							reportArr[index].setAllotedRegionName(cManip.getRegionByIdAndGroupId(request, vehicle.getAllotedRegionId(), executive.getAccountGroupId()).getName());
							reportArr[index].setAllotedBranchName(cManip.getGenericBranchDetailCache(request, vehicle.getAllotedBranchId()).getName());
							reportArr[index].setFromBranch(cManip.getGenericBranchDetailCache(request, reportArr[index].getSourceBranchId()).getName());
							reportArr[index].setToBranch(cManip.getGenericBranchDetailCache(request, reportArr[index].getDestinatinBranchId()).getName());
							reportArr[index].setNumber(reportArr[index].getNumber());
							if(reportArr[index].getTypeOfOperation() == AllotedVehicleWiseDetails.VEHICLE_DETAILS_FOR_TUR
									|| reportArr[index].getTypeOfOperation() == AllotedVehicleWiseDetails.VEHICLE_DETAILS_FOR_BLHPV){
								subRegion =cManip.getGenericSubRegionById(request, cManip.getGenericBranchDetailCache(request, reportArr[index].getBranchId()).getSubRegionId());
								reportArr[index].setTurSubRegionId(subRegion.getSubRegionId());
								reportArr[index].setTurSubRegionName(subRegion.getName());
							}
							reportArr[index].setBranchName(cManip.getGenericBranchDetailCache(request, reportArr[index].getBranchId()).getName());

							if(reportArr[index].getTypeOfOperation() == AllotedVehicleWiseDetails.VEHICLE_DETAILS_FOR_LS) {
								lsCount++;
							} else if(reportArr[index].getTypeOfOperation() == AllotedVehicleWiseDetails.VEHICLE_DETAILS_FOR_DDM) {
								ddmCount++;
							} else if(reportArr[index].getTypeOfOperation() == AllotedVehicleWiseDetails.VEHICLE_DETAILS_FOR_LHPV) {
								lhpvCount++;
							} else if(reportArr[index].getTypeOfOperation() == AllotedVehicleWiseDetails.VEHICLE_DETAILS_FOR_TUR) { 
								turCount++;	
							} else if(reportArr[index].getTypeOfOperation() == AllotedVehicleWiseDetails.VEHICLE_DETAILS_FOR_BLHPV) {
								blhpvCount++;
							} else {
								lorryHireCount++;
							}
						}
						summary = new AllotedVehicleWiseSummary();
						summary.setLsCount(lsCount);
						summary.setLhpvCount(lhpvCount);
						summary.setBlhpvCount(blhpvCount);
						summary.setTurCount(turCount);
						summary.setDdmCount(ddmCount);
						summary.setLorryHireCount(lorryHireCount);

						request.setAttribute("summary", summary);
						request.setAttribute("reportArr", reportArr);
						reportViewModel = new ReportViewModel();
						reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);
						request.setAttribute("ReportViewModel",reportViewModel);

						accountGroupNameForPrint = reportViewModel.getAccountGroupName();
						request.setAttribute("accountGroupNameForPrint",accountGroupNameForPrint);
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
			}else {
				error.put("errorCode", CargoErrorList.NO_RECORDS);
				error.put("errorDescription", CargoErrorList.NO_RECORDS_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}
			reportViewModel = new ReportViewModel();
			reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);

			request.setAttribute("ReportViewModel",reportViewModel);
			request.setAttribute("nextPageToken", "success");

		} catch (Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		} finally {
			cManip 					= null;     
			executive 				= null;     
			outValueObject			= null;     
			fromDate				= null;     
			toDate					= null;     
			sdf            			= null;     
			reportArr				= null;     
			vehicle					= null;     
			reportViewModel			= null;     
			accountGroupNameForPrint= null;     
		}
	}
}
