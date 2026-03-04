package com.ivcargo.actions;

//~--- non-JDK imports --------------------------------------------------------

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.logsapp.LogWriter;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.platform.dao.CustomerDetailsDao;
import com.platform.dao.WayBillDao;
import com.platform.dao.reports.WayBillDetailsDAO;
import com.platform.dto.ConsignmentDetails;
import com.platform.dto.CustomerDetails;
import com.platform.dto.DeliveryRunSheet;
import com.platform.dto.WayBill;
import com.platform.dto.WayBillType;
import com.platform.dto.constant.WayBillTypeConstant;
import com.platform.dto.model.WayBillDeatailsModel;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

public class DeliveryRunSheetLedgerIdAction implements Action {
	public static final String TRACE_ID = "DeliveryRunSheetLedgerIdAction";
	public void execute(HttpServletRequest request, HttpServletResponse response) {

		HashMap<String,Object>	 	error 					= null;

		String 								wayBillIds			=	null;
		Long[]								wayBillArr			= 	null;
		DeliveryRunSheet[] 					dlrsArr				= 	null;
		HashMap<Long , WayBill>				wayBillHM			=	null;
		HashMap<Long, CustomerDetails> 		consignorCol 		= 	null;
		HashMap<Long, CustomerDetails> 		consigneeCol 		= 	null;
		HashMap<Long, WayBillDeatailsModel>	wayBillDetails 		= 	null;
		ConsignmentDetails[] 				consDetails			=	null;
		String 								packageDetails		= 	null;
		long 								noOfPackages		= 	0;
		WayBill								wayBill				= 	null;
		//CacheManip							cache				= 	null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error)){
				return;
			}

			if (request.getParameter("drsLedgerId") != null && request.getParameter("wayBillIds") != null) {

				request.setAttribute("drsLedgerId", JSPUtility.GetLong(request, "drsLedgerId"));

				wayBillIds	=	JSPUtility.GetString(request, "wayBillIds","");	 


				if( !wayBillIds.equals("") && wayBillIds.length() > 0 ) {

					wayBillArr 		=	Utility.GetLongArrayFromString(wayBillIds, ",");
					dlrsArr			=	new DeliveryRunSheet[wayBillArr.length];
					wayBillHM		=	WayBillDao.getInstance().getWayBillsByWayBillIds(wayBillIds);
					wayBillDetails 	= 	WayBillDetailsDAO.getInstance().getWayBillDetails(wayBillArr, false, (short)0,false,(short)0, true);
					consignorCol 	=	CustomerDetailsDao.getInstance().getConsignorDetailsByWayBillId(wayBillIds);
					consigneeCol 	= 	CustomerDetailsDao.getInstance().getConsigneeDetailsByWayBillId(wayBillIds);

					//cache			=	new CacheManip(request);
					LogWriter.writeLog("LOGINVALIDATOR", LogWriter.LOG_LEVEL_ERROR, CargoErrorList.SYSTEM_ERROR + "dlrsArr.length:"+dlrsArr.length);
					for(int i = 0; i<wayBillArr.length; i++) {

						dlrsArr[i] 	= 	new DeliveryRunSheet();
						wayBill		=	wayBillHM.get(wayBillArr[i]);

						dlrsArr[i].setWayBillId(wayBill.getWayBillId());
						dlrsArr[i].setWayBillNumber(wayBill.getWayBillNumber());
						/*dlrsArr[i].setConsignorName(wayBill.getConsignerName());
							dlrsArr[i].setConsigneeName(wayBill.getConsigneeName());*/

						consDetails 	= wayBillDetails.get(dlrsArr[i].getWayBillId()).getConsignmentDetails();
						packageDetails	= "";
						noOfPackages	= 0;

						for (int j=0; j<consDetails.length; j++){
							if (j != consDetails.length-1){
								packageDetails += consDetails[j].getQuantity()+" "+consDetails[j].getPackingTypeName()+" / ";
							} else {
								packageDetails += consDetails[j].getQuantity()+" "+consDetails[j].getPackingTypeName();
							}
							noOfPackages = consDetails[j].getQuantity();
						}

						dlrsArr[i].setPackageDetails(packageDetails);
						dlrsArr[i].setNoOfPackages(noOfPackages);

						dlrsArr[i].setWayBillType(WayBillTypeConstant.getWayBillTypeNameByWayBilTypeId(wayBill.getWayBillTypeId()));

						dlrsArr[i].setBkgAmount(wayBill.getGrandTotal() - (wayBill.getDeliveryAmount() - wayBill.getDeliveryDiscount()));

						if(wayBill.getWayBillTypeId() == WayBillType.WAYBILL_TYPE_TO_PAY){
							dlrsArr[i].setDeliveryAmount(wayBill.getGrandTotal());
						} else {
							dlrsArr[i].setDeliveryAmount((wayBill.getDeliveryAmount() - wayBill.getDeliveryDiscount()));
						}
						//Get ConsignmentDetails :: END

						//Set Consignor/nee Names
						dlrsArr[i].setConsignorName(consignorCol.get(wayBillArr[i]).getName());
						dlrsArr[i].setConsigneeName(consigneeCol.get(wayBillArr[i]).getName());
					}

					request.setAttribute("nextPageToken", "success");
					request.setAttribute("Waybills", dlrsArr);
					request.setAttribute("isDelivered", JSPUtility.GetBoolean(request, "isDelivered"));
					request.setAttribute("TotalWayBillDelivered", JSPUtility.GetInt(request, "TotalWayBillDelivered",0));
				}
			}

		} catch (Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		} finally {

			wayBillIds		=	null;
			wayBillArr		= 	null;
			dlrsArr			=	null;
			wayBillHM		=	null;
			wayBillDetails 	= 	null;
			consDetails		=	null;
			packageDetails	= 	null;
			consignorCol 	= 	null;
			consigneeCol 	= 	null;
			wayBillDetails 	= 	null;
			wayBill			= 	null;
			//cache			= 	null;
		}
	}
}
