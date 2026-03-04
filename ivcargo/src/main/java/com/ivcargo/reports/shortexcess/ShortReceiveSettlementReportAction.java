package com.ivcargo.reports.shortexcess;

import java.io.PrintWriter;
import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONObject;

import com.businesslogic.shortexcess.ShortReceiveSettlementBLL;
import com.framework.Action;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.logsapp.LogWriter;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actions.shortexcess.CommonFuctionToConvertArrayListToJSONArray;
import com.ivcargo.reports.ReportView;
import com.platform.dto.CustomGroupMapper;
import com.platform.dto.Executive;
import com.platform.dto.configuration.report.shortexcess.ShortRegisterSettlementReportConfigurationDTO;
import com.platform.dto.model.ReportViewModel;
import com.platform.dto.shortexcess.ClaimEntry;
import com.platform.dto.shortexcess.ExcessReceive;
import com.platform.dto.shortexcess.ShortReceiveArticles;
import com.platform.dto.shortexcess.ShortSettlementReport;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

/**
 * @author Anant Chaudhary	14-10-2015
 *
 */

public class ShortReceiveSettlementReportAction implements Action {

	public static final String	TRACE_ID = "ShortSettlementReportAction";

	@SuppressWarnings({ "unchecked", "unused" })
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		// TODO Auto-generated method stub

		HashMap<String,Object>	 		error 				= null;
		PrintWriter										out									= null;
		JSONObject										getJsonObject						= null;
		JSONObject										outJsonObject						= null;
		Executive										executive							= null;
		SimpleDateFormat								sdf									= null;
		Timestamp										fromDate							= null;
		Timestamp										toDate								= null;
		long											subRegionId							= 0;
		long											branchId							= 0;
		long											regionId							= 0;
		ValueObject										valueObjectToBLL					= null;
		ShortReceiveSettlementBLL						shortSettlementBLL					= null;
		ValueObject										valueObjectFromBLL					= null;
		ArrayList<ExcessReceive> 						excessReceiveList					= null;
		ArrayList<ClaimEntry> 							claimEntryList						= null;
		ArrayList<ShortSettlementReport> 				shSettlementReportList				= null;
		HashMap<Long, ArrayList<ExcessReceive>> 		excessReceiveHM						= null;
		long											shortReceivId						= 0;
		long											excessReceiveId						= 0;
		JSONArray 										valueObjExcessReceiveArray 			= null;
		JSONArray										valueObjectOfClaimArray				= null;
		Map<Long, JSONArray> 							newExcessReceiveHM					= null;
		HashMap<Long, ArrayList<ClaimEntry>>  			claimEntryHM						= null;
		long											claimEntryId						= 0;
		Map<Long, JSONArray> 							newClaimEntryHM						= null;
		HashMap<Long, ArrayList<ShortReceiveArticles>> 	shortArtHM							= null;
		ArrayList<ShortReceiveArticles> 				shoArticlesList						= null;
		JSONArray										valueObjectOfShortArtArray			= null;
		Map<Long, JSONArray> 							newShortArtHM						= null;
		CommonFuctionToConvertArrayListToJSONArray		commonFun							= null;
		SimpleDateFormat								sdf1								= null;
		ReportViewModel									reportViewModel						= null;
		String											accountGroupNameForPrint			= null;
		String											branchAddress						= null;
		String											branchPhoneNumber					= null;
		ValueObject										valueObjectFromProConfigValBLL		= null;
		String											isLrNumberColumnDisplay				= null;				
		String											isShortDateColumnDisplay			= null;
		String											isShortBranchColumnDisplay			= null;
		String											isShortNumberColumnDisplay			= null;
		String											isShortUserColumnDisplay			= null;
		String											isSettlementDateColumnDisplay		= null;
		String											isSettlementNumberColumnDisplay		= null;
		String											isSettlementBranchColumnDisplay		= null;
		String											isSettlementUserColumnDisplay		= null;
		String											isSettlementTypeColumnDisplay		= null;
		String											isExcessSettlementDetailsDisplay	= null;
		String											isClaimSettlementDetailsDisplay		= null;
		String											isNoclaimSettlementDetailsDisplay	= null;
		String											isShortArticleDetailsDisplay		= null;
		String											isExcessArticleDetailsDisplay		= null;
		String											isExcelButtonDisplay				= null;
		String											isLaserPrintAllow					= null;
		String											isPlainPrintAllow					= null;
		String											imagePath							= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error)){
				return;
			}
			valueObjectToBLL		= new ValueObject();
			valueObjectFromBLL		= new ValueObject();
			shortSettlementBLL		= new ShortReceiveSettlementBLL();
			outJsonObject			= new JSONObject();
			newExcessReceiveHM		= new HashMap<Long, JSONArray>();
			newClaimEntryHM			= new HashMap<Long, JSONArray>();
			newShortArtHM			= new HashMap<Long, JSONArray>();
			commonFun				= new CommonFuctionToConvertArrayListToJSONArray();
			sdf1					= new SimpleDateFormat("dd-MM-yyyy");

			executive	= (Executive) request.getSession().getAttribute("executive");

			response.setContentType("application/json");

			out		= response.getWriter();

			getJsonObject	= new JSONObject(request.getParameter("json"));

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
			} 

			valueObjectToBLL.put("fromDate", fromDate);
			valueObjectToBLL.put("toDate", toDate);
			valueObjectToBLL.put("branchId", branchId);

			valueObjectFromBLL	= shortSettlementBLL.getAllShortReceiveSettlementData(valueObjectToBLL);

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

			shSettlementReportList	= (ArrayList<ShortSettlementReport>) valueObjectFromBLL.get("shortSettlementReportList");

			if(shSettlementReportList != null && shSettlementReportList.size() > 0) {
				outJsonObject.put("shSettlementReportCall", commonFun.getShortSettlementJSONArrayObject(shSettlementReportList));

				for(int i = 0; i < shSettlementReportList.size(); i++) {
					shortReceivId		= shSettlementReportList.get(i).getShortReceiveId();
					excessReceiveId		= shSettlementReportList.get(i).getExcessReceiveId();
					claimEntryId		= shSettlementReportList.get(i).getClaimNumber();

					shortArtHM			= (HashMap<Long, ArrayList<ShortReceiveArticles>>) valueObjectFromBLL.get("shortArtHM");

					if(shortArtHM != null && shortArtHM.size() > 0) {
						if(shortReceivId > 0) {
							shoArticlesList		= shortArtHM.get(shortReceivId);

							if(shoArticlesList != null && shoArticlesList.size() > 0) {
								valueObjectOfShortArtArray	= commonFun.getShortReceiveArticleJSONArrayObject(shoArticlesList);

								newShortArtHM.put(shortReceivId, valueObjectOfShortArtArray);
							}
						}
					}

					excessReceiveHM		= (HashMap<Long, ArrayList<ExcessReceive>>) valueObjectFromBLL.get("excessReceiveHM");

					if(excessReceiveHM != null && excessReceiveHM.size() > 0) {		
						if(excessReceiveId > 0) {
							excessReceiveList	= excessReceiveHM.get(excessReceiveId);

							if(excessReceiveList != null && excessReceiveList.size() > 0) {
								valueObjExcessReceiveArray	= commonFun.getExcessReceiveJSONArrayObject(excessReceiveList);

								newExcessReceiveHM.put(excessReceiveId, valueObjExcessReceiveArray);
							}
						}
					}

					claimEntryHM	= (HashMap<Long, ArrayList<ClaimEntry>>) valueObjectFromBLL.get("claimEntryHM");

					if(claimEntryHM != null && claimEntryHM.size() > 0) {
						if(claimEntryId > 0) {
							claimEntryList		= claimEntryHM.get(claimEntryId);

							if(claimEntryList != null && claimEntryList.size() > 0) {
								valueObjectOfClaimArray	= commonFun.getClaimEntryJSONArrayObject(claimEntryList);

								newClaimEntryHM.put(claimEntryId, valueObjectOfClaimArray);
							}
						}
					}
				}
			}

			if(newShortArtHM != null && newShortArtHM.size() > 0) {
				outJsonObject.put("shortArticleHMCall", newShortArtHM);
			}

			if(newExcessReceiveHM != null && newExcessReceiveHM.size() > 0) {
				outJsonObject.put("excessReceiveHMCall", newExcessReceiveHM);
			}

			if(newClaimEntryHM != null && newClaimEntryHM.size() > 0) {
				outJsonObject.put("claimEntryHMCall", newClaimEntryHM);
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

			valueObjectFromProConfigValBLL		= ReadAllConfigurationsBllImpl.getInstance().getOldReportConfigurationData(ReportIdentifierConstant.SHORT_REGISTER_SETTLEMENT_REPORT, executive.getAccountGroupId());

			isLrNumberColumnDisplay				= (String) valueObjectFromProConfigValBLL.get(ShortRegisterSettlementReportConfigurationDTO.IS_LR_NUMBER_COLUMN_DISPLAY);
			isShortDateColumnDisplay			= (String) valueObjectFromProConfigValBLL.get(ShortRegisterSettlementReportConfigurationDTO.IS_SHORT_DATE_COLUMN_DISPLAY);
			isShortBranchColumnDisplay			= (String) valueObjectFromProConfigValBLL.get(ShortRegisterSettlementReportConfigurationDTO.IS_SHORT_BRANCH_COLUMN_DISPLAY);
			isShortNumberColumnDisplay			= (String) valueObjectFromProConfigValBLL.get(ShortRegisterSettlementReportConfigurationDTO.IS_SHORT_NUMBER_COLUMN_DISPLAY);
			isShortUserColumnDisplay			= (String) valueObjectFromProConfigValBLL.get(ShortRegisterSettlementReportConfigurationDTO.IS_SHORT_USER_COLUMN_DISPLAY);
			isSettlementDateColumnDisplay		= (String) valueObjectFromProConfigValBLL.get(ShortRegisterSettlementReportConfigurationDTO.IS_SETTLEMENT_DATE_COLUMN_DISPLAY);
			isSettlementNumberColumnDisplay		= (String) valueObjectFromProConfigValBLL.get(ShortRegisterSettlementReportConfigurationDTO.IS_SETTLEMENT_NUMBER_COLUMN_DISPLAY);
			isSettlementBranchColumnDisplay		= (String) valueObjectFromProConfigValBLL.get(ShortRegisterSettlementReportConfigurationDTO.IS_SETTLEMENT_BRANCH_COLUMN_DISPLAY);
			isSettlementUserColumnDisplay		= (String) valueObjectFromProConfigValBLL.get(ShortRegisterSettlementReportConfigurationDTO.IS_SETTLEMENT_USER_COLUMN_DISPLAY);
			isSettlementTypeColumnDisplay		= (String) valueObjectFromProConfigValBLL.get(ShortRegisterSettlementReportConfigurationDTO.IS_SETTLEMENT_TYPE_COLUMN_DISPLAY);
			isExcessSettlementDetailsDisplay	= (String) valueObjectFromProConfigValBLL.get(ShortRegisterSettlementReportConfigurationDTO.IS_EXCESS_SETTLEMENT_DETAILS_DISPLAY);
			isClaimSettlementDetailsDisplay		= (String) valueObjectFromProConfigValBLL.get(ShortRegisterSettlementReportConfigurationDTO.IS_CLAIM_SETTLEMENT_DETAILS_DISPLAY);
			isNoclaimSettlementDetailsDisplay	= (String) valueObjectFromProConfigValBLL.get(ShortRegisterSettlementReportConfigurationDTO.IS_NOCLAIM_SETTLEMENT_DETAILS_DISPLAY);
			isShortArticleDetailsDisplay		= (String) valueObjectFromProConfigValBLL.get(ShortRegisterSettlementReportConfigurationDTO.IS_SHORT_ARTICLE_DETAILS_DISPLAY);
			isExcessArticleDetailsDisplay		= (String) valueObjectFromProConfigValBLL.get(ShortRegisterSettlementReportConfigurationDTO.IS_EXCESS_ARTICLE_DETAILS_DISPLAY);
			isExcelButtonDisplay				= (String) valueObjectFromProConfigValBLL.get(ShortRegisterSettlementReportConfigurationDTO.IS_EXCEL_BUTTON_DISPLAY);
			isLaserPrintAllow					= (String) valueObjectFromProConfigValBLL.get(ShortRegisterSettlementReportConfigurationDTO.IS_LASER_PRINT_ALLOW);
			isPlainPrintAllow					= (String) valueObjectFromProConfigValBLL.get(ShortRegisterSettlementReportConfigurationDTO.IS_PLAIN_PRINT_ALLOW);

			outJsonObject.put("isLrNumberColumnDisplay", isLrNumberColumnDisplay);
			outJsonObject.put("isShortDateColumnDisplay", isShortDateColumnDisplay);
			outJsonObject.put("isShortBranchColumnDisplay", isShortBranchColumnDisplay);
			outJsonObject.put("isShortNumberColumnDisplay", isShortNumberColumnDisplay);
			outJsonObject.put("isShortUserColumnDisplay", isShortUserColumnDisplay);
			outJsonObject.put("isSettlementDateColumnDisplay", isSettlementDateColumnDisplay);
			outJsonObject.put("isSettlementNumberColumnDisplay", isSettlementNumberColumnDisplay);
			outJsonObject.put("isSettlementBranchColumnDisplay", isSettlementBranchColumnDisplay);
			outJsonObject.put("isSettlementUserColumnDisplay", isSettlementUserColumnDisplay);
			outJsonObject.put("isSettlementTypeColumnDisplay", isSettlementTypeColumnDisplay);
			outJsonObject.put("isExcessSettlementDetailsDisplay", isExcessSettlementDetailsDisplay);
			outJsonObject.put("isClaimSettlementDetailsDisplay", isClaimSettlementDetailsDisplay);
			outJsonObject.put("isNoclaimSettlementDetailsDisplay", isNoclaimSettlementDetailsDisplay);
			outJsonObject.put("isShortArticleDetailsDisplay", isShortArticleDetailsDisplay);
			outJsonObject.put("isExcessArticleDetailsDisplay", isExcessArticleDetailsDisplay);
			outJsonObject.put("isExcelButtonDisplay", isExcelButtonDisplay);
			outJsonObject.put("isLaserPrintAllow", isLaserPrintAllow);
			outJsonObject.put("isPlainPrintAllow", isPlainPrintAllow);

			outJsonObject.put("fromDate", sdf1.format(fromDate));
			outJsonObject.put("toDate", sdf1.format(toDate));
			outJsonObject.put("selectedBranch", executive.getBranchName());
			outJsonObject.put("selectedRegion", executive.getRegionName());
			outJsonObject.put("selectedSubRegion", executive.getSubRegionName());

			out.println(outJsonObject);
		} catch (Exception e) {
			e.printStackTrace();
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, "error = "+e.getMessage());
		} finally {
			out.flush();
			out.close();
			out							= null;
			getJsonObject				= null;
			outJsonObject				= null;
			executive					= null;
			sdf							= null;
			fromDate					= null;
			toDate						= null;
			valueObjectToBLL			= null;
			shortSettlementBLL			= null;
			valueObjectFromBLL			= null;
			excessReceiveList			= null;
			claimEntryList				= null;
			shSettlementReportList		= null;
			excessReceiveHM				= null;
			valueObjExcessReceiveArray 	= null;
			valueObjectOfClaimArray		= null;
			newExcessReceiveHM			= null;
			claimEntryHM				= null;
			newClaimEntryHM				= null;
			shortArtHM					= null;
			shoArticlesList				= null;
			valueObjectOfShortArtArray	= null;
			newShortArtHM				= null;
			commonFun					= null;
			sdf1						= null;
		}
	}
}
