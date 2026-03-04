package com.ivcargo.b2c;

import java.io.PrintWriter;
import java.util.ArrayList;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.logsapp.LogWriter;
import com.iv.utils.dataObject.ValueObject;
import com.platform.dao.b2c.BranchLocatorDao;

public class PopulateBranchesForCityAction implements Action{

	private static final String TRACE_ID = "PopulateBranchesForCityAction";

	@SuppressWarnings("unchecked")
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		// TODO Auto-generated method stub

		String accountGroupId	= null;
		String html				= null;
		String cityId 			= null;
		String stateId 			= null;
		//		String cityName 		= null;
		String stateName 		= null;

		String 		name 		= null;
		String[] 	nameonly 	= null;
		String 		blurIframe 	= null;

		ValueObject valObjIn 	= null;
		ValueObject valObjOut 	= null;

		ArrayList<String>  		branchMap= null;
		int colspan;
		try {

			accountGroupId	= request.getParameter("accountGroupId");
			cityId			= request.getParameter("cityId");
			//			cityName 		= request.getParameter("cityName");
			stateId 		= request.getParameter("stateId");
			stateName 		= request.getParameter("stateName");

			blurIframe 	= "";
			blurIframe += "<div id=\"shadow\" class=\"opaqueLayer\"></div><div id=\"question\" style=\"left:40%; width: 200px;height: 20px; font-weight: bold;\" class=\"questionLayer\">Please wait....</div>";
			blurIframe += "<script type=\"text/javascript\"> function getBrowserHeight() {var intH = 20;var intW = 20;intH = document.body.clientHeight ; intW = document.body.clientWidth ; return { width: parseInt(intW), height: parseInt(intH) }; } function setLayerPosition() {var shadow = document.getElementById(\"shadow\");var question = document.getElementById(\"question\");var bws = getBrowserHeight();shadow.style.width = bws.width + \"px\";shadow.style.height = bws.height + \"px\";question.style.left = parseInt((bws.width - 350) / 2);question.style.top = parseInt((bws.height - 200) / 2);shadow = null;question = null; } function showLayer() {setLayerPosition();var shadow = document.getElementById(\"shadow\");var question = document.getElementById(\"question\");shadow.style.display = \"block\";question.style.display = \"block\";shadow = null;question = null;             } function hideLayer() { var shadow = document.getElementById(\"shadow\");var question = document.getElementById(\"question\");shadow.style.display = \"none\";question.style.display = \"none\";shadow = null;question = null; }window.onresize = setLayerPosition; </script>";
			blurIframe += "<style>.opaqueLayer { display:none; position:absolute; top:0px; left:0px; opacity:0.6; filter:alpha(opacity=60); background-color: #000000; z-Index:1000; } .questionLayer { position:absolute; top:250px; left:325px; width:350px; height:50px; display:none; z-Index:1001; border:2px solid black; background-color:#FFFFFF; text-align:center; vertical-align:middle; padding:10px; }</style>";

			valObjIn 	= new ValueObject();
			valObjIn.put("accountGroupId",accountGroupId);
			valObjIn.put("cityId",cityId);
			valObjIn.put("stateId",stateId);

			valObjOut 	= new ValueObject();
			valObjOut 	= BranchLocatorDao.getInstance().populateBranchesForState(valObjIn);

			colspan = 2;
			html 	= "";

			if(valObjOut != null){

				if(valObjOut.get("branchMap") != null){

					branchMap =  (ArrayList<String>) valObjOut.get("branchMap");
					html += blurIframe;
					html += "<style>" +
							".carve{border:0px solid;border-radius:15px;-moz-border-radius:15px; /* Old Firefox */} </style> "
							+"<div style=\"background-color:white; width :100% ;text-align:left;position: fixed;top: 0px \"><a onclick=\"showLayer()\" align=\"right\" class=\"branches\" href=\""+request.getContextPath()+"/ivcargo/Ajax.do?pageId=9&eventId=4&accountGroupId="+accountGroupId+"\" style=\"font-size: 13px;font-style: italic;font-weight: bold;font-family: arial,helvetica,sans-serif\">Home</a>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+
							"<strong><font size=\"2\" face=\"Arial, Helvetica, sans-serif\">" +
							"<img src=\""+request.getContextPath()+"/images/b2c/arrow.gif\" width=\"9\" height=\"9\">"+
							"<a onclick=\"showLayer()\" id=\"State\" class=\"branches\" href=\""+request.getContextPath()+"/ivcargo/Ajax.do?pageId=9&eventId=7&accountGroupId=201&filter=4&stateId="+stateId+"\">&nbsp;View / Download Branches In "+stateName != null ? stateName.toUpperCase() : ""+"</a></font></strong>&nbsp;&nbsp;&nbsp;&nbsp;"+
							"</font></strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+
							"<a onclick=\"showLayer();window.history.back()\" href=\"javascript:history.go(-1);return true;\" value=\"Back\" type=\"button\" style=\"font-size: 13px;font-style: italic;font-weight: bold;font-family: arial,helvetica,sans-serif\">Back</a>";

					html +="</div><div><br></div>" +
							"<table class=\"carve\" id=\"reportData\" border=\"0\" width=\"460\" border=\"0\" cellpadding=\"7\" cellspacing=\"0\" bordercolor=\"#F8F8F8\" class=\"branches\">";

					/*html +="<td colspan=\"3\"  width=\"160\"><strong><font size=\"2\" face=\"Arial, Helvetica, sans-serif\"><img src=\""+request.getContextPath()+"/images/b2c/arrow.gif\" width=\"9\" height=\"9\">";
					html +="<a id=\"City\" class=\"branches\" href=\""+request.getContextPath()+"/ivcargo/Ajax.do?pageId=9&eventId=7&accountGroupId=201&filter=4&cityId="+stateId+"\">All Branches Details in City</a></font></strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
					html +="<strong><font size=\"2\" face=\"Arial, Helvetica, sans-serif\"><a align=\"right\" class=\"branches\" href=\""+request.getContextPath()+"/ivcargo/Ajax.do?pageId=9&eventId=4&accountGroupId="+accountGroupId+"\" style=\"font-size: 13px;font-style: italic;font-weight: bold;font-family: arial,helvetica,sans-serif\">Branch Locator Home</a></font></strong>" +
							"</td></tr>";
					html +="<tr>"+
							"<td height=\"10\" colspan=\"3\" bgcolor=\"#DDA0DD\"> <div align=\"center\"><strong><font size=\"2\" face=\"Arial, Helvetica, sans-serif\">";
					html +="All Branch in " +cityName;
					html +="</font></strong></div></td></tr>";*/

					html +="<tr>"+
							"<td class=\"carve\" height=\"10\" colspan=\""+colspan+"\" bgcolor=\"#DDA0DD\"> <div align=\"center\"><strong><font size=\"2\" face=\"Arial, Helvetica, sans-serif\">";
					html +="All Branch in "+stateName;
					html +="</font></strong></div></td></tr>";

					for(int i = 0 ; i < branchMap.size() ; i++){

						name 		= branchMap.get(i);
						nameonly 	= name.split(":");

						if( i % colspan == 0 ){
							html +="</tr><tr>";
						}

						html +="<td width=\"160\"><font size=\"2\" face=\"Arial, Helvetica, sans-serif\"><img src=\""+request.getContextPath()+"/images/b2c/arrow.gif\" width=\"9\" height=\"9\">";
						html +="<a onclick=\"showLayer()\" id=\""+name+"\" href=\""+request.getContextPath()+"/ivcargo/Ajax.do?pageId=9&eventId=7&accountGroupId=201&filter=1&branchId="+nameonly[1]+"&branchName="+nameonly[0]+"\" class=\"branches\">&nbsp;"+nameonly[0]+"</a></font></td>";
					}

					html +="</tr>";
					html +="</table>";

					//LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_DEBUG,"","html" +html);
				}else{
				}
			}else{
			}

			response.setContentType("text/html");
			PrintWriter out = response.getWriter();
			out.println(html);
			out.flush();
			out.close();

		} catch (Exception _e) {

			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, _e);

		}finally{

			accountGroupId	= null;
			html			= null;
			cityId 			= null;
			stateId 		= null;
			//			cityName 		= null;
			stateName 		= null;
			name 			= null;
			nameonly 		= null;
			valObjIn 		= null;
			valObjOut 		= null;
			branchMap		= null;

		}
	}
}