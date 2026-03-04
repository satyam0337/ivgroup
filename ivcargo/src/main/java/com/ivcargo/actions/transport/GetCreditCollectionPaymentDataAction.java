package com.ivcargo.actions.transport;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.StringJoiner;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.bll.utils.PaymentTypeSelectionUtility;
import com.iv.constant.properties.CreditCollectionPaymentConfigurationConstant;
import com.iv.constant.properties.GeneralConfigurationPropertiesConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.utils.constant.Constant;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.exception.ExceptionProcess;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.reports.ReportView;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.CorporateAccountDao;
import com.platform.dao.DiscountMasterDAO;
import com.platform.dao.reports.BillClearanceDAO;
import com.platform.dao.reports.BillDAO;
import com.platform.dao.reports.CreditWayBillTxnClearanceSummaryDAO;
import com.platform.dao.reports.CreditorPaymentModuleDAO;
import com.platform.dto.BillClearance;
import com.platform.dto.BillDetailsForBillClearance;
import com.platform.dto.CorporateAccount;
import com.platform.dto.configuration.discountlimit.ModuleWiseDiscountLimitConfigurationDTO;
import com.platform.dto.configuration.mindateselection.ModuleWiseMinDateSelectionConfigurationDTO;
import com.platform.dto.model.CreditWayBillTxn;
import com.platform.dto.model.ReportViewModel;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Converter;
import com.platform.utils.Utility;

public class GetCreditCollectionPaymentDataAction implements Action {

	private static final String TRACE_ID = "GetCreditCollectionPaymentDataAction";
	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	 		error 					= null;
		ReportViewModel 				reportViewModel 		= null;
		BillDetailsForBillClearance[] 	bills 					= null;
		Long[]							billIdArray				= null;
		Long[]							corpIdArray				= null;
		String							corpIdStr				= null;
		String							billIdStr				= null;
		HashMap<Long, BillClearance>	billClearanceDetails	= null;
		BillClearance					billClearance			= null;
		CorporateAccount				corpAcc					= null;
		HashMap<Long, CorporateAccount> corpAccHM				= null;
		CreditWayBillTxn[]				creditWayBillTxn		= null;
		var								isSearchByDate			= false;
		Timestamp        				upTodate       			= null;
		Long[]							creditWayBillTxnIdArray	= null;
		String							creditWayBillTxnIds		= null;
		Timestamp						fromDate					= null;
		Timestamp						toDate						= null;
		short 							stbsFlag 					= 0;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	cManip	  			= new CacheManip(request);
			final var	executive 			= cManip.getExecutive(request);
			final var	collectionPersonId	= JSPUtility.GetLong(request, "selectedCollectionPersonId");

			final var	accountGroupId		= executive.getAccountGroupId();
			final var	sdf					= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");

			if(request.getParameter("searchByDate") != null)
				isSearchByDate = true;

			final var	cacheManip	= new CacheManip(request);

			final var	groupConfiguration		= cacheManip.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.CREDIT_COLLECTION_PAYMENT);
			final var	isAllowStbsCreation 	= (boolean) groupConfiguration.getOrDefault(CreditCollectionPaymentConfigurationConstant.IS_ALLOW_STBS_CREATION, false);
			final var	isShowFromDateToDate	= (boolean) groupConfiguration.getOrDefault(CreditCollectionPaymentConfigurationConstant.IS_SHOW_FROM_DATE_TO_DATE, false);

			final var 	generalConfig					= cacheManip.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.GENERAL_CONFIGURATION);
			final var	bankPaymentOperationRequired	= (boolean) generalConfig.getOrDefault(GeneralConfigurationPropertiesConstant.BANK_PAYMENT_OPERATION_REQUIRED, false);

			request.setAttribute(CreditCollectionPaymentConfigurationConstant.LR_CREDIT_CONFIGURATION, groupConfiguration);

			if(isSearchByDate) {
				if(request.getParameter("fromDate") != null){
					upTodate			= new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate") + " 23:59:59").getTime());
					fromDate			= new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate")+ " 00:00:00").getTime());
				}

				if(request.getParameter("toDate") != null)
					toDate			= new Timestamp(sdf.parse(JSPUtility.GetString(request, "toDate") + " 23:59:59").getTime());
			}

			final var	minDateTimeStamp		= cManip.getModuleWiseMinDateToGetData(request, executive.getAccountGroupId(),
					ModuleWiseMinDateSelectionConfigurationDTO.CREDIT_COLLECTION_PAYMENT_MODULE_MIN_DATE_ALLOW,
					ModuleWiseMinDateSelectionConfigurationDTO.CREDIT_COLLECTION_PAYMENT_MODULE_MIN_DATE);

			final var	discountInPercent		= cManip.getModuleWiseDiscountLimit(request, executive.getAccountGroupId(),
					ModuleWiseDiscountLimitConfigurationDTO.CREDIT_COLLECTION_PAYMENT_DISCOUNT_LIMIT_ALLOW,
					ModuleWiseDiscountLimitConfigurationDTO.CREDIT_COLLECTION_PAYMENT_DISCOUNT_LIMIT_IN_PERCENT);

			if(isAllowStbsCreation)
				stbsFlag = 1;
			else
				stbsFlag = 0;

			request.setAttribute("discountInPercent", discountInPercent);

			if(collectionPersonId == 0) {
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
				return ;
			}

			final var	whereClause = getWhereClause(collectionPersonId, isSearchByDate, isShowFromDateToDate, fromDate, toDate, upTodate);
			var	outValObject	= BillDAO.getInstance().getBillDetailsByCollectionPersonByWhereClause(whereClause);

			if(outValObject != null) {
				bills		= (BillDetailsForBillClearance[])outValObject.get("BillDetailsForBillClearance");
				billIdArray = (Long[])outValObject.get("BillIdArray");
				corpIdArray = (Long[])outValObject.get("corpIdArray");

				if(bills != null && billIdArray != null && corpIdArray != null) {
					if(corpIdArray.length > 0) {
						corpIdStr 		= Utility.GetLongArrayToString(corpIdArray);
						corpAccHM		= CorporateAccountDao.getInstance().getCorporateAccountDetails(corpIdStr);
					}

					if(billIdArray.length > 0) {
						billIdStr = Arrays.toString(billIdArray);
						billIdStr = billIdStr.replace("[", "");
						billIdStr = billIdStr.replace("]", "");
						billClearanceDetails = BillClearanceDAO.getInstance().getBillClearanceDetails(billIdStr);

						for(final Map.Entry<Long, BillClearance> entry : billClearanceDetails.entrySet()) {
							billClearance = entry.getValue();

							billClearance.setBranchName(cManip.getGenericBranchDetailCache(request, billClearance.getBranchId()).getName());
							corpAcc = corpAccHM.get(billClearance.getCreditorId());
							billClearance.setCreditorName(corpAcc.getName());
						}

						request.setAttribute("BillClearanceDetails", billClearanceDetails);
					}

					for (final BillDetailsForBillClearance bill : bills) {
						bill.setBranchName(cManip.getGenericBranchDetailCache(request,bill.getBranchId()).getName());
						corpAcc = corpAccHM.get(bill.getCreditorId());
						bill.setCreditorName(corpAcc.getName());
					}

					request.setAttribute("BillDetailsForBillClearance", bills);
					reportViewModel = new ReportViewModel();
					reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);
					request.setAttribute("ReportViewModel",reportViewModel);
				}
			}

			if(collectionPersonId == 0) {
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
				return ;
			}

			if(isSearchByDate) {
				if(isShowFromDateToDate)
					outValObject	= CreditorPaymentModuleDAO.getInstance().getAllCreditPaymentDataByCollectionPersonByFromToDate((short)3,collectionPersonId,fromDate,toDate);
				else
					outValObject	= CreditorPaymentModuleDAO.getInstance().getAllCreditPaymentDataByCollectionPersonByDate((short)3,collectionPersonId,upTodate,stbsFlag);
			} else if(minDateTimeStamp != null)
				outValObject	= CreditorPaymentModuleDAO.getInstance().getAllCreditPaymentDataByCollectionPersonFromMinDate((short)2, collectionPersonId, minDateTimeStamp, accountGroupId,stbsFlag);
			else
				outValObject	= CreditorPaymentModuleDAO.getInstance().getAllCreditPaymentDataByCollectionPerson((short)2, collectionPersonId, accountGroupId,stbsFlag);

			if(outValObject != null) {
				creditWayBillTxn		= (CreditWayBillTxn[]) outValObject.get("CreditWayBillTxn");
				creditWayBillTxnIdArray = (Long[])outValObject.get("creditWayBillTxnIdArray");

				for (final CreditWayBillTxn element : creditWayBillTxn) {
					element.setSourceBranch(cManip.getGenericBranchDetailCache(request, element.getSourceBranchId()).getName());
					element.setDestinationBranch(cManip.getGenericBranchDetailCache(request, element.getDestinationBranchId()).getName());
				}

				if(creditWayBillTxnIdArray != null && creditWayBillTxnIdArray.length > 0){
					creditWayBillTxnIds	= Utility.GetLongArrayToString(creditWayBillTxnIdArray);

					final var	valueObjectFromCreditWBTxn		= CreditWayBillTxnClearanceSummaryDAO.getInstance().getCreditWayBillTxnClearanceDetails(creditWayBillTxnIds);

					if(valueObjectFromCreditWBTxn != null)
						request.setAttribute("creditWayBillTxnClearanceSumHM", valueObjectFromCreditWBTxn.get("creditWayBillTxnClearanceSumHM"));
				}

				reportViewModel = new ReportViewModel();
				reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);
				request.setAttribute("ReportViewModel",reportViewModel);

				request.setAttribute("creditWayBillTxn", creditWayBillTxn);
			}

			final HashMap<?, ?>	execFldPermissions	= cacheManip.getExecutiveFieldPermission(request);

			final var		paymentTypeVO	= new ValueObject();
			paymentTypeVO.put(Constant.EXECUTIVE_ID, executive.getExecutiveId());
			paymentTypeVO.put(Constant.ACCOUNT_GROUP_ID, executive.getAccountGroupId());
			paymentTypeVO.put(ModuleIdentifierConstant.MODULE_ID, ModuleIdentifierConstant.CREDIT_COLLECTION_PAYMENT);
			paymentTypeVO.put("ExecutiveFeildPermission", Converter.hashMapWithDtoToHashMapConversion(execFldPermissions));
			final var	paymentTypeArr		= PaymentTypeSelectionUtility.getModuleWisePermissionBasePaymentTypeSelection(paymentTypeVO);

			request.setAttribute("paymentTypeArr",paymentTypeArr);
			request.setAttribute("isallowBankPaymentsOptions", bankPaymentOperationRequired);

			if(bills == null && creditWayBillTxn == null){
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}

			request.setAttribute("discountTypes", DiscountMasterDAO.getInstance().getDiscountTypes());
			request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}
	}

	private String getWhereClause(long collectionPersonId, boolean isSearchByDate, boolean isShowFromDateToDate, Timestamp fromDate, Timestamp toDate, Timestamp upTodate) throws Exception {
		final var whereClause = new StringJoiner(" AND ");

		try {
			whereClause.add("b.CollectionPersonId = " + collectionPersonId);
			whereClause.add("b.CustomerType = 1");

			if(isSearchByDate)
				if(isShowFromDateToDate) {
					whereClause.add("b.CreationDateTimeStamp >= '" + fromDate + "'");
					whereClause.add("b.CreationDateTimeStamp <= '" + toDate + "'");
				} else
					whereClause.add("b.CreationDateTimeStamp <= '" + upTodate + "'");

			return whereClause.toString();
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}
}