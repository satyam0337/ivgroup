package com.ivcargo.reports;

import java.sql.Timestamp;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.bll.impl.properties.DisplayDataConfigurationBllImpl;
import com.iv.dto.constant.ExecutiveTypeConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.dto.constant.WayBillStatusConstant;
import com.iv.properties.constant.DisplayDataWithinDateRangePropertiesConstant;
import com.iv.properties.constant.report.DeliveryStockConfigurationConstant;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.constant.Constant;
import com.iv.utils.constant.DateTimeFormatConstant;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.ConsignmentSummaryDao;
import com.platform.dao.CustomerDetailsDao;
import com.platform.dao.ExecutiveDao;
import com.platform.dao.WayBillDeliveryChargesDao;
import com.platform.dao.reports.DeliveredStockActionDAO;
import com.platform.dto.Branch;
import com.platform.dto.ChargeTypeMaster;
import com.platform.dto.Executive;
import com.platform.dto.SubRegion;
import com.platform.dto.WayBillType;
import com.platform.dto.constant.PaymentTypeConstant;
import com.platform.dto.model.DeliveredStockReportModel;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

public class DeliveredStocReportAction implements Action {

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {

		HashMap<String,Object>	 						error					 							= null;
		Executive[] 									execs					     						= null;
		String											srcBranches											= null;
		String 											destBranches				 						= null;
		String											wayBillIdsForGroupSharingCharges				 	= null;
		DeliveredStockReportModel[]						reportModel						       				= null;
		HashMap<Long,Double>							groupSharingChargesMap		 						= null;
		HashMap<Long, Executive> 						executiveHashMap									= null;
		Long[]											executiveIdsArr										= null;
		String											executiveIdsStr 									= null;
		String											srcBranchesBuilder									= null;
		String											destBranchesBuilder									= null;
		Branch											branch		 			                    		= null;
		Branch											destbranches 			                    		= null;
		ValueObject						           		subRegionForGroup 		                    		= null;
		ValueObject						            	branchesColl			                   			= null;
		Branch[]										destinationbranches 			                    = null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			// call Initialisation Class
			new InitializeDeliveredReportAction().execute(request, response);

			final var	executive         	= (Executive) request.getSession().getAttribute("executive");
			final var	fromDate	= DateTimeUtility.getStartOfDayTimeStamp(JSPUtility.GetString(request, "fromDate"));
			final var	toDate		= DateTimeUtility.getEndOfDayTimeStamp(JSPUtility.GetString(request, "toDate"));
			final var	cache 				= new CacheManip(request);
			var	valueObjOut			= new ValueObject();
			final var	createDate 			= DateTimeUtility.getCurrentTimeStamp();
			var branchId    		= JSPUtility.GetLong(request, "SelectDestBranch", 0);
			var executiveId 		= JSPUtility.GetLong(request, "Executive", 0);
			var destCityId    		= JSPUtility.GetLong(request, "TosubRegion", 0);
			final var sourceCityId 		= JSPUtility.GetLong(request, "subRegion", 0);
			final var sourceBranchId 	= JSPUtility.GetLong(request, "branch", 0);
			final var accountGroupId 	= executive.getAccountGroupId();
			short filter			= 0;

			var	branches = cache.getBothTypeOfBranchesDetails(request, ""+executive.getAccountGroupId(), ""+sourceCityId);
			request.setAttribute("srcBranches", branches);
			//Get all Branches
			branches = cache.getBothTypeOfBranchesDetails(request, ""+executive.getAccountGroupId(), ""+destCityId);
			request.setAttribute("branches", branches);
			//Get all executives
			execs = ExecutiveDao.getInstance().findByBranchId(branchId);
			request.setAttribute("execs", execs);
			/**
			 * Getting Branches by sub region id because in group merging for All Option it only taking
			 * current group braches.
			 * so if group merging is there he also wants to see other group lr delivered data
			 */
			final var	sourceSubRegionBranches	= cache.getBranchesBySubRegionId(request, executive.getAccountGroupId(),sourceCityId);
			final var	destinationSubRegionBranches =  cache.getBranchesBySubRegionId(request, executive.getAccountGroupId(),destCityId);
			/**
			 * converting into string seperted by comma (,)
			 */
			if(sourceSubRegionBranches!=null)
				srcBranchesBuilder	= sourceSubRegionBranches.values().stream().map(e -> e.getBranchId() + "").collect(Collectors.joining(","));

			if(destinationSubRegionBranches!=null)
				destBranchesBuilder	= destinationSubRegionBranches.values().stream().map(e -> e.getBranchId() + "").collect(Collectors.joining(","));

			if(sourceCityId == 0 && sourceBranchId == 0) {
				//sourceCity & sourceBranch both non selected
				if(executive.getExecutiveType()==ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN) {
					//DestCity are always selected
					if(branchId == 0) {
						//DestBranch is non selected
						destBranches = srcBranchesBuilder;
						filter = 1;
					} else {
						//DestBranch is selected
						destBranches = ""+branchId;
						if(executiveId == 0)
							//executive is non selected
							filter = 1;
					}
				} else if (executive.getExecutiveType()==ExecutiveTypeConstant.EXECUTIVE_TYPE_BRANCHADMIN) {
					destCityId 	= executive.getSubRegionId();
					branchId	= executive.getBranchId();
					destBranches = ""+branchId;
					if(executiveId == 0)
						//executive is non selected
						filter = 1;
				} else {
					destCityId 	= executive.getSubRegionId();
					branchId	= executive.getBranchId();
					executiveId = executive.getExecutiveId();
					destBranches = ""+branchId;

					filter = 2;
				}

			} else {
				if(sourceCityId != 0 && sourceBranchId == 0)
					//sourceCity is selected & sourceBranch is non selected
					srcBranches =  srcBranchesBuilder;
				else
					srcBranches = ""+sourceBranchId;

				if(executive.getExecutiveType()==ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN) {
					//DestCity are always selected
					if(branchId == 0) {
						//DestBranch is non selected
						destBranches = destBranchesBuilder;
						filter = 3;
					} else {
						//DestBranch is selected
						destBranches = ""+branchId;

						if(executiveId == 0)
							//executive is non selected
							filter = 3;
					}
				} else if (executive.getExecutiveType()==ExecutiveTypeConstant.EXECUTIVE_TYPE_BRANCHADMIN) {
					destCityId 	= executive.getSubRegionId();
					branchId	= executive.getBranchId();
					destBranches = ""+branchId;

					if(executiveId == 0)
						//executive is non selected
						filter = 3;
				} else {
					destCityId 	= executive.getSubRegionId();
					branchId	= executive.getBranchId();
					executiveId = executive.getExecutiveId();
					destBranches = ""+branchId;
					filter = 4;
				}
			}

			if(sourceCityId > 0 ) {
				branches = cache.getBranchesArrayBySubRegionId(request, executive.getAccountGroupId(), sourceCityId);
				request.setAttribute("branches", branches);
			}

			if(destCityId > 0){
				destinationbranches = cache.getBranchesArrayBySubRegionId(request, executive.getAccountGroupId(), destCityId);
				request.setAttribute("destBranches", destinationbranches);
			}

			valueObjOut = DeliveredStockActionDAO.getInstance().callReportSP(filter, fromDate, toDate, accountGroupId, executiveId, srcBranches, destBranches);

			if(valueObjOut != null){
				reportModel = (DeliveredStockReportModel[])valueObjOut.get("DeliveredStockReportModel");

				executiveIdsArr = (Long[])valueObjOut.get("ExecIdsArr");
				executiveIdsStr	= Utility.GetLongArrayToString(executiveIdsArr);
				executiveHashMap	= ExecutiveDao.getInstance().getExecutiveDetailsByExecutiveIds(executiveIdsStr);
				valueObjOut.put("citiesColl", cache.getAllSubRegions(request));
				valueObjOut.put("branchesColl", cache.getGenericBranchesDetail(request));

				subRegionForGroup		= (ValueObject)valueObjOut.get("citiesColl");
				branchesColl			= (ValueObject)valueObjOut.get("branchesColl");
			}

			final var	displayDataConfig						= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.DISPLAY_DATA_CONFIGURATION);
			final var	deliveryStockDataConfig					= ReadAllConfigurationsBllImpl.getInstance().getOldReportConfigurationData(ReportIdentifierConstant.DELIVERED_STOCK_REPORT, executive.getAccountGroupId());

			final var	isDonotShowWayBillTypeWiseData			= (boolean) displayDataConfig.getOrDefault(DisplayDataWithinDateRangePropertiesConstant.DO_NOT_SHOW_LR_TYPE_WISE_DATA_IN_REPORTS, false);
			final var	showBookingAmountCol					= deliveryStockDataConfig.getBoolean(DeliveryStockConfigurationConstant.SHOW_BOOKING_AMOUNT_COLUMN, false);
			final var	sortByDeliveryToId						= deliveryStockDataConfig.getBoolean(DeliveryStockConfigurationConstant.SORT_BY_DELIVERY_TO_ID, false);
			final var	sortDeliveryToId						= deliveryStockDataConfig.getString(DeliveryStockConfigurationConstant.SORT_DELIVERY_TO_ID);
			final var	showPaymentModeCol						= deliveryStockDataConfig.getBoolean(DeliveryStockConfigurationConstant.SHOW_PAYMENT_MODE_COL, false);
			final var	showRcvdDate							= deliveryStockDataConfig.getBoolean(DeliveryStockConfigurationConstant.SHOW_RECEIVED_DATE, false);
			final var	showDlvryDisc							= deliveryStockDataConfig.getBoolean(DeliveryStockConfigurationConstant.SHOW_DELIVERY_DISCOUNT, false);

			Map<Long, Timestamp> wayBillReceivedDate = null;

			if(reportModel != null) {
				final Map<Long, DeliveredStockReportModel> delivery 		= new LinkedHashMap<>();
				final Map<Long, DeliveredStockReportModel> creditDelivery 	= new LinkedHashMap<>();
				final Map<Long, DeliveredStockReportModel>	crediteDeliveredStockReportModelsListWithExpress			= new LinkedHashMap<>();
				final Map<Long, DeliveredStockReportModel>	crediteDeliveredStockReportModelsListWithoutExpress			= new LinkedHashMap<>();
				final Map<Long, DeliveredStockReportModel>	deliveredStockReportModelsListWithExpress 	                = new LinkedHashMap<>();
				final Map<Long, DeliveredStockReportModel>	deliveredStockReportModelsListWithoutExpress                = new LinkedHashMap<>();

				final var 	wayBillIds  	= Utility.GetLongArrayToString((Long[]) valueObjOut.get("WayBillIdArray"));

				final var	pkgsColl 		= ConsignmentSummaryDao.getInstance().getLimitedConsignmentDetails(wayBillIds);
				final var	consignorColl	= CustomerDetailsDao.getInstance().getConsignorDetailsByWayBillId(wayBillIds);
				final var	consigneeColl	= CustomerDetailsDao.getInstance().getConsigneeDetailsByWayBillId(wayBillIds);

				//Condition For Group Sharing Charges. SRS should Not see Receipt Charge Of Southern
				final var	wayBillIdsForGroupSharingChargesArr = (Long[])valueObjOut.get("wayBillIdsForGroupSharingChargesArr");

				if(wayBillIdsForGroupSharingChargesArr != null){
					wayBillIdsForGroupSharingCharges 	= Utility.GetLongArrayToString(wayBillIdsForGroupSharingChargesArr);
					groupSharingChargesMap 				= WayBillDeliveryChargesDao.getInstance().getWayBillChargeMapByWayBillIdsAndChargeMasterId(wayBillIdsForGroupSharingCharges,ChargeTypeMaster.RECEIPT);
				}

				if (showRcvdDate)
					wayBillReceivedDate = DeliveredStockActionDAO.getInstance().getWayBillReceivedDate(wayBillIds, destCityId);

				for (final DeliveredStockReportModel element : reportModel) {
					if (isDonotShowWayBillTypeWiseData) {
						final Map<Object, Object> inHM	= new HashMap<>();
						inHM.put(Constant.CURRENT_DATE, createDate);
						inHM.put(Constant.WAY_BILL_TYPE_ID, element.getWayBillTypeId());
						inHM.put(Constant.SOURCE_BRANCH_ID, element.getWayBillSourceBranchId());
						inHM.put(Constant.BOOKING_DATE, element.getCreationDateTimeStamp());
						inHM.put(Constant.EXECUTIVE_ID, executive.getExecutiveId());
						inHM.put(Constant.IS_SHOW_WAYBILL, element.isShowWayBill());

						if(!DisplayDataConfigurationBllImpl.getInstance().isDisplayLRTypeWiseData(displayDataConfig, inHM))
							continue;
					}

					//Condition For Group Sharing Charges. SRS should Not see Receipt Charge Of Southern
					if(groupSharingChargesMap != null && groupSharingChargesMap.get(element.getWayBillId()) != null) {
						element.setDeliveryAmount(element.getDeliveryAmount() - groupSharingChargesMap.get(element.getWayBillId()));
						element.setGrandTotal(element.getGrandTotal() - groupSharingChargesMap.get(element.getWayBillId()));
					}

					branch 		 = (Branch)branchesColl.get(element.getWayBillSourceBranchId()+"");
					destbranches = (Branch)branchesColl.get(element.getWayBillDestinationBranchId()+"");

					element.setNoOfPackages(pkgsColl.get(element.getWayBillId()).getQuantity());
					element.setDeliveryTo(pkgsColl.get(element.getWayBillId()).getDeliveryTo());
					element.setConsignorName(consignorColl.get(element.getWayBillId()).getName());
					element.setConsigneeName(consigneeColl.get(element.getWayBillId()).getName());
					element.setBookedBy(executiveHashMap.get(element.getExecutiveId()).getName());
					element.setWayBillSourceSubRegion(((SubRegion)subRegionForGroup.get(branch.getSubRegionId())).getName());
					element.setWayBillSourceBranch(cache.getGenericBranchDetailCache(request, element.getWayBillSourceBranchId()).getName());
					element.setWayBillDestinationSubRegion(((SubRegion)subRegionForGroup.get(destbranches.getSubRegionId())).getName());
					element.setWayBillDestinationBranch(cache.getGenericBranchDetailCache(request, element.getWayBillDestinationBranchId()).getName());

					if(element.isManual())
						element.setWayBillType(cache.getWayBillTypeById(request, element.getWayBillTypeId()).getWayBillType()+WayBillType.WAYBILL_TYPE_MANUAL);
					else
						element.setWayBillType(cache.getWayBillTypeById(request, element.getWayBillTypeId()).getWayBillType());

					if(element.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DELIVERED)
						delivery.put(element.getWayBillId(), element);
					else
						creditDelivery.put(element.getWayBillId(), element);

					if (wayBillReceivedDate != null && !wayBillReceivedDate.isEmpty() && wayBillReceivedDate.get(element.getWayBillId()) != null)
						element.setReceivedDateTimeStr(DateTimeUtility.getDateFromTimeStamp(wayBillReceivedDate.get(element.getWayBillId())));

					element.setDeliveryDateString(DateTimeUtility.getDateFromTimeStamp(element.getCreationDateTimeStamp(), DateTimeFormatConstant.DD_MM_YY));
					element.setPaymentTypeName(PaymentTypeConstant.getPaymentType(element.getPaymentTypeId()));
				}

				if(sortByDeliveryToId){
					for (final DeliveredStockReportModel element : reportModel)
						if(element.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DELIVERED) {
							if(element.getDeliveryTo() == Short.parseShort(sortDeliveryToId))
								deliveredStockReportModelsListWithExpress.put(element.getWayBillId(), element);
							else
								deliveredStockReportModelsListWithoutExpress.put(element.getWayBillId(), element);
						} else if(element.getDeliveryTo() == Short.parseShort(sortDeliveryToId))
							crediteDeliveredStockReportModelsListWithExpress.put(element.getWayBillId(), element);
						else
							crediteDeliveredStockReportModelsListWithoutExpress.put(element.getWayBillId(), element);

					deliveredStockReportModelsListWithExpress.putAll(deliveredStockReportModelsListWithoutExpress);
					crediteDeliveredStockReportModelsListWithExpress.putAll(crediteDeliveredStockReportModelsListWithoutExpress);
				}

				if(deliveredStockReportModelsListWithExpress != null && deliveredStockReportModelsListWithExpress.size() > 0)
					request.setAttribute("delivery", deliveredStockReportModelsListWithExpress);
				else
					request.setAttribute("delivery", delivery);

				if(crediteDeliveredStockReportModelsListWithExpress != null && crediteDeliveredStockReportModelsListWithExpress.size() > 0)
					request.setAttribute("creditDelivery", crediteDeliveredStockReportModelsListWithExpress);
				else
					request.setAttribute("creditDelivery", creditDelivery);

				request.setAttribute("sortByDeliveryToId", sortByDeliveryToId);
				request.setAttribute("showBookingAmountCol", showBookingAmountCol);
				request.setAttribute("showPaymentModeCol", showPaymentModeCol);
				request.setAttribute(DeliveryStockConfigurationConstant.SHOW_RECEIVED_DATE, showRcvdDate);
				request.setAttribute(DeliveryStockConfigurationConstant.SHOW_DELIVERY_DISCOUNT, showDlvryDisc);

				ActionStaticUtil.setReportViewModel(request);
			}else {
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}

			request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}
}
