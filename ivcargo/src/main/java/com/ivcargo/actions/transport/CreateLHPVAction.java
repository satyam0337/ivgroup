package com.ivcargo.actions.transport;

//~--- non-JDK imports --------------------------------------------------------

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.StringJoiner;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringUtils;

import com.businesslogic.LHPVBLL;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.bll.impl.sequencecounter.SequenceCounterBllImpl;
import com.iv.constant.properties.lhpv.LHPVPropertiesConstant;
import com.iv.dao.impl.LHPVChargeExpenseVoucherSettlementDaoImpl;
import com.iv.dto.LHPVChargeExpenseVoucherSettlement;
import com.iv.dto.LhpvSettlementCharges;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.logsapp.LogWriter;
import com.iv.properties.constant.LoadingSheetPropertyConstant;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.constant.Constant;
import com.iv.utils.constant.DateTimeFormatConstant;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.exception.ExceptionProcess;
import com.iv.utils.utility.CollectionUtility;
import com.iv.utils.utility.ListFilterUtility;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.ConsignmentSummaryDao;
import com.platform.dao.DeliveryRunSheetLedgerDao;
import com.platform.dao.DeliveryRunSheetSummaryDao;
import com.platform.dao.DispatchLedgerDao;
import com.platform.dao.DispatchSummaryDao;
import com.platform.dao.DuplicateTransactionCheckDao;
import com.platform.dao.LHPVDao;
import com.platform.dao.LHPVSequenceCounterDao;
import com.platform.dao.LhpvChargesForGroupDao;
import com.platform.dao.LhpvSettlementChargesDao;
import com.platform.dto.AliasNameConstants;
import com.platform.dto.ArrivalTruckDetails;
import com.platform.dto.Branch;
import com.platform.dto.ConfigParam;
import com.platform.dto.ConsignmentSummary;
import com.platform.dto.DeliveryRunSheetLedger;
import com.platform.dto.DispatchLedger;
import com.platform.dto.Executive;
import com.platform.dto.ExecutiveFeildPermissionDTO;
import com.platform.dto.LHPV;
import com.platform.dto.LHPVModel;
import com.platform.dto.LHPVSequenceCounter;
import com.platform.dto.LhpvChargesForGroup;
import com.platform.dto.ManualTransaction;
import com.platform.dto.SourceDestinationWiseLHPVSequenceCounter;
import com.platform.dto.TransportCommonMaster;
import com.platform.dto.VehicleNumberMaster;
import com.platform.dto.configuration.modules.LrCostConfigurationDTO;
import com.platform.dto.constant.BookingTypeConstant;
import com.platform.dto.constant.FeildPermissionsConstant;
import com.platform.dto.constant.InfoForDeliveryConstant;
import com.platform.dto.constant.LHPVChargeTypeConstant;
import com.platform.dto.constant.LHPVConstant;
import com.platform.dto.constant.PaymentTypeConstant;
import com.platform.dto.constant.TransCargoAccountGroupConstant;
import com.platform.dto.tds.TDSTxnDetails;
import com.platform.resource.CargoErrorList;
import com.platform.utils.TokenGenerator;
import com.platform.utils.Utility;

public class CreateLHPVAction implements Action {

	public static final String 	TRACE_ID  	= "CreateLHPVAction";
	Executive                  	executive 	= null;
	Timestamp 					createDate	= null;

	@Override
	@SuppressWarnings("unchecked")
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {

		HashMap<String,Object>	 						error 										= null;
		ValueObject    									inValObj									= null;
		ValueObject    									outObj										= null;
		String[]       									values										= null;
		String		 									lsIds										= null;
		String 											lsIdsForAppend								= null;
		LHPVSequenceCounter								lhpvSequenceCounter							= null;
		SourceDestinationWiseLHPVSequenceCounter 		srcDestWiseLHPVSeqCounter					= null;
		HashMap<Long, DispatchLedger>					lsDetails									= null;
		VehicleNumberMaster								vehicleNumberMaster							= null;
		DispatchLedger									dispatchLedger								= null;
		DispatchLedger									disLedger									= null;
		CacheManip										cacheManip									= null;
		String 											lhpvNumber 									= null;
		HashMap<Long, LHPVModel>						lhpvColl									= null;
		LHPVModel										lhpvModel									= null;
		ValueObject										valueOutObject								= null;
		Timestamp										manualLHPVDate								= null;
		SimpleDateFormat								sdf											= null;
		ArrayList<ArrivalTruckDetails>	 				arrivalTruckList							= null;
		ArrivalTruckDetails[]			   				arrivalTruckArr								= null;
		ManualTransaction								manualTransaction							= null;
		ArrayList<ManualTransaction>					manualTransactionList 						= null;
		ManualTransaction[]								manualTransactionArr 						= null;
		LHPV 											lhpv 										= null;
		List<LhpvSettlementCharges>						lhpvSettlementArr							= null;
		ValueObject										lrCostConfiguration							= null;
		ValueObject										lhpvSettlementObj							= null;
		HashMap<Long, Double> 							chargesColl									= null;
		Calendar 										currentDateTime								= null;
		Branch											srcBranch									= null;
		Branch											destBranch									= null;
		ValueObject										updateLHPVChrgsTruckDlyWiseValObj			= null;
		Map<Object, Object>								lhpvConfig			    					= null;
		String											lhpvChargeIdsStringForVoucherSettlement		= null;
		List<Long>										lhpvChargeIdsListForVoucherSettlement		= null;
		LHPVChargeExpenseVoucherSettlement				lhpvChargeExpenseVoucherSettlement			= null;
		List<LHPVChargeExpenseVoucherSettlement>		lhpvChargeExpenseVoucherSettlementList		= null;
		HashMap<Long, ExecutiveFeildPermissionDTO>		executiveFeildPermissionsHM					= null;
		String											manualLHPVDateString						= null;
		StringJoiner									lsNumbersString								= null;
		var											typeOfLHPV									= LHPVConstant.TYPE_OF_LHPV_ID_NORMAL;
		HashMap<Long, DeliveryRunSheetLedger>			delRunSheetledgerIdWiseDTO					= null;
		DeliveryRunSheetLedger							deliveryRunSheetLedger						= null;
		String											manualLHPVNumberStr							= null;
		String											lhpvNumberString							= null;
		var											isAllowAlphnumericWithSpecialCharactersSeq	= false;
		var											isLhpvLockingAfterLsCreation				= false;
		var											isAllowBackDateInAutoLhpv					= false;
		var 										isNumberExits								= false;
		var							   				isArrivalTruckDetailReport 					= false;
		var											srcDestWiseSeqCounter 						= false;
		var											isLHPVAlreadyCreated 						= false;
		var											isDDDV				 						= false;
		var											isNormal			 						= false;
		var											isSeqCounterPresent 						= false;
		var 											totalAmount									= 0.00;
		var											totalActualWeight 							= 0.00;
		var											diff										= 0L;
		short											operationType								= 0;
		var											lhpvId										= 0L;
		var											lhpvBranchId								= 0L;
		var											manualLHPVNumber							= 0L;
		var												validDateCode								= 0;
		short											lhpvTypeId									= 0;
		var												noOfDays									= 0;
		var											boliWeight									= 0D;
		short											truckLoadTypeId								= 0;
		var											checkManualLHPVSequenceRange				= true;
		var											sameSequenceForLsAndLhpv					= false;
		var											lsNumber									= "";
		var 										setPreviousMonthLHPVCreationDate       		= false;
		var												timeForPreviousMonthLhpvCreation			= 0;
		var											selectedVehicleNo							= 0L;
		String											token										= null;
		var											tokenWiseCheckingForDuplicateTransaction	= false;

		try {

			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			cacheManip			= new CacheManip(request);
			executive 				= cacheManip.getExecutive(request);

			lhpvNumber 				= JSPUtility.GetString(request, "lhpvNo", "");
			operationType			= JSPUtility.GetShort(request, "operationType", (short)0);
			lhpvId					= JSPUtility.GetLong(request, Constant.LHPV_ID, 0);
			selectedVehicleNo		= JSPUtility.GetLong(request, "selectedVehicleNo", 0);
			lhpvBranchId			= JSPUtility.GetLong(request, "lhpvBranchId", 0);
			isSeqCounterPresent 	= JSPUtility.GetBoolean(request,"isSeqCounterPresent",false);
			srcDestWiseSeqCounter 	= JSPUtility.GetBoolean(request,"srcDestWiseSeqCounter",false);
			boliWeight				= JSPUtility.GetLong(request, "boliWeightId", 0);
			truckLoadTypeId			= JSPUtility.GetShort(request, "truckLoadTypeId", (short) 0);
			lsNumber				= JSPUtility.GetString(request, "singleLsNumber", "");
			token					= JSPUtility.GetString(request, "token", "");

			if(JSPUtility.GetShort(request, "typeOfLHPV", (short) 0) > 0)
				typeOfLHPV			= JSPUtility.GetShort(request, "typeOfLHPV", (short) 0);

			if(request.getParameter("totalAmount") != null)
				totalAmount			= JSPUtility.GetDouble(request, "totalAmount",0);

			lhpvConfig					= cacheManip.getLhpvConfiguration(request, executive.getAccountGroupId());

			isAllowAlphnumericWithSpecialCharactersSeq	= (Boolean) lhpvConfig.getOrDefault(LHPVPropertiesConstant.IS_ALLOW_ALPHNUMERIC_WITH_SPECIAL_CHARACTERS_SEQ, false);
			checkManualLHPVSequenceRange				= (Boolean) lhpvConfig.getOrDefault(LHPVPropertiesConstant.CHECK_MANUAL_LHPV_SEQUENCE_RANGE, true);
			sameSequenceForLsAndLhpv					= (Boolean) lhpvConfig.getOrDefault(LHPVPropertiesConstant.SAME_SEQUENCE_FOR_LS_AND_LHPV, false);
			setPreviousMonthLHPVCreationDate			= (Boolean) lhpvConfig.getOrDefault(LHPVPropertiesConstant.SET_PREVIOUS_MONTH_LHPV_CREATIONDATE, false);
			timeForPreviousMonthLhpvCreation			= (Integer) lhpvConfig.getOrDefault(LHPVPropertiesConstant.TIME_FOR_PREVIOUS_MONTH_LHPV_CREATION_DATE, 0);
			tokenWiseCheckingForDuplicateTransaction	= (Boolean) lhpvConfig.getOrDefault(LHPVPropertiesConstant.TOKEN_WISE_CHECKING_FOR_DUPLICATE_TRANSACTION, false);

			if(tokenWiseCheckingForDuplicateTransaction) {
				if(token == null || !token.equals(request.getSession().getAttribute(TokenGenerator.LHPV_TOKEN_KEY))) {
					error.put("errorCode", CargoErrorList.LHPV_ALREADY_CREATED_ERROR);
					error.put("errorDescription", "Request already submitted, please wait!");
					request.setAttribute("cargoError", error);
					request.setAttribute("nextPageToken", "failure");
					return;
				}
				request.getSession().setAttribute(TokenGenerator.LHPV_TOKEN_KEY, null);
			}

			if(isAllowAlphnumericWithSpecialCharactersSeq)
				manualLHPVNumberStr		= JSPUtility.GetString(request, "manualLHPVNumber", "");
			else
				manualLHPVNumber		= JSPUtility.GetLong(request, "manualLHPVNumber", 0);

			if(lhpvNumber != null) {
				inValObj			= new ValueObject();
				lsNumbersString		= new StringJoiner(",");
				arrivalTruckList 	= new ArrayList<>();
				sdf    				= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
				createDate 			= new Timestamp(new Date().getTime());

				values				= request.getParameterValues("lsIds");
				currentDateTime 	= Calendar.getInstance();

				srcBranch								= cacheManip.getGenericBranchDetailCache(request , executive.getBranchId());
				destBranch								= cacheManip.getGenericBranchDetailCache(request , JSPUtility.GetLong(request, "DestinationBranchId"));
				lhpvChargeIdsStringForVoucherSettlement	= (String) lhpvConfig.getOrDefault(LHPVPropertiesConstant.LHPV_CHARGE_IDS_FOR_VOUCHER_SETTLEMENT, null);
				final var 	lhpvNumberFormat						= (Integer) lhpvConfig.getOrDefault(LHPVPropertiesConstant.SEQUENCE_NUMBER_FORMAT, 0);

				final var 	lsPropertyConfig		= cacheManip.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.DISPATCH);
				isLhpvLockingAfterLsCreation		= (boolean) lsPropertyConfig.getOrDefault(LoadingSheetPropertyConstant.IS_LHPV_LOCKING_AFTER_LS_CREATION, false);

				if(lhpvNumberFormat > 0 && (srcBranch == null || SequenceCounterBllImpl.getInstance().isNotBranchCode(lhpvNumberFormat, srcBranch.getBranchCode()))) {
					error.put(CargoErrorList.ERROR_CODE, CargoErrorList.BRANCH_CODE_NOT_DEFINE_ERROR);
					error.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.BRANCH_CODE_NOT_DEFINE_ERROR_DESCRIPTION);
					request.setAttribute("cargoError", error);
					request.setAttribute("nextPageToken", "failure");
					return;
				}

				if (lhpvChargeIdsStringForVoucherSettlement != null)
					lhpvChargeIdsListForVoucherSettlement	= CollectionUtility.getLongListFromString(lhpvChargeIdsStringForVoucherSettlement);

				isArrivalTruckDetailReport = cacheManip.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_ARRIVAL_TRUCK_DETAILS_REPORT) == ConfigParam.CONFIG_KEY_CONFIG_KEY_ARRIVAL_TRUCK_DETAILS_REPORT_ALLOWED;

				executiveFeildPermissionsHM	= cacheManip.getExecutiveFieldPermission(request);

				isAllowBackDateInAutoLhpv	= executiveFeildPermissionsHM.get(FeildPermissionsConstant.BACK_DATE_IN_AUTO_LHPV) != null;

				if(isAllowBackDateInAutoLhpv) {
					manualLHPVDateString	= JSPUtility.GetString(request, "manualLHPVDate", null) ;

					manualLHPVDate	= DateTimeUtility.getEndOfDayTimeStamp(manualLHPVDateString);
					final var dayDiff 	= DateTimeUtility.getDayDiffBetweenTwoDates(manualLHPVDate, createDate);

					if(dayDiff > 0)
						createDate = manualLHPVDate;
				}

				if(setPreviousMonthLHPVCreationDate) {
					final var toDate   =  timeForPreviousMonthLhpvCreation+":00:00";
					final var fromTime = "  00:00:00";
					final var dayOfMonth = DateTimeUtility.getCurrentDayOfMonth(); // returns the current date of the month

					if(dayOfMonth == 1) {
						final var res = DateTimeUtility.checkTimeExistBetweenTimeSlot(createDate.getTime(),fromTime,toDate);

						if(res) {
							final var backDate  = new Timestamp(createDate.getTime() - DateTimeFormatConstant.MILLIS_IN_DAY);
							createDate		    = DateTimeUtility.getEndOfDayTimeStamp(DateTimeUtility.getDateFromTimeStamp(backDate));
						}
					}
				}

				lsIds	= CollectionUtility.getStringFromStringList(Arrays.asList(values));

				if(typeOfLHPV == LHPVConstant.TYPE_OF_LHPV_ID_NORMAL)
					lsDetails 					= DispatchLedgerDao.getInstance().getDispatchLedgerDetailsByLSIds(lsIds);
				else if (typeOfLHPV == LHPVConstant.TYPE_OF_LHPV_ID_DDM) {
					if((boolean) lhpvConfig.getOrDefault(LHPVPropertiesConstant.DONOT_ALLOW_TO_CREATE_LHPV_IF_DDM_NOT_SETTLED, false)) {
						final var	drsmLedgerList		= DeliveryRunSheetSummaryDao.getInstance().getAllDeliveryRunSheetLedgerData(lsIds);

						if (ListFilterUtility.isAnyMatchInList(drsmLedgerList, e -> e.getPaymentType() <= 0)) {
							error.put(CargoErrorList.ERROR_CODE, "DDM is not settled");
							error.put(CargoErrorList.ERROR_DESCRIPTION, "Settle DDM First!");
							request.setAttribute("cargoError", error);
							request.setAttribute("nextPageToken", "failure");
							return;
						}
					}

					delRunSheetledgerIdWiseDTO	= DeliveryRunSheetLedgerDao.getInstance().getDDMDetailsByDeliveryRunSheetLedgerIds(lsIds);
				}

				inValObj.put("typeOfLHPV", typeOfLHPV);

				if(lsDetails != null)
					for (final Map.Entry<Long, DispatchLedger> entry : lsDetails.entrySet()) {
						dispatchLedger 		= entry.getValue();

						if(selectedVehicleNo != dispatchLedger.getVehicleNumberMasterId() && operationType == LHPVConstant.CREATE_ID) {
							error.put(CargoErrorList.ERROR_CODE, CargoErrorList.MANUAL_NUMBER_NOT_VALID_ERROR);
							error.put(CargoErrorList.ERROR_DESCRIPTION, "Dispatch No - " +  dispatchLedger.getLsNumber() + " Vehicle is different than selected Vehicle Number ! Please remove this Dispatch No - " + dispatchLedger.getLsNumber());
							request.setAttribute("cargoError", error);
							request.setAttribute("nextPageToken", "failure");
							return;
						}

						totalActualWeight 	+= dispatchLedger.getTotalActualWeight();

						if(dispatchLedger.getLhpvId() > 0)
							isLHPVAlreadyCreated = true;

						lsNumbersString.add(dispatchLedger.getLsNumber());

						if(dispatchLedger.isDDDV()) {
							isDDDV = true;
							lhpvTypeId = isNormal ? LHPVConstant.LHPV_TYPE_ID_BOTH : LHPVConstant.LHPV_TYPE_ID_DDDV;
						} else {
							isNormal = true;
							lhpvTypeId = isDDDV ? LHPVConstant.LHPV_TYPE_ID_BOTH : LHPVConstant.LHPV_TYPE_ID_NORMAL;
						}

						if(isArrivalTruckDetailReport && dispatchLedger != null && dispatchLedger.getStatus() == DispatchLedger.DISPATCHLEDGER_WAYBILL_STATUS_DISPATCHED && dispatchLedger.getTypeOfLS() == DispatchLedger.TYPE_OF_LS_ID_NORMAL)
							arrivalTruckList.add(setArrivalTruckDetails(dispatchLedger));
					}

				if(!isLHPVAlreadyCreated) {
					if(operationType == LHPVConstant.CREATE_ID) { //Create = 1

						if(request.getParameter("isManualLHPV") != null) {
							if(manualLHPVNumber > 0 || manualLHPVNumberStr != null) {
								if(isSeqCounterPresent) {
									lhpvSequenceCounter = LHPVSequenceCounterDao.getInstance().getLHPVSequenceCounterToDisplay(executive.getAccountGroupId(), executive.getBranchId(), LHPVSequenceCounter.LHPV_SEQUENCE_MANUAL);

									if(lhpvSequenceCounter != null)
										lhpvSequenceCounter.setNextVal(manualLHPVNumber);
								} else {
									lhpvSequenceCounter = new LHPVSequenceCounter();
									lhpvSequenceCounter.setNextVal(manualLHPVNumber);
								}

								if(request.getParameter("manualLHPVDate") != null)
									manualLHPVDate	= new Timestamp(sdf.parse(JSPUtility.GetString(request, "manualLHPVDate") + " "+currentDateTime.get(Calendar.HOUR_OF_DAY)+":"+currentDateTime.get(Calendar.MINUTE)+":"+currentDateTime.get(Calendar.SECOND)).getTime());
							} else {
								error.put(CargoErrorList.ERROR_CODE, CargoErrorList.MANUAL_NUMBER_NOT_VALID_ERROR);
								error.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.MANUAL_NUMBER_NOT_VALID_ERROR_DESCRIPTION);
								request.setAttribute("cargoError", error);
								request.setAttribute("nextPageToken", "failure");
							}
						} else if(srcDestWiseSeqCounter) {
							// This is for get Destination Branch Wise Sequence Counter
							srcDestWiseLHPVSeqCounter = LHPVSequenceCounterDao.getInstance().getSourceDestinationWiseLHPVSequenceCounter(executive.getAccountGroupId(), executive.getBranchId(),destBranch.getBranchId(),destBranch.getSubRegionId());

							if(srcDestWiseLHPVSeqCounter != null) {
								lhpvSequenceCounter	= new LHPVSequenceCounter();
								lhpvSequenceCounter.setNextVal(srcDestWiseLHPVSeqCounter.getNextVal());
								lhpvSequenceCounter.setMinRange(srcDestWiseLHPVSeqCounter.getMinRange());
								lhpvSequenceCounter.setMaxRange(srcDestWiseLHPVSeqCounter.getMaxRange());
							} else {
								// This is for get Destination Sub Region Wise Sequence Counter
								srcDestWiseLHPVSeqCounter = LHPVSequenceCounterDao.getInstance().getSourceDestinationWiseLHPVSequenceCounter(executive.getAccountGroupId(), executive.getBranchId(),0,destBranch.getSubRegionId());

								if(srcDestWiseLHPVSeqCounter != null) {
									lhpvSequenceCounter	= new LHPVSequenceCounter();
									lhpvSequenceCounter.setNextVal(srcDestWiseLHPVSeqCounter.getNextVal());
									lhpvSequenceCounter.setMinRange(srcDestWiseLHPVSeqCounter.getMinRange());
									lhpvSequenceCounter.setMaxRange(srcDestWiseLHPVSeqCounter.getMaxRange());
								}
							}
						} else if(!sameSequenceForLsAndLhpv)
							lhpvSequenceCounter = LHPVSequenceCounterDao.getInstance().getLHPVSequenceCounter(executive.getAccountGroupId(), executive.getBranchId());

						if(lhpvSequenceCounter == null && !sameSequenceForLsAndLhpv) {
							LogWriter.writeLog(CreateLHPVAction.TRACE_ID, LogWriter.LOG_LEVEL_INFO, (String) error.get(CargoErrorList.ERROR_CODE)+" "+(String) error.get(CargoErrorList.ERROR_DESCRIPTION));
							error.put(CargoErrorList.ERROR_CODE, CargoErrorList.LHPV_SEQUENCE_COUNTER_MISSING);
							error.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.LHPV_SEQUENCE_COUNTER_MISSING_DESCRIPTION);
							request.setAttribute("cargoError", error);
							request.setAttribute("nextPageToken", "failure");
							return;
						}

						if(request.getParameter("isManualLHPV") == null)
							isSeqCounterPresent = true;

						if(isSeqCounterPresent && !sameSequenceForLsAndLhpv
								&& (lhpvSequenceCounter.getNextVal() < lhpvSequenceCounter.getMinRange() || lhpvSequenceCounter.getNextVal() > lhpvSequenceCounter.getMaxRange()) && checkManualLHPVSequenceRange) {
							error.put(CargoErrorList.ERROR_CODE, CargoErrorList.LHPV_SEQUENCE_COUNTER_OVER);
							error.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.LHPV_SEQUENCE_COUNTER_OVER_DESCRIPTION);
							request.setAttribute("cargoError", error);
							request.setAttribute("nextPageToken", "failure");
							return;
						}

						if(StringUtils.isEmpty(manualLHPVNumberStr) || "0".equals(manualLHPVNumberStr) || manualLHPVNumberStr.contentEquals("0")) {
							if(sameSequenceForLsAndLhpv) {
								if(StringUtils.isEmpty(lsNumber)) {
									error.put(CargoErrorList.ERROR_CODE, CargoErrorList.LS_NOT_FOUND);
									error.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.LS_NOT_FOUND_DESCRIPTION);
									request.setAttribute("cargoError", error);
									request.setAttribute("nextPageToken", "failure");
									return;
								}

								lhpvNumberString		= lsNumber;
							} else
								lhpvNumberString	= SequenceCounterBllImpl.getInstance().getGeneratedSequence(lhpvConfig, srcBranch.getBranchCode(), lhpvSequenceCounter.getNextVal());
						} else
							lhpvNumberString		= manualLHPVNumberStr;

						if(manualLHPVDate != null)
							isNumberExits = DuplicateTransactionCheckDao.getInstance().checkDuplicateTxnForFinancialYear(lhpvNumberString, 0, executive.getAccountGroupId(), (short)3,manualLHPVDate);
						else
							isNumberExits = DuplicateTransactionCheckDao.getInstance().checkDuplicateTxnForFinancialYear(lhpvNumberString, 0, executive.getAccountGroupId(), (short)3,createDate);

						if(isNumberExits && !sameSequenceForLsAndLhpv) {
							error.put(CargoErrorList.ERROR_CODE, CargoErrorList.LHPV_DUPLICATE_NUMBER);
							error.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.LHPV_DUPLICATE_NUMBER_DESCRIPTION);
							request.setAttribute("cargoError", error);
							request.setAttribute("nextPageToken", "failure");
							return;
						}

						if(request.getParameter("isManualLHPV") != null && manualLHPVDate != null) {
							noOfDays = cacheManip.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_MAX_DAYS_OF_OPERATION_BEFORE_CASHSTATEMENT_ENTRY_ID);

							for (final String value : values) {
								if(lsDetails != null)
									disLedger 				= lsDetails.get(Long.parseLong(value));
								else if(delRunSheetledgerIdWiseDTO != null)
									deliveryRunSheetLedger 	= delRunSheetledgerIdWiseDTO.get(Long.parseLong(value));

								if(disLedger != null) {
									validDateCode = validateManualLHPVDate(disLedger, manualLHPVDate, currentDateTime, noOfDays);

									if(validDateCode != 0) { // All ok

										valueOutObject	= new ValueObject();
										valueOutObject.put(AliasNameConstants.LS_NUMBER, disLedger.getLsNumber());

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
										case CargoErrorList.LHPV_DATE_EARLIER_TO_LS_DATE_ERROR:
											error.put(CargoErrorList.ERROR_CODE, CargoErrorList.LHPV_DATE_EARLIER_TO_LS_DATE_ERROR);
											error.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.errorDescription(CargoErrorList.LHPV_DATE_EARLIER_TO_LS_DATE_ERROR, valueOutObject));
											break;
										case CargoErrorList.CONFIGURE_LHPV_DATE_ERROR:
											error.put(CargoErrorList.ERROR_CODE, CargoErrorList.CONFIGURE_LHPV_DATE_ERROR);
											error.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.CONFIGURE_LHPV_DATE_ERROR_DESCRIPTION);
											break;
										default:
											break;
										}

										request.setAttribute("cargoError", error);
										request.setAttribute("nextPageToken", "failure");
										return;
									}
								} else if(deliveryRunSheetLedger != null) {
									validDateCode = validateManualLHPVDateForDDM(deliveryRunSheetLedger, manualLHPVDate, currentDateTime, noOfDays);

									if(validDateCode != 0) { // All ok

										valueOutObject	= new ValueObject();
										valueOutObject.put(AliasNameConstants.DDM_NUMBER, deliveryRunSheetLedger.getDdmNumber());

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
										case CargoErrorList.LHPV_DATE_EARLIER_TO_DDM_DATE_ERROR:
											error.put(CargoErrorList.ERROR_CODE, CargoErrorList.LHPV_DATE_EARLIER_TO_DDM_DATE_ERROR);
											error.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.errorDescription(CargoErrorList.LHPV_DATE_EARLIER_TO_DDM_DATE_ERROR, valueOutObject));
											break;
										case CargoErrorList.CONFIGURE_LHPV_DATE_ERROR:
											error.put(CargoErrorList.ERROR_CODE, CargoErrorList.CONFIGURE_LHPV_DATE_ERROR);
											error.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.CONFIGURE_LHPV_DATE_ERROR_DESCRIPTION);
											break;
										default:
											break;
										}

										request.setAttribute("cargoError", error);
										request.setAttribute("nextPageToken", "failure");
										return;
									}
								}
							}
						}

						if(lsDetails != null) {
							dispatchLedger   	= lsDetails.get(Long.parseLong(values[0]));
							vehicleNumberMaster = cacheManip.getVehicleNumber(request, executive.getAccountGroupId(), dispatchLedger.getVehicleNumberMasterId());
							dispatchLedger.setVehicleNumber(vehicleNumberMaster.getVehicleNumber());
						} else if(delRunSheetledgerIdWiseDTO != null) {
							deliveryRunSheetLedger  = delRunSheetledgerIdWiseDTO.get(Long.parseLong(values[0]));

							if(deliveryRunSheetLedger != null) {
								dispatchLedger		= new DispatchLedger();

								dispatchLedger.setVehicleNumberMasterId(deliveryRunSheetLedger.getVehicleId());
								dispatchLedger.setTotalActualWeight(deliveryRunSheetLedger.getTotalActualWeight());
								dispatchLedger.setDriverId(deliveryRunSheetLedger.getDriverId());
								dispatchLedger.setDriver2Id(deliveryRunSheetLedger.getDriver2Id());
								dispatchLedger.setDriver1MobileNumber1(deliveryRunSheetLedger.getDriverMobileNo());
								dispatchLedger.setDriver1MobileNumber2(deliveryRunSheetLedger.getDriver2MobileNo());

								vehicleNumberMaster 	= cacheManip.getVehicleNumber(request, executive.getAccountGroupId(), deliveryRunSheetLedger.getVehicleId());
								dispatchLedger.setVehicleNumber(vehicleNumberMaster.getVehicleNumber());
							}
						}

						lhpvSettlementObj   = getLHPVSettlementCharges(request,executive.getAccountGroupId());

						if(lhpvSettlementObj != null) {
							lhpvSettlementArr = (List<LhpvSettlementCharges>) lhpvSettlementObj.get("lhpvSettlementArr");
							chargesColl 	  = (HashMap<Long, Double>) lhpvSettlementObj.get("chargesColl");
						}

						if (lhpvChargeIdsListForVoucherSettlement != null && !lhpvChargeIdsListForVoucherSettlement.isEmpty()) {
							lhpvChargeExpenseVoucherSettlementList	= new ArrayList<>();

							for (final LhpvSettlementCharges lhpvSettlementCharges : lhpvSettlementArr) {
								if (!lhpvChargeIdsListForVoucherSettlement.contains(lhpvSettlementCharges.getLhpvChargeTypeMasterId()))
									continue;

								if (lhpvSettlementCharges.getChargeAmount() > 0) {
									lhpvChargeExpenseVoucherSettlement = new LHPVChargeExpenseVoucherSettlement();
									lhpvChargeExpenseVoucherSettlement.setLhpvChargeTypeMasterId(lhpvSettlementCharges.getLhpvChargeTypeMasterId());
									lhpvChargeExpenseVoucherSettlement.setLhpvChargeAmount(lhpvSettlementCharges.getChargeAmount());
									lhpvChargeExpenseVoucherSettlement.setLhpvChargeSettledAmount(0);
									lhpvChargeExpenseVoucherSettlement.setChargeSettlementStatus(LHPVConstant.LHPV_ADVANCE_SETTLEMENT_STATUS_DUE);
									lhpvChargeExpenseVoucherSettlementList.add(lhpvChargeExpenseVoucherSettlement);
								}
							}
						}

						lhpv = modelLHPVForCreate(request, lhpvNumberString, lsIds, dispatchLedger, vehicleNumberMaster, totalActualWeight, manualLHPVDate, lhpvTypeId, lhpvSettlementArr, boliWeight, truckLoadTypeId, typeOfLHPV);

						inValObj.put("modelLHPVForCreate", lhpv);
						inValObj.put("lhUpdate", cacheManip.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_TRUCK_ENGAGEMENT_FOR_GROUP));
						inValObj.put("lhpvSettlementArr", lhpvSettlementArr);
						inValObj.put("chargesColl", chargesColl);
						inValObj.put(LHPVChargeExpenseVoucherSettlement.LHPV_CHARGE_EXPENSE_VOUCHER_SETTLEMENT, lhpvChargeExpenseVoucherSettlementList);

						diff = Utility.getDayDiffBetweenTwoDates(lhpv.getCreationDateTimeStamp(), createDate);

						if(diff > 0){
							manualTransactionList = new ArrayList<>();
							manualTransaction	= createManualTransactionDto(lhpv);
							manualTransactionList.add(manualTransaction);

							manualTransactionArr = new ManualTransaction[manualTransactionList.size()];
							manualTransactionList.toArray(manualTransactionArr);

							inValObj.put("manualTransactionArr", manualTransactionArr);
						}

					} else { //Append = 2

						lhpvColl 			= (HashMap<Long, LHPVModel>)LHPVDao.getInstance().getLHPVDetailsByLHPVIds(""+lhpvId).get("LhpvColl");

						if(typeOfLHPV == LHPVConstant.TYPE_OF_LHPV_ID_NORMAL)
							outObj	 		= DispatchLedgerDao.getInstance().getLSDetailsByLHPVId(lhpvId);
						else if(typeOfLHPV == LHPVConstant.TYPE_OF_LHPV_ID_DDM)
							lsIdsForAppend	= DeliveryRunSheetLedgerDao.getInstance().getDDMOfLHPVByLHPVId(lhpvId, executive.getAccountGroupId());

						lhpvChargeExpenseVoucherSettlement	= LHPVChargeExpenseVoucherSettlementDaoImpl.getInstance().getLHPVChargeExpenseVoucherSettlementByLHPVIdAndLHPVChargeTypeMasterId(lhpvId, LHPVChargeTypeConstant.ADVANCE_AMOUNT);

						if(outObj != null)
							if(outObj.get("lsIds") != null )
								lsIdsForAppend = lsIds + "," + outObj.get("lsIds").toString();
							else
								lsIdsForAppend = lsIds;

						if(lhpvColl != null) {
							lhpvModel = lhpvColl.get(lhpvId);

							if(lhpvModel.getLhpvTypeId() != lhpvTypeId)
								lhpvTypeId = LHPVConstant.LHPV_TYPE_ID_BOTH;

							if(arrivalTruckList != null && !arrivalTruckList.isEmpty())
								for (final ArrivalTruckDetails element : arrivalTruckList) {
									element.setLhpvId(lhpvModel.getLhpvId());
									element.setLhpvNumber(lhpvModel.getLhpvNumber());
									element.setLhpvSourceBranchId(lhpvModel.getSourceBranchId());
									element.setLhpvDestinatinBranchId(lhpvModel.getDestinationBranchId());
									element.setLhpvDateTimeStamp(lhpvModel.getCreationDateTimeStamp());
								}
						} else
							lhpvModel = new LHPVModel();

						if(executive.getAccountGroupId() == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_JAGRUTI_TRANSPORTS) {
							inValObj.put("updatemodelSettlementChargesArr", updateLHPVChargesForJagruti(executive,lhpvId,request));
							inValObj.put("lhpvIdForUpdate", lhpvId);
						}

						inValObj.put("modelLHPVForAppend", modelLHPVForAppend(lhpvId, lsIds, lhpvNumber, lhpvBranchId, totalActualWeight, lhpvModel, lsIdsForAppend, lhpvTypeId, totalAmount, typeOfLHPV));

						if((lhpvChargeExpenseVoucherSettlement == null || lhpvChargeExpenseVoucherSettlement.getChargeSettlementStatus() == LHPVConstant.LHPV_ADVANCE_SETTLEMENT_STATUS_DUE) && (boolean) lhpvConfig.getOrDefault(LHPVPropertiesConstant.CALCULATE_ADVANCE_FROM_TRUCK_DLY_TOPAY_LR, false)) {
							updateLHPVChrgsTruckDlyWiseValObj	= updateLHPVChargesTruckDeliveryWise(executive,lhpvId,request);
							updateLHPVChrgsTruckDlyWiseValObj.put(LHPVChargeExpenseVoucherSettlement.LHPV_CHARGE_EXPENSE_VOUCHER_SETTLEMENT, lhpvChargeExpenseVoucherSettlement);
							lhpvChargeExpenseVoucherSettlementList	= updateLHPVChargeExpenseVoucherAdvanceAmount(updateLHPVChrgsTruckDlyWiseValObj);
							inValObj.put(LHPVChargeExpenseVoucherSettlement.LHPV_CHARGE_EXPENSE_VOUCHER_SETTLEMENT, lhpvChargeExpenseVoucherSettlementList);
						}
					}

					if(arrivalTruckList != null && !arrivalTruckList.isEmpty()){
						arrivalTruckArr = new ArrivalTruckDetails[arrivalTruckList.size()];
						arrivalTruckList.toArray(arrivalTruckArr);
					}

					lrCostConfiguration	= cacheManip.getGroupWiseLRCostConfiguration(request, executive.getAccountGroupId());

					if(updateLHPVChrgsTruckDlyWiseValObj != null)
						updateLHPVChrgsTruckDlyWiseValObj.put(LrCostConfigurationDTO.LR_COST_CONFIGURATION, lrCostConfiguration);

					inValObj.put("arrivalTruckArr",arrivalTruckArr);
					inValObj.put("lsIds", lsIds);
					inValObj.put("totalAmount", totalAmount);
					inValObj.put(LrCostConfigurationDTO.LR_COST_CONFIGURATION, lrCostConfiguration);
					inValObj.put("accountGroupId", executive.getAccountGroupId());
					inValObj.put("lsIdsForAppend",lsIdsForAppend);
					inValObj.put(LHPVPropertiesConstant.LHPV_CONFIGURATION, lhpvConfig);
					inValObj.put("updateLHPVChrgsTruckDlyWiseValObj",updateLHPVChrgsTruckDlyWiseValObj);

					if(JSPUtility.GetDouble(request, "tdsAmount", 0.00) > 0)
						inValObj.put(TDSTxnDetails.TDS_TXN_DETAILS, TDSTxnAction.getTDSTxnDetailsDTOForLHPV(request, lhpv));

					valueOutObject	= LHPVBLL.getInstance().lhpvTransaction(inValObj);

					if(valueOutObject != null)
						response.sendRedirect("SearchWayBill.do?pageId=3&eventId=9&dispatchLedgerId="+values[0]+"&isLhpvLockingAfterLsCreation="+isLhpvLockingAfterLsCreation+"&lsNumbersString="+lsNumbersString.toString()+"&lsIds="+lsIds+"&Type=Dispatched&LVHPNo="+valueOutObject.get("lhpvNumber").toString()+"&lhpvId="+valueOutObject.getLong(Constant.LHPV_ID, 0)+"&typeOfLHPV=" + typeOfLHPV);
					else {
						error.put(CargoErrorList.ERROR_CODE, CargoErrorList.LHPV_ERROR);
						error.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.LHPV_ERROR_DESCRIPTION);
						request.setAttribute("cargoError", error);
						request.setAttribute("nextPageToken", "failure");
					}
				} else {
					error.put(CargoErrorList.ERROR_CODE, CargoErrorList.LHPV_ALREADY_CREATED_ERROR);
					error.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.LHPV_ALREADY_CREATED_ERROR_DESCRIPTION);
					request.setAttribute("cargoError", error);
					request.setAttribute("nextPageToken", "failure");
				}
			} else {
				error.put(CargoErrorList.ERROR_CODE, CargoErrorList.LHPV_ERROR);
				error.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.LHPV_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
				request.setAttribute("nextPageToken", "failure");
			}
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		} finally {
			error 									= null;
			inValObj								= null;
			outObj									= null;
			values									= null;
			lsIds									= null;
			lsIdsForAppend							= null;
			lhpvSequenceCounter						= null;
			srcDestWiseLHPVSeqCounter				= null;
			lsDetails								= null;
			vehicleNumberMaster						= null;
			dispatchLedger							= null;
			disLedger								= null;
			cacheManip								= null;
			lhpvNumber 								= null;
			lhpvColl								= null;
			lhpvModel								= null;
			valueOutObject							= null;
			manualLHPVDate							= null;
			sdf										= null;
			arrivalTruckList						= null;
			arrivalTruckArr							= null;
			manualTransaction						= null;
			manualTransactionList 					= null;
			manualTransactionArr 					= null;
			lhpv 									= null;
			lhpvSettlementArr						= null;
			lrCostConfiguration						= null;
			lhpvSettlementObj						= null;
			chargesColl								= null;
			currentDateTime							= null;
			destBranch								= null;
			updateLHPVChrgsTruckDlyWiseValObj		= null;
			lhpvConfig			    				= null;
			lhpvChargeIdsStringForVoucherSettlement	= null;
			lhpvChargeIdsListForVoucherSettlement	= null;
			lhpvChargeExpenseVoucherSettlement		= null;
			lhpvChargeExpenseVoucherSettlementList	= null;
		}
	}

	@SuppressWarnings("unchecked")
	private List<LhpvSettlementCharges> updateLHPVChargesForJagruti(final Executive executive, final long lhpvId, final HttpServletRequest request)throws Exception {
		ValueObject						valueOutObject					= null;
		ValueObject						valueOutObjectForCharges		= null;
		HashMap<Long, Double>			chargesColl						= null;
		LhpvChargesForGroup[]			modelArr						= null;
		List<LhpvSettlementCharges>		updatemodelSettlementChargesArr	= null;
		LhpvSettlementCharges			modelSettlementCharges			= null;

		try {

			valueOutObject 				= LhpvSettlementChargesDao.getInstance().getSetlementChargesByBlhpvId(lhpvId, LhpvChargesForGroup.IDENTIFIER_TYPE_LHPV);
			valueOutObjectForCharges 	= LhpvChargesForGroupDao.getInstance().getallLHPVChargeByAccGrpId(executive.getAccountGroupId(), LhpvChargesForGroup.IDENTIFIER_TYPE_LHPV);

			if(valueOutObject != null)
				chargesColl = (HashMap<Long, Double>) valueOutObject.get("chargesColl");

			if(valueOutObjectForCharges != null)
				modelArr = (LhpvChargesForGroup[]) valueOutObjectForCharges.get("modelArr");

			if(chargesColl != null){
				updatemodelSettlementChargesArr = new ArrayList<>();

				for (final LhpvChargesForGroup element : modelArr) {
					modelSettlementCharges = new LhpvSettlementCharges();
					modelSettlementCharges.setLhpvChargeTypeMasterId(element.getLhpvChargeTypeMasterId());
					modelSettlementCharges.setLhpvId(lhpvId);

					if( element.getLhpvChargeTypeMasterId() ==  Long.parseLong(LHPVChargeTypeConstant.LORRY_HIRE+"") ){
						if(chargesColl.get(element.getLhpvChargeTypeMasterId()) != null){
							modelSettlementCharges.setChargeAmount(chargesColl.get(element.getLhpvChargeTypeMasterId())+JSPUtility.GetDouble(request, "charge"+element.getLhpvChargeTypeMasterId(),0.00));
							chargesColl.put(element.getLhpvChargeTypeMasterId(), chargesColl.get(element.getLhpvChargeTypeMasterId())+JSPUtility.GetDouble(request, "charge"+element.getLhpvChargeTypeMasterId(),0.00));
						}else{
							modelSettlementCharges.setChargeAmount(JSPUtility.GetDouble(request, "charge"+element.getLhpvChargeTypeMasterId(),0.00));
							chargesColl.put(element.getLhpvChargeTypeMasterId(), JSPUtility.GetDouble(request, "charge"+element.getLhpvChargeTypeMasterId(),0.00));
						}
					} else if(chargesColl.get(element.getLhpvChargeTypeMasterId()) != null)
						modelSettlementCharges.setChargeAmount(chargesColl.get(element.getLhpvChargeTypeMasterId()));

					updatemodelSettlementChargesArr.add(modelSettlementCharges);
				}

				LHPVBLL.getInstance().setLHPVBalanceAmount(modelArr, chargesColl, updatemodelSettlementChargesArr);
			}

			return updatemodelSettlementChargesArr;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	@SuppressWarnings("unchecked")
	private ValueObject updateLHPVChargesTruckDeliveryWise(final Executive executive, final long lhpvId, final HttpServletRequest request) throws Exception {
		ValueObject							valueOutObject					= null;
		ValueObject							valueOutObjectForCharges		= null;
		HashMap<Long, Double>				chargesColl						= null;
		LhpvChargesForGroup[]				modelArr						= null;
		List<LhpvSettlementCharges>			lhpvSettlementArraylist 		= null;
		LhpvSettlementCharges				modelSettlementCharges			= null;
		ArrayList<Long>						lhpvChargesMasterIdArrList 		= null;
		StringJoiner						settlementChrgsWithAmount		= null;
		HashMap<Long, Double> 				lhpvSettlmentChargesHshmp		= null;
		ValueObject							valOutObject					= null;
		var								balanceAmount					= 0D;

		try {

			valueOutObject 				= LhpvSettlementChargesDao.getInstance().getSetlementChargesByBlhpvId(lhpvId, LhpvChargesForGroup.IDENTIFIER_TYPE_LHPV);
			valueOutObjectForCharges 	= LhpvChargesForGroupDao.getInstance().getallLHPVChargeByAccGrpId(executive.getAccountGroupId(), LhpvChargesForGroup.IDENTIFIER_TYPE_LHPV);

			if(valueOutObject != null) {
				chargesColl 				= (HashMap<Long, Double>) valueOutObject.get("chargesColl");
				lhpvChargesMasterIdArrList 	= (ArrayList<Long>) valueOutObject.get("lhpvChargesMasterIdArrList");
			}

			settlementChrgsWithAmount = new StringJoiner(",");

			if(lhpvChargesMasterIdArrList != null && !lhpvChargesMasterIdArrList.isEmpty())
				for (final Long element : lhpvChargesMasterIdArrList)
					settlementChrgsWithAmount.add(element + "=" + chargesColl.get(element));

			if(valueOutObjectForCharges != null)
				modelArr = (LhpvChargesForGroup[]) valueOutObjectForCharges.get("modelArr");

			if(chargesColl != null && !chargesColl.isEmpty()) {
				lhpvSettlementArraylist 	= new ArrayList<>();
				lhpvSettlmentChargesHshmp 	= new HashMap<>();

				for (final LhpvChargesForGroup element : modelArr) {
					modelSettlementCharges = new LhpvSettlementCharges();
					modelSettlementCharges.setLhpvId(lhpvId);
					modelSettlementCharges.setLhpvChargeTypeMasterId(element.getLhpvChargeTypeMasterId());
					modelSettlementCharges.setAccountGroupId(executive.getAccountGroupId());
					modelSettlementCharges.setIdentifier(LhpvChargesForGroup.IDENTIFIER_TYPE_LHPV);

					if(chargesColl.get(element.getLhpvChargeTypeMasterId()) != null && element.getLhpvChargeTypeMasterId() == Long.parseLong(LHPVChargeTypeConstant.ADVANCE_AMOUNT+"")){
						modelSettlementCharges.setChargeAmount(chargesColl.get(element.getLhpvChargeTypeMasterId())+JSPUtility.GetDouble(request, "charge"+element.getLhpvChargeTypeMasterId(),0.00));
						chargesColl.put(element.getLhpvChargeTypeMasterId(), modelSettlementCharges.getChargeAmount());
					} else if (chargesColl.get(element.getLhpvChargeTypeMasterId()) != null && element.getLhpvChargeTypeMasterId() == Long.parseLong(LHPVChargeTypeConstant.BALANCE_AMOUNT+"")) {
						balanceAmount	= chargesColl.get(element.getLhpvChargeTypeMasterId()) - JSPUtility.GetDouble(request, "charge"+Long.parseLong(LHPVChargeTypeConstant.ADVANCE_AMOUNT+""));

						if(balanceAmount > 0)
							modelSettlementCharges.setChargeAmount(balanceAmount);
						else
							modelSettlementCharges.setChargeAmount(0);

						chargesColl.put(element.getLhpvChargeTypeMasterId(), balanceAmount);
					} else {
						if(chargesColl.get(element.getLhpvChargeTypeMasterId()) != null)
							modelSettlementCharges.setChargeAmount(chargesColl.get(element.getLhpvChargeTypeMasterId()));

						if(element.getLhpvChargeTypeMasterId() == Long.parseLong(LHPVChargeTypeConstant.ADVANCE_AMOUNT+"")) {
							modelSettlementCharges.setChargeAmount(JSPUtility.GetDouble(request, "charge"+element.getLhpvChargeTypeMasterId(),0.00));
							chargesColl.put(element.getLhpvChargeTypeMasterId(), modelSettlementCharges.getChargeAmount());
						}
					}

					if(chargesColl.get(element.getLhpvChargeTypeMasterId()) != null && element.getLhpvChargeTypeMasterId() == Long.parseLong(LHPVChargeTypeConstant.REFUND_AMOUNT+"") && chargesColl.get(Long.parseLong(LHPVChargeTypeConstant.BALANCE_AMOUNT+"")) != null) {
						balanceAmount	= chargesColl.get(Long.parseLong(LHPVChargeTypeConstant.BALANCE_AMOUNT+""));

						if(balanceAmount > 0)
							modelSettlementCharges.setChargeAmount(0);
						else
							modelSettlementCharges.setChargeAmount(-balanceAmount);
					}

					lhpvSettlmentChargesHshmp.put(modelSettlementCharges.getLhpvChargeTypeMasterId(), modelSettlementCharges.getChargeAmount());
					lhpvSettlementArraylist.add(modelSettlementCharges);
				}

				LHPVBLL.getInstance().setLHPVBalanceAmount(modelArr, lhpvSettlmentChargesHshmp, lhpvSettlementArraylist);
			} else if(JSPUtility.GetDouble(request, "charge" + Long.parseLong(LHPVChargeTypeConstant.ADVANCE_AMOUNT+""),0) > 0) {
				lhpvSettlementArraylist 	= new ArrayList<>();
				lhpvSettlmentChargesHshmp 	= new HashMap<>();

				for (final LhpvChargesForGroup element : modelArr) {
					modelSettlementCharges = new LhpvSettlementCharges();
					modelSettlementCharges.setLhpvId(lhpvId);
					modelSettlementCharges.setLhpvChargeTypeMasterId(element.getLhpvChargeTypeMasterId());
					modelSettlementCharges.setAccountGroupId(executive.getAccountGroupId());
					modelSettlementCharges.setIdentifier(LhpvChargesForGroup.IDENTIFIER_TYPE_LHPV);

					if(element.getLhpvChargeTypeMasterId() == Long.parseLong(LHPVChargeTypeConstant.ADVANCE_AMOUNT+""))
						modelSettlementCharges.setChargeAmount(JSPUtility.GetDouble(request, "charge"+element.getLhpvChargeTypeMasterId(),0.00));
					else if(element.getLhpvChargeTypeMasterId() == Long.parseLong(LHPVChargeTypeConstant.REFUND_AMOUNT+"")){
						balanceAmount	= JSPUtility.GetDouble(request, "charge"+Long.parseLong(LHPVChargeTypeConstant.ADVANCE_AMOUNT+""));
						modelSettlementCharges.setChargeAmount(balanceAmount);
					} else
						modelSettlementCharges.setChargeAmount(0);

					lhpvSettlmentChargesHshmp.put(modelSettlementCharges.getLhpvChargeTypeMasterId(), modelSettlementCharges.getChargeAmount());
					lhpvSettlementArraylist.add(modelSettlementCharges);
				}
			}

			valOutObject	= new ValueObject();

			valOutObject.put(Constant.LHPV_ID, lhpvId);
			valOutObject.put("executive", executive);

			if(lhpvSettlementArraylist != null  && !lhpvSettlementArraylist.isEmpty()) {
				valOutObject.put("lhpvChargeIds", settlementChrgsWithAmount.toString());
				valOutObject.put("lhpvSettlmentChargesArrList", lhpvSettlementArraylist);
				valOutObject.put("lhpvChargesmodelArr", modelArr);
				valOutObject.put("lhpvSettlmentChargesHshmp", lhpvSettlmentChargesHshmp);
			}

			return valOutObject;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		} finally {
			valueOutObject					= null;
			valueOutObjectForCharges		= null;
			chargesColl						= null;
			modelArr						= null;
			lhpvSettlementArraylist 		= null;
			modelSettlementCharges			= null;
			lhpvChargesMasterIdArrList 		= null;
			settlementChrgsWithAmount		= null;
			lhpvSettlmentChargesHshmp		= null;
			valOutObject					= null;
			balanceAmount					= 0;
		}
	}

	@SuppressWarnings("unchecked")
	private List<LHPVChargeExpenseVoucherSettlement> updateLHPVChargeExpenseVoucherAdvanceAmount(final ValueObject updateLHPVChrgsTruckDlyWiseValObj) throws Exception{
		var											lhpvId									= 0L;
		LHPVChargeExpenseVoucherSettlement				lhpvChargeExpenseVoucherSettlement		= null;
		HashMap<Long, Double>							lhpvSettlmentChargesHshmp 				= null;
		List<LHPVChargeExpenseVoucherSettlement>		lhpvChargeExpenseVoucherSettlementList	= null;

		try {
			lhpvId									= updateLHPVChrgsTruckDlyWiseValObj.getLong(Constant.LHPV_ID);
			lhpvSettlmentChargesHshmp				= (HashMap<Long, Double>) updateLHPVChrgsTruckDlyWiseValObj.get("lhpvSettlmentChargesHshmp");

			if (lhpvSettlmentChargesHshmp != null && lhpvSettlmentChargesHshmp.containsKey((long)LHPVChargeTypeConstant.ADVANCE_AMOUNT) && lhpvSettlmentChargesHshmp.get((long)LHPVChargeTypeConstant.ADVANCE_AMOUNT) > 0) {
				lhpvChargeExpenseVoucherSettlement	= (LHPVChargeExpenseVoucherSettlement) updateLHPVChrgsTruckDlyWiseValObj.get(LHPVChargeExpenseVoucherSettlement.LHPV_CHARGE_EXPENSE_VOUCHER_SETTLEMENT);

				if (lhpvChargeExpenseVoucherSettlement == null) {
					lhpvChargeExpenseVoucherSettlement	= new LHPVChargeExpenseVoucherSettlement();
					lhpvChargeExpenseVoucherSettlement.setLhpvId(lhpvId);
					lhpvChargeExpenseVoucherSettlement.setLhpvChargeTypeMasterId(LHPVChargeTypeConstant.ADVANCE_AMOUNT);
					lhpvChargeExpenseVoucherSettlement.setLhpvChargeAmount(lhpvSettlmentChargesHshmp.get((long)LHPVChargeTypeConstant.ADVANCE_AMOUNT));
					lhpvChargeExpenseVoucherSettlement.setLhpvChargeSettledAmount(0);
					lhpvChargeExpenseVoucherSettlement.setChargeSettlementStatus(LHPVConstant.LHPV_ADVANCE_SETTLEMENT_STATUS_DUE);
				} else
					lhpvChargeExpenseVoucherSettlement.setLhpvChargeAmount(lhpvSettlmentChargesHshmp.get((long)LHPVChargeTypeConstant.ADVANCE_AMOUNT));

				lhpvChargeExpenseVoucherSettlementList	= new ArrayList<>();
				lhpvChargeExpenseVoucherSettlementList.add(lhpvChargeExpenseVoucherSettlement);
			}

			return lhpvChargeExpenseVoucherSettlementList;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, CreateLHPVAction.TRACE_ID);
		}
	}

	@SuppressWarnings("unchecked")
	private ValueObject getLHPVSettlementCharges(final HttpServletRequest request, final long accountGroupId)throws Exception {
		ValueObject							lhpvChargeVal				= null;
		ArrayList<Long> 					chargemasterIds 			= null;
		List<LhpvSettlementCharges>		 	lhpvSettlmentChargesArrList = null;
		HashMap<Long, Double> 				lhpvSettlmentChargesHshmp	= null;
		LhpvSettlementCharges				lhpvChargeMod				= null;
		LhpvChargesForGroup[]				lhpvChargesmodelArr			= null;
		ValueObject							outValueObj					= null;

		try {

			lhpvChargeVal = LhpvChargesForGroupDao.getInstance().getallLHPVChargeByAccGrpId(accountGroupId,LhpvChargesForGroup.IDENTIFIER_TYPE_LHPV);
			lhpvSettlmentChargesArrList = new ArrayList<>();
			lhpvSettlmentChargesHshmp = new HashMap<>();

			if(lhpvChargeVal  != null){
				chargemasterIds		=  (ArrayList<Long>) lhpvChargeVal.get("chargemasterIds");
				lhpvChargesmodelArr	=  (LhpvChargesForGroup[]) lhpvChargeVal.get("modelArr");

				for (final Long chargemasterId : chargemasterIds) {

					lhpvChargeMod = new LhpvSettlementCharges();
					lhpvChargeMod.setAccountGroupId(accountGroupId);
					lhpvChargeMod.setLhpvChargeTypeMasterId(chargemasterId);

					if(request.getParameter("charge"+chargemasterId) != null)
						lhpvChargeMod.setChargeAmount(JSPUtility.GetDouble(request, "charge"+chargemasterId ,0));

					lhpvChargeMod.setIdentifier(LhpvChargesForGroup.IDENTIFIER_TYPE_LHPV);
					lhpvSettlmentChargesArrList.add(lhpvChargeMod);
					lhpvSettlmentChargesHshmp.put(lhpvChargeMod.getLhpvChargeTypeMasterId(), lhpvChargeMod.getChargeAmount());
				}

				LHPVBLL.getInstance().setLHPVBalanceAmount(lhpvChargesmodelArr, lhpvSettlmentChargesHshmp, lhpvSettlmentChargesArrList);
			}

			if(!lhpvSettlmentChargesArrList.isEmpty()){
				outValueObj = new ValueObject();

				outValueObj.put("lhpvSettlementArr", lhpvSettlmentChargesArrList);
				outValueObj.put("chargesColl", lhpvSettlmentChargesHshmp);
				return outValueObj;
			}

			return null;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private LHPV modelLHPVForCreate(final HttpServletRequest request, final String lHPVNumber, final String lsIds, final DispatchLedger dispatchLedger, final VehicleNumberMaster vehicleNumberMaster, final double totalActualWeight, final Timestamp manualLHPVDate, final short lhpvTypeId, final List<LhpvSettlementCharges> lhpvSettlementArr, final double boliWeight, final short truckLoadType, final short typeOfLHPV) throws Exception {
		LHPV 				lhpv 			= null;
		var				driverMasterId	= 0L;
		String				lrIds			= null;

		try {

			lhpv = new LHPV();

			if(request.getParameter("isManualLHPV") != null) {
				lhpv.setManual(true);

				if(manualLHPVDate != null)
					lhpv.setCreationDateTimeStamp(manualLHPVDate);
				else
					lhpv.setCreationDateTimeStamp(createDate);
			} else
				lhpv.setCreationDateTimeStamp(createDate);

			lhpv.setTypeOfLhpv(typeOfLHPV);
			lhpv.setActualDateTime(createDate);
			lhpv.setAccountGroupId(executive.getAccountGroupId());
			lhpv.setExecutiveId(executive.getExecutiveId());
			lhpv.setBranchId(executive.getBranchId());

			for(final LhpvSettlementCharges lhpvSettlementCharges : lhpvSettlementArr)
				if(lhpvSettlementCharges.getLhpvChargeTypeMasterId() == Long.parseLong(LHPVChargeTypeConstant.LORRY_HIRE+""))
					lhpv.setTotalAmount(lhpvSettlementCharges.getChargeAmount());
				else if(lhpvSettlementCharges.getLhpvChargeTypeMasterId() == Long.parseLong(LHPVChargeTypeConstant.ADVANCE_AMOUNT+""))
					lhpv.setAdvanceAmount(lhpvSettlementCharges.getChargeAmount());
				else if(lhpvSettlementCharges.getLhpvChargeTypeMasterId() == Long.parseLong(LHPVChargeTypeConstant.BALANCE_AMOUNT+""))
					lhpv.setBalanceAmount(lhpvSettlementCharges.getChargeAmount());
				else if(lhpvSettlementCharges.getLhpvChargeTypeMasterId() == Long.parseLong(LHPVChargeTypeConstant.REFUND_AMOUNT+""))
					lhpv.setRefund(lhpvSettlementCharges.getChargeAmount());
				else if(lhpvSettlementCharges.getLhpvChargeTypeMasterId() == Long.parseLong(LHPVChargeTypeConstant.RATE_PMT+""))
					lhpv.setRatePMT(lhpvSettlementCharges.getChargeAmount());
				else if(lhpvSettlementCharges.getLhpvChargeTypeMasterId() == Long.parseLong(LHPVChargeTypeConstant.UNLOADING+""))
					lhpv.setUnloading(lhpvSettlementCharges.getChargeAmount());
				else if(lhpvSettlementCharges.getLhpvChargeTypeMasterId() == Long.parseLong(LHPVChargeTypeConstant.DETENTION+""))
					lhpv.setDetaintion(lhpvSettlementCharges.getChargeAmount());
				else if(lhpvSettlementCharges.getLhpvChargeTypeMasterId() == Long.parseLong(LHPVChargeTypeConstant.OTHER_ADDITIONAL+""))
					lhpv.setOtherAdditionalCharge(lhpvSettlementCharges.getChargeAmount());
				else if(lhpvSettlementCharges.getLhpvChargeTypeMasterId() == Long.parseLong(LHPVChargeTypeConstant.DEDUCTION+""))
					lhpv.setDeduction(lhpvSettlementCharges.getChargeAmount());
				else if(lhpvSettlementCharges.getLhpvChargeTypeMasterId() == Long.parseLong(LHPVChargeTypeConstant.TOPAY_RECEIVED+""))
					lhpv.setToPayReceived(lhpvSettlementCharges.getChargeAmount());

			lhpv.setBalancePayableAtBranchId(JSPUtility.GetLong(request, "BalancePayableBranchId", 0));
			lhpv.setDispatchLedgersToUpdate(lsIds);
			lhpv.setMaterials(request.getParameter("materials"));
			lhpv.setlHPVNumber(lHPVNumber.toUpperCase());
			lhpv.setlHPVBranchId(executive.getBranchId());

			if(dispatchLedger != null) {
				lhpv.setVehicleAgentMasterId(dispatchLedger.getVehicleAgentId());
				lhpv.setVehicleNumberMasterId(dispatchLedger.getVehicleNumberMasterId());
				lhpv.setDriverMasterId(dispatchLedger.getDriverId());
				lhpv.setDriver2MasterId(dispatchLedger.getDriver2Id());
				lhpv.setDeliveryPlaceId(dispatchLedger.getDeliveryPlaceId());
				lhpv.setDriver1MobileNumber1(dispatchLedger.getDriver1MobileNumber1());
				lhpv.setDriver1MobileNumber2(dispatchLedger.getDriver1MobileNumber2());

			} else {
				lhpv.setVehicleAgentMasterId(0);
				lhpv.setVehicleNumberMasterId(0);
				lhpv.setDriver2MasterId(0);
				lhpv.setDeliveryPlaceId(0);
				lhpv.setDriver1MobileNumber1("0000000000");
				lhpv.setDriver1MobileNumber2("0000000000");
				lhpv.setDriverMasterId(0);
			}

			if(JSPUtility.GetString(request, "lhpvDriver", null) != null)
				lhpv.setDriverName(JSPUtility.GetString(request, "lhpvDriver", null));
			else
				lhpv.setDriverName(dispatchLedger.getDriverName());


			driverMasterId		= JSPUtility.GetLong(request, "driverMasterId", 0);

			if(driverMasterId > 0)
				lhpv.setDriverMasterId(driverMasterId);

			lhpv.setBoliWeight(boliWeight);
			lhpv.setTruckLoadType(truckLoadType);
			lhpv.setDestinationBranchId(JSPUtility.GetLong(request, "DestinationBranchId", 0));
			lhpv.setVehicleCapacity(vehicleNumberMaster.getVehicleTypeCapacity());
			lhpv.setTotalActualWeight(totalActualWeight);
			lhpv.setWeightDifference(lhpv.getVehicleCapacity() - lhpv.getTotalActualWeight());
			lhpv.setPaymentType(JSPUtility.GetShort(request, "paymentType_val", (short)0));
			lhpv.setLhpvSourceBranchId(executive.getBranchId());

			if(executive.getAccountGroupId() == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_LMT)
				lhpv.setLoadedBy(JSPUtility.GetShort(request, "loadedBy", (short)0));
			else
				lhpv.setLoadedBy(TransportCommonMaster.LOADED_BY_OUR_ID);

			//Cheque Date Date calculation (Start)
			final var	dt = JSPUtility.GetString(request, "chequeDate_val", "");

			lhpv.setChequeDate(DateTimeUtility.getChequeDateTime(dt));

			//Cheque Date Date calculation (End)
			lhpv.setChequeNumber(JSPUtility.GetString(request, "chequeNo_val", null));
			lhpv.setChequeAmount(JSPUtility.GetDouble(request, "chequeAmount_val", 0.00));
			lhpv.setBankName(JSPUtility.GetString(request, "bankName_val", null));
			lhpv.setRemark(JSPUtility.GetString(request, "remark", null));
			lhpv.setLhpvTypeId(lhpvTypeId);
			lhpv.setWeighbridge(JSPUtility.GetDouble(request, "weighBridge", 0.00));

			//Code for adding booking type
			if (lsIds != null && lsIds.length() > 0) {

				ValueObject 						outObjForDispatchSummary			= null;
				HashMap<Long, ConsignmentSummary> 	conSumHM;
				ConsignmentSummary 				  	conSum   							= null;

				var isSundry = false;
				var isFTL = false;
				var isDDDV = false;

				if(typeOfLHPV == LHPVConstant.TYPE_OF_LHPV_ID_NORMAL) {
					outObjForDispatchSummary 	= DispatchSummaryDao.getInstance().getLROfLS(lsIds, executive.getAccountGroupId());
					lrIds						= (String) outObjForDispatchSummary.get("lrIds");
				} else if (typeOfLHPV == LHPVConstant.TYPE_OF_LHPV_ID_DDM) {
					final var	drsmLedgerList	= DeliveryRunSheetSummaryDao.getInstance().getAllDeliveryRunSheetLedgerData(lsIds);

					if(!drsmLedgerList.isEmpty())
						lrIds			= drsmLedgerList.stream().map(e -> Long.toString(e.getWayBillId())).collect(Collectors.joining(Constant.COMMA));
				}

				conSumHM 					= ConsignmentSummaryDao.getInstance().getLimitedConsignmentDetails(lrIds);

				for(final Map.Entry<Long, ConsignmentSummary> entry : conSumHM.entrySet()) {
					conSum = entry.getValue();

					if(conSum.getBookingTypeId() == BookingTypeConstant.BOOKING_TYPE_SUNDRY_ID && !isSundry) {
						isSundry = true;

						lhpv.setBookingTypeId(BookingTypeConstant.BOOKING_TYPE_SUNDRY_ID);

						if(isFTL)
							lhpv.setBookingTypeId(BookingTypeConstant.SUNDRY_FTL_ID);

						if(isDDDV)
							lhpv.setBookingTypeId(BookingTypeConstant.SUNDRY_DDDV_ID);

						if(isDDDV && isFTL) {
							lhpv.setBookingTypeId(BookingTypeConstant.SUNDRY_FTL_DDDV_ID);
							break;
						}
					} else if(conSum.getBookingTypeId() == BookingTypeConstant.BOOKING_TYPE_FTL_ID && !isFTL) {
						isFTL = true;

						lhpv.setBookingTypeId(BookingTypeConstant.BOOKING_TYPE_FTL_ID);

						if(isSundry)
							lhpv.setBookingTypeId(BookingTypeConstant.SUNDRY_FTL_ID);

						if(isDDDV)
							lhpv.setBookingTypeId(BookingTypeConstant.FTL_DDDV_ID);

						if(isDDDV && isSundry) {
							lhpv.setBookingTypeId(BookingTypeConstant.SUNDRY_FTL_DDDV_ID);
							break;
						}
					} else if(conSum.getBookingTypeId() == BookingTypeConstant.DIRECT_DELIVERY_DIRECT_VASULI_ID && !isDDDV) {
						isDDDV = true;

						lhpv.setBookingTypeId(BookingTypeConstant.DIRECT_DELIVERY_DIRECT_VASULI_ID);

						if(isSundry)
							lhpv.setBookingTypeId(BookingTypeConstant.SUNDRY_DDDV_ID);

						if(isFTL)
							lhpv.setBookingTypeId(BookingTypeConstant.FTL_DDDV_ID);

						if(isSundry && isFTL) {
							lhpv.setBookingTypeId(BookingTypeConstant.SUNDRY_FTL_DDDV_ID);
							break;
						}
					}
				}
			}
			//Code for adding booking type ends here

			return lhpv;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private LHPV modelLHPVForAppend(final long lhpvId ,final String lsIds ,final String lhpvNumber ,final long lhpvBranchId ,final double totalActualWeight ,final LHPVModel lhpvModel ,final String lsIdsForAppend,final short  lhpvTypeId, final double totalAmount, final short selectLHPVType) throws Exception {

		LHPV 			lhpv 			= null;
		String			lrIds			= null;

		try {

			lhpv = new LHPV();

			lhpv.setLhpvId(lhpvId);
			lhpv.setDispatchLedgersToUpdate(lsIds);
			lhpv.setlHPVNumber(lhpvNumber);
			lhpv.setlHPVBranchId(lhpvBranchId);
			lhpv.setVehicleCapacity(lhpvModel.getVehicleCapacity());
			lhpv.setTotalActualWeight(lhpvModel.getTotalActualWeight() + totalActualWeight);//1st add existing wght of lhpv
			lhpv.setWeightDifference(lhpv.getVehicleCapacity() - lhpv.getTotalActualWeight());
			lhpv.setTotalAmount(lhpvModel.getTotalAmount() + totalAmount);
			lhpv.setBalanceAmount(lhpvModel.getBalanceAmount() + totalAmount);
			lhpv.setLhpvTypeId(lhpvTypeId);
			lhpv.setCreationDateTimeStamp(lhpvModel.getCreationDateTimeStamp());

			//Code for adding booking type
			if (lsIdsForAppend != null && lsIdsForAppend.length() > 0) {

				ValueObject 						outObjForDispatchSummary			= null;
				HashMap<Long, ConsignmentSummary> 	conSumHM;
				ConsignmentSummary 				  	conSum   							= null;

				var isSundry = false;
				var isFTL = false;
				var isDDDV = false;

				if(selectLHPVType == LHPVConstant.TYPE_OF_LHPV_ID_NORMAL) {
					outObjForDispatchSummary 	= DispatchSummaryDao.getInstance().getLROfLS(lsIdsForAppend, executive.getAccountGroupId());
					lrIds						= (String) outObjForDispatchSummary.get("lrIds");
				} else if (selectLHPVType == LHPVConstant.TYPE_OF_LHPV_ID_DDM) {
					final var	drsmLedgerList	= DeliveryRunSheetSummaryDao.getInstance().getAllDeliveryRunSheetLedgerData(lsIdsForAppend);

					if(!drsmLedgerList.isEmpty())
						lrIds			= drsmLedgerList.stream().map(e -> Long.toString(e.getWayBillId())).collect(Collectors.joining(Constant.COMMA));
				}

				conSumHM 		= ConsignmentSummaryDao.getInstance().getLimitedConsignmentDetails(lrIds);

				for(final Map.Entry<Long, ConsignmentSummary> entry : conSumHM.entrySet()) {
					conSum 	= entry.getValue();

					if(conSum.getBookingTypeId() == BookingTypeConstant.BOOKING_TYPE_SUNDRY_ID && !isSundry) {
						isSundry = true;

						lhpv.setBookingTypeId(BookingTypeConstant.BOOKING_TYPE_SUNDRY_ID);

						if(isFTL)
							lhpv.setBookingTypeId(BookingTypeConstant.SUNDRY_FTL_ID);

						if(isDDDV)
							lhpv.setBookingTypeId(BookingTypeConstant.SUNDRY_DDDV_ID);

						if(isDDDV && isFTL) {
							lhpv.setBookingTypeId(BookingTypeConstant.SUNDRY_FTL_DDDV_ID);
							break;
						}
					} else if(conSum.getBookingTypeId() == BookingTypeConstant.BOOKING_TYPE_FTL_ID && !isFTL) {
						isFTL = true;

						lhpv.setBookingTypeId(BookingTypeConstant.BOOKING_TYPE_FTL_ID);

						if(isSundry)
							lhpv.setBookingTypeId(BookingTypeConstant.SUNDRY_FTL_ID);

						if(isDDDV)
							lhpv.setBookingTypeId(BookingTypeConstant.FTL_DDDV_ID);

						if(isDDDV && isSundry) {
							lhpv.setBookingTypeId(BookingTypeConstant.SUNDRY_FTL_DDDV_ID);
							break;
						}
					} else if(conSum.getBookingTypeId() == InfoForDeliveryConstant.DIRECT_DELIVERY_DIRECT_VASULI_ID && !isDDDV) {
						isDDDV = true;

						lhpv.setBookingTypeId(InfoForDeliveryConstant.DIRECT_DELIVERY_DIRECT_VASULI_ID);

						if(isSundry)
							lhpv.setBookingTypeId(BookingTypeConstant.SUNDRY_DDDV_ID);

						if(isFTL)
							lhpv.setBookingTypeId(BookingTypeConstant.FTL_DDDV_ID);

						if(isSundry && isFTL) {
							lhpv.setBookingTypeId(BookingTypeConstant.SUNDRY_FTL_DDDV_ID);
							break;
						}
					}
				}
			}
			//Code for adding booking type ends here

			return lhpv;

		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		} finally {
			lhpv = null;
		}
	}

	private int validateManualLHPVDate(final DispatchLedger disLeadger, final Timestamp manualLHPVDate,final Calendar currentDateTime, final int noOfDays) throws Exception {

		Calendar cal 					= null;
		Calendar calManualLHPVDate 		= null;
		Calendar calCreationTimeStamp 	= null;
		Timestamp 	dispatchTimeStamp 	= null;

		try {
			//Check if valid Date
			calManualLHPVDate = Calendar.getInstance();

			try {
				calManualLHPVDate.setTime(manualLHPVDate); //An Exception is thrown here if not a Valid date
			} catch (final Exception e) {
				return CargoErrorList.INVALID_DATE;
			}

			dispatchTimeStamp = Utility.getDateTime(new SimpleDateFormat("dd-MM-yyyy").format(disLeadger.getTripDateTime()));

			//LHPV date earlier then LS trip date time not allowed.
			if(dispatchTimeStamp!=null){
				calCreationTimeStamp = Calendar.getInstance();
				calCreationTimeStamp.setTime(dispatchTimeStamp);

				if(calManualLHPVDate.getTimeInMillis() < calCreationTimeStamp.getTimeInMillis())
					return CargoErrorList.LHPV_DATE_EARLIER_TO_LS_DATE_ERROR;
			}

			//Future Date not Allowed
			if(calManualLHPVDate.getTimeInMillis() > currentDateTime.getTimeInMillis())
				return CargoErrorList.DATE_ERROR;

			if(noOfDays < 0)
				return CargoErrorList.CONFIGURE_LHPV_DATE_ERROR;

			cal = Calendar.getInstance();
			cal.add(Calendar.DATE, -noOfDays);
			cal.set(Calendar.HOUR, 0);
			cal.set(Calendar.MINUTE, 0);
			cal.set(Calendar.SECOND, 0);

			if(calManualLHPVDate.getTimeInMillis() < cal.getTimeInMillis())
				return CargoErrorList.DATE_ERROR;

			return 0;

		} catch (final Exception e) {
			LogWriter.writeLog(CreateLHPVAction.TRACE_ID, LogWriter.LOG_LEVEL_ERROR, e);
			throw e;
		}
	}

	private int validateManualLHPVDateForDDM(final DeliveryRunSheetLedger	deliveryRunSheetLedger, final Timestamp manualLHPVDate,final Calendar currentDateTime, final int noOfDays) throws Exception {

		Calendar cal 					= null;
		Calendar calManualLHPVDate 		= null;
		Calendar calCreationTimeStamp 	= null;
		Timestamp 	dispatchTimeStamp 	= null;

		try {
			//Check if valid Date
			calManualLHPVDate = Calendar.getInstance();

			try {
				calManualLHPVDate.setTime(manualLHPVDate); //An Exception is thrown here if not a Valid date
			} catch (final Exception e) {
				return CargoErrorList.INVALID_DATE;
			}

			dispatchTimeStamp = Utility.getDateTime(new SimpleDateFormat("dd-MM-yyyy").format(deliveryRunSheetLedger.getCreationDateTime()));

			//LHPV date earlier then LS trip date time not allowed.
			if(dispatchTimeStamp!=null){
				calCreationTimeStamp = Calendar.getInstance();
				calCreationTimeStamp.setTime(dispatchTimeStamp);

				if(calManualLHPVDate.getTimeInMillis() < calCreationTimeStamp.getTimeInMillis())
					return CargoErrorList.LHPV_DATE_EARLIER_TO_DDM_DATE_ERROR;
			}

			//Future Date not Allowed
			if(calManualLHPVDate.getTimeInMillis() > currentDateTime.getTimeInMillis())
				return CargoErrorList.DATE_ERROR;

			if(noOfDays < 0)
				return CargoErrorList.CONFIGURE_LHPV_DATE_ERROR;

			cal = Calendar.getInstance();
			cal.add(Calendar.DATE, -noOfDays);
			cal.set(Calendar.HOUR, 0);
			cal.set(Calendar.MINUTE, 0);
			cal.set(Calendar.SECOND, 0);

			if(calManualLHPVDate.getTimeInMillis() < cal.getTimeInMillis())
				return CargoErrorList.DATE_ERROR;

			return 0;

		} catch (final Exception e) {
			LogWriter.writeLog(CreateLHPVAction.TRACE_ID, LogWriter.LOG_LEVEL_ERROR, e);
			throw e;
		}
	}

	private ArrivalTruckDetails setArrivalTruckDetails(final DispatchLedger dispatchLedger) throws Exception {

		ArrivalTruckDetails				arrivalTruckDet			= null;

		try {

			arrivalTruckDet = new ArrivalTruckDetails();

			arrivalTruckDet.setAccountGroupId(executive.getAccountGroupId());
			arrivalTruckDet.setVehicleNumberId(dispatchLedger.getVehicleNumberMasterId());
			arrivalTruckDet.setLsSourceBranchId(dispatchLedger.getSourceBranchId());
			arrivalTruckDet.setLsDestinatinBranchId(dispatchLedger.getDestinationBranchId());
			arrivalTruckDet.setBranchId(dispatchLedger.getLsBranchId());
			arrivalTruckDet.setDispatchLedgerId(dispatchLedger.getDispatchLedgerId());
			arrivalTruckDet.setLsNumber(dispatchLedger.getLsNumber());
			arrivalTruckDet.setTotalWeight(dispatchLedger.getTotalActualWeight());
			arrivalTruckDet.setTotalNoOfWayBill(dispatchLedger.getTotalNoOfWayBills());
			arrivalTruckDet.setStatus(dispatchLedger.getStatus());
			arrivalTruckDet.setCreationTimeStamp(dispatchLedger.getTripDateTime());
			arrivalTruckDet.setActualTimeStamp(dispatchLedger.getActualDispatchDateTime());
			arrivalTruckDet.setTotalNoOfPackage(dispatchLedger.getTotalNoOfPackages());

			return arrivalTruckDet;

		} catch (final Exception e) {
			e.printStackTrace();
			throw e;
		}
	}

	private ManualTransaction createManualTransactionDto(final LHPV lhpv) throws Exception {

		ManualTransaction manualTransaction = null;

		try {

			manualTransaction = new ManualTransaction();

			manualTransaction.setAccountGroupId(lhpv.getAccountGroupId());
			manualTransaction.setNumber(lhpv.getlHPVNumber());
			manualTransaction.setExecutiveId(lhpv.getExecutiveId());
			manualTransaction.setBranchId(lhpv.getBranchId());
			manualTransaction.setCreationDateTime(lhpv.getCreationDateTimeStamp());
			manualTransaction.setActualDateTime(lhpv.getActualDateTime());
			manualTransaction.setDebitAmount(lhpv.getAdvanceAmount());
			manualTransaction.setPaymentTypeId(lhpv.getPaymentType());

			if(manualTransaction.getPaymentTypeId() == PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID){
				manualTransaction.setChequeNumber(lhpv.getChequeNumber());
				manualTransaction.setBankName(lhpv.getBankName());
				manualTransaction.setChequeDate(lhpv.getChequeDate());
			} else {
				manualTransaction.setChequeNumber(null);
				manualTransaction.setBankName(null);
				manualTransaction.setChequeDate(null);
			}

			manualTransaction.setRemark(lhpv.getRemark());
			manualTransaction.setManualTypeId(ManualTransaction.MANUAL_LHPV);

			return manualTransaction;

		} catch (final Exception e) {
			e.printStackTrace();
			throw e;
		} finally {
			manualTransaction = null;
		}
	}
}