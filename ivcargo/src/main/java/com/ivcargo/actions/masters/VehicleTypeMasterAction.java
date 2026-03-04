package com.ivcargo.actions.masters;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringUtils;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.constant.properties.master.VehicleTypePropertiesConstant;
import com.iv.dao.impl.master.VehicleTypeMasterDaoImpl;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.dto.master.VehicleTypeMaster;
import com.iv.resource.ResourceManager;
import com.iv.utils.DateTime.DateTimeUtility;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.resource.CargoErrorList;

public class VehicleTypeMasterAction implements Action {
	public static final String TRACE_ID = "VehicleTypeMasterAction";

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	error 	= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request, error))
				return;

			final var	cacheManip		= new CacheManip(request);
			final var	exec			= cacheManip.getExecutive(request);

			if(exec == null) {
				ActionStaticUtil.throwInvalidSessionError(request, error);
				return;
			}

			final var	configuration					= cacheManip.getConfiguration(request, exec.getAccountGroupId(), ModuleIdentifierConstant.VEHICLE_TYPE_MASTER);

			String strResponse = null;
			final var vehicleTypeMaster = new VehicleTypeMaster();
			final var filter = JSPUtility.GetInt(request, "filter",0);

			switch (filter) {
			case 1 -> {
				vehicleTypeMaster.setName(StringUtils.upperCase(JSPUtility.GetString(request, "name")));
				vehicleTypeMaster.setCapacity(JSPUtility.GetDouble(request, "capacity", 0.00));
				vehicleTypeMaster.setMarkForDelete(false);
				vehicleTypeMaster.setAccountGroupId(exec.getAccountGroupId());
				vehicleTypeMaster.setExecutiveId(exec.getExecutiveId());
				vehicleTypeMaster.setCreationDateTime(DateTimeUtility.getCurrentTimeStamp());
				vehicleTypeMaster.setModuleId(ModuleIdentifierConstant.VEHICLE_TYPE_MASTER);

				final var newVehicleTypeId = VehicleTypeMasterDaoImpl.getInstance().insertVehicleTypeMaster(vehicleTypeMaster);

				if(newVehicleTypeId > 0) {
					// add new Branch to cache
					cacheManip.refreshCacheForVehicleType(request, exec.getAccountGroupId());
					strResponse = CargoErrorList.MASTER_DATA_INSERT_SUCCESS_DESCRIPTION;
				} else
					strResponse = "VehicleType Insert"+CargoErrorList.MASTER_DATA_OPERATION_FAILURE_DESCRIPTION;
			}
			case 2 -> {
				vehicleTypeMaster.setVehicleTypeId(JSPUtility.GetInt(request, "selectedVehicleTypeId"));
				vehicleTypeMaster.setName(StringUtils.upperCase(JSPUtility.GetString(request, "name")));
				vehicleTypeMaster.setCapacity(JSPUtility.GetDouble(request, "capacity", 0.00));

				final var conn	= ResourceManager.getConnection();

				VehicleTypeMasterDaoImpl.getInstance().update(vehicleTypeMaster, conn);

				cacheManip.refreshCacheForVehicleType(request, exec.getAccountGroupId());

				ResourceManager.freeConnection(conn);
			}
			case 3 -> {
				vehicleTypeMaster.setVehicleTypeId(JSPUtility.GetInt(request, "selectedVehicleTypeId", 0));
				vehicleTypeMaster.setAccountGroupId(exec.getAccountGroupId());

				final var conn	= ResourceManager.getConnection();
				VehicleTypeMasterDaoImpl.getInstance().delete(vehicleTypeMaster, conn);

				ResourceManager.freeConnection(conn);

				cacheManip.refreshCacheForVehicleType(request, exec.getAccountGroupId());
			}
			default -> {
				break;
			}
			}

			request.setAttribute("nextPageToken", "success");
			request.setAttribute(VehicleTypePropertiesConstant.ALLOW_CAPACITY_IN_DECIMAL, (boolean) configuration.getOrDefault(VehicleTypePropertiesConstant.ALLOW_CAPACITY_IN_DECIMAL, false));

			if(filter != 0) {
				response.sendRedirect("VehicleTypeMaster.do?pageId=211&eventId=1&message=" + strResponse);
				request.setAttribute("message", strResponse);
			}
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}
}
