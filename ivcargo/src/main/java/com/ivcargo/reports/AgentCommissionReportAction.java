package com.ivcargo.reports;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.dto.constant.WayBillStatusConstant;
import com.iv.dto.constant.WayBillTypeConstant;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.reports.initialize.InitializeAgentCommissionReport;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.reports.AgentCommissionDAO;
import com.platform.dao.reports.WayBillDetailsDAO;
import com.platform.dto.ChargeTypeMaster;
import com.platform.dto.Executive;
import com.platform.dto.WayBillCharges;
import com.platform.dto.model.ALLBranchWiseCollectionReportModel;
import com.platform.dto.model.AgentBranchTotalCommission;
import com.platform.dto.model.AgentCommisionReportModel;
import com.platform.dto.model.BranchCommissionMap;
import com.platform.dto.model.CommissionConfigurationMap;
import com.platform.dto.model.ReportViewModel;
import com.platform.dto.model.WayBillDeatailsModel;
import com.platform.resource.CargoErrorList;

public class AgentCommissionReportAction implements Action {

	@Override
	@SuppressWarnings({ "rawtypes", "unchecked" })
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	 	error 			= null;

		try {

			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeAgentCommissionReport().execute(request, response);

			final var 	sdf         = new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			final var   executive 	= (Executive) request.getSession().getAttribute("executive");
			final var 	objectIn 	= new ValueObject();
			var 		objectOut 	= new ValueObject();
			final var        	fromDate    = new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00").getTime());
			final var        	toDate      = new Timestamp(sdf.parse(JSPUtility.GetString(request, "toDate") + " 23:59:59").getTime());
			final var 			cache		= new CacheManip(request);
			objectIn.put("fromDate", fromDate);
			objectIn.put("toDate", toDate);
			objectIn.put("accountGroupId", executive.getAccountGroupId());
			//Agents
			final var agentList = new ArrayList<>();
			agentList.add(174);//
			agentList.add(175);//
			agentList.add(176);//
			agentList.add(199);//
			agentList.add(200);//
			agentList.add(202);//
			agentList.add(203);//
			agentList.add(207);//
			agentList.add(348);//

			objectOut = AgentCommissionDAO.getInstance().getAgentCommissionReport(objectIn);
			final var bUnloading = AgentCommissionDAO.getInstance().getBranchUnloadingAmount(objectIn);
			if(objectOut != null){

				final var reportModel = (AgentCommisionReportModel[])objectOut.get("AgentCommisionReportModel");
				final var 						wayBillIdArray 			= (Long[]) objectOut.get("WayBillIdArray");
				final HashMap<String, String> branchWiseUnloading = (HashMap)bUnloading.get("branchWiseUnloading");
				if(reportModel.length > 0){

					final HashMap<Long, ALLBranchWiseCollectionReportModel> 	allBranchWiseCollectionMap = new LinkedHashMap<>();
					ALLBranchWiseCollectionReportModel 					allBranchWiseCollectionModel = null;
					final var branchCommission = new HashMap<String, BranchCommissionMap>();
					final var  commissionDetails = new BranchCommissionMap();

					//  Code to get the Way Bill Details (Charges , Packing type if needed)
					//Get WayBill Details code ( Start )
					final var	wayBillDetails = WayBillDetailsDAO.getInstance().getWayBillDetails(wayBillIdArray ,true ,ChargeTypeMaster.WAYBILL_CHARGETYPE_BOOKING ,false ,(short)0 ,false);
					//Get WayBill Details code ( End )

					for (final AgentCommisionReportModel aReportModel : reportModel) {
						allBranchWiseCollectionModel = allBranchWiseCollectionMap.get(aReportModel.getWayBillSourceBranchId());

						if(allBranchWiseCollectionModel != null){
							if(aReportModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID) {
								if(aReportModel.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_BOOKED)
									allBranchWiseCollectionModel.setTotalBookingPaidAmount(allBranchWiseCollectionModel.getTotalBookingPaidAmount() + aReportModel.getGrandTotal());
								else if(aReportModel.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CANCELLED)
									allBranchWiseCollectionModel.setTotalBookingPaidAmount(allBranchWiseCollectionModel.getTotalBookingPaidAmount() - aReportModel.getGrandTotal());

								setPaidCommission( branchCommission,commissionDetails,aReportModel,allBranchWiseCollectionModel.getBranchName(),wayBillDetails.get(aReportModel.getWayBillId()));

							} else if(aReportModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY) {
								if(aReportModel.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_BOOKED)
									allBranchWiseCollectionModel.setTotalBookingToPayAmount(allBranchWiseCollectionModel.getTotalBookingToPayAmount() + aReportModel.getGrandTotal());
								else if(aReportModel.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CANCELLED)
									allBranchWiseCollectionModel.setTotalBookingToPayAmount(allBranchWiseCollectionModel.getTotalBookingToPayAmount() - aReportModel.getGrandTotal());
								setToPayCommission( branchCommission,commissionDetails,aReportModel,allBranchWiseCollectionModel.getBranchName(),wayBillDetails.get(aReportModel.getWayBillId()));
							} else {
								if(aReportModel.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_BOOKED)
									allBranchWiseCollectionModel.setTotalBookingCreditorAmount(allBranchWiseCollectionModel.getTotalBookingCreditorAmount() + aReportModel.getGrandTotal());
								else if(aReportModel.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CANCELLED)
									allBranchWiseCollectionModel.setTotalBookingCreditorAmount(allBranchWiseCollectionModel.getTotalBookingCreditorAmount() - aReportModel.getGrandTotal());
								setCreditCommission( branchCommission,commissionDetails,aReportModel,allBranchWiseCollectionModel.getBranchName(),wayBillDetails.get(aReportModel.getWayBillId()));
							}
						}else{
							allBranchWiseCollectionModel = new ALLBranchWiseCollectionReportModel();

							//allBranchWiseCollectionModel.setCityName(cache.getCityById(request, reportModel[i].getWayBillSourceCityId()).getName());
							allBranchWiseCollectionModel.setBranchName(cache.getBranchById(request, executive.getAccountGroupId(), aReportModel.getWayBillSourceBranchId()).getName());
							if(aReportModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID) {
								if(aReportModel.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_BOOKED)
									allBranchWiseCollectionModel.setTotalBookingPaidAmount(aReportModel.getGrandTotal());
								else if(aReportModel.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CANCELLED)
									allBranchWiseCollectionModel.setTotalBookingPaidAmount(- aReportModel.getGrandTotal());

								setPaidCommission( branchCommission,commissionDetails,aReportModel,allBranchWiseCollectionModel.getBranchName(),wayBillDetails.get(aReportModel.getWayBillId()));

							} else if(aReportModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY) {
								if(aReportModel.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_BOOKED)
									allBranchWiseCollectionModel.setTotalBookingToPayAmount(aReportModel.getGrandTotal());
								else if(aReportModel.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CANCELLED)
									allBranchWiseCollectionModel.setTotalBookingToPayAmount(- aReportModel.getGrandTotal());
								setToPayCommission( branchCommission,commissionDetails,aReportModel,allBranchWiseCollectionModel.getBranchName(),wayBillDetails.get(aReportModel.getWayBillId()));
							} else {
								if(aReportModel.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_BOOKED)
									allBranchWiseCollectionModel.setTotalBookingCreditorAmount(aReportModel.getGrandTotal());
								else if(aReportModel.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CANCELLED)
									allBranchWiseCollectionModel.setTotalBookingCreditorAmount(- aReportModel.getGrandTotal());
								setCreditCommission( branchCommission,commissionDetails,aReportModel,allBranchWiseCollectionModel.getBranchName(),wayBillDetails.get(aReportModel.getWayBillId()));
							}

							allBranchWiseCollectionMap.put(aReportModel.getWayBillSourceBranchId(), allBranchWiseCollectionModel);
						}
					}

					final var agentCommission = new HashMap <Long, AgentBranchTotalCommission>();
					var agentBranchCommission = new AgentBranchTotalCommission();

					for (final String key : branchCommission.keySet()) {
						final var  commDetails = branchCommission.get(key);

						if(commDetails.getSourceBranchId() > 0 && agentList.contains( (int)commDetails.getSourceBranchId()) ){
							//Calculate Commission
							final var totalBookingAmount = commDetails.getTotalPaidAmount() + commDetails.getTotalToPayAmount() + commDetails.getTotalCreditAmount();

							//double commission = totalBookingAmount - (totalBookingAmount * ((double)commDetails.getPercentageCommision() / 100));
							var commission = 0D;

							if(CommissionConfigurationMap.southernCommissionCalculationMap.get(key) != null
									&& "1".equals(CommissionConfigurationMap.southernCommissionCalculationMap.get(key)))
								commission = commDetails.getFrieghtAmount() * (commDetails.getPercentageCommision() / 100) ;

							if(CommissionConfigurationMap.southernCommissionCalculationMap.get(key) != null
									&& "2".equals(CommissionConfigurationMap.southernCommissionCalculationMap.get(key)))
								commission = (commDetails.getFrieghtAmount() + commDetails.getLoadingAmount()) * (commDetails.getPercentageCommision() / 100);

							if(CommissionConfigurationMap.southernCommissionCalculationMap.get(key) != null
									&& "3".equals(CommissionConfigurationMap.southernCommissionCalculationMap.get(key)))
								commission = commDetails.getFrieghtAmount() * (commDetails.getPercentageCommision() / 100) + commDetails.getLoadingAmount();
							if (agentCommission.get(commDetails.getSourceBranchId())!=null){
								agentBranchCommission = agentCommission.get(commDetails.getSourceBranchId());
								agentBranchCommission.setTotalBookingAmount(agentBranchCommission.getTotalBookingAmount() + totalBookingAmount);
								agentBranchCommission.setTotalCommissionAmount(agentBranchCommission.getTotalCommissionAmount() + commission);
							} else{
								agentBranchCommission = new AgentBranchTotalCommission();
								var unloadingForBranch = 0D;

								if(branchWiseUnloading.get(Long.toString(commDetails.getSourceBranchId())) != null)
									unloadingForBranch = Double.parseDouble(branchWiseUnloading.get(Long.toString(commDetails.getSourceBranchId())));

								//agentBranchCommission.setAgentBranchId(commDetails.getSourceBranchId());
								agentBranchCommission.setAgentBranchName(commDetails.getAgentBranchName());
								agentBranchCommission.setTotalBookingAmount(totalBookingAmount);
								agentBranchCommission.setTotalCommissionAmount(commission + unloadingForBranch);

								agentCommission.put(commDetails.getSourceBranchId(),agentBranchCommission);
							}
						}
					}

					request.setAttribute("allBranchWiseCollectionMap", allBranchWiseCollectionMap);
					request.setAttribute("agentCommission", agentCommission);

					var reportViewModel =new ReportViewModel();
					reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);

					request.setAttribute("ReportViewModel",reportViewModel);
				} else {
					error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
					error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
					request.setAttribute("cargoError", error);
				}
			} else {
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}
			request.setAttribute("nextPageToken", "success");
		} catch (final Exception _e) {
			ActionStaticUtil.catchActionException(request, _e, error);
		}

	}

	private double getCommission (String sourceDestinationMap ){
		var commissionPercentValue = 0D;
		if(CommissionConfigurationMap.southernCommissionMap.get(sourceDestinationMap) != null)
			commissionPercentValue = Double.parseDouble(CommissionConfigurationMap.southernCommissionMap.get(sourceDestinationMap));
		return commissionPercentValue;
	}

	private void setPaidCommission (HashMap<String, BranchCommissionMap> branchCommission,BranchCommissionMap  commissionDetails,AgentCommisionReportModel reportModel, String branchName, WayBillDeatailsModel wayBillDeatails){

		final var sourceDestinationMap= WayBillTypeConstant.WAYBILL_TYPE_PAID+"_"+reportModel.getWayBillSourceBranchId()+"_"+ reportModel.getWayBillDestinationBranchId();
		final WayBillCharges wayBillCharges[] = wayBillDeatails.getWayBillCharges();
		var loadingAmount = 0D;
		var frieghtAmount = 0D;

		for (final WayBillCharges wayBillCharge : wayBillCharges) {
			final var chargeType = Long.toString(wayBillCharge.getWayBillChargeMasterId());

			if("4".equals(chargeType))
				loadingAmount = wayBillCharge.getChargeAmount();

			if("1".equals(chargeType))
				frieghtAmount = wayBillCharge.getChargeAmount();
		}

		if(branchCommission.get(sourceDestinationMap)!=null)
		{
			commissionDetails  = branchCommission.get(sourceDestinationMap);
			if(reportModel.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_BOOKED) {
				commissionDetails.setTotalPaidAmount(commissionDetails.getTotalPaidAmount()+ reportModel.getGrandTotal());
				commissionDetails.setLoadingAmount(commissionDetails.getLoadingAmount() + loadingAmount);
				commissionDetails.setFrieghtAmount(commissionDetails.getFrieghtAmount() + frieghtAmount);
			}else if(reportModel.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CANCELLED){
				commissionDetails.setTotalPaidAmount(- reportModel.getGrandTotal());
				commissionDetails.setLoadingAmount(commissionDetails.getLoadingAmount() - loadingAmount);
				commissionDetails.setFrieghtAmount(commissionDetails.getFrieghtAmount() - frieghtAmount);
			}
		} else{
			commissionDetails= new BranchCommissionMap();
			commissionDetails.setAgentBranchName(branchName);
			commissionDetails.setSourceDestinationMap(sourceDestinationMap);
			commissionDetails.setSourceBranchId(reportModel.getWayBillSourceBranchId());
			commissionDetails.setDestinationBranchId(reportModel.getWayBillDestinationBranchId());
			commissionDetails.setPercentageCommision(getCommission(sourceDestinationMap));

			if(reportModel.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_BOOKED) {
				commissionDetails.setTotalPaidAmount(reportModel.getGrandTotal());
				commissionDetails.setLoadingAmount(loadingAmount);
				commissionDetails.setFrieghtAmount(frieghtAmount);
			}else if(reportModel.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CANCELLED){
				commissionDetails.setTotalPaidAmount(-reportModel.getGrandTotal());
				commissionDetails.setLoadingAmount(- loadingAmount);
				commissionDetails.setFrieghtAmount(- frieghtAmount);
			}
			branchCommission.put(sourceDestinationMap, commissionDetails);
		}

		branchCommission.get(sourceDestinationMap);
	}
	private void setToPayCommission (HashMap<String, BranchCommissionMap> branchCommission,BranchCommissionMap  commissionDetails,AgentCommisionReportModel reportModel,String branchName,WayBillDeatailsModel wayBillDeatails){
		final var sourceDestinationMap= WayBillTypeConstant.WAYBILL_TYPE_TO_PAY+"_"+reportModel.getWayBillSourceBranchId()+"_"+ reportModel.getWayBillDestinationBranchId();
		final WayBillCharges wayBillCharges[] = wayBillDeatails.getWayBillCharges();
		var loadingAmount = 0D;
		var frieghtAmount = 0D;

		for (final WayBillCharges wayBillCharge : wayBillCharges) {
			final var chargeType = Long.toString(wayBillCharge.getWayBillChargeMasterId());

			if("4".equals(chargeType))
				loadingAmount = wayBillCharge.getChargeAmount();
			if("1".equals(chargeType))
				frieghtAmount = wayBillCharge.getChargeAmount();
		}

		if(branchCommission.get(sourceDestinationMap)!=null)
		{
			commissionDetails  = branchCommission.get(sourceDestinationMap);
			if(reportModel.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_BOOKED) {
				commissionDetails.setTotalToPayAmount(commissionDetails.getTotalToPayAmount()+ reportModel.getGrandTotal());
				commissionDetails.setLoadingAmount(commissionDetails.getLoadingAmount() + loadingAmount);
				commissionDetails.setFrieghtAmount(commissionDetails.getFrieghtAmount() + frieghtAmount);
			}else if(reportModel.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CANCELLED){
				commissionDetails.setTotalToPayAmount(- reportModel.getGrandTotal());
				commissionDetails.setLoadingAmount(commissionDetails.getLoadingAmount() - loadingAmount);
				commissionDetails.setFrieghtAmount(commissionDetails.getFrieghtAmount() - frieghtAmount);
			}
		} else{
			commissionDetails= new BranchCommissionMap();
			commissionDetails.setAgentBranchName(branchName);
			commissionDetails.setSourceDestinationMap(sourceDestinationMap);
			commissionDetails.setSourceBranchId(reportModel.getWayBillSourceBranchId());
			commissionDetails.setDestinationBranchId(reportModel.getWayBillDestinationBranchId());
			commissionDetails.setPercentageCommision(getCommission(sourceDestinationMap));

			if(reportModel.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_BOOKED) {
				commissionDetails.setTotalToPayAmount(reportModel.getGrandTotal());
				commissionDetails.setLoadingAmount(loadingAmount);
				commissionDetails.setFrieghtAmount(frieghtAmount);
			}else if(reportModel.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CANCELLED){
				commissionDetails.setTotalToPayAmount(-reportModel.getGrandTotal());
				commissionDetails.setLoadingAmount(- loadingAmount);
				commissionDetails.setFrieghtAmount(- frieghtAmount);
			}
			branchCommission.put(sourceDestinationMap, commissionDetails);
		}

		branchCommission.get(sourceDestinationMap);
	}
	private void setCreditCommission (HashMap<String, BranchCommissionMap> branchCommission,BranchCommissionMap  commissionDetails,AgentCommisionReportModel reportModel,String branchName,WayBillDeatailsModel wayBillDeatails){
		final var sourceDestinationMap= WayBillTypeConstant.WAYBILL_TYPE_CREDIT+"_"+reportModel.getWayBillSourceBranchId()+"_"+ reportModel.getWayBillDestinationBranchId();
		final WayBillCharges wayBillCharges[] = wayBillDeatails.getWayBillCharges();
		var loadingAmount = 0D;
		var frieghtAmount = 0D;

		for (final WayBillCharges wayBillCharge : wayBillCharges) {
			final var chargeType = Long.toString(wayBillCharge.getWayBillChargeMasterId());

			if("4".equals(chargeType))
				loadingAmount = wayBillCharge.getChargeAmount();

			if("1".equals(chargeType))
				frieghtAmount = wayBillCharge.getChargeAmount();
		}

		if(branchCommission.get(sourceDestinationMap)!=null)
		{
			commissionDetails  = branchCommission.get(sourceDestinationMap);
			if(reportModel.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_BOOKED) {
				commissionDetails.setTotalCreditAmount(commissionDetails.getTotalCreditAmount()+ reportModel.getGrandTotal());
				commissionDetails.setLoadingAmount(commissionDetails.getLoadingAmount() + loadingAmount);
				commissionDetails.setFrieghtAmount(commissionDetails.getFrieghtAmount() + frieghtAmount);
			}else if(reportModel.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CANCELLED){
				commissionDetails.setTotalCreditAmount(- reportModel.getGrandTotal());
				commissionDetails.setLoadingAmount(commissionDetails.getLoadingAmount() - loadingAmount);
				commissionDetails.setFrieghtAmount(commissionDetails.getFrieghtAmount() - frieghtAmount);
			}
		} else{
			commissionDetails= new BranchCommissionMap();
			commissionDetails.setAgentBranchName(branchName);
			commissionDetails.setSourceDestinationMap(sourceDestinationMap);
			commissionDetails.setSourceBranchId(reportModel.getWayBillSourceBranchId());
			commissionDetails.setDestinationBranchId(reportModel.getWayBillDestinationBranchId());
			commissionDetails.setPercentageCommision(getCommission(sourceDestinationMap));

			if(reportModel.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_BOOKED) {
				commissionDetails.setTotalCreditAmount(reportModel.getGrandTotal());
				commissionDetails.setLoadingAmount(loadingAmount);
				commissionDetails.setFrieghtAmount(frieghtAmount);
			}else if(reportModel.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_CANCELLED){
				commissionDetails.setTotalCreditAmount(-reportModel.getGrandTotal());
				commissionDetails.setLoadingAmount(- loadingAmount);
				commissionDetails.setFrieghtAmount(- frieghtAmount);
			}
			branchCommission.put(sourceDestinationMap, commissionDetails);
		}

		branchCommission.get(sourceDestinationMap);
	}
}