package com.ivcargo.actions.transport;

//~--- non-JDK imports --------------------------------------------------------

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.SortedMap;
import java.util.StringJoiner;
import java.util.TreeMap;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringUtils;

import com.businesslogic.DispatchBLL;
import com.businesslogic.waybill.FormTypesBLL;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.dto.ArticleTypeMaster;
import com.iv.dto.constant.FormTypeConstant;
import com.iv.dto.constant.WayBillTypeConstant;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.exception.ExceptionProcess;
import com.iv.utils.utility.SplitLRNumber;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.ConsignmentSummaryDao;
import com.platform.dao.CrossingAgentMasterDao;
import com.platform.dao.CustomerDetailsDao;
import com.platform.dao.DispatchArticleDetailsDao;
import com.platform.dao.DriverMasterDao;
import com.platform.dao.VehicleAgentMasterDao;
import com.platform.dao.WayBillCrossingDao;
import com.platform.dao.WayBillHistoryDao;
import com.platform.dao.reports.WayBillDetailsDAO;
import com.platform.dao.waybill.FormTypesDao;
import com.platform.dto.AccountGroup;
import com.platform.dto.Branch;
import com.platform.dto.ChargeTypeMaster;
import com.platform.dto.ConsignmentDetails;
import com.platform.dto.ConsignmentSummary;
import com.platform.dto.CustomerDetails;
import com.platform.dto.DispatchArticleDetails;
import com.platform.dto.DispatchLedger;
import com.platform.dto.DispatchSummary;
import com.platform.dto.Executive;
import com.platform.dto.PackingTypeMaster;
import com.platform.dto.SubRegion;
import com.platform.dto.WayBill;
import com.platform.dto.WayBillCharges;
import com.platform.dto.WayBillCrossing;
import com.platform.dto.WayBillTaxTxn;
import com.platform.dto.WayBillType;
import com.platform.dto.configuration.modules.GroupConfigurationPropertiesDTO;
import com.platform.dto.configuration.modules.LsConfigurationDTO;
import com.platform.dto.configuration.modules.LsPrintConfigurationDTO;
import com.platform.dto.model.DispatchLedgerPrintModel;
import com.platform.dto.model.ReportViewModel;
import com.platform.dto.model.SourceWiseWayBillCrossingSummary;
import com.platform.dto.model.WayBillCategoryTypeDetails;
import com.platform.dto.model.WayBillDeatailsModel;
import com.platform.dto.model.WayBillModel;
import com.platform.dto.model.WayBillViewModel;
import com.platform.dto.waybill.FormTypes;
import com.platform.resource.CargoErrorList;
import com.platform.utils.PropertiesUtility;
import com.platform.utils.Utility;

public class TransportPrintOutboundManifestReportActionBranchWise implements Action {

	public static final String 					TRACE_ID 				= "TransportPrintOutboundManifestReportActionForSNGT";
	Executive                  					executive				= null;
	HashMap<Long,PackingTypeMaster> 			wbPackingTypeDetails 	= null;
	HashMap<String,WayBillCategoryTypeDetails> 	wbCategoryTypeDetails 	= null;
	HashMap<Long, WayBillDeatailsModel> 		wayBillDetails 			= null;
	CacheManip       							cache            		= null;
	HashMap<Long, Timestamp> 					bookingDateTime 		= null;
	String										deliveryPlace			= null;
	long 										totalPackages 			= 0;
	long 										totalDocsOnPackages 	= 0;
	long 										totalNonDocsOnPackages 	= 0;
	HashMap<Long, CustomerDetails>				consignorHM				= null;
	HashMap<Long, CustomerDetails>				consigneeHM				= null;
	boolean										formNumberExistsInLS	= false;
	boolean										sortByWayBillNumber		= false;

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {

		HashMap<String,Object>	 							error 					= null;
		DispatchBLL 										dispatchBLL      		= null;
		ValueObject 										inValObj        	 	= null;
		ValueObject 										outValObj 				= null;
		WayBillModel[]          							wayBillModels           = null;
		Long[] 												wayBillIdArray 			= null;
		DispatchLedgerPrintModel 							dispatchLedgerPrintModel= null;
		String 												wayBillIdStr 			= null;
		HashMap<Long, WayBillCrossing> 						crossingColl 			= null;
		WayBillViewModel[] 									wayBillViewList 		= null;
		ReportViewModel 									reportViewModel 		= null;
		WayBillCrossing										wayBillCrossing 		= null;
		HashMap<Long, SourceWiseWayBillCrossingSummary> 	srcWiseCrossingColl		= null;
		HashMap<Long, ConsignmentSummary> 					conSumColl				= null;
		SortedMap<String, ArrayList<WayBillViewModel>>  	destWiseWayBillHM		= null;
		ArrayList<WayBillViewModel>							wayBillViewArrList		= null;
		WayBill												wayBill					= null;
		DispatchSummary		  								dispatchSummary			= null;
		HashMap<Long, DispatchArticleDetails[]>			 dispatchArticlDetailsArrayHM 	 	= null;
		DispatchArticleDetails[]						 dispatchArticleDetailsArray	    = null;
		FormTypesBLL										formTypesBLL					= null;
		HashMap<Long, ArrayList<Short>>						formTypesIds					= null;
		ValueObject 										groupConfig        	 			= null;
		var 											showPartyIsBlackListedParty     = false;
		var											allowAutoGenerateConEWaybill		= false;
		ArrayList<FormTypes> 							formTypesList						= null;
		String											formNumber							= null;
		ValueObject										lsConfiguration						= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;
			wbPackingTypeDetails 	= new HashMap<>();
			wbCategoryTypeDetails 	= new HashMap<>();
			wayBillDetails 			= new HashMap<>();
			cache					= new CacheManip(request);
			executive 				= (Executive) request.getSession().getAttribute("executive");
			dispatchBLL      		= new DispatchBLL();
			inValObj         		= new ValueObject();
			formTypesBLL			= new FormTypesBLL();
			final var dispatchLedgerId   = JSPUtility.GetLong(request, "dispatchLedgerId");

			groupConfig   				= cache.getGroupConfiguration(request, executive.getAccountGroupId());
			showPartyIsBlackListedParty = groupConfig.getBoolean(GroupConfigurationPropertiesDTO.SHOW_PARTY_IS_BLACK_LISTED_PARTY, false);

			lsConfiguration					= cache.getLsConfiguration(request, executive.getAccountGroupId());
			allowAutoGenerateConEWaybill	= PropertiesUtility.isAllow(lsConfiguration.getString(LsConfigurationDTO.ALLOW_AUTO_GENERATE_CON_EWAYBILL, "false"));
			sortByWayBillNumber				= lsConfiguration.getBoolean(LsPrintConfigurationDTO.SORT_BY_WAY_BILL_NUMBER, false);

			inValObj.put("dispatchLedgerId", dispatchLedgerId);
			inValObj.put("AccountGroupId", executive.getAccountGroupId());

			outValObj = dispatchBLL.getTransportPrintOutboundManifest(inValObj);
			dispatchArticlDetailsArrayHM 	= DispatchArticleDetailsDao.getInstance().getDispatchArticleDetailsByDispatchLegerId(dispatchLedgerId);

			if(outValObj.get("wayBillModels") != null && outValObj.get("WayBillIdArray") != null) {

				wayBillModels          		= (WayBillModel[]) outValObj.get("wayBillModels");
				wayBillIdArray 				= (Long[]) outValObj.get("WayBillIdArray");

				wayBillIdStr   = Utility.GetLongArrayToString(wayBillIdArray);

				if(allowAutoGenerateConEWaybill) {
					formTypesList		= FormTypesDao.getInstance().getFormTypesByWayBillIds(wayBillIdStr);

					if(formTypesList != null)
						for (final FormTypes element : formTypesList)
							if(element.getFormTypesId() == FormTypeConstant.E_WAYBILL_ID) {
								formNumber = element.getFormNumber();

								if(formNumber != null && !formNumber.isEmpty()) {
									formNumberExistsInLS = true ;
									break;
								}
							}
				}

				dispatchLedgerPrintModel = populateDispatchLedgerPrintModel(request,wayBillModels[0].getDispatchLedger(),cache);
				dispatchLedgerPrintModel.setDispatchLedgerId(dispatchLedgerId);

				conSumColl		= ConsignmentSummaryDao.getInstance().getLimitedConsignmentDetails(wayBillIdStr);
				consignorHM 	= CustomerDetailsDao.getInstance().getConsignorDetailsByWayBillId(wayBillIdStr);
				consigneeHM 	= CustomerDetailsDao.getInstance().getConsigneeDetailsByWayBillId(wayBillIdStr);
				formTypesIds	= formTypesBLL.getFormTypesIds(wayBillIdStr);

				request.setAttribute("CrossingAgentMaster", CrossingAgentMasterDao.getInstance().getCrossingAgentDetailsById(dispatchLedgerPrintModel.getCrossingAgentId()));

				//Get WayBill Details code ( Start )
				wayBillDetails = WayBillDetailsDAO.getInstance().getWayBillDetails(wayBillIdArray ,true ,ChargeTypeMaster.WAYBILL_CHARGETYPE_BOOKING ,true ,WayBillTaxTxn.WAYBILL_TAX_TXN_TYPE_BOOKING ,true);
				//Get WayBill Details code ( End )

				bookingDateTime 	= WayBillHistoryDao.getInstance().getBookedDateFromWayBillHistory(wayBillIdStr);
				srcWiseCrossingColl = new HashMap<>();

				if(dispatchLedgerPrintModel.isCrossing())
					crossingColl = WayBillCrossingDao.getInstance().getWayBillCrossingDetailsByDispatchLedgerId(dispatchLedgerId);

				destWiseWayBillHM 	= new TreeMap<>();
				wayBillViewList 	= new WayBillViewModel[wayBillModels.length];
				reportViewModel 	= new ReportViewModel();
				wayBillCrossing		= null;

				for (var i = 0; i < wayBillModels.length; i++) {
					wayBill 					= wayBillModels[i].getWayBill();
					dispatchSummary 			= wayBillModels[i].getDispatchSummary();
					dispatchArticleDetailsArray = dispatchArticlDetailsArrayHM.get(wayBill.getWayBillId());

					wayBill.setActualWeight(dispatchSummary.getDispatchedWeight());
					wayBill.setDeliveryTo(conSumColl.get(wayBill.getWayBillId()).getDeliveryTo());

					if(formTypesIds != null)
						wayBillModels[i].setFormTypeIds(formTypesIds.get(wayBill.getWayBillId()));

					if(i == 0) {
						reportViewModel = populateReportViewModel(request,reportViewModel,wayBillModels[i]);
						request.setAttribute("ReportViewModel", reportViewModel);
						request.setAttribute("LoggedInBranchDetails", cache.getGenericBranchDetailCache(request,executive.getBranchId()));
					}

					if(crossingColl != null)
						wayBillCrossing = crossingColl.get(wayBillModels[i].getWayBill().getWayBillId());

					wayBillViewList[i] = populateWayBillViewModel(request ,wayBillModels[i] ,dispatchLedgerPrintModel ,wayBillCrossing, dispatchArticleDetailsArray);

					//Dest Wise WayBill Collection (Start)
					wayBillViewArrList = destWiseWayBillHM.get(wayBillViewList[i].getDestinationBranch()+"_"+wayBillViewList[i].getDestinationBranchId());

					if(wayBillViewArrList == null)
						wayBillViewArrList = new ArrayList<>();

					wayBillViewArrList.add(wayBillViewList[i]);
					destWiseWayBillHM.put(wayBillViewList[i].getDestinationBranch()+"_"+wayBillViewList[i].getDestinationBranchId(), wayBillViewArrList);
					//Dest Wise WayBill Collection (End)
				}

				if (sortByWayBillNumber) {
					final var wayBillViewDataList = new ArrayList<WayBillViewModel>();
					Collections.addAll(wayBillViewDataList, wayBillViewList);
					wayBillViewDataList.sort(Comparator.comparing(WayBillViewModel::getSrcBranchCode).thenComparing(WayBillViewModel::getWayBillNumberWithoutBranchCode));

					wayBillViewList = new WayBillViewModel[wayBillViewDataList.size()];
					wayBillViewDataList.toArray(wayBillViewList);
				}

				request.setAttribute("srcWiseCrossingColl", srcWiseCrossingColl);
				request.setAttribute("dispatchLedger", dispatchLedgerPrintModel);
				request.setAttribute("destWiseWayBillHM", destWiseWayBillHM);
				request.setAttribute("wayBillViewList", wayBillViewList);
				request.setAttribute("showPartyIsBlackListedParty", showPartyIsBlackListedParty);
				request.setAttribute("wayBillLength", wayBillViewList.length+destWiseWayBillHM.size());

				if("Dispatched".equals(request.getParameter("Type")))
					request.setAttribute("Type","Dispatch");
				else
					request.setAttribute("Type","Branch Transfer");

				request.setAttribute("packageTypeDetails",wbPackingTypeDetails);
				request.setAttribute("wayBillTypeDetails",wbCategoryTypeDetails);
			} else {
				error.put("errorCode", CargoErrorList.NO_RECORDS);
				error.put("errorDescription", CargoErrorList.NO_RECORDS_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}

			request.setAttribute("nextPageToken", "success_"+executive.getAccountGroupId());

		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		} finally {
			executive				= null;
			wbPackingTypeDetails 	= null;
			wbCategoryTypeDetails 	= null;
			wayBillDetails 			= null;
			cache            		= null;
			bookingDateTime 		= null;
			deliveryPlace			= null;
		}

	}

	public ReportViewModel populateReportViewModel(final HttpServletRequest request,final ReportViewModel reportViewModel ,final WayBillModel wayBillModel) throws Exception{

		WayBill			wayBill			= null;
		Branch 			branch 			= null;
		AccountGroup 	accountGroup 	= null;

		try {

			wayBill          = wayBillModel.getWayBill();

			branch = cache.getGenericBranchDetailCache(request, wayBill.getSourceBranchId());
			reportViewModel.setBranchPhoneNumber(branch.getPhoneNumber());
			reportViewModel.setBranchAddress(branch.getAddress());

			accountGroup = cache.getAccountGroupById(request, executive.getAccountGroupId());
			reportViewModel.setAccountGroupName(accountGroup.getDescription());

			return  reportViewModel;
		} catch (final Exception e) {
			throw e;
		} finally {
			wayBill			= null;
			branch 			= null;
			accountGroup 	= null;
		}
	}

	public DispatchLedgerPrintModel populateDispatchLedgerPrintModel(final HttpServletRequest request, final DispatchLedger dispatchLedger,final CacheManip cache) throws Exception {

		DispatchLedgerPrintModel 	dispatchLedgerPrintModel 	= null;
		Branch 						srcbranch 					= null;
		Branch 						destbranch 					= null;
		SubRegion 						srcSubRegion 					= null;
		SubRegion 						destSubRegion 					= null;

		try {

			dispatchLedgerPrintModel = new DispatchLedgerPrintModel(dispatchLedger);

			srcbranch = cache.getGenericBranchDetailCache(request, dispatchLedger.getSourceBranchId());
			dispatchLedgerPrintModel.setSourceBranchId(dispatchLedger.getSourceBranchId());
			dispatchLedgerPrintModel.setSourceBranch(srcbranch.getName());

			srcSubRegion = cache.getGenericSubRegionById(request, srcbranch.getSubRegionId());
			dispatchLedgerPrintModel.setSourceSubRegionId(srcbranch.getSubRegionId());
			dispatchLedgerPrintModel.setSourceSubRegion(srcSubRegion.getName());

			destbranch = cache.getGenericBranchDetailCache(request,  dispatchLedger.getDestinationBranchId());
			dispatchLedgerPrintModel.setDestinationBranchId(dispatchLedger.getDestinationBranchId());
			dispatchLedgerPrintModel.setDestinationBranch(destbranch.getName());
			destSubRegion = cache.getGenericSubRegionById(request, destbranch.getSubRegionId());
			dispatchLedgerPrintModel.setDestinationSubRegionId(destbranch.getSubRegionId());
			dispatchLedgerPrintModel.setDestinationSubRegion(destSubRegion.getName());

			dispatchLedgerPrintModel.setSuperVisor(dispatchLedger.getSuperVisor());
			dispatchLedgerPrintModel.setRemark(dispatchLedger.getRemark());
			dispatchLedgerPrintModel.setDriver1MobileNumber1(dispatchLedger.getDriver1MobileNumber1()!=null?dispatchLedger.getDriver1MobileNumber1():"");
			dispatchLedgerPrintModel.setDriver1MobileNumber2(dispatchLedger.getDriver1MobileNumber2()!=null?dispatchLedger.getDriver1MobileNumber2():"");

			if(dispatchLedger.getVehicleAgentId() > 0)
				dispatchLedgerPrintModel.setVehicleAgentName(VehicleAgentMasterDao.getInstance().getSingleVehicleAgentDetails(dispatchLedger.getVehicleAgentId()).getName());
			else
				dispatchLedgerPrintModel.setVehicleAgentName("");

			if(dispatchLedger.getDriverId() > 0)
				dispatchLedgerPrintModel.setDriverLicenceNumber(DriverMasterDao.getInstance().getDriverDataById(dispatchLedger.getDriverId(), executive.getAccountGroupId()).getLicenceNumber());
			else
				dispatchLedgerPrintModel.setDriverLicenceNumber("");

			if(dispatchLedger.getDriver2Id() > 0)
				dispatchLedgerPrintModel.setDriver2LicenceNumber(DriverMasterDao.getInstance().getDriverDataById(dispatchLedger.getDriver2Id(), executive.getAccountGroupId()).getLicenceNumber());
			else
				dispatchLedgerPrintModel.setDriver2LicenceNumber("");

			dispatchLedgerPrintModel.setLsNumber(dispatchLedger.getLsNumber());
			dispatchLedgerPrintModel.setLsBranchId(dispatchLedger.getLsBranchId());
			dispatchLedgerPrintModel.setCrossing(dispatchLedger.isCrossing());
			dispatchLedgerPrintModel.setCrossingAgentId(dispatchLedger.getCrossingAgentId());
			dispatchLedgerPrintModel.setPanNumber(cache.getVehicleNumber(request, executive.getAccountGroupId(), dispatchLedger.getVehicleNumberMasterId()).getPanNumber());
			dispatchLedgerPrintModel.setVehicleOwnerName(cache.getVehicleNumber(request, executive.getAccountGroupId(), dispatchLedger.getVehicleNumberMasterId()).getRegisteredOwner());

			final var	transMap	= cache.getTransportationModeForGroup(request, executive.getAccountGroupId());

			final var	trForGroup = transMap.get(dispatchLedger.getTransportModeMasterId());

			if(trForGroup != null)
				dispatchLedgerPrintModel.setTransportModeName("By "+ trForGroup.getTransportModeName());
			else
				dispatchLedgerPrintModel.setTransportModeName("");

			if(!StringUtils.isEmpty(dispatchLedger.getTceConsolidatedEwaybillNumber()))
				if(!StringUtils.isEmpty(dispatchLedger.getConsolidatedEwaybillNumber()))
					dispatchLedger.setConsolidatedEwaybillNumber(dispatchLedger.getConsolidatedEwaybillNumber()+","+dispatchLedger.getTceConsolidatedEwaybillNumber());
				else
					dispatchLedger.setConsolidatedEwaybillNumber(dispatchLedger.getTceConsolidatedEwaybillNumber());

			if(formNumberExistsInLS) {
				if(!StringUtils.isEmpty(dispatchLedger.getConsolidatedEwaybillNumber()))
					dispatchLedgerPrintModel.setConsolidatedEwaybillNumber(dispatchLedger.getConsolidatedEwaybillNumber());
				else
					dispatchLedgerPrintModel.setConsolidatedEwaybillNumber("Pending");
			} else
				dispatchLedgerPrintModel.setConsolidatedEwaybillNumber("Not Required");

			return dispatchLedgerPrintModel;

		} catch (final Exception e) {
			throw e;
		} finally {
			dispatchLedgerPrintModel 	= null;
			srcbranch 					= null;
			destbranch 					= null;
			srcSubRegion 					= null;
			destSubRegion 					= null;
		}
	}

	@SuppressWarnings("unchecked")
	public WayBillViewModel populateWayBillViewModel(final HttpServletRequest request, final WayBillModel wayBillModel ,final DispatchLedgerPrintModel dispatchLedgerPrintModel ,final WayBillCrossing wayBillCrossing,final DispatchArticleDetails[]	 dispatchArticleDetailsArray) throws Exception {

		WayBill          						wayBill          			= null;
		WayBillDeatailsModel 					wayBillDeatailsModel 		= null;
		WayBillViewModel 						wayBillViewModel 			= null;
		WayBillCategoryTypeDetails			 	wayBillCategoryTypeDetails 	= null;
		PackingTypeMaster 						wbPkg 						= null;
		PackingTypeMaster 						pkgType 					= null;
		Branch 									branch 						= null;
		SubRegion 								subRegion 					= null;
		ConsignmentDetails[] 					consignment 				= null;
		WayBillCharges[] 						wayBillCharges 				= null;
		WayBillTaxTxn[] 						wayBillTaxTxns 				= null;
		HashMap<Long,PackingTypeMaster> 		wbPkgs 						= null;
		HashMap<Long,Double> 					chargesCollection 			= null;
		CustomerDetails							consignor					= null;
		CustomerDetails							consignee					= null;

		try {

			wayBill          		= wayBillModel.getWayBill();
			wayBillDeatailsModel	= wayBillDetails.get(wayBill.getWayBillId());
			wayBillViewModel 		= new WayBillViewModel();

			branch = cache.getGenericBranchDetailCache(request, wayBill.getDestinationBranchId());
			wayBillViewModel.setDestinationBranch(branch.getName());
			wayBillViewModel.setDestinationBranchId(wayBill.getDestinationBranchId());

			subRegion = cache.getGenericSubRegionById(request, branch.getSubRegionId());
			wayBillViewModel.setDestinationSubRegion(subRegion.getName());

			branch = cache.getGenericBranchDetailCache(request, wayBill.getSourceBranchId());

			wayBillViewModel.setSourceBranch(branch.getName());
			wayBillViewModel.setSourceBranchId(wayBill.getSourceBranchId());
			wayBill.setSourceSubRegionId(branch.getSubRegionId());

			subRegion = cache.getGenericSubRegionById(request, wayBill.getSourceSubRegionId());
			wayBillViewModel.setSourceSubRegion(subRegion.getName());
			wayBillViewModel.setSourceSubRegionId(wayBill.getSourceSubRegionId());

			wayBillViewModel.setWayBillId(wayBill.getWayBillId());

			if(sortByWayBillNumber) {
				final var 	pair	= SplitLRNumber.getNumbers(wayBill.getWayBillNumber());

				wayBillViewModel.setSrcBranchCode(pair != null && pair.getBranchCode() instanceof String ? pair.getBranchCode().toString() : "");
				wayBillViewModel.setWayBillNumberWithoutBranchCode(pair != null && pair.getLrNumber() instanceof Long ? (long) pair.getLrNumber() : 0);
			}

			wayBillViewModel.setInvalidEwayBill(wayBill.isInvalidEwayBill());
			wayBillViewModel.setWayBillNumber(wayBill.isInvalidEwayBill() ? "**" + wayBill.getWayBillNumber() : wayBill.getWayBillNumber());

			if(wayBill.isManual())
				wayBillViewModel.setWayBillType(WayBillTypeConstant.getWayBillTypeNameByWayBilTypeId(wayBill.getWayBillTypeId()) + WayBillType.WAYBILL_TYPE_MANUAL);
			else
				wayBillViewModel.setWayBillType(WayBillTypeConstant.getWayBillTypeNameByWayBilTypeId(wayBill.getWayBillTypeId()));

			consignor = consignorHM.get(wayBill.getWayBillId());
			consignee = consigneeHM.get(wayBill.getWayBillId());

			wayBillViewModel.setWayBillTypeId(wayBill.getWayBillTypeId());
			wayBillViewModel.setConsignerName(Utility.checkedNullCondition(consignor.getName(), (short) 1));
			wayBillViewModel.setConsigneeName(Utility.checkedNullCondition(consignee.getName(), (short) 1));
			wayBillViewModel.setConsigneePhoneNo(consignee.getPhoneNumber());
			wayBillViewModel.setConsignmentDetails(wayBillModel.getConsignmentDetails());
			wayBillViewModel.setConsigneeBlackListed(consignee.getConsigneeBlackListed());
			wayBillViewModel.setConsignorBlackListed(consignor.getConsignorBlackListed());
			wayBillViewModel.setTbbPartyBlackListed(consignor.getTbbBlackListed());

			if(bookingDateTime != null)
				if(bookingDateTime.get(wayBill.getWayBillId()) != null)
					wayBillViewModel.setCreationDateTimeStamp(bookingDateTime.get(wayBill.getWayBillId()));

			/** consignment related coding done (per WayBill) Start */
			consignment = wayBillDeatailsModel.getConsignmentDetails();

			wayBillViewModel.setArticleTypeMasterId(consignment[0].getArticleTypeMasterId());

			var totalQuantity = 0L;
			//weight = 0.0;
			wbPkgs = new HashMap<>();
			final var saidToContain 	= new StringJoiner("/");

			for (final DispatchArticleDetails element : dispatchArticleDetailsArray) {
				totalQuantity = totalQuantity + element.getQuantity();

				// Create HashMap for Packages of current wayBill
				wbPkg = wbPkgs.get(element.getPackingTypeMasterId());

				if(wbPkg != null)
					wbPkg.setTotalQuantity(wbPkg.getTotalQuantity() + element.getQuantity());
				else {
					wbPkg = new PackingTypeMaster();
					wbPkg.setPackingTypeMasterId(element.getPackingTypeMasterId());
					wbPkg.setName(element.getPackingTypeName());
					wbPkg.setTotalQuantity(element.getQuantity());
					wbPkgs.put(element.getPackingTypeMasterId(), wbPkg);
				}

				// Create HashMap for total Package Type Details
				pkgType = wbPackingTypeDetails.get(element.getPackingTypeMasterId());

				if(pkgType !=null)
					pkgType.setTotalQuantity(pkgType.getTotalQuantity()+element.getQuantity());
				else {
					pkgType = new PackingTypeMaster();
					pkgType.setPackingTypeMasterId(element.getPackingTypeMasterId());
					pkgType.setName(element.getPackingTypeName());
					pkgType.setTotalQuantity(element.getQuantity());
					wbPackingTypeDetails.put(element.getPackingTypeMasterId(),pkgType);
				}

				for (final ConsignmentDetails element2 : consignment)
					if(element2.getPackingTypeMasterId()
							== element.getPackingTypeMasterId()
							&& element2.getConsignmentDetailsId() == 	element.getConsignmentDetailsId())
						saidToContain.add(element2.getSaidToContain());
			}

			wayBillViewModel.setSaidToContain(saidToContain.toString());

			wayBillViewModel.setTotalPackagesTypeQuantity(wbPkgs.values().stream().map(PackingTypeMaster::getName).collect(Collectors.joining("/ ")));

			/** WayBillCharges related coding done (per WayBill) Start */

			wayBillCharges = wayBillDeatailsModel.getWayBillCharges();
			wayBillTaxTxns = wayBillDeatailsModel.getWayBillTaxTxn();

			var totalTax 			= 0.00;
			var totalDiscount 		= 0.00;

			for (final WayBillTaxTxn wayBillTaxTxn : wayBillTaxTxns)
				totalTax = totalTax + wayBillTaxTxn.getTaxAmount();

			if(wayBill.isDiscountPercent())
				totalDiscount = Math.round(wayBill.getBookingChargesSum() * wayBill.getBookingDiscountPercentage() / 100);
			else
				totalDiscount = wayBill.getBookingDiscount();

			wayBillCategoryTypeDetails = wbCategoryTypeDetails.get(wayBillViewModel.getWayBillType());

			if(wayBillCategoryTypeDetails == null){
				wayBillCategoryTypeDetails = new WayBillCategoryTypeDetails();

				wayBillCategoryTypeDetails.setWayBillType(wayBillViewModel.getWayBillType());
				wayBillCategoryTypeDetails.setQuantity(totalQuantity);
				wayBillCategoryTypeDetails.setTotalTax(totalTax);
				wayBillCategoryTypeDetails.setBookingDiscount(totalDiscount);
				wayBillCategoryTypeDetails.setTotalAmount(wayBill.getBookingTotal());

				chargesCollection = new HashMap<>();

				for (final WayBillCharges wayBillCharge : wayBillCharges)
					chargesCollection.put(wayBillCharge.getWayBillChargeMasterId(), wayBillCharge.getChargeAmount());
				wayBillCategoryTypeDetails.setChargesCollection(chargesCollection);

				wbCategoryTypeDetails.put(wayBillViewModel.getWayBillType(), wayBillCategoryTypeDetails);
			}else{

				wayBillCategoryTypeDetails.setQuantity(wayBillCategoryTypeDetails.getQuantity() + totalQuantity);
				wayBillCategoryTypeDetails.setTotalTax(wayBillCategoryTypeDetails.getTotalTax() + totalTax);
				wayBillCategoryTypeDetails.setBookingDiscount(wayBillCategoryTypeDetails.getBookingDiscount() + totalDiscount);
				wayBillCategoryTypeDetails.setTotalAmount(wayBillCategoryTypeDetails.getTotalAmount() + wayBill.getBookingTotal());

				chargesCollection = wayBillCategoryTypeDetails.getChargesCollection();

				for (final WayBillCharges wayBillCharge : wayBillCharges)
					if(chargesCollection.get(wayBillCharge.getWayBillChargeMasterId()) != null)
						chargesCollection.put(wayBillCharge.getWayBillChargeMasterId(), chargesCollection.get(wayBillCharge.getWayBillChargeMasterId()) + wayBillCharge.getChargeAmount());
					else
						chargesCollection.put(wayBillCharge.getWayBillChargeMasterId(), wayBillCharge.getChargeAmount());
			}
			/** End */
			wayBillViewModel.setBookingChargesSum(wayBill.getBookingChargesSum());
			wayBillViewModel.setBookingDiscount(wayBill.getBookingDiscount());
			wayBillViewModel.setBookingTimeServiceTax(wayBill.getBookingTimeServiceTax());
			wayBillViewModel.setBookingTotal(wayBill.getBookingTotal());
			wayBillViewModel.setDeliveryChargesSum(wayBill.getDeliveryChargesSum());
			wayBillViewModel.setDeliveryDiscount(wayBill.getDeliveryDiscount());
			wayBillViewModel.setDeliveryTimeServiceTax(wayBill.getDeliveryTimeServiceTax());
			wayBillViewModel.setDeliveryTotal(wayBill.getDeliveryTotal());
			wayBillViewModel.setGrandTotal(wayBill.getGrandTotal());

			//wayBillViewModel.setTotalWeight(weight);
			wayBillViewModel.setTotalQuantity(totalQuantity);
			wayBillViewModel.setNoOfArticle(dispatchArticleDetailsArray.length);
			wayBillViewModel.setRemark(wayBill.getRemark());
			wayBillViewModel.setAccountGroupId(wayBill.getAccountGroupId());
			wayBillViewModel.setActualWeight(wayBill.getActualWeight());
			wayBillViewModel.setFormTypeIds(wayBillModel.getFormTypeIds());
			wayBillViewModel.setDeliveryTo(wayBill.getDeliveryTo());
			wayBillViewModel.setDispatchArticleDetails(dispatchArticleDetailsArray);

			if (wayBillViewModel.getArticleTypeMasterId() == ArticleTypeMaster.ARTICLE_TYPE_DOCUMENT) {
				totalPackages += totalQuantity;
				totalDocsOnPackages += totalQuantity;
				dispatchLedgerPrintModel.setTotalDocsOnPackages(totalDocsOnPackages);
				dispatchLedgerPrintModel.setTotalPackages(totalPackages);
			} else if (wayBillViewModel.getArticleTypeMasterId() == ArticleTypeMaster.ARTICLE_TYPE_NONDOCUMENT) {
				totalPackages += totalQuantity;
				totalNonDocsOnPackages += totalQuantity;
				dispatchLedgerPrintModel.setTotalNonDocsOnPackages(totalNonDocsOnPackages);
				dispatchLedgerPrintModel.setTotalPackages(totalPackages);
			}

			if(wayBillCrossing != null) {
				wayBillViewModel.setNetLoading(wayBillCrossing.getNetLoading());
				wayBillViewModel.setNetUnloading(wayBillCrossing.getNetUnloading());
				wayBillViewModel.setCrossingHire(wayBillCrossing.getCrossingHire());
			}

			return wayBillViewModel;

		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		} finally {
			wayBill          			= null;
			wayBillDeatailsModel 		= null;
			wayBillViewModel 			= null;
			wayBillCategoryTypeDetails 	= null;
			wbPkg 						= null;
			pkgType 					= null;
			branch 						= null;
			subRegion 					= null;
			consignment 				= null;
			wayBillCharges 				= null;
			wayBillTaxTxns 				= null;
			wbPkgs 						= null;
			chargesCollection 			= null;
		}
	}
}