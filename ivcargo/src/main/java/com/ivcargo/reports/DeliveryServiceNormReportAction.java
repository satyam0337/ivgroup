package com.ivcargo.reports;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.DeliveryServiceNormsReportBLL;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.Executive;
import com.platform.dto.ServiceNorm;
import com.platform.dto.model.BranchWiseDeliveryModel;
import com.platform.dto.model.DeliveryServiceNormModel;
import com.platform.utils.Utility;

public class DeliveryServiceNormReportAction implements Action {

	@Override
	@SuppressWarnings("unchecked")
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		// TODO Auto-generated method stub

		HashMap<String,Object>	error 				= null;
		Executive				executive			= null;
		CacheManip				cManip				= null;
		ValueObject				valueInObject		= null;
		ValueObject				valueOutObject		= null;
		String					branchesIds			= null;
		SimpleDateFormat		sdf               	= null;
		Timestamp				fromDate			= null;
		Timestamp				toDate				= null;
		BranchWiseDeliveryModel brDeliveryModel 	= null;
		ServiceNorm 			serviceNorm  		= null;
		HashMap<Long,String>	branchWithNoServiceNormHM = null;
		Long[]   				branchIdArray 		= null;
		String 					delimiter 			= ",";
		String 					branchName 			= null;
		HashMap<Long,ServiceNorm> 								serviceNormHM 					= null;
		DeliveryServiceNormsReportBLL							deliveryServiceNormsReportBLL	= null;
		HashMap<Long,HashMap<Long,DeliveryServiceNormModel>> 	branchWiseDeliveryCountHM 		= null;
		HashMap<Long,BranchWiseDeliveryModel> 					branchHM 						= null;
		try {

			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeDeliveryServiceNormReportAction().execute(request, response);

			sdf			= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			fromDate	= new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00").getTime());
			toDate		= new Timestamp(sdf.parse(JSPUtility.GetString(request, "toDate") + " 23:59:59").getTime());
			cManip		= new CacheManip(request);
			executive	= cManip.getExecutive(request);

			ActionStaticUtil.executiveTypeWiseBranches(request, cManip, executive);

			branchesIds		= ActionStaticUtil.getBranchIds(request, cManip, executive);

			valueInObject = new ValueObject();
			valueInObject.put("accountGroupId", executive.getAccountGroupId());
			valueInObject.put("branchesIds", branchesIds);
			valueInObject.put("fromDate", fromDate);
			valueInObject.put("toDate", toDate);

			deliveryServiceNormsReportBLL = new DeliveryServiceNormsReportBLL();
			valueOutObject	 = deliveryServiceNormsReportBLL.getDeliverServiceNormData(valueInObject);
			branchIdArray 	 = Utility.GetLongArrayFromString(branchesIds, delimiter);

			branchWithNoServiceNormHM = new HashMap<Long, String>();

			for (final Long element : branchIdArray)
				branchWithNoServiceNormHM.put(element, cManip.getBranchById(request, executive.getAccountGroupId(),element).getName());

			if(valueOutObject != null) {

				branchWiseDeliveryCountHM 	= (HashMap<Long,HashMap<Long,DeliveryServiceNormModel>>)valueOutObject.get("branchWiseDeliveryCountHM");
				branchHM 					= (HashMap<Long,BranchWiseDeliveryModel>)valueOutObject.get("branchHM");
				serviceNormHM 				= (HashMap<Long,ServiceNorm>)valueOutObject.get("serviceNormHM");

				if(branchWiseDeliveryCountHM != null){

					if(serviceNormHM != null)
						for(final long key : serviceNormHM.keySet()) {
							serviceNorm = serviceNormHM.get(key);
							branchName = branchWithNoServiceNormHM.get(key);
							if(branchName != null)
								branchWithNoServiceNormHM.remove(key);
							brDeliveryModel = branchHM.get(key);
							if(brDeliveryModel != null)
								brDeliveryModel.setBranchName(cManip.getBranchById(request, executive.getAccountGroupId(),serviceNorm.getBranchId()).getName());
						}

					request.setAttribute("branchWiseDeliveryCountHM",branchWiseDeliveryCountHM);
					request.setAttribute("serviceNormHM",serviceNormHM);
					request.setAttribute("branchHM",branchHM);
				} else if(serviceNormHM != null)
					for(final long key : serviceNormHM.keySet()) {
						serviceNorm = serviceNormHM.get(key);
						branchName = branchWithNoServiceNormHM.get(key);
						if(branchName != null)
							branchWithNoServiceNormHM.remove(key);
					}
			}
			request.setAttribute("branchWithNoServiceNormHM", branchWithNoServiceNormHM);
			ActionStaticUtil.setReportViewModel(request);
			request.setAttribute("nextPageToken", "success");
		} catch (final Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		} finally {
			error 				= null;
			executive			= null;
			cManip				= null;
			valueInObject		= null;
			valueOutObject		= null;
			branchesIds			= null;
			sdf               	= null;
			fromDate			= null;
			toDate				= null;
			brDeliveryModel 	= null;
			serviceNorm  		= null;
			branchWithNoServiceNormHM = null;
			branchIdArray 		= null;
			delimiter 			= "";
			branchName 			= null;
			serviceNormHM 					= null;
			deliveryServiceNormsReportBLL	= null;
			branchWiseDeliveryCountHM 		= null;
			branchHM 						= null;
		}
	}
}