package com.ivcargo.actions.transport;

import java.io.PrintWriter;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONObject;

import com.businesslogic.CRTxnBLL;
import com.businesslogic.ChargeConfigBLL;
import com.framework.Action;
import com.iv.logsapp.LogWriter;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.platform.dao.DeliveryContactDetailsDao;
import com.platform.dao.WayBillDao;
import com.platform.dao.reports.WayBillDetailsDAO;
import com.platform.dto.CRTxn;
import com.platform.dto.ChargeConfig;
import com.platform.dto.ChargeTypeMaster;
import com.platform.dto.DeliveryContactDetails;
import com.platform.dto.Executive;
import com.platform.dto.WayBill;
import com.platform.dto.WayBillCharges;
import com.platform.dto.WayBillDeliveryCharges;
import com.platform.dto.WayBillInfo;
import com.platform.dto.WayBillTaxTxn;
import com.platform.dto.model.WayBillChargeConfigModel;
import com.platform.dto.model.WayBillDeatailsModel;
import com.platform.utils.Utility;

public class TransportAddWayBillWiseChargeConfigAction implements Action {

	private static final String TRACE_ID = "TransportAddWayBillWiseChargeConfigAction";

	public void execute(HttpServletRequest request, HttpServletResponse response) {
		// TODO Auto-generated method stub
		HashMap<String,Object>						error 							 = null;
		Executive 									executive 						 = null;
		ChargeConfigBLL 							chargeConfigBLL					 = null;
		ValueObject 								inValObj        				 = null;
		String										wayBillNumberIds 				 = null;
		WayBillChargeConfigModel[] 					wayBillChargeConfigUserModels	 = null;
		PrintWriter									out						         = null;
		JSONObject			 						jsonObjectGet			         = null;
		JSONObject									jsonObjectOut			         = null;
		HashMap<Long, WayBill>      				wayBillHM						= null;
		ArrayList<WayBillInfo> 						wayBillInfoList 				= null;
		WayBillInfo[]								wayBillInfoArray				= null;
		HashMap<Long, DeliveryContactDetails> 	delConColl			= null;
		DeliveryContactDetails					delConDet			= null;
		ArrayList<Long>                			crIdList			= null;
		ValueObject								outValueObject		= null;
		CRTxn[]									crTxnArray			= null;			
		DeliveryContactDetails[]				delConDetArray 		= null;
		HashMap<Long, DeliveryContactDetails>			dcdHM					= null; 
		CRTxnBLL										crtxnBll						= null;
		ValueObject										crTxnInObject					= null;
		WayBillInfo			wayBillInfo			= null;	

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error)){
				return;
			}

			response.setContentType("application/json"); // Setting response for JSON Content

			jsonObjectGet 	 = new JSONObject(request.getParameter("json"));
			wayBillNumberIds = jsonObjectGet.get("wayBillNumberIds")+"";
			out				 = response.getWriter();

			JSONObject jsonObject	= new JSONObject(jsonObjectGet.get("waybillamounts").toString());
			executive 		= (Executive) request.getSession().getAttribute("executive");
			chargeConfigBLL = new ChargeConfigBLL();
			inValObj        = new ValueObject();
			inValObj.put("wayBillNumberIds",wayBillNumberIds);
			int			filter			= 1;
			inValObj.put("filter", filter);
			wayBillChargeConfigUserModels = chargeConfigBLL.getWayBillWiseChargeConfigDetails(inValObj);

			for (int i = 0; i < wayBillChargeConfigUserModels.length; i++) {
				wayBillChargeConfigUserModels[i].setChargeAmount(Double.parseDouble(jsonObject.get(wayBillChargeConfigUserModels[i].getWayBillId()+"").toString()));
			}

			WayBillChargeConfigModel[] wayBillChargeConfigModels = chargeConfigBLL.getWayBillWiseChargeConfigExistDetails(inValObj);

			ArrayList<ChargeConfig> 	insertChargeConfig 		= new ArrayList<ChargeConfig>();
			ArrayList<ChargeConfig> 	updateChargeConfig 		= new ArrayList<ChargeConfig>();
			ArrayList<WayBillDeliveryCharges> 	updateWayBillCharges 	= new ArrayList<WayBillDeliveryCharges>();
			ArrayList<Long> 			wayBillIds 				= new ArrayList<Long>();
			wayBillInfoList 			= new ArrayList<WayBillInfo>();
			crIdList	= new ArrayList<Long>();
			dcdHM		= new HashMap<Long, DeliveryContactDetails>();
			crtxnBll	= new CRTxnBLL();

			Timestamp 	createDate 	= new Timestamp(new Date().getTime());
			int 		increment 	= 0;
			boolean 	update 		= false;

			if(wayBillChargeConfigModels.length > 0){ 

				for (int i = 0; i < wayBillChargeConfigUserModels.length; i++) {
					increment 	= 0;
					update 		= false;

					for(int j=0; j < wayBillChargeConfigModels.length; j++){
						if(wayBillChargeConfigUserModels[i].getWayBillId() == wayBillChargeConfigModels[j].getWayBillId()){
							increment++;
							if(wayBillChargeConfigUserModels[i].getChargeAmount() != wayBillChargeConfigModels[j].getChargeAmount()){
								update = true;
							}
						}
					}

					if(increment == 0){
						//Insert into ChargeConfig
						if(wayBillChargeConfigUserModels[i].getChargeAmount() > 0){
							insertChargeConfig.add(getChargeConfigModel(executive ,wayBillChargeConfigUserModels[i] ,createDate));
						}
					} else{
						if(update){
							//Update into ChargeConfig
							updateChargeConfig.add(getChargeConfigModel(executive ,wayBillChargeConfigUserModels[i] ,createDate));
						}
					}
				}
			} else {
				//Insert into ChargeConfig
				for (int i = 0; i < wayBillChargeConfigUserModels.length; i++) {
					if(wayBillChargeConfigUserModels[i].getChargeAmount() > 0){
						insertChargeConfig.add(getChargeConfigModel(executive ,wayBillChargeConfigUserModels[i] ,createDate));
					}
				}
			}

			for (int i = 0; i < wayBillChargeConfigUserModels.length; i++) {
				if(wayBillChargeConfigUserModels[i].getStatus() == WayBill.WAYBILL_STATUS_DUEUNDELIVERED){
					updateWayBillCharges.add(getWayBillChargesDto(wayBillChargeConfigUserModels[i]));
					wayBillIds.add(wayBillChargeConfigUserModels[i].getWayBillId());
				}
			}

			ChargeConfig[] insertChargeConfigArr = new ChargeConfig[insertChargeConfig.size()];
			insertChargeConfig.toArray(insertChargeConfigArr);

			ChargeConfig[] updateChargeConfigArr = new ChargeConfig[updateChargeConfig.size()];
			updateChargeConfig.toArray(updateChargeConfigArr);

			WayBillDeliveryCharges[] wayBillChargesArr = new WayBillDeliveryCharges[updateWayBillCharges.size()];
			updateWayBillCharges.toArray(wayBillChargesArr);

			Long[] wayBillIdArray = new Long[wayBillIds.size()];
			wayBillIds.toArray(wayBillIdArray);

			WayBill[] wayBill = new WayBill[0];

			if(wayBillIdArray.length > 0){

				HashMap<Long, WayBillDeatailsModel> wayBillDetails  = WayBillDetailsDAO.getInstance().getWayBillDetails(wayBillIdArray ,true ,ChargeTypeMaster.WAYBILL_CHARGETYPE_DELIVERY ,true ,WayBillTaxTxn.WAYBILL_TAX_TXN_TYPE_BOOKING ,false);
				wayBillHM	= WayBillDao.getInstance().getLimitedLRDetails(Utility.GetLongArrayListToString(wayBillIds));
				delConColl  = DeliveryContactDetailsDao.getInstance().getDeliveryContactDetails(Utility.GetLongArrayListToString(wayBillIds));
				wayBill 			= new WayBill[wayBillChargesArr.length];
				WayBillCharges[] 	wayBillCharges 		= null;
				WayBillTaxTxn[] 	wayBillTax 			= null;
				double 				totalCharges		= 0.00;
				double 				totalTax 			= 0.00;
				double 				deliveryTotal 		= 0.00;

				for (int i = 0; i < wayBillChargesArr.length; i++) {

					deliveryTotal = 0.00;
					wayBill[i] = new WayBill();
					//WayBill Charges (Delivery)
					wayBillCharges = wayBillDetails.get(wayBillChargesArr[i].getWayBillId()).getWayBillCharges();
					totalCharges = 0.00;
					for(int j=0;j<wayBillCharges.length;j++){
						if(wayBillCharges[j].getWayBillChargeMasterId() == ChargeTypeMaster.OCTROI_DELIVERY){
							totalCharges = totalCharges + wayBillChargesArr[i].getChargeAmount();
						} else {
							totalCharges = totalCharges + wayBillCharges[j].getChargeAmount();
						}
					}
					//end

					//Calculate Total WayBill Tax
					wayBillTax 	= wayBillDetails.get(wayBillChargesArr[i].getWayBillId()).getWayBillTaxTxn();
					totalTax 	= 0.00;
					for(int k=0;k<wayBillTax.length;k++){
						totalTax = totalTax + wayBillTax[k].getTaxAmount();
					}
					//end

					//Calculate Total Discount
					/*totalDiscount = 0.00;
					if(wayBillChargesArr[i].isDiscountPercent()){
						totalDiscount = Math.round(wayBillChargesArr[i].getAmount() * wayBillChargesArr[i].getDiscount() / 100);
					}else{
						totalDiscount = wayBillChargesArr[i].getDiscount();
					}
					//end

					wayBill[i].setWayBillId(wayBillChargesArr[i].getWayBillId());
					wayBill[i].setDeliveryAmount(totalCharges);
					wayBill[i].setGrandTotal(wayBillChargesArr[i].getAmount() + totalCharges + totalTax - totalDiscount);*/

					wayBillInfo	    = new WayBillInfo();
					wayBillInfo.setWayBillId(wayBillChargesArr[i].getWayBillId());
					wayBillInfo.setDeliveryChargesSum(totalCharges);
					wayBillInfo.setDeliveryTimeServiceTax(wayBillHM.get(wayBillChargesArr[i].getWayBillId()).getDeliveryTimeServiceTax());
					wayBillInfo.setDeliveryDiscount(wayBillHM.get(wayBillChargesArr[i].getWayBillId()).getDeliveryDiscount());
					
					deliveryTotal = (wayBillInfo.getDeliveryChargesSum() + wayBillInfo.getDeliveryTimeServiceTax()) - wayBillInfo.getDeliveryDiscount();
					
					wayBillInfo.setDeliveryTotal(deliveryTotal);
					wayBillInfo.setGrandTotal(wayBillHM.get(wayBillChargesArr[i].getWayBillId()).getBookingTotal() + wayBillInfo.getDeliveryTotal());
					
					wayBillInfoList.add(wayBillInfo);
					
					wayBill[i].setWayBillId(wayBillChargesArr[i].getWayBillId());
					wayBill[i].setDeliveryAmount(wayBillInfo.getDeliveryChargesSum() + wayBillInfo.getDeliveryTimeServiceTax());
					wayBill[i].setGrandTotal(wayBillInfo.getGrandTotal());
					
					if(delConColl != null && delConColl.size() > 0){
						delConDet 	= delConColl.get(wayBillInfo.getWayBillId());
						
						if(delConDet != null){

							delConDet.setDeliverySumCharges(wayBillInfo.getDeliveryChargesSum());
							delConDet.setDeliveryTimeTax(wayBillInfo.getDeliveryTimeServiceTax());
							delConDet.setDeliveryDiscount(wayBillInfo.getDeliveryDiscount());
							delConDet.setDeliveryTotal(wayBillInfo.getDeliveryTotal());
							delConDet.setGrandTotal(wayBillInfo.getGrandTotal());

							crIdList.add(delConDet.getCrId());
							dcdHM.put(wayBillInfo.getWayBillId(),delConDet);
						}
					}	
				}
			}
			
			/*if(crIdList != null && crIdList.size() > 0){
				outValueObject         = WayBillInfoDao.getInstance().getByCRIds(Utility.getStringFromArrayList(crIdList));

				if(outValueObject != null){
					crIdWiseWayBillInfoListHM = 	(HashMap<Long, ArrayList<WayBillInfo>>)outValueObject.get("crIdWiseWayBillInfoListHM");

					for(Long key : crIdWiseWayBillInfoListHM.keySet()){
						wayBillInfoArrayListFromDB = crIdWiseWayBillInfoListHM.get(key);
						crAmount	= 0.00;

						for(int i = 0; i < wayBillInfoArrayListFromDB.size(); i++){
							wayBillInfo = wayBillInfoHM.get(wayBillInfoArrayListFromDB.get(i).getWayBillId());
							if(wayBillInfo != null){
								if(wayBillInfoArrayListFromDB.get(i).getWayBillTypeId() == WayBillType.WAYBILL_TYPE_TO_PAY){
									crAmount += wayBillInfo.getGrandTotal();
								} else {
									crAmount += wayBillInfo.getDeliveryTotal();
								}
							} else {
								if(wayBillInfoArrayListFromDB.get(i).getWayBillTypeId() == WayBillType.WAYBILL_TYPE_TO_PAY){
									crAmount += wayBillInfoArrayListFromDB.get(i).getGrandTotal();
								} else {
									crAmount += wayBillInfoArrayListFromDB.get(i).getDeliveryTotal();
								}
							}
						}

						crTxn = new CRTxn();
						crTxn.setCrId(key);
						crTxn.setCrAmount(crAmount);
						crTxnList.add(crTxn);
					}
				}
			}*/
			
			if(crIdList != null && crIdList.size() > 0){
				outValueObject         = DeliveryContactDetailsDao.getInstance().getDeliveryDetailsByCRIds(Utility.getStringFromArrayList(crIdList));

				if(crIdList != null && crIdList.size() > 0){
					
					crTxnInObject = new ValueObject();
					crTxnInObject.put("crIdList", crIdList);
					crTxnInObject.put("dcdHM", dcdHM);
					crTxnInObject.put("wayBillHM", wayBillHM);
					
					outValueObject = crtxnBll.calculateCRAmount(crTxnInObject);
					if(outValueObject != null){
						crTxnArray = (CRTxn[])outValueObject.get("crTxnArray");
					}
				}
			}
			
			wayBillInfoArray = new WayBillInfo[wayBillInfoList.size()];
			wayBillInfoList.toArray(wayBillInfoArray);

			if(delConColl != null && delConColl.size() > 0){
				delConDetArray = delConColl.values().toArray(new DeliveryContactDetails[delConColl.size()]);
			}
			
			inValObj.put("insertChargeConfigArr", insertChargeConfigArr);
			inValObj.put("updateChargeConfigArr", updateChargeConfigArr);
			inValObj.put("wayBillChargesArr", wayBillChargesArr);
			inValObj.put("wayBillInfoArray", wayBillInfoArray);
			inValObj.put("wayBill", wayBill);
			inValObj.put("crTxnArray", crTxnArray);
			inValObj.put("delConDetArray", delConDetArray);

			chargeConfigBLL.performChargeConfigOpration(inValObj);


			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_DEBUG, "success");
			jsonObjectOut	 = new JSONObject();
			jsonObjectOut.put("success", true);

			out.println(jsonObjectOut);
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_DEBUG, "success");

		} catch (Exception _e) {
			//ActionStepsUtil.catchActionException(request, _e, error);
		}finally{
			out.close();
			out					= null;
		}

	}

	private ChargeConfig getChargeConfigModel(Executive executive ,WayBillChargeConfigModel wayBillChargeConfigUserModels ,Timestamp createDate) {
		ChargeConfig chargeConfig = new ChargeConfig();

		chargeConfig.setChargeTypeMasterId(ChargeTypeMaster.OCTROI_DELIVERY);
		chargeConfig.setChargesAmount(wayBillChargeConfigUserModels.getChargeAmount());
		chargeConfig.setExecutiveId(executive.getExecutiveId());
		chargeConfig.setDateTime(createDate);
		chargeConfig.setWayBillId(wayBillChargeConfigUserModels.getWayBillId());
		chargeConfig.setAccountGroupId(wayBillChargeConfigUserModels.getAccountGroupId());
		chargeConfig.setBookedForAccountGroupId(wayBillChargeConfigUserModels.getBookedForAccountGroupId());

		return chargeConfig;
	}

	private WayBillDeliveryCharges getWayBillChargesDto(WayBillChargeConfigModel wayBillChargeConfigUserModels) {
		WayBillDeliveryCharges wayBillCharges = new WayBillDeliveryCharges();

		wayBillCharges.setWayBillId(wayBillChargeConfigUserModels.getWayBillId());
		wayBillCharges.setWayBillChargeMasterId(ChargeTypeMaster.OCTROI_DELIVERY);
		wayBillCharges.setChargeAmount(wayBillChargeConfigUserModels.getChargeAmount());
		wayBillCharges.setAmount(wayBillChargeConfigUserModels.getAmount());
		wayBillCharges.setDiscountPercent(wayBillChargeConfigUserModels.isDiscountPercent());
		wayBillCharges.setDiscount(wayBillChargeConfigUserModels.getDiscount());

		return wayBillCharges;
	}
}