/**
 * 
 */
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

import com.businesslogic.shortexcess.ExcessReceiveSettlementBLL;
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
import com.platform.dto.configuration.report.shortexcess.ExcessRegisterSettlementReportConfigurationDTO;
import com.platform.dto.model.ReportViewModel;
import com.platform.dto.shortexcess.ExcessReceive;
import com.platform.dto.shortexcess.ExcessSettlementReport;
import com.platform.dto.shortexcess.NewFocLrDto;
import com.platform.dto.shortexcess.ShortReceive;
import com.platform.dto.shortexcess.ShortReceiveArticles;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

/**
 * @author Anant Chaudhary	20-10-2015
 *
 */
public class ExcessReceiveSettlementReportAction implements Action {

	public static final String TRACE_ID = "ExcessReceiveSettlementReportAction";
	@SuppressWarnings({ "unchecked", "unused" })
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		// TODO Auto-generated method stub
		HashMap<String,Object>							error 						= null;
		PrintWriter										out									= null;
		Executive										executive							= null;
		JSONObject										getJsonObject						= null;
		JSONObject										outJsonObject						= null;
		ValueObject										valueObjectToBLL					= null;
		ValueObject										valueObjectFromBLL					= null;
		SimpleDateFormat								sdf									= null;
		Timestamp										fromDate							= null;
		Timestamp										toDate								= null;
		long											subRegionId							= 0;
		long											branchId							= 0;
		long											regionId							= 0;
		long											excessReceiveId						= 0;
		long											shortReceiveId						= 0;
		ExcessReceiveSettlementBLL 						exSettlementBLL						= null;
		ArrayList<ExcessSettlementReport> 				excSettlementReportsList			= null;
		JSONArray 										valueObjArrayOfShortReceive 		= null;
		JSONArray										valueObjArrayOfFOCLR				= null;
		JSONArray										valueObjArrayOfShortArticle			= null;
		JSONArray										valueObjectArrayOfExcessArt			= null;
		Map<Long, JSONArray> 							newShortReceiveHM					= null;
		Map<Long, JSONArray> 							newExcessArtArrayHM					= null;
		Map<Long, JSONArray> 							focLRJsMap							= null;
		Map<Long, JSONArray> 							shArticleMap						= null;
		ArrayList<ShortReceive> 						shortReceiveList					= null;
		ArrayList<NewFocLrDto> 							newFocLrDtoList						= null;
		ArrayList<ExcessReceive> 						excessArticleList					= null;
		ArrayList<ShortReceiveArticles>					shoReceiveArticleList				= null;
		HashMap<Long, ArrayList<ShortReceive>> 			shortReceiveHM						= null;
		HashMap<Long, ArrayList<NewFocLrDto>> 			focLRHM								= null;	
		HashMap<Long, ArrayList<ShortReceiveArticles>> 	shArticleHM							= null;
		HashMap<Long, ArrayList<ExcessReceive>> 		excessArticleHM						= null;
		CommonFuctionToConvertArrayListToJSONArray		commonFun							= null;
		SimpleDateFormat								sdf1								= null;
		ReportViewModel									reportViewModel						= null;
		String											accountGroupNameForPrint			= null;
		String											branchAddress						= null;
		String											branchPhoneNumber					= null;
		ValueObject										valueObjectFromProConfigValBLL		= null;
		String											isLrNumberColumnDisplay				= null;				
		String											isExcessDateColumnDisplay			= null;
		String											isExcessBranchColumnDisplay			= null;
		String											isExcessNumberColumnDisplay			= null;
		String											isExcessUserColumnDisplay			= null;
		String											isSettlementDateColumnDisplay		= null;
		String											isSettlementNumberColumnDisplay		= null;
		String											isSettlementBranchColumnDisplay		= null;
		String											isSettlementUserColumnDisplay		= null;
		String											isSettlementTypeColumnDisplay		= null;
		String											isShortSettlementDetailsDisplay		= null;
		String											isFOCLRSettlementDetailsDisplay		= null;
		String											isUGDSettlementDetailsDisplay		= null;
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
			exSettlementBLL			= new ExcessReceiveSettlementBLL();
			outJsonObject			= new JSONObject();
			newShortReceiveHM		= new HashMap<Long, JSONArray>();
			shArticleMap			= new HashMap<Long, JSONArray>();
			focLRJsMap				= new HashMap<Long, JSONArray>();
			newExcessArtArrayHM		= new HashMap<Long, JSONArray>();
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

			valueObjectFromBLL	= exSettlementBLL.getAllExcessSettlementDataByBranch(valueObjectToBLL);

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

			excSettlementReportsList	= (ArrayList<ExcessSettlementReport>) valueObjectFromBLL.get("excSettlementReportsList");

			if(excSettlementReportsList != null && excSettlementReportsList.size() > 0) {
				outJsonObject.put("excSettlementReportsCall", commonFun.getExcessSettlementJSONArrayObject(excSettlementReportsList));

				for(int i = 0; i < excSettlementReportsList.size(); i++) {

					shortReceiveId	= excSettlementReportsList.get(i).getShortReceiveId();
					excessReceiveId	= excSettlementReportsList.get(i).getExcessReceiveId();

					excessArticleHM		= (HashMap<Long, ArrayList<ExcessReceive>>) valueObjectFromBLL.get("excessArticleHM");

					if(excessArticleHM != null && excessArticleHM.size() > 0) {
						excessArticleList	= excessArticleHM.get(excessReceiveId);

						if(excessArticleList != null && excessArticleList.size() > 0) {
							valueObjectArrayOfExcessArt		= commonFun.getExcessReceiveJSONArrayObject(excessArticleList);

							newExcessArtArrayHM.put(excessReceiveId, valueObjectArrayOfExcessArt);
						}
					}

					shortReceiveHM	= (HashMap<Long, ArrayList<ShortReceive>>) valueObjectFromBLL.get("shortReceiveHM");

					if(shortReceiveHM != null && shortReceiveHM.size() > 0) {
						if(shortReceiveId > 0) {
							shortReceiveList	= shortReceiveHM.get(shortReceiveId);

							if(shortReceiveList != null && shortReceiveList.size() > 0) {

								valueObjArrayOfShortReceive	= commonFun.getShortReceiveListJSONArrayObject(shortReceiveList);

								newShortReceiveHM.put(shortReceiveId, valueObjArrayOfShortReceive);
							}
						}
					}

					shArticleHM	= (HashMap<Long, ArrayList<ShortReceiveArticles>>) valueObjectFromBLL.get("shArticleHM");

					if(shArticleHM != null && shArticleHM.size() > 0) {
						if(shortReceiveId > 0) {
							shoReceiveArticleList	= shArticleHM.get(shortReceiveId);

							if(shoReceiveArticleList != null && shoReceiveArticleList.size() > 0) {
								valueObjArrayOfShortArticle	= commonFun.getShortReceiveArticleJSONArrayObject(shoReceiveArticleList);

								shArticleMap.put(shortReceiveId, valueObjArrayOfShortArticle);
							}
						}
					}

					focLRHM		= (HashMap<Long, ArrayList<NewFocLrDto>>) valueObjectFromBLL.get("focLRHM");

					if(excSettlementReportsList.get(i).getNewFOCWayBillId() > 0) {

						if(focLRHM != null && focLRHM.size() > 0) {
							newFocLrDtoList		= focLRHM.get(excSettlementReportsList.get(i).getNewFOCWayBillId());

							if(newFocLrDtoList != null && newFocLrDtoList.size() > 0) {
								valueObjArrayOfFOCLR	= commonFun.getNewFocLrDetailsJSONArrayObject(newFocLrDtoList);

								focLRJsMap.put(excSettlementReportsList.get(i).getNewFOCWayBillId(), valueObjArrayOfFOCLR);
							}
						}
					}
				}
			}

			if(newExcessArtArrayHM != null && newExcessArtArrayHM.size() > 0) {
				outJsonObject.put("excessReceiveHMCall", newExcessArtArrayHM);
			}

			if(newShortReceiveHM != null && newShortReceiveHM.size() > 0) {
				outJsonObject.put("shortReceiveHMCall", newShortReceiveHM);
			}

			if(shArticleMap != null && shArticleMap.size() > 0) {
				outJsonObject.put("shortArticleHMCall", shArticleMap);
			}

			if(focLRJsMap != null && focLRJsMap.size() > 0) {
				outJsonObject.put("focLRJsHMCall", focLRJsMap);
			}
			
			ActionStaticUtil.setRequestAttribute(request,"customAddressBranchId", branchId);
			ActionStaticUtil.setRequestAttribute(request,"customAddressIdentifer", CustomGroupMapper.IDENTIFIER_BOOKING);

			reportViewModel 	= new ReportViewModel();
			reportViewModel 	= ReportView.getInstance().populateReportViewModel(request, reportViewModel);

			accountGroupNameForPrint	= reportViewModel.getAccountGroupName();
			branchAddress				= reportViewModel.getBranchAddress();
			branchPhoneNumber			= reportViewModel.getBranchPhoneNumber();
			imagePath					= reportViewModel.getImagePath();
			outJsonObject.put("accountGroupNameForPrint", accountGroupNameForPrint);
			outJsonObject.put("branchAddress", branchAddress);
			outJsonObject.put("branchPhoneNumber", branchPhoneNumber);
			outJsonObject.put("imagePath", imagePath);

			valueObjectFromProConfigValBLL		= ReadAllConfigurationsBllImpl.getInstance().getOldReportConfigurationData(ReportIdentifierConstant.EXCESS_REGISTER_SETTLEMENT_REPORT, executive.getAccountGroupId());

			isLrNumberColumnDisplay				= (String) valueObjectFromProConfigValBLL.get(ExcessRegisterSettlementReportConfigurationDTO.IS_LR_NUMBER_COLUMN_DISPLAY);
			isExcessDateColumnDisplay			= (String) valueObjectFromProConfigValBLL.get(ExcessRegisterSettlementReportConfigurationDTO.IS_EXCESS_DATE_COLUMN_DISPLAY);
			isExcessNumberColumnDisplay			= (String) valueObjectFromProConfigValBLL.get(ExcessRegisterSettlementReportConfigurationDTO.IS_EXCESS_NUMBER_COLUMN_DISPLAY);
			isExcessBranchColumnDisplay			= (String) valueObjectFromProConfigValBLL.get(ExcessRegisterSettlementReportConfigurationDTO.IS_EXCESS_BRANCH_COLUMN_DISPLAY);
			isExcessUserColumnDisplay			= (String) valueObjectFromProConfigValBLL.get(ExcessRegisterSettlementReportConfigurationDTO.IS_EXCESS_USER_COLUMN_DISPLAY);
			isSettlementDateColumnDisplay		= (String) valueObjectFromProConfigValBLL.get(ExcessRegisterSettlementReportConfigurationDTO.IS_SETTLEMENT_DATE_COLUMN_DISPLAY);
			isSettlementNumberColumnDisplay		= (String) valueObjectFromProConfigValBLL.get(ExcessRegisterSettlementReportConfigurationDTO.IS_SETTLEMENT_NUMBER_COLUMN_DISPLAY);
			isSettlementBranchColumnDisplay		= (String) valueObjectFromProConfigValBLL.get(ExcessRegisterSettlementReportConfigurationDTO.IS_SETTLEMENT_BRANCH_COLUMN_DISPLAY);
			isSettlementUserColumnDisplay		= (String) valueObjectFromProConfigValBLL.get(ExcessRegisterSettlementReportConfigurationDTO.IS_SETTLEMENT_USER_COLUMN_DISPLAY);
			isSettlementTypeColumnDisplay		= (String) valueObjectFromProConfigValBLL.get(ExcessRegisterSettlementReportConfigurationDTO.IS_SETTLEMENT_TYPE_COLUMN_DISPLAY);
			isShortSettlementDetailsDisplay		= (String) valueObjectFromProConfigValBLL.get(ExcessRegisterSettlementReportConfigurationDTO.IS_SHORT_SETTLEMENT_DETAILS_DISPLAY);
			isFOCLRSettlementDetailsDisplay		= (String) valueObjectFromProConfigValBLL.get(ExcessRegisterSettlementReportConfigurationDTO.IS_FOCLR_SETTLEMENT_DETAILS_DISPLAY);
			isUGDSettlementDetailsDisplay		= (String) valueObjectFromProConfigValBLL.get(ExcessRegisterSettlementReportConfigurationDTO.IS_UGD_SETTLEMENT_DETAILS_DISPLAY);
			isShortArticleDetailsDisplay		= (String) valueObjectFromProConfigValBLL.get(ExcessRegisterSettlementReportConfigurationDTO.IS_SHORT_ARTICLE_DETAILS_DISPLAY);
			isExcessArticleDetailsDisplay		= (String) valueObjectFromProConfigValBLL.get(ExcessRegisterSettlementReportConfigurationDTO.IS_EXCESS_ARTICLE_DETAILS_DISPLAY);
			isExcelButtonDisplay				= (String) valueObjectFromProConfigValBLL.get(ExcessRegisterSettlementReportConfigurationDTO.IS_EXCEL_BUTTON_DISPLAY);
			isLaserPrintAllow					= (String) valueObjectFromProConfigValBLL.get(ExcessRegisterSettlementReportConfigurationDTO.IS_LASER_PRINT_ALLOW);
			isPlainPrintAllow					= (String) valueObjectFromProConfigValBLL.get(ExcessRegisterSettlementReportConfigurationDTO.IS_PLAIN_PRINT_ALLOW);

			outJsonObject.put("isLrNumberColumnDisplay", isLrNumberColumnDisplay);
			outJsonObject.put("isExcessDateColumnDisplay", isExcessDateColumnDisplay);
			outJsonObject.put("isExcessNumberColumnDisplay", isExcessNumberColumnDisplay);
			outJsonObject.put("isExcessBranchColumnDisplay", isExcessBranchColumnDisplay);
			outJsonObject.put("isExcessUserColumnDisplay", isExcessUserColumnDisplay);
			outJsonObject.put("isSettlementDateColumnDisplay", isSettlementDateColumnDisplay);
			outJsonObject.put("isSettlementNumberColumnDisplay", isSettlementNumberColumnDisplay);
			outJsonObject.put("isSettlementBranchColumnDisplay", isSettlementBranchColumnDisplay);
			outJsonObject.put("isSettlementUserColumnDisplay", isSettlementUserColumnDisplay);
			outJsonObject.put("isSettlementTypeColumnDisplay", isSettlementTypeColumnDisplay);
			outJsonObject.put("isShortSettlementDetailsDisplay", isShortSettlementDetailsDisplay);
			outJsonObject.put("isFOCLRSettlementDetailsDisplay", isFOCLRSettlementDetailsDisplay);
			outJsonObject.put("isUGDSettlementDetailsDisplay", isUGDSettlementDetailsDisplay);
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
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, "ERROR = "+e.getMessage());
		} finally {
			out.flush();
			out.close();
			out							= null;
			executive					= null;
			getJsonObject				= null;
			outJsonObject				= null;
			valueObjectToBLL			= null;
			valueObjectFromBLL			= null;
			sdf							= null;
			fromDate					= null;
			toDate						= null;
			exSettlementBLL				= null;
			excSettlementReportsList	= null;
			valueObjArrayOfShortReceive = null;
			valueObjArrayOfFOCLR		= null;
			valueObjArrayOfShortArticle	= null;
			valueObjectArrayOfExcessArt	= null;
			newShortReceiveHM			= null;
			newExcessArtArrayHM			= null;
			focLRJsMap					= null;
			shArticleMap				= null;
			shortReceiveList			= null;
			newFocLrDtoList				= null;
			excessArticleList			= null;
			shoReceiveArticleList		= null;
			shortReceiveHM				= null;
			focLRHM						= null;	
			shArticleHM					= null;
			excessArticleHM				= null;
			commonFun					= null;
		}
	}
}
