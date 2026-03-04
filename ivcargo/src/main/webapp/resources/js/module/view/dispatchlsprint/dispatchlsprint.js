define(['JsonUtility',
        //jsonutility consist of ajax calls to send json object as an ajax hit to the url specified and get call back as specified
        'messageUtility',
        PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js',
        // to get parameter from url to send it to ws
        PROJECT_IVUIRESOURCES+'/resources/js/module/view/dispatchlsprint/dispatchlsprintsetup.js'
        ],
        function(JsonUtility, MessageUtility, UrlParameter, LSPrintSetUp) {
	'use strict';// this basically give strictness to this specific js
	var 
	masterId = "0",
	jsonObject	= new Object(),
	lsPrintConfig,
	lsPrintHeader,
	lsPrintLRSummary,
	lsPrintLSTotalDetails,
	lsPrintApplyCss,
	_this = '';
	//this is used to get the access of key in onRender because this keyword is not found in onRender function
	return Marionette.LayoutView.extend({
		initialize: function(masterObj){
			//masterid is fetched and passed when the view is called and it is set to fetch it from webservice
			masterId = UrlParameter.getModuleNameFromParam(MASTERID)
			//initialize is the first function called on call new view()
			_this = this;
		},
		render: function() {
			
			jsonObject.dispatchLedgerId = masterId;
			getJSON(jsonObject, WEB_SERVICE_URL + '/dispatchWs/getLoadingSheetPrintByDispatchLedgerId.do?', _this.onGetLSPrintByDLId, EXECUTE_WITHOUT_ERROR);

			return _this;
		},
		onGetLSPrintByDLId : function(response) {
			hideLayer();
			lsPrintConfig			= LSPrintSetUp.setPageViewConfig(response.SetUpConfig, _this);
			lsPrintHeader			= LSPrintSetUp.setLSHeader(response.dispatchLSHeader, response.PrintHeaderModel, _this);
			lsPrintLRSummary		= LSPrintSetUp.setLRSummary(response.dispatchLRSummary, response.configuration, response.dispatchLSHeader, response.PrintHeaderModel, _this);
			lsPrintLSTotalDetails	= LSPrintSetUp.setLSTotalSummary(response.dispatchLSTotalSummary,_this);
			lsPrintApplyCss			= LSPrintSetUp.applyCSS(response.SetUpConfig,_this);
		}
	});
});