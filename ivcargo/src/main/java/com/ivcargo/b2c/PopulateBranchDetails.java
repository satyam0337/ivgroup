package com.ivcargo.b2c;

import java.io.PrintWriter;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringUtils;

import com.framework.Action;
import com.iv.logsapp.LogWriter;
import com.iv.utils.constant.AccountGroupConstant;
import com.platform.dao.b2c.BranchLocatorDao;
import com.platform.dto.Branch;

public class PopulateBranchDetails implements Action{

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {

		var 		accountGroupId	= 0L;
		var 		branchId 		= 0L;
		var 		cityId 			= 0L;
		var 	 	stateId 		= 0L;
		var 		filter 			= 0L;

		String 		html			= null;
		Branch[] 	branches 		= null;
		PrintWriter out 			= null;
		String  	phoneNo			= null;
		String 		blurIframe 		= null;

		try {

			filter				= Long.parseLong(request.getParameter("filter"));
			accountGroupId		= Long.parseLong(request.getParameter("accountGroupId"));

			if(accountGroupId == AccountGroupConstant.ACCOUNT_GROUP_ID_LMT) {
				response.setContentType("text/html");
				out = response.getWriter();
				out.println("No Record Found");
				out.flush();
				return;
			}

			if(filter==1){//Get Data of Branch For Single Branch
				branchId			= Long.parseLong(request.getParameter("branchId"));
				branches 			= BranchLocatorDao.getInstance().getBranchesDetails(filter, accountGroupId, cityId, stateId, branchId);
			}else if(filter==2)
				branches 			= BranchLocatorDao.getInstance().getBranchesDetails(filter, accountGroupId, cityId, stateId, branchId);
			else if(filter==3){//Get Data of ALL Branches For Single city
				cityId				= Long.parseLong(request.getParameter("cityId"));
				branches 			= BranchLocatorDao.getInstance().getBranchesDetails(filter, accountGroupId, cityId, stateId, branchId);
			}else if(filter==4){//Get Data of ALL Branches For Single State
				stateId 			= Long.parseLong(request.getParameter("stateId"));
				branches 			= BranchLocatorDao.getInstance().getBranchesDetails(filter, accountGroupId, cityId, stateId, branchId);
			}

			blurIframe 	= "";
			blurIframe += "<div id=\"shadow\" class=\"opaqueLayer\"></div><div id=\"question\" style=\"left:40%; width: 200px;height: 20px; font-weight: bold;\" class=\"questionLayer\">Please wait....</div>";
			blurIframe += "<script type=\"text/javascript\"> function getBrowserHeight() {var intH = 20;var intW = 20;intH = document.body.clientHeight ; intW = document.body.clientWidth ; return { width: parseInt(intW), height: parseInt(intH) }; } function setLayerPosition() {var shadow = document.getElementById(\"shadow\");var question = document.getElementById(\"question\");var bws = getBrowserHeight();shadow.style.width = bws.width + \"px\";shadow.style.height = bws.height + \"px\";question.style.left = parseInt((bws.width - 350) / 2);question.style.top = parseInt((bws.height - 200) / 2);shadow = null;question = null; } function showLayer() {setLayerPosition();var shadow = document.getElementById(\"shadow\");var question = document.getElementById(\"question\");shadow.style.display = \"block\";question.style.display = \"block\";shadow = null;question = null;             } function hideLayer() { var shadow = document.getElementById(\"shadow\");var question = document.getElementById(\"question\");shadow.style.display = \"none\";question.style.display = \"none\";shadow = null;question = null; }window.onresize = setLayerPosition; </script>";
			blurIframe += "<style>.opaqueLayer { display:none; position:absolute; top:0px; left:0px; opacity:0.6; filter:alpha(opacity=60); background-color: #000000; z-Index:1000; } .questionLayer { position:absolute; top:250px; left:325px; width:350px; height:50px; display:none; z-Index:1001; border:2px solid black; background-color:#FFFFFF; text-align:center; vertical-align:middle; padding:10px; }</style>";

			html = "";
			html += blurIframe;
			html += "<style>" +
					".carve{border:0px solid;border-radius:15px;-moz-border-radius:15px; /* Old Firefox */} </style> " +
					"<script type=\"text/javascript\">" +
					"function downloadToExcel(link,tableId,reportNameId,fileName){link.href = \"data:application/vnd.ms-excel,\" + encodeURIComponent(document.getElementById(tableId).innerHTML);}" +
					"function downloadToWord(link,tableId,reportNameId,fileName){link.href = \"data:application/msword,\" + encodeURIComponent(document.getElementById(tableId).innerHTML);}" +
					"function downloadToPDF(link,tableId,reportNameId,fileName){link.href = \"data:application/vnd.fdf,\" + encodeURIComponent(document.getElementById(tableId).innerHTML);}" +
					"</script>" +
					"<div style=\"background-color:#ffffff; width :100% ;text-align:left;position: fixed;top: 0px \">" +
					"<a onclick=\"showLayer()\" align=\"right\" class=\"branches\" href=\""+request.getContextPath()+"/ivcargo/Ajax.do?pageId=9&eventId=4&accountGroupId="+accountGroupId+"\" style=\"font-size: 13px;font-style: italic;font-weight: bold;font-family: arial,helvetica,sans-serif\">Home</a>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" +
					"<a href=\"#\" id=\"excelDownLoadLink\" onclick=\"downloadToExcel(this,'reportData','','');\" style=\"font-size: 13px;font-style: italic;font-weight: bold;font-family: arial,helvetica,sans-serif\">Download Excel</a>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" +
					"<a href=\"#\" id=\"excelDownLoadLink\" onclick=\"downloadToWord(this,'reportData','','');\" style=\"font-size: 13px;font-style: italic;font-weight: bold;font-family: arial,helvetica,sans-serif\">Download Word</a>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" +
					"<a onclick=\"showLayer();window.history.back();\" href=\"javascript:history.go(-1);return true;\" value=\"Back\" type=\"button\"  style=\"font-size: 13px;font-style: italic;font-weight: bold;font-family: arial,helvetica,sans-serif\">Back</a>"+
					"</div><div><br></div>";

			html += "<table border=\"0\" id=\"reportData\" width=\"460\" border=\"0\" cellpadding=\"7\" cellspacing=\"0\" bordercolor=\"#F8F8F8\" class=\"carve\">";
			html +="<tr>";

			html +="<td width=\"460\" align=\"center\">"+
					"<table width=\"460\" border=\"0\" cellpadding=\"5\" cellspacing=\"0\" bordercolor=\"#F8F8F8\" class=\"carve\">";

			if(branches != null)
				for (final Branch element : branches) {
					html +="<tr>"+
							"<td class=\"carve\" height=\"10\" colspan=\"3\" bgcolor=\"#e86830\"> <div align=\"center\"><strong><font color=\"#ffffff\" size=\"2\" face=\"Arial, Helvetica, sans-serif\">";

					html +=StringUtils.upperCase(element.getStateName())+"  :  "+
							//StringUtils.upperCase(element.getCityName())+"  :  "+StringUtils.upperCase(element.getName()) +"<br>"+
							StringUtils.upperCase(element.getDisplayName()) ;

					html +="</font></strong></div></td></tr>";
					html +="<tr>"+
							"<td class=\"carve\" height=\"10\" colspan=\"3\" bgcolor=\"#e8f6fd\"> <div align=\"center\"><strong><font size=\"2\" face=\"Arial, Helvetica, sans-serif\"><u>";

					if(element.getBranchType()==Branch.BRANCH_TYPE_BOOKING_DELIVERY_BOTH)
						html +="BOOKING &amp; DELIVERY OFFICE";
					else if(element.getBranchType()==Branch.BRANCH_TYPE_DELIVERY)
						html +="DELIVERY OFFICE";
					else
						html +="BOOKING OFFICE";

					html +="</u></font></strong></div></td>"+
							"</tr>"+
							"<tr>"+
							"<td width=\"84\"><div align=\"right\"><font color=\"#000000\" size=\"2\" face=\"Arial, Helvetica, sans-serif\"><strong>Address</strong></font></div></td>"+
							"<td><strong><font color=\"#000000\">:</font></strong></td>"+
							"<td><font size=\"2\" face=\"Arial, Helvetica, sans-serif\">"+element.getAddress()+"</font></td>"+
							"</tr>"+
							"<tr>"+
							"<td width=\"84\"> <div align=\"right\"><font color=\"#000000\" size=\"2\" face=\"Arial, Helvetica, sans-serif\"><strong>Phone"+
							"</strong></font></div></td>"+
							"<td><strong><font color=\"#000000\">:</font></strong></td>"+
							"<td><font size=\"2\" face=\"Arial, Helvetica, sans-serif\">";

					phoneNo = "";

					if(StringUtils.isNotEmpty(element.getPhoneNumber()) && !"0000000000".equals(element.getPhoneNumber()))
						phoneNo +=	element.getPhoneNumber() + " ; ";

					if(StringUtils.isNotEmpty(element.getMobileNumber()) && !"0000000000".equals(element.getMobileNumber()))
						phoneNo +=	element.getMobileNumber() + " ; ";

					if(StringUtils.isNotEmpty(element.getPhoneNumber2()) && !"0000000000".equals(element.getPhoneNumber2()))
						phoneNo +=	element.getPhoneNumber2() + " ; ";

					if(StringUtils.isNotEmpty(element.getMobileNumber2()) && !"0000000000".equals(element.getMobileNumber2()))
						phoneNo +=	element.getMobileNumber2() + " ; ";

					if(phoneNo.length()>0)
						phoneNo 	= StringUtils.substring(phoneNo, 0, phoneNo.length() - 3);
					else
						phoneNo  	="---";

					html += phoneNo;

					html += "</font></td>"+
							"</tr>";
					html += """
							<tr><td width="84"> <div align="right"><font color="#000000" size="2" face="Arial, Helvetica, sans-serif"><strong>Fax No\
							</strong></font></div></td>\
							<td><strong><font color="#000000">:</font></strong></td>\
							<td><font size="2" face="Arial, Helvetica, sans-serif">""" ;

					if(StringUtils.isNotEmpty(element.getFaxNumber()))
						html +=	element.getFaxNumber();
					else
						html +=	"--";

					html += "</font></td>"+
							"</tr>";

					html += """
							<tr><td width="84"> <div align="right"><font color="#000000" size="2" face="Arial, Helvetica, sans-serif"><strong>Contact To\
							</strong></font></div></td>\
							<td><strong><font color="#000000">:</font></strong></td>\
							<td><font size="2" face="Arial, Helvetica, sans-serif">""" ;

					if(StringUtils.isNotEmpty(element.getContactPersonName()))
						html +=	element.getContactPersonName();
					else
						html +=	"--";

					html += "</font></td>"+
							"</tr>";

					html += """
							<tr><td width="84"> <div align="right"><font color="#000000" size="2" face="Arial, Helvetica, sans-serif"><strong>Email-Id\
							</strong></font></div></td>\
							<td><strong><font color="#000000">:</font></strong></td>\
							<td><font size="2" face="Arial, Helvetica, sans-serif">""" ;

					if(StringUtils.isNotEmpty(element.getEmailAddress()))
						html +=	element.getEmailAddress();
					else
						html +=	"--";

					html += "</font></td>"+
							"</tr>";
				}

			html +="</table>"+
					"</td>";
			html +="</tr>";
			html +="</table>";

			//LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_DEBUG,"html" +html);

			response.setContentType("text/html");
			out = response.getWriter();
			out.println(html);
			out.flush();

		} catch (final Exception e) {
			LogWriter.writeLog("LOGINVALIDATOR", LogWriter.LOG_LEVEL_ERROR, e);
		}finally{
			if(out != null) out.close();
			html			= null;
			branches 		= null;
			out	 			= null;
		}
	}
}