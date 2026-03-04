package com.ivcargo.actions;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.BranchTransferBLL;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.reports.ReportView;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.Branch;
import com.platform.dto.BranchTransfer;
import com.platform.dto.Executive;
import com.platform.dto.TransportCommonMaster;
import com.platform.dto.WayBill;
import com.platform.dto.WayBillType;
import com.platform.dto.configuration.modules.LsConfigurationDTO;
import com.platform.dto.constant.WayBillTypeConstant;
import com.platform.dto.model.ReportViewModel;
import com.platform.resource.CargoErrorList;

public class BranchTransferPopulateWayBillListAction implements Action{

	public void execute(HttpServletRequest request, HttpServletResponse response) {
		// TODO Auto-generated method stub

		HashMap<String,Object>	error 							= null;
		ValueObject 			lsConfiguration					= null;
		boolean 				allowAppendSingleLrDitect 		= false;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error)){
				return;
			}

			if(request.getParameter("wayBillNo") != null && request.getParameter("fromDate") != null && request.getParameter("toDate") != null){

				String 		wayBillNo 			= request.getParameter("wayBillNo");
				Timestamp 	fromDate   	 	= null;
				Timestamp 	toDate			= null;
				
				int 		searchType				= JSPUtility.GetInt(request, "searchType");
				long 		destSubRegionId			= JSPUtility.GetLong(request, "destSubRegion",0);
				long 		destBranchId			= JSPUtility.GetLong(request, "destBranch",0);
				
				SimpleDateFormat 	sdf     = new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
				fromDate					= new Timestamp((sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00")).getTime());
				toDate      				= new Timestamp((sdf.parse(JSPUtility.GetString(request, "toDate") + " 23:59:59")).getTime());
				
				CacheManip 			cache 					= new CacheManip(request);
				String				desitinationBranchIds	= null;
				Executive 			executive 				= (Executive)request.getSession().getAttribute("executive");
				Branch				srcBranch				= null;
				Branch				destBranch				= null;
				lsConfiguration 			= cache.getLsConfiguration(request, executive.getAccountGroupId());
				allowAppendSingleLrDitect   = lsConfiguration.getBoolean(LsConfigurationDTO.ALLOW_APPEND_SINGLE_LR_DITECT, false);
				
				/*	//Number of WayBills to search (Start)
					long 	    noOfDays	= 0; 
					if(wayBillNo.equals("")){

						SimpleDateFormat 	sdf         = new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
						fromDate	= new Timestamp((sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00")).getTime());
						toDate      = new Timestamp((sdf.parse(JSPUtility.GetString(request, "toDate") + " 23:59:59")).getTime());


						noOfDays = (toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24);
						noOfDays = noOfDays + 1;
					}
					//Number of WayBills to search (End)

					if(noOfDays <= 7){//Max no. of the days to find 
				 */		
				request.setAttribute("searchType", searchType);
				if(searchType == BranchTransfer.SEARCH_TYPE_WB_DESTINATION){
					if(destBranchId > 0){
						desitinationBranchIds = ""+destBranchId;
					} else if(destSubRegionId > 0){
						/*desitinationBranchIds = cache.getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_CITY, destCityId);*/
						desitinationBranchIds = cache.getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_SUBREGION, destSubRegionId);
					}
				} else if(searchType == BranchTransfer.SEARCH_TYPE_RECEIVED_DATE){
					destSubRegionId = executive.getSubRegionId();
					/*desitinationBranchIds = cache.getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_CITY, destCityId);*/
					desitinationBranchIds = cache.getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_SUBREGION, destSubRegionId);
				}

				ValueObject 	valueInObject 	= new ValueObject();
				ValueObject 	valueOutObject 	= null;
				valueInObject.put("executive", executive);
				valueInObject.put("wayBillNo", wayBillNo);
				valueInObject.put("fromDate", fromDate);
				valueInObject.put("toDate", toDate);
				//valueInObject.put("destCityId", destCityId);
				valueInObject.put("destSubRegionId", destSubRegionId);
				valueInObject.put("desitinationBranchIds", desitinationBranchIds);
				valueInObject.put("searchType", searchType);

				BranchTransferBLL branchTransferBLL = new BranchTransferBLL();
				valueOutObject = branchTransferBLL.getWayBillDetailsForBranchTransfer(valueInObject);
				WayBill[] wayBills = (WayBill[])valueOutObject.get("wayBill");

				if(wayBills != null){

					ReportViewModel reportViewModel =new ReportViewModel();
					reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);
					request.setAttribute("ReportViewModel",reportViewModel);

					for (int i = 0; i < wayBills.length; i++) {

						srcBranch  = cache.getGenericBranchDetailCache(request, wayBills[i].getSourceBranchId());
						destBranch = cache.getGenericBranchDetailCache(request, wayBills[i].getDestinationBranchId());

						/*wayBills[i].setSourceCityId(srcBranch.getCityId());
						wayBills[i].setDestinationCityId(destBranch.getCityId());*/
						wayBills[i].setSourceSubRegionId(srcBranch.getSubRegionId());
						wayBills[i].setDestinationSubRegionId(destBranch.getSubRegionId());

						wayBills[i].setSourceBranch(srcBranch.getName());
						/*wayBills[i].setSourceCity(cache.getCityById(request, wayBills[i].getSourceCityId()).getName());*/
						wayBills[i].setSourceSubRegion(cache.getGenericSubRegionById(request, wayBills[i].getSourceSubRegionId()).getName());
						wayBills[i].setDestinationBranch(destBranch.getName());
						wayBills[i].setDestinationSubRegion(cache.getGenericSubRegionById(request, wayBills[i].getDestinationSubRegionId()).getName());

						if(wayBills[i].isManual()){
							wayBills[i].setWayBillType(WayBillTypeConstant.getWayBillTypeNameByWayBilTypeId(wayBills[i].getWayBillTypeId())+WayBillType.WAYBILL_TYPE_MANUAL);
						}else{
							wayBills[i].setWayBillType(WayBillTypeConstant.getWayBillTypeNameByWayBilTypeId(wayBills[i].getWayBillTypeId()));
						}
					}

					request.setAttribute("wayBill", wayBills);
					request.setAttribute("allowAppendSingleLrDitect", allowAppendSingleLrDitect);
				} else {
					error.put("errorCode", CargoErrorList.SYSTEM_ERROR);
					error.put("errorDescription", CargoErrorList.SYSTEM_ERROR_DESCRIPTION);
					request.setAttribute("cargoError", error);
				}

				request.setAttribute("nextPageToken", "success");
				/*} else {
						LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, CargoErrorList.SYSTEM_ERROR + " ",CargoErrorList.VALID_DATE_ERROR_DESCRIPTION); 
						error.put("errorCode", CargoErrorList.VALID_DATE_ERROR);
						error.put("errorDescription", CargoErrorList.VALID_DATE_ERROR_DESCRIPTION);
						request.setAttribute("cargoError", error);
						request.setAttribute("nextPageToken", "BranchTransferError");
				}*/
			} else {
				error.put("errorCode", CargoErrorList.SYSTEM_ERROR);
				error.put("errorDescription", CargoErrorList.SYSTEM_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
				request.setAttribute("nextPageToken", "failure");
			}
		} catch (Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		}
	}
}
