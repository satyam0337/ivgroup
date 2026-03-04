package com.ivcargo.ajax;

import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.StringJoiner;
import java.util.TreeMap;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONObject;

import com.businesslogic.ChargeConfigurationBLL;
import com.businesslogic.DeliveryChargeConfigurationBLL;
import com.businesslogic.DeliveryRateBLL;
import com.businesslogic.RateMasterBLL;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.bll.impl.master.AccountGroupPermissionsBllImpl;
import com.iv.constant.properties.master.RateMasterPropertiesConstant;
import com.iv.convertor.DataObjectConvertor;
import com.iv.dao.impl.master.bookingrate.ChargeConfigurationDaoImpl;
import com.iv.dao.impl.master.bookingrate.RateMasterDaoImpl;
import com.iv.dto.constant.BillSelectionConstant;
import com.iv.dto.constant.BusinessFunctionConstants;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.dto.constant.RateMasterConstant;
import com.iv.dto.master.bookingrate.ChargeConfiguration;
import com.iv.resource.ResourceManager;
import com.iv.utils.constant.Constant;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.exception.ExceptionProcess;
import com.iv.utils.utility.CollectionUtility;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.ivcargo.utils.JsonUtility;
import com.platform.dao.DeliveryRateMasterDao;
import com.platform.dao.PackingGroupMappingDao;
import com.platform.dao.RateMasterDao;
import com.platform.dao.RateMasterDaoModel;
import com.platform.dto.Branch;
import com.platform.dto.DeliveryRateMaster;
import com.platform.dto.Executive;
import com.platform.dto.PackingGroupMapping;
import com.platform.dto.RateMaster;
import com.platform.dto.TransportCommonMaster;
import com.platform.dto.configuration.modules.GroupConfigurationPropertiesDTO;
import com.platform.dto.constant.BookingChargeConstant;
import com.platform.dto.constant.BookingTypeConstant;
import com.platform.dto.constant.ChargeTypeConstant;
import com.platform.dto.model.ChargeTypeModel;
import com.platform.utils.Converter;
import com.platform.utils.Utility;

public class GenericRateAjaxAction implements Action {

	private static final String CONTENT_TYPE	= "application/json";

	@SuppressWarnings({ })
	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {

		HashMap<String, Object>	error 				= null;
		Executive				executive 			= null;
		StringJoiner			strBfr 				= null;
		var result	= "";
		PrintWriter				out					= null;
		CacheManip				cache				= null;
		Map<Long, Double>		rateIdMast 						= null;
		RateMaster[]			rateMaster						= null;
		RateMaster				rateMasterObj					= null;
		List<ChargeConfiguration>	chargeConfigurationArr			= null;
		String						configurationBranchCorporate	= null;
		String						configurationBranch				= null;
		ValueObject				configuration		= null;
		short 					filter				= 0;
		short 					rateTypeId			= 0;
		var					srcBranchId			= 0L;
		var					destBranchId		= 0L;
		var					vehicleTypeId		= 0L;
		short					categoryTypeId		= 0;
		var					corporateAccountId	= 0L;
		short					chargeTypeId		= 0;
		JSONObject				jsonObjectIn		= null;
		JSONObject				jsonObjectOut		= null;
		ValueObject				dataVl				= null;
		ValueObject				valueObjectOut		= null;
		ChargeTypeModel[] 		charges				= null;
		Connection 				conn				= null;

		try {

			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request, error))
				return;

			cache					= new CacheManip(request);

			response.setContentType("text/plain");
			executive		= cache.getExecutive(request);
			if (executive == null)
				return;
			strBfr			= new StringJoiner(",");
			filter			= Short.parseShort(request.getParameter("filter"));
			configuration				= cache.getGroupConfiguration(request, executive.getAccountGroupId());
			final var	accountGroupPermissionHM	= cache.getGroupPermissionHMByUniqueName(request, executive.getAccountGroupId());

			switch (filter) {

			case 1: //Get Packing Type Wise Rates
				//NityadarTravelsCreateWayBill.jsp

				try {
					if(executive != null)
						result	= getArticleWiseFilteredRate(request, executive);

					out = response.getWriter();
					out.println(result);
					out.flush();
					request.setAttribute("nextPageToken", "success");
				} catch (final Exception e) {
					e.printStackTrace();
				} finally {
					if(out != null) out.close();
				}

				break;
			case 2: //Get Weight Type Wise Rates
				//NityadarTravelsCreateWayBill.jsp
				strBfr = new StringJoiner(",");

				try {
					if(executive != null)
						result	= getWeightWiseFilteredRate(request, executive);

					out = response.getWriter();
					out.println(result);
					out.flush();
					request.setAttribute("nextPageToken", "success");
				} catch (final Exception e) {
					e.printStackTrace();
				} finally {
					if(out != null) out.close();
				}

				break;
				//Minimum Party Rate (only Route Level)
			case 3:
				strBfr = new StringJoiner(",");

				if(executive != null) {

					srcBranchId			= Long.parseLong(request.getParameter("srcBranchId"));
					destBranchId		= Long.parseLong(request.getParameter("destBranchId"));
					corporateAccountId	= Long.parseLong(request.getParameter("corporateAccountId"));
					categoryTypeId		= Short.parseShort(request.getParameter("categoryTypeId"));
					rateTypeId			= JSPUtility.GetShort(request, "rateTypeId", (short)0);
					chargeTypeId		= 0;
					rateIdMast			= new TreeMap<>();

					if(categoryTypeId == RateMaster.CATEGORY_TYPE_PARTY_ID && corporateAccountId > 0)
						rateMaster = RateMasterDao.getInstance().getMinimumRates(srcBranchId,destBranchId,executive.getAccountGroupId(),RateMaster.CATEGORY_TYPE_PARTY_ID,0,0,0,0,corporateAccountId,chargeTypeId,rateTypeId,RateMaster.CHARGE_SECTION_PARTY_NAME_MINIMUM_RATE_ID);
					else if (corporateAccountId > 0)
						rateMaster = RateMasterDao.getInstance().getMinimumRates(srcBranchId,destBranchId,executive.getAccountGroupId(),RateMaster.CATEGORY_TYPE_TBB_ID,0,0,0,0,corporateAccountId,chargeTypeId,rateTypeId,RateMaster.CHARGE_SECTION_PARTY_NAME_MINIMUM_RATE_ID);

					if(rateMaster != null && rateMaster.length > 0)
						for (final RateMaster element : rateMaster)
							if(rateIdMast.get(element.getChargeTypeMasterId()) == null && element.getRate() > 0)
								rateIdMast.put(element.getChargeTypeMasterId(), element.getRate());

					if(rateIdMast.size() <= 0) {
						rateMaster = RateMasterDao.getInstance().getMinimumRates(srcBranchId,destBranchId,executive.getAccountGroupId(),RateMaster.CATEGORY_TYPE_GENERAL_ID,0,0,0,0,0,chargeTypeId,(short)0,RateMaster.CHARGE_SECTION_PARTY_NAME_MINIMUM_RATE_ID);

						if(rateMaster != null && rateMaster.length > 0)
							for (final RateMaster element : rateMaster)
								if(rateIdMast.get(element.getChargeTypeMasterId()) == null && element.getRate() > 0)
									rateIdMast.put(element.getChargeTypeMasterId(), element.getRate());
					}

					final var count =	rateIdMast.size();

					if(count > 0)
						for(final Map.Entry<Long, Double> entry : rateIdMast.entrySet())
							strBfr.add(entry.getKey() + "=" + entry.getValue());
				}

				out = response.getWriter();

				if(out != null && strBfr != null) {
					out.println(strBfr.toString());
					out.flush();
					out.close();
				}
				request.setAttribute("nextPageToken", "success");

				break;

			case 4 : // get Rates
				//Rate.js
				response.setContentType(GenericRateAjaxAction.CONTENT_TYPE); // Setting response for JSON Content

				if(accountGroupPermissionHM != null && !AccountGroupPermissionsBllImpl.getInstance().isGroupLevelPermission(accountGroupPermissionHM, BusinessFunctionConstants.ADVANCED_RATE_MASTER))
					return;

				jsonObjectIn			= new JSONObject(request.getParameter("json"));
				jsonObjectOut			= new JSONObject();
				dataVl					= JsonUtility.convertJsontoValueObject(jsonObjectIn);

				final var srcBranch			= cache.getGenericBranchDetailCache(request, dataVl.getLong("srcBranchId", 0));
				final var destBranchObj		= cache.getGenericBranchDetailCache(request, dataVl.getLong("destBranchId", 0));

				final var rateMasterConfig	= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.BOOKING_RATE_MASTER);

				dataVl.put(Executive.EXECUTIVE, executive);
				dataVl.put(GroupConfigurationPropertiesDTO.GROUP_CONFIGURATION, configuration);
				dataVl.put(Constant.STATE_ID, srcBranch != null ? srcBranch.getStateId() : 0);
				dataVl.put(Constant.TO_STATE_ID, destBranchObj != null ? destBranchObj.getStateId() : 0);
				dataVl.put(Constant.SUB_REGION_ID, srcBranch != null ? srcBranch.getSubRegionId() : 0);
				dataVl.put(Constant.DESTINATION_SUB_REGION_ID, destBranchObj != null ? destBranchObj.getSubRegionId() : 0);
				dataVl.put(Constant.TO_STATE_ID, destBranchObj != null ? destBranchObj.getStateId() : 0);

				if(!(boolean) rateMasterConfig.getOrDefault(RateMasterPropertiesConstant.SHOW_DELIVERY_TO, false))
					dataVl.put(Constant.DELIVERY_TO_ID, 0);

				if(dataVl.getLong("srcBranchId", 0) != 0)
					valueObjectOut	= RateMasterBLL.getInstance().getAllRatesForWaybill(dataVl);

				if (valueObjectOut != null)
					jsonObjectOut	= JsonUtility.convertionToJsonObjectForResponse(valueObjectOut);

				out = response.getWriter();
				out.println(jsonObjectOut);
				out.flush();

				if(out != null) out.close();

				break;

			case 5 : // get Charge configuration Rates
				//Rate.js
				response.setContentType(GenericRateAjaxAction.CONTENT_TYPE); // Setting response for JSON Content

				final var	configurationBLL	= new ChargeConfigurationBLL();

				jsonObjectIn			= new JSONObject(request.getParameter("json"));
				jsonObjectOut			= new JSONObject();
				dataVl					= JsonUtility.convertJsontoValueObject(jsonObjectIn);

				dataVl.put(Constant.ACCOUNT_GROUP_ID, executive.getAccountGroupId());
				dataVl.put("loginBranchId", executive.getBranchId());
				dataVl.put(GroupConfigurationPropertiesDTO.GROUP_CONFIGURATION, configuration);

				valueObjectOut	= configurationBLL.getChargesRateConfiguration(dataVl);

				if (valueObjectOut != null)
					jsonObjectOut	= JsonUtility.convertionToJsonObjectForResponse(valueObjectOut);

				out = response.getWriter();
				out.println(jsonObjectOut);
				out.flush();
				if(out != null) out.close();

				break;
			case 6 : // get Charge configuration Rates
				//DeliveryRateMasterNew.js
				//ApplyRate.js

				response.setContentType(GenericRateAjaxAction.CONTENT_TYPE); // Setting response for JSON Content

				final var	deliveryconfigurationBLL	= new DeliveryChargeConfigurationBLL();
				charges 					= cache.getActiveDeliveryCharges(request, executive.getBranchId());
				final var	    		dlyRateMaster			 	= new DeliveryRateMaster();
				short							selectionFilter			 	= 0;

				jsonObjectIn			= new JSONObject(request.getParameter("json"));
				jsonObjectOut			= new JSONObject();
				dataVl					= JsonUtility.convertJsontoValueObject(jsonObjectIn);

				dataVl.put(Constant.ACCOUNT_GROUP_ID, executive.getAccountGroupId());

				selectionFilter = dataVl.getShort("selectionFilter", selectionFilter);

				valueObjectOut	= deliveryconfigurationBLL.getChargesDeliveryRateConfiguration(dataVl);

				if(valueObjectOut == null)
					valueObjectOut = new ValueObject();

				valueObjectOut.put("deliveryCharges", Converter.arrayDtotoArrayListWithHashMapConversion(charges));

				if(selectionFilter > 0) {
					dlyRateMaster.setAccountGroupId(executive.getAccountGroupId());
					dlyRateMaster.setBranchId(dataVl.getLong("branchId", 0));
					dlyRateMaster.setCorporateAccountId(dataVl.getLong("corporateAccountId", 0));
					dlyRateMaster.setCategoryTypeId(dataVl.getShort("categoryTypeId", (short) 0));

					final var	deliveryRateMasterArray = DeliveryRateMasterDao.getInstance().getRateMasterDetailsForEdit(dlyRateMaster);
					valueObjectOut.put("deliveryRateMasterArray", Converter.dtoListtoListWithHashMapConversion(deliveryRateMasterArray));
				}

				jsonObjectOut	  = JsonUtility.convertionToJsonObjectForResponse(valueObjectOut);

				out = response.getWriter();
				out.println(jsonObjectOut);
				out.flush();
				if(out != null) out.close();

				break;

			case 7 : // get Charge configuration Rates

				response.setContentType(GenericRateAjaxAction.CONTENT_TYPE); // Setting response for JSON Content

				final var	delconfigurationBLL	= new DeliveryChargeConfigurationBLL();
				jsonObjectIn			= new JSONObject(request.getParameter("json"));
				jsonObjectOut			= new JSONObject();
				dataVl					= JsonUtility.convertJsontoValueObject(jsonObjectIn);

				dataVl.put(Constant.ACCOUNT_GROUP_ID, executive.getAccountGroupId());

				valueObjectOut	= delconfigurationBLL.getChargesRateConfiguration(dataVl);

				if (valueObjectOut != null)
					jsonObjectOut	= JsonUtility.convertionToJsonObjectForResponse(valueObjectOut);

				out = response.getWriter();
				out.println(jsonObjectOut);
				out.flush();
				if(out != null) out.close();

				break;
			case 8 : // get Rates
				//ApplyRate.js
				response.setContentType(GenericRateAjaxAction.CONTENT_TYPE); // Setting response for JSON Content

				final var	deliveryRateBLL		= new DeliveryRateBLL();

				jsonObjectIn			= new JSONObject(request.getParameter("json"));
				jsonObjectOut			= new JSONObject();
				dataVl					= JsonUtility.convertJsontoValueObject(jsonObjectIn);

				dataVl.put(Constant.ACCOUNT_GROUP_ID, executive.getAccountGroupId());

				valueObjectOut	= deliveryRateBLL.getAllRatesForWaybill(dataVl);

				if (valueObjectOut != null)
					jsonObjectOut	= JsonUtility.convertionToJsonObjectForResponse(valueObjectOut);

				out = response.getWriter();
				out.println(jsonObjectOut);
				out.flush();
				if(out != null) out.close();

				break;
			case 14:
				//Rate.js
				/*
				 * Get Party wise rate to apply for LMT
				 *
				 * Added by 	- Anant Chaudhary	14-12-2016
				 */
				final var 	qtyMapWithPackage 	= new HashMap<Long,Integer>();

				String[] 				packagesStr;
				String[]				temp 				= null;
				var					hamaliAmount		= 0.00;
				var					frieghtAmount		= 0.00;
				var 					weightHamaliAmount	= 0.00;
				var 					purefrieghtAmount	= 0.00;
				var 					purefrieghtQtyAmount= 0.00;
				short 					categoryId;
				short					bookingTypeId;
				double					weight;
				var						qty					= 0;
				Branch					destBranch;
				var	rateIdChargeAmt	= new HashMap<Long, Double>();
				List<Short> 			formTypesList;

				out = response.getWriter();
				valueObjectOut			= new ValueObject();

				jsonObjectIn			= new JSONObject(request.getParameter("json"));
				dataVl					= JsonUtility.convertJsontoValueObject(jsonObjectIn);

				categoryId				= dataVl.getShort("categoryId", (short) 0);
				corporateAccountId		= dataVl.getLong("corporateAccountId", 0);
				bookingTypeId			= dataVl.getShort("bookingTypeId",  (short) 0);
				packagesStr 			= dataVl.getString("packagesStr", "").split(",");
				srcBranchId				= dataVl.getLong("srcBranchId", 0);
				destBranchId			= dataVl.getLong("destBranchId", 0);
				vehicleTypeId			= dataVl.getLong("vehicleTypeId", 0);
				weight					= dataVl.getDouble("weight", 0);
				formTypesList			= getFormTypesFromJsonObject(jsonObjectIn, configuration);

				RateMaster[]				generalMas			= null;
				Map<Long, RateMaster>		rateMapIP;

				configurationBranchCorporate	= getRateConfig(executive.getAccountGroupId(), executive.getBranchId(), corporateAccountId);

				for (final String element : packagesStr) {
					temp = element.split("=");

					if(qtyMapWithPackage.get(Long.parseLong(temp[0])) != null)
						qtyMapWithPackage.put(Long.parseLong(temp[0]), qtyMapWithPackage.get(Long.parseLong(temp[0])) + Integer.parseInt(temp[1]));
					else
						qtyMapWithPackage.put(Long.parseLong(temp[0]), Integer.parseInt(temp[1]));
				}

				rateMapIP				= new HashMap<>();
				chargeConfigurationArr	= ChargeConfigurationDaoImpl.getInstance().getChargesRatesInBooking(configurationBranchCorporate);

				if(chargeConfigurationArr == null || chargeConfigurationArr.isEmpty()) {
					configurationBranch		= getRateConfig(executive.getAccountGroupId(), executive.getBranchId(), 0);
					chargeConfigurationArr	= ChargeConfigurationDaoImpl.getInstance().getChargesRatesInBooking(configurationBranch);
				}

				if(chargeConfigurationArr != null && !chargeConfigurationArr.isEmpty())
					for(final ChargeConfiguration chargeConfiguration : chargeConfigurationArr) {
						rateMasterObj		= new RateMaster();
						rateMasterObj.setChargeTypeMasterId(chargeConfiguration.getChargeTypeMasterId());
						rateMasterObj.setRate(chargeConfiguration.getChargeMinAmount());
						rateMapIP.put(rateMasterObj.getChargeTypeMasterId() , rateMasterObj);
					}

				destBranch		= cache.getGenericBranchDetailCache(request, destBranchId);
				rateMaster		= RateMasterDaoModel.getInstance().getRateMasterForCorporate(executive.getBranchId(), destBranchId, executive.getAccountGroupId(), corporateAccountId, categoryId);

				if(rateMaster == null && destBranch != null && destBranch.getTypeOfLocation() == Branch.TYPE_OF_LOCATION_OPERATIONAL_PLACE && destBranch.getHandlingBranchId() > 0)
					rateMaster		= RateMasterDaoModel.getInstance().getRateMasterForCorporate(executive.getBranchId(), destBranch.getHandlingBranchId(), executive.getAccountGroupId(), corporateAccountId, categoryId);

				if(rateMaster != null)
					for (final RateMaster element : rateMaster)
						rateMapIP.put(element.getChargeTypeMasterId(), element);

				rateMaster	= RateMasterDaoModel.getInstance().getRateMasterForCorporate(executive.getBranchId(), 0, executive.getAccountGroupId(), corporateAccountId, categoryId);

				if(rateMaster != null)
					for (final RateMaster element : rateMaster)
						rateMapIP.put(element.getChargeTypeMasterId() , element);

				if(categoryId == TransportCommonMaster.RATE_CATEGORY_PARTY) {
					generalMas	= RateMasterDaoModel.getInstance().getRateMasterForCorporate(executive.getBranchId(), 0, executive.getAccountGroupId(), 0, TransportCommonMaster.RATE_CATEGORY_GENERAL);

					if(generalMas != null)
						for (final RateMaster element : generalMas)
							if(rateMapIP.get(element.getChargeTypeMasterId()) == null)
								rateMapIP.put(element.getChargeTypeMasterId(), element);
				}

				rateMaster = new RateMaster[rateMapIP.size()];
				var count = 0;

				for(final Map.Entry<Long, RateMaster> entry : rateMapIP.entrySet()) {
					rateMaster[count] = entry.getValue();
					count++;
				}

				if(rateMaster != null && rateMaster.length > 0 || bookingTypeId == TransportCommonMaster.BOOKING_TYPE_FTL_ID) {
					if(rateMaster != null && rateMaster.length > 0)
						for (final RateMaster element : rateMaster)
							if(element.getChargeTypeMasterId() == BookingChargeConstant.FORM_CHARGES) {
								if(formTypesList != null && !formTypesList.isEmpty())
									rateIdChargeAmt.put(element.getChargeTypeMasterId(), element.getRate());
							} else if(element.getChargeTypeMasterId() == BookingChargeConstant.HAMALI) {
								if(bookingTypeId == BookingTypeConstant.DIRECT_DELIVERY_DIRECT_VASULI_ID) {
									element.setRate(0);
									rateIdChargeAmt.put(element.getChargeTypeMasterId(), element.getRate());
								}
							} else
								rateIdChargeAmt.put(element.getChargeTypeMasterId(), element.getRate());

					//DIRECT DELIVERY DIRECT VASULI
					if(bookingTypeId == BookingTypeConstant.DIRECT_DELIVERY_DIRECT_VASULI_ID) {
						valueObjectOut.put("rateId_ChargeAmt", Converter.hashMapWithDataTypeToHashMapConversion(rateIdChargeAmt));
						jsonObjectOut	= JsonUtility.convertionToJsonObjectForResponse(valueObjectOut);

						out.println(jsonObjectOut);
						break;
					}

					if(bookingTypeId == BookingTypeConstant.BOOKING_TYPE_SUNDRY_ID) { //Sundry

						rateMaster	= RateMasterDaoModel.getInstance().getRateMasterForCorporate(srcBranchId, destBranchId, executive.getAccountGroupId(), corporateAccountId, categoryId);
						if(rateMaster == null && destBranch != null && destBranch.getTypeOfLocation() == Branch.TYPE_OF_LOCATION_OPERATIONAL_PLACE && destBranch.getHandlingBranchId() > 0)
							rateMaster	= RateMasterDaoModel.getInstance().getRateMasterForCorporate(srcBranchId, destBranch.getHandlingBranchId(), executive.getAccountGroupId(), corporateAccountId, categoryId);

						rateMapIP	= new HashMap<>();

						if(rateMaster != null)
							for (final RateMaster element : rateMaster)
								rateMapIP.put(element.getChargeTypeMasterId() , element);

						if(categoryId == TransportCommonMaster.RATE_CATEGORY_PARTY) {
							generalMas	= RateMasterDaoModel.getInstance().getRateMasterForCorporate(srcBranchId, destBranchId, executive.getAccountGroupId(), 0, TransportCommonMaster.RATE_CATEGORY_GENERAL);

							if(rateMaster == null && destBranch != null && destBranch.getTypeOfLocation() == Branch.TYPE_OF_LOCATION_OPERATIONAL_PLACE && destBranch.getHandlingBranchId() > 0)
								generalMas	= RateMasterDaoModel.getInstance().getRateMasterForCorporate(srcBranchId, destBranch.getHandlingBranchId(), executive.getAccountGroupId(), 0, TransportCommonMaster.RATE_CATEGORY_GENERAL);

							if(generalMas != null)
								for (final RateMaster element : generalMas)
									if(rateMapIP.get(element.getChargeTypeMasterId()) == null)
										rateMapIP.put(element.getChargeTypeMasterId(), element);
						}

						rateMaster = new RateMaster[rateMapIP.size()];
						count = 0;

						for(final Map.Entry<Long, RateMaster> entry : rateMapIP.entrySet()) {
							rateMaster[count] = entry.getValue();
							count++;
						}

						if(rateMaster != null && rateMaster.length > 0) {
							var isWeight = false;

							for (final RateMaster element : rateMaster) {

								qty = 0;
								if(element.getChargeTypeMasterId() == BookingChargeConstant.FREIGHT || element.getChargeTypeMasterId() == BookingChargeConstant.HAMALI) {
									if(element.getMaxWeight() <= 0 || element.getMinWeight() <= 0) {
										/* For showing pure Frieght Amount on UI */
										if(element.getChargeTypeMasterId() == BookingChargeConstant.FREIGHT)
											purefrieghtQtyAmount = element.getRate();

										/* For showing pure Frieght Amount on UI */
										if(qtyMapWithPackage.get(element.getPackingTypeId()) != null)
											qty = qtyMapWithPackage.get(element.getPackingTypeId());

										if(element.getChargeTypeMasterId() == BookingChargeConstant.FREIGHT)
											frieghtAmount += element.getRate() * qty;
										else
											hamaliAmount  += element.getRate() * qty;

										continue;
									}

									/* For showing pure Frieght Amount on UI */
									if(element.getChargeTypeMasterId() == BookingChargeConstant.FREIGHT)
										purefrieghtAmount = element.getRate();
									/* For showing pure Frieght Amount on UI */
									element.setRate(element.getRate() * weight);
									isWeight = true;
								}

								if(isWeight) {
									RateMaster[] rateMasterSingle;

									rateMasterSingle = RateMasterDaoModel.getInstance().getSingleChargeRate(srcBranchId, 0 ,executive.getAccountGroupId() ,BookingChargeConstant.HAMALI, corporateAccountId, categoryId, 1, 1, 0);
									if(rateMasterSingle != null)
										weightHamaliAmount = rateMasterSingle[0].getRate();
									else {
										rateMasterSingle = RateMasterDaoModel.getInstance().getSingleChargeRate(srcBranchId, 0, executive.getAccountGroupId(), BookingChargeConstant.HAMALI, 0, TransportCommonMaster.RATE_CATEGORY_GENERAL, 1, 1, 0);

										if(rateMasterSingle != null)
											weightHamaliAmount = rateMasterSingle[0].getRate();
									}

									rateIdChargeAmt.put((long) BookingChargeConstant.HAMALI, weightHamaliAmount * weight);
								}

								rateIdChargeAmt.put(element.getChargeTypeMasterId(), element.getRate());
							}

							if(frieghtAmount > 0) {
								rateIdChargeAmt.put((long) BookingChargeConstant.FREIGHT, frieghtAmount);
								rateIdChargeAmt.put((long) BookingChargeConstant.HAMALI, hamaliAmount);
							}
						} else {
							valueObjectOut	= new ValueObject();
							valueObjectOut.put("recordnotfound", "No Record found !");
						}
					} else { //FTL

						rateMaster	= RateMasterDaoModel.getInstance().getCorporateRateMasterForFTL(srcBranchId, destBranchId, executive.getAccountGroupId(), corporateAccountId, vehicleTypeId, categoryId);

						if(rateMaster == null && destBranch != null && destBranch.getTypeOfLocation() == Branch.TYPE_OF_LOCATION_OPERATIONAL_PLACE && destBranch.getHandlingBranchId() > 0)
							rateMaster	= RateMasterDaoModel.getInstance().getCorporateRateMasterForFTL(srcBranchId, destBranch.getHandlingBranchId(), executive.getAccountGroupId(), corporateAccountId, vehicleTypeId, categoryId);
						rateMapIP	= new HashMap<>();

						if(rateMaster != null)
							for (final RateMaster element : rateMaster)
								rateMapIP.put(element.getChargeTypeMasterId() , element);

						if(categoryId == TransportCommonMaster.RATE_CATEGORY_PARTY) {
							generalMas	= RateMasterDaoModel.getInstance().getCorporateRateMasterForFTL(srcBranchId, destBranchId, executive.getAccountGroupId(), 0, vehicleTypeId, TransportCommonMaster.RATE_CATEGORY_GENERAL);

							if(rateMaster == null && destBranch != null && destBranch.getTypeOfLocation() == Branch.TYPE_OF_LOCATION_OPERATIONAL_PLACE && destBranch.getHandlingBranchId() > 0)
								generalMas	= RateMasterDaoModel.getInstance().getCorporateRateMasterForFTL(srcBranchId, destBranch.getHandlingBranchId(), executive.getAccountGroupId(), 0, vehicleTypeId, TransportCommonMaster.RATE_CATEGORY_GENERAL);

							if(generalMas != null)
								for (final RateMaster element : generalMas)
									if(rateMapIP.get(element.getChargeTypeMasterId()) == null)
										rateMapIP.put(element.getChargeTypeMasterId(), element);
						}

						rateMaster = new RateMaster[rateMapIP.size()];
						count = 0;

						for(final Map.Entry<Long, RateMaster> entry : rateMapIP.entrySet()) {
							rateMaster[count] = entry.getValue();
							count++;
						}

						if(rateMaster != null && rateMaster.length > 0) {
							for (final RateMaster element : rateMaster)
								rateIdChargeAmt.put(element.getChargeTypeMasterId(), element.getRate());

							valueObjectOut.put("rateId_ChargeAmt", Converter.hashMapWithDataTypeToHashMapConversion(rateIdChargeAmt));
						} else {
							valueObjectOut	= new ValueObject();
							valueObjectOut.put("recordnotfound", "No Record found !");
						}
					}
				} else
					valueObjectOut.put("recordnotfound", "No Record found !");

				valueObjectOut.put("purefrieghtAmount", purefrieghtAmount);
				valueObjectOut.put("purefrieghtQtyAmount", purefrieghtQtyAmount);
				valueObjectOut.put("rateId_ChargeAmt", Converter.hashMapWithDataTypeToHashMapConversion(rateIdChargeAmt));

				jsonObjectOut	= JsonUtility.convertionToJsonObjectForResponse(valueObjectOut);

				out.println(jsonObjectOut);
				out.flush();
				break;
			case 15:
				//Rate.js
				/*
				 * Get Rate to apply after comparison for LMT
				 *
				 * Added by 	- Anant Chaudhary	14-12-2016
				 */

				rateIdChargeAmt			= new HashMap<>();
				frieghtAmount			= 0.0;
				hamaliAmount			= 0.0;
				purefrieghtAmount		= 0;
				purefrieghtQtyAmount	= 0;
				RateMaster[] 			rateMasterArr 	= null;

				out = response.getWriter();
				valueObjectOut			= new ValueObject();

				jsonObjectIn			= new JSONObject(request.getParameter("json"));
				dataVl					= JsonUtility.convertJsontoValueObject(jsonObjectIn);

				categoryId				= dataVl.getShort("categoryId", (short) 0);
				bookingTypeId			= dataVl.getShort("bookingTypeId",  (short) 0);
				srcBranchId				= dataVl.getLong("srcBranchId", 0);
				destBranchId			= dataVl.getLong("destBranchId", 0);
				vehicleTypeId			= dataVl.getLong("vehicleTypeId", 0);
				weight					= dataVl.getDouble("weight", 0);
				qty						= dataVl.getInt("qty", 0);
				formTypesList			= getFormTypesFromJsonObject(jsonObjectIn, configuration);

				destBranch		= null;
				destBranch		= cache.getGenericBranchDetailCache(request, destBranchId);
				rateMaster 		= RateMasterDaoModel.getInstance().getRateMasterForCorporate(executive.getBranchId(), 0, executive.getAccountGroupId(), 0, TransportCommonMaster.RATE_CATEGORY_GENERAL);

				if(rateMaster == null)
					rateMaster = RateMasterDaoModel.getInstance().getRateMasterForCorporate(executive.getBranchId(), destBranchId, executive.getAccountGroupId(), 0, TransportCommonMaster.RATE_CATEGORY_GENERAL);

				if(rateMaster == null && destBranch != null && destBranch.getTypeOfLocation() == Branch.TYPE_OF_LOCATION_OPERATIONAL_PLACE && destBranch.getHandlingBranchId() > 0)
					rateMaster = RateMasterDaoModel.getInstance().getRateMasterForCorporate(executive.getBranchId(), destBranch.getHandlingBranchId(), executive.getAccountGroupId(), 0, TransportCommonMaster.RATE_CATEGORY_GENERAL);
				//FTL condition is required because if Branch level charges are not there then also Transactional charges should applied
				if(rateMaster != null || bookingTypeId == BookingTypeConstant.BOOKING_TYPE_FTL_ID) {

					if(rateMaster != null)
						for (final RateMaster element : rateMaster)
							if(element.getChargeTypeMasterId() == BookingChargeConstant.FORM_CHARGES) {
								if(formTypesList != null && !formTypesList.isEmpty())
									rateIdChargeAmt.put(element.getChargeTypeMasterId(), element.getRate());
							} else if(element.getChargeTypeMasterId() == BookingChargeConstant.HAMALI) {
								if(bookingTypeId == BookingTypeConstant.DIRECT_DELIVERY_DIRECT_VASULI_ID) {
									element.setRate(0);
									rateIdChargeAmt.put(element.getChargeTypeMasterId(), element.getRate());
								}
							} else
								rateIdChargeAmt.put(element.getChargeTypeMasterId(), element.getRate());

					//DIRECT DELIVERY DIRECT VASULI
					if(bookingTypeId == BookingTypeConstant.DIRECT_DELIVERY_DIRECT_VASULI_ID) {
						valueObjectOut.put("rateId_ChargeAmt", Converter.hashMapWithDataTypeToHashMapConversion(rateIdChargeAmt));
						jsonObjectOut	= JsonUtility.convertionToJsonObjectForResponse(valueObjectOut);
						out.println(jsonObjectOut);
						break;
					}

					if(bookingTypeId == BookingTypeConstant.BOOKING_TYPE_FTL_ID) { //FTL

						rateMaster = RateMasterDaoModel.getInstance().getCorporateRateMasterForFTL(srcBranchId, destBranchId, executive.getAccountGroupId(), 0, vehicleTypeId, TransportCommonMaster.RATE_CATEGORY_GENERAL);

						if(rateMaster == null && destBranch != null && destBranch.getTypeOfLocation() == Branch.TYPE_OF_LOCATION_OPERATIONAL_PLACE && destBranch.getHandlingBranchId() > 0)
							rateMaster = RateMasterDaoModel.getInstance().getCorporateRateMasterForFTL(srcBranchId, destBranch.getHandlingBranchId(), executive.getAccountGroupId(), 0, vehicleTypeId, TransportCommonMaster.RATE_CATEGORY_GENERAL);
						if(rateMaster == null) {
							valueObjectOut.put("recordnotfound", "No Record found !");
							jsonObjectOut	= JsonUtility.convertionToJsonObjectForResponse(valueObjectOut);
							out.println(jsonObjectOut);
							break;
						}
						for (final RateMaster element : rateMaster)
							if(element.getChargeTypeMasterId() == BookingChargeConstant.HAMALI)
								rateIdChargeAmt.put(element.getChargeTypeMasterId(), element.getRate());

						valueObjectOut.put("rateId_ChargeAmt", Converter.hashMapWithDataTypeToHashMapConversion(rateIdChargeAmt));
						jsonObjectOut	= JsonUtility.convertionToJsonObjectForResponse(valueObjectOut);
						out.println(jsonObjectOut);
						break;
					}

					if(bookingTypeId == BookingTypeConstant.BOOKING_TYPE_SUNDRY_ID) {
						//Sundry
						rateMaster = RateMasterDaoModel.getInstance().getRateMasterForCorporate(srcBranchId, destBranchId, executive.getAccountGroupId(), 0, TransportCommonMaster.RATE_CATEGORY_GENERAL);

						if(rateMaster == null && destBranch != null && destBranch.getTypeOfLocation() == Branch.TYPE_OF_LOCATION_OPERATIONAL_PLACE && destBranch.getHandlingBranchId() > 0)
							rateMaster = RateMasterDaoModel.getInstance().getRateMasterForCorporate(srcBranchId, destBranch.getHandlingBranchId(), executive.getAccountGroupId(), 0, TransportCommonMaster.RATE_CATEGORY_GENERAL);

						if(rateMaster != null) {
							for (final RateMaster element : rateMaster) {
								if(element.getChargeTypeMasterId() == BookingChargeConstant.FREIGHT
										|| element.getChargeTypeMasterId() == BookingChargeConstant.HAMALI) {
									if(element.getMaxWeight() <= 0 || element.getMinWeight() <= 0) {
										if(element.getChargeTypeMasterId() == BookingChargeConstant.FREIGHT) {
											purefrieghtAmount = element.getRate();
											frieghtAmount 	+= element.getRate() * qty;
										} else
											hamaliAmount 	+= element.getRate() * qty;

										continue;
									}

									/* For showing pure Frieght Amount on UI */
									if(element.getChargeTypeMasterId() == BookingChargeConstant.FREIGHT)
										purefrieghtQtyAmount = element.getRate();
									/* For showing pure Frieght Amount on UI */
									element.setRate(element.getRate() * weight);
								}

								rateIdChargeAmt.put(element.getChargeTypeMasterId(), element.getRate());
							}

							weightHamaliAmount		= 0;

							rateMasterArr		= RateMasterDaoModel.getInstance().getSingleChargeRate(srcBranchId, 0, executive.getAccountGroupId(), BookingChargeConstant.HAMALI, 0, TransportCommonMaster.RATE_CATEGORY_GENERAL, 1, 1, 0);

							if(rateMasterArr != null && rateMasterArr.length > 0)
								weightHamaliAmount	= rateMasterArr[0].getRate();

							rateIdChargeAmt.put((long) BookingChargeConstant.HAMALI, weightHamaliAmount * weight);

							valueObjectOut.put("frieghtAmount", frieghtAmount);
							valueObjectOut.put("hamaliAmount", hamaliAmount);
							valueObjectOut.put("purefrieghtAmount", purefrieghtAmount);
							valueObjectOut.put("purefrieghtQtyAmount", purefrieghtQtyAmount);
							valueObjectOut.put("rateId_ChargeAmt", Converter.hashMapWithDataTypeToHashMapConversion(rateIdChargeAmt));
						} else {
							valueObjectOut	= new ValueObject();
							valueObjectOut.put("recordnotfound", "No Record found !");
						}
					}
				} else {
					valueObjectOut	= new ValueObject();
					valueObjectOut.put("recordnotfound", "No Record found !");
				}

				jsonObjectOut	= JsonUtility.convertionToJsonObjectForResponse(valueObjectOut);

				out.println(jsonObjectOut);
				out.flush();
				break;

			case 16:
				//Rate.js
				/*
				 * Get Rate to apply on Fixed charge type for LMT
				 *
				 * Added by 	- Anant Chaudhary	14-12-2016
				 */

				rateIdChargeAmt				= new HashMap<>();
				frieghtAmount				= 0.0;
				hamaliAmount				= 0.0;
				purefrieghtAmount			= 0;
				purefrieghtQtyAmount		= 0;
				double chargedWeight;
				String chargeTypeMasterIds;

				out = response.getWriter();
				valueObjectOut			= new ValueObject();

				jsonObjectIn			= new JSONObject(request.getParameter("json"));
				dataVl					= JsonUtility.convertJsontoValueObject(jsonObjectIn);

				categoryId				= dataVl.getShort("categoryId", (short) 0);
				bookingTypeId			= dataVl.getShort("bookingTypeId",  (short) 0);
				srcBranchId				= dataVl.getLong("srcBranchId", 0);
				destBranchId			= dataVl.getLong("destBranchId", 0);
				vehicleTypeId			= dataVl.getLong("vehicleTypeId", 0);
				weight					= dataVl.getDouble("weight", 0);
				qty						= dataVl.getInt("qty", 0);
				var miW				= dataVl.getDouble("minWgt", 0);
				var maW				= dataVl.getDouble("maxWgt", 0);
				chargedWeight			= dataVl.getDouble("chargedWeight", 0);
				chargeTypeMasterIds		= dataVl.getString("chargeTypeIds", null);

				destBranch		= null;
				destBranch		= cache.getGenericBranchDetailCache(request, destBranchId);

				if(bookingTypeId == BookingTypeConstant.BOOKING_TYPE_FTL_ID) { //FTL

					rateMaster = RateMasterDaoModel.getInstance().getRateMasterForGroupByChargeType(srcBranchId, destBranchId, executive.getAccountGroupId(), chargeTypeMasterIds, TransportCommonMaster.RATE_CATEGORY_GENERAL, miW, maW, vehicleTypeId);

					if(rateMaster == null && destBranch != null && destBranch.getTypeOfLocation() == Branch.TYPE_OF_LOCATION_OPERATIONAL_PLACE && destBranch.getHandlingBranchId() > 0)
						rateMaster = RateMasterDaoModel.getInstance().getRateMasterForGroupByChargeType(srcBranchId, destBranch.getHandlingBranchId() , executive.getAccountGroupId(), chargeTypeMasterIds, TransportCommonMaster.RATE_CATEGORY_GENERAL, miW, maW, vehicleTypeId);

					if(rateMaster == null) {
						valueObjectOut.put("recordnotfound", "No Record found !");
						jsonObjectOut	= JsonUtility.convertionToJsonObjectForResponse(valueObjectOut);

						out.println(jsonObjectOut);
						break;
					}
					for (final RateMaster element : rateMaster)
						if(element.getChargeTypeMasterId() == BookingChargeConstant.HAMALI)
							rateIdChargeAmt.put(element.getChargeTypeMasterId(), element.getRate());

					frieghtAmount	= 0;
					hamaliAmount	= 0;

					valueObjectOut.put("hamaliAmount", hamaliAmount);
					valueObjectOut.put("frieghtAmount", frieghtAmount);
					valueObjectOut.put("rateId_ChargeAmt", Converter.hashMapWithDataTypeToHashMapConversion(rateIdChargeAmt));

					jsonObjectOut	= JsonUtility.convertionToJsonObjectForResponse(valueObjectOut);

					out.println(jsonObjectOut);
					break;
				}

				//Quantity Type Hamali
				rateMaster = RateMasterDaoModel.getInstance().getRateMasterForGroupByChargeType(srcBranchId, destBranchId, executive.getAccountGroupId(), chargeTypeMasterIds, TransportCommonMaster.RATE_CATEGORY_GENERAL,0,0,0);

				if(rateMaster == null && destBranch != null && destBranch.getTypeOfLocation() == Branch.TYPE_OF_LOCATION_OPERATIONAL_PLACE && destBranch.getHandlingBranchId() > 0)
					rateMaster = RateMasterDaoModel.getInstance().getRateMasterForGroupByChargeType(srcBranchId, destBranch.getHandlingBranchId(), executive.getAccountGroupId(), chargeTypeMasterIds, TransportCommonMaster.RATE_CATEGORY_GENERAL,0,0,0);

				if(rateMaster != null) {
					for (final RateMaster element : rateMaster) {
						element.setRate(element.getRate() * qty);

						rateIdChargeAmt.put(element.getChargeTypeMasterId(), element.getRate());
					}

					frieghtAmount	= 0;
					hamaliAmount	= 0;

				} else {
					//Weight Type Hamali
					rateMaster = RateMasterDaoModel.getInstance().getRateMasterForGroupByChargeType(srcBranchId, 0, executive.getAccountGroupId(), chargeTypeMasterIds, TransportCommonMaster.RATE_CATEGORY_GENERAL,1,1,0);

					if(rateMaster != null) {
						for (final RateMaster element : rateMaster) {
							element.setRate(element.getRate() * chargedWeight);

							rateIdChargeAmt.put(element.getChargeTypeMasterId(), element.getRate());
						}

						frieghtAmount	= 0;
						hamaliAmount	= 0;

						valueObjectOut.put("hamaliAmount", hamaliAmount);
						valueObjectOut.put("frieghtAmount", frieghtAmount);
						valueObjectOut.put("rateId_ChargeAmt", Converter.hashMapWithDataTypeToHashMapConversion(rateIdChargeAmt));
					} else
						valueObjectOut.put("recordnotfound", "No Record found !");
				}

				jsonObjectOut	= JsonUtility.convertionToJsonObjectForResponse(valueObjectOut);

				out.println(jsonObjectOut);
				out.flush();
				break;

			case 17:
				//Rate.js
				/*
				 * Get Rate to apply on Quantity type for LMT
				 *
				 * Added by 	- Anant Chaudhary	16-12-2016
				 */

				rateIdChargeAmt			= new HashMap<>();
				frieghtAmount			= 0.0;
				hamaliAmount			= 0.0;
				purefrieghtAmount		= 0;
				purefrieghtQtyAmount	= 0;

				out = response.getWriter();
				valueObjectOut			= new ValueObject();

				jsonObjectIn			= new JSONObject(request.getParameter("json"));
				dataVl					= JsonUtility.convertJsontoValueObject(jsonObjectIn);

				categoryId				= dataVl.getShort("categoryId", (short) 0);
				bookingTypeId			= dataVl.getShort("bookingTypeId",  (short) 0);
				srcBranchId				= dataVl.getLong("srcBranchId", 0);
				destBranchId			= dataVl.getLong("destBranchId", 0);
				vehicleTypeId			= dataVl.getLong("vehicleTypeId", 0);
				weight					= dataVl.getDouble("weight", 0);
				qty						= dataVl.getInt("qty", 0);
				miW						= dataVl.getDouble("minWgt", 0);
				maW						= dataVl.getDouble("maxWgt", 0);
				chargedWeight			= dataVl.getDouble("chargedWeight", 0);
				chargeTypeMasterIds		= dataVl.getString("chargeTypeIds", null);

				destBranch		= null;
				destBranch		= cache.getGenericBranchDetailCache(request, destBranchId);

				if(bookingTypeId == BookingTypeConstant.BOOKING_TYPE_FTL_ID) { //FTL

					rateMaster = RateMasterDaoModel.getInstance().getRateMasterForGroupByChargeType(srcBranchId, destBranchId, executive.getAccountGroupId(), chargeTypeMasterIds, TransportCommonMaster.RATE_CATEGORY_GENERAL, miW, maW, vehicleTypeId);

					if(rateMaster == null && destBranch != null && destBranch.getTypeOfLocation() == Branch.TYPE_OF_LOCATION_OPERATIONAL_PLACE && destBranch.getHandlingBranchId() > 0)
						rateMaster = RateMasterDaoModel.getInstance().getRateMasterForGroupByChargeType(srcBranchId, destBranch.getHandlingBranchId(), executive.getAccountGroupId(), chargeTypeMasterIds, TransportCommonMaster.RATE_CATEGORY_GENERAL, miW, maW, vehicleTypeId);

					if(rateMaster == null) {
						valueObjectOut.put("recordnotfound", "No Record found !");
						jsonObjectOut	= JsonUtility.convertionToJsonObjectForResponse(valueObjectOut);
						out.println(jsonObjectOut);
						break;
					}
					for (final RateMaster element : rateMaster)
						if(element.getChargeTypeMasterId() == BookingChargeConstant.HAMALI)
							rateIdChargeAmt.put(element.getChargeTypeMasterId(), element.getRate());

					valueObjectOut.put("rateId_ChargeAmt", Converter.hashMapWithDataTypeToHashMapConversion(rateIdChargeAmt));
					jsonObjectOut	= JsonUtility.convertionToJsonObjectForResponse(valueObjectOut);
					out.println(jsonObjectOut);
					break;
				}

				var minW = 0D;
				var maxW = 0D;

				rateMaster = RateMasterDaoModel.getInstance().getRateMasterForGroupByChargeType(srcBranchId, destBranchId, executive.getAccountGroupId(), chargeTypeMasterIds, TransportCommonMaster.RATE_CATEGORY_GENERAL,minW,maxW,vehicleTypeId);

				if(rateMaster == null && destBranch != null && destBranch.getTypeOfLocation() == Branch.TYPE_OF_LOCATION_OPERATIONAL_PLACE && destBranch.getHandlingBranchId() > 0)
					rateMaster = RateMasterDaoModel.getInstance().getRateMasterForGroupByChargeType(srcBranchId, destBranch.getHandlingBranchId(), executive.getAccountGroupId(), chargeTypeMasterIds, TransportCommonMaster.RATE_CATEGORY_GENERAL,minW,maxW,vehicleTypeId);

				if(rateMaster != null) {
					for (final RateMaster element : rateMaster) {
						/* For showing pure Frieght Amount on UI */
						if(element.getChargeTypeMasterId() == BookingChargeConstant.FREIGHT)
							purefrieghtAmount = element.getRate();
						/* For showing pure Frieght Amount on UI */
						element.setRate(element.getRate() * qty);

						rateIdChargeAmt.put(element.getChargeTypeMasterId(), element.getRate());
					}

					valueObjectOut.put("purefrieghtAmount", purefrieghtAmount);
					valueObjectOut.put("rateId_ChargeAmt", Converter.hashMapWithDataTypeToHashMapConversion(rateIdChargeAmt));
				} else
					valueObjectOut.put("recordnotfound", "No Record found !");

				jsonObjectOut	= JsonUtility.convertionToJsonObjectForResponse(valueObjectOut);
				out.println(jsonObjectOut);
				out.flush();
				break;

			case 18:
				//Rate.js
				/*
				 * Get Rate to apply on Weight type for LMT
				 *
				 * Added by 	- Anant Chaudhary	16-12-2016
				 */

				rateIdChargeAmt			= new HashMap<>();
				frieghtAmount			= 0.0;
				hamaliAmount			= 0.0;
				purefrieghtAmount		= 0.0;
				purefrieghtQtyAmount	= 0.0;

				out = response.getWriter();
				valueObjectOut			= new ValueObject();

				jsonObjectIn			= new JSONObject(request.getParameter("json"));
				dataVl					= JsonUtility.convertJsontoValueObject(jsonObjectIn);

				categoryId				= dataVl.getShort("categoryId", (short) 0);
				bookingTypeId			= dataVl.getShort("bookingTypeId",  (short) 0);
				srcBranchId				= dataVl.getLong("srcBranchId", 0);
				destBranchId			= dataVl.getLong("destBranchId", 0);
				vehicleTypeId			= dataVl.getLong("vehicleTypeId", 0);
				weight					= dataVl.getDouble("weight", 0);
				qty						= dataVl.getInt("qty", 0);
				miW						= dataVl.getDouble("minWgt", 0);
				maW						= dataVl.getDouble("maxWgt", 0);
				chargedWeight			= dataVl.getDouble("chargedWeight", 0);
				chargeTypeMasterIds		= dataVl.getString("chargeTypeIds", null);

				destBranch		= null;
				destBranch		= cache.getGenericBranchDetailCache(request, destBranchId);

				if(bookingTypeId == BookingTypeConstant.BOOKING_TYPE_FTL_ID) { //FTL

					rateMaster = RateMasterDaoModel.getInstance().getRateMasterForGroupByChargeType(srcBranchId, destBranchId, executive.getAccountGroupId(), chargeTypeMasterIds, TransportCommonMaster.RATE_CATEGORY_GENERAL, miW, maW, vehicleTypeId);

					if(rateMaster == null && destBranch != null && destBranch.getTypeOfLocation() == Branch.TYPE_OF_LOCATION_OPERATIONAL_PLACE && destBranch.getHandlingBranchId() > 0)
						rateMaster = RateMasterDaoModel.getInstance().getRateMasterForGroupByChargeType(srcBranchId, destBranch.getHandlingBranchId(), executive.getAccountGroupId(), chargeTypeMasterIds, TransportCommonMaster.RATE_CATEGORY_GENERAL, miW, maW, vehicleTypeId);

					if(rateMaster == null) {
						valueObjectOut.put("recordnotfound", "No Record found !");
						jsonObjectOut	= JsonUtility.convertionToJsonObjectForResponse(valueObjectOut);
						out.println(jsonObjectOut);
						break;
					}

					for (final RateMaster element : rateMaster)
						if(element.getChargeTypeMasterId() == BookingChargeConstant.HAMALI)
							rateIdChargeAmt.put(element.getChargeTypeMasterId(), element.getRate());

					valueObjectOut.put("rateId_ChargeAmt", Converter.hashMapWithDataTypeToHashMapConversion(rateIdChargeAmt));

					jsonObjectOut	= JsonUtility.convertionToJsonObjectForResponse(valueObjectOut);
					out.println(jsonObjectOut);
					break;
				}

				minW = 1;
				maxW = 1;

				rateMaster = RateMasterDaoModel.getInstance().getRateMasterForGroupByChargeType(srcBranchId, destBranchId, executive.getAccountGroupId(), chargeTypeMasterIds, TransportCommonMaster.RATE_CATEGORY_GENERAL,minW,maxW,vehicleTypeId);

				if(rateMaster == null && destBranch != null && destBranch.getTypeOfLocation() == Branch.TYPE_OF_LOCATION_OPERATIONAL_PLACE && destBranch.getHandlingBranchId() > 0)
					rateMaster = RateMasterDaoModel.getInstance().getRateMasterForGroupByChargeType(srcBranchId, destBranch.getHandlingBranchId() , executive.getAccountGroupId(), chargeTypeMasterIds, TransportCommonMaster.RATE_CATEGORY_GENERAL,minW,maxW,vehicleTypeId);

				if(rateMaster != null) {
					for (final RateMaster element : rateMaster) {
						/* For showing pure Frieght Amount on UI */
						if(element.getChargeTypeMasterId() == BookingChargeConstant.FREIGHT)
							purefrieghtAmount = element.getRate();
						/* For showing pure Frieght Amount on UI */
						if(element.getMaxWeight() > 0 && element.getMinWeight() > 0)
							element.setRate(element.getRate() * chargedWeight);

						rateIdChargeAmt.put(element.getChargeTypeMasterId(), element.getRate());
					}

					weightHamaliAmount = RateMasterDaoModel.getInstance().getSingleChargeRate(srcBranchId, 0, executive.getAccountGroupId(), BookingChargeConstant.HAMALI ,0 ,TransportCommonMaster.RATE_CATEGORY_GENERAL ,1 ,1 ,0)[0].getRate();

					rateIdChargeAmt.put((long) BookingChargeConstant.HAMALI, weightHamaliAmount * chargedWeight);

					valueObjectOut.put("purefrieghtAmount", purefrieghtAmount);
					valueObjectOut.put("rateId_ChargeAmt", Converter.hashMapWithDataTypeToHashMapConversion(rateIdChargeAmt));
				} else
					valueObjectOut.put("recordnotfound", "No Record found !");

				jsonObjectOut	= JsonUtility.convertionToJsonObjectForResponse(valueObjectOut);

				out.println(jsonObjectOut);
				out.flush();
				break;
			case 19 : // get Route wise Rates
				//Rate.js
				response.setContentType(GenericRateAjaxAction.CONTENT_TYPE); // Setting response for JSON Content

				final var	rateMasterBLL1	= new RateMasterBLL();

				jsonObjectIn			= new JSONObject(request.getParameter("json"));
				jsonObjectOut			= new JSONObject();

				dataVl					= JsonUtility.convertJsontoValueObject(jsonObjectIn);

				dataVl.put(Constant.ACCOUNT_GROUP_ID, executive.getAccountGroupId());
				dataVl.put(Executive.EXECUTIVE, executive);
				dataVl.put(GroupConfigurationPropertiesDTO.GROUP_CONFIGURATION, configuration);

				valueObjectOut	= rateMasterBLL1.getAllRouteWiseSlabRatesForWaybill(dataVl);

				if (valueObjectOut != null)
					jsonObjectOut	= JsonUtility.convertionToJsonObjectForResponse(valueObjectOut);

				out = response.getWriter();

				if(out != null) {
					out.println(jsonObjectOut);
					out.flush();
					out.close();
				}

				break;
			case 20:
				//Rate.js
				/*
				 * Get Party wise rate to apply for LMT
				 *
				 * Added by 	- Anant Chaudhary	27-12-2022
				 */
				final var 	qtyMapWithPackageHm 	= new HashMap<Long,Integer>();

				String[] 				packagesString;
				String[]				tempData										 				= null;
				short 					categoryIdNew;
				double					chargeWeight;
				Branch					destinationBranch;
				RateMaster				rateMasterObject;
				StringJoiner			whereClause;
				Map<Integer, Map<Long, RateMaster>> filteredRateWeightHM									= null;
				Map<Long, Map<Long, RateMaster>> filteredRateArticalHM										= null;
				List<com.iv.dto.master.bookingrate.RateMaster>			rateMasterList;
				List<com.iv.dto.master.bookingrate.RateMaster>			partyWiseRateMasterList						= null;
				HashMap<Long, Double>									rateHmIP;

				out = response.getWriter();
				valueObjectOut			= new ValueObject();
				jsonObjectIn			= new JSONObject(request.getParameter("json"));
				dataVl					= JsonUtility.convertJsontoValueObject(jsonObjectIn);
				categoryIdNew			= dataVl.getShort("categoryId", (short) 0);
				final var 	corpAccountId	= dataVl.getLong("corporateAccountId", 0);
				bookingTypeId			= dataVl.getShort("bookingTypeId",  (short) 0);
				packagesString 			= dataVl.getString("packagesStr", "").split(",");
				srcBranchId				= dataVl.getLong("srcBranchId", 0);
				destBranchId			= dataVl.getLong("destBranchId", 0);
				vehicleTypeId			= dataVl.getLong("vehicleTypeId", 0);
				chargeWeight			= dataVl.getDouble("weight", 0);
				formTypesList			= getFormTypesFromJsonObject(jsonObjectIn, configuration);
				conn					= ResourceManager.getConnection();
				rateHmIP				= new HashMap<>();
				whereClause				= new StringJoiner(" ");

				final var applyRateForCharges	= configuration.getString(GroupConfigurationPropertiesDTO.APPLY_RATE_FOR_CHARGES, "0");

				configurationBranchCorporate	= getRateConfig(executive.getAccountGroupId(), executive.getBranchId(), corpAccountId);

				for (final String element : packagesString) {
					tempData = element.split("=");

					if(qtyMapWithPackageHm.get(Long.parseLong(tempData[0])) != null)
						qtyMapWithPackageHm.put(Long.parseLong(tempData[0]), qtyMapWithPackageHm.get(Long.parseLong(tempData[0])) + Integer.parseInt(tempData[1]));
					else
						qtyMapWithPackageHm.put(Long.parseLong(tempData[0]), Integer.parseInt(tempData[1]));
				}

				rateMasterObject	= new RateMaster();
				rateMasterObject.setCorporateAccountId(corpAccountId);
				rateMasterObject.setChargeWeight(chargeWeight);
				rateMasterObject.setCategoryTypeId(categoryIdNew);
				rateMasterObject.setBranchId(srcBranchId);
				rateMasterObject.setDestinationBranchId(destBranchId);
				rateMasterObject.setVehicleTypeId(vehicleTypeId);

				destinationBranch		= cache.getGenericBranchDetailCache(request, destBranchId);
				charges			= cache.getActiveBookingCharges(request, executive.getBranchId());

				whereClause.add("rm.AccountGroupId = " + executive.getAccountGroupId());
				whereClause.add("AND rm.BranchId = " + executive.getBranchId());
				whereClause.add("AND rm.MarkForDelete = 0");

				if(destinationBranch != null && destinationBranch.getTypeOfLocation() == Branch.TYPE_OF_LOCATION_OPERATIONAL_PLACE && destinationBranch.getHandlingBranchId() > 0)
					whereClause.add("AND rm.DestinationBranchId = " + destinationBranch.getHandlingBranchId());
				else
					whereClause.add("AND rm.DestinationBranchId = " + destBranchId);

				rateMasterList = RateMasterDaoImpl.getInstance().getRateMasterDetails(whereClause.toString(), (short) 0, conn);

				if(rateMasterList != null && !rateMasterList.isEmpty()) {
					partyWiseRateMasterList = rateMasterList.stream().filter(e->e.getCorporateAccountId() == corpAccountId).collect(Collectors.toList());

					rateMasterObject.setChargeTypeId(com.iv.dto.constant.ChargeTypeConstant.CHARGETYPE_ID_WEIGHT);

					if(partyWiseRateMasterList != null && !partyWiseRateMasterList.isEmpty())
						filteredRateWeightHM = filterWeightWiseRate(partyWiseRateMasterList, rateMasterObject);
					else
						filteredRateWeightHM = filterWeightWiseRate(rateMasterList, rateMasterObject);

					rateMasterObject.setChargeTypeId(com.iv.dto.constant.ChargeTypeConstant.CHARGETYPE_ID_QUANTITY);

					if(partyWiseRateMasterList != null && !partyWiseRateMasterList.isEmpty())
						filteredRateArticalHM = filterQuantityWiseRate(partyWiseRateMasterList, rateMasterObject, qtyMapWithPackageHm);
					else
						filteredRateArticalHM = filterQuantityWiseRate(rateMasterList, rateMasterObject, qtyMapWithPackageHm);

					compareAmount(filteredRateWeightHM, filteredRateArticalHM, rateHmIP, charges, chargeWeight, applyRateForCharges, qtyMapWithPackageHm, valueObjectOut);
				}

				jsonObjectOut	= JsonUtility.convertionToJsonObjectForResponse(valueObjectOut);
				out.println(jsonObjectOut);
				out.flush();
				break;

			}
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		} finally {
			try {
				ResourceManager.freeConnection(conn);
			} catch (final SQLException e) {
				e.printStackTrace();
			}
			if(out != null) out.close();
			executive 	= null;
			strBfr 		= null;
			out			= null;
			rateIdMast = null;
			rateMaster	= null;
		}
	}

	private List<Short> getFormTypesFromJsonObject(JSONObject jsonObjectIn, ValueObject configuration) throws Exception {
		JSONArray		formTypesArray		= null;
		List<Short> 	formTypesList		= null;

		try {

			if("true".equals(configuration.getString(GroupConfigurationPropertiesDTO.FORMS_WITH_SINGLE_SELECTION).trim())) {
				formTypesList	= new ArrayList<>();

				if(Utility.getShort(jsonObjectIn.get("forms")) > 0)
					formTypesList.add(Utility.getShort(jsonObjectIn.get("forms")));
			} else if(jsonObjectIn.has("forms") && jsonObjectIn.get("forms") != "") {
				formTypesArray			= jsonObjectIn.getJSONArray("forms");

				if (formTypesArray != null) {
					formTypesList	= new ArrayList<>();

					for (var i = 0; i < formTypesArray.length(); i++)
						if(Utility.getShort(formTypesArray.get(i)) > 0)
							formTypesList.add(Utility.getShort(formTypesArray.get(i)));
				}
			}

			return formTypesList;
		} catch (final Exception e) {
			e.printStackTrace();
			throw e;
		} finally {
			formTypesArray		= null;
			formTypesList		= null;
		}
	}

	private String getRateConfig(long accountGroupId, long branchId, long corporateAccountId) throws Exception {
		StringJoiner	whereclause		= null;

		try {
			whereclause	= new StringJoiner(" ");

			whereclause.add("rm.AccountGroupId = " + accountGroupId);
			whereclause.add("AND rm.Branchid = " + branchId);
			whereclause.add("AND rm.CorporateAccountId = " + corporateAccountId);
			whereclause.add("AND rm.BillSelectionId = " + BillSelectionConstant.BOOKING_WITH_BILL);
			whereclause.add("AND rm.DestinationBranchId = 0");
			whereclause.add("AND rm.MarkForDelete = 0");

			return whereclause.toString();
		} catch (final Exception e) {
			e.printStackTrace();
			throw e;
		} finally {
			whereclause	= null;
		}
	}

	private String getArticleWiseFilteredRate(HttpServletRequest request, Executive executive) throws Exception {
		short 					rateTypeId			= 0;
		var					srcBranchId			= 0L;
		var					destBranchId		= 0L;
		var					minWght				= 0.00;
		var					maxWght				= 0.00;
		var					vehicleTypeId		= 0L;
		short					categoryTypeId		= 0;
		var					packingTypeId		= 0L;
		var					corporateAccountId	= 0L;
		short					chargeTypeId		= 0;
		var 					userArticleInput	= 0;
		Map<Long, Double>		rateIdMast 			= null;
		PackingGroupMapping 	packingGroupMapping	= null;
		var					packingGroupId		= 0L;
		RateMaster[]			rateMaster			= null;
		StringJoiner			strBfr 				= null;

		try {

			srcBranchId			= Long.parseLong(request.getParameter("srcBranchId"));
			destBranchId		= Long.parseLong(request.getParameter("destBranchId"));
			minWght				= Double.parseDouble(request.getParameter("minWght"));
			maxWght				= Double.parseDouble(request.getParameter("maxWght"));
			vehicleTypeId		= Long.parseLong(request.getParameter("vehicleTypeId"));
			categoryTypeId		= Short.parseShort(request.getParameter("categoryTypeId"));
			packingTypeId		= Long.parseLong(request.getParameter("packingTypeId"));
			corporateAccountId	= Long.parseLong(request.getParameter("corporateAccountId"));
			userArticleInput	= Integer.parseInt(request.getParameter("userArticleInput"));
			rateTypeId			= JSPUtility.GetShort(request, "rateTypeId", (short)0);
			chargeTypeId		= ChargeTypeConstant.CHARGETYPE_ID_QUANTITY;
			rateIdMast			= new TreeMap<>();
			strBfr				= new StringJoiner(",");

			packingGroupMapping	= PackingGroupMappingDao.getInstance().findByPackingTypeAndAccountGroupId(packingTypeId, executive.getAccountGroupId());

			if(packingGroupMapping != null) {
				packingGroupId		= packingGroupMapping.getPackingGroupTypeId();
				packingTypeId		= 0;
			}

			//Specific Packing Type Rates (Only Route level charges)
			rateMaster = RateMasterDao.getInstance().getConfigRates(srcBranchId, destBranchId, executive.getAccountGroupId(), categoryTypeId, minWght, maxWght, vehicleTypeId, packingTypeId, corporateAccountId, chargeTypeId, rateTypeId, packingGroupId);
			setFilteredRate(rateMaster, rateIdMast, userArticleInput);

			//Specific Packing Type Rates (Only Loading Type level charges)
			rateMaster = RateMasterDao.getInstance().getConfigRates(srcBranchId, 0, executive.getAccountGroupId(), categoryTypeId, minWght, maxWght, vehicleTypeId, packingTypeId, corporateAccountId, chargeTypeId, rateTypeId, packingGroupId);
			setFilteredRate(rateMaster, rateIdMast, userArticleInput);

			//Generic Packing Type Rates (Only Route level charges)
			rateMaster = RateMasterDao.getInstance().getConfigRates(srcBranchId, destBranchId, executive.getAccountGroupId(), categoryTypeId, minWght, maxWght, vehicleTypeId, 0, corporateAccountId, chargeTypeId, rateTypeId, packingGroupId);
			setFilteredRate(rateMaster, rateIdMast, userArticleInput);

			//Generic Packing Type Rates (Only Loading Type level charges)
			rateMaster = RateMasterDao.getInstance().getConfigRates(srcBranchId, 0, executive.getAccountGroupId(), categoryTypeId, minWght, maxWght, vehicleTypeId, 0, corporateAccountId, chargeTypeId, rateTypeId, packingGroupId);
			setFilteredRate(rateMaster, rateIdMast, userArticleInput);

			//if Party rates not defined then apply general rates
			if(categoryTypeId == RateMaster.CATEGORY_TYPE_PARTY_ID) {
				//Specific Packing Type Rates (Only Route level charges)
				rateMaster = RateMasterDao.getInstance().getConfigRates(srcBranchId, destBranchId, executive.getAccountGroupId(), RateMaster.CATEGORY_TYPE_GENERAL_ID, minWght, maxWght, vehicleTypeId, packingTypeId, 0, chargeTypeId, (short)0, packingGroupId);
				setFilteredRate(rateMaster, rateIdMast, userArticleInput);

				//Specific Packing Type Rates (Only Loading Type level charges)
				rateMaster = RateMasterDao.getInstance().getConfigRates(srcBranchId,0,executive.getAccountGroupId(),RateMaster.CATEGORY_TYPE_GENERAL_ID,minWght,maxWght,vehicleTypeId,packingTypeId,0,chargeTypeId,(short)0, packingGroupId);
				setFilteredRate(rateMaster, rateIdMast, userArticleInput);

				//Generic Packing Type Rates (Only Route level charges)
				rateMaster = RateMasterDao.getInstance().getConfigRates(srcBranchId,destBranchId,executive.getAccountGroupId(),RateMaster.CATEGORY_TYPE_GENERAL_ID,minWght,maxWght,vehicleTypeId,0,0,chargeTypeId,(short)0, packingGroupId);
				setFilteredRate(rateMaster, rateIdMast, userArticleInput);

				//Generic Packing Type Rates (Only Loading Type level charges)
				rateMaster = RateMasterDao.getInstance().getConfigRates(srcBranchId,0,executive.getAccountGroupId(),RateMaster.CATEGORY_TYPE_GENERAL_ID,minWght,maxWght,vehicleTypeId,0,0,chargeTypeId,(short)0, packingGroupId);
				setFilteredRate(rateMaster, rateIdMast, userArticleInput);
			}

			for(final Map.Entry<Long, Double> entry : rateIdMast.entrySet())
				strBfr.add(entry.getKey() + "=" + entry.getValue());
		} catch(final Exception e) {
			e.printStackTrace();
			strBfr.add("Error : While getting Rates !");
		} finally {
			rateMaster			= null;
		}

		return strBfr.toString();
	}

	private String getWeightWiseFilteredRate(HttpServletRequest request, Executive executive) throws Exception {
		short 					rateTypeId			= 0;
		var					srcBranchId			= 0L;
		var					destBranchId		= 0L;
		var					minWght				= 0.00;
		var					maxWght				= 0.00;
		var					vehicleTypeId		= 0L;
		short					categoryTypeId		= 0;
		var					packingTypeId		= 0L;
		var					corporateAccountId	= 0L;
		short					chargeTypeId		= 0;
		Map<Long, Double>		rateIdMast 			= null;
		PackingGroupMapping 	packingGroupMapping	= null;
		var					packingGroupId		= 0L;
		RateMaster[]			rateMaster			= null;
		StringJoiner			strBfr 				= null;
		var					userWeightInput		= 0.00;

		try {

			srcBranchId			= Long.parseLong(request.getParameter("srcBranchId"));
			destBranchId		= Long.parseLong(request.getParameter("destBranchId"));
			minWght				= Double.parseDouble(request.getParameter("minWght"));
			maxWght				= Double.parseDouble(request.getParameter("maxWght"));
			vehicleTypeId		= Long.parseLong(request.getParameter("vehicleTypeId"));
			categoryTypeId		= Short.parseShort(request.getParameter("categoryTypeId"));
			packingTypeId		= Long.parseLong(request.getParameter("packingTypeId"));
			corporateAccountId	= Long.parseLong(request.getParameter("corporateAccountId"));
			userWeightInput		= Double.parseDouble(request.getParameter("userWeightInput"));
			rateTypeId			= JSPUtility.GetShort(request, "rateTypeId", (short)0);
			chargeTypeId		= ChargeTypeConstant.CHARGETYPE_ID_WEIGHT;
			rateIdMast			= new TreeMap<>();
			strBfr				= new StringJoiner(",");

			packingGroupMapping	= PackingGroupMappingDao.getInstance().findByPackingTypeAndAccountGroupId(packingTypeId, executive.getAccountGroupId());

			if(packingGroupMapping != null) {
				packingGroupId		= packingGroupMapping.getPackingGroupTypeId();
				packingTypeId		= 0;
			}

			//Route level charges
			rateMaster = RateMasterDao.getInstance().getConfigRates(srcBranchId,destBranchId,executive.getAccountGroupId(),categoryTypeId,minWght,maxWght,vehicleTypeId,packingTypeId,corporateAccountId,chargeTypeId,rateTypeId,packingGroupId);
			setFilteredWeigthRate(rateMaster, rateIdMast, userWeightInput);

			//LR level charges
			rateMaster = RateMasterDao.getInstance().getConfigRates(srcBranchId,0,executive.getAccountGroupId(),categoryTypeId,minWght,maxWght,0,0,corporateAccountId,(short)0,rateTypeId,packingGroupId);

			if(rateMaster != null && rateMaster.length > 0)
				for (final RateMaster element : rateMaster)
					if(rateIdMast.get(element.getChargeTypeMasterId()) == null)
						rateIdMast.put(element.getChargeTypeMasterId(), element.getRate());

			//Loading type charges
			rateMaster = RateMasterDao.getInstance().getConfigRates(srcBranchId,0,executive.getAccountGroupId(),categoryTypeId,minWght,maxWght,0,0,corporateAccountId,chargeTypeId,rateTypeId,packingGroupId);
			setFilteredWeigthRate(rateMaster, rateIdMast, userWeightInput);

			//if Party rates not defined then apply general rates
			if(categoryTypeId == RateMaster.CATEGORY_TYPE_PARTY_ID ) {

				//Route level charges
				rateMaster = RateMasterDao.getInstance().getConfigRates(srcBranchId,destBranchId,executive.getAccountGroupId(),RateMaster.CATEGORY_TYPE_GENERAL_ID,minWght,maxWght,vehicleTypeId,packingTypeId,0,chargeTypeId,(short)0,packingGroupId);
				setFilteredWeigthRate(rateMaster, rateIdMast, userWeightInput);

				//LR level charges
				rateMaster = RateMasterDao.getInstance().getConfigRates(srcBranchId,0,executive.getAccountGroupId(),RateMaster.CATEGORY_TYPE_GENERAL_ID,minWght,maxWght,0,0,0,(short)0,(short)0,packingGroupId);

				if(rateMaster != null && rateMaster.length > 0)
					for (final RateMaster element : rateMaster)
						if(rateIdMast.get(element.getChargeTypeMasterId()) == null)
							rateIdMast.put(element.getChargeTypeMasterId(), element.getRate());

				//Loading type charges
				rateMaster = RateMasterDao.getInstance().getConfigRates(srcBranchId,0,executive.getAccountGroupId(),RateMaster.CATEGORY_TYPE_GENERAL_ID,minWght,maxWght,0,0,0,chargeTypeId,(short)0,packingGroupId);
				setFilteredWeigthRate(rateMaster, rateIdMast, userWeightInput);
			}

			final var count =	rateIdMast.size();

			if(count > 0)
				for(final Map.Entry<Long, Double> entry : rateIdMast.entrySet())
					strBfr.add(entry.getKey() + "=" + entry.getValue());
		} catch(final Exception e) {
			e.printStackTrace();
			strBfr.add("Error : While getting Rates !");
		} finally {
			rateMaster			= null;
			packingGroupMapping	= null;
		}

		return strBfr.toString();
	}

	private void setFilteredRate(RateMaster[] rateMaster, Map<Long, Double>	rateIdMast, int userArticleInput) {
		var		rate	= 0D;

		try {
			if(rateMaster != null && rateMaster.length > 0)
				for (final RateMaster element : rateMaster) {
					rate	= element.getRate();

					if(rateIdMast.get(element.getChargeTypeMasterId()) == null) {
						if(element.getMinWeight() > 0 && element.getMaxWeight() > 0
								&& (userArticleInput < element.getMinWeight() || userArticleInput > element.getMaxWeight()))
							rate = 0;

						if (rate > 0)
							rateIdMast.put(element.getChargeTypeMasterId(), rate);
					}
				}
		} catch (final Exception e) {
			e.printStackTrace();
		}
	}

	private void setFilteredWeigthRate(RateMaster[] rateMaster, Map<Long, Double> rateIdMast, double userWeightInput) {
		var		rate	= 0D;
		try {
			if(rateMaster != null && rateMaster.length > 0)
				for (final RateMaster element : rateMaster) {
					rate	= element.getRate();

					if(rateIdMast.get(element.getChargeTypeMasterId()) == null) {
						if(element.getMinWeight() > 0 && element.getMaxWeight() > 0
								&& (userWeightInput < element.getMinWeight() || userWeightInput > element.getMaxWeight()))
							rate = 0;

						if (rate > 0)
							rateIdMast.put(element.getChargeTypeMasterId(), rate);
					}
				}
		} catch (final Exception e) {
			e.printStackTrace();
		}
	}

	private Map<Integer, Map<Long, RateMaster>> filterWeightWiseRate(List<com.iv.dto.master.bookingrate.RateMaster> rateMasterList, RateMaster basicDataMaster) throws Exception {
		final var							packingTypeMasterId			= 0L;
		Map<Integer, Map<Long, RateMaster>> filteredRateHM				= null;
		Map<Long, RateMaster> 				rateHM						= null;
		try {
			rateHM			= filterArticleAndWeightTypeRate(rateMasterList, packingTypeMasterId, basicDataMaster);

			if(rateHM != null && rateHM.size() > 0) {
				filteredRateHM	= new HashMap<>();
				filteredRateHM.put(0, rateHM);
			}

			return filteredRateHM;
		} catch (final Exception e) {
			e.printStackTrace();
		} finally {
			filteredRateHM			= null;
			rateHM					= null;
		}
		return filteredRateHM;
	}

	private Map<Long, Map<Long, RateMaster>> filterQuantityWiseRate(List<com.iv.dto.master.bookingrate.RateMaster> rateMasterList,RateMaster basicDataMaster,HashMap<Long,Integer> 	qtyMapWithPackage) throws Exception {
		Map<Long, Map<Long, RateMaster>> filteredRateHM				= null;
		Map<Long, RateMaster> 			rateHM						= null;

		try {
			filteredRateHM			= new HashMap<>();

			for(final Entry<Long, Integer> cd : qtyMapWithPackage.entrySet()) {
				final long packingTypeMasterId	= cd.getKey();

				basicDataMaster.setPackingTypeId(packingTypeMasterId);

				rateHM			= filterArticleAndWeightTypeRate(rateMasterList, packingTypeMasterId, basicDataMaster);

				if(rateHM != null && rateHM.size() > 0)
					filteredRateHM.put(packingTypeMasterId, rateHM);
			}

			return filteredRateHM;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, GenericRateAjaxAction.class.getName());
		} finally {
			filteredRateHM			= null;
			rateHM					= null;
		}
	}



	private Map<Long, RateMaster> filterArticleAndWeightTypeRate(List<com.iv.dto.master.bookingrate.RateMaster> rateMasterList, long packingTypeMasterId, RateMaster basicDataMaster) throws Exception {
		List<RateMaster>		newRateList				= null;
		Map<Long, RateMaster> 	rateHM					= null;

		try {
			rateHM				= new HashMap<>();

			newRateList			= filterRouteWiseRate(rateMasterList, packingTypeMasterId, basicDataMaster);
			checkAndInsertRates(newRateList, rateHM);

			return rateHM;
		} catch (final Exception e) {
			e.printStackTrace();
		} finally {
			newRateList				= null;
			rateHM					= null;
		}
		return rateHM;
	}

	private List<RateMaster> filterRouteWiseRate(List<com.iv.dto.master.bookingrate.RateMaster> rateMasterList, long packingTypeMasterId, RateMaster basicDataMaster) throws Exception {
		List<RateMaster>		newRateList				= null;

		try {
			if(rateMasterList != null && !rateMasterList.isEmpty()) {
				newRateList			= new ArrayList<>();

				for (final com.iv.dto.master.bookingrate.RateMaster e : rateMasterList)
					if(e.getVehicleTypeId()			== basicDataMaster.getVehicleTypeId()
					&& e.getChargeTypeId()			== basicDataMaster.getChargeTypeId()
					&& e.getBranchId()				== basicDataMaster.getBranchId()
					&& e.getPackingTypeId()			== packingTypeMasterId
					&& (e.getCategoryTypeId() 		== RateMasterConstant.CATEGORY_TYPE_PARTY_ID || e.getCategoryTypeId() == RateMasterConstant.CATEGORY_TYPE_GENERAL_ID))
						newRateList.add(newRateMasterObj(e, basicDataMaster));
			}

			return newRateList;
		} catch (final Exception e) {
			e.printStackTrace();
		} finally {
			newRateList			= null;
		}
		return newRateList;
	}

	private void checkAndInsertRates(List<RateMaster> newRateList, Map<Long, RateMaster> rateHM) {
		try {
			if(newRateList != null && !newRateList.isEmpty())
				for (final RateMaster rateMaster : newRateList)
					if(rateHM.get(rateMaster.getChargeTypeMasterId()) == null)
						rateHM.put(rateMaster.getChargeTypeMasterId(), rateMaster);
		} catch (final Exception e) {
			e.printStackTrace();
		}
	}

	private RateMaster newRateMasterObj(com.iv.dto.master.bookingrate.RateMaster e2, RateMaster basicDataMaster) {
		RateMaster		rateMaster		= null;

		try {
			rateMaster		= new RateMaster();

			rateMaster.setPackingTypeId(basicDataMaster.getPackingTypeId());
			rateMaster.setConsignmentGoodsId(basicDataMaster.getConsignmentGoodsId());
			rateMaster.setChargeTypeId(e2.getChargeTypeId());
			rateMaster.setChargeTypeMasterId(e2.getChargeTypeMasterId());
			rateMaster.setRate(e2.getRate());
			rateMaster.setMinWeight(e2.getMinWeight());
			rateMaster.setMaxWeight(e2.getMaxWeight());
			rateMaster.setDestinationBranchId(e2.getDestinationBranchId());
			rateMaster.setBranchId(e2.getBranchId());
			rateMaster.setRateMasterId(e2.getRateMasterId());
			rateMaster.setCorporateAccountId(basicDataMaster.getCorporateAccountId());

			if(e2.getCorporateAccountId() > 0)
				rateMaster.setPartywiseRateApplied(true);

			return rateMaster;
		} catch (final Exception e) {
			e.printStackTrace();
		} finally {
			rateMaster		= null;
		}
		return rateMaster;
	}

	private void compareAmount(Map<Integer, Map<Long, RateMaster>> filteredRateWeightHM, Map<Long, Map<Long, RateMaster>> filteredRateArticalHM, Map<Long, Double> rateMapIP,
			ChargeTypeModel[] charges, double weight, String applyRateForCharges, Map<Long, Integer> qtyMapWithPackage, ValueObject valueObjectOut) throws Exception {
		List<Long> 			applyRateForChargesList			= null;
		var				perArticleRate					= 0.0;
		var				perKgRate						= 0.0;
		var				purefrieghtAmount				= 0.0;
		var				isPerArticleWiseRateapply		= false;
		Map<Long, Double> 	partyWiseHm						= null;

		try {
			partyWiseHm	= new HashMap<>();
			applyRateForChargesList		= CollectionUtility.getLongListFromString(applyRateForCharges);

			for(final ChargeTypeModel chargeTypeModel : charges) {
				if(filteredRateWeightHM != null && !filteredRateWeightHM.isEmpty())
					for(final Map.Entry<Integer, Map<Long, RateMaster>> entry : filteredRateWeightHM.entrySet()) {
						final var ratemasterHM	= entry.getValue();

						var rate	= 0.0;

						for(final Map.Entry<Long, RateMaster> entry1 : ratemasterHM.entrySet())
							if(chargeTypeModel.getChargeTypeMasterId() == entry1.getKey())
								if(applyRateForChargesList.contains(chargeTypeModel.getChargeTypeMasterId())) {
									rate		= weight * entry1.getValue().getRate();

									if(chargeTypeModel.getChargeTypeMasterId()== BookingChargeConstant.FREIGHT)
										perKgRate	= entry1.getValue().getRate();
								} else
									rate		= entry1.getValue().getRate();

						if(!rateMapIP.containsKey(chargeTypeModel.getChargeTypeMasterId()))
							rateMapIP.put(chargeTypeModel.getChargeTypeMasterId(), rate);

						if(!partyWiseHm.containsKey(chargeTypeModel.getChargeTypeMasterId()))
							partyWiseHm.put(chargeTypeModel.getChargeTypeMasterId(), rate);
					}

				if(filteredRateArticalHM != null && !filteredRateArticalHM.isEmpty()) {
					var rate	= 0.0;

					for(final Map.Entry<Long, Map<Long, RateMaster>> entry : filteredRateArticalHM.entrySet()) {
						final var ratemasterHM	= entry.getValue();

						for(final Map.Entry<Long, RateMaster> entry1 : ratemasterHM.entrySet())
							if(chargeTypeModel.getChargeTypeMasterId() == entry1.getKey())
								if(applyRateForChargesList.contains(chargeTypeModel.getChargeTypeMasterId())) {
									rate		+= qtyMapWithPackage.getOrDefault(entry.getKey(), 0) * entry1.getValue().getRate();

									if(chargeTypeModel.getChargeTypeMasterId()== BookingChargeConstant.FREIGHT)
										perArticleRate	=  entry1.getValue().getRate();
								} else
									rate		+= entry1.getValue().getRate();
					}

					if(rateMapIP.getOrDefault(chargeTypeModel.getChargeTypeMasterId(), 0.0) < rate) {
						isPerArticleWiseRateapply = true;
						rateMapIP.put(chargeTypeModel.getChargeTypeMasterId(), rate);
					}
				}
			}

			if(isPerArticleWiseRateapply)
				purefrieghtAmount	= perArticleRate;
			else
				purefrieghtAmount 	= perKgRate;

			valueObjectOut.put("purefrieghtAmount", purefrieghtAmount);
			valueObjectOut.put("isPerArticleWiseRateapply", isPerArticleWiseRateapply);
			valueObjectOut.put("purefrieghtQtyAmount", 0);
			valueObjectOut.put("rateId_ChargeAmt", DataObjectConvertor.hashMapWithDataTypeToHashMapConversion(rateMapIP));
		} catch (final Exception e) {
			e.printStackTrace();
		}
	}

}
