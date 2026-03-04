package com.ivcargo.actions;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.CorporateAccountBLL;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.logsapp.LogWriter;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.platform.dao.RateMasterDao;
import com.platform.dto.ChargeTypeMaster;
import com.platform.dto.CorporateAccount;
import com.platform.dto.Executive;
import com.platform.dto.TransportCommonMaster;
import com.platform.resource.CargoErrorList;

public class CorporateAccountAction implements Action {
	public static final String TRACE_ID = "CorporateAccountAction";

	public void execute(HttpServletRequest request, HttpServletResponse response) {

		HashMap<String,Object>	error 			= null;
		ValueObject 			valueInObject  	= null;
		ValueObject 			valueOutObject 	= null;
		Executive      			executive		= null;
		CorporateAccountBLL 	bLayer 			= null;
		CorporateAccount[] 		corporateAcc 	= null;
		StringBuffer 			corpIds 		= null;
		HashMap<Long, Double>	corpRate 		= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error)){
				return;
			}

			bLayer 			= new CorporateAccountBLL();
			executive		= (Executive) request.getSession().getAttribute("executive");
			valueInObject  	= new ValueObject();
			valueOutObject 	= new ValueObject();
			valueInObject.put("accountGroupId", JSPUtility.GetString(request, "accountGroupId"));
			valueInObject.put("cityId", executive.getCityId());
			valueInObject.put("cityWiseCreditorAllowed", JSPUtility.GetShort(request, "cityWiseCreditorAllowed", (short)0));
			
			valueOutObject = bLayer.getActiveCorporateAccountForGroup(valueInObject);
			request.setAttribute("flag", JSPUtility.GetString(request, "flag"));

			if (valueOutObject.get("corporateAccount") != null) {
				corporateAcc = (CorporateAccount[]) valueOutObject.get("corporateAccount");

				corpIds = new StringBuffer(); 
				
				for (int i = 0; i < corporateAcc.length; i++) {
					if(i == 0) {
						corpIds.append(""+corporateAcc[i].getCorporateAccountId());
					} else {
						corpIds.append(","+corporateAcc[i].getCorporateAccountId());
					}	
				}

				corpRate = RateMasterDao.getInstance().getCorporateRate(ChargeTypeMaster.MINIMUM_WEIGHT, ChargeTypeMaster.MINIMUM_WEIGHT, ChargeTypeMaster.MINIMUM_WEIGHT, executive.getAccountGroupId(), corpIds.toString(), TransportCommonMaster.RATE_CATEGORY_CREDITOR);

				if(corpRate != null) {
					for (int i = 0; i < corporateAcc.length; i++) {
						if(corpRate.get(corporateAcc[i].getCorporateAccountId()) != null) {
							corporateAcc[i].setCorporateRate(corpRate.get(corporateAcc[i].getCorporateAccountId()));
						}
					}
				}

				request.setAttribute("corporateAccount", corporateAcc);
				request.setAttribute("nextPageToken", "success");
			} else {
				error.put("errorCode", CargoErrorList.CORPORATEDETAILS_NOT_FOUND);
				error.put("errorDescription", CargoErrorList.CORPORATEDETAILS_NOT_FOUND_DESCRIPTION);
				LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR,CargoErrorList.CORPORATEDETAILS_NOT_FOUND_DESCRIPTION);
				request.setAttribute("cargoError", error);
				request.setAttribute("nextPageToken", "success");
			}
		} catch (Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		} finally {
			valueInObject  	= null;
			valueOutObject 	= null;
			executive		= null;
			bLayer 			= null;
			corporateAcc 	= null;
			corpIds 		= null;
			corpRate 		= null;
		}
	}
}
