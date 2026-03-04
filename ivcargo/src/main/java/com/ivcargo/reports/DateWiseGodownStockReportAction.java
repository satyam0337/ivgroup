package com.ivcargo.reports;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringUtils;

import com.businesslogic.displaydata.DisplayDataConfigurationBll;
import com.businesslogic.properties.impl.PropertyConfigValueBLLImpl;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.dto.constant.ExecutiveTypeConstant;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.properties.constant.report.GodownStockReportConfigurationConstant;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.exception.ExceptionProcess;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.ChargeConfigDao;
import com.platform.dao.GodownDao;
import com.platform.dao.GodownUnloadDetailsDao;
import com.platform.dto.Branch;
import com.platform.dto.GodownUnloadDetails;
import com.platform.dto.PropertiesFileConstants;
import com.platform.dto.constant.ReportWiseDisplayZeroAmountConstant;
import com.platform.dto.constant.WayBillTypeConstant;
import com.platform.resource.CargoErrorList;

public class DateWiseGodownStockReportAction implements Action {

	private static final String TRACE_ID = "DateWiseGodownStockReportAction";

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	 			error = null;
		Map<Long, GodownUnloadDetails>		pendingDeliveryColl		= null;
		Map<Long, GodownUnloadDetails>		crossingColl			= null;
		ValueObject							valueObjectOut								= null;

		var 		regionId		= 0L;
		var 		subRegionId		= 0L;
		var 		branchId		= 0L;
		Double		chargeAmount	= 0.0;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeDateWiseGodownStockReportAction().execute(request, response);

			final var	sdf			= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			final var	fromDate    = new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00").getTime());
			final var	toDate      = new Timestamp(sdf.parse(JSPUtility.GetString(request, "toDate") + " 23:59:59").getTime());
			final var	godownId	= JSPUtility.GetLong(request, "godownId" ,0);
			final var	cacheManip	= new CacheManip(request);
			final var	executive				= cacheManip.getExecutive(request);
			final var	execFldPermissionsHM 	= cacheManip.getExecutiveFieldPermission(request);

			final var	configuration								= PropertyConfigValueBLLImpl.getInstance().getConfiguration(executive, PropertiesFileConstants.REPORT_WISE_DISPLAY_ZERO_AMOUNT_CONSTANT);
			final var	isAmountZeroForDateWiseGodownStockReport	= configuration.getBoolean(ReportWiseDisplayZeroAmountConstant.DATE_WISE_GODOWN_STOCK_REPORT, false);
			final var	dateWiseGodwnConfig				= ReadAllConfigurationsBllImpl.getInstance().getReportConfigurationData(ReportIdentifierConstant.GODOWN_STOCK_REPORT, executive.getAccountGroupId());
			final var	isShowDeliveryToCol							= (boolean) dateWiseGodwnConfig.getOrDefault(GodownStockReportConfigurationConstant.IS_SHOW_DELIVERY_TO_COL,false);
			final var	showAcutalWeightCol							= (boolean) dateWiseGodwnConfig.getOrDefault(GodownStockReportConfigurationConstant.SHOW_ACUTAL_WEIGHT_COL,false);
			final var	showDeclaredValueCol						= (boolean) dateWiseGodwnConfig.getOrDefault(GodownStockReportConfigurationConstant.SHOW_DECLARED_VALUE_COL,false);
			final var	showUnloadDateCol							= (boolean) dateWiseGodwnConfig.getOrDefault(GodownStockReportConfigurationConstant.SHOW_UNLOAD_DATE_COL,false);
			final var	showFullLRTypeName							= (boolean) dateWiseGodwnConfig.getOrDefault(GodownStockReportConfigurationConstant.SHOW_FULL_LR_TYPE_NAME,false);
			final var	showPackingType								= (boolean) dateWiseGodwnConfig.getOrDefault(GodownStockReportConfigurationConstant.SHOW_PACKING_TYPE,false);
			final var	showConsigneeNumber							= (boolean) dateWiseGodwnConfig.getOrDefault(GodownStockReportConfigurationConstant.SHOW_CONSIGNEE_NUMBER,false);
			final var	allowCustomSorting							= (boolean) dateWiseGodwnConfig.getOrDefault(GodownStockReportConfigurationConstant.ALLOW_CUSTOM_SORTING,false);
			final var	showSummaryTable							= (boolean) dateWiseGodwnConfig.getOrDefault(GodownStockReportConfigurationConstant.SHOW_SUMMARY_TABLE,false);
			final var	showOctColumn								= (boolean) dateWiseGodwnConfig.getOrDefault(GodownStockReportConfigurationConstant.SHOW_OCT_COLUMN,false);
			final var	showColor							        = (boolean) dateWiseGodwnConfig.getOrDefault(GodownStockReportConfigurationConstant.SHOW_COLOR,false);
			final var	displayDataConfig							= cacheManip.getDisplayDataConfiguration(request, executive.getAccountGroupId());
			final var	valueObjectIn								= new ValueObject();
			final var	sortByUnloadDateWise						= (boolean) dateWiseGodwnConfig.getOrDefault(GodownStockReportConfigurationConstant.SORT_BY_UNLOAD_DATE_WISE, false);

			if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN) {
				regionId 	= Long.parseLong(request.getParameter("region"));
				subRegionId = JSPUtility.GetLong(request, "subRegion", 0);
				branchId 	= JSPUtility.GetLong(request, "branch", 0);

				// Get Combo values to restore
				request.setAttribute("subRegionForGroup", cacheManip.getSubRegionsByRegionId(request, regionId, executive.getAccountGroupId()));
				request.setAttribute("subRegionBranches", cacheManip.getBranchesBySubRegionId(request, executive.getAccountGroupId(), subRegionId));
			} else if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_REGIONADMIN) {
				regionId 	= executive.getRegionId();
				subRegionId = JSPUtility.GetLong(request, "subRegion", 0);
				branchId 	= JSPUtility.GetLong(request, "branch", 0);
				// Get Combo values to restore
				request.setAttribute("subRegionForGroup", cacheManip.getSubRegionsByRegionId(request, regionId, executive.getAccountGroupId()));
				request.setAttribute("subRegionBranches", cacheManip.getBranchesBySubRegionId(request, executive.getAccountGroupId(), subRegionId));
			} else if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_SUBREGIONADMIN) {
				regionId 	= executive.getRegionId();
				subRegionId = executive.getSubRegionId();
				branchId 	= JSPUtility.GetLong(request, "branch", 0);
				// Get Combo values to restore
				request.setAttribute("subRegionBranches", cacheManip.getBranchesBySubRegionId(request, executive.getAccountGroupId(), subRegionId));
			} else {
				regionId 	= executive.getRegionId();
				subRegionId = executive.getSubRegionId();
				branchId 	= executive.getBranchId();
			}

			request.setAttribute("GodownList", GodownDao.getInstance().getGodownList(branchId, executive.getAccountGroupId()));

			final var	wayBillTypeId  = JSPUtility.GetLong(request, "wayBillTypeId" ,0);
			final var	godownUnloadDetailList = GodownUnloadDetailsDao.getInstance().getDateWiseGodownStockReportData(fromDate, toDate, godownId, wayBillTypeId);

			if(godownUnloadDetailList != null && !godownUnloadDetailList.isEmpty()) {
				final var branches 		= cacheManip.getGenericBranchesDetail(request);

				final Map<Long, GodownUnloadDetails>	godownUnloadColl	= godownUnloadDetailList.stream()
						.collect(Collectors.toMap(GodownUnloadDetails::getWayBillId, Function.identity(), (e1, e2) -> e1, LinkedHashMap::new));

				final Map<Long, String>	packingTypeHM		= godownUnloadDetailList.stream().collect(Collectors.groupingBy(GodownUnloadDetails::getWayBillId,
						Collectors.mapping(e -> e.getArtQuantity() + " - " + e.getPackingTypeName(), Collectors.joining(", "))));

				final var	wayBillIdStr			= godownUnloadColl.entrySet().stream().map(e -> Long.toString(e.getKey())).collect(Collectors.joining(","));
				final var	chargeMapCollection  	= ChargeConfigDao.getInstance().getChargeAmountForMultipleWayBills(wayBillIdStr);

				valueObjectIn.put("executive", executive);
				valueObjectIn.put("execFldPermissionsHM", execFldPermissionsHM);

				for (final Map.Entry<Long, GodownUnloadDetails> entry : godownUnloadColl.entrySet()) {
					final var	godownUnloadDetails = entry.getValue();
					var	isShowAmountZero	= false;

					if(isAmountZeroForDateWiseGodownStockReport) {
						valueObjectIn.put("wayBillTypeId", godownUnloadDetails.getWayBillTypeId());
						isShowAmountZero = DisplayDataConfigurationBll.isAllowToDisplayZeroAmount(displayDataConfig, valueObjectIn);
					}

					if(isShowAmountZero)
						godownUnloadDetails.setGrandTotal(0);

					if(showFullLRTypeName)
						godownUnloadDetails.setWayBillType(WayBillTypeConstant.getWayBillTypeNameByWayBilTypeId(godownUnloadDetails.getWayBillTypeId()));

					var	branch		= (Branch) branches.get(Long.toString(godownUnloadDetails.getSourceBranchId()));

					godownUnloadDetails.setQuantity(godownUnloadDetails.getTotalQuantity() - godownUnloadDetails.getShortLuggage());
					godownUnloadDetails.setPackingTypeName(packingTypeHM.getOrDefault(entry.getKey(), ""));
					godownUnloadDetails.setSourceBranch(branch.getName());

					if(godownUnloadDetails.getDestinationBranchId() > 0 ) {
						branch		= (Branch) branches.get(Long.toString(godownUnloadDetails.getDestinationBranchId()));
						godownUnloadDetails.setDestinationBranch(branch.getName());
					} else
						godownUnloadDetails.setDestinationBranch("DDDV");

					if(chargeMapCollection != null && chargeMapCollection.size() > 0) {
						chargeAmount = chargeMapCollection.get(entry.getKey());

						if(chargeAmount != null)
							godownUnloadDetails.setOctroiAmount(chargeAmount);
					}

					if(allowCustomSorting)
						if(StringUtils.contains(godownUnloadDetails.getWayBillNumber(), "/"))
							godownUnloadDetails.setNewLRnumber(Long.parseLong(godownUnloadDetails.getWayBillNumber().split("/")[1]));
						else
							godownUnloadDetails.setNewLRnumber(Long.parseLong(godownUnloadDetails.getWayBillNumber()));
				}

				List<GodownUnloadDetails> result = godownUnloadColl.values().stream().collect(Collectors.toList());

				if(allowCustomSorting)
					result	= allowCustomSorting(result);
				else
					result.sort(Comparator.comparing(GodownUnloadDetails::getCreationDateTime));

				if(sortByUnloadDateWise)
					crossingColl		= result.stream().filter(GodownUnloadDetails::isCrossing)
					.sorted(Comparator.comparing(GodownUnloadDetails::getCreationDateTime,Comparator.reverseOrder()))
					.collect(Collectors.toMap(GodownUnloadDetails::getWayBillId, Function.identity(), (e1, e2) -> e1, LinkedHashMap::new));
				else
					crossingColl		= result.stream().filter(GodownUnloadDetails::isCrossing)
					.collect(Collectors.toMap(GodownUnloadDetails::getWayBillId, Function.identity(), (e1, e2) -> e1, LinkedHashMap::new));

				if(sortByUnloadDateWise)
					pendingDeliveryColl	= result.stream().filter(e -> !e.isCrossing())
					.sorted(Comparator.comparing(GodownUnloadDetails::getCreationDateTime,Comparator.reverseOrder()))
					.collect(Collectors.toMap(GodownUnloadDetails::getWayBillId, Function.identity(), (e1, e2) -> e1, LinkedHashMap::new));
				else
					pendingDeliveryColl	= result.stream().filter(e -> !e.isCrossing())
					.collect(Collectors.toMap(GodownUnloadDetails::getWayBillId, Function.identity(), (e1, e2) -> e1, LinkedHashMap::new));

				if(crossingColl != null) {
					valueObjectOut = calculateSummary(crossingColl, true);

					request.setAttribute("paidCrossingTotal", valueObjectOut.getDouble("paidCrossingTotal", 0.0));
					request.setAttribute("toPayCrossingTotal", valueObjectOut.getDouble("toPayCrossingTotal", 0.0));
					request.setAttribute("tbbCrossingTotal", valueObjectOut.getDouble("tbbCrossingTotal", 0.0));
				}

				if(pendingDeliveryColl != null) {
					valueObjectOut = calculateSummary(pendingDeliveryColl, false);

					request.setAttribute("paidTotal", valueObjectOut.getDouble("paidTotal", 0.0));
					request.setAttribute("toPayTotal", valueObjectOut.getDouble("toPayTotal", 0.0));
					request.setAttribute("tbbTotal", valueObjectOut.getDouble("tbbTotal", 0.0));
				}

				request.setAttribute("godownUnloadDetails", godownUnloadColl);
				request.setAttribute("pendingDeliveryColl", pendingDeliveryColl);
				request.setAttribute("crossingColl", crossingColl);
				request.setAttribute("isShowDeliveryToCol", isShowDeliveryToCol);
				request.setAttribute("showAcutalWeightCol", showAcutalWeightCol);
				request.setAttribute("showDeclaredValueCol", showDeclaredValueCol);
				request.setAttribute("showUnloadDateCol", showUnloadDateCol);
				request.setAttribute("showPackingType", showPackingType);
				request.setAttribute("showConsigneeNumber", showConsigneeNumber);
				request.setAttribute("showSummaryTable", showSummaryTable);
				request.setAttribute("showOctColumn", showOctColumn);
				request.setAttribute("showOctColumn", showOctColumn);
				request.setAttribute("showColor", showColor);


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

	private List<GodownUnloadDetails> allowCustomSorting(final List<GodownUnloadDetails> result) throws Exception {
		try {
			final Comparator<GodownUnloadDetails> compareByName = Comparator
					.comparing(GodownUnloadDetails::getSourceBranch)
					.thenComparing(GodownUnloadDetails::isManual)
					.thenComparing(GodownUnloadDetails::getNewLRnumber);

			return result.stream().sorted(compareByName).collect(Collectors.toList());
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private ValueObject calculateSummary(final Map<Long, GodownUnloadDetails> godownUnloadColl, final boolean isCrossing) throws Exception {
		var 					paidTotal		= 0.0;
		var 					toPayTotal		= 0.0;
		var 					tbbTotal		= 0.0;
		ValueObject				valueObjectOut	= null;


		try {
			if(godownUnloadColl != null && !godownUnloadColl.isEmpty()) {
				paidTotal		= godownUnloadColl.values().stream().filter(e -> e.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID).mapToDouble(GodownUnloadDetails::getGrandTotal).sum();
				toPayTotal		= godownUnloadColl.values().stream().filter(e -> e.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY).mapToDouble(GodownUnloadDetails::getGrandTotal).sum();
				tbbTotal		= godownUnloadColl.values().stream().filter(e -> e.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT).mapToDouble(GodownUnloadDetails::getGrandTotal).sum();
			}

			valueObjectOut = new ValueObject();

			if(isCrossing) {
				valueObjectOut.put("paidCrossingTotal", paidTotal);
				valueObjectOut.put("toPayCrossingTotal", toPayTotal);
				valueObjectOut.put("tbbCrossingTotal", tbbTotal);
			} else {
				valueObjectOut.put("paidTotal", paidTotal);
				valueObjectOut.put("toPayTotal", toPayTotal);
				valueObjectOut.put("tbbTotal", tbbTotal);
			}

			return valueObjectOut;
		} catch(final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}
}