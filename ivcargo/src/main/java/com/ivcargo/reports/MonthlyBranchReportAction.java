package com.ivcargo.reports;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.HashMap;
import java.util.SortedMap;
import java.util.TreeMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.ChargeTypeMasterDao;
import com.platform.dao.ConfigDoorDeliveryDao;
import com.platform.dao.reports.DailyBranchCollectionDAO;
import com.platform.dao.reports.MonthlyBranchReportDAO;
import com.platform.dao.reports.WayBillDetailsDAO;
import com.platform.dto.Branch;
import com.platform.dto.ChargeTypeMaster;
import com.platform.dto.Executive;
import com.platform.dto.WayBill;
import com.platform.dto.WayBillCharges;
import com.platform.dto.WayBillTaxTxn;
import com.platform.dto.WayBillType;
import com.platform.dto.constant.WayBillStatusConstant;
import com.platform.dto.constant.WayBillTypeConstant;
import com.platform.dto.model.BranchStatisticsReport;
import com.platform.dto.model.BranchStatisticsReportModel;
import com.platform.dto.model.ChargeTypeModel;
import com.platform.dto.model.CityWiseCollectionModel;
import com.platform.dto.model.DailyBranchCollectionReportModel;
import com.platform.dto.model.MonthlyBranchReportDispatchModel;
import com.platform.dto.model.WayBillCategoryTypeDetails;
import com.platform.dto.model.WayBillDeatailsModel;
import com.platform.resource.CargoErrorList;

public class MonthlyBranchReportAction implements Action{

	@Override
	@SuppressWarnings("unchecked")
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	error 			= null;
		Executive				executive		= null;
		SimpleDateFormat		sdf				= null;
		Timestamp				fromDate		= null;
		Timestamp				toDate			= null;
		CacheManip				cache			= null;
		ValueObject				objectIn		= null;
		ValueObject				objectOut		= null;
		WayBillType				wayBillType		= null;
		Branch					branch			= null;
		WayBillCharges[]		wayBillCharges	= null;
		Branch[]				branches		= null;
		Long[]					wayBillIdArray	= null;
		WayBillTaxTxn[]			wayBillTax		= null;
		ChargeTypeModel[]		bookingCharges	= null;
		ChargeTypeModel[]		deliveryCharges	= null;
		HashMap<String,Double>		bookedWBCategoryTypeDetails	= null;
		HashMap<Long,Double>		chargesCollection			= null;
		CityWiseCollectionModel		cityWiseCollectionModel		= null;
		WayBillCategoryTypeDetails	wayBillCategoryTypeDetails	= null;
		BranchStatisticsReportModel	citywiseIncomingDetails		= null;
		BranchStatisticsReportModel	cityWiseDispatchDetails		= null;
		SortedMap<String,Object>	storeCityWiseDetails		= null;
		WayBillCategoryTypeDetails	wbCategoryTypeDtlsForDlvrd	= null;
		BranchStatisticsReport[]	incomingReportModel			= null;
		DailyBranchCollectionReportModel[]	reportModel			= null;
		MonthlyBranchReportDispatchModel[]	dispatchReportModel	= null;
		HashMap<Long,WayBillDeatailsModel>	wayBillDetails		= null;
		HashMap<String,WayBillCategoryTypeDetails>		wbCategoryTypeDetails	= null;
		HashMap<String,WayBillCategoryTypeDetails>		deliveredWayBillDetails	= null;
		SortedMap<String,BranchStatisticsReportModel>	cityWiseIncomingData	= null;
		SortedMap<String,BranchStatisticsReportModel>	cityWiseDispatchData	= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeMonthlyBranchReportAction().execute(request, response);

			executive         = (Executive) request.getSession().getAttribute("executive");
			sdf               = new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			fromDate          = new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00").getTime());
			toDate            = new Timestamp(sdf.parse(JSPUtility.GetString(request, "toDate") + " 23:59:59").getTime());
			branches  		  = null;
			long 			 selectedCity      =  0;
			long   			 branchId		   = 0;
			final long 			 destinationCityId =  JSPUtility.GetLong(request, "TosubRegion",0);

			cache = new CacheManip(request);
			// Get the Selected  Combo values
			if (request.getParameter("subRegion")!=null)
				selectedCity  =  Long.parseLong(JSPUtility.GetString(request, "subRegion")) ;

			//Get all Branches
			branches = cache.getBranchesArrayBySubRegionId(request, executive.getAccountGroupId(), selectedCity);
			request.setAttribute("branches", branches);
			// Get All Executives

			if (request.getParameter("branch")!=null)
				branchId = Long.parseLong(request.getParameter("branch"));

			objectIn = new ValueObject();
			objectOut = new ValueObject();

			objectIn.put("fromDate", fromDate);
			objectIn.put("toDate", toDate);
			objectIn.put("branchId", branchId);
			objectIn.put("accountGroupId", executive.getAccountGroupId());
			objectIn.put("filter", 0);
			objectIn.put("destinationCityId", destinationCityId);
			objectIn.put("cityId", selectedCity); //For Incoming Data

			objectOut		= DailyBranchCollectionDAO.getInstance().getReportForBranch(objectIn);
			reportModel		= (DailyBranchCollectionReportModel[])objectOut.get("DailyBranchCollectionReportModel");
			wayBillIdArray	= (Long[]) objectOut.get("WayBillIdArray");

			wbCategoryTypeDetails	= new HashMap<String,WayBillCategoryTypeDetails>();
			deliveredWayBillDetails	= new HashMap<String,WayBillCategoryTypeDetails>();

			//City Wise ToPayee Details code
			storeCityWiseDetails = new TreeMap<String,Object>();
			//City Wise ToPayee Details code

			if(reportModel != null && wayBillIdArray != null){

				//Door Delivery Configuration Check
				final boolean isConfigDoorDelivery = ConfigDoorDeliveryDao.getInstance().getDoorDeliveryConfig(executive.getAccountGroupId(),executive.getAgencyId(),executive.getBranchId());
				request.setAttribute("isConfigDoorDelivery", isConfigDoorDelivery);

				//Get WayBill Details code ( Start )
				wayBillDetails = WayBillDetailsDAO.getInstance().getWayBillDetails(wayBillIdArray ,true ,ChargeTypeMaster.WAYBILL_CHARGETYPE_BOTH ,true ,WayBillTaxTxn.WAYBILL_TAX_TXN_TYPE_BOOKING ,false);
				//Get WayBill Details code ( End )

				for(int i=0; i<reportModel.length;i++){

					// Set City & Branch name
					reportModel[i].setWayBillSourceSubRegion(cache.getGenericSubRegionById(request, reportModel[i].getWayBillSourceSubRegionId()).getName());
					reportModel[i].setWayBillSourceBranch(cache.getGenericBranchDetailCache(request, reportModel[i].getWayBillSourceBranchId()).getName());
					reportModel[i].setWayBillDestinationSubRegion(cache.getGenericSubRegionById(request, reportModel[i].getWayBillDestinationSubRegionId()).getName());
					reportModel[i].setWayBillDestinationBranch(cache.getGenericBranchDetailCache(request, reportModel[i].getWayBillDestinationBranchId()).getName());
					// Set City & Branch name

					// Set WayBill Type Name
					wayBillType = cache.getWayBillTypeById(request, reportModel[i].getWayBillTypeId());
					if(reportModel[i].isManual())
						reportModel[i].setWayBillType(wayBillType.getWayBillType()+WayBillType.WAYBILL_TYPE_MANUAL);
					else reportModel[i].setWayBillType(wayBillType.getWayBillType());

					//WayBill Charges (Booking & Delivery)
					wayBillCharges = wayBillDetails.get(reportModel[i].getWayBillId()).getWayBillCharges();
					bookedWBCategoryTypeDetails = new HashMap<String,Double>();
					for (final WayBillCharges wayBillCharge : wayBillCharges) {
						if(reportModel[i].getStatus() != WayBillStatusConstant.WAYBILL_STATUS_DELIVERED && wayBillCharge.getChargeType() == ChargeTypeMaster.WAYBILL_CHARGETYPE_BOOKING)
							bookedWBCategoryTypeDetails.put(""+wayBillCharge.getWayBillChargeMasterId(), wayBillCharge.getChargeAmount());

						if(reportModel[i].getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DELIVERED && wayBillCharge.getChargeType() == ChargeTypeMaster.WAYBILL_CHARGETYPE_DELIVERY)
							bookedWBCategoryTypeDetails.put(""+wayBillCharge.getWayBillChargeMasterId(), wayBillCharge.getChargeAmount());
					}
					reportModel[i].setChargesCollection(bookedWBCategoryTypeDetails);
					//end

					//Calculate Total WayBill Tax
					wayBillTax = wayBillDetails.get(reportModel[i].getWayBillId()).getWayBillTaxTxn();
					double totalTax 				= 0.00;
					for (final WayBillTaxTxn element : wayBillTax)
						totalTax = totalTax + element.getTaxAmount();
					reportModel[i].setTotalTax(totalTax);
					//end

					//Calculate Total Discount
					double totalDiscount 		= 0.00;
					if(reportModel[i].isDiscountPercent())
						totalDiscount = Math.round(reportModel[i].getAmount() * reportModel[i].getDiscount() / 100);
					else
						totalDiscount = reportModel[i].getDiscount();
					reportModel[i].setDiscount(totalDiscount);
					//end

					if(reportModel[i].getStatus()==WayBill.WAYBILL_STATUS_BOOKED ){
						if(reportModel[i].getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_PAID){

							//City Wise Paid Details code
							cityWiseCollectionModel = (CityWiseCollectionModel)storeCityWiseDetails.get(reportModel[i].getWayBillDestinationSubRegion()+"_"+reportModel[i].getDestinationSubRegionId());

							if(cityWiseCollectionModel == null){

								cityWiseCollectionModel = new CityWiseCollectionModel();

								cityWiseCollectionModel.setSubRegionId(reportModel[i].getDestinationSubRegionId());
								cityWiseCollectionModel.setSubRegionName(reportModel[i].getWayBillDestinationSubRegion());
								cityWiseCollectionModel.setTotalPaidAmount(reportModel[i].getGrandTotal());

								storeCityWiseDetails.put(reportModel[i].getWayBillDestinationSubRegion()+"_"+reportModel[i].getDestinationSubRegionId() ,cityWiseCollectionModel);
							}
							else cityWiseCollectionModel.setTotalPaidAmount(cityWiseCollectionModel.getTotalPaidAmount() + reportModel[i].getGrandTotal());
						}else if(reportModel[i].getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_TO_PAY ){
							//City Wise ToPayee Details code
							cityWiseCollectionModel = (CityWiseCollectionModel)storeCityWiseDetails.get(reportModel[i].getWayBillDestinationSubRegion()+"_"+reportModel[i].getDestinationSubRegionId());

							if(cityWiseCollectionModel == null){

								cityWiseCollectionModel = new CityWiseCollectionModel();

								cityWiseCollectionModel.setSubRegionId(reportModel[i].getDestinationSubRegionId());
								cityWiseCollectionModel.setSubRegionName(reportModel[i].getWayBillDestinationSubRegion());
								cityWiseCollectionModel.setTotalToPayAmount(reportModel[i].getGrandTotal() + reportModel[i].getAgentCommission());

								storeCityWiseDetails.put(reportModel[i].getWayBillDestinationSubRegion()+"_"+reportModel[i].getDestinationSubRegionId() ,cityWiseCollectionModel);
							}
							else cityWiseCollectionModel.setTotalToPayAmount(cityWiseCollectionModel.getTotalToPayAmount() + reportModel[i].getGrandTotal() + reportModel[i].getAgentCommission());
						}else if(reportModel[i].getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_CREDIT ){
							//City Wise ToPayee Details code
							cityWiseCollectionModel = (CityWiseCollectionModel)storeCityWiseDetails.get(reportModel[i].getWayBillDestinationSubRegion()+"_"+reportModel[i].getDestinationSubRegionId());

							if(cityWiseCollectionModel == null){

								cityWiseCollectionModel = new CityWiseCollectionModel();

								cityWiseCollectionModel.setSubRegionId(reportModel[i].getDestinationSubRegionId());
								cityWiseCollectionModel.setSubRegionName(reportModel[i].getWayBillDestinationSubRegion());
								cityWiseCollectionModel.setTotalCreditorAmount(reportModel[i].getGrandTotal());

								storeCityWiseDetails.put(reportModel[i].getWayBillDestinationSubRegion()+"_"+reportModel[i].getDestinationSubRegionId() ,cityWiseCollectionModel);
							}
							else cityWiseCollectionModel.setTotalCreditorAmount(cityWiseCollectionModel.getTotalCreditorAmount() + reportModel[i].getGrandTotal());
						}

					}else if(reportModel[i].getStatus()==WayBill.WAYBILL_STATUS_CANCELLED)
						if(reportModel[i].getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_TO_PAY){

							//City Wise ToPayee Details code
							cityWiseCollectionModel = (CityWiseCollectionModel)storeCityWiseDetails.get(reportModel[i].getWayBillDestinationSubRegion()+"_"+reportModel[i].getDestinationSubRegionId());

							if(cityWiseCollectionModel == null){

								cityWiseCollectionModel = new CityWiseCollectionModel();

								cityWiseCollectionModel.setSubRegionId(reportModel[i].getDestinationSubRegionId());
								cityWiseCollectionModel.setSubRegionName(reportModel[i].getWayBillDestinationSubRegion());
								cityWiseCollectionModel.setTotalToPayAmount( - (reportModel[i].getGrandTotal() + reportModel[i].getAgentCommission()));

								storeCityWiseDetails.put(reportModel[i].getWayBillDestinationSubRegion()+"_"+reportModel[i].getDestinationSubRegionId() ,cityWiseCollectionModel);
							}
							else cityWiseCollectionModel.setTotalToPayAmount(cityWiseCollectionModel.getTotalToPayAmount() - (reportModel[i].getGrandTotal() + reportModel[i].getAgentCommission()));
						} else if(reportModel[i].getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_PAID){

							//City Wise Paid Details code
							cityWiseCollectionModel = (CityWiseCollectionModel)storeCityWiseDetails.get(reportModel[i].getWayBillDestinationSubRegion()+"_"+reportModel[i].getDestinationSubRegionId());

							if(cityWiseCollectionModel == null){

								cityWiseCollectionModel = new CityWiseCollectionModel();

								cityWiseCollectionModel.setSubRegionId(reportModel[i].getDestinationSubRegionId());
								cityWiseCollectionModel.setSubRegionName(reportModel[i].getWayBillDestinationSubRegion());
								cityWiseCollectionModel.setTotalPaidAmount(-reportModel[i].getGrandTotal());

								storeCityWiseDetails.put(reportModel[i].getWayBillDestinationSubRegion()+"_"+reportModel[i].getDestinationSubRegionId() ,cityWiseCollectionModel);
							}
							else cityWiseCollectionModel.setTotalPaidAmount(cityWiseCollectionModel.getTotalPaidAmount() - reportModel[i].getGrandTotal());
						} else if(reportModel[i].getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_CREDIT){

							//City Wise Credit Details code start
							cityWiseCollectionModel = (CityWiseCollectionModel)storeCityWiseDetails.get(reportModel[i].getWayBillDestinationSubRegion()+"_"+reportModel[i].getDestinationSubRegionId());

							if(cityWiseCollectionModel == null){

								cityWiseCollectionModel = new CityWiseCollectionModel();

								cityWiseCollectionModel.setSubRegionId(reportModel[i].getDestinationSubRegionId());
								cityWiseCollectionModel.setSubRegionName(reportModel[i].getWayBillDestinationSubRegion());
								cityWiseCollectionModel.setTotalCreditorAmount(-reportModel[i].getGrandTotal());

								storeCityWiseDetails.put(reportModel[i].getWayBillDestinationSubRegion()+"_"+reportModel[i].getDestinationSubRegionId() ,cityWiseCollectionModel);
							}
							else cityWiseCollectionModel.setTotalCreditorAmount(cityWiseCollectionModel.getTotalCreditorAmount()- reportModel[i].getGrandTotal());
						}

					if(isConfigDoorDelivery)
						if(reportModel[i].getStatus()==WayBill.WAYBILL_STATUS_DUEDELIVERED||reportModel[i].getStatus()==WayBill.WAYBILL_STATUS_DUEUNDELIVERED)
							if(reportModel[i].getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_PAID)
								reportModel[i].setGrandTotal(reportModel[i].getDeliveryAmount()-reportModel[i].getDeliveryDiscount());
							else if(reportModel[i].getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_FOC || reportModel[i].getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_CREDIT )
								reportModel[i].setGrandTotal(0);

					if(reportModel[i].getStatus()==WayBill.WAYBILL_STATUS_BOOKED){

						wayBillCategoryTypeDetails = wbCategoryTypeDetails.get(reportModel[i].getWayBillType());

						if(wayBillCategoryTypeDetails == null){
							wayBillCategoryTypeDetails = new WayBillCategoryTypeDetails();

							wayBillCategoryTypeDetails.setWayBillType(reportModel[i].getWayBillType());
							wayBillCategoryTypeDetails.setQuantity(reportModel[i].getNoOfPackages());
							wayBillCategoryTypeDetails.setBookingDiscount(totalDiscount);
							wayBillCategoryTypeDetails.setTotalTax(totalTax);
							wayBillCategoryTypeDetails.setTotalAmount(reportModel[i].getGrandTotal() - (reportModel[i].getDeliveryAmount() - reportModel[i].getDeliveryDiscount()));

							chargesCollection = new HashMap<Long,Double>();

							for (final WayBillCharges wayBillCharge : wayBillCharges)
								if(wayBillCharge.getChargeType() == ChargeTypeMaster.WAYBILL_CHARGETYPE_BOOKING)
									chargesCollection.put(wayBillCharge.getWayBillChargeMasterId(), wayBillCharge.getChargeAmount());
							wayBillCategoryTypeDetails.setChargesCollection(chargesCollection);

							wbCategoryTypeDetails.put(reportModel[i].getWayBillType(), wayBillCategoryTypeDetails);

						} else {

							wayBillCategoryTypeDetails.setQuantity(wayBillCategoryTypeDetails.getQuantity() + reportModel[i].getNoOfPackages());
							wayBillCategoryTypeDetails.setBookingDiscount(wayBillCategoryTypeDetails.getBookingDiscount() + totalDiscount);
							wayBillCategoryTypeDetails.setTotalTax(wayBillCategoryTypeDetails.getTotalTax() + totalTax);
							wayBillCategoryTypeDetails.setTotalAmount(wayBillCategoryTypeDetails.getTotalAmount() + (reportModel[i].getGrandTotal() - (reportModel[i].getDeliveryAmount() - reportModel[i].getDeliveryDiscount())));

							chargesCollection = wayBillCategoryTypeDetails.getChargesCollection();

							for (final WayBillCharges wayBillCharge : wayBillCharges)
								if(wayBillCharge.getChargeType() == ChargeTypeMaster.WAYBILL_CHARGETYPE_BOOKING)
									if(chargesCollection.get(wayBillCharge.getWayBillChargeMasterId()) != null)
										chargesCollection.put(wayBillCharge.getWayBillChargeMasterId(), chargesCollection.get(wayBillCharge.getWayBillChargeMasterId()) + wayBillCharge.getChargeAmount());
									else
										chargesCollection.put(wayBillCharge.getWayBillChargeMasterId(), wayBillCharge.getChargeAmount());
						}

					}else if(reportModel[i].getStatus()==WayBill.WAYBILL_STATUS_CANCELLED && (reportModel[i].getWayBillTypeId() == WayBillType.WAYBILL_TYPE_PAID ||reportModel[i].getWayBillTypeId() == WayBillType.WAYBILL_TYPE_TO_PAY || reportModel[i].getWayBillTypeId() == WayBillType.WAYBILL_TYPE_CREDIT)){

						wayBillCategoryTypeDetails = wbCategoryTypeDetails.get(reportModel[i].getWayBillType());

						if(wayBillCategoryTypeDetails == null){
							wayBillCategoryTypeDetails = new WayBillCategoryTypeDetails();

							wayBillCategoryTypeDetails.setWayBillType(reportModel[i].getWayBillType());
							wayBillCategoryTypeDetails.setQuantity(-reportModel[i].getNoOfPackages());
							wayBillCategoryTypeDetails.setBookingDiscount(-totalDiscount);
							wayBillCategoryTypeDetails.setTotalTax(-totalTax);
							wayBillCategoryTypeDetails.setTotalAmount(- (reportModel[i].getGrandTotal() - (reportModel[i].getDeliveryAmount() - reportModel[i].getDeliveryDiscount())));

							chargesCollection = new HashMap<Long,Double>();

							for(int k=0;k<wayBillCharges.length;k++)
								if(wayBillCharges[k].getChargeType() == ChargeTypeMaster.WAYBILL_CHARGETYPE_BOOKING)
									chargesCollection.put(wayBillCharges[k].getWayBillChargeMasterId(),- wayBillCharges[k].getChargeAmount());
							wayBillCategoryTypeDetails.setChargesCollection(chargesCollection);

							wbCategoryTypeDetails.put(reportModel[i].getWayBillType(), wayBillCategoryTypeDetails);

						} else {

							wayBillCategoryTypeDetails.setQuantity(wayBillCategoryTypeDetails.getQuantity() - reportModel[i].getNoOfPackages());
							wayBillCategoryTypeDetails.setBookingDiscount(wayBillCategoryTypeDetails.getBookingDiscount() - totalDiscount);
							wayBillCategoryTypeDetails.setTotalTax(wayBillCategoryTypeDetails.getTotalTax() - totalTax);
							wayBillCategoryTypeDetails.setTotalAmount(wayBillCategoryTypeDetails.getTotalAmount() - (reportModel[i].getGrandTotal() - (reportModel[i].getDeliveryAmount() - reportModel[i].getDeliveryDiscount())));

							chargesCollection = wayBillCategoryTypeDetails.getChargesCollection();

							for(int k=0;k<wayBillCharges.length;k++)
								if(wayBillCharges[k].getChargeType() == ChargeTypeMaster.WAYBILL_CHARGETYPE_BOOKING)
									if(chargesCollection.get(wayBillCharges[k].getWayBillChargeMasterId()) != null)
										chargesCollection.put(wayBillCharges[k].getWayBillChargeMasterId(), chargesCollection.get(wayBillCharges[k].getWayBillChargeMasterId()) - wayBillCharges[k].getChargeAmount());
									else
										chargesCollection.put(wayBillCharges[k].getWayBillChargeMasterId(),- wayBillCharges[k].getChargeAmount());
						}

					}else if(reportModel[i].getStatus()==WayBill.WAYBILL_STATUS_DELIVERED){

						double totalFreight 			= 0.00;
						double totalAmount 			= reportModel[i].getDeliveryAmount()-reportModel[i].getDeliveryDiscount();

						if(reportModel[i].getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_TO_PAY){
							totalFreight = reportModel[i].getGrandTotal()-(reportModel[i].getDeliveryAmount()-reportModel[i].getDeliveryDiscount());
							totalAmount = totalAmount + totalFreight;
						}

						wbCategoryTypeDtlsForDlvrd= deliveredWayBillDetails.get(reportModel[i].getWayBillType());

						if(wbCategoryTypeDtlsForDlvrd == null){
							wbCategoryTypeDtlsForDlvrd = new WayBillCategoryTypeDetails();

							wbCategoryTypeDtlsForDlvrd.setWayBillType(reportModel[i].getWayBillType());
							wbCategoryTypeDtlsForDlvrd.setQuantity(reportModel[i].getNoOfPackages());
							wbCategoryTypeDtlsForDlvrd.setTotalFreight(totalFreight);
							wbCategoryTypeDtlsForDlvrd.setDeliveryDiscount(reportModel[i].getDeliveryDiscount());
							wbCategoryTypeDtlsForDlvrd.setTotalAmount(totalAmount);

							chargesCollection = new HashMap<Long,Double>();

							for (final WayBillCharges wayBillCharge : wayBillCharges)
								if(wayBillCharge.getChargeType() == ChargeTypeMaster.WAYBILL_CHARGETYPE_DELIVERY)
									chargesCollection.put(wayBillCharge.getWayBillChargeMasterId(), wayBillCharge.getChargeAmount());
							wbCategoryTypeDtlsForDlvrd.setChargesCollection(chargesCollection);

							deliveredWayBillDetails.put(reportModel[i].getWayBillType(), wbCategoryTypeDtlsForDlvrd);
						}else{
							wbCategoryTypeDtlsForDlvrd.setQuantity(wbCategoryTypeDtlsForDlvrd.getQuantity() + reportModel[i].getNoOfPackages());
							wbCategoryTypeDtlsForDlvrd.setTotalFreight(wbCategoryTypeDtlsForDlvrd.getTotalFreight() + totalFreight);
							wbCategoryTypeDtlsForDlvrd.setDeliveryDiscount(wbCategoryTypeDtlsForDlvrd.getDeliveryDiscount() + reportModel[i].getDeliveryDiscount());
							wbCategoryTypeDtlsForDlvrd.setTotalAmount(wbCategoryTypeDtlsForDlvrd.getTotalAmount() + totalAmount);

							chargesCollection = wbCategoryTypeDtlsForDlvrd.getChargesCollection();

							for (final WayBillCharges wayBillCharge : wayBillCharges)
								if(wayBillCharge.getChargeType() == ChargeTypeMaster.WAYBILL_CHARGETYPE_DELIVERY)
									if(chargesCollection.get(wayBillCharge.getWayBillChargeMasterId()) != null)
										chargesCollection.put(wayBillCharge.getWayBillChargeMasterId(), chargesCollection.get(wayBillCharge.getWayBillChargeMasterId()) + wayBillCharge.getChargeAmount());
									else
										chargesCollection.put(wayBillCharge.getWayBillChargeMasterId(), wayBillCharge.getChargeAmount());
						}
					}
				}

				// Get Incoming Data Code Start

				objectOut = MonthlyBranchReportDAO.getInstance().getIncomingDataForBranch(objectIn);

				// Get Selected Branch Type to check if Delivery Branch
				int selectedBranchType=cache.getBranchById(request, executive.getAccountGroupId(), branchId).getBranchType();
				if(objectOut != null && (selectedBranchType == Branch.BRANCH_TYPE_DELIVERY || selectedBranchType == Branch.BRANCH_TYPE_BOOKING_DELIVERY_BOTH))
					incomingReportModel = (BranchStatisticsReport[])objectOut.get("IncomingForBranch");
				cityWiseIncomingData = new TreeMap<String,BranchStatisticsReportModel>();

				if(incomingReportModel != null)
					for (final BranchStatisticsReport element : incomingReportModel) {

						element.setSourceSubRegion(cache.getGenericSubRegionById(request, element.getSourceSubRegionId()).getName());

						citywiseIncomingDetails = cityWiseIncomingData.get(element.getSourceSubRegion()+"_"+element.getSourceSubRegionId());

						if(citywiseIncomingDetails == null){

							citywiseIncomingDetails = new BranchStatisticsReportModel();

							citywiseIncomingDetails.setSourceSubRegionName(element.getSourceSubRegion());
							if(element.getWayBillTypeId() == WayBillType.WAYBILL_TYPE_PAID)
								citywiseIncomingDetails.setTotalPaidAmount(element.getGrandTotal());
							else if(element.getWayBillTypeId() == WayBillType.WAYBILL_TYPE_TO_PAY)
								citywiseIncomingDetails.setTotalToPayAmount(element.getGrandTotal());
							else if(element.getWayBillTypeId() == WayBillType.WAYBILL_TYPE_CREDIT)
								citywiseIncomingDetails.setTotalCreditAmount(element.getGrandTotal());

							cityWiseIncomingData.put(element.getSourceSubRegion()+"_"+element.getSourceSubRegionId() ,citywiseIncomingDetails);

						} else if(element.getWayBillTypeId() == WayBillType.WAYBILL_TYPE_PAID)
							citywiseIncomingDetails.setTotalPaidAmount(citywiseIncomingDetails.getTotalPaidAmount() + element.getGrandTotal());
						else if(element.getWayBillTypeId() == WayBillType.WAYBILL_TYPE_TO_PAY)
							citywiseIncomingDetails.setTotalToPayAmount(citywiseIncomingDetails.getTotalToPayAmount() + element.getGrandTotal());
						else if(element.getWayBillTypeId() == WayBillType.WAYBILL_TYPE_CREDIT)
							citywiseIncomingDetails.setTotalCreditAmount(citywiseIncomingDetails.getTotalCreditAmount() + element.getGrandTotal());
					}

				// Get Incoming Data Code End

				// Get Dispatch Data Code Start
				objectOut= MonthlyBranchReportDAO.getInstance().getDispatchDataForBranch(objectIn);
				// Get Selected Branch Type to check if Delivery Branch
				selectedBranchType=cache.getBranchById(request, executive.getAccountGroupId(), branchId).getBranchType();
				if(objectOut!=null && (selectedBranchType == Branch.BRANCH_TYPE_DELIVERY || selectedBranchType == Branch.BRANCH_TYPE_BOOKING_DELIVERY_BOTH))
					dispatchReportModel = (MonthlyBranchReportDispatchModel[])objectOut.get("DispatchForBranch");

				cityWiseDispatchData = new TreeMap<String,BranchStatisticsReportModel>();
				if (dispatchReportModel != null)
					for (final MonthlyBranchReportDispatchModel element : dispatchReportModel) {

						element.setSourceSubRegion(cache.getGenericSubRegionById(request, element.getSourceSubRegionId()).getName());

						cityWiseDispatchDetails = cityWiseDispatchData.get(element.getSourceSubRegion()+"_"+element.getSourceSubRegionId());

						if(cityWiseDispatchDetails == null){

							cityWiseDispatchDetails = new BranchStatisticsReportModel();

							cityWiseDispatchDetails.setSourceSubRegionName(element.getSourceSubRegion());
							if(element.getWayBillTypeId() == WayBillType.WAYBILL_TYPE_PAID)
								cityWiseDispatchDetails.setTotalPaidAmount(element.getGrandTotal());
							else if(element.getWayBillTypeId() == WayBillType.WAYBILL_TYPE_TO_PAY)
								cityWiseDispatchDetails.setTotalToPayAmount(element.getGrandTotal());
							else if(element.getWayBillTypeId() == WayBillType.WAYBILL_TYPE_CREDIT)
								cityWiseDispatchDetails.setTotalCreditAmount(element.getGrandTotal());

							cityWiseDispatchData.put(element.getSourceSubRegion()+"_"+element.getSourceSubRegionId() ,cityWiseDispatchDetails);

						} else if(element.getWayBillTypeId() == WayBillType.WAYBILL_TYPE_PAID)
							cityWiseDispatchDetails.setTotalPaidAmount(cityWiseDispatchDetails.getTotalPaidAmount() + element.getGrandTotal());
						else if(element.getWayBillTypeId() == WayBillType.WAYBILL_TYPE_TO_PAY)
							cityWiseDispatchDetails.setTotalToPayAmount(cityWiseDispatchDetails.getTotalToPayAmount() + element.getGrandTotal());
						else if(element.getWayBillTypeId() == WayBillType.WAYBILL_TYPE_CREDIT)
							cityWiseDispatchDetails.setTotalCreditAmount(cityWiseDispatchDetails.getTotalCreditAmount() + element.getGrandTotal());
					}

				request.setAttribute("wayBillTypeDetails", wbCategoryTypeDetails);
				request.setAttribute("deliveredWayBillDetails", deliveredWayBillDetails);
				request.setAttribute("storeCityWiseDetails", storeCityWiseDetails);
				request.setAttribute("cityWiseIncomingData", cityWiseIncomingData);
				request.setAttribute("cityWiseDispatchData", cityWiseDispatchData);

				if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_GROUPADMIN) {

					branch = cache.getBranchById(request ,executive.getAccountGroupId(), branchId);

					if(branch.getMappingTypeId() == Branch.BRANCH_MAP_ID_OWN_BRANCH_AND_ASSIGNED) {
						bookingCharges 	= cache.getBookingCharges(request, executive.getBranchId());
						deliveryCharges = cache.getDeliveryCharges(request, executive.getBranchId());
					} else {
						bookingCharges 	= cache.getBookingCharges(request, branchId);
						deliveryCharges = cache.getDeliveryCharges(request, branchId);

						if(bookingCharges == null)
							bookingCharges  = ChargeTypeMasterDao.getInstance().getChargeConfiguration(reportModel[0].getAccountGroupId(), branch.getAgencyId(), branch.getBranchId(),ChargeTypeMaster.WAYBILL_CHARGETYPE_BOOKING);

						if(deliveryCharges == null)
							deliveryCharges = ChargeTypeMasterDao.getInstance().getChargeConfiguration(reportModel[0].getAccountGroupId(), branch.getAgencyId(), branch.getBranchId(),ChargeTypeMaster.WAYBILL_CHARGETYPE_DELIVERY);
					}
				} else {
					bookingCharges 	= cache.getBookingCharges(request, executive.getBranchId());
					deliveryCharges = cache.getDeliveryCharges(request, executive.getBranchId());
				}
				request.setAttribute("BookingCharges",bookingCharges);
				request.setAttribute("DeliveryCharges",deliveryCharges);
				ActionStaticUtil.setReportViewModel(request);
				request.setAttribute("nextPageToken", "success");
			} else {
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		} finally {
			error 			= null;
			executive		= null;
			sdf				= null;
			fromDate		= null;
			toDate			= null;
			cache			= null;
			objectIn		= null;
			objectOut		= null;
			wayBillType		= null;
			branch			= null;
			wayBillCharges	= null;
			branches		= null;
			wayBillIdArray	= null;
			wayBillTax		= null;
			bookingCharges	= null;
			deliveryCharges	= null;
			bookedWBCategoryTypeDetails	= null;
			chargesCollection			= null;
			cityWiseCollectionModel		= null;
			wayBillCategoryTypeDetails	= null;
			citywiseIncomingDetails		= null;
			cityWiseDispatchDetails		= null;
			storeCityWiseDetails		= null;
			wbCategoryTypeDtlsForDlvrd	= null;
			incomingReportModel			= null;
			reportModel			= null;
			dispatchReportModel	= null;
			wayBillDetails		= null;
			wbCategoryTypeDetails	= null;
			deliveredWayBillDetails	= null;
			cityWiseIncomingData	= null;
			cityWiseDispatchData	= null;
		}
	}
}
