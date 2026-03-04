package com.ivcargo.reports;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.ObjectUtils;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.platform.dao.reports.PartyWiseLedgerAccountsDAO;
import com.platform.dto.CustomGroupMapper;
import com.platform.dto.Executive;
import com.platform.dto.PartyWiseLedgerAccounts;
import com.platform.dto.configuration.modules.PartyWiseOutstandingConfigurationDTO;
import com.platform.dto.model.ReportViewModel;
import com.platform.utils.PropertiesUtility;

public class PartyWiseOutstandingAction implements Action {

	public static final String TRACE_ID = "PartyWiseOutstandingAction";

	private static final String REPORT_MODEL_LIST			= "reportModelList";
	private static final String PARTY_MASTER_ID_WISE_HM		= "partyMasterIdWiseHM";

	@Override
	@SuppressWarnings("unchecked")
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>				 	error 					= null;
		Timestamp							 	fromDate				= null;
		Timestamp							 	toDate					= null;
		final var								showBillClearanceLink	 = false;
		ValueObject								valueObject				= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	executive	= (Executive)request.getSession().getAttribute("executive");
			final var	sdf			= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss.SSS");

			final var	isViewAllData = request.getParameter("viewAll") != null;

			final var	configuration		= ReadAllConfigurationsBllImpl.getInstance().getOldReportConfigurationData(ReportIdentifierConstant.PARTY_WISE_OUTSTANDING_REPORT, executive.getAccountGroupId());

			if(!isViewAllData) {
				fromDate	= new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate")+" 00:00:00.000").getTime());
				toDate		= new Timestamp(sdf.parse(JSPUtility.GetString(request, "toDate")+" 23:59:59.997").getTime());
				valueObject	= getValuesFromDBUsingThreadWithDate(fromDate, toDate, executive.getAccountGroupId());
			} else
				valueObject	= getValuesFromDBUsingThread(executive.getAccountGroupId());

			final Map<String, PartyWiseLedgerAccounts>	partyWiseDataColl = new TreeMap<>();

			if(valueObject != null) {
				final var	reportModelList		= (List<PartyWiseLedgerAccounts>) valueObject.get(REPORT_MODEL_LIST);
				final var	partyMasterIdWiseHM	= (Map<Long, PartyWiseLedgerAccounts>) valueObject.get(PARTY_MASTER_ID_WISE_HM);

				if(ObjectUtils.isNotEmpty(reportModelList))
					reportModelList.forEach((final PartyWiseLedgerAccounts element) -> {
						element.setPartyExpenseExists(partyMasterIdWiseHM != null && partyMasterIdWiseHM.get(element.getPartyMasterId()) != null);

						partyWiseDataColl.put(element.getPartyName() + "_" + element.getPartyMasterId(), element);
					});
			}

			if(!partyWiseDataColl.isEmpty())
				request.setAttribute("partyWiseDataColl", partyWiseDataColl);
			else
				request.setAttribute("cargoError", error);

			ActionStaticUtil.setRequestAttribute(request,"customAddressBranchId", executive.getBranchId());
			ActionStaticUtil.setRequestAttribute(request,"customAddressIdentifer", CustomGroupMapper.IDENTIFIER_BOOKING);

			var	reportViewModel = new ReportViewModel();
			reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);

			//request.setAttribute(PartyWiseOutstandingConfigurationDTO.DATA_FOR_SHOW_DATE_FOR_REPORT, isShowDateForReport);
			request.setAttribute(PartyWiseOutstandingConfigurationDTO.SHOW_PARTY_NUMBER_COLUMN, PropertiesUtility.isAllow(configuration.get(PartyWiseOutstandingConfigurationDTO.SHOW_PARTY_NUMBER_COLUMN)+""));
			request.setAttribute(PartyWiseOutstandingConfigurationDTO.SHOW_BILL_CLEARANCE_LINK, showBillClearanceLink);
			request.setAttribute(PartyWiseOutstandingConfigurationDTO.SHOW_PARTY_EXPENSE_CLEARENCE_LINK, configuration.getBoolean(PartyWiseOutstandingConfigurationDTO.SHOW_PARTY_EXPENSE_CLEARENCE_LINK));
			request.setAttribute(PartyWiseOutstandingConfigurationDTO.REPLACE_CREDIT_DEBIT_LABELS, configuration.getBoolean(PartyWiseOutstandingConfigurationDTO.REPLACE_CREDIT_DEBIT_LABELS));
			request.setAttribute(PartyWiseOutstandingConfigurationDTO.SHOW_DETAILS_LINK, configuration.getBoolean(PartyWiseOutstandingConfigurationDTO.SHOW_DETAILS_LINK));

			request.setAttribute("accountGroupNameForPrint", reportViewModel.getAccountGroupName());
			request.setAttribute("ReportViewModel",reportViewModel);
			request.setAttribute("nextPageToken", "success");

		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}

	private ValueObject getValuesFromDBUsingThread(final long accountGroupId) throws Exception{
		try {
			final var	valueOutObject = new ValueObject();

			final Thread	partyWiseOutStandingThread = new Thread(){
				@Override
				public void run(){
					try {
						valueOutObject.put(REPORT_MODEL_LIST, PartyWiseLedgerAccountsDAO.getInstance().getAllPartyWiseOutstandingDetails(accountGroupId));
					} catch (final Exception e) {
						e.printStackTrace();
					}
				}
			};

			final Thread	partyExpenseVoucherThread = new Thread(){
				@Override
				public void run(){
					try {
						valueOutObject.put(PARTY_MASTER_ID_WISE_HM, PartyWiseLedgerAccountsDAO.getInstance().getAllPartyWiseDetailsForExpenseVoucherPayment(accountGroupId));
					} catch (final Exception e) {
						e.printStackTrace();
					}
				}
			};

			partyWiseOutStandingThread.start();
			partyExpenseVoucherThread.start();
			partyWiseOutStandingThread.join();
			partyExpenseVoucherThread.join();
			return valueOutObject;
		} catch (final Exception e) {
			e.printStackTrace();
			throw e;
		}
	}

	private ValueObject getValuesFromDBUsingThreadWithDate(final Timestamp fromDate, final Timestamp toDate, final long accountGroupId) throws Exception {
		try {
			final var	valueOutObject = new ValueObject();

			final Thread	partyWiseOutStandingThread = new Thread() {
				@Override
				public void run() {
					try {
						valueOutObject.put(REPORT_MODEL_LIST, PartyWiseLedgerAccountsDAO.getInstance().getPartyWiseOutstandingData(fromDate, toDate, accountGroupId));
					} catch (final Exception e) {
						e.printStackTrace();
					}
				}
			};

			final Thread	partyExpenseVoucherThread = new Thread(){
				@Override
				public void run(){
					try {
						valueOutObject.put(PARTY_MASTER_ID_WISE_HM, PartyWiseLedgerAccountsDAO.getInstance().getAllPartyWiseDetailsForExpenseVoucherPayment(accountGroupId));
					} catch (final Exception e) {
						e.printStackTrace();
					}
				}
			};

			partyWiseOutStandingThread.start();
			partyExpenseVoucherThread.start();
			partyWiseOutStandingThread.join();
			partyExpenseVoucherThread.join();
			return valueOutObject;
		} catch (final Exception e) {
			e.printStackTrace();
			throw e;
		}
	}
}
