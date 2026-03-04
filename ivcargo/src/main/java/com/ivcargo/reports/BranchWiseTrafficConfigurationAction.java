package com.ivcargo.reports;

import java.util.ArrayList;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringUtils;

import com.businesslogic.EditLogsBll;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.BranchWiseTrafficConfigurationDao;
import com.platform.dao.TrafficDao;
import com.platform.dto.BranchWiseTrafficConfiguration;
import com.platform.dto.EditLogs;
import com.platform.dto.Executive;
import com.platform.dto.TrafficMaster;
import com.platform.resource.CargoErrorList;

public class BranchWiseTrafficConfigurationAction implements Action {
	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	 			error 					= null;
		String[]							values					= null;
		String[]							prevValues				= null;
		String 								strResponse 			= null;
		TrafficMaster						prevTrafficMaster		= null;
		EditLogs							editLog					= null;
		BranchWiseTrafficConfiguration		brWiseTrafficConfig		= null;
		var						   		descriptionStr			= "";
		var						   		prevDescriptionStr		= "";
		var 								trafficId 		= 0L;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	createDate 	= DateTimeUtility.getCurrentTimeStamp();
			final var	traffic 	= new TrafficMaster();
			final var	cache 		= new CacheManip(request);
			final var	executive 	= cache.getExecutive(request);
			final var	filter 		= JSPUtility.GetInt(request, "filter",0);

			if(filter > 0 && filter != 3){
				if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_GROUPADMIN){
					values	= request.getParameterValues("branchId");
					traffic.setRegionId(JSPUtility.GetLong(request,"region"));
				} else {
					values	= request.getParameterValues("checkbox");
					traffic.setRegionId(executive.getRegionId());
				}

				traffic.setAccountGroupId(executive.getAccountGroupId());
				traffic.setBranchId(executive.getBranchId());
				traffic.setExecutiveId(executive.getExecutiveId());
				traffic.setDescription(request.getParameter("description"));
				traffic.setCreationDateTimeStamp(createDate);
			}

			switch (filter) {
			case 1 -> {
				if(values.length > 0){
					final var	brConfigInsertArr = new BranchWiseTrafficConfiguration[values.length];

					for(var i = 0 ; i < values.length; i++){
						brConfigInsertArr[i] = new BranchWiseTrafficConfiguration();
						brConfigInsertArr[i].setAccountGroupId(executive.getAccountGroupId());
						brConfigInsertArr[i].setBranchId(Long.parseLong(values[i]));
						brConfigInsertArr[i].setMarkForDelete(false);
					}

					strResponse = BranchWiseTrafficConfigurationDao.getInstance().insert(traffic, brConfigInsertArr);
					new InitializeTrafficConfigurationiAction().execute(request, response);

					request.setAttribute("nextPageToken", "success");
				} else {
					error.put("errorCode", CargoErrorList.SYSTEM_ERROR);
					error.put("errorDescription", CargoErrorList.SYSTEM_ERROR_DESCRIPTION);
					request.setAttribute("cargoError", error);
					request.setAttribute("nextPageToken", "failure");
				}
			}
			case 2 -> {
				if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_GROUPADMIN)
					prevValues	= request.getParameterValues("prevBranchId");
				else
					prevValues	= request.getParameterValues("prevId");

				trafficId   = JSPUtility.GetLong(request, "trafficConfig",0);
				traffic.setTrafficId(trafficId);
				prevTrafficMaster  = TrafficDao.getInstance().getTrafficMasterById(trafficId);
				final var	brConfigInsert	= new ArrayList<BranchWiseTrafficConfiguration>();
				final var	brConfigEdit 	= new ArrayList<BranchWiseTrafficConfiguration>();
				final var	brConfigUpdate 	= new ArrayList<BranchWiseTrafficConfiguration>();
				final var	brConfigAdd	 	= new ArrayList<BranchWiseTrafficConfiguration>();
				prevDescriptionStr = prevTrafficMaster.getDescription()+"^ ";

				for (final String prevValue : prevValues) {
					prevDescriptionStr  += ""+cache.getBranchById(request, executive.getAccountGroupId(), Long.parseLong(prevValue)).getName()+"^ ";
					brWiseTrafficConfig = new BranchWiseTrafficConfiguration();
					brWiseTrafficConfig.setBranchId(Long.parseLong(prevValue));
					brWiseTrafficConfig.setAccountGroupId(executive.getAccountGroupId());
					brWiseTrafficConfig.setTrafficMasterId(trafficId);
					brWiseTrafficConfig.setMarkForDelete(true);

					brConfigEdit.add(brWiseTrafficConfig);
				}

				descriptionStr +="Update Traffic Config ^";

				for (final String value : values) {
					descriptionStr  += ""+cache.getBranchById(request, executive.getAccountGroupId(), Long.parseLong(value)).getName()+"^ ";
					brWiseTrafficConfig = new BranchWiseTrafficConfiguration();
					brWiseTrafficConfig.setBranchId(Long.parseLong(value));
					brWiseTrafficConfig.setAccountGroupId(executive.getAccountGroupId());
					brWiseTrafficConfig.setTrafficMasterId(trafficId);
					brWiseTrafficConfig.setMarkForDelete(false);

					brConfigInsert.add(brWiseTrafficConfig);
				}

				for (final BranchWiseTrafficConfiguration element : brConfigEdit)
					for (final BranchWiseTrafficConfiguration element2 : brConfigInsert)
						if(element.getBranchId() ==  element2.getBranchId()){
							element.setMarkForDelete(false);
							element2.setMarkForDelete(true);
						}

				for (final BranchWiseTrafficConfiguration aBrConfigEdit : brConfigEdit)
					if(aBrConfigEdit.isMarkForDelete())
						brConfigUpdate.add(aBrConfigEdit);

				for (final BranchWiseTrafficConfiguration aBrConfigInsert : brConfigInsert)
					if(! aBrConfigInsert.isMarkForDelete())
						brConfigAdd.add( aBrConfigInsert);

				final var	brConfigEditArr = new BranchWiseTrafficConfiguration[brConfigUpdate.size()];
				brConfigUpdate.toArray(brConfigEditArr);
				final var	brConfigInsertArr = new BranchWiseTrafficConfiguration[brConfigAdd.size()];
				brConfigAdd.toArray(brConfigInsertArr);
				strResponse = TrafficDao.getInstance().updateTraffic(traffic, brConfigInsertArr, brConfigEditArr);
			}
			case 3 -> {
				trafficId    		= JSPUtility.GetLong(request, "trafficConfig",0);
				prevTrafficMaster 	= TrafficDao.getInstance().getTrafficMasterById(trafficId);
				final var	brConfigEditArr		= BranchWiseTrafficConfigurationDao.getInstance().findByTrafficId(trafficId);

				if(trafficId > 0)
					strResponse = TrafficDao.getInstance().delete(trafficId);
				else {
					error.put("errorCode", CargoErrorList.SYSTEM_ERROR);
					error.put("errorDescription", CargoErrorList.SYSTEM_ERROR_DESCRIPTION);
					request.setAttribute("cargoError", error);
					request.setAttribute("nextPageToken", "failure");
				}

				descriptionStr 		+= "Delete Traffic Config Name ^" + prevTrafficMaster.getDescription()+"  ";

				for (final BranchWiseTrafficConfiguration element : brConfigEditArr)
					prevDescriptionStr  += ""+cache.getBranchById(request, executive.getAccountGroupId(), element.getBranchId()).getName()+"^ ";
			}
			default -> {
				break;
			}
			}

			if(filter == 2 || filter == 3){
				editLog = new EditLogs();
				editLog.setEditWaybillId(trafficId);
				editLog.setExecutiveId(executive.getExecutiveId());
				editLog.setPreviousExecutiveId(prevTrafficMaster.getExecutiveId());
				editLog.setDescripstionData(StringUtils.substring(descriptionStr, 0, descriptionStr.length() - 2));
				editLog.setPreviousDescripstionData(StringUtils.substring(prevDescriptionStr, 0, prevDescriptionStr.length() - 2));
				editLog.setCreationDate(createDate);
				editLog.setMarkForDelete(false);
				editLog.setDescripstionEditTypeId(EditLogs.Description_Traffic_Config_Edit);
				editLog.setTypeWaybillTypeId(EditLogs.Type_TRAFFIC_CONFIG);

				final var	valObject =  new ValueObject();
				valObject.put("editLog", editLog);

				final var	editLogsBll = new EditLogsBll();
				editLogsBll.editLogsForTrafficConfig(valObject);
			}

			if(filter != 0) {
				response.sendRedirect("BranchWiseTrafficConfiguration.do?pageId=257&eventId=1&message="+strResponse);
				request.setAttribute("message",strResponse);
			}

		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}

	}
}