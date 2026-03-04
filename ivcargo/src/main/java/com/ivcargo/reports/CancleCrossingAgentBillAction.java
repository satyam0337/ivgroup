package com.ivcargo.reports;

import java.sql.Connection;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.asyncsender.CancelCrossingAgentBillDataSender;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.dao.impl.crossingagentbill.CrossingAgentBillingChargesDaoImpl;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.properties.constant.CrossingAgentBillPropertiesConstant;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.exception.ExceptionProcess;
import com.iv.utils.utility.CollectionUtility;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.CancelCrossingAgentBillTxnCheckerDao;
import com.platform.dao.WayBillCrossingDao;
import com.platform.dao.reports.CrossingAgentBillDAO;
import com.platform.dto.CancelCrossingAgentBillTxnChecker;
import com.platform.dto.CrossingAgentBill;
import com.platform.dto.WayBillCrossing;
import com.platform.resource.CargoErrorList;
import com.platform.resource.ResourceManager;

public class CancleCrossingAgentBillAction implements Action {
	private static final String TRACE_ID = "CancleCrossingAgentBillAction";

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	 error 	= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	cManip		  	= new CacheManip(request);
			final var	executive 		= cManip.getExecutive(request);
			final var	billIdsStrArr	= request.getParameterValues("checkbox");
			var 		txnTypeId		= JSPUtility.GetShort(request, "txnId",(short)0);
			final var	cancelDateTime	= DateTimeUtility.getCurrentTimeStamp();

			final Map<Long, CancelCrossingAgentBillTxnChecker>	cancelCrossingAgentBillTxnCheckerHM		= new HashMap<>();
			final var	configuration	= cManip.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.CROSSING_AGENT_BILL);

			if(!(boolean) configuration.getOrDefault(CrossingAgentBillPropertiesConstant.IS_SHOW_CROSSING_AGENT_TYPE, false))
				txnTypeId = CrossingAgentBill.CROSSINGAGENTBILL_DELIVERY_ID;

			final var	str		= CollectionUtility.getStringFromStringArray(billIdsStrArr, ",");

			final List<CrossingAgentBill>	bills	= new ArrayList<>();

			for (final String element : billIdsStrArr) {
				final var cBill = new CrossingAgentBill();
				cBill.setCrossingAgentBillId(Long.parseLong(element));
				cBill.setStatus(CrossingAgentBill.CROSSINGAGENTBILL_CLEARANCE_STATUS_CANCELLED_ID);
				cBill.setCancellationDateTimeStamp(cancelDateTime);
				cBill.setExecutiveId(executive.getExecutiveId());
				cBill.setBranchId(executive.getBranchId());
				bills.add(cBill);
			}

			if(cancleBill(bills, str, txnTypeId) == 1) {
				if((boolean) configuration.getOrDefault(CrossingAgentBillPropertiesConstant.IS_ALLOW_CROSSING_AGENT_LEDGER,false)) {
					for (final CrossingAgentBill bill : bills) {
						final var	cancelCrossingAgentBillTxnChecker		= cancelCrossingAgentBillTxnChecker(bill.getCrossingAgentBillId(), bill.getBranchId());
						final var	cancelCrossingAgentBillTxnCheckerId  	= CancelCrossingAgentBillTxnCheckerDao.getInstance().insert(cancelCrossingAgentBillTxnChecker);
						cancelCrossingAgentBillTxnChecker.setCancelCrossingAgentBillTxnCheckerId(cancelCrossingAgentBillTxnCheckerId);
						cancelCrossingAgentBillTxnCheckerHM.put(cancelCrossingAgentBillTxnChecker.getCrossingAgentBillId(), cancelCrossingAgentBillTxnChecker);
					}

					final var	crossingAgentBillIdStr		= cancelCrossingAgentBillTxnCheckerHM.entrySet().stream().map(e -> e.getKey() + "").collect(Collectors.joining(","));
					final Map<Long, CrossingAgentBill>	crossingAgentBillIdWiseHM	= CrossingAgentBillDAO.getInstance().getCrossingAgentBillDetailsBycrossingAgentBillIds(crossingAgentBillIdStr);

					runThreadForCrossingAgentLedger(crossingAgentBillIdWiseHM, cancelCrossingAgentBillTxnCheckerHM);
				}

				response.sendRedirect("BillAfterCreation.do?pageId=249&eventId=4&successMsgAfterBillCancle=1");
			} else {
				error.put("errorCode", CargoErrorList.BILL_NUMBER_ERROR);
				error.put("errorDescription", CargoErrorList.BILL_NUMBER_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
				request.setAttribute("nextPageToken", "failure");
			}
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}
	}

	private void runThreadForCrossingAgentLedger(Map<Long, CrossingAgentBill> crossingAgentBillIdWiseHM,
			Map<Long, CancelCrossingAgentBillTxnChecker> cancelCrossingAgentBillTxnCheckerHM) {
		new Thread() {
			@Override
			public void run() {
				try {
					final var	cancelCrossingAgentBillDataSender		= new CancelCrossingAgentBillDataSender();

					for(final long crossingAgentBillId : cancelCrossingAgentBillTxnCheckerHM.keySet()) {
						cancelCrossingAgentBillDataSender.processCrossingAgentLedgerDataInsert(crossingAgentBillIdWiseHM.get(crossingAgentBillId), cancelCrossingAgentBillTxnCheckerHM.get(crossingAgentBillId), crossingAgentBillId);

						Thread.sleep(100);
					}
				} catch (final Exception e) {
					Thread.currentThread().interrupt();
					ExceptionProcess.execute(e, TRACE_ID);
				}
			}
		}.start();

	}

	private CancelCrossingAgentBillTxnChecker cancelCrossingAgentBillTxnChecker(long crossingAgentBillId, long branchId) throws Exception {
		try {
			final var	cancelCrossingAgentBillTxnChecker = new CancelCrossingAgentBillTxnChecker();

			cancelCrossingAgentBillTxnChecker.setCrossingAgentBillId(crossingAgentBillId);
			cancelCrossingAgentBillTxnChecker.setTxnInsertionDateTime(DateTimeUtility.getCurrentTimeStamp());
			cancelCrossingAgentBillTxnChecker.setBranchId(branchId);

			return cancelCrossingAgentBillTxnChecker;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}

	}

	public short cancleBill(final List<CrossingAgentBill> bills, final String billIds, final short txnTypeId) throws Exception {
		Connection conn = null;

		try {
			conn = ResourceManager.getConnection(TRACE_ID);
			conn.setAutoCommit(false);

			CrossingAgentBillDAO.getInstance().updateStatus(bills, conn);
			WayBillCrossingDao.getInstance().updateStatusForCancelBill(billIds, WayBillCrossing.CROSSINGAGENTBILL_STATUS_UNBILLED_ID, txnTypeId, conn);
			CrossingAgentBillingChargesDaoImpl.getInstance().updateStatusInCrossingAgentBillingCharges(billIds, WayBillCrossing.CROSSINGAGENTBILL_STATUS_UNBILLED_ID, conn);

			conn.commit();

			return (short)1;
		} catch (final Exception e) {
			if(conn != null) conn.rollback();
			throw e;
		} finally {
			ResourceManager.freeConnection(conn);
			conn = null;
		}
	}
}