define(['JsonUtility',
	//jsonutility consist of ajax calls to send json object as an ajax hit to the url specified and get call back as specified
	'messageUtility',
	PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js'
	// to get parameter from url to send it to ws
	],
	function(JsonUtility, MessageUtility, UrlParameter) {
	'use strict';// this basically give strictness to this specific js
	var 
	masterId = "0",
	jsonObject	= new Object(),
	preUnLoadingSheetPrintSetUp,
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
			
			if(masterId  != undefined && masterId > 0){
				jsonObject.dispatchLedgerId = masterId;
			} else if(localStorage.getItem("selectedDispatchLedgerIds") != undefined){
				jsonObject.dispatchLedgerId = localStorage.getItem("selectedDispatchLedgerIds");
			}
			
			getJSON(jsonObject, WEB_SERVICE_URL + '/preUnloadingWS/getPreUnloadingSheetData.do?', _this.onGetPreUnloadingPrintByDLId, EXECUTE_WITHOUT_ERROR);

		},
		onGetPreUnloadingPrintByDLId : function(response) {
			require([ PROJECT_IVUIRESOURCES+'/resources/js/module/view/preunloadingsheet/'+ response.preunloadingsheetsetup +'.js'],function(PreUnloadingSetUp){
				var flag	= 2;
				preUnLoadingSheetPrintSetUp			= PreUnloadingSetUp.renderElements(response, _this, flag);
				localStorage.removeItem("selectedDispatchLedgerIds");
				hideLayer();
			})
		}
	});
});