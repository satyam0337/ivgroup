package com.ivcargo.reports;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Stream;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringUtils;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.dto.constant.BookingChargeConstant;
import com.iv.dto.constant.ExecutiveTypeConstant;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.dto.constant.WayBillStatusConstant;
import com.iv.utils.constant.AccountGroupConstant;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.exception.ExceptionProcess;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.BranchExpenseDao;
import com.platform.dao.ChargeTypeMasterDao;
import com.platform.dao.ConfigDoorDeliveryDao;
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
import com.platform.dto.ECargoConstantFile;
import com.platform.dto.Executive;
import com.platform.dto.PackingGroupTypeMaster;
import com.platform.dto.VoucherDetails;
import com.platform.dto.WayBill;
import com.platform.dto.WayBillCharges;
import com.platform.dto.WayBillTaxTxn;
import com.platform.dto.WayBillType;
import com.platform.dto.configuration.report.collection.DailyBranchCollectionReportConfigurationDTO;
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

public class DailyBranchCollectionReportAction implements Action {

	private static final String TRACE_ID = "DailyBranchCollectionReportAction";
	@Override
	@SuppressWarnings("unchecked")
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	error 	= null;
		ValueObject				objectOut					= null;
		HashMap<Long,Object>	cityWiseToPayeeDLVDetails	= null;
		WayBillType				wayBillType					= null;
		ConsignmentDetails[]	consDetails					= null;
		String					packageDetails				= null;
		WayBillTaxTxn[]			wayBillTax					= null;
		ChargeTypeModel[]		bookingCharges				= null;
		ChargeTypeModel[]		deliveryCharges				= null;
		Branch					branch						= null;
		var											wayBillIdArrStr						= "";
		var											packingTypeGroupName				= "";
		HashMap<Long, ArrayList<ConsignmentDetails>>	consignmentDetails					= null;
		HashMap<Long,PackingGroupTypeMaster>			packingGroupDetails					= null;
		ArrayList<ConsignmentDetails>					consignmentDetailsArrList			= null;
		HashMap<String,Double>							freightChargesCollection			= null;
		var											packingTypeGroupId					= 0L;
		var  										freightCharege 						= 0.00;
		var											srcMergeGroupId						= 0L;
		Map<Long, String>								receivedDateHM						= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeDailyBranchCollectionReportAction().execute(request, response);

			final var	executive       				= (Executive) request.getSession().getAttribute(Executive.EXECUTIVE);
			final var	configuration					= ReadAllConfigurationsBllImpl.getInstance().getOldReportConfigurationData(ReportIdentifierConstant.DAILY_BRANCH_COLLECTION_REPORT, executive.getAccountGroupId());
			final var	showCreditDetailsColumn			= configuration.getBoolean(DailyBranchCollectionReportConfigurationDTO.SHOW_CREDIT_DETAILS_COLUMN,false);
			final var	hideCancelledLrs				= configuration.getBoolean(DailyBranchCollectionReportConfigurationDTO.HIDE_CANCELLED_LRS,false);
			final var	showTotalNoOfArticlesColumn		= configuration.getBoolean(DailyBranchCollectionReportConfigurationDTO.SHOW_TOTAL_NO_OF_ARTICLES_COLUMN,false);
			final var	showPackingGroupTypeWiseAmount	= configuration.getBoolean(DailyBranchCollectionReportConfigurationDTO.SHOW_PACKING_GROUPTYPE_WISE_AMOUNT,false);
			final var	showBookedByColumn				= configuration.getBoolean(DailyBranchCollectionReportConfigurationDTO.SHOW_BOOKED_BY_COLUMN,false);
			final var	showRemarkCoulmn				= configuration.getBoolean(DailyBranchCollectionReportConfigurationDTO.SHOW_REMARK_COULMN,false);
			final var	showConsignorMobNoColumn		= configuration.getBoolean(DailyBranchCollectionReportConfigurationDTO.SHOW_CONSIGNOR_MOBNO_COLUMN,false);
			final var	showConsigneeMobNoColumn		= configuration.getBoolean(DailyBranchCollectionReportConfigurationDTO.SHOW_CONSIGNEE_MOBNO_COLUMN,false);
			final var	showBookingAndDeliveryCharges	= configuration.getBoolean(DailyBranchCollectionReportConfigurationDTO.SHOW_BOOKING_AND_DELIVERY_CHARGES,false);
			final var 	showReceiveDate					= configuration.getBoolean(DailyBranchCollectionReportConfigurationDTO.SHOW_RECEIVE_DATE_IN_DELIVERY_DETAILS, false);
			final var 	showPackageDetails				= configuration.getBoolean(DailyBranchCollectionReportConfigurationDTO.SHOW_PACKAGE_DETAILS_IN_DELIVERY_DETAILS, false);
			final var 	showDeliveredBeforeCancelLrs	= configuration.getBoolean(DailyBranchCollectionReportConfigurationDTO.SHOW_DELIVERED_BEFORE_CANCEL_LRS, false);
			final var	showOtherChargeAmount			= configuration.getBoolean(DailyBranchCollectionReportConfigurationDTO.SHOW_OTHER_CHARGE_AMOUNT,false);
			final var	grandTotalLevelRename			= configuration.getString(DailyBranchCollectionReportConfigurationDTO.GRAND_TOTAL_LEVEL_RENAME);

			final var	sdf               = new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			final var	fromDate          = new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00").getTime());
			final var	toDate            = new Timestamp(sdf.parse(JSPUtility.GetString(request, "toDate") + " 23:59:59").getTime());
			Branch[]	branches  		  	= null;
			var selectedCity      =  0L;
			final var destinationCityId =  JSPUtility.GetLong(request, "TosubRegion",0);

			final var	cache = new CacheManip(request);

			// Get the Selected  Combo values
			final var	mergeGroupSubRegionStr	= request.getParameter("subRegion");

			if(mergeGroupSubRegionStr != null)
				if(StringUtils.contains(mergeGroupSubRegionStr, "_"))
					srcMergeGroupId	= Long.parseLong(mergeGroupSubRegionStr.split("_")[1]);
				else
					selectedCity 	= Long.parseLong(mergeGroupSubRegionStr);

			//Get all Branches
			if(selectedCity > 0) {
				branches = cache.getBranchesArrayBySubRegionId(request, executive.getAccountGroupId(), selectedCity);
				request.setAttribute("branches", branches);
			} else if(srcMergeGroupId > 0) {
				branches 	= cache.getAssignedBranchArrayByAssignedAccountGroupId(request, executive.getAccountGroupId(), srcMergeGroupId);
				request.setAttribute("branches", branches);
			}

			// Get All Executives

			var 	branchId = 0L;
			var 	voucherDetailsAmnt = 0D;
			final var	objectIn			= new ValueObject();
			final var	voucherDetailsDao	= new VoucherDetailsDao();

			if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_EXECUTIVE || executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_BRANCHADMIN || executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_LIMITED)
				branchId = executive.getBranchId();
			else if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN || executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_REGIONADMIN || executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_SUBREGIONADMIN){
				if(request.getParameter("branch") != null)
					branchId = Long.parseLong(request.getParameter("branch"));

				if(branchId <= 0)
					branchId = JSPUtility.GetLong(request, "branchId", 0);
			}

			final var	totalAmountForSummarry =voucherDetailsDao.getAmountForDailyBranchExpense(fromDate, toDate, branchId, executive.getAccountGroupId());

			if(totalAmountForSummarry != null)
				voucherDetailsAmnt	= Stream.of(totalAmountForSummarry).map(VoucherDetails::getTotalAmount).mapToDouble(Double::doubleValue).sum();

			objectIn.put("fromDate", fromDate);
			objectIn.put("toDate", toDate);
			objectIn.put("branchId", branchId);
			objectIn.put("accountGroupId", executive.getAccountGroupId());
			objectIn.put("filter", 0);
			objectIn.put("destinationCityId", destinationCityId);

			if(destinationCityId == 0)
				objectOut= DailyBranchCollectionDAO.getInstance().getReportForBranch(objectIn);
			else
				objectOut= DailyBranchCollectionDAO.getInstance().getReportDestinationWise(objectIn);

			final var	reportModel					= (DailyBranchCollectionReportModel[])objectOut.get("DailyBranchCollectionReportModel");
			final var	wayBillIdArray				= (Long[]) objectOut.get("WayBillIdArray");
			wayBillIdArrStr 			= Utility.GetLongArrayToString(wayBillIdArray);

			if (showReceiveDate)
				receivedDateHM	= ReceivedStockActionDAO.getInstance().getReceiveDateByWayBillIds(executive.getAccountGroupId(), wayBillIdArrStr);

			if(showPackingGroupTypeWiseAmount){
				if(wayBillIdArrStr != null && !wayBillIdArrStr.isEmpty())
					consignmentDetails		= ConsignmentDetailsDao.getInstance().getConsignmentDetailsByWayBillIds(wayBillIdArrStr);

				packingGroupDetails			= PackingGroupTypeMasterDao.getInstance().findAllByAccountGroupIdForReport(executive.getAccountGroupId());
			}

			if(objectOut.get("WayBillExpenseModel") != null)
				request.setAttribute("WayBillExpenseModel", objectOut.get("WayBillExpenseModel"));

			var	reportViewModel = new ReportViewModel();
			reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);
			request.setAttribute("ReportViewModel",reportViewModel);

			final HashMap<Long,DailyBranchCollectionReportModel>	booking						= new LinkedHashMap<>();
			final HashMap<Long,DailyBranchCollectionReportModel>	cancellation				= new LinkedHashMap<>();
			final HashMap<Long,DailyBranchCollectionReportModel>	deliveryCancellation		= new LinkedHashMap<>();
			final HashMap<Long,DailyBranchCollectionReportModel>	delivery					= new LinkedHashMap<>();
			final HashMap<Long,DailyBranchCollectionReportModel>	creditDelivery				= new LinkedHashMap<>();
			final HashMap<Long,DailyBranchCollectionReportModel>	focLR						= new LinkedHashMap<>();
			final HashMap<Long,DailyBranchCollectionReportModel>	focManual					= new LinkedHashMap<>();
			final HashMap<Long,DailyBranchCollectionReportModel>	toPayeeBooking				= new LinkedHashMap<>();
			final HashMap<Long,DailyBranchCollectionReportModel>	creditorBooking				= new LinkedHashMap<>();
			final HashMap<Long,DailyBranchCollectionReportModel>	bookingManual				= new LinkedHashMap<>();
			final HashMap<Long,DailyBranchCollectionReportModel>	toPayeeBookingManual		= new LinkedHashMap<>();
			final HashMap<Long,DailyBranchCollectionReportModel>	creditorBookingManual		= new LinkedHashMap<>();
			final HashMap<Long,DailyBranchCollectionReportModel>	deuDeliver					= new LinkedHashMap<>();
			final HashMap<String,ArrayList<Long>>	chargeColumns				= new LinkedHashMap<>();
			final var	paidChargeColumns			= new ArrayList<Long>();
			final var	cancellationChargeColumns	= new ArrayList<Long>();
			final var	deliveryChargeColumns		= new ArrayList<Long>();
			final var	creditDeliveryChargeColumns	= new ArrayList<Long>();
			final var	focChargeColumns			= new ArrayList<Long>();
			final var	focManualChargeColumns		= new ArrayList<Long>();
			final var	toPayChargeColumns			= new ArrayList<Long>();
			final var	creditorChargeColumns		= new ArrayList<Long>();
			final var	paidManualChargeColumns		= new ArrayList<Long>();
			final var	toPayManualChargeColumns	= new ArrayList<Long>();
			final var	creditorManualChargeColumns	= new ArrayList<Long>();
			final var	dueDeliverChargeColumns		= new ArrayList<Long>();
			final var	deliveredWayBills			= new ArrayList<Long>();
			final var	cancelledWayBills			= new ArrayList<Long>();
			final var	totalChargesAmount			= new HashMap<Long,Double>();
			final var	wbCategoryTypeDetails		= new HashMap<String,WayBillCategoryTypeDetails>();
			final var	deliveredWayBillDetails		= new HashMap<String,WayBillCategoryTypeDetails>();
			var totalBookingGrandAmount 		= 0D;
			var totalCancellationGrandAmount 	= 0D;
			var totalDeliverGrandAmount 		= 0D;
			var toPayCommissionToBeLess 		= 0D;
			var totalBkgFreightAmount 			= 0D;
			var totalDlvryCmsnFreightAmount 	= 0D;
			var totalBkgLoadingAmount 			= 0D;
			var totalBkgAutoChargeAmount		= 0D;
			var totalUnloadingAmount 			= 0D;
			var totalBookingDoorDelivery		= 0D;
			var totalBookingUnloading			= 0D;
			var otherCharges			 		= 0D;

			//City Wise ToPayee Details code
			final HashMap<Long,Object>	storeCityWiseToPayeeDetails = new LinkedHashMap<>();
			final HashMap<Long,Object>	storeCityWiseToDLVPayeeDetails = new LinkedHashMap<>();
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
				HashMap<Long, WayBillDeatailsModel>	wayBillDetails =null;
				if(showPackageDetails)
					wayBillDetails = WayBillDetailsDAO.getInstance().getWayBillDetails(wayBillIdArray ,true ,ChargeTypeMaster.WAYBILL_CHARGETYPE_BOTH ,true ,WayBillTaxTxn.WAYBILL_TAX_TXN_TYPE_BOOKING ,true);
				else wayBillDetails = WayBillDetailsDAO.getInstance().getWayBillDetails(wayBillIdArray ,true ,ChargeTypeMaster.WAYBILL_CHARGETYPE_BOTH ,true ,WayBillTaxTxn.WAYBILL_TAX_TXN_TYPE_BOOKING ,false);

				for (final DailyBranchCollectionReportModel aReportModel : reportModel) {

					freightCharege = 0.00;
					if (hideCancelledLrs && aReportModel.getCurrentStatus() == WayBillStatusConstant.WAYBILL_STATUS_CANCELLED)
						continue;

					//show commission column
					if(aReportModel.getAgentCommission() > 0)
						doNotShow_Commission = true;

					if(showPackingGroupTypeWiseAmount){
						if(consignmentDetails != null)
							consignmentDetailsArrList		= consignmentDetails.get(aReportModel.getWayBillId());

						if(consignmentDetailsArrList != null && !consignmentDetailsArrList.isEmpty())
							for (final ConsignmentDetails element : consignmentDetailsArrList) {
								final var	packingGroupTypeMasterModel = packingGroupDetails.get(element.getPackingTypeMasterId());
								packingTypeGroupId = 0;
								packingTypeGroupName = "";

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
					// Set City & Branch name
					aReportModel.setWayBillSourceSubRegion(cache.getGenericSubRegionById(request, aReportModel.getWayBillSourceSubRegionId()).getName());
					aReportModel.setWayBillSourceBranch(cache.getGenericBranchDetailCache(request, aReportModel.getWayBillSourceBranchId()).getName());
					aReportModel.setWayBillDestinationSubRegion(cache.getGenericSubRegionById(request, aReportModel.getWayBillDestinationSubRegionId()).getName());
					aReportModel.setWayBillDestinationBranch(cache.getGenericBranchDetailCache(request, aReportModel.getWayBillDestinationBranchId()).getName());

					//set Parcel Received Date
					if(receivedDateHM != null)
						aReportModel.setReceivedDateStr(receivedDateHM.getOrDefault(aReportModel.getWayBillId(), ""));

					// Set City & Branch name

					// Set WayBill Type Name
					wayBillType = cache.getWayBillTypeById(request, aReportModel.getWayBillTypeId());
					if(aReportModel.isManual())
						aReportModel.setWayBillType(wayBillType.getWayBillType()+"(M)");
					else aReportModel.setWayBillType(wayBillType.getWayBillType());

					// Get package Type for Southern
					if(showPackageDetails){
						consDetails		= wayBillDetails.get(aReportModel.getWayBillId()).getConsignmentDetails();
						packageDetails	= "";
						for (var j=0; j<consDetails.length; j++)
							if (j != consDetails.length-1)
								packageDetails += consDetails[j].getQuantity()+" "+consDetails[j].getPackingTypeName()+" / ";
							else
								packageDetails += consDetails[j].getQuantity()+" "+consDetails[j].getPackingTypeName();

						aReportModel.setPackageDetails(packageDetails);
					}

					//WayBill Charges (Booking & Delivery)

					final var	wayBillCharges = wayBillDetails.get(aReportModel.getWayBillId()).getWayBillCharges();
					final var	bookedWayBillCategoryTypeDetails = new HashMap<String,Double>();
					var chargeAmt = 0D;

					for (final WayBillCharges wayBillCharge : wayBillCharges) {
						chargeAmt = wayBillCharge.getChargeAmount();

						if(aReportModel.getStatus() != WayBillStatusConstant.WAYBILL_STATUS_DELIVERED && wayBillCharge.getChargeType() == ChargeTypeMaster.WAYBILL_CHARGETYPE_BOOKING){
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

						if(aReportModel.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DELIVERED && wayBillCharge.getChargeType() == ChargeTypeMaster.WAYBILL_CHARGETYPE_DELIVERY){
							bookedWayBillCategoryTypeDetails.put(Long.toString(wayBillCharge.getWayBillChargeMasterId()), chargeAmt);

							if (wayBillCharge.getWayBillChargeMasterId() == ChargeTypeMaster.HANDLING_DELIVERY_CHARGE || wayBillCharge.getWayBillChargeMasterId() == ChargeTypeMaster.DOOR_DELIVERY_DELIVERY)
								otherCharges += chargeAmt;

							if(wayBillCharge.getWayBillChargeMasterId() == ChargeTypeMaster.UNLOADING)
								totalUnloadingAmount += chargeAmt;
						}

						if(aReportModel.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DELIVERED) {
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

						//Get Non Zero Charge Columns : START
						if(aReportModel.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_BOOKED){
							if(aReportModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID){
								if(!aReportModel.isManual()){
									if(chargeAmt > 0 && !paidChargeColumns.contains(wayBillCharge.getWayBillChargeMasterId()))
										paidChargeColumns.add(wayBillCharge.getWayBillChargeMasterId());
								} else if(chargeAmt > 0 && !paidManualChargeColumns.contains(wayBillCharge.getWayBillChargeMasterId()))
									paidManualChargeColumns.add(wayBillCharge.getWayBillChargeMasterId());
							}
							else if(aReportModel.getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_FOC){
								if(!aReportModel.isManual()){
									if(chargeAmt > 0 && !focChargeColumns.contains(wayBillCharge.getWayBillChargeMasterId()))
										focChargeColumns.add(wayBillCharge.getWayBillChargeMasterId());
								} else if(chargeAmt > 0 && !focManualChargeColumns.contains(wayBillCharge.getWayBillChargeMasterId()))
									focManualChargeColumns.add(wayBillCharge.getWayBillChargeMasterId());
							}
							else if(aReportModel.getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_TO_PAY ){
								if(!aReportModel.isManual()){
									if(chargeAmt > 0 && !toPayChargeColumns.contains(wayBillCharge.getWayBillChargeMasterId()))
										toPayChargeColumns.add(wayBillCharge.getWayBillChargeMasterId());
								} else if(chargeAmt > 0 && !toPayManualChargeColumns.contains(wayBillCharge.getWayBillChargeMasterId()))
									toPayManualChargeColumns.add(wayBillCharge.getWayBillChargeMasterId());
							}
							else if(aReportModel.getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_CREDIT )
								if(!aReportModel.isManual()){
									if(chargeAmt > 0 && !creditorChargeColumns.contains(wayBillCharge.getWayBillChargeMasterId()))
										creditorChargeColumns.add(wayBillCharge.getWayBillChargeMasterId());
								} else if(chargeAmt > 0 && !creditorManualChargeColumns.contains(wayBillCharge.getWayBillChargeMasterId()))
									creditorManualChargeColumns.add(wayBillCharge.getWayBillChargeMasterId());
						} else if(aReportModel.getStatus()==WayBillStatusConstant.WAYBILL_STATUS_CANCELLED){
							if(chargeAmt > 0 && ! cancellationChargeColumns.contains(wayBillCharge.getWayBillChargeMasterId()))
								cancellationChargeColumns.add(wayBillCharge.getWayBillChargeMasterId());
						}else if(aReportModel.getStatus()==WayBillStatusConstant.WAYBILL_STATUS_DELIVERED){
							if(wayBillCharge.getWayBillChargeMasterId() == ChargeTypeMaster.FREIGHT && aReportModel.getDeliveryCommission() > 0 )
								totalDlvryCmsnFreightAmount +=	chargeAmt;

							if(chargeAmt > 0 && ! deliveryChargeColumns.contains(wayBillCharge.getWayBillChargeMasterId()))
								deliveryChargeColumns.add(wayBillCharge.getWayBillChargeMasterId());
						}else if(aReportModel.getStatus()==WayBillStatusConstant.WAYBILL_STATUS_CREDIT_DELIVERED){
							if(chargeAmt > 0 && ! creditDeliveryChargeColumns.contains(wayBillCharge.getWayBillChargeMasterId()))
								creditDeliveryChargeColumns.add(wayBillCharge.getWayBillChargeMasterId());
						}else if(aReportModel.getStatus()==WayBillStatusConstant.WAYBILL_STATUS_DUEDELIVERED||aReportModel.getStatus()==WayBillStatusConstant.WAYBILL_STATUS_DUEUNDELIVERED)
							if(chargeAmt > 0 && ! dueDeliverChargeColumns.contains(wayBillCharge.getWayBillChargeMasterId()))
								dueDeliverChargeColumns.add(wayBillCharge.getWayBillChargeMasterId());

						var chargeAmount = 0D;
						if (totalChargesAmount.get(wayBillCharge.getWayBillChargeMasterId())!= null)
							chargeAmount += totalChargesAmount.get(wayBillCharge.getWayBillChargeMasterId());
						totalChargesAmount.put(wayBillCharge.getWayBillChargeMasterId(),chargeAmount);

					}
					aReportModel.setChargesCollection(bookedWayBillCategoryTypeDetails);
					//end

					//Calculate Total WayBill Tax
					wayBillTax = wayBillDetails.get(aReportModel.getWayBillId()).getWayBillTaxTxn();
					var totalTax 				= 0.00;

					for (final WayBillTaxTxn element : wayBillTax)
						totalTax += element.getTaxAmount();

					totalTax = Math.round(totalTax);

					aReportModel.setTotalTax(totalTax);

					if(totalTax > 0)
						doNotShow_Tax = true;

					//Calculate Total Discount
					var totalDiscount = 0.00;
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
							var	cityWiseToPayeeDetails = (HashMap<Long, Object>)storeCityWiseToPayeeDetails.get(aReportModel.getDestinationSubRegionId());

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

							if(!aReportModel.isManual())
								booking.put(aReportModel.getWayBillId(), aReportModel);
							else
								bookingManual.put(aReportModel.getWayBillId(), aReportModel);
						}
						else if(aReportModel.getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_FOC){
							if(!aReportModel.isManual())
								focLR.put(aReportModel.getWayBillId(), aReportModel);
							else
								focManual.put(aReportModel.getWayBillId(), aReportModel);
						}
						else if(aReportModel.getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_TO_PAY ){
							//City Wise ToPayee Details code
							var	cityWiseToPayeeDetails = (HashMap<Long, Object>)storeCityWiseToPayeeDetails.get(aReportModel.getDestinationSubRegionId());

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
									cityWiseCollectionModel.setTotalToPayAmount(aReportModel.getGrandTotal() + aReportModel.getAgentCommission());
									cityWiseCollectionModel.setTotalCreditorAmount(0);
									cityWiseCollectionModel.setQuantity(aReportModel.getNoOfPackages());

									cityWiseToPayeeDetails.put(aReportModel.getDestinationBranchId(), cityWiseCollectionModel);
								}else{
									cityWiseCollectionModel.setTotalPaidAmount(cityWiseCollectionModel.getTotalPaidAmount() + 0);
									cityWiseCollectionModel.setTotalToPayAmount(cityWiseCollectionModel.getTotalToPayAmount() + aReportModel.getGrandTotal() + aReportModel.getAgentCommission());
									cityWiseCollectionModel.setTotalCreditorAmount(cityWiseCollectionModel.getTotalCreditorAmount() + 0);
									cityWiseCollectionModel.setQuantity(cityWiseCollectionModel.getQuantity() + aReportModel.getNoOfPackages());
								}
							}
							//City Wise ToPayee Details code

							if(!aReportModel.isManual())
								toPayeeBooking.put(aReportModel.getWayBillId(), aReportModel);
							else
								toPayeeBookingManual.put(aReportModel.getWayBillId(), aReportModel);
						}
						else if( aReportModel.getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_CREDIT){
							if(!aReportModel.isManual())
								creditorBooking.put(aReportModel.getWayBillId(), aReportModel);
							else
								creditorBookingManual.put(aReportModel.getWayBillId(), aReportModel);

							if(executive.getAccountGroupId() == ECargoConstantFile.ACCOUNT_GROUP_ID_KONDUSKAR_S_R_TRAVELS || showCreditDetailsColumn){
								//City Wise creditor Details code
								var	cityWiseToPayeeDetails = (HashMap<Long, Object>)storeCityWiseToPayeeDetails.get(aReportModel.getDestinationSubRegionId());

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
							}
						}
					}else if(aReportModel.getStatus()==WayBillStatusConstant.WAYBILL_STATUS_CANCELLED){

						cancellation.put(aReportModel.getWayBillId(), aReportModel);

						if(aReportModel.getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_TO_PAY || aReportModel.getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_CREDIT )
							cancelledWayBills.add(aReportModel.getWayBillId());
						if(aReportModel.getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_TO_PAY){

							//City Wise ToPay Details code
							var	cityWiseToPayeeDetails = (HashMap<Long, Object>)storeCityWiseToPayeeDetails.get(aReportModel.getDestinationSubRegionId());

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
								}else{
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
									cityWiseCollectionModel.setTotalToPayAmount(- (aReportModel.getGrandTotal() + aReportModel.getAgentCommission()));
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
							var	cityWiseToPayeeDetails = (HashMap<Long, Object>)storeCityWiseToPayeeDetails.get(aReportModel.getDestinationSubRegionId());

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
							//City Wise creditor Details code
							var	cityWiseToPayeeDetails = (HashMap<Long, Object>)storeCityWiseToPayeeDetails.get(aReportModel.getDestinationSubRegionId());

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
							//City Wise creditor Details code
						}
					}else if(aReportModel.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DELIVERED ||
							aReportModel.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DELIVERED_BEFORE_CANCEL && showDeliveredBeforeCancelLrs){
						deliveredWayBills.add(aReportModel.getWayBillId());
						delivery.put(aReportModel.getWayBillId(), aReportModel);

						if (aReportModel.getDeliveryDiscount() > 0 )
							doNotShowDelivery_Disc = true;

					}else if(aReportModel.getStatus()==WayBillStatusConstant.WAYBILL_STATUS_CREDIT_DELIVERED)
						creditDelivery.put(aReportModel.getWayBillId(), aReportModel);
					else if(aReportModel.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CANCELLED_DELIVERY)
						deliveryCancellation.put(aReportModel.getWayBillId(), aReportModel);

					if(isConfigDoorDelivery && (aReportModel.getStatus()==WayBillStatusConstant.WAYBILL_STATUS_DUEDELIVERED||aReportModel.getStatus()==WayBillStatusConstant.WAYBILL_STATUS_DUEUNDELIVERED)){
						if(aReportModel.getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_PAID)
							aReportModel.setGrandTotal(aReportModel.getDeliveryAmount()-aReportModel.getDeliveryDiscount());
						else if(aReportModel.getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_FOC || aReportModel.getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_CREDIT )
							aReportModel.setGrandTotal(0);
						deuDeliver.put(aReportModel.getWayBillId(), aReportModel);
					}
					if(aReportModel.getStatus()==WayBillStatusConstant.WAYBILL_STATUS_BOOKED){
						if(aReportModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID)
							totalBookingGrandAmount += aReportModel.getGrandTotal();
						else if(aReportModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY)
							toPayCommissionToBeLess += aReportModel.getAgentCommission();
						var	wayBillCategoryTypeDetails = wbCategoryTypeDetails.get(aReportModel.getWayBillType());

						if(wayBillCategoryTypeDetails == null){
							wayBillCategoryTypeDetails = new WayBillCategoryTypeDetails();

							wayBillCategoryTypeDetails.setWayBillType(aReportModel.getWayBillType());
							wayBillCategoryTypeDetails.setQuantity(aReportModel.getNoOfPackages());
							wayBillCategoryTypeDetails.setBookingDiscount(totalDiscount);
							wayBillCategoryTypeDetails.setTotalTax(totalTax);
							wayBillCategoryTypeDetails.setTotalAmount(aReportModel.getGrandTotal() - (aReportModel.getDeliveryAmount() - aReportModel.getDeliveryDiscount()));
							wayBillCategoryTypeDetails.setAgentCommission(aReportModel.getAgentCommission());
							wayBillCategoryTypeDetails.setBookingCommission(aReportModel.getBookingCommission());

							final var	chargesCollection		   = new HashMap<Long,Double>();
							for (final WayBillCharges wayBillCharge : wayBillCharges) {
								if(wayBillCharge.getChargeType() == ChargeTypeMaster.WAYBILL_CHARGETYPE_BOOKING)
									chargesCollection.put(wayBillCharge.getWayBillChargeMasterId(), wayBillCharge.getChargeAmount());

								if(wayBillCharge.getWayBillChargeMasterId() == ChargeTypeMaster.FREIGHT)
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

							final HashMap<Long,Double>	chargesCollection = wayBillCategoryTypeDetails.getChargesCollection();

							for (final WayBillCharges wayBillCharge : wayBillCharges)
								if(wayBillCharge.getChargeType() == ChargeTypeMaster.WAYBILL_CHARGETYPE_BOOKING){
									if(chargesCollection.get(wayBillCharge.getWayBillChargeMasterId()) != null)
										chargesCollection.put(wayBillCharge.getWayBillChargeMasterId(), chargesCollection.get(wayBillCharge.getWayBillChargeMasterId()) + wayBillCharge.getChargeAmount());
									else
										chargesCollection.put(wayBillCharge.getWayBillChargeMasterId(), wayBillCharge.getChargeAmount());

									if(wayBillCharge.getWayBillChargeMasterId() == ChargeTypeMaster.FREIGHT)
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

						var	wayBillCategoryTypeDetails = wbCategoryTypeDetails.get(aReportModel.getWayBillType());

						if(wayBillCategoryTypeDetails == null){
							wayBillCategoryTypeDetails = new WayBillCategoryTypeDetails();

							wayBillCategoryTypeDetails.setWayBillType(aReportModel.getWayBillType());
							wayBillCategoryTypeDetails.setQuantity(-aReportModel.getNoOfPackages());
							wayBillCategoryTypeDetails.setBookingDiscount(-totalDiscount);
							wayBillCategoryTypeDetails.setTotalTax(-totalTax);
							wayBillCategoryTypeDetails.setTotalAmount(- (aReportModel.getGrandTotal()-aReportModel.getAmount() - (aReportModel.getDeliveryAmount() - aReportModel.getDeliveryDiscount())));
							wayBillCategoryTypeDetails.setAgentCommission( - aReportModel.getAgentCommission());
							wayBillCategoryTypeDetails.setBookingCommission( - aReportModel.getBookingCommission());
							final var	chargesCollection 		 = new HashMap<Long,Double>();

							for (final WayBillCharges wayBillCharge1 : wayBillCharges) {
								if(wayBillCharge1.getChargeType() == ChargeTypeMaster.WAYBILL_CHARGETYPE_BOOKING)
									chargesCollection.put(wayBillCharge1.getWayBillChargeMasterId(),- wayBillCharge1.getChargeAmount());

								if(wayBillCharge1.getWayBillChargeMasterId() == ChargeTypeMaster.FREIGHT)
									freightCharege = wayBillCharge1.getChargeAmount();
							}

							if(showPackingGroupTypeWiseAmount){
								freightChargesCollection = new HashMap<>();
								freightChargesCollection.put(packingTypeGroupId+"_"+packingTypeGroupName,  -freightCharege);
								wayBillCategoryTypeDetails.setPackingCollection(freightChargesCollection);
							}

							wayBillCategoryTypeDetails.setChargesCollection(chargesCollection);

							wbCategoryTypeDetails.put(aReportModel.getWayBillType(), wayBillCategoryTypeDetails);
						}else{

							wayBillCategoryTypeDetails.setQuantity(wayBillCategoryTypeDetails.getQuantity() - aReportModel.getNoOfPackages());
							wayBillCategoryTypeDetails.setBookingDiscount(wayBillCategoryTypeDetails.getBookingDiscount() - totalDiscount);
							wayBillCategoryTypeDetails.setTotalTax(wayBillCategoryTypeDetails.getTotalTax() - totalTax);
							wayBillCategoryTypeDetails.setTotalAmount(wayBillCategoryTypeDetails.getTotalAmount() - (aReportModel.getGrandTotal()-aReportModel.getAmount() - (aReportModel.getDeliveryAmount() - aReportModel.getDeliveryDiscount())));
							wayBillCategoryTypeDetails.setAgentCommission(wayBillCategoryTypeDetails.getAgentCommission() - aReportModel.getAgentCommission());
							wayBillCategoryTypeDetails.setBookingCommission(wayBillCategoryTypeDetails.getBookingCommission() - aReportModel.getBookingCommission());
							final HashMap<Long,Double>	chargesCollection = wayBillCategoryTypeDetails.getChargesCollection();

							for (final WayBillCharges wayBillCharge2 : wayBillCharges) {
								if(wayBillCharge2.getChargeType() == ChargeTypeMaster.WAYBILL_CHARGETYPE_BOOKING)
									if(chargesCollection.get(wayBillCharge2.getWayBillChargeMasterId()) != null)
										chargesCollection.put(wayBillCharge2.getWayBillChargeMasterId(), chargesCollection.get(wayBillCharge2.getWayBillChargeMasterId()) - wayBillCharge2.getChargeAmount());
									else
										chargesCollection.put(wayBillCharge2.getWayBillChargeMasterId(),- wayBillCharge2.getChargeAmount());

								if(wayBillCharge2.getWayBillChargeMasterId() == ChargeTypeMaster.FREIGHT)
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
					}else if(aReportModel.getStatus()==WayBill.WAYBILL_STATUS_DELIVERED){
						if(aReportModel.getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_TO_PAY)
							totalDeliverGrandAmount +=  aReportModel.getGrandTotal();
						else if(aReportModel.getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_PAID || aReportModel.getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_CREDIT)
							totalDeliverGrandAmount += aReportModel.getDeliveryAmount()-aReportModel.getDeliveryDiscount();

						var totalFreight = 0.00;
						var totalAmount 	= aReportModel.getDeliveryAmount()-aReportModel.getDeliveryDiscount();

						if(aReportModel.getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_TO_PAY){
							totalFreight = aReportModel.getGrandTotal()-(aReportModel.getDeliveryAmount()-aReportModel.getDeliveryDiscount());
							totalAmount += totalFreight;
						}

						var	wbCategoryTypeDetailsForDlvrd = deliveredWayBillDetails.get(aReportModel.getWayBillType());

						if(executive.getAccountGroupId()==ECargoConstantFile.ACCOUNT_GROUP_ID_KONDUSKAR_S_R_TRAVELS || showCreditDetailsColumn)
							if(aReportModel.getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_PAID){

								//City Wise Paid Details code
								cityWiseToPayeeDLVDetails = (HashMap<Long, Object>)storeCityWiseToDLVPayeeDetails.get(aReportModel.getWayBillSourceSubRegionId());

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
										cityWiseCollectionModel.setQuantity(aReportModel.getNoOfPackages());

										cityWiseToPayeeDLVDetails.put(aReportModel.getWayBillSourceBranchId(), cityWiseCollectionModel);
									}else{
										cityWiseCollectionModel.setTotalPaidAmount(cityWiseCollectionModel.getTotalPaidAmount() + aReportModel.getDeliveryAmount());
										cityWiseCollectionModel.setTotalToPayAmount(cityWiseCollectionModel.getTotalToPayAmount() + 0);
										cityWiseCollectionModel.setTotalCreditorAmount(cityWiseCollectionModel.getTotalCreditorAmount() + 0);
										cityWiseCollectionModel.setQuantity(cityWiseCollectionModel.getQuantity() + aReportModel.getNoOfPackages());
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
										cityWiseCollectionModel.setQuantity(aReportModel.getNoOfPackages());

										cityWiseToPayeeDLVDetails.put(aReportModel.getWayBillSourceBranchId(), cityWiseCollectionModel);
									}else{
										cityWiseCollectionModel.setTotalPaidAmount(cityWiseCollectionModel.getTotalPaidAmount() + aReportModel.getDeliveryAmount());
										cityWiseCollectionModel.setTotalToPayAmount(cityWiseCollectionModel.getTotalToPayAmount() + 0);
										cityWiseCollectionModel.setTotalCreditorAmount(cityWiseCollectionModel.getTotalCreditorAmount() + 0);
										cityWiseCollectionModel.setQuantity(cityWiseCollectionModel.getQuantity() + aReportModel.getNoOfPackages());
									}

								}
								//City Wise Paid Details code

							}else if(aReportModel.getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_TO_PAY ){
								//City Wise ToPayee Details code
								cityWiseToPayeeDLVDetails = (HashMap<Long, Object>)storeCityWiseToDLVPayeeDetails.get(aReportModel.getWayBillSourceSubRegionId());

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
										cityWiseCollectionModel.setQuantity(aReportModel.getNoOfPackages());

										cityWiseToPayeeDLVDetails.put(aReportModel.getWayBillSourceBranchId(), cityWiseCollectionModel);
									}else{
										cityWiseCollectionModel.setTotalPaidAmount(cityWiseCollectionModel.getTotalPaidAmount() + 0);
										cityWiseCollectionModel.setTotalToPayAmount(cityWiseCollectionModel.getTotalToPayAmount() + aReportModel.getGrandTotal());
										cityWiseCollectionModel.setTotalCreditorAmount(cityWiseCollectionModel.getTotalCreditorAmount() + 0);
										cityWiseCollectionModel.setQuantity(cityWiseCollectionModel.getQuantity() +aReportModel.getNoOfPackages());
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
										cityWiseCollectionModel.setQuantity(aReportModel.getNoOfPackages());

										cityWiseToPayeeDLVDetails.put(aReportModel.getWayBillSourceBranchId(), cityWiseCollectionModel);
									}else{
										cityWiseCollectionModel.setTotalPaidAmount(cityWiseCollectionModel.getTotalPaidAmount() + 0);
										cityWiseCollectionModel.setTotalToPayAmount(cityWiseCollectionModel.getTotalToPayAmount() + aReportModel.getGrandTotal());
										cityWiseCollectionModel.setTotalCreditorAmount(cityWiseCollectionModel.getTotalCreditorAmount() + 0);
										cityWiseCollectionModel.setQuantity(cityWiseCollectionModel.getQuantity() + aReportModel.getNoOfPackages());
									}

								}
								//City Wise ToPayee Details code
							}else if(aReportModel.getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_CREDIT ){

								//City Wise ToPayee Details code
								cityWiseToPayeeDLVDetails = (HashMap<Long, Object>)storeCityWiseToDLVPayeeDetails.get(aReportModel.getWayBillSourceSubRegionId());

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
										cityWiseCollectionModel.setQuantity(aReportModel.getNoOfPackages());

										cityWiseToPayeeDLVDetails.put(aReportModel.getWayBillSourceBranchId() , cityWiseCollectionModel);
									}else{
										cityWiseCollectionModel.setTotalPaidAmount(cityWiseCollectionModel.getTotalPaidAmount() + 0);
										cityWiseCollectionModel.setTotalToPayAmount(cityWiseCollectionModel.getTotalToPayAmount() + 0);
										cityWiseCollectionModel.setTotalCreditorAmount(cityWiseCollectionModel.getTotalCreditorAmount() + aReportModel.getDeliveryAmount());
										cityWiseCollectionModel.setQuantity(cityWiseCollectionModel.getQuantity() + aReportModel.getNoOfPackages());
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
										cityWiseCollectionModel.setQuantity(aReportModel.getNoOfPackages());

										cityWiseToPayeeDLVDetails.put(aReportModel.getDestinationBranchId(), cityWiseCollectionModel);
									}else{
										cityWiseCollectionModel.setTotalPaidAmount(cityWiseCollectionModel.getTotalPaidAmount() + 0);
										cityWiseCollectionModel.setTotalToPayAmount(cityWiseCollectionModel.getTotalToPayAmount() + 0);
										cityWiseCollectionModel.setTotalCreditorAmount(cityWiseCollectionModel.getTotalCreditorAmount() + aReportModel.getGrandTotal());
										cityWiseCollectionModel.setQuantity(cityWiseCollectionModel.getQuantity() + aReportModel.getNoOfPackages());
									}
								}
								//City Wise ToPayee Details code
							}

						if(wbCategoryTypeDetailsForDlvrd == null){
							wbCategoryTypeDetailsForDlvrd = new WayBillCategoryTypeDetails();

							if(executive.getAccountGroupId()== ECargoConstantFile.ACCOUNT_GROUP_ID_KONDUSKAR_S_R_TRAVELS && wayBillType.getWayBillTypeId()==WayBillType.WAYBILL_TYPE_TO_PAY){
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
							final var	chargesCollection = new HashMap<Long,Double>();

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
							final HashMap<Long,Double>	chargesCollection = wbCategoryTypeDetailsForDlvrd.getChargesCollection();

							for (final WayBillCharges wayBillCharge : wayBillCharges)
								if(wayBillCharge.getChargeType() == ChargeTypeMaster.WAYBILL_CHARGETYPE_DELIVERY)
									if(chargesCollection.get(wayBillCharge.getWayBillChargeMasterId()) != null)
										chargesCollection.put(wayBillCharge.getWayBillChargeMasterId(), chargesCollection.get(wayBillCharge.getWayBillChargeMasterId()) + wayBillCharge.getChargeAmount());
									else
										chargesCollection.put(wayBillCharge.getWayBillChargeMasterId(), wayBillCharge.getChargeAmount());
						}
					}
				}

				if(wbCategoryTypeDetails != null && showPackingGroupTypeWiseAmount) {
					ArrayList<String>  headerKeyName;
					headerKeyName = new ArrayList<>();

					wbCategoryTypeDetails.keySet().stream().map(wbCategoryTypeDetails::get).forEach((final var data) -> {
						final HashMap<String, Double> innerDataKey = data.getPackingCollection();

						if(innerDataKey != null) {
							innerDataKey.keySet().forEach((final String key) -> {
								final var datakeyName	= key.split("_")[1];
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
					});

					request.setAttribute("headerKeyName", headerKeyName);
				}

				request.setAttribute("wayBillTypeDetails", wbCategoryTypeDetails);
				request.setAttribute("deliveredWayBillDetails", deliveredWayBillDetails);
				request.setAttribute("totalGrandAmount", Math.round(totalBookingGrandAmount + totalDeliverGrandAmount - totalCancellationGrandAmount - toPayCommissionToBeLess));
				request.setAttribute("totalBookingAmount", Math.round(totalBookingGrandAmount));
				request.setAttribute("totalDeliveryAmount", Math.round(totalDeliverGrandAmount));
				request.setAttribute("totalCancellationAmount", Math.round(totalCancellationGrandAmount));
				request.setAttribute("showPackingGroupTypeWiseAmount", showPackingGroupTypeWiseAmount);
				request.setAttribute("otherCharges", Math.round(otherCharges));
				request.setAttribute("showOtherChargeAmount", showOtherChargeAmount);
				request.setAttribute("grandTotalLevelRename", grandTotalLevelRename);

				if(doNotShow_Disc) request.setAttribute("doNotShow_Disc","false");
				if(doNotShowDelivery_Disc) request.setAttribute("doNotShowDelivery_Disc","false");
				if(doNotShow_Tax) request.setAttribute("doNotShow_Tax","false");
				if(doNotShow_Commission) request.setAttribute("doNotShow_Commission","false");

				//City Wise ToPayee Details code
				request.setAttribute("storeCityWiseToPayeeDetails", storeCityWiseToPayeeDetails);
				request.setAttribute("storeCityWiseToDLVPayeeDetails", storeCityWiseToDLVPayeeDetails);
				//City Wise ToPayee Details code

				if(configuration.getBoolean(DailyBranchCollectionReportConfigurationDTO.GET_CITY_WISE_RECEIVED_STOCK_DETAILS, false))
					request.setAttribute("storeCityWiseReceivedDetails", getCityWiseReceivedStockData(request ,fromDate, toDate, branchId, executive, configuration));

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

						bookingCharges  = cache.getBookingCharges(request, branchId);
						deliveryCharges = cache.getDeliveryCharges(request, branchId);

						if(bookingCharges == null)
							bookingCharges  = ChargeTypeMasterDao.getInstance().getChargeConfiguration(accountId, branch.getAgencyId(), branch.getBranchId(),ChargeTypeMaster.WAYBILL_CHARGETYPE_BOOKING);

						if(deliveryCharges == null)
							deliveryCharges = ChargeTypeMasterDao.getInstance().getChargeConfiguration(accountId, branch.getAgencyId(), branch.getBranchId(),ChargeTypeMaster.WAYBILL_CHARGETYPE_DELIVERY);
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
				request.setAttribute("FOC", focLR);
				request.setAttribute("toPayeeBooking", toPayeeBooking);
				request.setAttribute("BookingManual", bookingManual);
				request.setAttribute("toPayeeBookingManual", toPayeeBookingManual);
				request.setAttribute("creditorBookingManual", creditorBookingManual);
				request.setAttribute("FOCManual", focManual);
				request.setAttribute("DeliveredWayBill", deliveredWayBills);
				request.setAttribute("CancelledWayBills", cancelledWayBills);
				request.setAttribute("totalBkgFreightAmount",totalBkgFreightAmount);
				request.setAttribute("totalDlvryCmsnFreightAmount",totalDlvryCmsnFreightAmount);
				request.setAttribute("totalBkgLoadingAmount",totalBkgLoadingAmount);
				request.setAttribute("totalUnloadingAmount",totalUnloadingAmount);
				request.setAttribute("totalBkgAuto&DelUnlodinbg", Math.round(totalBookingGrandAmount + totalDeliverGrandAmount - (totalCancellationGrandAmount - toPayCommissionToBeLess))-(totalBkgAutoChargeAmount+totalUnloadingAmount+voucherDetailsAmnt));
				request.setAttribute("showTotalNoOfArticlesColumn", showTotalNoOfArticlesColumn);
				request.setAttribute("showBookedByColumn", showBookedByColumn);
				request.setAttribute("showRemarkCoulmn", showRemarkCoulmn);
				request.setAttribute("showConsignorMobNoColumn", showConsignorMobNoColumn);
				request.setAttribute("showConsigneeMobNoColumn", showConsigneeMobNoColumn);
				request.setAttribute(DailyBranchCollectionReportConfigurationDTO.REMOVE_SUB_REGION_NAME, configuration.getBoolean(DailyBranchCollectionReportConfigurationDTO.REMOVE_SUB_REGION_NAME,false));
				request.setAttribute("totalBookingDoorDelivery", totalBookingDoorDelivery);
				request.setAttribute("totalBookingUnloading", totalBookingUnloading);
				request.setAttribute("showBookingAndDeliveryCharges", showBookingAndDeliveryCharges);

				final var branchExpConfigValue = cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_BRANCH_EXPENSE);

				if(branchExpConfigValue == ConfigParam.CONFIG_KEY_BRANCH_EXPENSE_YES)
					request.setAttribute("BranchExpenseAmount",BranchExpenseDao.getInstance().getDailyBranchExpenseDetails(fromDate, toDate, branchId, executive.getAccountGroupId()));
			} else {
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}

			request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}
	}

	private HashMap<Long,HashMap<Long,CityWiseCollectionModel>> getCityWiseReceivedStockData(final HttpServletRequest request ,final Timestamp fromDate ,final Timestamp toDate ,final long destBranchId ,final Executive executive, final ValueObject configuration) throws Exception {
		HashMap<Long,CityWiseCollectionModel> 				cityWiseToPayeeDetails 			= null;
		CityWiseCollectionModel 							cityWiseCollectionModel 		= null;

		try {
			final var	cache = new CacheManip(request);

			final var	showCreditDetailsColumn			= configuration.getBoolean(DailyBranchCollectionReportConfigurationDTO.SHOW_CREDIT_DETAILS_COLUMN,false);

			if(executive.getExecutiveType() != Executive.EXECUTIVE_TYPE_GROUPADMIN)
				executive.getSubRegionId();

			final var	destBranches = destBranchId+"";

			final var	valueOutObject = ReceivedStockActionDAO.getInstance().getReceivedStockDataByBranchId((short)1  ,fromDate, toDate, executive.getAccountGroupId(),-1,null,destBranches);

			if(valueOutObject == null)
				return null;

			final var	wayBillIdArray 	= (Long[])valueOutObject.get("WayBillIdArray");
			final var	wayBillIdsStr	= Utility.GetLongArrayToString(wayBillIdArray);
			final var	pkgsColl		= ConsignmentSummaryDao.getInstance().getLimitedConsignmentDetails(wayBillIdsStr);//Get Packages Data for both Summary & Details
			final var	consignorColl 	= CustomerDetailsDao.getInstance().getConsignorDetailsByWayBillId(wayBillIdsStr);
			final var	consigneeColl 	= CustomerDetailsDao.getInstance().getConsigneeDetailsByWayBillId(wayBillIdsStr);

			final var	executiveIdsArr = (Long[])valueOutObject.get("ExecutiveIdsArr");
			final var	executiveIdsStr	= Utility.GetLongArrayToString(executiveIdsArr);
			final var	executiveColl	= ExecutiveDao.getInstance().getExecutiveDetailsByExecutiveIds(executiveIdsStr);

			final var	reportModel 	= (ReceivedStockReportModel[])valueOutObject.get("reportModelArr");

			final HashMap<Long,HashMap<Long,CityWiseCollectionModel>>	storeCityWiseReceivedDetails = new LinkedHashMap<>();

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
								cityWiseCollectionModel.setTotalPaidAmount(element.getGrandTotal());
							else
								cityWiseCollectionModel.setTotalCreditorAmount(element.getGrandTotal());

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
								cityWiseCollectionModel.setTotalPaidAmount(element.getGrandTotal() + element.getGrandTotal());
							else
								cityWiseCollectionModel.setTotalCreditorAmount(element.getGrandTotal() + element.getGrandTotal());
						}
					}
				} else if(element.getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_TO_PAY || element.getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_PAID){
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