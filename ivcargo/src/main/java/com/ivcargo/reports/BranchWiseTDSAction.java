package com.ivcargo.reports;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.ObjectUtils;

import com.businesslogic.BranchWiseTDSDetailsBLL;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.dto.model.reports.account.BranchWiseTDSDetails;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.utility.ListFilterUtility;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.model.ReportViewModel;

public class BranchWiseTDSAction implements Action {

	@Override
	@SuppressWarnings("unchecked")
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	 		error 					= null;
		var					noRecords				= true;
		Map<String, List<BranchWiseTDSDetails>>	finalPartyListHM		= null;

		try {

			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeBranchWiseTDSTempAction().execute(request, response);

			final var	sdf			= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			final var	fromDate	= new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00").getTime());
			final var	toDate		= new Timestamp(sdf.parse(JSPUtility.GetString(request, "toDate") + " 23:59:59").getTime());
			final var	cacheManip  = new CacheManip(request);
			final var	executive   = cacheManip.getExecutive(request);
			final var	partyMasterId		= JSPUtility.GetLong(request,"creditorId",0);

			final var	partyWiseSearch = request.getParameter("selectPartyCheckBox") != null;

			ActionStaticUtil.executiveTypeWiseBranches(request, cacheManip, executive);

			final var	branchIds		= ActionStaticUtil.getPhysicalBranchIds1(request, cacheManip, executive);

			final var valueObjectIn = new ValueObject();
			valueObjectIn.put("fromDate", fromDate);
			valueObjectIn.put("toDate", toDate);
			valueObjectIn.put("branchId", branchIds);
			valueObjectIn.put("branchColl", cacheManip.getGenericBranchesDetail(request));
			valueObjectIn.put("partyMasterId", partyMasterId);
			valueObjectIn.put("partyWiseSearch", partyWiseSearch);

			final var	branchWiseTDSDetailsBLL = new BranchWiseTDSDetailsBLL();
			final var	valueObjectResult 		= branchWiseTDSDetailsBLL.getTDSAmountDetailsByBranchId(valueObjectIn);

			if(valueObjectResult != null){
				final var	outBookingTDSDetails	= (List<BranchWiseTDSDetails>) valueObjectResult.get("bookingContactModel");
				final var	outDeliveryContactList	= (List<BranchWiseTDSDetails>) valueObjectResult.get("deliveryContactModel");
				final var	outCreditWayBillList	= (List<BranchWiseTDSDetails>) valueObjectResult.get("creditWayBillModel");
				final var	outSTBSWayBillList		= (List<BranchWiseTDSDetails>) valueObjectResult.get("stbsWayBillModel");
				final var	outBillClearanceList	= (List<BranchWiseTDSDetails>) valueObjectResult.get("billClearanceModel");
				final var	outDdmLorryHireTDSList	= (List<BranchWiseTDSDetails>) valueObjectResult.get("ddmLorryHireModel");
				final var	outPickupLorryHireTDSList	= (List<BranchWiseTDSDetails>) valueObjectResult.get("pickupLorryHireModel");
				final var	outLhpvTDSList				= (List<BranchWiseTDSDetails>) valueObjectResult.get("lhpvModel");

				if(ObjectUtils.isNotEmpty(outBookingTDSDetails)) {
					noRecords	= false;
					request.setAttribute("outBookingTDSDetails", outBookingTDSDetails);
				}

				if(ObjectUtils.isNotEmpty(outDeliveryContactList)) {
					noRecords	= false;
					request.setAttribute("outDeliveryContactList", outDeliveryContactList);
				}

				if(ObjectUtils.isNotEmpty(outCreditWayBillList)) {
					noRecords	= false;
					request.setAttribute("outCreditWayBillList", outCreditWayBillList);
				}

				if(ObjectUtils.isNotEmpty(outBillClearanceList)) {
					noRecords	= false;
					request.setAttribute("outBillClearanceList", outBillClearanceList);
				}

				if(ObjectUtils.isNotEmpty(outSTBSWayBillList)) {
					noRecords	= false;
					request.setAttribute("outSTBSWayBillList", outSTBSWayBillList);
				}

				if(ObjectUtils.isNotEmpty(outDdmLorryHireTDSList)) {
					noRecords	= false;
					request.setAttribute("outDdmLorryHireTDSList", outDdmLorryHireTDSList);
				}

				if(ObjectUtils.isNotEmpty(outPickupLorryHireTDSList)) {
					noRecords	= false;
					request.setAttribute("outPickupLorryHireTDSList", outPickupLorryHireTDSList);
				}

				if(ObjectUtils.isNotEmpty(outLhpvTDSList)) {
					noRecords	= false;
					request.setAttribute("outLhpvTDSList", outLhpvTDSList);
				}

				if(partyWiseSearch) {
					final List<BranchWiseTDSDetails>	tdsDetailMergeList	= new ArrayList<>();

					if(ObjectUtils.isNotEmpty(outBookingTDSDetails)) tdsDetailMergeList.addAll(outBookingTDSDetails);
					if(ObjectUtils.isNotEmpty(outDeliveryContactList)) tdsDetailMergeList.addAll(outDeliveryContactList);
					if(ObjectUtils.isNotEmpty(outCreditWayBillList)) tdsDetailMergeList.addAll(outCreditWayBillList);
					if(ObjectUtils.isNotEmpty(outBillClearanceList)) tdsDetailMergeList.addAll(outBillClearanceList);
					if(ObjectUtils.isNotEmpty(outSTBSWayBillList)) tdsDetailMergeList.addAll(outSTBSWayBillList);

					if(!tdsDetailMergeList.isEmpty()) {
						final List<BranchWiseTDSDetails> filteredList = ListFilterUtility.filterList(tdsDetailMergeList, obj -> obj.getPartyMasterId() > 0);

						if(filteredList != null) {
							noRecords	= false;
							finalPartyListHM	= filteredList.stream().collect(Collectors.groupingBy(BranchWiseTDSDetails::getPartyMasterIdWithName));

							for(final Map.Entry<String, List<BranchWiseTDSDetails>> entry : finalPartyListHM.entrySet()) {
								final var partyWiseList	= entry.getValue();

								final var sumTDSOnAmount = partyWiseList.stream().mapToDouble(BranchWiseTDSDetails :: getTdsOnAmount).sum();
								final var sumTDSAmount = partyWiseList.stream().mapToDouble(BranchWiseTDSDetails :: getTdsAmount).sum();

								for (final BranchWiseTDSDetails item : partyWiseList) {
									item.setSumTDSOnAmount(sumTDSOnAmount);
									item.setSumTDSAmount(sumTDSAmount);
								}
							}
						} else
							noRecords	= false;
					}
				}

				request.setAttribute("valObjForTotal", valueObjectResult.get("valObjForTotal"));
				request.setAttribute("finalPartyListHM", finalPartyListHM);

				if(noRecords)
					request.setAttribute("NoRecords", true);
			} else
				request.setAttribute("NoRecords", true);

			request.setAttribute("nextPageToken", "success");

			var	reportViewModel = new ReportViewModel();
			reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);
			request.setAttribute("ReportViewModel",reportViewModel);
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}
}
