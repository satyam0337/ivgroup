package com.ivcargo.reports.receivable;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringUtils;

import com.businesslogic.displaydata.DisplayDataConfigurationBll;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.dto.constant.ExecutiveTypeConstant;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.properties.constant.report.ReceivedStockReportConfigurationConstant;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.reports.receivable.initialize.InitializeReceivedStockAction;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.ConsignmentSummaryDao;
import com.platform.dao.CustomerDetailsDao;
import com.platform.dao.ExecutiveDao;
import com.platform.dao.reports.ReceivedStockActionDAO;
import com.platform.dao.reports.WayBillDetailsDAO;
import com.platform.dto.AliasNameConstants;
import com.platform.dto.Branch;
import com.platform.dto.Executive;
import com.platform.dto.SubRegion;
import com.platform.dto.TransportCommonMaster;
import com.platform.dto.WayBill;
import com.platform.dto.WayBillTaxTxn;
import com.platform.dto.WayBillType;
import com.platform.dto.configuration.master.DisplayDataConfigurationDTO;
import com.platform.dto.constant.WayBillTypeConstant;
import com.platform.dto.model.CityWiseCollectionModel;
import com.platform.dto.model.ReceivedStockReportModel;
import com.platform.dto.model.WayBillDeatailsModel;
import com.platform.resource.CargoErrorList;
import com.platform.utils.PropertiesUtility;
import com.platform.utils.Utility;

public class ReceivedStockAction implements Action {

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {

		HashMap<String,Object>	 		error 						= null;
		Branch[]    					branches  					= null;
		Executive[] 					execs     					= null;
		String							srcBranches					= null;
		String							destBranches				= null;
		HashMap<Long, WayBillDeatailsModel>			wayBillDetails								 = null;
		ReceivedStockReportModel[] 					sortedReceivedStockReportModelByDeliveryToId = null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeReceivedStockAction().execute(request, response);

			final var	sdf            					= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			final var	fromDate        				= new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00").getTime());
			final var	toDate          				= new Timestamp(sdf.parse(JSPUtility.GetString(request, "toDate") + " 23:59:59").getTime());
			final var	cache 							= new CacheManip(request);
			final var	executive       				= cache.getExecutive(request);
			final var  branchId    				= JSPUtility.GetLong(request, "SelectDestBranch", 0);
			var  executiveId 				= JSPUtility.GetLong(request, "Executive", 0);
			final var  destSubRegionId  			= JSPUtility.GetLong(request, "TosubRegion", 0);
			final var  sourceSubRegionId 	= JSPUtility.GetLong(request, "subRegion", 0);
			final var  accountGroupId 		= executive.getAccountGroupId();
			short filter					= 0;
			final var	configuration					= ReadAllConfigurationsBllImpl.getInstance().getOldReportConfigurationData(ReportIdentifierConstant.RECEIVED_STOCK_REPORT, executive.getAccountGroupId());

			final var	displayColumnForPackagesReceivedDetails		= configuration.getString(ReceivedStockReportConfigurationConstant.DISPLAY_COLUMN_FOR_PACKAGES_RECEIVED_DETAILS, "false");
			final var	isDetailsRequireInOrder						= configuration.getBoolean(ReceivedStockReportConfigurationConstant.IS_DETAILS_REQUIRE_IN_ORDER);
			final var	isPakageDetailsRequire						= configuration.getBoolean(ReceivedStockReportConfigurationConstant.IS_PAKAGE_DETAILS_REQUIRE);
			final var	isDestinationRequired						= configuration.getBoolean(ReceivedStockReportConfigurationConstant.IS_DESTINATION_REQUIRED);
			final var	sourceBranchNameRequired					= configuration.getBoolean(ReceivedStockReportConfigurationConstant.SOURCE_BRANCH_NAME_REQUIRED);
			final var	sortByDeliveryToId							= configuration.getBoolean(ReceivedStockReportConfigurationConstant.SORT_BY_DELIVERY_TO_ID,false);
			final var 	sortDeliveryToId							= configuration.getShort(ReceivedStockReportConfigurationConstant.SORT_DELIVERY_TO_ID, (short) 0);
			final var	displayColumnForActualWeight                = configuration.getBoolean(ReceivedStockReportConfigurationConstant.DISPLAY_COLUMN_FOR_ACTUAL_WEIGHT);
			final var	displayColumnForChargeWeight                = configuration.getBoolean(ReceivedStockReportConfigurationConstant.DISPLAY_COLUMN_FOR_CHARGE_WEIGHT);
			final var	displayColumnForSourceBranch                = configuration.getBoolean(ReceivedStockReportConfigurationConstant.DISPLAY_COLUMN_FOR_SOURCE_BRANCH);
			//Get all Branches
			branches = cache.getBranchesArrayBySubRegionId(request, executive.getAccountGroupId(), destSubRegionId);

			request.setAttribute("destBranches", branches);

			//Get all Executive
			execs = ExecutiveDao.getInstance().findByBranchId(branchId);
			request.setAttribute("execs", execs);

			if(sourceSubRegionId != -1){ //sourceSubRegionId selected
				if(sourceSubRegionId == 0)
					srcBranches = cache.getBranchesStringById(request, executive.getAccountGroupId(),TransportCommonMaster.DATA_GROUP, 0);
				else
					srcBranches = cache.getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_SUBREGION, sourceSubRegionId);

				if(executive.getExecutiveType()==ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN) {
					if(branchId != 0)
						destBranches = Long.toString(branchId);
					else if(destSubRegionId == 0)
						destBranches = cache.getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_GROUP, 0);
					else
						destBranches = cache.getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_SUBREGION, destSubRegionId);

					filter = 2;
				} else if (executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_BRANCHADMIN || executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_EXECUTIVE) {
					destBranches 	= Long.toString(executive.getBranchId());
					filter = 2;
				} else {
					executiveId 	= executive.getExecutiveId();
					destBranches 	= Long.toString(executive.getBranchId());
					filter = 3;
				}
			}

			if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_BRANCHADMIN || executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_EXECUTIVE) {
				filter	= 2;
				//srcBranches 	= "" + executive.getBranchId();//just to avoid null checking
				destBranches 	= Long.toString(executive.getBranchId());
			}

			if(StringUtils.isEmpty(srcBranches) || StringUtils.isEmpty(destBranches)) {
				ActionStaticUtil.setRequestAttribute(request, ActionStaticUtil.NO_RECORDS_FOUND, true);
				ActionStaticUtil.setNextPageToken(request, ActionStaticUtil.SUCCESS);
				return;
			}

			final var	valueOutObject = ReceivedStockActionDAO.getInstance().getReceivedStockDataByBranchId(filter ,fromDate, toDate, accountGroupId,executiveId,srcBranches,destBranches);

			if(valueOutObject != null) {

				final HashMap<Long, HashMap<Long,CityWiseCollectionModel>> storeCityWiseToPayeeDetails = new LinkedHashMap<>();

				final var	wayBillIdArray 	= (Long[])valueOutObject.get("WayBillIdArray");
				final var	wayBillIdsStr	= Utility.GetLongArrayToString(wayBillIdArray);
				final var	pkgsColl		= ConsignmentSummaryDao.getInstance().getLimitedConsignmentDetails(wayBillIdsStr);//Get Packages Data for both Summary & Details
				final var	consignorColl 	= CustomerDetailsDao.getInstance().getConsignorDetailsByWayBillId(wayBillIdsStr);
				final var	consigneeColl 	= CustomerDetailsDao.getInstance().getConsigneeDetailsByWayBillId(wayBillIdsStr);

				if(isPakageDetailsRequire)
					wayBillDetails	= WayBillDetailsDAO.getInstance().getWayBillDetails(wayBillIdArray, false, (short)0 ,false ,WayBillTaxTxn.WAYBILL_TAX_TXN_TYPE_BOOKING ,true);

				final var	executiveIdsArr = (Long[])valueOutObject.get("ExecutiveIdsArr");
				final var	executiveIdsStr	= Utility.GetLongArrayToString(executiveIdsArr);
				final var	executiveColl	= ExecutiveDao.getInstance().getExecutiveDetailsByExecutiveIds(executiveIdsStr);

				final var	reportModel 	= (ReceivedStockReportModel[])valueOutObject.get("reportModelArr");

				final var	displayDataConfig						= cache.getDisplayDataConfiguration(request, executive.getAccountGroupId());
				final var	isDonotShowWayBillTypeWiseData			= PropertiesUtility.isAllow(displayDataConfig.getString(DisplayDataConfigurationDTO.IS_DONOT_SHOW_WAY_BILL_TYPE_WISE_DATA_IN_REPORTS, "false"));
				final var	valueObjectIn							= new ValueObject();
				final var	createDate 								= DateTimeUtility.getCurrentTimeStamp();
				final var	reportModelList							= new ArrayList<ReceivedStockReportModel>();

				final var branchesObj 	= cache.getGenericBranchesDetail(request);
				final var subRegions	= cache.getAllSubRegions(request);

				for (final ReceivedStockReportModel element : reportModel) {
					if (isDonotShowWayBillTypeWiseData) {
						valueObjectIn.put(AliasNameConstants.CURRENT_DATE_TIMESTAMP, createDate);
						valueObjectIn.put(AliasNameConstants.WAYBILL_TYPE_ID, element.getWayBillTypeId());
						valueObjectIn.put(AliasNameConstants.SOURCE_BRANCH_ID, element.getWayBillSourceBranchId());
						valueObjectIn.put(AliasNameConstants.DATE_TIMESTAMP, element.getBookedDate());
						valueObjectIn.put(AliasNameConstants.EXECUTIVE_ID, executive.getExecutiveId());
						valueObjectIn.put(AliasNameConstants.WAYBILL_STATUS_ID, WayBill.WAYBILL_STATUS_RECEIVED);
						valueObjectIn.put(AliasNameConstants.IS_SHOW_WAYBILL,element.isShowWayBill());

						if(DisplayDataConfigurationBll.getInstance().isDisplayWayBillTypeWiseData(displayDataConfig, valueObjectIn))
							continue;
					}

					if(wayBillDetails != null) {
						final var	consDetails		= wayBillDetails.get(element.getWayBillId()).getConsignmentDetails();
						final var	packageDetails	= Stream.of(consDetails).map(e -> e.getQuantity() + " " + e.getPackingTypeName()).collect(Collectors.joining(" / "));
						element.setPackageDetails(packageDetails);
					}

					element.setNoOfPackages(pkgsColl.get(element.getWayBillId()).getQuantity());
					element.setConsignorName(consignorColl.get(element.getWayBillId()).getName());
					element.setConsigneeName(consigneeColl.get(element.getWayBillId()).getName());

					if(element.getExecutiveId() > 0)
						element.setBookedBy(executiveColl.get(element.getExecutiveId()).getName());
					else
						element.setBookedBy("");

					var branch		= (Branch) branchesObj.get(Long.toString(element.getWayBillSourceBranchId()));
					var	subRegion	= (SubRegion) subRegions.get(branch.getSubRegionId());

					element.setWayBillSourceBranch(branch.getName());
					element.setWayBillSourceSubRegionId(branch.getSubRegionId());
					element.setWayBillSourceSubRegion(subRegion.getName());

					branch		= (Branch) branchesObj.get(Long.toString(element.getWayBillDestinationBranchId()));
					subRegion	= (SubRegion) subRegions.get(branch.getSubRegionId());

					element.setWayBillDestinationBranch(branch.getName());
					element.setWayBillDestinationSubRegionId(branch.getSubRegionId());
					element.setWayBillDestinationSubRegion(subRegion.getName());

					if(element.isManual())
						element.setWayBillType(cache.getWayBillTypeById(request, element.getWayBillTypeId()).getWayBillType() + WayBillType.WAYBILL_TYPE_MANUAL);
					else
						element.setWayBillType(cache.getWayBillTypeById(request, element.getWayBillTypeId()).getWayBillType());

					element.setBookingDateTimeStr(DateTimeUtility.getDateFromTimeStamp(element.getBookingDateTimeStamp(), "dd-MM-yyyy hh:mm:aa"));
					element.setReceivedDateStr(DateTimeUtility.getDateFromTimeStamp(element.getBookedDate(), "dd-MM-yyyy hh:mm:aa"));

					if(element.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY || element.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID) {
						CityWiseCollectionModel	cityWiseCollectionModel = null;

						var	cityWiseToPayeeDetails = storeCityWiseToPayeeDetails.get(element.getWayBillSourceSubRegionId());

						if(cityWiseToPayeeDetails == null) {
							cityWiseToPayeeDetails = new LinkedHashMap<>();

							cityWiseCollectionModel = cityWiseToPayeeDetails.get(element.getWayBillSourceBranchId());

							if(cityWiseCollectionModel == null) {
								cityWiseCollectionModel = new CityWiseCollectionModel();

								cityWiseCollectionModel.setBranchId(element.getWayBillSourceBranchId());
								cityWiseCollectionModel.setBranchName(element.getWayBillSourceBranch());
								cityWiseCollectionModel.setSubRegionId(element.getWayBillSourceSubRegionId());
								cityWiseCollectionModel.setSubRegionName(element.getWayBillSourceSubRegion());

								if(element.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY)
									cityWiseCollectionModel.setTotalToPayAmount(element.getGrandTotal());
								else
									cityWiseCollectionModel.setTotalPaidAmount(element.getGrandTotal());

								cityWiseCollectionModel.setTotalPackages(element.getNoOfPackages());

								cityWiseToPayeeDetails.put(element.getWayBillSourceBranchId(), cityWiseCollectionModel);
							} else {
								if(element.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY)
									cityWiseCollectionModel.setTotalToPayAmount(cityWiseCollectionModel.getTotalToPayAmount() + element.getGrandTotal());
								else
									cityWiseCollectionModel.setTotalPaidAmount(cityWiseCollectionModel.getTotalPaidAmount() + element.getGrandTotal());

								cityWiseCollectionModel.setTotalPackages(cityWiseCollectionModel.getTotalPackages() + element.getNoOfPackages());
							}

							storeCityWiseToPayeeDetails.put(element.getWayBillSourceSubRegionId() ,cityWiseToPayeeDetails);
						} else {
							cityWiseCollectionModel = cityWiseToPayeeDetails.get(element.getWayBillSourceBranchId());

							if(cityWiseCollectionModel == null) {
								cityWiseCollectionModel = new CityWiseCollectionModel();

								cityWiseCollectionModel.setBranchId(element.getWayBillSourceBranchId());
								cityWiseCollectionModel.setBranchName(element.getWayBillSourceBranch());
								cityWiseCollectionModel.setSubRegionId(element.getWayBillSourceSubRegionId());
								cityWiseCollectionModel.setSubRegionName(element.getWayBillSourceSubRegion());

								if(element.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY)
									cityWiseCollectionModel.setTotalToPayAmount(element.getGrandTotal());
								else
									cityWiseCollectionModel.setTotalPaidAmount(element.getGrandTotal());

								cityWiseCollectionModel.setTotalPackages(element.getNoOfPackages());

								cityWiseToPayeeDetails.put(element.getWayBillSourceBranchId(), cityWiseCollectionModel);
							} else {
								if(element.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY)
									cityWiseCollectionModel.setTotalToPayAmount(cityWiseCollectionModel.getTotalToPayAmount() + element.getGrandTotal());
								else
									cityWiseCollectionModel.setTotalPaidAmount(cityWiseCollectionModel.getTotalPaidAmount() + element.getGrandTotal());

								cityWiseCollectionModel.setTotalPackages(cityWiseCollectionModel.getTotalPackages() + element.getNoOfPackages());
							}
						}
					}

					reportModelList.add(element);
				}

				final var	reportModelForResponse	= new ReceivedStockReportModel[reportModelList.size()];
				reportModelList.toArray(reportModelForResponse);

				if(sortByDeliveryToId) {
					final List<ReceivedStockReportModel>	receivedStockReportModelsListWithExpress	= Stream.of(reportModel).filter(e -> e.getDeliveryToId() == sortDeliveryToId).collect(Collectors.toList());
					final List<ReceivedStockReportModel>	receivedStockReportModelsListWithoutExpress	= Stream.of(reportModel).filter(e -> e.getDeliveryToId() != sortDeliveryToId).collect(Collectors.toList());

					receivedStockReportModelsListWithExpress.addAll(receivedStockReportModelsListWithoutExpress);
					sortedReceivedStockReportModelByDeliveryToId = new ReceivedStockReportModel[receivedStockReportModelsListWithExpress.size()] ;
					receivedStockReportModelsListWithExpress.toArray(sortedReceivedStockReportModelByDeliveryToId);
				}

				if(sortedReceivedStockReportModelByDeliveryToId != null)
					request.setAttribute("report",sortedReceivedStockReportModelByDeliveryToId);
				else
					request.setAttribute("report",reportModelForResponse);

				request.setAttribute("storeCityWiseToPayeeDetails", storeCityWiseToPayeeDetails);
				request.setAttribute("sortByDeliveryToId", sortByDeliveryToId);
				request.setAttribute("isDetailsRequireInOrder", isDetailsRequireInOrder);
				request.setAttribute("isPakageDetailsRequire", isPakageDetailsRequire);
				request.setAttribute("isDestinationRequired", isDestinationRequired);
				request.setAttribute("sourceBranchNameRequired", sourceBranchNameRequired);
				request.setAttribute("displayColumnForActualWeight", displayColumnForActualWeight);
				request.setAttribute("displayColumnForChargeWeight", displayColumnForChargeWeight);
				request.setAttribute("displayColumnForSourceBranch", displayColumnForSourceBranch);
				request.setAttribute("displayColumnForPackagesReceivedDetails", displayColumnForPackagesReceivedDetails);
				request.setAttribute("displayBookingDateColumn", configuration.getBoolean(ReceivedStockReportConfigurationConstant.DISPLAY_BOOKING_DATE_COLUMN));

				ActionStaticUtil.setReportViewModel(request);
				request.setAttribute("nextPageToken", "success");
			}else{
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}
}
