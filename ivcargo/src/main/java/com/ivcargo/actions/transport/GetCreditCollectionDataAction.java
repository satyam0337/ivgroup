package com.ivcargo.actions.transport;

import java.sql.Timestamp;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringUtils;

import com.businesslogic.CreditPaymentModuleBLL;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.reports.ReportView;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.CollectionPersonMasterDao;
import com.platform.dto.AliasNameConstants;
import com.platform.dto.Branch;
import com.platform.dto.CollectionPersonMaster;
import com.platform.dto.Executive;
import com.platform.dto.SubRegion;
import com.platform.dto.configuration.mindateselection.ModuleWiseMinDateSelectionConfigurationDTO;
import com.platform.dto.constant.ExecutiveTypeConstant;
import com.platform.dto.constant.TransCargoAccountGroupConstant;
import com.platform.dto.model.CreditWayBillTxn;
import com.platform.dto.model.ReportViewModel;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

public class GetCreditCollectionDataAction implements Action {

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	 		error 					= null;
		Executive        				executive   			= null;
		CacheManip 					    cManip 				    = null;
		SubRegion[]               		subRegionForGroup 		= null;
		HashMap<Long, Branch> 			subRegionBranches    	= null;
		ValueObject						valueInObject			= null;
		ValueObject						valueOutObject			= null;
		String							brancheIds				= null;
		CreditPaymentModuleBLL			creditPaymentModuleBLL	= null;
		CreditWayBillTxn[]				creditWayBillTxn		= null;
		short							txnTypeId				= 0;
		short							filter					= 0;
		long 							regionId    			= 0;
		long 							subRegionId    			= 0;
		long 							branchId				= 0;
		Long[]							collectionPersonIdArr	= null;
		String							strCollectionPersonIds	= null;
		List<Integer> 					customViewPageGroupList	= null;
		ReportViewModel					reportViewModel			= null;	
		Branch[]						branchArr				= null;
		short							fiterForSearch			= 0;
		long							selectedCollectionId	= 0;
		Timestamp						minDateTimeStamp		= null;
		HashMap<Long, CollectionPersonMaster> collectionPersonHM= null;

		try {

			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error)){
				return;
			}

			new InitializeCreditCollectionModule().execute(request, response);

				customViewPageGroupList = Arrays.asList(TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_JAYRAM_TRANSPORTS
						,TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_TARASVIN_TRANSPORT
						,TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_VEGA_TRANSPORT
						,TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_GKR); 

			executive   = (Executive) request.getSession().getAttribute(AliasNameConstants.EXECUTIVE);
			cManip		= new CacheManip(request);
			txnTypeId	= JSPUtility.GetShort(request, "txnType", (short)0);
			
			minDateTimeStamp		= cManip.getModuleWiseMinDateToGetData(request, executive.getAccountGroupId(), 
										ModuleWiseMinDateSelectionConfigurationDTO.CREDIT_COLLECTION_MODULE_MIN_DATE_ALLOW, 
										ModuleWiseMinDateSelectionConfigurationDTO.CREDIT_COLLECTION_MODULE_MIN_DATE);

			if(txnTypeId > 0){

				creditPaymentModuleBLL	= new CreditPaymentModuleBLL();

				if(txnTypeId == CreditWayBillTxn.TXN_TYPE_BOOKING_ID) {
					filter = 1;
				} else {
					filter = 2;
				}

				if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN) {

					regionId	= Long.parseLong(request.getParameter("region"));
					subRegionId = Long.parseLong(request.getParameter("subRegion"));
					branchId	= JSPUtility.GetLong(request, "branch", 0);

					// Get Combo values to restore
					subRegionForGroup = cManip.getSubRegionsByRegionId(request, regionId, executive.getAccountGroupId());
					subRegionBranches = cManip.getBranchesBySubRegionId(request,executive.getAccountGroupId(), subRegionId);
					request.setAttribute("subRegionForGroup", subRegionForGroup);
					request.setAttribute("subRegionBranches", subRegionBranches);

					if(branchId == 0){
						branchArr = cManip.getBranchesArrayBySubRegionId(request, executive.getAccountGroupId(), subRegionId);
						if(branchArr != null){
							brancheIds ="";
							for (Branch aBranchArr1 : branchArr) {
								brancheIds += aBranchArr1.getBranchId()+",";
							}
						}

						brancheIds = StringUtils.substring(brancheIds, 0,brancheIds.length()-1);

					}else{
						brancheIds = Long.toString(branchId);
					}
				} else if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_REGIONADMIN) {

					regionId	= executive.getRegionId();
					subRegionId = Long.parseLong(request.getParameter("subRegion"));
					branchId	= JSPUtility.GetLong(request, "branch", 0);

					// Get Combo values to restore
					subRegionForGroup = cManip.getSubRegionsByRegionId(request, regionId, executive.getAccountGroupId());
					subRegionBranches = cManip.getBranchesBySubRegionId(request,executive.getAccountGroupId(), subRegionId);
					request.setAttribute("subRegionForGroup", subRegionForGroup);
					request.setAttribute("subRegionBranches", subRegionBranches);

					if(branchId == 0){
						branchArr = cManip.getBranchesArrayBySubRegionId(request, executive.getAccountGroupId(), subRegionId);
						if(branchArr != null){
							brancheIds ="";
							for (Branch aBranchArr2 : branchArr) {
								brancheIds += aBranchArr2.getBranchId()+",";
							}
						}

						brancheIds = StringUtils.substring(brancheIds, 0,brancheIds.length()-1);

					}else{
						brancheIds = Long.toString(branchId);
					}

				} else if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_SUBREGIONADMIN) {

					regionId	= executive.getRegionId();
					subRegionId = executive.getSubRegionId();
					branchId	= JSPUtility.GetLong(request, "branch", 0);

					// Get Combo values to restore
					subRegionBranches = cManip.getBranchesBySubRegionId(request,executive.getAccountGroupId(), subRegionId);
					request.setAttribute("subRegionBranches", subRegionBranches);

					if(branchId == 0){
						branchArr = cManip.getBranchesArrayBySubRegionId(request, executive.getAccountGroupId(), subRegionId);
						if(branchArr != null){
							brancheIds ="";
							for (Branch aBranchArr : branchArr) {
								brancheIds += aBranchArr.getBranchId()+",";
							}
						}

						brancheIds = StringUtils.substring(brancheIds, 0,brancheIds.length()-1);

					}else{
						brancheIds = Long.toString(branchId);
					}
				} else {

					regionId	= executive.getRegionId();
					subRegionId = executive.getSubRegionId();
					branchId	= executive.getBranchId();

					//Set Branches String through executive object
					brancheIds	= Long.toString(executive.getBranchId());
				}
				
				fiterForSearch = 3;
				valueInObject = new ValueObject();
				valueInObject.put("filter", filter);
				valueInObject.put(AliasNameConstants.BRANCH_IDS, brancheIds);
				valueInObject.put("txnTypeId", txnTypeId);
				valueInObject.put("fiterForSearch", fiterForSearch);
				valueInObject.put("selectedCollectionId", selectedCollectionId);
				valueInObject.put(AliasNameConstants.MIN_DATE_TIMESTAMP, minDateTimeStamp);
				valueInObject.put(AliasNameConstants.ACCOUNTGROUP_ID, executive.getAccountGroupId());

				valueOutObject	= creditPaymentModuleBLL.getCreditPaymentData(valueInObject);

				if(valueOutObject != null) {

					creditWayBillTxn		= (CreditWayBillTxn[])valueOutObject.get("CreditWayBillTxn");
					collectionPersonIdArr 	= (Long[])valueOutObject.get("collectionPersonIdArr");

					if(collectionPersonIdArr.length > 0){
						strCollectionPersonIds = Utility.GetLongArrayToString(collectionPersonIdArr);
						collectionPersonHM 	= CollectionPersonMasterDao.getInstance().getCollectionPersonDetailsByIds(strCollectionPersonIds);
					}

					for (CreditWayBillTxn aCreditWayBillTxn : creditWayBillTxn) {

						if(collectionPersonHM != null && collectionPersonHM.get(aCreditWayBillTxn.getCollectionPersonId()) != null){
							aCreditWayBillTxn.setCollectionPersonName(collectionPersonHM.get(aCreditWayBillTxn.getCollectionPersonId()).getName());
						}else{
							aCreditWayBillTxn.setCollectionPersonName("--");
						}
						
						aCreditWayBillTxn.setSourceBranch(cManip.getGenericBranchDetailCache(request, aCreditWayBillTxn.getSourceBranchId()).getName());
						aCreditWayBillTxn.setDestinationBranch(cManip.getGenericBranchDetailCache(request, aCreditWayBillTxn.getDestinationBranchId()).getName());
					}

					request.setAttribute("creditWayBillTxn", creditWayBillTxn);
				} else {
					error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
					error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
					request.setAttribute("cargoError", error);
				}

			} else {
				error.put("errorCode", CargoErrorList.TRANSACTION_TYPE_MISSING);
				error.put("errorDescription", CargoErrorList.TRANSACTION_TYPE_MISSING_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}
			reportViewModel = new ReportViewModel();
			reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);
			request.setAttribute("ReportViewModel",reportViewModel);

			if(customViewPageGroupList.contains((int) executive.getAccountGroupId())){
				request.setAttribute("nextPageToken", "success_1");
			}else{
				request.setAttribute("nextPageToken", "success");
			}
		} catch (Exception _e) {
			ActionStaticUtil.catchActionException(request, _e, error);
		}
	}

}