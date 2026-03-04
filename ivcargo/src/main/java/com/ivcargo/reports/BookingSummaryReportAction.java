package com.ivcargo.reports;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.SortedMap;
import java.util.TreeMap;
import java.util.function.Function;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.ObjectUtils;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.bll.impl.ReadAllConfigurationsBllImpl;
import com.iv.dto.constant.BookingTypeConstant;
import com.iv.dto.constant.CorporateAccountConstant;
import com.iv.dto.constant.FeildPermissionsConstant;
import com.iv.dto.constant.ReportIdentifierConstant;
import com.iv.dto.constant.WayBillTypeConstant;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.exception.ExceptionProcess;
import com.iv.utils.utility.ListFilterUtility;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.CorporateAccountDao;
import com.platform.dao.reports.BookingSummaryReportDAO;
import com.platform.dto.Commodity;
import com.platform.dto.CorporateAccount;
import com.platform.dto.Executive;
import com.platform.dto.SubRegion;
import com.platform.dto.TransportCommonMaster;
import com.platform.dto.VehicleType;
import com.platform.dto.configuration.report.collection.BookingSummaryReportConfigurationDTO;
import com.platform.dto.model.BookingSummaryReport;
import com.platform.dto.model.BookingSummaryReportModel;
import com.platform.dto.model.LHPVCompanyDetails;
import com.platform.dto.model.ReportViewModel;
import com.platform.resource.CargoErrorList;

public class BookingSummaryReportAction implements Action {

	private static final String TRACE_ID = "BookingSummaryReportAction";

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		HashMap<String,Object>	 						error 				= null;
		SubRegion[]										subRegionForGroup	= null;
//		Executive										executive			= null;
		CacheManip										cManip				= null;
		ValueObject										valueInObject		= null;
		String											branchesIds			= null;
		ReportViewModel									reportViewModel		= null;
		SimpleDateFormat								sdf               	= null;
		Timestamp										fromDate			= null;
		Timestamp										toDate				= null;
		List<BookingSummaryReport>						reports				= null;
		BookingSummaryReportModel						report				= null;
		Commodity										commodity			= null;
		SortedMap<String, BookingSummaryReportModel>	dataColl			= null;
		String											corporateIdStr		= null;
		String											partyIdStr			= null;
		HashMap<Long, CorporateAccount>					partyColl			= null;
		HashMap<Long, CorporateAccount>					corporateColl		= null;
		Map<Long, VehicleType>							vehicleTypeColl		= null;
		boolean											isSingleDayData		= false;
		long	regionId	= 0;
		long	subRegionId = 0;
		long	srcBranchId = 0;
		short	dataTypeId	= 0;
		short	filter		= 0;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeBookingSummaryReportAction().execute(request, response);

			sdf			= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			fromDate	= new Timestamp(sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00").getTime());
			toDate		= new Timestamp(sdf.parse(JSPUtility.GetString(request, "toDate") + " 23:59:59").getTime());
//			executive	= (Executive)request.getSession().getAttribute("executive");
			cManip		= new CacheManip(request);
			dataTypeId	= JSPUtility.GetShort(request, "dataTypeId", (short)0);

			final var executive								= (Executive)request.getSession().getAttribute("executive");
			final var execFldPermissionsHM 					= cManip.getExecutiveFieldPermission(request);
			final var configObject							= ReadAllConfigurationsBllImpl.getInstance().getOldReportConfigurationData(ReportIdentifierConstant.BOOKING_SUMMARY_REPORT, executive.getAccountGroupId());
			final var customErrorOnOtherBranchDetailSearch	= configObject.getBoolean(BookingSummaryReportConfigurationDTO.CUSTOM_ERROR_ON_OTHER_BRANCH_DETAIL_SEARCH,false);
			final var allowReportDataSearchForOwnBranchOnly	= configObject.getBoolean(BookingSummaryReportConfigurationDTO.IS_SEARCH_DATA_FOR_OWN_BRANCH_ONLY, false);
			final var isAllowToSearchAllBranchReportData	= execFldPermissionsHM != null && execFldPermissionsHM.containsKey(FeildPermissionsConstant.ALLOW_TO_SEARCH_ALL_BRANCH_REPORT_DATA);
			final var deliveryLocationList					= cManip.getAssignedLocationsIdListByLocationIdId(request, executive.getBranchId(), executive.getAccountGroupId());
			
			ActionStaticUtil.executiveTypeWiseBranches(request, cManip, executive);

			// Get the Selected Combo values
			if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_GROUPADMIN) {
				regionId	= Long.parseLong(request.getParameter("region"));
				subRegionId = Long.parseLong(request.getParameter("subRegion"));
				srcBranchId = Long.parseLong(request.getParameter("branch"));

				// Get Combo values to restore
				subRegionForGroup = cManip.getSubRegionsByRegionId(request, regionId, executive.getAccountGroupId());
				request.setAttribute("subRegionForGroup", subRegionForGroup);
				request.setAttribute("subRegionBranches", cManip.getBranchesBySubRegionId(request,executive.getAccountGroupId(), subRegionId));
			} else if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_REGIONADMIN) {
				regionId	= executive.getRegionId();
				subRegionId = Long.parseLong(request.getParameter("subRegion"));
				srcBranchId = Long.parseLong(request.getParameter("branch"));

				// Get Combo values to restore
				subRegionForGroup = cManip.getSubRegionsByRegionId(request, regionId, executive.getAccountGroupId());
				request.setAttribute("subRegionForGroup", subRegionForGroup);
				request.setAttribute("subRegionBranches", cManip.getBranchesBySubRegionId(request,executive.getAccountGroupId(), subRegionId));

			} else if(executive.getExecutiveType() == Executive.EXECUTIVE_TYPE_SUBREGIONADMIN) {
				regionId	= executive.getRegionId();
				subRegionId = executive.getSubRegionId();
				srcBranchId = Long.parseLong(request.getParameter("branch"));

				// Get Combo values to restore
				request.setAttribute("subRegionBranches", cManip.getBranchesBySubRegionId(request,executive.getAccountGroupId(), subRegionId));
			} else {
				regionId	= executive.getRegionId();
				subRegionId = executive.getSubRegionId();
				srcBranchId = executive.getBranchId();
			}

			branchesIds = ActionStaticUtil.getBranchIds(request, cManip, executive);

			if(dataTypeId != TransportCommonMaster.DATA_TYPE_CLIENT_WISE_ID)
				filter = 1;
			else
				filter = 2;

			valueInObject = new ValueObject();
			valueInObject.put("branchesIds", branchesIds);
			valueInObject.put("fromDate", fromDate);
			valueInObject.put("toDate", toDate);
			valueInObject.put("filter", filter);

			if(DateTimeUtility.compareTwoDates(fromDate, toDate) == 0)
				isSingleDayData	= true;

			reports	 = BookingSummaryReportDAO.getInstance().getBookingSummaryReportData(branchesIds, fromDate, toDate, filter, 0, false, isSingleDayData, executive.getServerIdentifier(), executive.getAccountGroupId());

			if(!ObjectUtils.isEmpty(reports)) {
				if(allowReportDataSearchForOwnBranchOnly && !isAllowToSearchAllBranchReportData) {
					reports = ListFilterUtility.filterList(reports, element -> executive.getBranchId() == element.getSourceBranchId()
							|| executive.getBranchId() == element.getDestinationBranchId()
							|| deliveryLocationList != null && (deliveryLocationList.contains(element.getSourceBranchId()) || deliveryLocationList.contains(element.getDestinationBranchId())));
				}
				
				if(!ObjectUtils.isEmpty(reports)) {
					ActionStaticUtil.setRequestAttribute(request,"customAddressBranchId", srcBranchId);
					ActionStaticUtil.setRequestAttribute(request,"customAddressIdentifer", LHPVCompanyDetails.IDENTIFIER_BOOKING);
					
					reportViewModel = new ReportViewModel();
					reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);
					
					request.setAttribute("ReportViewModel", reportViewModel);
					
					final VehicleType[] vtForGroup			= cManip.getVehicleTypeForGroup(request, executive.getAccountGroupId());
					
					if(vtForGroup != null)
						vehicleTypeColl	= Arrays.asList(vtForGroup).stream().collect(Collectors.toMap(VehicleType::getVehicleTypeId, Function.identity(), (e1, e2) -> e1));
					
					//------------ Get extra data for CLIENT_WISE type only (start)------------
					if(dataTypeId == TransportCommonMaster.DATA_TYPE_CLIENT_WISE_ID) {
						corporateIdStr	= reports.stream().filter(e -> e.getCorporateAccountId() > 0 && e.getPartyType() == CorporateAccountConstant.PARTY_TYPE_TBB)
								.map(e -> e.getCorporateAccountId() + "").collect(Collectors.joining(","));
						
						partyIdStr	= reports.stream().filter(e -> e.getCorporateAccountId() > 0 && e.getPartyType() == CorporateAccountConstant.PARTY_TYPE_GENERAL)
								.map(e -> e.getCorporateAccountId() + "").collect(Collectors.joining(","));
						
						if(!corporateIdStr.isEmpty())
							corporateColl = CorporateAccountDao.getInstance().getCorporateAccountDetails(corporateIdStr);
						
						if(!partyIdStr.isEmpty())
							partyColl = CorporateAccountDao.getInstance().getPartyMasterDetails(partyIdStr);
					}
					//------------ Get extra data for CLIENT_WISE type only (end)------------
					
					dataColl= new TreeMap<>();
					sdf		= new SimpleDateFormat("dd-MM-yyyy");
					
					for (final BookingSummaryReport report2 : reports) {
						//-------------- set vehicle capacity as actual weight in case of FTL (start) -------------
						if(vehicleTypeColl != null && vehicleTypeColl.get(report2.getVehicleTypeId()) != null)
							report2.setActualWeight(vehicleTypeColl.get(report2.getVehicleTypeId()).getCapacity());
						
						//------------ set necessary data in collection first (start)------------
						if(report2.getCommodityTypeMasterId() > 0)
							commodity = cManip.getCommodityDetails(request, executive.getAccountGroupId(), report2.getCommodityTypeMasterId());
						
						if(commodity != null)
							report2.setCommodityTypeName(commodity.getName());
						else
							report2.setCommodityTypeName("Other");
						
						report2.setSourceBranch(cManip.getGenericBranchDetailCache(request, report2.getSourceBranchId()).getName());
						
						if(report2.getDestinationBranchId() > 0) {
							report2.setDestinationRegionId(cManip.getGenericBranchDetailCache(request,report2.getDestinationBranchId()).getRegionId());
							report2.setDestinationRegion(cManip.getRegionByIdAndGroupId(request,report2.getDestinationRegionId() ,executive.getAccountGroupId()).getName());
						}
						else report2.setDestinationRegion("Other");
						
						//------------ check for model object in collection (start)------------
						switch (dataTypeId) {
						case TransportCommonMaster.DATA_TYPE_BRANCH_WISE_ID:
							report = dataColl.get(""+report2.getSourceBranch());
							break;
						case TransportCommonMaster.DATA_TYPE_DATE_WISE_ID:
							report = dataColl.get(sdf.format(report2.getCreationDate()));
							break;
						case TransportCommonMaster.DATA_TYPE_TO_REGION_WISE_ID:
							if(report2.getDestinationBranchId() > 0)
								report = dataColl.get(""+report2.getDestinationRegion());
							else
								report = dataColl.get(report2.getDeliveryPlace()+"_");
							break;
						case TransportCommonMaster.DATA_TYPE_CLIENT_WISE_ID:
							if(report2.getCorporateAccountId() > 0 && report2.getPartyType()==CorporateAccount.PARTY_TYPE_TBB) {
								if(corporateColl != null && corporateColl.get(report2.getCorporateAccountId()) != null)
									report2.setCustomerName(corporateColl.get(report2.getCorporateAccountId()).getName());
								report = dataColl.get("3_"+report2.getCustomerName());
							} else if(report2.getCorporateAccountId() > 0 && report2.getPartyType()==CorporateAccount.PARTY_TYPE_GENERAL) {
								if(partyColl != null && partyColl.get(report2.getCorporateAccountId()) != null)
									report2.setCustomerName(partyColl.get(report2.getCorporateAccountId()).getName());
								report = dataColl.get("2_"+report2.getCustomerName()+"_"+report2.getSourceBranchId());
							} else {
								report2.setCustomerName("General");
								report = dataColl.get("1_"+report2.getCustomerName());
							}
							break;
						case TransportCommonMaster.DATA_TYPE_COMMODITY_WISE_ID:
							report = dataColl.get(""+report2.getCommodityTypeName());
							break;
						default:
							break;
						}
						
						if(report == null) {
							
							report = new BookingSummaryReportModel();
							
							switch (dataTypeId) {
							case TransportCommonMaster.DATA_TYPE_BRANCH_WISE_ID:
								report.setKeyValue(report2.getSourceBranch());
								break;
							case TransportCommonMaster.DATA_TYPE_DATE_WISE_ID:
								report.setKeyValue(sdf.format(report2.getCreationDate()));
								break;
							case TransportCommonMaster.DATA_TYPE_TO_REGION_WISE_ID:
								if(report2.getDestinationBranchId() > 0)
									report.setKeyValue(report2.getDestinationRegion());
								else
									report.setKeyValue(report2.getDeliveryPlace()+" [D]");
								break;
							case TransportCommonMaster.DATA_TYPE_CLIENT_WISE_ID:
								if(report2.getCorporateAccountId() > 0 && report2.getPartyType()==CorporateAccount.PARTY_TYPE_TBB)
									report.setKeyValue(report2.getCustomerName()+" [C]");
								else if(report2.getCorporateAccountId() > 0 && report2.getPartyType()==CorporateAccount.PARTY_TYPE_GENERAL)
									report.setKeyValue(report2.getCustomerName()+" [P]");
								else
									report.setKeyValue(report2.getCustomerName());
								break;
							case TransportCommonMaster.DATA_TYPE_COMMODITY_WISE_ID:
								report.setKeyValue(report2.getCommodityTypeName());
								break;
							default:
								break;
							}
							
							setData(report2, report);
							
							//------------ add model object in collection (start)------------
							switch (dataTypeId) {
							case TransportCommonMaster.DATA_TYPE_BRANCH_WISE_ID:
								dataColl.put(""+report2.getSourceBranch(), report);
								break;
							case TransportCommonMaster.DATA_TYPE_DATE_WISE_ID:
								dataColl.put(""+sdf.format(report2.getCreationDate()), report);
								break;
							case TransportCommonMaster.DATA_TYPE_TO_REGION_WISE_ID:
								if(report2.getDestinationBranchId() > 0)
									dataColl.put(""+report2.getDestinationRegion(), report);
								else
									dataColl.put(report2.getDeliveryPlace()+"_", report);
								break;
							case TransportCommonMaster.DATA_TYPE_CLIENT_WISE_ID:
								if(report2.getCorporateAccountId() > 0 && report2.getPartyType()==CorporateAccount.PARTY_TYPE_TBB)
									dataColl.put("3_"+report2.getCustomerName(), report);
								else if(report2.getCorporateAccountId() > 0 && report2.getPartyType()==CorporateAccount.PARTY_TYPE_GENERAL)
									dataColl.put("2_"+report2.getCustomerName()+"_"+report2.getSourceBranchId(), report);
								else
									dataColl.put("1_"+report2.getCustomerName(), report);
								break;
							case TransportCommonMaster.DATA_TYPE_COMMODITY_WISE_ID:
								dataColl.put(""+report2.getCommodityTypeName(), report);
								break;
							default:
								break;
							}
							
						} else
							setData(report2, report);
					}
					
					if(dataColl != null && dataColl.size() > 0)
						request.setAttribute("BookingSummaryReport",dataColl);
					else {
						error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
						error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
						request.setAttribute("cargoError", error);
					}
				}else {
					if(customErrorOnOtherBranchDetailSearch){
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
				}
			}else {
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}

			request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		} finally {
			subRegionForGroup	= null;
//			executive			= null;
			cManip				= null;
			valueInObject		= null;
			branchesIds			= null;
			reportViewModel		= null;
			sdf               	= null;
			fromDate			= null;
			toDate				= null;
			reports				= null;
			report				= null;
			commodity			= null;
			dataColl			= null;
		}
	}

	public void setData(BookingSummaryReport reports, BookingSummaryReportModel report) throws Exception {
		try {
			if(reports.getBookingTypeId() == BookingTypeConstant.BOOKING_TYPE_SUNDRY_ID) {
				report.setTotalSundryLR(report.getTotalSundryLR() + 1);
				report.setTotalSundryActualWeight(report.getTotalSundryActualWeight() + reports.getActualWeight());
				report.setTotalSundryFreight(report.getTotalSundryFreight() + reports.getGrandTotal());

				if(reports.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID) {
					report.setTotalSundryPaidActualWeight(report.getTotalSundryPaidActualWeight() + reports.getActualWeight());
					report.setTotalSundryPaidFreight(report.getTotalSundryPaidFreight() + reports.getGrandTotal());
				} else if(reports.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY) {
					report.setTotalSundryToPayActualWeight(report.getTotalSundryToPayActualWeight() + reports.getActualWeight());
					report.setTotalSundryToPayFreight(report.getTotalSundryToPayFreight() + reports.getGrandTotal());
				} else {
					report.setTotalSundryCreditActualWeight(report.getTotalSundryCreditActualWeight() + reports.getActualWeight());
					report.setTotalSundryCreditFreight(report.getTotalSundryCreditFreight() + reports.getGrandTotal());
				}
			} else if(reports.getBookingTypeId() == BookingTypeConstant.BOOKING_TYPE_FTL_ID) {
				report.setTotalFTLLR(report.getTotalFTLLR() + 1);
				report.setTotalFTLActualWeight(report.getTotalFTLActualWeight() + reports.getActualWeight());
				report.setTotalFTLFreight(report.getTotalFTLFreight() + reports.getGrandTotal());

				if(reports.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID) {
					report.setTotalFTLPaidActualWeight(report.getTotalFTLPaidActualWeight() + reports.getActualWeight());
					report.setTotalFTLPaidFreight(report.getTotalFTLPaidFreight() + reports.getGrandTotal());
				} else if(reports.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY) {
					report.setTotalFTLToPayActualWeight(report.getTotalFTLToPayActualWeight() + reports.getActualWeight());
					report.setTotalFTLToPayFreight(report.getTotalFTLToPayFreight() + reports.getGrandTotal());
				} else {
					report.setTotalFTLCreditActualWeight(report.getTotalFTLCreditActualWeight() + reports.getActualWeight());
					report.setTotalFTLCreditFreight(report.getTotalFTLCreditFreight() + reports.getGrandTotal());
				}
			} else {
				report.setTotalDDDVLR(report.getTotalDDDVLR() + 1);
				report.setTotalDDDVActualWeight(report.getTotalDDDVActualWeight() + reports.getActualWeight());
				report.setTotalDDDVFreight(report.getTotalDDDVFreight() + reports.getGrandTotal());

				if(reports.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_PAID) {
					report.setTotalDDDVPaidActualWeight(report.getTotalDDDVPaidActualWeight() + reports.getActualWeight());
					report.setTotalDDDVPaidFreight(report.getTotalDDDVPaidFreight() + reports.getGrandTotal());
				} else if(reports.getWayBillTypeId() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY) {
					report.setTotalDDDVToPayActualWeight(report.getTotalDDDVToPayActualWeight() + reports.getActualWeight());
					report.setTotalDDDVToPayFreight(report.getTotalDDDVToPayFreight() + reports.getGrandTotal());
				} else {
					report.setTotalDDDVCreditActualWeight(report.getTotalDDDVCreditActualWeight() + reports.getActualWeight());
					report.setTotalDDDVCreditFreight(report.getTotalDDDVCreditFreight() + reports.getGrandTotal());
				}
			}
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}
}