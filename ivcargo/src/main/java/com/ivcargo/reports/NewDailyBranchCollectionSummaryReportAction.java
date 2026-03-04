package com.ivcargo.reports;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.Arrays;
import java.util.HashMap;
import java.util.LinkedHashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.dto.constant.ExecutiveTypeConstant;
import com.iv.dto.constant.PaymentTypeConstant;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.dto.constant.WayBillStatusConstant;
import com.iv.dto.constant.WayBillTypeConstant;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.exception.ExceptionProcess;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.BranchExpenseDao;
import com.platform.dao.ChargeTypeMasterDao;
import com.platform.dao.ConsignmentSummaryDao;
import com.platform.dao.CustomerDetailsDao;
import com.platform.dao.ExecutiveDao;
import com.platform.dao.VoucherDetailsDao;
import com.platform.dao.reports.DailyBranchCollectionDAO;
import com.platform.dao.reports.ReceivedStockActionDAO;
import com.platform.dao.reports.WayBillDetailsDAO;
import com.platform.dto.AccountGroupNetworkConfiguration;
import com.platform.dto.Branch;
import com.platform.dto.ChargeTypeMaster;
import com.platform.dto.ConfigParam;
import com.platform.dto.ConsignmentSummary;
import com.platform.dto.CustomerDetails;
import com.platform.dto.Executive;
import com.platform.dto.VoucherDetails;
import com.platform.dto.WayBillCharges;
import com.platform.dto.WayBillTaxTxn;
import com.platform.dto.WayBillType;
import com.platform.dto.configuration.report.collection.DailyBranchCollectionReportConfigurationDTO;
import com.platform.dto.constant.CargoAccountGroupConstant;
import com.platform.dto.model.ChargeTypeModel;
import com.platform.dto.model.CityWiseCollectionModel;
import com.platform.dto.model.DailyBranchCollectionReportModel;
import com.platform.dto.model.ReceivedStockReportModel;
import com.platform.dto.model.ReportViewModel;
import com.platform.dto.model.WayBillCategoryTypeDetails;
import com.platform.dto.model.WayBillDeatailsModel;
import com.platform.dto.model.WayBillExpenseModel;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

public class NewDailyBranchCollectionSummaryReportAction implements Action{

	private static final String TRACE_ID = "NewDailyBranchCollectionSummaryReportAction";
	@Override
	@SuppressWarnings({ "unchecked" })
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	error 	= null;
		Executive        							executive       					= null;
		SimpleDateFormat 							sdf             					= null;
		Timestamp        							fromDate        					= null;
		Timestamp        							toDate          					= null;
		Branch[]    								branches  							= null;
		CacheManip 									cache 								= null;
		ValueObject									objectIn							= null;
		Long[] 										wayBillIdArray						= null;
		WayBillCharges[]							wayBillCharges						= null;
		WayBillType									wayBillType							= null;
		WayBillTaxTxn[]								wayBillTax							= null;
		ChargeTypeModel[]							bookingCharges						= null;
		ChargeTypeModel[]							deliveryCharges						= null;
		Branch										branch								= null;
		ReportViewModel								reportViewModel 					= null;
		WayBillExpenseModel[]						wayBillExpenseModel					= null;
		DailyBranchCollectionReportModel[]			reportModel							= null;
		HashMap<String,WayBillCategoryTypeDetails>	wbCategoryTypeDetails				= null;
		HashMap<String,WayBillCategoryTypeDetails>	deliveredWayBillDetails				= null;
		HashMap<String,Double>						bookedWayBillCategoryTypeDetails	= null;
		HashMap<Long,Object>						storeCityWiseToPayeeDetails			= null;
		HashMap<Long,Object>						storeCityWiseToDLVPayeeDetails		= null;
		HashMap<Long,Object>						cityWiseToPayeeDetails				= null;
		HashMap<Long,Object>						cityWiseToPayeeDLVDetails			= null;
		CityWiseCollectionModel						cityWiseCollectionModel				= null;
		HashMap<Long, WayBillDeatailsModel>			wayBillDetails						= null;
		WayBillCategoryTypeDetails					wayBillCategoryTypeDetails			= null;
		HashMap<Long,Double>						chargesCollection					= null;
		WayBillCategoryTypeDetails					wbCategoryTypeDetailsForDlvrd		= null;
		var										reportFromNewFlow					= false;
		var										showGroupMergingBranchData			= false;
		var										isPaymentTypeNeeded					= false;
		AccountGroupNetworkConfiguration[]			assignedAccountGroupNetwork			= null;
		String										paymentTypes						= null;
		var											isAgentBranch						= false;
		var											addLoadingAmountForOwnBranch		= false;
		var											showPhonePayAmount					= false;
		var											showCalculationTable                = false;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeNewDailyBranchCollectionReportAction().execute(request, response);

			cache 						= new CacheManip(request);
			executive       			= cache.getExecutive(request);

			final var	configuration				= ReadAllConfigurationsBllImpl.getInstance().getOldReportConfigurationData(ReportIdentifierConstant.DAILY_BRANCH_COLLECTION_REPORT, executive.getAccountGroupId());
			reportFromNewFlow			= configuration.getBoolean(DailyBranchCollectionReportConfigurationDTO.REPORT_FROM_NEW_FLOW);
			showGroupMergingBranchData  = configuration.getBoolean(DailyBranchCollectionReportConfigurationDTO.SHOW_GROUP_MERGING_BRANCH_DATA);
			isPaymentTypeNeeded  		= configuration.getBoolean(DailyBranchCollectionReportConfigurationDTO.IS_PAYMENT_TYPE_NEEDED);
			paymentTypes				= configuration.getString(DailyBranchCollectionReportConfigurationDTO.PAYMENT_TYPE_LIST);
			addLoadingAmountForOwnBranch= configuration.getBoolean(DailyBranchCollectionReportConfigurationDTO.ADD_LOADING_AMOUNT_FOR_OWN_BRANCH);
			showPhonePayAmount			= configuration.getBoolean(DailyBranchCollectionReportConfigurationDTO.SHOW_PHONE_PE_AMOUNT_DEDUCTION);
			showCalculationTable    	= configuration.getBoolean(DailyBranchCollectionReportConfigurationDTO.SHOW_CALCULATION_TABLE);

			sdf             = new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			fromDate        = new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00").getTime());
			toDate          = new Timestamp(sdf.parse(JSPUtility.GetString(request, "toDate") + " 23:59:59").getTime());

			var selectedCity		= 0L;
			short paymentType		= 0;
			final var destinationCityId	= JSPUtility.GetLong(request, "TosubRegion",0);

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

			var   branchId = 0L;
			var 	voucherDetailsAmnt = 0D;
			objectIn			= new ValueObject();
			var	objectOut			= new ValueObject();

			if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_EXECUTIVE
					|| executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_BRANCHADMIN || executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_LIMITED
					|| executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_REGIONADMIN || executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_SUBREGIONADMIN) {
				branchId	= executive.getBranchId();
				branch		= cache.getBranchById(request, executive.getAccountGroupId(), executive.getBranchId());
			} else if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN) {
				branchId	= JSPUtility.GetLong(request, "branch", 0);
				branch		= cache.getBranchById(request, executive.getAccountGroupId(), branchId);
			}

			if (branch != null && branch.isAgentBranch()) {
				isAgentBranch = true;
				request.setAttribute("tdsAmount", branch.getTdsAmount());
			}

			request.setAttribute("isAgentBranch", isAgentBranch);
			request.setAttribute("addLoadingAmountForOwnBranch", addLoadingAmountForOwnBranch);

			final var	totalAmountForSummarry = VoucherDetailsDao.getInstance().getAmountForDailyBranchExpense(fromDate, toDate, branchId, executive.getAccountGroupId());

			if(totalAmountForSummarry != null)
				for (final VoucherDetails element : totalAmountForSummarry)
					voucherDetailsAmnt +=  element.getTotalAmount();

			objectIn.put("fromDate", fromDate);
			objectIn.put("toDate", toDate);
			objectIn.put("branchId", branchId);
			objectIn.put("accountGroupId", executive.getAccountGroupId());
			objectIn.put("paymentType",paymentType);
			objectIn.put("filter", 1);
			objectIn.put("destinationCityId", destinationCityId);
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

			wbCategoryTypeDetails	= new HashMap<>();
			deliveredWayBillDetails	= new HashMap<>();
			var totalBookingGrandAmount 		= 0D;
			var totalCancellationGrandAmount = 0D;
			var totalDeliverGrandAmount 		= 0D;
			var toPayCommissionToBeLess 		= 0D;
			final var totalBkgFreightAmount 		= 0D;
			var totalDlvryCmsnFreightAmount 	= 0D;
			var totalBkgLoadingAmount 		= 0D;
			var totalUnloadingAmount 		= 0D;
			var totalBkgAutoChargeAmount		= 0D;
			var totalPhonePeAmount				= 0D;
			var totalBkgPaidLoadingAmount		= 0D;
			var bookingCommission				= 0D;
			var deliveryCommission				= 0D;
			var bookingHandling					= 0D;

			//City Wise ToPayee Details code
			storeCityWiseToPayeeDetails = new LinkedHashMap<>();
			storeCityWiseToDLVPayeeDetails = new LinkedHashMap<>();
			//City Wise ToPayee Details code

			if(reportModel != null && wayBillIdArray != null){

				var doNotShow_Disc = false; // if any disc found then column will be generated for disc in report
				var doNotShow_Tax = false;  // if any tax found then column will be generated for tax in report
				var doNotShow_Commission = false; // if any commission found then column will be generated for commission in report

				//Get WayBill Details code ( Start )
				wayBillDetails = WayBillDetailsDAO.getInstance().getWayBillDetails(wayBillIdArray ,true ,ChargeTypeMaster.WAYBILL_CHARGETYPE_BOTH ,true ,WayBillTaxTxn.WAYBILL_TAX_TXN_TYPE_BOOKING ,false);
				//Get WayBill Details code ( End )


				for(var i = 0; i < reportModel.length; i++) {
					//set flag for commission column generation
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
						reportModel[i].setWayBillType(wayBillType.getWayBillType() + WayBillType.WAYBILL_TYPE_MANUAL);
					else reportModel[i].setWayBillType(wayBillType.getWayBillType());

					//WayBill Charges (Booking & Delivery)

					wayBillCharges = wayBillDetails.get(reportModel[i].getWayBillId()).getWayBillCharges();
					bookedWayBillCategoryTypeDetails = new HashMap<>();

					var chargeAmt = 0D;

					for (final WayBillCharges wayBillCharge : wayBillCharges) {
						chargeAmt = wayBillCharge.getChargeAmount();

						if(reportModel[i].getStatus() != WayBillStatusConstant.WAYBILL_STATUS_DELIVERED
								&& wayBillCharge.getChargeType() == ChargeTypeMaster.WAYBILL_CHARGETYPE_BOOKING){

							bookedWayBillCategoryTypeDetails.put(""+wayBillCharge.getWayBillChargeMasterId(), chargeAmt);

							if(wayBillCharge.getWayBillChargeMasterId() == ChargeTypeMaster.LOADING)
								totalBkgLoadingAmount += chargeAmt;
							

							if(wayBillCharge.getWayBillChargeMasterId() == ChargeTypeMaster.HANDLING) {
								if(reportModel[i].getStatus()== WayBillStatusConstant.WAYBILL_STATUS_BOOKED) 
									bookingHandling += chargeAmt;
								else if(reportModel[i].getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CANCELLED)
									bookingHandling -= chargeAmt;
							}
							
							if(wayBillCharge.getWayBillChargeMasterId() == ChargeTypeMaster.LOADING && reportModel[i].getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID)
								if(reportModel[i].getStatus() == WayBillStatusConstant.WAYBILL_STATUS_BOOKED)
									totalBkgPaidLoadingAmount += chargeAmt;
								else if(reportModel[i].getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CANCELLED)
									totalBkgPaidLoadingAmount -= chargeAmt;

							if(executive.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNT_GROUP_ID_ROYAL_STAR
									&& wayBillCharge.getWayBillChargeMasterId() == ChargeTypeMaster.AUTO_BOOKING)
								if(reportModel[i].getStatus() == WayBillStatusConstant.WAYBILL_STATUS_BOOKED)
									totalBkgAutoChargeAmount += chargeAmt;
								else
									totalBkgAutoChargeAmount -= chargeAmt;
						}

						if(reportModel[i].getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DELIVERED) {
							if(wayBillCharge.getChargeType() == ChargeTypeMaster.WAYBILL_CHARGETYPE_DELIVERY) {
								bookedWayBillCategoryTypeDetails.put(""+wayBillCharge.getWayBillChargeMasterId(), chargeAmt);

								if(wayBillCharge.getWayBillChargeMasterId() == ChargeTypeMaster.UNLOADING)
									totalUnloadingAmount += chargeAmt;
								
							
							}

							if(wayBillCharge.getWayBillChargeMasterId() == ChargeTypeMaster.FREIGHT && reportModel[i].getDeliveryCommission() > 0)
								totalDlvryCmsnFreightAmount	+= chargeAmt;
						}
					}

					reportModel[i].setChargesCollection(bookedWayBillCategoryTypeDetails);
					//end

					//Calculate Total WayBill Tax
					wayBillTax = wayBillDetails.get(reportModel[i].getWayBillId()).getWayBillTaxTxn();
					var totalTax 	= 0D;

					if(wayBillTax != null)
						totalTax 	= Arrays.asList(wayBillTax).stream().map(WayBillTaxTxn::getTaxAmount).mapToDouble(Double::doubleValue).sum();

					if(totalTax > 0)
						doNotShow_Tax = true;

					reportModel[i].setTotalTax(totalTax);
					//end

					//Calculate Total Discount
					var totalDiscount 		= 0.00;

					if(reportModel[i].isDiscountPercent())
						totalDiscount = Math.round(reportModel[i].getAmount() * reportModel[i].getDiscount() / 100);
					else
						totalDiscount = reportModel[i].getDiscount();

					reportModel[i].setDiscount(totalDiscount);

					if(totalDiscount > 0)
						doNotShow_Disc = true;

					if(reportModel[i].getStatus() == WayBillStatusConstant.WAYBILL_STATUS_BOOKED) {
						if(reportModel[i].getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID) {
							//City Wise Paid Details code
							cityWiseToPayeeDetails = (HashMap<Long, Object>)storeCityWiseToPayeeDetails.get(reportModel[i].getDestinationSubRegionId());

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

									cityWiseToPayeeDetails.put(reportModel[i].getDestinationBranchId(), cityWiseCollectionModel);
								} else {
									cityWiseCollectionModel.setTotalPaidAmount(cityWiseCollectionModel.getTotalPaidAmount() + reportModel[i].getGrandTotal());
									cityWiseCollectionModel.setTotalToPayAmount(cityWiseCollectionModel.getTotalToPayAmount() + 0);
									cityWiseCollectionModel.setTotalCreditorAmount(cityWiseCollectionModel.getTotalCreditorAmount() + 0);
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

									cityWiseToPayeeDetails.put(reportModel[i].getDestinationBranchId(), cityWiseCollectionModel);
								} else {
									cityWiseCollectionModel.setTotalPaidAmount(cityWiseCollectionModel.getTotalPaidAmount() + reportModel[i].getGrandTotal());
									cityWiseCollectionModel.setTotalToPayAmount(cityWiseCollectionModel.getTotalToPayAmount() + 0);
									cityWiseCollectionModel.setTotalCreditorAmount(cityWiseCollectionModel.getTotalCreditorAmount() + 0);
								}
							}
							//City Wise Paid Details code
						} else if(reportModel[i].getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY) {
							//City Wise ToPayee Details code
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
									cityWiseCollectionModel.setTotalPaidAmount(0);
									cityWiseCollectionModel.setTotalToPayAmount(reportModel[i].getGrandTotal() + reportModel[i].getAgentCommission());
									cityWiseCollectionModel.setTotalCreditorAmount(0);

									cityWiseToPayeeDetails.put(reportModel[i].getDestinationBranchId(), cityWiseCollectionModel);
								} else {
									cityWiseCollectionModel.setTotalPaidAmount(cityWiseCollectionModel.getTotalPaidAmount() + 0);
									cityWiseCollectionModel.setTotalToPayAmount(cityWiseCollectionModel.getTotalToPayAmount() + reportModel[i].getGrandTotal() + reportModel[i].getAgentCommission());
									cityWiseCollectionModel.setTotalCreditorAmount(cityWiseCollectionModel.getTotalCreditorAmount() + 0);
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
									cityWiseCollectionModel.setTotalPaidAmount(0);
									cityWiseCollectionModel.setTotalToPayAmount(reportModel[i].getGrandTotal() +  + reportModel[i].getAgentCommission());
									cityWiseCollectionModel.setTotalCreditorAmount(0);

									cityWiseToPayeeDetails.put(reportModel[i].getDestinationBranchId(), cityWiseCollectionModel);
								} else {
									cityWiseCollectionModel.setTotalPaidAmount(cityWiseCollectionModel.getTotalPaidAmount() + 0);
									cityWiseCollectionModel.setTotalToPayAmount(cityWiseCollectionModel.getTotalToPayAmount() + reportModel[i].getGrandTotal() +  + reportModel[i].getAgentCommission());
									cityWiseCollectionModel.setTotalCreditorAmount(cityWiseCollectionModel.getTotalCreditorAmount() + 0);
								}

							}
							//City Wise ToPayee Details code
						}else if(reportModel[i].getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_CREDIT
								&& executive.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNT_GROUP_ID_KONDUSKAR_S_R_TRAVELS){
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
							//City Wise ToPayee Details code
						}

					}else if(reportModel[i].getStatus()==WayBillStatusConstant.WAYBILL_STATUS_CANCELLED)
						if(reportModel[i].getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_TO_PAY){

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
									cityWiseCollectionModel.setTotalToPayAmount( - (reportModel[i].getGrandTotal() + reportModel[i].getAgentCommission()));
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

						} else if(reportModel[i].getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_CREDIT
								&& executive.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNT_GROUP_ID_KONDUSKAR_S_R_TRAVELS){
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
							//City Wise Paid Details code
						}

					if(reportModel[i].getStatus()==WayBillStatusConstant.WAYBILL_STATUS_BOOKED){
						if (reportModel[i].getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID) {
							totalBookingGrandAmount += reportModel[i].getGrandTotal();
							if (reportModel[i].getPaymentTypeId() == PaymentTypeConstant.PAYMENT_TYPE_PHONE_PAY_ID && showPhonePayAmount)
								totalPhonePeAmount += reportModel[i].getGrandTotal();
						} else if (reportModel[i].getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY)
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
							wayBillCategoryTypeDetails.setBookingTotal(reportModel[i].getGrandTotal());

							chargesCollection = wayBillCategoryTypeDetails.getChargesCollection();

							for (final WayBillCharges wayBillCharge : wayBillCharges)
								if(wayBillCharge.getChargeType() == ChargeTypeMaster.WAYBILL_CHARGETYPE_BOOKING)
									if(chargesCollection.get(wayBillCharge.getWayBillChargeMasterId()) != null)
										chargesCollection.put(wayBillCharge.getWayBillChargeMasterId(), chargesCollection.get(wayBillCharge.getWayBillChargeMasterId()) + wayBillCharge.getChargeAmount());
									else
										chargesCollection.put(wayBillCharge.getWayBillChargeMasterId(), wayBillCharge.getChargeAmount());
						}

					}else if(reportModel[i].getStatus()==WayBillStatusConstant.WAYBILL_STATUS_CANCELLED && (reportModel[i].getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID ||reportModel[i].getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY || reportModel[i].getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT)){
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
							wayBillCategoryTypeDetails.setAgentCommission(- reportModel[i].getAgentCommission());
							wayBillCategoryTypeDetails.setBookingCommission(- reportModel[i].getBookingCommission());

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
						if (reportModel[i].getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY)
							totalDeliverGrandAmount += reportModel[i].getGrandTotal();
						else if(reportModel[i].getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_PAID || reportModel[i].getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_CREDIT)
							totalDeliverGrandAmount += reportModel[i].getDeliveryAmount()-reportModel[i].getDeliveryDiscount();

						var totalFreight 			= 0.00;
						var totalAmount 			= reportModel[i].getDeliveryAmount()-reportModel[i].getDeliveryDiscount();

						if(reportModel[i].getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_TO_PAY){
							totalFreight = reportModel[i].getGrandTotal()-(reportModel[i].getDeliveryAmount()-reportModel[i].getDeliveryDiscount());
							totalAmount = totalAmount + totalFreight;
						}

						wbCategoryTypeDetailsForDlvrd = deliveredWayBillDetails.get(reportModel[i].getWayBillType());

						if(executive.getAccountGroupId()==CargoAccountGroupConstant.ACCOUNT_GROUP_ID_KONDUSKAR_S_R_TRAVELS)
							if(reportModel[i].getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_PAID){

								//City Wise Paid Details code
								cityWiseToPayeeDLVDetails = (HashMap<Long, Object>)storeCityWiseToDLVPayeeDetails.get(reportModel[i].getWayBillSourceSubRegionId());

								if(cityWiseToPayeeDLVDetails == null){
									cityWiseToPayeeDLVDetails = new LinkedHashMap<>();

									cityWiseCollectionModel = (CityWiseCollectionModel)cityWiseToPayeeDLVDetails.get(reportModel[i].getWayBillSourceBranchId());

									if(cityWiseCollectionModel == null){

										cityWiseCollectionModel = new CityWiseCollectionModel();

										cityWiseCollectionModel.setBranchId(reportModel[i].getWayBillSourceBranchId());
										cityWiseCollectionModel.setBranchName(reportModel[i].getWayBillSourceBranch());
										cityWiseCollectionModel.setSubRegionId(reportModel[i].getWayBillSourceSubRegionId());
										cityWiseCollectionModel.setSubRegionName(reportModel[i].getWayBillSourceSubRegion());
										cityWiseCollectionModel.setTotalPaidAmount(reportModel[i].getDeliveryAmount());
										cityWiseCollectionModel.setTotalToPayAmount(0);
										cityWiseCollectionModel.setTotalCreditorAmount(0);

										cityWiseToPayeeDLVDetails.put(reportModel[i].getWayBillSourceBranchId(), cityWiseCollectionModel);
									}else{
										cityWiseCollectionModel.setTotalPaidAmount(cityWiseCollectionModel.getTotalPaidAmount() + reportModel[i].getDeliveryAmount());
										cityWiseCollectionModel.setTotalToPayAmount(cityWiseCollectionModel.getTotalToPayAmount() + 0);
										cityWiseCollectionModel.setTotalCreditorAmount(cityWiseCollectionModel.getTotalCreditorAmount() + 0);
									}

									storeCityWiseToDLVPayeeDetails.put(reportModel[i].getWayBillSourceSubRegionId() ,cityWiseToPayeeDLVDetails);
								}else{

									cityWiseCollectionModel = (CityWiseCollectionModel)cityWiseToPayeeDLVDetails.get(reportModel[i].getWayBillSourceBranchId());

									if(cityWiseCollectionModel == null){

										cityWiseCollectionModel = new CityWiseCollectionModel();

										cityWiseCollectionModel.setBranchId(reportModel[i].getWayBillSourceBranchId());
										cityWiseCollectionModel.setBranchName(reportModel[i].getWayBillSourceBranch());
										cityWiseCollectionModel.setSubRegionId(reportModel[i].getWayBillSourceSubRegionId());
										cityWiseCollectionModel.setSubRegionName(reportModel[i].getWayBillSourceSubRegion());
										cityWiseCollectionModel.setTotalPaidAmount(reportModel[i].getDeliveryAmount());
										cityWiseCollectionModel.setTotalToPayAmount(0);
										cityWiseCollectionModel.setTotalCreditorAmount(0);

										cityWiseToPayeeDLVDetails.put(reportModel[i].getWayBillSourceBranchId(), cityWiseCollectionModel);
									}else{
										cityWiseCollectionModel.setTotalPaidAmount(cityWiseCollectionModel.getTotalPaidAmount() + reportModel[i].getDeliveryAmount());
										cityWiseCollectionModel.setTotalToPayAmount(cityWiseCollectionModel.getTotalToPayAmount() + 0);
										cityWiseCollectionModel.setTotalCreditorAmount(cityWiseCollectionModel.getTotalCreditorAmount() + 0);
									}

								}
								//City Wise Paid Details code

							}else if(reportModel[i].getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_TO_PAY ){
								//City Wise ToPayee Details code
								cityWiseToPayeeDLVDetails = (HashMap<Long, Object>)storeCityWiseToDLVPayeeDetails.get(reportModel[i].getWayBillSourceSubRegionId());

								if(cityWiseToPayeeDLVDetails == null){
									cityWiseToPayeeDLVDetails = new LinkedHashMap<>();

									cityWiseCollectionModel = (CityWiseCollectionModel)cityWiseToPayeeDLVDetails.get(reportModel[i].getWayBillSourceBranchId());

									if(cityWiseCollectionModel == null){

										cityWiseCollectionModel = new CityWiseCollectionModel();

										cityWiseCollectionModel.setBranchId(reportModel[i].getWayBillSourceBranchId());
										cityWiseCollectionModel.setBranchName(reportModel[i].getWayBillSourceBranch());
										cityWiseCollectionModel.setSubRegionId(reportModel[i].getWayBillSourceSubRegionId());
										cityWiseCollectionModel.setSubRegionName(reportModel[i].getWayBillSourceSubRegion());
										cityWiseCollectionModel.setTotalPaidAmount(0);
										cityWiseCollectionModel.setTotalToPayAmount(reportModel[i].getGrandTotal());
										cityWiseCollectionModel.setTotalCreditorAmount(0);

										cityWiseToPayeeDLVDetails.put(reportModel[i].getWayBillSourceBranchId(), cityWiseCollectionModel);
									}else{
										cityWiseCollectionModel.setTotalPaidAmount(cityWiseCollectionModel.getTotalPaidAmount() + 0);
										cityWiseCollectionModel.setTotalToPayAmount(cityWiseCollectionModel.getTotalToPayAmount() + reportModel[i].getGrandTotal());
										cityWiseCollectionModel.setTotalCreditorAmount(cityWiseCollectionModel.getTotalCreditorAmount() + 0);
									}

									storeCityWiseToDLVPayeeDetails.put(reportModel[i].getWayBillSourceSubRegionId() ,cityWiseToPayeeDLVDetails);
								}else{

									cityWiseCollectionModel = (CityWiseCollectionModel)cityWiseToPayeeDLVDetails.get(reportModel[i].getWayBillSourceBranchId());

									if(cityWiseCollectionModel == null){

										cityWiseCollectionModel = new CityWiseCollectionModel();

										cityWiseCollectionModel.setBranchId(reportModel[i].getWayBillSourceBranchId());
										cityWiseCollectionModel.setBranchName(reportModel[i].getWayBillSourceBranch());
										cityWiseCollectionModel.setSubRegionId(reportModel[i].getWayBillSourceSubRegionId());
										cityWiseCollectionModel.setSubRegionName(reportModel[i].getWayBillSourceSubRegion());
										cityWiseCollectionModel.setTotalPaidAmount(0);
										cityWiseCollectionModel.setTotalToPayAmount(reportModel[i].getGrandTotal());
										cityWiseCollectionModel.setTotalCreditorAmount(0);

										cityWiseToPayeeDLVDetails.put(reportModel[i].getWayBillSourceBranchId(), cityWiseCollectionModel);
									}else{
										cityWiseCollectionModel.setTotalPaidAmount(cityWiseCollectionModel.getTotalPaidAmount() + 0);
										cityWiseCollectionModel.setTotalToPayAmount(cityWiseCollectionModel.getTotalToPayAmount() + reportModel[i].getGrandTotal());
										cityWiseCollectionModel.setTotalCreditorAmount(cityWiseCollectionModel.getTotalCreditorAmount() + 0);
									}

								}
								//City Wise ToPayee Details code
							}else if(reportModel[i].getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_CREDIT ){

								//City Wise ToPayee Details code
								cityWiseToPayeeDLVDetails = (HashMap<Long, Object>)storeCityWiseToDLVPayeeDetails.get(reportModel[i].getWayBillSourceSubRegionId());

								if(cityWiseToPayeeDLVDetails == null){
									cityWiseToPayeeDLVDetails = new LinkedHashMap<>();

									cityWiseCollectionModel = (CityWiseCollectionModel)cityWiseToPayeeDLVDetails.get(reportModel[i].getWayBillSourceBranchId());

									if(cityWiseCollectionModel == null){

										cityWiseCollectionModel = new CityWiseCollectionModel();

										cityWiseCollectionModel.setBranchId(reportModel[i].getWayBillSourceBranchId());
										cityWiseCollectionModel.setBranchName(reportModel[i].getWayBillSourceBranch());
										cityWiseCollectionModel.setSubRegionId(reportModel[i].getWayBillSourceSubRegionId());
										cityWiseCollectionModel.setSubRegionName(reportModel[i].getWayBillSourceSubRegion());
										cityWiseCollectionModel.setTotalPaidAmount(0);
										cityWiseCollectionModel.setTotalToPayAmount(0);
										cityWiseCollectionModel.setTotalCreditorAmount(reportModel[i].getDeliveryAmount());

										cityWiseToPayeeDLVDetails.put(reportModel[i].getWayBillSourceBranchId() , cityWiseCollectionModel);
									}else{
										cityWiseCollectionModel.setTotalPaidAmount(cityWiseCollectionModel.getTotalPaidAmount() + 0);
										cityWiseCollectionModel.setTotalToPayAmount(cityWiseCollectionModel.getTotalToPayAmount() + 0);
										cityWiseCollectionModel.setTotalCreditorAmount(cityWiseCollectionModel.getTotalCreditorAmount() + reportModel[i].getDeliveryAmount());
									}

									storeCityWiseToDLVPayeeDetails.put(reportModel[i].getWayBillSourceSubRegionId() ,cityWiseToPayeeDLVDetails);
								}else{

									cityWiseCollectionModel = (CityWiseCollectionModel)cityWiseToPayeeDLVDetails.get(reportModel[i].getWayBillSourceBranchId());

									if(cityWiseCollectionModel == null){

										cityWiseCollectionModel = new CityWiseCollectionModel();

										cityWiseCollectionModel.setBranchId(reportModel[i].getWayBillSourceBranchId());
										cityWiseCollectionModel.setBranchName(reportModel[i].getWayBillSourceBranch());
										cityWiseCollectionModel.setSubRegionId(reportModel[i].getWayBillSourceSubRegionId());
										cityWiseCollectionModel.setSubRegionName(reportModel[i].getWayBillSourceSubRegion());
										cityWiseCollectionModel.setTotalPaidAmount(0);
										cityWiseCollectionModel.setTotalToPayAmount(0);
										cityWiseCollectionModel.setTotalCreditorAmount(reportModel[i].getGrandTotal());

										cityWiseToPayeeDLVDetails.put(reportModel[i].getDestinationBranchId(), cityWiseCollectionModel);
									}else{
										cityWiseCollectionModel.setTotalPaidAmount(cityWiseCollectionModel.getTotalPaidAmount() + 0);
										cityWiseCollectionModel.setTotalToPayAmount(cityWiseCollectionModel.getTotalToPayAmount() + 0);
										cityWiseCollectionModel.setTotalCreditorAmount(cityWiseCollectionModel.getTotalCreditorAmount() + reportModel[i].getGrandTotal());
									}

								}
								//City Wise ToPayee Details code

							}

						if(wbCategoryTypeDetailsForDlvrd == null){
							wbCategoryTypeDetailsForDlvrd = new WayBillCategoryTypeDetails();
							if(executive.getAccountGroupId()== CargoAccountGroupConstant.ACCOUNT_GROUP_ID_KONDUSKAR_S_R_TRAVELS && wayBillType.getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_TO_PAY){
								if(reportModel[i].isManual())
									wbCategoryTypeDetailsForDlvrd.setWayBillType("Topay manual Recovery");
								else
									wbCategoryTypeDetailsForDlvrd.setWayBillType("Topay Recovery");
							} else
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
					} else if(reportModel[i].getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CANCELLED_DELIVERY){
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
				}

				if(doNotShow_Disc) request.setAttribute("doNotShow_Disc","false");
				if(doNotShow_Tax) request.setAttribute("doNotShow_Tax","false");
				if(doNotShow_Commission) request.setAttribute("doNotShow_Commission","false");

				request.setAttribute("wayBillTypeDetails", wbCategoryTypeDetails);
				request.setAttribute("deliveredWayBillDetails", deliveredWayBillDetails);
				request.setAttribute("storeCityWiseToDLVPayeeDetails", storeCityWiseToDLVPayeeDetails);
				request.setAttribute("totalGrandAmount", Math.round(totalBookingGrandAmount + totalDeliverGrandAmount - totalCancellationGrandAmount - toPayCommissionToBeLess));
				request.setAttribute("totalPhonePeAmount",totalPhonePeAmount);
				request.setAttribute("showPhonePayAmount",showPhonePayAmount);
				request.setAttribute("totalBkgPaidLoadingAmount",totalBkgPaidLoadingAmount);

				request.setAttribute("totalDeliverGrandAmount",totalDeliverGrandAmount);
				request.setAttribute("showCalculationTable",showCalculationTable);

				//City Wise ToPayee Details code
				request.setAttribute("storeCityWiseToPayeeDetails", storeCityWiseToPayeeDetails);
				//City Wise ToPayee Details code

				if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN) {
					branch = cache.getBranchById(request ,executive.getAccountGroupId() ,branchId);

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

						bookingCharges 	= cache.getBookingCharges(request, branchId);
						deliveryCharges = cache.getDeliveryCharges(request, branchId);

						if(bookingCharges == null)
							bookingCharges  	= ChargeTypeMasterDao.getInstance().getChargeConfiguration(accountId, branch.getAgencyId(), branch.getBranchId(),ChargeTypeMaster.WAYBILL_CHARGETYPE_BOOKING);

						if(deliveryCharges == null)
							deliveryCharges 	= ChargeTypeMasterDao.getInstance().getChargeConfiguration(accountId, branch.getAgencyId(), branch.getBranchId(),ChargeTypeMaster.WAYBILL_CHARGETYPE_DELIVERY);

						if(deliveryCharges == null)
							deliveryCharges = new ChargeTypeModel[0];
					}
				} else {
					bookingCharges 	= cache.getBookingCharges(request, executive.getBranchId());
					deliveryCharges = cache.getDeliveryCharges(request, executive.getBranchId());
				}

				request.setAttribute(DailyBranchCollectionReportConfigurationDTO.SHOW_BOOKING_DELIVERY_COMMISSION_RATE, configuration.getBoolean(DailyBranchCollectionReportConfigurationDTO.SHOW_BOOKING_DELIVERY_COMMISSION_RATE));
				request.setAttribute("bookingHandling", bookingHandling);
				request.setAttribute("BookingCharges", bookingCharges);
				request.setAttribute("DeliveryCharges", deliveryCharges);
				request.setAttribute("totalBkgFreightAmount", totalBkgFreightAmount);
				request.setAttribute("totalDlvryCmsnFreightAmount", totalDlvryCmsnFreightAmount);
				request.setAttribute("totalBkgLoadingAmount", totalBkgLoadingAmount);
				request.setAttribute("totalUnloadingAmount", totalUnloadingAmount);
				request.setAttribute("totalBkgAuto&DelUnlodinbg", Math.round(totalBookingGrandAmount + totalDeliverGrandAmount - (totalCancellationGrandAmount - toPayCommissionToBeLess))-(totalBkgAutoChargeAmount+totalUnloadingAmount+voucherDetailsAmnt));
				request.setAttribute(DailyBranchCollectionReportConfigurationDTO.SHOW_BOOKING_CHARGES_TO_GROUP_ADMIN, configuration.getBoolean(DailyBranchCollectionReportConfigurationDTO.SHOW_BOOKING_CHARGES_TO_GROUP_ADMIN));
				request.setAttribute(DailyBranchCollectionReportConfigurationDTO.SHOW_LOADING_AND_UNLOADING_CHARGE, configuration.getBoolean(DailyBranchCollectionReportConfigurationDTO.SHOW_LOADING_AND_UNLOADING_CHARGE));


				final var branchExpConfigValue = cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_BRANCH_EXPENSE);

				if(branchExpConfigValue == ConfigParam.CONFIG_KEY_BRANCH_EXPENSE_YES)
					request.setAttribute("BranchExpenseAmount",BranchExpenseDao.getInstance().getDailyBranchExpenseDetails(fromDate, toDate, branchId, executive.getAccountGroupId()));

				if(configuration.getBoolean(DailyBranchCollectionReportConfigurationDTO.GET_CITY_WISE_RECEIVED_STOCK_DETAILS, false))
					request.setAttribute("storeCityWiseReceivedDetails", getCityWiseReceivedStockData(request ,fromDate, toDate, branchId, executive));
			} else {
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}

			if(executive.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNT_GROUP_ID_CHINTAMANI || executive.getAccountGroupId()== CargoAccountGroupConstant.ACCOUNT_GROUP_ID_ROYAL_STAR || executive.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNT_GROUP_ID_PCPL)
				request.setAttribute("nextPageToken", "success_"+executive.getAccountGroupId());
			else
				request.setAttribute("nextPageToken", "success");

		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}
	}

	private HashMap<Long,HashMap<Long,CityWiseCollectionModel>> getCityWiseReceivedStockData(final HttpServletRequest request ,final Timestamp fromDate ,final Timestamp toDate ,final long destBranchId ,final Executive executive) throws Exception {

		HashMap<Long,HashMap<Long,CityWiseCollectionModel>> storeCityWiseReceivedDetails 	= null;
		HashMap<Long,CityWiseCollectionModel> 				cityWiseToPayeeDetails 			= null;
		ReceivedStockReportModel[] 							reportModel 					= null;
		CityWiseCollectionModel 							cityWiseCollectionModel 		= null;
		CacheManip 											cache 							= null;
		ValueObject											valueOutObject					= null;
		Long[]												wayBillIdArray					= null;
		Long[]												executiveIdsArr					= null;
		String												wayBillIdsStr					= null;
		String												executiveIdsStr					= null;
		HashMap<Long, ConsignmentSummary>					pkgsColl						= null;
		HashMap<Long, CustomerDetails>						consignorColl					= null;
		HashMap<Long, CustomerDetails>						consigneeColl					= null;
		HashMap<Long, Executive>							executiveColl					= null;
		String 												destBranches					= null;

		try {
			cache = new CacheManip(request);
			destBranches = destBranchId+"";
			valueOutObject = ReceivedStockActionDAO.getInstance().getReceivedStockDataByBranchId((short)1  ,fromDate, toDate, executive.getAccountGroupId(),-1,null,destBranches);

			storeCityWiseReceivedDetails = new LinkedHashMap<>();

			if(valueOutObject == null)
				return null;

			wayBillIdArray 	= (Long[])valueOutObject.get("WayBillIdArray");
			wayBillIdsStr	= Utility.GetLongArrayToString(wayBillIdArray);
			pkgsColl		= ConsignmentSummaryDao.getInstance().getLimitedConsignmentDetails(wayBillIdsStr);//Get Packages Data for both Summary & Details
			consignorColl 	= CustomerDetailsDao.getInstance().getConsignorDetailsByWayBillId(wayBillIdsStr);
			consigneeColl 	= CustomerDetailsDao.getInstance().getConsigneeDetailsByWayBillId(wayBillIdsStr);

			executiveIdsArr = (Long[])valueOutObject.get("ExecutiveIdsArr");
			executiveIdsStr	= Utility.GetLongArrayToString(executiveIdsArr);
			executiveColl	= ExecutiveDao.getInstance().getExecutiveDetailsByExecutiveIds(executiveIdsStr);

			reportModel 	= (ReceivedStockReportModel[])valueOutObject.get("reportModelArr");

			for (final ReceivedStockReportModel element : reportModel) {

				element.setNoOfPackages(pkgsColl.get(element.getWayBillId()).getQuantity());
				element.setConsignorName(consignorColl.get(element.getWayBillId()).getName());
				element.setConsigneeName(consigneeColl.get(element.getWayBillId()).getName());
				element.setBookedBy(executiveColl.get(element.getExecutiveId()).getName());

				element.setWayBillDestinationSubRegionId(cache.getGenericBranchDetailCache(request, element.getWayBillDestinationBranchId()).getSubRegionId());
				element.setWayBillDestinationSubRegion(cache.getGenericSubRegionById(request, element.getWayBillDestinationSubRegionId()).getName());
				element.setWayBillDestinationBranch(cache.getGenericBranchDetailCache(request, element.getWayBillDestinationBranchId()).getName());
				element.setWayBillSourceBranch(cache.getGenericBranchDetailCache(request, element.getWayBillSourceBranchId()).getName());
				element.setWayBillSourceSubRegionId(cache.getGenericBranchDetailCache(request, element.getWayBillSourceBranchId()).getSubRegionId());
				element.setWayBillSourceSubRegion(cache.getGenericSubRegionById(request, element.getWayBillSourceSubRegionId()).getName());

				if(element.isManual())
					element.setWayBillType(cache.getWayBillTypeById(request, element.getWayBillTypeId()).getWayBillType()+WayBillType.WAYBILL_TYPE_MANUAL);
				else
					element.setWayBillType(cache.getWayBillTypeById(request, element.getWayBillTypeId()).getWayBillType());

				if(element.getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_TO_PAY || element.getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_PAID){
					cityWiseToPayeeDetails = null;
					cityWiseCollectionModel = null;

					cityWiseToPayeeDetails = storeCityWiseReceivedDetails.get(element.getWayBillSourceSubRegionId());

					if(cityWiseToPayeeDetails == null){
						cityWiseToPayeeDetails = new LinkedHashMap<>();

						cityWiseCollectionModel = cityWiseToPayeeDetails.get(element.getWayBillSourceBranchId());

						if(cityWiseCollectionModel == null){

							cityWiseCollectionModel = new CityWiseCollectionModel();

							cityWiseCollectionModel.setBranchId(element.getWayBillSourceBranchId());
							cityWiseCollectionModel.setBranchName(element.getWayBillSourceBranch());
							cityWiseCollectionModel.setSubRegionId(element.getWayBillSourceSubRegionId());
							cityWiseCollectionModel.setSubRegionName(element.getWayBillSourceSubRegion());
							if(element.getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_TO_PAY)
								cityWiseCollectionModel.setTotalToPayAmount(element.getGrandTotal());
							else
								cityWiseCollectionModel.setTotalPaidAmount(element.getGrandTotal());

							cityWiseToPayeeDetails.put(element.getWayBillSourceBranchId(), cityWiseCollectionModel);
						} else if(element.getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_TO_PAY)
							cityWiseCollectionModel.setTotalToPayAmount(cityWiseCollectionModel.getTotalToPayAmount() + element.getGrandTotal());
						else
							cityWiseCollectionModel.setTotalPaidAmount(cityWiseCollectionModel.getTotalPaidAmount() + element.getGrandTotal());

						storeCityWiseReceivedDetails.put(element.getWayBillSourceSubRegionId() ,cityWiseToPayeeDetails);
					}else{

						cityWiseCollectionModel = cityWiseToPayeeDetails.get(element.getWayBillSourceBranchId());

						if(cityWiseCollectionModel == null){

							cityWiseCollectionModel = new CityWiseCollectionModel();

							cityWiseCollectionModel.setBranchId(element.getWayBillSourceBranchId());
							cityWiseCollectionModel.setBranchName(element.getWayBillSourceBranch());
							cityWiseCollectionModel.setSubRegionId(element.getWayBillSourceSubRegionId());
							cityWiseCollectionModel.setSubRegionName(element.getWayBillSourceSubRegion());
							if(element.getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_TO_PAY)
								cityWiseCollectionModel.setTotalToPayAmount(element.getGrandTotal());
							else
								cityWiseCollectionModel.setTotalPaidAmount(element.getGrandTotal());

							cityWiseToPayeeDetails.put(element.getWayBillSourceBranchId(), cityWiseCollectionModel);
						} else if(element.getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_TO_PAY)
							cityWiseCollectionModel.setTotalToPayAmount(cityWiseCollectionModel.getTotalToPayAmount() + element.getGrandTotal());
						else
							cityWiseCollectionModel.setTotalPaidAmount(cityWiseCollectionModel.getTotalPaidAmount() + element.getGrandTotal());
					}
				}
			}

			return storeCityWiseReceivedDetails;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		} finally {
			storeCityWiseReceivedDetails 	= null;
			cityWiseToPayeeDetails 			= null;
			reportModel 					= null;
			cityWiseCollectionModel 		= null;
			cache 							= null;
			valueOutObject					= null;
			wayBillIdArray					= null;
			executiveIdsArr					= null;
			wayBillIdsStr					= null;
			executiveIdsStr					= null;
			pkgsColl						= null;
			consignorColl					= null;
			consigneeColl					= null;
			executiveColl					= null;
			destBranches					= null;
		}
	}
}