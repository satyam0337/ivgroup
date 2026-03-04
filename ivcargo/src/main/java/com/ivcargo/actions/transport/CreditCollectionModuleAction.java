package com.ivcargo.actions.transport;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.CreditPaymentModuleBLL;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.logsapp.LogWriter;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.platform.dao.EditLogsDao;
import com.platform.dao.WayBillDao;
import com.platform.dto.EditLogs;
import com.platform.dto.Executive;
import com.platform.dto.WayBill;
import com.platform.dto.model.CreditWayBillTxn;
import com.platform.resource.CargoErrorList;

public class CreditCollectionModuleAction implements Action {

	private static final String TRACE_ID = "CreditCollectionModuleAction";

	@SuppressWarnings("unchecked")
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		// TODO Auto-generated method stub

		HashMap<String,Object>	 		error 					= null;
		CreditWayBillTxn[] 				creditWayBillTxns		= null;
		ArrayList<CreditWayBillTxn>		creditWBTxnList 		= null;
		CreditWayBillTxn 				creditWayBillTxn		= null;
		Executive   					executive 				= null;
		Timestamp 						createDate 				= null;
		ValueObject						valueInObject			= null;
		ValueObject						valueOutObject			= null;
		CreditPaymentModuleBLL			moduleBLL				= null;
		String[]						wayBillIdsArr			= null;
		String							collectionPersonName	= null;
		long							selectedCollectionId	= 0;
		EditLogs[]						editLog					= null;
		String							wayBillIds				= "";
		HashMap<Long, WayBill> 			hashMap					= null;
		WayBill							wayBill					= null;

		try {

			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error)){
				return;
			}
			creditWBTxnList 		= new ArrayList<CreditWayBillTxn>();
			executive 				= (Executive) request.getSession().getAttribute("executive");
			createDate 				= new Timestamp(new Date().getTime());
			valueInObject			= new ValueObject();
			selectedCollectionId	= JSPUtility.GetLong(request, "selectedCollectionPersonId");
			wayBillIdsArr 			= request.getParameterValues("checkbox");
			editLog					= new EditLogs[wayBillIdsArr.length];
			collectionPersonName	= JSPUtility.GetString(request, "searchCollectionPerson");

			for (int i = 0; i < wayBillIdsArr.length; i++) {
				wayBillIds = wayBillIds +Long.parseLong(wayBillIdsArr[i].split(";")[0])+",";
			}

			valueOutObject = WayBillDao.getInstance().getWayBillDetails(wayBillIds.substring(0, wayBillIds.length()-1));

			if(valueOutObject != null) {
				hashMap 			= (HashMap<Long, WayBill>)valueOutObject.get("WayBillHM");
			}

			for (int i = 0; i < wayBillIdsArr.length; i++) {

				creditWayBillTxn = new CreditWayBillTxn();
				creditWayBillTxn.setWayBillId(Long.parseLong(wayBillIdsArr[i].split(";")[0]));
				creditWayBillTxn.setTxnTypeId(Short.parseShort(wayBillIdsArr[i].split(";")[1]));
				creditWayBillTxn.setCollectionPersonId(selectedCollectionId);
				creditWBTxnList.add(creditWayBillTxn);

				if(hashMap != null){
					wayBill		= hashMap.get(creditWayBillTxn.getWayBillId());
				}
				editLog[i] 	= new EditLogs();
				editLog[i].setEditWaybillId(Long.parseLong(wayBillIdsArr[i].split(";")[0]));
				editLog[i].setExecutiveId(executive.getExecutiveId());
				editLog[i].setPreviousExecutiveId(executive.getExecutiveId());
				editLog[i].setDescripstionData("CollectionPersonName: "+collectionPersonName+"^WayBillNumber :"+wayBill.getWayBillNumber());
				editLog[i].setPreviousDescripstionData("CollectionPersonName: "+collectionPersonName+"^WayBillNumber :"+wayBill.getWayBillNumber());
				editLog[i].setCreationDate(createDate);
				editLog[i].setMarkForDelete(false);
				editLog[i].setDescripstionEditTypeId(EditLogs.Description_Credit_Collection_Person_Edit);
				editLog[i].setTypeWaybillTypeId(EditLogs.Type_CREDIT_COLLECTION);

			}

			creditWayBillTxns  = new CreditWayBillTxn[creditWBTxnList.size()];
			creditWBTxnList.toArray(creditWayBillTxns);

			valueInObject.put("CreditWayBillTxn", creditWayBillTxns);

			moduleBLL		= new CreditPaymentModuleBLL();
			valueOutObject	= moduleBLL.updateForCreditCollection(valueInObject);

			if(valueOutObject != null) {
				if(Integer.parseInt(valueOutObject.get("success").toString()) == 1) {
					EditLogsDao.getInstance().multipleInsertIntoEditLogs(editLog);
					LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO,"=========== Collection Person Assigned Successfully ==== ");
					response.sendRedirect("CreditCollection.do?pageId=265&eventId=5&successMsgAfterBillClear=2&wayBillIds="+wayBillIds.substring(0, wayBillIds.length()-1)+"&collectionPersonName="+collectionPersonName);
				}
			} else {
				LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO, (String) error.get("errorCode")+" "+(String) error.get("errorDescription"));
				error.put("errorCode", CargoErrorList.CREDIT_WAYBILL_CLEARANCE_ERROR);
				error.put("errorDescription", CargoErrorList.CREDIT_WAYBILL_CLEARANCE_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
				request.setAttribute("nextPageToken", "failure");
			}
		}
		catch (Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		} finally {
			creditWayBillTxns	= null;
			creditWBTxnList 	= null;
			creditWayBillTxn	= null;
			executive 			= null;
			createDate 			= null;
			valueInObject		= null;
			valueOutObject		= null;
			moduleBLL			= null;
			editLog				= null;
			wayBillIds			= null;
			hashMap				= null;
			wayBill				= null;
		}

	}
}