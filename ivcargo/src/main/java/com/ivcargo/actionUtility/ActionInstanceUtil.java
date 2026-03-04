package com.ivcargo.actionUtility;

import javax.servlet.http.HttpServletRequest;

import com.framework.JSPUtility;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.exception.ExceptionProcess;
import com.platform.dto.Executive;

public class ActionInstanceUtil {

	private static final String TRACE_ID 			= "ActionInstanceUtil";

	private boolean EXECUTIVE_TYPE_GROUPADMIN		= false;
	private boolean EXECUTIVE_TYPE_REGIONADMIN		= false;
	private boolean EXECUTIVE_TYPE_SUBREGIONADMIN	= false;

	/**********************	Do Not Make Any Method Static *****************************/

	//Method that set all Executive type boolans to false
	public void setDefaultValuesInAllBoolean() {
		EXECUTIVE_TYPE_GROUPADMIN		= false;
		EXECUTIVE_TYPE_REGIONADMIN		= false;
		EXECUTIVE_TYPE_SUBREGIONADMIN	= false;
	}

	//Method that check logged in executive type and set true value in perticular boolean
	private void setExecutiveTypeBoolean(final Executive executive) throws Exception {
		try {
			if(ActionStaticUtil.isExecutiveType(executive.getExecutiveType(),Executive.EXECUTIVE_TYPE_GROUPADMIN))
				EXECUTIVE_TYPE_GROUPADMIN		= true;
			else if(ActionStaticUtil.isExecutiveType(executive.getExecutiveType(),Executive.EXECUTIVE_TYPE_REGIONADMIN))
				EXECUTIVE_TYPE_REGIONADMIN		= true;
			else if(ActionStaticUtil.isExecutiveType(executive.getExecutiveType(),Executive.EXECUTIVE_TYPE_SUBREGIONADMIN))
				EXECUTIVE_TYPE_SUBREGIONADMIN	= true;
		} catch(final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	//Method that return valueobject which contains region id,subregion id,branch id on the besis  of executive type
	public ValueObject reportSelection(final HttpServletRequest request,final Executive executive) throws Exception {
		ValueObject		valObj	= null;

		try {
			setExecutiveTypeBoolean(executive);

			if(EXECUTIVE_TYPE_GROUPADMIN)
				valObj = reportSelectionForGroupAdmin(request,executive);
			else if(EXECUTIVE_TYPE_REGIONADMIN)
				valObj = reportSelectionForRegionAdmin(request,executive);
			else if(EXECUTIVE_TYPE_SUBREGIONADMIN)
				valObj = reportSelectionForSubRegionAdmin(request,executive);
			else
				valObj = reportSelectionForExecutive(request,executive);

			return valObj;
		} catch(final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		} finally {
			setDefaultValuesInAllBoolean();
		}
	}

	//Method that return valueobject which contains region id,subregion id,branch id if executive type is group admin
	public ValueObject reportSelectionForGroupAdmin(final HttpServletRequest request,final Executive executive) throws Exception {
		try {
			final var	valObj 		= new ValueObject();
			valObj.put("regionId", JSPUtility.GetLong(request, "region", 0));
			valObj.put("subRegionId", JSPUtility.GetLong(request, "subRegion", 0));
			valObj.put("branchId", JSPUtility.GetLong(request, "branch", 0));

			// Get Combo values to restore
			ActionStaticUtil.getSubRegionsByRegionId(request, JSPUtility.GetLong(request, "region", 0), executive.getAccountGroupId(), true);
			ActionStaticUtil.getPhysicalBranchesBySubRegionId(request, executive.getAccountGroupId(), JSPUtility.GetLong(request, "subRegion", 0), true);

			return valObj;
		} catch(final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	//Method that return valueobject which contains region id,subregion id,branch id if executive type is region admin
	public ValueObject reportSelectionForRegionAdmin(final HttpServletRequest request,final Executive executive) throws Exception {
		try {
			final var	valObj 		= new ValueObject();
			valObj.put("regionId", executive.getRegionId());
			valObj.put("subRegionId", JSPUtility.GetLong(request, "subRegion", 0));
			valObj.put("branchId", JSPUtility.GetLong(request, "branch", 0));

			// Get Combo values to restore
			ActionStaticUtil.getSubRegionsByRegionId(request, executive.getRegionId(), executive.getAccountGroupId(), true);
			ActionStaticUtil.getPhysicalBranchesBySubRegionId(request, executive.getAccountGroupId(), JSPUtility.GetLong(request, "subRegion", 0), true);

			return valObj;
		} catch(final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	//Method that return valueobject which contains region id,subregion id,branch id if executive type is sub region admin
	public ValueObject reportSelectionForSubRegionAdmin(final HttpServletRequest request,final Executive executive) throws Exception {
		try {
			final var	valObj 		= new ValueObject();
			valObj.put("regionId", executive.getRegionId());
			valObj.put("subRegionId", executive.getSubRegionId());
			valObj.put("branchId", JSPUtility.GetLong(request, "branch", 0));

			// Get Combo values to restore
			if(request.getAttribute(ActionStaticUtil.IS_BOTH_TYPE_BRANCHES_NEEDED) != null)
				ActionStaticUtil.getBothTypeBranchesBySubRegionId(request, executive.getAccountGroupId(), executive.getSubRegionId(), true);
			else
				ActionStaticUtil.getPhysicalBranchesBySubRegionId(request, executive.getAccountGroupId(), executive.getSubRegionId(), true);

			return valObj;
		} catch(final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	//Method that return valueobject which contains region id,subregion id,branch id if executive type is executive
	public ValueObject reportSelectionForExecutive(final HttpServletRequest request,final Executive executive) throws Exception {
		try {
			final var	valObj 		= new ValueObject();
			valObj.put("regionId", executive.getRegionId());
			valObj.put("subRegionId", executive.getSubRegionId());
			valObj.put("branchId", executive.getBranchId());

			return valObj;
		} catch(final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	//Method that set executive type boolean & pre selection(region name,sub region name,branch name) of report in request
	public void setExecutiveTypeBooleanInRequest(final HttpServletRequest request, final Executive executive, final boolean isUserPreSelectionNeeded) throws Exception {
		try {
			setExecutiveTypeBoolean(executive);

			switch (executive.getExecutiveType()) {
			case Executive.EXECUTIVE_TYPE_GROUPADMIN -> setGroupAdminBooleanInRequest(request, executive);
			case Executive.EXECUTIVE_TYPE_REGIONADMIN -> {
				setRegionAdminBooleanInRequest(request, executive);

				if(isUserPreSelectionNeeded)
					ActionStaticUtil.setRequestAttribute(request, ActionStaticUtil.PRESELECTED_REGION_NAME, executive.getRegionName());
			}
			case Executive.EXECUTIVE_TYPE_SUBREGIONADMIN -> {
				setSubRegionAdminBooleanInRequest(request, executive);

				if(isUserPreSelectionNeeded) {
					ActionStaticUtil.setRequestAttribute(request, ActionStaticUtil.PRESELECTED_REGION_NAME, executive.getRegionName());
					ActionStaticUtil.setRequestAttribute(request, ActionStaticUtil.PRESELECTED_SUBREGION_NAME, executive.getSubRegionName());
				}
			}
			case Executive.EXECUTIVE_TYPE_BRANCHADMIN, Executive.EXECUTIVE_TYPE_EXECUTIVE -> {
				setExecutiveBooleanInRequest(request, executive);

				if(isUserPreSelectionNeeded) {
					ActionStaticUtil.setRequestAttribute(request, ActionStaticUtil.PRESELECTED_REGION_NAME, executive.getRegionName());
					ActionStaticUtil.setRequestAttribute(request, ActionStaticUtil.PRESELECTED_SUBREGION_NAME, executive.getSubRegionName());
					ActionStaticUtil.setRequestAttribute(request, ActionStaticUtil.PRESELECTED_BRANCH_NAME, executive.getBranchName());
				}
			}
			}
		} catch(final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		} finally {
			setDefaultValuesInAllBoolean();
		}
	}

	//Method that set group admin boolean in request attribute
	public void setGroupAdminBooleanInRequest(final HttpServletRequest request,final Executive executive) throws Exception {
		try {
			ActionStaticUtil.setRequestAttribute(request, Executive.EXECUTIVE_TYPE_NAME_GROUPADMIN, true);
			ActionStaticUtil.setRequestAttribute(request, Executive.EXECUTIVE_TYPE_NAME_REGIONADMIN, false);
			ActionStaticUtil.setRequestAttribute(request, Executive.EXECUTIVE_TYPE_NAME_SUBREGIONADMIN, false);
			ActionStaticUtil.setRequestAttribute(request, Executive.EXECUTIVE_TYPE_NAME_AGENCYADMIN, false);
			ActionStaticUtil.setRequestAttribute(request, Executive.EXECUTIVE_TYPE_NAME_BRANCHADMIN, false);
			ActionStaticUtil.setRequestAttribute(request, Executive.EXECUTIVE_TYPE_NAME_EXECUTIVE, false);
		} catch(final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	//Method that set region admin boolean in request attribute
	public void setRegionAdminBooleanInRequest(final HttpServletRequest request,final Executive executive) throws Exception {
		try {
			ActionStaticUtil.setRequestAttribute(request, Executive.EXECUTIVE_TYPE_NAME_GROUPADMIN, false);
			ActionStaticUtil.setRequestAttribute(request, Executive.EXECUTIVE_TYPE_NAME_REGIONADMIN, true);
			ActionStaticUtil.setRequestAttribute(request, Executive.EXECUTIVE_TYPE_NAME_SUBREGIONADMIN, false);
			ActionStaticUtil.setRequestAttribute(request, Executive.EXECUTIVE_TYPE_NAME_AGENCYADMIN, false);
			ActionStaticUtil.setRequestAttribute(request, Executive.EXECUTIVE_TYPE_NAME_BRANCHADMIN, false);
			ActionStaticUtil.setRequestAttribute(request, Executive.EXECUTIVE_TYPE_NAME_EXECUTIVE, false);
		} catch(final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	//Method that set sub region admin boolean in request attribute
	public void setSubRegionAdminBooleanInRequest(final HttpServletRequest request,final Executive executive) throws Exception {
		try {
			ActionStaticUtil.setRequestAttribute(request, Executive.EXECUTIVE_TYPE_NAME_GROUPADMIN, false);
			ActionStaticUtil.setRequestAttribute(request, Executive.EXECUTIVE_TYPE_NAME_REGIONADMIN, false);
			ActionStaticUtil.setRequestAttribute(request, Executive.EXECUTIVE_TYPE_NAME_SUBREGIONADMIN, true);
			ActionStaticUtil.setRequestAttribute(request, Executive.EXECUTIVE_TYPE_NAME_AGENCYADMIN, false);
			ActionStaticUtil.setRequestAttribute(request, Executive.EXECUTIVE_TYPE_NAME_BRANCHADMIN, false);
			ActionStaticUtil.setRequestAttribute(request, Executive.EXECUTIVE_TYPE_NAME_EXECUTIVE, false);
		} catch(final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	//Method that set agency admin boolean in request attribute
	public void setAgencyAdminBooleanInRequest(final HttpServletRequest request,final Executive executive) throws Exception {
		try {
			ActionStaticUtil.setRequestAttribute(request, Executive.EXECUTIVE_TYPE_NAME_GROUPADMIN, false);
			ActionStaticUtil.setRequestAttribute(request, Executive.EXECUTIVE_TYPE_NAME_REGIONADMIN, false);
			ActionStaticUtil.setRequestAttribute(request, Executive.EXECUTIVE_TYPE_NAME_SUBREGIONADMIN, false);
			ActionStaticUtil.setRequestAttribute(request, Executive.EXECUTIVE_TYPE_NAME_AGENCYADMIN, true);
			ActionStaticUtil.setRequestAttribute(request, Executive.EXECUTIVE_TYPE_NAME_BRANCHADMIN, false);
			ActionStaticUtil.setRequestAttribute(request, Executive.EXECUTIVE_TYPE_NAME_EXECUTIVE, false);
		} catch(final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	//Method that set executive boolean in request attribute
	public void setExecutiveBooleanInRequest(final HttpServletRequest request,final Executive executive) throws Exception {
		try {
			ActionStaticUtil.setRequestAttribute(request, Executive.EXECUTIVE_TYPE_NAME_GROUPADMIN, false);
			ActionStaticUtil.setRequestAttribute(request, Executive.EXECUTIVE_TYPE_NAME_REGIONADMIN, false);
			ActionStaticUtil.setRequestAttribute(request, Executive.EXECUTIVE_TYPE_NAME_SUBREGIONADMIN, false);
			ActionStaticUtil.setRequestAttribute(request, Executive.EXECUTIVE_TYPE_NAME_AGENCYADMIN, false);
			ActionStaticUtil.setRequestAttribute(request, Executive.EXECUTIVE_TYPE_NAME_BRANCHADMIN, true);
			ActionStaticUtil.setRequestAttribute(request, Executive.EXECUTIVE_TYPE_NAME_EXECUTIVE, true);
		} catch(final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}
}