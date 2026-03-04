package com.ivcargo.actions;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.EditLogsBll;
import com.businesslogic.PartyDataTransferTxnCheckerBll;
import com.businesslogic.asyncsender.PartyDataTransferDataSender;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.platform.dao.CorporateAccountDao;
import com.platform.dao.PartyTransferDao;
import com.platform.dto.CorporateAccount;
import com.platform.dto.Executive;
import com.platform.dto.PartyDataTransferTxnChecker;
import com.platform.dto.PartyTransfer;

public class PartyTransferAction implements Action {

	public static final String TRACE_ID = "PartyTransferAction";

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {

		HashMap<String,Object>	 error 				= null;
		PartyTransfer		fromParty				= null;
		PartyTransfer		toParty					= null;
		EditLogsBll			editLogsBll				= null;
		CorporateAccount[]	corporateAccountParty	= null;
		CorporateAccount[]	corporateAccountTbb		= null;
		String				strResponse				= null;
		ValueObject			valueObj				= null;
		Executive			exec					= null;
		String				returnedId				= null;
		var filter = 0;
		/*
		 * Object declaration for Akka
		 */
		PartyDataTransferTxnChecker  		partyDataTransferTxnChecker 	            = null;
		PartyDataTransferTxnCheckerBll	    partyDataTransferTxnCheckerBll	            = null;
		PartyDataTransferDataSender			partyDataTransferDataSender 	            = null;
		try {

			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;
			fromParty	= new PartyTransfer();
			toParty		= new PartyTransfer();
			valueObj	= new ValueObject();
			exec		= (Executive)request.getSession().getAttribute("executive");
			filter		= JSPUtility.GetShort(request, "filter",(short) 0);

			fromParty.setFromCorporateAccountIdWhenParty(JSPUtility.GetLong(request, "fromPartyId",0));
			toParty.setToCorporateAccountIdWhenParty(JSPUtility.GetLong(request, "toPartyId",0));
			fromParty.setFromCorporateAccountIdWhenTBB(JSPUtility.GetLong(request, "fromTBBId",0));
			toParty.setToCorporateAccountIdWhenTBB(JSPUtility.GetLong(request, "toTBBId",0));
			fromParty.setAccountGroupId(exec.getAccountGroupId());
			fromParty.setExecutiveId(exec.getExecutiveId());
			fromParty.setUpdateOrDelete((short) filter);

			if(
					fromParty.getFromCorporateAccountIdWhenParty()==toParty.getToCorporateAccountIdWhenParty()
					&& fromParty.getFromCorporateAccountIdWhenParty() > 0 && toParty.getToCorporateAccountIdWhenParty() > 0
					||
					fromParty.getFromCorporateAccountIdWhenTBB()==toParty.getToCorporateAccountIdWhenTBB()
					&& fromParty.getFromCorporateAccountIdWhenTBB() >0 && toParty.getToCorporateAccountIdWhenTBB() > 0
					)
				returnedId="from party and to party cannot be the same";
			else{
				if(fromParty.getFromCorporateAccountIdWhenParty()>0 && toParty.getToCorporateAccountIdWhenParty()>0)
				{
					final var partyIds=fromParty.getFromCorporateAccountIdWhenParty()+","+toParty.getToCorporateAccountIdWhenParty();
					corporateAccountParty = CorporateAccountDao.getInstance().getPartyDetailsForLogs(partyIds);
					valueObj.put("corporateAccountParty", corporateAccountParty);
					valueObj.put("fromParty", fromParty);
					valueObj.put("toParty", toParty);

				}
				if(fromParty.getFromCorporateAccountIdWhenTBB()>0 && toParty.getToCorporateAccountIdWhenTBB()>0)
				{
					final var tbbIds=fromParty.getFromCorporateAccountIdWhenTBB()+","+toParty.getToCorporateAccountIdWhenTBB();
					corporateAccountTbb = CorporateAccountDao.getInstance().getPartyDetailsForLogs(tbbIds);
					valueObj.put("corporateAccountTbb", corporateAccountTbb);
					valueObj.put("fromParty", fromParty);
					valueObj.put("toParty", toParty);

				}
				returnedId = PartyTransferDao.getInstance().transferParty(fromParty,toParty,(short) filter);
				/*
				 * We are in else condition means from party & to party are different so it is valid further operation
				 */
				partyDataTransferTxnCheckerBll	= new PartyDataTransferTxnCheckerBll();
				partyDataTransferTxnChecker = partyDataTransferTxnCheckerBll.insert(fromParty, toParty, exec.getBranchId(), 0);
				/**
				 * Here we are sending Akka for Data insert & update in Partywise Ledger Report
				 */
				if(partyDataTransferTxnChecker!=null){
					partyDataTransferDataSender =	new PartyDataTransferDataSender();
					partyDataTransferDataSender.processPartyWiseLedgerAccountsAkkaDataInsert(partyDataTransferTxnChecker.getFromParty(), partyDataTransferTxnChecker.getToParty(), partyDataTransferTxnChecker, exec.getBranchId());
				}
			}

			strResponse=returnedId;

			request.setAttribute("nextPageToken", "success");
			if(filter != 0) {
				editLogsBll = new EditLogsBll();
				editLogsBll.editLogsForPartyDataTransfer(valueObj);
				response.sendRedirect("PartyTransfer.do?pageId=58&eventId=1&message="+strResponse);
				request.setAttribute("message",strResponse);
			}
		}catch (final Exception _e) {

			ActionStepsUtil.catchActionException(request, _e, error);
		}finally {

			fromParty						= null;
			toParty							= null;
			editLogsBll						= null;
			corporateAccountParty			= null;
			corporateAccountTbb				= null;
			strResponse						= null;
			valueObj						= null;
			exec							= null;
			returnedId						= null;
			partyDataTransferTxnChecker		= null;
			partyDataTransferTxnCheckerBll	= null;
			partyDataTransferDataSender		= null;
		}

	}
}