package com.ivcargo.reports;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.framework.JSPUtility;
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
import com.platform.dto.UnloadingVehicleConfigHamaliSummary;
import com.platform.resource.CargoErrorList;

public class UnLoadingVehicleConfigHamaliPrintAction implements Action {
	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		// TODO Auto-generated method stub
		HashMap<String,Object>	 			error 				= null;
		CacheManip							cache 				= null;
		Executive							executive			= null;
		ValueObject							outObject			= null;
		Branch								branch				= null;
		UnloadingVehicleConfigHamaliSummary	 model				= null;
		UnloadingVehicleConfigHamaliSummary[] reportArr         = null;
		long								unLoadingHamaliLedgerId	  = 0;
		Branch								branchModel			= null;
		SubRegion							subRegionModel		= null;
		Region								regionModel			= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error))
				return;
			unLoadingHamaliLedgerId		= JSPUtility.GetLong(request, "unLoadingHamaliLedgerId" ,0);
			executive	= (Executive) request.getSession().getAttribute("executive");
			cache		= new CacheManip(request);

			if(unLoadingHamaliLedgerId > 0){
				outObject = VehicleConfigHamaliDao.getInstance().getUnloadVehicleConfigHamaliByUnloadingVehicleConfigHamaliIds(unLoadingHamaliLedgerId, executive.getAccountGroupId());

				if(outObject != null){
					reportArr 		= (UnloadingVehicleConfigHamaliSummary[])outObject.get("reportArr");

					for(int i = 0; i < reportArr.length ; i++){

						if(i == 0){
							model	= new UnloadingVehicleConfigHamaliSummary();
							branch = cache.getBranchById(request, executive.getAccountGroupId(), reportArr[i].getBranchId());
							model.setBranchName(branch.getName());
							model.setAddress(branch.getAddress());
							model.setCreationDateTime(reportArr[i].getCreationDateTime());
							model.setFromDate(reportArr[i].getFromDate());
							model.setToDate(reportArr[i].getToDate());
							if(reportArr[i].getUnLoadingHamaliNumber() != null)
								model.setUnLoadingHamaliNumber(reportArr[i].getUnLoadingHamaliNumber());
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
						reportArr[i].setSourceBranch(cache.getBranchById(request,executive.getAccountGroupId(),reportArr[i].getSourceBranchId()).getName());

						if(reportArr[i].getDestinationBranchId() > 0)
							reportArr[i].setDestinationBranch(cache.getBranchById(request,executive.getAccountGroupId(),reportArr[i].getDestinationBranchId()).getName());
						if(reportArr[i].getVehicleOwner() > 0)
							reportArr[i].setVehicleOwnerName(TransportCommonMaster.getVehicleOwnerABBRName(reportArr[i].getVehicleOwner()));
						else
							reportArr[i].setVehicleOwnerName("--");
					}
					request.setAttribute("reportArr", reportArr);
				} else {
					error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
					error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
					request.setAttribute("cargoError", error);
				}
			} else {
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}

			request.setAttribute("nextPageToken", "success");

		} catch (final Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		} finally {
			model				= null;
			cache 				= null;
			branch				= null;
			reportArr           = null;
			executive			= null;
			outObject			= null;
		}
	}
}
