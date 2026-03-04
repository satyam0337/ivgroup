package com.ivcargo.reports;

//~--- non-JDK imports --------------------------------------------------------

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.StringJoiner;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.ObjectUtils;
import org.apache.commons.lang3.StringUtils;

import com.businesslogic.properties.impl.PropertyConfigValueBLLImpl;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.bll.impl.properties.DisplayDataConfigurationBllImpl;
import com.iv.dto.constant.ExecutiveTypeConstant;
import com.iv.dto.constant.FeildPermissionsConstant;
import com.iv.dto.constant.InfoForDeliveryConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.properties.constant.LSBookingRegisterPropertiesConstant;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.constant.Constant;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.utility.ListFilterUtility;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.ConsignmentSummaryDao;
import com.platform.dao.DispatchSummaryDao;
import com.platform.dao.LSBookingRegisterDao;
import com.platform.dao.WayBillBookingChargesDao;
import com.platform.dao.WayBillDao;
import com.platform.dto.ChargeTypeMaster;
import com.platform.dto.ConsignmentSummary;
import com.platform.dto.DispatchLedger;
import com.platform.dto.LSBookingRegisterReport;
import com.platform.dto.PropertiesFileConstants;
import com.platform.dto.WayBillType;
import com.platform.dto.configuration.modules.LsPrintConfigurationDTO;
import com.platform.dto.configuration.report.LSBookingRegisterReportConfigurationDTO;
import com.platform.dto.model.LHPVCompanyDetails;
import com.platform.resource.CargoErrorList;
import com.platform.utils.PropertiesUtility;
import com.platform.utils.Utility;

public class LSBookingRegisterReportAction implements Action {
	@Override
	@SuppressWarnings("unchecked")
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {

		HashMap<String,Object>	 			error 					= null;
		var 								tobranchIds				= "";
		var 								srcBranchId				= 0L;
		var								typeOfLSString			= "";
		var								grandTotal				= 0.00;
		var 							    ddGrant                 =0.00;
		var	ddLRCount	= 0;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeLSBookingRegisterReportAction().execute(request, response);

			final var	typeOfLs = JSPUtility.GetShort(request, "typeOfLs",(short) 0);

			if(typeOfLs == 0)
				typeOfLSString = DispatchLedger.TYPE_OF_LS_ID_NORMAL+","+DispatchLedger.TYPE_OF_LS_ID_Inter_Branch;
			else
				typeOfLSString = typeOfLs+"";

			final var	fromDate		= DateTimeUtility.getStartOfDayTimeStamp(JSPUtility.GetString(request, "fromDate"));
			final var	toDate			= DateTimeUtility.getEndOfDayTimeStamp(JSPUtility.GetString(request, "toDate"));
			final var	billSelectionId = JSPUtility.GetShort(request, "billSelectionId",(short)0);
			final var 	whereClause		= new StringJoiner(" ");

			final var	cManip 		= new CacheManip(request);
			final var	executive	= cManip.getExecutive(request);

			final var	displayDataConfig		= cManip.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.DISPLAY_DATA_CONFIGURATION);
			final var	valueObjectIn			= new ValueObject();
			final var	execFldPermissionsHM 	= cManip.getExecutiveFieldPermission(request);
			final var	lsRegRptconfig			= ReadAllConfigurationsBllImpl.getInstance().getOldReportConfigurationData(ReportIdentifierConstant.LS_BOOKING_REGISTER_REPORT, executive.getAccountGroupId());
			final var	showDataLsBranchWise	= lsRegRptconfig.getBoolean(LSBookingRegisterReportConfigurationDTO.SHOW_DATA_LS_BRANCH_WISE, false);

			displayDataConfig.put(Constant.EXEC_FEILD_PERMISSION, execFldPermissionsHM);
			displayDataConfig.put(Constant.EXECUTIVE_TYPE, executive.getExecutiveType());
			displayDataConfig.put(Constant.REPORT_ID, ReportIdentifierConstant.LS_BOOKING_REGISTER);

			final var	tosubRegionId 	= JSPUtility.GetLong(request, "tosubRegion", 0);
			final var	tobranch 		= JSPUtility.GetLong(request, "tobranch", 0);

			final var accountGroupId 	= executive.getAccountGroupId();

			ActionStaticUtil.executiveTypeWiseBranches(request, cManip, executive);

			if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN
					|| executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_REGIONADMIN
					|| executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_SUBREGIONADMIN)
				srcBranchId = JSPUtility.GetLong(request, "branch", 0);
			else
				srcBranchId = executive.getBranchId();

			final var	branchIds		= ActionStaticUtil.getPhysicalBranchIds1(request, cManip, executive);

			final var	locationMappMod = cManip.getAssignedLocationsIdListByLocationIdId(request, tobranch, executive.getAccountGroupId());

			if(locationMappMod != null && !locationMappMod.isEmpty())
				tobranchIds	= locationMappMod.stream().map(String::valueOf).collect(Collectors.joining(","));
			else tobranchIds = tobranch > 0 ? Long.toString(tobranch) : "";

			queryString(whereClause, fromDate, toDate, accountGroupId, branchIds,
					tobranchIds, typeOfLSString, billSelectionId, showDataLsBranchWise);

			final var destsubRegionForGroup =cManip.getSubRegionsByGroupId(request, executive.getAccountGroupId());
			request.setAttribute("destsubRegionForGroup", destsubRegionForGroup);

			final var destsubRegionBranches = cManip.getPhysicalBranchesBySubRegionId(request, executive.getAccountGroupId(), tosubRegionId);
			request.setAttribute("destsubRegionBranches", destsubRegionBranches);

			request.setAttribute("agentName", executive.getName());

			var	reports = LSBookingRegisterDao.getInstance().getLSBookingData(whereClause.toString());

			ActionStaticUtil.setRequestAttribute(request,"customAddressBranchId", srcBranchId);
			ActionStaticUtil.setRequestAttribute(request,"customAddressIdentifer", LHPVCompanyDetails.IDENTIFIER_DELIVERY);

			if(ObjectUtils.isNotEmpty(reports)) {
				final var allowReportDataSearchForOwnBranchOnly	= lsRegRptconfig.getBoolean(LSBookingRegisterPropertiesConstant.IS_SEARCH_DATA_FOR_OWN_BRANCH_ONLY, false);
				final var isAllowToSearchAllBranchReportData	= execFldPermissionsHM != null && execFldPermissionsHM.get(FeildPermissionsConstant.ALLOW_TO_SEARCH_ALL_BRANCH_REPORT_DATA) != null;
				final var customErrorOnOtherBranchDetailSearch	= lsRegRptconfig.getBoolean(LSBookingRegisterPropertiesConstant.CUSTOM_ERROR_ON_OTHER_BRANCH_DETAIL_SEARCH, false);

				if(allowReportDataSearchForOwnBranchOnly && !isAllowToSearchAllBranchReportData)
					reports = ListFilterUtility.filterList(reports, element -> executive.getBranchId() == element.getSourceBranchId()
					|| executive.getBranchId() == element.getDestinationBranchId()
					|| locationMappMod != null && (locationMappMod.contains(element.getSourceBranchId()) || locationMappMod.contains(element.getDestinationBranchId())));

				if(ObjectUtils.isNotEmpty(reports)) {
					final var	dispatchIds	  = reports.stream().map(e -> Long.toString(e.getDispatchLedgerId())).collect(Collectors.joining(Constant.COMMA));
					final var	valueObject	  = DispatchSummaryDao.getInstance().getDispatchSummaryByDispatchLedgerIds(dispatchIds);

					final var	dispatchLedgerHM  	= (HashMap<Long, ArrayList<Long>>) valueObject.get("dispachLedgerWithWaybillids");
					var 		wayBillIdList 		= (ArrayList<Long>) valueObject.get("waybillIdsForCreatingString");

					final var	waybillIdArr = new Long[wayBillIdList.size()];
					wayBillIdList.toArray(waybillIdArr);

					final var	waybillIds	 = Utility.GetLongArrayToString(waybillIdArr);
					final var	wayBillHM    = WayBillDao.getInstance().getLimitedLRDetails(waybillIds);
					final var	consignmentSummaryHM = ConsignmentSummaryDao.getInstance().getConsignmentSummaryLRTypeFlagForBillCredit(waybillIds);

					final var	ddCharge	= WayBillBookingChargesDao.getInstance().getWayBillChargeMapByWayBillIdsAndChargeMasterId(waybillIds, ChargeTypeMaster.DD);
					final var	configuration								= PropertyConfigValueBLLImpl.getInstance().getConfiguration(executive, PropertiesFileConstants.LS_PRINT_LOAD_CONFIG);
					final var	roundOffWayBillAmount						= lsRegRptconfig.getBoolean(LSBookingRegisterReportConfigurationDTO.ROUND_OFF_WAY_BILL_AMOUNT,true);
					final var	showConsolidateEwaybillNo					= lsRegRptconfig.getBoolean(LSBookingRegisterReportConfigurationDTO.SHOW_CONSOLIDATE_EWAYBILLNO,true);
					final var	showToPayFreightAmtAfterDeliveryBillCredit	= lsRegRptconfig.getBoolean(LSBookingRegisterReportConfigurationDTO.SHOW_TOPAY_FREIGHT_AMT_AFTER_DELIVERY_BILL_CREDIT, false);
					final var	appendTimeWithDate							= lsRegRptconfig.getBoolean(LSBookingRegisterReportConfigurationDTO.APPEND_TIME_WITH_DATE, false);

					request.setAttribute("appendTimeWithDate", appendTimeWithDate);

					final var isAllowDdCharge=PropertiesUtility.isAllow(configuration.get(LsPrintConfigurationDTO.DD_CHARGE)+"");
					request.setAttribute("isAllowDdCharge", isAllowDdCharge);

					for (final LSBookingRegisterReport report : reports) {
						var	branch = cManip.getGenericBranchDetailCache(request,report.getSourceBranchId());
						report.setSourceBranch(branch.getName());
						report.setSourceSubRegionId(branch.getSubRegionId());

						branch = cManip.getGenericBranchDetailCache(request,report.getDestinationBranchId());
						report.setDestinationBranch(branch.getName());
						report.setDestinationSubRegionId(branch.getSubRegionId());

						report.setDestinationBranch(cManip.getGenericBranchDetailCache(request,report.getDestinationBranchId()).getName());
						report.setLsBranch(cManip.getGenericBranchDetailCache(request,report.getLsBranchId()).getName());
						report.setLsSubRegionId(cManip.getGenericBranchDetailCache(request,report.getLsBranchId()).getSubRegionId());

						final var	subregion	= cManip.getGenericSubRegionById(request, report.getSourceSubRegionId());
						report.setSubRegionName(subregion.getName());

						if(showConsolidateEwaybillNo)
							report.setConsolidateEwaybillNo(Utility.checkedNullCondition(report.getConsolidateEwaybillNo(), (short) 1));

						wayBillIdList = dispatchLedgerHM.get(report.getDispatchLedgerId());

						valueObjectIn.put("executive", executive);
						valueObjectIn.put("execFldPermissionsHM", execFldPermissionsHM);

						ddGrant=0;
						ddLRCount = 0;

						if(wayBillIdList != null) {
							for (final Long element : wayBillIdList) {
								final var	waybill 	= wayBillHM.get(element);

								ConsignmentSummary	summary     = null;

								if(consignmentSummaryHM != null)
									summary     = consignmentSummaryHM.get(element);

								if(roundOffWayBillAmount)
									grandTotal  = Math.round(waybill.getBookingTotal());
								else
									grandTotal  = waybill.getBookingTotal();

								if(isAllowDdCharge && ddCharge.get(waybill.getWayBillId())!=null)
									ddGrant += ddCharge.get(waybill.getWayBillId());

								final var	isShowAmountZero = DisplayDataConfigurationBllImpl.getInstance().lrTypeWiseZeroAmountHM(displayDataConfig, waybill.getWayBillTypeId());

								if(isShowAmountZero) {
									grandTotal = 0;
									report.setCreditTotal(0);
								}

								if(summary != null && summary.getDeliveryTo() == InfoForDeliveryConstant.DELIVERY_TO_DOOR_ID)
									ddLRCount ++;

								report.setDDLs(wayBillIdList.size() == ddLRCount);

								if(waybill.getWayBillTypeId() == WayBillType.WAYBILL_TYPE_PAID)
									report.setPaidTotal(grandTotal + report.getPaidTotal());
								else if(waybill.getWayBillTypeId() == WayBillType.WAYBILL_TYPE_TO_PAY)
									report.setTopayTotal(grandTotal + report.getTopayTotal());
								else if(waybill.getWayBillTypeId() == WayBillType.WAYBILL_TYPE_CREDIT)
									if(showToPayFreightAmtAfterDeliveryBillCredit && summary != null && summary.isDeliveryTimeTBB())
										report.setTopayTotal(grandTotal + report.getTopayTotal());
									else
										report.setCreditTotal(grandTotal + report.getCreditTotal());

								report.setFreightTotal(report.getFreightTotal() + grandTotal);
							}

							if(isAllowDdCharge)
								report.setDdchargeTotal(ddGrant);
						}
					}

					final var reportModelArray = new LSBookingRegisterReport [reports.size()];
					reports.toArray(reportModelArray);

					request.setAttribute("showConsolidateEwaybillNo", showConsolidateEwaybillNo);
					request.setAttribute("report", reportModelArray);
				} else {
					if(customErrorOnOtherBranchDetailSearch) {
						error.put("errorCode", CargoErrorList.OTHER_BRANCH_REPORT_DATA_SEARCH_ERROR);
						if(srcBranchId > 0)
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
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}

	public void queryString(final StringJoiner whereClause, final Timestamp fromDate, final Timestamp toDate, final long accountGroupId,
			final String branchIds, final String tobranchIds, final String typeOfLSString, final short billSelectionId, final boolean showDataLsBranchWise) {

		whereClause.add("TripDateTime >= '" + fromDate + "'");
		whereClause.add("AND TripDateTime <= '" + toDate + "'");
		whereClause.add("AND (AccountGroupId = " + accountGroupId + " OR BookedForAccountGroupId = " + accountGroupId + ")");

		if(StringUtils.isNotEmpty(branchIds))
			if(showDataLsBranchWise)
				whereClause.add("AND LSBranchId IN(" + branchIds + ")");
			else
				whereClause.add("AND SourceBranchId IN(" + branchIds + ")");

		if(StringUtils.isNotEmpty(tobranchIds))
			whereClause.add("AND DestinationBranchId IN("+ tobranchIds + ")");

		whereClause.add("AND TypeOfLS IN (" + typeOfLSString + ")");
		whereClause.add("AND status <> 2");

		if(billSelectionId > 0)
			whereClause.add("AND BillSelectionId = " + billSelectionId);

		whereClause.add("ORDER BY TripDateTime");
	}
}