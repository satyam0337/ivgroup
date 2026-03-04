package com.ivcargo.reports;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.ReceiveServiceNormsReportBLL;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.Branch;
import com.platform.dto.Executive;
import com.platform.dto.LocationsMapping;
import com.platform.dto.ServiceNorm;
import com.platform.dto.model.BranchWiseReceiveModel;
import com.platform.dto.model.ReceiveServiceNormModel;
import com.platform.utils.Utility;

public class ReceiveServiceNormReportAction implements Action {

	@Override
	@SuppressWarnings("unchecked")
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	 	error 				= null;
		Executive					executive			= null;
		CacheManip					cManip				= null;
		ValueObject					valueInObject		= null;
		ValueObject					valueOutObject		= null;
		String						branchesIds			= null;
		SimpleDateFormat			sdf               	= null;
		Timestamp					fromDate			= null;
		Timestamp					toDate				= null;
		BranchWiseReceiveModel		brReceiveModel		= null;
		ServiceNorm					serviceNorm			= null;
		HashMap<Long,String>		branchWithNoServiceNormHM = null;
		Long[]						branchIdArray		= null;
		String						delimiter			= null;
		String						branchName			= null;
		HashMap<Long,Branch>		allGroupBranches	= null;
		LocationsMapping[]			locationMapArray	= null;
		HashMap<Long,ServiceNorm>	serviceNormHM		= null;
		ReceiveServiceNormsReportBLL						receiveServiceNormsReportBLL	= null;
		HashMap<Long,BranchWiseReceiveModel>				branchHM						= null;
		HashMap<Long,HashMap<Long,ReceiveServiceNormModel>> branchWiseReceiveCountHM		= null;
		HashMap<Long,HashMap<Long,ReceiveServiceNormModel>> branchWiseCrossingCountHM		= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeReceiveServiceNormReportAction().execute(request, response);

			delimiter	= ",";
			sdf			= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			fromDate	= new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00").getTime());
			toDate		= new Timestamp(sdf.parse(JSPUtility.GetString(request, "toDate") + " 23:59:59").getTime());
			cManip		= new CacheManip(request);
			executive	= cManip.getExecutive(request);

			ActionStaticUtil.executiveTypeWiseBranches(request, cManip, executive);

			branchesIds	= ActionStaticUtil.getPhysicalBranchIds(request, cManip, executive);

			allGroupBranches	= cManip.getAllGroupBranches(request, executive.getAccountGroupId());
			locationMapArray	= cManip.getLocationMappingForGroup(request, executive.getAccountGroupId());

			valueInObject = new ValueObject();
			valueInObject.put("accountGroupId", executive.getAccountGroupId());
			valueInObject.put("branchesIds", branchesIds);
			valueInObject.put("fromDate", fromDate);
			valueInObject.put("toDate", toDate);
			valueInObject.put("allGroupBranches", allGroupBranches);
			valueInObject.put("locationMapArray", locationMapArray);

			receiveServiceNormsReportBLL = new ReceiveServiceNormsReportBLL();
			valueOutObject	 = receiveServiceNormsReportBLL.getReceiveServiceNormData(valueInObject);
			branchIdArray 	 = Utility.GetLongArrayFromString(branchesIds, delimiter);

			branchWithNoServiceNormHM = new HashMap<Long, String>();

			for (final Long element : branchIdArray)
				branchWithNoServiceNormHM.put(element, cManip.getBranchById(request, executive.getAccountGroupId(),element).getName());

			if(valueOutObject != null) {

				branchWiseReceiveCountHM = (HashMap<Long,HashMap<Long,ReceiveServiceNormModel>>)valueOutObject.get("branchWiseReceiveCountHM");
				branchWiseCrossingCountHM = (HashMap<Long,HashMap<Long,ReceiveServiceNormModel>>)valueOutObject.get("branchWiseCrossingCountHM");
				branchHM = (HashMap<Long,BranchWiseReceiveModel>)valueOutObject.get("branchHM");
				serviceNormHM = (HashMap<Long,ServiceNorm>)valueOutObject.get("serviceNormHM");

				if(branchWiseReceiveCountHM != null || branchWiseCrossingCountHM != null ){

					if(serviceNormHM != null)
						for(final long key : serviceNormHM.keySet()) {
							serviceNorm = serviceNormHM.get(key);
							branchName = branchWithNoServiceNormHM.get(key);

							if(branchName != null)
								branchWithNoServiceNormHM.remove(key);
							brReceiveModel = branchHM.get(key);

							if(brReceiveModel != null)
								brReceiveModel.setBranchName(cManip.getBranchById(request, executive.getAccountGroupId(),serviceNorm.getBranchId()).getName());
						}

					request.setAttribute("branchWiseReceiveCountHM",branchWiseReceiveCountHM);
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
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
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
			brReceiveModel		= null;
			serviceNorm			= null;
			branchWithNoServiceNormHM = null;
			branchIdArray		= null;
			delimiter			= null;
			branchName			= null;
			allGroupBranches	= null;
			locationMapArray	= null;
			serviceNormHM		= null;
			receiveServiceNormsReportBLL	= null;
			branchHM						= null;
			branchWiseReceiveCountHM		= null;
			branchWiseCrossingCountHM		= null;
		}
	}
}