package com.ivcargo.actions;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.DeliveryBLL;
import com.businesslogic.properties.GeneralConfiguration;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.constant.properties.lhpv.LHPVPropertiesConstant;
import com.iv.dto.TransportListMaster;
import com.iv.dto.constant.WayBillDeliveryTypeConstant;
import com.iv.utils.constant.Constant;
import com.iv.utils.constant.PodWayBillPropertiesConstant;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.exception.ExceptionProcess;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.CustomerDetailsDao;
import com.platform.dao.DeliveryContactDetailsDao;
import com.platform.dao.WayBillDao;
import com.platform.dto.AccountGroupTieUpConfiguration;
import com.platform.dto.Branch;
import com.platform.dto.City;
import com.platform.dto.ConfigParam;
import com.platform.dto.CustomerDetails;
import com.platform.dto.DeliveryContactDetails;
import com.platform.dto.DiscountDetails;
import com.platform.dto.ECargoConstantFile;
import com.platform.dto.Executive;
import com.platform.dto.TransportCommonMaster;
import com.platform.dto.WayBill;
import com.platform.dto.WayBillTaxDetails;
import com.platform.dto.configuration.modules.BankStatementConfigurationDTO;
import com.platform.dto.configuration.modules.CashStatementConfigurationDTO;
import com.platform.dto.configuration.modules.DashBoardConfigurationDTO;
import com.platform.dto.configuration.modules.GenerateCashReceiptDTO;
import com.platform.dto.configuration.modules.GroupConfigurationPropertiesDTO;
import com.platform.dto.configuration.modules.LrCostConfigurationDTO;
import com.platform.dto.constant.CargoAccountGroupConstant;
import com.platform.dto.model.ChargeTypeModel;
import com.platform.dto.model.PartyUpdateForLedgerAccountDTO;
import com.platform.resource.CargoErrorList;

public class DeliveredWayBillAction implements Action {

	private static final String TRACE_ID = "DeliveredWayBillAction";
	String 			deliveredToName 		= null;
	String 			deliveredToPhoneNo 		= null;
	CacheManip 		cache 					= null;
	long 			waybillid				= 0;

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	error 							= null;
		WayBill 				wayBill							= null;
		HashMap<Long,CustomerDetails> 	consignorList			= null;
		HashMap<Long,CustomerDetails> 	consigneeList			= null;
		HashMap<Long, CustomerDetails> 	billingPartyList				= null;
		CustomerDetails 		consignorDetails 				= null;
		CustomerDetails 		consigneeDetails 				= null;
		CustomerDetails					billingPartyDetails				= null;
		CustomerDetails 		customerDetails 				= null;
		String[] 				corporateAccountDetailsArray	= null;
		String 					deliveryRemark 					= null;
		String 					deliverString 					= null;
		Executive				executive 						= null;
		DeliveryBLL 			deliveryBLL						= null;
		ValueObject 			valueInObject					= null;
		ValueObject 			valueOutObject					= null;
		ValueObject 			branchColl 						= null;
		ChargeTypeModel[] 		deliveryCharge 					= null;
		long[] 					delchrId						= null;
		HashMap<Long ,Double> 	delchrhm  						= null;
		HashMap<Long ,Short> 	chetypehm 						= null;
		HashMap<Long ,String> 	chargeTypeName					= null;
		Double[] 				chrgesType						= null;
		Branch 					branch							= null;
		City 					city 							= null;
		Timestamp 				manualCRDate					= null;
		SimpleDateFormat 		sdf    							= null;
		String 					wbBookingDateStr 				= null;
		Timestamp				wbBookingDate					= null;
		PartyUpdateForLedgerAccountDTO model					= null;
		HashMap<Long, DeliveryContactDetails> delyCon			= null;
		ArrayList<PartyUpdateForLedgerAccountDTO> arrListForPartyWiseLeger        = null;
		Timestamp				systemDate                      = null;
		String						crNoAlreadyCreated			= null;
		long   						corporateAccountId 			= 0;
		short   					deleveryStatus 				= 0;
		double 						charge 						= 0.00;
		double 						delDis						= 0.00;
		boolean 					flag 						= false;
		boolean 					doNotPrint 					= false;
		boolean	 					flagForDisplay 				= false;
		boolean 					isWayBillStatusExist 		= false;
		long    					deliveryContactDetailId 	= 0;
		long						crId						= 0;
		DiscountDetails				discountDetails				= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			systemDate				= new Timestamp(new Date().getTime());
			deliverString			= request.getParameter("deliverString");
			waybillid				= Long.parseLong(request.getParameter("wayBillId"));
			wayBill					= WayBillDao.getInstance().getByWayBillId(waybillid);
			consignorList 			= CustomerDetailsDao.getInstance().getConsignorDetailsByWayBillId("" + wayBill.getWayBillId());
			consigneeList 			= CustomerDetailsDao.getInstance().getConsigneeDetailsByWayBillId("" + wayBill.getWayBillId());
			billingPartyList		= CustomerDetailsDao.getInstance().getCorporateDetailsByWayBillId("" + waybillid);
			consignorDetails 		= consignorList.get(wayBill.getWayBillId());
			consigneeDetails		= consigneeList.get(wayBill.getWayBillId());
			billingPartyDetails		= billingPartyList.get(waybillid);
			deleveryStatus			= WayBill.getStatusByDeliveryType(deliverString);
			delyCon 				= DeliveryContactDetailsDao.getInstance().getDeliveryContactDetails("" + waybillid);
			cache 					= new CacheManip(request);

			if (deleveryStatus > 0) {
				isWayBillStatusExist 	= WayBillDao.getInstance().checkWayBillStatus(waybillid, deleveryStatus);

				//If WayBill already delivered
				if(!isWayBillStatusExist) {
					deliveredToName		= request.getParameter(Constant.DELIVERED_TO_NAME);
					deliveredToPhoneNo	= request.getParameter("deliveredToPhoneNo");
					deliveryRemark		= request.getParameter("deliveryRemark");
					sdf    				= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
					wbBookingDateStr 	= JSPUtility.GetString(request, "wbBookingDate", null);
					wbBookingDate		= wbBookingDateStr != null ? new Timestamp(sdf.parse(wbBookingDateStr + " 00:00:00").getTime()) : null;

					if(delyCon != null && delyCon.get(waybillid) != null) {
						crNoAlreadyCreated 		= delyCon.get(waybillid).getWayBillDeliveryNumber();
						deliveryContactDetailId = delyCon.get(waybillid).getDeliveryContactDetailsId();
						crId					= delyCon.get(waybillid).getCrId();
					}

					if(WayBillDeliveryTypeConstant.WAYBILL_DELIVERY_TYPE_CREDIT_DELIVER.equals(deliverString) && request.getParameter("deliveryCorporateAccounts") != null){
						corporateAccountDetailsArray 	= request.getParameter("deliveryCorporateAccounts").split(",");
						corporateAccountId 				= Long.parseLong(corporateAccountDetailsArray[0].trim());
					}

					if(WayBillDeliveryTypeConstant.WAYBILL_DELIVERY_TYPE_CREDIT_DELIVER.equals(deliverString) && corporateAccountId == 0) {
						error.put(CargoErrorList.ERROR_CODE, CargoErrorList.SYSTEM_ERROR);
						error.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.SYSTEM_ERROR_DESCRIPTION);
						request.setAttribute("cargoError", error);
						request.setAttribute("nextPageToken", "failure");
					} else if(deliveredToName != null && !"".equals(deliveredToName) && deliveredToPhoneNo != null && !"".equals(deliveredToPhoneNo)) {
						executive 		= cache.getExecutive(request);
						deliveryBLL		= new DeliveryBLL();
						valueInObject	= new ValueObject();
						valueOutObject	= new ValueObject();
						branchColl 		= cache.getGenericBranchesDetail(request);
						deliveryCharge 	= cache.getActiveDeliveryCharges(request, executive.getBranchId());

						if(deliveryCharge != null) {
							flag 		= true;
							delchrId	= new long[deliveryCharge.length];
							delchrhm  	= new HashMap<>();
							chetypehm 	= new HashMap<>();
							chargeTypeName = new HashMap<>();
							chrgesType	= new Double[deliveryCharge.length];

							for(int i = 0; i < deliveryCharge.length; i++) {
								charge 			= JSPUtility.GetDouble(request, "deliveryCharge" + deliveryCharge[i].getChargeTypeMasterId(), 0);
								delchrId[i]		= deliveryCharge[i].getChargeTypeMasterId();
								chrgesType[i]	= charge;

								if(charge > 0)
									flagForDisplay = true;

								delchrhm.put(deliveryCharge[i].getChargeTypeMasterId(), chrgesType[i]);
								chetypehm.put(deliveryCharge[i].getChargeTypeMasterId(), deliveryCharge[i].getChargeType());
								chargeTypeName.put(deliveryCharge[i].getChargeTypeMasterId(), deliveryCharge[i].getDisplayName());
							}
							
							valueInObject.put("deliveryChargeId_valueObj", delchrId);
							valueInObject.put("deliveryCharge_valueObj", delchrhm);
							valueInObject.put("ChargeType_valueObj", chetypehm);
							valueInObject.put("ChargeTypeName_valueObj", chargeTypeName);
						}

						valueInObject.put("flag_valueObj", flag);

						//***************************************** Discount Details (start) *******************************************
						if(request.getParameter("discountTypes") != null && request.getParameter("txtDelDisc") != null && Double.parseDouble(request.getParameter("txtDelDisc")) > 0){
							discountDetails = createDiscountDetailsDTO(request,executive);
							discountDetails.setWaybillId(waybillid);
							valueInObject.put("discountDetails", discountDetails);
						}
						//***************************************** Discount Details (end) *********************************************

						if(request.getParameter("txtDelDisc") != null && !"".equals(request.getParameter("txtDelDisc")))
							delDis = Double.parseDouble(request.getParameter("txtDelDisc"));

						valueInObject.put("delDis_valueObj", delDis);

						//START::Logic for Manual Delivery

						if(request.getParameter("isManualCR") != null) {
							final Calendar currentDateTime 	= Calendar.getInstance();

							try {
								manualCRDate	= new Timestamp(sdf.parse(JSPUtility.GetString(request, Constant.MANUAL_CR_DATE) + " " + currentDateTime.get(Calendar.HOUR_OF_DAY) + ":" + currentDateTime.get(Calendar.MINUTE) + ":" + currentDateTime.get(Calendar.SECOND)).getTime());
							} catch (final Exception e) {
								error.put(CargoErrorList.ERROR_CODE, CargoErrorList.INVALID_DATE);
								error.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.INVALID_DATE_DESCRIPTION);
								request.setAttribute("cargoError", error);
								request.setAttribute("nextPageToken", "failure");
								return;
							}

							final int validDateCode = validateManualCRDate(wbBookingDate, manualCRDate, currentDateTime);

							if(validDateCode != 0) {
								//Error in date
								switch (validDateCode) {
								case CargoErrorList.INVALID_DATE:
									error.put(CargoErrorList.ERROR_CODE, CargoErrorList.INVALID_DATE);
									error.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.INVALID_DATE_DESCRIPTION);
									break;
								case CargoErrorList.DATE_ERROR:
									error.put(CargoErrorList.ERROR_CODE, CargoErrorList.DATE_ERROR);
									error.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.DATE_ERROR_DESCRIPTION);
									break;
								case CargoErrorList.INVALID_BACK_CR_DATE_ERROR:
									error.put(CargoErrorList.ERROR_CODE, CargoErrorList.INVALID_BACK_CR_DATE_ERROR);
									error.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.INVALID_BACK_CR_DATE_ERROR_DESCRIPTION);
									break;
								case CargoErrorList.CR_DATE_EARLIER_TO_BOOKING_DATE_ERROR:
									error.put(CargoErrorList.ERROR_CODE, CargoErrorList.CR_DATE_EARLIER_TO_BOOKING_DATE_ERROR);
									error.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.CR_DATE_EARLIER_TO_BOOKING_DATE_ERROR_DESCRIPTION);
									break;
								default:
									break;
								}

								request.setAttribute("cargoError", error);
								request.setAttribute("nextPageToken", "failure");
								return;
							}

							arrListForPartyWiseLeger = new ArrayList<>();

							if(JSPUtility.GetShort(request, Constant.DELIVERY_PAYMENT_TYPE, (short)0) == TransportCommonMaster.PAYMENT_TYPE_CREDIT_ID) {
								model = new PartyUpdateForLedgerAccountDTO();
								model.setAccountGroupId(executive.getAccountGroupId());
								model.setWayBillId(waybillid);
								model.setCreationDateTimeStamp(manualCRDate);
								model.setPartyUpDateDateTimeStamp(systemDate);
								model.setGrandTotal(0);
								model.setPaymentStatus((short)0);
								model.setTxnTypeId((short)0);
								model.setPreviousPartyMasterId(Long.parseLong(request.getParameter(Constant.CONSIGNEE_ID)));
								model.setCurrentPartyMasterId(0);
								model.setIsPartyLedgerEntered(true);
								model.setIdentifier(PartyUpdateForLedgerAccountDTO.IDENTIFIER_MANUAL_ENTERY);
								arrListForPartyWiseLeger.add(model);
							}
						}

						//END::Logic for Manual Delivery Date

						valueInObject.put(Constant.WAYBILL_ID, waybillid);
						valueInObject.put(Constant.CONSIGNOR_ID,  JSPUtility.GetLong(request, Constant.CONSIGNOR_ID, 0));
						valueInObject.put(Constant.ACCOUNT_GROUP_ID, executive.getAccountGroupId());
						valueInObject.put(Executive.EXECUTIVE, executive);
						valueInObject.put("deliveredToName_valueObj", deliveredToName.toUpperCase());
						valueInObject.put("deliveredToPhoneNo_valueObj", deliveredToPhoneNo);
						valueInObject.put("deliverString_valueObj", deliverString);
						valueInObject.put(Constant.CORPORATE_ACCOUNT_ID, corporateAccountId);
						valueInObject.put(DeliveryContactDetails.DELIVERY_CONTACT_DETAILS, getDeliveryContactDetails(request, executive, manualCRDate, deliveryContactDetailId, crId, crNoAlreadyCreated));
						valueInObject.put("configDamerageAmount", JSPUtility.GetDouble(request, "configDamerageAmount", 0.00));

						branch = cache.getExecutiveBranch(request, executive.getBranchId());
						valueInObject.put("isAgentBranch", branch.isAgentBranch());

						//set DeliveryCreditorId for Billing
						final long billingCreditorId = JSPUtility.GetLong(request, "deliveryCorporateAccounts",0);

						if(billingCreditorId > 0) {
							valueInObject.put("Creditor_Payment_Module_Key", cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_CREDITOR_PAYMENT_MODULE));
							valueInObject.put(Constant.BILLING_CREDITOR_ID, billingCreditorId);
						}

						if(WayBillDeliveryTypeConstant.WAYBILL_DELIVERY_TYPE_CREDIT_DELIVER.equals(deliverString)){
							customerDetails = new CustomerDetails();
							customerDetails.setName(corporateAccountDetailsArray[1]);
							customerDetails.setPhoneNumber(corporateAccountDetailsArray[2]);
							customerDetails.setMobileNumber(corporateAccountDetailsArray[3]);
							customerDetails.setWayBillId(waybillid);
							valueInObject.put("customerDetails_valueObj", customerDetails);
						}

						if(deliveryRemark != null)
							valueInObject.put("deliveryRemark_valueObj", deliveryRemark);


						//START Stored Value for SMS Shooting.
						branch	= (Branch) branchColl.get("" + wayBill.getDestinationBranchId());
						city = cache.getCityById(request, branch.getCityId());
						valueInObject.put("destinationCity",city.getName());

						branch	= (Branch) branchColl.get("" + wayBill.getSourceBranchId());
						city = cache.getCityById(request, branch.getCityId());
						valueInObject.put("sourceCity",city.getName());

						valueInObject.put("consignorMobNumber", consignorDetails.getMobileNumber());
						valueInObject.put("consigneeMobNumber", consigneeDetails.getMobileNumber());
						valueInObject.put(CustomerDetails.CONSIGNOR_DETAILS, consignorDetails);
						valueInObject.put(CustomerDetails.CONSIGNEE_DETAILS, consigneeDetails);
						valueInObject.put("billingPartyDetails", billingPartyDetails);

						final long destinationBranchId = wayBill.getDestinationBranchId();
						final Branch destinationBranch = cache.getGenericBranchDetailCache(request, destinationBranchId);
						valueInObject.put("destinationBranch", destinationBranch.getName());

						final long destinationBranchForNo = wayBill.getDestinationBranchId();
						final Branch destinationPh = cache.getGenericBranchDetailCache(request,destinationBranchForNo);
						valueInObject.put("destinationPh", destinationPh.getPhoneNumber());
						//END Stored Value for SMS Shooting.

						valueInObject.put("isServiceTaxReport", cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_SERVICE_TAX_REPORT) == ConfigParam.CONFIG_KEY_VALUE_SERVICE_TAX_REPORT_ALLOWED);
						valueInObject.put("CashStmtEntryAllowed", cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_CASH_STATEMENT_TABLE_ENTRY));
						valueInObject.put("arrListForPartyWiseLeger", arrListForPartyWiseLeger);
						valueInObject.put("isPendingDeliveryTableEntry", cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_PENDING_DELIVERY_STOCK_TABLE_ENTRY) == ConfigParam.CONFIG_KEY_PENDING_DELIVERY_STOCK_TABLE_ENTRY_ALLOWED);
						valueInObject.put("branchesColl", cache.getGenericBranchesDetail(request));
						valueInObject.put(WayBillTaxDetails.WAYBILL_TYPE_WISE_SERVICE_TAX_DATE, cache.wayBillTypeWiseServiceTaxDate(request, executive.getAccountGroupId()));
						valueInObject.put(AccountGroupTieUpConfiguration.ACCOUNT_GROUP_TIE_UP_CONFIGURATION_HM, cache.getAccountGroupTieUpConfiguration(request, executive.getAccountGroupId()));
						valueInObject.put(GeneralConfiguration.GENERAL_CONFIGURATION, cache.getGeneralConfiguration(request, executive.getAccountGroupId()));
						valueInObject.put(LrCostConfigurationDTO.LR_COST_CONFIGURATION, cache.getGroupWiseLRCostConfiguration(request, executive.getAccountGroupId()));
						valueInObject.put(GroupConfigurationPropertiesDTO.GROUP_CONFIGURATION, cache.getGroupConfiguration(request, executive.getAccountGroupId()));
						valueInObject.put(CashStatementConfigurationDTO.CASH_STATEMENT_CONFIGURATION, cache.getCashStatementConfiguration(request, executive.getAccountGroupId()));
						valueInObject.put(GenerateCashReceiptDTO.GENERATE_CASH_RECEIPT_CONFIGURATION, cache.getGenerateCRConfiguration(request, executive.getAccountGroupId()));
						valueInObject.put(PodWayBillPropertiesConstant.POD_CONFIGURATION, cache.getPODWayBillConfiguration(request, executive.getAccountGroupId()));
						valueInObject.put(BankStatementConfigurationDTO.BANK_STATEMENT_CONFIGURATION, cache.getBankStatementConfiguration(request, executive.getAccountGroupId()));
						valueInObject.put(LHPVPropertiesConstant.LHPV_CONFIGURATION, cache.getLhpvConfiguration(request, executive.getAccountGroupId()));
						valueInObject.put(TransportListMaster.TRANSPORT_LIST, cache.getTransportList(request));
						valueInObject.put(DashBoardConfigurationDTO.DASH_BOARD_CONFIGURATION, cache.getDashBoardConfiguration(request, executive.getAccountGroupId()));
						valueInObject.put("oldDelivery", true);
						
						cache.getConfigurationData(request, executive.getAccountGroupId(), valueInObject);
						
						valueOutObject = deliveryBLL.insertData(valueInObject);

						if(valueOutObject != null && Constant.SUCCESS.equals(valueOutObject.get(Constant.STATUS))) {
							if((executive.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNT_GORUP_ID_ROYAL_EXPRESS
									|| executive.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNT_GORUP_ID_JAMNAGAR_TRAVELS
									|| executive.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNT_GROUP_ID_PTT
									|| executive.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNT_GROUP_ID_TULSI_TRAVELS
									|| executive.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNT_GROUP_ID_NAIK_TRAVELS
									|| executive.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNT_GROUP_ID_MAYUR_CARGO
									|| executive.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNT_GROUP_ID_PAULO_TRAVELS
									|| executive.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNT_GROUP_ID_MECL) && !flagForDisplay)
								doNotPrint	= true;

							response.sendRedirect("SearchWayBill.do?pageId=2&eventId=6&wayBillId=" + waybillid +"&doNotPrint=" + doNotPrint);
							request.setAttribute("nextPageToken", "success");
						} else {
							error.put(CargoErrorList.ERROR_CODE, CargoErrorList.LR_ISSUE_ERROR);
							error.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.LR_ISSUE_ERROR_DESCRIPTION);
							request.setAttribute("cargoError", error);
							request.setAttribute("nextPageToken", "failure");
						}
					} else {
						error.put(CargoErrorList.ERROR_CODE, CargoErrorList.SYSTEM_ERROR);
						error.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.SYSTEM_ERROR_DESCRIPTION);
						request.setAttribute("cargoError", error);
						request.setAttribute("nextPageToken", "failure");
					}
				} else {
					error.put(CargoErrorList.ERROR_CODE, CargoErrorList.WAYBILL_DELIVERED_ERROR);
					error.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.WAYBILL_DELIVERED_ERROR_DESCRIPTION);
					request.setAttribute("cargoError", error);
					request.setAttribute("nextPageToken", "failure");
				}
			} else{
				error.put(CargoErrorList.ERROR_CODE, CargoErrorList.WAYBILL_DELIVERED_ERROR);
				error.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.WAYBILL_DELIVERED_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
				request.setAttribute("nextPageToken", "failure");
			}
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		} finally {
			wayBill							= null;
			consignorDetails 				= null;
			customerDetails 				= null;
			corporateAccountDetailsArray	= null;
			deliveryRemark 					= null;
			deliverString 					= null;
			executive 						= null;
			deliveryBLL						= null;
			valueInObject					= null;
			valueOutObject					= null;
			deliveryCharge 					= null;
			delchrId						= null;
			delchrhm  						= null;
			chetypehm 						= null;
			chrgesType						= null;
			branch							= null;
			city 							= null;
			sdf    							= null;
			wbBookingDateStr 				= null;
			wbBookingDate					= null;
		}

	}

	public DeliveryContactDetails getDeliveryContactDetails(HttpServletRequest request, Executive executive, Timestamp manualCRDate,long deliveryContactDetailId, long crId, String crNumber) throws Exception {

		DeliveryContactDetails 	details 	= null;
		String 					dt 			= null;
		String 					strDate 	= null;
		SimpleDateFormat 		sdf 		= null;
		Date 					fDate 		= null;
		Timestamp 				date 		= null;

		try {

			details = new DeliveryContactDetails();

			if(request.getParameter(Constant.IS_MANUAL_CR) != null) {
				details.setManual(true);
				details.setDeliveryDateTime(manualCRDate);
			} else
				details.setDeliveryDateTime(new Timestamp(new Date(System.currentTimeMillis()).getTime()));

			if(crNumber != null)
				details.setWayBillDeliveryNumber(crNumber);
			else
				details.setWayBillDeliveryNumber(JSPUtility.GetString(request, Constant.MANUAL_CR_NUMBER, null ));

			details.setWayBillId(waybillid);
			details.setDeliveredToName(deliveredToName.toUpperCase());
			details.setDeliveredToNumber(deliveredToPhoneNo);

			if(request.getParameter(Constant.DELIVERY_PAYMENT_TYPE) != null)
				details.setPaymentType(Short.parseShort(request.getParameter(Constant.DELIVERY_PAYMENT_TYPE)));

			details.setBankName(JSPUtility.GetString(request, Constant.BANK_NAME, "").toUpperCase());
			details.setBranchId(executive.getBranchId());
			details.setAccountGroupId(executive.getAccountGroupId());

			if(request.getParameter(Constant.CHEQUE_DATE) != null && Short.parseShort(request.getParameter(Constant.DELIVERY_PAYMENT_TYPE)) == TransportCommonMaster.PAYMENT_TYPE_CHEQUE_ID) {
				//Cheque Date calculation (Start)
				dt = JSPUtility.GetString(request, Constant.CHEQUE_DATE, "");

				if (!"".equals(dt)) {
					strDate = JSPUtility.GetString(request,Constant.CHEQUE_DATE, "") + " 00:00:00";
					sdf 	= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
					fDate 	= sdf.parse(strDate);
					date 	= new Timestamp(fDate.getTime());
					details.setChequeDate(date);
				}

				//Invoice Date calculation (End)
				details.setChequeNumber(JSPUtility.GetString(request, "chequeNo", "0"));
				details.setChequeAmount(JSPUtility.GetDouble(request, Constant.CHEQUE_AMOUNT, 0.00));
			}

			details.setDeliveryContactDetailsId(deliveryContactDetailId);
			details.setCrId(crId);

			return details;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		} finally {
			details 	= null;
			dt 			= null;
			strDate 	= null;
			sdf 		= null;
			fDate 		= null;
			date 		= null;
		}
	}

	private int validateManualCRDate (Timestamp wbBookingDate, Timestamp manualCRDate, Calendar currentDateTime) throws Exception {
		Calendar cal 				= null;
		Calendar calManualCRDate 	= null;
		Calendar calWbBookingDate 	= null;
		try {
			//Check if valid Date
			calManualCRDate = Calendar.getInstance();

			try {
				calManualCRDate.setTime(manualCRDate); //An Exception is thrown here if not a Valid date
			} catch (final Exception e) {
				return CargoErrorList.INVALID_DATE;
			}

			//Delivery Date earlier than booking date not allowed
			if(wbBookingDate!=null){
				calWbBookingDate = Calendar.getInstance();
				calWbBookingDate.setTime(wbBookingDate);

				if( calManualCRDate.getTimeInMillis() < calWbBookingDate.getTimeInMillis())
					return CargoErrorList.CR_DATE_EARLIER_TO_BOOKING_DATE_ERROR;
			}

			//Future Date not Allowed
			if( calManualCRDate.getTimeInMillis() > currentDateTime.getTimeInMillis())
				return CargoErrorList.DATE_ERROR;

			//Get wayBillstatus summary
			final int backDaysAllowed = ECargoConstantFile.SUPAA_MANUAL_CR_ALLOWED_BACK_DAYS;
			cal = Calendar.getInstance();
			cal.add(Calendar.DATE, -backDaysAllowed);
			cal.set(Calendar.HOUR, 0);
			cal.set(Calendar.MINUTE, 0);
			cal.set(Calendar.SECOND, 0);

			if( calManualCRDate.getTimeInMillis() < cal.getTimeInMillis())
				return CargoErrorList.INVALID_BACK_CR_DATE_ERROR;

			return 0;

		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private DiscountDetails createDiscountDetailsDTO(HttpServletRequest request, Executive executive) throws Exception {
		DiscountDetails discountDetails = null;

		try {
			discountDetails = new DiscountDetails();

			discountDetails.setAccountGroupId(executive.getAccountGroupId());
			discountDetails.setBranchId(executive.getBranchId());
			discountDetails.setDiscountMasterId(Integer.parseInt(request.getParameter("discountTypes")));
			discountDetails.setAmount(Double.parseDouble(request.getParameter("txtDelDisc")));
			discountDetails.setDiscountType(DiscountDetails.DISCOUNT_TYPE_DELIVERY);
			discountDetails.setStatus(true);
			discountDetails.setExecutiveId(executive.getExecutiveId());

			return discountDetails;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		} finally {
			discountDetails = null;
		}
	}
}