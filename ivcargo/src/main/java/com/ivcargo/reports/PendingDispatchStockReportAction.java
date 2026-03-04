package com.ivcargo.reports;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.TimeZone;
import java.util.TreeMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringUtils;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.logsapp.LogWriter;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.ConsignmentSummaryDao;
import com.platform.dao.CustomerDetailsDao;
import com.platform.dao.reports.WayBillDetailsDAO;
import com.platform.dao.reports.WayBilllReportDao;
import com.platform.dto.AliasNameConstants;
import com.platform.dto.Branch;
import com.platform.dto.ConsignmentDetails;
import com.platform.dto.ConsignmentSummary;
import com.platform.dto.CustomerDetails;
import com.platform.dto.ECargoConstantFile;
import com.platform.dto.Executive;
import com.platform.dto.SubRegion;
import com.platform.dto.TransportCommonMaster;
import com.platform.dto.WayBill;
import com.platform.dto.WayBillTaxTxn;
import com.platform.dto.WayBillType;
import com.platform.dto.configuration.mindateselection.ReportWiseMinDateSelectionConfigurationDTO;
import com.platform.dto.configuration.report.dispatch.PendingDispatchReportConfigurationDTO;
import com.platform.dto.constant.ExecutiveTypeConstant;
import com.platform.dto.constant.WayBillTypeConstant;
import com.platform.dto.model.PendingStockReportModel;
import com.platform.dto.model.WayBillDeatailsModel;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

public class PendingDispatchStockReportAction implements Action {

	private static final String TRACE_ID = PendingDispatchStockReportAction.class.getName();

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		// TODO Auto-generated method stub
		HashMap<String,Object>	 				error 					                       = null;
		Executive								executive   			                       = null;
		Branch[]								branches  				                       = null;
		Branch									branch		 			                       = null;
		Branch									destbranches 			                       = null;
		ValueObject								outobj					                       = null;
		Long[]									wayBillIdArr			                       = null;
		String									wayBillIds				                       = null;
		CacheManip								cacheManip				                       = null;
		WayBillType								wayBillType				                       = null;
		SimpleDateFormat						dateFormatForTimeLog	                       = null;
		String									sourceBranchesStr		                       = null;
		String									destBranchesStr			                       = null;
		String									packageDetails			                       = null;
		ConsignmentDetails[]					consDetails				                       = null;
		PendingStockReportModel[]				reportModel				                       = null;
		PendingStockReportModel[]				sortedReportModel		                       = null;
		TreeMap<String,PendingStockReportModel>	reportModelTM			                       = null;
		HashMap<Long,CustomerDetails>			consignorHM				                       = null;
		HashMap<Long,CustomerDetails>			consigneeHM				                       = null;
		HashMap<Long,ConsignmentSummary>		conSumHM				                       = null;
		HashMap<Long, WayBillDeatailsModel>		wayBillDetails			                       = null;
		var										count					                       = 0;
		Timestamp								minDateTimeStamp						       = null;
		ValueObject								configuration							       = null;
		var									isPackageDetailsRequired				       = false;
		var									showEWayBillNumberColumn				       = false;
		ArrayList<PendingStockReportModel> 		pendingStockReportModelsListWithExpress		   = null;
		ArrayList<PendingStockReportModel> 		pendingStockReportModelsListWithoutExpress	   = null;
		PendingStockReportModel[] 				sortedPendingStockReportModelByDeliveryToId	   = null;
		String									sortDeliveryToId							   = null;
		var									sortByDeliveryToId							   = false;
		ValueObject						        subRegionForGroup 		                       = null;
		ValueObject						        branchesColl			                       = null;
		var									showReceiveNumber							   = true;
		var									showFreightAmount							   = false;
		var									showOnlyBoookedLR							   = false;
		var									showPrivateMark								   = false;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error))
				return;
			final var startTime = System.currentTimeMillis();
			new InitializePendingDispatchStockAction().execute(request, response);

			cacheManip	= new CacheManip(request);
			executive	= (Executive) request.getSession().getAttribute(AliasNameConstants.EXECUTIVE);
			final var sCity	= JSPUtility.GetLong(request, "subRegion",0) ;
			final var dCity	= JSPUtility.GetLong(request, "TosubRegion", 0);
			final var sBranch= JSPUtility.GetLong(request, "branch", 0);
			reportModelTM = new TreeMap<>();

			configuration					= ReadAllConfigurationsBllImpl.getInstance().getOldReportConfigurationData(ReportIdentifierConstant.PENDING_DISPATCH_STOCK, executive.getAccountGroupId());
			isPackageDetailsRequired		= configuration.getBoolean(PendingDispatchReportConfigurationDTO.IS_PACKAGE_DETAILS_REQUIRED, false);
			showEWayBillNumberColumn		= configuration.getBoolean(PendingDispatchReportConfigurationDTO.SHOW_E_WAY_BILL_NUMBER_COLUMN, false);
			sortDeliveryToId				= configuration.getString(PendingDispatchReportConfigurationDTO.SORT_DELIVERY_TO_ID);
			sortByDeliveryToId				= configuration.getBoolean(PendingDispatchReportConfigurationDTO.SORT_BY_DELIVERY_TO_ID, false);
			showReceiveNumber				= configuration.getBoolean(PendingDispatchReportConfigurationDTO.SHOW_RECEIVER_NUMBER, true);
			showFreightAmount				= configuration.getBoolean(PendingDispatchReportConfigurationDTO.SHOW_FREIGHT_AMOUNT, false);
			showOnlyBoookedLR				= configuration.getBoolean(PendingDispatchReportConfigurationDTO.SHOW_ONLY_BOOOKED_LR, false);
			showPrivateMark					= configuration.getBoolean(PendingDispatchReportConfigurationDTO.SHOW_PRIVATE_REMARK, false);
			
			minDateTimeStamp	= cacheManip.getReportWiseMinDateToGetData(request, executive.getAccountGroupId(),
					ReportWiseMinDateSelectionConfigurationDTO.PENDING_DISPATCH_STOCK_REPORT_MIN_DATE_ALLOW,
					ReportWiseMinDateSelectionConfigurationDTO.PENDING_DISPATCH_STOCK_REPORT_MIN_DATE);

			if(sCity == 0 && sBranch == 0)
				sourceBranchesStr = cacheManip.getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_GROUP, executive.getAccountGroupId());
			else if(sCity != 0 && sBranch == 0)
				sourceBranchesStr = cacheManip.getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_SUBREGION, sCity);
			else
				sourceBranchesStr = ""+sBranch;
			if(dCity == 0)
				destBranchesStr = cacheManip.getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_GROUP, executive.getAccountGroupId());
			else if (dCity == -1)
				destBranchesStr = null;
			else
				destBranchesStr = cacheManip.getBranchesStringById(request, executive.getAccountGroupId(), TransportCommonMaster.DATA_SUBREGION, dCity);

			if(StringUtils.isNotEmpty(sourceBranchesStr) && StringUtils.isNotEmpty(destBranchesStr))
				outobj = WayBilllReportDao.getInstance().getPendingDispatchStockDetails(executive.getAccountGroupId(), sourceBranchesStr, destBranchesStr, minDateTimeStamp);

			branches = cacheManip.getBranchesArrayBySubRegionId(request,executive.getAccountGroupId(),sCity);
			request.setAttribute("branches", branches);
			request.setAttribute("agentName", executive.getName());

			if (outobj == null) {
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			} else {
				outobj.put("citiesColl", cacheManip.getAllSubRegions(request));
				outobj.put("branchesColl", cacheManip.getGenericBranchesDetail(request));

				subRegionForGroup	= (ValueObject)outobj.get("citiesColl");
				branchesColl		= (ValueObject)outobj.get("branchesColl");
				//Get all Branches
				reportModel =(PendingStockReportModel[])outobj.get("reportModelArr");

				wayBillIdArr=(Long[])outobj.get("wayBillIdArr");
				wayBillIds  = Utility.GetLongArrayToString(wayBillIdArr);

				conSumHM		= ConsignmentSummaryDao.getInstance().getLimitedConsignmentDetails(wayBillIds);
				consignorHM		= CustomerDetailsDao.getInstance().getConsignorDetailsByWayBillId(wayBillIds);
				consigneeHM		= CustomerDetailsDao.getInstance().getConsigneeDetailsByWayBillId(wayBillIds);
				wayBillDetails	= WayBillDetailsDAO.getInstance().getWayBillDetails(wayBillIdArr, false, (short)0 ,false ,WayBillTaxTxn.WAYBILL_TAX_TXN_TYPE_BOOKING ,true);

				//only For Rishabh Travels ( Start )
				var rishabhCreditFlag = false;
				if(executive.getAccountGroupId() == ECargoConstantFile.ACCOUNTGORUPID_RISHABH_TRAVELS
						&& executive.getExecutiveType() != ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN)
					rishabhCreditFlag = true;

				for (final PendingStockReportModel element : reportModel) {

					if(showOnlyBoookedLR && element.getLrStatus() != WayBill.WAYBILL_STATUS_BOOKED)
						continue;

					element.setNoOfPackages(conSumHM.get(element.getWayBillId()).getQuantity());
					element.setConsignorName(consignorHM.get(element.getWayBillId()).getName());
					element.setConsigneeName(consigneeHM.get(element.getWayBillId()).getName());
					element.setConsigneePhone(consigneeHM.get(element.getWayBillId()).getPhoneNumber());
					element.setDeliveryToId(conSumHM.get(element.getWayBillId()).getDeliveryTo());
					if(element.getFormNumber() == null)
						element.setFormNumber(" -- ");

					if(showFreightAmount)
						element.setAmount(element.getFreightAmount());

					if(executive.getAccountGroupId() == ECargoConstantFile.ACCOUNTGROUPID_APCARGO || executive.getAccountGroupId() == ECargoConstantFile.ACCOUNTGORUPID_KALPANA_CARGO){
						consDetails		= wayBillDetails.get(element.getWayBillId()).getConsignmentDetails();
						packageDetails	= "";
						for (var j=0; j<consDetails.length; j++)
							if (j != consDetails.length-1)
								packageDetails += consDetails[j].getQuantity()+" "+consDetails[j].getPackingTypeName()+" / ";
							else
								packageDetails += consDetails[j].getQuantity()+" "+consDetails[j].getPackingTypeName();
						element.setPackageDetails(packageDetails);
					}

					if(rishabhCreditFlag && element.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT)
						element.setGrandTotal(0);
					branch 		 = (Branch)branchesColl.get(element.getWayBillSourceBranchId()+"");
					if(branch.getSubRegionId() > 0)
						element.setWayBillSourceSubRegion(((SubRegion)subRegionForGroup.get(branch.getSubRegionId())).getName());
					else
						element.setWayBillSourceSubRegion("--");
					destbranches = (Branch)branchesColl.get(element.getWayBillDestinationBranchId()+"");
					if(destbranches.getSubRegionId() > 0)
						element.setWayBillDestinationSubRegion(((SubRegion)subRegionForGroup.get(destbranches.getSubRegionId())).getName());
					else
						element.setWayBillDestinationSubRegion("--");
					element.setWayBillSourceBranch(cacheManip.getGenericBranchDetailCache(request, element.getWayBillSourceBranchId()).getName());
					element.setWayBillDestinationBranch(cacheManip.getGenericBranchDetailCache(request, element.getWayBillDestinationBranchId()).getName());

					wayBillType = cacheManip.getWayBillTypeById(request, element.getWayBillTypeId());
					if(element.isManual())
						element.setWayBillType(wayBillType.getWayBillType()+WayBillTypeConstant.WAYBILL_TYPE_MANUAL);
					else
						element.setWayBillType(wayBillType.getWayBillType());
					element.setNoOfDays(Utility.getDayDiffBetweenTwoDates(element.getBookedDate(),  new Timestamp(new Date().getTime())));

					reportModelTM.put(element.getWayBillNumber(), element);
				}
				if(reportModelTM.size() > 0){
					count = 0;
					sortedReportModel = new PendingStockReportModel[reportModelTM.size()];
					for(final String key : reportModelTM.keySet()){
						sortedReportModel[count] = reportModelTM.get(key);
						count++;
					}
				}
				pendingStockReportModelsListWithExpress			= new ArrayList<>();
				pendingStockReportModelsListWithoutExpress		= new ArrayList<>();
				if(sortByDeliveryToId){
					for (final PendingStockReportModel element : reportModel)
						if(conSumHM.get(element.getWayBillId()).getDeliveryTo() == Short.parseShort(sortDeliveryToId))
							pendingStockReportModelsListWithExpress.add(element);
						else
							pendingStockReportModelsListWithoutExpress.add(element);
					pendingStockReportModelsListWithExpress.addAll(pendingStockReportModelsListWithoutExpress);
					sortedPendingStockReportModelByDeliveryToId = new PendingStockReportModel[pendingStockReportModelsListWithExpress.size()] ;
					pendingStockReportModelsListWithExpress.toArray(sortedPendingStockReportModelByDeliveryToId);
				}
			}
			request.setAttribute("sortByDeliveryToId", sortByDeliveryToId);
			request.setAttribute("isPackageDetailsRequired", isPackageDetailsRequired);
			request.setAttribute("showEWayBillNumberColumn", showEWayBillNumberColumn);
			request.setAttribute("showReceiveNumber", showReceiveNumber);
			request.setAttribute("showPrivateMark", showPrivateMark);
			
			if(sortedPendingStockReportModelByDeliveryToId != null)
				request.setAttribute("PendingStockReportModel", sortedPendingStockReportModelByDeliveryToId);
			else
				request.setAttribute("PendingStockReportModel", sortedReportModel);
			ActionStaticUtil.setReportViewModel(request);
			request.setAttribute("nextPageToken", "success");

			dateFormatForTimeLog = new SimpleDateFormat("mm:ss");
			dateFormatForTimeLog.setTimeZone(TimeZone.getTimeZone("GMT"));
			LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO,"=====Report Generated PendingDispatchStockReport "+executive.getAccountGroupId()+" "+executive.getBranchId()+" "+executive.getExecutiveId()+" in "+dateFormatForTimeLog.format(new Date(System.currentTimeMillis()-startTime)));
		} catch (final Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		} finally {
			error 					= null;
			executive   			= null;
			branches  				= null;
			outobj					= null;
			wayBillIdArr			= null;
			wayBillIds				= null;
			cacheManip				= null;
			wayBillType				= null;
			dateFormatForTimeLog	= null;
			sourceBranchesStr		= null;
			destBranchesStr			= null;
			packageDetails			= null;
			consDetails				= null;
			reportModel				= null;
			sortedReportModel		= null;
			reportModelTM			= null;
			consignorHM				= null;
			consigneeHM				= null;
			conSumHM				= null;
			wayBillDetails			= null;
		}
	}
}
