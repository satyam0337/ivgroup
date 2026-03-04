package com.ivcargo.actions.transport;

//~--- non-JDK imports --------------------------------------------------------

import java.sql.Timestamp;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;
import java.util.StringJoiner;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.ObjectUtils;
import org.apache.commons.lang3.StringUtils;
import org.json.JSONObject;

import com.businesslogic.BillBLL;
import com.businesslogic.DispatchBLL;
import com.businesslogic.LRSearchBLL;
import com.businesslogic.ShortCreditCollectionSheetSettlementBLL;
import com.businesslogic.utils.WayBillAccessibility;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.bll.impl.loadingsheet.LoadingSheetToTripSheetBllImpl;
import com.iv.bll.impl.properties.DisplayDataConfigurationBllImpl;
import com.iv.bll.utils.IDProofSelectionUtility;
import com.iv.constant.properties.BLHPVPropertiesConstant;
import com.iv.constant.properties.BranchExpensePropertiesConstant;
import com.iv.constant.properties.BranchIncomePropertiesConstant;
import com.iv.constant.properties.STBSConfigurationConstant;
import com.iv.constant.properties.STBSSettlementConfigurationConstant;
import com.iv.constant.properties.SearchConfigPropertiesConstant;
import com.iv.constant.properties.TripHisabPropertiesConstant;
import com.iv.constant.properties.crossingagent.CrossingAgentBillClearancePropertiesConstant;
import com.iv.constant.properties.invoice.BillPaymentConfigurationConstant;
import com.iv.constant.properties.invoice.CreditorInvoicePropertiesConstant;
import com.iv.constant.properties.lhpv.LHPVPropertiesConstant;
import com.iv.dao.impl.DispatchSummaryDaoImpl;
import com.iv.dao.impl.DoorPickupDetailsDaoImpl;
import com.iv.dao.impl.HamaliSettlementDaoImpl;
import com.iv.dao.impl.VehicleConfigHamaliDaoImpl;
import com.iv.dao.impl.FundTransfer.FundTransferHistoryDaoImpl;
import com.iv.dao.impl.agentbranchhisab.AgentHisabDispatchSummaryDaoImpl;
import com.iv.dao.impl.agentbranchhisab.AgentHisabLhpvSummaryDaoImpl;
import com.iv.dao.impl.agentbranchhisab.PendingHisabByAgentBranchDaoImpl;
import com.iv.dao.impl.bill.BillCoverLetterDaoImpl;
import com.iv.dao.impl.bill.BillDaoImpl;
import com.iv.dao.impl.commission.PartyAgentCommisionSummaryDaoImpl;
import com.iv.dao.impl.crossingagentbill.CrossingAgentBillDaoImpl;
import com.iv.dao.impl.crossingagentbill.CrossingBillReceiptDaoImpl;
import com.iv.dao.impl.incomeexpense.ExpenseVoucherDetailsDaoImpl;
import com.iv.dao.impl.lhpv.LHPVDaoImpl;
import com.iv.dao.impl.logs.BLHPVUpdateEditLogsDaoImpl;
import com.iv.dto.DoorPickupDetails;
import com.iv.dto.bill.Bill;
import com.iv.dto.bill.BillCoveringLetter;
import com.iv.dto.constant.BillClearanceStatusConstant;
import com.iv.dto.constant.BusinessFunctionConstants;
import com.iv.dto.constant.DeliveryStatusConstant;
import com.iv.dto.constant.DispatchLedgerConstant;
import com.iv.dto.constant.ExecutiveTypeConstant;
import com.iv.dto.constant.FeildPermissionsConstant;
import com.iv.dto.constant.IncomeExpenseChargeTypeConstant;
import com.iv.dto.constant.IncomeExpenseMappingConstant;
import com.iv.dto.constant.LHPVChargeTypeConstant;
import com.iv.dto.constant.LHPVConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.dto.constant.PaymentStatusConstant;
import com.iv.dto.constant.PaymentTypeConstant;
import com.iv.dto.constant.SearchTypeConstant;
import com.iv.dto.constant.WayBillStatusConstant;
import com.iv.dto.constant.WayBillTypeConstant;
import com.iv.dto.crossingagentbill.CrossingAgentBill;
import com.iv.dto.crossingagentbill.CrossingBillReceipt;
import com.iv.dto.fundtransfer.FundTransfer;
import com.iv.dto.fundtransfer.FundTransferApprove;
import com.iv.dto.model.PartyAgentCommisionSummary;
import com.iv.dto.model.bill.BillPrintModel;
import com.iv.properties.constant.LoadingSheetPropertyConstant;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.constant.AccountGroupConstant;
import com.iv.utils.constant.Constant;
import com.iv.utils.constant.DateTimeFormatConstant;
import com.iv.utils.constant.FundTransferTypeConstant;
import com.iv.utils.constant.properties.FundTransferPropertiesConstant;
import com.iv.utils.constant.properties.ReceiveConfigurationPropertiesConstant;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.exception.ExceptionProcess;
import com.iv.utils.message.Message;
import com.iv.utils.utility.CollectionUtility;
import com.iv.utils.utility.EncryptDecryptUtility;
import com.iv.utils.utility.ListFilterUtility;
import com.iv.utils.utility.SortUtils;
import com.iv.utils.utility.Utility;
import com.iv.utils.webService.WSUtility;
import com.iv.utils.webService.WebServiceURI;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.ivcargo.utils.JsonUtility;
import com.platform.dao.AgentCommisionBillingSummaryDao;
import com.platform.dao.BLHPVDao;
import com.platform.dao.ConsignmentSummaryDao;
import com.platform.dao.CustomerDetailsDao;
import com.platform.dao.DeliveryContactDetailsDao;
import com.platform.dao.DeliveryDebitMemoDao;
import com.platform.dao.DeliveryRunSheetLedgerDao;
import com.platform.dao.DeliveryRunSheetSummaryDao;
import com.platform.dao.DispatchArticleDetailsDao;
import com.platform.dao.DispatchLedgerDao;
import com.platform.dao.DispatchSummaryDao;
import com.platform.dao.ExecutiveDao;
import com.platform.dao.ExpenseChargeDao;
import com.platform.dao.LHPVDao;
import com.platform.dao.LhpvSettlementChargesDao;
import com.platform.dao.LorryHireDao;
import com.platform.dao.PODDispatchLedgerDao;
import com.platform.dao.PreLoadingSheetLedgerDao;
import com.platform.dao.ReceivedLedgerDao;
import com.platform.dao.VoucherDetailsDao;
import com.platform.dao.WayBillDao;
import com.platform.dao.WayBillExpenseDao;
import com.platform.dao.WayBillIncomeDao;
import com.platform.dao.WayBillIncomeVoucherDetailsDao;
import com.platform.dao.agentbranchhisab.AgentBranchHisabLedgerDao;
import com.platform.dao.pickupdispatch.DoorPickupLedgerDao;
import com.platform.dao.reports.BLHPVCreditAmountTxnDAO;
import com.platform.dao.reports.CrossingAgentBillSummaryDAO;
import com.platform.dao.tdstxn.TDSTxnDetailsDAO;
import com.platform.dao.waybill.MoneyReceiptTxnDao;
import com.platform.dto.AliasNameConstants;
import com.platform.dto.BLHPV;
import com.platform.dto.BillDetailsForPrintingBill;
import com.platform.dto.Branch;
import com.platform.dto.ConfigParam;
import com.platform.dto.ConsignmentSummary;
import com.platform.dto.CustomerDetails;
import com.platform.dto.DeliveryContactDetails;
import com.platform.dto.DeliveryRunSheetLedger;
import com.platform.dto.DeliveryRunSheetSummaryModel;
import com.platform.dto.DispatchArticleDetails;
import com.platform.dto.DispatchLedger;
import com.platform.dto.DispatchSummary;
import com.platform.dto.DoorPickupLedger;
import com.platform.dto.Executive;
import com.platform.dto.ExecutiveFeildPermissionDTO;
import com.platform.dto.ExpenseDetails;
import com.platform.dto.ExpenseVoucherDetails;
import com.platform.dto.LHPV;
import com.platform.dto.LhpvChargesForGroup;
import com.platform.dto.LorryHire;
import com.platform.dto.MoneyReceiptTxn;
import com.platform.dto.PODDispatch;
import com.platform.dto.PreLoadingSheetLedger;
import com.platform.dto.ReceivedLedger;
import com.platform.dto.ShortCreditCollectionSheetLedgerDto;
import com.platform.dto.SubRegion;
import com.platform.dto.VehicleNumberMaster;
import com.platform.dto.WayBill;
import com.platform.dto.WayBillIncomeVoucherDetails;
import com.platform.dto.WayBillType;
import com.platform.dto.configuration.master.DisplayDataConfigurationDTO;
import com.platform.dto.configuration.mindateselection.ModuleWiseMinDateSelectionConfigurationDTO;
import com.platform.dto.configuration.modules.GroupConfigurationPropertiesDTO;
import com.platform.dto.constant.WSConstant;
import com.platform.dto.model.WayBillModel;
import com.platform.dto.model.WayBillViewModel;
import com.platform.dto.tds.TDSTxnDetailsIdentifiers;
import com.platform.resource.CargoErrorList;

public class TransportSearchWayBillAction implements Action {

	public static final String TRACE_ID = "TransportSearchWayBillAction";

	@Override
	@SuppressWarnings({ "unchecked"})
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {

		HashMap<String,Object>	 					error 									= null;
		Map<Object, Object>							suppBillValObject 						= null;
		BLHPV										blhpv									= null;
		SubRegion 									subRegion 								= null;
		var											typeOfNumber							= 0;
		String 										billNumber								= null;
		HashMap<Long, HashMap<Long, Double>>   		chargesCollMainHshmp 					= null;
		var											isBlhpvChargeEdited						= false;
		var 										count									= 0;
		List<LHPV>									lhpvArrTemp								= null;
		ShortCreditCollectionSheetLedgerDto[] 		shortLedgerDtoTemp 						= null;
		List<BillDetailsForPrintingBill>			suppBillDetailsArrList					= null;
		LorryHire									lorryHire								= null;
		final var									creditPaymentDone						= false;
		DeliveryRunSheetLedger[]					deliveryRunSheetLedgerArr				= null;
		List<Long>									executiveIdListForLSPrintWithoutLHPVCreation	= null;
		ValueObject									outValueObject								= null;
		HashMap<Long, ExpenseVoucherDetails>		voucherDetailsHM							= null;
		ExpenseVoucherDetails[] 					voucherDetailsList 							= null;
		Timestamp									minDateTimeStamp							= null;
		String 										branchCode									= null;
		List<WayBillViewModel> 						wayBillArray  								= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeTransportSearchWayBillAction().execute(request, response);

			if(request.getParameter("NumberType") != null)
				typeOfNumber	= JSPUtility.GetInt(request, "NumberType", 0);//Search from Header

			if(request.getParameter("TypeOfNumber") != null)
				typeOfNumber	= JSPUtility.GetInt(request, "TypeOfNumber", 0);//Search from Module

			final var	executive					= (Executive) request.getSession().getAttribute(Executive.EXECUTIVE);

			if(executive == null) {
				ActionStaticUtil.throwInvalidSessionError(request, error);
				return;
			}

			final var	number						= JSPUtility.GetString(request, "wayBillNumber", "");
			var			id							= JSPUtility.GetLong(request, "wayBillId", 0);
			final var	enwayBillId					= JSPUtility.GetString(request, "enwayBillId", null);
			final var	branchId					= JSPUtility.GetLong(request, "BranchId", 0);

			if(enwayBillId != null)
				id	= EncryptDecryptUtility.decryptLong(enwayBillId);

			final var	inValObj					= new ValueObject();
			final var	lrSearchBLL					= new LRSearchBLL();
			final var	cacheManip					= new CacheManip(request);
			final var	transportList				= cacheManip.getTransportList(request);

			final var	noOfDays					= cacheManip.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_MAX_DAYS_OF_OPERATION_BEFORE_CASHSTATEMENT_ENTRY_ID);
			final var	displayDataConfig			= cacheManip.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.DISPLAY_DATA_CONFIGURATION);
			final var	searchConfiguration			= cacheManip.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.SEARCH_CONFIGURATION);
			final var	branchesColl				= cacheManip.getGenericBranchesDetail(request);
			final var	subregionObj				= cacheManip.getAllSubRegions(request);
			final var	receiveConfiguration		= cacheManip.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.RECEIVE);
			final var	groupConfiguration			= cacheManip.getGroupConfiguration(request, executive.getAccountGroupId());
			final var	deliveryLocationList		= cacheManip.getAssignedLocationsIdListByLocationIdId(request, executive.getBranchId(), executive.getAccountGroupId());

			final var 	lsPropertyConfig							= cacheManip.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.DISPATCH);
			final var 	lhpvPropertyConfig							= cacheManip.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.LHPV);

			final var	showDummyWayBill							= executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_BATO;
			final var	branchOperationLocking						= groupConfiguration.getBoolean(GroupConfigurationPropertiesDTO.BRANCH_OPERATION_LOCKING, false);
			final var	transportSearchModuleForCargo				= cacheManip.getTransportSearchModuleForCargo(request, executive.getAccountGroupId());
			final var	isLhpvLockingAfterLsCreation				= (boolean) lsPropertyConfig.getOrDefault(LoadingSheetPropertyConstant.IS_LHPV_LOCKING_AFTER_LS_CREATION, false);
			final var	allowLsCancellationAfterLHPVCreation		= (boolean) lsPropertyConfig.getOrDefault(LoadingSheetPropertyConstant.ALLOW_LS_CANCELLATION_AFTER_LHPV_CREATION, false);
			final var	allowToSearchLsOfMappedGroups				= (boolean) searchConfiguration.getOrDefault(SearchConfigPropertiesConstant.ALLOW_TO_SEARCH_LS_OF_MAPPED_GROUPS, false);
			final var	showBothBillAndSupplementryDetails			= (boolean) searchConfiguration.getOrDefault(SearchConfigPropertiesConstant.SHOW_BOTH_BILL_AND_SUPPLEMENTRY_DETAILS, false);
			final var	isVoucherCreatedForLoadingHamaliSettlement	= (boolean) lsPropertyConfig.getOrDefault(LoadingSheetPropertyConstant.IS_VOUCHER_CREATED_FOR_LOADING_HAMALI_SETTLEMENT, false);
			final var	allowCustomMinDate 							= (boolean) displayDataConfig.getOrDefault(DisplayDataConfigurationDTO.ALLOW_CUSTOM_MIN_DATE, false);
			var			allowDynamicWhereClause						= (boolean) searchConfiguration.getOrDefault(SearchConfigPropertiesConstant.ALLOW_DYNAMIC_WHERE_CLAUSE, false);
			final var	allowLockingEditForVehicleNo				= (boolean) lhpvPropertyConfig.getOrDefault(LHPVPropertiesConstant.ALLOW_LOCKING_FOR_EDIT_VEHICLE_NO, false);
			final var	showLRDetailsOnSearchPickUpLS				= (boolean) searchConfiguration.getOrDefault(SearchConfigPropertiesConstant.SHOW_LR_DETAILS_ON_SEARCH_PICK_UP_LS, false);
			final var	customErrorOnOtherBranchDeatailSearch		= (boolean) searchConfiguration.getOrDefault(SearchConfigPropertiesConstant.CUSTOM_ERROR_ON_OTHER_BRANCH_DEATAIL_SEARCH, false);
			final var	encodeIdInUrl								= (boolean) searchConfiguration.getOrDefault(SearchConfigPropertiesConstant.ENCODE_ID_IN_URL, true);
			final var	addLrIncomeInInvoiceAmount					= (boolean) searchConfiguration.getOrDefault(SearchConfigPropertiesConstant.ADD_LR_INCOME_IN_INVOICE_AMOUNT, false);

			request.setAttribute("isDisplayBillPodUploadView", (boolean) searchConfiguration.getOrDefault(SearchConfigPropertiesConstant.IS_DISPLAY_BILL_POD_UPLOAD_VIEW, false));
			request.setAttribute("isDisplayBillPodView", (boolean) searchConfiguration.getOrDefault(SearchConfigPropertiesConstant.IS_DISPLAY_BILL_POD_VIEW, false));
			request.setAttribute("branchOperationLocking", branchOperationLocking);

			var	showAllLRForSearch	= JSPUtility.GetBoolean(request, "showAllLR", true);

			final var	subRegionWiseLimitedPermission	= request.getSession().getAttribute("subRegionWiseLimitedPermission") != null && (boolean) request.getSession().getAttribute("subRegionWiseLimitedPermission");

			if(isLhpvLockingAfterLsCreation)
				executiveIdListForLSPrintWithoutLHPVCreation = CollectionUtility.getLongListFromString((String) searchConfiguration.getOrDefault(SearchConfigPropertiesConstant.EXECUTIVE_IDS_FOR_LS_PRINT_WITHOUT_LHPV_CREATION, null));

			final var	execFldPermissions 						= cacheManip.getExecutiveFieldPermission(request);
			final var	execFunctions 						  	= cacheManip.getExecFunctions(request);

			if(execFunctions == null || execFunctions.get(BusinessFunctionConstants.TRANSPORTSEARCHWAYBILL) == null && !subRegionWiseLimitedPermission) {
				error.put("errorCode", CargoErrorList.FEILD_PERMISSIONS_NOT_FOUND);
				error.put("errorDescription", CargoErrorList.FEILD_PERMISSIONS_NOT_FOUND_DESCRIPTION);
				ActionStaticUtil.setRequestAttribute(request, "cargoError", error);
				ActionStaticUtil.setNextPageToken(request, ActionStaticUtil.FAILURE);
				return;
			}

			request.setAttribute("allowToSearchLsOfMappedGroups", allowToSearchLsOfMappedGroups);
			request.setAttribute("execPermissionBasedSearchLr", (boolean) searchConfiguration.getOrDefault(SearchConfigPropertiesConstant.EXEC_PERMISSION_BASED_SEARCH_LR, false));
			request.setAttribute("execFeildPermissionForTransportSearch", execFunctions.get(BusinessFunctionConstants.TRANSPORTSEARCHWAYBILL));

			if(execFldPermissions.get(FeildPermissionsConstant.ALLOW_TO_VIEW_OLD_DATA) == null)
				minDateTimeStamp	= cacheManip.getModuleWiseMinDateToGetData(request, executive.getAccountGroupId(),
						ModuleWiseMinDateSelectionConfigurationDTO.TRANSPORT_SEARCH_MIN_DATE_ALLOW,
						ModuleWiseMinDateSelectionConfigurationDTO.TRANSPORT_SEARCH_MIN_DATE);

			final var lrSearchMinDate	= cacheManip.getModuleWiseMinDateToGetData(request, executive.getAccountGroupId(),
					ModuleWiseMinDateSelectionConfigurationDTO.LR_SEARCH_MIN_DATE_ALLOW,
					ModuleWiseMinDateSelectionConfigurationDTO.LR_SEARCH_MIN_DATE);

			final var transpotModeMap	= cacheManip.getTransportationModeForGroup(request, executive.getAccountGroupId());

			if((boolean) searchConfiguration.getOrDefault(SearchConfigPropertiesConstant.REMAIN_BRANCH_CODE_FOR_NEXT_LR_SEARCH, false))
				if(StringUtils.contains(number, Constant.DASH))
					branchCode = number.split(Constant.DASH)[0] + Constant.DASH;
				else if(StringUtils.contains(number, Constant.FORWARD_SLASH))
					branchCode = number.split(Constant.FORWARD_SLASH)[0] + Constant.FORWARD_SLASH;

			if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN) {
				allowDynamicWhereClause = false;
				showAllLRForSearch		= true;
			}

			if(branchId > 0 && request.getParameter("searchBy") == null) {
				final var branch	= cacheManip.getGenericBranchDetailCache(request, branchId);

				if(branch != null)
					request.setAttribute("searchBy", branch.getName());
			}

			inValObj.put(AliasNameConstants.EXECUTIVE, executive);
			inValObj.put("deliveryLocationList", deliveryLocationList);
			inValObj.put("transportModeHM", cacheManip.getTransportationModeForGroup(request, executive.getAccountGroupId()));
			inValObj.put(SearchConfigPropertiesConstant.ADD_LR_INCOME_IN_INVOICE_AMOUNT, addLrIncomeInInvoiceAmount);

			if(typeOfNumber > 0)
				switch (typeOfNumber) {
				case SearchTypeConstant.SEARCH_TYPE_ID_LR -> {
					inValObj.put(AliasNameConstants.WAYBILL_NUMBER, number);
					inValObj.put(AliasNameConstants.WAYBILL_ID, id);
					inValObj.put(AliasNameConstants.ALL_BRANCHES, branchesColl);
					inValObj.put(AliasNameConstants.ALL_SUB_REGIONS, subregionObj);
					inValObj.put(AliasNameConstants.EXEC_FEILD_PERMISSIONS, execFldPermissions);
					inValObj.put("deliveryLocationList", deliveryLocationList);
					inValObj.put("allowCustomMinDate", allowCustomMinDate);
					inValObj.put("customMinDateTimeStamp", minDateTimeStamp);
					inValObj.put(ModuleWiseMinDateSelectionConfigurationDTO.LR_SEARCH_MIN_DATE, lrSearchMinDate);
					inValObj.put("showAllLRForSearch", showAllLRForSearch);

					final var	valOutObj 	= lrSearchBLL.searchAllWayBills(inValObj, displayDataConfig, searchConfiguration);

					if(valOutObj != null && valOutObj.containsKey("wayBillArray"))
						wayBillArray = (List<WayBillViewModel>) valOutObj.get("wayBillArray");

					final var	isBookingAgentDisplay = cacheManip.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_CROSSING_LR_BOOKING) == ConfigParam.CONFIG_KEY_VALUE_CROSSING_LR_BOOKING_ALLOWED;

					if(ObjectUtils.isNotEmpty(wayBillArray)) {
						if(wayBillArray.size() == 1) {
							final var	srcBranch   		= cacheManip.getGenericBranchDetailCache(request, wayBillArray.get(0).getSourceBranchId());
							final var	destBranch  		= cacheManip.getGenericBranchDetailCache(request, wayBillArray.get(0).getDestinationBranchId());

							if(subRegionWiseLimitedPermission && srcBranch.getSubRegionId() != executive.getSubRegionId() && destBranch.getSubRegionId() != executive.getSubRegionId()) {
								returnError(request, error);
								return;
							}

							if (!showDummyWayBill && wayBillArray.get(0).getDummyWayBillId() > 0) {
								returnError(request, error);

								if(transportList.contains(executive.getAccountGroupId()) || transportSearchModuleForCargo)
									request.setAttribute("nextPageToken", "success");
								else
									request.setAttribute("nextPageToken", "success_cargo");
								return;
							}

							var enwayBillIdStr = Long.toString(wayBillArray.get(0).getWayBillId());

							if (encodeIdInUrl)
								enwayBillIdStr = EncryptDecryptUtility.encrypt(enwayBillIdStr);

							if(transportList.contains(executive.getAccountGroupId()) || transportSearchModuleForCargo) {
								if(Boolean.TRUE.equals(wayBillArray.get(0).getIsTceBooking()))
									response.sendRedirect("editWaybill.do?pageId=340&eventId=13&modulename=tceLRSearchDetails&masterid=" + wayBillArray.get(0).getWayBillId() + "&id=search");
								else {
									final var	url	= encodeIdInUrl ? "editWaybill.do?pageId=3&eventId=8&enwayBillId=" + enwayBillIdStr + "&id=search" :
										"editWaybill.do?pageId=3&eventId=8&wayBillId=" + enwayBillIdStr + "&id=search";

									response.sendRedirect(branchCode != null ? url + "&branchCode=" + StringUtils.upperCase(branchCode) : url);
								}
							} else if(Boolean.TRUE.equals(wayBillArray.get(0).getIsTceBooking()))
								response.sendRedirect("editWaybill.do?pageId=340&eventId=13&modulename=tceLRSearchDetails&masterid=" + wayBillArray.get(0).getWayBillId() + "&id=search");
							else if(encodeIdInUrl)
								response.sendRedirect("editWaybill.do?pageId=2&eventId=6&enwayBillId=" + enwayBillIdStr + "&id=search");
							else
								response.sendRedirect("editWaybill.do?pageId=2&eventId=6&wayBillId=" + enwayBillIdStr + "&id=search");
						} else {
							request.setAttribute("isBookingAgentDisplay", isBookingAgentDisplay);
							request.setAttribute("wayBillModelArr", wayBillArray);

							if(transportList.contains(executive.getAccountGroupId()) || transportSearchModuleForCargo)
								request.setAttribute("nextPageToken", "success");
							else
								request.setAttribute("nextPageToken", "success_cargo");
						}
					} else {
						if(valOutObj != null && valOutObj.containsKey(Message.MESSAGE) && customErrorOnOtherBranchDeatailSearch) {
							error.put("errorCode", CargoErrorList.NO_RECORDS);
							error.put("errorDescription", "Kindly Contact Source and Destination Branch For Status");
							request.setAttribute("cargoError", error);
						} else
							returnError(request, error);

						request.setAttribute("allowDynamicWhereClause" ,allowDynamicWhereClause);

						if(transportList.contains(executive.getAccountGroupId()) || transportSearchModuleForCargo)
							request.setAttribute("nextPageToken", "success");
						else
							request.setAttribute("nextPageToken", "success_cargo");
					}
				}
				case SearchTypeConstant.SEARCH_TYPE_ID_LS -> {
					final var	tripHisabProperties		= cacheManip.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.TRIP_HISAB_SETTLEMENT);
					final var	vehicleOwneTypeList		= CollectionUtility.getShortListFromString((String) tripHisabProperties.getOrDefault(TripHisabPropertiesConstant.VEHICLE_OWNER_TYPE_IDS, "0"));
					final var	syncPropObj 			= cacheManip.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.SYNC_WITH_IV_FLEET);

					final var	tripHisabRequired		= (boolean) tripHisabProperties.getOrDefault(TripHisabPropertiesConstant.TRIP_HISAB_REQUIRED, false);
					final var	doNotShowLhpvCreationPageForRawanaEntry		= (boolean) lsPropertyConfig.getOrDefault(LoadingSheetPropertyConstant.DO_NOT_SHOW_LHPV_CREATION_PAGE_FOR_RAWANA_ENTRY, false);
					final var	isAllowLSSearchForOwnBranchOnly				= (boolean) lsPropertyConfig.getOrDefault(LoadingSheetPropertyConstant.IS_ALLOW_LS_SEARCH_FOR_OWN_BRANCH_ONLY, false);
					final var	isAllowToSearchAllBranchLS		= execFldPermissions.get(FeildPermissionsConstant.ALLOW_TO_SEARCH_ALL_BRANCH_LS) != null;
					final var	showTruckArrivedStatus			= (boolean) receiveConfiguration.getOrDefault(ReceiveConfigurationPropertiesConstant.SHOW_TRUCK_ARRIVED_STATUS, false);
					final var 	validateLSCancellationTimeLimit	= (boolean) lsPropertyConfig.getOrDefault(LoadingSheetPropertyConstant.VALIDATE_LS_CANCELLATION_TIME_LIMIT, false);
					final var 	maxHoursForEditLS				= (int) lsPropertyConfig.getOrDefault(LoadingSheetPropertyConstant.MAX_HOURS_FOR_EDIT, 0);
					final var 	appendLRInLSToGroupAdmin		= (boolean) lsPropertyConfig.getOrDefault(LoadingSheetPropertyConstant.APPEND_LR_IN_LS_TO_GROUP_ADMIN, false);
					final var 	appendCrossingLRInLS			= (boolean) lsPropertyConfig.getOrDefault(LoadingSheetPropertyConstant.APPEND_CROSSING_LR_IN_LS, false);
					final var 	showLatestLsRemark				= (boolean) searchConfiguration.getOrDefault(SearchConfigPropertiesConstant.SHOW_LATEST_LS_REMARK, false);
					final var 	validateTripSheetByStatusFromFleet			= (boolean) lsPropertyConfig.getOrDefault(LoadingSheetPropertyConstant.VALIDATE_TRIP_SHEET_BY_STATUS_FROM_FLEET, false);

					short filter	= 0;

					if(!allowToSearchLsOfMappedGroups)
						filter	= (short) (id > 0 ? 1 : 2);
					else
						filter	= (short) (id > 0 ? 3 : 4);

					if(isVoucherCreatedForLoadingHamaliSettlement) {
						final var dispatchLedgerForVoucherChecking = DispatchLedgerDao.getInstance().getDispatchDataByLsNumber(number, executive.getAccountGroupId());

						if(ObjectUtils.isNotEmpty(dispatchLedgerForVoucherChecking) && dispatchLedgerForVoucherChecking.getDispatchLedgerId() > 0) {
							final var pendingHamaliDetailsId = HamaliSettlementDaoImpl.getInstance().getPendingHamaliDetailsIdByDispatchLedgerId(dispatchLedgerForVoucherChecking.getDispatchLedgerId(), executive.getAccountGroupId());

							if(pendingHamaliDetailsId > 0) {
								final var isVoucherExists = ExpenseVoucherDetailsDaoImpl.getInstance().checkIfVoucherExistsOrNot(pendingHamaliDetailsId, executive.getAccountGroupId());

								if(!isVoucherExists)
									HamaliSettlementDaoImpl.getInstance().updateIsExpenseVoucherCreated((short) 0, dispatchLedgerForVoucherChecking.getDispatchLedgerId());
							}
						}
					}

					final var	dispatchReportArrTemp = DispatchLedgerDao.getInstance().getLSDataForSearchArr(filter, id, number, executive.getAccountGroupId(), 0);

					List<DispatchLedger>	dispatchLedgerList	= new ArrayList<>();

					if(!ObjectUtils.isEmpty(dispatchReportArrTemp))
						for(final DispatchLedger dispatchLedger : dispatchReportArrTemp)
							if(DisplayDataConfigurationBllImpl.getInstance().isDisplayData(displayDataConfig, dispatchLedger.getTripDateTime(), execFldPermissions, allowCustomMinDate, minDateTimeStamp))
								dispatchLedgerList.add(dispatchLedger);

					if(ObjectUtils.isNotEmpty(dispatchLedgerList)) {
						if(isAllowLSSearchForOwnBranchOnly && !isAllowToSearchAllBranchLS)
							dispatchLedgerList = ListFilterUtility.filterList(dispatchLedgerList, element -> executive.getBranchId() == element.getSourceBranchId()
							|| executive.getBranchId() == element.getDestinationBranchId() || deliveryLocationList != null && (deliveryLocationList.contains(element.getSourceBranchId()) || deliveryLocationList.contains(element.getDestinationBranchId())));

						if(!dispatchLedgerList.isEmpty()) {
							for(final DispatchLedger dispatchLedger : dispatchLedgerList) {
								dispatchLedger.setLSPrintAllowed(true);

								if(dispatchLedger.getLsBranchId() > 0) {
									final var	branch = cacheManip.getGenericBranchDetailCache(request,dispatchLedger.getLsBranchId());

									if(branch != null)
										dispatchLedger.setLsBranch(branch.getName());
									else
										dispatchLedger.setLsBranch("--");
								} else
									dispatchLedger.setLsBranch("--");

								if(validateTripSheetByStatusFromFleet && dispatchLedger.getTripSheetId() != null && dispatchLedger.getTripSheetId() > 0)
									dispatchLedger.setTripSheetStatus(LoadingSheetToTripSheetBllImpl.getInstance().getTripSheetStatusByTripSheetId(dispatchLedger.getTripSheetId(), syncPropObj));
								else
									dispatchLedger.setTripSheetStatus((short) 0);

								dispatchLedger.setLSBillCreated(dispatchLedger.getPendingLSPaymentBillSummaryId() != null && dispatchLedger.getPendingLSPaymentBillSummaryId() > 0);
								dispatchLedger.setDispatchExecutive(Utility.checkedNullCondition(dispatchLedger.getDispatchExecutive(), (short) 1));

								var	branch = cacheManip.getGenericBranchDetailCache(request, dispatchLedger.getSourceBranchId());
								dispatchLedger.setDispatchSourceSubRegionId(branch != null ? branch.getSubRegionId() : 0);

								branch = cacheManip.getGenericBranchDetailCache(request, dispatchLedger.getDestinationBranchId());

								dispatchLedger.setTripDateTimeForString(DateTimeUtility.getDateFromTimeStampWithAMPM(dispatchLedger.getTripDateTime()));
								dispatchLedger.setDispatchDestinationSubRegionId(branch != null ? branch.getSubRegionId() : 0);

								final var	trForGroup = transpotModeMap.get(dispatchLedger.getTransportModeMasterId());

								dispatchLedger.setTransportModeName(trForGroup != null ? trForGroup.getTransportModeName() : "--");
								dispatchLedger.setDocketNumber(Utility.checkedNullCondition(dispatchLedger.getDocketNumber(), (short) 1));
								dispatchLedger.setSourceBranch(cacheManip.getGenericBranchDetailCache(request,dispatchLedger.getSourceBranchId()).getName());
								dispatchLedger.setDestinationBranch(cacheManip.getGenericBranchDetailCache(request,dispatchLedger.getDestinationBranchId()).getName());
								dispatchLedger.setDriverName(Utility.checkedNullCondition(dispatchLedger.getDriverName(), (short) 1));
								dispatchLedger.setCleanerName(Utility.checkedNullCondition(dispatchLedger.getCleanerName(), (short) 1));
								dispatchLedger.setRemark(com.iv.dto.DispatchLedger.getLsRemark(dispatchLedger.getRemark(), showLatestLsRemark, "--"));

								if(dispatchLedger.getlHPVNumber() == null) {
									dispatchLedger.setlHPVNumber("--");
									dispatchLedger.setBlhpvNumber("--");
									dispatchLedger.setBlhpvBranchName("--");
								} else {
									final var	lhpv = LHPVDao.getInstance().getLHPVDetailsWithCancel(dispatchLedger.getLhpvId());

									if(lhpv.getBlhpvId() > 0) {
										branch = cacheManip.getGenericBranchDetailCache(request, lhpv.getbLHPVBranchId());
										subRegion = (SubRegion) subregionObj.get(branch.getSubRegionId());

										dispatchLedger.setBlhpvId(lhpv.getBlhpvId());
										dispatchLedger.setBlhpvNumber(lhpv.getbLHPVNumber());
										dispatchLedger.setBlhpvBranchId(lhpv.getbLHPVBranchId());
										dispatchLedger.setBlhpvBranchName(branch.getName());
										dispatchLedger.setBlhpvSubRegionId(branch.getSubRegionId());
										dispatchLedger.setBlhpvSubRegionName(subRegion.getName());
									} else {
										dispatchLedger.setBlhpvNumber("--");
										dispatchLedger.setBlhpvBranchName("--");
									}
								}

								VehicleNumberMaster vehicleNumberMaster = null;

								if(dispatchLedger.getVehicleNumberMasterId() > 0)
									vehicleNumberMaster = cacheManip.getVehicleNumber(request, dispatchLedger.getAccountGroupId(), dispatchLedger.getVehicleNumberMasterId());

								if(isLhpvLockingAfterLsCreation && dispatchLedger.getLhpvId() <= 0 && dispatchLedger.getTypeOfLS() == DispatchLedgerConstant.TYPE_OF_LS_ID_NORMAL) {
									dispatchLedger.setLhpvNotCreated(!executiveIdListForLSPrintWithoutLHPVCreation.contains(executive.getExecutiveId()));

									if(tripHisabRequired && doNotShowLhpvCreationPageForRawanaEntry && !vehicleOwneTypeList.isEmpty() && vehicleNumberMaster != null)
										dispatchLedger.setLhpvNotCreated(!vehicleOwneTypeList.contains(vehicleNumberMaster.getVehicleOwner()));
								}

								final var	receivedLedger		= ReceivedLedgerDao.getInstance().getReceivedLedgerId(dispatchLedger.getDispatchLedgerId());
								final List<DispatchSummary>	dispatchSummaryList	= DispatchSummaryDao.getInstance().getDispatchSumaryReceivedStatus(dispatchLedger.getDispatchLedgerId());

								dispatchLedger.setAllowEditLSDestination(isAllowToEditLSDestination(dispatchLedger, lsPropertyConfig, execFldPermissions, executive));

								dispatchLedger.setEditVehicleType(execFldPermissions.get(FeildPermissionsConstant.EDIT_LS_VEHICLE_TYPE) != null && dispatchLedger.getStatus() != DispatchLedgerConstant.DISPATCHLEDGER_WAYBILL_STATUS_CANCELLED);

								final var	lsBranch	= cacheManip.getBranchById(request, executive.getAccountGroupId(), dispatchLedger.getLsBranchId());
								dispatchLedger.setEditManualLSNumber(isAllowToEditManualLSNumber(dispatchLedger, lsBranch, execFldPermissions, executive));

								if(ObjectUtils.isNotEmpty(dispatchSummaryList)) {
									final long lrReceivedCount	= dispatchSummaryList.stream().filter(e -> e.getReceivedSummaryStatus() == WayBillStatusConstant.WAYBILL_STATUS_RECEIVED).collect(Collectors.counting());

									if(lrReceivedCount > 0 && lrReceivedCount != dispatchSummaryList.size())
										dispatchLedger.setStatus(DispatchLedger.DISPATCHLEDGER_WAYBILL_STATUS_PARTIAL_RECEIVED);

									dispatchLedger.setAnyLrReceived(lrReceivedCount > 0);
								}

								if(receivedLedger != null) {
									branch		= cacheManip.getGenericBranchDetailCache(request, receivedLedger.getTurBranchId());
									subRegion 	= (SubRegion) subregionObj.get(branch.getSubRegionId());

									dispatchLedger.setReceivedLedgerId(receivedLedger.getReceivedLedgerId());
									dispatchLedger.setTurNumber(receivedLedger.getTurNumber());
									dispatchLedger.setTurBranchId(receivedLedger.getTurBranchId());
									dispatchLedger.setTurBranchName(branch.getName());
									dispatchLedger.setTurSubRegionId(branch.getSubRegionId());
									dispatchLedger.setTurSubRegionName(subRegion.getName());
								} else {
									dispatchLedger.setTurNumber("--");
									dispatchLedger.setTurBranchName("--");
								}

								dispatchLedger.setTruckArrivalNumber(Utility.checkedNullCondition(dispatchLedger.getTruckArrivalNumber(), (short) 1));

								if(dispatchLedger.getCrossingAgentId() > 0) {
									final var	crossingAgentBillSummary = CrossingAgentBillSummaryDAO.getInstance().getCrossingAgentBillByLSNumber(dispatchLedger.getDispatchLedgerId());

									if(crossingAgentBillSummary != null) {
										final var	crossingAgentBill = CrossingAgentBillDaoImpl.getInstance().getCrossingAgentBillDetailsForPrintingBill(crossingAgentBillSummary.getCrossingAgentBillId());

										branch = cacheManip.getGenericBranchDetailCache(request,crossingAgentBill.getBranchId());
										subRegion = (SubRegion) subregionObj.get(branch.getSubRegionId());

										crossingAgentBillSummary.setBranchId(branch.getBranchId());
										crossingAgentBillSummary.setBranchName(branch.getName());
										crossingAgentBillSummary.setSubRegionId(branch.getSubRegionId());
										crossingAgentBillSummary.setSubRegionName(subRegion.getName());
										crossingAgentBillSummary.setStatus(crossingAgentBill.getStatus());
										dispatchLedger.setConsignmSumm(crossingAgentBillSummary);
									}

									dispatchLedger.setDeliveryRunsheet(DispatchBLL.getInstance().createModelForPrint(dispatchLedger.getDispatchLedgerId(),(short)0));
								}

								dispatchLedger.setFunctionAlowed(com.iv.utils.Utility.isFunctionAllowed(dispatchLedger.getTripDateTime(), noOfDays));

								dispatchLedger.setEditVehicleNumber((!allowToSearchLsOfMappedGroups || executive.getAccountGroupId() == dispatchLedger.getAccountGroupId()) && isAllowToEditVehicleNumber(dispatchLedger, lsPropertyConfig, allowLockingEditForVehicleNo, executive));

								dispatchLedger.setVehicleNumber(Utility.checkedNullCondition(dispatchLedger.getVehicleNumber(), (short) 1));
								dispatchLedger.setDeliveryRunSheet(dispatchLedger.getDeliveryRunsheet() != null);
								dispatchLedger.setEditVehicleAgentName(execFldPermissions.get(FeildPermissionsConstant.EDIT_LS_VEHICLE_AGENT_NAME) != null && (dispatchLedger.getVehicleAgentId() > 0 || dispatchLedger.getVehicleAgentName() != null) && dispatchLedger.getBlhpvId() <= 0);
								dispatchLedger.setVehicleAgentName(dispatchLedger.getVehicleAgentName() != null ? dispatchLedger.getVehicleAgentName() : "");
								dispatchLedger.setDriver1MobileNumber1(dispatchLedger.getDriver1MobileNumber1() != null ? dispatchLedger.getDriver1MobileNumber1() : "--");
								// logic to show LS cancellation Button (start)  - By Manoj Deriya
								/*
								 * Permission should given
								 * LS Creation branch should be same as login branch
								 * Loading Hamali Should not be configure
								 * LHPV Should not be created
								 * LS Should not be received
								 * LS Should not be cancelled
								 * All Quantity should be dispatched
								 */
								if(execFldPermissions.get(FeildPermissionsConstant.LS_CANCELLATION) != null && dispatchLedger.getSourceBranchId() == executive.getBranchId()) {
									final var	loadingHamali = VehicleConfigHamaliDaoImpl.getInstance().isVehicleConfigHamaliByDispatchLedgerId(dispatchLedger.getDispatchLedgerId());

									if(!loadingHamali && (dispatchLedger.getLhpvId() <= 0 && !allowLsCancellationAfterLHPVCreation || allowLsCancellationAfterLHPVCreation))
										checkStatusWiseLSCancellation(dispatchLedger);
								}

								if(validateLSCancellationTimeLimit && executive.getExecutiveType() != ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN){
									final var hoursObj = DateTimeUtility.getDayDiffBetweenTwoDatesInHoursAndMinutes(dispatchLedger.getTripDateTime(), DateTimeUtility.getCurrentTimeStamp());
									final var dayDiff  = hoursObj.getLong("diffHours", 0);

									dispatchLedger.setLSCancelAfterTimeLimit(maxHoursForEditLS <= dayDiff);
									dispatchLedger.setMaxHoursForEditLS(maxHoursForEditLS);
								}

								if(dispatchLedger.getTruckArrivalDetailId() > 0 && showTruckArrivedStatus)
									dispatchLedger.setStatusForUser(DispatchLedgerConstant.TRUCK_ARRIVED);
								else
									dispatchLedger.setStatusForUser(DispatchLedgerConstant.getDispatchStatusString(dispatchLedger.getStatus()));

								dispatchLedger.setCancelLSOfRawanaVoucher(!tripHisabRequired || cancelLSOfRawanaVoucher(dispatchLedger.getDispatchLedgerId()));

								if(allowLockingEditForVehicleNo && dispatchLedger.getLhpvId() > 0) {
									final var lsIds 		= LHPVDao.getInstance().getLSOfLHPVByLHPVId(dispatchLedger.getLhpvId(), executive.getAccountGroupId());
									final var lsIdsList 	= CollectionUtility.getLongListFromString(lsIds);

									if (lsIdsList.size() > 1)
										dispatchLedger.setEditVehicleNumber(false);
								}

								if(!allowToSearchLsOfMappedGroups || executive.getAccountGroupId() == dispatchLedger.getAccountGroupId()) {
									final var crossingAgentBillSummary = dispatchLedger.getConsignmSumm();

									dispatchLedger.setAllowEditLsData(execFldPermissions.get(FeildPermissionsConstant.EDIT_LS) != null
											&& !dispatchLedger.isLSBillCreated()
											&& dispatchLedger.isAllowEditLsData()
											&& dispatchLedger.getStatus() != DispatchLedgerConstant.DISPATCHLEDGER_WAYBILL_STATUS_RECEIVED
											&& dispatchLedger.getStatus() != DispatchLedgerConstant.DISPATCHLEDGER_WAYBILL_STATUS_CANCELLED
											&& (crossingAgentBillSummary == null || crossingAgentBillSummary.getStatus() == PaymentTypeConstant.PAYMENT_TYPE_STATUS_CANCELLED_ID)
											&& dispatchLedger.getBlhpvId() == 0);
								}

								dispatchLedger.setAllowAppendLrInLs(execFldPermissions.get(FeildPermissionsConstant.APPEND_LR_IN_LS) != null
										&& dispatchLedger.isAllowAppendLrInLs()
										&& dispatchLedger.getStatus() != DispatchLedgerConstant.DISPATCHLEDGER_WAYBILL_STATUS_CANCELLED
										&& (dispatchLedger.getStatus() != DispatchLedgerConstant.DISPATCHLEDGER_WAYBILL_STATUS_RECEIVED || appendCrossingLRInLS && dispatchLedger.isCrossing())
										&& (appendLRInLSToGroupAdmin && executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN || dispatchLedger.getLsBranchId() == executive.getBranchId()));

								dispatchLedger.setAllowEditLSDestination(dispatchLedger.isAllowEditLSDestination() && (!allowToSearchLsOfMappedGroups || executive.getAccountGroupId() == dispatchLedger.getAccountGroupId()) && !dispatchLedger.isLSBillCreated());

								if((boolean) lsPropertyConfig.getOrDefault(LoadingSheetPropertyConstant.IS_LS_WISE_AGENT_BRANCH_HISAB_NEEDED, false) && AgentHisabDispatchSummaryDaoImpl.getInstance().getAgentHisabDispatchSummaryDetails("ahds.DispatchLedgerId = " + dispatchLedger.getDispatchLedgerId())
										|| (boolean) lsPropertyConfig.getOrDefault(LoadingSheetPropertyConstant.AGENT_BRANCH_HISAB_NEEDED, false) && PendingHisabByAgentBranchDaoImpl.getInstance().isPendingHisabByAgentBranchByDispatchLedgerId(dispatchLedger.getDispatchLedgerId())) {
									dispatchLedger.setAllowEditLSDestination(false);
									dispatchLedger.setLSCancelAllow(false);
									dispatchLedger.setAllowEditLsData(false);
									dispatchLedger.setAllowAppendLrInLs(false);
								}
							}

							request.setAttribute("isEditLSAllow", ListFilterUtility.isAnyMatchInList(dispatchLedgerList, DispatchLedger::isAllowEditLsData));
							request.setAttribute("isAllowAppendLrInLs", ListFilterUtility.isAnyMatchInList(dispatchLedgerList, DispatchLedger::isAllowAppendLrInLs));
							request.setAttribute("isAllowEditLSDestination", ListFilterUtility.isAnyMatchInList(dispatchLedgerList, DispatchLedger::isAllowEditLSDestination));
							request.setAttribute("isEditVehicleType", ListFilterUtility.isAnyMatchInList(dispatchLedgerList, DispatchLedger::isEditVehicleType));
							request.setAttribute("isEditManualLSNumber", ListFilterUtility.isAnyMatchInList(dispatchLedgerList, DispatchLedger::isEditManualLSNumber));
							request.setAttribute("isEditVehicleNumber", ListFilterUtility.isAnyMatchInList(dispatchLedgerList, DispatchLedger::isEditVehicleNumber));
							request.setAttribute("dispatchReportArr", SortUtils.sortListDesc(dispatchLedgerList, DispatchLedger::getTripDateTime));
							request.setAttribute(LoadingSheetPropertyConstant.NEW_SCREEN_FOR_APPEND_LR_IN_LS, lsPropertyConfig.getOrDefault(LoadingSheetPropertyConstant.NEW_SCREEN_FOR_APPEND_LR_IN_LS, false));
							request.setAttribute(LoadingSheetPropertyConstant.ALLOW_LS_CANCELLATION_AFTER_LHPV_CREATION, lsPropertyConfig.getOrDefault(LoadingSheetPropertyConstant.ALLOW_LS_CANCELLATION_AFTER_LHPV_CREATION, false));
							request.setAttribute(LoadingSheetPropertyConstant.ALLOW_TO_GENERATE_CONSOLIDATE_EWAYBILL, lsPropertyConfig.getOrDefault(LoadingSheetPropertyConstant.ALLOW_TO_GENERATE_CONSOLIDATE_EWAYBILL, false));
						} else if(customErrorOnOtherBranchDeatailSearch) {
							error.put("errorCode", CargoErrorList.NO_RECORDS);
							error.put("errorDescription", "Kindly Contact Source and Destination Branch For Status");
							request.setAttribute("cargoError", error);
						} else
							returnError(request, error);
					} else
						returnError(request, error);
				}
				case SearchTypeConstant.SEARCH_TYPE_ID_LHPV -> {
					final var	execFeildPermissionForEditManualLHPVNumber  = execFldPermissions.get(FeildPermissionsConstant.EDIT_MANUAL_LHPV_NUMBER);
					final var	isAllowLHPVSearchForOwnBranchOnly	= (boolean) lhpvPropertyConfig.getOrDefault(LHPVPropertiesConstant.IS_ALLOW_LHPV_SEARCH_FOR_OWN_BRANCH_ONLY, false);
					final var	isAllowToSearchAllBranchLHPV		= execFldPermissions.get(FeildPermissionsConstant.ALLOW_TO_SEARCH_ALL_BRANCH_LHPV) != null;
					final var 	validateLHPVCancellationTimeLimit	= (boolean) lhpvPropertyConfig.getOrDefault(LHPVPropertiesConstant.VALIDATE_LHPV_CANCELLATION_TIME_LIMIT, false);
					final var 	maxHoursForEditLHPV					= (int) lhpvPropertyConfig.getOrDefault(LHPVPropertiesConstant.MAX_HOURS_FOR_EDIT, 0);
					final var	restrictLHPVPrintToOwnBranchWithDateRange = (boolean) searchConfiguration.getOrDefault(SearchConfigPropertiesConstant.RESTRICT_LHPV_PRINT_TO_OWNBRANCH_WITH_DATE_RANGE, false);
					final var	lhpvPrintDaysRangeLimit		= (int) searchConfiguration.getOrDefault(SearchConfigPropertiesConstant.LHPV_PRINT_DAYS_RANGE_LIMIT, 0);
					final var	lhpvPrintPermission			= execFldPermissions.get(FeildPermissionsConstant.LHPV_PRINT_PERMISSION) != null;

					if(id > 0)
						lhpvArrTemp = LHPVDao.getInstance().getLHPVDetailsForSearchArr((short) 1, id, "", executive.getAccountGroupId());
					else
						lhpvArrTemp = LHPVDao.getInstance().getLHPVDetailsForSearchArr((short) 2, 0, number, executive.getAccountGroupId());

					List<LHPV>	newLhpvArrTemp	= new ArrayList<>();

					if(ObjectUtils.isNotEmpty(lhpvArrTemp))
						for(final LHPV lhpv2 : lhpvArrTemp)
							if(DisplayDataConfigurationBllImpl.getInstance().isDisplayData(displayDataConfig, lhpv2.getCreationDateTimeStamp(), execFldPermissions, allowCustomMinDate, minDateTimeStamp))
								newLhpvArrTemp.add(lhpv2);

					if(ObjectUtils.isNotEmpty(newLhpvArrTemp)) {
						if(isAllowLHPVSearchForOwnBranchOnly && !isAllowToSearchAllBranchLHPV)
							newLhpvArrTemp = ListFilterUtility.filterList(newLhpvArrTemp, element -> executive.getBranchId() == element.getlHPVBranchId() || executive.getBranchId() == element.getBalancePayableAtBranchId()
							|| executive.getBranchId() == element.getbLHPVBranchId() || deliveryLocationList != null && (deliveryLocationList.contains(element.getlHPVBranchId()) || deliveryLocationList.contains(element.getBalancePayableAtBranchId()) || deliveryLocationList.contains(element.getbLHPVBranchId())));

						if(ObjectUtils.isNotEmpty(newLhpvArrTemp)) {
							final Map<Long, Set<String>> ddmList	= newLhpvArrTemp.stream().filter(e -> e.getDdmNumber() != null)
									.collect(Collectors.groupingBy(LHPV::getLhpvId, Collectors.mapping(LHPV::getDdmNumber, Collectors.toSet())));

							final var	lhpvModelHm	= newLhpvArrTemp.stream().collect(Collectors.toMap(LHPV::getLhpvId, Function.identity(), (e1, e2) -> e1));

							newLhpvArrTemp.clear();
							newLhpvArrTemp.addAll(lhpvModelHm.values());

							final var	lhpvIds 		= newLhpvArrTemp.stream().map(e -> String.valueOf(e.getLhpvId())).collect(Collectors.joining(Constant.COMMA));

							final var	lhpvObjectVal = LhpvSettlementChargesDao.getInstance().getSetlementChargesByBlhpvIds(lhpvIds, LhpvChargesForGroup.IDENTIFIER_TYPE_LHPV);

							if(lhpvObjectVal != null)
								chargesCollMainHshmp  = (HashMap<Long, HashMap<Long, Double>>) lhpvObjectVal.get("chargesCollMainHshmp");

							for (final LHPV element : newLhpvArrTemp) {
								var	branch	= (Branch) branchesColl.get(Long.toString(element.getBranchId()));
								element.setBranch(branch.getName());
								element.setSubRegionId(branch.getSubRegionId());
								element.setRegionId(branch.getRegionId());

								if(element.getBlhpvId() == 0)
									element.setbLHPVNumber("--");

								if(element.getbLHPVBranchId() > 0) {
									branch 		= (Branch) branchesColl.get(Long.toString(element.getbLHPVBranchId()));
									subRegion 	= (SubRegion) subregionObj.get(branch.getSubRegionId());
									element.setbLHPVSubRegionId(branch.getSubRegionId());
									element.setbLHPVBranchName(branch.getName());
									element.setbLHPVSubRegionName(subRegion.getName());
								} else {
									element.setbLHPVBranchName("--");
									element.setbLHPVSubRegionName("--");
								}

								if(element.getExecutiveId() > 0)
									element.setExecutiveName(ExecutiveDao.getInstance().getExecutiveDetailsByExecutiveIds(Long.toString(element.getExecutiveId())).get(element.getExecutiveId()).getName());
								else
									element.setExecutiveName("--");

								if(element.getVehicleNumberMasterId() > 0)
									element.setVehicleNumber(cacheManip.getVehicleNumber(request, executive.getAccountGroupId(), element.getVehicleNumberMasterId()).getVehicleNumber());
								else
									element.setVehicleNumber("--");

								element.setDriverName(Utility.checkedNullCondition(element.getDriverName(), (short) 1));
								element.setStatusName(LHPV.getLHPVStatus(element.getStatus()));

								element.setFunctionAllowed(com.iv.utils.Utility.isFunctionAllowed(element.getCreationDateTimeStamp(), noOfDays));

								element.setEditManualLHPVNumber(execFeildPermissionForEditManualLHPVNumber != null && element.isManual() && element.getBlhpvId() <= 0
										&& element.getStatus() == LHPVConstant.STATUS_BOOKED
										&& (executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN
										|| element.getRegionId() == executive.getRegionId() && executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_REGIONADMIN
										|| element.getSubRegionId() == executive.getSubRegionId() && executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_SUBREGIONADMIN
										|| executive.getBranchId() == element.getlHPVBranchId()));

								element.setLhpvCreationDateTimeString(DateTimeUtility.getDateFromTimeStampWithAMPM(element.getCreationDateTimeStamp()));

								var	isAllowedToCancelLHPV	= true;

								if(chargesCollMainHshmp != null && chargesCollMainHshmp.get(element.getLhpvId()) != null) {
									final Map<Long, Double>	chargesHM	= chargesCollMainHshmp.get(element.getLhpvId());

									element.setTotalAmount(chargesHM.getOrDefault((long) LHPVChargeTypeConstant.LORRY_HIRE, 0D));
									element.setBalanceAmount(chargesHM.getOrDefault((long) LHPVChargeTypeConstant.BALANCE_AMOUNT, 0D));
									element.setAdvanceAmount(chargesHM.getOrDefault((long) LHPVChargeTypeConstant.ADVANCE_AMOUNT, 0D));
									element.setAdditionalTruckAdvance(chargesHM.getOrDefault((long) LHPVChargeTypeConstant.ADDITIONAL_TRUCK_ADVANCE, 0D));
								} else {
									element.setTotalAmount(0.00);
									element.setBalanceAmount(0.00);
									element.setAdvanceAmount(0.00);
									element.setAdditionalTruckAdvance(0.00);
								}

								if(execFldPermissions.get(FeildPermissionsConstant.ALLOW_UNBLOCK_LHPV) != null && executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN)
									element.setAllowedUnblockLhpv(LHPVDao.getInstance().isAllowedUnblockLHPVForBlhpv(element.getLhpvId()));

								if((boolean) lhpvPropertyConfig.getOrDefault(LHPVPropertiesConstant.LORRY_HIRE_CHECKING_FOR_LHPV_CANCELLATION, false))
									isAllowedToCancelLHPV = LorryHireDao.getInstance().isLHPVAllowedToCancel(element.getLhpvId());

								element.setLHPVCancellationAllow(element.getBlhpvId() == 0 && element.getStatus() == LHPVConstant.STATUS_BOOKED && element.getAdvanceSettlementStatus() <= LHPVConstant.LHPV_ADVANCE_SETTLEMENT_STATUS_DUE
										&& (execFldPermissions.get(FeildPermissionsConstant.LHPV_CANCELLATION) != null && element.getlHPVBranchId() == executive.getBranchId()
										|| execFldPermissions.get(FeildPermissionsConstant.CENTRALIZED_LHPV_CANCELLATION) != null)
										&& isAllowedToCancelLHPV && element.getLhpvAdditionalAdvanceSettlementStatus() <= LHPVConstant.LHPV_ADVANCE_SETTLEMENT_STATUS_DUE);

								if(allowLsCancellationAfterLHPVCreation)
									element.setLHPVCancellationAllow(false);

								element.setEditLhpvVehicleAgent(execFldPermissions.get(FeildPermissionsConstant.EDIT_LHPV_VEHICLE_AGENT) != null && element.getBlhpvId() == 0
										&& element.getStatus() != LHPVConstant.STATUS_CANCELLED
										&& (executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN
										|| element.getRegionId() == executive.getRegionId() && executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_REGIONADMIN
										|| element.getSubRegionId() == executive.getSubRegionId() && executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_SUBREGIONADMIN
										|| executive.getBranchId() == element.getlHPVBranchId()));

								element.setEditLhpvDestinationAllow(execFldPermissions.get(FeildPermissionsConstant.LHPV_EDITDATA) != null && element.getBlhpvId() == 0 && element.getStatus() == LHPV.STATUS_BOOKED
										&& (element.getlHPVBranchId() == executive.getBranchId() || executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN)
										&& element.isFunctionAllowed() && (boolean) lhpvPropertyConfig.getOrDefault(LHPVPropertiesConstant.EDIT_LHPV_OTHER_PARAMETER, false));

								if(ddmList.containsKey(element.getLhpvId()))
									element.setDdmNumberstr(CollectionUtility.getStringFromStringSet(ddmList.get(element.getLhpvId())));
								else
									element.setDdmNumberstr("");

								if(validateLHPVCancellationTimeLimit && executive.getExecutiveType() != ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN) {
									final var hoursObj	= DateTimeUtility.getDayDiffBetweenTwoDatesInHoursAndMinutes(element.getCreationDateTimeStamp(), DateTimeUtility.getCurrentTimeStamp());
									final var dayDiff	= hoursObj.getLong("diffHours", 0);

									element.setLHPVCancelAfterTimeLimit(maxHoursForEditLHPV <= dayDiff);
									element.setMaxHoursForEditLHPV(maxHoursForEditLHPV);
								}

								if((boolean) lhpvPropertyConfig.getOrDefault(LHPVPropertiesConstant.IS_LHPV_WISE_AGENT_BRANCH_HISAB_NEEDED, false) && AgentHisabLhpvSummaryDaoImpl.getInstance().getHisabDetailsForAgentBranchByLhpvId(element.getLhpvId())) {
									element.setEditLhpvDestinationAllow(false);
									element.setLHPVCancellationAllow(false);
									element.setEditLhpvAmountAllow(false);
								}

								if(restrictLHPVPrintToOwnBranchWithDateRange)
									element.setLHPVPrintAllow(isPrintAllow(element.getCreationDateTimeStamp(), lhpvPrintDaysRangeLimit, executive, branch, lhpvPrintPermission));
							}

							request.setAttribute("lhpv", SortUtils.sortListDesc(newLhpvArrTemp, LHPV::getCreationDateTimeStamp));
						} else if(customErrorOnOtherBranchDeatailSearch) {
							error.put("errorCode", CargoErrorList.NO_RECORDS);
							error.put("errorDescription", "Kindly Contact Balance Payable Branch for status");
							request.setAttribute("cargoError", error);
						} else
							returnError(request, error);
					} else
						returnError(request, error);
				}
				case SearchTypeConstant.SEARCH_TYPE_ID_TUR -> {
					List<ReceivedLedger>	receivedLedgerList	= null;

					if(id > 0) {
						final var	receivedLedger 		= ReceivedLedgerDao.getInstance().getReceivedLedgerDetails((short) 0, id, "", branchId);

						if(receivedLedger != null) {
							receivedLedgerList	= new ArrayList<>();
							receivedLedgerList.add(receivedLedger);
						}
					} else
						receivedLedgerList	= ReceivedLedgerDao.getInstance().getReceivedLedgerDetailsList((short) 1, 0, number, branchId);

					final var isTURReprintAllowed = (boolean) searchConfiguration.getOrDefault(SearchConfigPropertiesConstant.IS_TUR_REPRINT_ALLOWED, false);
					final var restrictTurPrintToOwnBranchWithDateRange = (boolean) searchConfiguration.getOrDefault(SearchConfigPropertiesConstant.RESTRICT_TURPRINT_TO_OWNBRANCH_WITH_DATE_RANGE, false);
					final var turPrintDaysRangeLimit = (int) searchConfiguration.getOrDefault(SearchConfigPropertiesConstant.TUR_PRINT_DAYS_RANGE_LIMIT, 0);
					final var	turPrintPermission		= execFldPermissions.get(FeildPermissionsConstant.TUR_PRINT_PERMISSION) != null;

					request.setAttribute(ReceiveConfigurationPropertiesConstant.RECEIVE_CONFIGUARTION, receiveConfiguration);

					if (receivedLedgerList != null && !receivedLedgerList.isEmpty()) {
						receivedLedgerList = SortUtils.sortListDesc(receivedLedgerList, ReceivedLedger::getReceivedLedgerDateTime);

						for (final ReceivedLedger receivedLedger : receivedLedgerList) {
							if(!DisplayDataConfigurationBllImpl.getInstance().isDisplayData(displayDataConfig, receivedLedger.getReceivedLedgerDateTime(), execFldPermissions, allowCustomMinDate, minDateTimeStamp)) {
								receivedLedgerList.remove(receivedLedger);
								continue;
							}

							final var	branch	= (Branch) branchesColl.get(Long.toString(receivedLedger.getTurBranchId()));

							if(isTURReprintAllowed)
								receivedLedger.setTurPrintAllow(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN);
							else if(restrictTurPrintToOwnBranchWithDateRange)
								receivedLedger.setTurPrintAllow(isPrintAllow(receivedLedger.getReceivedLedgerDateTime(), turPrintDaysRangeLimit, executive, branch, turPrintPermission));

							receivedLedger.setSourceBranch(cacheManip.getGenericBranchDetailCache(request, receivedLedger.getSourceBranchId()).getName());
							receivedLedger.setReceivedLedgerDateTimeStr(DateTimeUtility.getDateFromTimeStampWithAMPM(receivedLedger.getReceivedLedgerDateTime()));
							receivedLedger.setTripDateStr(DateTimeUtility.getDateFromTimeStampWithAMPM(receivedLedger.getTripDateTime()));
							receivedLedger.setUnloadedByHamal(Utility.checkedNullCondition(receivedLedger.getUnloadedByHamal(), (short) 1));
							receivedLedger.setVehicleNumber(Utility.checkedNullCondition(receivedLedger.getVehicleNumber(), (short) 1));

							if (receivedLedger.getDestinationBranchId() > 0)
								receivedLedger.setDestinationBranch(cacheManip.getGenericBranchDetailCache(request, receivedLedger.getDestinationBranchId()).getName());
							else
								receivedLedger.setDestinationBranch("--");
						}

						if(!receivedLedgerList.isEmpty()) {
							if(!(boolean) searchConfiguration.getOrDefault(SearchConfigPropertiesConstant.IS_MULTIPLE_TUR_RECORDS_ALLOWED, false)) {
								final var receivedLedger	= receivedLedgerList.get(0);

								receivedLedgerList.clear();
								receivedLedgerList.add(receivedLedger);
							}

							request.setAttribute("receivedLedgerList", receivedLedgerList);
						} else
							returnError(request, error);
					} else
						returnError(request, error);
				}
				case SearchTypeConstant.SEARCH_TYPE_ID_CR -> {
					count = 0;

					List<DeliveryContactDetails> deliveryContactDetailsArr = null;

					if(id > 0)
						deliveryContactDetailsArr = DeliveryContactDetailsDao.getInstance().getWayBillDeliveryNumberDetails((short)0,id,"",executive.getAccountGroupId(),branchId);
					else if(StringUtils.isNotEmpty(number))
						deliveryContactDetailsArr = DeliveryContactDetailsDao.getInstance().getWayBillDeliveryNumberDetails((short)1,0,number,executive.getAccountGroupId(),branchId);
					else
						returnError(request, error);

					if(ObjectUtils.isNotEmpty(deliveryContactDetailsArr)) {
						final var	wayBillIds				  = deliveryContactDetailsArr.stream().map(e -> Long.toString(e.getWayBillId())).collect(Collectors.joining(Constant.COMMA));
						final var	wayBillDetailsModelHM     = WayBillDao.getInstance().getLimitedWayBillDataByBillIds(wayBillIds);

						final var	lrViewConfiguration			= cacheManip.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.LR_SEARCH);

						for (final DeliveryContactDetails aDeliveryContactDetailsArr : deliveryContactDetailsArr) {
							inValObj.put("accountGroupId", executive.getAccountGroupId());

							final var	outValObj = lrSearchBLL.findByWayBillNoForSearch(executive.getAccountGroupId(), aDeliveryContactDetailsArr.getWayBillNumber());

							if(aDeliveryContactDetailsArr.getStatus() == DeliveryStatusConstant.CR_STATUS_BOOKED) {
								final var	waybillModel =	wayBillDetailsModelHM.get(aDeliveryContactDetailsArr.getWayBillId());

								if(waybillModel != null)
									if(waybillModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY)
										aDeliveryContactDetailsArr.setCancelledCRAmount(waybillModel.getGrandTotal());
									else
										aDeliveryContactDetailsArr.setCancelledCRAmount(waybillModel.getDeliveryTotal());
							}

							if(outValObj != null && outValObj.get("wayBillModel") != null) {
								final var	wayBillModel				= (WayBillModel) outValObj.get("wayBillModel");
								final var	configValue 				= cacheManip.getConfigValue(request ,executive.getAccountGroupId() ,ConfigParam.CONFIG_KEY_DELIVERY_ACCESSIBILITY);
								final var	wayBillViewList				= populateWayBillViewModel(request ,wayBillModel.getWayBill() ,cacheManip ,wayBillModel.getNoOfArticle());

								var flag = true;

								if((wayBillViewList.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_RECEIVED
										|| wayBillViewList.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CANCELLED_DELIVERY
										|| wayBillViewList.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DUEDELIVERED
										|| wayBillViewList.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DUEUNDELIVERED
										|| wayBillViewList.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CREDIT_DELIVERED)
										&& WayBillAccessibility.checkWayBillAccessibility(wayBillModel.getWayBill(), executive, configValue, branchesColl, deliveryLocationList, lrViewConfiguration))
									flag = false;

								aDeliveryContactDetailsArr.setFlag(flag);
								aDeliveryContactDetailsArr.setWayBillViewList(wayBillViewList);
								aDeliveryContactDetailsArr.setIsDisplayData(DisplayDataConfigurationBllImpl.getInstance().isDisplayData(displayDataConfig, aDeliveryContactDetailsArr.getDeliveryDateTime(), execFldPermissions, allowCustomMinDate, minDateTimeStamp));
							}

							aDeliveryContactDetailsArr.setDeliveryDateTimeStr(DateTimeUtility.getDateFromTimeStampWithAMPM(aDeliveryContactDetailsArr.getDeliveryDateTime()));
							aDeliveryContactDetailsArr.setCancellationDateStr(DateTimeUtility.getDateFromTimeStampWithAMPM(aDeliveryContactDetailsArr.getCancellationDate()));
							aDeliveryContactDetailsArr.setCRByBranch(cacheManip.getGenericBranchDetailCache(request, aDeliveryContactDetailsArr.getBranchId()).getName());
						}

						deliveryContactDetailsArr	= ListFilterUtility.filterList(deliveryContactDetailsArr, DeliveryContactDetails::getIsDisplayData);

						if(ObjectUtils.isNotEmpty(deliveryContactDetailsArr)) {
							if(deliveryContactDetailsArr.size() == 1 && (!deliveryContactDetailsArr.get(0).isMultiple() || (boolean) searchConfiguration.getOrDefault(SearchConfigPropertiesConstant.UPDATE_DELIVERY_PAYMENT_MODE_FOR_MULTIPLE_LR, false))){
								for (final DeliveryContactDetails element : deliveryContactDetailsArr)
									if(transportList.contains(executive.getAccountGroupId()) || transportSearchModuleForCargo) {
										if(element.getIsTceBooking() != null && Boolean.TRUE.equals(element.getIsTceBooking()))
											response.sendRedirect("editWaybill.do?pageId=340&eventId=13&modulename=tceLRSearchDetails&masterid=" + element.getWayBillId() + "&id=search");
										else if(element.getStatus() == DeliveryStatusConstant.CR_STATUS_BOOKED)
											response.sendRedirect("editWaybill.do?pageId=3&eventId=8&wayBillId="+ element.getWayBillViewList().getWayBillId() + "&flag=" + element.isFlag() + "&id=search"+ "&showEditDeliveryPaymentLink=true");
										else
											response.sendRedirect("editWaybill.do?pageId=3&eventId=8&wayBillId="+ element.getWayBillViewList().getWayBillId() + "&flag=" + element.isFlag() + "&id=search"+ "&showEditDeliveryPaymentLink=false");
									} else if(element.getIsTceBooking() != null && Boolean.TRUE.equals(element.getIsTceBooking()))
										response.sendRedirect("editWaybill.do?pageId=340&eventId=13&modulename=tceLRSearchDetails&masterid=" + element.getWayBillId() + "&id=search");
									else
										response.sendRedirect("editWaybill.do?pageId=2&eventId=6&wayBillId="+ element.getWayBillViewList().getWayBillId() + "&flag=" + element.isFlag() + "&id=search"+ "&showEditDeliveryPaymentLink=false");
							} else
								request.setAttribute("deliveryContactDetails", deliveryContactDetailsArr);
						} else
							returnError(request, error);
					} else
						returnError(request, error);
				}
				case SearchTypeConstant.SEARCH_TYPE_ID_CREDITOR_INVOICE -> {
					final var 	creditorInvoiceProperties			= cacheManip.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.CREATE_INVOICE);
					final var	isWSInvoicePrintNeeded	 			= (boolean) creditorInvoiceProperties.getOrDefault(CreditorInvoicePropertiesConstant.IS_WS_INVOICE_PRINT_NEEDED, false);
					final var	isInvoicePreviewAllow	 			= (boolean) creditorInvoiceProperties.getOrDefault(CreditorInvoicePropertiesConstant.IS_INVOICE_PRINT_PREVIEW_ALLOW, false);

					final var	bill		= new BillDetailsForPrintingBill();
					bill.setBillId(id);
					bill.setBillNumber(number);
					bill.setAccountGroupId(executive.getAccountGroupId());
					bill.setBranchId(branchId);

					final var	billValObject = BillBLL.getInstance().getBillDetailsForPrintByBillNumberAndBranchId(queryString(bill), bill, branchesColl, inValObj);

					final var	billDetailsArrList 		= (List<BillDetailsForPrintingBill>) billValObject.get(BillDetailsForPrintingBill.BILL_DETAILS_FOR_PRINT);
					final var	isSupplementeryBill		= Utility.getBoolean(billValObject, "isSupplementeryBill");

					if(showBothBillAndSupplementryDetails) {
						suppBillValObject 		= BillBLL.getInstance().getBillDetailsForPrintByBillNumberAndBranchId(queryStringForSuppBill(bill, billDetailsArrList, isSupplementeryBill), bill, branchesColl, inValObj);
						suppBillDetailsArrList	= (List<BillDetailsForPrintingBill>) suppBillValObject.get(BillDetailsForPrintingBill.BILL_DETAILS_FOR_PRINT);
					}

					if(billDetailsArrList != null && !billDetailsArrList.isEmpty())
						for (final var iterator = billDetailsArrList.iterator(); iterator.hasNext();) {
							final var billDetailsForPrintingBill = iterator.next();

							if(!DisplayDataConfigurationBllImpl.getInstance().isDisplayData(displayDataConfig, billDetailsForPrintingBill.getCreationDateTimeStamp(), execFldPermissions, allowCustomMinDate, minDateTimeStamp))
								iterator.remove();
						}

					if(billDetailsArrList != null && !billDetailsArrList.isEmpty()) {
						final var	billHM	= (Map<Long, List<BillDetailsForPrintingBill>>) billValObject.get(BillDetailsForPrintingBill.BILL_CLEARANCE_DETAILS_FOR_PRINT);
						List<BillDetailsForPrintingBill> 			finalList	= null;
						Map<Long, List<BillDetailsForPrintingBill>>	finalHM		= null;

						if(showBothBillAndSupplementryDetails && suppBillDetailsArrList != null && !suppBillDetailsArrList.isEmpty()) {
							finalList	= Stream.of(billDetailsArrList, suppBillDetailsArrList)
									.flatMap(Collection::stream)
									.collect(CollectionUtility.getList());

							final var	suppHM	= (Map<Long, List<BillDetailsForPrintingBill>>) suppBillValObject.get(BillDetailsForPrintingBill.BILL_CLEARANCE_DETAILS_FOR_PRINT);

							finalHM	= Stream.of(billHM, suppHM)
									.flatMap(map -> map.entrySet().stream())
									.collect(Collectors.toMap(Map.Entry :: getKey, Map.Entry :: getValue));
						}

						var isAllowToShowBillPaymentDetails = false;

						if(finalList != null) {
							isAllowToShowBillPaymentDetails = finalList.stream().allMatch(o -> o.getBillIdentifier() == Bill.BILL_IDENTIFIER_TYPE_TBB);
							request.setAttribute(BillDetailsForPrintingBill.BILL_DETAILS_FOR_PRINT, finalList);
						} else if(billDetailsArrList != null) {
							isAllowToShowBillPaymentDetails = billDetailsArrList.stream().allMatch(o -> o.getBillIdentifier() == Bill.BILL_IDENTIFIER_TYPE_TBB);
							request.setAttribute(BillDetailsForPrintingBill.BILL_DETAILS_FOR_PRINT, billDetailsArrList);
						}

						if(finalHM != null)
							request.setAttribute(BillDetailsForPrintingBill.BILL_CLEARANCE_DETAILS_FOR_PRINT, finalHM);
						else
							request.setAttribute(BillDetailsForPrintingBill.BILL_CLEARANCE_DETAILS_FOR_PRINT, billHM);

						request.setAttribute("showChequeBounceLink", billValObject.get("showChequeBounceLink"));
						request.setAttribute("showBillSubmissionDate", execFldPermissions != null && execFldPermissions.containsKey(FeildPermissionsConstant.EDIT_BILL_SUBMISSION_DATE));
						request.setAttribute("billPdfEmail", execFldPermissions != null && execFldPermissions.containsKey(FeildPermissionsConstant.BILL_PDF_EMAIL));
						request.setAttribute("isAllowToShowBillPaymentDetails", isAllowToShowBillPaymentDetails);
						request.setAttribute(CreditorInvoicePropertiesConstant.IS_INVOICE_PRINT_PREVIEW_ALLOW, isInvoicePreviewAllow && isWSInvoicePrintNeeded);
					} else
						returnError(request, error);
				}
				case SearchTypeConstant.SEARCH_TYPE_ID_PAYMENT_VOUCHER -> {
					var	allowToEditExpenseVoucher			= false;
					var	isOperationAllowedAfterCashStmt		= false;

					final var	branchExpenseConfig								= cacheManip.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.BRANCH_EXPENSE);
					final var	centralizedCancellationInBranchExpense			= (boolean) branchExpenseConfig.getOrDefault(BranchExpensePropertiesConstant.CENTRALIZED_CANCELLATION_IN_BRANCH_EXPENSE, false);
					final var	allowExpenseDetailsPhotoUpload					= (boolean) branchExpenseConfig.getOrDefault(BranchExpensePropertiesConstant.ALLOW_EXPENSE_DETAILS_PHOTO_UPLOAD, false);
					final var	isAllowPaymentVoucherSearchForOwnBranchOnly		= (boolean) branchExpenseConfig.getOrDefault(BranchExpensePropertiesConstant.ALLOW_PAYMENT_VOUCHER_SEARCH_FOR_OWN_BRANCH_ONLY, false);
					final var	isAllowToSearchAllBranchPaymentVoucher			= execFldPermissions.get(FeildPermissionsConstant.ALLOW_TO_SEARCH_ALL_BRANCH_PAYMENT_VOUCHER) != null;

					final var	expenseVoucherPaymentDetailsHM = new HashMap<Long, ArrayList<ExpenseVoucherDetails>>();
					var			expenseVoucherDetailsList 			= VoucherDetailsDao.getInstance().getVoucherDetailsListByNumber(number, executive.getAccountGroupId(), branchId);

					if(!ObjectUtils.isEmpty(expenseVoucherDetailsList) && isAllowPaymentVoucherSearchForOwnBranchOnly && !isAllowToSearchAllBranchPaymentVoucher)
						expenseVoucherDetailsList = Arrays.stream(expenseVoucherDetailsList).filter(list -> executive.getBranchId() == list.getBranchId()).toArray(ExpenseVoucherDetails[]::new);

					if (ObjectUtils.isNotEmpty(expenseVoucherDetailsList)) {
						voucherDetailsHM	= new HashMap<>();

						for(final ExpenseVoucherDetails ed : expenseVoucherDetailsList) {
							if(ed.getCancellationDateTime()!=null)
								ed.setExpenseVoucherAppoveStatusString(ExpenseVoucherDetails.PAYMENT_VOUCHER_STATUS_CANCELLED_NAME);
							else if(ed.getExpenseVoucherAppoveStatus() == ExpenseVoucherDetails.EXPENSE_VOUCHER_APPROVE)
								ed.setExpenseVoucherAppoveStatusString(ExpenseVoucherDetails.EXPENSE_VOUCHER_APPROVE_STRING);
							else if(ed.getExpenseVoucherAppoveStatus() == ExpenseVoucherDetails.EXPENSE_VOUCHER_PENDING)
								ed.setExpenseVoucherAppoveStatusString(ExpenseVoucherDetails.EXPENSE_VOUCHER_PENDING_STRING);
							else if(ed.getExpenseVoucherAppoveStatus() == ExpenseVoucherDetails.EXPENSE_VOUCHER_REJECT)
								ed.setExpenseVoucherAppoveStatusString(ExpenseVoucherDetails.EXPENSE_VOUCHER_REJECT_STRING);

							voucherDetailsHM.put(ed.getExepenseVoucherDetailsId(), ed);
						}
					}

					if(ObjectUtils.isNotEmpty(voucherDetailsHM)) {
						final var	finalVoucherDetailsDataList = new ArrayList<>(voucherDetailsHM.values());

						voucherDetailsList = new ExpenseVoucherDetails[finalVoucherDetailsDataList.size()];
						finalVoucherDetailsDataList.toArray(voucherDetailsList);
					}

					if (voucherDetailsList != null && voucherDetailsList.length > 0) {
						final var	expenseVoucherDetailsDataList = new ArrayList<ExpenseVoucherDetails>();

						for (final ExpenseVoucherDetails element : voucherDetailsList)
							if (DisplayDataConfigurationBllImpl.getInstance().isDisplayData(displayDataConfig, element.getCreationDateTime(), execFldPermissions, allowCustomMinDate, minDateTimeStamp))
								expenseVoucherDetailsDataList.add(element);

						if (!expenseVoucherDetailsDataList.isEmpty()) {
							voucherDetailsList = new ExpenseVoucherDetails[expenseVoucherDetailsDataList.size()];
							expenseVoucherDetailsDataList.toArray(voucherDetailsList);
						}
					}

					if (voucherDetailsList != null && voucherDetailsList.length > 0) {
						final var	isAllowToEditLHPVAdvanceVoucherDate			= (boolean) lhpvPropertyConfig.getOrDefault(LHPVPropertiesConstant.ALLOW_TO_EDIT_LHPV_ADVANCE_VOUCHER_DATE, false);
						final var	isAllowToEditLHPVAdvanceVoucherPaymentMode	= (boolean) lhpvPropertyConfig.getOrDefault(LHPVPropertiesConstant.ALLOW_TO_EDIT_LHPV_ADVANCE_VOUCHER_PAYMENT_MODE, false);

						for (final ExpenseVoucherDetails element : voucherDetailsList) {
							var editLHPVAdvanceVoucherPaymentMode = false;
							var editLHPVAdvanceVoucherDate = false;
							var	isPaymentVoucherCancellationAllow 	= true;
							final var branchObj = cacheManip.getGenericBranchDetailCache(request,element.getBranchId());
							element.setBranch(branchObj.getName());
							element.setSubRegionId(branchObj.getSubRegionId());
							element.setSubRegion(cacheManip.getGenericSubRegionById(request, element.getSubRegionId()).getName());
							element.setPaymentModeName(PaymentTypeConstant.getPaymentType(element.getPaymentMode()));

							final var	expenseDetails = WayBillExpenseDao.getInstance().getWayBillExpenseDetailsByVoucherId(element.getExepenseVoucherDetailsId(), executive.getAccountGroupId());
							final var	expenseVoucherPaymentDetailsList	= VoucherDetailsDao.getInstance().getExpenseVoucherPaymentDetailsByExpenseVoucherDetailsId(element.getExepenseVoucherDetailsId());

							if(ObjectUtils.isNotEmpty(expenseVoucherPaymentDetailsList))
								expenseVoucherPaymentDetailsHM.put(element.getExepenseVoucherDetailsId(), expenseVoucherPaymentDetailsList);

							element.setVoucherBilled(WayBillExpenseDao.getInstance().isVoucherBilled(element.getExepenseVoucherDetailsId(), executive.getAccountGroupId(),expenseDetails));

							isOperationAllowedAfterCashStmt = com.iv.utils.Utility.isFunctionAllowed(element.getCreationDateTime(), noOfDays);
							/*
							 * Checking start for Edit Voucher
							 */
							var	execFeildPermission = execFldPermissions.get(FeildPermissionsConstant.EDIT_VOUCHER);

							if (execFeildPermission != null && element.getStatus() == ExpenseVoucherDetails.PAYMENT_VOUCHER_STATUS_BOOKED_ID) {
								allowToEditExpenseVoucher = true;

								for (final ExpenseDetails expenseDetail : expenseDetails)
									if (expenseDetail.getExpenseChargeMasterId() == 1 || expenseDetail.getExpenseChargeMasterId() == 24) {
										allowToEditExpenseVoucher = false;
										break;
									}
							}
							element.setAllowToEditExpenseVoucher(allowToEditExpenseVoucher);
							/*
							 * End
							 */
							/*
							 * Checking start for Payment Voucher Cancellation
							 */
							execFeildPermission = execFldPermissions.get(FeildPermissionsConstant.PAYMENT_VOUCHER_CANCELLATION);

							if ((executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_LMT
									|| executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_SMDTCL)
									&& !expenseDetails[0].isApplicableForTallyTransfer())
								isPaymentVoucherCancellationAllow = false;

							if (executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_LMT
									&& !isOperationAllowedAfterCashStmt)
								isPaymentVoucherCancellationAllow = false;

							if(centralizedCancellationInBranchExpense) {
								if(element.getStatus() == ExpenseVoucherDetails.PAYMENT_VOUCHER_STATUS_BOOKED_ID
										&& execFeildPermission != null
										&& executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN
										&& !element.isVoucherBilled() && isPaymentVoucherCancellationAllow
										&& element.getTruckHisabVoucherId() <= 0)
									isPaymentVoucherCancellationAllow = true;
								else
									isPaymentVoucherCancellationAllow = paymentVoucherCancellation(element,execFeildPermission,executive,isPaymentVoucherCancellationAllow);
							} else
								isPaymentVoucherCancellationAllow = paymentVoucherCancellation(element,execFeildPermission,executive,isPaymentVoucherCancellationAllow);

							element.setPaymentVoucherCancellationAllow(isPaymentVoucherCancellationAllow);

							if(element.getModuleVoucherIdentifier() != ExpenseVoucherDetails.MODULE_VOUCHER_MULTIPLE_LHPV_ADVANCE && element.getModuleVoucherIdentifier() != ExpenseVoucherDetails.MODULE_VOUCHER_MULTIPLE_DOOR_PICKUP_LORRY_HIRE
									&& element.getModuleVoucherIdentifier() != ExpenseVoucherDetails.MODULE_VOUCHER_MULTIPLE_DDM_LORRY_HIRE)
								element.setModuleVoucherIdentifier(ExpenseVoucherDetails.MODULE_VOUCHER_LHPV_ADVANCE);
							/*
							 * End
							 */

							/*
							 * Checking start for Edit Payment Mode and Voucher Date
							 */
							if (isAllowToEditLHPVAdvanceVoucherPaymentMode || isAllowToEditLHPVAdvanceVoucherDate) {
								final var expenseChargeHM = ExpenseChargeDao.getInstance().getExpenseChargeByMappingChargeIdAndAccountGroupId(executive.getAccountGroupId(),
										(short) IncomeExpenseMappingConstant.TRUCK_ADVANCE,
										IncomeExpenseChargeTypeConstant.CHARGE_TYPE_OFFICE);

								if (expenseChargeHM != null) {
									final var expenseCharge = expenseChargeHM.get(IncomeExpenseMappingConstant.TRUCK_ADVANCE);

									if (expenseCharge != null) {
										final var wayBillExpenses = WayBillExpenseDao.getInstance().getWayBillExpenseDetailsByIdAndExpenseChargeMasterId(
												element.getId(),
												expenseCharge.getIncomeExpenseChargeMasterId(),
												IncomeExpenseChargeTypeConstant.CHARGE_TYPE_OFFICE);

										if (wayBillExpenses != null)
											for (final ExpenseDetails wayBillExpense : wayBillExpenses)
												if (wayBillExpense.getExpenseVoucherDetailsId() == element.getExepenseVoucherDetailsId()) {
													if (isAllowToEditLHPVAdvanceVoucherPaymentMode)
														editLHPVAdvanceVoucherPaymentMode = true;

													if (isAllowToEditLHPVAdvanceVoucherDate)
														editLHPVAdvanceVoucherDate = true;
													break;
												}
									}
								}

								element.setEditLHPVAdvanceVoucherPaymentMode(editLHPVAdvanceVoucherPaymentMode);
								element.setEditLHPVAdvanceVoucherDate(editLHPVAdvanceVoucherDate);
							}

							element.setCreationDateTimeStr(DateTimeUtility.getDateFromTimeStampWithAMPM(element.getCreationDateTime()));
							/*
							 * End
							 */
						}

						request.setAttribute("IsOperationAllowedAfterCashStmt", isOperationAllowedAfterCashStmt);
						request.setAttribute("voucherDetails", voucherDetailsList);
						request.setAttribute("expenseVoucherPaymentDetailsHM", expenseVoucherPaymentDetailsHM);
						request.setAttribute(BranchExpensePropertiesConstant.ALLOW_EXPENSE_DETAILS_PHOTO_UPLOAD, allowExpenseDetailsPhotoUpload);

					} else
						returnError(request, error);
				}
				case SearchTypeConstant.SEARCH_TYPE_ID_RECEIPT_VOUCHER -> {
					final var 	branchIncomePropertyConfig						= cacheManip.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.BRANCH_INCOME);
					final var	isAllowPaymentVoucherSearchForOwnBranchOnly		= (boolean) branchIncomePropertyConfig.getOrDefault(BranchIncomePropertiesConstant.ALLOW_RECEIPT_VOUCHER_SEARCH_FOR_OWN_BRANCH_ONLY, false);
					final var	isAllowToSearchAllBranchPaymentVoucher			= execFldPermissions.get(FeildPermissionsConstant.ALLOW_TO_SEARCH_ALL_BRANCH_RECEIPT_VOUCHER) != null;

					var	wayBillIncomeVoucherDetailsArr = WayBillIncomeVoucherDetailsDao.getInstance().getAllWayBillIncomeVoucherDetailsByNumber(number,executive.getAccountGroupId(),branchId);

					if(!ObjectUtils.isEmpty(wayBillIncomeVoucherDetailsArr) && isAllowPaymentVoucherSearchForOwnBranchOnly && !isAllowToSearchAllBranchPaymentVoucher)
						wayBillIncomeVoucherDetailsArr = Arrays.stream(wayBillIncomeVoucherDetailsArr).filter(list -> executive.getBranchId() == list.getBranchId()).toArray(WayBillIncomeVoucherDetails[]::new);

					if (ObjectUtils.isNotEmpty(wayBillIncomeVoucherDetailsArr)) {
						final var	wayBillIncomeVoucherDetailsList = new ArrayList<WayBillIncomeVoucherDetails>();

						for (final WayBillIncomeVoucherDetails element : wayBillIncomeVoucherDetailsArr)
							if (DisplayDataConfigurationBllImpl.getInstance().isDisplayData(displayDataConfig, element.getCreationDateTime(), execFldPermissions, allowCustomMinDate, minDateTimeStamp))
								wayBillIncomeVoucherDetailsList.add(element);

						if (!wayBillIncomeVoucherDetailsList.isEmpty()) {
							wayBillIncomeVoucherDetailsArr = new WayBillIncomeVoucherDetails[wayBillIncomeVoucherDetailsList.size()];
							wayBillIncomeVoucherDetailsList.toArray(wayBillIncomeVoucherDetailsArr);
						}
					}

					if(ObjectUtils.isNotEmpty(wayBillIncomeVoucherDetailsArr)) {
						for (final WayBillIncomeVoucherDetails element : wayBillIncomeVoucherDetailsArr) {
							var	isReeiptVoucherCancellationAllow 		= true;
							element.setBranch(cacheManip.getGenericBranchDetailCache(request,element.getBranchId()).getName());
							element.setSubRegionId(cacheManip.getGenericBranchDetailCache(request, element.getBranchId()).getSubRegionId());
							element.setSubRegion(cacheManip.getGenericSubRegionById(request, element.getSubRegionId()).getName());

							final var	wayBillIncomes = WayBillIncomeDao.getInstance().getWayBillIncomeDetailsByVoucherId(element.getWayBillIncomeVoucherDetailsId(), executive.getAccountGroupId());

							if(ObjectUtils.isNotEmpty(wayBillIncomes))
								element.setVoucherBilled(WayBillIncomeDao.getInstance().isVoucherBilled(executive.getAccountGroupId(), wayBillIncomes));

							final var	isOperationAllowedAfterCashStmt1 = com.iv.utils.Utility.isFunctionAllowed(element.getCreationDateTime(), noOfDays);

							final var	execFeildPermission = execFldPermissions.get(FeildPermissionsConstant.RECEIPT_VOUCHER_CANCELLATION);

							if (executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_LMT
									&& !isOperationAllowedAfterCashStmt1)
								isReeiptVoucherCancellationAllow = false;

							if(element.getStatus() == WayBillIncomeVoucherDetails.RECEIPT_VOUCHER_STATUS_BOOKED_ID
									&& execFeildPermission != null
									&& element.getBranchId() == executive.getBranchId()
									&& isReeiptVoucherCancellationAllow && !element.isVoucherBilled())
								isReeiptVoucherCancellationAllow = true;
							else
								isReeiptVoucherCancellationAllow = false;

							element.setReeiptVoucherCancellationAllow(isReeiptVoucherCancellationAllow);
							element.setPartyName(Utility.checkedNullCondition(element.getPartyName(), (short) 1));
							element.setContactNumber(Utility.checkedNullCondition(element.getContactNumber(),  (short) 1));
							element.setCreationDateTimeStr(DateTimeUtility.getDateFromTimeStampWithAMPM(element.getCreationDateTime()));
						}

						request.setAttribute("wayBillIncomeVoucherDetails", wayBillIncomeVoucherDetailsArr);
						request.setAttribute("isAllowToEnterIDProof", IDProofSelectionUtility.isAllowToEnterIDProofDetails(ModuleIdentifierConstant.BRANCH_INCOME, executive.getAccountGroupId()));
					} else
						returnError(request, error);
				}
				case SearchTypeConstant.SEARCH_TYPE_ID_BLHPV -> {
					ValueObject								blhpvchargesCollVal			= null;
					var 									totalAmountForBlhpv			= 0D;
					var 									isBlhpvCancellationAllow	= false;

					final var	blhpvConfig		= cacheManip.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.BLHPV);
					final var	isBlhpvCancellationAllowForAdmin	= (Boolean) blhpvConfig.getOrDefault(BLHPVPropertiesConstant.IS_BLHPV_CANCELLATION_ALLOW_FOR_ADMIN, false);

					final var	isAllowBLHPVSearchForOwnBranchOnly	= (boolean) blhpvConfig.getOrDefault(BLHPVPropertiesConstant.ALLOW_BLHPV_SEARCH_FOR_OWN_BRANCH_ONLY, false);
					final var	isAllowToSearchAllBranchBLHPV		= execFldPermissions.get(FeildPermissionsConstant.ALLOW_TO_SEARCH_ALL_BRANCH_BLHPV) != null;
					final var	showAutomaticBlhpvCreationBranchOnSearch	= (boolean) receiveConfiguration.getOrDefault(ReceiveConfigurationPropertiesConstant.SHOW_AUTOMATIC_BLHPV_CREATION_BRANCH_ON_SEARCH, false);

					if(id > 0)
						blhpv = BLHPVDao.getInstance().getBLHPVData((short) 0, id, "", branchId);
					else
						blhpv = BLHPVDao.getInstance().getBLHPVData((short) 1, 0, number, branchId);

					if(blhpv != null && isAllowBLHPVSearchForOwnBranchOnly && !isAllowToSearchAllBranchBLHPV && executive.getBranchId() != blhpv.getbLHPVBranchId() && executive.getBranchId() != blhpv.getlHPVBranchId()
							&& (deliveryLocationList == null || !deliveryLocationList.contains(blhpv.getbLHPVBranchId()) && !deliveryLocationList.contains(blhpv.getlHPVBranchId())))
						blhpv = null;

					if(blhpv != null) {
						blhpvchargesCollVal = LhpvSettlementChargesDao.getInstance().getSetlementChargesByBlhpvId(blhpv.getbLHPVId(), LhpvChargesForGroup.IDENTIFIER_TYPE_BLHPV);
						isBlhpvChargeEdited = BLHPVUpdateEditLogsDaoImpl.getInstance().getBLHPVUpdateEditLogsByBlhpvIdAndEditTypeId(blhpv.getbLHPVId(), BLHPV.EDIT_BLHPV_TYPE_BLHPV_CHARGES);
					}

					if(blhpvchargesCollVal != null) {
						final var blhpvchargesColl = (HashMap<Long, Double>) blhpvchargesCollVal.get("chargesColl");

						if(blhpvchargesColl != null)
							for(final Map.Entry<Long, Double> entry : blhpvchargesColl.entrySet()) {
								final long key	= entry.getKey();

								if(key == Long.parseLong(LHPVChargeTypeConstant.ACTUAL_BALANCE+"")
										|| key == Long.parseLong(LHPVChargeTypeConstant.ACTUAL_REFUND+""))
									totalAmountForBlhpv = blhpvchargesColl.get(key);
							}
					}

					if((boolean) blhpvConfig.getOrDefault(BLHPVPropertiesConstant.SHOW_DDM_NUMBER_ON_BLHPV_SEARCH, false) && blhpv != null ) {
						final var	delRunSheetledgerDetails	= DeliveryRunSheetLedgerDao.getInstance().getDDMDetailsByLhpvId(blhpv.getLhpvId(), executive.getAccountGroupId());

						if(delRunSheetledgerDetails != null)
							blhpv.setDdmNumbers(delRunSheetledgerDetails.values().stream().map(DeliveryRunSheetLedger::getDdmNumber).collect(Collectors.joining(",")));
					}

					if(blhpv != null) {
						final var isDisplayData = DisplayDataConfigurationBllImpl.getInstance().isDisplayData(displayDataConfig, blhpv.getCreationDateTimeStamp(), execFldPermissions, allowCustomMinDate, minDateTimeStamp);

						if(isBlhpvCancellationAllowForAdmin && executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN)
							isBlhpvCancellationAllow	= true;

						if(isDisplayData) {
							final var	tdsTxnDetails	= TDSTxnDetailsDAO.getInstance().getTDSTxnDetails(TDSTxnDetailsIdentifiers.TDSTXNDETAILS_IDENTIFIER_BLHPV, blhpv.getbLHPVId());

							if(tdsTxnDetails != null)
								blhpv.setTds(tdsTxnDetails.getTdsAmount());

							if(blhpv.getPaymentMode() != PaymentTypeConstant.PAYMENT_TYPE_CASH_ID && blhpv.getChequeDate() != null)
								blhpv.setChequeDateStr(DateTimeUtility.getDateFromTimeStampWithAMPM(blhpv.getChequeDate()));
							else
								blhpv.setChequeDateStr("--");

							blhpv.setChequeNumber(Utility.checkedNullCondition(blhpv.getChequeNumber(), (short) 1));
							blhpv.setPaymentModeStr(PaymentTypeConstant.getPaymentType(blhpv.getPaymentMode()));
							blhpv.setPaymentStatusStr(com.iv.dto.constant.PaymentTypeConstant.getPaymentTypeStatus(blhpv.getStatus()));
							blhpv.setBankName(Utility.checkedNullCondition(blhpv.getBankName(), (short) 1));

							final var	branch 	= cacheManip.getGenericBranchDetailCache(request,blhpv.getBranchId());

							if(showAutomaticBlhpvCreationBranchOnSearch) {
								final var blhpvBranch = cacheManip.getGenericBranchDetailCache(request, blhpv.getbLHPVBranchId());

								if (blhpvBranch != null)
									blhpv.setDoneByBranchName(blhpvBranch.getName());

								if (branch != null)
									blhpv.setbLHPVBranchName(branch.getName());
							} else if (branch != null) {
								blhpv.setDoneByBranchName(branch.getName());
								blhpv.setbLHPVBranchName(branch.getName());
							}

							final var blhpvCreditAmountTxnList =BLHPVCreditAmountTxnDAO.getInstance().getReceivedBLHPVCreditAmountTxnByBlhpvId(blhpv.getbLHPVBranchId(), blhpv.getAccountGroupId(), blhpv.getbLHPVId());
							blhpv.setVehicleNumber(cacheManip.getVehicleNumber(request, executive.getAccountGroupId(), blhpv.getVehicleNumberMasterId()).getVehicleNumber());
							/**
							 * Code to Check Permission For Executive To Edit BLHPV Charges
							 */

							final var	execFeildPermissionForBlhpvEdit = execFldPermissions.get(FeildPermissionsConstant.EDIT_BLHPV);

							var	isBlhpvChargeEditAllow = execFeildPermissionForBlhpvEdit != null
									&& executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN
									|| executive.getBranchId() == blhpv.getBranchId();

							blhpv.setExecutiveName(blhpv.getExecutiveName() != null ? blhpv.getExecutiveName() : "--");

							if(blhpv.getStatus() != BLHPV.STATUS_BOOKED)
								isBlhpvChargeEditAllow	= false;

							final var	isBlhpvEditDateAllow	= (Boolean) blhpvConfig.getOrDefault(BLHPVPropertiesConstant.BLHPV_DATE_UPDATE_ALLOW, false) && !isBlhpvChargeEdited;

							if(blhpv.getCreditPaymentStatus() == BillClearanceStatusConstant.BILL_CLEARANCE_STATUS_CLEAR_PAYMENT_ID)
								isBlhpvChargeEditAllow	= false;

							if(ObjectUtils.isNotEmpty(blhpvCreditAmountTxnList)) {
								request.setAttribute("creditPaymentDone", creditPaymentDone);

								if(blhpvCreditAmountTxnList.size() > 1)
									request.setAttribute("foundMultipleEntries", true);
							}

							if(blhpv.getStatus() == BLHPV.STATUS_CANCELLED)
								blhpv.setStatusStr(BLHPV.STATUS_CANCELLED_NAME);
							else if(blhpv.getCreditPaymentStatus() == PaymentTypeConstant.PAYMENT_TYPE_STATUS_CLEAR_PAYMENT_ID ||
									blhpv.getCreditPaymentStatus() == PaymentTypeConstant.PAYMENT_TYPE_STATUS_NEGOTIATED_ID)
								blhpv.setStatusStr("SETTLED");
							else if(blhpv.getPaymentMode() == PaymentTypeConstant.PAYMENT_TYPE_CREDIT_ID
									|| blhpv.getCreditPaymentStatus() == PaymentTypeConstant.PAYMENT_TYPE_STATUS_PARTIAL_PAYMENT_ID)
								blhpv.setStatusStr("PENDING");
							else
								blhpv.setStatusStr(BLHPV.getLHPVStatus(blhpv.getStatus()));

							request.setAttribute(BLHPVPropertiesConstant.BLHPV_CONFIGURATION, blhpvConfig);
							request.setAttribute("blhpv", blhpv);
							request.setAttribute("totalAmountForBlhpv", totalAmountForBlhpv);
							request.setAttribute("isBlhpvChargeEditAllow", isBlhpvChargeEditAllow);
							request.setAttribute("isBlhpvEditDateAllow", isBlhpvEditDateAllow);
							request.setAttribute("isConsolidatedBLHPV", blhpv.getConsolidatedBLHPVId() > 0);
							request.setAttribute("isBlhpvCancellationAllow", isBlhpvCancellationAllow);
						} else
							returnError(request, error);
					} else
						returnError(request, error);
				}
				case SearchTypeConstant.SEARCH_TYPE_ID_DELIVERY_DEBIT_MEMO -> {
					final var	deliveryDebitMemo = DeliveryDebitMemoDao.getInstance().getDeliveryDebitMemoDetail((short) 1, 0, number, branchId);

					if(deliveryDebitMemo != null) {
						final var isDisplayData = DisplayDataConfigurationBllImpl.getInstance().isDisplayData(displayDataConfig, deliveryDebitMemo.getCreationTimeStamp(), execFldPermissions, allowCustomMinDate, minDateTimeStamp);

						if(isDisplayData) {
							final var	branch = cacheManip.getGenericBranchDetailCache(request, deliveryDebitMemo.getBranchId());

							if(branch != null)
								deliveryDebitMemo.setBranch(branch.getName());

							request.setAttribute("deliveryDebitMemo", deliveryDebitMemo);
						} else
							returnError(request, error);
					} else
						returnError(request, error);
				}
				case SearchTypeConstant.SEARCH_TYPE_ID_CROSSING_AGENT_INVOICE -> {
					final var	isSupplierNo	= JSPUtility.GetBoolean(request, "checkSupplierNo", false);
					final var	crossingAgentBillList	= CrossingAgentBillDaoImpl.getInstance().getCrossingAgentBillDetails(getCrossingAgentBillDetailsByWhereClause(id, number, executive.getAccountGroupId(), branchId, isSupplierNo));

					final var	showCrossingAgentBillReceiptPaymentDetails = (boolean) searchConfiguration.getOrDefault(SearchConfigPropertiesConstant.SHOW_CROSSING_AGENT_BILL_RECEIPT_PAYMENT_DETAILS, false);

					final List<CrossingAgentBill>	finalCrossingAgentBillList	= new ArrayList<>();

					if(ObjectUtils.isNotEmpty(crossingAgentBillList)) {
						final Map<Long, CrossingAgentBill>	crossingAgentBillHm = crossingAgentBillList.stream().collect(Collectors.toMap(CrossingAgentBill::getCrossingAgentBillId, Function.identity(), (e1, e2) -> e2));

						for(final Entry<Long, CrossingAgentBill> entry : crossingAgentBillHm.entrySet()) {
							final var crossAgentBill = entry.getValue();

							if(crossAgentBill != null) {
								if(!DisplayDataConfigurationBllImpl.getInstance().isDisplayData(displayDataConfig, crossAgentBill.getCreationDateTimeStamp(), execFldPermissions, allowCustomMinDate, minDateTimeStamp))
									continue;

								final var	branch = cacheManip.getGenericBranchDetailCache(request, crossAgentBill.getBranchId());
								crossAgentBill.setBranchName(branch.getName());
								crossAgentBill.setCreationDateTimeString(DateTimeUtility.getDateFromTimeStampWithAMPM(crossAgentBill.getCreationDateTimeStamp()));
								finalCrossingAgentBillList.add(crossAgentBill);
							}
						}

						if(showCrossingAgentBillReceiptPaymentDetails) {
							final Map<Long, List<CrossingAgentBill>>	crossingAgentBillReceiptHm	= crossingAgentBillList.stream().filter(e -> e.getPaymentStatus() != PaymentStatusConstant.PAYMENT_STATUS_DUE && e.getCrossingBillReceiptId() > 0)
									.collect(Collectors.groupingBy(CrossingAgentBill::getCrossingAgentBillId));

							for(final Entry<Long, List<CrossingAgentBill>> entry1 : crossingAgentBillReceiptHm.entrySet()) {
								final var billReceiptList	= entry1.getValue();

								if( billReceiptList != null && !billReceiptList.isEmpty())
									for(final CrossingAgentBill billReceipt : billReceiptList) {
										billReceipt.setReceiptDateTimeStr(DateTimeUtility.getDateTimeFromTimeStamp(billReceipt.getReceiptDateTime()));
										billReceipt.setBranchName(cacheManip.getBranchById(request, executive.getAccountGroupId(), billReceipt.getBranchId()).getName());
									}
							}

							request.setAttribute("crossingAgentBillReceiptHm", crossingAgentBillReceiptHm);
						}
					}

					if(ObjectUtils.isNotEmpty(finalCrossingAgentBillList)) {
						request.setAttribute("CrossingAgentBillDetailsForPrintingBill", finalCrossingAgentBillList);
						request.setAttribute(SearchConfigPropertiesConstant.SHOW_CROSSING_AGENT_BILL_RECEIPT_PAYMENT_DETAILS, showCrossingAgentBillReceiptPaymentDetails);
					} else
						returnError(request, error);
				}
				case SearchTypeConstant.SEARCH_TYPE_ID_DOOR_DELIVERY_MEMO -> {
					if(id > 0)
						deliveryRunSheetLedgerArr = DeliveryRunSheetLedgerDao.getInstance().getDataForDDMSearchById(id, executive.getAccountGroupId(), branchId);
					else
						deliveryRunSheetLedgerArr = DeliveryRunSheetLedgerDao.getInstance().getDataForDDMSearchByNumber(number,executive.getAccountGroupId(),branchId);

					if(ObjectUtils.isNotEmpty(deliveryRunSheetLedgerArr)) {
						final var	 delLedgerIds = Arrays.stream(deliveryRunSheetLedgerArr).map(ele-> Long.toString(ele.getDeliveryRunSheetLedgerId())).collect(Collectors.joining(Constant.COMMA));

						final var	deliveryRunSheetSummaryModelList = DeliveryRunSheetSummaryDao.getInstance().getAllDeliveryRunSheetLedgerData(delLedgerIds);

						final Map<Long, List<DeliveryRunSheetSummaryModel>> deliveryRunSheetSummaryHM	= deliveryRunSheetSummaryModelList.stream().collect(Collectors.groupingBy(DeliveryRunSheetSummaryModel::getDeliveryRunSheetLedgerId));

						for (final DeliveryRunSheetLedger element : deliveryRunSheetLedgerArr)
							if(DisplayDataConfigurationBllImpl.getInstance().isDisplayData(displayDataConfig, element.getCreationDateTime(), execFldPermissions, allowCustomMinDate, minDateTimeStamp)) {
								element.setSourceBranch(cacheManip.getGenericBranchDetailCache(request,element.getSourceBranchId()).getName());

								final var	models = deliveryRunSheetSummaryHM.get(element.getDeliveryRunSheetLedgerId());

								element.setAllLRSettled(ListFilterUtility.isNoElementInList(models, model -> model.getPaymentType() == 0));
								element.setAnyLRSettled(ListFilterUtility.isAnyMatchInList(models, model -> model.getPaymentType() > 0));

								if(element.getDestinationBranchId() > 0)
									element.setDestinationBranch(cacheManip.getGenericBranchDetailCache(request, element.getDestinationBranchId()).getName());
								else
									element.setDestinationBranch(element.getTruckDestination() !=null ? element.getTruckDestination() : "--");

								if(element.getBranchId() > 0)
									element.setBranchName(cacheManip.getGenericBranchDetailCache(request, element.getBranchId()).getName());
								else
									element.setBranchName("--");

								element.setExecutiveName(Utility.checkedNullCondition(element.getExecutiveName(), (short) 1));
								element.setCollectionPerson(Utility.checkedNullCondition(element.getCollectionPerson(), (short) 1));
								element.setRemark(Utility.checkedNullCondition(element.getRemark(), (short) 1));
								element.setCreationDateForUser(DateTimeUtility.getDateFromTimeStampWithAMPM(element.getCreationDateTime()));
							}

						final var	valObj		= DeliveryRunSheetSummaryDao.getInstance().getDeliveryRunSheetSummaryDetails(deliveryRunSheetLedgerArr[0].getDeliveryRunSheetLedgerId(), executive.getAccountGroupId());

						request.setAttribute(AliasNameConstants.IS_ALL_LR_SETTLED, valObj.getBoolean(AliasNameConstants.IS_ALL_LR_SETTLED, false));
						request.setAttribute("DDMReportData", deliveryRunSheetLedgerArr);
						request.setAttribute("dontAllowEditLorryHireAmtAfterSettlement", (boolean) searchConfiguration.getOrDefault(SearchConfigPropertiesConstant.DONT_ALLOW_EDIT_LORRY_HIRE_AMT_AFTER_SETTLEMENT, false));
					} else
						returnError(request, error);
				}
				case SearchTypeConstant.SEARCH_TYPE_ID_SHORT_CREDIT_NUMBER -> {
					count = 0;

					if(number != null) {
						final var	shortCreditConfig					= cacheManip.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.STBS);
						final var	stbsSettlementConfig				= cacheManip.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.STBS_SETTLEMENT);
						final var	allowBranchWiseSequenceCounter 		= (boolean) shortCreditConfig.getOrDefault(STBSConfigurationConstant.ALLOW_BRANCH_WISE_SEQUENCE_COUNTER, false);
						final var	isNewSTBSPaymentScreen				= (boolean) stbsSettlementConfig.getOrDefault(STBSSettlementConfigurationConstant.IS_NEW_STBS_PAYMENT_SCREEN, false);
						final var	allowSubregionWiseSequenceCounter 	= (boolean) shortCreditConfig.getOrDefault(STBSConfigurationConstant.ALLOW_SUBREGION_WISE_SEQUENCE_COUNTER, false);

						minDateTimeStamp		= cacheManip.getModuleWiseMinDateToGetData(request, executive.getAccountGroupId(),
								ModuleWiseMinDateSelectionConfigurationDTO.STBS_SETTLEMENT_MIN_DATE_ALLOW,
								ModuleWiseMinDateSelectionConfigurationDTO.STBS_SETTLEMENT_MIN_DATE);

						final var filterForSearch = 2;
						billNumber = number;
						inValObj.put("filterForSearch",filterForSearch);
						inValObj.put("billNumber", billNumber);
						inValObj.put("executive", executive);
						inValObj.put("collctnPersonId", (long)0);

						if(allowBranchWiseSequenceCounter || allowSubregionWiseSequenceCounter)
							inValObj.put("branchId", branchId);
						else
							inValObj.put("branchId", (long)0);

						inValObj.put("branchesColl", cacheManip.getGenericBranchesDetail(request));
						inValObj.put("allowBranchWiseSequenceCounter", allowBranchWiseSequenceCounter);
						inValObj.put("allowSubregionWiseSequenceCounter", allowSubregionWiseSequenceCounter);
						inValObj.put("minDateTimeStamp", minDateTimeStamp);
						inValObj.put("stbsSettlementConfig", stbsSettlementConfig);

						final var	shortCreditSettlementBll	= new ShortCreditCollectionSheetSettlementBLL();

						request.setAttribute(STBSConfigurationConstant.SHOW_SUMMARY_PRINT_BUTTON, shortCreditConfig.getOrDefault(STBSConfigurationConstant.SHOW_SUMMARY_PRINT_BUTTON, false));

						final var	outValObj = shortCreditSettlementBll.getShortCreditCollecionSheetSettlementData(inValObj);

						if(outValObj != null) {
							shortLedgerDtoTemp =  (ShortCreditCollectionSheetLedgerDto[]) outValObj.get("shortLedgerDto");

							if(ObjectUtils.isNotEmpty(shortLedgerDtoTemp))
								for (var i = 0; i < shortLedgerDtoTemp.length; i++)
									if(!DisplayDataConfigurationBllImpl.getInstance().isDisplayData(displayDataConfig, shortLedgerDtoTemp[i].getCreationTimestamp(), execFldPermissions, allowCustomMinDate, minDateTimeStamp))
										for (var j = i; j < shortLedgerDtoTemp.length-1; j++)
											shortLedgerDtoTemp[j] = shortLedgerDtoTemp[j+1];
									else
										count++;
						}

						request.setAttribute(STBSSettlementConfigurationConstant.IS_NEW_STBS_PAYMENT_SCREEN, isNewSTBSPaymentScreen);

						final var	shortLedgerDto = new ShortCreditCollectionSheetLedgerDto[count];

						if(shortLedgerDto.length > 0) {
							for (var i = 0; i < shortLedgerDto.length; i++) {
								shortLedgerDto[i] = shortLedgerDtoTemp[i];
								shortLedgerDto[i].setCreationTimestampStr(DateTimeUtility.getDateFromTimeStampWithAMPM(shortLedgerDto[i].getCreationTimestamp()));

								if((boolean) searchConfiguration.getOrDefault(SearchConfigPropertiesConstant.SHOW_ONLY_CURRENT_STBS_BILL_PAYMENT_WITH_SINGLE_MR_NUMBER, false)){
									final var moneyReceiptTxnData  = MoneyReceiptTxnDao.getInstance().getLatestMRTxnDetailsSTBS(shortLedgerDto[i].getShortCreditCollLedgerId(), ModuleIdentifierConstant.STBS_SETTLEMENT_BILL_WISE);

									if(moneyReceiptTxnData != null)
										shortLedgerDto[i].setSubId(moneyReceiptTxnData.getSubId());
								}
							}

							request.setAttribute("shortLedgerDto", shortLedgerDto);
							request.setAttribute("isAllowedToCancell", outValObj.get("isAllowedToCancell"));
						} else
							returnError(request, error);
					} else
						returnError(request, error);
				}
				case SearchTypeConstant.SEARCH_TYPE_ID_LORRY_HIRE_NUMBER -> {
					if(id > 0)
						lorryHire = LorryHireDao.getInstance().getLorryHireDetailById((short)1,id,number,executive.getAccountGroupId());
					else
						lorryHire = LorryHireDao.getInstance().getLorryHireDetailById((short)2,0,number,executive.getAccountGroupId());

					if(lorryHire != null) {
						lorryHire.setSourceBranch(cacheManip.getGenericBranchDetailCache(request, lorryHire.getSourceBranchId()).getName());
						lorryHire.setDestinationBranch(cacheManip.getGenericBranchDetailCache(request, lorryHire.getDestinationBranchId()).getName());
						lorryHire.setBranch(cacheManip.getGenericBranchDetailCache(request, lorryHire.getBranchId()).getName());

						request.setAttribute("lorryHire", lorryHire);
					} else
						returnError(request, error);
				}
				case SearchTypeConstant.SEARCH_TYPE_ID_POD_DISPATCH_NUMBER -> {
					final var	podDispatchArr	= PODDispatchLedgerDao.getInstance().getPODDispatchDataForSearchArr(executive.getAccountGroupId(), number);

					if(ObjectUtils.isNotEmpty(podDispatchArr)) {
						for (final PODDispatch element : podDispatchArr) {
							if(element.getDispatchByBranchId() > 0)
								element.setDispatchByBranchStr(cacheManip.getGenericBranchDetailCache(request,element.getDispatchByBranchId()).getName());
							else
								element.setDispatchByBranchStr("--");

							if(element.getDispatchToBranchId() > 0)
								element.setDispatchToBranchStr(cacheManip.getGenericBranchDetailCache(request,element.getDispatchToBranchId()).getName());
							else
								element.setDispatchToBranchStr("--");

							element.setTxnDateTimeStr(DateTimeUtility.getDateFromTimeStamp(element.getTxnDateTime(), DateTimeFormatConstant.DD_MM_YYYY));
						}

						request.setAttribute("podDispatchArr", podDispatchArr);
					} else
						returnError(request, error);
				}
				case SearchTypeConstant.SEARCH_TYPE_ID_MR -> {
					if(StringUtils.isNotEmpty(number)) {
						var	moneyReceiptTxn = MoneyReceiptTxnDao.getInstance().getMoneyReceiptTxnDetailsByMoneyReceipt(number, executive.getAccountGroupId(), branchId);
						ArrayList<MoneyReceiptTxn>	moneyReceiptTxnArr = null;

						if(moneyReceiptTxn != null){
							if(moneyReceiptTxn.getModuleIdentifier() == ModuleIdentifierConstant.STBS_SETTLEMENT) {
								moneyReceiptTxn.setAccountGroupId(executive.getAccountGroupId());
								moneyReceiptTxn.setMoneyReceiptNumber(number);
								moneyReceiptTxn.setSourceBranchId(branchId);
								outValueObject = MoneyReceiptTxnDao.getInstance().getMoneyReceiptTxnDetailsByMoneyReceiptForSTBS(moneyReceiptTxn);
								moneyReceiptTxn = (MoneyReceiptTxn) outValueObject.get("moneyReceiptTxn");
							} else if (moneyReceiptTxn.getModuleIdentifier() == ModuleIdentifierConstant.BILL_PAYMENT) {
								final var	billPaymentConfig		= cacheManip.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.BILL_PAYMENT);

								moneyReceiptTxn.setAccountGroupId(executive.getAccountGroupId());
								moneyReceiptTxn.setMoneyReceiptNumber(number);
								moneyReceiptTxn.setSourceBranchId(branchId);

								if((boolean) billPaymentConfig.getOrDefault(BillPaymentConfigurationConstant.SHOW_ONLY_CURRENT_PAYMENT_WITH_SINGLE_MR_NUMBER, false))
									outValueObject = MoneyReceiptTxnDao.getInstance().getMoneyReceiptTxnDetailsByMoneyReceiptForCreditorInvoiceForSearch(moneyReceiptTxn);
								else
									outValueObject = MoneyReceiptTxnDao.getInstance().getMoneyReceiptTxnDetailsByMoneyReceiptForCreditorInvoice(moneyReceiptTxn, false, "0", 0);

								moneyReceiptTxn 	= (MoneyReceiptTxn) outValueObject.get("moneyReceiptTxn");
								moneyReceiptTxnArr 	= (ArrayList<MoneyReceiptTxn>) outValueObject.get("moneyReceiptTxnArr");
							} else if (moneyReceiptTxn.getModuleIdentifier() == ModuleIdentifierConstant.BOOKING )
								moneyReceiptTxn.setBillNumber(moneyReceiptTxn.getWayBillNumber());
							else if(moneyReceiptTxn.getModuleIdentifier() == ModuleIdentifierConstant.SHORT_CREDIT_PAYMENT) {
								moneyReceiptTxn.setAccountGroupId(executive.getAccountGroupId());
								moneyReceiptTxn.setMoneyReceiptNumber(number);
								moneyReceiptTxn.setSourceBranchId(branchId);

								if((boolean) searchConfiguration.getOrDefault(SearchConfigPropertiesConstant.SHOW_ONLY_CURRENT_CREDIT_PAYMENT_WITH_SINGLE_MR_NUMBER, false))
									outValueObject 	= MoneyReceiptTxnDao.getInstance().getMRDetailsByMoneyReceiptForShortCreditPaymrntForSearch(moneyReceiptTxn);
								else
									outValueObject 	= MoneyReceiptTxnDao.getInstance().getMoneyReceiptTxnDetailsByMoneyReceiptNumberForShortCreditPayment(moneyReceiptTxn,false,"0");

								moneyReceiptTxn 	= (MoneyReceiptTxn) outValueObject.get("moneyReceiptTxn");
								moneyReceiptTxnArr 	= (ArrayList<MoneyReceiptTxn>) outValueObject.get("moneyReceiptTxnArr");

							} else if(moneyReceiptTxn.getModuleIdentifier() == ModuleIdentifierConstant.STBS_SETTLEMENT_BILL_WISE) {
								moneyReceiptTxn.setAccountGroupId(executive.getAccountGroupId());
								moneyReceiptTxn.setMoneyReceiptNumber(number);
								moneyReceiptTxn.setSourceBranchId(branchId);

								if((boolean) searchConfiguration.getOrDefault(SearchConfigPropertiesConstant.SHOW_ONLY_CURRENT_STBS_BILL_PAYMENT_WITH_SINGLE_MR_NUMBER, false)) {
									outValueObject 		= MoneyReceiptTxnDao.getInstance().getMultipleMoneyReceiptTxnDetailsSTBS(moneyReceiptTxn);
									moneyReceiptTxnArr 	= (ArrayList<MoneyReceiptTxn>) outValueObject.get("moneyReceiptTxnArr");
								} else
									outValueObject 	= MoneyReceiptTxnDao.getInstance().getMoneyReceiptTxnDetailsByMoneyReceiptForBillWiseSTBS(moneyReceiptTxn);

								moneyReceiptTxn = (MoneyReceiptTxn) outValueObject.get("moneyReceiptTxn");
							}

							if(ObjectUtils.isNotEmpty(moneyReceiptTxnArr))
								request.setAttribute(MoneyReceiptTxn.MONEY_RECEIPT_TXN_HM, moneyReceiptTxnArr.stream().collect(Collectors.groupingBy(MoneyReceiptTxn::getTxnDateTime)));

							request.setAttribute(MoneyReceiptTxn.MONEY_RECEIPT_TXN, moneyReceiptTxn);
						} else
							returnError(request, error);
					} else
						returnError(request, error);
				}
				case SearchTypeConstant.SEARCH_TYPE_ID_PARTY_AGENT_COMMISION -> {
					final var	partyAgentCommisionSummaryArr	= PartyAgentCommisionSummaryDaoImpl.getInstance().getPartyAgentCommisionDataForSearchArr(executive.getAccountGroupId(), number);

					if(ObjectUtils.isNotEmpty(partyAgentCommisionSummaryArr)) {
						for(final PartyAgentCommisionSummary paSummary : partyAgentCommisionSummaryArr)
							paSummary.setCreationDateTimeStampStr(DateTimeUtility.getDateFromTimeStampWithAMPM(paSummary.getCreationDateTimeStamp()));

						request.setAttribute("partyAgentCommisionSummaryArr", partyAgentCommisionSummaryArr);
					} else
						returnError(request, error);
				}
				case SearchTypeConstant.SEARCH_TYPE_ID_AGENT_COMMISION_BILL -> {
					final var	agentCommisionBillingSummaryArr	= AgentCommisionBillingSummaryDao.getInstance().getAgentCommisionSummaryDataForSearchArr(executive.getAccountGroupId(), number);

					if(ObjectUtils.isNotEmpty(agentCommisionBillingSummaryArr)) {
						request.setAttribute("agentCommisionBillingSummaryArr", agentCommisionBillingSummaryArr);
						request.setAttribute(SearchConfigPropertiesConstant.IS_SHOW_AGENT_COMMISION_BILL_PAYMENT_DETAILS, (boolean) searchConfiguration.getOrDefault(SearchConfigPropertiesConstant.IS_SHOW_AGENT_COMMISION_BILL_PAYMENT_DETAILS, false));
					} else
						returnError(request, error);
				}
				case SearchTypeConstant.SEARCH_TYPE_FUND_TRANSFER -> {
					final var fundTransferConfig			= cacheManip.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.FUND_TRANSFER);
					final var allowOwnBranchOnly			= (boolean) fundTransferConfig.getOrDefault(FundTransferPropertiesConstant.ALLOW_FUND_TRANSFER_SEARCH_FOR_OWN_BRANCH_ONLY, false);
					final var allowSearchAllBranches		= execFldPermissions.containsKey(FeildPermissionsConstant.ALLOW_TO_SEARCH_ALL_BRANCH_FUND_TRANSFER);

					var fundTransferList = FundTransferHistoryDaoImpl.getInstance().getFundTransferDetailsByNumber(executive.getAccountGroupId(), number, branchId);

					if (ObjectUtils.isEmpty(fundTransferList)) {
						returnError(request, error);
						return;
					}

					fundTransferList = new ArrayList<>(fundTransferList.stream().collect(Collectors.toMap(FundTransfer::getFundTransferId,ft -> ft,(a, b) -> a)).values());

					// Step 1: Filter based on branch access
					if (allowOwnBranchOnly && !allowSearchAllBranches)
						fundTransferList = ListFilterUtility.filterList(fundTransferList,
								ft -> executive.getBranchId() == ft.getFromBranchId() || executive.getBranchId() == ft.getToBranchId());

					// Step 2: Process and enrich fund transfer list
					for (final FundTransfer ft : fundTransferList) {
						final var isDisplayData = DisplayDataConfigurationBllImpl.getInstance()
								.isDisplayData(displayDataConfig, ft.getHistoryDateTimeStamp(), execFldPermissions, allowCustomMinDate, minDateTimeStamp);

						if (!isDisplayData) {
							ft.setIsDisplayData(false);
							continue;
						}

						ft.setIsDisplayData(true);
						setFTBranchNames(ft, branchesColl);
						setOtherTransferDetails(ft);
						setFTCancellationDetails(ft);

						ft.setAllowToCancelFundTransfer(canCancelFundTransfer(ft, executive, execFunctions));
					}

					// Step 3: Filter non-displayable entries
					fundTransferList = ListFilterUtility.filterList(fundTransferList, FundTransfer::getIsDisplayData);

					if (fundTransferList.isEmpty()) {
						returnError(request, error);
						return;
					}

					// Step 4: Set final output attributes
					request.setAttribute("fundTransferList", fundTransferList);
					request.setAttribute("isShowFTCancelledColumn", ListFilterUtility.isAnyMatchInList(fundTransferList, ft -> ft.getStatus() == FundTransferTypeConstant.FUNDTRANSFER_STATUS_CANCLLED));
					request.setAttribute("showFundApprovalRemarkColumn", (boolean) fundTransferConfig.getOrDefault(FundTransferPropertiesConstant.SHOW_FUND_APPROVAL_REMARK_COLUMN, false));
					request.setAttribute("isAllowCancelledFund", ListFilterUtility.isAnyMatchInList(fundTransferList, FundTransfer::getAllowToCancelFundTransfer));
					request.setAttribute("allowFundTransferPrint", (boolean) fundTransferConfig.getOrDefault(FundTransferPropertiesConstant.ALLOW_FUND_TRANFER_PRINT, false));
				}
				case SearchTypeConstant.SEARCH_TYPE_PICK_UP_LS -> {
					final var	doorPickupLedger	= DoorPickupLedgerDao.getInstance().getPickupDetailsByPickupNumberAndBranchId(number,executive.getAccountGroupId(),branchId);
					final List<WayBillViewModel>	wayBillViewModelList  		= new ArrayList<>();

					if(doorPickupLedger != null) {
						if(showLRDetailsOnSearchPickUpLS) {
							final var doorPickupDetails	= new DoorPickupDetails();
							doorPickupDetails.setDoorPickupDetailsAccountGroupId(executive.getAccountGroupId());
							doorPickupDetails.setDoorPickupDetailsBranchId(branchId);
							doorPickupDetails.setDoorPickupLedgerId(doorPickupLedger.getDoorPickupLedgerId());
							final var	doorPickupDetailsList	= DoorPickupDetailsDaoImpl.getInstance().getDoorPickupDetailsByPickupLedgerId(doorPickupDetails);

							if(ObjectUtils.isNotEmpty(doorPickupDetailsList)) {
								final var wayBillIdsStr	= doorPickupDetailsList.stream().map(e -> Long.toString(e.getDoorPickupDetaisWayBillId())).collect(Collectors.joining(","));
								final var wayBillArr	= WayBillDao.getInstance().getWayBillsByIds(wayBillIdsStr);

								if(wayBillArr != null)
									setWayBillDetails(wayBillViewModelList, wayBillArr, wayBillIdsStr, branchesColl);
							}

							if(ObjectUtils.isNotEmpty(wayBillViewModelList))
								request.setAttribute("wayBillModelArr", wayBillViewModelList);
						}

						doorPickupLedger.setCreationDateTimeString(DateTimeUtility.getDateTimeFromTimeStamp(doorPickupLedger.getDoorPickupLedgerCreationDateTime()));
						doorPickupLedger.setDoorPickupLedgerBranchName(cacheManip.getGenericBranchDetailCache(request, doorPickupLedger.getDoorPickupLedgerBranchId()).getName());
						doorPickupLedger.setDoorPickupNumber(Utility.checkedNullCondition(doorPickupLedger.getDoorPickupNumber(), (short) 1));
						doorPickupLedger.setDoorPickupLedgerLorryHireAmountSettlementStatusString(DoorPickupLedger.getPaymentTypeStatusSettlement(doorPickupLedger.getDoorPickupLedgerLorryHireAmountSettlementStatus()));
						doorPickupLedger.setDoorPickupLedgerBranchName(Utility.checkedNullCondition(doorPickupLedger.getDoorPickupLedgerBranchName(), (short) 1));
						doorPickupLedger.setDoorPickupLedgerVehicleNumber(Utility.checkedNullCondition(doorPickupLedger.getDoorPickupLedgerVehicleNumber(), (short) 1));
						request.setAttribute(DoorPickupLedger.DOOR_PICKUP_LEDGER, doorPickupLedger);
					} else
						returnError(request, error);
				}
				case SearchTypeConstant.SEARCH_TYPE_AGENT_BRANCH_HISAB -> {
					final var	agentBranchHisabLedger			= AgentBranchHisabLedgerDao.getInstance().getAgentBranchHisabByAgentBranchHisabNumber(number,executive.getAccountGroupId());
					if(agentBranchHisabLedger !=null ){
						agentBranchHisabLedger.setCreationDateTimeStr(DateTimeUtility.getDateTimeFromTimeStamp(agentBranchHisabLedger.getCreationDateTime()));
						request.setAttribute("agentBranchHisabLedger", agentBranchHisabLedger);
					} else
						returnError(request, error);
				}
				case SearchTypeConstant.SEARCH_TYPE_ID_CONSOLIDATED_BLHPV -> {
					blhpv			  = new BLHPV();
					String branchName = null;
					blhpv.setAccountGroupId(executive.getAccountGroupId());
					blhpv.setConsolidatedBLHPVNUmber(number);
					blhpv.setBranchId(branchId);
					final var	consolidatedBlhpvArray	= BLHPVDao.getInstance().getConsolidatedBLHPVDetailsByNumberAndBranchId(blhpv);

					if(consolidatedBlhpvArray != null)
						for (final BLHPV element : consolidatedBlhpvArray) {
							final var	branch = cacheManip.getGenericBranchDetailCache(request, element.getBranchId());
							branchName	=	branch.getName();
							element.setRemark(Utility.checkedNullCondition(element.getRemark(), (short) 1));

							if(element.getChequeDate() == null)
								element.setChequeDateStr("");
							else
								element.setChequeDateStr(DateTimeUtility.getDateTimeFromTimeStamp(element.getChequeDate()));

							element.setChequeNumber(Utility.checkedNullCondition(element.getChequeNumber(), (short) 2));
							element.setBankName(Utility.checkedNullCondition(element.getBankName(), (short) 2));

							if(element.getStatus() == BLHPV.STATUS_CANCELLED)
								element.setStatusStr(BLHPV.STATUS_CANCELLED_NAME);
						}
					if(consolidatedBlhpvArray != null){
						request.setAttribute("consolidatedBlhpvArray", consolidatedBlhpvArray);
						request.setAttribute("branchName", branchName);
					} else
						returnError(request, error);
				}
				case SearchTypeConstant.SEARCH_TYPE_BILL_COVERING_LETTER -> {
					final var	billCoveringLetter	= new BillCoveringLetter();
					var isAllowtoCancel			  = true;
					billCoveringLetter.setAccountGroupId(executive.getAccountGroupId());
					billCoveringLetter.setBillCoveringLetterNo(number);
					billCoveringLetter.setBranchId(branchId);
					final var	billCoveringLetterList	= BillCoverLetterDaoImpl.getInstance().getBillCoveringLetterDataByNumberAndBranchId(billCoveringLetter);

					if(ObjectUtils.isNotEmpty(billCoveringLetterList)) {
						final var	billCoverLetterArrList	= BillDaoImpl.getInstance().getLimitedBillDataByBillCoveringLetterId(billCoveringLetterList.get(0).getBillCoveringLetterId());

						if(ObjectUtils.isNotEmpty(billCoverLetterArrList))
							for(final BillPrintModel obj : billCoverLetterArrList)
								if(obj.getBillStatus() != BillClearanceStatusConstant.BILL_CLEARANCE_STATUS_DUE_PAYMENT_ID) {
									isAllowtoCancel	= false;
									break;
								}

						request.setAttribute("BillCoveringLetterList", billCoveringLetterList);
						request.setAttribute("isAllowtoCancel", isAllowtoCancel);
						request.setAttribute("branchName", billCoveringLetterList.get(0).getBranchName());
					} else
						returnError(request, error);
				}
				case SearchTypeConstant.SEARCH_TYPE_CROSSING_BILL_RECEIPT -> {
					final var		crossingAgentBillProperties		= cacheManip.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.CROSSING_HISAB_SETTLEMENT);
					final boolean isAllowMultipleCrossingBillReceiptPrint	= (Boolean) crossingAgentBillProperties.getOrDefault(CrossingAgentBillClearancePropertiesConstant.IS_ALLOW_MULTIPLE_CROSSING_BILL_RECEIPT_PRINT, false);
					final var crossingBillReceipt	= new CrossingBillReceipt();
					crossingBillReceipt.setAccountGroupId(executive.getAccountGroupId());
					crossingBillReceipt.setReceiptNumber(number);
					crossingBillReceipt.setBranchId(branchId);

					final var	crossingBillReceiptList	= CrossingBillReceiptDaoImpl.getInstance().getCrossingBillReceiptByNumberAndBranchId(crossingBillReceipt);

					if(ObjectUtils.isNotEmpty(crossingBillReceiptList)) {
						for(final CrossingBillReceipt crBillReceipt : crossingBillReceiptList) {
							crBillReceipt.setBranchName(cacheManip.getBranchById(request, executive.getAccountGroupId(), crBillReceipt.getBranchId()).getName());
							crBillReceipt.setBillBranchName(cacheManip.getBranchById(request, executive.getAccountGroupId(), crBillReceipt.getBillBranchId()).getName());

							if(crBillReceipt.getReceivedAmount() < 0)
								crBillReceipt.setReceivedAmount(-crBillReceipt.getReceivedAmount());
						}

						request.setAttribute("crossingBillReceiptList", crossingBillReceiptList);
						request.setAttribute(CrossingAgentBillClearancePropertiesConstant.IS_ALLOW_MULTIPLE_CROSSING_BILL_RECEIPT_PRINT, isAllowMultipleCrossingBillReceiptPrint);
					} else
						returnError(request, error);
				}
				case SearchTypeConstant.SEARCH_TYPE_ID_TRIP_HISAB_SETTLEMENT_NUMBER -> {}
				case SearchTypeConstant.SEARCH_TYPE_ID_TRUCK_HISAB_VOUCHER_NUMBER -> {}
				case SearchTypeConstant.SEARCH_TYPE_ID_PUMP_RECEIPT_NUMBER -> {}
				case SearchTypeConstant.SEARCH_TYPE_ID_FUEL_HISAB_VOUCHER_NUMBER -> {}
				case SearchTypeConstant.SEARCH_TYPE_LOADING_HAMALI_NUMBER -> {}
				case SearchTypeConstant.SEARCH_TYPE_UNLOADING_HAMALI_NUMBER -> {}
				case SearchTypeConstant.SEARCH_TYPE_ID_ON_ACCOUNNT_NUMBER -> {}
				case SearchTypeConstant.SEARCH_TYPE_PRELOADING_SHEET_NUMBER -> {
					final var	preloadingSheetArr = PreLoadingSheetLedgerDao.getInstance().getPreloadingSheetDataForSearchArr(number, executive.getAccountGroupId());

					if(ObjectUtils.isNotEmpty(preloadingSheetArr)) {
						for (final var iterator = preloadingSheetArr.iterator(); iterator.hasNext();) {
							final var element = iterator.next();

							if(!DisplayDataConfigurationBllImpl.getInstance().isDisplayData(displayDataConfig, element.getCreationDateTimeStamp(), execFldPermissions, allowCustomMinDate, minDateTimeStamp))
								iterator.remove();
						}

						if(ObjectUtils.isNotEmpty(preloadingSheetArr)) {
							for (final PreLoadingSheetLedger element : preloadingSheetArr) {
								if(element.getBranchId() > 0) {
									final var	branch = cacheManip.getGenericBranchDetailCache(request,element.getBranchId());

									if(branch != null)
										element.setBranchName(branch.getName());
									else
										element.setBranchName("--");
								} else
									element.setBranchName("--");

								element.setCreationDateTimeStr(DateTimeUtility.getDateFromTimeStamp(element.getCreationDateTimeStamp()));

								if(element.getLsNumber() == null)
									element.setLsNumber("-");
							}

							request.setAttribute("preloadingSheetReportArr", preloadingSheetArr);
						} else
							returnError(request, error);
					} else
						returnError(request, error);
				}

				default -> returnError(request, error);
				}
			else
				returnError(request, error);

			if(transportList.contains(executive.getAccountGroupId()) || transportSearchModuleForCargo)
				request.setAttribute("nextPageToken", "success");
			else
				request.setAttribute("nextPageToken", "success_cargo");
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}

	public void returnError(final HttpServletRequest request ,final HashMap<String,Object> error) throws Exception {
		try {
			error.put("errorCode", CargoErrorList.NO_RECORDS);
			error.put("errorDescription", CargoErrorList.NO_RECORDS_DESCRIPTION);
			request.setAttribute("cargoError", error);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public WayBillViewModel populateWayBillViewModel(final HttpServletRequest request ,final WayBill wayBill ,final CacheManip cache ,final int noOfArticle) throws Exception {
		try {
			final var	wayBillViewModel = new WayBillViewModel();

			var	branch	 = cache.getGenericBranchDetailCache(request, wayBill.getDestinationBranchId());
			wayBillViewModel.setDestinationBranch(branch.getName());
			wayBillViewModel.setDestinationBranchId(wayBill.getDestinationBranchId());
			wayBill.setDestinationSubRegionId(branch.getSubRegionId());
			wayBillViewModel.setDummyWayBillId(wayBill.getDummyWayBillId());

			final var	subRegion = cache.getGenericSubRegionById(request, wayBill.getDestinationSubRegionId());
			if(subRegion != null)
				wayBillViewModel.setDestinationSubRegion(subRegion.getName());

			wayBillViewModel.setDestinationSubRegionId(wayBill.getDestinationSubRegionId());

			branch	 = cache.getGenericBranchDetailCache(request, wayBill.getSourceBranchId());
			wayBillViewModel.setSourceBranch(branch.getName());
			wayBillViewModel.setSourceBranchId(wayBill.getSourceBranchId());
			wayBillViewModel.setCreationDateTimeStamp(wayBill.getCreationDateTimeStamp());
			wayBillViewModel.setStatus(wayBill.getStatus());
			wayBillViewModel.setWayBillId(wayBill.getWayBillId());
			wayBillViewModel.setWayBillNumber(wayBill.getWayBillNumber());
			wayBillViewModel.setWayBillTypeId(wayBill.getWayBillTypeId());

			final var	wayBillType = cache.getWayBillTypeById(request, wayBill.getWayBillTypeId());

			if(wayBill.isManual())
				wayBillViewModel.setWayBillType(wayBillType.getWayBillType() + WayBillType.WAYBILL_TYPE_MANUAL);
			else
				wayBillViewModel.setWayBillType(wayBillType.getWayBillType());

			wayBillViewModel.setConsignerName(wayBill.getConsignerName());
			wayBillViewModel.setConsigneeName(wayBill.getConsigneeName());
			wayBillViewModel.setNoOfArticle(noOfArticle);
			wayBillViewModel.setNoOfPkgs(wayBill.getNoOfPkgs());
			wayBillViewModel.setDeliveryPlaceId(wayBill.getDeliveryPlaceId());
			wayBillViewModel.setDeliveryTypeId(wayBill.getDeliveryTypeId());
			wayBillViewModel.setBookingTypeId(wayBill.getBookingTypeId());

			return wayBillViewModel;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private boolean cancelLSOfRawanaVoucher(final long dispatchLedgerId) throws Exception {
		try {
			final var module	= new StringBuilder();

			module.append("&dispatchLedgerId=" + dispatchLedgerId);

			var	peHisabSettlementModelsObj 			= WSUtility.callPostWebService(WSUtility.getWebServiceUrl(Integer.toString(WebServiceURI.CHECK_TO_CANCEL_LS_OF_RAWANA_VOUCHER)), module.toString());

			if(peHisabSettlementModelsObj == null || peHisabSettlementModelsObj.get(WSConstant.WEB_SERVICE_RESULT) == null)
				return true;

			final var	serviceModuleActionRateWbResult 	= new JSONObject(peHisabSettlementModelsObj.get(WSConstant.WEB_SERVICE_RESULT).toString());
			peHisabSettlementModelsObj			= JsonUtility.convertJsonObjectsToValueObject(serviceModuleActionRateWbResult);

			return peHisabSettlementModelsObj.getBoolean("cancelLSOfRawanaVoucher", true);
		} catch (final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
			return true;
		}
	}

	private String queryString(final BillDetailsForPrintingBill bill) throws Exception {
		try {
			final var	whereClause	= new StringJoiner(" ");

			whereClause.add("b.AccountGroupId = " + bill.getAccountGroupId());
			//			whereClause.add("AND b.CustomerType = 1");

			if(bill.getBillId() > 0)
				whereClause.add("AND b.BillId = " + bill.getBillId());
			else
				whereClause.add("AND b.BillNumber = '" + bill.getBillNumber() + "'");

			if(bill.getBranchId() > 0)
				whereClause.add("AND b.BranchId = " + bill.getBranchId());

			return whereClause.toString();
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private String queryStringForSuppBill(final BillDetailsForPrintingBill bill,final List<BillDetailsForPrintingBill> billDetailsArrList,
			final boolean isSupplementeryBill) throws Exception {
		try {
			final var	whereClause	= new StringJoiner(" ");

			whereClause.add("b.AccountGroupId = " + bill.getAccountGroupId());
			whereClause.add("AND b.CustomerType = 1");

			if(isSupplementeryBill) {
				final var	billIds				= billDetailsArrList.stream().map(a -> String.valueOf(a.getReferenceBillId())).collect(Collectors.joining(","));
				final var	billNumbers			= billDetailsArrList.stream().map(a -> String.valueOf(a.getReferenceBillNumber())).collect(Collectors.joining("','"));

				if(billIds != null && billIds.length() > 0)
					whereClause.add("AND b.BillId IN(" + billIds + ")");
				else
					whereClause.add("AND b.BillNumber IN('" + billNumbers + "')");
			} else {
				final var	refBillIds			= billDetailsArrList.stream().map(a -> String.valueOf(a.getBillId())).collect(Collectors.joining(","));
				final var	refBillNumbers		= billDetailsArrList.stream().map(a -> String.valueOf(a.getBillNumber())).collect(Collectors.joining("','"));

				whereClause.add("AND b.BillTypeId = 2");

				if(refBillIds != null && refBillIds.length() > 0)
					whereClause.add("AND b.ReferenceBillId IN(" + refBillIds + ")");
				else
					whereClause.add("AND b.ReferenceBillNumber IN('" + refBillNumbers + "')");
			}

			if(bill.getBranchId() > 0)
				whereClause.add("AND b.BranchId = " + bill.getBranchId());

			return whereClause.toString();
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private boolean paymentVoucherCancellation (final ExpenseVoucherDetails element,final ExecutiveFeildPermissionDTO execFeildPermission,final Executive executive,final Boolean isPaymentVoucherCancellationAllow) throws Exception {
		try {
			return element.getStatus() == ExpenseVoucherDetails.PAYMENT_VOUCHER_STATUS_BOOKED_ID
					&& execFeildPermission != null
					&& element.getBranchId() == executive.getBranchId()
					&& !element.isVoucherBilled() && isPaymentVoucherCancellationAllow
					&& element.getTruckHisabVoucherId() <= 0;
		} catch (final Exception e) {
			e.printStackTrace();
			throw e;
		}
	}

	private String getCrossingAgentBillDetailsByWhereClause(final long billId, final String billNumber, final long accountGroupId, final long branchId, final boolean isSupplierNo) throws Exception {
		try {
			final var	whereClause	= new StringJoiner(" AND ");

			if(billId > 0)
				whereClause.add("cab.CrossingAgentBillId = " + billId);
			else if(isSupplierNo)
				whereClause.add("cab.SupplierBillNo = '" + billNumber + "'");
			else
				whereClause.add("cab.BillNumber = '" + billNumber +"'");

			whereClause.add("cab.AccountGroupId = " + accountGroupId);
			whereClause.add("cab.BranchId = " + branchId);

			return whereClause.toString();
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private boolean isAllowToEditVehicleNumber(final DispatchLedger dispatchLedger, final Map<Object, Object> lsPropertyConfig, final boolean allowLockingEditForVehicleNo, final Executive executive) {
		try {
			var isEditVehicleNumber = (boolean) lsPropertyConfig.getOrDefault(LoadingSheetPropertyConstant.ALLOW_EDIT_VEHICLE, false) && dispatchLedger.getVehicleNumber() != null
					&& dispatchLedger.getBlhpvId() <= 0
					&& dispatchLedger.getStatus() != DispatchLedgerConstant.DISPATCHLEDGER_WAYBILL_STATUS_RECEIVED && dispatchLedger.getStatus() != DispatchLedgerConstant.DISPATCHLEDGER_WAYBILL_STATUS_CANCELLED
					&& (dispatchLedger.getLhpvId() <= 0 || !LHPVDaoImpl.getInstance().anyLSReceivedWithInLHPV(Long.toString(dispatchLedger.getLhpvId())));

			if(allowLockingEditForVehicleNo && dispatchLedger.getLhpvId() > 0) {
				final var lsIds 		= LHPVDaoImpl.getInstance().getLSOfLHPVByLHPVId(dispatchLedger.getLhpvId(), executive.getAccountGroupId());
				final var lsIdsList 	= CollectionUtility.getLongListFromString(lsIds);

				if(lsIdsList.size() > 1)
					isEditVehicleNumber	= false;
			}

			return isEditVehicleNumber;
		} catch (final Exception e) {
			return false;
		}
	}

	private boolean isAllowToEditLSDestination(final DispatchLedger dispatchLedger, final Map<Object, Object> lsPropertyConfig, final HashMap<?, ?> execFldPermissions, final Executive executive) {
		return (boolean) lsPropertyConfig.getOrDefault(LoadingSheetPropertyConstant.ALLOW_EDIT_LS_DESTINATION, true)
				&& (execFldPermissions.get(FeildPermissionsConstant.EDIT_LS_DESTINATION) != null && executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN
				|| executive.getBranchId() == dispatchLedger.getLsBranchId());
	}

	private boolean isAllowToEditManualLSNumber(final DispatchLedger dispatchLedger, final Branch lsBranch, final HashMap<?, ?> execFldPermissions, final Executive executive) {
		return execFldPermissions.get(FeildPermissionsConstant.EDIT_MANUAL_LS_NUMBER) != null && dispatchLedger.isManual()
				&& (executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN
				|| lsBranch.getRegionId() == executive.getRegionId() && executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_REGIONADMIN
				|| lsBranch.getSubRegionId() == executive.getSubRegionId() && executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_SUBREGIONADMIN
				|| executive.getBranchId() == dispatchLedger.getLsBranchId());
	}

	private void checkStatusWiseLSCancellation(final DispatchLedger dispatchLedger) {
		try {
			final Map<Long, DispatchArticleDetails[]>	dispatchArticlDetailsArrayHM 	= DispatchArticleDetailsDao.getInstance().getDispatchArticleDetailsByDispatchLegerId(dispatchLedger.getDispatchLedgerId());
			final var	waybillIdWiseStatusHM = DispatchSummaryDaoImpl.getInstance().getStatusByDispatchLedgerId(dispatchLedger.getDispatchLedgerId());

			if(ObjectUtils.isNotEmpty(waybillIdWiseStatusHM))
				waybillIdWiseStatusHM.entrySet().forEach((final Map.Entry<Long, String> entry) -> {
					final var 	allStatus 				= entry.getValue();
					final var 	receivedSummaryStatus 	= Short.parseShort(allStatus.split("_")[0]);
					final var 	lsStatus				= Short.parseShort(allStatus.split("_")[1]);
					final var 	totalQantity			= Long.parseLong(allStatus.split("_")[2]);

					if(dispatchArticlDetailsArrayHM != null && dispatchArticlDetailsArrayHM.containsKey(entry.getKey())) {
						final var dispatchArticleDetailsArray = dispatchArticlDetailsArrayHM.get(entry.getKey());

						final var dispatchedQuantity	= Stream.of(dispatchArticleDetailsArray).map(DispatchArticleDetails::getQuantity).mapToLong(Long::longValue).sum();

						dispatchLedger.setLSCancelAllow(totalQantity == dispatchedQuantity);
					}

					if(lsStatus == DispatchLedgerConstant.DISPATCHLEDGER_WAYBILL_STATUS_CANCELLED || receivedSummaryStatus == WayBillStatusConstant.WAYBILL_STATUS_RECEIVED)
						dispatchLedger.setLSCancelAllow(false);
				});
		} catch (final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private void setWayBillDetails(final List<WayBillViewModel>	wayBillViewModelList, final WayBill[] waybillArray, final String wayBillIdsStr, final ValueObject branchesColl) throws Exception {
		try {
			final Map<Long, CustomerDetails>	consignorList	= CustomerDetailsDao.getInstance().getConsignorDetailsByWayBillId(wayBillIdsStr);
			final Map<Long, CustomerDetails>	consigneeList	= CustomerDetailsDao.getInstance().getConsigneeDetailsByWayBillId(wayBillIdsStr);
			final Map<Long, ConsignmentSummary>	summaryList		= ConsignmentSummaryDao.getInstance().getLimitedConsignmentDetails(wayBillIdsStr);

			final var waybillList 		= Arrays.asList(waybillArray);

			for(final WayBill wayBill : waybillList) {
				final var wayBillViewModel = new WayBillViewModel();

				final var	srcBranch	= (Branch) branchesColl.get(Long.toString(wayBill.getSourceBranchId()));
				final var	destBranch	= (Branch) branchesColl.get(Long.toString(wayBill.getDestinationBranchId()));

				wayBillViewModel.setWayBillId(wayBill.getWayBillId());
				wayBillViewModel.setWayBillNumber(wayBill.getWayBillNumber());
				wayBillViewModel.setBookingDateTimeStr(DateTimeUtility.getDateFromTimeStampWithAMPM(wayBill.getBookingDateTime()));
				wayBillViewModel.setSourceBranchId(wayBill.getSourceBranchId());
				wayBillViewModel.setSourceBranch(srcBranch.getName());
				wayBillViewModel.setDestinationBranchId(wayBill.getDestinationBranchId());
				wayBillViewModel.setDestinationBranch(destBranch.getName());
				wayBillViewModel.setWayBillType(WayBillTypeConstant.getWayBillTypeNameByWayBilTypeId(wayBill.getWayBillTypeId()));
				wayBillViewModel.setGrandTotal(wayBill.getGrandTotal());
				wayBillViewModel.setWayBillStatusName(WayBillStatusConstant.getStatus(wayBill.getStatus()));

				if(consignorList != null) {
					final var consignor = consignorList.get(wayBill.getWayBillId());

					if(consignor != null) {
						wayBillViewModel.setConsignerName(consignor.getName());
						wayBillViewModel.setConsignerPhoneNo(consignor.getPhoneNumber());
					}
				}

				if(consigneeList != null) {
					final var consignee = consigneeList.get(wayBill.getWayBillId());

					if(consignee != null) {
						wayBillViewModel.setConsigneeName(consignee.getName());
						wayBillViewModel.setConsigneePhoneNo(consignee.getPhoneNumber());
					}
				}

				if(summaryList != null) {
					final var summary = summaryList.get(wayBill.getWayBillId());

					if(summary != null) {
						wayBillViewModel.setNoOfPkgs(summary.getQuantity());
						wayBillViewModel.setActualWeight(summary.getActualWeight());
					}
				}

				wayBillViewModelList.add(wayBillViewModel);
			}
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private void setFTBranchNames(FundTransfer ft, ValueObject branchesColl) throws Exception {
		ft.setFromBranchName(getBranchName(branchesColl, ft.getFromBranchId()));
		ft.setToBranchName(getBranchName(branchesColl, ft.getToBranchId()));
		ft.setCancelByBranchName(getBranchName(branchesColl, ft.getCancelByBranchId()));
	}

	private String getBranchName(ValueObject branchesColl, long branchId) throws Exception {
		if (branchId > 0) {
			final var branch = (Branch) branchesColl.get(Long.toString(branchId));
			return branch != null ? branch.getName() : "--";
		}

		return "--";
	}

	private void setOtherTransferDetails(FundTransfer ft) {
		ft.setStatusString(FundTransferTypeConstant.getFundTransferStatusString(ft.getStatus()));

		if(ft.getFundTransferApprovalStatus() != null && ft.getFundTransferApprovalStatus() == FundTransferApprove.FUND_TRANSFER_APPROVAL_STATUS_REJECT)
			ft.setStatusString(FundTransferTypeConstant.FUNDTRANSFER_NAME_REJECTED);

		ft.setChequeNumber(Utility.checkedNullCondition(ft.getChequeNumber(), (short) 1));
		ft.setChequeDateStr(DateTimeUtility.getDateFromTimeStamp(ft.getChequeDate()));
		ft.setDateTimeStampstr(ft.getHistoryDateTimeStamp() != null
				? DateTimeUtility.getDateFromTimeStamp(ft.getHistoryDateTimeStamp()) : DateTimeUtility.getDateFromTimeStamp(ft.getDateTimeStamp()));
		ft.setCancelDateTimeStampStr(DateTimeUtility.getDateFromTimeStamp(ft.getCancelDateTimeStamp()));
		ft.setTransferTypeName(FundTransferTypeConstant.getDetailedFundTransferType(ft.getTransferType()));
		ft.setPaymentModeName(PaymentTypeConstant.getPaymentType(ft.getPaymentMode()));
	}

	private void setFTCancellationDetails(FundTransfer ft) {
		final var cancellationDetails = new StringBuilder();

		if (ft.getExecutiveName() != null)
			cancellationDetails.append("By : ").append(ft.getExecutiveName());

		if (ft.getCancelByBranchName() != null)
			cancellationDetails.append(" In : ").append(ft.getCancelByBranchName());

		cancellationDetails.append(" Cancellation Date : ").append(ft.getCancelDateTimeStampStr());

		ft.setCancellationDetails(cancellationDetails.toString());
	}

	private boolean canCancelFundTransfer(FundTransfer ft, Executive executive, Map<?, ?> execFunctions) {
		final var isCancellableStatus =
				ft.getStatus() == FundTransferTypeConstant.FUNDTRANSFER_STATUS_TRANSFERING && ft.getTransferType() == FundTransferTypeConstant.FUND_TRANSFER_TYPE_BRANCH
				|| ft.getStatus() == FundTransferTypeConstant.FUNDTRANSFER_STATUS_RECEIVING && ft.getTransferType() == FundTransferTypeConstant.FUND_TRANSFER_TYPE_BANK;

		return execFunctions.containsKey(BusinessFunctionConstants.FUND_CANCEL) && isCancellableStatus && ft.getAccountGroupId() == executive.getAccountGroupId();
	}

	private boolean isPrintAllow(final Timestamp fromDate, long turPrintDaysRangeLimit, Executive executive, Branch branch, boolean turPrintPermission) throws Exception {
		final var today		= LocalDate.now();
		final var todayTs	= Timestamp.valueOf(today.atStartOfDay());

		final var daysBetween = DateTimeUtility.getDayDiffBetweenTwoDates(fromDate, todayTs);

		if (executive.getBranchId() != branch.getBranchId() && (executive.getExecutiveType() != ExecutiveTypeConstant.EXECUTIVE_TYPE_SUBREGIONADMIN || executive.getSubRegionId() != branch.getSubRegionId())
				&& (executive.getExecutiveType() != ExecutiveTypeConstant.EXECUTIVE_TYPE_REGIONADMIN || executive.getRegionId() != branch.getRegionId()) && executive.getExecutiveType() != ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN)
			return false;

		return daysBetween <= turPrintDaysRangeLimit || turPrintPermission;
	}
}