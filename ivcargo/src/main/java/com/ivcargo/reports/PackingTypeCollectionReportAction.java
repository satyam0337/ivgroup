package com.ivcargo.reports;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.businesslogic.displaydata.DisplayDataConfigurationBll;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.CustomerDetailsDao;
import com.platform.dao.reports.PackingTypeCollectionDAO;
import com.platform.dao.reports.WayBillDetailsDAO;
import com.platform.dto.AliasNameConstants;
import com.platform.dto.Branch;
import com.platform.dto.ChargeTypeMaster;
import com.platform.dto.ConsignmentDetails;
import com.platform.dto.CustomerDetails;
import com.platform.dto.Executive;
import com.platform.dto.TransportCommonMaster;
import com.platform.dto.WayBillCharges;
import com.platform.dto.WayBillTaxTxn;
import com.platform.dto.configuration.master.DisplayDataConfigurationDTO;
import com.platform.dto.configuration.report.collection.PackingTypeCollectionReportConfigurationDTO;
import com.platform.dto.model.PackingTypeCollectionReportModel;
import com.platform.dto.model.WayBillDeatailsModel;
import com.platform.resource.CargoErrorList;
import com.platform.utils.PropertiesUtility;
import com.platform.utils.Utility;

public class PackingTypeCollectionReportAction implements Action {

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {

		HashMap<String,Object>				error 					= null;
		Executive   						executive 				= null;
		SimpleDateFormat 					sdf         			= null;
		Timestamp        					fromDate    			= null;
		Timestamp        					toDate      			= null;
		ValueObject 						objectIn 				= null;
		ValueObject 						objectOut 				= null;
		Branch[]							branches				= null;
		CacheManip							cacheManip				= null;
		Long[]								wayBillIdArray			= null;
		WayBillCharges[]					wayBillCharges			= null;
		StringBuffer						branchesString			= null;
		StringBuffer						destBranchesString		= null;
		String								wbStr					= null;
		ConsignmentDetails[]				pkgDetails				= null;
		HashMap<Long, CustomerDetails>		consignorHM				= null;
		HashMap<Long, CustomerDetails>		consigneeHM				= null;
		PackingTypeCollectionReportModel[]	reportModel				= null;
		PackingTypeCollectionReportModel[]	reportModelForResponse	= null;
		HashMap<Long, WayBillDeatailsModel>	wayBillDetails			= null;
		ValueObject							displayDataConfig		= null;
		ValueObject							valueObjectIn			= null;
		Timestamp							createDate				= null;
		ArrayList<PackingTypeCollectionReportModel>	reportModelForUI			= null;
		var								isDonotShowWayBillTypeWiseData		= false;
		ValueObject							configuration						= null;
		var								displayDestinationBranchWiseData	= false;
		var packingTypeId	= 0L;
		var selectedSubRegion	= 0L;
		var selectedBranch	= 0L;
		var selectedDestinationSubRegion	= 0L;
		var selectedDestinationBranch		= 0L;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializePackingTypeCollectionReportAction().execute(request, response);

			executive 		= (Executive) request.getSession().getAttribute("executive");
			sdf         	= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			fromDate   		= new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00").getTime());
			toDate      	= new Timestamp(sdf.parse(JSPUtility.GetString(request, "toDate") + " 23:59:59").getTime());
			objectIn 		= new ValueObject();
			objectOut 		= new ValueObject();
			packingTypeId	= JSPUtility.GetLong(request, "packingTypeId",0);
			cacheManip		= new CacheManip(request);
			branchesString	= new StringBuffer();
			destBranchesString	= new StringBuffer();
			createDate 		= DateTimeUtility.getCurrentTimeStamp();

			configuration 						= ReadAllConfigurationsBllImpl.getInstance().getOldReportConfigurationData(ReportIdentifierConstant.PACKING_TYPE_COLLECTION_REPORT, executive.getAccountGroupId());
			displayDestinationBranchWiseData 	= PropertiesUtility.isAllow(configuration.getString(PackingTypeCollectionReportConfigurationDTO.DISPLAY_DESTINATION_BRANCH_WISE_DATA, "false"));
			objectIn.put(PackingTypeCollectionReportConfigurationDTO.DISPLAY_DESTINATION_BRANCH_WISE_DATA, displayDestinationBranchWiseData);

			if (request.getParameter("subRegion")!=null){
				selectedSubRegion  =JSPUtility.GetLong(request, "subRegion");
				objectIn.put("subRegion", selectedSubRegion);
			}

			if (request.getParameter("branch")!=null){
				selectedBranch  =  JSPUtility.GetLong(request, "branch");
				objectIn.put("selectedBranch", selectedBranch);
			}

			if(request.getParameter("TosubRegion") != null){
				selectedDestinationSubRegion = JSPUtility.GetLong(request, "TosubRegion");
				objectIn.put("selectedDestinationSubRegion", selectedDestinationSubRegion);
			}

			if(request.getParameter("SelectDestBranch") != null){
				selectedDestinationBranch = JSPUtility.GetLong(request, "SelectDestBranch");
				objectIn.put("selectedDestinationBranch", selectedDestinationBranch);
			}

			if(executive.getExecutiveType()==Executive.EXECUTIVE_TYPE_GROUPADMIN) {
				if(selectedBranch == 0)
					branchesString.append(cacheManip.getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_SUBREGION, selectedSubRegion));
				else
					branchesString.append(Long.toString(selectedBranch));

				if(displayDestinationBranchWiseData)
					if(selectedDestinationBranch == 0)
						destBranchesString.append(cacheManip.getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_SUBREGION, selectedDestinationSubRegion));
					else
						destBranchesString.append(Long.toString(selectedDestinationBranch));
			}  else if(executive.getExecutiveType()==Executive.EXECUTIVE_TYPE_BRANCHADMIN
					|| executive.getExecutiveType()==Executive.EXECUTIVE_TYPE_EXECUTIVE
					|| executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_LIMITED) {
				branchesString.append(Long.toString(executive.getBranchId()));
				destBranchesString.append(Long.toString(executive.getBranchId()));
			}

			//Get all Branches
			branches = cacheManip.getBranchesArrayBySubRegionId(request,executive.getAccountGroupId(),selectedSubRegion);
			request.setAttribute("branches", branches);

			objectIn.put("branchesString", branchesString);
			objectIn.put("destBranchesString", destBranchesString);
			objectIn.put("fromDate", fromDate);
			objectIn.put("toDate", toDate);
			objectIn.put("executive", executive);
			objectIn.put("packingTypeId", packingTypeId);

			objectOut = PackingTypeCollectionDAO.getInstance().getPackingTypeCollectionReport(objectIn);

			if(objectOut != null) {
				reportModelForUI	= new ArrayList<>();
				reportModel 	= (PackingTypeCollectionReportModel[])objectOut.get("PackingTypeCollectionReportModel");
				wayBillIdArray 	= (Long[]) objectOut.get("WayBillIdArray");

				if(reportModel != null && wayBillIdArray != null) {

					wayBillDetails	= WayBillDetailsDAO.getInstance().getWayBillDetails(wayBillIdArray ,true ,ChargeTypeMaster.WAYBILL_CHARGETYPE_BOOKING ,true ,WayBillTaxTxn.WAYBILL_TAX_TXN_TYPE_BOOKING ,true);

					wbStr			= Utility.GetLongArrayToString(wayBillIdArray);
					consignorHM		= CustomerDetailsDao.getInstance().getConsignorDetailsByWayBillId(wbStr);
					consigneeHM		= CustomerDetailsDao.getInstance().getConsigneeDetailsByWayBillId(wbStr);

					displayDataConfig						= cacheManip.getDisplayDataConfiguration(request, executive.getAccountGroupId());
					isDonotShowWayBillTypeWiseData			= PropertiesUtility.isAllow(displayDataConfig.getString(DisplayDataConfigurationDTO.IS_DONOT_SHOW_WAY_BILL_TYPE_WISE_DATA_IN_REPORTS, "false"));
					valueObjectIn							= new ValueObject();

					for (final PackingTypeCollectionReportModel element : reportModel) {

						if (isDonotShowWayBillTypeWiseData) {
							valueObjectIn.put(AliasNameConstants.CURRENT_DATE_TIMESTAMP, createDate);
							valueObjectIn.put(AliasNameConstants.WAYBILL_TYPE_ID, element.getWayBillTypeId());
							valueObjectIn.put(AliasNameConstants.SOURCE_BRANCH_ID, element.getSourceBranchId());
							valueObjectIn.put(AliasNameConstants.DATE_TIMESTAMP, element.getBookingDateTime());
							valueObjectIn.put(AliasNameConstants.EXECUTIVE_ID, executive.getExecutiveId());
							valueObjectIn.put(AliasNameConstants.WAYBILL_STATUS_ID, element.getWayBillStatus());
							valueObjectIn.put(AliasNameConstants.IS_SHOW_WAYBILL, element.isShowWayBill());
							if(DisplayDataConfigurationBll.getInstance().isDisplayWayBillTypeWiseData(displayDataConfig, valueObjectIn))
								continue;
						}

						element.setDestinationSubRegion(cacheManip.getGenericSubRegionById(request, element.getDestinationSubregionId()).getName());
						//reportModel[i].setDestBranch(cacheManip.getBranchById(request, executive.getAccountGroupId(), reportModel[i].getDestinationBranchId()).getName());
						element.setDestBranch(cacheManip.getGenericBranchDetailCache(request, element.getDestinationBranchId()).getName());
						//reportModel[i].setSourceBranch(cacheManip.getBranchById(request, executive.getAccountGroupId(), reportModel[i].getSourceBranchId()).getName());
						element.setSourceBranch(cacheManip.getGenericBranchDetailCache(request, element.getSourceBranchId()).getName());
						element.setConsignorName(consignorHM.get(element.getWayBillId()).getName());
						element.setConsigneeName(consigneeHM.get(element.getWayBillId()).getName());
						element.setWayBillType(cacheManip.getWayBillTypeById(request,element.getWayBillTypeId()).getWayBillType());

						var totalPkgs = 0L;
						var totalFreightCharges = 0D;

						wayBillCharges = wayBillDetails.get(element.getWayBillId()).getWayBillCharges();
						pkgDetails=wayBillDetails.get(element.getWayBillId()).getConsignmentDetails();

						for (final ConsignmentDetails pkgDetail : pkgDetails)
							totalPkgs += pkgDetail.getQuantity();

						for (final WayBillCharges wayBillCharge : wayBillCharges) {
							if(wayBillCharge.getWayBillChargeMasterId()==ChargeTypeMaster.FREIGHT)
								totalFreightCharges += wayBillCharge.getChargeAmount();

							if(wayBillCharge.getWayBillChargeMasterId()==ChargeTypeMaster.INSURANCE)
								element.setInsuranceAmount(wayBillCharge.getChargeAmount()/totalPkgs*element.getNoOfPackages());
						}

						final var unDeliveredAmount = element.getGrandTotal()-(element.getDeliveryAmount()-element.getDeliveryDiscount());
						final var nonFreightAmount  = (unDeliveredAmount-totalFreightCharges) /totalPkgs*element.getNoOfPackages();
						element.setPkgAmount(element.getPkgAmount()+nonFreightAmount);
						reportModelForUI.add(element);
					}

					reportModelForResponse	= new PackingTypeCollectionReportModel[reportModelForUI.size()];
					reportModelForUI.toArray(reportModelForResponse);
					request.setAttribute("report",reportModelForResponse);

					ActionStaticUtil.setReportViewModel(request);
					request.setAttribute("nextPageToken", "success");
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
		} catch (final Exception _e) {
			ActionStaticUtil.catchActionException(request, _e, error);
		}
	}
}