package com.ivcargo.reports;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
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
import com.platform.dao.ConsignmentSummaryDao;
import com.platform.dao.CustomerDetailsDao;
import com.platform.dao.reports.CityWiseToPayCollectionReportDAO;
import com.platform.dao.reports.WayBillDetailsDAO;
import com.platform.dto.Branch;
import com.platform.dto.ChargeTypeMaster;
import com.platform.dto.CustomerDetails;
import com.platform.dto.Executive;
import com.platform.dto.WayBillCharges;
import com.platform.dto.WayBillType;
import com.platform.dto.model.CityWiseToPayCollectionReportModel;
import com.platform.dto.model.WayBillDeatailsModel;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

public class CityWiseToPayCollectionReportAction implements Action{

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {

		HashMap<String,Object>	 			error 					= null;
		CacheManip 							cManip 					= null;
		Executive       					executive         		= null;
		SimpleDateFormat 					sdf               		= null;
		Timestamp        					fromDate          		= null;
		Timestamp        					toDate            		= null;
		Branch[]    						branches  				= null;
		HashMap<Long, CustomerDetails>		consignorColl			= null;
		HashMap<Long, CustomerDetails>		consigneeColl			= null;
		HashMap<Long, Long> 				summaryColl				= null;
		CustomerDetails						consignor				= null;
		CustomerDetails						consignee				= null;
		String								wayBillIds				= null;
		long 								selectedSourceCity 		= 0;
		long 								selectedSourceBranch	= 0;
		long 								selectedDestCity   	 	= 0;
		long							   	selectedRegion			= 0;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeCityWiseToPayCollectionReportAction().execute(request, response);

			cManip 					= new CacheManip(request);
			executive         		= cManip.getExecutive(request);
			sdf               		= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			fromDate          		= new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00").getTime());
			toDate            		= new Timestamp(sdf.parse(JSPUtility.GetString(request, "toDate") + " 23:59:59").getTime());

			selectedDestCity    	= JSPUtility.GetLong(request, "TosubRegion",0);

			if(executive.getExecutiveType()==ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN) {
				selectedRegion = JSPUtility.GetLong(request, "region",0);
				selectedSourceCity  	= JSPUtility.GetLong(request,"subRegion",0);
				selectedSourceBranch	= JSPUtility.GetLong(request,"branch",0);
			} else {
				selectedRegion			= executive.getRegionId();
				selectedSourceCity		= executive.getSubRegionId();
				selectedSourceBranch	= executive.getBranchId();
			}

			//Get all selected source Branches
			branches = cManip.getBranchesArrayBySubRegionId(request, executive.getAccountGroupId(), selectedSourceCity);
			request.setAttribute("srcBranches", branches);

			if(selectedSourceCity > 0) {
				branches = cManip.getBranchesArrayBySubRegionId(request, executive.getAccountGroupId(), selectedSourceCity);
				request.setAttribute("branches", branches);
			}

			final ValueObject objectIn = new ValueObject();
			objectIn.put("fromDate", fromDate);
			objectIn.put("toDate", toDate);
			objectIn.put("srcCity", selectedSourceCity);
			objectIn.put("srcBranch",selectedSourceBranch);
			objectIn.put("destCity", selectedDestCity);
			objectIn.put("accountGroupId", executive.getAccountGroupId());
			objectIn.put("regionId", selectedRegion);

			final ValueObject objectOut = CityWiseToPayCollectionReportDAO.getInstance().getReport(objectIn);

			if(objectOut != null){

				final CityWiseToPayCollectionReportModel[] 	reportModel 	= (CityWiseToPayCollectionReportModel[])objectOut.get("ReportModel");
				final Long[] 									wayBillIdArray 	= (Long[]) objectOut.get("WayBillIdArray");

				if(reportModel != null && wayBillIdArray != null) {
					wayBillIds			= Utility.GetLongArrayToString(wayBillIdArray);
					consignorColl 	    = CustomerDetailsDao.getInstance().getConsignorDetailsByWayBillId(wayBillIds);
					consigneeColl 	    = CustomerDetailsDao.getInstance().getConsigneeDetailsByWayBillId(wayBillIds);
					summaryColl		    = ConsignmentSummaryDao.getInstance().getNoOfPackages(wayBillIds);

					//Get WayBill Details code ( Start )
					final HashMap<Long, WayBillDeatailsModel> wayBillDetails = WayBillDetailsDAO.getInstance().getWayBillDetails(wayBillIdArray ,true ,ChargeTypeMaster.WAYBILL_CHARGETYPE_BOOKING ,false ,(short)0 ,false);
					//Get WayBill Details code ( End )

					final HashMap<Long, ArrayList<CityWiseToPayCollectionReportModel>> 	destinationWiseReport 	= new LinkedHashMap<Long, ArrayList<CityWiseToPayCollectionReportModel>>();
					ArrayList<CityWiseToPayCollectionReportModel> 					destinationWiseData 	= null;
					final HashMap<Long,String> 											cityInfo 				= new LinkedHashMap<Long,String>();
					WayBillType 													wayBillType 			= null;
					HashMap<Long,Double> 											chargesCollection 		= null;
					WayBillCharges[] 												wayBillCharges 			= null;
					final ArrayList<Long> accountGroupCollection = new ArrayList<Long>();

					for (final CityWiseToPayCollectionReportModel element : reportModel) {

						chargesCollection 	= new HashMap<Long,Double>();
						wayBillCharges 		= wayBillDetails.get(element.getWayBillId()).getWayBillCharges();

						for (final WayBillCharges wayBillCharge : wayBillCharges)
							chargesCollection.put(wayBillCharge.getWayBillChargeMasterId(), wayBillCharge.getChargeAmount());

						element.setChargesCollection(chargesCollection);

						element.setWayBillSourceSubRegion(cManip.getGenericSubRegionById(request, element.getWayBillSourceSubRegionId()).getName());
						element.setWayBillSourceBranch(cManip.getGenericBranchDetailCache(request, element.getWayBillSourceBranchId()).getName());
						element.setWayBillDestinationSubRegion(cManip.getGenericSubRegionById(request, element.getWayBillDestinationSubRegionId()).getName());
						element.setWayBillDestinationBranch(cManip.getGenericBranchDetailCache(request, element.getWayBillDestinationBranchId()).getName());

						cityInfo.put(element.getWayBillDestinationSubRegionId(), element.getWayBillDestinationSubRegion());

						wayBillType = cManip.getWayBillTypeById(request, element.getWayBillTypeId());
						if(element.isManual())
							element.setWayBillType(wayBillType.getWayBillType()+WayBillType.WAYBILL_TYPE_MANUAL);
						else
							element.setWayBillType(wayBillType.getWayBillType());

						if(consignorColl != null && consignorColl.size() > 0)
							consignor = consignorColl.get(element.getWayBillId());

						element.setConsignorName(consignor != null ? consignor.getName() : "--");

						if(consigneeColl != null && consigneeColl.size() > 0)
							consignee = consigneeColl.get(element.getWayBillId());

						element.setConsigneeName(consignee != null ? consignee.getName() : "--");

						if(summaryColl != null && summaryColl.size() > 0)
							element.setNoOfPackages(summaryColl.get(element.getWayBillId()));

						if(destinationWiseReport.get(element.getWayBillDestinationSubRegionId()) == null){
							destinationWiseData = new ArrayList<CityWiseToPayCollectionReportModel>();
							destinationWiseData.add(element);
							destinationWiseReport.put(element.getWayBillDestinationSubRegionId(), destinationWiseData);
						} else {
							destinationWiseData = destinationWiseReport.get(element.getWayBillDestinationSubRegionId());
							destinationWiseData.add(element);
						}

						if(!accountGroupCollection.contains(element.getAccountGroupId()))
							accountGroupCollection.add(element.getAccountGroupId());
					}

					request.setAttribute("reportModel", destinationWiseReport);
					request.setAttribute("cityInfo", cityInfo);
					request.setAttribute("BookingCharges", cManip.getBookingCharges(request, executive.getBranchId()));

					ActionStaticUtil.setReportViewModel(request);
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
		} finally{
			error 					= null;
			cManip 					= null;
			executive         		= null;
			sdf               		= null;
			fromDate          		= null;
			toDate            		= null;
			branches  				= null;
			consignorColl		= null;
			consigneeColl		= null;
			summaryColl			= null;
			consignor			= null;
			consignee			= null;
			wayBillIds			= null;
		}
	}
}