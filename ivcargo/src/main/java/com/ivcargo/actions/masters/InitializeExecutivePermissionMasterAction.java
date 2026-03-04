package com.ivcargo.actions.masters;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringUtils;

import com.framework.Action;
import com.iv.dao.impl.AccountGroupPermissionsDaoImpl;
import com.iv.dao.impl.master.MenuGroupDaoImpl;
import com.iv.dto.constant.BusinessFunctionConstants;
import com.iv.dto.constant.ExecutiveTypeConstant;
import com.iv.dto.constant.FeildPermissionsConstant;
import com.iv.dto.constant.MenuGroupConstant;
import com.iv.dto.master.AccountGroupPermission;
import com.iv.utils.constant.AccountGroupConstant;
import com.iv.utils.utility.ListFilterUtility;
import com.iv.utils.utility.MapUtils;
import com.iv.utils.utility.SortUtils;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.ExecutiveDao;
import com.platform.dto.AccountGroup;
import com.platform.resource.CargoErrorList;

public class InitializeExecutivePermissionMasterAction implements Action {

	public static final String TRACE_ID = "InitializeExecutivePermissionMasterAction";

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {
		HashMap<String,Object>	 				error 					= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	cache					= new CacheManip(request);

			if(!ActionStaticUtil.isAllowToAccessOperation(error, cache, request, BusinessFunctionConstants.EXECUTIVE_PERMISSIONS))
				return;

			final var	executive				= cache.getExecutive(request);
			final Map<Long, AccountGroup>	accountGroupHM			= cache.getAccountGroupHM(request);
			final var isSuperGroup	= executive.getAccountGroupId() == AccountGroupConstant.ACCOUNT_GROUP_ID_IVCARGO;

			List<AccountGroupPermission>	accGrpPermissions	= null;

			if(isSuperGroup)
				accGrpPermissions 		= AccountGroupPermissionsDaoImpl.getInstance().getGetAllPermissions();
			else
				accGrpPermissions 		= AccountGroupPermissionsDaoImpl.getInstance().getByAccountGroupId(executive.getAccountGroupId());

			final var	execFldPermissions	= cache.getExecutiveFieldPermission(request);

			if (accGrpPermissions != null) {
				if(isSuperGroup && !com.iv.dto.Executive.executiveList().contains(executive.getExecutiveId()))
					accGrpPermissions		= ListFilterUtility.filterList(accGrpPermissions, e -> !BusinessFunctionConstants.configurationPermissionList().contains(e.getUniqueName()));

				accGrpPermissions			= ListFilterUtility.filterList(accGrpPermissions, AccountGroupPermission::isVisible);

				accGrpPermissions	= SortUtils.sortList(accGrpPermissions, AccountGroupPermission::getModuleName, AccountGroupPermission::getDisplayName);

				accGrpPermissions.stream().filter(acGroupPermission ->
				BusinessFunctionConstants.ADVANCED_LOADING_SHEET.equals(acGroupPermission.getUniqueName())
				|| BusinessFunctionConstants.CREATE_LHPV_ADVANCE.equals(acGroupPermission.getUniqueName())
						)
				.forEach(acGroupPermission -> {
					if (!acGroupPermission.getPermissionName().endsWith("(New)"))
						acGroupPermission.setPermissionName(acGroupPermission.getPermissionName() + " (New)");
				});

				final Map<String, List<AccountGroupPermission>> 	menuGroupFeildCollection	= MapUtils.groupByClassifier(accGrpPermissions, e -> e.getMenuGroupId() == MenuGroupConstant.MENU_GROUP_FIELDPERMISSIONS, AccountGroupPermission::getModuleName);
				final Map<Long, List<AccountGroupPermission>>		menuGroupWiseCollection		= MapUtils.groupByClassifier(accGrpPermissions, e -> e.getMenuGroupId() != MenuGroupConstant.MENU_GROUP_FIELDPERMISSIONS, AccountGroupPermission::getMenuGroupId);

				ActionStaticUtil.executiveTypeWiseSelection(request, cache, executive);

				if(executive.getExecutiveType() == ExecutiveTypeConstant.EXECUTIVE_TYPE_BRANCHADMIN)
					request.setAttribute("executiveArr", ExecutiveDao.getInstance().findByBranchId(executive.getBranchId()));

				if(isSuperGroup) {
					final var		totalDeActiveGroup	= accountGroupHM.values().stream().filter(e -> e.getStatus() == AccountGroup.GROUP_DEACTIVE
							|| e.isMarkForDelete()
							|| StringUtils.contains(e.getAccountGroupCode(), "_XX")
							|| StringUtils.contains(e.getAccountGroupCode(), "XX_")).count();

					request.setAttribute("accountGroupHM", accountGroupHM);
					request.setAttribute("totalDeActiveGroup", totalDeActiveGroup);
					request.setAttribute("totalActiveGroup", accountGroupHM.size() - totalDeActiveGroup);
				}

				ActionStaticUtil.setExecutiveTypeBooleanInRequest(request, executive);

				request.setAttribute("groupPermissions", menuGroupWiseCollection);
				request.setAttribute("groupFeildPermissions", menuGroupFeildCollection);
				request.setAttribute("menuGroupHM", MenuGroupDaoImpl.getInstance().getMenuGroupHM());
				request.setAttribute("isSuperGroup", isSuperGroup);
				request.setAttribute("showDownloadPermissionOperationButton", execFldPermissions != null && execFldPermissions.get(FeildPermissionsConstant.SHOW_DOWNLOAD_PERMISSION_OPERATION_BUTTON) != null);
				request.setAttribute("nextPageToken", "success");
			} else {
				error.put("errorCode", CargoErrorList.LOGIN_ERROR);
				error.put("errorDescription", CargoErrorList.errorDescription(CargoErrorList.GROUP_PERMISSIONS_ERROR, null));
				request.setAttribute("cargoError", error);
				request.setAttribute("nextPageToken", "failure");
			}
		} catch (final Exception e) {
			ActionStaticUtil.catchActionException(request, e, error);
		}
	}
}
