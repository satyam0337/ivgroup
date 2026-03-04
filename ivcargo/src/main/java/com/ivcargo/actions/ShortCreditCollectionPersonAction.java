package com.ivcargo.actions;

import java.sql.Timestamp;
import java.util.Arrays;

//~--- non-JDK imports --------------------------------------------------------

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringUtils;

import com.businesslogic.ShortCreditCollectionSheetBLL;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.constant.properties.STBSConfigurationConstant;
import com.iv.dto.constant.BillSelectionConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.constant.Constant;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.utility.CollectionUtility;
import com.iv.utils.utility.ListFilterUtility;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.CollectionPersonMasterDao;
import com.platform.dao.ConsignmentSummaryDao;
import com.platform.dao.CustomerDetailsDao;
import com.platform.dao.WayBillDao;
import com.platform.dao.reports.CreditWayBillTxnClearanceSummaryDAO;
import com.platform.dto.AliasNameConstants;
import com.platform.dto.CollectionPersonMaster;
import com.platform.dto.ConsignmentSummary;
import com.platform.dto.CustomerDetails;
import com.platform.dto.ShortCreditCollectionBillClearanceDto;
import com.platform.dto.WayBill;
import com.platform.dto.configuration.mindateselection.ModuleWiseMinDateSelectionConfigurationDTO;
import com.platform.dto.constant.ExecutiveTypeConstant;
import com.platform.dto.model.CreditWayBillTxn;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

public class ShortCreditCollectionPersonAction implements Action {

	public static final String TRACE_ID = ShortCreditCollectionPersonAction.class.getName();

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String, Object>	 					error 							= null;
		String										brancheIds						= null;
		ValueObject									valueInObject					= null;
		String										strCollectionPersonIds			= null;
		HashMap<Long, CollectionPersonMaster>		collectionPersonHM				= null;
		Timestamp									fromDate						= null;
		Timestamp									toDate							= null;
		short										stbsFlag						= 0;
		String										billSelectionTypeId				= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request, error))
				return;

			new InitializeShortCreditCollectionSheet().execute(request, response);

			final var	cManip					= new CacheManip(request);
			final var	executive				= cManip.getExecutive(request);

			final var	isSelectedFilter 	= request.getParameter("selectionFilter") != null;

			final var minDateTimeStamp		= cManip.getModuleWiseMinDateToGetData(request, executive.getAccountGroupId(),
					ModuleWiseMinDateSelectionConfigurationDTO.STBS_CREATION_MIN_DATE_ALLOW,
					ModuleWiseMinDateSelectionConfigurationDTO.STBS_CREATION_MIN_DATE);

			final var	wbNumber			= request.getParameter("WBNumber");
			final short		txnTypeId			= Utility.getShort(request.getParameter("txnType"));
			final var 	billSelectionType	= JSPUtility.GetShort(request,"billSelectionTypeId", (short)0);
			final var 	selectiontypeId		= JSPUtility.GetShort(request, "selectiontype", (short)0);

			final var configuration								= cManip.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.STBS);
			final var 	isShowBothOptionInBranchWiseSelection				= (boolean) configuration.getOrDefault(STBSConfigurationConstant.IS_SHOW_BOTH_OPTION_IN_BRANCH_WISE_SELECTION, false);
			final var 	isShowBothOptionInLrNumberWiseSelection				= (boolean) configuration.getOrDefault(STBSConfigurationConstant.IS_SHOW_BOTH_OPTION_IN_LR_NUMBER_WISE_SELECTION, false);
			var 		isAllowStbsCreationWithFlagOne						= (boolean) configuration.getOrDefault(STBSConfigurationConstant.IS_ALLOW_STBS_CREATION_WITH_FLAG_ONE, false);
			final var	shortCreditCollectionSheetModuleUsingWhereClause 	= (boolean) configuration.getOrDefault(STBSConfigurationConstant.SHOW_CREDIT_COLLECTIONSHEET_MODULE_USING_WHERE_CLAUSE, false);
			final var	showBookingDateInAnyCondition						= (boolean) configuration.getOrDefault(STBSConfigurationConstant.SHOW_BOOKING_DATE_IN_ANY_CONDITION, false);
			final var 	isAllowStbsCreationWithFlagOneBySubRegionArr		= CollectionUtility.getLongListFromString((String) configuration.getOrDefault(STBSConfigurationConstant.IS_ALLOW_STBS_CREATION_WITH_FLAG_ONE_BY_SUBREGION_ID, "0"));
			final var 	allowToCreateSTBSforSameBranch						= (boolean) configuration.getOrDefault(STBSConfigurationConstant.ALLOW_TO_CREATE_STBS_FOR_SAME_BRANCH, false);

			isAllowStbsCreationWithFlagOne = isAllowStbsCreationWithFlagOne && (isAllowStbsCreationWithFlagOneBySubRegionArr.contains(executive.getSubRegionId())
					|| isAllowStbsCreationWithFlagOneBySubRegionArr.isEmpty());

			if(txnTypeId != 0 && executive != null) {
				valueInObject = new ValueObject();

				valueInObject.put(AliasNameConstants.MIN_DATE_TIMESTAMP, minDateTimeStamp);

				if(!isSelectedFilter) {
					if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN) {
						final var	regionId	= Long.parseLong(request.getParameter("region"));
						final var	subRegionId = Long.parseLong(request.getParameter("subRegion"));
						final var	branchId	= JSPUtility.GetLong(request, "branch", 0);

						// Get Combo values to restore
						request.setAttribute("subRegionForGroup", cManip.getSubRegionsByRegionId(request, regionId, executive.getAccountGroupId()));
						request.setAttribute("subRegionBranches", cManip.getBranchesBySubRegionId(request, executive.getAccountGroupId(), subRegionId));

						if(branchId == 0) {
							final var branchArr 	= cManip.getBranchesArrayBySubRegionId(request, executive.getAccountGroupId(), subRegionId);

							if(branchArr != null)
								brancheIds = Stream.of(branchArr).map(e -> Long.toString(e.getBranchId())).collect(Collectors.joining(Constant.COMMA));
						} else
							brancheIds = Long.toString(branchId);
					} else if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_REGIONADMIN) {
						final var	regionId	= executive.getRegionId();
						final var	subRegionId = Long.parseLong(request.getParameter("subRegion"));
						final var	branchId	= JSPUtility.GetLong(request, "branch", 0);

						// Get Combo values to restore
						request.setAttribute("subRegionForGroup", cManip.getSubRegionsByRegionId(request, regionId, executive.getAccountGroupId()));
						request.setAttribute("subRegionBranches", cManip.getBranchesBySubRegionId(request, executive.getAccountGroupId(), subRegionId));

						if(branchId == 0) {
							final var branchArr = cManip.getBranchesArrayBySubRegionId(request, executive.getAccountGroupId(), subRegionId);

							if(branchArr != null)
								brancheIds = Stream.of(branchArr).map(e -> Long.toString(e.getBranchId())).collect(Collectors.joining(Constant.COMMA));
						} else
							brancheIds = Long.toString(branchId);

					} else if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_SUBREGIONADMIN) {
						final var	subRegionId = executive.getSubRegionId();
						final var	branchId	= JSPUtility.GetLong(request, "branch", 0);

						// Get Combo values to restore
						request.setAttribute("subRegionBranches", cManip.getBranchesBySubRegionId(request, executive.getAccountGroupId(), subRegionId));

						if(branchId == 0) {
							final var branchArr = cManip.getBranchesArrayBySubRegionId(request, executive.getAccountGroupId(), subRegionId);

							if(branchArr != null)
								brancheIds = Stream.of(branchArr).map(e -> Long.toString(e.getBranchId())).collect(Collectors.joining(Constant.COMMA));
						} else
							brancheIds = Long.toString(branchId);
					} else
						//Set Branches String through executive object
						brancheIds	= Long.toString(executive.getBranchId());

					valueInObject.put(AliasNameConstants.BRANCH_IDS, brancheIds);
				}

				// During LR Wise Search
				if(isSelectedFilter) {
					if(isShowBothOptionInLrNumberWiseSelection) {
						if(txnTypeId == 1 || txnTypeId == 2)
							valueInObject.put(Constant.FILTER, (short)3);
						else
							valueInObject.put(Constant.FILTER, (short)12);
					} else {
						if(isAllowStbsCreationWithFlagOne)
							stbsFlag = 1;

						valueInObject.put(Constant.FILTER, (short)3);
					}
				} else if(!isShowBothOptionInBranchWiseSelection || txnTypeId == 1 || txnTypeId == 2)
					valueInObject.put(Constant.FILTER, txnTypeId);
				else
					valueInObject.put(Constant.FILTER, (short)11);

				if(selectiontypeId == 3)
					valueInObject.put(Constant.FILTER, (short)4);

				if(selectiontypeId == 4)
					valueInObject.put(Constant.FILTER, (short)8);

				if(selectiontypeId == 3 && txnTypeId == 3)
					valueInObject.put(Constant.FILTER, (short)9);

				if(request.getParameter(Constant.FROM_DATE) != null)
					fromDate 	= DateTimeUtility.getStartOfDayTimeStamp(JSPUtility.GetString(request, Constant.FROM_DATE));

				if(request.getParameter(Constant.TO_DATE) != null)
					toDate 		= DateTimeUtility.getEndOfDayTimeStamp(JSPUtility.GetString(request, Constant.TO_DATE));

				if(fromDate != null && toDate != null)
					valueInObject.put(Constant.FILTER, (short)5);

				if(selectiontypeId == 3 && fromDate != null && toDate != null)
					valueInObject.put(Constant.FILTER, (short)6);

				if(selectiontypeId == 4 && fromDate != null && toDate != null)
					valueInObject.put(Constant.FILTER, (short)7);

				if(selectiontypeId == 4 && minDateTimeStamp != null)
					valueInObject.put(Constant.FILTER, (short)5);

				if(selectiontypeId == 3 && txnTypeId == 3 && minDateTimeStamp != null)
					valueInObject.put(Constant.FILTER, (short)9);

				if(selectiontypeId == 3 && txnTypeId == 3 && fromDate != null && toDate != null)
					valueInObject.put(Constant.FILTER, (short)10);

				if(billSelectionType > 0)
					if(billSelectionType == BillSelectionConstant.BOTH)
						billSelectionTypeId = "0,1,2" ;
					else
						billSelectionTypeId  = billSelectionType + "";

				valueInObject.put(Constant.CORPORATE_ACCOUNT_ID, JSPUtility.GetLong(request, "partyId", 0));
				valueInObject.put(Constant.FROM_DATE, fromDate);
				valueInObject.put(Constant.TO_DATE, toDate);
				valueInObject.put(Constant.TXN_TYPE_ID, txnTypeId);
				valueInObject.put("isSelectedFilter", isSelectedFilter);
				valueInObject.put(Constant.WAYBILL_NUMBER, wbNumber);
				valueInObject.put(Constant.ACCOUNT_GROUP_ID, executive.getAccountGroupId());
				valueInObject.put(Constant.COLLECTION_PERSON_ID, JSPUtility.GetLong(request, "collPersonId",0));
				valueInObject.put("isAllowStbsCreationWithFlagOne", isAllowStbsCreationWithFlagOne);
				valueInObject.put("stbsFlag", stbsFlag);
				valueInObject.put("shortCreditCollectionSheetModuleUsingWhereClause", shortCreditCollectionSheetModuleUsingWhereClause);
				valueInObject.put("billSelectionTypeId", billSelectionTypeId);

				request.setAttribute("showBookingDateInAnyCondition", showBookingDateInAnyCondition);

				final var valueOutObject	= ShortCreditCollectionSheetBLL.getInstance().getShortCreditSheetBillData(valueInObject);

				if(valueOutObject != null) {
					var creditWayBillTxn			= (CreditWayBillTxn[]) valueOutObject.get("CreditWayBillTxn");
					var wayBillIdArray				= (Long[]) valueOutObject.get("WayBillIdArray");
					final var collectionPersonIdArr = (Long[]) valueOutObject.get("collectionPersonIdArr");

					if (allowToCreateSTBSforSameBranch) {
						final List<CreditWayBillTxn> filteredCreditWaybillTxnList = ListFilterUtility.filterList(Arrays.asList(creditWayBillTxn), element -> executive.getBranchId() == element.getBranchId());

						if (filteredCreditWaybillTxnList.isEmpty()) {
							returnError(request, error);
							return;
						}

						creditWayBillTxn = filteredCreditWaybillTxnList.toArray(new CreditWayBillTxn[0]);
						wayBillIdArray 	 = filteredCreditWaybillTxnList.stream().map(CreditWayBillTxn::getWayBillId).toArray(Long[]::new);
					}

					final var lrIds 	= CollectionUtility.getLongArrayToString(wayBillIdArray);

					if(collectionPersonIdArr.length > 0) {
						strCollectionPersonIds 	= CollectionUtility.getLongArrayToString(collectionPersonIdArr);
						collectionPersonHM 		= CollectionPersonMasterDao.getInstance().getCollectionPersonDetailsByIds(strCollectionPersonIds);
					}

					final Map<Long, CustomerDetails>		consignorColl 		= CustomerDetailsDao.getInstance().getConsignorDetailsByWayBillId(lrIds);
					final Map<Long, CustomerDetails>		consigneeColl 		= CustomerDetailsDao.getInstance().getConsigneeDetailsByWayBillId(lrIds);
					final Map<Long, ConsignmentSummary>		consignmentSmryHM 	= ConsignmentSummaryDao.getInstance().getLimitedConsignmentDetails(lrIds);
					final Map<Long, WayBill>				wayBillHM	 		= WayBillDao.getInstance().getLimitedLRDetails(lrIds);

					for (final CreditWayBillTxn element : creditWayBillTxn) {
						if(collectionPersonHM != null && collectionPersonHM.get(element.getCollectionPersonId()) != null)
							element.setCollectionPersonName(collectionPersonHM.get(element.getCollectionPersonId()).getName());
						else
							element.setCollectionPersonName("--");

						final var	consignor 	= consignorColl.get(element.getWayBillId());
						final var	consignee 	= consigneeColl.get(element.getWayBillId());
						final var	cSummary 	= consignmentSmryHM.get(element.getWayBillId());
						final var	wayBill		= wayBillHM.get(element.getWayBillId());

						if(consignor == null || consignee == null)
							continue;

						element.setConsignor(consignor.getName());
						element.setConsignorId(consignor.getCorporateAccountId());
						element.setConsignee(consignee.getName());
						element.setConsigneeId(consignee.getCorporateAccountId());
						element.setActualWeight(cSummary.getActualWeight());
						element.setQuantity(cSummary.getQuantity());
						element.setSourceBranch(cManip.getGenericBranchDetailCache(request, element.getSourceBranchId()).getName());
						element.setDestinationBranch(cManip.getGenericBranchDetailCache(request,element.getDestinationBranchId()).getName());
						element.setWayBillTypeId(wayBill.getWayBillTypeId());
					}

					final var creditWayBillTxnIds = Stream.of(creditWayBillTxn).filter(e -> e.getPaymentStatus() == ShortCreditCollectionBillClearanceDto.STBS_CLEARANCE_STATUS_PARTIAL_PAYMENT_ID)
							.map(e -> Long.toString(e.getCreditWayBillTxnId())).collect(Collectors.joining(Constant.COMMA));

					if(!StringUtils.isEmpty(creditWayBillTxnIds))
						request.setAttribute("CollHshmp", CreditWayBillTxnClearanceSummaryDAO.getInstance().getCreditWayBillTxnSummaryByCreditWayBillTxnIds(creditWayBillTxnIds));

					request.setAttribute("creditWayBillTxn", creditWayBillTxn);
					request.setAttribute("wayBillNumber", wbNumber);
				} else
					returnError(request, error);
			} else
				returnError(request, error);

			request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}

	public void returnError(final HttpServletRequest request ,final HashMap<String, Object> error) throws Exception {
		try {
			error.put("errorCode", CargoErrorList.NO_RECORDS);
			error.put("errorDescription", CargoErrorList.NO_RECORDS_DESCRIPTION);
			request.setAttribute("cargoError", error);
		} catch (final Exception e) {
			e.printStackTrace();
			throw e;
		}
	}
}
