package com.ivcargo.reports.collection;

import java.sql.Timestamp;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.reports.collection.BranchConsolidatorReportBLL;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.message.Message;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.reports.collection.initialize.InitializeBranchConsolidatorReportAction;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.Branch;
import com.platform.dto.Executive;
import com.platform.dto.configuration.report.collection.BranchConsolidatedReportConfigurationDTO;
import com.platform.dto.model.BranchConsolidatorCreditDatails;
import com.platform.dto.model.BranchConsolidatorReportModel;
import com.platform.dto.model.BranchConsolidatorToPayeeDatails;
import com.platform.dto.model.LHPVCompanyDetails;
import com.platform.resource.CargoErrorList;
/**
 * @author Anant Chaudhary	04-02-2016
 * Transfer in new Package com.ivcargo.reports.collection
 *
 */
public class BranchConsolidatorReportAction implements Action {
	@Override
	@SuppressWarnings("rawtypes")
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object> 				error 									= null;
		Executive        					executive       						= null;
		Timestamp        					fromDate        						= null;
		Timestamp        					toDate          						= null;
		Branch[]    	 					branches  								= null;
		ValueObject 						objectIn 								= null;
		ValueObject 						objectOut 								= null;
		HashMap								hashMap									= null;
		BranchConsolidatorReportModel[]		reportModel								= null;
		BranchConsolidatorToPayeeDatails	branchConsolidatorToPayeeDatails		= null;
		BranchConsolidatorCreditDatails		branchConsolidatorCreditDatails			= null;
		BranchConsolidatorToPayeeDatails	branchConsolidatorToPayeeManualDatails	= null;
		BranchConsolidatorCreditDatails		branchConsolidatorCreditManualDatails	= null;
		BranchConsolidatorReportBLL			branchConsolidatorReportBLL				= null;
		CacheManip							cache									= null;
		ValueObject							displayDataConfig						= null;
		var 			 					selectedCity    						= 0L;
		var   			 					branchId 								= 0L;
		ValueObject							configuration							= null;
		var								showCashCollectionInReport				= false;
		var								showMultiplePayment						= false;
		var								showBookingDiscount						= false;
		var								showManualBookingDiscount				= false;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeBranchConsolidatorReportAction().execute(request, response);

			cache 				= new CacheManip(request);
			executive       	= cache.getExecutive(request);

			fromDate 			= DateTimeUtility.getStartOfDayTimeStamp(JSPUtility.GetString(request, "fromDate") );
			toDate 				= DateTimeUtility.getEndOfDayTimeStamp(JSPUtility.GetString(request, "toDate"));
			branches  			= null;
			objectIn 			= new ValueObject();
			objectOut 			= new ValueObject();
			displayDataConfig	= cache.getDisplayDataConfiguration(request, executive.getAccountGroupId());

			// Get the Selected  Combo values
			if (request.getParameter("subRegion") != null)
				selectedCity  =  Long.parseLong(JSPUtility.GetString(request, "subRegion")) ;

			configuration					= ReadAllConfigurationsBllImpl.getInstance().getOldReportConfigurationData(ReportIdentifierConstant.BRANCH_CONSOLIDATED_REPORT, executive.getAccountGroupId());

			showCashCollectionInReport		= configuration.getBoolean(BranchConsolidatedReportConfigurationDTO.SHOW_CASH_COLLECTION_IN_REPORT,false);
			showMultiplePayment				= configuration.getBoolean(BranchConsolidatedReportConfigurationDTO.SHOW_MULTIPLE_PAYMENT,false);
			showBookingDiscount				= configuration.getBoolean(BranchConsolidatedReportConfigurationDTO.SHOW_BOOKING_DISCOUNT,false);
			showManualBookingDiscount		= configuration.getBoolean(BranchConsolidatedReportConfigurationDTO.SHOW_MANUAL_BOOKING_DISCOUNT,false);

			final var execFldPermissionsHM 					= cache.getExecutiveFieldPermission(request);
			final var customErrorOnOtherBranchDetailSearch	= configuration.getBoolean(BranchConsolidatedReportConfigurationDTO.CUSTOM_ERROR_ON_OTHER_BRANCH_DETAIL_SEARCH,false);
			final var locationMappingList 					= cache.getAssignedLocationsIdListByLocationIdId(request, executive.getBranchId(), executive.getAccountGroupId());
			
			//Get all Branches
			branches = cache.getBranchesArrayBySubRegionId(request, executive.getAccountGroupId(), selectedCity);
			request.setAttribute("branches", branches);

			if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_GROUPADMIN)
				branchId = JSPUtility.GetLong(request, "branch", 0);
			else if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_BRANCHADMIN || executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_EXECUTIVE || executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_LIMITED)
				branchId = executive.getBranchId();

			objectIn.put("fromDate", fromDate);
			objectIn.put("toDate", toDate);
			objectIn.put("branchId", branchId);
			objectIn.put("executive", executive);
			objectIn.put("execFldPermissionsHM", execFldPermissionsHM);
			objectIn.put("configuration", configuration);
			objectIn.put("locationMappingList", locationMappingList);

			branchConsolidatorReportBLL	= new BranchConsolidatorReportBLL();
			objectOut = branchConsolidatorReportBLL.getReportForBranch(objectIn,displayDataConfig,showCashCollectionInReport);

			if(objectOut != null && objectOut.containsKey(Message.MESSAGE)) {
				if(customErrorOnOtherBranchDetailSearch){
					error.put("errorCode", CargoErrorList.OTHER_BRANCH_REPORT_DATA_SEARCH_ERROR);
					if(branchId > 0)
						error.put("errorDescription", "Kindly Contact Source Branch For Report");
					else
						error.put("errorDescription", "Kindly Contact Respective Branches For Report");

					request.setAttribute("cargoError", error);
				}else {
					error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
					error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
					request.setAttribute("cargoError", error);
				}
				return;
			}

			reportModel 							= (BranchConsolidatorReportModel[]) objectOut.get("BranchConsolidatorReportModel");
			hashMap									= (HashMap) objectOut.get("Collection");
			branchConsolidatorToPayeeDatails		= (BranchConsolidatorToPayeeDatails) objectOut.get("branchConsolidatorToPayeeDatails");
			branchConsolidatorCreditDatails			= (BranchConsolidatorCreditDatails) objectOut.get("branchConsolidatorCreditDatails");
			branchConsolidatorToPayeeManualDatails	= (BranchConsolidatorToPayeeDatails) objectOut.get("branchConsolidatorToPayeeManualDatails");
			branchConsolidatorCreditManualDatails	= (BranchConsolidatorCreditDatails) objectOut.get("branchConsolidatorCreditManualDatails");

			if(reportModel != null) {
				request.setAttribute("BranchConsolidatorReportModel", reportModel);
				request.setAttribute("Collection", hashMap);
				request.setAttribute("showAgentCommission", objectOut.get("showAgentCommission"));
				request.setAttribute("showAgentCommissionTopay", objectOut.get("showAgentCommissionTopay"));
				request.setAttribute("branchConsolidatorToPayeeDatails", branchConsolidatorToPayeeDatails);
				request.setAttribute("branchConsolidatorCreditDatails", branchConsolidatorCreditDatails);
				request.setAttribute("branchConsolidatorToPayeeManualDatails", branchConsolidatorToPayeeManualDatails);
				request.setAttribute("branchConsolidatorCreditManualDatails", branchConsolidatorCreditManualDatails);
				request.setAttribute("showMultiplePayment", showMultiplePayment);
				request.setAttribute("showBookingDiscount", showBookingDiscount);
				request.setAttribute("showManualBookingDiscount", showManualBookingDiscount);
				ActionStaticUtil.setRequestAttribute(request,"customAddressBranchId", branchId);
				ActionStaticUtil.setRequestAttribute(request,"customAddressIdentifer", LHPVCompanyDetails.IDENTIFIER_BOOKING);
			} else {
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}

			ActionStaticUtil.setReportViewModel(request);
			request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		} finally {
			error 									= null;
			executive       						= null;
			fromDate        						= null;
			toDate          						= null;
			branches  								= null;
			objectIn 								= null;
			objectOut 								= null;
			hashMap									= null;
			reportModel								= null;
			branchConsolidatorToPayeeDatails		= null;
			branchConsolidatorCreditDatails			= null;
			branchConsolidatorToPayeeManualDatails	= null;
			branchConsolidatorCreditManualDatails	= null;
		}
	}
}