package com.ivcargo.reports;

import java.util.HashMap;
import java.util.SortedMap;
import java.util.StringJoiner;
import java.util.TreeMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.ObjectUtils;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.properties.constant.TrafficWiseSearchPropertiesConstant;
import com.iv.utils.constant.Constant;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actions.InitializeTrafficWiseSearchAction;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.reports.TrafficSearchDataDao;
import com.platform.dto.Branch;
import com.platform.dto.TrafficSearch;
import com.platform.dto.TransportCommonMaster;
import com.platform.dto.model.ReportViewModel;
import com.platform.resource.CargoErrorList;

public class TrafficWiseSearchAction implements Action {

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	 			error 					= null;
		ValueObject 						objectOut 				= null;
		ValueObject 						inValObj 				= null;
		SortedMap<String,TrafficSearch>		subRegionWiseSummary    = null;
		var  isSubRegion	  = false;
		String	 destBranchIds 	  = null;
		Branch	 crossingBranch   = null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeTrafficWiseSearchAction().execute(request, response);

			final var	cacheManip     = new CacheManip(request);
			final var	executive      = cacheManip.getExecutive(request);
			final var	values		   = request.getParameterValues("branchId");
			final var	destBranchId   = JSPUtility.GetLong(request, "destBranchId", 0);
			final var	subRegionId    = JSPUtility.GetLong(request, "subRegion", 0);
			final var	crossingBranchId = JSPUtility.GetLong(request, "crossingBranchd", 0);
			final var	configuration 	 = cacheManip.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.TRAFFIC_SUMMARY);
			final var	showOperationalBranchDataInHandling  = (boolean) configuration.getOrDefault(TrafficWiseSearchPropertiesConstant.SHOW_OPERATIONAL_BRANCH_DATA_IN_HANDLING, false);

			if(crossingBranchId > 0)
				crossingBranch   = cacheManip.getGenericBranchDetailCache(request, crossingBranchId);

			if(ObjectUtils.isNotEmpty(values)) {
				final SortedMap<String, Branch>	branchHM 	   = new TreeMap<>();
				final var	branchIds 	   = new StringJoiner(Constant.COMMA);

				for (final String value : values) {
					branchIds.add(value);
					final var	branch = cacheManip.getBranchById(request, executive.getAccountGroupId(), Long.parseLong(value));
					branchHM.put(branch.getName() + "_" + branch.getBranchId(), branch);
				}

				if(crossingBranch != null) {
					branchIds.add(Long.toString(crossingBranchId));
					branchHM.put(crossingBranch.getName() + "_" + crossingBranch.getBranchId(), crossingBranch);
				}

				inValObj = new ValueObject();
				inValObj.put("branchIds", branchIds.toString());
				inValObj.put("accountGroupId", executive.getAccountGroupId());
				request.setAttribute("branchIdsString", branchIds);

				if(subRegionId > 0 && values.length > 0) {
					if(destBranchId > 0)
						destBranchIds = Long.toString(destBranchId);
					else
						destBranchIds = cacheManip.getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_SUBREGION, subRegionId);

					inValObj.put("destBranchIds", destBranchIds);

					objectOut = TrafficSearchDataDao.getInstance().getTrafficSearchDataByDestBranchIds(inValObj);
					request.setAttribute("subRegionBranches", cacheManip.getBranchesBySubRegionId(request,executive.getAccountGroupId(), subRegionId));
				} else if(values.length > 0){
					isSubRegion = true;
					objectOut   = TrafficSearchDataDao.getInstance().getTrafficSearchData(inValObj);
				}

				request.setAttribute("branchHM", branchHM);
				request.setAttribute("isSubRegion", isSubRegion);

				if(objectOut != null) {
					final var	reportModel 		= (TrafficSearch[])objectOut.get("TrafficSearchArr");

					if (reportModel != null) {
						for (final TrafficSearch element : reportModel) {
							element.setFromBranchName(cacheManip.getBranchById(request, executive.getAccountGroupId(), element.getFromBranchId()).getName());
							element.setFromSubRegionName(cacheManip.getGenericSubRegionById(request, element.getFromSubRegionId()).getName());
							element.setFromRegionName(cacheManip.getGenericRegionById(request, element.getFromRegionId()).getName());
							final var	toBranch = cacheManip.getGenericBranchDetailCache(request, element.getToBranchId());

							if (showOperationalBranchDataInHandling	&& toBranch.getTypeOfLocation() == Branch.TYPE_OF_LOCATION_OPERATIONAL_PLACE)
								element.setToBranchId(toBranch.getHandlingBranchId());

							if(element.getToBranchId() > 0){
								element.setToBranchName(cacheManip.getBranchById(request, executive.getAccountGroupId(), element.getToBranchId()).getName()+"_0");
								element.setToSubRegionName(cacheManip.getGenericSubRegionById(request, element.getToSubRegionId()).getName()+"_0");
								element.setToRegionName(cacheManip.getGenericRegionById(request, element.getToRegionId()).getName());
								element.setIsDDDV(false);
							} else {
								element.setToBranchId(element.getDeliveryPlaceId());
								element.setToSubRegionId(element.getToBranchId());
								element.setToRegionId(element.getToBranchId());
								element.setToBranchName("(DDDV)_1");
								element.setToSubRegionName(element.getToBranchName());
								element.setToRegionName(element.getToBranchName());
								element.setIsDDDV(true);
							}
						}

						SortedMap<String,SortedMap<String,TrafficSearch>>	destWiseSubRegionSummary= new TreeMap<>();

						for (final TrafficSearch element : reportModel) {
							TrafficSearch	trafficSearch 		    = null;

							if(subRegionId > 0)
								subRegionWiseSummary	= destWiseSubRegionSummary.get(element.getToBranchName() + "_" + element.getToBranchId());
							else
								subRegionWiseSummary	= destWiseSubRegionSummary.get(element.getToSubRegionName() + "_" + element.getToSubRegionId());

							if(subRegionWiseSummary == null) {
								trafficSearch = new TrafficSearch();
								subRegionWiseSummary = new TreeMap<>();

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
								trafficSearch.setDeliveryPlaceId(element.getDeliveryPlaceId());
								trafficSearch.setIsDDDV(element.isIsDDDV());

								subRegionWiseSummary.put(trafficSearch.getFromBranchName() + "_" + trafficSearch.getFromBranchId(), trafficSearch);

								if(subRegionId > 0)
									destWiseSubRegionSummary.put(element.getToBranchName() + "_" + element.getToBranchId(), subRegionWiseSummary);
								else
									destWiseSubRegionSummary.put(element.getToSubRegionName() + "_" + element.getToSubRegionId(), subRegionWiseSummary);
							} else {
								trafficSearch = subRegionWiseSummary.get(element.getFromBranchName() + "_" + element.getFromBranchId());

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
									trafficSearch.setDeliveryPlaceId(element.getDeliveryPlaceId());
									trafficSearch.setIsDDDV(element.isIsDDDV());

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

						for(final String key :destWiseSubRegionSummary.keySet()){
							subRegionWiseSummary = destWiseSubRegionSummary.get(key);

							for(final String value : branchHM.keySet()) {
								final var	branch		 = branchHM.get(value);

								if(subRegionWiseSummary.get(branch.getName() + "_" + branch.getBranchId()) == null) {
									final var	trafficSearch		 = new TrafficSearch();
									trafficSearch.setFromBranchId(branch.getBranchId());
									trafficSearch.setFromBranchName(branch.getName());
									trafficSearch.setFromRegionId(branch.getRegionId());
									trafficSearch.setFromSubRegionId(branch.getSubRegionId());
									trafficSearch.setAccountGroupId(executive.getAccountGroupId());
									trafficSearch.setToSubRegionName("");

									subRegionWiseSummary.put(branch.getName() + "_" + branch.getBranchId(), trafficSearch);
								}
							}
						}

						request.setAttribute("destWiseSubRegionSummary", destWiseSubRegionSummary);

						final SortedMap<String,SortedMap<String,SortedMap<String,TrafficSearch>>>	destSubRegionAndBranchSummary  = new TreeMap<>();

						for (final TrafficSearch element : reportModel) {
							var	destBranchWiseSummary	= destSubRegionAndBranchSummary.get(element.getToSubRegionName() + "_" + element.getToSubRegionId());

							if(destBranchWiseSummary == null) {
								final var	trafficSearch 		  = new TrafficSearch();
								subRegionWiseSummary  = new TreeMap<>();
								destBranchWiseSummary = new TreeMap<>();

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
								trafficSearch.setDeliveryPlaceId(element.getDeliveryPlaceId());
								trafficSearch.setIsDDDV(element.isIsDDDV());

								subRegionWiseSummary.put(trafficSearch.getFromBranchName() + "_" + trafficSearch.getFromBranchId(), trafficSearch);
								destBranchWiseSummary.put(trafficSearch.getToBranchName() + "_" + trafficSearch.getToBranchId(), subRegionWiseSummary);
								destSubRegionAndBranchSummary.put(element.getToSubRegionName() + "_" + element.getToSubRegionId(), destBranchWiseSummary);
							} else {
								subRegionWiseSummary = destBranchWiseSummary.get(element.getToBranchName() + "_" + element.getToBranchId());

								if(subRegionWiseSummary == null) {
									final var	trafficSearch 		  = new TrafficSearch();
									subRegionWiseSummary  = new TreeMap<>();

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
									trafficSearch.setDeliveryPlaceId(element.getDeliveryPlaceId());
									trafficSearch.setIsDDDV(element.isIsDDDV());

									subRegionWiseSummary.put(trafficSearch.getFromBranchName() + "_" + trafficSearch.getFromBranchId(), trafficSearch);
									destBranchWiseSummary.put(trafficSearch.getToBranchName() + "_" + trafficSearch.getToBranchId(), subRegionWiseSummary);
								} else {
									var	trafficSearch = subRegionWiseSummary.get(element.getFromBranchName() + "_" + element.getFromBranchId());

									if(trafficSearch == null) {
										trafficSearch = new TrafficSearch();

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
										trafficSearch.setDeliveryPlaceId(element.getDeliveryPlaceId());
										trafficSearch.setIsDDDV(element.isIsDDDV());

										subRegionWiseSummary.put(trafficSearch.getFromBranchName() + "_" + trafficSearch.getFromBranchId(), trafficSearch);
									} else {
										trafficSearch.setTotalActualWeight(trafficSearch.getTotalActualWeight() + element.getTotalActualWeight());
										trafficSearch.setTotalChargeWeight(trafficSearch.getTotalChargeWeight() + element.getTotalChargeWeight());
										trafficSearch.setTotalPakages(trafficSearch.getTotalPakages() + element.getTotalPakages());
										trafficSearch.setTotalNoOfLR(trafficSearch.getTotalNoOfLR() + element.getTotalNoOfLR());
										trafficSearch.setTotalAmount(trafficSearch.getTotalAmount() + element.getTotalAmount());
									}
								}
							}
						}

						for(final String key :destSubRegionAndBranchSummary.keySet()){
							destWiseSubRegionSummary = destSubRegionAndBranchSummary.get(key);

							for(final String key1 :destWiseSubRegionSummary.keySet()){
								subRegionWiseSummary = destWiseSubRegionSummary.get(key1);

								for(final String value : branchHM.keySet()){
									final var	branch		 = branchHM.get(value);

									if(subRegionWiseSummary.get(branch.getName()+"_"+branch.getBranchId()) == null){
										final var	trafficSearch		 = new TrafficSearch();
										trafficSearch.setFromBranchId(branch.getBranchId());
										trafficSearch.setFromBranchName(branch.getName());
										trafficSearch.setFromRegionId(branch.getRegionId());
										trafficSearch.setFromSubRegionId(branch.getSubRegionId());
										trafficSearch.setAccountGroupId(executive.getAccountGroupId());
										trafficSearch.setToSubRegionName("");

										subRegionWiseSummary.put(branch.getName() + "_" + branch.getBranchId(), trafficSearch);
									}
								}
							}
						}

						request.setAttribute("destSubRegionAndBranchSummary", destSubRegionAndBranchSummary);
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

			request.setAttribute("ReportViewModel",reportViewModel);
			request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}

	}
}
