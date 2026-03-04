package com.ivcargo.reports;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.StringJoiner;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.ObjectUtils;
import org.apache.commons.lang3.StringUtils;

import com.businesslogic.CorporateAccountBLL;
import com.businesslogic.invoice.CreditorInvoiceBLL;
import com.businesslogic.waybill.LRViewScreenBLL;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.constant.properties.LrViewConfigurationPropertiesConstant;
import com.iv.constant.properties.invoice.CreditorInvoicePropertiesConstant;
import com.iv.dao.impl.DispatchLedgerDaoImpl;
import com.iv.dao.impl.master.CorporateAccountDaoImpl;
import com.iv.dao.impl.waybill.LRInvoiceDetailsDaoImpl;
import com.iv.dto.DispatchLedger;
import com.iv.dto.constant.ChargeTypeConstant;
import com.iv.dto.constant.CorporateAccountConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.dto.waybill.LRInvoiceDetails;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.constant.AccountGroupConstant;
import com.iv.utils.constant.Constant;
import com.iv.utils.constant.PodWayBillPropertiesConstant;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.utility.CollectionUtility;
import com.iv.utils.utility.ListFilterUtility;
import com.iv.utils.utility.SplitLRNumber;
import com.ivcargo.actionUtility.ActionInstanceUtil;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.ConsignmentDetailsDao;
import com.platform.dao.ConsignmentSummaryDao;
import com.platform.dao.CorporateAccountDao;
import com.platform.dao.CustomerDetailsDao;
import com.platform.dao.WayBillBookingChargesDao;
import com.platform.dao.WayBillDao;
import com.platform.dao.WayBillDeliveryChargesDao;
import com.platform.dao.WayBillExpenseDao;
import com.platform.dao.WayBillIncomeDao;
import com.platform.dao.reports.CreditWayBillPaymentDAO;
import com.platform.dao.reports.WayBillDetailsDAO;
import com.platform.dto.AliasNameConstants;
import com.platform.dto.Branch;
import com.platform.dto.ChargeTypeMaster;
import com.platform.dto.ConfigParam;
import com.platform.dto.ConsignmentDetails;
import com.platform.dto.CorporateAccount;
import com.platform.dto.TransportCommonMaster;
import com.platform.dto.WayBill;
import com.platform.dto.WayBillCharges;
import com.platform.dto.WayBillDetailsForGeneratingBill;
import com.platform.dto.WayBillIncome;
import com.platform.dto.WayBillTaxTxn;
import com.platform.dto.configuration.mindateselection.ModuleWiseMinDateSelectionConfigurationDTO;
import com.platform.dto.configuration.modules.GroupConfigurationPropertiesDTO;
import com.platform.dto.constant.BookingChargeConstant;
import com.platform.dto.constant.BookingTypeConstant;
import com.platform.dto.constant.DeliveryChargeConstant;
import com.platform.dto.constant.FeildPermissionsConstant;
import com.platform.dto.constant.InfoForDeliveryConstant;
import com.platform.dto.constant.PODStatusConstant;
import com.platform.dto.constant.WayBillStatusConstant;
import com.platform.dto.model.ChargeTypeModel;
import com.platform.dto.model.ReportViewModel;
import com.platform.dto.model.WayBillDeatailsModel;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

public class GetCreateBillDataAction implements Action {

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {

		HashMap<String,Object>	 				error 						= null;
		ValueObject								valueOutObject				= null;
		HashMap<Long,WayBillDeatailsModel>		wayBillDetailsForCharges	= null;
		String									branchIds					= null;
		CorporateAccount						billingPartyDetails			= null;
		var										isPodRequiredForInvoiceCreation	= false;
		var										isPodRequired					= false;
		var										isAdditionalRemarkAvailable		= false;
		var										taxAmount						= 0.0;
		var										isByTransportModeId				= false;
		ArrayList<CorporateAccount> 			creditorList					= null;
		CorporateAccount[] 						creditorDetails 				= null;
		var										isLrExpenseExists				= false;
		HashMap<Long, HashMap<Long, Double>>	deliveryChargeHM 				= null;
		var										matadiChargesApplicable			= false;
		short									taxTypeId						= -1;
		var										istaxTypeId						= false;
		String 									whereclause 					= null;
		Map<Long, DispatchLedger>				dispatchLedgerHm				= null;
		ArrayList<Double> 						bookingRateList			 		= null;

		try {
			error 				= ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeCreateBillAction().execute(request, response);

			final var 	creditorId 			= JSPUtility.GetLong(request, "CreditorId", 0);
			var	podStatus					= JSPUtility.GetShort(request, "podStatus", (short) 0);
			final var 	moduleId			= JSPUtility.GetShort(request, "moduleFilter", (short) 0);
			final var	cache 				= new CacheManip(request);
			final var	executive 			= cache.getExecutive(request);
			final var	sdf					= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			final var	fromDate			= new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00").getTime());
			final var	toDate				= new Timestamp(sdf.parse(JSPUtility.GetString(request, "toDate") + " 23:59:59").getTime());
			final var	amountFilter		= JSPUtility.GetShort(request, "amountFilter", (short) 0);
			final var	amount  			= JSPUtility.GetDouble(request, "enteredAmount", 0.0);
			final var	transportModeId  	= JSPUtility.GetShort(request, "transportModeId", (short)-1);
			final var	billSelectionId		= JSPUtility.GetShort(request, "billSelection", (short) 0);
			final var	divisionId			= JSPUtility.GetLong(request, "divisionSelection", 0);
			final var	actionUtil	 		= new ActionInstanceUtil();

			final var	valueObjectIn		= new ValueObject();
			final var	editLrSouceValObj	= new ValueObject();
			final var	wayBill				= new WayBill();
			final Map<Long, Map<Long, Double>>	chargesHM			= new HashMap<>();
			final Map<Long, Double>	chargesTotalHM		= new HashMap<>();
			final var	creditorInvoiceBLL	= CreditorInvoiceBLL.getInstance();

			final var	regions				= cache.getAllRegions(request);
			final var	subRegions			= cache.getAllSubRegions(request);
			final var	branches			= cache.getGenericBranchesDetail(request);
			final var	groupConfig			= cache.getGroupConfiguration(request, executive.getAccountGroupId());
			final var	accountGroup		= cache.getAccountGroupById(request, executive.getAccountGroupId());
			final var	configuration		= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.CREATE_INVOICE);
			final var	lrViewConfiguration	= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.LR_SEARCH);
			var			bookingChgs				= cache.getActiveBookingCharges(request, executive.getBranchId());
			final var	deliveryChgs			= cache.getActiveDeliveryCharges(request, executive.getBranchId());

			valueObjectIn.put(GroupConfigurationPropertiesDTO.GROUP_CONFIGURATION, groupConfig);
			valueObjectIn.put(AliasNameConstants.ALL_REGIONS, regions);
			valueObjectIn.put(AliasNameConstants.ALL_SUB_REGIONS, subRegions);
			valueObjectIn.put(AliasNameConstants.ALL_BRANCHES, branches);
			valueObjectIn.put(AliasNameConstants.ACCOUNT_GROUP, accountGroup);
			valueObjectIn.put("isCreditorParty", true);

			final var	taxTypeStrId	= JSPUtility.GetString(request, "taxTypeId", "-1");

			if(taxTypeStrId.contains("_"))
				taxTypeId		= Short.parseShort(taxTypeStrId.split("_")[0]);
			else
				taxTypeId  		= Short.parseShort(taxTypeStrId);

			final var	execFldPermissionsHM = cache.getExecutiveFieldPermission(request);
			final var transpotModeMap	= cache.getTransportationModeForGroup(request, executive.getAccountGroupId());

			final var	isSearchByDate 		= request.getParameter("searchByDate") != null;
			final var	searchByPodStatus 	= request.getParameter("searchByPodStatus") != null;
			final var	isSearchByAmount 	= request.getParameter("searchByAmount") != null;

			final var companyId = JSPUtility.GetShort(request, "companyId", (short) 0);

			if(transportModeId >= 0) {
				isByTransportModeId = true;
				request.setAttribute("transportModeId", transportModeId);
			}

			if(taxTypeId >= 0 ){
				istaxTypeId = true;
				request.setAttribute("taxTypeId", taxTypeId);
				request.setAttribute("taxTypeStrId", taxTypeStrId);
			}

			final var	minDateTimeStamp		= cache.getModuleWiseMinDateToGetData(request, executive.getAccountGroupId(),
					ModuleWiseMinDateSelectionConfigurationDTO.CREATE_CREDITOR_INVOICE_MIN_DATE_ALLOW,
					ModuleWiseMinDateSelectionConfigurationDTO.CREATE_CREDITOR_INVOICE_MIN_DATE);

			if(creditorId != 0) {
				final var	podConfiguration			= cache.getPODWayBillConfiguration(request, executive.getAccountGroupId());
				final var	isPodRequiredForGroup		= (boolean) podConfiguration.getOrDefault(PodWayBillPropertiesConstant.IS_POD_REQUIRED, false);
				final var	uploadPOD					= (boolean) podConfiguration.getOrDefault(PodWayBillPropertiesConstant.UPLOAD_POD, false);
				final var	receivePOD					= (boolean) podConfiguration.getOrDefault(PodWayBillPropertiesConstant.RECEIVE_POD, false);
				final var	isRegionWiseSelectionAllow	= (boolean) configuration.getOrDefault(CreditorInvoicePropertiesConstant.IS_REGION_WISE_SELECTION_ALLOW, false);
				final var	showEditDestinationColumn				= (boolean) configuration.getOrDefault(CreditorInvoicePropertiesConstant.SHOW_EDIT_DESTINATION_COLUMN, false);
				final var	showEditLrInvoiceNumberColumn			= (boolean) configuration.getOrDefault(CreditorInvoicePropertiesConstant.SHOW_EDIT_LR_INVOICE_NUMBER_COLUMN, false);
				final var	showEditTransportationModeColumn		= (boolean) configuration.getOrDefault(CreditorInvoicePropertiesConstant.SHOW_EDIT_TRANSPORTATION_MODE_COLUMN, false);
				final var	doNotCreateBillWithoutPartyGstNumber	= (boolean) configuration.getOrDefault(CreditorInvoicePropertiesConstant.DO_NOT_CREATE_BILL_WITH_OUT_PARTY_GST_NUMBER, false);
				final var	showBookingCharges						= (boolean) configuration.getOrDefault(CreditorInvoicePropertiesConstant.SHOW_BOOKING_CHARGES, false);
				final var	showDeliveryCharges						= (boolean) configuration.getOrDefault(CreditorInvoicePropertiesConstant.SHOW_DELIVERY_CHARGES, false);

				final var	isVlidateViewedLRExpense						= (boolean) configuration.getOrDefault(CreditorInvoicePropertiesConstant.ISVLIDATE_VIEWED_LR_EXPENSE,false);
				final var	showMatadiChargesColumn							= (boolean) configuration.getOrDefault(CreditorInvoicePropertiesConstant.SHOW_MATADI_CHARGES_COLUMN,false);
				final var	billingBranchWiseBillCreationAllowed			= (boolean) configuration.getOrDefault(CreditorInvoicePropertiesConstant.BILLING_BRANCH_WISE_BILL_CREATION_ALLOWED,false);
				final var	appendHandlingBranchWithSourceBranch			= (boolean) configuration.getOrDefault(CreditorInvoicePropertiesConstant.APPEND_HANDLING_BRANCH_WITH_SOURCE_BRANCH,false);
				var			checkPodUploadedOrNot							= (boolean) podConfiguration.getOrDefault(PodWayBillPropertiesConstant.VALIDATE_POD_UPLOADED_TO_CREATE_INVOICE, false);
				final var	bookingChargeIdsToDisplay						= (String) configuration.getOrDefault(CreditorInvoicePropertiesConstant.BOOKING_CHARGE_IDS_TO_DISPLAY,"0");
				final var	searchLROnBookingDateToCreateBill				= (boolean) configuration.getOrDefault(CreditorInvoicePropertiesConstant.SEARCH_LR_ON_BOOKING_DATE_TO_CREATE_BILL, false);
				final var	showPaymentDueDate								= (boolean) configuration.getOrDefault(CreditorInvoicePropertiesConstant.SHOW_PAYMENT_DUE_DATE, false);

				if(showBookingCharges && !"0".equals(bookingChargeIdsToDisplay)) {
					final var	branchListForCharges			= CollectionUtility.getLongListFromString(bookingChargeIdsToDisplay);

					final var	finalCharges = cache.getBookingChargesHm(request, executive);

					if(!branchListForCharges.isEmpty()) {
						bookingChgs	= new ChargeTypeModel[branchListForCharges.size()];

						for(var i = 0; i < branchListForCharges.size(); i++) {
							bookingChgs[i] = new ChargeTypeModel();
							bookingChgs[i].setChargeTypeMasterId(branchListForCharges.get(i));
							bookingChgs[i].setDisplayName(finalCharges.get(branchListForCharges.get(i)).getDisplayName());
						}

						bookingChgs = Arrays.stream(bookingChgs).sorted(Comparator.comparing(ChargeTypeModel::getChargeTypeMasterId)).toArray(ChargeTypeModel[]::new);
					}
				}

				if(doNotCreateBillWithoutPartyGstNumber) {
					final var	corporateAccount	= CorporateAccountDao.getInstance().findByPartyIdForMaster(creditorId);

					if(corporateAccount != null )
						request.setAttribute("PartyGSTNumber", corporateAccount.getGstn());
				}

				if(showPaymentDueDate) {
					final var	partyConfigurationMaster	= CorporateAccountDaoImpl.getInstance().getPartyConfigurationDetailsByPartyId(creditorId);

					if(partyConfigurationMaster != null && partyConfigurationMaster.getInvoiceDueDays() > 0)
						request.setAttribute("DueDate", DateTimeUtility.getDateAfterNoOfDays(partyConfigurationMaster.getInvoiceDueDays()));
				}

				if(isRegionWiseSelectionAllow) {
					final var	valObjSelection 	= actionUtil.reportSelection(request, executive);
					final var	regionId 			= (Long)valObjSelection.get("regionId");
					final var	subRegionId 		= (Long)valObjSelection.get("subRegionId");
					final var	branchId 			= (Long)valObjSelection.get("branchId");

					request.setAttribute(ActionStaticUtil.IS_ALL_AREA_NEED_TO_SHOW, true);
					request.setAttribute(ActionStaticUtil.IS_ALL_REGION_NEED_TO_SHOW, true);
					request.setAttribute(ActionStaticUtil.IS_ALL_BRANCHES_NEED_TO_SHOW, true);

					if(regionId == -1 && subRegionId == -1 && branchId == -1)
						branchIds = cache.getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_GROUP, 0);
					else if(regionId > 0 && subRegionId == -1)
						branchIds = cache.getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_REGION, regionId);
					else if(subRegionId > 0 && branchId == -1)
						branchIds = cache.getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_SUBREGION, subRegionId);
					else if(branchId > 0)
						branchIds = Long.toString(branchId);
					else
						branchIds		= cache.getBranchIdsByExecutiveType(request, executive);

					creditorList	= CreditWayBillPaymentDAO.getInstance().getCreditorDetails(executive.getAccountGroupId(), branchIds);
					creditorDetails	= CorporateAccountBLL.getInstance().getPartyListByPartyIdentifiers(creditorList, valueObjectIn);

				} else
					branchIds		= cache.getBranchIdsByExecutiveType(request, executive);

				if(isPodRequiredForGroup || showMatadiChargesColumn) {
					billingPartyDetails				= CorporateAccountDao.getInstance().findByCorporateAccountId(creditorId);
					isPodRequired					= billingPartyDetails.isPodRequired();
					isPodRequiredForInvoiceCreation	= billingPartyDetails.isPodRequiredForInvoiceCreation();
					matadiChargesApplicable			= billingPartyDetails.isMatadiChargesApplicable();
				}

				request.setAttribute(CreditorInvoicePropertiesConstant.IS_BOOKING_DATE_SHOW, configuration.getOrDefault(CreditorInvoicePropertiesConstant.IS_BOOKING_DATE_SHOW, false));
				request.setAttribute(CreditorInvoicePropertiesConstant.SHOW_ADDITIONAL_REMARK_COLUMN, (boolean) configuration.getOrDefault(CreditorInvoicePropertiesConstant.SHOW_ADDITIONAL_REMARK_COLUMN,false));
				request.setAttribute(CreditorInvoicePropertiesConstant.IS_DELIVERY_DATE_SHOW, configuration.getOrDefault(CreditorInvoicePropertiesConstant.IS_DELIVERY_DATE_SHOW, false));

				final var isWhereClause = searchLROnBookingDateToCreateBill || executive.getAccountGroupId() >= AccountGroupConstant.ACCOUNT_GROUP_ID_VTIPL || divisionId > 0;

				if((boolean) configuration.getOrDefault(CreditorInvoicePropertiesConstant.SHOW_CREDITOR_DETAILS_BY_BILLING_PARTY_BRANCH_MAP, false))
					branchIds = cache.getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_GROUP, 0);

				if(billingBranchWiseBillCreationAllowed && !isWhereClause) {
					if(isSearchByDate && searchByPodStatus && isSearchByAmount && isByTransportModeId) {
						if(podStatus == -1 && amount >= 0 && amountFilter > 0 && transportModeId == 0)
							valueOutObject = CreditWayBillPaymentDAO.getInstance().getWayBillDetailsOfPODAndAmountForGeneratingBillInDateRangeAndBillingBranchWise(creditorId, branchIds, fromDate, toDate, amount, amountFilter, executive.getAccountGroupId());
						else if(podStatus == -1 && amount >= 0 && amountFilter > 0 && transportModeId > 0)
							valueOutObject = CreditWayBillPaymentDAO.getInstance().getWayBillDetailsOfPODAndAmountAndTransportationModeForGeneratingBillInDateRangeAndBillingBranchWise(creditorId, branchIds, fromDate, toDate, amount, amountFilter, executive.getAccountGroupId(),transportModeId);
						else {
							podStatus		= (short) (podStatus == PODStatusConstant.POD_STATUS_RECEIVED_YES_ID || podStatus == PODStatusConstant.POD_STATUS_UPLOADED_YES_ID ? 1 : 0);

							if(uploadPOD && amount >= 0 && amountFilter > 0 && transportModeId > 0)
								valueOutObject	= CreditWayBillPaymentDAO.getInstance().getWayBillDetailsOfPODUploadedAndAmountAndTransportModeForGeneratingBillInDateRangeAndBillingBranchWise(creditorId, branchIds, fromDate, toDate, podStatus, amount, amountFilter, executive.getAccountGroupId(),transportModeId);
							else if(receivePOD && amount >= 0 && amountFilter >  0 && transportModeId > 0)
								valueOutObject	= CreditWayBillPaymentDAO.getInstance().getWayBillDetailsOfPODReceivedAndAmountAndTransportModeForGeneratingBillInDateRangeAndBillingBranchWise(creditorId, branchIds, fromDate, toDate, podStatus, amount, amountFilter, executive.getAccountGroupId(),transportModeId);
							else if(uploadPOD && amount >= 0 && amountFilter > 0 && transportModeId == 0)
								valueOutObject	= CreditWayBillPaymentDAO.getInstance().getWayBillDetailsOfPODUploadedAndAmountForGeneratingBillInDateRangeAndBillingBranchWise(creditorId, branchIds, fromDate, toDate, podStatus, amount, amountFilter, executive.getAccountGroupId());
							else if(receivePOD && amount >= 0 && amountFilter > 0 && transportModeId == 0)
								valueOutObject	= CreditWayBillPaymentDAO.getInstance().getWayBillDetailsOfPODReceivedAndAmountForGeneratingBillInDateRangeAndBillingBranchWise(creditorId, branchIds, fromDate, toDate, podStatus, amount, amountFilter, executive.getAccountGroupId());

						}
					}else if(searchByPodStatus && isSearchByAmount   && isByTransportModeId && !isSearchByDate){
						if(podStatus == -1 && amount >= 0 && amountFilter > 0 && transportModeId == 0)
							valueOutObject = CreditWayBillPaymentDAO.getInstance().getWayBillDetailsOfPODAndAmountForGeneratingBillAndBillingBranchWise(creditorId, branchIds, amount, amountFilter, executive.getAccountGroupId());
						else if(podStatus == -1 && amount >= 0 && amountFilter > 0 && transportModeId > 0)
							valueOutObject = CreditWayBillPaymentDAO.getInstance().getWayBillDetailsOfPODAndAmountAndTransportationModeForGeneratingBillAndBillingBranchWise(creditorId, branchIds, amount, amountFilter, executive.getAccountGroupId(),transportModeId);
						else {
							podStatus		= (short) (podStatus == PODStatusConstant.POD_STATUS_RECEIVED_YES_ID || podStatus == PODStatusConstant.POD_STATUS_UPLOADED_YES_ID ? 1 : 0);

							if(uploadPOD && amount >= 0 && amountFilter > 0 && transportModeId > 0)
								valueOutObject	= CreditWayBillPaymentDAO.getInstance().getWayBillDetailsOfPODUploadedAndAmountAndTransportModeForGeneratingBillAndBillingBranchWise(creditorId, branchIds, podStatus, amount, amountFilter, executive.getAccountGroupId(),transportModeId);
							else if(receivePOD && amount >= 0 && amountFilter > 0 && transportModeId > 0)
								valueOutObject	= CreditWayBillPaymentDAO.getInstance().getWayBillDetailsOfPODReceivedAndAmountAndTransportModeForGeneratingBillAndBillingBranchWise(creditorId, branchIds, podStatus, amount, amountFilter, executive.getAccountGroupId(),transportModeId);
							else if(uploadPOD && amount >= 0 && amountFilter == 0)
								valueOutObject	= CreditWayBillPaymentDAO.getInstance().getWayBillDetailsOfPODUploadedAndAmountForGeneratingBillAndBillingBranchWise(creditorId, branchIds, podStatus, amount, amountFilter, executive.getAccountGroupId());
							else if(receivePOD && amount >= 0 && amountFilter == 0)
								valueOutObject	= CreditWayBillPaymentDAO.getInstance().getWayBillDetailsOfPODReceivedAndAmountForGeneratingBillAndBillingBranchWise(creditorId, branchIds, podStatus, amount, amountFilter, executive.getAccountGroupId());
						}

					}else if(isSearchByDate    && isSearchByAmount   && isByTransportModeId && !searchByPodStatus){
						if(amount >= 0 && amountFilter > 0 && transportModeId == 0)
							valueOutObject = CreditWayBillPaymentDAO.getInstance().getWayBillDetailsOfAmountForGeneratingBillInDateRangeAndBillingBranchWise(creditorId, branchIds, fromDate, toDate, amount, amountFilter, executive.getAccountGroupId());
						else
							valueOutObject = CreditWayBillPaymentDAO.getInstance().getWayBillDetailsByAmountAndTransportModeAndDateRangeForGeneratingBillAndBillingBranchWise(creditorId, branchIds, fromDate, toDate, amount, amountFilter, executive.getAccountGroupId(),transportModeId);
					}else if(isSearchByDate    && searchByPodStatus  && isByTransportModeId && !isSearchByAmount){
						if(podStatus == -1 && transportModeId== 0 )
							valueOutObject		= CreditWayBillPaymentDAO.getInstance().getWayBillDetailsOfPODForGeneratingBillInDateRangeAndBillingBranchWise(creditorId, branchIds, fromDate, toDate, executive.getAccountGroupId());
						if(podStatus == -1 && transportModeId > 0)
							valueOutObject		= CreditWayBillPaymentDAO.getInstance().getWayBillDetailsOfPODAndTransportModeForGeneratingBillInDateRangeAndBillingBranchWise(creditorId, branchIds, fromDate, toDate, executive.getAccountGroupId(),transportModeId);
						else {
							podStatus		= (short) (podStatus == PODStatusConstant.POD_STATUS_RECEIVED_YES_ID || podStatus == PODStatusConstant.POD_STATUS_UPLOADED_YES_ID ? 1 : 0);

							if(uploadPOD && transportModeId > 0)
								valueOutObject	= CreditWayBillPaymentDAO.getInstance().getWayBillDetailsOfPODAndTransportModeUploadedForGeneratingBillInDateRangeAndBillingBranchWise(creditorId, branchIds, fromDate, toDate, podStatus, executive.getAccountGroupId(),transportModeId);
							else if(receivePOD && transportModeId > 0)
								valueOutObject	= CreditWayBillPaymentDAO.getInstance().getWayBillDetailsOfPODAndTransportModeReceivedForGeneratingBillInDateRangeAndBillingBranchWise(creditorId, branchIds, fromDate, toDate, podStatus, executive.getAccountGroupId(),transportModeId);
							else if(uploadPOD &&  transportModeId == 0)
								valueOutObject	= CreditWayBillPaymentDAO.getInstance().getWayBillDetailsOfPODUploadedForGeneratingBillInDateRangeAndBillingBranchWise(creditorId, branchIds, fromDate, toDate, podStatus, executive.getAccountGroupId());
							else if(receivePOD && transportModeId == 0)
								valueOutObject	= CreditWayBillPaymentDAO.getInstance().getWayBillDetailsOfPODReceivedForGeneratingBillInDateRangeAndBillingBranchWise(creditorId, branchIds, fromDate, toDate, podStatus, executive.getAccountGroupId());
						}
					}else if(isSearchByAmount && isByTransportModeId && !isSearchByDate && !searchByPodStatus){
						if(amount >= 0 && amountFilter > 0 && transportModeId == 0)
							valueOutObject = CreditWayBillPaymentDAO.getInstance().getWayBillDetailsOfAmountForGeneratingBillInDateRangeAndBillingBranchWise(creditorId, branchIds, fromDate, toDate, amount, amountFilter, executive.getAccountGroupId());
						else
							valueOutObject = CreditWayBillPaymentDAO.getInstance().getWayBillDetailsOfAmountAndTransportModeForGeneratingBillAndBillingBranchWise(creditorId, branchIds, amount, amountFilter, executive.getAccountGroupId(),transportModeId);

					}else if(isSearchByDate && isByTransportModeId && !isSearchByAmount && !searchByPodStatus){
						if(transportModeId == 0)
							valueOutObject 	= CreditWayBillPaymentDAO.getInstance().getWayBillDetailsForGeneratingBillInDateRangeAndBillingBranchWise(creditorId ,branchIds, fromDate, toDate, executive.getAccountGroupId());
						else
							valueOutObject 	= CreditWayBillPaymentDAO.getInstance().getWayBillDetailsByDateRangeAndTransportModeForGeneratingBillAndBillingBranchWise(creditorId ,branchIds, fromDate, toDate, executive.getAccountGroupId(),transportModeId);
					}else if(searchByPodStatus && isByTransportModeId && !isSearchByAmount && !isSearchByDate){
						if(podStatus == -1 && transportModeId == 0)
							valueOutObject		= CreditWayBillPaymentDAO.getInstance().getWayBillDetailsOfPODForGeneratingBillAndBillingBranchWise(creditorId, branchIds, executive.getAccountGroupId());
						else if(podStatus == -1 && transportModeId > 0)
							valueOutObject		= CreditWayBillPaymentDAO.getInstance().getWayBillDetailsOfPODAndTransportModeForGeneratingBillAndBillingBranchWise(creditorId, branchIds, executive.getAccountGroupId(),transportModeId);
						else{
							podStatus		= (short) (podStatus == PODStatusConstant.POD_STATUS_RECEIVED_YES_ID || podStatus == PODStatusConstant.POD_STATUS_UPLOADED_YES_ID ? 1 : 0);

							if(uploadPOD && transportModeId > 0)
								valueOutObject	= CreditWayBillPaymentDAO.getInstance().getWayBillDetailsOfPODUploadedAndTransportModeForGeneratingBillAndBillingBranchWise(creditorId, branchIds, podStatus, executive.getAccountGroupId(),transportModeId);
							else if(receivePOD && transportModeId > 0 )
								valueOutObject	= CreditWayBillPaymentDAO.getInstance().getWayBillDetailsOfPODReceivedAndTransportModeForGeneratingBillAndBillingBranchWise(creditorId, branchIds, podStatus, executive.getAccountGroupId(),transportModeId);
							else if(uploadPOD && transportModeId == 0)
								valueOutObject	= CreditWayBillPaymentDAO.getInstance().getWayBillDetailsOfPODUploadedForGeneratingBillAndBillingBranchWise(creditorId, branchIds, podStatus, executive.getAccountGroupId());
							else if(receivePOD && transportModeId == 0)
								valueOutObject	= CreditWayBillPaymentDAO.getInstance().getWayBillDetailsOfPODReceivedForGeneratingBillAndBillingBranchWise(creditorId, branchIds, podStatus, executive.getAccountGroupId());
						}
					}else if(isSearchByDate && searchByPodStatus && isSearchByAmount) {
						if(podStatus == -1 && amount >= 0 && amountFilter > 0)
							valueOutObject = CreditWayBillPaymentDAO.getInstance().getWayBillDetailsOfPODAndAmountForGeneratingBillInDateRangeAndBillingBranchWise(creditorId, branchIds, fromDate, toDate, amount, amountFilter, executive.getAccountGroupId());
						else {
							podStatus		= (short) (podStatus == PODStatusConstant.POD_STATUS_RECEIVED_YES_ID || podStatus == PODStatusConstant.POD_STATUS_UPLOADED_YES_ID ? 1 : 0);

							if(uploadPOD && amount >= 0 && amountFilter > 0)
								valueOutObject	= CreditWayBillPaymentDAO.getInstance().getWayBillDetailsOfPODUploadedAndAmountForGeneratingBillInDateRangeAndBillingBranchWise(creditorId, branchIds, fromDate, toDate, podStatus, amount, amountFilter, executive.getAccountGroupId());
							else if(receivePOD && amount >= 0 && amountFilter > 0)
								valueOutObject	= CreditWayBillPaymentDAO.getInstance().getWayBillDetailsOfPODReceivedAndAmountForGeneratingBillInDateRangeAndBillingBranchWise(creditorId, branchIds, fromDate, toDate, podStatus, amount, amountFilter, executive.getAccountGroupId());
						}
					}else if(isSearchByDate && searchByPodStatus && !isSearchByAmount) {
						if(podStatus == -1)
							valueOutObject		= CreditWayBillPaymentDAO.getInstance().getWayBillDetailsOfPODForGeneratingBillInDateRangeAndBillingBranchWise(creditorId, branchIds, fromDate, toDate, executive.getAccountGroupId());
						else {
							podStatus		= (short) (podStatus == PODStatusConstant.POD_STATUS_RECEIVED_YES_ID || podStatus == PODStatusConstant.POD_STATUS_UPLOADED_YES_ID ? 1 : 0);

							if(uploadPOD)
								valueOutObject	= CreditWayBillPaymentDAO.getInstance().getWayBillDetailsOfPODUploadedForGeneratingBillInDateRangeAndBillingBranchWise(creditorId, branchIds, fromDate, toDate, podStatus, executive.getAccountGroupId());
							else if(receivePOD)
								valueOutObject	= CreditWayBillPaymentDAO.getInstance().getWayBillDetailsOfPODReceivedForGeneratingBillInDateRangeAndBillingBranchWise(creditorId, branchIds, fromDate, toDate, podStatus, executive.getAccountGroupId());
						}
					} else if(!isSearchByDate && searchByPodStatus && isSearchByAmount){
						if(podStatus == -1 && amount >= 0 && amountFilter > 0)
							valueOutObject = CreditWayBillPaymentDAO.getInstance().getWayBillDetailsOfPODAndAmountForGeneratingBillAndBillingBranchWise(creditorId, branchIds, amount, amountFilter, executive.getAccountGroupId());
						else {
							podStatus		= (short) (podStatus == PODStatusConstant.POD_STATUS_RECEIVED_YES_ID || podStatus == PODStatusConstant.POD_STATUS_UPLOADED_YES_ID ? 1 : 0);

							if(uploadPOD && amount >= 0 && amountFilter > 0)
								valueOutObject	= CreditWayBillPaymentDAO.getInstance().getWayBillDetailsOfPODUploadedAndAmountForGeneratingBillAndBillingBranchWise(creditorId, branchIds, podStatus, amount, amountFilter, executive.getAccountGroupId());
							else if(receivePOD && amount >= 0 && amountFilter > 0)
								valueOutObject	= CreditWayBillPaymentDAO.getInstance().getWayBillDetailsOfPODReceivedAndAmountForGeneratingBillAndBillingBranchWise(creditorId, branchIds, podStatus, amount, amountFilter, executive.getAccountGroupId());
						}
					} else if(isSearchByDate && isSearchByAmount && !searchByPodStatus){
						if(amount >= 0 && amountFilter > 0)
							valueOutObject = CreditWayBillPaymentDAO.getInstance().getWayBillDetailsOfAmountForGeneratingBillInDateRangeAndBillingBranchWise(creditorId, branchIds, fromDate, toDate, amount, amountFilter, executive.getAccountGroupId());
					} else if(isSearchByAmount) {
						if(amount >= 0 && amountFilter > 0)
							valueOutObject = CreditWayBillPaymentDAO.getInstance().getWayBillDetailsOfAmountForGeneratingBillAndBillingBranchWise(creditorId, branchIds, amount, amountFilter, executive.getAccountGroupId());
					} else if(isSearchByDate)
						valueOutObject 	= CreditWayBillPaymentDAO.getInstance().getWayBillDetailsForGeneratingBillInDateRangeAndBillingBranchWise(creditorId ,branchIds, fromDate, toDate, executive.getAccountGroupId());
					else if(searchByPodStatus) {
						if(podStatus == -1)
							valueOutObject		= CreditWayBillPaymentDAO.getInstance().getWayBillDetailsOfPODForGeneratingBillAndBillingBranchWise(creditorId, branchIds, executive.getAccountGroupId());
						else {
							podStatus		= (short) (podStatus == PODStatusConstant.POD_STATUS_RECEIVED_YES_ID || podStatus == PODStatusConstant.POD_STATUS_UPLOADED_YES_ID ? 1 : 0);

							if(uploadPOD)
								valueOutObject	= CreditWayBillPaymentDAO.getInstance().getWayBillDetailsOfPODUploadedForGeneratingBillAndBillingBranchWise(creditorId, branchIds, podStatus, executive.getAccountGroupId());
							else if(receivePOD)
								valueOutObject	= CreditWayBillPaymentDAO.getInstance().getWayBillDetailsOfPODReceivedForGeneratingBillAndBillingBranchWise(creditorId, branchIds, podStatus, executive.getAccountGroupId());
						}
					} else if(isByTransportModeId){
						if(transportModeId > 0)
							valueOutObject	= CreditWayBillPaymentDAO.getInstance().getGetWayBillDetailsForGeneratingBillByTransportationModeAndBillingBranchWise(creditorId, branchIds,executive.getAccountGroupId(),transportModeId);
						else
							valueOutObject = CreditWayBillPaymentDAO.getInstance().getWayBillDetailsForGeneratingBillAndBillingBranchWise(creditorId, branchIds, executive.getAccountGroupId());

					} else if(minDateTimeStamp != null)
						valueOutObject = CreditWayBillPaymentDAO.getInstance().getWayBillDetailsForGeneratingBillFromMinDateAndBillingBranchWise(creditorId, branchIds, executive.getAccountGroupId(), minDateTimeStamp);
					else
						valueOutObject = CreditWayBillPaymentDAO.getInstance().getWayBillDetailsForGeneratingBillAndBillingBranchWise(creditorId, branchIds, executive.getAccountGroupId());

				} else if(!isWhereClause && isSearchByDate && searchByPodStatus && isSearchByAmount && isByTransportModeId) {
					if(podStatus == -1 && amount >= 0 && amountFilter > 0 && transportModeId == 0)
						valueOutObject = CreditWayBillPaymentDAO.getInstance().getWayBillDetailsOfPODAndAmountForGeneratingBillInDateRange(creditorId, branchIds, fromDate, toDate, amount, amountFilter, executive.getAccountGroupId());
					else if(podStatus == -1 && amount >= 0 && amountFilter > 0 && transportModeId > 0)
						valueOutObject = CreditWayBillPaymentDAO.getInstance().getWayBillDetailsOfPODAndAmountAndTransportationModeForGeneratingBillInDateRange(creditorId, branchIds, fromDate, toDate, amount, amountFilter, executive.getAccountGroupId(),transportModeId);
					else {
						podStatus		= (short) (podStatus == PODStatusConstant.POD_STATUS_RECEIVED_YES_ID || podStatus == PODStatusConstant.POD_STATUS_UPLOADED_YES_ID ? 1 : 0);

						if(uploadPOD && amount >= 0 && amountFilter > 0 && transportModeId > 0)
							valueOutObject	= CreditWayBillPaymentDAO.getInstance().getWayBillDetailsOfPODUploadedAndAmountAndTransportModeForGeneratingBillInDateRange(creditorId, branchIds, fromDate, toDate, podStatus, amount, amountFilter, executive.getAccountGroupId(),transportModeId);
						else if(receivePOD && amount >= 0 && amountFilter >  0 && transportModeId > 0)
							valueOutObject	= CreditWayBillPaymentDAO.getInstance().getWayBillDetailsOfPODReceivedAndAmountAndTransportModeForGeneratingBillInDateRange(creditorId, branchIds, fromDate, toDate, podStatus, amount, amountFilter, executive.getAccountGroupId(),transportModeId);
						else if(uploadPOD && amount >= 0 && amountFilter > 0 && transportModeId == 0)
							valueOutObject	= CreditWayBillPaymentDAO.getInstance().getWayBillDetailsOfPODUploadedAndAmountForGeneratingBillInDateRange(creditorId, branchIds, fromDate, toDate, podStatus, amount, amountFilter, executive.getAccountGroupId());
						else if(receivePOD && amount >= 0 && amountFilter > 0 && transportModeId == 0)
							valueOutObject	= CreditWayBillPaymentDAO.getInstance().getWayBillDetailsOfPODReceivedAndAmountForGeneratingBillInDateRange(creditorId, branchIds, fromDate, toDate, podStatus, amount, amountFilter, executive.getAccountGroupId());
					}
				}else if(!isWhereClause && searchByPodStatus && isSearchByAmount   && isByTransportModeId && !isSearchByDate){
					if(podStatus == -1 && amount >= 0 && amountFilter > 0 && transportModeId == 0)
						valueOutObject = CreditWayBillPaymentDAO.getInstance().getWayBillDetailsOfPODAndAmountForGeneratingBill(creditorId, branchIds, amount, amountFilter, executive.getAccountGroupId());
					else if(podStatus == -1 && amount >= 0 && amountFilter > 0 && transportModeId > 0)
						valueOutObject = CreditWayBillPaymentDAO.getInstance().getWayBillDetailsOfPODAndAmountAndTransportationModeForGeneratingBill(creditorId, branchIds, amount, amountFilter, executive.getAccountGroupId(),transportModeId);
					else {
						podStatus		= (short) (podStatus == PODStatusConstant.POD_STATUS_RECEIVED_YES_ID || podStatus == PODStatusConstant.POD_STATUS_UPLOADED_YES_ID ? 1 : 0);

						if(uploadPOD && amount >= 0 && amountFilter > 0 && transportModeId > 0)
							valueOutObject	= CreditWayBillPaymentDAO.getInstance().getWayBillDetailsOfPODUploadedAndAmountAndTransportModeForGeneratingBill(creditorId, branchIds, podStatus, amount, amountFilter, executive.getAccountGroupId(),transportModeId);
						else if(receivePOD && amount >= 0 && amountFilter > 0 && transportModeId > 0)
							valueOutObject	= CreditWayBillPaymentDAO.getInstance().getWayBillDetailsOfPODReceivedAndAmountAndTransportModeForGeneratingBill(creditorId, branchIds, podStatus, amount, amountFilter, executive.getAccountGroupId(),transportModeId);
						else if(uploadPOD && amount >= 0 && amountFilter == 0)
							valueOutObject	= CreditWayBillPaymentDAO.getInstance().getWayBillDetailsOfPODUploadedAndAmountForGeneratingBill(creditorId, branchIds, podStatus, amount, amountFilter, executive.getAccountGroupId());
						else if(receivePOD && amount >= 0 && amountFilter == 0)
							valueOutObject	= CreditWayBillPaymentDAO.getInstance().getWayBillDetailsOfPODReceivedAndAmountForGeneratingBill(creditorId, branchIds, podStatus, amount, amountFilter, executive.getAccountGroupId());
					}
				} else if(!isWhereClause && isSearchByDate    && isSearchByAmount   && isByTransportModeId && !searchByPodStatus){
					if(amount >= 0 && amountFilter > 0 && transportModeId == 0)
						valueOutObject = CreditWayBillPaymentDAO.getInstance().getWayBillDetailsOfAmountForGeneratingBillInDateRange(creditorId, branchIds, fromDate, toDate, amount, amountFilter, executive.getAccountGroupId());
					else
						valueOutObject = CreditWayBillPaymentDAO.getInstance().getWayBillDetailsByAmountAndTransportModeAndDateRangeForGeneratingBill(creditorId, branchIds, fromDate, toDate, amount, amountFilter, executive.getAccountGroupId(),transportModeId);
				} else if(!isWhereClause && isSearchByDate    && searchByPodStatus  && isByTransportModeId && !isSearchByAmount){
					if(podStatus == -1 && transportModeId== 0 )
						valueOutObject		= CreditWayBillPaymentDAO.getInstance().getWayBillDetailsOfPODForGeneratingBillInDateRange(creditorId, branchIds, fromDate, toDate, executive.getAccountGroupId());

					if(podStatus == -1 && transportModeId > 0)
						valueOutObject		= CreditWayBillPaymentDAO.getInstance().getWayBillDetailsOfPODAndTransportModeForGeneratingBillInDateRange(creditorId, branchIds, fromDate, toDate, executive.getAccountGroupId(),transportModeId);
					else {
						podStatus		= (short) (podStatus == PODStatusConstant.POD_STATUS_RECEIVED_YES_ID || podStatus == PODStatusConstant.POD_STATUS_UPLOADED_YES_ID ? 1 : 0);

						if(uploadPOD && transportModeId > 0)
							valueOutObject	= CreditWayBillPaymentDAO.getInstance().getWayBillDetailsOfPODAndTransportModeUploadedForGeneratingBillInDateRange(creditorId, branchIds, fromDate, toDate, podStatus, executive.getAccountGroupId(),transportModeId);
						else if(receivePOD && transportModeId > 0)
							valueOutObject	= CreditWayBillPaymentDAO.getInstance().getWayBillDetailsOfPODAndTransportModeReceivedForGeneratingBillInDateRange(creditorId, branchIds, fromDate, toDate, podStatus, executive.getAccountGroupId(),transportModeId);
						else if(uploadPOD &&  transportModeId == 0)
							valueOutObject	= CreditWayBillPaymentDAO.getInstance().getWayBillDetailsOfPODUploadedForGeneratingBillInDateRange(creditorId, branchIds, fromDate, toDate, podStatus, executive.getAccountGroupId());
						else if(receivePOD && transportModeId == 0)
							valueOutObject	= CreditWayBillPaymentDAO.getInstance().getWayBillDetailsOfPODReceivedForGeneratingBillInDateRange(creditorId, branchIds, fromDate, toDate, podStatus, executive.getAccountGroupId());
					}
				} else if(!isWhereClause && isSearchByAmount && isByTransportModeId && !isSearchByDate && !searchByPodStatus){
					if(amount >= 0 && amountFilter > 0 && transportModeId == 0)
						valueOutObject = CreditWayBillPaymentDAO.getInstance().getWayBillDetailsOfAmountForGeneratingBillInDateRange(creditorId, branchIds, fromDate, toDate, amount, amountFilter, executive.getAccountGroupId());
					else
						valueOutObject = CreditWayBillPaymentDAO.getInstance().getWayBillDetailsOfAmountAndTransportModeForGeneratingBill(creditorId, branchIds, amount, amountFilter, executive.getAccountGroupId(),transportModeId);
				} else if(isWhereClause || isByTransportModeId || istaxTypeId) {
					if(podStatus > 0)
						podStatus		= (short) (podStatus == PODStatusConstant.POD_STATUS_RECEIVED_YES_ID || podStatus == PODStatusConstant.POD_STATUS_UPLOADED_YES_ID ? 1 : 0);

					whereclause = getWhereClause(creditorId, fromDate, toDate, executive.getAccountGroupId(), transportModeId, taxTypeId, isSearchByDate, searchByPodStatus, podStatus, uploadPOD, receivePOD, companyId, configuration, moduleId, billSelectionId, minDateTimeStamp, divisionId);

					valueOutObject 	= CreditWayBillPaymentDAO.getInstance().getGetWayBillDetailsForGeneratingBillByTransportationMode(whereclause,branchIds);
				} else if(searchByPodStatus && isByTransportModeId && !isSearchByAmount && !isSearchByDate){
					if(podStatus == -1 && transportModeId == 0)
						valueOutObject		= CreditWayBillPaymentDAO.getInstance().getWayBillDetailsOfPODForGeneratingBill(creditorId, branchIds, executive.getAccountGroupId());
					else if(podStatus == -1 && transportModeId > 0)
						valueOutObject		= CreditWayBillPaymentDAO.getInstance().getWayBillDetailsOfPODAndTransportModeForGeneratingBill(creditorId, branchIds, executive.getAccountGroupId(),transportModeId);
					else {
						podStatus		= (short) (podStatus == PODStatusConstant.POD_STATUS_RECEIVED_YES_ID || podStatus == PODStatusConstant.POD_STATUS_UPLOADED_YES_ID ? 1 : 0);

						if(uploadPOD && transportModeId > 0)
							valueOutObject	= CreditWayBillPaymentDAO.getInstance().getWayBillDetailsOfPODUploadedAndTransportModeForGeneratingBill(creditorId, branchIds, podStatus, executive.getAccountGroupId(),transportModeId);
						else if(receivePOD && transportModeId > 0 )
							valueOutObject	= CreditWayBillPaymentDAO.getInstance().getWayBillDetailsOfPODReceivedAndTransportModeForGeneratingBill(creditorId, branchIds, podStatus, executive.getAccountGroupId(),transportModeId);
						else if(uploadPOD && transportModeId == 0)
							valueOutObject	= CreditWayBillPaymentDAO.getInstance().getWayBillDetailsOfPODUploadedForGeneratingBill(creditorId, branchIds, podStatus, executive.getAccountGroupId());
						else if(receivePOD && transportModeId == 0)
							valueOutObject	= CreditWayBillPaymentDAO.getInstance().getWayBillDetailsOfPODReceivedForGeneratingBill(creditorId, branchIds, podStatus, executive.getAccountGroupId());
					}
				} else if(isSearchByDate && searchByPodStatus && isSearchByAmount) {
					if(podStatus == -1 && amount >= 0 && amountFilter > 0)
						valueOutObject = CreditWayBillPaymentDAO.getInstance().getWayBillDetailsOfPODAndAmountForGeneratingBillInDateRange(creditorId, branchIds, fromDate, toDate, amount, amountFilter, executive.getAccountGroupId());
					else {
						podStatus		= (short) (podStatus == PODStatusConstant.POD_STATUS_RECEIVED_YES_ID || podStatus == PODStatusConstant.POD_STATUS_UPLOADED_YES_ID ? 1 : 0);

						if(uploadPOD && amount >= 0 && amountFilter > 0)
							valueOutObject	= CreditWayBillPaymentDAO.getInstance().getWayBillDetailsOfPODUploadedAndAmountForGeneratingBillInDateRange(creditorId, branchIds, fromDate, toDate, podStatus, amount, amountFilter, executive.getAccountGroupId());
						else if(receivePOD && amount >= 0 && amountFilter > 0)
							valueOutObject	= CreditWayBillPaymentDAO.getInstance().getWayBillDetailsOfPODReceivedAndAmountForGeneratingBillInDateRange(creditorId, branchIds, fromDate, toDate, podStatus, amount, amountFilter, executive.getAccountGroupId());
					}
				} else if(isSearchByDate && searchByPodStatus && !isSearchByAmount) {
					if(podStatus == -1)
						valueOutObject		= CreditWayBillPaymentDAO.getInstance().getWayBillDetailsOfPODForGeneratingBillInDateRange(creditorId, branchIds, fromDate, toDate, executive.getAccountGroupId());
					else {
						podStatus		= (short) (podStatus == PODStatusConstant.POD_STATUS_RECEIVED_YES_ID || podStatus == PODStatusConstant.POD_STATUS_UPLOADED_YES_ID ? 1 : 0);

						if(uploadPOD)
							valueOutObject	= CreditWayBillPaymentDAO.getInstance().getWayBillDetailsOfPODUploadedForGeneratingBillInDateRange(creditorId, branchIds, fromDate, toDate, podStatus, executive.getAccountGroupId());
						else if(receivePOD)
							valueOutObject	= CreditWayBillPaymentDAO.getInstance().getWayBillDetailsOfPODReceivedForGeneratingBillInDateRange(creditorId, branchIds, fromDate, toDate, podStatus, executive.getAccountGroupId());
					}
				} else if(!isSearchByDate && searchByPodStatus && isSearchByAmount){
					if(podStatus == -1 && amount >= 0 && amountFilter > 0)
						valueOutObject = CreditWayBillPaymentDAO.getInstance().getWayBillDetailsOfPODAndAmountForGeneratingBill(creditorId, branchIds, amount, amountFilter, executive.getAccountGroupId());
					else {
						podStatus		= (short) (podStatus == PODStatusConstant.POD_STATUS_RECEIVED_YES_ID || podStatus == PODStatusConstant.POD_STATUS_UPLOADED_YES_ID ? 1 : 0);

						if(uploadPOD && amount >= 0 && amountFilter > 0)
							valueOutObject	= CreditWayBillPaymentDAO.getInstance().getWayBillDetailsOfPODUploadedAndAmountForGeneratingBill(creditorId, branchIds, podStatus, amount, amountFilter, executive.getAccountGroupId());
						else if(receivePOD && amount >= 0 && amountFilter > 0)
							valueOutObject	= CreditWayBillPaymentDAO.getInstance().getWayBillDetailsOfPODReceivedAndAmountForGeneratingBill(creditorId, branchIds, podStatus, amount, amountFilter, executive.getAccountGroupId());
					}
				} else if(isSearchByDate && isSearchByAmount && !searchByPodStatus){
					if(amount >= 0 && amountFilter > 0)
						valueOutObject = CreditWayBillPaymentDAO.getInstance().getWayBillDetailsOfAmountForGeneratingBillInDateRange(creditorId, branchIds, fromDate, toDate, amount, amountFilter, executive.getAccountGroupId());
				} else if(isSearchByAmount) {
					if(amount >= 0 && amountFilter > 0)
						valueOutObject = CreditWayBillPaymentDAO.getInstance().getWayBillDetailsOfAmountForGeneratingBill(creditorId, branchIds, amount, amountFilter, executive.getAccountGroupId());
				} else if(isSearchByDate)
					valueOutObject 	= CreditWayBillPaymentDAO.getInstance().getWayBillDetailsForGeneratingBillInDateRange(creditorId ,branchIds, fromDate, toDate, executive.getAccountGroupId());
				else if(searchByPodStatus) {
					if(podStatus == -1)
						valueOutObject		= CreditWayBillPaymentDAO.getInstance().getWayBillDetailsOfPODForGeneratingBill(creditorId, branchIds, executive.getAccountGroupId());
					else {
						podStatus		= (short) (podStatus == PODStatusConstant.POD_STATUS_RECEIVED_YES_ID || podStatus == PODStatusConstant.POD_STATUS_UPLOADED_YES_ID ? 1 : 0);

						if(uploadPOD)
							valueOutObject	= CreditWayBillPaymentDAO.getInstance().getWayBillDetailsOfPODUploadedForGeneratingBill(creditorId, branchIds, podStatus, executive.getAccountGroupId());
						else if(receivePOD)
							valueOutObject	= CreditWayBillPaymentDAO.getInstance().getWayBillDetailsOfPODReceivedForGeneratingBill(creditorId, branchIds, podStatus, executive.getAccountGroupId());
					}
				} else if(minDateTimeStamp != null)
					valueOutObject = CreditWayBillPaymentDAO.getInstance().getWayBillDetailsForGeneratingBillFromMinDate(creditorId, branchIds, executive.getAccountGroupId(), minDateTimeStamp);
				else
					valueOutObject = CreditWayBillPaymentDAO.getInstance().getWayBillDetailsForGeneratingBill(creditorId, branchIds, executive.getAccountGroupId());

				if(valueOutObject != null) {
					final var	bills 			= (WayBillDetailsForGeneratingBill[])valueOutObject.get("WayBillDetailsForGeneratingBill");
					final var	wayBillIdArray	= (Long[])valueOutObject.get("WayBillIdArray");

					if(bills != null && wayBillIdArray != null) {
						final var	wayBillIdStr		= Utility.GetLongArrayToString(wayBillIdArray);
						final var	lrExpAmtColl		= WayBillExpenseDao.getInstance().getLRExpenseByLRIds(wayBillIdStr);
						final var	wayBillDetails  	= WayBillDetailsDAO.getInstance().getWayBillDetails(wayBillIdArray, false, (short)0, true, WayBillTaxTxn.WAYBILL_TAX_TXN_TYPE_BOOKING, false);
						final var	wbCollHM			= WayBillDao.getInstance().getWayBillsByWayBillIds(wayBillIdStr);
						Map<Long, List<LRInvoiceDetails>> invoiceDetailsCol = null;

						final var	invoiceDetails		= LRInvoiceDetailsDaoImpl.getInstance().getInvoiceBillDetaByWayBillIds(wayBillIdStr);

						if(ObjectUtils.isNotEmpty(invoiceDetails))
							invoiceDetailsCol = invoiceDetails.stream().collect(Collectors.groupingBy(LRInvoiceDetails::getWayBillId));

						if(ObjectUtils.isEmpty(wbCollHM)) {
							error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
							error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
							request.setAttribute("cargoError", error);
							return;

						}
						final var	wbIncomeCol			= WayBillIncomeDao.getInstance().getWayBillIncomeByWayBillIdArray(wayBillIdStr);
						final var	consumHM			= ConsignmentSummaryDao.getInstance().getConsignmentSummaryWeightsByWayBillIds(wayBillIdStr);
						final var	consignorDetails 	= CustomerDetailsDao.getInstance().getConsignorDetailsByWayBillId(wayBillIdStr);
						final var	consigneeDetails	= CustomerDetailsDao.getInstance().getConsigneeDetailsByWayBillId(wayBillIdStr);
						final var	consignmentDetails  = ConsignmentDetailsDao.getInstance().getConsignmentDetailsArrayByWayBillIds(wayBillIdStr);
						final var	bookingChargeHM		= WayBillBookingChargesDao.getInstance().getWayBillChargeMapByWayBillIdsAndChargeMasterIds(wayBillIdStr, bookingChargeIdsToDisplay);
						final var	dispatchLedgerList	= DispatchLedgerDaoImpl.getInstance().getDispatchLedgerDetailsByWayBillIds(wayBillIdStr);

						if(dispatchLedgerList != null && !dispatchLedgerList.isEmpty())
							dispatchLedgerHm 	= dispatchLedgerList.stream().collect(Collectors.toMap(DispatchLedger::getWaybillId, Function.identity(), (e1, e2) -> e1));

						final var	noOfDays 			= cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_MAX_DAYS_OF_OPERATION_BEFORE_CASHSTATEMENT_ENTRY_ID);

						if(showBookingCharges || showDeliveryCharges)
							wayBillDetailsForCharges 	= WayBillDetailsDAO.getInstance().getWayBillDetails(wayBillIdArray ,true ,ChargeTypeMaster.WAYBILL_CHARGETYPE_BOTH ,false ,(short)0,false);

						if(showMatadiChargesColumn)
							deliveryChargeHM	= WayBillDeliveryChargesDao.getInstance().getWayBillChargeMapByWayBillIdsAndChargeMasterIds(wayBillIdStr, DeliveryChargeConstant.MATADI_CHARGES+"");

						for (final WayBillDetailsForGeneratingBill bill : bills) {
							if(showBookingCharges || showDeliveryCharges) {
								final var 			wayBillDeatailsModel	= wayBillDetailsForCharges.get(bill.getWayBillId());

								if(wayBillDeatailsModel != null) {
									final var	wayBillCharges	= wayBillDeatailsModel.getWayBillCharges();

									if(wayBillCharges != null) {
										final Map<Long, Double>	chargeTypeModelHM		= new HashMap<>();

										for (final WayBillCharges wayBillCharge : wayBillCharges) {
											chargeTypeModelHM.put(wayBillCharge.getWayBillChargeMasterId(), wayBillCharge.getChargeAmount());

											if(chargesTotalHM.get(wayBillCharge.getWayBillChargeMasterId()) != null)
												chargesTotalHM.put(wayBillCharge.getWayBillChargeMasterId(), chargesTotalHM.get(wayBillCharge.getWayBillChargeMasterId()) + wayBillCharge.getChargeAmount());
											else
												chargesTotalHM.put(wayBillCharge.getWayBillChargeMasterId(), wayBillCharge.getChargeAmount());
										}

										chargesHM.put(bill.getWayBillId(), chargeTypeModelHM);
									}
								}
							}

							if(wbCollHM.get(bill.getWayBillId()) == null)
								continue;

							final var sourceBranch 		= cache.getGenericBranchDetailCache(request, bill.getSourceBranchId());

							final var	wayBillData	= wbCollHM.getOrDefault(bill.getWayBillId(), new WayBill());

							if(appendHandlingBranchWithSourceBranch && wayBillData.getBookingTypeId() == BookingTypeConstant.BOOKING_TYPE_FTL_ID
									&& sourceBranch != null &&  sourceBranch.getTypeOfLocation() == Branch.TYPE_OF_LOCATION_OPERATIONAL_PLACE) {
								final var	handlingBranchId = sourceBranch.getHandlingBranchId();

								if(handlingBranchId > 0) {
									final var	handlingBranch = cache.getGenericBranchDetailCache(request, handlingBranchId);
									bill.setSourceBranch(handlingBranch.getName() + " - " + sourceBranch.getName());
								} else
									bill.setSourceBranch(sourceBranch.getName());
							} else
								bill.setSourceBranch(sourceBranch.getName());

							bill.setSourceSubRegionId(sourceBranch.getSubRegionId());
							bill.setSourceSubRegion(cache.getGenericSubRegionById(request, bill.getSourceSubRegionId()).getName());
							bill.setDestinationBranch(cache.getGenericBranchDetailCache(request, bill.getDestinationBranchId()).getName());
							bill.setDestinationSubRegionId(cache.getGenericBranchDetailCache(request, bill.getDestinationBranchId()).getSubRegionId());
							bill.setDestinationSubRegion(cache.getGenericSubRegionById(request, bill.getDestinationSubRegionId()).getName());
							bill.setConsignorName(consignorDetails.get(bill.getWayBillId()).getName());
							bill.setConsigneeName(consigneeDetails.get(bill.getWayBillId()).getName());

							wayBill.setStatus(bill.getWayBillStatus());
							wayBill.setCreationDateTimeStamp(bill.getCreationDateTimeStamp());

							if(wayBillData.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DELIVERED && wayBillData.isDeliveryTimeTBB())
								bill.setCreationDateTimeStamp(wayBillData.getDeliveryDateTime());
							else
								bill.setCreationDateTimeStamp(bill.getCreationDateTimeStamp());

							if(wayBillData.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DELIVERED)
								bill.setDeliveryDateTime(wayBillData.getDeliveryDateTime());

							if(execFldPermissionsHM != null && execFldPermissionsHM.get(FeildPermissionsConstant.EDIT_LR_SOURCE) != null) {
								editLrSouceValObj.put("wayBill", wayBill);
								editLrSouceValObj.put("sourceBranch", sourceBranch);
								editLrSouceValObj.put("noOfDays", noOfDays);
								editLrSouceValObj.put(LrViewConfigurationPropertiesConstant.LR_VIEW_CONFIGURATION_PROPERTY, lrViewConfiguration);

								bill.setShowWayBillSourceUpdateLink(LRViewScreenBLL.getInstance().showEditLrSourceLink(editLrSouceValObj));
							}

							bill.setShowWayBillDestUpdateLink(creditorInvoiceBLL.isEditDestination(showEditDestinationColumn, bill, execFldPermissionsHM));
							bill.setShowEditLrInvoiceNumberLink(creditorInvoiceBLL.isEditLrInvoiceNumber(showEditLrInvoiceNumberColumn, executive, bill, execFldPermissionsHM));
							bill.setAllowEditRate(creditorInvoiceBLL.isEditLRRate(bill.getWayBillStatus(), execFldPermissionsHM));

							if(showEditTransportationModeColumn) {
								wayBill.setWayBillId(bill.getWayBillId());

								final var	transportationModeValObj	= new ValueObject();

								transportationModeValObj.put("execFldPermissionsHM", execFldPermissionsHM);
								transportationModeValObj.put("executive", executive);
								transportationModeValObj.put("srcBranch", sourceBranch);
								transportationModeValObj.put("wayBill", wayBill);

								bill.setShowUpdateTransportationModeLink(LRViewScreenBLL.getInstance().showUpdateTransportationModeLink(transportationModeValObj));
								bill.setBillId(0);
							}

							if(isVlidateViewedLRExpense) {
								if(lrExpAmtColl != null) {
									if(lrExpAmtColl.get(bill.getWayBillId()) != null) {
										isLrExpenseExists	= true;
										bill.setWayBillExpenseAmount(lrExpAmtColl.get(bill.getWayBillId()));
										bill.setLrExpenseExists(true);
									}
								} else {
									bill.setLrExpenseExists(false);
									isLrExpenseExists	= false;
								}
							} else if(lrExpAmtColl != null)
								bill.setWayBillExpenseAmount(lrExpAmtColl.getOrDefault(bill.getWayBillId(), 0d));

							if(consignmentDetails != null) {
								final var	consDtlsArr = consignmentDetails.get(bill.getWayBillId());

								if(consDtlsArr != null) {
									bookingRateList = new ArrayList<>();
									for (final ConsignmentDetails element : consDtlsArr) {
										element.setPackingTypeName(cache.getPackingTypeMasterById(request, element.getPackingTypeMasterId()).getName());
										bill.setConsignmentDetails(Stream.of(consDtlsArr).map(e -> e.getQuantity() + " " + e.getPackingTypeName()).collect(Collectors.joining(Constant.COMMA)));
										bill.setSaidToContainStr(Stream.of(consDtlsArr).map(ConsignmentDetails::getSaidToContain).collect(Collectors.joining(Constant.COMMA)));
										bookingRateList.add(element.getAmount());

										if(ObjectUtils.isNotEmpty(bookingRateList))
											bill.setBookingRateString(bookingRateList.stream().map(Object::toString).collect(Collectors.joining(", ")));
									}
								} else {
									bill.setConsignmentDetails("");
									bill.setSaidToContainStr("");
									bill.setBookingRateString("");
								}
							}

							taxAmount = 0.00;

							if(wayBillDetails != null) {
								final var taxes 	= wayBillDetails.get(bill.getWayBillId()).getWayBillTaxTxn();
								taxAmount	= Stream.of(taxes).map(WayBillTaxTxn::getTaxAmount).mapToDouble(Double::doubleValue).sum();
							}

							bill.setServiceTaxAmount(taxAmount);

							if(wbIncomeCol != null) {
								final var	wbIncomeArr = wbIncomeCol.get(bill.getWayBillId());

								if(wbIncomeArr != null)
									wbIncomeArr.forEach((final WayBillIncome element) -> bill.setIncomeAmount(bill.getIncomeAmount() + element.getAmount()));
							}

							if(bookingChargeHM != null && bookingChargeHM.get(bill.getWayBillId()) != null) {
								if(bookingChargeHM.get(bill.getWayBillId()).get((long) BookingChargeConstant.DOOR_DLY_BOOKING) != null)
									bill.setDoorDeliveryAmt(bookingChargeHM.get(bill.getWayBillId()).get((long) BookingChargeConstant.DOOR_DLY_BOOKING));
								else if(bookingChargeHM.get(bill.getWayBillId()).get((long) BookingChargeConstant.DOOR_DELIVERY_BOOKING) != null)
									bill.setDoorDeliveryAmt(bookingChargeHM.get(bill.getWayBillId()).get((long) BookingChargeConstant.DOOR_DELIVERY_BOOKING));
								else if(bookingChargeHM.get(bill.getWayBillId()).get((long) BookingChargeConstant.DD) != null)
									bill.setDoorDeliveryAmt(bookingChargeHM.get(bill.getWayBillId()).get((long) BookingChargeConstant.DD));

								if(bookingChargeHM.get(bill.getWayBillId()).get((long) BookingChargeConstant.STATISTICAL) != null)
									bill.setStaticalAmt(bookingChargeHM.get(bill.getWayBillId()).get((long) BookingChargeConstant.STATISTICAL));
							}

							if(deliveryChargeHM != null && deliveryChargeHM.size() > 0 && deliveryChargeHM.get(bill.getWayBillId()) != null && deliveryChargeHM.get(bill.getWayBillId()).get((long) DeliveryChargeConstant.MATADI_CHARGES) != null) {
								bill.setMatadiChargesAmt(deliveryChargeHM.get(bill.getWayBillId()).get((long) DeliveryChargeConstant.MATADI_CHARGES));

								if(wayBillData.isDeliveryTimeTBB())
									bill.setGrandTotal(bill.getGrandTotal() - bill.getMatadiChargesAmt());
							}

							bill.setTaxTypeName(CorporateAccountConstant.getTaxTypeName(bill.getTaxTypeId()));
							bill.setNoOfPackages(wayBillData.getNoOfPkgs());

							if(consumHM != null) {
								final var consignmentSummary	= consumHM.get(bill.getWayBillId());

								bill.setActualWeight(consignmentSummary.getActualWeight());
								bill.setChargedWeight(consignmentSummary.getChargeWeight());
								bill.setInvoiceNumber(consignmentSummary.getInvoiceNo());

								if(StringUtils.isEmpty(bill.getInvoiceNumber()) && invoiceDetailsCol != null && invoiceDetailsCol.containsKey(bill.getWayBillId())) {
									final var invoiceDetailsList = invoiceDetailsCol.get(bill.getWayBillId());
									bill.setInvoiceNumber(invoiceDetailsList.parallelStream().filter(e -> e.getInvoiceNumber() != null).map(LRInvoiceDetails::getInvoiceNumber).collect(Collectors.joining(", ")));
								}

								bill.setDeliveryId(consignmentSummary.getDeliveryTo());
								bill.setDeliveryType(InfoForDeliveryConstant.getInfoForDelivery(bill.getDeliveryId()));
								if(consignmentSummary.getChargeTypeId() ==  ChargeTypeConstant.CHARGETYPE_ID_WEIGHT) {
									bookingRateList = new ArrayList<>();
									bookingRateList.add(consignmentSummary.getWeigthFreightRate());
									bill.setBookingRateString(bookingRateList.stream().map(Object::toString).collect(Collectors.joining(", ")));
								}if(consignmentSummary.getChargeTypeId() ==  ChargeTypeConstant.CHARGETYPE_ID_FIX) {
									bookingRateList = new ArrayList<>();
									bookingRateList.add(consignmentSummary.getFixAmount());
									bill.setBookingRateString(bookingRateList.stream().map(Object::toString).collect(Collectors.joining(", ")));
								}
								if(wayBillData.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_BOOKED && consignmentSummary.getVehicleNumber() != null)
									bill.setVehicleNumber(consignmentSummary.getVehicleNumber());
								else if(dispatchLedgerHm != null && dispatchLedgerHm.get(bill.getWayBillId()) != null && dispatchLedgerHm.get(bill.getWayBillId()).getVehicleNumber() != null)
									bill.setVehicleNumber(dispatchLedgerHm.get(bill.getWayBillId()).getVehicleNumber());
							}

							if(wayBillData.getAdditionalRemark() != null) {
								bill.setAdditionalRemark(wayBillData.getAdditionalRemark());
								isAdditionalRemarkAvailable = true;
							}

							bill.setEdit(wayBillData.getStatus() != WayBillStatusConstant.WAYBILL_STATUS_DELIVERED);
							bill.setPodUploadedStr(bill.isPodUploaded() ? PODStatusConstant.POD_STATUS_UPLOADED_YES : PODStatusConstant.POD_STATUS_UPLOADED_NO);
							bill.setPodReceivedStr(bill.isPodReecived() ? PODStatusConstant.POD_STATUS_RECEIVED_YES : PODStatusConstant.POD_STATUS_RECEIVED_NO);

							final var 	pair	= SplitLRNumber.getNumbers(bill.getWayBillNumber());

							if(pair != null)
								bill.setLrNumberForSorting(pair.getLrNumber() instanceof Long ? (long) pair.getLrNumber() : 0);

							final var	trForGroup = transpotModeMap.get(bill.getTransportationModeId());

							bill.setTransportationModeString(trForGroup != null ? trForGroup.getTransportModeName() : "--");
						}

						var	isAnyEditPermissionExist	= ListFilterUtility.isAnyMatchInList(Arrays.asList(bills), e -> e.isShowEditLrInvoiceNumberLink() || e.isShowWayBillSourceUpdateLink()
								|| e.isShowWayBillDestUpdateLink() || e.isShowUpdateTransportationModeLink() || e.isAllowEditRate());

						final var	editConsgnmntPermission			= execFldPermissionsHM.get(FeildPermissionsConstant.EDIT_CONSIGNMENT);
						final var	editTBBCustPermission			= execFldPermissionsHM.get(FeildPermissionsConstant.EDIT_TBB_CUSTOMER);
						final var	editLrSourcePermission			= execFldPermissionsHM.get(FeildPermissionsConstant.EDIT_LR_SOURCE);

						if(editConsgnmntPermission != null || editTBBCustPermission != null || editLrSourcePermission != null)
							isAnyEditPermissionExist	= true;

						var	reportViewModel = new ReportViewModel();
						reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);
						request.setAttribute("ReportViewModel",reportViewModel);
						request.setAttribute("isAnyEditPermissionExist", isAnyEditPermissionExist);

						if(checkPodUploadedOrNot) {
							final var subRegionsList	= CollectionUtility.getLongListFromString((String) podConfiguration.getOrDefault(PodWayBillPropertiesConstant.SUB_REGION_IDS_TO_VALIDATE_POD_UPLOADED_IN_INVOICE, "0"));
							checkPodUploadedOrNot = subRegionsList.isEmpty() || subRegionsList.contains(executive.getSubRegionId());
						}

						final var	wayBillDetailsList		= creditorInvoiceBLL.getCreditorInvoiceListInSortedOrder(configuration, bills, matadiChargesApplicable, executive);

						if(!matadiChargesApplicable || ObjectUtils.isNotEmpty(wayBillDetailsList)) {
							request.setAttribute("WayBillDetailsForGeneratingBillList", wayBillDetailsList);
							request.setAttribute("wayBillIds", wayBillIdStr);
							request.setAttribute("PodRequiredForInvoiceCreation", isPodRequiredForInvoiceCreation);
							request.setAttribute(PodWayBillPropertiesConstant.IS_POD_REQUIRED, isPodRequired);
							request.setAttribute("isAdditionalRemarkAvailable", isAdditionalRemarkAvailable);
							request.setAttribute("isLrExpenseExists", isLrExpenseExists);
							request.setAttribute("isVlidateViewedLRExpense", isVlidateViewedLRExpense);
							request.setAttribute("doNotCreateBillWithoutPartyGstNumber", doNotCreateBillWithoutPartyGstNumber);
							request.setAttribute("matadiChargesApplicable", matadiChargesApplicable);
							request.setAttribute("bookingChgs", bookingChgs);
							request.setAttribute("deliveryChgs", deliveryChgs);
							request.setAttribute("chargesHM", chargesHM);
							request.setAttribute("chargesTotalHM", chargesTotalHM);
							request.setAttribute("invoiceConfigHM", configuration);
							request.setAttribute(PodWayBillPropertiesConstant.VALIDATE_POD_UPLOADED_TO_CREATE_INVOICE, checkPodUploadedOrNot);

							if(isRegionWiseSelectionAllow)
								request.setAttribute("CreditorDetails", creditorDetails);
						} else {
							error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
							error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
							request.setAttribute("cargoError", error);
						}
					} else {
						error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
						error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
						request.setAttribute("cargoError", error);
					}
				} else {
					error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
					error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
					request.setAttribute("cargoError", error);
				}
			} else {
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}

	public static String getWhereClause(final long creditorId, final Timestamp fromDate, final Timestamp toDate, final long accountGroupId, final short transportModeId, final short taxTypeId, final boolean isSearchByDate,
			final boolean searchByPodStatus, final short podStatus, final boolean uploadPOD, final boolean receivePOD, final short companyId, final Map<Object, Object> configuration, final short moduleId, final short billSelectionId, final Timestamp minDateTimeStamp, final long divisionId) {
		final var 						whereclause				= new StringJoiner(" AND ");

		final var	getDataOnBookingDate	= (boolean) configuration.getOrDefault(CreditorInvoicePropertiesConstant.SEARCH_LR_ON_BOOKING_DATE_TO_CREATE_BILL, false);

		whereclause.add("cwbpm.AccountGroupId  = " + accountGroupId);

		if(creditorId > 0)
			whereclause.add("cwbpm.CreditorId = " + creditorId);

		if(isSearchByDate) {
			if(getDataOnBookingDate) {
				if(fromDate != null)
					whereclause.add("cwbpm.BookingDateTime >= '" + fromDate + "'");

				if(toDate != null)
					whereclause.add("cwbpm.BookingDateTime <='" + toDate + "'");
			} else {
				if(fromDate != null)
					whereclause.add("cwbpm.CreationDateTimeStamp >='" + fromDate + "'");

				if(toDate != null)
					whereclause.add("cwbpm.CreationDateTimeStamp <='" + toDate + "'");
			}
		} else if(minDateTimeStamp != null)
			if(getDataOnBookingDate)
				whereclause.add("cwbpm.BookingDateTime >= '" + minDateTimeStamp + "'");
			else
				whereclause.add("cwbpm.CreationDateTimeStamp >='" + minDateTimeStamp + "'");

		if(transportModeId > 0)
			whereclause.add("cs.TransportationModeId  = " + transportModeId);

		if(searchByPodStatus && podStatus != -1)
			if(receivePOD)
				whereclause.add(podStatus == 0 ? "(pod.IsPODRecevied = " + podStatus + " OR pod.IsPODRecevied IS NULL) " :  "pod.IsPODRecevied = " + podStatus);
			else if(uploadPOD)
				whereclause.add(podStatus == 0 ? "(pod.IsPODUploaded = " + podStatus + " OR pod.IsPODUploaded IS NULL) " :  "pod.IsPODUploaded = " + podStatus);

		if(taxTypeId > 0)
			whereclause.add("cs.TaxType = " + taxTypeId);

		if(companyId > 0)
			whereclause.add("wb.CompanyId = " + companyId);

		if(billSelectionId > 0)
			whereclause.add("cs.BillSelectionId = " + billSelectionId);

		if(divisionId > 0)
			whereclause.add("cs.DivisionId = " + divisionId);

		if (moduleId == WayBillDetailsForGeneratingBill.DELIVERY)
			whereclause.add("wb.Status IN (9,15)");
		else if (moduleId == WayBillDetailsForGeneratingBill.DDM)
			whereclause.add("wb.Status IN (10,11)");

		whereclause.add("cwbpm.Status = 1 AND cwbpm.BillId IS NULL AND cwbpm.WayBillStatus NOT IN (5,15)");

		return whereclause.toString();
	}
}