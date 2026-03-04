package com.ivcargo.actions.transport;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.LHPVBLL;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.bll.tds.impl.TDSTxnDetailsBllImpl;
import com.iv.constant.properties.TDSPropertiesConstant;
import com.iv.constant.properties.lhpv.LHPVPropertiesConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.logsapp.LogWriter;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.exception.ExceptionProcess;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.AliasNameConstants;
import com.platform.dto.Branch;
import com.platform.dto.ConfigParam;
import com.platform.dto.Executive;
import com.platform.dto.SubRegion;
import com.platform.resource.CargoErrorList;
import com.platform.utils.PropertiesUtility;
import com.platform.utils.TokenGenerator;

public class InitializeCreateLHPVAction implements Action {

	private static final String TRACE_ID = "InitializeCreateLHPVAction";

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {

		HashMap<String,Object>	 				error 								= null;
		Executive								executive							= null;
		CacheManip								cache   							= null;
		HashMap<Long, Branch> 					allGroupBranches 					= null;
		HashMap<Long, Branch> 					physicalBranches 					= null;
		LHPVBLL									createLHPVBll						= null;
		ValueObject								valueInObject						= null;
		ValueObject								valueOutObject						= null;
		Map<Object, Object>						configuration			    		= null;
		boolean									isSeqCounterPresent					= false;
		boolean									srcDestWiseSeqCounter				= false;
		boolean 								isAllowManualLHPVWithoutSeqCounter 	= false;
		boolean 								isDisplayUnladenWeight				= false;
		boolean									isLHPVAdvanceAmountChecking			= true;
		boolean									isOnlyPhysicalBranchShowInBalancePaybalAt	= true;
		boolean									hideMannualLhpvSequenceMsg			= true;
		boolean									showSingleBranchInBalancePayableAt	= false;
		boolean									isAutomaticSelectCreateLhpv			= false;
		boolean									isTruckLoadTypeRequired				= false;
		boolean									isRatePmtPlaceChangeRequire			= false;
		Map<Object, Object>						tdsConfiguration					= null;
		boolean									sameSequenceForLsAndLhpv			= false;
		long									unloadingCrossingBranchId			= 0;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error))
				return;

			cache						= new CacheManip(request);
			executive					= cache.getExecutive(request);
			createLHPVBll 				= new LHPVBLL();
			valueInObject 				= new ValueObject();

			configuration								= cache.getLhpvConfiguration(request, executive.getAccountGroupId());
			tdsConfiguration							= cache.getTDSConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.LHPV);
			isAllowManualLHPVWithoutSeqCounter			= PropertiesUtility.isAllow(configuration.get(LHPVPropertiesConstant.ALLOW_MANUAL_LHPV_WITHOUT_SEQCOUNTER)+"");
			isDisplayUnladenWeight						= (Boolean) configuration.getOrDefault(LHPVPropertiesConstant.DISPLAY_UNLADEN_WEIGHT_INPUT_FIELD, false);
			isLHPVAdvanceAmountChecking					= (Boolean) configuration.getOrDefault(LHPVPropertiesConstant.LHPV_ADVANCE_AMOUNT_CHECKING, false);
			isOnlyPhysicalBranchShowInBalancePaybalAt	= (Boolean) configuration.getOrDefault(LHPVPropertiesConstant.IS_ONLY_PHYSICAL_BRANCH_SHOW_IN_BALANCE_PAYBAL_AT, false);
			srcDestWiseSeqCounter						= (Boolean) configuration.getOrDefault(LHPVPropertiesConstant.SRC_DEST_WISE_SEQ_COUNTER,false);
			hideMannualLhpvSequenceMsg					= (Boolean) configuration.getOrDefault(LHPVPropertiesConstant.HIDE_MANNUAL_LHPV_SEQUENCE_MSG, false);
			showSingleBranchInBalancePayableAt			= (Boolean) configuration.getOrDefault(LHPVPropertiesConstant.SHOW_SINGLE_BRANCH_IN_BALANCE_PAYABLE_AT, false);
			isAutomaticSelectCreateLhpv					= (Boolean) configuration.getOrDefault(LHPVPropertiesConstant.IS_AUTOMATIC_SELECT_CREATE_LHPV, false);
			isTruckLoadTypeRequired						= (Boolean) configuration.getOrDefault(LHPVPropertiesConstant.IS_TRUCK_LOAD_TYPE_REQUIRED,false);
			isRatePmtPlaceChangeRequire					= (Boolean) configuration.getOrDefault(LHPVPropertiesConstant.IS_RATE_PMT_PLACE_CHANGE_REQUIRE,false);
			sameSequenceForLsAndLhpv					= (Boolean) configuration.getOrDefault(LHPVPropertiesConstant.SAME_SEQUENCE_FOR_LS_AND_LHPV,false);
			unloadingCrossingBranchId					= JSPUtility.GetLong(request, "unloadingCrossingBranchId",0);

			allGroupBranches	= getAllGroupBranchList(request, executive, configuration);
			physicalBranches 	= getPhysicalBranchList(request, executive, configuration);

			valueInObject.put("executive", executive);

			checkForManualLHPVDays(executive,request,cache);

			valueOutObject = createLHPVBll.initializeLHPVAction(valueInObject);

			if(valueOutObject.get("stringForChargenames")!= null){
				forwardErrorChargesMissing(error, request, (String) valueOutObject.get("stringForChargenames"));
				return;
			}
			/**
			 * Here we are checking Sequence counter is present or not
			 * & setting flag accordingly
			 */
			if(valueOutObject.get("lhpvSequenceCounter")!=null){
				request.setAttribute("LHPVSequenceCounter", valueOutObject.get("lhpvSequenceCounter"));
				isSeqCounterPresent = true;
			} else
				isSeqCounterPresent = false;

			request.setAttribute(AliasNameConstants.TDS_CHARGE_ARRAY, TDSTxnDetailsBllImpl.getTDSChargesList(tdsConfiguration));
			request.setAttribute("lhpvChargesHshmp", valueOutObject.get("lhpvChargesHshmp"));
			request.setAttribute("lhpvLryHirChrgHshmp", valueOutObject.get("lhpvLryHirChrgHshmp"));
			request.setAttribute("lhpvStatChrgHshmp", valueOutObject.get("lhpvStatChrgHshmp"));
			request.setAttribute("lhpvAddChrgHshmp", valueOutObject.get("lhpvAddChrgHshmp"));
			request.setAttribute("lhpvSubChrgHshmp", valueOutObject.get("lhpvSubChrgHshmp"));
			request.setAttribute("lhpvratepertonChrgHshmp", valueOutObject.get("lhpvratepertonChrgHshmp"));
			request.setAttribute("CityListForLHPV", getAllSubRegionList(request ,executive));
			request.setAttribute("subRegionForGroup", cache.getSubRegionsByGroupId(request, executive.getAccountGroupId()));
			request.setAttribute("allGroupBranches", allGroupBranches);
			request.setAttribute("physicalBranches", physicalBranches);
			request.setAttribute("VehicleDetails", false);
			request.setAttribute("isSeqCounterPresent", isSeqCounterPresent);
			request.setAttribute("isAllowManualLHPVWithoutSeqCounter", isAllowManualLHPVWithoutSeqCounter);
			request.setAttribute("nextPageToken", "success");
			request.setAttribute("isDisplayUnladenWeight", isDisplayUnladenWeight);
			request.setAttribute("isLHPVAdvanceAmountChecking", isLHPVAdvanceAmountChecking);
			request.setAttribute("isOnlyPhysicalBranchShowInBalancePaybalAt", isOnlyPhysicalBranchShowInBalancePaybalAt);
			request.setAttribute("srcDestWiseSeqCounter", srcDestWiseSeqCounter);
			request.setAttribute("hideMannualLhpvSequenceMsg", hideMannualLhpvSequenceMsg);
			request.setAttribute("HOBranchId", Branch.BRANCH_ID_AAKASH_HO);
			request.setAttribute("showSingleBranchInBalancePayableAt", showSingleBranchInBalancePayableAt);
			request.setAttribute("isAutomaticSelectCreateLhpv", isAutomaticSelectCreateLhpv);
			request.setAttribute("isTruckLoadTypeRequired", isTruckLoadTypeRequired);
			request.setAttribute("isRatePmtPlaceChangeRequire", isRatePmtPlaceChangeRequire);
			request.setAttribute("sameSequenceForLsAndLhpv", sameSequenceForLsAndLhpv);
			request.setAttribute("unloadingCrossingBranchId", unloadingCrossingBranchId);
			
			if((Boolean) configuration.getOrDefault(LHPVPropertiesConstant.TOKEN_WISE_CHECKING_FOR_DUPLICATE_TRANSACTION,false)) {
				final String token = TokenGenerator.nextToken();
				request.setAttribute(TokenGenerator.LHPV_TOKEN_KEY, token);
				request.getSession().setAttribute(TokenGenerator.LHPV_TOKEN_KEY, token);
			}

			if(tdsConfiguration != null) {
				request.setAttribute(TDSPropertiesConstant.IS_TDS_ALLOW, tdsConfiguration.getOrDefault(TDSPropertiesConstant.IS_TDS_ALLOW, false));
				request.setAttribute(TDSPropertiesConstant.IS_TDS_IN_PERCENT_ALLOW, tdsConfiguration.getOrDefault(TDSPropertiesConstant.IS_TDS_IN_PERCENT_ALLOW, false));
			}

		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}
	}

	private void checkForManualLHPVDays(Executive executive, HttpServletRequest request, CacheManip cache)throws Exception {
		try {
			request.setAttribute("ManualLHPVDaysAllowed",(int)cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_MAX_DAYS_OF_OPERATION_BEFORE_CASHSTATEMENT_ENTRY_ID));
		} catch (final Exception e) {
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, "ERROR : "+e.getMessage());
			throw e;
		}
	}

	private void forwardErrorChargesMissing(HashMap<String, Object> error, HttpServletRequest request, String missingCharges)throws Exception {

		try {
			error.put("errorCode", CargoErrorList.LORRY_HIRE_CHARGES_MISSING);
			error.put("errorDescription", CargoErrorList.LORRY_HIRE_CHARGES_MISSING_DESCRIPTION+" : "+	missingCharges);
			LogWriter.writeLog("LOGINVALIDATOR", LogWriter.LOG_LEVEL_ERROR, CargoErrorList.LORRY_HIRE_CHARGES_MISSING + ""+CargoErrorList.LORRY_HIRE_CHARGES_MISSING_DESCRIPTION+" : "+	missingCharges);
			request.setAttribute("cargoError", error);
			request.setAttribute("nextPageToken", "failure");
		} catch (final Exception e) {
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, "ERROR : "+e.getMessage());
			throw e;
		}
	}


	private HashMap<Long, String> getAllSubRegionList(HttpServletRequest request ,Executive executive) throws Exception {
		SubRegion[] 			subRegionForGroup 	= null;
		ValueObject 			subRegions 			= null;
		HashMap<Long, String> 	subRegionList 		= null;
		SubRegion				subRegion			= null;
		CacheManip				cacheManip			= null;

		try {

			cacheManip			= new CacheManip(request);
			subRegionForGroup 	= cacheManip.getSubRegionsByGroupId(request, executive.getAccountGroupId());
			subRegions 			= cacheManip.getAllSubRegions(request);
			subRegionList 		= new LinkedHashMap<>();

			for (final SubRegion element : subRegionForGroup) {
				subRegion		= (SubRegion) subRegions.get(element.getSubRegionId());

				if(subRegion != null)
					subRegionList.put(element.getSubRegionId(), subRegion.getName());
			}

			return subRegionList;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		} finally {
			subRegionForGroup 	= null;
			subRegion 			= null;
			subRegions 			= null;
			subRegionList 		= null;
		}
	}

	private HashMap<Long, Branch> getAllGroupBranchList(HttpServletRequest request, Executive executive, Map<Object, Object> configuration) throws Exception {
		CacheManip					cacheManip					= null;
		HashMap<Long, Branch> 		allGroupBranches 			= null;
		HashMap<Long, Branch> 		allGroupBranchList 			= null;
		Branch						branch						= null;
		boolean						isOnlyPhysicalBranchShow	= false;

		try {
			cacheManip			= new CacheManip(request);
			allGroupBranchList	= new HashMap<>();

			isOnlyPhysicalBranchShow		= (Boolean) configuration.getOrDefault(LHPVPropertiesConstant.IS_ONLY_PHYSICAL_BRANCH_SHOW, false);

			allGroupBranches 	= cacheManip.getAllGroupBranches(request, executive.getAccountGroupId());

			for(final Long key : allGroupBranches.keySet()) {
				branch = allGroupBranches.get(key);

				if(branch.getStatus() == Branch.BRANCH_ACTIVE)
					if(isOnlyPhysicalBranchShow) {
						if(branch.getTypeOfLocation() == Branch.TYPE_OF_LOCATION_PHYSICAL)
							allGroupBranchList.put(branch.getBranchId(), branch);
					} else
						allGroupBranchList.put(branch.getBranchId(), branch);
			}

			return allGroupBranchList;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		} finally {
			allGroupBranchList	 		= null;
			allGroupBranches 			= null;
			branch						= null;
		}
	}

	private HashMap<Long, Branch> getPhysicalBranchList(HttpServletRequest request, Executive executive, Map<Object, Object> configuration) throws Exception {
		CacheManip					cacheManip					= null;
		HashMap<Long, Branch> 		physicalBranches 			= null;
		HashMap<Long, Branch> 		physicalBranchList 			= null;
		Branch						branch						= null;
		boolean						isOnlyPhysicalBranchShowInBalancePaybalAt	= false;
		boolean						showSingleBranchInBalancePayableAt			= false;

		try {
			cacheManip			= new CacheManip(request);
			physicalBranchList	= new HashMap<>();

			isOnlyPhysicalBranchShowInBalancePaybalAt		= (Boolean) configuration.getOrDefault(LHPVPropertiesConstant.IS_ONLY_PHYSICAL_BRANCH_SHOW_IN_BALANCE_PAYBAL_AT, false);
			showSingleBranchInBalancePayableAt				= (Boolean) configuration.getOrDefault(LHPVPropertiesConstant.SHOW_SINGLE_BRANCH_IN_BALANCE_PAYABLE_AT, false);
			physicalBranches 	= cacheManip.getAllGroupBranches(request, executive.getAccountGroupId());

			if(showSingleBranchInBalancePayableAt){
				final long HOBranchId = 12499;
				branch = physicalBranches.get(HOBranchId);

				if(branch.getStatus() == Branch.BRANCH_ACTIVE && isOnlyPhysicalBranchShowInBalancePaybalAt && branch.getTypeOfLocation() == Branch.TYPE_OF_LOCATION_PHYSICAL)
					physicalBranchList.put(branch.getBranchId(), branch);
			} else
				for(final Long key : physicalBranches.keySet()) {
					branch = physicalBranches.get(key);

					if(branch.getStatus() == Branch.BRANCH_ACTIVE)
						if(isOnlyPhysicalBranchShowInBalancePaybalAt) {
							if(branch.getTypeOfLocation() == Branch.TYPE_OF_LOCATION_PHYSICAL)
								physicalBranchList.put(branch.getBranchId(), branch);
						} else
							physicalBranchList.put(branch.getBranchId(), branch);
				}

			return physicalBranchList;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		} finally {
			physicalBranchList	 		= null;
			physicalBranches 			= null;
			branch						= null;
		}
	}
}