/**
 *
 */
package com.ivcargo.ajax;

import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.MarketingPersonBLL;
import com.framework.Action;
import com.iv.logsapp.LogWriter;
import com.iv.utils.dataObject.ValueObject;
import com.platform.dto.AliasNameConstants;
import com.platform.dto.Executive;

/**
 * @author Anant Chaudhary	04-08-2016
 *
 */
public class MarketingPersonAutocompleteAjaxAction implements Action {

	private static final String TRACE_ID = MarketingPersonAutocompleteAjaxAction.class.getName();
	/* (non-Javadoc)
	 * @see com.framework.Action#execute(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
	 */
	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {

		PrintWriter							out							= null;
		Executive							executive					= null;
		StringBuilder						strBfr						= null;
		ValueObject							valObjIn					= null;
		ArrayList<HashMap<Object, Object>> 	marketingPersonList			= null;
		String 								strQry 						= null;
		MarketingPersonBLL					marketingPersonBLL			= null;

		try {
			out = response.getWriter();
			response.setContentType("text/plain");

			strBfr				= new StringBuilder();
			valObjIn			= new ValueObject();
			marketingPersonBLL	= new MarketingPersonBLL();

			executive			= (Executive) request.getSession().getAttribute(AliasNameConstants.EXECUTIVE);

			valObjIn.put(AliasNameConstants.EXECUTIVE, executive);

			if (request.getParameter("?q") != null) {
				strQry 			= request.getParameter("?q");

				valObjIn.put("strQry", strQry);

				marketingPersonList 			= marketingPersonBLL.getMarketingPersonDetails(valObjIn);

				if (marketingPersonList != null)
					for (final HashMap<Object, Object> element : marketingPersonList)
						strBfr.append(element.get("label") + "|" + element.get("id") + "\n");
			} else
				strBfr.append("No data found !");

			out.println(strBfr.toString());
			out.flush();
		} catch (final Exception e) {
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_DEBUG," EXCEPTION : " +e);
		} finally {
			out.close();
			executive					= null;
			strBfr						= null;
			valObjIn					= null;
			marketingPersonList			= null;
			strQry 						= null;
			marketingPersonBLL			= null;
		}
	}
}