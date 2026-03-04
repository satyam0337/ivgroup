package com.ivcargo.reports;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.HashMap;
import java.util.StringJoiner;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.ObjectUtils;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.dto.constant.WayBillStatusConstant;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.ConsignmentSummaryDao;
import com.platform.dao.WayBillHistoryDao;
import com.platform.dao.reports.CancelledDeliveryReportDao;
import com.platform.dto.ConsignmentSummary;
import com.platform.dto.Executive;
import com.platform.dto.WayBill;
import com.platform.dto.model.CancelledDeliveryReportModel;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

public class CancelledDeliveryReportAction implements Action {

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	 					error 				= null;
		Executive        							executive         	= null;
		SimpleDateFormat 							sdf               	= null;
		Timestamp        							fromDate          	= null;
		Timestamp        							toDate            	= null;
		ValueObject 								objectIn 			= null;
		ValueObject 								objectOut 			= null;
		CacheManip									cache				= null;
		CancelledDeliveryReportModel[] 				reportModel 		= null;
		Long[]										wayBillIdArr		= null;
		String 										wayBillIds 			= null;
		HashMap<Long, ConsignmentSummary>			conSumHM			= null;
		ConsignmentSummary							consignmentSummary	= null;
		HashMap<Long, WayBill>						wayBillBookDataColl	= null;
		HashMap<Long, WayBill>						wayBillRcveDataColl	= null;
		var branchId		= 0L;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error))
				return;
			new InitializeCancelledDeliveryReportAction().execute(request, response);

			sdf			= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			fromDate	= new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00").getTime());
			toDate		= new Timestamp(sdf.parse(JSPUtility.GetString(request, "toDate") + " 23:59:59").getTime());
			objectIn	= new ValueObject();
			objectOut	= new ValueObject();
			cache		= new CacheManip(request);
			executive	= cache.getExecutive(request);

			ActionStaticUtil.executiveTypeWiseBranches(request, cache, executive);

			if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_GROUPADMIN || executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_REGIONADMIN || executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_SUBREGIONADMIN)
				branchId = Long.parseLong(request.getParameter("branch"));
			else
				branchId = executive.getBranchId();

			objectIn.put("branchId", branchId);
			objectIn.put("accountGroupId", executive.getAccountGroupId());
			objectIn.put("fromDate", fromDate);
			objectIn.put("toDate", toDate);

			objectOut = CancelledDeliveryReportDao.getInstance().getCancelledDeliveryDetails(getWhereClause(objectIn));

			if(objectOut != null) {
				reportModel = (CancelledDeliveryReportModel[])objectOut.get("CancelledDeliveryReport");
				wayBillIdArr= (Long[])objectOut.get("WayBillIdArray");

				if(reportModel != null && wayBillIdArr != null) {

					wayBillIds = Utility.GetLongArrayToString(wayBillIdArr);

					conSumHM	= ConsignmentSummaryDao.getInstance().getLimitedConsignmentDetails(wayBillIds);
					wayBillBookDataColl = WayBillHistoryDao.getInstance().getWayBillDetailsByStatus(wayBillIds, WayBillStatusConstant.WAYBILL_STATUS_BOOKED);
					wayBillRcveDataColl = WayBillHistoryDao.getInstance().getWayBillDetailsByStatus(wayBillIds, WayBillStatusConstant.WAYBILL_STATUS_RECEIVED);

					for (final CancelledDeliveryReportModel element : reportModel) {
						element.setSourceBranch(cache.getGenericBranchDetailCache(request,element.getSourceBranchId()).getName());

						if (element.getDestinationBranchId() > 0 )
							element.setDestinationBranch(cache.getGenericBranchDetailCache(request,element.getDestinationBranchId()).getName());
						else
							element.setDestinationBranch(element.getDeliveryPlace());

						consignmentSummary = conSumHM.get(element.getWayBillId());
						element.setActualWeight(consignmentSummary.getActualWeight());
						element.setQuantity(consignmentSummary.getQuantity());

						element.setBookDateTime(wayBillBookDataColl.get(element.getWayBillId()).getCreationDateTimeStamp());
						element.setReceivDateTime(wayBillRcveDataColl.get(element.getWayBillId()).getCreationDateTimeStamp());

						if(!ObjectUtils.isEmpty(WayBillStatusConstant.getStatus(element.getLrCurrentStatusId())))
							element.setLrCurrentStatusString(WayBillStatusConstant.getStatus(element.getLrCurrentStatusId()));
						else
							element.setLrCurrentStatusString("--");
					}

					request.setAttribute("CancelledDeliveryReport",reportModel);

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
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}
	}

	private String getWhereClause(final ValueObject valueInObject) throws Exception {
		try {
			final var	whereClause	= new StringJoiner(" AND ");

			whereClause.add("WB.CreationDateTimeStamp >= '" + valueInObject.get("fromDate") + "'");
			whereClause.add("WB.CreationDateTimeStamp <= '" + valueInObject.get("toDate") + "'");
			whereClause.add("WB.status = 15 ");

			if(valueInObject.getLong("branchId") > 0)
				whereClause.add("WB.BranchId = " + valueInObject.getLong("branchId"));

			if(valueInObject.getLong("accountGroupId") > 0)
				whereClause.add("WB.AccountGroupId = " + valueInObject.get("accountGroupId"));

			return whereClause.toString();
		} catch (final Exception e) {
			e.printStackTrace();
			throw e;
		}
	}

}