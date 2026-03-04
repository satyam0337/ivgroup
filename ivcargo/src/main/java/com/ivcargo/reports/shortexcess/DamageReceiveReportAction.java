package com.ivcargo.reports.shortexcess;

import java.io.PrintWriter;
import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONObject;

import com.businesslogic.shortexcess.DamageReceiveBLL;
import com.framework.Action;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.logsapp.LogWriter;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actions.shortexcess.CommonFuctionToConvertArrayListToJSONArray;
import com.ivcargo.reports.ReportView;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.CustomGroupMapper;
import com.platform.dto.Executive;
import com.platform.dto.configuration.report.shortexcess.DamageRegisterReportConfigurationDTO;
import com.platform.dto.model.ReportViewModel;
import com.platform.dto.shortexcess.DamageReceiveReportDto;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

/**
 * @author Anant Chaudhary	14-10-2015
 *
 */

public class DamageReceiveReportAction implements Action {

	public static final String TRACE_ID = "DamageReceiveReportAction";

	@SuppressWarnings({ "unchecked", "unused" })
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		// TODO Auto-generated method stub

		HashMap<String,Object>							error 						= null;
		PrintWriter 									out							= null;
		Executive										executive					= null;
		JSONObject 										getJsonObject				= null;
		JSONObject 										outJsonObject				= null;
		Timestamp										fromDate					= null;
		Timestamp										toDate						= null;
		SimpleDateFormat								sdf							= null;
		SimpleDateFormat								sdf1						= null;
		long											subRegionId					= 0;
		long											branchId					= 0;
		long											regionId					= 0;
		ValueObject 									valueObjectToBLL			= null;
		ValueObject										valueObjectFromBLL			= null;
		//		ShortReceiveBLL 								shortReceiveBLL				= null;
		DamageReceiveBLL 								damageReceiveBLL			= null;
		//ArrayList<ShortReceiveReportDto> 				shortReceiveList 			= null;
		ArrayList<DamageReceiveReportDto> 				damageReceiveList 			= null;
		CommonFuctionToConvertArrayListToJSONArray		commonFun					= null;
		ValueObject										valueObjectForTotal			= null;
		ReportViewModel									reportViewModel				= null;
		String											accountGroupNameForPrint	= null;
		String											branchAddress				= null;
		String											branchPhoneNumber			= null;
		ValueObject										valueObjectFromPropCfgBLL	= null;
		ValueObject  									branchesColl				= null;
		CacheManip										cache						= null;
		String											isLRNumberColumn			= null;
		String											isDamageDateColumn			= null;
		String											isDamageBranchColumn		= null;
		String											isDamageNumberColumn		= null;
		String											isDamageUserColumn			= null;
		String											isArticleTypeColumn			= null;
		String											isTotalArticleColumn		= null;
		String											isSaidToContainColumn		= null;
		String											isDamageArticleColumn		= null;
		String											isLSNumberColumn			= null;
		String											isTURNumberColumn			= null;
		String											isPrivateMarkColumn			= null;
		String											isRemarkColumn				= null;
		String											isTotalDamageRow			= null;
		String											isExcelButtonDisplay		= null;
		String											isLaserPrintAllow			= null;
		String											isPlainPrintAllow			= null;
		String											isVehicleNumberColumn		= null;
		String											isWayBillTypeColumn			= null;
		String											isSourceBranchColumn		= null;
		String											isDestinationBranchColumn	= null;
		String											isConsignorColumn			= null;
		String											isConsigneeColumn			= null;
		String											imagePath					= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error)){
				return;
			}

			valueObjectToBLL		= new ValueObject();
			damageReceiveBLL 		= new DamageReceiveBLL();
			outJsonObject			= new JSONObject();
			commonFun				= new CommonFuctionToConvertArrayListToJSONArray();
			sdf1					= new SimpleDateFormat("dd-MM-yyyy");
			cache					= new CacheManip(request);

			executive = (Executive) request.getSession().getAttribute("executive");

			response.setContentType("application/json");
			out = response.getWriter();

			getJsonObject 	= new JSONObject(request.getParameter("json"));

			sdf			= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			fromDate	= new Timestamp((sdf.parse(getJsonObject.get("FromDate").toString() + " 00:00:00")).getTime());
			toDate		= new Timestamp((sdf.parse(getJsonObject.get("ToDate").toString() + " 23:59:59")).getTime());

			if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_GROUPADMIN){
				regionId 	= Utility.getLong(getJsonObject.get("RegionId"));
				subRegionId = Utility.getLong(getJsonObject.get("SubRegion"));
				branchId 	= Utility.getLong(getJsonObject.get("BranchId"));
			}else if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_REGIONADMIN){
				regionId 	= executive.getRegionId();
				subRegionId = Utility.getLong(getJsonObject.get("SubRegion"));
				branchId 	= Utility.getLong(getJsonObject.get("BranchId"));
			}else if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_SUBREGIONADMIN){
				regionId 	= executive.getRegionId();
				subRegionId = executive.getSubRegionId();
				branchId 	= Utility.getLong(getJsonObject.get("BranchId"));
			}else{
				regionId 	= executive.getRegionId();
				subRegionId = executive.getSubRegionId();
				branchId 	= executive.getBranchId();
			}

			if(subRegionId > 0 && branchId > 0) {
				valueObjectToBLL.put("subRegionId", subRegionId);
				valueObjectToBLL.put("filter", (short)1);
			} else if(subRegionId > 0 && branchId == 0){
				valueObjectToBLL.put("subRegionId", subRegionId);
				valueObjectToBLL.put("filter", (short)2);
			} else if(regionId == 0) 
				valueObjectToBLL.put("filter", (short)3);
			  else if(subRegionId == 0) {
				valueObjectToBLL.put("regionId", regionId);
				valueObjectToBLL.put("filter", (short)4);
			}

			branchesColl	= cache.getGenericBranchesDetail(request);
			valueObjectToBLL.put("fromDate", fromDate);
			valueObjectToBLL.put("toDate", toDate);
			valueObjectToBLL.put("branchId", branchId);
			valueObjectToBLL.put("branchesColl", branchesColl);
			valueObjectToBLL.put("accountGroupId", executive.getAccountGroupId());

			valueObjectFromBLL 		= damageReceiveBLL.getAllDamageReceiveDetailsByBranch(valueObjectToBLL);

			if(valueObjectFromBLL == null) {
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
				request.setAttribute("nextPageToken", "failure");
				outJsonObject.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO, "jsonObjectPut = "+outJsonObject);
				out.println(outJsonObject);
				return;
			}

			damageReceiveList	= (ArrayList<DamageReceiveReportDto>) valueObjectFromBLL.get("damageReceiveList");

			if(damageReceiveList != null && damageReceiveList.size() > 0) {

				outJsonObject.put("damageReceiveCall", commonFun.getDamageReceiveReportJSONArrayObject(damageReceiveList));

				valueObjectForTotal		= (ValueObject) valueObjectFromBLL.get("valueObjectForTotal");

				if(valueObjectForTotal != null) {
					outJsonObject.put("valueObjectForTotal", new JSONObject(valueObjectForTotal.getHtData()));
				}

			}
			ActionStaticUtil.setRequestAttribute(request,"customAddressBranchId", branchId);
			ActionStaticUtil.setRequestAttribute(request,"customAddressIdentifer", CustomGroupMapper.IDENTIFIER_BOOKING);

			reportViewModel 	= new ReportViewModel();
			reportViewModel 	= ReportView.getInstance().populateReportViewModel(request, reportViewModel);

			if(reportViewModel != null) {
				accountGroupNameForPrint	= reportViewModel.getAccountGroupName();
				branchAddress				= reportViewModel.getBranchAddress();
				branchPhoneNumber			= reportViewModel.getBranchPhoneNumber();
				imagePath					= reportViewModel.getImagePath();
				
				outJsonObject.put("accountGroupNameForPrint", accountGroupNameForPrint);
				outJsonObject.put("branchAddress", branchAddress);
				outJsonObject.put("branchPhoneNumber", branchPhoneNumber);
				outJsonObject.put("imagePath", imagePath);
			}

			valueObjectFromPropCfgBLL	= ReadAllConfigurationsBllImpl.getInstance().getOldReportConfigurationData(ReportIdentifierConstant.DAMAGE_REGISTER_REPORT, executive.getAccountGroupId());

			isLRNumberColumn			= (String) valueObjectFromPropCfgBLL.get(DamageRegisterReportConfigurationDTO.IS_LR_COLUMN);
			isDamageDateColumn			= (String) valueObjectFromPropCfgBLL.get(DamageRegisterReportConfigurationDTO.IS_DAMAGE_DATE_COLUMN);
			isDamageBranchColumn		= (String) valueObjectFromPropCfgBLL.get(DamageRegisterReportConfigurationDTO.IS_DAMAGE_BRANCH_COLUMN);
			isDamageNumberColumn		= (String) valueObjectFromPropCfgBLL.get(DamageRegisterReportConfigurationDTO.IS_DAMAGE_NUMBER_COLUMN);
			isDamageUserColumn			= (String) valueObjectFromPropCfgBLL.get(DamageRegisterReportConfigurationDTO.IS_DAMAGE_USER_COLUMN);
			isArticleTypeColumn			= (String) valueObjectFromPropCfgBLL.get(DamageRegisterReportConfigurationDTO.IS_ARTICLE_TYPE_COLUMN);
			isTotalArticleColumn		= (String) valueObjectFromPropCfgBLL.get(DamageRegisterReportConfigurationDTO.IS_TOTAL_ARTICLE_COLUMN);
			isSaidToContainColumn		= (String) valueObjectFromPropCfgBLL.get(DamageRegisterReportConfigurationDTO.IS_SAID_TO_CONTAIN_COLUMN);
			isDamageArticleColumn		= (String) valueObjectFromPropCfgBLL.get(DamageRegisterReportConfigurationDTO.IS_DAMAGE_ARTICLE_COLUMN);
			isLSNumberColumn			= (String) valueObjectFromPropCfgBLL.get(DamageRegisterReportConfigurationDTO.IS_LS_NUMBER_COLUMN);
			isTURNumberColumn			= (String) valueObjectFromPropCfgBLL.get(DamageRegisterReportConfigurationDTO.IS_TUR_NUMBER_COLUMN);
			isPrivateMarkColumn			= (String) valueObjectFromPropCfgBLL.get(DamageRegisterReportConfigurationDTO.IS_PRIVATE_MARK_COLUMN);
			isRemarkColumn				= (String) valueObjectFromPropCfgBLL.get(DamageRegisterReportConfigurationDTO.IS_REMARK_COLUMN);
			isTotalDamageRow			= (String) valueObjectFromPropCfgBLL.get(DamageRegisterReportConfigurationDTO.IS_TOTAL_DAMAGE_ROW);
			isExcelButtonDisplay		= (String) valueObjectFromPropCfgBLL.get(DamageRegisterReportConfigurationDTO.IS_EXCEL_BUTTON_DISPLAY);
			isLaserPrintAllow			= (String) valueObjectFromPropCfgBLL.get(DamageRegisterReportConfigurationDTO.IS_LASER_PRINT_ALLOW);
			isPlainPrintAllow			= (String) valueObjectFromPropCfgBLL.get(DamageRegisterReportConfigurationDTO.IS_PLAIN_PRINT_ALLOW);
			isVehicleNumberColumn		= (String) valueObjectFromPropCfgBLL.get(DamageRegisterReportConfigurationDTO.IS_VEHICLE_NUMBER_COLUMN);
			isWayBillTypeColumn			= (String) valueObjectFromPropCfgBLL.get(DamageRegisterReportConfigurationDTO.IS_WAY_BILL_TYPE_COLUMN);
			isSourceBranchColumn		= (String) valueObjectFromPropCfgBLL.get(DamageRegisterReportConfigurationDTO.IS_SOURCE_BRANCH_COLUMN);
			isDestinationBranchColumn	= (String) valueObjectFromPropCfgBLL.get(DamageRegisterReportConfigurationDTO.IS_DESTINATION_BRANCH_COLUMN);
			isConsignorColumn			= (String) valueObjectFromPropCfgBLL.get(DamageRegisterReportConfigurationDTO.IS_CONSIGNOR_COLUMN);
			isConsigneeColumn			= (String) valueObjectFromPropCfgBLL.get(DamageRegisterReportConfigurationDTO.IS_CONSIGNEE_COLUMN);

			outJsonObject.put("isLRNumberColumn", isLRNumberColumn);
			outJsonObject.put("isDamageDateColumn", isDamageDateColumn);
			outJsonObject.put("isDamageBranchColumn", isDamageBranchColumn);
			outJsonObject.put("isDamageNumberColumn", isDamageNumberColumn);
			outJsonObject.put("isDamageUserColumn", isDamageUserColumn);
			outJsonObject.put("isArticleTypeColumn", isArticleTypeColumn);
			outJsonObject.put("isTotalArticleColumn", isTotalArticleColumn);
			outJsonObject.put("isSaidToContainColumn", isSaidToContainColumn);
			outJsonObject.put("isDamageArticleColumn", isDamageArticleColumn);
			outJsonObject.put("isLSNumberColumn", isLSNumberColumn);
			outJsonObject.put("isTURNumberColumn", isTURNumberColumn);
			outJsonObject.put("isPrivateMarkColumn", isPrivateMarkColumn);
			outJsonObject.put("isRemarkColumn", isRemarkColumn);
			outJsonObject.put("isTotalDamageRow", isTotalDamageRow);
			outJsonObject.put("isExcelButtonDisplay", isExcelButtonDisplay);
			outJsonObject.put("isLaserPrintAllow", isLaserPrintAllow);
			outJsonObject.put("isPlainPrintAllow", isPlainPrintAllow);
			outJsonObject.put("isVehicleNumberColumn", isVehicleNumberColumn);
			outJsonObject.put("isWayBillTypeColumn", isWayBillTypeColumn);
			outJsonObject.put("isSourceBranchColumn", isSourceBranchColumn);
			outJsonObject.put("isDestinationBranchColumn", isDestinationBranchColumn);
			outJsonObject.put("isConsignorColumn", isConsignorColumn);
			outJsonObject.put("isConsigneeColumn", isConsigneeColumn);

			outJsonObject.put("fromDate", sdf1.format(fromDate));
			outJsonObject.put("toDate", sdf1.format(toDate));
			outJsonObject.put("selectedBranch", executive.getBranchName());
			outJsonObject.put("selectedRegion", executive.getRegionName());
			outJsonObject.put("selectedSubRegion", executive.getSubRegionName());

			out.println(outJsonObject);
		} catch (Exception e) {
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, "error = "+e.getMessage());
			error.put("errorCode", CargoErrorList.SYSTEM_ERROR);
			error.put("errorDescription", CargoErrorList.SYSTEM_ERROR_DESCRIPTION);
			request.setAttribute("cargoError", error);
			request.setAttribute("nextPageToken", "failure");
		} finally {
			out.flush();
			out.close();
			out							= null;
			executive					= null;
			getJsonObject				= null;
			outJsonObject				= null;
			fromDate					= null;
			toDate						= null;
			sdf							= null;
			valueObjectToBLL			= null;
			valueObjectFromBLL			= null;
			damageReceiveBLL			= null;
			damageReceiveList 			= null;
			commonFun					= null;
		}
	}
}
