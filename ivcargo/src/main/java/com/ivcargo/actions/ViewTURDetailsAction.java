/**
 * 
 */
package com.ivcargo.actions;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.logsapp.LogWriter;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.ReceivedSummaryDao;
import com.platform.dao.WayBillDao;
import com.platform.dto.Executive;
import com.platform.dto.ReceiveSummaryData;
import com.platform.dto.WayBill;
import com.platform.dto.constant.WayBillStatusConstant;

/**
 * @author Anant Chaudhary 30-09-2015
 *
 */
public class ViewTURDetailsAction implements Action {

	public static final String TRACE_ID = "ViewTURDetailsAction";

	public void execute(HttpServletRequest request, HttpServletResponse response) {
		// TODO Auto-generated method stub
		HashMap<String,Object>	 		error 					= null;

		long					wayBillId		= 0;
		ReceiveSummaryData[] 	rcvdSmryData 	= null;
		WayBill					wayBill			= null;
		Executive				executive		= null;
		CacheManip				cache			= null;
		ValueObject 			inValObj 		= null;

		try {

			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error)){
				return;
			}
			
			if (request.getParameter("wayBillId") != null) {
				wayBillId = Long.parseLong(request.getParameter("wayBillId"));
				LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO, "wayBillId = "+wayBillId);
			}

			executive 	= (Executive) request.getSession().getAttribute("executive");
			cache 		= new CacheManip(request);

			inValObj = new ValueObject();

			inValObj.put("wayBillId", wayBillId);
			inValObj.put("accountGroupId", executive.getAccountGroupId());
			
			wayBill 		= WayBillDao.getInstance().getWayBill((short) 0, wayBillId, null, executive.getAccountGroupId());

			if(wayBill != null){
				wayBill.setDestinationSubRegionId(cache.getGenericBranchDetailCache(request, wayBill.getDestinationBranchId()).getSubRegionId());
			}

			if(wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DISPATCHED
					|| wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_RECEIVED
					|| wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CANCELLED_DELIVERY
					|| wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DELIVERED
					|| wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CREDIT_DELIVERED) {

				rcvdSmryData = ReceivedSummaryDao.getInstance().getLuggageDetailsAfterReceive(wayBillId);

				if(rcvdSmryData != null) {

					for (int i = 0; i < rcvdSmryData.length; i++) {
						if(rcvdSmryData[i].getBranchId() > 0) {
							rcvdSmryData[i].setBranch(cache.getBranchById(request, executive.getAccountGroupId(), rcvdSmryData[i].getBranchId()).getName());
						} else {
							rcvdSmryData[i].setBranch(cache.getBranchById(request, executive.getAccountGroupId(),wayBill.getSourceBranchId()).getName());
						}
					}

					request.setAttribute("ReceiveSummaryData", rcvdSmryData);

				}
			}
			request.setAttribute("nextPageToken", "success");

		} catch (Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		} finally {
			rcvdSmryData 	= null;
			wayBill			= null;
			executive		= null;
			cache			= null;
			inValObj 		= null;
		}
	}

}
