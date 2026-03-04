package com.ivcargo.actions;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.dto.constant.PaymentTypeConstant;
import com.iv.utils.constant.AccountGroupConstant;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.reports.ReportView;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.VoucherDetailsDao;
import com.platform.dao.WayBillIncomeDao;
import com.platform.dao.WayBillIncomeVoucherDetailsDao;
import com.platform.dto.CustomGroupMapper;
import com.platform.dto.model.ReportViewModel;

public class BranchIncomePrintAction implements Action {

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	 			error 						= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	incomeVoucherPaymentDetails		= VoucherDetailsDao.getInstance().getIncomeVoucherPaymentDetailsByVoucherDetailsId(JSPUtility.GetLong(request, "branchIncomeVoucherDetailsId", 0));
			final var	cacheManip					= new CacheManip(request);
			final var	executive					= cacheManip.getExecutive(request);
			final var	wayBillIncomeVoucherDetails = WayBillIncomeVoucherDetailsDao.getInstance().getWayBillIncomeVoucherDetailsById(JSPUtility.GetLong(request, "branchIncomeVoucherDetailsId", 0));

			final var	isLaserPrint = JSPUtility.GetBoolean(request, "isLaserPrint", false);
			
			if(wayBillIncomeVoucherDetails == null) {
				ActionStaticUtil.setRequestAttribute(request, ActionStaticUtil.NO_RECORDS_FOUND, true);
				return;
			}

			if(wayBillIncomeVoucherDetails.getWayBillId() > 0) {
				if(wayBillIncomeVoucherDetails.getSourceBranchId() > 0)
					wayBillIncomeVoucherDetails.setSourceBranch(cacheManip.getGenericBranchDetailCache(request, wayBillIncomeVoucherDetails.getSourceBranchId()).getName());

				if(wayBillIncomeVoucherDetails.getDestinationBranchId() > 0)
					wayBillIncomeVoucherDetails.setDestinationBranch(cacheManip.getGenericBranchDetailCache(request, wayBillIncomeVoucherDetails.getDestinationBranchId()).getName());

				if(wayBillIncomeVoucherDetails.getBranchId() > 0)
					wayBillIncomeVoucherDetails.setBranch(cacheManip.getGenericBranchDetailCache(request, wayBillIncomeVoucherDetails.getBranchId()).getName());
			} else if(wayBillIncomeVoucherDetails.getBranchId() > 0)
				wayBillIncomeVoucherDetails.setBranch(cacheManip.getGenericBranchDetailCache(request, wayBillIncomeVoucherDetails.getBranchId()).getName());

			if (incomeVoucherPaymentDetails != null) {
				incomeVoucherPaymentDetails.setBankName(incomeVoucherPaymentDetails.getIssueBank() != null ? incomeVoucherPaymentDetails.getIssueBank() : "--");
				incomeVoucherPaymentDetails.setPaymentModeName(PaymentTypeConstant.getPaymentType(incomeVoucherPaymentDetails.getPaymentMode()));
			}

			final var	branch = cacheManip.getGenericBranchDetailCache(request,wayBillIncomeVoucherDetails.getBranchId());
			wayBillIncomeVoucherDetails.setSubRegion(cacheManip.getGenericSubRegionById(request, branch.getSubRegionId()).getName());

			final var	wayBillIncomes = WayBillIncomeDao.getInstance().getWayBillIncomeDetailsByVoucherId(wayBillIncomeVoucherDetails.getWayBillIncomeVoucherDetailsId(), executive.getAccountGroupId());

			request.setAttribute("IncomeVoucherPaymentDetails", incomeVoucherPaymentDetails);
			request.setAttribute("WayBillIncomeVoucherDetails", wayBillIncomeVoucherDetails);
			request.setAttribute("wayBillIncomes", wayBillIncomes);
			ActionStaticUtil.setRequestAttribute(request,"customAddressBranchId", wayBillIncomeVoucherDetails.getBranchId());
			ActionStaticUtil.setRequestAttribute(request,"customAddressIdentifer", CustomGroupMapper.IDENTIFIER_BOOKING);

			var	reportViewModel = new ReportViewModel();
			reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);

			request.setAttribute("ReportViewModel",reportViewModel);
			request.setAttribute("branchIncomeVoucherDetailsId",JSPUtility.GetLong(request, "branchIncomeVoucherDetailsId", 0));

			if(isLaserPrint)
				request.setAttribute("nextPageToken", "success_ledger_"+executive.getAccountGroupId());
			else if(executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_KHTC
					|| executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_HTC
					|| executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_ACIPL
					|| executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_SRIDATTA
					|| executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_MPS
					|| executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_GOWTHAM
					|| executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_SCC
					|| executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_KGS
					|| executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_MEGHA
					|| executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_PAULOTRAVELS_GOA
					|| executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_AIR
					|| executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_VPT
					|| executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_JKTC
					|| executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_ACCURATE
					|| executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_RGLPL)

				request.setAttribute("nextPageToken", "success_"+executive.getAccountGroupId());
			else
				request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}
	}
}