package com.ivcargo.reports.collection;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.displaydata.DisplayDataConfigurationBll;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.reports.ReportView;
import com.ivcargo.reports.collection.initialize.InitializeDailyCollectionReportAction;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.ChargeTypeMasterDao;
import com.platform.dao.ConsignmentSummaryDao;
import com.platform.dao.ExecutiveDao;
import com.platform.dao.WayBillDeliveryChargesDao;
import com.platform.dao.reports.DailyCollectionDAO;
import com.platform.dao.reports.WayBillDetailsDAO;
import com.platform.dto.AliasNameConstants;
import com.platform.dto.Branch;
import com.platform.dto.ChargeTypeMaster;
import com.platform.dto.ConsignmentSummary;
import com.platform.dto.ECargoConstantFile;
import com.platform.dto.Executive;
import com.platform.dto.WayBill;
import com.platform.dto.WayBillCharges;
import com.platform.dto.WayBillTaxTxn;
import com.platform.dto.WayBillType;
import com.platform.dto.configuration.master.DisplayDataConfigurationDTO;
import com.platform.dto.constant.WayBillStatusConstant;
import com.platform.dto.constant.WayBillTypeConstant;
import com.platform.dto.model.ChargeTypeModel;
import com.platform.dto.model.DailyCollectionReportModel;
import com.platform.dto.model.ReportViewModel;
import com.platform.dto.model.WayBillCategoryTypeDetails;
import com.platform.dto.model.WayBillDeatailsModel;
import com.platform.resource.CargoErrorList;
import com.platform.utils.PropertiesUtility;
import com.platform.utils.Utility;

/**
 * @author Anant Chaudhary	03-02-2016
 * Transfer in new Package com.ivcargo.reports.collection
 *
 */

public class DailyCollectionSummaryReportActionSRSTravels implements Action {

	/* (non-Javadoc)
	 * @see com.framework.Action#execute(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
	 */
	@SuppressWarnings("unchecked")
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String, Object>						error 								= null;
		Executive        							executive       					= null;
		SimpleDateFormat 							sdf             					= null;
		Timestamp        							fromDate        					= null;
		Timestamp        							toDate          					= null;
		Branch[]    								branches  							= null;
		Executive[] 								execs     							= null;
		CacheManip 									cache 								= null;
		String										wayBillIdsStr						= null;
		ValueObject									objectIn							= null;
		ValueObject									objectOut							= null;
		Long[]										wayBillIdArray						= null;
		ReportViewModel								reportViewModel 					= null;
		WayBillType									wayBillType							= null;
		WayBillCharges[]							wayBillCharges						= null;
		WayBillTaxTxn[]								wayBillTax							= null;
		Branch										branch								= null;
		ChargeTypeModel[]							bookingCharges  					= null;
		ChargeTypeModel[]							deliveryCharges 					= null;
		HashMap<Long, Double>						chargesCollection					= null;
		HashMap<Long, ConsignmentSummary>			pkgsColl							= null;
		DailyCollectionReportModel[]				reportModel							= null;
		HashMap<String, WayBillCategoryTypeDetails>	wbCategoryTypeDetails				= null;
		HashMap<String, WayBillCategoryTypeDetails>	deliveredWayBillDetails				= null;
		HashMap<String, Double> 					bookedWayBillCategoryTypeDetails	= null;
		WayBillCategoryTypeDetails					wayBillCategoryTypeDetails			= null;
		WayBillCategoryTypeDetails					wbCategoryTypeDetailsForDlvrd		= null;
		HashMap<Long, WayBillDeatailsModel>			wayBillDetails						= null;
		Long[]										wayBillIdsForGroupSharingChargesArr	= null;	
		String										wayBillIdsForGroupSharingCharges	= null;	
		HashMap<Long, Double> 						groupSharingChargesMap				= null;
		ValueObject									displayDataConfig					= null;
		ValueObject									valueObjectIn						= null;
		Timestamp									createDate							= null;
		boolean										isDonotShowWayBillTypeWiseData		= false;
		long selectedBranch  = 0;
		long selectedCity    = 0;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error)){
				return;
			}

			new InitializeDailyCollectionReportAction().execute(request, response);

			executive	= (Executive) request.getSession().getAttribute("executive");
			sdf			= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			fromDate	= new Timestamp((sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00")).getTime());
			toDate		= new Timestamp((sdf.parse(JSPUtility.GetString(request, "fromDate") + " 23:59:59")).getTime());
			cache		= new CacheManip(request);
			createDate 	= new Timestamp(new java.util.Date().getTime());

			// Get the Selected  Combo values
			if(request.getParameter("TosubRegion") != null){
				selectedCity  =  Long.parseLong(JSPUtility.GetString(request, "TosubRegion", "0")) ;
			}
			if(request.getParameter("SelectDestBranch") != null){
				selectedBranch  =  Long.parseLong(JSPUtility.GetString(request, "SelectDestBranch", "0")) ;
			} else {
				selectedBranch = executive.getBranchId();
			}

			//Get all Branches
			branches = cache.getBranchesArrayBySubRegionId(request, executive.getAccountGroupId(), selectedCity);
			request.setAttribute("destBranches", branches);
			// Get All Executives
			execs = ExecutiveDao.getInstance().findByBranchId(selectedBranch);
			request.setAttribute("execs", execs);

			long executiveId = 0;
			objectIn  = new ValueObject();
			objectOut = new ValueObject();
			
			if(request.getParameter("Executive") != null) {
				executiveId = Long.parseLong(request.getParameter("Executive"));
			} else {
				executiveId = executive.getExecutiveId();
			}

			objectIn.put("fromDate", fromDate);
			objectIn.put("toDate", toDate);
			objectIn.put("executiveId", executiveId);
			objectIn.put("executive", executive);
			objectIn.put("filter", 1);
			objectIn.put("accountGroupId", executive.getAccountGroupId());

			objectOut = DailyCollectionDAO.getInstance().getReportForExecutive(objectIn);

			reportModel		= (DailyCollectionReportModel[])objectOut.get("DailyCollectionReportModel");
			wayBillIdArray	= (Long[]) objectOut.get("WayBillIdArray");

			if(reportModel != null && wayBillIdArray != null) {

				wayBillIdsForGroupSharingChargesArr = (Long[])objectOut.get("wayBillIdsForGroupSharingChargesArr");

				//Condition For Group Sharing Charges. SRS should Not see Receipt Charge Of Southern
				if(wayBillIdsForGroupSharingChargesArr != null){
					wayBillIdsForGroupSharingCharges 	= Utility.GetLongArrayToString(wayBillIdsForGroupSharingChargesArr);
					groupSharingChargesMap 				= WayBillDeliveryChargesDao.getInstance().getWayBillChargeMapByWayBillIdsAndChargeMasterId(wayBillIdsForGroupSharingCharges,ChargeTypeMaster.RECEIPT);	
				}

				reportViewModel = new ReportViewModel();
				reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);
				request.setAttribute("ReportViewModel",reportViewModel);

				wbCategoryTypeDetails 				= new HashMap<String,WayBillCategoryTypeDetails>();
				deliveredWayBillDetails 			= new HashMap<String,WayBillCategoryTypeDetails>();
				double totalBookingGrandAmount 		= 0;
				double totalCancellationGrandAmount = 0;
				double totalDeliverGrandAmount 		= 0;
				double toPayCommissionToBeLess 		= 0;

				wayBillIdsStr	= Utility.GetLongArrayToString(wayBillIdArray);
				pkgsColl		= ConsignmentSummaryDao.getInstance().getLimitedConsignmentDetails(wayBillIdsStr);//Get Packages Data for both Summary & Details

				//Get WayBill Details code ( Start )
				wayBillDetails = WayBillDetailsDAO.getInstance().getWayBillDetails(wayBillIdArray ,true ,ChargeTypeMaster.WAYBILL_CHARGETYPE_BOTH ,true ,WayBillTaxTxn.WAYBILL_TAX_TXN_TYPE_BOOKING ,false);
				//Get WayBill Details code ( End )

				//only For Rishabh Travels ( Start )
				boolean rishabhCreditFlag = false;
				if(executive.getAccountGroupId() == ECargoConstantFile.ACCOUNTGORUPID_RISHABH_TRAVELS
						&& executive.getExecutiveType() != Executive.EXECUTIVE_TYPE_GROUPADMIN){
					rishabhCreditFlag = true;
				}
				//only For Rishabh Travels ( End )
				
				displayDataConfig						= cache.getDisplayDataConfiguration(request, executive.getAccountGroupId());
				isDonotShowWayBillTypeWiseData			= PropertiesUtility.isAllow(displayDataConfig.getString(DisplayDataConfigurationDTO.IS_DONOT_SHOW_WAY_BILL_TYPE_WISE_DATA_IN_REPORTS, "false"));
				valueObjectIn							= new ValueObject();

				for(int i=0; i<reportModel.length;i++){
					
					if (isDonotShowWayBillTypeWiseData) {
						valueObjectIn.put(AliasNameConstants.CURRENT_DATE_TIMESTAMP, createDate);
						valueObjectIn.put(AliasNameConstants.WAYBILL_TYPE_ID, reportModel[i].getWayBillTypeId());
						valueObjectIn.put(AliasNameConstants.SOURCE_BRANCH_ID, reportModel[i].getWayBillSourceBranchId());
						valueObjectIn.put(AliasNameConstants.DATE_TIMESTAMP, reportModel[i].getBookedDate());
						valueObjectIn.put(AliasNameConstants.EXECUTIVE_ID, executive.getExecutiveId());
						valueObjectIn.put(AliasNameConstants.WAYBILL_STATUS_ID, reportModel[i].getStatus());
						valueObjectIn.put(AliasNameConstants.IS_SHOW_WAYBILL, reportModel[i].isShowWayBill());
						if(DisplayDataConfigurationBll.getInstance().isDisplayWayBillTypeWiseData(displayDataConfig, valueObjectIn)) {
							continue;
						}
					}

					//Condition For Group Sharing Charges. SRS should Not see Receipt Charge Of Southern  
					if(groupSharingChargesMap != null && groupSharingChargesMap.get(reportModel[i].getWayBillId()) != null && (reportModel[i].getStatus() == WayBill.WAYBILL_STATUS_DELIVERED || reportModel[i].getStatus() == WayBill.WAYBILL_STATUS_CREDIT_DELIVERED || reportModel[i].getStatus() == WayBill.WAYBILL_STATUS_DUEDELIVERED || reportModel[i].getStatus() == WayBill.WAYBILL_STATUS_DUEUNDELIVERED )) {
						reportModel[i].setDeliveryAmount(reportModel[i].getDeliveryAmount() - groupSharingChargesMap.get(reportModel[i].getWayBillId()));
						reportModel[i].setGrandTotal(reportModel[i].getGrandTotal() - groupSharingChargesMap.get(reportModel[i].getWayBillId()));
					}

					reportModel[i].setNoOfPackages(pkgsColl.get(reportModel[i].getWayBillId()).getQuantity());

					if(rishabhCreditFlag && reportModel[i].getWayBillTypeId() == WayBillType.WAYBILL_TYPE_CREDIT){
						reportModel[i].setGrandTotal(0);
					}

					// Set WayBill Type Name
					wayBillType = cache.getWayBillTypeById(request, reportModel[i].getWayBillTypeId());
					if(reportModel[i].isManual()){
						reportModel[i].setWayBillType(wayBillType.getWayBillType()+WayBillType.WAYBILL_TYPE_MANUAL);
					}else{
						reportModel[i].setWayBillType(wayBillType.getWayBillType());
					}
					//end

					//WayBill Charges (Booking & Delivery)
					wayBillCharges = wayBillDetails.get(reportModel[i].getWayBillId()).getWayBillCharges();
					bookedWayBillCategoryTypeDetails = new HashMap<String,Double>();
					for(int j=0;j<wayBillCharges.length;j++){
						if(reportModel[i].getStatus() != WayBill.WAYBILL_STATUS_DELIVERED && wayBillCharges[j].getChargeType() == ChargeTypeMaster.WAYBILL_CHARGETYPE_BOOKING){
							if(reportModel[i].getWayBillTypeId() == WayBillType.WAYBILL_TYPE_CREDIT
									&& wayBillCharges[j].getWayBillChargeMasterId() != ChargeTypeMaster.LOADING
									&& rishabhCreditFlag){
								wayBillCharges[j].setChargeAmount(0);
							}
							bookedWayBillCategoryTypeDetails.put(""+wayBillCharges[j].getWayBillChargeMasterId(), wayBillCharges[j].getChargeAmount());
						}if(reportModel[i].getStatus() == WayBill.WAYBILL_STATUS_DELIVERED && wayBillCharges[j].getChargeType() == ChargeTypeMaster.WAYBILL_CHARGETYPE_DELIVERY){
							bookedWayBillCategoryTypeDetails.put(""+wayBillCharges[j].getWayBillChargeMasterId(), wayBillCharges[j].getChargeAmount());
						}
					}
					reportModel[i].setChargesCollection(bookedWayBillCategoryTypeDetails);
					//end

					//Calculate Total WayBill Tax
					wayBillTax = wayBillDetails.get(reportModel[i].getWayBillId()).getWayBillTaxTxn();
					double totalTax 				= 0.00;
					for(int k=0;k<wayBillTax.length;k++){
						totalTax = totalTax + wayBillTax[k].getTaxAmount();
					}
					reportModel[i].setTotalTax(totalTax);
					//end

					//Calculate Total Discount
					double totalDiscount 		= 0.00;
					if(reportModel[i].isDiscountPercent()){
						totalDiscount = Math.round(reportModel[i].getAmount() * reportModel[i].getDiscount() / 100);
					}else{
						totalDiscount = reportModel[i].getDiscount();
					}
					reportModel[i].setDiscount(totalDiscount);
					//end


					if(reportModel[i].getStatus()==WayBill.WAYBILL_STATUS_BOOKED){

						if(reportModel[i].getWayBillTypeId() == WayBillType.WAYBILL_TYPE_PAID){
							totalBookingGrandAmount += reportModel[i].getGrandTotal();
						}else if(reportModel[i].getWayBillTypeId() == WayBillType.WAYBILL_TYPE_TO_PAY){
							toPayCommissionToBeLess += reportModel[i].getAgentCommission();
							for(int k=0;k<wayBillCharges.length;k++){
								if((wayBillCharges[k].getWayBillChargeMasterId() == ChargeTypeMaster.PAID_LOADING
										|| wayBillCharges[k].getWayBillChargeMasterId() == ChargeTypeMaster.PAID_HAMALI)
										&& wayBillCharges[k].getChargeAmount() > 0){
									totalBookingGrandAmount += wayBillCharges[k].getChargeAmount();
								}
							}
						}

						wayBillCategoryTypeDetails = (WayBillCategoryTypeDetails)wbCategoryTypeDetails.get(reportModel[i].getWayBillType());

						if(wayBillCategoryTypeDetails == null){
							wayBillCategoryTypeDetails = new WayBillCategoryTypeDetails(); 

							wayBillCategoryTypeDetails.setWayBillType(reportModel[i].getWayBillType());
							wayBillCategoryTypeDetails.setQuantity(reportModel[i].getNoOfPackages());
							wayBillCategoryTypeDetails.setBookingDiscount(totalDiscount);
							wayBillCategoryTypeDetails.setTotalTax(totalTax);
							wayBillCategoryTypeDetails.setTotalAmount(reportModel[i].getGrandTotal() - (reportModel[i].getDeliveryAmount() - reportModel[i].getDeliveryDiscount()));
							wayBillCategoryTypeDetails.setAgentCommission(reportModel[i].getAgentCommission());
							chargesCollection = new HashMap<Long,Double>();

							for(int k=0;k<wayBillCharges.length;k++){
								if(wayBillCharges[k].getChargeType() == ChargeTypeMaster.WAYBILL_CHARGETYPE_BOOKING){
									chargesCollection.put(wayBillCharges[k].getWayBillChargeMasterId(), wayBillCharges[k].getChargeAmount());
								}
							}
							wayBillCategoryTypeDetails.setChargesCollection(chargesCollection);

							wbCategoryTypeDetails.put(reportModel[i].getWayBillType(), wayBillCategoryTypeDetails);
						}else{

							wayBillCategoryTypeDetails.setQuantity(wayBillCategoryTypeDetails.getQuantity() + reportModel[i].getNoOfPackages());
							wayBillCategoryTypeDetails.setBookingDiscount(wayBillCategoryTypeDetails.getBookingDiscount() + totalDiscount);
							wayBillCategoryTypeDetails.setTotalTax(wayBillCategoryTypeDetails.getTotalTax() + totalTax);
							wayBillCategoryTypeDetails.setTotalAmount(wayBillCategoryTypeDetails.getTotalAmount() + (reportModel[i].getGrandTotal() - (reportModel[i].getDeliveryAmount() - reportModel[i].getDeliveryDiscount())));
							wayBillCategoryTypeDetails.setAgentCommission(wayBillCategoryTypeDetails.getAgentCommission() + reportModel[i].getAgentCommission());
							chargesCollection = (HashMap<Long,Double>)wayBillCategoryTypeDetails.getChargesCollection();

							for(int k=0;k<wayBillCharges.length;k++){
								if(wayBillCharges[k].getChargeType() == ChargeTypeMaster.WAYBILL_CHARGETYPE_BOOKING){
									if(chargesCollection.get(wayBillCharges[k].getWayBillChargeMasterId()) != null){
										chargesCollection.put(wayBillCharges[k].getWayBillChargeMasterId(), (Double)chargesCollection.get(wayBillCharges[k].getWayBillChargeMasterId()) + wayBillCharges[k].getChargeAmount());
									}else{
										chargesCollection.put(wayBillCharges[k].getWayBillChargeMasterId(), wayBillCharges[k].getChargeAmount());
									}
								}	
							}
						}

					}else if(reportModel[i].getStatus()==WayBill.WAYBILL_STATUS_CANCELLED && (reportModel[i].getWayBillTypeId() == WayBillType.WAYBILL_TYPE_PAID||reportModel[i].getWayBillTypeId() == WayBillType.WAYBILL_TYPE_TO_PAY || reportModel[i].getWayBillTypeId() == WayBillType.WAYBILL_TYPE_CREDIT)){

						if(reportModel[i].getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID){
							totalCancellationGrandAmount += (Math.round(reportModel[i].getGrandTotal()-reportModel[i].getAmount())); 
						}else if(reportModel[i].getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY){
							totalCancellationGrandAmount += (Math.round(-reportModel[i].getAmount()));
							for(int k=0;k<wayBillCharges.length;k++){
								if((wayBillCharges[k].getWayBillChargeMasterId() == ChargeTypeMaster.PAID_LOADING
										|| wayBillCharges[k].getWayBillChargeMasterId() == ChargeTypeMaster.PAID_HAMALI)
										&& wayBillCharges[k].getChargeAmount() > 0){
									totalBookingGrandAmount -= wayBillCharges[k].getChargeAmount();
								}
							}
						}

						wayBillCategoryTypeDetails = (WayBillCategoryTypeDetails)wbCategoryTypeDetails.get(reportModel[i].getWayBillType());

						if(wayBillCategoryTypeDetails == null){
							wayBillCategoryTypeDetails = new WayBillCategoryTypeDetails(); 

							wayBillCategoryTypeDetails.setWayBillType(reportModel[i].getWayBillType());
							wayBillCategoryTypeDetails.setQuantity(-reportModel[i].getNoOfPackages());
							wayBillCategoryTypeDetails.setBookingDiscount(-totalDiscount);
							wayBillCategoryTypeDetails.setTotalTax(-totalTax);
							wayBillCategoryTypeDetails.setTotalAmount(- (reportModel[i].getGrandTotal() - (reportModel[i].getDeliveryAmount() - reportModel[i].getDeliveryDiscount())));
							wayBillCategoryTypeDetails.setAgentCommission(- reportModel[i].getAgentCommission());
							chargesCollection = new HashMap<Long,Double>();

							for(int k=0;k<wayBillCharges.length;k++){
								if(wayBillCharges[k].getChargeType() == ChargeTypeMaster.WAYBILL_CHARGETYPE_BOOKING){
									chargesCollection.put(wayBillCharges[k].getWayBillChargeMasterId(),- wayBillCharges[k].getChargeAmount());
								}
							}
							wayBillCategoryTypeDetails.setChargesCollection(chargesCollection);

							wbCategoryTypeDetails.put(reportModel[i].getWayBillType(), wayBillCategoryTypeDetails);
						}else{

							wayBillCategoryTypeDetails.setQuantity(wayBillCategoryTypeDetails.getQuantity() - reportModel[i].getNoOfPackages());
							wayBillCategoryTypeDetails.setBookingDiscount(wayBillCategoryTypeDetails.getBookingDiscount() - totalDiscount);
							wayBillCategoryTypeDetails.setTotalTax(wayBillCategoryTypeDetails.getTotalTax() - totalTax);
							wayBillCategoryTypeDetails.setTotalAmount(wayBillCategoryTypeDetails.getTotalAmount() - (reportModel[i].getGrandTotal() - (reportModel[i].getDeliveryAmount() - reportModel[i].getDeliveryDiscount())));
							wayBillCategoryTypeDetails.setAgentCommission(wayBillCategoryTypeDetails.getAgentCommission() - reportModel[i].getAgentCommission());
							chargesCollection = (HashMap<Long,Double>)wayBillCategoryTypeDetails.getChargesCollection();

							for(int k=0;k<wayBillCharges.length;k++){
								if(wayBillCharges[k].getChargeType() == ChargeTypeMaster.WAYBILL_CHARGETYPE_BOOKING){ 
									if(chargesCollection.get(wayBillCharges[k].getWayBillChargeMasterId()) != null){
										chargesCollection.put(wayBillCharges[k].getWayBillChargeMasterId(), (Double)chargesCollection.get(wayBillCharges[k].getWayBillChargeMasterId()) - wayBillCharges[k].getChargeAmount());
									}else{
										chargesCollection.put(wayBillCharges[k].getWayBillChargeMasterId(),- wayBillCharges[k].getChargeAmount());
									}
								}	
							}
						}

					}else if(reportModel[i].getStatus()==WayBill.WAYBILL_STATUS_DELIVERED){

						double totalFreight = 0.00;
						double totalAmount 	= reportModel[i].getDeliveryAmount()-reportModel[i].getDeliveryDiscount();
						double paidLoadingAmt = 0.00;

						if(reportModel[i].getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_TO_PAY){
							for(int k=0;k<wayBillCharges.length;k++){
								if((wayBillCharges[k].getWayBillChargeMasterId() == ChargeTypeMaster.PAID_LOADING
										|| wayBillCharges[k].getWayBillChargeMasterId() == ChargeTypeMaster.PAID_HAMALI)
										&& wayBillCharges[k].getChargeAmount() > 0){
									paidLoadingAmt = wayBillCharges[k].getChargeAmount();
								}
							}
							totalDeliverGrandAmount +=  (reportModel[i].getGrandTotal() - paidLoadingAmt);
							totalFreight = reportModel[i].getGrandTotal()-(reportModel[i].getDeliveryAmount()-reportModel[i].getDeliveryDiscount())- paidLoadingAmt;
							totalAmount  = totalAmount + totalFreight;
						}else if(reportModel[i].getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_PAID || reportModel[i].getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_CREDIT){
							totalDeliverGrandAmount += (reportModel[i].getDeliveryAmount()-reportModel[i].getDeliveryDiscount()); 
						}

						wbCategoryTypeDetailsForDlvrd= (WayBillCategoryTypeDetails)deliveredWayBillDetails.get(reportModel[i].getWayBillType());

						if(wbCategoryTypeDetailsForDlvrd == null){
							wbCategoryTypeDetailsForDlvrd = new WayBillCategoryTypeDetails(); 

							wbCategoryTypeDetailsForDlvrd.setWayBillType(reportModel[i].getWayBillType());
							wbCategoryTypeDetailsForDlvrd.setQuantity(reportModel[i].getNoOfPackages());
							wbCategoryTypeDetailsForDlvrd.setTotalFreight(totalFreight);
							wbCategoryTypeDetailsForDlvrd.setDeliveryDiscount(reportModel[i].getDeliveryDiscount());
							wbCategoryTypeDetailsForDlvrd.setTotalAmount(totalAmount);
							wbCategoryTypeDetailsForDlvrd.setDeliveryCommission(reportModel[i].getDeliveryCommission());
							chargesCollection = new HashMap<Long,Double>();

							for(int k=0;k<wayBillCharges.length;k++){
								if(wayBillCharges[k].getChargeType() == ChargeTypeMaster.WAYBILL_CHARGETYPE_DELIVERY){
									chargesCollection.put(wayBillCharges[k].getWayBillChargeMasterId(), wayBillCharges[k].getChargeAmount());
								}
							}
							wbCategoryTypeDetailsForDlvrd.setChargesCollection(chargesCollection);

							deliveredWayBillDetails.put(reportModel[i].getWayBillType(), wbCategoryTypeDetailsForDlvrd);
						}else{
							wbCategoryTypeDetailsForDlvrd.setQuantity(wbCategoryTypeDetailsForDlvrd.getQuantity() + reportModel[i].getNoOfPackages());
							wbCategoryTypeDetailsForDlvrd.setTotalFreight(wbCategoryTypeDetailsForDlvrd.getTotalFreight() + totalFreight);
							wbCategoryTypeDetailsForDlvrd.setDeliveryDiscount(wbCategoryTypeDetailsForDlvrd.getDeliveryDiscount() + reportModel[i].getDeliveryDiscount());
							wbCategoryTypeDetailsForDlvrd.setTotalAmount(wbCategoryTypeDetailsForDlvrd.getTotalAmount() + totalAmount);
							wbCategoryTypeDetailsForDlvrd.setDeliveryCommission(wbCategoryTypeDetailsForDlvrd.getDeliveryCommission() + reportModel[i].getDeliveryCommission());
							chargesCollection = (HashMap<Long,Double>)wbCategoryTypeDetailsForDlvrd.getChargesCollection();

							for(int k=0;k<wayBillCharges.length;k++){
								if(wayBillCharges[k].getChargeType() == ChargeTypeMaster.WAYBILL_CHARGETYPE_DELIVERY){
									if(chargesCollection.get(wayBillCharges[k].getWayBillChargeMasterId()) != null){
										chargesCollection.put(wayBillCharges[k].getWayBillChargeMasterId(), (Double)chargesCollection.get(wayBillCharges[k].getWayBillChargeMasterId()) + wayBillCharges[k].getChargeAmount());
									}else{
										chargesCollection.put(wayBillCharges[k].getWayBillChargeMasterId(), wayBillCharges[k].getChargeAmount());
									}
								}
							}
						}
					}
				}
				request.setAttribute("wayBillTypeDetails", wbCategoryTypeDetails);
				request.setAttribute("deliveredWayBillDetails", deliveredWayBillDetails);
				request.setAttribute("totalGrandAmount", Math.round(totalBookingGrandAmount + totalDeliverGrandAmount - totalCancellationGrandAmount - toPayCommissionToBeLess));

				if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_GROUPADMIN) {
					branch = cache.getBranchById(request ,executive.getAccountGroupId() , selectedBranch);
					
					if(branch.getMappingTypeId() == Branch.BRANCH_MAP_ID_OWN_BRANCH_AND_ASSIGNED) {
						bookingCharges 	= cache.getBookingCharges(request, executive.getBranchId());
						deliveryCharges = cache.getDeliveryCharges(request, executive.getBranchId());
					} else {
						long accountId = 0;
						
						if(reportModel[0].getStatus() == WayBillStatusConstant.WAYBILL_STATUS_BOOKED || reportModel[0].getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CANCELLED){
							accountId = reportModel[0].getAccountGroupId();
						} else {
							accountId = reportModel[0].getBookedForAccountGroupId();
						}

						bookingCharges  = cache.getBookingCharges(request, selectedBranch);
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
				request.setAttribute("nextPageToken", "success");
			} else {
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
				request.setAttribute("nextPageToken", "success");
			}
		} catch (Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		} finally {
			executive       = null;
			sdf             = null;
			fromDate        = null;
			toDate          = null;
			branches  		= null;
			execs     		= null;
			cache 			= null;
			wayBillIdsStr	= null;
			objectIn		= null;
			objectOut		= null;
			wayBillIdArray	= null;
			reportViewModel = null;
			wayBillType		= null;
			wayBillCharges	= null;
			wayBillTax		= null;
			branch			= null;
			bookingCharges  = null;
			deliveryCharges = null;
			chargesCollection	= null;
			pkgsColl			= null;
			reportModel			= null;
			wbCategoryTypeDetails	= null;
			deliveredWayBillDetails	= null;
			bookedWayBillCategoryTypeDetails= null;
			wayBillCategoryTypeDetails		= null;
			wbCategoryTypeDetailsForDlvrd	= null;
			wayBillDetails					= null;
			displayDataConfig					= null;
			valueObjectIn						= null;
			createDate							= null;
		}
	}

}
