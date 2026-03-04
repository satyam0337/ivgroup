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
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.reports.BillInformationBranchWiseDAO;
import com.platform.dto.Branch;
import com.platform.dto.Executive;
import com.platform.dto.SubRegion;
import com.platform.dto.model.BillInformationBranchWiseReport;
import com.platform.resource.CargoErrorList;

public class BillInformationBranchWiseReportAction implements Action {

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	 										error 				= null;
		Executive        												executive         	= null;
		SimpleDateFormat 												sdf               	= null;
		Timestamp        												fromDate          	= null;
		Timestamp        												toDate            	= null;
		ValueObject 													objectIn 			= null;
		ValueObject 													objectOut 			= null;
		BillInformationBranchWiseReport[] 								reportModel			= null;
		SortedMap<String, SortedMap<String,SortedMap<String,BillInformationBranchWiseReport>>> subRegionWiseData = null;
		SortedMap<String,SortedMap<String,BillInformationBranchWiseReport>>	branchWiseData	   	= null;
		SortedMap<String,BillInformationBranchWiseReport>				modelHM		   			= null;
		BillInformationBranchWiseReport 								model					= null;
		CacheManip														cache					= null;
		String															branchIds				= null;
		Branch															branch					= null;
		SubRegion														subregion				= null;
		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeBillInformationBranchWiseReportAction().execute(request, response);

			sdf			= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			fromDate	= new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00").getTime());
			toDate		= new Timestamp(sdf.parse(JSPUtility.GetString(request, "toDate") + " 23:59:59").getTime());
			objectIn	= new ValueObject();
			objectOut	= new ValueObject();
			cache       = new CacheManip(request);
			executive	= cache.getExecutive(request);

			ActionStaticUtil.executiveTypeWiseBranches(request, cache, executive);

			branchIds	= ActionStaticUtil.getPhysicalBranchIds(request, cache, executive);

			objectIn.put("fromDate", fromDate);
			objectIn.put("toDate", toDate);
			objectIn.put("branchIds", branchIds);
			objectIn.put("accountGroupId", executive.getAccountGroupId());

			objectOut = BillInformationBranchWiseDAO.getInstance().getBillInformationBranchWise(objectIn);

			if(objectOut != null) {

				reportModel = (BillInformationBranchWiseReport[])objectOut.get("BillInformationBranchWiseReport");

				if(reportModel != null) {

					cache			    = new CacheManip(request);
					subRegionWiseData 	= new TreeMap<String, SortedMap<String,SortedMap<String,BillInformationBranchWiseReport>>>();

					for (final BillInformationBranchWiseReport element : reportModel) {

						branch = cache.getGenericBranchDetailCache(request,element.getBranchId());
						element.setBranchName(branch.getName());

						subregion  = cache.getGenericSubRegionById(request, branch.getSubRegionId());
						branchWiseData = subRegionWiseData.get(subregion.getName()+"_"+subregion.getSubRegionId());

						if(branchWiseData == null) {

							branchWiseData	= new TreeMap<String,SortedMap<String,BillInformationBranchWiseReport>>();
							modelHM			= new TreeMap<String,BillInformationBranchWiseReport>();
							model			= new BillInformationBranchWiseReport();
							model.setCreditorId(element.getCreditorId());
							model.setBillId(element.getBillId());
							model.setBillNumber(element.getBillNumber());
							model.setBillDateTime(element.getBillDateTime());
							model.setActualWeight(element.getActualWeight());
							model.setQuantity(element.getQuantity());
							model.setGrandTotal(element.getGrandTotal());
							model.setCreditorName(element.getCreditorName());
							model.setBranchId(element.getBranchId());
							model.setSubRegionName(subregion.getName());
							model.setBranchName(element.getBranchName());
							model.setServiceTaxAmount(element.getServiceTaxAmount());
							model.setIncomeAmount(element.getIncomeAmount());
							model.setExpenseAmount(element.getExpenseAmount());
							model.setReceivedAmount(element.getReceivedAmount());
							model.setStatus(element.getStatus());


							modelHM.put(model.getCreditorName()+"_"+model.getBillId(),model);
							branchWiseData.put(element.getBranchName()+"_"+branch.getBranchId(), modelHM);
							subRegionWiseData.put(subregion.getName()+"_"+subregion.getSubRegionId(), branchWiseData);

						} else {

							modelHM = branchWiseData.get(element.getBranchName()+"_"+branch.getBranchId());
							if(modelHM == null){
								modelHM = new TreeMap<String,BillInformationBranchWiseReport>();
								model = new BillInformationBranchWiseReport();

								model.setCreditorId(element.getCreditorId());
								model.setBillId(element.getBillId());
								model.setBillNumber(element.getBillNumber());
								model.setBillDateTime(element.getBillDateTime());
								model.setActualWeight(element.getActualWeight());
								model.setQuantity(element.getQuantity());
								model.setGrandTotal(element.getGrandTotal());
								model.setCreditorName(element.getCreditorName());
								model.setBranchId(element.getBranchId());
								model.setSubRegionName(subregion.getName());
								model.setBranchName(element.getBranchName());
								model.setServiceTaxAmount(element.getServiceTaxAmount());
								model.setIncomeAmount(element.getIncomeAmount());
								model.setExpenseAmount(element.getExpenseAmount());
								model.setReceivedAmount(element.getReceivedAmount());
								model.setStatus(element.getStatus());

								modelHM.put(model.getCreditorName()+"_"+model.getBillId(),model);
								branchWiseData.put(element.getBranchName()+"_"+branch.getBranchId(), modelHM);
							}else{
								model = new BillInformationBranchWiseReport();

								model.setCreditorId(element.getCreditorId());
								model.setBillId(element.getBillId());
								model.setBillNumber(element.getBillNumber());
								model.setBillDateTime(element.getBillDateTime());
								model.setActualWeight(element.getActualWeight());
								model.setQuantity(element.getQuantity());
								model.setGrandTotal(element.getGrandTotal());
								model.setCreditorName(element.getCreditorName());
								model.setBranchId(element.getBranchId());
								model.setSubRegionName(subregion.getName());
								model.setBranchName(element.getBranchName());
								model.setServiceTaxAmount(element.getServiceTaxAmount());
								model.setIncomeAmount(element.getIncomeAmount());
								model.setExpenseAmount(element.getExpenseAmount());
								model.setReceivedAmount(element.getReceivedAmount());
								model.setStatus(element.getStatus());

								modelHM.put(model.getCreditorName()+"_"+model.getBillId(),model);
							}
						}
					}

					request.setAttribute("subRegionWiseData",subRegionWiseData);
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

			ActionStaticUtil.setReportViewModel(request);
			request.setAttribute("nextPageToken", "success");
		} catch (final Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		} finally {
			error 				= null;
			executive         	= null;
			sdf               	= null;
			fromDate          	= null;
			toDate            	= null;
			objectIn 			= null;
			objectOut 			= null;
			reportModel			= null;
			subRegionWiseData 	= null;
			branchWiseData	   	= null;
			modelHM		   			= null;
			model					= null;
			cache					= null;
			branchIds				= null;
			branch					= null;
			subregion				= null;
		}
	}
}