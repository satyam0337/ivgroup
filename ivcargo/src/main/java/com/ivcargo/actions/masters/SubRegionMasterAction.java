package com.ivcargo.actions.masters;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringUtils;

import com.businesslogic.SubRegionBll;
import com.businesslogic.properties.impl.PropertyConfigValueBLLImpl;
import com.framework.Action;
import com.framework.JSPUtility;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.exception.ExceptionProcess;
import com.ivcargo.actionUtility.ActionStaticUtil;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.BranchDao;
import com.platform.dto.Executive;
import com.platform.dto.PropertiesFileConstants;
import com.platform.resource.CargoErrorList;

public class SubRegionMasterAction implements Action {

	public static final String TRACE_ID = "SubRegionMasterAction";

	@Override
	public void execute(final HttpServletRequest request, final HttpServletResponse response) {

		HashMap<String,Object>	error		= null;
		String			strResponse			= null;

		try {
			error = ActionStaticUtil.getSystemErrorColl(request);

			if(ActionStaticUtil.isSystemError(request,error))
				return;

			final var	cache 		= new CacheManip(request);
			final var	executive 	= cache.getExecutive(request);
			final var	filter 		= JSPUtility.GetInt(request, "filter", 0);

			if(executive == null)
				ActionStaticUtil.throwInvalidSessionError(request, error);

			switch (filter) {
			case 1 -> strResponse	= saveSubRegion(request, executive);
			case 2 -> strResponse	= updateSubRegion(request, executive);
			case 3 -> strResponse	= deleteSubRegion(request, executive);
			default -> {
				break;
			}
			}

			request.setAttribute("groupRegions", cache.getRegionsByGroupId(request, executive.getAccountGroupId()));
			request.setAttribute("nextPageToken", "success");

			if(filter != 0) {
				response.sendRedirect("SubRegionMaster.do?pageId=213&eventId=1&message="+strResponse);
				request.setAttribute("message",strResponse);
			}

		} catch (final Exception _e) {
			ActionStaticUtil.catchActionException(request, _e, error);
		}
	}

	/**
	 *
	 * @param request
	 * @param executive
	 * @return
	 * @throws Exception
	 */
	private String saveSubRegion(final HttpServletRequest request, final Executive executive) throws Exception {
		String						strResponse						= null;

		try {
			final var	subRegionBll				= new SubRegionBll();
			final var	valueObjectIn				= new ValueObject();
			final var	dataBaseConfig				= PropertyConfigValueBLLImpl.getInstance().getConfiguration(executive, PropertiesFileConstants.DATABASE_CONFIG_PROPERTIES);
			valueObjectIn.put("executive", executive);
			valueObjectIn.put("dataBaseConfig", dataBaseConfig);

			valueObjectIn.put("name", StringUtils.upperCase(JSPUtility.GetString(request, "name")));
			valueObjectIn.put("description", JSPUtility.GetString(request, "description"));
			valueObjectIn.put("region", JSPUtility.GetLong(request, "region"));
			valueObjectIn.put("accountGroupId", executive.getAccountGroupId());
			valueObjectIn.put("subRegionCode", StringUtils.upperCase(JSPUtility.GetString(request, "subRegionCode")));

			final var	newSubRegionId = subRegionBll.insertSubRegion(valueObjectIn);

			if(newSubRegionId > 0)
				// Update cache
				//cache.refreshCacheForSubRegion(request, executive.getAccountGroupId());
				strResponse = CargoErrorList.MASTER_DATA_INSERT_SUCCESS_DESCRIPTION;
			else
				strResponse = "SubRegion Insert"+CargoErrorList.MASTER_DATA_OPERATION_FAILURE_DESCRIPTION;

			return strResponse;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	/**
	 *
	 * @param request
	 * @param executive
	 * @return
	 * @throws Exception
	 */
	private String updateSubRegion(final HttpServletRequest request, final Executive executive) throws Exception {
		try {
			final var	subRegionBll				= new SubRegionBll();
			final var	valueObjectIn				= new ValueObject();
			final var	dataBaseConfig				= PropertyConfigValueBLLImpl.getInstance().getConfiguration(executive, PropertiesFileConstants.DATABASE_CONFIG_PROPERTIES);

			valueObjectIn.put("executive", executive);
			valueObjectIn.put("region", JSPUtility.GetLong(request, "region"));
			valueObjectIn.put("selectedSubRegionId", JSPUtility.GetLong(request, "selectedSubRegionId"));
			valueObjectIn.put("name", StringUtils.upperCase(JSPUtility.GetString(request, "name")));
			valueObjectIn.put("description", JSPUtility.GetString(request, "description"));
			valueObjectIn.put("subRegionCode", StringUtils.upperCase(JSPUtility.GetString(request, "subRegionCode")));
			valueObjectIn.put("dataBaseConfig", dataBaseConfig);

			final var	strResponse = subRegionBll.updateSubRegion(valueObjectIn);

			if(CargoErrorList.MASTER_DATA_UPDATE_SUCCESS_DESCRIPTION.equals(strResponse)) {
				// Update cache
				//cache.refreshCacheForSubRegion(request,executive.getAccountGroupId());
			}

			return strResponse;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	/**
	 *
	 * @param request
	 * @param executive
	 * @return
	 * @throws Exception
	 */
	private String deleteSubRegion(final HttpServletRequest request, final Executive executive) throws Exception {
		String						strResponse						= null;

		try {
			final var	subRegionBll				= new SubRegionBll();
			final var	valueObjectIn				= new ValueObject();
			final var	dataBaseConfig				= PropertyConfigValueBLLImpl.getInstance().getConfiguration(executive, PropertiesFileConstants.DATABASE_CONFIG_PROPERTIES);

			valueObjectIn.put("executive", executive);
			valueObjectIn.put("selectedSubRegionId", JSPUtility.GetLong(request, "selectedSubRegionId"));
			valueObjectIn.put("dataBaseConfig", dataBaseConfig);

			final var	selectSubregionId = valueObjectIn.getLong("selectedSubRegionId",0);

			final var branchList = BranchDao.getInstance().findBySubRegionId(selectSubregionId);

			if(branchList == null || branchList.length == 0)
				strResponse	= subRegionBll.deleteSubRegion(valueObjectIn);
			else
				strResponse	= "Please Delete Or Deactivate Branches Of This Sub Region First !";

			if(StringUtils.equalsIgnoreCase(CargoErrorList.MASTER_DATA_DELETE_SUCCESS_DESCRIPTION, strResponse)){
				// Update cache
				//cache.refreshCacheForSubRegion(request,executive.getAccountGroupId());
			}

			return strResponse;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}
}
