package com.ivcargo.reports;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.SortedMap;
import java.util.TreeMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.ObjectUtils;

import com.businesslogic.properties.impl.PropertyConfigValueBLLImpl;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.dto.constant.ExecutiveTypeConstant;
import com.iv.dto.constant.WayBillStatusConstant;
import com.iv.dto.constant.WayBillTypeConstant;
import com.iv.utils.constant.AccountGroupConstant;
import com.iv.utils.utility.CollectionUtility;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.CustomerDetailsDao;
import com.platform.dao.DeliveryContactDetailsDao;
import com.platform.dao.WayBillDao;
import com.platform.dao.WayBillTaxDetailsDao;
import com.platform.dao.reports.BillSummaryDAO;
import com.platform.dto.BillSummary;
import com.platform.dto.PropertiesFileConstants;
import com.platform.dto.TransportCommonMaster;
import com.platform.dto.WayBill;
import com.platform.dto.WayBillTaxDetails;
import com.platform.dto.WayBillTaxTxn;
import com.platform.dto.configuration.report.account.ServiceTaxReportConfigurationDTO;
import com.platform.dto.constant.DeliveryStatusConstant;
import com.platform.dto.model.WayBillTaxModel;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

public class ServiceTaxReportAction implements Action {

	@Override
	@SuppressWarnings("unchecked")
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	 		error 					= null;
		SortedMap<Long, WayBillTaxModel>bkdWbCol				= null;
		SortedMap<Long, WayBillTaxModel>bkdCrdtWbCol			= null;
		SortedMap<Long, WayBillTaxModel>dlvrdWbCol				= null;
		HashMap<Long, BillSummary>		billColl				= null;
		var 							subRegionId    			= 0L;
		var 							branchId				= 0L;
		String							branchIds						= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeServiceTaxReportAction().execute(request, response);

			if(JSPUtility.GetString(request, "fromDate") == null || JSPUtility.GetString(request, "toDate") == null) {
				ActionStaticUtil.catchActionException(request, error, "Select Proper From Date and To Date !");
				return;
			}

			final var	sdf			= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			final var	fromDate	= new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00").getTime());
			final var	toDate		= new Timestamp(sdf.parse(JSPUtility.GetString(request, "toDate") + " 23:59:59").getTime());
			final var	cache  		= new CacheManip(request);
			final var	executive   = cache.getExecutive(request);
			var	destBranchIds	= new ArrayList<Long>();
			var	srcBranchIds	= new ArrayList<Long>();
			final var	arrayListOfLocations = new ArrayList<Long>();

			ActionStaticUtil.executiveTypeWiseBranches(request, cache, executive);

			if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN || executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_REGIONADMIN){
				subRegionId = JSPUtility.GetLong(request, "subRegion", 0);
				branchId 	= JSPUtility.GetLong(request, "branch", 0);
			} else if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_SUBREGIONADMIN) {
				subRegionId = executive.getSubRegionId();
				branchId 	= JSPUtility.GetLong(request, "branch", 0);
			} else {
				subRegionId = executive.getSubRegionId();
				branchId 	= executive.getBranchId();
			}

			if (branchId == 0)
				branchIds = cache.getPhysicalBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_SUBREGION, subRegionId);
			else
				branchIds = Long.toString(branchId);

			final var array = CollectionUtility.getLongListFromString(branchIds);

			for (final Long element : array) {
				final var	assignedLocationIdList = cache.getAssignedLocationsIdListByLocationIdId(request, element, executive.getAccountGroupId());

				if(!assignedLocationIdList.contains(element))
					assignedLocationIdList.add(element);

				arrayListOfLocations.addAll(assignedLocationIdList);
			}

			final var	branchIDs 						= CollectionUtility.getStringFromLongList(arrayListOfLocations);
			final var	configuration					= PropertyConfigValueBLLImpl.getInstance().getConfiguration(executive, PropertiesFileConstants.SERVICE_TAX_REPORT_CONFIG);
			final var	stReportWithoutPaidLRDetails	= configuration.getString(ServiceTaxReportConfigurationDTO.ST_REPORT_WITHOUT_PAID_LR_DETAILS,"false");
			final var	roundOffAmount					= configuration.getBoolean(ServiceTaxReportConfigurationDTO.ROUND_OFF_AMOUNT,false);

			final var	objectOutBkg = WayBillTaxDetailsDao.getInstance().getWayBillTaxDetailsByBranchIds(executive.getAccountGroupId(), branchIDs, fromDate, toDate,WayBillTaxTxn.WAYBILL_TAX_TXN_TYPE_BOOKING,(short)1,stReportWithoutPaidLRDetails, WayBillTypeConstant.WAYBILL_TYPE_PAID);
			final var	objectOutDly = WayBillTaxDetailsDao.getInstance().getWayBillTaxDetailsByBranchIds(executive.getAccountGroupId(), branchIDs, fromDate, toDate,WayBillTaxTxn.WAYBILL_TAX_TXN_TYPE_DELIVERY,(short)2,stReportWithoutPaidLRDetails, WayBillTypeConstant.WAYBILL_TYPE_PAID);

			arrayListOfLocations.clear();

			if(objectOutBkg != null){
				bkdWbCol		= new TreeMap<>();
				bkdCrdtWbCol	= new TreeMap<>();

				final var	resultHMForBkg		= (HashMap<Long,WayBillTaxDetails>)objectOutBkg.get("resultHM");
				final var	wayBillIdArray		= (Long[])objectOutBkg.get("wayBillIdArray");

				final var	wayBillIds		= Utility.GetLongArrayToString(wayBillIdArray);
				final var	wbSTCount		= WayBillTaxDetailsDao.getInstance().getSTCountByWayBillIds(executive.getAccountGroupId(), wayBillIds, WayBillTaxTxn.WAYBILL_TAX_TXN_TYPE_BOOKING);
				final var	outValObj		= WayBillDao.getInstance().getLRDetailsForServieceTax(wayBillIds,WayBill.WAYBILL_STATUS_BOOKED);
				final var	creditWayBillIds= (String)outValObj.get("creditWayBillIds");
				final var	consignorColl 	= CustomerDetailsDao.getInstance().getConsignorDetailsByWayBillId(wayBillIds);
				final var	consigneeColl 	= CustomerDetailsDao.getInstance().getConsigneeDetailsByWayBillId(wayBillIds);
				final var	custList 		= CustomerDetailsDao.getInstance().getConsignorDetailsByWayBillId(wayBillIds);
				final var	cancelledWBDetl = WayBillDao.getInstance().getWayBillDetailsByStatusInDateRange(wayBillIds, WayBill.WAYBILL_STATUS_CANCELLED, fromDate, toDate);

				if(creditWayBillIds != null && creditWayBillIds.length() > 1)
					billColl = BillSummaryDAO.getInstance().getBillDetailsByLRId(creditWayBillIds);

				final var	lrColl = (HashMap<Long, WayBillTaxModel>)outValObj.get("lrColl");

				for (final Long key : resultHMForBkg.keySet()) {
					final var	wbTaxDetails		= resultHMForBkg.get(key);

					if(wbTaxDetails.getAmount() != 0) {
						final var	wayBillTaxMdl	= lrColl.get(key);

						if(wbTaxDetails.getDestinationBranchId() > 0) {
							wayBillTaxMdl.setDestinationBranch(cache.getGenericBranchDetailCache(request,wbTaxDetails.getDestinationBranchId()).getName());
							wayBillTaxMdl.setDestinationBranchId(wbTaxDetails.getDestinationBranchId());
							destBranchIds.add(wbTaxDetails.getDestinationBranchId());
						} else
							wayBillTaxMdl.setDestinationBranch(wayBillTaxMdl.getDeliveryPlace()+" (DDDV)");

						if(wbTaxDetails.getSourceBranchId() > 0)
							wayBillTaxMdl.setSourceBranch(cache.getGenericBranchDetailCache(request,wbTaxDetails.getSourceBranchId()).getName());
						else
							wayBillTaxMdl.setSourceBranch("--");

						if(wayBillTaxMdl.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID){
							final var	consignor = consignorColl.get(wayBillTaxMdl.getWayBillId());
							wayBillTaxMdl.setName(consignor.getName()+" (C/nor)");
						} else if(wayBillTaxMdl.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY){
							final var	consignee = consigneeColl.get(wayBillTaxMdl.getWayBillId());
							wayBillTaxMdl.setName(consignee.getName()+" (C/nee)");
						}

						wayBillTaxMdl.setWayBillType(WayBillTypeConstant.getWayBillTypeShortNameByWayBilTypeId(wayBillTaxMdl.getWayBillTypeId()));
						wayBillTaxMdl.setGrandTotal(wbTaxDetails.getGrandTotal());
						wayBillTaxMdl.setTaxOnAmount(wbTaxDetails.getTaxOnAmount());
						wayBillTaxMdl.setTaxTxnTypeId(wbTaxDetails.getTaxTxnType());

						if(billColl != null && billColl.size() > 0 && billColl.get(wayBillTaxMdl.getWayBillId())!= null){
							wayBillTaxMdl.setBillBranchId(billColl.get(wayBillTaxMdl.getWayBillId()).getBillBranchId());
							wayBillTaxMdl.setBillNumber(billColl.get(wayBillTaxMdl.getWayBillId()).getBillNumber());
							final var	branch = cache.getGenericBranchDetailCache(request, wayBillTaxMdl.getBillBranchId());
							wayBillTaxMdl.setBillBranchName(branch.getName());
							wayBillTaxMdl.setBillBranchSuRegionName(cache.getGenericSubRegionById(request, branch.getSubRegionId()).getName());
							wayBillTaxMdl.setBillId(billColl.get(wayBillTaxMdl.getWayBillId()).getBillId());
						}

						wayBillTaxMdl.setEdit(wbSTCount != null && wbSTCount.size() > 0 && wbSTCount.get(wayBillTaxMdl.getWayBillId()) != null);

						if(cancelledWBDetl == null || cancelledWBDetl.get(wayBillTaxMdl.getWayBillId()) == null)
							wayBillTaxMdl.setBookingTaxAmount(wbTaxDetails.getAmount());
						else {
							wayBillTaxMdl.setBookingTaxAmount(wbTaxDetails.getAmount());
							wayBillTaxMdl.setWbCancelDateTime(cancelledWBDetl.get(wayBillTaxMdl.getWayBillId()).getCreationDateTimeStamp());
						}

						if(wayBillTaxMdl.getStatus()==WayBill.WAYBILL_STATUS_BOOKED)
							if(wayBillTaxMdl.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID
							|| wayBillTaxMdl.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY)
								bkdWbCol.put(wayBillTaxMdl.getWayBillId(), wayBillTaxMdl);
							else if(wayBillTaxMdl.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT) {
								if(custList != null & custList.get(wayBillTaxMdl.getWayBillId()) != null)
									wayBillTaxMdl.setCreditorName(custList.get(wayBillTaxMdl.getWayBillId()).getName());

								bkdCrdtWbCol.put(wayBillTaxMdl.getWayBillId(), wayBillTaxMdl);
							}
					}
				}

				final var condition1 = (executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_NEW_ERA_TRANPORTS || executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_NEW_ERA_TRANPORTS_CO) && destBranchIds != null && destBranchIds.size() > 0 && bkdWbCol != null && bkdWbCol.size() > 0;

				// Booking Details - SubRegion(WBDestination Branch)Wise Summary (Start) -- By Manoj Deriya
				if(condition1) {
					final var	bkgSubregionWiseSummary	= new HashMap<Long, WayBillTaxModel>();
					final var	bkdWbColClone			= new HashMap<Long, WayBillTaxModel>();
					destBranchIds 			= Utility.removeLongDuplicateElementsFromArrayList(destBranchIds);
					final var	branchSubRegionIdHM		= new HashMap<Long,Long>();
					final var	bkgDetailsTotalAmt		= new WayBillTaxModel();
					final var	bkgSubRegionWiseTotalAmtHM = new HashMap<Long, Double>();

					for (final Long destBranchId : destBranchIds) {
						final var	branch = cache.getBranchById(request, executive.getAccountGroupId(), destBranchId);
						branchSubRegionIdHM.put(branch.getBranchId(), branch.getSubRegionId());
					}

					for(final Long key : bkdWbCol.keySet()){
						final var	wbTaxMdl = (WayBillTaxModel)bkdWbCol.get(key).clone();
						wbTaxMdl.setSubRegionId(branchSubRegionIdHM.get(wbTaxMdl.getDestinationBranchId()));
						wbTaxMdl.setSubRegionName(cache.getSubRegionByIdAndGroupId(request, wbTaxMdl.getSubRegionId(), executive.getAccountGroupId()).getName());
						bkdWbColClone.put(key, wbTaxMdl);
					}

					bkdWbColClone.keySet().stream().map(bkdWbColClone::get).forEach((final var wbTaxMdlNew) -> {
						final var	wbTaxMdl = bkgSubregionWiseSummary.get(wbTaxMdlNew.getSubRegionId());

						if(wbTaxMdl == null) {
							bkgDetailsTotalAmt.setGrandTotal(bkgDetailsTotalAmt.getGrandTotal() + wbTaxMdlNew.getGrandTotal());
							bkgDetailsTotalAmt.setTaxOnAmount(bkgDetailsTotalAmt.getTaxOnAmount() + wbTaxMdlNew.getTaxOnAmount());
							bkgDetailsTotalAmt.setBookingTaxAmount(bkgDetailsTotalAmt.getBookingTaxAmount() + wbTaxMdlNew.getBookingTaxAmount());

							bkgSubregionWiseSummary.put(wbTaxMdlNew.getSubRegionId(), wbTaxMdlNew);
						} else {
							bkgDetailsTotalAmt.setGrandTotal(bkgDetailsTotalAmt.getGrandTotal() + wbTaxMdlNew.getGrandTotal());
							bkgDetailsTotalAmt.setTaxOnAmount(bkgDetailsTotalAmt.getTaxOnAmount() + wbTaxMdlNew.getTaxOnAmount());
							bkgDetailsTotalAmt.setBookingTaxAmount(bkgDetailsTotalAmt.getBookingTaxAmount() + wbTaxMdlNew.getBookingTaxAmount());

							wbTaxMdl.setGrandTotal(wbTaxMdl.getGrandTotal() + wbTaxMdlNew.getGrandTotal());
							wbTaxMdl.setTaxOnAmount(wbTaxMdl.getTaxOnAmount() + wbTaxMdlNew.getTaxOnAmount());
							wbTaxMdl.setBookingTaxAmount(wbTaxMdl.getBookingTaxAmount() + wbTaxMdlNew.getBookingTaxAmount());
						}

						if(bkgSubRegionWiseTotalAmtHM.get(wbTaxMdlNew.getSubRegionId()) != null)
							bkgSubRegionWiseTotalAmtHM.put(wbTaxMdlNew.getSubRegionId(), bkgSubRegionWiseTotalAmtHM.get(wbTaxMdlNew.getSubRegionId()) + wbTaxMdlNew.getGrandTotal() + wbTaxMdlNew.getTaxOnAmount() + wbTaxMdlNew.getBookingTaxAmount());
						else
							bkgSubRegionWiseTotalAmtHM.put(wbTaxMdlNew.getSubRegionId(), wbTaxMdlNew.getGrandTotal() + wbTaxMdlNew.getTaxOnAmount() + wbTaxMdlNew.getBookingTaxAmount());
					});

					request.setAttribute("bkgSubregionWiseSummary",bkgSubregionWiseSummary);
					request.setAttribute("bkgSubRegionWiseTotalAmtHM",bkgSubRegionWiseTotalAmtHM);
					request.setAttribute("bkgDetailsTotalAmt",bkgDetailsTotalAmt);
				}
			}

			if(objectOutDly != null){

				final SortedMap<Long, WayBillTaxModel>	bookedCrCol		= new TreeMap<>();
				final SortedMap<Long, WayBillTaxModel>	cancelCrCol		= new TreeMap<>();
				dlvrdWbCol 		= new TreeMap<>();
				final var	resultHMForDly	= (HashMap<Long,WayBillTaxDetails>)objectOutDly.get("resultHM");
				final var	wayBillIdArray	= (Long[])objectOutDly.get("wayBillIdArray");
				final var	bookedWayBillIdArray	= (Long[])objectOutDly.get("bookedWayBillIdArray");
				final var	cancelWayBillIdArray	= (Long[])objectOutDly.get("cancelWayBillIdArray");

				final var	wayBillIds		= Utility.GetLongArrayToString(wayBillIdArray);
				final var	custList 		= CustomerDetailsDao.getInstance().getConsignorDetailsByWayBillId(wayBillIds);
				final var	consignorColl 	= CustomerDetailsDao.getInstance().getConsignorDetailsByWayBillId(wayBillIds);
				final var	consigneeColl 	= CustomerDetailsDao.getInstance().getConsigneeDetailsByWayBillId(wayBillIds);
				final var	wbSTCount		= WayBillTaxDetailsDao.getInstance().getSTCountByWayBillIds(executive.getAccountGroupId(), wayBillIds, WayBillTaxTxn.WAYBILL_TAX_TXN_TYPE_DELIVERY);

				if(bookedWayBillIdArray != null && bookedWayBillIdArray.length > 0){
					final var	bookedCRIds = Utility.GetLongArrayToString(bookedWayBillIdArray);
					final var	bookedCRHM  = DeliveryContactDetailsDao.getInstance().getDeliveryContactDetailsInDateRange(bookedCRIds, fromDate, toDate,DeliveryStatusConstant.CR_STATUS_BOOKED+","+DeliveryStatusConstant.CR_STATUS_CANCELLED);
					final var	outValObj	= WayBillDao.getInstance().getLRDetailsForServieceTaxForDelivery(bookedCRIds,WayBill.WAYBILL_STATUS_BOOKED);

					if(outValObj != null){
						final var	lrCollDly 		= (HashMap<Long, WayBillTaxModel>)outValObj.get("lrCollDly");

						for (final Long key : resultHMForDly.keySet()) {
							final var	wbBookTaxMdl		= new WayBillTaxModel();
							final var	wbTaxDetails		= resultHMForDly.get(key);
							final var	wayBillTaxMdl		= lrCollDly.get(key);

							if(wbTaxDetails.getAmount() != 0 && wayBillTaxMdl != null){
								wbBookTaxMdl.setWayBillId(wbTaxDetails.getWayBillId());

								if(wbTaxDetails.getDestinationBranchId() > 0)
									wbBookTaxMdl.setDestinationBranch(cache.getBranchById(request, executive.getAccountGroupId() , wbTaxDetails.getDestinationBranchId()).getName());
								else
									wbBookTaxMdl.setDestinationBranch(wayBillTaxMdl.getDeliveryPlace()+" (DDDV)");

								if(wbTaxDetails.getSourceBranchId() > 0) {
									wayBillTaxMdl.setSourceBranchId(wbTaxDetails.getSourceBranchId());
									wbBookTaxMdl.setSourceBranchId(wayBillTaxMdl.getSourceBranchId());
									wbBookTaxMdl.setSourceBranch(cache.getBranchById(request, executive.getAccountGroupId() , wbTaxDetails.getSourceBranchId()).getName());
									wayBillTaxMdl.setSourceBranch(wbBookTaxMdl.getSourceBranch());
									srcBranchIds.add(wbTaxDetails.getSourceBranchId());
								} else
									wbBookTaxMdl.setSourceBranch("--");

								wbBookTaxMdl.setActualBookingDateTime(wayBillTaxMdl.getCreationDateTimeStamp());

								wbBookTaxMdl.setGrandTotal(wbTaxDetails.getGrandTotal());
								wbBookTaxMdl.setWayBillNumber(wayBillTaxMdl.getWayBillNumber());
								wbBookTaxMdl.setWayBillTypeId(wayBillTaxMdl.getWayBillTypeId());

								if(bookedCRHM != null && bookedCRHM.size() > 0) {
									final var	bookDelivery		= bookedCRHM.get(key);

									wbBookTaxMdl.setWayBillDeliveryNumber(bookDelivery.getWayBillDeliveryNumber());
									wbBookTaxMdl.setDeliveryDateTime(bookDelivery.getDeliveryDateTime());
								}

								wbBookTaxMdl.setDeliveryTaxAmount(wbTaxDetails.getAmount());
								wbBookTaxMdl.setWayBillType(WayBillTypeConstant.getWayBillTypeShortNameByWayBilTypeId(wayBillTaxMdl.getWayBillTypeId()));

								if(wbBookTaxMdl.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID) {
									final var	consignor = consignorColl.get(wbBookTaxMdl.getWayBillId());
									wbBookTaxMdl.setName(consignor.getName() + " (C/nor)");
								} else if(wbBookTaxMdl.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY) {
									final var	consignee = consigneeColl.get(wbBookTaxMdl.getWayBillId());
									wbBookTaxMdl.setName(consignee.getName() + " (C/nee)");
								} else if(custList != null & custList.get(wbBookTaxMdl.getWayBillId()) != null)
									wbBookTaxMdl.setName(custList.get(wbBookTaxMdl.getWayBillId()).getName());

								wbBookTaxMdl.setGrandTotal(wbTaxDetails.getGrandTotal());
								wbBookTaxMdl.setTaxOnAmount(wbTaxDetails.getTaxOnAmount());
								wbBookTaxMdl.setTaxTxnTypeId(wbTaxDetails.getTaxTxnType());
								wbBookTaxMdl.setEdit(wbSTCount != null && wbSTCount.size() > 0 && wbSTCount.get(wbBookTaxMdl.getWayBillId()) != null);

								if(wbBookTaxMdl.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID
										|| wbBookTaxMdl.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY
										|| wbBookTaxMdl.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT
										)
									bookedCrCol.put(wbBookTaxMdl.getWayBillId(), wbBookTaxMdl);
							}
						}
					}
				}

				if(cancelWayBillIdArray != null && cancelWayBillIdArray.length > 0){
					final var	cancelCRIds = Utility.GetLongArrayToString(cancelWayBillIdArray);
					final var	cancelCRHM  = DeliveryContactDetailsDao.getInstance().getDeliveryContactDetailsInCancelDateRange(wayBillIds, fromDate, toDate,""+DeliveryStatusConstant.CR_STATUS_CANCELLED);
					final var	outValObj	= WayBillDao.getInstance().getLRDetailsForServieceTaxForDelivery(cancelCRIds,WayBillStatusConstant.WAYBILL_STATUS_BOOKED);

					if(outValObj != null) {
						final var	lrCollDly 			= (HashMap<Long, WayBillTaxModel>)outValObj.get("lrCollDly");

						for (final Long key : resultHMForDly.keySet()) {
							final var	wbhCancelMdl		= new WayBillTaxModel();
							final var	wbTaxDetails		= resultHMForDly.get(key);
							final var	wayBillTaxMdlDly    = lrCollDly.get(key);

							if(wbTaxDetails.getAmount() != 0 && wayBillTaxMdlDly != null) {
								wbhCancelMdl.setWayBillId(wbTaxDetails.getWayBillId());

								if(wbTaxDetails.getDestinationBranchId() > 0)
									wbhCancelMdl.setDestinationBranch(cache.getBranchById(request, executive.getAccountGroupId() , wbTaxDetails.getDestinationBranchId()).getName());
								else
									wbhCancelMdl.setDestinationBranch(wayBillTaxMdlDly.getDeliveryPlace()+" (DDDV)");

								if(wbTaxDetails.getSourceBranchId() > 0) {
									wbhCancelMdl.setSourceBranch(cache.getBranchById(request, executive.getAccountGroupId() , wbTaxDetails.getSourceBranchId()).getName());
									wbhCancelMdl.setSourceBranchId(wbTaxDetails.getSourceBranchId());
									srcBranchIds.add(wbTaxDetails.getSourceBranchId());
								} else
									wbhCancelMdl.setSourceBranch("--");

								wbhCancelMdl.setActualBookingDateTime(wayBillTaxMdlDly.getCreationDateTimeStamp());
								wbhCancelMdl.setWayBillNumber(wayBillTaxMdlDly.getWayBillNumber());
								wbhCancelMdl.setWayBillTypeId(wayBillTaxMdlDly.getWayBillTypeId());

								if(cancelCRHM != null && cancelCRHM.size() > 0 && cancelCRHM.get(key) != null) {
									final var	cancelDelivery		= cancelCRHM.get(key);

									wbhCancelMdl.setCrCancelDateTime(cancelDelivery.getCancellationDate());
									wbhCancelMdl.setWayBillDeliveryNumber(cancelDelivery.getWayBillDeliveryNumber());
									wbhCancelMdl.setDeliveryDateTime(cancelDelivery.getDeliveryDateTime());
								}

								wbhCancelMdl.setDeliveryTaxAmount(wbTaxDetails.getAmount());
								wbhCancelMdl.setWayBillType(WayBillTypeConstant.getWayBillTypeShortNameByWayBilTypeId(wayBillTaxMdlDly.getWayBillTypeId()));
								wbhCancelMdl.setTaxTxnTypeId(wbTaxDetails.getTaxTxnType());

								if(wbhCancelMdl.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID){
									final var	consignor = consignorColl.get(wbhCancelMdl.getWayBillId());
									wbhCancelMdl.setName(consignor.getName()+" (C/nor)");
								} else if(wbhCancelMdl.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY){
									final var	consignee = consigneeColl.get(wbhCancelMdl.getWayBillId());
									wbhCancelMdl.setName(consignee.getName()+" (C/nee)");
								} else if(custList != null & custList.get(wbhCancelMdl.getWayBillId()) != null)
									wbhCancelMdl.setName(custList.get(wbhCancelMdl.getWayBillId()).getName());

								wbhCancelMdl.setEdit(wbSTCount != null && wbSTCount.size() > 0 && wbSTCount.get(wbhCancelMdl.getWayBillId()) != null);
								wbhCancelMdl.setGrandTotal(wbTaxDetails.getGrandTotal());
								wbhCancelMdl.setTaxOnAmount(wbTaxDetails.getTaxOnAmount());

								if(wbhCancelMdl.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID
										|| wbhCancelMdl.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY
										|| wbhCancelMdl.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT
										)
									cancelCrCol.put(wbhCancelMdl.getWayBillId(), wbhCancelMdl);
							}
						}
					}
				}

				if(bookedCrCol.size() > 0)
					for(final long key : bookedCrCol.keySet())
						dlvrdWbCol.put(key, bookedCrCol.get(key));

				if(cancelCrCol.size() > 0)
					for(final long key : cancelCrCol.keySet())
						dlvrdWbCol.put(key, cancelCrCol.get(key));

				final var condition = (executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_NEW_ERA_TRANPORTS || executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_NEW_ERA_TRANPORTS_CO) && srcBranchIds != null && srcBranchIds.size() > 0 && dlvrdWbCol != null && dlvrdWbCol.size() > 0;

				// Delivery Details - SubRegion(WBSource Branch)Wise Summary (Start) -- By Manoj Deriya
				if(condition) {
					final var	dlySubregionWiseSummary	= new HashMap<Long, WayBillTaxModel>();
					final var	dlvrdWbColClone			= new HashMap<Long, WayBillTaxModel>();
					srcBranchIds 			= Utility.removeLongDuplicateElementsFromArrayList(srcBranchIds);
					final var	branchSubRegionIdHM		= new HashMap<Long,Long>();
					final var	dlyDetailsTotalAmt		= new WayBillTaxModel();
					final var	dlySubRegionWiseTotalAmtHM = new HashMap<Long, Double>();

					for (final Long srcBranchId : srcBranchIds) {
						final var	branch = cache.getBranchById(request, executive.getAccountGroupId(), srcBranchId);
						branchSubRegionIdHM.put(branch.getBranchId(), branch.getSubRegionId());
					}

					for(final Long key : dlvrdWbCol.keySet()){
						final var	wbTaxMdl = (WayBillTaxModel)dlvrdWbCol.get(key).clone();
						wbTaxMdl.setSubRegionId(branchSubRegionIdHM.get(wbTaxMdl.getSourceBranchId()));
						wbTaxMdl.setSubRegionName(cache.getSubRegionByIdAndGroupId(request, wbTaxMdl.getSubRegionId(), executive.getAccountGroupId()).getName());
						dlvrdWbColClone.put(key, wbTaxMdl);
					}

					dlvrdWbColClone.keySet().stream().map(dlvrdWbColClone::get).forEach((final var wbTaxMdlNew) -> {
						final var	wbTaxMdl = dlySubregionWiseSummary.get(wbTaxMdlNew.getSubRegionId());

						if(wbTaxMdl == null) {
							dlyDetailsTotalAmt.setGrandTotal(dlyDetailsTotalAmt.getGrandTotal() + wbTaxMdlNew.getGrandTotal());
							dlyDetailsTotalAmt.setTaxOnAmount(dlyDetailsTotalAmt.getTaxOnAmount() + wbTaxMdlNew.getTaxOnAmount());
							dlyDetailsTotalAmt.setDeliveryTaxAmount(dlyDetailsTotalAmt.getDeliveryTaxAmount() + wbTaxMdlNew.getDeliveryTaxAmount());

							dlySubregionWiseSummary.put(wbTaxMdlNew.getSubRegionId(), wbTaxMdlNew);
						} else {
							dlyDetailsTotalAmt.setGrandTotal(dlyDetailsTotalAmt.getGrandTotal() + wbTaxMdlNew.getGrandTotal());
							dlyDetailsTotalAmt.setTaxOnAmount(dlyDetailsTotalAmt.getTaxOnAmount() + wbTaxMdlNew.getTaxOnAmount());
							dlyDetailsTotalAmt.setDeliveryTaxAmount(dlyDetailsTotalAmt.getDeliveryTaxAmount() + wbTaxMdlNew.getDeliveryTaxAmount());

							wbTaxMdl.setGrandTotal(wbTaxMdl.getGrandTotal() + wbTaxMdlNew.getGrandTotal());
							wbTaxMdl.setTaxOnAmount(wbTaxMdl.getTaxOnAmount() + wbTaxMdlNew.getTaxOnAmount());
							wbTaxMdl.setDeliveryTaxAmount(wbTaxMdl.getDeliveryTaxAmount() + wbTaxMdlNew.getDeliveryTaxAmount());
						}

						if(dlySubRegionWiseTotalAmtHM.get(wbTaxMdlNew.getSubRegionId()) != null)
							dlySubRegionWiseTotalAmtHM.put(wbTaxMdlNew.getSubRegionId(), dlySubRegionWiseTotalAmtHM.get(wbTaxMdlNew.getSubRegionId()) + wbTaxMdlNew.getGrandTotal() + wbTaxMdlNew.getTaxOnAmount() + wbTaxMdlNew.getDeliveryTaxAmount());
						else
							dlySubRegionWiseTotalAmtHM.put(wbTaxMdlNew.getSubRegionId(), wbTaxMdlNew.getGrandTotal() + wbTaxMdlNew.getTaxOnAmount() + wbTaxMdlNew.getDeliveryTaxAmount());
					});

					request.setAttribute("dlySubregionWiseSummary",dlySubregionWiseSummary);
					request.setAttribute("dlySubRegionWiseTotalAmtHM",dlySubRegionWiseTotalAmtHM);
					request.setAttribute("dlyDetailsTotalAmt",dlyDetailsTotalAmt);
				}
			}

			if (ObjectUtils.isNotEmpty(bkdWbCol) || ObjectUtils.isNotEmpty(dlvrdWbCol) || ObjectUtils.isNotEmpty(bkdCrdtWbCol)) {
				request.setAttribute("bookedWayBillCollection", bkdWbCol);
				request.setAttribute("bookedCreditorWayBillCollection", bkdCrdtWbCol);
				request.setAttribute("deliveredWayBillCollection", dlvrdWbCol);
				request.setAttribute("roundOffAmount", roundOffAmount);
			}else {
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}

			ActionStaticUtil.setReportViewModel(request);
			request.setAttribute("nextPageToken", "success");
		} catch (final Exception _e) {
			ActionStaticUtil.catchActionException(request, _e, error);
		}
	}
}
