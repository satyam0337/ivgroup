package com.ivcargo.actions;

import java.util.Arrays;
import java.util.Comparator;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringUtils;

import com.framework.Action;
import com.iv.constant.properties.GeneralConfigurationPropertiesConstant;
import com.iv.constant.properties.LrViewConfigurationPropertiesConstant;
import com.iv.constant.properties.SearchConfigPropertiesConstant;
import com.iv.dao.impl.PendingGoodsUndeliveredStockDaoImpl;
import com.iv.dto.PendingGoodsUndeliveredStock;
import com.iv.dto.constant.BusinessFunctionConstants;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.dto.constant.WayBillStatusConstant;
import com.iv.properties.constant.LoadingSheetPropertyConstant;
import com.iv.utils.utility.Utility;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.reports.ReportView;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.BranchDao;
import com.platform.dao.ReturnBookingDao;
import com.platform.dao.WayBillDao;
import com.platform.dao.WayBillHistoryDao;
import com.platform.dto.Branch;
import com.platform.dto.SubRegion;
import com.platform.dto.WayBill;
import com.platform.dto.configuration.modules.GenerateCashReceiptDTO;
import com.platform.dto.model.ReportViewModel;
import com.platform.dto.model.WayBillStatusDetails;
import com.platform.resource.CargoErrorList;

public class CreateViewDetailsAction implements Action {

	public static final String TRACE_ID = "CreateViewDetailsAction";

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	 				error 										= null;
		WayBillStatusDetails[] 					wayBillStatusDetailsNew						= null;
		String									deliveryPlace								= null;
		WayBill									wayBill										= null;
		PendingGoodsUndeliveredStock			pendingGoodsUndeliveredStock				= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	cache = new CacheManip(request);

			final var	executive		= cache.getExecutive(request);
			final var	branches		= cache.getGenericBranchesDetail(request);
			final var	subRegions		= cache.getAllSubRegions(request);

			final var	wayBillId		= Long.parseLong(request.getParameter("wayBillId"));

			final var	wayBillStatusDetails 	= WayBillHistoryDao.getInstance().getWayBillStatusDetails(wayBillId);
			final var	crConfiguration			= cache.getGenerateCRConfiguration(request, executive.getAccountGroupId());
			final var	returnBooking  			= ReturnBookingDao.getInstance().getRetrunBookingWaybillDetails(wayBillId);
			final var	isGoodsUndeliveredEntryAllowed	= crConfiguration.getBoolean(GenerateCashReceiptDTO.IS_GOODS_UNDELIVERED_ENTRY_ALLOWED,false);
			final var	lsConfiguration 				= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.DISPATCH);
			final var	lrViewConfiguration				= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.LR_SEARCH);
			final var	generalConfig					= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.GENERAL_CONFIGURATION);

			final var showBranchDisplayNameOnLrStatus	= (boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.SHOW_BRANCH_DISPLAY_NAME_ON_LR_STATUS, false);
			final var showBranchWithSubregionName		= (boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.SHOW_BRANCH_WITH_SUBREGION_NAME_IN_STATUS_DETAILS, false);
			final var showSubregionWithBranchName		= (boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.SHOW_SUBREGION_WITH_BRANCH_NAME_IN_STATUS_DETAILS, false);
			final var showStatusDetailsOrderWise		= (boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.SHOW_STATUS_DETAILS_ORDER_WISE, false);
			final var showGodownNameColumn				= (boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.SHOW_GODOWN_NAME_COLUMN, false);

			if(returnBooking != null) {
				if(returnBooking.getNewWayBillId() > 0)
					wayBill = WayBillDao.getInstance().getByWayBillId(returnBooking.getNewWayBillId());
				else if(returnBooking.getOldWayBillId() > 0)
					wayBill = WayBillDao.getInstance().getByWayBillId(returnBooking.getOldWayBillId());

				if(wayBill != null)
					returnBooking.setWayBillNumber(wayBill.getWayBillNumber());

				request.setAttribute("returnBooking", returnBooking);
			}

			if(showStatusDetailsOrderWise)
				Arrays.sort(wayBillStatusDetails, Comparator.comparingLong(e-> e.getWayBillHistoryId()  == 0 ? Long.MAX_VALUE : e.getWayBillHistoryId()));

			request.setAttribute("WayBillStatusDetails", wayBillStatusDetails);
			request.setAttribute(LrViewConfigurationPropertiesConstant.SHOW_CROSSING_AGENT_NAME, lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.SHOW_CROSSING_AGENT_NAME, false));
			request.setAttribute(LrViewConfigurationPropertiesConstant.SHOW_CROSSING_LR_NUMBER, lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.SHOW_CROSSING_LR_NUMBER, false));
			request.setAttribute(LrViewConfigurationPropertiesConstant.SHOW_BRANCH_DISPLAY_NAME_ON_LR_STATUS, showBranchDisplayNameOnLrStatus);
			request.setAttribute(LrViewConfigurationPropertiesConstant.SHOW_GODOWN_NAME_COLUMN, showGodownNameColumn);

			var	reportViewModel = new ReportViewModel();
			reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);

			request.setAttribute("ReportViewModel", reportViewModel);

			final var	searchConfiguration			= cache.getSearchConfiguration(request, executive.getAccountGroupId());
			final var	transportList				= cache.getTransportList(request);
			final var	execFunctions				= cache.getExecFunctions(request);

			if(execFunctions == null) {
				error.put("errorCode", CargoErrorList.GROUP_PERMISSIONS_MISSING);
				error.put("errorDescription", CargoErrorList.GROUP_PERMISSIONS_MISSING_DESCRIPTION);
				ActionStaticUtil.setRequestAttribute(request, "cargoError", error);
				ActionStaticUtil.setNextPageToken(request, ActionStaticUtil.NEEDLOGIN);
				return;
			}

			final var	execFeildPermissionForTransportSearch = execFunctions.get(BusinessFunctionConstants.TRANSPORTSEARCHWAYBILL);

			request.setAttribute("execPermissionBasedSearchLr", (boolean) searchConfiguration.getOrDefault(SearchConfigPropertiesConstant.EXEC_PERMISSION_BASED_SEARCH_LR, false));
			request.setAttribute("execFeildPermissionForTransportSearch", execFeildPermissionForTransportSearch);

			if(wayBillStatusDetails != null && wayBillStatusDetails.length > 0) {
				for (final WayBillStatusDetails element : wayBillStatusDetails) {

					if(element.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_BOOKED)
						deliveryPlace = element.getDeliveryPlace();

					var	branch		= (Branch) branches.get(Long.toString(element.getSourceBranchId()));

					if(branch == null)
						branch = BranchDao.getInstance().findByBranchId(element.getSourceBranchId());

					if(branch != null) {
						final var	subRegion	= (SubRegion) subRegions.get(branch.getSubRegionId());
						element.setSourceBranchName(showBranchDisplayNameOnLrStatus ? branch.getDisplayName() : branch.getName());
						element.setSourceSubRegionId(branch.getSubRegionId());
						element.setSourceSubRegionName(subRegion != null ? subRegion.getName() : "");
					} else {
						element.setSourceBranchName("--");
						element.setSourceSubRegionName("--");
					}

					branch		= (Branch) branches.get(Long.toString(element.getDestinationBranchId()));

					if(branch == null)
						branch = BranchDao.getInstance().findByBranchId(element.getDestinationBranchId());

					if(branch != null) {
						final var	subRegion	= (SubRegion) subRegions.get(branch.getSubRegionId());

						element.setDestinationBranchName(showBranchDisplayNameOnLrStatus ? branch.getDisplayName() : branch.getName());
						element.setDestinationSubRegionId(branch.getSubRegionId());
						element.setDestinationSubRegionName(subRegion != null ? subRegion.getName() : "");
					} else {
						element.setDestinationBranchName("--");
						element.setDestinationSubRegionName("--");
					}

					if(element.getDestinationSubRegionId() > 0 && element.getDestinationBranchId() > 0) {
						branch	= (Branch) branches.get(Long.toString(element.getDestinationBranchId()));

						if(branch == null)
							branch = BranchDao.getInstance().findByBranchId(element.getDestinationBranchId());

						element.setDestinationBranchName(showBranchDisplayNameOnLrStatus ? branch.getDisplayName() : branch.getName());
					} else {
						element.setDestinationBranchName("");

						if(element.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_BOOKED
								|| element.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DISPATCHED)
							element.setDestinationBranchName(deliveryPlace);
						else {
							element.setDestinationSubRegionName(element.getSourceSubRegionName());
							element.setDestinationBranchName(element.getSourceBranchName());
						}
					}

					if((boolean) lsConfiguration.getOrDefault(LoadingSheetPropertyConstant.IS_CENTRALIZED_DISPATCH_MODULE, false) && element.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DISPATCHED
							|| element.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_RECEIVED
							|| element.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DELIVERED
							|| element.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CANCELLED_DELIVERY){
						branch	= (Branch) branches.get(Long.toString(element.getWayBillBranchId()));

						if(branch == null)
							branch = BranchDao.getInstance().findByBranchId(element.getWayBillBranchId());
					} else {
						branch	= (Branch) branches.get(Long.toString(element.getExecutiveBranchId()));

						if(branch == null)
							branch = BranchDao.getInstance().findByBranchId(element.getExecutiveBranchId());
					}

					element.setExecutiveBranchName(showBranchDisplayNameOnLrStatus ? branch.getDisplayName() : branch.getName());

					if(transportList.contains(executive.getAccountGroupId())) {
						branch	= (Branch) branches.get(Long.toString(element.getSourceBranchId()));

						if(branch == null)
							branch = BranchDao.getInstance().findByBranchId(element.getSourceBranchId());

						if(branch != null) {
							final var	subRegion	= (SubRegion) subRegions.get(branch.getSubRegionId());

							element.setSourceSubRegionId(branch.getSubRegionId());
							element.setSourceSubRegionName(subRegion.getName());
						}

						branch	= (Branch) branches.get(Long.toString(element.getDestinationBranchId()));

						if(branch == null && element.getDestinationBranchId() > 0)
							branch = BranchDao.getInstance().findByBranchId(element.getDestinationBranchId());

						if(branch!= null) {
							final var	subRegion	= (SubRegion) subRegions.get(branch.getSubRegionId());
							element.setDestinationSubRegionId(branch.getSubRegionId());
							element.setDestinationSubRegionName(subRegion.getName());
						} else {
							element.setDestinationSubRegionId(0);
							element.setDestinationSubRegionName(element.getDeliveryPlace());
						}
					}

					if(returnBooking != null && element.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_RETURNED)
						element.setStatus(WayBillStatusConstant.WAYBILL_STATUS_RETURNED);

					if(returnBooking != null && returnBooking.getNewWayBillId() > 0 && element.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DELIVERED)
						element.setLrStatusName(WayBillStatusConstant.getStatus(WayBillStatusConstant.WAYBILL_STATUS_RETURNED));
					else if(element.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DUEDELIVERED)
						element.setLrStatusName((String) generalConfig.getOrDefault(GeneralConfigurationPropertiesConstant.DUE_DELIVERED_STATUS_NAME, ""));
					else if(element.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DUEUNDELIVERED)
						element.setLrStatusName((String) generalConfig.getOrDefault(GeneralConfigurationPropertiesConstant.DUE_UNDELIVERED_STATUS_NAME, ""));
					else if(element.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DISPATCHED)
						element.setLrStatusName((String) generalConfig.getOrDefault(GeneralConfigurationPropertiesConstant.DISPATCHED_STATUS_NAME, ""));
					else
						element.setLrStatusName(WayBillStatusConstant.getStatus((short) element.getStatus()));

					if(!showBranchDisplayNameOnLrStatus) {
						if(showBranchWithSubregionName) {
							element.setSourceBranchName(element.getSourceBranchName() + " ( " + element.getSourceSubRegionName() + " )");
							element.setDestinationBranchName(element.getDestinationBranchName() + " ( " + element.getDestinationSubRegionName() + " ) ");
						}

						if(showSubregionWithBranchName) {
							element.setSourceBranchName(element.getSourceSubRegionName() + " ( " + element.getSourceBranchName() + " )");
							element.setDestinationBranchName(element.getDestinationSubRegionName() + " ( " + element.getDestinationBranchName() + " ) ");
						}
					}

					if(StringUtils.isNotEmpty(element.getReceivedRemark()))
						element.setRemark(element.getReceivedRemark());

					element.setRemark(Utility.checkedNullCondition(element.getRemark(), (short) 1));
					element.setLsRemark(Utility.checkedNullCondition(element.getLsRemark(), (short) 1));
				}

				if(isGoodsUndeliveredEntryAllowed && wayBillStatusDetails[wayBillStatusDetails.length - 1].getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DELIVERED)
					pendingGoodsUndeliveredStock	= PendingGoodsUndeliveredStockDaoImpl.getInstance().getStockOutDataForStatusByWayBillId(wayBillId);

				if(pendingGoodsUndeliveredStock != null)
					if(pendingGoodsUndeliveredStock.getStatus() == PendingGoodsUndeliveredStock.STOCK_DELIVERED) {
						wayBillStatusDetailsNew		= new WayBillStatusDetails[wayBillStatusDetails.length + 1];

						for(var i = 0; i < wayBillStatusDetails.length; i++)
							wayBillStatusDetailsNew[i]	= wayBillStatusDetails[i];

						wayBillStatusDetailsNew[wayBillStatusDetails.length - 1].setStockOutAllow(true);
						wayBillStatusDetailsNew[wayBillStatusDetails.length - 1].setStockOutStatus(PendingGoodsUndeliveredStock.STOCK_UNDELIVERED);

						final var wayBillStatusDetails2			= wayBillStatusDetailsNew[wayBillStatusDetails.length - 1];
						final var wayBillStatusDetails1			= (WayBillStatusDetails) wayBillStatusDetails2.clone();

						wayBillStatusDetails1.setDate(pendingGoodsUndeliveredStock.getStockOutTime());
						wayBillStatusDetails1.setExecutiveBranchName(cache.getGenericBranchDetailCache(request, pendingGoodsUndeliveredStock.getStockOutBranchId()).getName());
						wayBillStatusDetails1.setExecutiveName(pendingGoodsUndeliveredStock.getStockOutExecutiveName());
						wayBillStatusDetails1.setRemark("");
						wayBillStatusDetails1.setStockOutAllow(true);
						wayBillStatusDetails1.setStockOutStatus(PendingGoodsUndeliveredStock.STOCK_DELIVERED);
						wayBillStatusDetails1.setLrStatusName(" STOCK DELIVERED");
						wayBillStatusDetailsNew[wayBillStatusDetails.length]	= wayBillStatusDetails1;

						request.setAttribute("WayBillStatusDetails", wayBillStatusDetailsNew);
					} else if(pendingGoodsUndeliveredStock.getStatus() == PendingGoodsUndeliveredStock.STOCK_UNDELIVERED) {
						wayBillStatusDetails[wayBillStatusDetails.length - 1].setStockOutAllow(true);
						wayBillStatusDetails[wayBillStatusDetails.length - 1].setStockOutStatus(PendingGoodsUndeliveredStock.STOCK_UNDELIVERED);
						wayBillStatusDetails[wayBillStatusDetails.length - 1].setLrStatusName(WayBillStatusConstant.getStatus((short) wayBillStatusDetails[wayBillStatusDetails.length - 1].getStatus()) + " ( STOCK PENDING )");
					}
			}

			request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}
	}
}
