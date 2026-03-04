package com.ivcargo.reports;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.CorporateAccountBLL;
import com.framework.Action;
import com.iv.bll.impl.properties.invoice.CreditorInvoiceConfigurationBllImpl;
import com.iv.constant.properties.invoice.BillPaymentConfigurationConstant;
import com.iv.logsapp.LogWriter;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.reports.BillDAO;
import com.platform.dto.AccountGroup;
import com.platform.dto.AliasNameConstants;
import com.platform.dto.CorporateAccount;
import com.platform.dto.Executive;
import com.platform.dto.configuration.modules.GroupConfigurationPropertiesDTO;

public class InitializeBillClearanceAction implements Action {

	private static final String TRACE_ID = InitializeBillClearanceAction.class.getName();

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	 			error 						= null;
		Executive							executive 					= null;
		ArrayList<CorporateAccount>			creditorList				= null;
		CorporateAccount[] 					creditorDetails				= null;
		String								branchIds					= null;
		CacheManip							cManip						= null;
		HashMap<Long,CorporateAccount> 		creditorColl				= null;
		ValueObject 						regions 					= null;
		ValueObject 						subRegions					= null;
		ValueObject							branches					= null;
		ValueObject							groupConfig					= null;
		ValueObject							valueObjectIn				= null;
		CorporateAccountBLL					corporateAccountBLL			= null;
		AccountGroup						accountGroup				= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			cManip		= new CacheManip(request);
			executive	= cManip.getExecutive(request);

			valueObjectIn		= new ValueObject();
			corporateAccountBLL	= new CorporateAccountBLL();

			groupConfig			= cManip.getGroupConfiguration(request, executive.getAccountGroupId());
			regions				= cManip.getAllRegions(request);
			subRegions			= cManip.getAllSubRegions(request);
			branches			= cManip.getGenericBranchesDetail(request);
			branchIds			= cManip.getBranchIdsByExecutiveType(request, executive);
			accountGroup		= cManip.getAccountGroupById(request, executive.getAccountGroupId());

			final Map<Object, Object>	billPaymentConfig			= CreditorInvoiceConfigurationBllImpl.getInstance().getBillPaymentProperties(executive.getAccountGroupId());

			valueObjectIn.put(GroupConfigurationPropertiesDTO.GROUP_CONFIGURATION, groupConfig);
			valueObjectIn.put(AliasNameConstants.ALL_REGIONS, regions);
			valueObjectIn.put(AliasNameConstants.ALL_SUB_REGIONS, subRegions);
			valueObjectIn.put(AliasNameConstants.ALL_BRANCHES, branches);
			valueObjectIn.put(AliasNameConstants.ACCOUNT_GROUP, accountGroup);
			valueObjectIn.put("isCreditorParty", true);

			ActionStaticUtil.executiveTypeWiseSelection3(request, cManip, executive);

			creditorList	= BillDAO.getInstance().getCreditorDetails(executive.getAccountGroupId(),branchIds);

			creditorDetails	= corporateAccountBLL.getPartyListByPartyIdentifiers(creditorList, valueObjectIn);

			if(creditorDetails != null && creditorDetails.length > 0){
				creditorColl = new LinkedHashMap<>();

				for (final CorporateAccount creditorDetail : creditorDetails)
					creditorColl.put(creditorDetail.getCorporateAccountId(), creditorDetail);
			}

			request.setAttribute("CreditorDetails", creditorColl);
			request.setAttribute(BillPaymentConfigurationConstant.DISPLAY_NUMBER_OF_DAYS_COLUMN, billPaymentConfig.getOrDefault(BillPaymentConfigurationConstant.DISPLAY_NUMBER_OF_DAYS_COLUMN, false));
			request.setAttribute(BillPaymentConfigurationConstant.SHOW_RECEIVED_AMOUNT_FEILD, billPaymentConfig.getOrDefault(BillPaymentConfigurationConstant.SHOW_RECEIVED_AMOUNT_FEILD, false));
			request.setAttribute("nextPageToken", "success");

		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, e.getMessage());
		} finally {
			executive 				= null;
			creditorDetails 		= null;
			branchIds				= null;
			cManip					= null;
			creditorColl			= null;
			creditorList			= null;
			regions 				= null;
			subRegions				= null;
			branches				= null;
			groupConfig				= null;
			valueObjectIn			= null;
			corporateAccountBLL		= null;
		}
	}
}
