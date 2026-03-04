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

import com.businesslogic.shortexcess.ExcessReceiveSettlementBLL;
import com.framework.Action;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.logsapp.LogWriter;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.ConstantsValue;
import com.platform.dto.Executive;
import com.platform.dto.shortexcess.ShortReceiveArticles;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

/**
 * @author Anant Chaudhary	20-10-2015
 *
 */
public class SaveExcessSettlementDataAction implements Action {

	public static final String	TRACE_ID = "SaveExcessSettlementDataAction";

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		// TODO Auto-generated method stub
		HashMap<String,Object>	 			error 				= null;
		PrintWriter 						out					= null;
		JSONObject 							getJsonObject 		= null;
		JSONObject 							outJsonObject		= null;
		Executive							executive			= null;
		short								settlementType		= 0;
		ValueObject							valueObjectIn		= null;
		ExcessReceiveSettlementBLL 			excessSettlementBLL	= null;
		var								isSuccess			= false;
		JSONArray							jsonArray			= null;
		JSONObject							newJsonObject		= null;
		ShortReceiveArticles				shArticles			= null;
		ArrayList<ShortReceiveArticles> 	shortArtList		= null;
		var 								totalShort			= 0L;
		var 								pendingExcess		= 0L;
		var 								totalWeight			= 0L;

		try {

			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error))
				return;


			valueObjectIn	= new ValueObject();
			getJsonObject	= new JSONObject(request.getParameter("json"));
			outJsonObject	= new JSONObject();
			shortArtList	= new ArrayList<>();

			final var cacheManip = new CacheManip(request);
			executive	= (Executive) request.getSession().getAttribute("executive");

			response.setContentType("application/json");

			out 	= response.getWriter();

			settlementType	= Utility.getShort(getJsonObject.get("SettleType"));

			valueObjectIn.put("excessReceiveId", Utility.getLong(getJsonObject.get("ExcessReceiveId")));

			if(getJsonObject.get("WayBillNumber").toString().isEmpty())
				valueObjectIn.put("wayBillNumber", null);
			else
				valueObjectIn.put("wayBillNumber", getJsonObject.get("WayBillNumber"));

			pendingExcess =  Utility.getLong(getJsonObject.get("PendingExcess"));

			valueObjectIn.put("PendingExcess", pendingExcess);
			valueObjectIn.put("wayBillId", Utility.getLong(getJsonObject.get("WayBillId")));
			valueObjectIn.put("settlementType", settlementType);
			valueObjectIn.put("packingTypeMasterId", Utility.getLong(getJsonObject.get("ArticleTypeMasterId")));

			switch (settlementType) {
			case ConstantsValue.SETTLE_WITH_SHORT:
				jsonArray = getJsonObject.getJSONArray("ShortArtArray");
				for(var i = 0; i < jsonArray.length(); i++) {
					newJsonObject	= jsonArray.getJSONObject(i);

					shArticles		= new ShortReceiveArticles();

					shArticles.setShortReceiveId(Utility.getLong(newJsonObject.get("ShortNumber")));
					shArticles.setShortArticle(Utility.getLong(newJsonObject.get("ShortArticle")));
					shArticles.setShortWeight(Utility.getDouble(newJsonObject.get("ShortWeight")));
					shArticles.setRemark((String) newJsonObject.get("Remark"));
					totalShort 	+= shArticles.getShortArticle();
					totalWeight += shArticles.getShortWeight();
					shortArtList.add(shArticles);
				}
				if(shortArtList != null) {
					valueObjectIn.put("shortArtList", shortArtList);
					valueObjectIn.put("totalShort", totalShort);
					valueObjectIn.put("totalWeight", totalWeight);
				}
				break;
			case ConstantsValue.SETTLE_WITH_FOCLR:
				valueObjectIn.put("newLRNumber", getJsonObject.get("NewLRNumber"));
				valueObjectIn.put("focWayBillId", Utility.getLong(getJsonObject.get("FocWayBillId")));
				valueObjectIn.put("remark", getJsonObject.get("FOCRemark"));
				break;
			case ConstantsValue.SETTLE_WITH_UGD:
				valueObjectIn.put("remark", getJsonObject.get("UGDRemark"));
				break;
			default:
				break;
			}

			valueObjectIn.put("barnchId", executive.getBranchId());
			valueObjectIn.put("executiveId", executive.getExecutiveId());
			valueObjectIn.put("accountGroupId", executive.getAccountGroupId());
			valueObjectIn.put("executive", executive);
			valueObjectIn.put("configuration", cacheManip.getOldConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.EXCESS_REGISTER_SETTLEMENT));

			excessSettlementBLL	= new ExcessReceiveSettlementBLL();

			isSuccess	= excessSettlementBLL.saveExcessSettlementData(valueObjectIn);

			if(isSuccess)
				outJsonObject.put("isSuccess", isSuccess);

			out.println(outJsonObject);

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
			getJsonObject 		= null;
			outJsonObject		= null;
			executive			= null;
			valueObjectIn		= null;
			excessSettlementBLL	= null;
			jsonArray			= null;
			newJsonObject		= null;
			shArticles			= null;
			shortArtList		= null;
		}
	}
}