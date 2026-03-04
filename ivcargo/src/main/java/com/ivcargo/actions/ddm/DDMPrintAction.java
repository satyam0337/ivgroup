package com.ivcargo.actions.ddm;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedHashMap;
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
import com.businesslogic.ddmSettlement.DDMSettlementPrintBLL;
import com.businesslogic.properties.impl.PropertyConfigValueBLLImpl;
import com.businesslogic.waybill.FormTypesBLL;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.bll.impl.properties.DisplayDataConfigurationBllImpl;
import com.iv.constant.properties.DDMConfigurationConstant;
import com.iv.constant.properties.DDMPrintConfigurationConstant;
import com.iv.constant.properties.DDMSettlementPropertiesConstant;
import com.iv.dao.impl.incomeexpense.WayBillExpenseDaoImpl;
import com.iv.dto.ArticleTypeMaster;
import com.iv.dto.constant.BookingChargeConstant;
import com.iv.dto.constant.FormTypeConstant;
import com.iv.dto.constant.InfoForDeliveryConstant;
import com.iv.dto.constant.LHPVChargeTypeConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.dto.constant.PODStatusConstant;
import com.iv.dto.constant.PaymentTypeConstant;
import com.iv.dto.constant.WayBillTypeConstant;
import com.iv.properties.constant.DisplayDataWithinDateRangePropertiesConstant;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.constant.AccountGroupConstant;
import com.iv.utils.constant.Constant;
import com.iv.utils.constant.DateTimeFormatConstant;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.exception.ExceptionProcess;
import com.iv.utils.utility.SortUtils;
import com.iv.utils.utility.SplitLRNumber;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.reports.ReportView;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.ConsignmentDetailsDao;
import com.platform.dao.ConsignmentSummaryDao;
import com.platform.dao.CustomerDetailsDao;
import com.platform.dao.DeliveryRunSheetSummaryDao;
import com.platform.dao.DriverMasterDao;
import com.platform.dao.ExpenseChargeDao;
import com.platform.dao.LHPVDao;
import com.platform.dao.LhpvSettlementChargesDao;
import com.platform.dao.PrintManifestDao;
import com.platform.dao.WayBillBookingChargesDao;
import com.platform.dao.WayBillDeliveryChargesDao;
import com.platform.dao.reports.WayBillDetailsDAO;
import com.platform.dao.waybill.FormTypesDao;
import com.platform.dto.AliasNameConstants;
import com.platform.dto.Branch;
import com.platform.dto.ChargeTypeMaster;
import com.platform.dto.ConsignmentDetails;
import com.platform.dto.ConsignmentSummary;
import com.platform.dto.CustomGroupMapper;
import com.platform.dto.CustomerDetails;
import com.platform.dto.DeliveryRunSheetLedger;
import com.platform.dto.DriverMaster;
import com.platform.dto.Executive;
import com.platform.dto.IncomeExpenseChargeMaster;
import com.platform.dto.LHPV;
import com.platform.dto.LHPVModel;
import com.platform.dto.LhpvSettlementCharges;
import com.platform.dto.PackingTypeMaster;
import com.platform.dto.PropertiesFileConstants;
import com.platform.dto.TransportCommonMaster;
import com.platform.dto.VehicleNumberMaster;
import com.platform.dto.WayBillBookingCharges;
import com.platform.dto.WayBillCharges;
import com.platform.dto.WayBillCrossing;
import com.platform.dto.WayBillDeliveryCharges;
import com.platform.dto.WayBillTaxTxn;
import com.platform.dto.WayBillType;
import com.platform.dto.configuration.modules.RegionOrBranchWiseGroupNameDTO;
import com.platform.dto.configuration.report.CustomGroupConfigurationDTO;
import com.platform.dto.model.ChargeTypeModel;
import com.platform.dto.model.ReportViewModel;
import com.platform.dto.model.SourceWiseWayBillCrossingSummary;
import com.platform.dto.model.WayBillCategoryTypeDetails;
import com.platform.dto.model.WayBillDeatailsModel;
import com.platform.dto.model.WayBillViewModel;
import com.platform.dto.model.ddm.DDMPrint;
import com.platform.dto.waybill.FormTypes;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

public class DDMPrintAction implements Action {

	public static final String 					TRACE_ID 				= "DDMPrintAction";
	Executive                  					executive				= null;
	HashMap<Long,PackingTypeMaster> 			wbPackingTypeDetails 	= null;
	HashMap<String,WayBillCategoryTypeDetails> 	wbCategoryTypeDetails 	= null;
	HashMap<Long, WayBillDeatailsModel> 		wayBillDetails 			= null;
	CacheManip       							cache            		= null;
	HashMap<Long, Timestamp> 					bookingDateTime 		= null;
	String										deliveryPlace			= null;
	long 										totalPackages 			= 0;
	long 										totalDocsOnPackages 	= 0;
	long 										totalNonDocsOnPackages 	= 0;
	HashMap<Long, CustomerDetails>				consignorHM				= null;
	HashMap<Long, CustomerDetails>				consigneeHM				= null;
	boolean										formNumberExistsInDDM	= false;

	@Override
	@SuppressWarnings({ "unchecked", "rawtypes"})
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {

		HashMap<String,Object>	 							error 						= null;
		ValueObject 										inValObj        	 		= null;
		LinkedHashMap<Long, DDMPrint>						printData					= null;
		Long[] 												wayBillIdArray 				= null;
		String 												wayBillIdStr 				= null;
		final WayBillCrossing										wayBillCrossing 			= null;
		Map<Long,Double> 									wayBillIdWiseHM				= null;
		DeliveryRunSheetLedger								deliveryRunSheetLedger		= null;
		Map<Object, Object>									ddmPropertiesHM				= null;
		var													counter						= 0;
		var													counter2					= 0;
		Branch                  							branch						= null;
		Branch                  							ddmBranch					= null;
		FormTypesBLL										formTypesBLL				= null;
		List<WayBillViewModel>  							wayBillViewModelList		= null;
		VehicleNumberMaster									vehicleNumberMaster			= null;
		short	 											settleStatus 				= 0;
		Timestamp											settlementTime 				= null;
		ValueObject 										valOutObj 					= null;
		DDMSettlementPrintBLL								ddmSettlementPrintBLL		= null;
		ValueObject											groupConfiguration			= null;
		ValueObject											lhpvChargesObj				= null;
		LHPVModel											lhpvModel					= null;
		LHPV 												lhpv 						= null;
		Double												lhpvTotal					= 0.0;
		ValueObject											customGroupConfig			= null;
		ChargeTypeModel[]									bookingCharges				= null;
		Map<Long, Double> 									lrColl 					    = null;
		ValueObject											configuration				= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			wbPackingTypeDetails 			= new HashMap<>();
			wbCategoryTypeDetails 			= new HashMap<>();
			wayBillDetails 					= new HashMap<>();
			cache							= new CacheManip(request);
			executive 						= cache.getExecutive(request);
			inValObj         				= new ValueObject();
			formTypesBLL					= new FormTypesBLL();
			lhpvModel			            = new LHPVModel();
			final var deliveryRunSheetLedgerId   = JSPUtility.GetLong(request, "deliveryRunSheetLedgerId");
			final var	ddmPrintConfiguration			= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.DDM_PRINT);
			final var	ddmSettlementPropertiesHM	    = cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.DDM_SETTLEMENT);
			groupConfiguration				= cache.getGroupConfiguration(request, executive.getAccountGroupId());
			customGroupConfig				= PropertyConfigValueBLLImpl.getInstance().getConfiguration(executive, PropertiesFileConstants.CUSTOM_GROUP_CONFIG);
			configuration					= PropertyConfigValueBLLImpl.getInstance().getConfiguration(executive, PropertiesFileConstants.REGION_OR_BRANCH_WISE_GROUPNAME_CONFIG);
			bookingCharges 					= cache.getActiveBookingCharges(request, executive.getBranchId());

			final var displayDataConfig	= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.DISPLAY_DATA_CONFIGURATION);

			displayDataConfig.put(Constant.EXEC_FEILD_PERMISSION, cache.getExecutiveFieldPermission(request));
			displayDataConfig.put(Constant.EXECUTIVE_TYPE, executive.getExecutiveType());

			inValObj.put("AccountGroupId", executive.getAccountGroupId());
			inValObj.put("deliveryRunSheetLedgerId", deliveryRunSheetLedgerId);

			final var ddmDataList = PrintManifestDao.getInstance().getDDMPrintOutboundManifest(deliveryRunSheetLedgerId);

			if(ObjectUtils.isEmpty(ddmDataList)) {
				error.put(AliasNameConstants.ERROR_CODE, CargoErrorList.NO_RECORDS);
				error.put(AliasNameConstants.ERROR_DESCRIPTION, CargoErrorList.NO_RECORDS_DESCRIPTION);
				request.setAttribute("cargoError", error);
				request.setAttribute("nextPageToken", "success_"+executive.getAccountGroupId());
				return;
			}

			printData 		= ddmDataList.stream().collect(Collectors.toMap(DDMPrint::getWayBillId, Function.identity(), (e1, e2) -> e1 = merge(e1, e2), LinkedHashMap::new ));
			wayBillIdArray 	= ddmDataList.stream().map(DDMPrint::getWayBillId).distinct().toArray(Long[]::new);

			if((boolean) ddmSettlementPropertiesHM.getOrDefault(DDMSettlementPropertiesConstant.DDM_SETTLEMENT_DETAILS_PRINT_IN_DDM_PRINT, false)) {
				inValObj.put(AliasNameConstants.EXECUTIVE, executive);
				//inValObj.put(AliasNameConstants.ALL_GROUP_BRANCHES, cache.getAllGroupBranches(request, executive.getAccountGroupId()));
				inValObj.put(AliasNameConstants.ALL_BRANCHES, cache.getGenericBranchesDetail(request));
				inValObj.put(AliasNameConstants.ALL_SUBREGIONS, cache.getAllSubRegions(request));
				inValObj.put(AliasNameConstants.ACCOUNT_GROUP, cache.getAccountGroupById(request, executive.getAccountGroupId()));
				inValObj.put(DisplayDataWithinDateRangePropertiesConstant.DISPLAY_DATA_CONFIGURATION_CONSTANT, displayDataConfig);

				ddmSettlementPrintBLL	= new DDMSettlementPrintBLL();
				valOutObj = ddmSettlementPrintBLL.getDDMSettlementPrintData(inValObj);

				if(valOutObj == null) {
					error.put("errorCode", CargoErrorList.NO_RECORDS);
					error.put("errorDescription", CargoErrorList.NO_RECORDS_DESCRIPTION);
					request.setAttribute("cargoError", error);
					request.setAttribute("nextPageToken", "success_"+executive.getAccountGroupId());
					return;
				}

				request.setAttribute("ddmSettlementSummaryModel", valOutObj.get("ddmSettlementSummaryModel"));
			}

			if(ObjectUtils.isNotEmpty(printData) && ObjectUtils.isNotEmpty(wayBillIdArray)) {
				ddmPropertiesHM 			= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.CREATE_DDM);
				wayBillIdStr  				= Utility.GetLongArrayToString(wayBillIdArray);
				final var showLorryHireAmountColumn	= (boolean) ddmPropertiesHM.getOrDefault(DDMConfigurationConstant.SHOW_LORRY_HIRE_AMOUNT_COLUMN, false);

				if(showLorryHireAmountColumn) {
					final Map<Long, IncomeExpenseChargeMaster> expenseChargeHM = ExpenseChargeDao.getInstance().getExpenseChargeByMappingChargeIdAndAccountGroupId(executive.getAccountGroupId(), ChargeTypeMaster.DOOR_DELIVERY_BOOKING, TransportCommonMaster.CHARGE_TYPE_LR);

					if(expenseChargeHM != null && expenseChargeHM.size() > 0) {
						final var expenseCharge 		  = expenseChargeHM.get(Long.parseLong(""+ChargeTypeMaster.DOOR_DELIVERY_BOOKING));
						lrColl = WayBillExpenseDaoImpl.getInstance().getWayBillExpenseByWayBillIdsAndExpenseChareMasterId(executive.getAccountGroupId(), wayBillIdStr, (short) expenseCharge.getIncomeExpenseChargeMasterId());
					}
				}

				final List<FormTypes> formTypesList		= FormTypesDao.getInstance().getFormTypesByWayBillIds(wayBillIdStr);

				if(formTypesList != null)
					formNumberExistsInDDM	= formTypesList.stream().anyMatch(e -> e.getFormTypesId() == FormTypeConstant.E_WAYBILL_ID && StringUtils.isNotEmpty(e.getFormNumber()));

				deliveryRunSheetLedger = populateDeliveryRunSheetLedger(request, printData.get(wayBillIdArray[0]), ddmPrintConfiguration);
				deliveryRunSheetLedger.setDeliveryRunSheetLedgerId(deliveryRunSheetLedgerId);

				final Map<Long, ConsignmentSummary>	conSumColl				= ConsignmentSummaryDao.getInstance().getLimitedConsignmentDetails(wayBillIdStr);
				final Map<Long, ArrayList<ConsignmentDetails>> 	conDtlsCol				= ConsignmentDetailsDao.getInstance().getConsignmentDetailsByWayBillIds(wayBillIdStr);
				consignorHM 			= CustomerDetailsDao.getInstance().getConsignorDetailsByWayBillId(wayBillIdStr);
				consigneeHM 			= CustomerDetailsDao.getInstance().getConsigneeDetailsByWayBillId(wayBillIdStr);
				final var	accountGroup			= cache.getAccountGroupById(request, executive.getAccountGroupId());

				final Map<Long, ArrayList<Short>>	formTypesIds			= formTypesBLL.getFormTypesIds(wayBillIdStr);
				final var	ddbWiseSelfPartyId			= CorporateAccountBLL.getInstance().getSelfPartyCorporateAccountId(groupConfiguration, accountGroup);
				//Get WayBill Details code ( Start )
				wayBillDetails = WayBillDetailsDAO.getInstance().getWayBillDetails(wayBillIdArray ,true ,ChargeTypeMaster.WAYBILL_CHARGETYPE_BOOKING ,true ,WayBillTaxTxn.WAYBILL_TAX_TXN_TYPE_BOOKING ,true);

				final var	showStatusColumn	= (boolean) ddmPrintConfiguration.getOrDefault(DDMPrintConfigurationConstant.SHOW_STATUS_COLUMN, false);

				request.setAttribute("showGroupHeaderOnPrint", (boolean) ddmPrintConfiguration.getOrDefault(DDMPrintConfigurationConstant.SHOW_GROUP_HEADER_ON_PRINT, false));
				request.setAttribute(DDMPrintConfigurationConstant.SHOW_COMPANY_LOGO, (boolean) ddmPrintConfiguration.getOrDefault(DDMPrintConfigurationConstant.SHOW_COMPANY_LOGO, false));

				if((boolean) ddmPrintConfiguration.getOrDefault(DDMPrintConfigurationConstant.SHOW_LHPV_DETAILS_IN_DDM_PRINT, false)) {
					if(deliveryRunSheetLedger.getLhpvId() > 0) {
						lhpvChargesObj			= LhpvSettlementChargesDao.getInstance().getSetlementChargesByBlhpvId(deliveryRunSheetLedger.getLhpvId(),LhpvSettlementCharges.IDENTIFIER_TYPE_LHPV);
						lhpv                    = LHPVDao.getInstance().getLimitedLHPVDataForEdit(deliveryRunSheetLedger.getLhpvId());
					}

					if(lhpvChargesObj != null && lhpvChargesObj.size() > 0) {
						final Map<Long, Double>	lhpvchargesColl		= (HashMap<Long, Double>) lhpvChargesObj.get("chargesColl");

						if(lhpvchargesColl != null) {
							lhpvModel.setTotalAmount(lhpvchargesColl.getOrDefault((long) LHPVChargeTypeConstant.LORRY_HIRE, 0d));
							lhpvModel.setOtherAdditionalCharge(lhpvchargesColl.getOrDefault((long) LHPVChargeTypeConstant.OTHER_ADDITIONAL, 0d));
							lhpvModel.setAdvanceAmount(lhpvchargesColl.getOrDefault((long) LHPVChargeTypeConstant.ADVANCE_AMOUNT, 0d));
							lhpvModel.setDirectDeliveryAmount(lhpvchargesColl.getOrDefault((long) LHPVChargeTypeConstant.DIRECT_DELIVERY_AMOUNT, 0d));
							lhpvModel.setBalanceAmount(lhpvchargesColl.getOrDefault((long) LHPVChargeTypeConstant.BALANCE_AMOUNT, 0d));
							lhpvModel.setRefund(lhpvchargesColl.getOrDefault((long) LHPVChargeTypeConstant.REFUND_AMOUNT, 0d));
							lhpvModel.setDriverCollection(lhpvchargesColl.getOrDefault((long) LHPVChargeTypeConstant.DRIVER_COLLECTION, 0d));
							lhpvModel.setAdditionalTruckAdvance(lhpvchargesColl.getOrDefault((long) LHPVChargeTypeConstant.ADDITIONAL_TRUCK_ADVANCE, 0d));
							lhpvModel.setExtraLorryHire(lhpvchargesColl.getOrDefault((long) LHPVChargeTypeConstant.EXT_LHC, 0d));
							lhpvModel.setDetentionatLoadingPoint(lhpvchargesColl.getOrDefault((long) LHPVChargeTypeConstant.DETENTION_AT_LOADING_POINT, 0d));
							lhpvModel.setLessTDS(lhpvchargesColl.getOrDefault((long) LHPVChargeTypeConstant.TDS, 0d));
							lhpvModel.setHamalicharge(lhpvchargesColl.getOrDefault((long) LHPVChargeTypeConstant.HAMALI, 0d));
							lhpvModel.setOtherCharge(lhpvchargesColl.getOrDefault((long) LHPVChargeTypeConstant.OTHER, 0d));
							lhpvModel.setOverLoadCharge(lhpvchargesColl.getOrDefault((long) LHPVChargeTypeConstant.OVER_LOAD, 0d));

							lhpvTotal	+= lhpvModel.getTotalAmount() + lhpvModel.getExtraLorryHire() + lhpvModel.getDetentionatLoadingPoint();
						}

						lhpvModel.setLhpvTotal(lhpvTotal);

						if(lhpv != null) {
							final var lhpvBranchDetails	= cache.getBranchById(request, executive.getAccountGroupId(), lhpv.getBalancePayableAtBranchId());

							if(lhpvBranchDetails != null)
								lhpvModel.setBalancePayableAtBranch(lhpvBranchDetails.getName());
						}

						if(lhpvModel != null)
							request.setAttribute("lhpvModel", lhpvModel);
					}
				}

				if((boolean) ddmPrintConfiguration.getOrDefault(DDMPrintConfigurationConstant.SHOW_DELIVERY_CHARGES_ON_PRINT, false)) {
					final var	wbIdWiseDlyChgsHM	= WayBillDeliveryChargesDao.getInstance().getWayBillIdWiseChargesMap(wayBillIdStr);
					request.setAttribute("wbIdWiseDlyChgsHM", wbIdWiseDlyChgsHM);
					request.setAttribute("deliveryCharges", cache.getActiveDeliveryCharges(request, executive.getBranchId()));

					final var chargeIdWiseSumAmount = new HashMap<Long, Double>();

					if(ObjectUtils.isNotEmpty(wbIdWiseDlyChgsHM))
						wbIdWiseDlyChgsHM.entrySet().stream()
						.map(Map.Entry<Long, HashMap<Long, WayBillDeliveryCharges>>::getValue).forEach((final Map<Long, WayBillDeliveryCharges> chrageMasterIdWiseHM) -> chrageMasterIdWiseHM.entrySet()
								.forEach((final Map.Entry<Long, WayBillDeliveryCharges> entry1) -> {
									final var wayBillDeliveryCharges = entry1.getValue();

									if (chargeIdWiseSumAmount.get(wayBillDeliveryCharges.getWayBillChargeMasterId()) == null)
										chargeIdWiseSumAmount.put(wayBillDeliveryCharges.getWayBillChargeMasterId(), wayBillDeliveryCharges.getChargeAmount());
									else
										chargeIdWiseSumAmount.put(wayBillDeliveryCharges.getWayBillChargeMasterId(),
												wayBillDeliveryCharges.getChargeAmount() + chargeIdWiseSumAmount.get(wayBillDeliveryCharges.getWayBillChargeMasterId()));
								}));

					request.setAttribute("chargeIdWiseSumAmount", chargeIdWiseSumAmount);
				}

				//Get WayBill Details code ( End )

				final var	srcWiseCrossingColl = new HashMap<Long, SourceWiseWayBillCrossingSummary>();
				var	wayBillViewList = new WayBillViewModel[printData.size()];
				var	reportViewModel = new ReportViewModel();
				var topayAmt = 0.00;
				var paidAmt = 0.00;
				var tbbamt = 0.00;

				final var lrTypeWiseZeroAmountHM	= DisplayDataConfigurationBllImpl.getInstance().lrTypeWiseZeroAmountHMModule(displayDataConfig,
						printData.values().stream().filter(e -> e.getWayBillTypeId() > 0).map(DDMPrint::getWayBillTypeId).collect(Collectors.toSet()), ModuleIdentifierConstant.DDM_PRINT);

				for (final Map.Entry<Long, DDMPrint> entry : printData.entrySet()) {
					final long wbId	= entry.getKey();
					final var	ddmPrint 	= entry.getValue();

					ddmPrint.setActualWeight(conSumColl.get(wbId).getActualWeight());
					ddmPrint.setChargeWeight(conSumColl.get(wbId).getChargeWeight());
					ddmPrint.setDeliveryTo(conSumColl.get(wbId).getDeliveryTo());

					if(!Boolean.TRUE.equals(lrTypeWiseZeroAmountHM.getOrDefault(ddmPrint.getWayBillTypeId(), false)))
						ddmPrint.setConsignmentAmount(conSumColl.get(wbId).getAmount());

					ddmPrint.setDeliveredToName(Utility.checkedNullCondition(ddmPrint.getDeliveredToName(), (short) 1));
					ddmPrint.setDeliveryTimeTBB(conSumColl.get(wbId).isDeliveryTimeTBB());
					ddmPrint.setPrivateMark(conSumColl.get(wbId).getPrivateMarka());
					ddmPrint.setInvoiceNo(conSumColl.get(wbId).getInvoiceNo());

					if(formTypesIds != null)
						ddmPrint.setFormTypeIs(formTypesIds.get(wbId));

					if (counter == 0) {
						ActionStaticUtil.setRequestAttribute(request,"customAddressBranchId", ddmPrint.getBranchId());
						ActionStaticUtil.setRequestAttribute(request,"customAddressIdentifer", CustomGroupMapper.IDENTIFIER_DELIVERY);

						if (customGroupConfig.getBoolean(CustomGroupConfigurationDTO.CUSTOM_GROUP_ADDESS_ALLOWED)
								|| configuration.getBoolean(RegionOrBranchWiseGroupNameDTO.IS_BRANCH_WISE))
							reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);

						if(reportViewModel.getAccountGroupName() == null || "".equals(reportViewModel.getAccountGroupName()) || "--".equals(reportViewModel.getAccountGroupName()))
							reportViewModel.setAccountGroupName(accountGroup.getDescription());

						ddmBranch = cache.getGenericBranchDetailCache(request, ddmPrint.getSourceBranchId());
						reportViewModel.setBranchPhoneNumber(ddmBranch.getPhoneNumber());
						reportViewModel.setBranchPhoneNumber2(ddmBranch.getPhoneNumber2());
						reportViewModel.setBranchContactDetailMobileNumber(ddmBranch.getMobileNumber());
						reportViewModel.setBranchAddress(ddmBranch.getAddress());
						reportViewModel.setBranchContactDetailEmailAddress(ddmBranch.getEmailAddress());
						reportViewModel.setBranchGstin(ddmBranch.getGstn());

						request.setAttribute("ReportViewModel", reportViewModel);

						if(ddmPrintConfiguration.get(DDMPrintConfigurationConstant.LOGGED_IN_BRANCH_DETAILS) != null
								&& Boolean.parseBoolean(ddmPrintConfiguration.get(DDMPrintConfigurationConstant.LOGGED_IN_BRANCH_DETAILS).toString()))
							request.setAttribute("LoggedInBranchDetails", cache.getGenericBranchDetailCache(request,executive.getBranchId()));

						counter++;
					}

					wayBillViewList[counter2] = populateWayBillViewModel(request, ddmPrint, deliveryRunSheetLedger, wayBillCrossing, ddbWiseSelfPartyId, lrColl, ddmPrintConfiguration);

					//Source Wise Collection (Start)
					var srcWiseWBCrossing = srcWiseCrossingColl.get(wayBillViewList[counter2].getSourceBranchId());

					if(Boolean.TRUE.equals(lrTypeWiseZeroAmountHM.getOrDefault(ddmPrint.getWayBillTypeId(), false)))
						wayBillViewList[counter2].setBookingTotal(0);

					topayAmt 	= 0.00;
					paidAmt 	= 0.00;
					tbbamt 		= 0.00;

					if(wayBillViewList[counter2].getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY)
						topayAmt	= wayBillViewList[counter2].getBookingTotal() + wayBillViewList[counter2].getDeliveryChargesSum();
					else if(wayBillViewList[counter2].getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID)
						paidAmt		= wayBillViewList[counter2].getBookingTotal() + wayBillViewList[counter2].getDeliveryChargesSum();
					else if(wayBillViewList[counter2].getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT)
						tbbamt  	= wayBillViewList[counter2].getBookingTotal() + wayBillViewList[counter2].getDeliveryChargesSum();

					wayBillViewList[counter2].setTotalToPayAmount(topayAmt);
					wayBillViewList[counter2].setTotalPaidAmount(paidAmt);
					wayBillViewList[counter2].setTotalTbbAmount(tbbamt);

					final List<ConsignmentDetails>	consignDeatails  = conDtlsCol.get(wayBillViewList[counter2].getWayBillId());

					wayBillViewList[counter2].setPackageQuantity(consignDeatails.stream().map(ConsignmentDetails::getQuantity).mapToLong(Long::longValue).sum());
					wayBillViewList[counter2].setPackageDetailsWithQuantity(consignDeatails.stream().map(e -> e.getQuantity() + " " + e.getPackingTypeName()).collect(Collectors.joining(" / ")));
					wayBillViewList[counter2].setPackageDetailsWithQuantity2(consignDeatails.stream().map(e -> e.getPackingTypeName() + " (" + e.getQuantity() + ")" ).collect(Collectors.joining(" / ")));

					if(showStatusColumn) {
						if(wayBillViewList[counter2].getPaymentType() == 0)
							wayBillViewList[counter2].setStatusDDM(WayBillViewModel.PENDING_AMOUNT);

						if(wayBillViewList[counter2].getPaymentType() == PaymentTypeConstant.PAYMENT_TYPE_RECEIVE_AT_GODOWN_ID)
							wayBillViewList[counter2].setStatusDDM(WayBillViewModel.GODOWN_RECEIVE_AMOUNT);

						if(wayBillViewList[counter2].getPaymentType() > 0 && wayBillViewList[counter2].getPaymentType() != PaymentTypeConstant.PAYMENT_TYPE_RECEIVE_AT_GODOWN_ID)
							wayBillViewList[counter2].setStatusDDM(WayBillViewModel.SETTLED_AMOUNT);
					}

					if(srcWiseWBCrossing == null) {
						srcWiseWBCrossing = new SourceWiseWayBillCrossingSummary();

						srcWiseWBCrossing.setTopayLRAmt(topayAmt);
						srcWiseWBCrossing.setCrossingHire(wayBillViewList[counter2].getCrossingHire());
						srcWiseWBCrossing.setRecoveryAmt(topayAmt - wayBillViewList[counter2].getCrossingHire());

						branch	= cache.getGenericBranchDetailCache(request,  wayBillViewList[counter2].getSourceBranchId());

						srcWiseWBCrossing.setSourceBranchId(branch.getBranchId());
						srcWiseWBCrossing.setSourceBranch(branch.getName());

						srcWiseCrossingColl.put(srcWiseWBCrossing.getSourceBranchId(), srcWiseWBCrossing);
					} else {
						srcWiseWBCrossing.setTopayLRAmt(srcWiseWBCrossing.getTopayLRAmt() + topayAmt);
						srcWiseWBCrossing.setCrossingHire(srcWiseWBCrossing.getCrossingHire() + wayBillViewList[counter2].getCrossingHire());
						srcWiseWBCrossing.setRecoveryAmt(srcWiseWBCrossing.getRecoveryAmt() + (topayAmt - wayBillViewList[counter2].getCrossingHire()));
					}
					//Source Wise Collection (Start)

					counter2++;

					if(ddmPrint.getPaymentTypeId() == 0) {
						if(settleStatus == DeliveryRunSheetLedger.SETTLEMENT_STATUS_CLEAR || settleStatus == DeliveryRunSheetLedger.SETTLEMENT_STATUS_PARTIAL)
							settleStatus = DeliveryRunSheetLedger.SETTLEMENT_STATUS_PARTIAL; // partial
						else
							settleStatus = DeliveryRunSheetLedger.SETTLEMENT_STATUS_DUE; // partial

					} else if(ddmPrint.getPaymentTypeId() > 0) {
						settlementTime  = ddmPrint.getSettlementDateTime();

						if(settleStatus == DeliveryRunSheetLedger.SETTLEMENT_STATUS_DUE
								|| settleStatus == DeliveryRunSheetLedger.SETTLEMENT_STATUS_PARTIAL )
							settleStatus 	 = DeliveryRunSheetLedger.SETTLEMENT_STATUS_PARTIAL; // partial
						else
							settleStatus 	 = DeliveryRunSheetLedger.SETTLEMENT_STATUS_CLEAR; // clear
					}
				}

				request.setAttribute("settlementTime", settlementTime);
				request.setAttribute("showStatusColumn", showStatusColumn);
				request.setAttribute("settleStatusName", DeliveryRunSheetLedger.getSettlementStatusName(settleStatus));
				request.setAttribute("srcWiseCrossingColl", srcWiseCrossingColl);
				request.setAttribute("deliveryRunSheetLedger", deliveryRunSheetLedger);

				if(wayBillIdStr != null && deliveryRunSheetLedgerId != 0){
					wayBillIdWiseHM = DeliveryRunSheetSummaryDao.getInstance().getWayBillDataByWayBillIdsAndLSId(executive.getAccountGroupId(),wayBillIdStr,deliveryRunSheetLedgerId);

					if(wayBillIdWiseHM != null && wayBillIdWiseHM.size() > 0)
						for (final WayBillViewModel element : wayBillViewList)
							if(wayBillIdWiseHM.get(element.getWayBillId()) != null)
								element.setBookingTotal(wayBillIdWiseHM.get(element.getWayBillId()));
				}

				if(deliveryRunSheetLedger.getVehicleId() > 0)
					vehicleNumberMaster = cache.getVehicleNumber(request, executive.getAccountGroupId(), deliveryRunSheetLedger.getVehicleId());

				request.setAttribute("vehicleNumberMaster", vehicleNumberMaster);

				wayBillViewModelList		= Arrays.asList(wayBillViewList);

				if((boolean) ddmPrintConfiguration.getOrDefault(DDMPrintConfigurationConstant.CONSIGNEE_PARTY_WISE_LR_SORTING, false))
					wayBillViewModelList	= SortUtils.sortList(wayBillViewModelList, WayBillViewModel::getConsigneeName);
				else if((boolean) ddmPrintConfiguration.getOrDefault(DDMPrintConfigurationConstant.SORT_BY_BRANCH_NAME_IN_PRINT, false)) {
					wayBillViewModelList	= SortUtils.sortList(wayBillViewModelList, WayBillViewModel::getDestinationBranch);

					final Map<Long, List<WayBillViewModel>> sortedCollectionList = wayBillViewModelList.stream()
							.collect(Collectors.groupingBy(WayBillViewModel::getDestinationBranchId, LinkedHashMap::new, Collectors.toList()));

					request.setAttribute("sortedCollectionList", sortedCollectionList);
				} else if((boolean) ddmPrintConfiguration.getOrDefault(DDMPrintConfigurationConstant.SORT_BY_DELIVERY_RUNSHEET_SUMMARY_ID, false)
						|| (boolean) ddmPrintConfiguration.getOrDefault(DDMPrintConfigurationConstant.SHOW_DDM_SUMMARY_WISE_PRINT, false))
					wayBillViewModelList	= SortUtils.sortList(wayBillViewModelList, WayBillViewModel::getDeliveryRunsheetSummaryId);
				else if((boolean) ddmPrintConfiguration.getOrDefault(DDMPrintConfigurationConstant.SORT_BY_WAYBILL_NUMBER, false))
					wayBillViewModelList	= SortUtils.sortList(wayBillViewModelList, WayBillViewModel::getSrcBranchCode, WayBillViewModel::getLrNumberWithoutCode);

				wayBillViewList	= new WayBillViewModel[wayBillViewModelList.size()];
				wayBillViewModelList.toArray(wayBillViewList);

				request.setAttribute("wayBillViewList", wayBillViewList);
				request.setAttribute("wayBillViewModelList", wayBillViewModelList);

				if((boolean) ddmPrintConfiguration.getOrDefault(DDMPrintConfigurationConstant.SHOW_BOOKING_CHARGES, false))
					getBookingCharges(request, wayBillIdStr);

				if(request.getParameter("Type") != null && "Dispatched".equals(request.getParameter("Type")))
					request.setAttribute("Type","Dispatch");
				else
					request.setAttribute("Type","Branch Transfer");

				request.setAttribute("packageTypeDetails",wbPackingTypeDetails);
				request.setAttribute("wayBillTypeDetails",wbCategoryTypeDetails);
				request.setAttribute("bookingCharges",bookingCharges);

				if((boolean) ddmPrintConfiguration.getOrDefault(DDMPrintConfigurationConstant.GROUP_SPECIFIC_DDM_PRINT, false))
					request.setAttribute("nextPageToken", "success_" + executive.getAccountGroupId());
				else if(executive.getAccountGroupId() > AccountGroupConstant.ACCOUNT_GROUP_ID_PGT || executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_DEMO)
					request.setAttribute("nextPageToken", "success_default");
				else
					ActionStaticUtil.setNextPageToken(request, ActionStaticUtil.SUCCESS);

				final Map<Long, WayBillViewModel>	wayBillViewModelHM = new HashMap();

				for(final WayBillViewModel wbModel : wayBillViewList) {
					final var model = new WayBillViewModel();
					model.setTotalActWeight(wbModel.getActualWeight());
					model.setPacQuantity(wbModel.getPackageQuantity());
					model.setDestinationBranch(wbModel.getDestinationBranch());
					model.setDestinationBranchId(wbModel.getDestinationBranchId());
					wayBillViewModelHM.put(wbModel.getWayBillId(), model);
				}

				request.setAttribute("destWiseHm", wayBillViewModelHM.values().stream().collect(Collectors.toMap(WayBillViewModel::getDestinationBranchId, Function.identity(), (v1, v2) -> v1 = merge(v1, v2))));
			} else {
				error.put(AliasNameConstants.ERROR_CODE, CargoErrorList.NO_RECORDS);
				error.put(AliasNameConstants.ERROR_DESCRIPTION, CargoErrorList.NO_RECORDS_DESCRIPTION);
				request.setAttribute("cargoError", error);
				request.setAttribute("nextPageToken", "success_"+executive.getAccountGroupId());
			}
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}

	public DeliveryRunSheetLedger populateDeliveryRunSheetLedger(final HttpServletRequest request, final DDMPrint ddmPrint, final Map<Object, Object> ddmPrintConfiguration) throws Exception {
		DriverMaster drivermaster1 = null;
		DriverMaster drivermaster2 = null;

		try {
			final var deliveryRunSheetLedger = new DeliveryRunSheetLedger();
			deliveryRunSheetLedger.setCreationDateTime(ddmPrint.getCreationDateTime());
			deliveryRunSheetLedger.setDestinationBranchId(ddmPrint.getDestinationBranchId());
			deliveryRunSheetLedger.setSourceBranchId(ddmPrint.getSourceBranchId());
			deliveryRunSheetLedger.setDriverName(ddmPrint.getDriverName() == null?"":ddmPrint.getDriverName());
			deliveryRunSheetLedger.setDriver2Name(ddmPrint.getDriver2Name() == null?"":ddmPrint.getDriver2Name());
			deliveryRunSheetLedger.setDriverId(ddmPrint.getDriverId());
			deliveryRunSheetLedger.setDriver2Id(ddmPrint.getDriver2Id());
			deliveryRunSheetLedger.setDdmNumber(ddmPrint.getDDMNumber());
			deliveryRunSheetLedger.setBranchId(ddmPrint.getBranchId());
			deliveryRunSheetLedger.setDriverMobileNo(ddmPrint.getDriverMobileNo());
			deliveryRunSheetLedger.setDriver2MobileNo(ddmPrint.getDriver2MobileNo());
			deliveryRunSheetLedger.setRemark(ddmPrint.getRemark() != null ? ddmPrint.getRemark() : "");
			deliveryRunSheetLedger.setVehicleId(ddmPrint.getVehicleId());
			deliveryRunSheetLedger.setVehicleNumber(ddmPrint.getVehicleNumber());
			deliveryRunSheetLedger.setLorryHireAmount(ddmPrint.getLorryHireAmount());
			deliveryRunSheetLedger.setDeliveryExecutiveName(ddmPrint.getDeliveryExecutiveName());
			deliveryRunSheetLedger.setDeliveryExecutiveNumber(ddmPrint.getDeliveryExecutiveNumber());
			deliveryRunSheetLedger.setExName(ddmPrint.getExName());
			deliveryRunSheetLedger.setSettlementExecutiveId(ddmPrint.getSettlementExecutiveId());
			deliveryRunSheetLedger.setSettlementExecutiveName(ddmPrint.getSettlementExecutiveName());
			deliveryRunSheetLedger.setDueAmount(ddmPrint.getDueAmount());
			deliveryRunSheetLedger.setSettleAmount(ddmPrint.getSettleAmount());
			deliveryRunSheetLedger.setLoaderName(ddmPrint.getLoaderName() != null ? ddmPrint.getLoaderName() : "");
			deliveryRunSheetLedger.setDeliveryMan1(ddmPrint.getDeliveryMan1());
			deliveryRunSheetLedger.setDeliveryMan2(ddmPrint.getDeliveryMan2());
			deliveryRunSheetLedger.setCurrentTime(DateTimeUtility.getDateFromTimeStamp(DateTimeUtility.getCurrentTimeStamp(), DateTimeFormatConstant.HH_MM_AA));
			deliveryRunSheetLedger.setCurrentDate(DateTimeUtility.getDateFromTimeStamp(DateTimeUtility.getCurrentTimeStamp(), DateTimeFormatConstant.DD_MM_YY));
			deliveryRunSheetLedger.setDivisionName(ddmPrint.getDivisionName());

			final var srcbranch = cache.getGenericBranchDetailCache(request,ddmPrint.getSourceBranchId());

			deliveryRunSheetLedger.setSourceBranch(srcbranch.getName());
			deliveryRunSheetLedger.setSourceCityName(cache.getCityById(request, srcbranch.getCityId()).getName());
			deliveryRunSheetLedger.setRegisterOwnerName(ddmPrint.getRegisterOwnerName());
			deliveryRunSheetLedger.setRegisterOwnerPanNumber(ddmPrint.getRegisterOwnerPanNumber());
			deliveryRunSheetLedger.setVehilceAgentMaster(ddmPrint.getVehilceAgentMaster());
			deliveryRunSheetLedger.setVehicleAgent(ddmPrint.getVehilceAgentMaster());
			deliveryRunSheetLedger.setVehicleTypeName(ddmPrint.getVehicleTypeName() != null ? ddmPrint.getVehicleTypeName() : "");

			final var ddmbranch = cache.getGenericBranchDetailCache(request, deliveryRunSheetLedger.getBranchId());

			deliveryRunSheetLedger.setBranchName(ddmbranch.getName());
			deliveryRunSheetLedger.setBranchCode(ddmbranch.getBranchCode());
			deliveryRunSheetLedger.setStartKilometerReading(ddmPrint.getStartKilometerReading());
			deliveryRunSheetLedger.setEndKilometerReading(ddmPrint.getEndKilometerReading());
			deliveryRunSheetLedger.setCollectionPerson(Utility.checkedNullCondition(ddmPrint.getCollectionPersonName(), (short) 1));

			if(ddmPrintConfiguration != null && (boolean) ddmPrintConfiguration.getOrDefault(DDMPrintConfigurationConstant.LOGGED_IN_BRANCH_DETAILS, false))
				request.setAttribute("LoggedInBranchDetails", srcbranch);

			if(ddmPrint.getDestinationBranchId() > 0) {
				final var destbranch = cache.getGenericBranchDetailCache(request, ddmPrint.getDestinationBranchId());
				deliveryRunSheetLedger.setDestinationBranch(destbranch.getName());
				deliveryRunSheetLedger.setDestinationCityName(cache.getCityById(request, destbranch.getCityId()).getName());
			} else
				deliveryRunSheetLedger.setDestinationBranch(ddmPrint.getTruckDestination() != null ? ddmPrint.getTruckDestination(): "--");

			deliveryRunSheetLedger.setRemark(ddmPrint.getRemark());
			deliveryRunSheetLedger.setDriverMobileNo(ddmPrint.getDriverMobileNo() != null ? ddmPrint.getDriverMobileNo() : "");
			deliveryRunSheetLedger.setDriver2MobileNo(ddmPrint.getDriver2MobileNo() != null ? ddmPrint.getDriver2MobileNo() : "");

			if(ddmPrint.getDriverId() > 0)
				drivermaster1 = DriverMasterDao.getInstance().getDriverDataById(ddmPrint.getDriverId(), executive.getAccountGroupId());

			deliveryRunSheetLedger.setDriverLicenceNumber(drivermaster1 != null ? drivermaster1.getLicenceNumber() : "");

			if(ddmPrint.getDriver2Id() > 0)
				drivermaster2 = DriverMasterDao.getInstance().getDriverDataById(ddmPrint.getDriver2Id(), executive.getAccountGroupId());

			deliveryRunSheetLedger.setDriver2LicenceNumber(drivermaster2!= null ?  drivermaster2.getLicenceNumber() : "");

			deliveryRunSheetLedger.setDdmNumber(ddmPrint.getDDMNumber());
			deliveryRunSheetLedger.setBranchId(ddmPrint.getBranchId());
			deliveryRunSheetLedger.setStatus(ddmPrint.getDeliveryRunsheetLedgerStatus());
			deliveryRunSheetLedger.setLhpvId(ddmPrint.getLhpvId());

			final var lrDateForVehicleAgentNameInPrint  				= (String) ddmPrintConfiguration.getOrDefault(DDMPrintConfigurationConstant.LR_DATE_FOR_VEHICLE_AGENT_NAME_IN_PRINT,"01-01-2024");
			final var lrDateForVehicleAgentNameInPrintInTimestamp		= DateTimeUtility.getDateInTimeStamp(lrDateForVehicleAgentNameInPrint);

			if (ddmPrint.getCreationDateTime().compareTo(lrDateForVehicleAgentNameInPrintInTimestamp) >= 0 || ddmPrint.getVehicleAgentMasterId() > 0)
				deliveryRunSheetLedger.setVehicleAgentName(Utility.checkedNullCondition(ddmPrint.getVehilceAgentMaster(), (short) 1));
			else
				deliveryRunSheetLedger.setVehicleAgentName(Utility.checkedNullCondition(ddmPrint.getDriverName(), (short) 1));

			if(formNumberExistsInDDM) {
				if(ddmPrint.getConsolidateEWaybillNumber() != null)
					deliveryRunSheetLedger.setConsolidateEWaybillNumber(ddmPrint.getConsolidateEWaybillNumber());
				else
					deliveryRunSheetLedger.setConsolidateEWaybillNumber("Pending");
			} else
				deliveryRunSheetLedger.setConsolidateEWaybillNumber("Not Required");

			return deliveryRunSheetLedger;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	@SuppressWarnings("unchecked")
	private WayBillViewModel populateWayBillViewModel(final HttpServletRequest request, final DDMPrint ddmPrint, final DeliveryRunSheetLedger deliveryRunSheetLedger, final WayBillCrossing wayBillCrossing, final long  ddbWiseSelfPartyId, final Map<Long, Double> lrColl, final Map<Object, Object> ddmPrintConfiguration) throws Exception {
		PackingTypeMaster 						wbPkg 						= null;
		Double 									weight 						= null;
		StringJoiner							pkgDetail 					= null;
		Iterator<Long> 							itr 						= null;
		HashMap<Long,PackingTypeMaster> 		wbPkgs 						= null;
		HashMap<Long,Double> 					chargesCollection 			= null;
		final var						saidToContain 				= new StringJoiner(" / ");
		Branch                  				branch						= null;

		try {
			final var wayBillDeatailsModel	= wayBillDetails.get(ddmPrint.getWayBillId());
			final var 	wayBillViewModel 		= new WayBillViewModel();

			if(ddmPrint.getWbDestinationBranchId() > 0) {
				branch = cache.getGenericBranchDetailCache(request,ddmPrint.getWbDestinationBranchId());
				wayBillViewModel.setDestinationBranch(branch.getName());
				wayBillViewModel.setDestinationAbbrevation(branch.getAbbrevationName());
				wayBillViewModel.setDestinationBranchId(ddmPrint.getWbDestinationBranchId());
				wayBillViewModel.setDestinationBranchCode(branch.getBranchCode());
			} else
				wayBillViewModel.setDestinationBranch(deliveryPlace);

			branch = cache.getGenericBranchDetailCache(request,ddmPrint.getWbSourceBranchId());
			wayBillViewModel.setSourceAbbrevation(branch.getAbbrevationName());
			wayBillViewModel.setSourceBranch(branch.getName());
			wayBillViewModel.setSourceBranchId(ddmPrint.getWbSourceBranchId());

			wayBillViewModel.setWayBillId(ddmPrint.getWayBillId());
			wayBillViewModel.setWayBillNumber(ddmPrint.getWayBillNumber());

			final var 	pair	= SplitLRNumber.getNumbers(ddmPrint.getWayBillNumber());

			if(pair != null) {
				wayBillViewModel.setSrcBranchCode(pair.getBranchCode() instanceof String ? pair.getBranchCode().toString() : "");
				wayBillViewModel.setLrNumberWithoutCode(pair.getLrNumber() instanceof Long ? (long) pair.getLrNumber() : 0);
			}

			if(ddmPrint.isWBManual())
				wayBillViewModel.setWayBillType(WayBillTypeConstant.getWayBillTypeNameByWayBilTypeId(ddmPrint.getWayBillTypeId()) + WayBillType.WAYBILL_TYPE_MANUAL_SHORT);
			else
				wayBillViewModel.setWayBillType(WayBillTypeConstant.getWayBillTypeNameByWayBilTypeId(ddmPrint.getWayBillTypeId()));

			final var consignor = consignorHM.get(ddmPrint.getWayBillId());
			final var consignee = consigneeHM.get(ddmPrint.getWayBillId());

			wayBillViewModel.setWayBillTypeId(ddmPrint.getWayBillTypeId());
			wayBillViewModel.setConsignerName(consignor.getName());
			wayBillViewModel.setConsigneeName(consignee.getName());
			wayBillViewModel.setConsigneeNameWithMob(consignee.getName()+" ("+consignee.getPhoneNumber()+")");

			if(consignee.getCorporateAccountId() == ddbWiseSelfPartyId && (boolean) ddmPrintConfiguration.getOrDefault(DDMPrintConfigurationConstant.SHOW_DELIVER_TO_NAME_FOR_CONSIGNNE_SELF_PARTY,false))
				wayBillViewModel.setConsigneeName("SELF/" + ddmPrint.getDeliveredToName());

			wayBillViewModel.setConsigneePhoneNo(consignee.getPhoneNumber());
			wayBillViewModel.setConsignerPhoneNo(consignor.getPhoneNumber());
			wayBillViewModel.setStatus(ddmPrint.getWbStatus());
			wayBillViewModel.setCreationDateTimeStamp(ddmPrint.getBookingDateTime());
			wayBillViewModel.setConsigneeAddress(consignee.getAddress());

			/** consignment related coding done (per WayBill) Start */
			final var consignment = wayBillDeatailsModel.getConsignmentDetails();

			wayBillViewModel.setDeliveryTo(ddmPrint.getDeliveryTo());
			wayBillViewModel.setArticleTypeMasterId(consignment[0].getArticleTypeMasterId());
			wayBillViewModel.setDeliveryTypeName(InfoForDeliveryConstant.getInfoForDelivery(ddmPrint.getDeliveryTo()));
			wayBillViewModel.setDeliveryDateTimeString(DateTimeUtility.getDateTimeFromTimeStamp(ddmPrint.getWbCreationDateTimeStamp()));

			var totalQuantity = 0L;
			weight = 0.0;
			wbPkgs = new HashMap<>();
			final var packingType = new ArrayList<String>();
			final var quantityWithPackingType = new ArrayList<String>();

			for (final ConsignmentDetails element : consignment) {
				weight 			= weight + element.getActualWeight() + element.getChargeWeight();
				totalQuantity 	+= element.getQuantity();

				// Create HashMap for Packages of current wayBill
				wbPkg = wbPkgs.get(element.getPackingTypeMasterId());
				if(wbPkg !=null)
					wbPkg.setTotalQuantity(wbPkg.getTotalQuantity()+element.getQuantity());
				else {
					wbPkg = new PackingTypeMaster();
					wbPkg.setPackingTypeMasterId(element.getPackingTypeMasterId());
					wbPkg.setName(element.getPackingTypeName());
					wbPkg.setTotalQuantity(element.getQuantity());
					wbPkgs.put(element.getPackingTypeMasterId(),wbPkg);
				}

				// Create HashMap for total Package Type Details
				var pkgType = wbPackingTypeDetails.get(element.getPackingTypeMasterId());

				if(pkgType != null)
					pkgType.setTotalQuantity(pkgType.getTotalQuantity() + element.getQuantity());
				else {
					pkgType = new PackingTypeMaster();
					pkgType.setPackingTypeMasterId(element.getPackingTypeMasterId());
					pkgType.setName(element.getPackingTypeName());
					pkgType.setTotalQuantity(element.getQuantity());
					wbPackingTypeDetails.put(element.getPackingTypeMasterId(),pkgType);
				}

				if(element.getPackingTypeName() != null) {
					packingType.add(element.getPackingTypeName());
					quantityWithPackingType.add(element.getQuantity() +" "+ element.getPackingTypeName());
				}

				// Said to contain / ConsignmentGood
				saidToContain.add(element.getSaidToContain());
			}
			wayBillViewModel.setPackingType(String.join("/ ", packingType));
			wayBillViewModel.setQuantityWithPackingType(String.join(", ", quantityWithPackingType));
			wayBillViewModel.setSaidToContain(saidToContain.toString());

			pkgDetail 	= new StringJoiner("/ ");
			itr 		= wbPkgs.keySet().iterator();

			while(itr.hasNext()) {
				final var pkg = wbPkgs.get(Long.parseLong(itr.next().toString()));
				pkgDetail.add(pkgDetail + pkg.getName());
			}

			wayBillViewModel.setTotalPackagesTypeQuantity(pkgDetail.toString());

			/** WayBillCharges related coding done (per WayBill) Start */

			final var 	wayBillCharges = wayBillDeatailsModel.getWayBillCharges();
			final var 	wayBillTaxTxns = wayBillDeatailsModel.getWayBillTaxTxn();

			final var totalTax 			= Stream.of(wayBillTaxTxns).map(WayBillTaxTxn::getTaxAmount).mapToDouble(Double::doubleValue).sum();
			var totalDiscount 		= 0.00;

			if(ddmPrint.isWBDiscountPercent())
				totalDiscount = Math.round(ddmPrint.getBookingChargesSum() * ddmPrint.getBookingDiscountPercentage() / 100);
			else
				totalDiscount = ddmPrint.getBookingDiscount();

			var	wayBillCategoryTypeDetails = wbCategoryTypeDetails.get(wayBillViewModel.getWayBillType());

			if(wayBillCategoryTypeDetails == null) {
				wayBillCategoryTypeDetails = new WayBillCategoryTypeDetails();

				wayBillCategoryTypeDetails.setWayBillType(wayBillViewModel.getWayBillType());
				wayBillCategoryTypeDetails.setQuantity(totalQuantity);
				wayBillCategoryTypeDetails.setTotalTax(totalTax);
				wayBillCategoryTypeDetails.setBookingDiscount(totalDiscount);
				wayBillCategoryTypeDetails.setTotalAmount(ddmPrint.getBookingTotal());
				wayBillCategoryTypeDetails.setNumberOfLr(1);

				chargesCollection = new HashMap<>();

				for (final WayBillCharges wayBillCharge : wayBillCharges)
					chargesCollection.put(wayBillCharge.getWayBillChargeMasterId(), wayBillCharge.getChargeAmount());

				wayBillCategoryTypeDetails.setChargesCollection(chargesCollection);
				wayBillCategoryTypeDetails.setDeliveryAt(ddmPrint.getDeliveryTo());
				wayBillCategoryTypeDetails.setWayBillTypeId(ddmPrint.getWayBillTypeId());

				wbCategoryTypeDetails.put(wayBillViewModel.getWayBillType(), wayBillCategoryTypeDetails);
			} else {
				wayBillCategoryTypeDetails.setQuantity(wayBillCategoryTypeDetails.getQuantity() + totalQuantity);
				wayBillCategoryTypeDetails.setTotalTax(wayBillCategoryTypeDetails.getTotalTax() + totalTax);
				wayBillCategoryTypeDetails.setBookingDiscount(wayBillCategoryTypeDetails.getBookingDiscount() + totalDiscount);
				wayBillCategoryTypeDetails.setTotalAmount(wayBillCategoryTypeDetails.getTotalAmount() + ddmPrint.getBookingTotal());
				wayBillCategoryTypeDetails.setNumberOfLr(wayBillCategoryTypeDetails.getNumberOfLr() + 1);

				chargesCollection = wayBillCategoryTypeDetails.getChargesCollection();

				for (final WayBillCharges wayBillCharge : wayBillCharges)
					if(chargesCollection.get(wayBillCharge.getWayBillChargeMasterId()) != null)
						chargesCollection.put(wayBillCharge.getWayBillChargeMasterId(), chargesCollection.get(wayBillCharge.getWayBillChargeMasterId()) + wayBillCharge.getChargeAmount());
					else
						chargesCollection.put(wayBillCharge.getWayBillChargeMasterId(), wayBillCharge.getChargeAmount());

				wayBillCategoryTypeDetails.setDeliveryAt(ddmPrint.getDeliveryTo());
				wayBillCategoryTypeDetails.setWayBillTypeId(ddmPrint.getWayBillTypeId());
			}
			/** End */

			wayBillViewModel.setBookingChargesSum(ddmPrint.getBookingChargesSum());
			wayBillViewModel.setBookingDiscount(ddmPrint.getBookingDiscount());
			wayBillViewModel.setBookingTimeServiceTax(ddmPrint.getBookingTimeServiceTax());
			wayBillViewModel.setBookingTotal(ddmPrint.getBookingTotal());
			wayBillViewModel.setDeliveryChargesSum(ddmPrint.getDeliveryChargesSum());
			wayBillViewModel.setDeliveryDiscount(ddmPrint.getDeliveryDiscount());
			wayBillViewModel.setDeliveryTimeServiceTax(ddmPrint.getDeliveryTimeServiceTax());
			wayBillViewModel.setDeliveryTotal(ddmPrint.getDeliveryTotal());
			wayBillViewModel.setGrandTotal((boolean) ddmPrintConfiguration.getOrDefault(DDMPrintConfigurationConstant.HIDE_THE_TOTAL_AMOUNT_FOR_ALL_LR_TYPE, false) ? 0 : ddmPrint.getGrandTotal());
			wayBillViewModel.setTotalWeight(weight);
			wayBillViewModel.setNoOfArticle(consignment.length);
			wayBillViewModel.setRemark(ddmPrint.getWbRemark());
			wayBillViewModel.setAccountGroupId(ddmPrint.getAccountGroupId());
			wayBillViewModel.setActualWeight(ddmPrint.getActualWeight());
			wayBillViewModel.setFormTypeIds(ddmPrint.getFormTypeIs());
			wayBillViewModel.setDeliveryTo(ddmPrint.getDeliveryTo());
			wayBillViewModel.setAmount(ddmPrint.getConsignmentAmount());
			wayBillViewModel.setDeliveryTimeTBB(ddmPrint.isDeliveryTimeTBB());
			wayBillViewModel.setLorryHireAmount(ddmPrint.getLorryHireAmount());
			wayBillViewModel.setTotalNoOfWayBills(ddmPrint.getTotalNoOfWayBills());
			wayBillViewModel.setInvoiceNo(ddmPrint.getInvoiceNo());

			if (ddmPrint.getWayBillPartialQuantity() > 0)
				wayBillViewModel.setTotalQuantity(ddmPrint.getWayBillPartialQuantity());
			else
				wayBillViewModel.setTotalQuantity(totalQuantity);

			if (ddmPrint.getWayBillPartialWeight() > 0)
				wayBillViewModel.setChargeWeigth(ddmPrint.getWayBillPartialWeight());
			else
				wayBillViewModel.setChargeWeigth(ddmPrint.getChargeWeight());

			if(wayBillViewModel.getDeliveryTo() == InfoForDeliveryConstant.DELIVERY_TO_BRANCH_ID)
				wayBillViewModel.setDeliveryToStr("--");
			else if(wayBillViewModel.getDeliveryTo() == InfoForDeliveryConstant.DELIVERY_TO_DOOR_ID)
				wayBillViewModel.setDeliveryToStr("DD");

			if (wayBillViewModel.getArticleTypeMasterId() == ArticleTypeMaster.ARTICLE_TYPE_DOCUMENT) {
				totalPackages += totalQuantity;
				totalDocsOnPackages += totalQuantity;
				deliveryRunSheetLedger.setTotalDocsOnPackages(totalDocsOnPackages);
				deliveryRunSheetLedger.setTotalPackages(totalPackages);
			} else if (wayBillViewModel.getArticleTypeMasterId() == ArticleTypeMaster.ARTICLE_TYPE_NONDOCUMENT) {
				totalPackages += totalQuantity;
				totalNonDocsOnPackages += totalQuantity;
				deliveryRunSheetLedger.setTotalNonDocsOnPackages(totalNonDocsOnPackages);
				deliveryRunSheetLedger.setTotalPackages(totalPackages);
			}

			if(wayBillCrossing != null) {
				wayBillViewModel.setNetLoading(wayBillCrossing.getNetLoading());
				wayBillViewModel.setNetUnloading(wayBillCrossing.getNetUnloading());
				wayBillViewModel.setCrossingHire(wayBillCrossing.getCrossingHire());
			}

			wayBillViewModel.setPaymentType(ddmPrint.getPaymentTypeId());
			wayBillViewModel.setDeliveryRunsheetSummaryId(ddmPrint.getDeliveryRunsheetSummaryId());
			wayBillViewModel.setPrivateMarka(ddmPrint.getPrivateMark());
			wayBillViewModel.setDdmSettlementBranchId(ddmPrint.getDdmSettlementBranchId());

			if((boolean) ddmPrintConfiguration.getOrDefault(DDMPrintConfigurationConstant.SHOW_UPDATED_POD_STATUS, false))
				wayBillViewModel.setPodReceivedStr(PODStatusConstant.getDispatchStatus(ddmPrint.getPodStatus()));
			else
				wayBillViewModel.setPodReceivedStr(ddmPrint.isPodReceive() ? "Received" : "Pending");

			wayBillViewModel.setPodUploadedStr(ddmPrint.isPodUpload() ? "Uploaded" : "Pending");

			for(final var charges : wayBillCharges) {
				if(charges.getWayBillChargeMasterId() == BookingChargeConstant.DELIVERY_CARTAGE) {
					wayBillViewModel.setCrossingCartage(charges.getChargeAmount());
					break;
				}

				if(charges.getWayBillChargeMasterId() == BookingChargeConstant.DOOR_DELIVERY_BOOKING) {
					wayBillViewModel.setDoorDelivery(charges.getChargeAmount());
					break;
				}
			}

			if(lrColl != null)
				wayBillViewModel.setLorryHireAmount(lrColl.getOrDefault(ddmPrint.getWayBillId(), 0d));

			request.setAttribute("wbCategoryTypeDetailsHM", wbCategoryTypeDetails);

			return wayBillViewModel;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public static WayBillViewModel merge(final WayBillViewModel first, final WayBillViewModel second) {
		first.setTotalActWeight(first.getTotalActWeight() + second.getTotalActWeight());
		first.setPacQuantity(first.getPacQuantity() + second.getPacQuantity());
		first.setDestinationBranch(first.getDestinationBranch());
		first.setCount(first.getCount() + 1);

		return first;
	}

	private void getBookingCharges(final HttpServletRequest request, final String wayBillIdStr) throws Exception {
		final var	wbIdWiseBkgChgsHM	= WayBillBookingChargesDao.getInstance().getWayBillIdWiseChargesMap(wayBillIdStr);
		request.setAttribute("wbIdWiseBkgChgsHM", wbIdWiseBkgChgsHM);
		request.setAttribute("bookingCharges", cache.getActiveBookingCharges(request, executive.getBranchId()));

		final var chargeIdWiseBkgSumAmount = new HashMap<Long, Double>();

		if(ObjectUtils.isNotEmpty(wbIdWiseBkgChgsHM))
			wbIdWiseBkgChgsHM.entrySet().stream()
			.map(Map.Entry<Long, HashMap<Long, WayBillBookingCharges>>::getValue).forEach((final Map<Long, WayBillBookingCharges> chrageMasterIdWiseHM) -> chrageMasterIdWiseHM.entrySet()
					.forEach((final Map.Entry<Long, WayBillBookingCharges> entry1) -> {
						final var wayBillBookingCharges = entry1.getValue();

						if (chargeIdWiseBkgSumAmount.get(wayBillBookingCharges.getWayBillChargeMasterId()) == null)
							chargeIdWiseBkgSumAmount.put(wayBillBookingCharges.getWayBillChargeMasterId(), wayBillBookingCharges.getChargeAmount());
						else
							chargeIdWiseBkgSumAmount.put(wayBillBookingCharges.getWayBillChargeMasterId(),
									wayBillBookingCharges.getChargeAmount() + chargeIdWiseBkgSumAmount.get(wayBillBookingCharges.getWayBillChargeMasterId()));
					}));

		request.setAttribute("chargeIdWiseBkgSumAmount", chargeIdWiseBkgSumAmount);
	}

	public static DDMPrint merge(final DDMPrint first, final DDMPrint second) {
		first.setWayBillPartialQuantity(first.getWayBillPartialQuantity() + second.getWayBillPartialQuantity());
		return first;
	}
}