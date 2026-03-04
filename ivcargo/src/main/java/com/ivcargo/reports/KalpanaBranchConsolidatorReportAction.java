package com.ivcargo.reports;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.HashMap;
import java.util.Iterator;
import java.util.SortedMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.dto.constant.ExecutiveTypeConstant;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.CustomerDetailsDao;
import com.platform.dao.reports.KalpanaBranchConsolidatorDAO;
import com.platform.dto.Branch;
import com.platform.dto.CustomerDetails;
import com.platform.dto.Executive;
import com.platform.dto.model.ChargeTypeModel;
import com.platform.dto.model.CityWiseCollectionModel;
import com.platform.dto.model.KalpanaBranchConsolidatorReportModel;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

public class KalpanaBranchConsolidatorReportAction implements Action{

	@Override
	@SuppressWarnings("unchecked")
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	error 						= null;
		Executive        		executive					= null;
		SimpleDateFormat 		sdf							= null;
		Timestamp        		fromDate					= null;
		Timestamp        		toDate						= null;
		Branch[]    			branches  					= null;
		ValueObject 			objectIn 					= null;
		ValueObject 			objectOut 					= null;
		HashMap<Long,Object> 	storeCityWiseToPayeeDetails =  null;
		HashMap<Long, Object> 	cityWiseToPayeeDetails 		= null;
		CustomerDetails	  		consignor					= null;
		CustomerDetails	   		consignee					= null;
		CityWiseCollectionModel cityWiseCollectionModel 	= null;
		SortedMap<String , KalpanaBranchConsolidatorReportModel> cancellationHM 		  = null;
		SortedMap<String , KalpanaBranchConsolidatorReportModel> creditorBooking 	  	  = null;
		SortedMap<String , KalpanaBranchConsolidatorReportModel> creditorBookingManual	  = null;
		KalpanaBranchConsolidatorReportModel 	rptModel		= null;
		HashMap<Long, CustomerDetails>			consignorColl	= null;
		HashMap<Long, CustomerDetails>			consigneeColl	= null;
		String  wayBillIds		= null;
		Long[]	wayBillIdArr	= null;
		Iterator<Long> itr1	 			= null;
		Iterator<Long> iterator1 		= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeKalpanaBranchConsolidatorReportAction().execute(request, response);

			sdf             = new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			fromDate        = new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00").getTime());
			toDate          = new Timestamp(sdf.parse(JSPUtility.GetString(request, "toDate") + " 23:59:59").getTime());
			objectIn 		= new ValueObject();
			objectOut 		= new ValueObject();
			long 	selectedCity    = 0;
			long   	branchId 		= 0;
			long 	key 			= 0;
			// Get the Selected  Combo values
			if (request.getParameter("subRegion")!=null)
				selectedCity  =  Long.parseLong(JSPUtility.GetString(request, "subRegion")) ;

			final CacheManip cacheManip = new CacheManip(request);
			executive       = cacheManip.getExecutive(request);

			//Get all Branches
			branches = cacheManip.getBranchesArrayBySubRegionId(request, executive.getAccountGroupId(), selectedCity);
			request.setAttribute("branches", branches);

			if(executive.getExecutiveType()==ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN)
				branchId = Long.parseLong(request.getParameter("branch"));
			else if(executive.getExecutiveType()==ExecutiveTypeConstant.EXECUTIVE_TYPE_BRANCHADMIN || executive.getExecutiveType()==ExecutiveTypeConstant.EXECUTIVE_TYPE_EXECUTIVE || executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_LIMITED)
				branchId = executive.getBranchId();

			objectIn.put("fromDate", fromDate);
			objectIn.put("toDate", toDate);
			objectIn.put("branchId", branchId);
			objectIn.put("executive", executive);

			objectOut= KalpanaBranchConsolidatorDAO.getInstance().getReportForBranch(objectIn);

			if(objectOut != null){
				final KalpanaBranchConsolidatorReportModel[] reportModel = (KalpanaBranchConsolidatorReportModel[])objectOut.get("KalpanaBranchConsolidatorReportModel");

				if(reportModel != null && objectOut != null) {

					request.setAttribute("KalpanaBranchConsolidatorReportModel", reportModel);
					request.setAttribute("Collection", objectOut.get("Collection"));
					request.setAttribute("branchConsolidatorToPayeeDatails", objectOut.get("branchConsolidatorToPayeeDatails"));
					request.setAttribute("branchConsolidatorCreditDatails", objectOut.get("branchConsolidatorCreditDatails"));
					request.setAttribute("branchConsolidatorToPayeeManualDatails", objectOut.get("branchConsolidatorToPayeeManualDatails"));
					request.setAttribute("branchConsolidatorCreditManualDatails", objectOut.get("branchConsolidatorCreditManualDatails"));

					request.setAttribute("wayBillTypeDetails",objectOut.get("wayBillTypeDetails"));
					request.setAttribute("showAgentCommission",objectOut.get("showAgentCommission"));
					request.setAttribute("CancelledWayBills",objectOut.get("CancelledWayBills"));

					wayBillIdArr = (Long[])objectOut.get("wayBillIdArr");
					wayBillIds	 = Utility.GetLongArrayToString(wayBillIdArr);

					consignorColl 	= CustomerDetailsDao.getInstance().getConsignorDetailsByWayBillId(wayBillIds);
					consigneeColl 	= CustomerDetailsDao.getInstance().getConsigneeDetailsByWayBillId(wayBillIds);

					storeCityWiseToPayeeDetails = (HashMap<Long,Object>)objectOut.get("storeCityWiseToPayeeDetails");
					if(storeCityWiseToPayeeDetails!= null && storeCityWiseToPayeeDetails.size() > 0){

						itr1 = storeCityWiseToPayeeDetails.keySet().iterator();
						while(itr1.hasNext()){
							cityWiseToPayeeDetails = (HashMap<Long, Object>)storeCityWiseToPayeeDetails.get(Long.parseLong(itr1.next().toString()));
							iterator1 = cityWiseToPayeeDetails.keySet().iterator();
							while(iterator1.hasNext()){
								key = Long.parseLong(iterator1.next().toString());
								cityWiseCollectionModel = (CityWiseCollectionModel)cityWiseToPayeeDetails.get(key);

								cityWiseCollectionModel.setSubRegionName(cacheManip.getGenericSubRegionById(request, cityWiseCollectionModel.getSubRegionId()).getName());
								cityWiseCollectionModel.setBranchName(cacheManip.getGenericBranchDetailCache(request, cityWiseCollectionModel.getBranchId()).getName());
							}
						}
					}
					request.setAttribute("storeCityWiseToPayeeDetails",storeCityWiseToPayeeDetails);

					cancellationHM = (SortedMap<String , KalpanaBranchConsolidatorReportModel>)objectOut.get("Cancellation");

					if(cancellationHM!= null && cancellationHM.size() > 0)
						for(final String key1 : cancellationHM.keySet()){
							rptModel = cancellationHM.get(key1);
							consignor = consignorColl.get(Long.parseLong(key1.split("_")[1]));
							consignee = consigneeColl.get(Long.parseLong(key1.split("_")[1]));

							rptModel.setConsignorName(consignor.getName());
							rptModel.setConsigneeName(consignee.getName());
							rptModel.setWayBillSourceSubRegion(cacheManip.getGenericSubRegionById(request, rptModel.getWayBillSourceSubRegionId()).getName());
							rptModel.setWayBillDestinationSubRegion(cacheManip.getGenericSubRegionById(request, rptModel.getDestinationSubRegionId()).getName());
							rptModel.setWayBillSourceBranch(cacheManip.getGenericBranchDetailCache(request, rptModel.getWayBillSourceBranchId()).getName());
							rptModel.setWayBillDestinationBranch(cacheManip.getGenericBranchDetailCache(request, rptModel.getDestinationBranchId()).getName());
						}
					request.setAttribute("Cancellation",cancellationHM);

					creditorBooking = (SortedMap<String , KalpanaBranchConsolidatorReportModel>)objectOut.get("creditorBooking");

					if(creditorBooking != null && creditorBooking.size() > 0)
						for(final String key1 : creditorBooking.keySet()){
							rptModel = creditorBooking.get(key1);
							consignor = consignorColl.get(Long.parseLong(key1.split("_")[1]));
							consignee = consigneeColl.get(Long.parseLong(key1.split("_")[1]));

							rptModel.setConsignorName(consignor.getName());
							rptModel.setConsigneeName(consignee.getName());
							rptModel.setWayBillDestinationSubRegion(cacheManip.getGenericSubRegionById(request, rptModel.getDestinationSubRegionId()).getName());
							rptModel.setWayBillDestinationBranch(cacheManip.getGenericBranchDetailCache(request, rptModel.getDestinationBranchId()).getName());
						}
					request.setAttribute("creditorBooking",creditorBooking);

					creditorBookingManual = (SortedMap<String , KalpanaBranchConsolidatorReportModel>)objectOut.get("creditorBookingManual");

					if(creditorBookingManual != null && creditorBookingManual.size() > 0)
						for(final String key1 : creditorBookingManual.keySet()){
							rptModel = creditorBookingManual.get(key1);
							consignor = consignorColl.get(Long.parseLong(key1.split("_")[1]));
							consignee = consigneeColl.get(Long.parseLong(key1.split("_")[1]));

							rptModel.setConsignorName(consignor.getName());
							rptModel.setConsigneeName(consignee.getName());
							rptModel.setWayBillDestinationSubRegion(cacheManip.getGenericSubRegionById(request, rptModel.getDestinationSubRegionId()).getName());
							rptModel.setWayBillDestinationBranch(cacheManip.getGenericBranchDetailCache(request, rptModel.getDestinationBranchId()).getName());
						}
					request.setAttribute("creditorBookingManual",creditorBookingManual);

					final ChargeTypeModel[] bookingCharges = cacheManip.getBookingCharges(request, executive.getBranchId());
					request.setAttribute("BookingCharges",bookingCharges);
					ActionStaticUtil.setReportViewModel(request);
				}
				else {
					error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
					error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
					request.setAttribute("cargoError", error);
				}
			}else {
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}
			request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		} finally {
			error 						= null;
			executive					= null;
			sdf							= null;
			fromDate					= null;
			toDate						= null;
			branches  					= null;
			objectIn 					= null;
			objectOut 					= null;
			storeCityWiseToPayeeDetails = null;
			cityWiseToPayeeDetails 		= null;
			consignor					= null;
			consignee					= null;
			cityWiseCollectionModel 	= null;
			cancellationHM 		  		= null;
			creditorBooking 	  	 	= null;
			creditorBookingManual	  	= null;
			rptModel					= null;
			consignorColl				= null;
			consigneeColl				= null;
			wayBillIds					= null;
			wayBillIdArr				= null;
			itr1	 					= null;
			iterator1 					= null;
		}
	}
}