package com.ivcargo.actions;

import java.sql.Timestamp;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.ShortCreditCollectionSheetSettlementBLL;
import com.businesslogic.moneyrecipt.MoneyReciptTxnBLL;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.constant.properties.STBSConfigurationConstant;
import com.iv.constant.properties.STBSSettlementConfigurationConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.constant.Constant;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.waybill.MoneyReceiptTxnDao;
import com.platform.dto.AliasNameConstants;
import com.platform.dto.Executive;
import com.platform.dto.MoneyReceiptTxnSequence;
import com.platform.dto.ShortCreditCollectionSheetSettlementDto;
import com.platform.dto.configuration.mindateselection.ModuleWiseMinDateSelectionConfigurationDTO;
import com.platform.dto.constant.ExecutiveTypeConstant;
import com.platform.resource.CargoErrorList;

public class ShortCreditCollectionSheetSettlementBillDataAction implements Action {
	public static final String TRACE_ID = ShortCreditCollectionSheetSettlementBillDataAction.class.getName();

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {

		HashMap<String,Object>				error 						= null;
		String 								billNumber					= null;
		var									collctnPersonId				= 0L;
		var 								branchId					= 0L;
		Timestamp							fromDate					= null;
		Timestamp							toDate						= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	executive 		= (Executive) request.getSession().getAttribute(AliasNameConstants.EXECUTIVE);

			if(executive != null && (request.getParameter("billType") != null || !"".equals(request.getParameter("selectedCollectionPersonId")))
					|| !"".equals(request.getParameter("branch"))){

				new InitializeShortCreditCollectionSheetSettlement().execute(request, response);

				final var	cache						= new CacheManip(request);
				final var	inValueObject 				= new ValueObject();
				final var	shortCreditSettlementBll 	= new ShortCreditCollectionSheetSettlementBLL();
				final var	stbsConfiguration				= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.STBS);
				final var	stbsSettlementConfig			= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.STBS_SETTLEMENT);
				final var	isMoneyReceiptRequired				= (boolean) stbsSettlementConfig.getOrDefault(STBSSettlementConfigurationConstant.IS_MONEY_RECEIPT_REQUIRED,false);
				final var	allowSubregionWiseSequenceCounter 	= (boolean) stbsConfiguration.getOrDefault(STBSConfigurationConstant.ALLOW_SUBREGION_WISE_SEQUENCE_COUNTER,false);

				final var	isSearchByDate 		= request.getParameter("DateRange") != null;

				if(isSearchByDate) {
					if(request.getParameter(Constant.FROM_DATE) != null)
						fromDate 	= DateTimeUtility.getStartOfDayTimeStamp(JSPUtility.GetString(request, Constant.FROM_DATE));

					if(request.getParameter(Constant.TO_DATE) != null)
						toDate 		= DateTimeUtility.getEndOfDayTimeStamp(JSPUtility.GetString(request, Constant.TO_DATE));
				}

				final var	minDateTimeStamp		= cache.getModuleWiseMinDateToGetData(request, executive.getAccountGroupId(),
						ModuleWiseMinDateSelectionConfigurationDTO.STBS_SETTLEMENT_MIN_DATE_ALLOW,
						ModuleWiseMinDateSelectionConfigurationDTO.STBS_SETTLEMENT_MIN_DATE);

				final var				billType = JSPUtility.GetShort(request, "billType", (short) 0);

				switch (billType) {
				case ShortCreditCollectionSheetSettlementDto.SHORT_CREDIT_SETTLEMENT_BILL_TYPE_BILL_NUMBER -> billNumber 		= request.getParameter("billNumber");
				case ShortCreditCollectionSheetSettlementDto.SHORT_CREDIT_SETTLEMENT_BILL_TYPE_COLLECTION_PERSON -> collctnPersonId = JSPUtility.GetLong(request, "selectedCollectionPersonId", 0);
				case ShortCreditCollectionSheetSettlementDto.SHORT_CREDIT_SETTLEMENT_BILL_TYPE_BRANCH -> {
					if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN
							|| executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_REGIONADMIN
							|| executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_SUBREGIONADMIN)
						branchId 		= JSPUtility.GetLong(request, "branch", 0);
					else
						branchId		= executive.getBranchId();
				}
				default -> {
					break;
				}
				}

				if(allowSubregionWiseSequenceCounter
						&& billType == ShortCreditCollectionSheetSettlementDto.SHORT_CREDIT_SETTLEMENT_BILL_TYPE_BILL_NUMBER)
					branchId = JSPUtility.GetLong(request, "billBranchId",0);

				final HashMap<?, ?>	execFldPermissions	= cache.getExecutiveFieldPermission(request);

				if(billNumber != null || collctnPersonId > 0 || branchId > 0) {
					inValueObject.put(AliasNameConstants.BILL_NUMBER, billNumber);
					inValueObject.put(AliasNameConstants.COLLECTION_PERSON_ID, collctnPersonId);
					inValueObject.put(AliasNameConstants.BRANCH_ID, branchId);
					inValueObject.put(AliasNameConstants.EXECUTIVE, executive);
					inValueObject.put("branchesColl", cache.getGenericBranchesDetail(request));
					inValueObject.put(AliasNameConstants.MIN_DATE_TIMESTAMP, minDateTimeStamp);
					inValueObject.put("execFldPermissions", execFldPermissions);
					inValueObject.put("allowSubregionWiseSequenceCounter", allowSubregionWiseSequenceCounter);
					inValueObject.put(Constant.FROM_DATE, fromDate);
					inValueObject.put(Constant.TO_DATE, toDate);
					inValueObject.put("stbsSettlementConfig", cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.STBS_SETTLEMENT));

					final var	valueOutObject = shortCreditSettlementBll.getShortCreditCollecionSheetSettlementData(inValueObject);

					if(valueOutObject != null)
						request.setAttribute("shortLedgerDto", valueOutObject.get("shortLedgerDto"));
					else {
						error.put("errorCode", CargoErrorList.NO_RECORDS);
						error.put("errorDescription", CargoErrorList.NO_RECORDS_DESCRIPTION);
						request.setAttribute("cargoError", error);
					}
				}

				if(isMoneyReceiptRequired){
					final var	moneyReceiptTxnSequence =new MoneyReceiptTxnSequence();
					final var	moneyReciptTxnBLL		=new MoneyReciptTxnBLL();

					moneyReciptTxnBLL.createDTOMoneyReceiptSequnce(moneyReceiptTxnSequence, executive);
					final var	moneyReceiptTxnSequenceOut = MoneyReceiptTxnDao.getInstance().getMoneyReceiptSequence(moneyReceiptTxnSequence);

					if(moneyReceiptTxnSequenceOut == null){
						error.put("errorMissing", CargoErrorList.MR_SEQUENCE_COUNTER_MISSING_DESCRIPTION);
						request.setAttribute("cargoError", error);
					}
				}

				request.setAttribute("nextPageToken", "success");
			} else
				request.setAttribute("nextPageToken", "needlogin");
		} catch (final Exception _e) {
			ActionStaticUtil.catchActionException(request, _e, error);
		}

	}
}