define([  'JsonUtility'
	,'messageUtility'
	,'jquerylingua'
	,'language'
	,'autocomplete'
	,'autocompleteWrapper'
	,'nodvalidation'
	,'focusnavigation'//import in require.config
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	,PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js'
	,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
	],function(JsonUtility, MessageUtility, Lingua, Language, AutoComplete, AutoCompleteWrapper,
			NodValidation,ElementFocusNavigation, BootstrapModal,UrlParameter,Selection) {
	'use strict';// this basically give strictness to this specific js
	var 	_this = '', ElementModelArray, jsonObject, btModalConfirm, shortCreditCollLedgerId = 0, redirectFilter = 0, previousDate, executiveType, branchId,
	myNod, doneTheStuff = false;
	return Marionette.LayoutView.extend({
		initialize: function(jsonObjectData) {

			_this = this;
			this.$el.html(this.template);
	
			shortCreditCollLedgerId				= UrlParameter.getModuleNameFromParam('shortCreditCollLedgerId');
		}, render: function() {
			if(shortCreditCollLedgerId > 0) {
				jsonObject				= new Object();
				jsonObject.shortCreditCollLedgerId		= shortCreditCollLedgerId;
				
				getJSON(jsonObject, WEB_SERVICE_URL+'/StbsEditPartyWS/initalizeStbsPartyDetails.do', _this.loadElements, EXECUTE_WITH_ERROR); //submit JSON
				
			} else {
				showMessage("error","Party not Found!");
				setTimeout(function(){
					window.close();
				},2000);
			}
			hideLayer();
			
		},loadElements : function(response) {
			console.log("response ", response)
			if(response.message != undefined){
				setTimeout(function(){
					window.close();
				},1500);
			}
				
			var loadelement = new Array();
			var baseHtml 	= new $.Deferred();
			var partyDetailsObj = new Object();
			var partyDetailsObj = response.partyDetailsObj;
			var corporateAccntId = partyDetailsObj.corporateAccntId;
			var partyName		 = partyDetailsObj.partyName;
			
			if(partyName == undefined){
				partyName = '';
			}
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/stbsEditParty/stbsEditParty.html",
					function() {
				$("#partyNameId").html('<b>'+partyName+'</b>');
				$("#prevPartyName").val(partyName);
				$("#prevPartyId").val(corporateAccntId);
						baseHtml.resolve();
			});
			hideLayer();
			$.when.apply($, loadelement).done(function() {
				hideLayer();
				var partyNameAutoComplete 					= new Object();
				partyNameAutoComplete.primary_key 			= 'corporateAccountId';
				partyNameAutoComplete.url 					= WEB_SERVICE_URL+'/autoCompleteWS/getPartyDetailsAutocomplete.do?isSearchByAllParty='+true;
				partyNameAutoComplete.field 				= 'corporateAccountDisplayName';
				$("#partyNameEle").autocompleteCustom(partyNameAutoComplete);
				
				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});
				
				myNod.add({
					selector		: '#partyNameEle',
					validate		: 'validateAutocomplete:#partyNameEle_primary_key',
					errorMessage	: 'Select Proper Party !'
				});
				_this.setModel(response);
			});
			
		}, setModel : function(response) {
			
			if(response.message != undefined){
				showMessage("error",response.message.description);
				return false;
			}
			var partyDetailsObj = response.partyDetailsObj;
			var corporateAccntId = partyDetailsObj.corporateAccntId;
			var partyName		 = partyDetailsObj.partyName;
			
				$(".ok").on('click', function(response) {
					if(!_this.validateField()){
						return false;
					}
					
				var jsonObject 	= new Object();
				
				jsonObject.shortCreditCollLedgerId 				= shortCreditCollLedgerId;
				jsonObject.prevCorporateAccntId 				= corporateAccntId;
				jsonObject.prevPartyName 						= partyName;
				jsonObject.corporateAccntId 					= Number($('#partyNameEle_primary_key').val());
				
				
				$("#updateBtn").addClass('hide');
					
				btModalConfirm = new Backbone.BootstrapModal({
					content		: 	"Are you sure you want to Update Party?",
					modalWidth 	: 	30,
					title		:	'Update Party Name',
					okText		:	'YES',
					showFooter 	: 	true,
					okCloses	:	true
				}).open();
				
				
				btModalConfirm.on('ok', function() {
					showLayer();
					if(!doneTheStuff){
						doneTheStuff = true;
						getJSON(jsonObject, WEB_SERVICE_URL+'/StbsEditPartyWS/updateStbsParty.do', _this.onUpdate, EXECUTE_WITH_ERROR); //submit JSON
					}
					
				});
				
				btModalConfirm.on('cancel', function() {
					$("#updateBtn").removeClass('hide');
					$("#updateBtn").focus();
					doneTheStuff = false;
					hideLayer();
				});
			});
		}, onUpdate : function(response) {
			
			hideLayer();
			if(response.stbsPartyEditLogsId > 0){
				showMessage('success','Party Updated Successfully ! ');
			} else {
				   doneTheStuff = false;
					showMessage("error",response.message.description);
					return false; 
			}
			window.close();
			
		},validateField : function(){
			if(Number($("#prevPartyId").val()) == Number($('#partyNameEle_primary_key').val())){
				showMessage("error","Please Enter Other Party !");
				return false;
			}
			
			if($("#partyNameEle").val() == undefined || $("#partyNameEle").val() == ''){
				showMessage("error","Please Enter Party !");
				$("#partyNameEle").focus()
				return false;
			}
			if($("#partyNameEle_primary_key").val() == undefined || $("#partyNameEle_primary_key").val() == ''){
				showMessage("error","Please Select Proper Party !");
				$("#partyNameEle").focus()
				return false;
			}
			
			return true;
		}
		
		
	});
});

