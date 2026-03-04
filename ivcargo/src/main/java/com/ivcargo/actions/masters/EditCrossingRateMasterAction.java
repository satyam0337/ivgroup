package com.ivcargo.actions.masters;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.dao.impl.crossingagent.CrossingAgentMasterDaoImpl;
import com.iv.dto.constant.ChargeTypeConstant;
import com.iv.dto.constant.ExecutiveTypeConstant;
import com.iv.utils.constant.Constant;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.CrossingRateMasterDao;
import com.platform.dto.CrossingRate;
import com.platform.dto.Executive;
import com.platform.dto.TransportCommonMaster;
import com.platform.dto.model.EditCrossingRateModel;
import com.platform.resource.CargoErrorList;

public class EditCrossingRateMasterAction implements Action {
	public static final String TRACE_ID = "EditCrossingRateMasterAction";

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>		error 					= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var exec = (Executive) request.getSession().getAttribute(Executive.EXECUTIVE);

			if(exec != null) {
				final String strResponse = null;

				final var filter = JSPUtility.GetInt(request, "filter", 0);
				final var cache = new CacheManip(request);

				switch (filter) {
				case 1 -> {
					final var sourceBranchId		= JSPUtility.GetLong(request, "sourceBranchId", 0);
					final var destinationBranchId	= JSPUtility.GetLong(request, "destinationBranchId", 0);
					final var editCrossingRateModel = CrossingRateMasterDao.getInstance().getCrossingRatesForEdit(exec.getAccountGroupId(), sourceBranchId, destinationBranchId);

					if (editCrossingRateModel != null) {
						for (final EditCrossingRateModel element : editCrossingRateModel) {
							if(element.getCrossingAgentId() > 0)
								element.setCrossingAgentName(CrossingAgentMasterDaoImpl.getInstance().getCrossingAgentDetailsById(element.getCrossingAgentId()).getName());
							else
								element.setCrossingAgentName("--");

							element.setSourceBranch(cache.getGenericBranchDetailCache(request, element.getSourceBranchId()).getName());

							if(destinationBranchId == Constant.INPUT_ALL_ID)
								element.setDestinationBranch("All");
							else
								element.setDestinationBranch(cache.getGenericBranchDetailCache(request, element.getDestinationBranchId()).getName());

							element.setSourceSubRegionId(cache.getGenericBranchDetailCache(request, element.getSourceBranchId()).getSubRegionId());

							if(destinationBranchId == Constant.INPUT_ALL_ID)
								element.setDestinationSubRegionId(0);
							else
								element.setDestinationSubRegionId(cache.getGenericBranchDetailCache(request, element.getDestinationBranchId()).getSubRegionId());

							element.setSourceSubRegion(cache.getGenericSubRegionById(request, element.getSourceSubRegionId()).getName());

							if(destinationBranchId == Constant.INPUT_ALL_ID)
								element.setDestinationSubRegion("All");
							else
								element.setDestinationSubRegion(cache.getGenericSubRegionById(request, element.getDestinationSubRegionId()).getName());

							if(element.isRatePercentage())
								element.setWtOrQtyType(TransportCommonMaster.FREIGHT);
							else if (element.getChargeTypeId() == ChargeTypeConstant.CHARGETYPE_ID_WEIGHT || element.isWeightType())
								element.setWtOrQtyType(ChargeTypeConstant.CHARGETYPE_NAME_WEIGHT);
							else if (element.getChargeTypeId() == ChargeTypeConstant.CHARGETYPE_ID_FIX)
								element.setWtOrQtyType(ChargeTypeConstant.CHARGETYPE_NAME_FIX);
							else if (element.getChargeTypeId() == ChargeTypeConstant.CHARGETYPE_ID_QUANTITY)
								element.setWtOrQtyType(ChargeTypeConstant.CHARGETYPE_NAME_QUANTITY);
							else
								element.setWtOrQtyType("--");

							if(element.getPackingTypeId() <= 0 || element.isRatePercentage() || element.getChargeTypeId() == ChargeTypeConstant.CHARGETYPE_ID_WEIGHT || element.getChargeTypeId() == ChargeTypeConstant.CHARGETYPE_ID_FIX)
								element.setPackingTypeName("--");
							else
								element.setPackingTypeName(cache.getPackingTypeMasterById(request, element.getPackingTypeId()).getName());

							if(element.getTxnTypeId() == CrossingRate.TXN_TYPE_BOOKING)
								element.setTxnTypeName(CrossingRate.TXN_TYPE_BOOKING_NAME);
							else
								element.setTxnTypeName(CrossingRate.TXN_TYPE_DELIVERY_NAME);
							
							element.setChargeName(cache.getChargeTypeMasterById(request, element.getChargeTypeMasterId()).getChargeName());							
						}

						request.setAttribute("editCrossingRateModel", editCrossingRateModel);
					} else {
						error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
						error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);  
						request.setAttribute("cargoError", error);
						request.setAttribute("nextPageToken", "failure");
						return;
					}
				}
				default -> {
					break;
				}
				}

				if(exec.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN)
					ActionStaticUtil.setRegionForGroup(request, cache, exec);

				ActionStaticUtil.executiveTypeWiseBranches(request, cache, exec);

				new InitializeEditCrossingRateMasterAction().execute(request, response);
				request.setAttribute("message", strResponse);
				request.setAttribute("nextPageToken", "success");
			} else {
				error.put("errorCode", CargoErrorList.SESSION_INVALID);
				error.put("errorDescription", CargoErrorList.SESSION_INVALID_DESCRIPTION);
				request.setAttribute("needlogin", error);
			}
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}
}
