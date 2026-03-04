package com.ivcargo.actions.masters;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.stream.Stream;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.properties.GeneralConfiguration;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.constant.properties.master.vehicle.DriverPropertiesConstant;
import com.iv.dao.impl.master.CountryMasterDaoImpl;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.dto.master.CountryMaster;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.constant.AccountGroupConstant;
import com.iv.utils.utility.CollectionUtility;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.DriverMasterDao;
import com.platform.dao.StateDao;
import com.platform.dto.DriverMaster;
import com.platform.dto.State;
import com.platform.dto.truckhisabmodule.DriverDailyAllowance;
import com.platform.resource.CargoErrorList;

public class DriverMasterAction implements Action{
	public static final String TRACE_ID = "DriverMasterAction";

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	error = null;
		List<State> 			stateList		= null;
		List<CountryMaster> 	countryList		= null;

		try{
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var sdf = new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			String strResponse = null;
			var	drivermasterid = 0L;
			final var cache 	= new CacheManip(request);
			final var exec 		= cache.getExecutive(request);

			final var driver = new DriverMaster();
			final var driverDailyAllowance = new DriverDailyAllowance();

			final var	generalConfig		= cache.getGeneralConfiguration(request, exec.getAccountGroupId());

			if(generalConfig.getBoolean(GeneralConfiguration.DISPLAY_COUNTRY_OPTION)
					|| exec.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_IVCARGO)
				countryList	= new CountryMasterDaoImpl().getAllCountries();

			final var 	driverMasterConfig	= cache.getConfiguration(request, exec.getAccountGroupId(), ModuleIdentifierConstant.DRIVER_MASTER);

			final var allStates = StateDao.getInstance().findAll();

			if(allStates != null)
				stateList	= Stream.of(allStates).filter(e -> e.getCountryId() == exec.getCountryId()).collect(CollectionUtility.getList());

			final var filter =JSPUtility.GetInt(request, "filter",0);

			switch (filter) {
			case 1 -> {
				driver.setName(JSPUtility.GetString(request, "name"));
				driver.setAddress(JSPUtility.GetString(request, "address"));
				driver.setNativeAddress(JSPUtility.GetString(request, "nativeAddress"));

				if(JSPUtility.GetString(request, "dateOfBirth") != null && !"".equals(JSPUtility.GetString(request, "dateOfBirth")) )
					driver.setDateOfBirth(new Timestamp(sdf.parse(JSPUtility.GetString(request, "dateOfBirth") + " 00:00:00").getTime()));

				driver.setAccountGroupId(exec.getAccountGroupId());
				driver.setStateId(JSPUtility.GetLong(request, "state"));
				driver.setCountryId(exec.getCountryId());
				driver.setPincode(JSPUtility.GetInt(request, "pinCode"));
				driver.setPhoneNumber(JSPUtility.GetString(request, "phoneNumber1"));
				driver.setMobileNumber(JSPUtility.GetString(request, "mobileNumber1"));
				driver.setPhoneNumber2(JSPUtility.GetString(request, "phoneNumber2"));
				driver.setMobileNumber2(JSPUtility.GetString(request, "mobileNumber2"));
				driver.setLicenceNumber(JSPUtility.GetString(request, "licenceNumber"));
				driver.setLicenceState(JSPUtility.GetLong(request, "licenceState"));

				if(JSPUtility.GetString(request, "dateOfIssue") != null && !"".equals(JSPUtility.GetString(request, "dateOfIssue")) )
					driver.setDateOfIssue(new Timestamp(sdf.parse(JSPUtility.GetString(request, "dateOfIssue") + " 00:00:00").getTime()));

				if(JSPUtility.GetString(request, "validUptoDate") != null && !"".equals(JSPUtility.GetString(request, "validUptoDate")) )
					driver.setValidUpto(new Timestamp(sdf.parse(JSPUtility.GetString(request, "validUptoDate") + " 00:00:00").getTime()));

				driver.setLicenceType((short)JSPUtility.GetInt(request, "licenceType"));
				driver.setIssuedBy(JSPUtility.GetString(request, "issuedBy"));

				if(JSPUtility.GetString(request, "dateOfJoining") != null && !"".equals(JSPUtility.GetString(request, "dateOfJoining")) )
					driver.setDateOfJoining(new Timestamp(sdf.parse(JSPUtility.GetString(request, "dateOfJoining") + " 00:00:00").getTime()));

				driver.setGuarantor(JSPUtility.GetString(request, "guarantor"));
				driver.setMarkForDelete(false);
				driver.setAddedDateTime(DateTimeUtility.getCurrentTimeStamp());

				driverDailyAllowance.setAmount(JSPUtility.GetLong(request, "driverAllowance", 0));
				driverDailyAllowance.setMarkForDelete(false);

				driver.setDriverCode(JSPUtility.GetString(request, "driverCode"));
				driver.setAadharNumber(JSPUtility.GetString(request, "aadharNo"));

				drivermasterid	= DriverMasterDao.getInstance().insert(driver);

				if (drivermasterid == 0)
					strResponse = CargoErrorList.MASTER_DATA_OPERATION_FAILURE_DESCRIPTION;
				else {
					strResponse = CargoErrorList.MASTER_DATA_INSERT_SUCCESS_DESCRIPTION;
					driverDailyAllowance.setDriverMasterId(drivermasterid);
					DriverMasterDao.getInstance().insertDriverDailyAllowance(driverDailyAllowance);
				}
			}
			case 2 -> {
				driver.setDriverMasterId(JSPUtility.GetLong(request, "selectedDriverId"));
				driver.setName(JSPUtility.GetString(request, "name"));
				driver.setAddress(JSPUtility.GetString(request, "address"));
				driver.setNativeAddress(JSPUtility.GetString(request, "nativeAddress"));
				driver.setDateOfBirth(DateTimeUtility.getChequeDateTime(JSPUtility.GetString(request, "dateOfBirth")));
				driver.setAccountGroupId(exec.getAccountGroupId());
				driver.setStateId(JSPUtility.GetLong(request, "state"));
				driver.setCountryId(exec.getCountryId());
				driver.setPincode(JSPUtility.GetInt(request, "pinCode"));
				driver.setPhoneNumber(JSPUtility.GetString(request, "phoneNumber1"));
				driver.setMobileNumber(JSPUtility.GetString(request, "mobileNumber1"));
				driver.setPhoneNumber2(JSPUtility.GetString(request, "phoneNumber2"));
				driver.setMobileNumber2(JSPUtility.GetString(request, "mobileNumber2"));
				driver.setLicenceNumber(JSPUtility.GetString(request, "licenceNumber"));
				driver.setLicenceState(JSPUtility.GetLong(request, "licenceState"));
				driver.setDateOfIssue(DateTimeUtility.getChequeDateTime(JSPUtility.GetString(request, "dateOfIssue")));
				driver.setValidUpto(DateTimeUtility.getChequeDateTime(JSPUtility.GetString(request, "validUptoDate")));
				driver.setLicenceType((short)JSPUtility.GetInt(request, "licenceType"));
				driver.setIssuedBy(JSPUtility.GetString(request, "issuedBy"));
				driver.setDateOfJoining(DateTimeUtility.getChequeDateTime(JSPUtility.GetString(request, "dateOfJoining")));
				driver.setGuarantor(JSPUtility.GetString(request, "guarantor"));
				driver.setMarkForDelete(false);
				driver.setUpdatedDateTime(new Timestamp(new Date().getTime()));
				driver.setDriverCode(JSPUtility.GetString(request, "driverCode"));
				driver.setAadharNumber(JSPUtility.GetString(request, "aadharNo"));

				strResponse = DriverMasterDao.getInstance().update(driver);

				driverDailyAllowance.setDriverMasterId(JSPUtility.GetLong(request, "selectedDriverId"));
				driverDailyAllowance.setAmount(JSPUtility.GetLong(request, "driverAllowance", 0));
				driverDailyAllowance.setMarkForDelete(false);

				final var flag =  DriverMasterDao.getInstance().checkIfExistsInDailyAllowance(driverDailyAllowance);

				strResponse = DriverMasterDao.getInstance().update(driver);

				if(flag)
					DriverMasterDao.getInstance().updateDriverDailyAllowance(driverDailyAllowance);
				else
					DriverMasterDao.getInstance().insertDriverDailyAllowance(driverDailyAllowance);
			}
			case 3 -> {
				final var driverMasterId = JSPUtility.GetInt(request, "selectedDriverId",0);

				if (driverMasterId > 0 )
					strResponse = DriverMasterDao.getInstance().delete(driverMasterId);
				else
					strResponse = "Driver not selected!";
			}
			default -> {
				break;
			}
			}

			request.setAttribute("countryList", countryList);
			request.setAttribute("stateList", stateList);
			request.setAttribute("allStates", allStates);
			request.setAttribute("nextPageToken", "success");
			request.setAttribute("validateOnlyDriverNameAndNumber", (boolean) driverMasterConfig.getOrDefault(DriverPropertiesConstant.VALIDATE_ONLY_DRIVER_NAME_AND_NUMBER, false));
			request.setAttribute("showAdhaarCardNumber", (boolean) driverMasterConfig.getOrDefault(DriverPropertiesConstant.SHOW_ADHAAR_CARD_NUMBER, false));
			request.setAttribute(DriverPropertiesConstant.SHOW_ADDRESS, (boolean) driverMasterConfig.getOrDefault(DriverPropertiesConstant.SHOW_ADDRESS, true));
			request.setAttribute(DriverPropertiesConstant.SHOW_NATIVE_ADDRESS, (boolean) driverMasterConfig.getOrDefault(DriverPropertiesConstant.SHOW_NATIVE_ADDRESS, true));
			request.setAttribute(DriverPropertiesConstant.SHOW_DATE_OF_JOINING, (boolean) driverMasterConfig.getOrDefault(DriverPropertiesConstant.SHOW_DATE_OF_JOINING, true));
			request.setAttribute(DriverPropertiesConstant.SHOW_DRIVER_CODE, (boolean) driverMasterConfig.getOrDefault(DriverPropertiesConstant.SHOW_DRIVER_CODE, true));
			request.setAttribute(DriverPropertiesConstant.SHOW_MOBILE_NUMBER2, (boolean) driverMasterConfig.getOrDefault(DriverPropertiesConstant.SHOW_MOBILE_NUMBER2, true));
			request.setAttribute(DriverPropertiesConstant.SHOW_DATE_OF_BIRTH, (boolean) driverMasterConfig.getOrDefault(DriverPropertiesConstant.SHOW_DATE_OF_BIRTH, true));
			request.setAttribute(DriverPropertiesConstant.SHOW_DATE_OF_ISSUE, (boolean) driverMasterConfig.getOrDefault(DriverPropertiesConstant.SHOW_DATE_OF_ISSUE, true));
			request.setAttribute(DriverPropertiesConstant.SHOW_DRIVER_ALLOWANCE, (boolean) driverMasterConfig.getOrDefault(DriverPropertiesConstant.SHOW_DRIVER_ALLOWANCE, true));
			request.setAttribute(DriverPropertiesConstant.SHOW_GUARANTOR, (boolean) driverMasterConfig.getOrDefault(DriverPropertiesConstant.SHOW_GUARANTOR, true));
			if(filter != 0) {
				cache.refreshDriverMasterForGroup(request, exec.getAccountGroupId());
				response.sendRedirect("DriverMaster.do?pageId=204&eventId=1&message="+strResponse);
				request.setAttribute("message",strResponse);
			}
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}
	}
}
