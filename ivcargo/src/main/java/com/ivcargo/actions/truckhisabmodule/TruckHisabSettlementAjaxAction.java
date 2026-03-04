package com.ivcargo.actions.truckhisabmodule;

import java.io.PrintWriter;
import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.ObjectUtils;
import org.apache.commons.lang3.StringUtils;
import org.json.JSONArray;
import org.json.JSONObject;

import com.businesslogic.master.ExpenseVoucherBLL;
import com.businesslogic.truckhisabmodule.DriverDailyAllowanceBll;
import com.businesslogic.truckhisabmodule.TruckHisabSettlementBll;
import com.framework.Action;
import com.iv.bll.impl.properties.BranchExpenseConfigurationBllImpl;
import com.iv.bll.impl.properties.TollExpensesDetailsConfigurationBllImpl;
import com.iv.bll.properties.TruckHisabVoucherConfigurationConstant;
import com.iv.constant.properties.BranchExpensePropertiesConstant;
import com.iv.dto.constant.FeildPermissionsConstant;
import com.iv.dto.constant.IncomeExpenseMappingConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.dto.constant.PaymentTypeConstant;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.constant.Constant;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.exception.ExceptionProcess;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.actions.shortexcess.CommonFuctionToConvertArrayListToJSONArray;
import com.ivcargo.utils.CacheManip;
import com.ivcargo.utils.JsonUtility;
import com.platform.dao.IncomeExpenseChargeDao;
import com.platform.dao.VehicleNumberMasterDao;
import com.platform.dao.truckhisabmodule.VehicleHisabDateDetailsDao;
import com.platform.dto.ConfigParam;
import com.platform.dto.DispatchLedger;
import com.platform.dto.Executive;
import com.platform.dto.ExpenseDetails;
import com.platform.dto.ExpenseVoucherDetails;
import com.platform.dto.ExpenseVoucherPaymentDetails;
import com.platform.dto.LHPV;
import com.platform.dto.Region;
import com.platform.dto.TransportCommonMaster;
import com.platform.dto.VehicleNumberMaster;
import com.platform.dto.configuration.modules.DocumentCodeConfigurationDTO;
import com.platform.dto.truckhisabmodule.DriverAllowanceDetails;
import com.platform.dto.truckhisabmodule.MiscExpenseDetails;
import com.platform.dto.truckhisabmodule.TollExpenseDetails;
import com.platform.dto.truckhisabmodule.TollExpensesDetailsModel;
import com.platform.dto.truckhisabmodule.TruckHisabVoucher;
import com.platform.dto.truckhisabmodule.VehicleHisabDateDetails;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

public class TruckHisabSettlementAjaxAction implements Action {

	private static final String TRACE_ID = "TruckHisabSettlementAjaxAction";

	Timestamp 							createDate 						= null;

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {

		HashMap<String,Object>	 						error 		= null;

		PrintWriter										out								= null;
		JSONObject										getJsonObject					= null;
		JSONObject										outJsonObject					= null;

		short											filter							= 0;

		try {

			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			response.setContentType("application/json");
			out = response.getWriter();

			getJsonObject 		= new JSONObject(request.getParameter("json"));
			outJsonObject		= new JSONObject();

			filter					= Utility.getShort(getJsonObject.get("Filter"));

			if(request.getSession().getAttribute("executive") == null) {
				outJsonObject.put("errorDescription", "You have been logged out. Please login again.");
				out.println(outJsonObject);
				return;
			}

			switch (filter) {
			case 1 -> out.println(getDriverDetails(request, outJsonObject));
			case 2 -> out.println(getLhpvDetails (request, outJsonObject, getJsonObject));
			case 3 -> out.println(getLoadingSheetDetails (request, outJsonObject, getJsonObject));
			case 4 -> out.println(getDriverDailyAllowanceDetails (request, outJsonObject, getJsonObject));
			case 5 -> out.println(getTruckHisabLastDate (request, outJsonObject, getJsonObject));
			case 6 -> out.println(getTruckVoucherByVehicleID (request, outJsonObject, getJsonObject));
			case 7 -> out.println(insertIntoTruckSettlement (request, outJsonObject, getJsonObject));
			case 8 -> out.println(getvehicleTypeAndCapacityByVehicleId (request, outJsonObject, getJsonObject));
			case 9 -> out.println(getvehicleTypeAndCapacityByVehicleId (request, outJsonObject, getJsonObject));
			case 10 -> out.println(getTruckHiabDetailsForPrint (request, outJsonObject, getJsonObject));
			case 11 -> out.println(getExpenseChargeMaster (request, outJsonObject));
			default -> {
				outJsonObject.put("errorDescription", "You have been logged out. Please login again.");
				out.println(outJsonObject);
			}
			}


		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		} finally {
			if(out != null) {
				out.flush();
				out.close();
			}
		}
	}

	@SuppressWarnings("unchecked")
	private JSONObject getLhpvDetails(final HttpServletRequest request, final JSONObject outJsonObject,
			final JSONObject getJsonObject) throws Exception {
		ValueObject 						valueObjectToBLL 				= null;
		ValueObject 						valueObjFromBLL 				= null;
		Executive							executive						= null;
		TruckHisabSettlementBll				truckhisabSettlementBll			= null;
		ArrayList<LHPV>						lhpvList						= null;

		CommonFuctionToConvertArrayListToJSONArray		commonFun	  		= 		null;
		try{

			valueObjectToBLL		= 	 new  ValueObject();
			truckhisabSettlementBll	= 	 new  TruckHisabSettlementBll();

			commonFun				= 	 new CommonFuctionToConvertArrayListToJSONArray();
			executive		= (Executive) request.getSession().getAttribute("executive");
			valueObjectToBLL.put("lhpvId", Utility.getLong(getJsonObject.get("lhpvId")));
			valueObjectToBLL.put("executive", executive);

			valueObjFromBLL	= truckhisabSettlementBll.getLHPVDetailsByVehicleId(valueObjectToBLL);

			if(valueObjFromBLL == null) {
				request.setAttribute("nextPageToken", "failure");
				outJsonObject.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				return outJsonObject;
			}

			lhpvList = (ArrayList<LHPV>)valueObjFromBLL.get("lhpvList");

			if(ObjectUtils.isNotEmpty(lhpvList)) {
				outJsonObject.put("lhpvListColl", commonFun.getLHPVJSONArrayObject(lhpvList));
				outJsonObject.put("executive",new JSONObject(executive));
			}

			return outJsonObject;
		}catch(final Exception e){
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	@SuppressWarnings("unchecked")
	private JSONObject getLoadingSheetDetails(final HttpServletRequest request, final JSONObject outJsonObject,
			final JSONObject getJsonObject) throws Exception {
		ValueObject 						valueObjectToBLL 				= null;
		ValueObject 						valueObjFromBLL 				= null;
		Executive							executive						= null;
		TruckHisabSettlementBll				truckhisabSettlementBll			= null;
		ArrayList<DispatchLedger>			dispatchledgerList				= null;

		CommonFuctionToConvertArrayListToJSONArray		commonFun	  		= 		null;
		try{

			valueObjectToBLL		= 	 new  ValueObject();
			truckhisabSettlementBll	= 	 new  TruckHisabSettlementBll();

			commonFun				= 	 new CommonFuctionToConvertArrayListToJSONArray();
			executive		= (Executive) request.getSession().getAttribute("executive");
			valueObjectToBLL.put("LHPVID", Utility.getLong(getJsonObject.get("LHPVID")));
			valueObjectToBLL.put("executive", executive);

			valueObjFromBLL	= truckhisabSettlementBll.getLSDetailsByVehicleId(valueObjectToBLL);

			if(valueObjFromBLL == null) {
				request.setAttribute("nextPageToken", "failure");
				outJsonObject.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				return outJsonObject;
			}

			dispatchledgerList = (ArrayList<DispatchLedger>)valueObjFromBLL.get("dispatchLedgerOutList");

			if( dispatchledgerList != null  && !dispatchledgerList.isEmpty())
				outJsonObject.put("dispatchLedgerListColl", commonFun.getDispatchLedgerJSONArrayObject(dispatchledgerList));

			return outJsonObject;
		}catch(final Exception e){
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private JSONObject getDriverDetails(final HttpServletRequest request, final JSONObject outJsonObject) throws Exception {
		try {
			final var	executive		= (Executive) request.getSession().getAttribute("executive");

			final var	truckhisabSettlementBll			= new TruckHisabSettlementBll();

			final var	valueObjectFromBLL	= truckhisabSettlementBll.getDriverDetails(executive);

			if(valueObjectFromBLL == null) {
				request.setAttribute("nextPageToken", "failure");
				outJsonObject.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);

				return outJsonObject;
			}

			return JsonUtility.convertionToJsonObjectForResponse(valueObjectFromBLL);
		}catch(final Exception e){
			throw ExceptionProcess.execute(e, TRACE_ID);
		}

	}

	private JSONObject getDriverDailyAllowanceDetails(final HttpServletRequest request, final JSONObject outJsonObject,
			final JSONObject getJsonObject) throws Exception {
		try {
			final var	driverDailyAllowanceBll	= new  DriverDailyAllowanceBll();

			final var driverdailyallowanceList	= driverDailyAllowanceBll.getDriverDailyAllowance(getJsonObject.optLong("DriverAllowId", 0));

			if(ObjectUtils.isEmpty(driverdailyallowanceList)) {
				request.setAttribute("nextPageToken", "failure");
				outJsonObject.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				return outJsonObject;
			}

			final var	commonFun				= new CommonFuctionToConvertArrayListToJSONArray();
			outJsonObject.put("driverDailyAllowanceColl", commonFun.getDriverDailyAllowanceJSONArrayObject(driverdailyallowanceList));

			return outJsonObject;
		} catch(final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private JSONObject getTruckHisabLastDate(final HttpServletRequest request, final JSONObject outJsonObject, final JSONObject getJsonObject) throws Exception {
		try {
			final var	commonFun		= new CommonFuctionToConvertArrayListToJSONArray();
			final var	executive		= (Executive) request.getSession().getAttribute("executive");

			final var	vehicleHisabDateDetails = new VehicleHisabDateDetails();
			vehicleHisabDateDetails.setVehicleId(getJsonObject.optLong("VEHICLEID", 0));
			vehicleHisabDateDetails.setAccountGroupId(executive.getAccountGroupId());

			final var	lastDateList	= VehicleHisabDateDetailsDao.getInstance().getTruckHisabLast(vehicleHisabDateDetails);

			if(ObjectUtils.isEmpty(lastDateList)) {
				request.setAttribute("nextPageToken", "failure");
				outJsonObject.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				return outJsonObject;
			}

			lastDateList.get(0).setVehicleLastDate(DateTimeUtility.getDateFromTimeStamp(lastDateList.get(0).getVehicleLastHisabDate()));
			lastDateList.get(0).setVehicleLastHisabDateTime(lastDateList.get(0).getVehicleLastHisabDate().getTime());
			lastDateList.get(0).setClosingKilometer(lastDateList.get(0).getClosingKilometer());

			outJsonObject.put("lastDateListCol", commonFun.getVehicleLastDateJSONArrayObject((ArrayList<VehicleHisabDateDetails>) lastDateList));

			return outJsonObject;
		} catch(final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	@SuppressWarnings("unchecked")
	private JSONObject getTruckVoucherByVehicleID(final HttpServletRequest request, final JSONObject outJsonObject,
			final JSONObject getJsonObject) throws Exception {
		ValueObject 						valueObjectToBLL 				= null;
		ValueObject 						valueObjFromBLL 				= null;
		Executive							executive						= null;
		TruckHisabSettlementBll				truckHisabSettlementBll			= null;
		CacheManip							cacheManip						= null;
		var									noOfDays						= 0;
		String								minimumDate						= null;

		CommonFuctionToConvertArrayListToJSONArray		commonFun	  		= null;
		try{
			valueObjectToBLL			= 	new  ValueObject();
			truckHisabSettlementBll		= 	new  TruckHisabSettlementBll();
			cacheManip					= 	new  CacheManip(request);

			commonFun				= 	 new CommonFuctionToConvertArrayListToJSONArray();
			executive		= (Executive) request.getSession().getAttribute("executive");
			valueObjectToBLL.put("vehicleid", Utility.getLong(getJsonObject.get("VEHICLEID")));
			valueObjectToBLL.put("executive", executive);

			noOfDays 	= cacheManip.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_MAX_DAYS_OF_OPERATION_BEFORE_CASHSTATEMENT_ENTRY_ID);

			minimumDate	= DateTimeUtility.getDateBeforeNoOfDays(noOfDays);

			valueObjFromBLL	= truckHisabSettlementBll.getTruckHisabVoucher(valueObjectToBLL);

			if(valueObjFromBLL == null) {
				request.setAttribute("nextPageToken", "failure");
				outJsonObject.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				return outJsonObject;
			}

			final var	truckHisabVoucherList = (ArrayList<TruckHisabVoucher>)valueObjFromBLL.get("truckHisabVoucherList");

			if(ObjectUtils.isNotEmpty(truckHisabVoucherList))
				outJsonObject.put("truckHisabVoucherListCol", commonFun.getTruckHisabVoucherJSONArrayObject(truckHisabVoucherList));

			final var	truckHisabConfiguration					= cacheManip.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.TRUCK_HISAB_VOUCHER);

			outJsonObject.put("minimumDate", minimumDate);
			outJsonObject.put("showBackDateInTruckHisabSettlement", truckHisabConfiguration.getOrDefault(TruckHisabVoucherConfigurationConstant.SHOW_BACK_DATE_IN_TRUCK_HISAB_SETTLEMENT, false));

			return outJsonObject;
		} catch(final Exception e){
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private JSONObject insertIntoTruckSettlement(final HttpServletRequest request, JSONObject outJsonObject,
			final JSONObject getJsonObject) throws Exception {
		LHPV								lhpv							= null;
		DispatchLedger[]					dispatchLedgerArr				= null;
		ExpenseDetails						expenseDetails					= null;
		MiscExpenseDetails					miscExpenseDetails				= null;
		Region								region							= null;
		TollExpensesDetailsModel			fastTagTollExpenseDetails		= null;
		var									showFastTagTollDetails			= false;

		try{
			final var	cache							=	new CacheManip(request);
			final var	valueObjectToBLL				= 	new  ValueObject();
			final var	truckHisabSettlementBll			= 	new  TruckHisabSettlementBll();

			if(getJsonObject.has("settlementBackDate") && getJsonObject.get("settlementBackDate") != null)
				createDate		= DateTimeUtility.appendTimeToDate(getJsonObject.get("settlementBackDate").toString());
			else
				createDate		= DateTimeUtility.getCurrentTimeStamp();

			final var	detailsaArrayList				= 	new ArrayList<ExpenseDetails>();
			final var	driverAllowanceDetailsList		= 	new ArrayList<DriverAllowanceDetails>();
			final var	tollExpenseDetailsList			= 	new ArrayList<TollExpenseDetails>();
			final var	miscExpenseDetailsList			= 	new ArrayList<MiscExpenseDetails>();
			final var	sdf2         					=	new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			final var	executive						= cache.getExecutive(request);
			final List<TollExpensesDetailsModel>	fastTagTollExpenseDetailsList	= 	new ArrayList<>();
			final var	expenseConfiguration			= BranchExpenseConfigurationBllImpl.getInstance().getBranchExpenseProperty(executive.getAccountGroupId());
			final var	accountGroupWiseTollExepenseConfig	= TollExpensesDetailsConfigurationBllImpl.getInstance().getTollExpensesDetailsPropertyByAccountGroupId(executive.getAccountGroupId());

			if(accountGroupWiseTollExepenseConfig != null)
				showFastTagTollDetails = (boolean) accountGroupWiseTollExepenseConfig.getOrDefault(TollExpensesDetailsModel.SHOW_FAST_TAG_TOLL_DETAILS, false);

			final HashMap<?, ?>	execFldPermissions			= cache.getExecutiveFieldPermission(request);

			if(execFldPermissions != null && execFldPermissions.get(FeildPermissionsConstant.DO_NOT_VALIDATE_CLOSING_KILOMETER) == null && getJsonObject.optLong("closingKilometer", 0) <= getJsonObject.optLong("prevClosingKilometer", 0)) {
				outJsonObject.put(CargoErrorList.ERROR_DESCRIPTION, CargoErrorList.errorDescription(CargoErrorList.VALIDATE_CLOSING_KILOMETER, null));
				return outJsonObject;
			}

			valueObjectToBLL.put(BranchExpensePropertiesConstant.NUMERIC_EXPENSE_VOUCHER_NUMBER, (boolean) expenseConfiguration.getOrDefault(BranchExpensePropertiesConstant.NUMERIC_EXPENSE_VOUCHER_NUMBER,false));
			valueObjectToBLL.put(Executive.EXECUTIVE, executive);
			valueObjectToBLL.put(Constant.BRANCH_ID, executive.getBranchId());
			valueObjectToBLL.put(DocumentCodeConfigurationDTO.DOCUMENT_CODE_CONFIGURATION, cache.getDocumentCodeConfiguration(request, executive.getAccountGroupId()));
			valueObjectToBLL.put("srcBranch", cache.getGenericBranchDetailCache(request, executive.getBranchId()));

			final var expenseVoucherbll	= new ExpenseVoucherBLL();
			final var	paymentVoucherNumber	= expenseVoucherbll.generateExpenseVoucherNumber(valueObjectToBLL);

			final var	vehicleNumberMaster 	= cache.getVehicleNumber(request, executive.getAccountGroupId(), Utility.getLong(getJsonObject.get("VehicleIdSttlement")));

			if(vehicleNumberMaster != null)
				region		= cache.getGenericRegionById(request,  vehicleNumberMaster.getAllotedRegionId());

			if(region != null)
				vehicleNumberMaster.setAllotedRegionName(region.getName());

			valueObjectToBLL.put("vehicleNumberMaster", vehicleNumberMaster);

			final var	paymentType	= Short.parseShort(Integer.toString(getJsonObject.optInt("paymentType", 0)));
			final var	vehicleId 	= getJsonObject.optLong("VehicleIdSttlement", 0);

			if(vehicleId <= 0)
				return null;

			final var	truckHisabVoucherID		= getJsonObject.optLong("TruckHisabVoucherID", 0);
			final var	truckHisabVoucherNumber	= getJsonObject.optString("TruckHisabVoucherNumber", null);

			valueObjectToBLL.put("TruckHisabVoucherID", truckHisabVoucherID);

			if(truckHisabVoucherNumber != null)
				valueObjectToBLL.put("truckHisabVocherNumber", truckHisabVoucherNumber);

			valueObjectToBLL.put("VehicleIdSttlement", getJsonObject.optLong("VehicleIdSttlement", 0));
			valueObjectToBLL.put("truckOwnNumber", getJsonObject.get("VEHICLENUMBERSTTLEMENT"));
			valueObjectToBLL.put("DriverNameSttlement", getJsonObject.get("DriverNameSttlement"));
			valueObjectToBLL.put("DriverIdSttlement", getJsonObject.optLong("DriverIdSttlement", 0));
			valueObjectToBLL.put("LhpvIdSttlement", getJsonObject.optLong("LhpvIdSttlement", 0));
			valueObjectToBLL.put("FilnalTotalSttlement", getJsonObject.optLong("FilnalTotalSttlement", 0));
			valueObjectToBLL.put("RemarkSttlement", getJsonObject.optString("RemarkSttlement", null));
			valueObjectToBLL.put("closingKilometer", getJsonObject.optLong("closingKilometer", 0));

			valueObjectToBLL.put("executive", executive);
			final var	jsonArr = getJsonObject.getJSONArray("ExpenseVoucherDetails");

			if(getJsonObject.getJSONArray("ExpenseVoucherDetails") != null)
				for(var i = 0; i < jsonArr.length(); i++) {
					final var	newJsonObject	= jsonArr.getJSONObject(i);
					expenseDetails 	= new ExpenseDetails();
					expenseDetails.setExpenseDateTime(createDate);
					expenseDetails.setActualDateTime(DateTimeUtility.getCurrentTimeStamp());
					expenseDetails.setExpenseChargeMasterId(Utility.getShort(newJsonObject.get("ExpenseMasterTypeID")));
					expenseDetails.setAmount(Utility.getDouble(newJsonObject.get("Amount")));
					expenseDetails.setId(truckHisabVoucherID);
					expenseDetails.setNumber(truckHisabVoucherNumber);
					expenseDetails.setRemark(newJsonObject.get("Remark")+"");
					expenseDetails.setAccountGroupId(executive.getAccountGroupId());
					expenseDetails.setBranchId(executive.getBranchId());
					expenseDetails.setExecutiveId(executive.getExecutiveId());
					expenseDetails.setPaymentVoucherNumber(paymentVoucherNumber);
					expenseDetails.setTypeOfExpenseId(TransportCommonMaster.CHARGE_TYPE_OFFICE);
					detailsaArrayList.add(expenseDetails);
				}

			final var	incomeExpenseChargeMaster = IncomeExpenseChargeDao.getInstance().getExpenseChargeDetailById(expenseDetails.getExpenseChargeMasterId());

			valueObjectToBLL.put("incomeExpenseChargeMaster", incomeExpenseChargeMaster);
			valueObjectToBLL.put("expenseDetails", expenseDetails);

			final var	voucherDetails = createVoucherDetails(executive,Utility.getLong(getJsonObject.get("FilnalTotalSttlement")),jsonArr.length(),paymentVoucherNumber,truckHisabVoucherID,truckHisabVoucherNumber);

			if(voucherDetails != null)
				valueObjectToBLL.put("voucherDetails", voucherDetails);

			final var	allowancejsonArr = getJsonObject.getJSONArray("dailyAllwanceArray");

			if(allowancejsonArr != null)
				for(var i = 0 ;i < allowancejsonArr.length(); i++){
					final var	allowanceJsonObj = allowancejsonArr.getJSONObject(i);
					final var	driverAllowanceDetails = new DriverAllowanceDetails();
					driverAllowanceDetails.setTruckHisabVoucherId(Utility.getLong(getJsonObject.get("TruckHisabVoucherID")));
					driverAllowanceDetails.setVehicleId(Utility.getLong(getJsonObject.get("VehicleIdSttlement")));
					driverAllowanceDetails.setDriverId(Utility.getLong(getJsonObject.get("DriverIdSttlement")));
					driverAllowanceDetails.setFromDateTime(new Timestamp(sdf2.parse(allowanceJsonObj.get("AllowanceFromDate") + " 00:00:00").getTime()));
					driverAllowanceDetails.setToDateTime(new Timestamp(sdf2.parse(allowanceJsonObj.get("AllowanceTODate") + " 00:00:00").getTime()));
					driverAllowanceDetails.setTotalNumberDays(Utility.getLong(allowanceJsonObj.get("AllowanceTotalDays")));
					driverAllowanceDetails.setAllowanceRate(Utility.getLong(allowanceJsonObj.get("AllowanceDriverAmt")));
					driverAllowanceDetails.setAmount(Utility.getLong(allowanceJsonObj.get("AllowanceTotAmt")));
					driverAllowanceDetails.setRemark(allowanceJsonObj.get("AllowanceRemark")+"");
					driverAllowanceDetails.setTruckHisabNumber(getJsonObject.get("TruckHisabVoucherNumber")+"");

					driverAllowanceDetailsList.add(driverAllowanceDetails);
				}

			final var	tolljsonArr = getJsonObject.getJSONArray("TollArray");

			if(tolljsonArr != null)
				for(var i = 0 ;i < tolljsonArr.length(); i++){
					final var	tollJsonObj = tolljsonArr.getJSONObject(i);
					final var	tollExpenseDetails = new TollExpenseDetails();
					tollExpenseDetails.setTruckHisabVoucherId(Utility.getLong(getJsonObject.get("TruckHisabVoucherID")));
					tollExpenseDetails.setVehicleId(Utility.getLong(getJsonObject.get("VehicleIdSttlement")));
					tollExpenseDetails.setDriverId(Utility.getLong(getJsonObject.get("DriverIdSttlement")));
					tollExpenseDetails.setTollTypeRateMasterId(Utility.getLong(tollJsonObj.get("TollMasterTypeId")));
					tollExpenseDetails.setAmount(Utility.getLong(tollJsonObj.get("TollMasterAmt")));
					tollExpenseDetails.setRemark(tollJsonObj.get("TollMasterRemark")+"");
					tollExpenseDetails.setName(tollJsonObj.get("TollMasteName")+"");
					tollExpenseDetails.setTruckHisabNumber(getJsonObject.get("TruckHisabVoucherNumber")+"");

					tollExpenseDetailsList.add(tollExpenseDetails);
				}

			if(showFastTagTollDetails) {
				final var	fastTagTollArray = getJsonObject.getJSONArray("fastTagtollArray");

				if(fastTagTollArray != null)
					for(var i = 0 ;i < fastTagTollArray.length(); i++){
						final var	fastTagTollJsonObj = fastTagTollArray.getJSONObject(i);
						fastTagTollExpenseDetails = new TollExpensesDetailsModel();
						fastTagTollExpenseDetails.setTruckHisabVoucherId(Utility.getLong(getJsonObject.get("TruckHisabVoucherID")));
						fastTagTollExpenseDetails.setIsTollExpensePaid(Utility.getShort(fastTagTollJsonObj.get("isTollExpensePaid")));
						fastTagTollExpenseDetails.setFastTagTollExpenseDetailsId(Utility.getLong(fastTagTollJsonObj.get("fastTagtollId")));
						fastTagTollExpenseDetails.setAccountGroupId(executive.getAccountGroupId());

						fastTagTollExpenseDetailsList.add(fastTagTollExpenseDetails);
					}
			}

			valueObjectToBLL.put("fastTagTollExpenseDetailsList", fastTagTollExpenseDetailsList);

			final var	miscjsonArr = getJsonObject.getJSONArray("MiscArray21");

			if(miscjsonArr != null)
				for(var i = 0 ;i < miscjsonArr.length(); i++){
					final var	miscJsonObj = miscjsonArr.getJSONObject(i);

					miscExpenseDetails = new MiscExpenseDetails();
					miscExpenseDetails.setTruckHisabVoucherId(Utility.getLong(getJsonObject.get("TruckHisabVoucherID")));
					miscExpenseDetails.setVehicleId(Utility.getLong(getJsonObject.get("VehicleIdSttlement")));
					miscExpenseDetails.setDriverId(Utility.getLong(getJsonObject.get("DriverIdSttlement")));
					miscExpenseDetails.setMiscMasterId(Utility.getLong(miscJsonObj.get("MiscMasterTypeId555")));
					miscExpenseDetails.setAmount(Utility.getLong(miscJsonObj.get("MiscMasterAmt")));
					miscExpenseDetails.setRemark(miscJsonObj.get("MiscMasterRemark")+"");
					miscExpenseDetails.setName(miscJsonObj.get("MiscMasterName")+"");
					miscExpenseDetails.setTruckHisabNumber(getJsonObject.get("TruckHisabVoucherNumber")+"");

					miscExpenseDetailsList.add(miscExpenseDetails);
				}

			final var	lhpvArr = getJsonObject.getJSONArray("GLOBLHPVCOLLECTON");

			if(lhpvArr != null)
				for(var i = 0 ;i < lhpvArr.length(); i++){
					final var	lhpvObj = lhpvArr.getJSONObject(i);
					lhpv = new LHPV();
					lhpv.setLhpvId(Utility.getLong(lhpvObj.get("lhpvId")));
					lhpv.setlHPVNumber(lhpvObj.get("lhpvNum")+"");
					lhpv.setBranchId(Utility.getLong(lhpvObj.get("branchId")));
					lhpv.setLhpvBranchName(lhpvObj.get("lhpvBranchName")+"");
					lhpv.setDestinationBranch(lhpvObj.get("destinationBranch")+"");
					lhpv.setDestinationBranchId(Utility.getLong(lhpvObj.get("destinationBranchId")));
					lhpv.setCreationDate(lhpvObj.get("creationDate")+"");
				}

			var lsArr = getJsonObject.optJSONArray("GLOBLSCOLLECTON");

			if (lsArr == null) {
				final var obj = getJsonObject.optJSONObject("GLOBLSCOLLECTON");
				if (obj != null) {
					lsArr = new JSONArray();
					lsArr.put(obj);
				}
			}

			if (lsArr != null) {
				dispatchLedgerArr = new DispatchLedger[lsArr.length()];

				for (var i = 0; i < lsArr.length(); i++) {
					final var lsObj = lsArr.getJSONObject(i);

					dispatchLedgerArr[i] = new DispatchLedger();
					dispatchLedgerArr[i].setLsNumber(lsObj.optString("lsNumber", ""));
					dispatchLedgerArr[i].setTotalNoOfPackages(Utility.getInt(lsObj.opt("totalNoOfPackages")));
					dispatchLedgerArr[i].setTotalNoOfDoorDelivery(Utility.getInt(lsObj.opt("totalNoOfDoorDelivery")));
					dispatchLedgerArr[i].setTotalActualWeight(Utility.getLong(lsObj.opt("totalActualWeight")));
					dispatchLedgerArr[i].setTotalNoOfForms(Utility.getInt(lsObj.opt("totalNoOfForms")));
				}
			} else
				dispatchLedgerArr = new DispatchLedger[0];


			valueObjectToBLL.put("dispatchLedgerArr", dispatchLedgerArr);
			valueObjectToBLL.put("lhpvForPrint", lhpv);
			valueObjectToBLL.put("tollExpenseDetailsList", tollExpenseDetailsList);
			valueObjectToBLL.put("miscExpenseDetailsList", miscExpenseDetailsList);
			valueObjectToBLL.put("driverAllowanceDetailsList", driverAllowanceDetailsList);
			valueObjectToBLL.put("detailsaArrayList", detailsaArrayList);
			valueObjectToBLL.put("expenseDetails", expenseDetails);

			valueObjectToBLL.put("genericBranch", cache.getGenericBranchesDetail(request));

			final var	expenseVoucherPaymentDetails	= createExpenseVoucherPaymentDetails(getJsonObject,paymentType);

			if(expenseVoucherPaymentDetails != null)
				valueObjectToBLL.put("expenseVoucherPaymentDetails", expenseVoucherPaymentDetails);

			valueObjectToBLL.put("createDate", createDate);

			final var	valueObjFromBLL	= truckHisabSettlementBll.processTruckHisabSettlement(valueObjectToBLL);

			if(valueObjFromBLL == null) {
				request.setAttribute("nextPageToken", "failure");
				outJsonObject.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				return outJsonObject;
			}

			outJsonObject = JsonUtility.convertionToJsonObjectForResponse(valueObjFromBLL);

			if(Utility.getLong(valueObjFromBLL.get("flag"))  > 0 || valueObjFromBLL.get("flag") != null)
				outJsonObject.put("Sucess", "Sucess");

			return outJsonObject;
		}catch(final Exception e){
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private ExpenseVoucherPaymentDetails createExpenseVoucherPaymentDetails(final JSONObject getJsonObject, final short paymentType) throws Exception {
		ExpenseVoucherPaymentDetails	expenseVoucherPaymentDetails	= null;

		try {
			expenseVoucherPaymentDetails	= new ExpenseVoucherPaymentDetails();
			switch (paymentType) {
			case PaymentTypeConstant.PAYMENT_TYPE_CASH_ID -> {
				expenseVoucherPaymentDetails.setPaymentMode(PaymentTypeConstant.PAYMENT_TYPE_CASH_ID);
				expenseVoucherPaymentDetails.setPaymentModeName(PaymentTypeConstant.PAYMENT_TYPE_CASH_NAME);
			}
			case PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID -> {
				expenseVoucherPaymentDetails.setPaymentMode(PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID);
				expenseVoucherPaymentDetails.setPaymentModeName(PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_NAME);

				if (getJsonObject.get("chequeNumber") != null)
					expenseVoucherPaymentDetails.setChequeNumber(getJsonObject.get("chequeNumber").toString());

				if (getJsonObject.get("chequedatepicker") != null)
					expenseVoucherPaymentDetails.setChequeDateTime(DateTimeUtility.appendTimeToDate(getJsonObject.get("chequedatepicker").toString()));

				expenseVoucherPaymentDetails.setBankAccountId(getJsonObject.optLong("bankAccountId", 0L));

				if (getJsonObject.get("bankAccountName") != null)
					expenseVoucherPaymentDetails.setBankAccountName(StringUtils.upperCase(getJsonObject.get("bankAccountName").toString()));

				if (getJsonObject.get("chequeGivenTo") != null)
					expenseVoucherPaymentDetails.setChequeGivenTo(StringUtils.upperCase(getJsonObject.get("chequeGivenTo").toString()));

				if (getJsonObject.get("paymentGivenByBranch") != null)
					expenseVoucherPaymentDetails.setPaymentMadeToBranchId(Utility.getLong(getJsonObject.get("paymentGivenByBranch")));
			}
			case PaymentTypeConstant.PAYMENT_TYPE_LHPV_ADVANCE_CREDIT_ID -> {
				expenseVoucherPaymentDetails.setPaymentMode(PaymentTypeConstant.PAYMENT_TYPE_LHPV_ADVANCE_CREDIT_ID);
				expenseVoucherPaymentDetails.setPaymentModeName(PaymentTypeConstant.PAYMENT_TYPE_LHPV_ADVANCE_CREDIT_NAME);

				if (getJsonObject.get("creditSlipNumber") != null)
					expenseVoucherPaymentDetails.setChequeNumber(getJsonObject.get("creditSlipNumber").toString());

				if (getJsonObject.get("creditdatepicker") != null)
					expenseVoucherPaymentDetails.setChequeDateTime(DateTimeUtility.appendTimeToDate(getJsonObject.get("creditdatepicker").toString()));

				expenseVoucherPaymentDetails.setCreditAccountId(getJsonObject.optLong("creditAccountId", 0));
			}
			default -> {
				expenseVoucherPaymentDetails.setPaymentMode(PaymentTypeConstant.PAYMENT_TYPE_CASH_ID);
				expenseVoucherPaymentDetails.setPaymentModeName(PaymentTypeConstant.PAYMENT_TYPE_CASH_NAME);
			}
			}
			return expenseVoucherPaymentDetails;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public ExpenseVoucherDetails createVoucherDetails(final Executive executive,final long finalTotal,final long totalCount,final String paymentVoucherNumber, final long truckHisabVoucherID, final String truckHisabVoucherNumber) throws Exception {

		ExpenseVoucherDetails voucherDetails = null;

		try {

			voucherDetails = new ExpenseVoucherDetails();

			voucherDetails.setCreationDateTime(DateTimeUtility.getCurrentTimeStamp());
			voucherDetails.setAccountGroupId(executive.getAccountGroupId());
			voucherDetails.setBranchId(executive.getBranchId());
			voucherDetails.setExecutiveId(executive.getExecutiveId());
			voucherDetails.setTotalAmount(finalTotal);
			voucherDetails.setTotalWayBillExpensesCount((short)totalCount);
			voucherDetails.setId(truckHisabVoucherID);
			voucherDetails.setNumber(truckHisabVoucherNumber);
			voucherDetails.setPaymentVoucherNumber(paymentVoucherNumber);
			voucherDetails.setTypeOfExpenseId(TransportCommonMaster.CHARGE_TYPE_OFFICE);
			voucherDetails.setExpenseDateTime(createDate);

			return voucherDetails;

		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private JSONObject getvehicleTypeAndCapacityByVehicleId(final HttpServletRequest request, final JSONObject outJsonObject,
			final JSONObject getJsonObject) throws Exception {
		ValueObject 						valueObjectToBLL 				= null;
		Executive							executive						= null;
		VehicleNumberMaster					vehicleNumberMaster				= null;

		try{
			valueObjectToBLL		= 	 new  ValueObject();

			executive		= (Executive) request.getSession().getAttribute("executive");
			valueObjectToBLL.put("vehicleid", Utility.getLong(getJsonObject.get("VEHICLEID")));
			valueObjectToBLL.put("executive", executive);

			vehicleNumberMaster	= VehicleNumberMasterDao.getInstance().getVehicleTypeDetailsById(executive.getAccountGroupId(), Utility.getLong( getJsonObject.get("VEHICLEID")));

			if(vehicleNumberMaster == null) {
				request.setAttribute("nextPageToken", "failure");
				outJsonObject.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				return outJsonObject;
			}

			outJsonObject.put("vehicleNumberMaster", new JSONObject(vehicleNumberMaster));

			return outJsonObject;
		}catch(final Exception e){
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private JSONObject getTruckHiabDetailsForPrint(final HttpServletRequest request, final JSONObject outJsonObject,
			final JSONObject getJsonObject) throws Exception {
		ValueObject 						valueObjectToBLL 				= null;
		ValueObject 						valueObjFromBLL 				= null;
		Executive							executive						= null;
		TruckHisabSettlementBll				truckHisabSettlementBll			= null;
		CacheManip							cache							= null;
		try{
			valueObjectToBLL		= 	 new  ValueObject();
			truckHisabSettlementBll	= 	 new  TruckHisabSettlementBll();
			cache					= 	 new CacheManip(request);
			executive		= (Executive) request.getSession().getAttribute("executive");
			valueObjectToBLL.put("TruckHisabId", Utility.getLong(getJsonObject.get("TruckHisabId")));

			valueObjectToBLL.put("VehicleId", Utility.getLong(getJsonObject.get("VehicleId")));

			valueObjectToBLL.put("executive", executive);
			valueObjectToBLL.put("genericBranch", cache.getGenericBranchesDetail(request));
			valueObjFromBLL = truckHisabSettlementBll.getTruckHisabDataForPrint(valueObjectToBLL);

			if(valueObjFromBLL == null) {
				request.setAttribute("nextPageToken", "failure");
				outJsonObject.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);

				return outJsonObject;
			}

			return JsonUtility.convertionToJsonObjectForResponse(valueObjFromBLL);
		}catch(final Exception e){
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}


	private JSONObject getExpenseChargeMaster(final HttpServletRequest request, final JSONObject outJsonObject) throws Exception {
		try{
			final var	executive		= (Executive) request.getSession().getAttribute("executive");
			final var	incomeExpenseChargeMaster = IncomeExpenseChargeDao.getInstance().getExpenseChargeMasterId(executive.getAccountGroupId(), IncomeExpenseMappingConstant.TRUCK_HISAB);

			if (incomeExpenseChargeMaster != null)
				outJsonObject.put("incomeExpenseChargeMaster", new JSONObject(incomeExpenseChargeMaster));
			else
				outJsonObject.put("incomeExpenseChargeMaster", JSONObject.NULL);

			outJsonObject.put("executive",new JSONObject(executive));

			return outJsonObject;
		}catch(final Exception e){
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}
}
