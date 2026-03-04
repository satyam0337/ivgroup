package com.ivcargo.actions;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.TreeMap;
import java.util.function.Function;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;
import com.iv.constant.properties.HeaderConfigurationConstant;
import com.iv.constant.properties.master.BranchMasterConfigurationConstant;
import com.iv.dto.constant.BranchServiceTypeConstant;
import com.iv.dto.constant.FeildPermissionsConstant;
import com.iv.dto.constant.ModuleIdentifierConstant;
import com.iv.utils.constant.Constant;
import com.iv.utils.exception.ExceptionProcess;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.actionUtility.ActionStepsUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dto.AccountGroup;
import com.platform.dto.Branch;
import com.platform.dto.Executive;
import com.platform.dto.Region;
import com.platform.dto.SubRegion;
import com.platform.dto.ViewBranchCode;
import com.platform.dto.configuration.modules.GroupConfigurationPropertiesDTO;
import com.platform.utils.Utility;

public class InitializeViewBranchCodeAction implements Action {

	public static final String TRACE_ID = "InitializeViewBranchCodeAction";

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String, Object>				error 						= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var		cache							= new CacheManip(request);
			final var		executive 						= cache.getExecutive(request);
			final var		headerConfig					= cache.getHeaderConfiguration(request, executive.getAccountGroupId());
			final boolean	showRegionBranches				= (Boolean) headerConfig.getOrDefault(HeaderConfigurationConstant.SHOW_REGION_BRANCHES, false);
			final var		branchConfiguration				= cache.getConfiguration(request, executive.getAccountGroupId(), ModuleIdentifierConstant.BRANCH_MASTER);

			if(showRegionBranches)
				reagionWiseBranches(request, executive);
			else
				cityWiseBranches(request, executive, branchConfiguration);

			request.setAttribute("branchConfiguration", branchConfiguration);

			if(showRegionBranches)
				request.setAttribute("nextPageToken", "success_region");
			else
				request.setAttribute("nextPageToken", Constant.SUCCESS);

		} catch (final Exception e) {
			ActionStepsUtil.catchActionException(request, e, error);
		}
	}

	private void reagionWiseBranches(final HttpServletRequest request, final Executive executive) throws Exception {
		try {
			final var	cache				= new CacheManip(request);
			final var	allGroupBranches	= cache.getAllGroupBranches(request, executive.getAccountGroupId());

			final var regions		= cache.getAllRegions(request);
			final var subRegions	= cache.getAllSubRegions(request);

			final List<ViewBranchCode>	viewBranchCodesList		= new ArrayList<>();

			for(final Entry<Long, Branch> entry : allGroupBranches.entrySet()) {
				final var		branch		= entry.getValue();
				final var		region		= (Region) regions.get(branch.getRegionId());
				final var		subRegion	= (SubRegion) subRegions.get(branch.getSubRegionId());

				final var viewBranchCode	= new ViewBranchCode();

				viewBranchCode.setBranchName(branch.getName());
				viewBranchCode.setRegionName(region != null && region.getName() != null ? region.getName() : "null");
				viewBranchCode.setSubregionName(subRegion != null && subRegion.getName() != null ? subRegion.getName() : "null");
				viewBranchCode.setBranchId(branch.getBranchId());
				viewBranchCode.setContactNo("" + Utility.checkedNullCondition(branch.getMobileNumber(), (short) 2) + ",<br/>"+Utility.checkedNullCondition(branch.getPhoneNumber(), (short) 2));
				viewBranchCode.setEmailId(Utility.checkedNullCondition(branch.getEmailAddress(), (short) 2));
				viewBranchCode.setAddress(Utility.checkedNullCondition(branch.getAddress(), (short) 2));
				viewBranchCode.setBranchTypeId(branch.getBranchType());
				viewBranchCode.setBranchType(Branch.getBranchType(branch.getBranchType()));

				if(branch.getStatus() == Branch.BRANCH_ACTIVE)
					viewBranchCode.setStatus("<b style='color: green;'>" + Branch.getBranchStatus(branch.getStatus()) + "</b>");
				else
					viewBranchCode.setStatus("<b style='color: red;'>" + Branch.getBranchStatus(branch.getStatus()) + "</b>");

				viewBranchCode.setLocationType(Branch.getLocationType(branch.getTypeOfLocation()));
				viewBranchCode.setAgentBranch(branch.isAgentBranch() ? "YES" : "NO");
				viewBranchCodesList.add(viewBranchCode);
			}

			final Map<String, Map<String, Map<String, ViewBranchCode>>>	regionHM	= viewBranchCodesList.stream().collect(Collectors.groupingBy(ViewBranchCode::getRegionName,
					Collectors.groupingBy(ViewBranchCode::getSubregionName, Collectors.toMap(ViewBranchCode::getBranchName, Function.identity(), (e1, e2) -> e1, TreeMap::new))));

			request.setAttribute("Region", regionHM);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private void cityWiseBranches(final HttpServletRequest request, final Executive executive, final Map<Object, Object> branchConfiguration) throws Exception {
		var									count						= 0;

		try {
			final var	cache						= new CacheManip(request);
			final var	allGroupBranches			= cache.getAllGroupBranches(request, executive.getAccountGroupId());
			final var	configuration				= cache.getGroupConfiguration(request, executive.getAccountGroupId());
			final var	genericBranches				= cache.getGenericBranchesDetail(request);
			final var	showActiveBranch  			= (boolean) branchConfiguration.getOrDefault(BranchMasterConfigurationConstant.SHOW_ACTIVE_BRANCH, false);
			final var	showAccountGroupName  		= (boolean) branchConfiguration.getOrDefault(BranchMasterConfigurationConstant.SHOW_ACCOUNT_GROUP_NAME, false);
			final var	branchNetworkConfiguration	= configuration.getBoolean(GroupConfigurationPropertiesDTO.BRANCH_NETWORK_CONFIGURATION, false);
			final var	execFldPermissions 			= cache.getExecutiveFieldPermission(request);

			final Map<Long, AccountGroup>	accountGroupHM 			= cache.getAccountGroupHM(request);
			final List<Long>				branchArrayList			= new ArrayList<>();

			branchConfiguration.put(GroupConfigurationPropertiesDTO.BRANCH_NETWORK_CONFIGURATION, branchNetworkConfiguration);

			final var regions		= cache.getAllRegions(request);
			final var subRegions	= cache.getAllSubRegions(request);

			List<ViewBranchCode>	viewBranchCodesList		= new ArrayList<>();

			for (final Map.Entry<Long, Branch> entry : allGroupBranches.entrySet()) {
				final var branch	= entry.getValue();

				if(!branch.isMarkForDelete() && !branch.isGroupBranchMfd() && branch.getCityName() != null) {
					final var		region			= (Region) regions.get(branch.getRegionId());
					final var		subRegion		= (SubRegion) subRegions.get(branch.getSubRegionId());
					final var		genericBranch 	= (Branch) genericBranches.get(Long.toString(branch.getBranchId()));

					if(genericBranch == null)
						continue;

					final var		handlingBranch 	= (Branch) genericBranches.get(Long.toString(genericBranch.getHandlingBranchId()));

					final var viewBranchCodeModel = new ViewBranchCode();

					viewBranchCodeModel.setBranchId(branch.getBranchId());
					viewBranchCodeModel.setBranchName(branch.getName());
					viewBranchCodeModel.setRegionName(region != null ? region.getName() : "");
					viewBranchCodeModel.setSubregionName(subRegion != null ? subRegion.getName() : "");
					viewBranchCodeModel.setAddress(Utility.checkedNullCondition(branch.getAddress(), (short) 2));
					viewBranchCodeModel.setPhoneNo(Utility.checkedNullCondition(branch.getPhoneNumber(), (short) 4));
					viewBranchCodeModel.setMobileNo(Utility.checkedNullCondition(branch.getMobileNumber(), (short) 4));
					viewBranchCodeModel.setPhoneNo2(Utility.checkedNullCondition(branch.getPhoneNumber2(), (short) 4));
					viewBranchCodeModel.setMobileNo2(Utility.checkedNullCondition(branch.getMobileNumber2(), (short) 4));

					viewBranchCodeModel.setContactNo(viewBranchCodeModel.getMobileNo()
							+ ", " + viewBranchCodeModel.getMobileNo2()
							+ "/ <br/>" + viewBranchCodeModel.getPhoneNo()
							+ ", " + viewBranchCodeModel.getPhoneNo2());

					if(!Utility.stringContainsNumber(viewBranchCodeModel.getContactNo()))
						viewBranchCodeModel.setContactNo("");

					viewBranchCodeModel.setEmailId(Utility.checkedNullCondition(branch.getEmailAddress(), (short) 2));
					viewBranchCodeModel.setContactPersonName(Utility.checkedNullCondition(branch.getContactPersonName(), (short) 2));
					viewBranchCodeModel.setBranchType(Branch.getBranchType(branch.getBranchType()));
					viewBranchCodeModel.setLocationType(Branch.getLocationType(branch.getTypeOfLocation()));
					viewBranchCodeModel.setBranchCode(Utility.checkedNullCondition(branch.getBranchCode(), (short) 2));

					if(handlingBranch != null)
						viewBranchCodeModel.setHandlingBranchName(Utility.checkedNullCondition(handlingBranch.getName(), (short) 1));
					else
						viewBranchCodeModel.setHandlingBranchName("--");

					if(showAccountGroupName || branchNetworkConfiguration) {
						AccountGroup accountGroup	= null;

						if(accountGroupHM != null && !accountGroupHM.isEmpty())
							accountGroup = accountGroupHM.get(subRegion != null ? subRegion.getAccountGroupId() : 0);

						if(subRegion != null && subRegion.getAccountGroupId() != executive.getAccountGroupId()) {
							viewBranchCodeModel.setGroupName("<b style='color: blue;'>" + (accountGroup != null ? accountGroup.getName() : "") + "</b>");
							count++;
						} else
							viewBranchCodeModel.setGroupName(accountGroup != null ? accountGroup.getAccountGroupCode(): "");
					}

					viewBranchCodeModel.setAgentBranch(branch.isAgentBranch() ? "YES" : "NO");
					viewBranchCodeModel.setStatus(Branch.getBranchStatus(branch.getStatus()));

					if(branch.getStatus() == Branch.BRANCH_ACTIVE)
						viewBranchCodeModel.setStatus("<b style='color: green;'>" + Branch.getBranchStatus(branch.getStatus()) + "</b>");
					else
						viewBranchCodeModel.setStatus("<b style='color: red;'>" + Branch.getBranchStatus(branch.getStatus()) + "</b>");

					viewBranchCodeModel.setCityName(branch.getCityName());
					viewBranchCodeModel.setBranchServiceTypeName(genericBranch.getBranchServiceTypeId() != null && genericBranch.getBranchServiceTypeId() > 0 ? BranchServiceTypeConstant.getBranchServiceType(genericBranch.getBranchServiceTypeId()) : "--");
					
					if(genericBranch.getParentBranchId() > 0) {
						final var parentBranhces	= (Branch) genericBranches.get(Long.toString(genericBranch.getParentBranchId()));
						if(parentBranhces != null) {
							viewBranchCodeModel.setParentBranchId(genericBranch.getParentBranchId());
							viewBranchCodeModel.setParentBranchName(parentBranhces.getName());
						}
					}
					if(showActiveBranch) {
						if(execFldPermissions.get(FeildPermissionsConstant.SHOW_ALL_BRANCHES) != null) {
							viewBranchCodesList.add(viewBranchCodeModel);
						} else {
							if(!branchArrayList.contains(branch.getBranchId()) && branch.getStatus() == Branch.BRANCH_ACTIVE) {
								branchArrayList.add(branch.getBranchId());
								viewBranchCodesList.add(viewBranchCodeModel);
							}
						}
					} else
						viewBranchCodesList.add(viewBranchCodeModel);
				}
			}

			if(viewBranchCodesList.isEmpty()) {
				final HashMap<String, Object> error = null;
				ActionStaticUtil.catchActionException(request, error, "Branch Details Not Found !");
				cache.refreshData(request, (int) ModuleIdentifierConstant.BRANCH_MASTER, executive.getAccountGroupId());
				return;
			}

			viewBranchCodesList	= viewBranchCodesList.stream().sorted(Comparator.comparing(ViewBranchCode::getBranchName)).collect(Collectors.toList());

			final Map<String, List<ViewBranchCode>> branchCode = viewBranchCodesList.stream().collect(Collectors.groupingBy(ViewBranchCode::getCityName));

			request.setAttribute("branchCode", branchCode.entrySet().stream().sorted(Map.Entry.comparingByKey()).collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue, (a, b) -> a, LinkedHashMap::new)));

			if(count <= 0) {
				branchConfiguration.put(GroupConfigurationPropertiesDTO.BRANCH_NETWORK_CONFIGURATION, false);
				branchConfiguration.put(BranchMasterConfigurationConstant.SHOW_ACCOUNT_GROUP_NAME, false);
			}
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}
}