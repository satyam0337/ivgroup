package com.ivcargo.reports;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.ObjectUtils;

import com.businesslogic.displaydata.DisplayDataConfigurationBll;
import com.businesslogic.properties.impl.PropertyConfigValueBLLImpl;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.dto.constant.FeildPermissionsConstant;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.dto.constant.WayBillTypeConstant;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.constant.DateTimeFormatConstant;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.utility.CollectionUtility;
import com.iv.utils.utility.ListFilterUtility;
import com.iv.utils.utility.Utility;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.ConsignmentDetailsDao;
import com.platform.dao.reports.BookButNotDispatchDao;
import com.platform.dto.ConsignmentDetails;
import com.platform.dto.Executive;
import com.platform.dto.ExecutiveFeildPermissionDTO;
import com.platform.dto.PropertiesFileConstants;
import com.platform.dto.configuration.mindateselection.ReportWiseMinDateSelectionConfigurationDTO;
import com.platform.dto.configuration.report.dispatch.BookButNotDispatchReportConfigurationDTO;
import com.platform.dto.constant.ExecutiveTypeConstant;
import com.platform.dto.constant.ReportWiseDisplayZeroAmountConstant;
import com.platform.dto.model.BookButNotDispatchModel;
import com.platform.dto.model.LHPVCompanyDetails;
import com.platform.resource.CargoErrorList;

public class BookButNotDispatchReportAction implements Action {

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	 			error 			= null;
		List<BookButNotDispatchModel>		reportModel 	= null;
		var 								branchId		= 0L;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request, error))
				return;

			new InitializeBookButNotDispatchReportAction().execute(request, response);

			final var	cacheManip  = new CacheManip(request);
			final var	executive   			= cacheManip.getExecutive(request);
			final Map<Long, ExecutiveFeildPermissionDTO>	execFldPermissionsHM 	= cacheManip.getExecutiveFieldPermission(request);

			final var	minDateTimeStamp	= cacheManip.getReportWiseMinDateToGetData(request, executive.getAccountGroupId(),
					ReportWiseMinDateSelectionConfigurationDTO.BOOK_BUT_NOT_DISPATCH_REPORT_MIN_DATEALLOW,
					ReportWiseMinDateSelectionConfigurationDTO.BOOK_BUT_NOT_DISPATCH_REPORT_MIN_DATE);

			final var	bookedButNotDispatchConfig		= ReadAllConfigurationsBllImpl.getInstance().getOldReportConfigurationData(ReportIdentifierConstant.BOOK_BUT_NOT_DISPATCH, executive.getAccountGroupId());
			final var	configuration					= PropertyConfigValueBLLImpl.getInstance().getConfiguration(executive, PropertiesFileConstants.REPORT_WISE_DISPLAY_ZERO_AMOUNT_CONSTANT);
			final var	isBookButNotDispatch			= configuration.getBoolean(ReportWiseDisplayZeroAmountConstant.BOOK_BUT_NOT_DISPATCH_REPORT, false);
			final var	showTotalAmount					= bookedButNotDispatchConfig.getBoolean(BookButNotDispatchReportConfigurationDTO.SHOW_TOTAL_AMOUNT, false);
			final var	showOnlyFreightAmount			= bookedButNotDispatchConfig.getBoolean(BookButNotDispatchReportConfigurationDTO.SHOW_ONLY_FRIEGHT_AMOUNT, false);
			final var	displayDataConfig				= cacheManip.getDisplayDataConfiguration(request, executive.getAccountGroupId());
			final var	valueObjectIn					= new ValueObject();

			final var  filter		= 0;

			final var	isSearchDataForOwnBranchOnly			= bookedButNotDispatchConfig.getBoolean(BookButNotDispatchReportConfigurationDTO.IS_SEARCH_DATA_FOR_OWN_BRANCH_ONLY, false);
			final var	customErrorOnOtherBranchDetailSearch	= bookedButNotDispatchConfig.getBoolean(BookButNotDispatchReportConfigurationDTO.CUSTOM_ERROR_ON_OTHER_BRANCH_DETAIL_SEARCH, false);
			final var 	isAllowToSearchAllBranchReportData		= execFldPermissionsHM != null && execFldPermissionsHM.containsKey(FeildPermissionsConstant.ALLOW_TO_SEARCH_ALL_BRANCH_REPORT_DATA);
			final var 	locationMappingList    					= cacheManip.getAssignedLocationsIdListByLocationIdId(request, executive.getBranchId(), executive.getAccountGroupId());

			ActionStaticUtil.executiveTypeWiseBranches(request, cacheManip, executive);

			if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN || executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_REGIONADMIN || executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_SUBREGIONADMIN)
				branchId = JSPUtility.GetLong(request, "branch", 0);
			else
				branchId = executive.getBranchId();

			final List<Long>	assignedLocationIdList = cacheManip.getAssignedLocationsIdListByLocationIdId(request, branchId, executive.getAccountGroupId());

			if(!assignedLocationIdList.contains(branchId))
				assignedLocationIdList.add(branchId);

			final var	branchIds = CollectionUtility.getStringFromLongList(assignedLocationIdList);

			request.setAttribute("agentName", executive.getName());
			ActionStaticUtil.setRequestAttribute(request,"customAddressBranchId", branchId);
			ActionStaticUtil.setRequestAttribute(request,"customAddressIdentifer", LHPVCompanyDetails.IDENTIFIER_BOOKING);

			if(minDateTimeStamp != null)
				reportModel = BookButNotDispatchDao.getInstance().getBookButNotDispatchDetailsFromMinDate(filter, executive.getAccountGroupId(), branchIds, minDateTimeStamp);
			else
				reportModel = BookButNotDispatchDao.getInstance().getBookButNotDispatchDetails(filter, executive.getAccountGroupId(), branchIds);

			if(reportModel != null && !reportModel.isEmpty()) {
				if(isSearchDataForOwnBranchOnly && !isAllowToSearchAllBranchReportData)
					reportModel	= ListFilterUtility.filterList(reportModel, element -> executive.getBranchId() == element.getSourceBranchId()
					|| executive.getBranchId() == element.getDestinationBranchId() || locationMappingList != null && (locationMappingList.contains(element.getSourceBranchId()) || locationMappingList.contains(element.getDestinationBranchId())));

				if(!ObjectUtils.isEmpty(reportModel)){
					final var wayBillIds	= reportModel.stream().map(e -> Long.toString(e.getWayBillId())).collect(Collectors.joining(","));
					final Map<Long, ArrayList<ConsignmentDetails>>	consDetailsCol	= ConsignmentDetailsDao.getInstance().getLimitedConsignmentDetailsByWayBillIds(wayBillIds);

					valueObjectIn.put(Executive.EXECUTIVE, executive);
					valueObjectIn.put("execFldPermissionsHM", execFldPermissionsHM);

					for (final BookButNotDispatchModel element : reportModel) {
						if(!showTotalAmount && !showOnlyFreightAmount)
							element.setFreightAmount(element.getGrandTotal());

						if(isBookButNotDispatch) {
							valueObjectIn.put("wayBillTypeId", element.getWayBillTypeId());

							final var	isShowAmountZero = DisplayDataConfigurationBll.isAllowToDisplayZeroAmount(displayDataConfig, valueObjectIn);

							if(isShowAmountZero)
								element.setGrandTotal(0);
						}

						final List<ConsignmentDetails>	consignmentList = consDetailsCol.get(element.getWayBillId());

						element.setPackages(consignmentList.stream().map(ConsignmentDetails::getPackingTypeName).collect(Collectors.joining(" / ")));
						element.setSaidToContain(consignmentList.stream().filter(e -> e.getSaidToContain() != null).map(ConsignmentDetails::getSaidToContain).collect(Collectors.joining(" / ")));

						element.setWayBillType(WayBillTypeConstant.getWayBillTypeNameByWayBilTypeId(element.getWayBillTypeId()));

						if(element.getDestinationSubRegionId() > 0)
							element.setDestinationSubRegion(cacheManip.getGenericSubRegionById(request, element.getDestinationSubRegionId()).getName());
						else
							element.setDestinationSubRegion("");

						if(element.getDestinationSubRegionId() > 0 && element.getDestinationBranchId() > 0)
							element.setDestinationBranch(cacheManip.getGenericBranchDetailCache(request, element.getDestinationBranchId()).getName());

						element.setWayBillRemark(Utility.checkedNullCondition(element.getWayBillRemark(), (short) 1));
						element.setBookedDateStr(DateTimeUtility.getDateFromTimeStamp(element.getBookedDate(), DateTimeFormatConstant.DD_MM_YY));
					}

					request.setAttribute("BookButNotDispatchModel", reportModel);
					request.setAttribute("showFreightAmount", showTotalAmount);
				} else {
					if(customErrorOnOtherBranchDetailSearch){
						error.put("errorCode", CargoErrorList.OTHER_BRANCH_REPORT_DATA_SEARCH_ERROR);
						if(branchId > 0)
							error.put("errorDescription", "Kindly Contact Source Branch For Report");
						else
							error.put("errorDescription", "Kindly Contact Respective Branches For Report");
					}else{
						error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
						error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
					}
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
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}
}