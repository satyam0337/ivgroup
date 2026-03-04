define([
	'text!'+PROJECT_IVVIEWPAGES+'/template/elementtemplate.html'
	,'errorshow'
	,'JsonUtility'
	,'messageUtility'
	,'/ivcargo/resources/js/generic/urlparameter.js'
	,'nodvalidation'
	,'elementTemplateJs'
	,'constant'
	,'autocompleteWrapper'
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	], function (ElementTemplate,errorshow,JsonUtility,MessageUtility,UrlParameter,NodValidation,Elementtemplateutils,constant,ModelUrls,PopulateAutocomplete,JqueryComboBox,BootstrapModal) {
	'use strict';// this basically give strictness to this specific js
	var 	_this = '',	myNod, jsonObject, btModalConfirm, waybillId, previousTransportationModeId,transportationModeList,billId,redirectFilter,transportationModeId,transportationModeList;
	return Marionette.LayoutView.extend({
		initialize: function(jsonObjectData) {
			
			waybillId 						= UrlParameter.getModuleNameFromParam('wayBillId');
			billId	 						= UrlParameter.getModuleNameFromParam('billId');
			redirectFilter					= UrlParameter.getModuleNameFromParam('redirectFilter');
		
		_this 					= this;
		},render: function() {
			
			var jsonObject			= new Object();
			
			jsonObject.waybillId	= waybillId;
			
			getJSON(jsonObject, WEB_SERVICE_URL + '/updateTransportationModeWS/getTransportationModeToUpdate.do?', _this.setElements, EXECUTE_WITH_ERROR);
			return _this;
		},setElements : function(response) {
			transportationModeList		= response.TransportationModeList;
			var loadelement 			= new Array();
			var baseHtml 				= new $.Deferred();
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/updateTransportationMode/updateTransportationMode.html",
					function() {
						baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				hideLayer();
				_this.setModel(response);
			});
		}, setModel : function(response) {
			
			previousTransportationModeId	= response.transportationModeId;
			transportationModeList			= response.TransportationModeList;
			
			for(var i = 0; i < transportationModeList.length; i++) {
				if(Number(transportationModeList[i].transportModeId) == Number(TRANSPORTATION_MODE_ROAD_MIXED_ID)
					|| Number(transportationModeList[i].transportModeId) == Number(TRANSPORTATION_MODE_MIXED_ID)) {
					transportationModeList.splice(i, 2);
				}
			}
				
			var transportModeAutoComplete		 	= new Object();
			transportModeAutoComplete.primary_key 	= 'transportModeId';
			transportModeAutoComplete.url 			= transportationModeList;
			transportModeAutoComplete.field 		= 'transportModeName';
			$("#transportModeSearchEle").autocompleteCustom(transportModeAutoComplete);
			
			for(var i = 0; i < transportationModeList.length; i++) {
				if(transportationModeList[i].transportModeId == previousTransportationModeId) {
					$("#transportModeName_primary_key").val(transportationModeList[i].transportModeId);
					$("#transportModeSearchEle").val(transportationModeList[i].transportModeName);
				}
			}
			
			myNod = nod();
			myNod.configure({
				parentClass:'validation-message'
			});
			
			myNod.add({
				selector		: '#transportModeSearchEle',
				validate		: 'validateAutocomplete:#transportModeName_primary_key',
				errorMessage	: 'Select Valid Transportation Mode'
			});
			
			$("#updateBtn").on('click', function() {
				var jsonObject			= new Object();
				
				if(previousTransportationModeId	== Number($('#transportModeName_primary_key').val())) {
					showMessage("error", "Please Select a Different Transportation Mode");
					return false;
				}

				jsonObject.transportationModeId				= $('#transportModeName_primary_key').val();
				jsonObject.previousTransportationModeId		= previousTransportationModeId;
				jsonObject.waybillId						= waybillId;
				jsonObject.billId							= billId;
				jsonObject.redirectFilter					= redirectFilter;

				myNod.performCheck();

				if(myNod.areAll('valid')) {
					btModalConfirm = new Backbone.BootstrapModal({
						content		: 	"Are you sure you want to Update Transportation Mode?",
						modalWidth 	: 	30,
						title		:	'Update Transportation Mode',
						okText		:	'YES',
						showFooter 	: 	true,
						okCloses	:	true
					}).open();

					btModalConfirm.on('ok', function() {
						getJSON(jsonObject, WEB_SERVICE_URL+'/updateTransportationModeWS/updateTransportationMode.do', _this.onUpdate, EXECUTE_WITH_ERROR); //submit JSON
						showLayer();
					});
				} else {
					return false;
				}
		    });
		}, onUpdate : function(response) {
			transportationModeId		= response.transportationModeId;
			
			if(response.redirectTo > 0) {
				showMessage("success", "Transportation Mode Successfully Changed!");
				setTimeout(function(){
					redirectToAfterUpdate(response);
				},1000);
			}
		}
	});
});