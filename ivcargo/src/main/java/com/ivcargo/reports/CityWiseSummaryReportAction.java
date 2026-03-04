package com.ivcargo.reports;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.displaydata.DisplayDataConfigurationBll;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.reports.CityWiseSummaryDAO;
import com.platform.dto.AliasNameConstants;
import com.platform.dto.Branch;
import com.platform.dto.Executive;
import com.platform.dto.TransportCommonMaster;
import com.platform.dto.configuration.master.DisplayDataConfigurationDTO;
import com.platform.dto.configuration.report.common.CommonReportsConfigurationDTO;
import com.platform.dto.constant.WayBillStatusConstant;
import com.platform.dto.constant.WayBillTypeConstant;
import com.platform.dto.model.CityWiseCollectionModel;
import com.platform.dto.model.CityWiseCollectionReportModel;
import com.platform.resource.CargoErrorList;
import com.platform.utils.PropertiesUtility;

public class CityWiseSummaryReportAction  implements Action {

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>  					error 								= null;
		CacheManip									cache								= null;
		Executive									executive							= null;
		ValueObject									objectIn							= null;
		ValueObject									objectOut							= null;
		SimpleDateFormat							sdf									= null;
		Timestamp									fromDate							= null;
		Timestamp									toDate								= null;
		StringBuilder								branchesString						= null;
		CityWiseCollectionModel						bkdMdl								= null;
		CityWiseCollectionReportModel[]				reportModel							= null;
		HashMap<Long,CityWiseCollectionModel>		bookingCollection					= null;
		HashMap<String,Double>						allWayBillTypeTotals				= null;
		boolean										isDonotShowWayBillTypeWiseData		= false;
		Timestamp									createDate 							= null;
		ValueObject									displayDataConfig					= null;
		ValueObject									valueObjectIn						= null;
		long 										selectedCity    					=  0;
		long 										selectedBranch						=  0;
		long										selectedRegion						=  0;
		Branch[]    								branches  							= null;
		ValueObject									confValObj							= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeCityWiseSummaryReportAction().execute(request, response);

			cache			= new CacheManip(request);
			executive 		= (Executive) request.getSession().getAttribute("executive");
			objectIn 		= new ValueObject();
			objectOut 		= new ValueObject();
			sdf             = new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			fromDate        = new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00").getTime());
			toDate          = new Timestamp(sdf.parse(JSPUtility.GetString(request, "toDate") + " 23:59:59").getTime());
			branchesString	= new StringBuilder();
			createDate 		= new Timestamp(new java.util.Date().getTime());
			confValObj 		= cache.getCommonReportsConfiguration(request, executive.getAccountGroupId());

			if(request.getParameter("region") != null) {
				selectedRegion = JSPUtility.GetLong(request, "region");
				objectIn.put("regionId", selectedRegion);

			}

			if(request.getParameter("subRegion") != null) {
				selectedCity = JSPUtility.GetLong(request, "subRegion");
				objectIn.put("sourceCityId", selectedCity);
			}
			if(request.getParameter("branch") != null) {
				selectedBranch = JSPUtility.GetLong(request, "branch");
				objectIn.put("sourceBranchId", selectedBranch);
			}


			//Get all Branches
			if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_GROUPADMIN) {

				if(confValObj.getBoolean(CommonReportsConfigurationDTO.SHOW_REGION_LABEL,false)){
					if(selectedRegion == 0)
						branchesString.append(cache.getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_GROUP, 0));
					else if (selectedRegion >0 && selectedCity <= 0  && selectedBranch <= 0)
						branchesString.append(cache.getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_REGION, selectedRegion));
					else if(selectedRegion > 0 && selectedCity > 0  && selectedBranch <= 0)
						branchesString.append(cache.getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_SUBREGION, selectedCity));
					else
						branchesString.append(""+selectedBranch);
				} else if(selectedBranch == 0)
					branchesString.append(cache.getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_SUBREGION, selectedCity));
				else
					branchesString.append(""+selectedBranch);
			} else
				branchesString.append(""+executive.getBranchId());

			if(selectedCity > 0) {
				branches = cache.getBranchesArrayBySubRegionId(request, executive.getAccountGroupId(), selectedCity);
				request.setAttribute("branches", branches);
			}
			objectIn.put("fromDate", fromDate);
			objectIn.put("toDate", toDate);
			objectIn.put("executive", executive);
			objectIn.put("branchesString", branchesString.toString());


			objectOut = CityWiseSummaryDAO.getInstance().getCityWiseSummaryReport(objectIn);

			reportModel = (CityWiseCollectionReportModel[])objectOut.get("ReportModel");

			if(reportModel.length > 0) {

				bookingCollection = new  HashMap<Long, CityWiseCollectionModel>();

				//Booking total variables
				double totalBookingPaidAmount =0;
				double totalBookingToPayAmount =0;
				double totalBookingCreditorAmount =0;
				double totalBookingPaidManaulAmount =0;
				double totalBookingToPayManaulAmount =0;
				double totalBookingCreditorManaulAmount =0;

				displayDataConfig						= cache.getDisplayDataConfiguration(request, executive.getAccountGroupId());
				isDonotShowWayBillTypeWiseData			= PropertiesUtility.isAllow(displayDataConfig.getString(DisplayDataConfigurationDTO.IS_DONOT_SHOW_WAY_BILL_TYPE_WISE_DATA_IN_REPORTS, "false"));
				valueObjectIn							= new ValueObject();

				for (int i = 0; i < reportModel.length; i++) {

					if (isDonotShowWayBillTypeWiseData) {
						valueObjectIn.put(AliasNameConstants.CURRENT_DATE_TIMESTAMP, createDate);
						valueObjectIn.put(AliasNameConstants.WAYBILL_TYPE_ID, reportModel[i].getWayBillTypeId());
						valueObjectIn.put(AliasNameConstants.SOURCE_BRANCH_ID, reportModel[i].getWayBillSourceBranchId());
						valueObjectIn.put(AliasNameConstants.DATE_TIMESTAMP, reportModel[i].getCreationTimeStamp());
						valueObjectIn.put(AliasNameConstants.EXECUTIVE_ID, executive.getExecutiveId());
						valueObjectIn.put(AliasNameConstants.WAYBILL_STATUS_ID, reportModel[i].getStatus());
						valueObjectIn.put(AliasNameConstants.IS_SHOW_WAYBILL, reportModel[i].isShowWayBill());
						if(DisplayDataConfigurationBll.getInstance().isDisplayWayBillTypeWiseData(displayDataConfig, valueObjectIn))
							continue;
					}

					if(reportModel[i].getStatus()==WayBillStatusConstant.WAYBILL_STATUS_CANCELLED)
						reportModel[i].setGrandTotal(- reportModel[i].getGrandTotal());

					if(bookingCollection.get(reportModel[i].getWayBillDestinationSubRegionId()) != null) {//if city is already there, update it

						bkdMdl = bookingCollection.get(reportModel[i].getWayBillDestinationSubRegionId());
						if(!reportModel[i].isManual()){
							if(reportModel[i].getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_PAID){
								bkdMdl.setTotalPaidAmount(bkdMdl.getTotalPaidAmount()+reportModel[i].getGrandTotal());
								totalBookingPaidAmount=totalBookingPaidAmount+reportModel[i].getGrandTotal();
							}else if(reportModel[i].getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_TO_PAY){
								totalBookingToPayAmount=totalBookingToPayAmount+reportModel[i].getGrandTotal();
								bkdMdl.setTotalToPayAmount(bkdMdl.getTotalToPayAmount()+reportModel[i].getGrandTotal());
							}else if(reportModel[i].getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_CREDIT){
								bkdMdl.setTotalCreditorAmount(bkdMdl.getTotalCreditorAmount()+reportModel[i].getGrandTotal());
								totalBookingCreditorAmount=totalBookingCreditorAmount+reportModel[i].getGrandTotal();
							}
						} else if(reportModel[i].getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_PAID ){
							bkdMdl.setTotalPaidManaulAmount(bkdMdl.getTotalPaidManaulAmount()+reportModel[i].getGrandTotal());
							totalBookingPaidManaulAmount=totalBookingPaidManaulAmount+reportModel[i].getGrandTotal();
						}else if(reportModel[i].getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_TO_PAY ){
							bkdMdl.setTotalToPayManaulAmount(bkdMdl.getTotalToPayManaulAmount()+reportModel[i].getGrandTotal());
							totalBookingToPayManaulAmount=totalBookingToPayManaulAmount+reportModel[i].getGrandTotal();
						}else if(reportModel[i].getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_CREDIT){
							bkdMdl.setTotalCreditorManaulAmount(bkdMdl.getTotalCreditorManaulAmount()+reportModel[i].getGrandTotal());
							totalBookingCreditorManaulAmount=totalBookingCreditorManaulAmount+reportModel[i].getGrandTotal();
						}
					}else{//Add New City
						bkdMdl = new CityWiseCollectionModel();
						if(!reportModel[i].isManual()){
							if(reportModel[i].getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_PAID){
								bkdMdl.setTotalPaidAmount(reportModel[i].getGrandTotal());
								totalBookingPaidAmount=totalBookingPaidAmount+reportModel[i].getGrandTotal();
							}else if(reportModel[i].getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_TO_PAY){
								bkdMdl.setTotalToPayAmount(+reportModel[i].getGrandTotal());
								totalBookingToPayAmount=totalBookingToPayAmount+reportModel[i].getGrandTotal();
							}else if(reportModel[i].getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_CREDIT){
								bkdMdl.setTotalCreditorAmount(reportModel[i].getGrandTotal());
								totalBookingCreditorAmount=totalBookingCreditorAmount+reportModel[i].getGrandTotal();
							}
						} else if(reportModel[i].getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_PAID ){
							bkdMdl.setTotalPaidManaulAmount(reportModel[i].getGrandTotal());
							totalBookingPaidManaulAmount=totalBookingPaidManaulAmount+reportModel[i].getGrandTotal();
						}else if(reportModel[i].getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_TO_PAY ){
							bkdMdl.setTotalToPayManaulAmount(reportModel[i].getGrandTotal());
							totalBookingToPayManaulAmount=totalBookingToPayManaulAmount+reportModel[i].getGrandTotal();
						}else if(reportModel[i].getWayBillTypeId()==WayBillTypeConstant.WAYBILL_TYPE_CREDIT){
							bkdMdl.setTotalCreditorManaulAmount(reportModel[i].getGrandTotal());
							totalBookingCreditorManaulAmount=totalBookingCreditorManaulAmount+reportModel[i].getGrandTotal();
						}
						//Add City to Collection
						bkdMdl.setSubRegionId(reportModel[i].getWayBillDestinationSubRegionId());
						bkdMdl.setSubRegionName(cache.getGenericSubRegionById(request, reportModel[i].getWayBillDestinationSubRegionId()).getName());
						bookingCollection.put(reportModel[i].getWayBillDestinationSubRegionId(),bkdMdl);
					}
				}

				if(bookingCollection.size() > 0) {

					allWayBillTypeTotals = new HashMap<String,Double>();
					//variable to store Column count (for Dynamic table generation)
					short bookingColCount = 0;

					if(totalBookingPaidAmount>0 || totalBookingPaidAmount < 0)bookingColCount++;
					if(totalBookingToPayAmount>0 || totalBookingToPayAmount < 0)bookingColCount++;
					if(totalBookingCreditorAmount>0 || totalBookingCreditorAmount < 0)bookingColCount++;
					if(totalBookingPaidManaulAmount>0 || totalBookingPaidManaulAmount < 0)bookingColCount++;
					if(totalBookingToPayManaulAmount>0 || totalBookingToPayManaulAmount < 0)bookingColCount++;
					if(totalBookingCreditorManaulAmount>0 || totalBookingCreditorManaulAmount < 0)bookingColCount++;

					//There are total 6 types of way bills for this report
					allWayBillTypeTotals.put("BOOKING_PAID", totalBookingPaidAmount);
					allWayBillTypeTotals.put("BOOKING_TOPAY", totalBookingToPayAmount);
					allWayBillTypeTotals.put("BOOKING_CREDIT", totalBookingCreditorAmount);
					allWayBillTypeTotals.put("BOOKING_PAID_MANUAL", totalBookingPaidManaulAmount);
					allWayBillTypeTotals.put("BOOKING_TOPAY_MANUAL", totalBookingToPayManaulAmount);
					allWayBillTypeTotals.put("BOOKING_CREDIT_MANUAL", totalBookingCreditorManaulAmount);

					request.setAttribute("allWayBillTypeTotals",allWayBillTypeTotals);
					request.setAttribute("bookingCollection",bookingCollection);
					request.setAttribute("bookingColCount",bookingColCount);
					request.setAttribute("report",reportModel);

					ActionStaticUtil.setReportViewModel(request);
					request.setAttribute("nextPageToken", "success");
				}
			} else {
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		} finally {
			error 				= null;
			cache				= null;
			executive			= null;
			objectIn			= null;
			objectOut			= null;
			sdf					= null;
			fromDate			= null;
			toDate				= null;
			branchesString		= null;
			bkdMdl				= null;
			reportModel			= null;
			bookingCollection	= null;
			allWayBillTypeTotals= null;
			displayDataConfig	= null;
			valueObjectIn		= null;
			createDate			= null;
			branches  			= null;

		}
	}
}