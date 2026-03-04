package com.ivcargo.actions.transport;

//~--- non-JDK imports --------------------------------------------------------

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashMap;
import java.util.Map;
import java.util.StringJoiner;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringUtils;

import com.businesslogic.DispatchBLL;
import com.businesslogic.DispatchReceiveAndDeliveryBLL;
import com.businesslogic.PendingDispatchStockBLL;
import com.businesslogic.modelcreator.CreateDispatchArticleDetailsDTO;
import com.businesslogic.properties.GeneralConfiguration;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.bll.impl.generateconsolidateewaybill.GenerateConsolidateEWayBillBllImpl;
import com.iv.bll.impl.master.VehicleNumberMasterBllImpl;
import com.iv.constant.properties.dispatch.InterBranchLSConfigurationConstant;
import com.iv.dto.constant.InfoForDeliveryConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.dto.constant.WayBillStatusConstant;
import com.iv.properties.constant.LoadingSheetPropertyConstant;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.constant.Constant;
import com.iv.utils.constant.properties.ReceiveConfigurationPropertiesConstant;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.exception.ExceptionProcess;
import com.iv.utils.utility.CollectionUtility;
import com.iv.utils.utility.Utility;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.ConsignmentSummaryDao;
import com.platform.dao.DuplicateTransactionCheckDao;
import com.platform.dao.LSSequenceCounterDao;
import com.platform.dao.WayBillDao;
import com.platform.dto.AliasNameConstants;
import com.platform.dto.ConfigParam;
import com.platform.dto.DispatchArticleDetails;
import com.platform.dto.DispatchLedger;
import com.platform.dto.Executive;
import com.platform.dto.LSSequenceCounter;
import com.platform.dto.ReceiveSummaryData;
import com.platform.dto.TransportCommonMaster;
import com.platform.dto.WayBill;
import com.platform.dto.WayBillCrossing;
import com.platform.dto.configuration.modules.DocumentCodeConfigurationDTO;
import com.platform.dto.configuration.modules.GroupConfigurationPropertiesDTO;
import com.platform.dto.configuration.modules.LsConfigurationDTO;
import com.platform.dto.constant.TransCargoAccountGroupConstant;
import com.platform.resource.CargoErrorList;
import com.platform.utils.TokenGenerator;

public class TransportDispatchWayBillAction implements Action {

	public static final String 				TRACE_ID  							= "TransportDispatchWayBillAction";
	Executive                  				executive 							= null;
	CacheManip 								cache 								= null;
	Timestamp 								createDate							= null;
	long 									vehicleNumberMasterId 				= 0;

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {

		HashMap<String,Object>			error 								= null;
		ValueObject    	 				outValObj           				= null;
		LSSequenceCounter	 			lsSequenceCounter					= null;
		Timestamp 			 			manualLSDate						= null;
		String 							lsNumber 							= null;
		var 							isDispatchCrossing					= false;
		var 							isNumberExits						= false;
		var 							isLSNumberInRange					= false;
		var 							validDateCode						= 0;
		var								isRailwayBranch						= false;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	sdf    			= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			cache 			= new CacheManip(request);
			executive 		= cache.getExecutive(request);
			createDate 		= DateTimeUtility.getCurrentTimeStamp();

			final var	manualLSNumber	= JSPUtility.GetLong(request, "manualLSNumber", 0);
			final var	values     		= request.getParameterValues("wayBills");
			final var	pdsBranchIds 	= request.getParameter("pdsBranchIds");
			final var	TOKEN_VALUE		= JSPUtility.GetString(request, TokenGenerator.TOKEN_VALUE, null);
			final var 	isInterBranchLS	= request.getParameter("isInterBranchLS") != null;
			final var vehicleDestinationBranchId	= JSPUtility.GetLong(request, "VehicleDestinationBranchId");

			final var	srcBranch		= cache.getGenericBranchDetailCache(request, executive.getBranchId());
			final var	destBranch		= cache.getGenericBranchDetailCache(request, vehicleDestinationBranchId);
			final var	interBranchLsConfiguration	= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.INTER_BRANCH_LS);
			final var	lsConfiguration				= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.DISPATCH);
			final var	vehicleMasterConfig			= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.VEHICLE_NUMBER_MASTER);
			final var	lhpvScreenAfterInterBranchLSCreation = isInterBranchLS && (boolean) interBranchLsConfiguration.getOrDefault(InterBranchLSConfigurationConstant.LHPVSCREEN_AFTER_INTER_BRANCH_LSCREATION, false);
			final var	currentDateTime = DateTimeUtility.getCalenderInstance();

			final var allowAutoGenerateConEWaybill	= (boolean) lsConfiguration.getOrDefault(LsConfigurationDTO.ALLOW_AUTO_GENERATE_CON_EWAYBILL, false);

			vehicleNumberMasterId = JSPUtility.GetLong(request, "selectedVehicleNumberMasterId",0);

			if(vehicleNumberMasterId <= 0) {
				response.sendRedirect("SearchWayBill.do?pageId=0&eventId=1&filter=13");
				return;
			}

			final var	vehicleNumberMaster = cache.getVehicleNumber(request, executive.getAccountGroupId(), vehicleNumberMasterId);

			final var	isValidRC 	= VehicleNumberMasterBllImpl.getInstance().isValidRC(vehicleNumberMaster.getRcValidity(), vehicleMasterConfig);

			if(!isValidRC) {
				response.sendRedirect("SearchWayBill.do?pageId=0&eventId=1&filter=24");
				return;
			}

			final int	noOfDays    						= cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_MAX_DAYS_OF_OPERATION_BEFORE_CASHSTATEMENT_ENTRY_ID);
			final var	dispatchPropertyValObj				= cache.getLsConfiguration(request, executive.getAccountGroupId());
			final var	documentCodeConfig					= cache.getDocumentCodeConfiguration(request, executive.getAccountGroupId());

			final var	isRangeCheckInManualLS				= dispatchPropertyValObj.getBoolean(LsConfigurationDTO.RangeCheckInManualLS, true);
			final var	isManualLsDateValidationCheck		= dispatchPropertyValObj.getBoolean(LsConfigurationDTO.IS_MANUAL_LS_DATE_VALIDATION_CHECK, true);
			final var	srcDestWiseSeqCounter				= dispatchPropertyValObj.getBoolean(LsConfigurationDTO.SRC_DEST_WISE_SEQ_COUNTER, false);
			final var	isGroupWiseLSSequenceCounter		= dispatchPropertyValObj.getBoolean(LsConfigurationDTO.IS_GROUP_WISE_LS_SEQUENCE_COUNTER, false);
			final var	automaticReceiveAfterDispatch		= isInterBranchLS && (boolean) interBranchLsConfiguration.getOrDefault(InterBranchLSConfigurationConstant.LS_DESTINATION_BRANCH_WISE_AUTOMATIC_RECEIVE, false)
					&& Utility.isIdExistInLongList(interBranchLsConfiguration, InterBranchLSConfigurationConstant.LS_DESTINATION_BRANCHES_FOR_AUTOMATIC_RECEIVE, vehicleDestinationBranchId);

			final var	documentCodeWiseLsSeqCounter			= documentCodeConfig.getBoolean(DocumentCodeConfigurationDTO.DOCUMENT_CODE_WISE_LS_SEQ_COUNTER, false);
			final var	customDocumentCode						= documentCodeConfig.getBoolean(DocumentCodeConfigurationDTO.CUSTOM_DOCUMENT_CODE, false);
			final var	documentCodeWiseInterLsSeqCounter		= documentCodeConfig.getBoolean(DocumentCodeConfigurationDTO.DOCUMENT_CODE_WISE_INTER_LS_SEQ_COUNTER, false);
			final var	documentCodeForLsSeqCounter				= documentCodeConfig.getInt(DocumentCodeConfigurationDTO.DOCUMENT_CODE_FOR_LS_SEQ_COUNTER, 0);
			final var	documentCodeForInterLsSeqCounter		= documentCodeConfig.getInt(DocumentCodeConfigurationDTO.DOCUMENT_CODE_FOR_INTER_LS_SEQ_COUNTER, 0);
			final var	crossingAgentId 						= JSPUtility.GetLong(request, "selectedCrossingAgentId", 0);
			final var	isDestinationBranchTypeWiseLsSequenceCounter = (boolean) interBranchLsConfiguration.getOrDefault(InterBranchLSConfigurationConstant.IS_DESTINATION_BRANCH_TYPE_WISE_LS_SEQUENCE_COUNTER, false);

			final var	lrIds = new StringJoiner(",");

			for (final String value2 : values)
				lrIds.add(value2);

			if((boolean) lsConfiguration.getOrDefault(LoadingSheetPropertyConstant.RAILWAY_BRANCH_WISE_DISPATCH, false))
				isRailwayBranch		= com.iv.utils.utility.Utility.isIdExistInLongList(lsConfiguration, LoadingSheetPropertyConstant.RAILWAY_BRANCH_IDS_FOR_DISPATCH, JSPUtility.GetLong(request, "VehicleDestinationBranchId"));

			if(allowAutoGenerateConEWaybill && !isRailwayBranch) {
				final var vehicleNUmber = StringUtils.upperCase(JSPUtility.GetString(request, "vehicleNumber"));
				final var isVehicleAllowForConsolidatedEwayBill = GenerateConsolidateEWayBillBllImpl.getInstance().checkVehicleNumberForConsolidateEwayBill(vehicleNUmber, executive.getAccountGroupId());

				if(isVehicleAllowForConsolidatedEwayBill) {
					error.put(CargoErrorList.ERROR_CODE, CargoErrorList.CONSOLIDATE_EWAYBILL_VEHICLE_ERROR);
					error.put(CargoErrorList.ERROR_DESCRIPTION,CargoErrorList.CONSOLIDATE_EWAYBILL_VEHICLE_ERROR_DESCRIPTION);
					request.setAttribute("cargoError", error);
					request.setAttribute("nextPageToken", Constant.FAILURE);
					return;
				}
			}

			//Create LS Number
			if(request.getParameter(AliasNameConstants.IS_MANUAL_DISPATCH) != null) {
				if(manualLSNumber > 0) {
					lsSequenceCounter = LSSequenceCounterDao.getInstance().getLSSequenceCounterToDisplay(executive.getAccountGroupId(), executive.getBranchId(), LSSequenceCounter.LS_SEQUENCE_MANUAL);

					if (lsSequenceCounter == null)
						lsSequenceCounter = new LSSequenceCounter();

					lsSequenceCounter.setNextVal(manualLSNumber);

					lsNumber	= Long.toString(manualLSNumber);

					if(request.getParameter("manualLSDate") != null)
						manualLSDate	= new Timestamp(sdf.parse(JSPUtility.GetString(request, "manualLSDate") + " " + currentDateTime.get(Calendar.HOUR_OF_DAY) + ":" + currentDateTime.get(Calendar.MINUTE) + ":" + currentDateTime.get(Calendar.SECOND)).getTime());
				} else {
					error.put(CargoErrorList.ERROR_CODE, CargoErrorList.MANUAL_NUMBER_NOT_VALID_ERROR);
					error.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.MANUAL_NUMBER_NOT_VALID_ERROR_DESCRIPTION);
					request.setAttribute("cargoError", error);
					request.setAttribute("nextPageToken", Constant.FAILURE);
				}
			} else // This is for get Source To Destination Wise Sequence Counter
				if(srcDestWiseSeqCounter) {
					// This is for get Destination Branch Wise Sequence Counter
					var	srcDestWiseLSSeqCounter = LSSequenceCounterDao.getInstance().getSourceDestinationWiseLSSequenceCounter(executive.getAccountGroupId(), executive.getBranchId(),destBranch.getBranchId(),destBranch.getSubRegionId());

					if(srcDestWiseLSSeqCounter != null) {
						lsSequenceCounter	= new LSSequenceCounter();
						lsSequenceCounter.setNextVal(srcDestWiseLSSeqCounter.getNextVal());
						lsSequenceCounter.setMinRange(srcDestWiseLSSeqCounter.getMinRange());
						lsSequenceCounter.setMaxRange(srcDestWiseLSSeqCounter.getMaxRange());
						lsNumber	= Long.toString(srcDestWiseLSSeqCounter.getNextVal());
					} else {
						// This is for get Destination Sub Region Wise Sequence Counter
						srcDestWiseLSSeqCounter = LSSequenceCounterDao.getInstance().getSourceDestinationWiseLSSequenceCounter(executive.getAccountGroupId(), executive.getBranchId(),0,destBranch.getSubRegionId());

						if(srcDestWiseLSSeqCounter != null) {
							lsSequenceCounter	= new LSSequenceCounter();
							lsSequenceCounter.setNextVal(srcDestWiseLSSeqCounter.getNextVal());
							lsSequenceCounter.setMinRange(srcDestWiseLSSeqCounter.getMinRange());
							lsSequenceCounter.setMaxRange(srcDestWiseLSSeqCounter.getMaxRange());
							lsNumber	= Long.toString(srcDestWiseLSSeqCounter.getNextVal());
						}
					}
				} else if(isGroupWiseLSSequenceCounter)
					lsSequenceCounter = LSSequenceCounterDao.getInstance().getLSSequenceCounter(executive.getAccountGroupId(), 0);
				else if(isDestinationBranchTypeWiseLsSequenceCounter && isInterBranchLS) {
					lsSequenceCounter = new LSSequenceCounter();

					if(destBranch.isAgentBranch() || crossingAgentId > 0)
						lsSequenceCounter.setDestBranchType(LSSequenceCounter.OTHER_BRANCH);
					else
						lsSequenceCounter.setDestBranchType(LSSequenceCounter.OWN_BRANCH);

					lsSequenceCounter = LSSequenceCounterDao.getInstance().getLSSequenceCounterDestinationBranchTypeWise(lsSequenceCounter, executive.getAccountGroupId(), 0);
				} else
					lsSequenceCounter = LSSequenceCounterDao.getInstance().getLSSequenceCounter(executive.getAccountGroupId(), executive.getBranchId());

			if(lsSequenceCounter != null) {
				if(lsSequenceCounter.getNextVal() >= lsSequenceCounter.getMinRange() && lsSequenceCounter.getNextVal() <= lsSequenceCounter.getMaxRange()
						|| request.getParameter(AliasNameConstants.IS_MANUAL_DISPATCH) != null && manualLSDate != null && !isRangeCheckInManualLS)
					isLSNumberInRange = true;

				if(isLSNumberInRange) {
					if(manualLSDate != null)
						isNumberExits = DuplicateTransactionCheckDao.getInstance().checkDuplicateTxnForFinancialYearForLS(lsNumber, 0, executive.getAccountGroupId(), (short)12,manualLSDate, 0);
					else {
						if(isInterBranchLS && documentCodeWiseInterLsSeqCounter) {
							if(customDocumentCode)
								lsNumber = documentCodeForInterLsSeqCounter + "/" + srcBranch.getBranchCode() + "/" + lsSequenceCounter.getNextVal();
							else
								lsNumber = srcBranch.getBranchCode() + "-" + documentCodeForInterLsSeqCounter + "/" + lsSequenceCounter.getNextVal();
						} else if(documentCodeWiseLsSeqCounter) {
							if(customDocumentCode)
								lsNumber = documentCodeForLsSeqCounter + "/" + srcBranch.getBranchCode() + "/" + lsSequenceCounter.getNextVal();
							else
								lsNumber = srcBranch.getBranchCode() + "-" + documentCodeForLsSeqCounter + "/" + lsSequenceCounter.getNextVal();
						} else
							lsNumber = Long.toString(lsSequenceCounter.getNextVal());

						isNumberExits = DuplicateTransactionCheckDao.getInstance().checkDuplicateTxnForFinancialYearForLS(lsNumber, 0, executive.getAccountGroupId(), (short)11,createDate,0);
					}

					if(!isNumberExits) {
						if(request.getParameter(AliasNameConstants.IS_MANUAL_DISPATCH) != null && manualLSDate != null) {
							// This is HardCore condition For SNGT
							if(executive.getAccountGroupId() == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_SNGT
									|| executive.getAccountGroupId() == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_KATIRA) {
								final var	dateAllowForSNGT   = new Timestamp(sdf.parse("01-04-2013" + " 00:00:00").getTime());
								final var message = "Please, Enter Manual LS Date after 31-03-2013 !";

								if(manualLSDate.before(dateAllowForSNGT)){
									error.put(CargoErrorList.ERROR_CODE, CargoErrorList.DATE_ERROR);
									error.put(CargoErrorList.ERROR_DESCRIPTION,message);
									request.setAttribute("cargoError", error);
									request.setAttribute("nextPageToken", Constant.FAILURE);
									return ;
								}
							}

							final var	waybillHM = WayBillDao.getInstance().getLRCurrentTimeStamp(lrIds.toString());

							for (final String value : values) {
								final var	wayBill	= waybillHM.get(Long.parseLong(value));

								if(wayBill != null){
									validDateCode = validateManualLSDate(wayBill, manualLSDate, currentDateTime, noOfDays, isManualLsDateValidationCheck);

									if(validDateCode != 0){ // All ok
										//Error in date
										switch (validDateCode) {
										case CargoErrorList.INVALID_DATE -> {
											error.put(CargoErrorList.ERROR_CODE, CargoErrorList.INVALID_DATE);
											error.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.INVALID_DATE_DESCRIPTION);
										}
										case CargoErrorList.DATE_ERROR -> {
											error.put(CargoErrorList.ERROR_CODE, CargoErrorList.DATE_ERROR);
											error.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.DATE_ERROR_DESCRIPTION);
										}
										case CargoErrorList.LS_DATE_EARLIER_TO_BOOKING_DATE_ERROR -> {
											error.put(CargoErrorList.ERROR_CODE, CargoErrorList.LS_DATE_EARLIER_TO_BOOKING_DATE_ERROR);
											error.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.LS_DATE_EARLIER_TO_BOOKING_DATE_ERROR_DESCRIPTION + wayBill.getWayBillNumber()+" Please try again.");
										}
										case CargoErrorList.LS_DATE_EARLIER_TO_RECEIVE_DATE_ERROR -> {
											error.put(CargoErrorList.ERROR_CODE, CargoErrorList.LS_DATE_EARLIER_TO_RECEIVE_DATE_ERROR);
											error.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.LS_DATE_EARLIER_TO_RECEIVE_DATE_ERROR_DESCRIPTION  + wayBill.getWayBillNumber()+" Please try again.");
										}
										case CargoErrorList.CONFIGURE_LS_DATE_ERROR -> {
											error.put(CargoErrorList.ERROR_CODE, CargoErrorList.CONFIGURE_LS_DATE_ERROR);
											error.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.CONFIGURE_LS_DATE_ERROR_DESCRIPTION);
										}
										default -> {
											break;
										}
										}

										request.setAttribute("cargoError", error);
										request.setAttribute("nextPageToken", Constant.FAILURE);
										return;
									}
								}
							}
						}

						final var 	crossingWbsCol = new HashMap<Long,WayBillCrossing >();
						final var	createDispatchArticleDetailsDTO = new CreateDispatchArticleDetailsDTO();
						final var	finalDispatchArticleDetailsList = new ArrayList<DispatchArticleDetails>();
						final var	dispatchWeightHM				= new HashMap<Long, Double>();

						//destination branch must belong to destination city
						if(destBranch != null
								|| Short.parseShort(request.getParameter("isDDDV")) == InfoForDeliveryConstant.DIRECT_DELIVERY_DIRECT_VASULI_ID) {

							final var	inValObj            	= new ValueObject();
							final var	dispatchLedger      	= populateDispatchLedger(request, lsNumber, manualLSDate);
							final var	wayBillsForDispatch 	= new Long[values.length];
							short	txnTypeId	= 0;

							for (var i = 0; i < values.length; i++) {
								wayBillsForDispatch[i] = Long.parseLong(values[i]);

								if(executive.getAccountGroupId() == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_LMT
										||executive.getAccountGroupId() == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_MAHARAJA
										|| executive.getAccountGroupId() == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_KHTC
										|| executive.getAccountGroupId() == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_JAYRAM_TRANSPORTS
										|| executive.getAccountGroupId() == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_TARASVIN_TRANSPORT
										|| executive.getAccountGroupId() == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_VEGA_TRANSPORT
										|| executive.getAccountGroupId() == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_DECENT_LORRY_SERVICE
										|| executive.getAccountGroupId() == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_HTC
										|| executive.getAccountGroupId() == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_ACIPL
										|| executive.getAccountGroupId() == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_SRIDATTA
										|| executive.getAccountGroupId() == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_ADITYA_LOGISTICS
										|| executive.getAccountGroupId() == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_VLS
										|| executive.getAccountGroupId() == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_NDTC
										|| executive.getAccountGroupId() == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_JAYPEE
										|| executive.getAccountGroupId() == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_GKR
										) {
									final var	netLoading 		= JSPUtility.GetDouble(request, "netLoading_" + wayBillsForDispatch[i], 0);
									final var	netUnloading 	= JSPUtility.GetDouble(request, "netUnloading_" + wayBillsForDispatch[i], 0);
									final var	crossingHire 	= JSPUtility.GetDouble(request, "crossingHire_" + wayBillsForDispatch[i], 0);
									final var	doorDelivery 	= JSPUtility.GetDouble(request, "doorDelivery_" + wayBillsForDispatch[i], 0);

									if(crossingAgentId > 0 )
										txnTypeId = WayBillCrossing.TRANSACTION_TYPE_DELIVERY_CROSSING;
									else
										txnTypeId = 0;

									//Crossing related fields set
									dispatchLedger.setCrossingAgentId(crossingAgentId);

									var 		isWayBillCrossing	= false;

									if(JSPUtility.GetInt(request, "crossingField_" + wayBillsForDispatch[i], 0) > 0) {
										isWayBillCrossing = true;
										isDispatchCrossing = true;
										txnTypeId = WayBillCrossing.TRANSACTION_TYPE_BRANCH_TO_BRANCH_CROSSING;
									} else
										isWayBillCrossing = false;

									if((executive.getAccountGroupId() == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_KHTC
											|| executive.getAccountGroupId() == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_JAYRAM_TRANSPORTS
											|| executive.getAccountGroupId() == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_DECENT_LORRY_SERVICE
											|| executive.getAccountGroupId() == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_HTC
											|| executive.getAccountGroupId() == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_ACIPL
											|| executive.getAccountGroupId() == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_SRIDATTA
											|| executive.getAccountGroupId() == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_VLS
											|| executive.getAccountGroupId() == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_NDTC
											|| executive.getAccountGroupId() == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_JAYPEE
											|| executive.getAccountGroupId() == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_GKR)
											&& (crossingAgentId > 0 || isWayBillCrossing)
											|| netLoading != 0 || netUnloading != 0 || crossingHire != 0) {
										final var	wbc = createWayBillCrosssingDto(wayBillsForDispatch[i], crossingAgentId, netLoading, netUnloading, crossingHire, doorDelivery, txnTypeId);
										crossingWbsCol.put(wayBillsForDispatch[i], wbc);
									}
								}

								finalDispatchArticleDetailsList.addAll(createDispatchArticleDto(request, createDispatchArticleDetailsDTO, dispatchWeightHM, dispatchLedger, wayBillsForDispatch[i]));
							}

							final var	waybillHM = WayBillDao.getInstance().getLRCurrentTimeStamp(lrIds.toString());

							for(final Map.Entry<Long, WayBill> entry : waybillHM.entrySet()) {
								final var	wayBill	= entry.getValue();

								if(wayBill.getDestinationBranchId() == dispatchLedger.getDestinationBranchId()) {
									dispatchLedger.setCrossing(isDispatchCrossing);
									dispatchLedger.setDispatchTxnTypeId(txnTypeId);
								} else {
									isDispatchCrossing = true;
									dispatchLedger.setCrossing(isDispatchCrossing);
									dispatchLedger.setDispatchTxnTypeId(WayBillCrossing.TRANSACTION_TYPE_BRANCH_TO_BRANCH_CROSSING);
								}
							}

							final var	pendingDispatchStockBLL = new PendingDispatchStockBLL();
							final var	inValueObject 			= new ValueObject();

							inValueObject.put("wayBillIds", lrIds.toString());
							inValueObject.put("pdsBranchIds", pdsBranchIds);

							final var	isWayBillAllowForDispatch  = pendingDispatchStockBLL.checkWayBillForDispatch(inValueObject);

							if (isWayBillAllowForDispatch) {
								inValObj.put("crossingWbs", crossingWbsCol);

								final var	dispatchArticleDetailsArray = new DispatchArticleDetails[finalDispatchArticleDetailsList.size()];
								finalDispatchArticleDetailsList.toArray(dispatchArticleDetailsArray);

								inValObj.put("dispatchLedger", dispatchLedger);
								inValObj.put("wayBillsForDispatch", wayBillsForDispatch);
								inValObj.put("executive", executive);
								inValObj.put("executiveBranchId", executive.getBranchId());
								inValObj.put("manualLSDate", manualLSDate);
								inValObj.put(AliasNameConstants.IS_MANUAL_DISPATCH, request.getParameter(AliasNameConstants.IS_MANUAL_DISPATCH));
								inValObj.put("branchColl", cache.getGenericBranchesDetail(request));
								inValObj.put("pdsBranchIds", pdsBranchIds);
								inValObj.put("dispatchArticleDetailsArray", dispatchArticleDetailsArray);
								inValObj.put("dispatchWeightHM",dispatchWeightHM);
								inValObj.put("receiveObj", createDTOForReceive(request, error, manualLSDate));
								inValObj.put(InterBranchLSConfigurationConstant.ALLOW_AUTOMATIC_RECEIVE, automaticReceiveAfterDispatch);
								inValObj.put(LsConfigurationDTO.LS_CONFIGURATION, dispatchPropertyValObj);
								inValObj.put(GroupConfigurationPropertiesDTO.GROUP_CONFIGURATION, cache.getGroupConfiguration(request, executive.getAccountGroupId()));
								inValObj.put(ReceiveConfigurationPropertiesConstant.RECEIVE_CONFIGUARTION, cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.RECEIVE));
								inValObj.put(GeneralConfiguration.GENERAL_CONFIGURATION, cache.getGeneralConfiguration(request, executive.getAccountGroupId()));

								if(TOKEN_VALUE != null) {
									if(!TOKEN_VALUE.equals(request.getSession().getAttribute(TokenGenerator.TOKEN_VALUE))) {
										error.put(CargoErrorList.ERROR_CODE, CargoErrorList.DISPATCH_ERROR);
										error.put(CargoErrorList.ERROR_DESCRIPTION, "Data already submitted, Please wait.");
										request.setAttribute("cargoError", error);
										request.setAttribute("nextPageToken", Constant.FAILURE);
										return;
									}

									request.getSession().setAttribute(TokenGenerator.TOKEN_VALUE, null);
								}

								if(automaticReceiveAfterDispatch)
									outValObj = DispatchReceiveAndDeliveryBLL.getInstance().dispatchAndReceivedWayBills(inValObj);
								else
									outValObj = DispatchBLL.getInstance().dispatchWayBills(inValObj);

								final var	status = (String) outValObj.get("status");

								if ("success".equals(status)) {
									final long dispatchLedgerId = (Long) outValObj.get("dispatchLedgerId");

									if(lhpvScreenAfterInterBranchLSCreation)
										response.sendRedirect("SearchWayBill.do?pageId=228&eventId=1&dispatchLedgerId="+dispatchLedgerId+"&Type=Dispatched&lsNumber="+dispatchLedger.getLsNumber()+"&isCrossing="+dispatchLedger.isCrossing()+"&CrossingAgentId="+dispatchLedger.getCrossingAgentId()+"&isLhpvLockingAfterLsCreation=true");
									else
										response.sendRedirect("SearchWayBill.do?pageId=3&eventId=9&dispatchLedgerId="+dispatchLedgerId+"&Type=Dispatched&LSNo="+dispatchLedger.getLsNumber()+"&isCrossing="+dispatchLedger.isCrossing()+"&CrossingAgentId="+dispatchLedger.getCrossingAgentId());

									request.setAttribute("nextPageToken", "success");
									request.setAttribute("dispatchLedgerId", dispatchLedgerId);
								} else {
									error.put(CargoErrorList.ERROR_CODE, CargoErrorList.DISPATCH_ERROR);
									error.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.DISPATCH_ERROR_DESCRIPTION);
									request.setAttribute("cargoError", error);
									request.setAttribute("nextPageToken", Constant.FAILURE);
								}
							} else {
								error.put(CargoErrorList.ERROR_CODE, CargoErrorList.DUPLICATE_DISPATCH_ERROR);
								error.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.DUPLICATE_DISPATCH_ERROR_DESCRIPTION );
								request.setAttribute("cargoError", error);
								request.setAttribute("nextPageToken", Constant.FAILURE);
							}
						} else {
							error.put(CargoErrorList.ERROR_CODE, CargoErrorList.WRONG_BRANCHFORCITY_ERROR);
							error.put(CargoErrorList.ERROR_DESCRIPTION,CargoErrorList.WRONG_BRANCHFORCITY_ERROR_DESCRIPTION);
							request.setAttribute("cargoError", error);
							request.setAttribute("nextPageToken", Constant.FAILURE);
						}
					} else {
						error.put(CargoErrorList.ERROR_CODE, CargoErrorList.LS_DUPLICATE_NUMBER);
						error.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.LS_DUPLICATE_NUMBER_DESCRIPTION);
						request.setAttribute("cargoError", error);
						request.setAttribute("nextPageToken", Constant.FAILURE);
					}
				} else {
					error.put(CargoErrorList.ERROR_CODE, CargoErrorList.LS_SEQUENCE_COUNTER_OVER);
					error.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.LS_SEQUENCE_COUNTER_OVER_DESCRIPTION);
					request.setAttribute("cargoError", error);
					request.setAttribute("nextPageToken", Constant.FAILURE);
				}
			} else {
				error.put(CargoErrorList.ERROR_CODE, CargoErrorList.LS_SEQUENCE_COUNTER_MISSING);
				error.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.LS_SEQUENCE_COUNTER_MISSING_DESCRIPTION);
				request.setAttribute("cargoError", error);
				request.setAttribute("nextPageToken", Constant.FAILURE);
			}

		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}

	private DispatchLedger populateDispatchLedger(final HttpServletRequest request, final String lsNumber, final Timestamp manualLSDate) throws Exception {
		try {
			final var	dispatchLedger 	= new DispatchLedger();

			if(request.getParameter("isInterBranchLS") != null)
				dispatchLedger.setTypeOfLS(DispatchLedger.TYPE_OF_LS_ID_Inter_Branch);
			else
				dispatchLedger.setTypeOfLS(DispatchLedger.TYPE_OF_LS_ID_NORMAL);

			dispatchLedger.setAccountGroupId(executive.getAccountGroupId());
			dispatchLedger.setCleanerName(StringUtils.upperCase(JSPUtility.GetString(request, "cleanerName")));
			dispatchLedger.setDestinationBranchId(JSPUtility.GetLong(request, "VehicleDestinationBranchId"));
			dispatchLedger.setMarkForDelete(false);
			dispatchLedger.setSourceBranchId(executive.getBranchId());

			if(request.getParameter(AliasNameConstants.IS_MANUAL_DISPATCH) != null) {
				dispatchLedger.setManual(true);

				if(manualLSDate != null)
					dispatchLedger.setTripDateTime(manualLSDate);
				else
					dispatchLedger.setTripDateTime(createDate);
			} else
				dispatchLedger.setTripDateTime(createDate);

			dispatchLedger.setDDDV(Short.parseShort(request.getParameter("isDDDV")) == TransportCommonMaster.DIRECT_DELIVERY_DIRECT_VASULI_ID);

			dispatchLedger.setTripName("trip");
			dispatchLedger.setActualDispatchDateTime(createDate);
			dispatchLedger.setBranchTransfer(false);
			dispatchLedger.setSuperVisor(JSPUtility.GetString(request, "superVisor" ,""));
			dispatchLedger.setRemark(JSPUtility.GetString(request, "remark"));

			dispatchLedger.setVehicleNumber(StringUtils.upperCase(JSPUtility.GetString(request, "vehicleNumber")));
			dispatchLedger.setVehicleNumberMasterId(vehicleNumberMasterId);

			dispatchLedger.setDriverName(StringUtils.upperCase(JSPUtility.GetString(request, "driver1Name")));
			dispatchLedger.setDriverId(JSPUtility.GetLong(request ,"driver1Insert" , 0));
			dispatchLedger.setDriverLicenceNumber(StringUtils.upperCase(JSPUtility.GetString(request, "driver1", "")));

			dispatchLedger.setDriver2Name(StringUtils.upperCase(JSPUtility.GetString(request, "driver2Name")));
			dispatchLedger.setDriver2Id(JSPUtility.GetLong(request ,"driver2Insert", 0));
			dispatchLedger.setDriver2LicenceNumber(StringUtils.upperCase(JSPUtility.GetString(request, "driver2", "")));

			dispatchLedger.setVehicleAgentId(JSPUtility.GetLong(request, "vehicleAgent", 0));
			dispatchLedger.setVehicleAgentName(StringUtils.upperCase(JSPUtility.GetString(request, "manualAgentEntry", "")));

			dispatchLedger.setTotalActualWeight(JSPUtility.GetDouble(request, "totalActualWeight", 0.00));
			dispatchLedger.setTotalNoOfDoorDelivery(JSPUtility.GetInt(request, "totalNoOfDoorDelivery", 0));
			dispatchLedger.setTotalNoOfGodownArticles(JSPUtility.GetInt(request, "totalNoOfGodownArticles", 0));
			dispatchLedger.setTotalNoOfCrossingArticles(JSPUtility.GetInt(request, "totalNoOfCrossingArticles", 0));
			dispatchLedger.setTotalNoOfDoorDeliveryArticles(JSPUtility.GetInt(request, "totalNoOfDoorDeliveryArticles", 0));
			dispatchLedger.setTotalNoOfForms(JSPUtility.GetInt(request, "totalNoOfForms", 0));
			dispatchLedger.setTotalNoOfPackages(JSPUtility.GetInt(request, "totalNoOfPackages", 0));
			dispatchLedger.setTotalNoOfWayBills(JSPUtility.GetInt(request, "totalNoOfWayBills", 0));

			dispatchLedger.setLsNumber(lsNumber);
			dispatchLedger.setLsBranchId(executive.getBranchId());

			if("".equals(JSPUtility.GetString(request, "driver1MobileNumber1")) || "Driver 1 Mob. No 1".equals(JSPUtility.GetString(request, "driver1MobileNumber1")))
				dispatchLedger.setDriver1MobileNumber1(null);
			else
				dispatchLedger.setDriver1MobileNumber1(JSPUtility.GetString(request, "driver1MobileNumber1"));

			if("".equals(JSPUtility.GetString(request, "driver1MobileNumber2")) || "Driver 1 Mob. No 2".equals(JSPUtility.GetString(request, "driver1MobileNumber1")))
				dispatchLedger.setDriver1MobileNumber2(null);
			else
				dispatchLedger.setDriver1MobileNumber2(JSPUtility.GetString(request, "driver1MobileNumber2", null));

			dispatchLedger.setWeighbridge(JSPUtility.GetDouble(request, "weighbridge", 0.00));

			return dispatchLedger;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private int validateManualLSDate(final WayBill wayBill, final Timestamp manualLSDate,final Calendar currentDateTime, final int noOfDays, final boolean isManualLsDateValidationCheck) throws Exception {
		try {
			//Check if valid Date
			final var	calManualLSDate = DateTimeUtility.getCalenderInstance();

			try {
				calManualLSDate.setTime(manualLSDate); //An Exception is thrown here if not a Valid date
			} catch (final Exception e) {
				return CargoErrorList.INVALID_DATE;
			}

			final var	wayBillCreationTimeStamp = com.platform.utils.Utility.getDateTime(new SimpleDateFormat("dd-MM-yyyy").format(wayBill.getCreationDateTimeStamp()));

			//Booking OR Receive Date earlier than Dispatch date not allowed
			if(isManualLsDateValidationCheck && wayBillCreationTimeStamp != null) {
				final var	calCreationTimeStamp = DateTimeUtility.getCalenderInstance();
				calCreationTimeStamp.setTime(wayBillCreationTimeStamp);

				if(calManualLSDate.getTimeInMillis() < calCreationTimeStamp.getTimeInMillis()) {
					if(wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_BOOKED)
						return CargoErrorList.LS_DATE_EARLIER_TO_BOOKING_DATE_ERROR;

					if(wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_RECEIVED)
						return CargoErrorList.LS_DATE_EARLIER_TO_RECEIVE_DATE_ERROR;
				}
			}

			//Future Date not Allowed
			if(calManualLSDate.getTimeInMillis() > currentDateTime.getTimeInMillis())
				return CargoErrorList.DATE_ERROR;

			if(noOfDays < 0)
				return CargoErrorList.CONFIGURE_LS_DATE_ERROR;

			final var	cal = DateTimeUtility.getCalenderInstance();
			cal.add(Calendar.DATE, -noOfDays);
			cal.set(Calendar.HOUR, 0);
			cal.set(Calendar.MINUTE, 0);
			cal.set(Calendar.SECOND, 0);

			if(calManualLSDate.getTimeInMillis() < cal.getTimeInMillis())
				return CargoErrorList.DATE_ERROR;

			return 0;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private WayBillCrossing createWayBillCrosssingDto(final long wayBillId, final long crossingAgentId,final double netLoading,final double netUnloading,final double crossingHire,final double doorDelivery,final short txnTypeId) throws Exception{
		try {
			final var	wbc = new WayBillCrossing();

			wbc.setWayBillId(wayBillId);
			wbc.setAccountGroupId(executive.getAccountGroupId());
			wbc.setCrossingAgentId(crossingAgentId);
			wbc.setNetLoading(netLoading);
			wbc.setNetUnloading(netUnloading);
			wbc.setCrossingHire(crossingHire);
			wbc.setDoorDelivery(doorDelivery);
			wbc.setTxnTypeId(txnTypeId);

			return wbc;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private ArrayList<DispatchArticleDetails> createDispatchArticleDto(final HttpServletRequest request,final CreateDispatchArticleDetailsDTO createDispatchArticleDetailsDTO,final HashMap<Long, Double> dispatchWeightHM,final DispatchLedger  dispatchLedger ,final long wayBillId) throws Exception{
		try {
			final var	articleStr 				   = request.getParameter("articleDetails_"+wayBillId);
			final var	inValueObject   		   = new ValueObject();
			final var	dispatchArticleDetailsList = new ArrayList<DispatchArticleDetails>();

			if(articleStr == null)
				return dispatchArticleDetailsList;

			final var	weight			= JSPUtility.GetDouble(request,"weight_" + wayBillId, 0.00);
			final var	articleArray	= articleStr.split("@");
			dispatchWeightHM.put(wayBillId, weight);

			for (final String element : articleArray) {
				final var	str 	= element.split("_");

				inValueObject.put("executive", executive);
				inValueObject.put("branchId", executive.getBranchId());
				inValueObject.put("wayBillId", wayBillId);
				inValueObject.put("packingTypeMasterId", Long.parseLong(str[0]));
				inValueObject.put("quantity", Long.parseLong(str[1]));
				inValueObject.put("createDate", dispatchLedger.getTripDateTime());
				inValueObject.put("consignmentDetailsId", Long.parseLong(str[2]));

				dispatchArticleDetailsList.add(createDispatchArticleDetailsDTO.createDispatchArticleDetails(inValueObject));
			}

			return dispatchArticleDetailsList;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private ValueObject createDTOForReceive(final HttpServletRequest request, final HashMap<String, Object> error, final Timestamp  manualLSDate) throws Exception {
		try {
			cache			= new CacheManip(request);
			final var	executive		= cache.getExecutive(request);
			final var	createDate 		= DateTimeUtility.getCurrentTimeStamp();

			final var	wayBillToReceived	= request.getParameterValues("wayBills");

			final var	lrIds = CollectionUtility.getStringFromStringArray(wayBillToReceived);

			final var	receiveSummaryDataArr	= new HashMap<Long,ReceiveSummaryData>();

			final var dispatchLedgerWBCount 	= 1L;

			final var	conSumyDtlColl = ConsignmentSummaryDao.getInstance().getLimitedConsignmentDetails(lrIds);

			final var	wayBillIdsForReceive	= CollectionUtility.getStringFromStringArray(wayBillToReceived);

			for (final String element : wayBillToReceived) {
				final var wayBillId = Long.parseLong(element);
				final var	consignmentSummary = conSumyDtlColl.get(wayBillId);

				final var	receiveSummaryData = new ReceiveSummaryData();
				receiveSummaryData.setActualUnloadWeight(consignmentSummary.getActualWeight());
				receiveSummaryData.setNoOfPackages((int) consignmentSummary.getQuantity());
				receiveSummaryData.setActualWeight(consignmentSummary.getActualWeight());
				receiveSummaryData.setWayBillId(wayBillId);

				receiveSummaryDataArr.put(wayBillId, receiveSummaryData);
			}

			final var	valueInObject	= new ValueObject();

			valueInObject.put("WayBillCount", wayBillToReceived.length);
			valueInObject.put("wayBillToReceived", wayBillIdsForReceive);
			valueInObject.put("DispatchLedgerWayBillCounter", dispatchLedgerWBCount);
			valueInObject.put("executive", executive);
			valueInObject.put("receiveSummaryDataArr", receiveSummaryDataArr);
			valueInObject.put("TURNumber", 0);

			if(manualLSDate != null)
				valueInObject.put("manualLSDate", manualLSDate);

			valueInObject.put(AliasNameConstants.IS_MANUAL_DISPATCH, StringUtils.equalsIgnoreCase("on", request.getParameter(AliasNameConstants.IS_MANUAL_DISPATCH)));

			valueInObject.put("createDate", createDate);
			valueInObject.put(Constant.ARRIVAL_DATE_TIME, createDate);
			valueInObject.put("isArrivalTruckDetailReport", cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_ARRIVAL_TRUCK_DETAILS_REPORT) == ConfigParam.CONFIG_KEY_CONFIG_KEY_ARRIVAL_TRUCK_DETAILS_REPORT_ALLOWED);
			valueInObject.put("branchesColl", cache.getGenericBranchesDetail(request));
			valueInObject.put("configValueForDelivery", cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_DELIVERY_ACCESSIBILITY));
			valueInObject.put("isPendingDeliveryTableEntry", cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_PENDING_DELIVERY_STOCK_TABLE_ENTRY) == ConfigParam.CONFIG_KEY_PENDING_DELIVERY_STOCK_TABLE_ENTRY_ALLOWED);
			valueInObject.put("isServiceTaxReport", cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_SERVICE_TAX_REPORT) == ConfigParam.CONFIG_KEY_VALUE_SERVICE_TAX_REPORT_ALLOWED);

			return valueInObject;
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
			throw e;
		}
	}

}