package com.ivcargo.reports;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.bll.impl.properties.DoorDeliveryExpensePropertyConfigBllImpl;
import com.iv.constant.properties.DoorDeliveryExpensePropertyConfigConstant;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.ConsignmentSummaryDao;
import com.platform.dao.CustomerDetailsDao;
import com.platform.dao.DeliveryContactDetailsDao;
import com.platform.dao.ExpenseChargeDao;
import com.platform.dao.WayBillBookingChargesDao;
import com.platform.dao.WayBillDao;
import com.platform.dao.WayBillHistoryDao;
import com.platform.dao.reports.DoorDeliveryExpenseReportDao;
import com.platform.dto.Branch;
import com.platform.dto.ConsignmentSummary;
import com.platform.dto.CustomerDetails;
import com.platform.dto.DeliveryContactDetails;
import com.platform.dto.DoorDeliveryExpenseModel;
import com.platform.dto.Executive;
import com.platform.dto.IncomeExpenseChargeMaster;
import com.platform.dto.TransportCommonMaster;
import com.platform.dto.WayBill;
import com.platform.dto.WayBillType;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

public class DoorDeliveryExpenseReportAction implements Action {

	@Override
	@SuppressWarnings("unchecked")
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		// TODO Auto-generated method stub
		HashMap<String,Object>	 				error 					= null;
		Executive        						executive   			= null;
		CacheManip 								cacheManip 				= null;
		SimpleDateFormat 						sdf            			= null;
		Timestamp        						fromDate       			= null;
		Timestamp        						toDate         			= null;
		ValueObject 							objectOut 				= null;
		ArrayList<Long>							wayBillIdList			= null;
		HashMap<Long, ConsignmentSummary> 		conSumColl 				= null;
		HashMap<Long, CustomerDetails>			consignorColl			= null;
		HashMap<Long, CustomerDetails>			consigneeColl			= null;
		String									wayBillStr				= null;
		CustomerDetails							consignor				= null;
		CustomerDetails							consignee				= null;
		ConsignmentSummary						conSum					= null;
		WayBill									wayBill					= null;
		String 									branchIds				= null;
		DoorDeliveryExpenseModel				model					= null;
		HashMap<Long, DeliveryContactDetails> 	delConColl				= null;
		DeliveryContactDetails					delConDet				= null;
		HashMap<Long, WayBill> 					lrColl  				= null;
		HashMap<Long,WayBill> 					wayBillHM				= null;
		HashMap<Long, Double> 					bookingChargeHM			= null;
		HashMap<Long, DoorDeliveryExpenseModel> resultHM				= null;
		ArrayList<Long>                         wbIdListNotBooked 		= null;
		HashMap<Long,IncomeExpenseChargeMaster>	expenseChargeHM			= null;
		IncomeExpenseChargeMaster				expenseCharge		 	= null;
		Branch									srcBranch				= null;
		double  								chargeAmt				= 0.00;
		HashMap<Object, Object>					doorDeliveryExpValObj 	= null;
		String									chargeMappingID			= null;
		DoorDeliveryExpensePropertyConfigBllImpl  doorDeliveryExpensePropertyConfigBllImpl	= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeDoorDeliveryExpenseReportAction().execute(request, response);

			sdf			= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			fromDate	= new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00").getTime());
			toDate		= new Timestamp(sdf.parse(JSPUtility.GetString(request, "toDate") + " 23:59:59").getTime());

			cacheManip  = new CacheManip(request);
			executive   = cacheManip.getExecutive(request);

			doorDeliveryExpensePropertyConfigBllImpl	= new DoorDeliveryExpensePropertyConfigBllImpl();

			doorDeliveryExpValObj		= doorDeliveryExpensePropertyConfigBllImpl.getDoorDeliveryExpenseProperties(executive.getAccountGroupId());
			chargeMappingID				= (String) doorDeliveryExpValObj.getOrDefault(DoorDeliveryExpensePropertyConfigConstant.CHARGE_MAPPING_ID, "0");

			ActionStaticUtil.executiveTypeWiseBranches(request, cacheManip, executive);

			branchIds		= ActionStaticUtil.getPhysicalBranchIds(request, cacheManip, executive);

			expenseChargeHM = ExpenseChargeDao.getInstance().getExpenseChargeByMappingChargeIdAndAccountGroupId(executive.getAccountGroupId(), Short.parseShort(chargeMappingID), TransportCommonMaster.CHARGE_TYPE_LR);

			if(expenseChargeHM != null && expenseChargeHM.size() > 0){
				expenseCharge = expenseChargeHM.get(Long.parseLong(chargeMappingID));
				objectOut     = DoorDeliveryExpenseReportDao.getInstance().getBranchWiseExpenseReport(executive.getAccountGroupId(),fromDate,toDate,branchIds,TransportCommonMaster.CHARGE_TYPE_LR,expenseCharge.getIncomeExpenseChargeMasterId());
			}

			if(objectOut != null) {

				resultHM	 	= (HashMap<Long, DoorDeliveryExpenseModel>)objectOut.get("resultHM");
				wayBillIdList 	= (ArrayList<Long>) objectOut.get("wayBillIdsArrayList");

				if (resultHM != null && resultHM.size() > 0) {

					wbIdListNotBooked = new ArrayList<Long>();
					wayBillStr 		= Utility.GetLongArrayListToString(wayBillIdList);
					conSumColl 		= ConsignmentSummaryDao.getInstance().getConsignmentSummaryWeightsByWayBillIds(wayBillStr);
					consignorColl 	= CustomerDetailsDao.getInstance().getConsignorDetailsByWayBillId(wayBillStr);
					consigneeColl 	= CustomerDetailsDao.getInstance().getConsigneeDetailsByWayBillId(wayBillStr);
					delConColl		= DeliveryContactDetailsDao.getInstance().getDeliveryContactDetailsForBLHPV(wayBillStr);
					lrColl			= WayBillDao.getInstance().getLRCurrentTimeStamp(wayBillStr);
					bookingChargeHM = WayBillBookingChargesDao.getInstance().getWayBillChargeMapByWayBillIdsAndChargeMasterId(wayBillStr, Short.parseShort(chargeMappingID));

					for(final Long key : lrColl.keySet()){

						wayBill = lrColl.get(key);
						if(wayBill.getStatus() != WayBill.WAYBILL_STATUS_BOOKED)
							wbIdListNotBooked.add(wayBill.getWayBillId());
					}

					if(wbIdListNotBooked != null && wbIdListNotBooked.size() > 0)
						wayBillHM		  = WayBillHistoryDao.getInstance().getLimitedWayBillDetailsByStatus(Utility.GetLongArrayListToString(wbIdListNotBooked), WayBill.WAYBILL_STATUS_BOOKED);

					for(final Long key : resultHM.keySet()){

						srcBranch = null;
						chargeAmt = 0.00;
						model 	  = resultHM.get(key);
						wayBill   = lrColl.get(key);
						if(conSumColl != null && conSumColl.size() > 0){
							conSum = conSumColl.get(key);

							if(conSum != null){
								model.setNoOfPkgs(conSum.getQuantity());
								model.setActualWeight(conSum.getActualWeight());
							}
						}

						if(consignorColl != null && consignorColl.size() > 0){
							consignor = consignorColl.get(key);
							model.setConsignerName(consignor != null ? consignor.getName() : "");
						}

						if(consigneeColl != null && consigneeColl.size() > 0){
							consignee = consigneeColl.get(key);
							model.setConsigneeName(consignee != null ? consignee.getName() : "");
						}

						if(delConColl != null && delConColl.size() > 0){
							delConDet = delConColl.get(key);

							if(delConDet != null){
								model.setDeliveryDateTimeStamp(delConDet.getDeliveryDateTime());
								model.setCrNumber(delConDet.getWayBillDeliveryNumber());
							}
						}

						if(bookingChargeHM != null && bookingChargeHM.size() > 0)
							if(bookingChargeHM.get(key) != null)
								chargeAmt = bookingChargeHM.get(key);

						model.setLrDoorDlyCharegeAmount(chargeAmt);
						model.setWayBillType(WayBillType.getWayBillTypeShortNameByWayBilTypeId(wayBill.getWayBillTypeId()));
						model.setSourceBranchId(wayBill.getSourceBranchId());
						model.setSourceBranch(cacheManip.getGenericBranchDetailCache(request, wayBill.getSourceBranchId()).getName());
						model.setDestinationBranch(cacheManip.getGenericBranchDetailCache(request, wayBill.getDestinationBranchId()).getName());
						model.setBranchName(cacheManip.getGenericBranchDetailCache(request, model.getBranchId()).getName());
						model.setGrandTotal(wayBill.getGrandTotal());

						srcBranch = cacheManip.getGenericBranchDetailCache(request, wayBill.getSourceBranchId());
						model.setSrcBranchSubRegionId(srcBranch.getSubRegionId());
						model.setSrcBranchSubRegionName(cacheManip.getGenericSubRegionById(request, srcBranch.getSubRegionId()).getName());

						if(wayBill.getStatus() != WayBill.WAYBILL_STATUS_BOOKED)
							model.setBookingDateTimeStamp(wayBillHM.get(key).getCreationDateTimeStamp());
						else
							model.setBookingDateTimeStamp(wayBill.getCreationDateTimeStamp());
					}
					request.setAttribute("resultHM", resultHM);
					request.setAttribute(DoorDeliveryExpensePropertyConfigConstant.SHOW_DDM_NUMBER, doorDeliveryExpValObj.getOrDefault(DoorDeliveryExpensePropertyConfigConstant.SHOW_DDM_NUMBER, false));

					
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
			ActionStaticUtil.setReportViewModel(request);
			request.setAttribute("nextPageToken", "success");
		} catch (final Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		} finally {
			error 					= null;
			executive   			= null;
			cacheManip 				= null;
			sdf            			= null;
			fromDate       			= null;
			toDate         			= null;
			objectOut 				= null;
			wayBillIdList			= null;
			conSumColl 				= null;
			consignorColl			= null;
			consigneeColl			= null;
			wayBillStr				= null;
			consignor				= null;
			consignee				= null;
			conSum					= null;
			wayBill					= null;
			branchIds				= null;
			model					= null;
			delConColl				= null;
			delConDet				= null;
			lrColl  				= null;
			wayBillHM				= null;
			bookingChargeHM			= null;
			resultHM				= null;
			wbIdListNotBooked 		= null;
			expenseChargeHM			= null;
			expenseCharge		 	= null;
			srcBranch				= null;
		}
	}
}