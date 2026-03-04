package com.ivcargo.actions.transport;

//~--- non-JDK imports --------------------------------------------------------

import java.sql.Timestamp;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringUtils;

import com.businesslogic.DispatchBLL;
import com.businesslogic.PendingDispatchStockBLL;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.bll.impl.generateconsolidateewaybill.GenerateConsolidateEWayBillBllImpl;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.properties.constant.LoadingSheetPropertyConstant;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.constant.Constant;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.DuplicateTransactionCheckDao;
import com.platform.dao.LHPVSequenceCounterDao;
import com.platform.dao.LSSequenceCounterDao;
import com.platform.dto.Branch;
import com.platform.dto.DispatchLedger;
import com.platform.dto.ECargoConstantFile;
import com.platform.dto.Executive;
import com.platform.dto.LHPV;
import com.platform.dto.LHPVSequenceCounter;
import com.platform.dto.LSSequenceCounter;
import com.platform.dto.TransportCommonMaster;
import com.platform.dto.WayBillCrossing;
import com.platform.dto.configuration.modules.GroupConfigurationPropertiesDTO;
import com.platform.dto.configuration.modules.LsConfigurationDTO;
import com.platform.resource.CargoErrorList;

public class TransportManualDispatchWayBillAction implements Action {

	public static final String 	TRACE_ID  	= "TransportManualDispatchWayBillAction";
	Executive	executive 	= null;
	CacheManip 	cache 		= null;
	Timestamp 	createDate	= null;
	long 		srcCityId	= 0;
	long 		srcBranchId	= 0;

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {

		HashMap<String,Object>	 	error 					= null;
		Branch 				destBranch 				= null;
		DispatchBLL 		dispatchBLL 			= null;
		ValueObject    		inValObj            	= null;
		ValueObject    		outValObj           	= null;
		DispatchLedger 		dispatchLedger      	= null;
		String[]       		values              	= null;
		Long[]         		wayBillsForDispatch 	= null;
		StringBuilder 		wayBillIdsForDispatch 	= null;
		LHPV				lhpv 					= null;
		String 				status 					= null;
		LSSequenceCounter	lsSequenceCounter		= null;
		LHPVSequenceCounter	lhpvSequenceCounter		= null;
		WayBillCrossing  	wbc 					= null;
		var				manualLSNumber			= 0L;
		Branch				branchCity				= null;
		var				isNumberExits			= false;
		PendingDispatchStockBLL			pendingDispatchStockBLL				= null;
		ValueObject						inValueObject						= null;
		String							pdsBranchIds						= null;
		var 						isWayBillAllowForDispatch			= true;
		var							isRailwayBranch						= false;

		try {

			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			cache 		= new CacheManip(request);
			executive 		= (Executive) request.getSession().getAttribute("executive");
			manualLSNumber	= JSPUtility.GetLong(request, "manualLSNumber", 0);
			srcBranchId	= JSPUtility.GetLong(request, "executiveBranchId", 0);
			var 	crossingAgentId = 0L;
			var isCrossing		= false;
			createDate 	= DateTimeUtility.getCurrentTimeStamp();

			if(srcBranchId <= 0) {
				response.sendRedirect("SearchWayBill.do?pageId=0&eventId=1&filter=14");
				return;
			}
			final var	lsConfiguration	= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.DISPATCH);

			final var allowAutoGenerateConEWaybill	= (boolean) lsConfiguration.getOrDefault(LsConfigurationDTO.ALLOW_AUTO_GENERATE_CON_EWAYBILL, false);

			branchCity 			= cache.getGenericBranchDetailCache(request,srcBranchId);

			if((boolean) lsConfiguration.getOrDefault(LoadingSheetPropertyConstant.RAILWAY_BRANCH_WISE_DISPATCH, false))
				isRailwayBranch		= com.iv.utils.utility.Utility.isIdExistInLongList(lsConfiguration, LoadingSheetPropertyConstant.RAILWAY_BRANCH_IDS_FOR_DISPATCH, JSPUtility.GetLong(request, "VehicleDestinationBranchId"));

			if(allowAutoGenerateConEWaybill && !isRailwayBranch) {
				final var isVehicleAllowForConsolidatedEwayBill = GenerateConsolidateEWayBillBllImpl.getInstance().checkVehicleNumberForConsolidateEwayBill(JSPUtility.GetString(request, "vehicleNumber"), executive.getAccountGroupId());

				if(isVehicleAllowForConsolidatedEwayBill) {
					error.put(CargoErrorList.ERROR_CODE, CargoErrorList.CONSOLIDATE_EWAYBILL_VEHICLE_ERROR);
					error.put(CargoErrorList.ERROR_DESCRIPTION,CargoErrorList.CONSOLIDATE_EWAYBILL_VEHICLE_ERROR_DESCRIPTION);
					request.setAttribute("cargoError", error);
					request.setAttribute("nextPageToken", Constant.FAILURE);
					return;
				}
			}

			if(branchCity != null)
				srcCityId = branchCity.getCityId();
			//Create LS Number
			if(request.getParameter("isManualDispatch") != null) {
				if(manualLSNumber > 0) {
					lsSequenceCounter = new LSSequenceCounter();
					if(lsSequenceCounter != null)
						lsSequenceCounter.setNextVal(manualLSNumber);
				} else {
					error.put("errorCode", CargoErrorList.MANUAL_NUMBER_NOT_VALID_ERROR);
					error.put("errorDescription", CargoErrorList.MANUAL_NUMBER_NOT_VALID_ERROR_DESCRIPTION);
					request.setAttribute("cargoError", error);
					request.setAttribute("nextPageToken", "failure");
				}
			} else
				lsSequenceCounter = LSSequenceCounterDao.getInstance().getLSSequenceCounter(executive.getAccountGroupId(), executive.getBranchId());

			if(lsSequenceCounter != null) {

				if(request.getParameter("isManualDispatch") == null
						&& lsSequenceCounter.getNextVal() >= lsSequenceCounter.getMinRange()
						&& lsSequenceCounter.getNextVal() <= lsSequenceCounter.getMaxRange()
						|| request.getParameter("isManualDispatch") != null
						) {

					if(request.getParameter("isManualDispatch") != null)
						isNumberExits = DuplicateTransactionCheckDao.getInstance().checkDuplicateTxnForFinancialYearForLS(Long.toString(lsSequenceCounter.getNextVal()), 0, executive.getAccountGroupId(), (short)12,createDate, 0);
					else
						isNumberExits = DuplicateTransactionCheckDao.getInstance().checkDuplicateTxnForFinancialYearForLS(Long.toString(lsSequenceCounter.getNextVal()), 0, executive.getAccountGroupId(), (short)11,createDate,0);

					if(!isNumberExits) {

						destBranch	= cache.getGenericBranchDetailCache(request, JSPUtility.GetLong(request, "VehicleDestinationBranchId"));
						final var 	crossingWbsCol = new HashMap<Long,WayBillCrossing >();

						//destination branch must belong to destination city
						if(destBranch != null
								|| Short.parseShort(request.getParameter("isDDDV")) == TransportCommonMaster.DIRECT_DELIVERY_DIRECT_VASULI_ID){

							dispatchBLL 			= new DispatchBLL();
							inValObj            	= new ValueObject();
							dispatchLedger      	= populateDispatchLedger(request ,Long.toString(lsSequenceCounter.getNextVal()));
							values              	= request.getParameterValues("wayBills");
							pdsBranchIds 			= request.getParameter("pdsBranchIds");
							wayBillsForDispatch 	= new Long[values.length];
							wayBillIdsForDispatch 	= new StringBuilder();
							var netLoading 	= 0D;
							var netUnloading = 0D;
							var crossingHire = 0D;
							short	txnTypeId	= 0;

							for (var i = 0; i < values.length; i++) {
								wayBillsForDispatch[i] = Long.parseLong(values[i]);
								if (i != values.length-1)
									wayBillIdsForDispatch.append(Long.parseLong(values[i])+",");
								else
									wayBillIdsForDispatch.append(Long.parseLong(values[i]));
								if(executive.getAccountGroupId()== ECargoConstantFile.ACCOUNTGROUPID_LMT) {
									netLoading = JSPUtility.GetDouble(request, "netLoading_"+wayBillsForDispatch[i],0);
									netUnloading = JSPUtility.GetDouble(request, "netUnloading_"+wayBillsForDispatch[i],0);
									crossingHire = JSPUtility.GetDouble(request, "crossingHire_"+wayBillsForDispatch[i],0);

									if(JSPUtility.GetInt(request, "crossingField_"+wayBillsForDispatch[i], 0) > 0) {
										isCrossing = true;

										txnTypeId = WayBillCrossing.TRANSACTION_TYPE_DELIVERY_CROSSING;
									} else
										txnTypeId = WayBillCrossing.TRANSACTION_TYPE_BRANCH_TO_BRANCH_CROSSING;


									if(netLoading > 0 || netUnloading > 0 || crossingHire >0){
										wbc = new WayBillCrossing();
										wbc.setWayBillId(wayBillsForDispatch[i]);
										wbc.setAccountGroupId(executive.getAccountGroupId());
										crossingAgentId = JSPUtility.GetLong(request, "selectedCrossingAgentId");
										if(crossingAgentId > 0 )
											txnTypeId = WayBillCrossing.TRANSACTION_TYPE_DELIVERY_CROSSING;
										else
											txnTypeId = WayBillCrossing.TRANSACTION_TYPE_BRANCH_TO_BRANCH_CROSSING;
										wbc.setCrossingAgentId(crossingAgentId);
										wbc.setNetLoading(netLoading);
										wbc.setNetUnloading(netUnloading);
										wbc.setCrossingHire(crossingHire);
										wbc.setTxnTypeId(txnTypeId);

										crossingWbsCol.put(wayBillsForDispatch[i], wbc);
									}
								}
							}

							//Crossing related fields set
							dispatchLedger.setCrossing(isCrossing);
							dispatchLedger.setDispatchTxnTypeId(txnTypeId);
							dispatchLedger.setCrossingAgentId(crossingAgentId);

							pendingDispatchStockBLL = new PendingDispatchStockBLL();
							inValueObject 			= new ValueObject();

							inValueObject.put("wayBillIds", wayBillIdsForDispatch.toString());
							inValueObject.put("pdsBranchIds", pdsBranchIds);

							isWayBillAllowForDispatch  = pendingDispatchStockBLL.checkWayBillForDispatch(inValueObject);

							if (isWayBillAllowForDispatch) {

								short selectionOfLHPV = 0;
								inValObj.put("crossingWbs", crossingWbsCol);

								if(request.getParameter("selectionOfLHPV") != null)
									selectionOfLHPV = Short.parseShort(request.getParameter("selectionOfLHPV"));

								if(selectionOfLHPV == 1) { //Create
									//Create LHPV Number
									lhpvSequenceCounter = LHPVSequenceCounterDao.getInstance().getLHPVSequenceCounter(executive.getAccountGroupId(), executive.getBranchId());
									if(lhpvSequenceCounter == null || lhpvSequenceCounter.getNextVal() < lhpvSequenceCounter.getMinRange() || lhpvSequenceCounter.getNextVal() > lhpvSequenceCounter.getMaxRange()) {
										error.put("errorCode", CargoErrorList.LHPV_SEQUENCE_COUNTER_MISSING);
										error.put("errorDescription", CargoErrorList.LHPV_SEQUENCE_COUNTER_MISSING_DESCRIPTION);
										request.setAttribute("cargoError", error);
										request.setAttribute("nextPageToken", "failure");
										return;
									}
									lhpv = modelLHPVForCreate(request ,Long.toString(lhpvSequenceCounter.getNextVal()));
									dispatchLedger.setlHPVNumber(lhpv.getlHPVNumber());
									dispatchLedger.setlHPVBranchId(lhpv.getlHPVBranchId());
								} else if(selectionOfLHPV == 2)
									lhpv = modelLHPVForAppend(request);

								inValObj.put("dispatchLedger", dispatchLedger);
								inValObj.put("wayBillsForDispatch", wayBillsForDispatch);
								inValObj.put("executive", executive);
								inValObj.put("lhpv", lhpv);
								inValObj.put("executiveBranchId",srcBranchId);
								inValObj.put("branchColl", cache.getGenericBranchesDetail(request));
								inValObj.put("pdsBranchIds", pdsBranchIds);
								inValObj.put(LsConfigurationDTO.LS_CONFIGURATION, cache.getLsConfiguration(request, executive.getAccountGroupId()));
								inValObj.put(GroupConfigurationPropertiesDTO.GROUP_CONFIGURATION, cache.getGroupConfiguration(request, executive.getAccountGroupId()));

								outValObj = dispatchBLL.dispatchWayBills(inValObj);

								status = (String) outValObj.get("status");
								if ("success".equals(status)) {
									final long dispatchLedgerId = (Long) outValObj.get("dispatchLedgerId");

									response.sendRedirect("SearchWayBill.do?pageId=3&eventId=9&dispatchLedgerId="+dispatchLedgerId+"&Type=Dispatched&LSNo="+dispatchLedger.getLsNumber()+"&isCrossing="+dispatchLedger.isCrossing()+"&CrossingAgentId="+dispatchLedger.getCrossingAgentId());
									request.setAttribute("nextPageToken", "success");
									request.setAttribute("dispatchLedgerId", dispatchLedgerId);
								} else {
									error.put("errorCode", CargoErrorList.DISPATCH_ERROR);
									error.put("errorDescription", CargoErrorList.DISPATCH_ERROR_DESCRIPTION);
									request.setAttribute("cargoError", error);
									request.setAttribute("nextPageToken", "failure");
								}

							} else {
								error.put("errorCode", CargoErrorList.DUPLICATE_DISPATCH_ERROR);
								error.put("errorDescription", CargoErrorList.DUPLICATE_DISPATCH_ERROR_DESCRIPTION );
								request.setAttribute("cargoError", error);
								request.setAttribute("nextPageToken", "failure");
							}
						} else {
							error.put("errorCode", CargoErrorList.WRONG_BRANCHFORCITY_ERROR);
							error.put("errorDescription",CargoErrorList.WRONG_BRANCHFORCITY_ERROR_DESCRIPTION);
							request.setAttribute("cargoError", error);
							request.setAttribute("nextPageToken", "failure");
						}
					} else {
						error.put("errorCode", CargoErrorList.LS_DUPLICATE_NUMBER);
						error.put("errorDescription", CargoErrorList.LS_DUPLICATE_NUMBER_DESCRIPTION);
						request.setAttribute("cargoError", error);
						request.setAttribute("nextPageToken", "failure");
					}

				} else {
					error.put("errorCode", CargoErrorList.LS_SEQUENCE_COUNTER_OVER);
					error.put("errorDescription", CargoErrorList.LS_SEQUENCE_COUNTER_OVER_DESCRIPTION);
					request.setAttribute("cargoError", error);
					request.setAttribute("nextPageToken", "failure");
				}
			} else {
				error.put("errorCode", CargoErrorList.LS_SEQUENCE_COUNTER_MISSING);
				error.put("errorDescription", CargoErrorList.LS_SEQUENCE_COUNTER_MISSING_DESCRIPTION);
				request.setAttribute("cargoError", error);
				request.setAttribute("nextPageToken", "failure");
			}

		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}

	}

	private DispatchLedger populateDispatchLedger(final HttpServletRequest request ,final String lsNumber) throws Exception {
		DispatchLedger dispatchLedger = null;

		try {
			dispatchLedger 	= new DispatchLedger();

			dispatchLedger.setAccountGroupId(executive.getAccountGroupId());
			dispatchLedger.setCleanerName(StringUtils.upperCase(JSPUtility.GetString(request, "cleanerName")));
			dispatchLedger.setDestinationBranchId(JSPUtility.GetLong(request, "VehicleDestinationBranchId"));
			dispatchLedger.setMarkForDelete(false);
			dispatchLedger.setSourceBranchId(srcBranchId);

			dispatchLedger.setTripDateTime(createDate);
			dispatchLedger.setTripName("trip");
			dispatchLedger.setActualDispatchDateTime(createDate);
			dispatchLedger.setBranchTransfer(false);
			dispatchLedger.setSuperVisor(JSPUtility.GetString(request, "superVisor" ,""));
			dispatchLedger.setRemark(JSPUtility.GetString(request, "remark"));

			dispatchLedger.setVehicleNumber(StringUtils.upperCase(JSPUtility.GetString(request, "vehicleNumber")));
			dispatchLedger.setVehicleNumberMasterId(cache.getVehicleNumberIdByNumber(request, executive.getAccountGroupId(), JSPUtility.GetString(request, "vehicleNumber")));

			dispatchLedger.setDriverName(StringUtils.upperCase(JSPUtility.GetString(request, "driver1Name")));
			dispatchLedger.setDriverId(JSPUtility.GetLong(request ,"driver1Insert" , 0));
			dispatchLedger.setDriverLicenceNumber(StringUtils.upperCase(JSPUtility.GetString(request, "driver1", "")));

			dispatchLedger.setDriver2Name(StringUtils.upperCase(JSPUtility.GetString(request, "driver2Name")));
			dispatchLedger.setDriver2Id(JSPUtility.GetLong(request ,"driver2Insert", 0));
			dispatchLedger.setDriver2LicenceNumber(StringUtils.upperCase(JSPUtility.GetString(request, "driver2", "")));

			dispatchLedger.setVehicleAgentId(JSPUtility.GetLong(request, "vehicleAgent", 0));
			dispatchLedger.setVehicleAgentName(StringUtils.upperCase(JSPUtility.GetString(request, "manualAgentEntry", "")));

			dispatchLedger.setTotalActualWeight(JSPUtility.GetDouble(request, "totalActualWeight", 0.00));
			dispatchLedger.setTotalNoOfDoorDelivery(Integer.parseInt(request.getParameter("totalNoOfDoorDelivery")));
			dispatchLedger.setTotalNoOfGodownArticles(Integer.parseInt(request.getParameter("totalNoOfGodownArticles")));
			dispatchLedger.setTotalNoOfCrossingArticles(Integer.parseInt(request.getParameter("totalNoOfCrossingArticles")));
			dispatchLedger.setTotalNoOfDoorDeliveryArticles(Integer.parseInt(request.getParameter("totalNoOfDoorDeliveryArticles")));
			dispatchLedger.setTotalNoOfForms(Integer.parseInt(request.getParameter("totalNoOfForms")));
			dispatchLedger.setTotalNoOfPackages(Integer.parseInt(request.getParameter("totalNoOfPackages")));
			dispatchLedger.setTotalNoOfWayBills(Integer.parseInt(request.getParameter("totalNoOfWayBills")));

			dispatchLedger.setLsNumber(lsNumber);
			dispatchLedger.setLsBranchId(srcBranchId);

			dispatchLedger.setDriver1MobileNumber1(JSPUtility.GetString(request, "driver1MobileNumber1",null));
			dispatchLedger.setDriver1MobileNumber2(JSPUtility.GetString(request, "driver1MobileNumber2",null));
			dispatchLedger.setTypeOfLS(DispatchLedger.TYPE_OF_LS_ID_Inter_Branch);

			if(request.getParameter("isManualDispatch") != null)
				dispatchLedger.setManual(true);

			return dispatchLedger;

		} catch (final Exception e) {
			throw e;
		} finally {
			dispatchLedger = null;
		}
	}

	private LHPV modelLHPVForCreate(final HttpServletRequest request ,final String lHPVNumber) throws Exception {

		LHPV lhpv = null;

		try {

			lhpv = new LHPV();

			lhpv.setAccountGroupId(executive.getAccountGroupId());
			lhpv.setExecutiveId(executive.getExecutiveId());
			lhpv.setBranchId(executive.getBranchId());
			lhpv.setCreationDateTimeStamp(createDate);
			lhpv.setTotalAmount(JSPUtility.GetDouble(request, "totalAmount", 0.00));
			lhpv.setAdvanceAmount(JSPUtility.GetDouble(request, "advanceAmount", 0.00));
			lhpv.setBalanceAmount(JSPUtility.GetDouble(request, "balanceAmount", 0.00));
			lhpv.setBalancePayableAtBranchId(JSPUtility.GetLong(request, "BalancePayableBranchId", 0));
			lhpv.setDispatchLedgersToUpdate(request.getParameter("dispatchLedgerNoToAppend"));
			lhpv.setMaterials(request.getParameter("materials"));
			lhpv.setRatePMT(JSPUtility.GetDouble(request, "ratePMT", 0.00));
			lhpv.setUnloading(JSPUtility.GetDouble(request, "unloadingCharges", 0.00));
			lhpv.setDetaintion(JSPUtility.GetDouble(request, "detaintionCharges", 0.00));
			lhpv.setOtherAdditionalCharge(JSPUtility.GetDouble(request, "otherAdditionalCharges", 0.00));
			lhpv.setDeduction(JSPUtility.GetDouble(request, "deduction", 0.00));
			lhpv.setToPayReceived(JSPUtility.GetDouble(request, "toPayReceived", 0.00));
			lhpv.setRefund(JSPUtility.GetDouble(request, "refund", 0.00));
			lhpv.setlHPVNumber(lHPVNumber);
			lhpv.setlHPVBranchId(executive.getBranchId());
			return lhpv;

		} catch (final Exception e) {
			throw e;
		} finally {
			lhpv = null;
		}
	}

	private LHPV modelLHPVForAppend(final HttpServletRequest request) throws Exception {

		LHPV lhpv = null;

		try {

			lhpv = new LHPV();

			lhpv.setLhpvId(JSPUtility.GetLong(request, "lhpvNoToAppend", 0));
			lhpv.setDispatchLedgersToUpdate(request.getParameter("dlNoToAppend"));

			return lhpv;

		} catch (final Exception e) {
			throw e;
		} finally {
			lhpv = null;
		}
	}
}