package com.ivcargo.actions;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.ReceivablesBLL;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.constant.properties.LrViewConfigurationPropertiesConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.utils.constant.properties.ReceiveConfigurationPropertiesConstant;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.AliasNameConstants;
import com.platform.dto.Branch;
import com.platform.dto.ConfigParam;
import com.platform.dto.Executive;
import com.platform.dto.TransportCommonMaster;
import com.platform.dto.configuration.mindateselection.ModuleWiseMinDateSelectionConfigurationDTO;
import com.platform.dto.model.ReceivablesModel;
import com.platform.resource.CargoErrorList;

public class ReceiveDispatchLedger implements Action {

	public static final String TRACE_ID  = ReceiveDispatchLedger.class.getName();

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {

		HashMap<String,Object>			error 					= null;
		Executive 						executive 				= null;
		CacheManip 						cManip 					= null;
		ValueObject 					valueInObject			= null;
		ValueObject 					valueOutObject			= null;
		SimpleDateFormat 				sdf         			= null;
		String       					tillDateStr    			= null;
		Timestamp       				tillDate    			= null;
		Branch[]						branches				= null;
		StringBuilder					destBranches			= null;
		StringBuilder					srcBranches				= null;
		ReceivablesModel[]				reportModel				= null;
		ValueObject						allBranches				= null;
		Timestamp						minDateTimeStamp		= null;
		Map<Object, Object>				receiveConfig			= null;

		try {

			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeReceivableAction().execute(request, response);
			cManip 				= new CacheManip(request);
			executive			= cManip.getExecutive(request);
			valueInObject		= new ValueObject();
			valueOutObject		= new ValueObject();

			sdf         		= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			tillDateStr    		= JSPUtility.GetString(request, "tillDate",null);
			tillDate    		= tillDateStr != null ? new Timestamp(sdf.parse(tillDateStr + " 23:59:59").getTime()):null;
			destBranches		= new StringBuilder();
			srcBranches			= new StringBuilder();
			final long sourceCity 		= JSPUtility.GetLong(request, "selectSourceCity", 0);
			final long dispatchLedgerId	= JSPUtility.GetLong(request, "dispatchLedgerId" ,0);//Not set at JSP for cargo
			final long vehicleNumberId 	= JSPUtility.GetLong(request, "selectedVehicleNoId" ,0);//Not set at JSP for cargo

			receiveConfig		= cManip.getReceiveConfiguration(request, executive.getAccountGroupId());

			minDateTimeStamp		= cManip.getModuleWiseMinDateToGetData(request, executive.getAccountGroupId(),
					ModuleWiseMinDateSelectionConfigurationDTO.RECEIVE_MIN_DATE_ALLOW,
					ModuleWiseMinDateSelectionConfigurationDTO.RECEIVE_MIN_DATE);

			// Get the Selected  Combo values
			long selectedDestinationCity	= 0;
			if (request.getParameter("selectDestinationCity") != null)
				selectedDestinationCity  =  Long.parseLong(JSPUtility.GetString(request, "selectDestinationCity")) ;
			//Get all Branches
			branches = cManip.getBothTypeOfBranchesDetails(request, ""+executive.getAccountGroupId(), ""+selectedDestinationCity);
			request.setAttribute("branches", branches);

			allBranches		= cManip.getGenericBranchesDetail(request);
			valueInObject.put(AliasNameConstants.ALL_BRANCHES, allBranches);

			final short configValue = cManip.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_RECEIVABLES_ACCESSIBILITY);
			valueInObject.put("configValue_value", configValue);

			valueInObject.put(AliasNameConstants.EXECUTIVE, executive);
			valueInObject.put("dispatchLedgerId", dispatchLedgerId);
			valueInObject.put("vehicleNumberId", vehicleNumberId);
			valueInObject.put("tillDate", tillDate);

			if (sourceCity != 0) {
				srcBranches.append(cManip.getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_CITY, sourceCity));
				valueInObject.put("srcBranches", srcBranches.toString());
			}

			if(executive.getExecutiveType()==Executive.EXECUTIVE_TYPE_GROUPADMIN) {
				final long desBranch = Long.parseLong(request.getParameter("destinationBranchId"));
				if(desBranch != 0)
					destBranches.append(""+desBranch);
				else
					destBranches.append(cManip.getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_CITY, selectedDestinationCity));
			} else if(configValue == ConfigParam.CONFIG_KEY_RECEIVABLES_ACCESSIBILITY_BRANCH)
				destBranches.append(""+executive.getBranchId());
			else
				destBranches.append(cManip.getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_CITY, executive.getCityId()));

			valueInObject.put("destBranches", destBranches.toString());
			valueInObject.put(AliasNameConstants.MIN_DATE_TIMESTAMP, minDateTimeStamp);
			valueInObject.put(AliasNameConstants.ALL_SUBREGIONS, cManip.getAllSubRegions(request));
			valueInObject.put(LrViewConfigurationPropertiesConstant.LR_VIEW_CONFIGURATION_PROPERTY, cManip.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.LR_SEARCH));

			valueOutObject = ReceivablesBLL.getInstance().getReceivables(valueInObject);

			if(valueOutObject != null) {
				reportModel		= (ReceivablesModel[]) valueOutObject.get("receivablesList");

				if(reportModel == null) {
					error.put(CargoErrorList.ERROR_CODE, CargoErrorList.NO_RECORDS);
					error.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.NO_RECORDS_DESCRIPTION);
					request.setAttribute(CargoErrorList.CARGO_ERROR, error);
				}

				request.setAttribute("configValue", valueOutObject.get("configValue"));
				request.setAttribute("report", valueOutObject.get("receivablesList"));
				request.setAttribute(ReceiveConfigurationPropertiesConstant.SHOW_LS_NUMBER_COL, receiveConfig.getOrDefault(ReceiveConfigurationPropertiesConstant.SHOW_LS_NUMBER_COL, false));
			} else {
				error.put(CargoErrorList.ERROR_CODE, CargoErrorList.NO_RECORDS);
				error.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.NO_RECORDS_DESCRIPTION);
				request.setAttribute(CargoErrorList.CARGO_ERROR, error);
			}

			request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		} finally {
			executive 			= null;
			cManip 				= null;
			valueInObject		= null;
			valueOutObject		= null;
			sdf         		= null;
			tillDateStr    		= null;
			tillDate    		= null;
			branches			= null;
			destBranches		= null;
			reportModel			= null;
		}

	}
}