package com.ivcargo.actions;

//~--- non-JDK imports --------------------------------------------------------

import java.sql.Timestamp;
import java.util.HashMap;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.DamerageChargeBLL;
import com.businesslogic.GenerateCashReceiptBLL;
import com.businesslogic.LRSearchBLL;
import com.businesslogic.displaydata.DisplayDataConfigurationBll;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.constant.properties.crprint.CRPrintPropertiesConstant;
import com.iv.dto.constant.CargoAccountGroupConstant;
import com.iv.dto.constant.DeliveryChargeConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.reports.ReportView;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.CollectionPersonMasterDao;
import com.platform.dao.CorporateAccountDao;
import com.platform.dao.DeliveryDiscountCargoDao;
import com.platform.dao.ExecutiveDao;
import com.platform.dao.WayBillDao;
import com.platform.dto.Bill;
import com.platform.dto.ChargeTypeMaster;
import com.platform.dto.ConfigParam;
import com.platform.dto.ConsignmentDetails;
import com.platform.dto.CorporateAccount;
import com.platform.dto.DeliveryDiscount;
import com.platform.dto.GodownUnloadDetails;
import com.platform.dto.WayBillCharges;
import com.platform.dto.WayBillTaxTxn;
import com.platform.dto.constant.BookingChargeConstant;
import com.platform.dto.constant.WayBillStatusConstant;
import com.platform.dto.constant.WayBillTypeConstant;
import com.platform.dto.model.CreditWayBillTxn;
import com.platform.dto.model.ReportViewModel;
import com.platform.dto.model.WayBillModel;

public class GenerateCRPrintAction implements Action {
	public static final String TRACE_ID = "GenerateCRPrintAction";

	@Override
	@SuppressWarnings("unchecked")
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	 			error 							= null;
		DeliveryDiscount 					deliveryDiscount				= null;
		Short								waybillStatus					= 0;
		GodownUnloadDetails[]				gdUnldDtlsArr 					= null;
		var								isShowAmountZero				= false;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			Timestamp wbBookingDateTime = null;
			final var  	cache    		= new CacheManip(request);
			final var	executive 		= cache.getExecutive(request);
			final var	displayDataConfig			= cache.getDisplayDataConfiguration(request, executive.getAccountGroupId());
			final var	crprintConfigHM				= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.CR_PRINT);
			final var	showCityNameWithBranchInPrint	= (boolean) crprintConfigHM.getOrDefault(CRPrintPropertiesConstant.SHOW_CITY_NAME_WITH_BRANCH_IN_PRINT, false);
			final var	showZeroAmountInCr				= (boolean) crprintConfigHM.getOrDefault(CRPrintPropertiesConstant.SHOW_ZERO_AMOUNT_IN_CR, false);

			final var	valueObjectIn					= new ValueObject();
			request.setAttribute("showCityNameWithBranchInPrint", showCityNameWithBranchInPrint);

			var	wayBillId = JSPUtility.GetLong(request, "wayBillId", 0);

			if (wayBillId == 0 && request.getAttribute("wayBillId") != null)
				wayBillId = (Long) request.getAttribute("wayBillId");

			/**
			 * code for getting AccountGroupName Dynamically
			 */
			final var	reportView		= new ReportView();
			var	reportViewModel = new ReportViewModel();

			reportViewModel = reportView.populateReportViewModel(request, reportViewModel);

			request.setAttribute("reportViewModel", reportViewModel);
			request.setAttribute("BookingCharges",cache.getActiveBookingCharges(request, executive.getBranchId()));
			request.setAttribute("DeliveryCharges",cache.getActiveDeliveryCharges(request, executive.getBranchId()));

			if(request.getParameter("printType") != null)
				waybillStatus =	JSPUtility.GetShort(request, "printType",(short)0);

			final var	lrSearchBLL		= new LRSearchBLL();
			final var	outValObj	= lrSearchBLL.findByWayBillId(wayBillId, executive.getAccountGroupId());

			if(outValObj == null) {
				ActionStaticUtil.catchActionException(request, error, "LR Details not found for print !");
				return;
			}

			final var wayBillModel = (WayBillModel) outValObj.get("wayBillModel");

			if(wayBillModel.getCreditWBTxnColl() != null) {
				final var	crdtWbTxn = wayBillModel.getCreditWBTxnColl().get(CreditWayBillTxn.TXN_TYPE_DELIVERY_ID);

				if(crdtWbTxn != null) {
					final var	branch = cache.getGenericBranchDetailCache(request,crdtWbTxn.getReceivedByBranchId());
					crdtWbTxn.setBranchName(branch != null ? branch.getName() : "");
					crdtWbTxn.setPaymentStatusName(Bill.getBillClearanceStatusName(crdtWbTxn.getPaymentStatus()));

					if(crdtWbTxn.getCollectionPersonId() > 0)
						request.setAttribute("CollectionPersonDLY",CollectionPersonMasterDao.getInstance().getCollectionPersonDetailsById(crdtWbTxn.getCollectionPersonId()));
				}
			}

			final var 	wayBill 	= wayBillModel.getWayBill();
			final var	consignee   = wayBillModel.getConsigneeDetails();
			final var	consignor   = wayBillModel.getConsignorDetails();
			final var	consignment = wayBillModel.getConsignmentDetails();

			if(consignor.getBillingPartyId() > 0) {
				final var corporateColl = CorporateAccountDao.getInstance().getCorporateAccountDetails(Long.toString(consignor.getBillingPartyId()));

				if(corporateColl != null && corporateColl.get(consignor.getBillingPartyId()) != null)
					consignor.setBillingPartyName(corporateColl.get(consignor.getBillingPartyId()).getName());
				else
					consignor.setBillingPartyName("--");
			}

			request.setAttribute("packageDetails", consignment);
			request.setAttribute("saidToContains", Stream.of(consignment).filter(e -> e.getSaidToContain() != null).map(ConsignmentDetails::getSaidToContain).collect(Collectors.joining(", ")));

			final var consignmentSummary = wayBillModel.getConsignmentSummary();

			if(consignmentSummary.getFreightUptoBranchId() > 0) {
				final var	branch = cache.getGenericBranchDetailCache(request, consignmentSummary.getFreightUptoBranchId());
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
			final var deliveryContactDetails = wayBillModel.getDeliveryContactDetails();

			if(deliveryContactDetails != null){
				request.setAttribute("deliveryContactDetails", deliveryContactDetails);
				deliveryContactDetails.setCRByBranchAddress(cache.getGenericBranchDetailCache(request,deliveryContactDetails.getBranchId()).getAddress());
			}
			//DeliveryDiscount code Start Here

			deliveryDiscount = new DeliveryDiscount();
			deliveryDiscount.setDeliveryDiscount(DeliveryDiscountCargoDao.getInstance().getDiscountAmt(wayBillId));

			request.setAttribute("discountAmt",deliveryDiscount);

			//DeliveryDiscount code end Here

			//DeliveryContactDetails code end Here

			//WayBillHistory code done Here
			final var wayBillHistory = wayBillModel.getWayBillHistory();

			if(wayBillHistory != null){
				wbBookingDateTime = wayBillHistory.getCreationDateTimeStamp();
				if(waybillStatus == WayBillStatusConstant.WAYBILL_STATUS_BOOKED){
					wayBill.setCreationDateTimeStamp(wayBillHistory.getCreationDateTimeStamp());
					wayBill.setRemark(wayBillHistory.getRemark());
				}
			}else if(wayBill.getStatus() != WayBillStatusConstant.WAYBILL_STATUS_BOOKED) {
				final var wbAtBkdStatus = WayBillDao.getInstance().getWayBillDetailsByStatus(Long.toString(wayBill.getWayBillId()), WayBillStatusConstant.WAYBILL_STATUS_BOOKED);

				if(wbAtBkdStatus != null) {
					final var	wayBill2 = wbAtBkdStatus.get(wayBill.getWayBillId());

					if(wayBill2 != null)
						wbBookingDateTime = wayBill2.getCreationDateTimeStamp();
				}
			}

			request.setAttribute("BookingDateTime", wbBookingDateTime);
			//WayBillHistory code end Here

			final var wayBillChargesArrList = new HashMap<Long,WayBillCharges>();
			final var wayBillCharges = wayBillModel.getWayBillCharges();

			if(wayBillCharges != null)
				for (final WayBillCharges wayBillCharge : wayBillCharges) {
					final var chargeTypeMaster = cache.getChargeTypeMasterById(request,wayBillCharge.getWayBillChargeMasterId());
					wayBillCharge.setName(chargeTypeMaster.getDisplayName());

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
					} else if(executive.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNTGORUPID_SHREE_HANNDAA_TRAVELS){
						if(wayBillCharge.getWayBillChargeMasterId() == BookingChargeConstant.FREIGHT)
							request.setAttribute("Freight", wayBillCharge.getChargeAmount());
						if(wayBillCharge.getWayBillChargeMasterId() == BookingChargeConstant.LOADING)
							request.setAttribute("Loading", wayBillCharge.getChargeAmount());
						if(wayBillCharge.getWayBillChargeMasterId() == DeliveryChargeConstant.UNLOADING)
							request.setAttribute("UnLoading", wayBillCharge.getChargeAmount());
					}
					wayBillChargesArrList.put(wayBillCharge.getWayBillChargeMasterId(), wayBillCharge);
				}

			request.setAttribute("wayBillCharges", wayBillChargesArrList);
			request.setAttribute("wayBillChargesCol", wayBillChargesArrList);

			final var wayBillTaxTxn = wayBillModel.getWayBillTaxTxn();

			for (final WayBillTaxTxn element : wayBillTaxTxn) {
				final var taxMaster = cache.getTaxMasterById(request, element.getTaxMasterId());
				element.setTaxName(taxMaster.getTaxMasterName());
			}

			request.setAttribute("wayBillTaxTxn", wayBillTaxTxn);
			request.setAttribute("consignee", consignee);
			request.setAttribute("consignor", consignor);

			valueObjectIn.put("executive", executive);

			if(showZeroAmountInCr) {
				valueObjectIn.put("wayBillTypeId", wayBill.getWayBillTypeId());

				isShowAmountZero = DisplayDataConfigurationBll.isAllowToDisplayZeroAmount(displayDataConfig, valueObjectIn);
			}

			final var inwaybillDetails = new HashMap<Long, ValueObject>();
			var outwaybillDetails = new HashMap<Long, Double>();
			final var inputForDamerage = new ValueObject();
			inputForDamerage.put("wayBill", wayBill);
			inputForDamerage.put("consignment",consignment);
			inputForDamerage.put("wayBillCharges", wayBillCharges);
			inputForDamerage.put("executive", executive);
			inputForDamerage.put("ReceivedTime", wayBillModel.getReceivedDateTime());
			request.setAttribute("ReceivedDateTime", wayBillModel.getReceivedDateTime());
			inwaybillDetails.put(wayBillId, inputForDamerage);

			final var damerageChargeBLL = new DamerageChargeBLL();
			outwaybillDetails = damerageChargeBLL.calculateDemerageOnWaybillIds(inwaybillDetails,executive.getAccountGroupId(), false, null);
			var damerage = 0D;

			if(outwaybillDetails.get(wayBillId)!= null)
				damerage = outwaybillDetails.get(wayBillId);

			request.setAttribute("damerage",damerage);

			final var accountGroup = cache.getAccountGroupById(request, executive.getAccountGroupId());
			request.setAttribute("accountGroup", accountGroup);

			final var	branch = cache.getGenericBranchDetailCache(request,wayBill.getBranchId());
			request.setAttribute("branch", branch);

			request.setAttribute("executive", executive);

			final var bookedExecutive = ExecutiveDao.getInstance().findByExecutiveId(wayBill.getExecutiveId());
			request.setAttribute("bookedExecutive", bookedExecutive.getName());

			final var	srcBranch = cache.getGenericBranchDetailCache(request, wayBill.getSourceBranchId());
			srcBranch.setCityName(cache.getCityById(request, srcBranch.getCityId()).getName());
			request.setAttribute("srcBranch", srcBranch);

			final var srcSubRegion = cache.getGenericSubRegionById(request, srcBranch.getSubRegionId());
			request.setAttribute("srcSubRegion", srcSubRegion);

			final var	destBranch  = cache.getGenericBranchDetailCache(request, wayBill.getDestinationBranchId());
			request.setAttribute("destBranch", destBranch);

			final var destSubRegion = cache.getGenericSubRegionById(request, destBranch.getSubRegionId());
			request.setAttribute("destSubRegion", destSubRegion);

			request.setAttribute("noOfArticle", Integer.toString(wayBillModel.getNoOfArticle()));
			request.setAttribute("noOfPackages", Long.toString(wayBillModel.getNoOfPackages()));

			if(consignment[0] != null) {
				final var articleTypeMaster = cache.getArticleTypeMasterById(request,consignment[0].getArticleTypeMasterId());
				if(articleTypeMaster != null)
					request.setAttribute("typeOfArticle", articleTypeMaster.getName());
				else
					request.setAttribute("typeOfArticle", " ");
			} else
				request.setAttribute("typeOfArticle", " ");

			final var wayBillType = cache.getWayBillTypeById(request, wayBill.getWayBillTypeId());
			if(wayBill.isManual())
				wayBill.setWayBillType(wayBillType.getWayBillType() + WayBillTypeConstant.WAYBILL_TYPE_MANUAL);
			else
				wayBill.setWayBillType(wayBillType.getWayBillType());

			cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_RATE_CONFIGURATION);

			if(wayBill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT
					&& wayBillModel.getCorporateAccountSubType() == CorporateAccount.CORPORATEACCOUNT_SUB_TYPE_KG
					|| wayBillModel.getCorporateAccountSubType() == CorporateAccount.CORPORATEACCOUNT_SUB_TYPE_PACKAGE_TYPE)
				request.setAttribute("doNotShowAmountOnPrint", true);

			if (request.getSession().getAttribute("reprint") != null
					&& !((Boolean) request.getSession().getAttribute("reprint")))
				request.setAttribute("reprint", false);
			else
				request.setAttribute("reprint", true);

			request.getSession().setAttribute("reprint", true);

			if(wayBill.getStatus()==WayBillStatusConstant.WAYBILL_STATUS_DELIVERED
					|| wayBill.getStatus()==WayBillStatusConstant.WAYBILL_STATUS_DUEDELIVERED
					|| wayBill.getStatus()==WayBillStatusConstant.WAYBILL_STATUS_DUEUNDELIVERED
					|| wayBill.getStatus()==WayBillStatusConstant.WAYBILL_STATUS_CREDIT_DELIVERED){

				final var htbookingCount	= new HashMap<Long,WayBillCharges>();
				final var htdeliveryCount= new HashMap<Long,WayBillCharges>();
				var receiptChargeAmount 					= 0.0;

				if(wayBillCharges != null)
					for (final WayBillCharges wayBillCharge : wayBillCharges) {

						final var chargeTypeMaster = cache.getChargeTypeMasterById(request,wayBillCharge.getWayBillChargeMasterId());
						wayBillCharge.setName(chargeTypeMaster.getChargeName());

						final var bookingWayBillCharges = new WayBillCharges();
						final var deliveryWayBillCharges = new WayBillCharges();

						if(wayBillCharge.getChargeType()==ChargeTypeMaster.WAYBILL_CHARGETYPE_BOOKING){

							bookingWayBillCharges.setAccountGroupId(wayBillCharge.getAccountGroupId());
							bookingWayBillCharges.setChargeAmount(wayBillCharge.getChargeAmount());
							bookingWayBillCharges.setChargeType(wayBillCharge.getChargeType());
							bookingWayBillCharges.setMarkForDelete(wayBillCharge.isMarkForDelete());
							bookingWayBillCharges.setName(wayBillCharge.getName());
							bookingWayBillCharges.setWayBillChargeMasterId(wayBillCharge.getWayBillChargeMasterId());
							bookingWayBillCharges.setWayBillChargesId(wayBillCharge.getWayBillChargesId());
							bookingWayBillCharges.setWayBillId(wayBillCharge.getWayBillId());

							htbookingCount.put(bookingWayBillCharges.getWayBillChargeMasterId() ,bookingWayBillCharges);

						}else if(wayBillCharge.getChargeType()==ChargeTypeMaster.WAYBILL_CHARGETYPE_DELIVERY){

							deliveryWayBillCharges.setAccountGroupId(wayBillCharge.getAccountGroupId());
							deliveryWayBillCharges.setChargeAmount(wayBillCharge.getChargeAmount());
							deliveryWayBillCharges.setChargeType(wayBillCharge.getChargeType());
							deliveryWayBillCharges.setMarkForDelete(wayBillCharge.isMarkForDelete());
							deliveryWayBillCharges.setName(wayBillCharge.getName());
							deliveryWayBillCharges.setWayBillChargeMasterId(wayBillCharge.getWayBillChargeMasterId());
							deliveryWayBillCharges.setWayBillChargesId(wayBillCharge.getWayBillChargesId());
							deliveryWayBillCharges.setWayBillId(wayBillCharge.getWayBillId());

							wayBillCharge.getChargeAmount();

							if(isShowAmountZero)
								deliveryWayBillCharges.setChargeAmount(0);

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

				if(isShowAmountZero) {
					wayBill.setDeliveryTotal(0);
					wayBill.setDeliveryTimeServiceTax(0);
				}

				request.setAttribute("BookingWayBillCharges", htbookingCount);
				request.setAttribute("DeliveryWayBillCharges", htdeliveryCount);
			}

			//Get last Godown Details
			if(wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DELIVERED) {
				final var	generateCashReceiptBLL	= new GenerateCashReceiptBLL();

				gdUnldDtlsArr = generateCashReceiptBLL.getGoDownDetails(wayBill.getWayBillId());

				if(gdUnldDtlsArr != null)
					request.setAttribute("lastGoDownUnload", gdUnldDtlsArr[0]);
			}
			/* condition for CR Cancellation */

			request.setAttribute("wayBill", wayBill);
			request.setAttribute("LoggedInBranchDetails", cache.getGenericBranchDetailCache(request,executive.getBranchId()));

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

			request.setAttribute("nextPageToken", "success_" + executive.getAccountGroupId());

			//EDIT Rate And Consignment Permission
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}
}