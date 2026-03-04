package com.ivcargo.actions;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.platform.dto.Executive;

public class DisplayDispatchSummaryAction implements Action {

	Executive  executive;
	long totalPackages 			= 0;	 
	long totalDocsOnPackages 	= 0;		
	long totalNonDocsOnPackages = 0;	
	public void execute(HttpServletRequest request, HttpServletResponse response) {

		HashMap<String,Object>	 	error 					= null;
		try {
			error = ActionStaticUtil.getSystemErrorColl(request);
			if(ActionStaticUtil.isSystemError(request,error)){
				return;
			}
			/*
                HttpSession session = request.getSession();

                executive = (Executive) session.getAttribute("executive");

                long        dispatchLedgerId = JSPUtility.GetLong(request, "dispatchLedgerId");
                DispatchBLL dispatchBLL      = new DispatchBLL();
                ValueObject inValObj         = new ValueObject();

                inValObj.put("dispatchLedgerId", dispatchLedgerId);

                ValueObject outValObj = dispatchBLL.getPrintOutboundManifest(inValObj);
                PrintOutboundManifestReportAction print = new PrintOutboundManifestReportAction();
                if (outValObj.get("wayBillModels") != null) {
                    WayBillModel[]           wayBillModels            = (WayBillModel[]) outValObj.get("wayBillModels");
                    DispatchLedgerPrintModel dispatchLedgerPrintModel =  populateDispatchLedgerPrintModel(wayBillModels[0].getDispatchLedger());

                    dispatchLedgerPrintModel.setDispatchLedgerId(dispatchLedgerId);


                    WayBillViewModel[] wayBillViewList = new WayBillViewModel[wayBillModels.length];

                    for (int i = 0; i < wayBillModels.length; i++) {
                        wayBillViewList[i] = print.populateWayBillViewModel(request, wayBillModels[i] ,dispatchLedgerPrintModel);

                        if (wayBillViewList[i].getArticleTypeMasterId() == 1) {
                            dispatchLedgerPrintModel.setTotalArticles(dispatchLedgerPrintModel.getTotalArticles()
                                    + wayBillViewList[i].getNoOfArticle());
                            dispatchLedgerPrintModel.setTotalDocs(dispatchLedgerPrintModel.getTotalDocs()
                                    + wayBillViewList[i].getNoOfArticle());
                        }

                        if (wayBillViewList[i].getArticleTypeMasterId() == 2) {
                            dispatchLedgerPrintModel.setTotalArticles(dispatchLedgerPrintModel.getTotalArticles()
                                    + wayBillViewList[i].getNoOfArticle());
                            dispatchLedgerPrintModel.setTotalNonDocs(dispatchLedgerPrintModel.getTotalNonDocs()
                                    + wayBillViewList[i].getNoOfArticle());
                        }

                        if (wayBillViewList[i].getArticleTypeMasterId() == 3) {
                            dispatchLedgerPrintModel.setTotalArticles(dispatchLedgerPrintModel.getTotalArticles()
                                    + wayBillViewList[i].getNoOfArticle());
                            dispatchLedgerPrintModel.setTotalMotorcycles(dispatchLedgerPrintModel.getTotalMotorcycles()
                                    + wayBillViewList[i].getNoOfArticle());
                        }

                    }

                    request.setAttribute("dispatchLedger", dispatchLedgerPrintModel);
                    request.setAttribute("wayBillViewList", wayBillViewList );
                    request.setAttribute("nextPageToken", "success");
                } else {
                    error.put("errorCode", CargoErrorList.NO_RECORDS);
                    error.put("errorDescription", CargoErrorList.NO_RECORDS_DESCRIPTION);
                    request.setAttribute("cargoError", error);
                    request.setAttribute("nextPageToken", "success");
                }
			 */} catch (Exception e) {
				 ActionStepsUtil.catchActionException(request, e, error);
			 }
	}
}

/*private static DispatchLedgerPrintModel populateDispatchLedgerPrintModel(DispatchLedger dispatchLedger ) throws Exception{

			 DispatchLedgerPrintModel dispatchLedgerPrintModel = new DispatchLedgerPrintModel(dispatchLedger);
			 Branch srcbranch = BranchDao.getInstance().findByBranchId(dispatchLedger.getSourceBranchId());
			 dispatchLedgerPrintModel.setSourceBranch(srcbranch.getName());
			 City srcCity = CityDao.getInstance().findCityByCityId(dispatchLedger.getSourceCityId());
			 dispatchLedgerPrintModel.setSourceCity(srcCity.getName());
			 Branch destbranch = BranchDao.getInstance().findByBranchId(dispatchLedger.getDestinationBranchId());
			 City destCity = CityDao.getInstance().findCityByCityId(dispatchLedger.getDestinationCityId());
			 dispatchLedgerPrintModel.setDestinationBranch(destbranch.getName());
			 dispatchLedgerPrintModel.setDestinationCity(destCity.getName());
			 return dispatchLedgerPrintModel;

	}*/
