package com.ivcargo.actions.transport;

import java.util.ArrayList;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.BranchCommissionBLL;
import com.businesslogic.CashStatementBLL;
import com.businesslogic.EditLogsBll;
import com.businesslogic.LRCostBLL;
import com.businesslogic.WayBillBll;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.bll.impl.datacreator.DataCreatorForBookingWayBillBllImpl;
import com.iv.dto.txn.WayBillCommissionTxn;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.constant.Constant;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.ConsignmentDetailsDao;
import com.platform.dao.ConsignmentSummaryDao;
import com.platform.dao.WayBillBookingChargesDao;
import com.platform.dao.WayBillDao;
import com.platform.dto.BranchCommission;
import com.platform.dto.CashStatementTxn;
import com.platform.dto.ConsignmentSummary;
import com.platform.dto.CostType;
import com.platform.dto.EditLogs;
import com.platform.dto.Executive;
import com.platform.dto.LRCost;
import com.platform.dto.TransportCommonMaster;
import com.platform.dto.WayBill;
import com.platform.dto.configuration.modules.CashStatementConfigurationDTO;
import com.platform.dto.configuration.modules.LrCostConfigurationDTO;
import com.platform.resource.CargoErrorList;
import com.platform.utils.PropertiesUtility;

public class UpdateWayBillVehicleTypeAction implements Action {

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	error 			= null;

		String				vehicleTypeName 	= null;
		var				prevVehicleTypeName = "";
		WayBillCommissionTxn						wayBillCommissionTxn				= null;
		ValueObject									lrCostObj							= null;
		LRCost[]									lrCostArray							= null;
		ArrayList<CashStatementTxn>                 cashStatementTxnAdd					= null;
		ArrayList<CashStatementTxn>                 cashStatementTxnUpdate				= null;
		CashStatementTxn[]							cashStatementTxnAddArray			= null;
		CashStatementTxn[]							cashStatementTxnUpdateArray			= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	cache					= new CacheManip(request);
			final var	executive				= (Executive) request.getSession().getAttribute("executive");
			final var	wayBillId				= JSPUtility.GetLong(request, "wayBillId");
			final var	vehicleTypeId    		= JSPUtility.GetLong(request, "vehicleType", 0);
			final var	prevVehicleTypeId   	= JSPUtility.GetLong(request, "prevVehicleTypeId", 0);
			final var	lrCostConfiguration		=  cache.getGroupWiseLRCostConfiguration(request, executive.getAccountGroupId());
			final var	isLrCost				=  lrCostConfiguration.getBoolean(LrCostConfigurationDTO.LR_COST, false);
			final var	bookingCommisisonCost	=  lrCostConfiguration.getBoolean(LrCostConfigurationDTO.BOOKING_COMMISSION_COST, false);
			final var	insertLrCostWithZero	= lrCostConfiguration.getBoolean(LrCostConfigurationDTO.INSERT_LR_COST_WITH_ZERO, false);
			final var	wayBillList				= new ArrayList<WayBill>();

			if(wayBillId > 0 && vehicleTypeId > 0){

				final var	transactionDate 		= DateTimeUtility.getCurrentTimeStamp();
				final var	wbFullPrevData          = WayBillDao.getInstance().getByWayBillId(wayBillId);
				final var	valueInObject			= new ValueObject();
				final var	billBll 				= new WayBillBll();
				final var	lrCostList				= new ArrayList<LRCost>();
				final var	deleteLRCostList		= new ArrayList<LRCost>();

				valueInObject.put("vehicleTypeId", vehicleTypeId);
				valueInObject.put("wayBillId", wayBillId);

				final var	sourceBranch = cache.getGenericBranchDetailCache(request, wbFullPrevData.getSourceBranchId());

				if(sourceBranch.isAgentBranch()) {
					final var	branchComm 			  = new ValueObject();
					final var	branchCommissionBLL   = new BranchCommissionBLL();

					final var	consignmentSummary     = ConsignmentSummaryDao.getInstance().getLimitedConsignmentSummaryData(wayBillId);
					final var	consignmentDetails	   = ConsignmentDetailsDao.getInstance().getLimitedConsignmentDetailsByWayBillId(wayBillId);
					final var	wayBillChargesArr	   = WayBillBookingChargesDao.getInstance().getWayBillCharges(wayBillId);

					branchComm.put("accountGroupId", wbFullPrevData.getAccountGroupId());
					branchComm.put("txnBranchId", wbFullPrevData.getSourceBranchId());
					branchComm.put("txnTypeId", BranchCommission.TXN_TYPE_BOOKING_ID);
					branchComm.put("bookingTypeId",wbFullPrevData.getBookingTypeId() > 0 ? wbFullPrevData.getBookingTypeId() : TransportCommonMaster.BOOKING_TYPE_SUNDRY_ID);
					branchComm.put("applicalbeOnBranchId", wbFullPrevData.getDestinationBranchId());
					branchComm.put("wayBillTypeId", wbFullPrevData.getWayBillTypeId());
					branchComm.put("discount", wbFullPrevData.getBookingDiscount());
					branchComm.put("chargeSumBooking", wbFullPrevData.getBookingChargesSum());
					branchComm.put("chargeSumDelivery", wbFullPrevData.getDeliveryChargesSum());
					branchComm.put("actualWeight", consignmentSummary.getActualWeight());
					branchComm.put("chargeWeight", consignmentSummary.getChargeWeight());
					branchComm.put("consignmentDetails", consignmentDetails);
					branchComm.put("wayBillBookingCharges",wayBillChargesArr);
					branchComm.put("vehicleTypeId",vehicleTypeId);
					branchComm.put(ConsignmentSummary.CONSIGNMENT_SUMMARY, consignmentSummary);
					branchComm.put("grandTotal", wbFullPrevData.getGrandTotal());
					branchComm.put("serviceTax", wbFullPrevData.getBookingTimeServiceTax() + wbFullPrevData.getDeliveryTimeServiceTax());
					branchComm.put("branchObj", sourceBranch);

					final var	branchCommOut 		 = branchCommissionBLL.getBranchCommission(branchComm);
					branchCommOut.put(Constant.ACCOUNT_GROUP_ID, wbFullPrevData.getAccountGroupId());
					branchCommOut.put(Constant.WAYBILL_ID, wayBillId);
					branchCommOut.put("txnTypeId", BranchCommission.TXN_TYPE_BOOKING_ID);
					wayBillCommissionTxn = DataCreatorForBookingWayBillBllImpl.getInstance().createModelForBranchCommission(branchCommOut);
				}

				if(isLrCost && bookingCommisisonCost && wayBillCommissionTxn != null){
					final var	lrCostBLL = new LRCostBLL();
					lrCostObj = new ValueObject();
					lrCostObj.put("costTypeId", CostType.COST_TYPE_BOOKING_COMMISSION_ID);
					lrCostObj.put("txnTypeId",LRCost.TXN_TYPE_BOOKING_COMMISSION_ID);
					lrCostObj.put("amount",wayBillCommissionTxn.getCommission());
					lrCostObj.put("creationDateTime", wbFullPrevData.getBookingDateTime());
					lrCostObj.put("txnId", wayBillId);
					lrCostObj.put("wayBillId", wayBillId);

					final var	lrCost = lrCostBLL.getLRCostDTO(lrCostObj);

					if(lrCost.getAmount() > 0)
						lrCostList.add(lrCost);
					else
						deleteLRCostList.add(lrCost);
				}

				final var	configurationCashStatement		= cache.getCashStatementConfiguration(request, executive.getAccountGroupId());
				final var	isAllowCashStatement			= PropertiesUtility.isAllow(configurationCashStatement.get(CashStatementConfigurationDTO.DATA_FOR_CASH_STATEMENT)+"");
				final var	bookingCommisisonDebitEffect	= PropertiesUtility.isAllow(configurationCashStatement.get(CashStatementConfigurationDTO.DATA_FOR_BOOKING_COMMISSION_DEBIT_EFFECT)+"");

				if(isAllowCashStatement && bookingCommisisonDebitEffect){
					final var	commissionDebitObj = new ValueObject();
					commissionDebitObj.put("wayBillId", wayBillId);
					commissionDebitObj.put("wayBillCommissionTxn", wayBillCommissionTxn);
					commissionDebitObj.put("accountGroupId", wbFullPrevData.getAccountGroupId());
					commissionDebitObj.put("txnAccountGroupId", wbFullPrevData.getBookedForAccountGroupId());
					commissionDebitObj.put("txnDateTime", wbFullPrevData.getBookingDateTime());
					commissionDebitObj.put("branchId", wbFullPrevData.getBookingBranchId());

					final var	cashStatementBLL = new CashStatementBLL();
					final var	cashStatementTxnDebit = cashStatementBLL.getCashStatementForBookingCommissionDebitEffect(commissionDebitObj);
					cashStatementTxnAdd 	= new ArrayList<>();
					cashStatementTxnUpdate = new ArrayList<>();

					if(cashStatementTxnDebit.isInsertFlag())
						cashStatementTxnAdd.add(cashStatementTxnDebit);

					if(cashStatementTxnDebit.isUpdateFlag())
						cashStatementTxnUpdate.add(cashStatementTxnDebit);

					if(!cashStatementTxnAdd.isEmpty()){
						cashStatementTxnAddArray = new CashStatementTxn[cashStatementTxnAdd.size()];
						cashStatementTxnAdd.toArray(cashStatementTxnAddArray);
					}

					if(!cashStatementTxnUpdate.isEmpty()){
						cashStatementTxnUpdateArray = new CashStatementTxn[cashStatementTxnUpdate.size()];
						cashStatementTxnUpdate.toArray(cashStatementTxnUpdateArray);
					}
				}

				final var	wayBill = new WayBill();
				wayBill.setWayBillId(wayBillId);
				wayBill.setVehicleTypeId(vehicleTypeId);
				wayBill.setBookingCommission(wayBillCommissionTxn != null ? wayBillCommissionTxn.getCommission() : 0.00);

				wayBillList.add(wayBill);

				final var	wayBillArray = new WayBill[wayBillList.size()];
				wayBillList.toArray(wayBillArray);

				if(lrCostList != null && !lrCostList.isEmpty()) {
					lrCostArray = new LRCost[lrCostList.size()];
					lrCostList.toArray(lrCostArray);
				}

				valueInObject.put("wayBills", wayBillArray);
				valueInObject.put("wayBillCommissionTxn", wayBillCommissionTxn);
				valueInObject.put("lrCostArray", lrCostArray);
				valueInObject.put("cashStatementTxnAdd", cashStatementTxnAdd);
				valueInObject.put("cashStatementTxnUpdateArray", cashStatementTxnUpdateArray);
				valueInObject.put("deleteLRCostList", deleteLRCostList);
				valueInObject.put("insertLrCostWithZero", insertLrCostWithZero);

				final var	updateCount = billBll.updateVehicleType(valueInObject);

				var	vehicleType = cache.getVehicleType(request, executive.getAccountGroupId(), vehicleTypeId);

				if(vehicleType != null)
					vehicleTypeName = vehicleType.getName();

				vehicleType = cache.getVehicleType(request, executive.getAccountGroupId(), prevVehicleTypeId);

				if(vehicleType != null)
					prevVehicleTypeName = vehicleType.getName();

				final var	editLog = new EditLogs();
				editLog.setEditWaybillId(wayBillId);
				editLog.setExecutiveId(executive.getExecutiveId());
				editLog.setPreviousExecutiveId(wbFullPrevData.getExecutiveId());
				editLog.setDescripstionData("Vehicle Type Id :"+vehicleTypeId+" Name :"+vehicleTypeName);
				editLog.setPreviousDescripstionData("Vehicle Type Id :"+prevVehicleTypeId+" Name :"+prevVehicleTypeName);
				editLog.setCreationDate(transactionDate);
				editLog.setMarkForDelete(false);
				editLog.setDescripstionEditTypeId(EditLogs.Description_LR_Vehicle_Type_Edit);
				editLog.setTypeWaybillTypeId(EditLogs.Type_LR);

				final var	valObject =  new ValueObject();
				valObject.put("editLog", editLog);

				final var	editLogsBll = new EditLogsBll();
				editLogsBll.genericEditLogs(valObject);

				if(updateCount > 0) {
					request.setAttribute("filter",1);
					request.setAttribute("wayBillId",wayBillId);
					request.setAttribute("nextPageToken", "success");
				} else {
					error.put("errorCode", CargoErrorList.EDIT_WAYBILL_VEHICLE_TYPE_ERROR);
					error.put("errorDescription",CargoErrorList.EDIT_WAYBILL_VEHICLE_TYPE_ERROR_DESCRIPTION);
					request.setAttribute("cargoError", error);
					request.setAttribute("nextPageToken", "failure");
				}
			} else {
				error.put("errorCode", CargoErrorList.LR_ISSUE_ERROR);
				error.put("errorDescription", CargoErrorList.LR_ISSUE_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
				request.setAttribute("nextPageToken", "failure");
			}
		} catch (final Exception _e) {
			ActionStaticUtil.catchActionException(request, _e, error);
		}
	}
}
