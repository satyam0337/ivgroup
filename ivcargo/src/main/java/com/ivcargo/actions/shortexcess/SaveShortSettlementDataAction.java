/**
 *
 */
package com.ivcargo.actions.shortexcess;

import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONObject;

import com.businesslogic.shortexcess.ShortReceiveSettlementBLL;
import com.framework.Action;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.logsapp.LogWriter;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.ConstantsValue;
import com.platform.dto.Executive;
import com.platform.dto.shortexcess.ExcessReceive;
import com.platform.dto.shortexcess.ShortReceive;
import com.platform.dto.shortexcess.ShortReceiveSettlement;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

/**
 * @author Anant Chaudhary	13-10-2015
 *
 */
public class SaveShortSettlementDataAction implements Action {

	public static final String TRACE_ID = "SaveShortSettlementDataAction";

	@Override
	@SuppressWarnings("unused")
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {

		HashMap<String,Object>	 	error 					= null;
		PrintWriter					out 					= null;
		JSONObject 					getJsonObject 			= null;
		JSONObject 					putJsonObject 			= null;
		Executive					executive				= null;
		short						settleType				= 0;
		ValueObject					valueObjectIn			= null;
		ShortReceiveSettlementBLL 	shortSettlementBLL		= null;
		var						isSuccess				= false;
		JSONArray					jsonArray				= null;
		JSONArray					jsonShortNumArray		= null;
		JSONObject					newJsonObject			= null;
		JSONObject					exJsonObject			= null;
		ExcessReceive				excessReceive			= null;
		ShortReceive				shReceive				= null;
		ShortReceiveSettlement		shReceiveStlmt			= null;
		ArrayList<ExcessReceive> 	excList					= null;
		ArrayList<ShortReceive> 	allShortNumList			= null;
		ArrayList<ShortReceiveSettlement> 	shList			= null;
		var 						totExcessArticle		= 0L;
		var 						totWeight				= 0L;

		try {

			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error))
				return;


			valueObjectIn				= new ValueObject();
			shortSettlementBLL			= new ShortReceiveSettlementBLL();
			putJsonObject				= new JSONObject();
			excList						= new ArrayList<>();
			allShortNumList				= new ArrayList<>();
			shList						= new ArrayList<>();

			final var cacheManip				= new CacheManip(request);
			executive 	= (Executive) request.getSession().getAttribute("executive");

			response.setContentType("application/json");

			out 	= response.getWriter();

			getJsonObject	= new JSONObject(request.getParameter("json"));

			valueObjectIn.put("shortReceiveId", Utility.getLong(getJsonObject.get("ShortNumber")));
			valueObjectIn.put("wayBillNumber", getJsonObject.get("WayBillNumber"));
			valueObjectIn.put("wayBillId", Utility.getLong(getJsonObject.get("WayBillId")));
			valueObjectIn.put("shortArticle", Utility.getLong(getJsonObject.get("ShortArticle")));
			valueObjectIn.put("pendingArticle", Utility.getLong(getJsonObject.get("PendingArticle")));
			valueObjectIn.put("ShortSettleStatus", Utility.getShort(getJsonObject.get("ShortSettleStatus")));

			settleType		= Utility.getShort(getJsonObject.get("SettleType"));

			valueObjectIn.put("settleType", settleType);
			valueObjectIn.put("packingTypeMasterId", Utility.getLong(getJsonObject.get("ArticleTypeMasterId")));
			valueObjectIn.put("FlagForShort", Utility.getBoolean(getJsonObject.get("FlagForShort")));

			switch (settleType) {
			case ConstantsValue.SETTLE_WITH_EXCESS -> {
				jsonArray = getJsonObject.getJSONArray("ExcessNumArray");

				for(var i = 0; i < jsonArray.length(); i++) {
					newJsonObject	= jsonArray.getJSONObject(i);

					excessReceive	= new ExcessReceive();

					excessReceive.setExcessReceiveId(Utility.getLong(newJsonObject.get("ExcessNumber")));
					excessReceive.setExcessArticle(Utility.getLong(newJsonObject.get("ExcessArticle")));
					excessReceive.setWeight(Utility.getDouble(newJsonObject.get("ExcessWeight")));
					excessReceive.setRemark((String) newJsonObject.get("Remark"));
					excessReceive.setBranchId(Utility.getLong(newJsonObject.get("BranchId")));

					totExcessArticle += excessReceive.getExcessArticle();
					totWeight		 +=	excessReceive.getWeight();
					excessReceive.setOtherOperator(true);

					excList.add(excessReceive);
				}
				if(excList != null && excList.size() > 0) {
					valueObjectIn.put("excList", excList);
					valueObjectIn.put("totExcessArticle", totExcessArticle);
					valueObjectIn.put("totWeight", totWeight);
				}
				if(Utility.getBoolean(getJsonObject.get("FlagForShort"))) {
					jsonShortNumArray = getJsonObject.getJSONArray("ShortNumArray");

					for(var i = 0; i < jsonShortNumArray.length(); i++) {
						shReceive       = new ShortReceive();

						exJsonObject		=  jsonShortNumArray.getJSONObject(i);

						shReceive.setWayBillNumber(exJsonObject.get("WayBillNumber")+"");
						shReceive.setWayBillId(Utility.getLong(exJsonObject.get("WayBillID")));
						shReceive.setLsNumber(exJsonObject.get("LsNumber")+"");
						shReceive.setDispatchLedgerId(Utility.getLong(exJsonObject.get("DispatchLedgerId")));
						shReceive.setTurNumber(exJsonObject.get("TurNumber") + "");
						shReceive.setPrivateMark("");
						shReceive.setRemark(excList.get(0).getRemark());
						shReceive.setBranchId(Utility.getLong(exJsonObject.get("BranchID")));
						shReceive.setExecutiveId(0);
						shReceive.setAccountGroupId(executive.getAccountGroupId());
						shReceive.setShortReceiveId(Utility.getLong(exJsonObject.get("ShortNumb")));
						shReceive.setShortArticle(Utility.getLong(exJsonObject.get("ShortArticle")));
						allShortNumList.add(shReceive);
					}

					if(allShortNumList != null && allShortNumList.size() > 0)
						valueObjectIn.put("allShortNumList", allShortNumList);
				}
			}
			case ConstantsValue.SETTLE_WITH_CLAIM -> {
				valueObjectIn.put("claimNumber", Utility.getLong(getJsonObject.get("ClaimNumber")));
				valueObjectIn.put("remark", getJsonObject.get("ClaimRemark"));
				if(Utility.getBoolean(getJsonObject.get("FlagForShort"))) {
					jsonShortNumArray = getJsonObject.getJSONArray("ShortNumArray");

					for(var i = 0; i < jsonShortNumArray.length(); i++) {
						shReceiveStlmt       = new ShortReceiveSettlement();
						exJsonObject		=  jsonShortNumArray.getJSONObject(i);

						shReceiveStlmt.setWayBillNumber(exJsonObject.get("WayBillNumber")+"");
						shReceiveStlmt.setWayBillId(Utility.getLong(exJsonObject.get("WayBillID")));
						shReceiveStlmt.setRemark(null);
						shReceiveStlmt.setBranchId(Utility.getLong(exJsonObject.get("BranchID")));
						shReceiveStlmt.setExecutiveId(0);
						shReceiveStlmt.setAccountGroupId(executive.getAccountGroupId());
						shReceiveStlmt.setShortReceiveId(Utility.getLong(exJsonObject.get("ShortNumb")));

						shList.add(shReceiveStlmt);
					}

					if(shList != null && shList.size() > 0)
						valueObjectIn.put("shList", shList);
				}
			}
			case ConstantsValue.SETTLE_WITH_NOCLAIM -> valueObjectIn.put("remark", getJsonObject.get("RemarkWitoutClaim"));
			default -> {
				break;
			}
			}

			valueObjectIn.put("branchId", executive.getBranchId());
			valueObjectIn.put("executiveId", executive.getExecutiveId());
			valueObjectIn.put("accountGroupId", executive.getAccountGroupId());
			valueObjectIn.put("executive", executive);
			valueObjectIn.put("configuration", cacheManip.getOldConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.PENDING_SHORT_REGISTER_SETTLEMENT));
			valueObjectIn.put("shortSettlementConfigurationHM", cacheManip.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.SHORT_REGISTER_SETTLEMENT));
			isSuccess	= shortSettlementBLL.saveShortSettlementData(valueObjectIn);

			if(isSuccess)
				putJsonObject.put("isSuccess", isSuccess);

			out.println(putJsonObject);

		} catch (final Exception e) {
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, "error = "+e.getMessage());
			error.put("errorCode", CargoErrorList.SYSTEM_ERROR);
			error.put("errorDescription", CargoErrorList.SYSTEM_ERROR_DESCRIPTION);
			request.setAttribute("cargoError", error);
			request.setAttribute("nextPageToken", "failure");
		} finally {
			out.flush();
			out.close();
			out					= null;
			getJsonObject		= null;
			putJsonObject		= null;
			executive			= null;
			valueObjectIn		= null;
			shortSettlementBLL	= null;
			jsonArray			= null;
			newJsonObject		= null;
			excessReceive		= null;
			excList				= null;
		}
	}
}
