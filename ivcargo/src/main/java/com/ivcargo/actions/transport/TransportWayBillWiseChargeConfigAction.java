package com.ivcargo.actions.transport;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.ChargeConfigBLL;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.logsapp.LogWriter;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.ChargeConfigDao;
import com.platform.dao.reports.WayBillDetailsDAO;
import com.platform.dto.AccountGroup;
import com.platform.dto.AliasNameConstants;
import com.platform.dto.Branch;
import com.platform.dto.ChargeConfig;
import com.platform.dto.ChargeTypeMaster;
import com.platform.dto.ConsignmentDetails;
import com.platform.dto.Executive;
import com.platform.dto.PackingTypeMaster;
import com.platform.dto.SubRegion;
import com.platform.dto.WayBill;
import com.platform.dto.WayBillType;
import com.platform.dto.configuration.mindateselection.ModuleWiseMinDateSelectionConfigurationDTO;
import com.platform.dto.model.ReportViewModel;
import com.platform.dto.model.WayBillDeatailsModel;
import com.platform.dto.model.WayBillModel;
import com.platform.dto.model.WayBillViewModel;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

public class TransportWayBillWiseChargeConfigAction implements Action {

	public static final String 			TRACE_ID 				= "TransportWayBillWiseChargeConfigAction";
	HashMap<Long, WayBillDeatailsModel> wayBillDetails 			= null;
	HashMap<Long, Double> 				wayBillChargeCollection = null;
	Executive                  			executive				= null;
	CacheManip       					cache            		= null;

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
		WayBillViewModel[] 				wayBillViewList				= null;
		ReportViewModel 				reportViewModel				= null;
		ArrayList<Long>					receiveLocationList			= null;
		HashMap<Long, ChargeConfig>  	chargeConigMap	       	 	= null;
		ValueObject						valueObject					= null;	
		String							wayBillIds					= null;
		String							wayBillNumber				= null;
		ChargeConfig					chargeConfigModel			= null;
		long							accountGroupId				= 0;
		Timestamp						minDateTimeStamp			= null;
		
		try {

			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error)){
				return;
			}

			wayBillDetails 			= new HashMap<Long, WayBillDeatailsModel>();
			wayBillChargeCollection = new HashMap<Long, Double>();
			executive				= (Executive) request.getSession().getAttribute("executive");
			cache    	 			= new CacheManip(request);
			chargeConfigBLL  		= new ChargeConfigBLL();
			inValObj         		= new ValueObject();
			accountGroupId			= executive.getAccountGroupId(); 
			wayBillNumber			= JSPUtility.GetString(request, "wayBillNumber");
			
			minDateTimeStamp		= cache.getModuleWiseMinDateToGetData(request, accountGroupId, 
										ModuleWiseMinDateSelectionConfigurationDTO.LR_WISE_OCTROI_ENTRY_MIN_DATE_ALLOW, 
										ModuleWiseMinDateSelectionConfigurationDTO.LR_WISE_OCTROI_ENTRY_MIN_DATE);
			
			inValObj.put(AliasNameConstants.WAYBILL_NUMBER, wayBillNumber.replaceAll("\\s", ""));
			inValObj.put(AliasNameConstants.ACCOUNTGROUP_ID, accountGroupId);
			inValObj.put(AliasNameConstants.MIN_DATE_TIMESTAMP, minDateTimeStamp);

			outValObj = chargeConfigBLL.getWayBillWiseChargeConfig(inValObj);
			
			if (outValObj.get("wayBillModels") != null && outValObj.get("WayBillIdArray") != null) {
				wayBillModels           = (WayBillModel[]) outValObj.get("wayBillModels");
				wayBillIdArray 			= (Long[]) outValObj.get("WayBillIdArray");
				strForChargeConfig		= outValObj.get("strForChargeConfig").toString();


				inValObj.put("strForChargeConfig", strForChargeConfig);
				inValObj.put("strForWayBillCharge", strForWayBillCharge);
				inValObj.put("chargeTypeMasterId", ChargeTypeMaster.OCTROI_DELIVERY);


				wayBillIds	= Utility.GetLongArrayToString(wayBillIdArray);
				valueObject = ChargeConfigDao.getInstance().getLimitedChargeConfigData(wayBillIds);

				if(valueObject != null){
					chargeConigMap  = (HashMap<Long, ChargeConfig>)valueObject.get("chargeConigMap");
				}

				//Get WayBill Details code ( Start )
				wayBillDetails = WayBillDetailsDAO.getInstance().getWayBillDetails(wayBillIdArray ,false ,(short)0 ,false ,(short)0 ,true);
				//Get WayBill Details code ( End )

				wayBillViewList = new WayBillViewModel[wayBillModels.length];
				reportViewModel = new ReportViewModel();

				for (int i = 0; i < wayBillModels.length; i++) {

					if(i == 0) {
						reportViewModel = populateReportViewModel(request,reportViewModel,wayBillModels[i]); 
						request.setAttribute("ReportViewModel", reportViewModel);
					}

					wayBillViewList[i] = populateWayBillViewModel(request, wayBillModels[i]);

					if(chargeConigMap != null){
						chargeConfigModel = chargeConigMap.get(wayBillModels[i].getWayBill().getWayBillId());
						if(chargeConfigModel != null){
							wayBillViewList[i].setInvoiceCertificationBillId(chargeConfigModel.getInvoiceCertificationBillId());
						}
					}
				}
				LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_DEBUG, "wayBillViewList ---- "+wayBillViewList);
				receiveLocationList = cache.getAssignedLocationsIdListByLocationIdId(request, executive.getBranchId(), executive.getAccountGroupId());

				request.setAttribute("receiveLocationList", receiveLocationList);
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
		} finally {
			chargeConfigBLL				= null;
			inValObj					= null;
			outValObj					= null;
			wayBillModels           	= null;
			wayBillIdArray 				= null;
			strForChargeConfig			= null;
			strForWayBillCharge			= null;
			wayBillViewList				= null;
			reportViewModel				= null;
			wayBillDetails 				= null;
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

		} catch (Exception e) {
			throw e;
		} finally {
			wayBill			= null;
			branch 			= null;
			accountGroup 	= null;
		}
	}


	public WayBillViewModel populateWayBillViewModel(HttpServletRequest request, WayBillModel wayBillModel) throws Exception {

		WayBill          				wayBill          			= null;
		WayBillDeatailsModel 			wayBillDeatailsModel 		= null;
		WayBillViewModel 				wayBillViewModel 			= null;
		Branch 							branch						= null;
		/*City 							city						= null;*/
		SubRegion 						subRegion					= null;
		WayBillType 					wayBillType 				= null;
		ConsignmentDetails[]			consignment					= null;
		HashMap<Long,PackingTypeMaster> wbPkgs 						= null;
		PackingTypeMaster 				wbPkg 						= null;
		String 							pkgDetail 					= null;
		Iterator<Long> 					itr 						= null;
		PackingTypeMaster 				pkg 						= null;

		try {

			wayBill          		= wayBillModel.getWayBill();
			wayBillDeatailsModel 	= wayBillDetails.get(wayBill.getWayBillId());
			wayBillViewModel 		= new WayBillViewModel();
	
			if(wayBillChargeCollection.get(wayBill.getWayBillId()) != null){
				wayBillViewModel.setWayBillChargeConfigAmount(wayBillChargeCollection.get(wayBill.getWayBillId()));
			} else {
				wayBillViewModel.setWayBillChargeConfigAmount(0);
			}

			branch = cache.getGenericBranchDetailCache(request,wayBill.getDestinationBranchId());
			wayBill.setDestinationSubRegionId(branch.getSubRegionId());

			wayBillViewModel.setDestinationBranch(branch.getName());
			wayBillViewModel.setDestinationBranchId(wayBill.getDestinationBranchId());

			if(wayBill.getDestinationSubRegionId() > 0) {
				subRegion= cache.getGenericSubRegionById(request, wayBill.getDestinationSubRegionId());
				wayBillViewModel.setDestinationSubRegion(subRegion.getName());
				wayBillViewModel.setDestinationSubRegionId(wayBill.getDestinationSubRegionId());
			}

			branch = cache.getGenericBranchDetailCache(request,wayBill.getSourceBranchId());
			wayBill.setSourceBranch(branch.getName());
			wayBill.setSourceSubRegionId(branch.getSubRegionId());
			
			wayBillViewModel.setSourceBranch(branch.getName());

			subRegion = cache.getGenericSubRegionById(request, wayBill.getSourceSubRegionId());
			wayBillViewModel.setSourceSubRegion(subRegion.getName());
			wayBillViewModel.setWayBillId(wayBill.getWayBillId());
			wayBillViewModel.setWayBillNumber(wayBill.getWayBillNumber());

			wayBillType = cache.getWayBillTypeById(request, wayBill.getWayBillTypeId());
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
			consignment = wayBillDeatailsModel.getConsignmentDetails();
			//wayBillViewModel.setArticleTypeMasterId(consignment[0].getArticleTypeMasterId());
			//wayBillViewModel.setArticleType((cache.getArticleTypeMasterById(request,consignment[0].getArticleTypeMasterId())).getName());

			double 	weight			= 0.0;
			long 	totalQuantity	= 0;
			wbPkgs = new HashMap<Long,PackingTypeMaster>();

			for (int i = 0; i < consignment.length; i++) {

				weight 			+= consignment[i].getActualWeight() + consignment[i].getChargeWeight();
				totalQuantity 	+= consignment[i].getQuantity();

				// Create HashMap for Packages of current wayBill
				wbPkg = (PackingTypeMaster) wbPkgs.get(consignment[i].getPackingTypeMasterId());

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

			pkgDetail	= "";
			itr			= wbPkgs.keySet().iterator();
			int inc = 0;
			while(itr.hasNext()) {
				pkg = (PackingTypeMaster)wbPkgs.get(Long.parseLong(itr.next().toString()));
				if(inc == 0){
					pkgDetail=pkgDetail+pkg.getTotalQuantity()+" "+pkg.getName();
				}else{
					pkgDetail=pkgDetail+"/ "+pkg.getTotalQuantity()+" "+pkg.getName();
				}
				inc++;
			}

			wayBillViewModel.setTotalPackagesTypeQuantity(pkgDetail);

			/*wayBillViewModel.setAmount(wayBill.getAmount());
			wayBillViewModel.setDiscount(wayBill.getDiscount());
			wayBillViewModel.setDeliveryAmount(wayBill.getDeliveryAmount());
			wayBillViewModel.setDeliveryDiscount(wayBill.getDeliveryDiscount());
			wayBillViewModel.setGrandTotal(wayBill.getGrandTotal() - (wayBill.getDeliveryAmount() - wayBill.getDeliveryDiscount()));
			 */			
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
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_DEBUG, "wayBill.getStatus()++ "+wayBill.getStatus());
			return wayBillViewModel;

		} catch (Exception e) {
			throw e;
		} finally {
			wayBill          			= null;
			wayBillDeatailsModel 		= null;
			wayBillViewModel 			= null;
			branch						= null;
			subRegion					= null;
			wayBillType 				= null;
			consignment					= null;
			wbPkgs 						= null;
			wbPkg 						= null;
			pkgDetail 					= null;
			itr 						= null;
			pkg 						= null;
		}
	}
}