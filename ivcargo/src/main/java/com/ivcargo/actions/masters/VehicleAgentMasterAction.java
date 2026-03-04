package com.ivcargo.actions.masters;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.dao.impl.master.VehicleAgentMasterDaoImpl;
import com.iv.dto.constant.ExecutiveTypeConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.dto.master.VehicleAgentMaster;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.exception.ExceptionProcess;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.City;
import com.platform.dto.Executive;
import com.platform.resource.CargoErrorList;

public class VehicleAgentMasterAction implements Action{
	public static final String TRACE_ID = "VehicleAgentMasterAction";

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String, Object>	error 				= null;
		String 					strResponse 		= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	cache   = new CacheManip(request);
			final var	exec 	= cache.getExecutive(request);
			final var 	city 	= cache.getCityData(request);

			final var filter = JSPUtility.GetInt(request, "filter",0);
			final var status	= JSPUtility.GetShort(request, "status", (short) 0);
			final var selectedVehicleAgentId	= JSPUtility.GetLong(request, "selectedVehicleAgentId", 0);
			final var previousAgent	= VehicleAgentMasterDaoImpl.getInstance().getVehicleAgentDetailsById(selectedVehicleAgentId);

			switch (filter) {
			case 1 -> {
				final var	agent	= getData(request, exec, city);
				VehicleAgentMasterDaoImpl.getInstance().insertMasterData(agent);
				strResponse	= CargoErrorList.MASTER_DATA_INSERT_SUCCESS_DESCRIPTION;
			}
			case 2 -> {
				final var	agentUpdate	= getData(request, exec, city);
				agentUpdate.setVehicleAgentMasterId(selectedVehicleAgentId);
				VehicleAgentMasterDaoImpl.getInstance().update(agentUpdate);

				previousAgent.setUpdatedBy(exec.getExecutiveId());
				previousAgent.setUpdatedOn(DateTimeUtility.getCurrentTimeStamp());

				VehicleAgentMasterDaoImpl.getInstance().insertIntoVehicleAgentMasterEditLogs(previousAgent);
				strResponse	= CargoErrorList.MASTER_DATA_UPDATE_SUCCESS_DESCRIPTION;
			}
			case 3 -> {
				VehicleAgentMasterDaoImpl.getInstance().delete(selectedVehicleAgentId);
				previousAgent.setUpdatedBy(exec.getExecutiveId());
				previousAgent.setUpdatedOn(DateTimeUtility.getCurrentTimeStamp());

				VehicleAgentMasterDaoImpl.getInstance().insertIntoVehicleAgentMasterEditLogs(previousAgent);
				strResponse	= CargoErrorList.MASTER_DATA_DELETE_SUCCESS_DESCRIPTION;
			}
			case 4 -> {
				VehicleAgentMasterDaoImpl.getInstance().updateStatus(selectedVehicleAgentId, status);
				previousAgent.setUpdatedBy(exec.getExecutiveId());
				previousAgent.setUpdatedOn(DateTimeUtility.getCurrentTimeStamp());

				VehicleAgentMasterDaoImpl.getInstance().insertIntoVehicleAgentMasterEditLogs(previousAgent);

				if(status == 1)
					strResponse	= "Agent Deactivated Successfully.";
				else
					strResponse	= "Agent Ativated Successfully.";
			}
			default -> {
				break;
			}
			}

			request.setAttribute("cityList", cache.getCityListWithName(request, exec));

			if(exec.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_REGIONADMIN)
				request.setAttribute("regionCities", cache.getCitiesByRegionId(request, exec.getAccountGroupId(), exec.getRegionId()));
			else if(exec.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_SUBREGIONADMIN)
				request.setAttribute("subRegionCities", cache.getCitiesBySubRegionId(request, exec.getAccountGroupId(), exec.getSubRegionId()));

			request.setAttribute("nextPageToken", "success");

			if(filter != 0) {
				response.sendRedirect("VehicleAgentMaster.do?pageId=205&eventId=1&message="+strResponse);
				request.setAttribute("message",strResponse);
			}
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}

	private VehicleAgentMaster getData(final HttpServletRequest request, final Executive exec, final ValueObject city) throws Exception {
		try {
			final var	agent	= new VehicleAgentMaster();

			agent.setName(JSPUtility.GetString(request, "name"));
			agent.setAddress(JSPUtility.GetString(request, "address"));
			agent.setAccountGroupId(exec.getAccountGroupId());
			agent.setCityId(JSPUtility.GetLong(request, "city"));
			agent.setStateId(agent.getCityId() > 0 ? (City) city.get(Long.toString(agent.getCityId())) != null ? ((City) city.get(Long.toString(agent.getCityId()))).getStateId() : 0 : 0);
			agent.setCountryId(exec.getCountryId());
			agent.setPincode(JSPUtility.GetLong(request, "pinCode",0));
			agent.setContactPerson(JSPUtility.GetString(request, "contactPerson"));
			agent.setPhoneNumber(JSPUtility.GetString(request, "phoneNumber1"));
			agent.setMobileNumber(JSPUtility.GetString(request, "mobileNumber1"));
			agent.setPhoneNumber2(JSPUtility.GetString(request, "phoneNumber2"));
			agent.setMobileNumber2(JSPUtility.GetString(request, "mobileNumber2"));
			agent.setFaxNumber(JSPUtility.GetString(request, "faxNumber", ""));
			agent.setEmailId(JSPUtility.GetString(request, "emailAddress",""));
			agent.setVehicleOwnerId(Short.parseShort(request.getParameter("vehicleOwner")));
			agent.setPanNo(JSPUtility.GetString(request, "panNo"));
			agent.setMarkForDelete(false);
			agent.setGstn(JSPUtility.GetString(request, "gstn", ""));
			agent.setStatus(JSPUtility.GetShort(request, "status", (short) 0));
			agent.setBankNameId(JSPUtility.GetLong(request, "bankName", 0));
			agent.setAccountNo(JSPUtility.GetString(request, "accountNo", null));
			agent.setIfscCode(JSPUtility.GetString(request, "ifscCode", null));
			agent.setBankBranchAddress(JSPUtility.GetString(request, "branchAddress", null));
			agent.setDescription(JSPUtility.GetString(request, "description", null));
			agent.setCreatedBy(exec.getExecutiveId());
			agent.setCreatedOn(DateTimeUtility.getCurrentTimeStamp());
			agent.setModuleId(ModuleIdentifierConstant.VEHICLE_AGENT_MASTER);
			agent.setTdsDeductible(JSPUtility.GetBoolean(request, "tdsDeductible", false));
			agent.setIsSpecified(JSPUtility.GetBoolean(request, "isSpecified", false));
			agent.setOwnerTypeId(JSPUtility.GetShort(request, "ownerType", (short) 0));
			agent.setBeneficiaryName(JSPUtility.GetString(request, "beneficiaryName", null));

			return agent;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}
}
