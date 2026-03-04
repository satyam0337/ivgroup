package com.ivcargo.reports;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.VehicleConfigHamaliBLL;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.dao.impl.sequencecounter.LoadingHamaliSequenceCounterDaoImpl;
import com.iv.dao.impl.sequencecounter.UnLoadingHamaliSequenceCounterDaoImpl;
import com.iv.dto.constant.IncomeExpenseMappingConstant;
import com.iv.dto.sequencecounter.LoadingHamaliSequenceCounter;
import com.iv.dto.sequencecounter.UnLoadingHamaliSequenceCounter;
import com.iv.logsapp.LogWriter;
import com.iv.utils.CollectionUtility;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.DuplicateTransactionCheckDao;
import com.platform.dao.ExpenseChargeDao;
import com.platform.dto.DispatchLedger;
import com.platform.dto.Executive;
import com.platform.dto.IncomeExpenseChargeMaster;
import com.platform.dto.LoadingHamaliLedger;
import com.platform.dto.TransportCommonMaster;
import com.platform.dto.UnLoadingHamaliLedger;
import com.platform.dto.UnloadingVehicleConfigHamaliSummary;
import com.platform.dto.VehicleConfigHamali;
import com.platform.resource.CargoErrorList;

public class CreateVehicleConfigHamaliAction implements Action {
	int 	totalCount 				= 0;
	int 	indexForVal 			= 0;
	short	hamaliType				= 0;
	double  waraiAmount   					= 0.00;
	double  utraiAmount   					= 0.00;
	double  unloadingAmount					= 0.00;
	double  unloadingHamali   				= 0.00;
	double  unloadingPerTonAmount   		= 0.00;
	double  manualUtraiWeight   			= 0.00;
	double  manualWaraiWeight   			= 0.00;
	double  manualUnLoadingPerTonWeight 	= 0.00;
	double  manualUnLoadingFlatWeight   	= 0.00;
	double  manualUtraiAmount   			= 0.00;
	double  manualWaraiAmount   			= 0.00;
	double  manualUnLoadingPerTonAmount 	= 0.00;
	double  manualUnLoadingFlatAmount   	= 0.00;
	Timestamp 	createDate 			= null;
	int 		arrLength			= 0;

	private static final String TRACE_ID = "CreateVehicleConfigHamaliAction";

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		// TODO Auto-generated method stub
		HashMap<String,Object>	 error 	= null;
		ArrayList<UnloadingVehicleConfigHamaliSummary> unloadVehicleConfigList 		= null;
		UnloadingVehicleConfigHamaliSummary			unloadingVehicleConfig	 		= null;
		VehicleConfigHamali[]				 		vehicleConfigHamali				= null;
		ArrayList<VehicleConfigHamali> 				vehicleConfigList 				= null;
		VehicleConfigHamali 						vehicleConfig	 				= null;
		Executive   								executive 						= null;
		ValueObject									valueInObject					= null;
		VehicleConfigHamaliBLL	     				vehicleConfigBLL				= null;
		var				  						unLoadingHamaliLedgerId 		= 0L;
		var	  									loadingHamaliLedgerId			= 0L;
		String[] 									lhpvArr							= null;
		var      								loadingConfigPerTon				= 0.00;
		var    									unloadingConfigPerTon			= 0.00;
		var     									loadingConfigHamali				= 0.00;
		var     									unloadingConfigHamali			= 0.00;
		var     									bharai							= 0.00;
		var    						  			thappi							= 0.00;
		var     									warai							= 0.00;
		var     								 	utrai							= 0.00;
		LoadingHamaliLedger	  		 				loadingHamaliLedger  			= null;
		LoadingHamaliSequenceCounter 				loadingHamaliSequenceCounter 	= null;
		LoadingHamaliSequenceCounter 				loadingHamaliSeqCounter 		= null;
		var 									isDuplicateNumber 				= false;
		UnLoadingHamaliLedger	  		 			unloadingHamaliLedger  			= null;
		UnLoadingHamaliSequenceCounter 				unLoadingHamaliSequenceCounter 	= null;
		UnLoadingHamaliSequenceCounter 				unLoadingHamaliSeqCounter 		= null;
		String 										hamaliNumber 					= null;
		var 										fromRegionId    				= 0L;
		var 										fromSubRegionId    				= 0L;
		var 										fromBranchId					= 0L;
		Timestamp        							fromDate       					= null;
		Timestamp        							toDate         					= null;
		SimpleDateFormat 							sdf            					= null;
		CacheManip									cache 	        				= null;
		ArrayList<Long>							    dispatchLedgerIdList			= null;
		ArrayList<Long>							    deliveryRunSheetIdList			= null;
		ArrayList<Long>							    receiveLedgerIdList				= null;
		HashMap<Long,IncomeExpenseChargeMaster>			expenseChargeHM							= null;
		IncomeExpenseChargeMaster						expenseCharge							= null;


		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error))
				return;

			valueInObject		= new ValueObject();
			createDate			= new Timestamp(new Date().getTime());
			totalCount			= JSPUtility.GetInt(request, "TotalCount", 0);
			hamaliType			= JSPUtility.GetShort(request, "hamaliType", (short)0);
			lhpvArr				= request.getParameterValues("lhpvIds");
			sdf					= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			fromDate			= new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00").getTime());
			toDate				= new Timestamp(sdf.parse(JSPUtility.GetString(request, "toDate") + " 23:59:59").getTime());
			cache 	       	 	= new CacheManip(request);
			executive 			= cache.getExecutive(request);
			dispatchLedgerIdList = new ArrayList<>();
			deliveryRunSheetIdList = new ArrayList<>();
			receiveLedgerIdList    = new ArrayList<>();

			ActionStaticUtil.executiveTypeWiseBranches(request, cache, executive);

			if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_GROUPADMIN){
				fromRegionId = Long.parseLong(request.getParameter("region"));
				fromSubRegionId = Long.parseLong(request.getParameter("subRegion"));
				fromBranchId = Long.parseLong(request.getParameter("branch"));
			}else if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_REGIONADMIN){
				fromRegionId = executive.getRegionId();
				fromSubRegionId = Long.parseLong(request.getParameter("subRegion"));
				fromBranchId = Long.parseLong(request.getParameter("branch"));
			}else if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_SUBREGIONADMIN){
				fromRegionId = executive.getRegionId();
				fromSubRegionId = executive.getSubRegionId();
				fromBranchId = Long.parseLong(request.getParameter("branch"));
			}else{
				fromRegionId = executive.getRegionId();
				fromSubRegionId = executive.getSubRegionId();
				fromBranchId = executive.getBranchId();
			}


			if(totalCount > 0){
				if(hamaliType == VehicleConfigHamali.VEHICLECONFIGHAMALI_HAMALITYPE_LOADING){

					expenseChargeHM		 	= ExpenseChargeDao.getInstance().getExpenseChargeByMappingChargeIdAndAccountGroupId(executive.getAccountGroupId(), (short)IncomeExpenseMappingConstant.LOADING_HAMALI, TransportCommonMaster.CHARGE_TYPE_OFFICE);
					expenseCharge 		    = expenseChargeHM.get(IncomeExpenseMappingConstant.LOADING_HAMALI);

					if(expenseCharge == null) {
						error.put("errorCode", CargoErrorList.LOADING_HAMALI_EXPENSE_CHARGE_NOT_FOUND);
						error.put("errorDescription", CargoErrorList.LOADING_HAMALI_EXPENSE_CHARGE_NOT_FOUND_DESCRIPTION);
						request.setAttribute("cargoError", error);
						request.setAttribute("nextPageToken", "failure");
						return;
					}

					vehicleConfigList 	= new ArrayList<>();
					for (var i = 0; i < totalCount; i++) {

						bharai							= 0.00;
						thappi							= 0.00;
						loadingConfigPerTon				= 0.00;
						loadingConfigHamali				= 0.00;

						try {
							JSPUtility.GetDouble(request, "manualLoadingHamali_"+lhpvArr[i], 0.00);
							JSPUtility.GetShort(request, "lhpvHamaliDone_"+lhpvArr[i], (short)0);
						} catch(final IndexOutOfBoundsException ex) {
							continue;
						}

						if(JSPUtility.GetDouble(request, "manualLoadingHamali_"+lhpvArr[i], 0.00) > 0
								&& JSPUtility.GetShort(request, "lhpvHamaliDone_"+lhpvArr[i], (short)0) == 0){
							vehicleConfig = new VehicleConfigHamali();

							vehicleConfig.setAccountGroupId(executive.getAccountGroupId());
							vehicleConfig.setLhpvId(JSPUtility.GetLong(request, "lhpvId_"+lhpvArr[i], 0));
							vehicleConfig.setBharaiAmount(JSPUtility.GetDouble(request, "bharaiAmount_"+lhpvArr[i], 0.00));
							vehicleConfig.setThappiAmount(JSPUtility.GetDouble(request, "thappiAmount_"+lhpvArr[i], 0.00));
							vehicleConfig.setLoadingAmount(JSPUtility.GetDouble(request, "loadingAmount_"+lhpvArr[i], 0.00));
							vehicleConfig.setLoadingPerTonAmount(JSPUtility.GetDouble(request, "loadingPerTonAmount_"+lhpvArr[i], 0.00));
							vehicleConfig.setTotalLoadingTimeHamali(JSPUtility.GetDouble(request, "loadingHamali_"+lhpvArr[i], 0));
							vehicleConfig.setTypeOfHamali(JSPUtility.GetShort(request, "typeOfHamali_"+lhpvArr[i], (short)0));
							vehicleConfig.setLhpvNumber(JSPUtility.GetString(request, "lhpvNumber_"+lhpvArr[i], ""));
							vehicleConfig.setSourceBranchId(JSPUtility.GetLong(request, "sourceBranchId_"+lhpvArr[i], 0));
							vehicleConfig.setDestinationBranchId(JSPUtility.GetLong(request, "destinationBranchId_"+lhpvArr[i], 0));
							vehicleConfig.setVehicleNumber(JSPUtility.GetString(request, "vehicleNumber_"+lhpvArr[i], ""));
							vehicleConfig.setVehicleNumberId(JSPUtility.GetLong(request, "vehicleNumberId_"+lhpvArr[i], 0));
							vehicleConfig.setVehicleOwner(JSPUtility.GetShort(request, "vehicleOwnerId_"+lhpvArr[i], (short)0));
							vehicleConfig.setOwnerName(JSPUtility.GetString(request, "ownerName_"+lhpvArr[i], ""));
							vehicleConfig.setCapacity(JSPUtility.GetDouble(request, "capacity_"+lhpvArr[i], 0.00));
							vehicleConfig.setActualWeight(JSPUtility.GetDouble(request, "actualWeight_"+lhpvArr[i], 0.00));
							vehicleConfig.setExecutiveId(executive.getExecutiveId());
							vehicleConfig.setBranchId(executive.getBranchId());
							vehicleConfig.setCreationDateTime(createDate);
							vehicleConfig.setLsNumbers(JSPUtility.GetString(request, "lsNumbers_"+lhpvArr[i], ""));
							vehicleConfig.setLhpvHamaliDone(JSPUtility.GetShort(request, "lhpvHamaliDone_"+lhpvArr[i], (short)0));
							vehicleConfig.setManualBharaiWeight(JSPUtility.GetDouble(request, "manualBharaiWeight_"+lhpvArr[i], 0.00));
							vehicleConfig.setManualThappiWeight(JSPUtility.GetDouble(request, "manualThappiWeight_"+lhpvArr[i], 0.00));
							vehicleConfig.setManualPerTonWeight(JSPUtility.GetDouble(request, "manualLoadingPerTonWeight_"+lhpvArr[i], 0.00));
							vehicleConfig.setManualFlatWeight(JSPUtility.GetDouble(request, "manualFlatWeight_"+lhpvArr[i], 0.00));
							vehicleConfig.setDispatchLedgerId(JSPUtility.GetLong(request, "dispatchLedgerId_"+lhpvArr[i], 0));
							vehicleConfig.setLsNumber(JSPUtility.GetString(request, "lsNumber_"+lhpvArr[i], ""));
							vehicleConfig.setTypeOfLS(JSPUtility.GetShort(request, "typeOfLS_"+lhpvArr[i], (short)0));
							vehicleConfig.setLoadingRemark(JSPUtility.GetString(request, "lsWiseNewRemark_"+lhpvArr[i],null));

							if("".equals(vehicleConfig.getLoadingRemark()))
								vehicleConfig.setLoadingRemark(null);

							bharai = JSPUtility.GetDouble(request, "bharai_"+lhpvArr[i], 0.00);
							thappi = JSPUtility.GetDouble(request, "thappi_"+lhpvArr[i], 0.00);
							loadingConfigPerTon = JSPUtility.GetDouble(request, "loadingConfigPerTon_"+lhpvArr[i], 0.00);
							loadingConfigHamali = JSPUtility.GetDouble(request, "loadingConfigHamali_"+lhpvArr[i], 0.00);

							vehicleConfig.setManualBharaiAmount(vehicleConfig.getManualBharaiWeight() * bharai / 1000);
							vehicleConfig.setManualThappiAmount(vehicleConfig.getManualThappiWeight() * thappi / 1000);
							vehicleConfig.setManualPerTonAmount(vehicleConfig.getManualPerTonWeight() * loadingConfigPerTon / 1000);

							if(vehicleConfig.getManualFlatWeight() > 0)
								vehicleConfig.setManualFlatAmount(loadingConfigHamali);

							vehicleConfig.setTotalActualLoadingHamali(vehicleConfig.getManualBharaiAmount() + vehicleConfig.getManualThappiAmount()
							+ vehicleConfig.getManualPerTonAmount() +vehicleConfig.getManualFlatAmount());

							if(vehicleConfig.getLhpvHamaliDone() == 0 && vehicleConfig.getTotalActualLoadingHamali() > 0) {
								vehicleConfigList.add(vehicleConfig);
								if(vehicleConfig.getTypeOfLS() == DispatchLedger.TYPE_OF_LS_ID_DDM)
									deliveryRunSheetIdList.add(vehicleConfig.getDispatchLedgerId());
								else
									dispatchLedgerIdList.add(vehicleConfig.getDispatchLedgerId());
							}
						}
					}

					if(vehicleConfigList.isEmpty())
						response.sendRedirect("CreateVehicleConfigHamali.do?pageId=0&eventId=1&filter=17");

					vehicleConfigHamali  = new VehicleConfigHamali[vehicleConfigList.size()];
					vehicleConfigList.toArray(vehicleConfigHamali);

					loadingHamaliSeqCounter = new LoadingHamaliSequenceCounter();
					loadingHamaliSeqCounter.setAccountGroupId(executive.getAccountGroupId());
					loadingHamaliSeqCounter.setBranchId(executive.getBranchId());

					loadingHamaliSequenceCounter = LoadingHamaliSequenceCounterDaoImpl.getInstance().getLoadingHamaliSequenceCounter(loadingHamaliSeqCounter);

					if (loadingHamaliSequenceCounter == null) {
						error.put("errorCode", CargoErrorList.LOADING_HAMALI_ERROR);
						error.put("errorDescription", CargoErrorList.LOADING_HAMALI_ERROR_DESCRIPTION);
						request.setAttribute("cargoError", error);
						request.setAttribute("nextPageToken", "failure");
						return;

					}
					if (loadingHamaliSequenceCounter.getSequenceCounterTypeId() == LoadingHamaliSequenceCounter.RANGE_INCREMENT
							&& (loadingHamaliSequenceCounter.getNextVal() < loadingHamaliSequenceCounter.getMinRange() || loadingHamaliSequenceCounter.getNextVal() > loadingHamaliSequenceCounter.getMaxRange())) {
						error.put("errorCode", CargoErrorList.LOADING_HAMALI_ERROR_OVER);
						error.put("errorDescription", CargoErrorList.LOADING_HAMALI_ERROR_OVER_DESCRIPTION);
						request.setAttribute("cargoError", error);
						request.setAttribute("nextPageToken", "failure");
						return;
					}
					if(loadingHamaliSequenceCounter.getNextVal() > 0 ) {
						hamaliNumber = Long.toString(loadingHamaliSequenceCounter.getNextVal());
						isDuplicateNumber =   DuplicateTransactionCheckDao.getInstance().checkDuplicateTxnForFinancialYear(hamaliNumber, loadingHamaliSequenceCounter.getBranchId(), loadingHamaliSequenceCounter.getAccountGroupId(), (short)27,createDate);
					}
					if(isDuplicateNumber) {
						error.put("errorCode", CargoErrorList.LOADING_HAMALI_DUPLICATE_ERROR);
						error.put("errorDescription", CargoErrorList.LOADING_HAMALI_DUPLICATE_ERROR_DESCRIPTION);
						request.setAttribute("cargoError", error);
						request.setAttribute("nextPageToken", "failure");
						return;
					}

					loadingHamaliLedger = new LoadingHamaliLedger();

					loadingHamaliLedger.setAccountGroupId(executive.getAccountGroupId());
					loadingHamaliLedger.setBranchId(executive.getBranchId());
					loadingHamaliLedger.setExecutiveId(executive.getExecutiveId());
					loadingHamaliLedger.setCreationDateTime(DateTimeUtility.getCurrentTimeStamp());
					loadingHamaliLedger.setLoadingHamaliNumber(Long.toString(loadingHamaliSequenceCounter.getNextVal()));
					loadingHamaliLedger.setRemark(JSPUtility.GetString(request, "remark", null));
					if("".equals(loadingHamaliLedger.getRemark()))
						loadingHamaliLedger.setRemark(null);
					loadingHamaliLedger.setFromRegionId(fromRegionId);
					loadingHamaliLedger.setFromSubRegionId(fromSubRegionId);
					loadingHamaliLedger.setFromBranchId(fromBranchId);
					loadingHamaliLedger.setFromDate(fromDate);
					loadingHamaliLedger.setToDate(toDate);
					valueInObject.put("loadingHamaliLedger", loadingHamaliLedger);
					valueInObject.put("VehicleConfigHamali", vehicleConfigHamali);
					valueInObject.put("dispatchLedgerIds", CollectionUtility.getStringFromLongList(dispatchLedgerIdList));
					valueInObject.put("deliveryRunSheetIds", CollectionUtility.getStringFromLongList(deliveryRunSheetIdList));
					valueInObject.put("executive", executive);

				} else if(hamaliType == VehicleConfigHamali.VEHICLECONFIGHAMALI_HAMALITYPE_UNLOADING){

					expenseChargeHM		 	= ExpenseChargeDao.getInstance().getExpenseChargeByMappingChargeIdAndAccountGroupId(executive.getAccountGroupId(), (short)IncomeExpenseMappingConstant.UNLOADING_HAMALI, TransportCommonMaster.CHARGE_TYPE_OFFICE);
					expenseCharge 		    = expenseChargeHM.get(IncomeExpenseMappingConstant.UNLOADING_HAMALI);

					if(expenseCharge == null) {
						error.put("errorCode", CargoErrorList.UNLOADING_HAMALI_EXPENSE_CHARGE_NOT_FOUND);
						error.put("errorDescription", CargoErrorList.UnLOADING_HAMALI_EXPENSE_CHARGE_NOT_FOUND_DESCRIPTION);
						request.setAttribute("cargoError", error);
						request.setAttribute("nextPageToken", "failure");
						return;
					}

					unloadVehicleConfigList = new ArrayList<>();

					for (var i = 0; i < totalCount; i++) {

						indexForVal = i + 1;
						unloadingConfigPerTon			= 0.00;
						unloadingConfigHamali			= 0.00;
						warai							= 0.00;
						utrai							= 0.00;
						manualWaraiAmount 				= 0.00;
						manualUtraiAmount 				= 0.00;
						manualUtraiWeight				= 0.00;
						manualWaraiWeight				= 0.00;
						manualUnLoadingFlatWeight	 	= 0.00;
						manualUnLoadingPerTonWeight	 	= 0.00;
						manualUnLoadingPerTonAmount		= 0.00;
						manualUnLoadingFlatAmount		= 0.00;


						if(JSPUtility.GetDouble(request, "manualUnLoadingHamali_"+indexForVal, 0.00) > 0
								&& JSPUtility.GetDouble(request, "hamaliDone_"+indexForVal, 0.00) == 0){
							waraiAmount 			= JSPUtility.GetDouble(request, "waraiAmount_"+indexForVal, 0.00);
							utraiAmount 			= JSPUtility.GetDouble(request, "utraiAmount_"+indexForVal, 0.00);
							unloadingAmount 		= JSPUtility.GetDouble(request, "unloadingAmount_"+indexForVal, 0.00);
							unloadingPerTonAmount 	= JSPUtility.GetDouble(request, "unloadingPerTonAmount_"+indexForVal, 0.00);
							unloadingHamali 		= JSPUtility.GetDouble(request, "unloadingHamali_"+indexForVal, 0.00);
							manualUtraiWeight	 	= JSPUtility.GetDouble(request, "manualUtraiWeight_"+indexForVal, 0.00);
							manualWaraiWeight	 	= JSPUtility.GetDouble(request, "manualWaraiWeight_"+indexForVal, 0.00);
							manualUnLoadingFlatWeight	 = JSPUtility.GetDouble(request, "manualUnLoadingFlatWeight_"+indexForVal, 0.00);
							manualUnLoadingPerTonWeight	 = JSPUtility.GetDouble(request, "manualUnLoadingPerTonWeight_"+indexForVal, 0.00);

							warai = JSPUtility.GetDouble(request, "warai_"+indexForVal, 0.00);
							utrai = JSPUtility.GetDouble(request, "utrai_"+indexForVal, 0.00);
							unloadingConfigPerTon = JSPUtility.GetDouble(request, "unloadingConfigPerTon_"+indexForVal, 0.00);
							unloadingConfigHamali = JSPUtility.GetDouble(request, "unloadingConfigHamali_"+indexForVal, 0.00);

							manualWaraiAmount = manualWaraiWeight * warai/ 1000;
							manualUtraiAmount = manualUtraiWeight * utrai/ 1000;
							manualUnLoadingPerTonAmount = manualUnLoadingPerTonWeight * unloadingConfigPerTon/ 1000;
							if(manualUnLoadingFlatWeight > 0)
								manualUnLoadingFlatAmount = unloadingConfigHamali;
							unloadingVehicleConfig = new UnloadingVehicleConfigHamaliSummary();
							setUnLoadingConfigHamaliSummary(request,unloadingVehicleConfig,indexForVal, executive);
							unloadVehicleConfigList.add(unloadingVehicleConfig);

							receiveLedgerIdList.add(unloadingVehicleConfig.getReceivedLedgerId());
						}
					}
					if(unloadVehicleConfigList.isEmpty())
						response.sendRedirect("CreateVehicleConfigHamali.do?pageId=0&eventId=1&filter=17");

					unLoadingHamaliSeqCounter = new UnLoadingHamaliSequenceCounter();
					unLoadingHamaliSeqCounter.setAccountGroupId(executive.getAccountGroupId());
					unLoadingHamaliSeqCounter.setBranchId(executive.getBranchId());

					unLoadingHamaliSequenceCounter = UnLoadingHamaliSequenceCounterDaoImpl.getInstance().getUnLoadingHamaliSequenceCounter(unLoadingHamaliSeqCounter);

					if (unLoadingHamaliSequenceCounter == null) {
						error.put("errorCode", CargoErrorList.UNLOADING_HAMALI_ERROR);
						error.put("errorDescription", CargoErrorList.UNLOADING_HAMALI_ERROR_DESCRIPTION);
						request.setAttribute("cargoError", error);
						request.setAttribute("nextPageToken", "failure");
						return;

					}
					if (unLoadingHamaliSequenceCounter.getSequenceCounterTypeId() == unLoadingHamaliSequenceCounter.RANGE_INCREMENT
							&& (unLoadingHamaliSequenceCounter.getNextVal() < unLoadingHamaliSequenceCounter.getMinRange() || unLoadingHamaliSequenceCounter.getNextVal() > unLoadingHamaliSequenceCounter.getMaxRange())) {
						error.put("errorCode", CargoErrorList.UNLOADING_HAMALI_ERROR_OVER);
						error.put("errorDescription", CargoErrorList.UNLOADING_HAMALI_ERROR_OVER_DESCRIPTION);
						request.setAttribute("cargoError", error);
						request.setAttribute("nextPageToken", "failure");
						return;
					}
					if(unLoadingHamaliSequenceCounter.getNextVal() > 0 ) {
						hamaliNumber = Long.toString(unLoadingHamaliSequenceCounter.getNextVal());
						isDuplicateNumber =   DuplicateTransactionCheckDao.getInstance().checkDuplicateTxnForFinancialYear(hamaliNumber, unLoadingHamaliSequenceCounter.getBranchId(), unLoadingHamaliSequenceCounter.getAccountGroupId(), (short)28,createDate);
					}
					if(isDuplicateNumber) {
						error.put("errorCode", CargoErrorList.UNLOADING_HAMALI_DUPLICATE_ERROR);
						error.put("errorDescription", CargoErrorList.UNLOADING_HAMALI_DUPLICATE_ERROR_DESCRIPTION);
						request.setAttribute("cargoError", error);
						request.setAttribute("nextPageToken", "failure");
						return;
					}

					unloadingHamaliLedger = new UnLoadingHamaliLedger();

					unloadingHamaliLedger.setAccountGroupId(executive.getAccountGroupId());
					unloadingHamaliLedger.setBranchId(executive.getBranchId());
					unloadingHamaliLedger.setExecutiveId(executive.getExecutiveId());
					unloadingHamaliLedger.setCreationDateTime(DateTimeUtility.getCurrentTimeStamp());
					unloadingHamaliLedger.setUnLoadingHamaliNumber(Long.toString(unLoadingHamaliSequenceCounter.getNextVal()));
					unloadingHamaliLedger.setRemark(JSPUtility.GetString(request, "remark", null));

					if(unloadingHamaliLedger.getRemark() == null || "".equals(unloadingHamaliLedger.getRemark()))
						unloadingHamaliLedger.setRemark(null);
					unloadingHamaliLedger.setFromRegionId(fromRegionId);
					unloadingHamaliLedger.setFromSubRegionId(fromSubRegionId);
					unloadingHamaliLedger.setFromBranchId(fromBranchId);
					unloadingHamaliLedger.setFromDate(fromDate);
					unloadingHamaliLedger.setToDate(toDate);
					valueInObject.put("unloadingHamaliLedger", unloadingHamaliLedger);
					valueInObject.put("unloadVehicleConfigList", unloadVehicleConfigList);
					valueInObject.put("receiveLedgerIds", CollectionUtility.getStringFromLongList(receiveLedgerIdList));
					valueInObject.put("executive", executive);
				}
				vehicleConfigBLL = new VehicleConfigHamaliBLL();

				valueInObject.put("expenseChargeMasterId", expenseCharge.getIncomeExpenseChargeMasterId());
				if(hamaliType == VehicleConfigHamali.VEHICLECONFIGHAMALI_HAMALITYPE_LOADING){
					loadingHamaliLedgerId = vehicleConfigBLL.vehicleConfigProcess(valueInObject);

					if(loadingHamaliLedgerId > 0)
						response.sendRedirect("BillAfterCreation.do?pageId=249&eventId=4&successMsgAfterVehicleConfigClear="+loadingHamaliLedgerId+"&loadingHamaliNumber="+hamaliNumber);
					else {
						error.put("errorCode", CargoErrorList.BILL_CLEARANCE_ERROR);
						error.put("errorDescription", CargoErrorList.BILL_CLEARANCE_ERROR_DESCRIPTION);
						request.setAttribute("cargoError", error);
						request.setAttribute("nextPageToken", "failure");
					}
				} else if(hamaliType == VehicleConfigHamali.VEHICLECONFIGHAMALI_HAMALITYPE_UNLOADING){
					unLoadingHamaliLedgerId = vehicleConfigBLL.unloadingVehicleConfigProcess(valueInObject);

					if(unLoadingHamaliLedgerId > 0)
						response.sendRedirect("BillAfterCreation.do?pageId=249&eventId=4&successMsgAfterUnloadingVehicleConfigClear="+unLoadingHamaliLedgerId+"&unLoadingHamaliNumber="+hamaliNumber);
					else {
						error.put("errorCode", CargoErrorList.BILL_CLEARANCE_ERROR);
						error.put("errorDescription", CargoErrorList.BILL_CLEARANCE_ERROR_DESCRIPTION);
						request.setAttribute("cargoError", error);
						request.setAttribute("nextPageToken", "failure");
					}
				}
			} else {
				error.put("errorCode", CargoErrorList.BILL_CLEARANCE_ERROR);
				error.put("errorDescription", CargoErrorList.BILL_CLEARANCE_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
				request.setAttribute("nextPageToken", "failure");
			}
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		} finally {
			executive 				= null;
			unloadVehicleConfigList = null;
			unloadingVehicleConfig	= null;
			vehicleConfigHamali		= null;
			vehicleConfigList 		= null;
			vehicleConfig	 		= null;
			valueInObject			= null;
			vehicleConfigBLL		= null;
		}
	}


	private void setUnLoadingConfigHamaliSummary(final HttpServletRequest request, final UnloadingVehicleConfigHamaliSummary summary, final int indexForVal, final Executive executive) {

		try {

			summary.setAccountGroupId(executive.getAccountGroupId());
			summary.setTypeOfHamali(JSPUtility.GetShort(request, "typeOfHamali_"+indexForVal, (short)0));
			summary.setVehicleNumber(JSPUtility.GetString(request, "vehicleNumber_"+indexForVal, ""));
			summary.setVehicleNumberId(JSPUtility.GetLong(request, "vehicleNumberId_"+indexForVal, 0));
			summary.setVehicleOwner(JSPUtility.GetShort(request, "vehicleOwnerId_"+indexForVal, (short)0));
			summary.setOwnerName(JSPUtility.GetString(request, "ownerName_"+indexForVal, ""));
			summary.setCapacity(JSPUtility.GetDouble(request, "capacity_"+indexForVal, 0.00));
			summary.setExecutiveId(executive.getExecutiveId());
			summary.setBranchId(executive.getBranchId());
			summary.setCreationDateTime(createDate);
			summary.setReceivedLedgerId(JSPUtility.GetLong(request, "receivedLedgerIds_"+indexForVal, 0));
			summary.setTotalActualUnloadingHamali(manualUtraiAmount + manualWaraiAmount +manualUnLoadingPerTonAmount + manualUnLoadingFlatAmount);
			summary.setTotalUnloadingHamali(unloadingHamali);
			summary.setSourceBranchId(JSPUtility.GetLong(request, "sourceBranchId_"+indexForVal, 0));
			summary.setDestinationBranchId(JSPUtility.GetLong(request, "destinationBranchId_"+indexForVal, 0));
			summary.setActualWeight(JSPUtility.GetDouble(request, "actualWeight_"+indexForVal, 0.00));
			summary.setTURNumber(JSPUtility.GetString(request, "turNumber_"+indexForVal, ""));
			summary.setManualUtraiWeight(manualUtraiWeight);
			summary.setManualWaraiWeight(manualWaraiWeight);
			summary.setManualUnLoadingPerTonWeight(manualUnLoadingPerTonWeight);
			summary.setManualUnLoadingFlatWeight(manualUnLoadingFlatWeight);
			summary.setWaraiAmount(waraiAmount);
			summary.setUtraiAmount(utraiAmount);
			summary.setUnLoadingAmount(unloadingAmount);
			summary.setUnloadingPerTonAmount(unloadingPerTonAmount);
			summary.setManualWaraiAmount(manualWaraiAmount );
			summary.setManualUtraiAmount(manualUtraiAmount);
			summary.setManualUnLoadingPerTonAmount(manualUnLoadingPerTonAmount);
			summary.setManualUnLoadingFlatAmount(manualUnLoadingFlatAmount);
			summary.setHamaliDone(JSPUtility.GetShort(request, "hamaliDone_"+indexForVal, (short)0));
			summary.setUnLoadingRemark(JSPUtility.GetString(request, "lsWiseNewRemark_"+indexForVal,null));

			if("".equals(summary.getUnLoadingRemark()))
				summary.setUnLoadingRemark(null);
		} catch (final Exception e) {
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, e);
			e.printStackTrace();
		}
	}
}