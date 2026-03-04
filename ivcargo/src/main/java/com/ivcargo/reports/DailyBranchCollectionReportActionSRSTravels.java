package com.ivcargo.reports;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.displaydata.DisplayDataConfigurationBll;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.dao.impl.TDSForGroupDaoImpl;
import com.iv.dto.constant.CargoAccountGroupConstant;
import com.iv.dto.constant.ExecutiveTypeConstant;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.dto.tds.TDSForGroup;
import com.iv.logsapp.LogWriter;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.constant.AccountGroupConstant;
import com.iv.utils.constant.Constant;
import com.iv.utils.constant.DateTimeFormatConstant;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.utility.CollectionUtility;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.BranchCommissionDao;
import com.platform.dao.BranchExpenseDao;
import com.platform.dao.ChargeTypeMasterDao;
import com.platform.dao.ConfigDoorDeliveryDao;
import com.platform.dao.WayBillDeliveryChargesDao;
import com.platform.dao.reports.DailyBranchCollectionDAO;
import com.platform.dao.reports.WayBillDetailsDAO;
import com.platform.dto.AliasNameConstants;
import com.platform.dto.Branch;
import com.platform.dto.ChargeTypeMaster;
import com.platform.dto.ConfigParam;
import com.platform.dto.Executive;
import com.platform.dto.WayBill;
import com.platform.dto.WayBillCharges;
import com.platform.dto.WayBillTaxTxn;
import com.platform.dto.WayBillType;
import com.platform.dto.configuration.master.DisplayDataConfigurationDTO;
import com.platform.dto.configuration.report.collection.DailyBranchCollectionReportConfigurationDTO;
import com.platform.dto.constant.PaymentTypeConstant;
import com.platform.dto.constant.WayBillStatusConstant;
import com.platform.dto.constant.WayBillTypeConstant;
import com.platform.dto.model.AdditionalChargesModel;
import com.platform.dto.model.ChargeTypeModel;
import com.platform.dto.model.CityWiseCollectionModel;
import com.platform.dto.model.DailyBranchCollectionReportModel;
import com.platform.dto.model.ReportViewModel;
import com.platform.dto.model.WayBillCategoryTypeDetails;
import com.platform.dto.model.WayBillDeatailsModel;
import com.platform.dto.model.WayBillExpenseModel;
import com.platform.resource.CargoErrorList;
import com.platform.utils.PropertiesUtility;
import com.platform.utils.Utility;

public class DailyBranchCollectionReportActionSRSTravels implements Action {

	@Override
	@SuppressWarnings("unchecked")
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>								error 														= null;
		Executive											executive													= null;
		SimpleDateFormat									sdf															= null;
		Timestamp											fromDate													= null;
		Timestamp											toDate														= null;
		Branch[]											branches													= null;
		CacheManip											cache														= null;
		ValueObject											objectIn													= null;
		ValueObject											objectOut													= null;
		Long[]												wayBillIdArray												= null;
		ReportViewModel										reportViewModel												= null;
		ArrayList<Long>						 				paidChargeColumns											= null;
		ArrayList<Long>										cancellationChargeColumns									= null;
		WayBillExpenseModel[]								wayBillExpenseModel											= null;
		ArrayList<Long>										deliveryChargeColumns										= null;
		ArrayList<Long>										creditDeliveryChargeColumns									= null;
		ArrayList<Long>										focChargeColumns											= null;
		ArrayList<Long>										focManualChargeColumns										= null;
		ArrayList<Long>										toPayChargeColumns											= null;
		ArrayList<Long>										creditorChargeColumns										= null;
		ArrayList<Long>										paidManualChargeColumns										= null;
		ArrayList<Long>										toPayManualChargeColumns									= null;
		ArrayList<Long>										creditorManualChargeColumns									= null;
		ArrayList<Long>										dueDeliverChargeColumns										= null;
		ArrayList<Long>										deliveredWayBills											= null;
		ArrayList<Long>										cancelledWayBills											= null;
		HashMap<Long,Double>								paidLoading													= null;
		HashMap<Long,Double>								totalChargesAmount											= null;
		HashMap<Long,Object>								storeCityWiseToPayeeDetails									= null;
		HashMap<Long,Object>								cityWiseToPayeeDetails										= null;
		CityWiseCollectionModel								cityWiseCollectionModel										= null;
		WayBillType											wayBillType													= null;
		WayBillCharges[]									wayBillCharges												= null;
		AdditionalChargesModel								additionalCharges											= null;
		WayBillTaxTxn[]										wayBillTax													= null;
		HashMap<Long,Double>								chargesCollection											= null;
		ChargeTypeModel[]									bookingCharges												= null;
		ChargeTypeModel[]									deliveryCharges												= null;
		Branch												branch														= null;
		HashMap<String,Double>								bookedWayBillCategoryTypeDetails							= null;
		WayBillCategoryTypeDetails							wayBillCategoryTypeDetails									= null;
		WayBillCategoryTypeDetails							wbCategoryTypeDetailsForDlvrd								= null;
		DailyBranchCollectionReportModel[]					reportModel													= null;
		HashMap<Long, DailyBranchCollectionReportModel>		booking														= null;
		HashMap<Long, DailyBranchCollectionReportModel>		cancellation												= null;
		HashMap<Long, DailyBranchCollectionReportModel>		deliveryCancellation										= null;
		HashMap<Long, DailyBranchCollectionReportModel>		delivery													= null;
		HashMap<Long, DailyBranchCollectionReportModel>		creditDelivery												= null;
		HashMap<Long, DailyBranchCollectionReportModel>		FOC															= null;
		HashMap<Long, DailyBranchCollectionReportModel>		FOCManual													= null;
		HashMap<Long, DailyBranchCollectionReportModel>		toPayeeBooking												= null;
		HashMap<Long, DailyBranchCollectionReportModel>		creditorBooking												= null;
		HashMap<Long, DailyBranchCollectionReportModel>		bookingManual												= null;
		HashMap<Long, DailyBranchCollectionReportModel>		toPayeeBookingManual										= null;
		HashMap<Long, DailyBranchCollectionReportModel>		creditorBookingManual										= null;
		HashMap<Long, DailyBranchCollectionReportModel>		deuDeliver													= null;
		HashMap<String, ArrayList<Long>>					chargeColumns												= null;
		HashMap<Long, AdditionalChargesModel>	 			storeExtraCharges											= null;
		HashMap<String, WayBillCategoryTypeDetails>			wbCategoryTypeDetails 										= null;
		HashMap<String, WayBillCategoryTypeDetails>			deliveredWayBillDetails										= null;
		HashMap<Long, CityWiseCollectionModel>				cityWiseDetails												= null;
		HashMap<Long, WayBillDeatailsModel>					wayBillDetails												= null;
		Long[]												wayBillIdsForGroupSharingChargesArr							= null;
		String												wayBillIdsForGroupSharingCharges							= null;
		HashMap<Long, Double> 								groupSharingChargesMap										= null;
		Timestamp											createDate													= null;
		ValueObject											displayDataConfig											= null;
		ValueObject											valueObjectIn												= null;
		ValueObject											configuration												= null;
		var												isDonotShowWayBillTypeWiseData								= false;
		var 											doNotShow_Disc 												= false; // if any disc found then column will be generated for disc in report
		var 											doNotShowDelivery_Disc 										= false; // if any delivery disc found then column will be generated for delivery disc in report
		var 											doNotShow_Tax 												= false;  // if any tax found then column will be generated for tax in report
		var 											doNotShow_Commission 										= false; // if any commission found then column will be generated for commission in report
		var												showBookingFreightAmount									= false;
		var 												paidLoadingTotalAmt 										= 0.00;
		var 												totalBookingGrandAmount 									= 0D;
		var 												totalCancellationGrandAmount 								= 0D;
		var 												totalDeliverGrandAmount 									= 0D;
		var 												toPayCommissionToBeLess 									= 0D;
		var 												totalDeliverOctroiAmount 									= 0D;
		var 												totalDeliverOtherAmount 									= 0D;
		var												showBookingCommissionColumn									= false;
		var												showDeliveryCommissionColumn								= false;
		ValueObject											objectOutVal												= null;
		HashMap<Short, Double> 								branchCommisionHM											= null;
		Branch												branchObj													= null;
		var 											isAgentBranch												= false;
		var												showBookingDeliveryCommissionRate							= false;
		var												isBranchWiseBookingCommissionCalculationAllowed				= false;
		var												isBranchWiseDeliveryCommissionCalculationAllowed			= false;
		var												calculateBookingCommission									= true;
		var												calculateDeliveryCommission									= true;
		var												showTotalNoOfArticlesColumn									= false;
		var 												totalBookingChequeTotal 									= 0D;
		var 												totalDeliveryChequeTotal 									= 0D;
		var												showCashCollectionInReport									= false;
		var												showCreditDetailsColumn										= false;
		var 												totalDeliveryBillCreditTotal 								= 0D;
		var 												totalDeliverBillCreditOctroiAmount							= 0D;
		var 												totalDeliverBillCreditOtherAmount							= 0D;
		var												showDeliveryLRAtDestination									= false;
		short										filter														= 0;
		HashMap<Long, WayBillDeatailsModel>					wayBillDlyDetails									= null;
		WayBillTaxTxn[]										wayBillDlyTax										= null;
		var											calculateTdsOnFinancialYear									= false;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeDailyBranchCollectionReportAction().execute(request, response);

			sdf						= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			fromDate				= new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00").getTime());
			toDate					= new Timestamp(sdf.parse(JSPUtility.GetString(request, "toDate") + " 23:59:59").getTime());
			createDate 				= new Timestamp(new Date().getTime());
			var selectedCity      	= 0L;
			final var destinationCityId 	= JSPUtility.GetLong(request, "TosubRegion",0);

			cache 			= new CacheManip(request);
			executive		= cache.getExecutive(request);

			// Get the Selected  Combo values
			if(request.getParameter("subRegion") != null)
				selectedCity  =  Long.parseLong(JSPUtility.GetString(request, "subRegion")) ;

			configuration					= ReadAllConfigurationsBllImpl.getInstance().getOldReportConfigurationData(ReportIdentifierConstant.DAILY_BRANCH_COLLECTION_REPORT, executive.getAccountGroupId());

			showBookingFreightAmount 		= configuration.getBoolean(DailyBranchCollectionReportConfigurationDTO.SHOW_BOOKING_FREIGHT_AMOUNT);
			showBookingCommissionColumn		= PropertiesUtility.isAllow(configuration.getString(DailyBranchCollectionReportConfigurationDTO.SHOW_BOOKING_COMMISSION_COLUMN,"false"));
			showDeliveryCommissionColumn	= PropertiesUtility.isAllow(configuration.getString(DailyBranchCollectionReportConfigurationDTO.SHOW_DELIVERY_COMMISSION_COLUMN,"false"));
			showBookingDeliveryCommissionRate	= PropertiesUtility.isAllow(configuration.getString(DailyBranchCollectionReportConfigurationDTO.SHOW_BOOKING_DELIVERY_COMMISSION_RATE,"false"));
			showCreditDetailsColumn			= configuration.getBoolean(DailyBranchCollectionReportConfigurationDTO.SHOW_CREDIT_DETAILS_COLUMN,false);
			request.setAttribute("showBookingCommissionColumn", showBookingCommissionColumn);
			request.setAttribute("showDeliveryCommissionColumn", showDeliveryCommissionColumn);
			request.setAttribute("showBookingDeliveryCommissionRate", showBookingDeliveryCommissionRate);
			request.setAttribute("showCreditDetailsColumn", showCreditDetailsColumn);

			isBranchWiseBookingCommissionCalculationAllowed	 = configuration.getBoolean(DailyBranchCollectionReportConfigurationDTO.IS_BRANCH_WISE_BOOKING_COMMISSION_CALCULATION_ALLOWED,false);
			isBranchWiseDeliveryCommissionCalculationAllowed = configuration.getBoolean(DailyBranchCollectionReportConfigurationDTO.IS_BRANCH_WISE_DELIVERY_COMMISSION_CALCULATION_ALLOWED, false);
			showTotalNoOfArticlesColumn 		= configuration.getBoolean(DailyBranchCollectionReportConfigurationDTO.SHOW_TOTAL_NO_OF_ARTICLES_COLUMN, false);

			showCashCollectionInReport			= configuration.getBoolean(DailyBranchCollectionReportConfigurationDTO.SHOW_CASH_COLLECTION_IN_REPORT,false);
			calculateTdsOnFinancialYear			= configuration.getBoolean(DailyBranchCollectionReportConfigurationDTO.CALCULATE_TDS_ON_FINANCIAL_YEAR, false);

			//Get all Branches
			branches 	= cache.getBranchesArrayBySubRegionId(request, executive.getAccountGroupId(), selectedCity);
			request.setAttribute("branches", branches);
			request.setAttribute("showBookingFreightAmount", showBookingFreightAmount);
			request.setAttribute("showTotalNoOfArticlesColumn", showTotalNoOfArticlesColumn);

			// Get All Executives

			var branchId = 0L;
			objectIn	= new ValueObject();
			objectOut	= new ValueObject();
			objectOutVal = new ValueObject();

			if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_EXECUTIVE || executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_BRANCHADMIN
					|| executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_LIMITED
					|| executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_REGIONADMIN || executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_SUBREGIONADMIN)
				branchId = executive.getBranchId();
			else if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN)
				branchId = Long.parseLong(request.getParameter("branch"));

			if(isBranchWiseBookingCommissionCalculationAllowed) {
				final var	bookingBranchIdList			= CollectionUtility.getLongListFromString(configuration.getString(DailyBranchCollectionReportConfigurationDTO.BOOKING_BRANCH_IDS_TO_AVOID_COMMISSION_CALCULATION));

				if(bookingBranchIdList.contains(branchId))
					calculateBookingCommission		= false;
			}

			if(isBranchWiseDeliveryCommissionCalculationAllowed) {
				final var deliveryBranchIdList			= CollectionUtility.getLongListFromString(configuration.getString(DailyBranchCollectionReportConfigurationDTO.DELIVERY_BRANCH_IDS_TO_AVOID_COMMISSION_CALCULATION));

				if(deliveryBranchIdList.contains(branchId))
					calculateDeliveryCommission		= false;
			}

			final var	branchWiseShowCommissionTable	= configuration.getBoolean(DailyBranchCollectionReportConfigurationDTO.BRANCH_WISE_SHOW_COMMISSION_TABLE, false);

			final var	showCommissionTable	= branchWiseShowCommissionTable && CollectionUtility.getLongListFromString(configuration.getString(DailyBranchCollectionReportConfigurationDTO.BRANCH_IDS_TO_SHOW_COMMISSION_TABLE, "0")).contains(branchId);

			request.setAttribute("calculateBookingCommission", calculateBookingCommission);
			request.setAttribute("calculateDeliveryCommission", calculateDeliveryCommission);
			request.setAttribute("showCommissionTable", showCommissionTable);

			objectIn.put("fromDate", fromDate);
			objectIn.put("toDate", toDate);
			objectIn.put("branchId", branchId);
			objectIn.put("accountGroupId", executive.getAccountGroupId());
			objectIn.put("filter", 0);
			objectIn.put("destinationCityId", destinationCityId);

			final var	tdsForGroup = new TDSForGroup();
			tdsForGroup.setAccountGroupId(executive.getAccountGroupId());
			tdsForGroup.setValidFrom(fromDate);
			tdsForGroup.setValidTill(toDate);

			var	tdsForGroupList  = TDSForGroupDaoImpl.getInstance().getTdsForGroup(tdsForGroup, filter);

			if(!calculateTdsOnFinancialYear) {
				filter = 1;
				final var	tdsForGroupList1 = TDSForGroupDaoImpl.getInstance().getTdsForGroup(tdsForGroup, filter);

				if (tdsForGroupList1 != null)
					if(tdsForGroupList != null)
						tdsForGroupList.addAll(tdsForGroupList1);
					else
						tdsForGroupList = new ArrayList<>(tdsForGroupList1);
			}

			Map<String, Double> dateWiseTDSHM	= new HashMap<>();
			final Map<Double, Double> rateWiseTDSHM	= new HashMap<>();

			if(tdsForGroupList != null && calculateTdsOnFinancialYear)
				dateWiseTDSHM	= tdsForGroupList.stream().collect(Collectors.toMap(TDSForGroup::getValidFromToDate, TDSForGroup::getTdsRate, (e1, e2) -> e1, HashMap::new));

			request.setAttribute("tdsForGroupList", tdsForGroupList);

			if(destinationCityId == 0)
				objectOut= DailyBranchCollectionDAO.getInstance().getReportForBranch(objectIn);
			else
				objectOut= DailyBranchCollectionDAO.getInstance().getReportDestinationWise(objectIn);

			branchObj = cache.getBranchById(request, executive.getAccountGroupId(), branchId);

			if(branchObj.isAgentBranch() && showBookingDeliveryCommissionRate){
				isAgentBranch = true;

				objectOutVal = BranchCommissionDao.getInstance().getBranchCommissionRate(objectIn);
				branchCommisionHM		=  (HashMap<Short, Double>) objectOutVal.get("resultList");
				request.setAttribute("branchCommisionHM", branchCommisionHM);
				request.setAttribute("tdsAmount", branchObj.getTdsAmount());

			}

			request.setAttribute("isAgentBranch", isAgentBranch);
			reportModel		= (DailyBranchCollectionReportModel[]) objectOut.get("DailyBranchCollectionReportModel");
			wayBillIdArray	= (Long[]) objectOut.get("WayBillIdArray");

			if(objectOut.get("WayBillExpenseModel") != null) {
				wayBillExpenseModel = (WayBillExpenseModel[]) objectOut.get("WayBillExpenseModel");
				request.setAttribute("WayBillExpenseModel", wayBillExpenseModel);
			}

			reportViewModel = new ReportViewModel();
			reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);

			request.setAttribute("ReportViewModel", reportViewModel);

			booking						= new LinkedHashMap<>();
			paidChargeColumns			= new ArrayList<>();
			cancellation				= new LinkedHashMap<>();
			deliveryCancellation		= new LinkedHashMap<>();
			cancellationChargeColumns	= new ArrayList<>();
			delivery					= new LinkedHashMap<>();
			deliveryChargeColumns		= new ArrayList<>();
			creditDelivery				= new LinkedHashMap<>();
			creditDeliveryChargeColumns	= new ArrayList<>();
			FOC							= new LinkedHashMap<>();
			focChargeColumns			= new ArrayList<>();
			FOCManual					= new LinkedHashMap<>();
			focManualChargeColumns		= new ArrayList<>();
			toPayeeBooking				= new LinkedHashMap<>();
			toPayChargeColumns			= new ArrayList<>();
			creditorBooking				= new LinkedHashMap<>();
			creditorChargeColumns		= new ArrayList<>();
			bookingManual				= new LinkedHashMap<>();
			paidManualChargeColumns		= new ArrayList<>();
			toPayeeBookingManual		= new LinkedHashMap<>();
			toPayManualChargeColumns	= new ArrayList<>();
			creditorBookingManual		= new LinkedHashMap<>();
			creditorManualChargeColumns	= new ArrayList<>();
			deuDeliver					= new LinkedHashMap<>();
			dueDeliverChargeColumns		= new ArrayList<>();
			chargeColumns				= new LinkedHashMap<>();
			storeExtraCharges			= new LinkedHashMap<>();
			paidLoading					= new LinkedHashMap<>();
			deliveredWayBills			= new ArrayList<>();
			cancelledWayBills			= new ArrayList<>();
			totalChargesAmount			= new HashMap<>();
			wbCategoryTypeDetails		= new HashMap<>();
			deliveredWayBillDetails		= new HashMap<>();

			//City Wise ToPayee Details code
			storeCityWiseToPayeeDetails = new LinkedHashMap<>();
			//City Wise ToPayee Details code

			cityWiseDetails	= new LinkedHashMap<>();

			if(reportModel != null && wayBillIdArray != null) {
				//Condition For Group Sharing Charges. SRS should Not see Receipt Charge Of Southern
				wayBillIdsForGroupSharingChargesArr = (Long[])objectOut.get("wayBillIdsForGroupSharingChargesArr");

				if(wayBillIdsForGroupSharingChargesArr != null){
					wayBillIdsForGroupSharingCharges 	= Utility.GetLongArrayToString(wayBillIdsForGroupSharingChargesArr);
					groupSharingChargesMap 				= WayBillDeliveryChargesDao.getInstance().getWayBillChargeMapByWayBillIdsAndChargeMasterId(wayBillIdsForGroupSharingCharges,ChargeTypeMaster.RECEIPT);
				}

				//Door Delivery Configuration Check
				final var isConfigDoorDelivery = ConfigDoorDeliveryDao.getInstance().getDoorDeliveryConfig(executive.getAccountGroupId(),executive.getAgencyId(),executive.getBranchId());
				request.setAttribute("isConfigDoorDelivery", isConfigDoorDelivery);

				//Get WayBill Details code ( Start )
				final var	showDeliveryTax	= configuration.getBoolean(DailyBranchCollectionReportConfigurationDTO.SHOW_DELIVERY_TAX, false);

				wayBillDetails = WayBillDetailsDAO.getInstance().getWayBillDetails(wayBillIdArray, true, ChargeTypeMaster.WAYBILL_CHARGETYPE_BOTH, true, WayBillTaxTxn.WAYBILL_TAX_TXN_TYPE_BOOKING, false);

				if(showDeliveryTax)
					wayBillDlyDetails = WayBillDetailsDAO.getInstance().getWayBillDetails(wayBillIdArray, true, ChargeTypeMaster.WAYBILL_CHARGETYPE_BOTH, true, WayBillTaxTxn.WAYBILL_TAX_TXN_TYPE_DELIVERY, false);

				displayDataConfig						= cache.getDisplayDataConfiguration(request, executive.getAccountGroupId());
				isDonotShowWayBillTypeWiseData			= PropertiesUtility.isAllow(displayDataConfig.getString(DisplayDataConfigurationDTO.IS_DONOT_SHOW_WAY_BILL_TYPE_WISE_DATA_IN_REPORTS, "false"));
				showDeliveryLRAtDestination				= PropertiesUtility.isAllow(displayDataConfig.getString(DisplayDataConfigurationDTO.SHOW_DELIVER_LR_AT_DESTINATION, "false"));

				valueObjectIn							= new ValueObject();

				for(var i = 0; i < reportModel.length; i++){
					if (isDonotShowWayBillTypeWiseData) {
						valueObjectIn.put(AliasNameConstants.CURRENT_DATE_TIMESTAMP, createDate);
						valueObjectIn.put(AliasNameConstants.WAYBILL_TYPE_ID, reportModel[i].getWayBillTypeId());
						valueObjectIn.put(AliasNameConstants.SOURCE_BRANCH_ID, reportModel[i].getWayBillSourceBranchId());
						valueObjectIn.put(AliasNameConstants.DATE_TIMESTAMP, reportModel[i].getBookedDate());
						valueObjectIn.put(AliasNameConstants.EXECUTIVE_ID, executive.getExecutiveId());
						valueObjectIn.put(AliasNameConstants.WAYBILL_STATUS_ID, reportModel[i].getStatus());
						valueObjectIn.put(AliasNameConstants.IS_SHOW_WAYBILL, reportModel[i].isShowWayBill());
						valueObjectIn.put(DisplayDataConfigurationDTO.SHOW_DELIVER_LR_AT_DESTINATION, showDeliveryLRAtDestination);
						valueObjectIn.put(Constant.REPORT_ID, ReportIdentifierConstant.DAILY_BRANCH_COLLECTION_REPORT);

						if(DisplayDataConfigurationBll.getInstance().isDisplayWayBillTypeWiseData(displayDataConfig, valueObjectIn))
							continue;
					}

					//Condition For Group Sharing Charges. SRS should Not see Receipt Charge Of Southern
					if(groupSharingChargesMap != null && groupSharingChargesMap.get(reportModel[i].getWayBillId()) != null && (reportModel[i].getStatus() == WayBill.WAYBILL_STATUS_DELIVERED || reportModel[i].getStatus() == WayBill.WAYBILL_STATUS_CREDIT_DELIVERED || reportModel[i].getStatus() == WayBill.WAYBILL_STATUS_DUEDELIVERED || reportModel[i].getStatus() == WayBill.WAYBILL_STATUS_DUEUNDELIVERED)) {
						reportModel[i].setDeliveryAmount(reportModel[i].getDeliveryAmount() - groupSharingChargesMap.get(reportModel[i].getWayBillId()));
						reportModel[i].setGrandTotal(reportModel[i].getGrandTotal() - groupSharingChargesMap.get(reportModel[i].getWayBillId()));
					}

					//show commission column
					if(reportModel[i].getAgentCommission() > 0)
						doNotShow_Commission 	= true;

					paidLoadingTotalAmt = 0.00;
					// Set City & Branch name
					reportModel[i].setWayBillSourceSubRegion(cache.getGenericSubRegionById(request, reportModel[i].getWayBillSourceSubRegionId()).getName());
					reportModel[i].setWayBillSourceBranch(cache.getGenericBranchDetailCache(request, reportModel[i].getWayBillSourceBranchId()).getName());
					reportModel[i].setWayBillDestinationSubRegion(cache.getGenericSubRegionById(request, reportModel[i].getWayBillDestinationSubRegionId()).getName());
					reportModel[i].setWayBillDestinationBranch(cache.getGenericBranchDetailCache(request, reportModel[i].getWayBillDestinationBranchId()).getName());
					// Set City & Branch name

					// Set WayBill Type Name
					wayBillType = cache.getWayBillTypeById(request, reportModel[i].getWayBillTypeId());

					if(reportModel[i].isManual())
						reportModel[i].setWayBillType(wayBillType.getWayBillType()+"(M)");
					else reportModel[i].setWayBillType(wayBillType.getWayBillType());

					//WayBill Charges (Booking & Delivery)
					wayBillCharges		= wayBillDetails.get(reportModel[i].getWayBillId()).getWayBillCharges();

					additionalCharges					= new AdditionalChargesModel();
					bookedWayBillCategoryTypeDetails 	= new HashMap<>();

					for (final WayBillCharges wayBillCharge : wayBillCharges) {
						if(reportModel[i].getStatus() != WayBillStatusConstant.WAYBILL_STATUS_DELIVERED && wayBillCharge.getChargeType() == ChargeTypeMaster.WAYBILL_CHARGETYPE_BOOKING)
							bookedWayBillCategoryTypeDetails.put(""+wayBillCharge.getWayBillChargeMasterId(), wayBillCharge.getChargeAmount());

						if(reportModel[i].getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DELIVERED && wayBillCharge.getChargeType() == ChargeTypeMaster.WAYBILL_CHARGETYPE_DELIVERY)
							bookedWayBillCategoryTypeDetails.put(""+wayBillCharge.getWayBillChargeMasterId(), wayBillCharge.getChargeAmount());
						//Get Non Zero Charge Columns : START
						if(reportModel[i].getStatus() == WayBillStatusConstant.WAYBILL_STATUS_BOOKED) {
							if(reportModel[i].getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID) {
								if(!reportModel[i].isManual()) {
									if(wayBillCharge.getChargeAmount() > 0 && !paidChargeColumns.contains(wayBillCharge.getWayBillChargeMasterId()))
										paidChargeColumns.add(wayBillCharge.getWayBillChargeMasterId());
								} else if(wayBillCharge.getChargeAmount() > 0 && !paidManualChargeColumns.contains(wayBillCharge.getWayBillChargeMasterId()))
									paidManualChargeColumns.add(wayBillCharge.getWayBillChargeMasterId());
							} else if(reportModel[i].getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_FOC) {
								if(!reportModel[i].isManual()) {
									if(wayBillCharge.getChargeAmount() > 0 && !focChargeColumns.contains(wayBillCharge.getWayBillChargeMasterId()))
										focChargeColumns.add(wayBillCharge.getWayBillChargeMasterId());
								} else if(wayBillCharge.getChargeAmount() > 0 && !focManualChargeColumns.contains(wayBillCharge.getWayBillChargeMasterId()))
									focManualChargeColumns.add(wayBillCharge.getWayBillChargeMasterId());
							} else if(reportModel[i].getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_TO_PAY ) {
								if(!reportModel[i].isManual()) {
									if(wayBillCharge.getChargeAmount() > 0 && !toPayChargeColumns.contains(wayBillCharge.getWayBillChargeMasterId()))
										toPayChargeColumns.add(wayBillCharge.getWayBillChargeMasterId());
								} else if(wayBillCharge.getChargeAmount() > 0 && !toPayManualChargeColumns.contains(wayBillCharge.getWayBillChargeMasterId()))
									toPayManualChargeColumns.add(wayBillCharge.getWayBillChargeMasterId());
							} else if(reportModel[i].getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_CREDIT)
								if(!reportModel[i].isManual()) {
									if(wayBillCharge.getChargeAmount() > 0 && !creditorChargeColumns.contains(wayBillCharge.getWayBillChargeMasterId()))
										creditorChargeColumns.add(wayBillCharge.getWayBillChargeMasterId());
								} else if(wayBillCharge.getChargeAmount() > 0 && !creditorManualChargeColumns.contains(wayBillCharge.getWayBillChargeMasterId()))
									creditorManualChargeColumns.add(wayBillCharge.getWayBillChargeMasterId());
						} else if(reportModel[i].getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CANCELLED) {
							if(wayBillCharge.getChargeAmount() > 0 && ! cancellationChargeColumns.contains(wayBillCharge.getWayBillChargeMasterId()))
								cancellationChargeColumns.add(wayBillCharge.getWayBillChargeMasterId());
						} else if(reportModel[i].getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DELIVERED) {
							if(wayBillCharge.getChargeAmount() > 0 && ! deliveryChargeColumns.contains(wayBillCharge.getWayBillChargeMasterId()))
								deliveryChargeColumns.add(wayBillCharge.getWayBillChargeMasterId());
						} else if(reportModel[i].getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CREDIT_DELIVERED) {
							if(wayBillCharge.getChargeAmount() > 0 && ! creditDeliveryChargeColumns.contains(wayBillCharge.getWayBillChargeMasterId()))
								creditDeliveryChargeColumns.add(wayBillCharge.getWayBillChargeMasterId());
						} else if(reportModel[i].getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DUEDELIVERED || reportModel[i].getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DUEUNDELIVERED)
							if(wayBillCharge.getChargeAmount() > 0 && ! dueDeliverChargeColumns.contains(wayBillCharge.getWayBillChargeMasterId()))
								dueDeliverChargeColumns.add(wayBillCharge.getWayBillChargeMasterId());

						var chargeAmount = 0D;

						if (totalChargesAmount.get(wayBillCharge.getWayBillChargeMasterId()) != null)
							chargeAmount 	+= totalChargesAmount.get(wayBillCharge.getWayBillChargeMasterId());
						totalChargesAmount.put(wayBillCharge.getWayBillChargeMasterId(),chargeAmount);

						if(executive.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNTGORUPID_SRS_TRAVELS )
							if(reportModel[i].getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DELIVERED
							&& reportModel[i].getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY)
								if(wayBillCharge.getWayBillChargeMasterId() == ChargeTypeMaster.FREIGHT)
									additionalCharges.setFreight(wayBillCharge.getChargeAmount());
								else if(wayBillCharge.getWayBillChargeMasterId() == ChargeTypeMaster.PAID_HAMALI)
									additionalCharges.setPaidHandling(wayBillCharge.getChargeAmount());
								else if(wayBillCharge.getWayBillChargeMasterId() == ChargeTypeMaster.SRS_HAMALI_BOOKING)
									additionalCharges.setHandlingBooking(wayBillCharge.getChargeAmount());

						if(reportModel[i].getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY
								&& (wayBillCharge.getWayBillChargeMasterId() == ChargeTypeMaster.PAID_LOADING || wayBillCharge.getWayBillChargeMasterId() == ChargeTypeMaster.PAID_HAMALI)
								&& wayBillCharge.getChargeAmount() > 0)
							paidLoadingTotalAmt 	= wayBillCharge.getChargeAmount();
					}

					storeExtraCharges.put(reportModel[i].getWayBillId(), additionalCharges);
					reportModel[i].setChargesCollection(bookedWayBillCategoryTypeDetails);
					//end

					//Calculate Total  booking WayBill Tax
					wayBillTax 	= wayBillDetails.get(reportModel[i].getWayBillId()).getWayBillTaxTxn();

					var totalTax 				= 0.00;

					for (final WayBillTaxTxn element : wayBillTax)
						totalTax = totalTax + element.getTaxAmount();

					totalTax = Math.round(totalTax);
					reportModel[i].setTotalTax(totalTax);

					if(totalTax > 0)
						doNotShow_Tax = true;


					//Calculate Total Delivery  WayBill Tax
					if(wayBillDlyDetails !=null)
						wayBillDlyTax 	= wayBillDlyDetails.get(reportModel[i].getWayBillId()).getWayBillTaxTxn();

					var totalDlyTax 				= 0.00;

					if(wayBillDlyTax !=null)
						for (final WayBillTaxTxn element : wayBillDlyTax)
							totalDlyTax = totalDlyTax + element.getTaxAmount();

					totalDlyTax = Math.round(totalDlyTax);
					reportModel[i].setTotalDlyTax(totalDlyTax);

					if(totalDlyTax > 0)
						doNotShow_Tax = true;
					//Calculate Total Discount
					var totalDiscount 		= 0.00;

					if(reportModel[i].isDiscountPercent())
						totalDiscount 	= Math.round(reportModel[i].getAmount() * reportModel[i].getDiscount() / 100);
					else
						totalDiscount 	= reportModel[i].getDiscount();
					reportModel[i].setDiscount(totalDiscount);

					if(totalDiscount > 0)
						doNotShow_Disc = true;


					if(reportModel[i].getStatus() == WayBillStatusConstant.WAYBILL_STATUS_BOOKED) {
						if(reportModel[i].getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID) {
							//City Wise Paid Details code
							cityWiseToPayeeDetails = (HashMap<Long, Object>) storeCityWiseToPayeeDetails.get(reportModel[i].getDestinationSubRegionId());

							if(cityWiseToPayeeDetails == null) {
								cityWiseToPayeeDetails = new LinkedHashMap<>();

								cityWiseCollectionModel = (CityWiseCollectionModel) cityWiseToPayeeDetails.get(reportModel[i].getDestinationBranchId());

								if(cityWiseCollectionModel == null) {
									cityWiseCollectionModel = new CityWiseCollectionModel();

									cityWiseCollectionModel.setBranchId(reportModel[i].getDestinationBranchId());
									cityWiseCollectionModel.setBranchName(reportModel[i].getWayBillDestinationBranch());
									cityWiseCollectionModel.setSubRegionId(reportModel[i].getDestinationSubRegionId());
									cityWiseCollectionModel.setSubRegionName(reportModel[i].getWayBillDestinationSubRegion());
									cityWiseCollectionModel.setTotalPaidAmount(reportModel[i].getGrandTotal());
									cityWiseCollectionModel.setTotalToPayAmount(0);
									cityWiseCollectionModel.setTotalCreditorAmount(0);
									cityWiseCollectionModel.setQuantity(reportModel[i].getNoOfPackages());

									cityWiseToPayeeDetails.put(reportModel[i].getDestinationBranchId(), cityWiseCollectionModel);
								} else {
									cityWiseCollectionModel.setTotalPaidAmount(cityWiseCollectionModel.getTotalPaidAmount() + reportModel[i].getGrandTotal());
									cityWiseCollectionModel.setTotalToPayAmount(cityWiseCollectionModel.getTotalToPayAmount() + 0);
									cityWiseCollectionModel.setTotalToPayAmount(cityWiseCollectionModel.getTotalCreditorAmount() + 0);
									cityWiseCollectionModel.setQuantity(cityWiseCollectionModel.getQuantity() + reportModel[i].getNoOfPackages());
								}

								storeCityWiseToPayeeDetails.put(reportModel[i].getDestinationSubRegionId(), cityWiseToPayeeDetails);
							} else {
								cityWiseCollectionModel = (CityWiseCollectionModel) cityWiseToPayeeDetails.get(reportModel[i].getDestinationBranchId());

								if(cityWiseCollectionModel == null) {
									cityWiseCollectionModel = new CityWiseCollectionModel();

									cityWiseCollectionModel.setBranchId(reportModel[i].getDestinationBranchId());
									cityWiseCollectionModel.setBranchName(reportModel[i].getWayBillDestinationBranch());
									cityWiseCollectionModel.setSubRegionId(reportModel[i].getDestinationSubRegionId());
									cityWiseCollectionModel.setSubRegionName(reportModel[i].getWayBillDestinationSubRegion());
									cityWiseCollectionModel.setTotalPaidAmount(reportModel[i].getGrandTotal());
									cityWiseCollectionModel.setTotalToPayAmount(0);
									cityWiseCollectionModel.setTotalCreditorAmount(0);
									cityWiseCollectionModel.setQuantity(reportModel[i].getNoOfPackages());

									cityWiseToPayeeDetails.put(reportModel[i].getDestinationBranchId(), cityWiseCollectionModel);
								} else {
									cityWiseCollectionModel.setTotalPaidAmount(cityWiseCollectionModel.getTotalPaidAmount() + reportModel[i].getGrandTotal());
									cityWiseCollectionModel.setTotalToPayAmount(cityWiseCollectionModel.getTotalToPayAmount() + 0);
									cityWiseCollectionModel.setTotalCreditorAmount(cityWiseCollectionModel.getTotalCreditorAmount() + 0);
									cityWiseCollectionModel.setQuantity(cityWiseCollectionModel.getQuantity() + reportModel[i].getNoOfPackages());
								}

							}
							//City Wise Paid Details code

							if(!reportModel[i].isManual())
								booking.put(reportModel[i].getWayBillId(), reportModel[i]);
							else
								bookingManual.put(reportModel[i].getWayBillId(), reportModel[i]);
						} else if(reportModel[i].getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_FOC) {
							if(!reportModel[i].isManual())
								FOC.put(reportModel[i].getWayBillId(), reportModel[i]);
							else
								FOCManual.put(reportModel[i].getWayBillId(), reportModel[i]);
						} else if(reportModel[i].getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY ) {
							//City Wise ToPayee Details code
							cityWiseToPayeeDetails = (HashMap<Long, Object>)storeCityWiseToPayeeDetails.get(reportModel[i].getDestinationSubRegionId());

							if(cityWiseToPayeeDetails == null){
								cityWiseToPayeeDetails = new LinkedHashMap<>();

								cityWiseCollectionModel = (CityWiseCollectionModel) cityWiseToPayeeDetails.get(reportModel[i].getDestinationBranchId());

								if(cityWiseCollectionModel == null) {

									cityWiseCollectionModel = new CityWiseCollectionModel();

									cityWiseCollectionModel.setBranchId(reportModel[i].getDestinationBranchId());
									cityWiseCollectionModel.setBranchName(reportModel[i].getWayBillDestinationBranch());
									cityWiseCollectionModel.setSubRegionId(reportModel[i].getDestinationSubRegionId());
									cityWiseCollectionModel.setSubRegionName(reportModel[i].getWayBillDestinationSubRegion());
									cityWiseCollectionModel.setTotalPaidAmount(0);
									cityWiseCollectionModel.setTotalCreditorAmount(0);
									cityWiseCollectionModel.setTotalToPayAmount(reportModel[i].getGrandTotal() + reportModel[i].getAgentCommission() - paidLoadingTotalAmt);
									cityWiseCollectionModel.setQuantity(reportModel[i].getNoOfPackages());

									cityWiseToPayeeDetails.put(reportModel[i].getDestinationBranchId(), cityWiseCollectionModel);
								} else {
									cityWiseCollectionModel.setTotalPaidAmount(cityWiseCollectionModel.getTotalPaidAmount() + 0);
									cityWiseCollectionModel.setTotalCreditorAmount(cityWiseCollectionModel.getTotalCreditorAmount() + 0);
									cityWiseCollectionModel.setTotalToPayAmount(cityWiseCollectionModel.getTotalToPayAmount() + reportModel[i].getGrandTotal() + reportModel[i].getAgentCommission() - paidLoadingTotalAmt);
									cityWiseCollectionModel.setQuantity(cityWiseCollectionModel.getQuantity() + reportModel[i].getNoOfPackages());
								}

								storeCityWiseToPayeeDetails.put(reportModel[i].getDestinationSubRegionId() ,cityWiseToPayeeDetails);
							} else {

								cityWiseCollectionModel = (CityWiseCollectionModel) cityWiseToPayeeDetails.get(reportModel[i].getDestinationBranchId());

								if(cityWiseCollectionModel == null) {

									cityWiseCollectionModel = new CityWiseCollectionModel();

									cityWiseCollectionModel.setBranchId(reportModel[i].getDestinationBranchId());
									cityWiseCollectionModel.setBranchName(reportModel[i].getWayBillDestinationBranch());
									cityWiseCollectionModel.setSubRegionId(reportModel[i].getDestinationSubRegionId());
									cityWiseCollectionModel.setSubRegionName(reportModel[i].getWayBillDestinationSubRegion());
									cityWiseCollectionModel.setTotalPaidAmount(0);
									cityWiseCollectionModel.setTotalCreditorAmount(0);
									cityWiseCollectionModel.setTotalToPayAmount(reportModel[i].getGrandTotal() + reportModel[i].getAgentCommission() - paidLoadingTotalAmt);
									cityWiseCollectionModel.setQuantity(reportModel[i].getNoOfPackages());

									cityWiseToPayeeDetails.put(reportModel[i].getDestinationBranchId(), cityWiseCollectionModel);
								} else {
									cityWiseCollectionModel.setTotalPaidAmount(cityWiseCollectionModel.getTotalPaidAmount() + 0);
									cityWiseCollectionModel.setTotalCreditorAmount(cityWiseCollectionModel.getTotalCreditorAmount() + 0);
									cityWiseCollectionModel.setTotalToPayAmount(cityWiseCollectionModel.getTotalToPayAmount() + reportModel[i].getGrandTotal() + reportModel[i].getAgentCommission() - paidLoadingTotalAmt);
									cityWiseCollectionModel.setQuantity(cityWiseCollectionModel.getQuantity() + reportModel[i].getNoOfPackages());
								}

							}

							if(!reportModel[i].isManual())
								toPayeeBooking.put(reportModel[i].getWayBillId(), reportModel[i]);
							else
								toPayeeBookingManual.put(reportModel[i].getWayBillId(), reportModel[i]);

						} else if( reportModel[i].getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT && showCreditDetailsColumn) {
							//City Wise Credit Details code
							cityWiseToPayeeDetails = (HashMap<Long, Object>) storeCityWiseToPayeeDetails.get(reportModel[i].getDestinationSubRegionId());

							if(cityWiseToPayeeDetails == null) {
								cityWiseToPayeeDetails = new LinkedHashMap<>();

								cityWiseCollectionModel = (CityWiseCollectionModel) cityWiseToPayeeDetails.get(reportModel[i].getDestinationBranchId());

								if(cityWiseCollectionModel == null) {
									cityWiseCollectionModel = new CityWiseCollectionModel();

									cityWiseCollectionModel.setBranchId(reportModel[i].getDestinationBranchId());
									cityWiseCollectionModel.setBranchName(reportModel[i].getWayBillDestinationBranch());
									cityWiseCollectionModel.setSubRegionId(reportModel[i].getDestinationSubRegionId());
									cityWiseCollectionModel.setSubRegionName(reportModel[i].getWayBillDestinationSubRegion());
									cityWiseCollectionModel.setTotalCreditorAmount(reportModel[i].getGrandTotal());
									cityWiseCollectionModel.setTotalToPayAmount(0);
									cityWiseCollectionModel.setTotalPaidAmount(0);
									cityWiseCollectionModel.setQuantity(reportModel[i].getNoOfPackages());

									cityWiseToPayeeDetails.put(reportModel[i].getDestinationBranchId(), cityWiseCollectionModel);
								} else {
									cityWiseCollectionModel.setTotalCreditorAmount(cityWiseCollectionModel.getTotalCreditorAmount() + reportModel[i].getGrandTotal());
									cityWiseCollectionModel.setTotalToPayAmount(cityWiseCollectionModel.getTotalToPayAmount() + 0);
									cityWiseCollectionModel.setTotalPaidAmount(cityWiseCollectionModel.getTotalPaidAmount() + 0);
									cityWiseCollectionModel.setQuantity(cityWiseCollectionModel.getQuantity() + reportModel[i].getNoOfPackages());
								}

								storeCityWiseToPayeeDetails.put(reportModel[i].getDestinationSubRegionId(), cityWiseToPayeeDetails);
							} else {
								cityWiseCollectionModel = (CityWiseCollectionModel) cityWiseToPayeeDetails.get(reportModel[i].getDestinationBranchId());

								if(cityWiseCollectionModel == null) {
									cityWiseCollectionModel = new CityWiseCollectionModel();

									cityWiseCollectionModel.setBranchId(reportModel[i].getDestinationBranchId());
									cityWiseCollectionModel.setBranchName(reportModel[i].getWayBillDestinationBranch());
									cityWiseCollectionModel.setSubRegionId(reportModel[i].getDestinationSubRegionId());
									cityWiseCollectionModel.setSubRegionName(reportModel[i].getWayBillDestinationSubRegion());
									cityWiseCollectionModel.setTotalCreditorAmount(reportModel[i].getGrandTotal());
									cityWiseCollectionModel.setTotalToPayAmount(0);
									cityWiseCollectionModel.setTotalPaidAmount(0);
									cityWiseCollectionModel.setQuantity(reportModel[i].getNoOfPackages());

									cityWiseToPayeeDetails.put(reportModel[i].getDestinationBranchId(), cityWiseCollectionModel);
								} else {
									cityWiseCollectionModel.setTotalCreditorAmount(cityWiseCollectionModel.getTotalCreditorAmount() + reportModel[i].getGrandTotal());
									cityWiseCollectionModel.setTotalToPayAmount(cityWiseCollectionModel.getTotalToPayAmount() + 0);
									cityWiseCollectionModel.setTotalPaidAmount(cityWiseCollectionModel.getTotalPaidAmount() + 0);
									cityWiseCollectionModel.setQuantity(cityWiseCollectionModel.getQuantity() + reportModel[i].getNoOfPackages());
								}
							}
							//City Wise Credit Details code

							if(!reportModel[i].isManual())
								creditorBooking.put(reportModel[i].getWayBillId(), reportModel[i]);
							else
								creditorBookingManual.put(reportModel[i].getWayBillId(), reportModel[i]);
						}

					} else if(reportModel[i].getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CANCELLED) {

						cancellation.put(reportModel[i].getWayBillId(), reportModel[i]);

						if(reportModel[i].getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_TO_PAY || reportModel[i].getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT )
							cancelledWayBills.add(reportModel[i].getWayBillId());

						if(reportModel[i].getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY) {
							//City Wise ToPayee Details code
							cityWiseToPayeeDetails = (HashMap<Long, Object>) storeCityWiseToPayeeDetails.get(reportModel[i].getDestinationSubRegionId());

							if(cityWiseToPayeeDetails == null) {
								cityWiseToPayeeDetails = new LinkedHashMap<>();

								cityWiseCollectionModel = (CityWiseCollectionModel) cityWiseToPayeeDetails.get(reportModel[i].getDestinationBranchId());

								if(cityWiseCollectionModel == null){
									cityWiseCollectionModel = new CityWiseCollectionModel();

									cityWiseCollectionModel.setBranchId(reportModel[i].getDestinationBranchId());
									cityWiseCollectionModel.setBranchName(reportModel[i].getWayBillDestinationBranch());
									cityWiseCollectionModel.setSubRegionId(reportModel[i].getDestinationSubRegionId());
									cityWiseCollectionModel.setSubRegionName(reportModel[i].getWayBillDestinationSubRegion());
									cityWiseCollectionModel.setTotalPaidAmount(-0);
									cityWiseCollectionModel.setTotalCreditorAmount(-0);
									cityWiseCollectionModel.setTotalToPayAmount( - (reportModel[i].getGrandTotal() + reportModel[i].getAgentCommission() - paidLoadingTotalAmt));
									cityWiseCollectionModel.setQuantity(-reportModel[i].getNoOfPackages());

									cityWiseToPayeeDetails.put(reportModel[i].getDestinationBranchId(), cityWiseCollectionModel);
								}else{
									cityWiseCollectionModel.setTotalPaidAmount(cityWiseCollectionModel.getTotalPaidAmount() - 0);
									cityWiseCollectionModel.setTotalCreditorAmount(cityWiseCollectionModel.getTotalCreditorAmount() - 0);
									cityWiseCollectionModel.setTotalToPayAmount(cityWiseCollectionModel.getTotalToPayAmount() - (reportModel[i].getGrandTotal() + reportModel[i].getAgentCommission() - paidLoadingTotalAmt));
									cityWiseCollectionModel.setQuantity(cityWiseCollectionModel.getQuantity() - reportModel[i].getNoOfPackages());
								}

								storeCityWiseToPayeeDetails.put(reportModel[i].getDestinationSubRegionId() ,cityWiseToPayeeDetails);
							} else {
								cityWiseCollectionModel = (CityWiseCollectionModel) cityWiseToPayeeDetails.get(reportModel[i].getDestinationBranchId());

								if(cityWiseCollectionModel == null){
									cityWiseCollectionModel = new CityWiseCollectionModel();

									cityWiseCollectionModel.setBranchId(reportModel[i].getDestinationBranchId());
									cityWiseCollectionModel.setBranchName(reportModel[i].getWayBillDestinationBranch());
									cityWiseCollectionModel.setSubRegionId(reportModel[i].getDestinationSubRegionId());
									cityWiseCollectionModel.setSubRegionName(reportModel[i].getWayBillDestinationSubRegion());
									cityWiseCollectionModel.setTotalPaidAmount(-0);
									cityWiseCollectionModel.setTotalCreditorAmount(-0);
									cityWiseCollectionModel.setTotalToPayAmount(- (reportModel[i].getGrandTotal() + reportModel[i].getAgentCommission() - paidLoadingTotalAmt));
									cityWiseCollectionModel.setQuantity(-reportModel[i].getNoOfPackages());

									cityWiseToPayeeDetails.put(reportModel[i].getDestinationBranchId(), cityWiseCollectionModel);
								}else{
									cityWiseCollectionModel.setTotalPaidAmount(cityWiseCollectionModel.getTotalPaidAmount() - 0);
									cityWiseCollectionModel.setTotalCreditorAmount(cityWiseCollectionModel.getTotalCreditorAmount() - 0);
									cityWiseCollectionModel.setTotalToPayAmount(cityWiseCollectionModel.getTotalToPayAmount() - (reportModel[i].getGrandTotal() + reportModel[i].getAgentCommission() - paidLoadingTotalAmt));
									cityWiseCollectionModel.setQuantity(cityWiseCollectionModel.getQuantity() - reportModel[i].getNoOfPackages());
								}
							}
							//City Wise ToPayee Details code
						} else if(reportModel[i].getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_PAID) {
							cityWiseToPayeeDetails = (HashMap<Long, Object>) storeCityWiseToPayeeDetails.get(reportModel[i].getDestinationSubRegionId());

							if(cityWiseToPayeeDetails == null) {
								cityWiseToPayeeDetails = new LinkedHashMap<>();

								cityWiseCollectionModel = (CityWiseCollectionModel) cityWiseToPayeeDetails.get(reportModel[i].getDestinationBranchId());

								if(cityWiseCollectionModel == null) {
									if(!showCashCollectionInReport || reportModel[i].getPaymentTypeId() != PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID) {
										cityWiseCollectionModel = new CityWiseCollectionModel();

										cityWiseCollectionModel.setBranchId(reportModel[i].getDestinationBranchId());
										cityWiseCollectionModel.setBranchName(reportModel[i].getWayBillDestinationBranch());
										cityWiseCollectionModel.setSubRegionId(reportModel[i].getDestinationSubRegionId());
										cityWiseCollectionModel.setSubRegionName(reportModel[i].getWayBillDestinationSubRegion());
										cityWiseCollectionModel.setTotalPaidAmount(-reportModel[i].getGrandTotal());
										cityWiseCollectionModel.setTotalToPayAmount(-0);
										cityWiseCollectionModel.setTotalCreditorAmount(-0);
										cityWiseCollectionModel.setQuantity(- reportModel[i].getNoOfPackages());

										cityWiseToPayeeDetails.put(reportModel[i].getDestinationBranchId(), cityWiseCollectionModel);
									}
								} else if(!showCashCollectionInReport || reportModel[i].getPaymentTypeId() != PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID) {
									cityWiseCollectionModel.setTotalPaidAmount(cityWiseCollectionModel.getTotalPaidAmount() - reportModel[i].getGrandTotal());
									cityWiseCollectionModel.setTotalToPayAmount(cityWiseCollectionModel.getTotalToPayAmount() - 0);
									cityWiseCollectionModel.setTotalCreditorAmount(cityWiseCollectionModel.getTotalCreditorAmount() - 0);
									cityWiseCollectionModel.setQuantity(cityWiseCollectionModel.getQuantity() - reportModel[i].getNoOfPackages());
								}

								storeCityWiseToPayeeDetails.put(reportModel[i].getDestinationSubRegionId(), cityWiseToPayeeDetails);
							} else {
								cityWiseCollectionModel = (CityWiseCollectionModel) cityWiseToPayeeDetails.get(reportModel[i].getDestinationBranchId());

								if(cityWiseCollectionModel == null) {

									if(!showCashCollectionInReport || reportModel[i].getPaymentTypeId() != PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID){
										cityWiseCollectionModel = new CityWiseCollectionModel();

										cityWiseCollectionModel.setBranchId(reportModel[i].getDestinationBranchId());
										cityWiseCollectionModel.setBranchName(reportModel[i].getWayBillDestinationBranch());
										cityWiseCollectionModel.setSubRegionId(reportModel[i].getDestinationSubRegionId());
										cityWiseCollectionModel.setSubRegionName(reportModel[i].getWayBillDestinationSubRegion());
										cityWiseCollectionModel.setTotalPaidAmount(-reportModel[i].getGrandTotal());
										cityWiseCollectionModel.setTotalToPayAmount(-0);
										cityWiseCollectionModel.setTotalCreditorAmount(-0);
										cityWiseCollectionModel.setQuantity(-reportModel[i].getNoOfPackages());

										cityWiseToPayeeDetails.put(reportModel[i].getDestinationBranchId(), cityWiseCollectionModel);
									}
								} else if(!showCashCollectionInReport || reportModel[i].getPaymentTypeId() != PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID){
									cityWiseCollectionModel.setTotalPaidAmount(cityWiseCollectionModel.getTotalPaidAmount() - reportModel[i].getGrandTotal());
									cityWiseCollectionModel.setTotalToPayAmount(cityWiseCollectionModel.getTotalToPayAmount() - 0);
									cityWiseCollectionModel.setTotalCreditorAmount(cityWiseCollectionModel.getTotalCreditorAmount() - 0);
									cityWiseCollectionModel.setQuantity(cityWiseCollectionModel.getQuantity() - reportModel[i].getNoOfPackages());
								}
							}
						} else if(showCreditDetailsColumn && reportModel[i].getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_CREDIT) {
							//City Wise Credit Details code
							cityWiseToPayeeDetails = (HashMap<Long, Object>) storeCityWiseToPayeeDetails.get(reportModel[i].getDestinationSubRegionId());

							if(cityWiseToPayeeDetails == null) {
								cityWiseToPayeeDetails = new LinkedHashMap<>();

								cityWiseCollectionModel = (CityWiseCollectionModel) cityWiseToPayeeDetails.get(reportModel[i].getDestinationBranchId());

								if(cityWiseCollectionModel == null) {
									if(!showCashCollectionInReport || reportModel[i].getPaymentTypeId() != PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID){
										cityWiseCollectionModel = new CityWiseCollectionModel();

										cityWiseCollectionModel.setBranchId(reportModel[i].getDestinationBranchId());
										cityWiseCollectionModel.setBranchName(reportModel[i].getWayBillDestinationBranch());
										cityWiseCollectionModel.setSubRegionId(reportModel[i].getDestinationSubRegionId());
										cityWiseCollectionModel.setSubRegionName(reportModel[i].getWayBillDestinationSubRegion());
										cityWiseCollectionModel.setTotalCreditorAmount(-reportModel[i].getGrandTotal());
										cityWiseCollectionModel.setTotalToPayAmount(-0);
										cityWiseCollectionModel.setTotalPaidAmount(-0);
										cityWiseCollectionModel.setQuantity(- reportModel[i].getNoOfPackages());

										cityWiseToPayeeDetails.put(reportModel[i].getDestinationBranchId(), cityWiseCollectionModel);
									}
								} else if(!showCashCollectionInReport || reportModel[i].getPaymentTypeId() != PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID){
									cityWiseCollectionModel.setTotalCreditorAmount(cityWiseCollectionModel.getTotalCreditorAmount() - reportModel[i].getGrandTotal());
									cityWiseCollectionModel.setTotalToPayAmount(cityWiseCollectionModel.getTotalToPayAmount() - 0);
									cityWiseCollectionModel.setTotalPaidAmount(cityWiseCollectionModel.getTotalPaidAmount() - 0);
									cityWiseCollectionModel.setQuantity(cityWiseCollectionModel.getQuantity() - reportModel[i].getNoOfPackages());
								}

								storeCityWiseToPayeeDetails.put(reportModel[i].getDestinationSubRegionId(), cityWiseToPayeeDetails);
							} else {
								cityWiseCollectionModel = (CityWiseCollectionModel) cityWiseToPayeeDetails.get(reportModel[i].getDestinationBranchId());

								if(cityWiseCollectionModel == null) {
									if(!showCashCollectionInReport || reportModel[i].getPaymentTypeId() != PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID){
										cityWiseCollectionModel = new CityWiseCollectionModel();

										cityWiseCollectionModel.setBranchId(reportModel[i].getDestinationBranchId());
										cityWiseCollectionModel.setBranchName(reportModel[i].getWayBillDestinationBranch());
										cityWiseCollectionModel.setSubRegionId(reportModel[i].getDestinationSubRegionId());
										cityWiseCollectionModel.setSubRegionName(reportModel[i].getWayBillDestinationSubRegion());
										cityWiseCollectionModel.setTotalCreditorAmount(-reportModel[i].getGrandTotal());
										cityWiseCollectionModel.setTotalToPayAmount(-0);
										cityWiseCollectionModel.setTotalPaidAmount(-0);
										cityWiseCollectionModel.setQuantity(-reportModel[i].getNoOfPackages());

										cityWiseToPayeeDetails.put(reportModel[i].getDestinationBranchId(), cityWiseCollectionModel);
									}
								} else if(!showCashCollectionInReport || reportModel[i].getPaymentTypeId() != PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID){
									cityWiseCollectionModel.setTotalCreditorAmount(cityWiseCollectionModel.getTotalCreditorAmount() - reportModel[i].getGrandTotal());
									cityWiseCollectionModel.setTotalToPayAmount(cityWiseCollectionModel.getTotalToPayAmount() - 0);
									cityWiseCollectionModel.setTotalPaidAmount(cityWiseCollectionModel.getTotalPaidAmount() - 0);
									cityWiseCollectionModel.setQuantity(cityWiseCollectionModel.getQuantity() - reportModel[i].getNoOfPackages());
								}
							}
							//City Wise Credit Details code
						}
					} else if(reportModel[i].getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DELIVERED || reportModel[i].getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DELIVERED_BEFORE_CANCEL){
						deliveredWayBills.add(reportModel[i].getWayBillId());
						delivery.put(reportModel[i].getWayBillId(), reportModel[i]);

						if (reportModel[i].getDeliveryDiscount() > 0 )
							doNotShowDelivery_Disc = true;
					} else if(reportModel[i].getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CREDIT_DELIVERED)
						creditDelivery.put(reportModel[i].getWayBillId(), reportModel[i]);
					else if(reportModel[i].getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CANCELLED_DELIVERY)
						deliveryCancellation.put(reportModel[i].getWayBillId(), reportModel[i]);

					if(isConfigDoorDelivery && (reportModel[i].getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DUEDELIVERED || reportModel[i].getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DUEUNDELIVERED)) {
						if(reportModel[i].getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID)
							reportModel[i].setGrandTotal(reportModel[i].getDeliveryAmount() - reportModel[i].getDeliveryDiscount());
						else if(reportModel[i].getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_FOC || reportModel[i].getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT )
							reportModel[i].setGrandTotal(0);
						deuDeliver.put(reportModel[i].getWayBillId(), reportModel[i]);
					}

					if(reportModel[i].getStatus() == WayBillStatusConstant.WAYBILL_STATUS_BOOKED) {
						if(reportModel[i].getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID) {
							totalBookingGrandAmount 	+= reportModel[i].getGrandTotal();
							if(reportModel[i].getPaymentTypeId() == PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID)
								totalBookingChequeTotal	+=  reportModel[i].getGrandTotal();
						} else if(reportModel[i].getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY) {
							toPayCommissionToBeLess 	+= reportModel[i].getAgentCommission();

							for (final WayBillCharges wayBillCharge : wayBillCharges)
								if((wayBillCharge.getWayBillChargeMasterId() == ChargeTypeMaster.PAID_LOADING
								|| wayBillCharge.getWayBillChargeMasterId() == ChargeTypeMaster.PAID_HAMALI)
										&& wayBillCharge.getChargeAmount() > 0)
									totalBookingGrandAmount += wayBillCharge.getChargeAmount();
						}
						getAddedTdsRateWiseBookingCommission(dateWiseTDSHM, reportModel[i], rateWiseTDSHM, request);

						wayBillCategoryTypeDetails = wbCategoryTypeDetails.get(reportModel[i].getWayBillType());

						if(wayBillCategoryTypeDetails == null) {
							wayBillCategoryTypeDetails = new WayBillCategoryTypeDetails();

							wayBillCategoryTypeDetails.setWayBillType(reportModel[i].getWayBillType());
							wayBillCategoryTypeDetails.setQuantity(reportModel[i].getNoOfPackages());
							wayBillCategoryTypeDetails.setBookingDiscount(totalDiscount);
							wayBillCategoryTypeDetails.setTotalTax(totalTax);
							wayBillCategoryTypeDetails.setTotalAmount(reportModel[i].getGrandTotal() - (reportModel[i].getDeliveryAmount() - reportModel[i].getDeliveryDiscount()));
							wayBillCategoryTypeDetails.setAgentCommission(reportModel[i].getAgentCommission());
							wayBillCategoryTypeDetails.setBookingCommission(reportModel[i].getBookingCommission());

							chargesCollection 	= new HashMap<>();

							for (final WayBillCharges wayBillCharge : wayBillCharges)
								if(wayBillCharge.getChargeType() == ChargeTypeMaster.WAYBILL_CHARGETYPE_BOOKING)
									chargesCollection.put(wayBillCharge.getWayBillChargeMasterId(), wayBillCharge.getChargeAmount());

							wayBillCategoryTypeDetails.setChargesCollection(chargesCollection);

							wbCategoryTypeDetails.put(reportModel[i].getWayBillType(), wayBillCategoryTypeDetails);
						} else {
							wayBillCategoryTypeDetails.setQuantity(wayBillCategoryTypeDetails.getQuantity() + reportModel[i].getNoOfPackages());
							wayBillCategoryTypeDetails.setBookingDiscount(wayBillCategoryTypeDetails.getBookingDiscount() + totalDiscount);
							wayBillCategoryTypeDetails.setTotalTax(wayBillCategoryTypeDetails.getTotalTax() + totalTax);
							wayBillCategoryTypeDetails.setTotalAmount(wayBillCategoryTypeDetails.getTotalAmount() + (reportModel[i].getGrandTotal() - (reportModel[i].getDeliveryAmount() - reportModel[i].getDeliveryDiscount())));
							wayBillCategoryTypeDetails.setAgentCommission(wayBillCategoryTypeDetails.getAgentCommission() + reportModel[i].getAgentCommission());
							wayBillCategoryTypeDetails.setBookingCommission(wayBillCategoryTypeDetails.getBookingCommission() + reportModel[i].getBookingCommission());

							chargesCollection = wayBillCategoryTypeDetails.getChargesCollection();

							for (final WayBillCharges wayBillCharge : wayBillCharges)
								if(wayBillCharge.getChargeType() == ChargeTypeMaster.WAYBILL_CHARGETYPE_BOOKING)
									if(chargesCollection.get(wayBillCharge.getWayBillChargeMasterId()) != null)
										chargesCollection.put(wayBillCharge.getWayBillChargeMasterId(), chargesCollection.get(wayBillCharge.getWayBillChargeMasterId()) + wayBillCharge.getChargeAmount());
									else
										chargesCollection.put(wayBillCharge.getWayBillChargeMasterId(), wayBillCharge.getChargeAmount());
						}
					} else if(reportModel[i].getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CANCELLED && (reportModel[i].getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID || reportModel[i].getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY || reportModel[i].getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT)) {
						if(reportModel[i].getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID) {
							if(!showCashCollectionInReport || reportModel[i].getPaymentTypeId() != PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID)
								totalCancellationGrandAmount += Math.round(reportModel[i].getGrandTotal() - reportModel[i].getAmount());

						} else if(reportModel[i].getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY) {
							totalCancellationGrandAmount += Math.round(-reportModel[i].getAmount());

							for (final WayBillCharges wayBillCharge : wayBillCharges)
								if((wayBillCharge.getWayBillChargeMasterId() == ChargeTypeMaster.PAID_LOADING
								|| wayBillCharge.getWayBillChargeMasterId() == ChargeTypeMaster.PAID_HAMALI)
										&& wayBillCharge.getChargeAmount() > 0)
									totalBookingGrandAmount -= wayBillCharge.getChargeAmount();
						}
						getDeductedTdsRateWiseBookingCommission(dateWiseTDSHM, reportModel[i], rateWiseTDSHM, request);

						wayBillCategoryTypeDetails = wbCategoryTypeDetails.get(reportModel[i].getWayBillType());

						if(wayBillCategoryTypeDetails == null) {
							if(!showCashCollectionInReport || reportModel[i].getPaymentTypeId() != PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID){
								wayBillCategoryTypeDetails = new WayBillCategoryTypeDetails();

								wayBillCategoryTypeDetails.setWayBillType(reportModel[i].getWayBillType());
								wayBillCategoryTypeDetails.setQuantity(-reportModel[i].getNoOfPackages());
								wayBillCategoryTypeDetails.setBookingDiscount(-totalDiscount);
								wayBillCategoryTypeDetails.setTotalTax(-totalTax);
								wayBillCategoryTypeDetails.setTotalAmount(- (reportModel[i].getGrandTotal() - (reportModel[i].getDeliveryAmount() - reportModel[i].getDeliveryDiscount())));
								wayBillCategoryTypeDetails.setAgentCommission(- reportModel[i].getAgentCommission());
								wayBillCategoryTypeDetails.setBookingCommission( - reportModel[i].getBookingCommission());

								chargesCollection = new HashMap<>();

								for(var k = 0; k < wayBillCharges.length; k++)
									if(wayBillCharges[k].getChargeType() == ChargeTypeMaster.WAYBILL_CHARGETYPE_BOOKING)
										chargesCollection.put(wayBillCharges[k].getWayBillChargeMasterId(),- wayBillCharges[k].getChargeAmount());

								wayBillCategoryTypeDetails.setChargesCollection(chargesCollection);
								wbCategoryTypeDetails.put(reportModel[i].getWayBillType(), wayBillCategoryTypeDetails);
							}
						} else if(!showCashCollectionInReport || reportModel[i].getPaymentTypeId() != PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID) {
							wayBillCategoryTypeDetails.setQuantity(wayBillCategoryTypeDetails.getQuantity() - reportModel[i].getNoOfPackages());
							wayBillCategoryTypeDetails.setBookingDiscount(wayBillCategoryTypeDetails.getBookingDiscount() - totalDiscount);
							wayBillCategoryTypeDetails.setTotalTax(wayBillCategoryTypeDetails.getTotalTax() - totalTax);
							wayBillCategoryTypeDetails.setTotalAmount(wayBillCategoryTypeDetails.getTotalAmount() - (reportModel[i].getGrandTotal() - (reportModel[i].getDeliveryAmount() - reportModel[i].getDeliveryDiscount())));
							wayBillCategoryTypeDetails.setAgentCommission(wayBillCategoryTypeDetails.getAgentCommission() - reportModel[i].getAgentCommission());
							wayBillCategoryTypeDetails.setBookingCommission(wayBillCategoryTypeDetails.getBookingCommission() - reportModel[i].getBookingCommission());

							chargesCollection = wayBillCategoryTypeDetails.getChargesCollection();

							for(var k = 0; k < wayBillCharges.length; k++)
								if(wayBillCharges[k].getChargeType() == ChargeTypeMaster.WAYBILL_CHARGETYPE_BOOKING)
									if(chargesCollection.get(wayBillCharges[k].getWayBillChargeMasterId()) != null)
										chargesCollection.put(wayBillCharges[k].getWayBillChargeMasterId(), chargesCollection.get(wayBillCharges[k].getWayBillChargeMasterId()) - wayBillCharges[k].getChargeAmount());
									else
										chargesCollection.put(wayBillCharges[k].getWayBillChargeMasterId(),- wayBillCharges[k].getChargeAmount());
						}
					} else if(reportModel[i].getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DELIVERED) {

						var totalFreight 	= 0.00;
						var totalBookingFreight 	= 0.00;
						var totalAmount 		= reportModel[i].getDeliveryAmount()-reportModel[i].getDeliveryDiscount();
						var paidLoadingAmt 	= 0.00;

						if(reportModel[i].getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY) {
							for (final WayBillCharges wayBillCharge : wayBillCharges)
								if((wayBillCharge.getWayBillChargeMasterId() == ChargeTypeMaster.PAID_LOADING
								|| wayBillCharge.getWayBillChargeMasterId() == ChargeTypeMaster.PAID_HAMALI)
										&& wayBillCharge.getChargeAmount() > 0) {
									paidLoadingAmt = wayBillCharge.getChargeAmount();

									paidLoading.put(reportModel[i].getWayBillId(), wayBillCharge.getChargeAmount());
								}

							totalDeliverGrandAmount +=  reportModel[i].getGrandTotal() - paidLoadingAmt;

							if(reportModel[i].getDeliveryPaymentTypeId() == PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID)
								totalDeliveryChequeTotal += reportModel[i].getGrandTotal() - paidLoadingAmt;

							totalFreight 			= reportModel[i].getGrandTotal() - (reportModel[i].getDeliveryAmount() - reportModel[i].getDeliveryDiscount()) - paidLoadingAmt;
							totalAmount  			= totalAmount + totalFreight;
						} else if(reportModel[i].getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID || reportModel[i].getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT) {
							totalDeliverGrandAmount += reportModel[i].getDeliveryAmount()-reportModel[i].getDeliveryDiscount();

							if(reportModel[i].getDeliveryPaymentTypeId() == PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID)
								totalDeliveryChequeTotal	+= reportModel[i].getDeliveryAmount()-reportModel[i].getDeliveryDiscount();

							if(showCashCollectionInReport && reportModel[i].getDeliveryPaymentTypeId() == PaymentTypeConstant.PAYMENT_TYPE_BILL_CREDIT_ID)
								totalDeliveryBillCreditTotal	+= reportModel[i].getDeliveryAmount()-reportModel[i].getDeliveryDiscount();
						}

						wbCategoryTypeDetailsForDlvrd = deliveredWayBillDetails.get(reportModel[i].getWayBillType());

						if(wbCategoryTypeDetailsForDlvrd == null) {
							wbCategoryTypeDetailsForDlvrd = new WayBillCategoryTypeDetails();

							wbCategoryTypeDetailsForDlvrd.setWayBillType(reportModel[i].getWayBillType());
							wbCategoryTypeDetailsForDlvrd.setQuantity(reportModel[i].getNoOfPackages());

							for (final WayBillCharges wayBillCharge : wayBillCharges)
								if(wayBillCharge.getWayBillChargeMasterId() == ChargeTypeMaster.FREIGHT)
									totalBookingFreight	= totalBookingFreight + wayBillCharge.getChargeAmount();

							wbCategoryTypeDetailsForDlvrd.setTotalBookingFreight(totalBookingFreight);
							wbCategoryTypeDetailsForDlvrd.setTotalFreight(totalFreight);
							wbCategoryTypeDetailsForDlvrd.setDeliveryDiscount(reportModel[i].getDeliveryDiscount());
							wbCategoryTypeDetailsForDlvrd.setTotalAmount(totalAmount);
							wbCategoryTypeDetailsForDlvrd.setDeliveryCommission(reportModel[i].getDeliveryCommission());
							wbCategoryTypeDetailsForDlvrd.setTotalTax(reportModel[i].getTotalDlyTax());

							chargesCollection = new HashMap<>();

							for (final WayBillCharges wayBillCharge : wayBillCharges)
								if(wayBillCharge.getChargeType() == ChargeTypeMaster.WAYBILL_CHARGETYPE_DELIVERY)
									chargesCollection.put(wayBillCharge.getWayBillChargeMasterId(), wayBillCharge.getChargeAmount());

							wbCategoryTypeDetailsForDlvrd.setChargesCollection(chargesCollection);

							deliveredWayBillDetails.put(reportModel[i].getWayBillType(), wbCategoryTypeDetailsForDlvrd);
						} else {
							wbCategoryTypeDetailsForDlvrd.setQuantity(wbCategoryTypeDetailsForDlvrd.getQuantity() + reportModel[i].getNoOfPackages());

							for (final WayBillCharges wayBillCharge : wayBillCharges)
								if(wayBillCharge.getWayBillChargeMasterId() == ChargeTypeMaster.FREIGHT)
									totalBookingFreight	= totalBookingFreight + wayBillCharge.getChargeAmount();

							wbCategoryTypeDetailsForDlvrd.setTotalBookingFreight(wbCategoryTypeDetailsForDlvrd.getTotalBookingFreight() + totalBookingFreight);
							wbCategoryTypeDetailsForDlvrd.setTotalFreight(wbCategoryTypeDetailsForDlvrd.getTotalFreight() + totalFreight);
							wbCategoryTypeDetailsForDlvrd.setDeliveryDiscount(wbCategoryTypeDetailsForDlvrd.getDeliveryDiscount() + reportModel[i].getDeliveryDiscount());
							wbCategoryTypeDetailsForDlvrd.setTotalAmount(wbCategoryTypeDetailsForDlvrd.getTotalAmount() + totalAmount);
							wbCategoryTypeDetailsForDlvrd.setDeliveryCommission(wbCategoryTypeDetailsForDlvrd.getDeliveryCommission() + reportModel[i].getDeliveryCommission());
							wbCategoryTypeDetailsForDlvrd.setTotalTax(wbCategoryTypeDetailsForDlvrd.getTotalTax() + reportModel[i].getTotalDlyTax());

							chargesCollection = wbCategoryTypeDetailsForDlvrd.getChargesCollection();

							for (final WayBillCharges wayBillCharge : wayBillCharges)
								if(wayBillCharge.getChargeType() == ChargeTypeMaster.WAYBILL_CHARGETYPE_DELIVERY)
									if(chargesCollection.get(wayBillCharge.getWayBillChargeMasterId()) != null)
										chargesCollection.put(wayBillCharge.getWayBillChargeMasterId(), chargesCollection.get(wayBillCharge.getWayBillChargeMasterId()) + wayBillCharge.getChargeAmount());
									else
										chargesCollection.put(wayBillCharge.getWayBillChargeMasterId(), wayBillCharge.getChargeAmount());
						}

						if(wayBillCharges != null)
							for (final WayBillCharges wayBillCharge : wayBillCharges) {
								if(wayBillCharge.getWayBillChargeMasterId() == ChargeTypeMaster.OCTROI_DELIVERY)
									totalDeliverOctroiAmount = totalDeliverOctroiAmount+wayBillCharge.getChargeAmount();

								if(wayBillCharge.getWayBillChargeMasterId() == ChargeTypeMaster.OTHER_DELIVERY)
									totalDeliverOtherAmount = totalDeliverOtherAmount+wayBillCharge.getChargeAmount();

								if(showCashCollectionInReport && reportModel[i].getDeliveryPaymentTypeId() == PaymentTypeConstant.PAYMENT_TYPE_BILL_CREDIT_ID){
									if(wayBillCharge.getWayBillChargeMasterId() == ChargeTypeMaster.OCTROI_DELIVERY)
										totalDeliverBillCreditOctroiAmount 	= totalDeliverBillCreditOctroiAmount + wayBillCharge.getChargeAmount();

									if(wayBillCharge.getWayBillChargeMasterId() == ChargeTypeMaster.OTHER_DELIVERY)
										totalDeliverBillCreditOtherAmount 	= totalDeliverBillCreditOtherAmount + wayBillCharge.getChargeAmount();
								}
							}
					}
				}

				LogWriter.writeLog(DailyBranchCollectionReportActionSRSTravels.class.getName(), LogWriter.LOG_LEVEL_DEBUG, "rateWiseTDSHM = " + rateWiseTDSHM);

				request.setAttribute("wayBillTypeDetails", wbCategoryTypeDetails);
				request.setAttribute("deliveredWayBillDetails", deliveredWayBillDetails);

				if(executive.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNT_GROUP_ID_FALCON_CARGO)
					request.setAttribute("totalGrandAmount", Math.round(totalBookingGrandAmount + totalDeliverGrandAmount - totalCancellationGrandAmount - toPayCommissionToBeLess - (totalDeliverOctroiAmount + totalDeliverOtherAmount))-totalDeliveryBillCreditTotal + (totalDeliverBillCreditOctroiAmount + totalDeliverBillCreditOtherAmount ));
				else
					request.setAttribute("totalGrandAmount", Math.round(totalBookingGrandAmount + totalDeliverGrandAmount - totalCancellationGrandAmount - toPayCommissionToBeLess));

				request.setAttribute("totalBookingChequeTotal",totalBookingChequeTotal);
				request.setAttribute("totalDeliveryChequeTotal",totalDeliveryChequeTotal);
				request.setAttribute("totalBookingAmount", Math.round(totalBookingGrandAmount));
				request.setAttribute("totalDeliveryAmount", Math.round(totalDeliverGrandAmount));
				request.setAttribute("totalCancellationAmount", Math.round(totalCancellationGrandAmount));
				request.setAttribute("paidLoading", paidLoading);

				if(doNotShow_Disc) request.setAttribute("doNotShow_Disc","false");
				if(doNotShowDelivery_Disc) request.setAttribute("doNotShowDelivery_Disc","false");
				if(doNotShow_Tax) request.setAttribute("doNotShow_Tax","false");
				if(doNotShow_Commission) request.setAttribute("doNotShow_Commission","false");

				//City Wise ToPayee Details code
				request.setAttribute("storeCityWiseToPayeeDetails", storeCityWiseToPayeeDetails);
				//City Wise ToPayee Details code

				request.setAttribute("cityWiseDetails", cityWiseDetails);

				request.setAttribute(DailyBranchCollectionReportConfigurationDTO.CALCULATE_TDS_ON_FINANCIAL_YEAR, calculateTdsOnFinancialYear);

				if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN) {
					branch = cache.getBranchById(request, executive.getAccountGroupId(), branchId);

					if(branch.getMappingTypeId() == Branch.BRANCH_MAP_ID_OWN_BRANCH_AND_ASSIGNED) {
						bookingCharges 	= cache.getBookingCharges(request, executive.getBranchId());
						deliveryCharges = cache.getDeliveryCharges(request, executive.getBranchId());
					} else {
						var accountId = 0L;

						if(reportModel[0].getStatus() == WayBillStatusConstant.WAYBILL_STATUS_BOOKED
								|| reportModel[0].getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CANCELLED)
							accountId = reportModel[0].getAccountGroupId();
						else
							accountId = reportModel[0].getBookedForAccountGroupId();

						if(bookingCharges == null)
							bookingCharges  = ChargeTypeMasterDao.getInstance().getChargeConfiguration(accountId, branch.getAgencyId(), branch.getBranchId(), ChargeTypeMaster.WAYBILL_CHARGETYPE_BOOKING);

						if(deliveryCharges == null)
							deliveryCharges = ChargeTypeMasterDao.getInstance().getChargeConfiguration(accountId, branch.getAgencyId(), branch.getBranchId(), ChargeTypeMaster.WAYBILL_CHARGETYPE_DELIVERY);
					}
				} else {
					bookingCharges 	= cache.getBookingCharges(request, executive.getBranchId());
					deliveryCharges = cache.getDeliveryCharges(request, executive.getBranchId());
				}

				//Non Zero Columns Collection : Start
				chargeColumns.put("paidChargeColumns", paidChargeColumns);
				chargeColumns.put("cancellationChargeColumns", cancellationChargeColumns);
				chargeColumns.put("deliveryChargeColumns", deliveryChargeColumns);
				chargeColumns.put("creditDeliveryChargeColumns", creditDeliveryChargeColumns);
				chargeColumns.put("focChargeColumns", focChargeColumns);
				chargeColumns.put("focManualChargeColumns", focManualChargeColumns);
				chargeColumns.put("toPayChargeColumns", toPayChargeColumns);
				chargeColumns.put("creditorChargeColumns", creditorChargeColumns);
				chargeColumns.put("paidManualChargeColumns", paidManualChargeColumns);
				chargeColumns.put("toPayManualChargeColumns", toPayManualChargeColumns);
				chargeColumns.put("creditorManualChargeColumns", creditorManualChargeColumns);
				chargeColumns.put("dueDeliverChargeColumns", dueDeliverChargeColumns);
				//Non Zero Columns Collection : End

				request.setAttribute("chargeColumns", chargeColumns);
				request.setAttribute("BookingCharges", bookingCharges);
				request.setAttribute("DeliveryCharges", deliveryCharges);
				request.setAttribute("deuDeliver", deuDeliver);
				request.setAttribute("Booking", booking);
				request.setAttribute("Cancellation", cancellation);
				request.setAttribute("deliveryCancellation", deliveryCancellation);
				request.setAttribute("Delivery", delivery);
				request.setAttribute("CreditDelivery", creditDelivery);
				request.setAttribute("creditorBooking", creditorBooking);
				request.setAttribute("FOC", FOC);
				request.setAttribute("toPayeeBooking", toPayeeBooking);
				request.setAttribute("BookingManual", bookingManual);
				request.setAttribute("toPayeeBookingManual", toPayeeBookingManual);
				request.setAttribute("creditorBookingManual", creditorBookingManual);
				request.setAttribute("FOCManual", FOCManual);
				request.setAttribute("DeliveredWayBill", deliveredWayBills);
				request.setAttribute("CancelledWayBills", cancelledWayBills);
				request.setAttribute("ExtraCharges", storeExtraCharges);

				if(executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_FALCON_CARGO
						|| executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_KONDUSKAR_S_R_TRAVELS
						|| executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_ROYAL_STAR
						|| executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_MAHESHCARGO
						|| executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_SURYADEV
						|| executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_ATL
						|| executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_SHARMATPT
						|| executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_SHARMAT
						|| executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_KOMITLA

						)
					request.setAttribute("nextPageToken", "success_"+executive.getAccountGroupId());
				else
					request.setAttribute("nextPageToken", "success");

				final var branchExpConfigValue = cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_BRANCH_EXPENSE);

				if(branchExpConfigValue == ConfigParam.CONFIG_KEY_BRANCH_EXPENSE_YES)
					request.setAttribute("BranchExpenseAmount",BranchExpenseDao.getInstance().getDailyBranchExpenseDetails(fromDate, toDate, branchId, executive.getAccountGroupId()));
			} else {
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
				request.setAttribute("nextPageToken", "success");
			}
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}

	private void getAddedTdsRateWiseBookingCommission(Map<String, Double> dateWiseTDSHM, DailyBranchCollectionReportModel aReportModel,final Map<Double, Double> rateWiseTDSHM, final HttpServletRequest request) throws Exception {
		if(dateWiseTDSHM != null)
			for (final Map.Entry<String, Double> entry : dateWiseTDSHM.entrySet()) {
				final var validFromDateStr	= DateTimeUtility.getDateTimeFromStr(entry.getKey().split("_")[0], DateTimeFormatConstant.YYYY_MM_DD_HH_MM_SS_SSS);
				final var validToDateStr	= DateTimeUtility.getDateTimeFromStr(entry.getKey().split("_")[1], DateTimeFormatConstant.YYYY_MM_DD_HH_MM_SS_SSS);
	
				if (validFromDateStr != null && aReportModel.getBookedDate().after(validFromDateStr)
						&& validToDateStr != null && aReportModel.getBookedDate().before(validToDateStr))
					rateWiseTDSHM.put(entry.getValue(), rateWiseTDSHM.getOrDefault(entry.getValue(), 0.0) + aReportModel.getBookingCommission() * entry.getValue() / 100 );
			}
		request.setAttribute("rateWiseTDSHM", rateWiseTDSHM);
	}

	private void getDeductedTdsRateWiseBookingCommission(Map<String, Double> dateWiseTDSHM, DailyBranchCollectionReportModel aReportModel,final Map<Double, Double> rateWiseTDSHM, final HttpServletRequest request) throws Exception {
		if(dateWiseTDSHM != null)
			for (final Map.Entry<String, Double> entry : dateWiseTDSHM.entrySet()) {
				final var validFromDateStr	= DateTimeUtility.getDateTimeFromStr(entry.getKey().split("_")[0], DateTimeFormatConstant.YYYY_MM_DD_HH_MM_SS_SSS);
				final var validToDateStr	= DateTimeUtility.getDateTimeFromStr(entry.getKey().split("_")[1], DateTimeFormatConstant.YYYY_MM_DD_HH_MM_SS_SSS);
	
				if (validFromDateStr != null && aReportModel.getBookedDate().after(validFromDateStr)
						&& validToDateStr != null && aReportModel.getBookedDate().before(validToDateStr))
					rateWiseTDSHM.put(entry.getValue(), rateWiseTDSHM.getOrDefault(entry.getValue(), 0.0) - aReportModel.getBookingCommission() * entry.getValue() / 100 );
			}
		request.setAttribute("rateWiseTDSHM", rateWiseTDSHM);
	}
}
