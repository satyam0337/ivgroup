package com.ivcargo.actions;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.CorporateAccountBLL;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.logsapp.LogWriter;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionErrors;
import com.platform.dao.RateMasterDao;
import com.platform.dto.ChargeTypeMaster;
import com.platform.dto.CorporateAccount;
import com.platform.dto.Executive;
import com.platform.dto.TransportCommonMaster;

public class CorporateDetailsForAjaxAction implements Action {

	public static final String TRACE_ID = "CorporateDetailsForAjaxAction";

	public void execute(HttpServletRequest request, HttpServletResponse response) {

		ValueObject 			valueInObject  	= null;
		ValueObject 			valueOutObject 	= null;
		Executive      			executive		= null;
		CorporateAccountBLL 	bLayer 			= null;
		CorporateAccount 		corporateAcc 	= null;
		HashMap<Long, Double>	corpRate 		= null;

		try {

			bLayer 			= new CorporateAccountBLL();
			executive		= (Executive) request.getSession().getAttribute("executive");
			valueInObject  	= new ValueObject();
			valueOutObject 	= new ValueObject();

			if (request.getAttribute("corporateAccountId") != null) {
				valueInObject.put("corporateAccountId", request.getAttribute("corporateAccountId"));
			} else {
				valueInObject.put("corporateAccountId", JSPUtility.GetLong(request, "corpId"));
			}

			valueOutObject = bLayer.getCorporateAccountById(valueInObject);

			if (valueOutObject.get("corporateAccount") != null) {
				corporateAcc = (CorporateAccount) valueOutObject.get("corporateAccount");

				//Min Weight
				corpRate = RateMasterDao.getInstance().getCorporateRate(ChargeTypeMaster.MINIMUM_WEIGHT,ChargeTypeMaster.MINIMUM_WEIGHT, ChargeTypeMaster.MINIMUM_WEIGHT,executive.getAccountGroupId(),Long.toString(corporateAcc.getCorporateAccountId()),TransportCommonMaster.RATE_CATEGORY_CREDITOR);
				
				if(corpRate != null && corpRate.size() > 0) {
					corporateAcc.setCorporateRate(corpRate.get(corporateAcc.getCorporateAccountId()));
				}

				corpRate = RateMasterDao.getInstance().getCorporateRate(ChargeTypeMaster.DD_SLAB,ChargeTypeMaster.DD_SLAB, ChargeTypeMaster.DD_SLAB,executive.getAccountGroupId(),Long.toString(corporateAcc.getCorporateAccountId()),TransportCommonMaster.RATE_CATEGORY_CREDITOR);
			
				if(corpRate != null && corpRate.size() > 0) {
					corporateAcc.setCorporateDDSlabRate(corpRate.get(corporateAcc.getCorporateAccountId()));
				}

				request.setAttribute("corporateAccount", corporateAcc);
				request.setAttribute("nextPageToken", "success");
			} else {
				request.setAttribute("corporateAccount", null);
				request.setAttribute("nextPageToken", "success");
			}
		} catch (Exception _e) {
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, ActionErrors.CATCH_ACTION_EXCEPTION_DESCRIPTION);
		} finally {
			valueInObject  	= null;
			valueOutObject 	= null;
			executive		= null;
			bLayer 			= null;
			corporateAcc 	= null;
			corpRate 		= null;
		}
	}
}