package com.ivcargo.reports;

//~--- non-JDK imports --------------------------------------------------------

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.RegionWiseCollectionDao;
import com.platform.dao.reports.WayBillDetailsDAO;
import com.platform.dto.Branch;
import com.platform.dto.ChargeTypeMaster;
import com.platform.dto.ECargoConstantFile;
import com.platform.dto.Executive;
import com.platform.dto.RegionWiseCollection;
import com.platform.dto.RegionWiseCollectionModel;
import com.platform.dto.VehicleType;
import com.platform.dto.WayBillCharges;
import com.platform.dto.WayBillTaxTxn;
import com.platform.dto.WayBillType;
import com.platform.dto.constant.CargoAccountGroupConstant;
import com.platform.dto.model.WayBillDeatailsModel;
import com.platform.resource.CargoErrorList;

public class RegionWiseReportAction implements Action {

	@Override
	@SuppressWarnings("unchecked")
	public void execute(HttpServletRequest request, HttpServletResponse response) {

		HashMap<String,Object>	 				error 				= null;
		Executive								executive      		= null;
		SimpleDateFormat						sdf            		= null;
		Timestamp								fromDate       		= null;
		Timestamp								toDate         		= null;
		CacheManip								cache 				= null;
		ValueObject								outValObj			= null;
		Long[]									wayBillIdsArr		= null;
		WayBillCharges[]						wayBillCharges		= null;
		StringBuilder							srcBranches			= null;
		Iterator<Long>							itr					= null;
		String									branchIds			= null;
		Branch									brData				= null;
		HashMap<Long,Branch>					branchToShow		= null;
		WayBillDeatailsModel					wayBillDeatailsModel= null;
		HashMap<Long,Branch>					branches			= null;
		RegionWiseCollection[]					rptModel			= null;
		RegionWiseCollectionModel				destinationModel	= null;
		RegionWiseCollectionModel[]				reportData			= null;
		HashMap<Long,WayBillDeatailsModel>		wayBillDetails		= null;
		HashMap<Long,RegionWiseCollectionModel> reportCollection	= null;
		long									regionId			= 0;
		long 									subRegionId			= 0;
		double 									wbTotalAmt			= 0;
		long									accountGroupId 		= 0;
		short									dataTypeFilter 		= 0;
		ArrayList<Long>							cancelledWayBillIds = null;
		boolean 								cancelAmt			= false;
		short									selection	 		= 0;
		String									vehicleTypeIds		= null;
		Branch									srcBranch			= null;
		Branch									destBranch			= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeRegionWiseReportAction().execute(request, response);

			sdf			= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			fromDate	= new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00").getTime());
			toDate		= new Timestamp(sdf.parse(JSPUtility.GetString(request, "toDate") + " 23:59:59").getTime());
			cache 		= new CacheManip(request);
			executive	= cache.getExecutive(request);
			reportCollection= new HashMap<Long,RegionWiseCollectionModel>();
			accountGroupId 	= executive.getAccountGroupId();
			dataTypeFilter 	= JSPUtility.GetShort(request, "dataTypeFilter");
			selection 		= Short.parseShort(request.getParameter("selection"));

			if(selection == (short)0)
				vehicleTypeIds = VehicleType.VEHICLE_TYPE_BUS_ID+","+VehicleType.VEHICLE_TYPE_TRUCK_ID;
			else
				vehicleTypeIds = selection+"";

			if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_GROUPADMIN)
				regionId = Long.parseLong(request.getParameter("region"));
			else if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_REGIONADMIN)
				regionId = executive.getRegionId();
			else {
				regionId 	= executive.getRegionId();
				subRegionId = executive.getSubRegionId();
			}

			if(regionId != 0)
				branchToShow = cache.getBranchesByRegionId(request, executive.getAccountGroupId(),regionId);
			else
				branchToShow = cache.getAllGroupBranches(request, accountGroupId);

			srcBranches = new StringBuilder();

			if(subRegionId > 0)
				branches = cache.getBranchesBySubRegionId(request, executive.getAccountGroupId(), regionId);
			else if(regionId >= 0)
				if(executive.getAccountGroupId()== CargoAccountGroupConstant.ACCOUNT_GORUP_ID_SUGAMA_TRAVELS && executive.getCityId() != 307)
					branches = cache.getBranchesByRegionId(request, executive.getAccountGroupId(), regionId);
				else
					branches = cache.getBranchesByRegionId(request, executive.getAccountGroupId(), executive.getRegionId());

			for(final long bId : branches.keySet()) {
				final Branch br = branches.get(bId);
				srcBranches.append(br.getBranchId()+",");
			}

			if(srcBranches.length() > 0)
				branchIds = srcBranches.toString().substring(0, srcBranches.length()-1);

			if(branchIds != null && branchIds.length() > 0){

				outValObj = RegionWiseCollectionDao.getInstance().getRegionWiseDispacthData(fromDate, toDate, branchIds.toString() , accountGroupId, dataTypeFilter, vehicleTypeIds.toString());

				if(outValObj != null) {

					rptModel		    = (RegionWiseCollection[]) outValObj.get("reportArr");
					wayBillIdsArr	    = (Long[]) outValObj.get("wayBillIdsArr");
					cancelledWayBillIds = (ArrayList<Long>) outValObj.get("cancelledWayBillIds");
					wayBillDetails	    = WayBillDetailsDAO.getInstance().getWayBillDetails(wayBillIdsArr,true ,ChargeTypeMaster.WAYBILL_CHARGETYPE_BOOKING ,false ,WayBillTaxTxn.WAYBILL_TAX_TXN_TYPE_BOOKING ,false);

					if(rptModel != null){
						for (final RegionWiseCollection element : rptModel) {

							srcBranch  = cache.getGenericBranchDetailCache(request, element.getSourceBranchId());
							destBranch = cache.getGenericBranchDetailCache(request, element.getDestinationBranchId());

							element.setSourceSubRegionId(srcBranch.getSubRegionId());
							element.setSourceSubRegionId(destBranch.getSubRegionId());

							cancelAmt = false;

							if(cancelledWayBillIds != null && !cancelledWayBillIds.isEmpty() && cancelledWayBillIds.contains(element.getWayBillId()))
								cancelAmt = true;

							wayBillDeatailsModel = wayBillDetails.get(element.getWayBillId());

							wayBillCharges = wayBillDeatailsModel.getWayBillCharges();

							for (int j = 0; j < wayBillCharges.length; j++)
								if(wayBillCharges[j].getWayBillChargeMasterId() == ChargeTypeMaster.FREIGHT){
									if(cancelAmt)
										element.setFreightAmount(-wayBillCharges[j].getChargeAmount());
									else
										element.setFreightAmount(wayBillCharges[j].getChargeAmount());
								}else if(wayBillCharges[j].getWayBillChargeMasterId() == ChargeTypeMaster.DOOR_DELIVERY_BOOKING)
									if(cancelAmt)
										element.setDoorDlyAmount(-wayBillCharges[j].getChargeAmount());
									else
										element.setDoorDlyAmount(wayBillCharges[j].getChargeAmount());

							if(executive.getAccountGroupId() == ECargoConstantFile.ACCOUNTGROUPID_SUGAMA_TRAVELS)
								wbTotalAmt = element.getFreightAmount();
							else
								wbTotalAmt = element.getTotalAmount();

							if(branchToShow.containsKey(element.getDestinationBranchId()))
								if(reportCollection.get(element.getDestinationBranchId()) != null){
									destinationModel = reportCollection.get(element.getDestinationBranchId());

									if(element.getWayBillTypeId() == WayBillType.WAYBILL_TYPE_PAID){
										if(element.getVehicleTypeId() == VehicleType.VEHICLE_TYPE_BUS_ID)
											destinationModel.setPaidBusTotalAmount(destinationModel.getPaidBusTotalAmount() + wbTotalAmt);
										else
											destinationModel.setPaidTruckTotalAmount(destinationModel.getPaidTruckTotalAmount() + wbTotalAmt);
										destinationModel.setPaidTotalAmount(destinationModel.getPaidTotalAmount() + wbTotalAmt);
									}else if(element.getWayBillTypeId() == WayBillType.WAYBILL_TYPE_TO_PAY){
										if(element.getVehicleTypeId() == VehicleType.VEHICLE_TYPE_BUS_ID)
											destinationModel.setTopayBusTotalAmount(destinationModel.getTopayBusTotalAmount() + wbTotalAmt);
										else
											destinationModel.setTopayTruckTotalAmount(destinationModel.getTopayTruckTotalAmount() + wbTotalAmt);
										destinationModel.setTopayTotalAmount(destinationModel.getTopayTotalAmount() + wbTotalAmt);
									}else if(element.getWayBillTypeId() == WayBillType.WAYBILL_TYPE_CREDIT){
										if(element.getVehicleTypeId() == VehicleType.VEHICLE_TYPE_BUS_ID)
											destinationModel.setCreditBusTotalAmount(destinationModel.getCreditBusTotalAmount() + wbTotalAmt);
										else
											destinationModel.setCreditTruckTotalAmount(destinationModel.getCreditTruckTotalAmount() + wbTotalAmt);
										destinationModel.setCreditTotalAmount(destinationModel.getCreditTotalAmount() + wbTotalAmt);
									}

									double commAoumnt = element.getBookingCommission();

									if(commAoumnt == 0)
										commAoumnt = wbTotalAmt * VehicleType.VEHICLE_TYPE_BUS_COMM / 100;

									if(cancelAmt)
										commAoumnt = -commAoumnt;

									if(element.getVehicleTypeId() == VehicleType.VEHICLE_TYPE_BUS_ID) {
										destinationModel.setTotalBusCommAmount(destinationModel.getTotalBusCommAmount() + commAoumnt);
										destinationModel.setTotalBusAmount(destinationModel.getTotalBusAmount() + wbTotalAmt);
									} else {
										destinationModel.setTotalTruckCommAmount(destinationModel.getTotalTruckCommAmount() + commAoumnt);
										destinationModel.setTotalTruckAmount(destinationModel.getTotalTruckAmount() + wbTotalAmt);
									}

									destinationModel.setTotalCommAmount(destinationModel.getTotalCommAmount() + commAoumnt);
									destinationModel.setTotalAmount(destinationModel.getPaidTotalAmount() + destinationModel.getTopayTotalAmount() + destinationModel.getCreditTotalAmount());
									destinationModel.setTotalDoorDlvryAmount(destinationModel.getTotalDoorDlvryAmount() + element.getDoorDlyAmount());
								}else{
									destinationModel = new RegionWiseCollectionModel();
									destinationModel.setBranchId(element.getBranchId());
									destinationModel.setDestinationBranchId(element.getDestinationBranchId());
									brData = branchToShow.get(element.getDestinationBranchId());
									destinationModel.setDestinationBranchName(brData.getName());

									if(element.getWayBillTypeId() == WayBillType.WAYBILL_TYPE_PAID){
										if(element.getVehicleTypeId() == VehicleType.VEHICLE_TYPE_BUS_ID)
											destinationModel.setPaidBusTotalAmount(wbTotalAmt);
										else
											destinationModel.setPaidTruckTotalAmount(wbTotalAmt);

										destinationModel.setPaidTotalAmount(wbTotalAmt);
									}else if(element.getWayBillTypeId() == WayBillType.WAYBILL_TYPE_TO_PAY){
										if(element.getVehicleTypeId() == VehicleType.VEHICLE_TYPE_BUS_ID)
											destinationModel.setTopayBusTotalAmount(wbTotalAmt);
										else
											destinationModel.setTopayTruckTotalAmount(wbTotalAmt);

										destinationModel.setTopayTotalAmount(wbTotalAmt);
									}else if(element.getWayBillTypeId() == WayBillType.WAYBILL_TYPE_CREDIT){
										if(element.getVehicleTypeId() == VehicleType.VEHICLE_TYPE_BUS_ID)
											destinationModel.setCreditBusTotalAmount(wbTotalAmt);
										else
											destinationModel.setCreditTruckTotalAmount(wbTotalAmt);

										destinationModel.setCreditTotalAmount(wbTotalAmt);
									}

									double commAoumnt = element.getBookingCommission();

									if(commAoumnt == 0)
										commAoumnt = wbTotalAmt * VehicleType.VEHICLE_TYPE_BUS_COMM / 100;

									if(cancelAmt)
										commAoumnt = -commAoumnt;

									if(element.getVehicleTypeId() == VehicleType.VEHICLE_TYPE_BUS_ID) {
										destinationModel.setTotalBusCommAmount(commAoumnt);
										destinationModel.setTotalBusAmount(wbTotalAmt);
									} else {
										destinationModel.setTotalTruckCommAmount(commAoumnt);
										destinationModel.setTotalTruckAmount(wbTotalAmt);
									}

									destinationModel.setTotalCommAmount(commAoumnt);
									destinationModel.setTotalAmount(destinationModel.getPaidTotalAmount() + destinationModel.getTopayTotalAmount() + destinationModel.getCreditTotalAmount());
									destinationModel.setTotalDoorDlvryAmount(element.getDoorDlyAmount());
									reportCollection.put(element.getDestinationBranchId(),destinationModel);
								}
						}

						if(reportCollection != null){
							reportData = new RegionWiseCollectionModel[reportCollection.size()];
							itr = reportCollection.keySet().iterator();
							int i = 0;

							while(itr.hasNext()) {
								final long key = Long.parseLong(itr.next().toString());
								reportData[i] = reportCollection.get(key);
								i++;
							}
						}

						request.setAttribute("report",reportData);
					} else {
						error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
						error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
						request.setAttribute("cargoError", error);
					}
				} else {
					error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
					error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
					request.setAttribute("cargoError", error);
				}
			} else {
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}

			ActionStaticUtil.setReportViewModel(request);
			request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		} finally {
			error 				= null;
			executive      		= null;
			sdf            		= null;
			fromDate       		= null;
			toDate         		= null;
			cache 				= null;
			outValObj			= null;
			wayBillIdsArr		= null;
			wayBillCharges		= null;
			srcBranches			= null;
			itr					= null;
			branchIds			= null;
			brData				= null;
			branchToShow		= null;
			wayBillDeatailsModel= null;
			branches			= null;
			rptModel			= null;
			destinationModel	= null;
			reportData			= null;
			wayBillDetails		= null;
			reportCollection	= null;
			cancelledWayBillIds = null;
			vehicleTypeIds		= null;
		}
	}
}