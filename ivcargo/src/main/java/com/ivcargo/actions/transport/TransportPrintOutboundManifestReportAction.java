package com.ivcargo.actions.transport;

//~--- non-JDK imports --------------------------------------------------------

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.StringJoiner;
import java.util.TreeMap;
import java.util.stream.Stream;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringUtils;

import com.businesslogic.DispatchBLL;
import com.businesslogic.print.LoadingSheetPrintBLL;
import com.businesslogic.properties.impl.PropertyConfigValueBLLImpl;
import com.businesslogic.shortexcess.ShortReceiveBLL;
import com.businesslogic.waybill.FormTypesBLL;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.dto.ArticleTypeMaster;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.properties.constant.LoadingSheetPropertyConstant;
import com.iv.utils.CollectionUtility;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.exception.ExceptionProcess;
import com.iv.utils.utility.SplitLRNumber;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.ivcargo.utils.JsonUtility;
import com.platform.dao.ChargeTypeMasterDao;
import com.platform.dao.ConsignmentSummaryDao;
import com.platform.dao.CrossingAgentMasterDao;
import com.platform.dao.CustomerDetailsDao;
import com.platform.dao.DispatchArticleDetailsDao;
import com.platform.dao.DriverMasterDao;
import com.platform.dao.LoadingSheetSettlementDao;
import com.platform.dao.VehicleAgentMasterDao;
import com.platform.dao.WayBillBookingChargesDao;
import com.platform.dao.WayBillCrossingDao;
import com.platform.dao.WayBillHistoryDao;
import com.platform.dao.reports.CrossingAgentBillClearanceDAO;
import com.platform.dao.reports.WayBillDetailsDAO;
import com.platform.dao.waybill.FormTypesDao;
import com.platform.dto.AccountGroup;
import com.platform.dto.Branch;
import com.platform.dto.ChargeTypeMaster;
import com.platform.dto.ConsignmentDetails;
import com.platform.dto.ConsignmentSummary;
import com.platform.dto.CrossingAgentBillClearance;
import com.platform.dto.CrossingAgentMaster;
import com.platform.dto.CrossingRate;
import com.platform.dto.CustomerDetails;
import com.platform.dto.DispatchArticleDetails;
import com.platform.dto.DispatchLedger;
import com.platform.dto.DispatchSummary;
import com.platform.dto.DriverMaster;
import com.platform.dto.Executive;
import com.platform.dto.LoadingSheetSettlement;
import com.platform.dto.LocationsMapping;
import com.platform.dto.PackingTypeMaster;
import com.platform.dto.PropertiesFileConstants;
import com.platform.dto.SubRegion;
import com.platform.dto.VehicleNumberMaster;
import com.platform.dto.WayBill;
import com.platform.dto.WayBillCharges;
import com.platform.dto.WayBillCrossing;
import com.platform.dto.WayBillTaxTxn;
import com.platform.dto.WayBillType;
import com.platform.dto.configuration.modules.LsConfigurationDTO;
import com.platform.dto.configuration.modules.LsPrintConfigurationDTO;
import com.platform.dto.configuration.modules.LsPrintQuantBasedConfigurationDTO;
import com.platform.dto.constant.FormTypeConstant;
import com.platform.dto.constant.PaymentTypeConstant;
import com.platform.dto.constant.TransCargoAccountGroupConstant;
import com.platform.dto.constant.VehicleOwnerConstant;
import com.platform.dto.constant.WayBillTypeConstant;
import com.platform.dto.model.ChargeTypeModel;
import com.platform.dto.model.DDMSettlementSummaryModel;
import com.platform.dto.model.DispatchLedgerPrintModel;
import com.platform.dto.model.ReportViewModel;
import com.platform.dto.model.SourceWiseWayBillCrossingSummary;
import com.platform.dto.model.WayBillCategoryTypeDetails;
import com.platform.dto.model.WayBillDeatailsModel;
import com.platform.dto.model.WayBillForCrossingHire;
import com.platform.dto.model.WayBillModel;
import com.platform.dto.model.WayBillViewModel;
import com.platform.dto.shortexcess.ShortReceiveArticles;
import com.platform.dto.waybill.FormTypes;
import com.platform.jsonconstant.JsonConstant;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Converter;
import com.platform.utils.PropertiesUtility;
import com.platform.utils.Utility;

public class TransportPrintOutboundManifestReportAction implements Action {

	public static final String TRACE_ID = "TransportPrintOutboundManifestReportAction";

	Executive 										executive 				= null;
	HashMap<Long, PackingTypeMaster> 				wbPackingTypeDetails 	= null;
	HashMap<String, WayBillCategoryTypeDetails> 	wbCategoryTypeDetails 	= null;
	HashMap<Long, WayBillDeatailsModel> 			wayBillDetails 			= null;
	CacheManip 										cache 					= null;
	HashMap<Long, Timestamp> 						bookingDateTime 		= null;
	String 											deliveryPlace 			= null;
	long 											totalPackages 			= 0;
	long 											totalDocsOnPackages 	= 0;
	long 											totalNonDocsOnPackages 	= 0;
	HashMap<Long, CustomerDetails> 					consignorHM 			= null;
	HashMap<Long, CustomerDetails> 					consigneeHM 			= null;
	HashMap<Long, Long> 							packageDetails 			= new HashMap<>();
	ArrayList<Long>									chargesAllowedToView	= new ArrayList<>();
	boolean											formNumberExistsInLS	= false;
	boolean											isAmountShowOnceProperty= false;
	boolean											sortByWayBillNumber		= false;

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String, Object> 							error 							= null;
		DispatchBLL 										dispatchBLL 					= null;
		ValueObject 										inValObj 						= null;
		ValueObject 										outValObj 						= null;
		ValueObject 										configuration 					= null;
		WayBillModel[] 										wayBillModels 					= null;
		Long[] 												wayBillIdArray 					= null;
		DispatchLedgerPrintModel 							dispatchLedgerPrintModel 		= null;
		String 												wayBillIdStr 					= null;
		HashMap<Long, WayBillCrossing> 						crossingColl 					= null;
		WayBillViewModel[] 									wayBillViewList 				= null;
		WayBillViewModel[] 									wayBillDestViewList 			= null;
		ReportViewModel 									reportViewModel 				= null;
		WayBillCrossing 									wayBillCrossing 				= null;
		ChargeTypeModel[] 									bookingCharges 					= null;
		Branch 												branch 							= null;
		HashMap<Long, SourceWiseWayBillCrossingSummary> 	srcWiseCrossingColl 			= null;
		HashMap<Long, ConsignmentSummary> 					conSumColl 						= null;
		SourceWiseWayBillCrossingSummary 					srcWiseWBCrossing 				= null;
		ArrayList<Long> 									crossedWayBillIds 				= null;
		HashMap<Long, Double> 								wbIdWiseCrossingHire 			= null;
		HashMap<Long, Double> 								wbIdWiseDD 						= null;
		DDMSettlementSummaryModel 							ddmSettlementSummaryModel 		= null;
		HashMap<Long, LoadingSheetSettlement> 				lsCollMap 						= null;
		LoadingSheetSettlement 								loadingSheetSettlement 			= null;
		WayBillDeatailsModel 								waybillDetailsModel 			= null;
		WayBillTaxTxn[] 									waybillTax 						= null;
		TreeMap<String, WayBillViewModel> 					destWiseWaybillModHSMap 		= null;
		HashMap<Long, WayBillForCrossingHire> 				bookingCringAgtWBPaymentModule 	= null;
		CrossingAgentMaster									crossingAgentMaster				= null;
		LoadingSheetPrintBLL								loadingSheetPrintBLL			= null;
		HashMap<Long, WayBillViewModel>						netLoadingUnloadingChargeHM		= null;
		HashMap<Long, CrossingRate>							wayBillCrossingRate 			= null;
		var 												taxAmnt 						= 0.00;
		var 											isAllowExecutive 				= false;
		var 											isAllowCookies 					= false;
		String 												executiveIds 					= null;
		HashMap<Long, Long> 								packageCharge 					= null;
		HashMap<Long, DispatchArticleDetails[]>				 dispatchArticlDetailsArrayHM 	= null;
		DispatchArticleDetails[]							 dispatchArticleDetailsArray	= null;
		CrossingAgentBillClearance							crossingAgentBillClearance		= null;
		var 												totalPackets 					= 0L;
		var 												totalParcels 					= 0L;
		String 												quantityBasedCrossing			= null;
		var												forwardToNewLSPrint				= false;
		var												bookingTimeCrossingHire			= false;
		var												bkngTimeCrossingHire			= false;
		var												dlyTimeCrossingHire				= false;
		ValueObject											print							= null;
		ValueObject											valueObject						= null;
		HashMap<Long, WayBillCrossing> 						crossAgtWBPaymentModule 		= null;
		FormTypesBLL										formTypesBLL					= null;
		HashMap<Long, ArrayList<Short>>						formTypesIds					= null;
		var												isAvoidCHOnWeightIfPresentInDB	= false;
		ShortReceiveBLL										shortReceiveBLL					= null;
		HashMap<Long, HashMap<Long, ShortReceiveArticles>>	shortReceiveArticleMap			= null;
		ArrayList<ShortReceiveArticles>						shortReceiveArticleList			= null;
		var												totalShortArticle				= 0L;
		var							lsPrintChangesAllowedAfterDeliveryTimeBillCredit	= true;
		var												isLaserPrint					= false;
		var												sortByDispatchSummaryId			= false;
		var												showZeroAmountForTBBLr			= false;
		var											allowAutoGenerateConEWaybill		= false;
		ArrayList<FormTypes> 							formTypesList						= null;
		String											formNumber							= null;
		ValueObject										lsConfiguration						= null;
		var 											lrDetailsPrint 						= false;
		var												excludePartialLrsInDispatch			= false;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if (ActionStaticUtil.isSystemError(request, error))
				return;

			destWiseWaybillModHSMap 		= new TreeMap<>();
			wbPackingTypeDetails 			= new HashMap<>();
			wbCategoryTypeDetails 			= new HashMap<>();
			wayBillDetails 					= new HashMap<>();
			bookingCringAgtWBPaymentModule 	= new HashMap<>();
			crossAgtWBPaymentModule			= new HashMap<>();
			cache 							= new CacheManip(request);
			executive 						= cache.getExecutive(request);
			dispatchBLL 					= new DispatchBLL();
			loadingSheetPrintBLL			= new LoadingSheetPrintBLL();
			inValObj 						= new ValueObject();
			formTypesBLL					= new FormTypesBLL();
			final var dispatchLedgerId 			= JSPUtility.GetLong(request, "dispatchLedgerId");
			isLaserPrint = JSPUtility.GetBoolean(request, "isLaserPrint", false);
			var k = 0;

			if (request.getParameter("lrDetailsPrint") != null)
				lrDetailsPrint = JSPUtility.GetBoolean(request, "lrDetailsPrint");

			configuration 					= PropertyConfigValueBLLImpl.getInstance().getConfiguration(executive, PropertiesFileConstants.LS_PRINT_LOAD_CONFIG);
			lsConfiguration					= cache.getLsConfiguration(request, executive.getAccountGroupId());
			final var lsConfigHM	= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.DISPATCH);

			allowAutoGenerateConEWaybill	= lsConfiguration.getBoolean(LsConfigurationDTO.ALLOW_AUTO_GENERATE_CON_EWAYBILL, allowAutoGenerateConEWaybill);

			forwardToNewLSPrint 			= configuration.getBoolean(LsPrintConfigurationDTO.NEW_LOADING_SHEET_PRINT, forwardToNewLSPrint);
			bookingTimeCrossingHire			= configuration.getBoolean(LsPrintConfigurationDTO.BOOKING_TIME_CROSSING_HIRE, allowAutoGenerateConEWaybill);
			quantityBasedCrossing 			= (String) configuration.get(LsPrintConfigurationDTO.QUANTITY_BASED_CROSSING);

			isAvoidCHOnWeightIfPresentInDB		= configuration.getBoolean(LsPrintConfigurationDTO.IS_AVOID_CH_ON_WEIGHT_IF_PRESENT_IN_DB);
			lsPrintChangesAllowedAfterDeliveryTimeBillCredit	= configuration.getBoolean(LsPrintConfigurationDTO.LS_PRINT_CHANGES_ALLOWED_AFTER_DELIVERY_TIME_BILL_CREDIT,true);
			sortByDispatchSummaryId			= configuration.getBoolean(LsPrintConfigurationDTO.SORT_BY_DISPATCH_SUMMARY_ID, false);
			showZeroAmountForTBBLr			= configuration.getBoolean(LsPrintConfigurationDTO.SHOW_ZERO_AMOUNT_FOR_TBB_LR, false);
			isAmountShowOnceProperty		= configuration.getBoolean(LsPrintConfigurationDTO.IS_AMOUNT_SHOW_ONCE, false);
			sortByWayBillNumber				= configuration.getBoolean(LsPrintConfigurationDTO.SORT_BY_WAY_BILL_NUMBER, false);
			excludePartialLrsInDispatch		= (boolean) lsConfigHM.getOrDefault(LoadingSheetPropertyConstant.EXCLUDE_PARTIAL_LRS_IN_DISPATCH, false);

			if(forwardToNewLSPrint)
				response.sendRedirect("InterBranch.do?pageId=340&eventId=10&modulename=loadingSheetPrintDestinationWise&masterid="+dispatchLedgerId +"&lrDetailsPrint="+lrDetailsPrint);

			inValObj.put("dispatchLedgerId", dispatchLedgerId);
			inValObj.put("AccountGroupId", executive.getAccountGroupId());

			outValObj 		= dispatchBLL.getTransportPrintOutboundManifest(inValObj);

			outValObj.put("executive", executive);
			outValObj.put("isAvoidCHOnWeightIfPresentInDB", isAvoidCHOnWeightIfPresentInDB);

			dispatchArticlDetailsArrayHM 	= DispatchArticleDetailsDao.getInstance().getDispatchArticleDetailsByDispatchLegerId(dispatchLedgerId);

			if (outValObj.get("wayBillModels") != null && outValObj.get("WayBillIdArray") != null) {

				wayBillModels 	= (WayBillModel[]) outValObj.get("wayBillModels");
				wayBillIdArray 	= (Long[]) outValObj.get("WayBillIdArray");

				wayBillIdStr 	= Utility.GetLongArrayToString(wayBillIdArray);

				if (configuration.getBoolean(LsPrintConfigurationDTO.DATA_FOR_CROSSING_HORE, false))
					wbIdWiseCrossingHire 	= WayBillBookingChargesDao.getInstance().getWayBillChargeMapByWayBillIdsAndChargeMasterId(wayBillIdStr, ChargeTypeMaster.CROSSING_BOOKING);

				if (configuration.getBoolean(LsPrintConfigurationDTO.DATA_FOR_DD, false))
					wbIdWiseDD 				= WayBillBookingChargesDao.getInstance().getWayBillChargeMapByWayBillIdsAndChargeMasterId(wayBillIdStr, ChargeTypeMaster.DD);

				if (bookingTimeCrossingHire || "true".equals(quantityBasedCrossing) )
					crossAgtWBPaymentModule		= WayBillCrossingDao.getInstance().getWayBillCrossingDetailsByDispatchLedgerId(dispatchLedgerId);

				crossingAgentBillClearance = CrossingAgentBillClearanceDAO.getInstance().getCrossingAgentBillClearanceDetails(dispatchLedgerId);

				if(crossAgtWBPaymentModule != null && crossAgtWBPaymentModule.size() > 0)
					bkngTimeCrossingHire	= true;

				if(allowAutoGenerateConEWaybill) {
					formTypesList		= FormTypesDao.getInstance().getFormTypesByWayBillIds(wayBillIdStr);

					if(formTypesList != null)
						for (final FormTypes element : formTypesList)
							if(element.getFormTypesId() == FormTypeConstant.E_WAYBILL_ID) {
								formNumber = element.getFormNumber();

								if(!StringUtils.isEmpty(formNumber)) {
									formNumberExistsInLS = true ;
									break;
								}
							}
				}

				dispatchLedgerPrintModel 	= populateDispatchLedgerPrintModel(request, wayBillModels[0].getDispatchLedger());
				dispatchLedgerPrintModel.setDispatchLedgerId(dispatchLedgerId);

				conSumColl 				= ConsignmentSummaryDao.getInstance().getLimitedConsignmentDetails(wayBillIdStr);
				consignorHM 			= CustomerDetailsDao.getInstance().getConsignorDetailsByWayBillId(wayBillIdStr);
				consigneeHM 			= CustomerDetailsDao.getInstance().getConsigneeDetailsByWayBillId(wayBillIdStr);
				formTypesIds			= formTypesBLL.getFormTypesIdsInDispatchPrint(wayBillIdStr);
				lsCollMap 				= LoadingSheetSettlementDao.getInstance().getLoadingSheetSettlement(dispatchLedgerId);
				crossingAgentMaster		= CrossingAgentMasterDao.getInstance().getCrossingAgentDetailsById(dispatchLedgerPrintModel.getCrossingAgentId());

				request.setAttribute("CrossingAgentMaster", crossingAgentMaster);

				// Get WayBill Details code ( Start )
				wayBillDetails 			= WayBillDetailsDAO.getInstance().getWayBillDetails(wayBillIdArray, true, ChargeTypeMaster.WAYBILL_CHARGETYPE_BOOKING, true, WayBillTaxTxn.WAYBILL_TAX_TXN_TYPE_BOOKING, true);
				// Get WayBill Details code ( End )

				bookingDateTime 		= WayBillHistoryDao.getInstance().getBookedDateFromWayBillHistory(wayBillIdStr);
				srcWiseCrossingColl		= new HashMap<>();
				outValObj.put("dispatchLedgerPrintModel", dispatchLedgerPrintModel);


				if (dispatchLedgerPrintModel.isCrossing()) {
					crossingColl 		= WayBillCrossingDao.getInstance().getWayBillCrossingDetailsByDispatchLedgerId(dispatchLedgerId);

					if (crossingColl != null && crossingColl.size() > 0) {
						crossedWayBillIds = new ArrayList<>();
						dlyTimeCrossingHire = true;
					}
				} else {
					netLoadingUnloadingChargeHM		= loadingSheetPrintBLL.calculateNetLoadingUnloadingCharge(outValObj);
					wayBillCrossingRate				= loadingSheetPrintBLL.getWeightOrQuantityWiseCrossingRate(outValObj);
				}

				if(isAvoidCHOnWeightIfPresentInDB){
					netLoadingUnloadingChargeHM		= loadingSheetPrintBLL.calculateNetLoadingUnloadingCharge(outValObj);
					wayBillCrossingRate				= loadingSheetPrintBLL.getWeightOrQuantityWiseCrossingRate(outValObj);
				}

				if (lsCollMap != null)
					ddmSettlementSummaryModel = new DDMSettlementSummaryModel();

				wayBillViewList = new WayBillViewModel[wayBillModels.length];
				reportViewModel = new ReportViewModel();
				wayBillCrossing = null;
				var topayAmt = 0.00;

				isAllowCookies	= PropertiesUtility.isAllow(configuration.get(LsPrintConfigurationDTO.COOKIES) + "");
				executiveIds 	= PropertiesUtility.getValue(configuration.get(LsPrintConfigurationDTO.EXECUTIVE_IDS) + "");

				final var executiveIds1 = executiveIds.split(",");

				if (isAllowCookies)
					for (final String id : executiveIds1)
						if (Long.parseLong(id) == executive.getExecutiveId()) {
							isAllowExecutive = true;
							break;
						}

				var tbb 		= false;
				var paid 		= false;

				if (isAllowExecutive) {
					final var cookies = request.getCookies();

					for (final Cookie element : cookies) {
						if (StringUtils.equalsIgnoreCase("tbb" + executive.getExecutiveId(), element.getName())
								&& StringUtils.equalsIgnoreCase("true", element.getValue()))
							tbb 	= true;

						if (StringUtils.equalsIgnoreCase("paid" + executive.getExecutiveId(), element.getName())
								&& StringUtils.equalsIgnoreCase("true", element.getValue()))
							paid 	= true;
					}
				}

				for (var i = 0; i < wayBillModels.length; i++) {
					final var	wayBill 					= wayBillModels[i].getWayBill();
					final var 	dispatchSummary 			= wayBillModels[i].getDispatchSummary();

					if(dispatchArticlDetailsArrayHM != null)
						dispatchArticleDetailsArray = dispatchArticlDetailsArrayHM.get(wayBill.getWayBillId());

					final var conSummary	= conSumColl.get(wayBill.getWayBillId());

					if(conSummary != null) {
						wayBill.setDeliveryTo(conSummary.getDeliveryTo());
						wayBill.setConsignorInvoiceNo(conSummary.getInvoiceNo());
						wayBillModels[i].setPrivateMarka(conSummary.getPrivateMarka());
					}

					wayBill.setActualWeight(dispatchSummary.getDispatchedWeight());

					if(formTypesIds != null)
						wayBillModels[i].setFormTypeIds(formTypesIds.get(wayBill.getWayBillId()));

					if (i == 0) {
						reportViewModel = populateReportViewModel(request, reportViewModel, wayBillModels[i]);

						request.setAttribute("ReportViewModel", reportViewModel);
						request.setAttribute("LoggedInBranchDetails", cache.getGenericBranchDetailCache(request, executive.getBranchId()));
					}

					if (crossingColl != null) {
						wayBillCrossing = crossingColl.get(wayBill.getWayBillId());

						if (wayBillCrossing != null)
							crossedWayBillIds.add(wayBill.getWayBillId());
					}

					wayBillViewList[i] = populateWayBillViewModel(request, wayBillModels[i], dispatchLedgerPrintModel, wayBillCrossing, configuration,dispatchArticleDetailsArray, netLoadingUnloadingChargeHM, wayBillCrossingRate , dispatchSummary);

					if(conSummary != null) {
						wayBillViewList[i].setPrivateMarka(conSummary.getPrivateMarka());
						wayBillViewList[i].setActualQuantity(conSummary.getQuantity());
						wayBillViewList[i].setPaymentTypeName(wayBillViewList[i].getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID?"("+PaymentTypeConstant.getPaymentType(conSummary.getPaymentType())+")":"");
					}

					wayBillViewList[i].setDispatchSummaryId(dispatchSummary.getDispatchSummaryId());

					waybillDetailsModel = wayBillDetails.get(wayBill.getWayBillId());

					taxAmnt = 0;

					if (waybillDetailsModel != null) {
						waybillTax 		= waybillDetailsModel.getWayBillTaxTxn();

						if (waybillTax != null)
							for (final WayBillTaxTxn element : waybillTax)
								taxAmnt += element.getTaxAmount();
					}

					wayBillViewList[i].setWayBillTax(taxAmnt);

					if (wbIdWiseCrossingHire != null && wbIdWiseCrossingHire.get(wayBill.getWayBillId()) != null)
						wayBillViewList[i].setBookingCrossingHire(wbIdWiseCrossingHire.get(wayBill.getWayBillId()));

					if (wbIdWiseDD != null && wbIdWiseDD.get(wayBill.getWayBillId()) != null)
						if(isAmountShowOnceProperty) {
							if(dispatchSummary.isAmountShow())
								wayBillViewList[i].setBookingDD(wbIdWiseDD.get(wayBill.getWayBillId()));
						} else
							wayBillViewList[i].setBookingDD(wbIdWiseDD.get(wayBill.getWayBillId()));

					if (lsCollMap != null && lsCollMap.get(wayBill.getWayBillId()) != null)
						wayBillViewList[i].setPaymentType(lsCollMap.get(wayBill.getWayBillId()).getPaymentTypeId());
					else
						wayBillViewList[i].setPaymentType((short) 0);

					if (executive.getAccountGroupId() == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_LMT || executive.getAccountGroupId() == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_SVRL)
						destWiseWaybillModHSMap.put(wayBillViewList[i].getDestinationBranch() + "_" + wayBillViewList[i].getWayBillId(), wayBillViewList[i]);

					if(bookingTimeCrossingHire && crossAgtWBPaymentModule != null && crossAgtWBPaymentModule.size() > 0 && crossAgtWBPaymentModule.get(wayBillViewList[i].getWayBillId()) != null){
						wayBillViewList[i].setCrossingHire(crossAgtWBPaymentModule.get(wayBillViewList[i].getWayBillId()).getCrossingHire());
						wayBillViewList[i].setAdditionalAdvance(crossAgtWBPaymentModule.get(wayBillViewList[i].getWayBillId()).getAdditionalAdvance());
					}
					// Source Wise Collection (Start)
					srcWiseWBCrossing = srcWiseCrossingColl.get(wayBillViewList[i].getSourceBranchId());

					topayAmt = 0.00;

					if (wayBillViewList[i].getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY)
						topayAmt = wayBillViewList[i].getBookingTotal();

					if(!lsPrintChangesAllowedAfterDeliveryTimeBillCredit
							&& wayBillViewList[i].getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT && wayBillViewList[i].isDeliveryTimeTBB())
						topayAmt = wayBillViewList[i].getBookingTotal();

					if (srcWiseWBCrossing == null) {

						srcWiseWBCrossing = new SourceWiseWayBillCrossingSummary();

						srcWiseWBCrossing.setTopayLRAmt(topayAmt);
						srcWiseWBCrossing.setCrossingHire(wayBillViewList[i].getCrossingHire());
						srcWiseWBCrossing.setDoorDelivery(wayBillViewList[i].getDoorDelivery());
						srcWiseWBCrossing.setRecoveryAmt(topayAmt - wayBillViewList[i].getCrossingHire());
						srcWiseWBCrossing.setSourceBranchId(wayBillViewList[i].getSourceBranchId());
						srcWiseWBCrossing.setSourceBranch(cache.getGenericBranchDetailCache(request, srcWiseWBCrossing.getSourceBranchId()).getName());
						srcWiseWBCrossing.setSourceSubRegionId(wayBillViewList[i].getSourceSubRegionId());

						srcWiseCrossingColl.put(srcWiseWBCrossing.getSourceBranchId(), srcWiseWBCrossing);
					} else {

						srcWiseWBCrossing.setTopayLRAmt(srcWiseWBCrossing.getTopayLRAmt() + topayAmt);
						srcWiseWBCrossing.setCrossingHire(srcWiseWBCrossing.getCrossingHire() + wayBillViewList[i].getCrossingHire());
						srcWiseWBCrossing.setDoorDelivery(srcWiseWBCrossing.getDoorDelivery() + wayBillViewList[i].getDoorDelivery());
						srcWiseWBCrossing.setRecoveryAmt(srcWiseWBCrossing.getRecoveryAmt() + (topayAmt - wayBillViewList[i].getCrossingHire()));
					}
					// Source Wise Collection (Start)

					if (lsCollMap != null && lsCollMap.get(wayBillViewList[i].getWayBillId()) != null) {
						loadingSheetSettlement = lsCollMap.get(wayBillViewList[i].getWayBillId());

						if (loadingSheetSettlement != null && (wayBillViewList[i].getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY
								|| wayBillViewList[i].getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT && tbb
								|| wayBillViewList[i].getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID && paid)) {

							ddmSettlementSummaryModel.setTotalRecoveryAmount(ddmSettlementSummaryModel.getTotalRecoveryAmount() + wayBillViewList[i].getGrandTotal());
							ddmSettlementSummaryModel.setTotalLRs(ddmSettlementSummaryModel.getTotalLRs() + 1);
							ddmSettlementSummaryModel.setTotalDiscountedAmount(ddmSettlementSummaryModel.getTotalDiscountedAmount() + loadingSheetSettlement.getSettlementDisc());

							if (loadingSheetSettlement.getPaymentTypeId() == PaymentTypeConstant.PAYMENT_TYPE_CREDIT_ID) {
								ddmSettlementSummaryModel.setTotalShortCreditAmount(ddmSettlementSummaryModel.getTotalShortCreditAmount() + (wayBillViewList[i].getGrandTotal() - loadingSheetSettlement.getSettlementDisc()));
								ddmSettlementSummaryModel.setTotalShortCreditLRs(ddmSettlementSummaryModel.getTotalShortCreditLRs() + 1);
							} else if (loadingSheetSettlement.getPaymentTypeId() == PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID) {
								ddmSettlementSummaryModel.setTotalChequeAmount(ddmSettlementSummaryModel.getTotalChequeAmount() + (wayBillViewList[i].getGrandTotal() - loadingSheetSettlement.getSettlementDisc()));
								ddmSettlementSummaryModel.setTotalChequeLRs(ddmSettlementSummaryModel.getTotalChequeLRs() + 1);
								ddmSettlementSummaryModel.setTotalReceivedAmount(ddmSettlementSummaryModel.getTotalReceivedAmount() + (wayBillViewList[i].getGrandTotal() - loadingSheetSettlement.getSettlementDisc()));
							} else if (loadingSheetSettlement.getPaymentTypeId() == PaymentTypeConstant.PAYMENT_TYPE_CASH_ID) {
								ddmSettlementSummaryModel.setTotalCashAmount(ddmSettlementSummaryModel.getTotalCashAmount() + (wayBillViewList[i].getGrandTotal() - loadingSheetSettlement.getSettlementDisc()));
								ddmSettlementSummaryModel.setTotalCashLRs(ddmSettlementSummaryModel.getTotalCashLRs() + 1);
								ddmSettlementSummaryModel.setTotalReceivedAmount(ddmSettlementSummaryModel.getTotalReceivedAmount() + (wayBillViewList[i].getGrandTotal() - loadingSheetSettlement.getSettlementDisc()));
							} else if (loadingSheetSettlement.getPaymentTypeId() == PaymentTypeConstant.PAYMENT_TYPE_BILL_CREDIT_ID) {
								ddmSettlementSummaryModel.setTotalBillCreditAmount(ddmSettlementSummaryModel.getTotalBillCreditAmount() + (wayBillViewList[i].getGrandTotal() - loadingSheetSettlement.getSettlementDisc()));
								ddmSettlementSummaryModel.setTotalBillCreditLRs(ddmSettlementSummaryModel.getTotalBillCreditLRs() + 1);
							}
						}
					}
				}

				// get the total qty of Packets and Parcels in an LR
				for (final Map.Entry<Long, Long> entry : packageDetails.entrySet())
					if (entry.getKey() == PackingTypeMaster.PACKING_TYPE_PACKET)
						totalPackets = entry.getValue();
					else if (entry.getKey() == PackingTypeMaster.PACKING_TYPE_PARCEL)
						totalParcels = entry.getValue();

				// put the total qty of packets and parcels in hashmap
				packageCharge = new HashMap<>();
				packageCharge.put(PackingTypeMaster.PACKING_TYPE_PACKET, totalPackets);
				packageCharge.put(PackingTypeMaster.PACKING_TYPE_PARCEL, totalParcels);

				request.setAttribute("packageDetailsTotal", packageCharge);
				request.setAttribute("QuantityBasedCrossing", quantityBasedCrossing);

				if ("true".equals(quantityBasedCrossing)) {
					bookingCringAgtWBPaymentModule		= WayBillCrossingDao.getInstance().getWayBillCrossingHireByWayBillIds(wayBillIdStr, WayBillCrossing.TRANSACTION_TYPE_BOOKING_CROSSING);
					setCrossingAmntQuantityBased(request, wayBillViewList, dispatchLedgerPrintModel, bookingCringAgtWBPaymentModule,  dispatchArticlDetailsArrayHM);
				}

				if (destWiseWaybillModHSMap != null && destWiseWaybillModHSMap.size() > 0) {
					wayBillDestViewList = new WayBillViewModel[destWiseWaybillModHSMap.size()];

					for (final Map.Entry<String, WayBillViewModel> entry : destWiseWaybillModHSMap.entrySet()) {
						wayBillDestViewList[k] = entry.getValue();
						k++;
					}
				}
				if (sortByDispatchSummaryId) {
					final var wayBillViewDataList = new ArrayList<WayBillViewModel>();
					Collections.addAll(wayBillViewDataList, wayBillViewList);
					wayBillViewDataList.sort(Comparator.comparing(WayBillViewModel::getDispatchSummaryId).reversed());

					wayBillViewList = new WayBillViewModel[wayBillViewDataList.size()];
					wayBillViewDataList.toArray(wayBillViewList);
				}

				if (sortByWayBillNumber) {
					final var wayBillViewDataList = new ArrayList<WayBillViewModel>();
					Collections.addAll(wayBillViewDataList, wayBillViewList);
					wayBillViewDataList.sort(Comparator.comparing(WayBillViewModel::getSrcBranchCode).thenComparing(WayBillViewModel::getWayBillNumberWithoutBranchCode));

					wayBillViewList = new WayBillViewModel[wayBillViewDataList.size()];
					wayBillViewDataList.toArray(wayBillViewList);
				}

				request.setAttribute("ddmSettlementSummaryModel", ddmSettlementSummaryModel);
				request.setAttribute("srcWiseCrossingColl", srcWiseCrossingColl);
				request.setAttribute("dispatchLedger", dispatchLedgerPrintModel);
				request.setAttribute("wayBillViewList", wayBillViewList);
				request.setAttribute("bkngTimeCrossingHire", bkngTimeCrossingHire);
				request.setAttribute("dlyTimeCrossingHire", dlyTimeCrossingHire);
				request.setAttribute("bookingTimeCrossingHire", bookingTimeCrossingHire);
				request.setAttribute("crossedWayBillIds", crossedWayBillIds);
				request.setAttribute("wayBillDestViewList", destWiseWaybillModHSMap);
				request.setAttribute("isAllowExecutive", isAllowExecutive);
				request.setAttribute("wayBillDestViewListArr", wayBillDestViewList);
				request.setAttribute("crossingAgentBillClearance", crossingAgentBillClearance);
				request.setAttribute("showZeroAmountForTBBLr", showZeroAmountForTBBLr);
				request.setAttribute("excludePartialLrsInDispatch", excludePartialLrsInDispatch);

				if ("Dispatched".equals(request.getParameter("Type")))
					request.setAttribute("Type", "Dispatch");
				else
					request.setAttribute("Type", "Branch Transfer");

				request.setAttribute("packageTypeDetails", wbPackingTypeDetails);
				request.setAttribute("wayBillTypeDetails", wbCategoryTypeDetails);

				branch = cache.getGenericBranchDetailCache(request,dispatchLedgerPrintModel.getSourceBranchId());

				if (branch.getMappingTypeId() == Branch.BRANCH_MAP_ID_OWN_BRANCH_AND_ASSIGNED)
					bookingCharges 		= cache.getBookingCharges(request, executive.getBranchId());
				else {
					bookingCharges 		= cache.getBookingCharges(request, dispatchLedgerPrintModel.getSourceBranchId());

					if (bookingCharges == null)
						bookingCharges = ChargeTypeMasterDao.getInstance().getChargeConfiguration(wayBillViewList[0].getAccountGroupId(), branch.getAgencyId(), branch.getBranchId(), ChargeTypeMaster.WAYBILL_CHARGETYPE_BOOKING);
				}

				if (configuration.getBoolean(LsPrintConfigurationDTO.SHOW_SHORT_LR_DETAILS_IN_PRINT)) {
					shortReceiveBLL	= new ShortReceiveBLL();
					shortReceiveArticleMap	= shortReceiveBLL.getBranchWiseShortReceiveDetailsByWayBillIds(wayBillIdStr);

					if (shortReceiveArticleMap != null && !shortReceiveArticleMap.isEmpty()) {
						shortReceiveArticleList	= new ArrayList<>();

						for (final Map.Entry<Long, HashMap<Long, ShortReceiveArticles>> entry : shortReceiveArticleMap.entrySet()) {
							final var shortReceiveArticleMap2	= entry.getValue();

							for (final Map.Entry<Long, ShortReceiveArticles> entry1 : shortReceiveArticleMap2.entrySet()) {
								final var shortReceiveArticles	= entry1.getValue();

								branch	= cache.getGenericBranchDetailCache(request, shortReceiveArticles.getBranchId());

								shortReceiveArticles.setBranchName(branch != null ? branch.getName() : "--");

								totalShortArticle	+= shortReceiveArticles.getShortArticle();
								shortReceiveArticleList.add(shortReceiveArticles);
							}
						}

						request.setAttribute("shortReceiveDetails", shortReceiveArticleList);
						request.setAttribute("totalShortArticle", totalShortArticle);
					}
				}

				request.setAttribute("chargesAllowedToView", chargesAllowedToView);
				request.setAttribute("wayBillCharges", bookingCharges);

				print  = new ValueObject();

				print.put("crossingAgentBillClearance", Converter.DtoToHashMap(crossingAgentBillClearance));

				JsonConstant.getInstance().setOutputConstant(print);

				valueObject		= new ValueObject();
				valueObject.put("printJson", print);

				final var object = JsonUtility.convertionToJsonObjectForResponse(valueObject);

				request.setAttribute("printJsonObject", object);
				request.setAttribute("nextPageToken", "success_" + executive.getAccountGroupId());
				if(isLaserPrint)
					request.setAttribute("nextPageToken", "success_laser_"+executive.getAccountGroupId());
				else
					request.setAttribute("nextPageToken", "success_" + executive.getAccountGroupId());

			} else {
				error.put("errorCode", CargoErrorList.NO_RECORDS);
				error.put("errorDescription", CargoErrorList.NO_RECORDS_DESCRIPTION);
				request.setAttribute("cargoError", error);
				request.setAttribute("nextPageToken", "success_" + executive.getAccountGroupId());
			}
		} catch (final Exception e) {
			ExceptionProcess.execute(e, TransportPrintOutboundManifestReportAction.TRACE_ID);
		}
	}

	public ReportViewModel populateReportViewModel(final HttpServletRequest request,
			final ReportViewModel reportViewModel, final WayBillModel wayBillModel) throws Exception {

		WayBill 			wayBill 		= null;
		Branch 				branch 			= null;
		AccountGroup 		accountGroup 	= null;

		try {
			wayBill = wayBillModel.getWayBill();

			branch 			= cache.getGenericBranchDetailCache(request,wayBill.getSourceBranchId());
			accountGroup 	= cache.getAccountGroupById(request, executive.getAccountGroupId());

			reportViewModel.setBranchPhoneNumber(branch.getPhoneNumber());
			reportViewModel.setBranchAddress(branch.getAddress());
			reportViewModel.setAccountGroupName(accountGroup.getDescription());

			return reportViewModel;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		} finally {
			wayBill 		= null;
			branch 			= null;
			accountGroup 	= null;
		}
	}

	public DispatchLedgerPrintModel populateDispatchLedgerPrintModel(final HttpServletRequest request, final DispatchLedger dispatchLedger) throws Exception {
		DispatchLedgerPrintModel 	dispatchLedgerPrintModel 	= null;
		Branch 						srcbranch 					= null;
		Branch 						destbranch 					= null;
		SubRegion					subRegion					= null;
		VehicleNumberMaster 		vehicleNmMst 				= null;
		AccountGroup				accountGroup				= null;
		Branch						dispatchBranch				= null;
		LocationsMapping 			locationMap 				= null;
		DriverMaster				driverMaster1				= null;
		DriverMaster				driverMaster2				= null;

		try {
			dispatchLedgerPrintModel = new DispatchLedgerPrintModel(dispatchLedger);

			vehicleNmMst 			= cache.getVehicleNumber(request, executive.getAccountGroupId(), dispatchLedger.getVehicleNumberMasterId());
			accountGroup			= cache.getAccountGroupByAccountGroupId(request, executive.getAccountGroupId());

			if(vehicleNmMst != null)
				if (vehicleNmMst.getVehicleTypeId() == VehicleOwnerConstant.OWN_VEHICLE_ID)
					dispatchLedgerPrintModel.setVehicleOwnerName(accountGroup.getDescription());
				else
					dispatchLedgerPrintModel.setVehicleOwnerName(vehicleNmMst.getRegisteredOwner() == null ? " " : vehicleNmMst.getRegisteredOwner());

			srcbranch = cache.getGenericBranchDetailCache(request, dispatchLedger.getSourceBranchId());
			dispatchLedgerPrintModel.setSourceBranch(srcbranch.getName());

			subRegion = cache.getGenericSubRegionById(request, srcbranch.getSubRegionId());
			dispatchLedgerPrintModel.setSourceSubRegion(subRegion.getName());

			if(dispatchLedger.getDispatchExecutive() != null)
				dispatchLedgerPrintModel.setDispatchExecutive(dispatchLedger.getDispatchExecutive());
			else
				dispatchLedgerPrintModel.setDispatchExecutive("--");

			if (dispatchLedger.getDestinationBranchId() > 0) {
				destbranch 	= cache.getGenericBranchDetailCache(request, dispatchLedger.getDestinationBranchId());
				dispatchLedgerPrintModel.setDestinationBranch(destbranch.getName());
				dispatchLedgerPrintModel.setTypeOfLocation(destbranch.getTypeOfLocation());

				locationMap = cache.getActiveLocationMapping(request, executive.getAccountGroupId(), destbranch.getBranchId());

				if(destbranch.getTypeOfLocation() == Branch.TYPE_OF_LOCATION_OPERATIONAL_PLACE && locationMap != null)
					dispatchLedgerPrintModel.setHandlingBranch(cache.getGenericBranchDetailCache(request, locationMap.getLocationId()).getName());
			} else
				dispatchLedgerPrintModel.setDestinationBranch(deliveryPlace);

			if (dispatchLedger.getDestinationSubRegionId() > 0) {
				subRegion = cache.getGenericSubRegionById(request, destbranch.getSubRegionId());
				dispatchLedgerPrintModel.setDestinationSubRegion(subRegion.getName());
			} else
				dispatchLedgerPrintModel.setDestinationSubRegion(deliveryPlace);

			dispatchLedgerPrintModel.setSourceSubRegionId(dispatchLedger.getSourceSubRegionId());
			dispatchLedgerPrintModel.setSourceBranchId(dispatchLedger.getSourceBranchId());
			dispatchLedgerPrintModel.setDestinationSubRegionId(dispatchLedger.getDestinationSubRegionId());
			dispatchLedgerPrintModel.setDestinationBranchId(dispatchLedger.getDestinationBranchId());
			dispatchLedgerPrintModel.setSuperVisor(dispatchLedger.getSuperVisor());
			dispatchLedgerPrintModel.setRemark(dispatchLedger.getRemark());
			dispatchLedgerPrintModel.setDriver1MobileNumber1(dispatchLedger.getDriver1MobileNumber1() != null ? dispatchLedger.getDriver1MobileNumber1() : "");
			dispatchLedgerPrintModel.setDriver1MobileNumber2(dispatchLedger.getDriver1MobileNumber2() != null ? dispatchLedger.getDriver1MobileNumber2() : "");
			dispatchLedgerPrintModel.setDriver2MobileNumber(dispatchLedger.getDriver2MobileNo() != null ? dispatchLedger.getDriver2MobileNo() : "");

			if (dispatchLedger.getVehicleAgentId() > 0)
				dispatchLedgerPrintModel.setVehicleAgentName(VehicleAgentMasterDao.getInstance().getSingleVehicleAgentDetails(dispatchLedger.getVehicleAgentId()).getName());
			else
				dispatchLedgerPrintModel.setVehicleAgentName("");

			if (dispatchLedger.getDriverId() > 0) {
				driverMaster1 = DriverMasterDao.getInstance().getDriverDataById(dispatchLedger.getDriverId(), executive.getAccountGroupId());
				dispatchLedgerPrintModel.setDriverLicenceNumber(driverMaster1 != null ? driverMaster1.getLicenceNumber() : "");
			} else
				dispatchLedgerPrintModel.setDriverLicenceNumber("");

			if (dispatchLedger.getDriver2Id() > 0) {
				driverMaster2 = DriverMasterDao.getInstance().getDriverDataById(dispatchLedger.getDriver2Id(), executive.getAccountGroupId());
				dispatchLedgerPrintModel.setDriver2LicenceNumber(driverMaster2 != null ? driverMaster2.getLicenceNumber() : "");
			} else
				dispatchLedgerPrintModel.setDriver2LicenceNumber("");

			dispatchLedgerPrintModel.setLsNumber(dispatchLedger.getLsNumber());
			dispatchLedgerPrintModel.setLsBranchId(dispatchLedger.getLsBranchId());

			dispatchBranch = cache.getGenericBranchDetailCache(request, dispatchLedger.getLsBranchId());
			dispatchLedgerPrintModel.setLsBranchName(dispatchBranch.getName());
			dispatchLedgerPrintModel.setCrossing(dispatchLedger.isCrossing());
			dispatchLedgerPrintModel.setCrossingAgentId(dispatchLedger.getCrossingAgentId());
			dispatchLedgerPrintModel.setPanNumber(vehicleNmMst.getPanNumber());

			if (dispatchLedger.getWeighbridge() > 0)
				dispatchLedgerPrintModel.setWeighbridge(dispatchLedger.getWeighbridge());

			if(!StringUtils.isEmpty(dispatchLedger.getTceConsolidatedEwaybillNumber()))
				if(!StringUtils.isEmpty(dispatchLedger.getConsolidatedEwaybillNumber()))
					dispatchLedger.setConsolidatedEwaybillNumber(dispatchLedger.getConsolidatedEwaybillNumber() + "," + dispatchLedger.getTceConsolidatedEwaybillNumber());
				else
					dispatchLedger.setConsolidatedEwaybillNumber(dispatchLedger.getTceConsolidatedEwaybillNumber());

			if(formNumberExistsInLS) {
				if(!StringUtils.isEmpty(dispatchLedger.getConsolidatedEwaybillNumber()))
					dispatchLedgerPrintModel.setConsolidatedEwaybillNumber(dispatchLedger.getConsolidatedEwaybillNumber());
				else
					dispatchLedgerPrintModel.setConsolidatedEwaybillNumber("Pending");
			} else
				dispatchLedgerPrintModel.setConsolidatedEwaybillNumber("Not Required");

			dispatchLedgerPrintModel.setBillSelectionId(dispatchLedger.getBillSelectionId());

			return dispatchLedgerPrintModel;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		} finally {
			dispatchLedgerPrintModel 	= null;
			srcbranch 					= null;
			destbranch 					= null;
		}
	}

	@SuppressWarnings("unchecked")
	public WayBillViewModel populateWayBillViewModel(final HttpServletRequest request, final WayBillModel wayBillModel, final DispatchLedgerPrintModel dispatchLedgerPrintModel, final WayBillCrossing wayBillCrossing, final ValueObject configuration,final DispatchArticleDetails[]	 dispatchArticleDetailsArray, final HashMap<Long, WayBillViewModel> netLoadingUnloadingChargeHM, final HashMap<Long, CrossingRate> wayBillCrossingRate , final DispatchSummary dispatchSummary) throws Exception {

		WayBill 							wayBill 					= null;
		WayBillType 						wayBillType 				= null;
		WayBillDeatailsModel 				wayBillDeatailsModel 		= null;
		WayBillViewModel 					wayBillViewModel 			= null;
		WayBillCategoryTypeDetails 			wayBillCategoryTypeDetails 	= null;
		PackingTypeMaster 					wbPkg	 					= null;
		PackingTypeMaster 					pkgType 					= null;
		PackingTypeMaster 					pkg 						= null;
		Branch 								branch 						= null;
		SubRegion							subRegion					= null;
		StringJoiner						pkgDetail 					= null;
		StringJoiner						consignmentPkgDetails 		= null;
		Iterator<Long> 						itr 						= null;
		ConsignmentDetails[] 				consignment 				= null;
		WayBillCharges[] 					wayBillCharges 				= null;
		WayBillTaxTxn[] 					wayBillTaxTxns 				= null;
		HashMap<Long, PackingTypeMaster> 	wbPkgs 						= null;
		HashMap<Long, Double> 				chargesCollection 			= null;
		HashMap<Long, Double> 				wayBillchargesCollection 	= null;
		CustomerDetails 					consignor 					= null;
		CustomerDetails 					consignee 					= null;
		StringJoiner						saidToContainStr 				= null;
		var								crossingHireRateAllow			= false;
		var								isAvoidCHOnWeightIfPresentInDB	= false;
		LocationsMapping 					locationMap 				= null;

		try {

			wayBill 				= wayBillModel.getWayBill();
			wayBillDeatailsModel 	= wayBillDetails.get(wayBill.getWayBillId());
			wayBillViewModel 		= new WayBillViewModel();

			crossingHireRateAllow				= configuration.getBoolean(LsPrintConfigurationDTO.CROSSING_HIRE_RATE_ALLOW, false);
			isAvoidCHOnWeightIfPresentInDB		= configuration.getBoolean(LsPrintConfigurationDTO.IS_AVOID_CH_ON_WEIGHT_IF_PRESENT_IN_DB);

			branch 			= cache.getGenericBranchDetailCache(request, wayBill.getDestinationBranchId());

			wayBillViewModel.setDestinationBranch(branch.getName());
			wayBillViewModel.setDestinationBranchId(wayBill.getDestinationBranchId());
			wayBillViewModel.setTypeOfLocation(branch.getTypeOfLocation());
			wayBill.setDestinationSubRegionId(branch.getSubRegionId());

			subRegion = cache.getGenericSubRegionById(request, wayBill.getDestinationSubRegionId());
			wayBillViewModel.setDestinationSubRegion(subRegion.getName());

			locationMap = cache.getActiveLocationMapping(request, executive.getAccountGroupId(), wayBill.getDestinationBranchId());

			if(branch.getTypeOfLocation() == Branch.TYPE_OF_LOCATION_OPERATIONAL_PLACE && locationMap != null)
				wayBillViewModel.setHandlingBranch(cache.getGenericBranchDetailCache(request, locationMap.getLocationId()).getName());

			branch 			= cache.getGenericBranchDetailCache(request, wayBill.getSourceBranchId());
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

			wayBillType 	= cache.getWayBillTypeById(request, wayBill.getWayBillTypeId());

			if(wayBillType != null)
				if (wayBill.isManual())
					wayBillViewModel.setWayBillType(wayBillType.getWayBillType() + WayBillType.WAYBILL_TYPE_MANUAL);
				else
					wayBillViewModel.setWayBillType(wayBillType.getWayBillType());

			consignor = consignorHM.get(wayBill.getWayBillId());
			consignee = consigneeHM.get(wayBill.getWayBillId());

			wayBillViewModel.setWayBillTypeId(wayBill.getWayBillTypeId());
			wayBillViewModel.setConsignerName(consignor.getName());
			wayBillViewModel.setConsigneeName(consignee.getName());
			wayBillViewModel.setConsigneePhoneNo(consignee.getPhoneNumber());
			wayBillViewModel.setConsignmentDetails(wayBillModel.getConsignmentDetails());
			wayBillViewModel.setStatus(wayBill.getStatus());
			wayBillViewModel.setConsigneeAddress(consignee.getAddress());

			if (bookingDateTime != null && bookingDateTime.get(wayBill.getWayBillId()) != null)
				wayBillViewModel.setCreationDateTimeStamp(bookingDateTime.get(wayBill.getWayBillId()));

			/** consignment related coding done (per WayBill) Start */
			consignment 	= wayBillDeatailsModel.getConsignmentDetails();

			wayBillViewModel.setConsignmentDetails(consignment);

			wayBillViewModel.setArticleTypeMasterId(consignment[0].getArticleTypeMasterId());

			var 	totalQuantity = 0L;
			wbPkgs 	= new HashMap<>();
			saidToContainStr	= new StringJoiner("/");

			if(dispatchArticleDetailsArray != null)
				for (final DispatchArticleDetails element : dispatchArticleDetailsArray) {
					totalQuantity = totalQuantity + element.getQuantity();

					// Create HashMap for Packages of current wayBill
					wbPkg = wbPkgs.get(element.getPackingTypeMasterId());

					if(wbPkg !=null)
						wbPkg.setTotalQuantity(wbPkg.getTotalQuantity()+element.getQuantity());
					else {
						wbPkg = new PackingTypeMaster();
						wbPkg.setPackingTypeMasterId(element.getPackingTypeMasterId());
						wbPkg.setName(element.getPackingTypeName());
						wbPkg.setTotalQuantity(element.getQuantity());
						wbPkgs.put(element.getPackingTypeMasterId(),wbPkg);
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
						wbPackingTypeDetails.put(element.getPackingTypeMasterId(),pkgType);
					}

					final var saidToContain	= Stream.of(consignment)
							.filter(e -> e.getPackingTypeMasterId() == element.getPackingTypeMasterId()
							&& e.getConsignmentDetailsId() == element.getConsignmentDetailsId())
							.findFirst().orElse(new ConsignmentDetails()).getSaidToContain();

					if(saidToContain != null)
						saidToContainStr.add(saidToContain);
				}

			for (final Map.Entry<Long, PackingTypeMaster> entry : wbPkgs.entrySet())
				if (packageDetails.size() <= 0 || !packageDetails.containsKey(entry.getKey()))
					packageDetails.put(entry.getKey(), entry.getValue().getTotalQuantity());
				else
					packageDetails.put(entry.getKey(), packageDetails.get(entry.getKey()) + entry.getValue().getTotalQuantity());

			wayBillViewModel.setSaidToContain(saidToContainStr.toString());

			pkgDetail 				= new StringJoiner("/ ");
			consignmentPkgDetails 	= new StringJoiner("/ ");
			itr = wbPkgs.keySet().iterator();

			while (itr.hasNext()) {
				pkg = wbPkgs.get(Long.parseLong(itr.next().toString()));

				pkgDetail.add(pkg.getName());
				consignmentPkgDetails.add(pkg.getTotalQuantity() + " " + pkg.getName());
			}

			wayBillViewModel.setTotalPackagesTypeQuantity(pkgDetail.toString());

			/** WayBillCharges related coding done (per WayBill) Start */

			wayBillCharges = wayBillDeatailsModel.getWayBillCharges();
			wayBillTaxTxns = wayBillDeatailsModel.getWayBillTaxTxn();

			var totalTax 		= 0.00;
			var totalDiscount 	= 0.00;

			for (final WayBillTaxTxn wayBillTaxTxn : wayBillTaxTxns)
				totalTax += wayBillTaxTxn.getTaxAmount();

			if (wayBill.isDiscountPercent())
				totalDiscount = Math.round(wayBill.getBookingChargesSum() * wayBill.getBookingDiscountPercentage() / 100);
			else
				totalDiscount = wayBill.getBookingDiscount();

			wayBillCategoryTypeDetails 	= wbCategoryTypeDetails.get(wayBillViewModel.getWayBillType());
			wayBillchargesCollection 	= new HashMap<>();

			if (wayBillCategoryTypeDetails == null) {
				wayBillCategoryTypeDetails = new WayBillCategoryTypeDetails();

				wayBillCategoryTypeDetails.setWayBillType(wayBillViewModel.getWayBillType());
				wayBillCategoryTypeDetails.setQuantity(totalQuantity);
				wayBillCategoryTypeDetails.setTotalTax(totalTax);
				wayBillCategoryTypeDetails.setBookingDiscount(totalDiscount);
				wayBillCategoryTypeDetails.setTotalAmount(wayBill.getBookingTotal());

				chargesCollection = new HashMap<>();

				for (final WayBillCharges wayBillCharge : wayBillCharges) {
					chargesCollection.put(wayBillCharge.getWayBillChargeMasterId(), wayBillCharge.getChargeAmount());
					wayBillchargesCollection.put(wayBillCharge.getWayBillChargeMasterId(), wayBillCharge.getChargeAmount());
				}

				wayBillCategoryTypeDetails.setChargesCollection(chargesCollection);

				wbCategoryTypeDetails.put(wayBillViewModel.getWayBillType(), wayBillCategoryTypeDetails);
			} else {

				wayBillCategoryTypeDetails.setQuantity(wayBillCategoryTypeDetails.getQuantity() + totalQuantity);
				wayBillCategoryTypeDetails.setTotalTax(wayBillCategoryTypeDetails.getTotalTax() + totalTax);
				wayBillCategoryTypeDetails.setBookingDiscount(wayBillCategoryTypeDetails.getBookingDiscount() + totalDiscount);
				wayBillCategoryTypeDetails.setTotalAmount(wayBillCategoryTypeDetails.getTotalAmount() + wayBill.getBookingTotal());

				chargesCollection = wayBillCategoryTypeDetails.getChargesCollection();

				for (final WayBillCharges wayBillCharge : wayBillCharges) {
					if (chargesCollection.get(wayBillCharge.getWayBillChargeMasterId()) != null)
						chargesCollection.put(wayBillCharge.getWayBillChargeMasterId(), chargesCollection.get(wayBillCharge.getWayBillChargeMasterId())
								+ wayBillCharge.getChargeAmount());
					else
						chargesCollection.put(wayBillCharge.getWayBillChargeMasterId(), wayBillCharge.getChargeAmount());

					wayBillchargesCollection.put(wayBillCharge.getWayBillChargeMasterId(), wayBillCharge.getChargeAmount());

					if(wayBillCharge.getChargeAmount() > 0)
						chargesAllowedToView.add(wayBillCharge.getWayBillChargeMasterId());
				}
			}

			/** End */
			wayBillViewModel.setBookingChargesSum(wayBill.getBookingChargesSum());
			wayBillViewModel.setBookingDiscount(wayBill.getBookingDiscount());
			wayBillViewModel.setBookingTimeServiceTax(wayBill.getBookingTimeServiceTax());

			if(isAmountShowOnceProperty) {
				if(dispatchSummary.isAmountShow())
					wayBillViewModel.setBookingTotal(wayBill.getBookingTotal());
			} else
				wayBillViewModel.setBookingTotal(wayBill.getBookingTotal());

			wayBillViewModel.setDeliveryChargesSum(wayBill.getDeliveryChargesSum());
			wayBillViewModel.setDeliveryDiscount(wayBill.getDeliveryDiscount());
			wayBillViewModel.setDeliveryTimeServiceTax(wayBill.getDeliveryTimeServiceTax());
			wayBillViewModel.setDeliveryTotal(wayBill.getDeliveryTotal());
			wayBillViewModel.setGrandTotal(wayBill.getGrandTotal());
			wayBillViewModel.setTotalQuantity(totalQuantity);
			wayBillViewModel.setNoOfArticle(dispatchArticleDetailsArray != null ? dispatchArticleDetailsArray.length : 0);
			wayBillViewModel.setDispatchArticleDetails(dispatchArticleDetailsArray);
			wayBillViewModel.setRemark(wayBill.getRemark());
			wayBillViewModel.setAccountGroupId(wayBill.getAccountGroupId());
			wayBillViewModel.setActualWeight(wayBill.getActualWeight());
			wayBillViewModel.setFormTypeIds(wayBillModel.getFormTypeIds());
			wayBillViewModel.setDeliveryTo(wayBill.getDeliveryTo());
			wayBillViewModel.setConsignorInvoiceNo(wayBill.getConsignorInvoiceNo());
			wayBillViewModel.setChargesCollection(wayBillchargesCollection);

			if (wayBillViewModel.getArticleTypeMasterId() == ArticleTypeMaster.ARTICLE_TYPE_DOCUMENT) {
				totalPackages 			+= totalQuantity;
				totalDocsOnPackages	 	+= totalQuantity;
				dispatchLedgerPrintModel.setTotalDocsOnPackages(totalDocsOnPackages);
				dispatchLedgerPrintModel.setTotalPackages(totalPackages);
			} else if (wayBillViewModel.getArticleTypeMasterId() == ArticleTypeMaster.ARTICLE_TYPE_NONDOCUMENT) {
				totalPackages 			+= totalQuantity;
				totalNonDocsOnPackages 	+= totalQuantity;
				dispatchLedgerPrintModel.setTotalNonDocsOnPackages(totalNonDocsOnPackages);
				dispatchLedgerPrintModel.setTotalPackages(totalPackages);
			}

			if (wayBillCrossing != null) {
				wayBillViewModel.setNetLoading(wayBillCrossing.getNetLoading());
				wayBillViewModel.setNetUnloading(wayBillCrossing.getNetUnloading());
				wayBillViewModel.setCrossingHire(wayBillCrossing.getCrossingHire());
				wayBillViewModel.setDoorDelivery(wayBillCrossing.getDoorDelivery());
			}

			if(crossingHireRateAllow) {
				if(netLoadingUnloadingChargeHM != null && netLoadingUnloadingChargeHM.size() > 0) {
					if(netLoadingUnloadingChargeHM.get(wayBill.getWayBillId()) != null)
						wayBillViewModel.setNetLoading(netLoadingUnloadingChargeHM.get(wayBill.getWayBillId()).getNetLoading());
					else
						wayBillViewModel.setNetLoading(0);

					if(netLoadingUnloadingChargeHM.get(wayBill.getWayBillId()) != null)
						wayBillViewModel.setNetUnloading(netLoadingUnloadingChargeHM.get(wayBill.getWayBillId()).getNetUnloading());
					else
						wayBillViewModel.setNetUnloading(0);
				}

				if(isAvoidCHOnWeightIfPresentInDB) {
					if(wayBillViewModel.getCrossingHire() == 0
							&& wayBillCrossingRate != null && wayBillCrossingRate.size() > 0)
						if(wayBillCrossingRate.get(wayBill.getWayBillId()) != null)
							wayBillViewModel.setCrossingHire(wayBillCrossingRate.get(wayBill.getWayBillId()).getRate());
						else
							wayBillViewModel.setCrossingHire(0);
				} else if(wayBillCrossingRate != null && wayBillCrossingRate.size() > 0)
					if(wayBillCrossingRate.get(wayBill.getWayBillId()) != null)
						wayBillViewModel.setCrossingHire(wayBillCrossingRate.get(wayBill.getWayBillId()).getRate());
					else
						wayBillViewModel.setCrossingHire(0);
			}

			if(wayBillModel.getConsignmentSummary() != null) {
				if(wayBillModel.getConsignmentSummary().getFreightUptoBranchId() != 0) {
					branch		= cache.getBranchById(request, wayBill.getAccountGroupId(), wayBillModel.getConsignmentSummary().getFreightUptoBranchId());
					wayBillViewModel.setFreightUptoBranchName(branch.getName());
				} else
					wayBillViewModel.setFreightUptoBranchName("--");

				wayBillViewModel.setDeliveryTimeTBB(wayBillModel.getConsignmentSummary().isDeliveryTimeTBB());
			}

			wayBillViewModel.setInvalidEwayBill(wayBill.isInvalidEwayBill());
			wayBillViewModel.setWayBillNumber(wayBill.isInvalidEwayBill() ? "**" + wayBill.getWayBillNumber() : wayBill.getWayBillNumber());
			wayBillViewModel.setPartialLr(wayBill.isPartialLr());

			return wayBillViewModel;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public void setCrossingAmntQuantityBased(final HttpServletRequest request, final WayBillViewModel[] wayBillViewList,
			final DispatchLedgerPrintModel dispatchLedgerPrintModel,
			final HashMap<Long, WayBillForCrossingHire> bookingCringAgtWBPaymentModule, final HashMap<Long, DispatchArticleDetails[]> dispatchArticlDetailsArrayHM)
					throws Exception {

		ValueObject 				quantiBasedConfig 						= null;
		String						sourceRegionIds							= null;
		List<Long> 					sourceRegionIdList						= null;
		HashMap<Long, Branch> 		sourceBranchesSourceRegionWise			= null;
		String						sourceSubregionIds						= null;
		List<Long>  				sourceSubregionIdList					= null;
		HashMap<Long, Branch> 		sourceBranchesSourceSubRegionWise		= null;
		String						destSubregionIds						= null;
		List<Long>  				destSubregionIdList						= null;
		HashMap<Long, Branch> 		destBranchesDestSubRegionWise 			= null;
		var 					sourceSubregionWiseSourceBranch			= false;
		var 					regionWiseSourceBranch					= false;
		var 					destSubregionWiseDestBranch 			= false;
		var 						crossingAmount 							= 0L;
		CacheManip 					cacheObj 								= null;
		var						dispatchedQuantity	 					= 0L;

		try {
			quantiBasedConfig						= PropertyConfigValueBLLImpl.getInstance().getConfiguration(executive, PropertiesFileConstants.LS_QUANTITY_BASED_CROSSING);
			cacheObj 								= new CacheManip(request);

			sourceRegionIds							= quantiBasedConfig.getString(LsPrintQuantBasedConfigurationDTO.REGION_IDS_FOR_SOURCE_BRANCHES);
			sourceSubregionIds						= quantiBasedConfig.getString(LsPrintQuantBasedConfigurationDTO.SUBREGION_IDS_FOR_SOURCE_BRANCHES);
			destSubregionIds						= quantiBasedConfig.getString(LsPrintQuantBasedConfigurationDTO.SUBREGION_IDS_FOR_DEST_BRANCHES);

			sourceRegionIdList						= CollectionUtility.getLongListFromString(sourceRegionIds);
			sourceSubregionIdList					= CollectionUtility.getLongListFromString(sourceSubregionIds);
			destSubregionIdList						= CollectionUtility.getLongListFromString(destSubregionIds);

			sourceBranchesSourceRegionWise			= new HashMap<>();
			sourceBranchesSourceSubRegionWise		= new HashMap<>();
			destBranchesDestSubRegionWise			= new HashMap<>();

			for (final Long element : sourceRegionIdList)
				sourceBranchesSourceRegionWise.putAll(cacheObj.getBranchesByRegionId(request, executive.getAccountGroupId(), element));

			for (final Long element : sourceSubregionIdList)
				sourceBranchesSourceSubRegionWise.putAll(cacheObj.getBranchesBySubRegionId(request, executive.getAccountGroupId(), element));

			for (final Long element : destSubregionIdList)
				destBranchesDestSubRegionWise.putAll(cacheObj.getBranchesBySubRegionId(request, executive.getAccountGroupId(), element));

			for (final WayBillViewModel element : wayBillViewList) {
				dispatchedQuantity 			= 0;

				if(dispatchArticlDetailsArrayHM != null && dispatchArticlDetailsArrayHM.containsKey(element.getWayBillId())) {
					final var dispatchArticleDetailsArray = dispatchArticlDetailsArrayHM.get(element.getWayBillId());

					dispatchedQuantity = Stream.of(dispatchArticleDetailsArray)
							.map(DispatchArticleDetails::getQuantity).mapToLong(Long::longValue).sum();
				}

				regionWiseSourceBranch 				= sourceBranchesSourceRegionWise.values().stream()
						.anyMatch(o -> o.getBranchId() == element.getSourceBranchId());

				sourceSubregionWiseSourceBranch 	= sourceBranchesSourceSubRegionWise.values().stream()
						.anyMatch(o -> o.getBranchId() == element.getSourceBranchId());

				destSubregionWiseDestBranch 		= destBranchesDestSubRegionWise.values().stream()
						.anyMatch(o -> o.getBranchId() == element.getDestinationBranchId());

				// For TBB Source sub region to Destination sub region
				if (element.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT && sourceSubregionWiseSourceBranch && destSubregionWiseDestBranch) {
					crossingAmount = dispatchedQuantity * Integer.valueOf((String) quantiBasedConfig.get(LsPrintQuantBasedConfigurationDTO.Normal_Tbb));
					element.setCrossingAmntQtyBased(crossingAmount);
				}

				// Source region TO Destination SubRegion
				if (regionWiseSourceBranch && destSubregionWiseDestBranch && dispatchLedgerPrintModel.isCrossing() && dispatchLedgerPrintModel.getCrossingAgentId() == 0) {
					crossingAmount = dispatchedQuantity * Integer.valueOf((String) quantiBasedConfig.get(LsPrintQuantBasedConfigurationDTO.SOURCE_REGION_BRANCHES_TO_DEST_SUBREGION_BRANCHES));
					element.setCrossingAmntQtyBased(crossingAmount);
				}

				// any crossing agent to Destination sub region
				if (destSubregionWiseDestBranch && dispatchLedgerPrintModel.isCrossing() && bookingCringAgtWBPaymentModule != null && bookingCringAgtWBPaymentModule.get(element.getWayBillId()) != null) {
					crossingAmount = dispatchedQuantity * Integer.valueOf((String) quantiBasedConfig.get(LsPrintQuantBasedConfigurationDTO.ANY_CROSSING_AGENT_TO_DEST_SUBREGION_BRANCHES));
					element.setCrossingAmntQtyBased(crossingAmount);
				}
			}
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		} finally {
			quantiBasedConfig 						= null;
			cacheObj 								= null;
		}
	}
}