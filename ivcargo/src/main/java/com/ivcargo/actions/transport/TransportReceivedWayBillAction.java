package com.ivcargo.actions.transport;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringUtils;

import com.businesslogic.ArriveReceiveAndDispatchBLL;
import com.businesslogic.CreateBLHPVBLL;
import com.businesslogic.ReceivablesBLL;
import com.businesslogic.ReceiveAndDeliveryBLL;
import com.businesslogic.SequenceCounterValidationBLL;
import com.businesslogic.TrafficBLL;
import com.businesslogic.bankpayment.BankPaymentBLL;
import com.businesslogic.properties.GeneralConfiguration;
import com.businesslogic.properties.impl.PropertyConfigValueBLLImpl;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.bll.impl.sequencecounter.SequenceCounterBllImpl;
import com.iv.bll.impl.shortexcessdamage.DamageReceiveBllImpl;
import com.iv.bll.impl.shortexcessdamage.ExcessReceiveBllImpl;
import com.iv.bll.impl.shortexcessdamage.ShortReceiveBllImpl;
import com.iv.constant.properties.BLHPVPropertiesConstant;
import com.iv.constant.properties.GenerateCashReceiptPropertiesConstant;
import com.iv.constant.properties.LrViewConfigurationPropertiesConstant;
import com.iv.constant.properties.lhpv.LHPVPropertiesConstant;
import com.iv.constant.properties.master.SyncWithNexusPropertiesConstant;
import com.iv.dao.impl.lhpv.LHPVDaoImpl;
import com.iv.dto.TransportListMaster;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.dto.constant.VehicleOwnerConstant;
import com.iv.dto.constant.WayBillDeliveryTypeConstant;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.constant.AccountGroupConstant;
import com.iv.utils.constant.Constant;
import com.iv.utils.constant.PodWayBillPropertiesConstant;
import com.iv.utils.constant.properties.ReceiveAndDeliveryConfigurationConstant;
import com.iv.utils.constant.properties.ReceiveConfigurationPropertiesConstant;
import com.iv.utils.constant.properties.ServerIPAddressConfigurationConstant;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.exception.ExceptionProcess;
import com.iv.utils.utility.CollectionUtility;
import com.iv.utils.utility.Utility;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.ConsignmentSummaryDao;
import com.platform.dao.CustomerDetailsDao;
import com.platform.dao.DeliverySequenceCounterDao;
import com.platform.dao.DispatchLedgerDao;
import com.platform.dao.ExecutiveDao;
import com.platform.dao.ReceivedSummaryDao;
import com.platform.dao.VehiclePendingForArrivalDao;
import com.platform.dao.VehiclePendingForUnLoadingDao;
import com.platform.dto.AccountGroupTieUpConfiguration;
import com.platform.dto.BankPayment;
import com.platform.dto.Branch;
import com.platform.dto.ConfigParam;
import com.platform.dto.ConsignmentSummary;
import com.platform.dto.DeliveryContactDetails;
import com.platform.dto.DiscountDetails;
import com.platform.dto.Executive;
import com.platform.dto.LoadingSheetSettlement;
import com.platform.dto.PodReceiveDocument;
import com.platform.dto.PropertiesFileConstants;
import com.platform.dto.ReceiveSummaryData;
import com.platform.dto.TransportCommonMaster;
import com.platform.dto.VehiclePendingForArrival;
import com.platform.dto.VehiclePendingForUnLoading;
import com.platform.dto.WayBillTaxDetails;
import com.platform.dto.configuration.modules.BankStatementConfigurationDTO;
import com.platform.dto.configuration.modules.CashStatementConfigurationDTO;
import com.platform.dto.configuration.modules.DashBoardConfigurationDTO;
import com.platform.dto.configuration.modules.DocumentCodeConfigurationDTO;
import com.platform.dto.configuration.modules.GenerateCashReceiptDTO;
import com.platform.dto.configuration.modules.GroupConfigurationPropertiesDTO;
import com.platform.dto.configuration.modules.LrCostConfigurationDTO;
import com.platform.dto.configuration.modules.VehiclePendingForArrivalConfigurationDTO;
import com.platform.dto.constant.BookingTypeConstant;
import com.platform.dto.constant.CustomerDetailsConstant;
import com.platform.dto.constant.FeildPermissionsConstant;
import com.platform.dto.constant.InfoForDeliveryConstant;
import com.platform.dto.constant.PODDocumentTypeConstant;
import com.platform.dto.constant.PODRequiredConstant;
import com.platform.dto.constant.PaymentTypeConstant;
import com.platform.dto.model.ChargeTypeModel;
import com.platform.resource.CargoErrorList;
import com.platform.utils.TokenGenerator;

public class TransportReceivedWayBillAction implements Action {

	public static long dispatchLedgerIdData;

	public static long getDispatchLedgerIdString() {
		return dispatchLedgerIdData;
	}

	public static void setDispatchLedgerIdString(final long dispatchLedgerIdString) {
		TransportReceivedWayBillAction.dispatchLedgerIdData = dispatchLedgerIdString;
	}

	private static final String TRACE_ID = "TransportReceivedWayBillAction";

	HashMap<?, ?>								execFldPermissions									= null;
	boolean										subRegionExistForReceiveAndDispatch					= false;
	boolean										subRegionExistForArriveAndDispatch					= false;

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {

		HashMap<String,Object>	 					error 												= null;
		String		 								wayBillIdsForReceive 								= null;
		String[] 									wayBillToReceived									= null;
		ValueObject 								valueOutObject										= null;
		String 										arrivalDate 										= null;
		Timestamp 									manualTURDate										= null;
		ValueObject									valueObjectForBLHPV 								= null;
		String										turNumber											= null;
		ArrayList<Long> 							assignedLocationIdList 								= null;
		ValueObject									valInObj											= null;
		VehiclePendingForArrival					vehiclePendingForArrival							= null;
		VehiclePendingForUnLoading					vehiclePendingForUnLoading							= null;
		HashMap<Long, ConsignmentSummary>			consignmentSummaryHM								= null;
		var 									isManualTUR											= false;
		var										isForceReceiveFlag  								= false;
		var 									isDelivery											= false;
		var										isMarkArrived										= true;
		var										branchId											= 0L;
		final short									filter												= 3;
		List<PodReceiveDocument>       				finalPodReceiveDocumentList 		= null;
		HashMap<Long, BankPayment>					bankPaymentHM					 	= null;
		BankPayment									bankPayment							= null;
		Map<Object, Object>							receiveAndDeliveryConfig			= null;
		var										branchAbbrvnWiseCrNo				= false;
		var										sequenceNumberFormat				= 0;
		var										codeForSequenceNumberGeneration				= "";
		var										showReceiverToName					= false;
		var										shortCreditConfigLimitAllowed		= false;
		final var								tokenWiseCheckingForDuplicateTransaction= false;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	sdf    									= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			final var	createDate 								= DateTimeUtility.getCurrentTimeStamp();
			final var	cacheManip								= new CacheManip(request);
			final var	cal 									= Calendar.getInstance();

			final var	executive								= cacheManip.getExecutive(request);
			final var	manualTURNumber							= JSPUtility.GetLong(request, "manualTURNumber", 0);
			final var	turId									= JSPUtility.GetLong(request, "turId", 0);
			final var	vehicleNumberId							= JSPUtility.GetLong(request, "vehicleNumberId", 0);
			final var	vehicleNo								= JSPUtility.GetString(request, "vehicleNo", "");
			final var	truckDestinationId						= JSPUtility.GetLong(request, "truckDestinationId", 0);
			final var	truckDestinationName					= JSPUtility.GetString(request, "truckDestinationName", "");
			final var	driver									= JSPUtility.GetString(request, "driver", "");
			final var	cleaner									= JSPUtility.GetString(request, "cleaner", "");
			subRegionExistForReceiveAndDispatch		= JSPUtility.GetBoolean(request, "subRegionExistForReceiveAndDispatch", false);
			subRegionExistForArriveAndDispatch		= JSPUtility.GetBoolean(request, "subRegionExistForArriveAndDispatch", false);
			var			receiveAndDelivery						= JSPUtility.GetBoolean(request, "receiveAndDelivery", false);
			final var	receiveAndDeliveryPermission			= JSPUtility.GetBoolean(request, "receiveAndDelivery", false);
			final var	token									= JSPUtility.GetString(request, "token", "");

			final var	srcBranch								= cacheManip.getGenericBranchDetailCache(request , executive.getBranchId());
			final var	configParamHM							= cacheManip.getConfigParamData(request, executive.getAccountGroupId());
			final var	noOfDays    							= configParamHM.containsKey(ConfigParam.CONFIG_KEY_MAX_DAYS_OF_OPERATION_BEFORE_CASHSTATEMENT_ENTRY_ID) ? configParamHM.get(ConfigParam.CONFIG_KEY_MAX_DAYS_OF_OPERATION_BEFORE_CASHSTATEMENT_ENTRY_ID) : 0;

			final var dispatchLedgerId 			= JSPUtility.GetLong(request, "DispatchLedgerId", 0);

			if (request.getSession().getAttribute("receiveDispatchLedgerId") != null) {
				error.put("errorCode", CargoErrorList.RECEIVE_ERROR);
				error.put("errorDescription", "Request already submitted, please wait!");
				request.setAttribute("cargoError", error);
				request.setAttribute("nextPageToken", "failure");
				return;
			}

			final var	executiveIV	= new com.iv.dto.Executive();

			executiveIV.setExecutiveId(executive.getExecutiveId());
			executiveIV.setAccountGroupId(executive.getAccountGroupId());
			executiveIV.setBranchId(executive.getBranchId());

			request.getSession().setAttribute("receiveDispatchLedgerId", dispatchLedgerId);

			final var	shortCreditWayBillIdList 		= new ArrayList<Long>();
			final var	wbForTUR						= new ArrayList<LoadingSheetSettlement>();

			final var	receiveConfig					= cacheManip.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.RECEIVE);
			final var	branchIdForBlhpvIfAllLrsFTL		= receiveConfig.getOrDefault(ReceiveConfigurationPropertiesConstant.BRANCH_ID_FOR_BLHPV_IF_ALL_LRS_FTL, 0L);
			final var	automaticCreateBlhpvIfAllLrsFTL	= (boolean)receiveConfig.getOrDefault(ReceiveConfigurationPropertiesConstant.AUTOMATIC_CREATE_BLHPV_IF_ALL_LRS_FTL, false);


			final var	documentCodeConfig				= cacheManip.getDocumentCodeConfiguration(request, executive.getAccountGroupId());

			if(receiveAndDelivery)
				receiveAndDeliveryConfig			= cacheManip.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.RECEIVE_AND_DELIVERY);

			final Map<Object, Object>	combinedReceiveConfig	= new HashMap<>(receiveConfig);

			if(receiveAndDeliveryConfig != null) combinedReceiveConfig.putAll(receiveAndDeliveryConfig);

			final var	isRangeCheckInManualTUR         		= (boolean) combinedReceiveConfig.getOrDefault(ReceiveConfigurationPropertiesConstant.RANGE_CHECK_IN_MANUAL_TUR, true);
			final var	isReciveDlyAlwedForDlyToPssngr			= (boolean) combinedReceiveConfig.getOrDefault(ReceiveConfigurationPropertiesConstant.IS_RECEIVE_DELIVERY_ALLOWED_FOR_DELIVERY_TO_PASSENGER,false);
			final var	isReceiveDeliveryAllowedForFTL			= (boolean) combinedReceiveConfig.getOrDefault(ReceiveConfigurationPropertiesConstant.IS_RECEIVE_DELIVERY_ALLOWED_FOR_FTL,false);
			final var	isDuplicateTURGenerationAllow			= (boolean) combinedReceiveConfig.getOrDefault(ReceiveConfigurationPropertiesConstant.IS_DUPLICATE_TUR_GENERATION_ALLOW,false);

			request.setAttribute(ReceiveAndDeliveryConfigurationConstant.SHOW_HAMALI_DETAILS_PRINT, combinedReceiveConfig.getOrDefault(ReceiveAndDeliveryConfigurationConstant.SHOW_HAMALI_DETAILS_PRINT,false));

			if(receiveAndDelivery) {
				branchAbbrvnWiseCrNo				= (Boolean) combinedReceiveConfig.getOrDefault(ReceiveAndDeliveryConfigurationConstant.BRANCH_ABBRVN_WISE_CR_NO, false);
				sequenceNumberFormat				= (Integer) combinedReceiveConfig.getOrDefault(ReceiveAndDeliveryConfigurationConstant.SEQUENCE_NUMBER_FORMAT, 0);
				codeForSequenceNumberGeneration		= Utility.getString(combinedReceiveConfig, ReceiveAndDeliveryConfigurationConstant.CODE_FOR_SEQUENCE_NUMBER_GENERATION);
				showReceiverToName					= (Boolean) combinedReceiveConfig.getOrDefault(ReceiveAndDeliveryConfigurationConstant.SHOW_RECEIVER_TO_NAME, false);
				shortCreditConfigLimitAllowed		= (Boolean) combinedReceiveConfig.getOrDefault(ReceiveAndDeliveryConfigurationConstant.SHORT_CREDIT_CONFIG_LIMIT_ALLOWED, false);
			}

			if(subRegionExistForArriveAndDispatch) {
				wayBillIdsForReceive		= JSPUtility.GetString(request, "wayBillsForReceive", "");
				wayBillToReceived			= CollectionUtility.getStringArrayFromString(wayBillIdsForReceive, Constant.COMMA);
			} else if(request.getParameterValues("wayBills") != null) {
				wayBillToReceived		= request.getParameterValues("wayBills");
				wayBillIdsForReceive	= CollectionUtility.getStringFromStringArray(wayBillToReceived);
			}

			final var	showTurPrintAfterReceive			= (Boolean) combinedReceiveConfig.getOrDefault(ReceiveConfigurationPropertiesConstant.SHOW_TUR_PRINT_AFTER_RECEIVE, true);
			final var	showManualDateForReceive			= (Boolean) combinedReceiveConfig.getOrDefault(ReceiveConfigurationPropertiesConstant.SHOW_MANUAL_DATE_FOR_RECEIVE, true);
			final var	branchCodeWiseTURNumberGeneration	= (Boolean) combinedReceiveConfig.getOrDefault(ReceiveConfigurationPropertiesConstant.BRANCH_CODE_WISE_TUR_NUMBER_GENERATION, true);
			final var	isPrintDuplicate					= (Boolean) combinedReceiveConfig.getOrDefault(ReceiveConfigurationPropertiesConstant.IS_PRINT_DUPLICATE, false);

			final var	generalConfiguration				= cacheManip.getGeneralConfiguration(request, executive.getAccountGroupId());
			final var	bankPaymentOperationRequired		= generalConfiguration.getBoolean(GeneralConfiguration.BANK_PAYMENT_OPERATION_REQUIRED, false);
			final var	podConfiguration					= cacheManip.getPODWayBillConfiguration(request, executive.getAccountGroupId());
			final var	setPODRequiredBasedOnTBBParty		= (boolean) podConfiguration.getOrDefault(PodWayBillPropertiesConstant.SET_POD_REQUIRED_BASED_ON_TBB_PARTY, false);
			final var	showPodDocuments 	  				= (boolean) podConfiguration.getOrDefault(PodWayBillPropertiesConstant.SHOW_POD_DOCUMENTS, false);

			final var	wayBillsForDispatch				    = CollectionUtility.getStringListFromString(JSPUtility.GetString(request, "wayBillsForDispatch", ""), ",");

			request.setAttribute(ReceiveConfigurationPropertiesConstant.SHOW_TUR_PRINT_AFTER_RECEIVE, showTurPrintAfterReceive);
			request.setAttribute(ReceiveConfigurationPropertiesConstant.IS_PRINT_DUPLICATE, isPrintDuplicate);

			execFldPermissions	= cacheManip.getExecutiveFieldPermission(request);

			final var	vehiclePendingForArrivalObj		= PropertyConfigValueBLLImpl.getInstance().getConfiguration(executive, PropertiesFileConstants.VEHICLE_PENDING_FOR_ARRIVAL);
			final var	isVehiclePendingForArrival 		= vehiclePendingForArrivalObj.getBoolean(VehiclePendingForArrivalConfigurationDTO.VEHICLE_PENDING_FOR_ARRIVAL);

			if(isVehiclePendingForArrival) {
				isMarkArrived			= DispatchLedgerDao.getInstance().isAllowedForCheckMarkArrived(dispatchLedgerId);
				final var	isDDDVOrInterBranch		= DispatchLedgerDao.getInstance().checkDDDVForDispatchLedger(dispatchLedgerId);

				if(isDDDVOrInterBranch)
					isMarkArrived = false;

				if(isMarkArrived && !isDDDVOrInterBranch) {
					assignedLocationIdList = cacheManip.getAssignedLocationsIdListByLocationIdId(request, executive.getBranchId(), executive.getAccountGroupId());

					if(!assignedLocationIdList.contains(executive.getBranchId()))
						assignedLocationIdList.add(executive.getBranchId());

					valInObj	= new ValueObject();
					valInObj.put("lsDesBranchId", request.getParameter("lsDesBranchId"));
					valInObj.put("assignedLocationIdList", assignedLocationIdList);
					valInObj.put("isForceReceive", request.getParameter("isForceReceive"));

					isForceReceiveFlag = TrafficBLL.isForceReceive(valInObj);

					if(isForceReceiveFlag)
						branchId = executive.getBranchId();
					else
						branchId = JSPUtility.GetLong(request, "lsDesBranchId", 0);

					final var	inValueObject = new ValueObject();
					inValueObject.put("branchIds", Long.toString(branchId));
					inValueObject.put("vehicleNumberMasterId",vehicleNumberId);
					inValueObject.put("filter",filter);

					inValueObject.put("lorryHireId", JSPUtility.GetLong(request, "lorryHireId", 0));
					System.out.println("lhpvid-->>>"+JSPUtility.GetLong(request, "lorryHireId", 0));

					inValueObject.put("lsDesBranchId",request.getParameter("lsDesBranchId"));
					inValueObject.put("isForceReceive",request.getParameter("isForceReceive"));

					final var	outValueObject = VehiclePendingForArrivalDao.getInstance().getVehiclePendingForArrivalByRouteBranchIds(inValueObject);

					if(outValueObject == null){
						error.put(CargoErrorList.ERROR_CODE, CargoErrorList.LORRYHIRE_SLIP_NOT_FOUND_FOR_VEHICLENUMBER_AND_ROUTE);
						error.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.LORRYHIRE_SLIP_NOT_FOUND_FOR_VEHICLENUMBER_AND_ROUTE_DESCRIPTION);
						request.setAttribute(CargoErrorList.CARGO_ERROR, error);
						request.setAttribute("nextPageToken", Constant.FAILURE);
						return;
					}

					vehiclePendingForArrival = (VehiclePendingForArrival) outValueObject.get("vehiclePendingForArrival");

					if(!vehiclePendingForArrival.isArrived()){
						error.put(CargoErrorList.ERROR_CODE, CargoErrorList.VEHICLE_MARK_FOR_ARRIVED_ERROR);
						error.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.VEHICLE_MARK_FOR_ARRIVED_ERROR_DESCRIPTION);
						request.setAttribute(CargoErrorList.CARGO_ERROR, error);
						request.setAttribute("nextPageToken", Constant.FAILURE);
						return;
					}

					vehiclePendingForUnLoading = VehiclePendingForUnLoadingDao.getInstance().getVehiclePendingForUnLoadingByLorryHireId(vehiclePendingForArrival.getLorryHireId(), branchId);

					if(isForceReceiveFlag && vehiclePendingForUnLoading == null) {
						final var	valObjForceReceive = new ValueObject();
						valObjForceReceive.put(Executive.EXECUTIVE, executive);
						valObjForceReceive.put("lorryHireId", request.getParameter("lorryHireId"));
						valObjForceReceive.put("vehicleNumberHM", cacheManip.getALLVehicleNumberOfGroup(request, executive.getAccountGroupId()));

						TrafficBLL.insertDBEntriesForForceReceive(valObjForceReceive);

						// after entry insert must check again
						vehiclePendingForUnLoading = VehiclePendingForUnLoadingDao.getInstance().getVehiclePendingForUnLoadingByLorryHireId(vehiclePendingForArrival.getLorryHireId(), branchId);
					}

					if(vehiclePendingForUnLoading == null) {
						error.put(CargoErrorList.ERROR_CODE, CargoErrorList.VEHICLE_MARK_FOR_ARRIVED_ERROR);
						error.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.VEHICLE_MARK_FOR_ARRIVED_ERROR_DESCRIPTION);
						request.setAttribute(CargoErrorList.CARGO_ERROR, error);
						request.setAttribute("nextPageToken", Constant.FAILURE);
						return;
					}

					if(vehiclePendingForUnLoading.getStatus() == VehiclePendingForUnLoading.STATUS_PENDING_UNLOADING) {
						error.put(CargoErrorList.ERROR_CODE, CargoErrorList.VEHICLE_START_UNLOADING_ERROR);
						error.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.VEHICLE_START_UNLOADING_ERROR_DESCRIPTION);
						request.setAttribute(CargoErrorList.CARGO_ERROR, error);
						request.setAttribute("nextPageToken", Constant.FAILURE);
						return;
					}
				}
			}

			if(request.getParameter("isManualTUR") != null)
				isManualTUR = true;

			if(turId <= 0) {
				final var	sequenceCounterInValObject = new ValueObject();

				sequenceCounterInValObject.put(Executive.EXECUTIVE, executive);
				sequenceCounterInValObject.put(Constant.CREATEDATE, createDate);
				sequenceCounterInValObject.put(Constant.BRANCH_ID, executive.getBranchId());
				sequenceCounterInValObject.put(Constant.NO_OF_DAYS, noOfDays);
				sequenceCounterInValObject.put(Constant.IS_MANUAL_TUR, isManualTUR);
				sequenceCounterInValObject.put("values", wayBillToReceived);
				sequenceCounterInValObject.put("manualTURDateStr", JSPUtility.GetString(request, "manualTURDate",null));
				sequenceCounterInValObject.put(Constant.MANUAL_TUR_NUMBER, manualTURNumber);
				sequenceCounterInValObject.put("isRangeCheckInManualTUR", isRangeCheckInManualTUR);
				sequenceCounterInValObject.put(DocumentCodeConfigurationDTO.DOCUMENT_CODE_CONFIGURATION, documentCodeConfig);
				sequenceCounterInValObject.put(ReceiveConfigurationPropertiesConstant.BRANCH_CODE_WISE_TUR_NUMBER_GENERATION, branchCodeWiseTURNumberGeneration);
				sequenceCounterInValObject.put("srcBranch", srcBranch);
				sequenceCounterInValObject.put(ReceiveConfigurationPropertiesConstant.IS_DUPLICATE_TUR_GENERATION_ALLOW, isDuplicateTURGenerationAllow);

				final var	sequenceCounterValidationBLL = new SequenceCounterValidationBLL();

				if(getDispatchLedgerIdString() == 0 || getDispatchLedgerIdString() != dispatchLedgerId) {
					final var	sequenceCounterOutValObject  = sequenceCounterValidationBLL.getTURSequenceCounterValidation(sequenceCounterInValObject);

					if(Short.parseShort(sequenceCounterOutValObject.get("errorNo").toString()) != 1) {
						error.put(CargoErrorList.ERROR_CODE, sequenceCounterOutValObject.getInt(CargoErrorList.ERROR_CODE));
						error.put(CargoErrorList.ERROR_DESCRIPTION, sequenceCounterOutValObject.getString(CargoErrorList.ERROR_DESCRIPTION));
						request.setAttribute(CargoErrorList.CARGO_ERROR, error);
						request.setAttribute("nextPageToken", Constant.FAILURE);
						return;
					}

					if(sequenceCounterOutValObject.get(Constant.MANUAL_TUR_DATE) != null){
						manualTURDate = (Timestamp)sequenceCounterOutValObject.get(Constant.MANUAL_TUR_DATE);
						isManualTUR	  = true;
					}

					turNumber = sequenceCounterOutValObject.getString(Constant.TUR_NUMBER, null);
				}
			}  else {
				final var  manualTURDateStr = JSPUtility.GetString(request, "manualTURDate", null);

				if(!StringUtils.isEmpty(manualTURDateStr)) {
					manualTURDate = new Timestamp(sdf.parse(manualTURDateStr + " "+cal.get(Calendar.HOUR_OF_DAY)+":"+cal.get(Calendar.MINUTE)+":"+cal.get(Calendar.SECOND)).getTime());
					isManualTUR	  = true;
				}
			}

			final var	wayBill						= new Long[wayBillToReceived.length];
			final var	receiveSummaryDataArr		= new HashMap<Long, ReceiveSummaryData>();
			final List<Long>	wayBillListToReceive		= new ArrayList<>();
			final var	wayBillIdListForDelivery	= new ArrayList<Long>();
			final var	delValObjCol				= new HashMap<Long, ValueObject>();

			final var dispatchLedgerWBCount 	= JSPUtility.GetLong(request, "DispatchLedgerCount", 0);
			final var noOfPackages 			= JSPUtility.GetLong(request, "noOfPackages", 0);
			var unloadByExecutiveId			= JSPUtility.GetLong(request, "unloadByExecutiveId", executive.getExecutiveId());

			if(unloadByExecutiveId <= 0)
				unloadByExecutiveId		= executive.getExecutiveId();

			final var	delExecutive 	= ExecutiveDao.getInstance().findByExecutiveId(unloadByExecutiveId);
			final var	deliveryCharge 	= cacheManip.getActiveDeliveryCharges(request, delExecutive.getBranchId());

			if(receiveAndDelivery && bankPaymentOperationRequired && request.getParameterValues("paymentCheckBox") != null) {
				final var			valObjIn	= new ValueObject();

				valObjIn.put("paymentValuesArr", request.getParameterValues("paymentCheckBox"));
				valObjIn.put(ModuleIdentifierConstant.MODULE_ID, ModuleIdentifierConstant.RECEIVE_AND_DELIVERY);
				bankPaymentHM		= BankPaymentBLL.getInstance().createDtoForPayment(valObjIn, executive);
			}

			final var	podDocumentTypeArr			= PODDocumentTypeConstant.setPODDocumentTypeArrForSelection();

			if(!receiveAndDelivery && (isReciveDlyAlwedForDlyToPssngr || isReceiveDeliveryAllowedForFTL))
				consignmentSummaryHM = ConsignmentSummaryDao.getInstance().getLimitedConsignmentDetails(wayBillIdsForReceive);

			final var	deliveryPaymentType0	= JSPUtility.GetShort(request, "deliveryPaymentType_0", (short) 0);

			//Single payment for multiple LRs
			if(deliveryPaymentType0 > 0 && bankPaymentHM != null) {
				bankPayment		= bankPaymentHM.get((long) 0);
				bankPaymentHM.clear();
			}

			for(var i = 0; i < wayBillToReceived.length ; i++) {
				wayBill[i]		= Long.parseLong(wayBillToReceived[i]);

				final long	wayBillId	= wayBill[i];
				wayBillListToReceive.add(wayBillId);

				if(showPodDocuments) {
					final var	podReceiveDocumentListArr 	= createPodDocumentDto(request, podDocumentTypeArr, wayBillId, executive);

					if(finalPodReceiveDocumentList == null)
						finalPodReceiveDocumentList	= new ArrayList<>();

					if(podReceiveDocumentListArr != null && !podReceiveDocumentListArr.isEmpty())
						finalPodReceiveDocumentList.addAll(podReceiveDocumentListArr);
				}

				var	deliveryPaymentType 	= JSPUtility.GetShort(request, "deliveryPaymentType_" + wayBillId, (short) 0);

				/*
				 * Making receive summary data object
				 */
				final var	receiveSummaryData = receiveSummaryDataDTO(request, wayBillId);

				if(consignmentSummaryHM != null && consignmentSummaryHM.get(wayBillId) != null) {
					final var	conSummary	= consignmentSummaryHM.get(wayBillId);
					receiveAndDelivery	= false;

					if(isReciveDlyAlwedForDlyToPssngr && conSummary.getDeliveryTo() == InfoForDeliveryConstant.DELIVERY_TO_PASSENGER_ID
							|| isReceiveDeliveryAllowedForFTL && conSummary.getBookingTypeId() == BookingTypeConstant.BOOKING_TYPE_FTL_ID) {
						receiveAndDelivery	= true;
						deliveryPaymentType	= PaymentTypeConstant.PAYMENT_TYPE_CASH_ID;
					}
				}

				if(receiveAndDelivery && deliveryPaymentType != PaymentTypeConstant.PAYMENT_TYPE_RECEIVE_AT_GODOWN_ID) {
					isDelivery = true;
					receiveSummaryData.setGodown(false);
					final var	delValObj = new ValueObject();
					var billingCreditorId = 0L;

					final var	deliveryContactDetails	= deliveryContactDetailsDTO(request, wayBillId);

					deliveryContactDetails.setBranchId(delExecutive.getBranchId());
					deliveryContactDetails.setAccountGroupId(delExecutive.getAccountGroupId());
					deliveryContactDetails.setPaymentType(deliveryPaymentType);
					deliveryContactDetails.setBankName("");

					var	deliverString = WayBillDeliveryTypeConstant.WAYBILL_DELIVERY_TYPE_DELIVER;

					if(bankPaymentHM != null) {//don't check size
						if(deliveryPaymentType0 > 0)
							bankPaymentHM.put(wayBillId, BankPaymentBLL.createNewBankPayment(bankPayment));
						else
							bankPayment		= bankPaymentHM.get(wayBillId);

						if(bankPayment != null) {
							deliveryContactDetails.setChequeDate(bankPayment.getChequeDate());
							deliveryContactDetails.setChequeNumber(BankPaymentBLL.getChequeNumber(bankPayment));
							deliveryContactDetails.setBankName(bankPayment.getIssueBank());
							deliveryContactDetails.setChequeAmount(bankPayment.getChequeAmount());
						}
					} else if(deliveryPaymentType == PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID)
						setChequeData(request, deliveryContactDetails, wayBillId);

					if(deliveryPaymentType == PaymentTypeConstant.PAYMENT_TYPE_BILL_CREDIT_ID) {
						deliverString = WayBillDeliveryTypeConstant.WAYBILL_DELIVERY_TYPE_DELIVER;
						//set DeliveryCreditorId for Billing
						billingCreditorId = JSPUtility.GetLong(request, "selectedDeliveryCreditorId_" + wayBillId, 0);

						if(billingCreditorId > 0) {
							delValObj.put("Creditor_Payment_Module_Key", cacheManip.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_CREDITOR_PAYMENT_MODULE));
							delValObj.put("billingCreditorId", billingCreditorId);
						}

						if(setPODRequiredBasedOnTBBParty)
							deliveryContactDetails.setPodStatus(PODRequiredConstant.POD_REQUIRED_NO_ID); // 1 - pod Required For TBB
					}

					if(deliveryPaymentType == PaymentTypeConstant.PAYMENT_TYPE_CREDIT_ID)
						shortCreditWayBillIdList.add(wayBillId);

					/*
					 * Setting delivery charge for entry
					 */
					setDeliveryChargesData(request, wayBillId, deliveryCharge, delValObj);

					final var delDis = JSPUtility.GetDouble(request, "discount_" + wayBillId, 0.00);

					delValObj.put("delDis_valueObj", delDis);

					//***************************************** Discount Details (start) *******************************************

					if(delDis > 0){
						final var	discountDetails = new DiscountDetails();
						discountDetails.setWaybillId(wayBillId);
						discountDetails.setDiscountMasterId(Integer.parseInt(request.getParameter("discountTypes_" + wayBillId)));
						discountDetails.setAmount(delDis);
						discountDetails.setDiscountType(DiscountDetails.DISCOUNT_TYPE_DELIVERY);
						discountDetails.setStatus(true);
						discountDetails.setAccountGroupId(executive.getAccountGroupId());
						discountDetails.setBranchId(executive.getBranchId());

						if(isManualTUR && manualTURDate != null)
							discountDetails.setDiscountDateTime(manualTURDate);
						else
							discountDetails.setDiscountDateTime(createDate);

						discountDetails.setExecutiveId(executive.getExecutiveId());

						delValObj.put("discountDetails", discountDetails);
					}

					//***************************************** Discount Details (end) *********************************************

					delValObj.put("WayBillId_valueObj", wayBillId);
					delValObj.put("AccountId_valueObj", delExecutive.getAccountGroupId());
					delValObj.put("Executive_valueObj", delExecutive);
					delValObj.put("deliverString_valueObj", deliverString);
					delValObj.put("corporateAccountId_valueObj", billingCreditorId);
					delValObj.put("WayBillTaxTxn", null);
					delValObj.put("DeliveryContactDetails", deliveryContactDetails);
					delValObj.put("configDamerageAmount", JSPUtility.GetDouble(request, "configDamerageAmount", 0.00));
					delValObj.put("deliveryRemark_valueObj", JSPUtility.GetString(request, "remark_" + wayBillId, ""));
					delValObj.put("topayToPaidAmount", JSPUtility.GetDouble(request, "topayToPaidAmount", 0.00));
					delValObj.put("paidLoading", JSPUtility.GetDouble(request, "paidLoading_" + wayBillId, 0.00));
					delValObj.put("calculateSTOn", 0);
					delValObj.put("collectionPersonId", JSPUtility.GetLong(request, "selectedCollectionPersonId", 0));
					delValObj.put("consignorId",JSPUtility.GetLong(request, "ConsignorId_" + wayBillId, 0));
					delValObjCol.put(wayBillId, delValObj);
					wayBillIdListForDelivery.add(wayBillId);
				} else if(deliveryPaymentType == PaymentTypeConstant.PAYMENT_TYPE_RECEIVE_AT_GODOWN_ID) {
					final var	loadingSheetSettlement = new LoadingSheetSettlement();
					loadingSheetSettlement.setPaymentTypeId(deliveryPaymentType);
					loadingSheetSettlement.setSettlementAmount(0);
					loadingSheetSettlement.setSettlementDisc(0);
					loadingSheetSettlement.setDispatchLedgerId(dispatchLedgerId);
					loadingSheetSettlement.setWayBillId(wayBillId);
					wbForTUR.add(loadingSheetSettlement);
				}

				receiveSummaryDataArr.put(wayBillId, receiveSummaryData);
			}

			if(isDelivery && (isReciveDlyAlwedForDlyToPssngr || isReceiveDeliveryAllowedForFTL || receiveAndDelivery)) {
				final var valueObjectOut	= checkForDeliverySequenceCounter(delExecutive, srcBranch, combinedReceiveConfig);

				if(valueObjectOut.containsKey(CargoErrorList.ERROR_CODE)) {
					error.put(CargoErrorList.ERROR_CODE, valueObjectOut.get(CargoErrorList.ERROR_CODE));
					error.put(CargoErrorList.ERROR_DESCRIPTION, valueObjectOut.get(CargoErrorList.ERROR_DESCRIPTION));
					request.setAttribute(CargoErrorList.CARGO_ERROR, error);
					request.setAttribute("nextPageToken", Constant.FAILURE);
					return;
				}
			}

			if(executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_LMT && vehicleNumberId > 0) {
				final var	vehicle      = cacheManip.getVehicleNumber(request, executive.getAccountGroupId(), vehicleNumberId) ;

				var isAllLRsFTL = false;

				if(automaticCreateBlhpvIfAllLrsFTL)
					isAllLRsFTL 	 = LHPVDaoImpl.getInstance().isAllLRsInLHPVAreFTL(dispatchLedgerId);

				if(vehicle.getVehicleOwner() == VehicleOwnerConstant.OWN_VEHICLE_ID || automaticCreateBlhpvIfAllLrsFTL && isAllLRsFTL) {
					final var	outObject	  	= CreateBLHPVBLL.getInstance().checkForAutomatedCreateBlhpv(dispatchLedgerId);
					final var	isCreatedBlhpv 	= outObject.getBoolean("isCreateBlhpv");

					if(!isCreatedBlhpv) {
						final var	seqCounterInObj = new ValueObject();
						seqCounterInObj.put(Executive.EXECUTIVE, executive);
						seqCounterInObj.put(Constant.CREATEDATE, createDate);
						seqCounterInObj.put(Constant.NO_OF_DAYS, noOfDays);

						final var	seqCounterOutObj = SequenceCounterValidationBLL.getInstance().getBLHPVSequenceCounterValidation(seqCounterInObj);

						if(Short.parseShort(seqCounterOutObj.get("errorNo").toString()) != 1) {
							error.put(CargoErrorList.ERROR_CODE, Integer.parseInt(seqCounterOutObj.get(CargoErrorList.ERROR_CODE).toString()));
							error.put(CargoErrorList.ERROR_DESCRIPTION, seqCounterOutObj.get(CargoErrorList.ERROR_DESCRIPTION).toString());
							request.setAttribute(CargoErrorList.CARGO_ERROR, error);
							request.setAttribute("nextPageToken", Constant.FAILURE);
							return;
						}

						outObject.put(Executive.EXECUTIVE, executive);
						outObject.put(Constant.BLHPV_NUMBER, seqCounterOutObj.get(Constant.BLHPV_NUMBER).toString());
						outObject.put(Constant.CREATEDATE, createDate);
						outObject.put("isAllLRsFTL", isAllLRsFTL);
						outObject.put("branchIdForBlhpvIfAllLrsFTL", branchIdForBlhpvIfAllLrsFTL);
						valueObjectForBLHPV = CreateBLHPVBLL.getInstance().createDefaultBLHPVDTO(outObject);

						final var blhpvConfig	= cacheManip.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.BLHPV);

						valueObjectForBLHPV.put(BLHPVPropertiesConstant.IS_ALLOW_TO_PUSH_BLHPV_DATA_TO_IVFLEET, (boolean) blhpvConfig.getOrDefault(BLHPVPropertiesConstant.IS_ALLOW_TO_PUSH_BLHPV_DATA_TO_IVFLEET, false));
					}
				}
			}

			final var	isWayBillAllowForReceive = ReceivedSummaryDao.getInstance().checkWayBillsForReceive(wayBillIdsForReceive, dispatchLedgerId);

			// Check if any of the wayBills already Received
			if(isWayBillAllowForReceive) {
				final var	valueInObject	= new ValueObject();

				valueInObject.put("WayBillCount", wayBill.length);
				valueInObject.put("wayBillToReceived", wayBillIdsForReceive);
				valueInObject.put("wayBillListToReceive", wayBillListToReceive);
				valueInObject.put("wayBillsForDispatch", wayBillsForDispatch);
				valueInObject.put("waybillsStrForDispatch", JSPUtility.GetString(request, "wayBillsForDispatch", ""));
				valueInObject.put("execFldPermissions", execFldPermissions);
				valueInObject.put("DispatchLedgerWayBillCounter", dispatchLedgerWBCount);
				valueInObject.put("DispatchLedgerId", dispatchLedgerId);
				valueInObject.put(Executive.EXECUTIVE, executive);
				valueInObject.put("receiveSummaryDataArr", receiveSummaryDataArr);
				valueInObject.put("finalPodReceiveDocumentList", finalPodReceiveDocumentList);
				valueInObject.put("narrationRemark", JSPUtility.GetString(request, "narrationRemark", ""));
				valueInObject.put("deductionAmt", JSPUtility.GetDouble(request, "deductionAmt", 0.00));
				valueInObject.put(Constant.TUR_NUMBER, turNumber != null ? turNumber : "");
				valueInObject.put("endKilometer", JSPUtility.GetDouble(request, "endKilometerEle", 0.00));
				valueInObject.put("wbForTUR", wbForTUR);
				valueInObject.put("isCrossing", receiveAndDelivery);
				valueInObject.put("isAllWayBillReadyToDeliver", JSPUtility.GetBoolean(request, "isAllWayBillReadyToDeliver", false));
				valueInObject.put(Constant.HAMAL_MASTER_ID, JSPUtility.GetLong(request, "hamalTeamLeaderEle", 0));

				final var	consigneeHM					= CustomerDetailsDao.getInstance().getCusotmerDetailsByWayBillIdsAndType(wayBillIdsForReceive, CustomerDetailsConstant.CUSTOMER_TYPE_CONSIGNEE_ID);
				final var	billingPartyHM 				= CustomerDetailsDao.getInstance().getCorporateDetailsByWayBillId(wayBillIdsForReceive);

				if(isManualTUR)
					valueInObject.put("isManualTUR", isManualTUR);

				valueInObject.put("showManualDateForReceive", showManualDateForReceive);
				valueInObject.put("srcBranch", srcBranch);
				valueInObject.put("unloadByExecutiveId", unloadByExecutiveId);
				valueInObject.put(Constant.MANUAL_TUR_DATE, manualTURDate);
				valueInObject.put("unloadedByHamal", JSPUtility.GetString(request, "unloadedByHamal", null));

				if(request.getParameter("arrivalTime") != null && request.getParameter("ampm") != null) {
					if(isManualTUR && manualTURDate != null)
						arrivalDate = request.getParameter("manualTURDate");
					else
						arrivalDate	= cal.get(Calendar.DATE) + "-" + (cal.get(Calendar.MONTH) + 1) + "-" + cal.get(Calendar.YEAR);

					var	arrivalTime	= JSPUtility.GetString(request, "arrivalTime");
					final var	amPm 		= JSPUtility.GetString(request, "ampm");
					arrivalTime = createTime(arrivalTime, amPm);
					valueInObject.put(Constant.ARRIVAL_DATE_TIME, new Timestamp(sdf.parse(arrivalDate + " " + arrivalTime).getTime()));
				} else if(isManualTUR && manualTURDate != null)
					valueInObject.put(Constant.ARRIVAL_DATE_TIME, manualTURDate);
				else if(!StringUtils.isEmpty(request.getParameter(Constant.ARRIVAL_DATE_TIME)))
					valueInObject.put(Constant.ARRIVAL_DATE_TIME, Timestamp.valueOf(request.getParameter(Constant.ARRIVAL_DATE_TIME)));
				else
					valueInObject.put(Constant.ARRIVAL_DATE_TIME, createDate);

				valueInObject.put("valueObjectForBLHPV", valueObjectForBLHPV);
				valueInObject.put("vehiclePendingForArrival", vehiclePendingForArrival);
				valueInObject.put("vehiclePendingForUnLoading", vehiclePendingForUnLoading);
				valueInObject.put("isAllowForTrafficModule", isMarkArrived);
				valueInObject.put("isForceReceiveFlag", isForceReceiveFlag);
				valueInObject.put("delValObjCol", delValObjCol);

				if(!shortCreditWayBillIdList.isEmpty())
					valueInObject.put("shortCreditWayBillIds", CollectionUtility.getStringFromLongList(shortCreditWayBillIdList));

				if(!wayBillIdListForDelivery.isEmpty())
					valueInObject.put("wayBillIdsForDelivery", CollectionUtility.getStringFromLongList(wayBillIdListForDelivery));

				if(request.getParameterValues("shortCheckBox") != null)
					valueInObject.put("shortReceiveHM", ShortReceiveBllImpl.getInstance().createDtoForShortReceive(CollectionUtility.getStringFromStringArray(request.getParameterValues("shortCheckBox"), "~"), executiveIV));

				if(request.getParameterValues("damageCheckBox") != null)
					valueInObject.put("damageReceiveHM", DamageReceiveBllImpl.getInstance().createDtoForDamageReceive(CollectionUtility.getStringFromStringArray(request.getParameterValues("damageCheckBox"), "~"), executiveIV));

				if(request.getParameterValues("shortArtCheckBox") != null)
					valueInObject.put("shortReceiveArticleHM", ShortReceiveBllImpl.getInstance().getLRWiseShortArticles(CollectionUtility.getStringFromStringArray(request.getParameterValues("shortArtCheckBox"), "~"), executiveIV));

				if(request.getParameterValues("damageArtCheckBox") != null)
					valueInObject.put("damageReceiveArticleHM", DamageReceiveBllImpl.getInstance().getLRWiseDamageArticles(CollectionUtility.getStringFromStringArray(request.getParameterValues("damageArtCheckBox"), "~"), executiveIV));

				if(request.getParameterValues("excessCheckBox") != null)
					valueInObject.put("excReceivesArr", ExcessReceiveBllImpl.getInstance().createExcessReceiveDto(CollectionUtility.getStringFromStringArray(request.getParameterValues("excessCheckBox"), "~"), executiveIV));

				valueInObject.put("vehicleNumberId", vehicleNumberId);
				valueInObject.put(Constant.VEHICLE_NUMBER_MASTER_ID, vehicleNumberId);
				valueInObject.put("vehicleNo", vehicleNo);
				valueInObject.put(Constant.VEHICLE_NUMBER, vehicleNo);
				valueInObject.put("truckDestinationId", truckDestinationId);
				valueInObject.put("truckDestinationName", truckDestinationName);
				valueInObject.put("driver", driver);
				valueInObject.put("cleaner", cleaner);
				valueInObject.put("createDate", createDate);
				valueInObject.put("subRegionExistForReceiveAndDispatch", subRegionExistForReceiveAndDispatch);
				valueInObject.put("subRegionExistForArriveAndDispatch", subRegionExistForArriveAndDispatch);
				valueInObject.put(ReceiveConfigurationPropertiesConstant.RECEIVE_CONFIGUARTION, combinedReceiveConfig);
				valueInObject.put("consigneeHM", consigneeHM);
				valueInObject.put("billingPartyHM", billingPartyHM);
				valueInObject.put("branchAbbrvnWiseCrNo", branchAbbrvnWiseCrNo);
				valueInObject.put(ReceiveAndDeliveryConfigurationConstant.SEQUENCE_NUMBER_FORMAT, sequenceNumberFormat);
				valueInObject.put(ReceiveAndDeliveryConfigurationConstant.CODE_FOR_SEQUENCE_NUMBER_GENERATION, codeForSequenceNumberGeneration);
				valueInObject.put("receiveAndDeliveryConfig", receiveAndDeliveryConfig);
				valueInObject.put("showReceiverToName", showReceiverToName);
				valueInObject.put("shortCreditConfigLimitAllowed", shortCreditConfigLimitAllowed);
				valueInObject.put(BankPayment.BANK_PAYMENT, bankPaymentHM);
				valueInObject.put("unloadingHamaliAmount", JSPUtility.GetDouble(request, "unloadingHamaliAmount", 0.00));

				setExtraData(request, cacheManip, valueInObject, executive);

				if(tokenWiseCheckingForDuplicateTransaction) {
					if(token == null || !token.equals(request.getSession().getAttribute(TokenGenerator.RECEIVE_TOKEN_KEY))) {
						error.put(CargoErrorList.ERROR_CODE, CargoErrorList.RECEIVE_ERROR);
						error.put(CargoErrorList.ERROR_DESCRIPTION, "Request already submitted, please wait!");
						request.setAttribute(CargoErrorList.CARGO_ERROR, error);
						request.setAttribute("nextPageToken", Constant.FAILURE);
						return;
					}

					request.getSession().setAttribute(TokenGenerator.RECEIVE_TOKEN_KEY, null);
				} else if(getDispatchLedgerIdString() == 0 || getDispatchLedgerIdString() != dispatchLedgerId) {
					setDispatchLedgerIdString(dispatchLedgerId);
					valueOutObject = perforReceiveOperationWithLocking(valueInObject, wayBillIdsForReceive);
				} else {
					error.put(CargoErrorList.ERROR_CODE, CargoErrorList.RECEIVE_ERROR);
					error.put(CargoErrorList.ERROR_DESCRIPTION, "Request already submitted, please wait!");
					request.setAttribute(CargoErrorList.CARGO_ERROR, error);
					request.setAttribute("nextPageToken", Constant.FAILURE);
					return;
				}

				if (valueOutObject != null && Constant.SUCCESS.equals(valueOutObject.getString(Constant.STATUS, ""))) {
					if(valueOutObject.containsKey("nothingToReceiveINLS") && valueOutObject.getBoolean("nothingToReceiveINLS",false)){
						request.setAttribute("filter", 3);
						request.setAttribute("LSNo", valueOutObject.get("LSNo"));
						request.setAttribute("successMessage", "All selected WayBills are Received successfully !");
						request.setAttribute(ReceiveConfigurationPropertiesConstant.SHOW_TUR_PRINT_AFTER_RECEIVE, false);
						request.setAttribute("SelectedWayBill", 0);
						request.setAttribute("DispatchLedgerTotalWayBill", 0);
						request.setAttribute("receivedLedgerId", 0);
						request.setAttribute("dispatchLedgerId", dispatchLedgerId);
						request.setAttribute("noOfPackages", 0);
						request.setAttribute("noOfPackagesOfSelectedWayBills", 0);
						request.setAttribute("nothingToReceiveINLS", true);
						request.setAttribute("nextPageToken", "success");
					}else{
						request.setAttribute("filter", 3);
						request.setAttribute("receivedLedgerId", valueOutObject.get("receivedLedgerId"));
						request.setAttribute("LSNo", valueOutObject.get("LSNo"));
						request.setAttribute(Constant.TUR_NUMBER, valueOutObject.get(Constant.TUR_NUMBER));
						request.setAttribute("dispatchLedgerId", dispatchLedgerId);
						request.setAttribute("noOfPackages", noOfPackages);
						request.setAttribute("SelectedWayBill", wayBill.length);
						request.setAttribute("DispatchLedgerTotalWayBill", dispatchLedgerWBCount);
						request.setAttribute("noOfPackagesOfSelectedWayBills", Long.parseLong(valueOutObject.get("noOfPackagesOfSelectedWayBills").toString()));
						request.setAttribute("nextPageToken", "success");
						request.setAttribute("successMessage", "All selected WayBills are Received successfully !");

						if(receiveAndDeliveryPermission) {
							request.setAttribute("receiveAndDeliveredWayBill", true);
							request.setAttribute(ReceiveConfigurationPropertiesConstant.SHOW_TUR_PRINT_AFTER_RECEIVE, false);
							request.setAttribute("successMessage", "All selected WayBills are Received / Delivered successfully !");
						} else if(valueOutObject.get("dispatchObj") != null) {
							final var  	dispatchObj		= (ValueObject) valueOutObject.get("dispatchObj");
							final var 	result			= dispatchObj.getString("serviceResult");

							if(result != null && Long.parseLong(StringUtils.substring(result, StringUtils.indexOf(result, ":") + 1, StringUtils.indexOf(result, "}"))) > 0) {
								request.setAttribute(ReceiveConfigurationPropertiesConstant.SHOW_TUR_PRINT_AFTER_RECEIVE, false);
								request.setAttribute("receiveAndDispatch", true);
								request.setAttribute(ReceiveAndDeliveryConfigurationConstant.SHOW_HAMALI_DETAILS_PRINT, combinedReceiveConfig.getOrDefault(ReceiveAndDeliveryConfigurationConstant.SHOW_HAMALI_DETAILS_PRINT,false));
								request.setAttribute("dispatchLedgerId", StringUtils.substring(result, StringUtils.indexOf(result, ":") + 1, StringUtils.indexOf(result, "}")));
								request.setAttribute("successMessage", "All selected WayBills are Received / Dispatched successfully !");
							}
						}
					}
				} else {
					if(valueOutObject != null && valueOutObject.getInt(CargoErrorList.ERROR_CODE, 0)> 0) {
						error.put(CargoErrorList.ERROR_CODE, Integer.parseInt(valueOutObject.get(CargoErrorList.ERROR_CODE).toString()));
						error.put(CargoErrorList.ERROR_DESCRIPTION, valueOutObject.get(CargoErrorList.ERROR_DESCRIPTION).toString());
					} else {
						error.put(CargoErrorList.ERROR_CODE, CargoErrorList.RECEIVE_ERROR);
						error.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.RECEIVE_ERROR_DESCRIPTION);
					}

					request.setAttribute(CargoErrorList.CARGO_ERROR, error);
					request.setAttribute("nextPageToken", Constant.FAILURE);
				}

			} else {
				error.put(CargoErrorList.ERROR_CODE, CargoErrorList.DUPLICATE_RECEIVE_ERROR);
				error.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.DUPLICATE_RECEIVE_ERROR_DESCRIPTION );
				request.setAttribute(CargoErrorList.CARGO_ERROR, error);
				request.setAttribute("nextPageToken", Constant.FAILURE);
			}
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		} finally {
			request.getSession().removeAttribute("receiveDispatchLedgerId");
			setDispatchLedgerIdString(0);
		}
	}

	private ValueObject receive(final ValueObject valueInObject, final String wayBillIdsForReceive) throws Exception {
		ValueObject 					valueOutObject					= null;

		try {
			if(execFldPermissions != null && execFldPermissions.get(FeildPermissionsConstant.DIRECTLY_RECEIVE_AND_DISPATCH) != null && subRegionExistForReceiveAndDispatch
					|| execFldPermissions != null && execFldPermissions.get(FeildPermissionsConstant.ARRIVED_AND_DISPATCH_WAYBILL) != null && subRegionExistForArriveAndDispatch)
				valueOutObject = ArriveReceiveAndDispatchBLL.getInstance().arriveDispatchAndReceiveWayBills(valueInObject);
			else {
				final var	wayBillIdsForDelivery	= valueInObject.getString("wayBillIdsForDelivery", null);

				if(wayBillIdsForDelivery != null) {
					valueOutObject	= ReceiveAndDeliveryBLL.getInstance().receivedAndDeliveryWayBills(valueInObject);
					valueOutObject.put("noOfPackagesOfSelectedWayBills", ConsignmentSummaryDao.getInstance().getNoOfPackagesForReceiveAndDeliveredLR(wayBillIdsForReceive));
				} else
					valueOutObject = ReceivablesBLL.getInstance().receivedWayBills(valueInObject);
			}

			return valueOutObject;
		} catch (final Exception e) {
			setDispatchLedgerIdString(0);
			e.printStackTrace();
			throw e;
		}finally {
			setDispatchLedgerIdString(0);
		}
	}


	private String createTime(final String time, final String amPm) throws Exception {
		try {
			var	fromMinTime = StringUtils.trim(StringUtils.trim(time).split(":")[0]);
			final var	fromToTime  = StringUtils.trim(StringUtils.trim(time).split(":")[1]);

			if(StringUtils.equalsIgnoreCase("PM", amPm) && Integer.parseInt(fromMinTime) != 12)
				fromMinTime = Integer.toString(Integer.parseInt(fromMinTime) + 12);

			if(StringUtils.equalsIgnoreCase("PM", amPm) && Integer.parseInt(fromMinTime) == 12)
				fromMinTime = Integer.toString(Integer.parseInt(fromMinTime) + 1);

			return fromMinTime + ":" + fromToTime + ":00";

		} catch (final Exception e) {
			e.printStackTrace();
			throw e;
		}
	}

	private List<PodReceiveDocument> createPodDocumentDto(final HttpServletRequest request, final PODDocumentTypeConstant[] podDocumentTypeArr, final long wayBillId, final Executive executive) throws Exception{
		try {
			final List<PodReceiveDocument>	podReceiveDocumentList = new ArrayList<>();

			for (final PODDocumentTypeConstant element : podDocumentTypeArr) {
				final var	podList  	= request.getParameterValues("inputcheck_" + wayBillId + "_" + element.getPodDocumentTypeId());

				for (final String element1 : podList) {
					final var	podReceiveDocument 	= new PodReceiveDocument();
					podReceiveDocument.setAccountGroupId(executive.getAccountGroupId());
					podReceiveDocument.setWayBillId(wayBillId);
					podReceiveDocument.setPodDocumentId(Short.parseShort(element1));
					podReceiveDocumentList.add(podReceiveDocument);
				}
			}

			return podReceiveDocumentList;
		} catch (final Exception e) {
			e.printStackTrace();
			throw e;
		}
	}

	public ValueObject perforReceiveOperationWithLocking(final ValueObject valueInObject, final String wayBillIdsForReceive) throws Exception {
		try {
			return receive(valueInObject, wayBillIdsForReceive);
		} catch (final Exception e) {
			e.printStackTrace();
			throw e;
		}
	}

	public ReceiveSummaryData receiveSummaryDataDTO(final HttpServletRequest request, final long wayBillId) throws Exception {
		try {
			final var	receiveSummaryData = new ReceiveSummaryData();

			receiveSummaryData.setActualUnloadWeight(JSPUtility.GetDouble(request, "actualUnloadWeight_" + wayBillId, 0));
			receiveSummaryData.setShortLuggage(JSPUtility.GetInt(request, "shortLuggage_" + wayBillId, 0));
			receiveSummaryData.setDamageLuggage(JSPUtility.GetInt(request, "damageLuggage_" + wayBillId, 0));
			receiveSummaryData.setDamageAmount(JSPUtility.GetDouble(request, "damageAmount_" + wayBillId, 0));
			receiveSummaryData.setRemark(JSPUtility.GetString(request, "remark_" + wayBillId, ""));
			receiveSummaryData.setNoOfPackages(JSPUtility.GetInt(request, "LRTotalArt" + wayBillId, 0));
			receiveSummaryData.setActualWeight(JSPUtility.GetDouble(request, "LRTotalActWgt" + wayBillId, 0));
			receiveSummaryData.setGodownId(JSPUtility.GetLong(request, "godownId" + wayBillId, 0));
			receiveSummaryData.setUnloadedByHamalId(JSPUtility.GetShort(request, "unloadedByHamal_" + wayBillId, TransportCommonMaster.LOADED_BY_OUR_ID));
			receiveSummaryData.setUnloadedInId(JSPUtility.GetShort(request, "unloadedIn_" + wayBillId, TransportCommonMaster.UNLOADED_IN_GODOWN_ID));
			receiveSummaryData.setWayBillId(wayBillId);

			return receiveSummaryData;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private DeliveryContactDetails deliveryContactDetailsDTO(final HttpServletRequest request, final long wayBillId) throws Exception {
		try {
			final var	deliveryContactDetails	= new DeliveryContactDetails();

			deliveryContactDetails.setWayBillNumber(JSPUtility.GetString(request, "wayBillNumber_" + wayBillId));
			deliveryContactDetails.setWayBillId(wayBillId);

			if(request.getParameter("deliveredToName_" + wayBillId) != null)
				deliveryContactDetails.setDeliveredToName(StringUtils.upperCase(JSPUtility.GetString(request, "deliveredToName_" + wayBillId, "")));
			else
				deliveryContactDetails.setDeliveredToName(StringUtils.upperCase(JSPUtility.GetString(request, "consigneeName_" + wayBillId, "")));

			if(request.getParameter("deliveredToPhoneNo_" + wayBillId) != null)
				deliveryContactDetails.setDeliveredToNumber(StringUtils.upperCase(JSPUtility.GetString(request, "deliveredToPhoneNo_" + wayBillId, "")));
			else
				deliveryContactDetails.setDeliveredToNumber(StringUtils.upperCase(JSPUtility.GetString(request, "consigneeNo_" + wayBillId, "")));

			deliveryContactDetails.setPodStatus(JSPUtility.GetShort(request, "podStatus_" + wayBillId, (short) 0));
			deliveryContactDetails.setWayBillTypeId(JSPUtility.GetLong(request, "wayBillType_" + wayBillId, 0));
			deliveryContactDetails.setVehicleNumber(JSPUtility.GetString(request, "vehicleNo", ""));
			deliveryContactDetails.setReceiverToName(StringUtils.upperCase(JSPUtility.GetString(request, "receiverName_" + wayBillId, "")));

			return deliveryContactDetails;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private void setChequeData(final HttpServletRequest request, final DeliveryContactDetails deliveryContactDetails, final long wayBillId) throws Exception {
		try {
			final var	dt = JSPUtility.GetString(request, "chequeDate_" + wayBillId, "");

			if (!"".equals(dt))
				deliveryContactDetails.setChequeDate(DateTimeUtility.getDateTimeFromStr(dt));

			deliveryContactDetails.setChequeNumber(JSPUtility.GetString(request, "chequeNo_" + wayBillId, "0"));
			deliveryContactDetails.setChequeAmount(JSPUtility.GetDouble(request, "chequeAmount_" + wayBillId, 0.00));
			deliveryContactDetails.setBankName(StringUtils.upperCase(JSPUtility.GetString(request, "bankName_" + wayBillId, "")));
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private void setDeliveryChargesData(final HttpServletRequest request, final long wayBillId, final ChargeTypeModel[] deliveryCharge, final ValueObject delValObj) throws Exception {
		try {
			var flag  = false;

			if(deliveryCharge != null) {
				flag 		= true;
				final var	delchrId	= new long[deliveryCharge.length];
				final var	delchrhm	= new HashMap<Long, Double>();
				final var	chetypehm	= new HashMap<Long, Short>();
				final var	chrgesType	= new Double[deliveryCharge.length];

				for(var j = 0; j < deliveryCharge.length; j++) {
					final var charge =  JSPUtility.GetDouble(request, "deliveryCharge_" + deliveryCharge[j].getChargeTypeMasterId() + "_" + wayBillId, 0);

					delchrId[j]		= deliveryCharge[j].getChargeTypeMasterId();
					chrgesType[j]	= charge;
					delchrhm.put(deliveryCharge[j].getChargeTypeMasterId(), chrgesType[j]);
					chetypehm.put(deliveryCharge[j].getChargeTypeMasterId(), deliveryCharge[j].getChargeType());
				}

				delValObj.put("deliveryChargeId_valueObj", delchrId);
				delValObj.put("deliveryCharge_valueObj", delchrhm);
				delValObj.put("ChargeType_valueObj", chetypehm);
			}

			delValObj.put("flag_valueObj", flag);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private ValueObject checkForDeliverySequenceCounter(final Executive delExecutive, final Branch srcBranch, final Map<Object, Object> combinedReceiveConfig) throws Exception {
		try {
			final var	branchAbbrvnWiseCrNo		= (boolean) combinedReceiveConfig.getOrDefault(ReceiveAndDeliveryConfigurationConstant.BRANCH_ABBRVN_WISE_CR_NO, false);

			final var	deliverySequenceCounter = DeliverySequenceCounterDao.getInstance().getDeliverySequenceCounter(delExecutive.getAccountGroupId(), delExecutive.getBranchId(),(short)0);

			final var	valueObjectOut	= new ValueObject();

			if(deliverySequenceCounter == null) {
				valueObjectOut.put(CargoErrorList.ERROR_CODE, CargoErrorList.DELIVERY_SEQUENCE_COUNTER_MISSING);
				valueObjectOut.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.DELIVERY_SEQUENCE_COUNTER_MISSING_DESCRIPTION);
				return valueObjectOut;
			}

			if(deliverySequenceCounter.getNextVal() > deliverySequenceCounter.getMaxRange()) {
				valueObjectOut.put(CargoErrorList.ERROR_CODE, CargoErrorList.DELIVERY_SEQUENCE_COUNTER_MISSING);
				valueObjectOut.put(CargoErrorList.ERROR_DESCRIPTION, "DeliverySequenceCounter not in range or exceeded. " + CargoErrorList.SUPPORT_MESSAGE);
				return valueObjectOut;
			}

			if(branchAbbrvnWiseCrNo && (srcBranch.getAbbrevationName() == null || srcBranch.getAbbrevationName() != null && "".equals(srcBranch.getAbbrevationName()))) {
				valueObjectOut.put(CargoErrorList.ERROR_CODE, CargoErrorList.BRANCH_ABBRVN_NOT_DEFINE_ERROR);
				valueObjectOut.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.BRANCH_ABBRVN_NOT_DEFINE_ERROR_DESCRIPTION);
				return valueObjectOut;
			}

			final var	crNumberFormat		= (int) combinedReceiveConfig.getOrDefault(GenerateCashReceiptPropertiesConstant.SEQUENCE_NUMBER_FORMAT, 0);
			final var 	crPrefix			= (String) combinedReceiveConfig.getOrDefault(GenerateCashReceiptPropertiesConstant.CODE_FOR_SEQUENCE_NUMBER_GENERATION, "");

			if(crNumberFormat > 0)
				if(srcBranch == null || SequenceCounterBllImpl.getInstance().isNotBranchCode(crNumberFormat, srcBranch.getBranchCode())) {
					valueObjectOut.put(CargoErrorList.ERROR_CODE, CargoErrorList.BRANCH_CODE_NOT_DEFINE_ERROR);
					valueObjectOut.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.BRANCH_CODE_NOT_DEFINE_ERROR_DESCRIPTION);
				} else if(SequenceCounterBllImpl.getInstance().isPrefixNotDefined(crNumberFormat, crPrefix)) {
					valueObjectOut.put(CargoErrorList.ERROR_CODE, CargoErrorList.BRANCH_CODE_NOT_DEFINE_ERROR);
					valueObjectOut.put(CargoErrorList.ERROR_DESCRIPTION, "Prefix code not defined for CR !");
				}

			return valueObjectOut;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public void setExtraData(final HttpServletRequest request, final CacheManip cacheManip, final ValueObject valueInObject, final Executive executive) throws Exception {
		try {
			final var	configParamHM			= cacheManip.getConfigParamData(request, executive.getAccountGroupId());

			valueInObject.put("deliveryLocationList", cacheManip.getAssignedLocationsIdListByLocationIdId(request, executive.getBranchId(), executive.getAccountGroupId()));
			valueInObject.put(WayBillTaxDetails.WAYBILL_TYPE_WISE_SERVICE_TAX_DATE, cacheManip.wayBillTypeWiseServiceTaxDate(request, executive.getAccountGroupId()));
			valueInObject.put(AccountGroupTieUpConfiguration.ACCOUNT_GROUP_TIE_UP_CONFIGURATION_HM, cacheManip.getAccountGroupTieUpConfiguration(request, executive.getAccountGroupId()));
			valueInObject.put(LrCostConfigurationDTO.LR_COST_CONFIGURATION, cacheManip.getGroupWiseLRCostConfiguration(request, executive.getAccountGroupId()));
			valueInObject.put(GroupConfigurationPropertiesDTO.GROUP_CONFIGURATION, cacheManip.getGroupConfiguration(request, executive.getAccountGroupId()));
			valueInObject.put(CashStatementConfigurationDTO.CASH_STATEMENT_CONFIGURATION, cacheManip.getCashStatementConfiguration(request, executive.getAccountGroupId()));
			valueInObject.put(TransportListMaster.TRANSPORT_LIST, cacheManip.getTransportList(request));
			valueInObject.put(LHPVPropertiesConstant.LHPV_CONFIGURATION, cacheManip.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.LHPV));
			valueInObject.put(BankStatementConfigurationDTO.BANK_STATEMENT_CONFIGURATION, cacheManip.getBankStatementConfiguration(request, executive.getAccountGroupId()));
			valueInObject.put(GenerateCashReceiptDTO.GENERATE_CASH_RECEIPT_CONFIGURATION, cacheManip.getGenerateCRConfiguration(request, executive.getAccountGroupId()));
			valueInObject.put(DashBoardConfigurationDTO.DASH_BOARD_CONFIGURATION, cacheManip.getDashBoardConfiguration(request, executive.getAccountGroupId()));
			valueInObject.put(GeneralConfiguration.GENERAL_CONFIGURATION, cacheManip.getGeneralConfiguration(request, executive.getAccountGroupId()));
			valueInObject.put("configValWBGTROffAllow", configParamHM.get(ConfigParam.CONFIG_KEY_WAYBILL_GRAND_TOTAL_ROUNDOFF));
			valueInObject.put("CashStmtEntryAllowed", configParamHM.get(ConfigParam.CONFIG_KEY_CASH_STATEMENT_TABLE_ENTRY));
			valueInObject.put("configValueForDelivery", configParamHM.get(ConfigParam.CONFIG_KEY_DELIVERY_ACCESSIBILITY));
			valueInObject.put("isArrivalTruckDetailReport", configParamHM.containsKey(ConfigParam.CONFIG_KEY_ARRIVAL_TRUCK_DETAILS_REPORT)
					&& configParamHM.get(ConfigParam.CONFIG_KEY_ARRIVAL_TRUCK_DETAILS_REPORT) == ConfigParam.CONFIG_KEY_CONFIG_KEY_ARRIVAL_TRUCK_DETAILS_REPORT_ALLOWED);
			valueInObject.put("isPendingDeliveryTableEntry", configParamHM.containsKey(ConfigParam.CONFIG_KEY_PENDING_DELIVERY_STOCK_TABLE_ENTRY)
					&& configParamHM.get(ConfigParam.CONFIG_KEY_PENDING_DELIVERY_STOCK_TABLE_ENTRY) == ConfigParam.CONFIG_KEY_PENDING_DELIVERY_STOCK_TABLE_ENTRY_ALLOWED);
			valueInObject.put("isServiceTaxReport", configParamHM.containsKey(ConfigParam.CONFIG_KEY_SERVICE_TAX_REPORT)
					&& configParamHM.get(ConfigParam.CONFIG_KEY_SERVICE_TAX_REPORT) == ConfigParam.CONFIG_KEY_VALUE_SERVICE_TAX_REPORT_ALLOWED);
			valueInObject.put("branchesColl", cacheManip.getGenericBranchesDetail(request));
			valueInObject.put("branchColl", cacheManip.getGenericBranchesDetail(request));
			valueInObject.put(LrViewConfigurationPropertiesConstant.LR_VIEW_CONFIGURATION_PROPERTY, cacheManip.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.LR_SEARCH));
			valueInObject.put(ServerIPAddressConfigurationConstant.SERVER_IP_ADDRESS, cacheManip.getConfiguration(request, ModuleIdentifierConstant.SERVER_IP_ADDRESS));
			valueInObject.put(SyncWithNexusPropertiesConstant.SYNC_WITH_NEXUS, cacheManip.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.SYNC_WITH_TCE_NEXUS));
			valueInObject.put(Constant.IS_ACTIVE_TCE_BRANCH, request.getSession().getServletContext().getAttribute(Constant.IS_ACTIVE_TCE_BRANCH + "_" + executive.getBranchId()));
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

}