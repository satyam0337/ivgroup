package com.ivcargo.ajax;

import java.io.PrintWriter;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringUtils;
import org.json.JSONObject;

import com.businesslogic.utils.SequenceCounterBLL;
import com.businesslogic.waybillnumbergenerate.WayBillNumberRangeGeneratorforBranch;
import com.framework.Action;
import com.iv.bll.utility.JsonUtility;
import com.iv.dto.constant.WayBillTypeConstant;
import com.iv.utils.constant.Constant;
import com.iv.utils.exception.ExceptionProcess;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.SequenceCounterDao;
import com.platform.dto.Executive;
import com.platform.dto.SequenceCounter;
import com.platform.dto.configuration.modules.GroupConfigurationPropertiesDTO;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

public class SequenceCheckAjaxAction implements Action{

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		// TODO Auto-generated method stub
		HashMap<String,Object>	error 	= null;
		SequenceCounter	sequenceCounter	= null;
		PrintWriter		out				= null;
		JSONObject		jsonObjectIn	= null;
		JSONObject		jsonObjectOut	= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error))
				return;

			response.setContentType("application/json");

			out						= response.getWriter();
			jsonObjectOut			= new JSONObject();
			jsonObjectIn			= new JSONObject(request.getParameter("json"));
			final short	filter		= Utility.getShort(jsonObjectIn.get("filter"));

			if(request.getSession().getAttribute(Executive.EXECUTIVE) == null) {
				jsonObjectOut.put(CargoErrorList.ERROR_DESCRIPTION, "You have been logged out. Please login again.");
				out.println(jsonObjectOut);
				return;
			}

			final var	cache			= new CacheManip(request);
			final var	executive		= cache.getExecutive(request);
			final var	groupId			= jsonObjectIn.optLong("groupId",0);
			final var	agencyId		= jsonObjectIn.optLong("agencyId",0);
			final var	branchId		= jsonObjectIn.optLong("branchId",0);
			final var sequenceType 		= (short) jsonObjectIn.optInt("sequenceType", 0);

			switch (filter) {
			case 1:			// For Sequence Counter of Booking
				sequenceCounter = SequenceCounterDao.getInstance().getRangeSequenceCounter(groupId, agencyId, branchId, sequenceType);

				if(sequenceCounter != null) {
					if(sequenceCounter.getNextVal() >= sequenceCounter.getMinRange()
							&& sequenceCounter.getNextVal() <= sequenceCounter.getMaxRange()) {
					} else
						response.sendRedirect("SearchWayBill.do?pageId=0&eventId=1&filter=1");
				} else
					response.sendRedirect("SearchWayBill.do?pageId=0&eventId=1&filter=2");
				break;
			case 2:
				try {
					final var seqCounter = new SequenceCounter();
					seqCounter.setAccountGroupId(groupId);
					seqCounter.setBranchId(branchId);

					SequenceCounterDao.getInstance().deleteLRNumberBlocked(seqCounter, (short)2);
					jsonObjectOut.put("success", "Blocked LR number deleted successfully");
				} catch (final Exception e) {
				}
				break;
			case 3:
				try {
					final var valueObject = JsonUtility.convertJsonObjectsToValueObject(jsonObjectIn);
					valueObject.put(Executive.EXECUTIVE, executive);
					valueObject.put("checkWayBillTypeWiseLRSequence", true);
					valueObject.put(GroupConfigurationPropertiesDTO.GROUP_CONFIGURATION, cache.getGroupConfiguration(request, executive.getAccountGroupId()));

					if(StringUtils.isEmpty(valueObject.getString(Constant.BRANCH_CODE))) {
						jsonObjectOut.put(CargoErrorList.ERROR_CODE, CargoErrorList.BRANCH_CODE_NOT_DEFINE_ERROR);
						jsonObjectOut.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.BRANCH_CODE_NOT_DEFINE_ERROR_DESCRIPTION);
					} else if(valueObject.getLong(Constant.WAY_BILL_TYPE_ID, 0) == WayBillTypeConstant.WAYBILL_TYPE_CREDIT && StringUtils.isEmpty(valueObject.getString(Constant.TBB_PARTY_CODE))) {
						jsonObjectOut.put(CargoErrorList.ERROR_CODE, CargoErrorList.PARTY_CODE_MISSING);
						jsonObjectOut.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.PARTY_CODE_MISSING_DESCRIPTION);
					} else
						jsonObjectOut.put(Constant.WAYBILL_NUMBER, SequenceCounterBLL.getInstance(branchId).getWayBillTypeWiseLRSequence(valueObject).getString(Constant.WAYBILL_NUMBER));
				} catch (final Exception e) {
					ExceptionProcess.execute(e, SequenceCheckAjaxAction.class.getName());
				}
				break;
				
			case 4:
				try {
					final var valueObject = JsonUtility.convertJsonObjectsToValueObject(jsonObjectIn);
					valueObject.put(Executive.EXECUTIVE, executive);
					valueObject.put("differentRangeIncrementSequenceForTopayLR", true);
					valueObject.put(GroupConfigurationPropertiesDTO.GROUP_CONFIGURATION, cache.getGroupConfiguration(request, executive.getAccountGroupId()));

				  jsonObjectOut.put(Constant.WAYBILL_NUMBER, WayBillNumberRangeGeneratorforBranch.getInstance().getWayBillTypeWiseLRSequence(valueObject).getString(Constant.WAYBILL_NUMBER));
				} catch (final Exception e) {
					ExceptionProcess.execute(e, SequenceCheckAjaxAction.class.getName());
				}
				break;
			case 5:
				try {
					final var valueObject = JsonUtility.convertJsonObjectsToValueObject(jsonObjectIn);
					valueObject.put(Executive.EXECUTIVE, executive);
					valueObject.put("checkWayBillTypeWiseLRSequence", true);
					valueObject.put(GroupConfigurationPropertiesDTO.GROUP_CONFIGURATION, cache.getGroupConfiguration(request, executive.getAccountGroupId()));

					if(StringUtils.isEmpty(valueObject.getString(Constant.BRANCH_CODE))) {
						jsonObjectOut.put(CargoErrorList.ERROR_CODE, CargoErrorList.BRANCH_CODE_NOT_DEFINE_ERROR);
						jsonObjectOut.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.BRANCH_CODE_NOT_DEFINE_ERROR_DESCRIPTION);
					} else
						jsonObjectOut.put(Constant.WAYBILL_NUMBER, SequenceCounterBLL.getInstance(branchId).getWayBillTypeWiseLRSequence(valueObject).getString(Constant.WAYBILL_NUMBER));
				} catch (final Exception e) {
					ExceptionProcess.execute(e, SequenceCheckAjaxAction.class.getName());
				}
				break;
			default:
				break;
			}

			out.println(jsonObjectOut);

			request.setAttribute("nextPageToken", "success");
		} catch (final Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		} finally {
			out.flush();
			out.close();
		}
	}
}
