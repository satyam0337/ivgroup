package com.ivcargo.reports;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.dto.constant.ExecutiveTypeConstant;
import com.iv.logsapp.LogWriter;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.ChargeTypeMasterDao;
import com.platform.dao.CustomerDetailsDao;
import com.platform.dao.ExecutiveDao;
import com.platform.dao.reports.DailySalesAccountReportDAO;
import com.platform.dao.reports.WayBillDetailsDAO;
import com.platform.dto.Branch;
import com.platform.dto.ChargeTypeMaster;
import com.platform.dto.ConsignmentDetails;
import com.platform.dto.CustomerDetails;
import com.platform.dto.Executive;
import com.platform.dto.PackingTypeMaster;
import com.platform.dto.SubRegion;
import com.platform.dto.WayBill;
import com.platform.dto.WayBillCharges;
import com.platform.dto.WayBillTaxTxn;
import com.platform.dto.WayBillType;
import com.platform.dto.constant.WayBillStatusConstant;
import com.platform.dto.model.ChargeTypeModel;
import com.platform.dto.model.DailySalesAccountModel;
import com.platform.dto.model.WayBillCategoryTypeDetails;
import com.platform.dto.model.WayBillDeatailsModel;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

public class DailySalesAccountReportAction implements Action{

	HashMap<String,WayBillCategoryTypeDetails> 	wbCategoryTypeDetails 	= new HashMap<String,WayBillCategoryTypeDetails>();

	private static final String TRACE_ID = "DailySalesAccountReportAction";
	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	 			error 					= null;
		CacheManip 							cacheManip				= null;
		Executive        					executive         		= null;
		SimpleDateFormat 					sdf               		= null;
		Timestamp        					fromDate          		= null;
		Timestamp        					toDate            		= null;
		Branch[]    						branches  				= null;
		ValueObject 						objectIn 				= null;
		ValueObject 						objectOut 				= null;
		Branch 								branch 					= null;
		SubRegion 							subRegion	 			= null;
		ArrayList<Long> 					accountGroupCollection 	= null;
		ChargeTypeModel[] 					bookingCharges  		= null;
		DailySalesAccountModel[] 			dailySalesAccountModels = null;
		HashMap<Long, WayBillDeatailsModel> wayBillDetails 			= null;
		Long[] 								wayBillIdArray			= null;
		Long[]								executiveIdsArr			= null;
		String								executiveIdsStr			= null;
		HashMap<Long, CustomerDetails>		consignorColl			= null;
		HashMap<Long, CustomerDetails>		consigneeColl			= null;
		HashMap<Long, Executive>			executiveColl			= null;
		String								wbStr					= null;
		ArrayList<DailySalesAccountModel>   bookedWBList			 = null;
		ArrayList<DailySalesAccountModel>   cancelWBList			 = null;
		DailySalesAccountModel[] 			bookedDailySalesAccountModels = null;
		DailySalesAccountModel[] 			caneldDailySalesAccountModels = null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeDailySalesAccountReportAction().execute(request, response);

			cacheManip	= new CacheManip(request);
			executive   = cacheManip.getExecutive(request);
			sdf         = new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			fromDate    = new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00").getTime());
			toDate      = new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate") + " 23:59:59").getTime());
			branches  	= null;
			long 	selectedSourceSubRegion  = JSPUtility.GetLong(request, "subRegion",0);
			long 	selectedSourceBranch = JSPUtility.GetLong(request, "branch",0);
			final long 	selectedDestSubRegion    = JSPUtility.GetLong(request, "TosubRegion",0);
			final long 	selectedDestBranch  = JSPUtility.GetLong(request, "SelectDestBranch",0);
			final long 	wayBillTypeId		= JSPUtility.GetLong(request, "WayBillType",0);
			short 	filter				= 0;

			if(wayBillTypeId == 0) {
				if(selectedDestSubRegion == 0) {
					if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN) {
						if(selectedSourceSubRegion == 0)
							filter = 13;
						else if(selectedSourceBranch == 0)
							filter = 7;
						else
							filter = 1;
					} else {
						selectedSourceSubRegion  = executive.getSubRegionId();
						selectedSourceBranch = executive.getBranchId();
						filter				= 1;
					}
				} else if(selectedDestBranch == 0) {
					if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN) {
						if(selectedSourceSubRegion == 0)
							filter = 17;
						else if(selectedSourceBranch == 0)
							filter = 11;
						else
							filter = 5;
					} else {
						selectedSourceSubRegion  = executive.getSubRegionId();
						selectedSourceBranch = executive.getBranchId();
						filter				= 5;
					}
				} else if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN) {
					if(selectedSourceSubRegion == 0)
						filter = 18;
					else if(selectedSourceBranch == 0)
						filter = 12;
					else
						filter = 6;
				} else {
					selectedSourceSubRegion  = executive.getSubRegionId();
					selectedSourceBranch = executive.getBranchId();
					filter				= 6;
				}
			} else if(selectedDestSubRegion == 0) {
				if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN) {
					if(selectedSourceSubRegion == 0)
						filter = 14;
					else if(selectedSourceBranch == 0)
						filter = 8;
					else
						filter = 2;
				} else {
					selectedSourceSubRegion  = executive.getSubRegionId();
					selectedSourceBranch = executive.getBranchId();
					filter				= 2;
				}
			} else if(selectedDestBranch == 0) {
				if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN) {
					if(selectedSourceSubRegion == 0)
						filter = 15;
					else if(selectedSourceBranch == 0)
						filter = 9;
					else
						filter = 3;
				} else {
					selectedSourceSubRegion  = executive.getSubRegionId();
					selectedSourceBranch = executive.getBranchId();
					filter				= 3;
				}
			} else if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN) {
				if(selectedSourceSubRegion == 0)
					filter = 16;
				else if(selectedSourceBranch == 0)
					filter = 10;
				else
					filter = 4;
			} else {
				selectedSourceSubRegion  = executive.getSubRegionId();
				selectedSourceBranch = executive.getBranchId();
				filter				= 4;
			}

			//Get all selected source Branches
			branches = cacheManip.getBothTypeOfBranchesDetails(request, ""+executive.getAccountGroupId(), ""+selectedDestSubRegion);
			request.setAttribute("destBranches", branches);

			branches = cacheManip.getBothTypeOfBranchesDetails(request, ""+executive.getAccountGroupId(), ""+selectedSourceSubRegion);
			request.setAttribute("srcBranches", branches);

			objectIn  = new ValueObject();
			objectOut = new ValueObject();

			objectIn.put("fromDate", fromDate);
			objectIn.put("toDate", toDate);
			objectIn.put("destSubRegion", selectedDestSubRegion);
			objectIn.put("destBranch",selectedDestBranch);
			objectIn.put("srcSubRegion",selectedSourceSubRegion);
			objectIn.put("srcBranch",selectedSourceBranch);
			objectIn.put("accountGroupId", executive.getAccountGroupId());
			objectIn.put("wayBillTypeId",wayBillTypeId);
			objectIn.put("filter",filter);

			objectOut = DailySalesAccountReportDAO.getInstance().getReport(objectIn);
			dailySalesAccountModels = (DailySalesAccountModel[])objectOut.get("DailySalesAccountModel");
			wayBillIdArray 			= (Long[]) objectOut.get("WayBillIdArray");
			bookedWBList			=  new ArrayList<DailySalesAccountModel>();
			cancelWBList			=  new ArrayList<DailySalesAccountModel>();

			if(dailySalesAccountModels != null && wayBillIdArray != null){
				accountGroupCollection = new ArrayList<Long>();
				//Get WayBill Details code ( Start )
				wayBillDetails = WayBillDetailsDAO.getInstance().getWayBillDetails(wayBillIdArray ,true ,ChargeTypeMaster.WAYBILL_CHARGETYPE_BOOKING ,true ,WayBillTaxTxn.WAYBILL_TAX_TXN_TYPE_BOOKING ,true);
				//Get WayBill Details code ( End )

				wbStr			= Utility.GetLongArrayToString(wayBillIdArray);
				consignorColl 	= CustomerDetailsDao.getInstance().getConsignorDetailsByWayBillId(wbStr);
				consigneeColl 	= CustomerDetailsDao.getInstance().getConsigneeDetailsByWayBillId(wbStr);

				executiveIdsArr = (Long[])objectOut.get("ExecutiveIdsArr");
				executiveIdsStr	= Utility.GetLongArrayToString(executiveIdsArr);
				executiveColl	= ExecutiveDao.getInstance().getExecutiveDetailsByExecutiveIds(executiveIdsStr);

				for (final DailySalesAccountModel dailySalesAccountModel : dailySalesAccountModels) {
					dailySalesAccountModel.setConsignorName(consignorColl.get(dailySalesAccountModel.getWayBillId()).getName());
					dailySalesAccountModel.setConsigneeName(consigneeColl.get(dailySalesAccountModel.getWayBillId()).getName());
					dailySalesAccountModel.setExecutiveName(executiveColl.get(dailySalesAccountModel.getExecutiveId()).getName());

					populateDailySalesAccountModels(request ,dailySalesAccountModel ,wayBillDetails.get(dailySalesAccountModel.getWayBillId()) ,cacheManip ,executive ,branch ,subRegion);
					if(!accountGroupCollection.contains(dailySalesAccountModel.getAccountGroupId()))
						accountGroupCollection.add(dailySalesAccountModel.getAccountGroupId());

					if(dailySalesAccountModel.getStatus() != WayBillStatusConstant.WAYBILL_STATUS_CANCELLED)
						bookedWBList.add(dailySalesAccountModel);
					else
						cancelWBList.add(dailySalesAccountModel);
				}

				if(!bookedWBList.isEmpty()){
					bookedDailySalesAccountModels = new DailySalesAccountModel[bookedWBList.size()];
					bookedWBList.toArray(bookedDailySalesAccountModels);
				}

				if(!cancelWBList.isEmpty()){
					caneldDailySalesAccountModels = new DailySalesAccountModel[cancelWBList.size()];
					cancelWBList.toArray(caneldDailySalesAccountModels);
				}

				request.setAttribute("DailySalesAccountModel", bookedDailySalesAccountModels);
				request.setAttribute("CancelDailySalesAccountModel", caneldDailySalesAccountModels);

				request.setAttribute("wayBillTypeDetails", wbCategoryTypeDetails);

				if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN) {
					if(selectedSourceSubRegion != 0) {
						cacheManip 		= new CacheManip(request);
						subRegion	= cacheManip.getGenericSubRegionById(request, selectedSourceSubRegion);

						if(selectedSourceBranch != 0) {
							branch = cacheManip.getGenericBranchDetailCache(request , selectedSourceBranch);
							if(branch.getMappingTypeId() == Branch.BRANCH_MAP_ID_OWN_BRANCH_AND_ASSIGNED)
								bookingCharges = cacheManip.getBookingCharges(request, executive.getBranchId());
							else {
								bookingCharges  = cacheManip.getBookingCharges(request, selectedDestBranch);

								if(bookingCharges == null)
									bookingCharges  = ChargeTypeMasterDao.getInstance().getChargeConfiguration(dailySalesAccountModels[0].getAccountGroupId(), branch.getAgencyId(), branch.getBranchId(),ChargeTypeMaster.WAYBILL_CHARGETYPE_BOOKING);
							}
						} else
							bookingCharges = getChargesDataByACID(accountGroupCollection);
					} else
						bookingCharges = getChargesDataByACID(accountGroupCollection);
				} else
					bookingCharges = cacheManip.getBookingCharges(request, executive.getBranchId());

				request.setAttribute("wayBillCharges",bookingCharges);
				ActionStaticUtil.setReportViewModel(request);
				request.setAttribute("nextPageToken", "success");
			} else {
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		} finally {
			error 					= null;
			cacheManip				= null;
			executive         		= null;
			sdf               		= null;
			fromDate          		= null;
			toDate            		= null;
			branches  				= null;
			objectIn 				= null;
			objectOut 				= null;
			branch 					= null;
			subRegion				= null;
			accountGroupCollection 	= null;
			bookingCharges  		= null;
			dailySalesAccountModels = null;
			wayBillDetails 			= null;
			wayBillIdArray			= null;
			executiveIdsArr			= null;
			executiveIdsStr			= null;
			consignorColl			= null;
			consigneeColl			= null;
			executiveColl			= null;
			wbStr					= null;
		}
	}

	public ChargeTypeModel[] getChargesDataByACID(ArrayList<Long> accountGroupCollection) throws Exception {
		StringBuilder 	accountGroupIdStr 	= null;
		Iterator<Long> 	iterator 			= null;

		try {
			accountGroupIdStr 	= new StringBuilder();
			iterator 			= accountGroupCollection.iterator();

			while(iterator.hasNext())
				accountGroupIdStr.append(iterator.next()+",");

			return ChargeTypeMasterDao.getInstance().getCharges(accountGroupIdStr.toString().substring(0, accountGroupIdStr.toString().length()-1), ChargeTypeMaster.WAYBILL_CHARGETYPE_BOOKING);
		} catch (final Exception e) {
			throw e;
		} finally {
			accountGroupIdStr 	= null;
			iterator 			= null;
		}
	}

	@SuppressWarnings("unchecked")
	public void populateDailySalesAccountModels(HttpServletRequest request, DailySalesAccountModel dailySalesAccountModel ,WayBillDeatailsModel wayBillDeatailsModel ,CacheManip cache ,Executive executive ,Branch branch ,SubRegion  subRegion)throws Exception {

		try {

			branch = cache.getGenericBranchDetailCache(request, dailySalesAccountModel.getDestinationBranchId());
			dailySalesAccountModel.setDestinationBranch(branch.getName());

			subRegion = cache.getGenericSubRegionById(request, dailySalesAccountModel.getDestinationSubRegionId());
			dailySalesAccountModel.setDestinationSubRegion(subRegion.getName());

			branch = cache.getGenericBranchDetailCache(request,dailySalesAccountModel.getSourceBranchId());
			dailySalesAccountModel.setSourceBranch(branch.getName());

			subRegion = cache.getGenericSubRegionById(request, dailySalesAccountModel.getSourceSubRegionId());
			dailySalesAccountModel.setSourceSubRegion(subRegion.getName());

			WayBillType wayBillType = cache.getWayBillTypeById(request, dailySalesAccountModel.getWayBillTypeId());
			if(dailySalesAccountModel.isManual())
				dailySalesAccountModel.setWayBillType(wayBillType.getWayBillType()+WayBillType.WAYBILL_TYPE_MANUAL);
			else
				dailySalesAccountModel.setWayBillType(wayBillType.getWayBillType());

			/**
			 * Consignment related coding done (per WayBill)
			 * Start
			 */
			ConsignmentDetails[] consignment = wayBillDeatailsModel.getConsignmentDetails();
			HashMap<Long,PackingTypeMaster> wbPkgs = new HashMap<Long,PackingTypeMaster>();
			long totalQuantity = 0;

			for (final ConsignmentDetails element : consignment) {

				totalQuantity = totalQuantity + element.getQuantity();
				// Create HashMap for Packages of current wayBill
				PackingTypeMaster wbPkg = wbPkgs.get(element.getPackingTypeMasterId());

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

			String pkgDetail="" ;
			int inc = 0;
			Iterator<Long> itr = wbPkgs.keySet().iterator();
			while(itr.hasNext()) {
				final PackingTypeMaster pkg=  wbPkgs.get(Long.parseLong(itr.next().toString()));
				if(inc == 0)
					pkgDetail=pkgDetail+pkg.getTotalQuantity()+" "+pkg.getName();
				else
					pkgDetail=pkgDetail+"/ "+pkg.getTotalQuantity()+" "+pkg.getName();
				inc++;
			}
			dailySalesAccountModel.setTypeWisePackages(pkgDetail);

			/**
			 * End
			 */


			/**
			 * WayBillCharges related coding done (per WayBill)
			 * Start
			 */

			WayBillCharges[] wayBillCharges = wayBillDeatailsModel.getWayBillCharges();
			WayBillTaxTxn[] wayBillTaxTxns = wayBillDeatailsModel.getWayBillTaxTxn();

			double totalTax 			= 0.00;
			double totalDiscount 		= 0.00;

			for (final WayBillTaxTxn wayBillTaxTxn : wayBillTaxTxns)
				totalTax = totalTax + wayBillTaxTxn.getTaxAmount();

			if(dailySalesAccountModel.isDiscountPercent())
				totalDiscount = Math.round(dailySalesAccountModel.getAmount() * dailySalesAccountModel.getDiscount() / 100);
			else
				totalDiscount = dailySalesAccountModel.getDiscount();

			WayBillCategoryTypeDetails wayBillCategoryTypeDetails = wbCategoryTypeDetails.get(dailySalesAccountModel.getWayBillType());

			if(wayBillCategoryTypeDetails == null){
				wayBillCategoryTypeDetails = new WayBillCategoryTypeDetails();

				wayBillCategoryTypeDetails.setWayBillType(dailySalesAccountModel.getWayBillType());
				HashMap<Long,Double> chargesCollection = new HashMap<Long,Double>();

				if(dailySalesAccountModel.getStatus() != WayBill.WAYBILL_STATUS_CANCELLED){

					wayBillCategoryTypeDetails.setQuantity(totalQuantity);
					wayBillCategoryTypeDetails.setTotalTax(totalTax);
					wayBillCategoryTypeDetails.setBookingDiscount(totalDiscount);
					wayBillCategoryTypeDetails.setTotalAmount(dailySalesAccountModel.getGrandTotal() - (dailySalesAccountModel.getDeliveryAmount() - dailySalesAccountModel.getDeliveryDiscount()));

					for (final WayBillCharges wayBillCharge : wayBillCharges)
						chargesCollection.put(wayBillCharge.getWayBillChargeMasterId(), wayBillCharge.getChargeAmount());

					wayBillCategoryTypeDetails.setChargesCollection(chargesCollection);
					wayBillCategoryTypeDetails.setTotalCancellationAmount(0.0);
					chargesCollection = null;

				}else{
					wayBillCategoryTypeDetails.setTotalTax(0.0);
					wayBillCategoryTypeDetails.setBookingDiscount(0.0);
					wayBillCategoryTypeDetails.setTotalAmount(0.0);
					wayBillCategoryTypeDetails.setQuantity(-totalQuantity);

					for (final WayBillCharges wayBillCharge : wayBillCharges)
						chargesCollection.put(wayBillCharge.getWayBillChargeMasterId(), 0.0);

					wayBillCategoryTypeDetails.setChargesCollection(chargesCollection);
					wayBillCategoryTypeDetails.setTotalCancellationAmount(dailySalesAccountModel.getGrandTotal());
				}

				wbCategoryTypeDetails.put(dailySalesAccountModel.getWayBillType(), wayBillCategoryTypeDetails);
			} else if(dailySalesAccountModel.getStatus() != WayBill.WAYBILL_STATUS_CANCELLED){
				wayBillCategoryTypeDetails.setQuantity(wayBillCategoryTypeDetails.getQuantity() + totalQuantity);

				wayBillCategoryTypeDetails.setTotalTax(wayBillCategoryTypeDetails.getTotalTax() + totalTax);
				wayBillCategoryTypeDetails.setBookingDiscount(wayBillCategoryTypeDetails.getBookingDiscount() + totalDiscount);
				wayBillCategoryTypeDetails.setTotalAmount(wayBillCategoryTypeDetails.getTotalAmount() + (dailySalesAccountModel.getGrandTotal() - (dailySalesAccountModel.getDeliveryAmount() - dailySalesAccountModel.getDeliveryDiscount())));

				final Map<Long,Double> chargesCollection = wayBillCategoryTypeDetails.getChargesCollection();

				for (final WayBillCharges wayBillCharge : wayBillCharges)
					if(chargesCollection.get(wayBillCharge.getWayBillChargeMasterId()) != null)
						chargesCollection.put(wayBillCharge.getWayBillChargeMasterId(), chargesCollection.get(wayBillCharge.getWayBillChargeMasterId()) + wayBillCharge.getChargeAmount());
					else chargesCollection.put(wayBillCharge.getWayBillChargeMasterId(), wayBillCharge.getChargeAmount());

				wayBillCategoryTypeDetails.setTotalCancellationAmount(wayBillCategoryTypeDetails.getTotalCancellationAmount() + 0);
			}else{
				wayBillCategoryTypeDetails.setQuantity(wayBillCategoryTypeDetails.getQuantity() - totalQuantity);
				wayBillCategoryTypeDetails.setTotalCancellationAmount(wayBillCategoryTypeDetails.getTotalCancellationAmount() + dailySalesAccountModel.getGrandTotal());
			}

			branch 						= null;
			subRegion 					= null;
			cache            			= null;
			wayBillType 				= null;
			consignment 				= null;
			wbPkgs 						= null;
			pkgDetail 					= null;
			itr 						= null;
			wayBillCharges 				= null;
			wayBillTaxTxns 				= null;
			wayBillCategoryTypeDetails 	= null;
		}catch (final Exception e) {
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, e.getMessage());
			throw e;
		}
	}
}