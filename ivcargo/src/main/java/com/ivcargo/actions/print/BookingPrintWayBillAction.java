package com.ivcargo.actions.print;

//~--- non-JDK imports --------------------------------------------------------

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.TimeZone;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.CreditPaymentModuleBLL;
import com.businesslogic.LRSearchBLL;
import com.businesslogic.properties.GeneralConfiguration;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.constant.properties.lrprint.LRPrintPropertiesConstant;
import com.iv.dao.impl.crossingagent.CrossingAgentMasterDaoImpl;
import com.iv.dao.impl.serviceinfo.photoservice.IDProofDetailsServiceInfoDaoImpl;
import com.iv.dto.constant.FormTypeConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.dto.photoandsignatureservice.Service;
import com.iv.dto.serviceinfo.photoservice.IDProofDetailsServiceInfo;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.exception.ExceptionProcess;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actors.PhotoServiceActor;
import com.ivcargo.reports.ReportView;
import com.ivcargo.utils.CacheManip;
import com.ivcargo.utils.JsonUtility;
import com.platform.dao.CollectionPersonMasterDao;
import com.platform.dao.CorporateAccountDao;
import com.platform.dao.DeliverySequenceCounterDao;
import com.platform.dao.DiscountMasterDAO;
import com.platform.dao.ExecutiveDao;
import com.platform.dao.WayBillChargeAmountDao;
import com.platform.dao.WayBillDao;
import com.platform.dao.WayBillExpenseDao;
import com.platform.dao.WayBillIncomeDao;
import com.platform.dao.reports.CreditWayBillTxnClearanceSummaryDAO;
import com.platform.dao.waybill.FormTypesDao;
import com.platform.dto.AccountGroup;
import com.platform.dto.Bill;
import com.platform.dto.Branch;
import com.platform.dto.BranchTransfer;
import com.platform.dto.ChargeTypeMaster;
import com.platform.dto.City;
import com.platform.dto.Commodity;
import com.platform.dto.ConfigParam;
import com.platform.dto.ConsignmentDetails;
import com.platform.dto.ConsignmentSummary;
import com.platform.dto.CorporateAccount;
import com.platform.dto.CustomerDetails;
import com.platform.dto.DeliverySequenceCounter;
import com.platform.dto.ECargoConstantFile;
import com.platform.dto.Executive;
import com.platform.dto.ExecutiveFeildPermissionDTO;
import com.platform.dto.LocationsMapping;
import com.platform.dto.PackingTypeMaster;
import com.platform.dto.Region;
import com.platform.dto.SubRegion;
import com.platform.dto.TransportCommonMaster;
import com.platform.dto.WayBill;
import com.platform.dto.WayBillCancellation;
import com.platform.dto.WayBillChargeAmount;
import com.platform.dto.WayBillCharges;
import com.platform.dto.WayBillHistory;
import com.platform.dto.WayBillTaxTxn;
import com.platform.dto.WayBillType;
import com.platform.dto.configuration.mindateselection.ModuleWiseMinDateSelectionConfigurationDTO;
import com.platform.dto.configuration.modules.GroupConfigurationPropertiesDTO;
import com.platform.dto.constant.CargoAccountGroupConstant;
import com.platform.dto.constant.ExecutiveTypeConstant;
import com.platform.dto.constant.FeildPermissionsConstant;
import com.platform.dto.constant.InfoForDeliveryConstant;
import com.platform.dto.constant.PaymentTypeConstant;
import com.platform.dto.constant.ServiceTypeConstant;
import com.platform.dto.constant.TransCargoAccountGroupConstant;
import com.platform.dto.constant.WayBillStatusConstant;
import com.platform.dto.constant.WayBillTypeConstant;
import com.platform.dto.model.CreditWayBillTxn;
import com.platform.dto.model.CreditWayBillTxnCleranceSummary;
import com.platform.dto.model.PackagesCollectionDetails;
import com.platform.dto.model.ReportViewModel;
import com.platform.dto.model.WayBillModel;
import com.platform.dto.waybill.FormTypes;
import com.platform.jsonconstant.JsonConstant;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Converter;
import com.platform.utils.Utility;

public class BookingPrintWayBillAction implements Action {
	public static final String TRACE_ID = "BookingPrintWayBillAction";

	@Override
	@SuppressWarnings({ "unchecked" })
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {

		HashMap<String, Object>	 						error 								= null;
		var 											wayBillId				 			= 0L;
		AccountGroup	 								accountGroup 						= null;
		Branch 											srcBranch 							= null;
		Branch 											branch 								= null;
		Branch 											freightUptoBranch 					= null;
		Branch 											destBranch 							= null;
		BranchTransfer 									branchTransfer 						= null;
		CacheManip  									cache    							= null;
		ChargeTypeMaster 								chargeTypeMaster 					= null;
		City 											destCity 							= null;
		City 											srcCity 							= null;
		SubRegion										destSubRegion						= null;
		SubRegion										srcSubRegion						= null;
		Region											sourceRegion						= null;
		Region											destBranchRegion					= null;
		Commodity										commodity							= null;
		ConsignmentDetails[]	 						consignment 						= null;
		ConsignmentSummary								consignmentSummary					= null;
		CreditWayBillTxn[]								creditWayBillTxn					= null;
		CreditWayBillTxn 								crdtWbTxn							= null;
		CustomerDetails									consignee 							= null;
		CustomerDetails									consignor 							= null;
		Executive 										bookedExecutive 					= null;
		Executive 										executive 							= null;
		HashMap<Long, WayBill> 							wbAtBkdStatus						= null;
		HashMap<Long, WayBillCharges> 					wayBillChargesCol 					= null;
		PackingTypeMaster[] 							pakgMaster    						= null;
		Timestamp 										wbBookingDateTime 					= null;
		ValueObject  									outValObj    						= null;
		WayBill 										wayBill 							= null;
		WayBill 										wayBill2 							= null;
		WayBillCharges[] 								wayBillCharges 						= null;
		WayBillHistory 									wayBillHistory 						= null;
		WayBillModel 									wayBillModel 						= null;
		WayBillTaxTxn[] 								wayBillTaxTxn 						= null;
		WayBillType 									wayBillType 						= null;
		HashMap<Long, PackagesCollectionDetails> 		packagesCollection 					= null;
		HashMap<Long, ExecutiveFeildPermissionDTO> 		execFieldPermissions 				= null;
		Long[]											creditWayBillTxnIdArray				= null;
		String											creditWayBillTxnIds					= null;
		HashMap<Long, CreditWayBillTxnCleranceSummary> 	creditWayBillTxnClearanceSumHM		= null;
		FormTypes[] 									formTypesArr						= null;
		var											formTypeStr							= "";
		var											formTypeIds							= "";
		ValueObject										configuration						= null;
		var			  								isIncomeExists						= false;
		var			  								isExpenseExists						= false;
		var			  								isTaxPaidByTrans					= false;
		var			  								partyId								= 0L;
		CorporateAccount		  						corporateAccount					= null;
		var				  								totalNumberofQty					= 0;
		ArrayList<String> 								discountTypes 						= null;
		ArrayList<Long> 								assignedLocationIdList	 		 	= null;
		SubRegion										subRegion				  			= null;
		ValueObject										generalConfiguration	  			= null;
		String											bookingTimeExcludeChargeIds	  		= null;
		var												noOfDays				  			= 0;
		Short											waybillStatus						= 0;
		var              							actualWeight  						= 0D;
		var              							chargedWeight 						= 0D;
		var              							length        						= 0D;
		var              							breadth       						= 0D;
		var              							height        						= 0D;
		var                							packageId     						= 0L;
		var                							quantity      						= 0L;
		SimpleDateFormat 								dateFormatForTimeLog 				= null;
		ValueObject										print								= null;
		ValueObject										valueObject							= null;
		SimpleDateFormat								dateFormat							= null;
		Date											date								= null;
		ValueObject										valueObjectFromCreditWBTxn			= null;
		var			  								editDestinationAtLRPrint			= false;
		var			  								editActualWeightAtLRPrint			= false;
		Timestamp										minDateTimeStamp					  = null;
		ArrayList<WayBillChargeAmount> 					wayBillChargeAmountList			   	  = null;
		ValueObject										confValObj							  = null;
		ReportView										reportView						   	  = null;
		ReportViewModel									reportViewModel 					  = null;
		ValueObject										bookingTimePhoto	                  = null;
		PhotoServiceActor								photoServiceActor					  = null;
		String 											photoImage							  = null;
		AccountGroup									destAccountGroup					  = null;
		ArrayList<IDProofDetailsServiceInfo>			idProofDetailsServiceInfoList		  = null;
		String											regionWiseBookingPage					= null;
		List<Long>										regionIdsForBookingPageChnage	= null;
		var									allowRegionIdsForBookingChanges		= false;
		try {

			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			if( request.getParameter("printType") != null)
				waybillStatus =	JSPUtility.GetShort(request, "printType",(short)0);

			dateFormat		= new SimpleDateFormat("dd-MMM-yyyy");

			final var startTime = System.currentTimeMillis();
			date			= new Date(startTime);


			wayBillId 	= JSPUtility.GetLong(request, "wayBillId", 0);
			cache    	= new CacheManip(request);
			executive 	= cache.getExecutive(request);

			confValObj 				= cache.getGroupConfiguration(request, executive.getAccountGroupId());
			configuration			= cache.getGroupConfiguration(request, executive.getAccountGroupId());

			final var lrPrintConfigHM	= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.LR_PRINT);

			minDateTimeStamp	= cache.getModuleWiseMinDateToGetData(request, executive.getAccountGroupId(),
					ModuleWiseMinDateSelectionConfigurationDTO.LR_CREDIT_PAYMENT_MIN_DATE_ALLOW,
					ModuleWiseMinDateSelectionConfigurationDTO.LR_CREDIT_PAYMENT_MIN_DATE);
			reportView		= new ReportView();
			reportViewModel = new ReportViewModel();

			reportViewModel = reportView.populateReportViewModel(request, reportViewModel);

			request.setAttribute("reportViewModel", reportViewModel);
			request.setAttribute("wayBillId", wayBillId);

			if (wayBillId == 0 && request.getAttribute("wayBillId") != null)
				wayBillId = (Long) request.getAttribute("wayBillId");

			execFieldPermissions = cache.getExecutiveFieldPermission(request);

			noOfDays = cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_MAX_DAYS_OF_OPERATION_BEFORE_CASHSTATEMENT_ENTRY_ID);

			if(request.getParameter("printType") != null)
				waybillStatus =	JSPUtility.GetShort(request, "printType",(short)0);

			final var	lrSearchBLL		= new LRSearchBLL();
			outValObj    = lrSearchBLL.findByWayBillId(wayBillId, executive.getAccountGroupId());

			if(outValObj == null) {
				error.put("errorCode", CargoErrorList.NO_RECORDS);
				error.put("errorDescription", CargoErrorList.NO_RECORDS_DESCRIPTION);
				request.setAttribute("cargoError", error);
				request.setAttribute("nextPageToken", "failure");
				return;
			}

			wayBillModel = (WayBillModel) outValObj.get("wayBillModel");

			if (wayBillModel.getWayBill().getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CANCELLED) {
				request.setAttribute("WayBillCancellationType",WayBillCancellation.getWayBillCancellationType(wayBillModel.getWayBillCancellation() == null ? (short)0 : wayBillModel.getWayBillCancellation().getCancellationType()));
				error.put("errorCode", CargoErrorList.WRONG_WAYBILL_ERROR);
				error.put("errorDescription", CargoErrorList.WRONG_WAYBILL_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
				request.setAttribute("nextPageToken", "failure");
			}

			if(wayBillModel.getCreditWBTxnColl() != null) {
				crdtWbTxn = wayBillModel.getCreditWBTxnColl().get(CreditWayBillTxn.TXN_TYPE_BOOKING_ID);

				if( crdtWbTxn!= null) {
					if(crdtWbTxn.getCollectionPersonId() > 0 )
						request.setAttribute("CollectionPersonBKG",CollectionPersonMasterDao.getInstance().getCollectionPersonDetailsById(crdtWbTxn.getCollectionPersonId()));

					branch = cache.getGenericBranchDetailCache(request, crdtWbTxn.getReceivedByBranchId());
					crdtWbTxn.setPaymentStatusName(Bill.getBillClearanceStatusName(crdtWbTxn.getPaymentStatus()));
					crdtWbTxn.setBranchName(branch != null ? branch.getName() : "");
				}

				crdtWbTxn = wayBillModel.getCreditWBTxnColl().get(CreditWayBillTxn.TXN_TYPE_DELIVERY_ID);

				if(crdtWbTxn != null) {
					branch = cache.getGenericBranchDetailCache(request, crdtWbTxn.getReceivedByBranchId());
					crdtWbTxn.setBranchName(branch != null ? branch.getName() : "");
					crdtWbTxn.setPaymentStatusName(Bill.getBillClearanceStatusName(crdtWbTxn.getPaymentStatus()));

					if(crdtWbTxn.getCollectionPersonId() > 0)
						request.setAttribute("CollectionPersonDLY",CollectionPersonMasterDao.getInstance().getCollectionPersonDetailsById(crdtWbTxn.getCollectionPersonId()));
				}

				request.setAttribute("CreditWayBillTxnForPaymentDetails", crdtWbTxn);
			}

			request.setAttribute("CreditWBTxnColl", wayBillModel.getCreditWBTxnColl());

			wayBill = wayBillModel.getWayBill();

			consignee   = wayBillModel.getConsigneeDetails();
			consignor   = wayBillModel.getConsignorDetails();
			consignment = wayBillModel.getConsignmentDetails();

			if(consignor.getBillingPartyId() > 0) {
				final var corporateColl = CorporateAccountDao.getInstance().getCorporateAccountDetails(""+consignor.getBillingPartyId());

				if(corporateColl != null && corporateColl.get(consignor.getBillingPartyId()) != null)
					consignor.setBillingPartyName(corporateColl.get(consignor.getBillingPartyId()).getName());
				else
					consignor.setBillingPartyName("--");
			}

			request.setAttribute("packageDetails", consignment);

			consignmentSummary	= wayBillModel.getConsignmentSummary();

			commodity	= cache.getCommodityDetails(request, executive.getAccountGroupId(), consignmentSummary.getCommodityMasterId());

			if(commodity != null)
				consignmentSummary.setCommodityName(commodity.getName());
			else
				consignmentSummary.setCommodityName("--");

			if(consignmentSummary.getFreightUptoBranchId() > 0) {
				freightUptoBranch = cache.getGenericBranchDetailCache(request, consignmentSummary.getFreightUptoBranchId());
				consignmentSummary.setFreightUptoBranchName(freightUptoBranch.getName());
			} else
				consignmentSummary.setFreightUptoBranchName("");

			consignmentSummary.setServiceTypeName(ServiceTypeConstant.getServiceType(consignmentSummary.getServiceTypeId()));

			request.setAttribute("consignmentSummary", consignmentSummary);
			request.setAttribute("freightUptoBranch", freightUptoBranch);

			final var deliveryDirectVasuli = wayBillModel.getDirectDeliveryDirectVasuli();

			if(consignmentSummary.getDeliveryTo() == InfoForDeliveryConstant.DIRECT_DELIVERY_DIRECT_VASULI_ID
					&& deliveryDirectVasuli != null && deliveryDirectVasuli.getAmountReceivedDate() != null)
				request.setAttribute("DirectDeliveryDirectVasuliDone", deliveryDirectVasuli.getAmountReceivedDate());

			if(consignmentSummary.getVehicleTypeId() != 0) {
				final var vehicleType = cache.getVehicleType(request, consignmentSummary.getAccountGroupId(), consignmentSummary.getVehicleTypeId());
				if(vehicleType != null)
					consignmentSummary.setVehicleTypeName(vehicleType.getName());
			}

			request.setAttribute("DeliveryDebitMemo", wayBillModel.getDeliveryDebitMemo());

			// BranchTransfer code done Here
			branchTransfer = wayBillModel.getBranchTransfer();

			if(branchTransfer != null)
				request.setAttribute("branchTransfer", branchTransfer);

			final var wayBillChargesArrList = new HashMap<Long,WayBillCharges>();
			wayBillCharges = wayBillModel.getWayBillCharges();

			if(wayBillCharges != null)
				for (final WayBillCharges wayBillCharge : wayBillCharges) {
					chargeTypeMaster = cache.getChargeTypeMasterById(request,wayBillCharge.getWayBillChargeMasterId());
					wayBillCharge.setName(chargeTypeMaster.getChargeName());

					if(wayBillCharge.getWayBillChargeMasterId() == ChargeTypeMaster.FREIGHT)
						request.setAttribute("Freight", wayBillCharge.getChargeAmount());
					if(executive.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNT_GORUP_ID_KALPANA_CARGO
							|| executive.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNT_GORUP_ID_AMAR_TRAVELS
							|| executive.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNT_GROUP_ID_MAYUR_CARGO
							|| executive.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNT_GROUP_ID_SACHIN_TRAVELS
							|| executive.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNT_GROUP_ID_MECL
							|| executive.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNT_GROUP_ID_SETT){
						if(wayBillCharge.getWayBillChargeMasterId() == ChargeTypeMaster.INSURANCE)
							request.setAttribute("Insurance", wayBillCharge.getChargeAmount());
						if(wayBillCharge.getWayBillChargeMasterId() == ChargeTypeMaster.LOADING)
							request.setAttribute("Loading", wayBillCharge.getChargeAmount());
						if(wayBillCharge.getWayBillChargeMasterId() == ChargeTypeMaster.UNLOADING)
							request.setAttribute("UnLoading", wayBillCharge.getChargeAmount());
						if(wayBillCharge.getWayBillChargeMasterId() == ChargeTypeMaster.LOCAL_FREIGHT_DELIVERY)
							request.setAttribute("LocalFreight", wayBillCharge.getChargeAmount());
						if(wayBillCharge.getWayBillChargeMasterId() == ChargeTypeMaster.BUILTY_CHARGE)
							request.setAttribute("BuiltyCharge", wayBillCharge.getChargeAmount());
						if(wayBillCharge.getWayBillChargeMasterId() == ChargeTypeMaster.CONVENIENCE)
							request.setAttribute("Convenience", wayBillCharge.getChargeAmount());
					} else if(executive.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNTGORUPID_SHREE_HANNDAA_TRAVELS){
						if(wayBillCharge.getWayBillChargeMasterId() == ChargeTypeMaster.FREIGHT)
							request.setAttribute("Freight", wayBillCharge.getChargeAmount());
						if(wayBillCharge.getWayBillChargeMasterId() == ChargeTypeMaster.LOADING)
							request.setAttribute("Loading", wayBillCharge.getChargeAmount());
						if(wayBillCharge.getWayBillChargeMasterId() == ChargeTypeMaster.UNLOADING)
							request.setAttribute("UnLoading", wayBillCharge.getChargeAmount());
						if(wayBillCharge.getWayBillChargeMasterId() == ChargeTypeMaster.CONVENIENCE)
							request.setAttribute("Convenience", wayBillCharge.getChargeAmount());
					}
					wayBillChargesArrList.put(wayBillCharge.getWayBillChargeMasterId(), wayBillCharge);
				}

			request.setAttribute("wayBillCharges", wayBillChargesArrList);

			wayBillTaxTxn = wayBillModel.getWayBillTaxTxn();

			for (final WayBillTaxTxn element : wayBillTaxTxn) {
				final var	taxMaster = cache.getTaxMasterById(request, element.getTaxMasterId());
				element.setTaxName(taxMaster.getTaxMasterName());
			}

			request.setAttribute("wayBillTaxTxn", wayBillTaxTxn);

			request.setAttribute("consignee", consignee);
			request.setAttribute("consignor", consignor);

			if (wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_RECEIVED && wayBill.getBranchId() != wayBill.getDestinationBranchId())
				request.setAttribute("RoutingBranchName", cache.getGenericBranchDetailCache(request, wayBill.getBranchId()).getName());

			accountGroup = cache.getAccountGroupById(request, executive.getAccountGroupId());
			request.setAttribute("accountGroup", accountGroup);

			branch = cache.getGenericBranchDetailCache(request,wayBill.getBranchId());
			request.setAttribute("branch", branch);

			request.setAttribute("executive", executive);

			bookedExecutive = ExecutiveDao.getInstance().findByExecutiveId(wayBill.getExecutiveId());
			request.setAttribute("bookedExecutive", bookedExecutive.getName());

			srcSubRegion = cache.getGenericSubRegionById(request, cache.getGenericBranchDetailCache(request, wayBill.getSourceBranchId()).getSubRegionId());
			request.setAttribute("srcSubRegion", srcSubRegion);

			srcBranch  = cache.getGenericBranchDetailCache(request, wayBill.getSourceBranchId());
			request.setAttribute("srcBranch", srcBranch);

			srcCity = cache.getCityById(request, srcBranch.getCityId());
			request.setAttribute("srcCity", srcCity);

			destSubRegion = cache.getGenericSubRegionById(request, cache.getGenericBranchDetailCache(request, wayBill.getDestinationBranchId()).getSubRegionId());
			request.setAttribute("destSubRegion", destSubRegion);

			destBranch  = cache.getGenericBranchDetailCache(request, wayBill.getDestinationBranchId());
			request.setAttribute("destBranch", destBranch);

			destCity = cache.getCityById(request, destBranch.getCityId());
			request.setAttribute("destCity", destCity);

			destAccountGroup = cache.getAccountGroupByAccountGroupId(request, destBranch.getAccountGroupId());

			if(destAccountGroup != null)
				destBranch.setDestAccountGroupName(destAccountGroup.getName());

			request.setAttribute("noOfArticle", "" + wayBillModel.getNoOfArticle());
			request.setAttribute("noOfPackages", "" + wayBillModel.getNoOfPackages());

			if(execFieldPermissions.get(FeildPermissionsConstant.ALLOW_BOOKING_TIME_PHOTO_SERVICE) != null){
				photoServiceActor 			= new PhotoServiceActor();
				bookingTimePhoto			= new ValueObject();

				bookingTimePhoto.put("moduleId", ModuleIdentifierConstant.BOOKING);
				bookingTimePhoto.put("waybillId", wayBill.getWayBillId());
				bookingTimePhoto 			= photoServiceActor.getPhotoDetail(bookingTimePhoto);
				photoImage			= (String) bookingTimePhoto.get("photoTransactionPhoto");

				if(photoImage != null)
					request.setAttribute("imageString", photoImage);
			}

			final var articleTypeMaster = cache.getArticleTypeMasterById(request,consignment[0].getArticleTypeMasterId());

			if(articleTypeMaster != null)
				request.setAttribute("typeOfArticle", articleTypeMaster.getName());
			else
				request.setAttribute("typeOfArticle", "");

			wayBillType = cache.getWayBillTypeById(request, wayBill.getWayBillTypeId());

			if(wayBill.isManual())
				wayBill.setWayBillType(wayBillType.getWayBillType() + WayBillType.WAYBILL_TYPE_MANUAL_2);
			else
				wayBill.setWayBillType(wayBillType.getWayBillType());

			var rateConfiguration = cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_RATE_CONFIGURATION);

			if(rateConfiguration == ConfigParam.CONFIG_KEY_VALUE_RATE_CONFIGURATION_MANUAL
					|| rateConfiguration == ConfigParam.CONFIG_KEY_VALUE_RATE_CONFIGURATION_AUTO)
				if(wayBillType.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_FOC)
					request.setAttribute("isDisplayable", false);
				else
					request.setAttribute("isDisplayable", true);

			//*************************Done for Rishabh Travels Only*************************//
			if(wayBill.getAccountGroupId() == ECargoConstantFile.ACCOUNTGORUPID_RISHABH_TRAVELS
					&& wayBill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT
					&& executive.getExecutiveType() != ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN){
				request.setAttribute("isDisplayable", false);
				request.setAttribute("doNotShowConsignmentAmount", true);
			}

			if(wayBill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT
					&& wayBillModel.getCorporateAccountSubType() == CorporateAccount.CORPORATEACCOUNT_SUB_TYPE_KG
					|| wayBillModel.getCorporateAccountSubType() == CorporateAccount.CORPORATEACCOUNT_SUB_TYPE_PACKAGE_TYPE)
				request.setAttribute("doNotShowAmountOnPrint", true);

			if (request.getSession().getAttribute("reprint") != null
					&& !(boolean) request.getSession().getAttribute("reprint"))
				request.setAttribute("reprint", false);
			else
				request.setAttribute("reprint", true);

			request.getSession().setAttribute("reprint", true);

			if((boolean) lrPrintConfigHM.getOrDefault(LRPrintPropertiesConstant.GET_ID_PROOF_DETAILS, false)) {
				final var	idProofDetailsServiceInfo  = new IDProofDetailsServiceInfo();
				idProofDetailsServiceInfo.setModuleTransactionId(consignor.getCustomerDetailsId());
				idProofDetailsServiceInfo.setServiceId(Service.PHOTO_TRANSACTION);
				idProofDetailsServiceInfo.setModuleId(ModuleIdentifierConstant.BOOKING);
				idProofDetailsServiceInfoList = IDProofDetailsServiceInfoDaoImpl.getInstance().getIDProofDataForService(idProofDetailsServiceInfo);
				request.setAttribute("idProofDetailsServiceInfoList", idProofDetailsServiceInfoList);
			}

			pakgMaster    = new PackingTypeMaster[consignment.length];
			PackagesCollectionDetails 				packagesCollectionDetails 	= null;
			packagesCollection 			= new HashMap<>();

			for (var i = 0; i < consignment.length; i++) {
				packageId     = consignment[i].getPackingTypeMasterId();
				pakgMaster[i] = cache.getPackingTypeMasterById(request, packageId);
				actualWeight  = actualWeight + consignment[i].getActualWeight();
				chargedWeight = chargedWeight + consignment[i].getChargeWeight();
				length        = length + consignment[i].getLength();
				breadth       = breadth + consignment[i].getBreadth();
				height        = height + consignment[i].getHeight();
				quantity	  += consignment[i].getQuantity();

				if(executive.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNT_GORUP_ID_KALPANA_CARGO
						|| executive.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNT_GORUP_ID_AMAR_TRAVELS
						|| executive.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNT_GROUP_ID_MAYUR_CARGO
						|| executive.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNT_GROUP_ID_SETT){
					packagesCollectionDetails = packagesCollection.get(consignment[i].getPackingTypeMasterId());

					if(packagesCollectionDetails == null){
						packagesCollectionDetails = new PackagesCollectionDetails();

						packagesCollectionDetails.setPackagesTypeId(consignment[i].getPackingTypeMasterId());
						packagesCollectionDetails.setPackagesTypeName(consignment[i].getPackingTypeName());
						packagesCollectionDetails.setTotalQuantity(packagesCollectionDetails.getTotalQuantity() + consignment[i].getQuantity());
						packagesCollectionDetails.setTotalWeight(packagesCollectionDetails.getTotalWeight() + consignment[i].getActualWeight());
						packagesCollectionDetails.setTotalAmount(packagesCollectionDetails.getTotalAmount() + consignment[i].getAmount());

						packagesCollection.put(consignment[i].getPackingTypeMasterId(), packagesCollectionDetails);
					}else{
						packagesCollectionDetails.setPackagesTypeId(consignment[i].getPackingTypeMasterId());
						packagesCollectionDetails.setPackagesTypeName(consignment[i].getPackingTypeName());
						packagesCollectionDetails.setTotalQuantity(packagesCollectionDetails.getTotalQuantity() + consignment[i].getQuantity());
						packagesCollectionDetails.setTotalWeight(packagesCollectionDetails.getTotalWeight() + consignment[i].getActualWeight());
						packagesCollectionDetails.setTotalAmount(packagesCollectionDetails.getTotalAmount() + consignment[i].getAmount());
					}
				}
			}

			request.setAttribute("packagesCollection", packagesCollection);
			request.setAttribute("pakgMaster", pakgMaster);
			request.setAttribute("actualWeight",  actualWeight);
			request.setAttribute("chargedWeight", chargedWeight+actualWeight);
			request.setAttribute("cft", length + " X " + breadth + " X " + height);
			request.setAttribute("quantity", quantity);

			if (request.getParameter("rp") != null)
				request.setAttribute("rp", JSPUtility.GetInt(request, "rp", 1));

			request.setAttribute("wayBill", wayBill);
			dateFormatForTimeLog =new SimpleDateFormat("mm:ss");
			dateFormatForTimeLog.setTimeZone(TimeZone.getTimeZone("GMT"));

			if(executive.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNT_GORUP_ID_KALPANA_CARGO) {
				final var session = request.getSession();
				final var createdWayBillIds = (HashMap<String, String>)session.getAttribute("createdWayBillIds");

				if(createdWayBillIds != null)
					if(createdWayBillIds.get(""+wayBillId) != null){
						createdWayBillIds.remove(""+wayBillId);
						request.removeAttribute("OpenPopUp");
						request.removeAttribute("doNotPrint");
						session.setAttribute("createdWayBillIds", createdWayBillIds);
					} else
						request.setAttribute("OpenPopUp","true" );
			}

			consignment = wayBillModel.getConsignmentDetails();

			for (final ConsignmentDetails element : consignment)
				totalNumberofQty += element.getQuantity();

			request.setAttribute("totalNumberofQty", totalNumberofQty);
			request.setAttribute("packageDetails", consignment);

			consignee = wayBillModel.getConsigneeDetails();
			consignor = wayBillModel.getConsignorDetails();

			if(consignor.getBillingPartyId() > 0) {
				final var corporateColl = CorporateAccountDao.getInstance().getCorporateAccountDetails(""+consignor.getBillingPartyId());

				if(corporateColl != null && corporateColl.get(consignor.getBillingPartyId()) != null)
					consignor.setBillingPartyName(corporateColl.get(consignor.getBillingPartyId()).getName());
				else
					consignor.setBillingPartyName("--");
			}

			request.setAttribute("BookingCharges",cache.getActiveBookingCharges(request, executive.getBranchId()));
			request.setAttribute("DeliveryCharges",cache.getActiveDeliveryCharges(request, executive.getBranchId()));

			wayBill.setDestinationSubRegionId(cache.getGenericBranchDetailCache(request, wayBill.getDestinationBranchId()).getSubRegionId());

			assignedLocationIdList = cache.getAssignedLocationsIdListByLocationIdId(request, executive.getBranchId(), executive.getAccountGroupId());
			request.setAttribute("assignedLocationIdList", assignedLocationIdList);

			if(wayBill.getBookingCrossingAgentId() > 0){
				final var	agentMaster = CrossingAgentMasterDaoImpl.getInstance().getCrossingAgentDetailsById(wayBill.getBookingCrossingAgentId());

				if(agentMaster != null)
					wayBill.setCrossingAgentName(agentMaster.getName());
			}

			bookedExecutive = ExecutiveDao.getInstance().findByExecutiveId(wayBill.getExecutiveId());
			//WayBillHistory code done Here
			wayBillHistory = wayBillModel.getWayBillHistory();

			if(wayBillHistory != null){
				wbBookingDateTime = wayBillHistory.getCreationDateTimeStamp();

				if(waybillStatus == WayBillStatusConstant.WAYBILL_STATUS_BOOKED){
					wayBill.setCreationDateTimeStamp(wayBillHistory.getCreationDateTimeStamp());
					wayBill.setRemark(wayBillHistory.getRemark());
				}
			}else if(wayBill.getStatus() != WayBillStatusConstant.WAYBILL_STATUS_BOOKED){
				wbAtBkdStatus = WayBillDao.getInstance().getWayBillDetailsByStatus(Long.toString(wayBill.getWayBillId()), WayBillStatusConstant.WAYBILL_STATUS_BOOKED);

				if(wbAtBkdStatus != null){
					wayBill2 = wbAtBkdStatus.get(wayBill.getWayBillId());

					if(wayBill2 != null) {
						wbBookingDateTime = wayBill2.getCreationDateTimeStamp();
						bookedExecutive = ExecutiveDao.getInstance().findByExecutiveId(wayBill2.getExecutiveId());
					}
				}
			}

			wayBill.setBookingDateTimeStr(DateTimeUtility.getDateFromTimeStampWithAMPM(wayBill.getBookingDateTime()));

			request.setAttribute("BookingDateTime", wbBookingDateTime);
			//WayBillHistory code end Here
			request.setAttribute("bookedExecutive", bookedExecutive.getName());

			wayBillChargesCol = new HashMap<>();

			if(wayBillCharges != null)
				for (final WayBillCharges wayBillCharge : wayBillCharges) {
					chargeTypeMaster = cache.getChargeTypeMasterById(request,wayBillCharge.getWayBillChargeMasterId());
					wayBillCharge.setName(chargeTypeMaster.getChargeName());
					wayBillChargesCol.put(wayBillCharge.getWayBillChargeMasterId(), wayBillCharge);
				}

			request.setAttribute("wayBillChargesCol", wayBillChargesCol);
			request.setAttribute("consignee", consignee);
			request.setAttribute("consignor", consignor);

			if(executive.getAccountGroupId() == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_SNGT){
				if(consignmentSummary.getTaxBy() == 0 && wayBill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY
						&& consignee.getPartyType() == CorporateAccount.PARTY_TYPE_GENERAL && consignee.getCorporateAccountId() > 0){
					corporateAccount 	= CorporateAccountDao.getInstance().getLimitedPartyDataById(consignee.getCorporateAccountId());
					partyId = consignee.getCorporateAccountId();
				}

				if(corporateAccount != null && corporateAccount.isServiceTaxRequired())
					isTaxPaidByTrans = true;
			}

			request.setAttribute("partyId",partyId);
			request.setAttribute("isTaxPaidByTrans",isTaxPaidByTrans);

			//chk for manual delivery sequence
			//specify the sequenceCounter type for RANGE_INCREMENT(DB check) --- By Prakash
			request.setAttribute("DeliverySequenceCounter", DeliverySequenceCounterDao.getInstance().getDeliverySequenceCounterNextValue(executive.getAccountGroupId(), executive.getBranchId(), DeliverySequenceCounter.DELIVERY_SEQUENCE_MANUAL));

			request.setAttribute("TopayToPaidAmount", 0);

			if(wayBill.getStatus()==WayBillStatusConstant.WAYBILL_STATUS_BOOKED && executive.getAccountGroupId() == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_LMT){

				// Check If Income Exists On WayBill
				isIncomeExists  = WayBillIncomeDao.getInstance().getIncomeDetailsByWayBillId(wayBillId,TransportCommonMaster.CHARGE_TYPE_LR);

				// Check If Expense Exists On WayBill
				isExpenseExists = WayBillExpenseDao.getInstance().getExpenseDetailsByWayBillId(wayBillId,TransportCommonMaster.CHARGE_TYPE_LR);
			}
			request.setAttribute("isIncomeExists",  isIncomeExists);
			request.setAttribute("isExpenseExists", isExpenseExists);

			accountGroup = cache.getAccountGroupById(request, executive.getAccountGroupId());
			request.setAttribute("accountGroup", accountGroup);

			branch = cache.getGenericBranchDetailCache(request,  wayBill.getBranchId());
			request.setAttribute("branch", branch);

			request.setAttribute("executive", executive);

			srcBranch = cache.getGenericBranchDetailCache(request,wayBill.getSourceBranchId());
			destBranch  = cache.getGenericBranchDetailCache(request,wayBill.getDestinationBranchId());
			sourceRegion = cache.getRegionByIdAndGroupId(request, srcBranch.getRegionId(), executive.getAccountGroupId());
			destBranchRegion	= cache.getRegionByIdAndGroupId(request, destBranch.getRegionId(), executive.getAccountGroupId());

			request.setAttribute("sourceRegion", sourceRegion);
			request.setAttribute("destBranchRegion", destBranchRegion);

			if(srcBranch != null)
				srcBranch.setSubRegionName(cache.getGenericSubRegionById(request, srcBranch.getSubRegionId()).getName());

			request.setAttribute("srcBranch", srcBranch);

			destBranch = cache.getGenericBranchDetailCache(request,wayBill.getDestinationBranchId());
			LocationsMapping locationMap = null;

			if(destBranch != null){
				subRegion = cache.getGenericSubRegionById(request, destBranch.getSubRegionId());
				destBranch.setSubRegionName(subRegion.getName());
				destBranch.setSubRegionCode(subRegion.getSubRegionCode());
				locationMap = cache.getLocationMapping(request, executive.getAccountGroupId(), destBranch.getBranchId());

				if(destBranch.getTypeOfLocation() == Branch.TYPE_OF_LOCATION_OPERATIONAL_PLACE)
					destBranch.setHandlingBranchName(cache.getGenericBranchDetailCache(request, locationMap.getLocationId()).getName());
			}

			request.setAttribute("destBranch", destBranch);

			request.setAttribute("noOfArticle", "" + wayBillModel.getNoOfArticle());
			request.setAttribute("noOfPackages", "" + wayBillModel.getNoOfPackages());

			wayBillType = cache.getWayBillTypeById(request, wayBill.getWayBillTypeId());
			if(wayBill.isManual())
				wayBill.setWayBillType(wayBillType.getWayBillType() + WayBillType.WAYBILL_TYPE_MANUAL_2);
			else
				wayBill.setWayBillType(wayBillType.getWayBillType());

			rateConfiguration = cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_RATE_CONFIGURATION);

			if(rateConfiguration == ConfigParam.CONFIG_KEY_VALUE_RATE_CONFIGURATION_MANUAL
					|| rateConfiguration == ConfigParam.CONFIG_KEY_VALUE_RATE_CONFIGURATION_AUTO)
				request.setAttribute("isDisplayable", true);

			if (request.getSession().getAttribute("reprint") != null
					&& !(boolean) request.getSession().getAttribute("reprint"))
				request.setAttribute("reprint", false);
			else
				request.setAttribute("reprint", true);

			request.setAttribute("isRePrint", JSPUtility.GetBoolean(request, "isRePrint",true));

			request.getSession().setAttribute("reprint", true);

			pakgMaster    			= new PackingTypeMaster[consignment.length];
			packagesCollection 		= new HashMap<>();

			for (var i = 0; i < consignment.length; i++) {
				packageId     = consignment[i].getPackingTypeMasterId();
				pakgMaster[i] = cache.getPackingTypeMasterById(request, packageId);
				actualWeight  = actualWeight + consignment[i].getActualWeight();
				chargedWeight = chargedWeight + consignment[i].getChargeWeight();
				length        = length + consignment[i].getLength();
				breadth       = breadth + consignment[i].getBreadth();
				height        = height + consignment[i].getHeight();
				quantity	  += consignment[i].getQuantity();

			}

			request.setAttribute("packagesCollection1", packagesCollection);
			request.setAttribute("pakgMaster", pakgMaster);
			request.setAttribute("actualWeight",  actualWeight);
			request.setAttribute("chargedWeight", chargedWeight+actualWeight);
			request.setAttribute("cft", length + " X " + breadth + " X " + height);
			request.setAttribute("quantity", quantity);

			if (request.getParameter("rp") != null)
				request.setAttribute("rp", JSPUtility.GetInt(request, "rp", 1));

			request.setAttribute("LoggedInBranchDetails", cache.getGenericBranchDetailCache(request,executive.getBranchId()));

			//Short Credit Payment (Start)

			if(execFieldPermissions.get(FeildPermissionsConstant.SHORT_CREDIT_PAYMENT_ON_LR_VIEW) != null && consignmentSummary.getPaymentType() == PaymentTypeConstant.PAYMENT_TYPE_CREDIT_ID) {
				outValObj 				= CreditPaymentModuleBLL.getInstance().getCreditPaymentDataForSingleWayBill(executive.getAccountGroupId(),CreditWayBillTxn.TXN_TYPE_BOOKING_ID, wayBill.getWayBillNumber(),(short)1, minDateTimeStamp,(short)0);

				if(outValObj != null){
					creditWayBillTxn 		= (CreditWayBillTxn[])outValObj.get("CreditWayBillTxn");
					creditWayBillTxnIdArray = (Long[])outValObj.get("creditWayBillTxnIdArray");

					if(creditWayBillTxnIdArray != null && creditWayBillTxnIdArray.length > 0){
						creditWayBillTxnIds	= Utility.GetLongArrayToString(creditWayBillTxnIdArray);

						valueObjectFromCreditWBTxn		= CreditWayBillTxnClearanceSummaryDAO.getInstance().getCreditWayBillTxnClearanceDetails(creditWayBillTxnIds);

						if(valueObjectFromCreditWBTxn != null){
							creditWayBillTxnClearanceSumHM	= (HashMap<Long, CreditWayBillTxnCleranceSummary>) valueObjectFromCreditWBTxn.get("creditWayBillTxnClearanceSumHM");

							request.setAttribute("creditWayBillTxnClearanceSumHM", creditWayBillTxnClearanceSumHM);
						}

					}
					if(executive.getBranchId() == creditWayBillTxn[0].getBranchId())
						request.setAttribute("creditWayBillTxn", creditWayBillTxn[0]);
				}
			}

			//Short Credit Payment (End)

			request.setAttribute("ManualCRDaysAllowed",noOfDays);

			dateFormatForTimeLog =new SimpleDateFormat("mm:ss");
			dateFormatForTimeLog.setTimeZone(TimeZone.getTimeZone("GMT"));

			if(executive.getAccountGroupId() == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_NEW_ERA_TRANPORTS || executive.getAccountGroupId() == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_NEW_ERA_TRANPORTS_CO)
				if(consignee != null && consignee.getPartyType() == CorporateAccount.PARTY_TYPE_GENERAL && consignee.getCorporateAccountId() > 0){
					corporateAccount = CorporateAccountDao.getInstance().getTinNumByPartyMasterId(consignee.getCorporateAccountId());

					if(corporateAccount != null && corporateAccount.getTinNumber() != null)
						request.setAttribute("consigneeTinNum", corporateAccount.getTinNumber());
				}

			//Get DiscountTypes
			discountTypes = DiscountMasterDAO.getInstance().getDiscountTypes();
			request.setAttribute("discountTypes", discountTypes);

			generalConfiguration = cache.getGeneralConfiguration(request, executive.getAccountGroupId());

			if(generalConfiguration != null){
				bookingTimeExcludeChargeIds 			=  generalConfiguration.getString(GeneralConfiguration.BookingTimeExcludeChargeIds, null);
				bookingTimeExcludeChargeIds = Utility.getBookingTimeExcludeChargeIds(bookingTimeExcludeChargeIds);

				if(bookingTimeExcludeChargeIds != null && bookingTimeExcludeChargeIds.length() > 0)
					wayBillChargeAmountList = WayBillChargeAmountDao.getInstance().getWayBillChargeAmountByWayBillIdAndChargeMasterIds(""+wayBillId, bookingTimeExcludeChargeIds);
			}

			request.setAttribute("wayBillChargeAmountList", wayBillChargeAmountList);

			if(execFieldPermissions.get(FeildPermissionsConstant.EDIT_DESTINATION_AT_LR_PRINT) != null)
				editDestinationAtLRPrint = true;

			if(execFieldPermissions.get(FeildPermissionsConstant.EDIT_ACTUAL_WEIGHT_AT_LR_PRINT) != null)
				editActualWeightAtLRPrint = true;

			print		= new ValueObject();

			if(freightUptoBranch != null)
				print.put("freightUptoBranch", Converter.DtoToHashMap(freightUptoBranch));

			if(srcBranch != null)
				print.put("sourceBranch", Converter.DtoToHashMap(srcBranch));

			formTypesArr	= FormTypesDao.getInstance().getFormTypesByWayBill(wayBillId);

			request.setAttribute("formTypes", formTypesArr);

			if(formTypesArr != null && formTypesArr.length > 0) {
				for (final FormTypes element : formTypesArr) {
					formTypeStr += element.getFormTypesName() + ", ";
					formTypeIds += element.getFormTypesId() + ",";

					if(executive.getAccountGroupId() == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_DECENT_LORRY_SERVICE
							&& element.getFormTypesId() == FormTypeConstant.CT_FORM_NOT_RECEIVED_ID)
						consignmentSummary.setFormTypeId(element.getFormTypesId());
				}

				formTypeStr = formTypeStr.substring(0, formTypeStr.length() - 4);
			}

			request.setAttribute("formTypeStr", formTypeStr);
			request.setAttribute("formTypeIds", formTypeIds);

			if(configuration.getBoolean(GroupConfigurationPropertiesDTO.ALLOW_RESET_BOOKING_PAGE)) {
				regionIdsForBookingPageChnage   = new ArrayList<>();
				regionWiseBookingPage 					= configuration.getString(GroupConfigurationPropertiesDTO.RESET_BOOKING_PAGE_ON_REGION_IDS);
				regionIdsForBookingPageChnage = Stream.of(regionWiseBookingPage.split(",")).map(Long::parseLong).collect(Collectors.toList());
				allowRegionIdsForBookingChanges =  regionIdsForBookingPageChnage.contains(srcBranch.getRegionId());
			}
			request.setAttribute("allowRegionWiseBookingPage",allowRegionIdsForBookingChanges);

			if(consignment != null)
				for(final ConsignmentDetails consignmentDetail:consignment)
					consignmentDetail.setPackingTypeName(cache.getPackingTypeMasterById(request, consignmentDetail.getPackingTypeMasterId()).getName());

			if(wayBill.getBookingTimeServiceTax() > 0) {
				request.setAttribute("tax1", 0.0);
				request.setAttribute("tax2", 0.0);
			}

			consignmentSummary.setExciseInvoiceName(TransportCommonMaster.getExciseInvoice(consignmentSummary.getExciseInvoice()));
			consignmentSummary.setConsignmentInsuredName(TransportCommonMaster.getConsignmentInsured(consignmentSummary.getConsignmentInsured()));
			consignmentSummary.setConsignmentSummaryDeliveryToString(InfoForDeliveryConstant.getInfoForDelivery(consignmentSummary.getDeliveryTo()));

			print.put("isRePrint", JSPUtility.GetBoolean(request, "isRePrint",true));
			print.put("formTypes", Converter.arrayDtotoArrayListWithHashMapConversion(formTypesArr));
			print.put("executive", Converter.DtoToHashMap(executive));
			print.put("destinationBranch", Converter.DtoToHashMap(destBranch));
			print.put("consigneeDetails", Converter.DtoToHashMap(consignee));
			print.put("consignorDetails", Converter.DtoToHashMap(consignor));
			print.put("consignmentSummary", Converter.DtoToHashMap(consignmentSummary));
			print.put("consignmentDetails", Converter.arrayDtotoArrayListWithHashMapConversion(consignment));
			print.put("wayBillCharges", wayBillBookingChargesValueObject(wayBillCharges));
			print.put("wayBillTaxTxn", Converter.arrayDtotoArrayListWithHashMapConversion(wayBillTaxTxn));
			print.put("wayBill", Converter.DtoToHashMap(wayBill));
			print.put("TaxPaidBy", TransportCommonMaster.getTaxPaidBy(consignmentSummary.getTaxBy()));
			print.put("currDate", dateFormat.format(date));
			print.put("bookedByName", bookedExecutive.getName());
			print.put("srcCity",Converter.DtoToHashMap(srcCity));
			print.put("destCity",Converter.DtoToHashMap(destCity));
			print.put("srcSubRegion", Converter.DtoToHashMap(srcSubRegion));
			print.put("destSubRegion", Converter.DtoToHashMap(destSubRegion));
			print.put("accountGroup", Converter.DtoToHashMap(accountGroup));
			print.put("editDestinationAtLRPrint", editDestinationAtLRPrint);
			print.put("editActualWeightAtLRPrint", editActualWeightAtLRPrint);
			print.put("tax1", 0.0);
			print.put("tax2", 0.0);
			print.put("confValObj", confValObj);
			print.put("mmtAccountgrpId", CargoAccountGroupConstant.ACCOUNT_GROUP_ID_MMT);
			print.put("idProofDetailsServiceInfoList", idProofDetailsServiceInfoList);

			JsonConstant.getInstance().setOutputConstant(print);

			valueObject		= new ValueObject();
			valueObject.put("printJson", print);

			final var object = JsonUtility.convertionToJsonObjectForResponse(valueObject);

			request.setAttribute("printJsonObject", object);

			if(executive.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNT_GROUP_ID_RAMAN_HOLDING){
				if(executive.getRegionId() == Region.REGION_ROYAL_CSPL)
					request.setAttribute("nextPageToken", "success_" + CargoAccountGroupConstant.ACCOUNT_GORUP_ID_ROYAL_EXPRESS);
				else
					request.setAttribute("nextPageToken", "success_" + CargoAccountGroupConstant.ACCOUNT_GROUP_ID_RAMAN_HOLDING);
			} else
				request.setAttribute("nextPageToken", "success_" + executive.getAccountGroupId());
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}

	private ValueObject wayBillBookingChargesValueObject(final WayBillCharges[] wayBillCharges) throws Exception {
		ValueObject valueObject	= null;

		try {
			if (wayBillCharges != null) {
				valueObject	= new ValueObject();

				for (final WayBillCharges wayBillCharge : wayBillCharges)
					valueObject.put(Long.toString(wayBillCharge.getWayBillChargeMasterId()), Converter.DtoToHashMap(wayBillCharge));
			}

			return valueObject;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, BookingPrintWayBillAction.TRACE_ID);
		}
	}

}