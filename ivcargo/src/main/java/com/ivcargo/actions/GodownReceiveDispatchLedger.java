package com.ivcargo.actions;

import java.sql.Timestamp;
import java.util.ArrayList;
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
import com.platform.dao.GodownDao;
import com.platform.dto.AliasNameConstants;
import com.platform.dto.Branch;
import com.platform.dto.ConfigParam;
import com.platform.dto.Executive;
import com.platform.dto.configuration.mindateselection.ModuleWiseMinDateSelectionConfigurationDTO;
import com.platform.dto.constant.ExecutiveTypeConstant;
import com.platform.dto.model.ReceivablesModel;
import com.platform.resource.CargoErrorList;

public class GodownReceiveDispatchLedger implements Action {

	public static final String TRACE_ID  = GodownReceiveDispatchLedger.class.getName();

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	 	error 					= null;
		Executive					executive 				= null;
		CacheManip					cManip 					= null;
		ValueObject					valueInObject			= null;
		ValueObject					valueOutObject			= null;
		Long[]						branchIdArr				= null;
		ArrayList<Branch>			branchArr				= null;
		Branch						branch					= null;
		ReceivablesModel[]			reportModel				= null;
		ValueObject					allBranches				= null;
		long 						sourceCity 				= 0;
		long 						dispatchLedgerId		= 0;
		long 						vehicleNumberId 		= 0;
		long 						selectedDestinationCity	= 0;
		Timestamp					minDateTimeStamp		= null;
		Map<Object, Object>			receiveConfig			= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeGodownReceivableAction().execute(request, response);

			executive			= (Executive)request.getSession().getAttribute(AliasNameConstants.EXECUTIVE);
			cManip				= new CacheManip(request);
			valueInObject		= new ValueObject();
			valueOutObject		= new ValueObject();
			sourceCity			= JSPUtility.GetLong(request, "selectSourceCity",0);
			dispatchLedgerId	= JSPUtility.GetLong(request, "dispatchLedgerId" ,0);//Not set at JSP for cargo
			vehicleNumberId		= JSPUtility.GetLong(request, "selectedVehicleNoId" ,0);//Not set at JSP for cargo

			minDateTimeStamp	= cManip.getModuleWiseMinDateToGetData(request, executive.getAccountGroupId(),
					ModuleWiseMinDateSelectionConfigurationDTO.GODOWN_RECEIVE_MIN_DATE_ALLOW,
					ModuleWiseMinDateSelectionConfigurationDTO.GODOWN_RECEIVE_MIN_DATE);

			receiveConfig		= cManip.getReceiveConfiguration(request, executive.getAccountGroupId());

			selectedDestinationCity	= 0;

			if (request.getParameter("selectDestinationCity") != null)
				selectedDestinationCity  = Long.parseLong(JSPUtility.GetString(request, "selectDestinationCity")) ;

			//Get all Branches
			if(selectedDestinationCity > 0)
				branchIdArr = GodownDao.getInstance().getGodownBranchesByCityId(executive.getAccountGroupId(), selectedDestinationCity);

			branchArr	= new ArrayList<>();

			if(branchIdArr != null)
				for (final Long element : branchIdArr) {
					branch = cManip.getGenericBranchDetailCache(request, element);
					branchArr.add(branch);
				}

			request.setAttribute("branches", branchArr.isEmpty()? null : branchArr.toArray(new Branch[branchArr.size()]));

			valueInObject.put("configValue_value", cManip.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_RECEIVABLES_ACCESSIBILITY));
			valueInObject.put("sourceCity_value", sourceCity);
			valueInObject.put(AliasNameConstants.EXECUTIVE, executive);
			valueInObject.put("dispatchLedgerId", dispatchLedgerId);
			valueInObject.put("vehicleNumberId", vehicleNumberId);
			valueInObject.put("isForGodown", true);

			if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN) {
				final long desBranch=Long.parseLong(request.getParameter("destinationBranchId"));
				valueInObject.put("destBranches", desBranch + "");
			} else
				valueInObject.put("destBranches", executive.getBranchId() + "");

			allBranches		= cManip.getGenericBranchesDetail(request);
			valueInObject.put(AliasNameConstants.ALL_BRANCHES, allBranches);
			valueInObject.put(AliasNameConstants.MIN_DATE_TIMESTAMP, minDateTimeStamp);
			valueInObject.put(AliasNameConstants.ALL_SUBREGIONS, cManip.getAllSubRegions(request));
			valueInObject.put("isScrapReceive", true);
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
			executive 				= null;
			cManip 					= null;
			valueInObject			= null;
			valueOutObject			= null;
			branchIdArr				= null;
			branchArr				= null;
			branch					= null;
			reportModel				= null;
			minDateTimeStamp		= null;
		}
	}
}