package com.ivcargo.actionUtility;

public class ActionErrors {

	public static final int    ACTION_CLASS_ERROR    			= 1;
	public static final String ACTION_CLASS_ERROR_DESCRIPTION 	= "System Got Error From Action Class";
	
	public static final int    EXECUTIVE_DETAILS_ERROR    		= 2;
	public static final String EXECUTIVE_DETAILS_DESCRIPTION 	= "System Can Not Get Executive Details From Session";
	
	public static final int    REGION_DETAILS_ERROR    		= 3;
	public static final String REGION_DETAILS_DESCRIPTION 	= "System Can Not Get Region Details From Cache";

	public static final int    SUBREGION_DETAILS_ERROR    		= 4;
	public static final String SUBREGION_DETAILS_DESCRIPTION 	= "System Can Not Get Subregion Details From Cache";

	public static final int    BRANCH_DETAILS_ERROR    		= 5;
	public static final String BRANCH_DETAILS_DESCRIPTION 	= "System Can Not Get Branch Details From Cache";

	public static final int    PHYSICAL_BRANCH_DETAILS_ERROR    		= 6;
	public static final String PHYSICAL_BRANCH_DETAILS_DESCRIPTION 	= "System Can Not Get Physical Branches For Group Details From Cache";

	public static final int    REQUEST_ATTRIBUTE_ERROR    		= 7;
	public static final String REQUEST_ATTRIBUTE_DESCRIPTION 	= "System Can Not Set Attribute In Request";

	public static final int    NEXT_PAGE_TOKEN_ERROR    		= 8;
	public static final String NEXT_PAGE_TOKEN_DESCRIPTION 	= "System Can Not Set Next Page Token";

	public static final int    EXECUTIVE_FEILD_PERMISSIONS_ERROR    		= 9;
	public static final String EXECUTIVE_FEILD_PERMISSIONS_DESCRIPTION 	= "System Can Not Get Executive Feild Permissions From Session";

	public static final int    EXECUTIVE_FEILD_PERMISSION_NOT_GET_ERROR    		= 10;
	public static final String EXECUTIVE_FEILD_PERMISSION_NOT_GET_DESCRIPTION 	= "System Can Not Get Executive Feild Permission";

	public static final int    MULTI_EXECUTIVE_FEILD_PERMISSION_ERROR    		= 11;
	public static final String MULTI_EXECUTIVE_FEILD_PERMISSION_DESCRIPTION 	= "System Can Not Set Flags For Multiple Executive Feild Permission";

	public static final int    EXECUTIVE_FEILD_PERMISSION_NOT_SET_ERROR    		= 12;
	public static final String EXECUTIVE_FEILD_PERMISSION_NOT_SET_DESCRIPTION 	= "System Can Not Set Executive Feild Permission In Request";

	public static final int    COMPARE_EXECUTIVE_TYPE_ERROR    		= 13;
	public static final String COMPARE_EXECUTIVE_TYPE_DESCRIPTION 	= "System Got Problem With Comparing Executive Type";

	public static final int    ERROR_COLLECTION_NOT_GET_ERROR    		= 14;
	public static final String ERROR_COLLECTION_NOT_GET_DESCRIPTION 	= "System Got Error While Get Error Collection From Request";

	public static final int    EXECUTIVE_TYPE_SET_ERROR    		= 15;
	public static final String EXECUTIVE_TYPE_SET_DESCRIPTION 	= "System Can Not Set Executive Type Boolean";

	public static final int    SET_GROUP_ADMIN_BOOLEAN_ERROR    		= 16;
	public static final String SET_GROUP_ADMIN_BOOLEAN_DESCRIPTION 	= "Error While Set Group Admin Boolean In Request";

	public static final int    SET_REGION_ADMIN_BOOLEAN_ERROR    		= 17;
	public static final String SET_REGION_ADMIN_BOOLEAN_DESCRIPTION 	= "Error while set Region Admin Boolean In Request";
	
	public static final int    SET_SUBREGION_ADMIN_BOOLEAN_ERROR    		= 18;
	public static final String SET_SUBREGION_ADMIN_BOOLEAN_DESCRIPTION 	= "Error while set SubRegion Admin Boolean In Request";
	
	public static final int    SET_EXECUTIVE_BOOLEAN_ERROR    		= 19;
	public static final String SET_EXECUTIVE_BOOLEAN_DESCRIPTION 	= "Error while set Executive Boolean In Request";

	public static final int    CATCH_ACTION_EXCEPTION_ERROR    		= 20;
	public static final String CATCH_ACTION_EXCEPTION_DESCRIPTION 	= "System Can Not Catch Exception From Action";

	public static final int    BRANCH_IDS_ERROR    		= 21;
	public static final String BRANCH_IDS_DESCRIPTION 	= "System Can Not Get Brnach Ids From Cache";
}