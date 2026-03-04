package com.ivcargo.reports;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashMap;
import java.util.SortedMap;
import java.util.TreeMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.properties.impl.PropertyConfigValueBLLImpl;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.ConsignmentSummaryDao;
import com.platform.dao.WayBillDao;
import com.platform.dao.WayBillHistoryDao;
import com.platform.dao.WayBillTaxDetailsDao;
import com.platform.dto.Branch;
import com.platform.dto.ConsignmentSummary;
import com.platform.dto.Executive;
import com.platform.dto.PropertiesFileConstants;
import com.platform.dto.Region;
import com.platform.dto.SubRegion;
import com.platform.dto.TransportCommonMaster;
import com.platform.dto.WayBill;
import com.platform.dto.WayBillTaxDetails;
import com.platform.dto.WayBillTaxTxn;
import com.platform.dto.WayBillType;
import com.platform.dto.configuration.report.account.ServiceTaxAmountReportConfigurationDTO;
import com.platform.dto.constant.WayBillTypeConstant;
import com.platform.dto.model.DayWiseDateModel;
import com.platform.dto.model.WayBillTaxModel;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

public class ServiceTaxAmountReportAction implements Action {

	@Override
	@SuppressWarnings("unchecked")
	public void execute(HttpServletRequest request, HttpServletResponse response) {

		// TODO Auto-generated method stub
		HashMap<String,Object>	 		error 					= null;
		Executive        				executive   			= null;
		CacheManip 					    cache 				    = null;
		SimpleDateFormat 				sdf            			= null;
		Timestamp        				fromDate       			= null;
		Timestamp        				toDate         			= null;
		ValueObject 					objectOutBkg			= null;
		ValueObject 					objectOutDly			= null;
		String							wayBillIds				= null;
		Long[]							wayBillIdArray		 	= null;
		HashMap<Long,WayBillTaxDetails>	resultHMForBkg  		= null;
		HashMap<Long,WayBillTaxDetails> resultHMForDly  		= null;
		WayBillTaxDetails				wbTaxDetails			= null;
		WayBillTaxModel					serviceTaxMdl			= null;
		String							branchesIds				= null;
		SortedMap<String, WayBillTaxModel> serviceTaxColl		= null;
		Branch							branch					= null;
		Region							region					= null;
		SubRegion						subRegion				= null;
		HashMap<Long, WayBill>          wayBillHM				= null;
		WayBill							waybill					= null;
		ArrayList<Long>       			assignedLocationIdList  = null;
		long 							regionId    			= 0;
		long 							subRegionId    			= 0;
		long 							branchId				= 0;
		int								filter					= 0;
		final long 							id 						= 0;
		int								time		  			= 0;
		Calendar			           	calCurrentDateTime		= null;
		ValueObject 					objectOutBkgDl			= null;
		ValueObject 					objectOutConSum			= null;
		HashMap<Long,WayBill>	        resultHMForBkgDl  		= null;
		WayBill							waybillDetail			= null;
		ConsignmentSummary 				consignmentSummary 	    = null;
		HashMap<Long, ConsignmentSummary>   consignmentSummaryHM= null;
		SortedMap<String, WayBillTaxModel> serviceTaxForCgnr	= null;
		SortedMap<String, WayBillTaxModel> serviceTaxForCnee	= null;
		WayBillTaxModel					  serviceTaxMdl1	    = null;
		ValueObject						configuration					= null;
		String							stAmtReportWithoutPaidLRDetails	= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeServiceTaxAmountReportAction().execute(request, response);
			/*
			 * Here we are getting the number of month user selecting for getting report
			 *
			 */

			time = JSPUtility.GetInt(request, "timeDuration");

			if(time == DayWiseDateModel.DAY_WISE_LAST_THIRTY_DAY_ID){
				sdf			= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
				fromDate	= new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00").getTime());
				toDate		= new Timestamp(sdf.parse(JSPUtility.GetString(request, "toDate") + " 23:59:59").getTime());
			}else{

				/*
				 * Here we are formatting the date for getting report of 3 month , 6 month ,12 month
				 *
				 */
				calCurrentDateTime 	= Calendar.getInstance();
				calCurrentDateTime.add(Calendar.DATE, -time);
				calCurrentDateTime.set(Calendar.DAY_OF_MONTH, 1);

				final Timestamp timeconvert=new Timestamp(calCurrentDateTime.getTimeInMillis());
				fromDate=Utility.getDateTime(new SimpleDateFormat("dd-MM-yyyy").format(timeconvert));
				calCurrentDateTime 	= Calendar.getInstance();
				calCurrentDateTime.set(Calendar.DAY_OF_MONTH, 1);
				calCurrentDateTime.add(Calendar.DATE, -1);

				calCurrentDateTime.set(Calendar.HOUR_OF_DAY, 23);
				calCurrentDateTime.set(Calendar.MINUTE, 59);
				calCurrentDateTime.set(Calendar.SECOND, 59);

				final Timestamp timeconvert1=new Timestamp(calCurrentDateTime.getTimeInMillis());

				toDate	= Utility.getDateTime(new SimpleDateFormat("dd-MM-yyyy HH:mm:ss").format(timeconvert1));

			}
			/*
			 * formatting date & setting to request for displaying on page
			 *
			 */
			sdf			= new SimpleDateFormat("dd-MM-yyyy");
			request.setAttribute("fromDate", sdf.format(fromDate));
			request.setAttribute("toDate", sdf.format(toDate));

			cache  		= new CacheManip(request);
			executive   = cache.getExecutive(request);

			ActionStaticUtil.executiveTypeWiseBranches(request, cache, executive);

			// Get the Selected Combo values
			if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_GROUPADMIN) {
				regionId	= Long.parseLong(request.getParameter("region"));
				subRegionId = Long.parseLong(request.getParameter("subRegion"));
				branchId 	= Long.parseLong(request.getParameter("branch"));
			} else if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_REGIONADMIN) {
				regionId	= executive.getRegionId();
				subRegionId = Long.parseLong(request.getParameter("subRegion"));
				branchId	 = Long.parseLong(request.getParameter("branch"));
			} else if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_SUBREGIONADMIN) {
				regionId	= executive.getRegionId();
				subRegionId = executive.getSubRegionId();
				branchId	= Long.parseLong(request.getParameter("branch"));
			} else {
				regionId	= executive.getRegionId();
				subRegionId = executive.getSubRegionId();
				branchId	= executive.getBranchId();
			}

			if(regionId == 0 && subRegionId == 0 && branchId == 0){
				branchesIds = cache.getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_GROUP, id);
				filter = TransportCommonMaster.DATA_LEVEL_GROUP_ID;
			} else if(subRegionId == 0 && branchId == 0) {
				branchesIds = cache.getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_REGION, regionId);
				filter = TransportCommonMaster.DATA_LEVEL_REGION_ID;
			} else if(subRegionId > 0 && branchId == 0) {
				branchesIds = cache.getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_SUBREGION, subRegionId);
				filter = TransportCommonMaster.DATA_LEVEL_SUB_REGION_ID;
			} else if(subRegionId > 0 && branchId > 0) {
				assignedLocationIdList = cache.getAssignedLocationsIdListByLocationIdId(request, branchId, executive.getAccountGroupId());

				if(!assignedLocationIdList.contains(branchId))
					assignedLocationIdList.add(branchId);

				branchesIds = Utility.GetLongArrayListToString(assignedLocationIdList);
				filter = TransportCommonMaster.DATA_LEVEL_BRANCH_ID;
			}
			/*
			 * here we are getting the wayBillIds from wayBillHistory table
			 * because WayBill table contain latest updated records
			 * so we are not getting actual date when wayBill created
			 * so we are getting all wayBill booked between fromDate to toDate
			 *
			 */

			String wayBillIdsFromHistory=WayBillHistoryDao.getInstance().getWayBillHistoryByBranchIds(executive.getAccountGroupId(), branchesIds, fromDate, toDate,WayBill.WAYBILL_STATUS_BOOKED);
			/*
			 * if wayBillIds are empty then we are putting o as default otherwise we will get errors
			 *
			 */
			if(wayBillIdsFromHistory.isEmpty())
				wayBillIdsFromHistory="0";

			configuration		= PropertyConfigValueBLLImpl.getInstance().getConfiguration(executive, PropertiesFileConstants.SERVICE_TAX_AMOUNT_REPORT_CONFIG);
			stAmtReportWithoutPaidLRDetails			= configuration.getString(ServiceTaxAmountReportConfigurationDTO.ST_AMT_REPORT_WITHOUT_PAID_LR_DETAILS,"false");

			objectOutBkgDl  =  WayBillDao.getInstance().GetWayBillWayBillTaxTxnByBranchIds(executive.getAccountGroupId(), branchesIds,wayBillIdsFromHistory, fromDate, toDate,WayBill.WAYBILL_STATUS_BOOKED,(short)1);

			objectOutBkg    = WayBillTaxDetailsDao.getInstance().getWayBillTaxDetailsByBranchIds(executive.getAccountGroupId(), branchesIds, fromDate, toDate,WayBillTaxTxn.WAYBILL_TAX_TXN_TYPE_BOOKING,(short)1,stAmtReportWithoutPaidLRDetails, WayBillType.WAYBILL_TYPE_PAID);
			objectOutDly    =  WayBillTaxDetailsDao.getInstance().getWayBillTaxDetailsByBranchIds(executive.getAccountGroupId(), branchesIds, fromDate, toDate,WayBillTaxTxn.WAYBILL_TAX_TXN_TYPE_DELIVERY,(short)2,stAmtReportWithoutPaidLRDetails, WayBillType.WAYBILL_TYPE_PAID);
			/*
			 * Three map for transporter,consignee & Consignor
			 *
			 */

			serviceTaxColl          = new TreeMap<String, WayBillTaxModel>();
			serviceTaxForCgnr		= new TreeMap<String, WayBillTaxModel>();
			serviceTaxForCnee		= new TreeMap<String, WayBillTaxModel>();

			if(objectOutBkgDl != null){
				resultHMForBkgDl= (HashMap<Long,WayBill>)objectOutBkgDl.get("resultHM");
				wayBillIdArray	= (Long[])objectOutBkgDl.get("wayBillIdArray");
				wayBillIds		= Utility.GetLongArrayToString(wayBillIdArray);
				objectOutConSum=ConsignmentSummaryDao.getInstance().getTaxPaidBy(wayBillIds);

				/*
				 * Purpose:here we are getting information about who paid tax i.e consignee or Consignor
				 * We are getting information from ConsignmentSummary
				 *
				 */
				consignmentSummaryHM=(HashMap<Long, ConsignmentSummary>) objectOutConSum.get("consignmentSummaryHM");

				for (final Long key : resultHMForBkgDl.keySet()) {

					waybillDetail = resultHMForBkgDl.get(key);
					consignmentSummary=consignmentSummaryHM.get(key);
					branch = cache.getBranchById(request, executive.getAccountGroupId(),waybillDetail.getSourceBranchId());
					region = cache.getRegionByIdAndGroupId(request, branch.getRegionId(),executive.getAccountGroupId());
					subRegion = cache.getGenericSubRegionById(request, branch.getSubRegionId());
					/*
					 * Here we are checking for Consignor paid the tax & putting in map
					 *
					 */

					if(waybillDetail.getUnAddedTaxAmount()>0&&consignmentSummary.getTaxBy()==TransportCommonMaster.TAX_PAID_BY_CONSINGOR_ID){

						switch (filter) {
						case TransportCommonMaster.DATA_LEVEL_GROUP_ID:
							serviceTaxMdl = serviceTaxForCgnr.get(region.getName()+"_"+region.getRegionId());
							break;
						case TransportCommonMaster.DATA_LEVEL_REGION_ID:
							serviceTaxMdl = serviceTaxForCgnr.get(subRegion.getName()+"_"+subRegion.getSubRegionId());
							break;
						case TransportCommonMaster.DATA_LEVEL_SUB_REGION_ID:
							serviceTaxMdl = serviceTaxForCgnr.get(branch.getName()+"_"+branch.getBranchId());
							break;
						default:
							serviceTaxMdl = serviceTaxForCgnr.get(branch.getName()+"_"+branch.getBranchId());
							break;
						}

						if(serviceTaxMdl == null){

							serviceTaxMdl = new WayBillTaxModel();
							serviceTaxMdl.setBranchId(branch.getBranchId());
							serviceTaxMdl.setBranchName(branch.getName());
							serviceTaxMdl.setRegionId(region.getRegionId());
							serviceTaxMdl.setRegionName(region.getName());
							serviceTaxMdl.setSubRegionId(subRegion.getSubRegionId());
							serviceTaxMdl.setSubRegionName(subRegion.getName());
							serviceTaxMdl.setTaxPaidBy(consignmentSummary.getTaxBy());

							if(waybillDetail.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID
									|| waybillDetail.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY
									|| waybillDetail.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT)
								serviceTaxMdl.setUnAddedTaxAmount(waybillDetail.getUnAddedTaxAmount());

							serviceTaxMdl.setAmount(waybillDetail.getAmount());

							if(filter == TransportCommonMaster.DATA_LEVEL_GROUP_ID)
								serviceTaxForCgnr.put(region.getName()+"_"+region.getRegionId(),serviceTaxMdl);
							else if(filter == TransportCommonMaster.DATA_LEVEL_REGION_ID)
								serviceTaxForCgnr.put(subRegion.getName()+"_"+subRegion.getSubRegionId(),serviceTaxMdl);
							else
								serviceTaxForCgnr.put(branch.getName()+"_"+branch.getBranchId(),serviceTaxMdl);
						} else {
							serviceTaxMdl.setTaxPaidBy(consignmentSummary.getTaxBy());
							if(waybillDetail.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID
									|| waybillDetail.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY
									|| waybillDetail.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT)
								serviceTaxMdl.setUnAddedTaxAmount(waybillDetail.getUnAddedTaxAmount() + serviceTaxMdl.getUnAddedTaxAmount());
							serviceTaxMdl.setAmount(waybillDetail.getAmount()+ serviceTaxMdl.getAmount());
						}
					}
					/*
					 * Here we are checking for Consignee paid the tax & putting in map
					 *
					 */
					if(waybillDetail.getUnAddedTaxAmount()>0&&consignmentSummary.getTaxBy()==TransportCommonMaster.TAX_PAID_BY_CONSINGEE_ID){

						switch (filter) {
						case TransportCommonMaster.DATA_LEVEL_GROUP_ID:
							serviceTaxMdl1 = serviceTaxForCnee.get(region.getName()+"_"+region.getRegionId());
							break;
						case TransportCommonMaster.DATA_LEVEL_REGION_ID:
							serviceTaxMdl1 = serviceTaxForCnee.get(subRegion.getName()+"_"+subRegion.getSubRegionId());
							break;
						case TransportCommonMaster.DATA_LEVEL_SUB_REGION_ID:
							serviceTaxMdl1 = serviceTaxForCnee.get(branch.getName()+"_"+branch.getBranchId());
							break;
						default:
							serviceTaxMdl1 = serviceTaxForCnee.get(branch.getName()+"_"+branch.getBranchId());
							break;
						}

						if(serviceTaxMdl1 == null){
							serviceTaxMdl1 = new WayBillTaxModel();
							serviceTaxMdl1.setBranchId(branch.getBranchId());
							serviceTaxMdl1.setBranchName(branch.getName());
							serviceTaxMdl1.setRegionId(region.getRegionId());
							serviceTaxMdl1.setRegionName(region.getName());
							serviceTaxMdl1.setSubRegionId(subRegion.getSubRegionId());
							serviceTaxMdl1.setSubRegionName(subRegion.getName());
							serviceTaxMdl1.setTaxPaidBy(consignmentSummary.getTaxBy());

							if(waybillDetail.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID
									|| waybillDetail.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY
									|| waybillDetail.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT)
								serviceTaxMdl1.setUnAddedTaxAmount(waybillDetail.getUnAddedTaxAmount());

							serviceTaxMdl1.setAmount(waybillDetail.getAmount());

							if(filter == TransportCommonMaster.DATA_LEVEL_GROUP_ID)
								serviceTaxForCnee.put(region.getName()+"_"+region.getRegionId(),serviceTaxMdl1);
							else if(filter == TransportCommonMaster.DATA_LEVEL_REGION_ID)
								serviceTaxForCnee.put(subRegion.getName()+"_"+subRegion.getSubRegionId(),serviceTaxMdl1);
							else
								serviceTaxForCnee.put(branch.getName()+"_"+branch.getBranchId(),serviceTaxMdl1);
						} else {
							serviceTaxMdl1.setTaxPaidBy(consignmentSummary.getTaxBy());

							if(waybillDetail.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID
									|| waybillDetail.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY
									|| waybillDetail.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT)
								serviceTaxMdl1.setUnAddedTaxAmount(waybillDetail.getUnAddedTaxAmount() + serviceTaxMdl1.getUnAddedTaxAmount());
							serviceTaxMdl1.setAmount(waybillDetail.getAmount()+ serviceTaxMdl1.getAmount());
						}
					}
				}
			}

			if(objectOutBkg != null){
				resultHMForBkg	= (HashMap<Long,WayBillTaxDetails>)objectOutBkg.get("resultHM");
				wayBillIdArray	= (Long[])objectOutBkg.get("wayBillIdArray");
				wayBillIds		= Utility.GetLongArrayToString(wayBillIdArray);
				wayBillHM		= WayBillDao.getInstance().getLimitedLRDetails(wayBillIds);

				for (final Long key : resultHMForBkg.keySet()) {
					wbTaxDetails = resultHMForBkg.get(key);

					branch = cache.getBranchById(request, executive.getAccountGroupId(),wbTaxDetails.getSourceBranchId());
					region = cache.getRegionByIdAndGroupId(request, branch.getRegionId(),executive.getAccountGroupId());
					subRegion = cache.getSubRegionByIdAndGroupId(request, branch.getSubRegionId(),executive.getAccountGroupId());

					if(wbTaxDetails.getAmount() != 0){
						waybill	= wayBillHM.get(key);

						switch (filter) {
						case TransportCommonMaster.DATA_LEVEL_GROUP_ID:
							serviceTaxMdl = serviceTaxColl.get(region.getName()+"_"+region.getRegionId());
							break;
						case TransportCommonMaster.DATA_LEVEL_REGION_ID:
							serviceTaxMdl = serviceTaxColl.get(subRegion.getName()+"_"+subRegion.getSubRegionId());
							break;
						case TransportCommonMaster.DATA_LEVEL_SUB_REGION_ID:
							serviceTaxMdl = serviceTaxColl.get(branch.getName()+"_"+branch.getBranchId());
							break;
						default:
							serviceTaxMdl = serviceTaxColl.get(branch.getName()+"_"+branch.getBranchId());
							break;
						}

						if(serviceTaxMdl == null){

							serviceTaxMdl = new WayBillTaxModel();
							serviceTaxMdl.setBranchId(branch.getBranchId());
							serviceTaxMdl.setBranchName(branch.getName());
							serviceTaxMdl.setRegionId(region.getRegionId());
							serviceTaxMdl.setRegionName(region.getName());
							serviceTaxMdl.setSubRegionId(subRegion.getSubRegionId());
							serviceTaxMdl.setSubRegionName(subRegion.getName());

							if(waybill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID
									|| waybill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY)
								serviceTaxMdl.setBookingSTAmount(wbTaxDetails.getAmount());
							else if(waybill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT)
								serviceTaxMdl.setBillSTAmount(wbTaxDetails.getAmount());
							if(filter == TransportCommonMaster.DATA_LEVEL_GROUP_ID)
								serviceTaxColl.put(region.getName()+"_"+region.getRegionId(),serviceTaxMdl);
							else if(filter == TransportCommonMaster.DATA_LEVEL_REGION_ID)
								serviceTaxColl.put(subRegion.getName()+"_"+subRegion.getSubRegionId(),serviceTaxMdl);
							else
								serviceTaxColl.put(branch.getName()+"_"+branch.getBranchId(),serviceTaxMdl);

							serviceTaxMdl.setTaxOnAmount(wbTaxDetails.getTaxOnAmount());
							serviceTaxMdl.setTotalServiceTaxAmount(wbTaxDetails.getAmount());
						} else {
							if(waybill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID
									|| waybill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY)
								serviceTaxMdl.setBookingSTAmount(wbTaxDetails.getAmount() + serviceTaxMdl.getBookingSTAmount());
							else if(waybill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT)
								serviceTaxMdl.setBillSTAmount(wbTaxDetails.getAmount() + serviceTaxMdl.getBillSTAmount());
							serviceTaxMdl.setTaxOnAmount(wbTaxDetails.getTaxOnAmount()+ serviceTaxMdl.getTaxOnAmount());
							serviceTaxMdl.setTotalServiceTaxAmount(serviceTaxMdl.getTotalServiceTaxAmount()+ wbTaxDetails.getAmount());
						}
					}
				}
			}

			if(objectOutDly != null){

				resultHMForDly	= (HashMap<Long,WayBillTaxDetails>)objectOutDly.get("resultHM");
				wayBillIdArray	= (Long[])objectOutDly.get("wayBillIdArray");
				wayBillIds		= Utility.GetLongArrayToString(wayBillIdArray);
				wayBillHM		= WayBillDao.getInstance().getLimitedLRDetails(wayBillIds);

				for (final Long key : resultHMForDly.keySet()) {
					wbTaxDetails = resultHMForDly.get(key);

					branch = cache.getBranchById(request, executive.getAccountGroupId(),wbTaxDetails.getBranchId());
					region = cache.getRegionByIdAndGroupId(request, branch.getRegionId(),executive.getAccountGroupId());
					subRegion = cache.getSubRegionByIdAndGroupId(request, branch.getSubRegionId(),executive.getAccountGroupId());

					if(wbTaxDetails.getAmount() != 0){
						waybill	= wayBillHM.get(key);

						switch (filter) {
						case TransportCommonMaster.DATA_LEVEL_GROUP_ID:
							serviceTaxMdl = serviceTaxColl.get(region.getName()+"_"+region.getRegionId());
							break;
						case TransportCommonMaster.DATA_LEVEL_REGION_ID:
							serviceTaxMdl = serviceTaxColl.get(subRegion.getName()+"_"+subRegion.getSubRegionId());
							break;
						case TransportCommonMaster.DATA_LEVEL_SUB_REGION_ID:
							serviceTaxMdl = serviceTaxColl.get(branch.getName()+"_"+branch.getBranchId());
							break;
						default:
							serviceTaxMdl = serviceTaxColl.get(branch.getName()+"_"+branch.getBranchId());
							break;
						}

						if(serviceTaxMdl == null){
							serviceTaxMdl = new WayBillTaxModel();
							serviceTaxMdl.setBranchId(branch.getBranchId());
							serviceTaxMdl.setBranchName(branch.getName());
							serviceTaxMdl.setRegionId(region.getRegionId());
							serviceTaxMdl.setRegionName(region.getName());
							serviceTaxMdl.setSubRegionId(subRegion.getSubRegionId());
							serviceTaxMdl.setSubRegionName(subRegion.getName());

							if(waybill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID
									|| waybill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY
									|| waybill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT)
								serviceTaxMdl.setDeliverySTAmount(wbTaxDetails.getAmount());

							if(filter == TransportCommonMaster.DATA_LEVEL_GROUP_ID)
								serviceTaxColl.put(region.getName()+"_"+region.getRegionId(),serviceTaxMdl);
							else if(filter == TransportCommonMaster.DATA_LEVEL_REGION_ID)
								serviceTaxColl.put(subRegion.getName()+"_"+subRegion.getSubRegionId(),serviceTaxMdl);
							else
								serviceTaxColl.put(branch.getName()+"_"+branch.getBranchId(),serviceTaxMdl);

							serviceTaxMdl.setTaxOnAmount(wbTaxDetails.getTaxOnAmount());
							serviceTaxMdl.setTotalServiceTaxAmount(wbTaxDetails.getAmount());
						} else {
							if(waybill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID
									|| waybill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY
									|| waybill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT)
								serviceTaxMdl.setDeliverySTAmount(wbTaxDetails.getAmount() + serviceTaxMdl.getDeliverySTAmount());

							serviceTaxMdl.setTaxOnAmount(wbTaxDetails.getTaxOnAmount()+ serviceTaxMdl.getTaxOnAmount());
							serviceTaxMdl.setTotalServiceTaxAmount(serviceTaxMdl.getTotalServiceTaxAmount()+ wbTaxDetails.getAmount());
						}
					}
				}
			}

			serviceTaxMdl1			= null;

			/*
			 * Here we are iterating through map & checking for key
			 * because we need all keys to be present in serviceTaxColl map
			 *
			 *
			 */
			for(final String st1:serviceTaxForCgnr.keySet())
				if(!serviceTaxColl.containsKey(st1)){
					serviceTaxMdl1=serviceTaxForCgnr.get(st1);
					serviceTaxColl.put(st1, serviceTaxMdl1);
				}

			for(final String st2:serviceTaxForCnee.keySet())
				if(!serviceTaxColl.containsKey(st2)){
					serviceTaxMdl1=serviceTaxForCnee.get(st2);
					serviceTaxColl.put(st2, serviceTaxMdl1);
				}

			if (serviceTaxColl != null && serviceTaxColl.size() > 0||serviceTaxForCgnr!=null&&serviceTaxForCgnr.size()>0||serviceTaxForCnee!=null&&serviceTaxForCnee.size()>0) {
				request.setAttribute("serviceTaxColl", serviceTaxColl);
				request.setAttribute("serviceTaxForCgnr", serviceTaxForCgnr);
				request.setAttribute("serviceTaxForCnee", serviceTaxForCnee);
			}else {
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}

			ActionStaticUtil.setReportViewModel(request);
			request.setAttribute("nextPageToken", "success");
		} catch (final Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		} finally {
			error 					= null;
			executive   			= null;
			cache 				    = null;
			sdf            			= null;
			fromDate       			= null;
			toDate         			= null;
			objectOutBkg			= null;
			objectOutDly			= null;
			wayBillIds				= null;
			wayBillIdArray		 	= null;
			resultHMForBkg  		= null;
			resultHMForDly  		= null;
			wbTaxDetails			= null;
			serviceTaxMdl			= null;
			branchesIds				= null;
			serviceTaxColl			= null;
			branch					= null;
			region					= null;
			subRegion				= null;
			wayBillHM				= null;
			waybill					= null;
			assignedLocationIdList  = null;
			calCurrentDateTime		= null;
			objectOutBkgDl			= null;
			resultHMForBkgDl  		= null;
			waybillDetail           = null;
			consignmentSummary 	    = null;
			consignmentSummaryHM    = null;
			serviceTaxForCgnr		= null;
			serviceTaxForCnee		= null;
		}


	}
}
