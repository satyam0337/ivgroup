/**
 *
 */
package com.ivcargo.reports.shortexcess;

import java.io.PrintWriter;
import java.text.SimpleDateFormat;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONObject;

import com.businesslogic.shortexcess.ClaimEntryBLL;
import com.framework.Action;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.constant.Constant;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.exception.ExceptionProcess;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.reports.ReportView;
import com.ivcargo.utils.JsonUtility;
import com.platform.dto.Executive;
import com.platform.dto.model.ReportViewModel;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

/**
 * @author Anant Chaudhary	16-10-2015
 *
 */
public class ClaimEntryReportAction implements Action {

	private static final String TRACE_ID	= "ClaimEntryReportAction";

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	error 							= null;
		PrintWriter				out								= null;
		var						regionId						= 0L;
		var						subRegionId						= 0L;
		var						branchId						= 0L;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	valueObjectToBLL		= new ValueObject();
			final var	claimEntryBLL			= new ClaimEntryBLL();
			final var	outJsonObject			= new JSONObject();
			final var	sdf1					= new SimpleDateFormat("dd-MM-yyyy");

			final var	executive	= (Executive) request.getSession().getAttribute("executive");

			response.setContentType("application/json");

			out = response.getWriter();

			final var	getJsonObject 	= new JSONObject(request.getParameter("json"));

			final var	fromDate	= DateTimeUtility.getStartOfDayTimeStamp(getJsonObject.get("FromDate").toString());
			final var	toDate		= DateTimeUtility.getEndOfDayTimeStamp(getJsonObject.get("ToDate").toString());

			if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_GROUPADMIN) {
				regionId 	= Utility.getLong(getJsonObject.get("RegionId"));
				subRegionId = Utility.getLong(getJsonObject.get("SubRegion"));
				branchId 	= Utility.getLong(getJsonObject.get("BranchId"));
			} else if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_REGIONADMIN) {
				subRegionId = Utility.getLong(getJsonObject.get("SubRegion"));
				branchId 	= Utility.getLong(getJsonObject.get("BranchId"));
			} else if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_SUBREGIONADMIN){
				subRegionId = executive.getSubRegionId();
				branchId 	= Utility.getLong(getJsonObject.get("BranchId"));
			} else {
				subRegionId = executive.getSubRegionId();
				branchId 	= executive.getBranchId();
			}

			if(subRegionId > 0 && branchId > 0) {
				valueObjectToBLL.put("subRegionId", subRegionId);
				valueObjectToBLL.put("filter", (short)1);
			} else if(subRegionId > 0 && branchId == 0){
				valueObjectToBLL.put("subRegionId", subRegionId);
				valueObjectToBLL.put("filter", (short)2);
			}

			valueObjectToBLL.put(Constant.FROM_DATE, fromDate);
			valueObjectToBLL.put(Constant.TO_DATE, toDate);
			valueObjectToBLL.put(Constant.BRANCH_ID, branchId);
			valueObjectToBLL.put(Constant.REGION_ID, regionId);
			valueObjectToBLL.put(Constant.SUB_REGION_ID, subRegionId);

			final var	valueObjectFromBLL	= claimEntryBLL.getAllClaimEntryDetailsByBranchId(valueObjectToBLL, executive);

			if(valueObjectFromBLL == null) {
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
				request.setAttribute("nextPageToken", "failure");
				outJsonObject.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				out.println(outJsonObject);
				return;
			}

			var	reportViewModel 	= new ReportViewModel();
			reportViewModel 	= ReportView.getInstance().populateReportViewModel(request, reportViewModel);

			if(reportViewModel != null) {
				valueObjectFromBLL.put("accountGroupNameForPrint", reportViewModel.getAccountGroupName());
				valueObjectFromBLL.put("branchAddress", reportViewModel.getBranchAddress());
				valueObjectFromBLL.put("branchPhoneNumber", reportViewModel.getBranchPhoneNumber());
			}

			final var	configuration	= ReadAllConfigurationsBllImpl.getInstance().getOldReportConfigurationData(ReportIdentifierConstant.CLAIM_ENTRY_REPORT, executive.getAccountGroupId());

			valueObjectFromBLL.put("configuration", configuration);
			valueObjectFromBLL.put("fromDate", sdf1.format(fromDate));
			valueObjectFromBLL.put("toDate", sdf1.format(toDate));
			valueObjectFromBLL.put("selectedBranch", executive.getBranchName());
			valueObjectFromBLL.put("selectedRegion", executive.getRegionName());
			valueObjectFromBLL.put("selectedSubRegion", executive.getSubRegionName());

			out.println(JsonUtility.convertionToJsonObjectForResponse(valueObjectFromBLL));
		} catch (final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
		} finally {
			out.flush();
			out.close();
		}
	}
}
