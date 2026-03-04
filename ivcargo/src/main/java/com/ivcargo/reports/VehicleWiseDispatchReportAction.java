package com.ivcargo.reports;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.TimeZone;
import java.util.TreeMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.logsapp.LogWriter;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.reports.VehicleWiseDispatchDAO;
import com.platform.dto.Branch;
import com.platform.dto.ConsignmentSummary;
import com.platform.dto.Executive;
import com.platform.dto.TransportCommonMaster;
import com.platform.dto.WayBill;
import com.platform.dto.WayBillCharges;
import com.platform.dto.configuration.modules.VehicleWiseDispatchReportConfigurationDTO;
import com.platform.dto.constant.BookingChargeConstant;
import com.platform.dto.constant.CargoAccountGroupConstant;
import com.platform.dto.constant.WayBillTypeConstant;
import com.platform.dto.model.BusinessFunctionConstants;
import com.platform.dto.model.CityWiseVehicleDispatchModel;
import com.platform.dto.model.CityWiseVehicleDispatchReportModel;
import com.platform.dto.model.WayBillDeatailsModel;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

public class VehicleWiseDispatchReportAction implements Action {

	private static final String TRACE_ID = "VehicleWiseDispatchReportAction";
	@Override
	@SuppressWarnings("unchecked")
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		// TODO Auto-generated method stub

		HashMap<String,Object>	 												error 				= null;
		CacheManip 																cache				= null;
		Executive   															executive 			= null;
		Timestamp        														fromDate    		= null;
		Timestamp       			 											toDate      		= null;
		ValueObject 															objectIn 			= null;
		ValueObject 															objectOut 			= null;
		SimpleDateFormat 														sdf         		= null;
		CityWiseVehicleDispatchReportModel									 	vehicleModel		= null;
		CityWiseVehicleDispatchModel[] 											reportModel 		= null;
		WayBillCharges[] 														wayBillCharges 		= null;
		//Create Vehicle collection which will have DispatchLedgerId as Key and HashMap of all Vehicles used in that city
		LinkedHashMap <String,CityWiseVehicleDispatchReportModel> 				vehicleCollection	= null;
		HashMap <String , HashMap <String,CityWiseVehicleDispatchReportModel>> 	cityCollection 		= null;
		HashMap<Long, WayBillDeatailsModel> 									wayBillDetails		= null;
		HashMap <String,CityWiseVehicleDispatchReportModel>						cityWiseCollection	= null;
		CityWiseVehicleDispatchReportModel										citywiseDispatchModel = null;
		CityWiseVehicleDispatchReportModel										citywiseModel 		= null;
		TreeMap<String, CityWiseVehicleDispatchReportModel>						vehicleWiseSummarry	= null;
		HashMap<Long, ConsignmentSummary> 										conSumHM			= null;
		HashMap<Long, WayBill> 													wayBillHM			= null;
		WayBill																	wayBill				= null;
		String																	destBranches		= null;
		String																	srcBranches			= null;
		ValueObject																valueObjvechilewisReport		= null;
		var 																isShowFreightAmountInTotal 		= false;
		var 																isShowLoadingAmountColumn  		= false;
		var																	showCartageAmountColumn			= false;
		var																	showBranchSelection				= false;
		Branch[]																branches						= null;
		var																	showLSNumberColumn				= false;
		var																	displayVehicleWiseSummarry		= false;
		var																	isShowFreightAmountInTopayTotal	= false; //it is temporary based
		var																	isShowFreightAmountInTBBTotal	= false; //it is temporary based
		var																	showCartageAndOtherChargeColumn	= false;
		var 																	vehicleType						= 0L;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error))
				return;
			final var startTime = System.currentTimeMillis();
			new InitializeVehicleWiseDispatchReportAction().execute(request, response);

			executive 	= (Executive) request.getSession().getAttribute("executive");
			sdf         = new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			fromDate    = new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00").getTime());
			toDate      = new Timestamp(sdf.parse(JSPUtility.GetString(request, "toDate") + " 23:59:59").getTime());
			objectIn 	= new ValueObject();
			objectOut 	= new ValueObject();
			cache 		= new CacheManip(request);


			var sourceCityId = 0L;
			var destBranchId = 0L;
			vehicleType	= JSPUtility.GetLong(request, "vehicleType",0);

			valueObjvechilewisReport		= ReadAllConfigurationsBllImpl.getInstance().getOldReportConfigurationData(ReportIdentifierConstant.VEHICLE_WISE_DISPATCH_REPORT, executive.getAccountGroupId());
			isShowFreightAmountInTotal		= valueObjvechilewisReport.getBoolean(VehicleWiseDispatchReportConfigurationDTO.IS_SHOW_FREIGHT_AMOUNT_IN_TOTAL, false);
			isShowLoadingAmountColumn		= valueObjvechilewisReport.getBoolean(VehicleWiseDispatchReportConfigurationDTO.IS_SHOW_LOADING_AMOUNT_COLUMN, false);
			showLSNumberColumn				= valueObjvechilewisReport.getBoolean(VehicleWiseDispatchReportConfigurationDTO.SHOW_LS_NUMBER_COLUMN, false);
			showCartageAmountColumn			= valueObjvechilewisReport.getBoolean(VehicleWiseDispatchReportConfigurationDTO.SHOW_CARTAGE_AMOUNT_COLUMN, false);
			displayVehicleWiseSummarry		= valueObjvechilewisReport.getBoolean(VehicleWiseDispatchReportConfigurationDTO.DISPLAY_VEHICLE_WISE_SUMMARRY, false);
			isShowFreightAmountInTopayTotal	= valueObjvechilewisReport.getBoolean(VehicleWiseDispatchReportConfigurationDTO.IS_SHOW_FREIGHT_AMOUNT_IN_TOPAY_TOTAL, false);
			isShowFreightAmountInTBBTotal	= valueObjvechilewisReport.getBoolean(VehicleWiseDispatchReportConfigurationDTO.IS_SHOW_FREIGHT_AMOUNT_IN_TBB_TOTAL, false);
			showCartageAndOtherChargeColumn	= valueObjvechilewisReport.getBoolean(VehicleWiseDispatchReportConfigurationDTO.SHOW_CARTAGE_AND_OTHER_CHARGE_COLUMN, false);

			showBranchSelection				= valueObjvechilewisReport.getBoolean(VehicleWiseDispatchReportConfigurationDTO.SHOW_BRANCH_SELECTION,false);

			request.setAttribute(VehicleWiseDispatchReportConfigurationDTO.SHOW_BRANCH_SELECTION, showBranchSelection);
			request.setAttribute(VehicleWiseDispatchReportConfigurationDTO.SHOW_LS_NUMBER_COLUMN, showLSNumberColumn);

			var destinationCityId = JSPUtility.GetLong(request, "TosubRegion");

			if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_GROUPADMIN)
				sourceCityId  		= JSPUtility.GetLong(request, "subRegion");
			else if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_BRANCHADMIN || executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_EXECUTIVE)
				sourceCityId = executive.getSubRegionId();

			if(showBranchSelection){
				if(destinationCityId > 0 ){
					destBranchId	= JSPUtility.GetLong(request, "SelectDestBranch");
					if(destBranchId > 0)
						destBranches	= destBranchId+"";
					else
						destBranches 	= cache.getBranchesStringWithMergingBySubRegionId(request, executive.getAccountGroupId(), destinationCityId);
				} else
					destBranches = cache.getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_GROUP, destinationCityId);
			} else{
				if(destinationCityId > 0 )
					destBranches = cache.getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_SUBREGION, destinationCityId);
				else
					destBranches = cache.getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_GROUP, destinationCityId);
			}
			if(sourceCityId > 0)
				srcBranches	= cache.getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_SUBREGION, sourceCityId);
			else
				srcBranches	= cache.getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_GROUP, sourceCityId);

			objectIn.put("fromDate", fromDate);
			objectIn.put("toDate", toDate);
			objectIn.put("executive", executive);
			objectIn.put("destBranches", destBranches);
			objectIn.put("srcBranches", srcBranches);
			objectIn.put("vehicleTypeId", vehicleType);


			//get report Data
			objectOut = VehicleWiseDispatchDAO.getInstance().getCityWiseVehicleDispatchReport(objectIn);

			reportModel = (CityWiseVehicleDispatchModel[])objectOut.get("reportModelArr");
			wayBillDetails = (HashMap<Long, WayBillDeatailsModel>)objectOut.get("wayBillDetails");
			wayBillHM = (HashMap<Long, WayBill>)objectOut.get("wayBillHM");
			conSumHM = (HashMap<Long, ConsignmentSummary>)objectOut.get("conSumHM");

			if(reportModel != null && reportModel.length > 0){
				//Create City collection which will have cityId as Key and HashMap of all Vehicles used in that city
				cityCollection 	= new HashMap<>();
				//Get WayBill Details code ( Start )
				//wayBillDetails = WayBillDetailsDAO.getInstance().getWayBillDetails(wayBillIdArray ,true ,ChargeTypeMaster.WAYBILL_CHARGETYPE_BOOKING ,false ,(short)0 ,false);
				//Get WayBill Details code ( End )

				//conSumHM = ConsignmentSummaryDao.getInstance().getLimitedConsignmentDetails(wayBillIds);
				//wayBillHM= WayBillDao.getInstance().getWayBillsByWayBillIds(wayBillIds);

				for (final CityWiseVehicleDispatchModel element : reportModel) {
					wayBill = wayBillHM.get(element.getWayBillId());

					element.setSourceSubRegion(cache.getGenericSubRegionById(request, element.getSourceSubRegionId()).getName());
					element.setDestinationSubRegion(cache.getGenericSubRegionById(request, element.getDestinationSubRegionId()).getName());

					element.setWayBillTypeId(wayBill.getWayBillTypeId());
					element.setGrandTotal(wayBill.getBookingTotal());

					if(executive.getAccountGroupId()== CargoAccountGroupConstant.ACCOUNT_GROUP_ID_MULTANI_SONA_TRAVELS)
						if(element.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID && wayBill.getBookingTotal()<50)
							element.setGrandTotal(0);

					element.setAgentCommission(wayBill.getAgentCommission());
					element.setTotalPkgQuantity(conSumHM.get(element.getWayBillId()).getQuantity());

					if(element.getDestinationBranchId() != wayBill.getDestinationBranchId())
						element.setCrossing(true);
					wayBillCharges = wayBillDetails.get(element.getWayBillId()).getWayBillCharges();

					for (final WayBillCharges wayBillCharge : wayBillCharges) {
						if(wayBillCharge.getWayBillChargeMasterId() == BookingChargeConstant.LOADING)
							element.setLoadingAmount(wayBillCharge.getChargeAmount());

						if(wayBillCharge.getWayBillChargeMasterId() == BookingChargeConstant.FREIGHT)
							element.setFreightAmount(wayBillCharge.getChargeAmount());

						if(wayBillCharge.getWayBillChargeMasterId() == BookingChargeConstant.CARTAGE_CHARGE)
							element.setCartageAmount(wayBillCharge.getChargeAmount());
						if(wayBillCharge.getWayBillChargeMasterId() == BookingChargeConstant.OTHER_BOOKING)
							element.setOtherChargeAmount(wayBillCharge.getChargeAmount());


					}

					if(executive.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNT_GROUP_ID_LAVI
							|| executive.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNT_GROUP_ID_MULTANI_SONA_TRAVELS
							|| executive.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNTGORUPID_SRS_TRAVELS
							|| executive.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNT_GORUP_ID_SOUTHERN
							|| executive.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNT_GROUP_ID_BCT) {
						wayBillCharges = wayBillDetails.get(element.getWayBillId()).getWayBillCharges();

						for (final WayBillCharges wayBillCharge : wayBillCharges) {
							if(wayBillCharge.getWayBillChargeMasterId() == BookingChargeConstant.LOADING
									|| wayBillCharge.getWayBillChargeMasterId() == BookingChargeConstant.PAID_LOADING)
								element.setGrandTotal(element.getGrandTotal() - wayBillCharge.getChargeAmount());

							var commission = 0.00;
							if(wayBillCharge.getWayBillChargeMasterId() == BookingChargeConstant.FREIGHT){
								element.setFreightAmount(wayBillCharge.getChargeAmount());
								commission = wayBillCharge.getChargeAmount() * 0.3;
								element.setCommissionAmount(commission);
								element.setBalanceAmount(wayBillCharge.getChargeAmount() - commission);

								if(element.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY){
									element.setLessTopayAmount(element.getGrandTotal());
									element.setTotalAmount(wayBillCharge.getChargeAmount() - commission - element.getGrandTotal());
								} else
									element.setTotalAmount(wayBillCharge.getChargeAmount() - commission);
							}
						}
						element.setGrandTotal(element.getGrandTotal() - element.getAgentCommission());
					}

					vehicleCollection =(LinkedHashMap <String,CityWiseVehicleDispatchReportModel>) cityCollection.get(element.getSourceSubRegion());

					if(vehicleCollection!=null) {

						vehicleModel= vehicleCollection.get(""+element.getDispatchLedgerId());
						if(vehicleModel!=null) {

							if(element.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID) {
								if(isShowFreightAmountInTotal)
									vehicleModel.setTotalPaidAmount(vehicleModel.getTotalPaidAmount() + element.getFreightAmount());
								else
									vehicleModel.setTotalPaidAmount(vehicleModel.getTotalPaidAmount() + element.getGrandTotal());
								vehicleModel.setTotalPaidPkgQuantity(vehicleModel.getTotalPaidPkgQuantity()+element.getTotalPkgQuantity());
							} else if( element.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY) {
								if(isShowFreightAmountInTopayTotal || isShowFreightAmountInTotal)
									vehicleModel.setTotalToPayAmount(vehicleModel.getTotalToPayAmount() + element.getFreightAmount());
								else
									vehicleModel.setTotalToPayAmount(vehicleModel.getTotalToPayAmount() + element.getGrandTotal());

								vehicleModel.setTotalToPayPkgQuantity(vehicleModel.getTotalToPayPkgQuantity() + element.getTotalPkgQuantity());
							} else if( element.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT) {
								if(isShowFreightAmountInTBBTotal || isShowFreightAmountInTotal)
									vehicleModel.setTotalCreditAmount(vehicleModel.getTotalCreditAmount() + element.getFreightAmount());
								else
									vehicleModel.setTotalCreditAmount(vehicleModel.getTotalCreditAmount() + element.getGrandTotal());


								vehicleModel.setTotalCreditPkgQuantity(vehicleModel.getTotalCreditPkgQuantity()+element.getTotalPkgQuantity());
							} else if( element.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_FOC)
								vehicleModel.setTotalFOCPkgQuantity(vehicleModel.getTotalFOCPkgQuantity() + element.getTotalPkgQuantity());

							vehicleModel.setTotalLoadingAmount(vehicleModel.getTotalLoadingAmount() + element.getLoadingAmount());
							vehicleModel.setTotalFreightAmount(vehicleModel.getTotalFreightAmount() + element.getFreightAmount());
							vehicleModel.setTotalCommissionAmount(vehicleModel.getTotalCommissionAmount() + element.getCommissionAmount());
							vehicleModel.setTotalBalanceAmount(vehicleModel.getTotalBalanceAmount() + element.getBalanceAmount());
							vehicleModel.setTotalLessTopayAmount(vehicleModel.getTotalLessTopayAmount() + element.getLessTopayAmount());
							vehicleModel.setTotalFinalAmount(vehicleModel.getTotalFinalAmount() + element.getTotalAmount());
							vehicleModel.setTotalCartageAmount(vehicleModel.getTotalCartageAmount() + element.getCartageAmount());
							vehicleModel.setTotalOtherChargeAmount(vehicleModel.getTotalOtherChargeAmount() + element.getOtherChargeAmount());

							if(!vehicleModel.isCrossing())
								vehicleModel.setCrossing(element.isCrossing());
						} else {

							vehicleModel= new CityWiseVehicleDispatchReportModel();

							vehicleModel.setSourceSubRegion(element.getSourceSubRegion());
							vehicleModel.setSourceBranch(cache.getGenericBranchDetailCache(request, element.getSourceBranchId()).getName());
							vehicleModel.setDestinationSubRegion(element.getDestinationSubRegion());
							vehicleModel.setDestinationBranch(cache.getGenericBranchDetailCache(request, element.getDestinationBranchId()).getName());
							vehicleModel.setTripDateTime(element.getTripDateTime());

							if( element.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID) {
								if(isShowFreightAmountInTotal)
									vehicleModel.setTotalPaidAmount(element.getFreightAmount());
								else
									vehicleModel.setTotalPaidAmount(element.getGrandTotal());
								vehicleModel.setTotalPaidPkgQuantity(element.getTotalPkgQuantity());
							} else if( element.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY) {
								if(isShowFreightAmountInTopayTotal || isShowFreightAmountInTotal)
									vehicleModel.setTotalToPayAmount(element.getFreightAmount());
								else
									vehicleModel.setTotalToPayAmount(element.getGrandTotal());

								vehicleModel.setTotalToPayPkgQuantity(element.getTotalPkgQuantity());
							} else if( element.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT) {
								if(isShowFreightAmountInTBBTotal || isShowFreightAmountInTotal)
									vehicleModel.setTotalCreditAmount(element.getFreightAmount());
								else
									vehicleModel.setTotalCreditAmount(element.getGrandTotal());

								vehicleModel.setTotalCreditPkgQuantity(element.getTotalPkgQuantity());
							} else if( element.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_FOC)
								vehicleModel.setTotalFOCPkgQuantity(element.getTotalPkgQuantity());

							vehicleModel.setDriverName(Utility.checkedNullCondition(element.getDriverName(), (short) 1));
							vehicleModel.setCleanerName(Utility.checkedNullCondition(element.getCleanerName(), (short) 1));
							vehicleModel.setVehicleNumber(element.getVehicleNumber());
							vehicleModel.setTotalLoadingAmount(element.getLoadingAmount());
							vehicleModel.setTotalFreightAmount(element.getFreightAmount());
							vehicleModel.setTotalCartageAmount(element.getCartageAmount());
							vehicleModel.setTotalCommissionAmount(element.getCommissionAmount());
							vehicleModel.setTotalBalanceAmount(element.getBalanceAmount());
							vehicleModel.setTotalLessTopayAmount(element.getLessTopayAmount());
							vehicleModel.setTotalFinalAmount(element.getTotalAmount());
							vehicleModel.setRemark(Utility.checkedNullCondition(element.getRemark(), (short) 1));
							vehicleModel.setDispatchLedgerId(element.getDispatchLedgerId());
							vehicleModel.setTotalOtherChargeAmount(element.getOtherChargeAmount());

							if(!vehicleModel.isCrossing())
								vehicleModel.setCrossing(element.isCrossing());
							vehicleCollection.put(""+element.getDispatchLedgerId(),vehicleModel );
						}

					} else {

						vehicleCollection 	= new LinkedHashMap <>();
						vehicleModel		= new CityWiseVehicleDispatchReportModel();

						vehicleModel.setSourceSubRegion(element.getSourceSubRegion());
						vehicleModel.setSourceBranch(cache.getGenericBranchDetailCache(request, element.getSourceBranchId()).getName());
						vehicleModel.setDestinationSubRegion(element.getDestinationSubRegion());
						vehicleModel.setDestinationBranch(cache.getGenericBranchDetailCache(request, element.getDestinationBranchId()).getName());
						vehicleModel.setTripDateTime(element.getTripDateTime());

						if( element.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID) {
							if(isShowFreightAmountInTotal)
								vehicleModel.setTotalPaidAmount(element.getFreightAmount());
							else
								vehicleModel.setTotalPaidAmount(element.getGrandTotal());
							vehicleModel.setTotalPaidPkgQuantity(element.getTotalPkgQuantity());
						} else if( element.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY) {
							if(isShowFreightAmountInTopayTotal || isShowFreightAmountInTotal)
								vehicleModel.setTotalToPayAmount(element.getFreightAmount());
							else
								vehicleModel.setTotalToPayAmount(element.getGrandTotal());

							vehicleModel.setTotalToPayPkgQuantity(element.getTotalPkgQuantity());
						} else if( element.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT) {
							if(isShowFreightAmountInTBBTotal || isShowFreightAmountInTotal)
								vehicleModel.setTotalCreditAmount(element.getFreightAmount());
							else
								vehicleModel.setTotalCreditAmount(element.getGrandTotal());

							vehicleModel.setTotalCreditPkgQuantity(element.getTotalPkgQuantity());
						} else if( element.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_FOC)
							vehicleModel.setTotalFOCPkgQuantity(element.getTotalPkgQuantity());

						vehicleModel.setDriverName(Utility.checkedNullCondition(element.getDriverName(), (short) 1));
						vehicleModel.setCleanerName(Utility.checkedNullCondition(element.getCleanerName(), (short) 1));
						vehicleModel.setVehicleNumber(element.getVehicleNumber());
						vehicleModel.setTotalLoadingAmount(element.getLoadingAmount());
						vehicleModel.setTotalFreightAmount(element.getFreightAmount());
						vehicleModel.setTotalCartageAmount(element.getCartageAmount());
						vehicleModel.setTotalCommissionAmount(element.getCommissionAmount());
						vehicleModel.setTotalBalanceAmount(element.getBalanceAmount());
						vehicleModel.setTotalLessTopayAmount(element.getLessTopayAmount());
						vehicleModel.setTotalFinalAmount(element.getTotalAmount());
						vehicleModel.setRemark(Utility.checkedNullCondition(element.getRemark(), (short) 1));
						vehicleModel.setDispatchLedgerId(element.getDispatchLedgerId());
						vehicleModel.setTotalOtherChargeAmount(element.getOtherChargeAmount());
						if(!vehicleModel.isCrossing())
							vehicleModel.setCrossing(element.isCrossing());
						vehicleCollection.put(""+element.getDispatchLedgerId(),vehicleModel);
					}

					cityCollection.put(element.getSourceSubRegion(), vehicleCollection);
				}

				if(displayVehicleWiseSummarry && (cityCollection != null)){
					vehicleWiseSummarry = new TreeMap<>();

					for( final String cityWisekey : cityCollection.keySet()) {
						cityWiseCollection = cityCollection.get(cityWisekey);

						if(cityWiseCollection != null)
							for(final String key : cityWiseCollection.keySet()){
								citywiseDispatchModel = cityWiseCollection.get(key);
								if(vehicleWiseSummarry.get(citywiseDispatchModel.getVehicleNumber()) == null){
									citywiseModel = new CityWiseVehicleDispatchReportModel();
									citywiseModel.setVehicleNumber(citywiseDispatchModel.getVehicleNumber());
									citywiseModel.setTotalFreightAmount(citywiseDispatchModel.getTotalFreightAmount());
									citywiseModel.setTotalCartageAmount(citywiseDispatchModel.getTotalCartageAmount());
									citywiseModel.setTotalCommissionAmount(citywiseDispatchModel.getTotalCommissionAmount());
									citywiseModel.setTotalBalanceAmount(citywiseDispatchModel.getTotalBalanceAmount());
									citywiseModel.setTotalLessTopayAmount(citywiseDispatchModel.getTotalLessTopayAmount());
									citywiseModel.setTotalFinalAmount(citywiseDispatchModel.getTotalFinalAmount());
									citywiseModel.setRemark(Utility.checkedNullCondition(citywiseDispatchModel.getRemark(), (short) 1));
									citywiseModel.setTotalOtherChargeAmount(citywiseDispatchModel.getTotalOtherChargeAmount());
								}else{
									citywiseModel = vehicleWiseSummarry.get(citywiseDispatchModel.getVehicleNumber());

									citywiseModel.setTotalFreightAmount(citywiseModel.getTotalFreightAmount() + citywiseDispatchModel.getTotalFreightAmount());
									citywiseModel.setTotalCartageAmount(citywiseModel.getTotalCartageAmount() + citywiseDispatchModel.getTotalCartageAmount());
									citywiseModel.setTotalCommissionAmount(citywiseModel.getTotalCommissionAmount() + citywiseDispatchModel.getTotalCommissionAmount());
									citywiseModel.setTotalBalanceAmount(citywiseModel.getTotalBalanceAmount() + citywiseDispatchModel.getTotalBalanceAmount());
									citywiseModel.setTotalLessTopayAmount(citywiseModel.getTotalLessTopayAmount() + citywiseDispatchModel.getTotalLessTopayAmount());
									citywiseModel.setTotalFinalAmount(citywiseModel.getTotalFinalAmount() + citywiseDispatchModel.getTotalFinalAmount());
									citywiseModel.setTotalOtherChargeAmount(citywiseModel.getTotalOtherChargeAmount() + citywiseDispatchModel.getTotalOtherChargeAmount());
								}
								vehicleWiseSummarry.put(citywiseDispatchModel.getVehicleNumber(), citywiseModel);
							}
					}
					request.setAttribute("vehicleWiseSummarry", vehicleWiseSummarry);
				}

				branches = cache.getBranchesWithMergingArrayBySubRegionId(request, executive.getAccountGroupId(), destinationCityId);
				request.setAttribute("destBranches", branches);

				request.setAttribute("reportModel",cityCollection);
				request.setAttribute(VehicleWiseDispatchReportConfigurationDTO.IS_SHOW_LOADING_AMOUNT_COLUMN,isShowLoadingAmountColumn);
				request.setAttribute(VehicleWiseDispatchReportConfigurationDTO.IS_SHOW_FREIGHT_AMOUNT_IN_TOTAL,isShowFreightAmountInTotal);
				request.setAttribute(VehicleWiseDispatchReportConfigurationDTO.SHOW_CARTAGE_AMOUNT_COLUMN, showCartageAmountColumn);
				request.setAttribute(VehicleWiseDispatchReportConfigurationDTO.DISPLAY_VEHICLE_WISE_SUMMARRY, displayVehicleWiseSummarry);
				request.setAttribute(VehicleWiseDispatchReportConfigurationDTO.SHOW_CARTAGE_AND_OTHER_CHARGE_COLUMN, showCartageAndOtherChargeColumn);

				ActionStaticUtil.setReportViewModel(request);
				request.setAttribute("nextPageToken", "success");

				sdf = new SimpleDateFormat("mm:ss");
				sdf.setTimeZone(TimeZone.getTimeZone("GMT"));
				LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO,"=====Report Generated "+BusinessFunctionConstants.VEHICALWISEDISPATCHREPORT +" "+executive.getAccountGroupId()+
						" "+executive.getBranchId()+" "+executive.getExecutiveId()+" in "+sdf.format(new Date(System.currentTimeMillis()-startTime)));
			} else {
				LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO, (String) error.get("errorCode") + " " +(String) error.get("errorDescription"));
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
				request.setAttribute("nextPageToken", "success");
			}
		} catch (final Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		} finally {
			error 				= null;
			cache				= null;
			executive 			= null;
			fromDate    		= null;
			toDate      		= null;
			objectIn 			= null;
			objectOut 			= null;
			sdf         		= null;
			vehicleModel		= null;
			reportModel 		= null;
			wayBillCharges 		= null;
			vehicleCollection	= null;
			cityCollection 		= null;
			wayBillDetails		= null;
			cityWiseCollection	= null;
			citywiseDispatchModel= null;
			citywiseModel 		= null;
			vehicleWiseSummarry	= null;
			conSumHM			= null;
			wayBillHM			= null;
			wayBill				= null;
			destBranches		= null;
			srcBranches			= null;
		}
	}
}