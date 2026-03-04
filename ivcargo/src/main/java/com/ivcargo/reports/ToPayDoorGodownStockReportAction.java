
package com.ivcargo.reports;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.SortedMap;
import java.util.TreeMap;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.ObjectUtils;

import com.businesslogic.displaydata.DisplayDataConfigurationBll;
import com.businesslogic.properties.impl.PropertyConfigValueBLLImpl;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.constant.properties.BranchWiseIncomeExpenseDeatilsConstant;
import com.iv.dto.constant.FeildPermissionsConstant;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.properties.constant.report.ToPayDoorGodownStockReportConfigurationConstant;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.ConsignmentSummaryDao;
import com.platform.dao.CustomerDetailsDao;
import com.platform.dao.GodownUnloadDetailsDao;
import com.platform.dao.WayBillDao;
import com.platform.dto.Branch;
import com.platform.dto.GodownUnloadDetails;
import com.platform.dto.PropertiesFileConstants;
import com.platform.dto.WayBill;
import com.platform.dto.configuration.mindateselection.ReportWiseMinDateSelectionConfigurationDTO;
import com.platform.dto.constant.ReportWiseDisplayZeroAmountConstant;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

public class ToPayDoorGodownStockReportAction implements Action {
	@Override
	@SuppressWarnings("unchecked")
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {

		HashMap<String,Object>	 					error 					= null;
		ValueObject									outValObject       		= null;
		var											filter					= 0;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeToPayDoorGodownStockReportAction().execute(request, response);

			final var	cManip 							= new CacheManip(request);
			final var	executive						= cManip.getExecutive(request);

			final var	configuration					= PropertyConfigValueBLLImpl.getInstance().getConfiguration(executive, PropertiesFileConstants.REPORT_WISE_DISPLAY_ZERO_AMOUNT_CONSTANT);
			final var	toPayDoorGodownconfiguration	= ReadAllConfigurationsBllImpl.getInstance().getReportConfigurationData(ReportIdentifierConstant.TO_PAY_DOOR_GODOWN_STOCK_REPORT, executive.getAccountGroupId());
			final var	isDlyTypeWiseGodownStockReport	= configuration.getBoolean(ReportWiseDisplayZeroAmountConstant.DLY_TYPE_WISE_GODOWN_STOCK_REPORT, false);
			final var	displayDataConfig				= cManip.getDisplayDataConfiguration(request, executive.getAccountGroupId());
			final var	valueObjectIn					= new ValueObject();
			final var	execFldPermissionsHM 					= cManip.getExecutiveFieldPermission(request);
			final var 	customErrorOnOtherBranchDetailSearch	= (boolean) toPayDoorGodownconfiguration.getOrDefault(BranchWiseIncomeExpenseDeatilsConstant.CUSTOM_ERROR_ON_OTHER_BRANCH_DETAIL_SEARCH, false);
			final var 	isSearchDataForOwnBranchOnly			= (boolean) toPayDoorGodownconfiguration.getOrDefault(BranchWiseIncomeExpenseDeatilsConstant.IS_SEARCH_DATA_FOR_OWN_BRANCH_ONLY, false);
			final var	isAllowToSearchAllBranchReportData		= execFldPermissionsHM != null && execFldPermissionsHM.containsKey(FeildPermissionsConstant.ALLOW_TO_SEARCH_ALL_BRANCH_REPORT_DATA);
			final var	locationMappMod 						= cManip.getAssignedLocationsIdListByLocationIdId(request, executive.getBranchId(), executive.getAccountGroupId());
			final var	valObjSelection 						= ActionStaticUtil.reportSelection(request, executive);
			final long	branchId 								= (Long)valObjSelection.get("branchId");

			request.setAttribute("showDoorDeliveryAmount", (boolean) toPayDoorGodownconfiguration.getOrDefault(ToPayDoorGodownStockReportConfigurationConstant.SHOW_DOOR_DELIVERY_AMOUNT, false));

			final var	minDateTimeStamp	= cManip.getReportWiseMinDateToGetData(request, executive.getAccountGroupId(),
					ReportWiseMinDateSelectionConfigurationDTO.TOPAY_DOOR_GODOWN_STOCK_REPORT_MIN_DATE_ALLOW,
					ReportWiseMinDateSelectionConfigurationDTO.TOPAY_DOOR_GODOWN_STOCK_REPORT_MIN_DATE);

			// Get the Selected Combo values

			final var	wayBillTypeId	= JSPUtility.GetShort(request, "WayBillType", (short) 0);
			final var	deliveryTypeId	= JSPUtility.GetShort(request, "deliveryType", (short) 0);

			ActionStaticUtil.executiveTypeWiseBranches(request, cManip, executive);

			final var	branchesIds		= ActionStaticUtil.getBranchIds1(request, cManip, executive);

			if(wayBillTypeId == 0 && deliveryTypeId > 0)
				filter		= 1;
			else if (wayBillTypeId > 0 && deliveryTypeId == 0)
				filter		= 2;
			else if (wayBillTypeId > 0 && deliveryTypeId > 0)
				filter		= 3;
			else
				filter	   = 0;

			if(minDateTimeStamp != null)
				outValObject = GodownUnloadDetailsDao.getInstance().getGodownStockForBranchesFromMinDate(branchesIds, executive.getAccountGroupId(), minDateTimeStamp,wayBillTypeId,deliveryTypeId,filter);
			else
				outValObject = GodownUnloadDetailsDao.getInstance().getGodownStockForBranches(branchesIds, executive.getAccountGroupId(),wayBillTypeId,deliveryTypeId,filter);

			if(outValObject != null) {
				var	godownUnloadColl 	= (HashMap<Long, GodownUnloadDetails>)outValObject.get("godownUnloadColl");
				var	wayBillIdArr		= (Long[])outValObject.get("WayBillIdArray");
				var	wayBillIds 	 		= Utility.GetLongArrayToString(wayBillIdArr);

				if(godownUnloadColl != null){
					if (isSearchDataForOwnBranchOnly && !isAllowToSearchAllBranchReportData)
						godownUnloadColl = godownUnloadColl.entrySet().stream().filter(entry -> {final var element = entry.getValue();
						return executive.getBranchId() == element.getSourceBranchId()
								|| executive.getBranchId() == element.getDestinationBranchId()
								|| locationMappMod != null && (locationMappMod.contains(element.getSourceBranchId()) || locationMappMod.contains(element.getDestinationBranchId()));
						}).collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue, (e1, e2) -> e1, HashMap::new));

					if(!godownUnloadColl.isEmpty()) {
						wayBillIdArr		= godownUnloadColl.keySet().toArray(new Long[0]);
						wayBillIds 	 	= Utility.GetLongArrayToString(wayBillIdArr);
						outValObject 		= WayBillDao.getInstance().getWayBillsByWayBillTypeFromWayBill(wayBillIds, wayBillTypeId, deliveryTypeId);
					} else
						outValObject = null;
				}

				if(ObjectUtils.isNotEmpty(godownUnloadColl)){
					final var	wayBillColl		= (HashMap<Long, WayBill>)outValObject.get("WayBillColl");
					wayBillIdArr	= (Long[])outValObject.get("WayBillIdArray");
					wayBillIds		= Utility.GetLongArrayToString(wayBillIdArr);

					final var	conSummColl	= ConsignmentSummaryDao.getInstance().getConsignmentSummaryByDeliveryToType(wayBillIds,deliveryTypeId,executive.getAccountGroupId());

					if(conSummColl != null && conSummColl.size() > 0) {
						final var	consignorColl 	  = CustomerDetailsDao.getInstance().getConsignorDetailsByWayBillId(wayBillIds);
						final var	consigneeColl 	  = CustomerDetailsDao.getInstance().getConsigneeDetailsByWayBillId(wayBillIds);
						final SortedMap<String, ArrayList<GodownUnloadDetails>>	subRegionWiseData = new TreeMap<>();

						for (final Long wayBillId : conSummColl.keySet()) {
							final var	godownDetails 	= godownUnloadColl.get(wayBillId);
							final var	wayBill			= wayBillColl.get(wayBillId);
							final var	conSumm			= conSummColl.get(wayBillId);

							final var	godownForView 	= new GodownUnloadDetails();
							godownForView.setWayBillId(wayBillId);
							godownForView.setWayBillTypeId(godownDetails.getWayBillTypeId());
							godownForView.setDeliveryTypeId(godownDetails.getDeliveryTypeId());
							godownForView.setWayBillNumber(godownDetails.getWayBillNumber());
							godownForView.setBookingDateTime(wayBill.getActualBookingDateTime());
							godownForView.setSourceBranch(cManip.getGenericBranchDetailCache(request,godownDetails.getSourceBranchId()).getName());

							if(godownDetails.getDestinationBranchId() > 0)
								godownForView.setDestinationBranch(cManip.getGenericBranchDetailCache(request,godownDetails.getDestinationBranchId()).getName());
							else
								godownForView.setDestinationBranch(wayBill.getDeliveryPlace());

							godownForView.setConsignor(consignorColl.get(wayBill.getWayBillId()).getName());
							godownForView.setConsignee(consigneeColl.get(wayBill.getWayBillId()).getName());
							godownForView.setQuantity(conSumm.getQuantity());
							godownForView.setActualWeight(conSumm.getActualWeight());
							godownForView.setGrandTotal(wayBill.getGrandTotal());
							godownForView.setCreationDateTime(godownDetails.getCreationDateTime());
							godownForView.setDoorDeliveryAmount(godownDetails.getDoorDeliveryAmount());

							final var	branch = cManip.getGenericBranchDetailCache(request, godownDetails.getDestinationBranchId());

							var		 destBranchIdForMap		= 0L;

							if(branch != null && branch.getTypeOfLocation() == Branch.TYPE_OF_LOCATION_OPERATIONAL_PLACE) {
								final var	locationsMapping = cManip.getLocationMapping(request, executive.getAccountGroupId(), branch.getBranchId());

								if(locationsMapping != null)
									destBranchIdForMap = locationsMapping.getLocationId();
							} else
								destBranchIdForMap = godownDetails.getDestinationBranchId();

							if(isDlyTypeWiseGodownStockReport){
								valueObjectIn.put("executive", executive);
								valueObjectIn.put("execFldPermissionsHM", execFldPermissionsHM);
								valueObjectIn.put("wayBillTypeId", godownForView.getWayBillTypeId());

								final var	isShowAmountZero = DisplayDataConfigurationBll.isAllowToDisplayZeroAmount(displayDataConfig, valueObjectIn);

								if(isShowAmountZero)
									godownForView.setGrandTotal(0);
							}

							final var	destBranchNameForMap = cManip.getGenericBranchDetailCache(request, destBranchIdForMap).getName();

							final var	subReId 	  	= cManip.getGenericBranchDetailCache(request,godownDetails.getDestinationBranchId()).getSubRegionId();
							final var	subRegionName 	= cManip.getGenericSubRegionById(request, subReId).getName();
							var	godownUnloadList= subRegionWiseData.get(destBranchNameForMap + " ( " + subRegionName + " )_" + subReId);

							if(godownUnloadList == null )
								godownUnloadList = new ArrayList<>();

							godownUnloadList.add(godownForView);
							subRegionWiseData.put(destBranchNameForMap + " ( " + subRegionName + " )_" + subReId, godownUnloadList);
						}

						request.setAttribute("subRegionWiseData", subRegionWiseData.size() > 0 ? subRegionWiseData : null);
					} else{
						error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
						error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
						request.setAttribute("cargoError", error);
					}
				} else {
					if(customErrorOnOtherBranchDetailSearch){
						error.put("errorCode", CargoErrorList.OTHER_BRANCH_REPORT_DATA_SEARCH_ERROR);
						if(branchId > 0)
							error.put("errorDescription", "Kindly Contact Source Branch For Report");
						else
							error.put("errorDescription", "Kindly Contact Respective Branches For Report");
					}else {
						error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
						error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
					}
					request.setAttribute("cargoError", error);
				}
			} else {
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}

			ActionStaticUtil.setReportViewModel(request);
			request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}
}
