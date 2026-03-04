package com.ivcargo.actions;

import java.util.ArrayList;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.ReceiveDataClearBLL;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.utils.constant.Constant;
import com.iv.utils.constant.properties.ReceiveConfigurationPropertiesConstant;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionInstanceUtil;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actions.transport.TransportReceivedWayBillAction;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.ExecutiveDao;
import com.platform.dto.AliasNameConstants;
import com.platform.dto.ConfigParam;
import com.platform.dto.Executive;
import com.platform.dto.TransportCommonMaster;
import com.platform.dto.configuration.mindateselection.ModuleWiseMinDateSelectionConfigurationDTO;
import com.platform.dto.configuration.modules.DocumentCodeConfigurationDTO;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

public class ReceiveDataClearAction implements Action{

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	 			error 						= null;
		String								sourceBranchIds				= null;
		String								locationIdsStr				= null;
		ArrayList<Long> 					locationList				= null;
		var 								regionId    				= 0L;
		var 								subRegionId    				= 0L;
		var 								branchId					= 0L;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeReceiveDataClearAction().execute(request, response);

			final var	cacheManip			= new CacheManip(request);
			final var	executive			= (Executive) request.getSession().getAttribute("executive");
			final var	locationId		    = JSPUtility.GetLong(request, "locationId" ,0);
			final var	sourceSubRegionId	= JSPUtility.GetLong(request, "selectSubRegion",0);
			final var	sourceCity			= JSPUtility.GetLong(request, "GroupSelectCity",0);
			final var	destinatinCityId    = JSPUtility.GetLong(request, "DCity",0) ;
			final var	noOfDays 			= cacheManip.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_MAX_DAYS_OF_OPERATION_BEFORE_CASHSTATEMENT_ENTRY_ID);
			final var	calenderValueObject	= Utility.getCalanderInstance();
			final var	transportList		= cacheManip.getTransportList(request);
			final var	selectedExecutive	= JSPUtility.GetLong(request, "executiveId", 0);
			final var	generalConfig		= cacheManip.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.RECEIVE_STOCK_CLEAR);
			final var allowCentralizedReceive 	= (boolean) generalConfig.getOrDefault(ReceiveConfigurationPropertiesConstant.ALLOW_CENTRALIZED_RECEIVE, false);
			
			final var	minDateTimeStamp		= cacheManip.getModuleWiseMinDateToGetData(request, executive.getAccountGroupId(),
					ModuleWiseMinDateSelectionConfigurationDTO.RECEIVE_MIN_DATE_ALLOW,
					ModuleWiseMinDateSelectionConfigurationDTO.RECEIVE_MIN_DATE);

			final var	isSearchByDate = request.getParameter("searchByDate") != null;

			if(transportList.contains(executive.getAccountGroupId())){
				final var	actionUtil2 		= new ActionInstanceUtil();
				final var	valObjSelection 	= actionUtil2.reportSelection(request, executive);
				regionId 			= (Long) valObjSelection.get("regionId");
				subRegionId 		= (Long) valObjSelection.get("subRegionId");
				branchId 			= (Long) valObjSelection.get("branchId");
			} else
				branchId			= JSPUtility.GetLong(request, "SelectDestBranch", executive.getBranchId());

			if (sourceSubRegionId > 0)
				sourceBranchIds = cacheManip.getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_SUBREGION, sourceSubRegionId);

			if (sourceCity > 0)
				sourceBranchIds = cacheManip.getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_CITY, sourceCity);
			else
				sourceBranchIds = cacheManip.getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_GROUP, 0);

			final var	locationMappingList = cacheManip.getAssignedLocationsByLocationIdId(request, branchId, executive.getAccountGroupId());
			request.setAttribute("locationMappingList", locationMappingList);

			if(transportList.contains(executive.getAccountGroupId())) {
				if(subRegionId == 0 && branchId == 0)
					locationIdsStr = cacheManip.getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_REGION, regionId);
				else if(subRegionId > 0 && branchId == 0)
					locationIdsStr = cacheManip.getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_SUBREGION, subRegionId);
				else if(subRegionId > 0 && branchId > 0)
					if(locationId > 0)
						locationIdsStr = Long.toString(locationId);
					else {
						locationList   = cacheManip.getAssignedLocationsIdListByLocationIdId(request, branchId, executive.getAccountGroupId());

						if(locationList != null && !locationList.isEmpty())
							locationIdsStr = Utility.GetLongArrayListToString(locationList);
					}
			} else if(branchId > 0)
				locationIdsStr = Long.toString(branchId);
			else if(destinatinCityId > 0)
				locationIdsStr = cacheManip.getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_CITY, destinatinCityId);

			final var	allBranches = cacheManip.getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_GROUP, 0);
			final var	assignedLocationListHM = cacheManip.getAssignedLocationsByLocationIds(request, allBranches, executive.getAccountGroupId());

			final var	valueInObject	= new ValueObject();
			valueInObject.put(AliasNameConstants.SOURCE_BRANCH_IDS, sourceBranchIds);
			valueInObject.put(Constant.LOCATION_IDS, locationIdsStr);
			calenderValueObject.put("dateStr", request.getParameter("receiveDate"));
			valueInObject.put(Constant.RECEIVE_DATE, request.getParameter("receiveDate") != null ? Utility.getDateTimeFromString(calenderValueObject) : null);
			valueInObject.put(Constant.TUR_NUMBER, request.getParameter("manualTURNumber"));

			if(selectedExecutive > 0)
				valueInObject.put(Executive.EXECUTIVE, ExecutiveDao.getInstance().getExecutiveMasterById(selectedExecutive));
			else
				valueInObject.put(Executive.EXECUTIVE, executive);

			valueInObject.put(Constant.NO_OF_DAYS, noOfDays);
			valueInObject.put(Constant.BRANCH_ID, branchId);
			valueInObject.put("isSearchByDate", isSearchByDate);
			valueInObject.put(Constant.FROM_DATE, request.getParameter("fromDate") != null ? ActionStaticUtil.getFromToDate(request, ActionStaticUtil.FROMDATE, ActionStaticUtil.FROMTIME) : null);
			valueInObject.put(Constant.TO_DATE, request.getParameter("toDate") != null ?ActionStaticUtil.getFromToDate(request, ActionStaticUtil.TODATE, ActionStaticUtil.TOTIME) : null);
			valueInObject.put("textAreaNumber", JSPUtility.GetString(request, "textAreaNumber",""));
			valueInObject.put("receiveSelectionId", JSPUtility.GetShort(request, "receiveSelectionId",(short)0));
			valueInObject.put("assignedLocationListHM", assignedLocationListHM);
			valueInObject.put(Constant.MIN_DATE_TIME_STAMP, minDateTimeStamp);
			valueInObject.put(DocumentCodeConfigurationDTO.DOCUMENT_CODE_CONFIGURATION, cacheManip.getDocumentCodeConfiguration(request, executive.getAccountGroupId()));
			valueInObject.put("srcBranch", cacheManip.getGenericBranchDetailCache(request, executive.getBranchId()));
			valueInObject.put(ReceiveConfigurationPropertiesConstant.RECEIVE_CONFIGUARTION, cacheManip.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.RECEIVE));
			valueInObject.put(ReceiveConfigurationPropertiesConstant.ALLOW_CENTRALIZED_RECEIVE, allowCentralizedReceive);

			new TransportReceivedWayBillAction().setExtraData(request, cacheManip, valueInObject, executive);

			final var	receiveDataClearBLL = new ReceiveDataClearBLL();
			final var	outValueObject 		= receiveDataClearBLL.clearReceiveData(valueInObject);

			if(outValueObject == null) {
				error.put(CargoErrorList.ERROR_CODE, CargoErrorList.SYSTEM_ERROR);
				error.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.SYSTEM_ERROR_DESCRIPTION);
				ActionStaticUtil.setRequestAttribute(request, CargoErrorList.CARGO_ERROR, error);
				ActionStaticUtil.setNextPageToken(request, ActionStaticUtil.FAILURE);
			} else if(Constant.SUCCESS.equals(outValueObject.getString(Constant.STATUS, "")))
				response.sendRedirect("InitializeReceiveDataClearAction.do?pageId=299&eventId=1&message=Data Received Successfully.");
			else if(outValueObject.getInt(CargoErrorList.ERROR_CODE, 0) == CargoErrorList.NO_RECORDS) {
				response.sendRedirect("InitializeReceiveDataClearAction.do?pageId=299&eventId=1&message="+CargoErrorList.NO_RECORDS_DESCRIPTION);
				error.put(CargoErrorList.ERROR_CODE, CargoErrorList.REPORT_NOTFOUND);
				error.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.REPORT_ERROR_DESCRIPTION);
				ActionStaticUtil.setRequestAttribute(request, CargoErrorList.CARGO_ERROR, error);
				ActionStaticUtil.setNextPageToken(request, ActionStaticUtil.SUCCESS);
			} else if(outValueObject.getInt(CargoErrorList.ERROR_CODE, 0) == CargoErrorList.GODOWN_FOR_BRANCH_MISSING)
				response.sendRedirect("SearchWayBill.do?pageId=0&eventId=1&filter=11");
			else if(outValueObject.getInt(CargoErrorList.ERROR_CODE, 0) == CargoErrorList.TUR_SEQUENCE_COUNTER_MISSING) {
				error.put(CargoErrorList.ERROR_CODE, CargoErrorList.TUR_SEQUENCE_COUNTER_MISSING);
				error.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.TUR_SEQUENCE_COUNTER_MISSING_DESCRIPTION);
				ActionStaticUtil.setRequestAttribute(request, CargoErrorList.CARGO_ERROR, error);
				ActionStaticUtil.setNextPageToken(request, ActionStaticUtil.FAILURE);
			} else if(outValueObject.getInt(CargoErrorList.ERROR_CODE, 0) == CargoErrorList.NO_EXEUCUTIVE_FOUND_ERROR) {
				error.put(CargoErrorList.ERROR_CODE, CargoErrorList.NO_EXEUCUTIVE_FOUND_ERROR);
				error.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.NO_EXEUCUTIVE_FOUND_ERROR_DESCRIPTION);
				ActionStaticUtil.setRequestAttribute(request, CargoErrorList.CARGO_ERROR, error);
				ActionStaticUtil.setNextPageToken(request, ActionStaticUtil.FAILURE);
			}
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}

}