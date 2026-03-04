define([  
	PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js'
	,'JsonUtility'
	,'messageUtility'
	],function(UrlParameter) {	
	'use strict';
	var jsonObjectIn = new Object(),_this = '', sourceBranchId = 0, destinationBranchId = 0, corporateAccountId = 0;
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
			sourceBranchId 			= UrlParameter.getModuleNameFromParam('sourceBranchId');
			destinationBranchId 	= UrlParameter.getModuleNameFromParam('destinationBranchId');
			corporateAccountId 		= UrlParameter.getModuleNameFromParam('corporateAccountId');
		}, render : function() {
			jsonObjectIn['sourceBranchId']		= sourceBranchId; 
			jsonObjectIn['destinationBranchId'] = destinationBranchId;
			jsonObjectIn['corporateAccountId'] 	= corporateAccountId;
			
			getJSON(jsonObjectIn, WEB_SERVICE_URL	+ '/coverLetterPrintModuleWS/getCoverLetterPrintDetails.do?',_this.setPrintData, EXECUTE_WITHOUT_ERROR);
			return _this;
		},setPrintData : function(response) {
			hideLayer();
					
			let loadelement = new Array();
			let baseHtml = new $.Deferred();

			loadelement.push(baseHtml);

			$("#mainContent").load('/ivcargo/html/print/coverLetterPrint/coverLetterPrint.html', function () {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				$("*[data-account='sourceName']").html(response.sourceName);
				$("*[data-account='sourceAddress']").html(response.sourceAddress);
				$("*[data-account='destinationName']").html(response.destinationName);
				$("*[data-account='destinationAddress']").html(response.destinationAddress);
			
				setTimeout(function() { window.print();}, 500);
			});
		}

	});
});
