package com.ivcargo.actions;

import java.util.ArrayList;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringUtils;

import com.businesslogic.BranchTransferBLL;
import com.businesslogic.SequenceCounterValidationBLL;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.ConfigParam;
import com.platform.dto.DispatchLedger;
import com.platform.dto.Executive;
import com.platform.dto.configuration.modules.LsConfigurationDTO;
import com.platform.resource.CargoErrorList;

public class BranchTransferAction implements Action{

	Executive executive = null;

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		// TODO Auto-generated method stub
		HashMap<String,Object>	 		error 					= null;
		ValueObject						inValObj				= null;
		SequenceCounterValidationBLL	seqCuntBll				= null;
		ValueObject						outValObj				= null;
		String							lsNumber				= null;
		var								noOfDays		 		= 0;
		String[] 						values 					= null;
		CacheManip						cache 					= null;
		ArrayList<Long>					wayBillsForBT 			= null;
		DispatchLedger 					dispatchLedger 			= null;
		ValueObject 					lsConfiguration			= null;
		var 						allowScrapSeqCounter	= false;
		ArrayList<Long> 				transportList			= null;

		try {

			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error))
				return;

			cache				= new CacheManip(request);
			executive 			= cache.getExecutive(request);
			values    			= request.getParameterValues("wayBills");
			wayBillsForBT		= new ArrayList<>();
			dispatchLedger 		= populateDispatchLedger(request, cache);

			transportList		= cache.getTransportList(request);

			if(transportList.contains(executive.getAccountGroupId())){

				noOfDays   					= cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_MAX_DAYS_OF_OPERATION_BEFORE_CASHSTATEMENT_ENTRY_ID);
				lsConfiguration 			= cache.getLsConfiguration(request, executive.getAccountGroupId());
				allowScrapSeqCounter		= lsConfiguration.getBoolean(LsConfigurationDTO.ALLOW_SCRAP_SEQ_COUNTER, false);

				inValObj	 		= new ValueObject();

				inValObj.put("executive", executive);
				inValObj.put("noOfDays", noOfDays);
				inValObj.put(LsConfigurationDTO.ALLOW_SCRAP_SEQ_COUNTER, allowScrapSeqCounter);

				seqCuntBll	= new SequenceCounterValidationBLL();
				outValObj	= seqCuntBll.getLSSequenceCounterValidation(inValObj);

				if(Short.parseShort(outValObj.get("errorNo").toString()) != 1) {
					error.put("errorCode", Integer.parseInt(outValObj.get("errorCode").toString()));
					error.put("errorDescription", outValObj.get("errorDescription").toString());
					request.setAttribute("cargoError", error);
					request.setAttribute("nextPageToken", "failure");
					return;
				}
				lsNumber = outValObj.getString("lsNumber", null);
			}
			dispatchLedger.setLsNumber(lsNumber);
			for (final String value : values)
				//wayBillsForBT[i] = Long.parseLong(values[i]);
				wayBillsForBT.add(Long.parseLong(value));

			final var valueInObject 	= new ValueObject();
			valueInObject.put("wayBillsForBT", wayBillsForBT);
			valueInObject.put("executive", executive);
			valueInObject.put("dispatchLedger", dispatchLedger);
			valueInObject.put("branchColl",cache.getGenericBranchesDetail(request));

			final var branchTransferBLL = new BranchTransferBLL();
			final var 	valueOutObject  = branchTransferBLL.transferWayBills(valueInObject);

			final var status = (String) valueOutObject.get("status");

			if ("success".equals(status)) {
				final long dispatchLedgerId = (Long) valueOutObject.get("dispatchLedgerId");

				response.sendRedirect("SearchWayBill.do?pageId=3&eventId=9&dispatchLedgerId="+dispatchLedgerId+"&Type=BranchTransfered&LSNo=" + lsNumber);
				request.setAttribute("nextPageToken", "success");
				request.setAttribute("dispatchLedgerId", dispatchLedgerId);
			} else {
				error.put("errorCode", CargoErrorList.DISPATCH_ERROR);
				error.put("errorDescription", CargoErrorList.DISPATCH_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
				request.setAttribute("nextPageToken", "failure");
			}

		} catch (final Exception _e) {
			ActionStaticUtil.catchActionException(request, _e, error);
		}

	}

	private DispatchLedger populateDispatchLedger(final HttpServletRequest request, final CacheManip cache) throws Exception {
		final var dispatchLedger = new DispatchLedger();
		final var createDate = DateTimeUtility.getCurrentTimeStamp();

		dispatchLedger.setTypeOfLS(DispatchLedger.TYPE_OF_LS_ID_NORMAL);
		dispatchLedger.setAccountGroupId(executive.getAccountGroupId());

		dispatchLedger.setSourceBranchId(executive.getBranchId());
		final var destinationBranch = JSPUtility.GetString(request, "VehicleDestinationBranchId");

		if(StringUtils.contains(destinationBranch, "_") ){
			final var ids = destinationBranch.split("_");
			final var godownId = Long.parseLong(ids[0]);
			final var destBranchId = Long.parseLong(ids[1]);

			if(godownId > 0 && destBranchId > 0){
				dispatchLedger.setGodownId(godownId);
				dispatchLedger.setDestinationBranchId(destBranchId);
			}
		} else
			dispatchLedger.setDestinationBranchId(JSPUtility.GetLong(request, "VehicleDestinationBranchId"));

		dispatchLedger.setCleanerName(StringUtils.upperCase(JSPUtility.GetString(request, "cleanerName")));
		dispatchLedger.setDriverName(StringUtils.upperCase(JSPUtility.GetString(request, "driver")));
		dispatchLedger.setTripName("trip");
		dispatchLedger.setTripDateTime(createDate);
		dispatchLedger.setActualDispatchDateTime(createDate);
		dispatchLedger.setMarkForDelete(false);
		dispatchLedger.setBranchTransfer(true);
		dispatchLedger.setVehicleNumber(JSPUtility.GetString(request, "vehicleNumber"));
		dispatchLedger.setVehicleNumberMasterId(cache.getVehicleNumberIdByNumber(request, executive.getAccountGroupId(), JSPUtility.GetString(request, "vehicleNumber")));
		dispatchLedger.setSuperVisor(StringUtils.upperCase(JSPUtility.GetString(request, "superVisor", "")));
		dispatchLedger.setLsBranchId(executive.getBranchId());

		return dispatchLedger;
	}
}