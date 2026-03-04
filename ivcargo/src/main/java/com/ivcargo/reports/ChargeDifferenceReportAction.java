package com.ivcargo.reports;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.SortedMap;
import java.util.TreeMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.ChargeDifferenceDao;
import com.platform.dto.Branch;
import com.platform.dto.ChargeDifference;
import com.platform.dto.Executive;
import com.platform.dto.SubRegion;
import com.platform.resource.CargoErrorList;

public class ChargeDifferenceReportAction implements Action {

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {

		HashMap<String,Object>	 											error 				= null;
		Executive															executive      	 	= null;
		SimpleDateFormat													sdf             	= null;
		Timestamp        													fromDate        	= null;
		Timestamp        													toDate          	= null;
		ChargeDifference[]													chargeDifference	= null;
		CacheManip															cache				= null;
		ValueObject															valOut				= null;
		String																branchesIds			= null;
		SortedMap<String,SortedMap<String, ArrayList<ChargeDifference>>> 	subRegionWiseData	= null;
		SortedMap<String, ArrayList<ChargeDifference>>						branchWiseData		= null;
		ArrayList<ChargeDifference>											reportList			= null;
		Branch																branch				= null;
		SubRegion															subRegion			= null;

		try {

			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error))
				return;
			new InitializeChargeDifferenceReportAction().execute(request, response);

			sdf             = new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			fromDate        = new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00").getTime());
			toDate          = new Timestamp(sdf.parse(JSPUtility.GetString(request, "toDate") + " 23:59:59").getTime());
			cache 			= new CacheManip(request);
			executive       = cache.getExecutive(request);

			ActionStaticUtil.executiveTypeWiseBranches(request, cache, executive);

			branchesIds		= ActionStaticUtil.getBranchIds(request, cache, executive);

			valOut 			 	= ChargeDifferenceDao.getInstance().getChargeDifferenceDetails(fromDate, toDate, executive.getAccountGroupId(),branchesIds);
			chargeDifference 	= (ChargeDifference[])valOut.get("chargeDifferenceArr");

			if(chargeDifference != null) {

				subRegionWiseData	= new TreeMap<String, SortedMap<String,ArrayList<ChargeDifference>>>();

				for (final ChargeDifference element : chargeDifference) {
					branch	= cache.getGenericBranchDetailCache(request,element.getSourceBranchId());
					element.setSourceBranch(branch.getName());
					element.setSourceSubRegionId(branch.getSubRegionId());

					if (element.getSourceSubRegionId() > 0)
						element.setSourceSubRegion(cache.getGenericSubRegionById(request, element.getSourceSubRegionId()).getName());
					else
						element.setSourceSubRegion("--");

					branch	= cache.getGenericBranchDetailCache(request,element.getDestinationBranchId());
					element.setDestinationBranch(branch.getName());
					element.setDestinationSubRegionId(branch.getSubRegionId());

					if (element.getDestinationSubRegionId() > 0)
						element.setDestinationSubRegion(cache.getGenericSubRegionById(request, element.getDestinationSubRegionId()).getName());
					else
						element.setDestinationSubRegion("--");

					branch 		= cache.getGenericBranchDetailCache(request,element.getBranchId());
					subRegion 	= cache.getSubRegionByIdAndGroupId(request,branch.getSubRegionId(),executive.getAccountGroupId());

					element.setBranch(branch.getName());

					branchWiseData 	= subRegionWiseData.get(subRegion.getName()+"_"+subRegion.getSubRegionId());

					if(branchWiseData == null){

						branchWiseData	= new TreeMap<String, ArrayList<ChargeDifference>>();
						reportList 		= new ArrayList<ChargeDifference>();
						reportList.add(element);
						branchWiseData.put(element.getBranch()+"_"+element.getBranchId(), reportList);
						subRegionWiseData.put(subRegion.getName()+"_"+subRegion.getSubRegionId(), branchWiseData);

					} else {

						reportList = branchWiseData.get(element.getBranch()+"_"+element.getBranchId());

						if(reportList == null)
							reportList = new ArrayList<ChargeDifference>();

						reportList.add(element);
						branchWiseData.put(element.getBranch()+"_"+element.getBranchId(), reportList);
					}
				}

				request.setAttribute("subRegionWiseData", subRegionWiseData);
				ActionStaticUtil.setReportViewModel(request);
			} else {
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}
			request.setAttribute("nextPageToken", "success");

		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		} finally {
			error 				= null;
			executive      	 	= null;
			sdf             	= null;
			fromDate        	= null;
			toDate          	= null;
			chargeDifference	= null;
			cache				= null;
			valOut				= null;
			branchesIds			= null;
			subRegionWiseData	= null;
			branchWiseData		= null;
			reportList			= null;
			branch				= null;
			subRegion			= null;
		}

	}
}