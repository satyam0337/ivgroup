package com.ivcargo.actions.transport;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.StringJoiner;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.ObjectUtils;
import org.apache.commons.lang3.StringUtils;

import com.businesslogic.CreditPaymentModuleBLL;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.constant.properties.LRCreditConfigurationConstant;
import com.iv.dto.constant.BillSelectionConstant;
import com.iv.utils.CollectionUtility;
import com.iv.utils.constant.Constant;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.exception.ExceptionProcess;
import com.iv.utils.utility.ListFilterUtility;
import com.iv.utils.utility.SortUtils;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.reports.ReportView;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.CollectionPersonMasterDao;
import com.platform.dao.reports.CreditWayBillTxnClearanceSummaryDAO;
import com.platform.dao.reports.CreditorPaymentModuleDAO;
import com.platform.dto.AliasNameConstants;
import com.platform.dto.CollectionPersonMaster;
import com.platform.dto.TransportCommonMaster;
import com.platform.dto.configuration.mindateselection.ModuleWiseMinDateSelectionConfigurationDTO;
import com.platform.dto.constant.ExecutiveTypeConstant;
import com.platform.dto.model.CreditWayBillTxn;
import com.platform.dto.model.ReportViewModel;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

public class GetCreditPaymentModuleDataAction implements Action {

	private static final String TRACE_ID = GetCreditPaymentModuleDataAction.class.getName();

	@Override
	@SuppressWarnings("unchecked")
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	 						error 								= null;
		ValueObject										valueOutObject						= null;
		String											brancheIds							= null;
		short											customerType						= 0;
		var 											regionId    						= 0L;
		var 											subRegionId    						= 0L;
		var 											branchId							= 0L;
		var											isSearchByDate						= false;
		short											fiterForSearch						= 0;
		var											selectedCollectionId				= 0L;
		HashMap<Long, CollectionPersonMaster> 			collectionPersonHM					= null;
		final var	sdf1						= new 								SimpleDateFormat("dd-MM-yyyy");

		String											billSelectionTypeId					= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeCreditPaymentModuleAction().execute(request, response);

			final var	cManip			= new CacheManip(request);
			final var	executive   	= cManip.getExecutive(request);
			var	txnTypeId		= JSPUtility.GetShort(request, "txnType", (short)0);
			final var	wbNumber		= JSPUtility.GetString(request, "wbNumber","");
			final var	crNumber		= JSPUtility.GetString(request, "crNumber","");
			final var	singleBranchId	= JSPUtility.GetLong(request, "BranchId",0);
			final var	billSelectionType	=JSPUtility.GetShort(request,"billSelectionTypeId", (short)0);
			final var	sdf				= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			final var	typeOfSelection	=JSPUtility.GetShort(request,"typeOfSelection", (short)0);
			final var	moduleTypeId	=JSPUtility.GetShort(request,"moduleType", (short)0);
			final var	partyBranchId	= JSPUtility.GetLong(request, "partyBranchId", 0);

			final var	minDateTimeStamp		= cManip.getModuleWiseMinDateToGetData(request, executive.getAccountGroupId(),
					ModuleWiseMinDateSelectionConfigurationDTO.LR_CREDIT_PAYMENT_MIN_DATE_ALLOW,
					ModuleWiseMinDateSelectionConfigurationDTO.LR_CREDIT_PAYMENT_MIN_DATE);

			final var	lrCreditConfig						= (Map<Object, Object>) request.getAttribute(LRCreditConfigurationConstant.LR_CREDIT_CONFIGURATION);
			final var	searchByDateWhereClause				= (boolean) lrCreditConfig.getOrDefault(LRCreditConfigurationConstant.SEARCH_BY_DATE_WHERE_CLAUSE, false);

			if(JSPUtility.GetLong(request, "selectedCollectionPersonId",0) > 0){
				fiterForSearch 			= 1;
				selectedCollectionId	= JSPUtility.GetLong(request, "selectedCollectionPersonId");
			}

			final var	valueInObject = new ValueObject();

			if(JSPUtility.GetChecked(request, "DateRange")) {
				valueInObject.put(Constant.FROM_DATE, new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate1") + " 00:00:00").getTime()));
				valueInObject.put(Constant.TO_DATE, new Timestamp(sdf.parse(JSPUtility.GetString(request, "toDate1") + " 23:59:59").getTime()));
				isSearchByDate = true;
			} else if(JSPUtility.GetChecked(request, "searchByDate") && request.getParameter("fromDate") != null) {
				valueInObject.put(Constant.TO_DATE, new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate") + " 23:59:59").getTime()));
				isSearchByDate = true;
				valueInObject.put("upTodate", valueInObject.get(Constant.TO_DATE));
			}

			final var	allOptionInBranch					= (boolean) lrCreditConfig.getOrDefault(LRCreditConfigurationConstant.ALL_OPTION_IN_BRANCH, false);
			final var	isAllowStbsCreation					= (boolean) lrCreditConfig.getOrDefault(LRCreditConfigurationConstant.IS_ALLOW_STBS_CREATION, false);
			final var	showBillSelectionTypeId				= (boolean) lrCreditConfig.getOrDefault(LRCreditConfigurationConstant.SHOW_BILL_SELECTION_TYPE_ID, false);
			final var	allOptionInSubRegion				= (boolean) lrCreditConfig.getOrDefault(LRCreditConfigurationConstant.ALL_OPTION_IN_SUB_REGION, false);
			final var	allOptionInRegion					= (boolean) lrCreditConfig.getOrDefault(LRCreditConfigurationConstant.ALL_OPTION_IN_REGION, false);
			final var 	showPartyWiseOptionInMultipleClear	= (boolean) lrCreditConfig.getOrDefault(LRCreditConfigurationConstant.SHOW_PARTY_WISE_OPTION_IN_MULTIPLE_CLEAR, false);

			if(txnTypeId == CreditWayBillTxn.TXN_TYPE_BOOKING_ID)
				customerType = 1;
			else
				customerType = 2;

			final var	stbsFlag = (short) (isAllowStbsCreation ? 1 : 0);

			if(showBillSelectionTypeId)
				if(billSelectionType == BillSelectionConstant.BOTH)
					billSelectionTypeId = "0,1,2";
				else
					billSelectionTypeId = billSelectionType + "";

			if (StringUtils.isNotEmpty(wbNumber) && txnTypeId > 0)
				valueOutObject = CreditPaymentModuleBLL.getInstance().getCreditPaymentDataForSingleWayBill(executive.getAccountGroupId(), txnTypeId, wbNumber,(short)1, minDateTimeStamp,stbsFlag);
			else if(StringUtils.isNotEmpty(crNumber) && singleBranchId > 0) {
				txnTypeId	= 2;

				valueOutObject = CreditPaymentModuleBLL.getInstance().getCreditPaymentDataForSingleDeliveryWayBill(executive.getAccountGroupId(), txnTypeId, crNumber, minDateTimeStamp, singleBranchId,stbsFlag);
			} else {
				if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN) {
					regionId	= Long.parseLong(request.getParameter("region"));
					subRegionId = Long.parseLong(request.getParameter("subRegion"));
					branchId	= JSPUtility.GetLong(request, "branch", 0);

					// Get Combo values to restore
					request.setAttribute("subRegionForGroup", cManip.getSubRegionsByRegionId(request, regionId, executive.getAccountGroupId()));
					request.setAttribute("subRegionBranches", cManip.getBranchesBySubRegionId(request,executive.getAccountGroupId(), subRegionId));

					brancheIds = Long.toString(branchId);

				} else if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_REGIONADMIN) {
					regionId	= executive.getRegionId();
					subRegionId = Long.parseLong(request.getParameter("subRegion"));
					branchId	= JSPUtility.GetLong(request, "branch", 0);

					// Get Combo values to restore
					request.setAttribute("subRegionForGroup", cManip.getSubRegionsByRegionId(request, regionId, executive.getAccountGroupId()));
					request.setAttribute("subRegionBranches", cManip.getBranchesBySubRegionId(request, executive.getAccountGroupId(), subRegionId));

					brancheIds = Long.toString(branchId);

				} else if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_SUBREGIONADMIN) {
					regionId	= executive.getRegionId();
					subRegionId = executive.getSubRegionId();
					branchId	= JSPUtility.GetLong(request, "branch", 0);

					// Get Combo values to restore
					request.setAttribute("subRegionBranches", cManip.getBranchesBySubRegionId(request,executive.getAccountGroupId(), subRegionId));

					brancheIds = Long.toString(branchId);
				} else {
					regionId	= executive.getRegionId();
					subRegionId = executive.getSubRegionId();
					branchId	= executive.getBranchId();

					//Set Branches String through executive object
					brancheIds	= Long.toString(executive.getBranchId());
				}

				if(allOptionInRegion && regionId == 0 )
					brancheIds = cManip.getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_GROUP, executive.getAccountGroupId());
				else if(allOptionInSubRegion && subRegionId == 0 )
					brancheIds = cManip.getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_REGION, regionId);
				else if(allOptionInBranch && branchId == 0 )
					brancheIds = cManip.getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_SUBREGION, subRegionId);
				else if(showPartyWiseOptionInMultipleClear && typeOfSelection == 1 && moduleTypeId == 3)
					brancheIds = Long.toString(partyBranchId);

				valueInObject.put("filter", txnTypeId);
				valueInObject.put(AliasNameConstants.BRANCH_IDS, brancheIds);
				valueInObject.put("txnTypeId", txnTypeId);
				valueInObject.put("fiterForSearch", fiterForSearch);
				valueInObject.put("selectedCollectionId", selectedCollectionId);
				valueInObject.put("customerType", customerType);
				valueInObject.put(AliasNameConstants.MIN_DATE_TIMESTAMP, minDateTimeStamp);
				valueInObject.put(AliasNameConstants.ACCOUNTGROUP_ID, executive.getAccountGroupId());
				valueInObject.put("stbsFlag", stbsFlag);
				valueInObject.put("billSelectionTypeId", billSelectionTypeId);
				valueInObject.put(LRCreditConfigurationConstant.RECOVERY_BRANCH_WISE_BILL_CREATION_ALLOWED, (boolean) lrCreditConfig.getOrDefault(LRCreditConfigurationConstant.RECOVERY_BRANCH_WISE_BILL_CREATION_ALLOWED, false));

				if(request.getParameter("partyMasterId") != null)
					valueInObject.put("partyMasterId", request.getParameter("partyMasterId"));

				if(showBillSelectionTypeId) {
					if(isSearchByDate) {
						if(searchByDateWhereClause)
							valueOutObject	= getCreditPaymentDataByWhereClause(valueInObject);// checked all filter with sps
						else
							valueOutObject	= CreditPaymentModuleBLL.getInstance().getCreditPaymentDataBillSelectionByDate(valueInObject);
					} else if(searchByDateWhereClause)
						valueOutObject	= getCreditPaymentDataByWhereClause(valueInObject);//checking
					else
						valueOutObject	= CreditPaymentModuleBLL.getInstance().getCreditPaymentDataByBillSelection(valueInObject);
				} else if(isSearchByDate) {
					if(searchByDateWhereClause)
						valueOutObject	= getCreditPaymentDataByWhereClause(valueInObject);
					else
						valueOutObject	= CreditPaymentModuleBLL.getInstance().getCreditPaymentDataByDate(valueInObject);// this case also done
				} else if(searchByDateWhereClause)
					valueOutObject	= getCreditPaymentDataByWhereClause(valueInObject);
				else
					valueOutObject	= CreditPaymentModuleBLL.getInstance().getCreditPaymentData(valueInObject);// this 1 case also done
			}

			if(valueOutObject != null) {
				final var	creditWayBillTxn		= (CreditWayBillTxn[]) valueOutObject.get("CreditWayBillTxn");
				final var	collectionPersonIdArr 	= (Long[]) valueOutObject.get("collectionPersonIdArr");
				final var	creditWayBillTxnIdArray = (Long[]) valueOutObject.get("creditWayBillTxnIdArray");

				if(collectionPersonIdArr.length > 0) {
					final var	strCollectionPersonIds 	= CollectionUtility.getStringFromLongList(Arrays.asList(collectionPersonIdArr));

					if(!strCollectionPersonIds.isEmpty())
						collectionPersonHM 		= CollectionPersonMasterDao.getInstance().getCollectionPersonDetailsByIds(strCollectionPersonIds);
				}

				final List<CreditWayBillTxn>	creditWayBillTxnList	= ListFilterUtility.filterList(Arrays.asList(creditWayBillTxn), e -> e.getGrandTotal() > 0);

				if(creditWayBillTxnList.isEmpty()) {
					error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
					error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
					request.setAttribute("cargoError", error);
					return;
				}

				for (final CreditWayBillTxn element : creditWayBillTxnList) {
					if(collectionPersonHM != null && collectionPersonHM.get(element.getCollectionPersonId()) != null)
						element.setCollectionPersonName(Utility.checkedNullCondition(collectionPersonHM.get(element.getCollectionPersonId()).getName(), (short) 1));
					else
						element.setCollectionPersonName("--");

					if (element.getCreationDateTimeStamp() != null)
						element.setCreationDateTime(sdf1.format(element.getCreationDateTimeStamp()));
					else
						element.setCreationDateTime("--");

					element.setSourceBranch(cManip.getGenericBranchDetailCache(request,element.getSourceBranchId()).getName());
					element.setDestinationBranch(cManip.getGenericBranchDetailCache(request,element.getDestinationBranchId()).getName());
					element.setWayBillDeliveryNumber(Utility.checkedNullCondition(element.getWayBillDeliveryNumber(), (short) 1));
					element.setAccountGroupId(executive.getAccountGroupId());
				}

				if(ObjectUtils.isNotEmpty(creditWayBillTxnIdArray)) {
					final var	creditWayBillTxnIds				= CollectionUtility.getStringFromLongList(Arrays.asList(creditWayBillTxnIdArray));

					final var	valueObjectFromCreditWBTxn		= CreditWayBillTxnClearanceSummaryDAO.getInstance().getCreditWayBillTxnClearanceDetails(creditWayBillTxnIds);

					if(valueObjectFromCreditWBTxn != null)
						request.setAttribute("creditWayBillTxnClearanceSumHM", valueObjectFromCreditWBTxn.get("creditWayBillTxnClearanceSumHM"));
				}

				request.setAttribute("creditWayBillTxn", getCreditWayBillTxnListInSortedOrder(lrCreditConfig, creditWayBillTxnList));
			} else {
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}

			var	reportViewModel = new ReportViewModel();
			reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);
			request.setAttribute("ReportViewModel",reportViewModel);

			request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}
	}

	private List<CreditWayBillTxn> getCreditWayBillTxnListInSortedOrder(final Map<Object, Object> lrCreditConfig, final List<CreditWayBillTxn> creditWayBillTxnList) throws Exception {
		try {
			final var	ascSorting				= (boolean) lrCreditConfig.getOrDefault(LRCreditConfigurationConstant.ASC_SORTING, false);
			final var	descSorting				= (boolean) lrCreditConfig.getOrDefault(LRCreditConfigurationConstant.DESC_SORTING, false);

			if (!(boolean) lrCreditConfig.getOrDefault(LRCreditConfigurationConstant.NO_SORTING, false)) {
				if(descSorting)
					return SortUtils.sortListDesc(creditWayBillTxnList, CreditWayBillTxn::getCreationDateTimeStamp);

				if(ascSorting)
					return SortUtils.sortList(creditWayBillTxnList, CreditWayBillTxn::getCreationDateTimeStamp);
			}

			return creditWayBillTxnList;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private ValueObject getCreditPaymentDataByWhereClause(final ValueObject inValObj) throws Exception {
		try {
			final var	whereClause				= new StringJoiner(" AND ");
			final var	accountGroupId			= inValObj.getLong(AliasNameConstants.ACCOUNTGROUP_ID,0);
			final var	stbsFlag				= inValObj.getShort("stbsFlag",(short) 0);
			final var	txnTypeId				= inValObj.getShort("txnTypeId",(short) 0);
			final var	fromdate				= (Timestamp) inValObj.get(Constant.FROM_DATE);
			final var	todate					= (Timestamp) inValObj.get(Constant.TO_DATE);
			final var	minDate					= (Timestamp) inValObj.get(AliasNameConstants.MIN_DATE_TIMESTAMP);
			final var	brancheIds				= inValObj.getString(AliasNameConstants.BRANCH_IDS,"");
			final var	selectedCollectionId	= inValObj.getLong("selectedCollectionId",0);
			final var	billSelectionId			= Utility.getLong(inValObj.get("billSelectionTypeId"));
			final var	partyMasterId 			= inValObj.getLong("partyMasterId", 0);
			final var	recoveryBranchWiseBillCreationAllowed	= inValObj.getBoolean(LRCreditConfigurationConstant.RECOVERY_BRANCH_WISE_BILL_CREATION_ALLOWED,false);

			whereClause.add("cwbt.AccountGroupId = " + accountGroupId);
			whereClause.add("cwbt.IsStbsCreationAllow = " + stbsFlag);
			whereClause.add("cwbt.[Status] = 1");
			whereClause.add("cwbt.BillId IS NULL");
			whereClause.add("cwbt.ShrtCrdtCollLedgerId IS NULL");
			whereClause.add("cwbt.PaymentStatus IN (1,3)");

			if(billSelectionId > 0)
				whereClause.add("cs.BillSelectionId = " + billSelectionId);

			if(fromdate != null)
				whereClause.add("cwbt.CreationDateTimeStamp >= '" + fromdate + "'");
			else if(minDate != null)
				whereClause.add("cwbt.CreationDateTimeStamp >= '" + minDate + "'");

			if(todate != null)
				whereClause.add("cwbt.CreationDateTimeStamp <= '" + todate + "'");

			if(selectedCollectionId > 0)
				whereClause.add("CollectionPersonId = " + selectedCollectionId);
			else {
				if(StringUtils.isNotEmpty(brancheIds))
					if(recoveryBranchWiseBillCreationAllowed)
						whereClause.add("cwbt.RecoveryBranchId IN (" + brancheIds + ")");
					else
						whereClause.add("cwbt.BranchId IN (" + brancheIds + ")");

				if(partyMasterId > 0)
					whereClause.add("cwbt.PartyMasterId = " + partyMasterId);
			}

			if(txnTypeId == 0 || txnTypeId == 3)
				whereClause.add("cwbt.WayBillStatus IN (1,9)");

			if(txnTypeId == 1) {
				whereClause.add("cwbt.TxnTypeId = " + txnTypeId);
				whereClause.add("cwbt.WayBillStatus = 1");
			}

			if(txnTypeId == 2) {
				whereClause.add("cwbt.TxnTypeId = " + txnTypeId);
				whereClause.add("cwbt.WayBillStatus = 9");
			}

			return CreditorPaymentModuleDAO.getInstance().getCreditPaymentDataByWhereClause(whereClause.toString());
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}
}