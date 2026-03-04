package com.ivcargo.reports;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.ObjectUtils;
import org.apache.commons.lang3.StringUtils;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.bll.impl.reports.collection.CashStatementReportBllImpl;
import com.iv.constant.properties.cashstatement.CashStatementPropertiesConstant;
import com.iv.dto.CashStatementTxn;
import com.iv.dto.constant.BusinessFunctionConstants;
import com.iv.dto.constant.FeildPermissionsConstant;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.constant.Constant;
import com.iv.utils.utility.CollectionUtility;
import com.iv.utils.utility.ListFilterUtility;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.AccountGroupDao;
import com.platform.dto.AccountGroupNetworkConfiguration;
import com.platform.dto.CustomGroupMapper;
import com.platform.dto.configuration.modules.CashStatementConfigurationDTO;
import com.platform.dto.constant.ExecutiveTypeConstant;
import com.platform.dto.constant.PaymentTypeConstant;
import com.platform.resource.CargoErrorList;
import com.platform.utils.PropertiesUtility;

public class CashStatementReportAction implements Action {

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	 		error 								= null;
		var								mergeGroupRegionId					= 0L;
		var 							branchId							= 0L;
		var								isAccessDenied						= false;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeCashStatementReportAction().execute(request, response);

			final var fromDateStr 	= JSPUtility.GetString(request, "fromDate");

			if(fromDateStr == null) {
				ActionStaticUtil.catchActionException(request, error, "Select Proper From Date !");
				return;
			}

			final var	cacheManip			= new CacheManip(request);

			if(!ActionStaticUtil.isAllowToAccessOperation(error, cacheManip, request, BusinessFunctionConstants.CASHSTATEMENTREPORT, BusinessFunctionConstants.PERMISSION_TYPE_REPORT)) {
				request.setAttribute(Constant.IS_ALLOW_TO_ACCESS_REPORT, false);
				return;
			}

			final var	fromDate			= DateTimeUtility.getStartOfDayTimeStamp(fromDateStr);
			final var	toDate				= DateTimeUtility.getEndOfDayTimeStamp(fromDateStr);
			final var	executive			= cacheManip.getExecutive(request);
			final var	valueInObject		= new HashMap<>();
			final var	configuration		= cacheManip.getCashStatementConfiguration(request, executive.getAccountGroupId());
			final var	execFldPermissions	= cacheManip.getExecutiveFieldPermission(request);
			final var cashStatementConfig	= cacheManip.getReportConfiguration(request, executive.getAccountGroupId(), ReportIdentifierConstant.CASH_STATEMENT_REPORT);

			if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN) {
				final var	mergeGroupRegionStr	= request.getParameter("region");

				var 		regionId		= 0L;

				if(StringUtils.contains(mergeGroupRegionStr, "_"))
					mergeGroupRegionId	= Long.parseLong(mergeGroupRegionStr.split("_")[1]);
				else
					regionId 		= JSPUtility.GetLong(request, "region", 0);

				final var	subRegionId 		= JSPUtility.GetLong(request, "subRegion", 0);
				branchId 			= JSPUtility.GetLong(request, "branch", 0);

				final var	assignedBranchHM  = cacheManip.getAssignedBranchListByAssignedAccountGroupId(request, executive.getAccountGroupId(), mergeGroupRegionId);

				if(mergeGroupRegionId > 0) {
					final var	assignedAccountGroupNetwork	= new AccountGroupNetworkConfiguration[1];

					final var	accountGroupNetworkConfiguration	= new AccountGroupNetworkConfiguration();

					accountGroupNetworkConfiguration.setAssignBranchAccountGroupId(mergeGroupRegionId);
					accountGroupNetworkConfiguration.setAssignedAccountGroupName(AccountGroupDao.getInstance().findByAccountGroupId(mergeGroupRegionId).getDescription());

					assignedAccountGroupNetwork[0]	= accountGroupNetworkConfiguration;

					request.setAttribute("assignedAccountGroupNetwork", assignedAccountGroupNetwork);
					request.setAttribute("subRegionBranches", assignedBranchHM);
				} else {
					// Get Combo values to restore
					request.setAttribute("subRegionForGroup", cacheManip.getSubRegionsByRegionId(request, regionId, executive.getAccountGroupId()));
					request.setAttribute("subRegionBranches", cacheManip.getPhysicalBranchesBySubRegionId(request,executive.getAccountGroupId(), subRegionId));
					request.setAttribute("mergeGroupRegionId", mergeGroupRegionId);
				}
			} else if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_REGIONADMIN) {
				final var	subRegionId = JSPUtility.GetLong(request, "subRegion", 0);
				branchId 	= JSPUtility.GetLong(request, "branch", 0);
				// Get Combo values to restore
				request.setAttribute("subRegionForGroup", cacheManip.getSubRegionsByRegionId(request, executive.getRegionId(), executive.getAccountGroupId()));
				request.setAttribute("subRegionBranches", cacheManip.getPhysicalBranchesBySubRegionId(request,executive.getAccountGroupId(), subRegionId));
			} else if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_SUBREGIONADMIN) {
				branchId 	= JSPUtility.GetLong(request, "branch", 0);
				// Get Combo values to restore
				request.setAttribute("subRegionBranches", cacheManip.getPhysicalBranchesBySubRegionId(request,executive.getAccountGroupId(), executive.getSubRegionId()));
			} else
				branchId 	= executive.getBranchId();

			if((boolean) cashStatementConfig.getOrDefault(CashStatementPropertiesConstant.BRANCH_AND_EXECUTIVE_WISE_REPORT_SEARCH, false)) {
				final var	branchIdsAndExecutiveIds  = (String) cashStatementConfig.getOrDefault(CashStatementPropertiesConstant.BRANCHIDS_AND_EXECUTIVEIDS_WISE_REPORT_SEARCH, "0_0:0");
				final var 	longHashMap			= CollectionUtility.getLongWithLongHashMapFromStringArray(branchIdsAndExecutiveIds, Constant.COMMA, Constant.COLON);

				if(longHashMap.containsKey(branchId)) {
					final var	executiveIdList = longHashMap.get(branchId);

					isAccessDenied = executiveIdList != null && !executiveIdList.contains(executive.getExecutiveId());

					request.setAttribute("isAccessDenied", isAccessDenied);
				}
			}

			if(isAccessDenied) {
				request.setAttribute("nextPageToken", "success");
				return;
			}

			final var	isAllowCashStatement    	= PropertiesUtility.isAllow(configuration.get(CashStatementConfigurationDTO.DATA_FOR_CASH_STATEMENT)+"");

			valueInObject.put(Constant.FROM_DATE, fromDate);
			valueInObject.put(Constant.TO_DATE, toDate);
			valueInObject.put(Constant.BRANCH_ID, branchId);
			valueInObject.put(Constant.ACCOUNT_GROUP_ID, executive.getAccountGroupId());
			valueInObject.put(CashStatementPropertiesConstant.CASH_STATEMENT_PROPERTY, cashStatementConfig);

			request.setAttribute(CashStatementPropertiesConstant.SHOW_LINK_ON_PAIDBHAD_AC_NAME, cashStatementConfig.getOrDefault(CashStatementPropertiesConstant.SHOW_LINK_ON_PAIDBHAD_AC_NAME, true));
			request.setAttribute("showPopForXpAnd7Print", cashStatementConfig.getOrDefault(CashStatementPropertiesConstant.SHOW_POP_FOR_XP_AND_7_PRINT,true));
			request.setAttribute("showDeliveryRegisterReportLinkOnDeliveryCollection", cashStatementConfig.getOrDefault(CashStatementPropertiesConstant.SHOW_DELIVERY_REGISTER_REPORT_LINK_ON_DELIVERY_COLLECTION, false));
			request.setAttribute("allowToShowAmountInDecimal", cashStatementConfig.getOrDefault(CashStatementPropertiesConstant.ALLOW_TO_SHOW_AMOUNT_IN_DECIMAL, false));
			request.setAttribute(CashStatementPropertiesConstant.SHOW_ACTUAL_CREATION_DATE, cashStatementConfig.getOrDefault(CashStatementPropertiesConstant.SHOW_ACTUAL_CREATION_DATE, false));
			request.setAttribute("refreshBranchWiseCashStatement", execFldPermissions.get(FeildPermissionsConstant.REFRESH_BRANCH_WISE_CASH_STATEMENT) != null);
			request.setAttribute(CashStatementPropertiesConstant.IS_SHOW_LINK_FOR_LR_VIEW_ON_WAYBILL_NUMBER, cashStatementConfig.getOrDefault(CashStatementPropertiesConstant.IS_SHOW_LINK_FOR_LR_VIEW_ON_WAYBILL_NUMBER, false));

			final var	cashStatementTxns = CashStatementReportBllImpl.getInstance().getCashStatementOldReportDetails(valueInObject);

			if(ObjectUtils.isNotEmpty(cashStatementTxns)) {
				request.setAttribute("CashStatementTxn", cashStatementTxns);

				final var caStatementTxn = ListFilterUtility.findFirstItemOrNull(cashStatementTxns, e -> e.getPaymentTypeId() == PaymentTypeConstant.PAYMENT_TYPE_CASH_ID
						|| e.getIdentifier() == CashStatementTxn.IDENTIFIER_FOR_OPENING_BALANCE
						|| e.getIdentifier() == CashStatementTxn.IDENTIFIER_FOR_CLOSING_BALANCE);

				if(caStatementTxn == null && isAllowCashStatement) {
					final var	cashStatementTxnsList = CashStatementReportBllImpl.getInstance().getLastOpeningOrClosingBalance(branchId, fromDate, toDate, executive.getAccountGroupId());

					if(cashStatementTxns != null)
						cashStatementTxnsList.addAll(cashStatementTxns);

					request.setAttribute("CashStatementTxn", cashStatementTxnsList);
				}
			} else if(isAllowCashStatement)
				request.setAttribute("CashStatementTxn", CashStatementReportBllImpl.getInstance().getLastOpeningOrClosingBalance(branchId, fromDate, toDate, executive.getAccountGroupId()));
			else {
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}

			ActionStaticUtil.setRequestAttribute(request,"customAddressBranchId", branchId);
			ActionStaticUtil.setRequestAttribute(request,"customAddressIdentifer", CustomGroupMapper.IDENTIFIER_BOOKING);
			ActionStaticUtil.setReportViewModel(request);
			request.setAttribute("nextPageToken", "success");

		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}

	}
}
