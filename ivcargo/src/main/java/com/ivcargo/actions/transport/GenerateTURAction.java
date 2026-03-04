package com.ivcargo.actions.transport;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.GenerateTURBLL;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.constant.properties.lhpv.TurPrintPropertiesConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.utils.constant.AccountGroupConstant;
import com.iv.utils.constant.Constant;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.reports.ReportView;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.AliasNameConstants;
import com.platform.dto.CustomGroupMapper;
import com.platform.dto.DispatchLedger;
import com.platform.dto.ReceivedLedger;
import com.platform.dto.VehicleNumberMaster;
import com.platform.dto.constant.TransCargoAccountGroupConstant;
import com.platform.dto.model.ReportViewModel;

public class GenerateTURAction implements Action {

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	 			error 				= null;
		ReportViewModel						reportViewModel		= null;
		VehicleNumberMaster					vehicleNumberMaster = null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	cacheManip		= new CacheManip(request);
			final var	executive		= cacheManip.getExecutive(request);
			final var	turBll			= new GenerateTURBLL();
			final var	valueObjectIn	= new ValueObject();

			final var 	configuration	= cacheManip.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.TUR_PRINT);
			final var turPrintFromWS	= (boolean) configuration.getOrDefault(TurPrintPropertiesConstant.TUR_PRINT_FROM_WS, false);

			valueObjectIn.put("receivedLedgerId", JSPUtility.GetLong(request, "receivedLedgerId", 0));
			valueObjectIn.put("dispatchLedgerId", JSPUtility.GetLong(request, "dispatchLedgerId", 0));
			valueObjectIn.put(AliasNameConstants.EXECUTIVE, executive);
			valueObjectIn.put("branchesObj", cacheManip.getGenericBranchesDetail(request));
			valueObjectIn.put("subRegionObj", cacheManip.getAllSubRegions(request));
			valueObjectIn.put("cityForGroupHM", cacheManip.getAllCitiesForGroupHM(request, executive.getAccountGroupId()));
			valueObjectIn.put("configuration", configuration);

			if(turPrintFromWS || executive.getAccountGroupId() > AccountGroupConstant.ACCOUNT_GROUP_ID_SCPS) {
				response.sendRedirect("prints.do?pageId=340&eventId=10&modulename=turprint&masterid=" + JSPUtility.GetLong(request, "dispatchLedgerId", 0));
				return;
			}

			final var	valueOutObject = turBll.getReceivedLedgerDetails(valueObjectIn);

			if(valueOutObject == null) {
				ActionStaticUtil.catchActionException(request, error, "No receive data found !");
				return;
			}

			final var isShortExcessDetails	= JSPUtility.GetBoolean(request, "isShortExcessDetails", false);

			if (isShortExcessDetails
					&& valueOutObject.get("receivedSummaryArr") == null && valueOutObject.get("receivedShortSummaryArr") == null && valueOutObject.get("receivedDamSummaryArr") == null && valueOutObject.get("receivedSummArForEx") == null) {
				ActionStaticUtil.catchActionException(request, error, "No Short Access Data Found !");
				return;
			}

			request.setAttribute(TurPrintPropertiesConstant.SHOW_ONLY_RECEIVED_LR, configuration.get(TurPrintPropertiesConstant.SHOW_ONLY_RECEIVED_LR));
			request.setAttribute(TurPrintPropertiesConstant.TUR_PRINT_WITHOUT_HEADER, configuration.get(TurPrintPropertiesConstant.TUR_PRINT_WITHOUT_HEADER));
			request.setAttribute(TurPrintPropertiesConstant.SHOW_CITY_NAME_WITH_BRANCH_IN_PRINT, configuration.get(TurPrintPropertiesConstant.SHOW_CITY_NAME_WITH_BRANCH_IN_PRINT));
			request.setAttribute(TurPrintPropertiesConstant.REMOVE_DEDUCT_HAMALI_VALUE, configuration.get(TurPrintPropertiesConstant.REMOVE_DEDUCT_HAMALI_VALUE));
			request.setAttribute(TurPrintPropertiesConstant.SHOW_LORRY_HIRE_DETAILS, configuration.get(TurPrintPropertiesConstant.SHOW_LORRY_HIRE_DETAILS));
			request.setAttribute(TurPrintPropertiesConstant.SHOW_UNLOADED_BY_EXECUTIVE_NAME, configuration.get(TurPrintPropertiesConstant.SHOW_UNLOADED_BY_EXECUTIVE_NAME));
			request.setAttribute(TurPrintPropertiesConstant.SHOW_PREPARED_BY_EXECUTIVE_NAME, configuration.get(TurPrintPropertiesConstant.SHOW_PREPARED_BY_EXECUTIVE_NAME));
			request.setAttribute(TurPrintPropertiesConstant.SHOW_ACTUAL_RECEIVED_QUANTITY, configuration.get(TurPrintPropertiesConstant.SHOW_ACTUAL_RECEIVED_QUANTITY));
			request.setAttribute(TurPrintPropertiesConstant.SHOW_COMPANY_LOGO, configuration.getOrDefault(TurPrintPropertiesConstant.SHOW_COMPANY_LOGO, false));

			final var	receivedLedger 	= (ReceivedLedger) valueOutObject.get("receivedLedger");
			final var	dispatchLedger	= (DispatchLedger) valueOutObject.get("dispatchLedger");

			request.setAttribute("receivedLedger", receivedLedger);
			request.setAttribute("lhpvmodel", valueOutObject.get("lhpvmodel"));
			request.setAttribute("toPayBookingTotal", valueOutObject.get("toPayBookingTotal"));
			request.setAttribute("paidBookingTotal", valueOutObject.get("paidBookingTotal"));
			request.setAttribute("tbbBookingTotal", valueOutObject.get("tbbBookingTotal"));
			request.setAttribute("receivedSummaries", valueOutObject.get("receivedSummaryArr"));
			request.setAttribute("WayBillDetails", valueOutObject.get("WayBillDetails"));
			request.setAttribute("receivedShortSum", valueOutObject.get("receivedShortSummaryArr"));
			request.setAttribute("shortWayBillDetails", valueOutObject.get("shortWayBillDetails"));
			request.setAttribute("receivedDamSum", valueOutObject.get("receivedDamSummaryArr"));
			request.setAttribute("damageWayBillDetails", valueOutObject.get("damageWayBillDetails"));
			request.setAttribute("receivedSummArForEx", valueOutObject.get("receivedSummArForEx"));
			request.setAttribute("destinationWiseWayBillHM", valueOutObject.get("destinationWiseWayBillHM"));
			request.setAttribute("LoggedInBranchDetails",cacheManip.getGenericBranchDetailCache(request,executive.getBranchId()));
			request.setAttribute("excessReceiveHM", valueOutObject.get("excessReceiveHM"));
			request.setAttribute("totalExcessReceive", valueOutObject.get("totalExcessReceive"));
			request.setAttribute("receivedLedgerId", valueOutObject.getLong(Constant.RECEIVED_LEDGER_ID, 0));
			request.setAttribute("dispatchLedgerId", valueObjectIn.getLong("dispatchLedgerId", 0));
			request.setAttribute("receiveSummObj", valueOutObject.get("destWisereceivedSummList"));
			request.setAttribute("customAddressBranchId", receivedLedger.getTurBranchId());
			request.setAttribute("customAddressIdentifer", CustomGroupMapper.IDENTIFIER_BOOKING);
			request.setAttribute("dispatchLedger", valueOutObject.get("dispatchLedger"));
			request.setAttribute("lorryHireRoute", valueOutObject.get("lorryHireRoute"));
			request.setAttribute("receivedSummHM", valueOutObject.get("receivedSummHM"));
			request.setAttribute("isReprint", JSPUtility.GetBoolean(request, "isReprint", true));
			request.setAttribute("isShortExcessDetails", isShortExcessDetails);

			if(dispatchLedger != null)
				vehicleNumberMaster = cacheManip.getVehicleNumber(request, dispatchLedger.getAccountGroupId(), dispatchLedger.getVehicleNumberMasterId());

			request.setAttribute("vehicleNumberMaster", vehicleNumberMaster);

			if(JSPUtility.GetBoolean(request, "isLaserPrint", false))
				request.setAttribute("nextPageToken", "success_ledger_" + executive.getAccountGroupId());
			else if((boolean) configuration.getOrDefault(TurPrintPropertiesConstant.GROUP_WISE_TUR_PRINT, false))
				request.setAttribute("nextPageToken", "success_" + executive.getAccountGroupId());
			else if(executive.getAccountGroupId() > TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_APT || executive.getAccountGroupId() == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_DEMO)
				request.setAttribute("nextPageToken", "success_default");
			else
				request.setAttribute("nextPageToken", "success");

			reportViewModel = new ReportViewModel();
			reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);
			request.setAttribute("ReportViewModel",reportViewModel);

		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}
}