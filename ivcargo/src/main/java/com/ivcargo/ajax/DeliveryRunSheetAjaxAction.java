package com.ivcargo.ajax;

import java.io.PrintWriter;
import java.util.HashMap;
import java.util.Map.Entry;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.DamerageChargeBLL;
import com.businesslogic.UnlodingChargesBll;
import com.framework.Action;
import com.iv.logsapp.LogWriter;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.WayBillDao;
import com.platform.dao.reports.WayBillDetailsDAO;
import com.platform.dto.ChargeTypeMaster;
import com.platform.dto.Executive;
import com.platform.dto.WayBill;
import com.platform.dto.WayBillCharges;
import com.platform.dto.WayBillTaxTxn;
import com.platform.dto.model.ChargeTypeModel;
import com.platform.dto.model.WayBillDeatailsModel;
import com.platform.utils.Utility;

public class DeliveryRunSheetAjaxAction implements Action{

	private static final String TRACE_ID = "DeliveryRunSheetAjaxAction";

	public void execute(HttpServletRequest request, HttpServletResponse response) {
		// TODO Auto-generated method stub

		HashMap<String,Object>	error 		= null;
		String 				wayBillIds 		= null;
		String 				acountGroupId	= null;
		ChargeTypeModel[]	deliveryCharge	= null;
		String 				Charges 		= "";
		Executive			executive		= null;
		CacheManip			cacheManip		= null;
		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error)){
				return;
			}
			wayBillIds 		= request.getParameter("wayBillIds");
			acountGroupId	= request.getParameter("acountGroupId");
			cacheManip		= new CacheManip(request);

			executive		= cacheManip.getExecutive(request);

			deliveryCharge 	= cacheManip.getActiveDeliveryCharges(request, executive.getBranchId());

			Charges = Charges + getChargesDetailsForKalpanaCargo(wayBillIds,acountGroupId,(Executive) request.getSession().getAttribute("executive"),request,deliveryCharge);
			response.setContentType("text/plain");
			PrintWriter out = response.getWriter();
			out.println("" + Charges + "");
			out.flush();
			out.close();
			request.setAttribute("nextPageToken", "success");

		} catch (Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		}finally{
			wayBillIds 		= null;
			acountGroupId	= null;
			deliveryCharge	= null;
			executive		= null;

		}
	}

	private String getChargesDetailsForKalpanaCargo(String wayBillIds, String acountGroupId, Executive executive, HttpServletRequest request,ChargeTypeModel[]	deliveryCharge) throws Exception {

		String 								Charges 		= null;
		Long[] 								wayBillIdsArr 	= null;
		HashMap<Long, WayBillDeatailsModel> wayBillDetails 	= null;
		HashMap<Long, WayBill> 				waybill			= null;
		HashMap<Long, ValueObject>  		inHashMap 		= null;
		ValueObject 						inValueObject 	= null;
		DamerageChargeBLL 		damerageChargeBLL 			= null;
		HashMap<Long, Double> 	outwaybillDemerageDetails 	= null;
		UnlodingChargesBll 		unlodingChargesBll 			= null;
		HashMap<Long, Double> 	outwaybillUnloadingDetails 	= null;
		WayBillCharges[]		wayBillCharges				= null;

		try {
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_DEBUG,"-- wayBillIds : "+wayBillIds);
			Charges 		= "";
			wayBillIdsArr 	= Utility.GetLongArrayFromString(wayBillIds, ",");
			wayBillDetails 	= WayBillDetailsDAO.getInstance().getWayBillDetails(wayBillIdsArr ,true ,ChargeTypeMaster.WAYBILL_CHARGETYPE_DELIVERY,false ,WayBillTaxTxn.WAYBILL_TAX_TXN_TYPE_BOOKING ,true);
			waybill			= WayBillDao.getInstance().getWayBillsByWayBillIds(wayBillIds);
			inHashMap 		= new HashMap<Long, ValueObject>();

			for(Entry<Long, WayBill> entry : waybill.entrySet()){
				inValueObject = new ValueObject();
				inValueObject.put("wayBill", entry.getValue());
				inValueObject.put("consignment", wayBillDetails.get(entry.getKey()).getConsignmentDetails());
				inValueObject.put("wayBillCharges", wayBillDetails.get(entry.getKey()).getWayBillCharges());
				inValueObject.put("executive", executive);
				inHashMap.put(entry.getKey(),inValueObject);
			}

			damerageChargeBLL 			= new DamerageChargeBLL();
			outwaybillDemerageDetails 	= damerageChargeBLL.calculateDemerageOnWaybillIds(inHashMap,Long.parseLong(acountGroupId),false,null);

			unlodingChargesBll 			= new UnlodingChargesBll();
			outwaybillUnloadingDetails 	= unlodingChargesBll.calculateUnlodingOnWaybillIds(inHashMap);

			for(Entry<Long, WayBill> entry : waybill.entrySet()) {

				Charges 		= Charges + entry.getKey()+"_"+outwaybillUnloadingDetails.get(entry.getKey())+"_"+outwaybillDemerageDetails.get(entry.getKey())+"_";
				wayBillCharges 	= wayBillDetails.get(entry.getKey()).getWayBillCharges();

				for(int i = 0; i < deliveryCharge.length; i++){

					if(wayBillCharges != null && deliveryCharge.length == wayBillCharges.length){
						Charges = Charges + wayBillCharges[i].getWayBillChargeMasterId()+":"+wayBillCharges[i].getChargeAmount()+";";
					} else {
						Charges = Charges + deliveryCharge[i].getChargeTypeMasterId()+":"+"0;";
					}
				}
				Charges = Charges + "_"+entry.getValue().getDeliveryDiscount(); 
				Charges = Charges + ",";
			}
			return Charges;

		} catch (Exception e) {
			throw e;
		} finally {
			Charges 		= null;
			wayBillIdsArr 	= null;
			wayBillDetails 	= null;
			waybill			= null;
			inHashMap 		= null;
			inValueObject 	= null;
			damerageChargeBLL 			= null;
			outwaybillDemerageDetails 	= null;
			unlodingChargesBll 			= null;
			outwaybillUnloadingDetails 	= null;
			wayBillCharges				= null;
		}
	}
}