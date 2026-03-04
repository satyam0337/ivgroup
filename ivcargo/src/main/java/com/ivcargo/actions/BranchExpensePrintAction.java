package com.ivcargo.actions;

import java.util.Arrays;
import java.util.HashMap;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.constant.properties.BranchExpensePrintPropertiesConstant;
import com.iv.constant.properties.BranchExpensePropertiesConstant;
import com.iv.dao.impl.TDSTxnDetailsDaoImpl;
import com.iv.dto.TDSTxnDetailsIdentifiers;
import com.iv.dto.constant.IncomeExpenseMappingConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.constant.AccountGroupConstant;
import com.iv.utils.constant.Constant;
import com.iv.utils.constant.DateTimeFormatConstant;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.exception.ExceptionProcess;
import com.iv.utils.utility.CollectionUtility;
import com.iv.utils.utility.Utility;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.reports.ReportView;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.DispatchLedgerDao;
import com.platform.dao.LHPVDao;
import com.platform.dao.VehicleAgentMasterDao;
import com.platform.dao.VoucherDetailsDao;
import com.platform.dao.WayBillExpenseDao;
import com.platform.dao.pickupdispatch.DoorPickupLedgerDao;
import com.platform.dto.CustomGroupMapper;
import com.platform.dto.Executive;
import com.platform.dto.ExpenseDetails;
import com.platform.dto.ExpenseVoucherDetails;
import com.platform.dto.TransportCommonMaster;
import com.platform.dto.constant.PaymentTypeConstant;
import com.platform.dto.model.LHPVCompanyDetails;
import com.platform.dto.model.ReportViewModel;

public class BranchExpensePrintAction implements Action {

	private static final String TRACE_ID	= BranchExpensePrintAction.class.getName();

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {

		HashMap<String,Object>	error 				= null;
		var	 					branchAllowedForPrint		= false;
		short					tdsTxnDetailsIdentifier		= 0;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	cacheManip						= new CacheManip(request);
			final var	executive						= cacheManip.getExecutive(request);
			final var voucherDetailsId	= JSPUtility.GetLong(request, "voucherDetailsId", 0);

			final var branchExpeseConfig		= cacheManip.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.BRANCH_EXPENSE);
			final var branchExpensePrintFromWS	= (boolean) branchExpeseConfig.getOrDefault(BranchExpensePropertiesConstant.BRANCH_EXPENSE_PRINT_FROM_WS, false);

			if(branchExpensePrintFromWS || executive.getAccountGroupId() > AccountGroupConstant.ACCOUNT_GROUP_ID_SWARAJ) {
				response.sendRedirect("prints.do?pageId=340&eventId=10&modulename=branchExpenseVoucherPrint&masterid=" + voucherDetailsId);
				return;
			}

			final var	voucherDetails					= VoucherDetailsDao.getInstance().getVoucherDetailsById(voucherDetailsId);
			final var	expenseVoucherPaymentDetails	= VoucherDetailsDao.getInstance().getExpenseVoucherPaymentDetailsByVoucherDetailsId(voucherDetailsId);
			final var	wayBillExpenses 				= WayBillExpenseDao.getInstance().getWayBillExpenseDetailsByVoucherId(voucherDetails.getExepenseVoucherDetailsId(), executive.getAccountGroupId());
			final var	expenseVoucherDetailsList		= VoucherDetailsDao.getInstance().getExpenseVoucherPaymentDetailsByExpenseVoucherDetailsId(voucherDetails.getExepenseVoucherDetailsId());
			final var	branch							= cacheManip.getGenericBranchDetailCache(request, voucherDetails.getBranchId());
			final var	region							= cacheManip.getGenericRegionById(request, branch.getRegionId());

			voucherDetails.setBranch(cacheManip.getGenericBranchDetailCache(request, voucherDetails.getBranchId()).getName());
			voucherDetails.setSubRegion(cacheManip.getGenericSubRegionById(request, branch.getSubRegionId() ).getName());
			voucherDetails.setRegion(region != null ? region.getName() : "");
			voucherDetails.setDoorPickupLsCreationDateTimeStr(DateTimeUtility.getDateFromTimeStamp(voucherDetails.getDoorPickupLsCreationDateTime()));
			voucherDetails.setDoorPickupLsNo(Utility.checkedNullCondition(voucherDetails.getDoorPickupLsNo(), (short) 2));
			voucherDetails.setDoorPickupLsVehicleNo(Utility.checkedNullCondition(voucherDetails.getDoorPickupLsVehicleNo(), (short) 2));
			voucherDetails.setDoorPickupLsPickupSource(Utility.checkedNullCondition(voucherDetails.getDoorPickupLsPickupSource(), (short) 2));
			voucherDetails.setDoorPickupLsPickupDestination(Utility.checkedNullCondition(voucherDetails.getDoorPickupLsPickupDestination(), (short) 2));
			voucherDetails.setDoorPickupLsDriverName(Utility.checkedNullCondition(voucherDetails.getDoorPickupLsDriverName(), (short) 2));
			voucherDetails.setDoorPickupLsDriverMobileNo(Utility.checkedNullCondition(voucherDetails.getDoorPickupLsDriverMobileNo(), (short) 2));
			voucherDetails.setDoorPickupLsRemark(Utility.checkedNullCondition(voucherDetails.getDoorPickupLsRemark(), (short) 2));
			voucherDetails.setCurrentTime(DateTimeUtility.getDateFromTimeStamp(DateTimeUtility.getCurrentTimeStamp(), DateTimeFormatConstant.HH_MM_AA));
			voucherDetails.setCurrentDate(DateTimeUtility.getDateFromTimeStamp(DateTimeUtility.getCurrentTimeStamp(), DateTimeFormatConstant.DD_MM_YY));
			voucherDetails.setPaymentMadeTo(Utility.checkedNullCondition(voucherDetails.getPaymentMadeTo(), (short) 2));

			final var	branchExpesePrintConfig		= cacheManip.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.BRANCH_EXPENSE_PRINT);
			final var	isLaserPrint 				= JSPUtility.GetBoolean(request, "isLaserPrint", false);
			final var	defaultBranchExpensePrint 	= (boolean) branchExpesePrintConfig.getOrDefault(BranchExpensePrintPropertiesConstant.DEFAULT_BRANCH_EXPENSE_PRINT, false);
			final var 	showLhpvLRsOnVoucherPrint	= (boolean) branchExpesePrintConfig.getOrDefault(BranchExpensePrintPropertiesConstant.SHOW_LHPV_LRS_ON_VOUCHER_PRINT, false);
			final var	printHeadingOnVoucher 		= (boolean) branchExpesePrintConfig.getOrDefault(BranchExpensePrintPropertiesConstant.PRINT_HEADING_ON_VOUCHER, false);

			if (expenseVoucherPaymentDetails != null) {
				expenseVoucherPaymentDetails.setPaymentModeName(PaymentTypeConstant.getPaymentType(expenseVoucherPaymentDetails.getPaymentMode()));
				expenseVoucherPaymentDetails.setBankName(Utility.checkedNullCondition(expenseVoucherPaymentDetails.getBankName(), (short) 1));
				expenseVoucherPaymentDetails.setBankAccountNumber(Utility.checkedNullCondition(expenseVoucherPaymentDetails.getBankAccountNumber(), (short) 1));
				expenseVoucherPaymentDetails.setRefrenceNumber(Utility.checkedNullCondition(expenseVoucherPaymentDetails.getRefrenceNumber(), (short) 1));
				expenseVoucherPaymentDetails.setChequeNumber(Utility.checkedNullCondition(expenseVoucherPaymentDetails.getChequeNumber(), (short) 1));

				if (expenseVoucherPaymentDetails.getPaymentMode() == PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID)
					expenseVoucherPaymentDetails.setChequeString("Cheque Date : " + DateTimeUtility.getDateFromTimeStamp(expenseVoucherPaymentDetails.getChequeDateTime(), DateTimeFormatConstant.DD_MM_YYYY) + " Cheque No. : " + expenseVoucherPaymentDetails.getChequeNumber() + " Bank : " + expenseVoucherPaymentDetails.getBankAccountName());
				else if(expenseVoucherPaymentDetails.getPaymentMode() == PaymentTypeConstant.PAYMENT_TYPE_LHPV_ADVANCE_CREDIT_ID || expenseVoucherPaymentDetails.getPaymentMode() == PaymentTypeConstant.PAYMENT_TYPE_EXPENSE_CREDIT_ID)
					expenseVoucherPaymentDetails.setChequeString("Credit Date : " + DateTimeUtility.getDateFromTimeStamp(expenseVoucherPaymentDetails.getChequeDateTime(), DateTimeFormatConstant.DD_MM_YYYY) + " Credit A/C : " + expenseVoucherPaymentDetails.getCreditAccountName());
				else
					expenseVoucherPaymentDetails.setChequeString("--");

				if(expenseVoucherPaymentDetails.getPaymentMadeToBranchId() > 0) {
					final var	paymentMadeToBranchName = cacheManip.getGenericBranchDetailCache(request, expenseVoucherPaymentDetails.getPaymentMadeToBranchId());
					final var	paymentMadeToAreaName   = cacheManip.getGenericSubRegionById(request, paymentMadeToBranchName.getSubRegionId());
					expenseVoucherPaymentDetails.setPaymentMadeToAreaName(paymentMadeToAreaName != null ? paymentMadeToAreaName.getName() : "");
				} else
					expenseVoucherPaymentDetails.setPaymentMadeToAreaName("--");

				if(expenseVoucherPaymentDetails.getChequeGivenTo() == null)
					expenseVoucherPaymentDetails.setChequeGivenTo("--");

				expenseVoucherPaymentDetails.setChequeDateStr(DateTimeUtility.getDateFromTimeStamp(expenseVoucherPaymentDetails.getChequeDateTime()));
			}

			if(wayBillExpenses != null && voucherDetails.getTypeOfExpenseId() == TransportCommonMaster.CHARGE_TYPE_OFFICE && wayBillExpenses[0].getMappingChargeTypeId() > 0)
				if(wayBillExpenses[0].getMappingChargeTypeId() == IncomeExpenseMappingConstant.TRUCK_ADVANCE
				|| wayBillExpenses[0].getMappingChargeTypeId() == IncomeExpenseMappingConstant.ADDITIONAL_TRUCK_ADVANCE) {
					if(voucherDetails.getId() > 0)
						getLhpvAdvanceDetails(request, voucherDetails, executive, showLhpvLRsOnVoucherPrint);

					tdsTxnDetailsIdentifier	= TDSTxnDetailsIdentifiers.TDSTXNDETAILS_IDENTIFIER_LHPV_ADVANCE;
				} else if(wayBillExpenses[0].getMappingChargeTypeId() == IncomeExpenseMappingConstant.DDM_LORRY_HIRE_AMOUNT) {
					getDDMLorryHireDetails(request, voucherDetails, executive);
					tdsTxnDetailsIdentifier	= TDSTxnDetailsIdentifiers.TDSTXNDETAILS_IDENTIFIER_DDM_LORRY_HIRE;
				} else if(wayBillExpenses[0].getMappingChargeTypeId() == IncomeExpenseMappingConstant.PICKUP_LORRY_HIRE_AMOUNT) {
					getPickupLorryHireDetails(request, voucherDetails, executive);
					tdsTxnDetailsIdentifier	= TDSTxnDetailsIdentifiers.TDSTXNDETAILS_IDENTIFIER_PICKUP_LORRY_HIRE;
				}

			if((boolean) branchExpesePrintConfig.getOrDefault(BranchExpensePrintPropertiesConstant.IS_BRANCH_WISE_PRINT_ALLOWED,false))
				branchAllowedForPrint	= Utility.isIdExistInLongList(branchExpesePrintConfig, BranchExpensePrintPropertiesConstant.BRANCH_ID_FOR_PRINT, executive.getBranchId());

			if (wayBillExpenses != null && wayBillExpenses.length > 0) {
				final var expenseDetailIds	= CollectionUtility.joinIds(Arrays.asList(wayBillExpenses), ExpenseDetails::getExpenseId);

				final var tdsTxnDetailsHM	= TDSTxnDetailsDaoImpl.getInstance().getTDSTxnAmount(tdsTxnDetailsIdentifier, expenseDetailIds);

				for (final ExpenseDetails element : wayBillExpenses) {
					element.setBranchName(cacheManip.getGenericBranchDetailCache(request, element.getBranchId()).getName());

					if(element.getCreditDebitByBranchId() > 0)
						element.setCreditDebitByBranch(Utility.checkedNullCondition(cacheManip.getGenericBranchDetailCache(request, element.getCreditDebitByBranchId()).getName(), (short)1) );
					else
						element.setCreditDebitByBranch("");

					if(!tdsTxnDetailsHM.isEmpty() && tdsTxnDetailsHM.containsKey(element.getExpenseId())) {
						final var	tdsTxnDetails = tdsTxnDetailsHM.get(element.getExpenseId());
						element.setTdsAmount(tdsTxnDetails.getTdsAmount());
					}
				}
			}

			request.setAttribute("voucherDetails", voucherDetails);
			request.setAttribute("expenseVoucherDetailsList", expenseVoucherDetailsList);
			request.setAttribute("wayBillExpenses", wayBillExpenses);
			request.setAttribute("expenseVoucherPaymentDetails", expenseVoucherPaymentDetails);
			request.setAttribute(BranchExpensePrintPropertiesConstant.SHOW_COMPANY_LOGO, (boolean) branchExpesePrintConfig.getOrDefault(BranchExpensePrintPropertiesConstant.SHOW_COMPANY_LOGO, false));
			ActionStaticUtil.setRequestAttribute(request,"customAddressBranchId", voucherDetails.getBranchId());
			ActionStaticUtil.setRequestAttribute(request,"customAddressIdentifer", CustomGroupMapper.IDENTIFIER_BOOKING);

			var	reportViewModel = new ReportViewModel();
			reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);
			request.setAttribute("ReportViewModel",reportViewModel);
			request.setAttribute("printHeadingOnVoucher",printHeadingOnVoucher);

			if(isLaserPrint)
				request.setAttribute("nextPageToken", "success_ledger_" + executive.getAccountGroupId());
			else if(voucherDetails.getId() > 0 && showLhpvLRsOnVoucherPrint)
				request.setAttribute("nextPageToken", "success_" + executive.getAccountGroupId() + "_1");
			else if(defaultBranchExpensePrint)
				request.setAttribute("nextPageToken", "success");
			else if(branchAllowedForPrint)
				request.setAttribute("nextPageToken", "success_new_" + executive.getAccountGroupId());
			else
				request.setAttribute("nextPageToken", "success_" + executive.getAccountGroupId());
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}

	private void getLhpvAdvanceDetails(HttpServletRequest request, ExpenseVoucherDetails voucherDetails, Executive executive, boolean showLhpvLRsOnVoucherPrint) throws Exception {
		try {
			final var	cacheManip						= new CacheManip(request);

			final var	lhpvModel		= LHPVDao.getInstance().getLimitedLHPVDataForEdit(voucherDetails.getId());

			if(lhpvModel != null) {
				lhpvModel.setBranch(cacheManip.getGenericBranchDetailCache(request, lhpvModel.getBranchId()).getName());
				lhpvModel.setDestinationBranch(cacheManip.getGenericBranchDetailCache(request, lhpvModel.getDestinationBranchId()).getName());

				if(lhpvModel.getVehicleNumberMasterId() > 0) {
					final var	vehicle  = cacheManip.getVehicleNumber(request, executive.getAccountGroupId(), lhpvModel.getVehicleNumberMasterId());

					if(vehicle != null) {
						lhpvModel.setVehicleNumber(vehicle.getVehicleNumber());
						lhpvModel.setVehicleAgentName(vehicle.getVehicleAgentName());
						lhpvModel.setPanNumber(vehicle.getPanNumber());
					}
				}

				if(lhpvModel.getVehicleAgentMasterId() > 0) {
					final var	agent	= VehicleAgentMasterDao.getInstance().getSingleVehicleAgentDetails(lhpvModel.getVehicleAgentMasterId());

					if(agent != null) {
						lhpvModel.setPanNumber(agent.getPanNo());
						lhpvModel.setVehicleAgentName(agent.getName());
					}
				}
			}

			request.setAttribute("lhpvModel", lhpvModel);

			if(showLhpvLRsOnVoucherPrint) {
				final var	lhpvList= LHPVDao.getInstance().getLHPVDetailsForCompanyDetails(voucherDetails.getId());

				if(lhpvList != null && !lhpvList.isEmpty()) {
					final var	wayBillNos = lhpvList.stream().map(LHPVCompanyDetails::getWayBillNumber).collect(Collectors.joining(Constant.COMMA));
					request.setAttribute("wayBillNos", wayBillNos);
				}
			}
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private void getDDMLorryHireDetails(HttpServletRequest request, ExpenseVoucherDetails voucherDetails, Executive executive) throws Exception {
		try {
			final var	cacheManip						= new CacheManip(request);

			final var	inValObject 	= new ValueObject();
			inValObject.put("accountGroupId", executive.getAccountGroupId());
			inValObject.put("dispatchLedgerId", voucherDetails.getId());
			inValObject.put("lsBranchId", 0);
			inValObject.put("lsNumber", voucherDetails.getNumber());
			inValObject.put("regionId", executive.getRegionId());
			inValObject.put("filter", 1);

			final var	dispatchLedgerArr	= DispatchLedgerDao.getInstance().getLimitedDispatchDataByDispatchLedgerId(inValObject);

			if(dispatchLedgerArr != null && dispatchLedgerArr.length > 0) {
				dispatchLedgerArr[0].setSourceBranch(cacheManip.getGenericBranchDetailCache(request, dispatchLedgerArr[0].getSourceBranchId()).getName());

				if(dispatchLedgerArr[0].getDestinationBranchId() > 0)
					dispatchLedgerArr[0].setDestinationBranch(cacheManip.getGenericBranchDetailCache(request, dispatchLedgerArr[0].getDestinationBranchId()).getName());
				else
					dispatchLedgerArr[0].setDestinationBranch(dispatchLedgerArr[0].getTruckDestination() != null ? dispatchLedgerArr[0].getTruckDestination() : "--");

				if(dispatchLedgerArr[0].getVehicleNumberMasterId() > 0) {
					final var	vehicle  = cacheManip.getVehicleNumber(request, executive.getAccountGroupId(), dispatchLedgerArr[0].getVehicleNumberMasterId());

					if(vehicle != null) {
						dispatchLedgerArr[0].setVehicleNumber(vehicle.getVehicleNumber());
						dispatchLedgerArr[0].setPanNumber(vehicle.getPanNumber());
					}
				}

				if(dispatchLedgerArr[0].getVehicleAgentId() > 0){
					final var	agent	= VehicleAgentMasterDao.getInstance().getSingleVehicleAgentDetails(dispatchLedgerArr[0].getVehicleAgentId());

					if(agent != null)
						dispatchLedgerArr[0].setPanNumber(agent.getPanNo());
				}
			}

			request.setAttribute("dispatchLedgerArr", dispatchLedgerArr);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private void getPickupLorryHireDetails(HttpServletRequest request, ExpenseVoucherDetails voucherDetails, Executive executive) throws Exception {
		try {
			final var	cacheManip						= new CacheManip(request);

			if(voucherDetails.getId() > 0) {
				final var	doorPickupLedgerArr = DoorPickupLedgerDao.getInstance().getLimitedDoorPickupDataByDoorPickupLedgerId(voucherDetails.getId());

				if(doorPickupLedgerArr != null && doorPickupLedgerArr.length > 0) {
					doorPickupLedgerArr[0].setDoorPickupNumber(doorPickupLedgerArr[0].getDoorPickupNumber() != null ?  doorPickupLedgerArr[0].getDoorPickupNumber() : "--" );

					if(doorPickupLedgerArr[0].getDoorPickupLedgerVehicleId() > 0) {
						final var	vehicle  =	cacheManip.getVehicleNumber(request, executive.getAccountGroupId(), doorPickupLedgerArr[0].getDoorPickupLedgerVehicleId());

						if(vehicle != null)
							doorPickupLedgerArr[0].setDoorPickupLedgerVehicleNumber(vehicle.getVehicleNumber());

						doorPickupLedgerArr[0].setPanNumber(vehicle.getPanNumber());
					}
				}

				request.setAttribute("doorPickupLedgerArr", doorPickupLedgerArr);
			}
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

}
