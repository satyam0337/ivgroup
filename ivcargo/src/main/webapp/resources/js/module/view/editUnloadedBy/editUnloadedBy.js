define([
	'text!'+PROJECT_IVVIEWPAGES+'/template/elementtemplate.html'
	,'errorshow'
	,'JsonUtility'
	,'messageUtility'
	,'/ivcargo/resources/js/generic/urlparameter.js'
	,'nodvalidation'
	,'elementTemplateJs'
	,'constant'
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	], function (ElementTemplate,errorshow,JsonUtility,MessageUtility,UrlParameter,NodValidation,Elementtemplateutils,constant,BootstrapModal) {
	'use strict';// this basically give strictness to this specific js
	var 	_this = '',	myNod, jsonObject, btModalConfirm, receivedLedgerId, dispatchLedgerId;
	return Marionette.LayoutView.extend({
		initialize: function(jsonObjectData) {
			
		/*These two value coming from receive module if unloaded by is edited from receive module*/
		receivedLedgerId 		= UrlParameter.getModuleNameFromParam('receivedLedgerId');
		dispatchLedgerId 		= UrlParameter.getModuleNameFromParam('dispatchLedgerId');
		
		_this 					= this;
		},render: function() {
			if(dispatchLedgerId > 0) {
				var jsonObject 	= new Object();
				jsonObject["dispatchLedgerId"] 	= dispatchLedgerId;
				getJSON(jsonObject, WEB_SERVICE_URL+'/receiveWs/getReceiveLedgerData.do', _this.setElements, EXECUTE_WITH_ERROR);
				//_this.setElements();
			} else {
				hideLayer();
				showMessage("error","receivedLedgerId not found");
			}
		},setElements : function(response) {
			console.log(":response---",response);
			var jsonObject 	= response.receivedLedger;
			var loadelement = new Array();
			var baseHtml 	= new $.Deferred();
			loadelement.push(baseHtml);
			$("#mainContent").load("/ivcargo/html/module/editUnloadedBy/EditUnloadedBy.html",
					function() {
						baseHtml.resolve();
			});
			$.when.apply($, loadelement).done(function() {
				hideLayer();
				_this.setModel(jsonObject);
			});
		}, setModel : function(jsonObject) {
			myNod = nod();
			myNod.configure({
				parentClass:'validation-message'
			});
			
			myNod.add({
				selector	: '#unloadedBy',
				validate	: 'presence',
				errorMessage: 'Enter Unloaded by name!'
			});
			
			$("#unloadedBy").val(jsonObject.unloadedByHamal);
			$("#updateBtn").on('click',function(){
				var jsonObjectNew 	= new Object();
				if(jsonObject.unloadedByHamal	!= ($('#unloadedBy').val()).trim() && jsonObject.unloadedByHamal	!= ($('#unloadedBy').val()).toUpperCase() ){
					
					jsonObjectNew["receivedLedgerId"] 	= jsonObject.receivedLedgerId;
					jsonObjectNew["dispatchLedgerId"] 	= dispatchLedgerId;
					jsonObjectNew["UnloadedByHamal"] 	= $('#unloadedBy').val();
					jsonObjectNew["turNumber"] 			= jsonObject.turNumber;
					myNod.performCheck();
					if(myNod.areAll('valid')) {
						
						btModalConfirm = new Backbone.BootstrapModal({
							content		: 	"Are you sure you want to Edit Unloaded By?",
							modalWidth 	: 	30,
							title		:	'Edit Unloaded By',
							okText		:	'YES',
							showFooter 	: 	true,
							okCloses	:	true
						}).open();
						console.log("jsonObjectNew",jsonObjectNew)
						btModalConfirm.on('ok', function() {
							getJSON(jsonObjectNew, WEB_SERVICE_URL+'/receiveWs/editUnloadedBy.do', _this.onUpdate, EXECUTE_WITH_ERROR); //submit JSON
							showLayer();
						});
					} else {
						return false;
					}
				}else{
					showMessage("error","Please enter new name!");
				}
		    });
		}, onUpdate : function(response) {
			if(response.redirectTo > 0) {
				setTimeout(function(){
					redirectToAfterUpdate(response);
					},1000);
				}
		}
	});
});

