package com.ivcargo.reports;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.SortedMap;
import java.util.TreeMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.bll.impl.properties.invoice.CreditorInvoiceConfigurationBllImpl;
import com.iv.constant.properties.invoice.BillPaymentConfigurationConstant;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.CollectionPersonMasterDao;
import com.platform.dao.CorporateAccountDao;
import com.platform.dao.reports.BillClearanceDAO;
import com.platform.dao.reports.BillDAO;
import com.platform.dto.Bill;
import com.platform.dto.BillClearance;
import com.platform.dto.BillDetailsForBillClearance;
import com.platform.dto.CollectionPersonMaster;
import com.platform.dto.CorporateAccount;
import com.platform.dto.Executive;
import com.platform.dto.configuration.discountlimit.ModuleWiseDiscountLimitConfigurationDTO;
import com.platform.dto.configuration.mindateselection.ModuleWiseMinDateSelectionConfigurationDTO;
import com.platform.dto.model.ReportViewModel;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

public class GetBillClearanceDataAction implements Action {

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	error 			= null;
		ReportViewModel		reportViewModel 	= null;
		ValueObject			outValObject		= null;
		Long[]				billIdArray			= null;
		Long[]				collIdArray			= null;
		Long[]				corpIdArray			= null;
		String				corpIdStr			= null;
		String				collIdStr			= null;
		String				billIdStr			= null;
		String				branchIds			= null;
		BillDetailsForBillClearance[]				bills 				= null;
		HashMap<Long,BillClearance>					billClearanceDetails= null;
		HashMap<Long,CorporateAccount>				corpAccColl			= null;
		HashMap<Long,CollectionPersonMaster>		collPersonHM		= null;
		SortedMap<String,ArrayList<BillDetailsForBillClearance>> 	billsColl			= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeBillClearanceAction().execute(request, response);

			final CacheManip	cManip			= new CacheManip(request);
			final Executive		executive		= cManip.getExecutive(request);
			final long			creditorId		= JSPUtility.GetLong(request, "CreditorId", 0);
			final String		billNo			= JSPUtility.GetString(request, "billNumber", null);
			final long			branchId		= JSPUtility.GetLong(request, "BranchId", 0);
			final short			typeOfSelection = JSPUtility.GetShort(request, "typeOfSelection", (short)0);

			final Map<Object, Object>	billPaymentConfig		= CreditorInvoiceConfigurationBllImpl.getInstance().getBillPaymentProperties(executive.getAccountGroupId());

			request.setAttribute(BillPaymentConfigurationConstant.DISPLAY_NUMBER_OF_DAYS_COLUMN, billPaymentConfig.getOrDefault(BillPaymentConfigurationConstant.DISPLAY_NUMBER_OF_DAYS_COLUMN, false));
			request.setAttribute(BillPaymentConfigurationConstant.SHOW_MESSAGE_PAYMENT_TYPE_CHANGE, billPaymentConfig.getOrDefault(BillPaymentConfigurationConstant.SHOW_MESSAGE_PAYMENT_TYPE_CHANGE, false));

			final Timestamp	systemDate		= Utility.getCurrentDateTime();

			final Timestamp	minDateTimeStamp		= cManip.getModuleWiseMinDateToGetData(request, executive.getAccountGroupId(),
					ModuleWiseMinDateSelectionConfigurationDTO.CREDITOR_INVOICE_PAYMENT_MIN_DATE_ALLOW,
					ModuleWiseMinDateSelectionConfigurationDTO.CREDITOR_INVOICE_PAYMENT_MIN_DATE);

			request.setAttribute("discountInPercent", cManip.getModuleWiseDiscountLimit(request, executive.getAccountGroupId(),
					ModuleWiseDiscountLimitConfigurationDTO.BILL_PAYMENT_DISCOUNT_LIMIT_ALLOW,
					ModuleWiseDiscountLimitConfigurationDTO.BILL_PAYMENT_DISCOUNT_LIMIT_IN_PERCENT));

			switch (typeOfSelection) {
			case Bill.SEARCH_BY_CREDITOR:
				if(creditorId != 0) {
					branchIds		= cManip.getBranchIdsByExecutiveType(request, executive);

					if(minDateTimeStamp != null)
						outValObject	= BillDAO.getInstance().getBillDetailsForBillClearanceFromMinDate((short)1, creditorId, branchIds, minDateTimeStamp, executive.getAccountGroupId());
					else
						outValObject	= BillDAO.getInstance().getBillDetailsForBillClearance((short)1, creditorId, branchIds, executive.getAccountGroupId());
				}
				break;
			case Bill.SEARCH_BY_BILL_NO:
				if(billNo != null && branchId > 0)
					if(minDateTimeStamp != null)
						outValObject	= BillDAO.getInstance().getBillDetailsForBillClearanceForSingleBillFromMinDate(executive.getAccountGroupId(),Bill.CUSTOMER_TYPE_TBB_LR_ID,billNo,branchId, (short)1, minDateTimeStamp);
					else
						outValObject	= BillDAO.getInstance().getBillDetailsForBillClearanceForSingleBill(executive.getAccountGroupId(),Bill.CUSTOMER_TYPE_TBB_LR_ID,billNo,branchId, (short)1);
				break;
			case Bill.SEARCH_BY_ALL:
				ActionStaticUtil.executiveTypeWiseBranches(request, cManip, executive);

				branchIds		= ActionStaticUtil.getPhysicalBranchIds(request, cManip, executive);

				if(minDateTimeStamp != null)
					outValObject	= BillDAO.getInstance().getBillDetailsForBillClearanceFromMinDate((short) 2, 0, branchIds, minDateTimeStamp, executive.getAccountGroupId());
				else
					outValObject	= BillDAO.getInstance().getBillDetailsForBillClearance((short) 2, 0, branchIds, executive.getAccountGroupId());
				break;
			default:
				break;
			}

			if(outValObject != null) {
				bills		= (BillDetailsForBillClearance[])outValObject.get("BillDetailsForBillClearance");
				billIdArray = (Long[])outValObject.get("BillIdArray");
				collIdArray = (Long[])outValObject.get("CollIdArray");
				corpIdArray	= (Long[])outValObject.get("corpIdArray");

				if(bills != null && billIdArray != null && collIdArray != null) {
					if(collIdArray.length > 0) {
						collIdStr 		= Utility.GetLongArrayToString(collIdArray);
						collPersonHM	= CollectionPersonMasterDao.getInstance().getCollectionPersonDetailsByIds(collIdStr);
					}

					if(corpIdArray != null && corpIdArray.length > 0) {
						corpIdStr	= Utility.GetLongArrayToString(corpIdArray);
						corpAccColl = CorporateAccountDao.getInstance().getCorporateAccountDetails(corpIdStr);
					}

					if(billIdArray.length > 0) {
						billIdStr = Arrays.toString(billIdArray);
						billIdStr = billIdStr.replace("[", "");
						billIdStr = billIdStr.replace("]", "");
						billClearanceDetails = BillClearanceDAO.getInstance().getBillClearanceDetails(billIdStr);

						for(final Map.Entry<Long, BillClearance> entry : billClearanceDetails.entrySet()) {
							final BillClearance	billClearance = entry.getValue();

							billClearance.setBranchName(cManip.getBranchById(request, executive.getAccountGroupId(), billClearance.getBranchId()).getName());

							if(corpAccColl != null && corpAccColl.get(billClearance.getCreditorId()) != null)
								billClearance.setCreditorName(corpAccColl.get(billClearance.getCreditorId()).getName());
						}

						request.setAttribute("BillClearanceDetails", billClearanceDetails);
					}

					billsColl = new TreeMap<>();

					for (final BillDetailsForBillClearance bill : bills) {
						bill.setBranchName(cManip.getBranchById(request, executive.getAccountGroupId(), bill.getBranchId()).getName());

						if(corpAccColl != null && corpAccColl.get(bill.getCreditorId()) != null)
							bill.setCreditorName(corpAccColl.get(bill.getCreditorId()).getName());

						if(collPersonHM != null && collPersonHM.get(bill.getCollectionPersonId()) != null)
							bill.setCollectionPersonName(collPersonHM.get(bill.getCollectionPersonId()).getName());
						else
							bill.setCollectionPersonName("--");

						bill.setNoOfDays(Utility.getDayDiffBetweenTwoDates( bill.getCreationDateTimeStamp(),systemDate));

						ArrayList<BillDetailsForBillClearance>	billsArrList = billsColl.get(bill.getCreditorName() + "_" + bill.getCreditorId());

						if (billsArrList == null)
							billsArrList = new ArrayList<>();

						billsArrList.add(bill);
						billsColl.put(bill.getCreditorName() + "_" + bill.getCreditorId(), billsArrList);
					}

					request.setAttribute("BillDetailsForBillClearance", billsColl);

					reportViewModel = new ReportViewModel();
					reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);
					request.setAttribute("ReportViewModel",reportViewModel);
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

			request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}
	}
}
