package com.ivcargo.reports;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.StringJoiner;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.ObjectUtils;
import org.apache.commons.lang3.StringUtils;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.constant.properties.report.account.DueBillInformationCreditorWiseConfigurationConstant;
import com.iv.dao.impl.OnAccountDaoImpl;
import com.iv.dto.TallyIntegration;
import com.iv.dto.constant.ExecutiveTypeConstant;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.logsapp.LogWriter;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.constant.Constant;
import com.iv.utils.constant.DateTimeFormatConstant;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.exception.ExceptionProcess;
import com.iv.utils.utility.CollectionUtility;
import com.iv.utils.utility.Utility;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.reports.BillClearanceDAO;
import com.platform.dao.reports.BillInformationCreditorWiseDAO;
import com.platform.dto.BillClearance;
import com.platform.dto.Branch;
import com.platform.dto.CustomGroupMapper;
import com.platform.dto.SubRegion;
import com.platform.dto.configuration.mindateselection.ReportWiseMinDateSelectionConfigurationDTO;
import com.platform.dto.constant.BillTypeConstant;
import com.platform.dto.model.BillInformationCreditorWiseReport;
import com.platform.resource.CargoErrorList;

public class PaymentDueBillInformationBranchWiseReportAction implements Action {

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		Map<String,Object>		error			= null;
		Timestamp        		fromDate		= null;
		Timestamp        		toDate			= null;
		short					selectedView	= 0;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,(HashMap<String, Object>) error))
				return;

			new InitializePaymentDueBillInformationCreditorWiseReportAction().execute(request, response);

			final var	cache						= new CacheManip(request);
			final var	executive					= cache.getExecutive(request);
			final var	configuration				= ReadAllConfigurationsBllImpl.getInstance().getOldReportConfigurationData(ReportIdentifierConstant.DUE_BILL_CREDITOR_WISE, executive.getAccountGroupId());
			final var	showDropDownSelection		= configuration.getBoolean(DueBillInformationCreditorWiseConfigurationConstant.SHOW_DROP_DOWN_SELECTION,true);
			final var	partySearchWiseNewReport	= configuration.getBoolean(DueBillInformationCreditorWiseConfigurationConstant.PARTY_SEARCH_WISE_NEW_REPORT,false);
			final var	sortByBillDate				= configuration.getBoolean(DueBillInformationCreditorWiseConfigurationConstant.SORT_BY_BILL_DATE, false);
			final var	sortByParty					= configuration.getBoolean(DueBillInformationCreditorWiseConfigurationConstant.SORT_BY_PARTY, false);
			final var 	sortByBillNumber			= configuration.getBoolean(DueBillInformationCreditorWiseConfigurationConstant.SORT_BY_BILL_NUMBER, false);
			final var 	showOnAccountDetails		= configuration.getBoolean(DueBillInformationCreditorWiseConfigurationConstant.SHOW_ON_ACCOUNT_DETAILS, false);
			
			var	billType 					= JSPUtility.GetString(request,"billType");
			final var		branches			= cache.getGenericBranchesDetail(request);
			final var		subRegions			= cache.getAllSubRegions(request);
			//Map<Long, List<TallyIntegration>> partyWiseMap 		= null;

			if(showDropDownSelection) {
				selectedView	= JSPUtility.GetShort(request, "viewSelection", (short) 0);

				if(selectedView == 1) {
					fromDate	= DateTimeUtility.getStartOfDayTimeStamp(JSPUtility.GetString(request, Constant.FROM_DATE));
					toDate		= DateTimeUtility.getEndOfDayTimeStamp(JSPUtility.GetString(request, Constant.TO_DATE));
				}
			} else {
				fromDate	= DateTimeUtility.getStartOfDayTimeStamp(JSPUtility.GetString(request, "fromDate"));
				toDate		= DateTimeUtility.getEndOfDayTimeStamp(JSPUtility.GetString(request, Constant.TO_DATE));
			}

			final var	objectIn	= new ValueObject();

			final var	minDateTimeStamp					= cache.getReportWiseMinDateToGetData(request, executive.getAccountGroupId(),
					ReportWiseMinDateSelectionConfigurationDTO.DUE_BILL_CREDITOR_WISE_REPORT_MIN_DATE_ALLOW,
					ReportWiseMinDateSelectionConfigurationDTO.DUE_BILL_CREDITOR_WISE_REPORT_MIN_DATE);

			var	srcBranchId = JSPUtility.GetLong(request, "branch", 0);
			final var	regionId	= JSPUtility.GetLong(request, "region", 0);
			final var	subRegionId = JSPUtility.GetLong(request, "subRegion", 0);

			if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN) {
				request.setAttribute("subRegionForGroup", cache.getSubRegionsByRegionId(request, regionId, executive.getAccountGroupId()));
				request.setAttribute("subRegionBranches", cache.getBranchesBySubRegionId(request, executive.getAccountGroupId(), subRegionId));
			} else if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_REGIONADMIN) {
				request.setAttribute("subRegionForGroup", cache.getSubRegionsByRegionId(request, executive.getRegionId(), executive.getAccountGroupId()));
				request.setAttribute("subRegionBranches", cache.getBranchesBySubRegionId(request, executive.getAccountGroupId(), subRegionId));
			} else if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_SUBREGIONADMIN)
				request.setAttribute("subRegionBranches", cache.getBranchesBySubRegionId(request, executive.getAccountGroupId(), executive.getSubRegionId()));

			if(srcBranchId == 0)
				srcBranchId	= executive.getBranchId();

			final var	branchIds	= ActionStaticUtil.getBranchIds1(request, cache, executive);

			if(billType != null && Short.parseShort(billType) == Constant.INPUT_ALL_ID)
				billType = BillTypeConstant.NORMAL_BILL_TYPE_ID + "," + BillTypeConstant.SUPPLEMENTARY_BILL_TYPE_ID;

			if(fromDate != null)
				objectIn.put(Constant.FROM_DATE, fromDate);
			else
				objectIn.put(Constant.FROM_DATE, minDateTimeStamp);

			objectIn.put(Constant.TO_DATE, toDate);

			if(!branchIds.isEmpty())
				objectIn.put("branchIds", branchIds);

			objectIn.put("accountGroupId", executive.getAccountGroupId());
			objectIn.put("partyMasterId", JSPUtility.GetLong(request,"creditorId",0));

			if(configuration.getBoolean(DueBillInformationCreditorWiseConfigurationConstant.SHOW_SUPPLEMENTARY_BILL_DATA, false))
				objectIn.put("billType", BillTypeConstant.NORMAL_BILL_TYPE_ID + "," + BillTypeConstant.SUPPLEMENTARY_BILL_TYPE_ID );
			else
				objectIn.put("billType", billType != null ? billType : BillTypeConstant.NORMAL_BILL_TYPE_ID +"");


			final var whereClause	= getBillInformationCreditorWiseWhereClause(objectIn);

			var	reportModel = BillInformationCreditorWiseDAO.getInstance().getBillInformationCreditorWise(whereClause);

			ArrayList<TallyIntegration>	tallyIntegrationList  = null;
			if(showOnAccountDetails) {
				final var   onAccountwhereClause	= getOnAccountsWhereClause(branchIds, executive.getAccountGroupId(), fromDate, toDate, JSPUtility.GetLong(request,"creditorId",0));
				LogWriter.writeLog("", LogWriter.LOG_LEVEL_DEBUG, "onAccountwhereClause--- " + onAccountwhereClause);
				tallyIntegrationList  =	OnAccountDaoImpl.getInstance().getOnAccountDetailsByWhereClause(onAccountwhereClause);
			
				//if(ObjectUtils.isNotEmpty(tallyIntegrationList)){
					//partyWiseMap = tallyIntegrationList.stream().collect(Collectors.groupingBy(TallyIntegration::getPartyMasterId));
				//}
				//LogWriter.writeLog("", LogWriter.LOG_LEVEL_DEBUG, "partyWiseMap--- " + partyWiseMap);
			}
			
			if (ObjectUtils.isNotEmpty(tallyIntegrationList)) {

			    if (ObjectUtils.isEmpty(reportModel)) {
			        reportModel = new ArrayList<>();
			    }

			    for (TallyIntegration obj : tallyIntegrationList) {
			    	
			    	if (obj.getBalanceAmount() > 0) {
			    		BillInformationCreditorWiseReport billInfoObj = new BillInformationCreditorWiseReport();
			    		billInfoObj.setCreditorName(obj.getBillingPartyName());
			    		billInfoObj.setReceivedAmount(obj.getBalanceAmount());
			    		billInfoObj.setOnAccountId(obj.getOnAccountId());
			    		billInfoObj.setBillDateTime(obj.getCreationDateTimeStamp());
			    		billInfoObj.setCreditorId(obj.getPartyMasterId());
			    		billInfoObj.setBranchId(obj.getBranchId());
			    		billInfoObj.setOnAccountNumber(obj.getOnAccountNumber());
			    		billInfoObj.setBillId(obj.getOnAccountId());
			    		
			    		reportModel.add(billInfoObj);
			    	}
			    }
			}

			if (ObjectUtils.isNotEmpty(reportModel)) {
				Map<String, Map<Long, BillInformationCreditorWiseReport>>	creditorDataColl = new LinkedHashMap<>();

				final String billIdsStr = CollectionUtility.getStringFromLongSet(reportModel.stream().filter(item -> item.getOnAccountId() <= 0).map(BillInformationCreditorWiseReport::getBillId).collect(Collectors.toSet()));
				HashMap<Long, BillClearance>	billClrArr  =  null;
				
				if(StringUtils.isNotEmpty(billIdsStr)){
					billClrArr  = BillClearanceDAO.getInstance().getLimitedDetailsByBillIds(billIdsStr, "1,3");
				}

				for (final BillInformationCreditorWiseReport element : reportModel) {
					var	dataColl = creditorDataColl.get(element.getCreditorId() + "_" + element.getCreditorName());
					final var	branch = cache.getGenericBranchDetailCache(request, element.getBranchId());

					if(dataColl == null) {
						dataColl	= new LinkedHashMap<>();
						final var	model		= (BillInformationCreditorWiseReport) element.clone();
						model.setReceivedAmount(0);
						setExtraInformation(model, element, branch, branches, subRegions);

						if(billClrArr != null) {
							final var	bill = billClrArr.get(element.getBillId());

							if(bill != null)
								model.setReceivedAmount(bill.getTotalReceivedAmount());
						}

						if(element.getOnAccountId() > 0 && element.getReceivedAmount() > 0) {
							model.setReceivedAmount(model.getReceivedAmount() + element.getReceivedAmount());
						}
						dataColl.put(element.getBillId(), model);
						creditorDataColl.put(element.getCreditorId() + "_" + element.getCreditorName(), dataColl);
					} else {
						var	model = dataColl.get(element.getBillId());

						if(model == null) {
							model = (BillInformationCreditorWiseReport) element.clone();
							model.setReceivedAmount(0);
							setExtraInformation(model, element, branch, branches, subRegions);

							if(billClrArr != null) {
								final var	bill = billClrArr.get(element.getBillId());

								if(bill != null)
									model.setReceivedAmount(bill.getTotalReceivedAmount());
							}

							if(element.getOnAccountId() > 0 && element.getReceivedAmount() > 0) {
								model.setReceivedAmount(model.getReceivedAmount() + element.getReceivedAmount());
							}
							
							dataColl.put(element.getBillId(), model);
						} else
							model.setBranchId(branch.getBranchId());
					}
				}

				if(creditorDataColl != null && creditorDataColl.size() == 1 && partySearchWiseNewReport) {
					final var	dataColl	= creditorDataColl.get(creditorDataColl.keySet().toArray()[0]);

					final Comparator<Entry<Long, BillInformationCreditorWiseReport>> valueComparator =
							(e1, e2) -> Long.compare(e2.getValue().getNoOfDays(), e1.getValue().getNoOfDays());

							final HashMap<Long, BillInformationCreditorWiseReport> sortedMap =
									dataColl.entrySet().stream().sorted(valueComparator).
									collect(Collectors.toMap(Entry::getKey, Entry::getValue, (e1, e2) -> e1, LinkedHashMap::new));

							creditorDataColl.put(""+creditorDataColl.keySet().toArray()[0], sortedMap);
				} else if(sortByBillDate)
					for (final Map.Entry<String, Map<Long, BillInformationCreditorWiseReport>> outerEntry : creditorDataColl.entrySet()) {
						final var	dataColl	= outerEntry.getValue();

						final Map<Long, BillInformationCreditorWiseReport> sortedMap = dataColl.entrySet().stream()
								.sorted((e1, e2) -> e1.getValue().getBillDateTime().compareTo(e2.getValue().getBillDateTime()))
								.collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue, (e1, e2) -> e1, LinkedHashMap::new));

						creditorDataColl.put(outerEntry.getKey(), sortedMap);
					}
				else if(sortByBillNumber) {
					final List<String> dataCollKeys = new ArrayList<>(creditorDataColl.keySet());

					for (final String keys : dataCollKeys) {
						final var dataColl = creditorDataColl.get(keys);

						final Comparator<Map.Entry<Long, BillInformationCreditorWiseReport>> valueComparator = (e1,
								e2) -> {
									final var bn1 = e1.getValue().getBillNumber();
									final var bn2 = e2.getValue().getBillNumber();
									try {
										final var n1 = Long.parseLong(bn1);
										final var n2 = Long.parseLong(bn2);
										return Long.compare(n1, n2);
									} catch (final NumberFormatException e) {
										return bn1.compareTo(bn2);
									}
								};

								final HashMap<Long, BillInformationCreditorWiseReport> sortedMap = dataColl.entrySet()
										.stream().sorted(valueComparator).collect(Collectors.toMap(Map.Entry::getKey,
												Map.Entry::getValue, (e1, e2) -> e1, LinkedHashMap::new));

								creditorDataColl.put(keys, sortedMap);
					}
				}

				if (sortByParty) {
				    creditorDataColl = creditorDataColl.entrySet().stream()
				        .sorted(Comparator.comparing(
				            e -> e.getKey().split("_").length > 1 ? e.getKey().split("_")[1] : e.getKey(),
				            Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER)
				        ))
				        .collect(Collectors.toMap(
				            Map.Entry::getKey,
				            e -> e.getValue().entrySet().stream()
				                .sorted(Comparator.comparing(
				                    inner -> inner.getValue().getBillDateTime(),
				                    Comparator.nullsLast(Timestamp::compareTo)
				                ))
				                .collect(Collectors.toMap(
				                    Map.Entry::getKey, 
				                    Map.Entry::getValue, 
				                    (oldVal, newVal) -> oldVal, 
				                    LinkedHashMap::new)), // Maintains the Date order
				            (oldVal, newVal) -> oldVal,
				            LinkedHashMap::new // Maintains the Party order
				        ));
				}
				
				request.setAttribute("creditorDataColl", creditorDataColl);
				//request.setAttribute("partyWiseMap", partyWiseMap);
				request.setAttribute("selectedView", selectedView);
				request.setAttribute("partySearchWiseNewReport", partySearchWiseNewReport);
			} else {
				request.setAttribute("selectedView",selectedView);
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}

			ActionStaticUtil.setRequestAttribute(request,"customAddressBranchId", srcBranchId);
			ActionStaticUtil.setRequestAttribute(request,"customAddressIdentifer", CustomGroupMapper.IDENTIFIER_BOOKING);
			ActionStaticUtil.setReportViewModel(request);

			request.setAttribute("selectedView",selectedView);
			request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, (HashMap<String, Object>) error);
		}
	}

	private String getBillInformationCreditorWiseWhereClause(ValueObject objectIn) throws Exception {
		final var fromDate		= (Timestamp) objectIn.get(Constant.FROM_DATE);
		final var toDate		= (Timestamp) objectIn.get(Constant.TO_DATE);
		final var branchIds		= objectIn.getString("branchIds");
		final var billTypeIds	= objectIn.getString("billType");
		final var creditorId	= objectIn.getLong("partyMasterId");

		final var whereClause = new StringJoiner(" AND ");

		if (fromDate != null)
			whereClause.add("b.CreationDateTimeStamp >= '" + fromDate + "'");

		if(toDate != null)
			whereClause.add("b.CreationDateTimeStamp <= '" + toDate + "'");

		if(branchIds != null)
			whereClause.add("b.BranchId IN (" + branchIds + ")");

		whereClause.add("b.AccountGroupId = " + objectIn.getLong("accountGroupId", 0));
		whereClause.add("b.CustomerType = 1");
		whereClause.add("b.BillTypeId IN (" + billTypeIds + ")");

		if(creditorId > 0)
			whereClause.add("b.CreditorId = " + creditorId);

		whereClause.add("b.[Status] IN (1,3)");

		return whereClause.toString();
	}

	private void setExtraInformation(BillInformationCreditorWiseReport model, BillInformationCreditorWiseReport element, Branch branch, ValueObject branches, ValueObject subRegions) throws Exception {
		try {
			model.setBranchId(branch.getBranchId());
			model.setBranchName(branch.getName());

			final var	subRegion	= (SubRegion) subRegions.get(branch.getSubRegionId());

			model.setSubRegionName(subRegion != null ? subRegion.getName() : "");
			model.setGrandTotal(element.getGrandTotal() + element.getAdditionalCharge());
			model.setNoOfDays(DateTimeUtility.getDayDiffBetweenTwoDates(element.getBillDateTime(), DateTimeUtility.getCurrentTimeStamp()));
			model.setBillCoverLetterDateStr(DateTimeUtility.getDateFromTimeStamp(element.getBillCoverLetterDate(), DateTimeFormatConstant.DD_MM_YY));
			model.setBillCoverLetterNumber(Utility.checkedNullCondition(element.getBillCoverLetterNumber(), (short) 1));

			if(element.getBillCoverLetterBranchId() > 0) {
				final var	billCoverBranch = (Branch) branches.get(Long.toString(element.getBillCoverLetterBranchId()));
				model.setBillCoverLetterBranch(billCoverBranch.getName());
			} else
				model.setBillCoverLetterBranch("--");

			if(element.getBillTypeId() == BillTypeConstant.NORMAL_BILL_TYPE_ID)
				model.setBillTypeName(BillTypeConstant.NORMAL_BILL_TYPE_NAME);
			else if(element.getBillTypeId() == BillTypeConstant.SUPPLEMENTARY_BILL_TYPE_ID)
				model.setBillTypeName(BillTypeConstant.SUPPLEMENTARY_BILL_TYPE_NAME);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, PaymentDueBillInformationBranchWiseReportAction.class.getName());
		}
	}

	private String getOnAccountsWhereClause(final String branchIds,final long accountGroupId,final Timestamp fromDate,final Timestamp toDate, final long creditorId) throws Exception {

	    final var whereClause = getSJ();

	    whereClause.add("oa.BranchId IN (" + branchIds + ")");
	    whereClause.add("oa.AccountGroupId = " + accountGroupId);
	   
	    if(creditorId > 0)
			whereClause.add("oa.PartyMasterId = " + creditorId);
	 
	    whereClause.add("oa.CancelDateTime IS NULL");
	   
	    return whereClause.toString();
	}

	private StringJoiner getSJ() {
		return new StringJoiner(" AND ");
	}
}