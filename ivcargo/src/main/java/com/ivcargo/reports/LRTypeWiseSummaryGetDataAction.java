package com.ivcargo.reports;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.LRTypeWiseSummaryBLL;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.Executive;

public class LRTypeWiseSummaryGetDataAction implements Action{

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	error 					= null;
		Executive				executive       		= null;
		CacheManip				cache 	        		= null;
		LRTypeWiseSummaryBLL	lrTypeWiseSummaryBll	= null;
		ValueObject				valueOutObj				= null;
		ValueObject				valueInObj				= null;
		Timestamp				fromDate        		= null;
		Timestamp				toDate          		= null;
		SimpleDateFormat		sdf             		= null;
		String					branchIds				= null;
		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error))
				return;
			new InitializeLRTypeWiseSummaryAction().execute(request, response);

			lrTypeWiseSummaryBll	= new LRTypeWiseSummaryBLL();
			valueOutObj 			= new ValueObject();
			cache 	        		= new CacheManip(request);
			executive       		= cache.getExecutive(request);
			sdf             		= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			fromDate        		= new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00").getTime());
			toDate          		= new Timestamp(sdf.parse(JSPUtility.GetString(request, "toDate") + " 23:59:59").getTime());

			ActionStaticUtil.executiveTypeWiseBranches(request, cache, executive);

			branchIds		= ActionStaticUtil.getBranchIdsWithAssignedLocation(request, cache, executive);

			valueOutObj.put("branchIds", branchIds);
			valueOutObj.put("fromDate", fromDate);
			valueOutObj.put("toDate", toDate);
			valueInObj = lrTypeWiseSummaryBll.getLRTypeWiseSummary(valueOutObj);
			request.setAttribute("LRTypeWiseSummary", valueInObj);

			ActionStaticUtil.setReportViewModel(request);
			request.setAttribute("nextPageToken", "success");
		} catch (final Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		} finally {
			error 					= null;
			executive       		= null;
			cache 	        		= null;
			lrTypeWiseSummaryBll	= null;
			valueOutObj				= null;
			valueInObj				= null;
			fromDate        		= null;
			toDate          		= null;
			sdf             		= null;
			branchIds				= null;
		}
	}
}