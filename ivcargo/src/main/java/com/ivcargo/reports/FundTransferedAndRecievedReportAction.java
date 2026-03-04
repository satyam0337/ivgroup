package com.ivcargo.reports;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.FundTransferedAndRecievedReportBLL;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.CustomGroupMapper;
import com.platform.dto.Executive;
import com.platform.resource.CargoErrorList;

public class FundTransferedAndRecievedReportAction implements Action {

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	 error 				= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeFundTransferedAndRecievedReport().execute(request, response);

			var	srcBranchId = 0L;
			final var	valuInObject = new ValueObject();
			final var	funcdTransRecBLL = new FundTransferedAndRecievedReportBLL();
			final var	cache = new CacheManip(request);
			final var	executive = cache.getExecutive(request);

			if(request.getParameter("FundTransRecType")!=  null){
				ActionStaticUtil.executiveTypeWiseSelection1(request, cache, executive);

				final var	fundTransAndRec = Integer.parseInt(request.getParameter("FundTransRecType"));

				final var	sdf			= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
				final var	fromDate	= new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00").getTime());
				final var	toDate		= new Timestamp(sdf.parse(JSPUtility.GetString(request, "toDate") + " 23:59:59").getTime());

				ActionStaticUtil.executiveTypeWiseBranches(request, cache, executive);

				if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_GROUPADMIN || executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_REGIONADMIN || executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_SUBREGIONADMIN)
					srcBranchId = JSPUtility.GetLong(request, "branch", 0);
				else
					srcBranchId = executive.getBranchId();

				valuInObject.put("srcBranchId", srcBranchId);
				valuInObject.put("fundTransAndRec", fundTransAndRec);
				valuInObject.put("fromDate", fromDate);
				valuInObject.put("toDate", toDate);
				valuInObject.put("accountGroup", executive.getAccountGroupId());
				valuInObject.put("branchesColl", cache.getGenericBranchesDetail(request));

				final var	valuOutObject = funcdTransRecBLL.getFundTransferedAndRecievedReport(valuInObject);

				if(valuOutObject.get("fundTransferedMod") != null || valuOutObject.get("fundReceivingMod")!= null ){
					request.setAttribute("fundTransferedMod", valuOutObject.get("fundTransferedMod"));
					request.setAttribute("fundReceivingMod", valuOutObject.get("fundReceivingMod"));
				}else{
					error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
					error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
					request.setAttribute("cargoError", error);
				}
			}else{
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}

			ActionStaticUtil.setRequestAttribute(request,"customAddressBranchId", srcBranchId);
			ActionStaticUtil.setRequestAttribute(request,"customAddressIdentifer", CustomGroupMapper.IDENTIFIER_BOOKING);

			ActionStaticUtil.setReportViewModel(request);
			request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}
}