package com.ivcargo.actions.transport;

//~--- non-JDK imports --------------------------------------------------------

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Objects;
import java.util.StringJoiner;
import java.util.TreeMap;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.ObjectUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.BeanUtils;

import com.businesslogic.CreateBLHPVBLL;
import com.businesslogic.DispatchBLL;
import com.businesslogic.properties.impl.PropertyConfigValueBLLImpl;
import com.businesslogic.truckhisabmodule.BranchDetailsMapBLL;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.bll.impl.commission.BranchCommissionBllImpl;
import com.iv.bll.impl.waybill.WayBillBookingChargesBllImpl;
import com.iv.constant.properties.LhpvAdvanceSettlementPropertiesConstant;
import com.iv.constant.properties.TDSPropertiesConstant;
import com.iv.constant.properties.lhpv.LHPVPropertiesConstant;
import com.iv.constant.properties.lhpv.LhpvPrintConfigurationConstant;
import com.iv.dao.impl.lhpv.BranchWiseLhpvAmountDaoImpl;
import com.iv.dao.impl.lhpv.MultipleLHPVRemarkDaoImpl;
import com.iv.dto.DispatchLRSummary;
import com.iv.dto.commission.BranchCommission;
import com.iv.dto.constant.FeildPermissionsConstant;
import com.iv.dto.constant.IncomeExpenseChargeTypeConstant;
import com.iv.dto.constant.LHPVChargeTypeConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.dto.constant.RatePMTTypeConstant;
import com.iv.dto.dispatch.DispatchLedgerModel;
import com.iv.dto.lhpv.BranchWiseLhpvAmount;
import com.iv.utils.SortingUtility;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.constant.AccountGroupConstant;
import com.iv.utils.constant.Constant;
import com.iv.utils.constant.DateTimeFormatConstant;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.exception.ExceptionProcess;
import com.iv.utils.utility.CollectionUtility;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.reports.ReportView;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.DeliveryRunSheetLedgerDao;
import com.platform.dao.DeliveryRunSheetSummaryDao;
import com.platform.dao.DispatchArticleDetailsDao;
import com.platform.dao.DispatchLedgerDao;
import com.platform.dao.DispatchSummaryDao;
import com.platform.dao.DriverMasterDao;
import com.platform.dao.ExpenseSettlementDao;
import com.platform.dao.IncomeExpenseChargeDao;
import com.platform.dao.LHPVDao;
import com.platform.dao.LhpvSettlementChargesDao;
import com.platform.dao.LorryHireDao;
import com.platform.dao.LorryHireRouteDao;
import com.platform.dao.VehicleAgentMasterDao;
import com.platform.dao.WayBillDao;
import com.platform.dao.WayBillTaxTxnDao;
import com.platform.dao.tdstxn.TDSTxnDetailsDAO;
import com.platform.dto.Branch;
import com.platform.dto.CustomGroupMapper;
import com.platform.dto.DispatchArticleDetails;
import com.platform.dto.DispatchLedger;
import com.platform.dto.DispatchSummary;
import com.platform.dto.DriverMaster;
import com.platform.dto.LHPV;
import com.platform.dto.LHPVModel;
import com.platform.dto.LhpvChargeTypeMaster;
import com.platform.dto.LhpvChargesForGroup;
import com.platform.dto.PropertiesFileConstants;
import com.platform.dto.VehicleAgentMaster;
import com.platform.dto.VehicleNumberMaster;
import com.platform.dto.WayBill;
import com.platform.dto.WayBillTaxTxn;
import com.platform.dto.configuration.report.CustomGroupConfigurationDTO;
import com.platform.dto.constant.InfoForDeliveryConstant;
import com.platform.dto.constant.LHPVConstant;
import com.platform.dto.constant.TDSTxnDetailsConstant;
import com.platform.dto.constant.TransCargoAccountGroupConstant;
import com.platform.dto.constant.WayBillTypeConstant;
import com.platform.dto.model.LHPVCompanyDetails;
import com.platform.dto.model.ReportViewModel;
import com.platform.dto.model.WayBillTypeReportModel;
import com.platform.dto.model.WayBillTypeSummary;
import com.platform.dto.tds.TDSTxnDetails;
import com.platform.dto.tds.TDSTxnDetailsIdentifiers;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

public class PrintLHPVReportAction implements Action {

	public static final String 	TRACE_ID	= "PrintLHPVReportAction";
	CacheManip       			cache		= null;

	@SuppressWarnings("unchecked")
	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {

		HashMap<String,Object>	 				error 							= null;
		LHPV									lhpv							= null;
		ValueObject 							outValObj 						= null;
		String									sourceBranchStr					= null;
		String									destBranchStr					= null;
		DriverMaster							driverMaster					= null;
		VehicleAgentMaster						vehicleAgentMaster				= null;
		ArrayList<Long>							wbIdsArr 						= null;
		HashMap<Long, WayBill> 					wayBillCol						= null;
		HashMap<Long, WayBillTypeSummary> 		waybillTypeHshmp 				= null;
		LinkedHashMap<Long,DispatchLedger> 		dispatchLedgerDetails 			= null;
		HashMap<Long,ArrayList<Long>>			dlForWBIds						= null;
		ArrayList<DispatchLedger> 				dispatchLedgerArrlist 			= null;
		List<DispatchLedgerModel> 				dispatchModelArrlist 			= null;
		ValueObject								valueObject						= null;
		ValueObject								truckDeliverySummaryValObject 	= null;
		HashMap<Long, WayBillTypeReportModel>  	wayBillHM	  					= null;
		ValueObject 							valueOutObjectForCharges 		= null;
		HashMap<Long, Double> 					lhpvchargesColl 				= null;
		VehicleNumberMaster						vehicle							= null;
		Branch									sourceBranch					= null;
		Branch									destBranch						= null;
		Branch									lhpvDestBranch					= null;
		ValueObject								branchDistValObj    			= null;
		TDSTxnDetails							tdsTxnDetails					= null;
		final List<Integer>						groupListForAmtSmry				= Collections.singletonList(TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_KHTC);
		HashMap<Long,Double>					freightTotalHm					= null;
		HashMap<Long,Double>					bookingTotalHm					= null;
		ValueObject								freightTotalObj					= null;
		short 									expenseChrgMasterId				= 0;
		var									tdPaidAmt						= 0D;
		var									tdTopayAmt						= 0D;
		var									tdBBAmt							= 0D;
		var   									tdNoOfPckg 						= 0;
		var									tdActWeight						= 0D;
		var   									tdNoLR							= 0;
		var 									taxAmnt 						= 0D;
		var 									lorryHireId 					= 0L;
		Long[]									dispatchIdArr					= null;
		String									dispatchIdString				= null;
		Long[] 									ddmIdArr						= null;
		String									ddmIdString						= null;
		short									typeOfLHPV						= 0;
		HashMap<Long, ArrayList<WayBillTaxTxn>> wayBillTaxTxnHM 				= null;
		Branch									destinationBranch				= null;
		ArrayList<String>						crossingBranchList				= null;
		String[]								crossingBranchArr				= null;
		String									crossingBranchString			= null;
		ValueObject								dieselDetailsValueObj			= null;
		var									countNumberOfLr					= 0L;
		Map<Long, DispatchLRSummary>			dispatchSummaryDetailsHM		= null;
		var									totalQuantity					= 0L;
		var									totalWeight						= 0D;
		HashMap<Long, Boolean> 					wayBillWiseAmountHM 			= null;
		var									isAmountShow 					= true;
		Branch									handlingBranch						= null;
		var 									chargeWeight 						= 0D;
		Map<Long, Map<Long, List<BranchCommission>>>	branchCommissionFinalHm		= null;
		var									totalChargeWgt								= 0D;
		var									totalDirectAmount				= 0.00;
		var									totalConnectingAmount			= 0.00;
		HashMap<Long,Double>					freightAmountHm					= null;
		var									totalActualWeightOfAgentBranchLR	= 0.0;
		var									totalAmountOfAgentBranchLR			= 0.0;
		var									totalToPayGrandTotal				= 0.0;
		ArrayList<DispatchSummary>		 	 dispatchSummaryList				= null;
		Map<Long, Map<Long, DispatchSummary>> dispatchMap =  null;
		Map<Long, DispatchSummary>			  wayBillMap  =  null;
		DispatchSummary						  disSumObj	  =  null;
		final Map<Long, Map<Long, Double>>	lsWiseBookingChargeHm 	= new HashMap<>();
		String 								truckTypeDeliveryLRString			= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	dispatchLedgerId 				= JSPUtility.GetLong(request, "dispatchLedgerId" ,0);
			var	lhpvId 							= JSPUtility.GetLong(request, "lhpvId" ,0);

			if(request.getParameter("typeOfLhpvId") != null)
				typeOfLHPV	= Short.parseShort(request.getParameter("typeOfLhpvId"));
			else
				typeOfLHPV	= JSPUtility.GetShort(request, "typeOfLHPV", LHPVConstant.TYPE_OF_LHPV_ID_NORMAL);

			cache							= new CacheManip(request);
			final var	executive 						= cache.getExecutive(request);
			final var	branchesObj						= cache.getGenericBranchesDetail(request);

			final var	dispatchBLL						= new DispatchBLL();
			final var	inValObj						= new ValueObject();
			final List<Long>	dispatchLedgerIdList			= new ArrayList<>();
			final List<Long>	uniqueWayBillIds				= new ArrayList<>();

			final var lhpvPrintConfigHM	= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.LHPV_PRINT);
			final var lhpvConfigHM		= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.LHPV);

			final var	allowLorryHireBasedDistanceCalculation	= (boolean) lhpvPrintConfigHM.getOrDefault(LhpvPrintConfigurationConstant.LORRY_HIRE_SLIP_BASED_DISTANCE_CALCULATION, false);
			final var	isFreightTotalNeededInPrint				= (boolean) lhpvPrintConfigHM.getOrDefault(LhpvPrintConfigurationConstant.IS_FREIGHT_TOTAL_NEEDED_IN_PRINT,false);
			final var	isBookingTotalNeededInPrint				= (boolean) lhpvPrintConfigHM.getOrDefault(LhpvPrintConfigurationConstant.IS_BOOKING_TOTAL_NEEDED_IN_PRINT,false);
			final var	defaultLHPVPrint						= (boolean) lhpvPrintConfigHM.getOrDefault(LhpvPrintConfigurationConstant.DEFAULT_LHPV_PRINT, false);
			final var	showDataOnPrintByBillSelectionType		= (boolean) lhpvPrintConfigHM.getOrDefault(LhpvPrintConfigurationConstant.SHOW_DATA_ON_PRINT_BY_BILL_SELECTION_TYPE, false);
			final var	billSelectionId							= (int) lhpvPrintConfigHM.getOrDefault(LhpvPrintConfigurationConstant.BILL_SELECTION_ID, 0);
			final var	showSourceAndDestinationWiseLRSummary	= (boolean) lhpvPrintConfigHM.getOrDefault(LhpvPrintConfigurationConstant.SHOW_SOURCE_AND_DESTINATION_WISE_LR_SUMMARY, false);
			final var	showWaybillDetails						= (boolean) lhpvPrintConfigHM.getOrDefault(LhpvPrintConfigurationConstant.SHOW_WAY_BILL_DETAILS, false);
			final var	showDestinationWiseLSSummary			= (boolean) lhpvPrintConfigHM.getOrDefault(LhpvPrintConfigurationConstant.SHOW_DESTINATION_WISE_LS_SUMMARY, false);
			final var	showWaybillNumberOnLhpvPrint			= (boolean) lhpvPrintConfigHM.getOrDefault(LhpvPrintConfigurationConstant.SHOW_WAYBILL_NUMBER_ON_LHPVPRINT,false);
			final var	showLsBranchIdInsteadOfSourceBranchId	= (boolean) lhpvPrintConfigHM.getOrDefault(LhpvPrintConfigurationConstant.SHOW_LS_BRANCH_ID_INSTEAD_OF_SOURCE_BRANCH_ID, false);
			final var	isPartialDispatchCheck					= (boolean) lhpvPrintConfigHM.getOrDefault(LhpvPrintConfigurationConstant.IS_PARTIAL_DISPATCH_CHECK, false);

			final var	hideAmountColumnsForBalancePayableBranch = (boolean) lhpvPrintConfigHM.getOrDefault(LhpvPrintConfigurationConstant.HIDE_AMOUNT_COLUMNS_FOR_BALANCE_PAYABLE_BRANCH, false);

			final Map<?, ?>	executiveFieldPermissions 			= cache.getExecutiveFieldPermission(request);
			final var	isAllowToSearchAllBranchLHPV			= executiveFieldPermissions != null && executiveFieldPermissions.get(FeildPermissionsConstant.ALLOW_TO_SEARCH_ALL_BRANCH_LHPV) != null;

			final var	configuration					= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.LHPV_TRUCK_ADVANCE);
			final var	incomeExpenseMappingIds			= (String) configuration.getOrDefault(LhpvAdvanceSettlementPropertiesConstant.INCOME_EXPENSE_MAPPING_IDS, "");

			if(!StringUtils.isEmpty(incomeExpenseMappingIds)) {
				final var	incomeExpenseChargeMasterList 	= IncomeExpenseChargeDao.getInstance().getIncomeExpenseChargeMasterByMappingIds(executive.getAccountGroupId(), incomeExpenseMappingIds, IncomeExpenseChargeTypeConstant.CHARGE_TYPE_OFFICE);

				if(incomeExpenseChargeMasterList != null && incomeExpenseChargeMasterList.size() == 1)
					expenseChrgMasterId	= incomeExpenseChargeMasterList.get(0).getChargeId();
			}

			final var	customGroupConfig			= PropertyConfigValueBLLImpl.getInstance().getConfiguration(executive,PropertiesFileConstants.CUSTOM_GROUP_CONFIG);

			final var	accountGroup				= cache.getAccountGroupByAccountGroupId(request, executive.getAccountGroupId());

			final var	destBranchList				= new ArrayList<Long>();

			inValObj.put("dispatchLedgerId", dispatchLedgerId);
			inValObj.put("lhpvId", lhpvId);

			if(typeOfLHPV == LHPVConstant.TYPE_OF_LHPV_ID_NORMAL)
				outValObj 	= dispatchBLL.getLHPVData(inValObj);
			else if(typeOfLHPV == LHPVConstant.LHPV_TYPE_ID_DDM || typeOfLHPV == LHPVConstant.TYPE_OF_LHPV_ID_DDM)
				outValObj	= LHPVDao.getInstance().getLHPVDataOfDDm(lhpvId);

			if(outValObj != null) {
				final var	lhpvModels		= (LHPVModel[])outValObj.get("lHPVModelArr");
				var	reportViewModel = new ReportViewModel();
				var	lhpvModel		= new LHPVModel();

				if((boolean) lhpvPrintConfigHM.getOrDefault(LhpvPrintConfigurationConstant.CALCULATE_DELIVERY_COMMISSION, false)) {
					final var txnBranchIds   = Stream.of(lhpvModels).map(e -> Long.toString(e.getHandlingBranchId())).collect(Collectors.joining(","));
					branchCommissionFinalHm	= BranchCommissionBllImpl.getInstance().getBranchCommissionInLS(executive.getAccountGroupId(), BranchCommission.APPLICABLE_ON_DELVERY, txnBranchIds);
				}

				if(outValObj.get("lhpvId") != null)
					lhpvId = (Long)outValObj.get("lhpvId");

				if(outValObj.get("LorryHireId") != null)
					lorryHireId = (Long)outValObj.get("LorryHireId");

				if(outValObj.get("dispatchIdArr") != null) {
					dispatchIdArr		= (Long[]) outValObj.get("dispatchIdArr");
					dispatchIdString	= Utility.GetLongArrayToString(dispatchIdArr);
					lhpvModel.setTotalNoOfLS(dispatchIdArr.length);
				}

				if(outValObj.get("ddmIdArr") != null) {
					ddmIdArr			= (Long[]) outValObj.get("ddmIdArr");
					ddmIdString			= Utility.GetLongArrayToString(ddmIdArr);
				}

				if(isFreightTotalNeededInPrint || isBookingTotalNeededInPrint)
					if(typeOfLHPV == LHPVConstant.TYPE_OF_LHPV_ID_NORMAL) {
						freightTotalObj	= DispatchSummaryDao.getInstance().getFreightTotalOfDispatchLedger(dispatchIdString);
						freightTotalHm	= (HashMap<Long, Double>) freightTotalObj.get("dispatchIdWiseTotalHm");
						freightAmountHm	= (HashMap<Long, Double>) freightTotalObj.get("dispatchIdWiseFreightTotalHm");
						bookingTotalHm	= (HashMap<Long, Double>) freightTotalObj.get("dispatchIdWiseBookingTotalHm");
						dispatchSummaryList = (ArrayList<DispatchSummary>) freightTotalObj.get("dispatchSummaryList");
					} else if(typeOfLHPV == LHPVConstant.TYPE_OF_LHPV_ID_DDM) {
						freightTotalObj	= DeliveryRunSheetSummaryDao.getInstance().getFreightTotalOfDDM(ddmIdString);
						freightTotalHm	= (HashMap<Long, Double>) freightTotalObj.get("delRunSheetLedgerIdWiseTotalHm");
						bookingTotalHm	= (HashMap<Long, Double>) freightTotalObj.get("delRunSheetLedgerIdsWiseBookingTotalHm");
					}

				if(ObjectUtils.isNotEmpty(dispatchSummaryList))
					dispatchMap = dispatchSummaryList.stream().collect(Collectors.groupingBy(
							DispatchSummary::getDispatchLedgerId,Collectors.toMap(
									DispatchSummary::getWayBillId,dispatchSummary -> dispatchSummary
									)
							));


				inValObj.put("lhpvId", lhpvId);
				inValObj.put("executive", executive);

				valueOutObjectForCharges 	= CreateBLHPVBLL.getInstance().getLHPVChargesForGroup(inValObj);

				final var 	lhpvChargesHshmp 	= (LinkedHashMap<String, LhpvChargesForGroup>) valueOutObjectForCharges.get("lhpvChargesHshmp");

				final var tdsProperty	= cache.getTDSConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.LHPV);

				if(lhpvChargesHshmp != null && tdsProperty != null && (boolean) tdsProperty.getOrDefault(TDSPropertiesConstant.SHOW_TDS_PERCENTAGE_WITH_NAME, false))
					for(final Map.Entry<String, LhpvChargesForGroup> entry : lhpvChargesHshmp.entrySet()) {
						final var	lhpvChargesForGroup	= entry.getValue();

						if(lhpvChargesForGroup.getLhpvChargeTypeMasterId() == LHPVChargeTypeConstant.TDS) {
							final var	tdsChargeInPercent	= (String) tdsProperty.getOrDefault(TDSPropertiesConstant.TDS_CHARGE_IN_PERCENT, "0");

							if(tdsChargeInPercent != null && !tdsChargeInPercent.isEmpty())
								lhpvChargesForGroup.setDisplayName(lhpvChargesForGroup.getDisplayName() + " ( " +  tdsChargeInPercent.split(",")[0] + "% )");

							break;
						}
					}

				String 					wayBillNos					= null;

				lhpv 	= LHPVDao.getInstance().getLHPVDetails(lhpvId);

				if(showWaybillNumberOnLhpvPrint) {
					final var	lhpvList= LHPVDao.getInstance().getLHPVDetailsForCompanyDetails(lhpv.getLhpvId());

					if(lhpvList != null && !lhpvList.isEmpty())
						wayBillNos = lhpvList.stream().map(LHPVCompanyDetails::getWayBillNumber).collect(Collectors.joining(Constant.COMMA));
				}

				vehicle 	= cache.getVehicleNumber(request, executive.getAccountGroupId(), lhpv.getVehicleNumberMasterId());

				lhpvModel.setVehicleCapacity(lhpv.getVehicleCapacity());
				lhpvModel.setVehicleCapacityInTon(lhpv.getVehicleCapacity()/1000);
				lhpvModel.setLhpvTotalActualWeight(lhpv.getTotalActualWeight());
				lhpvModel.setWeightDifference(lhpv.getWeightDifference());
				lhpvModel.setRemark(Utility.checkedNullCondition(lhpv.getRemark(), (short) 2));
				lhpvModel.setAdditionalRemark(Utility.checkedNullCondition(lhpv.getAdditionalRemark(), (short) 2));
				lhpvModel.setWeighbridge(lhpv.getWeighbridge());
				lhpvModel.setUnLadenWeight(vehicle != null ? vehicle.getUnLadenWeight() : 0);
				lhpvModel.setEngineNumber(vehicle.getEngineNumber() != null ? vehicle.getEngineNumber() : " ");
				lhpvModel.setChasisNumber(vehicle.getChasisNumber() != null ? vehicle.getChasisNumber() : " ");
				lhpvModel.setVehicleTypeName(vehicle.getVehicleTypeName() != null ? vehicle.getVehicleTypeName() : " ");
				lhpvModel.setRegisteredOwner(vehicle.getRegisteredOwner() != null ? vehicle.getRegisteredOwner() : " ");
				lhpvModel.setVehiclePanNumber(vehicle.getPanNumber() != null ? vehicle.getPanNumber() : "--");
				lhpvModel.setLhpvBranchId(lhpv.getlHPVBranchId());
				lhpvModel.setExecutiveName(lhpv.getExecutiveName());
				lhpvModel.setLhpvDriverName(Utility.checkedNullCondition(lhpv.getDriverName(), (short) 2));
				lhpvModel.setLhpvDriverMobileNo(lhpv.getDriver1MobileNumber1());
				lhpvModel.setPaymentTypeName(lhpv.getPaymentTypeName());
				lhpvModel.setPanNumberLhpv(lhpv.getPanNumber());
				lhpvModel.setLorryHireBy(lhpv.getLorryHireBy());
				lhpvModel.setRatePMTTypeName(RatePMTTypeConstant.getTypeHM().get(lhpv.getRatePMTType()));
				lhpvModel.setWayBillNumber(wayBillNos);
				lhpvModel.setExtraWeight(lhpv.getExtraWeight());
				lhpvModel.setRateUnitTypeName(RatePMTTypeConstant.getRateHM().get(lhpv.getRateUnitType()));
				lhpvModel.setOpeningKM(lhpv.getOpeningKM());
				lhpvModel.setRateValue(lhpv.getRateValue());
				lhpvModel.setPassingWeight(lhpv.getPassingWeight());
				lhpvModel.setAdditionalWeight(lhpv.getAdditionalWeight());
				lhpvModel.setClosingKM(lhpv.getClosingKM());
				lhpvModel.setRegisteredOwnerContact(vehicle.getRegisteredOwnerContact() != null ? vehicle.getRegisteredOwnerContact() : "--");
				lhpvModel.setInsuranceName(vehicle.getInsuranceName() == null ? "--" : vehicle.getInsuranceName());
				lhpvModel.setPolicyNo(vehicle.getPolicyNo() == null ? "--" : vehicle.getPolicyNo());
				lhpvModel.setLoadCapicity(vehicle.getLoadCapacity());
				lhpvModel.setCurrentTime(DateTimeUtility.getDateFromTimeStamp(DateTimeUtility.getCurrentTimeStamp(), DateTimeFormatConstant.HH_MM_AA));
				lhpvModel.setCurrentDate(DateTimeUtility.getDateFromTimeStamp(DateTimeUtility.getCurrentTimeStamp(), DateTimeFormatConstant.DD_MM_YY));
				lhpvModel.setVehicleAddress(vehicle.getAddress() != null ? vehicle.getAddress() : " ");

				if(lhpv.getLhpvSourceBranchId() > 0)
					lhpvModel.setLhpvSourceBranchName(((Branch) branchesObj.get(Long.toString(lhpv.getLhpvSourceBranchId()))).getName());

				lhpvDestBranch = cache.getGenericBranchDetailCache(request, lhpv.getDestinationBranchId());

				if(lhpvDestBranch != null) {
					lhpvModel.setLhpvDestNameStr(lhpvDestBranch.getName());
					lhpvModel.setLhpvDestMobileNo(lhpvDestBranch.getMobileNumber() != null ? lhpvDestBranch.getMobileNumber() : "000000000");
					lhpvModel.setLhpvDestPhoneNo(lhpvDestBranch.getPhoneNumber() != null ? lhpvDestBranch.getPhoneNumber() : "0000000000");
				} else {
					lhpvModel.setLhpvDestNameStr("--");
					lhpvModel.setLhpvDestMobileNo("");
					lhpvModel.setLhpvDestPhoneNo("");
				}

				if(lhpv.getlHPVBranchId() > 0 )
					lhpvModel.setLhpvSrcNameStr(cache.getGenericBranchDetailCache(request, lhpv.getlHPVBranchId()).getName());
				else
					lhpvModel.setLhpvSrcNameStr("--");

				var	branch = cache.getGenericBranchDetailCache(request, lhpv.getlHPVBranchId());

				request.setAttribute("isShowLrRateForToPayAndTbb", (boolean) lhpvPrintConfigHM.getOrDefault(LhpvPrintConfigurationConstant.IS_SHOW_LR_RATE_FOR_TOPAY_AND_TBB, false));
				request.setAttribute("subRegionAllowedForPopup", (boolean) lhpvPrintConfigHM.getOrDefault(LhpvPrintConfigurationConstant.ALLOW_SUBREGION_WISE_POPUP, false)
						&& com.iv.utils.utility.Utility.isIdExistInLongList(lhpvPrintConfigHM, LhpvPrintConfigurationConstant.SUBREGION_IDS_WISE_FOR_POPUP, branch.getSubRegionId()));

				if(vehicle.getPolicyValidity() != null)
					lhpvModel.setInsuranceValidityDate(DateTimeUtility.getDateFromTimeStamp(vehicle.getPolicyValidity(), DateTimeFormatConstant.DD_MM_YY_HH_MM_SS));

				if(vehicle.getFcValidity() != null)
					lhpvModel.setFcValidityDate(DateTimeUtility.getDateFromTimeStamp(vehicle.getFcValidity(), DateTimeFormatConstant.DD_MM_YY_HH_MM_SS));

				if(lhpv.getRouteTime() != null) {
					final var	routeTimeValObj = DateTimeUtility.getDayDiffBetweenTwoDatesInHoursAndMinutes(lhpv.getCreationDateTimeStamp(),lhpv.getRouteTime());

					if(routeTimeValObj != null)
						lhpvModel.setRouteTime(routeTimeValObj.getString("timeDifference"));
				}

				if(lhpv.getCreationDateTimeStamp() != null)
					lhpvModel.setCreationDateTimeStringIn24HrFormat(DateTimeUtility.getDateTimeFromTimeStamp(lhpv.getCreationDateTimeStamp()));

				request.setAttribute("splitLHPV", lhpv.isSplitLHPV());

				if(lhpv.isSplitLHPV()) {
					final var	splitLHPVDataList 	= BranchWiseLhpvAmountDaoImpl.getInstance().getSplitLHPVDetails(executive.getAccountGroupId(), lhpvId);

					if(splitLHPVDataList != null && !splitLHPVDataList.isEmpty())
						for(final BranchWiseLhpvAmount splitData : splitLHPVDataList)
							if(splitData.getBranchId() > 0)
								splitData.setBranchName(cache.getGenericBranchDetailCache(request, splitData.getBranchId()).getName());

					request.setAttribute("finalsplitLHPVDataList", splitLHPVDataList);
				}

				final var	lhpvBranch =  cache.getBranchById(request, executive.getAccountGroupId(), lhpvModel.getLhpvBranchId());
				lhpvModel.setLhpvBranchName(lhpvBranch.getName());

				for(var i = 0; i < lhpvModels.length; i++) {
					if(lhpvModels[i].getBalancePayableAtBranchId() > 0){
						lhpvModel.setBalancePayableAtBranch(cache.getGenericBranchDetailCache(request, lhpvModels[i].getBalancePayableAtBranchId()).getName());
						branch		= cache.getGenericBranchDetailCache(request, lhpvModels[i].getBalancePayableAtBranchId());
						final var	subRegion	= cache.getGenericSubRegionById(request, branch.getSubRegionId());

						if (subRegion != null)
							lhpvModel.setBalancePayableAtSubRegion(subRegion.getName());
						else
							lhpvModel.setBalancePayableAtSubRegion("--");
					} else
						lhpvModel.setBalancePayableAtBranch("--");

					sourceBranchStr 	= cache.getGenericBranchDetailCache(request, lhpvModels[i].getSourceBranchId()).getName();
					sourceBranch  		= cache.getBranchById(request, executive.getAccountGroupId(), lhpvModels[i].getSourceBranchId());

					final var cleanerName = lhpvModels[i].getCleanerName();

					final var cleanerNameCommaSeparated = new StringJoiner(Constant.COMMASPACE);

					if (StringUtils.isNotEmpty(cleanerName))
						cleanerNameCommaSeparated.add(cleanerName);

					lhpvModel.setSourceCityName(cache.getCityById(request, sourceBranch.getCityId()).getName());

					if(lhpvModels[i].getDestinationBranchId() > 0){
						destBranch		= cache.getGenericBranchDetailCache(request, lhpvModels[i].getDestinationBranchId());
						destBranchStr 	= destBranch.getName();
						handlingBranch	= null;

						if(destBranch.getHandlingBranchId() > 0)
							handlingBranch  = cache.getGenericBranchDetailCache(request, destBranch.getHandlingBranchId());

						if((boolean) lhpvPrintConfigHM.getOrDefault(LhpvPrintConfigurationConstant.SHOW_HANDLING_BRANCH_FOR_OPERATION_BRANCH, false) && destBranch != null &&
								destBranch.getHandlingBranchId() > 0 && destBranch.getTypeOfLocation() == Branch.TYPE_OF_LOCATION_OPERATIONAL_PLACE
								&& handlingBranch != null)
							destBranchStr = destBranchStr + " ( " + handlingBranch.getName() + " ) ";
					}

					if(destBranch != null){
						destBranchList.add(destBranch.getBranchId());
						lhpvModel.setDestCityName(cache.getCityById(request, destBranch.getCityId()).getName());
					}

					lhpvModel.setLoadedById(lhpvModels[i].getLoadedById());

					if(destBranchList != null && !destBranchList.isEmpty()) {
						crossingBranchList	= new ArrayList<>();

						for(final Long destBranchId : destBranchList) {
							destinationBranch	= cache.getGenericBranchDetailCache(request,destBranchId);

							if(destinationBranch != null && destinationBranch.isAgentBranch())
								crossingBranchList.add(destinationBranch.getName());
						}

						if(crossingBranchList != null && !crossingBranchList.isEmpty()) {
							crossingBranchArr	= new String[crossingBranchList.size()];
							crossingBranchList.toArray(crossingBranchArr);

							crossingBranchString	= Utility.getStringFromStringArray(crossingBranchArr);
						}
					}

					if(i == 0) {
						request.setAttribute("LoggedInBranchDetails", cache.getGenericBranchDetailCache(request,executive.getBranchId()));

						request.setAttribute("lhpvBranch", lhpvBranch);

						ActionStaticUtil.setRequestAttribute(request,"customAddressBranchId", lhpvModel.getLhpvBranchId());
						ActionStaticUtil.setRequestAttribute(request,"customAddressIdentifer", CustomGroupMapper.IDENTIFIER_BOOKING);

						if (customGroupConfig.getBoolean(CustomGroupConfigurationDTO.CUSTOM_GROUP_ADDESS_ALLOWED))
							reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);

						if(reportViewModel.getAccountGroupName() == null || "".equals(reportViewModel.getAccountGroupName()) || "--".equals(reportViewModel.getAccountGroupName()))
							reportViewModel.setAccountGroupName(accountGroup.getDescription());

						reportViewModel.setBranchPhoneNumber(lhpvBranch.getPhoneNumber());
						reportViewModel.setBranchPhoneNumber2(lhpvBranch.getPhoneNumber2());
						reportViewModel.setBranchAddress(lhpvBranch.getAddress());
						reportViewModel.setBranchGstin(lhpvBranch.getGstn());
						reportViewModel.setBranchContactDetailEmailAddress(lhpvBranch.getEmailAddress());
						reportViewModel.setBranchContactDetailMobileNumber(lhpvBranch.getMobileNumber());
						reportViewModel.setBranchContactDetailPhoneNumber(lhpvBranch.getPhoneNumber());

						request.setAttribute("ReportViewModel", reportViewModel);
						lhpvModel.setDispatchLedgerIds(Long.toString(lhpvModels[i].getDispatchLedgerId()));
						lhpvModel.setSourceBranchString(sourceBranchStr);
						lhpvModel.setDestinationBranchString(destBranchStr);
						lhpvModel.setCrossingBranchString(crossingBranchString);
						lhpvModel.setLhpvSourceBranch(sourceBranch.getName());
						lhpvModel.setLhpvDestinationBranch(destinationBranch.getName());
						lhpvModel.setSourceBranchCode(sourceBranch != null && sourceBranch.getBranchCode() != null ? sourceBranch.getBranchCode() : "");
						lhpvModel.setDesBranchCode(destBranch != null && destBranch.getBranchCode() != null ? destBranch.getBranchCode() : "");
						lhpvModel.setCleanerName(cleanerNameCommaSeparated.toString());

						if(lhpvModels[i].getLsNumber() != null)
							lhpvModel.setLsNumber("" + lhpvModels[i].getLsNumber());
						else
							lhpvModel.setLsNumber("");

						if(lhpvModels[i].getDdmNumber() != null)
							lhpvModel.setDdmNumber("" + lhpvModels[i].getDdmNumber());
						else
							lhpvModel.setDdmNumber("");

						//Vehicle Agent
						if(lhpvModels[i].getVehicleAgentId() > 0) {

							vehicleAgentMaster 	= VehicleAgentMasterDao.getInstance().getSingleVehicleAgentDetails(lhpvModels[i].getVehicleAgentId());

							lhpvModel.setVehicleAgentName(vehicleAgentMaster.getName());
							lhpvModel.setPanNumber(vehicleAgentMaster.getPanNo());
							lhpvModel.setGstn(vehicleAgentMaster.getGstn());
							lhpvModel.setVehicleAgentMobileNumber(vehicleAgentMaster.getMobileNumber());
							lhpvModel.setPinCode(vehicleAgentMaster.getPincode());
							lhpvModel.setVehicleAgentAddress(vehicleAgentMaster.getAddress());
							lhpvModel.setBankAccountNo(vehicleAgentMaster.getAccountNo());
							lhpvModel.setIfscCode(vehicleAgentMaster.getIfscCode());
							lhpvModel.setBankBranchAddress(vehicleAgentMaster.getBankBranchAddress());
							lhpvModel.setDescription(vehicleAgentMaster.getDescription());
							lhpvModel.setBankName(vehicleAgentMaster.getBankName());

							if((boolean) lhpvPrintConfigHM.getOrDefault(LhpvPrintConfigurationConstant.PRINT_VEHICLE_AGENT_NAME_AS_REGISTERED_OWNER, false))
								lhpvModel.setRegisteredOwner(vehicleAgentMaster.getName());

							if(vehicleAgentMaster.getCityId() > 0)
								lhpvModel.setCityName(cache.getCityById(request, vehicleAgentMaster.getCityId()).getName());
							else
								lhpvModel.setCityName("--");
						} else if(executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_SNGT
								|| executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_KATIRA) {
							lhpvModel.setVehicleAgentName(accountGroup.getDescription());
							lhpvModel.setPanNumber("");
						} else {
							lhpvModel.setVehicleAgentName("");
							lhpvModel.setPanNumber("");
							lhpvModel.setRegisteredOwner(vehicle.getRegisteredOwner());
							lhpvModel.setOwnerPanNumber(vehicle.getPanNumber());
							lhpvModel.setGstn(lhpvBranch.getGstn());
							lhpvModel.setVehicleAgentAddress("");

							if(lhpvModel.getRegisteredOwner() != null)
								lhpvModel.setRegisteredOwnerKgs("KGS");

							lhpvModel.setRegisteredOwnerContact(vehicle.getRegisteredOwnerContact() != null ? vehicle.getRegisteredOwnerContact() : "--");
						}

						//Driver 1
						if(lhpvModels[i].getDriverId() > 0 ) {
							driverMaster 	= DriverMasterDao.getInstance().getDriverDataById(lhpvModels[i].getDriverId(), executive.getAccountGroupId());
							if(driverMaster != null){
								lhpvModel.setDriverName(driverMaster.getName());
								lhpvModel.setDriverLicenceNumber(driverMaster.getLicenceNumber());
							}
						} else {
							lhpvModel.setDriverName(lhpvModels[i].getDriverName());
							lhpvModel.setDriverLicenceNumber("");
						}

						// Get LhpvDriver Details from LHPV table
						if(lhpvModels[i].getLhpvDriverId() > 0) {
							driverMaster 	= DriverMasterDao.getInstance().getDriverDataById(lhpvModels[i].getLhpvDriverId(), executive.getAccountGroupId());

							if(driverMaster != null) {
								lhpvModel.setLhpvDriverName(driverMaster.getName());
								lhpvModel.setLhpvDriverLicenceNumber(driverMaster.getLicenceNumber());

								if(StringUtils.isEmpty(lhpvModel.getLhpvDriverMobileNo()))
									lhpvModel.setLhpvDriverMobileNo(driverMaster.getMobileNumber());

								if(driverMaster.getValidUpto() != null)
									lhpvModel.setLhpvDriverValidUptoDate(Utility.getTimestampToDate(driverMaster.getValidUpto()));
							}
						} else {
							lhpvModel.setLhpvDriverName(lhpv.getDriverName());
							lhpvModel.setLhpvDriverMobileNo(lhpv.getDriver1MobileNumber1());
						}

						// Get Driver1 mobile Number from first LHPV
						lhpvModel.setDriver1MobileNumber1(lhpvModels[i].getDriver1MobileNumber1() != null?lhpvModels[i].getDriver1MobileNumber1():"");
						lhpvModel.setDriver1MobileNumber2(lhpvModels[i].getDriver1MobileNumber2() != null?lhpvModels[i].getDriver1MobileNumber2():"");

						if(StringUtils.isNotEmpty(lhpvModel.getDriver1MobileNumber2()))
							//Get single string of the two mobile Numbers
							lhpvModel.setDriver1MobileNumber1(lhpvModel.getDriver1MobileNumber1() +", "+ lhpvModel.getDriver1MobileNumber2());

						//Driver 2
						if(lhpvModels[i].getDriver2Id() > 0) {
							driverMaster = DriverMasterDao.getInstance().getDriverDataById(lhpvModels[i].getDriver2Id(), executive.getAccountGroupId());
							lhpvModel.setDriver2Name(driverMaster.getName());
							lhpvModel.setDriver2LicenceNumber(driverMaster.getLicenceNumber());
						} else {
							lhpvModel.setDriver2Name("");
							lhpvModel.setDriver2LicenceNumber("");
						}
					} else {
						if(lhpvModels[i].getLsNumber() != null)
							lhpvModel.setLsNumber(lhpvModel.getLsNumber() + "," + lhpvModels[i].getLsNumber());
						else
							lhpvModel.setLsNumber(Utility.checkedNullCondition(lhpvModel.getLsNumber(),""));

						if(lhpvModels[i].getDdmNumber() != null)
							lhpvModel.setDdmNumber(lhpvModel.getDdmNumber() + "," + lhpvModels[i].getDdmNumber());
						else
							lhpvModel.setDdmNumber(Utility.checkedNullCondition(lhpvModel.getDdmNumber(), ""));

						lhpvModel.setDispatchLedgerIds(lhpvModel.getDispatchLedgerIds() + " ," + lhpvModels[i].getDispatchLedgerId());
						lhpvModel.setSourceBranchString(lhpvModel.getSourceBranchString() + " ," + sourceBranchStr);
						lhpvModel.setDestinationBranchString(lhpvModel.getDestinationBranchString() + " ," + destBranchStr);
						lhpvModel.setVehicleAgentName(Utility.checkedNullCondition(lhpvModel.getVehicleAgentName(), (short) 2));
						lhpvModel.setDriverName(Utility.checkedNullCondition(lhpvModel.getDriverName(), (short) 2));
						lhpvModel.setDriverLicenceNumber(Utility.checkedNullCondition(lhpvModel.getDriverLicenceNumber(), (short) 2));
						lhpvModel.setDriver2Name(Utility.checkedNullCondition(lhpvModel.getDriver2Name(), (short) 2));
						lhpvModel.setDriver2LicenceNumber(Utility.checkedNullCondition(lhpvModel.getDriver2LicenceNumber(), (short) 2));
						lhpvModel.setLhpvSourceBranch(sourceBranch.getName());
						lhpvModel.setLhpvDestinationBranch(destinationBranch.getName());
						lhpvModel.setCleanerName(cleanerNameCommaSeparated.toString());
					}

					lhpvModel.setTotalActualWeight(lhpvModel.getTotalActualWeight() + lhpvModels[i].getTotalActualWeight());
					lhpvModel.setTotalNoOfPackages(lhpvModel.getTotalNoOfPackages() + lhpvModels[i].getTotalNoOfPackages());
					lhpvModel.setTotalNoOfWayBills(lhpvModel.getTotalNoOfWayBills() + lhpvModels[i].getTotalNoOfWayBills());
					lhpvModel.setTotalNoOfDoorDelivery(lhpvModel.getTotalNoOfDoorDelivery() + lhpvModels[i].getTotalNoOfDoorDelivery());
					lhpvModel.setTotalNoOfForms(lhpvModel.getTotalNoOfForms() + lhpvModels[i].getTotalNoOfForms());
					lhpvModel.setVehicleNumber(lhpvModels[i].getVehicleNumber());
					lhpvModel.setLhpvId(lhpvModels[i].getLhpvId());
					lhpvModel.setCreationDateTimeStamp(lhpvModels[i].getCreationDateTimeStamp());
					lhpvModel.setBalancePayableAtBranchId(lhpvModels[i].getBalancePayableAtBranchId());
					lhpvModel.setMaterials(Utility.checkedNullCondition(lhpvModels[i].getMaterials(), (short) 2));
					lhpvModel.setRatePMT(lhpvModels[i].getRatePMT());
					lhpvModel.setUnloading(lhpvModels[i].getUnloading());
					lhpvModel.setDetaintion(lhpvModels[i].getDetaintion());
					lhpvModel.setDeduction(lhpvModels[i].getDeduction());
					lhpvModel.setToPayReceived(lhpvModels[i].getToPayReceived());
					lhpvModel.setLhpvNumber(lhpvModels[i].getLhpvNumber());
					lhpvModel.setLhpvBranchId(lhpvModels[i].getLhpvBranchId());
					lhpvModel.setAgentName(lhpvModels[i].getAgentName());
					lhpvModel.setVehicleOwner(lhpvModels[i].getVehicleOwner());

					if(typeOfLHPV == LHPVConstant.TYPE_OF_LHPV_ID_NORMAL)
						dispatchLedgerIdList.add(lhpvModels[i].getDispatchLedgerId());
					else if(typeOfLHPV == LHPVConstant.LHPV_TYPE_ID_DDM || typeOfLHPV == LHPVConstant.TYPE_OF_LHPV_ID_DDM)
						dispatchLedgerIdList.add(lhpvModels[i].getDeliveryRunsheetLedgerId());

					if(lhpvId > 0) {
						tdsTxnDetails = TDSTxnDetailsDAO.getInstance().getTDSTxnDetails(TDSTxnDetailsIdentifiers.TDSTXNDETAILS_IDENTIFIER_LHPV, lhpvId);

						if (tdsTxnDetails != null) {
							tdsTxnDetails.setOwnerName(tdsTxnDetails.getOwnerName() != null ? tdsTxnDetails.getOwnerName() : "");
							tdsTxnDetails.setPanNumber(tdsTxnDetails.getPanNumber() != null ? tdsTxnDetails.getPanNumber() : "");
							tdsTxnDetails.setDeclarationGivenForUser(TDSTxnDetailsConstant.getDeclarationForUser(tdsTxnDetails.getDeclarationGiven()));
							tdsTxnDetails.setContactPerson(tdsTxnDetails.getContactPerson() != null ? tdsTxnDetails.getContactPerson() : "");
							tdsTxnDetails.setCategoryForUser(TDSTxnDetailsConstant.getCategoryForUser(tdsTxnDetails.getCategory()));
							tdsTxnDetails.setTdsRate(tdsTxnDetails.getTdsRate());
							tdsTxnDetails.setTdsAmount(tdsTxnDetails.getTdsAmount());

							request.setAttribute("tdsTxnDetails", tdsTxnDetails);
						}
					}

					//Addded By Anant Chaudhary		11-01-2016
					final var	lhpvchargesCollVal 	= LhpvSettlementChargesDao.getInstance().getSetlementChargesByBlhpvId(lhpvModels[i].getLhpvId() , LhpvChargesForGroup.IDENTIFIER_TYPE_LHPV);

					if(lhpvchargesCollVal != null) {
						lhpvchargesColl 	= (HashMap<Long, Double>) lhpvchargesCollVal.get("chargesColl");

						if(lhpvchargesColl != null)
							setLHPVAmount(lhpvModel, lhpvchargesColl);
					}
				}

				final var	isAllowToShowAmountColumns = !hideAmountColumnsForBalancePayableBranch || isAllowToSearchAllBranchLHPV || lhpvModel.getBalancePayableAtBranchId() <= 0 || lhpvModel.getBalancePayableAtBranchId() != executive.getBranchId() || lhpvModel.getBalancePayableAtBranchId() == lhpvModel.getSourceBranchId();

				lhpvModel.setTotalLorryHire(lhpvModel.getAdditionalWeightChrg() + lhpv.getTotalAmount());

				final var	strDispLdgrIds	= dispatchLedgerIdList.stream().map(String::valueOf).collect(Collectors.joining(","));

				if(lhpvModel.getLhpvId() > 0)
					dieselDetailsValueObj = LHPVDao.getInstance().getLHPVDieselDetails(lhpvModel.getLhpvId());

				if(dieselDetailsValueObj != null)
					request.setAttribute("dieselDetailsList", dieselDetailsValueObj.get("dieselDetailsList"));

				if(executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_AAKASH
						|| executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_ARR
						|| executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_SCC
						|| executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_RGLPL
						|| executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_RECTUS
						|| executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_KXCPL
						|| executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_KL
						|| executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_DLT
						|| executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_KNS
						|| executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_SHIV
						|| executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_DEMO
						|| executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_RPS
						|| executive.getAccountGroupId() > AccountGroupConstant.ACCOUNT_GROUP_ID_PGT && executive.getAccountGroupId() != AccountGroupConstant.ACCOUNT_GROUP_ID_SBT
						|| executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_MILAN
						|| executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_SRLIPL
						|| executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_KCM
						|| executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_DLSEXPRESS
						){

					if(typeOfLHPV == LHPVConstant.TYPE_OF_LHPV_ID_NORMAL)
						dispatchLedgerDetails		= DispatchLedgerDao.getInstance().getDispatchLedgerDetailsByLSIds(strDispLdgrIds);
					else if(typeOfLHPV == LHPVConstant.LHPV_TYPE_ID_DDM || typeOfLHPV == LHPVConstant.TYPE_OF_LHPV_ID_DDM)
						dispatchLedgerDetails	 	= DeliveryRunSheetLedgerDao.getInstance().getDeliveryRunSheetLedgerDetailsByDeliveryRunSheetLedgerIds(strDispLdgrIds);

					if(typeOfLHPV == LHPVConstant.TYPE_OF_LHPV_ID_NORMAL) {
						if(showDataOnPrintByBillSelectionType && billSelectionId > 0)
							valueObject 		= DispatchSummaryDao.getInstance().getWayBillIdsByDispatchLedgerIdsAndBillselectionId(strDispLdgrIds, billSelectionId);
						else
							valueObject 		= DispatchSummaryDao.getInstance().getDispatchSummaryByDispatchLedgerIds(strDispLdgrIds);
					}else if(typeOfLHPV == LHPVConstant.LHPV_TYPE_ID_DDM || typeOfLHPV == LHPVConstant.TYPE_OF_LHPV_ID_DDM)
						valueObject	 	= DeliveryRunSheetSummaryDao.getInstance().getDeliveryRunsheetSummaryByDeliveryRunsheetLedgerIds(strDispLdgrIds);

					if(valueObject != null) {
						wbIdsArr 			= (ArrayList<Long>) valueObject.get("waybillIdsForCreatingString");
						final var	strWBIds 			= CollectionUtility.getStringFromLongList(wbIdsArr);

						if(!strWBIds.isEmpty()) {
							wayBillCol	 		= WayBillDao.getInstance().getLRDetails(strWBIds);
							wayBillTaxTxnHM		= WayBillTaxTxnDao.getInstance().getWayBillTaxTxn(strWBIds);
						}

						dlForWBIds 			= (HashMap<Long, ArrayList<Long>>) valueObject.get("dispachLedgerWithWaybillids");
						wayBillWiseAmountHM = (HashMap<Long, Boolean>) valueObject.get("wayBillWiseAmountHM");
						final var wayBillIdWiseBookingchargesHM 	= WayBillBookingChargesBllImpl.getInstance().getWayBillIdWiseChargesMapHM(strWBIds);

						if(showDataOnPrintByBillSelectionType || showSourceAndDestinationWiseLRSummary || showDestinationWiseLSSummary) {
							dispatchSummaryDetailsHM	= getDispatchSummaryDetails(request, strDispLdgrIds, strWBIds);

							if(dispatchSummaryDetailsHM != null) {
								totalQuantity	= dispatchSummaryDetailsHM.values().stream().mapToLong(DispatchLRSummary::getQuantity).sum();
								totalWeight		= dispatchSummaryDetailsHM.values().stream().mapToDouble(DispatchLRSummary::getWayBillActualWeight).sum();
							}
						}

						if(dispatchLedgerDetails != null) {
							dispatchLedgerArrlist 			= new ArrayList<>();
							dispatchModelArrlist 			= new ArrayList<>();
							waybillTypeHshmp 				= new HashMap<>();
							truckDeliverySummaryValObject 	= new ValueObject();
							wayBillHM					  	= new HashMap<>();

							for(final Map.Entry<Long, DispatchLedger> entry : dispatchLedgerDetails.entrySet()) {
								chargeWeight    = 0;
								totalDirectAmount				= 0.00;
								totalConnectingAmount			= 0.00;
								final var dl = entry.getValue();
								final var 	diModel 			= new DispatchLedgerModel();

								if(showLsBranchIdInsteadOfSourceBranchId)
									dl.setSourceBranch(cache.getGenericBranchDetailCache(request, dl.getLsBranchId()).getName());
								else
									dl.setSourceBranch(cache.getGenericBranchDetailCache(request, dl.getSourceBranchId()).getName());

								dl.setDestinationBranch(cache.getGenericBranchDetailCache(request, dl.getDestinationBranchId()).getName());
								dl.setDestinationBranchCode(cache.getGenericBranchDetailCache(request, dl.getDestinationBranchId()).getBranchCode());

								diModel.setDispatchLedgerId(dl.getDispatchLedgerId());
								diModel.setLsNumber(dl.getLsNumber());
								diModel.setSourceBranchId(dl.getSourceBranchId());
								diModel.setDestinationBranchId(dl.getDestinationBranchId());
								diModel.setSourceBranch(dl.getSourceBranch());
								diModel.setDestinationBranch(dl.getDestinationBranch());
								diModel.setTripDateTime(dl.getTripDateTime());

								SortingUtility.setLSNumberWithoutBranchCode(diModel);

								if(isFreightTotalNeededInPrint && freightTotalHm != null)
									dl.setFreightTotal(freightTotalHm.getOrDefault(dl.getDispatchLedgerId(), 0.0));

								if(isBookingTotalNeededInPrint && bookingTotalHm != null)
									dl.setTotalBookingAmount(bookingTotalHm.getOrDefault(dl.getDispatchLedgerId(), 0.0));

								if(isPartialDispatchCheck && ObjectUtils.isNotEmpty(dispatchMap)) {
									wayBillMap = dispatchMap.get(dl.getDispatchLedgerId());

									if (wayBillMap != null) {
										final var totalFreight = wayBillMap.values().stream().filter(DispatchSummary::isAmountShow)
												.mapToDouble(DispatchSummary::getFreight).sum();
										final var totalBooking = wayBillMap.values().stream().filter(DispatchSummary::isAmountShow)
												.mapToDouble(DispatchSummary::getBookingAmount).sum();

										dl.setFreightTotal(totalFreight);
										dl.setTotalBookingAmount(totalBooking);
									}
								}

								final var		waybillIdList = dlForWBIds.get(entry.getKey()) ;

								Map<Long, Double>	lrWiseChargeHM 	= new HashMap<>();

								if(waybillIdList != null && wayBillCol != null)
									for (final Long element : waybillIdList) {
										final var wayBill 		= wayBillCol.get(element);

										final var chargesHm = wayBillIdWiseBookingchargesHM.get(element);

										if (chargesHm != null)
											lrWiseChargeHM	= CollectionUtility.mergeTwoMapValues4(lrWiseChargeHM, chargesHm);

										taxAmnt 		= 0;
										chargeWeight    += wayBill.getChargeWeight();

										if(wayBillTaxTxnHM != null && wayBillTaxTxnHM.get(wayBill.getWayBillId()) != null) {
											final List<WayBillTaxTxn> wayBillTaxTxList	= wayBillTaxTxnHM.get(wayBill.getWayBillId());

											if(wayBillTaxTxList != null && !wayBillTaxTxList.isEmpty())
												taxAmnt	= wayBillTaxTxList.stream().map(WayBillTaxTxn::getTaxAmount).mapToDouble(Double::doubleValue).sum();
										}

										final var model = new WayBillTypeReportModel();

										isAmountShow = true;

										if(showDataOnPrintByBillSelectionType && billSelectionId > 0 && wayBillWiseAmountHM != null && wayBillWiseAmountHM.containsKey(element))
											isAmountShow	= wayBillWiseAmountHM.getOrDefault(element, false);

										if(isPartialDispatchCheck && wayBillMap != null) {
											disSumObj 		    = wayBillMap.get(wayBill.getWayBillId());
											if(disSumObj != null && disSumObj.isAmountShow())
												isAmountShow = true;
											else
												isAmountShow = false;
										}
										var wayBillTypeSmry	= waybillTypeHshmp.get(dl.getDispatchLedgerId());

										if(showSourceAndDestinationWiseLRSummary) {
											if(!uniqueWayBillIds.contains(wayBill.getWayBillId())) {
												if(wayBillTypeSmry == null)
													wayBillTypeSmry 	= new WayBillTypeSummary();
												else
													wayBillTypeSmry 	= waybillTypeHshmp.get(dl.getDispatchLedgerId());

												createDTOForWayBillTypeSummary(wayBillTypeSmry, wayBill, taxAmnt, isAmountShow);

												waybillTypeHshmp.put(dl.getDispatchLedgerId(), wayBillTypeSmry);
												countNumberOfLr++;
												uniqueWayBillIds.add(wayBill.getWayBillId());
											}
										} else {
											countNumberOfLr++;

											if(wayBillTypeSmry == null)
												wayBillTypeSmry 	= new WayBillTypeSummary();
											else
												wayBillTypeSmry 	= waybillTypeHshmp.get(dl.getDispatchLedgerId());

											createDTOForWayBillTypeSummary(wayBillTypeSmry, wayBill, taxAmnt, isAmountShow);

											waybillTypeHshmp.put(dl.getDispatchLedgerId(), wayBillTypeSmry);
										}

										if(wayBill.getDeliveryTo() == InfoForDeliveryConstant.DELIVERY_TO_TRUCK_DELIVERY_ID || showWaybillDetails){
											if(wayBill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID){
												if(isPartialDispatchCheck){
													if(isAmountShow) {
														tdPaidAmt 	+= Math.round(wayBill.getGrandTotal());
														model.setPaidAmount(wayBill.getGrandTotal());
													}
												} else {
													tdPaidAmt 	+= Math.round(wayBill.getGrandTotal());
													model.setPaidAmount(wayBill.getGrandTotal());
												}
											} else if(wayBill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY) {
												if(isPartialDispatchCheck){
													if(isAmountShow) {
														tdTopayAmt 	+= Math.round(wayBill.getGrandTotal());
														model.setTopayAmount(wayBill.getGrandTotal());

													}
												} else {
													tdTopayAmt 	+= Math.round(wayBill.getGrandTotal());
													model.setTopayAmount(wayBill.getGrandTotal());
												}
											} else if(wayBill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT)
												if(isPartialDispatchCheck){
													if(isAmountShow) {
														tdBBAmt 	+= Math.round(wayBill.getGrandTotal());
														model.setTbbAmount(wayBill.getGrandTotal());
													}
												} else {
													tdBBAmt 	+= Math.round(wayBill.getGrandTotal());
													model.setTbbAmount(wayBill.getGrandTotal());
												}

											model.setBookedDateStr(DateTimeUtility.getDateFromTimeStamp(wayBill.getBookingDateTime(), DateTimeFormatConstant.DD_MM_YY));
											model.setNoOfArticle(wayBill.getWayBillConsignmentQuantity());
											model.setWayBillNumber(wayBill.getWayBillNumber());
											model.setWeight(wayBill.getActualWeight());
											model.setWayBillId(wayBill.getWayBillId());
											model.setWayBillSourceBranch(cache.getGenericBranchDetailCache(request, wayBill.getSourceBranchId()).getName());
											model.setWayBillDestinationBranch(cache.getGenericBranchDetailCache(request, wayBill.getDestinationBranchId()).getName());

											model.setConsignorName(wayBill.getConsignerName() != null ? wayBill.getConsignerName() : "");
											model.setConsigneeName(wayBill.getConsigneeName() != null ? wayBill.getConsigneeName() : "");

											tdNoOfPckg  += wayBill.getWayBillConsignmentQuantity();
											tdActWeight += wayBill.getActualWeight();
											tdNoLR		+= 1;

											wayBillHM.put(model.getWayBillId(), model);
										}

										if((boolean) lhpvPrintConfigHM.getOrDefault(LhpvPrintConfigurationConstant.SHOW_DIFFERENT_AMOUNT_ON_NORMAL_AND_CROSSING_LRS, false))
											if(wayBill.getDestinationBranchId() == dl.getDestinationBranchId())
												totalDirectAmount 	+= freightAmountHm.getOrDefault(wayBill.getWayBillId(), 0.0);
											else
												totalConnectingAmount	+= freightAmountHm.getOrDefault(wayBill.getWayBillId(), 0.0);

										totalChargeWgt += wayBill.getChargeWeight();

										truckDeliverySummaryValObject.put("tdPaidAmt", tdPaidAmt);
										truckDeliverySummaryValObject.put("tdTopayAmt", tdTopayAmt);
										truckDeliverySummaryValObject.put("tdBBAmt", tdBBAmt);
										truckDeliverySummaryValObject.put("tdNoOfPckg", tdNoOfPckg);
										truckDeliverySummaryValObject.put("tdActWeight", tdActWeight);
										truckDeliverySummaryValObject.put("tdNoLR", tdNoLR);

										if((boolean) lhpvPrintConfigHM.getOrDefault(LhpvPrintConfigurationConstant.SHOW_TOTAL_TO_PAY_AMOUNT, false) && wayBill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY)
											totalToPayGrandTotal += Math.round(wayBill.getGrandTotal());

										if(branchCommissionFinalHm != null) {
											final var br = (Branch) branchesObj.get(Long.toString(wayBill.getDestinationBranchId()));

											if(dl.getDestinationBranchId() == wayBill.getDestinationBranchId() || dl.getDestinationBranchId() == br.getHandlingBranchId()) {
												final var dispatchLRSummary = new DispatchLRSummary();
												dispatchLRSummary.setHandlingBranchId(br.getHandlingBranchId());
												dispatchLRSummary.setWayBillSourceBranchId(wayBill.getSourceBranchId());
												dispatchLRSummary.setLsDestinationBranchId(dl.getDestinationBranchId());
												dispatchLRSummary.setWayBillChargeWeight(wayBill.getChargeWeight());

												BranchCommissionBllImpl.getInstance().calculateDeliveryCommissionOfLS(dispatchLRSummary, branchCommissionFinalHm);

												dl.setCommission(dl.getCommission() + dispatchLRSummary.getCommissionAmount());
												dl.setDeliveryCommission(dispatchLRSummary.getDeliveryCommission());
											}
										}

										if(showDestinationWiseLSSummary && dispatchSummaryDetailsHM != null) {
											final var dispatchLRSummary	= dispatchSummaryDetailsHM.get(wayBill.getWayBillId());

											final var br1 = (Branch) branchesObj.get(Long.toString(wayBill.getDestinationBranchId()));

											if(br1.isAgentBranch()) {
												totalActualWeightOfAgentBranchLR	+= wayBill.getActualWeight();
												totalAmountOfAgentBranchLR			+= wayBill.getBookingTotal();
											}

											diModel.setTotalPaidAmount(diModel.getTotalPaidAmount() + dispatchLRSummary.getPaidAmount());
											diModel.setTotalToPayAmount(diModel.getTotalToPayAmount() + dispatchLRSummary.getTopayAmount());
											diModel.setTotalTBBAmount(diModel.getTotalTBBAmount() + dispatchLRSummary.getTbbAmount());
											diModel.setTotalNoOfPackages(diModel.getTotalNoOfPackages() + (int) dispatchLRSummary.getQuantity());
											diModel.setTotalNoOfWayBills(diModel.getTotalNoOfWayBills() + (int) dispatchLRSummary.getWayBillCount());
											diModel.setTotalActualWeight(diModel.getTotalActualWeight() + dispatchLRSummary.getWayBillActualWeight());
										}
									}

								if(!lrWiseChargeHM.isEmpty())
									lsWiseBookingChargeHm.put(diModel.getDispatchLedgerId(), lrWiseChargeHM);

								dl.setDirectAmount(totalDirectAmount);
								dl.setConnectingAmount(totalConnectingAmount);
								dl.setTotalChargeWeight(chargeWeight);
								dispatchLedgerArrlist.add(dl);
								dispatchModelArrlist.add(diModel);

								lhpvModel.setCommissionAmount(lhpvModel.getCommissionAmount() + dl.getCommission());
							}

							lhpvModel.setTotalChargeWeight(totalChargeWgt);
						}

						if(wayBillHM != null)
							truckTypeDeliveryLRString = wayBillHM.values().stream()
							.filter(Objects::nonNull)
							.map(WayBillTypeReportModel::getWayBillNumber)
							.collect(Collectors.joining(", "));

						request.setAttribute("lsWiseBookingChargeHm", lsWiseBookingChargeHm);
						request.setAttribute("waybillTypeHshmp", waybillTypeHshmp);
						request.setAttribute("dispatchLedgerArrlist", dispatchLedgerArrlist);
						request.setAttribute("truckDeliverySummaryValObject", truckDeliverySummaryValObject);
						request.setAttribute("wayBillHM", wayBillHM);
						request.setAttribute("countNumberOfLr", countNumberOfLr);
						request.setAttribute("totalQuantity", totalQuantity);
						request.setAttribute("totalWeight", totalWeight);
						request.setAttribute("hideToPayAmount", (boolean) lhpvPrintConfigHM.getOrDefault(LhpvPrintConfigurationConstant.HIDE_TOPAY_AMOUNT, false));
						request.setAttribute("hidePaidAmount", (boolean) lhpvPrintConfigHM.getOrDefault(LhpvPrintConfigurationConstant.HIDE_PAID_AMOUNT, false));
						request.setAttribute("showHidePaidToPayTbbColumn", (boolean) lhpvPrintConfigHM.getOrDefault(LhpvPrintConfigurationConstant.SHOW_HIDE_PAID_TO_PAY_TBB_COLUMN, false));
						request.setAttribute("truckTypeDeliveryLRString", truckTypeDeliveryLRString);
					}

					if(showSourceAndDestinationWiseLRSummary && dispatchSummaryDetailsHM != null && !dispatchSummaryDetailsHM.isEmpty()) {
						final List<DispatchLRSummary> sourceList 	= dispatchSummaryDetailsHM.values().stream().collect(CollectionUtility.getList());
						final List<DispatchLRSummary> destList		= new ArrayList<>();

						/*
						 * Copying one list to another list
						 * without affecting in original list
						 * while changing something in new list object
						 */

						sourceList.forEach((final DispatchLRSummary source) -> {
							final var target = new DispatchLRSummary();
							BeanUtils.copyProperties(source, target);
							destList.add(target);
						});

						final Map<Long, DispatchLRSummary>	sourceBranchSummaryHM	= sourceList.stream()
								.collect(Collectors.toMap(DispatchLRSummary::getWayBillSourceBranchId, Function.identity(), (v1, v2) -> v1 = merge(v1, v2), TreeMap::new));

						final Map<Long, DispatchLRSummary>	destBranchSummaryHM		= destList.stream()
								.collect(Collectors.toMap(DispatchLRSummary::getWayBillDestinationBranchId, Function.identity(), (v1, v2) -> v1 = merge(v1, v2), TreeMap::new));

						request.setAttribute("sourceBranchSummaryHM", sourceBranchSummaryHM);
						request.setAttribute("destBranchSummaryHM", destBranchSummaryHM);
					}

					if(showDestinationWiseLSSummary && dispatchModelArrlist != null && !dispatchModelArrlist.isEmpty()) {
						dispatchModelArrlist	= SortingUtility.sortDispatchLedgerModelOnDestinationBranchAndLSNumber(dispatchModelArrlist);
						request.setAttribute("collectHM", dispatchModelArrlist.stream().collect(Collectors.groupingBy(DispatchLedgerModel::getDestinationBranchId)));

						request.setAttribute("totalActualWeightOfAgentBranchLR", totalActualWeightOfAgentBranchLR);
						request.setAttribute("totalAmountOfAgentBranchLR", totalAmountOfAgentBranchLR);

						calculationOfCrossingSummary(request, lhpvchargesColl, dispatchModelArrlist);
					}
				}

				if(groupListForAmtSmry.contains((int) executive.getAccountGroupId())){
					wbIdsArr 	= DispatchSummaryDao.getInstance().getWayBillIdsByDispatchLedgerIds(strDispLdgrIds);
					final var	strWBIds 	= CollectionUtility.getStringFromLongList(wbIdsArr);
					wayBillCol 	= WayBillDao.getInstance().getLimitedLRDetails(strWBIds);

					if(wayBillCol != null) {
						final var wayBillTypeSmry 	= new WayBillTypeSummary();

						wayBillCol.entrySet().stream().map(Entry::getValue).forEach((final var wayBill) -> createDTOForWayBillTypeSummary(wayBillTypeSmry, wayBill, 0, true));

						request.setAttribute("wayBillTypeSmry", wayBillTypeSmry);
					}
				}

				if(allowLorryHireBasedDistanceCalculation) {
					final var	lorryHireRouteArr = LorryHireRouteDao.getInstance().getLorryHireRouteByLorryHireId(lorryHireId);
					final var	lorryHire         = LorryHireDao.getInstance().getLorryHireDetailById((short)1, lorryHireId, null, executive.getAccountGroupId());

					if(lorryHire != null && lorryHire.getBranchId() > 0) {
						lorryHire.setBranch(cache.getGenericBranchDetailCache(request, lorryHire.getBranchId()).getName());
						request.setAttribute("lorryHire", lorryHire);
					}

					if(lorryHireRouteArr != null && lorryHireRouteArr.length > 0) {
						final var	lorryHireRouteValObj= new ValueObject();
						final var	branchDistanceMapBll= new BranchDetailsMapBLL();
						lorryHireRouteValObj.put("lorryHireRouteArr", lorryHireRouteArr);
						lorryHireRouteValObj.put("accountGrpId", executive.getAccountGroupId());
						lorryHireRouteValObj.put("genericBranch", cache.getGenericBranchesDetail(request));
						lorryHireRouteValObj.put("distanceCalculationUsingLatitudeAndLongitude", (boolean) lhpvPrintConfigHM.getOrDefault(LhpvPrintConfigurationConstant.DISTANCE_CALCULATION_USING_LATITUDE_LONGITUDE,false));

						branchDistValObj =  branchDistanceMapBll.getBranchDistanceByRouteBranchId(lorryHireRouteValObj);
					}

					if(branchDistValObj != null) {
						request.setAttribute("routeBranchDistanceStr", branchDistValObj.get("routeBranchDistanceStr"));
						request.setAttribute("routeBranchNameStr", branchDistValObj.get("routeBranchNameStr"));
						request.setAttribute("totalRouteBranchDistance", branchDistValObj.getLong("totalRouteBranchDistance", 0));
					} else
						request.setAttribute("totalRouteBranchDistance", 0);
				}

				final var	expenseSettelmentsDetails = ExpenseSettlementDao.getInstance().getExpenseSettlementById(lhpvId, expenseChrgMasterId, (short) 1);

				if((boolean) lhpvPrintConfigHM.getOrDefault(LhpvPrintConfigurationConstant.SHOW_MULTIPLE_REMARKS, false))
					request.setAttribute("multipleLHPVRemarksList", MultipleLHPVRemarkDaoImpl.getInstance().getMultipleLHPVRemarksByLHPVId(executive.getAccountGroupId(), lhpvId));

				request.setAttribute("AllLHPVCharges", valueOutObjectForCharges.get("lhvChrgesGrpArr"));
				request.setAttribute("chargesColl", valueOutObjectForCharges.get("chargesColl"));
				request.setAttribute("lhpvChargesHshmp", valueOutObjectForCharges.get("lhpvChargesHshmp"));
				request.setAttribute("isFreightTotalNeededInPrint", isFreightTotalNeededInPrint);
				request.setAttribute("isBookingTotalNeededInPrint", isBookingTotalNeededInPrint);
				request.setAttribute("expenseSettelmentsDetails", expenseSettelmentsDetails);
				request.setAttribute("totalCommission", lhpvModel.getCommissionAmount());
				request.setAttribute("isAllowToShowAmountColumns", isAllowToShowAmountColumns);

				if(request.getParameter("isOriginal") != null)
					request.setAttribute("isOriginal", Boolean.parseBoolean(request.getParameter("isOriginal")));

				if(request.getParameter("isRePrint") != null)
					request.setAttribute("isRePrint", Boolean.parseBoolean(request.getParameter("isRePrint")));
				else
					request.setAttribute("isRePrint", true);

				if(showDataOnPrintByBillSelectionType && (dlForWBIds == null || dlForWBIds.isEmpty())) lhpvModel = null;

				request.setAttribute("ReportData", lhpvModel);
				request.setAttribute("VehicalData", vehicle);
				request.setAttribute("typeOfLHPV", typeOfLHPV);
				request.setAttribute("totalToPayGrandTotal", totalToPayGrandTotal);
				request.setAttribute(LhpvPrintConfigurationConstant.SHOW_COMPANY_LOGO, (boolean) lhpvPrintConfigHM.getOrDefault(LhpvPrintConfigurationConstant.SHOW_COMPANY_LOGO, false));
				request.setAttribute(LhpvPrintConfigurationConstant.SHOW_COMPANY_WATER_MARK_LOGO, (boolean) lhpvPrintConfigHM.getOrDefault(LhpvPrintConfigurationConstant.SHOW_COMPANY_WATER_MARK_LOGO, false));
				request.setAttribute(LHPVPropertiesConstant.ADDITIONAL_REMARK_FEILD_LABEL, lhpvConfigHM.getOrDefault(LHPVPropertiesConstant.ADDITIONAL_REMARK_FEILD_LABEL, false));

				if(defaultLHPVPrint) {
					if(executive.getAccountGroupId() > AccountGroupConstant.ACCOUNT_GROUP_ID_PGT || executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_DEMO)
						request.setAttribute("nextPageToken", "success_default");
					else
						request.setAttribute("nextPageToken", "success");
				} else
					request.setAttribute("nextPageToken", "success_" + executive.getAccountGroupId());
			} else {
				error.put("errorCode", CargoErrorList.NO_RECORDS);
				error.put("errorDescription", CargoErrorList.NO_RECORDS_DESCRIPTION);
				request.setAttribute("cargoError", error);
				request.setAttribute("nextPageToken", "success");
			}

		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}
	}

	private void createDTOForWayBillTypeSummary(final WayBillTypeSummary wayBillTypeSmry, final WayBill wayBill, final double taxAmnt,
			final boolean isAmountShow) {

		if(wayBill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID && isAmountShow)
			wayBillTypeSmry.setTotalPaidAmount(wayBillTypeSmry.getTotalPaidAmount() + Math.round(wayBill.getBookingChargesSum() + taxAmnt));
		else if(wayBill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY && isAmountShow)
			wayBillTypeSmry.setTotalToPayAmount(wayBillTypeSmry.getTotalToPayAmount() + Math.round(wayBill.getBookingChargesSum() + taxAmnt));
		else if(wayBill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT && isAmountShow)
			wayBillTypeSmry.setTotalCreditAmount(wayBillTypeSmry.getTotalCreditAmount() + Math.round(wayBill.getBookingChargesSum() + taxAmnt));

		wayBillTypeSmry.setTotalWeight(wayBillTypeSmry.getTotalWeight() + wayBill.getActualWeight());
	}

	public static DispatchLRSummary merge(final DispatchLRSummary first, final DispatchLRSummary second) {
		first.setQuantity(first.getQuantity() + second.getQuantity());
		first.setPaidAmount(first.getPaidAmount() + second.getPaidAmount());
		first.setTopayAmount(first.getTopayAmount() + second.getTopayAmount());
		first.setTbbAmount(first.getTbbAmount() + second.getTbbAmount());
		first.setWayBillActualWeight(first.getWayBillActualWeight() + second.getWayBillActualWeight());
		first.setWayBillChargeWeight(first.getWayBillChargeWeight() + second.getWayBillChargeWeight());
		first.setWayBillGrandTotal(first.getWayBillGrandTotal() + second.getWayBillGrandTotal());
		first.setWayBillCount(first.getWayBillCount() + second.getWayBillCount());

		return first;
	}

	private DispatchLRSummary createDTOForReportModel(final HttpServletRequest request, final DispatchArticleDetails dispatchArticleDetails) throws Exception {
		final var reportModel	= new DispatchLRSummary();

		try {
			reportModel.setWayBillCount(1);
			reportModel.setQuantity(dispatchArticleDetails.getQuantity());
			reportModel.setWayBillSourceBranchId(dispatchArticleDetails.getSourceBranchId());
			reportModel.setWayBillDestinationBranchId(dispatchArticleDetails.getDestinationBranchId());
			reportModel.setWayBillSourceBranchName(cache.getGenericBranchDetailCache(request, dispatchArticleDetails.getSourceBranchId()).getName());
			reportModel.setWayBillDestinationBranchName(cache.getGenericBranchDetailCache(request, dispatchArticleDetails.getDestinationBranchId()).getName());
			reportModel.setWayBillChargeWeight(dispatchArticleDetails.getChargeWeight());
			reportModel.setWayBillActualWeight(dispatchArticleDetails.getDispatchedWeight());
			reportModel.setWayBillGrandTotal(dispatchArticleDetails.getBookingTotal());

			if(dispatchArticleDetails.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID && dispatchArticleDetails.isAmountShow())
				reportModel.setPaidAmount(dispatchArticleDetails.getBookingTotal());
			else if(dispatchArticleDetails.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY && dispatchArticleDetails.isAmountShow())
				reportModel.setTopayAmount(dispatchArticleDetails.getBookingTotal());
			else if(dispatchArticleDetails.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT && dispatchArticleDetails.isAmountShow())
				reportModel.setTbbAmount(dispatchArticleDetails.getBookingTotal());
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}

		return reportModel;
	}

	private void setLHPVAmount(final LHPVModel lhpvModel, final HashMap<Long, Double> lhpvchargesColl) {
		lhpvModel.setTotalAmount(lhpvchargesColl.getOrDefault((long) LhpvChargeTypeMaster.LORRY_HIRE, 0.0));
		lhpvModel.setOtherAdditionalCharge(lhpvchargesColl.getOrDefault((long) LhpvChargeTypeMaster.OTHER_ADDITIONAL, 0.0));
		lhpvModel.setAdvanceAmount(lhpvchargesColl.getOrDefault((long) LhpvChargeTypeMaster.ADVANCE_AMOUNT, 0.0));
		lhpvModel.setDirectDeliveryAmount(lhpvchargesColl.getOrDefault((long) LhpvChargeTypeMaster.DIRECT_DELIVERY_AMOUNT, 0.0));
		lhpvModel.setBalanceAmount(lhpvchargesColl.getOrDefault((long) LhpvChargeTypeMaster.BALANCE_AMOUNT, 0.0));
		lhpvModel.setRefund(lhpvchargesColl.getOrDefault((long) LhpvChargeTypeMaster.REFUND_AMOUNT, 0.0));
		lhpvModel.setDriverCollection(lhpvchargesColl.getOrDefault((long) LhpvChargeTypeMaster.DRIVER_COLLECTION, 0.0));
		lhpvModel.setAdditionalTruckAdvance(lhpvchargesColl.getOrDefault((long) LhpvChargeTypeMaster.ADDITIONAL_TRUCK_ADVANCE, 0.0));
		lhpvModel.setOverLoading(lhpvchargesColl.getOrDefault((long) LHPVChargeTypeConstant.OVER_WEIGHT, 0.0));
		lhpvModel.setAdvCheque(lhpvchargesColl.getOrDefault((long) LHPVChargeTypeConstant.CHEQUE, 0.0));
		lhpvModel.setAdvDiesel(lhpvchargesColl.getOrDefault((long) LHPVChargeTypeConstant.DIESEL, 0.0));
		lhpvModel.setAdvCash(lhpvchargesColl.getOrDefault((long) LHPVChargeTypeConstant.CASH, 0.0));
		lhpvModel.setHeightcharge(lhpvchargesColl.getOrDefault((long) LHPVChargeTypeConstant.HEIGHT_CHARGE, 0.0));
		lhpvModel.setHamalicharge(lhpvchargesColl.getOrDefault((long) LHPVChargeTypeConstant.CREDIT_HAMALI, 0.0));
		lhpvModel.setLoadingCharge(lhpvchargesColl.getOrDefault((long) LHPVChargeTypeConstant.LOADING, 0.0));
		lhpvModel.setHaltingCharge(lhpvchargesColl.getOrDefault((long) LHPVChargeTypeConstant.HALTING, 0.0));
		lhpvModel.setTdsAmount(lhpvchargesColl.getOrDefault((long) LhpvChargeTypeMaster.TDS, 0.0));
		lhpvModel.setUnloading(lhpvchargesColl.getOrDefault((long) LhpvChargeTypeMaster.UNLOADING, 0.0));
		lhpvModel.setExtraLorryHire(lhpvchargesColl.getOrDefault((long) LhpvChargeTypeMaster.EXT_LHC, 0.0));
		lhpvModel.setMamoolCharge(lhpvchargesColl.getOrDefault((long) LhpvChargeTypeMaster.MAMOOL, 0.0));
		lhpvModel.setAdditionalWeightChrg(lhpvchargesColl.getOrDefault((long) LHPVChargeTypeConstant.ADDITIONAL_WT_CHRGS, 0.0));
		lhpvModel.setTollChargeAmount(lhpvchargesColl.getOrDefault((long) LHPVChargeTypeConstant.TOLL, 0.0));
		lhpvModel.setFuelChargeAmount(lhpvchargesColl.getOrDefault((long) LHPVChargeTypeConstant.FUEL_CHARGE, 0.0));
		lhpvModel.setOverLoadCharge(lhpvchargesColl.getOrDefault((long) LHPVChargeTypeConstant.OVERLOAD_CHARGE, 0.0));
		lhpvModel.setLabourCharge(lhpvchargesColl.getOrDefault((long) LHPVChargeTypeConstant.LABOUR, 0.0));
		lhpvModel.setMultiplePointCharge(lhpvchargesColl.getOrDefault((long) LHPVChargeTypeConstant.MULTIPLE_POINT, 0.0));
		lhpvModel.setTotalLorryHire(lhpvchargesColl.getOrDefault((long) LHPVChargeTypeConstant.TOTAL_LORRY_HIRE, 0.0));
		lhpvModel.setTotalLorryHireCharge(lhpvchargesColl.getOrDefault((long) LHPVChargeTypeConstant.TOTAL_LORRY_HIRE, 0.0));
		lhpvModel.setExtraCharge(lhpvchargesColl.getOrDefault((long) LHPVChargeTypeConstant.EXTRA_CHARGE, 0.0));
		lhpvModel.setAdditionalAdvance(lhpvchargesColl.getOrDefault((long) LHPVChargeTypeConstant.ADDITIONAL_ADVANCE,0.0));
	}

	private Map<Long, DispatchLRSummary> getDispatchSummaryDetails(final HttpServletRequest request, final String strDispLdgrIds, final String strWBIds) throws Exception {
		try {
			final var resultList = DispatchArticleDetailsDao.getInstance().getQuantityByArticleDetails(strDispLdgrIds, strWBIds);

			final Map<Long, DispatchLRSummary>			dispatchSummaryDetailsHM	= new HashMap<>();

			for(final DispatchArticleDetails articleDetails : resultList) {
				var dispatchLRSummary	= dispatchSummaryDetailsHM.get(articleDetails.getWayBillId());

				if(dispatchLRSummary == null) {
					dispatchLRSummary	= createDTOForReportModel(request, articleDetails);

					dispatchSummaryDetailsHM.put(articleDetails.getWayBillId(), dispatchLRSummary);
				} else {
					dispatchLRSummary.setWayBillCount(dispatchLRSummary.getWayBillCount() + 1);
					dispatchLRSummary.setQuantity(dispatchLRSummary.getQuantity() + articleDetails.getQuantity());
				}
			}

			return dispatchSummaryDetailsHM;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private void calculationOfCrossingSummary(final HttpServletRequest request, final Map<Long, Double> lhpvChargesColl, final List<DispatchLedgerModel> dispatchModelArrlist) {
		var			crossingKatAmount					= 0.0;
		var			kantaRate							= 0.0;

		try {
			final var	totalActualWeightOfAgentBranchLR	= (double) request.getAttribute("totalActualWeightOfAgentBranchLR");
			final var	totalAmountOfAgentBranchLR			= (double) request.getAttribute("totalAmountOfAgentBranchLR");

			if(lhpvChargesColl != null) {
				kantaRate				= lhpvChargesColl.getOrDefault((long) LHPVChargeTypeConstant.KANTA_RATE, 0.0);
				crossingKatAmount		= totalActualWeightOfAgentBranchLR * kantaRate;
			}

			final var	crossingPfAmount	= totalAmountOfAgentBranchLR - crossingKatAmount;

			final var	totalLSAmount		= dispatchModelArrlist.stream().map(e -> e.getTotalPaidAmount() + e.getTotalToPayAmount() + e.getTotalTBBAmount()).collect(Collectors.summingDouble(i -> i));

			request.setAttribute("kantaRate", kantaRate);
			request.setAttribute("crossingKatAmount", crossingKatAmount);
			request.setAttribute("crossingPfAmount", crossingPfAmount);
			request.setAttribute("actualAmount", totalLSAmount - crossingPfAmount);
		} catch (final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
		}
	}
}