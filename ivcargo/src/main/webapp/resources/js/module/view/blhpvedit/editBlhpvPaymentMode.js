/**
 *  define(['moduleURL1', 'moduleURL2'], function (module1Obj, module2Obj) {
        	module1 should consist of moduleURL1 URL and module1Obj is the Object corresponding to moduleURL1
            modules module1Obj and module2Obj are now available for use.
        });
    });
 */
var PaymentTypeConstant 			= null;
var moduleId 						= 0;
var incomeExpenseModuleId 			= 0;
var ModuleIdentifierConstant		= null;
var BillClearanceStatusConstant		= null;
var GeneralConfiguration			= null;
var BankPaymentOperationRequired	= false;
var bankAccountNotMandatory			= false;
var cardNumberNotMandatory			= false;
define([
		'JsonUtility'
		,'messageUtility'
		,'/ivcargo/resources/js/generic/urlparameter.js'
		,PROJECT_IVUIRESOURCES+'/resources/js/module/view/blhpvedit/editblhpvfilepath.js'//FilePath
		,'jquerylingua'
		,'language'
		, 'moment'
		,PROJECT_IVUIRESOURCES +'/resources/js/datepicker/datepickerwrapper.js'
        //constant for project name and domain urls
        //text! is used to convert the html to plain text which helps to fetch HTML through require
        //Master Template is used to get standard Layout of master pages
		,'autocompleteWrapper'
		,'selectizewrapper'
        ,'focusnavigation'//import in require.config
        ], function(JsonUtility, MessageUtility, UrlParameter, FilePath, Lingua, Language, moment, datepickerWrapper, AutocompleteUtils, Selectizewrapper, ElementFocusNavigation){

	'use strict';// this basically give strictness to this specific js 
	var myNod, blhpvId = 0, lhpvId = 0, blhpvBranchId, jsonObject	= new Object(), lhpv, blhpv, _this = '', previousPaymentMode = 0;

	// to know about layout refer url:http://marionettejs.com/docs/v1.8.7/marionette.layout.html
	return Marionette.LayoutView.extend({
		initialize: function(masterObj){
			//initialize is the first function called on call new view()
			_this = this;
			blhpvId				= UrlParameter.getModuleNameFromParam('blhpvId');
			lhpvId				= UrlParameter.getModuleNameFromParam('lhpvId');
			blhpvBranchId		= UrlParameter.getModuleNameFromParam('blhpvBranchId');
		}, render: function() {
			jsonObject.blhpvId 			= blhpvId;
			jsonObject.lhpvId 			= lhpvId;
			jsonObject.blhpvBranchId 	= blhpvBranchId;
			
			getJSON(jsonObject, WEB_SERVICE_URL+'/blhpvWS/getBLHPVForChangePaymentModeByBlhpvId.do', _this.setData, EXECUTE_WITH_ERROR);
			//initialize is the first function called on call new view()
			return _this;
		}, setData : function(response) {
			var jsonObject 		= new Object();
			var loadelement 	= new Array();
			var baseHtml 		= new $.Deferred();
			var paymentHtml		= new $.Deferred();
			
			GeneralConfiguration		= response.GeneralConfiguration;
			BankPaymentOperationRequired	= GeneralConfiguration.BankPaymentOperationRequired;
			
			loadelement.push(baseHtml);
			
			if(BankPaymentOperationRequired) {
				loadelement.push(paymentHtml);
			}
			
			$("#mainContent").load("/ivcargo/template/blhpvedit/blhpvedittemplate.html",
					function() {
				baseHtml.resolve();
			});
			
			if(BankPaymentOperationRequired) {
				$("#bankPaymentOperationPanel").load("/ivcargo/html/module/paymentTypeSelection/paymentTypeSelection.html",
						function() {
						paymentHtml.resolve();
				});
			}
			
			$.when.apply($, loadelement).done(function() {
				loadLanguageWithParams(FilePath.loadLanguage());
				
				$('#top-border-boxshadow').remove();
				$('#bottom-border-boxshadow').remove();
				$('#middle-border-boxshadow').remove();
				
				lhpv						= response.lhpv;
				blhpv						= response.blhpv;
				var blhpvDetailsmessage		= response.blhpvDetailsmessage;
				PaymentTypeConstant			= response.PaymentTypeConstant;
				moduleId					= response.moduleId;
				incomeExpenseModuleId		= response.incomeExpenseModuleId;
				ModuleIdentifierConstant	= response.ModuleIdentifierConstant;
				bankAccountNotMandatory		= GeneralConfiguration.bankAccountNotMandatory;
				cardNumberNotMandatory		= GeneralConfiguration.cardNumberNotMandatory;
				previousPaymentMode			= blhpv.paymentMode;
				var paymentTypeArr			= response.paymentTypeArr;
				
				if(paymentTypeArr && !jQuery.isEmptyObject(paymentTypeArr)) {
					$("#viewAddedPaymentDetailsCreate").removeClass("hide");
					
					Selectizewrapper.setAutocomplete({
						jsonResultList	: 	paymentTypeArr,
						valueField		:	'paymentTypeId',
						labelField		:	'paymentTypeName',
						searchField		:	'paymentTypeName',
						elementId		:	'paymentType',
						onChange		:	_this.onPaymentTypeSelect
					});
				} else {
					 $("#blhpvPaymentDiv").hide();
				}
				
				$("#updatePaymentBtn").bind("click", function() {
					_this.updateBLHPVPaymentMode();
				});
				
				$('#blhpvDetails1').append('<tr id="blhpvDetailsRow"></tr>');
				$('<td>' + blhpv.bLHPVNumber + '</td>').appendTo('#blhpvDetailsRow');
				$('<td>' + blhpv.creationDateTimeString + '</td>').appendTo('#blhpvDetailsRow');
				$('<td>' + lhpv.lhpvNumber + '</td>').appendTo('#blhpvDetailsRow');
				$('<td>' + lhpv.creationDateTimeString + '</td>').appendTo('#blhpvDetailsRow');
				$('<td>' + blhpv.paymentModeString + '</td>').appendTo('#blhpvDetailsRow');
				
				if(blhpvDetailsmessage != undefined) {
					$('#blhpvPaymentDetailsmessage').html(blhpvDetailsmessage);
					$('#updateDateBtn').remove();
					$('#updatePaymentBtn').remove();
					$('#blhpvDateDiv').remove();
					$('#blhpvPaymentDiv').remove();
					$('#updatePaymentBtn').remove();
					$('#viewPaymentDetails').remove();
					$('#messegeToEditBlhpvPaymentMode').removeClass('hide');
				}
				
				if(BankPaymentOperationRequired) {
					setIssueBankAutocomplete();
					setAccountNoAutocomplete();
				}
			});
			
			hideLayer();
		}, onPaymentTypeSelect : function() {
			if(!_this.validateSamePaymentType()) {
				return false;
			}
			
			hideShowBankPaymentTypeOptions(document.getElementById("paymentType"));
			$('#storedPaymentDetails').empty();
		}, validateSamePaymentType : function() {
			if($('#paymentType').val() == previousPaymentMode) {
				showMessage('error', iconForErrMsg + ' ' + ' Select other Payment Mode !');
				return false;
			}
			
			return true;
		}, updateBLHPVPaymentMode : function() {
			var paymentType = $('#paymentType').val();

			if(!validateInputTextFeild(1, 'paymentType', 'paymentType', 'error', iconForErrMsg + ' Please, Select Payment Mode !')) {
				return false;
			}
			
			if(!_this.validateSamePaymentType()) {
				return false;
			}

			if(isValidPaymentMode(paymentType)) { //Defined in paymentTypeSelection.js
				var trCount = $("#storedPaymentDetails  tr").length;

				if(trCount == 0) {
					showMessage('error', iconForErrMsg + ' Please, Add Payment details!');
					return false;
				}	
			}
			
			showLayer();
			
			var jsonObject 						= new Object();
			
			jsonObject["lhpvId"] 					= lhpvId;
			jsonObject["blhpvId"] 					= blhpvId;
			jsonObject["paymentType"] 		   		= $('#paymentType').val();
			jsonObject["paymentValues"]				= $('#paymentCheckBox').val();
			
			if(confirm("Do You Want To Change BLHPV Payment Mode ! ")) {
				showLayer();
				getJSON(jsonObject, WEB_SERVICE_URL+'/blhpvWS/updateBLHPVPaymentMode.do', _this.afterSaveBlhpv, EXECUTE_WITHOUT_ERROR);
				$('#updatePaymentBtn').hide();
			} else {
				$('#updatePaymentBtn').show();
				hideLayer();
			}
		}, afterSaveBlhpv : function (response) {
			if(response.message != undefined) {
				hideLayer();
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
			}
			
			setTimeout(() => {
				if(response.BLhpvPrintFromNewFlow) {
					var newwindow = window.open('BLHPVAjaxAction.do?pageId=48&eventId=11&blhpvId='+blhpvId+'&isReprint=true', 'newwindow', 'config=height=610,width=815, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
				} else {
					var newwindow = window.open('BLHPVAjaxAction.do?pageId=48&eventId=6&blhpvId='+blhpvId+'&isReprint=true', 'newwindow', 'config=height=610,width=815, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
				}
			}, 1500);
			
			setTimeout(() => {
				window.close();
			}, 2000);
			
			hideLayer();
		}
	});
});