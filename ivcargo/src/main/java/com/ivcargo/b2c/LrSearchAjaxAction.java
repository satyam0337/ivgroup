package com.ivcargo.b2c;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringUtils;

import com.businesslogic.SubRegionBll;
import com.businesslogic.WayBillBll;
import com.businesslogic.properties.impl.PropertyConfigValueBLLImpl;
import com.framework.Action;
import com.iv.bll.impl.properties.SearchConfigurationBllImpl;
import com.iv.constant.properties.SearchConfigPropertiesConstant;
import com.iv.dto.constant.WayBillStatusConstant;
import com.iv.logsapp.LogWriter;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.constant.AccountGroupConstant;
import com.iv.utils.dataObject.ValueObject;
import com.platform.dao.BranchDao;
import com.platform.dao.ConsignmentSummaryDao;
import com.platform.dao.DispatchLedgerDao;
import com.platform.dao.PODWaybillsDao;
import com.platform.dao.ReceivedSummaryDao;
import com.platform.dao.SubRegionDao;
import com.platform.dao.WayBillDao;
import com.platform.dao.b2c.LrSearchDetailsDao;
import com.platform.dao.reports.shortexcess.ExcessReceiveReportDao;
import com.platform.dao.shortexcess.DamageReceiveDao;
import com.platform.dao.shortexcess.ShortReceiveDao;
import com.platform.dto.Branch;
import com.platform.dto.ConsignmentDetails;
import com.platform.dto.ConsignmentSummary;
import com.platform.dto.ECargoConstantFile;
import com.platform.dto.Executive;
import com.platform.dto.PODWaybillsDto;
import com.platform.dto.PropertiesFileConstants;
import com.platform.dto.ReceivedSummary;
import com.platform.dto.SubRegion;
import com.platform.dto.TransportCommonMaster;
import com.platform.dto.WayBill;
import com.platform.dto.configuration.mindateselection.ModuleWiseMinDateSelectionConfigurationDTO;
import com.platform.dto.constant.CargoAccountGroupConstant;
import com.platform.dto.constant.InfoForDeliveryConstant;
import com.platform.dto.constant.TransCargoAccountGroupConstant;
import com.platform.dto.model.RecivablesDispatchLedger;
import com.platform.dto.model.WayBillStatusDetails;
import com.platform.dto.shortexcess.DamageReceive;
import com.platform.dto.shortexcess.ExcessReceive;
import com.platform.dto.shortexcess.ShortReceive;
import com.platform.utils.Utility;

public class LrSearchAjaxAction implements Action{

	private static final String TRACE_ID = "LrSearchAjaxAction";

	@Override
	@SuppressWarnings({ "unchecked" })
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {

		String 					wayBillNumber 			= null;
		String 					accountGroupId			= null;
		var					accountId				= 0L;
		short					filter					= 0;
		String 					html					= null;
		String 					innerHtml				= null;
		String 					currentStatus 			= null;
		ValueObject 			object 					= null;
		WayBillStatusDetails[] 	data 					= null;
		var 				bookingCounter 			= false;
		var 				deliveryCounter 		= false;
		var 				inTransitCounter		= false;
		var 				canceledCounter 		= false;
		var					receivedCounter			= false;
		var					inTransitBranchCounter	= false;
		var					dueDeliveredCounter		= false;
		String 					currentStatusLocation	= null;
		var					isDummyLR				= false;
		String					remark					= null;
		var					dueUnDeliveredCounter	= false;
		Executive				executive				= null;
		ValueObject					moduleWiseMinDateConfigValObj	= null;
		var					lrSearchMinDateAllow				= false;
		Timestamp				minDate								= null;
		ArrayList<WayBill>      wayBillList							= null;
		var				    waybillid							= 0L;
		WayBill 				wayBill								= null;
		PODWaybillsDto			pODWaybillsDto						= null;
		Map<Object, Object>		searchConfiguration					= null;
		String					lrDate								= null;
		Timestamp				lrFromDate							= null;
		Timestamp				lrToDate							= null;
		var						noOfDayForLrSearch					= 0;
		String					prevDate							= null;
		Timestamp				prevDatetime						= null;
		var					validDate							= false;

		try {
			wayBillNumber 	= request.getParameter("wayBillNumber");
			//accountGroupId	= request.getParameter("accountGroupId");

			if(request.getParameter("accountGroupId") != null) {
				accountId	   = Long.parseLong(request.getParameter("accountGroupId"));
				accountGroupId = request.getParameter("accountGroupId");
			}
			if(request.getParameter("filter") != null)
				filter			= Short.parseShort(request.getParameter("filter"));


			executive = new Executive();
			executive.setAccountGroupId(accountId);

			moduleWiseMinDateConfigValObj 			= PropertyConfigValueBLLImpl.getInstance().getConfiguration(executive, PropertiesFileConstants.MODULE_WISE_MIN_DATE_SELECTION_CONFIG);
			searchConfiguration						= SearchConfigurationBllImpl.getInstance().getSearchConfigProperties(accountId);

			if(searchConfiguration != null)
				noOfDayForLrSearch = (int) searchConfiguration.getOrDefault(SearchConfigPropertiesConstant.NO_OF_DAY_FOR_LR_SEARCH,0);

			if(noOfDayForLrSearch > 0) {
				if(request.getParameter("lrDate") != null && !"null".equals(request.getParameter("lrDate"))) {
					lrDate			= request.getParameter("lrDate");

					if(!StringUtils.equalsIgnoreCase("null", lrDate)) {
						lrFromDate = DateTimeUtility.getStartOfDayTimeStamp(lrDate);
						lrToDate   = DateTimeUtility.getEndOfDayTimeStamp(lrDate);
					}
				} else {
					lrFromDate = DateTimeUtility.getTimeStamp(DateTimeUtility.getDateBeforeNoOfDays(noOfDayForLrSearch));
					lrToDate   = DateTimeUtility.getEndOfDayTimeStamp(DateTimeUtility.getCurrentDateString());
					validDate = true;
				}

				prevDate = DateTimeUtility.getDateBeforeNoOfDays(noOfDayForLrSearch);

				if(prevDate != null )
					prevDatetime = DateTimeUtility.getTimeStamp(prevDate);

				if(prevDatetime != null && lrFromDate != null && !validDate)
					validDate = DateTimeUtility.checkDateExistsBetweenDates(prevDatetime , DateTimeUtility.getCurrentTimeStamp(),lrFromDate);
				else
					validDate = true;

			} else
				validDate = true;

			html					= "";
			final var valObjIn = new ValueObject();
			valObjIn.put("wayBillNumber",wayBillNumber);
			valObjIn.put("accountGroupId",accountGroupId);

			if(validDate && noOfDayForLrSearch > 0) {
				valObjIn.put("lrFromDate",lrFromDate);
				valObjIn.put("lrToDate",lrToDate);
			}

			if(searchConfiguration != null) {
				valObjIn.put(SearchConfigPropertiesConstant.IS_LR_SEARCH_FOR_MERGED_GROUP, searchConfiguration.getOrDefault(SearchConfigPropertiesConstant.IS_LR_SEARCH_FOR_MERGED_GROUP,false));
				valObjIn.put(SearchConfigPropertiesConstant.TRACK_LATEST_LRS, searchConfiguration.getOrDefault(SearchConfigPropertiesConstant.TRACK_LATEST_LRS,false));
			}

			if(moduleWiseMinDateConfigValObj != null)
				lrSearchMinDateAllow = moduleWiseMinDateConfigValObj.getBoolean(ModuleWiseMinDateSelectionConfigurationDTO.LR_SEARCH_MIN_DATE_ALLOW);

			final var out = response.getWriter();

			if(filter > 0) {//For only waybillid
				var valObjOut =  new ValueObject();

				if(accountId == 209)
					valObjOut = LrSearchDetailsDao.getInstance().getLrStatusDetailsForNewEraWebSite(valObjIn);
				else if(lrSearchMinDateAllow) {
					minDate = DateTimeUtility.getTimeStamp(moduleWiseMinDateConfigValObj.getString(ModuleWiseMinDateSelectionConfigurationDTO.LR_SEARCH_MIN_DATE));
					valObjOut = LrSearchDetailsDao.getInstance().getLrStatusDetailsWithMinDate(valObjIn);
					wayBillList = (ArrayList<WayBill>) valObjOut.get("wayBillList");

					if(wayBillList != null && wayBillList.size() > 0) {
						for (final WayBill element : wayBillList)
							if(element.getBookingDateTime().after(minDate)) {
								valObjOut.put("waybillid", element.getWayBillId());
								break;
							} else
								valObjOut.put("waybillid", (long)0);
					} else
						valObjOut.put("waybillid", (long)0);
				} else
					valObjOut = LrSearchDetailsDao.getInstance().getLrStatusDetails(valObjIn);

				if(valObjOut != null)
					waybillid = valObjOut.getLong("waybillid", 0);

				wayBill = WayBillDao.getInstance().getWayBill((short)0,waybillid,"",0);
				if(wayBill == null)
					waybillid = -1;
				else if(wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_BOOKED ||
						wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DISPATCHED ||
						wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_RECEIVED ||
						wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DUEDELIVERED
						)
					waybillid = -1;
				else {
					pODWaybillsDto = PODWaybillsDao.getInstance().getPODWaybillDetailsByWayBillId(waybillid);
					if(pODWaybillsDto != null && valObjOut != null)
						waybillid = valObjOut.getLong("waybillid", 0);
					else
						waybillid = 0;
				}

				response.setContentType("text/html");
				response.addHeader("Access-Control-Allow-Origin", "*");
				response.addHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE, HEAD");
				response.addHeader("Access-Control-Allow-Headers", "X-PINGOTHER, Origin, X-Requested-With, Content-Type, Accept");
				response.addHeader("Access-Control-Max-Age", "1728000");
				out.println(waybillid);
			} else {

				var valObjOut =  new ValueObject();

				if(accountId == 209)
					valObjOut = LrSearchDetailsDao.getInstance().getLrStatusDetailsForNewEraWebSite(valObjIn);
				else if(lrSearchMinDateAllow) {
					minDate = DateTimeUtility.getTimeStamp(moduleWiseMinDateConfigValObj.getString(ModuleWiseMinDateSelectionConfigurationDTO.LR_SEARCH_MIN_DATE));
					valObjOut = LrSearchDetailsDao.getInstance().getLrStatusDetailsWithMinDate(valObjIn);
					wayBillList = (ArrayList<WayBill>) valObjOut.get("wayBillList");
					if(wayBillList != null && wayBillList.size() > 0) {
						for (final WayBill element : wayBillList)
							if(element.getBookingDateTime().after(minDate)) {
								valObjOut.put("waybillid", element.getWayBillId());
								break;
							} else
								valObjOut.put("waybillid", (long)0);
					} else
						valObjOut.put("waybillid", (long)0);
				} else
					valObjOut = LrSearchDetailsDao.getInstance().getLrStatusDetails(valObjIn);

				if(valObjOut != null && validDate){

					waybillid = valObjOut.getLong("waybillid",0);

					if((Long)valObjOut.get("waybillid") > 0){

						valObjIn.put("wayBillId",""+valObjOut.get("waybillid"));

						data		= getHtmlData(valObjIn);
						object 		= getHtml(data ,valObjIn);
						innerHtml	= (String)object.get("html");

						bookingCounter 			= (Boolean)object.get("bookingCounter");
						deliveryCounter 		= (Boolean)object.get("deliveryCounter");
						inTransitCounter 		= (Boolean)object.get("inTransitCounter");
						canceledCounter 		= (Boolean)object.get("canceledCounter");
						receivedCounter			= (Boolean)object.get("receivedCounter");
						currentStatus 			= (String)object.get("lastAt");
						inTransitBranchCounter	= (Boolean)object.get("inTransitBranchCounter");
						dueDeliveredCounter		= (Boolean)object.get("dueDeliveredCounter");
						dueUnDeliveredCounter	= (Boolean)object.get("dueUnDeliveredCounter");
						if( valObjIn.getString("deliveryPlaceOnStatus")!=null)
							currentStatusLocation	=	valObjIn.getString("deliveryPlaceOnStatus");
						else
							currentStatusLocation =" ";

						remark = valObjIn.getString("remark");

						if(deliveryCounter)
							currentStatus = "Delivered";
						else if(dueUnDeliveredCounter)
							currentStatus = "Received At Godown";
						else if(dueDeliveredCounter)
							currentStatus = "Out For Delivery";
						else if(receivedCounter)
							currentStatus = "Received";
						else if(inTransitBranchCounter)
							currentStatus = "In Transit Branch";
						else if(inTransitCounter)
							currentStatus = "In Transit";
						else if(bookingCounter)
							currentStatus = "Booked";

						if(canceledCounter)
							currentStatus  = "cancelled";

						isDummyLR = valObjIn.getBoolean("isDummyLR");
						if(accountId == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_BOMBAY_ANDHRA_TRANS_ORG ){

							if(remark != null && remark.length() > 0 && !"Delivered".equals(currentStatus))
								innerHtml = innerHtml+
								"<tr><td colspan=\"4\" align=\"left\">" +
								"<b>"+remark +"<b>" +
								"</td></tr>" ;

							if(! isDummyLR){
								LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO, "log >>> 2" );
								html += "<script type=\"text/javascript\">function closeWin(){window.close();}</script>" +
										"<style>" +
										".carve{border:0px solid;border-radius:15px;-moz-border-radius:15px; /* Old Firefox */} .button { background-color: #95C9E8; /* Green */  border: none; color: white;padding: 10px 30px;  text-align: center;  text-decoration: none;  display: inline-block;  font-size: 13px;  margin: 4px 2px; cursor: pointer;}  </style> " +
										"<style>table{border-collapse:collapse;}table, td, th{border:1px solid black; padding:7px;}</style>" +
										"<table class=\"carve\" width=\"600\" bgcolor=\"#f3f3f3\">" +
										"<input id=\"waybillid2\" type=\"hidden\" value="+waybillid+" /><tr>" +
										"<td align=\"center\" class=\"carve\" bgcolor=\"#1E90FF\" colspan=\"5\" ><strong><font color=\"#ffffff\" size=\"4\" face=\"Arial, Helvetica, sans-serif\"><b>" +
										"&nbsp&nbsp&nbsp Status : " +
										currentStatusLocation+
										"&nbsp&nbsp&nbsp<b></font></strong></td>" +
										"</tr>" +
										"</table>"+
										"<table class=\"carve\" width=\"600\" style=\"margin-top: 10px;\" bgcolor=\"#f3f3f3\">" +
										"<tr >" +
										"<td colspan=\"1\">" +
										"<strong><font color=\"#000000\" size=\"2\" face=\"Arial, Helvetica, sans-serif\">"+
										"<b>LR Number :<b>" +
										"</font></strong>" +
										"</td>" +
										"<td colspan=\"1\">" +
										"<strong><font style=\"background-color: ;\" color=\"#ff004e\" size=\"2\" face=\"Arial, Helvetica, sans-serif\">"+
										"<b>"+wayBillNumber+"<b>" +
										"</font></strong>"+
										"</td>" +
										"<td colspan=\"1\"><strong><font color=\"#000000\" size=\"2\" face=\"Arial, Helvetica, sans-serif\"><b>NO Of Article :<b></font></strong></td>" +
										"<td colspan=\"1\">" +
										"<strong><font style=\"background-color: ;\" color=\"#ff004e\" size=\"2\" face=\"Arial, Helvetica, sans-serif\">"+
										"<b>"+valObjIn.getString("totalNoOfArticle")+"<b>" +
										"</font></strong>"+
										"</td>" +
										"</tr>" +
										innerHtml +
										"<tr>" +
										"<td colspan=\"4\" align=\"right\">" +
										"<b> Powered By IVCargo <b>" +
										"</td></tr>" ;
							} else
								html+="";
						}else{
							if(accountId == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_SCC && !StringUtils.isEmpty(StringUtils.trim(currentStatusLocation)) )
								currentStatus = currentStatusLocation;
							LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO, "log >>> 3" );
							html += "<script type=\"text/javascript\"> function closeWin(){window.close();}</script>" +
									"<style>" +
									".carve{border:0px solid;border-radius:15px;-moz-border-radius:15px; /* Old Firefox */}  .button { background-color: #95C9E8; /* Green */  border: none; color: white;padding: 10px 30px;  text-align: center;  text-decoration: none;  display: inline-block;  font-size: 13px;  margin: 4px 2px; cursor: pointer;}  </style> " +
									"<style>table{border-collapse:collapse;}table, td, th{border:0px solid black; }</style>" +
									"<table class=\"carve\" width=\"490\" bgcolor=\"#f3f3f3\">" +
									"<input id=\"waybillid2\" type=\"hidden\" value="+waybillid+" /><tr>" +
									"<td align=\"center\" class=\"carve\" bgcolor=\"#1E90FF\" colspan=\"2\" ><strong><font color=\"#ffffff\" size=\"5\" face=\"Arial, Helvetica, sans-serif\"><b>" +
									"&nbsp&nbsp&nbsp LR Number : " +
									wayBillNumber +
									"&nbsp&nbsp&nbsp<b></font></strong><input id=\"waybillid\" type=\"hidden\" value="+waybillid+" /></td>" +
									"</tr>" +
									"<tr >" +
									"<td width=\"50%\" align=\"\" colspan=\"1\">" +
									"<strong><font color=\"#000000\" size=\"5\" face=\"Arial, Helvetica, sans-serif\">"+
									"<b>LR Status :<b>" +
									"</font></strong>" +
									"</td>" +
									"<td colspan=\"1\" align=\"\">" +
									"<strong><font style=\"background-color: ;\" color=\"#ff004e\" size=\"4\" face=\"Arial, Helvetica, sans-serif\">"+
									"<b>"+currentStatus+"<b>" +
									"</font></strong>"+
									"</td>" +
									"</tr>" +
									innerHtml +
									"<tr>" +
									"<td colspan=\"2\" align=\"right\">" +
									"<b> Powered By IVCargo <b>" +
									"</td></tr>" +
									"<tr><td colspan=\"2\" align=\"right\">" +
									//							"<input type=\"button\" onclick=\"window.print();\" name=\"Print\" value=\"Print\">" +
									//"<input type=\"button\" onclick=\"closeWin()\" name=\"Close\" value=\"Close\">" +
									"</td></tr>" +
									"</table>";
							//LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_DEBUG,"","html" +html);
						}
					} else if(lrSearchMinDateAllow && wayBillList != null && wayBillList.size() > 0) {
						LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO, "log >>> 4" );
						html = "<script type=\"text/javascript\"> function closeWin(){window.close();}</script>" +
								"<style>" +
								".carve{border:0px solid;border-radius:15px;-moz-border-radius:15px; /* Old Firefox */} .button { background-color: #95C9E8; /* Green */  border: none; color: white;padding: 10px 30px;  text-align: center;  text-decoration: none;  display: inline-block;  font-size: 13px;  margin: 4px 2px; cursor: pointer;}  </style> " +
								"<style>table{border-collapse:collapse;}table, td, th{border:0px solid black; }</style>" +
								"<table width=\"505\" height=\"180\" class=\"carve\" bgcolor=\"#f3f3f3\">" +
								"<input id=\"waybillid2\" type=\"hidden\" value="+waybillid+" /> <tr>" +
								"<td align=\"center\" class=\"carve\" bgcolor=\"#1E90FF\" colspan=\"2\" ><strong><font color=\"#ffffff\" size=\"5\" face=\"Arial, Helvetica, sans-serif\"><b>" +
								"Details OF LR Number : " +
								wayBillNumber +
								"<b></font></strong><input id=\"waybillid\" type=\"hidden\" value="+waybillid+" /></td>" +
								"</tr>" +
								"<tr >" +
								"<td align=\"center\" colspan=\"2\">" +
								"<strong><font color=\"red\" size=\"5\" face=\"Arial, Helvetica, sans-serif\">"+
								"<b>You have searched an expired consignment. For more details please contact helpline.<b>" +
								"</font></strong>"+
								"</td>" +
								"</tr>" +
								"<tr>" +
								"<td colspan=\"2\" align=\"right\">" +
								"<b> Powered By IVCargo <b>" +
								"</td></tr>" +
								"</table>";
					} else
						html = "";
				} else
					html = "";

				if("".equals(html)){
					LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO, "log >>> 1" );
					html = "<script type=\"text/javascript\">function closeWin(){window.close();}</script>" +
							"<style>" +
							".carve{border:0px solid;border-radius:15px;-moz-border-radius:15px; /* Old Firefox */}  .button { background-color: #95C9E8; /* Green */  border: none; color: white;padding: 10px 30px;  text-align: center;  text-decoration: none;  display: inline-block;  font-size: 13px;  margin: 4px 2px; cursor: pointer;}  </style> " +
							"<style>table{border-collapse:collapse;}table, td, th{border:0px solid black; }</style>" +
							"<table width=\"460\" class=\"carve\" bgcolor=\"#f3f3f3\">" +
							"<input id=\"waybillid2\" type=\"hidden\" value="+waybillid+" /> <tr>" +
							"<td align=\"center\" class=\"carve\" bgcolor=\"#1E90FF\" colspan=\"2\" ><strong><font color=\"#ffffff\" size=\"5\" face=\"Arial, Helvetica, sans-serif\"><b>" +
							"Details OF LR Number : " +
							wayBillNumber +
							"<b></font></strong><input id=\"waybillid\" type=\"hidden\" value="+waybillid+" /></td>" +
							"</tr>" +
							"<tr >" +
							"<td align=\"center\" colspan=\"2\">" +
							"<strong><font color=\"red\" size=\"5\" face=\"Arial, Helvetica, sans-serif\">"+
							"<b>NO Records Found<b>" +
							"</font></strong>"+
							"</td>" +
							"<tr>" +
							"<td colspan=\"2\" align=\"right\">" +
							"<b> Powered By IVCargo <b>" +
							"</td></tr>" +
							//"<tr><td colspan=\"2\" align=\"right\">" +
							//"<input type=\"button\" onclick=\"window.print();\" name=\"Print\" value=\"Print\">" +
							//"<input type=\"button\" onclick=\"closeWin()\" name=\"Close\" value=\"Close\">" +
							//"</td></tr>" +
							"</table>";

				}

				response.setContentType("text/html");
				response.addHeader("Access-Control-Allow-Origin", "*");
				response.addHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE, HEAD");
				response.addHeader("Access-Control-Allow-Headers", "X-PINGOTHER, Origin, X-Requested-With, Content-Type, Accept");
				response.addHeader("Access-Control-Max-Age", "1728000");
				out.println(html);
			}

			out.flush();
			out.close();
		} catch (final Exception _e) {
			_e.printStackTrace();
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR,_e);

		}finally{
			wayBillNumber 		= null;
			accountGroupId		= null;
			html				= null;
			object 				= null;
			innerHtml			= null;
			currentStatus 		= null;
			data = null;

		}
	}

	@SuppressWarnings("unchecked")
	private WayBillStatusDetails[] getHtmlData(final ValueObject valObjIn) throws Exception {

		ValueObject 			valueInObject  				= null;
		ValueObject 			valueOutObject	 			= null;
		WayBillBll 				wayBillBll 					= null;
		WayBillStatusDetails[] 	wayBillStatusDetails		= null;
		var  					accountGroupId				= 0L;
		Branch 					branch						= null;
		SubRegion				subRegion					= null;
		String					deliveryPlace				= null;
		ReceivedSummary			receivedSummary				= null;
		ConsignmentSummary 		consignmentSummary			= null;
		String					deliveryPlaceOnStatus		= null;
		var					isDummyLR					= false;
		RecivablesDispatchLedger recivablesDispatchLedger	= null;
		HashMap<Long, ArrayList<ConsignmentDetails>>	consDetailsCol				= null;
		var 					waybillid					= 0L;
		ArrayList<ShortReceive> 	shortReceiveList	= null;
		ArrayList<ExcessReceive> 	excessReceiveList	= null;
		ArrayList<DamageReceive> 	damageReceiveList	= null;
		String						remark				= null;
		var						branchId			= 0L;

		try {

			wayBillBll			= new WayBillBll();
			valueInObject		= new ValueObject();
			valueOutObject		= new ValueObject();
			new SubRegionBll();
			consignmentSummary 	= new ConsignmentSummary();

			valueInObject.put("wayBillId",valObjIn.get("wayBillId"));
			waybillid				= valObjIn.getLong("wayBillId");
			valueOutObject 			= wayBillBll.getWayBillStatusDetails(valueInObject);
			wayBillStatusDetails 	= (WayBillStatusDetails[])valueOutObject.get("WayBillStatusDetails");
			consDetailsCol			= (HashMap<Long, ArrayList<ConsignmentDetails>>) valueOutObject.get("consDetailsCol");
			accountGroupId 			= Long.parseLong(valObjIn.get("accountGroupId").toString());
			receivedSummary			= ReceivedSummaryDao.getInstance().getReceivedSummary(valObjIn.getLong("wayBillId"));
			valObjIn.put("receivedSummary", receivedSummary);
			recivablesDispatchLedger = DispatchLedgerDao.getInstance().getDispacthLedgerByWBId(valObjIn.getLong("wayBillId"));
			valObjIn.put("dispatchSummary", recivablesDispatchLedger);

			valObjIn.put("consignmentDetailsData", getConsignmentDetails(consDetailsCol, Long.parseLong(valObjIn.get("wayBillId").toString())));
			consignmentSummary		= ConsignmentSummaryDao.getInstance().getConsignmentSummary(Long.parseLong(valObjIn.get("wayBillId").toString()));
			valObjIn.put("totalNoOfArticle",consignmentSummary.getQuantity());
			isDummyLR	= WayBillDao.getInstance().checkDummyLR(waybillid, accountGroupId);

			for (final WayBillStatusDetails wayBillStatusDetail : wayBillStatusDetails) {

				if(wayBillStatusDetail.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_BOOKED) {
					deliveryPlace = wayBillStatusDetail.getDeliveryPlace();
					wayBillStatusDetail.setDeliveryType(ConsignmentSummaryDao.getInstance().getConsignmentSummary(Long.parseLong(valObjIn.get("wayBillId").toString())).getDeliveryTo());
				}
				branch		= BranchDao.getInstance().findByBranchId(wayBillStatusDetail.getSourceBranchId());
				subRegion 	= SubRegionDao.getInstance().getSubRegionById(branch.getSubRegionId());

				wayBillStatusDetail.setSourceSubRegionName(subRegion.getName());
				wayBillStatusDetail.setSourceBranchName(branch.getName());
				if(wayBillStatusDetail.getSrcBranchPhoneNumber() != null && !StringUtils.isEmpty(wayBillStatusDetail.getSrcBranchPhoneNumber()))
					wayBillStatusDetail.setSrcBranchPhoneNumber(branch.getPhoneNumber());
				else
					wayBillStatusDetail.setSrcBranchMobileNumber(branch.getMobileNumber());

				if(wayBillStatusDetail.getDestinationSubRegionId() == 0)
					wayBillStatusDetail.setDestinationSubRegionName("");
				else {
					branch		= BranchDao.getInstance().findByBranchId(wayBillStatusDetail.getDestinationBranchId());
					subRegion	= SubRegionDao.getInstance().getSubRegionById(branch.getSubRegionId());
					wayBillStatusDetail.setDestinationSubRegionName(subRegion.getName());
				}

				if(wayBillStatusDetail.getDestinationBranchId() > 0) {
					branch = BranchDao.getInstance().findByBranchId(wayBillStatusDetail.getDestinationBranchId());
					wayBillStatusDetail.setDestinationBranchName(branch.getName());

					if(wayBillStatusDetail.getDestBranchPhoneNumber() != null && !StringUtils.isEmpty(wayBillStatusDetail.getDestBranchPhoneNumber()))
						wayBillStatusDetail.setDestBranchPhoneNumber(branch.getPhoneNumber());
					else
						wayBillStatusDetail.setDestBranchMobileNumber(branch.getMobileNumber());

					subRegion 	= SubRegionDao.getInstance().getSubRegionById(branch.getSubRegionId());
					wayBillStatusDetail.setDestinationSubRegionName(subRegion.getName());
				} else {
					wayBillStatusDetail.setDestinationBranchName("");

					if(wayBillStatusDetail.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_BOOKED
							|| wayBillStatusDetail.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DISPATCHED)
						wayBillStatusDetail.setDestinationBranchName(deliveryPlace);
					else {
						wayBillStatusDetail.setDestinationSubRegionName(wayBillStatusDetail.getSourceSubRegionName());
						wayBillStatusDetail.setDestinationBranchName(wayBillStatusDetail.getSourceBranchName());
					}
				}

				branch = BranchDao.getInstance().findByBranchId(wayBillStatusDetail.getExecutiveBranchId());
				wayBillStatusDetail.setExecutiveBranchName(branch.getName());

				if( accountGroupId == AccountGroupConstant.ACCOUNT_GROUP_ID_LMT) {
					branch =BranchDao.getInstance().findByBranchId(wayBillStatusDetail.getSourceBranchId());

					subRegion = SubRegionDao.getInstance().getSubRegionById(branch.getSubRegionId());
					wayBillStatusDetail.setSourceSubRegionId(subRegion.getSubRegionId());
					wayBillStatusDetail.setSourceSubRegionName(subRegion.getName());
					branch = null;

					if(wayBillStatusDetail.getDestinationBranchId() > 0)
						branch = BranchDao.getInstance().findByBranchId(wayBillStatusDetail.getDestinationBranchId());

					if(branch!= null) {
						subRegion = SubRegionDao.getInstance().getSubRegionById(branch.getSubRegionId());
						wayBillStatusDetail.setDestinationSubRegionId(subRegion.getSubRegionId());
						wayBillStatusDetail.setDestinationSubRegionName(subRegion.getName());
					}else{
						wayBillStatusDetail.setDestinationSubRegionId(0);
						wayBillStatusDetail.setDestinationSubRegionName(wayBillStatusDetail.getDeliveryPlace());
					}
				}

				valObjIn.put("isDummyLR", isDummyLR);

				if(accountGroupId == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_BOMBAY_ANDHRA_TRANS_ORG && !isDummyLR )
					if(wayBillStatusDetail.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_BOOKED){
						deliveryPlaceOnStatus = "Booked At "+wayBillStatusDetail.getSourceBranchName();
						valObjIn.put("deliveryPlaceOnStatus", deliveryPlaceOnStatus);
					}else if(wayBillStatusDetail.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DISPATCHED){
						deliveryPlaceOnStatus = "In Transit From "+wayBillStatusDetail.getSourceBranchName() +" To "+wayBillStatusDetail.getDestinationBranchName();
						valObjIn.put("deliveryPlaceOnStatus", deliveryPlaceOnStatus);
					}else if(wayBillStatusDetail.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_RECEIVED){
						deliveryPlaceOnStatus = "Lying At "+wayBillStatusDetail.getExecutiveBranchName();
						valObjIn.put("deliveryPlaceOnStatus", deliveryPlaceOnStatus);
					}else if (wayBillStatusDetail.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DELIVERED) {
						deliveryPlaceOnStatus = "Delivered At "+wayBillStatusDetail.getExecutiveBranchName();
						valObjIn.put("deliveryPlaceOnStatus", deliveryPlaceOnStatus);
					}else if(wayBillStatusDetail.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CANCELLED_DELIVERY ){
						deliveryPlaceOnStatus = "Delivery Cancelled At "+wayBillStatusDetail.getExecutiveBranchName();
						valObjIn.put("deliveryPlaceOnStatus", deliveryPlaceOnStatus);
					}else if(wayBillStatusDetail.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CANCELLED ){
						deliveryPlaceOnStatus = "Booking Cancelled At "+wayBillStatusDetail.getExecutiveBranchName();
						valObjIn.put("deliveryPlaceOnStatus", deliveryPlaceOnStatus);
					}

				if(accountGroupId == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_SCC){
					deliveryPlaceOnStatus = "";
					if(wayBillStatusDetail.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CANCELLED_DELIVERY)
						deliveryPlaceOnStatus = "Delivery Cancelled";
					else if(wayBillStatusDetail.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DUEUNDELIVERED)
						deliveryPlaceOnStatus = "Delivery Returned";
					valObjIn.put("deliveryPlaceOnStatus", deliveryPlaceOnStatus);

				}
				shortReceiveList = ShortReceiveDao.getInstance().getShortReceiveListByWayBillId(waybillid, accountGroupId);

				if(shortReceiveList == null) {
					excessReceiveList	 = ExcessReceiveReportDao.getInstance().getExcessReceiveListByWayBillId(waybillid, accountGroupId);

					if(excessReceiveList != null)
						branchId		  = excessReceiveList.get(0).getBranchId();
					else {
						damageReceiveList	  = DamageReceiveDao.getInstance().getDamageReceiveListByWayBillId(waybillid, accountGroupId);

						if(damageReceiveList != null)
							branchId		  = damageReceiveList.get(0).getBranchId();
					}
				} else
					branchId		 = shortReceiveList.get(0).getBranchId();
			}

			if(branchId > 0){
				remark = "Note : For this LR Please contact admin contact no. ";
				valObjIn.put("remark", remark);
			}

			return wayBillStatusDetails;

		} catch (final Exception e) {
			e.printStackTrace();
			throw e;
		} finally {
			valueInObject  			= null;
			valueOutObject	 		= null;
			wayBillBll 				= null;
			wayBillStatusDetails	= null;
			branch					= null;
			subRegion				= null;
			deliveryPlace			= null;
			deliveryPlaceOnStatus	= null;
		}
	}

	private ValueObject getHtml(final WayBillStatusDetails[] wayBillStatusDetails, final ValueObject valObjIn) throws Exception{

		String 				html 							= null;
		SimpleDateFormat 	sdf								= null;
		String[]  			wayBillStatusArr				= null;
		String 				lastAt 							= null;
		ValueObject 		valObjOut 						= null;
		var				accountGroupId					= 0L;
		var 			bookingCounter					= false;
		var 			inTransitCounter				= false;
		var 			deliveryCounter					= false;
		var 			canceledCounter					= false;
		var				receivedCounter					= false;
		ReceivedSummary		receivedSummary					= null;
		var				isReceivedStatusNeeded			= false;
		var 			inTransitBranchCounter			= false;
		var 			dueDeliveredCounter				= false;
		var 			dueUnDeliveredCounter			= false;
		RecivablesDispatchLedger recivablesDispatchLedger 	= null;
		var				isDummyLR						= false;
		WayBill				wayBill							= null;
		var				wayBillId						= 0L;
		Branch 				branchModel						= null;
		try {
			sdf				= new SimpleDateFormat("dd MMM yyyy HH:mm aaa");
			accountGroupId	= Long.parseLong(valObjIn.get("accountGroupId").toString());
			isDummyLR		=  valObjIn.getBoolean("isDummyLR");
			html ="";
			if(accountGroupId == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_BOMBAY_ANDHRA_TRANS_ORG)
				html += !isDummyLR ? "</tr>" : " ";
			else{
				html +=	"""
						<tr>\
						<td colspan="2">\
						<table class="carve" cellpadding="5px" border="1" style ="font-size:12px;" class="tableForViewDeatils" width="100%">\
						<tr>""";

				html += "</tr>";
			}
			// Store Booking Date
			receivedSummary				= (ReceivedSummary) valObjIn.get("receivedSummary");
			recivablesDispatchLedger	= (RecivablesDispatchLedger)valObjIn.get("dispatchSummary");
			wayBillId					= valObjIn.getLong("wayBillId",0);

			final var condition = (accountGroupId == CargoAccountGroupConstant.ACCOUNT_GORUP_ID_SOUTHERN || accountGroupId == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_SNGT || accountGroupId == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_KERALA || accountGroupId == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_KCM) && wayBillStatusDetails[wayBillStatusDetails.length-1].getStatus() != WayBillStatusConstant.WAYBILL_STATUS_DELIVERED;

			if(condition)
				isReceivedStatusNeeded	= true;

			for (final WayBillStatusDetails wayBillStatusDetail : wayBillStatusDetails) {
				wayBillStatusArr =  wayBillStatusDetail.getNumber().split(":");
				lastAt = wayBillStatusDetail.getExecutiveBranchName();
				if(wayBillStatusDetail.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_BOOKED){
					if(accountGroupId == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_BOMBAY_ANDHRA_TRANS_ORG){
						if(!isDummyLR)
							html += """
									<tr>\
									<td><strong><font color="#000000" size="2" face="Arial, Helvetica, sans-serif"><b>Booking Date :<b></font></strong></td>\
									<td><strong><font color="#ff004e" size="2" face="Arial, Helvetica, sans-serif"><b>""";
						else
							html += "" ;
					} else
						html += """
								<tr>\
								<td><strong><font color="#000000" size="2" face="Arial, Helvetica, sans-serif"><b>Booking Date<b></font></strong></td>\
								<td><strong><font color="#000000" size="2" face="Arial, Helvetica, sans-serif"><b>""";

					if(wayBillStatusDetail.getDate() != null && wayBillStatusDetail.getDate().toString().length() != 0)
						html +=	accountGroupId == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_BOMBAY_ANDHRA_TRANS_ORG ? DateTimeUtility.getDateFromTimeStamp(wayBillStatusDetail.getDate()) : StringUtils.trim(sdf.format(wayBillStatusDetail.getDate()));
					else
						html +=" -- ";

					if(accountGroupId == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_BOMBAY_ANDHRA_TRANS_ORG){
						if(!isDummyLR){
							html +=	"<td><strong><font color=\"#000000\" size=\"2\" face=\"Arial, Helvetica, sans-serif\"><b>Delivery Type :<b></font></strong></td>" +
									"<td><strong><font color=\"#ff004e\" size=\"2\" face=\"Arial, Helvetica, sans-serif\"><b>";
							html += TransportCommonMaster.getInfoForDelivery(wayBillStatusDetail.getDeliveryType());

							html +=	"<b></font></strong></td>" +
									"</tr>"
									;
						} else
							html +=	" ";
					}else{
						html +=	"""
								<b></font></strong></td>\
								</tr>\
								<tr>\
								<td><strong><font color="#000000" size="2" face="Arial, Helvetica, sans-serif"><b>From<b></font></strong></td>\
								<td><strong><font color="#000000" size="2" face="Arial, Helvetica, sans-serif"><b>""";



						if(wayBillStatusDetail.getSourceBranchName()!=null && StringUtils.trim(wayBillStatusDetail.getSourceBranchName()).length() != 0){
							html += StringUtils.trim(wayBillStatusDetail.getSourceBranchName());
							if(accountGroupId == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_AAKASH)
								if(wayBillStatusDetail.getSrcBranchPhoneNumber() != null && !StringUtils.isEmpty(wayBillStatusDetail.getSrcBranchPhoneNumber()))
									html += " (" + Utility.validateContact(wayBillStatusDetail.getSrcBranchPhoneNumber()) +")";
								else
									html += " (" + Utility.validateContact(wayBillStatusDetail.getSrcBranchMobileNumber()) + ")";
						} else
							html +=" -- ";
					}
					if(accountGroupId == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_BOMBAY_ANDHRA_TRANS_ORG){
						html += """
								<tr>\
								<td><strong><font color="#000000" size="2" face="Arial, Helvetica, sans-serif"><b>From :<b></font></strong></td>\
								<td><strong><font color="#ff004e" size="2" face="Arial, Helvetica, sans-serif"><b>""";
						if(wayBillStatusDetail.getSourceBranchName()!=null && StringUtils.trim(wayBillStatusDetail.getSourceBranchName()).length() != 0)
							html += StringUtils.trim(wayBillStatusDetail.getSourceBranchName());
						else
							html +=" -- ";

						html +=	"<td><strong><font color=\"#000000\" size=\"2\" face=\"Arial, Helvetica, sans-serif\"><b>To:<b></font></strong></td>" +
								"<td><strong><font color=\"#ff004e\" size=\"2\" face=\"Arial, Helvetica, sans-serif\"><b>";

						if(wayBillStatusDetail.getDestinationBranchName() != null && StringUtils.trim(wayBillStatusDetail.getDestinationBranchName()).length() != 0)
							html += StringUtils.trim(wayBillStatusDetail.getDestinationBranchName());
						else
							html +=" -- ";

					}else{
						html +=	"""
								<b></font></strong></td>\
								</tr>\
								<tr>\
								<td><strong><font color="#000000" size="2" face="Arial, Helvetica, sans-serif"><b>To<b></font></strong></td>\
								<td><strong><font color="#000000" size="2" face="Arial, Helvetica, sans-serif"><b>""";
						if(wayBillStatusDetail.getDestinationBranchName() != null && StringUtils.trim(wayBillStatusDetail.getDestinationBranchName()).length() != 0){
							html += StringUtils.trim(wayBillStatusDetail.getDestinationBranchName());
							if(accountGroupId == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_AAKASH)
								if(wayBillStatusDetail.getDestBranchPhoneNumber() != null && !StringUtils.isEmpty(wayBillStatusDetail.getDestBranchPhoneNumber()))
									html +=" (" +Utility.validateContact(wayBillStatusDetail.getDestBranchPhoneNumber())+")";
								else
									html +=" (" +Utility.validateContact(wayBillStatusDetail.getDestBranchMobileNumber())+")";
						} else
							html +=" -- ";
					}
					if(accountGroupId == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_SNGT || accountGroupId == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_KERALA || accountGroupId == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_KCM){
						html +=	"""
								<b></font></strong></td>\
								</tr>\
								<tr>\
								<td><strong><font color="#000000" size="2" face="Arial, Helvetica, sans-serif"><b>Articles<b></font></strong></td>\
								<td><strong><font color="#000000" size="2" face="Arial, Helvetica, sans-serif"><b>""";
						html += valObjIn.getString("consignmentDetailsData");
					}

					if(accountGroupId == CargoAccountGroupConstant.ACCOUNT_GORUP_ID_SOUTHERN || accountGroupId == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_SNGT || accountGroupId == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_KERALA || accountGroupId == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_KCM)
						html +=	"<b></font></strong></td>" +
								"</tr>";
					else if(accountGroupId == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_BOMBAY_ANDHRA_TRANS_ORG){}else{
						html +=	"""
								<b></font></strong></td>\
								</tr>\
								<tr>\
								<td><strong><font color="#000000" size="2" face="Arial, Helvetica, sans-serif"><b>Delivery Type<b></font></strong></td>\
								<td><strong><font color="#000000" size="2" face="Arial, Helvetica, sans-serif"><b>""";
						if(wayBillStatusDetail.getDeliveryType() == InfoForDeliveryConstant.DELIVERY_TO_DOOR_ID)
							html += "Door Delivery";
						else
							html += TransportCommonMaster.getInfoForDelivery(wayBillStatusDetail.getDeliveryType());

						html +=	"<b></font></strong></td>" +
								"</tr>"
								;
						if(accountGroupId == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_BHASKAR){
							wayBill = WayBillDao.getInstance().getWayBill((short)0,wayBillId,"",0);
							if(wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_RECEIVED) {
								branchModel = BranchDao.getInstance().findByBranchId(receivedSummary.getTurBranchId());
								html +=	"<td><strong><font color=\"#000000\" size=\"2\" face=\"Arial, Helvetica, sans-serif\"><b>Received at<b></font></strong></td>" +
										"<td><strong><font color=\"#000000\" size=\"2\" face=\"Arial, Helvetica, sans-serif\"><b>";
								html += (branchModel.getName() != null ? branchModel.getName() : "--") + "("+(branchModel.getMobileNumber() != null ? branchModel.getMobileNumber() : "--")+")";

								html +=	"<b></font></strong></td>" +
										"</tr>"
										;
							} else
								html +=	" ";
						}

					}
					bookingCounter	 = true;
				}

				if(accountGroupId == CargoAccountGroupConstant.ACCOUNT_GORUP_ID_SOUTHERN || accountGroupId == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_SNGT || accountGroupId == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_KERALA || accountGroupId == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_KCM){
					if(wayBillStatusDetail.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DISPATCHED )
						inTransitCounter = true;

					if(wayBillStatusDetail.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DISPATCHED && inTransitCounter && recivablesDispatchLedger!= null && recivablesDispatchLedger.isDDDV()){
						html +=
								"""
								<tr>\
								<td><strong><font color="#000000" size="2" face="Arial, Helvetica, sans-serif"><b>Loading Date<b></font></strong></td>\
								<td><strong><font color="#000000" size="2" face="Arial, Helvetica, sans-serif"><b>""";
						if(recivablesDispatchLedger != null)
							html += DateTimeUtility.getDateFromTimeStamp(recivablesDispatchLedger.getTripDateTime(), "dd MMM yyyy HH:mm aaa");
						html +=
								"""
								<tr>\
								<td><strong><font color="#000000" size="2" face="Arial, Helvetica, sans-serif"><b>Vehicle Number<b></font></strong></td>\
								<td><strong><font color="#000000" size="2" face="Arial, Helvetica, sans-serif"><b>""";
						if(recivablesDispatchLedger != null && recivablesDispatchLedger.getVehicleNumber() != null && !StringUtils.isEmpty(recivablesDispatchLedger.getVehicleNumber()))
							html += recivablesDispatchLedger.getVehicleNumber();
						html +=
								"""
								<tr>\
								<td><strong><font color="#000000" size="2" face="Arial, Helvetica, sans-serif"><b>Driver Phone No.<b></font></strong></td>\
								<td><strong><font color="#000000" size="2" face="Arial, Helvetica, sans-serif"><b>""";
						if(recivablesDispatchLedger != null && recivablesDispatchLedger.getDriverMobileNumber() != null && !StringUtils.isEmpty(recivablesDispatchLedger.getDriverMobileNumber()))
							html += recivablesDispatchLedger.getDriverMobileNumber();
					}

					if(wayBillStatusDetail.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_RECEIVED && isReceivedStatusNeeded && !receivedCounter){
						html +=
								"""
								<tr>\
								<td><strong><font color="#000000" size="2" face="Arial, Helvetica, sans-serif"><b>Received Date<b></font></strong></td>\
								<td><strong><font color="#000000" size="2" face="Arial, Helvetica, sans-serif"><b>""";
						if(receivedSummary.getWayBillReceivedTime()!=null && receivedSummary.getWayBillReceivedTime().toString().length() != 0)
							//html +=	sdf.format(receivedSummary.getWayBillReceivedTime()).trim();
							html += DateTimeUtility.getDateFromTimeStamp(receivedSummary.getWayBillReceivedTime(), "dd MMM yyyy HH:mm aaa");
						else
							html +=" -- ";

						html +=	"""
								<b></font></strong></td>\
								</tr>\
								<tr>\
								<td><strong><font color="#000000" size="2" face="Arial, Helvetica, sans-serif"><b>Received At<b></font></strong></td>\
								<td><strong><font color="#000000" size="2" face="Arial, Helvetica, sans-serif"><b>""";
						html += BranchDao.getInstance().findByBranchId(receivedSummary.getTurBranchId()).getName()+
								"<b></font></strong></td>" +
								"</tr>"
								;

						if(wayBillStatusDetails[0].getDestinationBranchId() == receivedSummary.getTurBranchId())
							receivedCounter	 = true;
						else
							inTransitBranchCounter = true;

					}
				} else if(wayBillStatusDetail.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DISPATCHED || wayBillStatusDetail.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_RECEIVED)
					if(accountGroupId == ECargoConstantFile.ACCOUNTGROUPID_LMT || receivedSummary == null)
						inTransitCounter = true;
					else if(wayBillStatusDetails[0].getDestinationBranchId() == receivedSummary.getTurBranchId())
						receivedCounter = true;
					else
						inTransitBranchCounter = true;



				if(wayBillStatusDetail.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CANCELLED)
					canceledCounter = true;

				if(wayBillStatusDetail.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DUEUNDELIVERED)
					dueUnDeliveredCounter = true;

				if(wayBillStatusDetail.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DUEDELIVERED && accountGroupId != ECargoConstantFile.ACCOUNTGROUPID_LMT)
					dueDeliveredCounter = true;

				if(wayBillStatusDetail.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DELIVERED)
					if(accountGroupId == CargoAccountGroupConstant.ACCOUNT_GORUP_ID_SOUTHERN || accountGroupId == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_SNGT || accountGroupId == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_KERALA || accountGroupId == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_KCM) {
						html +=
								"""
								<tr>\
								<td><strong><font color="#000000" size="2" face="Arial, Helvetica, sans-serif"><b>Delivery Date<b></font></strong></td>\
								<td><strong><font color="#000000" size="2" face="Arial, Helvetica, sans-serif"><b>""" ;
						if( wayBillStatusDetail.getDate()!= null && StringUtils.trim(sdf.format(wayBillStatusDetail.getDate())).length() != 0)
							//html += sdf.format(wayBillStatusDetails[i].getDate()).trim();
							html += DateTimeUtility.getDateFromTimeStamp(wayBillStatusDetail.getDate(), "dd MMM yyyy HH:mm aaa");
						else
							html +=" -- ";
						html += "<b></font></strong></td>" +
								"</tr>";
						deliveryCounter = true;

					} else /*html +="<tr>" +
							"<td class=\"carve\"><strong><font color=\"#000000\" size=\"2\" face=\"Arial, Helvetica, sans-serif\"><b>Delivery Place<b></font></strong></td>" +
							"<td class=\"carve\"><strong><font color=\"#000000\" size=\"2\" face=\"Arial, Helvetica, sans-serif\"><b>";
					if(wayBillStatusDetails[i].getDeliveryPlace()!= null){
						if(wayBillStatusDetails[i].getDeliveryPlace().trim().length() != 0){
							html += wayBillStatusDetails[i].getDeliveryPlace().trim();
						}else{
							html +=" -- ";
						}

					}else{
						html += " -- ";
					}*/
						if(accountGroupId == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_BOMBAY_ANDHRA_TRANS_ORG){
							if(!isDummyLR){
								html +=	"<tr>" +
										"<b></font></strong></td>" +
										"<td><strong><font color=\"#000000\" size=\"2\" face=\"Arial, Helvetica, sans-serif\"><b>Delivery CR No:<b></font></strong></td>" +
										"<td><strong><font color=\"#ff004e\" size=\"2\" face=\"Arial, Helvetica, sans-serif\"><b>" +
										wayBillStatusArr[1] +
										"<b></font></strong></td>" ;


								html +=	"<td><strong><font color=\"#000000\" size=\"2\" face=\"Arial, Helvetica, sans-serif\"><b>Delivery Date:<b></font></strong></td>" +
										"<td><strong><font color=\"#ff004e\" size=\"2\" face=\"Arial, Helvetica, sans-serif\"><b>" ;
								if( wayBillStatusDetail.getDate()!= null && StringUtils.trim(sdf.format(wayBillStatusDetail.getDate())).length() != 0)
									//html += sdf.format(wayBillStatusDetails[i].getDate()).trim();
									html += DateTimeUtility.getDateFromTimeStamp(wayBillStatusDetail.getDate());
								else
									html +=" -- ";
								html +=	"</tr>";
								deliveryCounter = true;
							} else
								html +=" ";
						}else{
							html +=	"""
									<b></font></strong></td>\
									</tr>\
									<tr>\
									<td><strong><font color="#000000" size="2" face="Arial, Helvetica, sans-serif"><b>Delivery Date<b></font></strong></td>\
									<td><strong><font color="#000000" size="2" face="Arial, Helvetica, sans-serif"><b>""" ;
							if( wayBillStatusDetail.getDate()!= null && StringUtils.trim(sdf.format(wayBillStatusDetail.getDate())).length() != 0)
								//html += sdf.format(wayBillStatusDetails[i].getDate()).trim();
								html += DateTimeUtility.getDateFromTimeStamp(wayBillStatusDetail.getDate(), "dd MMM yyyy HH:mm aaa");
							else
								html +=" -- ";
							html += "<b></font></strong></td>" +
									"</tr>"+
									"<tr>" +
									"<td><strong><font color=\"#000000\" size=\"2\" face=\"Arial, Helvetica, sans-serif\"><b>Delivery CR No<b></font></strong></td>" +
									"<td><strong><font color=\"#000000\" size=\"2\" face=\"Arial, Helvetica, sans-serif\"><b>" +
									wayBillStatusArr[1] +
									"<b></font></strong></td>" +
									"</tr>"
									;
							deliveryCounter = true;
						}
			}

			/*if(accountGroupId != CargoAccountGroupConstant.ACCOUNT_GORUP_ID_SOUTHERN || accountGroupId == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_SNGT) {
				html += "<tr>" +
						"<td class=\"carve\"><strong><font color=\"#000000\" size=\"2\" face=\"Arial, Helvetica, sans-serif\"><b>Currently At<b></font></strong></td>" +
						"<td class=\"carve\"><strong><font color=\"#000000\" size=\"2\" face=\"Arial, Helvetica, sans-serif\"><b>"+
						lastAt+
						"<b></font></strong></td>" +
						"</tr>";
			}*/

			valObjOut = new ValueObject();
			valObjOut.put("html", html);
			valObjOut.put("bookingCounter", bookingCounter);
			valObjOut.put("deliveryCounter", deliveryCounter);
			valObjOut.put("inTransitCounter", inTransitCounter);
			valObjOut.put("canceledCounter", canceledCounter);
			valObjOut.put("receivedCounter", receivedCounter);
			valObjOut.put("lastAt", lastAt);
			valObjOut.put("inTransitBranchCounter", inTransitBranchCounter);
			valObjOut.put("dueDeliveredCounter", dueDeliveredCounter);
			valObjOut.put("dueUnDeliveredCounter", dueUnDeliveredCounter);
			html +="</table>";
			html +="</td>";
			html +="</tr>";
			return valObjOut;

		}catch (final Exception e) {
			throw e;
		}finally{
			html 				= null;
			sdf					= null;
			wayBillStatusArr	= null;
			lastAt 				= null;
		}
	}

	private String getConsignmentDetails(final HashMap<Long, ArrayList<ConsignmentDetails>>  consDetailsCol,final long wayBillId)throws Exception{

		StringBuilder					values								= null;
		var							totalQuantity						= 0L;
		String							totalPackageDetails					= null;
		ArrayList<ConsignmentDetails>	consDetailsList						= null;

		try {
			values				= new StringBuilder();
			if (consDetailsCol != null){
				consDetailsList		= consDetailsCol.get(wayBillId);
				if (consDetailsList != null)
					for (var j = 0; j < consDetailsList.size(); j++){
						totalQuantity				+= consDetailsList.get(j).getQuantity();

						if(j == 0)
							totalPackageDetails		= consDetailsList.get(j).getQuantity() + " " + consDetailsList.get(j).getPackingTypeName();
						else
							totalPackageDetails		= totalPackageDetails + " / " + consDetailsList.get(j).getQuantity() + " " + consDetailsList.get(j).getPackingTypeName();
					}
				if(consDetailsList.size() == 1)
					values.append(totalPackageDetails);
				else
					values.append(totalQuantity + " (" + totalPackageDetails + ")");
			}

			return values.toString();

		} catch (final Exception e) {
			throw e;
		} finally{
			values								= null;
			totalPackageDetails					= null;
			consDetailsList						= null;
		}


	}

}