/**
 *
 */
package com.ivcargo.actions.shortexcess;

import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.Objects;
import java.util.StringJoiner;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONObject;

import com.businesslogic.shortexcess.DamageReceiveSettlementBLL;
import com.framework.Action;
import com.iv.bll.impl.properties.SyncWithNexusConfigurationBllImpl;
import com.iv.bll.utils.services.SyncWithNexusBllImpl;
import com.iv.constant.properties.master.SyncWithNexusPropertiesConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.logsapp.LogWriter;
import com.iv.resource.ResourceManager;
import com.iv.tce.dao.impl.PendingTransferLRDetailsDaoImpl;
import com.iv.tce.dao.impl.api.ShortExcessDamageReceiveReqResTCEDaoImpl;
import com.iv.tce.modal.ShortExcessDamageReceiveReqtResTCE;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.exception.ExceptionProcess;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.WayBillDao;
import com.platform.dto.ConstantsValue;
import com.platform.dto.Executive;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

/**
 * @author Anant Chaudhary	13-10-2015
 *
 */
public class SaveDamageSettlementDataAction implements Action {

	public static final String TRACE_ID = "SaveDamageSettlementDataAction";

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	 	error 					= null;
		PrintWriter					out 					= null;
		Connection   				conn       				= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	valueObjectIn		= new ValueObject();
			final var	damageSettlementBLL	= new DamageReceiveSettlementBLL();
			final var	putJsonObject		= new JSONObject();
			final var	cacheManip	= new CacheManip(request);
			final var	executive 	= cacheManip.getExecutive(request);

			response.setContentType("application/json");

			out 	= response.getWriter();

			final var	getJsonObject	= new JSONObject(request.getParameter("json"));

			valueObjectIn.put("damageReceiveId", Utility.getLong(getJsonObject.get("DamgeNumber")));
			valueObjectIn.put("wayBillNumber", getJsonObject.get("WayBillNumber"));
			valueObjectIn.put("wayBillId", Utility.getLong(getJsonObject.get("WayBillId")));

			final short	damageSettleStatus	= Utility.getShort(getJsonObject.get("DamageSettleStatus"));

			final var wayBill = WayBillDao.getInstance().getByWayBillId(Utility.getLong(getJsonObject.get("WayBillId")));

			valueObjectIn.put("damageSettleStatus", damageSettleStatus);

			final short	settleType		= Utility.getShort(getJsonObject.get("SettleType"));

			valueObjectIn.put("settleType", settleType);

			if(settleType == ConstantsValue.SETTLE_WITH_CLAIM) {
				valueObjectIn.put("claimNumber", Utility.getLong(getJsonObject.get("ClaimNumber")));
				valueObjectIn.put("remark", getJsonObject.get("ClaimRemark"));
			} else if(settleType == ConstantsValue.SETTLE_WITH_NOCLAIM)
				valueObjectIn.put("remark", getJsonObject.get("RemarkWitoutClaim"));

			valueObjectIn.put("branchId", executive.getBranchId());
			valueObjectIn.put("executiveId", executive.getExecutiveId());
			valueObjectIn.put("accountGroupId", executive.getAccountGroupId());
			valueObjectIn.put(Executive.EXECUTIVE, executive);
			valueObjectIn.put("configuration", cacheManip.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.DAMAGE_REGISTER_SETTLEMENT));

			final var	isSuccess	= damageSettlementBLL.saveDamageSettlementData(valueObjectIn);

			if(isSuccess) {
				if(wayBill.getIsTceBooking()) {
					final var whereClause	= new StringJoiner(" AND ");

					whereClause.add("pt.WayBillId = " + wayBill.getWayBillId());
					whereClause.add("pt.MarkForDelete = 0");

					conn = ResourceManager.getConnection();
					final var	pendingTransferDetails		 = PendingTransferLRDetailsDaoImpl.getInstance().getPendingWaybillsForTransfer(whereClause.toString(), conn);
					PendingTransferLRDetailsDaoImpl.getInstance().updateIsShortExcessReceived(pendingTransferDetails, true, conn);

					updateDamageSettlementDataToTrance(valueObjectIn, executive, conn);
				}

				putJsonObject.put("isSuccess", isSuccess);
			}

			out.println(putJsonObject);
		} catch (final Exception e) {
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, "error = "+e.getMessage());
			error.put("errorCode", CargoErrorList.SYSTEM_ERROR);
			error.put("errorDescription", CargoErrorList.SYSTEM_ERROR_DESCRIPTION);
			request.setAttribute("cargoError", error);
			request.setAttribute("nextPageToken", "failure");
		} finally {
			if(conn != null)
				try {
					ResourceManager.freeConnection(conn);
				} catch (final SQLException e) {
					e.printStackTrace();
				}
			out.flush();
			out.close();
		}
	}

	private void updateDamageSettlementDataToTrance(final ValueObject valueObjectIn, final Executive executive, final Connection conn) throws Exception {
		try {
			final var tcePropertyHm		= SyncWithNexusConfigurationBllImpl.getInstance().getSyncConfigurationProperty(0);

			final var	jsonObject	= new JSONObject(valueObjectIn);

			final var shortExcessDamageReceiveReqtRes = new ShortExcessDamageReceiveReqtResTCE();
			shortExcessDamageReceiveReqtRes.setAccountGroupId(executive.getAccountGroupId());
			shortExcessDamageReceiveReqtRes.setExecutiveId(executive.getExecutiveId());
			shortExcessDamageReceiveReqtRes.setRequestData(jsonObject.toString());
			shortExcessDamageReceiveReqtRes.setResponseData(null);
			shortExcessDamageReceiveReqtRes.setTxnDateTimeStamp(DateTimeUtility.getCurrentTimeStamp());
			shortExcessDamageReceiveReqtRes.setIsResponseReceived(false);
			shortExcessDamageReceiveReqtRes.setTypeOfReceive(ShortExcessDamageReceiveReqtResTCE.TYPE_DAMAGE_SETTLEMENT_RECEIVE);

			final var	requestId = ShortExcessDamageReceiveReqResTCEDaoImpl.getInstance().saveRequestResponse(shortExcessDamageReceiveReqtRes, conn);

			final var response	= SyncWithNexusBllImpl.getInstance().getResponseFromNexux(jsonObject, (String) tcePropertyHm.getOrDefault(SyncWithNexusPropertiesConstant.DAMAGE__RECEIVE_SETTLEMENT_URL, null), tcePropertyHm);

			if(Objects.nonNull(response))
				ShortExcessDamageReceiveReqResTCEDaoImpl.getInstance().updateResponse(requestId, response.toString(), true, conn);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}
}
