package com.ivcargo.actions;

import java.util.ArrayList;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.BranchCommissionBLL;
import com.businesslogic.CashStatementBLL;
import com.businesslogic.LRCostBLL;
import com.businesslogic.WayBillBll;
import com.businesslogic.properties.impl.PropertyConfigValueBLLImpl;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.bll.impl.datacreator.DataCreatorForBookingWayBillBllImpl;
import com.iv.dto.txn.WayBillCommissionTxn;
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
import com.platform.dto.Executive;
import com.platform.dto.LRCost;
import com.platform.dto.PropertiesFileConstants;
import com.platform.dto.TransportCommonMaster;
import com.platform.dto.WayBill;
import com.platform.dto.WayBillBookingCharges;
import com.platform.dto.configuration.modules.CashStatementConfigurationDTO;
import com.platform.dto.configuration.modules.LrCostConfigurationDTO;
import com.platform.resource.CargoErrorList;
import com.platform.utils.PropertiesUtility;

public class UpdateVehicleTypeAction implements Action{

	public static final String TRACE_ID  = "UpdateVehicleTypeAction";

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	 	error 					= null;

		WayBillBookingCharges[]						wayBillBkgChargeArray				= null;
		ArrayList<CashStatementTxn>                 cashStatementTxnAdd					= null;
		CashStatementTxn[]							cashStatementTxnAddArray			= null;
		CashStatementTxn[]							cashStatementTxnUpdateArray			= null;
		LRCost[]									lrCostArray							= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	executive 	= (Executive)request.getSession().getAttribute("executive");
			final var	wayBillIds	= request.getParameterValues("wayBillIds");
			final var	wbIdStr		= new StringBuilder();
			final var	lsNumber	= request.getParameter("LSNumber");

			for(var i = 0; i < wayBillIds.length ; i++)
				if(i==0)
					wbIdStr.append(""+wayBillIds[i]);
				else
					wbIdStr.append(","+wayBillIds[i]);

			final var	cache		= new CacheManip(request);
			final var	wbColl		= new HashMap<Long,WayBill>();
			final var	lrCostConfiguration		=  cache.getGroupWiseLRCostConfiguration(request, executive.getAccountGroupId());
			final var	isLrCost				=  lrCostConfiguration.getBoolean(LrCostConfigurationDTO.LR_COST, false);
			final var	bookingCommisisonCost	=  lrCostConfiguration.getBoolean(LrCostConfigurationDTO.BOOKING_COMMISSION_COST, false);
			final var	insertLrCostWithZero	= lrCostConfiguration.getBoolean(LrCostConfigurationDTO.INSERT_LR_COST_WITH_ZERO, false);

			final var	wayBillHM					  = WayBillDao.getInstance().getWayBillsByWayBillIds(wbIdStr.toString());
			final var	consignmentSummaryHM 		  = ConsignmentSummaryDao.getInstance().getConsignmentSummaryWeightsByWayBillIds(wbIdStr.toString());
			final var	conArrCol	 		 		  = ConsignmentDetailsDao.getInstance().getConsignmentDetailsArrayByWayBillIds(wbIdStr.toString());
			final var	wayBillIdWiseBookingchargesHM = WayBillBookingChargesDao.getInstance().getWayBillIdWiseChargesMap(wbIdStr.toString());

			final var	configurationCashStatement		= PropertyConfigValueBLLImpl.getInstance().getConfiguration(executive, PropertiesFileConstants.CASH_STATEMENT_REPORT);
			final var	isAllowCashStatement			= PropertiesUtility.isAllow(configurationCashStatement.get(CashStatementConfigurationDTO.DATA_FOR_CASH_STATEMENT)+"");
			final var	bookingCommisisonDebitEffect	= PropertiesUtility.isAllow(configurationCashStatement.get(CashStatementConfigurationDTO.DATA_FOR_BOOKING_COMMISSION_DEBIT_EFFECT)+"");

			final var	branchComm 					  = new ValueObject();
			final var	branchCommissionBLL 		  = new BranchCommissionBLL();
			final var	wayBillCommissionTxnList	  = new ArrayList<WayBillCommissionTxn>();
			final var	lrCostBLL					  = new LRCostBLL();
			final var	lrCostList					  = new ArrayList<LRCost>();
			final var	deleteLRCostList			  = new ArrayList<LRCost>();

			for (final String wayBillId : wayBillIds) {
				final var	wayBill = new WayBill();
				wayBill.setWayBillId(Long.parseLong(wayBillId));
				wayBill.setVehicleTypeId(JSPUtility.GetLong(request, "wbVehicleType_"+wayBill.getWayBillId(), 0));

				final var	prevWayBill			= wayBillHM.get(wayBill.getWayBillId());
				final var	conSum	 			= consignmentSummaryHM.get(wayBill.getWayBillId());
				final var	consignmentDetails	= conArrCol.get(wayBill.getWayBillId());
				final var	wayBillBkgChargeHM  = wayBillIdWiseBookingchargesHM.get(wayBill.getWayBillId());

				final var	sourceBranch = cache.getGenericBranchDetailCache(request, prevWayBill.getSourceBranchId());

				if(sourceBranch.isAgentBranch()){
					if(wayBillBkgChargeHM != null && wayBillBkgChargeHM.size() > 0)
						wayBillBkgChargeArray = wayBillBkgChargeHM.values().toArray(new WayBillBookingCharges[wayBillBkgChargeHM.size()]);

					branchComm.put("accountGroupId", prevWayBill.getAccountGroupId());
					branchComm.put("txnBranchId", prevWayBill.getSourceBranchId());
					branchComm.put("txnTypeId", BranchCommission.TXN_TYPE_BOOKING_ID);
					branchComm.put("bookingTypeId", conSum.getBookingTypeId() > 0 ? conSum.getBookingTypeId() : TransportCommonMaster.BOOKING_TYPE_SUNDRY_ID); //This is hard code because in cargo Only sundry booking type used.
					branchComm.put("applicalbeOnBranchId", prevWayBill.getDestinationBranchId());
					branchComm.put("wayBillTypeId", prevWayBill.getWayBillTypeId());
					branchComm.put("discount", prevWayBill.getBookingDiscount());
					branchComm.put("chargeSumBooking", prevWayBill.getBookingChargesSum());
					branchComm.put("chargeSumDelivery", prevWayBill.getDeliveryChargesSum());
					branchComm.put("actualWeight", conSum.getActualWeight());
					branchComm.put("chargeWeight", conSum.getChargeWeight());
					branchComm.put("consignmentDetails", consignmentDetails);
					branchComm.put("wayBillBookingCharges", wayBillBkgChargeArray);
					branchComm.put("vehicleTypeId", wayBill.getVehicleTypeId());
					branchComm.put(ConsignmentSummary.CONSIGNMENT_SUMMARY, conSum);
					branchComm.put("grandTotal", prevWayBill.getGrandTotal());
					branchComm.put("serviceTax", prevWayBill.getBookingTimeServiceTax() + prevWayBill.getDeliveryTimeServiceTax());
					branchComm.put("branchObj", sourceBranch);

					final var	branchCommOut 	= branchCommissionBLL.getBranchCommission(branchComm);
					branchCommOut.put(Constant.ACCOUNT_GROUP_ID, prevWayBill.getAccountGroupId());
					branchCommOut.put(Constant.WAYBILL_ID, prevWayBill.getWayBillId());
					branchCommOut.put("txnTypeId", BranchCommission.TXN_TYPE_BOOKING_ID);

					final var	wayBillCommissionTxn = DataCreatorForBookingWayBillBllImpl.getInstance().createModelForBranchCommission(branchCommOut);

					if(wayBillCommissionTxn != null){
						wayBill.setBookingCommission(wayBillCommissionTxn.getCommission());
						wayBillCommissionTxnList.add(wayBillCommissionTxn);
					}

					if(isLrCost && bookingCommisisonCost && wayBillCommissionTxn != null){
						final var	lrCostObj = new ValueObject();
						lrCostObj.put("costTypeId", CostType.COST_TYPE_BOOKING_COMMISSION_ID);
						lrCostObj.put("txnTypeId",LRCost.TXN_TYPE_BOOKING_COMMISSION_ID);
						lrCostObj.put("amount",wayBillCommissionTxn.getCommission());
						lrCostObj.put("creationDateTime", prevWayBill.getBookingDateTime());
						lrCostObj.put("wayBillId", prevWayBill.getWayBillId());
						lrCostObj.put("txnId", prevWayBill.getWayBillId());

						final var	lrCost = lrCostBLL.getLRCostDTO(lrCostObj);

						if(lrCost.getAmount() > 0)
							lrCostList.add(lrCost);
						else
							deleteLRCostList.add(lrCost);
					}

					if(isAllowCashStatement && bookingCommisisonDebitEffect){
						final var	commissionDebitObj = new ValueObject();

						commissionDebitObj.put("wayBillId", prevWayBill.getWayBillId());
						commissionDebitObj.put("wayBillCommissionTxn", wayBillCommissionTxn);
						commissionDebitObj.put("accountGroupId", prevWayBill.getAccountGroupId());
						commissionDebitObj.put("txnAccountGroupId", prevWayBill.getBookedForAccountGroupId());
						commissionDebitObj.put("txnDateTime", prevWayBill.getBookingDateTime());
						commissionDebitObj.put("branchId", prevWayBill.getBookingBranchId());

						final var	cashStatementBLL = new CashStatementBLL();

						final var	cashStatementTxnDebit = cashStatementBLL.getCashStatementForBookingCommissionDebitEffect(commissionDebitObj);

						cashStatementTxnAdd 	= new ArrayList<>();
						final var	cashStatementTxnUpdate = new ArrayList<CashStatementTxn>();

						if(cashStatementTxnDebit.isInsertFlag())
							cashStatementTxnAdd.add(cashStatementTxnDebit);

						if(cashStatementTxnDebit.isUpdateFlag())
							cashStatementTxnUpdate.add(cashStatementTxnDebit);

						if(cashStatementTxnAdd.size() > 0){
							cashStatementTxnAddArray = new CashStatementTxn[cashStatementTxnAdd.size()];
							cashStatementTxnAdd.toArray(cashStatementTxnAddArray);
						}

						if(cashStatementTxnUpdate.size() > 0){
							cashStatementTxnUpdateArray = new CashStatementTxn[cashStatementTxnUpdate.size()];
							cashStatementTxnUpdate.toArray(cashStatementTxnUpdateArray);
						}
					}

					wbColl.put(wayBill.getWayBillId(), wayBill);
				}
			}


			final var	wayBills = new WayBill[wbColl.size()];
			wbColl.values().toArray(wayBills);

			if(lrCostList != null && lrCostList.size() > 0){
				lrCostArray = new LRCost[lrCostList.size()];
				lrCostList.toArray(lrCostArray);
			}

			final var	inValueObj = new ValueObject();

			inValueObj.put("wayBills", wayBills);
			inValueObj.put("wayBillCommissionTxnList", wayBillCommissionTxnList);
			inValueObj.put("lrCostArray", lrCostArray);
			inValueObj.put("cashStatementTxnAdd", cashStatementTxnAdd);
			inValueObj.put("cashStatementTxnUpdateArray", cashStatementTxnUpdateArray);
			inValueObj.put("deleteLRCostList", deleteLRCostList);
			inValueObj.put("insertLrCostWithZero", insertLrCostWithZero);

			final var	wayBillBll = new WayBillBll();

			final var	success = wayBillBll.updateVehicleType(inValueObj);

			if(success == 1) {
				if(lsNumber != null && !"".equals(lsNumber))
					request.setAttribute("nextPageToken", "success_ChangeVehicleType");
				else
					request.setAttribute("nextPageToken", "success");

				request.setAttribute("updateSuccessfully", true);
			} else {
				error.put("errorCode", CargoErrorList.SYSTEM_ERROR);
				error.put("errorDescription", CargoErrorList.SYSTEM_ERROR_DESCRIPTION);
				request.setAttribute("ErrorMsg", "No Data Found To Update Vehicle Type");
				request.setAttribute("isErrorMsg", true);
				request.setAttribute("cargoError", error);
				request.setAttribute("nextPageToken", "failure");
			}

		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}
}
