package com.ivcargo.actions.transport;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.ObjectUtils;
import org.apache.commons.lang3.StringUtils;

import com.framework.Action;
import com.iv.constant.properties.ConfigParamPropertiesConstant;
import com.iv.constant.properties.dispatch.ManualLSConfigurationConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.dto.constant.WayBillStatusConstant;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.CorporateAccountDao;
import com.platform.dao.DispatchLedgerDao;
import com.platform.dao.DispatchSummaryDao;
import com.platform.dto.ConfigParam;
import com.platform.dto.DispatchLedger;
import com.platform.dto.PackingTypeMaster;

public class InitializeAppendManualLSEntryAction implements Action{

	public static final String TRACE_ID = "InitializeAppendManualLSEntryAction";

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {

		HashMap<String,Object>	 		error 								= null;
		PackingTypeMaster[] 			packingType 						= null;
		String 							previousDate 						= null;
		String 							currentDate 						= null;
		String							lsNumber							= null;
		ArrayList<DispatchLedger>		dispatchLedgerAL					= null;
		var 							dispatchLedgerId 					= 0L;
		Timestamp						lsTripDateTime	 					= null;
		String							lsDateTime							= null;
		String							bothStatus							= null;
		var 							lsSrcBrnachId 						= 0L;
		var 							lsDestBrnachId 						= 0L;
		HashMap<Long,String>			wbIdWiseStatusHM					= null;
		var							isLSAllowToAppend					= true;
		var								maxNoOfDaysAllowBeforeCashStmtEntry	= 0;
		final long 						MILLIS_IN_DAY 						= 1000 * 60 * 60 * 24;
		var							tallyTRFAllowed						= false;
		var							moduleWiseDaysConfigAllowed			= false;
		var 							crossingAgentId 					= 0L;
		var 						isCrossing 							= false;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	cacheManip 						= new CacheManip(request);
			final var	executive  						= cacheManip.getExecutive(request);
			var	date	   						= new Date();
			final var	dateFormat 						= new SimpleDateFormat("dd-MM-yyyy");
			final var	configuration					= cacheManip.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.CONFIG_PARAM);
			final var	manualLSconfigHM				= cacheManip.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.MANUAL_LS);

			request.setAttribute(ManualLSConfigurationConstant.SHOW_DELIVERY_TO_COLUMN, manualLSconfigHM.getOrDefault(ManualLSConfigurationConstant.SHOW_DELIVERY_TO_COLUMN, false));
			request.setAttribute(ManualLSConfigurationConstant.SHOW_REMARK_COLUMN, manualLSconfigHM.getOrDefault(ManualLSConfigurationConstant.SHOW_REMARK_COLUMN, false));
			request.setAttribute(ManualLSConfigurationConstant.SHOW_ACTUAL_WEIGHT_COLUMN, manualLSconfigHM.getOrDefault(ManualLSConfigurationConstant.SHOW_ACTUAL_WEIGHT_COLUMN, false));

			if(request.getParameter("generatedLSNumber") != null){
				lsNumber = StringUtils.trim(request.getParameter("generatedLSNumber"));

				dispatchLedgerAL = DispatchLedgerDao.getInstance().getLSDataByLSNumber(executive.getAccountGroupId(), lsNumber);

				if(dispatchLedgerAL != null && !dispatchLedgerAL.isEmpty()) {
					for (final DispatchLedger element : dispatchLedgerAL)
						if(element.getStatus() == DispatchLedger.DISPATCHLEDGER_WAYBILL_STATUS_DISPATCHED && element.isManual() && element.getTypeOfLS() == DispatchLedger.TYPE_OF_LS_ID_NORMAL){
							wbIdWiseStatusHM = DispatchSummaryDao.getInstance().getStatusByDispatchLedgerId(element.getDispatchLedgerId());

							if(wbIdWiseStatusHM != null && wbIdWiseStatusHM.size() > 0) {
								for(final Map.Entry<Long, String> entry : wbIdWiseStatusHM.entrySet()) {
									bothStatus = entry.getValue();

									if(Short.parseShort(bothStatus.split("_")[0]) == WayBillStatusConstant.WAYBILL_STATUS_RECEIVED)
										isLSAllowToAppend = false;
								}

								if(isLSAllowToAppend) {
									dispatchLedgerId 	= element.getDispatchLedgerId();
									lsTripDateTime		= element.getTripDateTime();
									lsDateTime 			= dateFormat.format(lsTripDateTime);
									lsSrcBrnachId		= element.getSourceBranchId();
									lsDestBrnachId		= element.getDestinationBranchId();
									crossingAgentId		= element.getCrossingAgentId();
									isCrossing			= element.isCrossing();
								}
							}
						}

					request.setAttribute(ManualLSConfigurationConstant.SHOW_INVOICE_NUMBER_COLUMN, manualLSconfigHM.getOrDefault(ManualLSConfigurationConstant.SHOW_INVOICE_NUMBER_COLUMN, false));
					request.setAttribute("lsTripDateTime", lsTripDateTime);
					request.setAttribute("lsDateTime", lsDateTime);
					request.setAttribute("lsSrcBrnachId", Long.toString(lsSrcBrnachId));
					request.setAttribute("lsDestBrnachId", Long.toString(lsDestBrnachId));
					request.setAttribute("crossingAgentId", crossingAgentId);
					request.setAttribute("isCrossing", isCrossing);
				}

				request.setAttribute("dispatchLedgerId", Long.toString(dispatchLedgerId));

				if(dispatchLedgerId > 0){
					packingType 		= cacheManip.getPackingTypeData(request, executive.getAccountGroupId());

					//Check If packingTypeForGroup are Missing
					if(ObjectUtils.isEmpty(packingType))
						response.sendRedirect("SearchWayBill.do?pageId=0&eventId=1&filter=5");

					request.setAttribute("packingType", packingType);

					tallyTRFAllowed						= (boolean) configuration.getOrDefault(ConfigParamPropertiesConstant.TALLY_TRANSFER_ALLOWED, false);
					moduleWiseDaysConfigAllowed			= (boolean) configuration.getOrDefault(ConfigParamPropertiesConstant.ALLOW_MODULE_WISE_DAYS, false);

					if (moduleWiseDaysConfigAllowed && !tallyTRFAllowed)
						maxNoOfDaysAllowBeforeCashStmtEntry = (int) configuration.getOrDefault(ConfigParamPropertiesConstant.DAYS_FOR_MANUAL_LS, 0);
					else
						maxNoOfDaysAllowBeforeCashStmtEntry = (int) configuration.getOrDefault(ConfigParamPropertiesConstant.DEFAULT_DAYS_FOR_MANUAL_LS, 0);

					currentDate  = dateFormat.format(date.getTime());

					if(maxNoOfDaysAllowBeforeCashStmtEntry > 0)
						date = new Date(date.getTime() - (maxNoOfDaysAllowBeforeCashStmtEntry - 1)* MILLIS_IN_DAY);
					else {
						date = new Date(date.getTime() - MILLIS_IN_DAY);
						maxNoOfDaysAllowBeforeCashStmtEntry = 1;
					}

					request.setAttribute("maxNoOfDaysAllowBeforeCashStmtEntry", Integer.toString(maxNoOfDaysAllowBeforeCashStmtEntry));
					previousDate = dateFormat.format(date.getTime());
					request.setAttribute("previousDate", previousDate);
					request.setAttribute("currentDate", currentDate);
					request.setAttribute("PartyMasterDetails", CorporateAccountDao.getInstance().getPartyDetailsByExactName("JTC", executive.getAccountGroupId()));
				}
			}

			request.setAttribute("nextPageToken", "success");

			//Set Auto Party Save configuration (No/Yes)
			final var autoSavePartyConfigValue = cacheManip.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_AUTO_PARTY_SAVE_CONFIGURATION);

			if(autoSavePartyConfigValue == ConfigParam.CONFIG_KEY_AUTO_PARTY_SAVE_NOT_ALLOWED)
				request.setAttribute("isAutoPartySave", "false");
			else if(autoSavePartyConfigValue == ConfigParam.CONFIG_KEY_AUTO_PARTY_SAVE_ALLOWED)
				request.setAttribute("isAutoPartySave", "true");
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}
}
