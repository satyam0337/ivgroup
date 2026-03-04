package com.ivcargo.reports;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringUtils;

import com.businesslogic.FundTransferBLL;
import com.businesslogic.bankpayment.BankPaymentBLL;
import com.businesslogic.properties.GeneralConfiguration;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.dto.constant.PaymentTypeConstant;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.constant.Constant;
import com.iv.utils.constant.FundTransferTypeConstant;
import com.iv.utils.constant.properties.FundTransferPropertiesConstant;
import com.iv.utils.constant.properties.ServerIPAddressConfigurationConstant;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.BankAccountDao;
import com.platform.dao.ExecutiveDao;
import com.platform.dao.FundTransferSequenceCounterDao;
import com.platform.dto.BankPayment;
import com.platform.dto.ConfigParam;
import com.platform.dto.Executive;
import com.platform.dto.FundTransfer;
import com.platform.dto.configuration.modules.BankStatementConfigurationDTO;
import com.platform.dto.configuration.modules.CashStatementConfigurationDTO;
import com.platform.dto.configuration.modules.DocumentCodeConfigurationDTO;
import com.platform.dto.constant.FeildPermissionsConstant;
import com.platform.resource.CargoErrorList;
import com.platform.utils.TokenGenerator;

public class FundTransferAction implements Action {

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	 			error 											= null;
		String								fundTransferNumber								= null;
		String								previousDate									= null;
		BankPayment							bankPayment										= null;
		BankPayment							toBankPayment									= null;
		Executive   						branchExecutive 								= null;
		String								token											= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			var			createDate 			= DateTimeUtility.getCurrentTimeStamp();
			final var	cache		 		= new CacheManip(request);
			final var	executive 			= cache.getExecutive(request);
			final var	valueInObject		= new ValueObject();
			final var	filter 				= JSPUtility.GetInt(request, "filter", 0);
			final var	toBranchId			= JSPUtility.GetLong(request, "toBranchId", 0);
			token							= JSPUtility.GetString(request, "token", "");
			final var loggedInBranch 		= cache.getExecutiveBranch(request, executive.getBranchId());

			if(toBranchId > 0)
				branchExecutive		= ExecutiveDao.getInstance().getExecutiveByBranchId(toBranchId);

			final var toBranchDetails 			= toBranchId > 0 ? cache.getGenericBranchDetailCache(request, toBranchId) : null;

			final Map<Long, ?>		execFeildPermission	= cache.getExecutiveFieldPermission(request);
			final var	srcBranch			= cache.getGenericBranchDetailCache(request, executive.getBranchId());

			final var	fundTransferConfig			= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.FUND_TRANSFER);
			final var	documentCodeConfig			= cache.getDocumentCodeConfiguration(request, executive.getAccountGroupId());

			final var	generalConfiguration					= cache.getGeneralConfiguration(request, executive.getAccountGroupId());
			final var	bankStatementConfig						= cache.getBankStatementConfiguration(request, executive.getAccountGroupId());
			var			bankPaymentOperationRequired			= generalConfiguration.getBoolean(GeneralConfiguration.BANK_PAYMENT_OPERATION_REQUIRED, false);
			final var	doNotAllowBankPayment					= (boolean) fundTransferConfig.getOrDefault(FundTransferPropertiesConstant.DO_NOT_ALLOW_BANK_PAYMENT,false);
			final var	centralizeBankToBranchFundTransfer		= (boolean) fundTransferConfig.getOrDefault(FundTransferPropertiesConstant.CENTRALIZE_BANK_TO_BRANCH_FUND_TRANSFER, false);
			final var	tokenWiseCheckingForDuplicateTransaction= (boolean) fundTransferConfig.getOrDefault(FundTransferPropertiesConstant.TOKEN_WISE_CHECKING_FOR_DUPLICATE_TRANSACTION, false);
			final var	isBlockSameRegionFundTransferAndReceive	= (boolean) fundTransferConfig.getOrDefault(FundTransferPropertiesConstant.IS_BLOCK_SAME_REGION_FUND_RANSFER_AND_RECEIVE, false);
			final var blockedRegionIdsStr 					= String.valueOf(fundTransferConfig.getOrDefault(FundTransferPropertiesConstant.REGIONS_TO_BLOCK_SAME_REGION_FUND_RANSFER_AND_RECEIVE, "")	);

			final Set<Long> regionsToBlockSameRegionFundTransferAndReceive = Arrays.stream(blockedRegionIdsStr.split(",")) .map(String::trim).filter(s -> !s.isEmpty()).map(Long::parseLong).collect(Collectors.toSet());

			if(doNotAllowBankPayment && bankPaymentOperationRequired)
				bankPaymentOperationRequired = false;

			if(execFeildPermission.get(FeildPermissionsConstant.ALLOW_BACK_DATE_IN_FUND_TRANSFER) != null) {
				final var	noOfDays 	= cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_MAX_DAYS_OF_OPERATION_BEFORE_CASHSTATEMENT_ENTRY_ID);
				final var	fromDateStr	= JSPUtility.GetString(request, "fromDate", null);

				if(fromDateStr != null)
					createDate	= DateTimeUtility.getChequeDateTime(fromDateStr);

				previousDate	= DateTimeUtility.getDateBeforeNoOfDays(noOfDays);
			}

			final var	documentCodeWiseFundTransferSeqCounter			= documentCodeConfig.getBoolean(DocumentCodeConfigurationDTO.DOCUMENT_CODE_WISE_FUND_TRANSFER_SEQ_COUNTER, false);
			final var	customDocumentCode								= documentCodeConfig.getBoolean(DocumentCodeConfigurationDTO.CUSTOM_DOCUMENT_CODE, false);
			final var	documentCodeForFundTransferSeqCounter			= documentCodeConfig.getInt(DocumentCodeConfigurationDTO.DOCUMENT_CODE_FOR_FUND_TRANSFER_SEQ_COUNTER, 0);

			switch (filter) {
			case 1 -> {
				final var	fundTransfer = new FundTransfer();
				fundTransfer.setTransferType(Short.parseShort(request.getParameter("transferType")));

				if(tokenWiseCheckingForDuplicateTransaction) {
					if(token == null || !token.equals(request.getSession().getAttribute(TokenGenerator.FUND_TRANSFER_TOKEN_KEY))) {
						error.put("errorCode", CargoErrorList.FUND_TRANSFER_ERROR);
						error.put("errorDescription", CargoErrorList.FUND_TRANSFER_ERROR_DESCRIPTION);
						request.setAttribute("cargoError", error);
						request.setAttribute("nextPageToken", "failure");
						return;
					}

					request.getSession().setAttribute(TokenGenerator.FUND_TRANSFER_TOKEN_KEY, null);
				}

				if(Short.parseShort(request.getParameter(Constant.STATUS)) == FundTransferTypeConstant.FUNDTRANSFER_STATUS_TRANSFERING) {
					final var	fundTransferSequenceCounter = FundTransferSequenceCounterDao.getInstance().getFundTransferSequenceCounter(executive.getAccountGroupId());

					if(fundTransferSequenceCounter == null) {
						error.put(CargoErrorList.ERROR_CODE, CargoErrorList.FUNDTRANSFER_NUMBER_NOT_VALID_ERROR);
						error.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.FUNDTRANSFER_NUMBER_NOT_VALID_DESCRIPTION);
						request.setAttribute("cargoError", error);
						request.setAttribute("nextPageToken", "failure");
						return;
					}

					if(documentCodeWiseFundTransferSeqCounter) {
						if(customDocumentCode)
							fundTransferNumber	= documentCodeForFundTransferSeqCounter + "/" + srcBranch.getBranchCode() + "/" + fundTransferSequenceCounter.getFundTransferNumber();
						else
							fundTransferNumber	= srcBranch.getBranchCode() + "-" + documentCodeForFundTransferSeqCounter + "/" + fundTransferSequenceCounter.getFundTransferNumber();
					} else
						fundTransferNumber	= Long.toString(fundTransferSequenceCounter.getFundTransferNumber());

					fundTransfer.setFundTransferNumber(fundTransferNumber);
				}

				fundTransfer.setFromBranchId(executive.getBranchId());
				fundTransfer.setToBranchId(toBranchId);
				fundTransfer.setAccountGroupId(executive.getAccountGroupId());

				if(fundTransfer.getFromBranchId() == fundTransfer.getToBranchId() && centralizeBankToBranchFundTransfer && fundTransfer.getTransferType() != FundTransferTypeConstant.FUND_TRANSFER_TYPE_BANK_TO_BRANCH ) {
					error.put(CargoErrorList.ERROR_CODE, CargoErrorList.FUNDTRANSFER_SOURCE_AND_DESTINATION_BRANCH_SAME_ERROR);
					error.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.FUNDTRANSFER_SOURCE_AND_DESTINATION_BRANCH_SAME_ERROR_DESCRIPTION);
					request.setAttribute("cargoError", error);
					request.setAttribute("nextPageToken", "failure");
					return;
				}

				if (isBlockSameRegionFundTransferAndReceive && toBranchDetails != null  && loggedInBranch.getRegionId() == toBranchDetails.getRegionId() && regionsToBlockSameRegionFundTransferAndReceive.contains(loggedInBranch.getRegionId())) {
					error.put(CargoErrorList.ERROR_CODE,CargoErrorList.FUNDTRANSFER_SOURCE_AND_DESTINATION_REGION_SAME_ERROR);
					error.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.FUNDTRANSFER_SOURCE_AND_DESTINATION_REGION_SAME_ERROR_DESCRIPTION);
					request.setAttribute("cargoError", error);
					request.setAttribute("nextPageToken", "failure");
					return;
				}

				if(centralizeBankToBranchFundTransfer && fundTransfer.getTransferType() == FundTransferTypeConstant.FUND_TRANSFER_TYPE_BANK_TO_BRANCH && branchExecutive != null && branchExecutive.getExecutiveId() > 0)
					fundTransfer.setExecutiveId(branchExecutive.getExecutiveId());
				else
					fundTransfer.setExecutiveId(executive.getExecutiveId());

				fundTransfer.setActualExecutiveId(executive.getExecutiveId());
				fundTransfer.setBranchId(executive.getBranchId());
				fundTransfer.setDateTimeStamp(createDate);
				fundTransfer.setAmount(JSPUtility.GetDouble(request, "amount", 0.00));
				fundTransfer.setStatus(Short.parseShort(request.getParameter(Constant.STATUS)));
				fundTransfer.setPaymentMode(Short.parseShort(request.getParameter(Constant.PAYMENT_MODE)));

				final var	paymentCheckBox			= JSPUtility.GetString(request, "paymentCheckBox","");
				final var	topaymentCheckBox		= JSPUtility.GetString(request, "topaymentCheckBox","");
				final var	bankAccountId			= JSPUtility.GetLong(request, "accountNumber_primary_key",0);

				if(!StringUtils.isEmpty(StringUtils.trim(paymentCheckBox))) {
					final var			valObjIn	= new ValueObject();

					valObjIn.put(Constant.PAYMENT_VALUES, paymentCheckBox);
					valObjIn.put(ModuleIdentifierConstant.MODULE_ID, ModuleIdentifierConstant.FUND_TRANSFER);
					valObjIn.put(Constant.PAYMENT_TYPE, fundTransfer.getPaymentMode());
					bankPayment		= BankPaymentBLL.getInstance().createBankPaymentDto(valObjIn, executive);

					if(execFeildPermission != null && execFeildPermission.get(FeildPermissionsConstant.ALLOW_BANK_TO_BANK_TRANSFER) != null
							&& fundTransfer.getTransferType() == FundTransferTypeConstant.FUND_TRANSFER_TYPE_BANK_TO_BANK && bankPaymentOperationRequired && !StringUtils.isEmpty(StringUtils.trim(topaymentCheckBox))) {
						valObjIn.put(Constant.PAYMENT_VALUES, topaymentCheckBox);
						toBankPayment		= BankPaymentBLL.getInstance().createBankPaymentDto(valObjIn, executive);
						toBankPayment.setChequeDate(fundTransfer.getDateTimeStamp());
					}
				}

				if(bankPayment != null) {
					if(bankPayment.getChequeDate() == null)
						fundTransfer.setChequeDate(fundTransfer.getDateTimeStamp());

					fundTransfer.setAccountId(bankPayment.getBankAccountId());
					fundTransfer.setChequeNumber(BankPaymentBLL.getChequeNumber(bankPayment));

					valueInObject.put(BankPayment.BANK_PAYMENT, bankPayment);
					valueInObject.put(BankStatementConfigurationDTO.BANK_STATEMENT_CONFIGURATION, bankStatementConfig);

					if(toBankPayment != null)
						valueInObject.put(BankPayment.TO_BANK_PAYMENT, toBankPayment);
				} else {
					if(fundTransfer.getPaymentMode() == PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID) {
						fundTransfer.setChequeDate(DateTimeUtility.getChequeDateTime(JSPUtility.GetString(request, Constant.CHEQUE_DATE)));
						fundTransfer.setChequeNumber(JSPUtility.GetString(request, Constant.CHEQUE_NUMBER));
					}

					fundTransfer.setAccountId(JSPUtility.GetLong(request, "bankNameId", 0));

					if(bankAccountId > 0)
						fundTransfer.setAccountId(bankAccountId);
				}

				if(toBankPayment != null)
					fundTransfer.setAccountId(toBankPayment.getBankAccountId());

				fundTransfer.setRemark(JSPUtility.GetString(request, Constant.REMARK, ""));

				if(fundTransfer.getTransferType() == FundTransferTypeConstant.FUND_TRANSFER_TYPE_BANK_TO_BRANCH)
					fundTransfer.setToBranchId(centralizeBankToBranchFundTransfer && branchExecutive != null && branchExecutive.getExecutiveId() > 0 ? toBranchId : executive.getBranchId());

				fundTransfer.setFromBranchName(cache.getBranchById(request, executive.getAccountGroupId(), executive.getBranchId()).getName());

				if(fundTransfer.getToBranchId() > 0)
					fundTransfer.setToBranchName(cache.getBranchById(request, executive.getAccountGroupId(), fundTransfer.getToBranchId()).getName());

				if(fundTransfer.getTransferType() == FundTransferTypeConstant.FUND_TRANSFER_TYPE_USER_TO_USER) {
					fundTransfer.setFromExecutiveId(executive.getExecutiveId());
					fundTransfer.setToExecutiveId(JSPUtility.GetLong(request, "toUserId", 0));
					fundTransfer.setFromExecutiveName(executive.getName());

					if(fundTransfer.getToExecutiveId() > 0) {
						final var	toExecutive = ExecutiveDao.getInstance().getExecutiveMasterById(fundTransfer.getToExecutiveId());
						fundTransfer.setToExecutiveName(toExecutive.getName());
					}
				}

				valueInObject.put("fundTransfer", fundTransfer);
				valueInObject.put(Executive.EXECUTIVE, executive);
				valueInObject.put(GeneralConfiguration.BANK_PAYMENT_OPERATION_REQUIRED, bankPaymentOperationRequired);

				if(bankPaymentOperationRequired && StringUtils.isEmpty(StringUtils.trim(paymentCheckBox)) && bankAccountId > 0) {
					final var	bankAcount = BankAccountDao.getInstance().getBankAccountDetailsByBankAccountId(bankAccountId);

					bankPayment = new BankPayment();
					bankPayment.setIdentifier(ModuleIdentifierConstant.FUND_TRANSFER);
					bankPayment.setBranchId(executive.getBranchId());
					bankPayment.setAccountGroupId(executive.getAccountGroupId());
					bankPayment.setChequeDate(createDate);
					bankPayment.setChequeAmount(JSPUtility.GetDouble(request, "amount", 0.00));
					bankPayment.setIssueBankId(bankAccountId);
					bankPayment.setIssueBank(bankAcount.getName());
					bankPayment.setMobileNumber(bankAcount.getPhoneNumber());
					bankPayment.setBankAccountId(bankAccountId);
					bankPayment.setPaymentType(Short.parseShort(request.getParameter(Constant.PAYMENT_MODE)));

					valueInObject.put(BankPayment.BANK_PAYMENT, bankPayment);
					valueInObject.put("bankAccountId", bankAccountId);
					valueInObject.put(BankStatementConfigurationDTO.BANK_STATEMENT_CONFIGURATION, bankStatementConfig);
				}

				valueInObject.put(FundTransferPropertiesConstant.FUND_TRANSFER_PROPERTY, fundTransferConfig);
				valueInObject.put(CashStatementConfigurationDTO.CASH_STATEMENT_CONFIGURATION, cache.getCashStatementConfiguration(request, executive.getAccountGroupId()));
				valueInObject.put(FundTransferPropertiesConstant.CENTRALIZE_BANK_TO_BRANCH_FUND_TRANSFER, centralizeBankToBranchFundTransfer);
				valueInObject.put(ServerIPAddressConfigurationConstant.SERVER_IP_ADDRESS, cache.getConfiguration(request, ModuleIdentifierConstant.SERVER_IP_ADDRESS));
				valueInObject.put(FundTransferPropertiesConstant.IS_BLOCK_SAME_REGION_FUND_RANSFER_AND_RECEIVE, isBlockSameRegionFundTransferAndReceive);
				valueInObject.put("regionsToBlockSameRegionFundTransferAndReceive", regionsToBlockSameRegionFundTransferAndReceive);

				request.setAttribute("toBranchDetails", toBranchDetails);
				request.setAttribute("loggedInBranch", loggedInBranch);

				final var	fundTransferId = FundTransferBLL.getInstance().fundTransferProcess(valueInObject);

				if(fundTransferId > 0) {
					request.setAttribute("fundTransferId", fundTransferId);
					request.setAttribute("fundTransferNumber", fundTransferNumber);
					request.setAttribute(FundTransferPropertiesConstant.ALLOW_FUND_TRANFER_PRINT, (boolean) fundTransferConfig.getOrDefault(FundTransferPropertiesConstant.ALLOW_FUND_TRANFER_PRINT, false));
				} else {
					error.put(CargoErrorList.ERROR_CODE, CargoErrorList.BILL_CLEARANCE_ERROR);
					error.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.BILL_CLEARANCE_ERROR_DESCRIPTION);
					request.setAttribute("cargoError", error);
					request.setAttribute("nextPageToken", "failure");
				}
			}
			default -> {
				break;
			}
			}

			request.setAttribute("previousDate", previousDate);
			request.setAttribute("nextPageToken", "success");
			request.setAttribute("execFeildPermission", execFeildPermission);
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}
	}
}