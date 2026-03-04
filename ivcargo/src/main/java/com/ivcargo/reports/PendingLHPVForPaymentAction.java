package com.ivcargo.reports;

//~--- non-JDK imports --------------------------------------------------------

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.dto.constant.ExecutiveTypeConstant;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.DispatchLedgerDao;
import com.platform.dao.LHPVDao;
import com.platform.dao.LhpvChargesForGroupDao;
import com.platform.dao.LhpvSettlementChargesDao;
import com.platform.dto.Branch;
import com.platform.dto.DispatchLedger;
import com.platform.dto.LHPVModel;
import com.platform.dto.LhpvChargeTypeMaster;
import com.platform.dto.LhpvChargesForGroup;
import com.platform.dto.SubRegion;
import com.platform.dto.VehicleNumberMaster;
import com.platform.dto.constant.LHPVConstant;
import com.platform.dto.model.LHPVCompanyDetails;
import com.platform.resource.CargoErrorList;

public class PendingLHPVForPaymentAction implements Action {

	@Override
	@SuppressWarnings("unchecked")
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	 							error 					= null;
		String												branchesIds				= null;
		String												subRegionName			= null;
		LhpvChargesForGroup[]								lhpvChargesArr			= null;
		SubRegion											subRegion				= null;
		var 	srcBranchId	= 0L;
		var 	subReId		= 0L;
		final short	filter		= 1;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializePendingLHPVForPaymentAction().execute(request, response);

			final var	sdf			= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			final var	fromDate	= new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00").getTime());
			final var	toDate		= new Timestamp(sdf.parse(JSPUtility.GetString(request, "toDate") + " 23:59:59").getTime());
			final var	cManip 		= new CacheManip(request);
			final var	executive	= cManip.getExecutive(request);

			final var	pendingLhpvForPayment 	 = ReadAllConfigurationsBllImpl.getInstance().getReportConfigurationData(ReportIdentifierConstant.PENDING_LHPV_FOR_PAYMENT, executive.getAccountGroupId());
			final var	isAllRegionNeedToShow   = (boolean) pendingLhpvForPayment.getOrDefault("isAllRegionNeedToShow", false);

			ActionStaticUtil.executiveTypeWiseBranches(request, cManip, executive);

			if(isAllRegionNeedToShow)
				branchesIds 		= ActionStaticUtil.getPhysicalBranchIds1(request, cManip, executive);
			else
				branchesIds		= ActionStaticUtil.getPhysicalBranchIds(request, cManip, executive);

			// Get the Selected Combo values
			if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN || executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_REGIONADMIN || executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_SUBREGIONADMIN)
				srcBranchId = Long.parseLong(request.getParameter("branch"));
			else
				srcBranchId = executive.getBranchId();

			request.setAttribute("agentName", executive.getName());

			final var	reports = LHPVDao.getInstance().getLHPVDetails(branchesIds, executive.getAccountGroupId(), fromDate, toDate, filter);

			if(reports != null && !reports.isEmpty()) {
				var	lhpvIdStr 	= reports.stream().map(e -> Long.toString(e.getLhpvId())).collect(Collectors.joining(","));

				final Map<Long, VehicleNumberMaster>	vehicleNumberMasterHM	= cManip.getALLVehicleNumberOfGroup(request, executive.getAccountGroupId());
				final var	branchesObj				= cManip.getGenericBranchesDetail(request);
				final var	subRegionObj			= cManip.getAllSubRegions(request);

				final Map<String, Map<String, List<LHPVModel>>>	subRegionWiseData	= new TreeMap<>();

				final var	allLhpvChargesValObj = LhpvChargesForGroupDao.getInstance().getallLHPVChargeByAccGrpId(executive.getAccountGroupId(), LhpvChargesForGroup.IDENTIFIER_TYPE_LHPV);

				if(allLhpvChargesValObj != null)
					lhpvChargesArr = (LhpvChargesForGroup[]) allLhpvChargesValObj.get("modelArr");

				final var	lhpvSettChargesValObj 	= LhpvSettlementChargesDao.getInstance().getSetlementChargesByBlhpvIds(lhpvIdStr, LhpvChargesForGroup.IDENTIFIER_TYPE_LHPV);
				final var	lhpvchargesCollHshmp 	= (HashMap<Long, HashMap<Long, Double>>) lhpvSettChargesValObj.get("chargesCollMainHshmp");

				for (final LHPVModel report : reports) {
					var		branch	= (Branch) branchesObj.get(Long.toString(report.getBalancePayableAtBranchId()));

					report.setBalancePayableAtBranch(branch != null ? branch.getName() : "--");

					final var	vMaster	= vehicleNumberMasterHM.get(report.getVehicleNumberMasterId());

					if(vMaster != null) {
						report.setVehicleNumber(vMaster.getVehicleNumber());
						report.setVehicleOwner(vMaster.getVehicleOwner());
					} else
						report.setVehicleNumber("--");

					if(lhpvChargesArr != null) {
						if(lhpvchargesCollHshmp != null && lhpvchargesCollHshmp.containsKey(report.getLhpvId())) {
							final Map<Long, Double>	chargesHM	= lhpvchargesCollHshmp.get(report.getLhpvId());

							report.setTotalAmount(chargesHM.getOrDefault((long) LhpvChargeTypeMaster.LORRY_HIRE, 0.0));
							report.setAdvanceAmount(chargesHM.getOrDefault((long) LhpvChargeTypeMaster.ADVANCE_AMOUNT, 0.0));
							report.setBalanceAmount(chargesHM.getOrDefault((long) LhpvChargeTypeMaster.BALANCE_AMOUNT, 0.0));
						} else {
							report.setTotalAmount(0);
							report.setAdvanceAmount(0);
							report.setBalanceAmount(0);
						}

						for (final LhpvChargesForGroup element : lhpvChargesArr)
							if(!LhpvChargeTypeMaster.getNecessaryCharges().contains(Short.parseShort(Long.toString(element.getLhpvChargeTypeMasterId())))
									&& lhpvchargesCollHshmp != null && lhpvchargesCollHshmp.get(report.getLhpvId()) != null && lhpvchargesCollHshmp.get(report.getLhpvId()).get(element.getLhpvChargeTypeMasterId()) != null)
								if(element.getOperationType() == LhpvChargesForGroup.OPERATION_TYPE_ADD)
									report.setAdditionCharges(report.getAdditionCharges() + lhpvchargesCollHshmp.get(report.getLhpvId()).get(element.getLhpvChargeTypeMasterId()));
								else if(element.getOperationType() == LhpvChargesForGroup.OPERATION_TYPE_SUBTRACT && element.getLhpvChargeTypeMasterId() !=  Long.parseLong(LhpvChargeTypeMaster.ADVANCE_AMOUNT+"") )
									report.setDeductionCharges(report.getDeductionCharges() + lhpvchargesCollHshmp.get(report.getLhpvId()).get(element.getLhpvChargeTypeMasterId()));
					}

					branch    	= (Branch) branchesObj.get(Long.toString(report.getSourceBranchId()));

					if(branch != null) {
						report.setSourceBranchString(branch.getName());
						subRegion		= (SubRegion) subRegionObj.get(branch.getSubRegionId());
						subRegionName 	= subRegion.getName();
						subReId			= subRegion.getSubRegionId();
					}

					if(branch == null || subRegionName == null)
						continue;

					branch    	= (Branch) branchesObj.get(Long.toString(report.getDestinationBranchId()));

					report.setDestinationBranchString(branch != null ? branch.getName() : "");

					var	branchWiseData 	= subRegionWiseData.get(subRegionName + "_" + subReId);

					if(branchWiseData == null) {
						branchWiseData	= new TreeMap<>();
						final List<LHPVModel>	lhpvModelList 	= new ArrayList<>();
						lhpvModelList.add(report);
						branchWiseData.put(report.getSourceBranchString() + "_" + report.getSourceBranchId(), lhpvModelList);
						subRegionWiseData.put(subRegionName + "_" + subReId, branchWiseData);
					} else {
						var	lhpvModelList = branchWiseData.get(report.getSourceBranchString() + "_" + report.getSourceBranchId());

						if(lhpvModelList == null)
							lhpvModelList = new ArrayList<>();

						lhpvModelList.add(report);
						branchWiseData.put(report.getSourceBranchString() + "_" + report.getSourceBranchId(), lhpvModelList);
					}
				}

				lhpvIdStr 		= reports.stream().filter(e -> e.getStatus() == LHPVConstant.STATUS_BOOKED).map(e -> Long.toString(e.getLhpvId())).collect(Collectors.joining(","));
				final var	cancleLhpvIds 	= reports.stream().filter(e -> e.getStatus() == LHPVConstant.STATUS_CANCELLED).map(e -> Long.toString(e.getLhpvId())).collect(Collectors.joining(","));

				final var	dispatchColl 	= DispatchLedgerDao.getInstance().getLHPVDataByLHPVIds(lhpvIdStr, executive.getAccountGroupId(), cancleLhpvIds);

				if(dispatchColl != null)
					for(final Map.Entry<Long, List<DispatchLedger>> entry : dispatchColl.entrySet()) {
						final var dispatchList = entry.getValue();

						for (final DispatchLedger element : dispatchList) {
							var branch    	= (Branch) branchesObj.get(Long.toString(element.getSourceBranchId()));

							element.setSourceBranch(branch != null ? branch.getName() : "");

							branch    	= (Branch) branchesObj.get(Long.toString(element.getDestinationBranchId()));

							element.setDestinationBranch(branch != null ? branch.getName() : "");
						}
					}

				request.setAttribute("subRegionWiseData", subRegionWiseData);
				request.setAttribute("dispatchColl", dispatchColl);
			} else {
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}

			ActionStaticUtil.setRequestAttribute(request,"customAddressBranchId", srcBranchId);
			ActionStaticUtil.setRequestAttribute(request,"customAddressIdentifer", LHPVCompanyDetails.IDENTIFIER_BOOKING);
			ActionStaticUtil.setReportViewModel(request);
			request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}
	}
}