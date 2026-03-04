var RANGEWISE_QR_PRINT  = 3;
var ZERO                = 0;
var isSrcToDesntWIseSubRegion = false;
var largeTemplateArray =[];
var printedColl = [];
var markQRIsPrinted = {};
var txnInPrint      = {};
var  lastIndex = 0;
define([ 'marionette'
         ,'JsonUtility'
         ,'messageUtility'
         ,'/ivcargo/resources/js/generic/urlparameter.js'
         ,'jquerylingua'
         ,'language'
         ,'nodvalidation'
         ,'focusnavigation'
         ,'autocomplete'
         ,'selectizewrapper'
         ,'/ivcargo/resources/js/module/redirectAfterUpdate.js',
         ],
		function(Marionette, JsonUtility, MessageUtility, UrlParameter, jquerylingua, language, NodValidation, FocusNavigation,AutoComplete,Selectizewrapper) {
	'use strict';// this basically give strictness to this specific js
	var jsonObject	= new Object(),
			wayBillId,
			myNod,
			_this = '',
			redirectFilter = 0;
	var fromRange  = 0;
	var toRange    = 0;
	var subRegionList	    = new Array();
	var selectedDestnSubRegion = 0;
	var srsDestnMap;
	//this is used to get the access of key in onRender because this keyword is not found in onRender function
	return Marionette.LayoutView.extend({
		initialize: function(masterObj){
		//initialize is the first function called on call new view()
		_this = this;
	},
		render: function() {
		var jsonObject	= new Object();
		_this.setGroup();
		return _this;
	},
		setGroup : function(response){
		largeTemplateArray = [];
		printedColl        = [];
		markQRIsPrinted    = {};
		txnInPrint         = {};
		lastIndex          = 0;

		var loadelement = new Array();
		var baseHtml 	= new $.Deferred();

		loadelement.push(baseHtml);

		$("#mainContent").load("/ivcargo/html/module/automaticreceive/automaticreceive.html",
				function() {
			baseHtml.resolve();
		});
		$.when.apply($, loadelement).done(function() {
			initialiseFocus();
			hideLayer();
			$("#autoReceive").click(function() {
				_this.validateAndPrintQRCode();
			});
		});
	},
		validateAndPrintQRCode :  function(){
		_this.printQRCode();
	},
		printQRCode : function(){
		var jsonObject = new Object();
		showLayer();
		getJSON(jsonObject, WEB_SERVICE_URL + "/runPojoFromWS/automaticReceive.do?", _this.afterUpdate, EXECUTE_WITHOUT_ERROR );	
	}, afterUpdate : function(response){
		hideLayer();
		setTimeout(function(){
			if(response.accountGroupId > 0){
				showMessage('success', "Automatic Receive Process Started Sucessfully"); 
			}
		}, 200);
	}
	});
});