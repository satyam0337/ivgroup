package com.ivcargo.actions.transport;

import java.util.ArrayList;

//~--- non-JDK imports --------------------------------------------------------

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringUtils;

import com.businesslogic.CreateBLHPVBLL;
import com.businesslogic.DispatchBLL;
import com.businesslogic.LHPVBLL;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.cache.PojoFilter;
import com.iv.constant.properties.BLhpvPrintConfigurationConstant;
import com.iv.constant.properties.LhpvAdvanceSettlementPropertiesConstant;
import com.iv.dto.constant.FeildPermissionsConstant;
import com.iv.dto.constant.IncomeExpenseChargeTypeConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.dto.constant.TransCargoAccountGroupConstant;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.constant.AccountGroupConstant;
import com.iv.utils.constant.DateTimeFormatConstant;
import com.iv.utils.constant.properties.ReceiveConfigurationPropertiesConstant;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.reports.ReportView;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.BLHPVDao;
import com.platform.dao.DriverMasterDao;
import com.platform.dao.ExpenseSettlementDao;
import com.platform.dao.IncomeExpenseChargeDao;
import com.platform.dao.LHPVDao;
import com.platform.dao.LhpvChargesForGroupDao;
import com.platform.dao.LhpvSettlementChargesDao;
import com.platform.dao.VehicleAgentMasterDao;
import com.platform.dto.BLHPV;
import com.platform.dto.CustomGroupMapper;
import com.platform.dto.DeliveryRunSheetLedger;
import com.platform.dto.DispatchLedger;
import com.platform.dto.DriverMaster;
import com.platform.dto.IncomeExpenseChargeMaster;
import com.platform.dto.LHPV;
import com.platform.dto.LhpvChargeTypeMaster;
import com.platform.dto.LhpvChargesForGroup;
import com.platform.dto.VehicleNumberMaster;
import com.platform.dto.constant.LHPVChargeTypeConstant;
import com.platform.dto.constant.PaymentTypeConstant;
import com.platform.dto.model.BLHPVCreditAmountTxn;
import com.platform.dto.model.BLHPVModel;
import com.platform.dto.model.ReportViewModel;
import com.platform.dto.model.WayBillViewModel;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;


public class BLHPVPrintAction implements Action {

	@Override
	@SuppressWarnings({ "unchecked" })
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {

		HashMap<String, Object>	 		error 						= null;
		VehicleNumberMaster 			vehicle						= null;
		DriverMaster 					driver 						= null;
		var							dispatchLedgerIds 			= "";
		WayBillViewModel[]         		wayBillModelsArr           	= null;
		LhpvChargesForGroup[]			lhpvChargesForGroup			= null;
		HashMap<Long, Double> 			chargesColl 				= null;
		HashMap<Long, Double> 			lhpvchargesColl 			= null;
		ReportViewModel					reportViewModel				= null;
		short 							expenseChrgMasterId			= 0;
		ValueObject						lhpvDieselDetailsValueObj	= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request, error))
				return;

			final var	cache			= new CacheManip(request);
			final var	valueInObject 	= new ValueObject();

			final var	executive 		= cache.getExecutive(request);
			var	valueObject 	= new ValueObject();
			valueObject.put("executive", executive);
			valueObject 	= LHPVBLL.getInstance().getallLHPVChargesWithSequence(valueObject);

			request.setAttribute("lhpvChargesHshmp", valueObject.get("lhpvChargesHshmp"));

			final var	configuration			= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.BLHPV_PRINT);
			final var	lhpvConfiguration		= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.LHPV_TRUCK_ADVANCE);
			final var	receiveConfig			= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.RECEIVE);

			final Map<?, ?>	executiveFieldPermissions 		   = cache.getExecutiveFieldPermission(request);
			final var isAllowToSearchAllBranchBLHPV			   = executiveFieldPermissions.get(FeildPermissionsConstant.ALLOW_TO_SEARCH_ALL_BRANCH_BLHPV) != null;
			final var hideAmountColumnsForBalancePayableBranch = (boolean) configuration.getOrDefault(BLhpvPrintConfigurationConstant.HIDE_AMOUNT_COLUMNS_FOR_BALANCE_PAYABLE_BRANCH, false);
			final var	showAutomaticBlhpvCreationBranchOnSearch	= (boolean) receiveConfig.getOrDefault(ReceiveConfigurationPropertiesConstant.SHOW_AUTOMATIC_BLHPV_CREATION_BRANCH_ON_SEARCH, false);

			request.setAttribute("showCityNameWithBranchInPrint", (boolean) configuration.getOrDefault(BLhpvPrintConfigurationConstant.SHOW_CITY_NAME_WITH_BRANCH_IN_PRINT, false));
			request.setAttribute("showGroupHeaderInPrint", (boolean) configuration.getOrDefault(BLhpvPrintConfigurationConstant.SHOW_GROUP_HEADER_IN_PRINT, false));
			request.setAttribute(BLhpvPrintConfigurationConstant.SHOW_COMPANY_LOGO, (boolean) configuration.getOrDefault(BLhpvPrintConfigurationConstant.SHOW_COMPANY_LOGO, false));
			request.setAttribute(BLhpvPrintConfigurationConstant.SHOW_COMPANY_WATER_MARK_LOGO, (boolean) configuration.getOrDefault(BLhpvPrintConfigurationConstant.SHOW_COMPANY_WATER_MARK_LOGO, false));

			valueInObject.put("blhpvId", JSPUtility.GetLong(request, "blhpvId", 0));
			valueInObject.put("filter", (short)0);

			final var	valueOutObject = CreateBLHPVBLL.getInstance().getBLHPVData(valueInObject);

			if(valueOutObject != null) {
				final var	blhpv			= (BLHPV)valueOutObject.get("blhpv");
				final var	branch 			= cache.getGenericBranchDetailCache(request, blhpv.getBranchId());
				final var	lhpvfromBranch 	= cache.getGenericBranchDetailCache(request, blhpv.getLhpvbranchId());
				final var	lhpvtoBranch 	= cache.getGenericBranchDetailCache(request, blhpv.getDestinationbranchId());
				final var	accountGroup 	= cache.getAccountGroupById(request, executive.getAccountGroupId());

				blhpv.setLhpvbranchName(lhpvfromBranch != null ? lhpvfromBranch.getName() : "");
				blhpv.setDestinationbranchName(lhpvtoBranch != null ? lhpvtoBranch.getName() : "");

				blhpv.setExecutiveName(Utility.checkedNullCondition(blhpv.getExecutiveName(), (short) 1) );
				blhpv.setBlhpvPreparedBy(Utility.checkedNullCondition(blhpv.getExecutiveName(), (short) 1) );

				if(blhpv.getVehicleNumberMasterId() > 0)
					vehicle = cache.getVehicleNumber(request, executive.getAccountGroupId(), blhpv.getVehicleNumberMasterId());

				if(vehicle != null) {
					blhpv.setVehicleNumber(vehicle.getVehicleNumber());
					blhpv.setVehiclePANno(vehicle.getPanNumber() != null ? vehicle.getPanNumber() : "");
					blhpv.setVehicleForm15HSubmitted(vehicle.isForm15HSubmitted());
				} else {
					blhpv.setVehicleNumber("");
					blhpv.setVehiclePANno("");
				}

				if(showAutomaticBlhpvCreationBranchOnSearch) {
					final var blhpvBranch 				= cache.getGenericBranchDetailCache(request, blhpv.getbLHPVBranchId());

					if (blhpvBranch != null)
						blhpv.setDoneByBranchName(blhpvBranch.getName());

					if (branch != null)
						blhpv.setDoneByBranchAddress(branch.getAddress());
				} else if (branch != null) {
					blhpv.setDoneByBranchName(branch.getName());
					blhpv.setDoneByBranchAddress(branch.getAddress());
				}

				blhpv.setDoneByGroupName(accountGroup.getDescription());

				final var	blhpvBranch = cache.getGenericBranchDetailCache(request, blhpv.getbLHPVBranchId());
				blhpv.setbLHPVBranchName(blhpvBranch.getName());

				if(blhpv.getDebitToBranchId() > 0) {
					final var	creditDebitBranch = cache.getGenericBranchDetailCache(request, blhpv.getDebitToBranchId());
					blhpv.setDebitToBranch(Utility.checkedNullCondition(creditDebitBranch.getName(), (short)1));
				}

				//Vehicle Agent
				if(blhpv.getVehicleAgentMasterId() > 0)
					blhpv.setOwnerName(VehicleAgentMasterDao.getInstance().getSingleVehicleAgentDetails(blhpv.getVehicleAgentMasterId()).getName());
				else
					blhpv.setOwnerName(accountGroup.getDescription());

				//Driver 1
				if(blhpv.getDriverMasterId() > 0) {
					driver = DriverMasterDao.getInstance().getDriverDataById(blhpv.getDriverMasterId(), executive.getAccountGroupId());

					blhpv.setDriverName(driver.getName());
					blhpv.setDriverLicenceNo(driver.getLicenceNumber());
				} else
					blhpv.setDriverName("");

				// Get Driver1 mobile Number from BHPV
				if(blhpv.getDriver1MobileNumber2() != null && blhpv.getDriver1MobileNumber2().length() > 0 )
					//Get single string of the two mobile Numbers
					blhpv.setDriver1MobileNumber1(blhpv.getDriver1MobileNumber1() + (blhpv.getDriver1MobileNumber2() != null ? ", " + blhpv.getDriver1MobileNumber2():""));

				//Driver 2
				if(blhpv.getDriver2MasterId() > 0) {
					driver = DriverMasterDao.getInstance().getDriverDataById(blhpv.getDriver2MasterId(), executive.getAccountGroupId());

					blhpv.setDriver2Name(driver.getName());
					blhpv.setDriver2LicenceNo(driver.getLicenceNumber());
				} else
					blhpv.setDriver2Name("");

				blhpv.setPaymentMadeTo(Utility.checkedNullCondition(blhpv.getPaymentMadeTo(), (short) 1));
				blhpv.setVehiclePANno(Utility.checkedNullCondition(blhpv.getVehiclePANno(), (short) 1));
				blhpv.setDriver1MobileNumber1(Utility.checkedNullCondition(blhpv.getDriver1MobileNumber1(), (short) 2));
				blhpv.setBankName(Utility.checkedNullCondition(blhpv.getBankName(), (short) 2));
				blhpv.setChequeNumber(Utility.checkedNullCondition(blhpv.getChequeNumber(), (short) 2));
				blhpv.setPaymentModeStr(PaymentTypeConstant.getPaymentType(blhpv.getPaymentMode()));
				blhpv.setCreationDateTimeString(DateTimeUtility.getDateFromTimeStamp(blhpv.getCreationDateTimeStamp()));
				blhpv.setCurrentTime(DateTimeUtility.getDateFromTimeStamp(DateTimeUtility.getCurrentTimeStamp(), DateTimeFormatConstant.HH_MM_AA));
				blhpv.setCurrentDate(DateTimeUtility.getDateFromTimeStamp(DateTimeUtility.getCurrentTimeStamp(), DateTimeFormatConstant.DD_MM_YY));

				//Get Other Details
				valueInObject.put("lhpvId", blhpv.getLhpvId());
				valueInObject.put("executive", executive);

				final var	incomeExpenseMappingIds			= (String) lhpvConfiguration.getOrDefault(LhpvAdvanceSettlementPropertiesConstant.INCOME_EXPENSE_MAPPING_IDS, "");

				if(!StringUtils.isEmpty(incomeExpenseMappingIds)) {
					final List<IncomeExpenseChargeMaster>	incomeExpenseChargeMasterList 	= IncomeExpenseChargeDao.getInstance().getIncomeExpenseChargeMasterByMappingIds(executive.getAccountGroupId(), incomeExpenseMappingIds, IncomeExpenseChargeTypeConstant.CHARGE_TYPE_OFFICE);

					if(incomeExpenseChargeMasterList != null && incomeExpenseChargeMasterList.size() == 1)
						expenseChrgMasterId	= incomeExpenseChargeMasterList.get(0).getChargeId();
				}

				request.setAttribute("expenseSettelmentsDetails", ExpenseSettlementDao.getInstance().getExpenseSettlementById(blhpv.getLhpvId(), expenseChrgMasterId, (short) 1));

				//26629
				var	creditDetails = BLHPVDao.getInstance().getBLHPVCreditDetailsByBLHPVId(JSPUtility.GetLong(request, "blhpvId", 0));

				if(creditDetails != null && !creditDetails.isEmpty()) {
					creditDetails	= (ArrayList<BLHPVCreditAmountTxn>) PojoFilter.filterList(creditDetails, e -> e.getStatus() != BLHPVCreditAmountTxn.STATUS_PAYMENT_CANCELLED);

					for(final BLHPVCreditAmountTxn reportModel : creditDetails) {
						final var	branches			= cache.getGenericBranchDetailCache(request, reportModel.getReceivedByBranchId());

						reportModel.setReceivedByBranchName(branches != null ? branches.getName() : "--");
						reportModel.setPaymentTypeStr(PaymentTypeConstant.getPaymentType(reportModel.getPaymentType()));
					}
				}

				request.setAttribute("creditDetails", creditDetails);

				final var	outValObj = CreateBLHPVBLL.getInstance().getDataForBLHPVPrint(valueInObject);

				if(outValObj != null) {
					final var	lsDetails 					= (HashMap<Long, DispatchLedger>) outValObj.get("DispatchLedgerDetails");
					final var	lhpvDetails 				= (LHPV) outValObj.get("LHPVDetails");
					final var	delRunSheetledgerDetails	= (HashMap<Long, DeliveryRunSheetLedger>) outValObj.get("DelRunSheetledgerDetails");

					if(lhpvDetails != null) {
						blhpv.setlHPVDate(lhpvDetails.getCreationDateTimeStamp());
						blhpv.setTotalPkgsInLhpv(lhpvDetails.getTotalPkgsInLhpv());
						blhpv.setlHPVNumber(lhpvDetails.getlHPVNumber());
					}

					final var	lhpvchargesCollVal = LhpvSettlementChargesDao.getInstance().getSetlementChargesByBlhpvId(blhpv.getLhpvId() , LhpvChargesForGroup.IDENTIFIER_TYPE_LHPV);

					/*
					 * Added By Anant 20-04-2016
					 *
					 * Get LHPV Charges from new Database table on BLHPV Print Screen
					 */
					if(lhpvchargesCollVal != null) {
						lhpvchargesColl = (HashMap<Long, Double>) lhpvchargesCollVal.get("chargesColl");

						if(lhpvchargesColl != null) {
							blhpv.setTotalAmount(lhpvchargesColl.getOrDefault((long) LhpvChargeTypeMaster.LORRY_HIRE, 0d));
							blhpv.setAdvancePaid(lhpvchargesColl.getOrDefault((long) LhpvChargeTypeMaster.ADVANCE_AMOUNT, 0d));
							blhpv.setBalanceAmount(lhpvchargesColl.getOrDefault((long) LhpvChargeTypeMaster.BALANCE_AMOUNT, 0d));
						} else {
							blhpv.setTotalAmount(0);
							blhpv.setAdvancePaid(0);
							blhpv.setBalanceAmount(0);
						}
					} else {
						blhpv.setTotalAmount(0);
						blhpv.setAdvancePaid(0);
						blhpv.setBalanceAmount(0);
					}
					/*
					 * End
					 */
					//
					if(blhpv.getbLHPVId() > 0) {
						final var	dieselDetailsValueObj = BLHPVDao.getInstance().getBLHPVDieselDetails(blhpv.getbLHPVId());

						if(dieselDetailsValueObj != null)
							request.setAttribute("dieselDetailsList", dieselDetailsValueObj.get("dieselDetailsList"));
					}

					if(blhpv.getLhpvId() > 0)
						lhpvDieselDetailsValueObj = LHPVDao.getInstance().getLHPVDieselDetails(blhpv.getLhpvId());

					if(lhpvDieselDetailsValueObj != null)
						request.setAttribute("lhpvDieselDetailsList", lhpvDieselDetailsValueObj.get("dieselDetailsList"));

					final var	chargesCollVal = LhpvSettlementChargesDao.getInstance().getSetlementChargesByBlhpvId(blhpv.getbLHPVId() , LhpvChargesForGroup.IDENTIFIER_TYPE_BLHPV);

					if(chargesCollVal != null) {
						chargesColl = (HashMap<Long, Double>) chargesCollVal.get("chargesColl");

						if(chargesColl != null) {
							blhpv.setPolicePenalty(chargesColl.getOrDefault(Long.parseLong(LhpvChargeTypeMaster.POLICE_CHALLANS + ""), 0.0));
							blhpv.setOverRun(chargesColl.getOrDefault(Long.parseLong(LhpvChargeTypeMaster.OVER_RUN + ""), 0.0));
							blhpv.setDeliveryCancellation(chargesColl.getOrDefault(Long.parseLong(LhpvChargeTypeMaster.DELIVERY_CANCELLATION + ""), 0.0));
							blhpv.setOther(chargesColl.getOrDefault(Long.parseLong(LhpvChargeTypeMaster.OTHER_NEGATIVE + ""), 0.0));
							blhpv.setBalanceAmount(chargesColl.getOrDefault(Long.parseLong(LhpvChargeTypeMaster.BALANCE_AMOUNT + ""), blhpv.getBalanceAmount()));
							blhpv.setDetention(chargesColl.getOrDefault(Long.parseLong(LhpvChargeTypeMaster.DETENTION + ""), 0.0));
							blhpv.setCreditHamali(chargesColl.getOrDefault(Long.parseLong(LhpvChargeTypeMaster.CREDIT_HAMALI + ""), 0.0));
							blhpv.setClaim(chargesColl.getOrDefault(Long.parseLong(LhpvChargeTypeMaster.CLAIM + ""), 0.0));
							blhpv.setWarai(chargesColl.getOrDefault(Long.parseLong(LhpvChargeTypeMaster.WARAI + ""), 0.0));
							blhpv.setCollection(chargesColl.getOrDefault(Long.parseLong(LhpvChargeTypeMaster.COLLECTION + ""), 0.0));
							blhpv.setTds(chargesColl.getOrDefault(Long.parseLong(LhpvChargeTypeMaster.TDS + ""), 0.0));
							blhpv.setDeliveryCharge(chargesColl.getOrDefault(Long.parseLong(LhpvChargeTypeMaster.DELIVERY_CHARGE + ""), 0.0));
							blhpv.setOtherCharge(chargesColl.getOrDefault(Long.parseLong(LhpvChargeTypeMaster.OTHER_ADDITIONAL + ""), 0.0));
							blhpv.setPenaltyCharge(chargesColl.getOrDefault(Long.parseLong(LhpvChargeTypeMaster.PENALTY + ""), 0.0));
							blhpv.setOverWeight(chargesColl.getOrDefault(Long.parseLong(LHPVChargeTypeConstant.OVER_WEIGHT + ""), 0.0));
							blhpv.setLoadingCharges(chargesColl.getOrDefault(Long.parseLong(LHPVChargeTypeConstant.LOADING + ""), 0.0));
							blhpv.setDoorCollection(chargesColl.getOrDefault(Long.parseLong(LHPVChargeTypeConstant.DOOR_COLLECTION + ""), 0.0));
							blhpv.setDoorDelivery(chargesColl.getOrDefault(Long.parseLong(LHPVChargeTypeConstant.DOOR_DELIVERY + ""), 0.0));
							blhpv.setActualBalanceAmount(chargesColl.getOrDefault(Long.parseLong(LHPVChargeTypeConstant.ACTUAL_BALANCE + ""), 0.0));
							blhpv.setDeductHamali(chargesColl.getOrDefault(Long.parseLong(LHPVChargeTypeConstant.HAMALI_DEDUCT + ""), 0.0));
							blhpv.setTollTax(chargesColl.getOrDefault(Long.parseLong(LHPVChargeTypeConstant.TOLL_TAX + ""), 0.0));
							blhpv.setNashta(chargesColl.getOrDefault(Long.parseLong(LHPVChargeTypeConstant.NASHTA + ""), 0.0));
							blhpv.setPuncher(chargesColl.getOrDefault(Long.parseLong(LHPVChargeTypeConstant.PUNCHER + ""), 0.0));
							blhpv.setFuelByDriver(chargesColl.getOrDefault(Long.parseLong(LHPVChargeTypeConstant.FUEL_BY_DRIVER + ""), 0.0));
							blhpv.setFuelByOffice(chargesColl.getOrDefault(Long.parseLong(LHPVChargeTypeConstant.FUEL_BY_OFFICE + ""), 0.0));
							blhpv.setOnlineCollection(chargesColl.getOrDefault(Long.parseLong(LHPVChargeTypeConstant.ONLINE_COLLECTION + ""), 0.0));
							blhpv.setOverLoadCharge(chargesColl.getOrDefault(Long.parseLong(LHPVChargeTypeConstant.OVER_LOAD + ""), 0.0));
							blhpv.setUnloadingCharge(chargesColl.getOrDefault(Long.parseLong(LHPVChargeTypeConstant.UNLOADING + ""), 0.0));
						}
					}

					final var	valueOutObjectForCharges = LhpvChargesForGroupDao.getInstance().getallLHPVChargeByAccGrpId(executive.getAccountGroupId(), (short) 0);

					if(valueOutObjectForCharges != null)
						lhpvChargesForGroup = (LhpvChargesForGroup[]) valueOutObjectForCharges.get("modelArr");

					if(lsDetails != null)
						for(final Map.Entry<Long, DispatchLedger> entry : lsDetails.entrySet()) {
							final var	dispatchLedger = entry.getValue();
							final var	sourceBranch = cache.getGenericBranchDetailCache(request, dispatchLedger.getSourceBranchId());
							final var	destBranch	 = cache.getGenericBranchDetailCache(request, dispatchLedger.getDestinationBranchId());
							dispatchLedger.setSourceCityName(cache.getCityById(request, sourceBranch.getCityId()).getName());
							dispatchLedger.setDestinationCityName(cache.getCityById(request, destBranch.getCityId()).getName());
							dispatchLedger.setSourceBranch(cache.getGenericBranchDetailCache(request, dispatchLedger.getSourceBranchId()).getName());

							if(dispatchLedger.getDestinationBranchId() > 0)
								dispatchLedger.setDestinationBranch(cache.getGenericBranchDetailCache(request,dispatchLedger.getDestinationBranchId()).getName());

							dispatchLedger.setSourceSubRegion(cache.getGenericSubRegionById(request, sourceBranch.getSubRegionId() ).getName());
							dispatchLedger.setDestinationSubRegion(cache.getGenericSubRegionById(request, destBranch.getSubRegionId() ).getName());
							dispatchLedgerIds += dispatchLedger.getDispatchLedgerId() + ",";
						}

					if(delRunSheetledgerDetails != null)
						for(final Map.Entry<Long, DeliveryRunSheetLedger> entry : delRunSheetledgerDetails.entrySet()) {
							final var	deliveryRunSheetLedger = entry.getValue();
							final var	sourceBranch = cache.getGenericBranchDetailCache(request, deliveryRunSheetLedger.getSourceBranchId());
							final var	destBranch	 = cache.getGenericBranchDetailCache(request, deliveryRunSheetLedger.getDestinationBranchId());
							deliveryRunSheetLedger.setSourceCityName(cache.getCityById(request, sourceBranch.getCityId()).getName());
							deliveryRunSheetLedger.setDestinationCityName(cache.getCityById(request, destBranch.getCityId()).getName());
							deliveryRunSheetLedger.setSourceBranch(cache.getGenericBranchDetailCache(request, deliveryRunSheetLedger.getSourceBranchId()).getName());

							if(deliveryRunSheetLedger.getDestinationBranchId() > 0)
								deliveryRunSheetLedger.setDestinationBranch(cache.getGenericBranchDetailCache(request,deliveryRunSheetLedger.getDestinationBranchId()).getName());
							else
								deliveryRunSheetLedger.setDestinationBranch(deliveryRunSheetLedger.getTruckDestination() !=null ? deliveryRunSheetLedger.getTruckDestination() :"--" );
						}

					if(executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_KTCO || executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_JAGRUTI_TRANSPORTS) {
						valueInObject.put("branchesColl", cache.getGenericBranchesDetail(request));
						valueInObject.put("dispatchLedgerIds", StringUtils.substring(dispatchLedgerIds, 0, dispatchLedgerIds.length() - 1));

						final var	dispatchBll 	= new DispatchBLL();

						final var	outValObjForLRDet = dispatchBll.getTransportPrintOutboundManifestByDispatchLedgerIds(valueInObject);

						if(outValObjForLRDet != null)
							wayBillModelsArr = (WayBillViewModel[]) outValObjForLRDet.get("wayBillModelsArr");
					}

					final var	ftlLRModel	= (HashMap<Long, BLHPVModel>) outValObj.get("ftlLRModel");

					if(ftlLRModel != null)
						for(final Map.Entry<Long, BLHPVModel> entry : ftlLRModel.entrySet()) {
							final var	model = entry.getValue();

							if(model.getDeliveryBranchId() > 0)
								model.setDeliveryBranchName(cache.getBranchById(request, executive.getAccountGroupId(), model.getDeliveryBranchId()).getName());
							else
								model.setDeliveryBranchName("");
						}

					request.setAttribute("lsDetails", lsDetails);
					request.setAttribute("delRunSheetledgerDetails", delRunSheetledgerDetails);
					request.setAttribute("lhpvChargesForGroup", lhpvChargesForGroup);
					request.setAttribute("wayBillModelsArr", wayBillModelsArr);
					request.setAttribute("chargesColl", chargesColl);
					request.setAttribute("lhpvchargesColl", lhpvchargesColl);
					request.setAttribute("ftlLRModel", ftlLRModel);
					request.setAttribute("totalShortPkgsInTUR", outValObj.get("totalShortPkgsInTUR"));
					request.setAttribute("totalDamagePkgsInTUR", outValObj.get("totalDamagePkgsInTUR"));
				}

				request.setAttribute("blhpv", blhpv);

				if(executiveFieldPermissions.get(FeildPermissionsConstant.HIDE_AMOUNT_COLUMNS_FOR_BALANCE_PAYABLE_BRANCH) != null)
					request.setAttribute("isAllowToShowAmountColumns", false);
				else
					request.setAttribute("isAllowToShowAmountColumns", !hideAmountColumnsForBalancePayableBranch || isAllowToSearchAllBranchBLHPV || blhpv.getbLHPVBranchId() <= 0 || blhpv.getbLHPVBranchId() != executive.getBranchId()
					|| blhpv.getbLHPVBranchId() == blhpv.getlHPVBranchId());

				ActionStaticUtil.setRequestAttribute(request,"customAddressBranchId", blhpv.getBranchId());
				ActionStaticUtil.setRequestAttribute(request,"customAddressIdentifer", CustomGroupMapper.IDENTIFIER_BOOKING);

				reportViewModel = new ReportViewModel();
				reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);
				request.setAttribute("ReportViewModel",reportViewModel);

			} else {
				error.put("errorCode", CargoErrorList.NO_RECORDS);
				error.put("errorDescription", CargoErrorList.NO_RECORDS_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}

			if((boolean) configuration.getOrDefault(BLhpvPrintConfigurationConstant.IS_DEFAULT_BLHPV_PRINT, false))
				request.setAttribute("nextPageToken", "success");
			else if(groupListForDLSPrint().contains(executive.getAccountGroupId()))
				request.setAttribute("nextPageToken", "success_231");
			else
				request.setAttribute("nextPageToken", "success_" + executive.getAccountGroupId());
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}
	}

	private List<Long> groupListForDLSPrint() {
		final List<Long> groupList	= new ArrayList<>();

		groupList.add((long) TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_JTM);
		groupList.add((long) TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_ABBAS);
		groupList.add((long) TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_KRL);
		groupList.add((long) TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_MAHALAXMI);
		groupList.add((long) TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_DSL);
		groupList.add((long) TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_JAYPEE);
		groupList.add((long) TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_BHASKAR);
		groupList.add((long) TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_SSAI);
		groupList.add((long) TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_KERALA);
		groupList.add((long) TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_KCM);
		groupList.add((long) TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_AMR);
		groupList.add((long) TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_AR);
		groupList.add((long) TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_3XCARGO);
		groupList.add((long) TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_ARC);
		groupList.add((long) TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_SKL);
		groupList.add((long) TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_SAMARTH);
		groupList.add((long) TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_SCM);
		groupList.add((long) TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_SWAGATH);
		groupList.add((long) TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_SDT);
		groupList.add((long) TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_SSTS);
		groupList.add((long) TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_PRABHAT);
		groupList.add((long) TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_DASHMESH);
		groupList.add((long) TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_KPS);
		groupList.add((long) TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_DRT);
		groupList.add((long) TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_PRC);
		groupList.add((long) TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_UNIQUE);
		groupList.add((long) TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_SVR);
		groupList.add((long) TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_SMTC);

		return groupList;
	}
}