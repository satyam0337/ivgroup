package com.ivcargo.reports;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.TimeZone;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.logsapp.LogWriter;
import com.iv.utils.dataObject.ValueObject;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.CorporateAccountDao;
import com.platform.dao.reports.WayBillDetailsDAO;
import com.platform.dao.reports.WayBilllReportDao;
import com.platform.dto.Branch;
import com.platform.dto.ConsignmentDetails;
import com.platform.dto.CorporateAccount;
import com.platform.dto.Executive;
import com.platform.dto.model.BusinessFunctionConstants;
import com.platform.dto.model.ConsignmentDetailsModel;
import com.platform.dto.model.CorporateAccountReportModel;
import com.platform.dto.model.PackagesCollectionDetails;
import com.platform.dto.model.ReportViewModel;
import com.platform.dto.model.WayBillDeatailsModel;
import com.platform.resource.CargoErrorList;

public class CorporateAccountGroupReportAction implements Action {
	private static final String TRACE_ID = "CorporateAccountGroupReportAction";

	@SuppressWarnings({ "rawtypes", "unchecked" })
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		// TODO Auto-generated method stub
		HashMap<String,Object>	 error 	= null;
		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error)){
				return;
			}
			long startTime = System.currentTimeMillis();
			new InitializeCorporateAccountGroupReportAction().execute(request, response);

			Executive 			executive 		= (Executive) request.getSession().getAttribute("executive");
			SimpleDateFormat 	sdf 			= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			Timestamp 			fromDate 		= new Timestamp((sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00")).getTime());
			Timestamp 			toDate 			= new Timestamp((sdf.parse(JSPUtility.GetString(request, "toDate") + " 23:59:00")).getTime());
			CorporateAccount 	corp 			= null;
			ValueObject 		valueOutObject 	= null;
			Long[] 				wayBillIdArray 	= null;
			HashMap<Long,PackagesCollectionDetails>  packageSummaryCollection = new HashMap<Long, PackagesCollectionDetails>();
			CorporateAccountReportModel[] 	reportModel = null;
			Branch				srcBranch				= null;
			Branch				destBranch				= null;
			

			long corporateAccountId = JSPUtility.GetLong(request, "CACC", 0);

			if(corporateAccountId > 0) {
				corp = CorporateAccountDao.getInstance().findByPrimaryKey(corporateAccountId);                	
			} else {
				corporateAccountId = -1;
			}
			if(corp.getCorporateAccountSubType() == CorporateAccount.CORPORATEACCOUNT_SUB_TYPE_NORMAL || corp.getCorporateAccountSubType() == CorporateAccount.CORPORATEACCOUNT_SUB_TYPE_ZERO_AMOUNT){
				valueOutObject = WayBilllReportDao.getInstance().getCorporateAccount(fromDate, toDate, executive.getAccountGroupId(), corporateAccountId);

				if (valueOutObject!=null ){

					reportModel 	= (CorporateAccountReportModel[])valueOutObject.get("CorporateAccountReportModel");
					wayBillIdArray 	= (Long[]) valueOutObject.get("WayBillIdArray");

					if(reportModel !=null && wayBillIdArray != null){

						CacheManip 						cache 				=  new CacheManip(request);	
						ConsignmentDetails[] 			consignmentDetails 	= null;
						long 							quantity 			= 0;
						String 							pkgDetail			= "" ; 
						//Get WayBill Details code ( Start )
						HashMap<Long, WayBillDeatailsModel> wayBillDetails = WayBillDetailsDAO.getInstance().getWayBillDetails(wayBillIdArray ,false ,(short)0 ,false ,(short)0 ,true);
						//Get WayBill Details code ( End )

						for (int i = 0; i < reportModel.length; i++) {
							
							srcBranch   = cache.getGenericBranchDetailCache(request, reportModel[i].getSourceBranchId());
							destBranch  = cache.getGenericBranchDetailCache(request, reportModel[i].getDestinationBranchId());
							
							reportModel[i].setWayBillSourceSubRegionId(srcBranch.getSubRegionId());
							reportModel[i].setWayBillDestinationSubRegionId(destBranch.getSubRegionId());

							reportModel[i].setWayBillSourceSubRegion((cache.getGenericSubRegionById(request, reportModel[i].getWayBillSourceSubRegionId())).getName());
							reportModel[i].setWayBillDestinationSubRegion((cache.getGenericSubRegionById(request, reportModel[i].getWayBillDestinationSubRegionId())).getName());

							consignmentDetails 	= wayBillDetails.get(reportModel[i].getWayBillId()).getConsignmentDetails();
							quantity 			= 0;
							pkgDetail			= "" ;
							PackagesCollectionDetails  packageSummary = null;

							for (int j = 0; j < consignmentDetails.length; j++) {
								quantity = quantity + consignmentDetails[j].getQuantity();
								if(j == 0){
									pkgDetail = pkgDetail + consignmentDetails[j].getQuantity() +" "+ consignmentDetails[j].getPackingTypeName();
								}else{
									pkgDetail = pkgDetail + " / "+ consignmentDetails[j].getQuantity() +" "+ consignmentDetails[j].getPackingTypeName();
								}

								// package Summary code START
								packageSummary = packageSummaryCollection.get(consignmentDetails[j].getPackingTypeMasterId());
								if (packageSummary !=null){
									packageSummary.setTotalQuantity(packageSummary.getTotalQuantity()+consignmentDetails[j].getQuantity());
									packageSummary.setTotalAmount(packageSummary.getTotalAmount()+consignmentDetails[j].getAmount());
								} else {
									packageSummary= new PackagesCollectionDetails();
									packageSummary.setPackagesTypeId(consignmentDetails[j].getPackingTypeMasterId());
									packageSummary.setPackagesTypeName(consignmentDetails[j].getPackingTypeName());
									packageSummary.setTotalQuantity(consignmentDetails[j].getQuantity());
									packageSummary.setTotalAmount(consignmentDetails[j].getAmount());

									packageSummaryCollection.put(consignmentDetails[j].getPackingTypeMasterId(),packageSummary);
								}
								// package Summary code END
							}
							reportModel[i].setNoOfPackages(quantity);
							reportModel[i].setTypeOfPackages(pkgDetail);
						}

						request.setAttribute("packageSummaryCollection", packageSummaryCollection);
						request.setAttribute("agentName", executive.getName());
						request.setAttribute("fromDate", JSPUtility.GetString(request, "fromDate"));
						request.setAttribute("toDate", JSPUtility.GetString(request, "toDate"));
						
						if(corporateAccountId > 0 && corp != null) {
							request.setAttribute("corporateName", corp.getName());
						} else {
							request.setAttribute("corporateName", "All");
						}

						/*int reportId = new Random().nextInt(10000);
	                        session.setAttribute(reportId+"",reportModel);
	                        request.setAttribute("reportId", reportId);*/

						ReportViewModel reportViewModel =new ReportViewModel();
						reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);

						request.setAttribute("ReportViewModel",reportViewModel);
						request.setAttribute("report", reportModel);
						request.setAttribute("nextPageToken", "success");
					}
				} else {
					LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, CargoErrorList.SYSTEM_ERROR + "");
					error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
					error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
					request.setAttribute("cargoError", error);
				}
			}else if(corp.getCorporateAccountSubType() == CorporateAccount.CORPORATEACCOUNT_SUB_TYPE_PACKAGE_TYPE) {
				valueOutObject = WayBilllReportDao.getInstance().getCorporateAccount(fromDate, toDate, executive.getAccountGroupId(), corporateAccountId);
				if (valueOutObject!=null ){

					reportModel 	= (CorporateAccountReportModel[])valueOutObject.get("CorporateAccountReportModel");
					wayBillIdArray 	= (Long[]) valueOutObject.get("WayBillIdArray");

					if(reportModel !=null && wayBillIdArray != null){

						CacheManip 						cache 				=  new CacheManip(request);	
						ConsignmentDetails[] 			consignmentDetails 	= null;
						long 							quantity 			= 0;
						String 							srcSubRegion				= "" ; 
						String 							destSubRegion			= "" ; 
						String 							route				= "" ; 
						HashMap<Long, String>  packingTypeList = new HashMap<Long, String>(); 
						HashMap<String, HashMap> collectionObj = null;
						HashMap<String, HashMap>  routeWiseCollection = new HashMap<String, HashMap>();
						HashMap<String, HashMap>  routeWiseWayBillCollection = new HashMap<String, HashMap>(); 
						HashMap<String, CorporateAccountReportModel>  routeWiseWayBills = new HashMap<String, CorporateAccountReportModel>(); 
						HashMap<String, HashMap>  routeWisePkgSummary = new HashMap<String, HashMap>(); 
						HashMap<Long, PackagesCollectionDetails>  routeWisePkgSummaryCollection = new HashMap<Long, PackagesCollectionDetails>(); 
						CorporateAccountReportModel routeWiseBillModel = null;
						String packingTypeName = null;
						PackagesCollectionDetails  routeWisePkgDetail = null;

						//Get WayBill Details 
						HashMap<Long, WayBillDeatailsModel> wayBillDetails = WayBillDetailsDAO.getInstance().getWayBillDetails(wayBillIdArray ,false ,(short)0 ,false ,(short)0 ,true);

						for (int i = 0; i < reportModel.length; i++) {
							
							srcBranch   = cache.getGenericBranchDetailCache(request, reportModel[i].getSourceBranchId());
							destBranch  = cache.getGenericBranchDetailCache(request, reportModel[i].getDestinationBranchId());
							
							reportModel[i].setWayBillSourceSubRegionId(srcBranch.getSubRegionId());
							reportModel[i].setWayBillDestinationSubRegionId(destBranch.getSubRegionId());
							
							srcSubRegion = (cache.getGenericSubRegionById(request, reportModel[i].getWayBillSourceSubRegionId())).getName();
							destSubRegion = (cache.getGenericSubRegionById(request, reportModel[i].getWayBillDestinationSubRegionId())).getName();	
							route= srcSubRegion +" To "+destSubRegion;
							reportModel[i].setWayBillSourceSubRegion(srcSubRegion);
							reportModel[i].setWayBillDestinationSubRegion(destSubRegion);

							consignmentDetails 	= wayBillDetails.get(reportModel[i].getWayBillId()).getConsignmentDetails();
							quantity 			= 0;
							//  PackagesCollectionDetails  packageSummary = null;   //Use to get Total Package Summary 
							HashMap <Long, PackagesCollectionDetails> packageDetailCollection = new HashMap<Long, PackagesCollectionDetails>();
							for (int j = 0; j < consignmentDetails.length; j++) {
								PackagesCollectionDetails  packageDetail = null;
								quantity = quantity + consignmentDetails[j].getQuantity();
								packingTypeName = packingTypeList.get(consignmentDetails[j].getPackingTypeMasterId()); 
								// List of Packing Types in sorted order START
								if ( packingTypeName == null){
									packingTypeList.put(consignmentDetails[j].getPackingTypeMasterId(), consignmentDetails[j].getPackingTypeName());
								} 
								// List of Packing Types in sorted order END


								// waybillwise package Details Collection code START
								packageDetail = packageDetailCollection.get(consignmentDetails[j].getPackingTypeMasterId());
								if (packageDetail !=null){
									packageDetail.setTotalQuantity(packageDetail.getTotalQuantity()+consignmentDetails[j].getQuantity());
									packageDetail.setTotalAmount(packageDetail.getTotalAmount()+consignmentDetails[j].getAmount());
								} else {
									packageDetail= new PackagesCollectionDetails();
									packageDetail.setPackagesTypeId(consignmentDetails[j].getPackingTypeMasterId());
									packageDetail.setPackagesTypeName(consignmentDetails[j].getPackingTypeName());
									packageDetail.setTotalQuantity(consignmentDetails[j].getQuantity());
									packageDetail.setTotalAmount(consignmentDetails[j].getAmount());
									packageDetailCollection.put(consignmentDetails[j].getPackingTypeMasterId(),packageDetail);
								}
								// waybillwise package Details Collection code END

								/*	
										// Total package Summary code START
										packageSummary = packageSummaryCollection.get(consignmentDetails[j].getPackingTypeMasterId());
										if (packageSummary !=null){
											packageSummary.setTotalQuantity(packageSummary.getTotalQuantity()+consignmentDetails[j].getQuantity());
											packageSummary.setTotalAmount(packageSummary.getTotalAmount()+consignmentDetails[j].getAmount());
										} else {
											packageSummary= new PackagesCollectionDetails();
											packageSummary.setPackagesTypeId(consignmentDetails[j].getPackingTypeMasterId());
											packageSummary.setPackagesTypeName(consignmentDetails[j].getPackingTypeName());
											packageSummary.setTotalQuantity(consignmentDetails[j].getQuantity());
											packageSummary.setTotalAmount(consignmentDetails[j].getAmount());
											packageSummaryCollection.put(consignmentDetails[j].getPackingTypeMasterId(),packageSummary);
										}
										// Total package Summary code END
								 */
								// route wise Summary code START
								routeWisePkgSummaryCollection = (HashMap<Long,PackagesCollectionDetails>) routeWisePkgSummary.get(route);
								if (routeWisePkgSummaryCollection != null ){
									routeWisePkgDetail = routeWisePkgSummaryCollection.get(consignmentDetails[j].getPackingTypeMasterId());
									if(routeWisePkgDetail != null){
										routeWisePkgDetail.setTotalQuantity(routeWisePkgDetail.getTotalQuantity()+ consignmentDetails[j].getQuantity());
										routeWisePkgDetail.setTotalAmount(routeWisePkgDetail.getTotalAmount()+ consignmentDetails[j].getAmount());
									} else {
										routeWisePkgDetail = new PackagesCollectionDetails();
										routeWisePkgDetail.setPackagesTypeName(consignmentDetails[j].getPackingTypeName() );
										routeWisePkgDetail.setTotalQuantity(consignmentDetails[j].getQuantity());
										routeWisePkgDetail.setTotalAmount(consignmentDetails[j].getAmount());
										routeWisePkgSummaryCollection.put(consignmentDetails[j].getPackingTypeMasterId(),routeWisePkgDetail);
									}
								} else {
									routeWisePkgSummaryCollection = new HashMap<Long, PackagesCollectionDetails>();
									routeWisePkgDetail = new PackagesCollectionDetails();
									routeWisePkgDetail.setPackagesTypeName(consignmentDetails[j].getPackingTypeName());
									routeWisePkgDetail.setTotalQuantity(consignmentDetails[j].getQuantity());
									routeWisePkgDetail.setTotalAmount(consignmentDetails[j].getAmount());
									routeWisePkgSummaryCollection.put(consignmentDetails[j].getPackingTypeMasterId(),routeWisePkgDetail);
									routeWisePkgSummary.put(route, routeWisePkgSummaryCollection);
								}
							}
							reportModel[i].setNoOfPackages(quantity);
							reportModel[i].setPackageDetails(packageDetailCollection);
							// route wise package Summary code END

							// routeWiseCollection code START

							collectionObj =  routeWiseCollection.get(route);
							if (collectionObj !=null){
								//Get routeWiseWayBillCollection
								routeWiseWayBillCollection = collectionObj.get("wayBillCollection");

								if(routeWiseWayBillCollection != null){
									//Get routeWiseWayBills
									routeWiseWayBills = routeWiseWayBillCollection.get(route);
									if (routeWiseWayBills != null) {
										// Get routeWiseWayBills
										routeWiseBillModel = routeWiseWayBills.get(reportModel[i].getWayBillNumber());
										if (routeWiseBillModel == null) {
											routeWiseWayBills.put(reportModel[i].getWayBillNumber(),reportModel[i]);
										}
									} else {
										routeWiseWayBills = new HashMap<String, CorporateAccountReportModel>();
										routeWiseWayBills.put(reportModel[i].getWayBillNumber(), reportModel[i]);
									}
								} else {
									routeWiseWayBillCollection = new HashMap<String, HashMap>();
									routeWiseWayBills = new HashMap<String, CorporateAccountReportModel>();
									routeWiseWayBills.put(reportModel[i].getWayBillNumber() , reportModel[i]);
									routeWiseWayBillCollection.put(route, routeWiseWayBills);
								}

								//Get routeWisePkgSummary
								routeWisePkgSummary = (HashMap<String,HashMap>)collectionObj.get("packageCollection");
								if (routeWisePkgSummary == null){
									if (routeWisePkgSummaryCollection != null ){
										routeWisePkgSummary	= new HashMap<String,HashMap>();
										routeWisePkgSummary.put(route,routeWisePkgSummaryCollection);
									} 
								}										

							} else {
								collectionObj = new HashMap<String, HashMap>();

								//Get new routeWiseWayBillCollection
								routeWiseWayBillCollection = new HashMap<String, HashMap>();
								routeWiseWayBills = new HashMap<String, CorporateAccountReportModel>();
								routeWiseWayBills.put(reportModel[i].getWayBillNumber() , reportModel[i]);
								routeWiseWayBillCollection.put(route, routeWiseWayBills);
								collectionObj.put("wayBillCollection", routeWiseWayBillCollection);

								//Get new routeWisePkgSummary
								collectionObj.put("packageCollection", routeWisePkgSummary);
								routeWiseCollection.put(route,collectionObj );
							}
							// routeWiseCollection code END
						}
						//request.setAttribute("packageSummaryCollection", packageSummaryCollection);
						request.setAttribute("agentName", executive.getName());
						request.setAttribute("fromDate", JSPUtility.GetString(request, "fromDate"));
						request.setAttribute("toDate", JSPUtility.GetString(request, "toDate"));
						request.setAttribute("packingTypeList", packingTypeList);
						request.setAttribute("routeWiseCollection", routeWiseCollection);
						
						if(corporateAccountId > 0 && corp != null) {
							request.setAttribute("corporateName", corp.getName());
						} else {
							request.setAttribute("corporateName", "All");
						}

						/*int reportId = new Random().nextInt(10000);
		                        session.setAttribute(reportId+"",reportModel);
		                        request.setAttribute("reportId", reportId);*/

						ReportViewModel reportViewModel =new ReportViewModel();
						reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);

						request.setAttribute("ReportViewModel",reportViewModel);
						request.setAttribute("report", reportModel);
						request.setAttribute("nextPageToken", "success_3");
					}
				} else {
					LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, CargoErrorList.SYSTEM_ERROR + "");
					error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
					error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
					request.setAttribute("cargoError", error);
				}
			}
			else if(corp.getCorporateAccountSubType() == CorporateAccount.CORPORATEACCOUNT_SUB_TYPE_KG){
				LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_DEBUG,""+corp.getName() );
				valueOutObject = WayBilllReportDao.getInstance().getCorporateAccount(fromDate, toDate, executive.getAccountGroupId(), corporateAccountId);

				if (valueOutObject!=null ){

					reportModel 		= (CorporateAccountReportModel[])valueOutObject.get("CorporateAccountReportModel");
					wayBillIdArray 		= (Long[]) valueOutObject.get("WayBillIdArray");

					if(reportModel !=null && wayBillIdArray != null){

						CacheManip 						cache 				= new CacheManip(request);	
						ConsignmentDetails[] 			consignmentDetails 	= null;
						ConsignmentDetailsModel[] 		model 				= null;
						double							freightAmount		= 0.00; 

						//Get WayBill Details code ( Start )
						HashMap<Long, WayBillDeatailsModel> wayBillDetails = WayBillDetailsDAO.getInstance().getWayBillDetails(wayBillIdArray ,false ,(short)0 ,false ,(short)0 ,true);
						//Get WayBill Details code ( End )

						for (int i = 0; i < reportModel.length; i++) {
							
							srcBranch   = cache.getGenericBranchDetailCache(request, reportModel[i].getSourceBranchId());
							destBranch  = cache.getGenericBranchDetailCache(request, reportModel[i].getDestinationBranchId());
							
							reportModel[i].setWayBillSourceSubRegionId(srcBranch.getSubRegionId());
							reportModel[i].setWayBillDestinationSubRegionId(destBranch.getSubRegionId());
							
							reportModel[i].setWayBillSourceSubRegion((cache.getGenericSubRegionById(request, reportModel[i].getWayBillSourceSubRegionId())).getName());
							reportModel[i].setWayBillDestinationSubRegion((cache.getGenericSubRegionById(request, reportModel[i].getWayBillDestinationSubRegionId())).getName());

							freightAmount 		= 0.00;
							consignmentDetails 	= wayBillDetails.get(reportModel[i].getWayBillId()).getConsignmentDetails();
							model 				= new ConsignmentDetailsModel[consignmentDetails.length];
							for (int j = 0; j < consignmentDetails.length; j++) {
								freightAmount += consignmentDetails[j].getAmount();
								model[j] 		= new ConsignmentDetailsModel();
								model[j].setPackingTypeMasterId(consignmentDetails[j].getPackingTypeMasterId());
								model[j].setPackingTypeName(consignmentDetails[j].getPackingTypeName());
								model[j].setQuantity(consignmentDetails[j].getQuantity());
								model[j].setActualWeight(consignmentDetails[j].getActualWeight());
								model[j].setTotalActualWeight(consignmentDetails[j].getQuantity() * consignmentDetails[j].getActualWeight());
							}
							reportModel[i].setFreightAmount(freightAmount);
							reportModel[i].setModel(model);
						}

						request.setAttribute("agentName", executive.getName());
						request.setAttribute("fromDate", JSPUtility.GetString(request, "fromDate"));
						request.setAttribute("toDate", JSPUtility.GetString(request, "toDate"));
						
						if(corporateAccountId > 0 && corp != null) {
							request.setAttribute("corporateName", corp.getName());
						} else {
							request.setAttribute("corporateName", "All");
						}

						/*int reportId = new Random().nextInt(10000);
	                        session.setAttribute(reportId+"",reportModel);
	                        request.setAttribute("reportId", reportId);*/

						ReportViewModel reportViewModel =new ReportViewModel();
						reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);

						request.setAttribute("ReportViewModel",reportViewModel);
						request.setAttribute("report", reportModel);
						request.setAttribute("nextPageToken", "success_2");

						SimpleDateFormat dateFormatForTimeLog =new SimpleDateFormat("mm:ss");
						dateFormatForTimeLog.setTimeZone(TimeZone.getTimeZone("GMT"));
						LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO,"=====Report Generated "+BusinessFunctionConstants.CORPORATEACCOUNTREPORT +" "+executive.getAccountGroupId()+
								" "+executive.getBranchId()+" "+executive.getExecutiveId()+" in "+dateFormatForTimeLog.format(new Date(System.currentTimeMillis()-startTime)));
					}else{
						LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, CargoErrorList.SYSTEM_ERROR + "");
						error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
						error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
						request.setAttribute("cargoError", error);
					}

				} else{
					LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO, (String) error.get("errorCode")+" "+(String) error.get("errorDescription"));
					error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
					error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
					request.setAttribute("cargoError", error);
				}

			} else {
				LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, CargoErrorList.SYSTEM_ERROR + "");
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}

		} catch (Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		}
	}
}

