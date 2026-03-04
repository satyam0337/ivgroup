package com.ivcargo.b2c;

import java.io.PrintWriter;
import java.util.ArrayList;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.logsapp.LogWriter;
import com.iv.utils.dataObject.ValueObject;
import com.platform.dao.b2c.BranchLocatorDao;

public class PopulateStateAction implements Action{

	private static final String TRACE_ID = "PopulateStateAction";

	@SuppressWarnings("unchecked")
	public void execute(HttpServletRequest request, HttpServletResponse response) {

		String 		accountGroupId	= null;
		String 		html			= null;
		String 		name 			= null;
		String[] 	nameonly 		= null;
		String 		blurIframe 		= null;
		ValueObject valObjIn 		= null;
		ValueObject valObjOut		= null;

		ArrayList<String>	stateMap= null;

		try {

			accountGroupId	= request.getParameter("accountGroupId");

			valObjIn = new ValueObject();
			valObjIn.put("accountGroupId",accountGroupId);

			valObjOut =  new ValueObject();
			valObjOut = BranchLocatorDao.getInstance().populateState(valObjIn);

			blurIframe = "";
			blurIframe += "<div id=\"shadow\" class=\"opaqueLayer\"></div><div id=\"question\" style=\"left:40%; width: 200px;height: 20px; font-weight: bold;\" class=\"questionLayer\">Please wait....</div>";
			blurIframe += "<script type=\"text/javascript\"> function getBrowserHeight() {var intH = 20;var intW = 20;intH = document.body.clientHeight ; intW = document.body.clientWidth ; return { width: parseInt(intW), height: parseInt(intH) }; } function setLayerPosition() {var shadow = document.getElementById(\"shadow\");var question = document.getElementById(\"question\");var bws = getBrowserHeight();shadow.style.width = bws.width + \"px\";shadow.style.height = bws.height + \"px\";question.style.left = parseInt((bws.width - 350) / 2);question.style.top = parseInt((bws.height - 200) / 2);shadow = null;question = null; } function showLayer() {setLayerPosition();var shadow = document.getElementById(\"shadow\");var question = document.getElementById(\"question\");shadow.style.display = \"block\";question.style.display = \"block\";shadow = null;question = null;             } function hideLayer() { var shadow = document.getElementById(\"shadow\");var question = document.getElementById(\"question\");shadow.style.display = \"none\";question.style.display = \"none\";shadow = null;question = null; }window.onresize = setLayerPosition; </script>";
			blurIframe += "<style>.opaqueLayer { display:none; position:absolute; top:0px; left:0px; opacity:0.6; filter:alpha(opacity=60); background-color: #000000; z-Index:1000; } .questionLayer { position:absolute; top:250px; left:325px; width:350px; height:50px; display:none; z-Index:1001; border:2px solid black; background-color:#FFFFFF; text-align:center; vertical-align:middle; padding:10px; }</style>";
			
			if(valObjOut != null){
				if(valObjOut.get("stateMap") != null){
					stateMap =  (ArrayList<String>) valObjOut.get("stateMap");

					html = "";
					html +=	"<style>" +
							".carve{border:0px solid;border-radius:15px;-moz-border-radius:15px; /* Old Firefox */} </style> " +
							"<div style=\"background-color:white; width :100% ;text-align:left;position: fixed;top: 0px \"><strong><font size=\"2\" face=\"Arial, Helvetica, sans-serif\"><a onclick=\"showLayer()\" align=\"right\" class=\"branches\" href=\""+request.getContextPath()+"/ivcargo/Ajax.do?pageId=9&eventId=4&accountGroupId="+accountGroupId+"\" style=\"font-size: 13px;font-style: italic;font-weight: bold;font-family: arial,helvetica,sans-serif\">Home</a></font></strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
					html += "<strong><font size=\"2\" face=\"Arial, Helvetica, sans-serif\"><img src=\"" + request.getContextPath()+"/images/b2c/arrow.gif\" width=\"9\" height=\"9\">";
					html += "<a onclick=\"showLayer()\" id=\"Country\" class=\"branches\" href=\"" + request.getContextPath()+"/ivcargo/Ajax.do?pageId=9&eventId=7&accountGroupId=201&filter=2\">&nbsp;View / Download Branches In India</a></font></strong>&nbsp;&nbsp;&nbsp;&nbsp;";
					html += "</div><div><br></div>" ;
					
					html += blurIframe ;

					//"<img seamless=\"seamless\" width=\"510\" height=\"510\" border=\"0\" src=\"http://www.vtransgroup.com/images/home-icon.gif\"></img>"+
					//"<embed width=\"949\" height=\"220\" src=\"http://www.vtransgroup.com/images/header2.swf\" quality=\"high\" pluginspage=\"http://www.adobe.com/shockwave/download/download.cgi?P1_Prod_Version=ShockwaveFlash\" type=\"application/x-shockwave-flash\">"+

					html +=	"<table border=\"0\" id=\"reportData\" width=\"460\" border=\"0\" cellpadding=\"7\" cellspacing=\"0\" bordercolor=\"#F8F8F8\" class=\"branches\">";					
					html +="<tr>"+
							"<td class=\"carve\" height=\"10\" colspan=\"3\" bgcolor=\"#DDA0DD\"> <div align=\"center\"><strong><font size=\"2\" face=\"Arial, Helvetica, sans-serif\">";
					html +="All State";
					html +="</font></strong></div></td></tr>";

					for(int i = 0;i<stateMap.size();i++){

						name = stateMap.get(i);
						nameonly =name.split(":");

						if( i % 3 ==0 ){html +="</tr><tr>";}

						html +="<td width=\"160\"><strong><font size=\"2\" face=\"Arial, Helvetica, sans-serif\"><img src=\""+request.getContextPath()+"/images/b2c/arrow.gif\" width=\"9\" height=\"9\">";
						html +="<a onclick=\"showLayer()\" id=\""+name+"\" class=\"branches\" href=\""+request.getContextPath()+"/ivcargo/Ajax.do?pageId=9&eventId=6&accountGroupId=201&stateId="+nameonly[1]+"&stateName="+nameonly[0]+"\">&nbsp"+nameonly[0]+"</a></font></strong></td>";
					}

					html +="</tr>";
					html +="</table>";

					LogWriter.writeLog("TRACE_ID", LogWriter.LOG_LEVEL_DEBUG,"html" +html);					
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
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR,_e);
		}finally{
			accountGroupId	= null;
			html			= null;
		}
	}
}