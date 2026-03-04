define([
	PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js',
	'JsonUtility',
	//jsonutility consist of ajax calls to send json object as an ajax hit to the url specified and get call back as specified
	'messageUtility'
	// to get parameter from url to send it to ws
	],
	function(UrlParameter) {
	'use strict';// this basically give strictness to this specific js
	var  jsonObject	= new Object(),
	_this = '';
	//this is used to get the access of key in onRender because this keyword is not found in onRender function
	return Marionette.LayoutView.extend({
		initialize: function(masterObj){
			//masterid is fetched and passed when the view is called and it is set to fetch it from webservice
			jsonObject["searchByBranchesId"] 	= UrlParameter.getModuleNameFromParam('masterid1');
			jsonObject["subRegionId"] 			= UrlParameter.getModuleNameFromParam('masterid2');
			jsonObject["destinationBranchId"] 	= UrlParameter.getModuleNameFromParam('masterid3');
			
			//initialize is the first function called on call new view()
			_this = this;
		}, render: function() {
			getJSON(jsonObject, WEB_SERVICE_URL+'/trafficWiseSearchWS/getTrafficWiseSearchDetailsForPrint.do', _this.getResponseForPrint, EXECUTE_WITH_ERROR);

			return _this;
		}, getResponseForPrint : function(response) {
			var trafficWisePrintType	= response.trafficWisePrintType;
			
			require(['/ivcargo/resources/js/module/print/trafficWisePrintSetup.js'], function(trafficWisePrintSetup){
				
				var loadelement = new Array();
				var baseHtml = new $.Deferred();
				loadelement.push(baseHtml);
				
				$("#mainContent").load("/ivcargo/html/print/trafficWisePrint/"+trafficWisePrintType+".html",function() {
					baseHtml.resolve();
				});
				
				trafficWisePrintSetup.setHeaderDetails(response.PrintHeaderModel);
				trafficWisePrintSetup.setTrafficWisePrintData(response);
				setTimeout(function(){window.print();window.close();},500);
			});
		}
	});
});