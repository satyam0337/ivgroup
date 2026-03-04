package com.ivcargo.reports;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.StringJoiner;
import java.util.TreeMap;
import java.util.function.Function;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.ObjectUtils;

import com.businesslogic.displaydata.DisplayDataConfigurationBll;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.dao.impl.TDSForGroupDaoImpl;
import com.iv.dto.constant.CargoAccountGroupConstant;
import com.iv.dto.constant.ExecutiveTypeConstant;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.dto.tds.TDSForGroup;
import com.iv.utils.CollectionUtility;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.constant.AccountGroupConstant;
import com.iv.utils.constant.Constant;
import com.iv.utils.constant.DateTimeFormatConstant;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.exception.ExceptionProcess;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.BranchCommissionDao;
import com.platform.dao.BranchExpenseDao;
import com.platform.dao.ChargeTypeMasterDao;
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

public class DailyBranchCollectionSummaryReportActionSRSTravels implements Action{

	@Override
	@SuppressWarnings({ "unchecked" })
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String, Object>						error 														= null;
		Executive        							executive       											= null;
		SimpleDateFormat 							sdf             											= null;
		Timestamp        							fromDate        											= null;
		Timestamp        							toDate          											= null;
		Branch[]    								branches  													= null;
		CacheManip 									cache 														= null;
		ValueObject									objectIn													= null;
		ValueObject									objectOut													= null;
		Long[] 										wayBillIdArray												= null;
		WayBillCharges[]							wayBillCharges												= null;
		WayBillType									wayBillType													= null;
		WayBillTaxTxn[]								wayBillTax													= null;
		ChargeTypeModel[]							bookingCharges												= null;
		ChargeTypeModel[]							deliveryCharges												= null;
		Branch										branch														= null;
		ReportViewModel								reportViewModel 											= null;
		WayBillExpenseModel[]						wayBillExpenseModel											= null;
		DailyBranchCollectionReportModel[]			reportModel													= null;
		HashMap<String, WayBillCategoryTypeDetails>	wbCategoryTypeDetails										= null;
		HashMap<String, WayBillCategoryTypeDetails>	deliveredWayBillDetails										= null;
		HashMap<String, Double>						bookedWayBillCategoryTypeDetails							= null;
		HashMap<Long, Object>						storeCityWiseToPayeeDetails									= null;
		HashMap<Long, Object>						cityWiseToPayeeDetails										= null;
		CityWiseCollectionModel						cityWiseCollectionModel										= null;
		HashMap<Long, CityWiseCollectionModel>		cityWiseDetails												= null;
		HashMap<Long, WayBillDeatailsModel>			wayBillDetails												= null;
		WayBillCategoryTypeDetails					wayBillCategoryTypeDetails									= null;
		HashMap<Long, Double>						chargesCollection											= null;
		WayBillCategoryTypeDetails					wbCategoryTypeDetailsForDlvrd								= null;
		Long[]										wayBillIdsForGroupSharingChargesArr							= null;
		String										wayBillIdsForGroupSharingCharges							= null;
		HashMap<Long, Double> 						groupSharingChargesMap										= null;
		Timestamp									createDate													= null;
		ValueObject									displayDataConfig											= null;
		ValueObject									valueObjectIn												= null;
		ValueObject									configuration												= null;
		var 										branchId 													= 0L;
		var 										selectedCity												= 0L;
		var 										destinationCityId											= 0L;
		var 										totalBookingGrandAmount 									= 0D;
		var 										totalCancellationGrandAmount 								= 0D;
		var 										totalDeliverGrandAmount 									= 0D;
		var 										toPayCommissionToBeLess 									= 0D;
		var 										totalDeliverOctroiAmount 									= 0D;
		var 										totalDeliverOtherAmount 									= 0D;
		var 									doNotShow_Disc 												= false; // if any disc found then column will be generated for disc in report
		var 									doNotShow_Tax 												= false;  // if any tax found then column will be generated for tax in report
		var 									doNotShow_Commission 										= false; // if any commission found then column will be generated for commission in report
		var										isDonotShowWayBillTypeWiseData								= false;
		var										showBookingFreightAmount									= false;
		var 										paidLoadingTotalAmt 										= 0.00;
		var 										totalTax 													= 0.00;
		var 										totalDiscount 												= 0.00;
		var 										accountId 													= 0L;
		var										showBookingCommissionColumn									= false;
		var										showDeliveryCommissionColumn								= false;
		ValueObject									objectOutVal												= null;
		HashMap<Short, Double> 						branchCommisionHM											= null;
		Branch										branchObj													= null;
		var 									isAgentBranch												= false;
		var										showBookingDeliveryCommissionRate							= false;
		var										isBranchWiseBookingCommissionCalculationAllowed				= false;
		var										isBranchWiseDeliveryCommissionCalculationAllowed			= false;
		var										calculateBookingCommission									= true;
		var										calculateDeliveryCommission									= true;
		var										showTotalNoOfArticlesColumn									= false;
		var 										totalBookingChequeTotal 									= 0D;
		var 										totalDeliveryChequeTotal 									= 0D;
		var										showCashCollectionInReport									= false;
		var										showCreditDetailsColumn										= false;
		var 										totalDeliveryBillCreditTotal 								= 0D;
		var 										totalDeliverBillCreditOctroiAmount							= 0D;
		var 										totalDeliverBillCreditOtherAmount							= 0D;
		var										showDeliveryLRAtDestination									= false;
		var								        deliveryArticleWiseSummary	                                = false;
		List<DailyBranchCollectionReportModel>		otherBranchBookinglist										= null;
		Map<Long, String> 							chargeNameHM												= null;
		Map<Long, Map<Long, Double>> 				otherBranchbookingChargs 									= null;
		Map<String, DailyBranchCollectionReportModel> wayBillTypeIdWiseHm 										= null;
		Map<Long, Double> 							otherBranchFooterHM 										= null;
		Map<Long, DailyBranchCollectionReportModel> otherBranchFinalHm 											= null;
		List<DailyBranchCollectionReportModel> 		wayBillIdWiseList 											= null;
		var										showIncomingDetails											= false;
		var										showBookingHandlingAmount									= false;
		var										showBookingTimeTaxInDeliveryDetails							= false;
		HashMap<Long, WayBillDeatailsModel>			wayBillDlyDetails										= null;
		WayBillTaxTxn[]								wayBillDlyTax											= null;
		var										calculateTdsOnFinancialYear									= false;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeDailyBranchCollectionReportAction().execute(request, response);


			sdf             	= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			fromDate        	= new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00").getTime());
			toDate          	= new Timestamp(sdf.parse(JSPUtility.GetString(request, "toDate") + " 23:59:59").getTime());
			createDate 			= new Timestamp(new Date().getTime());
			destinationCityId	= JSPUtility.GetLong(request, "TosubRegion",0);

			cache 				= new CacheManip(request);
			executive       	= cache.getExecutive(request);

			// Get the Selected  Combo values
			if(request.getParameter("subRegion") != null)
				selectedCity  	=  Long.parseLong(JSPUtility.GetString(request, "subRegion")) ;

			configuration					= ReadAllConfigurationsBllImpl.getInstance().getOldReportConfigurationData(ReportIdentifierConstant.DAILY_BRANCH_COLLECTION_REPORT, executive.getAccountGroupId());

			showBookingFreightAmount 			= configuration.getBoolean(DailyBranchCollectionReportConfigurationDTO.SHOW_BOOKING_FREIGHT_AMOUNT);
			showBookingCommissionColumn			= PropertiesUtility.isAllow(configuration.getString(DailyBranchCollectionReportConfigurationDTO.SHOW_BOOKING_COMMISSION_COLUMN,"false"));
			showDeliveryCommissionColumn		= PropertiesUtility.isAllow(configuration.getString(DailyBranchCollectionReportConfigurationDTO.SHOW_DELIVERY_COMMISSION_COLUMN,"false"));
			showBookingDeliveryCommissionRate	= PropertiesUtility.isAllow(configuration.getString(DailyBranchCollectionReportConfigurationDTO.SHOW_BOOKING_DELIVERY_COMMISSION_RATE,"false"));
			showCreditDetailsColumn				= configuration.getBoolean(DailyBranchCollectionReportConfigurationDTO.SHOW_CREDIT_DETAILS_COLUMN,false);
			showIncomingDetails					= configuration.getBoolean(DailyBranchCollectionReportConfigurationDTO.SHOW_INCOMING_DETAILS,false);
			showBookingHandlingAmount 			= configuration.getBoolean(DailyBranchCollectionReportConfigurationDTO.SHOW_BOOKING_HANDLING_AMOUNT);
			showBookingTimeTaxInDeliveryDetails	= configuration.getBoolean(DailyBranchCollectionReportConfigurationDTO.SHOW_BOOKING_TIME_SERVICE_TAX_IN_DELIVERYDETAILS);
			final var	showTotalPaidDDCharge	= configuration.getBoolean(DailyBranchCollectionReportConfigurationDTO.SHOW_TOTAL_PAID_DD_CHARGE,false);

			request.setAttribute("showBookingCommissionColumn", showBookingCommissionColumn);
			request.setAttribute("showDeliveryCommissionColumn", showDeliveryCommissionColumn);
			request.setAttribute("showBookingDeliveryCommissionRate", showBookingDeliveryCommissionRate);
			request.setAttribute("showCreditDetailsColumn", showCreditDetailsColumn);

			isBranchWiseBookingCommissionCalculationAllowed	 	= configuration.getBoolean(DailyBranchCollectionReportConfigurationDTO.IS_BRANCH_WISE_BOOKING_COMMISSION_CALCULATION_ALLOWED,false);
			isBranchWiseDeliveryCommissionCalculationAllowed	= configuration.getBoolean(DailyBranchCollectionReportConfigurationDTO.IS_BRANCH_WISE_DELIVERY_COMMISSION_CALCULATION_ALLOWED, false);
			showTotalNoOfArticlesColumn 						= configuration.getBoolean(DailyBranchCollectionReportConfigurationDTO.SHOW_TOTAL_NO_OF_ARTICLES_COLUMN, false);
			showCashCollectionInReport							= configuration.getBoolean(DailyBranchCollectionReportConfigurationDTO.SHOW_CASH_COLLECTION_IN_REPORT,false);
			displayDataConfig									= cache.getDisplayDataConfiguration(request, executive.getAccountGroupId());
			isDonotShowWayBillTypeWiseData						= PropertiesUtility.isAllow(displayDataConfig.getString(DisplayDataConfigurationDTO.IS_DONOT_SHOW_WAY_BILL_TYPE_WISE_DATA_IN_REPORTS, "false"));
			showDeliveryLRAtDestination							= displayDataConfig.getBoolean(DisplayDataConfigurationDTO.SHOW_DELIVER_LR_AT_DESTINATION, false);
			deliveryArticleWiseSummary							= configuration.getBoolean(DailyBranchCollectionReportConfigurationDTO.DELIVERY_ARTICLE_WISE_SUMMARY, false);
			calculateTdsOnFinancialYear							= configuration.getBoolean(DailyBranchCollectionReportConfigurationDTO.CALCULATE_TDS_ON_FINANCIAL_YEAR, false);

			//Get all Branches
			branches 		= cache.getBranchesArrayBySubRegionId(request, executive.getAccountGroupId(), selectedCity);
			request.setAttribute("branches", branches);
			request.setAttribute("showBookingFreightAmount", showBookingFreightAmount);
			request.setAttribute("showTotalNoOfArticlesColumn", showTotalNoOfArticlesColumn);
			request.setAttribute("showBookingHandlingAmount", showBookingHandlingAmount);
			request.setAttribute("showBookingTimeTaxInDeliveryDetails", showBookingTimeTaxInDeliveryDetails);
			request.setAttribute("showTotalPaidDDCharge", showTotalPaidDDCharge);


			// Get All Executives

			if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_EXECUTIVE || executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_BRANCHADMIN
					|| executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_LIMITED
					|| executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_REGIONADMIN || executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_SUBREGIONADMIN)
				branchId 	= executive.getBranchId();
			else if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN)
				branchId 	= Long.parseLong(request.getParameter("branch"));

			if(isBranchWiseBookingCommissionCalculationAllowed) {
				final var bookingBranchIdList			= CollectionUtility.getLongListFromString(configuration.getString(DailyBranchCollectionReportConfigurationDTO.BOOKING_BRANCH_IDS_TO_AVOID_COMMISSION_CALCULATION));

				if(bookingBranchIdList.contains(branchId))
					calculateBookingCommission		= false;
			}

			if(isBranchWiseDeliveryCommissionCalculationAllowed) {
				final var deliveryBranchIdList			= CollectionUtility.getLongListFromString(configuration.getString(DailyBranchCollectionReportConfigurationDTO.DELIVERY_BRANCH_IDS_TO_AVOID_COMMISSION_CALCULATION));

				if(deliveryBranchIdList.contains(branchId))
					calculateDeliveryCommission		= false;
			}

			if(deliveryArticleWiseSummary) {
				final var branchIds	= configuration.getString(DailyBranchCollectionReportConfigurationDTO.BRANCH_IDS_FOR_DELIVERY_ARTICLE_WISE_SUMMARY, "0");

				if(!"0".equals(branchIds))
					deliveryArticleWiseSummary  	= CollectionUtility.getLongListFromString(branchIds).contains(branchId);
			}

			final var	branchWiseShowCommissionTable	= configuration.getBoolean(DailyBranchCollectionReportConfigurationDTO.BRANCH_WISE_SHOW_COMMISSION_TABLE, false);

			final var	showCommissionTable	= branchWiseShowCommissionTable && CollectionUtility.getLongListFromString(configuration.getString(DailyBranchCollectionReportConfigurationDTO.BRANCH_IDS_TO_SHOW_COMMISSION_TABLE, "0")).contains(branchId);

			request.setAttribute("subRegion", selectedCity);
			request.setAttribute("branch", branchId);
			request.setAttribute("calculateBookingCommission", calculateBookingCommission);
			request.setAttribute("calculateDeliveryCommission", calculateDeliveryCommission);
			request.setAttribute("showCommissionTable", showCommissionTable);
			request.setAttribute(DailyBranchCollectionReportConfigurationDTO.DELIVERY_ARTICLE_WISE_SUMMARY, deliveryArticleWiseSummary);

			objectIn							= new ValueObject();
			objectOut							= new ValueObject();
			objectOutVal						= new ValueObject();
			wbCategoryTypeDetails 				= new HashMap<>();
			storeCityWiseToPayeeDetails 		= new LinkedHashMap<>();
			cityWiseDetails 					= new LinkedHashMap<>();
			bookedWayBillCategoryTypeDetails 	= new HashMap<>();
			deliveredWayBillDetails 			= new HashMap<>();
			valueObjectIn						= new ValueObject();

			objectIn.put("fromDate", fromDate);
			objectIn.put("toDate", toDate);
			objectIn.put("branchId", branchId);
			objectIn.put("accountGroupId", executive.getAccountGroupId());
			objectIn.put("filter", 1);
			objectIn.put("TosubRegion", destinationCityId);

			final var	tdsForGroup = new TDSForGroup();
			tdsForGroup.setAccountGroupId(executive.getAccountGroupId());
			tdsForGroup.setValidFrom(fromDate);
			tdsForGroup.setValidTill(toDate);

			var	tdsForGroupList  = TDSForGroupDaoImpl.getInstance().getTdsForGroup(tdsForGroup, (short) 0);

			if(!calculateTdsOnFinancialYear) {
				final var	tdsForGroupList1 = TDSForGroupDaoImpl.getInstance().getTdsForGroup(tdsForGroup, (short) 1);

				if (ObjectUtils.isNotEmpty(tdsForGroupList1)) {
					if(ObjectUtils.isEmpty(tdsForGroupList))
						tdsForGroupList	= new ArrayList<>();

					tdsForGroupList.addAll(tdsForGroupList1);
				}
			}

			Map<String, Double> dateWiseTDSHM	= new HashMap<>();
			final Map<Double, Double> rateWiseTDSHM	= new HashMap<>();

			if(tdsForGroupList != null && calculateTdsOnFinancialYear)
				dateWiseTDSHM	= tdsForGroupList.stream().collect(Collectors.toMap(TDSForGroup::getValidFromToDate, TDSForGroup::getTdsRate, (e1, e2) -> e1, HashMap::new));

			request.setAttribute("tdsForGroupList", tdsForGroupList);

			if(destinationCityId == 0)
				objectOut	= DailyBranchCollectionDAO.getInstance().getReportForBranch(objectIn);
			else
				objectOut	= DailyBranchCollectionDAO.getInstance().getReportDestinationWise(objectIn);

			branchObj = cache.getGenericBranchDetailCache(request, branchId);
			if(branchObj != null && branchObj.isAgentBranch() && showBookingDeliveryCommissionRate){
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
				wayBillExpenseModel 	= (WayBillExpenseModel[]) objectOut.get("WayBillExpenseModel");

				request.setAttribute("WayBillExpenseModel", wayBillExpenseModel);
			}

			reportViewModel = new ReportViewModel();
			reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);

			request.setAttribute("ReportViewModel", reportViewModel);

			//City Wise ToPayee Details code

			//City Wise ToPayee Details code

			if(reportModel != null && wayBillIdArray != null) {

				//Condition For Group Sharing Charges. SRS should Not see Receipt Charge Of Southern
				wayBillIdsForGroupSharingChargesArr 	= (Long[]) objectOut.get("wayBillIdsForGroupSharingChargesArr");

				if(wayBillIdsForGroupSharingChargesArr != null) {
					wayBillIdsForGroupSharingCharges 	= Utility.GetLongArrayToString(wayBillIdsForGroupSharingChargesArr);
					groupSharingChargesMap 				= WayBillDeliveryChargesDao.getInstance().getWayBillChargeMapByWayBillIdsAndChargeMasterId(wayBillIdsForGroupSharingCharges, ChargeTypeMaster.RECEIPT);
				}
				final var	showDeliveryTax	= configuration.getBoolean(DailyBranchCollectionReportConfigurationDTO.SHOW_DELIVERY_TAX, false);

				//Get WayBill Details code ( Start )
				wayBillDetails = WayBillDetailsDAO.getInstance().getWayBillDetails(wayBillIdArray, true, ChargeTypeMaster.WAYBILL_CHARGETYPE_BOTH, true, WayBillTaxTxn.WAYBILL_TAX_TXN_TYPE_BOOKING, false);
				//Get WayBill Details code ( End )

				if(showDeliveryTax)
					wayBillDlyDetails = WayBillDetailsDAO.getInstance().getWayBillDetails(wayBillIdArray, true, ChargeTypeMaster.WAYBILL_CHARGETYPE_BOTH, true, WayBillTaxTxn.WAYBILL_TAX_TXN_TYPE_DELIVERY, false);

				for (final DailyBranchCollectionReportModel aReportModel : reportModel) {
					if (isDonotShowWayBillTypeWiseData) {
						valueObjectIn.put(AliasNameConstants.CURRENT_DATE_TIMESTAMP, createDate);
						valueObjectIn.put(AliasNameConstants.WAYBILL_TYPE_ID, aReportModel.getWayBillTypeId());
						valueObjectIn.put(AliasNameConstants.SOURCE_BRANCH_ID, aReportModel.getWayBillSourceBranchId());
						valueObjectIn.put(AliasNameConstants.DATE_TIMESTAMP, aReportModel.getBookedDate());
						valueObjectIn.put(AliasNameConstants.EXECUTIVE_ID, executive.getExecutiveId());
						valueObjectIn.put(AliasNameConstants.WAYBILL_STATUS_ID, aReportModel.getStatus());
						valueObjectIn.put(AliasNameConstants.IS_SHOW_WAYBILL, aReportModel.isShowWayBill());
						valueObjectIn.put(DisplayDataConfigurationDTO.SHOW_DELIVER_LR_AT_DESTINATION, showDeliveryLRAtDestination);
						valueObjectIn.put(Constant.REPORT_ID, ReportIdentifierConstant.DAILY_BRANCH_COLLECTION_REPORT);

						if(DisplayDataConfigurationBll.getInstance().isDisplayWayBillTypeWiseData(displayDataConfig, valueObjectIn))
							continue;
					}

					//Condition For Group Sharing Charges. SRS should Not see Receipt Charge Of Southern
					if(groupSharingChargesMap != null && groupSharingChargesMap.get(aReportModel.getWayBillId()) != null && (aReportModel.getStatus() == WayBill.WAYBILL_STATUS_DELIVERED || aReportModel.getStatus() == WayBill.WAYBILL_STATUS_CREDIT_DELIVERED || aReportModel.getStatus() == WayBill.WAYBILL_STATUS_DUEDELIVERED || aReportModel.getStatus() == WayBill.WAYBILL_STATUS_DUEUNDELIVERED)) {
						aReportModel.setDeliveryAmount(aReportModel.getDeliveryAmount() - groupSharingChargesMap.get(aReportModel.getWayBillId()));
						aReportModel.setGrandTotal(aReportModel.getGrandTotal() - groupSharingChargesMap.get(aReportModel.getWayBillId()));
					}

					//set flag for commission column generation
					if(aReportModel.getAgentCommission() > 0)
						doNotShow_Commission 	= true;

					paidLoadingTotalAmt = 0.00;

					// Set City & Branch name
					aReportModel.setWayBillSourceSubRegion(cache.getGenericSubRegionById(request, aReportModel.getWayBillSourceSubRegionId()).getName());
					aReportModel.setWayBillSourceBranch(cache.getGenericBranchDetailCache(request, aReportModel.getWayBillSourceBranchId()).getName());
					aReportModel.setWayBillDestinationSubRegion(cache.getGenericSubRegionById(request, aReportModel.getWayBillDestinationSubRegionId()).getName());
					aReportModel.setWayBillDestinationBranch(cache.getGenericBranchDetailCache(request, aReportModel.getWayBillDestinationBranchId()).getName());
					// Set City & Branch name

					// Set WayBill Type Name
					wayBillType 	= cache.getWayBillTypeById(request, aReportModel.getWayBillTypeId());

					if(aReportModel.isManual())
						aReportModel.setWayBillType(wayBillType.getWayBillType()+WayBillType.WAYBILL_TYPE_MANUAL);
					else aReportModel.setWayBillType(wayBillType.getWayBillType());

					//WayBill Charges (Booking & Delivery)

					wayBillCharges  	= wayBillDetails.get(aReportModel.getWayBillId()).getWayBillCharges();

					for (final WayBillCharges wayBillCharge : wayBillCharges) {
						if(aReportModel.getStatus() != WayBillStatusConstant.WAYBILL_STATUS_DELIVERED && wayBillCharge.getChargeType() == ChargeTypeMaster.WAYBILL_CHARGETYPE_BOOKING)
							bookedWayBillCategoryTypeDetails.put(Long.toString(wayBillCharge.getWayBillChargeMasterId()), wayBillCharge.getChargeAmount());

						if(aReportModel.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DELIVERED && wayBillCharge.getChargeType() == ChargeTypeMaster.WAYBILL_CHARGETYPE_DELIVERY)
							bookedWayBillCategoryTypeDetails.put(Long.toString(wayBillCharge.getWayBillChargeMasterId()), wayBillCharge.getChargeAmount());

						if(aReportModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY
								&& (wayBillCharge.getWayBillChargeMasterId() == ChargeTypeMaster.PAID_LOADING || wayBillCharge.getWayBillChargeMasterId() == ChargeTypeMaster.PAID_HAMALI)
								&& wayBillCharge.getChargeAmount() > 0)
							paidLoadingTotalAmt 	= wayBillCharge.getChargeAmount();
					}

					aReportModel.setChargesCollection(bookedWayBillCategoryTypeDetails);
					//end

					//Calculate Total booking WayBill Tax
					wayBillTax 		= wayBillDetails.get(aReportModel.getWayBillId()).getWayBillTaxTxn();
					totalTax		= 0.00;

					for (final WayBillTaxTxn element : wayBillTax)
						totalTax 	+= element.getTaxAmount();

					if(totalTax > 0)
						doNotShow_Tax 	= true;

					totalTax = Math.round(totalTax);
					aReportModel.setTotalTax(totalTax);

					//Calculate Total Delivery WayBill Tax
					if(wayBillDlyDetails !=null)
						wayBillDlyTax 	= wayBillDlyDetails.get(aReportModel.getWayBillId()).getWayBillTaxTxn();

					var totalDlyTax 				= 0.00;

					if(wayBillDlyTax !=null)
						for (final WayBillTaxTxn element : wayBillDlyTax)
							totalDlyTax = totalDlyTax + element.getTaxAmount();

					totalDlyTax = Math.round(totalDlyTax);
					aReportModel.setTotalDlyTax(totalDlyTax);
					//end

					//Calculate Total Discount
					if(aReportModel.isDiscountPercent())
						totalDiscount = Math.round(aReportModel.getAmount() * aReportModel.getDiscount() / 100);
					else
						totalDiscount = aReportModel.getDiscount();

					aReportModel.setDiscount(totalDiscount);

					if(totalDiscount > 0)
						doNotShow_Disc 	= true;

					if(aReportModel.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_BOOKED ) {
						if(aReportModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID) {
							//City Wise Paid Details code
							cityWiseToPayeeDetails 	= (HashMap<Long, Object>) storeCityWiseToPayeeDetails.get(aReportModel.getDestinationSubRegionId());

							if(cityWiseToPayeeDetails == null) {
								cityWiseToPayeeDetails = new LinkedHashMap<>();

								cityWiseCollectionModel = (CityWiseCollectionModel) cityWiseToPayeeDetails.get(aReportModel.getDestinationBranchId());

								if(cityWiseCollectionModel == null) {
									cityWiseCollectionModel = new CityWiseCollectionModel();

									cityWiseCollectionModel.setBranchId(aReportModel.getDestinationBranchId());
									cityWiseCollectionModel.setBranchName(aReportModel.getWayBillDestinationBranch());
									cityWiseCollectionModel.setSubRegionId(aReportModel.getDestinationSubRegionId());
									cityWiseCollectionModel.setSubRegionName(aReportModel.getWayBillDestinationSubRegion());
									cityWiseCollectionModel.setTotalPaidAmount(aReportModel.getGrandTotal());
									cityWiseCollectionModel.setTotalToPayAmount(0);
									cityWiseCollectionModel.setTotalCreditorAmount(0);
									cityWiseCollectionModel.setQuantity(aReportModel.getNoOfPackages());

									cityWiseToPayeeDetails.put(aReportModel.getDestinationBranchId(), cityWiseCollectionModel);
								} else {
									cityWiseCollectionModel.setTotalPaidAmount(cityWiseCollectionModel.getTotalPaidAmount() + aReportModel.getGrandTotal());
									cityWiseCollectionModel.setTotalToPayAmount(cityWiseCollectionModel.getTotalToPayAmount() + 0);
									cityWiseCollectionModel.setTotalCreditorAmount(cityWiseCollectionModel.getTotalCreditorAmount() + 0);
									cityWiseCollectionModel.setQuantity(cityWiseCollectionModel.getQuantity() + aReportModel.getNoOfPackages());
								}

								storeCityWiseToPayeeDetails.put(aReportModel.getDestinationSubRegionId(), cityWiseToPayeeDetails);
							} else {
								cityWiseCollectionModel = (CityWiseCollectionModel) cityWiseToPayeeDetails.get(aReportModel.getDestinationBranchId());

								if(cityWiseCollectionModel == null) {
									cityWiseCollectionModel = new CityWiseCollectionModel();

									cityWiseCollectionModel.setBranchId(aReportModel.getDestinationBranchId());
									cityWiseCollectionModel.setBranchName(aReportModel.getWayBillDestinationBranch());
									cityWiseCollectionModel.setSubRegionId(aReportModel.getDestinationSubRegionId());
									cityWiseCollectionModel.setSubRegionName(aReportModel.getWayBillDestinationSubRegion());
									cityWiseCollectionModel.setTotalPaidAmount(aReportModel.getGrandTotal());
									cityWiseCollectionModel.setTotalToPayAmount(0);
									cityWiseCollectionModel.setTotalCreditorAmount(0);
									cityWiseCollectionModel.setQuantity(aReportModel.getNoOfPackages());

									cityWiseToPayeeDetails.put(aReportModel.getDestinationBranchId(), cityWiseCollectionModel);
								} else {
									cityWiseCollectionModel.setTotalPaidAmount(cityWiseCollectionModel.getTotalPaidAmount() + aReportModel.getGrandTotal());
									cityWiseCollectionModel.setTotalToPayAmount(cityWiseCollectionModel.getTotalToPayAmount() + 0);
									cityWiseCollectionModel.setTotalCreditorAmount(cityWiseCollectionModel.getTotalCreditorAmount() + 0);
									cityWiseCollectionModel.setQuantity(cityWiseCollectionModel.getQuantity() + aReportModel.getNoOfPackages());
								}

							}
							//City Wise Paid Details code
						} else if(aReportModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY) {
							//City Wise ToPayee Details code
							cityWiseToPayeeDetails 	= (HashMap<Long, Object>)storeCityWiseToPayeeDetails.get(aReportModel.getDestinationSubRegionId());

							if(cityWiseToPayeeDetails == null) {
								cityWiseToPayeeDetails = new LinkedHashMap<>();

								cityWiseCollectionModel = (CityWiseCollectionModel) cityWiseToPayeeDetails.get(aReportModel.getDestinationBranchId());

								if(cityWiseCollectionModel == null) {
									cityWiseCollectionModel = new CityWiseCollectionModel();

									cityWiseCollectionModel.setBranchId(aReportModel.getDestinationBranchId());
									cityWiseCollectionModel.setBranchName(aReportModel.getWayBillDestinationBranch());
									cityWiseCollectionModel.setSubRegionId(aReportModel.getDestinationSubRegionId());
									cityWiseCollectionModel.setSubRegionName(aReportModel.getWayBillDestinationSubRegion());
									cityWiseCollectionModel.setTotalPaidAmount(0);
									cityWiseCollectionModel.setTotalCreditorAmount(0);
									cityWiseCollectionModel.setTotalToPayAmount(aReportModel.getGrandTotal() + aReportModel.getAgentCommission() - paidLoadingTotalAmt);
									cityWiseCollectionModel.setQuantity(aReportModel.getNoOfPackages());

									cityWiseToPayeeDetails.put(aReportModel.getDestinationBranchId(), cityWiseCollectionModel);
								} else {
									cityWiseCollectionModel.setTotalPaidAmount(cityWiseCollectionModel.getTotalPaidAmount() + 0);
									cityWiseCollectionModel.setTotalCreditorAmount(cityWiseCollectionModel.getTotalCreditorAmount() + 0);
									cityWiseCollectionModel.setTotalToPayAmount(cityWiseCollectionModel.getTotalToPayAmount() + aReportModel.getGrandTotal() + aReportModel.getAgentCommission() - paidLoadingTotalAmt);
									cityWiseCollectionModel.setQuantity(cityWiseCollectionModel.getQuantity() + aReportModel.getNoOfPackages());
								}

								storeCityWiseToPayeeDetails.put(aReportModel.getDestinationSubRegionId(), cityWiseToPayeeDetails);
							} else {
								cityWiseCollectionModel 	= (CityWiseCollectionModel) cityWiseToPayeeDetails.get(aReportModel.getDestinationBranchId());

								if(cityWiseCollectionModel == null) {
									cityWiseCollectionModel 	= new CityWiseCollectionModel();

									cityWiseCollectionModel.setBranchId(aReportModel.getDestinationBranchId());
									cityWiseCollectionModel.setBranchName(aReportModel.getWayBillDestinationBranch());
									cityWiseCollectionModel.setSubRegionId(aReportModel.getDestinationSubRegionId());
									cityWiseCollectionModel.setSubRegionName(aReportModel.getWayBillDestinationSubRegion());
									cityWiseCollectionModel.setTotalPaidAmount(0);
									cityWiseCollectionModel.setTotalCreditorAmount(0);
									cityWiseCollectionModel.setTotalToPayAmount(aReportModel.getGrandTotal() + aReportModel.getAgentCommission() - paidLoadingTotalAmt);
									cityWiseCollectionModel.setQuantity(aReportModel.getNoOfPackages());

									cityWiseToPayeeDetails.put(aReportModel.getDestinationBranchId(), cityWiseCollectionModel);
								} else {
									cityWiseCollectionModel.setTotalPaidAmount(cityWiseCollectionModel.getTotalPaidAmount() + 0);
									cityWiseCollectionModel.setTotalCreditorAmount(cityWiseCollectionModel.getTotalCreditorAmount() + 0);
									cityWiseCollectionModel.setTotalToPayAmount(cityWiseCollectionModel.getTotalToPayAmount() + aReportModel.getGrandTotal() + aReportModel.getAgentCommission() - paidLoadingTotalAmt);
									cityWiseCollectionModel.setQuantity(cityWiseCollectionModel.getQuantity() + aReportModel.getNoOfPackages());
								}
							}
							//City Wise ToPayee Details code
						} else if(aReportModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT && showCreditDetailsColumn) {
							//City Wise Paid Details code
							cityWiseToPayeeDetails 	= (HashMap<Long, Object>) storeCityWiseToPayeeDetails.get(aReportModel.getDestinationSubRegionId());

							if(cityWiseToPayeeDetails == null) {
								cityWiseToPayeeDetails = new LinkedHashMap<>();

								cityWiseCollectionModel = (CityWiseCollectionModel) cityWiseToPayeeDetails.get(aReportModel.getDestinationBranchId());

								if(cityWiseCollectionModel == null) {
									cityWiseCollectionModel = new CityWiseCollectionModel();

									cityWiseCollectionModel.setBranchId(aReportModel.getDestinationBranchId());
									cityWiseCollectionModel.setBranchName(aReportModel.getWayBillDestinationBranch());
									cityWiseCollectionModel.setSubRegionId(aReportModel.getDestinationSubRegionId());
									cityWiseCollectionModel.setSubRegionName(aReportModel.getWayBillDestinationSubRegion());
									cityWiseCollectionModel.setTotalCreditorAmount(aReportModel.getGrandTotal());
									cityWiseCollectionModel.setTotalPaidAmount(0);
									cityWiseCollectionModel.setTotalToPayAmount(0);
									cityWiseCollectionModel.setQuantity(aReportModel.getNoOfPackages());

									cityWiseToPayeeDetails.put(aReportModel.getDestinationBranchId(), cityWiseCollectionModel);
								} else {
									cityWiseCollectionModel.setTotalCreditorAmount(cityWiseCollectionModel.getTotalCreditorAmount() + aReportModel.getGrandTotal());
									cityWiseCollectionModel.setTotalToPayAmount(cityWiseCollectionModel.getTotalToPayAmount() + 0);
									cityWiseCollectionModel.setTotalPaidAmount(cityWiseCollectionModel.getTotalPaidAmount() + 0);
									cityWiseCollectionModel.setQuantity(cityWiseCollectionModel.getQuantity() + aReportModel.getNoOfPackages());
								}

								storeCityWiseToPayeeDetails.put(aReportModel.getDestinationSubRegionId(), cityWiseToPayeeDetails);
							} else {
								cityWiseCollectionModel = (CityWiseCollectionModel) cityWiseToPayeeDetails.get(aReportModel.getDestinationBranchId());

								if(cityWiseCollectionModel == null) {
									cityWiseCollectionModel = new CityWiseCollectionModel();

									cityWiseCollectionModel.setBranchId(aReportModel.getDestinationBranchId());
									cityWiseCollectionModel.setBranchName(aReportModel.getWayBillDestinationBranch());
									cityWiseCollectionModel.setSubRegionId(aReportModel.getDestinationSubRegionId());
									cityWiseCollectionModel.setSubRegionName(aReportModel.getWayBillDestinationSubRegion());
									cityWiseCollectionModel.setTotalCreditorAmount(aReportModel.getGrandTotal());
									cityWiseCollectionModel.setTotalToPayAmount(0);
									cityWiseCollectionModel.setTotalPaidAmount(0);
									cityWiseCollectionModel.setQuantity(aReportModel.getNoOfPackages());

									cityWiseToPayeeDetails.put(aReportModel.getDestinationBranchId(), cityWiseCollectionModel);
								} else {
									cityWiseCollectionModel.setTotalCreditorAmount(cityWiseCollectionModel.getTotalCreditorAmount() + aReportModel.getGrandTotal());
									cityWiseCollectionModel.setTotalToPayAmount(cityWiseCollectionModel.getTotalToPayAmount() + 0);
									cityWiseCollectionModel.setTotalPaidAmount(cityWiseCollectionModel.getTotalPaidAmount() + 0);
									cityWiseCollectionModel.setQuantity(cityWiseCollectionModel.getQuantity() + aReportModel.getNoOfPackages());
								}
							}
						}
					} else if(aReportModel.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CANCELLED)
						if(aReportModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY) {
							cityWiseToPayeeDetails = (HashMap<Long, Object>) storeCityWiseToPayeeDetails.get(aReportModel.getDestinationSubRegionId());

							if(cityWiseToPayeeDetails == null) {
								cityWiseToPayeeDetails 		= new LinkedHashMap<>();

								cityWiseCollectionModel = (CityWiseCollectionModel) cityWiseToPayeeDetails.get(aReportModel.getDestinationBranchId());

								if(cityWiseCollectionModel == null) {
									cityWiseCollectionModel = new CityWiseCollectionModel();

									cityWiseCollectionModel.setBranchId(aReportModel.getDestinationBranchId());
									cityWiseCollectionModel.setBranchName(aReportModel.getWayBillDestinationBranch());
									cityWiseCollectionModel.setSubRegionId(aReportModel.getDestinationSubRegionId());
									cityWiseCollectionModel.setSubRegionName(aReportModel.getWayBillDestinationSubRegion());
									cityWiseCollectionModel.setTotalPaidAmount(-0);
									cityWiseCollectionModel.setTotalCreditorAmount(-0);
									cityWiseCollectionModel.setTotalToPayAmount( - (aReportModel.getGrandTotal() + aReportModel.getAgentCommission() - paidLoadingTotalAmt));
									cityWiseCollectionModel.setQuantity(- aReportModel.getNoOfPackages());

									cityWiseToPayeeDetails.put(aReportModel.getDestinationBranchId(), cityWiseCollectionModel);
								} else {
									cityWiseCollectionModel.setTotalPaidAmount(cityWiseCollectionModel.getTotalPaidAmount() - 0);
									cityWiseCollectionModel.setTotalCreditorAmount(cityWiseCollectionModel.getTotalCreditorAmount() - 0);
									cityWiseCollectionModel.setTotalToPayAmount(cityWiseCollectionModel.getTotalToPayAmount() - (aReportModel.getGrandTotal() + aReportModel.getAgentCommission() - paidLoadingTotalAmt));
									cityWiseCollectionModel.setQuantity(cityWiseCollectionModel.getQuantity() - aReportModel.getNoOfPackages());
								}

								storeCityWiseToPayeeDetails.put(aReportModel.getDestinationSubRegionId(), cityWiseToPayeeDetails);
							} else {
								cityWiseCollectionModel = (CityWiseCollectionModel) cityWiseToPayeeDetails.get(aReportModel.getDestinationBranchId());

								if(cityWiseCollectionModel == null) {
									cityWiseCollectionModel 		= new CityWiseCollectionModel();

									cityWiseCollectionModel.setBranchId(aReportModel.getDestinationBranchId());
									cityWiseCollectionModel.setBranchName(aReportModel.getWayBillDestinationBranch());
									cityWiseCollectionModel.setSubRegionId(aReportModel.getDestinationSubRegionId());
									cityWiseCollectionModel.setSubRegionName(aReportModel.getWayBillDestinationSubRegion());
									cityWiseCollectionModel.setTotalPaidAmount(-0);
									cityWiseCollectionModel.setTotalCreditorAmount(-0);
									cityWiseCollectionModel.setTotalToPayAmount( - (aReportModel.getGrandTotal() + aReportModel.getAgentCommission() - paidLoadingTotalAmt));
									cityWiseCollectionModel.setQuantity( - aReportModel.getNoOfPackages());

									cityWiseToPayeeDetails.put(aReportModel.getDestinationBranchId(), cityWiseCollectionModel);
								} else {
									cityWiseCollectionModel.setTotalPaidAmount(cityWiseCollectionModel.getTotalPaidAmount() - 0);
									cityWiseCollectionModel.setTotalCreditorAmount(cityWiseCollectionModel.getTotalCreditorAmount() - 0);
									cityWiseCollectionModel.setTotalToPayAmount(cityWiseCollectionModel.getTotalToPayAmount() - (aReportModel.getGrandTotal() + aReportModel.getAgentCommission() - paidLoadingTotalAmt));
									cityWiseCollectionModel.setQuantity(cityWiseCollectionModel.getQuantity() - aReportModel.getNoOfPackages());
								}
							}
						} else if(aReportModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID) {
							cityWiseToPayeeDetails 	= (HashMap<Long, Object>) storeCityWiseToPayeeDetails.get(aReportModel.getDestinationSubRegionId());

							if(cityWiseToPayeeDetails == null) {
								cityWiseToPayeeDetails 	= new LinkedHashMap<>();

								cityWiseCollectionModel = (CityWiseCollectionModel) cityWiseToPayeeDetails.get(aReportModel.getDestinationBranchId());

								if(cityWiseCollectionModel == null) {
									if(!showCashCollectionInReport || aReportModel.getPaymentTypeId() != PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID) {
										cityWiseCollectionModel 	= new CityWiseCollectionModel();

										cityWiseCollectionModel.setBranchId(aReportModel.getDestinationBranchId());
										cityWiseCollectionModel.setBranchName(aReportModel.getWayBillDestinationBranch());
										cityWiseCollectionModel.setSubRegionId(aReportModel.getDestinationSubRegionId());
										cityWiseCollectionModel.setSubRegionName(aReportModel.getWayBillDestinationSubRegion());
										cityWiseCollectionModel.setTotalPaidAmount(-aReportModel.getGrandTotal());
										cityWiseCollectionModel.setTotalToPayAmount(-0);
										cityWiseCollectionModel.setTotalCreditorAmount(-0);
										cityWiseCollectionModel.setQuantity(-aReportModel.getNoOfPackages());

										cityWiseToPayeeDetails.put(aReportModel.getDestinationBranchId(), cityWiseCollectionModel);
									}
								} else if(!showCashCollectionInReport || aReportModel.getPaymentTypeId() != PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID) {
									cityWiseCollectionModel.setTotalPaidAmount(cityWiseCollectionModel.getTotalPaidAmount() - aReportModel.getGrandTotal());
									cityWiseCollectionModel.setTotalToPayAmount(cityWiseCollectionModel.getTotalToPayAmount() - 0);
									cityWiseCollectionModel.setTotalCreditorAmount(cityWiseCollectionModel.getTotalCreditorAmount() - 0);
									cityWiseCollectionModel.setQuantity( - (cityWiseCollectionModel.getQuantity() + aReportModel.getNoOfPackages()));
								}

								storeCityWiseToPayeeDetails.put(aReportModel.getDestinationSubRegionId(), cityWiseToPayeeDetails);
							} else {
								cityWiseCollectionModel = (CityWiseCollectionModel) cityWiseToPayeeDetails.get(aReportModel.getDestinationBranchId());

								if(cityWiseCollectionModel == null) {
									cityWiseCollectionModel 	= new CityWiseCollectionModel();

									cityWiseCollectionModel.setBranchId(aReportModel.getDestinationBranchId());
									cityWiseCollectionModel.setBranchName(aReportModel.getWayBillDestinationBranch());
									cityWiseCollectionModel.setSubRegionId(aReportModel.getDestinationSubRegionId());
									cityWiseCollectionModel.setSubRegionName(aReportModel.getWayBillDestinationSubRegion());
									cityWiseCollectionModel.setTotalPaidAmount(-aReportModel.getGrandTotal());
									cityWiseCollectionModel.setTotalToPayAmount(-0);
									cityWiseCollectionModel.setTotalCreditorAmount(-0);
									cityWiseCollectionModel.setQuantity(- aReportModel.getNoOfPackages());

									cityWiseToPayeeDetails.put(aReportModel.getDestinationBranchId(), cityWiseCollectionModel);
								} else {
									cityWiseCollectionModel.setTotalPaidAmount(cityWiseCollectionModel.getTotalPaidAmount() - aReportModel.getGrandTotal());
									cityWiseCollectionModel.setTotalToPayAmount(cityWiseCollectionModel.getTotalToPayAmount() - 0);
									cityWiseCollectionModel.setTotalCreditorAmount(cityWiseCollectionModel.getTotalCreditorAmount() - 0);
									cityWiseCollectionModel.setQuantity(cityWiseCollectionModel.getQuantity() - aReportModel.getNoOfPackages());
								}
							}
						} else if(showCreditDetailsColumn && aReportModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT) {
							cityWiseToPayeeDetails 	= (HashMap<Long, Object>) storeCityWiseToPayeeDetails.get(aReportModel.getDestinationSubRegionId());

							if(cityWiseToPayeeDetails == null) {
								cityWiseToPayeeDetails 	= new LinkedHashMap<>();

								cityWiseCollectionModel = (CityWiseCollectionModel) cityWiseToPayeeDetails.get(aReportModel.getDestinationBranchId());

								if(cityWiseCollectionModel == null) {
									if(!showCashCollectionInReport || aReportModel.getPaymentTypeId() != PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID) {
										cityWiseCollectionModel 	= new CityWiseCollectionModel();

										cityWiseCollectionModel.setBranchId(aReportModel.getDestinationBranchId());
										cityWiseCollectionModel.setBranchName(aReportModel.getWayBillDestinationBranch());
										cityWiseCollectionModel.setSubRegionId(aReportModel.getDestinationSubRegionId());
										cityWiseCollectionModel.setSubRegionName(aReportModel.getWayBillDestinationSubRegion());
										cityWiseCollectionModel.setTotalCreditorAmount(-aReportModel.getGrandTotal());
										cityWiseCollectionModel.setTotalToPayAmount(-0);
										cityWiseCollectionModel.setTotalPaidAmount(-0);
										cityWiseCollectionModel.setQuantity(-aReportModel.getNoOfPackages());

										cityWiseToPayeeDetails.put(aReportModel.getDestinationBranchId(), cityWiseCollectionModel);
									}
								} else if(!showCashCollectionInReport || aReportModel.getPaymentTypeId() != PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID) {
									cityWiseCollectionModel.setTotalCreditorAmount(cityWiseCollectionModel.getTotalCreditorAmount() - aReportModel.getGrandTotal());
									cityWiseCollectionModel.setTotalToPayAmount(cityWiseCollectionModel.getTotalToPayAmount() - 0);
									cityWiseCollectionModel.setTotalPaidAmount(cityWiseCollectionModel.getTotalPaidAmount() - 0);
									cityWiseCollectionModel.setQuantity( - (cityWiseCollectionModel.getQuantity() + aReportModel.getNoOfPackages()));
								}

								storeCityWiseToPayeeDetails.put(aReportModel.getDestinationSubRegionId(), cityWiseToPayeeDetails);
							} else {
								cityWiseCollectionModel = (CityWiseCollectionModel) cityWiseToPayeeDetails.get(aReportModel.getDestinationBranchId());

								if(cityWiseCollectionModel == null) {
									cityWiseCollectionModel 	= new CityWiseCollectionModel();

									cityWiseCollectionModel.setBranchId(aReportModel.getDestinationBranchId());
									cityWiseCollectionModel.setBranchName(aReportModel.getWayBillDestinationBranch());
									cityWiseCollectionModel.setSubRegionId(aReportModel.getDestinationSubRegionId());
									cityWiseCollectionModel.setSubRegionName(aReportModel.getWayBillDestinationSubRegion());
									cityWiseCollectionModel.setTotalCreditorAmount(-aReportModel.getGrandTotal());
									cityWiseCollectionModel.setTotalToPayAmount(-0);
									cityWiseCollectionModel.setTotalPaidAmount(-0);
									cityWiseCollectionModel.setQuantity(- aReportModel.getNoOfPackages());

									cityWiseToPayeeDetails.put(aReportModel.getDestinationBranchId(), cityWiseCollectionModel);
								} else {
									cityWiseCollectionModel.setTotalCreditorAmount(cityWiseCollectionModel.getTotalCreditorAmount() - aReportModel.getGrandTotal());
									cityWiseCollectionModel.setTotalToPayAmount(cityWiseCollectionModel.getTotalToPayAmount() - 0);
									cityWiseCollectionModel.setTotalPaidAmount(cityWiseCollectionModel.getTotalPaidAmount() - 0);
									cityWiseCollectionModel.setQuantity(cityWiseCollectionModel.getQuantity() - aReportModel.getNoOfPackages());
								}
							}
						}

					if(aReportModel.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_BOOKED) {
						if(aReportModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID) {
							totalBookingGrandAmount 	+= aReportModel.getGrandTotal();
							if(aReportModel.getPaymentTypeId() == PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID)
								totalBookingChequeTotal	+=  aReportModel.getGrandTotal();
						} else if(aReportModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY) {
							toPayCommissionToBeLess 	+= aReportModel.getAgentCommission();

							for (final WayBillCharges wayBillCharge : wayBillCharges)
								if((wayBillCharge.getWayBillChargeMasterId() == ChargeTypeMaster.PAID_LOADING
								|| wayBillCharge.getWayBillChargeMasterId() == ChargeTypeMaster.PAID_HAMALI)
										&& wayBillCharge.getChargeAmount() > 0)
									totalBookingGrandAmount 	+= wayBillCharge.getChargeAmount();
						}

						getAddedTdsRateWiseBookingCommission(dateWiseTDSHM, aReportModel, rateWiseTDSHM, request);

						wayBillCategoryTypeDetails 		= wbCategoryTypeDetails.get(aReportModel.getWayBillType());

						if(wayBillCategoryTypeDetails == null) {
							wayBillCategoryTypeDetails 	= new WayBillCategoryTypeDetails();

							wayBillCategoryTypeDetails.setWayBillType(aReportModel.getWayBillType());
							wayBillCategoryTypeDetails.setQuantity(aReportModel.getNoOfPackages());
							wayBillCategoryTypeDetails.setBookingDiscount(totalDiscount);
							wayBillCategoryTypeDetails.setTotalTax(totalTax);
							wayBillCategoryTypeDetails.setTotalAmount(aReportModel.getGrandTotal() - (aReportModel.getDeliveryAmount() - aReportModel.getDeliveryDiscount()));
							wayBillCategoryTypeDetails.setAgentCommission(aReportModel.getAgentCommission());
							wayBillCategoryTypeDetails.setBookingCommission(aReportModel.getBookingCommission());
							wayBillCategoryTypeDetails.setWayBillTypeId(aReportModel.getWayBillTypeId());

							chargesCollection 		= new HashMap<>();

							for (final WayBillCharges wayBillCharge : wayBillCharges)
								if(wayBillCharge.getChargeType() == ChargeTypeMaster.WAYBILL_CHARGETYPE_BOOKING)
									chargesCollection.put(wayBillCharge.getWayBillChargeMasterId(), wayBillCharge.getChargeAmount());

							wayBillCategoryTypeDetails.setChargesCollection(chargesCollection);

							wbCategoryTypeDetails.put(aReportModel.getWayBillType(), wayBillCategoryTypeDetails);
						} else {

							wayBillCategoryTypeDetails.setQuantity(wayBillCategoryTypeDetails.getQuantity() + aReportModel.getNoOfPackages());
							wayBillCategoryTypeDetails.setBookingDiscount(wayBillCategoryTypeDetails.getBookingDiscount() + totalDiscount);
							wayBillCategoryTypeDetails.setTotalTax(wayBillCategoryTypeDetails.getTotalTax() + totalTax);
							wayBillCategoryTypeDetails.setTotalAmount(wayBillCategoryTypeDetails.getTotalAmount() + (aReportModel.getGrandTotal() - (aReportModel.getDeliveryAmount() - aReportModel.getDeliveryDiscount())));
							wayBillCategoryTypeDetails.setAgentCommission(wayBillCategoryTypeDetails.getAgentCommission() + aReportModel.getAgentCommission());
							wayBillCategoryTypeDetails.setBookingCommission(wayBillCategoryTypeDetails.getBookingCommission() + aReportModel.getBookingCommission());

							chargesCollection 	= wayBillCategoryTypeDetails.getChargesCollection();

							for (final WayBillCharges wayBillCharge : wayBillCharges)
								if(wayBillCharge.getChargeType() == ChargeTypeMaster.WAYBILL_CHARGETYPE_BOOKING)
									if(chargesCollection.get(wayBillCharge.getWayBillChargeMasterId()) != null)
										chargesCollection.put(wayBillCharge.getWayBillChargeMasterId(), chargesCollection.get(wayBillCharge.getWayBillChargeMasterId()) + wayBillCharge.getChargeAmount());
									else
										chargesCollection.put(wayBillCharge.getWayBillChargeMasterId(), wayBillCharge.getChargeAmount());
						}

					} else if(aReportModel.getStatus()==WayBillStatusConstant.WAYBILL_STATUS_CANCELLED && (aReportModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID ||aReportModel.getWayBillTypeId() == WayBillType.WAYBILL_TYPE_TO_PAY || aReportModel.getWayBillTypeId() == WayBillType.WAYBILL_TYPE_CREDIT)){
						if(aReportModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID){
							if(showCashCollectionInReport && aReportModel.getPaymentTypeId() == PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID){
								//DO Nothing No Need To Add Amount To Cancellation
							} else
								totalCancellationGrandAmount += Math.round(aReportModel.getGrandTotal() - aReportModel.getAmount());
						} else if(aReportModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY){
							totalCancellationGrandAmount 	+= Math.round(-aReportModel.getAmount());

							for (final WayBillCharges wayBillCharge : wayBillCharges)
								if((wayBillCharge.getWayBillChargeMasterId() == ChargeTypeMaster.PAID_LOADING
								|| wayBillCharge.getWayBillChargeMasterId() == ChargeTypeMaster.PAID_HAMALI)
										&& wayBillCharge.getChargeAmount() > 0)
									totalBookingGrandAmount 	-= wayBillCharge.getChargeAmount();
						}

						getDeductedTdsRateWiseBookingCommission(dateWiseTDSHM, aReportModel,rateWiseTDSHM, request);

						wayBillCategoryTypeDetails = wbCategoryTypeDetails.get(aReportModel.getWayBillType());

						if(wayBillCategoryTypeDetails == null) {
							if(!showCashCollectionInReport || aReportModel.getPaymentTypeId() != PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID) {
								wayBillCategoryTypeDetails = new WayBillCategoryTypeDetails();

								wayBillCategoryTypeDetails.setWayBillType(aReportModel.getWayBillType());
								wayBillCategoryTypeDetails.setQuantity(-aReportModel.getNoOfPackages());
								wayBillCategoryTypeDetails.setBookingDiscount(-totalDiscount);
								wayBillCategoryTypeDetails.setTotalTax(-totalTax);
								wayBillCategoryTypeDetails.setTotalAmount(- (aReportModel.getGrandTotal() - (aReportModel.getDeliveryAmount() - aReportModel.getDeliveryDiscount())));
								wayBillCategoryTypeDetails.setAgentCommission(- aReportModel.getAgentCommission());
								wayBillCategoryTypeDetails.setBookingCommission(- aReportModel.getBookingCommission());

								wayBillCategoryTypeDetails.setWayBillTypeId(aReportModel.getWayBillTypeId());

								chargesCollection 	= new HashMap<>();

								for (final WayBillCharges wayBillCharge1 : wayBillCharges)
									if(wayBillCharge1.getChargeType() == ChargeTypeMaster.WAYBILL_CHARGETYPE_BOOKING)
										chargesCollection.put(wayBillCharge1.getWayBillChargeMasterId(), - wayBillCharge1.getChargeAmount());

								wayBillCategoryTypeDetails.setChargesCollection(chargesCollection);
								wbCategoryTypeDetails.put(aReportModel.getWayBillType(), wayBillCategoryTypeDetails);
							}

						} else if(!showCashCollectionInReport || aReportModel.getPaymentTypeId() != PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID) {
							wayBillCategoryTypeDetails.setQuantity(wayBillCategoryTypeDetails.getQuantity() - aReportModel.getNoOfPackages());
							wayBillCategoryTypeDetails.setBookingDiscount(wayBillCategoryTypeDetails.getBookingDiscount() - totalDiscount);
							wayBillCategoryTypeDetails.setTotalTax(wayBillCategoryTypeDetails.getTotalTax() - totalTax);
							wayBillCategoryTypeDetails.setTotalAmount(wayBillCategoryTypeDetails.getTotalAmount() - (aReportModel.getGrandTotal() - (aReportModel.getDeliveryAmount() - aReportModel.getDeliveryDiscount())));
							wayBillCategoryTypeDetails.setAgentCommission(wayBillCategoryTypeDetails.getAgentCommission() - aReportModel.getAgentCommission());
							wayBillCategoryTypeDetails.setBookingCommission(wayBillCategoryTypeDetails.getBookingCommission() - aReportModel.getBookingCommission());

							chargesCollection 	= wayBillCategoryTypeDetails.getChargesCollection();

							for (final WayBillCharges wayBillCharge2 : wayBillCharges)
								if(wayBillCharge2.getChargeType() == ChargeTypeMaster.WAYBILL_CHARGETYPE_BOOKING)
									if(chargesCollection.get(wayBillCharge2.getWayBillChargeMasterId()) != null)
										chargesCollection.put(wayBillCharge2.getWayBillChargeMasterId(), chargesCollection.get(wayBillCharge2.getWayBillChargeMasterId()) - wayBillCharge2.getChargeAmount());
									else
										chargesCollection.put(wayBillCharge2.getWayBillChargeMasterId(),- wayBillCharge2.getChargeAmount());
						}

					} else if(aReportModel.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DELIVERED) {

						var totalFreight 	= 0.00;
						var totalBookingFreight 	= 0.00;
						var totalBookingHandling = 0.00;
						var totalAmount 		= aReportModel.getDeliveryAmount() - aReportModel.getDeliveryDiscount();
						var paidLoadingAmt 	= 0.00;
						var totalBkgTax 		= 0.00;

						if(aReportModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY) {
							for (final WayBillCharges wayBillCharge : wayBillCharges)
								if((wayBillCharge.getWayBillChargeMasterId() == ChargeTypeMaster.PAID_LOADING
								|| wayBillCharge.getWayBillChargeMasterId() == ChargeTypeMaster.PAID_HAMALI)
										&& wayBillCharge.getChargeAmount() > 0)
									paidLoadingAmt 	= wayBillCharge.getChargeAmount();

							totalDeliverGrandAmount 	+= aReportModel.getGrandTotal() - paidLoadingAmt;
							if(aReportModel.getDeliveryPaymentTypeId() == PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID)
								totalDeliveryChequeTotal += aReportModel.getGrandTotal() - paidLoadingAmt;
							totalFreight 				= aReportModel.getGrandTotal() - (aReportModel.getDeliveryAmount() - aReportModel.getDeliveryDiscount()) - paidLoadingAmt;
							totalAmount  				+= totalFreight;

						} else if(aReportModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID || aReportModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT) {
							totalDeliverGrandAmount 	+= aReportModel.getDeliveryAmount() - aReportModel.getDeliveryDiscount();

							if(aReportModel.getDeliveryPaymentTypeId() == PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID)
								totalDeliveryChequeTotal	+= aReportModel.getDeliveryAmount()-aReportModel.getDeliveryDiscount();

							if(showCashCollectionInReport && aReportModel.getDeliveryPaymentTypeId() == PaymentTypeConstant.PAYMENT_TYPE_BILL_CREDIT_ID)
								totalDeliveryBillCreditTotal	+= aReportModel.getDeliveryAmount()-aReportModel.getDeliveryDiscount();
						}

						wbCategoryTypeDetailsForDlvrd 	= deliveredWayBillDetails.get(aReportModel.getWayBillType());
						totalBkgTax						+=   aReportModel.getTotalDlyTax();
						if(wbCategoryTypeDetailsForDlvrd == null) {
							wbCategoryTypeDetailsForDlvrd 	= new WayBillCategoryTypeDetails();


							wbCategoryTypeDetailsForDlvrd.setWayBillType(aReportModel.getWayBillType());
							wbCategoryTypeDetailsForDlvrd.setWayBillTypeId(aReportModel.getWayBillTypeId());
							wbCategoryTypeDetailsForDlvrd.setQuantity(aReportModel.getNoOfPackages());

							for (final WayBillCharges wayBillCharge : wayBillCharges) {
								if(wayBillCharge.getWayBillChargeMasterId() == ChargeTypeMaster.FREIGHT)
									totalBookingFreight	+= wayBillCharge.getChargeAmount();

								if(wayBillCharge.getWayBillChargeMasterId() == ChargeTypeMaster.HANDLING)
									totalBookingHandling	+= wayBillCharge.getChargeAmount();
							}

							wbCategoryTypeDetailsForDlvrd.setTotalBookingFreight(totalBookingFreight);
							wbCategoryTypeDetailsForDlvrd.setTotalFreight(totalFreight);
							wbCategoryTypeDetailsForDlvrd.setDeliveryDiscount(aReportModel.getDeliveryDiscount());
							wbCategoryTypeDetailsForDlvrd.setTotalAmount(totalAmount);
							wbCategoryTypeDetailsForDlvrd.setDeliveryCommission(aReportModel.getDeliveryCommission());
							wbCategoryTypeDetailsForDlvrd.setTotalBookingHandling(totalBookingHandling);
							wbCategoryTypeDetailsForDlvrd.setTotalTax(totalBkgTax);

							chargesCollection = new HashMap<>();

							for (final WayBillCharges wayBillCharge : wayBillCharges)
								if(wayBillCharge.getChargeType() == ChargeTypeMaster.WAYBILL_CHARGETYPE_DELIVERY)
									chargesCollection.put(wayBillCharge.getWayBillChargeMasterId(), wayBillCharge.getChargeAmount());

							wbCategoryTypeDetailsForDlvrd.setChargesCollection(chargesCollection);

							deliveredWayBillDetails.put(aReportModel.getWayBillType(), wbCategoryTypeDetailsForDlvrd);
						} else {
							wbCategoryTypeDetailsForDlvrd.setQuantity(wbCategoryTypeDetailsForDlvrd.getQuantity() + aReportModel.getNoOfPackages());

							for (final WayBillCharges wayBillCharge : wayBillCharges) {
								if(wayBillCharge.getWayBillChargeMasterId() == ChargeTypeMaster.FREIGHT)
									totalBookingFreight	+= wayBillCharge.getChargeAmount();
								if(wayBillCharge.getWayBillChargeMasterId() == ChargeTypeMaster.HANDLING)
									totalBookingHandling	+= wayBillCharge.getChargeAmount();
							}

							wbCategoryTypeDetailsForDlvrd.setTotalBookingFreight(wbCategoryTypeDetailsForDlvrd.getTotalBookingFreight() + totalBookingFreight);
							wbCategoryTypeDetailsForDlvrd.setTotalFreight(wbCategoryTypeDetailsForDlvrd.getTotalFreight() + totalFreight);
							wbCategoryTypeDetailsForDlvrd.setDeliveryDiscount(wbCategoryTypeDetailsForDlvrd.getDeliveryDiscount() + aReportModel.getDeliveryDiscount());
							wbCategoryTypeDetailsForDlvrd.setTotalAmount(wbCategoryTypeDetailsForDlvrd.getTotalAmount() + totalAmount);
							wbCategoryTypeDetailsForDlvrd.setDeliveryCommission(wbCategoryTypeDetailsForDlvrd.getDeliveryCommission() + aReportModel.getDeliveryCommission());
							wbCategoryTypeDetailsForDlvrd.setTotalBookingHandling(wbCategoryTypeDetailsForDlvrd.getTotalBookingHandling() + totalBookingHandling);
							wbCategoryTypeDetailsForDlvrd.setTotalTax(wbCategoryTypeDetailsForDlvrd.getTotalTax() + totalBkgTax);

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
									totalDeliverOctroiAmount 	+= wayBillCharge.getChargeAmount();
								if(wayBillCharge.getWayBillChargeMasterId() == ChargeTypeMaster.OTHER_DELIVERY)
									totalDeliverOtherAmount 	+= wayBillCharge.getChargeAmount();

								if(showCashCollectionInReport && aReportModel.getDeliveryPaymentTypeId() == PaymentTypeConstant.PAYMENT_TYPE_BILL_CREDIT_ID){
									if(wayBillCharge.getWayBillChargeMasterId() == ChargeTypeMaster.OCTROI_DELIVERY)
										totalDeliverBillCreditOctroiAmount 	+= wayBillCharge.getChargeAmount();

									if(wayBillCharge.getWayBillChargeMasterId() == ChargeTypeMaster.OTHER_DELIVERY)
										totalDeliverBillCreditOtherAmount 	+= wayBillCharge.getChargeAmount();
								}
							}
					}
				}

				if(doNotShow_Disc) request.setAttribute("doNotShow_Disc", "false");
				if(doNotShow_Tax) request.setAttribute("doNotShow_Tax", "false");
				if(doNotShow_Commission) request.setAttribute("doNotShow_Commission", "false");

				request.setAttribute("wayBillTypeDetails", wbCategoryTypeDetails);
				request.setAttribute("deliveredWayBillDetails", deliveredWayBillDetails);

				if(executive.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNT_GROUP_ID_FALCON_CARGO)
					request.setAttribute("totalGrandAmount", Math.round(totalBookingGrandAmount + totalDeliverGrandAmount - totalCancellationGrandAmount - toPayCommissionToBeLess - (totalDeliverOctroiAmount + totalDeliverOtherAmount))-totalDeliveryBillCreditTotal + (totalDeliverBillCreditOctroiAmount + totalDeliverBillCreditOtherAmount ));
				else
					request.setAttribute("totalGrandAmount", Math.round(totalBookingGrandAmount + totalDeliverGrandAmount - totalCancellationGrandAmount - toPayCommissionToBeLess));
				//City Wise ToPayee Details code
				request.setAttribute("storeCityWiseToPayeeDetails", storeCityWiseToPayeeDetails);
				//City Wise ToPayee Details code
				request.setAttribute("cityWiseDetails", cityWiseDetails);
				request.setAttribute("totalBookingChequeTotal",totalBookingChequeTotal);
				request.setAttribute("totalDeliveryChequeTotal",totalDeliveryChequeTotal);

				if(showIncomingDetails) {
					final var whereClause = getWhereClause(objectIn);
					otherBranchBookinglist = DailyBranchCollectionDAO.getInstance().getOtherBranchBookingData(whereClause);

					if(otherBranchBookinglist != null && !otherBranchBookinglist.isEmpty()) {
						wayBillTypeIdWiseHm	= otherBranchBookinglist.stream()
								.collect(Collectors.toMap(DailyBranchCollectionReportModel::getWayBillIdWithChargeId, Function.identity(), (e1, e2) -> e1));

						otherBranchbookingChargs	= wayBillTypeIdWiseHm.values().stream()
								.collect(Collectors.groupingBy(DailyBranchCollectionReportModel::getWayBillTypeId,
										Collectors.groupingBy(DailyBranchCollectionReportModel::getWayBillChargeMasterId,
												Collectors.reducing(0.0, DailyBranchCollectionReportModel::getChargeAmount, Double::sum))));

						otherBranchFooterHM = wayBillTypeIdWiseHm.values().stream()
								.collect(Collectors.groupingBy(DailyBranchCollectionReportModel::getWayBillChargeMasterId,
										Collectors.reducing(0.0, DailyBranchCollectionReportModel::getChargeAmount, Double::sum)));

						wayBillIdWiseList = otherBranchBookinglist.stream()
								.collect(Collectors.toMap(DailyBranchCollectionReportModel::getWayBillId, Function.identity(), (v1, v2) -> v1))
								.values().stream().toList();

						otherBranchFinalHm = wayBillIdWiseList.stream()
								.collect(Collectors.toMap(DailyBranchCollectionReportModel::getWayBillTypeId, Function.identity(), (v1, v2) -> v1 = mergeFinalData(v1, v2), TreeMap::new));

						chargeNameHM    = otherBranchBookinglist.stream().filter(item -> item.getWayBillChargeMasterId()> 0).collect(Collectors.toMap(DailyBranchCollectionReportModel::getWayBillChargeMasterId,DailyBranchCollectionReportModel::getChargeName,(e1, e2) -> e1));
					}
					request.setAttribute("chargeNameHM", chargeNameHM);
					request.setAttribute("otherBranchFinalHm", otherBranchFinalHm);
					request.setAttribute("otherBranchFooterHM", otherBranchFooterHM);
					request.setAttribute("otherBranchbookingChargs", otherBranchbookingChargs);
				}

				if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN) {
					branch 		= cache.getBranchById(request, executive.getAccountGroupId(), branchId);

					if(branch.getMappingTypeId() == Branch.BRANCH_MAP_ID_OWN_BRANCH_AND_ASSIGNED) {
						bookingCharges 	= cache.getBookingCharges(request, executive.getBranchId());
						deliveryCharges = cache.getDeliveryCharges(request, executive.getBranchId());
					} else {
						objectOut 	= cache.getBranchData(request, branchId);

						if(objectOut != null) {
							bookingCharges 	= cache.getBookingCharges(request, branchId);
							deliveryCharges = cache.getDeliveryCharges(request, branchId);
						} else {
							if(reportModel[0].getStatus() == WayBillStatusConstant.WAYBILL_STATUS_BOOKED || reportModel[0].getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CANCELLED)
								accountId = reportModel[0].getAccountGroupId();
							else
								accountId = reportModel[0].getBookedForAccountGroupId();

							bookingCharges  = ChargeTypeMasterDao.getInstance().getChargeConfiguration(accountId, branch.getAgencyId(), branch.getBranchId(),ChargeTypeMaster.WAYBILL_CHARGETYPE_BOOKING);
							deliveryCharges = ChargeTypeMasterDao.getInstance().getChargeConfiguration(accountId, branch.getAgencyId(), branch.getBranchId(),ChargeTypeMaster.WAYBILL_CHARGETYPE_DELIVERY);
						}
					}
				} else {
					bookingCharges 	= cache.getBookingCharges(request, executive.getBranchId());
					deliveryCharges = cache.getDeliveryCharges(request, executive.getBranchId());
				}

				request.setAttribute("BookingCharges", bookingCharges);
				request.setAttribute("DeliveryCharges", deliveryCharges);

				final var branchExpConfigValue 	= cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_BRANCH_EXPENSE);

				if(branchExpConfigValue == ConfigParam.CONFIG_KEY_BRANCH_EXPENSE_YES)
					request.setAttribute("BranchExpenseAmount", BranchExpenseDao.getInstance().getDailyBranchExpenseDetails(fromDate, toDate, branchId, executive.getAccountGroupId()));
			} else {
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}

			if(executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_FALCON_CARGO
					|| executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_KONDUSKAR_S_R_TRAVELS
					|| executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_ROYAL_STAR
					|| executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_MAHESHCARGO
					|| executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_SURYADEV
					|| executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_ATL
					|| executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_SHARMATPT
					|| executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_SHARMAT
					|| executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_KOMITLA
					|| executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_SNDP

					)
				request.setAttribute("nextPageToken", "success_" + executive.getAccountGroupId());
			else
				request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}

	private String getWhereClause(ValueObject valueObjIn) throws Exception {
		final var whereClause = new StringJoiner(" AND ");

		try {
			whereClause.add("wb.BookingDateTimeStamp >= '" + valueObjIn.get("fromDate") + "'");
			whereClause.add("wb.BookingDateTimeStamp <= '" + valueObjIn.get("toDate") + "'");
			whereClause.add("wb.AccountGroupId = " + Long.parseLong(valueObjIn.get("accountGroupId").toString()));
			whereClause.add("wb.DestinationBranchId = " + Long.parseLong(valueObjIn.get("branchId").toString()));
			whereClause.add("wb.Status = 1" );

			return whereClause.toString();
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, DailyBranchCollectionSummaryReportActionSRSTravels.class.getName());
		} finally {
			valueObjIn 	= null;
		}
	}

	public static DailyBranchCollectionReportModel mergeFinalData(final DailyBranchCollectionReportModel first, final DailyBranchCollectionReportModel second) {
		first.setNoOfPackages(first.getNoOfPackages() + second.getNoOfPackages());
		first.setTotalTax(first.getTotalTax() + second.getTotalTax());
		first.setAmount(first.getAmount() + second.getAmount());

		return first;
	}
	private void getAddedTdsRateWiseBookingCommission(Map<String, Double> dateWiseTDSHM, DailyBranchCollectionReportModel aReportModel,final Map<Double, Double> rateWiseTDSHM,final HttpServletRequest request) throws Exception {
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
		System.out.println("rateWiseTDSHM--->> "+rateWiseTDSHM);
		request.setAttribute("rateWiseTDSHM", rateWiseTDSHM);
	}
}
