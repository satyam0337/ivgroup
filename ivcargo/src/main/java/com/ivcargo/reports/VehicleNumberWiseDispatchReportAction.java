package com.ivcargo.reports;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.TimeZone;
import java.util.TreeMap;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.properties.impl.PropertyConfigValueBLLImpl;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.logsapp.LogWriter;
import com.iv.properties.constant.LoadingSheetPropertyConstant;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.ConsignmentSummaryDao;
import com.platform.dao.DispatchSummaryDao;
import com.platform.dao.WayBillBookingChargesDao;
import com.platform.dao.WayBillDao;
import com.platform.dao.reports.VehicleNumberWiseDispatchDAO;
import com.platform.dto.ChargeTypeMaster;
import com.platform.dto.ConsignmentSummary;
import com.platform.dto.ECargoConstantFile;
import com.platform.dto.Executive;
import com.platform.dto.PropertiesFileConstants;
import com.platform.dto.WayBill;
import com.platform.dto.configuration.modules.LsPrintConfigurationDTO;
import com.platform.dto.constant.WayBillTypeConstant;
import com.platform.dto.model.BusinessFunctionConstants;
import com.platform.dto.model.VehicleNumberWiseDispatchModel;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

public class VehicleNumberWiseDispatchReportAction implements Action {

	private static final String TRACE_ID = "VehicleNumberWiseDispatchReportAction";
	@Override
	@SuppressWarnings("unchecked")
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		// TODO Auto-generated method stub
		HashMap<String,Object> error 							= null;
		Executive   		executive 							= null;
		ValueObject 		objectIn 							= null;
		SimpleDateFormat 	sdf         						= null;
		Timestamp        	fromDate    						= null;
		Timestamp        	toDate      						= null;
		ValueObject			objectOut							= null;
		ValueObject			objectOutDispatchSummary			= null;
		CacheManip			cache								= null;
		ArrayList<Long>		dispatchLedgerIdsArrayList 			= null;
		WayBill				waybill								= null;
		ConsignmentSummary	consignmentSummary					= null;
		Long[] 				dispatchLedgerIdsArray 				= null;
		String				dispatchLedgerIds					= null;
		ArrayList<Long>		waybillIdsArrayList					= null;
		ArrayList<Long>		waybillIdsArrayListOfDispatchLedger	= null;
		Long[] 				waybillIdsArray 					= null;
		Long[] 				waybillIdsArrayLong 				= null;
		String				waybillIds							= null;
		HashMap<Long, ArrayList<Long>>		dispatchLedgerHM	= null;
		HashMap<Long, WayBill> 				wayBillHM			= null;
		HashMap<Long, ConsignmentSummary> 	conSumHM			= null;
		VehicleNumberWiseDispatchModel[] 	reportModel 		= null;
		TreeMap<String ,TreeMap<String ,ArrayList<VehicleNumberWiseDispatchModel>>> sourceBranchMap 	= null;
		TreeMap<String ,ArrayList<VehicleNumberWiseDispatchModel>> 					distinationBranchMap= null;
		ArrayList<VehicleNumberWiseDispatchModel> 									dataModel 			= null;
		SimpleDateFormat 															dateFormatForTimeLog= null;
		HashMap<Long,Double> chargeColl	= null;
		var	startTime   		= 0L;
		var 	waybillbookingTotal	= 0D;

		PropertyConfigValueBLLImpl	propertyConfigValueBLLImpl		= null;
		ValueObject					dispatchLsPrintConfiguration	= null;
		var						defaultDispatchPrint			= false;
		var						isLhpvLockingAfterLsCreation	= false;
		var						dispatchPrintFromOldFlow		= false;
		var						showVehicleNumberWiseDataInReverseOrderByDate						= false;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error))
				return;
			startTime = System.currentTimeMillis();
			new InitializeVehicleNumberWiseDispatchReportAction().execute(request, response);

			executive 	= (Executive) request.getSession().getAttribute("executive");

			if (executive == null) {
				ActionStaticUtil.throwInvalidSessionError(request, error);
				return;
			}

			objectIn 	= new ValueObject();
			final var 		vehicleNoId = JSPUtility.GetLong(request, "selectedVehicleNo");
			sdf         = new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			fromDate    = new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00").getTime());
			toDate = new Timestamp(sdf.parse(JSPUtility.GetString(request, "toDate") + " 23:59:59").getTime());
			objectIn.put("fromDate", fromDate);
			objectIn.put("toDate", toDate);
			objectIn.put("accountGroupId", executive.getAccountGroupId());
			objectIn.put("vehicleNoId", vehicleNoId);

			//get report Data
			objectOut = VehicleNumberWiseDispatchDAO.getInstance().getVehicleNumberWiseDispatchReport(objectIn);
			if(objectOut !=null){
				reportModel = (VehicleNumberWiseDispatchModel[])objectOut.get("reportModelArr");
				if(reportModel !=null){

					dispatchLedgerIdsArrayList=(ArrayList<Long>)objectOut.get("dispatchLedgerIdsList");
					dispatchLedgerIdsArrayList=Utility.removeLongDuplicateElementsFromArrayList(dispatchLedgerIdsArrayList);
					dispatchLedgerIdsArray	= new Long[dispatchLedgerIdsArrayList.size()];
					dispatchLedgerIdsArrayList.toArray(dispatchLedgerIdsArray);
					dispatchLedgerIds		= Utility.GetLongArrayToString(dispatchLedgerIdsArray);

					objectOutDispatchSummary= DispatchSummaryDao.getInstance().getDispatchSummaryByDispatchLedgerIds(dispatchLedgerIds);

					dispatchLedgerHM		= new HashMap<>();
					dispatchLedgerHM	  	= (HashMap<Long, ArrayList<Long>>) objectOutDispatchSummary.get("dispachLedgerWithWaybillids");
					waybillIdsArrayList 	= (ArrayList<Long>) objectOutDispatchSummary.get("waybillIdsForCreatingString");
					waybillIdsArrayList 	= Utility.removeLongDuplicateElementsFromArrayList(waybillIdsArrayList);

					waybillIdsArrayLong 	= new Long[waybillIdsArrayList.size()];
					waybillIdsArrayList.toArray(waybillIdsArrayLong);
					waybillIds				= Utility.GetLongArrayToString(waybillIdsArrayLong);

					if(waybillIds != null && !waybillIds.isEmpty()) {
						wayBillHM 				= WayBillDao.getInstance().getLimitedLRDetails(waybillIds);
						conSumHM 				= ConsignmentSummaryDao.getInstance().getLimitedConsignmentDetails(waybillIds);
					}

					if(waybillIds != null && !waybillIds.isEmpty() &&
							executive.getAccountGroupId() == ECargoConstantFile.ACCOUNTGORUPID_CHINTAMANI_TRAVELS)
						chargeColl	= WayBillBookingChargesDao.getInstance().getWayBillChargeMapByWayBillIdsAndChargeMasterId(waybillIds,ChargeTypeMaster.FREIGHT);

					cache						= new CacheManip(request);
					propertyConfigValueBLLImpl	= new PropertyConfigValueBLLImpl();

					dispatchLsPrintConfiguration	= propertyConfigValueBLLImpl.getConfiguration(executive, PropertiesFileConstants.LS_PRINT_LOAD_CONFIG);

					defaultDispatchPrint			= dispatchLsPrintConfiguration.getBoolean(LsPrintConfigurationDTO.DEFAULT_DISPATCH_PRINT, false);
					dispatchPrintFromOldFlow		= dispatchLsPrintConfiguration.getBoolean(LsPrintConfigurationDTO.DISPATCH_PRINT_FROM_OLD_FLOW, false);

					final var 	lsPropertyConfig		= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.DISPATCH);
					isLhpvLockingAfterLsCreation		= (boolean) lsPropertyConfig.getOrDefault(LoadingSheetPropertyConstant.IS_LHPV_LOCKING_AFTER_LS_CREATION, false);

					showVehicleNumberWiseDataInReverseOrderByDate		= dispatchLsPrintConfiguration.getBoolean(LsPrintConfigurationDTO.SHOW_VEHICLE_NUMBER_WISE_DATA_IN_REVERSE_ORDER_BYDATE, false);

					if(showVehicleNumberWiseDataInReverseOrderByDate) {
						final List<VehicleNumberWiseDispatchModel> list = Arrays.stream(reportModel).collect(Collectors.toList());
						list.sort(Comparator.comparing(VehicleNumberWiseDispatchModel::getTripDateTime));
						Collections.reverse(list);
						reportModel = list.stream().toArray(VehicleNumberWiseDispatchModel[] ::new);
					}

					//Dispatch Ledger Data Processing
					for (final VehicleNumberWiseDispatchModel element : reportModel) {

						//reportModel[i].setSourceCityName(cache.getCityById(request, reportModel[i].getSourceCityId()).getName());
						element.setSourceSubRegionName(cache.getGenericSubRegionById(request, element.getSourceSubRegionId()).getName());
						element.setSourceBranchName(cache.getGenericBranchDetailCache(request, element.getSourceBranchId()).getName());
						//reportModel[i].setDestinationCityName(cache.getCityById(request, reportModel[i].getDestinationCityId()).getName());
						element.setDestinationSubRegionName(cache.getGenericSubRegionById(request, element.getDestinationSubRegionId()).getName());
						element.setDestinationBranchName(cache.getGenericBranchDetailCache(request, element.getDestinationBranchId()).getName());

						waybillIdsArrayListOfDispatchLedger	= dispatchLedgerHM.get(element.getDispatchLedgerId());

						if(waybillIdsArrayListOfDispatchLedger != null) {

							waybillIdsArray	= new Long[waybillIdsArrayListOfDispatchLedger.size()];
							waybillIdsArrayListOfDispatchLedger.toArray(waybillIdsArray);

							for (final Long element2 : waybillIdsArray) {

								waybill				= wayBillHM.get(element2);
								consignmentSummary	= conSumHM.get(element2);
								waybillbookingTotal = 0;

								if(chargeColl != null) {
									if(chargeColl.get(waybill.getWayBillId()) != null)
										waybillbookingTotal = chargeColl.get(waybill.getWayBillId());
									else
										waybillbookingTotal = 0;
								} else
									waybillbookingTotal	= waybill.getBookingTotal();

								if(waybill.getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_PAID){
									element.setBookingPaidAmount(element.getBookingPaidAmount() + waybillbookingTotal);
									element.setPaidNoOfPkgs(element.getPaidNoOfPkgs() + consignmentSummary.getQuantity());
								}else if(waybill.getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_TO_PAY){
									element.setBookingToPayAmount(element.getBookingToPayAmount() + waybillbookingTotal);
									element.setToPayNoOfPkgs(element.getToPayNoOfPkgs() + consignmentSummary.getQuantity());
								}else if(waybill.getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_FOC)
									element.setFocNoOfPkgs(element.getFocNoOfPkgs() + consignmentSummary.getQuantity());
								else if(waybill.getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_CREDIT){
									element.setBookingCreditAmount(element.getBookingCreditAmount() + waybillbookingTotal);
									element.setCreditNoOfPkgs(element.getCreditNoOfPkgs() + consignmentSummary.getQuantity());
								}
								element.setNumberOfPackages(element.getNumberOfPackages() + consignmentSummary.getQuantity());
								element.setBookingTotalAmount(element.getBookingTotalAmount()+waybillbookingTotal);
							}
						}
					}

					//Creating Data For View
					sourceBranchMap = new TreeMap<>();
					for (final VehicleNumberWiseDispatchModel element : reportModel) {
						distinationBranchMap = sourceBranchMap.get(element.getSourceBranchName()+"_"+element.getSourceBranchId());
						if(distinationBranchMap == null)
							distinationBranchMap	= new TreeMap<>();
						dataModel = distinationBranchMap.get(element.getDestinationBranchName()+"_"+element.getDestinationBranchId());
						if(dataModel == null)
							dataModel=new ArrayList<>();
						dataModel.add(element);
						distinationBranchMap.put(element.getDestinationBranchName()+"_"+element.getDestinationBranchId(), dataModel);
						sourceBranchMap.put(element.getSourceBranchName()+"_"+element.getSourceBranchId(), distinationBranchMap);
					}
					request.setAttribute("reportModel",sourceBranchMap);
					request.setAttribute("defaultDispatchPrint",defaultDispatchPrint);
					request.setAttribute("isLhpvLockingAfterLsCreation",isLhpvLockingAfterLsCreation);
					request.setAttribute("dispatchPrintFromOldFlow",dispatchPrintFromOldFlow);

					/*reportViewModel =new ReportViewModel();
					reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);
					request.setAttribute("ReportViewModel",reportViewModel);*/
				}
			} else {
				LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO, (String) error.get("errorCode")+" "+(String) error.get("errorDescription"));
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}
			ActionStaticUtil.setReportViewModel(request);
			request.setAttribute("nextPageToken", "success");
			dateFormatForTimeLog =new SimpleDateFormat("mm:ss.SSS");
			dateFormatForTimeLog.setTimeZone(TimeZone.getTimeZone("GMT"));
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO,"=====Report Generated "+BusinessFunctionConstants.VEHICALNUMBERWISEDISPATCHREPORT +" "+executive.getAccountGroupId()+
					" "+executive.getBranchId()+" "+executive.getExecutiveId()+" in "+dateFormatForTimeLog.format(new Date(System.currentTimeMillis()-startTime)));
		} catch (final Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		}finally{
			error 							= null;
			executive 							= null;
			objectIn 							= null;
			sdf         						= null;
			fromDate    						= null;
			toDate      						= null;
			objectOut							= null;
			objectOutDispatchSummary			= null;
			cache								= null;
			dispatchLedgerIdsArrayList 			= null;
			waybill								= null;
			consignmentSummary					= null;
			dispatchLedgerIdsArray 				= null;
			dispatchLedgerIds					= null;
			waybillIdsArrayList					= null;
			waybillIdsArrayListOfDispatchLedger	= null;
			waybillIdsArray 					= null;
			waybillIdsArrayLong 				= null;
			waybillIds							= null;
			dispatchLedgerHM	= null;
			wayBillHM			= null;
			conSumHM			= null;
			reportModel 		= null;
			sourceBranchMap 	= null;
			distinationBranchMap= null;
			dataModel 			= null;
			dateFormatForTimeLog= null;
			chargeColl	= null;
		}
	}
}
