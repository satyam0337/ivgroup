package com.ivcargo.actions.transport;

//~--- non-JDK imports --------------------------------------------------------

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.DispatchBLL;
import com.businesslogic.waybill.FormTypesBLL;
import com.framework.Action;
import com.iv.constant.properties.LrViewConfigurationPropertiesConstant;
import com.iv.constant.properties.lhpv.LHPVPropertiesConstant;
import com.iv.dto.LhpvSettlementCharges;
import com.iv.dto.constant.BookingTypeConstant;
import com.iv.dto.constant.InfoForDeliveryConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.dto.constant.TransportationModeConstant;
import com.iv.dto.constant.WayBillTypeConstant;
import com.iv.utils.constant.PodWayBillPropertiesConstant;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.ConsignmentSummaryDao;
import com.platform.dao.DispatchArticleDetailsDao;
import com.platform.dao.DispatchLedgerDao;
import com.platform.dao.DispatchSummaryDao;
import com.platform.dao.GodownUnloadDetailsDao;
import com.platform.dao.LHPVDao;
import com.platform.dao.WayBillHistoryDao;
import com.platform.dto.ConfigParam;
import com.platform.dto.ConsignmentSummary;
import com.platform.dto.DispatchArticleDetails;
import com.platform.dto.EditLogs;
import com.platform.dto.Executive;
import com.platform.dto.GodownUnloadDetails;
import com.platform.dto.LHPV;
import com.platform.dto.TransportCommonMaster;
import com.platform.dto.TransportationModeEditLogs;
import com.platform.dto.WayBill;
import com.platform.dto.WayBillHistory;
import com.platform.dto.configuration.modules.CashStatementConfigurationDTO;
import com.platform.dto.configuration.modules.DashBoardConfigurationDTO;
import com.platform.dto.configuration.modules.GroupConfigurationPropertiesDTO;
import com.platform.dto.configuration.modules.LrCostConfigurationDTO;
import com.platform.dto.configuration.modules.LsConfigurationDTO;
import com.platform.dto.model.WayBillReceivableModel;
import com.platform.utils.PropertiesUtility;
import com.platform.utils.Utility;

public class EditLSAction implements Action {

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {

		HashMap<String,Object>	 					error 							= null;
		ValueObject									inValObj						= null;
		List<WayBillReceivableModel>				wayBillModels					= null;
		LHPV										lhpv							= null;
		ArrayList<WayBillReceivableModel>			wbModelsForDelete				= null;
		WayBillHistory								wayBillPrevHistory				= null;
		ArrayList<WayBillHistory>					wbhColl							= null;
		WayBill[]									wayBills						= null;
		ArrayList<Long>								wbhIdsForDelete					= null;
		GodownUnloadDetails							unloadDetails					= null;
		List<GodownUnloadDetails>					unloadDetailsColl				= null;
		Timestamp 									transactionDate					= null;
		Executive 									executive						= null;
		String										latestWayBillIdsStr 			= null;
		Long[]										latestWayBillIdArray			= null;
		ArrayList<Long>								latestWayBillIdList				= null;
		HashMap<Long, WayBill>						wayBillHM						= null;
		WayBill										waybill							= null;
		CacheManip 									cache 							= null;
		final List<LhpvSettlementCharges>					lhpvSettlmntArr					= null;
		ValueObject									outObj							= null;
		HashMap<Long, WayBill>						wayBillHMForUpdate				= null;
		HashMap<Long, DispatchArticleDetails[]>		dispatchArticlDetailsArrayHM  	= null;
		DispatchArticleDetails[]					dispatchArticleDetailsArray		= null;
		String										lsIds							= null;
		FormTypesBLL								formTypesBLL					= null;
		HashMap<Long, ArrayList<Short>> 			formTypeIdsHM					= null;
		var						  				isArrivalTruckDetailReport 		= false;
		var										isPendingDeliveryTableEntry		= false;
		var										isUpdateReceiveStatus			= false;
		var										isSuccess						= false;
		var										totalActWghtToLess				= 0.00;
		var										totalCharWghtToLess				= 0.00;
		var										totalWaybillsTRemove			= 0L;
		var										totalNoOfPkgsToLess				= 0;
		var										totalCrossingArtToless			= 0L;
		final var										totalAmtToLess					= 0.00;
		var										dispatchLedgerId				= 0L;
		var										dispatchedQuantity				= 0L;
		var										topayLrGrandTotal				= 0.00;
		var 										countRoadNormal		 			= 0;
		var 										countRoadExpress 				= 0;
		var 										countRoadQuicker				= 0;
		var											countRail 						= 0;
		var 										countAir 		 				= 0;
		short   									lsTransportationModeId			= 0;
		short   									previousTransportationModeId	= 0;
		ValueObject 								lsConfiguration 				= null;
		var										transportModeForSearch			= false;
		ArrayList<Long> 							transportList					= null;
		List<WayBillReceivableModel>				tranceWbForUpdate				= null;

		try {

			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			inValObj		 	= new ValueObject();
			formTypesBLL		= new FormTypesBLL();
			cache							= new CacheManip(request);
			transactionDate 				= new Timestamp(new Date().getTime());

			dispatchLedgerId 	= Long.parseLong(request.getParameter("dispatchLedgerId"));
			executive			= (Executive) request.getSession().getAttribute("executive");
			transportList			= cache.getTransportList(request);

			inValObj.put("dispatchLedgerId", dispatchLedgerId);
			inValObj.put("accountGroupId", executive.getAccountGroupId());

			wayBillModels					= DispatchSummaryDao.getInstance().getReceivablesWaybillDetailsByDispatchLedgerForTansport(dispatchLedgerId, executive.getAccountGroupId());
			wayBillHM	    				= DispatchSummaryDao.getInstance().getWayBillDetailsByDispatchLdgrId(dispatchLedgerId);
			dispatchArticlDetailsArrayHM 	= DispatchArticleDetailsDao.getInstance().getDispatchArticleDetailsByDispatchLegerId(dispatchLedgerId);
			lsConfiguration 				= cache.getLsConfiguration(request, executive.getAccountGroupId());
			transportModeForSearch			= PropertiesUtility.isAllow(lsConfiguration.getString(LsConfigurationDTO.TRANSPORT_MODE_FOR_SEARCH,"false"));

			isArrivalTruckDetailReport 	= cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_ARRIVAL_TRUCK_DETAILS_REPORT) == ConfigParam.CONFIG_KEY_CONFIG_KEY_ARRIVAL_TRUCK_DETAILS_REPORT_ALLOWED;
			isPendingDeliveryTableEntry = cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_PENDING_DELIVERY_STOCK_TABLE_ENTRY) == ConfigParam.CONFIG_KEY_PENDING_DELIVERY_STOCK_TABLE_ENTRY_ALLOWED;

			if(wayBillModels != null && !wayBillModels.isEmpty()) {
				final var	prevWayBillIds	= wayBillModels.stream().distinct().map(w -> w.getWayBillId() + "").collect(Collectors.joining(","));
				final var	dispatchLedger	= DispatchLedgerDao.getInstance().retriveValueForReceivedLedger(dispatchLedgerId);

				if(dispatchLedger != null)
					previousTransportationModeId	= dispatchLedger.getTransportModeMasterId();

				final var	lrIdsList		= new ArrayList<Long>();
				final var	gudIdsList		= new ArrayList<Long>();
				final var	dispatchLedgerClone = dispatchLedger.clone();

				if(dispatchLedger != null) {
					if(dispatchLedger.getLhpvId() > 0) {
						lhpv   = LHPVDao.getInstance().getLHPVDetails(dispatchLedger.getLhpvId());
						outObj = DispatchLedgerDao.getInstance().getLSDetailsByLHPVId(dispatchLedger.getLhpvId());
						lsIds  = outObj.getString("lsIds",null);
					}

					wbhColl 		  	= new ArrayList<>();
					wbModelsForDelete 	= new ArrayList<>();
					tranceWbForUpdate	= new ArrayList<>();
					unloadDetailsColl 	= new ArrayList<>();
					latestWayBillIdList = new ArrayList<>();
					formTypeIdsHM		= formTypesBLL.getFormTypesIds(prevWayBillIds);

					for(final WayBillReceivableModel waReceivableModel : wayBillModels) {
						dispatchArticleDetailsArray = dispatchArticlDetailsArrayHM.get(waReceivableModel.getWayBillId());
						dispatchedQuantity 			= Arrays.asList(dispatchArticleDetailsArray).stream().map(DispatchArticleDetails::getQuantity).mapToLong(Long::longValue).sum();

						waReceivableModel.setDispatchedQuantity((int) dispatchedQuantity);

						if(formTypeIdsHM != null)
							waReceivableModel.setFormTypeIds(formTypeIdsHM.get(waReceivableModel.getWayBillId()));

						if(request.getParameter("lrNo_" + waReceivableModel.getWayBillId()) != null) {
							wbModelsForDelete.add(waReceivableModel);
							lrIdsList.add(waReceivableModel.getWayBillId());

							if(waReceivableModel.getIsTceBooking())
								tranceWbForUpdate.add(waReceivableModel);

							System.out.println("tranceWbForDelete :: "+tranceWbForUpdate);

							wayBillPrevHistory = WayBillHistoryDao.getInstance().getLastRecordOfWBH(waReceivableModel.getWayBillId());
							wbhColl.add(wayBillPrevHistory);

							unloadDetails = GodownUnloadDetailsDao.getInstance().getLastRecordOfGUD(waReceivableModel.getWayBillId());

							if(unloadDetails != null)
								unloadDetailsColl.add(unloadDetails);
						}

						if(request.getParameter("lrNo_" + waReceivableModel.getWayBillId()) == null)
							latestWayBillIdList.add(waReceivableModel.getWayBillId());
					}

					latestWayBillIdArray = new Long[latestWayBillIdList.size()];
					latestWayBillIdList.toArray(latestWayBillIdArray);
					latestWayBillIdsStr = Utility.GetLongArrayToString(latestWayBillIdArray);

					//Code for adding booking type and Transport Mode Update
					if (latestWayBillIdsStr != null && latestWayBillIdsStr.length() > 0) {
						HashMap<Long, ConsignmentSummary> conSumHM;
						ConsignmentSummary				  conSum		= null;
						short							  bookingTypeId	= 0;
						var isSundry 	= false;
						var isFTL 		= false;
						var isDDDV 		= false;

						conSumHM = ConsignmentSummaryDao.getInstance().getLimitedConsignmentDetails(latestWayBillIdsStr);

						for(final Map.Entry<Long, ConsignmentSummary> entry : conSumHM.entrySet()) {
							conSum = entry.getValue();

							if(transportModeForSearch)
								if(conSum.getTransportationModeId() == TransportationModeConstant.TRANSPORTATION_MODE_ROAD_ID)
									countRoadNormal++;
								else if(conSum.getTransportationModeId() == TransportationModeConstant.TRANSPORTATION_MODE_AIR_ID)
									countAir++;
								else if(conSum.getTransportationModeId() == TransportationModeConstant.TRANSPORTATION_MODE_RAIL_ID)
									countRail++;
								else if(conSum.getTransportationModeId() == TransportationModeConstant.TRANSPORTATION_MODE_ROAD_EXPRESS_ID)
									countRoadExpress++;
								else if(conSum.getTransportationModeId() == TransportationModeConstant.TRANSPORTATION_MODE_ROAD_QUICKER_ID)
									countRoadQuicker++;

							if(conSum.getBookingTypeId() == BookingTypeConstant.BOOKING_TYPE_SUNDRY_ID && !isSundry) {

								isSundry = true;
								bookingTypeId = BookingTypeConstant.BOOKING_TYPE_SUNDRY_ID;

								if(isFTL)
									bookingTypeId = BookingTypeConstant.SUNDRY_FTL_ID;

								if(isDDDV)
									bookingTypeId = BookingTypeConstant.SUNDRY_DDDV_ID;

								if(isDDDV && isFTL){
									bookingTypeId = BookingTypeConstant.SUNDRY_FTL_DDDV_ID;
									break;
								}

							} else if(conSum.getBookingTypeId() == BookingTypeConstant.BOOKING_TYPE_FTL_ID && !isFTL) {

								isFTL = true;
								bookingTypeId = BookingTypeConstant.BOOKING_TYPE_FTL_ID;

								if(isSundry)
									bookingTypeId = BookingTypeConstant.SUNDRY_FTL_ID;
								if(isDDDV)
									bookingTypeId = BookingTypeConstant.FTL_DDDV_ID;
								if(isDDDV && isSundry){
									bookingTypeId = BookingTypeConstant.SUNDRY_FTL_DDDV_ID;
									break;
								}

							} else if(conSum.getBookingTypeId() == BookingTypeConstant.DIRECT_DELIVERY_DIRECT_VASULI_ID && !isDDDV) {

								isDDDV = true;

								if(isDDDV)
									bookingTypeId = BookingTypeConstant.DIRECT_DELIVERY_DIRECT_VASULI_ID;

								if(isSundry)
									bookingTypeId = BookingTypeConstant.SUNDRY_DDDV_ID;

								if(isFTL)
									bookingTypeId = BookingTypeConstant.FTL_DDDV_ID;

								if(isSundry && isFTL){
									bookingTypeId = BookingTypeConstant.SUNDRY_FTL_DDDV_ID;
									break;
								}
							}
						}

						DispatchLedgerDao.getInstance().updateBookingTypeIdForLS(bookingTypeId,dispatchLedgerId);

						if(transportModeForSearch)
							if(countRoadNormal == conSumHM.size())
								lsTransportationModeId = TransportationModeConstant.TRANSPORTATION_MODE_ROAD_ID;
							else if(countRail == conSumHM.size())
								lsTransportationModeId = TransportationModeConstant.TRANSPORTATION_MODE_RAIL_ID;
							else if(countAir == conSumHM.size())
								lsTransportationModeId = TransportationModeConstant.TRANSPORTATION_MODE_AIR_ID;
							else if(countRoadExpress == conSumHM.size())
								lsTransportationModeId = TransportationModeConstant.TRANSPORTATION_MODE_ROAD_EXPRESS_ID;
							else if(countRoadQuicker == conSumHM.size())
								lsTransportationModeId = TransportationModeConstant.TRANSPORTATION_MODE_ROAD_QUICKER_ID;
							else if(countAir <= 0 && countRail <= 0)
								lsTransportationModeId = TransportationModeConstant.TRANSPORTATION_MODE_ROAD_MIXED_ID;
							else if((countAir > 0 || countRail > 0) && (countRoadNormal > 0 || countRoadExpress > 0 || countRoadQuicker > 0))
								lsTransportationModeId = TransportationModeConstant.TRANSPORTATION_MODE_MIXED_ID;
					}
					dispatchLedger.setTransportModeMasterId(lsTransportationModeId);

					if(dispatchLedger.getTransportModeMasterId() <= 0)
						dispatchLedger.setTransportModeMasterId(TransportationModeConstant.TRANSPORTATION_MODE_ROAD_ID);

					if(wayBillModels.size() == wbModelsForDelete.size())
						isUpdateReceiveStatus	= true;

					for (final WayBillReceivableModel model : wbModelsForDelete) {
						totalActWghtToLess 		+= model.getDispatchedWeight();
						totalWaybillsTRemove 	+= 1;
						totalNoOfPkgsToLess 	+= model.getDispatchedQuantity();
						totalCharWghtToLess		+= model.getChargeWeight();

						if(model.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY)
							topayLrGrandTotal	+= model.getGrandTotal();

						dispatchLedger.setTotalActualWeight(dispatchLedger.getTotalActualWeight() - model.getDispatchedWeight());
						dispatchLedger.setTotalNoOfPackages(dispatchLedger.getTotalNoOfPackages() - model.getDispatchedQuantity());
						dispatchLedger.setTotalNoOfWayBills(dispatchLedger.getTotalNoOfWayBills() - 1);

						if(dispatchLedger.getDestinationBranchId() == model.getDestinationBranchId()) {
							if(model.getDeliveryTo() == InfoForDeliveryConstant.DELIVERY_TO_DOOR_ID) {
								dispatchLedger.setTotalNoOfDoorDelivery(dispatchLedger.getTotalNoOfDoorDelivery() - 1);
								dispatchLedger.setTotalNoOfDoorDeliveryArticles(dispatchLedger.getTotalNoOfDoorDeliveryArticles() - model.getDispatchedQuantity());
							} else if(model.getDeliveryTo() == InfoForDeliveryConstant.DELIVERY_TO_BRANCH_ID)
								dispatchLedger.setTotalNoOfGodownArticles(dispatchLedger.getTotalNoOfGodownArticles() - model.getDispatchedQuantity());
						} else {
							totalCrossingArtToless	+=  model.getDispatchedQuantity();
							dispatchLedger.setTotalNoOfCrossingArticles(dispatchLedger.getTotalNoOfCrossingArticles() - model.getDispatchedQuantity());
						}

						if(model.getFormTypeIds() != null)
							dispatchLedger.setTotalNoOfForms(model.getFormTypeIds().size());
					}

					wbhIdsForDelete		= new ArrayList<>();
					wayBills 			= new WayBill[wbhColl.size()];
					wayBillHMForUpdate 	= new HashMap<>();

					for (var i = 0; i < wbhColl.size(); i++) {

						wayBillPrevHistory = wbhColl.get(i);
						wbhIdsForDelete.add(wayBillPrevHistory.getWayBillHistoryId());

						wayBills[i] = new WayBill();
						wayBills[i].setWayBillId(wayBillPrevHistory.getWayBillId());
						wayBills[i].setStatus(wayBillPrevHistory.getStatus());
						wayBills[i].setCreationDateTimeStamp(wayBillPrevHistory.getCreationDateTimeStamp());
						wayBills[i].setExecutiveId(wayBillPrevHistory.getExecutiveId());
						wayBills[i].setBranchId(wayBillPrevHistory.getBranchId());
						wayBills[i].setAgencyId(wayBillPrevHistory.getAgencyId());

						wayBillHMForUpdate.put(wayBills[i].getWayBillId(), wayBills[i]);
					}

					if(unloadDetailsColl != null && !unloadDetailsColl.isEmpty())
						for (final GodownUnloadDetails ud : unloadDetailsColl)
							gudIdsList.add(ud.getGodownUnloadDetailsId());

					if(lhpv != null) {
						lhpv.setTotalActualWeight(lhpv.getTotalActualWeight() - totalActWghtToLess);
						lhpv.setWeightDifference(lhpv.getVehicleCapacity() - lhpv.getTotalActualWeight());
						lhpv.setTotalAmount(lhpv.getTotalAmount()-totalAmtToLess);
						lhpv.setBalanceAmount(lhpv.getBalanceAmount()-totalAmtToLess);
					}

					inValObj.put("wayBills", wayBills);
					inValObj.put("wbModelsForDelete", wbModelsForDelete);
					inValObj.put("dispatchLedger", dispatchLedger);
					inValObj.put("lhpv", lhpv);
					inValObj.put("dispatchLedgerClone", dispatchLedgerClone);
					inValObj.put("wbhIdsForDelete", Utility.getStringFromArrayList(wbhIdsForDelete));
					inValObj.put("lrIdsForDelete", Utility.getStringFromArrayList(lrIdsList));
					inValObj.put("gudIdsForDelete", Utility.getStringFromArrayList(gudIdsList));
					inValObj.put("isArrivalTruckDetailReport", isArrivalTruckDetailReport);
					inValObj.put("executive", executive);
					inValObj.put("lhpvSettlmntArr", lhpvSettlmntArr);
					inValObj.put("isPendingDeliveryTableEntry", isPendingDeliveryTableEntry);
					inValObj.put("configValueForDelivery", cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_DELIVERY_ACCESSIBILITY));
					inValObj.put("deliveryLocationList", cache.getAssignedLocationsIdListByLocationIdId(request, dispatchLedger.getLsBranchId(), executive.getAccountGroupId()));
					inValObj.put("branchesColl", cache.getGenericBranchesDetail(request));
					inValObj.put("locationMapping", cache.getLocationMappingDetailsByAssignedLocationId(request,executive.getAccountGroupId(),dispatchLedgerClone.getDestinationBranchId()));
					inValObj.put("wayBillHMForUpdate", wayBillHMForUpdate);
					inValObj.put(LrCostConfigurationDTO.LR_COST_CONFIGURATION, cache.getGroupWiseLRCostConfiguration(request, executive.getAccountGroupId()));
					inValObj.put("lsIds",lsIds);
					inValObj.put("isUpdateReceiveStatus", isUpdateReceiveStatus);
					inValObj.put(PodWayBillPropertiesConstant.POD_CONFIGURATION, cache.getPODWayBillConfiguration(request, executive.getAccountGroupId()));
					inValObj.put(LHPVPropertiesConstant.LHPV_CONFIGURATION, cache.getLhpvConfiguration(request, executive.getAccountGroupId()));
					inValObj.put("topayLrGrandTotal",topayLrGrandTotal);
					inValObj.put(CashStatementConfigurationDTO.CASH_STATEMENT_CONFIGURATION, cache.getCashStatementConfiguration(request, executive.getAccountGroupId()));
					inValObj.put("totalWaybillsTRemove",totalWaybillsTRemove);
					inValObj.put("totalNoOfPkgsToLess",totalNoOfPkgsToLess);
					inValObj.put("totalActWghtToLess",totalActWghtToLess);
					inValObj.put("totalCharWghtToLess",totalCharWghtToLess);
					inValObj.put("totalCrossingArtToless",totalCrossingArtToless);
					inValObj.put(GroupConfigurationPropertiesDTO.GROUP_CONFIGURATION, cache.getGroupConfiguration(request, executive.getAccountGroupId()));
					inValObj.put(DashBoardConfigurationDTO.DASH_BOARD_CONFIGURATION, cache.getDashBoardConfiguration(request, executive.getAccountGroupId()));
					inValObj.put(LrViewConfigurationPropertiesConstant.LR_VIEW_CONFIGURATION_PROPERTY, cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.LR_SEARCH));
					inValObj.put("tranceWbForUpdate", tranceWbForUpdate);
					inValObj.put(LsConfigurationDTO.LS_CONFIGURATION, cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.DISPATCH));

					for(final Map.Entry<Long, WayBill> entry : wayBillHM.entrySet())
						waybill = entry.getValue();

					final var	editLog	= new EditLogs();

					editLog.setEditWaybillId(dispatchLedgerId);
					editLog.setExecutiveId(executive.getExecutiveId());
					editLog.setPreviousExecutiveId(waybill.getExecutiveId());
					editLog.setDescripstionData("WayBillIds :"+latestWayBillIdsStr);
					editLog.setPreviousDescripstionData("WayBillIds :"+prevWayBillIds);
					editLog.setCreationDate(transactionDate);
					editLog.setMarkForDelete(false);
					editLog.setDescripstionEditTypeId(EditLogs.Description_EditLs);
					editLog.setTypeWaybillTypeId(EditLogs.Type_LS);

					inValObj.put("editLog", editLog);

					if(transportModeForSearch) {
						final var	transportationModeEditLogs	= new TransportationModeEditLogs();

						transportationModeEditLogs.setAccountGroupId(executive.getAccountGroupId());
						transportationModeEditLogs.setId(dispatchLedgerId);
						transportationModeEditLogs.setPreviousTransportationModeId(previousTransportationModeId);
						transportationModeEditLogs.setUpdatedBy(executive.getExecutiveId());
						transportationModeEditLogs.setUpdationTimeStamp(transactionDate);
						transportationModeEditLogs.setModuleIdentifier(ModuleIdentifierConstant.DISPATCH);
						transportationModeEditLogs.setEditTypeId(TransportationModeEditLogs.REMOVE_LR_FROM_LS);

						inValObj.put("transportationModeEditLogs", transportationModeEditLogs);
					}

					isSuccess = DispatchBLL.getInstance().editLSDetails(inValObj);

					if(isSuccess) {
						request.setAttribute("number", dispatchLedger.getLsNumber());
						if(transportList.contains(executive.getAccountGroupId()))
							request.setAttribute("typeOfNumber", TransportCommonMaster.SEARCH_TYPE_ID_LS);//For LS Search : Transport
						else
							request.setAttribute("typeOfNumber", TransportCommonMaster.SEARCH_TYPE_ID_CARGO_LS);//For LS Search : cargo (ivcargo.com)
					}

					request.setAttribute("nextPageToken", "success");
				}
			}

		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}
	}
}
