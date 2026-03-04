package com.ivcargo.reports;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.HashMap;
import java.util.LinkedHashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.dto.constant.ExecutiveTypeConstant;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.ChargeTypeMasterDao;
import com.platform.dao.CustomerDetailsDao;
import com.platform.dao.reports.BranchCollectionDSAReportDAO;
import com.platform.dao.reports.WayBillDetailsDAO;
import com.platform.dto.Branch;
import com.platform.dto.ChargeTypeMaster;
import com.platform.dto.ConsignmentDetails;
import com.platform.dto.CustomerDetails;
import com.platform.dto.Executive;
import com.platform.dto.WayBillCharges;
import com.platform.dto.WayBillTaxTxn;
import com.platform.dto.WayBillType;
import com.platform.dto.constant.WayBillStatusConstant;
import com.platform.dto.constant.WayBillTypeConstant;
import com.platform.dto.model.BranchCollectionDSAReportModel;
import com.platform.dto.model.ChargeTypeModel;
import com.platform.dto.model.CityWiseCollectionModel;
import com.platform.dto.model.WayBillCategoryTypeDetails;
import com.platform.dto.model.WayBillDeatailsModel;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

public class BranchCollectionDSAReportAction implements Action{

	@Override
	@SuppressWarnings("unchecked")
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	 		error 			= null;
		Executive        				executive       = null;
		SimpleDateFormat 				sdf             = null;
		Timestamp        				fromDate        = null;
		Timestamp        				toDate          = null;
		Branch[]    	 				branches  		= null;
		String			 				wayBillIds		= null;
		Long[] 							wayBillIdArray 	= null;
		CacheManip 						cache			= null;
		BranchCollectionDSAReportModel[] 	reportModel 				= null;
		HashMap<Long, CustomerDetails>		consignorColl				= null;
		HashMap<Long, CustomerDetails>		consigneeColl				= null;
		CustomerDetails						consignor					= null;
		CustomerDetails						consignee					= null;
		HashMap<String,WayBillCategoryTypeDetails> 	wbCategoryTypeDetails 				= null;
		HashMap<String,Double> 						bookedWayBillCategoryTypeDetails 	= null;
		HashMap<Long,Object> storeSubRegionWiseToPayeeDetails 	= null;
		HashMap<Long,Object> subRegionWiseToPayeeDetails     	= null;
		CityWiseCollectionModel subRegionWiseCollectionModel 	= null;
		double totalBookingGrandAmount 		= 0;
		double totalCancellationGrandAmount = 0;
		double toPayCommissionToBeLess 		= 0;
		long 	selectedSubRegion        		= 0;
		long	quantity					= 0;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeBranchCollectionDSAReportAction().execute(request, response);

			executive        = (Executive) request.getSession().getAttribute("executive");
			sdf              = new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			fromDate         = new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00").getTime());
			toDate           = new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate") + " 23:59:59").getTime());
			wbCategoryTypeDetails 		= new HashMap<String,WayBillCategoryTypeDetails>();
			storeSubRegionWiseToPayeeDetails = new LinkedHashMap<Long,Object>();
			cache 						= new CacheManip(request);

			// Get the Selected  Combo values
			if (request.getParameter("subRegion")!=null)
				selectedSubRegion  =  Long.parseLong(JSPUtility.GetString(request, "subRegion")) ;

			//Get all Branches
			branches = cache.getBranchesArrayBySubRegionId(request, executive.getAccountGroupId(), selectedSubRegion);
			request.setAttribute("branches", branches);
			// Get All Executives

			long   branchId = 0;
			final ValueObject objectIn = new ValueObject();
			ValueObject objectOut = new ValueObject();

			if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN)
				branchId = Long.parseLong(request.getParameter("branch"));
			else
				branchId = executive.getBranchId();

			objectIn.put("fromDate", fromDate);
			objectIn.put("toDate", toDate);
			objectIn.put("branchId", branchId);
			objectIn.put("accountGroupId", executive.getAccountGroupId());

			objectOut= BranchCollectionDSAReportDAO.getInstance().getReportForBranch(objectIn);

			reportModel 		= (BranchCollectionDSAReportModel[])objectOut.get("BranchCollectionDSAReportModel");
			wayBillIdArray 		= (Long[]) objectOut.get("WayBillIdArray");

			if(reportModel != null && wayBillIdArray != null){

				wayBillIds			= Utility.GetLongArrayToString(wayBillIdArray);
				consignorColl 	    = CustomerDetailsDao.getInstance().getConsignorDetailsByWayBillId(wayBillIds);
				consigneeColl 	    = CustomerDetailsDao.getInstance().getConsigneeDetailsByWayBillId(wayBillIds);
				final HashMap<Long, WayBillDeatailsModel> wayBillDetails = WayBillDetailsDAO.getInstance().getWayBillDetails(wayBillIdArray ,true ,ChargeTypeMaster.WAYBILL_CHARGETYPE_BOOKING ,true ,WayBillTaxTxn.WAYBILL_TAX_TXN_TYPE_BOOKING ,true);

				for(int i=0; i<reportModel.length;i++){

					quantity = 0;
					reportModel[i].setWayBillSourceSubRegion(cache.getGenericSubRegionById(request, reportModel[i].getWayBillSourceSubRegionId()).getName());
					reportModel[i].setWayBillSourceBranch(cache.getGenericBranchDetailCache(request, reportModel[i].getWayBillSourceBranchId()).getName());
					reportModel[i].setWayBillDestinationSubRegion(cache.getGenericSubRegionById(request, reportModel[i].getDestinationSubRegionId()).getName());
					reportModel[i].setWayBillDestinationBranch(cache.getGenericBranchDetailCache(request, reportModel[i].getDestinationBranchId()).getName());

					final WayBillType wayBillType = cache.getWayBillTypeById(request, reportModel[i].getWayBillTypeId());
					if(reportModel[i].isManual())
						reportModel[i].setWayBillType(wayBillType.getWayBillType()+WayBillType.WAYBILL_TYPE_MANUAL);
					else
						reportModel[i].setWayBillType(wayBillType.getWayBillType());

					if(consignorColl != null && consignorColl.size() > 0)
						consignor = consignorColl.get(reportModel[i].getWayBillId());
					reportModel[i].setConsignorName(consignor != null ? consignor.getName() : "--");

					if(consigneeColl != null && consigneeColl.size() > 0)
						consignee = consigneeColl.get(reportModel[i].getWayBillId());
					reportModel[i].setConsigneeName(consignee != null ? consignee.getName() : "--");

					// Get package Type for Southern
					final ConsignmentDetails [] consDetails = wayBillDetails.get(reportModel[i].getWayBillId()).getConsignmentDetails();
					final StringBuilder packageDetails=new StringBuilder();
					for (int j=0; j<consDetails.length; j++){
						if (j != consDetails.length-1)
							packageDetails.append(consDetails[j].getQuantity()).append(" ").append(consDetails[j].getPackingTypeName()).append(" / ");
						else
							packageDetails.append(consDetails[j].getQuantity()).append(" ").append(consDetails[j].getPackingTypeName());
						quantity += consDetails[j].getQuantity();
					}
					reportModel[i].setPackageDetails(packageDetails.toString());
					reportModel[i].setNoOfPackages(quantity);

					//WayBill Charges (Booking & Delivery)

					final WayBillCharges[] wayBillCharges = wayBillDetails.get(reportModel[i].getWayBillId()).getWayBillCharges();
					bookedWayBillCategoryTypeDetails = new HashMap<String,Double>();
					for (final WayBillCharges wayBillCharge : wayBillCharges)
						bookedWayBillCategoryTypeDetails.put(""+wayBillCharge.getWayBillChargeMasterId(), wayBillCharge.getChargeAmount());
					reportModel[i].setChargesCollection(bookedWayBillCategoryTypeDetails);
					//end

					//Calculate Total WayBill Tax
					final WayBillTaxTxn[] wayBillTax = wayBillDetails.get(reportModel[i].getWayBillId()).getWayBillTaxTxn();
					double totalTax 				= 0.00;
					for (final WayBillTaxTxn element : wayBillTax)
						totalTax = totalTax + element.getTaxAmount();
					reportModel[i].setTotalTax(totalTax);

					//end

					//In Pavan taken care for topay Commission which has to be included in grandTotal

					if(reportModel[i].getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY)
						reportModel[i].setGrandTotal(reportModel[i].getGrandTotal() + reportModel[i].getAgentCommission());

					//Calculate Total Discount
					double totalDiscount 		= 0.00;
					if(reportModel[i].isDiscountPercent())
						totalDiscount = Math.round(reportModel[i].getAmount() * reportModel[i].getDiscount() / 100);
					else
						totalDiscount = reportModel[i].getDiscount();
					reportModel[i].setDiscount(totalDiscount);
					//end

					if(reportModel[i].getStatus()==WayBillStatusConstant.WAYBILL_STATUS_BOOKED ){
						if(reportModel[i].getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_PAID){
							totalBookingGrandAmount += reportModel[i].getGrandTotal();
							//SubRegion Wise Paid Details code
							subRegionWiseToPayeeDetails = (HashMap<Long, Object>)storeSubRegionWiseToPayeeDetails.get(reportModel[i].getDestinationSubRegionId());

							if(subRegionWiseToPayeeDetails == null){
								subRegionWiseToPayeeDetails = new LinkedHashMap<Long, Object>();

								subRegionWiseCollectionModel = (CityWiseCollectionModel)subRegionWiseToPayeeDetails.get(reportModel[i].getDestinationBranchId());

								if(subRegionWiseCollectionModel == null){

									subRegionWiseCollectionModel = new CityWiseCollectionModel();

									subRegionWiseCollectionModel.setBranchId(reportModel[i].getDestinationBranchId());
									subRegionWiseCollectionModel.setBranchName(reportModel[i].getWayBillDestinationBranch());
									subRegionWiseCollectionModel.setSubRegionId(reportModel[i].getDestinationSubRegionId());
									subRegionWiseCollectionModel.setSubRegionName(reportModel[i].getWayBillDestinationSubRegion());
									subRegionWiseCollectionModel.setTotalPaidAmount(reportModel[i].getGrandTotal());
									subRegionWiseCollectionModel.setTotalToPayAmount(0);

									subRegionWiseToPayeeDetails.put(reportModel[i].getDestinationBranchId(), subRegionWiseCollectionModel);
								}else{
									subRegionWiseCollectionModel.setTotalPaidAmount(subRegionWiseCollectionModel.getTotalPaidAmount() + reportModel[i].getGrandTotal());
									subRegionWiseCollectionModel.setTotalToPayAmount(subRegionWiseCollectionModel.getTotalToPayAmount() + 0);
								}

								storeSubRegionWiseToPayeeDetails.put(reportModel[i].getDestinationSubRegionId() ,subRegionWiseToPayeeDetails);
							}else{

								subRegionWiseCollectionModel = (CityWiseCollectionModel)subRegionWiseToPayeeDetails.get(reportModel[i].getDestinationBranchId());

								if(subRegionWiseCollectionModel == null){

									subRegionWiseCollectionModel = new CityWiseCollectionModel();

									subRegionWiseCollectionModel.setBranchId(reportModel[i].getDestinationBranchId());
									subRegionWiseCollectionModel.setBranchName(reportModel[i].getWayBillDestinationBranch());
									subRegionWiseCollectionModel.setSubRegionId(reportModel[i].getDestinationSubRegionId());
									subRegionWiseCollectionModel.setSubRegionName(reportModel[i].getWayBillDestinationSubRegion());
									subRegionWiseCollectionModel.setTotalPaidAmount(reportModel[i].getGrandTotal());
									subRegionWiseCollectionModel.setTotalToPayAmount(0);

									subRegionWiseToPayeeDetails.put(reportModel[i].getDestinationBranchId(), subRegionWiseCollectionModel);
								}else{
									subRegionWiseCollectionModel.setTotalPaidAmount(subRegionWiseCollectionModel.getTotalPaidAmount() + reportModel[i].getGrandTotal());
									subRegionWiseCollectionModel.setTotalToPayAmount(subRegionWiseCollectionModel.getTotalToPayAmount() + 0);
								}

							}
							//SubRegion Wise Paid Details code

						}
						else if(reportModel[i].getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_TO_PAY ){
							toPayCommissionToBeLess += reportModel[i].getAgentCommission();
							//SubRegion Wise ToPayee Details code
							subRegionWiseToPayeeDetails = (HashMap<Long, Object>)storeSubRegionWiseToPayeeDetails.get(reportModel[i].getDestinationSubRegionId());

							if(subRegionWiseToPayeeDetails == null){
								subRegionWiseToPayeeDetails = new LinkedHashMap<Long, Object>();

								subRegionWiseCollectionModel = (CityWiseCollectionModel)subRegionWiseToPayeeDetails.get(reportModel[i].getDestinationBranchId());

								if(subRegionWiseCollectionModel == null){

									subRegionWiseCollectionModel = new CityWiseCollectionModel();

									subRegionWiseCollectionModel.setBranchId(reportModel[i].getDestinationBranchId());
									subRegionWiseCollectionModel.setBranchName(reportModel[i].getWayBillDestinationBranch());
									subRegionWiseCollectionModel.setSubRegionId(reportModel[i].getDestinationSubRegionId());
									subRegionWiseCollectionModel.setSubRegionName(reportModel[i].getWayBillDestinationSubRegion());
									subRegionWiseCollectionModel.setTotalPaidAmount(0);
									subRegionWiseCollectionModel.setTotalToPayAmount(reportModel[i].getGrandTotal() /*+ reportModel[i].getAgentCommission()*/);

									subRegionWiseToPayeeDetails.put(reportModel[i].getDestinationBranchId(), subRegionWiseCollectionModel);
								}else{
									subRegionWiseCollectionModel.setTotalPaidAmount(subRegionWiseCollectionModel.getTotalPaidAmount() + 0);
									subRegionWiseCollectionModel.setTotalToPayAmount(subRegionWiseCollectionModel.getTotalToPayAmount() + reportModel[i].getGrandTotal() /*+ reportModel[i].getAgentCommission()*/);
								}

								storeSubRegionWiseToPayeeDetails.put(reportModel[i].getDestinationSubRegionId() ,subRegionWiseToPayeeDetails);
							}else{

								subRegionWiseCollectionModel = (CityWiseCollectionModel)subRegionWiseToPayeeDetails.get(reportModel[i].getDestinationBranchId());

								if(subRegionWiseCollectionModel == null){

									subRegionWiseCollectionModel = new CityWiseCollectionModel();

									subRegionWiseCollectionModel.setBranchId(reportModel[i].getDestinationBranchId());
									subRegionWiseCollectionModel.setBranchName(reportModel[i].getWayBillDestinationBranch());
									subRegionWiseCollectionModel.setSubRegionId(reportModel[i].getDestinationSubRegionId());
									subRegionWiseCollectionModel.setSubRegionName(reportModel[i].getWayBillDestinationSubRegion());
									subRegionWiseCollectionModel.setTotalPaidAmount(0);
									subRegionWiseCollectionModel.setTotalToPayAmount(reportModel[i].getGrandTotal() /*+ reportModel[i].getAgentCommission()*/);

									subRegionWiseToPayeeDetails.put(reportModel[i].getDestinationBranchId(), subRegionWiseCollectionModel);
								}else{
									subRegionWiseCollectionModel.setTotalPaidAmount(subRegionWiseCollectionModel.getTotalPaidAmount() + 0);
									subRegionWiseCollectionModel.setTotalToPayAmount(subRegionWiseCollectionModel.getTotalToPayAmount() + reportModel[i].getGrandTotal() /*+ reportModel[i].getAgentCommission()*/);
								}

							}
							//SubRegion Wise ToPayee Details code

						}

						//WB Type
						WayBillCategoryTypeDetails wayBillCategoryTypeDetails = wbCategoryTypeDetails.get(reportModel[i].getWayBillType());

						if(wayBillCategoryTypeDetails == null){
							wayBillCategoryTypeDetails = new WayBillCategoryTypeDetails();

							wayBillCategoryTypeDetails.setWayBillType(reportModel[i].getWayBillType());
							wayBillCategoryTypeDetails.setQuantity(reportModel[i].getNoOfPackages());
							wayBillCategoryTypeDetails.setBookingDiscount(totalDiscount);
							wayBillCategoryTypeDetails.setTotalTax(totalTax);
							wayBillCategoryTypeDetails.setTotalAmount(reportModel[i].getGrandTotal() - (reportModel[i].getDeliveryAmount() - reportModel[i].getDeliveryDiscount()));
							wayBillCategoryTypeDetails.setAgentCommission(reportModel[i].getAgentCommission());

							final HashMap<Long,Double> chargesCollection = new HashMap<Long,Double>();

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

							final HashMap<Long,Double> chargesCollection = wayBillCategoryTypeDetails.getChargesCollection();

							for (final WayBillCharges wayBillCharge : wayBillCharges)
								if(wayBillCharge.getChargeType() == ChargeTypeMaster.WAYBILL_CHARGETYPE_BOOKING)
									if(chargesCollection.get(wayBillCharge.getWayBillChargeMasterId()) != null)
										chargesCollection.put(wayBillCharge.getWayBillChargeMasterId(), chargesCollection.get(wayBillCharge.getWayBillChargeMasterId()) + wayBillCharge.getChargeAmount());
									else
										chargesCollection.put(wayBillCharge.getWayBillChargeMasterId(), wayBillCharge.getChargeAmount());
						}

						//WB Type

					} else if(reportModel[i].getStatus()==WayBillStatusConstant.WAYBILL_STATUS_CANCELLED) {

						if(reportModel[i].getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_TO_PAY) {
							totalCancellationGrandAmount += Math.round(-reportModel[i].getAmount());
							//SubRegion Wise ToPayee Details code
							subRegionWiseToPayeeDetails = (HashMap<Long, Object>)storeSubRegionWiseToPayeeDetails.get(reportModel[i].getDestinationSubRegionId());

							if(subRegionWiseToPayeeDetails == null){
								subRegionWiseToPayeeDetails = new LinkedHashMap<Long, Object>();

								subRegionWiseCollectionModel = (CityWiseCollectionModel)subRegionWiseToPayeeDetails.get(reportModel[i].getDestinationBranchId());

								if(subRegionWiseCollectionModel == null){

									subRegionWiseCollectionModel = new CityWiseCollectionModel();

									subRegionWiseCollectionModel.setBranchId(reportModel[i].getDestinationBranchId());
									subRegionWiseCollectionModel.setBranchName(reportModel[i].getWayBillDestinationBranch());
									subRegionWiseCollectionModel.setSubRegionId(reportModel[i].getDestinationSubRegionId());
									subRegionWiseCollectionModel.setSubRegionName(reportModel[i].getWayBillDestinationSubRegion());
									subRegionWiseCollectionModel.setTotalPaidAmount(-0);
									subRegionWiseCollectionModel.setTotalToPayAmount( - (reportModel[i].getGrandTotal() + reportModel[i].getAgentCommission()));

									subRegionWiseToPayeeDetails.put(reportModel[i].getDestinationBranchId(), subRegionWiseCollectionModel);
								}else{
									subRegionWiseCollectionModel.setTotalPaidAmount(subRegionWiseCollectionModel.getTotalPaidAmount() - 0);
									subRegionWiseCollectionModel.setTotalToPayAmount(subRegionWiseCollectionModel.getTotalToPayAmount() - (reportModel[i].getGrandTotal() + reportModel[i].getAgentCommission()));
								}

								storeSubRegionWiseToPayeeDetails.put(reportModel[i].getDestinationSubRegionId() ,subRegionWiseToPayeeDetails);
							}else{

								subRegionWiseCollectionModel = (CityWiseCollectionModel)subRegionWiseToPayeeDetails.get(reportModel[i].getDestinationBranchId());

								if(subRegionWiseCollectionModel == null){

									subRegionWiseCollectionModel = new CityWiseCollectionModel();

									subRegionWiseCollectionModel.setBranchId(reportModel[i].getDestinationBranchId());
									subRegionWiseCollectionModel.setBranchName(reportModel[i].getWayBillDestinationBranch());
									subRegionWiseCollectionModel.setSubRegionId(reportModel[i].getDestinationSubRegionId());
									subRegionWiseCollectionModel.setSubRegionName(reportModel[i].getWayBillDestinationSubRegion());
									subRegionWiseCollectionModel.setTotalPaidAmount(-0);
									subRegionWiseCollectionModel.setTotalToPayAmount(- (reportModel[i].getGrandTotal() + reportModel[i].getAgentCommission()));

									subRegionWiseToPayeeDetails.put(reportModel[i].getDestinationBranchId(), subRegionWiseCollectionModel);
								}else{
									subRegionWiseCollectionModel.setTotalPaidAmount(subRegionWiseCollectionModel.getTotalPaidAmount() - 0);
									subRegionWiseCollectionModel.setTotalToPayAmount(subRegionWiseCollectionModel.getTotalToPayAmount() - (reportModel[i].getGrandTotal() + reportModel[i].getAgentCommission()));
								}

							}
							//SubRegion Wise ToPayee Details code
						} else if(reportModel[i].getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_PAID){
							totalCancellationGrandAmount += Math.round(reportModel[i].getGrandTotal()-reportModel[i].getAmount());
							//SubRegion Wise Paid Details code
							subRegionWiseToPayeeDetails = (HashMap<Long, Object>)storeSubRegionWiseToPayeeDetails.get(reportModel[i].getDestinationSubRegionId());

							if(subRegionWiseToPayeeDetails == null){
								subRegionWiseToPayeeDetails = new LinkedHashMap<Long, Object>();

								subRegionWiseCollectionModel = (CityWiseCollectionModel)subRegionWiseToPayeeDetails.get(reportModel[i].getDestinationBranchId());

								if(subRegionWiseCollectionModel == null){

									subRegionWiseCollectionModel = new CityWiseCollectionModel();

									subRegionWiseCollectionModel.setBranchId(reportModel[i].getDestinationBranchId());
									subRegionWiseCollectionModel.setBranchName(reportModel[i].getWayBillDestinationBranch());
									subRegionWiseCollectionModel.setSubRegionId(reportModel[i].getDestinationSubRegionId());
									subRegionWiseCollectionModel.setSubRegionName(reportModel[i].getWayBillDestinationSubRegion());
									subRegionWiseCollectionModel.setTotalPaidAmount(-reportModel[i].getGrandTotal());
									subRegionWiseCollectionModel.setTotalToPayAmount(-0);

									subRegionWiseToPayeeDetails.put(reportModel[i].getDestinationBranchId(), subRegionWiseCollectionModel);
								}else{
									subRegionWiseCollectionModel.setTotalPaidAmount(subRegionWiseCollectionModel.getTotalPaidAmount() - reportModel[i].getGrandTotal());
									subRegionWiseCollectionModel.setTotalToPayAmount(subRegionWiseCollectionModel.getTotalToPayAmount() - 0);
								}

								storeSubRegionWiseToPayeeDetails.put(reportModel[i].getDestinationSubRegionId() ,subRegionWiseToPayeeDetails);
							}else{

								subRegionWiseCollectionModel = (CityWiseCollectionModel)subRegionWiseToPayeeDetails.get(reportModel[i].getDestinationBranchId());

								if(subRegionWiseCollectionModel == null){

									subRegionWiseCollectionModel = new CityWiseCollectionModel();

									subRegionWiseCollectionModel.setBranchId(reportModel[i].getDestinationBranchId());
									subRegionWiseCollectionModel.setBranchName(reportModel[i].getWayBillDestinationBranch());
									subRegionWiseCollectionModel.setSubRegionId(reportModel[i].getDestinationSubRegionId());
									subRegionWiseCollectionModel.setSubRegionName(reportModel[i].getWayBillDestinationSubRegion());
									subRegionWiseCollectionModel.setTotalPaidAmount(-reportModel[i].getGrandTotal());
									subRegionWiseCollectionModel.setTotalToPayAmount(-0);

									subRegionWiseToPayeeDetails.put(reportModel[i].getDestinationBranchId(), subRegionWiseCollectionModel);
								}else{
									subRegionWiseCollectionModel.setTotalPaidAmount(subRegionWiseCollectionModel.getTotalPaidAmount() - reportModel[i].getGrandTotal());
									subRegionWiseCollectionModel.setTotalToPayAmount(subRegionWiseCollectionModel.getTotalToPayAmount() - 0);
								}

							}
							//SubRegion Wise Paid Details code
						}

						// WB Type
						WayBillCategoryTypeDetails wayBillCategoryTypeDetails = wbCategoryTypeDetails.get(reportModel[i].getWayBillType());

						if(wayBillCategoryTypeDetails == null){
							wayBillCategoryTypeDetails = new WayBillCategoryTypeDetails();

							wayBillCategoryTypeDetails.setWayBillType(reportModel[i].getWayBillType());
							wayBillCategoryTypeDetails.setQuantity(-reportModel[i].getNoOfPackages());
							wayBillCategoryTypeDetails.setBookingDiscount(-totalDiscount);
							wayBillCategoryTypeDetails.setTotalTax(-totalTax);
							wayBillCategoryTypeDetails.setTotalAmount(- (reportModel[i].getGrandTotal() - (reportModel[i].getDeliveryAmount() - reportModel[i].getDeliveryDiscount())));
							wayBillCategoryTypeDetails.setAgentCommission(- reportModel[i].getAgentCommission());
							wayBillCategoryTypeDetails.setTotalCancellationAmount(reportModel[i].getGrandTotal());

							final HashMap<Long,Double> chargesCollection = new HashMap<Long,Double>();

							for(int k=0;k<wayBillCharges.length;k++)
								if(wayBillCharges[k].getChargeType() == ChargeTypeMaster.WAYBILL_CHARGETYPE_BOOKING)
									chargesCollection.put(wayBillCharges[k].getWayBillChargeMasterId(),- wayBillCharges[k].getChargeAmount());

							wayBillCategoryTypeDetails.setChargesCollection(chargesCollection);

							wbCategoryTypeDetails.put(reportModel[i].getWayBillType(), wayBillCategoryTypeDetails);
						}else{

							wayBillCategoryTypeDetails.setQuantity(wayBillCategoryTypeDetails.getQuantity() - reportModel[i].getNoOfPackages());
							wayBillCategoryTypeDetails.setBookingDiscount(wayBillCategoryTypeDetails.getBookingDiscount() - totalDiscount);
							wayBillCategoryTypeDetails.setTotalTax(wayBillCategoryTypeDetails.getTotalTax() - totalTax);
							wayBillCategoryTypeDetails.setTotalAmount(wayBillCategoryTypeDetails.getTotalAmount() - (reportModel[i].getGrandTotal() - (reportModel[i].getDeliveryAmount() - reportModel[i].getDeliveryDiscount())));
							wayBillCategoryTypeDetails.setAgentCommission(wayBillCategoryTypeDetails.getAgentCommission() - reportModel[i].getAgentCommission());
							wayBillCategoryTypeDetails.setTotalCancellationAmount(wayBillCategoryTypeDetails.getTotalCancellationAmount() + reportModel[i].getGrandTotal());

							final HashMap<Long,Double> chargesCollection = wayBillCategoryTypeDetails.getChargesCollection();

							for(int k=0;k<wayBillCharges.length;k++)
								if(wayBillCharges[k].getChargeType() == ChargeTypeMaster.WAYBILL_CHARGETYPE_BOOKING)
									if(chargesCollection.get(wayBillCharges[k].getWayBillChargeMasterId()) != null)
										chargesCollection.put(wayBillCharges[k].getWayBillChargeMasterId(), chargesCollection.get(wayBillCharges[k].getWayBillChargeMasterId()) - wayBillCharges[k].getChargeAmount());
									else
										chargesCollection.put(wayBillCharges[k].getWayBillChargeMasterId(),- wayBillCharges[k].getChargeAmount());
						}
					}
				}

				request.setAttribute("reportModel", reportModel);
				request.setAttribute("wayBillTypeDetails", wbCategoryTypeDetails);
				request.setAttribute("storeSubRegionWiseToPayeeDetails", storeSubRegionWiseToPayeeDetails);
				request.setAttribute("totalGrandAmount", Math.round(totalBookingGrandAmount - totalCancellationGrandAmount - toPayCommissionToBeLess));

				ChargeTypeModel[] bookingCharges  = null;

				if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN) {
					final Branch branch = cache.getBranchById(request ,executive.getAccountGroupId() , branchId);

					if(branch.getMappingTypeId() == Branch.BRANCH_MAP_ID_OWN_BRANCH_AND_ASSIGNED)
						bookingCharges = cache.getBookingCharges(request, executive.getBranchId());
					else {
						bookingCharges  = cache.getBookingCharges(request, branchId);

						if(bookingCharges == null)
							bookingCharges  = ChargeTypeMasterDao.getInstance().getChargeConfiguration(reportModel[0].getAccountGroupId(), branch.getAgencyId(), branch.getBranchId(),ChargeTypeMaster.WAYBILL_CHARGETYPE_BOOKING);
					}
				} else
					bookingCharges = cache.getBookingCharges(request, executive.getBranchId());

				request.setAttribute("wayBillCharges",bookingCharges);
				ActionStaticUtil.setReportViewModel(request);
				request.setAttribute("nextPageToken", "success");
			}else {
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		} finally{
			error 								= null;
			executive       					= null;
			sdf             					= null;
			fromDate        					= null;
			toDate          					= null;
			branches  							= null;
			wayBillIds							= null;
			wayBillIdArray 						= null;
			cache								= null;
			reportModel 						= null;
			consignorColl						= null;
			consigneeColl						= null;
			consignor							= null;
			consignee							= null;
			wbCategoryTypeDetails 				= null;
			bookedWayBillCategoryTypeDetails 	= null;
			storeSubRegionWiseToPayeeDetails 		= null;
			subRegionWiseToPayeeDetails     			= null;
			subRegionWiseCollectionModel 			= null;
		}
	}
}