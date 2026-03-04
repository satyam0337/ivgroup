package com.ivcargo.actions;

//~--- non-JDK imports --------------------------------------------------------

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringUtils;

import com.businesslogic.DispatchBLL;
import com.businesslogic.PendingDispatchStockBLL;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.bll.impl.generateconsolidateewaybill.GenerateConsolidateEWayBillBllImpl;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.properties.constant.LoadingSheetPropertyConstant;
import com.iv.utils.constant.Constant;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.DispatchLedger;
import com.platform.dto.ECargoConstantFile;
import com.platform.dto.Executive;
import com.platform.dto.configuration.modules.GroupConfigurationPropertiesDTO;
import com.platform.dto.configuration.modules.LsConfigurationDTO;
import com.platform.resource.CargoErrorList;
import com.platform.utils.TokenGenerator;

public class DispatchWayBillAction implements Action {

	public static final String TRACE_ID = "DispatchWayBillAction";
	Executive executive = null;
	CacheManip cache = null;

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String, Object> error = null;
		var						isRailwayBranch		= false;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if (ActionStaticUtil.isSystemError(request, error))
				return;

			cache = new CacheManip(request);
			executive = cache.getExecutive(request);
			/*
			 * Branch destBranch= cache.getGenericBranchDetailCache(request,
			 * executive.getAccountGroupId(), JSPUtility.GetLong(request,
			 */
			final var destBranch = cache.getGenericBranchDetailCache(request, JSPUtility.GetLong(request, "VehicleDestinationBranchId", 0));
			final var lsConfiguration	= ReadAllConfigurationsBllImpl.getInstance().getConfigurationData(ModuleIdentifierConstant.DISPATCH, executive.getAccountGroupId());

			final var allowAutoGenerateConEWaybill	= (boolean) lsConfiguration.getOrDefault(LsConfigurationDTO.ALLOW_AUTO_GENERATE_CON_EWAYBILL, false);

			// destination branch must belong to destination city
			if (destBranch != null) {

				final var 	dispatchBLL 			= new DispatchBLL();
				final var   inValObj            	= new ValueObject();
				ValueObject outValObj           	= null;
				final var 	dispatchLedger      	= populateDispatchLedger(request);
				final var   values              	= request.getParameterValues("wayBills");
				final var   wayBillsForDispatch 	= new Long[values.length];
				final var 	wayBillIdsForDispatch 	= new StringBuilder();
				final var							pdsBranchIds						= request.getParameter("pdsBranchIds");
				for (var i = 0; i < values.length; i++) {
					wayBillsForDispatch[i] = Long.parseLong(values[i]);
					if (i != values.length - 1)
						wayBillIdsForDispatch.append(Long.parseLong(values[i]) + ",");
					else
						wayBillIdsForDispatch.append(Long.parseLong(values[i]));
				}

				final var		TOKEN_VALUE							= JSPUtility.GetString(request, TokenGenerator.TOKEN_VALUE, null);

				final var		pendingDispatchStockBLL				= new PendingDispatchStockBLL();
				final var		inValueObject						= new ValueObject();

				inValueObject.put("wayBillIds", wayBillIdsForDispatch.toString());
				inValueObject.put("pdsBranchIds", pdsBranchIds);

				final var 						isWayBillAllowForDispatch			= pendingDispatchStockBLL.checkWayBillForDispatch(inValueObject);

				if (isWayBillAllowForDispatch) {

					inValObj.put("wayBillsForDispatch", wayBillsForDispatch);
					inValObj.put("dispatchLedger", dispatchLedger);
					inValObj.put("executive", executive);
					inValObj.put("executiveBranchId", executive.getBranchId());
					inValObj.put("branchColl", cache.getGenericBranchesDetail(request));
					inValObj.put("pdsBranchIds", pdsBranchIds);
					inValObj.put(LsConfigurationDTO.LS_CONFIGURATION, cache.getLsConfiguration(request, executive.getAccountGroupId()));
					inValObj.put(GroupConfigurationPropertiesDTO.GROUP_CONFIGURATION, cache.getGroupConfiguration(request, executive.getAccountGroupId()));

					if(TOKEN_VALUE != null) {
						if(!TOKEN_VALUE.equals(request.getSession().getAttribute(TokenGenerator.TOKEN_VALUE))) {
							error.put("errorCode", CargoErrorList.DISPATCH_ERROR);
							error.put("errorDescription", "Data already submitted, Please wait.");
							request.setAttribute("cargoError", error);
							request.setAttribute("nextPageToken", "failure");
							return;
						}
						request.getSession().setAttribute(TokenGenerator.TOKEN_VALUE, null);
					}

					if((boolean) lsConfiguration.getOrDefault(LoadingSheetPropertyConstant.RAILWAY_BRANCH_WISE_DISPATCH, false))
						isRailwayBranch		= com.iv.utils.utility.Utility.isIdExistInLongList(lsConfiguration, LoadingSheetPropertyConstant.RAILWAY_BRANCH_IDS_FOR_DISPATCH, dispatchLedger.getDestinationBranchId());

					if(allowAutoGenerateConEWaybill && !isRailwayBranch) {
						final var isVehicleAllowForConsolidatedEwayBill = GenerateConsolidateEWayBillBllImpl.getInstance().checkVehicleNumberForConsolidateEwayBill(dispatchLedger.getVehicleNumber(), executive.getAccountGroupId());

						if(isVehicleAllowForConsolidatedEwayBill) {
							error.put(CargoErrorList.ERROR_CODE, CargoErrorList.CONSOLIDATE_EWAYBILL_VEHICLE_ERROR);
							error.put(CargoErrorList.ERROR_DESCRIPTION,CargoErrorList.CONSOLIDATE_EWAYBILL_VEHICLE_ERROR_DESCRIPTION);
							request.setAttribute("cargoError", error);
							request.setAttribute("nextPageToken", Constant.FAILURE);
							return;
						}
					}

					outValObj = dispatchBLL.dispatchWayBills(inValObj);

					final var status = (String) outValObj.get("status");

					if ("success".equals(status)) {
						final long dispatchLedgerId = (Long) outValObj.get("dispatchLedgerId");

						// Setting the type of Dispatch for Sadanad Carriers
						var isDispatchForOwnGroup = true;
						final var condition = executive.getAccountGroupId() == ECargoConstantFile.ACCOUNTGORUPID_SOUTHERN && request.getParameter("dispatchFor") != null;

						if (condition)
							isDispatchForOwnGroup = "own".equals(request.getParameter("dispatchFor"));

						response.sendRedirect("SearchWayBill.do?pageId=3&eventId=3&dispatchLedgerId=" + dispatchLedgerId + "&Type=Dispatched&isDispatchForOwnGroup=" + isDispatchForOwnGroup);
						request.setAttribute("nextPageToken", "success");
						request.setAttribute("dispatchLedgerId", dispatchLedgerId);
					} else {
						error.put("errorCode", CargoErrorList.DISPATCH_ERROR);
						error.put("errorDescription", CargoErrorList.DISPATCH_ERROR_DESCRIPTION);
						request.setAttribute("cargoError", error);
						request.setAttribute("nextPageToken", "failure");
					}
				} else {
					error.put("errorCode", CargoErrorList.DUPLICATE_DISPATCH_ERROR);
					error.put("errorDescription", CargoErrorList.DUPLICATE_DISPATCH_ERROR_DESCRIPTION);
					request.setAttribute("cargoError", error);
					request.setAttribute("nextPageToken", "failure");
				}

			} else {
				error.put("errorCode", CargoErrorList.WRONG_BRANCHFORCITY_ERROR);
				error.put("errorDescription", CargoErrorList.WRONG_BRANCHFORCITY_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
				request.setAttribute("nextPageToken", "failure");
			}

		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}

	}

	private DispatchLedger populateDispatchLedger(final HttpServletRequest request) throws Exception {
		final var createDate = new Timestamp(new Date().getTime());
		final var dispatchLedger = new DispatchLedger();

		dispatchLedger.setTypeOfLS(DispatchLedger.TYPE_OF_LS_ID_NORMAL);
		dispatchLedger.setAccountGroupId(executive.getAccountGroupId());
		dispatchLedger.setCleanerName(StringUtils.upperCase(JSPUtility.GetString(request, "cleanerName", "")));

		dispatchLedger.setDestinationBranchId(JSPUtility.GetLong(request, "VehicleDestinationBranchId"));

		if (request.getParameter("driver") != null)
			dispatchLedger.setDriverName(StringUtils.upperCase(JSPUtility.GetString(request, "driver")));
		else
			dispatchLedger.setDriverName(StringUtils.upperCase(JSPUtility.GetString(request, "driver1Name", "")));

		if (request.getParameter("driver1MobileNumber1") != null)
			if ("".equals(JSPUtility.GetString(request, "driver1MobileNumber1"))
					|| "Driver 1 Mob. No 1".equals(JSPUtility.GetString(request, "driver1MobileNumber1")))
				dispatchLedger.setDriver1MobileNumber1(null);
			else
				dispatchLedger.setDriver1MobileNumber1(JSPUtility.GetString(request, "driver1MobileNumber1"));

		dispatchLedger.setDriver2Name(StringUtils.upperCase(JSPUtility.GetString(request, "driver2Name", "")));

		if (request.getParameter("driver1MobileNumber2") != null)
			if ("".equals(JSPUtility.GetString(request, "driver1MobileNumber2"))
					|| "Driver 1 Mob. No 2".equals(JSPUtility.GetString(request, "driver1MobileNumber1")))
				dispatchLedger.setDriver1MobileNumber2(null);
			else
				dispatchLedger.setDriver1MobileNumber2(JSPUtility.GetString(request, "driver1MobileNumber2"));

		dispatchLedger.setMarkForDelete(false);
		dispatchLedger.setSourceBranchId(executive.getBranchId());

		if (request.getParameter("remark") != null) {
			final var remark = StringUtils.upperCase(request.getParameter("remark"));
			if ("".equals(remark) || "REMARK".equals(remark)) {
			} else
				dispatchLedger.setRemark(request.getParameter("remark"));
		}

		if (request.getParameter("tripDate") != null && request.getParameter("tripTime") != null) {
			final var	tripDate = JSPUtility.GetString(request, "tripDate");
			var	tripTime = JSPUtility.GetString(request, "tripTime");

			final var amPm = JSPUtility.GetString(request, "ampm");

			tripTime = createTime(tripTime, amPm);

			final var dateFormat = new SimpleDateFormat("dd-MM-yyyy h:mm a");
			final var parsedDate = dateFormat.parse(tripDate + " " + tripTime);
			final var dispatchTripTime = new Timestamp(parsedDate.getTime());

			dispatchLedger.setTripDateTime(dispatchTripTime);
		} else
			dispatchLedger.setTripDateTime(createDate);

		if (request.getParameter("totalNoOfWayBill") != null)
			dispatchLedger.setTotalNoOfWayBills(JSPUtility.GetInt(request, "totalNoOfWayBill"));
		else
			dispatchLedger.setTotalNoOfWayBills(JSPUtility.GetInt(request, "totalNoOfWayBills", 0));

		dispatchLedger.setTotalNoOfPackages(JSPUtility.GetInt(request, "totalNoOfPackages"));
		dispatchLedger.setTripName("trip");
		dispatchLedger.setActualDispatchDateTime(createDate);
		dispatchLedger.setBranchTransfer(false);
		dispatchLedger.setVehicleNumber(JSPUtility.GetString(request, "vehicleNumber"));
		dispatchLedger.setVehicleNumberMasterId(cache.getVehicleNumberIdByNumber(request, executive.getAccountGroupId(), JSPUtility.GetString(request, "vehicleNumber")));
		dispatchLedger.setSuperVisor(StringUtils.upperCase(JSPUtility.GetString(request, "superVisor", "")));
		dispatchLedger.setLsBranchId(executive.getBranchId());

		if (request.getParameter("vehicleAgent") != null && request.getParameter("totalAmount") != null
				&& request.getParameter("advanceAmount") != null && request.getParameter("balanceAmount") != null
				&& !StringUtils.equalsIgnoreCase("Vehicle Agent", request.getParameter("vehicleAgent"))) {
			final var agentData = new StringBuilder();
			agentData.append("Vehicle Owner Name : " + StringUtils.upperCase(request.getParameter("vehicleAgent")));
			agentData.append(" , Lorry Hire  : " + request.getParameter("totalAmount"));
			agentData.append(" , Adv Amount  : " + request.getParameter("advanceAmount"));
			agentData.append(" , Bal Amount  : " + request.getParameter("balanceAmount"));
			dispatchLedger.setSuperVisor(agentData.toString());
		}

		return dispatchLedger;
	}

	private String createTime(final String time, final String amPm) throws Exception {
		final var fromMinTime 	= StringUtils.trim(StringUtils.trim(time).split(":")[0]);
		final var fromToTime 	= StringUtils.trim(StringUtils.trim(time).split(":")[1]);

		return fromMinTime + ":" + fromToTime + " " + amPm;
	}
}