package com.ivcargo.actions;

import java.util.HashMap;
import java.util.Iterator;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.ChargeConfigBLL;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.BranchDao;
import com.platform.dao.reports.WayBillDetailsDAO;
import com.platform.dto.AccountGroup;
import com.platform.dto.Branch;
import com.platform.dto.ChargeTypeMaster;
import com.platform.dto.ConsignmentDetails;
import com.platform.dto.DispatchLedger;
import com.platform.dto.Executive;
import com.platform.dto.PackingTypeMaster;
import com.platform.dto.SubRegion;
import com.platform.dto.WayBill;
import com.platform.dto.WayBillType;
import com.platform.dto.model.DispatchLedgerPrintModel;
import com.platform.dto.model.ReportViewModel;
import com.platform.dto.model.WayBillDeatailsModel;
import com.platform.dto.model.WayBillModel;
import com.platform.dto.model.WayBillViewModel;
import com.platform.resource.CargoErrorList;

public class WayBillChargeConfigAction implements Action{
	public static final String 			TRACE_ID 				= "WayBillChargeConfigAction";
	HashMap<Long, WayBillDeatailsModel> wayBillDetails 			= new HashMap<Long, WayBillDeatailsModel>();
	HashMap<Long, Double> 				wayBillChargeCollection = new HashMap<Long, Double>();
	Executive                  			executive				= null;
	CacheManip       					cache            		= null;
	long 								totalPackages 			= 0;

	public void execute(HttpServletRequest request, HttpServletResponse response) {

		HashMap<String,Object>	 	error 		= null;
		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error)){
				return;
			}

			cache     = new CacheManip(request);
			executive = (Executive) request.getSession().getAttribute("executive");
			long        	dispatchLedgerId 	= JSPUtility.GetLong(request, "dispatchLedgerId");
			ChargeConfigBLL chargeConfigBLL  	= new ChargeConfigBLL();
			ValueObject 	inValObj         	= new ValueObject();

			inValObj.put("dispatchLedgerId", dispatchLedgerId);

			ValueObject outValObj = chargeConfigBLL.getWayBillChargeConfig(inValObj);

			if (outValObj.get("wayBillModels") != null && outValObj.get("WayBillIdArray") != null) {
				WayBillModel[]          wayBillModels           = (WayBillModel[]) outValObj.get("wayBillModels");
				Long[] 					wayBillIdArray 			= (Long[]) outValObj.get("WayBillIdArray");
				String					strForChargeConfig		= outValObj.get("strForChargeConfig").toString();
				String					strForWayBillCharge		= outValObj.get("strForWayBillCharge").toString();

				inValObj.put("strForChargeConfig", strForChargeConfig);
				inValObj.put("strForWayBillCharge", strForWayBillCharge);
				inValObj.put("chargeTypeMasterId", ChargeTypeMaster.RECEIPT);

				wayBillChargeCollection = chargeConfigBLL.getWayBillChargeAmount(inValObj);

				DispatchLedgerPrintModel dispatchLedgerPrintModel = populateDispatchLedgerPrintModel(request,wayBillModels[0].getDispatchLedger());
				dispatchLedgerPrintModel.setDispatchLedgerId(dispatchLedgerId);

				//Get WayBill Details code ( Start )
				wayBillDetails = WayBillDetailsDAO.getInstance().getWayBillDetails(wayBillIdArray ,false ,(short)0 ,false ,(short)0 ,true);
				//Get WayBill Details code ( End )

				WayBillViewModel[] wayBillViewList = new WayBillViewModel[wayBillModels.length];
				ReportViewModel reportViewModel = new ReportViewModel();

				for (int i = 0; i < wayBillModels.length; i++) {

					if(i==0){
						reportViewModel = populateReportViewModel(request,reportViewModel,wayBillModels[i]); 
						request.setAttribute("ReportViewModel", reportViewModel);
					}

					wayBillViewList[i] = populateWayBillViewModel(request, wayBillModels[i] ,dispatchLedgerPrintModel);
				}

				request.setAttribute("dispatchLedger", dispatchLedgerPrintModel);
				request.setAttribute("wayBillViewList", wayBillViewList);
				request.setAttribute("nextPageToken", "success");
			} else {
				error.put("errorCode", CargoErrorList.NO_RECORDS);
				error.put("errorDescription", CargoErrorList.NO_RECORDS_DESCRIPTION);
				request.setAttribute("cargoError", error);
				request.setAttribute("nextPageToken", "success");
			}
		} catch (Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}
	}


	public ReportViewModel populateReportViewModel(HttpServletRequest request,ReportViewModel reportViewModel ,WayBillModel wayBillModel) throws Exception {

		WayBill			wayBill			= null;
		Branch 			branch 			= null;
		AccountGroup 	accountGroup 	= null;
		try {

			wayBill	= wayBillModel.getWayBill();
			branch 	= cache.getGenericBranchDetailCache(request,wayBill.getSourceBranchId());
			if( branch == null ){
				branch = BranchDao.getInstance().findByBranchId(wayBill.getSourceBranchId());
			}
			
			reportViewModel.setBranchPhoneNumber(branch.getPhoneNumber());
			reportViewModel.setBranchAddress(branch.getAddress());

			accountGroup = cache.getAccountGroupById(request, executive.getAccountGroupId());
			reportViewModel.setAccountGroupName(accountGroup.getDescription());

			return  reportViewModel;

		} catch (Exception e) {
			throw e;
		} finally {
			wayBill			= null;
			branch 			= null;
			accountGroup 	= null;
		}
	}

	public DispatchLedgerPrintModel populateDispatchLedgerPrintModel(HttpServletRequest request,DispatchLedger dispatchLedger)throws Exception {

		DispatchLedgerPrintModel 	dispatchLedgerPrintModel= null;
		Branch 						srcbranch 				= null;
		SubRegion 					srcSubRegion 			= null;
		Branch 						destbranch 				= null;
		SubRegion 					destSubRegion			= null;

		try {

			dispatchLedgerPrintModel = new DispatchLedgerPrintModel(dispatchLedger);

			srcbranch = cache.getGenericBranchDetailCache(request,dispatchLedger.getSourceBranchId());
			
			if( srcbranch == null ){
				srcbranch = BranchDao.getInstance().findByBranchId(dispatchLedger.getSourceBranchId());
			}
			
			dispatchLedgerPrintModel.setSourceBranch(srcbranch.getName());
			dispatchLedgerPrintModel.setSourceSubRegionId(srcbranch.getSubRegionId());

			srcSubRegion = cache.getGenericSubRegionById(request, dispatchLedgerPrintModel.getSourceSubRegionId());
			
			dispatchLedgerPrintModel.setSourceSubRegion(srcSubRegion.getName());

			destbranch = cache.getGenericBranchDetailCache(request, dispatchLedger.getDestinationBranchId());
			
			if( destbranch == null ){
				destbranch = BranchDao.getInstance().findByBranchId(dispatchLedger.getDestinationBranchId());
			}	
			
			dispatchLedgerPrintModel.setDestinationBranch(destbranch.getName());
			dispatchLedgerPrintModel.setDestinationSubRegionId(destbranch.getSubRegionId());

			destSubRegion = cache.getGenericSubRegionById(request, dispatchLedgerPrintModel.getDestinationSubRegionId());
			
			dispatchLedgerPrintModel.setDestinationSubRegion(destSubRegion.getName());

			return (dispatchLedgerPrintModel);

		} catch (Exception e) {
			throw e;
		} finally {
			dispatchLedgerPrintModel= null;
			srcbranch 				= null;
			srcSubRegion 				= null;
			destbranch 				= null;
			destSubRegion 				= null;
		}
	}

	public WayBillViewModel populateWayBillViewModel(HttpServletRequest request, WayBillModel wayBillModel ,DispatchLedgerPrintModel dispatchLedgerPrintModel)
			throws Exception {

		WayBill          		wayBill          			= wayBillModel.getWayBill();
		WayBillDeatailsModel 	wayBillDeatailsModel 		= wayBillDetails.get(wayBill.getWayBillId());
		WayBillViewModel 		wayBillViewModel 			= new WayBillViewModel();

		if(wayBillChargeCollection.get(wayBill.getWayBillId()) != null){
			wayBillViewModel.setWayBillChargeConfigAmount(wayBillChargeCollection.get(wayBill.getWayBillId()));
		} else {
			wayBillViewModel.setWayBillChargeConfigAmount(0);
		}

		Branch branch = cache.getGenericBranchDetailCache(request,wayBill.getDestinationBranchId());
		//Branch branch = cache.getGenericBranchDetailCache(request, executive.getAccountGroupId(), wayBill.getDestinationCityId(),wayBill.getDestinationBranchId());
		wayBillViewModel.setDestinationBranch(branch.getName());
		wayBillViewModel.setDestinationSubRegionId(branch.getSubRegionId());
		wayBillViewModel.setDestinationSubRegion(cache.getGenericSubRegionById(request, branch.getSubRegionId()).getName());
		
		branch = cache.getGenericBranchDetailCache(request,wayBill.getSourceBranchId());
		//branch = cache.getGenericBranchDetailCache(request, executive.getAccountGroupId(), wayBill.getSourceCityId(),wayBill.getSourceBranchId());
		wayBillViewModel.setSourceBranch(branch.getName());
		wayBillViewModel.setSourceSubRegionId(branch.getSubRegionId());
		wayBillViewModel.setSourceSubRegion(cache.getGenericSubRegionById(request, branch.getSubRegionId()).getName());
		
		wayBillViewModel.setWayBillId(wayBill.getWayBillId());
		wayBillViewModel.setWayBillNumber(wayBill.getWayBillNumber());

		WayBillType wayBillType = cache.getWayBillTypeById(request, wayBill.getWayBillTypeId());
		if(wayBill.isManual()){
			wayBillViewModel.setWayBillType(wayBillType.getWayBillType()+WayBillType.WAYBILL_TYPE_MANUAL);
		}else{
			wayBillViewModel.setWayBillType(wayBillType.getWayBillType());
		}
		wayBillViewModel.setWayBillTypeId(wayBill.getWayBillTypeId());

		wayBillViewModel.setConsignerName(wayBill.getConsignerName());
		wayBillViewModel.setConsigneeName(wayBillModel.getConsigneeDetails().getName());
		wayBillViewModel.setConsigneePhoneNo(wayBillModel.getConsigneeDetails().getPhoneNumber());
		wayBillViewModel.setConsignmentDetails(wayBillModel.getConsignmentDetails());
		wayBillViewModel.setDeclaredValue(wayBill.getDeclaredValue());
		wayBillViewModel.setSaidToContain(wayBill.getSaidToContain());

		/**
		 * consignment related coding done (per WayBill)
		 * Start
		 */
		ConsignmentDetails[] consignment = wayBillDeatailsModel.getConsignmentDetails();
		wayBillViewModel.setArticleTypeMasterId(consignment[0].getArticleTypeMasterId());
		wayBillViewModel.setArticleType((cache.getArticleTypeMasterById(request,consignment[0].getArticleTypeMasterId())).getName());

		Double weight = 0.0;
		long totalQuantity = 0;
		HashMap<Long,PackingTypeMaster> wbPkgs = new HashMap<Long,PackingTypeMaster>();

		for (int i = 0; i < consignment.length; i++) {
			weight = weight + consignment[i].getActualWeight() + consignment[i].getChargeWeight();
			totalQuantity = totalQuantity + consignment[i].getQuantity();

			// Create HashMap for Packages of current wayBill
			PackingTypeMaster wbPkg = (PackingTypeMaster) wbPkgs.get(consignment[i].getPackingTypeMasterId());

			if(wbPkg !=null){
				wbPkg.setTotalQuantity(wbPkg.getTotalQuantity()+consignment[i].getQuantity());
			}
			else {
				wbPkg = new PackingTypeMaster();
				wbPkg.setPackingTypeMasterId(consignment[i].getPackingTypeMasterId());
				wbPkg.setName(consignment[i].getPackingTypeName());
				wbPkg.setTotalQuantity(consignment[i].getQuantity());
				wbPkgs.put(consignment[i].getPackingTypeMasterId(),wbPkg);
			}
		}

		String pkgDetail="" ; 
		int inc = 0;
		Iterator<Long> itr = wbPkgs.keySet().iterator();
		while(itr.hasNext()) {
			PackingTypeMaster pkg=  (PackingTypeMaster)wbPkgs.get(Long.parseLong(itr.next().toString()));
			if(inc == 0){
				pkgDetail=pkgDetail+pkg.getTotalQuantity()+" "+pkg.getName();
			}else{
				pkgDetail=pkgDetail+"/ "+pkg.getTotalQuantity()+" "+pkg.getName();
			}
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
		wayBillViewModel.setTotalWeight(weight);
		wayBillViewModel.setTotalQuantity(totalQuantity);
		wayBillViewModel.setNoOfArticle(consignment.length);
		wayBillViewModel.setRemark(wayBill.getRemark());
		wayBillViewModel.setStatus(wayBill.getStatus());

		return wayBillViewModel;
	}
}