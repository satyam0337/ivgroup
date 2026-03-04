package com.ivcargo.actions;
//~--- non-JDK imports --------------------------------------------------------

import java.util.ArrayList;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.CRTxnBLL;
import com.businesslogic.UpdateCrossingHireBLL;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.dto.constant.FeildPermissionsConstant;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.utility.CollectionUtility;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.ChargeTypeMasterDao;
import com.platform.dao.DeliveryContactDetailsDao;
import com.platform.dao.WayBillDao;
import com.platform.dao.WayBillDeliveryChargesDao;
import com.platform.dto.CRTxn;
import com.platform.dto.ChargeTypeMaster;
import com.platform.dto.DeliveryContactDetails;
import com.platform.dto.DispatchLedger;
import com.platform.dto.Executive;
import com.platform.dto.WayBill;
import com.platform.dto.WayBillDeliveryCharges;
import com.platform.dto.WayBillInfo;
import com.platform.dto.configuration.modules.LsConfigurationDTO;
import com.platform.dto.constant.DeliveryStatusConstant;
import com.platform.dto.model.ChargeTypeModel;
import com.platform.dto.model.WayBillForCrossingHire;
import com.platform.dto.model.WayBillForCrossingHireHistory;
import com.platform.resource.CargoErrorList;

public class UpdateWayBillCrossingAmountAction implements Action {

	public static final String 	TRACE_ID 	= "UpdateWayBillCrossingAmountAction";

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {

		HashMap<String,Object>	 	error 					= null;
		String[] 					wayBillIdsStr			= null;
		UpdateCrossingHireBLL		updateCrossingHireBLL	= null;
		WayBillForCrossingHire[]	waybillCrossingHireArr	= null;
		WayBillForCrossingHireHistory[]	waybillCrossingHireHistoryArr	= null;
		DispatchLedger				dispatchLedger			= null;
		ValueObject					valueInObject			= null;
		HashMap<Long,HashMap<Long,WayBillDeliveryCharges>> 		wayBillDeliverychargesHM				= null;
		HashMap<Long,WayBillDeliveryCharges> 					chargeMasterIdWiseHM					= null;
		ArrayList<WayBillDeliveryCharges>				 		updateWayBillDeliverychargelocaltempoAL	= null;
		ArrayList<WayBillDeliveryCharges>				 		insertWayBillDeliverychargelocaltempoAL	= null;
		WayBillDeliveryCharges[]								updatewayBillDeliveryChrgsArr			= null;
		WayBillDeliveryCharges[]								insertwayBillDeliveryChrgsArr			= null;
		WayBillDeliveryCharges									wayBillDeliveryChrgsDTO					= null;
		ChargeTypeModel[] 				deliveryChrgsOfGrpArr		= null;
		HashMap<Long,ChargeTypeModel> 	deliveryChrgsOfGrpHM		= null;
		Executive						executive					= null;
		HashMap<Long, WayBill>			wayBillChrgsHM				= null;
		WayBill							waybill						= null;
		WayBillInfo 					wayBillInfo					= null;
		ArrayList<WayBill>				updateWayBillAmtAL			= null;
		ArrayList<WayBillInfo>			wayBillInfoList				= null;
		WayBillInfo[]					wayBillInfoArray			= null;
		WayBill[]						updateWayBillAmtArr			= null;
		HashMap<Long, DeliveryContactDetails> 		delConColl		= null;
		DeliveryContactDetails						delConDet		= null;
		ArrayList<Long>                 crIdList					= null;
		ValueObject						outValueObject				= null;
		CRTxn[]									crTxnArray						= null;
		DeliveryContactDetails[]				delConDetArray 					= null;
		HashMap<Long, DeliveryContactDetails>			dcdHM					= null;
		CRTxnBLL										crtxnBll				= null;
		ValueObject										crTxnInObject			= null;
		boolean							insert						= false;
		boolean							update						= false;
		boolean							insertLocalTempo			= false;
		long 							dispatchLedgerId			= 0;
		long							wayBillId					= 0;
		double							totalDeliveryAmt			= 0;
		double							deliveryTotal				= 0.00;
		ValueObject						configuration				= null;
		CacheManip						cacheManip					= null;
		boolean							editCrossingAgentName		= false;
		long							selectedCrossingAgentId		= 0;
		boolean							editCrossingAgentNameOnDeliveryType	= false;
		HashMap<?, ?>				execFldPermissions				= null;

		try {

			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			updateCrossingHireBLL	= new UpdateCrossingHireBLL();
			wayBillIdsStr = request.getParameter("wayBillIds").split(";");

			updateWayBillDeliverychargelocaltempoAL 	= new ArrayList<>();
			insertWayBillDeliverychargelocaltempoAL 	= new ArrayList<>();
			updateWayBillAmtAL							= new ArrayList<>();
			wayBillInfoList								= new ArrayList<>();
			crIdList									= new ArrayList<>();
			dcdHM										= new HashMap<>();
			crtxnBll									= new CRTxnBLL();
			cacheManip									= new CacheManip(request);

			//Get Acc Grp Delivery Charges
			executive				= cacheManip.getExecutive(request);
			configuration			= cacheManip.getLsConfiguration(request, executive.getAccountGroupId());
			deliveryChrgsOfGrpHM	= new HashMap<>();
			deliveryChrgsOfGrpArr 	= ChargeTypeMasterDao.getInstance().getCharges(executive.getAccountGroupId()+"", ChargeTypeMaster.WAYBILL_CHARGETYPE_DELIVERY);
			execFldPermissions		= cacheManip.getExecutiveFieldPermission(request);
			editCrossingAgentNameOnDeliveryType	= configuration.getBoolean(LsConfigurationDTO.EDIT_CROSSING_AGENT_NAME_ON_DELIVERY_TYPE, false);

			editCrossingAgentName	= editCrossingAgentNameOnDeliveryType && execFldPermissions != null && execFldPermissions.get(FeildPermissionsConstant.EDIT_CROSSING_AGENT_NAME) != null;

			if(deliveryChrgsOfGrpArr != null && deliveryChrgsOfGrpArr.length > 0)
				for (final ChargeTypeModel element : deliveryChrgsOfGrpArr)
					deliveryChrgsOfGrpHM.put(element.getChargeTypeMasterId(), element);

			//Get Acc Grp Delivery Charges

			//Get WayBill Charges from waybill charges table( Start )
			final String	wayBillIds	= CollectionUtility.getStringFromStringArray(wayBillIdsStr);

			wayBillDeliverychargesHM	= WayBillDeliveryChargesDao.getInstance().getWayBillIdWiseChargesMap(wayBillIds);
			//Get WayBill Charges from waybill charges table( End )

			//Get wayBill charges from waybill table
			wayBillChrgsHM = WayBillDao.getInstance().getLimitedLRDetails(wayBillIds);
			delConColl 	   = DeliveryContactDetailsDao.getInstance().getLimitedDeliveryContactDetails(wayBillIds, DeliveryStatusConstant.CR_STATUS_BOOKED);
			//Get wayBill charges from waybill table
			//

			if(wayBillIdsStr  != null && wayBillIdsStr.length > 0){

				dispatchLedgerId = JSPUtility.GetLong(request, "dispatchLedgerId");
				selectedCrossingAgentId = JSPUtility.GetLong(request, "selectedCrossingAgentId", 0);
				dispatchLedger = new DispatchLedger();
				dispatchLedger.setDispatchLedgerId(dispatchLedgerId);

				waybillCrossingHireArr 			= new WayBillForCrossingHire[wayBillIdsStr.length];
				waybillCrossingHireHistoryArr 	= new WayBillForCrossingHireHistory[wayBillIdsStr.length];

				for (int i = 0; i < wayBillIdsStr.length; i++) {
					deliveryTotal = 0.00;
					insert 				= false;
					update 				= false;
					insertLocalTempo	= false;
					wayBillId 	= Long.parseLong(wayBillIdsStr[i]);

					waybillCrossingHireArr[i] 			= new WayBillForCrossingHire();
					waybillCrossingHireHistoryArr[i] 	= new WayBillForCrossingHireHistory();

					waybillCrossingHireArr[i].setWayBillId(wayBillId);

					if(editCrossingAgentName)
						waybillCrossingHireArr[i].setCrossingAgentId(JSPUtility.GetLong(request, "wayBillCrossingAgentId_"+wayBillId, 0));
					else
						waybillCrossingHireArr[i].setCrossingAgentId(JSPUtility.GetLong(request, "selectedCrossingAgentId", 0));

					waybillCrossingHireArr[i].setCrossingAmountHire(JSPUtility.GetDouble(request, "amount_"+wayBillId,0.00));
					waybillCrossingHireArr[i].setLocalTempoBhada(JSPUtility.GetDouble(request, "localBhadaAmount_"+wayBillId,0.00));
					waybillCrossingHireArr[i].setCrossingWayBillNo(JSPUtility.GetString(request, "crossingLRNo_"+wayBillId,null));
					waybillCrossingHireArr[i].setDispatchLedgerId(dispatchLedgerId);
					waybillCrossingHireArr[i].setDoorDelivery(JSPUtility.GetDouble(request, "doorDly_"+wayBillId,0.00));
					waybillCrossingHireArr[i].setTxnTypeId(JSPUtility.GetLong(request, "txnTypeId_"+wayBillId,0));
					waybillCrossingHireArr[i].setHamali(JSPUtility.GetDouble(request, "hamali_"+wayBillId,0.00));

					if(waybillCrossingHireArr[i].getCrossingAgentId() > 0 && waybillCrossingHireArr[i].getTxnTypeId() <= 0)
						waybillCrossingHireArr[i].setTxnTypeId(WayBillForCrossingHire.TRANSACTION_TYPE_DELIVERY_CROSSING);

					waybillCrossingHireHistoryArr[i].setAccountGroupId(executive.getAccountGroupId());
					waybillCrossingHireHistoryArr[i].setBranchId(executive.getBranchId());
					waybillCrossingHireHistoryArr[i].setExecutiveId(executive.getExecutiveId());
					waybillCrossingHireHistoryArr[i].setUpdatedDateTimeStamp(DateTimeUtility.getCurrentTimeStamp());

					waybillCrossingHireHistoryArr[i].setDispatchLedgerId(dispatchLedgerId);
					waybillCrossingHireHistoryArr[i].setWayBillId(wayBillId);
					waybillCrossingHireHistoryArr[i].setCrossingAgentId(waybillCrossingHireArr[i].getCrossingAgentId());
					waybillCrossingHireHistoryArr[i].setCrossingAmountHire(waybillCrossingHireArr[i].getCrossingAmountHire());
					waybillCrossingHireHistoryArr[i].setLocalTempoBhada(waybillCrossingHireArr[i].getLocalTempoBhada());
					waybillCrossingHireHistoryArr[i].setCrossingWayBillNo(waybillCrossingHireArr[i].getCrossingWayBillNo());

					waybillCrossingHireHistoryArr[i].setPreviousCrossingAgentId(JSPUtility.GetLong(request, "previousCrossingAgentId", 0));
					waybillCrossingHireHistoryArr[i].setPreviousCrossingAmountHire(JSPUtility.GetDouble(request, "previousAmount_"+wayBillId,0.00));
					waybillCrossingHireHistoryArr[i].setPreviousCrossingWayBillNo(JSPUtility.GetString(request, "previousCrossingLRNo_"+wayBillId,null));
					waybillCrossingHireHistoryArr[i].setPreviousLocalTempoBhada(JSPUtility.GetDouble(request, "previousLocalBhadaAmount_"+wayBillId,0.00));
					waybillCrossingHireHistoryArr[i].setTxnTypeId(WayBillForCrossingHire.TRANSACTION_TYPE_DELIVERY_CROSSING);
					waybillCrossingHireHistoryArr[i].setDoorDelivery(waybillCrossingHireArr[i].getDoorDelivery());
					waybillCrossingHireHistoryArr[i].setHamali(waybillCrossingHireArr[i].getHamali());

					dispatchLedger.setLocalTempoBhada(dispatchLedger.getLocalTempoBhada() + waybillCrossingHireArr[i].getLocalTempoBhada());

					//
					waybill = new WayBill();
					wayBillInfo = new WayBillInfo();

					if(wayBillDeliverychargesHM.get(wayBillId) == null)
						insert = true;
					else{
						chargeMasterIdWiseHM = wayBillDeliverychargesHM.get(wayBillId);
						totalDeliveryAmt = 0;

						for(final Long chrgIdKey : chargeMasterIdWiseHM.keySet())
							if(chargeMasterIdWiseHM.get(chrgIdKey) != null /*&& chargeMasterIdWiseHM.get(chrgIdKey).getChargeAmount() != 0*/){
								if(chrgIdKey != ChargeTypeMaster.LOCAL_TEMPO )
									totalDeliveryAmt = totalDeliveryAmt	+ chargeMasterIdWiseHM.get(chrgIdKey).getChargeAmount();
								wayBillDeliveryChrgsDTO = chargeMasterIdWiseHM.get(chrgIdKey);

								if(chrgIdKey == ChargeTypeMaster.LOCAL_TEMPO && request.getParameter("localBhadaAmount_"+wayBillId) != null){
									wayBillDeliveryChrgsDTO.setChargeAmount(JSPUtility.GetDouble(request, "localBhadaAmount_"+wayBillId, 0.0));
									updateWayBillDeliverychargelocaltempoAL.add(wayBillDeliveryChrgsDTO);
									totalDeliveryAmt = totalDeliveryAmt	+ chargeMasterIdWiseHM.get(chrgIdKey).getChargeAmount();
									update 	= true;
								}
							}
					}

					if(insert){
						wayBillInfo.setDeliveryChargesSum(JSPUtility.GetDouble(request, "localBhadaAmount_"+wayBillId, 0.0));
						insertLocalTempo		= true;
					} else {
						wayBillInfo.setDeliveryChargesSum(totalDeliveryAmt);
						if(!update)
							insertLocalTempo	= true;
					}
					wayBillInfo.setDeliveryTimeServiceTax(wayBillChrgsHM.get(wayBillId).getDeliveryTimeServiceTax());
					wayBillInfo.setDeliveryDiscount(wayBillChrgsHM.get(wayBillId).getDeliveryDiscount());
					deliveryTotal = wayBillInfo.getDeliveryChargesSum() + wayBillInfo.getDeliveryTimeServiceTax() - wayBillInfo.getDeliveryDiscount();

					wayBillInfo.setDeliveryTotal(deliveryTotal);
					wayBillInfo.setGrandTotal(wayBillChrgsHM.get(wayBillId).getBookingTotal() + wayBillInfo.getDeliveryTotal());

					if(insertLocalTempo){
						wayBillDeliveryChrgsDTO	= new WayBillDeliveryCharges();
						wayBillDeliveryChrgsDTO.setWayBillId(wayBillId);
						wayBillDeliveryChrgsDTO.setMarkForDelete(false);
						wayBillDeliveryChrgsDTO.setAccountGroupId(executive.getAccountGroupId());
						wayBillDeliveryChrgsDTO.setWayBillChargeMasterId(Long.parseLong(ChargeTypeMaster.LOCAL_TEMPO+""));
						wayBillDeliveryChrgsDTO.setChargeAmount(JSPUtility.GetDouble(request, "localBhadaAmount_"+wayBillId, 0.0));
						insertWayBillDeliverychargelocaltempoAL.add(wayBillDeliveryChrgsDTO);
					}
					wayBillInfo.setWayBillId(wayBillId);
					wayBillInfoList.add(wayBillInfo);

					waybill.setDeliveryAmount(wayBillInfo.getDeliveryChargesSum() + wayBillInfo.getDeliveryTimeServiceTax());
					waybill.setGrandTotal(wayBillInfo.getGrandTotal());
					waybill.setWayBillId(wayBillId);
					updateWayBillAmtAL.add(waybill);

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

				if(crIdList != null && !crIdList.isEmpty()){
					crTxnInObject = new ValueObject();
					crTxnInObject.put("crIdList", crIdList);
					crTxnInObject.put("dcdHM", dcdHM);
					crTxnInObject.put("wayBillHM", wayBillChrgsHM);

					outValueObject = crtxnBll.calculateCRAmount(crTxnInObject);

					if(outValueObject != null)
						crTxnArray = (CRTxn[])outValueObject.get("crTxnArray");
				}

				valueInObject = new ValueObject();
				valueInObject.put("waybillCrossingHireArr", waybillCrossingHireArr);
				valueInObject.put("waybillCrossingHireHistoryArr", waybillCrossingHireHistoryArr);
				valueInObject.put("dispatchLedger", dispatchLedger);

				updateWayBillAmtArr = new WayBill[updateWayBillAmtAL.size()];
				for(int i=0 ; i<updateWayBillAmtAL.size() ; i++)
					updateWayBillAmtArr[i] = updateWayBillAmtAL.get(i);

				wayBillInfoArray= new WayBillInfo[wayBillInfoList.size()];
				wayBillInfoList.toArray(wayBillInfoArray);

				updatewayBillDeliveryChrgsArr = new WayBillDeliveryCharges[updateWayBillDeliverychargelocaltempoAL.size()];

				for(int i=0 ; i<updateWayBillDeliverychargelocaltempoAL.size() ; i++)
					updatewayBillDeliveryChrgsArr[i] = updateWayBillDeliverychargelocaltempoAL.get(i);

				insertwayBillDeliveryChrgsArr = new WayBillDeliveryCharges[insertWayBillDeliverychargelocaltempoAL.size()];

				for(int i=0 ; i<insertWayBillDeliverychargelocaltempoAL.size() ; i++)
					insertwayBillDeliveryChrgsArr[i] = insertWayBillDeliverychargelocaltempoAL.get(i);

				if(updatewayBillDeliveryChrgsArr.length > 0)
					valueInObject.put("updatewayBillDeliveryChrgsArr", updatewayBillDeliveryChrgsArr);

				if(insertwayBillDeliveryChrgsArr.length > 0)
					valueInObject.put("insertwayBillDeliveryChrgsArr", insertwayBillDeliveryChrgsArr);

				if(updateWayBillAmtArr.length > 0)
					valueInObject.put("updateWayBillAmtArr", updateWayBillAmtArr);

				valueInObject.put("wayBillInfoArray", wayBillInfoArray);

				if(delConColl != null && delConColl.size() > 0)
					delConDetArray = delConColl.values().toArray(new DeliveryContactDetails[delConColl.size()]);

				valueInObject.put("crTxnArray", crTxnArray);
				valueInObject.put("delConDetArray", delConDetArray);
				valueInObject.put("selectedCrossingAgentId", selectedCrossingAgentId);

				updateCrossingHireBLL.waybillCrossingHireArr(valueInObject);

			} else {
				error.put("errorCode", CargoErrorList.NO_RECORDS);
				error.put("errorDescription", CargoErrorList.NO_RECORDS_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}

			request.setAttribute("dispatchLedgerId", dispatchLedgerId);
			request.setAttribute("isUpdate", true);
			request.setAttribute("nextPageToken", "success");

		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		} finally {
			wayBillIdsStr							= null;
			updateCrossingHireBLL					= null;
			waybillCrossingHireArr					= null;
			dispatchLedger							= null;
			valueInObject							= null;
			wayBillDeliverychargesHM				= null;
			chargeMasterIdWiseHM					= null;
			updateWayBillDeliverychargelocaltempoAL	= null;
			insertWayBillDeliverychargelocaltempoAL	= null;
			updatewayBillDeliveryChrgsArr			= null;
			insertwayBillDeliveryChrgsArr			= null;
			wayBillDeliveryChrgsDTO					= null;
			deliveryChrgsOfGrpArr					= null;
			deliveryChrgsOfGrpHM					= null;
			executive								= null;
			wayBillChrgsHM							= null;
			totalDeliveryAmt						= 0;
			waybill									= null;
			updateWayBillAmtAL						= null;
			updateWayBillAmtArr						= null;
			insert									= false;
			update									= false;
			insertLocalTempo						= false;
		}

	}
}