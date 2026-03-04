package com.ivcargo.actions.transport;

//~--- non-JDK imports --------------------------------------------------------

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringUtils;

import com.businesslogic.DispatchReceiveAndDeliveryBLL;
import com.businesslogic.PendingDispatchStockBLL;
import com.businesslogic.SequenceCounterValidationBLL;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.bll.impl.generateconsolidateewaybill.GenerateConsolidateEWayBillBllImpl;
import com.iv.dto.constant.InfoForDeliveryConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.dto.constant.PODStatusConstant;
import com.iv.dto.constant.WayBillDeliveryTypeConstant;
import com.iv.properties.constant.LoadingSheetPropertyConstant;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.constant.AccountGroupConstant;
import com.iv.utils.constant.Constant;
import com.iv.utils.constant.PodWayBillPropertiesConstant;
import com.iv.utils.constant.properties.ReceiveConfigurationPropertiesConstant;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.exception.ExceptionProcess;
import com.iv.utils.utility.CollectionUtility;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.ConsignmentSummaryDao;
import com.platform.dao.CustomerDetailsDao;
import com.platform.dao.ExecutiveDao;
import com.platform.dto.AliasNameConstants;
import com.platform.dto.ChargeTypeMaster;
import com.platform.dto.ConfigParam;
import com.platform.dto.DeliveryContactDetails;
import com.platform.dto.DispatchLedger;
import com.platform.dto.Executive;
import com.platform.dto.LHPV;
import com.platform.dto.LoadingSheetSettlement;
import com.platform.dto.ReceiveSummaryData;
import com.platform.dto.TransportCommonMaster;
import com.platform.dto.WayBillCrossing;
import com.platform.dto.configuration.modules.DocumentCodeConfigurationDTO;
import com.platform.dto.configuration.modules.LsConfigurationDTO;
import com.platform.dto.constant.PaymentTypeConstant;
import com.platform.resource.CargoErrorList;
import com.platform.utils.PropertiesUtility;
import com.platform.utils.TokenGenerator;
import com.platform.utils.Utility;

public class TransportCrossingWayBillAction implements Action {

	public static final String 	TRACE_ID  	= "TransportCrossingWayBillAction";
	CacheManip 					cache 		= null;
	long vehicleNumberMasterId = 0;

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {

		HashMap<String,Object>	 		error 									= null;
		Long[]							wayBillsForDispatch 					= null;
		LHPV							lhpv 									= null;
		String							status 									= null;
		final String					lhpvNumber								= null;
		ValueObject						receiveAndDeliveryObj 					= null;
		var								isWayBillCrossing						= false;
		var								isDispatchCrossing						= false;
		var								totalTempoBhada							= 0D;
		var								crossingAgentId							= 0L;
		var								isRailwayBranch							= false;

		try {

			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	createDate					= DateTimeUtility.getCurrentTimeStamp();
			cache						= new CacheManip(request);

			final var	executive					= cache.getExecutive(request);
			final var	manualLSNumber				= JSPUtility.GetLong(request, "manualLSNumber", 0);
			final var	showAdvancePaymentOption 	= JSPUtility.GetInt(request, "advancePaymentOption", 0);
			final var	advancePayment				= JSPUtility.GetDouble(request, "advancePayment", 0.0);
			final var	values						= request.getParameterValues("wayBills");
			final var	pdsBranchIds		 		= request.getParameter("pdsBranchIds");
			final var	TOKEN_VALUE					= JSPUtility.GetString(request, TokenGenerator.TOKEN_VALUE, null);
			final var	srcBranch					= cache.getGenericBranchDetailCache(request, executive.getBranchId());
			vehicleNumberMasterId 				= cache.getVehicleNumberIdByNumber(request, executive.getAccountGroupId(), JSPUtility.GetString(request, "vehicleNumber"));

			final var	dispatchPropertyValObj					= cache.getLsConfiguration(request, executive.getAccountGroupId());
			final var	documentCodeConfig						= cache.getDocumentCodeConfiguration(request, executive.getAccountGroupId());

			final var	isAgentCrossingTruckNoValidationAllow   = dispatchPropertyValObj.getString(LsConfigurationDTO.AgentCrossingTruckNoValidation, "true");
			final var	isManualLsDateValidationCheck			= PropertiesUtility.isAllow(dispatchPropertyValObj.getString(LsConfigurationDTO.IS_MANUAL_LS_DATE_VALIDATION_CHECK, "true"));
			final var	isRangeCheckInManualLS					= dispatchPropertyValObj.getBoolean(LsConfigurationDTO.RangeCheckInManualLS, true);
			final var	isManualLSDateRequiredInReceiveDel		= dispatchPropertyValObj.getBoolean(LsConfigurationDTO.IS_MANUAL_LS_DATE_REQUIRED_IN_RECEIVE_DEL, false);

			final var	documentCodeWiseCrossingLsSeqCounter		= documentCodeConfig.getBoolean(DocumentCodeConfigurationDTO.DOCUMENT_CODE_WISE_CROSSING_LS_SEQ_COUNTER, false);
			final var	customDocumentCode							= documentCodeConfig.getBoolean(DocumentCodeConfigurationDTO.CUSTOM_DOCUMENT_CODE, false);
			final var	documentCodeForCrossingLsSeqCounter			= documentCodeConfig.getInt(DocumentCodeConfigurationDTO.DOCUMENT_CODE_FOR_CROSSING_LS_SEQ_COUNTER, 0);

			if("true".equals(isAgentCrossingTruckNoValidationAllow) && vehicleNumberMasterId <= 0) {
				response.sendRedirect("SearchWayBill.do?pageId=0&eventId=1&filter=13");
				return;
			}

			final var	lsConfiguration	= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.DISPATCH);
			
			final var allowAutoGenerateConEWaybill				= (boolean) lsConfiguration.getOrDefault(LsConfigurationDTO.ALLOW_AUTO_GENERATE_CON_EWAYBILL, false);
			final var doNotDeliverAgentCrossingLSAfterDispatch 	= (boolean) lsConfiguration.getOrDefault(LoadingSheetPropertyConstant.DO_NOT_DELIVER_AGENT_CROSSING_LS_AFTER_DISPATCH, false);

			if((boolean) lsConfiguration.getOrDefault(LoadingSheetPropertyConstant.RAILWAY_BRANCH_WISE_DISPATCH, false))
				isRailwayBranch		= com.iv.utils.utility.Utility.isIdExistInLongList(lsConfiguration, LoadingSheetPropertyConstant.RAILWAY_BRANCH_IDS_FOR_DISPATCH, JSPUtility.GetLong(request, "VehicleDestinationBranchId"));

			final var	noOfDays    = cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_MAX_DAYS_OF_OPERATION_BEFORE_CASHSTATEMENT_ENTRY_ID);
			// LS Sequence Counter Validation & Generation (Start)
			var	inValObj = new ValueObject();
			inValObj.put(AliasNameConstants.IS_MANUAL_DISPATCH, StringUtils.equalsIgnoreCase("on", request.getParameter(AliasNameConstants.IS_MANUAL_DISPATCH)));
			inValObj.put("manualLSNumber", manualLSNumber);
			inValObj.put("executive", executive);
			inValObj.put("createDate", createDate);
			inValObj.put("manualLSDateStr", request.getParameter("manualLSDate"));
			inValObj.put("values", values);
			inValObj.put("noOfDays", noOfDays);
			inValObj.put(LsConfigurationDTO.IS_MANUAL_LS_DATE_VALIDATION_CHECK, isManualLsDateValidationCheck);
			inValObj.put(LsConfigurationDTO.RangeCheckInManualLS, isRangeCheckInManualLS);
			inValObj.put(LsConfigurationDTO.IS_MANUAL_LS_DATE_REQUIRED_IN_RECEIVE_DEL,isManualLSDateRequiredInReceiveDel);
			inValObj.put(DocumentCodeConfigurationDTO.DOCUMENT_CODE_WISE_CROSSING_LS_SEQ_COUNTER,documentCodeWiseCrossingLsSeqCounter);
			inValObj.put(DocumentCodeConfigurationDTO.CUSTOM_DOCUMENT_CODE,customDocumentCode);
			inValObj.put(DocumentCodeConfigurationDTO.DOCUMENT_CODE_FOR_CROSSING_LS_SEQ_COUNTER,documentCodeForCrossingLsSeqCounter);
			inValObj.put("srcBranch",srcBranch);

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

			final var	seqCuntBll	= new SequenceCounterValidationBLL();
			var	outValObj	= seqCuntBll.getLSSequenceCounterValidation(inValObj);

			if(Short.parseShort(outValObj.get("errorNo").toString()) != 1) {
				error.put("errorCode", Integer.parseInt(outValObj.get("errorCode").toString()));
				error.put("errorDescription", outValObj.get("errorDescription").toString());
				request.setAttribute("cargoError", error);
				request.setAttribute("nextPageToken", "failure");
				return;
			}
			// LS Sequence Counter Validation & Generation (End)
			final var	manualLSDate = (Timestamp)outValObj.get("manualLSDate");
			final var	lsNumber = outValObj.get("lsNumber").toString();

			final var	turNumber = "0";
			final var	destBranch		= cache.getGenericBranchDetailCache(request,JSPUtility.GetLong(request, "VehicleDestinationBranchId"));
			final var	crossingWbsCol	= new HashMap<Long, WayBillCrossing>();

			final var executiveForCrossing	= executive.getAccountGroupId()== AccountGroupConstant.ACCOUNT_GROUP_ID_LMT
					|| executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_MAHARAJA
					|| executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_KHTC
					|| executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_RAMAN_HOLDING
					|| executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_ROYAL_STAR
					|| executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_FALCON_CARGO
					|| executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_JAGRUTI_TRANSPORTS
					|| executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_TARASVIN_TRANSPORT
					|| executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_VEGA_TRANSPORT
					|| executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_HTC
					|| executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_ACIPL
					|| executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_GC;

			//destination branch must belong to destination city
			if(destBranch != null || JSPUtility.GetShort(request, "isDDDV", (short)0) == InfoForDeliveryConstant.DIRECT_DELIVERY_DIRECT_VASULI_ID){
				final var	dispatchReceiveAndDeliveryBLL			= new DispatchReceiveAndDeliveryBLL();
				inValObj            	= new ValueObject();
				final var	dispatchLedger      	= populateDispatchLedger(request, lsNumber, manualLSDate, executive, createDate);
				wayBillsForDispatch 	= new Long[values.length];
				final var	wayBillIdsForDispatch 	= CollectionUtility.getStringFromStringArray(values);
				short	txnTypeId	= 0;

				for (var i = 0; i < values.length; i++) {
					wayBillsForDispatch[i] = Long.parseLong(values[i]);

					if(executiveForCrossing) {
						final var	netLoading = JSPUtility.GetDouble(request, "netLoading_"+wayBillsForDispatch[i],0);
						final var	netUnloading = JSPUtility.GetDouble(request, "netUnloading_"+wayBillsForDispatch[i],0);
						final var	crossingHire = JSPUtility.GetDouble(request, "crossingHire_"+wayBillsForDispatch[i],0);
						final var	doorDelivery = JSPUtility.GetDouble(request, "doorDelivery_"+wayBillsForDispatch[i],0);
						crossingAgentId = JSPUtility.GetLong(request, "selectedCrossingAgentId");

						if(crossingAgentId > 0)
							txnTypeId = WayBillCrossing.TRANSACTION_TYPE_DELIVERY_CROSSING;
						else
							txnTypeId = WayBillCrossing.TRANSACTION_TYPE_BRANCH_TO_BRANCH_CROSSING;

						if(JSPUtility.GetInt(request, "crossingField_"+wayBillsForDispatch[i], 0) > 0) {
							isWayBillCrossing = true;
							isDispatchCrossing = true;
						} else
							isWayBillCrossing = false;

						if(executiveForCrossing && (crossingAgentId > 0 || isWayBillCrossing)){
							final var	wbc = createWayBillCrosssingDto(wayBillsForDispatch[i], crossingAgentId,netLoading,netUnloading,crossingHire,JSPUtility.GetString(request, "crossingLR_"+wayBillsForDispatch[i], null),JSPUtility.GetDouble(request, "localTempo_"+wayBillsForDispatch[i], 0.00),doorDelivery,txnTypeId, executive);
							totalTempoBhada += wbc.getLocalTempoBhada();
							crossingWbsCol.put(wayBillsForDispatch[i], wbc);
						} else if(netLoading != 0 || netUnloading != 0 || crossingHire != 0 || doorDelivery !=0) {
							final var	wbc = createWayBillCrosssingDto(wayBillsForDispatch[i],crossingAgentId,netLoading,netUnloading,crossingHire,JSPUtility.GetString(request, "crossingLR_"+wayBillsForDispatch[i], null),JSPUtility.GetDouble(request, "localTempo_"+wayBillsForDispatch[i], 0.00),doorDelivery,txnTypeId, executive);
							crossingWbsCol.put(wayBillsForDispatch[i], wbc);
						}
					}
				}

				//Crossing related fields set
				dispatchLedger.setLocalTempoBhada(totalTempoBhada);
				dispatchLedger.setCrossingAgentId(crossingAgentId);

				if(dispatchLedger.getCrossingAgentId() > 0) {
					isDispatchCrossing = true;
					txnTypeId = WayBillCrossing.TRANSACTION_TYPE_DELIVERY_CROSSING;
				} else
					txnTypeId = WayBillCrossing.TRANSACTION_TYPE_BRANCH_TO_BRANCH_CROSSING;

				dispatchLedger.setCrossing(isDispatchCrossing);
				dispatchLedger.setDispatchTxnTypeId(txnTypeId);

				final var	pendingDispatchStockBLL = new PendingDispatchStockBLL();
				final var	inValueObject 			= new ValueObject();

				inValueObject.put("wayBillIds", wayBillIdsForDispatch);
				inValueObject.put("pdsBranchIds", pdsBranchIds);

				if (pendingDispatchStockBLL.checkWayBillForDispatch(inValueObject)) {
					short selectionOfLHPV = 0;
					inValObj.put("crossingWbs", crossingWbsCol);

					if(request.getParameter("selectionOfLHPV") != null)
						selectionOfLHPV = Short.parseShort(request.getParameter("selectionOfLHPV"));

					if(selectionOfLHPV == 1) { //Create
						lhpv = modelLHPVForCreate(request ,lhpvNumber, executive, createDate);
						dispatchLedger.setlHPVNumber(lhpv.getlHPVNumber());
						dispatchLedger.setlHPVBranchId(lhpv.getlHPVBranchId());

					} else if(selectionOfLHPV == 2)
						lhpv = modelLHPVForAppend(request);

					inValObj.put("dispatchLedger", dispatchLedger);
					inValObj.put("wayBillsForDispatch", wayBillsForDispatch);
					inValObj.put("executive", executive);
					inValObj.put("lhpv", lhpv);
					inValObj.put("executiveBranchId",executive.getBranchId());
					inValObj.put("manualLSDate", manualLSDate);
					inValObj.put(AliasNameConstants.IS_MANUAL_DISPATCH, StringUtils.equalsIgnoreCase("on", request.getParameter(AliasNameConstants.IS_MANUAL_DISPATCH)));
					inValObj.put("pdsBranchIds", pdsBranchIds);
					inValObj.put(LsConfigurationDTO.IS_MANUAL_LS_DATE_REQUIRED_IN_RECEIVE_DEL,isManualLSDateRequiredInReceiveDel);

					receiveAndDeliveryObj = createDTOForReceiveAndDelivery(request, error,StringUtils.upperCase(JSPUtility.GetString(request, "vehicleNumber")), turNumber, crossingAgentId,dispatchLedger.getLsNumber(), manualLSDate, doNotDeliverAgentCrossingLSAfterDispatch);
					inValObj.put("receiveAndDeliveryObj", receiveAndDeliveryObj);
					inValObj.put(PodWayBillPropertiesConstant.POD_CONFIGURATION, cache.getPODWayBillConfiguration(request, executive.getAccountGroupId()));
					inValObj.put(LsConfigurationDTO.LS_CONFIGURATION, dispatchPropertyValObj);
					inValObj.put(ReceiveConfigurationPropertiesConstant.RECEIVE_CONFIGUARTION, cache.getReceiveConfiguration(request, executive.getAccountGroupId()));

					new TransportReceivedWayBillAction().setExtraData(request, cache, inValObj, executive);

					if(TOKEN_VALUE != null) {
						if(!TOKEN_VALUE.equals(request.getSession().getAttribute(TokenGenerator.TOKEN_VALUE))) {
							error.put("errorCode", CargoErrorList.DISPATCH_ERROR);
							error.put("errorDescription", "Data already submitted, Please wait.");
							request.setAttribute("cargoError", error);
							request.setAttribute("nextPageToken", "failure");
							return;
						}
						request.getSession().setAttribute(TokenGenerator.TOKEN_VALUE, null);
					}

					outValObj = dispatchReceiveAndDeliveryBLL.dispatchReceivedAndDeliveryWayBills(inValObj);

					status = (String) outValObj.get("status");

					if ("success".equals(status)) {
						final long dispatchLedgerId = (Long) outValObj.get("dispatchLedgerId");

						if(showAdvancePaymentOption > 0)
							response.sendRedirect("SearchWayBill.do?pageId=3&eventId=9&dispatchLedgerId=" + dispatchLedgerId + "&Type=Dispatched&LSNo=" + dispatchLedger.getLsNumber() + "&isCrossing=" + dispatchLedger.isCrossing() + "&CrossingAgentId=" + dispatchLedger.getCrossingAgentId() + "&isCrossingFlow=1&showAdvancePaymentOption=" + showAdvancePaymentOption + "&advancePayment="+advancePayment);
						else
							response.sendRedirect("SearchWayBill.do?pageId=3&eventId=9&dispatchLedgerId=" + dispatchLedgerId + "&Type=Dispatched&LSNo=" + dispatchLedger.getLsNumber() + "&isCrossing=" + dispatchLedger.isCrossing() + "&CrossingAgentId=" + dispatchLedger.getCrossingAgentId() + "&isCrossingFlow=1&showAdvancePaymentOption=" + showAdvancePaymentOption);

						request.setAttribute("nextPageToken", "success");
						request.setAttribute("dispatchLedgerId", dispatchLedgerId);
					} else {
						error.put("errorCode", outValObj.getInt("errorCode"));
						error.put("errorDescription", outValObj.getString("errorDescription"));
						request.setAttribute("cargoError", error);
						request.setAttribute("nextPageToken", "failure");
					}
				} else {
					error.put("errorCode", CargoErrorList.DUPLICATE_DISPATCH_ERROR);
					error.put("errorDescription", CargoErrorList.DUPLICATE_DISPATCH_ERROR_DESCRIPTION );
					request.setAttribute("cargoError", error);
					request.setAttribute("nextPageToken", "failure");
				}
			} else {
				error.put("errorCode", CargoErrorList.WRONG_BRANCHFORCITY_ERROR);
				error.put("errorDescription",CargoErrorList.WRONG_BRANCHFORCITY_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
				request.setAttribute("nextPageToken", "failure");
			}

		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}
	}

	private ValueObject createDTOForReceiveAndDelivery(final HttpServletRequest request, final HashMap<String, Object> error, final String vehicleNo, final String turNumber, final long crossingAgentId, final String lsNumber, final Timestamp  manualLSDate, final boolean doNotDeliverAgentCrossingLSAfterDispatch) throws Exception {

		Executive 							executive 				= null;
		Calendar 							cal 					= null;
		SimpleDateFormat 					sdf               		= null;
		String[] 							wayBillToReceived		= null;
		Long[] 								wayBill					= null;
		ValueObject 						valueInObject			= null;
		HashMap<Long,ReceiveSummaryData>	receiveSummaryDataArr 	= null;
		String 								arrivalTime 			= null;
		String 								arrivalDate 			= null;
		String 								amPm 					= null;
		Timestamp 							createDate 				= null;
		final Timestamp 							manualTURDate			= null;
		HashMap<Long,ValueObject> 			delValObjCol			= null;
		ValueObject	 						delValObj				= null;
		DeliveryContactDetails 				deliveryContactDetails	= null;
		String								deliverString 			= null;
		ArrayList<Long>                     shortCreditWayBillIdList = null;
		var								wayBillDeliveryNumber 	= "0";
		long[] 								delchrId	= null;
		HashMap<Long,Double> 				delchrhm	= null;
		HashMap<Long,Short> 				chetypehm	= null;
		Double[] 							chrgesType	= null;
		String								dt 			= null;
		String 								strDate 	= null;
		Date 								fDate 		= null;
		Timestamp 	date 		= null;
		var	isArrivalTruckDetailReport = false;
		var					isManualTUR			= false;
		var					isPendingDeliveryTableEntry = false;
		var isServiceTaxReport = false;

		try {
			cache			= new CacheManip(request);
			sdf    			= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			executive		= cache.getExecutive(request);
			createDate 		= DateTimeUtility.getCurrentTimeStamp();

			isArrivalTruckDetailReport 	= cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_ARRIVAL_TRUCK_DETAILS_REPORT) == ConfigParam.CONFIG_KEY_CONFIG_KEY_ARRIVAL_TRUCK_DETAILS_REPORT_ALLOWED;
			isPendingDeliveryTableEntry = cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_PENDING_DELIVERY_STOCK_TABLE_ENTRY) == ConfigParam.CONFIG_KEY_PENDING_DELIVERY_STOCK_TABLE_ENTRY_ALLOWED;
			isServiceTaxReport 			= cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_SERVICE_TAX_REPORT) == ConfigParam.CONFIG_KEY_VALUE_SERVICE_TAX_REPORT_ALLOWED;

			isManualTUR			= JSPUtility.GetBoolean(request, "isManualTUR", false);
			wayBillToReceived	= request.getParameterValues("wayBills");

			final var	lrIds = CollectionUtility.getStringFromStringArray(wayBillToReceived);

			shortCreditWayBillIdList = new ArrayList<>();
			cal 					= Calendar.getInstance();
			wayBill					= new Long[wayBillToReceived.length];
			receiveSummaryDataArr	= new HashMap<>();
			delValObjCol 			= new HashMap<>();

			final var dispatchLedgerWBCount 	= 1L;
			final var unloadByExecutiveId	= JSPUtility.GetLong(request, "unloadByExecutiveId", executive.getExecutiveId());
			var  totalNoOfShortLuggage  = 0;
			var  totalNoOfDamageLuggage = 0;

			final var	conSumyDtlColl = ConsignmentSummaryDao.getInstance().getLimitedConsignmentDetails(lrIds);
			final var	consigneeDtlColl = CustomerDetailsDao.getInstance().getConsigneeDetailsByWayBillId(lrIds);
			final var	delExecutive = ExecutiveDao.getInstance().findByExecutiveId(unloadByExecutiveId);
			final var	deliveryCharge = cache.getActiveDeliveryCharges(request, delExecutive.getBranchId());

			final var	wbForTUR = new ArrayList<LoadingSheetSettlement>();

			final var	wayBillIdsForReceive	= CollectionUtility.getStringFromStringArray(wayBillToReceived);

			for(var i = 0; i < wayBillToReceived.length ; i++) {
				wayBill[i] = Long.parseLong(wayBillToReceived[i]);
				final var	consignmentSummary = conSumyDtlColl.get(wayBill[i]);
				final var	consignee = consigneeDtlColl.get(wayBill[i]);

				final var	deliveryPaymentType = PaymentTypeConstant.PAYMENT_TYPE_CROSSING_CREDIT_ID;

				final var	receiveSummaryData = new ReceiveSummaryData();
				receiveSummaryData.setActualUnloadWeight(consignmentSummary.getActualWeight());
				receiveSummaryData.setNoOfPackages((int)consignmentSummary.getQuantity());
				receiveSummaryData.setActualWeight(consignmentSummary.getActualWeight());
				receiveSummaryData.setShortLuggage(JSPUtility.GetInt(request, "shortLuggage_"+wayBill[i], 0));
				receiveSummaryData.setDamageLuggage(JSPUtility.GetInt(request, "damageLuggage_"+wayBill[i], 0));
				receiveSummaryData.setDamageAmount(JSPUtility.GetDouble(request, "damageAmount_"+wayBill[i], 0));
				receiveSummaryData.setRemark(JSPUtility.GetString(request, "remark_"+wayBill[i], ""));
				receiveSummaryData.setGodownId(JSPUtility.GetLong(request, "godownId_"+wayBill[i], 0));
				receiveSummaryData.setUnloadedByHamalId(JSPUtility.GetShort(request, "unloadedByHamal_"+wayBill[i], TransportCommonMaster.LOADED_BY_OUR_ID));
				receiveSummaryData.setUnloadedInId(JSPUtility.GetShort(request, "unloadedIn_"+wayBill[i], TransportCommonMaster.UNLOADED_IN_GODOWN_ID));
				receiveSummaryData.setWayBillId(wayBill[i]);

				if((executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_KHTC
						|| executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_RAMAN_HOLDING
						|| executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_HTC
						|| executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_ACIPL
						|| executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_GC) && crossingAgentId > 0)
					receiveSummaryData.setCashStatementEntered(true);

				totalNoOfShortLuggage  += receiveSummaryData.getShortLuggage();
				totalNoOfDamageLuggage += receiveSummaryData.getDamageLuggage();

				//For Delivery
				if(deliveryPaymentType != PaymentTypeConstant.PAYMENT_TYPE_RECEIVE_AT_GODOWN_ID){
					receiveSummaryData.setGodown(false);
					delValObj = new ValueObject();
					var billingCreditorId = 0L;
					deliveryContactDetails = new DeliveryContactDetails();
					deliveryContactDetails.setWayBillId(wayBill[i]);
					deliveryContactDetails.setDeliveredToName(consignee.getName());
					deliveryContactDetails.setDeliveredToNumber(consignee.getPhoneNumber());
					deliveryContactDetails.setBranchId(delExecutive.getBranchId());
					deliveryContactDetails.setAccountGroupId(delExecutive.getAccountGroupId());
					deliveryContactDetails.setPaymentType(deliveryPaymentType);
					deliveryContactDetails.setBankName("");
					deliveryContactDetails.setPodStatus(PODStatusConstant.POD_DISPATCH_STATUS_PENDING);

					deliverString = WayBillDeliveryTypeConstant.WAYBILL_DELIVERY_TYPE_DELIVER;

					deliveryContactDetails.setVehicleNumber(vehicleNo);
					switch (deliveryPaymentType) {
					case PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID -> {
						//Cheque Date calculation (Start)
						dt = JSPUtility.GetString(request, "chequeDate_"+wayBill[i], "");
						if (!"".equals(dt)) {
							strDate = JSPUtility.GetString(request,"chequeDate_"+wayBill[i], "") + " 00:00:00";
							fDate 	= sdf.parse(strDate);
							date 	= new Timestamp(fDate.getTime());
							deliveryContactDetails.setChequeDate(date);
						}
						//Invoice Date calculation (End)
						deliveryContactDetails.setChequeNumber(JSPUtility.GetString(request, "chequeNo_"+wayBill[i], "0"));
						deliveryContactDetails.setChequeAmount(JSPUtility.GetDouble(request, "chequeAmount_"+wayBill[i], 0.00));
						deliveryContactDetails.setBankName(StringUtils.upperCase(JSPUtility.GetString(request, "bankName_" + wayBill[i], "")));
					}
					case PaymentTypeConstant.PAYMENT_TYPE_BILL_CREDIT_ID -> {
						deliverString = WayBillDeliveryTypeConstant.WAYBILL_DELIVERY_TYPE_DELIVER;
						//set DeliveryCreditorId for Billing
						billingCreditorId = JSPUtility.GetLong(request, "selectedDeliveryCreditorId_"+wayBill[i],0);
						if(billingCreditorId > 0){
							delValObj.put("Creditor_Payment_Module_Key",cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_CREDITOR_PAYMENT_MODULE));
							delValObj.put("billingCreditorId",billingCreditorId);
						}
					}
					case PaymentTypeConstant.PAYMENT_TYPE_CREDIT_ID -> shortCreditWayBillIdList.add(wayBill[i]);
					default -> {
						break;
					}
					}

					var flag  = false;
					if(deliveryCharge != null){

						flag 		= true;
						delchrId	= new long[deliveryCharge.length];
						delchrhm	= new HashMap<>();
						chetypehm	= new HashMap<>();
						chrgesType	= new Double[deliveryCharge.length];

						for(var j=0;j<deliveryCharge.length;j++){
							var charge = JSPUtility.GetDouble(request, "deliveryCharge_"+ deliveryCharge[j].getChargeTypeMasterId()+"_"+wayBill[i], 0);
							if(deliveryCharge[j].getChargeTypeMasterId() == ChargeTypeMaster.LOCAL_TEMPO)
								charge += JSPUtility.GetDouble(request, "localTempo_"+wayBill[i], 0.00);
							delchrId[j]=deliveryCharge[j].getChargeTypeMasterId();
							chrgesType[j]=charge;
							delchrhm.put(deliveryCharge[j].getChargeTypeMasterId(), chrgesType[j]);
							chetypehm.put(deliveryCharge[j].getChargeTypeMasterId(),deliveryCharge[j].getChargeType());
						}

						delValObj.put("deliveryChargeId_valueObj", delchrId);
						delValObj.put("deliveryCharge_valueObj", delchrhm);
						delValObj.put("ChargeType_valueObj", chetypehm);
					}
					delValObj.put("flag_valueObj", flag);

					var delDis=0.00;
					if(request.getParameter("discount_"+wayBill[i]) != null)
						delDis=Double.parseDouble(request.getParameter("discount_"+wayBill[i]));
					delValObj.put("delDis_valueObj", delDis);

					delValObj.put("WayBillId_valueObj", wayBill[i]);
					delValObj.put("AccountId_valueObj", delExecutive.getAccountGroupId());
					delValObj.put("Executive_valueObj", delExecutive);
					delValObj.put("deliverString_valueObj", deliverString);
					delValObj.put("corporateAccountId_valueObj", billingCreditorId );

					delValObj.put("WayBillTaxTxn", null);

					delValObj.put("DeliveryContactDetails", deliveryContactDetails);
					delValObj.put("configDamerageAmount", JSPUtility.GetDouble(request, "configDamerageAmount", 0.00));

					final var deliveryRemark = JSPUtility.GetString(request, "remark_"+wayBill[i], "");
					if(deliveryRemark != null)
						delValObj.put("deliveryRemark_valueObj", deliveryRemark);

					delValObj.put("topayToPaidAmount", JSPUtility.GetDouble(request, "topayToPaidAmount" ,0.00));
					delValObj.put("calculateSTOn", 0);
					delValObj.put("collectionPersonId", JSPUtility.GetLong(request, "selectedCollectionPersonId",0));

					delValObjCol.put(wayBill[i], delValObj);
				}

				receiveSummaryDataArr.put(wayBill[i],receiveSummaryData);
			}

			valueInObject	= new ValueObject();

			valueInObject.put("WayBillCount", wayBill.length);
			valueInObject.put("wayBillToReceived", wayBillIdsForReceive);

			if(!doNotDeliverAgentCrossingLSAfterDispatch)
				valueInObject.put("wayBillIdsForDelivery", wayBillIdsForReceive);

			valueInObject.put("DispatchLedgerWayBillCounter", dispatchLedgerWBCount);
			valueInObject.put("executive", executive);
			valueInObject.put("receiveSummaryDataArr", receiveSummaryDataArr);
			valueInObject.put("totalNoOfShortLuggage", totalNoOfShortLuggage);
			valueInObject.put("totalNoOfDamageLuggage", totalNoOfDamageLuggage);
			valueInObject.put("narrationRemark", JSPUtility.GetString(request, "narrationRemark", ""));
			valueInObject.put("deductionAmt", JSPUtility.GetDouble(request, "deductionAmt", 0.00));
			valueInObject.put("TURNumber", turNumber != null ? turNumber : "");
			valueInObject.put("wbForTUR", wbForTUR);

			if(request.getParameter("manualLSDate") != null)
				valueInObject.put("manualLSDate",manualLSDate);

			valueInObject.put(AliasNameConstants.IS_MANUAL_DISPATCH, StringUtils.equalsIgnoreCase("on", request.getParameter(AliasNameConstants.IS_MANUAL_DISPATCH)));

			if(isManualTUR)
				valueInObject.put("isManualTUR", isManualTUR);

			valueInObject.put("unloadByExecutiveId", unloadByExecutiveId);
			valueInObject.put("manualTURDate", manualTURDate);
			valueInObject.put("createDate", createDate);

			if(request.getParameter("arrivalTime") != null && request.getParameter("ampm") != null) {
				if(request.getParameter("isManualTUR") != null && request.getParameter("manualTURDate") != null)
					arrivalDate = request.getParameter("manualTURDate");
				else
					arrivalDate	= cal.get(Calendar.DATE)+"-"+(cal.get(Calendar.MONTH)+ 1)+"-"+cal.get(Calendar.YEAR);

				arrivalTime	= JSPUtility.GetString(request, "arrivalTime");
				amPm 		= JSPUtility.GetString(request, "ampm");
				arrivalTime = createTime(arrivalTime, amPm);
				valueInObject.put("arrivalDateTime", new Timestamp(sdf.parse(arrivalDate + " " + arrivalTime).getTime()));
			} else if(request.getParameter("isManualTUR") != null && request.getParameter("manualTURDate") != null)
				valueInObject.put("arrivalDateTime", manualTURDate);
			else
				valueInObject.put("arrivalDateTime", createDate);

			valueInObject.put("isArrivalTruckDetailReport", isArrivalTruckDetailReport);
			valueInObject.put("delValObjCol", delValObjCol);
			valueInObject.put("isCRSequenceRequired", true);

			if(executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_LMT)
				wayBillDeliveryNumber = lsNumber;

			valueInObject.put("wayBillDeliveryNumber", wayBillDeliveryNumber);
			valueInObject.put("branchesColl", cache.getGenericBranchesDetail(request));
			valueInObject.put("configValueForDelivery", cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_DELIVERY_ACCESSIBILITY));
			valueInObject.put("deliveryLocationList", cache.getAssignedLocationsIdListByLocationIdId(request, executive.getBranchId(), executive.getAccountGroupId()));
			valueInObject.put("isPendingDeliveryTableEntry", isPendingDeliveryTableEntry);

			if(!shortCreditWayBillIdList.isEmpty())
				valueInObject.put("shortCreditWayBillIds", Utility.GetLongArrayListToString(shortCreditWayBillIdList));

			valueInObject.put("isServiceTaxReport", isServiceTaxReport);
			valueInObject.put("generalConfiguration", cache.getGeneralConfiguration(request, executive.getAccountGroupId()));
			valueInObject.put("isCrossingAgentDispatchReceiveAndDelivery", true);
			valueInObject.put("doNotDeliverAgentCrossingLSAfterDispatch", doNotDeliverAgentCrossingLSAfterDispatch);

			return valueInObject;

		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
			throw e;
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

	private DispatchLedger populateDispatchLedger(final HttpServletRequest request ,final String lsNumber, final Timestamp manualLSDate, final Executive executive, final Timestamp createDate) throws Exception {
		try {
			final var	dispatchLedger 	= new DispatchLedger();
			dispatchLedger.setLocalTempoBhada(JSPUtility.GetDouble(request, "lrLocalTempo", 0.00));
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
			if(JSPUtility.GetShort(request, "isDDDV", (short)0) == TransportCommonMaster.DIRECT_DELIVERY_DIRECT_VASULI_ID)
				dispatchLedger.setDDDV(true);
			dispatchLedger.setTripName("trip");
			dispatchLedger.setActualDispatchDateTime(createDate);
			dispatchLedger.setBranchTransfer(false);
			dispatchLedger.setSuperVisor(JSPUtility.GetString(request, "superVisor" ,""));
			dispatchLedger.setRemark(JSPUtility.GetString(request, "remark", ""));

			dispatchLedger.setVehicleNumber(StringUtils.upperCase(JSPUtility.GetString(request, "vehicleNumber")));
			dispatchLedger.setVehicleNumberMasterId(vehicleNumberMasterId);

			dispatchLedger.setDriverName(StringUtils.upperCase(JSPUtility.GetString(request, "driver1Name", "")));
			dispatchLedger.setDriverId(JSPUtility.GetLong(request ,"driver1Insert" , 0));
			dispatchLedger.setDriverLicenceNumber(StringUtils.upperCase(JSPUtility.GetString(request, "driver1", "")));

			dispatchLedger.setDriver2Name(StringUtils.upperCase(JSPUtility.GetString(request, "driver2Name", "")));
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
			dispatchLedger.setTotalNoOfPackages(Integer.parseInt(request.getParameter("totalNoOfPackages")));
			dispatchLedger.setTotalNoOfWayBills(JSPUtility.GetInt(request, "totalNoOfWayBills", 0));

			dispatchLedger.setLsNumber(lsNumber);
			dispatchLedger.setLsBranchId(executive.getBranchId());

			if("".equals(JSPUtility.GetString(request, "driver1MobileNumber1" , "")) || "Driver 1 Mob. No 1".equals(JSPUtility.GetString(request, "driver1MobileNumber1")))
				dispatchLedger.setDriver1MobileNumber1(null);
			else
				dispatchLedger.setDriver1MobileNumber1(JSPUtility.GetString(request, "driver1MobileNumber1"));
			if("".equals(JSPUtility.GetString(request, "driver1MobileNumber2" , "")) || "Driver 1 Mob. No 2".equals(JSPUtility.GetString(request, "driver1MobileNumber1")))
				dispatchLedger.setDriver1MobileNumber2(null);
			else
				dispatchLedger.setDriver1MobileNumber2(JSPUtility.GetString(request, "driver1MobileNumber2"));

			dispatchLedger.setCrossing("Agent Crossing".equals(request.getParameter("isAgentCrossing")));

			return dispatchLedger;
		} catch (final Exception e) {
			e.printStackTrace();
			throw e;
		}
	}

	private LHPV modelLHPVForCreate(final HttpServletRequest request, final String lHPVNumber, final Executive executive, final Timestamp createDate) throws Exception {
		try {
			final var	lhpv = new LHPV();

			lhpv.setAccountGroupId(executive.getAccountGroupId());
			lhpv.setExecutiveId(executive.getExecutiveId());
			lhpv.setBranchId(executive.getBranchId());

			lhpv.setCreationDateTimeStamp(createDate);
			lhpv.setTotalAmount(JSPUtility.GetDouble(request, "totalAmount", 0.00));
			lhpv.setAdvanceAmount(JSPUtility.GetDouble(request, "advanceAmount", 0.00));
			lhpv.setBalanceAmount(JSPUtility.GetDouble(request, "balanceAmount", 0.00));
			lhpv.setBalancePayableAtBranchId(JSPUtility.GetLong(request, "BalancePayableBranchId", 0));
			lhpv.setDispatchLedgersToUpdate(request.getParameter("dispatchLedgerNoToAppend"));
			lhpv.setMaterials(request.getParameter("materials"));
			lhpv.setRatePMT(JSPUtility.GetDouble(request, "ratePMT", 0.00));
			lhpv.setUnloading(JSPUtility.GetDouble(request, "unloadingCharges", 0.00));
			lhpv.setDetaintion(JSPUtility.GetDouble(request, "detaintionCharges", 0.00));
			lhpv.setOtherAdditionalCharge(JSPUtility.GetDouble(request, "otherAdditionalCharges", 0.00));
			lhpv.setDeduction(JSPUtility.GetDouble(request, "deduction", 0.00));
			lhpv.setToPayReceived(JSPUtility.GetDouble(request, "toPayReceived", 0.00));
			lhpv.setRefund(JSPUtility.GetDouble(request, "refund", 0.00));
			lhpv.setlHPVNumber(lHPVNumber);
			lhpv.setlHPVBranchId(executive.getBranchId());
			return lhpv;

		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private LHPV modelLHPVForAppend(final HttpServletRequest request) throws Exception {
		try {
			final var	lhpv = new LHPV();

			lhpv.setLhpvId(JSPUtility.GetLong(request, "lhpvNoToAppend", 0));
			lhpv.setDispatchLedgersToUpdate(request.getParameter("dlNoToAppend"));

			return lhpv;
		} catch (final Exception e) {
			e.printStackTrace();
			throw e;
		}
	}

	private WayBillCrossing createWayBillCrosssingDto(final long wayBillId, final long crossingAgentId,final double netLoading,final double netUnloading,final double crossingHire,final String crossingWayBillNo,final double localTempoBhada,final double doorDelivery, final short txnTypeId, final Executive executive) throws Exception {

		try{
			final var wbc = new WayBillCrossing();

			wbc.setWayBillId(wayBillId);
			wbc.setAccountGroupId(executive.getAccountGroupId());
			wbc.setCrossingAgentId(crossingAgentId);
			wbc.setNetLoading(netLoading);
			wbc.setNetUnloading(netUnloading);
			wbc.setCrossingHire(crossingHire);
			wbc.setCrossingWayBillNo(crossingWayBillNo);
			wbc.setLocalTempoBhada(localTempoBhada);
			wbc.setDoorDelivery(doorDelivery);
			wbc.setTxnTypeId(txnTypeId);
			return wbc;
		}catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}
}