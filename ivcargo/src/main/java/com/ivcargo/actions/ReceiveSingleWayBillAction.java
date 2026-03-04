package com.ivcargo.actions;

import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.ReceivablesBLL;
import com.businesslogic.waybill.LRViewScreenBLL;
import com.framework.Action;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.utils.constant.properties.ReceiveConfigurationPropertiesConstant;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.exception.ExceptionProcess;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.actions.transport.TransportReceivedWayBillAction;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.ConsignmentSummaryDao;
import com.platform.dao.GodownDao;
import com.platform.dao.ReceivedSummaryDao;
import com.platform.dto.ConsignmentSummary;
import com.platform.dto.Executive;
import com.platform.dto.Godown;
import com.platform.dto.ReceiveSummaryData;
import com.platform.dto.TransportCommonMaster;
import com.platform.resource.CargoErrorList;

public class ReceiveSingleWayBillAction implements Action {

	public static final String TRACE_ID  = "ReceiveSingleWayBillAction";
	boolean flag = true;
	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {

		HashMap<String, Object>	 	error 					= null;
		String 						wbToReceivedAsString 	= null;
		ValueObject					valueInObject			= null;
		ValueObject					valueOutObject			= null;
		String						status					= null;
		long						wayBillId		= 0;
		long					dispatchLedgerWayBillCount	= 0;
		long					dispatchLedgerId			= 0;
		HashMap<Long, ReceiveSummaryData>	receiveSummaryDataArr 		= null;
		ConsignmentSummary					consignmentSummary			= null;
		Godown[]							godownList					= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final CacheManip	cache 		= new CacheManip(request);
			final Executive		executive 	= cache.getExecutive(request);

			wbToReceivedAsString 		= request.getParameter("wayBillId");
			wayBillId					= Long.parseLong(wbToReceivedAsString);
			dispatchLedgerWayBillCount	= Long.parseLong(request.getParameter("dispatchLedgerWayBillCount"));
			dispatchLedgerId 			= Long.parseLong(request.getParameter("dispatchLedgerId"));

			final StringBuilder	wayBillIdToReceive			= new StringBuilder();
			wayBillIdToReceive.append(wayBillId);

			final boolean	isWayBillAllowForReceive			= ReceivedSummaryDao.getInstance().checkWayBillsForReceive(wayBillIdToReceive.toString(), dispatchLedgerId);
			final boolean	transportSearchModuleForCargo		= cache.getTransportSearchModuleForCargo(request, executive.getAccountGroupId());

			if(isWayBillAllowForReceive) {
				valueInObject	= new ValueObject();

				valueInObject.put("WayBillCount", 1);
				valueInObject.put("wayBillToReceived", wbToReceivedAsString);
				valueInObject.put("DispatchLedgerWayBillCounter", dispatchLedgerWayBillCount);
				valueInObject.put("DispatchLedgerId", dispatchLedgerId);
				valueInObject.put("executive", executive);
				valueInObject.put(ReceiveConfigurationPropertiesConstant.RECEIVE_CONFIGUARTION, cache.getReceiveConfiguration(request, executive.getAccountGroupId()));

				new TransportReceivedWayBillAction().setExtraData(request, cache, valueInObject, executive);

				consignmentSummary	= ConsignmentSummaryDao.getInstance().getConsignmentSummary(wayBillId);
				godownList			= GodownDao.getInstance().getGodownList(executive.getBranchId(), executive.getAccountGroupId());

				if(godownList != null && godownList.length > 0) {
					receiveSummaryDataArr	= new HashMap<>();
					receiveSummaryDataArr.put(wayBillId, receiveSummaryDataDTO(consignmentSummary, godownList[0], wayBillId));
				}

				valueInObject.put("receiveSummaryDataArr", receiveSummaryDataArr);

				valueOutObject	= ReceivablesBLL.getInstance().receivedWayBills(valueInObject);
				status			= (String)valueOutObject.get("status");

				if("success".equals(status)) {
					final Map<Object, Object>	configuration		= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.LR_SEARCH);

					if(LRViewScreenBLL.getInstance().checkExistanceOfExecutiveIdToReceiveAndDeliverLR(configuration, executive))
						flag = false;

					if(transportSearchModuleForCargo)
						response.sendRedirect("editWaybill.do?pageId=3&eventId=8&wayBillId="+ wayBillId +"&flag="+flag);
					else
						response.sendRedirect("SearchWayBill.do?pageId=2&eventId=6&wayBillId="+wayBillId+"&flag="+flag);

				} else {
					error.put("errorCode", CargoErrorList.RECEIVE_ERROR);
					error.put("errorDescription", CargoErrorList.RECEIVE_ERROR_DESCRIPTION);
					request.setAttribute("cargoError", error);
					request.setAttribute("nextPageToken", "failure");
				}
			} else {
				error.put("errorCode", CargoErrorList.DUPLICATE_RECEIVE_ERROR);
				error.put("errorDescription", CargoErrorList.DUPLICATE_RECEIVE_ERROR_DESCRIPTION );
				request.setAttribute("cargoError", error);
				request.setAttribute("nextPageToken", "failure");
			}

		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}
	}

	public ReceiveSummaryData receiveSummaryDataDTO(ConsignmentSummary consignmentSummary, Godown godown, long wayBillId) throws Exception {
		ReceiveSummaryData		receiveSummaryData		= null;

		try {
			receiveSummaryData = new ReceiveSummaryData();

			receiveSummaryData.setActualUnloadWeight(consignmentSummary.getActualWeight());
			receiveSummaryData.setNoOfPackages((int) consignmentSummary.getQuantity());
			receiveSummaryData.setActualWeight(consignmentSummary.getActualWeight());
			receiveSummaryData.setGodownId(godown.getGodownId());
			receiveSummaryData.setUnloadedByHamalId(TransportCommonMaster.LOADED_BY_OUR_ID);
			receiveSummaryData.setUnloadedInId(TransportCommonMaster.UNLOADED_IN_GODOWN_ID);
			receiveSummaryData.setWayBillId(wayBillId);

			return receiveSummaryData;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}
}