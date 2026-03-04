define([
		'slickGridWrapper2',			
		PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js',
		'JsonUtility',
		'messageUtility',
		'bootstrapSwitch',
		PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
], function(slickGridWrapper2, UrlParameter) {
			'use strict';
			let jsonObject = new Object(),  _this = '', dispatchLedgerId;
			return Marionette.LayoutView.extend({
				initialize : function() {
					dispatchLedgerId 				= UrlParameter.getModuleNameFromParam(MASTERID);
					_this = this;
				}, render : function() {
					jsonObject				= {};
					jsonObject["dispatchLedgerId"] 	= dispatchLedgerId;
					getJSON(jsonObject, WEB_SERVICE_URL	+ '/editLSWS/getEditLSHistory.do?',	_this.renderEditLSHistoryDetailsElements, EXECUTE_WITHOUT_ERROR);
					return _this;
				}, renderEditLSHistoryDetailsElements : function(response) {
					showLayer();

					const loadelement = [];
					const baseHtml 	= new $.Deferred();
					loadelement.push(baseHtml);

					$("#mainContent").load("/ivcargo/html/module/waybill/LREditHistory/editLrHistory.html",
							function() {
						baseHtml.resolve();
					});
					
					$.when.apply($, loadelement).done(function() {
						hideLayer();
						_this.viewEditLSHistoryDetails(response);
					});
				}, viewEditLSHistoryDetails	: function(response) {
					if(response.message != undefined) {
						hideLayer();
						const errorMessage = response.message;
						showMessage('error', errorMessage.typeSymble + '  ' +  errorMessage.description);						
						setTimeout(() => window.close(), 1000);						
						return;
					}
					
					$("*[data-selector='header']").html("Edit LS History of LS Number = " + response.lsNumber);

					slickGridWrapper2.setGrid(response);
					hideLayer();		
				}	
		});
	});