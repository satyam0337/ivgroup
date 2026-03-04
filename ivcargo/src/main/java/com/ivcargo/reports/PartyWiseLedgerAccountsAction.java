package com.ivcargo.reports;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Comparator;
import java.util.Date;
import java.util.HashMap;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.ObjectUtils;
import org.apache.commons.lang3.StringUtils;

import com.businesslogic.properties.impl.PropertyConfigValueBLLImpl;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.constant.properties.partywiseledgeraccount.PartyWiseLedgerAccountPropertiesConstant;
import com.iv.dao.impl.bill.BillClearanceDaoImpl;
import com.iv.dao.impl.reports.account.PartyWiseLedgerAccountsReportDaoImpl;
import com.iv.dto.BillClearance;
import com.iv.dto.account.PartyWiseLedgerAccounts;
import com.iv.dto.constant.BillClearanceStatusConstant;
import com.iv.dto.constant.FeildPermissionsConstant;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.utility.CollectionUtility;
import com.iv.utils.utility.ListFilterUtility;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.CustomGroupMapper;
import com.platform.dto.PropertiesFileConstants;
import com.platform.dto.configuration.mindateselection.ReportWiseMinDateSelectionConfigurationDTO;
import com.platform.dto.configuration.modules.PartyWiseLedgerAccountsDTO;
import com.platform.dto.model.DayWiseDateModel;
import com.platform.dto.model.ReportViewModel;

public class PartyWiseLedgerAccountsAction implements Action {

	public static final String TRACE_ID = "PartyWiseLedgerAccountsAction";

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	 				error 							= null;
		Timestamp            					fromDate                       	= null;
		Timestamp            					toDate                         	= null;
		var										time							= 0;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializePartyWiseLedgerAccountsReportAction().execute(request, response);

			final var	cache			= new CacheManip (request);

			final var	partyMasterId = JSPUtility.GetLong(request,"creditorId",0);
			final var	executive 		= cache.getExecutive(request);

			final var	configuration			   				= PropertyConfigValueBLLImpl.getInstance().getConfiguration(executive, PropertiesFileConstants.PARTY_WISE_LEDGER_ACCOUNTS_CONFIG);
			final var	showBillDetailsCol						= configuration.getBoolean(PartyWiseLedgerAccountsDTO.SHOW_BILL_DETAILS_COL, false);
			final var	replaceCreditDebitLabels				= configuration.getBoolean(PartyWiseLedgerAccountsDTO.REPLACE_CREDIT_DEBIT_LABELS, false);
			final var	isShowBillPaymentEntriesWithColorCode	= configuration.getBoolean(PartyWiseLedgerAccountsDTO.IS_SHOW_BILL_PAYMENT_ENTRIES_WITH_COLOR_CODE, false);

			final var	reportWiseMinDateSelectionConfig	= cache.getReportWiseMinDateSelectionConfig(request, executive.getAccountGroupId());
			final var	execFldPermissions 					= cache.getExecutiveFieldPermission(request);

			final var	minDateTimeStamp	= cache.getReportWiseMinDateToGetData(request, executive.getAccountGroupId(),
					ReportWiseMinDateSelectionConfigurationDTO.UNBILLED_REGISTER_CREDITOR_WISE_REPORT_MIN_DATE_ALLOW,
					ReportWiseMinDateSelectionConfigurationDTO.UNBILLED_REGISTER_CREDITOR_WISE_REPORT_MIN_DATE);

			final var	allowCustomMinDate			= reportWiseMinDateSelectionConfig.getBoolean(ReportWiseMinDateSelectionConfigurationDTO.ALLOW_CUSTOM_MIN_DATE, false);

			request.setAttribute("showBillDetailsCol", showBillDetailsCol);
			request.setAttribute("replaceCreditDebitLabels", replaceCreditDebitLabels);
			request.setAttribute(PartyWiseLedgerAccountPropertiesConstant.SHOW_STBS_BILL_PRINT, configuration.getBoolean(PartyWiseLedgerAccountPropertiesConstant.SHOW_STBS_BILL_PRINT, false));

			final var	sdf			= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss.SSS");
			final var	newSdf      = new SimpleDateFormat("dd-MM-yyyy");

			time = JSPUtility.GetInt(request, "timeDuration");

			if(time == DayWiseDateModel.DAY_WISE_LAST_THIRTY_DAY_ID) {
				fromDate	= new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00.000").getTime());
				toDate		= new Timestamp(sdf.parse(JSPUtility.GetString(request, "toDate") + " 23:59:59.997").getTime());
			} else {
				final var	calCurrentDateTime 	= Calendar.getInstance();
				calCurrentDateTime.add(Calendar.DATE, -time);

				fromDate	= DateTimeUtility.getStartOfDayTimeStamp(DateTimeUtility.getDateFromTimeStamp(new Timestamp(calCurrentDateTime.getTimeInMillis())));
				toDate		= DateTimeUtility.getEndOfDayTimeStamp(DateTimeUtility.getDateFromTimeStamp(DateTimeUtility.getCurrentTimeStamp())) ;
			}

			if(allowCustomMinDate && execFldPermissions.get(FeildPermissionsConstant.ALLOW_TO_VIEW_OLD_DATA) == null)
				fromDate = minDateTimeStamp;

			var	reportModelList = PartyWiseLedgerAccountsReportDaoImpl.getInstance().getCashStatementReportData(partyMasterId, fromDate, toDate, executive.getAccountGroupId());

			if(ObjectUtils.isNotEmpty(reportModelList)) {
				reportModelList.forEach(r -> {
					final var ts = r.getCreationDateTime();

					if (ts != null)
						r.setCreationDateTime(DateTimeUtility.getCalendarTimeFromTimestamp(ts, 0, 0, 0, 0));
				});

				final var	sortedReportModelList = new ArrayList<PartyWiseLedgerAccounts>();

				for (final PartyWiseLedgerAccounts aReportModelList : reportModelList)
					if(aReportModelList.getIdentifier() == PartyWiseLedgerAccounts.IDENTIFIER_OPENING_BAL
					&& aReportModelList.getCreationDateTime() != fromDate) {
						final var	model= new PartyWiseLedgerAccounts();
						model.setPartyWiseLedgerAccountsID(aReportModelList.getPartyWiseLedgerAccountsID());
						model.setAccountGroupId(aReportModelList.getAccountGroupId());
						model.setCreationDateTime(aReportModelList.getCreationDateTime());
						model.setPartyMasterId(aReportModelList.getPartyMasterId());
						model.setPaymentTypeId(aReportModelList.getPaymentTypeId());
						model.setPaymentStatus(aReportModelList.getPaymentStatus());
						model.setDebitAmount(aReportModelList.getDebitAmount());
						model.setCreditAmount(aReportModelList.getCreditAmount());
						model.setCancelAmount(aReportModelList.getCancelAmount());
						model.setIdentifier(aReportModelList.getIdentifier());
						model.setRemark(aReportModelList.getRemark());
						model.setDetails(aReportModelList.getDetails());
						model.setBillId(aReportModelList.getBillId());
						model.setBillNumber(aReportModelList.getBillNumber());
						model.setCreditorName(aReportModelList.getCreditorName());
						model.setShortCreditCollnLedgerId(aReportModelList.getShortCreditCollnLedgerId());
						sortedReportModelList.add(model);
						break;
					}

				sortedReportModelList.addAll(reportModelList);

				final var	isOpeningAndClosingBalFound	= ListFilterUtility.isAnyMatchInList(sortedReportModelList, element -> element.getIdentifier() == PartyWiseLedgerAccounts.IDENTIFIER_OPENING_BAL || element.getIdentifier() == PartyWiseLedgerAccounts.IDENTIFIER_CLOSING_BAL);

				if(isShowBillPaymentEntriesWithColorCode) {
					final var	billPaymentHM	= sortedReportModelList.stream().filter(e -> e.getIdentifier() == PartyWiseLedgerAccounts.IDENTIFIER_BILLCLEARENCE).collect(Collectors.groupingBy(PartyWiseLedgerAccounts::getBillId));

					final var	billIdsList		= sortedReportModelList.stream().filter(e -> e.getIdentifier() == PartyWiseLedgerAccounts.IDENTIFIER_BILL)
							.map(PartyWiseLedgerAccounts::getBillId).toList();

					if(ObjectUtils.isNotEmpty(billIdsList)) {
						final var	billClearanceHM	= BillClearanceDaoImpl.getInstance().getBillClearanceDetailsByBillIds1(CollectionUtility.getStringFromLongList(billIdsList));

						if(ObjectUtils.isNotEmpty(billClearanceHM)) {
							billClearanceHM.keySet().stream().mapToLong(Long::valueOf).forEach((final var billId) -> {
								final var	billClearanceList	= billClearanceHM.get(billId);

								if(ObjectUtils.isNotEmpty(billClearanceList))
									billClearanceList.sort(Comparator.comparing(BillClearance:: getBillClearanceId).reversed());
							});

							for (final PartyWiseLedgerAccounts element : sortedReportModelList)
								if(element.getIdentifier() == PartyWiseLedgerAccounts.IDENTIFIER_BILL)
									billClearanceHM.keySet().stream().mapToLong(Long::valueOf).forEach((final var billId) -> {
										final var	billClearanceArrList = billClearanceHM.get(billId);

										if(ObjectUtils.isNotEmpty(billClearanceArrList))
											for (final BillClearance element2 : billClearanceArrList)
												if(element.getBillId() == element2.getBillClearanceBillId())  {
													element.setClearBillPayment(billClearanceArrList.get(0).getBillClearanceStatus() == BillClearanceStatusConstant.BILL_CLEARANCE_STATUS_CLEAR_PAYMENT_ID
															|| billClearanceArrList.get(0).getBillClearanceStatus() == BillClearanceStatusConstant.BILL_CLEARANCE_STATUS_NEGOTIATED_ID);
													element.setPartialBillPayment(billClearanceArrList.get(0).getBillClearanceStatus() == BillClearanceStatusConstant.BILL_CLEARANCE_STATUS_PARTIAL_PAYMENT_ID);
												}
									});
						}
					}

					if(ObjectUtils.isNotEmpty(billPaymentHM)) {
						billPaymentHM.keySet().stream().mapToLong(Long::valueOf).forEach((final var billId) -> {
							final var	billPaymentList	= billPaymentHM.get(billId);

							if(ObjectUtils.isNotEmpty(billPaymentList))
								billPaymentList.sort(Comparator.comparing(PartyWiseLedgerAccounts:: getPartyWiseLedgerAccountsID).reversed());
						});

						for (final PartyWiseLedgerAccounts element : sortedReportModelList)
							if(element.getIdentifier() == PartyWiseLedgerAccounts.IDENTIFIER_BILLCLEARENCE) {
								final var	billPaymentList	= billPaymentHM.get(element.getBillId());

								if(ObjectUtils.isNotEmpty(billPaymentList)) {
									element.setClearBillPayment(billPaymentList.get(0).getPaymentStatus() == BillClearanceStatusConstant.BILL_CLEARANCE_STATUS_CLEAR_PAYMENT_ID
											|| billPaymentList.get(0).getPaymentStatus() == BillClearanceStatusConstant.BILL_CLEARANCE_STATUS_NEGOTIATED_ID);
									element.setPartialBillPayment(billPaymentList.get(0).getPaymentStatus() == BillClearanceStatusConstant.BILL_CLEARANCE_STATUS_PARTIAL_PAYMENT_ID);
								}
							}
					}
				}

				if(!isOpeningAndClosingBalFound)
					sortedReportModelList.addAll(PartyWiseLedgerAccountsReportDaoImpl.getInstance().getLastOpeningOrClosingBalancePartyWiseLedgerByPartyId(partyMasterId, fromDate, toDate, executive.getAccountGroupId()));

				sortedReportModelList.forEach((final PartyWiseLedgerAccounts element) -> {
					element.setDescription(PartyWiseLedgerAccounts.getIdentifierDesc(element.getIdentifier())) ;
					element.setUserDateTime(newSdf.format(element.getCreationDateTime()));

					if(StringUtils.contains(element.getRemark(), "Payment Mode"))
						element.setDescription(element.getDescription() + "( " + element.getRemark() + ")");
				});

				request.setAttribute("reportModelList",sortedReportModelList);
			} else {
				reportModelList = PartyWiseLedgerAccountsReportDaoImpl.getInstance().getLastOpeningOrClosingBalancePartyWiseLedgerByPartyId(partyMasterId, fromDate, toDate, executive.getAccountGroupId());

				if(ObjectUtils.isNotEmpty(reportModelList)) {
					reportModelList.get(0).setIdentifier(PartyWiseLedgerAccounts.IDENTIFIER_OPENING_BAL);
					reportModelList.get(0).setDescription(PartyWiseLedgerAccounts.getIdentifierDesc(PartyWiseLedgerAccounts.IDENTIFIER_OPENING_BAL));
					reportModelList.get(0).setUserDateTime(newSdf.format(new Date(System.currentTimeMillis())));
					reportModelList.get(0).setDetails("This is Logical Opening Balance");
					request.setAttribute("reportModelList",reportModelList);
				} else
					request.setAttribute("cargoError", error);
			}

			ActionStaticUtil.setRequestAttribute(request,"customAddressBranchId", executive.getBranchId());
			ActionStaticUtil.setRequestAttribute(request,"customAddressIdentifer", CustomGroupMapper.IDENTIFIER_BOOKING);

			var	reportViewModel = new ReportViewModel();
			reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);

			request.setAttribute("accountGroupNameForPrint", reportViewModel.getAccountGroupName());
			request.setAttribute("ReportViewModel",reportViewModel);
			request.setAttribute("nextPageToken", "success");
			request.setAttribute("fromDate",fromDate);
			request.setAttribute("toDate", toDate);

		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}
}
