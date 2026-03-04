
package com.ivcargo.reports;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
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
import com.platform.dao.WayBillDao;
import com.platform.dao.WayBillTaxDetailsDao;
import com.platform.dto.Branch;
import com.platform.dto.Executive;
import com.platform.dto.PropertiesFileConstants;
import com.platform.dto.Region;
import com.platform.dto.SubRegion;
import com.platform.dto.TransportCommonMaster;
import com.platform.dto.WayBill;
import com.platform.dto.WayBillTaxDetails;
import com.platform.dto.WayBillTaxTxn;
import com.platform.dto.WayBillType;
import com.platform.dto.configuration.report.account.ServiceTaxSummaryReportConfigurationDTO;
import com.platform.dto.constant.WayBillTypeConstant;
import com.platform.dto.model.WayBillTaxModel;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

public class ServiceTaxSummaryReportAction implements Action {

	@Override
	@SuppressWarnings("unchecked")
	public void execute(HttpServletRequest request, HttpServletResponse response) {
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
		ValueObject						configuration					= null;
		String							stSummReportWithoutPaidLRDetails= null;
		String							setDefaultDataLevelFilter		= null;
		String							defaultDataLevelFilter			= null;
		boolean							roundOffAmount					= false;


		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeServiceTaxSummaryReportAction().execute(request, response);

			sdf			= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			fromDate	= new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00").getTime());
			toDate		= new Timestamp(sdf.parse(JSPUtility.GetString(request, "toDate") + " 23:59:59").getTime());
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

			configuration						= PropertyConfigValueBLLImpl.getInstance().getConfiguration(executive, PropertiesFileConstants.SERVICE_TAX_SUMMARY_REPORT_CONFIG);
			stSummReportWithoutPaidLRDetails	= configuration.getString(ServiceTaxSummaryReportConfigurationDTO.ST_SUMMARY_REPORT_WITHOUT_PAID_LR_DETAILS,"false");
			setDefaultDataLevelFilter			= configuration.getString(ServiceTaxSummaryReportConfigurationDTO.SET_DEFAULT_DATA_LEVEL_FILTER,"false");
			defaultDataLevelFilter				= configuration.getString(ServiceTaxSummaryReportConfigurationDTO.DEFAULT_DATA_LEVEL_FILTER);
			roundOffAmount						= configuration.getBoolean(ServiceTaxSummaryReportConfigurationDTO.ROUND_OFF_AMOUNT,false);

			if("true".equals(setDefaultDataLevelFilter))
				filter = Integer.parseInt(defaultDataLevelFilter);

			objectOutBkg = WayBillTaxDetailsDao.getInstance().getWayBillTaxDetailsByBranchIds(executive.getAccountGroupId(), branchesIds, fromDate, toDate,WayBillTaxTxn.WAYBILL_TAX_TXN_TYPE_BOOKING,(short)1,stSummReportWithoutPaidLRDetails, WayBillType.WAYBILL_TYPE_PAID);
			objectOutDly = WayBillTaxDetailsDao.getInstance().getWayBillTaxDetailsByBranchIds(executive.getAccountGroupId(), branchesIds, fromDate, toDate,WayBillTaxTxn.WAYBILL_TAX_TXN_TYPE_DELIVERY,(short)2,stSummReportWithoutPaidLRDetails, WayBillType.WAYBILL_TYPE_PAID);

			serviceTaxColl = new TreeMap<String, WayBillTaxModel>();
			if(objectOutBkg != null){

				resultHMForBkg	= (HashMap<Long,WayBillTaxDetails>)objectOutBkg.get("resultHM");
				wayBillIdArray	= (Long[])objectOutBkg.get("wayBillIdArray");
				wayBillIds		= Utility.GetLongArrayToString(wayBillIdArray);
				wayBillHM		= WayBillDao.getInstance().getLimitedLRDetails(wayBillIds);

				for (final Long key : resultHMForBkg.keySet()) {

					wbTaxDetails = resultHMForBkg.get(key);

					branch = cache.getBranchById(request, executive.getAccountGroupId(),wbTaxDetails.getSourceBranchId());
					region = cache.getRegionByIdAndGroupId(request, branch.getRegionId(),executive.getAccountGroupId());
					subRegion = cache.getGenericSubRegionById(request, branch.getSubRegionId());

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
									|| waybill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY) {
								serviceTaxMdl.setBookingSTAmount(wbTaxDetails.getAmount());
								serviceTaxMdl.setBookingTotal(wbTaxDetails.getTaxOnAmount());
							} else if(waybill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT) {
								serviceTaxMdl.setBillSTAmount(wbTaxDetails.getAmount());
								serviceTaxMdl.setBillingTotal(wbTaxDetails.getTaxOnAmount());
							}
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
									|| waybill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY) {
								serviceTaxMdl.setBookingSTAmount(wbTaxDetails.getAmount() + serviceTaxMdl.getBookingSTAmount());
								serviceTaxMdl.setBookingTotal(wbTaxDetails.getTaxOnAmount() + serviceTaxMdl.getBookingTotal());
							} else if(waybill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT) {
								serviceTaxMdl.setBillSTAmount(wbTaxDetails.getAmount() + serviceTaxMdl.getBillSTAmount());
								serviceTaxMdl.setBillingTotal(wbTaxDetails.getTaxOnAmount() + serviceTaxMdl.getBillingTotal());
							}
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

							serviceTaxMdl.setDeliveryTotal(wbTaxDetails.getTaxOnAmount());
							serviceTaxMdl.setTaxOnAmount(wbTaxDetails.getTaxOnAmount());
							serviceTaxMdl.setTotalServiceTaxAmount(wbTaxDetails.getAmount());
						} else {
							if(waybill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID
									|| waybill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY
									|| waybill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT)
								serviceTaxMdl.setDeliverySTAmount(wbTaxDetails.getAmount() + serviceTaxMdl.getDeliverySTAmount());
							serviceTaxMdl.setDeliveryTotal(wbTaxDetails.getTaxOnAmount() + serviceTaxMdl.getDeliveryTotal());
							serviceTaxMdl.setTaxOnAmount(wbTaxDetails.getTaxOnAmount()+ serviceTaxMdl.getTaxOnAmount());
							serviceTaxMdl.setTotalServiceTaxAmount(serviceTaxMdl.getTotalServiceTaxAmount()+ wbTaxDetails.getAmount());
						}
					}
				}

			}

			if (serviceTaxColl != null && serviceTaxColl.size() > 0) {
				request.setAttribute("serviceTaxColl", serviceTaxColl);
				request.setAttribute("roundOffAmount", roundOffAmount);
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
		}
	}
}
