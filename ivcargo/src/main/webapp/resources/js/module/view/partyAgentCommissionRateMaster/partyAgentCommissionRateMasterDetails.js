/**
 *  define(['moduleURL1', 'moduleURL2'], function (module1Obj, module2Obj) {
        	module1 should consist of moduleURL1 URL and module1Obj is the Object corresponding to moduleURL1
            modules module1Obj and module2Obj are now available for use.
        });
    });
 */
define([
	'slickGridWrapper2'
	,'errorshow'
	,'JsonUtility'
	,'messageUtility'
	,'elementmodel'
	,'elementTemplateJs'
	,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'//PopulateAutocomplete
	,'constant'
	], function () {
	'use strict';// this basically give strictness to this specific js
	var 
	_this = '',
	jsonObject,
	partyAgentCommisionRateId;
	return Marionette.LayoutView.extend({
		initialize: function(jsonObjectData){

			//initialize is the first function called on call new view()
			//append template first 
			//the html would be set in the el element
			//this object is not found in other function so _this has been created
			_this 				= this;
			jsonObject 			= jsonObjectData.elementValue;
		},
		render: function(){
			getJSON(jsonObject, WEB_SERVICE_URL + '/partyAgentCommissionRateMasterWS/getPartyAgentCommisionRateDetailsById.do', _this.setPartyAgentCommisionElements, EXECUTE_WITH_ERROR);
		},setPartyAgentCommisionElements : function(response) {

			var loadelement = new Array();
			var baseHtml = new $.Deferred();
			
			loadelement.push(baseHtml);

			setTimeout(function(){
				$("#modalBody").load("/ivcargo/html/module/partyAgentCommissionRateMaster/UpdatePartyAgentCommisionRate.html",function() {
					baseHtml.resolve();
				});
			},200);

			$.when.apply($, loadelement).done(function() {
				initialiseFocus();

				partyAgentCommisionRateId = response.PartyAgentCommisionRate.partyAgentCommisionRateId;
				
				$('#upCommisionValue').val(response.PartyAgentCommisionRate.commisionValue);
				
				$('#upupdateBtn').attr("disabled",true);
				
				$("#upCommisionValue").keyup(function() {
					$('#upupdateBtn').attr("disabled",false);
				});
				
				$("#upupdateBtn").click(function() {
					_this.updatePartyAgentCommision(_this);
				});

				$("#updeleteBtn").click(function() {
					_this.deletePartyAgentCommision(_this);
				});

				hideLayer();
			});

		}, updatePartyAgentCommision : function() {
			showLayer();
			var jsonObject = new Object();

			jsonObject.partyAgentCommisionRateId	= partyAgentCommisionRateId;
			jsonObject.commisionValue				= $('#upCommisionValue').val();
			jsonObject.markForDelete				= false;

			getJSON(jsonObject, WEB_SERVICE_URL + '/partyAgentCommissionRateMasterWS/updatePartyAgentCommisionRate.do', _this.afterUpdate, EXECUTE_WITH_ERROR);
		
		},afterUpdate	: function(response) {
			var MyRouter = new Marionette.AppRouter({});
			MyRouter.navigate('&modulename=partyAgentCommisionRateMaster&updateCount='+true+'&dataUpdate='+true+'&dataDelete='+false);
			location.reload();
		}, deletePartyAgentCommision : function() {
			showLayer();
			var jsonObject = new Object();

			jsonObject.partyAgentCommisionRateId	= partyAgentCommisionRateId;
			jsonObject.commisionValue				= $('#upCommisionValue').val();
			jsonObject.markForDelete				= true;

			getJSON(jsonObject, WEB_SERVICE_URL + '/partyAgentCommissionRateMasterWS/updatePartyAgentCommisionRate.do', _this.afterDelate, EXECUTE_WITH_ERROR);
		},afterDelate	: function(response) {
			var MyRouter = new Marionette.AppRouter({});
			MyRouter.navigate('&modulename=partyAgentCommisionRateMaster&updateCount='+true+'&dataUpdate='+false+'&dataDelete='+true);
			location.reload();
		}
	});
});