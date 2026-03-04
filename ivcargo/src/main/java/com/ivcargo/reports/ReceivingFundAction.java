package com.ivcargo.reports;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.StringJoiner;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.ObjectUtils;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.dto.constant.ExecutiveTypeConstant;
import com.iv.dto.constant.FeildPermissionsConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.dto.model.CommonReportDataDto;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.constant.Constant;
import com.iv.utils.constant.properties.FundReceiveConfigurationConstant;
import com.iv.utils.constant.properties.FundTransferPropertiesConstant;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.utility.MapUtils;
import com.iv.utils.utility.SortUtils;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.FundTransferDAO;
import com.platform.dto.Branch;
import com.platform.dto.ConfigParam;
import com.platform.dto.Executive;
import com.platform.dto.FundTransfer;
import com.platform.resource.CargoErrorList;


public class ReceivingFundAction implements Action {

	@SuppressWarnings("unchecked")
	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	 		error 								= null;
		var								regionId							= 0L;
		var								subRegionId							= 0L;
		String							previousDate						= null;
		var								noOfDays							= 0;
		var 							allowBackDateInFundReceive			= false;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	cache 		= new CacheManip(request);
			final var	executive 	= cache.getExecutive(request);
			final var	filter 		= JSPUtility.GetInt(request, "filter", 0);
			final var	branches		= cache.getGenericBranchesDetail(request);

			final List<FundTransfer>	fundReceiveAndTransferArrList	= new ArrayList<>();

			final var	fundReceiveConfig		= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.FUND_RECEIVE);
			final var	fundTransferConfig		= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.FUND_TRANSFER);

			final var	branchSelectionWiseFundReceiveAllow	= (boolean) fundReceiveConfig.getOrDefault(FundReceiveConfigurationConstant.BRANCH_SELECTION_WISE_FUNCD_RECEIVE_ALLOW, false);
			final var	execFeildPermission			= cache.getExecutiveFieldPermission(request);

			if(execFeildPermission.get(FeildPermissionsConstant.ALLOW_BACK_DATE_IN_FUND_RECEIVING) != null){
				noOfDays 		= cache.getConfigValue(request, executive.getAccountGroupId(), ConfigParam.CONFIG_KEY_MAX_DAYS_OF_OPERATION_BEFORE_CASHSTATEMENT_ENTRY_ID);
				previousDate	= DateTimeUtility.getDateBeforeNoOfDays(noOfDays);
				allowBackDateInFundReceive = true;
			}

			final var	allowBankToBranchOption					= (boolean) fundTransferConfig.getOrDefault(FundTransferPropertiesConstant.ALLOW_BANK_TO_BRANCH_OPTION,false);
			final var	isAllowFundRejectEntryCreditSide		= (boolean) fundTransferConfig.getOrDefault(FundTransferPropertiesConstant.IS_ALLOW_FUND_REJECT_ENTRY_CREDIT_SIDE,false);
			final var	accountGroupId							= (int) fundTransferConfig.getOrDefault(Constant.ACCOUNT_GROUP_ID,0);

			if (filter == 1) {
				final var commonReportDataDto  = new CommonReportDataDto();

				if(branchSelectionWiseFundReceiveAllow && executive.getExecutiveType() != ExecutiveTypeConstant.EXECUTIVE_TYPE_EXECUTIVE
						&& executive.getExecutiveType() != ExecutiveTypeConstant.EXECUTIVE_TYPE_BRANCHADMIN) {
					regionId 	= JSPUtility.GetLong(request, "region", 0);
					subRegionId = JSPUtility.GetLong(request, "subRegion", 0);

					commonReportDataDto.setRegionId(regionId);
					commonReportDataDto.setSubRegionId(subRegionId);
					commonReportDataDto.setSourceBranchId(JSPUtility.GetLong(request, "branch", 0));
				} else {
					commonReportDataDto.setRegionId(executive.getRegionId());
					commonReportDataDto.setSubRegionId(executive.getSubRegionId());
					commonReportDataDto.setSourceBranchId(executive.getBranchId());
				}

				var	fundTransferArr		= FundTransferDAO.getInstance().getFundTransferDetailsByWhereClause(getWhereClauseForPendingFundReceive(commonReportDataDto, executive, (short) 1), (short) 1);

				if(ObjectUtils.isNotEmpty(fundTransferArr))
					setFundDetails(fundTransferArr, branches, fundReceiveAndTransferArrList);

				fundTransferArr		= FundTransferDAO.getInstance().getFundTransferDetailsByWhereClause(getWhereClauseForPendingFundReceive(commonReportDataDto, executive, (short) 2), (short) 2);

				if(ObjectUtils.isNotEmpty(fundTransferArr))
					setFundDetails(fundTransferArr, branches, fundReceiveAndTransferArrList);

				if(allowBankToBranchOption) {
					fundTransferArr		= FundTransferDAO.getInstance().getFundTransferDetailsByWhereClause(getWhereClauseForPendingFundReceive(commonReportDataDto, executive, (short) 3), (short) 3);

					if(ObjectUtils.isNotEmpty(fundTransferArr))
						setFundDetails(fundTransferArr, branches, fundReceiveAndTransferArrList);
				}

				request.setAttribute("branchId", commonReportDataDto.getSourceBranchId());
				List<FundTransfer> newList = null;

				if(!fundReceiveAndTransferArrList.isEmpty()) {
					final Map<Long, FundTransfer> uniqueMap = MapUtils.toMap(fundReceiveAndTransferArrList, FundTransfer::getFundTransferId);

					newList	= SortUtils.sortListDesc(uniqueMap.values(), FundTransfer::getDateTimeStamp);
				}

				if(ObjectUtils.isEmpty(newList)) {
					error.put("errorCode", CargoErrorList.NO_RECORDS);
					error.put("errorDescription", CargoErrorList.NO_RECORDS_DESCRIPTION);
					request.setAttribute("cargoError", error);
				} else
					request.setAttribute("fundTransferAndReceiveArr", newList);
			}

			if(branchSelectionWiseFundReceiveAllow) {
				if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_GROUPADMIN) {
					request.setAttribute("regionForGroup", cache.getRegionsByGroupId(request, executive.getAccountGroupId()));
					request.setAttribute("subRegionForGroup", cache.getSubRegionsByRegionId(request, regionId, executive.getAccountGroupId()));
					request.setAttribute("subRegionBranches", cache.getPhysicalBranchesBySubRegionId(request, executive.getAccountGroupId(), subRegionId));
				} else if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_REGIONADMIN) {
					request.setAttribute("subRegionBranches", cache.getPhysicalBranchesBySubRegionId(request, executive.getAccountGroupId(), subRegionId));
					request.setAttribute("subRegionForGroup", cache.getSubRegionsByRegionId(request, executive.getRegionId(), executive.getAccountGroupId()));
				} else if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_SUBREGIONADMIN) {
					final var 		execBranch 			= cache.getBranchById(request, executive.getAccountGroupId(), executive.getBranchId());
					request.setAttribute("subRegionBranches", cache.getPhysicalBranchesBySubRegionId(request, execBranch.getAccountGroupId(), execBranch.getSubRegionId()));
				}

				request.setAttribute(ActionStaticUtil.IS_ALL_REGION_NEED_TO_SHOW, (boolean) fundTransferConfig.getOrDefault(FundTransferPropertiesConstant.SHOW_ALL_OPTION_IN_FUND_RECEIVE, false));
				request.setAttribute(ActionStaticUtil.IS_ALL_AREA_NEED_TO_SHOW, (boolean) fundTransferConfig.getOrDefault(FundTransferPropertiesConstant.SHOW_ALL_OPTION_IN_FUND_RECEIVE, false));
				request.setAttribute(ActionStaticUtil.IS_ALL_BRANCHES_NEED_TO_SHOW, true);

				ActionStaticUtil.setExecutiveTypeBooleanInRequest(request, executive, true);
			}

			request.setAttribute("previousDate", previousDate);
			request.setAttribute("execFeildPermission", execFeildPermission);
			request.setAttribute("noOfDays", noOfDays);
			request.setAttribute("allowBackDateInFundReceive", allowBackDateInFundReceive);
			request.setAttribute("isAllowFundRejectEntryCreditSide", isAllowFundRejectEntryCreditSide);
			request.setAttribute("accountGroupId", accountGroupId);
			request.setAttribute(FundReceiveConfigurationConstant.BRANCH_SELECTION_WISE_FUNCD_RECEIVE_ALLOW, branchSelectionWiseFundReceiveAllow);

			request.setAttribute("nextPageToken", "success");
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}

	private void setFundDetails(final List<FundTransfer> fundTransferArr, final ValueObject branches, final List<FundTransfer> fundReceiveAndTransferArrList) throws Exception {
		if(fundTransferArr != null)
			for (final FundTransfer element : fundTransferArr) {
				final var	fromBranch	= (Branch) branches.get(Long.toString(element.getFromBranchId()));
				final var	toBranch	= (Branch) branches.get(Long.toString(element.getToBranchId()));

				element.setFromBranchName(fromBranch.getName());
				element.setToBranchName(toBranch.getName());
				element.setDateTimeStampStr(DateTimeUtility.getDateFromTimeStamp(element.getDateTimeStamp()));

				fundReceiveAndTransferArrList.add(element);
			}
	}

	private String getWhereClauseForPendingFundReceive(final CommonReportDataDto commonReportDataDto, final Executive executive, final short filter) throws Exception {
		final var whereClause = new StringJoiner(" AND ");

		try {
			whereClause.add("ft.TxnAccountGroupId = " + executive.getAccountGroupId());

			if (commonReportDataDto.getRegionId() > 0)
				whereClause.add("br.RegionId = " + commonReportDataDto.getRegionId());

			if (commonReportDataDto.getSubRegionId() > 0)
				whereClause.add("br.SubRegionId = " + commonReportDataDto.getSubRegionId());

			switch (filter) {
			case 1:
				if (commonReportDataDto.getSourceBranchId() > 0)
					whereClause.add("ft.ToBranchId = " + commonReportDataDto.getSourceBranchId() + " AND ft.BranchId <> " + commonReportDataDto.getSourceBranchId());

				whereClause.add("ft.Status IN(1,2)");

				break;
			case 2:
				if (commonReportDataDto.getSourceBranchId() > 0)
					whereClause.add("ft.FromBranchId = " + commonReportDataDto.getSourceBranchId() + " AND ft.BranchId <> " + commonReportDataDto.getSourceBranchId());

				whereClause.add("ft.Status = 2");

				break;
			case 3:
				if (commonReportDataDto.getSourceBranchId() > 0)
					whereClause.add("ft.ToBranchId = " + commonReportDataDto.getSourceBranchId());

				whereClause.add("ft.Status IN(1,2)");
				whereClause.add("ft.TransferType = 5");

				break;
			default:
				break;
			}
		} catch (final Exception e) {

		}

		return whereClause.toString();
	}
}