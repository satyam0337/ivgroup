package com.ivcargo.b2c;

import java.sql.Date;
import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.WayBillBll;
import com.framework.Action;
import com.iv.logsapp.LogWriter;
import com.iv.utils.dataObject.ValueObject;
import com.platform.dao.BranchDao;
import com.platform.dao.SubRegionDao;
import com.platform.dao.b2c.LrSearchDetailsDao;
import com.platform.dto.Branch;
import com.platform.dto.ECargoConstantFile;
import com.platform.dto.SubRegion;
import com.platform.dto.TransportListMaster;
import com.platform.dto.WayBill;
import com.platform.dto.constant.CargoAccountGroupConstant;
import com.platform.dto.model.WayBillStatusDetails;
import com.platform.utils.Utility;

@SuppressWarnings("unused")
public class InitialTraceAndTrackParcel implements Action{

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		// TODO Auto-generated method stub

		String wayBillNumber 	= null;
		String accountGroupId	= null;
		//		String input 			= null;
		String html				= null;
		String innerHtml		= null;
		String noRecordFound 	= null;

		ValueObject valObjIn 	= null;
		ValueObject valObjOut 	= null;

		WayBillStatusDetails[] data = null;

		try {

			wayBillNumber 	= request.getParameter("wayBillNumber");
			accountGroupId	= request.getParameter("accountGroupId");

			noRecordFound="<script type=\"text/javascript\">function closeWin(){window.close();}</script>" +
					"<style>table{border-collapse:collapse;}table, td, th{border:1px solid black; }</style>" +
					"<table border = \"1\" >" +
					"<tr>" +
					"<td style =\"font-size:20px;\">" +
					"<img  id=\"groupLogo\" height=\"75px\" width=\"800px\" src=\""+request.getContextPath()+"/images/Logo/"+accountGroupId+".GIF\"></img>" +
					"</td>" +
					"<td style =\"font-size:20px;\" align=\"Right\"><b>" +
					"<img  id=\"groupLogo\" height=\"75px\" src=\""+request.getContextPath()+"/images/Logo/ivgologo.png\"></img>" +
					"<b></td>" + "</tr>" +
					"<tr>" +
					"<td colspan=\"2\" style =\"font-size:30px;\"><b>" + "LR Number : " + wayBillNumber + "<b></td></tr>" +
					"<tr><td colspan=\"2\">" + "<b>LR Status Details :<b>" +
					"</td></tr>" +
					"<tr><td colspan=\"2\"><font <font color=\"red\" size=\"24\"> No Records Found </font></td></tr>" +
					"<tr>" +
					"<td colspan=\"2\" align=\"right\">" +
					"<b> Powered By IVCargo <b>" +
					"</td></tr>" +
					"<tr><td colspan=\"2\" align=\"right\">" +
					"<input type=\"button\" onclick=\"window.print();\" name=\"Print\" value=\"Print\">" +
					"<input type=\"button\" onclick=\"closeWin()\" name=\"Close\" value=\"Close\">" + "</td>" +
					"</tr>" +
					"</table>";

			//			input = "wayBillNumber:" +wayBillNumber+ "accountGroupId:" + accountGroupId;

			valObjIn = new ValueObject();
			valObjIn.put("wayBillNumber",wayBillNumber);
			valObjIn.put("accountGroupId",accountGroupId);

			valObjOut =  new ValueObject();
			valObjOut = LrSearchDetailsDao.getInstance().getLrStatusDetails(valObjIn);

			if(valObjOut != null && (Long)valObjOut.get("waybillid") != 0){

				valObjIn.put("wayBillId",""+valObjOut.get("waybillid"));

				data		= getHtmlData(valObjIn);
				innerHtml	= getHtml(data ,valObjIn);

				html = 	"<script type=\"text/javascript\">function closeWin(){window.close();}</script>" +
						"<style>table{border-collapse:collapse;}table, td, th{border:1px solid black; }</style>" +
						//							"<style>table, td, th{border:1px solid green;}th{background-color:green;color:white;}</style>" +
						"<table border = \"1\" >" +
						"<tr>" +
						"<td style =\"font-size:20px;\">" +
						"<img  id=\"groupLogo\" height=\"75px\" width=\"800px\" src=\""+request.getContextPath()+"/images/Logo/"+accountGroupId+".GIF\"></img>"+
						"</td>" +
						"<td style =\"font-size:20px;\" align=\"right\"><b>" +
						"<img  id=\"groupLogo\" height=\"75px\" src=\""+request.getContextPath()+"/images/Logo/ivgologo.png\"></img>"+
						"<b></td>" +
						"</tr>"+
						"<tr>" +
						"<td colspan=\"2\" style =\"font-size:30px;\"><b>" +
						"LR Number : " +
						wayBillNumber +
						"<b></td>" +
						"</tr>" +
						"<tr><td colspan=\"2\">" +
						"<b>LR Status Details :<b>" +
						"</td></tr>" +
						innerHtml +
						"<tr><td colspan=\"2\" align=\"right\">" +
						"<b> Powered By IVCargo <b>" +
						"</td></tr>" +
						"<tr><td colspan=\"2\" align=\"right\">" +
						"<input type=\"button\" onclick=\"window.print();\" name=\"Print\" value=\"Print\">" +
						"<input type=\"button\" onclick=\"closeWin()\" name=\"Close\" value=\"Close\">" +
						"</td></tr>" +
						"</table>";
				LogWriter.writeLog("TRACE_ID", LogWriter.LOG_LEVEL_DEBUG,"html" +html);

			} else
				html = noRecordFound;

			response.setContentType("text/html");
			final var out = response.getWriter();
			out.println(html);
			out.flush();
			out.close();
			request.setAttribute("nextPageToken", "success");

		} catch (final Exception _e) {
			_e.printStackTrace();
			LogWriter.writeLog("LOGINVALIDATOR", LogWriter.LOG_LEVEL_ERROR, _e);
			request.setAttribute("nextPageToken", "failure");
		}finally{
			wayBillNumber 	= null;
			accountGroupId	= null;
			//			input 			= null;
			html			= null;
			innerHtml		= null;
			noRecordFound 	= null;
			data 			= null;
			valObjIn 		= null;
			valObjOut 		= null;
		}
	}

	private WayBillStatusDetails[] getHtmlData(final ValueObject valObjIn) throws Exception {

		ValueObject 			valueInObject  			= null;
		ValueObject 			valueOutObject	 		= null;
		WayBillBll 				wayBillBll 				= null;
		WayBillStatusDetails[] 	wayBillStatusDetails	= null;
		var  					accountGroupId			= 0L;
		Branch 					branch					= null;
		SubRegion				subRegion				= null;
		String					deliveryPlace			= null;

		try {
			wayBillBll		= new WayBillBll();
			valueInObject	= new ValueObject();
			valueOutObject	= new ValueObject();

			valueInObject.put("wayBillId",valObjIn.get("wayBillId"));

			valueOutObject 			= wayBillBll.getWayBillStatusDetails(valueInObject);
			wayBillStatusDetails 	= (WayBillStatusDetails[])valueOutObject.get("WayBillStatusDetails");

			accountGroupId = Long.parseLong(valObjIn.get("accountGroupId").toString());
			for (final WayBillStatusDetails wayBillStatusDetail : wayBillStatusDetails) {

				if(wayBillStatusDetail.getStatus() == WayBill.WAYBILL_STATUS_BOOKED)
					deliveryPlace = wayBillStatusDetail.getDeliveryPlace();

				wayBillStatusDetail.setSourceSubRegionName(SubRegionDao.getInstance().getSubRegionById(wayBillStatusDetail.getSourceSubRegionId()).getName());
				wayBillStatusDetail.setSourceBranchName(BranchDao.getInstance().findByBranchId(wayBillStatusDetail.getSourceBranchId()).getName());
				if(wayBillStatusDetail.getDestinationSubRegionId()== 0)
					wayBillStatusDetail.setDestinationSubRegionName("");
				else
					wayBillStatusDetail.setDestinationSubRegionName(SubRegionDao.getInstance().getSubRegionById(wayBillStatusDetail.getDestinationSubRegionId()).getName());

				if(wayBillStatusDetail.getDestinationBranchId() > 0) {
					branch = BranchDao.getInstance().findByBranchId(wayBillStatusDetail.getDestinationBranchId());
					wayBillStatusDetail.setDestinationBranchName(branch.getName());
				} else {
					wayBillStatusDetail.setDestinationBranchName("");
					if(wayBillStatusDetail.getStatus() == WayBill.WAYBILL_STATUS_BOOKED
							|| wayBillStatusDetail.getStatus() == WayBill.WAYBILL_STATUS_DISPATCHED)
						wayBillStatusDetail.setDestinationBranchName(deliveryPlace);
					else {
						wayBillStatusDetail.setDestinationSubRegionName(wayBillStatusDetail.getSourceSubRegionName());
						wayBillStatusDetail.setDestinationBranchName(wayBillStatusDetail.getSourceBranchName());
					}
				}

				branch = BranchDao.getInstance().findByBranchId(wayBillStatusDetail.getExecutiveBranchId());
				wayBillStatusDetail.setExecutiveBranchName(branch.getName());

				if( accountGroupId == ECargoConstantFile.ACCOUNTGROUPID_LMT) {
					branch =BranchDao.getInstance().findByBranchId(wayBillStatusDetail.getSourceBranchId());

					subRegion = SubRegionDao.getInstance().getSubRegionById(branch.getSubRegionId());
					wayBillStatusDetail.setSourceSubRegionId(subRegion.getSubRegionId());
					wayBillStatusDetail.setSourceSubRegionName(subRegion.getName());
					branch = null;
					if(wayBillStatusDetail.getDestinationBranchId() == 0)
						branch = null;
					else
						branch = BranchDao.getInstance().findByBranchId(wayBillStatusDetail.getDestinationBranchId());

					if(branch!= null){
						subRegion = SubRegionDao.getInstance().getSubRegionById(branch.getSubRegionId());
						wayBillStatusDetail.setDestinationSubRegionId(subRegion.getSubRegionId());
						wayBillStatusDetail.setDestinationSubRegionName(subRegion.getName());
					}else{
						wayBillStatusDetail.setDestinationSubRegionId(0);
						wayBillStatusDetail.setDestinationSubRegionName(wayBillStatusDetail.getDeliveryPlace());
					}
				}
			}
			return wayBillStatusDetails;
		} catch (final Exception e) {
			e.printStackTrace();
			throw e;
		}
	}

	private String getHtml(final WayBillStatusDetails[] wayBillStatusDetails, final ValueObject valObjIn) throws Exception {

		String 				html 				= null;
		SimpleDateFormat 	sdf					= null;
		String  			date				= null;
		String[]  			wayBillStatusArr	= null;
		//		Timestamp			datetoprint 		= null;
		ArrayList<Long>		transportList		= null;
		Timestamp 			BookingDate 		= null;
		Timestamp 			nextDate 			= null;
		var 	dayDiff 		= 0L;
		//		int 	BookingDay		= 0;
		var 	accountGroupId	= 0L;

		try {
			sdf				= new SimpleDateFormat("dd-MM-yy HH:mm aaa");
			accountGroupId	= Long.parseLong(valObjIn.get("accountGroupId").toString());
			transportList	= TransportListMaster.getTransportList();

			if(accountGroupId > Long.parseLong(""+CargoAccountGroupConstant.ACCOUNT_GROUP_ID_MECL))
				transportList.add(accountGroupId);

			html =	"""
					<tr>\
					<td colspan="2">\
					<table cellpadding="5px" style ="font-size:12px;" border="1" class="tableForViewDeatils" width="100%">\
					<tr>""";

			if(transportList.contains(accountGroupId))
				html += "<td class=\"titletd\" align=\"left\"><b>Status<b></td> <td class=\"titletd\" align=\"left\"><b>No Detail<b></td> <td class=\"titletd\" align=\"left\"><b>Date<b></td> <td class=\"titletd\" align=\"left\" width=\"2%\"><b>On<br/>Day<b></td> " +
						//						"<td class=\"titletd\" align=\"left\"><b>User<b></td> <td class=\"titletd\" align=\"left\"><b>Branch<b></td> " +
						"<td class=\"titletd\" align=\"left\"><b>From<b></td> <td class=\"titletd\" align=\"left\"><b>To<b></td> <td class=\"titletd\" align=\"left\"><b>Remark<b></td> <td class=\"titletd\" align=\"left\" width=\"2%\"><b>Operated By<b></td>";
			else
				html += "<td class=\"titletd\" align=\"left\"><b>Status<b></td> <td class=\"titletd\" align=\"left\"><b>Date<b></td> <td class=\"titletd\" align=\"left\" width=\"2%\"><b>On<br/>Day<b></td> " +
						//						"<td class=\"titletd\" align=\"left\"><b>Executive<b></td> <td class=\"titletd\" align=\"left\"><b>Branch<b></td> " +
						"<td class=\"titletd\" align=\"left\"><b>Source<b></td> <td class=\"titletd\" align=\"left\"><b>Destination<b></td> <td class=\"titletd\" align=\"left\"><b>Remark<b></td> <td class=\"titletd\" align=\"left\" width=\"2%\"><b>Operated By<b></td>";
			html += "</tr>";

			// Store Booking Date
			BookingDate= new Timestamp(wayBillStatusDetails[0].getDate().getTime());
			/*BookingDate.setHours(0);
			BookingDate.setMinutes(0);
			BookingDate.setSeconds(0);
			BookingDate.setNanos(0);*/

			//	BookingDate = Utility.getCalendarTimeFromTimestamp(BookingDate,0,0,0,0);
			//	LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_DEBUG, "BookingDate : " + BookingDate);

			for (final WayBillStatusDetails wayBillStatusDetail : wayBillStatusDetails) {

				date=sdf.format(new Date(wayBillStatusDetail.getDate().getTime()));
				// Date variabls for No. of Days

				dayDiff =0;
				//				BookingDay=0;
				nextDate=wayBillStatusDetail.getDate();
				/*nextDate.setHours(0);
				nextDate.setMinutes(0);
				nextDate.setSeconds(0);
				nextDate.setNanos(0);*/

				//		nextDate =  Utility.getCalendarTimeFromTimestamp(nextDate,0,0,0,0);
				//	LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_DEBUG, "nextDate : " + nextDate);

				dayDiff = Utility.getDayDiffBetweenTwoDates(BookingDate, nextDate);

				//	dayDiff =(nextDate.getTime() - BookingDate.getTime())/( 1000*60*60*24 );

				wayBillStatusArr =  wayBillStatusDetail.getNumber().split(":");

				if(wayBillStatusDetail.isBranchTransfer()
						&& (wayBillStatusDetail.getStatus() == WayBill.WAYBILL_STATUS_RECEIVED
						|| wayBillStatusDetail.getStatus() == WayBill.WAYBILL_STATUS_DISPATCHED)) {

					html += "<tr>";
					if(transportList.contains(wayBillStatusDetail.getAccountGroupId())) {
						html +="<td class=\"datatd\" align=\"left\" style=\"background-color: #FFFFCC;\">"+ WayBill.getStatusOfWayBillForTransport(wayBillStatusDetail.getStatus())+ "</td>";
						if(wayBillStatusDetail.getStatus() == WayBill.WAYBILL_STATUS_DISPATCHED)
							html +="<td class=\"datatd\" align=\"left\" style=\"background-color: #FFFFCC;\">"+wayBillStatusArr[0]+"  :"+ wayBillStatusArr[1] +"</td>";
						else
							html +="<td class=\"datatd\" align=\"left\" style=\"background-color: #FFFFCC;\">" +wayBillStatusArr[0]+" : "+wayBillStatusArr[1]+"</td>";
					} else
						html +=	"<td class=\"datatd\" align=\"left\" style=\"background-color: #FFFFCC;\">"+WayBill.getStatusOfWayBill(wayBillStatusDetail.getStatus()) +"</td>";
					html += "<td class=\"datatd\" align=\"left\" style=\"background-color: #FFFFCC;\">"+date+"</td>"+
							"<td class=\"datatd\" align=\"left\" style=\"background-color: #FFFFCC;\">";
					if (dayDiff==0)
						html +="1";
					else
						html += dayDiff;
					html +="</td>";
					html +=
							//"<td class=\"datatd\" align=\"left\" style=\"background-color: #FFFFCC;\">"+ wayBillStatusDetails[i].getExecutiveName() +"</td>"+
							//"<td class=\"datatd\" align=\"left\" style=\"background-color: #FFFFCC;\">"+ wayBillStatusDetails[i].getExecutiveBranchName() +"</td>"+
							"<td class=\"datatd\" align=\"left\" style=\"background-color: #FFFFCC;\">"+ wayBillStatusDetail.getSourceSubRegionName() +"&nbsp;( "+ wayBillStatusDetail.getSourceBranchName() +" )</td>"+
							"<td class=\"datatd\" align=\"left\" style=\"background-color: #FFFFCC;\">"+ wayBillStatusDetail.getDestinationSubRegionName() +"&nbsp;( "+ wayBillStatusDetail.getDestinationBranchName() +" )</td>"+
							"<td class=\"datatd\" align=\"left\" style=\"background-color: #FFFFCC;\">"+ wayBillStatusDetail.getRemark() +"</td>";
					if(wayBillStatusDetail.getAccountGroupId()== ECargoConstantFile.ACCOUNTGROUPID_NEETA_TRAVELS && wayBillStatusDetail.getStatus() == WayBill.WAYBILL_STATUS_CANCELLED)
						html +="<td class=\"datatd\" align=\"left\" style=\"background-color: #FFFFCC;\">"+ wayBillStatusDetail.getCommonDescription()+"</td>";
					else
						html +="<td class=\"datatd\" align=\"left\" style=\"background-color: #FFFFCC;\"></td>";
				} else {
					html +="<tr>";
					if(transportList.contains(wayBillStatusDetail.getAccountGroupId())) {
						html +="<td class=\"datatd\" align=\"left\">"+ WayBill.getStatusOfWayBillForTransport(wayBillStatusDetail.getStatus()) +"</td>";
						if(wayBillStatusDetail.getStatus() == WayBill.WAYBILL_STATUS_BOOKED || wayBillStatusDetail.getStatus() == WayBill.WAYBILL_STATUS_DISPATCHED || wayBillStatusDetail.getStatus() == WayBill.WAYBILL_STATUS_RECEIVED)
							html +="<td class=\"datatd\" align=\"left\">"+ wayBillStatusArr[0] +" : "+ wayBillStatusArr[1] +"</td>";
					} else
						html +="<td class=\"datatd\" align=\"left\">"+ WayBill.getStatusOfWayBill(wayBillStatusDetail.getStatus()) +"</td>";
					html +="<td class=\"datatd\" align=\"left\">"+date+"</td>";
					html +="<td class=\"datatd\" align=\"left\">";
					if (dayDiff==0)
						html += "1";
					else
						html += dayDiff;

					//html +="<td class=\"datatd\" align=\"left\">"+ wayBillStatusDetails[i].getExecutiveName() +"</td>";
					//html +="<td class=\"datatd\" align=\"left\">"+ wayBillStatusDetails[i].getExecutiveBranchName() +"</td>";

					if( accountGroupId == ECargoConstantFile.ACCOUNTGROUPID_LMT) {
						html +="<td class=\"datatd\" align=\"left\">"+ wayBillStatusDetail.getSourceBranchName() +"&nbsp;( "+ wayBillStatusDetail.getSourceSubRegionName() +" )</td>";
						html +="<td class=\"datatd\" align=\"left\">"+ wayBillStatusDetail.getDestinationBranchName() +"&nbsp;( "+ wayBillStatusDetail.getDestinationSubRegionName() +" )</td>";
					} else {
						html +="<td class=\"datatd\" align=\"left\">"+ wayBillStatusDetail.getSourceSubRegionName() +"&nbsp;( "+ wayBillStatusDetail.getSourceBranchName() +" )</td>";
						html +="<td class=\"datatd\" align=\"left\">"+ wayBillStatusDetail.getDestinationSubRegionName() +"&nbsp;( "+ wayBillStatusDetail.getDestinationBranchName() +" )</td>";
					}
					html +="<td class=\"datatd\" align=\"left\">"+ wayBillStatusDetail.getRemark() +"</td>";
					if(wayBillStatusDetail.getAccountGroupId()== ECargoConstantFile.ACCOUNTGROUPID_NEETA_TRAVELS && wayBillStatusDetail.getStatus() == WayBill.WAYBILL_STATUS_CANCELLED)
						html +="<td class=\"datatd\" align=\"left\">"+ wayBillStatusDetail.getCommonDescription()+"</td>";
					else
						html +="<td class=\"datatd\" align=\"left\"></td>";
				}
				html +="</tr>";
			}
			html +="</table>";
			html +="</td>";
			html +="</tr>";
			return html;
		} catch (final Exception e) {
			throw e;
		}finally{
			html 				= null;
			sdf					= null;
			date				= null;
			wayBillStatusArr	= null;
			//			datetoprint 		= null;
			transportList		= null;
			BookingDate 		= null;
			nextDate 			= null;

		}
	}
}