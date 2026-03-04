define(['/ivcargo/resources/js/barcode/qrcode/qrcode.js',
	'marionette'
	,'JsonUtility',
	//jsonutility consist of ajax calls to send json object as an ajax hit to the url specified and get call back as specified
	'messageUtility',
	'/ivcargo/resources/js/generic/urlparameter.js',
	'jquerylingua',
	'language',
	'/ivcargo/resources/js/generic/genericfunctions.js'
	],
	function(qrcode,Marionette, JsonUtility, MessageUtility, UrlParameter, jquerylingua, language){
	'use strict';// this basically give strictness to this specific js
	var 
	masterId = "0",
	jsonObject	= new Object(),
	lsPrintConfig,
	lsPrintHeader,
	lsPrintLRSummary,
	lsPrintLSTotalDetails,
	lsPrintApplyCss,
	isRePrint,
	isQrBtnClicked,
	_this = '';
	//this is used to get the access of key in onRender because this keyword is not found in onRender function
	return Marionette.LayoutView.extend({
		initialize: function(masterObj){
			//masterid is fetched and passed when the view is called and it is set to fetch it from webservice
			masterId 	= UrlParameter.getModuleNameFromParam(MASTERID);
			isRePrint 	= UrlParameter.getModuleNameFromParam("isRePrint");
			isQrBtnClicked = UrlParameter.getModuleNameFromParam("isQrBtnClicked");
			//initialize is the first function called on call new view()
			_this = this;
		},
		render: function() {
			jsonObject.waybillId = masterId;
			jsonObject.isRePrint = isRePrint;
			jsonObject.isQrBtnClicked = isQrBtnClicked;

			var dataPrint		= JSON.parse(localStorage.getItem("lrDataPrint"));
			var pervwayBillId	= localStorage.getItem("wayBillId");
			
			getJSON(jsonObject, WEB_SERVICE_URL + '/lrPrintWS/getQRPrintByWaybillId.do?', _this.getResponseForPrint, EXECUTE_WITH_ERROR);

			return _this;
		},
		getResponseForPrint : function(response) {
			hideLayer();
			var configuration 	= response.configuration;
			
			require(['/ivcargo/resources/js/module/print/lrprintsetup.js','/ivcargo/resources/js/module/createWayBill/Create.js'], function(lrprintsetup,createJs) {
				require(['text!'+lrprintsetup.getConfiguration(configuration.lrPrintType, configuration, false, 0, false),
					lrprintsetup.getFilePathForLabel()], function(View, FilePath,createJs){
					loadLanguageWithParams(FilePath.loadLanguage(configuration.lrPrintType));
					
					if(isQrBtnClicked)
						setQRDetails(response);
					else
						lrprintsetup.setQRDetails(response);
					
					setTimeout(function(){
						window.close();
					},500);
				})
			});
		}		
	});
});