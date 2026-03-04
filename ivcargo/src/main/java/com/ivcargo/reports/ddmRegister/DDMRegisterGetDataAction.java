package com.ivcargo.reports.ddmRegister;

import java.io.PrintWriter;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONObject;

import com.businesslogic.ddmReport.DDMRegisterBLL;
import com.businesslogic.properties.impl.PropertyConfigValueBLLImpl;
import com.framework.Action;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.logsapp.LogWriter;
import com.iv.properties.constant.report.DoorDeliveryMemoRegisterRoportConfigurationConstant;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.exception.ExceptionProcess;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.reports.ReportView;
import com.ivcargo.utils.CacheManip;
import com.ivcargo.utils.JsonUtility;
import com.platform.dao.model.DDMRegister;
import com.platform.dto.AliasNameConstants;
import com.platform.dto.CustomGroupMapper;
import com.platform.dto.Executive;
import com.platform.dto.ExecutiveFeildPermissionDTO;
import com.platform.dto.PropertiesFileConstants;
import com.platform.dto.constant.ReportWiseDisplayZeroAmountConstant;
import com.platform.dto.model.ReportViewModel;
import com.platform.resource.CargoErrorList;

public class DDMRegisterGetDataAction implements Action {

	public static final String 	TRACE_ID  	= "DDMRegisterGetDataAction";

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {

		HashMap<String,Object>				error 										= null;
		PrintWriter							out											= null;
		JSONObject							jsonObjectIn								= null;
		JSONObject							jsonObjectOut								= null;
		ReportViewModel 					reportViewModel 							= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			response.setContentType("application/json"); // Setting response for JSON Content
			out					= response.getWriter();
			jsonObjectOut		= new JSONObject();
			jsonObjectIn		= new JSONObject(request.getParameter("json"));

			if(request.getSession().getAttribute("executive") == null) {
				jsonObjectOut.put(AliasNameConstants.ERROR_DESCRIPTION, CargoErrorList.LOGGED_OUT_DESCRIPTION);
				out.println(jsonObjectOut);
				return;
			}

			final var	cache 			= new CacheManip(request);
			final var	executive 		= cache.getExecutive(request);
			final Map<Long, ExecutiveFeildPermissionDTO>	execFldPermissionsHM = cache.getExecutiveFieldPermission(request);
			final var	valueInObject	= getRequestData(request, executive, cache, jsonObjectIn);
			final var	accountGroup	= cache.getAccountGroupByAccountGroupId(request, executive.getAccountGroupId());

			final var	displayDataReportConfig			= PropertyConfigValueBLLImpl.getInstance().getConfiguration(executive, PropertiesFileConstants.REPORT_WISE_DISPLAY_ZERO_AMOUNT_CONSTANT);
			final var	doorDeliveryMemoRegisterConfig	= ReadAllConfigurationsBllImpl.getInstance().getOldReportConfigurationData(ReportIdentifierConstant.DOOR_DELIVERY_MEMO_REGISTER, executive.getAccountGroupId());

			final var	isAmountZeroForDoorDeliveryMemoRegister	= displayDataReportConfig.getBoolean(ReportWiseDisplayZeroAmountConstant.DOOR_DELIVERY_MEMO_REGISTER, false);
			final var	showLorryHireAmount						= doorDeliveryMemoRegisterConfig.getBoolean(DoorDeliveryMemoRegisterRoportConfigurationConstant.SHOW_LORRY_HIRE_AMOUNT, false);
			final var	showLorryHireAmountStatus				= doorDeliveryMemoRegisterConfig.getBoolean(DoorDeliveryMemoRegisterRoportConfigurationConstant.SHOW_LORRY_HIRE_AMOUNT_STATUS, false);
			final var	showCollectionPersonName				= doorDeliveryMemoRegisterConfig.getBoolean(DoorDeliveryMemoRegisterRoportConfigurationConstant.SHOW_COLLECTION_PERSON_NAME, false);
			final var	getDdmRegisterDataUsingWhereClause		= doorDeliveryMemoRegisterConfig.getBoolean(DoorDeliveryMemoRegisterRoportConfigurationConstant.GET_DDM_REGISTER_DATA_USING_WHERE_CLAUSE, false);
			final var	showUnloadingTotal						= doorDeliveryMemoRegisterConfig.getBoolean(DoorDeliveryMemoRegisterRoportConfigurationConstant.SHOW_UNLOADING_TOTAL, false);

			final var	displayDataConfig						= cache.getDisplayDataConfiguration(request, executive.getAccountGroupId());

			if(valueInObject == null) {
				jsonObjectOut.put(AliasNameConstants.ERROR_DESCRIPTION, "Invalid Selection");
				out.println(jsonObjectOut);
				return;
			}

			valueInObject.put("isAmountZeroForDoorDeliveryMemoRegister", isAmountZeroForDoorDeliveryMemoRegister);
			valueInObject.put("displayDataConfig", displayDataConfig);
			valueInObject.put("execFldPermissionsHM", execFldPermissionsHM);
			valueInObject.put("subregionColl", cache.getAllSubRegions(request));
			valueInObject.put("getDdmRegisterDataUsingWhereClause", getDdmRegisterDataUsingWhereClause);
			valueInObject.put(DoorDeliveryMemoRegisterRoportConfigurationConstant.SHOW_CONSOLIDATE_EWAYBILL_NUMBER_STATUS, doorDeliveryMemoRegisterConfig.getBoolean(DoorDeliveryMemoRegisterRoportConfigurationConstant.SHOW_CONSOLIDATE_EWAYBILL_NUMBER_STATUS, false));

			final var	generateDDMBLL	= new DDMRegisterBLL();
			final var	outValObj 		= generateDDMBLL.getDDMRegisterData(valueInObject);

			var	branchId		= valueInObject.getLong("branch", 0);

			if (branchId == 0)
				branchId = executive.getBranchId();

			if(outValObj == null) {
				jsonObjectOut.put(AliasNameConstants.ERROR_DESCRIPTION, CargoErrorList.SYSTEM_ERROR_DESCRIPTION);
				out.println(jsonObjectOut);
				return;
			}

			if(outValObj.get(AliasNameConstants.ERROR_DESCRIPTION) != null){
				jsonObjectOut.put(AliasNameConstants.ERROR_DESCRIPTION, outValObj.get("errorDescription"));
				out.println(jsonObjectOut);
				return;
			}

			ActionStaticUtil.setRequestAttribute(request,"customAddressBranchId", branchId);
			ActionStaticUtil.setRequestAttribute(request,"customAddressIdentifer", CustomGroupMapper.IDENTIFIER_DELIVERY);
			reportViewModel = new ReportViewModel();
			reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);

			jsonObjectOut.put(AliasNameConstants.JSON_DATA, convertToJSONData(outValObj));
			jsonObjectOut.put(AliasNameConstants.TOTAL_AMOUNTS_COLLECTION, JsonUtility.convertionToJsonObjectForResponse((ValueObject)outValObj.get("valOutForTotalAmt")));
			jsonObjectOut.put("accountGroupNameForPrint", accountGroup.getDescription());
			jsonObjectOut.put("branchAddress", executive.getAddress());
			jsonObjectOut.put("branchPhoneNumber", executive.getPhoneNumber());
			jsonObjectOut.put("imagePath", reportViewModel.getImagePath());
			jsonObjectOut.put("showLorryHireAmount", showLorryHireAmount);
			jsonObjectOut.put("showLorryHireAmountStatus", showLorryHireAmountStatus);
			jsonObjectOut.put(DoorDeliveryMemoRegisterRoportConfigurationConstant.SHOW_LHPV_COLUMN, doorDeliveryMemoRegisterConfig.getBoolean(DoorDeliveryMemoRegisterRoportConfigurationConstant.SHOW_LHPV_COLUMN, false));
			jsonObjectOut.put(DoorDeliveryMemoRegisterRoportConfigurationConstant.SHOW_BLHPV_COLUMN, doorDeliveryMemoRegisterConfig.getBoolean(DoorDeliveryMemoRegisterRoportConfigurationConstant.SHOW_BLHPV_COLUMN, false));
			jsonObjectOut.put(DoorDeliveryMemoRegisterRoportConfigurationConstant.REMOVE_STATUS_COLUMN, doorDeliveryMemoRegisterConfig.getBoolean(DoorDeliveryMemoRegisterRoportConfigurationConstant.REMOVE_STATUS_COLUMN, false));
			jsonObjectOut.put("showCollectionPersonName", showCollectionPersonName);
			jsonObjectOut.put("showConsolidateEwaybillNo", doorDeliveryMemoRegisterConfig.getBoolean(DoorDeliveryMemoRegisterRoportConfigurationConstant.SHOW_CONSOLIDATE_EWAY_BILL_NO, false));
			jsonObjectOut.put("showUnloadingTotal", showUnloadingTotal);
			jsonObjectOut.put(DoorDeliveryMemoRegisterRoportConfigurationConstant.SHOW_DRIVER_NAME, doorDeliveryMemoRegisterConfig.getBoolean(DoorDeliveryMemoRegisterRoportConfigurationConstant.SHOW_DRIVER_NAME, false));
			jsonObjectOut.put(DoorDeliveryMemoRegisterRoportConfigurationConstant.SHOW_DELIVERY_DISCOUNT, doorDeliveryMemoRegisterConfig.getBoolean(DoorDeliveryMemoRegisterRoportConfigurationConstant.SHOW_DELIVERY_DISCOUNT, false));

			out.println(jsonObjectOut);
		} catch (final Exception e) {
			ActionStaticUtil.catchJSONException(jsonObjectOut,out);
			out.println(jsonObjectOut);
			ActionStaticUtil.catchActionException(request, e, error);
		} finally {
			if (out != null) {
				out.flush();
				out.close();
			}
		}
	}

	private ValueObject getRequestData(final HttpServletRequest request,final Executive executive,final CacheManip cache,final JSONObject jsonObjectIn) throws Exception {
		try {
			final var	reqParamValObj	= new ValueObject();

			if(jsonObjectIn.get("fromDate") == null || jsonObjectIn.get("toDate") == null)
				return null;

			reqParamValObj.put("fromDate", jsonObjectIn.get("fromDate").toString());
			reqParamValObj.put("toDate", jsonObjectIn.get("toDate").toString());
			reqParamValObj.put("region", jsonObjectIn.optLong("region", 0));
			reqParamValObj.put("subRegion", jsonObjectIn.optLong("subRegion", 0));
			reqParamValObj.put("branch", jsonObjectIn.optLong("branch", 0));

			reqParamValObj.put("billSelectionId", jsonObjectIn.optLong("billSelectionId", 0));

			reqParamValObj.put(AliasNameConstants.EXECUTIVE, executive);
			reqParamValObj.put(AliasNameConstants.ALL_GROUP_BRANCHES, cache.getAllGroupBranches(request, executive.getAccountGroupId()));
			reqParamValObj.put("selectedVehicleNoId", jsonObjectIn.optLong("selectedVehicleNoId", 0));

			return reqParamValObj;
		} catch (final Exception e) {
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, "Error1 : "+e);
			throw e;
		}
	}

	@SuppressWarnings("unchecked")
	private JSONArray convertToJSONData(final ValueObject valObj) throws Exception {
		Map<Long, DDMRegister> 	delRunSheetledgerIdWiseDTO	= null;
		JSONArray				jsonOutObj					= null;

		try {
			jsonOutObj	= new JSONArray();

			if(valObj.get("delRunSheetledgerIdWiseDTO") == null) {
				jsonOutObj.put(CargoErrorList.NO_RECORDS_DESCRIPTION);
				return jsonOutObj;
			}

			delRunSheetledgerIdWiseDTO = (Map<Long, DDMRegister>) valObj.get("delRunSheetledgerIdWiseDTO");

			for (final Map.Entry<Long, DDMRegister> entry : delRunSheetledgerIdWiseDTO.entrySet())
				jsonOutObj.put(new JSONObject(entry.getValue()));

			return jsonOutObj;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}
}