package com.ivcargo.reports;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.displaydata.DisplayDataConfigurationBll;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.dto.constant.CargoAccountGroupConstant;
import com.iv.dto.constant.ExecutiveTypeConstant;
import com.iv.dto.constant.PaymentTypeConstant;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.BranchDao;
import com.platform.dao.WayBillDeliveryChargesDao;
import com.platform.dao.reports.CityWiseCollectionDAO;
import com.platform.dao.reports.WayBillDetailsDAO;
import com.platform.dto.AliasNameConstants;
import com.platform.dto.Branch;
import com.platform.dto.ChargeTypeMaster;
import com.platform.dto.ConsignmentDetails;
import com.platform.dto.Executive;
import com.platform.dto.TransportCommonMaster;
import com.platform.dto.WayBill;
import com.platform.dto.WayBillCharges;
import com.platform.dto.WayBillTaxTxn;
import com.platform.dto.configuration.master.DisplayDataConfigurationDTO;
import com.platform.dto.configuration.report.collection.CityWiseCollectionReportConfigurationDTO;
import com.platform.dto.configuration.report.common.CommonReportsConfigurationDTO;
import com.platform.dto.constant.WayBillStatusConstant;
import com.platform.dto.constant.WayBillTypeConstant;
import com.platform.dto.model.CityWiseCollectionModel;
import com.platform.dto.model.CityWiseCollectionReportModel;
import com.platform.dto.model.CityWiseCollectionReportModelForCreditor;
import com.platform.dto.model.WayBillDeatailsModel;
import com.platform.resource.CargoErrorList;
import com.platform.utils.PropertiesUtility;
import com.platform.utils.Utility;

public class CityWiseCollectionReportAction implements Action {

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {

		HashMap<String,Object>									 error 								= null;
		Executive												 executive							= null;
		ValueObject												 objectIn							= null;
		ValueObject												 objectOut							= null;
		SimpleDateFormat										 sdf								= null;
		Timestamp												 fromDate							= null;
		Timestamp												 toDate								= null;
		CacheManip												 cache								= null;
		Branch[]												 cityBranches						= null;
		Branch													 branch								= null;
		WayBillCharges[]										 wayBillCharges						= null;
		Long[]													 wayBillIdArray						= null;
		StringBuilder											 branchesString						= null;
		CityWiseCollectionReportModel[]							reportModel							= null;
		CityWiseCollectionModel									defaultBookingModel					= null;
		CityWiseCollectionModel									defaultDeliveryModel				= null;
		CityWiseCollectionModel									bkdMdl								= null;
		CityWiseCollectionModel									dlvrdMdl							= null;
		HashMap <String,Double>									allWayBillTypeTotals				= null;
		CityWiseCollectionReportModelForCreditor[]				rptMdlCreditor						= null;
		CityWiseCollectionReportModelForCreditor				model								= null;
		HashMap<Long, WayBillDeatailsModel> 					wayBillDetails 						= null;
		HashMap<String,Double> 									bookedWayBillCategoryTypeDetails	= null;
		HashMap<Long,CityWiseCollectionModel>   				bookingCollection 					= null;
		HashMap<Long,CityWiseCollectionModel>   				deliveryCollection 					= null;
		ArrayList<Long> 										cancelledWayBills					= null;
		HashMap<Long,CityWiseCollectionReportModelForCreditor>	creditorBooking						= null;
		HashMap<Long,CityWiseCollectionReportModelForCreditor>	creditorBookingManual				= null;
		Long[]													wayBillIdsForGroupSharingChargesArr	= null;
		String													wayBillIdsForGroupSharingCharges	= null;
		HashMap<Long, Double> 									groupSharingChargesMap				= null;
		ValueObject												displayDataConfig					= null;
		ValueObject												valueObjectIn						= null;
		Timestamp												createDate							= null;
		var													isDonotShowWayBillTypeWiseData		= false;
		WayBillCharges[]										creditorWayBillCharges				= null;
		var 													selectedCity 						= 0L;
		var													showNoOfPackageAndLr				= false;
		var													showActiveBranches					= false;
		var													sortOnBranchName					= false;
		ValueObject 											configuration						= null;
		var													selectedRegion						= 0L;
		Branch[]    											branches  							= null;
		ValueObject												confValObj							= null;
		WayBillTaxTxn[]				wayBillTax			= null;
		var						totalTax			= 0.00;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeCityWiseCollectionReportAction().execute(request, response);

			executive	= (Executive) request.getSession().getAttribute("executive");
			objectIn	= new ValueObject();
			objectOut	= new ValueObject();

			if (request.getParameter("subRegion") != null) {
				selectedCity = JSPUtility.GetLong(request, "subRegion");
				objectIn.put("selectedCity", selectedCity);
			}
			if(request.getParameter("region") != null) {
				selectedRegion = JSPUtility.GetLong(request, "region");
				objectIn.put("regionId", selectedRegion);
			}

			sdf         	= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			fromDate    	= new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00").getTime());
			toDate      	= new Timestamp(sdf.parse(JSPUtility.GetString(request, "toDate") + " 23:59:59").getTime());
			cache			= new CacheManip(request);
			branchesString	= new StringBuilder();
			createDate 		= new Timestamp(new java.util.Date().getTime());
			confValObj 		= cache.getCommonReportsConfiguration(request, executive.getAccountGroupId());
			configuration				= ReadAllConfigurationsBllImpl.getInstance().getOldReportConfigurationData(ReportIdentifierConstant.CITY_WISE_COLLECTION_REPORT, executive.getAccountGroupId());
			showNoOfPackageAndLr        = configuration.getBoolean(CityWiseCollectionReportConfigurationDTO.SHOW_NO_OF_PACKAGE_AND_LR,false);
			showActiveBranches          = configuration.getBoolean(CityWiseCollectionReportConfigurationDTO.SHOW_ACTIVE_BRANCHES,false);
			sortOnBranchName			= configuration.getBoolean(CityWiseCollectionReportConfigurationDTO.SORT_ON_BRANCH_NAME,false);

			if(executive.getExecutiveType()==ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN) {
				request.setAttribute("branches",cache.getBranchesArrayBySubRegionId(request, executive.getAccountGroupId(), selectedCity));
				if(confValObj.getBoolean(CommonReportsConfigurationDTO.SHOW_REGION_LABEL,false)){
					if(selectedRegion == 0)
						branchesString.append(cache.getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_GROUP, 0));
					else if(selectedRegion > 0 && selectedCity == 0)
						branchesString.append(cache.getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_REGION, selectedRegion));
					else if (selectedCity != -1)
						branchesString.append(cache.getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_SUBREGION, selectedCity));
				} else if(selectedCity == 0)
					branchesString.append(cache.getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_GROUP, 0));
				else if (selectedCity != -1)
					branchesString.append(cache.getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_SUBREGION, selectedCity));

			} else if(executive.getExecutiveType()==ExecutiveTypeConstant.EXECUTIVE_TYPE_BRANCHADMIN
					|| executive.getExecutiveType()==ExecutiveTypeConstant.EXECUTIVE_TYPE_EXECUTIVE
					|| executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_LIMITED)
				branchesString.append(""+executive.getBranchId());

			if(selectedCity > 0) {
				branches = cache.getBranchesArrayBySubRegionId(request, executive.getAccountGroupId(), selectedCity);
				request.setAttribute("branches", branches);
			}

			objectIn.put("fromDate", fromDate);
			objectIn.put("toDate", toDate);
			objectIn.put("executive", executive);
			objectIn.put("branchesString", branchesString.toString());

			objectOut = CityWiseCollectionDAO.getInstance().getCityWiseCollectionReport(objectIn);

			if(objectOut != null){
				reportModel = (CityWiseCollectionReportModel[])objectOut.get("CityWiseCollectionReportModel");
				wayBillIdsForGroupSharingChargesArr = (Long[])objectOut.get("wayBillIdsForGroupSharingChargesArr");

				//Condition For Group Sharing Charges. SRS should Not see Receipt Charge Of Southern
				if(wayBillIdsForGroupSharingChargesArr != null){
					wayBillIdsForGroupSharingCharges 	= Utility.GetLongArrayToString(wayBillIdsForGroupSharingChargesArr);
					groupSharingChargesMap 				= WayBillDeliveryChargesDao.getInstance().getWayBillChargeMapByWayBillIdsAndChargeMasterId(wayBillIdsForGroupSharingCharges,ChargeTypeMaster.RECEIPT);
				}

				if(reportModel.length > 0){

					wayBillIdArray		= (Long[])objectOut.get("WayBillIdArray");
					bookingCollection	= new LinkedHashMap<>();
					deliveryCollection	= new HashMap<>();

					if(executive.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNT_GORUP_ID_KALPANA_CARGO
							|| executive.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNT_GORUP_ID_SOUTHERN){
						cancelledWayBills				= new ArrayList<>();
						creditorBooking					= new LinkedHashMap<>();
						creditorBookingManual			= new LinkedHashMap<>();
						//Get WayBill Details code ( Start )
						wayBillDetails 					= WayBillDetailsDAO.getInstance().getWayBillDetails(wayBillIdArray ,true ,ChargeTypeMaster.WAYBILL_CHARGETYPE_BOTH ,true ,WayBillTaxTxn.WAYBILL_TAX_TXN_TYPE_BOOKING ,true);
						//Get WayBill Details code ( End )
					}

					//get city Id for Branch admin or executive

					if(executive.getExecutiveType() != ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN && selectedCity <1)
						selectedCity= executive.getSubRegionId();

					if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN) {
						if(confValObj.getBoolean(CommonReportsConfigurationDTO.SHOW_REGION_LABEL,false)){
							if(selectedRegion == 0)
								cityBranches = 	BranchDao.getInstance().findByAccountGroupId(executive.getAccountGroupId());
							else if(selectedRegion > 0 && selectedCity == 0 ){
								final var cityBranchesFromRegion	= cache.getBranchesByRegionId(request,executive.getAccountGroupId(),selectedRegion);
								final var branchArrayList = new ArrayList<>();

								for(final long key : cityBranchesFromRegion.keySet())
									branchArrayList.add(cityBranchesFromRegion.get(key));

								cityBranches	= new Branch[branchArrayList.size()];
								branchArrayList.toArray(cityBranches);
							} else if(selectedRegion > 0 && selectedCity > 0 || selectedCity < 0)
								cityBranches = cache.getBranchesArrayBySubRegionId(request, executive.getAccountGroupId(), selectedCity);
						} else
							cityBranches = cache.getBranchesArrayBySubRegionId(request, executive.getAccountGroupId(), selectedCity);

						for (final Branch element : cityBranches) {
							branch = element;
							if(showActiveBranches)
								if(branch.getStatus() == Branch.BRANCH_DEACTIVE || branch.isMarkForDelete())
									continue;
							defaultBookingModel = new CityWiseCollectionModel();
							defaultBookingModel.setBranchId(branch.getBranchId());
							defaultBookingModel.setBranchName(cache.getBranchById(request, executive.getAccountGroupId(), branch.getBranchId()).getName());
							bookingCollection.put(branch.getBranchId(), defaultBookingModel);
							defaultDeliveryModel = new CityWiseCollectionModel();
							defaultDeliveryModel.setBranchId(branch.getBranchId());
							defaultDeliveryModel.setBranchName(cache.getBranchById(request, executive.getAccountGroupId(), branch.getBranchId()).getName());
							deliveryCollection.put(branch.getBranchId(), defaultDeliveryModel);
						}

					}else{
						defaultBookingModel = new CityWiseCollectionModel();
						defaultBookingModel.setBranchId(executive.getBranchId());
						defaultBookingModel.setBranchName(cache.getBranchById(request, executive.getAccountGroupId(), executive.getBranchId()).getName());
						bookingCollection.put(executive.getBranchId(), defaultBookingModel);
						defaultDeliveryModel = new CityWiseCollectionModel();
						defaultDeliveryModel.setBranchId(executive.getBranchId());
						defaultDeliveryModel.setBranchName(cache.getBranchById(request, executive.getAccountGroupId(), executive.getBranchId()).getName());
						deliveryCollection.put(executive.getBranchId(), defaultDeliveryModel);
					}


					//Booking total variables
					var totalBookingPaidAmount 				= 0D;
					var totalBookingToPayAmount 				= 0D;
					var totalBookingCreditorAmount 			= 0D;
					var totalBookingPaidManaulAmount 		= 0D;
					var totalBookingToPayManaulAmount 		= 0D;
					var totalBookingCreditorManaulAmount 	= 0D;
					var totaBookingNoOfPackages			    = 0D;
					var totalBookingLr			    		= 0D;


					//Delivery total variables
					var totalDeliveryPaidAmount 				= 0D;
					var totalDeliveryToPayAmount 			= 0D;
					var totalDeliveryCreditorAmount			= 0D;
					var totalDeliveryPaidManaulAmount		= 0D;
					var totalDeliveryToPayManaulAmount		= 0D;
					var totalDeliveryCreditorManaulAmount 	= 0D;

					displayDataConfig						= cache.getDisplayDataConfiguration(request, executive.getAccountGroupId());
					isDonotShowWayBillTypeWiseData			= PropertiesUtility.isAllow(displayDataConfig.getString(DisplayDataConfigurationDTO.IS_DONOT_SHOW_WAY_BILL_TYPE_WISE_DATA_IN_REPORTS, "false"));

					valueObjectIn							= new ValueObject();

					for (final CityWiseCollectionReportModel element : reportModel) {
						wayBillTax = null;
						totalTax   = 0.00;
						if (isDonotShowWayBillTypeWiseData) {
							valueObjectIn.put(AliasNameConstants.CURRENT_DATE_TIMESTAMP, createDate);
							valueObjectIn.put(AliasNameConstants.WAYBILL_TYPE_ID, element.getWayBillTypeId());
							valueObjectIn.put(AliasNameConstants.SOURCE_BRANCH_ID, element.getWayBillSourceBranchId());
							valueObjectIn.put(AliasNameConstants.DATE_TIMESTAMP, element.getCreationTimeStamp());
							valueObjectIn.put(AliasNameConstants.EXECUTIVE_ID, executive.getExecutiveId());
							valueObjectIn.put(AliasNameConstants.WAYBILL_STATUS_ID, element.getStatus());
							valueObjectIn.put(AliasNameConstants.IS_SHOW_WAYBILL, element.isShowWayBill());
							if(DisplayDataConfigurationBll.getInstance().isDisplayWayBillTypeWiseData(displayDataConfig, valueObjectIn))
								continue;
						}


						if(wayBillDetails != null && wayBillDetails.get(element.getWayBillId()).getWayBillTaxTxn() != null) {
							wayBillTax = wayBillDetails.get(element.getWayBillId()).getWayBillTaxTxn();

							if(wayBillTax != null && wayBillTax.length > 0) {
								for (final WayBillTaxTxn taxObj : wayBillTax)
									totalTax = totalTax + taxObj.getTaxAmount();
								element.setTotalTax(Math.round(totalTax));
							}
						}

						if(groupSharingChargesMap != null && groupSharingChargesMap.get(element.getWayBillId()) != null && element.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DELIVERED ) {
							element.setDeliveryAmount(element.getDeliveryAmount() - groupSharingChargesMap.get(element.getWayBillId()));
							element.setGrandTotal(element.getGrandTotal() - groupSharingChargesMap.get(element.getWayBillId()));
						}

						if(executive.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNT_GORUP_ID_SOUTHERN || executive.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNT_GORUP_ID_KALPANA_CARGO){
							//WayBill Charges (Booking & Delivery)
							wayBillCharges = wayBillDetails.get(element.getWayBillId()).getWayBillCharges();
							bookedWayBillCategoryTypeDetails = new HashMap<>();
							for (final WayBillCharges wayBillCharge : wayBillCharges) {
								if(element.getStatus() != WayBill.WAYBILL_STATUS_DELIVERED && wayBillCharge.getChargeType() == ChargeTypeMaster.WAYBILL_CHARGETYPE_BOOKING)
									bookedWayBillCategoryTypeDetails.put(""+wayBillCharge.getWayBillChargeMasterId(), wayBillCharge.getChargeAmount());

								if(element.getStatus() == WayBill.WAYBILL_STATUS_DELIVERED && wayBillCharge.getChargeType() == ChargeTypeMaster.WAYBILL_CHARGETYPE_DELIVERY)
									bookedWayBillCategoryTypeDetails.put(""+wayBillCharge.getWayBillChargeMasterId(), wayBillCharge.getChargeAmount());
							}
							element.setChargesCollection(bookedWayBillCategoryTypeDetails);
							//end
						}

						if(executive.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNT_GORUP_ID_KALPANA_CARGO)
							if(element.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CANCELLED)
								cancelledWayBills.add(element.getWayBillId());
						if(element.getStatus()==WayBillStatusConstant.WAYBILL_STATUS_BOOKED){

							//if branch is already there, update it
							if(bookingCollection.get(element.getBranchId())!=null){

								bkdMdl = bookingCollection.get(element.getBranchId());

								if(executive.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNT_GORUP_ID_KALPANA_CARGO)
									for (final WayBillCharges wayBillCharge : wayBillCharges)
										if(wayBillCharge.getWayBillChargeMasterId() == ChargeTypeMaster.LOADING)
											bkdMdl.setTotalLoadingAmount(bkdMdl.getTotalLoadingAmount() + wayBillCharge.getChargeAmount());
										else if(wayBillCharge.getWayBillChargeMasterId() == ChargeTypeMaster.BUILTY_CHARGE)
											bkdMdl.setTotalBuiltyChargeAmount(bkdMdl.getTotalBuiltyChargeAmount() + wayBillCharge.getChargeAmount());
										else if(wayBillCharge.getWayBillChargeMasterId() == ChargeTypeMaster.CONVENIENCE)
											bkdMdl.setTotalConvenienceAmount(bkdMdl.getTotalConvenienceAmount() + wayBillCharge.getChargeAmount());

								if(!element.isManual()){
									if(element.getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_PAID){
										bkdMdl.setTotalPaidAmount(bkdMdl.getTotalPaidAmount()+element.getGrandTotal());
										totalBookingPaidAmount=totalBookingPaidAmount+element.getGrandTotal();

									}else if(element.getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_TO_PAY){
										bkdMdl.setTotalToPayAmount(bkdMdl.getTotalToPayAmount()+element.getGrandTotal());
										totalBookingToPayAmount=totalBookingToPayAmount+element.getGrandTotal();

									}else if(element.getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_CREDIT){
										bkdMdl.setTotalCreditorAmount(bkdMdl.getTotalCreditorAmount()+element.getGrandTotal());
										totalBookingCreditorAmount=totalBookingCreditorAmount+element.getGrandTotal();
									}

								} else if(element.getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_PAID ){
									bkdMdl.setTotalPaidManaulAmount(bkdMdl.getTotalPaidManaulAmount()+element.getGrandTotal());
									totalBookingPaidManaulAmount=totalBookingPaidManaulAmount+element.getGrandTotal();
								}else if(element.getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_TO_PAY ){
									bkdMdl.setTotalToPayManaulAmount(bkdMdl.getTotalToPayManaulAmount()+element.getGrandTotal());
									totalBookingToPayManaulAmount=totalBookingToPayManaulAmount+element.getGrandTotal();
								}else if(element.getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_CREDIT){
									bkdMdl.setTotalCreditorManaulAmount(bkdMdl.getTotalCreditorManaulAmount()+element.getGrandTotal());
									totalBookingCreditorManaulAmount=totalBookingCreditorManaulAmount+element.getGrandTotal();
								}

								if(element.getWayBillTypeId() != WayBillTypeConstant.WAYBILL_TYPE_FOC){
									bkdMdl.setTotalBookingLr(bkdMdl.getTotalBookingLr() + 1);
									bkdMdl.setTotalPackages(bkdMdl.getTotalPackages() + element.getNoOfPackages());

									totalBookingLr = totalBookingLr + 1;
									totaBookingNoOfPackages = totaBookingNoOfPackages + element.getNoOfPackages();
								}

								if(element.getPaymentType() == PaymentTypeConstant.PAYMENT_TYPE_PHONE_PAY_ID)
									if(element.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID )
										bkdMdl.setTotalUPIAmount(bkdMdl.getTotalUPIAmount() + element.getGrandTotal());

								bkdMdl.setTotaltax(bkdMdl.getTotaltax() + element.getTotalTax());
							}

						}else if (element.getStatus()==WayBillStatusConstant.WAYBILL_STATUS_DELIVERED){

							//if branch is already there, update it
							if(deliveryCollection.get(element.getBranchId())!=null){

								dlvrdMdl = deliveryCollection.get(element.getBranchId());
								bkdMdl = bookingCollection.get(element.getBranchId());

								if(executive.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNT_GORUP_ID_KALPANA_CARGO
										|| executive.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNT_GORUP_ID_SOUTHERN)
									for (final WayBillCharges wayBillCharge : wayBillCharges)
										if(wayBillCharge.getWayBillChargeMasterId() == ChargeTypeMaster.UNLOADING)
											dlvrdMdl.setTotalUnLoadingAmount(dlvrdMdl.getTotalUnLoadingAmount() + wayBillCharge.getChargeAmount());
										else if(wayBillCharge.getWayBillChargeMasterId() == ChargeTypeMaster.RECEIPT)
											dlvrdMdl.setTotalReceiptAmount(dlvrdMdl.getTotalReceiptAmount() + wayBillCharge.getChargeAmount());

								if(!element.isManual()){

									if(element.getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_PAID){
										dlvrdMdl.setTotalPaidAmount(dlvrdMdl.getTotalPaidAmount()+(element.getDeliveryAmount()-element.getDeliveryDiscount()));
										totalDeliveryPaidAmount=totalDeliveryPaidAmount+(element.getDeliveryAmount()-element.getDeliveryDiscount());
									}else if(element.getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_TO_PAY){
										dlvrdMdl.setTotalToPayAmount(dlvrdMdl.getTotalToPayAmount()+ element.getGrandTotal());
										totalDeliveryToPayAmount=totalDeliveryToPayAmount+element.getGrandTotal();
									}else if(element.getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_CREDIT){
										dlvrdMdl.setTotalCreditorAmount(dlvrdMdl.getTotalCreditorAmount()+(element.getDeliveryAmount()-element.getDeliveryDiscount()));
										totalDeliveryCreditorAmount=totalDeliveryCreditorAmount+(element.getDeliveryAmount()-element.getDeliveryDiscount());
									}
								} else if(element.getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_PAID ){
									dlvrdMdl.setTotalPaidManaulAmount(dlvrdMdl.getTotalPaidManaulAmount()+(element.getDeliveryAmount()-element.getDeliveryDiscount()));
									totalDeliveryPaidManaulAmount=totalDeliveryPaidManaulAmount+(element.getDeliveryAmount()-element.getDeliveryDiscount());
								}else if(element.getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_TO_PAY ){
									dlvrdMdl.setTotalToPayManaulAmount(dlvrdMdl.getTotalToPayManaulAmount()+element.getGrandTotal());
									totalDeliveryToPayManaulAmount=totalDeliveryToPayManaulAmount+element.getGrandTotal();
								}else if(element.getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_CREDIT){
									dlvrdMdl.setTotalCreditorManaulAmount(dlvrdMdl.getTotalCreditorManaulAmount()+(element.getDeliveryAmount()-element.getDeliveryDiscount()));
									totalDeliveryCreditorManaulAmount=totalDeliveryCreditorManaulAmount+(element.getDeliveryAmount()-element.getDeliveryDiscount());
								}

								if(element.getPaymentType() == PaymentTypeConstant.PAYMENT_TYPE_PHONE_PAY_ID)
									if(element.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID || element.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT)
										bkdMdl.setTotalUPIAmount(bkdMdl.getTotalUPIAmount() + (element.getDeliveryAmount()-element.getDeliveryDiscount()));
									else if(element.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY )
										bkdMdl.setTotalUPIAmount(bkdMdl.getTotalUPIAmount()+ element.getGrandTotal());
							}

						} else //if branch is already there, update it
							if(element.getStatus()==WayBillStatusConstant.WAYBILL_STATUS_CANCELLED && bookingCollection.get(element.getBranchId())!=null){

								bkdMdl = bookingCollection.get(element.getBranchId());

								if(executive.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNT_GORUP_ID_KALPANA_CARGO)
									for (final WayBillCharges wayBillCharge : wayBillCharges)
										if(wayBillCharge.getWayBillChargeMasterId() == ChargeTypeMaster.LOADING)
											bkdMdl.setTotalLoadingAmount(bkdMdl.getTotalLoadingAmount() - wayBillCharge.getChargeAmount());
										else if(wayBillCharge.getWayBillChargeMasterId() == ChargeTypeMaster.BUILTY_CHARGE)
											bkdMdl.setTotalBuiltyChargeAmount(bkdMdl.getTotalBuiltyChargeAmount() - wayBillCharge.getChargeAmount());
										else if(wayBillCharge.getWayBillChargeMasterId() == ChargeTypeMaster.CONVENIENCE)
											bkdMdl.setTotalConvenienceAmount(bkdMdl.getTotalConvenienceAmount() - wayBillCharge.getChargeAmount());

								if(!element.isManual()){

									if(element.getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_PAID){
										bkdMdl.setTotalPaidAmount(bkdMdl.getTotalPaidAmount()-element.getGrandTotal());
										totalBookingPaidAmount=totalBookingPaidAmount-element.getGrandTotal();
									}else if(element.getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_TO_PAY){
										totalBookingToPayAmount=totalBookingToPayAmount-element.getGrandTotal();
										bkdMdl.setTotalToPayAmount(bkdMdl.getTotalToPayAmount()-element.getGrandTotal());
									}else if(element.getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_CREDIT){
										bkdMdl.setTotalCreditorAmount(bkdMdl.getTotalCreditorAmount()-element.getGrandTotal());
										totalBookingCreditorAmount=totalBookingCreditorAmount-element.getGrandTotal();
									}
								} else if(element.getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_PAID ){
									bkdMdl.setTotalPaidManaulAmount(bkdMdl.getTotalPaidManaulAmount()-element.getGrandTotal());
									totalBookingPaidManaulAmount=totalBookingPaidManaulAmount-element.getGrandTotal();
								}else if(element.getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_TO_PAY ){
									bkdMdl.setTotalToPayManaulAmount(bkdMdl.getTotalToPayManaulAmount()-element.getGrandTotal());
									totalBookingToPayManaulAmount=totalBookingToPayManaulAmount-element.getGrandTotal();
								}else if(element.getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_CREDIT){
									bkdMdl.setTotalCreditorManaulAmount(bkdMdl.getTotalCreditorManaulAmount()-element.getGrandTotal());
									totalBookingCreditorManaulAmount=totalBookingCreditorManaulAmount-element.getGrandTotal();
								}

								if(element.getWayBillTypeId() != WayBillTypeConstant.WAYBILL_TYPE_FOC){
									bkdMdl.setTotalBookingLr(bkdMdl.getTotalBookingLr() -1);
									bkdMdl.setTotalPackages(bkdMdl.getTotalPackages() - element.getNoOfPackages());

									totalBookingLr = totalBookingLr - 1;
									totaBookingNoOfPackages = totaBookingNoOfPackages - element.getNoOfPackages();
								}

								if(element.getPaymentType() == PaymentTypeConstant.PAYMENT_TYPE_PHONE_PAY_ID)
									if(element.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID )
										bkdMdl.setTotalUPIAmount(bkdMdl.getTotalUPIAmount() - element.getGrandTotal());

								bkdMdl.setTotaltax(bkdMdl.getTotaltax() - element.getTotalTax());
							}
					}
					if(bookingCollection.size()==deliveryCollection.size()) {///All branches are included in both collection
						if(sortOnBranchName)
							bookingCollection = bookingCollection.entrySet()
							.stream()
							.sorted(Map.Entry.comparingByValue(Comparator.comparing(CityWiseCollectionModel::getBranchName)))
							.collect(Collectors.toMap(
									Map.Entry::getKey,
									Map.Entry::getValue,
									(e1, e2) -> e1,
									LinkedHashMap::new
									));

						allWayBillTypeTotals = new HashMap < >();
						//variable to store Column count (for Dynamic table generation)
						short bookingColCount=0;
						short deliveryColCount=0;

						if(totalBookingPaidAmount >0 )bookingColCount++;
						if(totalBookingToPayAmount>0 )bookingColCount++;
						if(totalBookingCreditorAmount>0 )bookingColCount++;
						if(totalBookingPaidManaulAmount>0 )bookingColCount++;
						if(totalBookingToPayManaulAmount>0 )bookingColCount++;
						if(totalBookingCreditorManaulAmount>0 )bookingColCount++;
						if(totalDeliveryPaidAmount>0 )deliveryColCount++;
						if(totalDeliveryToPayAmount>0 )deliveryColCount++;
						if(totalDeliveryCreditorAmount>0 )deliveryColCount++;
						if(totalDeliveryPaidManaulAmount>0 )deliveryColCount++;
						if(totalDeliveryToPayManaulAmount>0 )deliveryColCount++;
						if(totalDeliveryCreditorManaulAmount>0)deliveryColCount++;


						//There are total 12 types of way bills (6-Booking and 6-Delivery) for this report
						allWayBillTypeTotals.put("BOOKING_PAID", totalBookingPaidAmount);
						allWayBillTypeTotals.put("BOOKING_TOPAY", totalBookingToPayAmount);
						allWayBillTypeTotals.put("BOOKING_CREDIT", totalBookingCreditorAmount);
						allWayBillTypeTotals.put("BOOKING_PAID_MANUAL", totalBookingPaidManaulAmount);
						allWayBillTypeTotals.put("BOOKING_TOPAY_MANUAL", totalBookingToPayManaulAmount);
						allWayBillTypeTotals.put("BOOKING_CREDIT_MANUAL", totalBookingCreditorManaulAmount);
						allWayBillTypeTotals.put("DELIVERY_PAID", totalDeliveryPaidAmount);
						allWayBillTypeTotals.put("DELIVERY_TOPAY", totalDeliveryToPayAmount);
						allWayBillTypeTotals.put("DELIVERY_CREDIT", totalDeliveryCreditorAmount);
						allWayBillTypeTotals.put("DELIVERY_PAID_MANUAL", totalDeliveryPaidManaulAmount);
						allWayBillTypeTotals.put("DELIVERY_TOPAY_MANUAL", totalDeliveryToPayManaulAmount);
						allWayBillTypeTotals.put("DELIVERY_CREDIT_MANUAL", totalDeliveryCreditorManaulAmount);
						allWayBillTypeTotals.put("totaBookingNoOfPackages", totaBookingNoOfPackages);
						allWayBillTypeTotals.put("totalBookingTotalLr", totalBookingLr);

						request.setAttribute("allWayBillTypeTotals",allWayBillTypeTotals);
						request.setAttribute("bookingCollection",bookingCollection);
						request.setAttribute("deliveryCollection",deliveryCollection);
						request.setAttribute("bookingColCount",bookingColCount);
						request.setAttribute("deliveryColCount",deliveryColCount);
						request.setAttribute("report",reportModel);
						request.setAttribute("showNoOfPackageAndLr",showNoOfPackageAndLr);
						request.setAttribute("cityBranches", cityBranches);
						request.setAttribute("BookingCharges", cache.getBookingCharges(request, executive.getBranchId()));
						request.setAttribute("DeliveryCharges", cache.getDeliveryCharges(request, executive.getBranchId()));

						/***Start******Creditor Data For Kalpana*********/
						if(executive.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNT_GORUP_ID_KALPANA_CARGO) {
							objectOut = CityWiseCollectionDAO.getInstance().getCityWiseCollectionReportForCreditor(objectIn);

							if(objectOut !=null){
								rptMdlCreditor = (CityWiseCollectionReportModelForCreditor[])objectOut.get("CityWiseCollectionReportModelForCreditor");

								if(rptMdlCreditor.length > 0)
									for (var k = 0; k < rptMdlCreditor.length; k++) {
										creditorWayBillCharges = null;

										if(!cancelledWayBills.contains(rptMdlCreditor[k].getWayBillId())){
											creditorWayBillCharges = wayBillDetails.get(rptMdlCreditor[k].getWayBillId()).getWayBillCharges();
											rptMdlCreditor[k] = getDetailsForCreditorReportModel(wayBillDetails,creditorWayBillCharges,rptMdlCreditor[k]);

											model = null;

											if(!rptMdlCreditor[k].isManual()){
												model = creditorBooking.get(rptMdlCreditor[k].getCorpAccountId());
												if(model != null)
													updateCreditorReportModel(model,rptMdlCreditor[k],creditorWayBillCharges);
												else
													creditorBooking.put(rptMdlCreditor[k].getCorpAccountId(), rptMdlCreditor[k]);
											}else {
												model = creditorBookingManual.get(rptMdlCreditor[k].getCorpAccountId());
												if(model != null)
													updateCreditorReportModel(model,rptMdlCreditor[k],creditorWayBillCharges);
												else
													creditorBookingManual.put(rptMdlCreditor[k].getCorpAccountId(), rptMdlCreditor[k]);
											}
										}
									}
							}
						}

						request.setAttribute("creditorBooking", creditorBooking);
						request.setAttribute("creditorBookingManual", creditorBookingManual);
						request.setAttribute("CancelledWayBills", cancelledWayBills);

						/***End******Creditor Data For Kalpana*********/

						ActionStaticUtil.setReportViewModel(request);
						request.setAttribute("nextPageToken", "success");
					}
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
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		} finally {
			error 								= null;
			executive							= null;
			objectIn							= null;
			objectOut							= null;
			sdf									= null;
			fromDate							= null;
			toDate								= null;
			cache								= null;
			cityBranches						= null;
			branch								= null;
			wayBillCharges						= null;
			wayBillIdArray						= null;
			branchesString						= null;
			reportModel							= null;
			defaultBookingModel					= null;
			defaultDeliveryModel				= null;
			bkdMdl								= null;
			dlvrdMdl							= null;
			allWayBillTypeTotals				= null;
			rptMdlCreditor						= null;
			model								= null;
			wayBillDetails 						= null;
			bookedWayBillCategoryTypeDetails	= null;
			bookingCollection 					= null;
			deliveryCollection 					= null;
			cancelledWayBills					= null;
			creditorBooking						= null;
			creditorBookingManual				= null;
			wayBillIdsForGroupSharingChargesArr	= null;
			wayBillIdsForGroupSharingCharges	= null;
			groupSharingChargesMap				= null;
			displayDataConfig					= null;
			valueObjectIn						= null;
			createDate							= null;
		}
	}

	private CityWiseCollectionReportModelForCreditor getDetailsForCreditorReportModel(final HashMap<Long, WayBillDeatailsModel> wayBillDetails, final WayBillCharges[] wayBillCharges, final CityWiseCollectionReportModelForCreditor reportModel) throws Exception {

		WayBillTaxTxn[]				wayBillTax			= null;
		ConsignmentDetails[]		consignmentDetails	= null;
		HashMap<String, Double> 	charges				= null;
		var						totalTax			= 0.00;
		var						totalDiscount		= 0.00;
		var						noOfPkgs			= 0L;

		try {

			// WayBill Charges (Booking & Delivery)
			charges			= new HashMap<>();
			for (final WayBillCharges wayBillCharge : wayBillCharges)
				charges.put("" + wayBillCharge.getWayBillChargeMasterId(),wayBillCharge.getChargeAmount());
			reportModel.setChargesCollection(charges);
			// end

			// Calculate Total WayBill Tax
			wayBillTax = wayBillDetails.get(reportModel.getWayBillId()).getWayBillTaxTxn();
			totalTax = 0.00;
			for (final WayBillTaxTxn element : wayBillTax)
				totalTax = totalTax + element.getTaxAmount();
			reportModel.setTotalTax(Math.round(totalTax));
			// end

			// Calculate Total Discount
			totalDiscount = 0.00;
			if (reportModel.isDiscountPercent())
				totalDiscount = Math.round(reportModel.getAmount() * reportModel.getDiscount() / 100);
			else
				totalDiscount = reportModel.getDiscount();
			reportModel.setDiscount(totalDiscount);
			// end

			// Consignment Details
			consignmentDetails = wayBillDetails.get(reportModel.getWayBillId()).getConsignmentDetails();
			noOfPkgs = 0;
			for (final ConsignmentDetails consignmentDetail : consignmentDetails)
				noOfPkgs = noOfPkgs + consignmentDetail.getQuantity();
			reportModel.setNoOfPackages(noOfPkgs);
			// Consignment Details

			return reportModel;

		} catch (final Exception e) {
			e.getStackTrace();
			throw e;
		} finally {
			wayBillTax			= null;
			consignmentDetails	= null;
			charges				= null;
		}
	}

	private void updateCreditorReportModel(final CityWiseCollectionReportModelForCreditor reportModelCreditor,final CityWiseCollectionReportModelForCreditor reportModel,final WayBillCharges[] wayBillCharges) throws Exception {
		HashMap<String,Double> chargesDetailsToAdd		= null;

		try {

			reportModelCreditor.setAgentCommission(reportModelCreditor.getAgentCommission()+reportModel.getAgentCommission());
			reportModelCreditor.setAmount(reportModelCreditor.getAmount()+reportModel.getAmount());
			reportModelCreditor.setGrandTotal(reportModelCreditor.getGrandTotal()+reportModel.getGrandTotal());
			reportModelCreditor.setTotalTax(reportModelCreditor.getTotalTax()+reportModel.getTotalTax());
			reportModelCreditor.setDiscount(reportModelCreditor.getDiscount()+reportModel.getDiscount());
			reportModelCreditor.setNoOfPackages(reportModelCreditor.getNoOfPackages()+reportModel.getNoOfPackages());
			reportModelCreditor.setDeliveryAmount(reportModelCreditor.getDeliveryAmount()+reportModel.getDeliveryAmount());
			reportModelCreditor.setDeliveryDiscount(reportModelCreditor.getDeliveryDiscount()+reportModel.getDeliveryDiscount());

			chargesDetailsToAdd		= reportModelCreditor.getChargesCollection();

			for (final WayBillCharges wayBillCharge : wayBillCharges)
				if(chargesDetailsToAdd.containsKey(""+wayBillCharge.getWayBillChargeMasterId())){
					final var getUpdatedCharge = wayBillCharge.getChargeAmount()+chargesDetailsToAdd.get(""+wayBillCharge.getWayBillChargeMasterId());
					chargesDetailsToAdd.put(""+wayBillCharge.getWayBillChargeMasterId(),getUpdatedCharge);
				} else
					chargesDetailsToAdd.put(""+wayBillCharge.getWayBillChargeMasterId(),wayBillCharge.getChargeAmount());
		} catch (final Exception e) {
			e.getStackTrace();
			throw e;
		} finally {
			chargesDetailsToAdd		= null;
		}
	}
}