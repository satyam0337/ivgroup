package com.ivcargo.reports;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.DispatchServiceNormReportBLL;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.Executive;
import com.platform.dto.ServiceNorm;
import com.platform.dto.model.BranchWiseDispatchModel;
import com.platform.dto.model.DispatchServiceNormModel;
import com.platform.utils.Utility;

public class DispatchServiceNormReportAction implements Action {

	@Override
	@SuppressWarnings("unchecked")
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	error 				= null;
		Executive				executive			= null;
		CacheManip				cManip				= null;
		ValueObject				valueInObject		= null;
		ValueObject				valueOutObject		= null;
		String					branchesIds			= null;
		SimpleDateFormat		sdf               	= null;
		Timestamp				fromDate			= null;
		Timestamp				toDate				= null;
		HashMap<Long,ServiceNorm> serviceNormHM 	= null;
		DispatchServiceNormReportBLL						 dispatchServiceNormReportBLL	= null;
		HashMap<Long,HashMap<Long,DispatchServiceNormModel>> branchWiseDispatchCountHM 		= null;
		HashMap<Long,HashMap<Long,DispatchServiceNormModel>> branchWiseCrossingCountHM 		= null;
		HashMap<Long,BranchWiseDispatchModel> 				 branchHM 						= null;
		BranchWiseDispatchModel brDispatchModel 	= null;
		ServiceNorm 			serviceNorm  		= null;
		HashMap<Long,String> 	branchWithNoServiceNormHM = null;
		Long[]  				branchIdArray 		= null;
		String 					delimiter	 		= ",";
		String 					branchName 			= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeDispatchServiceNormReportAction().execute(request, response);

			sdf			= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			fromDate	= new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00").getTime());
			toDate		= new Timestamp(sdf.parse(JSPUtility.GetString(request, "toDate") + " 23:59:59").getTime());
			cManip		= new CacheManip(request);
			executive	= cManip.getExecutive(request);

			ActionStaticUtil.executiveTypeWiseBranches(request, cManip, executive);

			branchesIds		= ActionStaticUtil.getPhysicalBranchIds(request, cManip, executive);

			valueInObject = new ValueObject();
			valueInObject.put("accountGroupId", executive.getAccountGroupId());
			valueInObject.put("branchesIds", branchesIds);
			valueInObject.put("fromDate", fromDate);
			valueInObject.put("toDate", toDate);

			dispatchServiceNormReportBLL = new DispatchServiceNormReportBLL();
			valueOutObject	 = dispatchServiceNormReportBLL.getDispatchServiceNormData(valueInObject);
			branchIdArray 	 = Utility.GetLongArrayFromString(branchesIds, delimiter);

			branchWithNoServiceNormHM = new HashMap<Long, String>();

			for (final Long element : branchIdArray)
				branchWithNoServiceNormHM.put(element, cManip.getBranchById(request, executive.getAccountGroupId(),element).getName());

			if(valueOutObject != null) {

				branchWiseDispatchCountHM 	= (HashMap<Long,HashMap<Long,DispatchServiceNormModel>>)valueOutObject.get("branchWiseDispatchCountHM");
				branchWiseCrossingCountHM 	= (HashMap<Long,HashMap<Long,DispatchServiceNormModel>>)valueOutObject.get("branchWiseCrossingCountHM");
				branchHM 					= (HashMap<Long,BranchWiseDispatchModel>)valueOutObject.get("branchHM");
				serviceNormHM 				= (HashMap<Long,ServiceNorm>)valueOutObject.get("serviceNormHM");

				if(branchWiseDispatchCountHM != null || branchWiseCrossingCountHM != null ){

					if(serviceNormHM != null)
						for(final long key : serviceNormHM.keySet()) {
							serviceNorm = serviceNormHM.get(key);
							branchName = branchWithNoServiceNormHM.get(key);

							if(branchName != null)
								branchWithNoServiceNormHM.remove(key);

							brDispatchModel = branchHM.get(key);

							if(brDispatchModel != null)
								brDispatchModel.setBranchName(cManip.getBranchById(request, executive.getAccountGroupId(),serviceNorm.getBranchId()).getName());
						}

					request.setAttribute("branchWiseDispatchCountHM",branchWiseDispatchCountHM);
					request.setAttribute("branchWiseCrossingCountHM",branchWiseCrossingCountHM);
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
			serviceNormHM 		= null;
			dispatchServiceNormReportBLL	= null;
			branchWiseDispatchCountHM 		= null;
			branchWiseCrossingCountHM 		= null;
			branchHM 						= null;
			brDispatchModel 	= null;
			serviceNorm  		= null;
			branchWithNoServiceNormHM = null;
			branchIdArray 		= null;
			delimiter	 		= "";
			branchName 			= null;
		}
	}
}