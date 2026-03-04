package com.ivcargo.actions;

import java.util.HashMap;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.ObjectUtils;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.constant.properties.BranchExpensePropertiesConstant;
import com.iv.dao.impl.incomeexpense.ExpenseVoucherDetailsDaoImpl;
import com.iv.dao.impl.incomeexpense.WayBillExpenseDaoImpl;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.dto.constant.PaymentTypeConstant;
import com.iv.dto.incomeexpense.ViewWayBillExpenseModel;
import com.iv.utils.Utility;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.constant.Constant;
import com.iv.utils.constant.DateTimeFormatConstant;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.TransportCommonMaster;

public class ViewWayBillExpenseAction implements Action {

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String, Object> error = null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if (ActionStaticUtil.isSystemError(request, error))
				return;

			final var	cacheManip	= new CacheManip(request);
			final var	executive	= cacheManip.getExecutive(request);

			final var	branchExpenseConfig	= cacheManip.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.BRANCH_EXPENSE);

			final var	wayBillId 			= JSPUtility.GetLong(request, "wayBillId");
			final var	viewWBExpModels 	= WayBillExpenseDaoImpl.getInstance().getWayBillExpenseDetails(wayBillId, TransportCommonMaster.CHARGE_TYPE_LR);

			if (ObjectUtils.isNotEmpty(viewWBExpModels)) {
				for (final ViewWayBillExpenseModel viewWBExpModel : viewWBExpModels) {
					viewWBExpModel.setVoucherDateTimeStr(DateTimeUtility.getDateFromTimeStampWithAMPM(viewWBExpModel.getVoucherDateTime()));
					viewWBExpModel.setExpenseDateTimeStr(DateTimeUtility.getDateFromTimeStampWithAMPM(viewWBExpModel.getExpenseDateTime()));
					viewWBExpModel.setIssueBank(Utility.checkedNullCondition(viewWBExpModel.getIssueBank(), (short) 1));
					viewWBExpModel.setPaymentTypeName(PaymentTypeConstant.getPaymentType(viewWBExpModel.getPaymentType()));

					if (viewWBExpModel.getPaymentType() == PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID)
						viewWBExpModel.setChequeStr("Cheque Date : " + DateTimeUtility.getDateFromTimeStamp(viewWBExpModel.getChequeDate(), DateTimeFormatConstant.DD_MM_YYYY) + " Cheque No. : " + viewWBExpModel.getChequeNumber() + " Bank : " + viewWBExpModel.getIssueBank());
					else if (viewWBExpModel.getPaymentType() == PaymentTypeConstant.PAYMENT_TYPE_ONLINE_RTGS_ID)
						viewWBExpModel.setChequeStr("RTGS Date : " + DateTimeUtility.getDateFromTimeStamp(viewWBExpModel.getChequeDate(), DateTimeFormatConstant.DD_MM_YYYY) + " RTGS No. : " + viewWBExpModel.getChequeNumber() + " Bank : " + viewWBExpModel.getIssueBank());
					else if (viewWBExpModel.getPaymentType() == PaymentTypeConstant.PAYMENT_TYPE_ONLINE_NEFT_ID)
						viewWBExpModel.setChequeStr("NEFT Date : " + DateTimeUtility.getDateFromTimeStamp(viewWBExpModel.getChequeDate(), DateTimeFormatConstant.DD_MM_YYYY) + " NEFT No. : " + viewWBExpModel.getChequeNumber() + " Bank : " + viewWBExpModel.getIssueBank());
					else if (viewWBExpModel.getPaymentType() == PaymentTypeConstant.PAYMENT_TYPE_IMPS_ID)
						viewWBExpModel.setChequeStr("Reference No. : " + viewWBExpModel.getChequeNumber() + " Bank : " + viewWBExpModel.getIssueBank());
					else
						viewWBExpModel.setChequeStr("--");
				}

				final var	viewWBExpModelColl 	= viewWBExpModels.stream().collect(Collectors.groupingBy(ViewWayBillExpenseModel::getVoucherDetailsId));

				final var	voucherIds = viewWBExpModelColl.keySet().stream().map(e -> Long.toString(e)).collect(Collectors.joining(Constant.COMMA));

				final var	voucherDetailsColl = ExpenseVoucherDetailsDaoImpl.getInstance().getVoucherDetailsByIds1(voucherIds);

				for (final Long key : voucherDetailsColl.keySet()) {
					final var	voucherDetails = voucherDetailsColl.get(key);

					final var branchObj	= cacheManip.getGenericBranchDetailCache(request, voucherDetails.getBranchId());

					voucherDetails.setBranch(branchObj.getName());
					voucherDetails.setSubRegionId(branchObj.getSubRegionId());
					voucherDetails.setSubRegion(cacheManip.getGenericSubRegionById(request, voucherDetails.getSubRegionId()).getName());
				}

				request.setAttribute("viewWBExpModelColl", viewWBExpModelColl);
				request.setAttribute("voucherDetailsColl", voucherDetailsColl);
				request.setAttribute(BranchExpensePropertiesConstant.SHOW_PAYMENT_MODE_SELECTION_IN_LR_EXPENSE, (boolean) branchExpenseConfig.getOrDefault(BranchExpensePropertiesConstant.SHOW_PAYMENT_MODE_SELECTION_IN_LR_EXPENSE, false));
			}

			request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}

}