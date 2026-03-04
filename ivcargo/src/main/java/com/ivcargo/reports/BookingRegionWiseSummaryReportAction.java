package com.ivcargo.reports;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.Arrays;
import java.util.HashMap;
import java.util.LinkedHashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.ObjectUtils;

import com.businesslogic.displaydata.DisplayDataConfigurationBll;
import com.businesslogic.properties.impl.PropertyConfigValueBLLImpl;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.dto.constant.FeildPermissionsConstant;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.dto.constant.WayBillTypeConstant;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.ConsignmentSummaryDao;
import com.platform.dao.SubRegionDao;
import com.platform.dao.reports.BookingRegionWiseSummaryDAO;
import com.platform.dto.Branch;
import com.platform.dto.PropertiesFileConstants;
import com.platform.dto.Region;
import com.platform.dto.SubRegion;
import com.platform.dto.configuration.report.collection.BookingRegionWiseSummaryReportConfigurationDTO;
import com.platform.dto.constant.ReportWiseDisplayZeroAmountConstant;
import com.platform.dto.model.BookingRegionWiseSummaryReport;
import com.platform.dto.model.BookingRegionWiseSummaryReportModel;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

public class BookingRegionWiseSummaryReportAction implements Action {

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object> error 			= null;
		Branch				branch				= null;
		var					isShowAmountZero	= false;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeBookingRegionWiseSummaryReportAction().execute(request, response);

			final var	sdf			= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			final var	fromDate	= new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00").getTime());
			final var	toDate		= new Timestamp(sdf.parse(JSPUtility.GetString(request, "toDate") + " 23:59:59").getTime());
			final var	cache       = new CacheManip(request);
			final var	executive				= cache.getExecutive(request);
			final var	execFldPermissionsHM 	= cache.getExecutiveFieldPermission(request);
			final var regionId			= JSPUtility.GetLong(request, "Toregion" ,0);
			final var subRegionId		= JSPUtility.GetLong(request, "TosubRegion" ,0);
			short filter			= 0;
			final var	configuration										= PropertyConfigValueBLLImpl.getInstance().getConfiguration(executive, PropertiesFileConstants.REPORT_WISE_DISPLAY_ZERO_AMOUNT_CONSTANT);
			final var	isAmountZeroForBookingSummaryDestinationWiseReport	= configuration.getBoolean(ReportWiseDisplayZeroAmountConstant.BOOKING_REGION_WISE_SUMMARY_REPORT, false);
			final var	displayDataConfig									= cache.getDisplayDataConfiguration(request, executive.getAccountGroupId());
			final var	valueObjectIn										= new ValueObject();

			final var	regionObj		= cache.getAllRegions(request);
			final var	subRegionObj	= cache.getAllSubRegions(request);
			final var	branchesObj		= cache.getGenericBranchesDetail(request);

			final var groupConfiguration					= ReadAllConfigurationsBllImpl.getInstance().getOldReportConfigurationData(ReportIdentifierConstant.BOOKING_REGION_WISE_SUMMARY, executive.getAccountGroupId());
			final var customErrorOnOtherBranchDetailSearch	= groupConfiguration.getBoolean(BookingRegionWiseSummaryReportConfigurationDTO.CUSTOM_ERROR_ON_OTHER_BRANCH_DETAIL_SEARCH, false);
			final var allowReportDataSearchForOwnBranchOnly	= groupConfiguration.getBoolean(BookingRegionWiseSummaryReportConfigurationDTO.IS_SEARCH_DATA_FOR_OWN_BRANCH_ONLY, false);
			final var isAllowToSearchAllBranchReportData	= execFldPermissionsHM != null && execFldPermissionsHM.containsKey(FeildPermissionsConstant.ALLOW_TO_SEARCH_ALL_BRANCH_REPORT_DATA);
			final var deliveryLocationList					= cache.getAssignedLocationsIdListByLocationIdId(request, executive.getBranchId(), executive.getAccountGroupId());
			final var	valObjSelection 					= ActionStaticUtil.reportSelection(request, executive);
			final long	branchId 							= (Long)valObjSelection.get("branchId");

			ActionStaticUtil.executiveTypeWiseBranches(request, cache, executive);

			final var	branchIds		= ActionStaticUtil.getBranchIdsWithAssignedLocation(request, cache, executive);

			request.setAttribute("Toregion", regionId);
			request.setAttribute("TosubRegion", subRegionId);

			if(regionId > 0)
				request.setAttribute("TosubRegionForGroup", SubRegionDao.getInstance().getSubRegion(regionId));

			if(regionId == 0 && subRegionId == 0)
				filter = 1;
			else if(regionId != 0 && subRegionId == 0)
				filter = 2;
			else if(regionId != 0 && subRegionId != 0)
				filter = 3;

			final var	objectOut = BookingRegionWiseSummaryDAO.getInstance().getBookingRegionWiseSummary(filter, executive.getAccountGroupId(), branchIds, fromDate, toDate, regionId, subRegionId);

			if(objectOut != null) {
				var	reportModel = (BookingRegionWiseSummaryReport[])objectOut.get("BookingRegionWiseSummaryReport");

				if(allowReportDataSearchForOwnBranchOnly && !isAllowToSearchAllBranchReportData)
					reportModel = Arrays.stream(reportModel).filter(report -> executive.getBranchId() == report.getSourceBranchId()
					|| executive.getBranchId() == report.getDestinationBranchId()
					|| deliveryLocationList != null && (deliveryLocationList.contains(report.getSourceBranchId())
							|| deliveryLocationList.contains(report.getDestinationBranchId()))).toArray(BookingRegionWiseSummaryReport[]::new);

				if(!ObjectUtils.isEmpty(reportModel)){
					final HashMap<String,BookingRegionWiseSummaryReportModel>		dataColl	= new LinkedHashMap<>();
					final var	wayBillIds	= Utility.GetLongArrayToString((Long[])objectOut.get("wayBillArr"));
					final var	conSumColl  = ConsignmentSummaryDao.getInstance().getLimitedConsignmentDetails(wayBillIds);
					var	destIdForMap	= 0L;
					var	destNameForMap	= "";

					valueObjectIn.put("executive", executive);
					valueObjectIn.put("execFldPermissionsHM", execFldPermissionsHM);

					for (final BookingRegionWiseSummaryReport element : reportModel) {

						if(isAmountZeroForBookingSummaryDestinationWiseReport){
							valueObjectIn.put("wayBillTypeId", element.getWayBillTypeId());

							isShowAmountZero = DisplayDataConfigurationBll.isAllowToDisplayZeroAmount(displayDataConfig, valueObjectIn);
						}

						element.setActualWeight(conSumColl.get(element.getWayBillId()).getActualWeight());
						element.setNoOfArticles((int)conSumColl.get(element.getWayBillId()).getQuantity());

						var	subRegion	= (SubRegion) subRegionObj.get(element.getSubRegionId());

						element.setSubRegionName(subRegion == null ? "--" : subRegion.getName());

						var	region = (Region) regionObj.get(element.getRegionId());

						element.setRegionName(region == null ? "--" : region.getName());

						switch (filter) {
						case 1 -> {
							destIdForMap = element.getRegionId();
							region = (Region) regionObj.get(element.getRegionId());
							destNameForMap = region != null ? region.getName() : "--";
						}
						case 2 -> {
							destIdForMap = element.getSubRegionId();
							subRegion	= (SubRegion) subRegionObj.get(element.getSubRegionId());
							destNameForMap = subRegion == null ? "--" : subRegion.getName();
						}
						case 3 -> {
							branch = (Branch) branchesObj.get(Long.toString(element.getDestinationBranchId()));
							if(branch != null && branch.getTypeOfLocation() == Branch.TYPE_OF_LOCATION_OPERATIONAL_PLACE) {
								final var	locationsMapping = cache.getLocationMapping(request, executive.getAccountGroupId(), branch.getBranchId());

								if(locationsMapping != null)
									destIdForMap = locationsMapping.getLocationId();
							} else
								destIdForMap = element.getDestinationBranchId();
							branch = (Branch) branchesObj.get(Long.toString(destIdForMap));
							if(branch != null)
								destNameForMap = branch.getName();
						}
						default -> {
							break;
						}
						}

						var	model = dataColl.get(destNameForMap+"_"+destIdForMap);

						if(model == null) {
							model = new BookingRegionWiseSummaryReportModel();

							if(element.getDestinationBranchId() > 0) {
								branch = (Branch) branchesObj.get(Long.toString(element.getDestinationBranchId()));
								model.setDestinationBranchName(branch.getName());
							} else
								model.setDestinationBranchName("");

							model.setRegionId(element.getRegionId());
							model.setRegionName(element.getRegionName());
							model.setSubRegionName(element.getSubRegionName());
							model.setTotalNoOfLRs(model.getTotalNoOfLRs() + 1);
							model.setTotalActualWeight(element.getActualWeight());
							model.setTotalNoOfArticles(element.getNoOfArticles());

							if(isShowAmountZero)
								element.setGrandTotal(0);

							if(element.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID)
								model.setTotalPaidAmount(element.getGrandTotal());
							else if(element.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY)
								model.setTotalToPayAmount(element.getGrandTotal());
							else if(element.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT)
								model.setTotalCreditAmount(element.getGrandTotal());

							dataColl.put(destNameForMap+"_"+destIdForMap ,model);

						} else {

							model.setTotalNoOfLRs(model.getTotalNoOfLRs() + 1);
							model.setTotalActualWeight(model.getTotalActualWeight() + element.getActualWeight());
							model.setTotalNoOfArticles(model.getTotalNoOfArticles() + element.getNoOfArticles());

							if(isShowAmountZero) {
								element.setGrandTotal(0);
								model.setTotalCreditAmount(0);
							}

							if(element.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID)
								model.setTotalPaidAmount(model.getTotalPaidAmount() + element.getGrandTotal());
							else if(element.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY)
								model.setTotalToPayAmount(model.getTotalToPayAmount() + element.getGrandTotal());
							else if(element.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT)
								model.setTotalCreditAmount(model.getTotalCreditAmount() + element.getGrandTotal());

						}
					}
					request.setAttribute("sourceCityWiseData",dataColl);
					request.setAttribute("filter", filter);
				} else {
					if(customErrorOnOtherBranchDetailSearch){
						error.put("errorCode", CargoErrorList.OTHER_BRANCH_REPORT_DATA_SEARCH_ERROR);
						if(branchId > 0)
							error.put("errorDescription", "Kindly Contact Source Branch For Report");
						else
							error.put("errorDescription", "Kindly Contact Respective Branches For Report");
					} else {
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
		} catch (final Exception _e) {
			ActionStaticUtil.catchActionException(request, _e, error);
		}
	}
}