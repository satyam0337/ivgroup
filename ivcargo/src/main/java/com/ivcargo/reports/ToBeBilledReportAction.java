package com.ivcargo.reports;

import java.util.HashMap;
import java.util.TreeMap;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.ObjectUtils;

import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.dao.impl.reports.account.ToBeBilledReportDaoImpl;
import com.iv.dto.model.reports.account.ToBeBilledReport;
import com.iv.utils.DateTime.DateTimeUtility;
import com.iv.utils.utility.CollectionUtility;
import com.iv.utils.utility.SortUtils;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.CustomGroupMapper;
import com.platform.resource.CargoErrorList;

public class ToBeBilledReportAction implements Action {

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	 							error 				= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			new InitializeToBeBilledReportAction().execute(request, response);

			final var	fromDate	= DateTimeUtility.getStartOfDayTimeStamp(JSPUtility.GetString(request, "fromDate"));
			final var	toDate		= DateTimeUtility.getEndOfDayTimeStamp(JSPUtility.GetString(request, "toDate"));
			final var	cache		= new CacheManip(request);
			final var	executive	= cache.getExecutive(request);

			var 	srcBranchId	= JSPUtility.GetLong(request, "branch", 0);

			request.setAttribute("isListAll", false);
			ActionStaticUtil.executiveTypeWiseBranches(request, cache, executive);

			final var	branchesIds	= ActionStaticUtil.getPhysicalBranchIds(request, cache, executive);

			// Get the Selected Combo values
			if(srcBranchId <= 0)
				srcBranchId = executive.getBranchId();

			request.setAttribute("agentName", executive.getName());

			var	reportModel = ToBeBilledReportDaoImpl.getInstance().getToBeBilledDetails(executive.getAccountGroupId(), fromDate, toDate, branchesIds);

			if(ObjectUtils.isNotEmpty(reportModel)) {
				for (final ToBeBilledReport element : reportModel) {
					var	branch = cache.getGenericBranchDetailCache(request, element.getBillBranchId());
					final var	subRegion = cache.getGenericSubRegionById(request, branch.getSubRegionId());

					element.setBillBranch(branch.getName());
					element.setBillSubRegionId(branch.getSubRegionId());
					element.setBillSubRegionName(subRegion.getName());
					element.setBookingDateTimeStr(DateTimeUtility.getDateFromTimeStampWithAMPM(element.getBookingDateTime()));
					element.setBillDateTimeStr(DateTimeUtility.getDateFromTimeStampWithAMPM(element.getBillDateTime()));

					branch	= cache.getGenericBranchDetailCache(request, element.getSourceBranchId());
					element.setSourceBranch(branch.getName());

					branch	= cache.getGenericBranchDetailCache(request, element.getDestinationBranchId());
					element.setDestinationBranch(branch.getName());
				}

				reportModel	= SortUtils.sortList(reportModel, ToBeBilledReport::getBillSubRegionName, ToBeBilledReport::getBillBranch);

				request.setAttribute("subRegionWiseData", reportModel.stream().collect(Collectors.groupingBy(ToBeBilledReport::getBillSubRegionWithId,
						Collectors.groupingBy(ToBeBilledReport::getBillBranchWithId, TreeMap::new, CollectionUtility.getList()))));
			} else {
				error.put("errorCode", CargoErrorList.REPORT_NOTFOUND);
				error.put("errorDescription", CargoErrorList.REPORT_ERROR_DESCRIPTION);
				request.setAttribute("cargoError", error);
			}

			ActionStaticUtil.setRequestAttribute(request,"customAddressBranchId", srcBranchId);
			ActionStaticUtil.setRequestAttribute(request,"customAddressIdentifer", CustomGroupMapper.IDENTIFIER_BOOKING);
			ActionStaticUtil.setReportViewModel(request);

			request.setAttribute("nextPageToken", "success");
		} catch (final Exception _e) {
			ActionStaticUtil.catchActionException(request, _e, error);
		}
	}
}