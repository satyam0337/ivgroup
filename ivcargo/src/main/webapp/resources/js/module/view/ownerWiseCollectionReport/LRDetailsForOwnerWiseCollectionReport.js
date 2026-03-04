define([
	'slickGridWrapper2'
	,'errorshow'
	,'JsonUtility'
	,'messageUtility'
	,'elementmodel'
	,'elementTemplateJs'
	,'constant'
	], function (slickGridWrapper2) {
	'use strict';// this basically give strictness to this specific js
	let _this = '', jsonObject;	
	return Marionette.LayoutView.extend({
		initialize: function(jsonObjectData){
			_this 			= this;
			jsonObject		= jsonObjectData;
		},
		render: function(){
			getJSON(jsonObject, WEB_SERVICE_URL+'/ownerWiseCollectionReportWS/getLrDetailsForOwnerWiseCollectionReport.do', _this.setElementData, EXECUTE_WITH_ERROR);
		},setElementData : function(response) {
			
			
			if(response.message != undefined){
				hideLayer();
				$('#middle-border-boxshadow').addClass('hide');
				let errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);
				return;
			} 
			
			let loadelement = new Array();
			let baseHtml = new $.Deferred();
			loadelement.push(baseHtml);
			
			setTimeout(function(){
				$("#modalBody").load("/ivcargo/html/module/ownerWiseCollectionReport/LRDetailsForOwnerWiseCollectionReport.html",function() {
					baseHtml.resolve();
				});
			},200);
			
			$.when.apply($, loadelement).done(function() {
				showLayer();

				if(response.CorporateAccount != undefined) {
					hideAllMessages();
					slickGridWrapper2.setGrid(response);
				}
				
				hideLayer();
			})
		}
	});
});