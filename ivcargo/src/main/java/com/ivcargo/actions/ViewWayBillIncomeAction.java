package com.ivcargo.actions;

import java.util.ArrayList;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.framework.JSPUtility;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.ViewWayBillIncomeDao;
import com.platform.dao.WayBillIncomeVoucherDetailsDao;
import com.platform.dto.ViewWayBillIncomeModel;
import com.platform.dto.WayBillIncomeVoucherDetails;

public class ViewWayBillIncomeAction implements Action{

	public void execute(HttpServletRequest request, HttpServletResponse response) {
		// TODO Auto-generated method stub

		HashMap<String,Object>	 							error 				= null;
		HashMap<Long, ArrayList<ViewWayBillIncomeModel>> 	viewWBIncModelColl 	= null;
		ArrayList<ViewWayBillIncomeModel> 					viewWBIncModelArr	= null;
		ViewWayBillIncomeModel 								viewWBIncModel 		= null;
		ViewWayBillIncomeModel[] 							viewWBIncModels 	= null;
		StringBuffer										voucherIds			= null;
		HashMap<Long, WayBillIncomeVoucherDetails>			voucherDetailsColl	= null;
		WayBillIncomeVoucherDetails							voucherDetails		= null;
		CacheManip											cacheManip			= null;
		long 												wayBillId			= 0;

		try {

			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error)){
				return;
			}

			wayBillId			= JSPUtility.GetLong(request,"wayBillId");
			viewWBIncModels 	= ViewWayBillIncomeDao.getInstance().getWayBillIncomeDetails(wayBillId);
			viewWBIncModelColl	= new HashMap<Long, ArrayList<ViewWayBillIncomeModel>>();

			if(viewWBIncModels != null) {

				for (int i = 0; i < viewWBIncModels.length; i++) {

					viewWBIncModelArr = viewWBIncModelColl.get(viewWBIncModels[i].getWayBillIncomeVoucherDetailsId());

					if(viewWBIncModelArr == null) {

						viewWBIncModelArr	= new ArrayList<ViewWayBillIncomeModel>();
						viewWBIncModel 		= new ViewWayBillIncomeModel();

						viewWBIncModel.setWayBillIncomeVoucherDateTime(viewWBIncModels[i].getWayBillIncomeVoucherDateTime());
						viewWBIncModel.setWayBillIncomeVoucherDetailsId(viewWBIncModels[i].getWayBillIncomeVoucherDetailsId());
						viewWBIncModel.setIncomeChargeId(viewWBIncModels[i].getIncomeChargeId());
						viewWBIncModel.setIncomeDateTime(viewWBIncModels[i].getIncomeDateTime()); 
						viewWBIncModel.setAmount(viewWBIncModels[i].getAmount());
						viewWBIncModel.setRemark(viewWBIncModels[i].getRemark());
						viewWBIncModel.setIncomeName(viewWBIncModels[i].getIncomeName());
						viewWBIncModel.setStatus(viewWBIncModels[i].getStatus());

						viewWBIncModelArr.add(viewWBIncModel);
						viewWBIncModelColl.put(viewWBIncModels[i].getWayBillIncomeVoucherDetailsId(), viewWBIncModelArr);

					} else {

						viewWBIncModel = new ViewWayBillIncomeModel();

						viewWBIncModel.setWayBillIncomeVoucherDateTime(viewWBIncModels[i].getWayBillIncomeVoucherDateTime());
						viewWBIncModel.setWayBillIncomeVoucherDetailsId(viewWBIncModels[i].getWayBillIncomeVoucherDetailsId());
						viewWBIncModel.setIncomeChargeId(viewWBIncModels[i].getIncomeChargeId());
						viewWBIncModel.setIncomeDateTime(viewWBIncModels[i].getIncomeDateTime()); 
						viewWBIncModel.setAmount(viewWBIncModels[i].getAmount());
						viewWBIncModel.setRemark(viewWBIncModels[i].getRemark());
						viewWBIncModel.setIncomeName(viewWBIncModels[i].getIncomeName());
						viewWBIncModel.setStatus(viewWBIncModels[i].getStatus());

						viewWBIncModelArr.add(viewWBIncModel);
					}
				}

				voucherIds = new StringBuffer();
				for(Long key : viewWBIncModelColl.keySet()) {
					voucherIds.append(key+",");
				}

				voucherDetailsColl 	= WayBillIncomeVoucherDetailsDao.getInstance().getWayBillIncomeVoucherDetailsByIds(voucherIds.substring(0, voucherIds.length() - 1).toString());
				cacheManip			= new CacheManip(request);

				for(Long key : voucherDetailsColl.keySet()) {

					voucherDetails = voucherDetailsColl.get(key);

					voucherDetails.setBranch(cacheManip.getGenericBranchDetailCache(request,voucherDetails.getBranchId()).getName());
					voucherDetails.setSubRegionId(cacheManip.getGenericBranchDetailCache(request, voucherDetails.getBranchId()).getSubRegionId());
					voucherDetails.setSubRegion(cacheManip .getGenericSubRegionById(request, voucherDetails.getSubRegionId()).getName());
				}

				request.setAttribute("viewWBIncModelColl", viewWBIncModelColl);
				request.setAttribute("voucherDetailsColl", voucherDetailsColl);
			}

			request.setAttribute("nextPageToken", "success");

		} catch (Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		} finally {
			viewWBIncModelColl 	= null;
			viewWBIncModelArr	= null;
			viewWBIncModel 		= null;
			viewWBIncModels 	= null;
			voucherIds			= null;
			voucherDetailsColl	= null;
			voucherDetails		= null;
			cacheManip			= null;
		}
	}
}