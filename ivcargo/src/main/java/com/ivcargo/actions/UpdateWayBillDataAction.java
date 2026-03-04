package com.ivcargo.actions;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.logsapp.LogWriter;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.platform.dao.CorporateAccountDao;
import com.platform.dao.UpdateWayBillDataDao;
import com.platform.dto.CorporateAccount;
import com.platform.dto.CustomerDetails;
import com.platform.dto.WayBill;

public class UpdateWayBillDataAction implements Action {

	private static final String TRACE_ID = "UpdateWayBillDataAction";

	public void execute(HttpServletRequest request, HttpServletResponse response) {
		// TODO Auto-generated method stub

		HashMap<String,Object>	error 				= null;
		CustomerDetails 		consignorDetails 	= null;
		CustomerDetails 		consigneeDetails 	= null;
		WayBill					wayBill				= null;
		String 					consignorName 		= null;
		String 					consigneeName 		= null;
		String 					consignorPhone 		= null;
		String 					consigneePhone 		= null;
		String 					consignorAdd 		= null;
		String 					consigneeAdd 		= null;
		String 					remark 				= null;
		long 					wayBillId 			= 0;
		short 					wayBillStatus 		= 0;
		long 					consignorId 		= 0;
		long 					consigneeId 		= 0;
		CorporateAccount     	corporateAccount	= null;
		CorporateAccount     	corpAcc				= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error)){
				return;
			}
			consignorDetails	= new CustomerDetails();
			consigneeDetails	= new CustomerDetails();
			wayBill				= new WayBill();

			consignorName 	= JSPUtility.GetString(request,"consignorName");
			consigneeName 	= JSPUtility.GetString(request,"consigneeName");
			consignorPhone	= JSPUtility.GetString(request,"consignorPhone");
			consigneePhone 	= JSPUtility.GetString(request,"consigneePhone");
			consignorAdd 	= JSPUtility.GetString(request,"consignorAddress");
			consigneeAdd 	= JSPUtility.GetString(request,"consigneeAddress");
			remark 			= JSPUtility.GetString(request,"remark");
			wayBillId 		= JSPUtility.GetLong(request,"wayBillId");
			wayBillStatus 	= Short.parseShort(request.getParameter("wbStatus"));
			consignorId 	= JSPUtility.GetLong(request,"consignorId");
			consigneeId 	= JSPUtility.GetLong(request,"consigneeId");

			//Update Consignor
			consignorDetails.setCustomerDetailsId(consignorId);
			consignorDetails.setName(consignorName.toUpperCase());
			consignorDetails.setPhoneNumber(consignorPhone);
			consignorDetails.setAddress(consignorAdd);
			consignorDetails.setContactPerson("");
			consignorDetails.setPartyType(CorporateAccount.PARTY_TYPE_GENERAL);

			if(JSPUtility.GetLong(request,"partyId") > 0  && JSPUtility.GetLong(request,"prevPartyId") > 0) {
				consignorDetails.setCorporateAccountId(JSPUtility.GetLong(request,"partyId"));
				corporateAccount = CorporateAccountDao.getInstance().findByPartyIdForMaster(consignorDetails.getCorporateAccountId());
				
				consignorDetails.setName(corporateAccount.getDisplayName());
				consignorDetails.setAddress(corporateAccount.getAddress());
				consignorDetails.setPincode(corporateAccount.getPincode());
				consignorDetails.setContactPerson(corporateAccount.getContactPerson());
				//consignorDetails.setPhoneNumber(corporateAccount.getPhoneNumber());
				consignorDetails.setPhoneNumber(consignorPhone);
				consignorDetails.setMobileNumber(consignorPhone);
				consignorDetails.setPartyType(CorporateAccount.PARTY_TYPE_GENERAL);
			}

			if(JSPUtility.GetLong(request,"consignorCorpId") > 0 
					&& JSPUtility.GetLong(request,"prevConsignorCorpId") > 0){
				consignorDetails.setCorporateAccountId(JSPUtility.GetLong(request,"consignorCorpId"));
				corpAcc		  = CorporateAccountDao.getInstance().findByCorpIdForMaster(consignorDetails.getCorporateAccountId());
				
				consignorDetails.setBillingPartyId(corpAcc.getCorporateAccountId());
				consignorDetails.setName(corpAcc.getDisplayName());
				consignorDetails.setAddress(corpAcc.getAddress());
				consignorDetails.setPincode(corpAcc.getPincode());
				consignorDetails.setContactPerson(corpAcc.getContactPerson());
				consignorDetails.setPhoneNumber(corpAcc.getPhoneNumber());
				consignorDetails.setMobileNumber(corpAcc.getMobileNumber());
				consignorDetails.setPartyType(CorporateAccount.PARTY_TYPE_TBB);
			}

			//Update Consignee
			consigneeDetails.setCustomerDetailsId(consigneeId);
			consigneeDetails.setName(consigneeName.toUpperCase());
			consigneeDetails.setPhoneNumber(consigneePhone);
			consigneeDetails.setAddress(consigneeAdd);
			consigneeDetails.setContactPerson("");
			consigneeDetails.setPartyType(CorporateAccount.PARTY_TYPE_GENERAL);
		
			if(JSPUtility.GetLong(request, "consigneepartyId") > 0 && JSPUtility.GetLong(request, "prevConsigneePartyId") > 0) {
				consigneeDetails.setCorporateAccountId(JSPUtility.GetLong(request,"consigneepartyId"));
				corporateAccount	 = CorporateAccountDao.getInstance().findByPartyIdForMaster(consigneeDetails.getCorporateAccountId());
			
				consigneeDetails.setName(corporateAccount.getDisplayName());
				consigneeDetails.setAddress(corporateAccount.getAddress());
				consigneeDetails.setPincode(corporateAccount.getPincode());
				consigneeDetails.setContactPerson(corporateAccount.getContactPerson());
				//consigneeDetails.setPhoneNumber(corporateAccount.getPhoneNumber());
				consigneeDetails.setMobileNumber(consigneePhone);
				consigneeDetails.setPhoneNumber(consigneePhone);
				consigneeDetails.setPartyType(CorporateAccount.PARTY_TYPE_GENERAL);
			}
			//Update Remark
			wayBill.setWayBillId(wayBillId);
			wayBill.setStatus(wayBillStatus);
			wayBill.setRemark(remark);

			UpdateWayBillDataDao.getInstance().updateWayBillData(consignorDetails, consigneeDetails, wayBill);

			request.setAttribute("wayBillId", wayBillId);
			request.setAttribute("filter",1);
			request.setAttribute("nextPageToken", "success");

		} catch (Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, _e.getMessage());
		} finally {
			consignorDetails 	= null;
			consigneeDetails 	= null;
			wayBill				= null;
			consignorName 		= null;
			consigneeName 		= null;
			consignorPhone 		= null;
			consigneePhone 		= null;
			consignorAdd 		= null;
			consigneeAdd 		= null;
			remark 				= null;
		}
	}
}
