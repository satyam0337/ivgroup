package com.ivcargo.reports;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.Arrays;
import java.util.HashMap;
import java.util.LinkedHashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.ObjectUtils;

import com.businesslogic.displaydata.DisplayDataConfigurationBll;
import com.businesslogic.properties.impl.PropertyConfigValueBLLImpl;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.dto.constant.FeildPermissionsConstant;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.dto.constant.WayBillTypeConstant;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.ConsignmentSummaryDao;
import com.platform.dao.WayBillBookingChargesDao;
import com.platform.dao.reports.BookingBranchSummaryDAO;
import com.platform.dto.Branch;
import com.platform.dto.ConsignmentSummary;
import com.platform.dto.ExecutiveFeildPermissionDTO;
import com.platform.dto.LocationsMapping;
import com.platform.dto.PropertiesFileConstants;
import com.platform.dto.WayBillBookingCharges;
import com.platform.dto.configuration.report.collection.BookingBranchSummaryReportConfigurationDTO;
import com.platform.dto.constant.BookingChargeConstant;
import com.platform.dto.constant.ReportWiseDisplayZeroAmountConstant;
import com.platform.dto.model.BookingBranchSummaryReport;
import com.platform.dto.model.BookingBranchSummaryReportModel;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

public class BookingBranchSummaryReportAction implements Action {

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	 						error 				= null;
//		Executive        								executive         	= null;
		SimpleDateFormat 								sdf               	= null;
		Timestamp        								fromDate          	= null;
		Timestamp        								toDate            	= null;
		ValueObject 									objectIn 			= null;
		ValueObject 									objectOut 			= null;
		CacheManip										cManip				= null;
		BookingBranchSummaryReport[] 					reportModel 		= null;
		HashMap<String,BookingBranchSummaryReportModel> dataColl			= null;
		BookingBranchSummaryReportModel 				model				= null;
		Long[]      	 								lrIdArr				= null;
		String      		 							strLrIds			= null;
		HashMap<Long, ConsignmentSummary> 				consignmentSummaryHM= null;
		Branch											branch				= null;
		LocationsMapping								locationsMapping	= null;
		String 											branchIds			= null;
		long 		destBranchId				= 0;
		ValueObject						configuration 								= null;
		boolean							isAmountZeroForBookingBranchSummaryReport	= false;
		ValueObject						displayDataConfig							= null;
		ValueObject						valueObjectIn								= null;
		boolean							isShowAmountZero							= false;
		HashMap<Long, ExecutiveFeildPermissionDTO>		execFldPermissionsHM		= null;
		HashMap<Long,HashMap<Long,WayBillBookingCharges>>	wayBillIdWiseBookingchargesHM 	= null;
		HashMap<Long,WayBillBookingCharges>					bookingChargeHM		    = null;	

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeBookingBranchSummaryReportAction().execute(request, response);

			sdf			= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			fromDate	= new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00").getTime());
			toDate		= new Timestamp(sdf.parse(JSPUtility.GetString(request, "toDate") + " 23:59:59").getTime());
			objectIn	= new ValueObject();
			objectOut	= new ValueObject();
			cManip 		= new CacheManip(request);
			
			final var executive		= cManip.getExecutive(request);
			execFldPermissionsHM 	= cManip.getExecutiveFieldPermission(request);
			
			configuration								= PropertyConfigValueBLLImpl.getInstance().getConfiguration(executive, PropertiesFileConstants.REPORT_WISE_DISPLAY_ZERO_AMOUNT_CONSTANT);
			isAmountZeroForBookingBranchSummaryReport	= configuration.getBoolean(ReportWiseDisplayZeroAmountConstant.BOOKING_BRANCH_SUMMARY_REPORT, false);
			displayDataConfig							= cManip.getDisplayDataConfiguration(request, executive.getAccountGroupId());
			valueObjectIn								= new ValueObject();

			final var groupConfiguration				= ReadAllConfigurationsBllImpl.getInstance().getOldReportConfigurationData(ReportIdentifierConstant.BOOKING_BRANCH_SUMMARY, executive.getAccountGroupId());
			final var customErrorOnOtherBranchDetailSearch	= groupConfiguration.getBoolean(BookingBranchSummaryReportConfigurationDTO.CUSTOM_ERROR_ON_OTHER_BRANCH_DETAIL_SEARCH, false);
			final var allowReportDataSearchForOwnBranchOnly	= groupConfiguration.getBoolean(BookingBranchSummaryReportConfigurationDTO.IS_SEARCH_DATA_FOR_OWN_BRANCH_ONLY, false);
			final var isAllowToSearchAllBranchReportData	= execFldPermissionsHM != null && execFldPermissionsHM.containsKey(FeildPermissionsConstant.ALLOW_TO_SEARCH_ALL_BRANCH_REPORT_DATA);
			final var deliveryLocationList					= cManip.getAssignedLocationsIdListByLocationIdId(request, executive.getBranchId(), executive.getAccountGroupId());
			final var	valObjSelection 					= ActionStaticUtil.reportSelection(request, executive);
			final long	branchId 							= (Long)valObjSelection.get("branchId");
			
			ActionStaticUtil.executiveTypeWiseBranches(request, cManip, executive);

			branchIds	= ActionStaticUtil.getBranchIdsWithAssignedLocation(request, cManip, executive);

			objectIn.put("fromDate", fromDate);
			objectIn.put("toDate", toDate);
			objectIn.put("branchId", branchIds);
			objectIn.put("accountGroupId", executive.getAccountGroupId());

			objectOut = BookingBranchSummaryDAO.getInstance().getBookingBranchSummary(objectIn);

			valueObjectIn.put("executive", executive);
			valueObjectIn.put("execFldPermissionsHM", execFldPermissionsHM);

			if(objectOut != null) {

				reportModel 		= (BookingBranchSummaryReport[])objectOut.get("BookingBranchSummaryReport");
				lrIdArr				= (Long[])objectOut.get("lrIdArray");

				if(allowReportDataSearchForOwnBranchOnly && !isAllowToSearchAllBranchReportData){
					reportModel = Arrays.stream(reportModel).filter(report -> executive.getBranchId() == report.getSourceBranchId()
									|| executive.getBranchId() == report.getDestinationBranchId()
									|| (deliveryLocationList != null && (deliveryLocationList.contains(report.getSourceBranchId())
									|| deliveryLocationList.contains(report.getDestinationBranchId())))).toArray(BookingBranchSummaryReport[]::new);
				}

				if(!ObjectUtils.isEmpty(reportModel)){

					dataColl	= new LinkedHashMap<String,BookingBranchSummaryReportModel>();
					cManip		= new CacheManip(request);

					if(lrIdArr.length > 0){
						strLrIds = Utility.GetLongArrayToString(lrIdArr);
						consignmentSummaryHM  = ConsignmentSummaryDao.getInstance().getConsignmentSummaryWeightsByWayBillIds(strLrIds) ;
						wayBillIdWiseBookingchargesHM = WayBillBookingChargesDao.getInstance().getWayBillIdWiseChargesMap(strLrIds);  
					}

					for (final BookingBranchSummaryReport element : reportModel) {
						branch = cManip.getGenericBranchDetailCache(request, element.getDestinationBranchId());

						if(branch != null && branch.getTypeOfLocation() == Branch.TYPE_OF_LOCATION_OPERATIONAL_PLACE) {
							locationsMapping = cManip.getLocationMapping(request, executive.getAccountGroupId(), branch.getBranchId());

							if(locationsMapping != null)
								destBranchId = locationsMapping.getLocationId();
							else
								destBranchId = element.getDestinationBranchId();
						} else
							destBranchId = element.getDestinationBranchId();

						if(isAmountZeroForBookingBranchSummaryReport){
							valueObjectIn.put("wayBillTypeId", element.getWayBillTypeId());

							isShowAmountZero = DisplayDataConfigurationBll.isAllowToDisplayZeroAmount(displayDataConfig, valueObjectIn);
						}

						if(isShowAmountZero)
							element.setGrandTotal(0);

						model = dataColl.get(""+destBranchId);

						if(model == null) {
							model = new BookingBranchSummaryReportModel();
							model.setDestinationBranchName(cManip.getGenericBranchDetailCache(request, destBranchId).getName());
							model.setTotalNoOfLRs(model.getTotalNoOfLRs() + 1);

							if( !consignmentSummaryHM.isEmpty() && consignmentSummaryHM.get(element.getWayBillId()) != null) {
								model.setTotalActualWeight(consignmentSummaryHM.get(element.getWayBillId()).getActualWeight());
								model.setTotalNoOfArticle(consignmentSummaryHM.get(element.getWayBillId()).getQuantity());
							}

							if(element.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID)
								model.setTotalPaidAmount(element.getGrandTotal());
							else if(element.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY)
								model.setTotalToPayAmount(element.getGrandTotal());
							else if(element.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT)
								model.setTotalCreditAmount(element.getGrandTotal());
							
							if(wayBillIdWiseBookingchargesHM != null && wayBillIdWiseBookingchargesHM.size() > 0){
								bookingChargeHM = wayBillIdWiseBookingchargesHM.get(element.getWayBillId());
							}
							
							if(bookingChargeHM != null && bookingChargeHM.get((long) BookingChargeConstant.HAMALI) != null) {
								model.setHamaliCharge(bookingChargeHM.get((long) BookingChargeConstant.HAMALI).getChargeAmount());
							}
							
							if(bookingChargeHM != null && bookingChargeHM.get((long) BookingChargeConstant.DOOR_DELIVERY_BOOKING) != null) {
								model.setDoorDelivery(bookingChargeHM.get((long) BookingChargeConstant.DOOR_DELIVERY_BOOKING).getChargeAmount());
							}

							dataColl.put(""+destBranchId ,model);

						} else {
							model.setTotalNoOfLRs(model.getTotalNoOfLRs() + 1);

							if( !consignmentSummaryHM.isEmpty() && consignmentSummaryHM.get(element.getWayBillId()) != null) {
								model.setTotalActualWeight(model.getTotalActualWeight() + consignmentSummaryHM.get(element.getWayBillId()).getActualWeight());
								model.setTotalNoOfArticle(model.getTotalNoOfArticle() +	consignmentSummaryHM.get(element.getWayBillId()).getQuantity());
							}

							if(element.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID)
								model.setTotalPaidAmount(model.getTotalPaidAmount() + element.getGrandTotal());
							else if(element.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY)
								model.setTotalToPayAmount(model.getTotalToPayAmount() + element.getGrandTotal());
							else if(element.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT)
								model.setTotalCreditAmount(model.getTotalCreditAmount() + element.getGrandTotal());
							
							if(wayBillIdWiseBookingchargesHM != null && wayBillIdWiseBookingchargesHM.size() > 0){
								bookingChargeHM = wayBillIdWiseBookingchargesHM.get(element.getWayBillId());
							}
							
							if(bookingChargeHM != null && bookingChargeHM.get((long) BookingChargeConstant.HAMALI) != null) {
								model.setHamaliCharge(model.getHamaliCharge() + bookingChargeHM.get((long) BookingChargeConstant.HAMALI).getChargeAmount());
							}
							
							if(bookingChargeHM != null && bookingChargeHM.get((long) BookingChargeConstant.DOOR_DELIVERY_BOOKING) != null) {
								model.setDoorDelivery(model.getDoorDelivery() + bookingChargeHM.get((long) BookingChargeConstant.DOOR_DELIVERY_BOOKING).getChargeAmount());
							}
						}
					}
					request.setAttribute("sourceCityWiseData",dataColl);

				}else if(customErrorOnOtherBranchDetailSearch){
					error.put("errorCode", CargoErrorList.OTHER_BRANCH_REPORT_DATA_SEARCH_ERROR);
					if(branchId > 0)
						error.put("errorDescription", "Kindly Contact Source Branch For Report");
					else
						error.put("errorDescription", "Kindly Contact Respective Branches For Report");

					request.setAttribute("cargoError", error);
				}else {
					error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
					error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
					request.setAttribute("cargoError", error);
				}
			} else {
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}

			ActionStaticUtil.setReportViewModel(request);
			request.setAttribute("nextPageToken", "success");
		} catch (final Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		} finally {
			error 				= null;
//			executive         	= null;
			sdf               	= null;
			fromDate          	= null;
			toDate            	= null;
			objectIn 			= null;
			objectOut 			= null;
			cManip				= null;
			reportModel 		= null;
			dataColl			= null;
			model				= null;
			lrIdArr				= null;
			strLrIds			= null;
			consignmentSummaryHM= null;
			branch				= null;
			locationsMapping	= null;
			branchIds			= null;
		}
	}
}