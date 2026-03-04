package com.ivcargo.actions.transport;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringUtils;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.dto.constant.PaymentTypeConstant;
import com.iv.utils.DateTime.DateTimeUtility;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.ExecutiveDao;
import com.platform.dao.LorryHireDao;
import com.platform.dao.LorryHireRouteDao;
import com.platform.dao.tdstxn.TDSTxnDetailsDAO;
import com.platform.dto.Branch;
import com.platform.dto.LorryHireRoute;
import com.platform.dto.constant.TDSTxnDetailsConstant;
import com.platform.dto.constant.TransCargoAccountGroupConstant;
import com.platform.dto.tds.TDSTxnDetails;
import com.platform.dto.tds.TDSTxnDetailsIdentifiers;
import com.platform.utils.Utility;

public class LMTPrintLorryHireAction implements Action {

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	error 					= null;
		LorryHireRoute[] 		lorryHireRouteArr		= null;
		var			 			routeBranchNameStr		= "";
		TDSTxnDetails	 		tdsTxnDetails			= null;
		Branch					branch					= null;
		Branch					lorryHireBranch			= null;
		Branch					lorryHireHandlingBranch	= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	cacheManip	= new CacheManip(request);
			final var	executive 	= cacheManip.getExecutive(request);
			final var	branches	= cacheManip.getGenericBranchesDetail(request);

			final var	lorryHire = LorryHireDao.getInstance().getLorryHireDetailById((short)1,JSPUtility.GetLong(request, "lorryHireId", 0),"",executive.getAccountGroupId());

			if(lorryHire != null) {
				if(executive.getAccountGroupId() == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_LMT){
					lorryHireRouteArr = LorryHireRouteDao.getInstance().getLorryHireRouteByLorryHireId(lorryHire.getLorryHireId());

					tdsTxnDetails = TDSTxnDetailsDAO.getInstance().getTDSTxnDetails(TDSTxnDetailsIdentifiers.TDSTXNDETAILS_IDENTIFIER_LORRYHIRE, lorryHire.getLorryHireId());
				}

				branch	= cacheManip.getGenericBranchDetailCache(request, lorryHire.getSourceBranchId());
				lorryHire.setSourceBranch(branch.getName());

				if(branch.getTypeOfLocation() == Branch.TYPE_OF_LOCATION_OPERATIONAL_PLACE) {
					branch	= (Branch) branches.get(Long.toString(branch.getHandlingBranchId()));
					lorryHire.setHandlingBranchName(branch != null ? branch.getName() : "");
				} else
					lorryHire.setHandlingBranchName("--");

				branch	= (Branch) branches.get(Long.toString(lorryHire.getDestinationBranchId()));
				lorryHire.setDestinationBranch(branch.getName());

				branch	= (Branch) branches.get(Long.toString(lorryHire.getBranchId()));
				lorryHire.setBranch(branch != null ? branch.getName() : "");

				if(lorryHire.getBalancePayableAtBranchId() > 0) {
					branch	= (Branch) branches.get(Long.toString(lorryHire.getBalancePayableAtBranchId()));
					lorryHire.setBalancePayableAtBranch(branch != null ? branch.getName() : "");
				} else
					lorryHire.setBalancePayableAtBranch("");

				if(lorryHire.getlHPVNo() == null)
					lorryHire.setlHPVNo("0");

				lorryHire.setChequeNumber(Utility.checkedNullCondition(lorryHire.getChequeNumber(), (short) 1));
				lorryHire.setBankName(Utility.checkedNullCondition(lorryHire.getBankName(), (short) 1));
				lorryHire.setExecutiveName(ExecutiveDao.getInstance().getExecutiveDetailsByExecutiveIds(Long.toString(lorryHire.getExecutiveId())).get(lorryHire.getExecutiveId()).getName());

				branch	= (Branch) branches.get(Long.toString(lorryHire.getAdvancePaidByBranchId()));
				lorryHire.setAdvancePaidByBranchName(branch != null ? branch.getName() : "");
				lorryHire.setLorrySupplierContactPerson(Utility.checkedNullCondition(lorryHire.getLorrySupplierContactPerson(), (short) 2));
				lorryHire.setPaymentTypeString(PaymentTypeConstant.getPaymentType(lorryHire.getPaymentType()));
				lorryHire.setChequeDateString(DateTimeUtility.getDateFromTimeStamp(lorryHire.getChequeDate()));
				lorryHire.setLorryHireDateTimeForUser(DateTimeUtility.getDateFromTimeStamp(lorryHire.getLorryHireDateTime()));

				if(lorryHireRouteArr != null && lorryHireRouteArr.length > 0)
					for (var i = 0; i < lorryHireRouteArr.length; i++) {
						lorryHireBranch		= (Branch) branches.get(Long.toString(lorryHireRouteArr[i].getRouteBranchId()));

						if(i == 0) {
							if(lorryHireBranch.getTypeOfLocation() == Branch.TYPE_OF_LOCATION_OPERATIONAL_PLACE)
								lorryHireHandlingBranch	= (Branch) branches.get(Long.toString(lorryHireBranch.getHandlingBranchId()));

							if(lorryHireHandlingBranch != null)
								routeBranchNameStr  = lorryHireBranch.getName() + " (" + lorryHireHandlingBranch.getName() +") ";
							else
								routeBranchNameStr  = lorryHireBranch.getName();
						} else {
							if(lorryHireBranch.getTypeOfLocation() == Branch.TYPE_OF_LOCATION_OPERATIONAL_PLACE)
								lorryHireHandlingBranch	= (Branch) branches.get(Long.toString(lorryHireBranch.getHandlingBranchId()));

							if(lorryHireHandlingBranch != null)
								routeBranchNameStr  = routeBranchNameStr + " - " + lorryHireBranch.getName() + " (" + lorryHireHandlingBranch.getName() + ") ";
							else
								routeBranchNameStr  = routeBranchNameStr + " - " + lorryHireBranch.getName();
						}
					}
			}

			if(tdsTxnDetails == null)
				tdsTxnDetails = new TDSTxnDetails();

			tdsTxnDetails.setPanNumber(StringUtils.isEmpty(tdsTxnDetails.getPanNumber()) ? "--" : tdsTxnDetails.getPanNumber());
			tdsTxnDetails.setDeclarationGivenForUser(TDSTxnDetailsConstant.getDeclarationForUser(tdsTxnDetails.getDeclarationGiven()));
			tdsTxnDetails.setCategoryForUser(TDSTxnDetailsConstant.getCategoryForUser(tdsTxnDetails.getCategory()));
			tdsTxnDetails.setOwnerName(StringUtils.isEmpty(tdsTxnDetails.getOwnerName()) ? "--" : tdsTxnDetails.getOwnerName());
			tdsTxnDetails.setContactPerson(StringUtils.isEmpty(tdsTxnDetails.getContactPerson()) ? "--" : tdsTxnDetails.getContactPerson());

			request.setAttribute("LorryHire", lorryHire);
			request.setAttribute("tdsTxnDetails", tdsTxnDetails);
			request.setAttribute("routeBranchNameStr", routeBranchNameStr);

			if(executive.getAccountGroupId() == TransCargoAccountGroupConstant.ACCOUNT_GROUP_ID_LMT)
				request.setAttribute("nextPageToken", "success_"+executive.getAccountGroupId());
			else
				request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}
	}
}
