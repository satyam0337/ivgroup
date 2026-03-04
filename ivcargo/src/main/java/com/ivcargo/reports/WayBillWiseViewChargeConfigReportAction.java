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
import com.platform.dao.reports.ChargeConfigReportDAO;
import com.platform.dto.Branch;
import com.platform.dto.Executive;
import com.platform.dto.SubRegion;
import com.platform.dto.WayBillType;
import com.platform.dto.model.DestinationChargeConfigDetails;
import com.platform.dto.model.ReportViewModel;
import com.platform.dto.model.WayBillChargeConfigModel;
import com.platform.resource.CargoErrorList;

public class WayBillWiseViewChargeConfigReportAction implements Action{
	private static final String TRACE_ID = "WayBillWiseViewChargeConfigReportAction";
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		// TODO Auto-generated method stub
		HashMap<String,Object>	 	error 					= null;
		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error)){
				return;
			}
			SimpleDateFormat 	sdf               	= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			Timestamp        	fromDate          	= new Timestamp((sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00")).getTime());
			Timestamp        	toDate            	= new Timestamp((sdf.parse(JSPUtility.GetString(request, "fromDate") + " 23:59:59")).getTime());
			short				filter				= Short.parseShort(request.getParameter("filter"));
			ValueObject			valueInObject		= new ValueObject();
			Executive			executive			= (Executive)request.getSession().getAttribute("executive");
			Branch				branch				= null;
			SubRegion			subRegion			= null;

			valueInObject.put("fromDate", fromDate);
			valueInObject.put("toDate", toDate);
			valueInObject.put("filter", filter);
			valueInObject.put("accountGroupId", executive.getAccountGroupId());

			WayBillChargeConfigModel[] wayBillChargeConfigModel = ChargeConfigReportDAO.getInstance().getChargeConfigDetailsWayBillWise(valueInObject);
			if(wayBillChargeConfigModel.length > 0){
				CacheManip 	cManip 		= new CacheManip(request);	
				WayBillType 	wayBillType = null;
				HashMap<Long, DestinationChargeConfigDetails> destinationChargeConfigDetails = new HashMap<Long, DestinationChargeConfigDetails>();
				DestinationChargeConfigDetails chargeConfigDetails = null;

				for(int index=0; index<wayBillChargeConfigModel.length ;index++) {

					branch	= cManip.getGenericBranchDetailCache(request,wayBillChargeConfigModel[index].getSourceBranchId());
					wayBillChargeConfigModel[index].setSourceBranch(branch.getName());
					wayBillChargeConfigModel[index].setSourceSubRegionId(branch.getSubRegionId());

					subRegion	= cManip.getGenericSubRegionById(request, wayBillChargeConfigModel[index].getSourceSubRegionId());
					wayBillChargeConfigModel[index].setSourceSubRegionName(subRegion.getName());
					
					branch	= cManip.getGenericBranchDetailCache(request,wayBillChargeConfigModel[index].getDestinationBranchId());
					wayBillChargeConfigModel[index].setDestinationBranch(branch.getName());
					wayBillChargeConfigModel[index].setDestinationSubRegionId(branch.getSubRegionId());
					
					subRegion	= cManip.getGenericSubRegionById(request, wayBillChargeConfigModel[index].getDestinationSubRegionId());
					wayBillChargeConfigModel[index].setDestinationSubRegionName(subRegion.getName());

					wayBillType = cManip.getWayBillTypeById(request, wayBillChargeConfigModel[index].getWayBillTypeId());

					if(wayBillChargeConfigModel[index].isManual()){
						wayBillChargeConfigModel[index].setWayBillType(wayBillType.getWayBillType()+WayBillType.WAYBILL_TYPE_MANUAL);
					}else{
						wayBillChargeConfigModel[index].setWayBillType(wayBillType.getWayBillType());
					}

					chargeConfigDetails = destinationChargeConfigDetails.get(wayBillChargeConfigModel[index].getDestinationBranchId());
					if(chargeConfigDetails == null){
						chargeConfigDetails = new DestinationChargeConfigDetails();
						chargeConfigDetails.setDestinationBranchName(wayBillChargeConfigModel[index].getDestinationBranch());
						chargeConfigDetails.setTotalChargeConfigAmount(wayBillChargeConfigModel[index].getChargeAmount());
						destinationChargeConfigDetails.put(wayBillChargeConfigModel[index].getDestinationBranchId(), chargeConfigDetails);
					} else {
						chargeConfigDetails.setTotalChargeConfigAmount(chargeConfigDetails.getTotalChargeConfigAmount() + wayBillChargeConfigModel[index].getChargeAmount());
					}
				}
				request.setAttribute("destinationChargeConfigDetails",destinationChargeConfigDetails);

				ReportViewModel reportViewModel =new ReportViewModel();
				reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);
				request.setAttribute("ReportViewModel",reportViewModel);
			} else {
				LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, CargoErrorList.SYSTEM_ERROR + "");
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}

			request.setAttribute("wayBillChargeConfigModel", wayBillChargeConfigModel);
			request.setAttribute("nextPageToken", "success");

		} catch (Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		}
	}
}
