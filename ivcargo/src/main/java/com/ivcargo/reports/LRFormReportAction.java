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
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.ConsignmentSummaryDao;
import com.platform.dao.CustomerDetailsDao;
import com.platform.dao.reports.LRFormReportDao;
import com.platform.dto.BookingRegisterModel;
import com.platform.dto.ConsignmentSummary;
import com.platform.dto.CustomerDetails;
import com.platform.dto.Executive;
import com.platform.dto.WayBillType;
import com.platform.dto.constant.FormTypeConstant;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

public class LRFormReportAction implements Action {

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>				error 					= null;
		Executive        					executive   			= null;
		BookingRegisterModel[] 				reportModel 			= null;
		CacheManip 							cacheManip 				= null;
		SimpleDateFormat 					sdf            			= null;
		Timestamp        					fromDate       			= null;
		Timestamp        					toDate         			= null;
		ValueObject 						objectOut 				= null;
		Long[] 								wayBillIdArray			= null;
		HashMap<Long, BookingRegisterModel>	bookedLRColl	    	= null;
		HashMap<Long, ConsignmentSummary> 	conSumColl 				= null;
		HashMap<Long, CustomerDetails>		consignorColl			= null;
		HashMap<Long, CustomerDetails>		consigneeColl			= null;
		String								wayBillStr				= null;
		CustomerDetails						consignor				= null;
		CustomerDetails						consignee				= null;
		ConsignmentSummary					conSum					= null;
		ArrayList<Long> 					chargesAllowedToView	= null;
		ArrayList<Long> 					chargesAllowedToViewForManual= null;
		String 								branchIds				= null;
		short								formTypeId		  		= 0;
		String								formTypeIds       		= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeLRFormReportAction().execute(request, response);

			sdf				= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			fromDate		= new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00").getTime());
			toDate			= new Timestamp(sdf.parse(JSPUtility.GetString(request, "toDate") + " 23:59:59").getTime());
			executive   	= (Executive) request.getSession().getAttribute("executive");
			cacheManip  	= new CacheManip(request);

			ActionStaticUtil.executiveTypeWiseBranches(request, cacheManip, executive);

			branchIds		= ActionStaticUtil.getBranchIdsWithAssignedLocation(request, cacheManip, executive);

			formTypeId = JSPUtility.GetShort(request, "form_403_402", (short)0);

			if(formTypeId == 0)
				formTypeIds = FormTypeConstant.FORM_403_402_NOT_APPLICABLE_ID + "," + FormTypeConstant.FORM_403_402_RECEIVED_ID + "," + FormTypeConstant.FORM_403_402_NOT_RECEIVED_ID;
			else
				formTypeIds = "" + formTypeId;

			objectOut  = LRFormReportDao.getInstance().getLRFormByBranchIds(branchIds ,executive.getAccountGroupId() ,fromDate ,toDate);

			if(objectOut != null) {

				reportModel 	= (BookingRegisterModel[])objectOut.get("BookingRegisterModel");
				wayBillIdArray 	= (Long[]) objectOut.get("WayBillIdArray");

				if (reportModel != null && wayBillIdArray != null) {

					wayBillStr 			= Utility.GetLongArrayToString(wayBillIdArray);
					conSumColl 			= ConsignmentSummaryDao.getInstance().getFormTypeIdsByWayBillIds(wayBillStr, formTypeIds);
					consignorColl 		= CustomerDetailsDao.getInstance().getConsignorDetailsByWayBillId(wayBillStr);
					consigneeColl 		= CustomerDetailsDao.getInstance().getConsigneeDetailsByWayBillId(wayBillStr);

					bookedLRColl	= new LinkedHashMap<Long, BookingRegisterModel>();

					for (final BookingRegisterModel element : reportModel) {

						if(conSumColl != null && conSumColl.size() > 0) {
							conSum = conSumColl.get(element.getWayBillId());

							if(conSum != null) {
								element.setNoOfPkgs(conSum.getQuantity());
								element.setActualWeight(conSum.getActualWeight());
								element.setChargedWeight(conSum.getChargeWeight());
								element.setFormName(FormTypeConstant.getForms(conSum.getFormTypeId()));
								element.setFormTypeId(conSum.getFormTypeId());
							} else
								element.setFormName(FormTypeConstant.getForms(element.getFormTypeId()));
						}

						if(consignorColl != null && consignorColl.size() > 0) {
							consignor = consignorColl.get(element.getWayBillId());

							if(consignor != null)
								element.setConsignerName(consignor.getName());
							else
								element.setConsignerName("");
						}

						if(consigneeColl != null && consigneeColl.size() > 0) {
							consignee = consigneeColl.get(element.getWayBillId());

							if(consignee != null)
								element.setConsigneeName(consignee.getName());
							else
								element.setConsigneeName("");
						}

						element.setSourceBranch(cacheManip.getGenericBranchDetailCache(request, element.getSourceBranchId()).getName());
						element.setDestinationBranch(cacheManip.getGenericBranchDetailCache(request, element.getDestinationBranchId()).getName());
						element.setWayBillType(WayBillType.getWayBillTypeShortNameByWayBilTypeId(element.getWayBillTypeId()));

						if(formTypeId == 0 || formTypeId == element.getFormTypeId())
							bookedLRColl.put(element.getWayBillId(), element);
					}

					if(bookedLRColl != null && bookedLRColl.size() > 0)
						request.setAttribute("bookedLRColl", bookedLRColl);
					else {
						error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
						error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
						request.setAttribute("cargoError", error);
					}
				} else {
					error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
					error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
					request.setAttribute("cargoError", error);
				}

				request.setAttribute("chargesAllowedToView",chargesAllowedToView);
				request.setAttribute("chargesAllowedToViewForManual",chargesAllowedToViewForManual);
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
			error 					= null;
			executive   			= null;
			reportModel 			= null;
			cacheManip 				= null;
			sdf            			= null;
			fromDate       			= null;
			toDate         			= null;
			objectOut 				= null;
			wayBillIdArray			= null;
			bookedLRColl	    	= null;
			conSumColl 				= null;
			consignorColl			= null;
			consigneeColl			= null;
			wayBillStr				= null;
			consignor				= null;
			consignee				= null;
			conSum					= null;
			chargesAllowedToView	= null;
			chargesAllowedToViewForManual= null;
			branchIds				= null;
			formTypeIds       		= null;
		}
	}
}