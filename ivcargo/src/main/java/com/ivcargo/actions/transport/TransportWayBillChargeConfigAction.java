package com.ivcargo.actions.transport;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.ChargeConfigBLL;
import com.businesslogic.properties.impl.PropertyConfigValueBLLImpl;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.ChargeConfigDao;
import com.platform.dao.CustomerDetailsDao;
import com.platform.dao.DispatchArticleDetailsDao;
import com.platform.dao.DispatchLedgerDao;
import com.platform.dto.AccountGroup;
import com.platform.dto.Branch;
import com.platform.dto.ChargeConfig;
import com.platform.dto.ChargeTypeMaster;
import com.platform.dto.CustomerDetails;
import com.platform.dto.DispatchArticleDetails;
import com.platform.dto.DispatchLedger;
import com.platform.dto.DispatchSummary;
import com.platform.dto.Executive;
import com.platform.dto.PackingTypeMaster;
import com.platform.dto.PropertiesFileConstants;
import com.platform.dto.SubRegion;
import com.platform.dto.WayBill;
import com.platform.dto.WayBillType;
import com.platform.dto.configuration.modules.ChargeConfigDTO;
import com.platform.dto.configuration.modules.GroupConfigurationPropertiesDTO;
import com.platform.dto.model.DispatchLedgerPrintModel;
import com.platform.dto.model.ReportViewModel;
import com.platform.dto.model.WayBillModel;
import com.platform.dto.model.WayBillViewModel;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

public class TransportWayBillChargeConfigAction implements Action {

	public static final String 			TRACE_ID 				= "TransportWayBillChargeConfigAction";
	HashMap<Long, Double> 				wayBillChargeCollection = null;
	Executive                  			executive				= null;
	CacheManip       					cache            		= null;
	long 								totalPackages 			= 0;

	@Override
	@SuppressWarnings("unchecked")
	public void execute(HttpServletRequest request, HttpServletResponse response) {

		HashMap<String,Object>	 		error 						= null;
		ChargeConfigBLL 				chargeConfigBLL				= null;
		ValueObject 					inValObj					= null;
		ValueObject						outValObj					= null;
		WayBillModel[]      			wayBillModels           	= null;
		Long[]							wayBillIdArray 				= null;
		String							strForChargeConfig			= null;
		String							strForWayBillCharge			= null;
		DispatchLedgerPrintModel 		dispatchLedgerPrintModel	= null;
		WayBillViewModel[] 				wayBillViewList				= null;
		ReportViewModel 				reportViewModel				= null;
		ArrayList<Long>					receiveLocationList			= null;
		HashMap<Long, ChargeConfig>  	chargeConigMap	       	 	= null;
		ValueObject						valueObject					= null;
		String							wayBillIds					= null;
		ChargeConfig					chargeConfigModel			= null;
		HashMap<Long, DispatchArticleDetails[]>	dispatchArticlDetailsArrayHM 	= null;
		DispatchArticleDetails[]		 		dispatchArticleDetailsArray	 	= null;
		long									dispatchLedgerId				= 0;
		PropertyConfigValueBLLImpl				propertyConfigValueBLLImpl		= null;
		ValueObject								chargeConfigVO					= null;
		boolean									displayBookingTotalInGrandTotalColumn	= false;
		boolean									destinationSubRegionChecking			= false;
		ValueObject								groupConfiguration				= null;
		boolean									showPartyIsBlackListedParty		= false;
		DispatchLedger							dispatchLedger					= null;

		try {

			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			wayBillChargeCollection 	= new HashMap<Long, Double>();
			executive					= (Executive) request.getSession().getAttribute("executive");
			cache    	 				= new CacheManip(request);
			chargeConfigBLL  			= new ChargeConfigBLL();
			propertyConfigValueBLLImpl	= new PropertyConfigValueBLLImpl();
			inValObj         			= new ValueObject();
			dispatchLedgerId 			= JSPUtility.GetLong(request, "dispatchLedgerId");

			chargeConfigVO				= propertyConfigValueBLLImpl.getConfiguration(executive, PropertiesFileConstants.CHARGECONFIG);

			displayBookingTotalInGrandTotalColumn	= chargeConfigVO.getBoolean(ChargeConfigDTO.DISPLAY_BOOKING_TOTAL_IN_GRAND_TOTAL_COLUMN, false);
			destinationSubRegionChecking			= chargeConfigVO.getBoolean(ChargeConfigDTO.DESTINATION_SUB_REGION_CHECKING, false);

			inValObj.put("dispatchLedgerId", dispatchLedgerId);
			groupConfiguration			= cache.getGroupConfiguration(request, executive.getAccountGroupId());
			showPartyIsBlackListedParty = groupConfiguration.getBoolean(GroupConfigurationPropertiesDTO.SHOW_PARTY_IS_BLACK_LISTED_PARTY, false);
			outValObj = chargeConfigBLL.getWayBillChargeConfig(inValObj);
			if (outValObj.get("wayBillModels") != null && outValObj.get("WayBillIdArray") != null) {

				wayBillModels           = (WayBillModel[]) outValObj.get("wayBillModels");
				wayBillIdArray 			= (Long[]) outValObj.get("WayBillIdArray");
				strForChargeConfig		= outValObj.get("strForChargeConfig").toString();
				strForWayBillCharge		= outValObj.get("strForWayBillCharge").toString();
				dispatchArticlDetailsArrayHM 	= DispatchArticleDetailsDao.getInstance().getDispatchArticleDetailsByDispatchLegerId(dispatchLedgerId);

				inValObj.put("strForChargeConfig", strForChargeConfig);
				inValObj.put("strForWayBillCharge", strForWayBillCharge);
				inValObj.put("chargeTypeMasterId", ChargeTypeMaster.OCTROI_DELIVERY);

				wayBillChargeCollection = chargeConfigBLL.getWayBillChargeAmount(inValObj);

				dispatchLedgerPrintModel = populateDispatchLedgerPrintModel(request,wayBillModels[0].getDispatchLedger());
				dispatchLedgerPrintModel.setDispatchLedgerId(dispatchLedgerId);

				wayBillIds	= Utility.GetLongArrayToString(wayBillIdArray);
				valueObject = ChargeConfigDao.getInstance().getLimitedChargeConfigData(wayBillIds);

				if(valueObject != null)
					chargeConigMap  = (HashMap<Long, ChargeConfig>)valueObject.get("chargeConigMap");

				wayBillViewList = new WayBillViewModel[wayBillModels.length];
				reportViewModel = new ReportViewModel();

				for (int i = 0; i < wayBillModels.length; i++) {

					if(i == 0) {
						reportViewModel = populateReportViewModel(request,reportViewModel,wayBillModels[i]);
						request.setAttribute("ReportViewModel", reportViewModel);
					}

					dispatchArticleDetailsArray = dispatchArticlDetailsArrayHM.get(wayBillModels[i].getWayBill().getWayBillId());
					wayBillViewList[i] = populateWayBillViewModel(request, wayBillModels[i], dispatchLedgerPrintModel, dispatchArticleDetailsArray);

					if(chargeConigMap != null){
						chargeConfigModel = chargeConigMap.get(wayBillModels[i].getWayBill().getWayBillId());
						if(chargeConfigModel != null)
							wayBillViewList[i].setInvoiceCertificationBillId(chargeConfigModel.getInvoiceCertificationBillId());
					}
				}
				receiveLocationList = cache.getAssignedLocationsIdListByLocationIdId(request, executive.getBranchId(), executive.getAccountGroupId());

				dispatchLedger					= DispatchLedgerDao.getInstance().getDispatchLedgerByDispatchLedgerId(dispatchLedgerId);

				if(dispatchLedger != null) {
					final Branch 	srcBranch		= cache.getBranchById(request, dispatchLedger.getAccountGroupId(), dispatchLedger.getSourceBranchId());
					final SubRegion	subRegion	= cache.getGenericSubRegionById(request, srcBranch.getSubRegionId());

					final Branch descBranch	= cache.getBranchById(request, dispatchLedger.getAccountGroupId(), dispatchLedger.getDestinationBranchId());
					final SubRegion	destSubRegion	= cache.getGenericSubRegionById(request, descBranch.getSubRegionId());

					request.setAttribute("lsNumber", dispatchLedger.getLsNumber());
					request.setAttribute("scrBranch", srcBranch.getName());
					request.setAttribute("scrSubRegion", subRegion.getName());
					request.setAttribute("desBranch", descBranch.getName());
					request.setAttribute("desSubRegion", destSubRegion.getName());
					request.setAttribute("date", dispatchLedger.getTripDateTime());
					request.setAttribute("vehicleNo", dispatchLedger.getVehicleNumber());
					request.setAttribute("driver", Utility.checkedNullCondition(dispatchLedger.getDriverName(), (short) 1));
					request.setAttribute("cleaner", Utility.checkedNullCondition(dispatchLedger.getCleanerName(), (short) 1));
					request.setAttribute("driverNo", Utility.checkedNullCondition(dispatchLedger.getDriver1MobileNumber1(), (short) 1));
				}

				request.setAttribute("lorryHireId", request.getParameter("lorryHireId"));
				request.setAttribute("lsDesBranchId", request.getParameter("lsDesBranchId"));
				request.setAttribute("isForceReceive", request.getParameter("isForceReceive"));
				request.setAttribute("receiveLocationList", receiveLocationList);
				request.setAttribute("dispatchLedger", dispatchLedgerPrintModel);
				request.setAttribute("wayBillViewList", wayBillViewList);
				request.setAttribute("showPartyIsBlackListedParty", showPartyIsBlackListedParty);
				request.setAttribute(ChargeConfigDTO.DISPLAY_BOOKING_TOTAL_IN_GRAND_TOTAL_COLUMN, displayBookingTotalInGrandTotalColumn);
				request.setAttribute(ChargeConfigDTO.DESTINATION_SUB_REGION_CHECKING, destinationSubRegionChecking);
			} else {
				error.put("errorCode", CargoErrorList.NO_RECORDS);
				error.put("errorDescription", CargoErrorList.NO_RECORDS_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}
			request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		} finally {
			chargeConfigBLL				= null;
			inValObj					= null;
			outValObj					= null;
			wayBillModels           	= null;
			wayBillIdArray 				= null;
			strForChargeConfig			= null;
			strForWayBillCharge			= null;
			dispatchLedgerPrintModel	= null;
			wayBillViewList				= null;
			reportViewModel				= null;
			wayBillChargeCollection 	= null;
			executive					= null;
			cache            			= null;
		}
	}

	public ReportViewModel populateReportViewModel(HttpServletRequest request,ReportViewModel reportViewModel ,WayBillModel wayBillModel) throws Exception {

		WayBill			wayBill			= null;
		Branch 			branch 			= null;
		AccountGroup 	accountGroup 	= null;

		try {

			wayBill	= wayBillModel.getWayBill();
			branch 	= cache.getGenericBranchDetailCache(request,wayBill.getSourceBranchId());
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

	public DispatchLedgerPrintModel populateDispatchLedgerPrintModel(HttpServletRequest request, DispatchLedger dispatchLedger)throws Exception {

		DispatchLedgerPrintModel 	dispatchLedgerPrintModel= null;
		Branch 						srcbranch 				= null;
		SubRegion 						srcSubRegion 				= null;
		Branch 						destbranch 				= null;
		SubRegion 						destSubRegion 				= null;

		try {

			dispatchLedgerPrintModel = new DispatchLedgerPrintModel(dispatchLedger);

			srcbranch = cache.getGenericBranchDetailCache(request, dispatchLedger.getSourceBranchId());
			dispatchLedgerPrintModel.setSourceBranch(srcbranch.getName());

			srcSubRegion = cache.getGenericSubRegionById(request, srcbranch.getSubRegionId());
			dispatchLedgerPrintModel.setSourceSubRegion(srcSubRegion.getName());

			if(dispatchLedger.getDestinationBranchId() > 0) {
				destbranch = cache.getGenericBranchDetailCache(request,dispatchLedger.getDestinationBranchId());
				dispatchLedgerPrintModel.setDestinationBranch(destbranch.getName());
				dispatchLedgerPrintModel.setDestinationSubRegionId(destbranch.getSubRegionId());

				destSubRegion = cache.getGenericSubRegionById(request, destbranch.getSubRegionId());
				dispatchLedgerPrintModel.setDestinationSubRegion(destSubRegion.getName());
			}

			dispatchLedgerPrintModel.setLsNumber(dispatchLedger.getLsNumber());
			dispatchLedgerPrintModel.setLsBranchId(dispatchLedger.getLsBranchId());

			return dispatchLedgerPrintModel;

		} catch (final Exception e) {
			throw e;
		} finally {
			dispatchLedgerPrintModel= null;
			srcbranch 				= null;
			srcSubRegion 				= null;
			destbranch 				= null;
			destSubRegion 				= null;
		}
	}

	public WayBillViewModel populateWayBillViewModel(HttpServletRequest request, WayBillModel wayBillModel, DispatchLedgerPrintModel dispatchLedgerPrintModel, DispatchArticleDetails[]	dispatchArticleDetailsArray) throws Exception {

		WayBill          				wayBill          			= null;
		WayBillViewModel 				wayBillViewModel 			= null;
		Branch 							branch						= null;
		SubRegion 						subRegion					= null;
		WayBillType 					wayBillType 				= null;
		HashMap<Long,PackingTypeMaster> wbPkgs 						= null;
		PackingTypeMaster 				wbPkg 						= null;
		String 							pkgDetail 					= null;
		Iterator<Long> 					itr 						= null;
		PackingTypeMaster 				pkg 						= null;
		DispatchSummary					dispatchSummary				= null;
		HashMap<Long, CustomerDetails> 	consignorHM					= null;
		HashMap<Long, CustomerDetails> 	consigneeHM					= null;

		try {

			wayBill          		= wayBillModel.getWayBill();
			dispatchSummary			= wayBillModel.getDispatchSummary();
			wayBillViewModel 		= new WayBillViewModel();
			branch					= null;
			subRegion				= null;

			if(wayBillChargeCollection.get(wayBill.getWayBillId()) != null)
				wayBillViewModel.setWayBillChargeConfigAmount(wayBillChargeCollection.get(wayBill.getWayBillId()));
			else
				wayBillViewModel.setWayBillChargeConfigAmount(0);

			branch = cache.getGenericBranchDetailCache(request, wayBill.getDestinationBranchId());
			wayBill.setDestinationSubRegionId(branch.getSubRegionId());
			if(wayBill.getDestinationBranchId() > 0) {
				wayBillViewModel.setDestinationBranch(branch.getName());
				wayBillViewModel.setDestinationBranchId(wayBill.getDestinationBranchId());

				subRegion = cache.getGenericSubRegionById(request, wayBill.getDestinationSubRegionId());
				wayBillViewModel.setDestinationSubRegion(subRegion.getName());
				wayBillViewModel.setDestinationSubRegionId(wayBill.getDestinationSubRegionId());
			}

			branch = cache.getGenericBranchDetailCache(request,wayBill.getSourceBranchId());

			wayBill.setSourceSubRegionId(branch.getSubRegionId());
			wayBillViewModel.setSourceBranch(branch.getName());

			subRegion = cache.getGenericSubRegionById(request, wayBill.getSourceSubRegionId());
			wayBillViewModel.setSourceSubRegion(subRegion.getName());
			wayBillViewModel.setWayBillId(wayBill.getWayBillId());
			wayBillViewModel.setWayBillNumber(wayBill.getWayBillNumber());

			consignorHM	   				= CustomerDetailsDao.getInstance().getConsignorDetailsByWayBillId(wayBill.getWayBillId()+"");
			consigneeHM					= CustomerDetailsDao.getInstance().getConsigneeDetailsByWayBillId(wayBill.getWayBillId()+"");

			wayBillType = cache.getWayBillTypeById(request, wayBill.getWayBillTypeId());
			if(wayBill.isManual())
				wayBillViewModel.setWayBillType(wayBillType.getWayBillType()+WayBillType.WAYBILL_TYPE_MANUAL);
			else
				wayBillViewModel.setWayBillType(wayBillType.getWayBillType());
			wayBillViewModel.setWayBillTypeId(wayBill.getWayBillTypeId());

			wayBillViewModel.setConsignerName(wayBill.getConsignerName());
			wayBillViewModel.setConsigneeName(wayBillModel.getConsigneeDetails().getName());
			wayBillViewModel.setConsigneePhoneNo(wayBillModel.getConsigneeDetails().getPhoneNumber());
			wayBillViewModel.setConsignmentDetails(wayBillModel.getConsignmentDetails());
			wayBillViewModel.setDeclaredValue(wayBill.getDeclaredValue());
			wayBillViewModel.setSaidToContain(wayBill.getSaidToContain());
			wayBillViewModel.setConsignorBlackListed(consignorHM.get(wayBill.getWayBillId()).getConsignorBlackListed());
			wayBillViewModel.setTbbPartyBlackListed(consignorHM.get(wayBill.getWayBillId()).getTbbBlackListed());
			wayBillViewModel.setConsigneeBlackListed(consigneeHM.get(wayBill.getWayBillId()).getConsigneeBlackListed());

			long 	totalQuantity	= 0;
			wbPkgs = new HashMap<Long,PackingTypeMaster>();


			for (final DispatchArticleDetails element : dispatchArticleDetailsArray) {
				totalQuantity 	+= element.getQuantity();

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
			}

			pkgDetail	= "";
			itr			= wbPkgs.keySet().iterator();
			int inc = 0;
			while(itr.hasNext()) {
				pkg = wbPkgs.get(Long.parseLong(itr.next().toString()));
				if(inc == 0)
					pkgDetail=pkgDetail+pkg.getTotalQuantity()+" "+pkg.getName();
				else
					pkgDetail=pkgDetail+"/ "+pkg.getTotalQuantity()+" "+pkg.getName();
				inc++;
			}

			wayBillViewModel.setTotalPackagesTypeQuantity(pkgDetail);

			wayBillViewModel.setBookingChargesSum(wayBill.getBookingChargesSum());
			wayBillViewModel.setBookingDiscount(wayBill.getBookingDiscount());
			wayBillViewModel.setBookingTimeServiceTax(wayBill.getBookingTimeServiceTax());
			wayBillViewModel.setBookingTotal(wayBill.getBookingTotal());
			wayBillViewModel.setDeliveryChargesSum(wayBill.getDeliveryChargesSum());
			wayBillViewModel.setDeliveryDiscount(wayBill.getDeliveryDiscount());
			wayBillViewModel.setDeliveryTimeServiceTax(wayBill.getDeliveryTimeServiceTax());
			wayBillViewModel.setDeliveryTotal(wayBill.getDeliveryTotal());
			wayBillViewModel.setGrandTotal(wayBill.getGrandTotal());

			wayBillViewModel.setTotalWeight(dispatchSummary.getDispatchedWeight());
			wayBillViewModel.setTotalQuantity(totalQuantity);
			wayBillViewModel.setNoOfArticle(dispatchArticleDetailsArray.length);
			wayBillViewModel.setRemark(wayBill.getRemark());
			wayBillViewModel.setStatus(wayBill.getStatus());

			return wayBillViewModel;

		} catch (final Exception e) {
			throw e;
		} finally {
			wayBill          			= null;
			wayBillViewModel 			= null;
			branch						= null;
			subRegion						= null;
			wayBillType 				= null;
			wbPkgs 						= null;
			wbPkg 						= null;
			pkgDetail 					= null;
			itr 						= null;
			pkg 						= null;
		}
	}
}