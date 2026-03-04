package com.ivcargo.reports;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringUtils;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.dto.constant.WayBillTypeConstant;
import com.iv.properties.constant.report.PendingDeliveryStockReportConfigurationConstant;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.ConsignmentDetailsDao;
import com.platform.dao.ConsignmentSummaryDao;
import com.platform.dao.CustomerDetailsDao;
import com.platform.dao.reports.WayBilllReportDao;
import com.platform.dto.Branch;
import com.platform.dto.ConsignmentDetails;
import com.platform.dto.CustomerDetails;
import com.platform.dto.SubRegion;
import com.platform.dto.TransportCommonMaster;
import com.platform.dto.WayBill;
import com.platform.dto.configuration.mindateselection.ReportWiseMinDateSelectionConfigurationDTO;
import com.platform.dto.constant.ExecutiveTypeConstant;
import com.platform.dto.model.PendingStockReportModel;
import com.platform.dto.model.WayBillCategoryTypeDetails;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

public class PendingStockReportAction implements Action {

	@Override
	@SuppressWarnings("unchecked")
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {

		HashMap<String,Object>						error										= null;
		CustomerDetails								consignor									= null;
		CustomerDetails								consignee									= null;
		String										srcBranchesStr								= null;
		String										destBranchesStr								= null;
		short										filter										= -1;
		PendingStockReportModel[]					sortedPendingStockReportModelByDeliveryToId	= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializePendingStockAction().execute(request, response);

			final var	cacheManip = new CacheManip(request);
			final var	executive  = cacheManip.getExecutive(request);

			final var	minDateTimeStamp	= cacheManip.getReportWiseMinDateToGetData(request, executive.getAccountGroupId(),
					ReportWiseMinDateSelectionConfigurationDTO.PENDING_DELIVERY_STOCK_REPORT_MIN_DATE_ALLOW,
					ReportWiseMinDateSelectionConfigurationDTO.PENDING_DELIVERY_STOCK_REPORT_MIN_DATE);

			final var	groupConfig						= ReadAllConfigurationsBllImpl.getInstance().getOldReportConfigurationData(ReportIdentifierConstant.PENDING_DELIVERY_STOCK_REPORT, executive.getAccountGroupId());
			final var	sortDeliveryToId				= groupConfig.getString(PendingDeliveryStockReportConfigurationConstant.SORT_DELIVERY_TO_ID);
			final var	sortByDeliveryToId				= groupConfig.getBoolean(PendingDeliveryStockReportConfigurationConstant.SORT_BY_DELIVERY_TO_ID, false);
			final var	showArticleType					= groupConfig.getBoolean(PendingDeliveryStockReportConfigurationConstant.SHOW_ARTICLE_TYPE,false);

			final var sCity			= JSPUtility.GetLong(request, "subRegion", 0);
			final var dCity			= JSPUtility.GetLong(request, "TosubRegion", executive.getSubRegionId());
			final var sBranch		= JSPUtility.GetLong(request, "branch", 0);
			final var destBranch	= JSPUtility.GetLong(request, "SelectDestBranch", executive.getBranchId());

			if(sCity > 0 && sBranch == 0)
				srcBranchesStr = cacheManip.getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_SUBREGION, sCity);
			else if(sBranch > 0)
				srcBranchesStr = Long.toString(sBranch);

			if(dCity > 0 && destBranch == 0 )
				destBranchesStr = cacheManip.getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_SUBREGION, dCity);
			else if(destBranch > 0)
				destBranchesStr = Long.toString(destBranch);

			if(executive.getExecutiveType() != ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN)
				destBranchesStr = Long.toString(executive.getBranchId());

			if(StringUtils.isEmpty(srcBranchesStr) && StringUtils.isNotEmpty(destBranchesStr))
				filter = 0;
			else if(StringUtils.isNotEmpty(srcBranchesStr) && StringUtils.isNotEmpty(destBranchesStr))
				filter = 1;
			else if(StringUtils.isNotEmpty(srcBranchesStr) && StringUtils.isEmpty(destBranchesStr))
				filter = 2;
			else if(StringUtils.isEmpty(srcBranchesStr) && StringUtils.isEmpty(destBranchesStr))
				filter = 3;

			// Checking Blank String
			if(filter == -1) {
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}

			final var	valueOutObj = WayBilllReportDao.getInstance().getPendingDeliveryStockDetails(filter, executive.getAccountGroupId(), srcBranchesStr, destBranchesStr, minDateTimeStamp);

			//Get all Branches
			final var	branches = cacheManip.getBranchesArrayBySubRegionId(request, executive.getAccountGroupId(), sCity);
			request.setAttribute("branches", branches);

			final var	destBranches = cacheManip.getBranchesArrayBySubRegionId(request, executive.getAccountGroupId(), dCity);
			request.setAttribute("destBranches", destBranches);

			request.setAttribute("agentName", executive.getName());
			request.setAttribute(PendingDeliveryStockReportConfigurationConstant.SHOW_ARTICLE_TYPE, showArticleType);

			if (valueOutObj != null) {

				final var	wayBillIdArray		= (Long[]) valueOutObj.get("WayBillIdArray");
				final var	wayBillIds			= Utility.GetLongArrayToString(wayBillIdArray);
				final var	dlvryCancelledWbs	= (HashMap<Long, WayBill>) valueOutObj.get("dlvryCancelledWbs");
				final var	reportModel			= (PendingStockReportModel[]) valueOutObj.get("ReportModelArr");

				final var	consignorHM			= CustomerDetailsDao.getInstance().getConsignorDetailsByWayBillId(wayBillIds);
				final var	consigneeHM			= CustomerDetailsDao.getInstance().getConsigneeDetailsByWayBillId(wayBillIds);
				final var	pkgsColl			= ConsignmentSummaryDao.getInstance().getNoOfPackages(wayBillIds);//Get Packages Data for both Summary & Details
				final var	conColl				= showArticleType ? ConsignmentDetailsDao.getInstance().getConsignmentDetailsArrayByWayBillIds(wayBillIds) : null;

				final var	wbCategoryTypeDetails = new HashMap<String,WayBillCategoryTypeDetails>();
				valueOutObj.put("citiesColl", cacheManip.getAllSubRegions(request));
				valueOutObj.put("branchesColl", cacheManip.getGenericBranchesDetail(request));

				final var	subRegionForGroup	= (ValueObject)valueOutObj.get("citiesColl");
				final var	branchesColl		= (ValueObject)valueOutObj.get("branchesColl");

				if(reportModel != null && reportModel.length > 0){
					for (final PendingStockReportModel element : reportModel) {
						final var	branch		 = (Branch)branchesColl.get(Long.toString(element.getWayBillSourceBranchId()));
						final var	destbranches = (Branch)branchesColl.get(Long.toString(element.getWayBillDestinationBranchId()));

						if(branch.getSubRegionId() > 0)
							element.setWayBillSourceSubRegion(((SubRegion)subRegionForGroup.get(branch.getSubRegionId())).getName());
						else
							element.setWayBillSourceSubRegion("--");

						element.setWayBillSourceBranch(cacheManip.getGenericBranchDetailCache(request, element.getWayBillSourceBranchId()).getName());

						if(destbranches.getSubRegionId() > 0)
							element.setWayBillDestinationSubRegion(((SubRegion)subRegionForGroup.get(destbranches.getSubRegionId())).getName());
						else
							element.setWayBillDestinationSubRegion("--");

						element.setWayBillDestinationBranch(cacheManip.getGenericBranchDetailCache(request, element.getWayBillDestinationBranchId()).getName());

						if(consignorHM != null)
							consignor	= consignorHM.get(element.getWayBillId());

						if(consigneeHM != null)
							consignee	= consigneeHM.get(element.getWayBillId());

						if(consignor == null) {
							element.setConsignorName("--");
							element.setConsignorPhone("--");
						} else {
							element.setConsignorName(consignor.getName());
							element.setConsignorPhone(consignor.getMobileNumber());
						}

						if(consignee == null) {
							element.setConsigneeName("--");
							element.setConsigneePhone("--");
						} else {
							element.setConsigneeName(consignee.getName());
							element.setConsigneePhone(consignee.getMobileNumber());
						}

						if(pkgsColl.get(element.getWayBillId()) != null)
							element.setNoOfPackages(pkgsColl.get(element.getWayBillId()));
						else
							element.setNoOfPackages(0);

						if(element.isManual())
							element.setWayBillType(WayBillTypeConstant.getWayBillTypeNameByWayBilTypeId(element.getWayBillTypeId()) + WayBillTypeConstant.WAYBILL_TYPE_MANUAL);
						else
							element.setWayBillType(WayBillTypeConstant.getWayBillTypeNameByWayBilTypeId(element.getWayBillTypeId()));

						element.setDeliveryAmount(element.getDeliveryAmount());
						element.setDeliveryDiscount(element.getDeliveryDiscount());
						element.setGrandTotal(element.getGrandTotal()-element.getDeliveryAmount()-element.getDeliveryDiscount());
						element.setDestinationBranchStatus(Branch.getBranchStatus(destbranches.getStatus()));

						final var parentBranch = (Branch)branchesColl.get(Long.toString(destbranches.getParentBranchId()));

						if(parentBranch != null)
							element.setDestinationBarentBranchName(parentBranch.getName());
						else
							element.setDestinationBarentBranchName("--");

						var	wayBillCategoryTypeDetails = wbCategoryTypeDetails.get(element.getWayBillType());

						if(wayBillCategoryTypeDetails == null){
							wayBillCategoryTypeDetails = new WayBillCategoryTypeDetails();

							wayBillCategoryTypeDetails.setWayBillType(element.getWayBillType());
							wayBillCategoryTypeDetails.setQuantity(element.getNoOfPackages());
							wayBillCategoryTypeDetails.setTotalAmount(element.getGrandTotal());

							wbCategoryTypeDetails.put(element.getWayBillType(), wayBillCategoryTypeDetails);
						} else {
							wayBillCategoryTypeDetails.setQuantity(wayBillCategoryTypeDetails.getQuantity() + element.getNoOfPackages());
							wayBillCategoryTypeDetails.setTotalAmount(wayBillCategoryTypeDetails.getTotalAmount() + element.getGrandTotal());
						}

						//Delivery Cancelled LRs
						if(dlvryCancelledWbs != null) {
							final var	wayBill = dlvryCancelledWbs.get(element.getWayBillId());

							if(wayBill != null)
								element.setBookedDate(wayBill.getCreationDateTimeStamp());
						}

						element.setNoOfDays(Utility.getDayDiffBetweenTwoDates(element.getBookedDate(), DateTimeUtility.getCurrentTimeStamp()));
						element.setDeliveryToId(element.getDeliveryToId());

						if (conColl != null && conColl.containsKey(element.getWayBillId())) {
							final var conArr = conColl.get(element.getWayBillId());
							element.setPackingType(Arrays.stream(conArr).filter(e -> e.getPackingTypeName() != null).map(ConsignmentDetails :: getPackingTypeName).collect(Collectors.joining(" / ")));
						}
					}

					final var	pendingStockReportModelsListWithExpress			= new ArrayList<PendingStockReportModel>();
					final var	pendingStockReportModelsListWithoutExpress		= new ArrayList<PendingStockReportModel>();

					if(sortByDeliveryToId) {
						for (final PendingStockReportModel element : reportModel)
							if(element.getDeliveryToId() == Short.parseShort(sortDeliveryToId))
								pendingStockReportModelsListWithExpress.add(element);
							else
								pendingStockReportModelsListWithoutExpress.add(element);

						pendingStockReportModelsListWithExpress.addAll(pendingStockReportModelsListWithoutExpress);
						sortedPendingStockReportModelByDeliveryToId = new PendingStockReportModel[pendingStockReportModelsListWithExpress.size()] ;
						pendingStockReportModelsListWithExpress.toArray(sortedPendingStockReportModelByDeliveryToId);
					}

					if(sortedPendingStockReportModelByDeliveryToId != null)
						request.setAttribute("PendingStockReportModel", sortedPendingStockReportModelByDeliveryToId);
					else
						request.setAttribute("PendingStockReportModel", reportModel);

					request.setAttribute("wbCategoryTypeDetails", wbCategoryTypeDetails);
					request.setAttribute("sortByDeliveryToId", sortByDeliveryToId);
				} else {
					error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
					error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
					request.setAttribute("cargoError", error);
				}
			} else {
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}

			ActionStaticUtil.setReportViewModel(request);
			request.setAttribute("nextPageToken", "success");
		} catch (final Exception _e) {
			ActionStaticUtil.catchActionException(request, _e, error);
		}
	}
}