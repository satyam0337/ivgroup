package com.ivcargo.reports;

import java.sql.Timestamp;
import java.util.HashMap;
import java.util.Map;
import java.util.StringJoiner;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringUtils;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.properties.constant.CrossingAgentBillPropertiesConstant;
import com.iv.utils.exception.ExceptionProcess;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.reports.CrossingAgentBillClearanceDAO;
import com.platform.dao.reports.CrossingAgentBillDAO;
import com.platform.dto.Branch;
import com.platform.dto.CrossingAgentBill;
import com.platform.dto.CrossingAgentBillClearance;
import com.platform.dto.SubRegion;
import com.platform.dto.configuration.mindateselection.ModuleWiseMinDateSelectionConfigurationDTO;
import com.platform.resource.CargoErrorList;

public class GetCrossingAgentBillClearanceDataAction implements Action {

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	 					error 					= null;
		Map<Long, CrossingAgentBillClearance>		billClearanceDetails 	= null;

		try {

			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeCrossingAgentBillClearanceAction().execute(request, response);

			final var crossingAgentId = JSPUtility.GetLong(request, "crossingAgentId", 0);

			final var	cManip	  = new CacheManip(request);
			final var	executive = cManip.getExecutive(request);

			final var	configuration			= cManip.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.CROSSING_AGENT_BILL);

			final var	minDateTimeStamp		= cManip.getModuleWiseMinDateToGetData(request, executive.getAccountGroupId(),
					ModuleWiseMinDateSelectionConfigurationDTO.CROSSING_AGENT_INVOICE_PAYMENT_MIN_DATE_ALLOW,
					ModuleWiseMinDateSelectionConfigurationDTO.CROSSING_AGENT_INVOICE_PAYMENT_MIN_DATE);

			var	txnTypeId 	 = JSPUtility.GetShort(request, "txnType", (short)0);

			if(!(boolean) configuration.getOrDefault(CrossingAgentBillPropertiesConstant.IS_SHOW_CROSSING_AGENT_TYPE, false))
				txnTypeId = CrossingAgentBill.CROSSINGAGENTBILL_DELIVERY_ID;

			if(crossingAgentId == 0) {
				error.put(CargoErrorList.ERROR_CODE, CargoErrorList.REPORT_NOTFOUND);
				error.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
				return ;
			}

			final var	branchIds		= cManip.getBranchIdsByExecutiveType(request, executive);

			final var	crBills = CrossingAgentBillDAO.getInstance().getBillDetailsForBillClearance(getWhereClause(crossingAgentId, txnTypeId, branchIds, minDateTimeStamp));

			if(crBills != null && !crBills.isEmpty()) {
				final var	billIdStr	= crBills.stream().filter(e -> e.getStatus() == CrossingAgentBill.CROSSINGAGENTBILL_CLEARANCE_STATUS_PARTIAL_PAYMENT_ID)
						.map(e -> e.getCrossingAgentBillId() + "").collect(Collectors.joining(","));

				if(!billIdStr.isEmpty())
					billClearanceDetails = CrossingAgentBillClearanceDAO.getInstance().getCrossingAgentBillClearanceDetails(billIdStr);

				final var	branches	= cManip.getGenericBranchesDetail(request);
				final var	subRegions	= cManip.getAllSubRegions(request);

				if(billClearanceDetails != null) {
					for(final Map.Entry<Long, CrossingAgentBillClearance> entry : billClearanceDetails.entrySet()) {
						final var	billClearance = entry.getValue();

						final var	branch	= (Branch) branches.get(billClearance.getBranchId() + "");

						billClearance.setBranchName(branch.getName());
					}

					request.setAttribute("BillClearanceDetails", billClearanceDetails);
				}

				for (final CrossingAgentBill crBill : crBills) {
					final var	branch = (Branch) branches.get(crBill.getBranchId() + "");

					final var	subRegion	= (SubRegion) subRegions.get(branch.getSubRegionId());

					crBill.setBranchName(branch.getName());
					crBill.setSubRegionName(subRegion.getName());
				}

				request.setAttribute("BillDetailsForBillClearance", crBills.toArray(new CrossingAgentBill[crBills.size()]));
			} else {
				error.put(CargoErrorList.ERROR_CODE, CargoErrorList.REPORT_NOTFOUND);
				error.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}

			request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}

	private String getWhereClause(final long crossingAgentId, final short txnTypeId, final String branchIds, final Timestamp minDateTimeStamp) throws Exception {
		final var whereClause = new StringJoiner(" AND ");

		try {
			whereClause.add("cab.txnTypeId = " + txnTypeId);
			whereClause.add("cab.[Status] IN(1,3)");

			if(StringUtils.isNotEmpty(branchIds))
				whereClause.add("cab.BranchId IN (" + branchIds + ")");

			whereClause.add("cab.crossingAgentId = " + crossingAgentId);

			if(minDateTimeStamp != null)
				whereClause.add("cab.CreationDateTimeStamp >= '" + minDateTimeStamp + "'");

			return whereClause.toString();
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, GetCrossingAgentBillClearanceDataAction.class.getName());
		}
	}
}