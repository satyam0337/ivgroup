package com.ivcargo.actions.transport;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.ObjectUtils;
import org.apache.commons.lang3.StringUtils;

import com.businesslogic.BillClearanceBLL;
import com.businesslogic.CRTxnBLL;
import com.businesslogic.bankpayment.BankPaymentBLL;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.constant.properties.GeneralConfigurationPropertiesConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.DeliveryContactDetailsDao;
import com.platform.dao.WayBillDao;
import com.platform.dao.reports.CreditWayBillTxnClearanceSummaryDAO;
import com.platform.dto.BankPayment;
import com.platform.dto.Bill;
import com.platform.dto.BillClearance;
import com.platform.dto.CRTxn;
import com.platform.dto.CreditWayBillTxnClearance;
import com.platform.dto.DeliveryContactDetails;
import com.platform.dto.DiscountDetails;
import com.platform.dto.Executive;
import com.platform.dto.MultipleBillClearance;
import com.platform.dto.WayBill;
import com.platform.dto.WayBillInfo;
import com.platform.dto.constant.CreditPaymentTypeConstant;
import com.platform.dto.constant.PaymentTypeConstant;
import com.platform.dto.model.CreditWayBillTxn;
import com.platform.dto.model.CreditWayBillTxnCleranceSummary;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

public class CreditCollectionPaymentAction implements Action {
	Executive   				executive 			= null;
	Timestamp 					createDate 			= null;
	SimpleDateFormat 			sdf         		= null;

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	 	error 				= null;
		Bill[]						bills				= null;
		ValueObject					valueInObject		= null;
		String[]					checkedValues		= null;
		ArrayList<CreditWayBillTxn>	creditWBTxnList		= null;
		ArrayList<WayBill>			wayBillList			= null;
		WayBill[]					wayBillArr			= null;
		ArrayList<Long> 			wayBillIdList		= null;
		String						wayBillIds			= null;
		HashMap<Long, WayBill> 		lrColl	 			= null;
		CreditWayBillTxnClearance	creditWayBillTxnClearance	= null;
		ArrayList<CreditWayBillTxnClearance>  creditWayBillTxnClearanceList = null;
		CreditWayBillTxnClearance[] creditWayBillTxnClearanceArr = null;
		ArrayList<Long>				creditWayBillTxnIdList	= null;
		String						creditWayBillTxnIds		= null;
		HashMap<Long, CreditWayBillTxnCleranceSummary> 	creditSummColl 			 		= null;
		ArrayList<CreditWayBillTxnCleranceSummary> creditWayBillTxnClearanceSummaryList = null;
		HashMap<Long, DeliveryContactDetails> 			delConColl						= null;
		CRTxnBLL										crtxnBll						= null;
		var count = 0;
		StringBuilder				billStr				= null;
		String						billIds				= null;
		StringBuilder				creditWBStr			= null;
		String						creditWBIds			= null;
		ValueObject					outValueObj			= null;
		ArrayList<DiscountDetails>	discountDetailsAL	= null;
		ArrayList<Bill>             billList			 = null;
		ArrayList<WayBillInfo>		wayBillInfoList		= null;
		WayBillInfo[]				wayBillInfoArray	= null;
		HashMap<Long, Short>        txnTypeHM			= null;
		ArrayList<MultipleBillClearance> multipleBillCleranceList = null;
		MultipleBillClearance[]		multipleBillCleranceArray = null;
		ArrayList<Long>             deliveryTxnWayBillIdList		= null;
		CRTxn[]						crTxnArray						= null;
		DeliveryContactDetails[]	delConDetArray					= null;
		ArrayList<Long>									crIdList						= null;
		HashMap<Long, DeliveryContactDetails>			dcdHM							= null;
		HashMap<Long, BankPayment>                        bankPaymentHM                            = null;
		BankPayment											bankPayment				= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			multipleBillCleranceList = new ArrayList<>();
			billList				= new ArrayList<>();
			creditWayBillTxnClearanceList = new ArrayList<>();
			creditWayBillTxnIdList 	= new ArrayList<>();
			wayBillList		 		= new ArrayList<>();
			wayBillInfoList			= new ArrayList<>();
			wayBillIdList	 		= new ArrayList<>();
			executive 				= (Executive) request.getSession().getAttribute("executive");
			createDate 				= DateTimeUtility.getCurrentTimeStamp();
			valueInObject			= new ValueObject();
			sdf         			= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			checkedValues			= request.getParameterValues("checkForCollection");
			final var searchById		= JSPUtility.GetShort(request, "searchById", (short)0);
			billStr					= new StringBuilder();
			creditWBStr				= new StringBuilder();
			discountDetailsAL		= new ArrayList<>();
			txnTypeHM				= new HashMap<>();
			deliveryTxnWayBillIdList = new ArrayList<>();
			crIdList				= new ArrayList<>();
			dcdHM					= new HashMap<>();
			crtxnBll				= new CRTxnBLL();

			if(ObjectUtils.isEmpty(checkedValues)) {
				error.put("errorDescription", "Something went wrong, try again !");
				request.setAttribute("cargoError", error);
				request.setAttribute("nextPageToken", "failure");
				return;
			}

			final var	cacheManip	= new CacheManip(request);
			final var 	generalConfig					= cacheManip.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.GENERAL_CONFIGURATION);
			final var	bankPaymentOperationRequired	= (boolean) generalConfig.getOrDefault(GeneralConfigurationPropertiesConstant.BANK_PAYMENT_OPERATION_REQUIRED, false);

			var isPaidCredit 	= false;

			if(request.getParameterValues("paymentCheckBox") != null && bankPaymentOperationRequired) {
				final var            valObjIn    = new ValueObject();
				valObjIn.put("paymentValuesArr", request.getParameterValues("paymentCheckBox"));
				valObjIn.put(ModuleIdentifierConstant.MODULE_ID, ModuleIdentifierConstant.CREDIT_COLLECTION_PAYMENT);
				bankPaymentHM        = BankPaymentBLL.getInstance().createDtoForPayment(valObjIn, executive);
			}
			
			for (final String checkedValue : checkedValues) {
				final var	paymentFor = JSPUtility.GetShort(request, "paymentFor_" + checkedValue);

				if(paymentFor == PaymentTypeConstant.PAYMENT_TYPE_CREDIT_ID) {
					if(JSPUtility.GetDouble(request, "receiveAmt_" + checkedValue, 0.00) > 0) {
						if(searchById != CreditPaymentTypeConstant.MULTIPLE_CREDIT_WAYBILL_TXN_CLEAR || count == 0){
							creditWBTxnList  					 = new ArrayList<>();
							creditWayBillTxnClearance 			 = new CreditWayBillTxnClearance();
							creditWayBillTxnClearanceSummaryList = new ArrayList<>();
						}

						final var	creditWayBillTxn = new CreditWayBillTxn();
						creditWayBillTxn.setWayBillId(JSPUtility.GetLong(request, "billId_"+checkedValue, 0));
						creditWayBillTxn.setPaymentStatus(Short.parseShort(request.getParameter("paymentStatus_"+checkedValue)));
						creditWayBillTxn.setTxnTypeId(JSPUtility.GetShort(request, "txnType_"+checkedValue));
						creditWayBillTxn.setCreditWayBillTxnId(JSPUtility.GetLong(request, "creditWayBillTxnId_"+checkedValue, 0));
						creditWBTxnList.add(creditWayBillTxn);
						creditWayBillTxnIdList.add(creditWayBillTxn.getCreditWayBillTxnId());

						final var	creditWayBillTxnClearanceSummary = new CreditWayBillTxnCleranceSummary();
						creditWayBillTxnClearanceSummary.setAccountGroupId(executive.getAccountGroupId());
						creditWayBillTxnClearanceSummary.setWayBillId(JSPUtility.GetLong(request, "billId_"+checkedValue, 0));
						creditWayBillTxnClearanceSummary.setWayBillNumber(JSPUtility.GetString(request, "billNumber_"+checkedValue, ""));
						creditWayBillTxnClearanceSummary.setGrandTotal(JSPUtility.GetDouble(request, "grandTotal_"+checkedValue, 0.00));
						creditWayBillTxnClearanceSummary.setBranchId(JSPUtility.GetLong(request, "branchId_"+checkedValue,0));
						creditWayBillTxnClearanceSummary.setTxnTypeId(Short.parseShort(request.getParameter("txnType_"+checkedValue)));
						creditWayBillTxnClearanceSummary.setPaymentType(Short.parseShort(request.getParameter("paymentMode_"+checkedValue)));

						if(bankPaymentHM != null) {
							bankPayment		= bankPaymentHM.get(creditWayBillTxnClearanceSummary.getWayBillId());

							if(bankPayment == null)
								bankPayment		= bankPaymentHM.get((long) 0);
						}

						creditWayBillTxnClearanceSummary.setReceivedDateTime(createDate);
						creditWayBillTxnClearanceSummary.setReceivedAmount(JSPUtility.GetDouble(request, "receiveAmt_"+checkedValue, 0.00));
						creditWayBillTxnClearanceSummary.setReceivedByExecutiveId(executive.getExecutiveId());
						creditWayBillTxnClearanceSummary.setReceivedByBranchId(executive.getBranchId());
						creditWayBillTxnClearanceSummary.setRemark(StringUtils.equalsIgnoreCase("Remark", StringUtils.upperCase(JSPUtility.GetString(request, "remark_" + checkedValue, ""))) ? null :StringUtils.upperCase(JSPUtility.GetString(request, "remark_" + checkedValue, "")));
						creditWayBillTxnClearanceSummary.setCreditWayBillTxnId(creditWayBillTxn.getCreditWayBillTxnId());
						creditWayBillTxnClearanceSummary.setClearanceTypeId(searchById);
						creditWayBillTxnClearanceSummary.setBalanceAmount(JSPUtility.GetDouble(request, "balanceAmt_"+checkedValue, 0.00));

						if(bankPayment != null) {
							bankPayment.setChequeAmount(creditWayBillTxnClearanceSummary.getReceivedAmount());
							creditWayBillTxnClearanceSummary.setChequeDate(BankPaymentBLL.getChequeDateTime(bankPayment, createDate));
							creditWayBillTxnClearanceSummary.setBankName(bankPayment.getIssueBank());
							creditWayBillTxnClearanceSummary.setChequeNumber(BankPaymentBLL.getChequeNumber(bankPayment));
						} else if(creditWayBillTxnClearanceSummary.getPaymentType() == PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID) {
							creditWayBillTxnClearanceSummary.setChequeDate(new Timestamp(sdf.parse(JSPUtility.GetString(request, "chequeDate_"+checkedValue) + " 00:00:00").getTime()));
							creditWayBillTxnClearanceSummary.setChequeNumber(JSPUtility.GetString(request, "chequeNumber_"+checkedValue, ""));
							creditWayBillTxnClearanceSummary.setBankName(StringUtils.upperCase(JSPUtility.GetString(request, "bankName_" + checkedValue, "")));
						}

						if(creditWayBillTxnClearanceSummary.getBalanceAmount() <= 0)
							creditWayBillTxnClearanceSummary.setPaymentStatus(PaymentTypeConstant.PAYMENT_TYPE_STATUS_CLEAR_PAYMENT_ID);
						else
							creditWayBillTxnClearanceSummary.setPaymentStatus(creditWayBillTxn.getPaymentStatus());

						creditWayBillTxnClearanceSummaryList.add(creditWayBillTxnClearanceSummary);

						creditWayBillTxnClearance.setPartyMasterId(JSPUtility.GetLong(request, "partyMasterId_" + checkedValue, 0));
						creditWayBillTxnClearance.setPaymentMode(Short.parseShort(request.getParameter("paymentMode_" + checkedValue)));
						creditWayBillTxnClearance.setTotalReceivedAmount(creditWayBillTxnClearance.getTotalReceivedAmount() + creditWayBillTxnClearanceSummary.getReceivedAmount());
						creditWayBillTxnClearance.setGrandTotal(creditWayBillTxnClearance.getGrandTotal() + creditWayBillTxnClearanceSummary.getGrandTotal());
						creditWayBillTxnClearance.setAccountgroupId(creditWayBillTxnClearanceSummary.getAccountGroupId());
						creditWayBillTxnClearance.setBranchId(creditWayBillTxnClearanceSummary.getBranchId());
						creditWayBillTxnClearance.setReceivedByBranchId(creditWayBillTxnClearanceSummary.getReceivedByBranchId());
						creditWayBillTxnClearance.setReceivedByExecutiveId(creditWayBillTxnClearanceSummary.getReceivedByExecutiveId());
						creditWayBillTxnClearance.setCreationDateTimeStamp(creditWayBillTxnClearanceSummary.getReceivedDateTime());
						creditWayBillTxnClearance.setChequeDate(creditWayBillTxnClearanceSummary.getChequeDate());
						creditWayBillTxnClearance.setBankName(creditWayBillTxnClearanceSummary.getBankName());
						creditWayBillTxnClearance.setChequeNumber(creditWayBillTxnClearanceSummary.getChequeNumber());
						creditWayBillTxnClearance.setRemark(creditWayBillTxnClearanceSummary.getRemark());

						creditWayBillTxnClearance.setCreditWayBillTxnList(creditWBTxnList);
						creditWayBillTxnClearance.setCreditWayBillTxnCleranceSummaryList(creditWayBillTxnClearanceSummaryList);

						if(searchById != CreditPaymentTypeConstant.MULTIPLE_CREDIT_WAYBILL_TXN_CLEAR || count == 0)
							creditWayBillTxnClearanceList.add(creditWayBillTxnClearance);

						creditWBStr.append(creditWayBillTxn.getWayBillId());
						creditWBStr.append(",");

						isPaidCredit = true;
						count++;
					}
				} else if(JSPUtility.GetDouble(request, "receiveAmt_"+checkedValue, 0.00) > 0) {
					final var	billClearancesList   = new ArrayList<BillClearance>();
					final var	multipleBillClerance = new MultipleBillClearance();

					final var	billClearance = new BillClearance();
					billClearance.setCustomerType(Bill.CUSTOMER_TYPE_TBB_LR_ID);
					setBillClerance(request, billClearance,checkedValue);
					
					if(bankPaymentHM != null) {
						bankPayment		= bankPaymentHM.get(billClearance.getBillId());

						if(bankPayment == null)
							bankPayment		= bankPaymentHM.get((long) 0);
					}
					
					if(bankPayment != null) {
						bankPayment.setChequeAmount(billClearance.getTotalReceivedAmount());
						billClearance.setChequeDate(BankPaymentBLL.getChequeDateTime(bankPayment, createDate));
						billClearance.setBankName(bankPayment.getIssueBank());
						billClearance.setChequeNumber(BankPaymentBLL.getChequeNumber(bankPayment));
					} 
					
					billClearancesList.add(billClearance);
					billStr.append(billClearance.getBillId());
					billStr.append(",");
					
					multipleBillClerance.setBillCleranceList(billClearancesList);
					setMultipleBillClerance(request, multipleBillClerance, billClearance, checkedValue);

					multipleBillCleranceList.add(multipleBillClerance);

					final var	bill = new Bill();
					bill.setBillId(billClearance.getBillId());
					bill.setStatus(billClearance.getStatus());

					billList.add(bill);
				}
			}

			if(billList != null && !billList.isEmpty()) {
				bills = new Bill[billList.size()];
				billList.toArray(bills);
			}

			if(billStr != null && !billStr.isEmpty())
				billIds = billStr.substring(0, billStr.length() - 1);

			if(creditWBStr != null && !creditWBStr.isEmpty())
				creditWBIds = creditWBStr.substring(0, creditWBStr.length() - 1);

			creditWayBillTxnClearanceArr = new CreditWayBillTxnClearance[creditWayBillTxnClearanceList.size()];
			creditWayBillTxnClearanceList.toArray(creditWayBillTxnClearanceArr);

			if(creditWayBillTxnClearanceList != null && !creditWayBillTxnClearanceList.isEmpty()) {
				creditWayBillTxnIds = Utility.GetLongArrayListToString(creditWayBillTxnIdList);
				creditSummColl 		= CreditWayBillTxnClearanceSummaryDAO.getInstance().getCreditWayBillTxnSummaryByCreditWayBillTxnIds(creditWayBillTxnIds);

				for (final CreditWayBillTxnClearance aCreditWayBillTxnClearanceList : creditWayBillTxnClearanceList) {
					creditWayBillTxnClearanceSummaryList 	 = aCreditWayBillTxnClearanceList.getCreditWayBillTxnCleranceSummaryList();

					if(creditWayBillTxnClearanceSummaryList != null && !creditWayBillTxnClearanceSummaryList.isEmpty())
						for (final CreditWayBillTxnCleranceSummary aCreditWayBillTxnClearanceSummaryList : creditWayBillTxnClearanceSummaryList)
							if(aCreditWayBillTxnClearanceSummaryList.getPaymentStatus() == Bill.BILL_CLEARANCE_STATUS_NEGOTIATED_ID){
								var	prevReceivedAmt = 0.00;

								if(creditSummColl != null){
									final var	creditWayBillTxnCleranceSummaryMdl = creditSummColl.get(aCreditWayBillTxnClearanceSummaryList.getCreditWayBillTxnId());

									if(creditWayBillTxnCleranceSummaryMdl != null)
										prevReceivedAmt = creditWayBillTxnCleranceSummaryMdl.getReceivedAmount();
								}

								final var	wayBillInfo	= new WayBillInfo();
								wayBillInfo.setWayBillId(aCreditWayBillTxnClearanceSummaryList.getWayBillId());

								if(aCreditWayBillTxnClearanceSummaryList.getTxnTypeId() == CreditWayBillTxn.TXN_TYPE_BOOKING_ID)
									wayBillInfo.setBookingDiscount(aCreditWayBillTxnClearanceSummaryList.getGrandTotal() - (aCreditWayBillTxnClearanceSummaryList.getReceivedAmount() + prevReceivedAmt));
								else if(aCreditWayBillTxnClearanceSummaryList.getTxnTypeId() == CreditWayBillTxn.TXN_TYPE_DELIVERY_ID)
									wayBillInfo.setDeliveryDiscount(aCreditWayBillTxnClearanceSummaryList.getGrandTotal() - (aCreditWayBillTxnClearanceSummaryList.getReceivedAmount() + prevReceivedAmt));

								txnTypeHM.put(wayBillInfo.getWayBillId(), aCreditWayBillTxnClearanceSummaryList.getTxnTypeId());

								wayBillInfoList.add(wayBillInfo);
								wayBillIdList.add(wayBillInfo.getWayBillId());
								deliveryTxnWayBillIdList.add(wayBillInfo.getWayBillId());
							}
				}
			}

			if(wayBillInfoList != null && !wayBillInfoList.isEmpty()) {
				wayBillIds = Utility.GetLongArrayListToString(wayBillIdList);
				lrColl	   = WayBillDao.getInstance().getLimitedLRDetails(wayBillIds);

				if(deliveryTxnWayBillIdList != null && !deliveryTxnWayBillIdList.isEmpty())
					delConColl = DeliveryContactDetailsDao.getInstance().getDeliveryContactDetails(Utility.getStringFromArrayList(deliveryTxnWayBillIdList));

				wayBillInfoArray = new WayBillInfo[wayBillInfoList.size()];
				wayBillInfoList.toArray(wayBillInfoArray);

				for (final WayBillInfo element : wayBillInfoArray) {
					final var	discountDetails = new DiscountDetails();
					discountDetails.setWaybillId(element.getWayBillId());
					discountDetails.setDiscountMasterId(JSPUtility.GetInt(request, "discountTypes_" + element.getWayBillId()));
					discountDetails.setStatus(true);
					discountDetails.setAccountGroupId(executive.getAccountGroupId());
					discountDetails.setBranchId(executive.getBranchId());
					discountDetails.setDiscountDateTime(createDate);
					discountDetails.setExecutiveId(executive.getExecutiveId());

					if(txnTypeHM != null && txnTypeHM.size() > 0)
						if(txnTypeHM.get(element.getWayBillId()) != null && txnTypeHM.get(element.getWayBillId()) ==  CreditWayBillTxn.TXN_TYPE_BOOKING_ID){
							discountDetails.setDiscountType(DiscountDetails.DISCOUNT_TYPE_BOOKING);
							discountDetails.setAmount(element.getBookingDiscount());
						} else if(txnTypeHM.get(element.getWayBillId()) != null && txnTypeHM.get(element.getWayBillId()) ==  CreditWayBillTxn.TXN_TYPE_DELIVERY_ID){
							discountDetails.setDiscountType(DiscountDetails.DISCOUNT_TYPE_DELIVERY);
							discountDetails.setAmount(element.getDeliveryDiscount());
						}

					element.setBookingTotal(lrColl.get(element.getWayBillId()).getBookingTotal() - element.getBookingDiscount());
					element.setBookingDiscount(lrColl.get(element.getWayBillId()).getBookingDiscount() + element.getBookingDiscount());
					element.setDeliveryTotal(lrColl.get(element.getWayBillId()).getDeliveryTotal() - element.getDeliveryDiscount());
					element.setDeliveryDiscount(lrColl.get(element.getWayBillId()).getDeliveryDiscount() + element.getDeliveryDiscount());
					element.setGrandTotal(element.getBookingTotal() + element.getDeliveryTotal());
					element.setBookingChargesSum(lrColl.get(element.getWayBillId()).getBookingChargesSum());
					element.setBookingTimeServiceTax(lrColl.get(element.getWayBillId()).getBookingTimeServiceTax());
					element.setDeliveryChargesSum(lrColl.get(element.getWayBillId()).getDeliveryChargesSum());
					element.setDeliveryTimeServiceTax(lrColl.get(element.getWayBillId()).getDeliveryTimeServiceTax());

					if(discountDetails.getAmount() > 0  && JSPUtility.GetInt(request, "discountTypes_" + element.getWayBillId(), 0) > 0)
						discountDetailsAL.add(discountDetails);

					final var	wayBillObj	= new WayBill();
					wayBillObj.setWayBillId(element.getWayBillId());
					wayBillObj.setTxnTypeId(txnTypeHM.get(element.getWayBillId()));
					wayBillObj.setDiscount(element.getBookingDiscount());
					wayBillObj.setDeliveryDiscount(element.getDeliveryDiscount());
					wayBillObj.setGrandTotal(element.getGrandTotal());
					wayBillList.add(wayBillObj);

					if(delConColl != null && delConColl.size() > 0){
						final var	delConDet 	= delConColl.get(element.getWayBillId());

						if(delConDet != null){
							delConDet.setDeliverySumCharges(element.getDeliveryChargesSum());
							delConDet.setDeliveryTimeTax(element.getDeliveryTimeServiceTax());
							delConDet.setDeliveryDiscount(element.getDeliveryDiscount());
							delConDet.setDeliveryTotal(element.getDeliveryTotal());
							delConDet.setGrandTotal(element.getGrandTotal());

							crIdList.add(delConDet.getCrId());
							dcdHM.put(element.getWayBillId(),delConDet);
						}
					}
				}
			}

			if(wayBillList != null && !wayBillList.isEmpty()) {
				wayBillArr = new WayBill[wayBillList.size()];
				wayBillList.toArray(wayBillArr);
			}

			if(crIdList != null && !crIdList.isEmpty()) {
				final var	crTxnInObject = new ValueObject();
				crTxnInObject.put("crIdList", crIdList);
				crTxnInObject.put("dcdHM", dcdHM);
				crTxnInObject.put("wayBillHM", lrColl);

				final var	outValueObject = crtxnBll.calculateCRAmount(crTxnInObject);

				if(outValueObject != null)
					crTxnArray = (CRTxn[]) outValueObject.get("crTxnArray");
			}

			if(discountDetailsAL != null && !discountDetailsAL.isEmpty()) {
				final var	discountDetailsArr = new DiscountDetails[discountDetailsAL.size()];
				discountDetailsAL.toArray(discountDetailsArr);
				valueInObject.put("discountDetailsArr", discountDetailsArr);
			}

			multipleBillCleranceList.forEach(aMultipleBillCleranceList -> {
				final var	billClearancesList     = aMultipleBillCleranceList.getBillCleranceList();

				if(billClearancesList != null && !billClearancesList.isEmpty()) {
					final var	billClearances = new BillClearance[billClearancesList.size()];
					billClearancesList.toArray(billClearances);
					aMultipleBillCleranceList.setBillCleranceArray(billClearances);
				}
			});

			if(multipleBillCleranceList != null && !multipleBillCleranceList.isEmpty()) {
				multipleBillCleranceArray = new MultipleBillClearance[multipleBillCleranceList.size()];
				multipleBillCleranceList.toArray(multipleBillCleranceArray);
			}

			if(delConColl != null && delConColl.size() > 0)
				delConDetArray = delConColl.values().toArray(new DeliveryContactDetails[delConColl.size()]);

			valueInObject.put("Bill", bills);
			valueInObject.put("isPaidCredit", isPaidCredit);
			valueInObject.put("wayBillArr", wayBillArr);
			valueInObject.put("CreditWayBillTxnClearanceArr", creditWayBillTxnClearanceArr);
			valueInObject.put("billIds", billIds);
			valueInObject.put("creditWBIds", creditWBIds);
			valueInObject.put("multipleBillCleranceArray", multipleBillCleranceArray);
			valueInObject.put("wayBillInfoArray", wayBillInfoArray);
			valueInObject.put("crTxnArray", crTxnArray);
			valueInObject.put("delConDetArray", delConDetArray);
			valueInObject.put("executive", executive);
			valueInObject.put(BankPayment.BANK_PAYMENT, bankPaymentHM);

			outValueObj 	 = BillClearanceBLL.getInstance().billClearanceProcessForCollectionPerson(valueInObject);

			if ("success".equals(outValueObj.get("status").toString()))
				response.sendRedirect("BillAfterCreation.do?pageId=215&eventId=4&successMsgAfterBillClear=1");
			else {
				if ("error".equals(outValueObj.get("status").toString())) {
					error.put("errorCode", CargoErrorList.BILL_CLEARANCE_ERROR);
					error.put("errorDescription", CargoErrorList.BILL_CLEARANCE_ERROR_DESCRIPTION);
				} else if ("isLRFoundForCreditPayment".equals(outValueObj.get("status").toString())) {
					error.put("errorCode", CargoErrorList.SHORT_CREDIT_LR_NOT_FOUND_FOR_PAYMENT_ERROR);
					error.put("errorDescription", CargoErrorList.SHORT_CREDIT_LR_NOT_FOUND_FOR_PAYMENT_ERROR_DESCRIPTION);
				} else {
					error.put("errorCode", CargoErrorList.BILL_CLEARANCE_PAYMENT_DONE_ERROR);
					error.put("errorDescription", CargoErrorList.BILL_CLEARANCE_PAYMENT_DONE_ERROR_DESCRIPTION);
				}

				request.setAttribute("cargoError", error);
				request.setAttribute("nextPageToken", "failure");
			}
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}
	}

	private  BillClearance setBillClerance(final HttpServletRequest request, final BillClearance billClearance, final String indexForVal)  throws Exception {
		billClearance.setBillId(JSPUtility.GetLong(request, "billId_"+indexForVal, 0));
		billClearance.setBillNumber(JSPUtility.GetString(request, "billNumber_"+indexForVal, ""));
		billClearance.setCreditorId(JSPUtility.GetLong(request, "creditorId_"+indexForVal, 0));
		billClearance.setCreationDateTimeStamp(createDate);
		billClearance.setGrandTotal(JSPUtility.GetDouble(request, "grandTotal_"+indexForVal, 0.00));
		billClearance.setTotalReceivedAmount(JSPUtility.GetDouble(request, "receiveAmt_"+indexForVal, 0.00));

		billClearance.setPaymentMode(Short.parseShort(request.getParameter("paymentMode_"+indexForVal)));
		billClearance.setBalanceAmount(JSPUtility.GetDouble(request, "balanceAmt_"+indexForVal, 0.00));

		if(billClearance.getBalanceAmount() <= 0)
			billClearance.setStatus(PaymentTypeConstant.PAYMENT_TYPE_STATUS_CLEAR_PAYMENT_ID);
		else
			billClearance.setStatus(Short.parseShort(request.getParameter("paymentStatus_"+indexForVal)));

		if(billClearance.getPaymentMode() == PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID) {
			billClearance.setChequeDate(new Timestamp(sdf.parse(JSPUtility.GetString(request, "chequeDate_"+indexForVal) + " 00:00:00").getTime()));
			billClearance.setChequeNumber(JSPUtility.GetString(request, "chequeNumber_"+indexForVal, ""));
			billClearance.setRemark(StringUtils.upperCase(JSPUtility.GetString(request, "remark_" + indexForVal, "")));
		} else {
			billClearance.setChequeDate(null);
			billClearance.setChequeNumber(null);
			billClearance.setRemark(null);
		}

		final var paymentType = Short.parseShort(request.getParameter("paymentStatus_"+indexForVal));

		if(paymentType == PaymentTypeConstant.PAYMENT_TYPE_STATUS_NEGOTIATED_ID || paymentType == PaymentTypeConstant.PAYMENT_TYPE_STATUS_BAD_DEBT_ID)
			billClearance.setBillClearanceDiscount(JSPUtility.GetDouble(request, "balanceAmt_"+indexForVal, 0.00));
		else
			billClearance.setBillClearanceDiscount(0.0);

		billClearance.setAccountGroupId(executive.getAccountGroupId());
		billClearance.setExecutiveId(executive.getExecutiveId());
		billClearance.setBranchId(executive.getBranchId());

		return billClearance;
	}

	private MultipleBillClearance setMultipleBillClerance(final HttpServletRequest request, final MultipleBillClearance multipleBillClerance, final BillClearance   billClearance, final String indexForVal)  throws Exception {
		multipleBillClerance.setTotalReceivedAmount(billClearance.getTotalReceivedAmount() + multipleBillClerance.getTotalReceivedAmount());
		multipleBillClerance.setGrandTotal(billClearance.getGrandTotal() + multipleBillClerance.getGrandTotal());
		multipleBillClerance.setAccountgroupId(executive.getAccountGroupId());
		multipleBillClerance.setBranchId(JSPUtility.GetLong(request, "branchId_" + indexForVal,0));
		multipleBillClerance.setReceivedByBranchId(executive.getBranchId());
		multipleBillClerance.setReceivedByExecutiveId(executive.getExecutiveId());
		multipleBillClerance.setCreationDateTimeStamp(createDate);
		multipleBillClerance.setPaymentMode(Short.parseShort(request.getParameter("paymentMode_" + indexForVal)));

		if(multipleBillClerance.getPaymentMode() == PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID) {
			multipleBillClerance.setChequeDate(new Timestamp(sdf.parse(JSPUtility.GetString(request, "chequeDate_" + indexForVal) + " 00:00:00").getTime()));
			multipleBillClerance.setChequeNumber(JSPUtility.GetString(request, "chequeNumber_" + indexForVal, ""));
			multipleBillClerance.setBankName(StringUtils.upperCase(JSPUtility.GetString(request, "bankName_" + indexForVal, "")));
		}

		multipleBillClerance.setRemark(StringUtils.equalsIgnoreCase("Remark", StringUtils.upperCase(JSPUtility.GetString(request, "remark_multipleBillClerance^" + indexForVal, ""))) ? null : StringUtils.upperCase(JSPUtility.GetString(request, "remark_multipleBillClerance^" + indexForVal, "")));
		multipleBillClerance.setCreditorId(JSPUtility.GetLong(request, "creditorId_" + indexForVal, 0));

		return multipleBillClerance;
	}
}