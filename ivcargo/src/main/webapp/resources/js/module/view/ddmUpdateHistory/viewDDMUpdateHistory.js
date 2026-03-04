define([ 'marionette'
         ,'/ivcargo/resources/js/generic/urlparameter.js'
		 ,'slickGridWrapper2'
         ,'JsonUtility'
         ,'messageUtility'
         ,'jquerylingua'
         ,'language'
         ,'nodvalidation'
		 ,'focusnavigation'
         ],
         function(Marionette, UrlParameter, slickGridWrapper2) {
	'use strict';// this basically give strictness to this specific js
	let jsonObject	= new Object(),
	deliveryRunSheetLedgerId,
	_this = '';
	//this is used to get the access of key in onRender because this keyword is not found in onRender function
	return Marionette.LayoutView.extend({
		initialize: function(){
			//initialize is the first function called on call new view()
			_this = this;
			deliveryRunSheetLedgerId 				= UrlParameter.getModuleNameFromParam('deliveryRunSheetLedgerId');
			
			jsonObject.waybillId	= deliveryRunSheetLedgerId;
		}, render: function() {
			
			jsonObject	= new Object();
			
			jsonObject.deliveryRunSheetLedgerId	= deliveryRunSheetLedgerId;
			getJSON(jsonObject, WEB_SERVICE_URL + '/ddmUpdateEditLogsWS/getAllEditLogsOnLedgerId.do?', _this.setRemarksOnLedgerId, EXECUTE_WITHOUT_ERROR);
	
		}, setRemarksOnLedgerId : function(response) {
						
			let loadelement 			= new Array();
			let baseHtml 				= new $.Deferred();
			loadelement.push(baseHtml);

			$("#mainContent").load("/ivcargo/html/module/waybill/ddmLorryHireRemark/ddmLorryHireRemark.html",function() {
				baseHtml.resolve();
			});

			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				
				if(response.message != undefined) {
					let errorMessage = response.message;
					showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
					hideLayer();

					setTimeout(() => {
						window.close();
					}, 1000);

					return;
				}
				
				hideLayer();
				slickGridWrapper2.setGrid(response);
			});
		}
	});
});