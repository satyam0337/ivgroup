package com.ivcargo.actions;

//~--- non-JDK imports --------------------------------------------------------

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.StringJoiner;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.ObjectUtils;
import org.apache.commons.lang3.StringUtils;

import com.businesslogic.DispatchBLL;
import com.businesslogic.print.DispatchPrintBLL;
import com.businesslogic.properties.impl.PropertyConfigValueBLLImpl;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.constant.properties.dispatch.InterBranchLSConfigurationConstant;
import com.iv.dto.ArticleTypeMaster;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.exception.ExceptionProcess;
import com.iv.utils.utility.CollectionUtility;
import com.iv.utils.utility.SplitLRNumber;
import com.iv.utils.utility.Utility;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.reports.ReportView;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.ChargeTypeMasterDao;
import com.platform.dao.ConsignmentSummaryDao;
import com.platform.dao.CustomerDetailsDao;
import com.platform.dao.DispatchArticleDetailsDao;
import com.platform.dao.reports.WayBillDetailsDAO;
import com.platform.dao.waybill.FormTypesDao;
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
import com.platform.dto.PropertiesFileConstants;
import com.platform.dto.SubRegion;
import com.platform.dto.WayBill;
import com.platform.dto.WayBillCharges;
import com.platform.dto.WayBillTaxTxn;
import com.platform.dto.WayBillType;
import com.platform.dto.configuration.modules.LsConfigurationDTO;
import com.platform.dto.configuration.modules.LsPrintConfigurationDTO;
import com.platform.dto.constant.BookingChargeConstant;
import com.platform.dto.constant.CargoAccountGroupConstant;
import com.platform.dto.constant.FormTypeConstant;
import com.platform.dto.constant.WayBillStatusConstant;
import com.platform.dto.constant.WayBillTypeConstant;
import com.platform.dto.model.ChargeTypeModel;
import com.platform.dto.model.DispatchLedgerPrintModel;
import com.platform.dto.model.ReportViewModel;
import com.platform.dto.model.WayBillCategoryTypeDetails;
import com.platform.dto.model.WayBillDeatailsModel;
import com.platform.dto.model.WayBillModel;
import com.platform.dto.model.WayBillViewModel;
import com.platform.dto.waybill.FormTypes;
import com.platform.resource.CargoErrorList;

public class PrintOutboundManifestReportAction implements Action {
	public static final String 	TRACE_ID 					= "PrintOutboundManifestReportAction";
	Executive                  								executive					= null;
	HashMap<Long,PackingTypeMaster> 						wbPackingTypeDetails 		= new HashMap<>();
	HashMap<String, WayBillCategoryTypeDetails> 			wbCategoryTypeDetails 		= new HashMap<>();
	HashMap<Long, WayBillCategoryTypeDetails> 				wbDestBranchTypeDetails 	= new HashMap<>();
	HashMap<Long, WayBillDeatailsModel> 					wayBillDetails 				= new HashMap<>();
	long 													totalPackages 				= 0;
	long 													totalDocsOnPackages 		= 0;
	long 													totalNonDocsOnPackages 		= 0;
	CacheManip       										cache            			= null;
	HashMap<Long, Timestamp> 								bookingDateTime 			= null;
	HashMap<Long, CustomerDetails>							consignorHM					= null;
	HashMap<Long, CustomerDetails>							consigneeHM					= null;
	ArrayList<Long>											chargesAllowedToView		= new ArrayList<>();
	HashMap<Long, ConsignmentSummary>						consignmentSummary			= null;
	ConsignmentSummary										consignment					= null;
	short													deliveryToId				= 0;
	boolean													formNumberExistsInLS		= false;
	boolean													showSeparateCrossingDataInLsPrint		= false;
	boolean                                               	removeCrossingFromInterBranch         =false;
	String wayBillIdStr = null;

	@SuppressWarnings("unchecked")
	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {

		HashMap<String, Object>			                 error 							    = null;
		ValueObject						                 lsPrintConfiguration			    = null;
		String							                 commissionCalculation			    = null;
		String							                 branchCommission				    = null;
		java.util.List<String> 			                 branchCommisionList				= null;
		HashMap<Long, DispatchArticleDetails[]>			 dispatchArticlDetailsArrayHM 	 	= null;
		DispatchArticleDetails[]						 dispatchArticleDetailsArray	    = null;
		String						                     wayBillWiseDispatch				= null;
		List<WayBillViewModel> 						dispatchedStockReportModelsListWithExpress		= null;
		List<WayBillViewModel> 						dispatchedStockReportModelsListWithoutExpress	= null;
		WayBillViewModel[] 								sortedDispatchedStockReportModelByDeliveryToId	= null;
		ValueObject										lsConfiguration								= null;

		var											sortByDeliveryToId							= false;
		var											allowAutoGenerateConEWaybill				= false;
		var											sortByDestinationBrachwise					= false;
		ArrayList<FormTypes> 							formTypesList								= null;
		var                             				eWayBillCount								= 0;
		var                                         isInvoiceBasedStockPrint					= false;
		List<WayBillViewModel> 							wayBillViewModelList						= null;
		WayBill													wayBill						= null;
		final var 	branchWiseWayBillViewList 	= new HashMap<>();
		final var 	destBranchWiseWayBillViewList 	= new HashMap<>();
		LinkedHashMap<Long, WayBillViewModel>					wayBillMdlsCol				= null;
		var											        sortByWayBillNumber					    = false;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			cache		= new CacheManip(request);
			executive 	= cache.getExecutive(request);
			final var        dispatchLedgerId = JSPUtility.GetLong(request, "dispatchLedgerId");

			isInvoiceBasedStockPrint = JSPUtility.GetBoolean(request, "LsWithoutInvoice",false);


			final var dispatchBLL     	 = new DispatchBLL();
			final var inValObj         	 = new ValueObject();
			var wayBillTypeValObj	 = new ValueObject();

			inValObj.put("dispatchLedgerId", dispatchLedgerId);
			inValObj.put("AccountGroupId", executive.getAccountGroupId());

			final var outValObj = dispatchBLL.getPrintOutboundManifest(inValObj);
			dispatchArticlDetailsArrayHM 	= DispatchArticleDetailsDao.getInstance().getDispatchArticleDetailsByDispatchLegerId(dispatchLedgerId);
			lsConfiguration					= cache.getLsConfiguration(request, executive.getAccountGroupId());
			final var	interBranchLsConfiguration      = cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.INTER_BRANCH_LS);
			removeCrossingFromInterBranch		= (boolean) interBranchLsConfiguration.getOrDefault(InterBranchLSConfigurationConstant.REMOVE_CROSSING_FROM_INTERBRANCH, false);
			allowAutoGenerateConEWaybill	= lsConfiguration.getBoolean(LsConfigurationDTO.ALLOW_AUTO_GENERATE_CON_EWAYBILL, false);
			showSeparateCrossingDataInLsPrint = lsConfiguration.getBoolean(LsConfigurationDTO.SHOW_SEPARATE_CROSSING_DATA_IN_LS_PRINT, false);

			if (outValObj.get("wayBillModels") != null && outValObj.get("WayBillIdArray") != null) {
				final var        wayBillModels           = (WayBillModel[]) outValObj.get("wayBillModels");
				final var 		wayBillIdArray 			= (Long[]) outValObj.get("WayBillIdArray");

				wayBillIdStr		= CollectionUtility.getLongArrayToString(wayBillIdArray);
				consignorHM 		= CustomerDetailsDao.getInstance().getConsignorDetailsByWayBillId(wayBillIdStr);
				consigneeHM 		= CustomerDetailsDao.getInstance().getConsigneeDetailsByWayBillId(wayBillIdStr);
				consignmentSummary 	= ConsignmentSummaryDao.getInstance().getLimitedConsignmentDetails(wayBillIdStr);

				if(allowAutoGenerateConEWaybill) {
					formTypesList		= FormTypesDao.getInstance().getFormTypesByWayBillIds(wayBillIdStr);

					if(formTypesList != null)
						formNumberExistsInLS	= formTypesList.stream().anyMatch(e -> e.getFormTypesId() == FormTypeConstant.E_WAYBILL_ID && !StringUtils.isEmpty(e.getFormNumber()));
				}

				final var dispatchLedgerPrintModel = populateDispatchLedgerPrintModel(request, wayBillModels[0].getDispatchLedger());
				dispatchLedgerPrintModel.setDispatchLedgerId(dispatchLedgerId);

				request.setAttribute("consignmentSummary", consignmentSummary);
				//Get WayBill Details code ( Start )
				wayBillDetails 		= WayBillDetailsDAO.getInstance().getWayBillDetails(wayBillIdArray, true, ChargeTypeMaster.WAYBILL_CHARGETYPE_BOOKING, true, WayBillTaxTxn.WAYBILL_TAX_TXN_TYPE_BOOKING, true);
				//Get WayBill Details code ( End )

				var 	wayBillViewList = new WayBillViewModel[wayBillModels.length];
				var 	reportViewModel = new ReportViewModel();

				reportViewModel 	= ReportView.getInstance().populateReportViewModel(request, reportViewModel);
				request.setAttribute("ReportViewModel", reportViewModel);
				lsPrintConfiguration		= PropertyConfigValueBLLImpl.getInstance().getConfiguration(executive, PropertiesFileConstants.LS_PRINT_LOAD_CONFIG);
				commissionCalculation				= lsPrintConfiguration.getString(LsPrintConfigurationDTO.COMMISION_CALCULATION, "false");
				final var sortDeliveryToId		= lsPrintConfiguration.getShort(LsPrintConfigurationDTO.SORT_DELIVERY_TO_ID);
				sortByDeliveryToId					= lsPrintConfiguration.getBoolean(LsPrintConfigurationDTO.SORT_BY_DELIVERY_TO_ID, false);
				sortByDestinationBrachwise			= lsPrintConfiguration.getBoolean(LsPrintConfigurationDTO.SORT_BY_DESTINATION_BRACH_WISE, false);
				sortByWayBillNumber			        = lsPrintConfiguration.getBoolean(LsPrintConfigurationDTO.SORT_BY_WAY_BILL_NUMBER, false);

				request.setAttribute("commissionCalculation", commissionCalculation);

				for (var i = 0; i < wayBillModels.length; i++) {
					dispatchArticleDetailsArray = dispatchArticlDetailsArrayHM.get(wayBillModels[i].getWayBill().getWayBillId());
					wayBillViewList[i] = populateWayBillViewModel(request, wayBillModels[i], dispatchLedgerPrintModel, dispatchArticleDetailsArray, consignmentSummary, lsPrintConfiguration);
					eWayBillCount += wayBillViewList[i].geteWaybillCount();
					//Source Branch wise collection
					if(executive.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNT_GORUP_ID_SUGAMA_TRAVELS) {
						wayBill = wayBillModels[i].getWayBill();

						wayBillMdlsCol = (LinkedHashMap<Long, WayBillViewModel>) branchWiseWayBillViewList.get(wayBill.getSourceBranchId());

						if(wayBillMdlsCol == null) {
							wayBillMdlsCol = new LinkedHashMap<>();
							wayBillMdlsCol.put(wayBill.getWayBillId(), wayBillViewList[i]);
							branchWiseWayBillViewList.put(wayBill.getSourceBranchId(), wayBillMdlsCol);
						} else
							wayBillMdlsCol.put(wayBill.getWayBillId(), wayBillViewList[i]);
					}

					if(sortByDestinationBrachwise) {
						wayBill = wayBillModels[i].getWayBill();

						wayBillMdlsCol = (LinkedHashMap<Long, WayBillViewModel>) destBranchWiseWayBillViewList.get(wayBill.getDestinationBranchId());

						if(wayBillMdlsCol== null) {
							wayBillMdlsCol = new LinkedHashMap<>();
							wayBillMdlsCol.put(wayBill.getWayBillId(), wayBillViewList[i]);
							destBranchWiseWayBillViewList.put(wayBill.getDestinationBranchId(), wayBillMdlsCol);
						} else
							wayBillMdlsCol.put(wayBill.getWayBillId(), wayBillViewList[i]);
					}
				}

				if(sortByWayBillNumber) {
					wayBillViewModelList = Stream.of(wayBillViewList).collect(Collectors.toList());
					wayBillViewModelList.sort(Comparator.comparing(WayBillViewModel::getSrcBranchCode).thenComparing(WayBillViewModel::getWayBillNumberWithoutBranchCode));
					wayBillViewList = new WayBillViewModel[wayBillViewModelList.size()];
					wayBillViewModelList.toArray(wayBillViewList);
				}

				if(isInvoiceBasedStockPrint && wayBillViewList != null && wayBillViewList.length > 0) {
					wayBillViewModelList = Stream.of(wayBillViewList).filter(e -> StringUtils.isEmpty(e.getInvoiceNo())).collect(Collectors.toList());

					if(wayBillViewModelList != null && !wayBillViewModelList.isEmpty()) {
						wayBillViewList = new WayBillViewModel[wayBillViewModelList.size()];
						wayBillViewModelList.toArray(wayBillViewList);
					} else
						wayBillViewList = new WayBillViewModel[wayBillViewModelList.size()];
				}

				request.setAttribute("isEWayBillNoExists", eWayBillCount > 0);

				if("true".equals(commissionCalculation)) {

					branchCommission				= (String) lsPrintConfiguration.get(LsPrintConfigurationDTO.BRANCH_COMMISSION);

					if(branchCommission != null) {
						branchCommisionList				= Arrays.asList(branchCommission.split("\\s*,\\s*"));

						short		commission		= 0;

						for (final String element : branchCommisionList) {
							final var 	bc	= element.split("_");
							final var	branchId			= Utility.getLong(StringUtils.trim(bc[0]));
							commission						= Utility.getShort(StringUtils.trim(bc[1]));

							if(dispatchLedgerPrintModel.getDestinationBranchId() == branchId)
								break;
						}

						request.setAttribute("commision", commission);
					}
				}

				request.setAttribute("dispatchLedger", dispatchLedgerPrintModel);
				request.setAttribute("branchWiseWayBillViewList", branchWiseWayBillViewList);
				request.setAttribute("destBranchWiseWayBillViewList", destBranchWiseWayBillViewList);

				wayBillWiseDispatch	= lsPrintConfiguration.getString(LsPrintConfigurationDTO.WAYBILL_TYPE_WISE_DISPATCH_DETAILS, "false");

				if(sortByDeliveryToId) {
					dispatchedStockReportModelsListWithExpress		= Stream.of(wayBillViewList).filter(e -> e.getDeliveryTo() == sortDeliveryToId).collect(Collectors.toList());
					dispatchedStockReportModelsListWithoutExpress	= Stream.of(wayBillViewList).filter(e -> e.getDeliveryTo() != sortDeliveryToId).toList();

					dispatchedStockReportModelsListWithExpress.addAll(dispatchedStockReportModelsListWithoutExpress);
					sortedDispatchedStockReportModelByDeliveryToId = new WayBillViewModel[dispatchedStockReportModelsListWithExpress.size()] ;
					dispatchedStockReportModelsListWithExpress.toArray(sortedDispatchedStockReportModelByDeliveryToId);
				}

				if("true".equals(StringUtils.trim(wayBillWiseDispatch))) {
					wayBillTypeValObj = DispatchPrintBLL.getWayBillTypeWiseDispatchLedgerDetails(wayBillViewList);

					request.setAttribute("paidLrWiseDispatchList", wayBillTypeValObj.get("paidLrWiseDispatchList"));
					request.setAttribute("toPayWiseDispatchList", wayBillTypeValObj.get("toPayWiseDispatchList"));
					request.setAttribute("focWiseDisptchList", wayBillTypeValObj.get("focWiseDisptchList"));
					request.setAttribute("tbbWiseDispatchList", wayBillTypeValObj.get("tbbWiseDispatchList"));
				} else if(sortedDispatchedStockReportModelByDeliveryToId != null)
					request.setAttribute("wayBillViewList", sortedDispatchedStockReportModelByDeliveryToId);
				else
					request.setAttribute("wayBillViewList", wayBillViewList);

				if(isInvoiceBasedStockPrint)
					isInvoiceBasedStockPrint = ObjectUtils.isEmpty(wayBillViewList);

				request.setAttribute("isInvoiceBasedStockPrint", isInvoiceBasedStockPrint);

				if("Dispatched".equals(request.getParameter("Type")))
					request.setAttribute("Type", "Dispatch");
				else
					request.setAttribute("Type", "Branch Transfer");

				request.setAttribute("packageTypeDetails", wbPackingTypeDetails);
				request.setAttribute("wayBillTypeDetails", wbCategoryTypeDetails);
				request.setAttribute("wbDestBranchTypeDetails", wbDestBranchTypeDetails);
				request.setAttribute("sortByDeliveryToId", sortByDeliveryToId);

				ChargeTypeModel[] bookingCharges  = null;

				final var branch = cache.getGenericBranchDetailCache(request, dispatchLedgerPrintModel.getSourceBranchId());

				if(branch.getMappingTypeId() == Branch.BRANCH_MAP_ID_OWN_BRANCH_AND_ASSIGNED)
					bookingCharges = cache.getBookingCharges(request, executive.getBranchId());
				else {
					bookingCharges  = cache.getBookingCharges(request, dispatchLedgerPrintModel.getSourceBranchId());

					if(bookingCharges == null)
						bookingCharges  = ChargeTypeMasterDao.getInstance().getChargeConfiguration(wayBillViewList[0].getAccountGroupId(), branch.getAgencyId(), branch.getBranchId(), ChargeTypeMaster.WAYBILL_CHARGETYPE_BOOKING);
				}

				request.setAttribute("chargesAllowedToView", chargesAllowedToView);
				request.setAttribute("wayBillCharges", bookingCharges);
				request.setAttribute("nextPageToken", "successDispatch_" + executive.getAccountGroupId());
				request.setAttribute("branch", branch);

			} else {
				error.put("errorCode", CargoErrorList.NO_RECORDS);
				error.put("errorDescription", CargoErrorList.NO_RECORDS_DESCRIPTION);
				request.setAttribute("cargoError", error);
				request.setAttribute("nextPageToken", "success");
			}
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}
	}

	public DispatchLedgerPrintModel populateDispatchLedgerPrintModel(final HttpServletRequest request, final DispatchLedger dispatchLedger) throws Exception {

		DispatchLedgerPrintModel 	dispatchLedgerPrintModel 	= null;
		Branch 						srcbranch 					= null;
		Branch 						destbranch 					= null;
		SubRegion 					srcSubRegion 				= null;
		SubRegion 					destSubRegion 				= null;
		Branch						branch						= null;

		try {

			dispatchLedgerPrintModel = new DispatchLedgerPrintModel(dispatchLedger);

			srcbranch = cache.getGenericBranchDetailCache(request,dispatchLedger.getSourceBranchId());
			dispatchLedgerPrintModel.setSourceBranch(srcbranch.getName());

			srcSubRegion = cache.getGenericSubRegionById(request, srcbranch.getSubRegionId());
			dispatchLedgerPrintModel.setSourceSubRegion(srcSubRegion.getName());

			destbranch = cache.getGenericBranchDetailCache(request, dispatchLedger.getDestinationBranchId());
			dispatchLedgerPrintModel.setDestinationBranch(destbranch.getName());

			dispatchLedgerPrintModel.setDestbranchMobileNumber(destbranch.getMobileNumber());

			destSubRegion = cache.getGenericSubRegionById(request, destbranch.getSubRegionId());
			dispatchLedgerPrintModel.setDestinationSubRegion(destSubRegion.getName());

			dispatchLedgerPrintModel.setSourceSubRegionId(srcSubRegion.getSubRegionId());
			dispatchLedgerPrintModel.setSourceBranchId(dispatchLedger.getSourceBranchId());
			dispatchLedgerPrintModel.setDestinationSubRegionId(destSubRegion.getSubRegionId());
			dispatchLedgerPrintModel.setDestinationBranchId(dispatchLedger.getDestinationBranchId());
			dispatchLedgerPrintModel.setLsNumber(dispatchLedger.getLsNumber());

			dispatchLedgerPrintModel.setSuperVisor(dispatchLedger.getSuperVisor());

			if(dispatchLedger.getRemark() != null)
				dispatchLedgerPrintModel.setRemark(dispatchLedger.getRemark());

			dispatchLedgerPrintModel.setDriver1MobileNumber1(dispatchLedger.getDriver1MobileNumber1());
			dispatchLedgerPrintModel.setDriver1MobileNumber2(dispatchLedger.getDriver1MobileNumber2());
			dispatchLedgerPrintModel.setDriver2Name(dispatchLedger.getDriver2Name());

			branch	= cache.getGenericBranchDetailCache(request, dispatchLedger.getLsBranchId());
			dispatchLedgerPrintModel.setLsCreatedBranchGstin(branch.getGstn());

			if(StringUtils.isNotEmpty(dispatchLedger.getTceConsolidatedEwaybillNumber()))
				if(StringUtils.isNotEmpty(dispatchLedger.getConsolidatedEwaybillNumber()))
					dispatchLedger.setConsolidatedEwaybillNumber(dispatchLedger.getConsolidatedEwaybillNumber() + "," + dispatchLedger.getTceConsolidatedEwaybillNumber());
				else
					dispatchLedger.setConsolidatedEwaybillNumber(dispatchLedger.getTceConsolidatedEwaybillNumber());

			if(formNumberExistsInLS) {
				if(StringUtils.isNotEmpty(dispatchLedger.getConsolidatedEwaybillNumber()))
					dispatchLedgerPrintModel.setConsolidatedEwaybillNumber(dispatchLedger.getConsolidatedEwaybillNumber());
				else
					dispatchLedgerPrintModel.setConsolidatedEwaybillNumber("Pending");
			} else
				dispatchLedgerPrintModel.setConsolidatedEwaybillNumber("Not Required");

			return dispatchLedgerPrintModel;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	@SuppressWarnings("unchecked")
	public WayBillViewModel populateWayBillViewModel(final HttpServletRequest request, final WayBillModel wayBillModel ,final DispatchLedgerPrintModel dispatchLedgerPrintModel,final DispatchArticleDetails[] dispatchArticleDetailsArray,
			final HashMap<Long, ConsignmentSummary> consignmentSummary, final ValueObject lsPrintConfiguration) throws Exception {
		WayBill          						wayBill          			= null;
		WayBillDeatailsModel 					wayBillDeatailsModel 		= null;
		WayBillViewModel 						wayBillViewModel 			= null;
		WayBillCategoryTypeDetails			 	wayBillCategoryTypeDetails 	= null;
		WayBillCategoryTypeDetails			 	destBranchTypeDetails 		= null;
		PackingTypeMaster 						wbPkg 						= null;
		PackingTypeMaster 						pkgType 					= null;
		PackingTypeMaster 						pkg 						= null;
		Branch 									branch 						= null;
		SubRegion								subRegion 					= null;
		StringJoiner							pkgDetail 					= null;
		Iterator<Long> 							itr 						= null;
		ConsignmentDetails[] 					consignment 				= null;
		WayBillCharges[] 						wayBillCharges 				= null;
		WayBillTaxTxn[] 						wayBillTaxTxns 				= null;
		HashMap<Long,PackingTypeMaster> 		wbPkgs 						= null;
		HashMap<Long,Double> 					chargesCollection 			= null;
		var 									totalQuantity 				= 0L;
		var 									isShowDoorDly 				= false;
		var 									isShowFreight 				= false;
		var 									isShowLoadingChg 			= false;
		var 									isShowUnloadingChg 			= false;
		var										showPaidAmountByBranch		= false;
		String									branches					= null;
		List<Long> 								branchesList				= null;
		String									minimumAmount				= null;
		var										showAmount					= false;
		DispatchSummary							dispatchSummary				= null;
		var 									isShowHandlingChg 			= false;
		var 									isShowDoorPickupChg 		= false;
		var 									isShowLRChg 				= false;
		ArticleTypeMaster						articleType					= null;
		var										showLoadingChargeAmountWayBillTypeWise	= false;
		var     								eWayBillCount   						= 0;
		var										showDestinationBranchWiseSummery		= false;
		var										showTBBAmountBranchWise					= false;
		var										branchWiseTbbAmountDisplay				= false;

		try {

			wayBill          			= wayBillModel.getWayBill();
			wayBillDeatailsModel		= wayBillDetails.get(wayBill.getWayBillId());
			dispatchSummary				= wayBillModel.getDispatchSummary();
			final var	dispatchLedger	= wayBillModel.getDispatchLedger();

			wayBillViewModel 			= new WayBillViewModel();

			branch 	= cache.getGenericBranchDetailCache(request, wayBill.getDestinationBranchId());
			wayBillViewModel.setDestinationBranch(branch.getName());

			wayBill.setDestinationSubRegionId(branch.getSubRegionId());

			subRegion 	= cache.getGenericSubRegionById(request, wayBill.getDestinationSubRegionId());

			wayBillViewModel.setDestinationSubRegionId(wayBill.getDestinationSubRegionId());
			wayBillViewModel.setDestinationSubRegion(subRegion.getName());

			if(wayBillModel.getWayBill().getConsignmentSummaryPrivateMark() != null)
				wayBillViewModel.setPrivateMarka(wayBillModel.getWayBill().getConsignmentSummaryPrivateMark());

			if(wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DELIVERED)
				wayBillViewModel.setWayBillDeliveryNumber(wayBill.getWayBillDeliveryNumber());

			branch 	= cache.getGenericBranchDetailCache(request, wayBill.getSourceBranchId());

			wayBill.setSourceSubRegionId(branch.getSubRegionId());
			wayBillViewModel.setSourceBranch(branch.getName());
			wayBillViewModel.setDestinationBranchId(wayBill.getDestinationBranchId());

			subRegion 	= cache.getGenericSubRegionById(request, wayBill.getSourceSubRegionId());

			wayBillViewModel.setSourceSubRegion(subRegion.getName());
			wayBillViewModel.setWayBillId(wayBill.getWayBillId());
			wayBillViewModel.setManual(wayBill.isManual());
			wayBillViewModel.setWayBillNumber(wayBill.getWayBillNumber());
			wayBillViewModel.setStatusValue(WayBillStatusConstant.getStatus(wayBill.getStatus()));

			if(executive.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNT_GROUP_ID_SUPAA_TRAVELS)
				changeDataForSupaa(wayBillDeatailsModel.getWayBillCharges(), wayBill);
			else if(executive.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNT_GROUP_ID_MECL)
				changeDataForSachin(wayBillDeatailsModel.getWayBillCharges(), wayBill);

			final var wayBillType = com.iv.dto.constant.WayBillTypeConstant.getWayBillTypeNameByWayBilTypeId(wayBill.getWayBillTypeId());

			if(removeCrossingFromInterBranch && dispatchLedger.getTypeOfLS() == DispatchLedger.TYPE_OF_LS_ID_Inter_Branch && (wayBill.getSourceSubRegionId() != dispatchLedgerPrintModel.getSourceSubRegionId()
					|| wayBill.getDestinationSubRegionId() != dispatchLedgerPrintModel.getDestinationSubRegionId())) {
				if(wayBill.isManual())
					wayBillViewModel.setWayBillType(wayBillType + WayBillType.WAYBILL_TYPE_MANUAL );
				else
					wayBillViewModel.setWayBillType(wayBillType);
			} else if(showSeparateCrossingDataInLsPrint && (wayBill.getSourceSubRegionId() != dispatchLedgerPrintModel.getSourceSubRegionId()
					|| wayBill.getDestinationSubRegionId() != dispatchLedgerPrintModel.getDestinationSubRegionId())) {
				if(wayBill.isManual())
					wayBillViewModel.setWayBillType(wayBillType + WayBillType.WAYBILL_TYPE_MANUAL + " (Crossing)");
				else
					wayBillViewModel.setWayBillType(wayBillType + " (Crossing)");
			} else if(wayBill.isManual())
				wayBillViewModel.setWayBillType(wayBillType + WayBillType.WAYBILL_TYPE_MANUAL);
			else
				wayBillViewModel.setWayBillType(wayBillType);

			final var	consignor = consignorHM.get(wayBill.getWayBillId());
			final var	consignee = consigneeHM.get(wayBill.getWayBillId());

			wayBillViewModel.setWayBillTypeId(wayBill.getWayBillTypeId());
			wayBillViewModel.setManual(wayBill.isManual());
			wayBillViewModel.setConsignerName(consignor.getName());
			wayBillViewModel.setConsignorGstn(Utility.checkedNullCondition(consignor.getGstn(), (short) 2));
			wayBillViewModel.setConsigneeName(consignee.getName());
			wayBillViewModel.setConsigneeGstn(Utility.checkedNullCondition(consignee.getGstn(), (short) 2));
			wayBillViewModel.setConsigneePhoneNo(consignee.getPhoneNumber());
			wayBillViewModel.setConsignerPhoneNo(consignor.getPhoneNumber());
			wayBillViewModel.setConsignmentDetails(wayBillModel.getConsignmentDetails());
			wayBillViewModel.setConsigneeTinNo(Utility.checkedNullCondition(consignee.getTinNo(), (short) 2));
			wayBillViewModel.setDeclaredValue(wayBill.getDeclaredValue());
			wayBillViewModel.setRemark(Utility.checkedNullCondition(wayBill.getRemark(), (short) 2));

			final var sortByWayBillNumber	= lsPrintConfiguration.getBoolean(LsPrintConfigurationDTO.SORT_BY_WAY_BILL_NUMBER, false);

			if(sortByWayBillNumber) {
				final var 	pair	= SplitLRNumber.getNumbers(wayBill.getWayBillNumber());

				wayBillViewModel.setSrcBranchCode(pair != null && pair.getBranchCode() instanceof String ? pair.getBranchCode().toString() : "");
				wayBillViewModel.setWayBillNumberWithoutBranchCode(pair != null && pair.getLrNumber() instanceof Long ? (long) pair.getLrNumber() : 0);
			}

			/** consignment related coding done (per WayBill) Start */
			consignment 	= wayBillDeatailsModel.getConsignmentDetails();

			if(consignment != null) {
				wayBillViewModel.setArticleTypeMasterId(consignment[0].getArticleTypeMasterId());

				if(wayBillViewModel.getArticleTypeMasterId() > 0)
					articleType		= cache.getArticleTypeMasterById(request, wayBillViewModel.getArticleTypeMasterId());
				else
					articleType		= cache.getArticleTypeMasterById(request, ArticleTypeMaster.ARTICLE_TYPE_NONDOCUMENT);

				if(articleType != null)
					wayBillViewModel.setArticleType(Utility.checkedNullCondition(articleType.getName(), (short) 3));
				else
					wayBillViewModel.setArticleType("NA");
			}

			wbPkgs = new HashMap<>();

			for (final DispatchArticleDetails element : dispatchArticleDetailsArray) {
				totalQuantity 	+= element.getQuantity();

				// Create HashMap for Packages of current wayBill
				wbPkg 	= wbPkgs.get(element.getPackingTypeMasterId());

				if(wbPkg != null)
					wbPkg.setTotalQuantity(wbPkg.getTotalQuantity() + element.getQuantity());
				else {
					wbPkg 	= new PackingTypeMaster();

					wbPkg.setPackingTypeMasterId(element.getPackingTypeMasterId());
					wbPkg.setName(element.getPackingTypeName());
					wbPkg.setTotalQuantity(element.getQuantity());
					wbPkgs.put(element.getPackingTypeMasterId(), wbPkg);
				}

				// Create HashMap for total Package Type Details
				pkgType = wbPackingTypeDetails.get(element.getPackingTypeMasterId());

				if(pkgType != null)
					pkgType.setTotalQuantity(pkgType.getTotalQuantity() + element.getQuantity());
				else {
					pkgType = new PackingTypeMaster();

					pkgType.setPackingTypeMasterId(element.getPackingTypeMasterId());
					pkgType.setName(element.getPackingTypeName());
					pkgType.setTotalQuantity(element.getQuantity());
					wbPackingTypeDetails.put(element.getPackingTypeMasterId(), pkgType);
				}
			}

			pkgDetail 	= new StringJoiner("/ ");
			itr 		= wbPkgs.keySet().iterator();

			if(executive.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNTGORUPID_SRS_TRAVELS)
				while(itr.hasNext()) {
					pkg		= wbPkgs.get(Long.parseLong(itr.next().toString()));
					pkgDetail.add(pkgDetail + " " + pkg.getName());
				}
			else
				while(itr.hasNext()) {
					pkg		= wbPkgs.get(Long.parseLong(itr.next().toString()));

					pkgDetail.add(pkg.getTotalQuantity() + " " + pkg.getName());
				}

			wayBillViewModel.setTotalQuantity(totalQuantity);
			wayBillViewModel.setTotalPackagesTypeQuantity(pkgDetail.toString());
			wayBillViewModel.setPackageDetails(pkgType != null ? pkgType.getName() : "");

			if(consignmentSummary != null && consignmentSummary.get(wayBill.getWayBillId()) != null){
				final var coSummary = consignmentSummary.get(wayBill.getWayBillId());

				wayBillViewModel.setWayBillTotalQuantity(coSummary.getQuantity());
				wayBillViewModel.setChargeWeigth(coSummary.getChargeWeight());
				wayBillViewModel.setActualWeight(coSummary.getActualWeight());
				wayBillViewModel.setDeliveryTo(coSummary.getDeliveryTo());
			}


			/** WayBillCharges related coding done (per WayBill) Start */
			wayBillCharges = wayBillDeatailsModel.getWayBillCharges();
			wayBillTaxTxns = wayBillDeatailsModel.getWayBillTaxTxn();

			isShowDoorDly 			= lsPrintConfiguration.getBoolean(LsPrintConfigurationDTO.DATA_FOR_DOORDELIVERY, false);
			isShowFreight 			= lsPrintConfiguration.getBoolean(LsPrintConfigurationDTO.DATA_FOR_FREIGHT, false);
			isShowLoadingChg 		= lsPrintConfiguration.getBoolean(LsPrintConfigurationDTO.DATA_FOR_LOADING_CHARGES, false);
			isShowUnloadingChg 		= lsPrintConfiguration.getBoolean(LsPrintConfigurationDTO.DATA_FOR_UNLOADING, false);
			showPaidAmountByBranch	= lsPrintConfiguration.getBoolean(LsPrintConfigurationDTO.SHOW_PAID_AMOUNT_BY_BRANCH, false);
			branches				= (String) lsPrintConfiguration.get(LsPrintConfigurationDTO.BRANCHES);
			isShowHandlingChg 						= lsPrintConfiguration.getBoolean(LsPrintConfigurationDTO.DATA_FOR_HANDLING, false);
			isShowDoorPickupChg 					= lsPrintConfiguration.getBoolean(LsPrintConfigurationDTO.DATA_FOR_DOORPICKUP, false);
			isShowLRChg 							= lsPrintConfiguration.getBoolean(LsPrintConfigurationDTO.DATA_FOR_LR_CHARGE, false);
			showLoadingChargeAmountWayBillTypeWise	= lsPrintConfiguration.getBoolean(LsPrintConfigurationDTO.SHOW_LOADING_CHARGE_AMOUNT_WAY_BILL_TYPE_WISE,false);
			showAmount								= lsPrintConfiguration.getBoolean("showAmount", false);
			minimumAmount							= lsPrintConfiguration.getString("minimumAmount");
			showTBBAmountBranchWise					= lsPrintConfiguration.getBoolean(LsPrintConfigurationDTO.SHOW_TBB_AMOUNT_BRANCH_WISE, false);


			branchWiseTbbAmountDisplay				= Utility.isIdExistInLongList(lsPrintConfiguration.getHtData(), LsPrintConfigurationDTO.BRANCH_IDS_TO_SHOW_TBB_AMOUNT, executive.getBranchId());

			if(branches != null)
				branchesList			= CollectionUtility.getLongListFromString(branches);

			for (final WayBillCharges wayBillCharge : wayBillCharges) {
				if (isShowDoorDly && wayBillCharge.getWayBillChargeMasterId() == BookingChargeConstant.DOOR_DELIVERY_BOOKING)
					wayBillViewModel.setDoorDelivery(wayBillCharge.getChargeAmount());

				if(isShowDoorPickupChg && wayBillCharge.getWayBillChargeMasterId() == BookingChargeConstant.DOOR_PICKUP)
					wayBillViewModel.setDoorPickup(wayBillCharge.getChargeAmount());

				if(isShowHandlingChg && wayBillCharge.getWayBillChargeMasterId() == BookingChargeConstant.HANDLING)
					wayBillViewModel.setHandling(wayBillCharge.getChargeAmount());

				if(isShowLRChg && wayBillCharge.getWayBillChargeMasterId() == BookingChargeConstant.LR_CHARGE)
					wayBillViewModel.setLrCharge(wayBillCharge.getChargeAmount());

				if(isShowFreight && wayBillCharge.getWayBillChargeMasterId() == BookingChargeConstant.FREIGHT)
					//Added by Anant Chaudhary	20-01-2016
					if(showPaidAmountByBranch)
						wayBillViewModel.setFreight(checkBranchToDonotShowAmount(branchesList, wayBill) ? 0 : wayBillCharge.getChargeAmount());
					else if(showAmount && wayBillCharge.getChargeAmount() <= Utility.getLong(minimumAmount) && wayBill.getWayBillTypeId() != WayBillType.WAYBILL_TYPE_TO_PAY)
						wayBillViewModel.setFreight(0);
					else
						wayBillViewModel.setFreight(wayBillCharge.getChargeAmount());

				if(isShowLoadingChg && wayBillCharge.getWayBillChargeMasterId() == BookingChargeConstant.LOADING)
					//Added by Anant Chaudhary	20-01-2016
					if(showPaidAmountByBranch)
						wayBillViewModel.setLoadingCharge(checkBranchToDonotShowAmount(branchesList, wayBill) ? 0 : wayBillCharge.getChargeAmount());
					else if(!showLoadingChargeAmountWayBillTypeWise || wayBill.getWayBillTypeId() ==  WayBillTypeConstant.WAYBILL_TYPE_TO_PAY)
						wayBillViewModel.setLoadingCharge(wayBillCharge.getChargeAmount());
					else
						wayBillViewModel.setLoadingCharge(0);

				if(isShowUnloadingChg && wayBillCharge.getWayBillChargeMasterId() == BookingChargeConstant.UNLOADING_BOOKING)
					wayBillViewModel.setUnloading(wayBillCharge.getChargeAmount());

				if(wayBillCharge.getWayBillChargeMasterId() == BookingChargeConstant.FOV)
					wayBillViewModel.setFovCharge(wayBillCharge.getChargeAmount());
			}

			var totalTax 		= 0.00;
			var totalDiscount	= 0.00;

			for (final WayBillTaxTxn wayBillTaxTxn : wayBillTaxTxns)
				totalTax += wayBillTaxTxn.getTaxAmount();

			if (wayBillViewModel.getArticleTypeMasterId() == ArticleTypeMaster.ARTICLE_TYPE_DOCUMENT
					&& executive.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNTGORUPID_SHREE_HANNDAA_TRAVELS
					|| showPaidAmountByBranch && checkBranchToDonotShowAmount(branchesList, wayBill))
				wayBill.setBookingTotal(0);
			else if (wayBillViewModel.getArticleTypeMasterId() != ArticleTypeMaster.ARTICLE_TYPE_DOCUMENT
					&& executive.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNTGORUPID_SHREE_HANNDAA_TRAVELS)
				wayBill.setBookingTotal(wayBill.getBookingTotal() - totalTax);

			if(wayBill.isDiscountPercent())
				totalDiscount = Math.round(wayBill.getBookingChargesSum() * wayBill.getBookingDiscountPercentage() / 100);
			else
				totalDiscount = wayBill.getBookingDiscount();

			var 	lodingTotal 		= 0.00;

			wayBillCategoryTypeDetails = wbCategoryTypeDetails.get(wayBillViewModel.getWayBillType());

			if(wayBillCategoryTypeDetails == null) {
				wayBillCategoryTypeDetails = new WayBillCategoryTypeDetails();

				wayBillCategoryTypeDetails.setWayBillType(wayBillViewModel.getWayBillType());
				wayBillCategoryTypeDetails.setWayBillTypeId(wayBillViewModel.getWayBillTypeId());
				wayBillCategoryTypeDetails.setManual(wayBillViewModel.isManual());
				wayBillCategoryTypeDetails.setQuantity(totalQuantity);
				wayBillCategoryTypeDetails.setTotalTax(totalTax);
				wayBillCategoryTypeDetails.setBookingDiscount(totalDiscount);
				wayBillCategoryTypeDetails.setTotalAmount(wayBill.getBookingTotal());
				wayBillCategoryTypeDetails.setBookingCommission(wayBill.getBookingCommission());
				if(showTBBAmountBranchWise && !branchWiseTbbAmountDisplay && wayBill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT) {
					wayBillCategoryTypeDetails.setTotalTax(0);
					wayBillCategoryTypeDetails.setBookingDiscount(0);
					wayBillCategoryTypeDetails.setBookingCommission(0);
					wayBillCategoryTypeDetails.setTotalAmount(0);
				}

				if(consignmentSummary != null && consignmentSummary.get(wayBill.getWayBillId()) != null){
					final var coSummary = consignmentSummary.get(wayBill.getWayBillId());

					wayBillCategoryTypeDetails.setActualWeight(coSummary.getActualWeight());
					wayBillCategoryTypeDetails.setChargeWeight(coSummary.getChargeWeight());
				}

				chargesCollection = new HashMap<>();

				for (final WayBillCharges wayBillCharge : wayBillCharges) {
					if(showPaidAmountByBranch && checkBranchToDonotShowAmount(branchesList, wayBill))
						wayBillCharge.setChargeAmount(0);

					if(showTBBAmountBranchWise && !branchWiseTbbAmountDisplay && wayBill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT)				
						wayBillCharge.setChargeAmount(0);

					if(executive.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNTGORUPID_SHREE_HANNDAA_TRAVELS) {
						if(wayBillViewModel.getArticleTypeMasterId() != ArticleTypeMaster.ARTICLE_TYPE_DOCUMENT)
							chargesCollection.put(wayBillCharge.getWayBillChargeMasterId(), wayBillCharge.getChargeAmount());
						if(wayBillCharge.getWayBillChargeMasterId() == BookingChargeConstant.LOADING)
							lodingTotal += wayBillCharge.getChargeAmount();
					} else if(executive.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNT_GROUP_ID_MECL && wayBillCharge.getWayBillChargeMasterId() == BookingChargeConstant.PAID_LOADING
							&& wayBill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY)
						chargesCollection.put(wayBillCharge.getWayBillChargeMasterId(), 0.00);
					else
						chargesCollection.put(wayBillCharge.getWayBillChargeMasterId(), wayBillCharge.getChargeAmount());

					if(wayBillCharge.getChargeAmount() > 0)
						chargesAllowedToView.add(wayBillCharge.getWayBillChargeMasterId());
				}
				wayBillCategoryTypeDetails.setChargesCollection(chargesCollection);

				wbCategoryTypeDetails.put(wayBillViewModel.getWayBillType(), wayBillCategoryTypeDetails);

			} else {

				wayBillCategoryTypeDetails.setQuantity(wayBillCategoryTypeDetails.getQuantity() + totalQuantity);
				wayBillCategoryTypeDetails.setTotalTax(wayBillCategoryTypeDetails.getTotalTax() + totalTax);
				wayBillCategoryTypeDetails.setBookingDiscount(wayBillCategoryTypeDetails.getBookingDiscount() + totalDiscount);
				wayBillCategoryTypeDetails.setTotalAmount(wayBillCategoryTypeDetails.getTotalAmount() + wayBill.getBookingTotal());
				wayBillCategoryTypeDetails.setBookingCommission(wayBillCategoryTypeDetails.getBookingCommission() +  wayBill.getBookingCommission());

				if(consignmentSummary != null && consignmentSummary.get(wayBill.getWayBillId()) != null){
					final var coSummary = consignmentSummary.get(wayBill.getWayBillId());

					wayBillCategoryTypeDetails.setActualWeight(wayBillCategoryTypeDetails.getActualWeight() + coSummary.getActualWeight());
					wayBillCategoryTypeDetails.setChargeWeight(wayBillCategoryTypeDetails.getChargeWeight() + coSummary.getChargeWeight());
				}

				chargesCollection = wayBillCategoryTypeDetails.getChargesCollection();

				for (final WayBillCharges wayBillCharge : wayBillCharges) {
					if(executive.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNTGORUPID_SHREE_HANNDAA_TRAVELS) {
						if(wayBillViewModel.getArticleTypeMasterId() != ArticleTypeMaster.ARTICLE_TYPE_DOCUMENT)
							if(chargesCollection.get(wayBillCharge.getWayBillChargeMasterId()) != null)
								chargesCollection.put(wayBillCharge.getWayBillChargeMasterId(), chargesCollection.get(wayBillCharge.getWayBillChargeMasterId()) + wayBillCharge.getChargeAmount());
							else
								chargesCollection.put(wayBillCharge.getWayBillChargeMasterId(), wayBillCharge.getChargeAmount());
						if(wayBillCharge.getWayBillChargeMasterId() == BookingChargeConstant.LOADING)
							lodingTotal += wayBillCharge.getChargeAmount();
					} else if(executive.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNT_GROUP_ID_MECL && wayBillCharge.getWayBillChargeMasterId() == BookingChargeConstant.PAID_LOADING
							&& wayBill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY) {
						if(chargesCollection.get(wayBillCharge.getWayBillChargeMasterId()) != null)
							chargesCollection.put(wayBillCharge.getWayBillChargeMasterId(), chargesCollection.get(wayBillCharge.getWayBillChargeMasterId()) + 0.00);
						else
							chargesCollection.put(wayBillCharge.getWayBillChargeMasterId(), 0.00);
					} else if(chargesCollection.get(wayBillCharge.getWayBillChargeMasterId()) != null)
						chargesCollection.put(wayBillCharge.getWayBillChargeMasterId(), chargesCollection.get(wayBillCharge.getWayBillChargeMasterId()) + wayBillCharge.getChargeAmount());
					else
						chargesCollection.put(wayBillCharge.getWayBillChargeMasterId(), wayBillCharge.getChargeAmount());

					if(wayBillCharge.getChargeAmount() > 0)
						chargesAllowedToView.add(wayBillCharge.getWayBillChargeMasterId());
				}
			}

			showDestinationBranchWiseSummery	= lsPrintConfiguration.getBoolean(LsPrintConfigurationDTO.SHOW_DESTINATION_BRANCH_WISE_SUMMERY,false);

			//added by Pradip Yadav.
			if(showDestinationBranchWiseSummery){
				destBranchTypeDetails = wbDestBranchTypeDetails.get(wayBillViewModel.getDestinationBranchId());

				if(destBranchTypeDetails == null){
					destBranchTypeDetails = new WayBillCategoryTypeDetails();
					destBranchTypeDetails.setDestinationBranch(wayBillViewModel.getDestinationBranch());
					destBranchTypeDetails.setNumberOfLr(1);

					if(wayBillViewModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID)
						destBranchTypeDetails.setTotalPaidAmount(wayBill.getBookingTotal());
					else if(wayBillViewModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY)
						destBranchTypeDetails.setTotalToPayAmount(wayBill.getBookingTotal() );

					destBranchTypeDetails.setWayBillType(wayBillViewModel.getWayBillType());
					destBranchTypeDetails.setWayBillTypeId(wayBillViewModel.getWayBillTypeId());
					destBranchTypeDetails.setManual(wayBillViewModel.isManual());
					destBranchTypeDetails.setQuantity(totalQuantity);
					destBranchTypeDetails.setTotalTax(totalTax);
					destBranchTypeDetails.setBookingDiscount(totalDiscount);

					wbDestBranchTypeDetails.put(wayBillViewModel.getDestinationBranchId(), destBranchTypeDetails);
				}else{
					destBranchTypeDetails.setQuantity(destBranchTypeDetails.getQuantity() + totalQuantity);
					destBranchTypeDetails.setTotalTax(destBranchTypeDetails.getTotalTax() + totalTax);
					destBranchTypeDetails.setBookingDiscount(destBranchTypeDetails.getBookingDiscount() + totalDiscount);
					destBranchTypeDetails.setTotalAmount(destBranchTypeDetails.getTotalAmount() + wayBill.getBookingTotal());
					destBranchTypeDetails.setNumberOfLr(destBranchTypeDetails.getNumberOfLr() + 1);

					if(wayBillViewModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID)
						destBranchTypeDetails.setTotalPaidAmount(wayBill.getBookingTotal() + destBranchTypeDetails.getTotalPaidAmount());
					else if(wayBillViewModel.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY)
						destBranchTypeDetails.setTotalToPayAmount(wayBill.getBookingTotal() + destBranchTypeDetails.getTotalToPayAmount());

				}
			}

			/** End */

			if (wayBillViewModel.getArticleTypeMasterId() != ArticleTypeMaster.ARTICLE_TYPE_DOCUMENT
					&& executive.getAccountGroupId() == CargoAccountGroupConstant.ACCOUNTGORUPID_SHREE_HANNDAA_TRAVELS)
				wayBill.setBookingTotal(wayBill.getBookingTotal() - lodingTotal);

			wayBillViewModel.setBookingChargesSum(wayBill.getBookingChargesSum());
			wayBillViewModel.setBookingDiscount(wayBill.getBookingDiscount());
			wayBillViewModel.setBookingTimeServiceTax(wayBill.getBookingTimeServiceTax());

			//Added by Anant Chaudhary	20-01-2016
			if(showPaidAmountByBranch)
				wayBillViewModel.setBookingTotal(checkBranchToDonotShowAmount(branchesList, wayBill) ? 0 : wayBill.getBookingTotal());
			else
				wayBillViewModel.setBookingTotal(wayBill.getBookingTotal());

			if(showTBBAmountBranchWise && !branchWiseTbbAmountDisplay && wayBill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT)				
				wayBillViewModel.setBookingTotal(0);


			wayBillViewModel.setDeliveryChargesSum(wayBill.getDeliveryChargesSum());
			wayBillViewModel.setDeliveryDiscount(wayBill.getDeliveryDiscount());
			wayBillViewModel.setDeliveryTimeServiceTax(wayBill.getDeliveryTimeServiceTax());
			wayBillViewModel.setDeliveryTotal(wayBill.getDeliveryTotal());
			wayBillViewModel.setGrandTotal(wayBill.getGrandTotal());

			if(consignmentSummary != null && consignmentSummary.get(wayBill.getWayBillId()) != null){
				final var coSummary = consignmentSummary.get(wayBill.getWayBillId());

				wayBillViewModel.setActualWeight(coSummary.getActualWeight());
				wayBillViewModel.setChargeWeigth(coSummary.getChargeWeight());
			}

			if(dispatchSummary.getDispatchedWeight() > 0)
				wayBillViewModel.setActualWeight(dispatchSummary.getDispatchedWeight());

			wayBillViewModel.setTotalQuantity(totalQuantity);
			wayBillViewModel.setNoOfArticle(dispatchArticleDetailsArray.length);
			wayBillViewModel.setRemark(Utility.checkedNullCondition(wayBill.getRemark(), (short) 2));
			wayBillViewModel.setAccountGroupId(wayBill.getAccountGroupId());
			wayBillViewModel.setDispatchArticleDetails(dispatchArticleDetailsArray);
			wayBillViewModel.setInvoiceNo(Utility.checkedNullCondition(wayBill.getInvoiceNo(), (short) 2));

			if(wayBill.getStatus() == WayBillStatusConstant.WAYBILL_STATUS_DELIVERED )
				wayBillViewModel.setDeliveryDateTimeString(DateTimeUtility.getDateFromTimeStamp(wayBill.getCreationDateTimeStamp()));
			else
				wayBillViewModel.setDeliveryDateTimeString(" ");

			if(wayBill.geteWayBillNumber() != null)
				eWayBillCount++;

			wayBillViewModel.setEwayBillNumber(wayBill.geteWayBillNumber());

			if (wayBillViewModel.getArticleTypeMasterId() == ArticleTypeMaster.ARTICLE_TYPE_DOCUMENT) {
				totalPackages 		+= totalQuantity;
				totalDocsOnPackages += totalQuantity;

				dispatchLedgerPrintModel.setTotalDocsOnPackages(totalDocsOnPackages);
				dispatchLedgerPrintModel.setTotalPackages(totalPackages);
			} else if (wayBillViewModel.getArticleTypeMasterId() == ArticleTypeMaster.ARTICLE_TYPE_NONDOCUMENT) {
				totalPackages 			+= totalQuantity;
				totalNonDocsOnPackages += totalQuantity;

				dispatchLedgerPrintModel.setTotalNonDocsOnPackages(totalNonDocsOnPackages);
				dispatchLedgerPrintModel.setTotalPackages(totalPackages);
			}

			wayBillViewModel.seteWaybillCount(eWayBillCount);
			wayBillViewModel.setInvalidEwayBill(wayBill.isInvalidEwayBill());
			wayBillViewModel.setWayBillNumber(wayBill.isInvalidEwayBill() ? "**" + wayBill.getWayBillNumber() : wayBill.getWayBillNumber());

			return wayBillViewModel;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private void changeDataForSachin(final WayBillCharges[] wayBillCharges, final WayBill wayBill) throws Exception {

		try {

			for (final WayBillCharges wayBillCharge : wayBillCharges)
				if(wayBillCharge.getWayBillChargeMasterId() == BookingChargeConstant.PAID_LOADING
				&& wayBill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY)
					wayBill.setGrandTotal(wayBill.getGrandTotal() - wayBillCharge.getChargeAmount());

		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private void changeDataForSupaa(final WayBillCharges[] wayBillCharges, final WayBill wayBill) throws Exception {
		try {
			if(wayBill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID
					&& wayBill.getSourceSubRegionId() == SubRegion.SUBREGION_SUPPA_COIMBATORE) {// Coiambator city Id = 624 replaced with subregion
				wayBill.setBookingTotal(0);

				for (final WayBillCharges wayBillCharge : wayBillCharges)
					wayBillCharge.setChargeAmount(0);
			}

		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private boolean checkBranchToDonotShowAmount(final List<Long> branchesList, final WayBill wayBill) {
		return branchesList != null && branchesList.contains(wayBill.getDestinationBranchId()) && wayBill.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID;
	}
}