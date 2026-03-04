package com.ivcargo.reports;

//~--- non-JDK imports --------------------------------------------------------

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.ObjectUtils;
import org.apache.commons.lang3.StringUtils;

import com.businesslogic.GenerateTurReportBLL;
import com.businesslogic.properties.impl.PropertyConfigValueBLLImpl;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.dto.LhpvChargesForGroup;
import com.iv.dto.constant.BookingModeConstant;
import com.iv.dto.constant.ExecutiveTypeConstant;
import com.iv.dto.constant.FeildPermissionsConstant;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.utility.CollectionUtility;
import com.iv.utils.utility.SortUtils;
import com.iv.utils.utility.SplitLRNumber;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.DispatchLedgerDao;
import com.platform.dao.LhpvSettlementChargesDao;
import com.platform.dao.TURRegisterDao;
import com.platform.dto.CustomGroupMapper;
import com.platform.dto.DispatchLedger;
import com.platform.dto.LhpvChargeTypeMaster;
import com.platform.dto.PropertiesFileConstants;
import com.platform.dto.TURRegisterReport;
import com.platform.dto.TURRegisterReportModel;
import com.platform.dto.TransportCommonMaster;
import com.platform.dto.configuration.report.TurReportConfigurationDTO;
import com.platform.dto.constant.LHPVChargeTypeConstant;
import com.platform.dto.constant.ReportWiseDisplayZeroAmountConstant;
import com.platform.dto.constant.WayBillTypeConstant;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

public class TURRegisterReportAction implements Action {

	@Override
	@SuppressWarnings("unchecked")
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	 				error 								= null;
		String 						    		dispatchLedgerIds 					= null;
		HashMap<Long,DispatchLedger>			dispatchLedgerHM     				= null;
		HashMap<Long,TURRegisterReportModel> 	bkGChargeCollection					= null;
		String 									lhpvIds 							= null;
		HashMap<Long, HashMap<Long, Double>>   	chargesCollMainHshmp 				= null;
		var 									subRegionId    						= 0L;
		var 									branchId							= 0L;
		var										lorryHire 							= 0.00;
		final var								showTruckAnalyzingDetails			= false;
		String									branchIds							= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeTURRegisterReportAction().execute(request, response);

			final var	sdf			= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			final var	fromDate	= new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00").getTime());
			final var	toDate		= new Timestamp(sdf.parse(JSPUtility.GetString(request, "toDate") + " 23:59:59").getTime());
			final var	cManip 		= new CacheManip(request);
			final var	executive	= cManip.getExecutive(request);
			final var	execFldPermissionsHM = cManip.getExecutiveFieldPermission(request);
			final var	accountGroupId = executive.getAccountGroupId();
			final var	valueObjectIn					= new ValueObject();
			valueObjectIn.put("executive", executive);
			valueObjectIn.put("execFldPermissionsHM", execFldPermissionsHM);

			final var	showLhpvDetailsButton = execFldPermissionsHM.get(FeildPermissionsConstant.SHOW_LHPV_DETAILS_IN_TUR_REPORT_FOR_EXCEL) != null;

			final var turConfiguration						= ReadAllConfigurationsBllImpl.getInstance().getReportConfigurationData(ReportIdentifierConstant.TUR_REGISTER, executive.getAccountGroupId());
			final var isSearchDataForOwnBranchOnly			= (boolean) turConfiguration.getOrDefault(TurReportConfigurationDTO.IS_SEARCH_DATA_FOR_OWN_BRANCH_ONLY, false);
			final var customErrorOnOtherBranchDetailSearch	= (boolean) turConfiguration.getOrDefault(TurReportConfigurationDTO.CUSTOM_ERROR_ON_OTHER_BRANCH_DETAIL_SEARCH, false);
			final var assignedLocationList 					= cManip.getAssignedLocationsIdListByLocationIdId(request, executive.getBranchId(), executive.getAccountGroupId());
			final var isAllowToSearchAllBranchReportData	= execFldPermissionsHM != null && execFldPermissionsHM.containsKey(FeildPermissionsConstant.ALLOW_TO_SEARCH_ALL_BRANCH_REPORT_DATA);

			ActionStaticUtil.executiveTypeWiseBranches(request, cManip, executive);

			if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN || executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_REGIONADMIN){
				subRegionId = JSPUtility.GetLong(request, "subRegion", 0);
				branchId	= JSPUtility.GetLong(request, "branch", 0);
			} else if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_SUBREGIONADMIN) {
				subRegionId = executive.getSubRegionId();
				branchId 	= JSPUtility.GetLong(request, "branch", 0);
			} else {
				subRegionId = executive.getSubRegionId();
				branchId 	= executive.getBranchId();
			}

			if(branchId == 0)
				branchIds = cManip.getPhysicalBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_SUBREGION, subRegionId);
			else
				branchIds = Long.toString(branchId);

			if(StringUtils.isEmpty(branchIds)) {
				ActionStaticUtil.catchActionException(request, error, "No records found !");
				return;
			}

			ActionStaticUtil.setRequestAttribute(request,"customAddressBranchId", branchId);
			ActionStaticUtil.setRequestAttribute(request,"customAddressIdentifer", CustomGroupMapper.IDENTIFIER_DELIVERY);

			request.setAttribute("agentName", executive.getName());
			final var	outValueObject = TURRegisterDao.getInstance().getTURRegisterData(fromDate, toDate, branchIds, accountGroupId);

			if(outValueObject != null) {
				var	reports 			= (TURRegisterReport[]) outValueObject.get("reportArr");
				var	dispatchLedgerIdArr	= (Long[]) outValueObject.get("dispatchLedgerIdArray");

				if(!ObjectUtils.isEmpty(reports) && isSearchDataForOwnBranchOnly && !isAllowToSearchAllBranchReportData){
					reports = Arrays.stream(reports).filter(report -> executive.getBranchId() == report.getSourceBranchId()
							|| executive.getBranchId() == report.getDestinationBranchId() || assignedLocationList != null && (assignedLocationList.contains(report.getSourceBranchId())
									|| assignedLocationList.contains(report.getDestinationBranchId()))).toArray(TURRegisterReport[]::new);

					if(reports != null)
						dispatchLedgerIdArr = Arrays.stream(reports).map(TURRegisterReport::getDispatchLedgerId).toArray(Long[]::new);
				}

				if(ObjectUtils.isNotEmpty(reports)) {
					final var	displayDataReportConfig				= PropertyConfigValueBLLImpl.getInstance().getConfiguration(executive, PropertiesFileConstants.REPORT_WISE_DISPLAY_ZERO_AMOUNT_CONSTANT);
					final var	isAmountZeroForTurRegisterReport	= displayDataReportConfig.getBoolean(ReportWiseDisplayZeroAmountConstant.TUR_REGISTER_REPORT, false);
					final var	displayDataConfig					= cManip.getDisplayDataConfiguration(request, executive.getAccountGroupId());
					final var	showBookingCharges					= (boolean) turConfiguration.getOrDefault(TurReportConfigurationDTO.SHOW_BOOKING_CHARGES, false);
					final var	isAmountShowOnce					= (boolean) turConfiguration.getOrDefault(TurReportConfigurationDTO.IS_AMOUNT_SHOW_ONCE, false);
					final var	showToPayFrghtAmtAfterDlyBilCrdt 	= (boolean) turConfiguration.getOrDefault(TurReportConfigurationDTO.SHOW_TO_PAY_FREIGHT_AMT_AFTER_DELIVERY_BILL_CREDIT, false);
					final var 	showLhpvDetails						= (boolean) turConfiguration.getOrDefault(TurReportConfigurationDTO.SHOW_LHPV_DETAILS, false);
					final var	showTotalLorryHireColumn			= (boolean) turConfiguration.getOrDefault(TurReportConfigurationDTO.SHOW_TOTAL_LORRY_HIRE_COLUMN, false);
					final var	showLorryHireAmountOnce				= (boolean) turConfiguration.getOrDefault(TurReportConfigurationDTO.SHOW_LORRY_HIRE_AMOUNT_ONCE, false);
					final var	showBookingAmount					= (boolean) turConfiguration.getOrDefault(TurReportConfigurationDTO.SHOW_BOOKING_AMOUNT, false);
					final var 	allowTurNumberWiseSorting			= (boolean) turConfiguration.getOrDefault(TurReportConfigurationDTO.ALLOW_TUR_NUMBER_WISE_SORTING, true);
					final var	showActualQuantityAndWeight			= (boolean) turConfiguration.getOrDefault(TurReportConfigurationDTO.SHOW_ACTUAL_QUANTITY_AND_WEIGHT, false);

					if(dispatchLedgerIdArr.length > 0) {
						dispatchLedgerIds = Utility.GetLongArrayToString(dispatchLedgerIdArr);
						dispatchLedgerHM  = DispatchLedgerDao.getInstance().getDispatchLedgerDetailsByLSIds(dispatchLedgerIds);
					}

					if(showLhpvDetails) {
						final var	lhpvIdArrayList 	= new ArrayList<Long>();

						for(final Map.Entry<Long, DispatchLedger> entry : dispatchLedgerHM.entrySet()) {
							final var	dispatchLedger = entry.getValue();
							lhpvIdArrayList.add(dispatchLedger.getLhpvId());
						}

						if(!lhpvIdArrayList.isEmpty())
							lhpvIds = Utility.GetLongArrayListToString(lhpvIdArrayList);

						final var	lhpvValObj = LhpvSettlementChargesDao.getInstance().getSetlementChargesByBlhpvIds(lhpvIds, LhpvChargesForGroup.IDENTIFIER_TYPE_LHPV);
						chargesCollMainHshmp = (HashMap<Long, HashMap<Long, Double>>) lhpvValObj.get("chargesCollMainHshmp");
					}

					final var	lhpvIdForSingle  = new ArrayList<Long>();

					for (final TURRegisterReport report : reports) {
						lorryHire = 0.00;

						if(allowTurNumberWiseSorting)
							setNumberForSorting(report);

						var	branch	= cManip.getGenericBranchDetailCache(request,report.getSourceBranchId());
						report.setSourceBranch(branch.getName());
						report.setSourceSubRegionId(branch.getSubRegionId());

						branch	= cManip.getGenericBranchDetailCache(request,report.getDestinationBranchId());
						report.setDestinationBranch(branch.getName());
						report.setDestinationSubRegionId(branch.getSubRegionId());

						if(report.getSourceBranchId()  > 0)
							report.setSourceBranch(cManip.getGenericBranchDetailCache(request,report.getSourceBranchId()).getName());

						report.setLsNumber(dispatchLedgerHM.get(report.getDispatchLedgerId()).getLsNumber());
						report.setLsDateTime(dispatchLedgerHM.get(report.getDispatchLedgerId()).getTripDateTime());
						report.setCrossingAgentId(dispatchLedgerHM.get(report.getDispatchLedgerId()).getCrossingAgentId());
						report.setlHPVNumber(dispatchLedgerHM.get(report.getDispatchLedgerId()).getlHPVNumber());
						report.setLhpvId(dispatchLedgerHM.get(report.getDispatchLedgerId()).getLhpvId());

						if(showLhpvDetails && chargesCollMainHshmp != null) {
							final var	chargesColl	= chargesCollMainHshmp.get(dispatchLedgerHM.get(report.getDispatchLedgerId()).getLhpvId());

							if(chargesColl != null) {
								report.setLorryHire(chargesColl.getOrDefault((long) LhpvChargeTypeMaster.LORRY_HIRE, 0d));
								report.setLorryHireAdvance(chargesColl.getOrDefault((long) LhpvChargeTypeMaster.ADVANCE_AMOUNT, 0d));
								report.setLorryHireBalance(chargesColl.getOrDefault((long) LhpvChargeTypeMaster.BALANCE_AMOUNT, 0d));

								if(showTotalLorryHireColumn) {
									for (final Map.Entry<Long, Double> entry : chargesColl.entrySet()) {
										final long key	= entry.getKey();

										if(key != LHPVChargeTypeConstant.OTHER_NEGATIVE && key != LHPVChargeTypeConstant.ADVANCE_AMOUNT
												&& key != LHPVChargeTypeConstant.BALANCE_AMOUNT && key != LHPVChargeTypeConstant.RATE_PMT)
											lorryHire	+= entry.getValue();
									}

									if(showLorryHireAmountOnce) {
										if(!lhpvIdForSingle.contains(dispatchLedgerHM.get(report.getDispatchLedgerId()).getLhpvId())) {
											lhpvIdForSingle.add(dispatchLedgerHM.get(report.getDispatchLedgerId()).getLhpvId());
											report.setLorryHire(lorryHire);
										} else
											report.setLorryHire(0.00);
									} else
										report.setLorryHire(lorryHire);
								}
							}
						}

						branch		= cManip.getGenericBranchDetailCache(request,report.getTurBranchId());
						final var	subRegion 	= cManip.getGenericSubRegionById(request, branch.getSubRegionId());

						report.setTurSubRegionName(subRegion.getName());
						report.setTurBranchName(branch.getName());
						report.setTxnThroughName(BookingModeConstant.bookingModeName(report.getTxnThroughId()));
					}

					final var wayBillTypeIds	= WayBillTypeConstant.WAYBILL_TYPE_PAID + "," + WayBillTypeConstant.WAYBILL_TYPE_TO_PAY + "," + WayBillTypeConstant.WAYBILL_TYPE_CREDIT + "," + WayBillTypeConstant.WAYBILL_TYPE_FOC;
					final var receivedLedgerIds = CollectionUtility.joinIds(Arrays.asList(reports), TURRegisterReport::getReceivedLedgerId);

					final var	amountCollection = GenerateTurReportBLL.getInstance().getTURAmount(receivedLedgerIds ,dispatchLedgerIds, wayBillTypeIds, showToPayFrghtAmtAfterDlyBilCrdt, isAmountShowOnce, isAmountZeroForTurRegisterReport, valueObjectIn, displayDataConfig, showActualQuantityAndWeight);

					if(showBookingCharges)
						bkGChargeCollection		= TURRegisterDao.getInstance().getTurBookingCharges(fromDate, toDate, branchId, accountGroupId, isAmountShowOnce);

					if(amountCollection != null || bkGChargeCollection != null)
						for (final TURRegisterReport report : reports) {
							if(amountCollection != null) {
								final var	reportModel 	= amountCollection.get(report.getReceivedLedgerId());

								if(reportModel != null) {
									if(isAmountShowOnce) {
										if(reportModel.isAmountShow())
											report.setFreightTotal(reportModel.getGrandTotal());
									} else
										report.setFreightTotal(reportModel.getGrandTotal());

									if(showBookingAmount)
										report.setFreightTotal(reportModel.getBookingAmount());

									report.setBookingTotal(reportModel.getBookingAmount());
									report.setToPayBookingTotal(reportModel.getToPayBookingAmount());
									report.setPaidBookingTotal(reportModel.getPaidBookingAmount());
									report.setTotalNoOfPackages(reportModel.getActualUnloadQuantity());
									report.setTotalNoOfWayBills(reportModel.getNumberOfLR());
									report.setTotalActualWeight(reportModel.getActualUnloadWeight());
									report.setTbbBookingTotal(reportModel.getTbbBookingAmount());
									report.setToPayServiceTaxAmount(reportModel.getToPayServiceTaxAmount());
								}
							}

							if(bkGChargeCollection != null) {
								final var	bkgchargeModel	= bkGChargeCollection.get(report.getReceivedLedgerId());

								if(bkgchargeModel != null) {
									report.setWayBillCarreirRiskCharge(bkgchargeModel.getWayBillCarreirRiskCharge());
									report.setWayBillCrInsuranceCharge(bkgchargeModel.getWayBillCrInsuranceCharge());
									report.setWayBillBhCharge(bkgchargeModel.getWayBillBhCharge());
								}
							}
						}

					if(allowTurNumberWiseSorting) {
						List<TURRegisterReport>	reportList	= Arrays.asList(reports);
						reportList	= SortUtils.sortList(reportList, TURRegisterReport::getBranchCode, TURRegisterReport::getTurNumberForSort);
						final var	reportSorted = new TURRegisterReport[reportList.size()] ;
						reportList.toArray(reportSorted);
						request.setAttribute("report", reportSorted);
					} else
						request.setAttribute("report", reports);

					request.setAttribute("showLhpvDetailsButton", showLhpvDetailsButton);
					request.setAttribute("showTruckAnalyzingDetails", showTruckAnalyzingDetails);

					turConfiguration.entrySet().forEach((final Map.Entry<Object, Object> entry) -> request.setAttribute(entry.getKey().toString(), entry.getValue()));
				} else {
					if(customErrorOnOtherBranchDetailSearch) {
						error.put(CargoErrorList.ERROR_CODE, CargoErrorList.OTHER_BRANCH_REPORT_DATA_SEARCH_ERROR);

						if(branchId > 0)
							error.put(CargoErrorList.ERROR_DESCRIPTION, "Kindly Contact Source Branch For Report");
						else
							error.put(CargoErrorList.ERROR_DESCRIPTION, "Kindly Contact Respective Branches For Report");
					} else {
						error.put(CargoErrorList.ERROR_CODE, CargoErrorList.REPORT_NOTFOUND);
						error.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.REPORT_ERROR_DESCRIPTION);
					}

					request.setAttribute("cargoError", error);
				}
			} else {
				error.put(CargoErrorList.ERROR_CODE, CargoErrorList.REPORT_NOTFOUND);
				error.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}

			ActionStaticUtil.setReportViewModel(request);
			request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}

	private void setNumberForSorting(final TURRegisterReport reports) {
		try {
			final var 	pair	= SplitLRNumber.getNumbers(reports.getTurNumber());

			reports.setBranchCode(pair != null && pair.getBranchCode() instanceof String ? pair.getBranchCode().toString() : "");
			reports.setTurNumberForSort(pair != null && pair.getLrNumber() instanceof Long ? (long) pair.getLrNumber() : 0);
		} catch (final Exception e) {
			reports.setBranchCode("");
			reports.setTurNumberForSort(0);
		}
	}
}