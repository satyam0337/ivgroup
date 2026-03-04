package com.ivcargo.reports;

import java.util.ArrayList;
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
import com.platform.dao.VehicleConfigHamaliDao;
import com.platform.dto.Branch;
import com.platform.dto.Executive;
import com.platform.dto.Region;
import com.platform.dto.SubRegion;
import com.platform.dto.TransportCommonMaster;
import com.platform.dto.VehicleConfigHamali;
import com.platform.resource.CargoErrorList;

public class VehicleConfigHamaliPrintAction implements Action {
	private static final String TRACE_ID = "VehicleConfigHamaliPrintAction";

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		// TODO Auto-generated method stub

		HashMap<String,Object>	 			error 				= null;
		CacheManip							cache 				= null;
		Executive							executive			= null;
		long								loadingHamaliLedgerId = 0;
		VehicleConfigHamali[]				reportArr 			= null;
		VehicleConfigHamali					model				= null;
		ValueObject							outObject			= null;
		Branch								branch				= null;
		Branch								branchModel			= null;
		SubRegion							subRegionModel		= null;
		Region								regionModel			= null;
		HashMap<Long, ArrayList<VehicleConfigHamali>>		VehicleConfigHamaliHm		= null;
		ArrayList<VehicleConfigHamali>		vehicleConfigHamaliList	= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error))
				return;

			loadingHamaliLedgerId		= JSPUtility.GetLong(request, "loadingHamaliLedgerId" ,0);
			executive	= (Executive) request.getSession().getAttribute("executive");
			cache		= new CacheManip(request);
			VehicleConfigHamaliHm = new HashMap<Long, ArrayList<VehicleConfigHamali>>();

			if(loadingHamaliLedgerId > 0){
				outObject = VehicleConfigHamaliDao.getInstance().getVehicleConfigHamaliByVehicleConfigHamaliIds(loadingHamaliLedgerId, executive.getAccountGroupId());

				if(outObject != null){

					reportArr 		= (VehicleConfigHamali[])outObject.get("reportArr");

					for(int i = 0; i < reportArr.length ; i++){
						if(i == 0){
							model	= new VehicleConfigHamali();
							branch = cache.getGenericBranchDetailCache(request, reportArr[i].getBranchId());
							model.setBranchName(branch.getName());
							model.setBranchAddress(branch.getAddress());
							model.setCreationDateTime(reportArr[i].getCreationDateTime());
							model.setFromDate(reportArr[i].getFromDate());
							model.setToDate(reportArr[i].getToDate());
							model.setCreateUserName(reportArr[i].getCreateUserName());

							if(reportArr[i].getLoadingHamaliNumber() != null)
								model.setLoadingHamaliNumber(reportArr[i].getLoadingHamaliNumber());
							if(reportArr[i].getRemark() != null)
								model.setRemark(reportArr[i].getRemark());
							if(reportArr[i].getFromBranchId() > 0) {
								branchModel = cache.getGenericBranchDetailCache(request, reportArr[i].getFromBranchId());
								model.setFromBranchName(branchModel.getName());
							} else
								model.setFromBranchName("ALL");
							if(reportArr[i].getFromSubRegionId() > 0) {
								subRegionModel = cache.getGenericSubRegionById(request, reportArr[i].getFromSubRegionId());
								model.setFromSubRegionName(subRegionModel.getName());
							} else
								model.setFromSubRegionName("ALL");
							if(reportArr[i].getFromRegionId() > 0) {
								regionModel = cache.getGenericRegionById(request, reportArr[i].getFromRegionId());
								model.setFromRegionName(regionModel.getName());
							} else
								model.setFromRegionName("ALL");

							request.setAttribute("BillDetailsForPrintingBill", model);
						}
						reportArr[i].setSourceBranch(cache.getGenericBranchDetailCache(request,reportArr[i].getSourceBranchId()).getName());

						if(reportArr[i].getDestinationBranchId() > 0)
							reportArr[i].setDestinationBranch(cache.getGenericBranchDetailCache(request,reportArr[i].getDestinationBranchId()).getName());
						if(reportArr[i].getVehicleOwner() > 0)
							reportArr[i].setVehicleOwnerName(TransportCommonMaster.getVehicleOwnerABBRName(reportArr[i].getVehicleOwner()));
						else
							reportArr[i].setVehicleOwnerName("--");
						if(reportArr[i].getLhpvNumber() == null)
							reportArr[i].setLhpvNumber("--");

						vehicleConfigHamaliList = VehicleConfigHamaliHm.get(reportArr[i].getLhpvId());

						if(vehicleConfigHamaliList == null) {
							vehicleConfigHamaliList	= new ArrayList<VehicleConfigHamali>();
							vehicleConfigHamaliList.add(reportArr[i]);
							VehicleConfigHamaliHm.put(reportArr[i].getLhpvId(),vehicleConfigHamaliList);
						} else
							vehicleConfigHamaliList.add(reportArr[i]);

					}
					request.setAttribute("reportArr", reportArr);
					request.setAttribute("VehicleConfigHamaliHm", VehicleConfigHamaliHm);
				} else {
					LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, CargoErrorList.SYSTEM_ERROR + "");
					error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
					error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
					request.setAttribute("cargoError", error);
				}
			} else {
				LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, CargoErrorList.SYSTEM_ERROR + "");
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}

			request.setAttribute("nextPageToken", "success");

		} catch (final Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		} finally {
			cache 				= null;
			executive			= null;
			reportArr			= null;
			model				= null;
			outObject			= null;
		}
	}
}
