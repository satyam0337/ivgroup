package com.ivcargo.reports;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.constant.properties.invoice.BillPaymentConfigurationConstant;
import com.iv.dao.impl.bill.BillClearanceDaoImpl;
import com.iv.dao.impl.reports.CreditWayBillPaymentDaoImpl;
import com.iv.dto.BillClearance;
import com.iv.dto.bill.WayBillDetailsForGeneratingBill;
import com.iv.dto.constant.BillTypeConstant;
import com.iv.dto.constant.FeildPermissionsConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.dto.constant.PaymentTypeConstant;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.exception.ExceptionProcess;
import com.iv.utils.utility.Utility;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.reports.BillDAO;
import com.platform.dto.BillDetailsForPrintingBill;
import com.platform.dto.ExecutiveFeildPermissionDTO;
import com.platform.resource.CargoErrorList;

public class ViewBillSummaryAction implements Action {
	private static final String TRACE_ID = "ViewBillSummaryAction";

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	 			error 						= null;
		List<WayBillDetailsForGeneratingBill>bills						= null;
		BillDetailsForPrintingBill			bill						= null;
		short								billTypeId					= 0;
		List<BillClearance>					billList					= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var billId 	= JSPUtility.GetLong(request, "billId" ,0);

			final var	billDetailsArrList	= BillDAO.getInstance().getBillDetailsForPrintByBillNumberAndBranchId("b.BillId = " + billId);

			if(billDetailsArrList != null) {
				bill			= billDetailsArrList.get(0);
				billTypeId		= bill.getBillTypeId();
			}

			if(billTypeId != BillTypeConstant.SUPPLEMENTARY_BILL_TYPE_ID)
				bills		= CreditWayBillPaymentDaoImpl.getInstance().getWayBillDetailsForViewBillSummary(billId);
			else
				bills		= new ArrayList<>();

			final var	cache			= new CacheManip(request);
			final var	executive		= cache.getExecutive(request);

			final var accountGroup	= cache.getAccountGroupById(request, executive.getAccountGroupId());
			final Map<Long, ExecutiveFeildPermissionDTO> eexecFldPermissions	= cache.getExecutiveFieldPermission(request);
			final var configuration	= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.BILL_PAYMENT);

			if(bills != null) {
				if(billTypeId == BillTypeConstant.SUPPLEMENTARY_BILL_TYPE_ID) {
					billList	= getBillClearanceDetails(billId);

					if(request.getAttribute("BillClearanceDetails") == null) {
						error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
						error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
						request.setAttribute("cargoError", error);
					}
				} else if(!bills.isEmpty()) {
					showBillSummaryDetails(request, bills, cache);
					billList	= getBillClearanceDetails(billId);
					request.setAttribute("WayBillDetailsForGeneratingBill", bills);
				} else {
					error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
					error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
					request.setAttribute("cargoError", error);
				}

				if(billList != null)
					request.setAttribute("BillClearanceDetails", billList);

				request.setAttribute("accountGroup", accountGroup);
				request.setAttribute("excelButton", eexecFldPermissions.get(FeildPermissionsConstant.EXCEL_BUTTON) != null);
				request.setAttribute("showConsignorDetails", (boolean) configuration.getOrDefault(BillPaymentConfigurationConstant.SHOW_CONSIGNOR_DETAILS, false));
				request.setAttribute("showConsigneeDetails", (boolean) configuration.getOrDefault(BillPaymentConfigurationConstant.SHOW_CONSIGNEE_DETAILS, false));
				request.setAttribute("showQuantityDetails", (boolean) configuration.getOrDefault(BillPaymentConfigurationConstant.SHOW_QUANTITY_DETAILS, false));
				request.setAttribute("showDownloadToExecl", (boolean) configuration.getOrDefault(BillPaymentConfigurationConstant.SHOW_DOWNLOAD_TO_EXECL, false));
				request.setAttribute("showPrintDetails", (boolean) configuration.getOrDefault(BillPaymentConfigurationConstant.SHOW_PRINT_DETAILS, false));
				request.setAttribute("showInvoiceNumberDetails", (boolean) configuration.getOrDefault(BillPaymentConfigurationConstant.SHOW_INVOICE_NUMBER_DETAILS, false));
			} else {
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}

			request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}
	}

	private void showBillSummaryDetails(HttpServletRequest request, List<WayBillDetailsForGeneratingBill> bills, CacheManip cache) throws Exception {
		try {
			for (final WayBillDetailsForGeneratingBill bill : bills) {
				var	branch	= cache.getGenericBranchDetailCache(request,bill.getSourceBranchId());
				bill.setSourceBranch(branch.getName());
				bill.setSourceSubRegionId(branch.getSubRegionId());

				var	subRegion	= cache.getGenericSubRegionById(request, bill.getSourceSubRegionId());
				bill.setSourceSubRegion(subRegion.getName());

				branch	= cache.getGenericBranchDetailCache(request,bill.getDestinationBranchId());
				bill.setDestinationBranch(branch.getName());
				bill.setDestinationSubRegionId(branch.getSubRegionId());

				subRegion	= cache.getGenericSubRegionById(request, bill.getDestinationSubRegionId());
				bill.setDestinationSubRegion(subRegion.getName());

				bill.setCreationDateTimeStampStr(DateTimeUtility.getDateFromTimeStamp(bill.getCreationDateTimeStamp()));
				bill.setInvoiceNumber(bill.getInvoiceNumber());
			}
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private List<BillClearance> getBillClearanceDetails(long billId) throws Exception {
		try {
			final var	billList = BillClearanceDaoImpl.getInstance().getBillClearanceDetailsForView("" + billId);

			if(billList != null && !billList.isEmpty())
				for(final BillClearance bc : billList) {
					bc.setBillClearanceCreationDateTimeStampString(DateTimeUtility.getDateFromTimeStamp(bc.getBillClearanceCreationDateTimeStamp()));
					bc.setBillClearanceChequeDateString(DateTimeUtility.getDateFromTimeStamp(bc.getBillClearanceChequeDate()));
					bc.setBillClearancePaymentModeString(PaymentTypeConstant.getPaymentType(bc.getBillClearancePaymentMode()));
					bc.setBillClearanceRemark(Utility.checkedNullCondition(bc.getBillClearanceRemark(), (short) 1));
					bc.setBillClearanceChequeNumber(Utility.checkedNullCondition(bc.getBillClearanceChequeNumber(), (short) 1));
					bc.setBillClearanceBankName(Utility.checkedNullCondition(bc.getBillClearanceBankName(), (short) 1));
				}

			return billList;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

}
