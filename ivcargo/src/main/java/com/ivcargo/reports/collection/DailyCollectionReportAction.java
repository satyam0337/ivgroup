package com.ivcargo.reports.collection;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.reports.ReportView;
import com.ivcargo.reports.collection.initialize.InitializeDailyCollectionReportAction;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.ChargeTypeMasterDao;
import com.platform.dao.ConfigDoorDeliveryDao;
import com.platform.dao.ConsignmentSummaryDao;
import com.platform.dao.CustomerDetailsDao;
import com.platform.dao.DeliveryContactDetailsDao;
import com.platform.dao.ExecutiveDao;
import com.platform.dao.reports.DailyCollectionDAO;
import com.platform.dao.reports.WayBillDetailsDAO;
import com.platform.dto.Branch;
import com.platform.dto.ChargeTypeMaster;
import com.platform.dto.ConsignmentSummary;
import com.platform.dto.CustomerDetails;
import com.platform.dto.DeliveryContactDetails;
import com.platform.dto.ECargoConstantFile;
import com.platform.dto.Executive;
import com.platform.dto.WayBillCharges;
import com.platform.dto.WayBillTaxTxn;
import com.platform.dto.WayBillType;
import com.platform.dto.configuration.report.collection.DailyCollectionReportConfigurationDTO;
import com.platform.dto.constant.CargoAccountGroupConstant;
import com.platform.dto.constant.PaymentTypeConstant;
import com.platform.dto.constant.WayBillStatusConstant;
import com.platform.dto.constant.WayBillTypeConstant;
import com.platform.dto.model.ChargeTypeModel;
import com.platform.dto.model.DailyCollectionReportModel;
import com.platform.dto.model.ReportViewModel;
import com.platform.dto.model.WayBillCategoryTypeDetails;
import com.platform.dto.model.WayBillDeatailsModel;
import com.platform.dto.model.WayBillExpenseModel;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

/**
 * @author Anant Chaudhary	03-02-2016
 * Transfer in new Package com.ivcargo.reports.collection
 *
 */

public class DailyCollectionReportAction implements Action {

	@Override
	@SuppressWarnings("unchecked")
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String, Object>						error 							= null;
		Executive        							executive       				= null;
		SimpleDateFormat 							sdf             				= null;
		Timestamp        							fromDate        				= null;
		Timestamp        							toDate          				= null;
		Branch[]    								branches  						= null;
		Executive[] 								execs     						= null;
		CacheManip 									cache 							= null;
		Long[]										executiveIdsArr					= null;
		String										wayBillIdsStr					= null;
		String										executiveIdsStr					= null;
		ValueObject									objectIn						= null;
		ValueObject									objectOut						= null;
		Long[]										wayBillIdArray					= null;
		ReportViewModel								reportViewModel 				= null;
		WayBillType									wayBillType						= null;
		WayBillCharges[]							wayBillCharges					= null;
		WayBillTaxTxn[]								wayBillTax						= null;
		Branch										branch							= null;
		ChargeTypeModel[]							bookingCharges  				= null;
		ChargeTypeModel[]							deliveryCharges 				= null;
		HashMap<Long, Double>						chargesCollection				= null;
		ArrayList<Long>								deliveredWayBills				= null;
		ArrayList<Long>								cancelledWayBills				= null;
		HashMap<Long, ConsignmentSummary>			pkgsColl						= null;
		HashMap<Long, CustomerDetails>				consignorColl					= null;
		HashMap<Long, CustomerDetails>				consigneeColl					= null;
		HashMap<Long, Executive>					executiveColl					= null;
		DailyCollectionReportModel[]				reportModel						= null;
		WayBillExpenseModel[]						wayBillExpenseModel				= null;
		HashMap<Long, DailyCollectionReportModel>	booking							= null;
		HashMap<Long, DailyCollectionReportModel>	cancellation					= null;
		HashMap<Long, DailyCollectionReportModel>	creditDelivery					= null;
		HashMap<Long, DailyCollectionReportModel>	foc								= null;
		HashMap<Long, DailyCollectionReportModel>	focManual						= null;
		HashMap<Long, DailyCollectionReportModel>	toPayeeBooking					= null;
		HashMap<Long, DailyCollectionReportModel>	creditorBooking					= null;
		HashMap<Long, DailyCollectionReportModel>	bookingManual 					= null;
		HashMap<Long, DailyCollectionReportModel>	toPayeeBookingManual			= null;
		HashMap<Long, DailyCollectionReportModel>	creditorBookingManual			= null;
		HashMap<Long, DailyCollectionReportModel>	deuDeliver						= null;
		HashMap<String, WayBillCategoryTypeDetails>	wbCategoryTypeDetails			= null;
		HashMap<String, WayBillCategoryTypeDetails>	deliveredWayBillDetails			= null;
		HashMap<String, Double> 					bookedWayBillCategoryTypeDetails= null;
		WayBillCategoryTypeDetails					wayBillCategoryTypeDetails		= null;
		WayBillCategoryTypeDetails					wbCategoryTypeDetailsForDlvrd	= null;
		HashMap<Long, WayBillDeatailsModel>			wayBillDetails					= null;
		long 										selectedBranch  				= 0;
		long 										selectedCity    				= 0;
		HashMap<Long, DailyCollectionReportModel>	deliveryCancellation			= null;
		ArrayList<Long>								deliveryCancelledWayBills		= null;
		HashMap<Long, DeliveryContactDetails>		cancelledWayBillTotal			= null;
		Executive        							executiveDB       				= null;
		double										deliveryCancellationTotal		= 0;
		ValueObject									configuration					= null;
		boolean										showCashCollectionInReport		= false;
		double										totalDeliveryBillCreditTotal	= 0;
		ArrayList<DailyCollectionReportModel>     	deliveryList					= null;
		ArrayList<DailyCollectionReportModel>     	deliveryCancellationList		= null;
		DailyCollectionReportModel					dailyCollectionReportModel		= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeDailyCollectionReportAction().execute(request, response);

			sdf			= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			fromDate	= new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00").getTime());
			cache		= new CacheManip(request);
			executive	= cache.getExecutive(request);

			toDate = new Timestamp(sdf.parse(JSPUtility.GetString(request, "toDate") + " 23:59:59").getTime());

			// Get the Selected  Combo values
			if(request.getParameter("TosubRegion") != null)
				selectedCity = Long.parseLong(JSPUtility.GetString(request, "TosubRegion")) ;
			if(request.getParameter("SelectDestBranch") != null)
				selectedBranch = Long.parseLong(JSPUtility.GetString(request, "SelectDestBranch")) ;
			else
				selectedBranch = executive.getBranchId();

			//Get all Branches
			branches = cache.getBranchesArrayBySubRegionId(request, executive.getAccountGroupId(), selectedCity);
			request.setAttribute("destBranches", branches);
			//Get All Executives
			execs = ExecutiveDao.getInstance().findByBranchId(selectedBranch);
			request.setAttribute("execs", execs);

			configuration					= ReadAllConfigurationsBllImpl.getInstance().getOldReportConfigurationData(ReportIdentifierConstant.DAILY_COLLECTION_REPORT, executive.getAccountGroupId());

			showCashCollectionInReport		= configuration.getBoolean(DailyCollectionReportConfigurationDTO.SHOW_CASH_COLLECTION_IN_REPORT,false);

			long executiveId = 0;
			objectIn	= new ValueObject();
			objectOut	= new ValueObject();

			if(request.getParameter("Executive") != null)
				executiveId = Long.parseLong(request.getParameter("Executive"));
			else
				executiveId = executive.getExecutiveId();

			objectIn.put("fromDate", fromDate);
			objectIn.put("toDate", toDate);
			objectIn.put("executiveId", executiveId);
			objectIn.put("executive", executive);
			objectIn.put("filter", 0);
			objectIn.put("filter1", 2);
			objectIn.put("accountGroupId", executive.getAccountGroupId());

			objectOut = DailyCollectionDAO.getInstance().getReportForExecutive(objectIn);

			reportModel					= (DailyCollectionReportModel[])objectOut.get("DailyCollectionReportModel");
			wayBillIdArray				= (Long[]) objectOut.get("WayBillIdArray");

			if(objectOut.get("WayBillExpenseModel") != null) {
				wayBillExpenseModel = (WayBillExpenseModel[]) objectOut.get("WayBillExpenseModel");
				request.setAttribute("WayBillExpenseModel", wayBillExpenseModel);
			}

			if(reportModel != null && wayBillIdArray != null){

				reportViewModel = new ReportViewModel();
				reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);
				request.setAttribute("ReportViewModel",reportViewModel);

				boolean doNotShow_Disc = false; // if any disc found then column will be generated for disc in report
				boolean doNotShow_Tax = false;  // if any tax found then column will be generated for tax in report
				boolean doNotShow_Commission = false; // if any commission found then column will be generated for commission in report

				booking 				= new LinkedHashMap<Long,DailyCollectionReportModel>();
				cancellation 			= new LinkedHashMap<Long,DailyCollectionReportModel>();
				creditDelivery			= new LinkedHashMap<Long,DailyCollectionReportModel>();
				foc						= new LinkedHashMap<Long,DailyCollectionReportModel>();
				focManual				= new LinkedHashMap<Long,DailyCollectionReportModel>();
				toPayeeBooking			= new LinkedHashMap<Long,DailyCollectionReportModel>();
				creditorBooking			= new LinkedHashMap<Long,DailyCollectionReportModel>();
				bookingManual 			= new LinkedHashMap<Long,DailyCollectionReportModel>();
				toPayeeBookingManual	= new LinkedHashMap<Long,DailyCollectionReportModel>();
				creditorBookingManual	= new LinkedHashMap<Long,DailyCollectionReportModel>();
				deuDeliver				= new LinkedHashMap<Long,DailyCollectionReportModel>();
				deliveredWayBills		= new ArrayList<Long>();
				cancelledWayBills		= new ArrayList<Long>();
				deliveryCancelledWayBills		= new ArrayList<Long>();
				wbCategoryTypeDetails			= new HashMap<String,WayBillCategoryTypeDetails>();
				deliveredWayBillDetails			= new HashMap<String,WayBillCategoryTypeDetails>();
				deliveryCancellation 			= new LinkedHashMap<Long,DailyCollectionReportModel>();
				double totalBookingGrandAmount 		= 0;
				double totalCancellationGrandAmount = 0;
				double totalDeliverGrandAmount 		= 0;
				double toPayCommissionToBeLess 		= 0;
				double bookingChequeTotal			= 0.0;
				double deliveryChequeTotal			= 0.0;
				deliveryList				= new ArrayList<DailyCollectionReportModel>();
				deliveryCancellationList	= new ArrayList<DailyCollectionReportModel>();

				wayBillIdsStr	= Utility.GetLongArrayToString(wayBillIdArray);
				pkgsColl		= ConsignmentSummaryDao.getInstance().getLimitedConsignmentDetails(wayBillIdsStr);//Get Packages Data for both Summary & Details
				consignorColl 	= CustomerDetailsDao.getInstance().getConsignorDetailsByWayBillId(wayBillIdsStr);
				consigneeColl 	= CustomerDetailsDao.getInstance().getConsigneeDetailsByWayBillId(wayBillIdsStr);

				executiveIdsArr 		= (Long[])objectOut.get("ExecutiveIdsArr");
				executiveIdsStr			= Utility.GetLongArrayToString(executiveIdsArr);
				executiveColl			= ExecutiveDao.getInstance().getExecutiveDetailsByExecutiveIds(executiveIdsStr);
				executiveDB				= ExecutiveDao.getInstance().findByExecutiveId(executiveId);
				cancelledWayBillTotal	= DeliveryContactDetailsDao.getInstance().getGrantotalOFCancelledLR(executiveDB.getBranchId(),executiveDB.getExecutiveId(), fromDate, toDate);

				//Get WayBill Details code ( Start )
				wayBillDetails = WayBillDetailsDAO.getInstance().getWayBillDetails(wayBillIdArray ,true ,ChargeTypeMaster.WAYBILL_CHARGETYPE_BOTH ,true ,WayBillTaxTxn.WAYBILL_TAX_TXN_TYPE_BOOKING ,false);
				//Get WayBill Details code ( End )

				//Door Delivery Configuration Check
				final boolean isConfigDoorDelivery = ConfigDoorDeliveryDao.getInstance().getDoorDeliveryConfig(executive.getAccountGroupId(),executive.getAgencyId(),executive.getBranchId());
				request.setAttribute("isConfigDoorDelivery", isConfigDoorDelivery);

				//only For Rishabh Travels ( Start )
				boolean rishabhCreditFlag = false;
				if(executive.getAccountGroupId() == ECargoConstantFile.ACCOUNTGORUPID_RISHABH_TRAVELS
						&& executive.getExecutiveType() != Executive.EXECUTIVE_TYPE_GROUPADMIN)
					rishabhCreditFlag = true;

				for(int i=0; i<reportModel.length;i++){

					reportModel[i].setNoOfPackages(pkgsColl.get(reportModel[i].getWayBillId()).getQuantity());
					reportModel[i].setConsignorName(consignorColl.get(reportModel[i].getWayBillId()).getName());
					reportModel[i].setConsigneeName(consigneeColl.get(reportModel[i].getWayBillId()).getName());
					reportModel[i].setExecutive(executiveColl.get(reportModel[i].getExecutiveId()).getName());

					if(rishabhCreditFlag && reportModel[i].getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT)
						reportModel[i].setGrandTotal(0);

					//show commission column
					if(reportModel[i].getAgentCommission() > 0)
						doNotShow_Commission = true;

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
					bookedWayBillCategoryTypeDetails = new HashMap<String,Double>();
					for (final WayBillCharges wayBillCharge : wayBillCharges) {
						if(reportModel[i].getStatus() != WayBillStatusConstant.WAYBILL_STATUS_DELIVERED && wayBillCharge.getChargeType() == ChargeTypeMaster.WAYBILL_CHARGETYPE_BOOKING){
							if(reportModel[i].getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT
									&& wayBillCharge.getWayBillChargeMasterId() != ChargeTypeMaster.LOADING
									&& rishabhCreditFlag)
								wayBillCharge.setChargeAmount(0);
							bookedWayBillCategoryTypeDetails.put(""+wayBillCharge.getWayBillChargeMasterId(), wayBillCharge.getChargeAmount());
						}

						if(reportModel[i].getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DELIVERED && wayBillCharge.getChargeType() == ChargeTypeMaster.WAYBILL_CHARGETYPE_DELIVERY)
							bookedWayBillCategoryTypeDetails.put(""+wayBillCharge.getWayBillChargeMasterId(), wayBillCharge.getChargeAmount());
					}
					reportModel[i].setChargesCollection(bookedWayBillCategoryTypeDetails);
					//end

					//Calculate Total WayBill Tax
					wayBillTax = wayBillDetails.get(reportModel[i].getWayBillId()).getWayBillTaxTxn();
					double totalTax 				= 0.00;

					for (final WayBillTaxTxn element : wayBillTax)
						totalTax = totalTax + element.getTaxAmount();

					totalTax = Math.round(totalTax);
					reportModel[i].setTotalTax(totalTax);

					if(totalTax > 0)
						doNotShow_Tax = true;

					//Calculate Total Discount
					double totalDiscount 		= 0.00;
					if(reportModel[i].isDiscountPercent())
						totalDiscount = Math.round(reportModel[i].getAmount() * reportModel[i].getDiscount() / 100);
					else
						totalDiscount = reportModel[i].getDiscount();

					reportModel[i].setDiscount(totalDiscount);

					if(totalDiscount > 0)
						doNotShow_Disc = true;

					if(reportModel[i].getStatus()==WayBillStatusConstant.WAYBILL_STATUS_BOOKED ){
						if(reportModel[i].getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_PAID){
							if(!reportModel[i].isManual())
								booking.put(reportModel[i].getWayBillId(), reportModel[i]);
							else
								bookingManual.put(reportModel[i].getWayBillId(), reportModel[i]);
						} else if(reportModel[i].getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_FOC){
							if(!reportModel[i].isManual())
								foc.put(reportModel[i].getWayBillId(), reportModel[i]);
							else
								focManual.put(reportModel[i].getWayBillId(), reportModel[i]);
						} else if(reportModel[i].getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_TO_PAY ){
							if(!reportModel[i].isManual())
								toPayeeBooking.put(reportModel[i].getWayBillId(), reportModel[i]);
							else
								toPayeeBookingManual.put(reportModel[i].getWayBillId(), reportModel[i]);
						} else if( reportModel[i].getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_CREDIT)
							if(!reportModel[i].isManual())
								creditorBooking.put(reportModel[i].getWayBillId(), reportModel[i]);
							else
								creditorBookingManual.put(reportModel[i].getWayBillId(), reportModel[i]);

					}else if(reportModel[i].getStatus()==WayBillStatusConstant.WAYBILL_STATUS_CANCELLED){

						cancellation.put(reportModel[i].getWayBillId(), reportModel[i]);

						if(reportModel[i].getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_TO_PAY || reportModel[i].getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_CREDIT )
							cancelledWayBills.add(reportModel[i].getWayBillId());

					}else if(reportModel[i].getStatus()==WayBillStatusConstant.WAYBILL_STATUS_DELIVERED
							|| reportModel[i].getStatus()==WayBillStatusConstant.WAYBILL_STATUS_DELIVERED_BEFORE_CANCEL && showCashCollectionInReport){

						if(executive.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNT_GROUP_ID_FALCON_CARGO || !deliveredWayBills.contains(reportModel[i].getWayBillId()))
							deliveryList.add(reportModel[i]);

						deliveredWayBills.add(reportModel[i].getWayBillId());

					}else if(reportModel[i].getStatus()==WayBillStatusConstant.WAYBILL_STATUS_CREDIT_DELIVERED)
						creditDelivery.put(reportModel[i].getWayBillId(), reportModel[i]);
					else if(reportModel[i].getStatus()==WayBillStatusConstant.WAYBILL_STATUS_CANCELLED_DELIVERY) {
						if(!showCashCollectionInReport) {
							if(reportModel[i].getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID){
								if(cancelledWayBillTotal.get(reportModel[i].getWayBillId())!=null && (cancelledWayBillTotal.get(reportModel[i].getWayBillId()).getPaymentType()==PaymentTypeConstant.PAYMENT_TYPE_BILL_CREDIT_ID||cancelledWayBillTotal.get(reportModel[i].getWayBillId()).getPaymentType()==PaymentTypeConstant.PAYMENT_TYPE_CREDIT_ID ))
									reportModel[i].setAmount(0.0);
								else if(cancelledWayBillTotal.get(reportModel[i].getWayBillId())!=null)
									reportModel[i].setAmount(cancelledWayBillTotal.get(reportModel[i].getWayBillId()).getDeliveryTotal());
							}else if(reportModel[i].getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY)
								if(cancelledWayBillTotal.get(reportModel[i].getWayBillId())!=null && (cancelledWayBillTotal.get(reportModel[i].getWayBillId()).getPaymentType()==PaymentTypeConstant.PAYMENT_TYPE_BILL_CREDIT_ID||cancelledWayBillTotal.get(reportModel[i].getWayBillId()).getPaymentType()==PaymentTypeConstant.PAYMENT_TYPE_CREDIT_ID ))
									reportModel[i].setAmount(0.0);
								else if(cancelledWayBillTotal.get(reportModel[i].getWayBillId())!=null)
									reportModel[i].setAmount(cancelledWayBillTotal.get(reportModel[i].getWayBillId()).getGrandTotal());

							if(cancelledWayBillTotal.get(reportModel[i].getWayBillId()) != null)
								reportModel[i].setPaymentTypeId(cancelledWayBillTotal.get(reportModel[i].getWayBillId()).getPaymentType());
						} else if(reportModel[i].getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID){
							if(reportModel[i].getPaymentTypeId()==PaymentTypeConstant.PAYMENT_TYPE_BILL_CREDIT_ID||reportModel[i].getPaymentTypeId()==PaymentTypeConstant.PAYMENT_TYPE_CREDIT_ID )
								reportModel[i].setAmount(0.0);
							else
								reportModel[i].setAmount(reportModel[i].getCancelledCrAmount());
						}else if(reportModel[i].getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY)
							if(reportModel[i].getPaymentTypeId()==PaymentTypeConstant.PAYMENT_TYPE_BILL_CREDIT_ID||reportModel[i].getPaymentTypeId()==PaymentTypeConstant.PAYMENT_TYPE_CREDIT_ID )
								reportModel[i].setAmount(0.0);
							else if(cancelledWayBillTotal.get(reportModel[i].getWayBillId())!=null)
								reportModel[i].setAmount(reportModel[i].getCancelledCrAmount());
						if(showCashCollectionInReport)
							deliveryCancellationList.add(reportModel[i]);
						else
							deliveryCancellation.put(reportModel[i].getWayBillId(), reportModel[i]);
						deliveryCancelledWayBills.add(reportModel[i].getWayBillId());
					}

					if(isConfigDoorDelivery && (reportModel[i].getStatus()==WayBillStatusConstant.WAYBILL_STATUS_DUEDELIVERED||reportModel[i].getStatus()==WayBillStatusConstant.WAYBILL_STATUS_DUEUNDELIVERED))
					{
						if(reportModel[i].getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_PAID)
							reportModel[i].setGrandTotal(reportModel[i].getDeliveryAmount()-reportModel[i].getDeliveryDiscount());
						else if(reportModel[i].getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_FOC || reportModel[i].getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_CREDIT )
							reportModel[i].setGrandTotal(0);
						deuDeliver.put(reportModel[i].getWayBillId(), reportModel[i]);
					}

					if(reportModel[i].getStatus()==WayBillStatusConstant.WAYBILL_STATUS_BOOKED){

						if(reportModel[i].getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID){
							totalBookingGrandAmount += reportModel[i].getGrandTotal();
							if(reportModel[i].getPaymentTypeId() == PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID)
								bookingChequeTotal += reportModel[i].getGrandTotal();
						}else if(reportModel[i].getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY)
							toPayCommissionToBeLess += reportModel[i].getAgentCommission();

						wayBillCategoryTypeDetails = wbCategoryTypeDetails.get(reportModel[i].getWayBillType());

						if(wayBillCategoryTypeDetails == null){
							wayBillCategoryTypeDetails = new WayBillCategoryTypeDetails();

							wayBillCategoryTypeDetails.setWayBillType(reportModel[i].getWayBillType());
							wayBillCategoryTypeDetails.setQuantity(reportModel[i].getNoOfPackages());
							wayBillCategoryTypeDetails.setBookingDiscount(totalDiscount);
							wayBillCategoryTypeDetails.setTotalTax(totalTax);
							wayBillCategoryTypeDetails.setTotalAmount(reportModel[i].getGrandTotal() - (reportModel[i].getDeliveryAmount() - reportModel[i].getDeliveryDiscount()));
							wayBillCategoryTypeDetails.setAgentCommission(reportModel[i].getAgentCommission());
							wayBillCategoryTypeDetails.setBookingCommission(reportModel[i].getBookingCommission());

							chargesCollection = new HashMap<Long,Double>();

							for (final WayBillCharges wayBillCharge : wayBillCharges)
								if(wayBillCharge.getChargeType() == ChargeTypeMaster.WAYBILL_CHARGETYPE_BOOKING)
									chargesCollection.put(wayBillCharge.getWayBillChargeMasterId(), wayBillCharge.getChargeAmount());
							wayBillCategoryTypeDetails.setChargesCollection(chargesCollection);

							wbCategoryTypeDetails.put(reportModel[i].getWayBillType(), wayBillCategoryTypeDetails);
						}else{

							wayBillCategoryTypeDetails.setQuantity(wayBillCategoryTypeDetails.getQuantity() + reportModel[i].getNoOfPackages());
							wayBillCategoryTypeDetails.setBookingDiscount(wayBillCategoryTypeDetails.getBookingDiscount() + totalDiscount);
							wayBillCategoryTypeDetails.setTotalTax(wayBillCategoryTypeDetails.getTotalTax() + totalTax);
							wayBillCategoryTypeDetails.setTotalAmount(wayBillCategoryTypeDetails.getTotalAmount() + (reportModel[i].getGrandTotal() - (reportModel[i].getDeliveryAmount() - reportModel[i].getDeliveryDiscount())));
							wayBillCategoryTypeDetails.setAgentCommission(wayBillCategoryTypeDetails.getAgentCommission() + reportModel[i].getAgentCommission());
							wayBillCategoryTypeDetails.setBookingCommission(wayBillCategoryTypeDetails.getBookingCommission() + reportModel[i].getBookingCommission());
							chargesCollection = wayBillCategoryTypeDetails.getChargesCollection();

							for (final WayBillCharges wayBillCharge : wayBillCharges)
								if(wayBillCharge.getChargeType() == ChargeTypeMaster.WAYBILL_CHARGETYPE_BOOKING)
									if(chargesCollection.get(wayBillCharge.getWayBillChargeMasterId()) != null)
										chargesCollection.put(wayBillCharge.getWayBillChargeMasterId(), chargesCollection.get(wayBillCharge.getWayBillChargeMasterId()) + wayBillCharge.getChargeAmount());
									else
										chargesCollection.put(wayBillCharge.getWayBillChargeMasterId(), wayBillCharge.getChargeAmount());
						}

					}else if(reportModel[i].getStatus()==WayBillStatusConstant.WAYBILL_STATUS_CANCELLED && (reportModel[i].getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID||reportModel[i].getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY || reportModel[i].getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT)){

						if(reportModel[i].getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID){
							if(showCashCollectionInReport && reportModel[i].getPaymentTypeId() == PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID){
								//DO Nothing No Need To Add Amount To Cancellation
							} else
								totalCancellationGrandAmount += Math.round(reportModel[i].getGrandTotal()-reportModel[i].getAmount());

						}else if(reportModel[i].getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY)
							totalCancellationGrandAmount += Math.round(-reportModel[i].getAmount());

						wayBillCategoryTypeDetails = wbCategoryTypeDetails.get(reportModel[i].getWayBillType());

						if(wayBillCategoryTypeDetails == null){

							if(showCashCollectionInReport && reportModel[i].getPaymentTypeId() == PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID){
								//Do Nothing
							} else{
								wayBillCategoryTypeDetails = new WayBillCategoryTypeDetails();

								wayBillCategoryTypeDetails.setWayBillType(reportModel[i].getWayBillType());
								wayBillCategoryTypeDetails.setQuantity(-reportModel[i].getNoOfPackages());
								wayBillCategoryTypeDetails.setBookingDiscount(-totalDiscount);
								wayBillCategoryTypeDetails.setTotalTax(-totalTax);
								wayBillCategoryTypeDetails.setTotalAmount(- (reportModel[i].getGrandTotal() - (reportModel[i].getDeliveryAmount() - reportModel[i].getDeliveryDiscount())));
								wayBillCategoryTypeDetails.setAgentCommission(- reportModel[i].getAgentCommission());
								wayBillCategoryTypeDetails.setBookingCommission(- reportModel[i].getBookingCommission());
								chargesCollection = new HashMap<Long,Double>();

								for(int k=0;k<wayBillCharges.length;k++)
									if(wayBillCharges[k].getChargeType() == ChargeTypeMaster.WAYBILL_CHARGETYPE_BOOKING)
										chargesCollection.put(wayBillCharges[k].getWayBillChargeMasterId(),- wayBillCharges[k].getChargeAmount());
								wayBillCategoryTypeDetails.setChargesCollection(chargesCollection);

								wbCategoryTypeDetails.put(reportModel[i].getWayBillType(), wayBillCategoryTypeDetails);
							}

						} else if(showCashCollectionInReport && reportModel[i].getPaymentTypeId() == PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID){
							//Do Nothing
						} else{
							wayBillCategoryTypeDetails.setQuantity(wayBillCategoryTypeDetails.getQuantity() - reportModel[i].getNoOfPackages());
							wayBillCategoryTypeDetails.setBookingDiscount(wayBillCategoryTypeDetails.getBookingDiscount() - totalDiscount);
							wayBillCategoryTypeDetails.setTotalTax(wayBillCategoryTypeDetails.getTotalTax() - totalTax);
							wayBillCategoryTypeDetails.setTotalAmount(wayBillCategoryTypeDetails.getTotalAmount() - (reportModel[i].getGrandTotal() - (reportModel[i].getDeliveryAmount() - reportModel[i].getDeliveryDiscount())));
							wayBillCategoryTypeDetails.setAgentCommission(wayBillCategoryTypeDetails.getAgentCommission() - reportModel[i].getAgentCommission());
							wayBillCategoryTypeDetails.setBookingCommission(wayBillCategoryTypeDetails.getBookingCommission() - reportModel[i].getBookingCommission());
							chargesCollection = wayBillCategoryTypeDetails.getChargesCollection();

							for(int k=0;k<wayBillCharges.length;k++)
								if(wayBillCharges[k].getChargeType() == ChargeTypeMaster.WAYBILL_CHARGETYPE_BOOKING)
									if(chargesCollection.get(wayBillCharges[k].getWayBillChargeMasterId()) != null)
										chargesCollection.put(wayBillCharges[k].getWayBillChargeMasterId(), chargesCollection.get(wayBillCharges[k].getWayBillChargeMasterId()) - wayBillCharges[k].getChargeAmount());
									else
										chargesCollection.put(wayBillCharges[k].getWayBillChargeMasterId(),- wayBillCharges[k].getChargeAmount());
						}

					}else if(reportModel[i].getStatus()==WayBillStatusConstant.WAYBILL_STATUS_DELIVERED
							|| reportModel[i].getStatus()==WayBillStatusConstant.WAYBILL_STATUS_DELIVERED_BEFORE_CANCEL
							&& showCashCollectionInReport){

						if(reportModel[i].getStatus()==WayBillStatusConstant.WAYBILL_STATUS_DELIVERED) {
							if(reportModel[i].getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_TO_PAY){
								totalDeliverGrandAmount += reportModel[i].getGrandTotal();
								if(reportModel[i].getDeliveryPaymentTypeId() == PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID)
									deliveryChequeTotal +=  reportModel[i].getGrandTotal();
							}else if(reportModel[i].getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_PAID || reportModel[i].getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_CREDIT){
								totalDeliverGrandAmount += reportModel[i].getDeliveryAmount()- reportModel[i].getDeliveryDiscount();
								if(reportModel[i].getDeliveryPaymentTypeId() == PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID)
									deliveryChequeTotal += reportModel[i].getDeliveryAmount()- reportModel[i].getDeliveryDiscount();
							}
						} else if(reportModel[i].getStatus()==WayBillStatusConstant.WAYBILL_STATUS_DELIVERED_BEFORE_CANCEL
								&& showCashCollectionInReport)
							if(reportModel[i].getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_TO_PAY){
								reportModel[i].setGrandTotal(reportModel[i].getCancelledCrAmount());
								reportModel[i].setDeliveryAmount(0);
								reportModel[i].setDeliveryDiscount(0);
								totalDeliverGrandAmount += reportModel[i].getGrandTotal();
								if(reportModel[i].getDeliveryPaymentTypeId() == PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID)
									deliveryChequeTotal +=  reportModel[i].getGrandTotal();
							}else if(reportModel[i].getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_PAID || reportModel[i].getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_CREDIT){
								totalDeliverGrandAmount += reportModel[i].getCancelledCrAmount();
								reportModel[i].setDeliveryAmount(reportModel[i].getCancelledCrAmount());
								reportModel[i].setDeliveryDiscount(0);
								if(reportModel[i].getDeliveryPaymentTypeId() == PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID)
									deliveryChequeTotal += reportModel[i].getCancelledCrAmount();
							}

						double totalFreight 			= 0.00;
						double totalAmount 			= reportModel[i].getDeliveryAmount()-reportModel[i].getDeliveryDiscount();

						if(reportModel[i].getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_TO_PAY){
							totalFreight = reportModel[i].getGrandTotal()-(reportModel[i].getDeliveryAmount()-reportModel[i].getDeliveryDiscount());
							totalAmount = totalAmount + totalFreight;
						}

						if(reportModel[i].getDeliveryPaymentTypeId() == PaymentTypeConstant.PAYMENT_TYPE_BILL_CREDIT_ID)
							totalDeliveryBillCreditTotal	+= reportModel[i].getDeliveryAmount()-reportModel[i].getDeliveryDiscount();

						wbCategoryTypeDetailsForDlvrd = deliveredWayBillDetails.get(reportModel[i].getWayBillType());

						if(wbCategoryTypeDetailsForDlvrd == null){
							wbCategoryTypeDetailsForDlvrd = new WayBillCategoryTypeDetails();

							wbCategoryTypeDetailsForDlvrd.setWayBillType(reportModel[i].getWayBillType());
							wbCategoryTypeDetailsForDlvrd.setQuantity(reportModel[i].getNoOfPackages());
							wbCategoryTypeDetailsForDlvrd.setTotalFreight(totalFreight);
							wbCategoryTypeDetailsForDlvrd.setDeliveryDiscount(reportModel[i].getDeliveryDiscount());
							wbCategoryTypeDetailsForDlvrd.setTotalAmount(totalAmount);
							wbCategoryTypeDetailsForDlvrd.setDeliveryCommission(reportModel[i].getDeliveryCommission());

							chargesCollection = new HashMap<Long,Double>();

							for (final WayBillCharges wayBillCharge : wayBillCharges)
								if(wayBillCharge.getChargeType() == ChargeTypeMaster.WAYBILL_CHARGETYPE_DELIVERY)
									chargesCollection.put(wayBillCharge.getWayBillChargeMasterId(), wayBillCharge.getChargeAmount());
							wbCategoryTypeDetailsForDlvrd.setChargesCollection(chargesCollection);

							deliveredWayBillDetails.put(reportModel[i].getWayBillType(), wbCategoryTypeDetailsForDlvrd);
						}else{
							wbCategoryTypeDetailsForDlvrd.setQuantity(wbCategoryTypeDetailsForDlvrd.getQuantity() + reportModel[i].getNoOfPackages());
							wbCategoryTypeDetailsForDlvrd.setTotalFreight(wbCategoryTypeDetailsForDlvrd.getTotalFreight() + totalFreight);
							wbCategoryTypeDetailsForDlvrd.setDeliveryDiscount(wbCategoryTypeDetailsForDlvrd.getDeliveryDiscount() + reportModel[i].getDeliveryDiscount());
							wbCategoryTypeDetailsForDlvrd.setTotalAmount(wbCategoryTypeDetailsForDlvrd.getTotalAmount() + totalAmount);
							wbCategoryTypeDetailsForDlvrd.setDeliveryCommission(wbCategoryTypeDetailsForDlvrd.getDeliveryCommission() + reportModel[i].getDeliveryCommission());

							chargesCollection = wbCategoryTypeDetailsForDlvrd.getChargesCollection();

							for (final WayBillCharges wayBillCharge : wayBillCharges)
								if(wayBillCharge.getChargeType() == ChargeTypeMaster.WAYBILL_CHARGETYPE_DELIVERY)
									if(chargesCollection.get(wayBillCharge.getWayBillChargeMasterId()) != null)
										chargesCollection.put(wayBillCharge.getWayBillChargeMasterId(), chargesCollection.get(wayBillCharge.getWayBillChargeMasterId()) + wayBillCharge.getChargeAmount());
									else
										chargesCollection.put(wayBillCharge.getWayBillChargeMasterId(), wayBillCharge.getChargeAmount());
						}
					}
				}
				if(showCashCollectionInReport)
					for (final DailyCollectionReportModel element : deliveryCancellationList) {
						dailyCollectionReportModel	= element;
						if(dailyCollectionReportModel.getPaymentTypeId() == PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID){
							//DO Nothing No Need To Add Amount To Cancellation
						} else
							totalCancellationGrandAmount += dailyCollectionReportModel.getAmount();
					}
				else {
					for(final long id :deliveryCancellation.keySet())
						if(deliveryCancellation.get(id) != null)
							deliveryCancellationTotal +=deliveryCancellation.get(id).getAmount();
					deliveryCancellationList.addAll(deliveryCancellation.values());
				}

				request.setAttribute("wayBillTypeDetails", wbCategoryTypeDetails);
				request.setAttribute("deliveredWayBillDetails", deliveredWayBillDetails);

				if(doNotShow_Disc) request.setAttribute("doNotShow_Disc","false");
				if(doNotShow_Tax) request.setAttribute("doNotShow_Tax","false");
				if(doNotShow_Commission) request.setAttribute("doNotShow_Commission","false");

				request.setAttribute("deuDeliver", deuDeliver);
				request.setAttribute("Booking", booking);
				request.setAttribute("Cancellation", cancellation);
				request.setAttribute("deliveryCancellationList", deliveryCancellationList);
				request.setAttribute("Delivery", deliveryList);
				request.setAttribute("CreditDelivery", creditDelivery);
				request.setAttribute("creditorBooking", creditorBooking);
				request.setAttribute("FOC", foc);
				request.setAttribute("toPayeeBooking", toPayeeBooking);
				request.setAttribute("BookingManual", bookingManual);
				request.setAttribute("toPayeeBookingManual", toPayeeBookingManual);
				request.setAttribute("creditorBookingManual", creditorBookingManual);
				request.setAttribute("FOCManual", focManual);
				request.setAttribute("DeliveredWayBill", deliveredWayBills);
				request.setAttribute("CancelledWayBills", cancelledWayBills);
				request.setAttribute("DeliveryCancelledWayBills", deliveryCancelledWayBills);
				request.setAttribute("totalGrandAmount", Math.round(totalBookingGrandAmount + totalDeliverGrandAmount - totalCancellationGrandAmount - toPayCommissionToBeLess-deliveryCancellationTotal) - totalDeliveryBillCreditTotal);
				request.setAttribute("totalBookingAmount", Math.round(totalBookingGrandAmount));
				request.setAttribute("totalDeliveryAmount", Math.round(totalDeliverGrandAmount));
				request.setAttribute("totalCancellationAmount", Math.round(totalCancellationGrandAmount));
				request.setAttribute("bookingChequeTotal", bookingChequeTotal);
				request.setAttribute("deliveryChequeTotal", deliveryChequeTotal);

				if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_GROUPADMIN) {
					branch = cache.getBranchById(request ,executive.getAccountGroupId() , selectedBranch);

					if(branch.getMappingTypeId() == Branch.BRANCH_MAP_ID_OWN_BRANCH_AND_ASSIGNED) {
						bookingCharges 	= cache.getBookingCharges(request, executive.getBranchId());
						deliveryCharges = cache.getDeliveryCharges(request, executive.getBranchId());
					} else {
						long accountId = 0;

						if(reportModel[0].getStatus() == WayBillStatusConstant.WAYBILL_STATUS_BOOKED || reportModel[0].getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CANCELLED)
							accountId = reportModel[0].getAccountGroupId();
						else
							accountId = reportModel[0].getBookedForAccountGroupId();

						bookingCharges 	= cache.getBookingCharges(request, selectedBranch);
						deliveryCharges = cache.getDeliveryCharges(request, selectedBranch);

						if(bookingCharges == null)
							bookingCharges  = ChargeTypeMasterDao.getInstance().getChargeConfiguration(accountId, branch.getAgencyId(), branch.getBranchId(), ChargeTypeMaster.WAYBILL_CHARGETYPE_BOOKING);

						if(deliveryCharges == null)
							deliveryCharges = ChargeTypeMasterDao.getInstance().getChargeConfiguration(accountId, branch.getAgencyId(), branch.getBranchId(), ChargeTypeMaster.WAYBILL_CHARGETYPE_DELIVERY);
					}
				} else {
					bookingCharges 	= cache.getBookingCharges(request, executive.getBranchId());
					deliveryCharges = cache.getDeliveryCharges(request, executive.getBranchId());
				}

				request.setAttribute("BookingCharges",bookingCharges);
				request.setAttribute("DeliveryCharges",deliveryCharges);
			} else {
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}
			request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		} finally {
			executive       				= null;
			sdf             				= null;
			fromDate        				= null;
			toDate          				= null;
			branches  						= null;
			execs     						= null;
			cache 							= null;
			executiveIdsArr					= null;
			wayBillIdsStr					= null;
			executiveIdsStr					= null;
			objectIn						= null;
			objectOut						= null;
			wayBillIdArray					= null;
			reportViewModel 				= null;
			wayBillType						= null;
			wayBillCharges					= null;
			wayBillTax						= null;
			branch							= null;
			bookingCharges  				= null;
			deliveryCharges 				= null;
			chargesCollection				= null;
			deliveredWayBills				= null;
			cancelledWayBills				= null;
			pkgsColl						= null;
			consignorColl					= null;
			consigneeColl					= null;
			executiveColl					= null;
			reportModel						= null;
			wayBillExpenseModel				= null;
			booking							= null;
			cancellation					= null;
			creditDelivery					= null;
			foc								= null;
			focManual						= null;
			toPayeeBooking					= null;
			creditorBooking					= null;
			bookingManual 					= null;
			toPayeeBookingManual			= null;
			creditorBookingManual			= null;
			deuDeliver						= null;
			wbCategoryTypeDetails			= null;
			deliveredWayBillDetails			= null;
			bookedWayBillCategoryTypeDetails= null;
			wayBillCategoryTypeDetails		= null;
			wbCategoryTypeDetailsForDlvrd	= null;
			wayBillDetails					= null;
			deliveryCancellation			= null;
			deliveryCancelledWayBills		= null;
			cancelledWayBillTotal			= null;
		}

	}
}