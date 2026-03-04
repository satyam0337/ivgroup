package com.ivcargo.reports;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.SortedMap;
import java.util.TreeMap;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.ObjectUtils;
import org.apache.commons.lang3.StringUtils;

import com.businesslogic.displaydata.DisplayDataConfigurationBll;
import com.businesslogic.properties.impl.PropertyConfigValueBLLImpl;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.bll.impl.properties.DisplayDataConfigurationBllImpl;
import com.iv.dto.constant.BookingTypeConstant;
import com.iv.dto.constant.CorporateAccountConstant;
import com.iv.dto.constant.FeildPermissionsConstant;
import com.iv.dto.constant.PaymentTypeConstant;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.dto.constant.WayBillStatusConstant;
import com.iv.dto.constant.WayBillTypeConstant;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.exception.ExceptionProcess;
import com.iv.utils.utility.ListFilterUtility;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.CorporateAccountDao;
import com.platform.dao.reports.BookingSummaryReportDAO;
import com.platform.dto.Branch;
import com.platform.dto.Commodity;
import com.platform.dto.CorporateAccount;
import com.platform.dto.CustomGroupMapper;
import com.platform.dto.Executive;
import com.platform.dto.ExecutiveFeildPermissionDTO;
import com.platform.dto.LocationsMapping;
import com.platform.dto.PropertiesFileConstants;
import com.platform.dto.Region;
import com.platform.dto.SubRegion;
import com.platform.dto.TransportCommonMaster;
import com.platform.dto.VehicleType;
import com.platform.dto.configuration.report.collection.BookingSummaryReportConfigurationDTO;
import com.platform.dto.constant.ReportWiseDisplayZeroAmountConstant;
import com.platform.dto.model.BookingSummaryReport;
import com.platform.dto.model.LMTBookingSummaryReportModel;
import com.platform.resource.CargoErrorList;

public class LMTBookingSummaryReportAction implements Action {
	private static final String      TRACE_ID          = LMTBookingSummaryReportAction.class.getName();

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	 						error 				= null;
		//		Executive										executive			= null;
		CacheManip										cManip				= null;
		String											branchesIds			= null;
		SimpleDateFormat								sdf               	= null;
		Timestamp										fromDate			= null;
		Timestamp										toDate				= null;
		List<BookingSummaryReport>						reports				= null;
		Commodity										commodity			= null;
		SortedMap<String, LMTBookingSummaryReportModel>	dataColl			= null;
		String											corporateIdStr		= null;
		String											partyIdStr			= null;
		Map<Long, CorporateAccount>						partyColl			= null;
		Map<Long, CorporateAccount>						corporateColl		= null;
		Map<Long, VehicleType>							vehicleTypeColl		= null;
		Branch 											branch 				= null;
		Region											region				= null;
		SubRegion subRegion	= null;
		var											isAll				= false;
		ValueObject										configObject = null;
		ArrayList<LocationsMapping> 					locationMappingList	= null;
		var isDefaultRegionAllSelection 	= false;
		var isDefaultSubRegionAllSelection  = false;
		var isDefaultBranchAllSelection 	= false;
		var	isAllowCancelWayBill			= false;
		var	showWeightInKG					= false;
		var	showBranchCodeInReport			= false;
		var	isPhysicalOperationalDataMerge	= false;
		var	useActualWeightInFTLLR			= false;
		var	dataFromDRServer				= false;
		var	regionId	= 0L;
		var	srcBranchId = 0L;
		short	dataTypeId	= 0;
		short	filter		= 0;
		var	vehicleCapacity = 0D;
		var	locationId		= 0L;

		ValueObject						displayDataReportConfig					= null;
		var							isAmountZeroForBookingSummaryReport		= false;
		ValueObject						displayDataConfig						= null;
		ValueObject						valueObjectIn							= null;
		var							isShowAmountZero						= false;
		var							isShowDDDVDetailsSeparately				= false;
		var							isShowQuantity							= false;
		var							showLinkInBrnachColumn					= false;
		HashMap<Long, ExecutiveFeildPermissionDTO>		execFldPermissionsHM	= null;
		var							isSingleDayData							= false;
		Map<String, Map<String, LMTBookingSummaryReportModel>> subRegionBranchWiseHm 	= null;
		var							showBranchesUnderToSubRegionWiseData			= false;
		var								isToSubRegionWiseChecking					= false;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeBookingSummaryReportAction().execute(request, response);

			sdf			= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			fromDate	= new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00.000").getTime());
			toDate		= new Timestamp(sdf.parse(JSPUtility.GetString(request, "toDate") + " 23:59:59.998").getTime());
			cManip		= new CacheManip(request);
			//			executive	= cManip.getExecutive(request);
			dataTypeId	= JSPUtility.GetShort(request, "dataTypeId", (short)0);
			execFldPermissionsHM = cManip.getExecutiveFieldPermission(request);

			final var tbbPartyCheckbox  = request.getParameter("tbbPartyCheckbox");
			var    showTBBPartyData  = false;

			if ("true".equals(tbbPartyCheckbox))
				showTBBPartyData = true;

			final var executive			  = cManip.getExecutive(request);
			final var assignedLocationList = cManip.getAssignedLocationsIdListByLocationIdId(request, srcBranchId, executive.getAccountGroupId());

			ActionStaticUtil.executiveTypeWiseBranches(request, cManip, executive);

			// Get the Selected Combo values
			if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_GROUPADMIN) {
				regionId	= Long.parseLong(request.getParameter("region"));
				srcBranchId = Long.parseLong(request.getParameter("branch"));

				// Get Combo values to restore
				if(regionId <= 0)
					isAll = true;
			} else if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_REGIONADMIN || executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_SUBREGIONADMIN)
				srcBranchId = Long.parseLong(request.getParameter("branch"));
			else
				srcBranchId = executive.getBranchId();

			locationId		    = JSPUtility.GetLong(request, "locationId" ,0);
			request.setAttribute("isAll", isAll);

			locationMappingList = cManip.getAssignedLocationsByLocationIdId(request, srcBranchId, executive.getAccountGroupId());
			request.setAttribute("locationMappingList", locationMappingList);

			configObject						= ReadAllConfigurationsBllImpl.getInstance().getOldReportConfigurationData(ReportIdentifierConstant.BOOKING_SUMMARY_REPORT, executive.getAccountGroupId());
			isDefaultRegionAllSelection 		= configObject.getBoolean(BookingSummaryReportConfigurationDTO.IS_DEFAULT_REGION_ALL_SELCTION, false);
			isDefaultSubRegionAllSelection 		= configObject.getBoolean(BookingSummaryReportConfigurationDTO.IS_DEFAULT_SUBREGION_ALL_SELCTION, false);
			isDefaultBranchAllSelection 		= configObject.getBoolean(BookingSummaryReportConfigurationDTO.IS_DEFAULT_BRANCH_ALL_SELCTION, false);
			isAllowCancelWayBill 				= configObject.getBoolean(BookingSummaryReportConfigurationDTO.IS_ALLOW_CANCEL_WAYBILL, false);
			showWeightInKG		 				= configObject.getBoolean(BookingSummaryReportConfigurationDTO.SHOW_WEIGHT_IN_KG, false);
			isPhysicalOperationalDataMerge		= configObject.getBoolean(BookingSummaryReportConfigurationDTO.IS_PHYSICAL_OPERATIONAL_DATA_MERGE, false);
			isShowQuantity						= configObject.getBoolean(BookingSummaryReportConfigurationDTO.IS_SHOW_QUANTITY, false);
			showLinkInBrnachColumn				= configObject.getBoolean(BookingSummaryReportConfigurationDTO.SHOW_LINK_IN_BRNACH_COLUMN, false);
			useActualWeightInFTLLR				= configObject.getBoolean(BookingSummaryReportConfigurationDTO.USE_ACTUAL_WEIGHT_IN_FTL_LR, false);
			dataFromDRServer				 	= configObject.getBoolean(BookingSummaryReportConfigurationDTO.DATA_FROM_DR_SERVER, false);

			displayDataReportConfig					= PropertyConfigValueBLLImpl.getInstance().getConfiguration(executive, PropertiesFileConstants.REPORT_WISE_DISPLAY_ZERO_AMOUNT_CONSTANT);
			isAmountZeroForBookingSummaryReport		= displayDataReportConfig.getBoolean(ReportWiseDisplayZeroAmountConstant.BOOKING_SUMMARY_REPORT, false);
			displayDataConfig						= cManip.getDisplayDataConfiguration(request, executive.getAccountGroupId());
			showBranchCodeInReport 					= DisplayDataConfigurationBllImpl.getInstance().isDisplayBranchCode(ReportIdentifierConstant.BOOKING_SUMMARY_REPORT, displayDataConfig.getHtData());
			valueObjectIn							= new ValueObject();
			isShowDDDVDetailsSeparately				= configObject.getBoolean(BookingSummaryReportConfigurationDTO.IS_SHOW_DDDV_DETAILS_SEPARATELY, false);
			showBranchesUnderToSubRegionWiseData	= configObject.getBoolean(BookingSummaryReportConfigurationDTO.SHOW_BRANCHES_UNDER_TO_SUBREGION_WISE_DATA, false);

			final var customErrorOnOtherBranchDetailSearch	= configObject.getBoolean(BookingSummaryReportConfigurationDTO.CUSTOM_ERROR_ON_OTHER_BRANCH_DETAIL_SEARCH,false);
			final var allowReportDataSearchForOwnBranchOnly	= configObject.getBoolean(BookingSummaryReportConfigurationDTO.IS_SEARCH_DATA_FOR_OWN_BRANCH_ONLY, false);
			final var isAllowToSearchAllBranchReportData	= execFldPermissionsHM != null && execFldPermissionsHM.containsKey(FeildPermissionsConstant.ALLOW_TO_SEARCH_ALL_BRANCH_REPORT_DATA);
			final var	valObjSelection 					= ActionStaticUtil.reportSelection(request, executive);
			final long	branchId 							= (Long)valObjSelection.get("branchId");

			request.setAttribute("isDefaultRegionAllSelection", isDefaultRegionAllSelection);
			request.setAttribute("isDefaultSubRegionAllSelection", isDefaultSubRegionAllSelection);
			request.setAttribute("isDefaultBranchAllSelection", isDefaultBranchAllSelection);
			request.setAttribute("showLinkInBrnachColumn", showLinkInBrnachColumn);
			request.setAttribute("showBranchesUnderToSubRegionWiseData", showBranchesUnderToSubRegionWiseData);


			request.setAttribute(BookingSummaryReportConfigurationDTO.SHOW_WEIGHT_IN_KG, showWeightInKG);
			request.setAttribute(BookingSummaryReportConfigurationDTO.IS_SHOW_DDDV_DETAILS_SEPARATELY, isShowDDDVDetailsSeparately);
			request.setAttribute(BookingSummaryReportConfigurationDTO.IS_SHOW_QUANTITY, isShowQuantity);
			request.setAttribute(BookingSummaryReportConfigurationDTO.IS_SHOW_FTL_DETAILS_SEPARATELY, configObject.getBoolean(BookingSummaryReportConfigurationDTO.IS_SHOW_FTL_DETAILS_SEPARATELY));
			request.setAttribute(BookingSummaryReportConfigurationDTO.IS_SHOW_TOTAL_DETAILS_SEPARATELY, configObject.getBoolean(BookingSummaryReportConfigurationDTO.IS_SHOW_TOTAL_DETAILS_SEPARATELY));
			request.setAttribute(BookingSummaryReportConfigurationDTO.SHOW_PHONE_PAY_AMOUNT, configObject.getBoolean(BookingSummaryReportConfigurationDTO.SHOW_PHONE_PAY_AMOUNT, false));

			branchesIds = ActionStaticUtil.getBranchIdsWithAssignedLocation1(request, cManip, executive);

			if(showBranchesUnderToSubRegionWiseData && dataTypeId == TransportCommonMaster.DATA_TYPE_TO_SUBREGION_WISE_ID) {
				isToSubRegionWiseChecking = true;
				dataTypeId = TransportCommonMaster.DATA_TYPE_TO_BRANCH_WISE_ID;
			}

			if(dataTypeId != TransportCommonMaster.DATA_TYPE_CLIENT_WISE_ID)
				filter = (short) (locationId == 0 ? 1 : 5);
			else if(locationId == 0)
				filter = 2;
			else
				filter = 6;

			if(isAllowCancelWayBill)
				if(dataTypeId != TransportCommonMaster.DATA_TYPE_CLIENT_WISE_ID)
					filter = (short) (locationId == 0 ? 3 : 7);
				else if(locationId == 0)
					filter = 4;
				else
					filter = 8;

			/*
			if(executive.getIsSuperUser() && executive.getServerIdentifier() == ServerIdentifierConstant.IV_TRANSCARGO_SERVER)
				dataFromDRServer = true;
			 */

			if(DateTimeUtility.compareTwoDates(fromDate, toDate) == 0 || !dataFromDRServer)
				isSingleDayData	= true;


			if(showTBBPartyData)
				reports	 = BookingSummaryReportDAO.getInstance().getBookingSummaryReportTBBPartyData(branchesIds, fromDate, toDate, filter, locationId, isAllowCancelWayBill, isSingleDayData, executive.getServerIdentifier(), executive.getAccountGroupId());
			else
				reports	 = BookingSummaryReportDAO.getInstance().getBookingSummaryReportData(branchesIds, fromDate, toDate, filter, locationId, isAllowCancelWayBill, isSingleDayData, executive.getServerIdentifier(), executive.getAccountGroupId());

			if(!ObjectUtils.isEmpty(reports)){
				if(allowReportDataSearchForOwnBranchOnly && !isAllowToSearchAllBranchReportData)
					reports = ListFilterUtility.filterList(reports, element -> executive.getBranchId() == element.getSourceBranchId()
					|| executive.getBranchId() == element.getDestinationBranchId()
					|| assignedLocationList != null && (assignedLocationList.contains(element.getSourceBranchId()) || assignedLocationList.contains(element.getDestinationBranchId())));

				if(!ObjectUtils.isEmpty(reports)) {
					final var vtForGroup			= cManip.getVehicleTypeForGroup(request, executive.getAccountGroupId());

					if(vtForGroup != null)
						vehicleTypeColl	= Stream.of(vtForGroup).collect(Collectors.toMap(VehicleType::getVehicleTypeId, Function.identity(), (e1, e2) -> e1));

					//------------ Get extra data for CLIENT_WISE type only (start)------------
					if(dataTypeId == TransportCommonMaster.DATA_TYPE_CLIENT_WISE_ID) {
						corporateIdStr	= reports.stream().filter(e -> e.getCorporateAccountId() > 0 && e.getPartyType() == CorporateAccountConstant.PARTY_TYPE_TBB)
								.map(e -> Long.toString(e.getCorporateAccountId())).collect(Collectors.joining(","));

						partyIdStr	= reports.stream().filter(e -> e.getCorporateAccountId() > 0 && e.getPartyType() == CorporateAccountConstant.PARTY_TYPE_GENERAL)
								.map(e -> Long.toString(e.getCorporateAccountId())).collect(Collectors.joining(","));

						if(!StringUtils.isEmpty(corporateIdStr))
							corporateColl = CorporateAccountDao.getInstance().getCorporateAccountDetails(corporateIdStr);

						if(!StringUtils.isEmpty(partyIdStr))
							partyColl = CorporateAccountDao.getInstance().getPartyMasterDetails(partyIdStr);
					}
					//------------ Get extra data for CLIENT_WISE type only (end)------------

					dataColl= new TreeMap<>();
					sdf		= new SimpleDateFormat("dd-MM-yyyy");

					valueObjectIn.put("executive", executive);
					valueObjectIn.put("execFldPermissionsHM", execFldPermissionsHM);

					for (final BookingSummaryReport report2 : reports) {
						vehicleCapacity = 0;

						if(isAmountZeroForBookingSummaryReport) {
							valueObjectIn.put("wayBillTypeId", report2.getWayBillTypeId());
							isShowAmountZero = DisplayDataConfigurationBll.isAllowToDisplayZeroAmount(displayDataConfig, valueObjectIn);
						}

						if(isShowAmountZero)
							report2.setGrandTotal(0);

						//-------------- set charged weight as actual weight in case of DDDV (start) -------------
						if(report2.getBookingTypeId() == BookingTypeConstant.DIRECT_DELIVERY_DIRECT_VASULI_ID)
							report2.setActualWeight(report2.getChargedWeight());

						//-------------- set vehicle capacity as actual weight in case of FTL (start) -------------
						if(!useActualWeightInFTLLR && report2.getBookingTypeId() == BookingTypeConstant.BOOKING_TYPE_FTL_ID
								&& report2.getVehicleTypeId() > 0)
							if(vehicleTypeColl != null && vehicleTypeColl.get(report2.getVehicleTypeId()) != null) {
								vehicleCapacity = vehicleTypeColl.get(report2.getVehicleTypeId()).getCapacity();
								if(report2.getChargedWeight() >= vehicleCapacity)
									report2.setActualWeight(report2.getChargedWeight());
								else
									report2.setActualWeight(vehicleCapacity);
							} else
								report2.setActualWeight(report2.getChargedWeight());

						//-------------- set vehicle capacity as actual weight in case of FTL (start) -------------
						//------------ set necessary data in collection first (start)------------
						if(report2.getCommodityTypeMasterId() > 0)
							commodity = cManip.getCommodityDetails(request, executive.getAccountGroupId(), report2.getCommodityTypeMasterId());

						if(commodity != null)
							report2.setCommodityTypeName(commodity.getName());
						else
							report2.setCommodityTypeName("Other");

						if(report2.getSourceBranchId() > 0){
							var	srcBranch	= cManip.getGenericBranchDetailCache(request, report2.getSourceBranchId());

							if(srcBranch != null) {
								region 		= cManip.getGenericRegionById(request, srcBranch.getRegionId());
								subRegion	= cManip.getGenericSubRegionById(request, srcBranch.getSubRegionId());
							} else {
								srcBranch	= new Branch();
								srcBranch.setName("--");
							}

							report2.setSourceRegion(region != null ? region.getName() : "--");
							report2.setSourceSubRegion(subRegion != null ? subRegion.getName() : "--");

							if(showBranchCodeInReport)
								report2.setSourceBranch(DisplayDataConfigurationBll.getInstance().getBranchName(srcBranch));
							else
								report2.setSourceBranch(srcBranch.getName());
						}

						if(report2.getDestinationBranchId() > 0) {
							var	destBranch	= cManip.getGenericBranchDetailCache(request, report2.getDestinationBranchId());

							if(destBranch != null) {
								region 		= cManip.getGenericRegionById(request, destBranch.getRegionId());
								subRegion	= cManip.getGenericSubRegionById(request, destBranch.getSubRegionId());
							} else {
								destBranch	= new Branch();
								destBranch.setName("--");
							}

							report2.setDestinationRegion(region != null ? region.getName() : "--");
							report2.setDestinationSubRegion(subRegion != null ? subRegion.getName() : "--");

							if(showBranchCodeInReport)
								report2.setDestinationBranch(DisplayDataConfigurationBll.getInstance().getBranchName(destBranch));
							else if(isPhysicalOperationalDataMerge && destBranch.getTypeOfLocation() == Branch.TYPE_OF_LOCATION_OPERATIONAL_PLACE){
								final var	handlingBranch =  cManip.getGenericBranchDetailCache(request, destBranch.getHandlingBranchId());

								if(handlingBranch != null)
									report2.setDestinationBranch(handlingBranch.getName());
								else
									report2.setDestinationBranch(destBranch.getName());
							} else
								report2.setDestinationBranch(destBranch.getName());
						} else
							report2.setDestinationRegion("Other");

						//------------ check for model object in collection (start)------------
						LMTBookingSummaryReportModel report = null;

						switch (dataTypeId) {
						case TransportCommonMaster.DATA_TYPE_BRANCH_WISE_ID -> report = dataColl.get(report2.getSourceBranch());
						case TransportCommonMaster.DATA_TYPE_FROM_SUBREGION_WISE_ID -> report = dataColl.get(report2.getSourceSubRegion());
						case TransportCommonMaster.DATA_TYPE_FROM_REGION_WISE_ID -> report = dataColl.get(report2.getSourceRegion());
						case TransportCommonMaster.DATA_TYPE_DATE_WISE_ID -> report = dataColl.get(sdf.format(report2.getCreationDate()));
						case TransportCommonMaster.DATA_TYPE_TO_REGION_WISE_ID -> {
							if(report2.getDestinationBranchId() > 0)
								report = dataColl.get(report2.getDestinationRegion());
							else
								report = dataColl.get(report2.getDeliveryPlace() + "_");
						}
						case TransportCommonMaster.DATA_TYPE_TO_SUBREGION_WISE_ID -> {
							if(report2.getDestinationBranchId() > 0)
								report = dataColl.get(report2.getDestinationSubRegion());
							else
								report = dataColl.get(report2.getDeliveryPlace() + "_");
						}
						case TransportCommonMaster.DATA_TYPE_TO_BRANCH_WISE_ID -> {
							if(report2.getDestinationBranchId() > 0)
								report = dataColl.get(report2.getDestinationBranch());
							else
								report = dataColl.get(report2.getDeliveryPlace() + "_");
						}
						case TransportCommonMaster.DATA_TYPE_CLIENT_WISE_ID -> {
							if(report2.getCorporateAccountId() > 0 && report2.getPartyType()==CorporateAccount.PARTY_TYPE_TBB) {
								if(corporateColl != null && corporateColl.get(report2.getCorporateAccountId()) != null)
									report2.setCustomerName(corporateColl.get(report2.getCorporateAccountId()).getName());
								report = dataColl.get("3_" + report2.getCustomerName());
							} else if(report2.getCorporateAccountId() > 0 && report2.getPartyType()==CorporateAccount.PARTY_TYPE_GENERAL) {
								if(partyColl != null && partyColl.get(report2.getCorporateAccountId()) != null)
									report2.setCustomerName(partyColl.get(report2.getCorporateAccountId()).getName());
								report = dataColl.get("2_" + report2.getCustomerName() + "_" + report2.getSourceBranchId());
							} else {
								report2.setCustomerName("General");
								report = dataColl.get("1_" + report2.getCustomerName());
							}
						}
						case TransportCommonMaster.DATA_TYPE_COMMODITY_WISE_ID -> report = dataColl.get(""+report2.getCommodityTypeName());
						default -> {
							branch = cManip.getGenericBranchDetailCache(request, report2.getSourceBranchId());
							region = cManip.getGenericRegionById(request, branch.getRegionId());
							report = dataColl.get(region.getName() + "_" + region.getRegionId());
						}
						}

						if(report == null) {
							report = new LMTBookingSummaryReportModel();

							if(showLinkInBrnachColumn && dataTypeId == TransportCommonMaster.DATA_TYPE_BRANCH_WISE_ID) {
								report.setKeyValue(report2.getSourceBranch());
								report.setKeyValue(report2.getSourceBranch());
								report.setRegionId(report2.getSourceRegionId());
								report.setSubRegionid(report2.getSourceSubRegionId());
								report.setBranchId(report2.getSourceBranchId());
							} else
								switch (dataTypeId) {
								case TransportCommonMaster.DATA_TYPE_BRANCH_WISE_ID -> report.setKeyValue(report2.getSourceBranch());
								case TransportCommonMaster.DATA_TYPE_FROM_SUBREGION_WISE_ID -> report.setKeyValue(report2.getSourceSubRegion());
								case TransportCommonMaster.DATA_TYPE_FROM_REGION_WISE_ID -> report.setKeyValue(report2.getSourceRegion());
								case TransportCommonMaster.DATA_TYPE_DATE_WISE_ID -> report.setKeyValue(sdf.format(report2.getCreationDate()));
								case TransportCommonMaster.DATA_TYPE_TO_REGION_WISE_ID -> {
									if(report2.getDestinationBranchId() > 0)
										report.setKeyValue(report2.getDestinationRegion());
									else
										report.setKeyValue(report2.getDeliveryPlace() + " [D]");
								}
								case TransportCommonMaster.DATA_TYPE_TO_SUBREGION_WISE_ID -> {
									if(report2.getDestinationBranchId() > 0)
										report.setKeyValue(report2.getDestinationSubRegion());
									else
										report.setKeyValue(report2.getDeliveryPlace() + " [D]");
								}
								case TransportCommonMaster.DATA_TYPE_TO_BRANCH_WISE_ID -> {
									if(report2.getDestinationBranchId() > 0) {
										report.setKeyValue(report2.getDestinationBranch());
										report.setDestinationSubRegion(report2.getDestinationSubRegion());
									} else
										report.setKeyValue(report2.getDeliveryPlace() + " [D]");
								} case TransportCommonMaster.DATA_TYPE_CLIENT_WISE_ID -> {
									if(report2.getCorporateAccountId() > 0 && report2.getPartyType()==CorporateAccount.PARTY_TYPE_TBB)
										report.setKeyValue(report2.getCustomerName() + " [C]");
									else if(report2.getCorporateAccountId() > 0 && report2.getPartyType()==CorporateAccount.PARTY_TYPE_GENERAL)
										report.setKeyValue(report2.getCustomerName() + " [P]");
									else
										report.setKeyValue(report2.getCustomerName());
								}
								case TransportCommonMaster.DATA_TYPE_COMMODITY_WISE_ID -> report.setKeyValue(report2.getCommodityTypeName());
								default -> report.setKeyValue(region.getName() + "_" + region.getRegionId());
								}

							if(report2.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_BOOKED)
								setData(report2, report, isShowDDDVDetailsSeparately);

							//------------ add model object in collection (start)------------
							switch (dataTypeId) {
							case TransportCommonMaster.DATA_TYPE_BRANCH_WISE_ID -> dataColl.put(report2.getSourceBranch(), report);
							case TransportCommonMaster.DATA_TYPE_FROM_SUBREGION_WISE_ID -> dataColl.put(report2.getSourceSubRegion(), report);
							case TransportCommonMaster.DATA_TYPE_FROM_REGION_WISE_ID -> dataColl.put(report2.getSourceRegion(), report);
							case TransportCommonMaster.DATA_TYPE_DATE_WISE_ID -> dataColl.put(""+sdf.format(report2.getCreationDate()), report);
							case TransportCommonMaster.DATA_TYPE_TO_REGION_WISE_ID -> {
								if(report2.getDestinationBranchId() > 0)
									dataColl.put(report2.getDestinationRegion(), report);
								else
									dataColl.put(report2.getDeliveryPlace() + "_", report);
							}
							case TransportCommonMaster.DATA_TYPE_TO_SUBREGION_WISE_ID -> {
								if(report2.getDestinationBranchId() > 0)
									dataColl.put(report2.getDestinationSubRegion(), report);
								else
									dataColl.put(report2.getDeliveryPlace() + "_", report);
							}
							case TransportCommonMaster.DATA_TYPE_TO_BRANCH_WISE_ID -> {
								if(report2.getDestinationBranchId() > 0)
									dataColl.put(report2.getDestinationBranch(), report);
								else
									dataColl.put(report2.getDeliveryPlace() + "_", report);
							}
							case TransportCommonMaster.DATA_TYPE_CLIENT_WISE_ID -> {
								if(report2.getCorporateAccountId() > 0 && report2.getPartyType() == CorporateAccountConstant.PARTY_TYPE_TBB)
									dataColl.put("3_" + report2.getCustomerName(), report);
								else if(report2.getCorporateAccountId() > 0 && report2.getPartyType() == CorporateAccountConstant.PARTY_TYPE_GENERAL)
									dataColl.put("2_" + report2.getCustomerName() + "_" + report2.getSourceBranchId(), report);
								else
									dataColl.put("1_" + report2.getCustomerName(), report);
							}
							case TransportCommonMaster.DATA_TYPE_COMMODITY_WISE_ID -> dataColl.put(report2.getCommodityTypeName(), report);
							default -> dataColl.put(region.getName() + "_" + region.getRegionId(), report);
							}

						} else if(report2.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_BOOKED)
							setData(report2, report, isShowDDDVDetailsSeparately);

						if(report2.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CANCELLED)
							setCancelData(report2, report, isShowDDDVDetailsSeparately);
					}

					if(showBranchesUnderToSubRegionWiseData && isToSubRegionWiseChecking)
						subRegionBranchWiseHm = dataColl.entrySet().stream().collect(Collectors.groupingBy(
								entry -> entry.getValue().getDestinationSubRegion(), TreeMap::new,
								Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue, (a, b) -> b, TreeMap::new)));

					if(dataColl != null && dataColl.size() > 0) {
						request.setAttribute("BookingSummaryReport", dataColl);
						request.setAttribute("subRegionBranchWiseHm", subRegionBranchWiseHm);
					}else {
						error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
						error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
						request.setAttribute("cargoError", error);
					}
				} else {
					if (customErrorOnOtherBranchDetailSearch) {
						error.put("errorCode", CargoErrorList.OTHER_BRANCH_REPORT_DATA_SEARCH_ERROR);
						if (branchId > 0)
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

			ActionStaticUtil.setRequestAttribute(request,"customAddressBranchId", srcBranchId);
			ActionStaticUtil.setRequestAttribute(request,"customAddressIdentifer", CustomGroupMapper.IDENTIFIER_BOOKING);
			ActionStaticUtil.setReportViewModel(request);
			request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}
	}

	public void setData(final BookingSummaryReport reports, final LMTBookingSummaryReportModel report, final boolean isShowDDDVDetailsSeparately) throws Exception {
		try {
			if(reports.getBookingTypeId() == BookingTypeConstant.BOOKING_TYPE_SUNDRY_ID) {
				report.setTotalSundryLR(report.getTotalSundryLR() + 1);
				report.setTotalSundryActualWeight(report.getTotalSundryActualWeight() + reports.getActualWeight());
				report.setTotalSundryFreight(report.getTotalSundryFreight() + reports.getGrandTotal());
				report.setCartageCharge(report.getCartageCharge() + reports.getCartageCharge());

				if(reports.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID)
					report.setTotalSundryPaidFreight(report.getTotalSundryPaidFreight() + reports.getGrandTotal());
				else if(reports.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY)
					report.setTotalSundryToPayFreight(report.getTotalSundryToPayFreight() + reports.getGrandTotal());
				else
					report.setTotalSundryCreditFreight(report.getTotalSundryCreditFreight() + reports.getGrandTotal());

				report.setTotalSundryQuantity(report.getTotalSundryQuantity() + reports.getQuantity());
			} else if(isShowDDDVDetailsSeparately && reports.getBookingTypeId() == BookingTypeConstant.DIRECT_DELIVERY_DIRECT_VASULI_ID){

				report.setTotalDDDVLR(report.getTotalDDDVLR() + 1);
				report.setTotalDDDVActualWeight(report.getTotalDDDVActualWeight() + reports.getActualWeight());
				report.setTotalDDDVFreight(report.getTotalDDDVFreight() + reports.getGrandTotal());

				if(reports.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID)
					report.setTotalDDDVPaidFreight(report.getTotalDDDVPaidFreight() + reports.getGrandTotal());
				else if(reports.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY)
					report.setTotalDDDVToPayFreight(report.getTotalDDDVToPayFreight() + reports.getGrandTotal());
				else
					report.setTotalDDDVCreditFreight(report.getTotalDDDVCreditFreight() + reports.getGrandTotal());

				report.setTotalDDDVQuantity(report.getTotalDDDVQuantity() + reports.getQuantity());
			} else {
				report.setTotalFTLLR(report.getTotalFTLLR() + 1);
				report.setTotalFTLActualWeight(report.getTotalFTLActualWeight() + reports.getActualWeight());
				report.setTotalFTLFreight(report.getTotalFTLFreight() + reports.getGrandTotal());

				if(reports.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID)
					report.setTotalFTLPaidFreight(report.getTotalFTLPaidFreight() + reports.getGrandTotal());
				else if(reports.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY)
					report.setTotalFTLToPayFreight(report.getTotalFTLToPayFreight() + reports.getGrandTotal());
				else
					report.setTotalFTLCreditFreight(report.getTotalFTLCreditFreight() + reports.getGrandTotal());

				report.setTotalFTLQuantity(report.getTotalFTLQuantity() + reports.getQuantity());
			}

			if(reports.getPaymentType() == PaymentTypeConstant.PAYMENT_TYPE_PHONE_PAY_ID)
				report.setPhonePayAmount(report.getPhonePayAmount() + reports.getGrandTotal());
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public void setCancelData(final BookingSummaryReport reports, final LMTBookingSummaryReportModel report, final boolean isShowDDDVDetailsSeparately) throws Exception {
		try {
			if(reports.getBookingTypeId() == BookingTypeConstant.BOOKING_TYPE_SUNDRY_ID) {
				report.setTotalSundryLR(report.getTotalSundryLR() - 1);
				report.setTotalSundryActualWeight(report.getTotalSundryActualWeight() - reports.getActualWeight());
				report.setTotalSundryFreight(report.getTotalSundryFreight() - reports.getGrandTotal());
				report.setCartageCharge(report.getCartageCharge() - reports.getCartageCharge());

				if(reports.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID)
					report.setTotalSundryPaidFreight(report.getTotalSundryPaidFreight() - reports.getGrandTotal());
				else if(reports.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY)
					report.setTotalSundryToPayFreight(report.getTotalSundryToPayFreight() - reports.getGrandTotal());
				else
					report.setTotalSundryCreditFreight(report.getTotalSundryCreditFreight() - reports.getGrandTotal());

				report.setTotalSundryQuantity(report.getTotalSundryQuantity() - reports.getQuantity());
			} else if(isShowDDDVDetailsSeparately && reports.getBookingTypeId() == BookingTypeConstant.DIRECT_DELIVERY_DIRECT_VASULI_ID){
				report.setTotalDDDVLR(report.getTotalDDDVLR() - 1);
				report.setTotalDDDVActualWeight(report.getTotalDDDVActualWeight() - reports.getActualWeight());
				report.setTotalDDDVFreight(report.getTotalDDDVFreight() - reports.getGrandTotal());

				if(reports.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID)
					report.setTotalDDDVPaidFreight(report.getTotalDDDVPaidFreight() - reports.getGrandTotal());
				else if(reports.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY)
					report.setTotalDDDVToPayFreight(report.getTotalDDDVToPayFreight() - reports.getGrandTotal());
				else
					report.setTotalDDDVCreditFreight(report.getTotalDDDVCreditFreight() - reports.getGrandTotal());

				report.setTotalDDDVQuantity(report.getTotalDDDVQuantity() - reports.getQuantity());
			} else {
				report.setTotalFTLLR(report.getTotalFTLLR() - 1);
				report.setTotalFTLActualWeight(report.getTotalFTLActualWeight() - reports.getActualWeight());
				report.setTotalFTLFreight(report.getTotalFTLFreight() - reports.getGrandTotal());

				if(reports.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID)
					report.setTotalFTLPaidFreight(report.getTotalFTLPaidFreight() - reports.getGrandTotal());
				else if(reports.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY)
					report.setTotalFTLToPayFreight(report.getTotalFTLToPayFreight() - reports.getGrandTotal());
				else
					report.setTotalFTLCreditFreight(report.getTotalFTLCreditFreight() - reports.getGrandTotal());

				report.setTotalFTLQuantity(report.getTotalFTLQuantity() - reports.getQuantity());
			}

			if(reports.getPaymentType() == PaymentTypeConstant.PAYMENT_TYPE_PHONE_PAY_ID)
				report.setPhonePayAmount(report.getPhonePayAmount() - reports.getGrandTotal());
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}
}