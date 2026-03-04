package com.ivcargo.actions;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.ObjectUtils;

import com.businesslogic.properties.impl.PropertyConfigValueBLLImpl;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.dto.constant.CargoAccountGroupConstant;
import com.iv.dto.constant.WayBillTypeConstant;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.constant.Constant;
import com.iv.utils.utility.SortUtils;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.reports.ReportView;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.DispatchArticleDetailsDao;
import com.platform.dao.DispatchLedgerDao;
import com.platform.dao.DispatchSummaryDao;
import com.platform.dao.GodownDao;
import com.platform.dto.DispatchArticleDetails;
import com.platform.dto.Godown;
import com.platform.dto.PropertiesFileConstants;
import com.platform.dto.configuration.modules.TripDetails;
import com.platform.dto.model.ReportViewModel;
import com.platform.dto.model.WayBillReceivableModel;
import com.platform.resource.CargoErrorList;
import com.platform.utils.TokenGenerator;
import com.platform.utils.Utility;

public class ViewReceivableWaybillAction implements Action {
	public static final String TRACE_ID = "ViewReceivableWaybillAction";

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	 	error 					= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	cManip					= new CacheManip(request);
			final var	executive				= cManip.getExecutive(request);
			final var	configration 			= PropertyConfigValueBLLImpl.getInstance().getConfiguration(executive, PropertiesFileConstants.TRIP_DETAILS_CONFIG);
			final var	dispatchLedgerId		= JSPUtility.GetLong(request, "dispatchLedgerId", 0);
			final var	destGodownSubRegion 	= JSPUtility.GetLong(request, "destGodownSubRegion",0);
			final var	destGodownBranchId 		= JSPUtility.GetLong(request, "destGodownBranchId",0);

			var	wayBillModels		= DispatchSummaryDao.getInstance().getReceivablesWaybillDetailsByDispatchLedger(dispatchLedgerId, executive.getAccountGroupId());

			if(ObjectUtils.isEmpty(wayBillModels)) {
				error.put("errorCode", CargoErrorList.NO_RECORDS);
				error.put("errorDescription", CargoErrorList.NO_RECORDS_DESCRIPTION);
				request.setAttribute("cargoError", error);
				request.setAttribute("nextPageToken", "success");
			} else {
				final var	dispatchArticlDetailsArrayHM 	= DispatchArticleDetailsDao.getInstance().getDispatchArticleDetailsByDispatchLegerId(dispatchLedgerId);

				if(ObjectUtils.isEmpty(dispatchArticlDetailsArrayHM)) {
					error.put("errorCode", CargoErrorList.NO_RECORDS);
					error.put("errorDescription", CargoErrorList.NO_RECORDS_DESCRIPTION);
					request.setAttribute("cargoError", error);
					request.setAttribute("nextPageToken", "success");
					return;
				}

				final var	dispatchLedger					= DispatchLedgerDao.getInstance().getDispatchLedgerByDispatchLedgerId(dispatchLedgerId);

				var	reportViewModel = new ReportViewModel();
				reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);
				request.setAttribute("ReportViewModel",reportViewModel);

				for(final WayBillReceivableModel waModel : wayBillModels) {
					final var	srcBranch 		= cManip.getGenericBranchDetailCache(request, waModel.getSourceBranchId());
					final var	descBranch 		= cManip.getGenericBranchDetailCache(request, waModel.getDestinationBranchId());
					final var	srcSubRegion 	= cManip.getGenericSubRegionById(request, srcBranch.getSubRegionId());
					final var	descSubRegion 	= cManip.getGenericSubRegionById(request, descBranch.getSubRegionId());

					final var dispatchArticleDetailsArray = dispatchArticlDetailsArrayHM.get(waModel.getWayBillId());

					if(dispatchArticleDetailsArray != null) {
						final List<DispatchArticleDetails> 	list	= Arrays.asList(dispatchArticleDetailsArray);

						final var articleType = list.stream().map(e -> e.getPackingTypeName() + "").collect(Collectors.joining(Constant.COMMA));

						waModel.setDispatchedQuantity((int) list.stream().map(DispatchArticleDetails::getQuantity).mapToLong(Long::longValue).sum());
						waModel.setArticleType(articleType);
					} else
						waModel.setArticleType(Constant.DASH);

					waModel.setSourceSubRegionId(srcBranch.getSubRegionId());
					waModel.setDestinationSubRegionId(descBranch.getSubRegionId());
					waModel.setSourceSubRegion(srcSubRegion.getName());
					waModel.setSourceBranch(srcBranch.getName());
					waModel.setDestinationSubRegion(descSubRegion.getName());
					waModel.setDestinationBranch(descBranch.getName());

					if(waModel.isManual())
						waModel.setWayBillType(WayBillTypeConstant.getWayBillTypeNameByWayBilTypeId(waModel.getWayBillTypeId()) + WayBillTypeConstant.WAYBILL_TYPE_MANUAL);
					else
						waModel.setWayBillType(WayBillTypeConstant.getWayBillTypeNameByWayBilTypeId(waModel.getWayBillTypeId()));
				}

				if(destGodownSubRegion > 0) {
					//Get all Branches
					Godown[] godowns = null;

					if(destGodownBranchId > 0)
						godowns = GodownDao.getInstance().getGodownListByBranch(destGodownBranchId, executive.getAccountGroupId(), Godown.GODOWN_TYPE_SCRAP_ID, false);
					else
						godowns = GodownDao.getInstance().getGroupGodownsByCityId(executive.getAccountGroupId(), destGodownBranchId);

					request.setAttribute("godowns", godowns);
				}

				final var	srcBranch		= cManip.getGenericBranchDetailCache(request, dispatchLedger.getSourceBranchId());
				final var	descBranch 		= cManip.getGenericBranchDetailCache(request, dispatchLedger.getDestinationBranchId());
				final var	srcSubRegion	= cManip.getGenericSubRegionById(request, srcBranch.getSubRegionId());
				final var	descSubRegion	= cManip.getGenericSubRegionById(request, descBranch.getSubRegionId());

				if(Utility.getBoolean(configration.get(TripDetails.SORT_BY_CONSIGNEE_NAME)))
					wayBillModels 	=  SortUtils.sortList(wayBillModels, WayBillReceivableModel::getConsigneeName);

				final var token = TokenGenerator.nextToken();
				request.setAttribute(TokenGenerator.RECEIVE_TOKEN_KEY, token);
				request.getSession().setAttribute(TokenGenerator.RECEIVE_TOKEN_KEY, token);

				request.setAttribute("nextPageToken", "success");
				request.setAttribute("WayBillReceivableModel", wayBillModels.toArray(new WayBillReceivableModel[wayBillModels.size()]));
				request.setAttribute("lsNumber", dispatchLedger.getLsNumber());
				request.setAttribute("scrSubRegion", srcSubRegion.getName());
				request.setAttribute("scrBranch", srcBranch.getName());
				request.setAttribute("desSubRegion", descSubRegion.getName());
				request.setAttribute("desBranch", descBranch.getName());
				request.setAttribute("date", DateTimeUtility.getDateFromTimeStamp(dispatchLedger.getTripDateTime(), "dd-MMM-yy hh:mm aaa"));
				request.setAttribute("vehicleNo", Utility.checkedNullCondition(dispatchLedger.getVehicleNumber(), (short) 1));
				request.setAttribute("driver", Utility.checkedNullCondition(dispatchLedger.getDriverName(), (short) 1));
				request.setAttribute("cleaner", Utility.checkedNullCondition(dispatchLedger.getCleanerName(), (short) 1));
				request.setAttribute("showRemark", Utility.getBoolean(configration.get("showRemark")));
				request.setAttribute("removeCheckBox", Utility.getBoolean(configration.get("removeCheckBox")));

				if( executive.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNT_GROUP_ID_FALCON_CARGO)
					request.setAttribute("nextPageToken", "success_" + executive.getAccountGroupId());
				else
					request.setAttribute("nextPageToken", "success");
			}
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}
}