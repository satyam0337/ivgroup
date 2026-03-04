var expenseDetailsList 				= null;
var chargeMasterList				= null;
var PaymentTypeConstant 			= null;
var moduleId 						= 0;
var incomeExpenseModuleId 			= 0;
var ModuleIdentifierConstant		= null;
var incomeExpenseChargeToExclude	= null;
var	GeneralConfiguration			= null;

define([	'JsonUtility'
			,'messageUtility'
			,'/ivcargo/resources/js/generic/urlparameter.js'
	        ,'autocomplete'
	        ,'autocompleteWrapper'
	        ,'nodvalidation'
	        ,'focusnavigation'//import in require.config
	        ,'selectizewrapper'
	        ,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	        ,'/ivcargo/resources/js/module/redirectAfterUpdate.js'
	        ],function(JsonUtility, MessageUtility, UrlParameter, AutoComplete, AutoCompleteWrapper,
		 NodValidation,ElementFocusNavigation,Selectizewrapper,BootstrapModal){
	'use strict';
	var jsonObject = new Object(), _this = null, myNod, executive, btModalConfirm,
	voucherDetailsId = 0,  paymentTypeArr = null,previousPaymentMode = 0, bankPaymentOperationRequired =false;
	return Marionette.LayoutView.extend({
		initialize : function(masterObj){
			_this = this;
			voucherDetailsId	= UrlParameter.getModuleNameFromParam('masterid');
		},render : function(){
			var jsonObject = new Object();
			
			jsonObject["exepenseVoucherDetailsId"] 			= voucherDetailsId;
			
			getJSON(jsonObject, WEB_SERVICE_URL + '/lhpvAdvanceSettlementWS/getExpenseVoucherDetailsChangePaymentModeById.do?', _this.renderVoucherDetails, EXECUTE_WITH_ERROR);
			return _this;
		},renderVoucherDetails : function(response){
			if(response.message != undefined){
				setTimeout(function(){
					window.close();
				},1500);
			}
			
			var loadelement 	= new Array();
			var baseHtml 		= new $.Deferred();
			var paymentHtml		= new $.Deferred();
			
			GeneralConfiguration			= response.GeneralConfiguration
			bankPaymentOperationRequired	= GeneralConfiguration.BankPaymentOperationRequired;
			
			loadelement.push(baseHtml);

			if(bankPaymentOperationRequired) {
				loadelement.push(paymentHtml);
			}
			
			$("#mainContent").load("/ivcargo/html/module/editvoucherdetails/EditLHPVVoucherDetails.html",
					function() {
					baseHtml.resolve();
			});
			
			if(bankPaymentOperationRequired) {
				$("#bankPaymentOperationPanel").load("/ivcargo/html/module/paymentTypeSelection/paymentTypeSelection.html",
						function() {
						paymentHtml.resolve();
				});
			}
			
			$.when.apply($, loadelement).done(function() {
				hideLayer();
				
				if(bankPaymentOperationRequired) {
					setIssueBankAutocomplete();
					setAccountNoAutocomplete();
				}
				
				$("#editLHPVAdvanceVoucherDate").remove();

				var expenseVoucherDetails		= response.expenseVoucherDetails;
				executive						= response.executive;
				PaymentTypeConstant				= response.PaymentTypeConstant;
				paymentTypeArr					= response.paymentTypeArr;
				moduleId						= response.moduleId;
				ModuleIdentifierConstant		= response.ModuleIdentifierConstant;
				incomeExpenseModuleId			= response.incomeExpenseModuleId;
				
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
					 $("#paymenttypediv").hide();
				}
				
				$('#myModal').remove();
				
				previousPaymentMode		= expenseVoucherDetails.paymentMode;
				
				$("#updateBtn").bind("click", function() {
					_this.updatePaymentMode();
				});
			});
		}, updatePaymentMode : function() {
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

			var jsonObject 						= new Object();

			jsonObject["exepenseVoucherDetailsId"] 	= voucherDetailsId;
			jsonObject["paymentType"] 		   		= $('#paymentType').val();
			jsonObject["paymentValues"]				= $('#paymentCheckBox').val();

			btModalConfirm = new Backbone.BootstrapModal({
				content		: 	"Are you sure you want to Update Payment Mode ?",
				modalWidth 	: 	30,
				title		:	'Update Payment Mode',
				okText		:	'YES',
				showFooter 	: 	true,
				okCloses	:	true
			}).open();

			btModalConfirm.on('ok', function() {
				getJSON(jsonObject, WEB_SERVICE_URL+'/lhpvAdvanceSettlementWS/updateLHPVAdvancePaymentVoucherPaymentMode.do', _this.onUpdate, EXECUTE_WITH_ERROR); 
			});
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
		}, onUpdate : function(response){
			redirectToAfterUpdate(response);
		}
	});
});