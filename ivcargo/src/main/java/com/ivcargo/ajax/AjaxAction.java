package com.ivcargo.ajax;

import java.io.PrintWriter;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.StringJoiner;
import java.util.TreeMap;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.BooleanUtils;
import org.apache.commons.lang3.ObjectUtils;
import org.json.JSONArray;
import org.json.JSONObject;

import com.businesslogic.AjaxInterfaceBLL;
import com.businesslogic.CorporateAccountBLL;
import com.businesslogic.RateMasterBLL;
import com.businesslogic.ddm.DDMGetData;
import com.businesslogic.ddmSettlement.DDMSettlementGetData;
import com.businesslogic.generic.CommonBLL;
import com.framework.Action;
import com.iv.bll.impl.OperationLockingBllImpl;
import com.iv.bll.impl.loadingsheet.LoadingSheetToTripSheetBllImpl;
import com.iv.bll.impl.master.PartyNumberTypeMapBllImpl;
import com.iv.bll.impl.master.VehicleNumberMasterBllImpl;
import com.iv.bll.impl.properties.DisplayDataConfigurationBllImpl;
import com.iv.cache.RedisCache;
import com.iv.cache.impl.RedisCacheImpl;
import com.iv.constant.properties.DDMConfigurationConstant;
import com.iv.constant.properties.GenerateCashReceiptPropertiesConstant;
import com.iv.constant.properties.GroupConfigurationPropertiesConstant;
import com.iv.constant.properties.HeaderConfigurationConstant;
import com.iv.constant.properties.PartyToPartyConfigPropertiesConstant;
import com.iv.convertor.DataObjectConvertor;
import com.iv.convertor.JsonConvertor;
import com.iv.dao.impl.DeliveryRunSheetLedgerDaoImpl;
import com.iv.dao.impl.PartyBranchMapDaoImpl;
import com.iv.dao.impl.master.CorporateAccountDaoImpl;
import com.iv.dao.impl.master.PartyToPartyConfigMasterDaoImpl;
import com.iv.dao.impl.master.deliveryrate.DeliveryRateMasterDaoImpl;
import com.iv.dto.constant.BillClearanceStatusConstant;
import com.iv.dto.constant.BusinessFunctionConstants;
import com.iv.dto.constant.DeiselLitreByConstant;
import com.iv.dto.constant.FeildPermissionsConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.dto.constant.PartyMasterConstant;
import com.iv.dto.master.PartyBranchMap;
import com.iv.dto.master.PartyConfigurationMaster;
import com.iv.dto.master.PartyNumberTypeMap;
import com.iv.dto.master.deriveryrate.DeliveryRateMaster;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.constant.Constant;
import com.iv.utils.constant.DateTimeFormatConstant;
import com.iv.utils.constant.properties.ServerIPAddressConfigurationConstant;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.exception.ExceptionProcess;
import com.iv.utils.utility.CollectionUtility;
import com.iv.utils.utility.ListFilterUtility;
import com.iv.utils.utility.SortUtils;
import com.iv.utils.utility.Utility;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actions.ConfigParamAction;
import com.ivcargo.utils.CacheManip;
import com.ivcargo.utils.JsonUtility;
import com.platform.dao.ConsignmentDetailsDao;
import com.platform.dao.CorporateAccountDao;
import com.platform.dao.DeliveryRunSheetLedgerDao;
import com.platform.dao.DiscountMasterDAO;
import com.platform.dao.DoorDeliveryMemoSequenceCounterDao;
import com.platform.dao.VehicleAgentMasterDao;
import com.platform.dao.VehicleNumberMasterDao;
import com.platform.dao.model.DDMRegister;
import com.platform.dto.AliasNameConstants;
import com.platform.dto.Branch;
import com.platform.dto.CTODetainModel;
import com.platform.dto.ConfigParam;
import com.platform.dto.ConsignmentDetails;
import com.platform.dto.CorporateAccount;
import com.platform.dto.DoorDeliveryMemo;
import com.platform.dto.Executive;
import com.platform.dto.RateMaster;
import com.platform.dto.SubRegion;
import com.platform.dto.TransportCommonMaster;
import com.platform.dto.UserErrors;
import com.platform.dto.VehicleNumberMaster;
import com.platform.dto.configuration.mindateselection.ModuleWiseMinDateSelectionConfigurationDTO;
import com.platform.dto.configuration.modules.GroupConfigurationPropertiesDTO;
import com.platform.dto.constant.InfoForDeliveryConstant;
import com.platform.dto.constant.WayBillTypeConstant;
import com.platform.dto.model.ChargeTypeModel;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Converter;

public class AjaxAction implements Action{

	private static final String TRACE_ID = "AjaxAction";

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response){
		PrintWriter		out				= null;
		JSONObject		jsonObjectIn	= null;
		JSONObject		jsonObjectOut	= null;
		short			filter			= 0;

		try {
			response.setContentType("application/json"); // Setting response for JSON Content

			out				= response.getWriter();

			if(request.getParameter("json") == null) {
				jsonObjectOut			= new JSONObject();
				jsonObjectOut.put(CargoErrorList.ERROR_DESCRIPTION, "JSON Data not found to process request !");
				out.println(jsonObjectOut);
				return;
			}

			jsonObjectIn	= new JSONObject(request.getParameter("json"));
			filter			= Utility.getShort(jsonObjectIn.get("filter"));

			if(request.getSession().getAttribute(AliasNameConstants.EXECUTIVE) == null) {
				jsonObjectOut			= new JSONObject();
				jsonObjectOut.put(CargoErrorList.ERROR_DESCRIPTION, "You have been logged out. Please login again.");
				out.println(jsonObjectOut);
				return;
			}

			switch (filter) {
			case 1 -> out.println(getHandlingBranch(request, jsonObjectIn));
			case 2 -> out.println(getPartyDetails(request, jsonObjectIn));
			case 3 -> out.println(saveSaidToContain(request, jsonObjectIn));
			case 4 -> out.println(saveDeliveryCustomer(request, jsonObjectIn));
			case 5 -> out.println(checkDuplicateManualCR(request, jsonObjectIn));
			case 7 -> out.println(getCorporateAccountData(request, jsonObjectIn));
			case 16 -> out.println(getVehicleData(request, jsonObjectIn));
			case 17 -> out.println(getDestinationBranchesForDDM(request));
			case 18 -> out.println(getDetailsToGenerateDDM(request));
			case 19 -> out.println(getSingleWayBillDetailsForDoorDelivery(request, jsonObjectIn));
			case 21 -> out.println(getMultipleWayBillDetailsForDoorDelivery(request, jsonObjectIn));
			case 22 -> out.println(getNumberTypeDetails(jsonObjectIn));
			case 23 -> out.println(getBranchDetailsByBranchId(request, jsonObjectIn));
			case 24 -> out.println(getLimitedPartyDetails(jsonObjectIn));
			case 25 -> out.println(refreshCacheForCharges(request, jsonObjectIn));
			case 26 -> out.println(getHeaderList(request, response, jsonObjectIn));
			case 27 -> out.println(checkExecutiveSession(request));
			default -> {
				jsonObjectOut	= new JSONObject();
				jsonObjectOut.put(CargoErrorList.ERROR_DESCRIPTION, "Unknown Request");
				out.println(jsonObjectOut);
			}
			}

		} catch (final Exception e) {
			ExceptionProcess.execute(e, AjaxAction.TRACE_ID);
			try {
				jsonObjectOut	= JsonUtility.setError(CargoErrorList.SYSTEM_ERROR, CargoErrorList.SYSTEM_ERROR_DESCRIPTION);
			} catch (final Exception e1) {
				ExceptionProcess.execute(e1, AjaxAction.TRACE_ID);
			}
			out.println(jsonObjectOut);
		} finally {
			if (out != null) {
				out.flush();
				out.close();
			}
		}
	}

	private JSONObject getHandlingBranch(final HttpServletRequest request, final JSONObject jsonObjectIn) throws Exception {
		var				destinationBranchId	= 0L;

		try {

			if(!jsonObjectIn.isNull("destinationBranchId"))
				destinationBranchId	= Long.parseLong(jsonObjectIn.get("destinationBranchId").toString());

			final var	cache			= new CacheManip(request);
			final var	executive		= (Executive) request.getSession().getAttribute(AliasNameConstants.EXECUTIVE);
			final var	jsonObjectOut	= new JSONObject();

			final var	locationMapping		= cache.getLocationMappingDetailsByAssignedLocationId(request, executive.getAccountGroupId(), destinationBranchId);
			final var	branch				= cache.getGenericBranchDetailCache(request, locationMapping.getLocationId());
			final var	subregion			= cache.getGenericSubRegionById(request, branch.getSubRegionId());

			jsonObjectOut.put("id", locationMapping.getLocationId());
			jsonObjectOut.put("name", branch.getName()+"("+subregion.getName()+")");

			return jsonObjectOut;
		} catch(final Exception e) {
			ExceptionProcess.execute(e, AjaxAction.TRACE_ID);
			return JsonUtility.setError(CargoErrorList.SYSTEM_ERROR, CargoErrorList.SYSTEM_ERROR_DESCRIPTION);
		}
	}

	private JSONObject saveSaidToContain(final HttpServletRequest request, final JSONObject jsonObjectIn) throws Exception {
		try {
			final var	executive			= (Executive) request.getSession().getAttribute(AliasNameConstants.EXECUTIVE);
			final var	valObjIn			= JsonUtility.convertJsontoValueObject(jsonObjectIn);
			final var	ajaxInterfaceBLL	= new AjaxInterfaceBLL();

			valObjIn.put(AliasNameConstants.EXECUTIVE, executive);
			return new JSONObject(ajaxInterfaceBLL.saveSaidToContain(valObjIn).getHtData());
		} catch(final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
			return JsonUtility.setError(CargoErrorList.SYSTEM_ERROR, CargoErrorList.SYSTEM_ERROR_DESCRIPTION);
		}
	}

	private JSONObject saveDeliveryCustomer(final HttpServletRequest request, final JSONObject jsonObjectIn) throws Exception {
		try {
			final var	executive			= (Executive) request.getSession().getAttribute(AliasNameConstants.EXECUTIVE);
			final var	valObjIn			= JsonUtility.convertJsontoValueObject(jsonObjectIn);
			final var	ajaxInterfaceBLL	= new AjaxInterfaceBLL();

			valObjIn.put(AliasNameConstants.EXECUTIVE, executive);
			return new JSONObject(ajaxInterfaceBLL.saveDeliveryCustomer(valObjIn).getHtData());
		} catch(final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
			return JsonUtility.setError(CargoErrorList.SYSTEM_ERROR, CargoErrorList.SYSTEM_ERROR_DESCRIPTION);
		}
	}

	private JSONObject checkDuplicateManualCR(final HttpServletRequest request, final JSONObject jsonObjectIn) throws Exception {
		try {
			final var	cache				= new CacheManip(request);
			final var	executive			= (Executive) request.getSession().getAttribute(AliasNameConstants.EXECUTIVE);
			final var	valObjIn			= JsonUtility.convertJsontoValueObject(jsonObjectIn);
			final var	ajaxInterfaceBLL	= new AjaxInterfaceBLL();

			final var	configValue	= cache.getConfigValue(request, executive.getAccountGroupId(),ConfigParam.CONFIG_KEY_DUPLICATE_MANUAL_AUTO_CR_SEQUENCE);

			valObjIn.put(AliasNameConstants.EXECUTIVE, executive);
			valObjIn.put("configValue", configValue);

			return new JSONObject(ajaxInterfaceBLL.checkDuplicateManualCR(valObjIn).getHtData());
		} catch(final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
			return JsonUtility.setError(CargoErrorList.SYSTEM_ERROR, CargoErrorList.SYSTEM_ERROR_DESCRIPTION);
		}
	}

	private JSONObject getPartyDetails(final HttpServletRequest request, final JSONObject jsonObjectIn) throws Exception {
		var				partyId									= 0L;
		CorporateAccount	party									= null;
		Branch				partyBranch								= null;
		PartyConfigurationMaster	partyConfigurationMaster		= null;
		var							isValidatedPartyGstn			= false;

		try {
			final var	cache			= new CacheManip(request);
			final var	executive		= cache.getExecutive(request);
			final var	valueObjectOut	= new ValueObject();
			final var	groupConfig		= cache.getGroupConfiguration(request, executive.getAccountGroupId());
			final var	valObjIn					= JsonUtility.convertJsontoValueObject(jsonObjectIn);
			final var	partyCodeWiseBooking		= groupConfig.getBoolean(GroupConfigurationPropertiesConstant.PARTY_CODE_WISE_BOOKING, false);
			final var	fetchDataByRedisCache		= groupConfig.getBoolean(GroupConfigurationPropertiesConstant.FETCH_DATA_BY_REDIS_CACHE, false);
			final var	getPartyByIdFromRedisCache	= groupConfig.getBoolean(GroupConfigurationPropertiesConstant.GET_PARTY_BY_PARTY_ID_FROM_REDIS_CACHE, false);
			final var	lrTypeWisePartyToPartyConfiguration = groupConfig.getBoolean(PartyToPartyConfigPropertiesConstant.LR_TYPE_WISE_PARTY_TO_PARTY_CONFIGURATION, false);
			final var	wayBillTypeId	= valObjIn.getLong(Constant.WAY_BILL_TYPE_ID, 0);
			final var	partyType		= valObjIn.getLong("partyTypeId", 0);

			final RedisCache redisCache	= new RedisCacheImpl();

			if (valObjIn.getLong(Constant.PARTY_ID, 0) > 0) {
				partyId	= valObjIn.getLong(Constant.PARTY_ID, 0);

				if(fetchDataByRedisCache || getPartyByIdFromRedisCache)
					party 	= setDtoForPartyDetails(redisCache.getPartyByPartyId(partyId));
				else
					party	= CorporateAccountBLL.getInstance().getPartyDetailsById(partyId);

				partyConfigurationMaster = CorporateAccountDaoImpl.getInstance().getPartyConfigurationDetailsByPartyId(partyId);

				if(partyConfigurationMaster != null)
					isValidatedPartyGstn = partyConfigurationMaster.isValidPartyGstn();
			} else if (valObjIn.getString(Constant.TIN_NUMBER, null) != null) {
				final var tinNumberValObj	= new ValueObject();

				tinNumberValObj.put(Constant.TIN_NUMBER, valObjIn.get(Constant.TIN_NUMBER));
				tinNumberValObj.put(Constant.ACCOUNT_GROUP_ID, executive.getAccountGroupId());
				party	 		= CorporateAccountBLL.getInstance().getPartyNameByTinNumbers(tinNumberValObj);
			} else if(partyCodeWiseBooking && valObjIn.getString(Constant.PARTY_CODE) != null) {
				final var partyCodeValObj	= new ValueObject();

				partyCodeValObj.put(Constant.PARTY_CODE, valObjIn.get(Constant.PARTY_CODE));
				partyCodeValObj.put(Constant.ACCOUNT_GROUP_ID, executive.getAccountGroupId());
				party	 		= CorporateAccountBLL.getInstance().getPartyNameByPartyCode(partyCodeValObj);
			} else
				valueObjectOut.put("result", "0");

			if (party != null) {
				party.setPanNumber(Utility.checkedNullCondition(party.getPanNumber(), (short) 2));
				party.setGstn(Utility.checkedNullCondition(party.getGstn(), (short) 2));
				party.setMobileNumber(Utility.checkedNullCondition(party.getMobileNumber(), (short) 2));
				party.setAddress(Utility.checkedNullCondition(party.getAddress(), (short) 2));
				party.setValidatedPartyGstn(isValidatedPartyGstn);

				if(party.isTBBParty())
					if(groupConfig.getBoolean(GroupConfigurationPropertiesConstant.BLOCK_PAID_BOOKING_FOR_CONSIGNOR_BILLING_PARTY, false)
							&& wayBillTypeId == WayBillTypeConstant.WAYBILL_TYPE_PAID && partyType == Constant.PARTY_TYPE_CONSIGNOR_ID)
						return JsonUtility.setError(0, CargoErrorList.TBB_PARTY_PAID_ERROR_DESCRIPTION);
					else if(groupConfig.getBoolean(GroupConfigurationPropertiesConstant.BLOCK_TOPAY_BOOKING_FOR_CONSIGNEE_BILLING_PARTY, false)
							&& wayBillTypeId == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY && partyType == Constant.PARTY_TYPE_CONSIGNEE_ID)
						return JsonUtility.setError(0, CargoErrorList.TBB_PARTY_TOPAY_ERROR_DESCRIPTION);

				valueObjectOut.put("partyDetails", Converter.DtoToHashMap(party));

				//Get Branch Name
				if(!party.isTBBParty()) {
					partyBranch		= cache.getGenericBranchDetailCache(request, party.getBranchId());

					var branchName = "";

					if(partyBranch != null)
						branchName = partyBranch.getName();

					valueObjectOut.put("branchName", branchName);
				} else {
					partyBranch		= cache.getGenericBranchDetailCache(request, party.getBranchId());

					short partyBranchStateCode = 0;

					if(partyBranch != null)
						partyBranchStateCode = partyBranch.getStateGSTCode();

					valueObjectOut.put("partyBranchstateCode", partyBranchStateCode);
				}

				//Special Purpose (Min Weight) And (DD Slab)
				if(!jsonObjectIn.isNull("getCharge")) {
					valObjIn.put(Executive.EXECUTIVE, executive);
					valObjIn.put(Constant.CORPORATE_ACCOUNT_ID, party.getCorporateAccountId());
					valObjIn.put(Constant.BUSINESS_TYPE_ID, party.getBusinessTypeId());
					valObjIn.put(GroupConfigurationPropertiesDTO.ONLY_PARTY_WISE_MINIMUM_VALUE_CONFIG_ALLOW, groupConfig.getBoolean(GroupConfigurationPropertiesDTO.ONLY_PARTY_WISE_MINIMUM_VALUE_CONFIG_ALLOW, false));
					valObjIn.put(GroupConfigurationPropertiesConstant.APPLY_RATE_ON_BUSINESS_TYPE_SELECTION, groupConfig.getBoolean(GroupConfigurationPropertiesConstant.APPLY_RATE_ON_BUSINESS_TYPE_SELECTION, false));
					valObjIn.put(GroupConfigurationPropertiesConstant.DESTINATION_WISE_MINIMUM_FREIGHT, groupConfig.getBoolean(GroupConfigurationPropertiesConstant.DESTINATION_WISE_MINIMUM_FREIGHT, false));

					final var	result	= RateMasterBLL.getInstance().getPartyMinimumRatesInBooking(valObjIn);

					if (result != null && !result.isEmpty()) {
						if (result.containsKey(RateMaster.CHARGE_SECTION_PARTY_MINIMUM_WEIGHT_ID)) {
							final var	rm	= result.get(RateMaster.CHARGE_SECTION_PARTY_MINIMUM_WEIGHT_ID);
							valueObjectOut.put("MinWght", rm.getRate());
						}

						if (result.containsKey(RateMaster.CHARGE_SECTION_PARTY_DDSLAB_ID)) {
							final var	rm	= result.get(RateMaster.CHARGE_SECTION_PARTY_DDSLAB_ID);
							valueObjectOut.put("DDSlab", rm.getRate());
						}

						if (result.containsKey(RateMaster.CHARGE_SECTION_PARTY_NAME_MINIMUM_RATE_ID)) {
							final var	rm	= result.get(RateMaster.CHARGE_SECTION_PARTY_NAME_MINIMUM_RATE_ID);
							valueObjectOut.put("minAmount", rm.getRate());
						}

						valueObjectOut.put("minimumValueRateList", result.values().stream().collect(CollectionUtility.getList()));
					}

					final var slabWisePartyMinimumAmtList = RateMasterBLL.getInstance().slabWisePartyAmtList(valObjIn);

					if(slabWisePartyMinimumAmtList != null)
						valueObjectOut.put("slabWisePartyMinimumAmtList",slabWisePartyMinimumAmtList);
				}

				if(partyConfigurationMaster != null) {
					valueObjectOut.put("partyLimit", partyConfigurationMaster.getPartyLimitAmount());
					valueObjectOut.put("deviation", partyConfigurationMaster.getDeviation());
					valueObjectOut.put("deduction", partyConfigurationMaster.getDeduction());
					valueObjectOut.put("riskCoveragePercentage", partyConfigurationMaster.getIsRiskCoveragePercentage());
					valueObjectOut.put("riskCoverage", partyConfigurationMaster.getRiskCoverage());
					valueObjectOut.put("validatePartNumber", BooleanUtils.isTrue(partyConfigurationMaster.getIsValidatePartNumber()));
					valueObjectOut.put("validateInvoiceNumber", BooleanUtils.isTrue(partyConfigurationMaster.getIsValidateInvoiceNo()));
				}
			} else
				valueObjectOut.put("result", "0");

			if(groupConfig.getBoolean(GroupConfigurationPropertiesConstant.DESTINATION_BRANCH_WISE_PARTY_MAPPING, false)
					&& party != null) {
				final var partyBranchMapList = PartyBranchMapDaoImpl.getInstance().getPartyBranchMappingDetails(party.getCorporateAccountId(), executive.getAccountGroupId());

				if(ObjectUtils.isNotEmpty(partyBranchMapList))
					valueObjectOut.put("partyMappedBranchIds", partyBranchMapList.stream().filter(e -> e.getType() == PartyMasterConstant.TYPE_DESTINATION).map(PartyBranchMap::getBranchId).map(String::valueOf).collect(Collectors.joining(Constant.COMMA)));
			}

			if(lrTypeWisePartyToPartyConfiguration) {
				final var whereClause = new StringJoiner(" AND ");

				whereClause.add("ptp.AccountGroupId = " + executive.getAccountGroupId());
				whereClause.add("(ptp.FromBranchId = 0 OR ptp.FromBranchId = " + valObjIn.getLong(Constant.SOURCE_BRANCH_ID, 0) + ")");
				whereClause.add("(ptp.ToBranchId = 0 OR ptp.ToBranchId = " + valObjIn.getLong(Constant.DESTINATION_BRANCH_ID, 0) + ")");
				whereClause.add("ptp.FromPartyId = " + valObjIn.getLong(Constant.CONSIGNOR_ID, 0));
				whereClause.add("ptp.ToPartyId = " + valObjIn.getLong(Constant.CONSIGNEE_ID, 0));

				final var partyToPartyConfigList = PartyToPartyConfigMasterDaoImpl.getInstance().getPartyToPartyConfigByFromAndToPartyId(whereClause.toString());

				if(ObjectUtils.isNotEmpty(partyToPartyConfigList))
					valueObjectOut.put("partyToPartyConfigList", partyToPartyConfigList);
			}

			return new JSONObject(valueObjectOut.getHtData());
		} catch(final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
			return JsonUtility.setError(CargoErrorList.SYSTEM_ERROR, CargoErrorList.SYSTEM_ERROR_DESCRIPTION);
		}
	}

	private CorporateAccount setDtoForPartyDetails(final com.iv.dto.master.CorporateAccount party1) {
		CorporateAccount	partyDetails	= null;

		if(party1 != null) {
			partyDetails	= new CorporateAccount();
			partyDetails.setCorporateAccountId(party1.getCorporateAccountId());
			partyDetails.setName(party1.getCorporateAccountName());
			partyDetails.setAddress(party1.getCorporateAccountAddress());
			partyDetails.setAccountGroupId(party1.getAccountGroupId());
			partyDetails.setBranchId(party1.getBranchId());
			partyDetails.setStateId(party1.getStateId());
			partyDetails.setCountryId(party1.getCountryId());
			partyDetails.setPincode(party1.getAccountGroupPincode());
			partyDetails.setContactPerson(party1.getCorporateAccountContactPerson());
			partyDetails.setDepartment(party1.getCorporateAccountDepartment());
			partyDetails.setMobileNumber(party1.getCorporateAccountMobileNumber());
			partyDetails.setPhoneNumber(party1.getCorporateAccountPhoneNumber());
			partyDetails.setFaxNumber(party1.getCorporateAccountFaxNumber());
			partyDetails.setEmailAddress(party1.getCorporateAccountEmailAddress());
			partyDetails.setCorporateAccountType(party1.getCorporateAccountType());
			partyDetails.setMarketingPersonName(party1.getCorporateAccountMarketingPersonName());
			partyDetails.setPhoneNumber2(party1.getCorporateAccountPhoneNumber2());
			partyDetails.setServiceTaxNumber(party1.getCorporateAccountServiceTaxNumber());
			partyDetails.setRemark(party1.getCorporateAccountRemark());
			partyDetails.setLmtContactPersonName(party1.getCorporateAccountLMTContactPersonName());
			partyDetails.setBlackListed(party1.getCorporateAccountBlackListed());
			partyDetails.setServiceTaxRequired(party1.isCorporateAccountServiceTaxRequired());
			partyDetails.setMobileNumber2(party1.getCorporateAccountMobileNumber2());
			partyDetails.setTinNumber(party1.getCorporateAccountTinNumber());
			partyDetails.setTBBParty(party1.isCorporateAccountTBBParty());
			partyDetails.setExecutiveId(party1.getExecutiveId());
			partyDetails.setPanNumber(party1.getCorporateAccountPanNumber());
			partyDetails.setDisplayName(party1.getCorporateAccountDisplayName());
			partyDetails.setServiceTaxPaid(party1.getCorporateAccountServiceTaxPaidBy());
			partyDetails.setGstn(party1.getGstn());
			partyDetails.setShortCreditAllowOnTxnType(party1.getShortCreditAllowOnTxnType());
			partyDetails.setWeightType(party1.getWeightType());
			partyDetails.setPartyCode(party1.getPartyCode());
			partyDetails.setDeliveryAt(party1.getDeliveryAt());
			partyDetails.setChargedWeightRound(party1.isChargedWeightRound());
			partyDetails.setChargedWeightRoundOffValue(party1.getChargedWeightRoundOffValue());
			partyDetails.setTanNumber(party1.getTanNumber());
			partyDetails.setSmsRequiredId(party1.getSmsRequiredId());
			partyDetails.setChgwgtActWgtConditionForLess(party1.isChgwgtLessThanActwgtAllow());
			partyDetails.setCftValue(party1.getCftValue());
			partyDetails.setTransporter(party1.isTransporter());
			partyDetails.setRateConfigured(party1.isRateConfigured());
			partyDetails.setPodRequired(party1.isPodRequired());
			partyDetails.setExempted(party1.isExempted());
			partyDetails.setCftUnit(party1.getCftUnit());
			partyDetails.setClaimAmount(party1.getClaimAmount());
			partyDetails.setBusinessTypeId(party1.getBusinessTypeId());
			partyDetails.setBillingBranchId(party1.getBillingBranchId());
		}

		return partyDetails;
	}

	private JSONObject getCorporateAccountData(final HttpServletRequest request, final JSONObject jsonObjectIn) throws Exception {
		var					corpId				= 0L;
		CorporateAccount		corpAcc				= null;
		Branch					branch				= null;
		HashMap<Long, Branch>	subRegionBranches	= null;
		SubRegion[]				subRegionsArr		= null;
		var					isDisplayDeActiveBranch	= true;

		try {
			final var	cache			= new CacheManip(request);
			final var	executive		= (Executive) request.getSession().getAttribute(AliasNameConstants.EXECUTIVE);
			final var	jsonObjectOut	= new JSONObject();

			if (jsonObjectIn.isNull("corpId"))
				jsonObjectOut.put("error", "Corporate Account Not selected !");
			else {
				final var	corporateAccountBLL	= new CorporateAccountBLL();

				corpId 	= Long.parseLong(jsonObjectIn.get("corpId").toString());
				corpAcc = corporateAccountBLL.getCorporateAccountByIdForMaster(corpId);
			}

			if (corpAcc != null) {
				corpAcc.setName(Utility.removeLastWordFromString(corpAcc.getName(), "_"));
				jsonObjectOut.put("corpAcc", Converter.DtoToHashMap(corpAcc));

				if(jsonObjectIn.has("isDisplayDeActiveBranch"))
					isDisplayDeActiveBranch	= jsonObjectIn.getBoolean("isDisplayDeActiveBranch");

				if (corpAcc.getBranchId() > 0) {
					branch				= cache.getBranchById(request, executive.getAccountGroupId(), corpAcc.getBranchId());

					if(branch == null) {
						jsonObjectOut.put("error", "No Record");
						return jsonObjectOut;
					}

					subRegionBranches	= cache.getPhysicalBranchesBySubRegionId(request, executive.getAccountGroupId(), branch.getSubRegionId());
					subRegionsArr		= cache.getSubRegionsByRegionId(request, branch.getRegionId(), executive.getAccountGroupId());

					final var subregionbranchesJO	= new JSONObject();

					for (final Map.Entry<Long, Branch> entry : subRegionBranches.entrySet()) {
						final var temp	= entry.getValue();

						if(!isDisplayDeActiveBranch) {
							if(temp.getStatus() == Branch.BRANCH_ACTIVE)
								subregionbranchesJO.put(Long.toString(temp.getBranchId()), temp.getName()+"");
						} else
							subregionbranchesJO.put(Long.toString(temp.getBranchId()), temp.getName()+"");
					}

					subregionbranchesJO.put(Long.toString(branch.getBranchId()), branch.getName() + "");

					final var subRegionsJO	= new JSONObject();

					for (final SubRegion subRegion : subRegionsArr)
						if (!subRegion.isMarkForDelete())
							subRegionsJO.put(Long.toString(subRegion.getSubRegionId()), subRegion.getName());

					jsonObjectOut.put("branches", subregionbranchesJO);
					jsonObjectOut.put("subRegions", subRegionsJO);
					jsonObjectOut.put("branchsubRegion", branch.getSubRegionId());
					jsonObjectOut.put("branchRegion", branch.getRegionId());
				}

			} else
				jsonObjectOut.put("error", "No Record");

			return jsonObjectOut;
		} catch(final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
			return JsonUtility.setError(CargoErrorList.SYSTEM_ERROR, CargoErrorList.SYSTEM_ERROR_DESCRIPTION);
		}
	}

	private JSONObject getVehicleData(final HttpServletRequest request, final JSONObject jsonObjectIn) throws Exception {
		VehicleNumberMaster		vehicleNumberMaster		= null;
		var					vehicleNumberMasterId 	= 0L;
		var 				isAllDDMSettled		  	= true;

		try {
			final var	cache			= new CacheManip(request);
			final var	executive		= cache.getExecutive(request);
			final var	jsonObjectOut	= new JSONObject();

			final var	ddmPropertyValObj				= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.CREATE_DDM);
			final var	vehicleMasterConfig				= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.VEHICLE_NUMBER_MASTER);

			if (jsonObjectIn.isNull("vehicleNoId"))
				jsonObjectOut.put("error", "Vehicle Number Not selected !");
			else {
				vehicleNumberMasterId 		= jsonObjectIn.optLong("vehicleNoId", 0);
				vehicleNumberMaster 		= VehicleNumberMasterDao.getInstance().getVehicleDetailsById(executive.getAccountGroupId(), vehicleNumberMasterId);
			}

			var	validateTripSheet				= (boolean) ddmPropertyValObj.getOrDefault(DDMConfigurationConstant.VALIDATE_TRIP_SHEET, false);

			if(validateTripSheet && vehicleNumberMaster != null) {
				if((boolean) ddmPropertyValObj.getOrDefault(DDMConfigurationConstant.VEHICLE_OWNER_WISE_VALIDATION_FOR_TRIP_SHEET, false)) {
					final var	vehicleOwnerTypeList	= CollectionUtility.getShortListFromString((String) ddmPropertyValObj.getOrDefault(DDMConfigurationConstant.VEHICLE_OWNER_TYPE_IDS_FOR_TRIP_SHEET_VALIDATION, "0"));
					validateTripSheet					= vehicleOwnerTypeList.contains(vehicleNumberMaster.getVehicleOwner());
				}

				if(validateTripSheet) {
					final var	syncPropObj 	= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.SYNC_WITH_IV_FLEET);
					final var	tripSheetResultValObj	= LoadingSheetToTripSheetBllImpl.getInstance().getValidateTripSheetByVehicleNumber(vehicleNumberMaster.getVehicleNumber(), syncPropObj);

					if(tripSheetResultValObj != null)
						jsonObjectOut.put("tripSheet", tripSheetResultValObj.get("tripSheet"));
				}
			}

			if ((boolean) ddmPropertyValObj.getOrDefault(DDMConfigurationConstant.ALLOW_DDM_CREATION_AFTER_ALL_DDM_SETTLED, false)
					&& Utility.isIdExistInLongList(ddmPropertyValObj, DDMConfigurationConstant.SUB_REGION_IDS_FOR_ALLOW_DDM_CREATION_AFTER_ALL_DDM_SETTLED, executive.getSubRegionId())) {
				final var	fromDate		= DateTimeUtility.getTimeStamp((String) ddmPropertyValObj.getOrDefault(DDMConfigurationConstant.START_DATE_FOR_DDM_CREATION_VALIDATION, DateTimeUtility.getCurrentDateString()));

				final var	deliveryRunSheetLedgerList = DeliveryRunSheetLedgerDaoImpl.getInstance().getDDMDetailsByVehicleId(vehicleNumberMasterId, executive.getBranchId(), executive.getAccountGroupId(), fromDate);

				isAllDDMSettled	= deliveryRunSheetLedgerList.isEmpty() || ListFilterUtility.isNoElementInList(deliveryRunSheetLedgerList, e -> e.getDeliveryRunSheetLedgerStatus() == 0);
			}

			jsonObjectOut.put("isAllDDMSettled", isAllDDMSettled);

			if (vehicleNumberMaster != null) {
				if(!VehicleNumberMasterBllImpl.getInstance().isValidRC(vehicleNumberMaster.getRcValidity(), vehicleMasterConfig))
					jsonObjectOut.put(CargoErrorList.ERROR_DESCRIPTION, "RC For This Vehicle Is Expired, Please Select Different Vehicle");
				else {
					jsonObjectOut.put("vehicleNumberMaster", new JSONObject(vehicleNumberMaster) );
					jsonObjectOut.put("vehicleOwnerForUser", TransportCommonMaster.getVehicleOwner(vehicleNumberMaster.getVehicleOwner()));
					jsonObjectOut.put("HIRED_VEHICLE_ID", TransportCommonMaster.HIRED_VEHICLE_ID);

					final var	vehicleType = cache.getVehicleType(request, executive.getAccountGroupId(), vehicleNumberMaster.getVehicleTypeId());

					if(vehicleType != null)
						jsonObjectOut.put("vehicleType", new JSONObject(vehicleType));

					if(vehicleNumberMaster.getVehicleAgentMasterId() > 0) {
						final var	vehicleAgentMaster = VehicleAgentMasterDao.getInstance().getSingleVehicleAgentDetails(vehicleNumberMaster.getVehicleAgentMasterId());

						if(vehicleAgentMaster != null)
							jsonObjectOut.put("vehicleAgentMaster", new JSONObject(vehicleAgentMaster));
					}
				}
			} else
				jsonObjectOut.put(CargoErrorList.ERROR_DESCRIPTION, "No Record");

			jsonObjectOut.put(DDMConfigurationConstant.VALIDATE_TRIP_SHEET, validateTripSheet);

			return jsonObjectOut;
		} catch(final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
			return JsonUtility.setError(CargoErrorList.SYSTEM_ERROR, CargoErrorList.SYSTEM_ERROR_DESCRIPTION);
		}
	}

	private JSONObject getDestinationBranchesForDDM(final HttpServletRequest request) throws Exception {
		HashMap<Long, Branch> 		destinationsHM			= null;
		var						populatSubregionBranchesInTruckDestination = false ;

		try {

			final var	cache			= new CacheManip(request);
			final var	executive		= cache.getExecutive(request);
			final var	jsonObjectOut	= new JSONObject();
			final var	ddmPropertiesHM 	= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.CREATE_DDM);

			populatSubregionBranchesInTruckDestination = (boolean) ddmPropertiesHM.getOrDefault(DDMConfigurationConstant.POPULAT_SUBREGION_BRANCHES_IN_TRUCK_DESTINATION, false);

			if(populatSubregionBranchesInTruckDestination)
				destinationsHM	= cache.getActivePhysicalBranchesBySubRegionId(request, executive.getAccountGroupId(), executive.getSubRegionId());
			else
				destinationsHM	= cache.getBranchesByRegionId(request, executive.getAccountGroupId(), executive.getRegionId());

			if (destinationsHM != null && destinationsHM.size() > 0) {
				final var	destinations = new JSONObject();

				destinationsHM.entrySet().forEach((final Map.Entry<Long, Branch> entry) -> destinations.put(Long.toString(entry.getValue().getBranchId()), entry.getValue().getName()));

				jsonObjectOut.put("destinations", destinations);

			} else
				jsonObjectOut.put(CargoErrorList.ERROR_DESCRIPTION, "No Record");

			return jsonObjectOut;
		} catch(final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
			return JsonUtility.setError(CargoErrorList.SYSTEM_ERROR, CargoErrorList.SYSTEM_ERROR_DESCRIPTION);
		}
	}

	private JSONObject getDetailsToGenerateDDM(final HttpServletRequest request) throws Exception {
		List<String>					unsettledDDMNumbers 					= null;
		final var						HOURS_IN_MILLI_SECONDS					= 3600000;
		short							filter									= 0;

		try {
			final var	cache			= new CacheManip(request);
			final var	executive		= cache.getExecutive(request);
			final var	jsonObjectOut	= new JSONObject();
			final var	locationList 	= ActionStaticUtil.getAssignedLocationsIdListByLocationIdId(request, executive, false,cache);

			final var	configuration				= cache.getGenerateCRConfiguration(request, executive.getAccountGroupId());
			final var	ddmConfigurationHM 			= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.CREATE_DDM);
			final var	tripHisabProperties			= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.TRIP_HISAB_SETTLEMENT);
			final var	groupConfiguration			= cache.getGroupConfiguration(request, executive.getAccountGroupId());
			final var 	accountGroup				= cache.getAccountGroupById(request, executive.getAccountGroupId());
			final var 	ddbWiseSelfPartyId			= CorporateAccountBLL.getInstance().getSelfPartyCorporateAccountId(groupConfiguration, accountGroup);
			final HashMap<?, ?>			execFldPermissions			= cache.getExecutiveFieldPermission(request);
			final var	isAllowToAddVehicleWhileDdmCreation		= (boolean) ddmConfigurationHM.getOrDefault(DDMConfigurationConstant.IS_ALLOW_TO_ADD_VEHICLE_WHILE_DDM_CREATION, false);
			final var	minDate								= DateTimeUtility.getTimeStamp((String) ddmConfigurationHM.getOrDefault(DDMConfigurationConstant.START_DATE_FOR_DDM_CREATION_VALIDATION, DateTimeUtility.getCurrentDateString()));
			final var	allowDeliveryForBlackListedParty 	= execFldPermissions.get(FeildPermissionsConstant.ALLOW_DELIVERY_FOR_BLACK_LISTED_PARTY) != null;
			final var	manualDDMWithAutoDDMSequence 		= execFldPermissions.get(FeildPermissionsConstant.MANUAL_DDM_WITH_AUTO_DDM_SEQUENCE) != null;
			final var	manualDDMWithManualDDMSequence 		= execFldPermissions.get(FeildPermissionsConstant.MANUAL_DDM_WITH_MANUAL_DDM_SEQUENCE) != null;
			final var	addVehicleWhileDispatch				= execFldPermissions.get(FeildPermissionsConstant.ADD_VEHICLE_WHILE_DISPATCH) != null;
			final var	showDiscountFieldsOnPermission		= execFldPermissions.get(FeildPermissionsConstant.SHOW_DISCOUNT_FIELDS_ON_PERMISSION) != null;

			if ((boolean) ddmConfigurationHM.getOrDefault(DDMConfigurationConstant.DDM_LOCK, false)
					&& Utility.isIdExistInLongList(ddmConfigurationHM, DDMConfigurationConstant.SUB_REGION_IDS_FOR_ALLOW_DDM_CREATION_AFTER_ALL_DDM_SETTLED, executive.getSubRegionId())) {

				if((boolean) ddmConfigurationHM.getOrDefault(DDMConfigurationConstant.EXECUTIVE_WISE_DDM_OPERATION_LOCKING, false))
					filter =  1;
				else
					filter =  2;

				final var valueObjectOut = OperationLockingBllImpl.getInstance().checkExecutivedWiseDDMOperationLocking(executive.getAccountGroupId(), executive.getBranchId(), executive.getExecutiveId(), minDate, filter);

				if (valueObjectOut.containsKey(CargoErrorList.ERROR_DESCRIPTION)) {
					jsonObjectOut.put("errorCode", CargoErrorList.PREVIOUS_DDM_ARE_NOT_SETTLED);
					jsonObjectOut.put("errorDescription", valueObjectOut.get(CargoErrorList.ERROR_DESCRIPTION));

					return jsonObjectOut;
				}
			}

			ddmConfigurationHM.put(GenerateCashReceiptPropertiesConstant.CONFIG_DISCOUNT, configuration.getBoolean(GenerateCashReceiptPropertiesConstant.CONFIG_DISCOUNT, false));
			ddmConfigurationHM.put(GenerateCashReceiptPropertiesConstant.READ_ONLY_DELIVERY_DISCOUNT, configuration.getBoolean(GenerateCashReceiptPropertiesConstant.READ_ONLY_DELIVERY_DISCOUNT, false));
			ddmConfigurationHM.put(GenerateCashReceiptPropertiesConstant.READ_ONLY_DELIVERY_DISCOUNT_FOR_TOPAY_ONLY, configuration.getBoolean(GenerateCashReceiptPropertiesConstant.READ_ONLY_DELIVERY_DISCOUNT_FOR_TOPAY_ONLY, false));

			if(manualDDMWithManualDDMSequence) {
				final var	doorDeliveryMemoSequenceCounter = DoorDeliveryMemoSequenceCounterDao.getInstance().getManualDoorDeliverySequenceForGroup(executive.getAccountGroupId());

				if(doorDeliveryMemoSequenceCounter == null)
					return JsonUtility.setError(CargoErrorList.DDM_MANUAL_SEQUENCE_COUNTER_MISSING, CargoErrorList.DDM_MANUAL_SEQUENCE_COUNTER_MISSING_DESCRIPTION);

				jsonObjectOut.put("DoorDeliveryMemoSequenceCounter", new JSONObject(doorDeliveryMemoSequenceCounter));
			}

			final int	manualDDMDaysAllowed	= cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_MAX_DAYS_OF_OPERATION_BEFORE_CASHSTATEMENT_ENTRY_ID);

			if (locationList != null && !locationList.isEmpty()) {
				final var	jsonLocationList = new JSONArray();

				locationList.forEach(jsonLocationList::put);

				jsonObjectOut.put("jsonLocationList", jsonLocationList);
			}

			if((boolean) ddmConfigurationHM.getOrDefault(DDMConfigurationConstant.ALLOW_DDM_VALIDATION_FOR_SETTLEMENT, false)) {
				final var 	date 			= DateTimeUtility.getDateFromTimeStamp(DateTimeUtility.getCurrentTimeStamp(), "dd-MM-yyyy");
				final var	currDateLong 	= DateTimeUtility.getStartOfDayTimeStamp(date).getTime();
				final var	toDateLong		= (long) HOURS_IN_MILLI_SECONDS * (int) ddmConfigurationHM.get(DDMConfigurationConstant.HOURS_FOR_DDM_SETTLEMENT_VALIDATION);
				final var	difference 		= currDateLong - toDateLong;
				final var	toDate			= new Timestamp(difference);
				final var	fromDateStr		= (String) ddmConfigurationHM.get(DDMConfigurationConstant.FROM_DATE_FOR_DDM_SETTLEMENT_VALIDATION);
				final var	fromDate		= DateTimeUtility.getTimeStamp(fromDateStr);

				final var whereClause = new StringJoiner(" AND ");

				whereClause.add("drsl.BranchId = " + executive.getBranchId());
				whereClause.add("drsl.CreationDateTime >= '" + fromDate + "'");
				whereClause.add("drsl.CreationDateTime <= '" + toDate + "'");

				var	deliveryRunSheetList = DeliveryRunSheetLedgerDao.getInstance().getDDMRegisterData(whereClause.toString());

				if(deliveryRunSheetList != null && !deliveryRunSheetList.isEmpty()) {
					deliveryRunSheetList	= SortUtils.sortList(deliveryRunSheetList, DDMRegister::getDeliveryRunSheetLedgerId);
					final Map<Long, String>	unsettledDDMNumbersHM = new LinkedHashMap<>();

					for (final DDMRegister element : deliveryRunSheetList)
						if(element.getPaymentType() == 0) {
							final var unsettledDDMNumbersLimit = (int) ddmConfigurationHM.get(DDMConfigurationConstant.UNSETTLED_DDM_NUMBER_LIMIT);

							if(unsettledDDMNumbersHM.size() >= unsettledDDMNumbersLimit)
								break;

							unsettledDDMNumbersHM.put(element.getDeliveryRunSheetLedgerId(), element.getDdmNumber());
						}

					if(!unsettledDDMNumbersHM.isEmpty())
						unsettledDDMNumbers = new ArrayList<>(unsettledDDMNumbersHM.values());
				}
			}

			final var 	showBookingCharges		= (boolean) ddmConfigurationHM.getOrDefault(DDMConfigurationConstant.SHOW_BOOKING_CHARGES, false);

			if(showBookingCharges) {
				jsonObjectOut.put("bookingChargeIdsList", CollectionUtility.getLongListFromString((String) ddmConfigurationHM.getOrDefault(DDMConfigurationConstant.BOOKING_CHARGE_IDS_TO_SHOW, null)));

				final var actBkgcharges	= cache.getActiveBookingCharges(request, executive.getBranchId());

				final Map<Short, Map<Long, String>> bookingChargesSequence	= Stream.of(actBkgcharges)
						.collect(Collectors.groupingBy(ChargeTypeModel::getSequence,
								Collectors.toMap(ChargeTypeModel::getChargeTypeMasterId, ChargeTypeModel::getChargeName, (e1, e2) -> e1, TreeMap::new)));

				jsonObjectOut.put(AliasNameConstants.ACTIVE_BOOKING_CHARGES, new JSONObject(bookingChargesSequence));
			}

			final var ddmSettlementGetData	= new DDMSettlementGetData();
			jsonObjectOut.put(AliasNameConstants.PAYMENT_TYPE_PERMISSIONS, JsonUtility.convertionToJsonObjectForResponse(ddmSettlementGetData.getPaymentTypePermissionsForExecutive(execFldPermissions, executive)));

			final var actDelcharges			= cache.getActiveDeliveryCharges(request, executive.getBranchId());

			final Map<Short, Map<Long, String>> deliveryChargesSequence	= Stream.of(actDelcharges)
					.collect(Collectors.groupingBy(ChargeTypeModel::getSequence,
							Collectors.toMap(ChargeTypeModel::getChargeTypeMasterId, ChargeTypeModel::getChargeName, (e1, e2) -> e1, TreeMap::new)));

			jsonObjectOut.put(AliasNameConstants.ACTIVE_DELIVERY_CHARGES, new JSONObject(deliveryChargesSequence));

			final var	discountTypesVL = getDiscountTypesValObj(DiscountMasterDAO.getInstance().getDiscountTypes());

			if(discountTypesVL != null)
				jsonObjectOut.put(AliasNameConstants.DISCOUNT_TYPES, JsonUtility.convertionToJsonObjectForResponse(discountTypesVL));

			if (showDiscountFieldsOnPermission)
				ddmConfigurationHM.put(DDMConfigurationConstant.IS_DISCOUNT_SHOW, true);
			else
				ddmConfigurationHM.put(DDMConfigurationConstant.IS_DISCOUNT_SHOW, (boolean) ddmConfigurationHM.getOrDefault(DDMConfigurationConstant.IS_DISCOUNT_SHOW, false));

			jsonObjectOut.put("configuration", new JSONObject(ddmConfigurationHM));
			jsonObjectOut.put(GroupConfigurationPropertiesConstant.SHOW_PARTY_IS_BLACK_LISTED_PARTY, groupConfiguration.getBoolean(GroupConfigurationPropertiesConstant.SHOW_PARTY_IS_BLACK_LISTED_PARTY, false));
			jsonObjectOut.put("allowDeliveryForBlackListedParty", allowDeliveryForBlackListedParty);
			jsonObjectOut.put("manualDDMWithAutoDDMSequence", manualDDMWithAutoDDMSequence);
			jsonObjectOut.put("manualDDMWithManualDDMSequence", manualDDMWithManualDDMSequence);
			jsonObjectOut.put("manualDDMDaysAllowed", manualDDMDaysAllowed);
			jsonObjectOut.put("unsettledDDMNumbers", unsettledDDMNumbers);
			jsonObjectOut.put("tripHisabProperties", tripHisabProperties);
			jsonObjectOut.put(DeiselLitreByConstant.DEISEL_LITER_BY_BRANCH_ID_STRING, DeiselLitreByConstant.DEISEL_LITER_BY_BRANCH_ID);
			jsonObjectOut.put(AliasNameConstants.EXECUTIVE, new JSONObject(executive));
			jsonObjectOut.put(DDMConfigurationConstant.IS_ALLOW_TO_ADD_VEHICLE_WHILE_DDM_CREATION, addVehicleWhileDispatch && isAllowToAddVehicleWhileDdmCreation);
			jsonObjectOut.put("showLrWiseLorryHireColumn", execFldPermissions.get(FeildPermissionsConstant.SHOW_LR_WISE_LORRY_HIRE_COLUMN) != null);
			jsonObjectOut.put("ddbWiseSelfPartyId", ddbWiseSelfPartyId);
			jsonObjectOut.put(Constant.IVCARGO_VIDEOS, cache.getModuleWiseVideos(request, ModuleIdentifierConstant.CREATE_DDM));
			jsonObjectOut.put(GroupConfigurationPropertiesConstant.SHOW_DIVISION_SELECTION, groupConfiguration.getBoolean(GroupConfigurationPropertiesConstant.SHOW_DIVISION_SELECTION, false));
			jsonObjectOut.put("allowToDecreaseDefaultMemoCharge", execFldPermissions.get(FeildPermissionsConstant.ALLOW_TO_DECREASE_DEFAULT_MEMO_CHARGE) != null);

			return jsonObjectOut;
		} catch(final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
			return JsonUtility.setError(CargoErrorList.SYSTEM_ERROR, CargoErrorList.SYSTEM_ERROR_DESCRIPTION);
		}
	}

	private JSONObject getSingleWayBillDetailsForDoorDelivery(final HttpServletRequest request, final JSONObject jsonObjectIn) throws Exception {
		Map<Long, Map<Long, Double>>				wayBillIdWiseDeliverychargesHM 	= null;
		Map<Long, List<DeliveryRateMaster>>			destWiseRateHm					= null;
		Map<Long, ArrayList<ConsignmentDetails>> 	consDetailsHm					= null;

		try {
			final var	cache						= new CacheManip(request);
			final var 	executive					= cache.getExecutive(request);
			final var 	jsonObjectOut				= new JSONObject();

			final var 	groupConfig					= cache.getGroupConfiguration(request, executive.getAccountGroupId());
			final var 	isPendingDeliveryTableEntry = ConfigParamAction.isPendingDelStockTblEntryAllow(request, cache, executive);
			final var 	branch						= cache.getGenericBranchDetailCache(request, executive.getBranchId());
			final Map<Object, Object> 	generateCRConfiguration		= cache.getGenerateCRConfiguration(request, executive.getAccountGroupId()).getHtData();
			final var execFldPermissions 			= cache.getExecutiveFieldPermission(request);

			final var 	branchesColl 					= cache.getGenericBranchesDetail(request);
			final var 	wayBillNo	 					= jsonObjectIn.optString("wayBillNumber", null);
			final var 	ddmConfigurationHM				= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.CREATE_DDM);
			final var 	displayDataConfig				= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.DISPLAY_DATA_CONFIGURATION);
			final var 	defaultDeliveryAtSelection  	= (boolean) ddmConfigurationHM.get(DDMConfigurationConstant.DEFAULT_DELIVERY_AT_SELECTION);
			final int 	deliveryAtSelectionVal  		= (Integer) ddmConfigurationHM.getOrDefault(DDMConfigurationConstant.DELIVERY_AT_SELECTION_VAL, 0);
			final var 	showBookingCharges				= (boolean) ddmConfigurationHM.getOrDefault(DDMConfigurationConstant.SHOW_BOOKING_CHARGES,false);
			final var 	calculatedDeliveryChargeAmount	= (boolean) ddmConfigurationHM.getOrDefault(DDMConfigurationConstant.CALCULATED_DELIVERY_CHARGE_AMOUNT, false);
			final var 	quantityMismatchCheck			= (boolean) ddmConfigurationHM.getOrDefault(DDMConfigurationConstant.QUANTITY_MISMATCH_CHECK, true);
			final var 	isCTODetainAllowed				= (boolean) ddmConfigurationHM.getOrDefault(DDMConfigurationConstant.IS_CTO_DETAIN_ALLOWED, false);
			final var 	stopDeliveryOnNoOfDays			= (boolean) ddmConfigurationHM.getOrDefault(DDMConfigurationConstant.STOP_DELIVERY_FOR_PENDING_PAYMENT_OF_BILLED_LR_ON_NO_OF_DAYS, false);
			final var 	checkDoorDeliveryAmount			= (boolean) ddmConfigurationHM.getOrDefault(DDMConfigurationConstant.CHECK_DOOR_DELIVERY_AMOUNT,false);
			final var	deliveryLocationList 			= cache.getAssignedLocationsIdListByLocationIdId(request, executive.getBranchId(), executive.getAccountGroupId());
			final var 	minDateTimeStamp				= cache.getModuleWiseMinDateToGetData(request, executive.getAccountGroupId(), ModuleWiseMinDateSelectionConfigurationDTO.CREATE_DDM_MIN_DATE_ALLOW, ModuleWiseMinDateSelectionConfigurationDTO.CREATE_DDM_MIN_DATE);

			ddmConfigurationHM.put("isPendingDeliveryTableEntry", isPendingDeliveryTableEntry);
			ddmConfigurationHM.put(Constant.MIN_DATE_TIME_STAMP, minDateTimeStamp);
			ddmConfigurationHM.put(Constant.WAYBILL_NUMBER, wayBillNo);
			ddmConfigurationHM.put("branch", branch);
			ddmConfigurationHM.put("deliveryLocationList", deliveryLocationList);
			ddmConfigurationHM.put(GroupConfigurationPropertiesConstant.DOOR_DELIVERY_CHARGE_ID, groupConfig.get(GroupConfigurationPropertiesConstant.DOOR_DELIVERY_CHARGE_ID));

			var	ddmsArrList		= DDMGetData.getInstance().getSingleWayBillDetailsForDoorDelivery(executive, ddmConfigurationHM, branchesColl);

			if(ddmsArrList.isEmpty()) {
				jsonObjectOut.put(CargoErrorList.ERROR_DESCRIPTION, Constant.LR_NO_STR + " " + wayBillNo + " not found for Door Delivery !");
				return jsonObjectOut;
			}

			if (stopDeliveryOnNoOfDays && ddmsArrList.get(0).getBillStatus() == BillClearanceStatusConstant.BILL_CLEARANCE_STATUS_DUE_PAYMENT_ID) {
				final var obj = ddmsArrList.get(0);

				if (obj.getBillDate() != null) {
					final var days 			= obj.getNoOfDays();
					final var difference 	= DateTimeUtility.getDayDiffBetweenTwoDates(obj.getBillDate(), DateTimeUtility.getCurrentTimeStamp());

					if (difference > days) {
						final var valueObject = new ValueObject();
						valueObject.put(Constant.NO_OF_DAYS, days);
						jsonObjectOut.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.errorDescription(CargoErrorList.PAYMENT_NOT_CLEARED, valueObject));
						return jsonObjectOut;
					}
				}
			}

			final Map<Long, DoorDeliveryMemo>	ddmsHM				= new HashMap<>();

			final var wbIdsStr			= ddmsArrList.stream().map(e -> Long.toString(e.getWayBillId())).collect(Collectors.joining(Constant.COMMA));

			if(execFldPermissions.get(FeildPermissionsConstant.SHOW_LR_WISE_LORRY_HIRE_COLUMN) != null) {
				final var	rateMasterList	= DeliveryRateMasterDaoImpl.getInstance().getRateMasterDetailsForEditByWhereClause(getWhereClause(executive.getAccountGroupId(), executive.getBranchId()));
				consDetailsHm	= ConsignmentDetailsDao.getInstance().getLimitedConsignmentDetailsByWayBillIds(wbIdsStr);

				if(ObjectUtils.isNotEmpty(rateMasterList))
					destWiseRateHm	= rateMasterList.stream().collect(Collectors.groupingBy(DeliveryRateMaster::getDestinationBranchId));
			}

			if(ddmsArrList.size() == 1) {
				final var	ddm	= ddmsArrList.get(0);

				if(defaultDeliveryAtSelection && ddm.getDeliveryTo() != deliveryAtSelectionVal) {
					jsonObjectOut.put(CargoErrorList.ERROR_DESCRIPTION, Constant.LR_NO_STR + wayBillNo + " is Not For Delivery!");
					return jsonObjectOut;
				}

				if(isCTODetainAllowed && ddm.getCtoDetainedStatus() == CTODetainModel.DETAINED_STATUS) {
					jsonObjectOut.put(CargoErrorList.ERROR_DESCRIPTION, UserErrors.ERROR_ID_LR_IS_DETAINED_FOR_DELIVERY_DESCRIPTION);
					return jsonObjectOut;
				}

				if(quantityMismatchCheck && ddm.getPendingQuantity() != ddm.getQuantity()) {
					jsonObjectOut.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.DELIVERY_QUANTITY_MISMATCH_ERROR_DESCRIPTION);
					return jsonObjectOut;
				}

				if(checkDoorDeliveryAmount && Utility.isIdExistInLongList(ddmConfigurationHM, DDMConfigurationConstant.WAYBILL_TYPE_FOR_CHECKING_DOOR_DELIVERY_AMOUNT, ddm.getWayBillTypeId()) && ddm.getDoorDeliveryAmt() == 0) {
					jsonObjectOut.put(CargoErrorList.ERROR_DESCRIPTION, " Door Delivery Amount Is Missing !");
					return jsonObjectOut;
				}
			} else {
				if(defaultDeliveryAtSelection)
					ddmsArrList	= ListFilterUtility.filterList(ddmsArrList, e -> (e.getDeliveryTo() == deliveryAtSelectionVal));

				if(isCTODetainAllowed)
					ddmsArrList	= ListFilterUtility.filterList(ddmsArrList, e -> (e.getCtoDetainedStatus() != CTODetainModel.DETAINED_STATUS));

				if(quantityMismatchCheck)
					ddmsArrList	= ListFilterUtility.filterList(ddmsArrList, e -> (e.getPendingQuantity() == e.getQuantity()));

				if(checkDoorDeliveryAmount) {
					final var lrTypeList	= CollectionUtility.getLongListFromString((String) ddmConfigurationHM.getOrDefault(DDMConfigurationConstant.WAYBILL_TYPE_FOR_CHECKING_DOOR_DELIVERY_AMOUNT, "0"));
					ddmsArrList	= ListFilterUtility.filterList(ddmsArrList, e -> lrTypeList.contains(e.getWayBillTypeId()) && e.getDoorDeliveryAmt() != 0 || !lrTypeList.contains(e.getWayBillTypeId()));
				}

				if(ddmsArrList.isEmpty()) {
					jsonObjectOut.put(CargoErrorList.ERROR_DESCRIPTION, Constant.LR_NO_STR + " " + wayBillNo + " not found for Door Delivery !");
					return jsonObjectOut;
				}
			}

			displayDataConfig.put("execFeildPermission", cache.getExecutiveFieldPermission(request));
			displayDataConfig.put(Constant.EXECUTIVE_TYPE, executive.getExecutiveType());

			final var lrTypeWiseZeroAmountHM	= DisplayDataConfigurationBllImpl.getInstance().lrTypeWiseZeroAmountHMModule(displayDataConfig,
					ddmsArrList.stream().filter(e -> e.getWayBillTypeId() > 0).map(DoorDeliveryMemo::getWayBillTypeId).collect(Collectors.toSet()), ModuleIdentifierConstant.CREATE_DDM);

			final var 	allBranchesOfGroup = cache.getAllGroupBranches(request, executive.getAccountGroupId());

			for (final DoorDeliveryMemo element : ddmsArrList) {
				final var destinationBranch	= (Branch) branchesColl.get(Long.toString(element.getDestinationBranchId()));

				if(destinationBranch != null && destinationBranch.getTypeOfLocation() == Branch.TYPE_OF_LOCATION_OPERATIONAL_PLACE) {
					final var locationMap = cache.getLocationMappingDetailsByAssignedLocationId(request, executive.getAccountGroupId(), destinationBranch.getBranchId());

					if(locationMap != null) {
						final var	branchLocation	= (Branch) branchesColl.get(Long.toString(locationMap.getLocationId()));
						element.setLocationId(locationMap.getLocationId());
						element.setLocationName(branchLocation != null ? branchLocation.getName() : "");
					}
				}

				element.setConsigneePhoneNumber(Utility.checkedNullCondition(element.getConsigneePhoneNumber(), (short) 4));
				element.setWayBillTypeStr(WayBillTypeConstant.getWayBillTypeNameByWayBilTypeId(element.getWayBillTypeId()));

				if(element.getCreationDateTimeStamp() != null)
					element.setCreationDateForUser(DateTimeUtility.getDateFromTimeStamp(element.getCreationDateTimeStamp()));
				else
					element.setCreationDateForUser(DateTimeUtility.getCurrentDateString());

				element.setWayBillBookingDateStr(DateTimeUtility.getDateFromTimeStamp(element.getWayBillBookingDateTimeStamp()));
				element.setDeliveryToForUser(InfoForDeliveryConstant.getInfoForDelivery(element.getDeliveryTo()));

				if(Boolean.TRUE.equals(lrTypeWiseZeroAmountHM.getOrDefault(element.getWayBillTypeId(), false)))
					element.setGrandTotal(0);

				if(ObjectUtils.isNotEmpty(destWiseRateHm)) {
					final var rateList = destWiseRateHm.getOrDefault(element.getDestinationBranchId(), null);

					if(rateList != null) {
						final var	chargeTypeIdRateList	= DDMGetData.getInstance().filterRate(element, rateList, executive);

						if(chargeTypeIdRateList != null)
							element.setLrWiseLorryHireAmount(DDMGetData.getInstance().getLorryHireAmount(element, chargeTypeIdRateList, consDetailsHm));
					}
				}

				DDMGetData.getInstance().setLimitedData(element, executive, lrTypeWiseZeroAmountHM, allBranchesOfGroup, ddmConfigurationHM);

				ddmsHM.put(element.getWayBillId(), element);
			}

			jsonObjectOut.put("ddms", ddmsArrList);
			jsonObjectOut.put("ddmsHM", ddmsHM);

			final var ddmSettlementGetData	= new DDMSettlementGetData();

			if(showBookingCharges) {
				final var wayBillIdWiseBookingchargesHM = CommonBLL.getWBBookingChargeAmountsByIds(wbIdsStr);

				if(wayBillIdWiseBookingchargesHM != null && wayBillIdWiseBookingchargesHM.size() > 0)
					jsonObjectOut.put(AliasNameConstants.WB_ID_WISE_BOOKING_CHARGES, ddmSettlementGetData.getJSONObjForWBIdWiseBkgChrgs(wayBillIdWiseBookingchargesHM));
			}

			if(calculatedDeliveryChargeAmount)
				wayBillIdWiseDeliverychargesHM = CommonBLL.getWBDeliveryChargeAmountsByIdsForDdm(wbIdsStr, executive, branchesColl, ddmConfigurationHM, generateCRConfiguration);
			else
				wayBillIdWiseDeliverychargesHM = CommonBLL.getWBDeliveryChargeAmountsByIds(wbIdsStr);

			if(wayBillIdWiseDeliverychargesHM != null && wayBillIdWiseDeliverychargesHM.size() > 0)
				jsonObjectOut.put(AliasNameConstants.WB_ID_WISE_DELIVERY_CHARGES, ddmSettlementGetData.getJSONObjForWBIdWiseDelChrgs(wayBillIdWiseDeliverychargesHM));


			//jsonObjectOut.put("configuration", new JSONObject(ddmConfigurationHM));
			jsonObjectOut.put("isNewDDMCreation", (boolean) ddmConfigurationHM.getOrDefault(DDMConfigurationConstant.IS_NEW_DDM_CREATION, false));
			jsonObjectOut.put("compareLRReceiveDateWhileDDMCreation", (boolean) ddmConfigurationHM.getOrDefault(DDMConfigurationConstant.COMPARE_LR_RECEIVE_DATE_WHILE_DDM_CREATION, false));
			jsonObjectOut.put("allowToDecreaseDefaultMemoCharge", execFldPermissions.get(FeildPermissionsConstant.ALLOW_TO_DECREASE_DEFAULT_MEMO_CHARGE) != null);

			return jsonObjectOut;
		} catch(final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
			return JsonUtility.setError(CargoErrorList.SYSTEM_ERROR, CargoErrorList.SYSTEM_ERROR_DESCRIPTION);
		}
	}

	private JSONObject getMultipleWayBillDetailsForDoorDelivery(final HttpServletRequest request, final JSONObject jsonObjectIn) throws Exception {
		Map<Long, Map<Long, Double>>		wayBillIdWiseDeliverychargesHM 	= null;

		try {
			final var 	cache			= new CacheManip(request);
			final var 	executive		= cache.getExecutive(request);
			final var 	jsonObjectOut	= new JSONObject();

			final var 	ddmConfigurationHM			= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.CREATE_DDM);
			final Map<Object, Object>	generateCRConfiguration		= cache.getGenerateCRConfiguration(request, executive.getAccountGroupId()).getHtData();

			final var calculatedDeliveryChargeAmount	= (boolean) ddmConfigurationHM.getOrDefault(DDMConfigurationConstant.CALCULATED_DELIVERY_CHARGE_AMOUNT, false);
			final var isNewDDMCreation					= (boolean) ddmConfigurationHM.getOrDefault(DDMConfigurationConstant.IS_NEW_DDM_CREATION, false);
			final var showBookingCharges				= (boolean) ddmConfigurationHM.getOrDefault(DDMConfigurationConstant.SHOW_BOOKING_CHARGES, false);
			final var wayBillIds						= jsonObjectIn.getString("wayBillIds");

			if(showBookingCharges) {
				final var wayBillIdWiseBookingchargesHM = CommonBLL.getWBBookingChargeAmountsByIds(wayBillIds);

				if(wayBillIdWiseBookingchargesHM != null && wayBillIdWiseBookingchargesHM.size() > 0)
					jsonObjectOut.put(AliasNameConstants.WB_ID_WISE_BOOKING_CHARGES, wayBillIdWiseBookingchargesHM);
			}

			final var	branchesColl = cache.getGenericBranchesDetail(request);

			if(calculatedDeliveryChargeAmount)
				wayBillIdWiseDeliverychargesHM = CommonBLL.getWBDeliveryChargeAmountsByIdsForDdm(wayBillIds, executive, branchesColl, ddmConfigurationHM, generateCRConfiguration);
			else
				wayBillIdWiseDeliverychargesHM = CommonBLL.getWBDeliveryChargeAmountsByIds(wayBillIds);

			if(wayBillIdWiseDeliverychargesHM != null && wayBillIdWiseDeliverychargesHM.size() > 0)
				jsonObjectOut.put(AliasNameConstants.WB_ID_WISE_DELIVERY_CHARGES, wayBillIdWiseDeliverychargesHM);

			jsonObjectOut.put("isNewDDMCreation", isNewDDMCreation);

			return jsonObjectOut;
		} catch(final Exception e) {
			throw ExceptionProcess.execute(e, AjaxAction.TRACE_ID);
		}
	}

	private JSONObject getNumberTypeDetails(final JSONObject jsonObjectIn) throws Exception {
		try {
			final var	jsonObjectOut	= new JSONObject();

			final var	partyId				= jsonObjectIn.optLong("partyId", 0);

			final var	paArrayList			= PartyNumberTypeMapBllImpl.getInstance().getPartyNumberTypeDetails(partyId);

			if(ObjectUtils.isNotEmpty(paArrayList))
				jsonObjectOut.put("numberTypeDetails", getPartyNumberTypeJSONArrayObject(paArrayList));
			else
				jsonObjectOut.put("notfound", "0");

			return jsonObjectOut;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, AjaxAction.TRACE_ID);
		}
	}

	private JSONObject getBranchDetailsByBranchId(final HttpServletRequest request, final JSONObject jsonObjectIn) throws Exception {
		var					branchId		= 0L;
		Branch				branch			= null;

		try {
			final var	jsonObjectOut	= new JSONObject();

			final var	cache	= new CacheManip(request);

			if (!jsonObjectIn.isNull("branchId")) {
				branchId		= Long.parseLong(jsonObjectIn.get("branchId").toString());
				branch			= cache.getGenericBranchDetailCache(request, branchId);
			}

			if(branch != null) {
				if(branch.getTypeOfLocation() == Branch.TYPE_OF_LOCATION_OPERATIONAL_PLACE) {
					final var	handlingBranch	= cache.getGenericBranchDetailCache(request, branch.getHandlingBranchId());

					if(handlingBranch != null)
						jsonObjectOut.put("handlingBranch", Converter.DtoToHashMap(handlingBranch));
				}

				jsonObjectOut.put("branch", Converter.DtoToHashMap(branch));
			}

			return jsonObjectOut;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, AjaxAction.TRACE_ID);
		}
	}

	public JSONArray getPartyNumberTypeJSONArrayObject(final List<PartyNumberTypeMap> paArrayList) throws Exception {
		try {
			final var	valueObjArray = new JSONArray();

			paArrayList.forEach((final PartyNumberTypeMap partyNumberTypeMap) -> valueObjArray.put(new JSONObject(partyNumberTypeMap)));

			return valueObjArray;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, AjaxAction.TRACE_ID);
		}
	}

	private JSONObject getLimitedPartyDetails(final JSONObject jsonObjectIn) throws Exception {
		try {
			final var	jsonObjectOut	= new JSONObject();

			if (!jsonObjectIn.isNull("partyId")) {
				final var				partyId		= Long.parseLong(jsonObjectIn.get("partyId").toString());
				final var	party		= CorporateAccountDao.getInstance().getLimitedPartyDataById(partyId);

				if (party != null)
					jsonObjectOut.put("partyDetails", new JSONObject(Converter.DtoToHashMap(party)));
			}

			return jsonObjectOut;
		} catch(final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
			return JsonUtility.setError(CargoErrorList.SYSTEM_ERROR, CargoErrorList.SYSTEM_ERROR_DESCRIPTION);
		}
	}

	public ValueObject getDiscountTypesValObj(final List<String> discountTypesAL) throws Exception {
		try {
			if(discountTypesAL == null || discountTypesAL.isEmpty())
				return null;

			final var	discountTypes	= new ValueObject();

			for (final String element : discountTypesAL)
				discountTypes.put(element.split("_")[0], element.split("_")[1]);

			return discountTypes;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, AjaxAction.TRACE_ID);
		}
	}

	private JSONObject refreshCacheForCharges(final HttpServletRequest request, final JSONObject jsonObjectIn) throws Exception {
		try {
			final var	cache	= new CacheManip(request);
			final var	executive 	= cache.getExecutive(request);

			cache.refreshCacheForBookingChargesOld(request, executive.getAccountGroupId());
			cache.refreshCacheForDeliveryChargesOld(request, executive.getAccountGroupId());
			cache.refreshCacheForBookingCharges(request, executive.getAccountGroupId());
			cache.refreshCacheForDeliveryCharges(request, executive.getAccountGroupId());

			jsonObjectIn.put("success","ok");

			return jsonObjectIn;
		} catch(final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
			return JsonUtility.setError(CargoErrorList.SYSTEM_ERROR, CargoErrorList.SYSTEM_ERROR_DESCRIPTION);
		}
	}

	@SuppressWarnings("unchecked")
	private JSONObject getHeaderList(final HttpServletRequest request, final HttpServletResponse response, final JSONObject jsonObjectIn) throws Exception {
		Map<String, Map<String, List<String>>>				operationList		= null;
		Map<String, Map<String, List<String>>>				mastersList			= null;
		Map<String, Map<String, List<String>>>				dashboardList		= null;
		Map<String, List<String>>							reportList			= null;

		try {
			final var	cache		= new CacheManip(request);
			final var 	sessionObj	= request.getSession(false);
			final var	execHeader	= cache.getExecutive(request);

			if(sessionObj == null || execHeader == null || sessionObj.getAttribute("isManualPermitted") == null) {
				response.sendRedirect("Logout.do?pageId=1&eventId=2");
				return jsonObjectIn;
			}

			final var	headerList				= (Map<String, com.iv.dto.ExecutiveFunctionsModel>) sessionObj.getAttribute("headerList");
			final var	marqueeList				= cache.getMarqueeList(request);
			final var	transportList			= cache.getTransportList(request);
			final var	headerConfig			= cache.getHeaderConfiguration(request, execHeader.getAccountGroupId());
			final var	branchData				= cache.getGenericBranchDetailCache(request, execHeader.getBranchId());
			final var 	execFunctions			= cache.getExecFunctions(request);
			final var 	serverIpAddressConfig 	= cache.getConfiguration(request, ModuleIdentifierConstant.SERVER_IP_ADDRESS);
			final var 	countDownDateTime		= (String) headerConfig.getOrDefault(HeaderConfigurationConstant.COUNT_DOWN_DATE_TIME, DateTimeUtility.getCurrentDateString());
			final var 	chatConfig 				= cache.getConfiguration(request, execHeader.getAccountGroupId(), ModuleIdentifierConstant.CHAT);

			final var	wayBillModel			= headerList.get(BusinessFunctionConstants.WAYBILL);
			final var	reportModel				= headerList.get(BusinessFunctionConstants.REPORT) != null ? headerList.get(BusinessFunctionConstants.REPORT) : headerList.get(BusinessFunctionConstants.NEWREPORT);
			final var	mastersModel			= headerList.get(BusinessFunctionConstants.MASTERS);
			final var	dashboardModel			= headerList.get(BusinessFunctionConstants.DASHBOARD);

			if(wayBillModel != null) operationList		= wayBillModel.getOperationList();
			if(mastersModel != null) mastersList		= mastersModel.getMasterList();
			if(dashboardModel != null) dashboardList	= dashboardModel.getDashboardList();
			if(reportModel != null) reportList			= reportModel.getReportList();

			final Map<Object, Object> wayBillModelHM	= DataObjectConvertor.toHashMap(wayBillModel);
			final Map<Object, Object> mastersModelHM	= DataObjectConvertor.toHashMap(mastersModel);
			final Map<Object, Object> dashboardModelHM	= DataObjectConvertor.toHashMap(dashboardModel);

			if(wayBillModelHM.containsKey("operationList"))
				wayBillModelHM.remove("operationList");

			if(mastersModelHM.containsKey("masterList"))
				mastersModelHM.remove("masterList");

			if(dashboardModelHM.containsKey("dashboardList"))
				dashboardModelHM.remove("dashboardList");

			jsonObjectIn.put("homeModel", DataObjectConvertor.toHashMap(headerList.get(BusinessFunctionConstants.HOME)));
			jsonObjectIn.put("wayBillModel", wayBillModelHM);
			jsonObjectIn.put("chatConfig", chatConfig);
			jsonObjectIn.put("searchModel", DataObjectConvertor.toHashMap(headerList.containsKey(BusinessFunctionConstants.SEARCHWAYBILL) ? headerList.get(BusinessFunctionConstants.SEARCHWAYBILL) : headerList.get(BusinessFunctionConstants.TRANSPORTSEARCHWAYBILL)));
			jsonObjectIn.put("searchModelNew", DataObjectConvertor.toHashMap(headerList.get(BusinessFunctionConstants.SEARCH_DETAILS)));
			jsonObjectIn.put("reportModel", DataObjectConvertor.toHashMap(reportModel));
			jsonObjectIn.put("profileModel", DataObjectConvertor.toHashMap(headerList.get(BusinessFunctionConstants.PROFILE)));
			jsonObjectIn.put("mastersModel", mastersModelHM);
			jsonObjectIn.put("dashBoardModel", dashboardModelHM);
			jsonObjectIn.put("tceModel", DataObjectConvertor.toHashMap(headerList.get(BusinessFunctionConstants.TCE)));
			jsonObjectIn.put("customerActivityModel", DataObjectConvertor.toHashMap(headerList.get(BusinessFunctionConstants.CUSTOMER_ACTIVITY)));
			jsonObjectIn.put("localBookingModel", DataObjectConvertor.toHashMap(headerList.get(BusinessFunctionConstants.LOCAL_BOOKING)));
			jsonObjectIn.put("ftlBookingModel", DataObjectConvertor.toHashMap(headerList.get(BusinessFunctionConstants.FTL)));
			jsonObjectIn.put("manualBookingModel", DataObjectConvertor.toHashMap(headerList.get(BusinessFunctionConstants.CREATE_WAY_BILL_MANUAL)));
			jsonObjectIn.put("operationsList", JsonConvertor.toJsonMapFromJsonListMap(operationList));
			jsonObjectIn.put("mastersList", JsonConvertor.toJsonMapFromJsonListMap(mastersList));
			jsonObjectIn.put("dashboardList", JsonConvertor.toJsonMapFromJsonListMap(dashboardList));
			jsonObjectIn.put("reportList", JsonConvertor.toJsonMapFromJsonListMap1(reportList));
			jsonObjectIn.put("transportSearch", transportList.contains(execHeader.getAccountGroupId()) || cache.getTransportSearchModuleForCargo(request, execHeader.getAccountGroupId()));
			jsonObjectIn.put("userNameWithArea", sessionObj.getAttribute("userNameWithArea"));
			jsonObjectIn.put("isManualPermitted", (boolean) sessionObj.getAttribute("isManualPermitted"));
			jsonObjectIn.put("isLocalBookingPermitted", (boolean) sessionObj.getAttribute("isLocalBookingPermitted"));
			jsonObjectIn.put("isFtlBookingPermitted", (boolean) sessionObj.getAttribute("isFtlBookingPermitted"));
			jsonObjectIn.put("paidBooking", (boolean) sessionObj.getAttribute("paidBookingAllow"));
			jsonObjectIn.put("topayBooking", (boolean) sessionObj.getAttribute("topayBookingAllow"));
			jsonObjectIn.put("tbbBooking", (boolean) sessionObj.getAttribute("tbbBookingAllow"));
			jsonObjectIn.put("focBooking", (boolean) sessionObj.getAttribute("focBookingAllow"));
			jsonObjectIn.put("subRegionWiseLimitedPermission", (boolean) sessionObj.getAttribute("subRegionWiseLimitedPermission"));
			jsonObjectIn.put("enableRightClick", (boolean) sessionObj.getAttribute("enableRightClick"));
			jsonObjectIn.put("gtag", sessionObj.getServletContext().getAttribute("gtag"));
			jsonObjectIn.put(Constant.ACCOUNT_GROUP_ID, execHeader.getAccountGroupId());
			jsonObjectIn.put(Constant.BRANCH_ID, execHeader.getBranchId());
			jsonObjectIn.put(Constant.EXECUTIVE_ID, execHeader.getExecutiveId());
			jsonObjectIn.put("executiveName", execHeader.getName());
			jsonObjectIn.put("minDate", cache.getMinDateInReports(request, execHeader.getAccountGroupId()));

			if(sessionObj.getAttribute(Constant.LOGO_PATH) != null)
				jsonObjectIn.put(Constant.LOGO_PATH, sessionObj.getAttribute(Constant.LOGO_PATH));

			jsonObjectIn.put("headerConfig", headerConfig);
			jsonObjectIn.put("groupName", sessionObj.getAttribute("fullGroupName"));
			jsonObjectIn.put(ServerIPAddressConfigurationConstant.IV_FLEET_URL, serverIpAddressConfig.get(ServerIPAddressConfigurationConstant.IV_FLEET_URL));
			jsonObjectIn.put(HeaderConfigurationConstant.SHOW_COUNT_DOWN_TIMER, (boolean) headerConfig.getOrDefault(HeaderConfigurationConstant.SHOW_COUNT_DOWN_TIMER, false) && DateTimeUtility.isTimeGreaterThanCurrentTime(countDownDateTime, DateTimeFormatConstant.MMM_DD_YY_HH_MM_SS));

			if(ObjectUtils.isNotEmpty(marqueeList))
				jsonObjectIn.put("marqueeList", DataObjectConvertor.dtoArrayListtoArrayListWithHashMapConversion(marqueeList));

			jsonObjectIn.put("storeGeoLocation", branchData != null && branchData.getLatitude() == null && branchData.getLongitude() == null);
			jsonObjectIn.put("curSystemDate", DateTimeUtility.getCurrentDateForServer());
			jsonObjectIn.put(Constant.WEBSITE_PATH, sessionObj.getAttribute(Constant.WEBSITE_PATH));

			if(execFunctions.containsKey(BusinessFunctionConstants.GENERATE_CR_MODULE_FOR_SINGLE_LR))
				jsonObjectIn.put("deliveryPageUrl", execFunctions.get(BusinessFunctionConstants.GENERATE_CR_MODULE_FOR_SINGLE_LR).getUrl());

			if(execFunctions.containsKey(BusinessFunctionConstants.LIVE_BRANCHES))
				jsonObjectIn.put("liveBranchesUrl", execFunctions.get(BusinessFunctionConstants.LIVE_BRANCHES).getUrl());

			if(execFunctions.containsKey(BusinessFunctionConstants.WELCOME))
				jsonObjectIn.put("announcementPageUrl", execFunctions.get(BusinessFunctionConstants.WELCOME).getUrl());

			jsonObjectIn.put("branchDetailsPageUrl", execFunctions.get(BusinessFunctionConstants.BRANCH_DETAILS).getUrl());

			if(execFunctions.containsKey(BusinessFunctionConstants.PENDING_BRANCH_OPERATIONS))
				jsonObjectIn.put("pendingBranchOperationsUrl", execFunctions.get(BusinessFunctionConstants.PENDING_BRANCH_OPERATIONS).getUrl());

			if(execFunctions.containsKey(BusinessFunctionConstants.NOTIFICATION_REPORT))
				jsonObjectIn.put("notificationReportUrl", execFunctions.get(BusinessFunctionConstants.NOTIFICATION_REPORT).getUrl());

			return jsonObjectIn;
		} catch(final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
			return JsonUtility.setError(CargoErrorList.SYSTEM_ERROR, CargoErrorList.SYSTEM_ERROR_DESCRIPTION);
		}
	}

	private JSONObject checkExecutiveSession(final HttpServletRequest request) throws Exception {
		try {
			final var	executive	= (Executive) request.getSession().getAttribute(Executive.EXECUTIVE);

			if(executive == null)
				return JsonUtility.setError(CargoErrorList.SESSION_INVALID, CargoErrorList.SESSION_INVALID_DESCRIPTION);

			final var	jsonObjectOut	= new JSONObject();

			jsonObjectOut.put(Executive.EXECUTIVE, DataObjectConvertor.toHashMap(executive));

			return jsonObjectOut;
		} catch (final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
			return JsonUtility.setError(CargoErrorList.SYSTEM_ERROR, CargoErrorList.SYSTEM_ERROR_DESCRIPTION);
		}
	}

	private String getWhereClause(final long accountGroupId, final long branchId) throws Exception {
		final var whereClause = new StringJoiner(" AND ");

		try {
			whereClause.add("drm.AccountGroupId = " + accountGroupId);
			whereClause.add("drm.BranchId = " + branchId);
			whereClause.add("drm.RateTypeId = " + DeliveryRateMaster.DDM_RATE_TYPE_ID);
			whereClause.add("drm.MarkForDelete = 0");

			return whereClause.toString();
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}
}