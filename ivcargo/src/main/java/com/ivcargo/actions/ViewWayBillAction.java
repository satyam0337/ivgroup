package com.ivcargo.actions;

//~--- non-JDK imports --------------------------------------------------------

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.StringJoiner;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringUtils;

import com.businesslogic.DamerageChargeBLL;
import com.businesslogic.DispatchBLL;
import com.businesslogic.LRSearchBLL;
import com.businesslogic.properties.GeneralConfiguration;
import com.businesslogic.utils.WayBillAccessibility;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.constant.properties.LrViewConfigurationPropertiesConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.logsapp.LogWriter;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.exception.ExceptionProcess;
import com.iv.utils.utility.CollectionUtility;
import com.iv.utils.utility.Utility;
import com.ivcargo.actionUtility.ActionErrors;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.actors.PhotoServiceActor;
import com.ivcargo.reports.ReportView;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.BranchTransferDao;
import com.platform.dao.ChargeConfigDao;
import com.platform.dao.CollectionPersonMasterDao;
import com.platform.dao.ConfigDiscountDao;
import com.platform.dao.CorporateAccountDao;
import com.platform.dao.DeliveryDiscountCargoDao;
import com.platform.dao.DeliveryRunSheetSummaryDao;
import com.platform.dao.DiscountDetailsDAO;
import com.platform.dao.DiscountMasterDAO;
import com.platform.dao.DispatchLedgerDao;
import com.platform.dao.DispatchSummaryDao;
import com.platform.dao.ExecutiveDao;
import com.platform.dao.LHPVDao;
import com.platform.dao.WayBillCrossingDao;
import com.platform.dao.WayBillDao;
import com.platform.dao.reports.BillSummaryDAO;
import com.platform.dao.reports.CrossingAgentBillClearanceDAO;
import com.platform.dto.Bill;
import com.platform.dto.BillSummary;
import com.platform.dto.Branch;
import com.platform.dto.ChargeTypeMaster;
import com.platform.dto.ConfigParam;
import com.platform.dto.CorporateAccount;
import com.platform.dto.CrossingAgentBillClearance;
import com.platform.dto.DefaultViewPageForCargo;
import com.platform.dto.DeliveryContactDetails;
import com.platform.dto.DeliveryDiscount;
import com.platform.dto.DeliveryRunSheetSummary;
import com.platform.dto.DiscountDetails;
import com.platform.dto.DispatchSummary;
import com.platform.dto.Executive;
import com.platform.dto.ExecutiveFeildPermissionDTO;
import com.platform.dto.LHPV;
import com.platform.dto.PackingTypeMaster;
import com.platform.dto.Region;
import com.platform.dto.UserErrors;
import com.platform.dto.WayBill;
import com.platform.dto.WayBillCancellation;
import com.platform.dto.WayBillCharges;
import com.platform.dto.WayBillCrossing;
import com.platform.dto.WayBillTaxTxn;
import com.platform.dto.WayBillType;
import com.platform.dto.configuration.modules.GenerateCashReceiptDTO;
import com.platform.dto.configuration.modules.GroupConfigurationPropertiesDTO;
import com.platform.dto.constant.BillClearanceStatusConstant;
import com.platform.dto.constant.BookingChargeConstant;
import com.platform.dto.constant.BookingTypeConstant;
import com.platform.dto.constant.CargoAccountGroupConstant;
import com.platform.dto.constant.DeliveryChargeConstant;
import com.platform.dto.constant.ExecutiveTypeConstant;
import com.platform.dto.constant.FeildPermissionsConstant;
import com.platform.dto.constant.FormTypeConstant;
import com.platform.dto.constant.InfoForDeliveryConstant;
import com.platform.dto.constant.PaymentTypeConstant;
import com.platform.dto.constant.WayBillStatusConstant;
import com.platform.dto.constant.WayBillTypeConstant;
import com.platform.dto.model.ConfigDiscount;
import com.platform.dto.model.CreditWayBillTxn;
import com.platform.dto.model.PackagesCollectionDetails;
import com.platform.dto.model.RecivablesDispatchLedger;
import com.platform.dto.model.ReportViewModel;
import com.platform.dto.model.WayBillModel;
import com.platform.dto.waybill.FormTypes;
import com.platform.resource.CargoErrorList;
import com.platform.utils.PropertiesUtility;

public class ViewWayBillAction implements Action {
	public static final String TRACE_ID = "ViewWayBillAction";

	@Override
	@SuppressWarnings({ "unchecked" })
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {

		HashMap<String,Object>	 			error 								= null;
		var 								wayBillId 							= 0L;
		HashMap<Long, BillSummary>			billColl 							= null;
		BillSummary							billObj	 							= null;
		DeliveryDiscount 					deliveryDiscount					= null;
		Branch 								branch 								= null;
		CreditWayBillTxn 					crdtWbTxn							= null;
		Short								waybillStatus						= 0;
		DeliveryRunSheetSummary 			drs									= null;
		ValueObject							generalConfiguration				= null;
		var								isPendingPaymentModule				= false;
		var								isAllowCRCancellationLocking		= false;
		var									crCancelltionAllowedAfterDays		= 0;
		var  							isPaymentReceivedForBookingLr		= false;
		var								isPaymentReceivedForDeliveryLr		= false;
		ValueObject							groupConfiguration					= null;
		var								isWSLRPrintNeeded					= false;
		var								allowBranchWiseCRPrint				= false;
		ValueObject							generateCrConfiguration				= null;
		ReportView							reportView							= null;
		ReportViewModel						reportViewModel 					= null;
		PhotoServiceActor					photoServiceActor					= null;
		ValueObject							bookingTimePhoto					= null;
		String 								photoImage							= null;
		Executive 							executive 							= null;
		var 							showUpdateTransportationModeLink 	= false;
		ValueObject							valueObject							= null;
		ArrayList<Long>						dispatchLedgerId 					= null;
		var 							allowEditConfigDiscountOfOwnBranch 	= false;
		var								isConfigDiscountAllow				= false;
		var								allowConfigDiscountOfOwnBranch		= false;
		ArrayList<DiscountDetails>			discountDetailsAL					= null;
		DiscountDetails						discountDetails						= null;
		ConfigDiscount						configDiscount						= null;
		ArrayList<String> 					discountTypes 						= null;
		var								receivedBefore21March				= false;
		var								discAmount							= 0.00;
		DiscountDetails						updateDiscount						= null;
		ValueObject							discObject							= null;
		var								autoCalculateDiscountOnDemurrage	= false;
		var								autoCalculateUnloadingCharge		= false;
		var								minBookingAmountForAutoCalculateUnloadingCharge = 0.00;
		var								isAutoCalculateUnloadingFlag		= false;
		var								unloading							= 0.00;
		var								sourceBranchIdForUnloading			= 0L;
		var								destinationBranchIdForUnloading		= 0L;
		final var 				defaultViewPageGroupList 			= DefaultViewPageForCargo.getCargoGroupList();
		var								doNotMultiplyQtyAndConsignmentAmount= false;
		var								branchWiseWSPrintAllow				= false;
		var								isBranchFoundForNewLRWSPrintFlow	= false;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			Timestamp wbBookingDateTime;
			wayBillId = JSPUtility.GetLong(request, "wayBillId", 0);

			if (wayBillId == 0 && request.getAttribute("wayBillId") != null)
				wayBillId = (Long) request.getAttribute("wayBillId");

			final var  cache    = new CacheManip(request);

			final var execFieldPermissions = cache.getExecutiveFieldPermission(request);

			executive = cache.getExecutive(request);
			request.setAttribute("BookingCharges",cache.getActiveBookingCharges(request, executive.getBranchId()));
			request.setAttribute("DeliveryCharges",cache.getActiveDeliveryCharges(request, executive.getBranchId()));
			/*
			 * Added by narsing to show ddm number & branch on view page
			 */
			drs = DeliveryRunSheetSummaryDao.getInstance().getDDMSettlementDataWayBillId(wayBillId);

			if(drs!=null){
				request.setAttribute("ddmNumber", drs.getDdmNumber());
				if(drs.getBranchId()==0)
					request.setAttribute("branchName","Branch info not present");
				else
					request.setAttribute("branchName",cache.getBranchById(request, executive.getAccountGroupId(), drs.getBranchId()).getName());
			}

			generateCrConfiguration			= cache.getGenerateCRConfiguration(request, executive.getAccountGroupId());
			groupConfiguration 				= cache.getGroupConfiguration(request, executive.getAccountGroupId());
			generalConfiguration			= cache.getGeneralConfiguration(request, executive.getAccountGroupId());
			isPendingPaymentModule			= generalConfiguration.getBoolean(GeneralConfiguration.IS_PENDING_PAYMENT_MODULE, false);
			isAllowCRCancellationLocking	= generateCrConfiguration.getBoolean(GenerateCashReceiptDTO.IS_ALLOW_CR_CANCELLATION_LOCKING, false);
			crCancelltionAllowedAfterDays	= generateCrConfiguration.getInt(GenerateCashReceiptDTO.CR_CANCELLTION_ALLOWED_AFTER_DAYS, 0);
			isWSLRPrintNeeded				= PropertiesUtility.isAllow(groupConfiguration.getString(GroupConfigurationPropertiesDTO.IS_WS_LR_PRINT_NEEDED,"false"));
			allowBranchWiseCRPrint			= generateCrConfiguration.getBoolean(GenerateCashReceiptDTO.ALLOW_BRANCH_WISE_CR_PRINT,false);
			final var	lrViewConfiguration				= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.LR_SEARCH);
			isConfigDiscountAllow			= (boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.IS_CONFIG_DISCOUNT_ALLOW,false);
			allowConfigDiscountOfOwnBranch 	= (boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.ALLOW_CONFIG_DISCOUNT_OF_OWN_BRANCH,false);
			autoCalculateDiscountOnDemurrage= (boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.AUTO_CALCULATE_DISCOUNT_ON_DEMURRAGE,false);
			autoCalculateUnloadingCharge	= (boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.AUTO_CALCULATE_UNLOADING_CHARGE,false);
			minBookingAmountForAutoCalculateUnloadingCharge = (double) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.MIN_BOOKING_AMOUNT_FOR_AUTO_CALCULATE_UNLOADING_CHARGE,0.00);
			sourceBranchIdForUnloading		= generateCrConfiguration.getLong(GenerateCashReceiptDTO.SOURCE_BRANCH_IDS_FOR_UNLOADING, 0);
			destinationBranchIdForUnloading = generateCrConfiguration.getLong(GenerateCashReceiptDTO.DESTINATION_BRANCH_IDS_FOR_UNLOADING, 0);

			if(allowBranchWiseCRPrint)
				request.setAttribute("isBranchFoundForNewPrint", CollectionUtility.getLongListFromString(generateCrConfiguration.getString(GenerateCashReceiptDTO.BRANCHID_FOR_NEWPRINT_FROM_OLD_FLOW)).contains(executive.getBranchId()));

			branchWiseWSPrintAllow				= groupConfiguration.getBoolean(GroupConfigurationPropertiesDTO.IS_BRANCH_WISE_WS_PRINT_ALLOW, false);

			if(branchWiseWSPrintAllow)
				isBranchFoundForNewLRWSPrintFlow 	= CollectionUtility.getLongListFromString(groupConfiguration.getString(GroupConfigurationPropertiesDTO.BRANCH_CODE_LIST_FOR_NEW_WS_LR_PRINT, "00000")).contains(executive.getBranchId());

			request.setAttribute("isBranchFoundForNewLRWSPrintFlow", isBranchFoundForNewLRWSPrintFlow);
			request.setAttribute("isWSLRPrintNeeded", isWSLRPrintNeeded);

			doNotMultiplyQtyAndConsignmentAmount= groupConfiguration.getBoolean(GroupConfigurationPropertiesDTO.DO_NOT_MULTIPLY_QTY_AND_CONSIGNMENT_AMOUNT, false);

			/*
			 * Narsing code finished
			 */
			if(request.getParameter("printType") != null)
				waybillStatus =	JSPUtility.GetShort(request, "printType",(short)0);

			if(isPendingPaymentModule) {
				isPaymentReceivedForBookingLr 	= WayBillDao.getInstance().getpaymentStatusPendingBookingWayBill(wayBillId);
				isPaymentReceivedForDeliveryLr	= WayBillDao.getInstance().getpaymentStatusPendingDeliveryWayBill(wayBillId);
			}

			request.setAttribute("isPaymentReceivedForDeliveryLr",isPaymentReceivedForDeliveryLr);
			request.setAttribute("isPaymentReceivedForBookingLr",isPaymentReceivedForBookingLr);

			final var	lrSearchBLL		= new LRSearchBLL();
			var 		outValObj    	= lrSearchBLL.findByWayBillId(wayBillId, executive.getAccountGroupId());

			if(outValObj == null)
				return;

			final var wayBillModel = (WayBillModel) outValObj.get("wayBillModel");

			request.setAttribute("wayBillModel", wayBillModel);

			if (wayBillModel.getWayBill().getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CANCELLED) {
				request.setAttribute("WayBillCancellationType",WayBillCancellation.getWayBillCancellationType(wayBillModel.getWayBillCancellation() == null ? (short)0 : wayBillModel.getWayBillCancellation().getCancellationType()));
				error.put("errorCode", CargoErrorList.WRONG_WAYBILL_ERROR);
				error.put("errorDescription", CargoErrorList.WRONG_WAYBILL_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
				request.setAttribute("nextPageToken", "failure");
			}

			if(wayBillModel.getCreditWBTxnColl() != null) {
				crdtWbTxn = wayBillModel.getCreditWBTxnColl().get(CreditWayBillTxn.TXN_TYPE_BOOKING_ID);
				if( crdtWbTxn!= null) {
					if(crdtWbTxn.getCollectionPersonId() > 0 )
						request.setAttribute("CollectionPersonBKG",CollectionPersonMasterDao.getInstance().getCollectionPersonDetailsById(crdtWbTxn.getCollectionPersonId()));
					branch = cache.getGenericBranchDetailCache(request,crdtWbTxn.getReceivedByBranchId());
					crdtWbTxn.setPaymentStatusName(Bill.getBillClearanceStatusName(crdtWbTxn.getPaymentStatus()));
					crdtWbTxn.setBranchName(branch != null ? branch.getName() : "");
				}

				crdtWbTxn = wayBillModel.getCreditWBTxnColl().get(CreditWayBillTxn.TXN_TYPE_DELIVERY_ID);

				if(crdtWbTxn != null) {
					branch = cache.getGenericBranchDetailCache(request,crdtWbTxn.getReceivedByBranchId());
					crdtWbTxn.setBranchName(branch != null ? branch.getName() : "");
					crdtWbTxn.setPaymentStatusName(Bill.getBillClearanceStatusName(crdtWbTxn.getPaymentStatus()));
					if(crdtWbTxn.getCollectionPersonId() > 0)
						request.setAttribute("CollectionPersonDLY",CollectionPersonMasterDao.getInstance().getCollectionPersonDetailsById(crdtWbTxn.getCollectionPersonId()));
				}
				request.setAttribute("CreditWayBillTxnForPaymentDetails", crdtWbTxn);
			}
			request.setAttribute("CreditWBTxnColl", wayBillModel.getCreditWBTxnColl());

			final var wayBill = wayBillModel.getWayBill();

			request.setAttribute("DeliveryDiscount",wayBill.getDeliveryDiscount());

			final var	consignee   			= wayBillModel.getConsigneeDetails();
			final var	consignor   			= wayBillModel.getConsignorDetails();
			final var	consignment 			= wayBillModel.getConsignmentDetails();
			final var	formTypesArr			= (FormTypes[]) outValObj.get("formTypesArr");
			final var	consignmentSummary 		= wayBillModel.getConsignmentSummary();
			final var	deliveryContactDetails 	= wayBillModel.getDeliveryContactDetails();
			final var	wayBillHistory 			= wayBillModel.getWayBillHistory();
			final var	branchTransfer 			= wayBillModel.getBranchTransfer();
			final var	wayBillCharges 			= wayBillModel.getWayBillCharges();
			final var	wayBillTaxTxn 			= wayBillModel.getWayBillTaxTxn();

			if(consignor.getBillingPartyId() > 0) {
				final var corporateColl = CorporateAccountDao.getInstance().getCorporateAccountDetails(Long.toString(consignor.getBillingPartyId()));
				if(corporateColl != null && corporateColl.get(consignor.getBillingPartyId()) != null) {
					consignor.setBillingPartyName(corporateColl.get(consignor.getBillingPartyId()).getName());
					consignor.setBillingPartyGstn(corporateColl.get(consignor.getBillingPartyId()).getGstn());
				} else {
					consignor.setBillingPartyName("--");
					consignor.setBillingPartyGstn("--");
				}
			}

			if(execFieldPermissions.get(FeildPermissionsConstant.ALLOW_BOOKING_TIME_PHOTO_SERVICE) != null){

				photoServiceActor 			= new PhotoServiceActor();
				bookingTimePhoto			= new ValueObject();

				bookingTimePhoto.put("moduleId", ModuleIdentifierConstant.BOOKING);
				bookingTimePhoto.put("waybillId", wayBill.getWayBillId());

				bookingTimePhoto 		= photoServiceActor.getPhotoDetail(bookingTimePhoto);
				photoImage				= (String) bookingTimePhoto.get("photoTransactionPhoto");

				if(photoImage != null)
					request.setAttribute("imageString", photoImage);

			}

			request.setAttribute("packageDetails", consignment);

			if(consignmentSummary.getFreightUptoBranchId() > 0) {
				branch = cache.getGenericBranchDetailCache(request, consignmentSummary.getFreightUptoBranchId());
				consignmentSummary.setFreightUptoBranchName(branch.getName());
			} else
				consignmentSummary.setFreightUptoBranchName("");

			if(consignmentSummary.getVehicleTypeId() != 0) {
				final var vehicleType = cache.getVehicleType(request, consignmentSummary.getAccountGroupId(), consignmentSummary.getVehicleTypeId());
				if(vehicleType != null)
					consignmentSummary.setVehicleTypeName(vehicleType.getName());
			}

			request.setAttribute("consignmentSummary", consignmentSummary);

			// DeliveryContactDetails code done Here

			if(deliveryContactDetails != null){
				request.setAttribute("deliveryContactDetails", deliveryContactDetails);

				if(deliveryContactDetails.getPaymentType() == PaymentTypeConstant.PAYMENT_TYPE_CROSSING_CREDIT_ID) {
					final var wayBillCrossing = WayBillCrossingDao.getInstance().getWayBillWiseAgentCrossingDetails(wayBillId);

					if(wayBillCrossing != null) {
						if(wayBillCrossing.getCrossingWayBillNo() == null)
							wayBillCrossing.setCrossingWayBillNo("NA");

						if(wayBillCrossing.getCrossingAgentName() == null)
							wayBillCrossing.setCrossingAgentName("NA");
					}

					request.setAttribute("WBWiseAgentCrossingDetails", wayBillCrossing);

					if(wayBillCrossing != null && wayBillCrossing.getCrossingAgentBillId() > 0) {
						final var billClearances = CrossingAgentBillClearanceDAO.getInstance().getCrossingAgentBillClearanceDetailsForView(Long.toString(wayBillCrossing.getCrossingAgentBillId()));

						if(billClearances != null)
							for (final CrossingAgentBillClearance element : billClearances)
								element.setBranchName(cache.getGenericBranchDetailCache(request, element.getBranchId()).getName());

						request.setAttribute("CrossingAgentBillClearanceDetails", billClearances);
					}
				}
			}
			//DeliveryDiscount code Start Here

			deliveryDiscount = new DeliveryDiscount();
			deliveryDiscount.setDeliveryDiscount(DeliveryDiscountCargoDao.getInstance().getDiscountAmt(wayBillId));

			request.setAttribute("discountAmt",deliveryDiscount);

			//DeliveryDiscount code end Here

			//DeliveryContactDetails code end Here
			//code for showLRIncomeExpenseLink
			var showLRIncomeExpenseLink = true;
			if(wayBill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT
					|| wayBill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY) {

				billColl = BillSummaryDAO.getInstance().getBillDetailsByLRId(""+wayBill.getWayBillId());
				billObj	 = billColl.get(wayBill.getWayBillId());

				if(billObj != null) {
					branch = cache.getGenericBranchDetailCache(request,billObj.getBillBranchId());
					billObj.setBillBranchName(branch.getName());

					if(billObj.getStatus() == BillClearanceStatusConstant.BILL_CLEARANCE_STATUS_CLEAR_PAYMENT_ID
							|| billObj.getStatus() == BillClearanceStatusConstant.BILL_CLEARANCE_STATUS_NEGOTIATED_ID
							||  billObj.getStatus() == BillClearanceStatusConstant.BILL_CLEARANCE_STATUS_PARTIAL_PAYMENT_ID)
						showLRIncomeExpenseLink = false;
				}
				request.setAttribute("BillObj", billObj);
			}
			request.setAttribute("showLRIncomeExpenseLink", showLRIncomeExpenseLink);
			//WayBillHistory code done Here

			wbBookingDateTime = wayBill.getBookingDateTime();

			if(wayBillHistory != null && waybillStatus == WayBillStatusConstant.WAYBILL_STATUS_BOOKED){
				wayBill.setCreationDateTimeStamp(wayBillHistory.getCreationDateTimeStamp());
				wayBill.setRemark(wayBillHistory.getRemark());
			}

			request.setAttribute("BookingDateTime", wbBookingDateTime);
			//WayBillHistory code end Here

			// BranchTransfer code done Here

			if(branchTransfer != null)
				request.setAttribute("branchTransfer", branchTransfer);

			final var wayBillChargesArrList = new HashMap<Long,WayBillCharges>();

			if(wayBillCharges != null)
				for (final WayBillCharges wayBillCharge : wayBillCharges) {
					final var chargeTypeMaster = cache.getChargeTypeMasterById(request,wayBillCharge.getWayBillChargeMasterId());
					wayBillCharge.setName(chargeTypeMaster.getChargeName());

					if(executive.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNT_GORUP_ID_KALPANA_CARGO
							|| executive.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNT_GORUP_ID_AMAR_TRAVELS){
						if(wayBillCharge.getWayBillChargeMasterId() == BookingChargeConstant.INSURANCE)
							request.setAttribute("Insurance", wayBillCharge.getChargeAmount());
						if(wayBillCharge.getWayBillChargeMasterId() == BookingChargeConstant.LOADING)
							request.setAttribute("Loading", wayBillCharge.getChargeAmount());
						if(wayBillCharge.getWayBillChargeMasterId() == DeliveryChargeConstant.UNLOADING)
							request.setAttribute("UnLoading", wayBillCharge.getChargeAmount());
						if(wayBillCharge.getWayBillChargeMasterId() == DeliveryChargeConstant.LOCAL_FREIGHT_DELIVERY)
							request.setAttribute("LocalFreight", wayBillCharge.getChargeAmount());
						if(wayBillCharge.getWayBillChargeMasterId() == BookingChargeConstant.BUILTY_CHARGE)
							request.setAttribute("BuiltyCharge", wayBillCharge.getChargeAmount());
						if(wayBillCharge.getWayBillChargeMasterId() == BookingChargeConstant.CONVENIENCE)
							request.setAttribute("Convenience", wayBillCharge.getChargeAmount());
					} else if(executive.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNTGORUPID_SHREE_HANNDAA_TRAVELS){
						if(wayBillCharge.getWayBillChargeMasterId() == BookingChargeConstant.FREIGHT)
							request.setAttribute("Freight", wayBillCharge.getChargeAmount());
						if(wayBillCharge.getWayBillChargeMasterId() == BookingChargeConstant.LOADING)
							request.setAttribute("Loading", wayBillCharge.getChargeAmount());
						if(wayBillCharge.getWayBillChargeMasterId() == DeliveryChargeConstant.UNLOADING)
							request.setAttribute("UnLoading", wayBillCharge.getChargeAmount());
						if(wayBillCharge.getWayBillChargeMasterId() == BookingChargeConstant.CONVENIENCE)
							request.setAttribute("Convenience", wayBillCharge.getChargeAmount());
					}
					wayBillChargesArrList.put(wayBillCharge.getWayBillChargeMasterId(), wayBillCharge);
				}

			request.setAttribute("wayBillCharges", wayBillChargesArrList);

			for (final WayBillTaxTxn element : wayBillTaxTxn) {
				final var taxMaster = cache.getTaxMasterById(request, element.getTaxMasterId());
				element.setTaxName(taxMaster.getTaxMasterName());
			}

			request.setAttribute("wayBillTaxTxn", wayBillTaxTxn);

			request.setAttribute("consignee", consignee);
			request.setAttribute("consignor", consignor);

			if (wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_RECEIVED && wayBill.getBranchId() != wayBill.getDestinationBranchId()){

				final var subRegionId = cache.getGenericBranchDetailCache(request, wayBill.getBranchId()).getSubRegionId();
				request.setAttribute("RoutingSubRegionName", cache.getGenericSubRegionById(request, subRegionId).getName());
				request.setAttribute("RoutingBranchName", cache.getGenericBranchDetailCache(request, wayBill.getBranchId()).getName());
			}

			// Charge Config Amount (start)
			var chargeConfigAmount = 0.00;
			if((wayBill.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNT_GORUP_ID_SOUTHERN
					|| wayBill.getBookedForAccountGroupId() == CargoAccountGroupConstant.ACCOUNT_GORUP_ID_SOUTHERN
					||wayBill.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNT_GROUP_ID_FALCON_CARGO
					||wayBill.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNTGORUPID_SRS_TRAVELS)
					&& (wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DISPATCHED
					|| wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_RECEIVED
					|| wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DUEDELIVERED
					|| wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DUEUNDELIVERED
					|| wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CREDIT_DELIVERED
					|| wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DELIVERED))
				chargeConfigAmount = ChargeConfigDao.getInstance().getChargeAmountForSingleWayBill(Long.toString(wayBillId));
			request.setAttribute("chargeConfigAmount", chargeConfigAmount);
			// Charge Config Amount (end)

			//Credit Delivery Configuration code Starts
			if(wayBill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY
					&& (wayBill.getStatus()==WayBillStatusConstant.WAYBILL_STATUS_RECEIVED
					|| wayBill.getStatus()==WayBillStatusConstant.WAYBILL_STATUS_DUEDELIVERED
					|| wayBill.getStatus()==WayBillStatusConstant.WAYBILL_STATUS_CANCELLED_DELIVERY
					|| wayBill.getStatus()==WayBillStatusConstant.WAYBILL_STATUS_DUEUNDELIVERED)){

				final var creditDelivery = cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_CREDIT_DELIVERY);
				request.setAttribute("creditDelivery", creditDelivery);
			}
			//Credit Delivery Configuration code End

			//Door Delivery Configuration code Starts
			if(wayBill.getStatus()==WayBillStatusConstant.WAYBILL_STATUS_RECEIVED
					|| wayBill.getStatus()==WayBillStatusConstant.WAYBILL_STATUS_DUEDELIVERED
					|| wayBill.getStatus()==WayBillStatusConstant.WAYBILL_STATUS_DUEUNDELIVERED
					|| wayBill.getStatus()==WayBillStatusConstant.WAYBILL_STATUS_CANCELLED_DELIVERY){

				request.setAttribute("isConfigDoorDelivery", false);
				if(wayBill.getCreationDateTimeStamp() != null && executive.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNT_GROUP_ID_ROYAL_STAR ){
					boolean demurageValidation;
					demurageValidation = com.iv.utils.Utility.isFunctionAllowed(wayBill.getCreationDateTimeStamp(), 15);
					request.setAttribute("demurageValidation", demurageValidation);
				}
			}
			//Door Delivery Configuration code End

			wayBill.setSourceSubRegionId(cache.getGenericBranchDetailCache(request, wayBill.getSourceBranchId()).getSubRegionId());
			wayBill.setDestinationSubRegionId(cache.getGenericBranchDetailCache(request, wayBill.getDestinationBranchId()).getSubRegionId());

			final var 	inwaybillDetails 	= new HashMap<Long, ValueObject>();
			var 		outwaybillDetails 	= new HashMap<Long, Double>();
			final var inputForDamerage = new ValueObject();
			inputForDamerage.put("wayBill", wayBill);
			inputForDamerage.put("consignment",consignment);
			inputForDamerage.put("wayBillCharges", wayBillCharges);
			inputForDamerage.put("executive", executive);
			inputForDamerage.put("ReceivedTime", wayBillModel.getReceivedDateTime());
			request.setAttribute("ReceivedDateTime", wayBillModel.getReceivedDateTime());
			inwaybillDetails.put(wayBillId, inputForDamerage);

			final var 	damerageChargeBLL 	= new DamerageChargeBLL();
			final Date	marchDate 			= DateTimeUtility.getCustomDate(2020, 03, 23);
			final var 	marchTime 			= new Timestamp(marchDate.getTime());

			if(autoCalculateDiscountOnDemurrage && wayBill.getCreationDateTimeStamp().before(marchTime))
				receivedBefore21March = true;

			discObject 			= new ValueObject();
			outwaybillDetails 	= damerageChargeBLL.calculateDemerageOnWaybillIds(inwaybillDetails,executive.getAccountGroupId(),receivedBefore21March , discObject);
			var damerage 	= 0D;
			if(outwaybillDetails.get(wayBillId)!= null)
				damerage = outwaybillDetails.get(wayBillId);
			request.setAttribute("damerage",damerage);


			//**********************************	Demurrage Calculations	END    **********************************/
			//Receive Single WayBill Calculation
			if(wayBill.getStatus()==WayBillStatusConstant.WAYBILL_STATUS_DISPATCHED){
				final var dispatchBLL = new DispatchBLL();
				var isAccountGroupSame = true;
				if(wayBill.getAccountGroupId() != wayBill.getBookedForAccountGroupId())
					isAccountGroupSame = false;
				final var branchColl	= cache.getGenericBranchesDetail(request);
				final var configValue = cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_RECEIVABLES_ACCESSIBILITY);
				outValObj = dispatchBLL.getDispacthLedgerByWBIdANDWBAccessibility(wayBill.getWayBillId(), executive,configValue, isAccountGroupSame, branchColl, lrViewConfiguration);

				if(outValObj != null){

					final var recivablesDispatchLedger = (RecivablesDispatchLedger)outValObj.get("recivablesDispatchLedger");
					final var flagToReceive = Boolean.parseBoolean(outValObj.get("flagToReceive").toString());

					final var wayBillModels    = DispatchSummaryDao.getInstance().getReceivablesWaybillByDispatchLedger(recivablesDispatchLedger.getDispatchLedgerId());

					var totalWayBillCount = 0L;

					if(wayBillModels != null)
						totalWayBillCount = wayBillModels.length;

					request.setAttribute("recivablesDispatchLedger", recivablesDispatchLedger);
					request.setAttribute("flagToReceive", flagToReceive);
					request.setAttribute("totalWayBillCount", totalWayBillCount);
				}

				//Condition for Cancel WayBill After Dispatch
				outValObj = DispatchSummaryDao.getInstance().getDispatchSummaryDetailsByWayBillIds(Long.toString(wayBill.getWayBillId()));
				if(outValObj != null){
					var flagForCanelWayBillAfterDispatch = false;
					if(((HashMap<Long, DispatchSummary>)outValObj.get("dispatchSummHM")).size() == 1 )
						flagForCanelWayBillAfterDispatch = true;
					request.setAttribute("flagForCanelWayBillAfterDispatch", flagForCanelWayBillAfterDispatch);
				}

			}

			if(wayBill.getStatus()!= WayBillStatusConstant.WAYBILL_STATUS_BOOKED &&  wayBill.getStatus()!= WayBillStatusConstant.WAYBILL_STATUS_CANCELLED ){
				final var recivablesDispatchLedger 	= DispatchLedgerDao.getInstance().getDispacthLedgerByWBId(wayBillId,(short) 2);

				if(recivablesDispatchLedger!=null && !StringUtils.isEmpty(recivablesDispatchLedger.getConsolidateEwaybillNumber()))
					request.setAttribute("consolidateEwaybillNo", recivablesDispatchLedger.getConsolidateEwaybillNumber());
			}
			//End of Receive Single WayBill Calculation

			//For Updating WayBill Destination, Calculation Started
			var showWayBillUpdateLink = false;
			if(executive.getAccountGroupId() == wayBill.getAccountGroupId()) {
				if(wayBill.getStatus()==WayBillStatusConstant.WAYBILL_STATUS_BOOKED && execFieldPermissions.get(FeildPermissionsConstant.EDIT_AFTER_BOOKING) != null
						|| wayBill.getStatus()==WayBillStatusConstant.WAYBILL_STATUS_RECEIVED && execFieldPermissions.get(FeildPermissionsConstant.EDIT_AFTER_RECEIVED) != null && wayBill.getAccountGroupId() == wayBill.getBookedForAccountGroupId()
						|| wayBill.getStatus()==WayBillStatusConstant.WAYBILL_STATUS_DISPATCHED && execFieldPermissions.get(FeildPermissionsConstant.EDIT_AFTER_DISPATCH) != null && wayBill.getAccountGroupId() == wayBill.getBookedForAccountGroupId()
						)
					showWayBillUpdateLink = true;
				if(wayBill.getStatus()==WayBillStatusConstant.WAYBILL_STATUS_BOOKED && executive.getExecutiveType() != ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN && executive.getBranchId() != wayBill.getSourceBranchId())
					showWayBillUpdateLink = false;
			}
			request.setAttribute("showWayBillUpdateLink", showWayBillUpdateLink);
			//For Updating WayBill Destination, Calculation End

			var showTBBCustUpdateLink = false;
			if(wayBill.getStatus() != WayBillStatusConstant.WAYBILL_STATUS_CANCELLED
					&& wayBill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT
					&& execFieldPermissions.get(FeildPermissionsConstant.EDIT_TBB_CUSTOMER) != null) {

				billColl = BillSummaryDAO.getInstance().getBillDetailsByLRId(Long.toString(wayBill.getWayBillId()));
				billObj	 = billColl.get(wayBill.getWayBillId());

				if(billObj == null)
					showTBBCustUpdateLink = true;
			}
			request.setAttribute("showTBBCustUpdateLink", showTBBCustUpdateLink);

			//For Updating WayBill Destination, Calculation Started
			var showWayBillUpdateDataLink = false;
			if(wayBill.getStatus()==WayBillStatusConstant.WAYBILL_STATUS_BOOKED && execFieldPermissions.get(FeildPermissionsConstant.UPDATE_WAYBILL_DATA) != null)
				showWayBillUpdateDataLink = true;
			if(wayBill.getStatus()==WayBillStatusConstant.WAYBILL_STATUS_BOOKED && executive.getExecutiveType() != ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN && executive.getBranchId() != wayBill.getSourceBranchId())
				showWayBillUpdateDataLink = false;
			request.setAttribute("showWayBillUpdateDataLink", showWayBillUpdateDataLink);
			//For Updating WayBill Destination, Calculation End

			//Branch Transfer WayBill Details
			if(wayBill.getStatus()==WayBillStatusConstant.WAYBILL_STATUS_RECEIVED
					|| wayBill.getStatus()==WayBillStatusConstant.WAYBILL_STATUS_DUEDELIVERED
					|| wayBill.getStatus()==WayBillStatusConstant.WAYBILL_STATUS_DUEUNDELIVERED
					|| wayBill.getStatus()==WayBillStatusConstant.WAYBILL_STATUS_CREDIT_DELIVERED){
				final var transferWB = BranchTransferDao.getInstance().getBranchTransferDetails(wayBill.getWayBillId());
				request.setAttribute("BTWB", transferWB);
			}
			//Branch Transfer WayBill Details

			//Delivery Discount
			var showDeliveryTimeDiscount = false;

			if(executive.getExecutiveType()== ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN
					&& execFieldPermissions.get(FeildPermissionsConstant.DELIVERY_TIME_DISCOUNT) != null
					&&( wayBill.getStatus()==WayBillStatusConstant.WAYBILL_STATUS_RECEIVED
					|| wayBill.getStatus()==WayBillStatusConstant.WAYBILL_STATUS_DUEUNDELIVERED
					|| wayBill.getStatus()==WayBillStatusConstant.WAYBILL_STATUS_CANCELLED_DELIVERY))
				showDeliveryTimeDiscount = true;

			request.setAttribute("showDeliveryTimeDiscount", showDeliveryTimeDiscount);

			final var accountGroup = cache.getAccountGroupById(request, executive.getAccountGroupId());
			request.setAttribute("accountGroup", accountGroup);

			branch = cache.getGenericBranchDetailCache(request,wayBill.getBranchId());
			request.setAttribute("branch", branch);

			request.setAttribute("executive", executive);

			final var bookedExecutive = ExecutiveDao.getInstance().findByExecutiveId(wayBill.getExecutiveId());
			request.setAttribute("bookedExecutive", bookedExecutive.getName());

			final var	srcBranch  = cache.getGenericBranchDetailCache(request, wayBill.getSourceBranchId());
			request.setAttribute("srcBranch", srcBranch);

			final var srcSubRegion = cache.getGenericSubRegionById(request, srcBranch.getSubRegionId());
			request.setAttribute("srcSubRegion", srcSubRegion);

			final var srcCity = cache.getCityById(request, srcBranch.getCityId());
			request.setAttribute("srcCity", srcCity);

			final var	destBranch  = cache.getGenericBranchDetailCache(request, wayBill.getDestinationBranchId());
			request.setAttribute("destBranch", destBranch);

			final var destSubRegion = cache.getGenericSubRegionById(request, destBranch.getSubRegionId());
			request.setAttribute("destSubRegion", destSubRegion);

			final var destCity = cache.getCityById(request, destBranch.getCityId());
			request.setAttribute("destCity", destCity);

			request.setAttribute("noOfArticle", Integer.toString(wayBillModel.getNoOfArticle()));
			request.setAttribute("noOfPackages", Long.toString(wayBillModel.getNoOfPackages()));

			final var articleTypeMaster = cache.getArticleTypeMasterById(request,consignment[0].getArticleTypeMasterId());

			if(articleTypeMaster != null)
				request.setAttribute("typeOfArticle", articleTypeMaster.getName());
			else
				request.setAttribute("typeOfArticle", "");

			final var wayBillType = cache.getWayBillTypeById(request, wayBill.getWayBillTypeId());

			if(wayBill.isManual())
				wayBill.setWayBillType(wayBillType.getWayBillType() + WayBillType.WAYBILL_TYPE_MANUAL_2);
			else
				wayBill.setWayBillType(wayBillType.getWayBillType());

			final var rateConfiguration = cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_RATE_CONFIGURATION);

			if(rateConfiguration == ConfigParam.CONFIG_KEY_VALUE_RATE_CONFIGURATION_MANUAL || rateConfiguration == ConfigParam.CONFIG_KEY_VALUE_RATE_CONFIGURATION_AUTO)
				request.setAttribute("isDisplayable", wayBillType.getWayBillTypeId() != WayBillTypeConstant.WAYBILL_TYPE_FOC);

			if(wayBill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT
					&& wayBillModel.getCorporateAccountSubType() == CorporateAccount.CORPORATEACCOUNT_SUB_TYPE_KG
					|| wayBillModel.getCorporateAccountSubType() == CorporateAccount.CORPORATEACCOUNT_SUB_TYPE_PACKAGE_TYPE)
				request.setAttribute("doNotShowAmountOnPrint", true);

			//************************* Done for Pending Delivery *************************//
			//Also Add group condition in WayBillModelDao.getWayBillModel()
			if(wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DELIVERED
					&& wayBill.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNT_GORUP_ID_KALPANA_CARGO && wayBillModel.getDeliveryPending() != null) {
				wayBill.setRemark(wayBillModel.getDeliveryPending().getRemark());
				request.setAttribute("DeliveryPending", wayBillModel.getDeliveryPending());
			}

			request.setAttribute("reprint", request.getSession().getAttribute("reprint") == null || (Boolean) request.getSession().getAttribute("reprint"));

			request.getSession().setAttribute("reprint", true);

			var              actualWeight  = 0D;
			var              chargedWeight = 0D;
			var              length        = 0D;
			var              breadth       = 0D;
			var              height        = 0D;
			var                packageId     = 0L;
			var                quantity      = 0L;
			final var pakgMaster    = new PackingTypeMaster[consignment.length];
			PackagesCollectionDetails 				packagesCollectionDetails 	= null;
			final var packagesCollection 			= new HashMap<Long,PackagesCollectionDetails>();

			for (var i = 0; i < consignment.length; i++) {
				packageId     = consignment[i].getPackingTypeMasterId();
				pakgMaster[i] = cache.getPackingTypeMasterById(request, packageId);
				actualWeight  += consignment[i].getActualWeight();
				chargedWeight += consignment[i].getChargeWeight();
				length        += consignment[i].getLength();
				breadth       += consignment[i].getBreadth();
				height        += consignment[i].getHeight();
				quantity	  += consignment[i].getQuantity();

				if(executive.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNT_GORUP_ID_KALPANA_CARGO
						|| executive.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNT_GORUP_ID_AMAR_TRAVELS){
					packagesCollectionDetails = packagesCollection.get(consignment[i].getPackingTypeMasterId());

					if(packagesCollectionDetails == null){
						packagesCollectionDetails = new PackagesCollectionDetails();

						packagesCollectionDetails.setPackagesTypeId(consignment[i].getPackingTypeMasterId());
						packagesCollectionDetails.setPackagesTypeName(consignment[i].getPackingTypeName());
						packagesCollectionDetails.setTotalQuantity(packagesCollectionDetails.getTotalQuantity() + consignment[i].getQuantity());
						packagesCollectionDetails.setTotalWeight(packagesCollectionDetails.getTotalWeight() + consignment[i].getActualWeight());

						if(doNotMultiplyQtyAndConsignmentAmount &&
								wbBookingDateTime != null && wbBookingDateTime.getTime() >= DateTimeUtility.getTimeStampFromDateTimeString("2022-03-30 00:00:00.0").getTime())
							packagesCollectionDetails.setTotalAmount(packagesCollectionDetails.getTotalAmount() + consignment[i].getAmount());
						else
							packagesCollectionDetails.setTotalAmount(consignment[i].getQuantity() * consignment[i].getAmount());

						packagesCollection.put(consignment[i].getPackingTypeMasterId(), packagesCollectionDetails);
					} else {
						packagesCollectionDetails.setPackagesTypeId(consignment[i].getPackingTypeMasterId());
						packagesCollectionDetails.setPackagesTypeName(consignment[i].getPackingTypeName());
						packagesCollectionDetails.setTotalQuantity(packagesCollectionDetails.getTotalQuantity() + consignment[i].getQuantity());
						packagesCollectionDetails.setTotalWeight(packagesCollectionDetails.getTotalWeight() + consignment[i].getActualWeight());

						if(doNotMultiplyQtyAndConsignmentAmount &&
								wbBookingDateTime != null && wbBookingDateTime.getTime() >= DateTimeUtility.getTimeStampFromDateTimeString("2022-03-30 00:00:00.0").getTime())
							packagesCollectionDetails.setTotalAmount(packagesCollectionDetails.getTotalAmount() + consignment[i].getAmount());
						else
							packagesCollectionDetails.setTotalAmount(packagesCollectionDetails.getTotalAmount() + consignment[i].getQuantity() * consignment[i].getAmount());

					}
				}
			}

			request.setAttribute("packagesCollection", packagesCollection);
			request.setAttribute("pakgMaster", pakgMaster);
			request.setAttribute("actualWeight",  actualWeight);
			request.setAttribute("chargedWeight", chargedWeight+actualWeight);
			request.setAttribute("cft", length + " X " + breadth + " X " + height);
			request.setAttribute("quantity", quantity);

			if (request.getParameter("rp") != null)
				request.setAttribute("rp", JSPUtility.GetInt(request, "rp", 1));

			// Setting delivery charges in case of it is in RECEVIED status.....
			if(wayBill.getStatus()==WayBillStatusConstant.WAYBILL_STATUS_RECEIVED
					|| wayBill.getStatus()==WayBillStatusConstant.WAYBILL_STATUS_DUEDELIVERED
					|| wayBill.getStatus()==WayBillStatusConstant.WAYBILL_STATUS_DUEUNDELIVERED
					|| wayBill.getStatus()==WayBillStatusConstant.WAYBILL_STATUS_CANCELLED_DELIVERY
					|| wayBill.getStatus()==WayBillStatusConstant.WAYBILL_STATUS_GODOWN_RECEIVED
					|| wayBill.getStatus()==WayBillStatusConstant.WAYBILL_STATUS_CREDIT_DELIVERED){
				final var deliveryCharges = cache.getActiveDeliveryCharges(request, executive.getBranchId());
				if(deliveryCharges != null)
					request.setAttribute("deliChar", deliveryCharges);
			}

			setBookingAndDeliveryCharges(request, cache, executive, wayBill, wayBillCharges);

			//For Form Number details
			getFormNumber(request, formTypesArr);

			/* condition for CR Cancellation */

			final var isFlagForCRCancellation		= checkFlagForCRCancellation(wayBillModel, executive, execFieldPermissions);
			/* condition for CR cancellation ends here */

			final var showWayBillTypeUpdateLink	= showWayBillTypeUpdateLink(request, cache, executive, wayBill);

			checkForOperationAllowedAfterCashStmt(request, cache, bookedExecutive, wayBill);

			final var currentTimestamp = DateTimeUtility.getCurrentTimeStamp();

			request.setAttribute("wayBill", wayBill);
			request.setAttribute("isFlagForCRCancellation", isFlagForCRCancellation);
			request.setAttribute("showWayBillTypeUpdateLink", showWayBillTypeUpdateLink);
			request.setAttribute("isAllowCRCancellationLocking", isAllowCRCancellationLocking);
			request.setAttribute("CRCancelltionAllowedAfterDays", crCancelltionAllowedAfterDays);
			request.setAttribute("diffInDays", DateTimeUtility.getDayDiffBetweenTwoDates(wayBill.getCreationDateTimeStamp(), currentTimestamp));
			request.setAttribute(LrViewConfigurationPropertiesConstant.LR_VIEW_CONFIGURATION_PROPERTY, lrViewConfiguration);
			request.setAttribute("sourceBranchIdForUnloading", sourceBranchIdForUnloading);
			request.setAttribute("destinationBranchIdForUnloading", destinationBranchIdForUnloading);

			checkAccessibilityForDelivery(request, cache, executive, wayBill);

			/*Setting for WayBill Update */
			if(request.getParameter("updateDestination") == null || Integer.parseInt(request.getParameter("updateDestination")) != 1){

				/*Setting nextPageToken according to booking or delivery flow per Account Group */
				String isDeliveryFlowFlag = null;

				if(wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DELIVERED
						|| wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DUEDELIVERED
						|| wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CREDIT_DELIVERED)
					isDeliveryFlowFlag = "true";
				if(waybillStatus == WayBillStatusConstant.WAYBILL_STATUS_BOOKED || isDeliveryFlowFlag == null)
					request.setAttribute("nextPageToken", "successBookingPrintWayBill_"+executive.getAccountGroupId());
				else if(executive.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNT_GROUP_ID_RAMAN_HOLDING){

					if(executive.getRegionId() == Region.REGION_ROYAL_CSPL)
						request.setAttribute("nextPageToken", "successDeliveryPrintWayBill_" + CargoAccountGroupConstant.ACCOUNT_GORUP_ID_ROYAL_EXPRESS);
					else
						request.setAttribute("nextPageToken", "successDeliveryPrintWayBill_" + CargoAccountGroupConstant.ACCOUNT_GROUP_ID_RAMAN_HOLDING);
				} else
					request.setAttribute("nextPageToken", "successDeliveryPrintWayBill_"+executive.getAccountGroupId());

			} else if(defaultViewPageGroupList.contains(executive.getAccountGroupId()))
				request.setAttribute("nextPageToken", "afterUpdateWayBill");
			else
				request.setAttribute("nextPageToken", "afterUpdateWayBill_"+executive.getAccountGroupId());

			if(executive.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNT_GORUP_ID_KALPANA_CARGO) {
				final var session = request.getSession();
				final var createdWayBillIds = (HashMap<String, String>)session.getAttribute("createdWayBillIds");
				if(createdWayBillIds != null)
					if(createdWayBillIds.get(Long.toString(wayBillId)) != null){
						createdWayBillIds.remove(Long.toString(wayBillId));
						request.removeAttribute("OpenPopUp");
						request.removeAttribute("doNotPrint");
						session.setAttribute("createdWayBillIds", createdWayBillIds);
					} else
						request.setAttribute("OpenPopUp","true" );
			}

			//EDIT Rate And Consignment Permission

			var 	showLRRateEditLink 	= false;
			if( wayBill.getStatus() != WayBillStatusConstant.WAYBILL_STATUS_DELIVERED && wayBill.getStatus() != WayBillStatusConstant.WAYBILL_STATUS_CANCELLED
					&& ( wayBill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY || wayBill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID )
					&& execFieldPermissions.get(FeildPermissionsConstant.EDIT_LR_RATE) != null)
				showLRRateEditLink = true;
			request.setAttribute("showLRRateEditLink",showLRRateEditLink);

			var showConsignmentEditLink = false;
			if( wayBill.getStatus() != WayBillStatusConstant.WAYBILL_STATUS_DELIVERED
					&& execFieldPermissions.get(FeildPermissionsConstant.EDIT_CONSIGNMENT) != null )
				showConsignmentEditLink = true;
			request.setAttribute("showConsignmentEditLink", showConsignmentEditLink);

			reportView		= new ReportView();
			reportViewModel = new ReportViewModel();

			reportViewModel = reportView.populateReportViewModel(request, reportViewModel);

			request.setAttribute("reportViewModel", reportViewModel);

			//EDIT Rate And Consignment Permission

			// Form type update

			var showWayBillFormTypeUpdateLink 	= wayBill.getStatus() != WayBillStatusConstant.WAYBILL_STATUS_CANCELLED
					&& wayBill.getStatus() != WayBillStatusConstant.WAYBILL_STATUS_DELIVERED
					&& (wayBill.getSourceBranchId() == executive.getBranchId() || wayBill.getDestinationBranchId() == executive.getBranchId() || executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN)
					&& (wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_BOOKED && execFieldPermissions.get(FeildPermissionsConstant.EDIT_LR_FORM_TYPE_AFTER_BOOKING) != null
					|| wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DISPATCHED && execFieldPermissions.get(FeildPermissionsConstant.EDIT_LR_FORM_TYPE_AFTER_DISPATCH) != null
					|| wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_RECEIVED && execFieldPermissions.get(FeildPermissionsConstant.EDIT_LR_FORM_TYPE_AFTER_RECEIVE) != null);

			if((boolean) lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.UPDATE_FORM_TYPE, false))
				showWayBillFormTypeUpdateLink 	= true;

			request.setAttribute("showWayBillFormTypeUpdateLink", showWayBillFormTypeUpdateLink);


			final var  	executiveTypeId 	= executive.getExecutiveType();
			final var   	sourceBranchId  	= wayBill.getSourceBranchId();
			branch 						= cache.getGenericBranchDetailCache(request, sourceBranchId);
			final var		sourceRegionId		= branch.getRegionId();
			final var		sourceSubRegionId	= branch.getSubRegionId();
			final var   	execBranchId		= executive.getBranchId();
			final var   	execRegionId		= executive.getRegionId();
			final var   	execSubRegionId		= executive.getSubRegionId();

			valueObject            = DispatchSummaryDao.getInstance().geDispacthLedgerIdfromWaybillId(wayBill.getWayBillId());
			dispatchLedgerId = (ArrayList<Long>) valueObject.get("dispatchLedgerId");

			if(execFieldPermissions.get(FeildPermissionsConstant.EDIT_TRANSPORTATION_MODE_AFTER_BOOKING) != null && wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_BOOKED
					|| execFieldPermissions.get(FeildPermissionsConstant.EDIT_TRANSPORTATION_MODE_AFTER_DISPATCH) != null && wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DISPATCHED && dispatchLedgerId.size() == 1
					)
				switch (executiveTypeId) {
				case ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN -> showUpdateTransportationModeLink = true;
				case ExecutiveTypeConstant.EXECUTIVE_TYPE_REGIONADMIN -> {
					if(execRegionId == sourceRegionId)
						showUpdateTransportationModeLink = true;
				}
				case ExecutiveTypeConstant.EXECUTIVE_TYPE_SUBREGIONADMIN -> {
					if(execSubRegionId == sourceSubRegionId)
						showUpdateTransportationModeLink = true;
				}
				default -> {
					if(sourceBranchId == execBranchId)
						showUpdateTransportationModeLink = true;
				}
				}
			else
				showUpdateTransportationModeLink    = false;
			request.setAttribute("showUpdateTransportationModeLink", showUpdateTransportationModeLink);


			final var 	formTypeStr	= new StringBuilder();
			final var	formTypeIds	= new StringBuilder();

			if(formTypesArr != null && formTypesArr.length > 0)
				for(var i = 0; i < formTypesArr.length; i++) {
					formTypeStr.append(formTypesArr[i].getFormTypesName());
					formTypeIds.append(formTypesArr[i].getFormTypesId());

					if(i != formTypesArr.length - 1) {
						formTypeStr.append(", ");
						formTypeIds.append(",");
					}
				}
			if(execFieldPermissions.get(FeildPermissionsConstant.ALLOW_CONFIG_DISCOUNT) != null
					&& (wayBill.getStatus() ==  WayBillStatusConstant.WAYBILL_STATUS_RECEIVED
					|| wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CANCELLED_DELIVERY
					|| wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DUEUNDELIVERED)
					&& wayBill.getWayBillTypeId() != WayBillTypeConstant.WAYBILL_TYPE_FOC)
				if(allowConfigDiscountOfOwnBranch) {
					allowEditConfigDiscountOfOwnBranch  	= true;

					if(isConfigDiscountAllow && allowEditConfigDiscountOfOwnBranch)
						allowEditConfigDiscountOfOwnBranch = true;
				} else if(isConfigDiscountAllow)
					allowEditConfigDiscountOfOwnBranch = true;

			if(isConfigDiscountAllow) {
				discountDetails 	= new DiscountDetails();
				discountDetailsAL 	= new ArrayList<>();

				discountTypes = DiscountMasterDAO.getInstance().getDiscountTypes();
				request.setAttribute("discountTypes", discountTypes);
				configDiscount		= ConfigDiscountDao.getInstance().getDiscountChargesByWayBillId(wayBill.getWayBillId());
				discountDetailsAL 	= DiscountDetailsDAO.getInstance().getDiscountByWaybillId(wayBill.getWayBillId());

				if(discountDetailsAL != null && !discountDetailsAL.isEmpty()){
					discountDetails.setAmount(discountDetailsAL.get(0).getAmount());
					discountDetails.setDiscountType(discountDetailsAL.get(0).getDiscountType());
				}

				if(receivedBefore21March && discObject != null && discObject.containsKey("discAmount")) {
					discAmount		= discObject.getDouble("discAmount",0.00);
					if(discAmount > 0) {
						updateDiscount 	= new DiscountDetails();

						updateDiscount.setWaybillId(wayBill.getWayBillId());
						updateDiscount.setExecutiveId(executive.getExecutiveId());
						updateDiscount.setBranchId(executive.getBranchId());
						updateDiscount.setDiscountDateTime(DateTimeUtility.getCurrentTimeStamp());
						updateDiscount.setAmount(discAmount);
						updateDiscount.setDiscountMasterId(DiscountDetails.DISCOUNT_TYPE_DEMMURAGE);
						updateDiscount.setRemark("AUTOMATED");

						if(configDiscount != null)
							ConfigDiscountDao.getInstance().updateInConfigDiscount(updateDiscount);
						else
							ConfigDiscountDao.getInstance().insertDiscountCharges(updateDiscount);
					}
					configDiscount		= ConfigDiscountDao.getInstance().getDiscountChargesByWayBillId(wayBill.getWayBillId());
				}
			}

			if(autoCalculateUnloadingCharge && Utility.isIdExistInLongList(lrViewConfiguration, LrViewConfigurationPropertiesConstant.BRANCHIDS_FOR_AUTO_CALCULATE_UNLOADING_CHARGE, executive.getBranchId())
					&& wayBill.getBookingTotal() > minBookingAmountForAutoCalculateUnloadingCharge
					&& wayBillChargesArrList != null && !wayBillChargesArrList.isEmpty() && wayBillChargesArrList.get((long)BookingChargeConstant.LOADING) != null) {
				unloading = wayBillChargesArrList.get((long)BookingChargeConstant.LOADING).getChargeAmount();

				isAutoCalculateUnloadingFlag = unloading > 0;
			}

			request.setAttribute("configDiscount", configDiscount);
			request.setAttribute("discountDetails", discountDetails);
			request.setAttribute("showConfigDiscountEffect", lrViewConfiguration.getOrDefault(LrViewConfigurationPropertiesConstant.SHOW_CONFIG_DISCOUNT_EFFECT, false));
			request.setAttribute("allowEditConfigDiscountOfOwnBranch", allowEditConfigDiscountOfOwnBranch);
			request.setAttribute("formTypeStr", formTypeStr);
			request.setAttribute("formTypeIds", formTypeIds);
			request.setAttribute("unloading", unloading);
			request.setAttribute("isAutoCalculateUnloadingFlag", isAutoCalculateUnloadingFlag);

		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}
	}

	private void checkForOperationAllowedAfterCashStmt(final HttpServletRequest request, final CacheManip cacheManip, final Executive executive, final WayBill wayBill) throws Exception {
		var									noOfDays				  		= 0;
		HashMap<Long, WayBill> 				bookingDetail 					= null;
		var								isOperationAllowedAfterCashStmt	= false;

		try {
			noOfDays 						= cacheManip.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_MAX_DAYS_OF_OPERATION_BEFORE_CASHSTATEMENT_ENTRY_ID);
			bookingDetail					= WayBillDao.getInstance().getWayBillDetailsByStatus(Long.toString(wayBill.getWayBillId()), WayBillStatusConstant.WAYBILL_STATUS_BOOKED);

			isOperationAllowedAfterCashStmt	= com.iv.utils.Utility.isFunctionAllowed(bookingDetail.get(wayBill.getWayBillId()).getCreationDateTimeStamp(), noOfDays);

			request.setAttribute("IsOperationAllowedAfterCashStmt", isOperationAllowedAfterCashStmt);
		} catch (final Exception e) {
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, ActionErrors.BRANCH_IDS_DESCRIPTION);
			throw e;
		} finally {
			bookingDetail 					= null;
		}
	}

	private boolean	checkFlagForCRCancellation(final WayBillModel wayBillModel, final Executive executive, final HashMap<Long, ExecutiveFeildPermissionDTO> execFieldPermissions) throws Exception {
		var 							isFlagForCRCancellation = false;
		var   								dispatchLedgerId		= 0L;
		var 								lhpvId					= 0L;
		HashMap<Short, CreditWayBillTxn>	creditWayBillHM			= null;
		CreditWayBillTxn				   	creditWBTxn				= null;
		LHPV    							lhpv					= null;
		WayBill								wayBill					= null;
		DeliveryContactDetails 				deliveryContactDetails 	= null;
		HashMap<Long, BillSummary>			billColl 				= null;
		BillSummary							billObj	 				= null;

		try {

			wayBill					= wayBillModel.getWayBill();
			deliveryContactDetails 	= wayBillModel.getDeliveryContactDetails();

			if((wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DELIVERED || wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CREDIT_DELIVERED)
					&& wayBill.getBranchId() == executive.getBranchId()
					&& execFieldPermissions.get(FeildPermissionsConstant.DELIVERY_CANCELLATION) != null
					&& !deliveryContactDetails.isMultiple())
			{

				creditWayBillHM = wayBillModel.getCreditWBTxnColl();

				if(creditWayBillHM != null)
					creditWBTxn = creditWayBillHM.get(CreditWayBillTxn.TXN_TYPE_DELIVERY_ID);

				if(creditWBTxn != null && (creditWBTxn.getPaymentStatus() == BillClearanceStatusConstant.BILL_CLEARANCE_STATUS_CLEAR_PAYMENT_ID
						|| creditWBTxn.getPaymentStatus() == BillClearanceStatusConstant.BILL_CLEARANCE_STATUS_NEGOTIATED_ID))
					isFlagForCRCancellation = false;
				else {
					dispatchLedgerId = DispatchSummaryDao.getInstance().getLastDispatchLedgerIdByWayBillId(wayBill.getWayBillId());

					if(dispatchLedgerId > 0) {
						lhpvId = LHPVDao.getInstance().getLHPVIdByDispatchLedgerId(dispatchLedgerId);

						if(lhpvId > 0) {
							lhpv = LHPVDao.getInstance().getLHPVDetails(lhpvId);

							if(lhpv != null && lhpv.getBlhpvId() > 0 && lhpv.getbLHPVNumber() != null )
								isFlagForCRCancellation = false;
							else
								isFlagForCRCancellation = true;
						} else
							isFlagForCRCancellation = true;
					} else
						isFlagForCRCancellation = true;

					// If Creditor invoice bill has been made then no Delivery Cancellation allowed
					billColl = BillSummaryDAO.getInstance().getBillDetailsByLRId(""+wayBill.getWayBillId());

					if(billColl != null) {
						billObj	 = billColl.get(wayBill.getWayBillId());

						isFlagForCRCancellation = billObj == null || billObj.getStatus() == BillClearanceStatusConstant.BILL_CLEARANCE_STATUS_CANCELLED_ID;
					}
				}
			}

			return isFlagForCRCancellation;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private boolean showWayBillTypeUpdateLink(final HttpServletRequest request, final CacheManip cache, final Executive executive, final WayBill wayBill) throws Exception {
		HashMap<Long, ExecutiveFeildPermissionDTO> 		execFieldPermissions 		= null;
		ArrayList<Long> 								deliveryLocationList	  	= null;
		Branch 											srcBranch 					= null;
		WayBillCrossing[]								waybillCrossArr				= null;
		BillSummary										billObj	 					= null;
		WayBillCrossing									wayBillCrossing				= null;
		var											showWayBillTypeUpdateLink	= false;
		HashMap<Long, BillSummary>						billColl 					= null;

		try {
			execFieldPermissions = cache.getExecutiveFieldPermission(request);

			deliveryLocationList 		= cache.getAssignedLocationsIdListByLocationIdId(request, executive.getBranchId(), executive.getAccountGroupId());

			if((wayBill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY || wayBill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT) &&
					wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_BOOKED && execFieldPermissions.get(FeildPermissionsConstant.EDIT_LR_TYPE_AFTER_BOOKING) != null
					|| wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DISPATCHED && execFieldPermissions.get(FeildPermissionsConstant.EDIT_LR_TYPE_AFTER_DISPATCH) != null
					|| wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_RECEIVED && execFieldPermissions.get(FeildPermissionsConstant.EDIT_LR_TYPE_AFTER_RECEIVED) != null
					|| wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CANCELLED_DELIVERY && execFieldPermissions.get(FeildPermissionsConstant.EDIT_LR_TYPE_AFTER_CR_CANCELLED) != null
					|| execFieldPermissions.get(FeildPermissionsConstant.EDIT_LR_TYPE_AT_DESTINATION) != null
					&& (wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_RECEIVED
					|| wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CANCELLED_DELIVERY
					|| wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DUEUNDELIVERED
							) && (deliveryLocationList.contains(wayBill.getDestinationBranchId())
									&& deliveryLocationList.contains(wayBill.getBranchId())
									|| executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN)
					) {
				srcBranch = cache.getGenericBranchDetailCache(request,wayBill.getSourceBranchId());

				wayBillCrossing			 = null;

				if(wayBill.getBookingCrossingAgentId() > 0)
					wayBillCrossing			= WayBillCrossingDao.getInstance().getWayBillCrossingAgentDataByWayBillId(wayBill.getWayBillId());

				if (wayBillCrossing != null)
					showWayBillTypeUpdateLink 	= false;
				else {
					waybillCrossArr	= null;
					waybillCrossArr	= WayBillCrossingDao.getInstance().getWayBillCrossingDetailsByWayBillIds(""+wayBill.getWayBillId());

					if(waybillCrossArr != null && waybillCrossArr.length > 0)
						showWayBillTypeUpdateLink = false;
					else {
						if(executive.getBranchId() == srcBranch.getBranchId()
								|| executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_SUBREGIONADMIN && executive.getSubRegionId() == srcBranch.getSubRegionId()
								|| executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_REGIONADMIN && executive.getRegionId() == srcBranch.getRegionId()
								|| executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN)
							showWayBillTypeUpdateLink = true;

						if(deliveryLocationList.contains(wayBill.getDestinationBranchId())
								&& deliveryLocationList.contains(wayBill.getBranchId())
								|| executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN)
							showWayBillTypeUpdateLink = true;

						if(wayBill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT) {
							billColl = BillSummaryDAO.getInstance().getBillDetailsByLRId(""+wayBill.getWayBillId());
							billObj	 = billColl.get(wayBill.getWayBillId());

							if(billObj != null)
								showWayBillTypeUpdateLink = false;
						}
						//For cancelled CR, only ToPay LR is allowed
						if(wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CANCELLED_DELIVERY
								&& wayBill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY)
							showWayBillTypeUpdateLink = true;
					}
				}
			}

			return showWayBillTypeUpdateLink;
		} catch (final Exception e) {
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, ActionErrors.BRANCH_IDS_DESCRIPTION);
			throw e;
		} finally {
			execFieldPermissions 		= null;
			deliveryLocationList	  	= null;
			srcBranch 					= null;
			waybillCrossArr				= null;
			billObj	 					= null;
			wayBillCrossing				= null;
			billColl 					= null;
		}
	}

	private void checkAccessibilityForDelivery(final HttpServletRequest request, final CacheManip cache, final Executive executive, final WayBill wayBillModel) throws Exception {
		ArrayList<Long> 				deliveryLocationList	= null;
		short							configValue 			= 0;
		var 						flag 					= true;
		DeliveryRunSheetSummary 		drs						= null;
		var								userErrorId 			= 0;
		var 							errorAssociatedToNumber = "";

		try {
			deliveryLocationList 		= cache.getAssignedLocationsIdListByLocationIdId(request, executive.getBranchId(), executive.getAccountGroupId());
			configValue 				= cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_DELIVERY_ACCESSIBILITY);
			final var	lrViewConfiguration			= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.LR_SEARCH);

			if(wayBillModel.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_RECEIVED
					|| wayBillModel.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CANCELLED_DELIVERY
					|| wayBillModel.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DUEDELIVERED
					|| wayBillModel.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DUEUNDELIVERED
					|| wayBillModel.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CREDIT_DELIVERED) {
				if(WayBillAccessibility.checkWayBillAccessibility(wayBillModel, executive, configValue, cache.getGenericBranchesDetail(request), deliveryLocationList, lrViewConfiguration))
					flag = false;

				drs = DeliveryRunSheetSummaryDao.getInstance().getDDMSettlementDataWayBillId(wayBillModel.getWayBillId());

				if(drs != null && drs.getPaymentType() == (short) 0) {
					flag 					= true;
					userErrorId 			= UserErrors.ERROR_ID_DELIVERY_NOT_TOBE_SHOWN_DUE_TO_PRESENT_IN_DDM;
					errorAssociatedToNumber = drs.getDdmNumber();
				}
			}

			//In case of DDDV allow delivery for source
			if(wayBillModel.getDeliveryTypeId() == InfoForDeliveryConstant.DIRECT_DELIVERY_DIRECT_VASULI_ID
					&& wayBillModel.getSourceBranchId() == executive.getBranchId())
				flag 	= false;

			//if TBB/Paid - FTL then allow delivery for source
			if( wayBillModel.getBookingTypeId() == BookingTypeConstant.BOOKING_TYPE_FTL_ID
					&& (wayBillModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT || wayBillModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID)
					&& wayBillModel.getSourceBranchId() == executive.getBranchId())
				flag 	= false;

			request.setAttribute("flag", flag);
			request.setAttribute("userErrorId", userErrorId);
			request.setAttribute("errorAssociatedToNumber", errorAssociatedToNumber);
		} catch (final Exception e) {
			e.printStackTrace();
			throw e;
		} finally {
			deliveryLocationList	= null;
			drs						= null;
		}
	}

	private void setBookingAndDeliveryCharges(final HttpServletRequest request, final CacheManip cache, final Executive executive, final WayBill wayBill, final WayBillCharges[] wayBillCharges) throws Exception {
		try {
			if(wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DELIVERED
					|| wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DUEDELIVERED
					|| wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DUEUNDELIVERED
					|| wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CREDIT_DELIVERED) {

				final var 	htbookingCount			= new HashMap<Long, WayBillCharges>();
				final var 	htdeliveryCount			= new HashMap<Long, WayBillCharges>();
				var 							deliveryCharge			= 0.00;
				var							receiptChargeAmount 	= 0.0;

				if(wayBillCharges != null)
					for (final WayBillCharges wayBillCharge : wayBillCharges) {

						final var chargeTypeMaster = cache.getChargeTypeMasterById(request, wayBillCharge.getWayBillChargeMasterId());
						wayBillCharge.setName(chargeTypeMaster.getChargeName());

						final var bookingWayBillCharges 	= new WayBillCharges();
						final var deliveryWayBillCharges	= new WayBillCharges();

						if(wayBillCharge.getChargeType() == ChargeTypeMaster.WAYBILL_CHARGETYPE_BOOKING) {

							bookingWayBillCharges.setAccountGroupId(wayBillCharge.getAccountGroupId());
							bookingWayBillCharges.setChargeAmount(wayBillCharge.getChargeAmount());
							bookingWayBillCharges.setChargeType(wayBillCharge.getChargeType());
							bookingWayBillCharges.setMarkForDelete(wayBillCharge.isMarkForDelete());
							bookingWayBillCharges.setName(wayBillCharge.getName());
							bookingWayBillCharges.setWayBillChargeMasterId(wayBillCharge.getWayBillChargeMasterId());
							bookingWayBillCharges.setWayBillChargesId(wayBillCharge.getWayBillChargesId());
							bookingWayBillCharges.setWayBillId(wayBillCharge.getWayBillId());

							htbookingCount.put(bookingWayBillCharges.getWayBillChargeMasterId() ,bookingWayBillCharges);

						} else if(wayBillCharge.getChargeType() == ChargeTypeMaster.WAYBILL_CHARGETYPE_DELIVERY) {

							deliveryWayBillCharges.setAccountGroupId(wayBillCharge.getAccountGroupId());
							deliveryWayBillCharges.setChargeAmount(wayBillCharge.getChargeAmount());
							deliveryWayBillCharges.setChargeType(wayBillCharge.getChargeType());
							deliveryWayBillCharges.setMarkForDelete(wayBillCharge.isMarkForDelete());
							deliveryWayBillCharges.setName(wayBillCharge.getName());
							deliveryWayBillCharges.setWayBillChargeMasterId(wayBillCharge.getWayBillChargeMasterId());
							deliveryWayBillCharges.setWayBillChargesId(wayBillCharge.getWayBillChargesId());
							deliveryWayBillCharges.setWayBillId(wayBillCharge.getWayBillId());

							deliveryCharge=deliveryCharge+wayBillCharge.getChargeAmount();

							htdeliveryCount.put(deliveryWayBillCharges.getWayBillChargeMasterId() ,deliveryWayBillCharges);

							/* 	Condition For Group Sharing
								 	SRS should not see Receipt Charges Of Southern
							 */
							if(executive.getAccountGroupId() == wayBill.getAccountGroupId() && wayBill.getAccountGroupId() != wayBill.getBookedForAccountGroupId() && wayBillCharge.getWayBillChargeMasterId() == ChargeTypeMaster.RECEIPT)
								receiptChargeAmount = wayBillCharge.getChargeAmount();
						}
					}

				wayBill.setGrandTotal(Math.round(wayBill.getGrandTotal()));

				wayBill.setDeliveryChargesSum(wayBill.getDeliveryChargesSum() - receiptChargeAmount);
				wayBill.setDeliveryTotal(wayBill.getDeliveryTotal() - receiptChargeAmount);
				wayBill.setGrandTotal(wayBill.getGrandTotal() - receiptChargeAmount);

				request.setAttribute("BookingWayBillCharges", htbookingCount);
				request.setAttribute("DeliveryWayBillCharges", htdeliveryCount);
			}
		} catch (final Exception e) {
			e.printStackTrace();
		}
	}

	private void getFormNumber(final HttpServletRequest request, final FormTypes[] formTypesArr) throws Exception {
		var	formNumberDetails		= new StringJoiner("");

		try {

			if(formTypesArr != null && formTypesArr.length > 0)
				for (final FormTypes element : formTypesArr)
					if(element.getFormNumber() != null) {
						final var formNumber		= Utility.checkedNullCondition(element.getFormNumber(), (short) 1);

						if(element.getFormTypesId() == FormTypeConstant.E_SUGAM_NO_ID)
							formNumberDetails.add("<b>E-Sugam Number : </b>" + formNumber);
						else if(element.getFormTypesId() == FormTypeConstant.WAYBILL_AND_CC_ID)
							formNumberDetails.add("<b>WayBill+CC Number : </b>" + formNumber);
						else if(element.getFormTypesId() == FormTypeConstant.E_WAYBILL_ID)
							formNumberDetails.add("<b>E-WayBill Number : </b>" + formNumber);
						else
							formNumberDetails.add("<b>WayBill Number : </b>" + formNumber);
					}

			request.setAttribute("formNumberDetails", formNumberDetails.toString());
		} catch (final Exception e) {
			e.printStackTrace();
			throw e;
		} finally {
			formNumberDetails		= null;
		}
	}
}