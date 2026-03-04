package com.ivcargo.b2c;

import java.io.PrintWriter;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.logsapp.LogWriter;

public class BlurIframeAction implements Action{

	private static final String TRACE_ID = "LrSearchAjaxAction";

	public void execute(HttpServletRequest request, HttpServletResponse response) {
		// TODO Auto-generated method stub

		String wayBillNumber 		= null;
		String accountGroupId		= null;
		String html					= null;
		String blurIframe	 		= null;

		try {

			wayBillNumber 	= request.getParameter("wayBillNumber");
			accountGroupId	= request.getParameter("accountGroupId");

			html		= "";
			blurIframe 	= "";

			blurIframe += "<div id=\"shadow\" class=\"opaqueLayer\"></div><div id=\"question\" style=\"left:40%; width: 200px;height: 20px; font-weight: bold;\" class=\"questionLayer\">Please wait....</div>";
			blurIframe += "<script type=\"text/javascript\"> function getBrowserHeight() {var intH = 20 ; var intW = 20 ; intH = document.body.clientHeight ; intW = document.body.clientWidth ; return { width: parseInt(intW), height: parseInt(intH) }; } function setLayerPosition() {var shadow = document.getElementById(\"shadow\");var question = document.getElementById(\"question\");var bws = getBrowserHeight();shadow.style.width = bws.width + \"px\";shadow.style.height = bws.height + \"px\";question.style.left = parseInt((bws.width - 350) / 2);question.style.top = parseInt((bws.height - 200) / 2);shadow = null;question = null; } function showLayer() {setLayerPosition();var shadow = document.getElementById(\"shadow\");var question = document.getElementById(\"question\");shadow.style.display = \"block\";question.style.display = \"block\";shadow = null;question = null; } function hideLayer() { var shadow = document.getElementById(\"shadow\");var question = document.getElementById(\"question\");shadow.style.display = \"none\";question.style.display = \"none\";shadow = null;question = null; } window.onresize = setLayerPosition ;</script>";
			blurIframe += "<style> .opaqueLayer { display:none; position:absolute; top:0px; left:0px; opacity:0.6; filter:alpha(opacity=60); background-color: #000000; z-Index:1000; } .questionLayer { position:absolute; top:250px; left:325px; width:350px; height:50px; display:none; z-Index:1001; border:2px solid black; background-color:#FFFFFF; text-align:center; vertical-align:middle; padding:10px; }</style>";
			blurIframe += "<script type=\"text/javascript\">" +
					"showLayer(); " +
					"window.location = \""+request.getContextPath()+"/ivcargo/Ajax.do?pageId=9&eventId=3&wayBillNumber="+wayBillNumber+"&accountGroupId="+accountGroupId+"\" ;" +
					"</script>";

			html += blurIframe;
			html += "<tr><td><table><tr><td></td></tr></table></td></tr>";

			LogWriter.writeLog("TRACE_ID", LogWriter.LOG_LEVEL_DEBUG,"html" +html);

			response.setContentType("text/html");
			PrintWriter out = response.getWriter();
			out.println(html);
			out.flush();
			out.close();
		} catch (Exception _e) {
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, _e);
		}finally{
			
			wayBillNumber 		= null;
			accountGroupId		= null;
			blurIframe	 		= null;
			html				= null;
		}
	}
}