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
import com.platform.dao.reports.CreditorPaymentModuleDAO;
import com.platform.dao.reports.WayBillDetailsDAO;
import com.platform.dto.Branch;
import com.platform.dto.ConsignmentDetails;
import com.platform.dto.CorporateAccount;
import com.platform.dto.Executive;
import com.platform.dto.model.BusinessFunctionConstants;
import com.platform.dto.model.CreditWayBillPaymentModule;
import com.platform.dto.model.ReportViewModel;
import com.platform.dto.model.WayBillDeatailsModel;
import com.platform.resource.CargoErrorList;

public class CreditorPaymentModuleAction implements Action {
	private static final String TRACE_ID = "CreditorPaymentModuleAction";

	public void execute(HttpServletRequest request, HttpServletResponse response) {
		// TODO Auto-generated method stub

		HashMap<String,Object>	 error 	= null;
		try {

			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error)){
				return;
			}
			long startTime = System.currentTimeMillis();
			new InitializeCreditorPaymentModuleAction().execute(request, response);

			Executive 			executive 	= (Executive) request.getSession().getAttribute("executive");
			SimpleDateFormat 	sdf 		= new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
			Timestamp 			fromDate 	= new Timestamp((sdf.parse(JSPUtility.GetString(request, "fromDate") + " 00:00:00")).getTime());
			Timestamp 			toDate 		= new Timestamp((sdf.parse(JSPUtility.GetString(request, "toDate") + " 23:59:00")).getTime());
			CorporateAccount 	corp 		= null;

			long corporateAccountId = JSPUtility.GetLong(request, "CACC", 0);

			if(corporateAccountId != 0) {

				corp = CorporateAccountDao.getInstance().findByPrimaryKey(corporateAccountId);

				ValueObject valueInObject	= new ValueObject();
				valueInObject.put("fromDate", fromDate);
				valueInObject.put("toDate", toDate);
				valueInObject.put("accountGroupId", executive.getAccountGroupId());
				valueInObject.put("corporateAccountId", corporateAccountId);
				valueInObject.put("corporateAccountType", corp.getCorporateAccountType());

				ValueObject valueOutObject 	= CreditorPaymentModuleDAO.getInstance().getWayBillDetails(valueInObject);

				if (valueOutObject != null) {

					CreditWayBillPaymentModule[] 	reportModel 		= (CreditWayBillPaymentModule[])valueOutObject.get("CreditWayBillPaymentModule");
					Long[] 							wayBillIdArray 		= (Long[]) valueOutObject.get("WayBillIdArray");

					if(reportModel != null && wayBillIdArray != null){

						CacheManip 						cache 				= new CacheManip(request);	
						ConsignmentDetails[] 			consignmentDetails 	= null;
						long 							quantity 			= 0;
						String 							pkgDetail			= "" ;
						Branch							branch				= null;
						//Get WayBill Details code ( Start )
						HashMap<Long, WayBillDeatailsModel> wayBillDetails = WayBillDetailsDAO.getInstance().getWayBillDetails(wayBillIdArray ,false ,(short)0 ,false ,(short)0 ,true);
						//Get WayBill Details code ( End )

						for (int i = 0; i < reportModel.length; i++) {
							/*reportModel[i].setSourceCity((cache.getCityById(request, reportModel[i].getSourceCityId())).getName());
							reportModel[i].setDestinationCity((cache.getCityById(request, reportModel[i].getDestinationCityId())).getName());*/

							branch	= cache.getGenericBranchDetailCache(request, reportModel[i].getSourceBranchId());
							reportModel[i].setSourceSubRegionId(branch.getSubRegionId());
							reportModel[i].setSourceSubRegion((cache.getGenericSubRegionById(request, reportModel[i].getSourceSubRegionId())).getName());

							branch	= cache.getGenericBranchDetailCache(request, reportModel[i].getDestinationBranchId());
							reportModel[i].setDestinationSubRegionId(branch.getSubRegionId());
							reportModel[i].setDestinationSubRegion((cache.getGenericSubRegionById(request, reportModel[i].getDestinationSubRegionId())).getName());

							consignmentDetails 	= wayBillDetails.get(reportModel[i].getWayBillId()).getConsignmentDetails();
							quantity 			= 0;
							pkgDetail			= "" ; 
							for (int j = 0; j < consignmentDetails.length; j++) {
								quantity = quantity + consignmentDetails[j].getQuantity();
								if(j == 0){
									pkgDetail = pkgDetail + consignmentDetails[j].getQuantity() +" "+ consignmentDetails[j].getPackingTypeName();
								}else{
									pkgDetail = pkgDetail + "/ "+ consignmentDetails[j].getQuantity() +" "+ consignmentDetails[j].getPackingTypeName();
								}
							}
							reportModel[i].setNoOfPackages(quantity);
							reportModel[i].setTypeOfPackages(pkgDetail);
						}

						request.setAttribute("agentName", executive.getName());
						request.setAttribute("fromDate", JSPUtility.GetString(request, "fromDate"));
						request.setAttribute("toDate", JSPUtility.GetString(request, "toDate"));
						if(corp != null){
							request.setAttribute("corporateName", corp.getName());
						}

						ReportViewModel reportViewModel =new ReportViewModel();
						reportViewModel = ReportView.getInstance().populateReportViewModel(request, reportViewModel);
						request.setAttribute("ReportViewModel",reportViewModel);

						request.setAttribute("report", reportModel);
						request.setAttribute("nextPageToken", "success");

						SimpleDateFormat dateFormatForTimeLog =new SimpleDateFormat("mm:ss");
						dateFormatForTimeLog.setTimeZone(TimeZone.getTimeZone("GMT"));
						LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO,"=====Report Generated "+BusinessFunctionConstants.CREDITORPAYMENTMODULE +" "+executive.getAccountGroupId()+
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
				LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_INFO, (String) error.get("errorCode")+" "+(String) error.get("errorDescription"));
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}

		} catch (Exception _e) {
			ActionStepsUtil.catchActionException(request, _e, error);
		}
	}
}

