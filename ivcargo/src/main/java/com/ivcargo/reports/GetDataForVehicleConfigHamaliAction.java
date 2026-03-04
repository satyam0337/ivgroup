package com.ivcargo.reports;

//~--- non-JDK imports --------------------------------------------------------

import java.sql.SQLException;
import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.SortedMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.VehicleConfigHamaliBLL;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.bll.impl.properties.HamaliConfigurationBllImpl;
import com.iv.constant.properties.HamaliConfigurationConstant;
import com.iv.logsapp.LogWriter;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.utility.CollectionUtility;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.Branch;
import com.platform.dto.ConfigHamaliMasterForVehicleType;
import com.platform.dto.DispatchDetailsForGetVehicleConfig;
import com.platform.dto.Executive;
import com.platform.dto.SubRegion;
import com.platform.dto.TransportCommonMaster;
import com.platform.dto.VehicleConfigHamali;
import com.platform.dto.model.ReportViewModel;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

public class GetDataForVehicleConfigHamaliAction implements Action {

	private static final String TRACE_ID = "GetDataForVehicleConfigHamaliAction";
	CacheManip 						cManip 			= null;
	Executive        				executive      	= null;

	@SuppressWarnings("unchecked")
	public void execute(HttpServletRequest request, HttpServletResponse response) {

		HashMap<String,Object>	 		error 					= null;
		SimpleDateFormat 				sdf            			= null;
		Timestamp        				fromDate       			= null;
		Timestamp        				toDate         			= null;
		ReportViewModel 				reportViewModel 		= null;
		ValueObject                     inValueObject   		= null;
		SubRegion[]               		subRegionForGroup 		= null;
		HashMap<Long, Branch> 			subRegionBranches    	= null;
		ValueObject                     outValueObject         	= null;
		String 							branchIds				= null;
		VehicleConfigHamaliBLL			vehicleConfigHamaliBLL	= null;
		LinkedHashMap<Long,LinkedHashMap<String,DispatchDetailsForGetVehicleConfig>>	resultHMForLHPVLoading				= null;
		SortedMap<String ,DispatchDetailsForGetVehicleConfig>	resultHMForUnLoading	= null;
		HashMap<Long, String>			branchWithNoConfigHM	= null;
		long 							regionId    			= 0;
		long 							subRegionId    			= 0;
		long 							srcBranchId				= 0;
		short 							hamaliType 				= 0;
		short							roundOff				= 0;	
		List<Long>       				assignedLocationIdList  = null;  
		boolean							showSubRegionWiseBharaiWaraiUtraiThappi = false;
		String							subRegionWiseBharaiWaraiUtraiThappi		= null;
		ArrayList<Long>					subRegionIdsWiseBharaiWaraiUtraiThappi		= null;
		Branch							branch						= null;
		HashMap<Object, Object>			hamaliModuleProperties			= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error)){
				return;
			}

			new InitializeGetDataForVehicleConfigHamaliAction().execute(request, response);

			executive	= (Executive) request.getSession().getAttribute("executive");
			sdf			= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			fromDate	= new Timestamp((sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00")).getTime());
			toDate		= new Timestamp((sdf.parse(JSPUtility.GetString(request, "toDate") + " 23:59:59")).getTime());
			cManip 		= new CacheManip(request);
			hamaliType  = Short.parseShort(request.getParameter("hamaliType"));
			roundOff 	= Short.parseShort(request.getParameter("roundOff"));

			hamaliModuleProperties = new HamaliConfigurationBllImpl().getHamaliModuleWiseGetData(executive.getAccountGroupId());
			showSubRegionWiseBharaiWaraiUtraiThappi = Utility.getBoolean(hamaliModuleProperties.getOrDefault(HamaliConfigurationConstant.SHOW_SUB_REGION_WISE_BHARAI_WARAI_UTRAI_THAPPI, false));
		
			if(hamaliType > 0 && roundOff > 0){

				long accountGroupId 	= executive.getAccountGroupId();

				if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_GROUPADMIN) {

					regionId	= Long.parseLong(request.getParameter("region"));
					subRegionId = Long.parseLong(request.getParameter("subRegion"));
					srcBranchId = Long.parseLong(request.getParameter("branch"));

					// Get Combo values to restore
					subRegionForGroup = cManip.getSubRegionsByRegionId(request, regionId, executive.getAccountGroupId());
					subRegionBranches = cManip.getPhysicalBranchesBySubRegionId(request,executive.getAccountGroupId(), subRegionId);
					request.setAttribute("subRegionForGroup", subRegionForGroup);
					request.setAttribute("subRegionBranches", subRegionBranches);

				} else if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_REGIONADMIN) {

					regionId	= executive.getRegionId();
					subRegionId = Long.parseLong(request.getParameter("subRegion"));
					srcBranchId = Long.parseLong(request.getParameter("branch"));

					// Get Combo values to restore
					subRegionForGroup = cManip.getSubRegionsByRegionId(request, regionId, executive.getAccountGroupId());
					subRegionBranches = cManip.getPhysicalBranchesBySubRegionId(request,executive.getAccountGroupId(), subRegionId);
					request.setAttribute("subRegionForGroup", subRegionForGroup);
					request.setAttribute("subRegionBranches", subRegionBranches);

				} else if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_SUBREGIONADMIN) {

					regionId	= executive.getRegionId();
					subRegionId = executive.getSubRegionId();
					srcBranchId = Long.parseLong(request.getParameter("branch"));

					// Get Combo values to restore
					subRegionBranches = cManip.getPhysicalBranchesBySubRegionId(request,executive.getAccountGroupId(), subRegionId);
					request.setAttribute("subRegionBranches", subRegionBranches);

				} else {
					regionId	= executive.getRegionId();
					subRegionId = executive.getSubRegionId();
					srcBranchId = executive.getBranchId();
				}

				if(subRegionId == 0 && srcBranchId == 0) {
					branchIds = cManip.getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_REGION, regionId);
				} else if(subRegionId > 0 && srcBranchId == 0) {
					branchIds = cManip.getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_SUBREGION, subRegionId);
				} else if(subRegionId > 0 && srcBranchId > 0) {
					assignedLocationIdList = cManip.getAssignedLocationsIdListByLocationIdId(request, srcBranchId, executive.getAccountGroupId());
					
					if(assignedLocationIdList != null) {
						assignedLocationIdList.add(srcBranchId);
					}
					if(assignedLocationIdList != null && !assignedLocationIdList.isEmpty()) {
						branchIds = CollectionUtility.getStringFromLongList(assignedLocationIdList);
					} else {
						branchIds = ""+srcBranchId;
					}
				}
				
				inValueObject	= new ValueObject();
				inValueObject.put("fromDate", fromDate);
				inValueObject.put("toDate", toDate);
				inValueObject.put("branchIds", branchIds);
				inValueObject.put("accountGroupId", accountGroupId);
				inValueObject.put("roundOff", roundOff);

				request.setAttribute("agentName", executive.getName());

				vehicleConfigHamaliBLL = new VehicleConfigHamaliBLL();
			
				if(hamaliType == VehicleConfigHamali.VEHICLECONFIGHAMALI_HAMALITYPE_LOADING){
					outValueObject =  vehicleConfigHamaliBLL.getDispatchDataForVehicleConfigForLoading(inValueObject);
				} else if(hamaliType == VehicleConfigHamali.VEHICLECONFIGHAMALI_HAMALITYPE_UNLOADING){
					outValueObject =  vehicleConfigHamaliBLL.getDispatchDataForVehicleConfigForUnloading(inValueObject);
				}

				if(outValueObject != null){
					branch =   cManip.getGenericBranchDetailCache(request, outValueObject.getLong("branchId", 0));
					
					branchWithNoConfigHM = new HashMap<Long, String>();
				
					if(hamaliType == VehicleConfigHamali.VEHICLECONFIGHAMALI_HAMALITYPE_LOADING){
						resultHMForLHPVLoading = setVehicleConfigForLoading(outValueObject,request, branchIds, branchWithNoConfigHM);
						
						if((resultHMForLHPVLoading == null || resultHMForLHPVLoading.isEmpty())) {
							error.put("errorCode", CargoErrorList.NO_RECORDS);
							error.put("errorDescription", CargoErrorList.NO_RECORDS_DESCRIPTION);
							request.setAttribute("cargoError", error);
						}else {
							request.setAttribute("resultHMForLoading", resultHMForLHPVLoading);
						}
					} else if(hamaliType == VehicleConfigHamali.VEHICLECONFIGHAMALI_HAMALITYPE_UNLOADING){
						resultHMForUnLoading = setVehicleConfigForUnloading(outValueObject,request, branchIds, branchWithNoConfigHM);
						
						
						if((resultHMForUnLoading == null || resultHMForUnLoading.isEmpty())) {
							error.put("errorCode", CargoErrorList.NO_RECORDS);
							error.put("errorDescription", CargoErrorList.NO_RECORDS_DESCRIPTION);
							request.setAttribute("cargoError", error);
						}else {
							request.setAttribute("resultHMForUnLoading", resultHMForUnLoading);
						}
					}
					
					if(showSubRegionWiseBharaiWaraiUtraiThappi) {
						subRegionWiseBharaiWaraiUtraiThappi 	=(String) hamaliModuleProperties.getOrDefault(HamaliConfigurationConstant.SUB_REGION_WISE_BHARAI_WARAI_UTRAI_THAPPI,"0000");
						subRegionIdsWiseBharaiWaraiUtraiThappi 	= Utility.GetLongArrayListFromString(subRegionWiseBharaiWaraiUtraiThappi, ",");
						
						if(branch != null)
							request.setAttribute("showBharaiWaraiUtraiThappi", subRegionIdsWiseBharaiWaraiUtraiThappi.contains(branch.getSubRegionId()));
					}
					
					reportViewModel = new ReportViewModel();
					reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);
					request.setAttribute("branchWithNoConfigHM", branchWithNoConfigHM);
					request.setAttribute("ReportViewModel",reportViewModel);
					
					if(outValueObject.get("loadingTimeThappiHM") != null) {
						request.setAttribute("loadingTimeThappiHM", (HashMap<Long ,Boolean>) outValueObject.get("loadingTimeThappiHM"));
					}
					
				}
			} else {
				LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO, (String) error.get("errorCode")+" "+(String) error.get("errorDescription"));
				error.put("errorCode", CargoErrorList.REPORT_TYPE_MISSING);
				error.put("errorDescription", CargoErrorList.REPORT_TYPE_MISSING_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}
			request.setAttribute("nextPageToken", "success");
		} catch (Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		} finally {
			executive      	  		= null;
			cManip 			  		= null;
			sdf            			= null;
			fromDate       			= null;
			toDate         			= null;
			reportViewModel 		= null;
			inValueObject   		= null;
			subRegionForGroup 		= null;
			subRegionBranches    	= null;
			outValueObject         	= null;
			branchIds				= null;
			vehicleConfigHamaliBLL	= null;
			resultHMForLHPVLoading	= null;
			resultHMForUnLoading	= null;
		}
	}


	@SuppressWarnings("unchecked")
	private LinkedHashMap<Long,LinkedHashMap<String,DispatchDetailsForGetVehicleConfig>> setVehicleConfigForLoading(ValueObject valueObject,HttpServletRequest request, String branchIds, HashMap<Long, String> branchWithNoConfigHM) throws SQLException, Exception{

		LinkedHashMap<String,DispatchDetailsForGetVehicleConfig>	resultHMForLoading				= null;
		DispatchDetailsForGetVehicleConfig					dispatchDetailForVehicleConfig	= null;
		Branch												branch							= null;
		HashMap<Short, ConfigHamaliMasterForVehicleType>	configHamaliColl 				= null;
		HashMap<Long,HashMap<Short, ConfigHamaliMasterForVehicleType>> resultColl			= null;
		LinkedHashMap<Long,LinkedHashMap<String,DispatchDetailsForGetVehicleConfig>>	resultHMForLHPVLoading				= null;
		LinkedHashMap<String,DispatchDetailsForGetVehicleConfig>						resultHMForLSLoading				= null;	
		DispatchDetailsForGetVehicleConfig												lsConfigHamali						= null;
		Long[] branchIdArray = null;

		try {

			resultHMForLoading     = (LinkedHashMap<String ,DispatchDetailsForGetVehicleConfig>)valueObject.get("resultHM");
			branchIdArray		   = Utility.GetLongArrayFromString(branchIds,",");	
			resultHMForLHPVLoading = new LinkedHashMap<Long,LinkedHashMap<String,DispatchDetailsForGetVehicleConfig>>();
			
			if(resultHMForLoading != null && resultHMForLoading.size() > 0) {
				for(int i = 0; i < branchIdArray.length ; i++){
					branchWithNoConfigHM.put(branchIdArray[i], cManip.getGenericBranchDetailCache(request,branchIdArray[i]).getName());
				}

				for(String key : resultHMForLoading.keySet()) {

					dispatchDetailForVehicleConfig = resultHMForLoading.get(key);
					
					branch = cManip.getGenericBranchDetailCache(request,dispatchDetailForVehicleConfig.getLsBranchId());
					dispatchDetailForVehicleConfig.setSourceBranch(branch.getName());
					dispatchDetailForVehicleConfig.setDestinationBranch(cManip.getGenericBranchDetailCache(request, dispatchDetailForVehicleConfig.getDestinationBranchId()).getName());
					//dispatchDetailForVehicleConfig.setCapacity(cManip.getVehicleType(request, executive.getAccountGroupId(),dispatchDetailForVehicleConfig.getVehicleTypeId()).getCapacity());
					//dispatchDetailForVehicleConfig.setVehicleType(cManip.getVehicleType(request, executive.getAccountGroupId(),dispatchDetailForVehicleConfig.getVehicleTypeId()).getName());
					if(dispatchDetailForVehicleConfig.getLhpvHamaliDone() == 1){
						branchWithNoConfigHM.remove(dispatchDetailForVehicleConfig.getBranchId());
					}
					
					resultHMForLSLoading = resultHMForLHPVLoading.get(dispatchDetailForVehicleConfig.getLhpvId());
					if(resultHMForLSLoading == null) {
						resultHMForLSLoading = new LinkedHashMap<String,DispatchDetailsForGetVehicleConfig>();
						lsConfigHamali = (DispatchDetailsForGetVehicleConfig)dispatchDetailForVehicleConfig.clone();
						resultHMForLSLoading.put(dispatchDetailForVehicleConfig.getDispatchLedgerId()+"_"+dispatchDetailForVehicleConfig.getTypeOfLS(), lsConfigHamali);
						resultHMForLHPVLoading.put(dispatchDetailForVehicleConfig.getLhpvId(), resultHMForLSLoading);       
					} else {
						lsConfigHamali = (DispatchDetailsForGetVehicleConfig)dispatchDetailForVehicleConfig.clone();
						resultHMForLSLoading.put(dispatchDetailForVehicleConfig.getDispatchLedgerId()+"_"+dispatchDetailForVehicleConfig.getTypeOfLS(), lsConfigHamali);
						resultHMForLHPVLoading.put(dispatchDetailForVehicleConfig.getLhpvId(), resultHMForLSLoading);
					}
				}
			}
			resultColl = (HashMap<Long,HashMap<Short, ConfigHamaliMasterForVehicleType>> )valueObject.get("resultColl");
			if(resultColl != null && resultColl.size() > 0){

				for(long key: resultColl.keySet()){

					configHamaliColl   = resultColl.get(key);
					if(configHamaliColl != null && configHamaliColl.size() > 0){
						if(branchWithNoConfigHM.size() > 0){
							branchWithNoConfigHM.remove(key);
						}
					}
				}
			}
			
			return resultHMForLHPVLoading;

		} catch (Exception e) {
			e.printStackTrace();
			throw e;
		} finally {
			resultHMForLoading				= null;
			dispatchDetailForVehicleConfig	= null;
			branch							= null;
		}
	}

	@SuppressWarnings("unchecked")
	private SortedMap<String,DispatchDetailsForGetVehicleConfig> setVehicleConfigForUnloading(ValueObject valueObject,HttpServletRequest request, String branchIds, HashMap<Long, String> branchWithNoConfigHM) throws SQLException, Exception{

		SortedMap<String,DispatchDetailsForGetVehicleConfig>	resultHMForLoading				= null;
		DispatchDetailsForGetVehicleConfig					dispatchDetailForVehicleConfig	= null;
		Branch												branch							= null;
		HashMap<Short, ConfigHamaliMasterForVehicleType>	configHamaliColl 				= null;
		HashMap<Long,HashMap<Short, ConfigHamaliMasterForVehicleType>> resultColl			= null;
		Long[] branchIdArray = null;

		try {

			resultHMForLoading    = (SortedMap<String ,DispatchDetailsForGetVehicleConfig>)valueObject.get("resultHM");
			branchIdArray		  = Utility.GetLongArrayFromString(branchIds,",");	

			if(resultHMForLoading != null && resultHMForLoading.size() > 0) {

				for(int i = 0; i < branchIdArray.length ; i++){
					branchWithNoConfigHM.put(branchIdArray[i], cManip.getGenericBranchDetailCache(request, branchIdArray[i]).getName());
				}

				for(String key : resultHMForLoading.keySet()) {

					dispatchDetailForVehicleConfig = resultHMForLoading.get(key);
					dispatchDetailForVehicleConfig.setBookingType(TransportCommonMaster.getBookingTypeForReport(dispatchDetailForVehicleConfig.getBookingTypeId()));
					branch = cManip.getGenericBranchDetailCache(request,dispatchDetailForVehicleConfig.getSourceBranchId());
					dispatchDetailForVehicleConfig.setSourceBranch(branch.getName());
					dispatchDetailForVehicleConfig.setDestinationBranch(cManip.getGenericBranchDetailCache(request, dispatchDetailForVehicleConfig.getDestinationBranchId()).getName());
					dispatchDetailForVehicleConfig.setTurBranchName(cManip.getGenericBranchDetailCache(request, dispatchDetailForVehicleConfig.getTurBranchId()).getName());
					//dispatchDetailForVehicleConfig.setCapacity(cManip.getVehicleType(request, executive.getAccountGroupId(),dispatchDetailForVehicleConfig.getVehicleTypeId()).getCapacity());
					//dispatchDetailForVehicleConfig.setVehicleType(cManip.getVehicleType(request, executive.getAccountGroupId(),dispatchDetailForVehicleConfig.getVehicleTypeId()).getName());
					if(dispatchDetailForVehicleConfig.getLhpvHamaliDone() == 1){
						branchWithNoConfigHM.remove(dispatchDetailForVehicleConfig.getBranchId());
					}
				}
			}
			resultColl = (HashMap<Long,HashMap<Short, ConfigHamaliMasterForVehicleType>> )valueObject.get("resultColl");
			if(resultColl != null && resultColl.size() > 0){

				for(long key: resultColl.keySet()){

					configHamaliColl   = resultColl.get(key);
					if(configHamaliColl != null && configHamaliColl.size() > 0){
						if(branchWithNoConfigHM.size() > 0){
							branchWithNoConfigHM.remove(key);
						}
					}
				}
			}
			return resultHMForLoading;

		} catch (Exception e) {
			e.printStackTrace();
			throw e;
		} finally {
			resultHMForLoading				= null;
			dispatchDetailForVehicleConfig	= null;
			branch							= null;
		}
	}
}