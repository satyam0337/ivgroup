/**
 *
 */
package com.ivcargo.actions.shortexcess;

import java.io.PrintWriter;
import java.util.ArrayList;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.ObjectUtils;
import org.json.JSONObject;

import com.businesslogic.shortexcess.ArticleDetailsBLL;
import com.framework.Action;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.exception.ExceptionProcess;
import com.ivcargo.utils.JsonUtility;
import com.platform.dto.AliasNameConstants;
import com.platform.dto.ConsignmentDetails;
import com.platform.dto.Executive;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Converter;
import com.platform.utils.Utility;

/**
 * @author Shailesh Khandare	09-01-2016
 *
 */
public class ArticleDetails implements Action {

	private static final String TRACE_ID = "ArticleDetails";

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		PrintWriter					out								= null;
		JSONObject					jsonObjectOut					= null;
		short						filter							= 0;

		try {
			response.setContentType("application/json");
			out = response.getWriter();

			final var	jsonObjectIn 		= new JSONObject(request.getParameter("json"));
			jsonObjectOut		= new JSONObject();

			filter				= Utility.getShort(jsonObjectIn.get("Filter"));

			final var	exec  	= (Executive) request.getSession().getAttribute("executive");

			if(exec == null) {
				jsonObjectOut.put("errorDescription", "You have been logged out. Please login again.");
				out.println(jsonObjectOut);
				return;
			}

			switch (filter) {
			case 1 -> out.println(getArticleDetailsByWaybillId(request, jsonObjectOut, jsonObjectIn, exec));
			case 2 -> out.println(updateExcessArticleTypeByWaybillId(jsonObjectOut, jsonObjectIn, exec));
			case 3 -> out.println(getWaybillIdByShortReceiveId(jsonObjectIn, exec));
			case 4 -> out.println(getArticleDetailsByDispatchLedger(jsonObjectIn));
			default -> {
				jsonObjectOut.put("errorDescription", "You have been logged out. Please login again.");
				out.println(jsonObjectOut);
			}
			}
		} catch (final Exception e) {
			try {
				jsonObjectOut			= new JSONObject();
				jsonObjectOut.put("errorCode", CargoErrorList.SYSTEM_ERROR);
				jsonObjectOut.put("errorDescription", CargoErrorList.SYSTEM_ERROR_DESCRIPTION);
			} catch (final Exception e1) {
				ExceptionProcess.execute(e, TRACE_ID);
			}
			out.println(jsonObjectOut);
		} finally {
			out.flush();
			out.close();
		}
	}

	private JSONObject getWaybillIdByShortReceiveId(final JSONObject jsonObjectIn, final Executive exec) throws Exception {
		try {
			final var	articleDetailsBll 		= new ArticleDetailsBLL();

			final var	valObjIn				= JsonUtility.convertJsontoValueObject(jsonObjectIn);

			valObjIn.put(AliasNameConstants.EXECUTIVE, exec);

			final var	valueObjectFromBLL	= articleDetailsBll.getWaybillNumberByShortReceiveId(valObjIn);

			return JsonUtility.convertionToJsonObjectForResponse(valueObjectFromBLL);
		} catch(final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private JSONObject updateExcessArticleTypeByWaybillId(final JSONObject jsonObjectOut, final JSONObject jsonObjectIn, final Executive exec) throws Exception {
		try {
			final var	valueObjectToBLL	 	= new ValueObject();
			final var	articleDetailsBll 		= new ArticleDetailsBLL();

			valueObjectToBLL.put("excessId", jsonObjectIn.optLong("Excess", 0));
			valueObjectToBLL.put("packingTypeId", Utility.getLong(jsonObjectIn.get("PackingTypes")));
			valueObjectToBLL.put("accountgroupid", exec.getAccountGroupId());

			final var	count = articleDetailsBll.updateExcessAricletype(valueObjectToBLL);

			if(count > 0 )
				jsonObjectOut.put("SUCESS","SUCESS");

			return jsonObjectOut;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	@SuppressWarnings("unchecked")
	private JSONObject getArticleDetailsByWaybillId(final HttpServletRequest request, final JSONObject jsonObjectOut, final JSONObject jsonObjectIn, final Executive exec) throws Exception {
		try {
			final var	valueObjectIn	= new ValueObject();

			valueObjectIn.put("wayBillId", jsonObjectIn.optLong("WayBillID", 0));
			valueObjectIn.put(AliasNameConstants.EXECUTIVE, exec);

			final var	articleDetailsBll			= new ArticleDetailsBLL();

			final var	valueObjectOut	= articleDetailsBll.getArticleDetails(valueObjectIn);

			if(valueObjectOut == null) {
				request.setAttribute("nextPageToken", "failure");
				jsonObjectOut.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				return jsonObjectOut;
			}

			final var	consDtlsList	= (ArrayList<ConsignmentDetails>) valueObjectOut.get("conDtlsList");

			if(consDtlsList != null && consDtlsList.size() > 0)
				jsonObjectOut.put("consDtlsListColl", Converter.dtoArrayListtoArrayListWithHashMapConversion(consDtlsList));

			jsonObjectOut.put("executive", new JSONObject(exec));

			return 	jsonObjectOut;
		} catch(final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private JSONObject getArticleDetailsByDispatchLedger(final JSONObject jsonObjectIn) throws Exception {
		try {
			final var	articleDetailsBLL		= new ArticleDetailsBLL();
			final var	valueObjectOut			= new ValueObject();

			final var	wayBillId 			= jsonObjectIn.optLong("WayBillId", 0);
			final var	dispatchLedgerId 	= jsonObjectIn.optLong("DispatchLedgerId", 0);

			final var	dispatchArticleDetailsArray	= articleDetailsBLL.getDispatchArticleDetailsByWayBill(dispatchLedgerId, wayBillId);

			if(ObjectUtils.isEmpty(dispatchArticleDetailsArray))
				valueObjectOut.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.REPORT_ERROR_DESCRIPTION);
			else
				valueObjectOut.put("dispatchArtDetCollection", Converter.arrayDtotoArrayListWithHashMapConversion(dispatchArticleDetailsArray));

			return JsonUtility.convertionToJsonObjectForResponse(valueObjectOut);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}
}
