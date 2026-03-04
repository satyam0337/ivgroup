package com.ivcargo.actions.webservice;

import java.io.PrintWriter;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringUtils;
import org.json.JSONArray;
import org.json.JSONObject;

import com.framework.Action;
import com.iv.dto.combobox.BranchComboboxModel;
import com.iv.utils.constant.Constant;
import com.iv.utils.utility.CollectionUtility;
import com.iv.utils.utility.ListFilterUtility;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.model.ComboboxModel;
import com.platform.dto.Branch;

/**
 * Initialize the module
 */
public class GetSourceAndDestinationBranchesAction implements Action {
	public static final String TRACE_ID = GetSourceAndDestinationBranchesAction.class.getName();

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {

		HashMap<String, Object> 	error 				= null;
		PrintWriter					out					= null;
		var 						filter				= 0;

		try {
			// check if request consist of any error in request object
			error = ActionStaticUtil.getSystemErrorColl(request);

			// check for session if valid then only proceed and if there is any
			// system error
			if (ActionStaticUtil.isSystemError(request, error))
				return;

			final var	cache = new CacheManip(request);
			final var 	executive 	 = cache.getExecutive(request);

			if(request.getParameter("filter")!=null)
				filter =Integer.parseInt(request.getParameter("filter"));

			final var	jsonArray = new JSONArray();
			final var	jsonObject = new JSONObject();

			final var	allGroupBranches = cache.getAllGroupBranches(request, executive.getAccountGroupId());

			switch (filter) {
			case 1 -> {
				final var	query	= request.getParameter(Constant.AUTOCOMPLETE_AND_DROPDOWN_REQUEST_PARAM);
				List<Branch>	branchList	= allGroupBranches.values().stream().filter(e -> !e.isMarkForDelete() && e.getStatus() == Branch.BRANCH_ACTIVE
						&& e.getBranchType() == Branch.BRANCH_TYPE_BOOKING_DELIVERY_BOTH || e.getBranchType() == Branch.BRANCH_TYPE_DELIVERY
						&& e.getBranchId() != executive.getBranchId())

						.collect(CollectionUtility.getList());

				if(query != null)
					branchList		= ListFilterUtility.filterList(branchList, e -> StringUtils.contains(StringUtils.lowerCase(e.getName()), StringUtils.lowerCase(query)));

				branchList.sort(Comparator.comparing(Branch::getName));

				branchList.forEach((final Branch branch) -> {
					final var	branchComboboxModel	= new BranchComboboxModel();
					branchComboboxModel.setBranchId(branch.getBranchId());
					branchComboboxModel.setBranchName(branch.getName());
					jsonArray.put(new JSONObject(branchComboboxModel));
				});

				jsonObject.put(Constant.AUTOCOMPLETE_AND_DROPDOWN_RESULT, jsonArray);
				jsonObject.put(Constant.AUTOCOMPLETE_AND_DROPDOWN_COUNT, jsonArray.length());
			}
			case 2 -> {
				final var branchId	= Long.parseLong(request.getParameter(Constant.BRANCH_ID));
				final var branch	= cache.getGenericBranchDetailCache(request, branchId);
				final var subRegion	= cache.getGenericSubRegionById(request, branch.getSubRegionId());

				jsonObject.put("id", cache.getDestinationIdStrWithLocation(branch) + "_" + branch.getAccountGroupId()
				+ "_" + branch.getBranchCode() + "_" + branch.getSubRegionId() + "_" + branch.getPincode() + "_" + branch.getRegionId());

				jsonObject.put("label", branch.getName());
				jsonObject.put("branch", new JSONObject(branch));
				jsonObject.put("subRegion", subRegion != null ? new JSONObject(subRegion) : new JSONObject());
			}
			default -> {
				allGroupBranches.keySet().stream().mapToLong(Long::valueOf).forEach((final var key) -> {
					final var	comboboxModel = new ComboboxModel();
					comboboxModel.setId(key);
					comboboxModel.setName(allGroupBranches.get(key).getName());

					jsonArray.put(new JSONObject(comboboxModel));
				});

				jsonObject.put("sourceBranchList", jsonArray);
				jsonObject.put("destinationBranchList", jsonArray);
			}
			}

			out = response.getWriter();

			out.println(jsonObject);
			out.flush();
		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		} finally {
			if(out != null) out.close();
			error = null;
		}
	}
}