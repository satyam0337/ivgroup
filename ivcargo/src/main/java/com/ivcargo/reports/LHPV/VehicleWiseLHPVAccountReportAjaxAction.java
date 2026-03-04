
package com.ivcargo.reports.LHPV;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.reports.LHPV.VehicleWiseLHPVAccountReportBLL;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;


public class VehicleWiseLHPVAccountReportAjaxAction implements Action {

	public static final String TRACE_ID = "VehicleWiseLHPVAccountReportAjaxAction";

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	 	error 						= null;
		final short					filter						= 2;

		try {
			new VehicleWiseLHPVAccountReportInitializeAction().execute(request, response);

			if(JSPUtility.GetString(request, "fromDate") == null
					|| JSPUtility.GetString(request, "toDate") == null) {
				error = ActionStaticUtil.getSystemErrorColl(request);
				error.put("errorDescription", "From Date or To Date is missing !");
				request.setAttribute("error", error);
				ActionStaticUtil.setNextPageToken(request, ActionStaticUtil.FAILURE);
				return;
			}

			final var	sdf					= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			final var	fromDate			= new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00").getTime());
			final var	toDate				= new Timestamp(sdf.parse(JSPUtility.GetString(request, "toDate") + " 23:59:59").getTime());
			final var	cManip 				= new CacheManip(request);
			final var	executive			= cManip.getExecutive(request);

			ActionStaticUtil.executiveTypeWiseBranches(request, cManip, executive);

			final var	branchesIds		= ActionStaticUtil.getPhysicalBranchIds(request, cManip, executive);

			final var	valueInObject = new ValueObject();
			valueInObject.put("branchesIds",branchesIds);
			valueInObject.put("accountgroupid", executive.getAccountGroupId());
			valueInObject.put("fromDate",fromDate);
			valueInObject.put("toDate",toDate);
			valueInObject.put("filter",filter);
			valueInObject.put("executive", executive);
			valueInObject.put("vehicleNumberHM", cManip.getALLVehicleNumberOfGroup(request,executive.getAccountGroupId()));
			valueInObject.put("branchColl", cManip.getGenericBranchesDetail(request));
			valueInObject.put("subregionColl", cManip.getAllSubRegions(request));

			final var	valObjOut	= VehicleWiseLHPVAccountReportBLL.getDataForReport(valueInObject);

			if(valObjOut == null) {
				ActionStaticUtil.setRequestAttribute(request, ActionStaticUtil.NO_RECORDS_FOUND, true);
				return;
			}

			request.setAttribute("reports", valObjOut.get("reports"));
			request.setAttribute("totalPaid",valObjOut.get("totalPaid"));
			request.setAttribute("totalTopay",valObjOut.get("totalTopay"));
			request.setAttribute("totalTBB",valObjOut.get("totalTBB"));
			request.setAttribute("totalLorryHire",valObjOut.get("totalLorryHire"));
			request.setAttribute("totalAdvance",valObjOut.get("totalAdvance"));
			request.setAttribute("totalBalance",valObjOut.get("totalBalance"));
			request.setAttribute("totalProfitLoss",valObjOut.get("totalProfitLoss"));
			request.setAttribute("totalLRAmount",valObjOut.get("totalLRAmount"));
			request.setAttribute("totalBasicFright",valObjOut.get("totalBasicFright"));

			ActionStaticUtil.setReportViewModel(request);
			request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}
}
