package com.ivcargo.actions.transport;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.StringJoiner;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.ObjectUtils;
import org.apache.commons.lang3.StringUtils;

import com.businesslogic.TaxCalculationBLL;
import com.businesslogic.WayBillBll;
import com.businesslogic.modelcreator.CreateConsignmentDetailsDTO;
import com.businesslogic.modelcreator.CreateConsignmentSummaryDTO;
import com.businesslogic.modelcreator.CreateCreditWayBillPaymentModuleDTO;
import com.businesslogic.modelcreator.CreateCreditWayBillTxnDTO;
import com.businesslogic.modelcreator.CreateCustomerDetailsDTO;
import com.businesslogic.modelcreator.CreateDirectDeliveryDirectVasuliDTO;
import com.businesslogic.modelcreator.CreateDispatchArticleDetailsDTO;
import com.businesslogic.modelcreator.CreateDispatchLedgerDTO;
import com.businesslogic.modelcreator.CreateDispatchSummaryDTO;
import com.businesslogic.modelcreator.CreateManualTransactionDTO;
import com.businesslogic.modelcreator.CreateWayBillBookingChargeDTO;
import com.businesslogic.modelcreator.CreateWayBillChargeAmountDTO;
import com.businesslogic.modelcreator.CreateWayBillCrossingPaymentModuleDTO;
import com.businesslogic.modelcreator.CreateWayBillDTO;
import com.businesslogic.modelcreator.CreateWayBillHistoryDTO;
import com.businesslogic.modelcreator.CreateWayBillInfoDTO;
import com.businesslogic.properties.GeneralConfiguration;
import com.businesslogic.utils.ActionConstants;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.bll.impl.waybill.FormTypesBllImpl;
import com.iv.constant.properties.dispatch.ManualLSConfigurationConstant;
import com.iv.dao.impl.waybill.EwayBillDetailsDaoImpl;
import com.iv.dto.LHPV;
import com.iv.dto.WayBillTaxTxn;
import com.iv.dto.constant.BillSelectionConstant;
import com.iv.dto.constant.BookingModeConstant;
import com.iv.dto.constant.CargoAccountGroupConstant;
import com.iv.dto.constant.ChargeTypeConstant;
import com.iv.dto.constant.InfoForDeliveryConstant;
import com.iv.dto.constant.LHPVChargeTypeConstant;
import com.iv.dto.constant.LHPVConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.dto.waybill.FormTypes;
import com.iv.logsapp.LogWriter;
import com.iv.utils.CollectionUtility;
import com.iv.utils.constant.Constant;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.exception.ExceptionProcess;
import com.iv.utils.webService.WSUtility;
import com.iv.utils.webService.WebServiceURI;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.ChargeTypeMasterDao;
import com.platform.dao.CorporateAccountDao;
import com.platform.dao.CrossingRatesDao;
import com.platform.dao.DuplicateTransactionCheckDao;
import com.platform.dto.Branch;
import com.platform.dto.ChargeTypeMaster;
import com.platform.dto.ConfigParam;
import com.platform.dto.ConsignmentDetails;
import com.platform.dto.ConsignmentSummary;
import com.platform.dto.CorporateAccount;
import com.platform.dto.CrossingRate;
import com.platform.dto.CustomerDetails;
import com.platform.dto.DirectDeliveryDirectVasuli;
import com.platform.dto.DispatchArticleDetails;
import com.platform.dto.DispatchLedger;
import com.platform.dto.DispatchSummary;
import com.platform.dto.Executive;
import com.platform.dto.ManualTransaction;
import com.platform.dto.TransportCommonMaster;
import com.platform.dto.VehicleNumberMaster;
import com.platform.dto.WayBill;
import com.platform.dto.WayBillBookingCharges;
import com.platform.dto.WayBillChargeAmount;
import com.platform.dto.WayBillCrossing;
import com.platform.dto.WayBillHistory;
import com.platform.dto.WayBillInfo;
import com.platform.dto.WayBillType;
import com.platform.dto.configuration.modules.CashStatementConfigurationDTO;
import com.platform.dto.configuration.modules.DashBoardConfigurationDTO;
import com.platform.dto.configuration.modules.GroupConfigurationPropertiesDTO;
import com.platform.dto.configuration.modules.LrCostConfigurationDTO;
import com.platform.dto.constant.BookingChargeConstant;
import com.platform.dto.constant.BookingTypeConstant;
import com.platform.dto.constant.FormTypeConstant;
import com.platform.dto.constant.PODRequiredConstant;
import com.platform.dto.constant.PaymentTypeConstant;
import com.platform.dto.constant.TaxPaidByConstant;
import com.platform.dto.constant.TransCargoAccountGroupConstant;
import com.platform.dto.constant.WayBillTypeConstant;
import com.platform.dto.model.ChargeTypeModel;
import com.platform.dto.model.CreditWayBillPaymentModule;
import com.platform.dto.model.CreditWayBillTxn;
import com.platform.dto.model.PartyUpdateForLedgerAccountDTO;
import com.platform.dto.model.TaxModel;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

public class ManualLSEntryAction implements Action {

	public static final String TRACE_ID = "ManualLSEntryAction";

	Executive			executive	= null;
	CacheManip			cache		= null;
	Timestamp			createDate	= null;
	CorporateAccount	corporateAccount		= null;
	ValueObject			calenderValueObject	= null;
	long				crossingAgentId		= 0;
	boolean				isWayBillGrandTotalRoundOffAllow	= false;
	Branch				wbSourceBranch			= null;
	Branch				wbDestBranch			= null;
	boolean				isLSNumberRequired	= false;

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {

		HashMap<String,Object>							error 									= null;
		DispatchLedger 									dispatchLedger							= null;
		WayBill											wayBill									= null;
		ConsignmentDetails[]							consignmentDetails						= null;
		CustomerDetails 								consignorDetails						= null;
		CustomerDetails 								consigneeDetails						= null;
		WayBillBookingCharges[] 						wayBillCharges 							= null;
		ConsignmentSummary								consignmentSummary						= null;
		CreditWayBillPaymentModule 						billPaymentModule 						= null;
		CreditWayBillTxn								creditWayBillTxn						= null;
		DispatchSummary									dispatchSummary							= null;
		WayBillHistory									wayBillHistory							= null;
		WayBillInfo										wayBillInfo								= null;
		ValueObject										valInForTax								= null;
		ManualTransaction								manualTransaction						= null;
		ArrayList<ManualTransaction>					manualTransactionList 					= null;
		ManualTransaction[]								manualTransactionArr 					= null;
		ArrayList<String> 								wayBillNumbers 							= null;
		WayBillChargeAmount[]		   					wayBillChargeAmountArr   				= null;
		ArrayList<WayBillChargeAmount> 					wayBillChargeAmountList  				= null;
		DirectDeliveryDirectVasuli 						deliveryDirectVasuli 					= null;
		HashMap<Long, WayBill>      				 	wayBillHM								= null;
		HashMap<Long, CustomerDetails>       			consignorHM								= null;
		HashMap<Long, CustomerDetails>       			consigneeHM								= null;
		HashMap<Long, WayBillBookingCharges[]>			wayBillChargesHM						= null;
		HashMap<Long, WayBillTaxTxn[]>					wayBillTaxTxnHM							= null;
		HashMap<Long, ConsignmentDetails[]>	 			consignmentDetailsHM					= null;
		HashMap<Long, ConsignmentSummary>       		consignmentSummaryHM					= null;
		HashMap<Long, CreditWayBillPaymentModule>   	billPaymentModuleHM						= null;
		HashMap<Long, CreditWayBillTxn>       			creditWayBillTxnHM						= null;
		HashMap<Long, DispatchSummary>       			dispatchSummaryHM						= null;
		HashMap<Long, WayBillHistory>      	 			wayBillHistoryHM						= null;
		HashMap<Long, DirectDeliveryDirectVasuli> 		directDeliveryDirectVasuliHM			= null;
		HashMap<Long, ManualTransaction[]>       		manualTransactionArrHM					= null;
		HashMap<Long, WayBillChargeAmount[]>       		wayBillChargeAmountArrHM				= null;
		ArrayList<PartyUpdateForLedgerAccountDTO> 		arrListForPartyWiseLeger  				= null;
		HashMap<Long, WayBillInfo>						wayBillInfoHM				 			= null;
		PartyUpdateForLedgerAccountDTO            		model                    	 	 		= null;
		CreateWayBillChargeAmountDTO			  		createWayBillChargeAmountDTO	 		= null;
		CreateManualTransactionDTO				  		createManualTransactionDTO	 			= null;
		CreateCreditWayBillTxnDTO						createCreditWayBillTxnDTO 				= null;
		CreateCreditWayBillPaymentModuleDTO				createCreditWayBillPaymentModuleDTO		= null;
		CreateConsignmentSummaryDTO						createConsignmentSummaryDTO				= null;
		CreateWayBillDTO								createWayBillDTO 						= null;
		CreateCustomerDetailsDTO						createCustomerDetailsDTO 				= null;
		CreateWayBillBookingChargeDTO					createWayBillBookingChargeDTO			= null;
		ValueObject								 		inValueObject							= null;
		ValueObject								 		dispatchArticleValObj					= null;
		CreateDispatchSummaryDTO						createDispatchSummaryDTO				= null;
		CreateWayBillHistoryDTO							createWayBillHistoryDTO					= null;
		CreateDispatchLedgerDTO							createDispatchLedgerDTO					= null;
		CreateConsignmentDetailsDTO						createConsignmentDetailsDTO				= null;
		CreateDirectDeliveryDirectVasuliDTO				createDirectDeliveryDirectVasuliDTO 	= null;
		CreateWayBillInfoDTO							createWayBillInfoDTO					= null;
		ValueObject										generalConfiguration					= null;
		CreateDispatchArticleDetailsDTO	 				createDispatchArticleDetailsDTO	 		= null;
		DispatchArticleDetails[]						 dispatchArticleDetailsArray	 		= null;
		HashMap<Long, DispatchArticleDetails[]>			dispatchArticleDetailsHM				= null;
		WayBillCrossing									wayBillCrossing							= null;
		HashMap<Long, WayBillCrossing>       			wayBillCrossingAgentModuleHM			= null;
		CreateWayBillCrossingPaymentModuleDTO			createWayBillCrossingPaymentModuleDTO 	= null;
		Calendar										now										= null;
		Calendar										cal										= null;
		String											lsNumber								= null;
		Timestamp										manualLSDate							= null;
		ValueObject										inValObj								= null;
		WayBillBll										wayBillBll								= null;
		ValueObject										outValObj								= null;
		Timestamp       								manualCRDate    						= null;
		SimpleDateFormat 								sdf            							= null;
		Timestamp        								systemDate     							= null;
		var 			 								diff 									= 0L;
		var			 								uniqueId								= 0L;
		HashMap<Long, ArrayList<Long>> 					accountGroupTieUpConfigurationHM 		= null;
		ValueObject										lrCostConfiguration						= null;
		ValueObject										groupConfig								= null;
		ArrayList<WayBillChargeAmount>     				wayBillChargeAmountReturnList 			= null;
		String 											bookingChargeConfiguration				= null;
		String[]										bookingChargesArr						= null;
		HashMap<Long, String> 							bookingChargesConfigMap					= null;
		ChargeTypeModel[] 								chargeTypeModelArr						= null;
		Map<Long, String> 								activeBookingChargeMap					= null;
		var											isCheckDuplicateLSSeqCounterWithOutScrapLS 	= false;
		var											lorryHire									= 0.00;
		ArrayList<CrossingRate>							crossingRateList							= null;
		FormTypesBllImpl								formTypesBLL								= null;
		var											showSingleEwaybillColumn				 	= false;
		var											showBillSelection				 			= false;
		short											defaultBillSelectionId						= 0;
		Map<Long, List<FormTypes>> 						formTypesHM									= null;
		var											generateEwayBill							= false;
		var											createLhpvAndBlhpvOnLorryHire				= false;
		var											applyCrossingRate							= false;
		var											validateDuplicateEwaybillNumberOnLrNumber	= false;

		try {
			final var	cacheManip 						= new CacheManip(request);

			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			executive 						= cacheManip.getExecutive(request);

			final var	manualLSconfigHM				= cacheManip.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.MANUAL_LS);
			isLSNumberRequired 							= (boolean) manualLSconfigHM.getOrDefault(ManualLSConfigurationConstant.IS_LS_NUMBER_REQUIRED, true);
			bookingChargeConfiguration					= (String) manualLSconfigHM.getOrDefault(ManualLSConfigurationConstant.MANUAL_LS_BOOKING_CHARGES, "0");
			isCheckDuplicateLSSeqCounterWithOutScrapLS 	= (boolean) manualLSconfigHM.getOrDefault(ManualLSConfigurationConstant.CHECK_DUPLICATE_LS_SEQ_COUNTER_WITH_OUT_SCRAP_LS,false);
			showSingleEwaybillColumn					= (boolean) manualLSconfigHM.getOrDefault(ManualLSConfigurationConstant.SHOW_SINGLE_EWAYBILL_COLUMN,false);
			generateEwayBill							= (boolean) manualLSconfigHM.getOrDefault(ManualLSConfigurationConstant.GENERATE_EWAY_BILL,false);
			createLhpvAndBlhpvOnLorryHire				= (boolean) manualLSconfigHM.getOrDefault(ManualLSConfigurationConstant.CREATE_LHPV_AND_BLHPV_ON_LORRY_HIRE, false);
			applyCrossingRate							= (boolean) manualLSconfigHM.getOrDefault(ManualLSConfigurationConstant.APPLY_CROSSING_RATE, false);
			validateDuplicateEwaybillNumberOnLrNumber	= (boolean) manualLSconfigHM.getOrDefault(ManualLSConfigurationConstant.VALIDATE_DUPLICATE_EWAY_BILL_NUMBER_ON_LR_NUMBER, false);
			final var	isCrossingAgentCodeWiseLRNumber				= (boolean) manualLSconfigHM.getOrDefault(ManualLSConfigurationConstant.IS_CROSSING_AGENT_CODE_WISE_LR_NUMBER_SEQUENCE, false);

			if(isCrossingAgentCodeWiseLRNumber) {
				final var crossingAgentCode = request.getParameter("crossingAgentCode");

				if(StringUtils.isEmpty(crossingAgentCode)) {
					error.put(CargoErrorList.ERROR_CODE, CargoErrorList.LS_DUPLICATE_NUMBER);
					error.put(CargoErrorList.ERROR_DESCRIPTION, "Crosisng Agent Code not found !");
					request.setAttribute(CargoErrorList.CARGO_ERROR, error);
					request.setAttribute("nextPageToken", "failure");
					return;
				}
			}

			if(bookingChargeConfiguration != null && !StringUtils.equalsIgnoreCase("0", bookingChargeConfiguration))
				bookingChargesArr = bookingChargeConfiguration.split(",");

			bookingChargesConfigMap			= new HashMap<>();

			chargeTypeModelArr = cacheManip.getActiveBookingCharges(request, executive.getBranchId());

			if(bookingChargesArr!=null){
				if(chargeTypeModelArr!=null && chargeTypeModelArr.length>0){
					activeBookingChargeMap = new HashMap<>();

					activeBookingChargeMap	= Stream.of(chargeTypeModelArr)
							.collect(Collectors.toMap(ChargeTypeModel::getChargeTypeMasterId,
									ChargeTypeModel::getChargeName, (v1, v2) -> v1));
				}

				for (final String element : bookingChargesArr) {
					final var chargeId = Long.parseLong(element);

					if(activeBookingChargeMap.get(chargeId) != null)
						bookingChargesConfigMap.put(chargeId, activeBookingChargeMap.get(chargeId));
				}
			}

			now 	    = Calendar.getInstance();
			systemDate  = new Timestamp(new Date().getTime());

			createDate 					= new Timestamp(now.getTimeInMillis());
			cache 						= new CacheManip(request);
			final var totalNoOfWayBills 		= JSPUtility.GetInt(request, "totalLRCount");
			sdf							= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			var isDuplicateLR 		= false;
			var isLSExists			= false;
			var	totalActualWeight 	= 0.0;
			var dispatchLedgerId	= 0L;
			var totalNoOfPackages	= 0;

			calenderValueObject		= Utility.getCalanderInstance();
			calenderValueObject.put("dateStr", request.getParameter("LSDate"));

			lorryHire				= JSPUtility.GetDouble(request, "lsLorryHire" , 0.00);
			lsNumber				= JSPUtility.GetString(request, "LSNumber");
			manualLSDate    		= Utility.getDateTimeFromString(calenderValueObject);
			crossingAgentId			= JSPUtility.GetLong(request, Constant.CROSSING_AGENT_ID,0);
			createDispatchLedgerDTO = new CreateDispatchLedgerDTO();
			formTypesBLL			= new FormTypesBllImpl();

			//Check if LS Number already exists
			cal 				= Calendar.getInstance();
			if(isLSNumberRequired)
				if(crossingAgentId > 0){
					if(isCheckDuplicateLSSeqCounterWithOutScrapLS)
						isLSExists 	= DuplicateTransactionCheckDao.getInstance().checkDuplicateTxnForFinancialYearForLS( lsNumber , 0, executive.getAccountGroupId(), (short)25,new Timestamp(cal.getTimeInMillis()), crossingAgentId);
					else
						isLSExists 	= DuplicateTransactionCheckDao.getInstance().checkDuplicateTxnForFinancialYearForLS( lsNumber , 0, executive.getAccountGroupId(), (short)13,new Timestamp(cal.getTimeInMillis()), crossingAgentId);
				} else if(isCheckDuplicateLSSeqCounterWithOutScrapLS)
					isLSExists 	= DuplicateTransactionCheckDao.getInstance().checkDuplicateTxnForFinancialYearForLS( lsNumber , 0, executive.getAccountGroupId(), (short)26,new Timestamp(cal.getTimeInMillis()), 0);
				else
					isLSExists 	= DuplicateTransactionCheckDao.getInstance().checkDuplicateTxnForFinancialYearForLS( lsNumber , 0, executive.getAccountGroupId(), (short)12,new Timestamp(cal.getTimeInMillis()), 0);

			if(cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_WAYBILL_GRAND_TOTAL_ROUNDOFF) == ConfigParam.CONFIG_KEY_WAYBILL_GRAND_TOTAL_ROUNDOFF_ALLOWED)
				isWayBillGrandTotalRoundOffAllow = true;

			generalConfiguration    = cache.getGeneralConfiguration(request, executive.getAccountGroupId());
			lrCostConfiguration 	= cache.getGroupWiseLRCostConfiguration(request, executive.getAccountGroupId());
			groupConfig				= cache.getGroupConfiguration(request, executive.getAccountGroupId());

			if(isLSExists){
				error.put(CargoErrorList.ERROR_CODE, CargoErrorList.LS_DUPLICATE_NUMBER);
				error.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.LS_DUPLICATE_NUMBER_DESCRIPTION);
				request.setAttribute(CargoErrorList.CARGO_ERROR, error);
				request.setAttribute("nextPageToken", "failure");
			} else {
				try {
					dispatchLedger	= populateDispatchLedger(request, lsNumber, manualLSDate, createDispatchLedgerDTO);
					if(dispatchLedger == null){
						error.put(CargoErrorList.ERROR_CODE, CargoErrorList.DEFAULT_VEHICLE_NUMBER_MISSING);
						error.put(CargoErrorList.ERROR_DESCRIPTION,CargoErrorList.DEFAULT_VEHICLE_NUMBER_DESCRIPTION);
						request.setAttribute(CargoErrorList.CARGO_ERROR, error);
						request.setAttribute("nextPageToken", "failure");
						return;
					}
				} catch (final Exception e) {
					LogWriter.writeLog(TRACE_ID,LogWriter.LOG_LEVEL_DEBUG, "exception while creating manualLSDate: "+e);
					throw e;
				}

				wayBillNumbers 		 					= new ArrayList<>();
				wayBillHM			 					= new HashMap<>();
				consignorHM								= new HashMap<>();
				consigneeHM								= new HashMap<>();
				wayBillChargesHM	 					= new HashMap<>();
				wayBillTaxTxnHM		 					= new HashMap<>();
				consignmentDetailsHM 					= new HashMap<>();
				consignmentSummaryHM 					= new HashMap<>();
				billPaymentModuleHM	 					= new HashMap<>();
				creditWayBillTxnHM	 					= new HashMap<>();
				dispatchSummaryHM	 					= new HashMap<>();
				wayBillHistoryHM	 					= new HashMap<>();
				manualTransactionArrHM					= new HashMap<>();
				wayBillChargeAmountArrHM				= new HashMap<>();
				createWayBillChargeAmountDTO 			= new CreateWayBillChargeAmountDTO();
				createManualTransactionDTO	 			= new CreateManualTransactionDTO();
				directDeliveryDirectVasuliHM 			= new HashMap<>();
				wayBillInfoHM				 			= new HashMap<>();
				dispatchArticleDetailsHM	 			= new HashMap<>();
				createCreditWayBillTxnDTO	 			= new CreateCreditWayBillTxnDTO();
				createCreditWayBillPaymentModuleDTO 	= new CreateCreditWayBillPaymentModuleDTO();
				createConsignmentSummaryDTO				= new CreateConsignmentSummaryDTO();
				createWayBillDTO						= new CreateWayBillDTO();
				createCustomerDetailsDTO				= new CreateCustomerDetailsDTO();
				createWayBillBookingChargeDTO			= new CreateWayBillBookingChargeDTO();
				createDispatchSummaryDTO				= new CreateDispatchSummaryDTO();
				createWayBillHistoryDTO					= new CreateWayBillHistoryDTO();
				createConsignmentDetailsDTO				= new CreateConsignmentDetailsDTO();
				createDirectDeliveryDirectVasuliDTO		= new CreateDirectDeliveryDirectVasuliDTO();
				createWayBillInfoDTO					= new CreateWayBillInfoDTO();
				inValueObject				 			= new ValueObject();
				createDispatchArticleDetailsDTO			= new CreateDispatchArticleDetailsDTO();
				wayBillCrossingAgentModuleHM			= new HashMap<>();
				createWayBillCrossingPaymentModuleDTO 	= new CreateWayBillCrossingPaymentModuleDTO();
				formTypesHM								= new HashMap<>();
				manualTransactionList 					= new ArrayList<>();

				showBillSelection 						= (boolean) manualLSconfigHM.getOrDefault(ManualLSConfigurationConstant.SHOW_BILL_SELECTION, false);
				defaultBillSelectionId					= Short.parseShort(manualLSconfigHM.getOrDefault(ManualLSConfigurationConstant.DEFAULT_BILL_SELECTION_ID, 0).toString());
				final var allowToUpdateWayBillIdInEwayBillDetails	= (boolean) manualLSconfigHM.getOrDefault(ManualLSConfigurationConstant.ALLOW_TO_UPDATE_WAY_BILL_ID_IN_E_WAY_BILL_DETAILS, false);

				//Create Way Bill model Array
				arrListForPartyWiseLeger	= new ArrayList<>();
				dispatchArticleValObj		= new ValueObject();
				final Map<Long, Long>	ewayBillDetailsIdHm			= new HashMap<>();

				inValueObject.put(Executive.EXECUTIVE, executive);

				dispatchArticleValObj.put(Executive.EXECUTIVE, executive);
				dispatchArticleValObj.put("tripDateTime", dispatchLedger.getTripDateTime());
				dispatchArticleValObj.put("branchId", dispatchLedger.getLsBranch());

				for (var i=1; i <= totalNoOfWayBills; i++ ){
					diff			= 0;

					wayBill			= createWayBillDto(request, i, createWayBillDTO, bookingChargesConfigMap, isCrossingAgentCodeWiseLRNumber);

					if(wayBillNumbers.contains(wayBill.getWayBillNumber())) {
						//Way bill Already Exist Error
						error.put(CargoErrorList.ERROR_CODE, CargoErrorList.DUPLICATE_WAYBILL);
						error.put(CargoErrorList.ERROR_DESCRIPTION,CargoErrorList.DUPLICATE_WAYBILL_DESCRIPTION);
						request.setAttribute(CargoErrorList.CARGO_ERROR, error);
						request.setAttribute("nextPageToken", "failure");
						return;
					}

					wayBillNumbers.add(wayBill.getWayBillNumber());

					if(JSPUtility.GetLong(request, "LRSourceBranchId_"+i) <= 0){
						error.put(CargoErrorList.ERROR_CODE, CargoErrorList.SOURCE_BRANCH_MISSING);
						error.put(CargoErrorList.ERROR_DESCRIPTION,CargoErrorList.SOURCE_BRANCH_MISSING_DESCRIPTION);
						request.setAttribute(CargoErrorList.CARGO_ERROR, error);
						request.setAttribute("nextPageToken", "failure");
						return;
					}

					if(JSPUtility.GetLong(request, "LRDestinationBranchId_"+i) <= 0){
						error.put(CargoErrorList.ERROR_CODE, CargoErrorList.DESTINATION_BRANCH_MISSING);
						error.put(CargoErrorList.ERROR_DESCRIPTION,CargoErrorList.DESTINATION_BRANCH_MISSING_DESCRIPTION);
						request.setAttribute(CargoErrorList.CARGO_ERROR, error);
						request.setAttribute("nextPageToken", "failure");
						return;
					}

					diff = Utility.getDayDiffBetweenTwoDates(wayBill.getCreationDateTimeStamp(), createDate);

					if(crossingAgentId <= 0)
						// Manual LR Dulpicate Check Also on Actual Booking Date Time
						isDuplicateLR = DuplicateTransactionCheckDao.getInstance().checkDuplicateTxnForFinancialYearForAutoGeneratedLR(wayBill.getWayBillNumber(), wayBill.getSourceBranchId(), executive.getAccountGroupId(), (short)10,wayBill.getCreationDateTimeStamp());

					if(isDuplicateLR) {
						//Way bill Already Exist Error
						error.put(CargoErrorList.ERROR_CODE, CargoErrorList.DUPLICATE_WAYBILL);
						error.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.DUPLICATE_WAYBILL_DESCRIPTION+" "+wayBill.getWayBillNumber());
						request.setAttribute(CargoErrorList.CARGO_ERROR, error);
						request.setAttribute("nextPageToken", "failure");
						return;
					}
					uniqueId++;

					wbSourceBranch  = cache.getGenericBranchDetailCache(request, JSPUtility.GetLong(request, "LRSourceBranchId_" + i));
					wbDestBranch    = cache.getGenericBranchDetailCache(request, JSPUtility.GetLong(request, "LRDestinationBranchId_" + i));

					consignmentDetails = createConsignmentsdto(request,wayBill,i,createConsignmentDetailsDTO, manualLSconfigHM);
					consignmentDetailsHM.put(uniqueId, consignmentDetails);

					final var consignorId = JSPUtility.GetLong(request,"consignorId_"+i,0);
					if(consignorId > 0)
						corporateAccount = CorporateAccountDao.getInstance().findByPartyIdForMaster(consignorId);

					consignorDetails = createConsignorDto(request, wayBill, corporateAccount, i, createCustomerDetailsDTO);
					consignorHM.put(uniqueId, consignorDetails);

					consigneeDetails = createConsigneeDto(request, wayBill, i, createCustomerDetailsDTO);
					consigneeHM.put(uniqueId, consigneeDetails);

					wayBillCharges = createManualChargesDto(request, wayBill, i, createWayBillBookingChargeDTO,bookingChargesConfigMap);
					wayBillChargesHM.put(uniqueId, wayBillCharges);

					consignmentSummary = createConsignmentSummaryDto(request, wayBill, corporateAccount, i, createConsignmentSummaryDTO, crossingAgentId, manualLSconfigHM);

					if(showBillSelection)
						consignmentSummary.setBillSelectionId(JSPUtility.GetShort(request, "billSelection_" + i, BillSelectionConstant.BOOKING_WITH_BILL));
					else if(defaultBillSelectionId > 0)
						consignmentSummary.setBillSelectionId(defaultBillSelectionId);

					//Tax Logic
					valInForTax 	= new ValueObject();

					valInForTax.put(TaxModel.TAX_MODEL_ARR, cacheManip.getTaxes(request, executive));
					valInForTax.put("discountedAmount", 0);
					valInForTax.put("taxBy", consignmentSummary.getTaxBy());
					valInForTax.put(Constant.BILL_SELECTION_ID, consignmentSummary.getBillSelectionId());
					valInForTax.put("accountGroupId", executive.getAccountGroupId());
					valInForTax.put("charges", cache.getActiveBookingCharges(request, executive.getBranchId()));
					valInForTax.put("sourceBranch", wbSourceBranch);
					valInForTax.put("destinationBranch", wbDestBranch);
					valInForTax.put(CustomerDetails.CONSIGNOR_DETAILS, consignorDetails);
					valInForTax.put(CustomerDetails.CONSIGNEE_DETAILS, consigneeDetails);
					valInForTax.put(GroupConfigurationPropertiesDTO.GROUP_CONFIGURATION, groupConfig);
					valInForTax.put("wayBillTypeId", wayBill.getWayBillTypeId());
					valInForTax.put(Executive.EXECUTIVE, executive);

					final var	valOutForTax 	= TaxCalculationBLL.getInstance().calculateServiceTaxDetails(valInForTax);

					final var	wayBillTaxTxn 	= (WayBillTaxTxn[])valOutForTax.get("wayBillTaxTxn");
					final Double	taxes 	= Double.parseDouble(valOutForTax.get("taxes").toString());
					wayBill.setGrandTotal(wayBill.getGrandTotal()+ taxes);
					final Double taxFreeChargeAmt = Double.parseDouble(valOutForTax.get("taxFreeCharges").toString());

					if(ObjectUtils.isNotEmpty(wayBillTaxTxn))
						wayBillTaxTxnHM.put(uniqueId, wayBillTaxTxn);

					//if no ST applicable then set TaxBy id to 0
					if(ObjectUtils.isEmpty(wayBillTaxTxn))
						consignmentSummary.setTaxBy((short)0);

					consignmentSummaryHM.put(uniqueId, consignmentSummary);

					wayBill.setCreditorId(0);
					wayBill.setBookedForAccountGroupId(executive.getAccountGroupId());
					wayBill.setDeliveryPlace(consignmentSummary.getDeliveryPlace());
					wayBill.setDeliveryPlaceId(consignmentSummary.getDeliveryPlaceId());

					inValueObject.put("wayBill", wayBill);
					wayBillInfo = createWayBillInfodto(request,taxes,createWayBillInfoDTO, i,bookingChargesConfigMap);

					wbSourceBranch  = cache.getGenericBranchDetailCache(request, wayBillInfo.getSourceBranchId());
					wbDestBranch    = cache.getGenericBranchDetailCache(request, wayBillInfo.getDestinationBranchId());

					inValueObject.put("wayBillCharges", wayBillCharges);
					inValueObject.put("branchId", wayBill.getBranchId());
					inValueObject.put("bookingDateTime", wayBillInfo.getBookingDateTime());
					inValueObject.put("generalConfiguration", generalConfiguration);

					wayBillChargeAmountReturnList = createWayBillChargeAmountDTO.getWayBillChargeAmountDTO(inValueObject);
					if (wayBillChargeAmountReturnList != null && !wayBillChargeAmountReturnList.isEmpty()) {
						for (final WayBillChargeAmount wayBillChargeAmt : wayBillChargeAmountReturnList)
							if (wayBillChargeAmt != null) {
								wayBillChargeAmountList = new ArrayList<>();
								wayBillChargeAmountList.add(wayBillChargeAmt);

								if (diff > 0) {
									inValueObject.put("wayBillChargeAmount", wayBillChargeAmt);
									manualTransaction = createManualTransactionDTO.getManualTransactionDTO(inValueObject);
									manualTransactionList.add(manualTransaction);
								}
							}
						wayBillChargeAmountArr = new WayBillChargeAmount[wayBillChargeAmountList.size()];
						wayBillChargeAmountList.toArray(wayBillChargeAmountArr);
						wayBillChargeAmountArrHM.put(uniqueId, wayBillChargeAmountArr);
					}
					inValueObject.put("wayBillInfo", wayBillInfo);
					inValueObject.put("wbSourceBranch", wbSourceBranch);
					inValueObject.put("wbDestBranch", wbDestBranch);
					//***************************************** Credit WayBill Payment Module DTO ***********************************************
					if(cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_CREDITOR_PAYMENT_MODULE) == ConfigParam.CONFIG_KEY_CREDITOR_PAYMENT_MODULE_YES
							&& wayBill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT) {

						inValueObject.put("billingPartyId", consignorDetails.getBillingPartyId());
						inValueObject.put("taxBy", consignmentSummary.getTaxBy());
						inValueObject.put("taxes", taxes);
						inValueObject.put("taxFreeChargeAmt", taxFreeChargeAmt);
						inValueObject.put("wayBillChargeAmountArrHM", wayBillChargeAmountArrHM);
						inValueObject.put("uniqueId", uniqueId);

						billPaymentModule = createCreditWayBillPaymentModuleDTO.getCreditWayBillPaymentModuleDTO(inValueObject);
						billPaymentModuleHM.put(uniqueId, billPaymentModule);

					}
					//***************************************** Credit WayBill Payment Module DTO ***********************************************

					billPaymentModule = null;

					//set CreditWayBillTxn Object
					if(consignmentSummary.getPaymentType() == PaymentTypeConstant.PAYMENT_TYPE_CREDIT_ID) {
						inValueObject.put("corporateAccountId", consignorDetails.getCorporateAccountId());
						creditWayBillTxn = createCreditWayBillTxnDTO.getCreditWayBillTxnDTO(inValueObject);
						creditWayBillTxnHM.put(uniqueId, creditWayBillTxn);
					}
					//**

					if(JSPUtility.GetLong(request, "deliveryPaymentType",0)==PaymentTypeConstant.PAYMENT_TYPE_CREDIT_ID)
					{
						manualCRDate	= new Timestamp(sdf.parse(JSPUtility.GetString(request, "LRDate_+i")+ " 00:00:00").getTime());
						model=new PartyUpdateForLedgerAccountDTO();
						model.setAccountGroupId(executive.getAccountGroupId());
						model.setWayBillId(JSPUtility.GetLong(request, "LRNumber_"+i,0));
						model.setCreationDateTimeStamp(manualCRDate);
						model.setPartyUpDateDateTimeStamp(systemDate);
						model.setGrandTotal(JSPUtility.GetDouble(request, "amount_"+i,0));
						model.setPaymentStatus((short)0);
						model.setTxnTypeId((short)0);
						model.setPreviousPartyMasterId(Long.parseLong(request.getParameter("consigneeId"+i)));
						model.setCurrentPartyMasterId(0);
						model.setIdentifier(PartyUpdateForLedgerAccountDTO.IDENTIFIER_MANUAL_ENTERY);
						arrListForPartyWiseLeger.add(model);
					}

					dispatchSummary = createDispatchSummaryDTO(dispatchLedger, wayBill, createDispatchSummaryDTO, consignmentSummary);
					dispatchSummary.setAmountShow(true);
					dispatchSummaryHM.put(uniqueId, dispatchSummary);
					wayBillHistory = createWayBillHistoryDTO(wayBill, createWayBillHistoryDTO);
					wayBillHistoryHM.put(uniqueId, wayBillHistory);

					manualTransactionList = new ArrayList<>();

					inValueObject.put("conSummary", consignmentSummary);

					if(diff > 0 && wayBill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID){
						manualTransaction	= createManualTransactionDTO.getManualTransactionDTO(inValueObject);
						manualTransactionList.add(manualTransaction);
					}

					wayBill.setCreationDateTimeStamp(manualLSDate);

					final var formNumbers	= JSPUtility.GetString(request, "ewaybillNumber_" + i, null);

					if(showSingleEwaybillColumn && StringUtils.isNotEmpty(formNumbers)) {
						final List<Short>	formTypesList	= new ArrayList<>();

						formTypesList.add(FormTypeConstant.E_WAYBILL_ID);

						final var	valObjIn 	= new ValueObject();

						valObjIn.put("wbAccountGroupId", executive.getAccountGroupId());
						valObjIn.put("isManual", true);
						valObjIn.put("date", manualLSDate);
						valObjIn.put(FormTypes.FORM_TYPES_LIST, formTypesList);
						valObjIn.put(FormTypes.FORM_NUMBER, formNumbers);
						valObjIn.put("validateDuplicateEwaybillNumberOnLrNumber", validateDuplicateEwaybillNumberOnLrNumber);

						final var	eWayBillNumberArray 		= CollectionUtility.getStringListFromString(formNumbers);

						if(!eWayBillNumberArray.isEmpty())
							for(final String ewayBillNumber : eWayBillNumberArray)
								if(ewayBillNumber.trim().length() != 12) {
									error.put(CargoErrorList.ERROR_DESCRIPTION, " E-Waybill Number " + ewayBillNumber + " should contain 12 digits !");
									request.setAttribute(CargoErrorList.CARGO_ERROR, error);
									request.setAttribute("nextPageToken", "failure");
									return;
								}

						final var	formTypes			= formTypesBLL.createFormTypesDto(valObjIn);

						if(validateDuplicateEwaybillNumberOnLrNumber && valObjIn.getBoolean("alreadyEwayBillNumberUsedFlag", false)) {
							error.put(CargoErrorList.ERROR_DESCRIPTION, " E-Waybill Number  "+valObjIn.getString("eWayBillNo", "") + " is already added in this LR "+valObjIn.getString("usedLrNumber", "")+".");
							request.setAttribute(CargoErrorList.CARGO_ERROR, error);
							request.setAttribute("nextPageToken", "failure");
							return;
						}

						formTypesHM.put(uniqueId, formTypes);

						if(allowToUpdateWayBillIdInEwayBillDetails) {
							final var whereClause = new StringJoiner(" AND ");
							whereClause.add("ewd.AccountGroupId	= " + wayBill.getAccountGroupId());
							whereClause.add("ewd.EWayBillNumber	= '" + formNumbers + "'");

							final var	ewayBillDetailsList	= EwayBillDetailsDaoImpl.getInstance().getEwayBillDetailsByWhereCluase(whereClause.toString());

							if(ObjectUtils.isNotEmpty(ewayBillDetailsList))
								ewayBillDetailsIdHm.put(uniqueId, ewayBillDetailsList.get(0).geteWayBillDetailsId());
						}
					}

					wayBillHM.put(uniqueId, wayBill);

					if(crossingAgentId > 0){
						var crossingHire 	= 0.00;
						inValueObject.put(Constant.CROSSING_AGENT_ID, crossingAgentId);

						if(applyCrossingRate) {
							crossingRateList 		= CrossingRatesDao.getInstance().getCrossingRates(executive.getAccountGroupId(), dispatchLedger.getDestinationBranchId(), wayBill.getDestinationBranchId(), crossingAgentId, CrossingRate.TXN_TYPE_BOOKING);

							if(crossingRateList == null || crossingRateList.isEmpty())
								crossingRateList 		= CrossingRatesDao.getInstance().getCrossingRates(executive.getAccountGroupId(), 0, 0, crossingAgentId, CrossingRate.TXN_TYPE_BOOKING );

							if(crossingRateList != null && !crossingRateList.isEmpty())
								for(final CrossingRate rate : crossingRateList) {
									final var 	rateAmt	= rate.getRate();

									if(rate.isRatePercentage())
										crossingHire	+= wayBillInfo.getGrandTotal() * (rateAmt / 100);
									else if(rate.getChargeTypeId() == ChargeTypeConstant.CHARGETYPE_ID_WEIGHT)
										crossingHire 	+= consignmentSummary.getActualWeight() * rateAmt;
									else if(rate.getChargeTypeId() == ChargeTypeConstant.CHARGETYPE_ID_FIX || rate.getChargeTypeId() != ChargeTypeConstant.CHARGETYPE_ID_QUANTITY || rate.getPackingTypeId() != consignmentDetails[0].getPackingTypeMasterId())
										crossingHire 	+= rateAmt;
									else
										crossingHire 	+= consignmentSummary.getQuantity() * rateAmt;
								}

							if(crossingHire == 0)
								crossingHire	= JSPUtility.GetDouble(request, "crossingHire_" + i, 0.00);

							inValueObject.put("crossingHire", crossingHire);
						} else
							inValueObject.put("crossingHire", JSPUtility.GetDouble(request, "crossingHire_" + i, 0.00));

						wayBillCrossing = createWayBillCrossingPaymentModuleDTO.getWayBillCrossingPaymentModuleDTO(inValueObject);

						wayBillCrossingAgentModuleHM.put(uniqueId, wayBillCrossing);

					}

					if(manualTransactionList != null && !manualTransactionList.isEmpty()){
						manualTransactionArr = new ManualTransaction[manualTransactionList.size()];
						manualTransactionList.toArray(manualTransactionArr);
						manualTransactionArrHM.put(uniqueId, manualTransactionArr);
					}

					inValueObject.put("grandTotal", wayBillInfo.getGrandTotal());
					if(consignmentSummary.getDeliveryTo() == InfoForDeliveryConstant.DIRECT_DELIVERY_DIRECT_VASULI_ID) {
						deliveryDirectVasuli 	= createDirectDeliveryDirectVasuliDTO.getDirectDeliveryDirectVasuliDTODTO(inValueObject);
						directDeliveryDirectVasuliHM.put(uniqueId, deliveryDirectVasuli);
					}

					wayBillInfoHM.put(uniqueId, wayBillInfo);

					dispatchArticleValObj.put("consignmentDetails", consignmentDetails);
					dispatchArticleValObj.put("branchId", dispatchLedger.getLsBranchId());

					dispatchArticleDetailsArray = createDispatchArticleDetailsDTO.getDispatchArticldto(dispatchArticleValObj);
					dispatchArticleDetailsHM.put(uniqueId, dispatchArticleDetailsArray);

					totalActualWeight 		+= consignmentSummary.getActualWeight();
					totalNoOfPackages		+= consignmentSummary.getQuantity();
				}

				dispatchLedger.setTotalActualWeight(totalActualWeight);
				dispatchLedger.setTotalNoOfPackages(totalNoOfPackages);
				dispatchLedger.setTotalNoOfWayBills(totalNoOfWayBills);
				dispatchLedger.setTotalNoOfGodownArticles(totalNoOfPackages);
				dispatchLedger.setTransactionExecutiveId(executive.getExecutiveId());
				dispatchLedger.setDispatchExecutiveId(executive.getExecutiveId());

				accountGroupTieUpConfigurationHM	= cacheManip.getAccountGroupTieUpConfiguration(request, executive.getAccountGroupId());

				if(defaultBillSelectionId > 0)
					dispatchLedger.setBillSelectionId(defaultBillSelectionId);

				inValObj 	= new ValueObject();
				inValObj.put("dispatchLedger", dispatchLedger);
				inValObj.put("wayBillHM",wayBillHM );
				inValObj.put("formTypesHM", formTypesHM);
				inValObj.put("consignorHM",consignorHM);
				inValObj.put("consigneeHM",consigneeHM);
				inValObj.put("wayBillChargesHM", wayBillChargesHM );
				inValObj.put("wayBillTaxTxnHM", wayBillTaxTxnHM );
				inValObj.put("consignmentDetailsHM",consignmentDetailsHM);
				inValObj.put("consignmentSummaryHM",consignmentSummaryHM);
				inValObj.put("billPaymentModuleHM", billPaymentModuleHM );
				inValObj.put("creditWayBillTxnHM", creditWayBillTxnHM );
				inValObj.put("dispatchSummaryHM", dispatchSummaryHM );
				inValObj.put("wayBillHistoryHM", wayBillHistoryHM );
				inValObj.put("manualTransactionArrHM",manualTransactionArrHM);
				inValObj.put("wayBillChargeAmountArrHM",wayBillChargeAmountArrHM);
				inValObj.put("directDeliveryDirectVasuliHM",directDeliveryDirectVasuliHM);
				inValObj.put("wayBillInfoHM",wayBillInfoHM);
				inValObj.put("isManual", true);
				inValObj.put(Executive.EXECUTIVE, executive);
				inValObj.put("dispatchArticleDetailsHM", dispatchArticleDetailsHM);
				inValObj.put(Constant.CROSSING_AGENT_ID, crossingAgentId);
				inValObj.put("wayBillCrossingAgentModuleHM", wayBillCrossingAgentModuleHM);
				inValObj.put("accountGroupTieUpConfigurationHM",accountGroupTieUpConfigurationHM);
				inValObj.put("allBranchesColl", cache.getGenericBranchesDetail(request));
				inValObj.put(LrCostConfigurationDTO.LR_COST_CONFIGURATION,lrCostConfiguration);
				inValObj.put(GroupConfigurationPropertiesDTO.GROUP_CONFIGURATION, groupConfig);
				inValObj.put(GeneralConfiguration.GENERAL_CONFIGURATION, cacheManip.getGeneralConfiguration(request, executive.getAccountGroupId()));
				inValObj.put(DashBoardConfigurationDTO.DASH_BOARD_CONFIGURATION, cacheManip.getDashBoardConfiguration(request, executive.getAccountGroupId()));
				inValObj.put(CashStatementConfigurationDTO.CASH_STATEMENT_CONFIGURATION, cache.getCashStatementConfiguration(request, executive.getAccountGroupId()));
				inValObj.put(GeneralConfiguration.ALLOW_PENDING_AGENT_COMMISSION_BILLING_STOCK_ENTRY,generalConfiguration.getBoolean(GeneralConfiguration.ALLOW_PENDING_AGENT_COMMISSION_BILLING_STOCK_ENTRY,false));
				inValObj.put(GeneralConfiguration.WAY_BILL_TYPES_ALLOWED_FOR_AGENT_COMMISSION_BILLING_STOCK_ENTRY, generalConfiguration.getString(GeneralConfiguration.WAY_BILL_TYPES_ALLOWED_FOR_AGENT_COMMISSION_BILLING_STOCK_ENTRY,"0"));
				inValObj.put(ManualLSConfigurationConstant.VALIDATE_EWAY_BILL_NUMBER_BY_API, manualLSconfigHM.getOrDefault(ManualLSConfigurationConstant.VALIDATE_EWAY_BILL_NUMBER_BY_API,false));
				inValObj.put("ewayBillDetailsIdHm", ewayBillDetailsIdHm);

				wayBillBll			= new WayBillBll();
				outValObj			= wayBillBll.generateAndDispatchWayBills(inValObj);
				dispatchLedgerId 	= (Long) outValObj.get("dispatchLedgerId");

				if(dispatchLedgerId > 0 && lorryHire > 0 && createLhpvAndBlhpvOnLorryHire) {
					final var module	= new StringBuilder();

					module.append("&"+Constant.EXECUTIVE_ID +"="+ executive.getExecutiveId());
					module.append("&"+Constant.ACCOUNT_GROUP_ID +"="+ executive.getAccountGroupId());
					module.append("&"+LHPV.OPERATION_TYPE +"="+ LHPVConstant.CREATE_ID);
					module.append("&isSeqCounterPresent=" + true);
					module.append("&dlIdS="+ dispatchLedgerId + "");
					module.append("&charge"+LHPVChargeTypeConstant.LORRY_HIRE+"="+ lorryHire);
					module.append("&charge"+LHPVChargeTypeConstant.BALANCE_AMOUNT+"="+ lorryHire);
					module.append("&charge"+LHPVChargeTypeConstant.ACTUAL_BALANCE+"="+ lorryHire);
					module.append("&lorryHire="+ lorryHire);
					module.append("&LSDate="+ request.getParameter("LSDate"));

					WSUtility.callPostWebService(WSUtility.getWebServiceUrl(Integer.toString(WebServiceURI.CREATE_LHPV_AND_BLHPV)), module.toString());

				}

				if(	crossingAgentId > 0 && generateEwayBill) {
					final var module	= new StringBuilder();
					module.append("&moduleId=" + ModuleIdentifierConstant.DISPATCH_TIME_CONSOLIDATE_EWAYBILL);
					module.append("&accountGroupId=" + executive.getAccountGroupId());
					module.append("&dispatchIdString=" + dispatchLedgerId);
					module.append("&branchId="+ executive.getBranchId());
					module.append("&executiveId="+ executive.getExecutiveId());
					WSUtility.callPostWebService(WSUtility.getWebServiceUrl(Integer.toString(WebServiceURI.GENERATE_AUTO_CONSOLIDATE_EWAYBILL)), module.toString());
				}

				response.sendRedirect("SearchWayBill.do?pageId=3&eventId=9&dispatchLedgerId="+dispatchLedgerId+"&Type=Dispatched&LSNo="+dispatchLedger.getLsNumber()+"&isCrossing="+dispatchLedger.isCrossing()+"&CrossingAgentId="+dispatchLedger.getCrossingAgentId());
				request.setAttribute("dispatchLedgerId", dispatchLedgerId);
				request.setAttribute("nextPageToken", "success");
			}
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}

	private WayBill createWayBillDto(final HttpServletRequest request, final int i, final CreateWayBillDTO  createWayBillDTO, final HashMap<Long, String> 	bookingChargesConfigMap, final boolean isCrossingAgentCodeWiseLRNumber) throws Exception {
		WayBill 			wayBill				= null;
		Branch				srcBranch			= null;
		Branch				destBranch			= null;
		var 				otherCharges		= 0D;

		try {
			final var	inValueObject = new ValueObject();
			inValueObject.put(Executive.EXECUTIVE, executive);

			final var crossingAgentCode = request.getParameter("crossingAgentCode");

			final var wayBillNumber	= JSPUtility.GetString(request, "LRNumber_" + i);

			if(isCrossingAgentCodeWiseLRNumber)
				inValueObject.put("wayBillNumber", crossingAgentCode + wayBillNumber);
			else
				inValueObject.put("wayBillNumber",  wayBillNumber);

			calenderValueObject.put("dateStr", request.getParameter("LRDate_"+i));
			inValueObject.put("date", Utility.getDateTimeFromString(calenderValueObject));
			inValueObject.put("createDate", createDate);

			inValueObject.put("sourceBranchId", JSPUtility.GetLong(request, "LRSourceBranchId_"+i));
			inValueObject.put("destinationBranchId", JSPUtility.GetLong(request, "LRDestinationBranchId_"+i));
			inValueObject.put("wayBillTypeId", JSPUtility.GetLong(request, "LRType_"+i));
			inValueObject.put("wbCreationCategory", ActionConstants.TRANSPORT_MANUAL);
			inValueObject.put("amount", JSPUtility.GetDouble(request, "amount_"+i,0));
			inValueObject.put("discountedAmount",JSPUtility.GetDouble(request, "amount_"+i,0));
			inValueObject.put("wbCreationCategory", ActionConstants.TRANSPORT_MANUAL);

			inValueObject.put("saidToContain", JSPUtility.GetString(request, "saidToContain_"+i,null));

			inValueObject.put("bookingType", TransportCommonMaster.BOOKING_TYPE_SUNDRY_ID);

			if(JSPUtility.GetShort(request,"deliveryTo_"+i,(short)0) == 0)
				inValueObject.put("deliveryTo", TransportCommonMaster.DELIVERY_TO_BRANCH_ID);
			else
				inValueObject.put("deliveryTo", JSPUtility.GetShort(request,"deliveryTo_"+i));

			inValueObject.put("remark", StringUtils.upperCase(JSPUtility.GetString(request, "remark_" + i, "")));
			inValueObject.put("bookingCrossingAgentId", crossingAgentId);
			inValueObject.put("isWayBillGrandTotalRoundOffAllow", isWayBillGrandTotalRoundOffAllow);

			if(bookingChargesConfigMap!=null)
				for(final Map.Entry<Long, String> entry : bookingChargesConfigMap.entrySet())
					otherCharges += JSPUtility.GetDouble(request, StringUtils.trim(entry.getValue())+"_"+i,0);

			inValueObject.put("otherCharges",otherCharges);
			srcBranch = cache.getGenericBranchDetailCache(request, JSPUtility.GetLong(request, "LRSourceBranchId_"+i));

			if(srcBranch != null)
				inValueObject.put("handlingBranchId", ActionStaticUtil.getHandlingBranchIdByBranchId(request, srcBranch, executive.getAccountGroupId()));

			destBranch = cache.getGenericBranchDetailCache(request, JSPUtility.GetLong(request, "LRDestinationBranchId_"+i));

			inValueObject.put("bookedForAccountGroupId", destBranch.getAccountGroupId());
			inValueObject.put(GroupConfigurationPropertiesDTO.GROUP_CONFIGURATION, cache.getGroupConfiguration(request, executive.getAccountGroupId()));
			inValueObject.put("accountGroupId", executive.getAccountGroupId());

			wayBill	= createWayBillDTO.getWayBillDTO(inValueObject);
			wayBill.setStatus(WayBill.WAYBILL_STATUS_DISPATCHED);
			wayBill.setBookingMode(BookingModeConstant.BOOKING_MODE_MANUAL_LS_ID);

			return wayBill;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private WayBillInfo createWayBillInfodto(final HttpServletRequest request, final double taxes, final CreateWayBillInfoDTO  createWayBillInfoDTO, final int i,final HashMap<Long, String> 	bookingChargesConfigMap)throws Exception {
		ValueObject			inValueObject	= null;
		Branch				srcBranch		= null;
		Branch				destBranch		= null;
		var 				otherCharges	= 0.0;
		try {

			inValueObject = new ValueObject();
			inValueObject.put("amount", JSPUtility.GetDouble(request, "amount_"+i,0));
			inValueObject.put("bookingDiscount", 0.00);
			inValueObject.put("bookingDiscountPercentage",0.00);
			inValueObject.put("taxes", taxes);
			inValueObject.put("discountedAmount", JSPUtility.GetDouble(request, "amount_"+i,0));
			inValueObject.put("isWayBillGrandTotalRoundOffAllow", isWayBillGrandTotalRoundOffAllow);
			inValueObject.put("diffAmtAfterRoundOffForOther",JSPUtility.GetDouble(request, "diffAmtAfterRoundOffForOther", 0));
			inValueObject.put("wayBillTypeId", JSPUtility.GetLong(request, "LRType_"+i));
			inValueObject.put("wbCreationCategory", ActionConstants.TRANSPORT_MANUAL);
			inValueObject.put("sourceBranchId", JSPUtility.GetLong(request, "LRSourceBranchId_"+i));
			inValueObject.put("destinationBranchId", JSPUtility.GetLong(request, "LRDestinationBranchId_"+i));
			inValueObject.put(Executive.EXECUTIVE, executive);
			calenderValueObject.put("dateStr", request.getParameter("LRDate_"+i));
			inValueObject.put("date", Utility.getDateTimeFromString(calenderValueObject));
			inValueObject.put("createDate", createDate);
			inValueObject.put("bookingType", TransportCommonMaster.BOOKING_TYPE_SUNDRY_ID);

			if(JSPUtility.GetShort(request,"deliveryTo_"+i,(short)0) == 0)
				inValueObject.put("deliveryTo", TransportCommonMaster.DELIVERY_TO_BRANCH_ID);
			else
				inValueObject.put("deliveryTo", JSPUtility.GetShort(request,"deliveryTo_"+i));

			if(bookingChargesConfigMap!=null)
				for(final Map.Entry<Long, String> entry : bookingChargesConfigMap.entrySet())
					otherCharges += JSPUtility.GetDouble(request, StringUtils.trim(entry.getValue())+"_"+i,0);

			inValueObject.put("otherCharges",otherCharges);
			srcBranch = cache.getGenericBranchDetailCache(request, JSPUtility.GetLong(request, "LRSourceBranchId_"+i));
			inValueObject.put("handlingBranchId", ActionStaticUtil.getHandlingBranchIdByBranchId(request, srcBranch, executive.getAccountGroupId()));

			destBranch = cache.getGenericBranchDetailCache(request, JSPUtility.GetLong(request, "LRDestinationBranchId_"+i));
			inValueObject.put("bookedForAccountGroupId", destBranch.getAccountGroupId());
			inValueObject.put(GroupConfigurationPropertiesDTO.GROUP_CONFIGURATION, cache.getGroupConfiguration(request, executive.getAccountGroupId()));
			inValueObject.put("accountGroupId", executive.getAccountGroupId());

			return createWayBillInfoDTO.createDTOForInsertion(inValueObject);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		} finally {
			inValueObject	= null;
			srcBranch		= null;
			destBranch		= null;
		}
	}

	private ConsignmentDetails[] createConsignmentsdto(final HttpServletRequest request,final WayBill  wayBill ,final int i, final CreateConsignmentDetailsDTO	createConsignmentDetailsDTO, final Map<Object, Object> manualLSconfigHM) throws Exception {
		ValueObject				inValueObject 		= null;

		try {
			final var 		quantity 			= JSPUtility.GetLong(request, "quantity_"+i,0);
			final var 		typeofPackingId 	= JSPUtility.GetLong(request, "packingType_"+i,0);
			final var		consignmentGoodsId	= JSPUtility.GetLong(request, "consignmentGoodsId_"+i,0);
			final Double 	actualWeightKg 		= JSPUtility.GetDouble(request, "actualWeight_"+i,0);
			var 			chargedWeightKg 	= actualWeightKg;
			final Double 	consignmentAmount	= JSPUtility.GetDouble(request, "amount_"+i,0);
			final var 		saidToContain 		= JSPUtility.GetString(request, "saidToContain_"+i,null);

			inValueObject 		= new ValueObject();

			final var	setDefaultArticalType 		= (boolean) manualLSconfigHM.getOrDefault(ManualLSConfigurationConstant.SET_DEFAULT_ARTICAL_TYPE, false);
			final var	showActualAndChargeWeight 	= (boolean) manualLSconfigHM.getOrDefault(ManualLSConfigurationConstant.SHOW_ACTUAL_AND_CHARGE_WEIGHT, false);

			if(setDefaultArticalType)
				inValueObject.put("articalTypeMasterId", manualLSconfigHM.getOrDefault(ManualLSConfigurationConstant.SET_DEFAULT_ARTICAL_TYPE_MASTER_ID, 0));
			else
				inValueObject.put("articalTypeMasterId",0);

			if(showActualAndChargeWeight)
				chargedWeightKg	= JSPUtility.GetDouble(request, "chargeWeight_"+i,0);

			inValueObject.put("length",JSPUtility.GetDouble(request, "length", 0.00));
			inValueObject.put("height",JSPUtility.GetDouble(request, "height", 0.00));
			inValueObject.put("breadth",JSPUtility.GetDouble(request, "breadth", 0.00));
			inValueObject.put(Executive.EXECUTIVE,executive);

			final var	values = typeofPackingId + "_" + actualWeightKg + "_" + chargedWeightKg + "_" + null + "_" + null + "_" + null + "_" + consignmentAmount + "_" + quantity + "_" + saidToContain + "_" + consignmentGoodsId;

			inValueObject.put("values", values);
			inValueObject.put("wayBill", wayBill);

			return createConsignmentDetailsDTO.getConsignmentDetailsDTO(inValueObject);

		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private CustomerDetails createConsignorDto(final HttpServletRequest request, final WayBill wayBill, final CorporateAccount corporateAccount, final int i, final CreateCustomerDetailsDTO  createCustomerDetailsDto) throws Exception {
		ValueObject				inValueObject		= null;

		try {
			final var branch 		 = cache.getGenericBranchDetailCache(request, wayBill.getSourceBranchId());
			final var consignorId = JSPUtility.GetLong(request,"consignorId_"+i, 0);

			inValueObject = new ValueObject();

			inValueObject.put(Executive.EXECUTIVE, executive);

			inValueObject.put("cityId", 0);
			inValueObject.put("stateId", branch.getStateId());
			inValueObject.put("countryId", branch.getCountryId());
			inValueObject.put("customerType", CustomerDetails.CUSTOMER_TYPE_CONSIGNOR_ID);
			inValueObject.put("customerName", StringUtils.upperCase(JSPUtility.GetString(request, "consignorName_" + i)));
			inValueObject.put("billingPartyId", JSPUtility.GetLong(request,"billingPartyId_"+i, 0));
			inValueObject.put("gstn", StringUtils.upperCase(JSPUtility.GetString(request, "consignorGstn_" + i, "")));

			if(corporateAccount != null){
				inValueObject.put("address", corporateAccount.getAddress()); // Do not make it null
				inValueObject.put("phoneNumber", corporateAccount.getPhoneNumber() != null ? corporateAccount.getPhoneNumber() : "0000000000");
			}else{
				inValueObject.put("address", ""); // Do not make it null
				inValueObject.put("phoneNumber", "0000000000");
			}

			if(wayBill.getWayBillTypeId()== WayBillType.WAYBILL_TYPE_CREDIT){
				inValueObject.put("partyType", CorporateAccount.PARTY_TYPE_TBB);
				if((executive.getAccountGroupId() == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_TARASVIN_TRANSPORT
						|| executive.getAccountGroupId() == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_VEGA_TRANSPORT
						|| executive.getAccountGroupId() == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_KHTC
						|| executive.getAccountGroupId() == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_HTC
						|| executive.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNT_GROUP_ID_RAMAN_HOLDING
						|| executive.getAccountGroupId() == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_ACIPL) && consignorId <= 0){
					inValueObject.put("corporateAccountId", 0);
					inValueObject.put("address", "");
					inValueObject.put("phoneNumber", "0000000000");
				} else
					inValueObject.put("corporateAccountId", consignorId);
			} else {
				inValueObject.put("partyType", CorporateAccount.PARTY_TYPE_GENERAL);
				inValueObject.put("corporateAccountId", JSPUtility.GetLong(request,"consignorId_"+i, 0));
			}

			inValueObject.put("contactPerson", "");
			inValueObject.put("emailAddress", null);
			inValueObject.put("faxNumber", null);
			inValueObject.put("department", null);
			inValueObject.put("consignorPin", 0);

			return createCustomerDetailsDto.getCustomerDetailsDTO(inValueObject);

		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		} finally {
			inValueObject	= null;
		}
	}

	private CustomerDetails createConsigneeDto(final HttpServletRequest request, final WayBill wayBill, final int i, final CreateCustomerDetailsDTO  createCustomerDetailsDto) throws Exception {
		ValueObject				inValueObject		= null;

		try {
			final var branch = cache.getGenericBranchDetailCache(request, wayBill.getSourceBranchId());
			inValueObject = new ValueObject();
			inValueObject.put(Executive.EXECUTIVE, executive);

			inValueObject.put("cityId", 0);
			inValueObject.put("stateId", branch.getStateId());
			inValueObject.put("countryId", branch.getCountryId());
			inValueObject.put("partyType", CorporateAccount.PARTY_TYPE_GENERAL);
			inValueObject.put("address", ""); // Do not make it null
			inValueObject.put("phoneNumber", "0000000000");
			inValueObject.put("customerType", CustomerDetails.CUSTOMER_TYPE_CONSIGNEE_ID);
			inValueObject.put("customerName", StringUtils.upperCase(JSPUtility.GetString(request, "consigneeName_" + i)));
			inValueObject.put("gstn", StringUtils.upperCase(JSPUtility.GetString(request, "consigneeGstn_" + i, "")));
			inValueObject.put("billingPartyId", 0);
			inValueObject.put("corporateAccountId", JSPUtility.GetLong(request,"consigneeId_"+i, 0));
			inValueObject.put("contactPerson", "");
			inValueObject.put("emailAddress", null);
			inValueObject.put("faxNumber", null);
			inValueObject.put("department", null);
			inValueObject.put("consignorPin", 0);

			return createCustomerDetailsDto.getCustomerDetailsDTO(inValueObject);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		} finally {
			inValueObject	= null;
		}
	}

	private WayBillBookingCharges[] createManualChargesDto(final HttpServletRequest request,final WayBill wayBill, final int k, final CreateWayBillBookingChargeDTO  createWayBillBookingChargeDTO,final HashMap<Long, String> bookingChargesConfigMap) throws Exception {
		try {
			final var	inValueObject 		  = new ValueObject();
			final var	wayBillChargeAmountHM = new HashMap<Long, Double>();

			var	charges = cache.getBookingCharges(request, wayBill.getSourceBranchId());

			if(charges == null)
				charges = ChargeTypeMasterDao.getInstance().getChargeConfiguration(executive.getAccountGroupId(), 0, wayBill.getSourceBranchId(), ChargeTypeMaster.WAYBILL_CHARGETYPE_BOOKING);

			inValueObject.put(Executive.EXECUTIVE, executive);
			inValueObject.put("charges", charges);

			if(ObjectUtils.isNotEmpty(charges))
				for (final ChargeTypeModel charge : charges)
					if(charge.getChargeTypeMasterId()== BookingChargeConstant.FREIGHT)
						wayBillChargeAmountHM.put(charge.getChargeTypeMasterId(), JSPUtility.GetDouble(request,"amount_"+k,0));
					else if(bookingChargesConfigMap!=null && bookingChargesConfigMap.get(charge.getChargeTypeMasterId())!=null)
						wayBillChargeAmountHM.put(charge.getChargeTypeMasterId(),JSPUtility.GetDouble(request, StringUtils.trim(bookingChargesConfigMap.get(charge.getChargeTypeMasterId()))+"_"+k,0));
					else
						wayBillChargeAmountHM.put(charge.getChargeTypeMasterId(),0.00);

			inValueObject.put("wayBillChargeAmountHM", wayBillChargeAmountHM);

			return createWayBillBookingChargeDTO.getCWayBillBookingChargeDTO(inValueObject);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private ConsignmentSummary createConsignmentSummaryDto(final HttpServletRequest request,final WayBill wayBill, final CorporateAccount corporateAccount, final int i, final CreateConsignmentSummaryDTO  createConsignmentSummaryDTO, final long crossingAgentId, final Map<Object, Object> manualLSconfigHM) throws Exception {
		short				taxBy			= 0;

		try {
			final var	inValueObject = new ValueObject();

			final var	privateMarka  				= (boolean) manualLSconfigHM.getOrDefault(ManualLSConfigurationConstant.IS_PRIVATE_MARKA_SHOW, false);
			final var	showActualAndChargeWeight  	= (boolean) manualLSconfigHM.getOrDefault(ManualLSConfigurationConstant.SHOW_ACTUAL_AND_CHARGE_WEIGHT, false);

			inValueObject.put(Executive.EXECUTIVE, executive);
			inValueObject.put("wayBill", wayBill);

			inValueObject.put("saidToContain", JSPUtility.GetString(request, "saidToContain_"+i,"null"));
			inValueObject.put("actualWeight", JSPUtility.GetDouble(request, "actualWeight_"+i,0));

			if(privateMarka)
				inValueObject.put("privateMarka", JSPUtility.GetString(request, "privateMarka_"+i));

			inValueObject.put("quantity", JSPUtility.GetLong(request,"quantity_"+i,0));
			inValueObject.put("amount", JSPUtility.GetDouble(request,"amount_"+i,0));

			if(JSPUtility.GetShort(request,"deliveryTo_"+i,(short)0) == 0)
				inValueObject.put("deliveryTo", TransportCommonMaster.DELIVERY_TO_BRANCH_ID);
			else
				inValueObject.put("deliveryTo", JSPUtility.GetShort(request,"deliveryTo_"+i));

			if(executive.getAccountGroupId() == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_SNGT
					|| executive.getAccountGroupId() == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_KATIRA) {
				if(wayBill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID) {
					if(corporateAccount!= null && corporateAccount.isServiceTaxRequired())
						taxBy = TaxPaidByConstant.TAX_PAID_BY_TRANSPORTER_ID;
					else
						taxBy = TaxPaidByConstant.TAX_PAID_BY_CONSINGOR_ID;
				} else if(wayBill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY)
					if(corporateAccount!= null && corporateAccount.isServiceTaxRequired())
						taxBy = TaxPaidByConstant.TAX_PAID_BY_TRANSPORTER_ID;
					else
						taxBy = TaxPaidByConstant.TAX_PAID_BY_CONSINGEE_ID;
			} else
				taxBy = TaxPaidByConstant.TAX_PAID_BY_CONSINGOR_ID;

			inValueObject.put("taxBy", taxBy);

			if(showActualAndChargeWeight)
				inValueObject.put("chargeWeight", JSPUtility.GetDouble(request, "chargeWeight_"+i,0));
			else
				inValueObject.put("chargeWeight", JSPUtility.GetDouble(request, "actualWeight_"+i,0));

			inValueObject.put("bookingTypeId", BookingTypeConstant.BOOKING_TYPE_SUNDRY_ID);

			if(crossingAgentId > 0)
				inValueObject.put("paymentType", PaymentTypeConstant.PAYMENT_TYPE_CROSSING_CREDIT_ID);
			else if(wayBill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID)
				inValueObject.put("paymentType", PaymentTypeConstant.PAYMENT_TYPE_CASH_ID);
			else
				inValueObject.put("paymentType", (short)0);

			inValueObject.put("chargeTypeId", TransportCommonMaster.CHARGETYPE_ID_FIX);
			inValueObject.put("invoiceNo", JSPUtility.GetString(request,"invoiceNo_"+i,null));
			inValueObject.put("invoiceDate", null);
			inValueObject.put("deliveryPlace", null);
			inValueObject.put("commodityMasterId", 0);
			inValueObject.put("declaredValue", 0.00);
			inValueObject.put("deliveryPlaceId", 0);
			inValueObject.put("vehicleTypeId", (short)0);
			inValueObject.put("freightUptoBranchId", 0);
			inValueObject.put("conveyedCopyAttach", false);

			if(wayBill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT)
				inValueObject.put("podRequired", PODRequiredConstant.POD_REQUIRED_YES_ID);
			else
				inValueObject.put("podRequired", PODRequiredConstant.POD_REQUIRED_NO_ID);

			inValueObject.put("declaredValue", JSPUtility.GetDouble(request,"declaredValue_"+i,0));

			return createConsignmentSummaryDTO.getConsignmentSummaryDTO(inValueObject);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private DispatchSummary createDispatchSummaryDTO (final DispatchLedger dispatchLedger, final WayBill wayBill, final CreateDispatchSummaryDTO  createDispatchSummaryDTO, final ConsignmentSummary consignmentSummary) throws Exception {
		ValueObject		inValueObject	= null;

		try {

			inValueObject = new ValueObject();
			inValueObject.put(Executive.EXECUTIVE, executive);
			inValueObject.put("dispatchLedger", dispatchLedger);
			inValueObject.put("wayBill", wayBill);
			inValueObject.put("consignmentSummary", consignmentSummary);
			return createDispatchSummaryDTO.getDispatchSummaryDTO(inValueObject);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private WayBillHistory createWayBillHistoryDTO (final WayBill wayBill, final CreateWayBillHistoryDTO  createWayBillHistoryDTO) throws Exception {
		ValueObject		inValueObject	= null;

		try {
			inValueObject = new ValueObject();

			inValueObject.put("wayBill", wayBill);
			inValueObject.put("status", WayBill.WAYBILL_STATUS_BOOKED);
			return createWayBillHistoryDTO.getWayBillHistoryDTO(inValueObject);

		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private DispatchLedger populateDispatchLedger(final HttpServletRequest request ,final String lsNumber, final Timestamp manualLSDate, final CreateDispatchLedgerDTO  createDispatchLedgerDTO) throws Exception {
		VehicleNumberMaster	vehicle	  		= null;
		Branch				srcBranch		= null;
		ValueObject			inValueObject	= null;
		var				sourceBranchId	= 0L;
		var				txnTypeId		= 0L;
		var				isCrossing		= false;

		try {

			inValueObject  = new ValueObject();

			sourceBranchId = JSPUtility.GetLong(request, "LSSourceBranchId");

			inValueObject.put(Executive.EXECUTIVE,executive);

			inValueObject.put("LSSourceCityId",0);
			inValueObject.put("LSSourceBranchId",sourceBranchId);

			inValueObject.put("LSDestinationCityId",0);
			inValueObject.put("LSDestinationBranchId",JSPUtility.GetLong(request, "LSDestinationBranchId"));
			inValueObject.put("trip",null);

			if(request.getParameter("isManualDispatch")!= null) {
				if(manualLSDate != null){
					inValueObject.put("isManual", true);
					inValueObject.put("tripDateTime", manualLSDate);
				} else {
					inValueObject.put("isManual", true);
					inValueObject.put("tripDateTime", createDate);
				}
			} else {
				inValueObject.put("isManual", false);
				inValueObject.put("tripDateTime", createDate);
			}

			inValueObject.put("createDate", createDate);
			inValueObject.put("vehicleNumber", StringUtils.upperCase(JSPUtility.GetString(request, "LSVehicleNumber")));
			inValueObject.put("vehicleNumberMasterId", JSPUtility.GetLong(request, "LSVehicleNumberId"));
			inValueObject.put(Constant.CROSSING_AGENT_ID, crossingAgentId);

			if(crossingAgentId > 0 && JSPUtility.GetLong(request, "LSVehicleNumberId") == 0){
				vehicle = cache.getVehicleNumberByNumber(request, executive.getAccountGroupId(), TransportCommonMaster.DEFAULT_VEHICLE_NAME);
				if(vehicle == null)
					return null;
				inValueObject.put("vehicleNumber", vehicle.getVehicleNumber());
				inValueObject.put("vehicleNumberMasterId", vehicle.getVehicleNumberMasterId());
			}

			if (crossingAgentId > 0) {
				isCrossing	= true;
				txnTypeId = WayBillCrossing.TRANSACTION_TYPE_BOOKING_CROSSING;
			}

			inValueObject.put("driverName", null);
			inValueObject.put("cleanerName", null);
			inValueObject.put("remark", null);
			inValueObject.put("lsNumber", lsNumber);

			srcBranch = cache.getGenericBranchDetailCache(request, sourceBranchId);
			inValueObject.put("lsBranchId", ActionStaticUtil.getHandlingBranchIdByBranchId(request, srcBranch, executive.getAccountGroupId()));
			inValueObject.put("superVisor", "");
			inValueObject.put("driver1Insert", 0);
			inValueObject.put("driver2Name", null);
			inValueObject.put("driver2Insert", 0);
			inValueObject.put("driver1", null);
			inValueObject.put("driver2", null);
			inValueObject.put("vehicleAgent", 0);
			inValueObject.put("totalActualWeight", 0);
			inValueObject.put("totalNoOfPackages", 0);
			inValueObject.put("totalNoOfWayBills", 0);
			inValueObject.put("totalNoOfDoorDelivery", 0);
			inValueObject.put("totalNoOfForms", 0);
			inValueObject.put("totalNoOfGodownArticles", 0);
			inValueObject.put("totalNoOfCrossingArticles", 0);
			inValueObject.put("totalNoOfDoorDeliveryArticles", 0);
			inValueObject.put("isCrossing", isCrossing);
			inValueObject.put("txnTypeId", txnTypeId);
			inValueObject.put("driver1MobileNumber1", null);
			inValueObject.put("driver1MobileNumber2", null);
			inValueObject.put("isDDDV", false);
			inValueObject.put("isGodown", false);
			inValueObject.put("bookingTypeId", TransportCommonMaster.BOOKING_TYPE_SUNDRY_ID);
			inValueObject.put("isGodown", false);
			inValueObject.put("typeOfLS", DispatchLedger.TYPE_OF_LS_ID_NORMAL);

			return createDispatchLedgerDTO.getDispatchLedgerDTO(inValueObject);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}
}