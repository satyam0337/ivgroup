package com.ivcargo.reports.collection;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringUtils;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.dto.constant.BusinessFunctionConstants;
import com.iv.dto.constant.CargoAccountGroupConstant;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.utils.constant.Constant;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.reports.ReportView;
import com.ivcargo.reports.collection.initialize.InitializeDailyCollectionReportAction;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.ChargeTypeMasterDao;
import com.platform.dao.ConsignmentSummaryDao;
import com.platform.dao.DeliveryContactDetailsDao;
import com.platform.dao.ExecutiveDao;
import com.platform.dao.reports.DailyCollectionDAO;
import com.platform.dao.reports.WayBillDetailsDAO;
import com.platform.dto.Branch;
import com.platform.dto.ChargeTypeMaster;
import com.platform.dto.WayBillCharges;
import com.platform.dto.WayBillTaxTxn;
import com.platform.dto.WayBillType;
import com.platform.dto.configuration.report.collection.DailyCollectionReportConfigurationDTO;
import com.platform.dto.constant.ExecutiveTypeConstant;
import com.platform.dto.constant.PaymentTypeConstant;
import com.platform.dto.constant.WayBillStatusConstant;
import com.platform.dto.constant.WayBillTypeConstant;
import com.platform.dto.model.ChargeTypeModel;
import com.platform.dto.model.DailyCollectionReportModel;
import com.platform.dto.model.ReportViewModel;
import com.platform.dto.model.WayBillCategoryTypeDetails;
import com.platform.dto.model.WayBillExpenseModel;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

/**
 * @author Anant Chaudhary	03-02-2016
 * Transfer in new Package com.ivcargo.reports.collection
 *
 */

public class DailyCollectionSummaryReportAction implements Action {

	@Override
	@SuppressWarnings("unchecked")
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>						error 							= null;
		Branch										branch							= null;
		ChargeTypeModel[]							bookingCharges  				= null;
		ChargeTypeModel[]							deliveryCharges 				= null;
		WayBillExpenseModel[]						wayBillExpenseModel				= null;
		var 										selectedBranch  				= 0L;
		var 										selectedCity    				= 0L;
		var										deliveryCancellationTotal		= 0D;
		var										totalDeliveryBillCreditTotal	= 0D;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request, error))
				return;

			new InitializeDailyCollectionReportAction().execute(request, response);

			final var	sdf			= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			final var	fromDate	= new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00").getTime());
			final var	cache		= new CacheManip(request);
			final var	executive	= cache.getExecutive(request);

			if(!ActionStaticUtil.isAllowToAccessOperation(error, cache, request, BusinessFunctionConstants.DAILY_COLLECTION_BY_EXEC_REPORT)) {
				request.setAttribute(Constant.IS_ALLOW_TO_ACCESS_REPORT, false);
				return;
			}

			final var	toDate = new Timestamp(sdf.parse(JSPUtility.GetString(request, "toDate") + " 23:59:59").getTime());

			// Get the Selected  Combo values
			if(request.getParameter("TosubRegion") != null && !StringUtils.equalsIgnoreCase("null", request.getParameter("TosubRegion")))
				selectedCity  =  Long.parseLong(JSPUtility.GetString(request, "TosubRegion")) ;

			if(request.getParameter("SelectDestBranch") != null && !StringUtils.equalsIgnoreCase("null", request.getParameter("SelectDestBranch")))
				selectedBranch  =  Long.parseLong(JSPUtility.GetString(request, "SelectDestBranch")) ;
			else
				selectedBranch = executive.getBranchId();

			//Get all Branches
			request.setAttribute("destBranches", cache.getBranchesArrayBySubRegionId(request, executive.getAccountGroupId(), selectedCity));
			// Get All Executives
			request.setAttribute("execs", ExecutiveDao.getInstance().findByBranchId(selectedBranch));

			final var	configuration					= ReadAllConfigurationsBllImpl.getInstance().getOldReportConfigurationData(ReportIdentifierConstant.DAILY_COLLECTION_REPORT, executive.getAccountGroupId());

			final var	showCashCollectionInReport		= configuration.getBoolean(DailyCollectionReportConfigurationDTO.SHOW_CASH_COLLECTION_IN_REPORT,false);

			final var	deliveryCancellationList	= new ArrayList<DailyCollectionReportModel>();

			var executiveId = 0L;
			final var	objectIn  = new ValueObject();
			final var deliveryCancellation = new 	HashMap<Long, DailyCollectionReportModel>();

			if(request.getParameter("Executive") != null)
				executiveId = Long.parseLong(request.getParameter("Executive"));
			else
				executiveId = executive.getExecutiveId();

			objectIn.put("fromDate", fromDate);
			objectIn.put("toDate", toDate);
			objectIn.put("executiveId", executiveId);
			objectIn.put("executive", executive);
			objectIn.put("filter", 1);
			objectIn.put("filter1", 3);
			objectIn.put("accountGroupId", executive.getAccountGroupId());

			final var	objectOut = DailyCollectionDAO.getInstance().getReportForExecutive(objectIn);
			final var	executiveDB				= ExecutiveDao.getInstance().findByExecutiveId(executiveId);
			final var	cancelledWayBillTotal	= DeliveryContactDetailsDao.getInstance().getGrantotalOFCancelledLR(executiveDB.getBranchId(),executiveDB.getExecutiveId(), fromDate, toDate);
			final var	reportModel		= (DailyCollectionReportModel[])objectOut.get("DailyCollectionReportModel");
			final var	wayBillIdArray	= (Long[]) objectOut.get("WayBillIdArray");

			if(objectOut.get("WayBillExpenseModel") != null) {
				wayBillExpenseModel = (WayBillExpenseModel[]) objectOut.get("WayBillExpenseModel");
				request.setAttribute("WayBillExpenseModel", wayBillExpenseModel);
			}

			if(reportModel != null && wayBillIdArray != null){

				var doNotShowDisc = false; // if any disc found then column will be generated for disc in report
				var doNotShowTax = false;  // if any tax found then column will be generated for tax in report
				var doNotShowCommission = false; // if any commission found then column will be generated for commission in report

				var	reportViewModel = new ReportViewModel();
				reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);
				request.setAttribute("ReportViewModel",reportViewModel);

				final var	wbCategoryTypeDetails 				= new HashMap<String, WayBillCategoryTypeDetails>();
				final var	deliveredWayBillDetails 			= new HashMap<String, WayBillCategoryTypeDetails>();
				var totalBookingGrandAmount 		= 0D;
				var totalCancellationGrandAmount = 0D;
				var totalDeliverGrandAmount 		= 0D;
				var toPayCommissionToBeLess 		= 0D;
				var bookingChequeTotal			= 0.0;
				var deliveryChequeTotal			= 0.0;

				final var	wayBillIdsStr	= Utility.GetLongArrayToString(wayBillIdArray);
				final var	pkgsColl		= ConsignmentSummaryDao.getInstance().getLimitedConsignmentDetails(wayBillIdsStr);//Get Packages Data for both Summary & Details

				//Get WayBill Details code ( Start )
				final var	wayBillDetails = WayBillDetailsDAO.getInstance().getWayBillDetails(wayBillIdArray ,true ,ChargeTypeMaster.WAYBILL_CHARGETYPE_BOTH ,true ,WayBillTaxTxn.WAYBILL_TAX_TXN_TYPE_BOOKING ,false);
				//Get WayBill Details code ( End )

				for (final DailyCollectionReportModel aReportModel : reportModel) {
					aReportModel.setNoOfPackages(pkgsColl.get(aReportModel.getWayBillId()).getQuantity());

					//set flag for commission column generation
					if(aReportModel.getAgentCommission() > 0)
						doNotShowCommission = true;

					// Set WayBill Type Name
					final var	wayBillType = cache.getWayBillTypeById(request, aReportModel.getWayBillTypeId());

					if(aReportModel.isManual())
						aReportModel.setWayBillType(wayBillType.getWayBillType()+WayBillType.WAYBILL_TYPE_MANUAL);
					else aReportModel.setWayBillType(wayBillType.getWayBillType());

					//WayBill Charges (Booking & Delivery)
					final var	wayBillCharges = wayBillDetails.get(aReportModel.getWayBillId()).getWayBillCharges();
					final var	bookedWayBillCategoryTypeDetails = new HashMap<String, Double>();

					for (final WayBillCharges wayBillCharge : wayBillCharges) {
						if(aReportModel.getStatus() != WayBillStatusConstant.WAYBILL_STATUS_DELIVERED && wayBillCharge.getChargeType() == ChargeTypeMaster.WAYBILL_CHARGETYPE_BOOKING)
							bookedWayBillCategoryTypeDetails.put(Long.toString(wayBillCharge.getWayBillChargeMasterId()), wayBillCharge.getChargeAmount());

						if(aReportModel.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DELIVERED && wayBillCharge.getChargeType() == ChargeTypeMaster.WAYBILL_CHARGETYPE_DELIVERY)
							bookedWayBillCategoryTypeDetails.put(Long.toString(wayBillCharge.getWayBillChargeMasterId()), wayBillCharge.getChargeAmount());
					}

					aReportModel.setChargesCollection(bookedWayBillCategoryTypeDetails);
					//end

					//Calculate Total WayBill Tax
					final var	wayBillTax = wayBillDetails.get(aReportModel.getWayBillId()).getWayBillTaxTxn();
					var totalTax 				= 0.00;

					for (final WayBillTaxTxn element : wayBillTax)
						totalTax += element.getTaxAmount();

					totalTax = Math.round(totalTax);

					aReportModel.setTotalTax(totalTax);

					if(totalTax > 0)
						doNotShowTax = true;

					//Calculate Total Discount
					var totalDiscount 		= 0.00;

					if(aReportModel.isDiscountPercent())
						totalDiscount = Math.round(aReportModel.getAmount() * aReportModel.getDiscount() / 100);
					else
						totalDiscount = aReportModel.getDiscount();

					aReportModel.setDiscount(totalDiscount);

					if(totalDiscount > 0)
						doNotShowDisc = true;

					if(aReportModel.getStatus()==WayBillStatusConstant.WAYBILL_STATUS_BOOKED){
						if(aReportModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID){
							totalBookingGrandAmount += aReportModel.getGrandTotal();

							if(aReportModel.getPaymentTypeId() == PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID)
								bookingChequeTotal += aReportModel.getGrandTotal();
						}else if(aReportModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY)
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

							final var	chargesCollection = new HashMap<Long,Double>();

							for (final WayBillCharges wayBillCharge : wayBillCharges)
								if(wayBillCharge.getChargeType() == ChargeTypeMaster.WAYBILL_CHARGETYPE_BOOKING)
									chargesCollection.put(wayBillCharge.getWayBillChargeMasterId(), wayBillCharge.getChargeAmount());

							wayBillCategoryTypeDetails.setChargesCollection(chargesCollection);

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
								if(wayBillCharge.getChargeType() == ChargeTypeMaster.WAYBILL_CHARGETYPE_BOOKING)
									if(chargesCollection.get(wayBillCharge.getWayBillChargeMasterId()) != null)
										chargesCollection.put(wayBillCharge.getWayBillChargeMasterId(), chargesCollection.get(wayBillCharge.getWayBillChargeMasterId()) + wayBillCharge.getChargeAmount());
									else
										chargesCollection.put(wayBillCharge.getWayBillChargeMasterId(), wayBillCharge.getChargeAmount());
						}

					}else if(aReportModel.getStatus()==WayBillStatusConstant.WAYBILL_STATUS_CANCELLED && (aReportModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID||aReportModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY || aReportModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT)){

						if(aReportModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID){
							if(showCashCollectionInReport && aReportModel.getPaymentTypeId() == PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID){
								//DO Nothing No Need To Add Amount To Cancellation
							} else
								totalCancellationGrandAmount += Math.round(aReportModel.getGrandTotal()-aReportModel.getAmount());
						}else if(aReportModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY)
							totalCancellationGrandAmount += Math.round(-aReportModel.getAmount());

						var	wayBillCategoryTypeDetails = wbCategoryTypeDetails.get(aReportModel.getWayBillType());

						if(wayBillCategoryTypeDetails == null){
							if(showCashCollectionInReport && aReportModel.getPaymentTypeId() == PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID){
								//DO Nothing
							} else{
								wayBillCategoryTypeDetails = new WayBillCategoryTypeDetails();

								wayBillCategoryTypeDetails.setWayBillType(aReportModel.getWayBillType());
								wayBillCategoryTypeDetails.setQuantity(-aReportModel.getNoOfPackages());
								wayBillCategoryTypeDetails.setBookingDiscount(-totalDiscount);
								wayBillCategoryTypeDetails.setTotalTax(-totalTax);
								wayBillCategoryTypeDetails.setTotalAmount(- (aReportModel.getGrandTotal() - (aReportModel.getDeliveryAmount() - aReportModel.getDeliveryDiscount())));
								wayBillCategoryTypeDetails.setAgentCommission(- aReportModel.getAgentCommission());
								wayBillCategoryTypeDetails.setBookingCommission(- aReportModel.getBookingCommission());

								final var	chargesCollection = new HashMap<Long,Double>();

								for (final WayBillCharges wayBillCharge1 : wayBillCharges)
									if(wayBillCharge1.getChargeType() == ChargeTypeMaster.WAYBILL_CHARGETYPE_BOOKING)
										chargesCollection.put(wayBillCharge1.getWayBillChargeMasterId(),- wayBillCharge1.getChargeAmount());

								wayBillCategoryTypeDetails.setChargesCollection(chargesCollection);

								wbCategoryTypeDetails.put(aReportModel.getWayBillType(), wayBillCategoryTypeDetails);
							}

						} else if(showCashCollectionInReport && aReportModel.getPaymentTypeId() == PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID){
							//Do Nothing
						} else{
							wayBillCategoryTypeDetails.setQuantity(wayBillCategoryTypeDetails.getQuantity() - aReportModel.getNoOfPackages());
							wayBillCategoryTypeDetails.setBookingDiscount(wayBillCategoryTypeDetails.getBookingDiscount() - totalDiscount);
							wayBillCategoryTypeDetails.setTotalTax(wayBillCategoryTypeDetails.getTotalTax() - totalTax);
							wayBillCategoryTypeDetails.setTotalAmount(wayBillCategoryTypeDetails.getTotalAmount() - (aReportModel.getGrandTotal() - (aReportModel.getDeliveryAmount() - aReportModel.getDeliveryDiscount())));
							wayBillCategoryTypeDetails.setAgentCommission(wayBillCategoryTypeDetails.getAgentCommission() - aReportModel.getAgentCommission());
							wayBillCategoryTypeDetails.setBookingCommission(wayBillCategoryTypeDetails.getBookingCommission() - aReportModel.getBookingCommission());

							final HashMap<Long,Double>	chargesCollection = wayBillCategoryTypeDetails.getChargesCollection();

							for (final WayBillCharges wayBillCharge2 : wayBillCharges)
								if(wayBillCharge2.getChargeType() == ChargeTypeMaster.WAYBILL_CHARGETYPE_BOOKING)
									if(chargesCollection.get(wayBillCharge2.getWayBillChargeMasterId()) != null)
										chargesCollection.put(wayBillCharge2.getWayBillChargeMasterId(), chargesCollection.get(wayBillCharge2.getWayBillChargeMasterId()) - wayBillCharge2.getChargeAmount());
									else
										chargesCollection.put(wayBillCharge2.getWayBillChargeMasterId(),- wayBillCharge2.getChargeAmount());
						}

					}else if(aReportModel.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DELIVERED
							|| aReportModel.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DELIVERED_BEFORE_CANCEL
							&& showCashCollectionInReport) {

						if(aReportModel.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DELIVERED) {
							if(aReportModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY){
								totalDeliverGrandAmount += aReportModel.getGrandTotal();
								if(aReportModel.getDeliveryPaymentTypeId() == PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID)
									deliveryChequeTotal +=  aReportModel.getGrandTotal();
							}else if(aReportModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID || aReportModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT){
								totalDeliverGrandAmount += aReportModel.getDeliveryAmount()- aReportModel.getDeliveryDiscount();
								if(aReportModel.getDeliveryPaymentTypeId() == PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID)
									deliveryChequeTotal += aReportModel.getDeliveryAmount()- aReportModel.getDeliveryDiscount();
							}
						} else if(aReportModel.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DELIVERED_BEFORE_CANCEL
								&& showCashCollectionInReport)
							if(aReportModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY){
								aReportModel.setGrandTotal(aReportModel.getCancelledCrAmount());
								aReportModel.setDeliveryAmount(0);
								aReportModel.setDeliveryDiscount(0);
								totalDeliverGrandAmount += aReportModel.getGrandTotal();

								if(aReportModel.getDeliveryPaymentTypeId() == PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID)
									deliveryChequeTotal +=  aReportModel.getGrandTotal();
							}else if(aReportModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID || aReportModel.getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_CREDIT){
								totalDeliverGrandAmount += aReportModel.getCancelledCrAmount();
								aReportModel.setDeliveryAmount(aReportModel.getCancelledCrAmount());
								aReportModel.setDeliveryDiscount(0);

								if(aReportModel.getDeliveryPaymentTypeId() == PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID)
									deliveryChequeTotal += aReportModel.getCancelledCrAmount();
							}

						var totalFreight 		= 0.00;
						var totalAmount 			= aReportModel.getDeliveryAmount()-aReportModel.getDeliveryDiscount();

						if(aReportModel.getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_TO_PAY){
							totalFreight = aReportModel.getGrandTotal()-(aReportModel.getDeliveryAmount()-aReportModel.getDeliveryDiscount());
							totalAmount += totalFreight;
						}

						if(showCashCollectionInReport && aReportModel.getDeliveryPaymentTypeId() == PaymentTypeConstant.PAYMENT_TYPE_BILL_CREDIT_ID)
							totalDeliveryBillCreditTotal	+= aReportModel.getDeliveryAmount()-aReportModel.getDeliveryDiscount();

						var	wbCategoryTypeDetailsForDlvrd = deliveredWayBillDetails.get(aReportModel.getWayBillType());

						if(wbCategoryTypeDetailsForDlvrd == null){
							wbCategoryTypeDetailsForDlvrd = new WayBillCategoryTypeDetails();

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
					}else if(aReportModel.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CANCELLED_DELIVERY)
						if(!showCashCollectionInReport) {
							if(aReportModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID){
								if(cancelledWayBillTotal.get(aReportModel.getWayBillId())!=null && (cancelledWayBillTotal.get(aReportModel.getWayBillId()).getPaymentType()==PaymentTypeConstant.PAYMENT_TYPE_BILL_CREDIT_ID||cancelledWayBillTotal.get(aReportModel.getWayBillId()).getPaymentType()==PaymentTypeConstant.PAYMENT_TYPE_CREDIT_ID ))
									aReportModel.setAmount(0.0);
								else if(cancelledWayBillTotal.get(aReportModel.getWayBillId())!=null)
									aReportModel.setAmount(cancelledWayBillTotal.get(aReportModel.getWayBillId()).getDeliveryTotal());
							}else if(aReportModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY)
								if(cancelledWayBillTotal.get(aReportModel.getWayBillId())!=null && (cancelledWayBillTotal.get(aReportModel.getWayBillId()).getPaymentType()==PaymentTypeConstant.PAYMENT_TYPE_BILL_CREDIT_ID||cancelledWayBillTotal.get(aReportModel.getWayBillId()).getPaymentType()==PaymentTypeConstant.PAYMENT_TYPE_CREDIT_ID ))
									aReportModel.setAmount(0.0);
								else if(cancelledWayBillTotal.get(aReportModel.getWayBillId())!=null)
									aReportModel.setAmount(cancelledWayBillTotal.get(aReportModel.getWayBillId()).getGrandTotal());

							if(cancelledWayBillTotal.get(aReportModel.getWayBillId()) != null)
								aReportModel.setPaymentTypeId(cancelledWayBillTotal.get(aReportModel.getWayBillId()).getPaymentType());

							deliveryCancellation.put(aReportModel.getWayBillId(), aReportModel);
						} else {
							if(aReportModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID){
								if(aReportModel.getPaymentTypeId()==PaymentTypeConstant.PAYMENT_TYPE_BILL_CREDIT_ID||aReportModel.getPaymentTypeId()==PaymentTypeConstant.PAYMENT_TYPE_CREDIT_ID )
									aReportModel.setAmount(0.0);
								else
									aReportModel.setAmount(aReportModel.getCancelledCrAmount());
							}else if(aReportModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY)
								if(aReportModel.getPaymentTypeId()==PaymentTypeConstant.PAYMENT_TYPE_BILL_CREDIT_ID||aReportModel.getPaymentTypeId()==PaymentTypeConstant.PAYMENT_TYPE_CREDIT_ID )
									aReportModel.setAmount(0.0);
								else if(cancelledWayBillTotal.get(aReportModel.getWayBillId())!=null)
									aReportModel.setAmount(aReportModel.getCancelledCrAmount());

							if(showCashCollectionInReport)
								deliveryCancellationList.add(aReportModel);
							else
								deliveryCancellation.put(aReportModel.getWayBillId(), aReportModel);
						}
				}

				if(showCashCollectionInReport)
					for (final DailyCollectionReportModel element : deliveryCancellationList) {
						if(element.getPaymentTypeId() == PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID){
							//DO Nothing No Need To Add Amount To Cancellation
						} else
							totalCancellationGrandAmount += element.getAmount();
					}
				else {
					for(final long id : deliveryCancellation.keySet())
						if(deliveryCancellation.get(id) != null)
							deliveryCancellationTotal += deliveryCancellation.get(id).getAmount();

					deliveryCancellationList.addAll(deliveryCancellation.values());
				}

				request.setAttribute("wayBillTypeDetails", wbCategoryTypeDetails);
				request.setAttribute("deliveredWayBillDetails", deliveredWayBillDetails);
				request.setAttribute("bookingChequeTotal", bookingChequeTotal);
				request.setAttribute("deliveryChequeTotal", deliveryChequeTotal);
				request.setAttribute("totalGrandAmount", Math.round(totalBookingGrandAmount + totalDeliverGrandAmount - totalCancellationGrandAmount - toPayCommissionToBeLess-deliveryCancellationTotal)-totalDeliveryBillCreditTotal);

				if(executive.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNT_GORUP_ID_ROYAL_EXPRESS){
					doNotShowDisc = false;
					doNotShowTax = false;
					doNotShowCommission = false;
				}

				if(doNotShowDisc) request.setAttribute("doNotShow_Disc","false");
				if(doNotShowTax) request.setAttribute("doNotShow_Tax","false");
				if(doNotShowCommission) request.setAttribute("doNotShow_Commission","false");

				if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN || executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_REGIONADMIN) {
					branch = cache.getBranchById(request, executive.getAccountGroupId() , selectedBranch);

					if(branch.getMappingTypeId() == Branch.BRANCH_MAP_ID_OWN_BRANCH_AND_ASSIGNED) {
						bookingCharges 	= cache.getBookingCharges(request, executive.getBranchId());
						deliveryCharges = cache.getDeliveryCharges(request, executive.getBranchId());
					} else {
						var accountId = 0L;

						if(reportModel[0].getStatus() == WayBillStatusConstant.WAYBILL_STATUS_BOOKED || reportModel[0].getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CANCELLED)
							accountId = reportModel[0].getAccountGroupId();
						else
							accountId = reportModel[0].getBookedForAccountGroupId();

						bookingCharges  = cache.getBookingCharges(request, selectedBranch);
						deliveryCharges = cache.getDeliveryCharges(request, selectedBranch);

						if(bookingCharges == null)
							bookingCharges  = ChargeTypeMasterDao.getInstance().getChargeConfiguration(accountId, branch.getAgencyId(), branch.getBranchId(), ChargeTypeMaster.WAYBILL_CHARGETYPE_BOOKING);

						if(deliveryCharges == null)
							deliveryCharges = ChargeTypeMasterDao.getInstance().getChargeConfiguration(accountId, branch.getAgencyId(), branch.getBranchId(), ChargeTypeMaster.WAYBILL_CHARGETYPE_DELIVERY);
					}
				} else {
					bookingCharges 	= cache.getBookingCharges(request, executive.getBranchId());
					deliveryCharges = cache.getDeliveryCharges(request, executive.getBranchId());
				}

				request.setAttribute("BookingCharges",bookingCharges);
				request.setAttribute("DeliveryCharges",deliveryCharges);
			} else {
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}

			request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}

}