package com.ivcargo.reports;

import java.util.HashMap;
import java.util.Map;
import java.util.TreeMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.reports.TrafficSearchDataDao;
import com.platform.dto.Branch;
import com.platform.dto.TrafficSearch;
import com.platform.dto.TransportCommonMaster;
import com.platform.dto.model.ReportViewModel;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

public class TrafficWiseSearchViewBranchSummaryAction implements Action {

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	 			error 					= null;
		ValueObject 						objectOut 				= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	cacheManip     = new CacheManip(request);
			final var	executive      = cacheManip.getExecutive(request);
			final var	values		   = request.getParameter("fromBranchIds");
			final var	subRegionId    = JSPUtility.GetLong(request, "subRegionId", 0);
			final var	subRegion      = cacheManip.getGenericSubRegionById(request, subRegionId);

			if(subRegionId > 0 && values != null && !"".equals(values)) {
				final Map<String, Branch>	branchHM 	   = new TreeMap<>();

				final var	branchIdArray    = Utility.GetLongArrayFromString(values, ",");

				for (final Long element : branchIdArray) {
					final var	branch = cacheManip.getBranchById(request, executive.getAccountGroupId(), element);
					branchHM.put(branch.getName() + "_" + branch.getBranchId(),branch);
				}

				final var	inValObj = new ValueObject();
				inValObj.put("branchIds", values);
				inValObj.put("accountGroupId", executive.getAccountGroupId());

				request.setAttribute("branchIdsString", values);
				request.setAttribute("subRegionName", subRegion.getName());

				if(subRegionId > 0 && branchIdArray.length > 0) {
					inValObj.put("destBranchIds", cacheManip.getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_SUBREGION, subRegionId));

					objectOut = TrafficSearchDataDao.getInstance().getTrafficSearchDataByDestBranchIds(inValObj);
					request.setAttribute("subRegionBranches", cacheManip.getBranchesBySubRegionId(request, executive.getAccountGroupId(), subRegionId));
				}

				request.setAttribute("branchHM", branchHM);

				if(objectOut != null) {
					final var	reportModel 		= (TrafficSearch[])objectOut.get("TrafficSearchArr");

					if (reportModel != null) {
						for (final TrafficSearch element : reportModel) {
							element.setFromBranchName(cacheManip.getBranchById(request, executive.getAccountGroupId(), element.getFromBranchId()).getName());
							element.setFromSubRegionName(cacheManip.getSubRegionByIdAndGroupId(request, element.getFromSubRegionId(),  executive.getAccountGroupId()).getName());
							element.setFromRegionName(cacheManip.getRegionByIdAndGroupId(request, element.getFromRegionId(),  executive.getAccountGroupId()).getName());

							if(element.getToBranchId() > 0) {
								element.setToBranchName(cacheManip.getBranchById(request, executive.getAccountGroupId(), element.getToBranchId()).getName());
								element.setToSubRegionName(cacheManip.getSubRegionByIdAndGroupId(request, element.getToSubRegionId(), executive.getAccountGroupId()).getName());
								element.setToRegionName(cacheManip.getRegionByIdAndGroupId(request, element.getToRegionId(), executive.getAccountGroupId()).getName());
							} else {
								element.setToBranchId(element.getDeliveryPlaceId());
								element.setToSubRegionId(element.getToBranchId());
								element.setToRegionId(element.getToBranchId());
								element.setToBranchName("(DDDV)");
								element.setToSubRegionName(element.getToBranchName());
								element.setToRegionName(element.getToBranchName());
							}
						}

						final Map<String, Map<String, TrafficSearch>>	destWiseSubRegionSummary = new TreeMap<>();

						for (final TrafficSearch element : reportModel) {
							var	subRegionWiseSummary	= destWiseSubRegionSummary.get(element.getToBranchName() + "_" + element.getToBranchId());

							if(subRegionWiseSummary == null) {
								final var	trafficSearch = new TrafficSearch();

								trafficSearch.setFromBranchId(element.getFromBranchId());
								trafficSearch.setFromBranchName(element.getFromBranchName());
								trafficSearch.setAccountGroupId(element.getAccountGroupId());
								trafficSearch.setFromRegionId(element.getFromRegionId());
								trafficSearch.setFromSubRegionId(element.getFromSubRegionId());
								trafficSearch.setToRegionId(element.getToRegionId());
								trafficSearch.setToSubRegionId(element.getToSubRegionId());
								trafficSearch.setToSubRegionName(element.getToSubRegionName());
								trafficSearch.setToBranchId(element.getToBranchId());
								trafficSearch.setToBranchName(element.getToBranchName());
								trafficSearch.setTotalActualWeight(element.getTotalActualWeight());
								trafficSearch.setTotalChargeWeight(element.getTotalChargeWeight());
								trafficSearch.setTotalPakages(element.getTotalPakages());
								trafficSearch.setTotalNoOfLR(element.getTotalNoOfLR());
								trafficSearch.setTotalAmount(element.getTotalAmount());
								trafficSearch.setIsCrossing(element.isIsCrossing());

								subRegionWiseSummary = new TreeMap<>();
								subRegionWiseSummary.put(trafficSearch.getFromBranchName() + "_" + trafficSearch.getFromBranchId(), trafficSearch);
								destWiseSubRegionSummary.put(element.getToBranchName() + "_" + element.getToBranchId(), subRegionWiseSummary);
							} else {
								var	trafficSearch = subRegionWiseSummary.get(element.getFromBranchName() + "_" + element.getFromBranchId());

								if(trafficSearch == null) {
									trafficSearch = new TrafficSearch();
									trafficSearch.setFromBranchId(element.getFromBranchId());
									trafficSearch.setAccountGroupId(element.getAccountGroupId());
									trafficSearch.setFromRegionId(element.getFromRegionId());
									trafficSearch.setFromSubRegionId(element.getFromSubRegionId());
									trafficSearch.setToRegionId(element.getToRegionId());
									trafficSearch.setToSubRegionId(element.getToSubRegionId());
									trafficSearch.setToSubRegionName(element.getToSubRegionName());
									trafficSearch.setToBranchId(element.getToBranchId());
									trafficSearch.setToBranchName(element.getToBranchName());
									trafficSearch.setTotalActualWeight(element.getTotalActualWeight());
									trafficSearch.setTotalChargeWeight(element.getTotalChargeWeight());
									trafficSearch.setTotalPakages(element.getTotalPakages());
									trafficSearch.setTotalNoOfLR(element.getTotalNoOfLR());
									trafficSearch.setTotalAmount(element.getTotalAmount());
									trafficSearch.setIsCrossing(element.isIsCrossing());

									subRegionWiseSummary.put(element.getFromBranchName() + "_" + element.getFromBranchId(), trafficSearch);
								} else {
									trafficSearch.setTotalActualWeight(trafficSearch.getTotalActualWeight() + element.getTotalActualWeight());
									trafficSearch.setTotalChargeWeight(trafficSearch.getTotalChargeWeight() + element.getTotalChargeWeight());
									trafficSearch.setTotalPakages(trafficSearch.getTotalPakages() + element.getTotalPakages());
									trafficSearch.setTotalNoOfLR(trafficSearch.getTotalNoOfLR() + element.getTotalNoOfLR());
									trafficSearch.setTotalAmount(trafficSearch.getTotalAmount() + element.getTotalAmount());
								}
							}
						}

						destWiseSubRegionSummary.keySet().stream().map(destWiseSubRegionSummary::get)
						.forEach((final var subRegionWiseSummary) -> branchHM.keySet().stream().map(branchHM::get).filter((final var branch) -> subRegionWiseSummary.get(branch.getName() + "_" + branch.getBranchId()) == null).forEach((final var branch) -> {
							final var	trafficSearch		 = new TrafficSearch();
							trafficSearch.setFromBranchId(branch.getBranchId());
							trafficSearch.setFromBranchName(branch.getName());
							trafficSearch.setFromRegionId(branch.getRegionId());
							trafficSearch.setFromSubRegionId(branch.getSubRegionId());
							trafficSearch.setAccountGroupId(executive.getAccountGroupId());
							trafficSearch.setToSubRegionName("");

							subRegionWiseSummary.put(branch.getName() + "_" + branch.getBranchId(), trafficSearch);
						}));

						request.setAttribute("destWiseSubRegionSummary", destWiseSubRegionSummary);
					} else {
						error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
						error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
						request.setAttribute("cargoError", error);
					}
				} else {
					error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
					error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
					request.setAttribute("cargoError", error);
				}
			} else {
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}

			var	reportViewModel = new ReportViewModel();
			reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);

			request.setAttribute("ReportViewModel", reportViewModel);
			request.setAttribute("nextPageToken", "success");
		} catch (final Exception _e) {
			ActionStaticUtil.catchActionException(request, _e, error);
		}
	}
}
