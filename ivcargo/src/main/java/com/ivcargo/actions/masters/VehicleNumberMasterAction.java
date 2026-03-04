package com.ivcargo.actions.masters;

import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.ObjectUtils;
import org.json.JSONObject;

import com.framework.Action;
import com.iv.bll.utils.IDProofSelectionUtility;
import com.iv.constant.properties.IDProofPropertiesConstant;
import com.iv.dto.constant.IDProofConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.ivcargo.utils.JsonUtility;
import com.platform.utils.Converter;

public class VehicleNumberMasterAction implements Action{
	public static final String TRACE_ID = "VehicleNumberMasterAction";

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>				error 										= null;
		ValueObject 						valObj										= null;

		try {
			response.setContentType("application/json");

			if(request.getParameter("json") != null)
				new JSONObject(request.getParameter("json"));

			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	cacheManip				= new CacheManip(request);
			final var	exec					= cacheManip.getExecutive(request);
			final var	vtForGroup				= cacheManip.getVehicleTypeForGroup(request, exec.getAccountGroupId());
			final var	configuration			= cacheManip.getConfiguration(request, exec.getAccountGroupId(), ModuleIdentifierConstant.VEHICLE_NUMBER_MASTER);
			final var	idProofHM				= cacheManip.getConfiguration(request, exec.getAccountGroupId(), ModuleIdentifierConstant.ID_PROOF_CONFIGURATION, ModuleIdentifierConstant.VEHICLE_NUMBER_MASTER);
			final var	idProofConstantArr		= IDProofSelectionUtility.getModuleWiseIDProofSelection(idProofHM);

			configuration.entrySet().forEach((final Map.Entry<Object, Object> entry) -> request.setAttribute(entry.getKey().toString(), entry.getValue()));

			if(idProofConstantArr != null && idProofConstantArr.length > 0) {
				valObj	= new ValueObject();
				valObj.put("idProofConstantArr", Converter.arrayDtotoArrayListWithHashMapConversion(idProofConstantArr));
				valObj.put("idProofConstant", IDProofConstant.getIDProofConstant());
			}

			final var object = JsonUtility.convertionToJsonObjectForResponse(valObj);

			request.setAttribute("idProofObj",object);
			request.setAttribute(IDProofPropertiesConstant.ID_PROOF_ENTRY_ALLOW, idProofHM.getOrDefault(IDProofPropertiesConstant.ID_PROOF_ENTRY_ALLOW, false));
			request.setAttribute(IDProofPropertiesConstant.MAX_FILE_SIZE_TO_ALLOW, idProofHM.getOrDefault(IDProofPropertiesConstant.MAX_FILE_SIZE_TO_ALLOW, 1024));

			// Check If VehicleTypeForGroup is Missing
			if (ObjectUtils.isEmpty(vtForGroup))
				response.sendRedirect("SearchWayBill.do?pageId=0&eventId=1&filter=8");

			final var regionForGroup = cacheManip.getRegionsByGroupId(request, exec.getAccountGroupId());
			request.setAttribute("regionForGroup", regionForGroup);
			request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}

	}
}