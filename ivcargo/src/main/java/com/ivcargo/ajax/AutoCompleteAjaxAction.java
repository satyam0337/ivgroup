package com.ivcargo.ajax;

import java.io.PrintWriter;
import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.ObjectUtils;
import org.apache.commons.lang3.StringUtils;
import org.json.JSONArray;
import org.json.JSONObject;

import com.businesslogic.PackingTypeMasterBll;
import com.businesslogic.RegionBll;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.constant.properties.STBSConfigurationConstant;
import com.iv.constant.properties.master.CollectionPersonMasterConfigurationConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.properties.constant.SelectOptionsPropertiesConstant;
import com.iv.utils.CollectionUtility;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.exception.ExceptionProcess;
import com.iv.utils.utility.ListFilterUtility;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.actions.ShortCreditCollectionPersonAction;
import com.ivcargo.utils.CacheManip;
import com.ivcargo.utils.JsonUtility;
import com.platform.dao.CashStatementTxnDAO;
import com.platform.dao.CollectionPersonMasterDao;
import com.platform.dao.ConsignmentGoodsDao;
import com.platform.dao.DeliveryCustomerMasterDao;
import com.platform.dao.DriverMasterDao;
import com.platform.dao.LorryHireRouteDao;
import com.platform.dao.VehicleNumberMasterDao;
import com.platform.dao.VehiclePendingForArrivalDao;
import com.platform.dto.AliasNameConstants;
import com.platform.dto.Branch;
import com.platform.dto.CashStatementTxn;
import com.platform.dto.ConfigParam;
import com.platform.dto.Executive;
import com.platform.dto.GroupConfigurationProperties;
import com.platform.dto.ShortCreditCollectionSheetLedgerDto;
import com.platform.dto.TransportCommonMaster;
import com.platform.dto.VehicleNumberMaster;
import com.platform.dto.configuration.modules.GroupConfigurationPropertiesDTO;
import com.platform.dto.constant.FeildPermissionsConstant;
import com.platform.dto.constant.WayBillTypeConstant;
import com.platform.dto.model.CreditWayBillTxn;
import com.platform.dto.model.CreditWayBillTxnCleranceSummary;
import com.platform.resource.CargoErrorList;
import com.platform.utils.PropertiesUtility;
import com.platform.utils.Utility;

public class AutoCompleteAjaxAction implements Action {

	private static final String TRACE_ID = "AutoCompleteAjaxAction";

	@Override
	@SuppressWarnings({ "unchecked", "unused" })
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {

		HashMap<String,Object>	 				error 						= null;
		PrintWriter								out							= null;
		String									strQry						= null;
		String									otherBranchIds 				= null;
		JSONObject								jObject1					= null;
		ValueObject 							valueInObject				= null;
		JSONObject 								jsonObjectOut				= null;

		try {

			out = response.getWriter();
			final var	jArray	= new JSONArray();

			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			response.setContentType("text/plain");
			var	cache		= new CacheManip(request);
			final var	executive	= cache.getExecutive(request);

			if (executive == null) {
				error.put("errorCode", CargoErrorList.NO_EXEUCUTIVE_FOUND_ERROR);
				error.put("errorDescription", CargoErrorList.NO_EXEUCUTIVE_FOUND_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
				return;
			}

			var	strBfr		= new StringBuilder();

			final var 	filter 						= Short.parseShort(request.getParameter("filter"));

			final var	configuration	 = cache.getGroupConfiguration(request, executive.getAccountGroupId());

			switch (filter) {
			case 1 -> {
				if(executive != null)
					try {

						cache = new CacheManip(request);
						strBfr = new StringBuilder();

						if(request.getParameter("otherBranchIds") != null)
							otherBranchIds = request.getParameter("otherBranchIds");

						if(request.getParameter("q") != null) {
							strQry = request.getParameter("q");
							final Map<String, String>	destList = cache.getCrossingHubsByNameAndGroupId(request, strQry, executive.getAccountGroupId(), otherBranchIds,executive.getBranchId());

							if (destList != null )
								for (final String key : destList.keySet())
									strBfr.append(key + "|" + destList.get(key)+"\n");
						} else
							strBfr.append("norecord");
					} catch(final Exception e) {
						ExceptionProcess.execute(e, TRACE_ID);
						strBfr.append(e);
					}
				else
					strBfr.append("You are logged out, Please login again !");
				out.println(strBfr.toString());
				request.setAttribute("nextPageToken", "success");
			}
			case 2 -> {
				if(executive != null)
					try {

						cache = new CacheManip(request);
						strBfr = new StringBuilder();

						if(request.getParameter("otherBranchIds") != null)
							otherBranchIds = request.getParameter("otherBranchIds");

						if(request.getParameter("q") != null) {
							strQry = request.getParameter("q");
							final Map<String, String>	destList = cache.getCrossingHubsByNameAndGroupId(request, strQry, executive.getAccountGroupId(), otherBranchIds,executive.getBranchId());
							final var	locationMap = cache.getLocationMappingDetailsByAssignedLocationId(request, executive.getAccountGroupId(), Long.parseLong(otherBranchIds));
							final var	branchName = cache.getGenericBranchDetailCache(request, locationMap.getLocationId());
							final var	subRegionName = cache.getGenericSubRegionById(request, branchName.getSubRegionId());

							if (destList != null ) {
								for (final String key : destList.keySet())
									strBfr.append(key+"|"+destList.get(key)+"\n");

								if(locationMap != null && branchName != null )
									strBfr.append(branchName.getName()+"("+subRegionName.getName()+")"+"|"+locationMap.getLocationId()+"_"+branchName.getCityId()+"_"+branchName.getStateId()+"\n");
							}
						} else
							strBfr.append("norecord");
					} catch(final Exception e) {
						ExceptionProcess.execute(e, TRACE_ID);
						strBfr.append(e);
					}
				else
					strBfr.append("You are logged out, Please login again !");
				out.println(strBfr.toString());
				request.setAttribute("nextPageToken", "success");
			}
			case 3 -> {
				if(executive != null)
					try {
						if(request.getParameter("city") != null) {
							final var	branches = cache.getBothTypeOfSelfGroupBranchesDetails(request,Long.toString(executive.getAccountGroupId()),request.getParameter("city"));

							for (final Branch branche : branches) {
								final var	branch = branche;

								if(branch.getStatus() == Branch.BRANCH_ACTIVE && branch.getTypeOfLocation() == Branch.TYPE_OF_LOCATION_PHYSICAL)
									strBfr.append(","+branch.getName()+"="+branch.getBranchId());
							}
						} else
							strBfr.append("NoRecord");
					} catch(final Exception e) {
						ExceptionProcess.execute(e, TRACE_ID);
						strBfr.append(e);
					}
				else
					strBfr.append("You are logged out, Please login again !");
				out.println(strBfr.toString());
				request.setAttribute("nextPageToken", "success");
			}
			case 4 -> {
				if(executive != null && request.getParameter("WBNumber") != null)
					try {
						new ShortCreditCollectionPersonAction().execute(request, response);

						//CollHshmp			= (HashMap<Long, ShortCreditCollectionBillClearanceDto>) request.getAttribute("CollHshmp");
						final var	creditSummColl		= (HashMap<Long, CreditWayBillTxnCleranceSummary>) request.getAttribute("CollHshmp");
						final var	sdf					= new SimpleDateFormat("dd-MM");
						final var	creditWayBillTxn 	= (CreditWayBillTxn[])request.getAttribute("creditWayBillTxn");

						if(creditWayBillTxn != null && creditWayBillTxn.length > 0)
							for (final CreditWayBillTxn element : creditWayBillTxn) {
								strBfr.append(element.getWayBillId());
								strBfr.append(";"+element.getWayBillNumber());

								if (element.getCreationDateTimeStamp() != null)
									strBfr.append(";"+sdf.format(element.getCreationDateTimeStamp()));
								else
									strBfr.append(";"+"--");

								strBfr.append(";"+element.getSourceBranch());
								strBfr.append(";"+element.getDestinationBranch());
								strBfr.append(";"+element.getConsignor());
								strBfr.append(";"+element.getConsignee());
								strBfr.append(";"+element.getActualWeight());
								strBfr.append(";"+element.getQuantity());

								/*if(CollHshmp!= null && CollHshmp.get(creditWayBillTxn[i].getWayBillId()) != null){
									strBfr.append(";"+Math.round(creditWayBillTxn[i].getGrandTotal()-creditSummColl.get(creditWayBillTxn[i].getCreditWayBillTxnId()).getReceivedAmount()));
								}else{
									strBfr.append(";"+Math.round(creditWayBillTxn[i].getGrandTotal()));
								} */

								if(creditSummColl!= null && creditSummColl.get(element.getCreditWayBillTxnId()) != null)
									strBfr.append(";"+Math.round(element.getGrandTotal()-creditSummColl.get(element.getCreditWayBillTxnId()).getReceivedAmount()));
								else
									strBfr.append(";"+Math.round(element.getGrandTotal()));

								strBfr.append(";"+element.getCollectionPersonName());
							}
						else
							strBfr.append("NoRecordFound");
					} catch(final Exception e) {
						ExceptionProcess.execute(e, TRACE_ID);
						strBfr.append(e);
					}
				else
					strBfr.append("You are logged out, Please login again !");
				out.println(strBfr.toString());
				request.setAttribute("nextPageToken", "success");
			}
			case 5 -> {
				if(executive != null)
					try {
						final var regionBll = new RegionBll();

						if(request.getParameter("regionCode") != null) {
							final var	regionCode = request.getParameter("regionCode");
							strBfr.append(regionBll.isRegionCodeExists(StringUtils.upperCase(regionCode), executive.getAccountGroupId()));
						} else
							strBfr.append("Region Code missing !");
					}  catch(final Exception e) {
						ExceptionProcess.execute(e, TRACE_ID);
						strBfr.append(e);
					}
				else
					strBfr.append("You are logged out, Please login again !");
				out.println(strBfr.toString());
				request.setAttribute("nextPageToken", "success");
			}
			case 8 -> {
				response.setContentType("application/json"); // Setting response for JSON Content

				if(executive != null)
					try {
						cache = new CacheManip(request);
						final var	isHandlingBranchRequired = PropertiesUtility.isAllow(configuration.getString(GroupConfigurationPropertiesDTO.IS_HANDLING_BRANCH_REQUIRED, "false"));

						if(request.getParameter("otherBranchIds") != null)
							otherBranchIds = request.getParameter("otherBranchIds");

						if(request.getParameter("term") != null) {
							strQry 			= request.getParameter("term");
							final Map<String, String>	destList 		= cache.getCrossingHubsByNameAndGroupId(request, strQry, executive.getAccountGroupId(), otherBranchIds, executive.getBranchId());
							final var	locationMap 	= cache.getLocationMappingDetailsByAssignedLocationId(request, executive.getAccountGroupId(), Long.parseLong(otherBranchIds));
							final var	branchName 		= cache.getGenericBranchDetailCache(request, locationMap.getLocationId());
							final var	subRegionName 	= cache.getSubRegionByIdAndGroupId(request, branchName.getSubRegionId(), executive.getAccountGroupId());

							if (destList != null ) {
								destList.keySet().forEach((final String key) -> {
									final var	jObject	= new JSONObject();

									if(locationMap != null && branchName != null ) {
										final var	locationMapBranchName			= branchName.getName() + " ( " + subRegionName.getName() + " ) ";
										final var	locationMapBranchId				= locationMap.getLocationId() + "_" + branchName.getCityId() + "_" + branchName.getStateId();
										final var locationMapBranch		= locationMapBranchId.split("_")[0];

										if(StringUtils.contains(destList.get(key), locationMapBranch)) {
											jObject.put("label", locationMapBranchName);
											jObject.put("id", locationMapBranchId);
										} else {
											jObject.put("label", key);
											jObject.put("id", destList.get(key));
										}

									}

									jArray.put(jObject);
								});

								if(isHandlingBranchRequired) {
									jObject1 = new  JSONObject();

									if(locationMap != null && branchName != null ) {
										final var	locationMapBranchName 			= branchName.getName() + " ( " + subRegionName.getName() + " ) ";
										final var	locationMapBranchId	 			= locationMap.getLocationId() + "_" + branchName.getCityId() + "_" + branchName.getStateId();

										jObject1.put("label", locationMapBranchName);
										jObject1.put("id", locationMapBranchId);
										jArray.put(jObject1);
									}
								}
							}
						}
					} catch(final Exception e) {
						ExceptionProcess.execute(e, TRACE_ID);
						jArray.put(getErrorJsonObject());
					}
				else
					jArray.put(getLogoutJsonObject());

				if(jArray.length() < 1)
					jArray.put(setAutocompleteResponse(request));

				out.println(jArray);
			}
			case 12 -> {
				/*
				 * created in AutoCompleteBllImpl
				 * as getAllConsignmentGoodsDetailsByName
				 */
				response.setContentType("application/json"); // Setting response for JSON Content
				if(executive != null) {
					Map<String, String> 	conGoodsList					= null;
					Map<String, String> 	sortedConGoodsList 				= null;

					try {
						final var	showSaidToContainByPackingType		= JSPUtility.GetBoolean(request, "showSaidToContainByPackingType", false);
						final var	packingTypeMasterId		= JSPUtility.GetLong(request, "packingTypeId", 0);

						if (request.getParameter("term") != null) {
							strQry 			= request.getParameter("term");

							if(showSaidToContainByPackingType)
								conGoodsList	= ConsignmentGoodsDao.getInstance().getConsignmentGoodsListByNameFromPackingTypeConsignmentGoodsMappingMaster(executive.getAccountGroupId(), packingTypeMasterId, strQry);
							else
								conGoodsList 	= ConsignmentGoodsDao.getInstance().getConsignmentGoodsByName(strQry,executive.getAccountGroupId());

							if(conGoodsList != null && !conGoodsList.isEmpty()) {
								final List<String> mapKeys 	= new ArrayList<>(conGoodsList.keySet());
								final List<String> mapValues 	= new ArrayList<>(conGoodsList.values());
								Collections.sort(mapValues);
								Collections.sort(mapKeys);

								sortedConGoodsList =  new LinkedHashMap<>();

								for (final String val : mapValues) {
									final var 	keyIt 	= mapKeys.iterator();

									while (keyIt.hasNext()) {
										final var key 		= keyIt.next();
										final var comp 	= conGoodsList.get(key);
										final var comp1 	= val;

										if (comp.equals(comp1)) {
											keyIt.remove();
											sortedConGoodsList.put(key, val);
											break;
										}
									}
								}
							}

							if (sortedConGoodsList != null )
								for (final String key : sortedConGoodsList.keySet()) {
									final var	jObject	= new JSONObject();
									jObject.put("label",sortedConGoodsList.get(key));
									jObject.put("id",key);
									jArray.put(jObject);
								}
						}
					}  catch(final Exception e) {
						ExceptionProcess.execute(e, TRACE_ID);
						out.println(e);
					}

				} else
					jArray.put(getLogoutJsonObject());

				if(jArray.length() < 1)
					jArray.put(setAutocompleteResponse(request));

				out.println(jArray);
			}
			case 13 -> {
				//used in
				// CollectionPersonAutoCompleter.js
				response.setContentType("application/json"); // Setting response for JSON Content

				if(executive != null)
					try {
						if (request.getParameter("term") != null) {
							final var	collPersonList	= getCollectionPersonList(request, executive);

							if (collPersonList != null )
								collPersonList.keySet().forEach((final Long key) -> {
									final var	jObject	= new JSONObject();
									jObject.put("label", collPersonList.get(key));
									jObject.put("id", key);
									jArray.put(jObject);
								});
						}
					} catch(final Exception e) {
						ExceptionProcess.execute(e, TRACE_ID);
						jArray.put(getErrorJsonObject());
					}
				else
					jArray.put(getLogoutJsonObject());

				if(jArray.length() < 1)
					jArray.put(setAutocompleteResponse(request));

				out.println(jArray);
			}
			case 14 -> {
				response.setContentType("application/json"); // Setting response for JSON Content
				final var	showAllBranchOption	= JSPUtility.GetBoolean(request, "showAllBranchOption", false);
				final var	showPhysicalOrOperationalBothBranch		= JSPUtility.GetBoolean(request, "showPhysicalOrOperationalBothBranch", false);

				if(executive != null) {
					var id = 0L;
					final var typeOfLocaion = JSPUtility.GetShort(request, "typeOfLocaion", (short)0);
					short executiveType = 0;

					try {
						if (executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_GROUPADMIN)
							executiveType = Executive.EXECUTIVE_TYPE_GROUPADMIN;
						else if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_REGIONADMIN) {
							executiveType = Executive.EXECUTIVE_TYPE_REGIONADMIN;
							id = executive.getRegionId();
						} else if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_SUBREGIONADMIN) {
							executiveType = Executive.EXECUTIVE_TYPE_SUBREGIONADMIN;
							id = executive.getSubRegionId();
						} else {
							if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_BRANCHADMIN)
								executiveType = Executive.EXECUTIVE_TYPE_BRANCHADMIN;
							else
								executiveType = Executive.EXECUTIVE_TYPE_EXECUTIVE;

							id = executive.getBranchId();
						}

						if(request.getParameter("term") != null) {
							strQry				= request.getParameter("term");
							final Map<String, String>	destList			= cache.getActivePhysicalBranchAndCityWiseDestinationByRegionIdOrSubRegionId(request, strQry, executive.getAccountGroupId(),executiveType,id,typeOfLocaion,showPhysicalOrOperationalBothBranch);

							if (destList != null )
								destList.keySet().forEach((final String key) -> {
									final var	jObject	= new JSONObject();
									jObject.put("label", key);
									jObject.put("id", destList.get(key));
									jArray.put(jObject);
								});
						}
					} catch(final Exception e) {
						ExceptionProcess.execute(e, TRACE_ID);
						jArray.put(getErrorJsonObject());
					}
				} else
					jArray.put(getLogoutJsonObject());

				if(showAllBranchOption) {
					final var	jObject = new JSONObject();
					jObject.put("label", "ALL");
					jObject.put("id", "-1_-1_-1");
					jArray.put(jObject);
				}

				if(jArray.length() < 1)
					jArray.put(setAutocompleteResponse(request));

				out.println(jArray);
			}
			case 16 -> {
				response.setContentType("application/json"); // Setting response for JSON Content

				if(executive != null) {
					final var						branchId		= executive.getBranchId();

					try {
						if (request.getParameter("term") != null) {
							strQry 			= request.getParameter("term");
							final var	collPersonList	= DeliveryCustomerMasterDao.getInstance().getDeliveryCustomerByName(strQry,executive.getAccountGroupId(), branchId);

							if (collPersonList != null )
								collPersonList.keySet().forEach((final Long key) -> {
									final var	jObject	= new JSONObject();
									jObject.put("label",collPersonList.get(key));
									jObject.put("id",key);
									jArray.put(jObject);
								});
						}
					} catch(final Exception e) {
						ExceptionProcess.execute(e, TRACE_ID);
						jArray.put(getErrorJsonObject());
					}
				} else
					jArray.put(getLogoutJsonObject());

				if(jArray.length() < 1)
					jArray.put(setAutocompleteResponse(request));

				out.println(jArray);
			}
			case 17 -> {
				if(executive != null)
					try {
						cache	= new CacheManip(request);

						final var	groupConfig		= cache.getGroupConfiguration(request, executive.getAccountGroupId());

						if(request.getParameter("q") != null) {
							request.setAttribute("setAutocompleteOnInitialChar", PropertiesUtility.isAllow(groupConfig.get(GroupConfigurationPropertiesDTO.SET_AUTOCOMPLETE_ON_INITIAL_CHAR)+""));
							strBfr	= cache.getDestinationBranches(request, executive);
						} else
							strBfr.append("norecord");
					} catch(final Exception e) {
						ExceptionProcess.execute(e, TRACE_ID);
						out.println(e);
					}
				else
					strBfr.append("You are logged out, Please login again !");
				out.println(strBfr.toString());
			}
			case 18 -> {
				if(executive != null)
					try {
						if(request.getParameter("q") != null) {
							final var	branchName	= StringUtils.trim(request.getParameter("q"));
							final var	crossingAgentId = JSPUtility.GetLong(request, "crossingAgentId",0);

							if(crossingAgentId > 0){
								final Map<String, String>	destList	= cache.getCrossingAgentBookingSourceMap(request, executive.getAccountGroupId(), crossingAgentId, executive.getBranchId(), branchName);

								if(destList != null && destList.size() > 0)
									for(final String key : destList.keySet())
										strBfr.append(key + "|" + destList.get(key) + "\n");
								else
									strBfr.append("Error : No Source Branch Found For Crossing Agent");
							} else
								strBfr.append("Error : Please enter valid Crossing Agent !");
						} else
							strBfr.append("Error : No Source Branch Found For Crossing Agent");

					} catch(final Exception e) {
						ExceptionProcess.execute(e, TRACE_ID);
						out.println(e);
					}
				else
					strBfr.append("Error : You are logged out, Please login again !");

				out.println(strBfr.toString());
			}
			case 19 -> {
				response.setContentType("application/json"); // Setting response for JSON Content

				if(executive != null)
					try {
						if (request.getParameter("term")!=null){
							strQry 			= request.getParameter("term");
							final Map<Long, String>	collPersonList 	= DriverMasterDao.getInstance().getLicenseNumberById(strQry, executive.getAccountGroupId());

							if (collPersonList != null )
								collPersonList.entrySet().forEach((final Map.Entry<Long, String> entry) -> {
									final var	jObject	= new JSONObject();
									jObject.put("label", entry.getValue());
									jObject.put("id", entry.getKey());
									jArray.put(jObject);
								});
						}
					} catch(final Exception e) {
						ExceptionProcess.execute(e, TRACE_ID);
						jArray.put(getErrorJsonObject());
					}
				else
					jArray.put(getLogoutJsonObject());

				if(jArray.length() < 1)
					jArray.put(setAutocompleteResponse(request));

				out.println(jArray);
			}
			case 20 -> {
				response.setContentType("application/json"); // Setting response for JSON Content

				if(executive != null)
					try {
						if (request.getParameter("term") != null) {
							strQry 			= request.getParameter("term");
							final var	routeTypeId 	= JSPUtility.GetShort(request, "routeTypeId", (short) 0);
							final Map<Long, String>	vehicleNoList 	= VehicleNumberMasterDao.getInstance().findByName(executive.getAccountGroupId(), strQry, routeTypeId);

							if (vehicleNoList != null)
								vehicleNoList.entrySet().forEach((final Map.Entry<Long, String> entry) -> {
									final var	jObject	= new JSONObject();
									jObject.put("label", entry.getValue());
									jObject.put("id", entry.getKey());
									jArray.put(jObject);
								});
							else {
								final var	jObject	= new JSONObject();
								jObject.put("label","No Records Found");
								jObject.put("id","0");
								jArray.put(jObject);
							}
						}
					} catch(final Exception e) {
						ExceptionProcess.execute(e, TRACE_ID);
						jArray.put(getErrorJsonObject());
					}
				else
					jArray.put(getLogoutJsonObject());

				if(jArray.length() < 1)
					jArray.put(setAutocompleteResponse(request));

				out.println(jArray);
			}
			case 21 -> {
				response.setContentType("application/json"); // Setting response for JSON Content

				if(executive != null) {
					final var jsonObjectGet        = new JSONObject(request.getParameter("json"));
					jsonObjectOut					= new JSONObject();
					valueInObject					= new ValueObject();
					final var	licNo 			= (String) jsonObjectGet.get("lic");
					final var 	driverMaster 	= DriverMasterDao.getInstance().getNameByLicenceNo(licNo,executive.getAccountGroupId());
					final var   date     	 	= Utility.getCurrentDateTime();
					final var	driverDetails			 		= new HashMap<>();

					try {
						if(driverMaster != null) {
							if(driverMaster.getDriverMasterId() != 0)
								driverDetails.put("Id", driverMaster.getDriverMasterId());

							if(driverMaster.getName() != null)
								driverDetails.put("Name", driverMaster.getName());

							if(driverMaster.getMobileNumber() != null)
								driverDetails.put("Mobile1", driverMaster.getMobileNumber());

							if(driverMaster.getMobileNumber2() != null)
								driverDetails.put("Mobile2", driverMaster.getMobileNumber2());

							valueInObject.put("DriverDataDetails", driverDetails);

							if(driverMaster.getDateOfIssue() != null && driverMaster.getValidUpto() != null) {
								if(date.after(driverMaster.getDateOfIssue()) && date.before(driverMaster.getValidUpto()))
									valueInObject.put("DriverData", "Details");
								else
									valueInObject.put("DriverData", "License Expired");
							} else
								valueInObject.put("DriverData","Update Details");
						} else
							valueInObject.put("DriverData", "No Record Found");
					} catch(final Exception e) {
						ExceptionProcess.execute(e, TRACE_ID);
						out.println(e);
					}
				}

				out.println(JsonUtility.convertionToJsonObjectForResponse(valueInObject));
			}
			case 24 -> out.println(souceBranchAutocomplete(request,response));
			case 25 -> {
				response.setContentType("application/json");

				if(executive != null) {
					Timestamp					creationDateTimeStamp					= null;
					String						previousDate							= null;

					try {
						new ShortCreditCollectionPersonAction().execute(request, response);

						final var	creditSummColl			= (HashMap<Long, CreditWayBillTxnCleranceSummary>) request.getAttribute("CollHshmp");
						final var	creditWayBillTxn 		= (CreditWayBillTxn[]) request.getAttribute("creditWayBillTxn");
						final var	creditWayBillTxnsList	= new ArrayList<CreditWayBillTxn>();
						final List<Timestamp>	timeStampList			= new ArrayList<>();
						jsonObjectOut			= new JSONObject();

						final var	executiveFeildPermission 	= cache.getExecutiveFieldPermission(request);
						final var	stbsConfiguration		= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.STBS);

						final var	allowBackDateEntryForStbsCreation	= executiveFeildPermission != null && executiveFeildPermission.containsKey(FeildPermissionsConstant.ALLOW_BACK_DATE_IN_STBS_CREATION);
						final var	showBookingDateInAnyCondition		= (boolean) request.getAttribute("showBookingDateInAnyCondition");

						final var	showStbsDueDate						= (boolean) stbsConfiguration.getOrDefault(STBSConfigurationConstant.SHOW_STBS_DUE_DATE, false);

						if(creditWayBillTxn != null && creditWayBillTxn.length > 0)
							for (final CreditWayBillTxn element : creditWayBillTxn) {
								final var creditWayBillTxnObj	= new CreditWayBillTxn();

								creditWayBillTxnObj.setWayBillId(element.getWayBillId());
								creditWayBillTxnObj.setWayBillNumber(element.getWayBillNumber());

								if (showBookingDateInAnyCondition)
									creditWayBillTxnObj.setCreationDateTime(DateTimeUtility.getDateFromTimeStamp(element.getBookingDateTime()));
								else
									creditWayBillTxnObj.setCreationDateTime(DateTimeUtility.getDateFromTimeStamp(element.getCreationDateTimeStamp()));

								creditWayBillTxnObj.setSourceBranch(element.getSourceBranch());
								creditWayBillTxnObj.setDestinationBranch(element.getDestinationBranch());
								creditWayBillTxnObj.setConsignor(element.getConsignor());
								creditWayBillTxnObj.setConsignee(element.getConsignee());
								creditWayBillTxnObj.setActualWeight(element.getActualWeight());
								creditWayBillTxnObj.setQuantity(element.getQuantity());

								if(creditSummColl != null && creditSummColl.get(element.getCreditWayBillTxnId()) != null)
									creditWayBillTxnObj.setGrandTotal(Math.round(element.getGrandTotal() - creditSummColl.get(element.getCreditWayBillTxnId()).getReceivedAmount()));
								else
									creditWayBillTxnObj.setGrandTotal(Math.round(element.getGrandTotal()));

								creditWayBillTxnObj.setCollectionPersonName(element.getCollectionPersonName());
								creditWayBillTxnObj.setCreditWayBillTxnId(element.getCreditWayBillTxnId());
								creditWayBillTxnObj.setTxnTypeId(element.getTxnTypeId());
								creditWayBillTxnObj.setTxnTypeName(CreditWayBillTxn.getTxnType(element.getTxnTypeId()));
								creditWayBillTxnObj.setWayBillTypeId(element.getWayBillTypeId());
								creditWayBillTxnObj.setDeliveredToName(Utility.checkedNullCondition(element.getDeliveredToName(), (short) 1));
								creditWayBillTxnObj.setWayBillDeliveryNumber(Utility.checkedNullCondition(element.getWayBillDeliveryNumber(), (short) 1));
								creditWayBillTxnObj.setExecutiveName(element.getExecutiveName());
								creditWayBillTxnObj.setInvoiceNo(element.getInvoiceNo());
								creditWayBillTxnObj.setConsignorId(element.getConsignorId());
								creditWayBillTxnObj.setConsigneeId(element.getConsigneeId());
								creditWayBillTxnObj.setBkgDateTime(DateTimeUtility.getDateFromTimeStamp(element.getBookingDateTimeTimeStamp()));
								creditWayBillTxnObj.setDeliveryDateTime(DateTimeUtility.getDateFromTimeStamp(element.getWaybillDeliveryDateTimeStamp()));

								creditWayBillTxnsList.add(creditWayBillTxnObj);
								timeStampList.add(element.getCreationDateTimeStamp());
							}
						else
							jsonObjectOut.put("norecordfound", "Record not found !");

						if(creditWayBillTxnsList != null && !creditWayBillTxnsList.isEmpty()) {
							if(allowBackDateEntryForStbsCreation) {
								final var	noOfDays 				= cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_MAX_DAYS_OF_OPERATION_BEFORE_CASHSTATEMENT_ENTRY_ID);
								previousDate			= DateTimeUtility.getDateBeforeNoOfDays(noOfDays);
								final var	previousDateTimeStamp	= DateTimeUtility.getTimeStamp(previousDate);

								if(timeStampList != null && !timeStampList.isEmpty())
									creationDateTimeStamp	= timeStampList.stream().min(Timestamp::compareTo).orElse(null);

								if(creationDateTimeStamp != null && creationDateTimeStamp.getTime() > previousDateTimeStamp.getTime())
									previousDate	= DateTimeUtility.getDateFromTimeStamp(creationDateTimeStamp);
							}

							final var	inValueObject = new ValueObject();

							inValueObject.put("creditWayBillTxnCall", creditWayBillTxnsList);
							inValueObject.put("WayBillTypeConstant", WayBillTypeConstant.getWayBillTypeConstant());
							inValueObject.put("CreditWayBillTxnConstant", CreditWayBillTxn.getCreditWayBillTxnConstant());
							inValueObject.put("STBSSelectionTypeConstant", ShortCreditCollectionSheetLedgerDto.getSTBSSelectionTypeConstant());
							inValueObject.put("allowBackDateEntryForStbsCreation", allowBackDateEntryForStbsCreation);
							inValueObject.put("previousDate", previousDate);
							inValueObject.put(STBSConfigurationConstant.SHOW_STBS_DUE_DATE, showStbsDueDate);

							jsonObjectOut = JsonUtility.convertionToJsonObjectForResponse(inValueObject);
						}

					} catch(final Exception e) {
						ExceptionProcess.execute(e, TRACE_ID);
					}
				} else {
					jsonObjectOut	= new JSONObject();
					jsonObjectOut.put("logout", "You are logged out, Please login again !");
				}
				out.println(jsonObjectOut);
			}
			case 26 -> {
				response.setContentType("application/json"); // Setting response for JSON Content

				if(executive != null)
					try {
						if (request.getParameter("term") != null) {
							strQry 			= request.getParameter("term");

							final var	vehicleNoList 	= VehicleNumberMasterDao.getInstance().getVehicleListByVehicleNumber(executive.getAccountGroupId(), strQry);

							if (vehicleNoList != null )
								vehicleNoList.keySet().forEach((final Long key) -> {
									final var	jObject	= new JSONObject();
									jObject.put("label", vehicleNoList.get(key).getVehicleNumber());
									jObject.put("vehicleTypeId", vehicleNoList.get(key).getVehicleTypeId());
									jObject.put("vehicleTypeCapacity", vehicleNoList.get(key).getVehicleTypeCapacity());
									jObject.put("vehicleTypeName", vehicleNoList.get(key).getVehicleTypeName());
									jObject.put("id", key);
									jArray.put(jObject);
								});
							else {
								final var	jObject	= new JSONObject();
								jObject.put("label", "No Records Found");
								jObject.put("id", "0");
								jArray.put(jObject);
							}
						}
					} catch(final Exception e) {
						ExceptionProcess.execute(e, TRACE_ID);
						jArray.put(getErrorJsonObject());
					}
				else
					jArray.put(getLogoutJsonObject());

				if(jArray.length() < 1)
					jArray.put(setAutocompleteResponse(request));

				out.println(jArray);
			}
			case 27 -> {
				response.setContentType("application/json"); // Setting response for JSON Content

				if(executive != null)
					try {
						if (request.getParameter("term")!=null) {
							strQry 				= request.getParameter("term");
							final var	packingTypeHM		= cache.getPackingTypeByNameAndGroupId(request, strQry, executive.getAccountGroupId());

							if (packingTypeHM != null )
								packingTypeHM.keySet().forEach((final Long key) -> {
									final var	jObject	= new JSONObject();
									jObject.put("label",packingTypeHM.get(key));
									jObject.put("id",key);
									jArray.put(jObject);
								});
						}
					}  catch(final Exception e) {
						ExceptionProcess.execute(e, TRACE_ID);
						out.println(e);
					}
				else
					jArray.put(getLogoutJsonObject());

				if(jArray.length() < 1)
					jArray.put(setAutocompleteResponse(request));

				out.println(jArray);
			}
			case 28 -> out.println(driverDetailsAutocomplete(request, response));
			case 29 -> out.println(branchAutoComplete(request, response));
			case 30 -> out.println(pkgTypeMasterAutoComplete(request, response));
			case 31 -> out.println(vehicleListAutocompleteByRouteType(request, response));
			case 33 -> out.println(getDestinationBranchAutocompleteForReverseEntry(request, response));
			case 34 -> out.println(getSourceBranchAutocompleteForReverseEntry(request, response));
			case 35 -> out.println(getAssignedBranchListByAssignedAccountGroupId(request));
			case 36 -> {
				if(executive != null) {
					final var  vehiclePendingForArrivalId = JSPUtility.GetLong(request, "vehiclePendingForArrivalId", 0);

					try {
						if(vehiclePendingForArrivalId > 0)
							strBfr.append(VehiclePendingForArrivalDao.getInstance().checkLorryHireRouteMarkArrived(vehiclePendingForArrivalId, (short)1));
						else
							strBfr.append("Error NoRecord");
					} catch(final Exception e) {
						ExceptionProcess.execute(e, TRACE_ID);
						strBfr.append(e);
					}
				} else
					strBfr.append("You are logged out, Please login again !");

				out.println(strBfr.toString());
			}
			case 37 -> {
				if(executive != null) {
					final var  			lorryHireId 		= JSPUtility.GetLong(request, "lorryHireId",0);
					var					count				= 0;

					try {
						cache = new CacheManip(request);

						if(lorryHireId > 0) {
							final var	lorryHireRouteArr = LorryHireRouteDao.getInstance().getLorryHireRouteByLorryHireId(lorryHireId);

							if(lorryHireRouteArr != null && lorryHireRouteArr.length > 0)
								for(var i = 0; i < lorryHireRouteArr.length; i++) {

									count++;
									strBfr.append(count + ") ");
									strBfr.append(cache.getBranchById(request, executive.getAccountGroupId(), lorryHireRouteArr[i].getRouteBranchId()).getName());

									if(i < lorryHireRouteArr.length - 1)
										strBfr.append("\n");
								}
							else
								strBfr.append(CargoErrorList.NO_RECORDS_DESCRIPTION);
						} else
							strBfr.append(CargoErrorList.NO_RECORDS_DESCRIPTION);
					} catch(final Exception e) {
						ExceptionProcess.execute(e, TRACE_ID);
						strBfr.append(e);
					}
				} else
					strBfr.append(CargoErrorList.SESSION_INVALID_DESCRIPTION);

				out.println(strBfr.toString());
			}
			case 38 -> {
				if(executive != null) {
					final var  lorryHireId		 = JSPUtility.GetLong(request, "lorryHireId",0);
					final var  routeBranchId 	 = JSPUtility.GetLong(request, "routeBranchId",0);

					try {
						if(lorryHireId > 0 && routeBranchId > 0) {
							final var	lorryHireRoute = LorryHireRouteDao.getInstance().getLorryHireRouteDetailById(lorryHireId, routeBranchId);

							strBfr.append(lorryHireRoute != null && lorryHireRoute.getDispatchLedgerIds() != null && lorryHireRoute.getDispatchLedgerIds().length() > 0);
						} else
							strBfr.append("Error NoRecord");
					} catch(final Exception e) {
						ExceptionProcess.execute(e, TRACE_ID);
						strBfr.append(e);
					}
				} else
					strBfr.append("You are logged out, Please login again !");

				out.println(strBfr.toString());
			}
			case 39 -> {
				if(executive != null) {
					final var  lorryHireId		 = JSPUtility.GetLong(request, "lorryHireId",0);
					final var  routeBranchId 	 = JSPUtility.GetLong(request, "routeBranchId",0);

					try {
						if(lorryHireId > 0 && routeBranchId > 0) {
							final var	executiveAssignedLocationIdList = cache.getAssignedLocationsIdListByLocationIdId(request, executive.getBranchId(), executive.getAccountGroupId());

							if(!executiveAssignedLocationIdList.contains(executive.getBranchId()))
								executiveAssignedLocationIdList.add(executive.getBranchId());

							strBfr.append(executiveAssignedLocationIdList.contains(routeBranchId));
						} else
							strBfr.append("Error NoRecord");
					} catch(final Exception e) {
						ExceptionProcess.execute(e, TRACE_ID);
						strBfr.append(e);
					}
				} else
					strBfr.append("You are logged out, Please login again !");

				out.println(strBfr.toString());
			}
			case 40 -> {
				response.setContentType("application/json"); // Setting response for JSON Content

				if(executive != null)
					try {
						if(request.getParameter("term") != null) {
							strQry					= request.getParameter("term");
							final var	routeTypeId = JSPUtility.GetShort(request, "routeTypeId", (short) 0);
							final var	vehicleNoList = VehicleNumberMasterDao.getInstance().findOwnByName(executive.getAccountGroupId(), strQry, routeTypeId);

							if (vehicleNoList != null)
								for (final Long key : vehicleNoList.keySet()) {
									final var	vehicleNumberMaster = cache.getVehicleNumber(request, executive.getAccountGroupId(), key);

									final var	jObject	= new JSONObject();

									jObject.put("label",vehicleNoList.get(key) );
									jObject.put("id", key);
									jObject.put("routeType", vehicleNumberMaster.getRoutingType());
									jArray.put(jObject);
								}
							else {
								final var	jObject	= new JSONObject();
								jObject.put("label","no Record");
								jObject.put("id","0");
								jObject.put("routeType", "0");
								jArray.put(jObject);
							}
						}
					} catch(final Exception e) {
						ExceptionProcess.execute(e, TRACE_ID);
						jArray.put(getErrorJsonObject());
					}
				else
					jArray.put(getLogoutJsonObject());

				if(jArray.length() < 1)
					jArray.put(setAutocompleteResponse(request));

				out.println(jArray);
			}
			case 41 -> out.println(getSubRegionWiseDestination(request));//boking and update destination
			case 42 -> {
				//for bill Generation Jsp populate telephone and Service provider Name
				if(executive!= null)
					try{
						final var	sdf						= new SimpleDateFormat("dd-MM-yyyy");
						final var	sdf1					= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss:SSS");
						final var	fromCompleteDate        = new Timestamp(sdf1.parse(sdf.format(new Date().getTime()) + " 00:00:00:000").getTime());
						final var	toCompleteDate	        = new Timestamp(sdf1.parse(sdf.format(new Date().getTime()) + " 23:59:59:998").getTime());

						if (request.getParameter("spId")!=null){
							strBfr 		= new StringBuilder();
							final var	cashColl	= CashStatementTxnDAO.getInstance().getBranchRecordFromCashStatement(Long.parseLong(request.getParameter("spId")), ""+CashStatementTxn.IDENTIFIER_FOR_OPENING_BALANCE, fromCompleteDate, toCompleteDate);

							if(cashColl != null && cashColl.size() > 0)
								for(final short key:cashColl.keySet()) {
									final var	model = cashColl.get(key);
									strBfr.append(model.getCreditAmount() + "|" + model.getDebitAmount() + "\n");
								}

							out = response.getWriter();

							if(strBfr.length() > 0)
								out.println(StringUtils.substring(strBfr.toString(), 0, strBfr.length() - 1)); //Remove last comma
						}
					} catch (final Exception e) {
						e.printStackTrace();
					}
			}
			case 43 -> {
				var				destinationBranchId	= 0L;
				ValueObject		valueInObj			= null;

				try {
					if(request.getParameter("destinationBranchId") != null)
						destinationBranchId	= Long.parseLong(request.getParameter("destinationBranchId"));

					valueInObj		= new ValueObject();

					final var	destBranch 		= cache.getGenericBranchDetailCache(request, destinationBranchId);

					if(destBranch != null && destBranch.getTypeOfLocation() == Branch.TYPE_OF_LOCATION_OPERATIONAL_PLACE )
						if(destBranch.getRemark() != null)
							valueInObj.put("remark", "This location is only for Door Delivery! " + destBranch.getRemark());
						else
							valueInObj.put("remark", "This location is only for Door Delivery! ");
				} catch (final Exception e) {
					ExceptionProcess.execute(e, TRACE_ID);
				}

				out.println(JsonUtility.convertionToJsonObjectForResponse(valueInObj));
			}
			case 44 -> {
				response.setContentType("application/json"); // Setting response for JSON Content
				if(executive != null) {
					Map <Long, String> 	categoryTypeHM	 	= null;

					try {
						categoryTypeHM		= cache.getCategoryTypesForGroup(request, executive.getAccountGroupId());

						if (categoryTypeHM != null)
							categoryTypeHM.entrySet().forEach((final Map.Entry<Long, String> entry) -> {
								final var	jObject	= new JSONObject();
								jObject.put("label", entry.getValue());
								jObject.put("id", entry.getKey());
								jArray.put(jObject);
							});
					}  catch(final Exception e) {
						ExceptionProcess.execute(e, TRACE_ID);
						out.println(e);
					}
				} else
					jArray.put(getLogoutJsonObject());

				if(jArray.length() < 1)
					jArray.put(setAutocompleteResponse(request));

				out.println(jArray);
			}
			case 45 -> {
				response.setContentType("application/json");

				final var cityIdParam = request.getParameter("cityId");
				if (cityIdParam == null) {
					jArray.put(getLogoutJsonObject());
					out.println(jArray);
					return;
				}

				try {
					final var cityId = Long.parseLong(cityIdParam);

					if (executive == null) {
						jArray.put(getLogoutJsonObject());
						out.println(jArray);
						return;
					}

					final var executiveType = executive.getExecutiveType();
					final var id = switch (executiveType) {
					case Executive.EXECUTIVE_TYPE_REGIONADMIN -> executive.getRegionId();
					case Executive.EXECUTIVE_TYPE_SUBREGIONADMIN -> executive.getSubRegionId();
					case Executive.EXECUTIVE_TYPE_BRANCHADMIN, Executive.EXECUTIVE_TYPE_EXECUTIVE -> executive.getBranchId();
					default -> 0L;
					};

					final var destList = cache.getAllGroupBranches(request, executive.getAccountGroupId());

					destList.entrySet().stream()
					.filter(entry -> {
						final var branch = entry.getValue();
						return branch.getCityId() == cityId && switch (executiveType) {
						case Executive.EXECUTIVE_TYPE_GROUPADMIN -> true;
						case Executive.EXECUTIVE_TYPE_REGIONADMIN -> id == branch.getRegionId();
						case Executive.EXECUTIVE_TYPE_SUBREGIONADMIN -> id == branch.getSubRegionId();
						case Executive.EXECUTIVE_TYPE_BRANCHADMIN, Executive.EXECUTIVE_TYPE_EXECUTIVE -> id == branch.getBranchId();
						default -> false;
						};
					})
					.map(entry -> {
						final var branch = entry.getValue();
						final var json = new JSONObject();
						json.put("label", branch.getName());
						json.put("id", entry.getKey());
						return json;
					})
					.forEach(jArray::put);

				} catch (final Exception e) {
					ExceptionProcess.execute(e, TRACE_ID);
					jArray.put(getErrorJsonObject());
				}

				out.println(jArray);
			}
			}
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		} finally {
			out.flush();
			out.close();
		}
	}

	private JSONObject setAutocompleteResponse(final HttpServletRequest request) throws Exception {
		try {
			final var	jObject	= new JSONObject();

			jObject.put("id", "0");

			if(request.getParameter("responseFilter") != null) {
				final var resType = JSPUtility.GetShort(request, "responseFilter", (short) 0);

				switch (resType) {
				case GroupConfigurationProperties.AUTOCOMPLETE_RESPONSE_NORECORD -> jObject.put("label", "No Record Found");
				case GroupConfigurationProperties.AUTOCOMPLETE_RESPONSE_SAMEDATA -> jObject.put("label", request.getParameter("term") + " (New)");
				default -> jObject.put("label", "No Record Found");
				}
			}

			return jObject;
		} catch (final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
			return getErrorJsonObject();
		}
	}

	private JSONArray souceBranchAutocomplete(final HttpServletRequest request, final HttpServletResponse response) throws Exception {
		Map<String, String> 			sourceListination		= null;
		String 							term					= null;
		Map<String, String> 			sourceHM 				= null;
		Map <String, String> 			destinationList 		= null;
		String							sourceBranch			= null;
		short							sourceTypeOfLocation	= 0;
		var							permissionForSourceBranch								= false;
		short  						stateGSTCode								= 0;

		final var	executive			= (Executive) request.getSession().getAttribute(AliasNameConstants.EXECUTIVE);

		if(executive == null) {
			final var	jArray 	= new JSONArray();
			jArray.put(getLogoutJsonObject());
			return jArray;
		}

		try {
			response.setContentType("application/json"); // Setting response for JSON Content

			final var branchId = executive.getBranchId();
			final var subRegionId 	= executive.getSubRegionId();

			var	responseFilter	= JSPUtility.GetInt(request, "responseFilter", 0);
			final var	showAllOperationBranchInSource				= JSPUtility.GetBoolean(request, "showAllOperationBranchInSource", false);
			final var	showAllDestinationBranchInSource			= JSPUtility.GetBoolean(request, "showAllDestinationBranchInSource", false);
			final var	showOperationBranchInSourceSubregionWise	= JSPUtility.GetBoolean(request, "showOperationBranchInSourceSubregionWise", false);

			if(request.getParameter("term") != null)
				term = request.getParameter("term");

			final var	cache				= new CacheManip(request);
			final var	executiveFeildPermission 	= cache.getExecutiveFieldPermission(request);
			final var	groupConfig		= cache.getGroupConfiguration(request, executive.getAccountGroupId());
			final var	showAllRegionOrSubregionBranchesInSourceBranch = groupConfig.getInt(GroupConfigurationPropertiesDTO.SHOW_ALL_REGION_OR_SUB_REGION_BRANCHES_IN_SOURCE_BRANCH);
			final var	branchWiseShowAllRegionOrSubregionBranchesInSourceBranch = groupConfig.getString(GroupConfigurationPropertiesDTO.BRANCH_WISE_SHOW_ALL_REGION_OR_SUB_REGION_BRANCHES_IN_SOURCE_BRANCH);
			final var	branchIdsForSourceBranch			= CollectionUtility.getLongListFromString(branchWiseShowAllRegionOrSubregionBranchesInSourceBranch);
			final var	branchIdFoundForSourceBranch		= branchIdsForSourceBranch.contains(executive.getBranchId());

			if(executiveFeildPermission != null && executiveFeildPermission.get(FeildPermissionsConstant.SHOW_ALL_REGION_OR_SUBREGION_BRANCHES_IN_SOURCE_BRANCH) != null) {
				responseFilter	= 3;
				permissionForSourceBranch = true;
			}

			if(branchIdFoundForSourceBranch)
				responseFilter	= 3;

			switch(responseFilter) {
			case 2:
				sourceListination	= new TreeMap<>();

				if(showAllOperationBranchInSource)
					sourceHM 			= cache.getOperationalLocations(request, term, executive.getAccountGroupId(),branchId);
				else if(showAllDestinationBranchInSource)
					sourceHM			= cache.getAllPhysicalAndOperationalLocations(request, term, executive.getAccountGroupId());
				else if(showOperationBranchInSourceSubregionWise) {
					sourceHM 			= cache.getOperationalLocationsOfSubregion(request, term, executive.getAccountGroupId(), subRegionId);

					final var	branch		  		= cache.getGenericBranchDetailCache(request, executive.getBranchId());
					final var	subRegion			= cache.getGenericSubRegionById(request, branch.getSubRegionId());

					if(subRegion != null)
						sourceBranch 	= branch.getName() + " ( " + subRegion.getName() + " )";
					else
						sourceBranch 	= branch.getName();

					sourceHM.put(sourceBranch, branch.getBranchId() + "_" + branch.getCityId() + "_" + branch.getStateId() + "_" + branch.getTypeOfLocation());
				} else
					sourceHM			= cache.getAssignedLocations(request, term, executive.getAccountGroupId(), branchId);

				if(sourceHM != null)
					for(final Map.Entry<String, String> entry : sourceHM.entrySet())
						sourceListination.put(entry.getKey(), entry.getValue());

				destinationList		= cache.getSourceDetails(request, term, executive);

				if(destinationList != null)
					for(final Map.Entry<String, String> entry : destinationList.entrySet())
						sourceListination.put(entry.getKey(), entry.getValue());

				break;
			case 3:
				sourceListination	= new TreeMap<>();

				if(branchIdFoundForSourceBranch || permissionForSourceBranch){
					if(showAllRegionOrSubregionBranchesInSourceBranch == TransportCommonMaster.DATA_LEVEL_REGION_ID)
						sourceHM			= cache.getAllPhysicalAndOperationalByRgionBranches(request,term,executive.getAccountGroupId(),executive.getRegionId());
					else if(showAllRegionOrSubregionBranchesInSourceBranch == TransportCommonMaster.DATA_LEVEL_SUB_REGION_ID)
						sourceHM 			= cache.getAllPhysicalAndOperationalBySubRgionBranches(request,term,executive.getAccountGroupId(),executive.getSubRegionId());
					else
						sourceHM			= cache.getAssignedLocations(request, term, executive.getAccountGroupId(), branchId);
				} else
					sourceHM			= cache.getAssignedLocations(request, term, executive.getAccountGroupId(), branchId);

				if(sourceHM != null)
					for(final Map.Entry<String, String> entry : sourceHM.entrySet())
						sourceListination.put(entry.getKey(), entry.getValue());

				destinationList		= cache.getSourceDetails(request, term, executive);

				if(destinationList != null)
					for(final Map.Entry<String, String> entry : destinationList.entrySet())
						sourceListination.put(entry.getKey(), entry.getValue());

				break;
			case 1:
			default:
				sourceListination	= new TreeMap<>();
				final var	branch		  		= cache.getGenericBranchDetailCache(request, branchId);
				final var	subRegion			= cache.getGenericSubRegionById(request, branch.getSubRegionId());

				if(subRegion != null)
					sourceBranch 	= branch.getName() + " ( " + subRegion.getName() + " )";
				else
					sourceBranch 	= branch.getName();

				sourceListination.put(sourceBranch, branch.getBranchId() + "_" + branch.getCityId() + "_" + branch.getStateId() + "_" + branch.getTypeOfLocation());
				break;
			}

			final var	jArray 	= new JSONArray();

			if (sourceListination != null && sourceListination.size() > 0 )
				for(final Map.Entry<String, String> entry : sourceListination.entrySet()) {
					var	branchCode     = "";
					var	isAgentBranch  = false;

					if(entry.getValue() != null) {
						final var	branchDataArray = entry.getValue().split("_");
						final var	sourceBranchId  = Long.parseLong(branchDataArray[0]);

						final var	srcBranch = cache.getGenericBranchDetailCache(request, sourceBranchId);

						if(srcBranch != null && srcBranch.getBranchCode() != null)
							branchCode = srcBranch.getBranchCode();

						if(srcBranch != null) {
							isAgentBranch			= srcBranch.isAgentBranch();
							stateGSTCode   		 	= srcBranch.getStateGSTCode();
							sourceTypeOfLocation	= srcBranch.getTypeOfLocation();
						}
					}

					final var	jObject	= new JSONObject();
					jObject.put("label", entry.getKey());
					jObject.put("id", entry.getValue());
					jObject.put("branchCode", branchCode);
					jObject.put("isAgentBranch", isAgentBranch);
					jObject.put("StateGSTCode", stateGSTCode);
					jObject.put("sourceLocationType", sourceTypeOfLocation);
					jArray.put(jObject);
				}
			else {
				final var	jObject	= new JSONObject();
				jObject.put("label", CargoErrorList.NO_RECORDS_DESCRIPTION);
				jObject.put("id", "0");
				jArray.put(jObject);
			}

			return jArray;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private JSONArray driverDetailsAutocomplete(final HttpServletRequest request, final HttpServletResponse response) throws Exception {
		try {
			final var	cache				= new CacheManip(request);
			final var	executive			= cache.getExecutive(request);
			response.setContentType("application/json"); // Setting response for JSON Content

			final var	jArray				= new JSONArray();

			if(executive != null) {
				if(request.getParameter("term") != null) {
					final var	strQry 	= request.getParameter("term");

					final var	driverDetailsHM		= cache.getDriverDetailsByNameAndGroupId(request, strQry, executive.getAccountGroupId());

					if(driverDetailsHM != null)
						driverDetailsHM.keySet().forEach((final Long key) -> {
							final var	jObject	= new JSONObject();
							jObject.put("label", driverDetailsHM.get(key));
							jObject.put("id", key);
							jArray.put(jObject);
						});
				}
			} else
				jArray.put(getLogoutJsonObject());

			return jArray;
		} catch (final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
			return getErrorJsonArray();
		}
	}

	private JSONArray branchAutoComplete(final HttpServletRequest request, final HttpServletResponse response) throws Exception {
		try {
			final var	cache				= new CacheManip(request);
			final var	executive			= cache.getExecutive(request);
			response.setContentType("application/json"); // Setting response for JSON Content

			final var	jArray				= new JSONArray();

			if(executive != null) {
				if(request.getParameter("term") != null) {
					final var	strQry 	= request.getParameter("term");

					List<Branch> branchDetailsList = null;

					if(JSPUtility.GetBoolean(request, "showOnlyActiveBranch", false))
						branchDetailsList		= cache.getAllActiveGroupBranchesList(request, executive.getAccountGroupId());
					else
						branchDetailsList		= cache.getAllGroupBranchesList(request, executive.getAccountGroupId());

					if(JSPUtility.GetBoolean(request, SelectOptionsPropertiesConstant.SHOW_ONLY_PHYSICAL_BRANCH_OPTION, false))
						branchDetailsList	= ListFilterUtility.filterList(branchDetailsList, e -> e.getTypeOfLocation() == Branch.TYPE_OF_LOCATION_PHYSICAL);

					branchDetailsList	= ListFilterUtility.filterList(branchDetailsList, e -> StringUtils.startsWith(StringUtils.upperCase(e.getName()), StringUtils.upperCase(strQry)));

					if(!branchDetailsList.isEmpty())
						branchDetailsList.forEach((final Branch b) -> {
							final var	jObject	= new JSONObject();
							jObject.put("label", b.getName());
							jObject.put("id", b.getBranchId());
							jArray.put(jObject);
						});
				}
			} else
				jArray.put(getLogoutJsonObject());

			if(jArray.length() < 1)
				jArray.put(setAutocompleteResponse(request));

			return jArray;
		} catch (final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
			return getErrorJsonArray();
		}
	}

	private JSONArray pkgTypeMasterAutoComplete(final HttpServletRequest request, final HttpServletResponse response) throws Exception {
		try {
			final var	executive			= (Executive) request.getSession().getAttribute("executive");
			response.setContentType("application/json"); // Setting response for JSON Content

			final var	jArray				= new JSONArray();

			if(executive != null) {
				if(request.getParameter("term") != null) {
					final var	strQry 	= request.getParameter("term");

					final var	pkgTypeMasterBll = new PackingTypeMasterBll();

					final var	packingTypeList =  pkgTypeMasterBll.getPackingTypeListByName(strQry);

					if(packingTypeList != null )
						packingTypeList.keySet().forEach((final Long key) -> {
							final var	jObject	= new JSONObject();
							jObject.put("label", packingTypeList.get(key));
							jObject.put("id", key);
							jArray.put(jObject);
						});
				}
			} else
				jArray.put(getLogoutJsonObject());

			if(jArray.length() < 1)
				jArray.put(setAutocompleteResponse(request));

			return jArray;
		} catch (final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
			return getErrorJsonArray();
		}
	}

	@SuppressWarnings("unused")
	private JSONArray vehicleListAutocompleteByRouteType(final HttpServletRequest request, final HttpServletResponse response) throws Exception {
		try {
			response.setContentType("application/json"); // Setting response for JSON Content

			final var	jArray				= new JSONArray();
			final var	cache				= new CacheManip(request);
			final var	executive			= cache.getExecutive(request);

			final var	vehicleArr 	= cache.getAllVehicleNumberList(request, executive.getAccountGroupId());

			if(executive != null) {
				if(request.getParameter("term") != null) {
					final var	strQry 			= request.getParameter("term");
					final var	routeTypeId 	= JSPUtility.GetShort(request, "routeTypeId", (short)0);

					final var	vehicleNoList 	= VehicleNumberMasterDao.getInstance().findByName(executive.getAccountGroupId(), strQry, routeTypeId);

					if(vehicleNoList != null)
						for(final long key : vehicleNoList.keySet()) {
							final var	jObject	= new JSONObject();
							jObject.put("id", key);
							jObject.put("label", vehicleNoList.get(key));

							if(ObjectUtils.isNotEmpty(vehicleArr))
								for (final VehicleNumberMaster element : vehicleArr)
									if(key == element.getVehicleNumberMasterId())
										jObject.put("panNumber", Utility.checkedNullCondition(element.getPanNumber(),(short) 2));

							jArray.put(jObject);
						}
				}
			} else
				jArray.put(getLogoutJsonObject());

			if(jArray.length() < 1)
				jArray.put(setAutocompleteResponse(request));

			return jArray;
		} catch (final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
			return getErrorJsonArray();
		}
	}

	public JSONArray getWayBillDetailsToGenerateCRJSONArrayObject(final ArrayList<CreditWayBillTxn> creditWayBillTxnArrayList) throws Exception {
		JSONArray 	valueObjArray = null;

		try {
			if(creditWayBillTxnArrayList != null && creditWayBillTxnArrayList.size() > 0 ) {
				valueObjArray = new JSONArray();

				for(final CreditWayBillTxn creditWayBillTxn : creditWayBillTxnArrayList)
					valueObjArray.put(new JSONObject(creditWayBillTxn));
			}

			return valueObjArray;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private JSONArray getDestinationBranchAutocompleteForReverseEntry(final HttpServletRequest request,final HttpServletResponse response) throws Exception {
		HashMap <String, String> 		branchName   			= null;

		final var	executive			= (Executive) request.getSession().getAttribute("executive");

		if(executive == null) {
			final var	jArray = new JSONArray();
			jArray.put(getLogoutJsonObject());
			return jArray;
		}

		try {
			response.setContentType("application/json"); // Setting response for JSON Content

			final var branchId = executive.getBranchId();
			final var	cache		  = new CacheManip(request);
			final var	branch		  = cache.getGenericBranchDetailCache(request, branchId)	;
			final var	groupConfig		= cache.getGroupConfiguration(request, executive.getAccountGroupId());
			final var	isShowAccountGroupwithBranch	= PropertiesUtility.isAllow(groupConfig.get(GroupConfigurationPropertiesDTO.SHOW_ACCOUNTGROUP_IN_BRANCH_AUTOCOMPLETE_ON_BOOKING_PAGE)+"");

			if(branch != null && (branch.getBranchType() == Branch.BRANCH_TYPE_BOOKING_DELIVERY_BOTH
					|| branch.getBranchType() == Branch.BRANCH_TYPE_DELIVERY)){

				branchName			= new HashMap<>();
				branchName.put(executive.getBranchName(), branch.getBranchId() + "_" + branch.getCityId() + "_" + branch.getStateId() + "_" + branch.getTypeOfLocation()+ "_" + branch.getAccountGroupId());
			}

			final var	jArray = new JSONArray();

			if (branchName != null) {
				if(isShowAccountGroupwithBranch)
					for (final String key : branchName.keySet()) {
						final var	branchSlipted = branchName.get(key).split("_");

						if(branchSlipted[4] != null) {
							final var	accountGroup 	= cache.getAccountGroupByAccountGroupId(request, Long.parseLong(branchSlipted[4]));
							final var	subRegion		= cache.getGenericSubRegionById(request, branch.getSubRegionId());

							final var	jObject	= new JSONObject();
							jObject.put("label", key + " ( " + subRegion.getName() + " )" + " ( " + accountGroup.getAccountGroupCode() + " ) ");
							jObject.put("id", branchName.get(key));

							jArray.put(jObject);
						}
					}
				else
					for (final String key : branchName.keySet()) {
						final var	jObject	= new JSONObject();
						jObject.put("label", key);
						jObject.put("id", branchName.get(key));

						jArray.put(jObject);
					}
			} else if(jArray.length() < 1)
				jArray.put(setAutocompleteResponse(request));

			return jArray;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private JSONArray getSourceBranchAutocompleteForReverseEntry(final HttpServletRequest request, final HttpServletResponse response) throws Exception {
		final var					jArray				= new JSONArray();

		try {
			final var	cache				  	= new CacheManip(request);
			final var	executive				= cache.getExecutive(request);
			response.setContentType("application/json"); // Setting response for JSON Content

			if(executive != null) {
				final var branchId		= JSPUtility.GetLong(request, "branchId");

				if(request.getParameter("term") != null && branchId > 0) {
					final var	strQry	= request.getParameter("term");

					final var	destinationList		= cache.getSourceBranchAutocompleteForReverseEntry(request, executive.getAccountGroupId(), branchId, strQry);

					destinationList.entrySet().forEach((final Map.Entry<String, String> entry) -> {
						final var	jObject	= new JSONObject();

						jObject.put("id", entry.getKey());
						jObject.put("label", entry.getValue());
						jArray.put(jObject);
					});
				}
			} else
				jArray.put(getLogoutJsonObject());

			if(jArray.length() < 1)
				jArray.put(setAutocompleteResponse(request));

			return jArray;
		} catch (final Exception e) {
			ExceptionProcess.execute(e, TRACE_ID);
			return getErrorJsonArray();
		}
	}

	private JSONObject getErrorJsonObject() {
		final var	jObject	= new JSONObject();
		jObject.put("label","Some Error occoured While Fetching.");
		jObject.put("id","0");
		return jObject;
	}

	private JSONObject getLogoutJsonObject() {
		final var jObject	= new JSONObject();
		jObject.put("label", "You are logged out, Please login again !");
		jObject.put("id", "0");
		return jObject;
	}

	private JSONArray getErrorJsonArray() {
		final var	jOutObject		= new JSONObject();
		jOutObject.put("label", "Some Error occoured While Fetching !");
		jOutObject.put("id", "0");
		final var	jArray	= new JSONArray();
		jArray.put(jOutObject);
		return jArray;
	}

	private JSONObject getAssignedBranchListByAssignedAccountGroupId(final HttpServletRequest request) throws Exception {
		try {
			final var	cache 					= new CacheManip(request);
			final var	configAccountGroupId	= JSPUtility.GetLong(request, "configAccountGroupId");
			final var	assignAccountGroupId	= JSPUtility.GetLong(request, "assignAccountGroupId");
			final var	jArray			= new JSONArray();
			final var	assignedBranchHM  = cache.getAssignedBranchListByAssignedAccountGroupId(request, configAccountGroupId, assignAccountGroupId);

			if (assignedBranchHM != null )
				assignedBranchHM.keySet().forEach((final Long key) -> {
					final var	jObject	= new JSONObject();
					jObject.put("label",assignedBranchHM.get(key).getName());
					jObject.put("id",key);
					jArray.put(jObject);
				});

			final var	jObjectResult = new JSONObject();
			jObjectResult.put("jArray", jArray);

			return jObjectResult;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private JSONArray getSubRegionWiseDestination(final HttpServletRequest request) throws Exception {
		try {
			final var	cache 					= new CacheManip(request);
			final var	executive				= cache.getExecutive(request);
			final var	jArray					= new JSONArray();

			if(executive != null) {
				if(request.getParameter("term") != null) {
					final var	strQry 	= request.getParameter("term");

					final var	subRegionHM	= cache.getSubRegionListByAccountGroupId(request, executive, strQry);

					if(subRegionHM != null && !subRegionHM.isEmpty())
						subRegionHM.keySet().forEach((final Long key) -> {
							final var	jObject	= new JSONObject();
							jObject.put("label", subRegionHM.get(key));
							jObject.put("id", key);
							jArray.put(jObject);
						});
					else {
						final var	jObject	= new JSONObject();
						jObject.put("label", CargoErrorList.NO_RECORDS_DESCRIPTION);
						jObject.put("id", "0");
						jArray.put(jObject);
					}
				}
			} else
				jArray.put(getLogoutJsonObject());

			if(jArray.length() < 1)
				jArray.put(setAutocompleteResponse(request));

			return jArray;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public Map<Long, String> getCollectionPersonList(final HttpServletRequest request, final Executive executive) throws Exception {
		Map<Long, String> 	collPersonList		= null;

		try {
			final var	collectionPersonConfig		= ReadAllConfigurationsBllImpl.getInstance().getConfigurationData(ModuleIdentifierConstant.COLLECTION_PERSON_MASTER, executive.getAccountGroupId());

			final var	showGroupWiseCollectionPerson = JSPUtility.GetBoolean(request, "showGroupWiseCollectionPerson", false);

			var strQry 	= request.getParameter("term");

			if(request.getParameter("q") != null)
				strQry	= request.getParameter("q");

			var	branchId		= JSPUtility.GetLong(request, request.getParameter("branchId"), 0);

			if(branchId == 0)
				branchId		= executive.getBranchId();

			final var	cache	= new CacheManip(request);

			final var	collectionBranch	= cache.getBranchById(request, executive.getAccountGroupId(), branchId);

			if ((boolean) collectionPersonConfig.getOrDefault(CollectionPersonMasterConfigurationConstant.BRANCH_LEVEL_COLLECTION_PERSON, false) && !showGroupWiseCollectionPerson)
				collPersonList 	= CollectionPersonMasterDao.getInstance().getCollectionPersonByNameFromBranch(strQry, executive.getAccountGroupId(), branchId);

			if ((boolean) collectionPersonConfig.getOrDefault(CollectionPersonMasterConfigurationConstant.SUB_REGION_LEVEL_COLLECTION_PERSON, false))
				collPersonList 	= CollectionPersonMasterDao.getInstance().getCollectionPersonByNameFromSubRegion(strQry, executive.getAccountGroupId(), collectionBranch.getSubRegionId());

			if ((boolean) collectionPersonConfig.getOrDefault(CollectionPersonMasterConfigurationConstant.REGION_LEVEL_COLLECTION_PERSON, false))
				collPersonList 	= CollectionPersonMasterDao.getInstance().getCollectionPersonByNameFromRegion(strQry, executive.getAccountGroupId(), collectionBranch.getRegionId());

			if ((boolean) collectionPersonConfig.getOrDefault(CollectionPersonMasterConfigurationConstant.GROUP_LEVEL_COLLECTION_PERSON, false) || showGroupWiseCollectionPerson)
				collPersonList 	= CollectionPersonMasterDao.getInstance().getCollectionPersonByNameFromGroup(strQry, executive.getAccountGroupId());

			return collPersonList;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}
}
