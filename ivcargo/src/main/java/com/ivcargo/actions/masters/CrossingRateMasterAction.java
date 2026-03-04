
package com.ivcargo.actions.masters;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.constant.properties.master.CrossingRateMasterConfigurationConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.constant.Constant;
import com.iv.utils.utility.CollectionUtility;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.CrossingAgentBranchDao;
import com.platform.dao.CrossingRateMasterDao;
import com.platform.dto.CrossingAgentBranch;
import com.platform.dto.CrossingRateMaster;
import com.platform.dto.WayBillCrossing;
import com.platform.dto.constant.ChargeTypeConstant;

public class CrossingRateMasterAction implements Action{
	public static final String TRACE_ID = "CrossingRateMasterAction";
	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {

		HashMap<String,Object>	error 		= null;
		String strResponse = null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	cache    		= new CacheManip(request);
			final var	exec			= cache.getExecutive(request);

			final long rateRowsCount = JSPUtility.GetInt(request, "rateRowsCount",0);
			final var filter = JSPUtility.GetInt(request, "filter", 0);
			final var configuration	= cache.getConfiguration(request, exec.getAccountGroupId(), ModuleIdentifierConstant.CROSSING_RATE_MASTER);
			final var txnDateTimeStamp = DateTimeUtility.getCurrentTimeStamp();

			final var	chargeIdArr = CollectionUtility.getLongListFromString((String) configuration.getOrDefault(CrossingRateMasterConfigurationConstant.CROSSING_CHARGES_IDS, null));

			if(filter == 1 && rateRowsCount > 0) {
				final List<CrossingRateMaster> crossingRateArrayList = new ArrayList<>();
				final List<CrossingAgentBranch> crossingAgentBranchArrayList = new ArrayList<>();

				for (var i = 1; i < rateRowsCount; i++)
					if(chargeIdArr.size() > 0)
						for(final Long id : chargeIdArr) {
							if(request.getParameter("destBranch_" + i) == null)
								//Row doesn't exist continue to Next row
								continue;

							if(JSPUtility.GetDouble(request, "charge" +id+ "_" + i, 0.0) > 0){

								final var isQuantityType 		= request.getParameter("isQuantity_" + i) != null;
								final var isCrossingAgent 		= request.getParameter("isAgent_" + i) != null;
								final var isFixType				= request.getParameter("isFix_" + i) != null;
								var isCrossingAgentBranchExists = false;

								final var crossingRateMaster = new CrossingRateMaster();

								crossingRateMaster.setAccountGroupId(exec.getAccountGroupId());
								crossingRateMaster.setTxnDateTimeStamp(txnDateTimeStamp);
								crossingRateMaster.setTxnTypeId(JSPUtility.GetShort(request, "txnType_" + i, WayBillCrossing.TRANSACTION_TYPE_BOOKING_CROSSING));
								crossingRateMaster.setChargeTypeMasterId(Short.parseShort(Long.toString(id)));
								crossingRateMaster.setRate(JSPUtility.GetDouble(request, "charge" +id+ "_" + i, 0.0));

								if(crossingRateMaster.getTxnTypeId() == 0)
									crossingRateMaster.setTxnTypeId(WayBillCrossing.TRANSACTION_TYPE_BOOKING_CROSSING);

								if(isCrossingAgent)
									crossingRateMaster.setCrossingAgentId(JSPUtility.GetLong(request, "crossingAgent_" + i, 0));

								crossingRateMaster.setSourceBranchId(JSPUtility.GetLong(request, "sourceBranchId", 0));

								if (request.getParameter("isAll_" + i) != null)
									crossingRateMaster.setDestinationBranchId(Constant.INPUT_ALL_ID);
								else
									crossingRateMaster.setDestinationBranchId(JSPUtility.GetLong(request, "destBranch_" + i, 0));

								crossingRateMaster.setRatePercentage(request.getParameter("isPercentage_" + i) != null);

								if(isQuantityType || isFixType) {
									if(isFixType)
										crossingRateMaster.setChargeTypeId(ChargeTypeConstant.CHARGETYPE_ID_FIX);
									else {
										crossingRateMaster.setPackingTypeId(JSPUtility.GetLong(request, "packingType_" + i, 0));
										crossingRateMaster.setChargeTypeId(ChargeTypeConstant.CHARGETYPE_ID_QUANTITY);
									}
								} else {
									crossingRateMaster.setWeightType(true);
									crossingRateMaster.setChargeTypeId(ChargeTypeConstant.CHARGETYPE_ID_WEIGHT);
								}

								if(isCrossingAgent && crossingRateMaster.getCrossingAgentId() > 0) {
									isCrossingAgentBranchExists = CrossingAgentBranchDao.getInstance().isCrossingAgentWithBranchExists(exec.getAccountGroupId(),crossingRateMaster.getDestinationBranchId(), crossingRateMaster.getCrossingAgentId());

									if(!isCrossingAgentBranchExists) {
										final var crossingAgentBranch = new CrossingAgentBranch();
										crossingAgentBranch.setAccountGroupId(exec.getAccountGroupId());
										crossingAgentBranch.setCrossingAgentId(crossingRateMaster.getCrossingAgentId());
										crossingAgentBranch.setDestinationBranchId(crossingRateMaster.getDestinationBranchId());
										crossingAgentBranch.setMarkForDelete(false);

										final var isAgentBranch	= crossingAgentBranchArrayList.stream().anyMatch(e -> e.getCrossingAgentId() == crossingAgentBranch.getCrossingAgentId() &&
												e.getDestinationBranchId() == crossingAgentBranch.getDestinationBranchId());

										if(!isAgentBranch)
											crossingAgentBranchArrayList.add(crossingAgentBranch);
									}
								}

								crossingRateMaster.setMarkForDelete(false);
								crossingRateArrayList.add(crossingRateMaster);
							}
						}

				if (!crossingRateArrayList.isEmpty())
					strResponse = CrossingRateMasterDao.getInstance().insert(crossingRateArrayList);

				if (!crossingAgentBranchArrayList.isEmpty())
					CrossingAgentBranchDao.getInstance().insert(crossingAgentBranchArrayList);
			}

			new InitializeCrossingRateMasterAction().execute(request, response);
			request.setAttribute("nextPageToken", "success");

			if(filter != 0) {
				response.sendRedirect("CrossingRateMaster.do?pageId=226&eventId=2&message="+strResponse);
				request.setAttribute("message", strResponse);
			}
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}
	}
}