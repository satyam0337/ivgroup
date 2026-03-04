package com.ivcargo.reports;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.dto.constant.BookingChargeConstant;
import com.iv.dto.constant.ExecutiveTypeConstant;
import com.iv.dto.constant.PaymentTypeConstant;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.BranchExpenseDao;
import com.platform.dao.ChargeTypeMasterDao;
import com.platform.dao.ConfigDoorDeliveryDao;
import com.platform.dao.VoucherDetailsDao;
import com.platform.dao.reports.DailyBranchCollectionDAO;
import com.platform.dao.reports.WayBillDetailsDAO;
import com.platform.dto.AccountGroupNetworkConfiguration;
import com.platform.dto.Branch;
import com.platform.dto.ChargeTypeMaster;
import com.platform.dto.ConfigParam;
import com.platform.dto.ConsignmentDetails;
import com.platform.dto.ECargoConstantFile;
import com.platform.dto.Executive;
import com.platform.dto.VoucherDetails;
import com.platform.dto.WayBill;
import com.platform.dto.WayBillCharges;
import com.platform.dto.WayBillTaxTxn;
import com.platform.dto.WayBillType;
import com.platform.dto.configuration.report.collection.DailyBranchCollectionReportConfigurationDTO;
import com.platform.dto.constant.CargoAccountGroupConstant;
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

public class NewDailyBranchCollectionReportAction implements Action {

	@Override
	@SuppressWarnings("unchecked")
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	error 	= null;
		Executive				executive					= null;
		SimpleDateFormat		sdf							= null;
		Timestamp				fromDate					= null;
		Timestamp				toDate						= null;
		Branch[]				branches					= null;
		CacheManip				cache						= null;
		ValueObject				objectIn					= null;
		ValueObject				objectOut					= null;
		Long[]					wayBillIdArray				= null;
		ReportViewModel			reportViewModel				= null;
		ArrayList<Long>			paidChargeColumns			= null;
		ArrayList<Long>			cancellationChargeColumns	= null;
		WayBillExpenseModel[]	wayBillExpenseModel			= null;
		ArrayList<Long>			deliveryChargeColumns		= null;
		ArrayList<Long>			creditDeliveryChargeColumns	= null;
		ArrayList<Long>			focChargeColumns			= null;
		ArrayList<Long>			focManualChargeColumns		= null;
		ArrayList<Long>			toPayChargeColumns			= null;
		ArrayList<Long>			creditorChargeColumns		= null;
		ArrayList<Long>			paidManualChargeColumns		= null;
		ArrayList<Long>			toPayManualChargeColumns	= null;
		ArrayList<Long>			creditorManualChargeColumns	= null;
		ArrayList<Long>			dueDeliverChargeColumns		= null;
		ArrayList<Long>			deliveredWayBills			= null;
		ArrayList<Long>			cancelledWayBills			= null;
		HashMap<Long,Double>	totalChargesAmount			= null;
		HashMap<Long,Object>	storeCityWiseToPayeeDetails	= null;
		HashMap<Long,Object>	cityWiseToPayeeDetails		= null;
		CityWiseCollectionModel	cityWiseCollectionModel		= null;
		WayBillType				wayBillType					= null;
		ConsignmentDetails[]	consDetails					= null;
		String					packageDetails				= null;
		WayBillCharges[]		wayBillCharges				= null;
		WayBillTaxTxn[]			wayBillTax					= null;
		HashMap<Long,Double>	chargesCollection			= null;
		ChargeTypeModel[]		bookingCharges				= null;
		ChargeTypeModel[]		deliveryCharges				= null;
		Branch					branch						= null;
		HashMap<Long,Object>	storeCityWiseToDLVPayeeDetails	= null;
		HashMap<String,Double>							bookedWayBillCategoryTypeDetails	= null;
		WayBillCategoryTypeDetails						wayBillCategoryTypeDetails			= null;
		WayBillCategoryTypeDetails						wbCategoryTypeDetailsForDlvrd		= null;
		DailyBranchCollectionReportModel[]				reportModel							= null;
		HashMap<Long,DailyBranchCollectionReportModel>	booking								= null;
		HashMap<Long,DailyBranchCollectionReportModel>	cancellation						= null;
		//HashMap<Long,DailyBranchCollectionReportModel>	deliveryCancellation				= null;
		//HashMap<Long,DailyBranchCollectionReportModel>	delivery							= null;
		ArrayList<DailyBranchCollectionReportModel>		delivery							= null;
		ArrayList<DailyBranchCollectionReportModel>		deliveryCancellation				= null;
		HashMap<Long,DailyBranchCollectionReportModel>	creditDelivery						= null;
		HashMap<Long,DailyBranchCollectionReportModel>	FOC									= null;
		HashMap<Long,DailyBranchCollectionReportModel>	FOCManual							= null;
		HashMap<Long,DailyBranchCollectionReportModel>	toPayeeBooking						= null;
		HashMap<Long,DailyBranchCollectionReportModel>	creditorBooking						= null;
		HashMap<Long,DailyBranchCollectionReportModel>	bookingManual						= null;
		HashMap<Long,DailyBranchCollectionReportModel>	toPayeeBookingManual				= null;
		HashMap<Long,DailyBranchCollectionReportModel>	creditorBookingManual				= null;
		HashMap<Long,DailyBranchCollectionReportModel>	deuDeliver							= null;
		HashMap<String,ArrayList<Long>>					chargeColumns						= null;
		HashMap<String,WayBillCategoryTypeDetails>		wbCategoryTypeDetails 				= null;
		HashMap<String,WayBillCategoryTypeDetails>		deliveredWayBillDetails				= null;
		HashMap<Long, WayBillDeatailsModel>				wayBillDetails						= null;
		VoucherDetails[]								totalAmountForSummarry				= null;
		VoucherDetailsDao								voucherDetailsDao					= null;
		ValueObject										configuration						= null;
		var											reportFromNewFlow					= false;
		var											showGroupMergingBranchData			= false;
		var											isPaymentTypeNeeded					= false;
		String											paymentTypes						= null;
		AccountGroupNetworkConfiguration[]				assignedAccountGroupNetwork			= null;
		var												isAgentBranch						= false;
		var											showPhonePayAmount						= false;
		var											addLoadingAmountForOwnBranch			= false;
		var											showCalculationTable					= false;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeNewDailyBranchCollectionReportAction().execute(request, response);

			cache		 				= new CacheManip(request);
			executive         			= cache.getExecutive(request);
			configuration				= ReadAllConfigurationsBllImpl.getInstance().getOldReportConfigurationData(ReportIdentifierConstant.DAILY_BRANCH_COLLECTION_REPORT, executive.getAccountGroupId());
			reportFromNewFlow			= configuration.getBoolean(DailyBranchCollectionReportConfigurationDTO.REPORT_FROM_NEW_FLOW);
			showGroupMergingBranchData  = configuration.getBoolean(DailyBranchCollectionReportConfigurationDTO.SHOW_GROUP_MERGING_BRANCH_DATA);
			isPaymentTypeNeeded 		= configuration.getBoolean(DailyBranchCollectionReportConfigurationDTO.IS_PAYMENT_TYPE_NEEDED);
			paymentTypes				= configuration.getString(DailyBranchCollectionReportConfigurationDTO.PAYMENT_TYPE_LIST);
			showPhonePayAmount			= configuration.getBoolean(DailyBranchCollectionReportConfigurationDTO.SHOW_PHONE_PE_AMOUNT_DEDUCTION);
			addLoadingAmountForOwnBranch= configuration.getBoolean(DailyBranchCollectionReportConfigurationDTO.ADD_LOADING_AMOUNT_FOR_OWN_BRANCH);
			showCalculationTable    	= configuration.getBoolean(DailyBranchCollectionReportConfigurationDTO.SHOW_CALCULATION_TABLE);
			
			sdf               = new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			fromDate          = new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00").getTime());
			toDate            = new Timestamp(sdf.parse(JSPUtility.GetString(request, "toDate") + " 23:59:59").getTime());
			branches  		  = null;
			var selectedCity      =  0L;
			short paymentType		= 0;
			final var destinationCityId =  JSPUtility.GetLong(request, "TosubRegion",0);

			cache = new CacheManip(request);
			// Get the Selected  Combo values
			if (request.getParameter("subRegion")!=null)
				selectedCity  =  Long.parseLong(JSPUtility.GetString(request, "subRegion")) ;

			if (request.getParameter("paymentType")!=null)
				paymentType  =  JSPUtility.GetShort(request, "paymentType",(short) 0) ;

			//Get all Branches
			if(selectedCity > 0) {
				branches = cache.getBranchesArrayBySubRegionId(request, executive.getAccountGroupId(), selectedCity);
				request.setAttribute("branches", branches);
			}

			if(showGroupMergingBranchData)
				assignedAccountGroupNetwork 	= cache.getAssignedAccountGroupNetwork(request, executive.getAccountGroupId());

			request.setAttribute("assignedAccountGroupNetwork", assignedAccountGroupNetwork);

			// Get All Executives

			var 	branchId = 0L;
			var 	voucherDetailsAmnt = 0D;
			objectIn			= new ValueObject();
			objectOut			= new ValueObject();
			voucherDetailsDao	= new VoucherDetailsDao();

			if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_EXECUTIVE || executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_BRANCHADMIN
					|| executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_LIMITED
					|| executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_REGIONADMIN || executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_SUBREGIONADMIN) {
				branchId 	= executive.getBranchId();
				branch		= cache.getBranchById(request, executive.getAccountGroupId(), branchId);
			} else if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN) {
				branchId 	= JSPUtility.GetLong(request, "branch", 0);
				branch		= cache.getBranchById(request, executive.getAccountGroupId(), branchId);
			}

			if (branch != null && branch.isAgentBranch()) {
				isAgentBranch = true;
				request.setAttribute("tdsAmount", branch.getTdsAmount());
			}

			request.setAttribute("isAgentBranch", isAgentBranch);
			request.setAttribute("addLoadingAmountForOwnBranch", addLoadingAmountForOwnBranch);

			request.setAttribute("showCalculationTable", showCalculationTable);
			
			totalAmountForSummarry =voucherDetailsDao.getAmountForDailyBranchExpense(fromDate, toDate, branchId, executive.getAccountGroupId());
			if(totalAmountForSummarry != null)
				for (final VoucherDetails element : totalAmountForSummarry)
					voucherDetailsAmnt +=  element.getTotalAmount();

			objectIn.put("fromDate", fromDate);
			objectIn.put("toDate", toDate);
			objectIn.put("branchId", branchId);
			objectIn.put("accountGroupId", executive.getAccountGroupId());
			objectIn.put("filter", 0);
			objectIn.put("destinationCityId", destinationCityId);
			objectIn.put("paymentType",paymentType);
			objectIn.put("reportFromNewFlow", reportFromNewFlow);
			objectIn.put("showGroupMergingBranchData", showGroupMergingBranchData);
			objectIn.put("isPaymentTypeNeeded", isPaymentTypeNeeded);
			objectIn.put(DailyBranchCollectionReportConfigurationDTO.SHOW_BOOKING_CHARGES_TO_GROUP_ADMIN, configuration.getBoolean(DailyBranchCollectionReportConfigurationDTO.SHOW_BOOKING_CHARGES_TO_GROUP_ADMIN));
			objectIn.put("paymentTypes", paymentTypes);

			objectOut		= DailyBranchCollectionDAO.getInstance().getReportForBranch(objectIn);
			reportModel		= (DailyBranchCollectionReportModel[])objectOut.get("DailyBranchCollectionReportModel");
			wayBillIdArray	= (Long[]) objectOut.get("WayBillIdArray");

			if(objectOut.get("WayBillExpenseModel") != null) {
				wayBillExpenseModel = (WayBillExpenseModel[]) objectOut.get("WayBillExpenseModel");
				request.setAttribute("WayBillExpenseModel", wayBillExpenseModel);
			}

			reportViewModel = new ReportViewModel();
			reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);
			request.setAttribute("ReportViewModel",reportViewModel);

			booking						= new LinkedHashMap<>();
			paidChargeColumns			= new ArrayList<>();
			cancellation				= new LinkedHashMap<>();
			deliveryCancellation		= new ArrayList<>();
			cancellationChargeColumns	= new ArrayList<>();
			delivery					= new ArrayList<>();
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
			deliveredWayBills			= new ArrayList<>();
			cancelledWayBills			= new ArrayList<>();
			totalChargesAmount			= new HashMap<>();
			wbCategoryTypeDetails		= new HashMap<>();
			deliveredWayBillDetails		= new HashMap<>();
			var totalBookingGrandAmount 		= 0D;
			var totalCancellationGrandAmount = 0D;
			var totalDeliverGrandAmount 		= 0D;
			var toPayCommissionToBeLess 		= 0D;
			final var totalBkgFreightAmount 		= 0D;
			var totalDlvryCmsnFreightAmount 	= 0D;
			var totalBkgLoadingAmount 		= 0D;
			var totalBkgAutoChargeAmount		= 0D;
			var totalUnloadingAmount 		= 0D;
			var totalPhonePeAmount				= 0D;
			var totalBkgPaidLoadingAmount		= 0D;
			var bookingHandling					= 0D;
			
			//City Wise ToPayee Details code
			storeCityWiseToPayeeDetails = new LinkedHashMap<>();
			storeCityWiseToDLVPayeeDetails = new LinkedHashMap<>();
			//City Wise ToPayee Details code

			if(reportModel != null && wayBillIdArray != null){

				//Door Delivery Configuration Check
				final var isConfigDoorDelivery = ConfigDoorDeliveryDao.getInstance().getDoorDeliveryConfig(executive.getAccountGroupId(),executive.getAgencyId(),executive.getBranchId());
				request.setAttribute("isConfigDoorDelivery", isConfigDoorDelivery);

				var doNotShow_Disc = false; // if any disc found then column will be generated for disc in report
				var doNotShowDelivery_Disc = false; // if any delivery disc found then column will be generated for delivery disc in report
				var doNotShow_Tax = false;  // if any tax found then column will be generated for tax in report
				var doNotShow_Commission = false; // if any commission found then column will be generated for commission in report


				//Get WayBill Details code ( Start )
				wayBillDetails =null;
				if(executive.getAccountGroupId()== ECargoConstantFile.ACCOUNTGORUPID_SOUTHERN)
					wayBillDetails = WayBillDetailsDAO.getInstance().getWayBillDetails(wayBillIdArray ,true ,ChargeTypeMaster.WAYBILL_CHARGETYPE_BOTH ,true ,WayBillTaxTxn.WAYBILL_TAX_TXN_TYPE_BOOKING ,true);
				else wayBillDetails = WayBillDetailsDAO.getInstance().getWayBillDetails(wayBillIdArray ,true ,ChargeTypeMaster.WAYBILL_CHARGETYPE_BOTH ,true ,WayBillTaxTxn.WAYBILL_TAX_TXN_TYPE_BOOKING ,false);

				for(var i=0; i<reportModel.length;i++){

					//show commission column
					if(reportModel[i].getAgentCommission() > 0)
						doNotShow_Commission = true;

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

					// Get package Type for Southern
					if(executive.getAccountGroupId()== ECargoConstantFile.ACCOUNTGORUPID_SOUTHERN){
						consDetails		= wayBillDetails.get(reportModel[i].getWayBillId()).getConsignmentDetails();
						packageDetails	= "";
						for (var j=0; j<consDetails.length; j++)
							if (j != consDetails.length-1)
								packageDetails += consDetails[j].getQuantity()+" "+consDetails[j].getPackingTypeName()+" / ";
							else
								packageDetails += consDetails[j].getQuantity()+" "+consDetails[j].getPackingTypeName();
						reportModel[i].setPackageDetails(packageDetails);
					}

					//WayBill Charges (Booking & Delivery)

					wayBillCharges = wayBillDetails.get(reportModel[i].getWayBillId()).getWayBillCharges();
					bookedWayBillCategoryTypeDetails = new HashMap<>();
					var chargeAmt = 0D;
					for (final WayBillCharges wayBillCharge : wayBillCharges) {
						chargeAmt = wayBillCharge.getChargeAmount();
						if(reportModel[i].getStatus() != WayBill.WAYBILL_STATUS_DELIVERED && wayBillCharge.getChargeType() == ChargeTypeMaster.WAYBILL_CHARGETYPE_BOOKING){
							bookedWayBillCategoryTypeDetails.put(""+wayBillCharge.getWayBillChargeMasterId(), chargeAmt);

							if(wayBillCharge.getWayBillChargeMasterId() == ChargeTypeMaster.LOADING)
								totalBkgLoadingAmount += chargeAmt;

							if(wayBillCharge.getWayBillChargeMasterId() == ChargeTypeMaster.HANDLING) {
								if(reportModel[i].getStatus()== WayBillStatusConstant.WAYBILL_STATUS_BOOKED) 
									bookingHandling += chargeAmt;
								else if(reportModel[i].getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CANCELLED)
									bookingHandling -= chargeAmt;
							}
							
							if(executive.getAccountGroupId() == ECargoConstantFile.ACCOUNT_GROUP_ID_ROYAL_STAR
									&& wayBillCharge.getWayBillChargeMasterId() == ChargeTypeMaster.AUTO_BOOKING)
								if(reportModel[i].getStatus() == WayBill.WAYBILL_STATUS_BOOKED)
									totalBkgAutoChargeAmount += chargeAmt;
								else
									totalBkgAutoChargeAmount -= chargeAmt;

						}if(reportModel[i].getStatus() == WayBill.WAYBILL_STATUS_DELIVERED && wayBillCharge.getChargeType() == ChargeTypeMaster.WAYBILL_CHARGETYPE_DELIVERY){
							bookedWayBillCategoryTypeDetails.put(""+wayBillCharge.getWayBillChargeMasterId(), chargeAmt);
							if(wayBillCharge.getWayBillChargeMasterId() == ChargeTypeMaster.UNLOADING)
								totalUnloadingAmount += chargeAmt;
							
							
						}

						//Get Non Zero Charge Columns : START
						if(reportModel[i].getStatus() ==WayBill.WAYBILL_STATUS_BOOKED){
							if(reportModel[i].getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_PAID){
								if(wayBillCharge.getWayBillChargeMasterId() == BookingChargeConstant.LOADING)
									totalBkgPaidLoadingAmount += chargeAmt;

								if(!reportModel[i].isManual()) {
									if(chargeAmt > 0 && !paidChargeColumns.contains(wayBillCharge.getWayBillChargeMasterId()))
										paidChargeColumns.add(wayBillCharge.getWayBillChargeMasterId());
								} else if(chargeAmt > 0 && !paidManualChargeColumns.contains(wayBillCharge.getWayBillChargeMasterId()))
									paidManualChargeColumns.add(wayBillCharge.getWayBillChargeMasterId());
							}
							else if(reportModel[i].getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_FOC){
								if(!reportModel[i].isManual()){
									if(chargeAmt > 0 && !focChargeColumns.contains(wayBillCharge.getWayBillChargeMasterId()))
										focChargeColumns.add(wayBillCharge.getWayBillChargeMasterId());
								} else if(chargeAmt > 0 && !focManualChargeColumns.contains(wayBillCharge.getWayBillChargeMasterId()))
									focManualChargeColumns.add(wayBillCharge.getWayBillChargeMasterId());
							}
							else if(reportModel[i].getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_TO_PAY ){
								if(!reportModel[i].isManual()){
									if(chargeAmt > 0 && !toPayChargeColumns.contains(wayBillCharge.getWayBillChargeMasterId()))
										toPayChargeColumns.add(wayBillCharge.getWayBillChargeMasterId());
								} else if(chargeAmt > 0 && !toPayManualChargeColumns.contains(wayBillCharge.getWayBillChargeMasterId()))
									toPayManualChargeColumns.add(wayBillCharge.getWayBillChargeMasterId());
							}
							else if(reportModel[i].getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_CREDIT )
								if(!reportModel[i].isManual()){
									if(chargeAmt > 0 && !creditorChargeColumns.contains(wayBillCharge.getWayBillChargeMasterId()))
										creditorChargeColumns.add(wayBillCharge.getWayBillChargeMasterId());
								} else if(chargeAmt > 0 && !creditorManualChargeColumns.contains(wayBillCharge.getWayBillChargeMasterId()))
									creditorManualChargeColumns.add(wayBillCharge.getWayBillChargeMasterId());
						} else if(reportModel[i].getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CANCELLED){
							if(chargeAmt > 0 && ! cancellationChargeColumns.contains(wayBillCharge.getWayBillChargeMasterId()))
								cancellationChargeColumns.add(wayBillCharge.getWayBillChargeMasterId());

							if(wayBillCharge.getWayBillChargeMasterId() == BookingChargeConstant.LOADING && reportModel[i].getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID)
								totalBkgPaidLoadingAmount -= chargeAmt;
						}else if(reportModel[i].getStatus()==WayBill.WAYBILL_STATUS_DELIVERED){
							if(wayBillCharge.getWayBillChargeMasterId() == BookingChargeConstant.FREIGHT)
								if(reportModel[i].getDeliveryCommission() > 0 )
									totalDlvryCmsnFreightAmount +=	chargeAmt;

							if(chargeAmt > 0 && ! deliveryChargeColumns.contains(wayBillCharge.getWayBillChargeMasterId()))
								deliveryChargeColumns.add(wayBillCharge.getWayBillChargeMasterId());
						}else if(reportModel[i].getStatus()==WayBill.WAYBILL_STATUS_CREDIT_DELIVERED){
							if(chargeAmt > 0 && ! creditDeliveryChargeColumns.contains(wayBillCharge.getWayBillChargeMasterId()))
								creditDeliveryChargeColumns.add(wayBillCharge.getWayBillChargeMasterId());
						}else if(reportModel[i].getStatus()==WayBill.WAYBILL_STATUS_DUEDELIVERED||reportModel[i].getStatus()==WayBill.WAYBILL_STATUS_DUEUNDELIVERED)
							if(chargeAmt > 0 && ! dueDeliverChargeColumns.contains(wayBillCharge.getWayBillChargeMasterId()))
								dueDeliverChargeColumns.add(wayBillCharge.getWayBillChargeMasterId());

						var chargeAmount = 0D;
						if (totalChargesAmount.get(wayBillCharge.getWayBillChargeMasterId())!= null)
							chargeAmount += totalChargesAmount.get(wayBillCharge.getWayBillChargeMasterId());
						totalChargesAmount.put(wayBillCharge.getWayBillChargeMasterId(),chargeAmount);
					}
					reportModel[i].setChargesCollection(bookedWayBillCategoryTypeDetails);
					//end

					//Calculate Total WayBill Tax
					wayBillTax = wayBillDetails.get(reportModel[i].getWayBillId()).getWayBillTaxTxn();
					var totalTax 				= 0.00;
					for (final WayBillTaxTxn element : wayBillTax)
						totalTax = totalTax + element.getTaxAmount();
					reportModel[i].setTotalTax(totalTax);
					if(totalTax > 0)
						doNotShow_Tax = true;

					//Calculate Total Discount
					var totalDiscount = 0.00;
					if(reportModel[i].isDiscountPercent())
						totalDiscount = Math.round(reportModel[i].getAmount() * reportModel[i].getDiscount() / 100);
					else
						totalDiscount = reportModel[i].getDiscount();
					reportModel[i].setDiscount(totalDiscount);
					if(totalDiscount > 0)
						doNotShow_Disc = true;

					if(reportModel[i].getStatus()==WayBill.WAYBILL_STATUS_BOOKED ){
						if(reportModel[i].getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_PAID){

							//City Wise Paid Details code
							cityWiseToPayeeDetails = (HashMap<Long, Object>)storeCityWiseToPayeeDetails.get(reportModel[i].getDestinationSubRegionId());

							if(cityWiseToPayeeDetails == null){
								cityWiseToPayeeDetails = new LinkedHashMap<>();

								cityWiseCollectionModel = (CityWiseCollectionModel)cityWiseToPayeeDetails.get(reportModel[i].getDestinationBranchId());

								if(cityWiseCollectionModel == null){

									cityWiseCollectionModel = new CityWiseCollectionModel();

									cityWiseCollectionModel.setBranchId(reportModel[i].getDestinationBranchId());
									cityWiseCollectionModel.setBranchName(reportModel[i].getWayBillDestinationBranch());
									cityWiseCollectionModel.setSubRegionId(reportModel[i].getDestinationSubRegionId());
									cityWiseCollectionModel.setSubRegionName(reportModel[i].getWayBillDestinationSubRegion());
									cityWiseCollectionModel.setTotalPaidAmount(reportModel[i].getGrandTotal());
									cityWiseCollectionModel.setTotalToPayAmount(0);
									cityWiseCollectionModel.setTotalCreditorAmount(0);

									cityWiseToPayeeDetails.put(reportModel[i].getDestinationBranchId(), cityWiseCollectionModel);
								}else{
									cityWiseCollectionModel.setTotalPaidAmount(cityWiseCollectionModel.getTotalPaidAmount() + reportModel[i].getGrandTotal());
									cityWiseCollectionModel.setTotalToPayAmount(cityWiseCollectionModel.getTotalToPayAmount() + 0);
									cityWiseCollectionModel.setTotalCreditorAmount(cityWiseCollectionModel.getTotalCreditorAmount() + 0);
								}

								storeCityWiseToPayeeDetails.put(reportModel[i].getDestinationSubRegionId() ,cityWiseToPayeeDetails);
							}else{

								cityWiseCollectionModel = (CityWiseCollectionModel)cityWiseToPayeeDetails.get(reportModel[i].getDestinationBranchId());

								if(cityWiseCollectionModel == null){

									cityWiseCollectionModel = new CityWiseCollectionModel();

									cityWiseCollectionModel.setBranchId(reportModel[i].getDestinationBranchId());
									cityWiseCollectionModel.setBranchName(reportModel[i].getWayBillDestinationBranch());
									cityWiseCollectionModel.setSubRegionId(reportModel[i].getDestinationSubRegionId());
									cityWiseCollectionModel.setSubRegionName(reportModel[i].getWayBillDestinationSubRegion());
									cityWiseCollectionModel.setTotalPaidAmount(reportModel[i].getGrandTotal());
									cityWiseCollectionModel.setTotalToPayAmount(0);
									cityWiseCollectionModel.setTotalCreditorAmount(0);

									cityWiseToPayeeDetails.put(reportModel[i].getDestinationBranchId(), cityWiseCollectionModel);
								}else{
									cityWiseCollectionModel.setTotalPaidAmount(cityWiseCollectionModel.getTotalPaidAmount() + reportModel[i].getGrandTotal());
									cityWiseCollectionModel.setTotalToPayAmount(cityWiseCollectionModel.getTotalToPayAmount() + 0);
									cityWiseCollectionModel.setTotalCreditorAmount(cityWiseCollectionModel.getTotalCreditorAmount() + 0);
								}

							}
							//City Wise Paid Details code

							if(!reportModel[i].isManual())
								booking.put(reportModel[i].getWayBillId(), reportModel[i]);
							else
								bookingManual.put(reportModel[i].getWayBillId(), reportModel[i]);
						}
						else if(reportModel[i].getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_FOC){
							if(!reportModel[i].isManual())
								FOC.put(reportModel[i].getWayBillId(), reportModel[i]);
							else
								FOCManual.put(reportModel[i].getWayBillId(), reportModel[i]);
						}
						else if(reportModel[i].getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_TO_PAY ){
							//City Wise ToPayee Details code
							cityWiseToPayeeDetails = (HashMap<Long, Object>)storeCityWiseToPayeeDetails.get(reportModel[i].getDestinationSubRegionId());

							if(cityWiseToPayeeDetails == null){
								cityWiseToPayeeDetails = new LinkedHashMap<>();

								cityWiseCollectionModel = (CityWiseCollectionModel)cityWiseToPayeeDetails.get(reportModel[i].getDestinationBranchId());

								if(cityWiseCollectionModel == null){

									cityWiseCollectionModel = new CityWiseCollectionModel();

									cityWiseCollectionModel.setBranchId(reportModel[i].getDestinationBranchId());
									cityWiseCollectionModel.setBranchName(reportModel[i].getWayBillDestinationBranch());
									cityWiseCollectionModel.setSubRegionId(reportModel[i].getDestinationSubRegionId());
									cityWiseCollectionModel.setSubRegionName(reportModel[i].getWayBillDestinationSubRegion());
									cityWiseCollectionModel.setTotalPaidAmount(0);
									cityWiseCollectionModel.setTotalToPayAmount(reportModel[i].getGrandTotal() + reportModel[i].getAgentCommission());
									cityWiseCollectionModel.setTotalCreditorAmount(0);

									cityWiseToPayeeDetails.put(reportModel[i].getDestinationBranchId(), cityWiseCollectionModel);
								}else{
									cityWiseCollectionModel.setTotalPaidAmount(cityWiseCollectionModel.getTotalPaidAmount() + 0);
									cityWiseCollectionModel.setTotalToPayAmount(cityWiseCollectionModel.getTotalToPayAmount() + reportModel[i].getGrandTotal() + reportModel[i].getAgentCommission());
									cityWiseCollectionModel.setTotalCreditorAmount(cityWiseCollectionModel.getTotalCreditorAmount() + 0);
								}

								storeCityWiseToPayeeDetails.put(reportModel[i].getDestinationSubRegionId() ,cityWiseToPayeeDetails);
							}else{

								cityWiseCollectionModel = (CityWiseCollectionModel)cityWiseToPayeeDetails.get(reportModel[i].getDestinationBranchId());

								if(cityWiseCollectionModel == null){

									cityWiseCollectionModel = new CityWiseCollectionModel();

									cityWiseCollectionModel.setBranchId(reportModel[i].getDestinationBranchId());
									cityWiseCollectionModel.setBranchName(reportModel[i].getWayBillDestinationBranch());
									cityWiseCollectionModel.setSubRegionId(reportModel[i].getDestinationSubRegionId());
									cityWiseCollectionModel.setSubRegionName(reportModel[i].getWayBillDestinationSubRegion());
									cityWiseCollectionModel.setTotalPaidAmount(0);
									cityWiseCollectionModel.setTotalToPayAmount(reportModel[i].getGrandTotal() + reportModel[i].getAgentCommission());
									cityWiseCollectionModel.setTotalCreditorAmount(0);

									cityWiseToPayeeDetails.put(reportModel[i].getDestinationBranchId(), cityWiseCollectionModel);
								}else{
									cityWiseCollectionModel.setTotalPaidAmount(cityWiseCollectionModel.getTotalPaidAmount() + 0);
									cityWiseCollectionModel.setTotalToPayAmount(cityWiseCollectionModel.getTotalToPayAmount() + reportModel[i].getGrandTotal() + reportModel[i].getAgentCommission());
									cityWiseCollectionModel.setTotalCreditorAmount(cityWiseCollectionModel.getTotalCreditorAmount() + 0);
								}
							}
							//City Wise ToPayee Details code

							if(!reportModel[i].isManual())
								toPayeeBooking.put(reportModel[i].getWayBillId(), reportModel[i]);
							else
								toPayeeBookingManual.put(reportModel[i].getWayBillId(), reportModel[i]);
						}
						else if( reportModel[i].getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_CREDIT){
							if(!reportModel[i].isManual())
								creditorBooking.put(reportModel[i].getWayBillId(), reportModel[i]);
							else
								creditorBookingManual.put(reportModel[i].getWayBillId(), reportModel[i]);

							if(executive.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNT_GROUP_ID_KONDUSKAR_S_R_TRAVELS){
								//City Wise creditor Details code
								cityWiseToPayeeDetails = (HashMap<Long, Object>)storeCityWiseToPayeeDetails.get(reportModel[i].getDestinationSubRegionId());

								if(cityWiseToPayeeDetails == null){
									cityWiseToPayeeDetails = new LinkedHashMap<>();

									cityWiseCollectionModel = (CityWiseCollectionModel)cityWiseToPayeeDetails.get(reportModel[i].getDestinationBranchId());

									if(cityWiseCollectionModel == null){

										cityWiseCollectionModel = new CityWiseCollectionModel();

										cityWiseCollectionModel.setBranchId(reportModel[i].getDestinationBranchId());
										cityWiseCollectionModel.setBranchName(reportModel[i].getWayBillDestinationBranch());
										cityWiseCollectionModel.setSubRegionId(reportModel[i].getDestinationSubRegionId());
										cityWiseCollectionModel.setSubRegionName(reportModel[i].getWayBillDestinationSubRegion());
										cityWiseCollectionModel.setTotalPaidAmount(0);
										cityWiseCollectionModel.setTotalToPayAmount(0);
										cityWiseCollectionModel.setTotalCreditorAmount(reportModel[i].getGrandTotal());

										cityWiseToPayeeDetails.put(reportModel[i].getDestinationBranchId(), cityWiseCollectionModel);
									}else{
										cityWiseCollectionModel.setTotalPaidAmount(cityWiseCollectionModel.getTotalPaidAmount() + 0);
										cityWiseCollectionModel.setTotalToPayAmount(cityWiseCollectionModel.getTotalToPayAmount() + 0);
										cityWiseCollectionModel.setTotalCreditorAmount(cityWiseCollectionModel.getTotalCreditorAmount() + reportModel[i].getGrandTotal());
									}

									storeCityWiseToPayeeDetails.put(reportModel[i].getDestinationSubRegionId() ,cityWiseToPayeeDetails);
								}else{

									cityWiseCollectionModel = (CityWiseCollectionModel)cityWiseToPayeeDetails.get(reportModel[i].getDestinationBranchId());

									if(cityWiseCollectionModel == null){

										cityWiseCollectionModel = new CityWiseCollectionModel();

										cityWiseCollectionModel.setBranchId(reportModel[i].getDestinationBranchId());
										cityWiseCollectionModel.setBranchName(reportModel[i].getWayBillDestinationBranch());
										cityWiseCollectionModel.setSubRegionId(reportModel[i].getDestinationSubRegionId());
										cityWiseCollectionModel.setSubRegionName(reportModel[i].getWayBillDestinationSubRegion());
										cityWiseCollectionModel.setTotalPaidAmount(0);
										cityWiseCollectionModel.setTotalToPayAmount(0);
										cityWiseCollectionModel.setTotalCreditorAmount(reportModel[i].getGrandTotal());

										cityWiseToPayeeDetails.put(reportModel[i].getDestinationBranchId(), cityWiseCollectionModel);
									}else{
										cityWiseCollectionModel.setTotalPaidAmount(cityWiseCollectionModel.getTotalPaidAmount() + 0);
										cityWiseCollectionModel.setTotalToPayAmount(cityWiseCollectionModel.getTotalToPayAmount() + 0);
										cityWiseCollectionModel.setTotalCreditorAmount(cityWiseCollectionModel.getTotalCreditorAmount() + reportModel[i].getGrandTotal());
									}
								}
								//City Wise creditor Details code

								/*if(!reportModel[i].isManual()){
									toPayeeBooking.put(reportModel[i].getWayBillId(), reportModel[i]);
								}else{
									toPayeeBookingManual.put(reportModel[i].getWayBillId(), reportModel[i]);
								}*/
							}
						}
					}else if(reportModel[i].getStatus()==WayBill.WAYBILL_STATUS_CANCELLED){
						cancellation.put(reportModel[i].getWayBillId(), reportModel[i]);

						if(reportModel[i].getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_TO_PAY || reportModel[i].getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_CREDIT )
							cancelledWayBills.add(reportModel[i].getWayBillId());
						if(reportModel[i].getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_TO_PAY){

							//City Wise ToPay Details code
							cityWiseToPayeeDetails = (HashMap<Long, Object>)storeCityWiseToPayeeDetails.get(reportModel[i].getDestinationSubRegionId());

							if(cityWiseToPayeeDetails == null){
								cityWiseToPayeeDetails = new LinkedHashMap<>();

								cityWiseCollectionModel = (CityWiseCollectionModel)cityWiseToPayeeDetails.get(reportModel[i].getDestinationBranchId());

								if(cityWiseCollectionModel == null){

									cityWiseCollectionModel = new CityWiseCollectionModel();

									cityWiseCollectionModel.setBranchId(reportModel[i].getDestinationBranchId());
									cityWiseCollectionModel.setBranchName(reportModel[i].getWayBillDestinationBranch());
									cityWiseCollectionModel.setSubRegionId(reportModel[i].getDestinationSubRegionId());
									cityWiseCollectionModel.setSubRegionName(reportModel[i].getWayBillDestinationSubRegion());
									cityWiseCollectionModel.setTotalPaidAmount(-0);
									cityWiseCollectionModel.setTotalToPayAmount( - (reportModel[i].getGrandTotal() + reportModel[i].getAgentCommission()));
									cityWiseCollectionModel.setTotalCreditorAmount(-0);

									cityWiseToPayeeDetails.put(reportModel[i].getDestinationBranchId(), cityWiseCollectionModel);
								}else{
									cityWiseCollectionModel.setTotalPaidAmount(cityWiseCollectionModel.getTotalPaidAmount() - 0);
									cityWiseCollectionModel.setTotalToPayAmount(cityWiseCollectionModel.getTotalToPayAmount() - (reportModel[i].getGrandTotal() + reportModel[i].getAgentCommission()));
									cityWiseCollectionModel.setTotalCreditorAmount(cityWiseCollectionModel.getTotalCreditorAmount() - 0);
								}

								storeCityWiseToPayeeDetails.put(reportModel[i].getDestinationSubRegionId() ,cityWiseToPayeeDetails);
							}else{

								cityWiseCollectionModel = (CityWiseCollectionModel)cityWiseToPayeeDetails.get(reportModel[i].getDestinationBranchId());

								if(cityWiseCollectionModel == null){

									cityWiseCollectionModel = new CityWiseCollectionModel();

									cityWiseCollectionModel.setBranchId(reportModel[i].getDestinationBranchId());
									cityWiseCollectionModel.setBranchName(reportModel[i].getWayBillDestinationBranch());
									cityWiseCollectionModel.setSubRegionId(reportModel[i].getDestinationSubRegionId());
									cityWiseCollectionModel.setSubRegionName(reportModel[i].getWayBillDestinationSubRegion());
									cityWiseCollectionModel.setTotalPaidAmount(-0);
									cityWiseCollectionModel.setTotalToPayAmount(- (reportModel[i].getGrandTotal() + reportModel[i].getAgentCommission()));
									cityWiseCollectionModel.setTotalCreditorAmount(-0);

									cityWiseToPayeeDetails.put(reportModel[i].getDestinationBranchId(), cityWiseCollectionModel);
								}else{
									cityWiseCollectionModel.setTotalPaidAmount(cityWiseCollectionModel.getTotalPaidAmount() - 0);
									cityWiseCollectionModel.setTotalToPayAmount(cityWiseCollectionModel.getTotalToPayAmount() - (reportModel[i].getGrandTotal() + reportModel[i].getAgentCommission()));
									cityWiseCollectionModel.setTotalCreditorAmount(cityWiseCollectionModel.getTotalCreditorAmount() - 0);
								}
							}
							//City Wise ToPayee Details code
						} else if(reportModel[i].getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_PAID){

							//City Wise Paid Details code
							cityWiseToPayeeDetails = (HashMap<Long, Object>)storeCityWiseToPayeeDetails.get(reportModel[i].getDestinationSubRegionId());

							if(cityWiseToPayeeDetails == null){
								cityWiseToPayeeDetails = new LinkedHashMap<>();

								cityWiseCollectionModel = (CityWiseCollectionModel)cityWiseToPayeeDetails.get(reportModel[i].getDestinationBranchId());

								if(cityWiseCollectionModel == null){

									cityWiseCollectionModel = new CityWiseCollectionModel();

									cityWiseCollectionModel.setBranchId(reportModel[i].getDestinationBranchId());
									cityWiseCollectionModel.setBranchName(reportModel[i].getWayBillDestinationBranch());
									cityWiseCollectionModel.setSubRegionId(reportModel[i].getDestinationSubRegionId());
									cityWiseCollectionModel.setSubRegionName(reportModel[i].getWayBillDestinationSubRegion());
									cityWiseCollectionModel.setTotalPaidAmount(-reportModel[i].getGrandTotal());
									cityWiseCollectionModel.setTotalToPayAmount(-0);
									cityWiseCollectionModel.setTotalCreditorAmount(-0);

									cityWiseToPayeeDetails.put(reportModel[i].getDestinationBranchId(), cityWiseCollectionModel);
								}else{
									cityWiseCollectionModel.setTotalPaidAmount(cityWiseCollectionModel.getTotalPaidAmount() - reportModel[i].getGrandTotal());
									cityWiseCollectionModel.setTotalToPayAmount(cityWiseCollectionModel.getTotalToPayAmount() - 0);
									cityWiseCollectionModel.setTotalCreditorAmount(cityWiseCollectionModel.getTotalCreditorAmount() - 0);
								}
								storeCityWiseToPayeeDetails.put(reportModel[i].getDestinationSubRegionId() ,cityWiseToPayeeDetails);
							}else{

								cityWiseCollectionModel = (CityWiseCollectionModel)cityWiseToPayeeDetails.get(reportModel[i].getDestinationBranchId());

								if(cityWiseCollectionModel == null){

									cityWiseCollectionModel = new CityWiseCollectionModel();

									cityWiseCollectionModel.setBranchId(reportModel[i].getDestinationBranchId());
									cityWiseCollectionModel.setBranchName(reportModel[i].getWayBillDestinationBranch());
									cityWiseCollectionModel.setSubRegionId(reportModel[i].getDestinationSubRegionId());
									cityWiseCollectionModel.setSubRegionName(reportModel[i].getWayBillDestinationSubRegion());
									cityWiseCollectionModel.setTotalPaidAmount(-reportModel[i].getGrandTotal());
									cityWiseCollectionModel.setTotalToPayAmount(-0);
									cityWiseCollectionModel.setTotalCreditorAmount(-0);

									cityWiseToPayeeDetails.put(reportModel[i].getDestinationBranchId(), cityWiseCollectionModel);
								}else{
									cityWiseCollectionModel.setTotalPaidAmount(cityWiseCollectionModel.getTotalPaidAmount() - reportModel[i].getGrandTotal());
									cityWiseCollectionModel.setTotalToPayAmount(cityWiseCollectionModel.getTotalToPayAmount() - 0);
									cityWiseCollectionModel.setTotalCreditorAmount(cityWiseCollectionModel.getTotalCreditorAmount() - 0);
								}
							}
							//City Wise Paid Details code
						} else if(reportModel[i].getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_CREDIT && executive.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNT_GROUP_ID_KONDUSKAR_S_R_TRAVELS){
							//City Wise creditor Details code
							cityWiseToPayeeDetails = (HashMap<Long, Object>)storeCityWiseToPayeeDetails.get(reportModel[i].getDestinationSubRegionId());

							if(cityWiseToPayeeDetails == null){
								cityWiseToPayeeDetails = new LinkedHashMap<>();

								cityWiseCollectionModel = (CityWiseCollectionModel)cityWiseToPayeeDetails.get(reportModel[i].getDestinationBranchId());

								if(cityWiseCollectionModel == null){

									cityWiseCollectionModel = new CityWiseCollectionModel();

									cityWiseCollectionModel.setBranchId(reportModel[i].getDestinationBranchId());
									cityWiseCollectionModel.setBranchName(reportModel[i].getWayBillDestinationBranch());
									cityWiseCollectionModel.setSubRegionId(reportModel[i].getDestinationSubRegionId());
									cityWiseCollectionModel.setSubRegionName(reportModel[i].getWayBillDestinationSubRegion());
									cityWiseCollectionModel.setTotalPaidAmount(-0);
									cityWiseCollectionModel.setTotalToPayAmount(-0);
									cityWiseCollectionModel.setTotalCreditorAmount(-reportModel[i].getGrandTotal());

									cityWiseToPayeeDetails.put(reportModel[i].getDestinationBranchId(), cityWiseCollectionModel);
								}else{
									cityWiseCollectionModel.setTotalPaidAmount(cityWiseCollectionModel.getTotalPaidAmount() - 0);
									cityWiseCollectionModel.setTotalToPayAmount(cityWiseCollectionModel.getTotalToPayAmount() - 0);
									cityWiseCollectionModel.setTotalCreditorAmount(cityWiseCollectionModel.getTotalCreditorAmount() - reportModel[i].getGrandTotal());
								}

								storeCityWiseToPayeeDetails.put(reportModel[i].getDestinationSubRegionId() ,cityWiseToPayeeDetails);
							}else{

								cityWiseCollectionModel = (CityWiseCollectionModel)cityWiseToPayeeDetails.get(reportModel[i].getDestinationBranchId());

								if(cityWiseCollectionModel == null){

									cityWiseCollectionModel = new CityWiseCollectionModel();

									cityWiseCollectionModel.setBranchId(reportModel[i].getDestinationBranchId());
									cityWiseCollectionModel.setBranchName(reportModel[i].getWayBillDestinationBranch());
									cityWiseCollectionModel.setSubRegionId(reportModel[i].getDestinationSubRegionId());
									cityWiseCollectionModel.setSubRegionName(reportModel[i].getWayBillDestinationSubRegion());
									cityWiseCollectionModel.setTotalPaidAmount(-0);
									cityWiseCollectionModel.setTotalToPayAmount(-0);
									cityWiseCollectionModel.setTotalCreditorAmount(-reportModel[i].getGrandTotal());

									cityWiseToPayeeDetails.put(reportModel[i].getDestinationBranchId(), cityWiseCollectionModel);
								}else{
									cityWiseCollectionModel.setTotalPaidAmount(cityWiseCollectionModel.getTotalPaidAmount() - 0);
									cityWiseCollectionModel.setTotalToPayAmount(cityWiseCollectionModel.getTotalToPayAmount() - 0);
									cityWiseCollectionModel.setTotalCreditorAmount(cityWiseCollectionModel.getTotalCreditorAmount() - reportModel[i].getGrandTotal());
								}
							}
							//City Wise creditor Details code
						}
					}else if(reportModel[i].getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DELIVERED || reportModel[i].getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DELIVERED_BEFORE_CANCEL){
						deliveredWayBills.add(reportModel[i].getWayBillId());
						delivery.add(reportModel[i]);

						if (reportModel[i].getDeliveryDiscount() > 0 )
							doNotShowDelivery_Disc = true;

					}else if(reportModel[i].getStatus()==WayBillStatusConstant.WAYBILL_STATUS_CREDIT_DELIVERED)
						creditDelivery.put(reportModel[i].getWayBillId(), reportModel[i]);
					else if(reportModel[i].getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CANCELLED_DELIVERY)
						deliveryCancellation.add(reportModel[i]);

					if(isConfigDoorDelivery && (reportModel[i].getStatus()==WayBillStatusConstant.WAYBILL_STATUS_DUEDELIVERED||reportModel[i].getStatus()==WayBillStatusConstant.WAYBILL_STATUS_DUEUNDELIVERED)){
						if(reportModel[i].getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_PAID)
							reportModel[i].setGrandTotal(reportModel[i].getDeliveryAmount()-reportModel[i].getDeliveryDiscount());
						else if(reportModel[i].getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_FOC || reportModel[i].getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_CREDIT )
							reportModel[i].setGrandTotal(0);
						deuDeliver.put(reportModel[i].getWayBillId(), reportModel[i]);
					}

					if(reportModel[i].getStatus()==WayBillStatusConstant.WAYBILL_STATUS_BOOKED){
						if(reportModel[i].getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID) {
							totalBookingGrandAmount += reportModel[i].getGrandTotal();
							if (reportModel[i].getPaymentTypeId() == PaymentTypeConstant.PAYMENT_TYPE_PHONE_PAY_ID && showPhonePayAmount)
								totalPhonePeAmount += reportModel[i].getGrandTotal();
						}else if(reportModel[i].getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY)
							toPayCommissionToBeLess += reportModel[i].getAgentCommission();
						wayBillCategoryTypeDetails = wbCategoryTypeDetails.get(reportModel[i].getWayBillType());

						if(wayBillCategoryTypeDetails == null){
							wayBillCategoryTypeDetails = new WayBillCategoryTypeDetails();

							wayBillCategoryTypeDetails.setWayBillType(reportModel[i].getWayBillType());
							wayBillCategoryTypeDetails.setQuantity(reportModel[i].getNoOfPackages());
							wayBillCategoryTypeDetails.setBookingDiscount(totalDiscount);
							wayBillCategoryTypeDetails.setTotalTax(totalTax);
							wayBillCategoryTypeDetails.setTotalAmount(reportModel[i].getGrandTotal() - (reportModel[i].getDeliveryAmount() - reportModel[i].getDeliveryDiscount()));
							wayBillCategoryTypeDetails.setAgentCommission(reportModel[i].getAgentCommission());
							wayBillCategoryTypeDetails.setBookingCommission(reportModel[i].getBookingCommission());
							wayBillCategoryTypeDetails.setBookingTotal(reportModel[i].getGrandTotal());
							wayBillCategoryTypeDetails.setWayBillTypeId(reportModel[i].getWayBillTypeId());

							chargesCollection = new HashMap<>();

							for (final WayBillCharges wayBillCharge : wayBillCharges)
								if(wayBillCharge.getChargeType() == ChargeTypeMaster.WAYBILL_CHARGETYPE_BOOKING)
									chargesCollection.put(wayBillCharge.getWayBillChargeMasterId(), wayBillCharge.getChargeAmount());
							wayBillCategoryTypeDetails.setChargesCollection(chargesCollection);

							wbCategoryTypeDetails.put(reportModel[i].getWayBillType(), wayBillCategoryTypeDetails);
						}else{

							wayBillCategoryTypeDetails.setQuantity(wayBillCategoryTypeDetails.getQuantity() + reportModel[i].getNoOfPackages());
							wayBillCategoryTypeDetails.setBookingDiscount(wayBillCategoryTypeDetails.getBookingDiscount() + totalDiscount);
							wayBillCategoryTypeDetails.setTotalTax(wayBillCategoryTypeDetails.getTotalTax() + totalTax);
							wayBillCategoryTypeDetails.setTotalAmount(wayBillCategoryTypeDetails.getTotalAmount() + (reportModel[i].getGrandTotal() - (reportModel[i].getDeliveryAmount() - reportModel[i].getDeliveryDiscount())));
							wayBillCategoryTypeDetails.setAgentCommission(wayBillCategoryTypeDetails.getAgentCommission() + reportModel[i].getAgentCommission());
							wayBillCategoryTypeDetails.setBookingCommission(wayBillCategoryTypeDetails.getBookingCommission() + reportModel[i].getBookingCommission());
							wayBillCategoryTypeDetails.setBookingTotal(wayBillCategoryTypeDetails.getBookingTotal() + reportModel[i].getGrandTotal());

							chargesCollection = wayBillCategoryTypeDetails.getChargesCollection();

							for (final WayBillCharges wayBillCharge : wayBillCharges)
								if(wayBillCharge.getChargeType() == ChargeTypeMaster.WAYBILL_CHARGETYPE_BOOKING)
									if(chargesCollection.get(wayBillCharge.getWayBillChargeMasterId()) != null)
										chargesCollection.put(wayBillCharge.getWayBillChargeMasterId(), chargesCollection.get(wayBillCharge.getWayBillChargeMasterId()) + wayBillCharge.getChargeAmount());
									else
										chargesCollection.put(wayBillCharge.getWayBillChargeMasterId(), wayBillCharge.getChargeAmount());
						}

					}else if(reportModel[i].getStatus()==WayBillStatusConstant.WAYBILL_STATUS_CANCELLED && (reportModel[i].getWayBillTypeId() == WayBillType.WAYBILL_TYPE_PAID ||reportModel[i].getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY || reportModel[i].getWayBillTypeId() == WayBillType.WAYBILL_TYPE_CREDIT)){
						if(reportModel[i].getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID) {
							if (reportModel[i].getPaymentTypeId() == PaymentTypeConstant.PAYMENT_TYPE_PHONE_PAY_ID && showPhonePayAmount)
								totalPhonePeAmount -= Math.round(reportModel[i].getGrandTotal()-reportModel[i].getAmount());
							totalCancellationGrandAmount += Math.round(reportModel[i].getGrandTotal()-reportModel[i].getAmount());
						}
						else if(reportModel[i].getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY)
							totalCancellationGrandAmount += Math.round(-reportModel[i].getAmount());
						wayBillCategoryTypeDetails = wbCategoryTypeDetails.get(reportModel[i].getWayBillType());

						if(wayBillCategoryTypeDetails == null){
							wayBillCategoryTypeDetails = new WayBillCategoryTypeDetails();

							wayBillCategoryTypeDetails.setWayBillType(reportModel[i].getWayBillType());
							wayBillCategoryTypeDetails.setQuantity(-reportModel[i].getNoOfPackages());
							wayBillCategoryTypeDetails.setBookingDiscount(-totalDiscount);
							wayBillCategoryTypeDetails.setTotalTax(-totalTax);
							wayBillCategoryTypeDetails.setTotalAmount(- (reportModel[i].getGrandTotal()-reportModel[i].getAmount() - (reportModel[i].getDeliveryAmount() - reportModel[i].getDeliveryDiscount())));
							wayBillCategoryTypeDetails.setAgentCommission( - reportModel[i].getAgentCommission());
							wayBillCategoryTypeDetails.setBookingCommission( - reportModel[i].getBookingCommission());
							wayBillCategoryTypeDetails.setBookingTotal(-reportModel[i].getGrandTotal());

							chargesCollection = new HashMap<>();

							for(var k=0;k<wayBillCharges.length;k++)
								if(wayBillCharges[k].getChargeType() == ChargeTypeMaster.WAYBILL_CHARGETYPE_BOOKING)
									chargesCollection.put(wayBillCharges[k].getWayBillChargeMasterId(),- wayBillCharges[k].getChargeAmount());
							wayBillCategoryTypeDetails.setChargesCollection(chargesCollection);

							wbCategoryTypeDetails.put(reportModel[i].getWayBillType(), wayBillCategoryTypeDetails);
						}else{

							wayBillCategoryTypeDetails.setQuantity(wayBillCategoryTypeDetails.getQuantity() - reportModel[i].getNoOfPackages());
							wayBillCategoryTypeDetails.setBookingDiscount(wayBillCategoryTypeDetails.getBookingDiscount() - totalDiscount);
							wayBillCategoryTypeDetails.setTotalTax(wayBillCategoryTypeDetails.getTotalTax() - totalTax);
							wayBillCategoryTypeDetails.setTotalAmount(wayBillCategoryTypeDetails.getTotalAmount() - (reportModel[i].getGrandTotal()-reportModel[i].getAmount() - (reportModel[i].getDeliveryAmount() - reportModel[i].getDeliveryDiscount())));
							wayBillCategoryTypeDetails.setAgentCommission(wayBillCategoryTypeDetails.getAgentCommission() - reportModel[i].getAgentCommission());
							wayBillCategoryTypeDetails.setBookingCommission(wayBillCategoryTypeDetails.getBookingCommission() - reportModel[i].getBookingCommission());
							wayBillCategoryTypeDetails.setBookingTotal(wayBillCategoryTypeDetails.getBookingTotal() - reportModel[i].getGrandTotal());

							chargesCollection = wayBillCategoryTypeDetails.getChargesCollection();

							for(var k=0;k<wayBillCharges.length;k++)
								if(wayBillCharges[k].getChargeType() == ChargeTypeMaster.WAYBILL_CHARGETYPE_BOOKING)
									if(chargesCollection.get(wayBillCharges[k].getWayBillChargeMasterId()) != null)
										chargesCollection.put(wayBillCharges[k].getWayBillChargeMasterId(), chargesCollection.get(wayBillCharges[k].getWayBillChargeMasterId()) - wayBillCharges[k].getChargeAmount());
									else
										chargesCollection.put(wayBillCharges[k].getWayBillChargeMasterId(),- wayBillCharges[k].getChargeAmount());
						}
					}else if(reportModel[i].getStatus()==WayBillStatusConstant.WAYBILL_STATUS_DELIVERED){
						if (reportModel[i].getDeliveryPaymentTypeId() == PaymentTypeConstant.PAYMENT_TYPE_PHONE_PAY_ID && showPhonePayAmount)
							totalPhonePeAmount += reportModel[i].getDeliveryAmount();
						if(reportModel[i].getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_TO_PAY)
							totalDeliverGrandAmount +=  reportModel[i].getGrandTotal();
						else if(reportModel[i].getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_PAID || reportModel[i].getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_CREDIT)
							totalDeliverGrandAmount += reportModel[i].getDeliveryAmount()-reportModel[i].getDeliveryDiscount();

						var totalFreight = 0.00;
						var totalAmount 	= reportModel[i].getDeliveryAmount()-reportModel[i].getDeliveryDiscount();

						if(reportModel[i].getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_TO_PAY){
							totalFreight = reportModel[i].getGrandTotal()-(reportModel[i].getDeliveryAmount()-reportModel[i].getDeliveryDiscount());
							totalAmount = totalAmount + totalFreight;
						}

						wbCategoryTypeDetailsForDlvrd= deliveredWayBillDetails.get(reportModel[i].getWayBillType());

						if(wbCategoryTypeDetailsForDlvrd == null){
							wbCategoryTypeDetailsForDlvrd = new WayBillCategoryTypeDetails();

							wbCategoryTypeDetailsForDlvrd.setWayBillType(reportModel[i].getWayBillType());
							wbCategoryTypeDetailsForDlvrd.setQuantity(reportModel[i].getNoOfPackages());
							wbCategoryTypeDetailsForDlvrd.setTotalFreight(totalFreight);
							wbCategoryTypeDetailsForDlvrd.setDeliveryDiscount(reportModel[i].getDeliveryDiscount());
							wbCategoryTypeDetailsForDlvrd.setTotalAmount(totalAmount);
							wbCategoryTypeDetailsForDlvrd.setDeliveryCommission(reportModel[i].getDeliveryCommission());
							chargesCollection = new HashMap<>();

							for (final WayBillCharges wayBillCharge : wayBillCharges)
								if(wayBillCharge.getChargeType() == ChargeTypeMaster.WAYBILL_CHARGETYPE_DELIVERY)
									chargesCollection.put(wayBillCharge.getWayBillChargeMasterId(), wayBillCharge.getChargeAmount());
							wbCategoryTypeDetailsForDlvrd.setChargesCollection(chargesCollection);

							deliveredWayBillDetails.put(reportModel[i].getWayBillType(), wbCategoryTypeDetailsForDlvrd);
						}else{
							wbCategoryTypeDetailsForDlvrd.setQuantity(wbCategoryTypeDetailsForDlvrd.getQuantity() + reportModel[i].getNoOfPackages());
							wbCategoryTypeDetailsForDlvrd.setTotalFreight(wbCategoryTypeDetailsForDlvrd.getTotalFreight() + totalFreight);
							wbCategoryTypeDetailsForDlvrd.setDeliveryDiscount(wbCategoryTypeDetailsForDlvrd.getDeliveryDiscount() + reportModel[i].getDeliveryDiscount());
							wbCategoryTypeDetailsForDlvrd.setTotalAmount(wbCategoryTypeDetailsForDlvrd.getTotalAmount() + totalAmount);
							wbCategoryTypeDetailsForDlvrd.setDeliveryCommission(wbCategoryTypeDetailsForDlvrd.getDeliveryCommission() + reportModel[i].getDeliveryCommission());
							chargesCollection = wbCategoryTypeDetailsForDlvrd.getChargesCollection();

							for (final WayBillCharges wayBillCharge : wayBillCharges)
								if(wayBillCharge.getChargeType() == ChargeTypeMaster.WAYBILL_CHARGETYPE_DELIVERY)
									if(chargesCollection.get(wayBillCharge.getWayBillChargeMasterId()) != null)
										chargesCollection.put(wayBillCharge.getWayBillChargeMasterId(), chargesCollection.get(wayBillCharge.getWayBillChargeMasterId()) + wayBillCharge.getChargeAmount());
									else
										chargesCollection.put(wayBillCharge.getWayBillChargeMasterId(), wayBillCharge.getChargeAmount());
						}
					} else if(reportModel[i].getStatus()==WayBillStatusConstant.WAYBILL_STATUS_CANCELLED_DELIVERY){
						if(reportModel[i].getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_TO_PAY)
							totalDeliverGrandAmount -=  reportModel[i].getGrandTotal();
						else if(reportModel[i].getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_PAID || reportModel[i].getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_CREDIT)
							totalDeliverGrandAmount -= reportModel[i].getDeliveryAmount()-reportModel[i].getDeliveryDiscount();

						wbCategoryTypeDetailsForDlvrd = deliveredWayBillDetails.get(reportModel[i].getWayBillType());
						if(wbCategoryTypeDetailsForDlvrd == null){
							wbCategoryTypeDetailsForDlvrd = new WayBillCategoryTypeDetails();
							if(executive.getAccountGroupId()== CargoAccountGroupConstant.ACCOUNT_GROUP_ID_KONDUSKAR_S_R_TRAVELS && wayBillType.getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_TO_PAY){
								if(reportModel[i].isManual())
									wbCategoryTypeDetailsForDlvrd.setWayBillType("Topay manual Recovery");
								else
									wbCategoryTypeDetailsForDlvrd.setWayBillType("Topay Recovery");
							} else
								wbCategoryTypeDetailsForDlvrd.setWayBillType(reportModel[i].getWayBillType());
							wbCategoryTypeDetailsForDlvrd.setQuantity(-reportModel[i].getNoOfPackages());
							wbCategoryTypeDetailsForDlvrd.setTotalFreight(-reportModel[i].getBookingGrandTotal());
							wbCategoryTypeDetailsForDlvrd.setDeliveryDiscount(-reportModel[i].getDeliveryDiscount());
							wbCategoryTypeDetailsForDlvrd.setTotalAmount(-reportModel[i].getGrandTotal());
							wbCategoryTypeDetailsForDlvrd.setDeliveryCommission(-reportModel[i].getDeliveryCommission());
							chargesCollection = new HashMap<>();

							for (final WayBillCharges wayBillCharge : wayBillCharges)
								if(wayBillCharge.getChargeType() == ChargeTypeMaster.WAYBILL_CHARGETYPE_DELIVERY)
									chargesCollection.put(wayBillCharge.getWayBillChargeMasterId(), wayBillCharge.getChargeAmount());
							wbCategoryTypeDetailsForDlvrd.setChargesCollection(chargesCollection);

							deliveredWayBillDetails.put(reportModel[i].getWayBillType(), wbCategoryTypeDetailsForDlvrd);
						}else{
							wbCategoryTypeDetailsForDlvrd.setQuantity(wbCategoryTypeDetailsForDlvrd.getQuantity() - reportModel[i].getNoOfPackages());
							wbCategoryTypeDetailsForDlvrd.setTotalFreight(wbCategoryTypeDetailsForDlvrd.getTotalFreight() - reportModel[i].getBookingGrandTotal());
							wbCategoryTypeDetailsForDlvrd.setDeliveryDiscount(wbCategoryTypeDetailsForDlvrd.getDeliveryDiscount() - reportModel[i].getDeliveryDiscount());
							wbCategoryTypeDetailsForDlvrd.setTotalAmount(wbCategoryTypeDetailsForDlvrd.getTotalAmount() - reportModel[i].getGrandTotal());
							wbCategoryTypeDetailsForDlvrd.setDeliveryCommission(wbCategoryTypeDetailsForDlvrd.getDeliveryCommission() - reportModel[i].getDeliveryCommission());
							chargesCollection = wbCategoryTypeDetailsForDlvrd.getChargesCollection();

							for (final WayBillCharges wayBillCharge : wayBillCharges)
								if(wayBillCharge.getChargeType() == ChargeTypeMaster.WAYBILL_CHARGETYPE_DELIVERY)
									if(chargesCollection.get(wayBillCharge.getWayBillChargeMasterId()) != null)
										chargesCollection.put(wayBillCharge.getWayBillChargeMasterId(), chargesCollection.get(wayBillCharge.getWayBillChargeMasterId()) + wayBillCharge.getChargeAmount());
									else
										chargesCollection.put(wayBillCharge.getWayBillChargeMasterId(), wayBillCharge.getChargeAmount());
						}
					}
					reportModel[i].setStatusName(WayBillStatusConstant.getWayBillStatusType((short)reportModel[i].getCurrentStatus()));
				}
				
				request.setAttribute("isAgentBranch", isAgentBranch);
				request.setAttribute(DailyBranchCollectionReportConfigurationDTO.SHOW_BOOKING_DELIVERY_COMMISSION_RATE, configuration.getBoolean(DailyBranchCollectionReportConfigurationDTO.SHOW_BOOKING_DELIVERY_COMMISSION_RATE));
				request.setAttribute("bookingHandling", bookingHandling);
				request.setAttribute("wayBillTypeDetails", wbCategoryTypeDetails);
				request.setAttribute("deliveredWayBillDetails", deliveredWayBillDetails);
				request.setAttribute("totalGrandAmount", Math.round(totalBookingGrandAmount + totalDeliverGrandAmount - totalCancellationGrandAmount - toPayCommissionToBeLess));

				request.setAttribute("totalBookingAmount", Math.round(totalBookingGrandAmount));
				request.setAttribute("totalDeliveryAmount", Math.round(totalDeliverGrandAmount));
				request.setAttribute("totalCancellationAmount", Math.round(totalCancellationGrandAmount));
				request.setAttribute("totalPhonePeAmount",totalPhonePeAmount);
				request.setAttribute("showPhonePayAmount",showPhonePayAmount);
				request.setAttribute("totalBkgPaidLoadingAmount",totalBkgPaidLoadingAmount);

				if(doNotShow_Disc) request.setAttribute("doNotShow_Disc","false");
				if(doNotShowDelivery_Disc) request.setAttribute("doNotShowDelivery_Disc","false");
				if(doNotShow_Tax) request.setAttribute("doNotShow_Tax","false");
				if(doNotShow_Commission) request.setAttribute("doNotShow_Commission","false");

				//City Wise ToPayee Details code
				request.setAttribute("storeCityWiseToPayeeDetails", storeCityWiseToPayeeDetails);
				request.setAttribute("storeCityWiseToDLVPayeeDetails", storeCityWiseToDLVPayeeDetails);
				//City Wise ToPayee Details code

				if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_GROUPADMIN) {

					branch = cache.getBranchById(request ,executive.getAccountGroupId() , branchId);

					if(branch.getMappingTypeId() == Branch.BRANCH_MAP_ID_OWN_BRANCH_AND_ASSIGNED) {
						bookingCharges 	= cache.getBookingCharges(request, executive.getBranchId());
						deliveryCharges = cache.getDeliveryCharges(request, executive.getBranchId());
					} else {
						var accountId = 0L;

						if(reportModel[0].getStatus() == WayBillStatusConstant.WAYBILL_STATUS_BOOKED || reportModel[0].getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CANCELLED)
							accountId = reportModel[0].getAccountGroupId();
						else
							accountId = reportModel[0].getBookedForAccountGroupId();

						bookingCharges 	= cache.getBookingCharges(request, branchId);
						deliveryCharges = cache.getDeliveryCharges(request, branchId);

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
				chargeColumns.put("paidChargeColumns",paidChargeColumns);
				chargeColumns.put("cancellationChargeColumns",cancellationChargeColumns);
				chargeColumns.put("deliveryChargeColumns",deliveryChargeColumns);
				chargeColumns.put("creditDeliveryChargeColumns",creditDeliveryChargeColumns);
				chargeColumns.put("focChargeColumns",focChargeColumns);
				chargeColumns.put("focManualChargeColumns",focManualChargeColumns);
				chargeColumns.put("toPayChargeColumns",toPayChargeColumns);
				chargeColumns.put("creditorChargeColumns",creditorChargeColumns);
				chargeColumns.put("paidManualChargeColumns",paidManualChargeColumns);
				chargeColumns.put("toPayManualChargeColumns",toPayManualChargeColumns);
				chargeColumns.put("creditorManualChargeColumns",creditorManualChargeColumns);
				chargeColumns.put("dueDeliverChargeColumns",dueDeliverChargeColumns);
				//Non Zero Columns Collection : End

				request.setAttribute("chargeColumns",chargeColumns);
				request.setAttribute("BookingCharges",bookingCharges);
				request.setAttribute("DeliveryCharges",deliveryCharges);
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
				request.setAttribute("totalBkgFreightAmount",totalBkgFreightAmount);
				request.setAttribute("totalDlvryCmsnFreightAmount",totalDlvryCmsnFreightAmount);
				request.setAttribute("totalBkgLoadingAmount",totalBkgLoadingAmount);
				request.setAttribute("totalUnloadingAmount",totalUnloadingAmount);
				request.setAttribute("totalBkgAuto&DelUnlodinbg", Math.round(totalBookingGrandAmount + totalDeliverGrandAmount - (totalCancellationGrandAmount - toPayCommissionToBeLess))-(totalBkgAutoChargeAmount+totalUnloadingAmount+voucherDetailsAmnt));
				request.setAttribute(DailyBranchCollectionReportConfigurationDTO.SHOW_BOOKING_CHARGES_TO_GROUP_ADMIN, configuration.getBoolean(DailyBranchCollectionReportConfigurationDTO.SHOW_BOOKING_CHARGES_TO_GROUP_ADMIN));

				final var branchExpConfigValue = cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_BRANCH_EXPENSE);

				if(branchExpConfigValue == ConfigParam.CONFIG_KEY_BRANCH_EXPENSE_YES)
					request.setAttribute("BranchExpenseAmount",BranchExpenseDao.getInstance().getDailyBranchExpenseDetails(fromDate, toDate, branchId, executive.getAccountGroupId()));
			} else {
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}
			if(executive.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNT_GROUP_ID_PCPL)
				request.setAttribute("nextPageToken", "success_"+executive.getAccountGroupId());
			else
				request.setAttribute("nextPageToken", "success");

		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		} finally {
			executive					= null;
			sdf							= null;
			fromDate					= null;
			toDate						= null;
			branches					= null;
			cache						= null;
			objectIn					= null;
			objectOut					= null;
			wayBillIdArray				= null;
			reportViewModel				= null;
			paidChargeColumns			= null;
			cancellationChargeColumns	= null;
			wayBillExpenseModel			= null;
			deliveryChargeColumns		= null;
			creditDeliveryChargeColumns	= null;
			focChargeColumns			= null;
			focManualChargeColumns		= null;
			toPayChargeColumns			= null;
			creditorChargeColumns		= null;
			paidManualChargeColumns		= null;
			toPayManualChargeColumns	= null;
			creditorManualChargeColumns	= null;
			dueDeliverChargeColumns		= null;
			deliveredWayBills			= null;
			cancelledWayBills			= null;
			totalChargesAmount			= null;
			storeCityWiseToPayeeDetails	= null;
			cityWiseToPayeeDetails		= null;
			cityWiseCollectionModel		= null;
			wayBillType					= null;
			consDetails					= null;
			packageDetails				= null;
			wayBillCharges				= null;
			wayBillTax					= null;
			chargesCollection			= null;
			bookingCharges				= null;
			deliveryCharges				= null;
			branch						= null;
			bookedWayBillCategoryTypeDetails	= null;
			wayBillCategoryTypeDetails			= null;
			wbCategoryTypeDetailsForDlvrd		= null;
			reportModel							= null;
			booking								= null;
			cancellation						= null;
			delivery							= null;
			creditDelivery						= null;
			FOC									= null;
			FOCManual							= null;
			toPayeeBooking						= null;
			creditorBooking						= null;
			bookingManual						= null;
			toPayeeBookingManual				= null;
			creditorBookingManual				= null;
			deuDeliver							= null;
			chargeColumns						= null;
			wbCategoryTypeDetails 				= null;
			deliveredWayBillDetails				= null;
			wayBillDetails						= null;
		}
	}
}