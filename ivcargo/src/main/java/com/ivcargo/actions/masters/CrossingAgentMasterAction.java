package com.ivcargo.actions.masters;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.convertor.DataObjectConvertor;
import com.iv.dao.impl.crossingagent.CrossingAgentMasterDaoImpl;
import com.iv.dao.impl.logs.EditLogsDaoImpl;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.dto.crossingagent.CrossingAgentMaster;
import com.iv.dto.edithistory.master.CrossingAgentMasterEditLogs;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.connection.ResourceManager;
import com.iv.utils.exception.ExceptionProcess;
import com.iv.utils.utility.CollectionUtility;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.Executive;

public class CrossingAgentMasterAction implements Action{
	public static final String TRACE_ID = "CrossingAgentMasterAction";

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	 				error 					= null;
		String 									strResponse 			= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var cache	= new CacheManip(request);

			final var exec = cache.getExecutive(request);

			final var configuration	= cache.getConfiguration(request, exec.getAccountGroupId(), ModuleIdentifierConstant.CROSSING_AGENT_MASTER);

			final var filter = JSPUtility.GetInt(request, "filter",0);

			switch (filter) {
			case 1 -> {
				strResponse	= insertCrossingMasterData(request, exec);
			}
			case 2 -> {
				strResponse	= updateCrossingMasterData(request, exec);
			}
			case 3 -> {
				strResponse = deleteCrossingMasterData(request, exec);
			}
			default -> {
				strResponse	= "";
			}
			}

			configuration.entrySet().forEach(e -> {
				request.setAttribute(e.getKey().toString(), e.getValue());
			});

			request.setAttribute("nextPageToken", "success");

			if(filter != 0) {
				response.sendRedirect("CrossingAgentMaster.do?pageId=224&eventId=1&message=" + strResponse);
				request.setAttribute("message", strResponse);
			}
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}

	private String insertCrossingMasterData(final HttpServletRequest request, final Executive exec) throws Exception {
		CrossingAgentMasterEditLogs crossingAgentMasterEditLogs = null;
		Connection					conn						= null;

		try {			
			final var	agent	= dtoForCrossingAgentMaster(request, exec);
			agent.setExecutiveId(exec.getExecutiveId());
			agent.setCreatedOn(DateTimeUtility.getCurrentTimeStamp());

			final var previousAgent	= CrossingAgentMasterDaoImpl.getInstance().isAgentFound(agent);

			if(previousAgent != null)
				crossingAgentMasterEditLogs	= dtoForCrossingAgentMasterEditLogs(previousAgent, exec);

			conn	= ResourceManager.getJdbcConnection();
			conn.setAutoCommit(false);

			if(previousAgent != null)
				CrossingAgentMasterDaoImpl.getInstance().update(agent, conn);
			else
				CrossingAgentMasterDaoImpl.getInstance().insertForMaster(agent, conn);

			if(crossingAgentMasterEditLogs != null)
				EditLogsDaoImpl.getInstance().insertIntoCrossingAgentMasterEditLogs(crossingAgentMasterEditLogs, conn);

			conn.commit();

			return "Crossing Agent Created Successfully !";
		} catch (final Exception e) {
			ResourceManager.rollbackJdbcConnection(conn);
			return "Crossing Agent Creation failed !";
		} finally {
			ResourceManager.freeJdbcConnection(conn);
		}
	}

	private String updateCrossingMasterData(final HttpServletRequest request, final Executive exec) throws SQLException {
		Connection					conn						= null;

		try {
			final var	agent	= dtoForCrossingAgentMaster(request, exec);

			final var previousAgent = CrossingAgentMasterDaoImpl.getInstance().getCrossingAgentDetailsById(agent.getCrossingAgentMasterId());

			final var	crossingAgentMasterEditLogs	= dtoForCrossingAgentMasterEditLogs(previousAgent, exec);

			conn	= ResourceManager.getJdbcConnection();
			conn.setAutoCommit(false);

			CrossingAgentMasterDaoImpl.getInstance().update(agent, conn);
			EditLogsDaoImpl.getInstance().insertIntoCrossingAgentMasterEditLogs(crossingAgentMasterEditLogs, conn);

			conn.commit();

			return "Crossing Agent Updated Successfully !";
		} catch (final Exception e) {
			ResourceManager.rollbackJdbcConnection(conn);
			return "Crossing Agent Updation failed !";
		} finally {
			ResourceManager.freeJdbcConnection(conn);
		}
	}

	private String deleteCrossingMasterData(final HttpServletRequest request, final Executive exec) throws SQLException {
		Connection					conn						= null;

		try {
			final var previousAgent = CrossingAgentMasterDaoImpl.getInstance().getCrossingAgentDetailsById(JSPUtility.GetLong(request, "selectedCrossingAgentId",0));
			final var	crossingAgentMasterEditLogs	= dtoForCrossingAgentMasterEditLogs(previousAgent, exec);

			conn	= ResourceManager.getJdbcConnection();
			conn.setAutoCommit(false);

			CrossingAgentMasterDaoImpl.getInstance().delete(previousAgent.getCrossingAgentMasterId(), conn);
			EditLogsDaoImpl.getInstance().insertIntoCrossingAgentMasterEditLogs(crossingAgentMasterEditLogs, conn);

			conn.commit();

			return "Crossing Agent Deleted Successfully !";
		} catch (final Exception e) {
			ResourceManager.rollbackJdbcConnection(conn);
			return "Crossing Agent Deletion failed !";
		} finally {
			ResourceManager.freeJdbcConnection(conn);
		}
	}

	private CrossingAgentMaster dtoForCrossingAgentMaster(final HttpServletRequest request, final Executive exec) throws Exception {
		final var	agent	= new CrossingAgentMaster();

		try {
			agent.setCrossingAgentMasterId(JSPUtility.GetLong(request, "selectedCrossingAgentId", 0));
			agent.setName(JSPUtility.GetString(request, "name"));
			agent.setAddress(JSPUtility.GetString(request, "address"));
			agent.setAccountGroupId(exec.getAccountGroupId());
			agent.setPincode(JSPUtility.GetLong(request, "pinCode", 0));
			agent.setContactPerson(JSPUtility.GetString(request, "contactPerson", null));
			agent.setPhoneNumber(JSPUtility.GetString(request, "phoneNumber1", null));
			agent.setMobileNumber(JSPUtility.GetString(request, "mobileNumber1", null));
			agent.setPhoneNumber2(JSPUtility.GetString(request, "phoneNumber2", null));
			agent.setMobileNumber2(JSPUtility.GetString(request, "mobileNumber2", null));
			agent.setFaxNumber(JSPUtility.GetString(request, "faxNumber", null));
			agent.setEmailId(JSPUtility.GetString(request, "emailAddress", null));
			agent.setGstNumber(JSPUtility.GetString(request, "gstNumber", null));
			agent.setMarkForDelete(false);
			agent.setCrossingAgentType(JSPUtility.GetShort(request, "crossingAgentType", CrossingAgentMaster.CROSSINGAGNET_TYPE_DELIVERY));
			agent.setAgentCode(JSPUtility.GetString(request, "agentCode", null));
			agent.setLrTypesId(CollectionUtility.getStringFromStringArray(request.getParameterValues("checkLRType")));
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}

		return agent;
	}

	private CrossingAgentMasterEditLogs dtoForCrossingAgentMasterEditLogs(final CrossingAgentMaster crossingAgentMaster, final Executive executive) {
		final var	crossingAgentMasterEditLogs = DataObjectConvertor.convertObject(crossingAgentMaster, CrossingAgentMasterEditLogs.class);

		crossingAgentMasterEditLogs.setUpdatedOn(DateTimeUtility.getCurrentTimeStamp());
		crossingAgentMasterEditLogs.setUpdatedBy(executive.getExecutiveId());
		crossingAgentMasterEditLogs.setAccountGroupId(executive.getAccountGroupId());

		return crossingAgentMasterEditLogs;
	}
}