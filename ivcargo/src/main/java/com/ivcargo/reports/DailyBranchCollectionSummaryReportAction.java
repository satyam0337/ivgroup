package com.ivcargo.reports;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringUtils;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.dto.constant.BookingChargeConstant;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.utils.constant.AccountGroupConstant;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.exception.ExceptionProcess;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.BranchExpenseDao;
import com.platform.dao.ChargeTypeMasterDao;
import com.platform.dao.ConsignmentDetailsDao;
import com.platform.dao.ConsignmentSummaryDao;
import com.platform.dao.CustomerDetailsDao;
import com.platform.dao.ExecutiveDao;
import com.platform.dao.PackingGroupTypeMasterDao;
import com.platform.dao.VoucherDetailsDao;
import com.platform.dao.reports.DailyBranchCollectionDAO;
import com.platform.dao.reports.ReceivedStockActionDAO;
import com.platform.dao.reports.WayBillDetailsDAO;
import com.platform.dto.Branch;
import com.platform.dto.ChargeTypeMaster;
import com.platform.dto.ConfigParam;
import com.platform.dto.ConsignmentDetails;
import com.platform.dto.ConsignmentSummary;
import com.platform.dto.CustomerDetails;
import com.platform.dto.ECargoConstantFile;
import com.platform.dto.Executive;
import com.platform.dto.PackingGroupTypeMaster;
import com.platform.dto.VoucherDetails;
import com.platform.dto.WayBill;
import com.platform.dto.WayBillCharges;
import com.platform.dto.WayBillTaxTxn;
import com.platform.dto.WayBillType;
import com.platform.dto.configuration.report.collection.DailyBranchCollectionReportConfigurationDTO;
import com.platform.dto.configuration.report.common.CommonReportsConfigurationDTO;
import com.platform.dto.constant.WayBillStatusConstant;
import com.platform.dto.constant.WayBillTypeConstant;
import com.platform.dto.model.ChargeTypeModel;
import com.platform.dto.model.CityWiseCollectionModel;
import com.platform.dto.model.DailyBranchCollectionReportModel;
import com.platform.dto.model.ReceivedStockReportModel;
import com.platform.dto.model.ReportViewModel;
import com.platform.dto.model.WayBillCategoryTypeDetails;
import com.platform.dto.model.WayBillDeatailsModel;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

public class DailyBranchCollectionSummaryReportAction implements Action{

	private static final String TRACE_ID = "DailyBranchCollectionSummaryReportAction";
	@Override
	@SuppressWarnings("unchecked")
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	error 	= null;
		Executive        								executive       					= null;
		SimpleDateFormat 								sdf             					= null;
		Timestamp        								fromDate        					= null;
		Timestamp        								toDate          					= null;
		Branch[]    									branches  							= null;
		CacheManip 										cache 								= null;
		ValueObject										objectIn							= null;
		ValueObject										objectOut							= null;
		Long[] 											wayBillIdArray						= null;
		WayBillType										wayBillType							= null;
		WayBillTaxTxn[]									wayBillTax							= null;
		ChargeTypeModel[]								bookingCharges						= null;
		ChargeTypeModel[]								deliveryCharges						= null;
		Branch											branch								= null;
		ReportViewModel									reportViewModel 					= null;
		DailyBranchCollectionReportModel[]				reportModel							= null;
		HashMap<String,WayBillCategoryTypeDetails>		wbCategoryTypeDetails				= null;
		HashMap<String,WayBillCategoryTypeDetails>		deliveredWayBillDetails				= null;
		HashMap<String,Double>							bookedWayBillCategoryTypeDetails	= null;
		HashMap<Long,Object>							storeCityWiseToPayeeDetails			= null;
		HashMap<Long,Object>							storeCityWiseToDLVPayeeDetails		= null;
		HashMap<Long,Object>							cityWiseToPayeeDetails				= null;
		HashMap<Long, WayBillDeatailsModel>				wayBillDetails						= null;
		WayBillCategoryTypeDetails						wayBillCategoryTypeDetails			= null;
		HashMap<Long,Double>							chargesCollection					= null;
		HashMap<String,Double>							freightChargesCollection			= null;
		VoucherDetails[]								totalAmountForSummarry				= null;
		ValueObject										configuration						= null;
		var												showCreditDetailsColumn				= false;
		var												hideCancelledLrs					= false;
		var												showTotalNoOfArticlesColumn			= false;
		var												showPackingGroupTypeWiseAmount		= false;
		var												wayBillIdArrStr						= "";
		HashMap<Long, ArrayList<ConsignmentDetails>>	consignmentDetails					= null;
		HashMap<Long,PackingGroupTypeMaster>			packingGroupDetails					= null;
		var												packingTypeGroupId					= 0L;
		var												packingTypeGroupName				= "";
		ArrayList<ConsignmentDetails>					consignmentDetailsArrList			= null;
		var freightCharege = 0.00;
		String											mergeGroupSubRegionStr				= null;
		var												srcMergeGroupId						= 0L;
		var												showBookingAndDeliveryCharges		= false;
		String 											sourceSubregionName 				= null;
		String 											sourceBranchName 					= null;
		var												showOtherChargeAmount				= false;
		var												grandTotalLevelRename				= "";

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeDailyBranchCollectionReportAction().execute(request, response);
			executive       				= (Executive) request.getSession().getAttribute("executive");
			configuration					= ReadAllConfigurationsBllImpl.getInstance().getOldReportConfigurationData(ReportIdentifierConstant.DAILY_BRANCH_COLLECTION_REPORT, executive.getAccountGroupId());
			showCreditDetailsColumn			= configuration.getBoolean(DailyBranchCollectionReportConfigurationDTO.SHOW_CREDIT_DETAILS_COLUMN,false);
			hideCancelledLrs				= configuration.getBoolean(DailyBranchCollectionReportConfigurationDTO.HIDE_CANCELLED_LRS,false);
			showTotalNoOfArticlesColumn		= configuration.getBoolean(DailyBranchCollectionReportConfigurationDTO.SHOW_TOTAL_NO_OF_ARTICLES_COLUMN,false);
			showPackingGroupTypeWiseAmount	= configuration.getBoolean(DailyBranchCollectionReportConfigurationDTO.SHOW_PACKING_GROUPTYPE_WISE_AMOUNT,false);
			showBookingAndDeliveryCharges	= configuration.getBoolean(DailyBranchCollectionReportConfigurationDTO.SHOW_BOOKING_AND_DELIVERY_CHARGES,false);
			showOtherChargeAmount			= configuration.getBoolean(DailyBranchCollectionReportConfigurationDTO.SHOW_OTHER_CHARGE_AMOUNT,false);
			grandTotalLevelRename			= configuration.getString(DailyBranchCollectionReportConfigurationDTO.GRAND_TOTAL_LEVEL_RENAME);

			cache 			= new CacheManip(request);
			final var	confValObj 						= cache.getCommonReportsConfiguration(request, executive.getAccountGroupId());
			final var	showGroupMergingBranchData		= confValObj.getBoolean(CommonReportsConfigurationDTO.IS_SHOW_GROUP_MERGING_BRANCH_DATA,false);

			sdf             = new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			fromDate        = new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00").getTime());
			toDate          = new Timestamp(sdf.parse(JSPUtility.GetString(request, "toDate") + " 23:59:59").getTime());
			var selectedCity		= 0L;
			final var destinationCityId	= JSPUtility.GetLong(request, "TosubRegion",0);


			// Get the Selected  Combo values
			mergeGroupSubRegionStr	= request.getParameter("subRegion");

			if(mergeGroupSubRegionStr != null)
				if(StringUtils.contains(mergeGroupSubRegionStr, "_"))
					srcMergeGroupId	= Long.parseLong(mergeGroupSubRegionStr.split("_")[1]);
				else
					selectedCity 	= Long.parseLong(mergeGroupSubRegionStr);

			final var	subRegions = cache.getSubRegionsByGroupId(request, executive.getAccountGroupId(), showGroupMergingBranchData);

			request.setAttribute("subRegionForGroup", subRegions);

			//Get all Branches
			if(selectedCity > 0) {
				branches 	= cache.getBranchesArrayBySubRegionId(request, executive.getAccountGroupId(), selectedCity);
				request.setAttribute("branches", branches);
			} else if(srcMergeGroupId > 0) {
				branches 	= cache.getAssignedBranchArrayByAssignedAccountGroupId(request, executive.getAccountGroupId(), srcMergeGroupId);
				request.setAttribute("branches", branches);
			}
			// Get All Executives

			var   branchId = 0L;
			var 	voucherDetailsAmnt = 0D;
			objectIn			= new ValueObject();

			if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_EXECUTIVE || executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_BRANCHADMIN || executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_LIMITED)
				branchId = executive.getBranchId();
			else if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_GROUPADMIN || executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_REGIONADMIN || executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_SUBREGIONADMIN )
				branchId = JSPUtility.GetLong(request, "branch", branchId);

			totalAmountForSummarry = VoucherDetailsDao.getInstance().getAmountForDailyBranchExpense(fromDate, toDate, branchId, executive.getAccountGroupId());

			if(totalAmountForSummarry != null)
				for (final VoucherDetails element : totalAmountForSummarry)
					voucherDetailsAmnt +=  element.getTotalAmount();

			final var sourceSubregion 	= cache.getGenericSubRegionById(request, selectedCity);
			final var sourceBranch 		= cache.getGenericBranchDetailCache(request, branchId);

			if (sourceSubregion != null)
				sourceSubregionName = sourceSubregion.getName();

			if (sourceBranch != null)
				sourceBranchName = sourceBranch.getName();

			objectIn.put("fromDate", fromDate);
			objectIn.put("toDate", toDate);
			objectIn.put("branchId", branchId);
			objectIn.put("accountGroupId", executive.getAccountGroupId());
			objectIn.put("filter", 1);
			objectIn.put("destinationCityId", destinationCityId);

			if(destinationCityId == 0)
				objectOut= DailyBranchCollectionDAO.getInstance().getReportForBranch(objectIn);
			else
				objectOut= DailyBranchCollectionDAO.getInstance().getReportDestinationWise(objectIn);

			reportModel		= (DailyBranchCollectionReportModel[])objectOut.get("DailyBranchCollectionReportModel");
			wayBillIdArray	= (Long[]) objectOut.get("WayBillIdArray");

			if(wayBillIdArray != null && wayBillIdArray.length > 0)
				wayBillIdArrStr = Utility.GetLongArrayToString(wayBillIdArray);

			if(showPackingGroupTypeWiseAmount){
				if(!StringUtils.isEmpty(wayBillIdArrStr))
					consignmentDetails		= ConsignmentDetailsDao.getInstance().getConsignmentDetailsByWayBillIds(wayBillIdArrStr);
				packingGroupDetails			= PackingGroupTypeMasterDao.getInstance().findAllByAccountGroupIdForReport(executive.getAccountGroupId());
			}

			request.setAttribute("WayBillExpenseModel", objectOut.get("WayBillExpenseModel"));

			reportViewModel = new ReportViewModel();
			reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);
			request.setAttribute("ReportViewModel",reportViewModel);
			request.setAttribute("sourceSubregionName",sourceSubregionName);
			request.setAttribute("sourceBranchName",sourceBranchName);

			wbCategoryTypeDetails	= new HashMap<>();
			deliveredWayBillDetails	= new HashMap<>();
			var totalBookingGrandAmount 		= 0D;
			var totalCancellationGrandAmount 	= 0D;
			var totalDeliverGrandAmount 		= 0D;
			var toPayCommissionToBeLess 		= 0D;
			var totalBkgFreightAmount 			= 0D;
			var totalDlvryCmsnFreightAmount 	= 0D;
			var totalBkgLoadingAmount 			= 0D;
			var totalUnloadingAmount 			= 0D;
			var totalBkgAutoChargeAmount		= 0D;
			var totalBookingDoorDelivery		= 0D;
			var totalBookingUnloading			= 0D;
			var otherCharges			 		= 0D;

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

				for (final DailyBranchCollectionReportModel aReportModel : reportModel) {

					freightCharege = 0.00;
					if (hideCancelledLrs && aReportModel.getCurrentStatus() == WayBillStatusConstant.WAYBILL_STATUS_CANCELLED)
						continue;

					//set flag for commission column generation
					if(aReportModel.getAgentCommission() > 0)
						doNotShow_Commission = true;

					if(showPackingGroupTypeWiseAmount){
						if(consignmentDetails != null)
							consignmentDetailsArrList		= consignmentDetails.get(aReportModel.getWayBillId());

						if(consignmentDetailsArrList != null && consignmentDetailsArrList.size() > 0){
							packingTypeGroupId = 0;
							packingTypeGroupName = "";

							for (final ConsignmentDetails element : consignmentDetailsArrList) {
								final var	packingGroupTypeMasterModel = packingGroupDetails.get(element.getPackingTypeMasterId());

								if(packingGroupTypeMasterModel != null)
									if(packingGroupTypeMasterModel.getPackingGroupTypeId() == PackingGroupTypeMaster.COURIER_PACKING_GROUP_TYPE_ID){
										packingTypeGroupId	= packingGroupTypeMasterModel.getPackingGroupTypeId();
										packingTypeGroupName	= packingGroupTypeMasterModel.getPackingGroupTypeName();
									} else if (packingGroupTypeMasterModel.getPackingGroupTypeId() == PackingGroupTypeMaster.LUGGAGE_PACKING_GROUP_TYPE_ID){
										packingTypeGroupId	= packingGroupTypeMasterModel.getPackingGroupTypeId();
										packingTypeGroupName	= packingGroupTypeMasterModel.getPackingGroupTypeName();
										break;
									}
							}
						}

					}
					// Set City & Branch name
					aReportModel.setWayBillSourceSubRegion(cache.getGenericSubRegionById(request, aReportModel.getWayBillSourceSubRegionId()).getName());
					aReportModel.setWayBillSourceBranch(cache.getGenericBranchDetailCache(request, aReportModel.getWayBillSourceBranchId()).getName());
					aReportModel.setWayBillDestinationSubRegion(cache.getGenericSubRegionById(request, aReportModel.getWayBillDestinationSubRegionId()).getName());
					aReportModel.setWayBillDestinationBranch(cache.getGenericBranchDetailCache(request, aReportModel.getWayBillDestinationBranchId()).getName());
					// Set City & Branch name

					// Set WayBill Type Name
					wayBillType = cache.getWayBillTypeById(request, aReportModel.getWayBillTypeId());

					if(aReportModel.isManual())
						aReportModel.setWayBillType(wayBillType.getWayBillType()+WayBillType.WAYBILL_TYPE_MANUAL);
					else aReportModel.setWayBillType(wayBillType.getWayBillType());

					//WayBill Charges (Booking & Delivery)

					final var	wayBillCharges = wayBillDetails.get(aReportModel.getWayBillId()).getWayBillCharges();
					bookedWayBillCategoryTypeDetails = new HashMap<>();

					for (final WayBillCharges wayBillCharge : wayBillCharges) {
						final var	chargeAmt = wayBillCharge.getChargeAmount();

						if(aReportModel.getStatus() != WayBillStatusConstant.WAYBILL_STATUS_DELIVERED  && wayBillCharge.getChargeType() == ChargeTypeMaster.WAYBILL_CHARGETYPE_BOOKING){
							bookedWayBillCategoryTypeDetails.put(Long.toString(wayBillCharge.getWayBillChargeMasterId()), chargeAmt);

							if(wayBillCharge.getWayBillChargeMasterId() == BookingChargeConstant.LOADING)
								totalBkgLoadingAmount += chargeAmt;

							if (wayBillCharge.getWayBillChargeMasterId() == BookingChargeConstant.CARTAGE_CHARGE)
								if (aReportModel.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_BOOKED)
									otherCharges += chargeAmt;
								else if (aReportModel.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CANCELLED)
									otherCharges -= chargeAmt;

							if(executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_ROYAL_STAR
									&& wayBillCharge.getWayBillChargeMasterId() == ChargeTypeMaster.AUTO_BOOKING)
								if(aReportModel.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_BOOKED)
									totalBkgAutoChargeAmount += chargeAmt;
								else
									totalBkgAutoChargeAmount -= chargeAmt;
						}

						if(aReportModel.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DELIVERED){
							if(wayBillCharge.getChargeType() == ChargeTypeMaster.WAYBILL_CHARGETYPE_DELIVERY){
								bookedWayBillCategoryTypeDetails.put(Long.toString(wayBillCharge.getWayBillChargeMasterId()), chargeAmt);

								if (wayBillCharge.getWayBillChargeMasterId() == ChargeTypeMaster.HANDLING_DELIVERY_CHARGE || wayBillCharge.getWayBillChargeMasterId() == ChargeTypeMaster.DOOR_DELIVERY_DELIVERY)
									otherCharges += chargeAmt;
								if(wayBillCharge.getWayBillChargeMasterId() == ChargeTypeMaster.UNLOADING)
									totalUnloadingAmount += chargeAmt;
							}

							if(wayBillCharge.getWayBillChargeMasterId() == BookingChargeConstant.FREIGHT && aReportModel.getDeliveryCommission() > 0)
								totalDlvryCmsnFreightAmount	+= chargeAmt;

							if(wayBillCharge.getWayBillChargeMasterId() == BookingChargeConstant.DOOR_DLY_BOOKING)
								totalBookingDoorDelivery	+= chargeAmt;

							if(wayBillCharge.getWayBillChargeMasterId() == BookingChargeConstant.UNLOADING_BOOKING)
								totalBookingUnloading	+= chargeAmt;
						}

						if(aReportModel.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_BOOKED
								&& wayBillCharge.getWayBillChargeMasterId() == BookingChargeConstant.FREIGHT && aReportModel.getBookingCommission() > 0)
							totalBkgFreightAmount += chargeAmt;
						else if(aReportModel.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CANCELLED && wayBillCharge.getWayBillChargeMasterId() == BookingChargeConstant.FREIGHT
								&& aReportModel.getBookingCommission() > 0)
							totalBkgFreightAmount -= chargeAmt;
					}

					aReportModel.setChargesCollection(bookedWayBillCategoryTypeDetails);
					//end

					//Calculate Total WayBill Tax
					wayBillTax = wayBillDetails.get(aReportModel.getWayBillId()).getWayBillTaxTxn();
					var totalTax 				= 0.00;

					for (final WayBillTaxTxn element : wayBillTax)
						totalTax += element.getTaxAmount();

					if(totalTax > 0)
						doNotShow_Tax = true;

					totalTax = Math.round(totalTax);
					aReportModel.setTotalTax(totalTax);
					//end

					//Calculate Total Discount
					var totalDiscount 		= 0.00;
					if(aReportModel.isDiscountPercent())
						totalDiscount = Math.round(aReportModel.getAmount() * aReportModel.getDiscount() / 100);
					else
						totalDiscount = aReportModel.getDiscount();

					aReportModel.setDiscount(totalDiscount);

					if(totalDiscount > 0)
						doNotShow_Disc = true;

					if(aReportModel.getStatus()==WayBillStatusConstant.WAYBILL_STATUS_BOOKED ){
						if(aReportModel.getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_PAID){

							//City Wise Paid Details code
							cityWiseToPayeeDetails = (HashMap<Long, Object>)storeCityWiseToPayeeDetails.get(aReportModel.getDestinationSubRegionId());

							if(cityWiseToPayeeDetails == null){
								cityWiseToPayeeDetails = new LinkedHashMap<>();

								var	cityWiseCollectionModel = (CityWiseCollectionModel)cityWiseToPayeeDetails.get(aReportModel.getDestinationBranchId());

								if(cityWiseCollectionModel == null){

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
								}else{
									cityWiseCollectionModel.setTotalPaidAmount(cityWiseCollectionModel.getTotalPaidAmount() + aReportModel.getGrandTotal());
									cityWiseCollectionModel.setTotalToPayAmount(cityWiseCollectionModel.getTotalToPayAmount() + 0);
									cityWiseCollectionModel.setTotalCreditorAmount(cityWiseCollectionModel.getTotalCreditorAmount() + 0);
									cityWiseCollectionModel.setQuantity(cityWiseCollectionModel.getQuantity() + aReportModel.getNoOfPackages());
								}

								storeCityWiseToPayeeDetails.put(aReportModel.getDestinationSubRegionId() ,cityWiseToPayeeDetails);
							}else{

								var	cityWiseCollectionModel = (CityWiseCollectionModel)cityWiseToPayeeDetails.get(aReportModel.getDestinationBranchId());

								if(cityWiseCollectionModel == null){

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
								}else{
									cityWiseCollectionModel.setTotalPaidAmount(cityWiseCollectionModel.getTotalPaidAmount() + aReportModel.getGrandTotal());
									cityWiseCollectionModel.setTotalToPayAmount(cityWiseCollectionModel.getTotalToPayAmount() + 0);
									cityWiseCollectionModel.setTotalCreditorAmount(cityWiseCollectionModel.getTotalCreditorAmount() + 0);
									cityWiseCollectionModel.setQuantity(cityWiseCollectionModel.getQuantity() + aReportModel.getNoOfPackages());
								}

							}
							//City Wise Paid Details code

						}else if(aReportModel.getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_TO_PAY ){
							//City Wise ToPayee Details code
							cityWiseToPayeeDetails = (HashMap<Long, Object>)storeCityWiseToPayeeDetails.get(aReportModel.getDestinationSubRegionId());

							if(cityWiseToPayeeDetails == null){
								cityWiseToPayeeDetails = new LinkedHashMap<>();

								var	cityWiseCollectionModel = (CityWiseCollectionModel)cityWiseToPayeeDetails.get(aReportModel.getDestinationBranchId());

								if(cityWiseCollectionModel == null){

									cityWiseCollectionModel = new CityWiseCollectionModel();

									cityWiseCollectionModel.setBranchId(aReportModel.getDestinationBranchId());
									cityWiseCollectionModel.setBranchName(aReportModel.getWayBillDestinationBranch());
									cityWiseCollectionModel.setSubRegionId(aReportModel.getDestinationSubRegionId());
									cityWiseCollectionModel.setSubRegionName(aReportModel.getWayBillDestinationSubRegion());
									cityWiseCollectionModel.setTotalPaidAmount(0);
									cityWiseCollectionModel.setTotalToPayAmount(aReportModel.getGrandTotal() + aReportModel.getAgentCommission());
									cityWiseCollectionModel.setTotalCreditorAmount(0);
									cityWiseCollectionModel.setQuantity(aReportModel.getNoOfPackages());

									cityWiseToPayeeDetails.put(aReportModel.getDestinationBranchId(), cityWiseCollectionModel);
								}else{
									cityWiseCollectionModel.setTotalPaidAmount(cityWiseCollectionModel.getTotalPaidAmount() + 0);
									cityWiseCollectionModel.setTotalToPayAmount(cityWiseCollectionModel.getTotalToPayAmount() + aReportModel.getGrandTotal() + aReportModel.getAgentCommission());
									cityWiseCollectionModel.setTotalCreditorAmount(cityWiseCollectionModel.getTotalCreditorAmount() + 0);
									cityWiseCollectionModel.setQuantity(cityWiseCollectionModel.getQuantity() +aReportModel.getNoOfPackages());
								}

								storeCityWiseToPayeeDetails.put(aReportModel.getDestinationSubRegionId() ,cityWiseToPayeeDetails);
							}else{

								var	cityWiseCollectionModel = (CityWiseCollectionModel)cityWiseToPayeeDetails.get(aReportModel.getDestinationBranchId());

								if(cityWiseCollectionModel == null){

									cityWiseCollectionModel = new CityWiseCollectionModel();

									cityWiseCollectionModel.setBranchId(aReportModel.getDestinationBranchId());
									cityWiseCollectionModel.setBranchName(aReportModel.getWayBillDestinationBranch());
									cityWiseCollectionModel.setSubRegionId(aReportModel.getDestinationSubRegionId());
									cityWiseCollectionModel.setSubRegionName(aReportModel.getWayBillDestinationSubRegion());
									cityWiseCollectionModel.setTotalPaidAmount(0);
									cityWiseCollectionModel.setTotalToPayAmount(aReportModel.getGrandTotal() +  + aReportModel.getAgentCommission());
									cityWiseCollectionModel.setTotalCreditorAmount(0);
									cityWiseCollectionModel.setQuantity(aReportModel.getNoOfPackages());

									cityWiseToPayeeDetails.put(aReportModel.getDestinationBranchId(), cityWiseCollectionModel);
								}else{
									cityWiseCollectionModel.setTotalPaidAmount(cityWiseCollectionModel.getTotalPaidAmount() + 0);
									cityWiseCollectionModel.setTotalToPayAmount(cityWiseCollectionModel.getTotalToPayAmount() + aReportModel.getGrandTotal() +  + aReportModel.getAgentCommission());
									cityWiseCollectionModel.setTotalCreditorAmount(cityWiseCollectionModel.getTotalCreditorAmount() + 0);
									cityWiseCollectionModel.setQuantity(cityWiseCollectionModel.getQuantity() + aReportModel.getNoOfPackages());
								}

							}
							//City Wise ToPayee Details code
						} else if(aReportModel.getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_CREDIT && (executive.getAccountGroupId() == ECargoConstantFile.ACCOUNT_GROUP_ID_KONDUSKAR_S_R_TRAVELS || showCreditDetailsColumn)){
							//City Wise ToPayee Details code
							cityWiseToPayeeDetails = (HashMap<Long, Object>)storeCityWiseToPayeeDetails.get(aReportModel.getDestinationSubRegionId());

							if(cityWiseToPayeeDetails == null){
								cityWiseToPayeeDetails = new LinkedHashMap<>();

								var	cityWiseCollectionModel = (CityWiseCollectionModel)cityWiseToPayeeDetails.get(aReportModel.getDestinationBranchId());

								if(cityWiseCollectionModel == null){

									cityWiseCollectionModel = new CityWiseCollectionModel();

									cityWiseCollectionModel.setBranchId(aReportModel.getDestinationBranchId());
									cityWiseCollectionModel.setBranchName(aReportModel.getWayBillDestinationBranch());
									cityWiseCollectionModel.setSubRegionId(aReportModel.getDestinationSubRegionId());
									cityWiseCollectionModel.setSubRegionName(aReportModel.getWayBillDestinationSubRegion());
									cityWiseCollectionModel.setTotalPaidAmount(0);
									cityWiseCollectionModel.setTotalToPayAmount(0);
									cityWiseCollectionModel.setTotalCreditorAmount(aReportModel.getGrandTotal());
									cityWiseCollectionModel.setQuantity(aReportModel.getNoOfPackages());

									cityWiseToPayeeDetails.put(aReportModel.getDestinationBranchId(), cityWiseCollectionModel);
								}else{
									cityWiseCollectionModel.setTotalPaidAmount(cityWiseCollectionModel.getTotalPaidAmount() + 0);
									cityWiseCollectionModel.setTotalToPayAmount(cityWiseCollectionModel.getTotalToPayAmount() + 0);
									cityWiseCollectionModel.setTotalCreditorAmount(cityWiseCollectionModel.getTotalCreditorAmount() + aReportModel.getGrandTotal());
									cityWiseCollectionModel.setQuantity(cityWiseCollectionModel.getQuantity() + aReportModel.getNoOfPackages());
								}

								storeCityWiseToPayeeDetails.put(aReportModel.getDestinationSubRegionId() ,cityWiseToPayeeDetails);
							}else{

								var	cityWiseCollectionModel = (CityWiseCollectionModel)cityWiseToPayeeDetails.get(aReportModel.getDestinationBranchId());

								if(cityWiseCollectionModel == null){

									cityWiseCollectionModel = new CityWiseCollectionModel();

									cityWiseCollectionModel.setBranchId(aReportModel.getDestinationBranchId());
									cityWiseCollectionModel.setBranchName(aReportModel.getWayBillDestinationBranch());
									cityWiseCollectionModel.setSubRegionId(aReportModel.getDestinationSubRegionId());
									cityWiseCollectionModel.setSubRegionName(aReportModel.getWayBillDestinationSubRegion());
									cityWiseCollectionModel.setTotalPaidAmount(0);
									cityWiseCollectionModel.setTotalToPayAmount(0);
									cityWiseCollectionModel.setTotalCreditorAmount(aReportModel.getGrandTotal());
									cityWiseCollectionModel.setQuantity(aReportModel.getNoOfPackages());

									cityWiseToPayeeDetails.put(aReportModel.getDestinationBranchId(), cityWiseCollectionModel);
								}else{
									cityWiseCollectionModel.setTotalPaidAmount(cityWiseCollectionModel.getTotalPaidAmount() + 0);
									cityWiseCollectionModel.setTotalToPayAmount(cityWiseCollectionModel.getTotalToPayAmount() + 0);
									cityWiseCollectionModel.setTotalCreditorAmount(cityWiseCollectionModel.getTotalCreditorAmount() + aReportModel.getGrandTotal());
									cityWiseCollectionModel.setQuantity(cityWiseCollectionModel.getQuantity() + aReportModel.getNoOfPackages());
								}

							}
							//City Wise ToPayee Details code
						}

					}else if(aReportModel.getStatus()==WayBill.WAYBILL_STATUS_CANCELLED)
						if(aReportModel.getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_TO_PAY){

							//City Wise ToPayee Details code
							cityWiseToPayeeDetails = (HashMap<Long, Object>)storeCityWiseToPayeeDetails.get(aReportModel.getDestinationSubRegionId());

							if(cityWiseToPayeeDetails == null){
								cityWiseToPayeeDetails = new LinkedHashMap<>();

								var	cityWiseCollectionModel = (CityWiseCollectionModel)cityWiseToPayeeDetails.get(aReportModel.getDestinationBranchId());

								if(cityWiseCollectionModel == null){

									cityWiseCollectionModel = new CityWiseCollectionModel();

									cityWiseCollectionModel.setBranchId(aReportModel.getDestinationBranchId());
									cityWiseCollectionModel.setBranchName(aReportModel.getWayBillDestinationBranch());
									cityWiseCollectionModel.setSubRegionId(aReportModel.getDestinationSubRegionId());
									cityWiseCollectionModel.setSubRegionName(aReportModel.getWayBillDestinationSubRegion());
									cityWiseCollectionModel.setTotalPaidAmount(-0);
									cityWiseCollectionModel.setTotalToPayAmount( - (aReportModel.getGrandTotal() + aReportModel.getAgentCommission()));
									cityWiseCollectionModel.setTotalCreditorAmount(-0);
									cityWiseCollectionModel.setQuantity(aReportModel.getNoOfPackages());

									cityWiseToPayeeDetails.put(aReportModel.getDestinationBranchId(), cityWiseCollectionModel);
								} else {
									cityWiseCollectionModel.setTotalPaidAmount(cityWiseCollectionModel.getTotalPaidAmount() - 0);
									cityWiseCollectionModel.setTotalToPayAmount(cityWiseCollectionModel.getTotalToPayAmount() - (aReportModel.getGrandTotal() + aReportModel.getAgentCommission()));
									cityWiseCollectionModel.setTotalCreditorAmount(cityWiseCollectionModel.getTotalCreditorAmount() - 0);
									cityWiseCollectionModel.setQuantity(cityWiseCollectionModel.getQuantity() - aReportModel.getNoOfPackages());
								}

								storeCityWiseToPayeeDetails.put(aReportModel.getDestinationSubRegionId() ,cityWiseToPayeeDetails);
							}else{

								var	cityWiseCollectionModel = (CityWiseCollectionModel)cityWiseToPayeeDetails.get(aReportModel.getDestinationBranchId());

								if(cityWiseCollectionModel == null){

									cityWiseCollectionModel = new CityWiseCollectionModel();

									cityWiseCollectionModel.setBranchId(aReportModel.getDestinationBranchId());
									cityWiseCollectionModel.setBranchName(aReportModel.getWayBillDestinationBranch());
									cityWiseCollectionModel.setSubRegionId(aReportModel.getDestinationSubRegionId());
									cityWiseCollectionModel.setSubRegionName(aReportModel.getWayBillDestinationSubRegion());
									cityWiseCollectionModel.setTotalPaidAmount(-0);
									cityWiseCollectionModel.setTotalToPayAmount( - (aReportModel.getGrandTotal() + aReportModel.getAgentCommission()));
									cityWiseCollectionModel.setTotalCreditorAmount(-0);
									cityWiseCollectionModel.setQuantity(aReportModel.getNoOfPackages());

									cityWiseToPayeeDetails.put(aReportModel.getDestinationBranchId(), cityWiseCollectionModel);
								}else{
									cityWiseCollectionModel.setTotalPaidAmount(cityWiseCollectionModel.getTotalPaidAmount() - 0);
									cityWiseCollectionModel.setTotalToPayAmount(cityWiseCollectionModel.getTotalToPayAmount() - (aReportModel.getGrandTotal() + aReportModel.getAgentCommission()));
									cityWiseCollectionModel.setTotalCreditorAmount(cityWiseCollectionModel.getTotalCreditorAmount() - 0);
									cityWiseCollectionModel.setQuantity(cityWiseCollectionModel.getQuantity() - aReportModel.getNoOfPackages());
								}

							}
							//City Wise ToPayee Details code
						} else if(aReportModel.getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_PAID){

							//City Wise Paid Details code
							cityWiseToPayeeDetails = (HashMap<Long, Object>)storeCityWiseToPayeeDetails.get(aReportModel.getDestinationSubRegionId());

							if(cityWiseToPayeeDetails == null){
								cityWiseToPayeeDetails = new LinkedHashMap<>();

								var	cityWiseCollectionModel = (CityWiseCollectionModel)cityWiseToPayeeDetails.get(aReportModel.getDestinationBranchId());

								if(cityWiseCollectionModel == null){

									cityWiseCollectionModel = new CityWiseCollectionModel();

									cityWiseCollectionModel.setBranchId(aReportModel.getDestinationBranchId());
									cityWiseCollectionModel.setBranchName(aReportModel.getWayBillDestinationBranch());
									cityWiseCollectionModel.setSubRegionId(aReportModel.getDestinationSubRegionId());
									cityWiseCollectionModel.setSubRegionName(aReportModel.getWayBillDestinationSubRegion());
									cityWiseCollectionModel.setTotalPaidAmount(-aReportModel.getGrandTotal());
									cityWiseCollectionModel.setTotalToPayAmount(-0);
									cityWiseCollectionModel.setTotalCreditorAmount(-0);
									cityWiseCollectionModel.setQuantity(aReportModel.getNoOfPackages());

									cityWiseToPayeeDetails.put(aReportModel.getDestinationBranchId(), cityWiseCollectionModel);
								}else{
									cityWiseCollectionModel.setTotalPaidAmount(cityWiseCollectionModel.getTotalPaidAmount() - aReportModel.getGrandTotal());
									cityWiseCollectionModel.setTotalToPayAmount(cityWiseCollectionModel.getTotalToPayAmount() - 0);
									cityWiseCollectionModel.setTotalCreditorAmount(cityWiseCollectionModel.getTotalCreditorAmount() - 0);
									cityWiseCollectionModel.setQuantity(cityWiseCollectionModel.getQuantity() - aReportModel.getNoOfPackages());
								}

								storeCityWiseToPayeeDetails.put(aReportModel.getDestinationSubRegionId() ,cityWiseToPayeeDetails);
							}else{

								var	cityWiseCollectionModel = (CityWiseCollectionModel)cityWiseToPayeeDetails.get(aReportModel.getDestinationBranchId());

								if(cityWiseCollectionModel == null){

									cityWiseCollectionModel = new CityWiseCollectionModel();

									cityWiseCollectionModel.setBranchId(aReportModel.getDestinationBranchId());
									cityWiseCollectionModel.setBranchName(aReportModel.getWayBillDestinationBranch());
									cityWiseCollectionModel.setSubRegionId(aReportModel.getDestinationSubRegionId());
									cityWiseCollectionModel.setSubRegionName(aReportModel.getWayBillDestinationSubRegion());
									cityWiseCollectionModel.setTotalPaidAmount(-aReportModel.getGrandTotal());
									cityWiseCollectionModel.setTotalToPayAmount(-0);
									cityWiseCollectionModel.setTotalCreditorAmount(-0);
									cityWiseCollectionModel.setQuantity(aReportModel.getNoOfPackages());

									cityWiseToPayeeDetails.put(aReportModel.getDestinationBranchId(), cityWiseCollectionModel);
								}else{
									cityWiseCollectionModel.setTotalPaidAmount(cityWiseCollectionModel.getTotalPaidAmount() - aReportModel.getGrandTotal());
									cityWiseCollectionModel.setTotalToPayAmount(cityWiseCollectionModel.getTotalToPayAmount() - 0);
									cityWiseCollectionModel.setTotalCreditorAmount(cityWiseCollectionModel.getTotalCreditorAmount() - 0);
									cityWiseCollectionModel.setQuantity(cityWiseCollectionModel.getQuantity() - aReportModel.getNoOfPackages());
								}

							}
							//City Wise Paid Details code

						} else if(aReportModel.getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_CREDIT && (executive.getAccountGroupId() == ECargoConstantFile.ACCOUNT_GROUP_ID_KONDUSKAR_S_R_TRAVELS || showCreditDetailsColumn)){
							//City Wise Paid Details code
							cityWiseToPayeeDetails = (HashMap<Long, Object>)storeCityWiseToPayeeDetails.get(aReportModel.getDestinationSubRegionId());

							if(cityWiseToPayeeDetails == null){
								cityWiseToPayeeDetails = new LinkedHashMap<>();

								var	cityWiseCollectionModel = (CityWiseCollectionModel)cityWiseToPayeeDetails.get(aReportModel.getDestinationBranchId());

								if(cityWiseCollectionModel == null){

									cityWiseCollectionModel = new CityWiseCollectionModel();

									cityWiseCollectionModel.setBranchId(aReportModel.getDestinationBranchId());
									cityWiseCollectionModel.setBranchName(aReportModel.getWayBillDestinationBranch());
									cityWiseCollectionModel.setSubRegionId(aReportModel.getDestinationSubRegionId());
									cityWiseCollectionModel.setSubRegionName(aReportModel.getWayBillDestinationSubRegion());
									cityWiseCollectionModel.setTotalPaidAmount(-0);
									cityWiseCollectionModel.setTotalToPayAmount(-0);
									cityWiseCollectionModel.setTotalCreditorAmount(-aReportModel.getGrandTotal());
									cityWiseCollectionModel.setQuantity(aReportModel.getNoOfPackages());

									cityWiseToPayeeDetails.put(aReportModel.getDestinationBranchId(), cityWiseCollectionModel);
								}else{
									cityWiseCollectionModel.setTotalPaidAmount(cityWiseCollectionModel.getTotalPaidAmount() - 0);
									cityWiseCollectionModel.setTotalToPayAmount(cityWiseCollectionModel.getTotalToPayAmount() - 0);
									cityWiseCollectionModel.setTotalCreditorAmount(cityWiseCollectionModel.getTotalCreditorAmount() - aReportModel.getGrandTotal());
									cityWiseCollectionModel.setQuantity(cityWiseCollectionModel.getQuantity() - aReportModel.getNoOfPackages());
								}

								storeCityWiseToPayeeDetails.put(aReportModel.getDestinationSubRegionId() ,cityWiseToPayeeDetails);
							}else{

								var	cityWiseCollectionModel = (CityWiseCollectionModel)cityWiseToPayeeDetails.get(aReportModel.getDestinationBranchId());

								if(cityWiseCollectionModel == null){

									cityWiseCollectionModel = new CityWiseCollectionModel();

									cityWiseCollectionModel.setBranchId(aReportModel.getDestinationBranchId());
									cityWiseCollectionModel.setBranchName(aReportModel.getWayBillDestinationBranch());
									cityWiseCollectionModel.setSubRegionId(aReportModel.getDestinationSubRegionId());
									cityWiseCollectionModel.setSubRegionName(aReportModel.getWayBillDestinationSubRegion());
									cityWiseCollectionModel.setTotalPaidAmount(-0);
									cityWiseCollectionModel.setTotalToPayAmount(-0);
									cityWiseCollectionModel.setTotalCreditorAmount(-aReportModel.getGrandTotal());
									cityWiseCollectionModel.setQuantity(aReportModel.getNoOfPackages());

									cityWiseToPayeeDetails.put(aReportModel.getDestinationBranchId(), cityWiseCollectionModel);
								}else{
									cityWiseCollectionModel.setTotalPaidAmount(cityWiseCollectionModel.getTotalPaidAmount() - 0);
									cityWiseCollectionModel.setTotalToPayAmount(cityWiseCollectionModel.getTotalToPayAmount() - 0);
									cityWiseCollectionModel.setTotalCreditorAmount(cityWiseCollectionModel.getTotalCreditorAmount() - aReportModel.getGrandTotal());
									cityWiseCollectionModel.setQuantity(cityWiseCollectionModel.getQuantity() - aReportModel.getNoOfPackages());
								}

							}
							//City Wise Paid Details code
						}
					if(aReportModel.getStatus()==WayBillStatusConstant.WAYBILL_STATUS_BOOKED){
						if(aReportModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID)
							totalBookingGrandAmount += aReportModel.getGrandTotal();
						else if(aReportModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY)
							toPayCommissionToBeLess += aReportModel.getAgentCommission();

						wayBillCategoryTypeDetails = wbCategoryTypeDetails.get(aReportModel.getWayBillType());

						if(wayBillCategoryTypeDetails == null){
							wayBillCategoryTypeDetails = new WayBillCategoryTypeDetails();

							wayBillCategoryTypeDetails.setWayBillType(aReportModel.getWayBillType());
							wayBillCategoryTypeDetails.setQuantity(aReportModel.getNoOfPackages());
							wayBillCategoryTypeDetails.setBookingDiscount(totalDiscount);
							wayBillCategoryTypeDetails.setTotalTax(totalTax);
							wayBillCategoryTypeDetails.setTotalAmount(aReportModel.getGrandTotal() - (aReportModel.getDeliveryAmount() - aReportModel.getDeliveryDiscount()));
							wayBillCategoryTypeDetails.setAgentCommission(aReportModel.getAgentCommission());
							wayBillCategoryTypeDetails.setBookingCommission(aReportModel.getBookingCommission());

							chargesCollection 		 = new HashMap<>();

							for (final WayBillCharges wayBillCharge : wayBillCharges)
								if(wayBillCharge.getChargeType() == ChargeTypeMaster.WAYBILL_CHARGETYPE_BOOKING){
									chargesCollection.put(wayBillCharge.getWayBillChargeMasterId(), wayBillCharge.getChargeAmount());

									if(wayBillCharge.getWayBillChargeMasterId() == BookingChargeConstant.FREIGHT)
										freightCharege = wayBillCharge.getChargeAmount();
								}
							wayBillCategoryTypeDetails.setChargesCollection(chargesCollection);
							if(showPackingGroupTypeWiseAmount){
								freightChargesCollection = new HashMap<>();
								freightChargesCollection.put(packingTypeGroupId+"_"+packingTypeGroupName, freightCharege);
								wayBillCategoryTypeDetails.setPackingCollection(freightChargesCollection);
							}
							wbCategoryTypeDetails.put(aReportModel.getWayBillType(), wayBillCategoryTypeDetails);
						}else{

							wayBillCategoryTypeDetails.setQuantity(wayBillCategoryTypeDetails.getQuantity() + aReportModel.getNoOfPackages());
							wayBillCategoryTypeDetails.setBookingDiscount(wayBillCategoryTypeDetails.getBookingDiscount() + totalDiscount);
							wayBillCategoryTypeDetails.setTotalTax(wayBillCategoryTypeDetails.getTotalTax() + totalTax);
							wayBillCategoryTypeDetails.setTotalAmount(wayBillCategoryTypeDetails.getTotalAmount() + (aReportModel.getGrandTotal() - (aReportModel.getDeliveryAmount() - aReportModel.getDeliveryDiscount())));
							wayBillCategoryTypeDetails.setAgentCommission(wayBillCategoryTypeDetails.getAgentCommission() + aReportModel.getAgentCommission());
							wayBillCategoryTypeDetails.setBookingCommission(wayBillCategoryTypeDetails.getBookingCommission() + aReportModel.getBookingCommission());

							chargesCollection = wayBillCategoryTypeDetails.getChargesCollection();
							for (final WayBillCharges wayBillCharge : wayBillCharges)
								if(wayBillCharge.getChargeType() == ChargeTypeMaster.WAYBILL_CHARGETYPE_BOOKING){
									if(chargesCollection.get(wayBillCharge.getWayBillChargeMasterId()) != null)
										chargesCollection.put(wayBillCharge.getWayBillChargeMasterId(), chargesCollection.get(wayBillCharge.getWayBillChargeMasterId()) + wayBillCharge.getChargeAmount());
									else
										chargesCollection.put(wayBillCharge.getWayBillChargeMasterId(), wayBillCharge.getChargeAmount());
									if(wayBillCharge.getWayBillChargeMasterId() == BookingChargeConstant.FREIGHT)
										freightCharege = wayBillCharge.getChargeAmount();
								}

							if(showPackingGroupTypeWiseAmount){
								freightChargesCollection	= wayBillCategoryTypeDetails.getPackingCollection();
								if(freightChargesCollection.get(packingTypeGroupId+"_"+packingTypeGroupName) == null)
									freightChargesCollection.put(packingTypeGroupId+"_"+packingTypeGroupName, freightCharege);
								else
									freightChargesCollection.put(packingTypeGroupId+"_"+packingTypeGroupName, freightChargesCollection.get(packingTypeGroupId+"_"+packingTypeGroupName) + freightCharege);
							}

						}

					}else if(aReportModel.getStatus()==WayBillStatusConstant.WAYBILL_STATUS_CANCELLED && (aReportModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID ||aReportModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY || aReportModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT)){
						if(aReportModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID)
							totalCancellationGrandAmount += Math.round(aReportModel.getGrandTotal()-aReportModel.getAmount());
						else if(aReportModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY)
							totalCancellationGrandAmount += Math.round(-aReportModel.getAmount());
						wayBillCategoryTypeDetails = wbCategoryTypeDetails.get(aReportModel.getWayBillType());

						if(wayBillCategoryTypeDetails == null){
							wayBillCategoryTypeDetails = new WayBillCategoryTypeDetails();

							wayBillCategoryTypeDetails.setWayBillType(aReportModel.getWayBillType());
							wayBillCategoryTypeDetails.setQuantity(-aReportModel.getNoOfPackages());
							wayBillCategoryTypeDetails.setBookingDiscount(-totalDiscount);
							wayBillCategoryTypeDetails.setTotalTax(-totalTax);
							wayBillCategoryTypeDetails.setTotalAmount(- (aReportModel.getGrandTotal()-aReportModel.getAmount() - (aReportModel.getDeliveryAmount() - aReportModel.getDeliveryDiscount())));
							wayBillCategoryTypeDetails.setAgentCommission(- aReportModel.getAgentCommission());
							wayBillCategoryTypeDetails.setBookingCommission(- aReportModel.getBookingCommission());

							chargesCollection = new HashMap<>();

							for (final WayBillCharges wayBillCharge1 : wayBillCharges)
								if(wayBillCharge1.getChargeType() == ChargeTypeMaster.WAYBILL_CHARGETYPE_BOOKING){
									chargesCollection.put(wayBillCharge1.getWayBillChargeMasterId(),- wayBillCharge1.getChargeAmount());

									if(wayBillCharge1.getWayBillChargeMasterId() == BookingChargeConstant.FREIGHT)
										freightCharege = wayBillCharge1.getChargeAmount();
								}

							wayBillCategoryTypeDetails.setChargesCollection(chargesCollection);
							if(showPackingGroupTypeWiseAmount){
								freightChargesCollection = new HashMap<>();
								freightChargesCollection.put(packingTypeGroupId+"_"+packingTypeGroupName,  -freightCharege);
								wayBillCategoryTypeDetails.setPackingCollection(freightChargesCollection);
							}

							wbCategoryTypeDetails.put(aReportModel.getWayBillType(), wayBillCategoryTypeDetails);
						}else{

							wayBillCategoryTypeDetails.setQuantity(wayBillCategoryTypeDetails.getQuantity() - aReportModel.getNoOfPackages());
							wayBillCategoryTypeDetails.setBookingDiscount(wayBillCategoryTypeDetails.getBookingDiscount() - totalDiscount);
							wayBillCategoryTypeDetails.setTotalTax(wayBillCategoryTypeDetails.getTotalTax() - totalTax);
							wayBillCategoryTypeDetails.setTotalAmount(wayBillCategoryTypeDetails.getTotalAmount() - (aReportModel.getGrandTotal()-aReportModel.getAmount() - (aReportModel.getDeliveryAmount() - aReportModel.getDeliveryDiscount())));
							wayBillCategoryTypeDetails.setAgentCommission(wayBillCategoryTypeDetails.getAgentCommission() - aReportModel.getAgentCommission());
							wayBillCategoryTypeDetails.setBookingCommission(wayBillCategoryTypeDetails.getBookingCommission() - aReportModel.getBookingCommission());
							chargesCollection = wayBillCategoryTypeDetails.getChargesCollection();

							for (final WayBillCharges wayBillCharge2 : wayBillCharges)
								if(wayBillCharge2.getChargeType() == ChargeTypeMaster.WAYBILL_CHARGETYPE_BOOKING){
									if(chargesCollection.get(wayBillCharge2.getWayBillChargeMasterId()) != null)
										chargesCollection.put(wayBillCharge2.getWayBillChargeMasterId(), chargesCollection.get(wayBillCharge2.getWayBillChargeMasterId()) - wayBillCharge2.getChargeAmount());
									else
										chargesCollection.put(wayBillCharge2.getWayBillChargeMasterId(),- wayBillCharge2.getChargeAmount());

									if(wayBillCharge2.getWayBillChargeMasterId() == BookingChargeConstant.FREIGHT)
										freightCharege = wayBillCharge2.getChargeAmount();
								}

							if(showPackingGroupTypeWiseAmount){
								freightChargesCollection	= wayBillCategoryTypeDetails.getPackingCollection();

								if(freightChargesCollection.get(packingTypeGroupId+"_"+packingTypeGroupName) == null)
									freightChargesCollection.put(packingTypeGroupId+"_"+packingTypeGroupName, -freightCharege);
								else
									freightChargesCollection.put(packingTypeGroupId+"_"+packingTypeGroupName, freightChargesCollection.get(packingTypeGroupId+"_"+packingTypeGroupName) -freightCharege);
							}
						}

					}else if(aReportModel.getStatus()==WayBillStatusConstant.WAYBILL_STATUS_DELIVERED){
						if(aReportModel.getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_TO_PAY)
							totalDeliverGrandAmount +=  aReportModel.getGrandTotal();
						else if(aReportModel.getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_PAID || aReportModel.getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_CREDIT)
							totalDeliverGrandAmount += aReportModel.getDeliveryAmount()-aReportModel.getDeliveryDiscount();

						var totalFreight 			= 0.00;
						var totalAmount 			= aReportModel.getDeliveryAmount()-aReportModel.getDeliveryDiscount();

						if(aReportModel.getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_TO_PAY){
							totalFreight = aReportModel.getGrandTotal()-(aReportModel.getDeliveryAmount()-aReportModel.getDeliveryDiscount());
							totalAmount += totalFreight;
						}

						var	wbCategoryTypeDetailsForDlvrd = deliveredWayBillDetails.get(aReportModel.getWayBillType());

						if(executive.getAccountGroupId()==AccountGroupConstant.ACCOUNT_GROUP_ID_KONDUSKAR_S_R_TRAVELS)
							if(aReportModel.getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_PAID){

								//City Wise Paid Details code
								var	cityWiseToPayeeDLVDetails = (HashMap<Long, Object>)storeCityWiseToDLVPayeeDetails.get(aReportModel.getWayBillSourceSubRegionId());

								if(cityWiseToPayeeDLVDetails == null){
									cityWiseToPayeeDLVDetails = new LinkedHashMap<>();

									var	cityWiseCollectionModel = (CityWiseCollectionModel)cityWiseToPayeeDLVDetails.get(aReportModel.getWayBillSourceBranchId());

									if(cityWiseCollectionModel == null){

										cityWiseCollectionModel = new CityWiseCollectionModel();

										cityWiseCollectionModel.setBranchId(aReportModel.getWayBillSourceBranchId());
										cityWiseCollectionModel.setBranchName(aReportModel.getWayBillSourceBranch());
										cityWiseCollectionModel.setSubRegionId(aReportModel.getWayBillSourceSubRegionId());
										cityWiseCollectionModel.setSubRegionName(aReportModel.getWayBillSourceSubRegion());
										cityWiseCollectionModel.setTotalPaidAmount(aReportModel.getDeliveryAmount());
										cityWiseCollectionModel.setTotalToPayAmount(0);
										cityWiseCollectionModel.setTotalCreditorAmount(0);

										cityWiseToPayeeDLVDetails.put(aReportModel.getWayBillSourceBranchId(), cityWiseCollectionModel);
									}else{
										cityWiseCollectionModel.setTotalPaidAmount(cityWiseCollectionModel.getTotalPaidAmount() + aReportModel.getDeliveryAmount());
										cityWiseCollectionModel.setTotalToPayAmount(cityWiseCollectionModel.getTotalToPayAmount() + 0);
										cityWiseCollectionModel.setTotalCreditorAmount(cityWiseCollectionModel.getTotalCreditorAmount() + 0);
									}

									storeCityWiseToDLVPayeeDetails.put(aReportModel.getWayBillSourceSubRegionId() ,cityWiseToPayeeDLVDetails);
								}else{

									var	cityWiseCollectionModel = (CityWiseCollectionModel)cityWiseToPayeeDLVDetails.get(aReportModel.getWayBillSourceBranchId());

									if(cityWiseCollectionModel == null){

										cityWiseCollectionModel = new CityWiseCollectionModel();

										cityWiseCollectionModel.setBranchId(aReportModel.getWayBillSourceBranchId());
										cityWiseCollectionModel.setBranchName(aReportModel.getWayBillSourceBranch());
										cityWiseCollectionModel.setSubRegionId(aReportModel.getWayBillSourceSubRegionId());
										cityWiseCollectionModel.setSubRegionName(aReportModel.getWayBillSourceSubRegion());
										cityWiseCollectionModel.setTotalPaidAmount(aReportModel.getDeliveryAmount());
										cityWiseCollectionModel.setTotalToPayAmount(0);
										cityWiseCollectionModel.setTotalCreditorAmount(0);

										cityWiseToPayeeDLVDetails.put(aReportModel.getWayBillSourceBranchId(), cityWiseCollectionModel);
									}else{
										cityWiseCollectionModel.setTotalPaidAmount(cityWiseCollectionModel.getTotalPaidAmount() + aReportModel.getDeliveryAmount());
										cityWiseCollectionModel.setTotalToPayAmount(cityWiseCollectionModel.getTotalToPayAmount() + 0);
										cityWiseCollectionModel.setTotalCreditorAmount(cityWiseCollectionModel.getTotalCreditorAmount() + 0);
									}

								}
								//City Wise Paid Details code

							}else if(aReportModel.getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_TO_PAY ){
								//City Wise ToPayee Details code
								var	cityWiseToPayeeDLVDetails = (HashMap<Long, Object>)storeCityWiseToDLVPayeeDetails.get(aReportModel.getWayBillSourceSubRegionId());

								if(cityWiseToPayeeDLVDetails == null){
									cityWiseToPayeeDLVDetails = new LinkedHashMap<>();

									var	cityWiseCollectionModel = (CityWiseCollectionModel)cityWiseToPayeeDLVDetails.get(aReportModel.getWayBillSourceBranchId());

									if(cityWiseCollectionModel == null){

										cityWiseCollectionModel = new CityWiseCollectionModel();

										cityWiseCollectionModel.setBranchId(aReportModel.getWayBillSourceBranchId());
										cityWiseCollectionModel.setBranchName(aReportModel.getWayBillSourceBranch());
										cityWiseCollectionModel.setSubRegionId(aReportModel.getWayBillSourceSubRegionId());
										cityWiseCollectionModel.setSubRegionName(aReportModel.getWayBillSourceSubRegion());
										cityWiseCollectionModel.setTotalPaidAmount(0);
										cityWiseCollectionModel.setTotalToPayAmount(aReportModel.getGrandTotal());
										cityWiseCollectionModel.setTotalCreditorAmount(0);

										cityWiseToPayeeDLVDetails.put(aReportModel.getWayBillSourceBranchId(), cityWiseCollectionModel);
									}else{
										cityWiseCollectionModel.setTotalPaidAmount(cityWiseCollectionModel.getTotalPaidAmount() + 0);
										cityWiseCollectionModel.setTotalToPayAmount(cityWiseCollectionModel.getTotalToPayAmount() + aReportModel.getGrandTotal());
										cityWiseCollectionModel.setTotalCreditorAmount(cityWiseCollectionModel.getTotalCreditorAmount() + 0);
									}

									storeCityWiseToDLVPayeeDetails.put(aReportModel.getWayBillSourceSubRegionId() ,cityWiseToPayeeDLVDetails);
								}else{

									var	cityWiseCollectionModel = (CityWiseCollectionModel)cityWiseToPayeeDLVDetails.get(aReportModel.getWayBillSourceBranchId());

									if(cityWiseCollectionModel == null){

										cityWiseCollectionModel = new CityWiseCollectionModel();

										cityWiseCollectionModel.setBranchId(aReportModel.getWayBillSourceBranchId());
										cityWiseCollectionModel.setBranchName(aReportModel.getWayBillSourceBranch());
										cityWiseCollectionModel.setSubRegionId(aReportModel.getWayBillSourceSubRegionId());
										cityWiseCollectionModel.setSubRegionName(aReportModel.getWayBillSourceSubRegion());
										cityWiseCollectionModel.setTotalPaidAmount(0);
										cityWiseCollectionModel.setTotalToPayAmount(aReportModel.getGrandTotal());
										cityWiseCollectionModel.setTotalCreditorAmount(0);

										cityWiseToPayeeDLVDetails.put(aReportModel.getWayBillSourceBranchId(), cityWiseCollectionModel);
									}else{
										cityWiseCollectionModel.setTotalPaidAmount(cityWiseCollectionModel.getTotalPaidAmount() + 0);
										cityWiseCollectionModel.setTotalToPayAmount(cityWiseCollectionModel.getTotalToPayAmount() + aReportModel.getGrandTotal());
										cityWiseCollectionModel.setTotalCreditorAmount(cityWiseCollectionModel.getTotalCreditorAmount() + 0);
									}

								}
								//City Wise ToPayee Details code
							}else if(aReportModel.getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_CREDIT ){

								//City Wise ToPayee Details code
								var	cityWiseToPayeeDLVDetails = (HashMap<Long, Object>)storeCityWiseToDLVPayeeDetails.get(aReportModel.getWayBillSourceSubRegionId());

								if(cityWiseToPayeeDLVDetails == null){
									cityWiseToPayeeDLVDetails = new LinkedHashMap<>();

									var	cityWiseCollectionModel = (CityWiseCollectionModel)cityWiseToPayeeDLVDetails.get(aReportModel.getWayBillSourceBranchId());

									if(cityWiseCollectionModel == null){

										cityWiseCollectionModel = new CityWiseCollectionModel();

										cityWiseCollectionModel.setBranchId(aReportModel.getWayBillSourceBranchId());
										cityWiseCollectionModel.setBranchName(aReportModel.getWayBillSourceBranch());
										cityWiseCollectionModel.setSubRegionId(aReportModel.getWayBillSourceSubRegionId());
										cityWiseCollectionModel.setSubRegionName(aReportModel.getWayBillSourceSubRegion());
										cityWiseCollectionModel.setTotalPaidAmount(0);
										cityWiseCollectionModel.setTotalToPayAmount(0);
										cityWiseCollectionModel.setTotalCreditorAmount(aReportModel.getDeliveryAmount());

										cityWiseToPayeeDLVDetails.put(aReportModel.getWayBillSourceBranchId() , cityWiseCollectionModel);
									}else{
										cityWiseCollectionModel.setTotalPaidAmount(cityWiseCollectionModel.getTotalPaidAmount() + 0);
										cityWiseCollectionModel.setTotalToPayAmount(cityWiseCollectionModel.getTotalToPayAmount() + 0);
										cityWiseCollectionModel.setTotalCreditorAmount(cityWiseCollectionModel.getTotalCreditorAmount() + aReportModel.getDeliveryAmount());
									}

									storeCityWiseToDLVPayeeDetails.put(aReportModel.getWayBillSourceSubRegionId() ,cityWiseToPayeeDLVDetails);
								}else{

									var	cityWiseCollectionModel = (CityWiseCollectionModel)cityWiseToPayeeDLVDetails.get(aReportModel.getWayBillSourceBranchId());

									if(cityWiseCollectionModel == null){

										cityWiseCollectionModel = new CityWiseCollectionModel();

										cityWiseCollectionModel.setBranchId(aReportModel.getWayBillSourceBranchId());
										cityWiseCollectionModel.setBranchName(aReportModel.getWayBillSourceBranch());
										cityWiseCollectionModel.setSubRegionId(aReportModel.getWayBillSourceSubRegionId());
										cityWiseCollectionModel.setSubRegionName(aReportModel.getWayBillSourceSubRegion());
										cityWiseCollectionModel.setTotalPaidAmount(0);
										cityWiseCollectionModel.setTotalToPayAmount(0);
										cityWiseCollectionModel.setTotalCreditorAmount(aReportModel.getGrandTotal());

										cityWiseToPayeeDLVDetails.put(aReportModel.getDestinationBranchId(), cityWiseCollectionModel);
									}else{
										cityWiseCollectionModel.setTotalPaidAmount(cityWiseCollectionModel.getTotalPaidAmount() + 0);
										cityWiseCollectionModel.setTotalToPayAmount(cityWiseCollectionModel.getTotalToPayAmount() + 0);
										cityWiseCollectionModel.setTotalCreditorAmount(cityWiseCollectionModel.getTotalCreditorAmount() + aReportModel.getGrandTotal());
									}

								}
								//City Wise ToPayee Details code

							}

						if(wbCategoryTypeDetailsForDlvrd == null){
							wbCategoryTypeDetailsForDlvrd = new WayBillCategoryTypeDetails();
							if(executive.getAccountGroupId()== AccountGroupConstant.ACCOUNT_GROUP_ID_KONDUSKAR_S_R_TRAVELS && wayBillType.getWayBillTypeId()==WayBillType.WAYBILL_TYPE_TO_PAY){
								if(aReportModel.isManual())
									wbCategoryTypeDetailsForDlvrd.setWayBillType("Topay manual Recovery");
								else
									wbCategoryTypeDetailsForDlvrd.setWayBillType("Topay Recovery");
							} else
								wbCategoryTypeDetailsForDlvrd.setWayBillType(aReportModel.getWayBillType());
							wbCategoryTypeDetailsForDlvrd.setQuantity(aReportModel.getNoOfPackages());
							wbCategoryTypeDetailsForDlvrd.setTotalFreight(totalFreight);
							wbCategoryTypeDetailsForDlvrd.setDeliveryDiscount(aReportModel.getDeliveryDiscount());
							wbCategoryTypeDetailsForDlvrd.setTotalAmount(totalAmount);
							wbCategoryTypeDetailsForDlvrd.setDeliveryCommission(aReportModel.getDeliveryCommission());
							chargesCollection = new HashMap<>();

							for (final WayBillCharges wayBillCharge : wayBillCharges)
								if(wayBillCharge.getChargeType() == ChargeTypeMaster.WAYBILL_CHARGETYPE_DELIVERY)
									chargesCollection.put(wayBillCharge.getWayBillChargeMasterId(), wayBillCharge.getChargeAmount());
							wbCategoryTypeDetailsForDlvrd.setChargesCollection(chargesCollection);

							deliveredWayBillDetails.put(aReportModel.getWayBillType(), wbCategoryTypeDetailsForDlvrd);
						}else{
							wbCategoryTypeDetailsForDlvrd.setQuantity(wbCategoryTypeDetailsForDlvrd.getQuantity() + aReportModel.getNoOfPackages());
							wbCategoryTypeDetailsForDlvrd.setTotalFreight(wbCategoryTypeDetailsForDlvrd.getTotalFreight() + totalFreight);
							wbCategoryTypeDetailsForDlvrd.setDeliveryDiscount(wbCategoryTypeDetailsForDlvrd.getDeliveryDiscount() + aReportModel.getDeliveryDiscount());
							wbCategoryTypeDetailsForDlvrd.setTotalAmount(wbCategoryTypeDetailsForDlvrd.getTotalAmount() + totalAmount);
							wbCategoryTypeDetailsForDlvrd.setDeliveryCommission(wbCategoryTypeDetailsForDlvrd.getDeliveryCommission() + aReportModel.getDeliveryCommission());
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

				if(wbCategoryTypeDetails != null && showPackingGroupTypeWiseAmount) {
					final var  headerKeyName = new ArrayList<String>();

					for(final String type : wbCategoryTypeDetails.keySet()) {
						final var	data	= wbCategoryTypeDetails.get(type);
						final Map<String, Double> innerDataKey = data.getPackingCollection();

						if(innerDataKey != null) {
							innerDataKey.keySet().forEach((final String key) -> {
								final var datakeyName 	= key.split("_")[1];
								final var datakey 		= key.split("_")[0];

								if(!headerKeyName.contains(datakeyName))
									headerKeyName.add(datakeyName);

								if(Long.parseLong(datakey) == PackingGroupTypeMaster.LUGGAGE_PACKING_GROUP_TYPE_ID) {
									data.setPackingGroupLuggageKey(Long.parseLong(datakey));
									data.setLuggageFreightTotal(innerDataKey.get(key));
								}

								if(Long.parseLong(datakey) == PackingGroupTypeMaster.COURIER_PACKING_GROUP_TYPE_ID) {
									data.setPackingGroupCourierKey(Long.parseLong(datakey));
									data.setCourierFreightTotal(innerDataKey.get(key));
								}
							});
							Collections.sort(headerKeyName);
						}
					}

					request.setAttribute("headerKeyName", headerKeyName);
				}

				request.setAttribute("wayBillTypeDetails", wbCategoryTypeDetails);



				request.setAttribute("deliveredWayBillDetails", deliveredWayBillDetails);
				request.setAttribute("storeCityWiseToDLVPayeeDetails", storeCityWiseToDLVPayeeDetails);
				request.setAttribute("totalGrandAmount", Math.round(totalBookingGrandAmount + totalDeliverGrandAmount - totalCancellationGrandAmount - toPayCommissionToBeLess));
				request.setAttribute("otherCharges", Math.round(otherCharges));
				request.setAttribute("showOtherChargeAmount", showOtherChargeAmount);
				request.setAttribute("grandTotalLevelRename", grandTotalLevelRename);

				//City Wise ToPayee Details code
				request.setAttribute("storeCityWiseToPayeeDetails", storeCityWiseToPayeeDetails);
				//City Wise ToPayee Details code
				request.setAttribute("showPackingGroupTypeWiseAmount", showPackingGroupTypeWiseAmount);

				if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_GROUPADMIN) {
					branch = cache.getBranchById(request ,executive.getAccountGroupId() ,branchId);

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

				request.setAttribute("BookingCharges", bookingCharges);
				request.setAttribute("DeliveryCharges", deliveryCharges);
				request.setAttribute("totalBkgFreightAmount", totalBkgFreightAmount);
				request.setAttribute("totalDlvryCmsnFreightAmount", totalDlvryCmsnFreightAmount);
				request.setAttribute("totalBkgLoadingAmount", totalBkgLoadingAmount);
				request.setAttribute("totalUnloadingAmount", totalUnloadingAmount);
				request.setAttribute("totalBkgAuto&DelUnlodinbg", Math.round(totalBookingGrandAmount + totalDeliverGrandAmount - (totalCancellationGrandAmount - toPayCommissionToBeLess))-(totalBkgAutoChargeAmount+totalUnloadingAmount+voucherDetailsAmnt));
				request.setAttribute("showTotalNoOfArticlesColumn", showTotalNoOfArticlesColumn);
				request.setAttribute("totalBookingDoorDelivery", totalBookingDoorDelivery);
				request.setAttribute("totalBookingUnloading", totalBookingUnloading);
				request.setAttribute("showBookingAndDeliveryCharges", showBookingAndDeliveryCharges);

				final var branchExpConfigValue = cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_BRANCH_EXPENSE);

				if(branchExpConfigValue == ConfigParam.CONFIG_KEY_BRANCH_EXPENSE_YES)
					request.setAttribute("BranchExpenseAmount",BranchExpenseDao.getInstance().getDailyBranchExpenseDetails(fromDate, toDate, branchId, executive.getAccountGroupId()));

				if(configuration.getBoolean(DailyBranchCollectionReportConfigurationDTO.GET_CITY_WISE_RECEIVED_STOCK_DETAILS, false))
					request.setAttribute("storeCityWiseReceivedDetails", getCityWiseReceivedStockData(request ,fromDate, toDate, branchId, executive, configuration));
			} else {
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}

			if(executive.getAccountGroupId()== AccountGroupConstant.ACCOUNT_GROUP_ID_ROYAL_STAR)
				request.setAttribute("nextPageToken", "success_"+executive.getAccountGroupId());
			else
				request.setAttribute("nextPageToken", "success");

		} catch (final Exception _e) {
			ActionStaticUtil.catchActionException(request, _e, error);
		}
	}

	private HashMap<Long,HashMap<Long,CityWiseCollectionModel>> getCityWiseReceivedStockData(final HttpServletRequest request ,final Timestamp fromDate ,final Timestamp toDate ,final long destBranchId ,final Executive executive, final ValueObject configuration) throws Exception {

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
		var												showCreditDetailsColumn			= false;

		try {
			cache = new CacheManip(request);

			showCreditDetailsColumn			= configuration.getBoolean(DailyBranchCollectionReportConfigurationDTO.SHOW_CREDIT_DETAILS_COLUMN,false);

			if(executive.getExecutiveType() != Executive.EXECUTIVE_TYPE_GROUPADMIN)
				executive.getSubRegionId();

			destBranches = Long.toString(destBranchId);

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

				if(showCreditDetailsColumn){
					if(element.getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_TO_PAY || element.getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_PAID || element.getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_CREDIT){
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
								else if(element.getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_PAID)
									cityWiseCollectionModel.setTotalPaidAmount(element.getGrandTotal());
								else
									cityWiseCollectionModel.setTotalCreditorAmount(element.getGrandTotal());

								cityWiseToPayeeDetails.put(element.getWayBillSourceBranchId(), cityWiseCollectionModel);
							} else if(element.getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_TO_PAY)
								cityWiseCollectionModel.setTotalToPayAmount(cityWiseCollectionModel.getTotalToPayAmount() + element.getGrandTotal());
							else if(element.getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_PAID)
								cityWiseCollectionModel.setTotalPaidAmount(cityWiseCollectionModel.getTotalPaidAmount() + element.getGrandTotal());
							else
								cityWiseCollectionModel.setTotalCreditorAmount(cityWiseCollectionModel.getTotalCreditorAmount() + element.getGrandTotal());

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
								else if(element.getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_PAID)
									cityWiseCollectionModel.setTotalPaidAmount(element.getGrandTotal());
								else
									cityWiseCollectionModel.setTotalCreditorAmount(element.getGrandTotal());

								cityWiseToPayeeDetails.put(element.getWayBillSourceBranchId(), cityWiseCollectionModel);
							} else if(element.getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_TO_PAY)
								cityWiseCollectionModel.setTotalToPayAmount(cityWiseCollectionModel.getTotalToPayAmount() + element.getGrandTotal());
							else if(element.getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_PAID)
								cityWiseCollectionModel.setTotalPaidAmount(cityWiseCollectionModel.getTotalPaidAmount() + element.getGrandTotal());
							else
								cityWiseCollectionModel.setTotalCreditorAmount(cityWiseCollectionModel.getTotalCreditorAmount() + element.getGrandTotal());
						}
					}
				} else if(element.getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_TO_PAY || element.getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_PAID){
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
		}
	}
}