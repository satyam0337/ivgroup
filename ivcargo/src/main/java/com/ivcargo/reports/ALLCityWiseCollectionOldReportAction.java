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
import com.iv.dto.constant.CargoAccountGroupConstant;
import com.iv.dto.constant.WayBillTypeConstant;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.WayBillDeliveryChargesDao;
import com.platform.dao.reports.CityWiseCollectionOldDAO;
import com.platform.dto.ChargeTypeMaster;
import com.platform.dto.Executive;
import com.platform.dto.TransportCommonMaster;
import com.platform.dto.WayBillCharges;
import com.platform.dto.constant.WayBillStatusConstant;
import com.platform.dto.model.ALLCityWiseCollectionModel;
import com.platform.dto.model.CityWiseCollectionReportModel;
import com.platform.dto.model.ReportViewModel;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

public class ALLCityWiseCollectionOldReportAction implements Action {

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	error 								= null;
		SimpleDateFormat	sdf										= null;
		Executive			executive								= null;
		ValueObject			objectIn								= null;
		ValueObject			objectOut								= null;
		Timestamp			fromDate								= null;
		Timestamp			toDate									= null;
		CacheManip			cache									= null;
		ReportViewModel		reportViewModel							= null;
		WayBillCharges[]	wayBillCharges							= null;
		Long[]				wayBillIdArray							= null;
		Long[]				wayBillIdsForGroupSharingChargesArr	 	= null;
		String				wayBillIdsForGroupSharingCharges	 	= null;
		HashMap<Long,Double>			groupSharingChargesMap	 	= null;
		CityWiseCollectionReportModel[]	reportModel					= null;
		HashMap<Long,WayBillCharges[]>	deliveryWBDetails			= null;
		HashMap<Long,WayBillCharges[]>	bookingWBDetails			= null;
		ALLCityWiseCollectionModel		allCityWiseCollectionModel	= null;
		SortedMap<String,ALLCityWiseCollectionModel> allCityWiseCollectionMap = null;

		try {

			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeALLCityWiseCollectionOldReportAction().execute(request, response);

			sdf         = new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			executive 	= (Executive) request.getSession().getAttribute("executive");
			objectIn 	= new ValueObject();
			objectOut 	= new ValueObject();
			fromDate    = new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00").getTime());
			toDate      = new Timestamp(sdf.parse(JSPUtility.GetString(request, "toDate") + " 23:59:59").getTime());
			cache		= new CacheManip(request);

			objectIn.put("fromDate", fromDate);
			objectIn.put("toDate", toDate);
			objectIn.put("accountGroupId", executive.getAccountGroupId());
			objectIn.put("branchesStr", cache.getSelfBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_GROUP, executive.getAccountGroupId()));

			objectOut = CityWiseCollectionOldDAO.getInstance().getALLCityWiseCollectionReport(objectIn);
			if(objectOut != null) {

				reportModel							= (CityWiseCollectionReportModel[])objectOut.get("CityWiseCollectionReportModel");
				wayBillIdArray						= (Long[])objectOut.get("WayBillIdArray");
				wayBillIdsForGroupSharingChargesArr = (Long[])objectOut.get("wayBillIdsForGroupSharingChargesArr");

				//Condition For Group Sharing Charges. SRS should Not see Receipt Charge Of Southern
				if(wayBillIdsForGroupSharingChargesArr != null){
					wayBillIdsForGroupSharingCharges 	= Utility.GetLongArrayToString(wayBillIdsForGroupSharingChargesArr);
					groupSharingChargesMap 				= WayBillDeliveryChargesDao.getInstance().getWayBillChargeMapByWayBillIdsAndChargeMasterId(wayBillIdsForGroupSharingCharges,ChargeTypeMaster.RECEIPT);
				}

				if(reportModel != null && reportModel.length > 0 && wayBillIdArray != null) {

					objectIn.put("wayBillIdStr", Utility.GetLongArrayToString(wayBillIdArray));
					if(executive.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNT_GORUP_ID_KALPANA_CARGO){
						objectIn.put("filter", (short)1);
						objectIn.put("chargeStr", ChargeTypeMaster.UNLOADING+","+ChargeTypeMaster.DAMERAGE);
						deliveryWBDetails = CityWiseCollectionOldDAO.getInstance().getChargesALLCityWiseCollectionReport(objectIn);
						objectIn.put("filter", (short)2);
						objectIn.put("chargeStr", ChargeTypeMaster.LOADING+","+ChargeTypeMaster.BUILTY_CHARGE);
						bookingWBDetails = CityWiseCollectionOldDAO.getInstance().getChargesALLCityWiseCollectionReport(objectIn);
					} else if(executive.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNT_GORUP_ID_SOUTHERN){
						objectIn.put("filter", (short)1);
						objectIn.put("chargeStr", ChargeTypeMaster.RECEIPT+"");
						deliveryWBDetails = CityWiseCollectionOldDAO.getInstance().getChargesALLCityWiseCollectionReport(objectIn);
					}

					allCityWiseCollectionMap = new TreeMap<>();

					for (var i = 0; i < reportModel.length; i++) {
						reportModel[i].setWayBillSourceSubRegion(cache.getGenericSubRegionById(request, reportModel[i].getWayBillSourceSubRegionId()).getName());

						//Condition For Group Sharing Charges. SRS should Not see Receipt Charge Of Southern
						if(groupSharingChargesMap != null && groupSharingChargesMap.get(reportModel[i].getWayBillId()) != null && reportModel[i].getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DELIVERED) {
							reportModel[i].setDeliveryAmount(reportModel[i].getDeliveryAmount() - groupSharingChargesMap.get(reportModel[i].getWayBillId()));
							reportModel[i].setGrandTotal(reportModel[i].getGrandTotal() - groupSharingChargesMap.get(reportModel[i].getWayBillId()));
						}

						allCityWiseCollectionModel = allCityWiseCollectionMap.get(reportModel[i].getWayBillSourceSubRegion()+":"+reportModel[i].getWayBillSourceSubRegionId());

						if(allCityWiseCollectionModel != null){
							if(reportModel[i].getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID) {
								if(reportModel[i].isManual()) {
									if(reportModel[i].getStatus() == WayBillStatusConstant.WAYBILL_STATUS_BOOKED)
										allCityWiseCollectionModel.setTotalBookingPaidManaulAmount(allCityWiseCollectionModel.getTotalBookingPaidManaulAmount() + reportModel[i].getGrandTotal());
									else if(reportModel[i].getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CANCELLED)
										allCityWiseCollectionModel.setTotalBookingPaidManaulAmount(allCityWiseCollectionModel.getTotalBookingPaidManaulAmount() - reportModel[i].getGrandTotal());
									else
										allCityWiseCollectionModel.setTotalDeliveryPaidManaulAmount(allCityWiseCollectionModel.getTotalDeliveryPaidManaulAmount() + (reportModel[i].getDeliveryAmount() - reportModel[i].getDeliveryDiscount()));
								} else if(reportModel[i].getStatus() == WayBillStatusConstant.WAYBILL_STATUS_BOOKED)
									allCityWiseCollectionModel.setTotalBookingPaidAmount(allCityWiseCollectionModel.getTotalBookingPaidAmount() + reportModel[i].getGrandTotal());
								else if(reportModel[i].getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CANCELLED)
									allCityWiseCollectionModel.setTotalBookingPaidAmount(allCityWiseCollectionModel.getTotalBookingPaidAmount() - reportModel[i].getGrandTotal());
								else
									allCityWiseCollectionModel.setTotalDeliveryPaidAmount(allCityWiseCollectionModel.getTotalDeliveryPaidAmount() + (reportModel[i].getDeliveryAmount() - reportModel[i].getDeliveryDiscount()));
							} else if(reportModel[i].getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY) {
								if(reportModel[i].isManual()) {
									if(reportModel[i].getStatus() == WayBillStatusConstant.WAYBILL_STATUS_BOOKED)
										allCityWiseCollectionModel.setTotalBookingToPayManaulAmount(allCityWiseCollectionModel.getTotalBookingToPayManaulAmount() + reportModel[i].getGrandTotal());
									else if(reportModel[i].getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CANCELLED)
										allCityWiseCollectionModel.setTotalBookingToPayManaulAmount(allCityWiseCollectionModel.getTotalBookingToPayManaulAmount() - reportModel[i].getGrandTotal());
									else
										allCityWiseCollectionModel.setTotalDeliveryToPayManaulAmount(allCityWiseCollectionModel.getTotalDeliveryToPayManaulAmount() + reportModel[i].getGrandTotal());
								} else if(reportModel[i].getStatus() == WayBillStatusConstant.WAYBILL_STATUS_BOOKED)
									allCityWiseCollectionModel.setTotalBookingToPayAmount(allCityWiseCollectionModel.getTotalBookingToPayAmount() + reportModel[i].getGrandTotal());
								else if(reportModel[i].getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CANCELLED)
									allCityWiseCollectionModel.setTotalBookingToPayAmount(allCityWiseCollectionModel.getTotalBookingToPayAmount() - reportModel[i].getGrandTotal());
								else
									allCityWiseCollectionModel.setTotalDeliveryToPayAmount(allCityWiseCollectionModel.getTotalDeliveryToPayAmount() + reportModel[i].getGrandTotal());
							} else if(reportModel[i].isManual()) {
								if(reportModel[i].getStatus() == WayBillStatusConstant.WAYBILL_STATUS_BOOKED)
									allCityWiseCollectionModel.setTotalBookingCreditorManaulAmount(allCityWiseCollectionModel.getTotalBookingCreditorManaulAmount() + reportModel[i].getGrandTotal());
								else if(reportModel[i].getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CANCELLED)
									allCityWiseCollectionModel.setTotalBookingCreditorManaulAmount(allCityWiseCollectionModel.getTotalBookingCreditorManaulAmount() - reportModel[i].getGrandTotal());
								else
									allCityWiseCollectionModel.setTotalDeliveryCreditorManaulAmount(allCityWiseCollectionModel.getTotalDeliveryCreditorManaulAmount() + (reportModel[i].getDeliveryAmount() - reportModel[i].getDeliveryDiscount()));
							} else if(reportModel[i].getStatus() == WayBillStatusConstant.WAYBILL_STATUS_BOOKED)
								allCityWiseCollectionModel.setTotalBookingCreditorAmount(allCityWiseCollectionModel.getTotalBookingCreditorAmount() + reportModel[i].getGrandTotal());
							else if(reportModel[i].getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CANCELLED)
								allCityWiseCollectionModel.setTotalBookingCreditorAmount(allCityWiseCollectionModel.getTotalBookingCreditorAmount() - reportModel[i].getGrandTotal());
							else
								allCityWiseCollectionModel.setTotalDeliveryCreditorAmount(allCityWiseCollectionModel.getTotalDeliveryCreditorAmount() + (reportModel[i].getDeliveryAmount() - reportModel[i].getDeliveryDiscount()));

							if(executive.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNT_GORUP_ID_KALPANA_CARGO){
								if(reportModel[i].getStatus() == WayBillStatusConstant.WAYBILL_STATUS_BOOKED){
									wayBillCharges = bookingWBDetails.get(reportModel[i].getWayBillId());

									if(wayBillCharges != null)
										for (final WayBillCharges wayBillCharge : wayBillCharges) {
											if(wayBillCharge.getWayBillChargeMasterId() == ChargeTypeMaster.LOADING)
												allCityWiseCollectionModel.setTotalLoadingAmount(allCityWiseCollectionModel.getTotalLoadingAmount() + wayBillCharge.getChargeAmount());
											if(wayBillCharge.getWayBillChargeMasterId() == ChargeTypeMaster.BUILTY_CHARGE)
												allCityWiseCollectionModel.setTotalBuiltyChargeAmount(allCityWiseCollectionModel.getTotalBuiltyChargeAmount() + wayBillCharge.getChargeAmount());
										}
								} else if(reportModel[i].getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CANCELLED){
									wayBillCharges = bookingWBDetails.get(reportModel[i].getWayBillId());

									if(wayBillCharges != null)
										for (final WayBillCharges wayBillCharge : wayBillCharges) {
											if(wayBillCharge.getWayBillChargeMasterId() == ChargeTypeMaster.LOADING)
												allCityWiseCollectionModel.setTotalLoadingAmount(allCityWiseCollectionModel.getTotalLoadingAmount() - wayBillCharge.getChargeAmount());
											if(wayBillCharge.getWayBillChargeMasterId() == ChargeTypeMaster.BUILTY_CHARGE)
												allCityWiseCollectionModel.setTotalBuiltyChargeAmount(allCityWiseCollectionModel.getTotalBuiltyChargeAmount() - wayBillCharge.getChargeAmount());
										}
								} else if(reportModel[i].getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DELIVERED){
									wayBillCharges = deliveryWBDetails.get(reportModel[i].getWayBillId());

									if(wayBillCharges != null)
										for (final WayBillCharges wayBillCharge : wayBillCharges)
											if(wayBillCharge.getWayBillChargeMasterId() == ChargeTypeMaster.UNLOADING)
												allCityWiseCollectionModel.setTotalUnLoadingAmount(allCityWiseCollectionModel.getTotalUnLoadingAmount() + wayBillCharge.getChargeAmount());
											else if(wayBillCharge.getWayBillChargeMasterId() == ChargeTypeMaster.DAMERAGE)
												allCityWiseCollectionModel.setTotalDamerageAmount(allCityWiseCollectionModel.getTotalDamerageAmount() + wayBillCharge.getChargeAmount());
								}
							} else if(executive.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNT_GORUP_ID_SOUTHERN && reportModel[i].getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DELIVERED){
								wayBillCharges = deliveryWBDetails.get(reportModel[i].getWayBillId());

								if(wayBillCharges != null)
									for (final WayBillCharges wayBillCharge : wayBillCharges)
										if(wayBillCharge.getWayBillChargeMasterId() == ChargeTypeMaster.RECEIPT)
											allCityWiseCollectionModel.setTotalReceiptAmount(allCityWiseCollectionModel.getTotalReceiptAmount() + wayBillCharge.getChargeAmount());
							}

						} else if(reportModel[i].getWayBillSourceSubRegionId() != 0 || reportModel[i].getWayBillSourceBranchId() != 0) {

							allCityWiseCollectionModel = new ALLCityWiseCollectionModel();
							allCityWiseCollectionModel.setSubRegionName(reportModel[i].getWayBillSourceSubRegion());

							if(reportModel[i].getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID) {
								if(reportModel[i].isManual()) {
									if(reportModel[i].getStatus() == WayBillStatusConstant.WAYBILL_STATUS_BOOKED)
										allCityWiseCollectionModel.setTotalBookingPaidManaulAmount(reportModel[i].getGrandTotal());
									else if(reportModel[i].getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CANCELLED)
										allCityWiseCollectionModel.setTotalBookingPaidManaulAmount(- reportModel[i].getGrandTotal());
									else
										allCityWiseCollectionModel.setTotalDeliveryPaidManaulAmount(reportModel[i].getDeliveryAmount() - reportModel[i].getDeliveryDiscount());
								} else if(reportModel[i].getStatus() == WayBillStatusConstant.WAYBILL_STATUS_BOOKED)
									allCityWiseCollectionModel.setTotalBookingPaidAmount(reportModel[i].getGrandTotal());
								else if(reportModel[i].getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CANCELLED)
									allCityWiseCollectionModel.setTotalBookingPaidAmount(- reportModel[i].getGrandTotal());
								else
									allCityWiseCollectionModel.setTotalDeliveryPaidAmount(reportModel[i].getDeliveryAmount() - reportModel[i].getDeliveryDiscount());
							} else if(reportModel[i].getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY) {
								if(reportModel[i].isManual()) {
									if(reportModel[i].getStatus() == WayBillStatusConstant.WAYBILL_STATUS_BOOKED)
										allCityWiseCollectionModel.setTotalBookingToPayManaulAmount(reportModel[i].getGrandTotal());
									else if(reportModel[i].getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CANCELLED)
										allCityWiseCollectionModel.setTotalBookingToPayManaulAmount(- reportModel[i].getGrandTotal());
									else
										allCityWiseCollectionModel.setTotalDeliveryToPayManaulAmount(reportModel[i].getGrandTotal());
								} else if(reportModel[i].getStatus() == WayBillStatusConstant.WAYBILL_STATUS_BOOKED)
									allCityWiseCollectionModel.setTotalBookingToPayAmount(reportModel[i].getGrandTotal());
								else if(reportModel[i].getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CANCELLED)
									allCityWiseCollectionModel.setTotalBookingToPayAmount(- reportModel[i].getGrandTotal());
								else
									allCityWiseCollectionModel.setTotalDeliveryToPayAmount(reportModel[i].getGrandTotal());
							} else if(reportModel[i].isManual()) {
								if(reportModel[i].getStatus() == WayBillStatusConstant.WAYBILL_STATUS_BOOKED)
									allCityWiseCollectionModel.setTotalBookingCreditorManaulAmount(reportModel[i].getGrandTotal());
								else if(reportModel[i].getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CANCELLED)
									allCityWiseCollectionModel.setTotalBookingCreditorManaulAmount(- reportModel[i].getGrandTotal());
								else
									allCityWiseCollectionModel.setTotalDeliveryCreditorManaulAmount(reportModel[i].getDeliveryAmount() - reportModel[i].getDeliveryDiscount());
							} else if(reportModel[i].getStatus() == WayBillStatusConstant.WAYBILL_STATUS_BOOKED)
								allCityWiseCollectionModel.setTotalBookingCreditorAmount(reportModel[i].getGrandTotal());
							else if(reportModel[i].getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CANCELLED)
								allCityWiseCollectionModel.setTotalBookingCreditorAmount(- reportModel[i].getGrandTotal());
							else
								allCityWiseCollectionModel.setTotalDeliveryCreditorAmount(reportModel[i].getDeliveryAmount() - reportModel[i].getDeliveryDiscount());

							if(executive.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNT_GORUP_ID_KALPANA_CARGO){
								if(reportModel[i].getStatus() == WayBillStatusConstant.WAYBILL_STATUS_BOOKED){
									wayBillCharges = bookingWBDetails.get(reportModel[i].getWayBillId());
									if(wayBillCharges != null)
										for (final WayBillCharges wayBillCharge : wayBillCharges) {
											if(wayBillCharge.getWayBillChargeMasterId() == ChargeTypeMaster.LOADING)
												allCityWiseCollectionModel.setTotalLoadingAmount(allCityWiseCollectionModel.getTotalLoadingAmount() + wayBillCharge.getChargeAmount());
											if(wayBillCharge.getWayBillChargeMasterId() == ChargeTypeMaster.BUILTY_CHARGE)
												allCityWiseCollectionModel.setTotalBuiltyChargeAmount(allCityWiseCollectionModel.getTotalBuiltyChargeAmount() + wayBillCharge.getChargeAmount());
										}
								} else if(reportModel[i].getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CANCELLED){
									wayBillCharges = bookingWBDetails.get(reportModel[i].getWayBillId());

									if(wayBillCharges != null)
										for (final WayBillCharges wayBillCharge : wayBillCharges) {
											if(wayBillCharge.getWayBillChargeMasterId() == ChargeTypeMaster.LOADING)
												allCityWiseCollectionModel.setTotalLoadingAmount(allCityWiseCollectionModel.getTotalLoadingAmount() - wayBillCharge.getChargeAmount());
											if(wayBillCharge.getWayBillChargeMasterId() == ChargeTypeMaster.BUILTY_CHARGE)
												allCityWiseCollectionModel.setTotalBuiltyChargeAmount(allCityWiseCollectionModel.getTotalBuiltyChargeAmount() - wayBillCharge.getChargeAmount());
										}
								} else if(reportModel[i].getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DELIVERED){
									wayBillCharges = deliveryWBDetails.get(reportModel[i].getWayBillId());

									if(wayBillCharges != null)
										for (final WayBillCharges wayBillCharge : wayBillCharges)
											if(wayBillCharge.getWayBillChargeMasterId() == ChargeTypeMaster.UNLOADING)
												allCityWiseCollectionModel.setTotalUnLoadingAmount(allCityWiseCollectionModel.getTotalUnLoadingAmount() + wayBillCharge.getChargeAmount());
											else if(wayBillCharge.getWayBillChargeMasterId() == ChargeTypeMaster.DAMERAGE)
												allCityWiseCollectionModel.setTotalDamerageAmount(allCityWiseCollectionModel.getTotalDamerageAmount() + wayBillCharge.getChargeAmount());
								}
								//Charges according to WayBill (End)
							} else if(executive.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNT_GORUP_ID_SOUTHERN && reportModel[i].getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DELIVERED){
								wayBillCharges = deliveryWBDetails.get(reportModel[i].getWayBillId());

								if(wayBillCharges != null)
									for (final WayBillCharges wayBillCharge : wayBillCharges)
										if(wayBillCharge.getWayBillChargeMasterId() == ChargeTypeMaster.RECEIPT)
											allCityWiseCollectionModel.setTotalReceiptAmount(allCityWiseCollectionModel.getTotalReceiptAmount() + wayBillCharge.getChargeAmount());
							}

							allCityWiseCollectionMap.put(allCityWiseCollectionModel.getSubRegionName()+":"+reportModel[i].getWayBillSourceSubRegionId(), allCityWiseCollectionModel);

						}
					}
					request.setAttribute("allCityWiseCollectionMap", allCityWiseCollectionMap);

					reportViewModel = new ReportViewModel();
					reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);

					request.setAttribute("ReportViewModel",reportViewModel);
					request.setAttribute("nextPageToken", "success");
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
			sdf										= null;
			executive								= null;
			objectIn								= null;
			objectOut								= null;
			fromDate								= null;
			toDate									= null;
			cache									= null;
			reportViewModel							= null;
			wayBillCharges							= null;
			wayBillIdArray							= null;
			reportModel								= null;
			deliveryWBDetails						= null;
			allCityWiseCollectionMap				= null;
			allCityWiseCollectionModel				= null;
			groupSharingChargesMap					= null;
			wayBillIdsForGroupSharingCharges	 	= null;
			wayBillIdsForGroupSharingChargesArr	 	= null;
		}

	}
}