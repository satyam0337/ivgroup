package com.ivcargo.reports;

import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.ObjectUtils;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.bll.impl.reports.collection.BranchWiseChargeCollectionReportBllImpl;
import com.iv.constant.properties.report.BranchWiseChargeCollectionReportConfigurationConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.dto.model.reports.collection.BranchWiseChargeCollectionReportModel;
import com.iv.properties.constant.DisplayDataWithinDateRangePropertiesConstant;
import com.iv.utils.constant.Constant;
import com.iv.utils.message.Message;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.TransportCommonMaster;
import com.platform.resource.CargoErrorList;

public class BranchWiseChargeCollectionReportAction implements Action {

	@SuppressWarnings("unchecked")
	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	error 	= null;
		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeBranchWiseChargeCollectionReportAction().execute(request, response);

			final var	cache		  = new CacheManip(request);
			final var	executive 	  = cache.getExecutive(request);
			final var	fromDate	  = ActionStaticUtil.getFromToDate(request, ActionStaticUtil.FROMDATE, ActionStaticUtil.FROMTIME);
			final var	toDate		  = ActionStaticUtil.getFromToDate(request, ActionStaticUtil.TODATE, ActionStaticUtil.TOTIME);
			final var	inValueObject = new HashMap<>();

			final var	configuration		= (Map<Object, Object>) request.getAttribute("configuration");
			final var 	subRegion 			= JSPUtility.GetLong(request, "subRegion", 0);
			final var 	toSubRegion 		= JSPUtility.GetLong(request, "TosubRegion", 0);
			final var	sourceBrachId		= JSPUtility.GetLong(request, "branch", 0);
			final var	destinationBranchId	= JSPUtility.GetLong(request, "SelectDestBranch", 0);

			final var customErrorOnOtherBranchDetailSearch	= (boolean)configuration.getOrDefault(BranchWiseChargeCollectionReportConfigurationConstant.CUSTOM_ERROR_ON_OTHER_BRANCH_DETAIL_SEARCH, false);

			inValueObject.put("bookingCharges", JSPUtility.GetString(request, "bookingCharges" ,""));
			inValueObject.put("deliveryCharges", JSPUtility.GetString(request, "deliveryCharges" ,""));
			inValueObject.put("fromDate", fromDate);
			inValueObject.put("toDate", toDate);
			inValueObject.put("branchesColl", cache.getGenericBranchesDetail(request));
			inValueObject.put("chargeTypeMaster", cache.getChargeTypeMasterData(request));
			inValueObject.put(DisplayDataWithinDateRangePropertiesConstant.DISPLAY_DATA_CONFIGURATION_CONSTANT, cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.DISPLAY_DATA_CONFIGURATION));
			inValueObject.put("configuration", configuration);
			inValueObject.put(Constant.WAY_BILL_TYPE_ID, JSPUtility.GetLong(request, "wayBillType" ,0));
			inValueObject.put("accountGroupId", executive.getAccountGroupId());
			inValueObject.put("TosubRegion", toSubRegion);
			inValueObject.put("selectDestBranch", destinationBranchId);
			inValueObject.put(Constant.EXECUTIVE_ID, executive.getExecutiveId());
			inValueObject.put("execFldPermissionsHM", cache.getExecutiveFieldPermission(request));

			short selectionType	= 0;

			if((boolean) configuration.getOrDefault(BranchWiseChargeCollectionReportConfigurationConstant.SHOW_SELECTION_FOR_INCOMING_OUTGOING, false))
				selectionType	= JSPUtility.GetShort(request, "selectType", (short) 0);
			else
				selectionType	= BranchWiseChargeCollectionReportModel.OUTGOING_ID;

			inValueObject.put("selectType", selectionType);

			if((boolean) configuration.getOrDefault(BranchWiseChargeCollectionReportConfigurationConstant.SHOW_BRANCH_SELECTION_PANEL, false)) {
				if(selectionType > 0 && selectionType == 1)
					getSourceDestinationBranches(request, inValueObject, destinationBranchId, toSubRegion, sourceBrachId, subRegion);
				else
					getSourceDestinationBranches(request, inValueObject, sourceBrachId, subRegion, destinationBranchId, toSubRegion);
			} else
				inValueObject.put("srcBranches", cache.getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_GROUP, 0));

			if(toSubRegion > 0)
				request.setAttribute("destBranches", cache.getBranchesArrayBySubRegionId(request, executive.getAccountGroupId(), toSubRegion));

			if(subRegion > 0)
				request.setAttribute("branches", cache.getBranchesArrayBySubRegionId(request, executive.getAccountGroupId(), subRegion));

			request.setAttribute("subRegion", subRegion);
			request.setAttribute("branch", sourceBrachId);
			request.setAttribute("selectDestBranch", destinationBranchId);
			request.setAttribute("toSubRegion", toSubRegion);
			request.setAttribute("selectionType", selectionType);

			final var	branchWiseChargeCollectionReportMap = BranchWiseChargeCollectionReportBllImpl.getInstance().getBranchWiseChargeCollectionData(inValueObject);

			if(ObjectUtils.isEmpty(branchWiseChargeCollectionReportMap)) {
				ActionStaticUtil.setRequestAttribute(request, ActionStaticUtil.NO_RECORDS_FOUND, true);
				return;
			}

			if(ObjectUtils.isNotEmpty(branchWiseChargeCollectionReportMap) && branchWiseChargeCollectionReportMap.containsKey(Message.MESSAGE)) {
				if(customErrorOnOtherBranchDetailSearch){
					error.put("errorCode", CargoErrorList.OTHER_BRANCH_REPORT_DATA_SEARCH_ERROR);
					if(sourceBrachId > 0)
						error.put("errorDescription", "Kindly Contact Source Branch For Report");
					else
						error.put("errorDescription", "Kindly Contact Respective Branches For Report");
				}else {
					error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
					error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				}

				request.setAttribute("cargoError", error);
				return;
			}



			ActionStaticUtil.setRequestAttribute(request, "branchWiseChargeCollectionReportMap", branchWiseChargeCollectionReportMap);
			ActionStaticUtil.setReportViewModel(request);
			ActionStaticUtil.setNextPageToken(request, ActionStaticUtil.SUCCESS);
		} catch (final Exception _e) {
			ActionStaticUtil.catchActionException(request, _e, error);
		}
	}

	private void getSourceDestinationBranches(final HttpServletRequest request, final Map<Object, Object> valueObjectIn, final long sourceBrachId, final long sourceSubRegionId, final long destinationBranchId, final long destinationSubRegionId) {
		String				srcBranches		= null;
		String				destBranches	= null;

		try {
			final var	cManip 			= new CacheManip(request);
			final var	executive		= cManip.getExecutive(request);

			if(sourceBrachId > 0)
				srcBranches = Long.toString(sourceBrachId);//With Source Branch , No Dest Branch
			else if(sourceSubRegionId > 0)
				srcBranches = cManip.getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_SUBREGION, sourceSubRegionId);

			if(destinationBranchId > 0)
				destBranches = Long.toString(destinationBranchId);
			else if(destinationSubRegionId > 0)
				destBranches = cManip.getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_SUBREGION, destinationSubRegionId);

			valueObjectIn.put("srcBranches", srcBranches);
			valueObjectIn.put("destBranches", destBranches);
		} catch (final Exception e) {
			e.printStackTrace();
		}
	}

}