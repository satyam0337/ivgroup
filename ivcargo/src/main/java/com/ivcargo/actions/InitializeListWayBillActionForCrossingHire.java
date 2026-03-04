package com.ivcargo.actions;
//~--- non-JDK imports --------------------------------------------------------

import java.util.Date;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.dao.impl.crossingagent.CrossingAgentMasterDaoImpl;
import com.iv.dto.constant.FeildPermissionsConstant;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.ConsignmentSummaryDao;
import com.platform.dao.DispatchLedgerDao;
import com.platform.dao.WayBillCrossingDao;
import com.platform.dao.WayBillDao;
import com.platform.dto.Branch;
import com.platform.dto.DispatchLedger;
import com.platform.dto.WayBill;
import com.platform.dto.WayBillCrossing;
import com.platform.dto.configuration.modules.LsConfigurationDTO;
import com.platform.dto.constant.WayBillTypeConstant;
import com.platform.dto.model.WayBillForCrossingHire;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

public class InitializeListWayBillActionForCrossingHire implements Action {

	public static final String 					TRACE_ID 				= "InitializeListWayBillActionForCrossingHire";

	@Override
	@SuppressWarnings("unchecked")
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {

		HashMap<String,Object>	 error 					= null;
		WayBillForCrossingHire[]	wayBillCrossingHire	= null;
		short						status				= 0;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	cacheManip		= new CacheManip(request);
			final var	executive 		= cacheManip.getExecutive(request);
			final var	configuration	= cacheManip.getLsConfiguration(request, executive.getAccountGroupId());
			final var branches	= cacheManip.getGenericBranchesDetail(request);
			final HashMap<?, ?>	execFldPermissions	= cacheManip.getExecutiveFieldPermission(request);

			final var	isEditDoorDeliveryAllow			 = configuration.getString(LsConfigurationDTO.IS_EDIT_DOORDELIVERY_ALLOW, "false");
			final var	typeOfEditCrossingHireAllow		 = configuration.getString(LsConfigurationDTO.TYPE_OF_EDIT_CROSSING_HIRE_ALLOW, "1,3");
			final var	displayCrossingMemoConfigurationDataUpdatePanel	= configuration.getBoolean(LsConfigurationDTO.DISPLAY_CROSSING_MEMO_CONFIGURATION_DATA_UPDATE_PANEL,true);
			final var	editcrossinghirecolumnshow		 = configuration.getBoolean(LsConfigurationDTO.EDIT_CROSSING_HIRE_COLUMN_SHOW,false);
			final var	showConsignorNameAndNoOfArticles = configuration.getBoolean(LsConfigurationDTO.SHOW_CONSIGNOR_NAME_AND_NO_OF_ARTICLES,false);
			final var	showHamaliColumn 				 = configuration.getBoolean(LsConfigurationDTO.SHOW_HAMALI_COLUMN,false);
			final var	editCrossingAgentNameOnDeliveryType	= configuration.getBoolean(LsConfigurationDTO.EDIT_CROSSING_AGENT_NAME_ON_DELIVERY_TYPE,false);

			request.setAttribute("isEditDoorDeliveryAllow", isEditDoorDeliveryAllow);
			request.setAttribute(LsConfigurationDTO.DISPLAY_CROSSING_MEMO_CONFIGURATION_DATA_UPDATE_PANEL, displayCrossingMemoConfigurationDataUpdatePanel);
			request.setAttribute(LsConfigurationDTO.EDIT_CROSSING_HIRE_COLUMN_SHOW, editcrossinghirecolumnshow);
			request.setAttribute(LsConfigurationDTO.SHOW_CONSIGNOR_NAME_AND_NO_OF_ARTICLES, showConsignorNameAndNoOfArticles);
			request.setAttribute(LsConfigurationDTO.SHOW_HAMALI_COLUMN, showHamaliColumn);
			request.setAttribute("editCrossingAgentName", editCrossingAgentNameOnDeliveryType && execFldPermissions != null && execFldPermissions.get(FeildPermissionsConstant.EDIT_CROSSING_AGENT_NAME) != null);

			var	dispatchLedgerId = JSPUtility.GetLong(request, "dispatchLedgerId", 0);

			if(dispatchLedgerId == 0)
				dispatchLedgerId = JSPUtility.GetLong(request, "editDispatchLedgerId",0);

			if(request.getParameter("lsNumber") != null ||request.getParameter("dispatchLedgerId")!= null || request.getParameter("editDispatchLedgerId")!= null) {
				final var	lsNumber	= JSPUtility.GetString(request, "lsNumber", null);

				final var	dispatchReportArr = DispatchLedgerDao.getInstance().getLSForChargeConfigArr(lsNumber, executive.getAccountGroupId(),dispatchLedgerId,typeOfEditCrossingHireAllow);

				if(dispatchReportArr != null && dispatchReportArr.length == 1) {
					if(dispatchReportArr[0].getDispatchTxnTypeId()== WayBillCrossing.TRANSACTION_TYPE_BOOKING_CROSSING) {
						if(dispatchReportArr[0].getCrossingAgentBillId() > 0) {
							error.put("errorCode", CargoErrorList.CROSSING_AGENT_INVOICE_ALREADY_CREATED);
							error.put("errorDescription", CargoErrorList.CROSSING_AGENT_INVOICE_ALREADY_CREATED_DESCRIPTION);
							request.setAttribute("AgntBillCreated", error);
						} else
							response.sendRedirect("Dispatch.do?pageId=340&eventId=1&modulename=editcrossinghire&masterid="+dispatchReportArr[0].getDispatchLedgerId());
					} else {
						final Date	date 		    = dispatchReportArr[0].getTripDateTime();
						final var	crossingReport  = WayBillCrossingDao.getInstance().getWayBillCrossingDetailsForCrossingHire(dispatchReportArr[0].getDispatchLedgerId());

						if(dispatchReportArr[0].getCrossingAgentId() > 0) {
							final var	crossingAgentMaster = CrossingAgentMasterDaoImpl.getInstance().getCrossingAgentDetailsById(dispatchReportArr[0].getCrossingAgentId());

							if(crossingAgentMaster != null)
								dispatchReportArr[0].setCrossingAgent(crossingAgentMaster.getName());
						}

						if(crossingReport != null) {
							final var	txnTypeId		= dispatchReportArr[0].getDispatchTxnTypeId();

							if(crossingReport.get("wayBillCrossingArr") != null && crossingReport.get("WayBillIdArray") != null) {
								final var	wayBillCrossing		= (WayBillCrossing[]) crossingReport.get("wayBillCrossingArr");
								final var	wayBillIdArray		= (Long[]) crossingReport.get("WayBillIdArray");
								final var	wayBillIdStr		= Utility.GetLongArrayToString(wayBillIdArray);

								if(wayBillIdStr != null) {
									final var	waybillDetails = WayBillDao.getInstance().getWayBillDetails(wayBillIdStr);
									final var	wayBillHM      = (HashMap<Long, WayBill>) waybillDetails.get("WayBillHM");
									final var	conSumHM	   = ConsignmentSummaryDao.getInstance().getConsignmentSummaryWeightsByWayBillIds(wayBillIdStr);

									wayBillCrossingHire = new WayBillForCrossingHire[wayBillCrossing.length];

									for(var i=0;i<wayBillCrossing.length;i++){
										wayBillCrossingHire[i] = new WayBillForCrossingHire();
										wayBillCrossingHire[i].setDispatchLedgerId(wayBillCrossing[i].getDispatchLedgerId());

										var	branch	= (Branch) branches.get(wayBillCrossing[i].getSourceBranchId() + "");

										wayBillCrossingHire[i].setSourceBranch(branch.getName());

										branch	= (Branch) branches.get(wayBillCrossing[i].getDestinationBranchId() + "");

										wayBillCrossingHire[i].setDestinationBranch(branch.getName());

										branch	= (Branch) branches.get(wayBillCrossing[i].getCrossingBranchId() + "");

										wayBillCrossingHire[i].setCrossingSourceBranch(branch.getName());

										wayBillCrossingHire[i].setCrossingAmountHire(wayBillCrossing[i].getCrossingHire());
										wayBillCrossingHire[i].setCreationDateTimeStamp(wayBillCrossing[i].getCreationDateTime());

										branch	= (Branch) branches.get(wayBillCrossing[i].getCrossingDestBranchId() + "");

										wayBillCrossingHire[i].setCrossingDestinationBranch(branch.getName());

										wayBillCrossingHire[i].setCrossingWayBillNo(wayBillCrossing[i].getCrossingWayBillNo());
										wayBillCrossingHire[i].setLocalTempoBhada(wayBillCrossing[i].getLocalTempoBhada());
										wayBillCrossingHire[i].setDoorDelivery(wayBillCrossing[i].getDoorDelivery());

										final var	wayBill = wayBillHM.get(wayBillCrossing[i].getWayBillId());
										final var	summary = conSumHM.get(wayBillCrossing[i].getWayBillId());

										wayBillCrossingHire[i].setWayBillType(WayBillTypeConstant.getWayBillTypeNameByWayBilTypeId(wayBill.getWayBillTypeId()));
										wayBillCrossingHire[i].setWayBillNumber(wayBill.getWayBillNumber());
										wayBillCrossingHire[i].setGrandTotal(wayBill.getGrandTotal());
										wayBillCrossingHire[i].setWayBillId(wayBillCrossing[i].getWayBillId());
										wayBillCrossingHire[i].setBillStatusValue(wayBillCrossing[i].getBillStatus());
										wayBillCrossingHire[i].setNoOfPackages(summary.getQuantity());
										wayBillCrossingHire[i].setActualWeight(summary.getActualWeight());
										wayBillCrossingHire[i].setBookingTotal(wayBill.getBookingTotal());
										wayBillCrossingHire[i].setDeliveryTotal(wayBill.getDeliveryTotal());
										wayBillCrossingHire[i].setConsignorName(wayBillCrossing[i].getConsignorName());
										wayBillCrossingHire[i].setHamali(wayBillCrossing[i].getHamali());
										wayBillCrossingHire[i].setWayBillCrossingAgentId(wayBillCrossing[i].getWayBillCrossingAgentId());
										wayBillCrossingHire[i].setWayBillCrossingAgentName(wayBillCrossing[i].getWayBillCrossingAgentName());

										if(wayBillCrossing[i].getBillStatus() ==  WayBillCrossing.CROSSINGAGENTBILL_STATUS_BILLED_ID)
											status++;
									}
								}

								request.setAttribute("status", status);
								request.setAttribute("lsNumber",  dispatchReportArr[0].getLsNumber());
								request.setAttribute("date", date);
								request.setAttribute("dispatchLedgerId", dispatchReportArr[0].getDispatchLedgerId());
								request.setAttribute("wayBillViewList", wayBillCrossingHire);
								request.setAttribute("dispatchReport", dispatchReportArr[0]);
								request.setAttribute("isSingleLs", true);
								request.setAttribute("txnTypeId", txnTypeId);
							}
						}else{
							error.put("errorCode", CargoErrorList.LS_NOT_FOUND);
							error.put("errorDescription", CargoErrorList.LS_NOT_FOUND_DESCRIPTION);
							request.setAttribute("cargoError", error);
						}
					}
				} else if(dispatchReportArr != null && dispatchReportArr.length > 1){
					request.setAttribute("isSingleLs", false);

					for (final DispatchLedger element : dispatchReportArr) {
						var	branch		= (Branch) branches.get(element.getSourceBranchId() + "");
						element.setSourceBranch(branch.getName());

						branch		= (Branch) branches.get(element.getDestinationBranchId() + "");
						element.setDestinationBranch(branch.getName());
					}

					request.setAttribute("dispatchReportArr", dispatchReportArr);
				} else {
					error.put("errorCode", CargoErrorList.LS_NOT_FOUND);
					error.put("errorDescription", CargoErrorList.LS_NOT_FOUND_DESCRIPTION);
					request.setAttribute("cargoError", error);
				}
			}

			request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}
	}
}
