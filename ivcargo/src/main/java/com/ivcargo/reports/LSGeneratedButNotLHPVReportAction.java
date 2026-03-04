package com.ivcargo.reports;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.StringJoiner;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.ObjectUtils;

import com.businesslogic.displaydata.DisplayDataConfigurationBll;
import com.businesslogic.properties.impl.PropertyConfigValueBLLImpl;
import com.framework.Action;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.dto.constant.FeildPermissionsConstant;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.DispatchSummaryDao;
import com.platform.dao.LSGeneratedButNotLHPVReportDao;
import com.platform.dao.WayBillDao;
import com.platform.dto.Branch;
import com.platform.dto.ExecutiveFeildPermissionDTO;
import com.platform.dto.LSBookingRegisterReport;
import com.platform.dto.PropertiesFileConstants;
import com.platform.dto.SubRegion;
import com.platform.dto.WayBill;
import com.platform.dto.configuration.mindateselection.ReportWiseMinDateSelectionConfigurationDTO;
import com.platform.dto.configuration.report.LoadingSheetWithoutLHPVReportConfigurationDTO;
import com.platform.dto.constant.ExecutiveTypeConstant;
import com.platform.dto.constant.ReportWiseDisplayZeroAmountConstant;
import com.platform.dto.model.LHPVCompanyDetails;
import com.platform.resource.CargoErrorList;
import com.platform.utils.Utility;

public class LSGeneratedButNotLHPVReportAction implements Action {

	@Override
	@SuppressWarnings("unchecked")
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	 			error 						= null;
		LSBookingRegisterReport[] 			reports 					= null;
		CacheManip 							cManip 						= null;
		ValueObject                       	outValueObject      		= null;
		ValueObject                      	valueObject         		= null;
		String 								branchIds					= null;
		SubRegion							subregion					= null;
		Branch								branch						= null;
		HashMap<Long, ArrayList<Long>>		dispatchLedgerHM			= null;
		ArrayList<Long>						waybillIdList				= null;
		Long[]								waybillIdArr				= null;
		Long[]								dispatchLedgerIdArray		= null;
		String								waybillIds					= null;
		String								dispatchIds					= null;
		HashMap<Long, WayBill>				wayBillHM					= null;
		WayBill								waybill						= null;
		Timestamp							minDateTimeStamp			= null;
		ValueObject							reportConfig				= null;
		var								grandTotal					= 0.00;
		var 								srcBranchId					= 0L;
		ValueObject							displayDataReportConfig		= null;
		var								isAmountZeroForLSWithoutLhpvReport		= false;
		ValueObject							displayDataConfig			= null;
		ValueObject							valueObjectIn				= null;
		var								isShowAmountZero			= false;
		HashMap<Long, ExecutiveFeildPermissionDTO>		execFldPermissionsHM				= null;
		short								hoursToShowLS				= 0;
		short								filter      				= 1;
		var                             showCrossingAgentLS         = false;
		StringJoiner						whereClause					= null;
		String 								fromDate					= null;
		String 								toDate 						= null;


		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error))
				return;
			new InitializeLSGeneratedButNotLHPVReportAction().execute(request, response);

			cManip 							= new CacheManip(request);
			final var executive				= cManip.getExecutive(request);
			reportConfig					= ReadAllConfigurationsBllImpl.getInstance().getOldReportConfigurationData(ReportIdentifierConstant.LS_GENERATED_BUT_NOT_LHPV, executive.getAccountGroupId());
			displayDataReportConfig			= PropertyConfigValueBLLImpl.getInstance().getConfiguration(executive, PropertiesFileConstants.REPORT_WISE_DISPLAY_ZERO_AMOUNT_CONSTANT);
			isAmountZeroForLSWithoutLhpvReport	= displayDataReportConfig.getBoolean(ReportWiseDisplayZeroAmountConstant.LS_WITHOUT_LHPV_REPORT, false);
			displayDataConfig				= cManip.getDisplayDataConfiguration(request, executive.getAccountGroupId());
			valueObjectIn					= new ValueObject();
			execFldPermissionsHM 			= cManip.getExecutiveFieldPermission(request);
			final var accountGroupId 			= executive.getAccountGroupId();

			minDateTimeStamp	= cManip.getReportWiseMinDateToGetData(request, accountGroupId,
					ReportWiseMinDateSelectionConfigurationDTO.LOADING_SHEET_WITHOUT_LHPV_REPORT_MIN_DATE_ALLOW,
					ReportWiseMinDateSelectionConfigurationDTO.LOADING_SHEET_WITHOUT_LHPV_REPORT_MIN_DATE);

			ActionStaticUtil.executiveTypeWiseBranches(request, cManip, executive);

			branchIds		= ActionStaticUtil.getPhysicalBranchIds(request, cManip, executive);

			if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN || executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_REGIONADMIN || executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_SUBREGIONADMIN)
				srcBranchId = Long.parseLong(request.getParameter("branch"));
			else
				srcBranchId = executive.getBranchId();

			ActionStaticUtil.setRequestAttribute(request,"customAddressBranchId", srcBranchId);
			ActionStaticUtil.setRequestAttribute(request,"customAddressIdentifer", LHPVCompanyDetails.IDENTIFIER_BOOKING);
			request.setAttribute("agentName", executive.getName());

			hoursToShowLS       = reportConfig.getShort(LoadingSheetWithoutLHPVReportConfigurationDTO.HOURS_TO_SHOW_LS_AFTER_LS_CREATION);
			showCrossingAgentLS = reportConfig.getBoolean(LoadingSheetWithoutLHPVReportConfigurationDTO.SHOW_CROSSING_AGENT_LS);

			final var isSearchDataForOwnBranchOnly       	= reportConfig.getBoolean(LoadingSheetWithoutLHPVReportConfigurationDTO.IS_SEARCH_DATA_FOR_OWN_BRANCH_ONLY);
			final var customErrorOnOtherBranchDetailSearch  = reportConfig.getBoolean(LoadingSheetWithoutLHPVReportConfigurationDTO.CUSTOM_ERROR_ON_OTHER_BRANCH_DETAIL_SEARCH);
			final var deliveryLocationList					= cManip.getAssignedLocationsIdListByLocationIdId(request, executive.getBranchId(), executive.getAccountGroupId());
			final var isAllowToSearchAllBranchReportData	= execFldPermissionsHM != null && execFldPermissionsHM.containsKey(FeildPermissionsConstant.ALLOW_TO_SEARCH_ALL_BRANCH_REPORT_DATA);

			if(!showCrossingAgentLS)
				filter      				= 2;

			fromDate = request.getParameter("fromDate");
			toDate = request.getParameter("toDate");

			whereClause = new StringJoiner(" ");

			whereClause.add(" dl.AccountGroupId  = "+accountGroupId);
			whereClause.add(" AND dl.SourceBranchId  IN("+branchIds+")");
			whereClause.add(" AND dl.LHPVId = 0");
			whereClause.add(" AND dl.LHPVNumber IS NULL");
			whereClause.add(" AND dl.TypeOfLS = 1");
			whereClause.add(" AND dl.Status <> 2");

			if(minDateTimeStamp != null) {
				whereClause.add(" AND dl.TripDateTime		>= '"+minDateTimeStamp+"'");

				if(hoursToShowLS > 0)
					whereClause.add(" AND DATEDIFF(HH,dl.TripDateTime,CURRENT_TIMESTAMP) >= +cast("+hoursToShowLS+" AS VARCHAR)");
			}

			if(filter == 2)
				whereClause.add(" AND dl.CrossingAgentId 	= 0");

			if(!reportConfig.getBoolean(LoadingSheetWithoutLHPVReportConfigurationDTO.SHOW_CROSSING_LS) && filter == 1 )
				whereClause.add(" AND dl.IsCrossing 		= 0");

			if(request.getParameter("searchByDate") != null) {
				whereClause.add(" AND dl.TripDateTime >= '"+DateTimeUtility.getTimeStamp(fromDate)+"'");
				whereClause.add(" AND dl.TripDateTime <= '"+DateTimeUtility.getEndOfDayTimeStamp(toDate)+"'");
			}

			outValueObject = LSGeneratedButNotLHPVReportDao.getInstance().getLSDataByWhereClause(whereClause.toString());

			if(outValueObject != null){

				reports 				= (LSBookingRegisterReport[])outValueObject.get("reportArr");
				dispatchLedgerIdArray	= (Long[])outValueObject.get("dispatchLedgerIdArray");

				if(ObjectUtils.isNotEmpty(reports) && isSearchDataForOwnBranchOnly && !isAllowToSearchAllBranchReportData){
					reports = Arrays.stream(reports).filter(report -> executive.getBranchId() == report.getSourceBranchId()
							|| executive.getBranchId() == report.getDestinationBranchId()
							|| (deliveryLocationList != null && (deliveryLocationList.contains(report.getSourceBranchId())
							|| deliveryLocationList.contains(report.getDestinationBranchId())))).toArray(LSBookingRegisterReport[]::new);
				}
				
				if(ObjectUtils.isNotEmpty(reports)) {
					dispatchIds	  = Utility.GetLongArrayToString(dispatchLedgerIdArray);
					valueObject	  = DispatchSummaryDao.getInstance().getDispatchSummaryByDispatchLedgerIds(dispatchIds);

					dispatchLedgerHM  	= (HashMap<Long, ArrayList<Long>>) valueObject.get("dispachLedgerWithWaybillids");
					waybillIdList 		= (ArrayList<Long>) valueObject.get("waybillIdsForCreatingString");

					waybillIdArr = new Long[waybillIdList.size()];
					waybillIdList.toArray(waybillIdArr);

					waybillIds	 = Utility.GetLongArrayToString(waybillIdArr);
					wayBillHM    = WayBillDao.getInstance().getLimitedLRDetails(waybillIds);

					for (final LSBookingRegisterReport report : reports) {

						branch = cManip.getGenericBranchDetailCache(request,report.getSourceBranchId());
						report.setSourceBranch(branch.getName());
						report.setSourceSubRegionId(branch.getSubRegionId());

						branch = cManip.getGenericBranchDetailCache(request,report.getDestinationBranchId());
						report.setDestinationBranch(branch.getName());
						report.setDestinationSubRegionId(branch.getSubRegionId());

						subregion	=	cManip.getGenericSubRegionById(request, branch.getSubRegionId());

						if(subregion != null)
							report.setSubRegionName(subregion.getName());
						else
							report.setSubRegionName("-----");

						waybillIdList = null;
						waybillIdList = dispatchLedgerHM.get(report.getDispatchLedgerId());

						valueObjectIn.put("executive", executive);
						valueObjectIn.put("execFldPermissionsHM", execFldPermissionsHM);

						if(waybillIdList != null)
							for (final Long element : waybillIdList) {

								waybill 	= wayBillHM.get(element);

								if(isAmountZeroForLSWithoutLhpvReport){

									valueObjectIn.put("wayBillTypeId", waybill.getWayBillTypeId());

									isShowAmountZero = DisplayDataConfigurationBll.isAllowToDisplayZeroAmount(displayDataConfig, valueObjectIn);
								}

								if(isShowAmountZero)
									grandTotal = 0;
								else if(waybill != null)
									grandTotal  = waybill.getBookingTotal();

								report.setFreightTotal(report.getFreightTotal() + grandTotal);
							}
					}

					request.setAttribute("report", reports);
				} else if(customErrorOnOtherBranchDetailSearch){
					error.put("errorCode", CargoErrorList.OTHER_BRANCH_REPORT_DATA_SEARCH_ERROR);
					if(srcBranchId > 0)
						error.put("errorDescription", "Kindly Contact Source Branch For Report");
					else
						error.put("errorDescription", "Kindly Contact Respective Branches For Report");

					request.setAttribute("cargoError", error);
				}else {
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
		} catch (final Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		} finally {
			error 						= null;
			reports 					= null;
			cManip 						= null;
			outValueObject      		= null;
			valueObject         		= null;
			branchIds					= null;
			subregion					= null;
			branch						= null;
			dispatchLedgerHM			= null;
			waybillIdList				= null;
			waybillIdArr				= null;
			dispatchLedgerIdArray		= null;
			waybillIds					= null;
			dispatchIds					= null;
			wayBillHM					= null;
			waybill						= null;
			minDateTimeStamp			= null;
			reportConfig				= null;
		}
	}
}
