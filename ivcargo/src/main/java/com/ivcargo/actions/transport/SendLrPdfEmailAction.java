package com.ivcargo.actions.transport;

import java.io.PrintWriter;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringUtils;
import org.json.JSONObject;

import com.businesslogic.print.SendLrPdfEmailBll;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.constant.properties.LRPdfPrintProperties;
import com.iv.constant.properties.lrprint.LRPrintPropertiesConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.properties.constant.DisplayDataWithinDateRangePropertiesConstant;
import com.iv.utils.constant.Constant;
import com.iv.utils.constant.properties.FolderLocationPropertiesConstant;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.message.Message;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.Executive;
import com.platform.dto.configuration.modules.GroupConfigurationPropertiesDTO;
import com.platform.resource.CargoErrorList;

public class SendLrPdfEmailAction implements Action {

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	error 			= null;
		String				consignorEmailId	= null;
		String				consigneeEmailId	= null;
		short				serverIdentifier	= 0;
		JSONObject			jsonObjectOut		= null;
		PrintWriter			out					= null;

		try {
			final var	cache	= new CacheManip(request);
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			response.setContentType("application/json"); // Setting response for JSON Content

			out						= response.getWriter();
			final var 	wayBillId				= JSPUtility.GetLong(request, "wayBillId", 0);
			final var 	waybillNumber			= JSPUtility.GetString(request, "waybillNo");
			final var	executive				= cache.getExecutive(request);
			final var	consignor				= JSPUtility.GetString(request, "consignorEle", null);
			final var	consignee				= JSPUtility.GetString(request, "consigneeEle", null);
			final var	isLrPrintExportToPdf	= JSPUtility.GetBoolean(request, "isLrPrintExportToPdf", false);

			final var	consignorEle = !StringUtils.isEmpty(consignor);
			final var	consigneeEle = !StringUtils.isEmpty(consignee);

			final var	accountGroup				= cache.getAccountGroupByAccountGroupId(request, executive.getAccountGroupId());

			if(accountGroup != null)
				serverIdentifier = accountGroup.getServerIdentifier();

			if(wayBillId > 0) {
				final var	valueInObject			= new ValueObject();
				final var	sendLrPdfEmailBll		= new SendLrPdfEmailBll();

				valueInObject.put("wayBillId", wayBillId);
				valueInObject.put("waybillNo", waybillNumber);
				valueInObject.put("branchcache", cache.getGenericBranchesDetail(request));
				valueInObject.put(Executive.EXECUTIVE, executive);
				valueInObject.put("charges", cache.getActiveBookingCharges(request, executive.getBranchId()));
				valueInObject.put("consignorEle", consignorEle);
				valueInObject.put("consigneeEle", consigneeEle);
				valueInObject.put(ModuleIdentifierConstant.MODULE_ID, ModuleIdentifierConstant.LR_VIEW_RESEND_PDF_MAIL);
				valueInObject.put("isLrPrintExportToPdf", isLrPrintExportToPdf);
				valueInObject.put("accountGroup", accountGroup);
				valueInObject.put(LRPrintPropertiesConstant.LR_PRINT_PROPERTIES, cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.LR_PRINT));
				valueInObject.put(LRPdfPrintProperties.LR_PDF_PRINT_PROPERTIES, cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.LR_PDF_PRINT));
				valueInObject.put(GroupConfigurationPropertiesDTO.GROUP_CONFIGURATION, cache.getGroupConfiguration(request, executive.getAccountGroupId()));
				valueInObject.put(DisplayDataWithinDateRangePropertiesConstant.DISPLAY_DATA_CONFIGURATION_CONSTANT, cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.DISPLAY_DATA_CONFIGURATION));
				valueInObject.put(FolderLocationPropertiesConstant.FOLDER_LOCATION_CONFIGURATION, cache.getConfiguration(request, 0, ModuleIdentifierConstant.FOLDER_LOCATION));
				valueInObject.put(Constant.IV_CARGO_URL, cache.getWebsiteURL(request));
				valueInObject.put(Constant.WEBSITE_PATH, cache.getWebsiteRealPath(request));

				final var	valueOutObject = sendLrPdfEmailBll.sendEmailFromLrView(valueInObject);

				if(valueOutObject != null) {
					consignorEmailId	= (String) valueOutObject.get("consignorEmailId");
					consigneeEmailId	= (String) valueOutObject.get("consigneeEmailId");

					jsonObjectOut		= new JSONObject();

					jsonObjectOut.put(Constant.FILE_NAME, valueOutObject.getString(Constant.FILE_NAME, null));
					jsonObjectOut.put(Constant.FILE_PATH, valueOutObject.getString(Constant.FILE_PATH));
					jsonObjectOut.put(Constant.SERVER_IDENTIFIER, serverIdentifier);

					if(!isLrPrintExportToPdf && StringUtils.isEmpty(consignorEmailId) && StringUtils.isEmpty(consigneeEmailId))
						jsonObjectOut.put(Message.MESSAGE, CargoErrorList.errorDescription(CargoErrorList.NO_EMAIL_DESCRIPTION, null));

					out.println(jsonObjectOut);
				}

				if(!StringUtils.isEmpty(consignorEmailId) || !StringUtils.isEmpty(consigneeEmailId)) {
					if(valueOutObject != null) {
						request.setAttribute("filter",0);
						request.setAttribute("wayBillId",wayBillId);
						request.setAttribute("accountGroupId",executive.getAccountGroupId());
						request.setAttribute("waybillNo",waybillNumber);
						request.setAttribute("nextPageToken", "success");
					}
				} else {
					error.put("errorCode", CargoErrorList.NO_EMAIL_DESCRIPTION);
					error.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.errorDescription(CargoErrorList.NO_EMAIL_DESCRIPTION, null));
					request.setAttribute("cargoError", error);
					request.setAttribute("nextPageToken", "failure");
				}
			} else {
				error.put("errorCode", CargoErrorList.LR_ISSUE_ERROR);
				error.put("errorDescription", CargoErrorList.LR_ISSUE_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
				request.setAttribute("nextPageToken", "failure");
			}
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		} finally {
			out.flush();
			out.close();
		}
	}

}
