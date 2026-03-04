define([ 'marionette'
         ,'/ivcargo/resources/js/generic/urlparameter.js'
		 ,'slickGridWrapper2',
         ,'JsonUtility'
         ,'messageUtility'
         ,'nodvalidation'
		 ,'focusnavigation'
         ],
         function(Marionette, UrlParameter, slickGridWrapper2) {
	'use strict';// this basically give strictness to this specific js
	var jsonObject	= new Object(),
	wayBillId,
	filter,
	_this = '';
	//this is used to get the access of key in onRender because this keyword is not found in onRender function
	return Marionette.LayoutView.extend({
		initialize: function(){
			//initialize is the first function called on call new view()
			_this = this;
			wayBillId 				= UrlParameter.getModuleNameFromParam('wayBillId');
			filter	 				= UrlParameter.getModuleNameFromParam('filter');
			
			jsonObject.waybillId	= wayBillId;
		}, render: function() {
			
			jsonObject	= new Object();
			
			jsonObject.waybillId	= wayBillId;
			
			getJSON(jsonObject, WEB_SERVICE_URL + '/editLRHistoryWS/getLrEditHistory.do?', _this.setLrEditHistory, EXECUTE_WITHOUT_ERROR);
	
		}, setLrEditHistory : function(response) {
			
			var loadelement 			= new Array();
			var baseHtml 				= new $.Deferred();
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/waybill/LREditHistory/editLrHistory.html",function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				
				if(response.message != undefined) {
					var errorMessage = response.message;
					showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
					hideLayer();
					setTimeout(() => {
						window.close();
					}, 2000);
					return;
				}
				
				if(response.CorporateAccount == undefined)
					return;
				
				if(filter == true || filter == 'true') {
					$("*[data-selector='header']").html("Edit Articles History");
					response.CorporateAccount = _.filter(response.CorporateAccount, function(obj){ return (obj.typeOfEdit == 64)}) ;
				}
				
				hideLayer();
				slickGridWrapper2.setGrid(response);
			});
		}
	});
});