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
	var _this = '',	myNod, jsonObject, btModalConfirm, waybillId, previousOTLRNumber,redirectFilter,flag=true;
	var iconForWarningMsg				= '<i class="fa fa-warning"></i>';
	var alphaNumericAllowWarningMsg		= iconForWarningMsg+'Only A-Z and 0-9 and is allowed.';
	return Marionette.LayoutView.extend({
		initialize: function(jsonObjectData) {
			
			waybillId 						= UrlParameter.getModuleNameFromParam('wayBillId');
			redirectFilter					= UrlParameter.getModuleNameFromParam('redirectFilter');
		
		_this 					= this;
		},render: function() {
			
			var jsonObject			= new Object();
			
			jsonObject.waybillId	= waybillId;
			
			getJSON(jsonObject, WEB_SERVICE_URL + '/updateOTLRNumberWS/getOTLRNumberToUpdate.do?', _this.setElements, EXECUTE_WITH_ERROR);
			return _this;
		},setElements : function(response) {
			var loadelement 			= new Array();
			var baseHtml 				= new $.Deferred();
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/updateOTLRNumber/updateOTLRNumber.html",
					function() {
						baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				hideLayer();
				_this.setModel(response);
			});
		}, setModel : function(response) {
			previousOTLRNumber	= response.oTLRNumber;
				
			$("#oTLRNumberEle").val(previousOTLRNumber);
			$( "#oTLRNumberEle" ).keypress(function( event ) {
				flag = _this.allowOnlyAlphanumeric(event);
			});
			myNod = nod();
			myNod.configure({
				parentClass:'validation-message'
			});
			
			myNod.add({
				selector		: '#oTLRNumberEle',
				validate		: 'presence',
				errorMessage	: 'Please Enter OT LR Number'
			});
			
			$("#updateBtn").on('click',function(event){
				flag = _this.allowOnlyAlphanumeric();
				if(!flag){
					showMessage('warning', alphaNumericAllowWarningMsg);
					return;
				}
				var jsonObject			= new Object();
				if(previousOTLRNumber	!= $('#oTLRNumberEle').val()){
					
					jsonObject.oTLRNumber				= $('#oTLRNumberEle').val().toUpperCase();
					jsonObject.previousOTLRNumber		= previousOTLRNumber;
					jsonObject.waybillId				= waybillId;
					jsonObject.redirectFilter			= redirectFilter;
					myNod.performCheck();
					
					if(myNod.areAll('valid')) {
						
						btModalConfirm = new Backbone.BootstrapModal({
							content		: 	"Are you sure you want to Update OT LR Number?",
							modalWidth 	: 	30,
							title		:	'Update OT LR Number',
							okText		:	'YES',
							showFooter 	: 	true,
							okCloses	:	true
						}).open();
						
						btModalConfirm.on('ok', function() {
							getJSON(jsonObject, WEB_SERVICE_URL+'/updateOTLRNumberWS/updateOTLRNumber.do', _this.onUpdate, EXECUTE_WITH_ERROR); //submit JSON
							showLayer();
						});
					} else {
						return false;
					}
				}else{
					showMessage("error","Entered OT LR Number Is Same As Previous OT LR Number");
				}
		    });
		}, onUpdate : function(response) {
			
			if(response.redirectTo > 0) {
					showMessage("success","OT LR Number Successfully Updated!");
				setTimeout(function(){
					redirectToAfterUpdate(response);
				},1000);
			}
		},allowOnlyAlphanumeric : function (evt) {
			if(evt == undefined){
				var charStr = $("#oTLRNumberEle").val();
				if (/^[a-zA-Z0-9\/]+$/.test(charStr)) {
					hideAllMessages();
					return true;
				} else {
					showMessage('warning', alphaNumericAllowWarningMsg);
					return false;
				}
			} else {
				if (evt.ctrlKey == 1) {
					return true;
				} else {
					var keynum = null;
					
					if(window.event){ // IE
						keynum = evt.keyCode;
					} else if(evt.which){ // Netscape/Firefox/Opera
						keynum = evt.which;
					}
					
					if(keynum == 8) {
						return true;
					}
					
					var charStr = String.fromCharCode(keynum);
					if (/^[a-zA-Z0-9\/]+$/.test(charStr)) {
						hideAllMessages();
						return true;
					} else {
						showMessage('warning', alphaNumericAllowWarningMsg);
						return false;
					}
				}
			}
		}
	});
});

