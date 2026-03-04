package com.ivcargo.actions;

import java.sql.Timestamp;
import java.util.Date;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.framework.JSPUtility;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.platform.dao.CustomerEnquiryDao;
import com.platform.dto.CustomerEnquiry;
import com.platform.dto.Executive;

public class CustomerEnquiryAction implements Action{

	Timestamp 	createDate 					= null;
	Executive 	executive  					= null;
	double 		totalExpAmount 				= 0.00;
	short 		totalWayBillExpensesCount 	= 0;

	public void execute(HttpServletRequest request, HttpServletResponse response) {
		// TODO Auto-generated method stub
		HashMap<String,Object>	 	error 					= null;
		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error)){
				return;
			}
			createDate	= new Timestamp(new Date().getTime());
			executive 	= (Executive) request.getSession().getAttribute("executive");
			CustomerEnquiryDao.getInstance().insert(createCustomerEnquiryDTO(request));

			request.setAttribute("filter",5);
			request.setAttribute("nextPageToken", "success");

		} catch (Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		} finally {

		}
	}


	public CustomerEnquiry createCustomerEnquiryDTO(HttpServletRequest request) throws Exception {

		CustomerEnquiry customerEnquiry = null;

		try {

			customerEnquiry = new CustomerEnquiry();

			customerEnquiry.setAccountGroupId(executive.getAccountGroupId());
			customerEnquiry.setWayBillId(JSPUtility.GetLong(request, "wayBillId", 0));
			customerEnquiry.setWayBillNumber(JSPUtility.GetString(request, "wayBillNo", ""));
			customerEnquiry.setName(JSPUtility.GetString(request, "custName", ""));
			customerEnquiry.setMobileNumber(JSPUtility.GetString(request, "custMobileNo", ""));
			customerEnquiry.setRemark(JSPUtility.GetString(request, "remark", ""));
			customerEnquiry.setExecutiveId(executive.getExecutiveId());
			customerEnquiry.setBranchId(executive.getBranchId());
			customerEnquiry.setEnquiryDateTime(createDate);

			return customerEnquiry;

		} catch (Exception e) {
			throw e;
		} finally {
			customerEnquiry = null;
		}
	}
}