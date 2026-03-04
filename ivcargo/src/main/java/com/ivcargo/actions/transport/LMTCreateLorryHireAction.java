package com.ivcargo.actions.transport;

import java.io.PrintWriter;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringUtils;

import com.businesslogic.LorryHireBLL;
import com.businesslogic.SequenceCounterValidationBLL;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.constant.properties.tes.TruckEngagementSlipPropertiesConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.constant.AccountGroupConstant;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.exception.ExceptionProcess;
import com.iv.utils.utility.CollectionUtility;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.LorryHireRouteDao;
import com.platform.dao.truckhisabmodule.PendingTruckHisabEventDao;
import com.platform.dto.Executive;
import com.platform.dto.LorryHire;
import com.platform.dto.LorryHireRoute;
import com.platform.dto.VehicleNumberMaster;
import com.platform.dto.VehiclePendingForArrival;
import com.platform.dto.constant.PaymentTypeConstant;
import com.platform.dto.tds.TDSTxnDetails;
import com.platform.resource.CargoErrorList;

public class LMTCreateLorryHireAction implements Action {

	private static final String TRACE_ID = "LMTCreateLorryHireAction";

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String, Object>				error 								= null;
		ValueObject							valueOutObject						= null;
		PrintWriter							out									= null;
		short								filter								= 1;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			response.setContentType("text/plain");

			final var	cache						= new CacheManip(request);
			final var	executive 					= cache.getExecutive(request);
			final var	lorryHireId					= JSPUtility.GetLong(request, "selectedLorryHireId",0);
			var			lorryHireNumber				= JSPUtility.GetString(request, "lorryHireNumber","");
			final var	createDate					= DateTimeUtility.getCurrentTimeStamp();
			final var	routeBranches				= request.getParameter("routeBranchIds");
			final var	prevRouteBranches			= request.getParameter("prevRouteBranchIds");
			final var	preVehicleNoId				= JSPUtility.GetLong(request, "preVehicleNoId",0);
			final var	responseStrBuffer   		= new StringBuilder();

			final var	configuration						= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.TRUCK_ENGAGEMENT_SLIP);
			final var	validateTruckHisabVoucher			= (boolean) configuration.getOrDefault(TruckEngagementSlipPropertiesConstant.VALIDATE_TRUCK_HISAB_VOUCHER, false);

			if(StringUtils.isEmpty(routeBranches)) {
				responseStrBuffer.append("Error "+CargoErrorList.LORRYHIRE_ROUTE_BRANCH_MISSINGDESCRIPTION);
				error.put("errorCode", CargoErrorList.LORRYHIRE_ROUTE_BRANCH_MISSING);
				error.put("errorDescription", CargoErrorList.LORRYHIRE_ROUTE_BRANCH_MISSINGDESCRIPTION);
				request.setAttribute("cargoError", error);
				request.setAttribute("nextPageToken", "failure");
				return;
			}

			final var	vehicleObj		= cache.getALLVehicleNumberOfGroup(request, executive.getAccountGroupId());

			if (validateTruckHisabVoucher && vehicleObj != null) {
				final var	vehicleNumberMaster	= vehicleObj.get(JSPUtility.GetLong(request, "selectedVehicleNoId", 0));

				if (vehicleNumberMaster != null && vehicleNumberMaster.getVehicleOwner() == VehicleNumberMaster.VEHICLE_OWN_TYPE && (lorryHireId > 0 && preVehicleNoId != JSPUtility.GetLong(request, "selectedVehicleNoId", 0) || lorryHireId <= 0)) {
					final var	count = PendingTruckHisabEventDao.getInstance().getPendingTruckHisabEvent(vehicleNumberMaster.getVehicleNumberMasterId());

					if(count > 0) {
						filter = 10;
						responseStrBuffer.append("" + ";" + "" + ";" + filter);
						out = response.getWriter();
						out.println(responseStrBuffer.toString());
						return;
					}
				}
			}

			if(lorryHireId <= 0 ){
				final var	seqCounterInObj = new ValueObject();
				seqCounterInObj.put("executive", executive);
				seqCounterInObj.put("createDate", createDate);

				final var	seqCuntBLL	  	 = new SequenceCounterValidationBLL();
				final var	seqCounterOutObj = seqCuntBLL.getLorryHireSequenceCounterValidation(seqCounterInObj);

				if(Short.parseShort(seqCounterOutObj.get("errorNo").toString()) != (short)1) {
					if(Short.parseShort(seqCounterOutObj.get("errorNo").toString()) == (short)6 && executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_LMT) {
						filter = 6;
						responseStrBuffer.append("" + ";" + "" + ";" + filter);
						out = response.getWriter();
						out.println(responseStrBuffer.toString());

					} else if(Short.parseShort(seqCounterOutObj.get("errorNo").toString()) == (short)5){
						responseStrBuffer.append("" + ";" + "" + ";" + seqCounterOutObj.get("errorNo").toString());
						out = response.getWriter();
						out.println(responseStrBuffer.toString());
					} else {
						error.put("errorCode", Integer.parseInt(seqCounterOutObj.get("errorCode").toString()));
						error.put("errorDescription", seqCounterOutObj.get("errorDescription").toString());
						request.setAttribute("cargoError", error);
						request.setAttribute("nextPageToken", "failure");
					}
					return;
				}
				lorryHireNumber  = seqCounterOutObj.get("lorryHireNumber").toString();
			}

			if(StringUtils.isEmpty(lorryHireNumber)) {
				filter = 7;
				responseStrBuffer.append("" + ";" + "" + ";" + filter);
				out = response.getWriter();
				out.println(responseStrBuffer.toString());
				return;
			}

			final var	lorryHire 	= setLorryHire(request, executive, createDate, cache);
			lorryHire.setLorryHireNumber(lorryHireNumber);
			lorryHire.setLorryHireId(lorryHireId);

			final var	capacity					  	= cache.getVehicleNumber(request, executive.getAccountGroupId(), lorryHire.getVehicleNumberId()).getLoadCapacity();
			final var	outValueObject 				  	= setLorryHireRouteBranches(routeBranches, lorryHireId, prevRouteBranches, lorryHire.getVehicleNumberId(), capacity, preVehicleNoId);
			final var	vehiclePendingForArrivalArray 	= setVehiclePendingForArrival(lorryHire, outValueObject);

			final var	tdsTxnDetails				  = TDSTxnAction.getTDSTxnDetailsDTOForLorryHire(request, lorryHire);

			final var	finalLorryHireRouteArrayForInsert = (LorryHireRoute[]) outValueObject.get("finalLorryHireRouteArrayForInsert");
			final var	finalLorryHireRouteArrayForEdit   = (LorryHireRoute[]) outValueObject.get("finalLorryHireRouteArrayForEdit");

			final var	valueInObject 	= new ValueObject();
			valueInObject.put("lorryHire", lorryHire);
			valueInObject.put("vehicleObj", vehicleObj);
			valueInObject.put("finalLorryHireRouteArrayForInsert", finalLorryHireRouteArrayForInsert);
			valueInObject.put("finalLorryHireRouteArrayForEdit", finalLorryHireRouteArrayForEdit);
			valueInObject.put("vehiclePendingForArrivalArray", vehiclePendingForArrivalArray);
			valueInObject.put(TDSTxnDetails.TDS_TXN_DETAILS, tdsTxnDetails);
			valueInObject.put("executive", executive);

			final var	lorryHireBLL	= new LorryHireBLL();

			if(lorryHireId > 0) {
				valueOutObject = lorryHireBLL.updateLorryHire(valueInObject);
				filter	= 2;
			} else
				valueOutObject = lorryHireBLL.createLorryHire(valueInObject);

			if(valueOutObject != null) {
				responseStrBuffer.append(valueOutObject.get("lorryHireId") + ";" + lorryHire.getLorryHireNumber() + ";" + filter);
				request.setAttribute("lorryHireId", valueOutObject.get("lorryHireId"));
			} else {
				responseStrBuffer.append("Error "+CargoErrorList.SYSTEM_ERROR_DESCRIPTION);
				error.put("errorCode", CargoErrorList.SYSTEM_ERROR);
				error.put("errorDescription", CargoErrorList.SYSTEM_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
				request.setAttribute("nextPageToken", "failure");
			}

			out = response.getWriter();
			out.println(responseStrBuffer.toString());
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		} finally {
			if(out != null) {
				out.flush();
				out.close();
			}
		}
	}

	private LorryHire setLorryHire(final HttpServletRequest request, final Executive executive, final Timestamp createDate, final CacheManip cache) throws Exception {
		try {
			final var		lorryHire	= new LorryHire();

			lorryHire.setAccountGroupId(executive.getAccountGroupId());
			lorryHire.setExecutiveId(executive.getExecutiveId());
			lorryHire.setBranchId(executive.getBranchId());
			lorryHire.setLorryHireDateTime(createDate);
			lorryHire.setLorrySupplierName(StringUtils.upperCase(JSPUtility.GetString(request, "lorrySupplierName", "")));
			lorryHire.setSupplierMobileNo(JSPUtility.GetString(request, "supplierMobileNumber", ""));
			lorryHire.setDriverName(StringUtils.upperCase(JSPUtility.GetString(request, "driverName", "")));
			lorryHire.setLicenceNumber(StringUtils.upperCase(JSPUtility.GetString(request, "licenceNumber", "")));
			lorryHire.setDriverMobileNo(JSPUtility.GetString(request, "mobileNumber", ""));
			lorryHire.setVehicleNumberId(JSPUtility.GetLong(request, "selectedVehicleNoId", 0));
			lorryHire.setVehicleNumber(JSPUtility.GetString(request, "searchVehicle", ""));
			lorryHire.setSourceBranchId(JSPUtility.GetLong(request, "sourceBranchId", 0));
			lorryHire.setDestinationBranchId(JSPUtility.GetLong(request, "destinationBranchId", 0));
			lorryHire.setVehicleTypeId(JSPUtility.GetLong(request, "vehicleType", 0));
			lorryHire.setRatePerTon(JSPUtility.GetDouble(request, "ratePerTon", 0.00));
			lorryHire.setRatePerTrip(JSPUtility.GetDouble(request, "ratePerTrip", 0.00));
			lorryHire.setTotalLorryHireAmount(JSPUtility.GetDouble(request, "totalLorryHire", 0.00));
			lorryHire.setAdvanceAmount(JSPUtility.GetDouble(request, "advanceLorryHire", 0.00));
			lorryHire.setBalanceAmount(JSPUtility.GetDouble(request, "balanceLorryHire", 0.00));
			lorryHire.setBalancePayableAtBranchId(JSPUtility.GetLong(request, "balancePayableBranchId", 0));
			lorryHire.setMaterialOwnerName(StringUtils.upperCase(JSPUtility.GetString(request, "materialOwner", "")));
			lorryHire.setCreditorId(JSPUtility.GetLong(request, "consignorCorpId",0));
			lorryHire.setAmountOfWayBill(JSPUtility.GetDouble(request, "billAmount", 0.00));
			lorryHire.setMarketingOfficerName(StringUtils.upperCase(JSPUtility.GetString(request, "marketingOfficerName", "")));
			lorryHire.setPaymentType(JSPUtility.GetShort(request, "paymentType", (short)0));
			lorryHire.setLoadedBy(JSPUtility.GetShort(request, "loadedBy", (short)0));
			lorryHire.setLorrySupplierContactPerson(StringUtils.upperCase(JSPUtility.GetString(request, "supplierContactPerson", "")));
			lorryHire.setAdvancePaidByBranchId(JSPUtility.GetLong(request, "advancePaidByBranchId",0));
			lorryHire.setDriverMasterId(JSPUtility.GetLong(request, "driverMasterId",0));
			lorryHire.setChequeDate(DateTimeUtility.getChequeDateTime(JSPUtility.GetString(request, "chequeDate", "")));
			lorryHire.setChequeNumber(JSPUtility.GetString(request, "chequeNo", null));
			lorryHire.setChequeAmount(JSPUtility.GetDouble(request, "chequeAmount", 0.00));
			lorryHire.setBankName(JSPUtility.GetString(request, "bankName", null));
			lorryHire.setStatus(LorryHire.STATUS_LORRY_HIRED);
			lorryHire.setRouteFromBranchIds(request.getParameter("fromBranchIds"));
			lorryHire.setRouteToBranchIds(request.getParameter("toBranchIds"));

			if(lorryHire.getPaymentType() != PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID) {
				lorryHire.setChequeDate(null);
				lorryHire.setChequeNumber(null);
				lorryHire.setChequeAmount(0.00);
				lorryHire.setBankName(null);
			}

			lorryHire.setRemark(StringUtils.upperCase(JSPUtility.GetString(request, "remark", "")));
			lorryHire.setSupplierPanNumber(StringUtils.upperCase(JSPUtility.GetString(request, "supplierPanNumber", "")));
			lorryHire.setCapacity(cache.getVehicleType(request, executive.getAccountGroupId(), lorryHire.getVehicleTypeId()).getCapacity());

			return lorryHire;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public ValueObject setLorryHireRouteBranches(final String routeBranches, final long lorryHireId, final String prevRouteBranchIds, final long vehicleNumberMasterId,final double capacity,final long preVehicleNoId) throws Exception {
		LorryHireRoute[]			finalLorryHireRouteArrayForEdit		= null;

		try {

			final var	lorryHireRouteArr = LorryHireRouteDao.getInstance().getLorryHireRouteByLorryHireId(lorryHireId);

			final var	allowToUpdate = vehicleNumberMasterId != preVehicleNoId;

			final var	lorryHireRouteInsert  		= new ArrayList<LorryHireRoute>();
			final var	lorryHireRouteEdit	 		= new ArrayList<LorryHireRoute>();
			final var	finalLorryHireRouteInsert  	= new ArrayList<LorryHireRoute>();
			final var	finalLorryHireRouteEdit	 	= new ArrayList<LorryHireRoute>();

			final var	routeBranchArray			= CollectionUtility.getLongArrayFromString(routeBranches, ",");

			for(var i = 0; i < routeBranchArray.length; i++){
				final var lorryHireRoute = new LorryHireRoute();
				lorryHireRoute.setRouteBranchId(routeBranchArray[i]);
				lorryHireRoute.setSequenceNumber((short)(i + 1));
				lorryHireRoute.setMarkForDelete(false);
				lorryHireRoute.setLorryHireId(lorryHireId);
				lorryHireRoute.setVehicleNumberMasterId(vehicleNumberMasterId);
				lorryHireRoute.setCapacity(capacity);
				lorryHireRoute.setAvailableLoadingCapacity(capacity);

				lorryHireRouteInsert.add(lorryHireRoute);
			}

			if(lorryHireId > 0 && lorryHireRouteArr != null && lorryHireRouteArr.length > 0) {
				//final var	prevRouteBranchStrArray = prevRouteBranchIds.split(",");

				for (final LorryHireRoute element : lorryHireRouteArr) {
					final var lorryHireRoute = new LorryHireRoute();
					lorryHireRoute.setRouteBranchId(element.getRouteBranchId());
					lorryHireRoute.setLorryHireRouteId(element.getLorryHireRouteId());
					lorryHireRoute.setSequenceNumber(element.getSequenceNumber());
					lorryHireRoute.setMarkForDelete(true);
					lorryHireRoute.setLorryHireId(lorryHireId);
					lorryHireRoute.setVehicleNumberMasterId(vehicleNumberMasterId);
					lorryHireRoute.setCapacity(capacity);
					lorryHireRoute.setAvailableLoadingCapacity(capacity);

					lorryHireRouteEdit.add(lorryHireRoute);
				}

				for (final LorryHireRoute element : lorryHireRouteEdit)
					for (final LorryHireRoute element2 : lorryHireRouteInsert)
						if(element.getRouteBranchId() ==  element2.getRouteBranchId()){
							element.setMarkForDelete(false);
							element2.setMarkForDelete(true);

							if(element.getSequenceNumber() != element2.getSequenceNumber()){
								element.setSequenceEdit(true);
								element.setSequenceNumber(element2.getSequenceNumber());
							}
						}

				for (final LorryHireRoute aLorryHireRouteEdit : lorryHireRouteEdit)
					if(aLorryHireRouteEdit.isMarkForDelete() || aLorryHireRouteEdit.isSequenceEdit() || allowToUpdate)
						finalLorryHireRouteEdit.add(aLorryHireRouteEdit);

				finalLorryHireRouteArrayForEdit = new LorryHireRoute[finalLorryHireRouteEdit.size()];
				finalLorryHireRouteEdit.toArray(finalLorryHireRouteArrayForEdit);
			}

			for(var i = 0 ; i < lorryHireRouteInsert.size(); i++)
				if(!lorryHireRouteInsert.get(i).isMarkForDelete()){
					lorryHireRouteInsert.get(i).setSequenceNumber((short)(i + 1));

					if(i > 0)
						lorryHireRouteInsert.get(i).setPrevRouteBranchId(lorryHireRouteInsert.get(i - 1).getRouteBranchId());

					if(i < lorryHireRouteInsert.size() - 1)
						lorryHireRouteInsert.get(i).setNextRouteBranchId(lorryHireRouteInsert.get(i + 1).getRouteBranchId());

					finalLorryHireRouteInsert.add(lorryHireRouteInsert.get(i));
				}

			final var	finalLorryHireRouteArrayForInsert = new LorryHireRoute[finalLorryHireRouteInsert.size()];
			finalLorryHireRouteInsert.toArray(finalLorryHireRouteArrayForInsert);

			final var	inValueObject		= new ValueObject();
			inValueObject.put("finalLorryHireRouteArrayForInsert", finalLorryHireRouteArrayForInsert);
			inValueObject.put("finalLorryHireRouteArrayForEdit", finalLorryHireRouteArrayForEdit);

			return inValueObject;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private VehiclePendingForArrival[] setVehiclePendingForArrival(final LorryHire  lorryHire, final ValueObject inValueObject) throws Exception {
		VehiclePendingForArrival[]			vehiclePendingForArrivalArray	   = null;

		try {
			if(inValueObject.get("finalLorryHireRouteArrayForInsert") != null) {
				final var	finalLorryHireRouteArrayForInsert = (LorryHireRoute[]) inValueObject.get("finalLorryHireRouteArrayForInsert");

				final var	vehiclePendingForArrivalList = new ArrayList<VehiclePendingForArrival>();

				for (final LorryHireRoute element : finalLorryHireRouteArrayForInsert) {
					final var	vehiclePendingForArrival = new VehiclePendingForArrival();

					vehiclePendingForArrival.setExecutiveId(lorryHire.getExecutiveId());
					vehiclePendingForArrival.setBranchId(lorryHire.getBranchId());
					vehiclePendingForArrival.setDriverName(lorryHire.getDriverName());
					vehiclePendingForArrival.setDriverMobileNo(lorryHire.getDriverMobileNo());
					vehiclePendingForArrival.setVehicleNumberId(lorryHire.getVehicleNumberId());
					vehiclePendingForArrival.setVehicleNumber(lorryHire.getVehicleNumber());
					vehiclePendingForArrival.setPrevRouteBranchId(element.getPrevRouteBranchId());
					vehiclePendingForArrival.setNextRouteBranchId(element.getNextRouteBranchId());
					vehiclePendingForArrival.setRouteFromBranchId(lorryHire.getSourceBranchId());
					vehiclePendingForArrival.setRouteToBranchId(lorryHire.getDestinationBranchId());
					vehiclePendingForArrival.setRouteBranchId(element.getRouteBranchId());
					vehiclePendingForArrival.setCapacity(lorryHire.getCapacity());
					vehiclePendingForArrival.setAvailableLoadingCapacity(lorryHire.getCapacity());
					vehiclePendingForArrival.setSystemDateTime(lorryHire.getLorryHireDateTime());

					vehiclePendingForArrivalList.add(vehiclePendingForArrival);
				}

				if(vehiclePendingForArrivalList != null && vehiclePendingForArrivalList.size() > 0) {
					vehiclePendingForArrivalArray = new VehiclePendingForArrival[vehiclePendingForArrivalList.size()];
					vehiclePendingForArrivalList.toArray(vehiclePendingForArrivalArray);
				}
			}

			return vehiclePendingForArrivalArray;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}
}