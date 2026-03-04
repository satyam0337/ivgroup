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
var consignorDetails				= null;
var consigneeDetails				= null;
var doneTheStuff					= false;
var GroupConfiguration				= null;
var validatePhonePayTransaction		= false;

define([
		'JsonUtility'
		,'messageUtility'
		,'/ivcargo/resources/js/generic/urlparameter.js'
		, 'moment'
		,PROJECT_IVUIRESOURCES +'/resources/js/datepicker/datepickerwrapper.js'
		,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
		,'autocompleteWrapper'
		,'selectizewrapper'
        ,'focusnavigation'//import in require.config
        ], function(JsonUtility, MessageUtility, UrlParameter, moment, datepickerWrapper, BootstrapModal, AutocompleteUtils, Selectizewrapper, ElementFocusNavigation){

	'use strict';// this basically give strictness to this specific js 
	var myNod, waybillId = 0, btModalConfirm, jsonObject	= new Object(), consignmentSummary, _this = '', previousPaymentMode = 0, redirectFilter = 0,
	allowShortCreditPaymentForSavedParties= false;

	return Marionette.LayoutView.extend({
		initialize: function(masterObj){
			//initialize is the first function called on call new view()
			_this = this;
			waybillId				= UrlParameter.getModuleNameFromParam('wayBillId');
			redirectFilter			= UrlParameter.getModuleNameFromParam('redirectFilter');
			
		}, render: function() {
			
			jsonObject.waybillId 			= waybillId;
			
			getJSON(jsonObject, WEB_SERVICE_URL+'/UpdateWayBillPaymentModeWS/getPaymnetModeAndConfigToUpdate.do', _this.setData, EXECUTE_WITH_ERROR);
			//initialize is the first function called on call new view()
			return _this;
		}, setData : function(response) {
			console.log("response",response)
			
			if(response.messege != undefined){
				showMessage('error', iconForErrMsg + response.messege.description);
				hideLayer();
			}
			var loadelement 	= new Array();
			var baseHtml 		= new $.Deferred();
			var paymentHtml		= new $.Deferred();
			
		    GeneralConfiguration			= response.GeneralConfiguration;
			BankPaymentOperationRequired	= GeneralConfiguration.BankPaymentOperationRequired;
			GroupConfiguration				= response.GroupConfiguration;
						
			loadelement.push(baseHtml);
			
			if(BankPaymentOperationRequired) {
				loadelement.push(paymentHtml);
			}
			
			$("#mainContent").load("/ivcargo/html/module/waybill/update/updateWaybillPaymentMode.html",
					function() {
				baseHtml.resolve();
			});
			
			if(BankPaymentOperationRequired) {
				$("#bankPaymentOperationPanel").load("/ivcargo/html/module/paymentTypeSelection/paymentTypeSelection.html",
					function() {
						validatePhonePayTransaction = response.validatePhonePeTxn;

						setIssueBankAutocomplete();
						setAccountNoAutocomplete();
						paymentHtml.resolve();
					});
			} else {
				$( "#bankPaymentOperationPanel").remove();
			}
			
			$.when.apply($, loadelement).done(function() {
				
				var detailsMessage			= response.DetailsMessage;
				consignmentSummary			= response.consignmentSummary;
				PaymentTypeConstant			= response.PaymentTypeConstant;
				moduleId					= response.moduleId;
				incomeExpenseModuleId		= response.incomeExpenseModuleId;
				ModuleIdentifierConstant	= response.ModuleIdentifierConstant;
				previousPaymentMode			= consignmentSummary.consignmentSummaryPaymentType;
				var paymentTypeArr			= response.paymentTypeArr;
				allowShortCreditPaymentForSavedParties = response.allowShortCreditPaymentForSavedParties;
				consignorDetails			= response.consignorDetails;
				consigneeDetails			= response.consigneeDetails;

				if(detailsMessage) {
					$('#waybillDetailsmessage').html(detailsMessage);
					$('#updatePaymentBtn').remove();
					$('#viewPaymentDetails').remove();
					$('#waybillPaymentModemessage').removeClass('hide');
				}
				
				if(paymentTypeArr && !jQuery.isEmptyObject(paymentTypeArr)) {
					
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
					
					_this.updateWaybillPaymentMode();
				});
				
			});
			
			hideLayer();
		}, onPaymentTypeSelect : function() {
			if(!_this.setCashPaymentType()){
				return false;
			}
			if(!_this.validateSamePaymentType()) {
				return false;
			}
			if(!_this.validatePartyOnShortCreditPayment()) {
				return false;
			}
			if(BankPaymentOperationRequired){
				hideShowBankPaymentTypeOptions(document.getElementById("paymentType"));
				$('#storedPaymentDetails').empty();
			} else {
				if($('#paymentType').val() ==  PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID){
					$('#chequeDetailPanel').removeClass('hide');
					$('#chequeDate1').val(date(new Date(),"-"));
					$('#chequeDate1').datepicker({
						dateFormat: 'dd-mm-yy'
					});
				} else {
					$('#chequeDetailPanel').addClass('hide');
					$('#chequeNo1').val('');
					$('#bankName1').val('');
				}
			}
		}, setCashPaymentType : function() {
			
			if(GroupConfiguration.showCashPaymentTypeGstOnCongisneeAndConsignor == 'true' || GroupConfiguration.showCashPaymentTypeGstOnCongisneeAndConsignor == true){
				var consignorGSTNValue = consignorDetails.gstn;
				var consigneeGSTNValue = consigneeDetails.gstn;
				if(jQuery.isEmptyObject(consignorGSTNValue) && jQuery.isEmptyObject(consigneeGSTNValue)){
					if($('#paymentType').val() != PaymentTypeConstant.PAYMENT_TYPE_CASH_ID){ 
						showMessage('error', iconForErrMsg + ' ' + '  Consignor And Consignee GST No. Missing !');
						return false;
					}
				}
			}
						
			return true;
		}, validateSamePaymentType : function() {
			if($('#paymentType').val() == previousPaymentMode) {
				showMessage('error', iconForErrMsg + ' ' + ' Select other Payment Mode !');
				return false;
			}
			
			return true;
		},validatePartyOnShortCreditPayment : function(){
			if(!allowShortCreditPaymentForSavedParties){
				return true;
			}
			
			if($('#paymentType').val() ==  PaymentTypeConstant.PAYMENT_TYPE_CREDIT_ID){
				if(consignorDetails.corporateAccountId <= 0){
					setTimeout(function(){ 
						showMessage('info', " Short Credit Not Allowed For Consignor Party !");	
					}, 200);
					return false;
				}
			}
			return true;
		} , updateWaybillPaymentMode : function() {
			var paymentType = $('#paymentType').val();

			if(!validateInputTextFeild(1, 'paymentType', 'paymentType', 'error', iconForErrMsg + ' Please, Select Payment Mode !')) {
				return false;
			}
			
			if(!_this.setCashPaymentType()){
				return false;
			}
			
			if(!_this.validateSamePaymentType()) {
				return false;
			}
			if(!_this.validatePartyOnShortCreditPayment()) {
				return false;
			}

			if(BankPaymentOperationRequired && isValidPaymentMode(paymentType)) { //Defined in paymentTypeSelection.js
				var trCount = $("#storedPaymentDetails  tr").length;

				if(trCount == 0) {
					showMessage('error', iconForErrMsg + ' Please, Add Payment details!');
					return false;
				}	
			}
			
			var jsonObject 							= new Object();
			
			jsonObject["waybillId"] 				= waybillId;
			jsonObject["redirectTo"] 				= Number(redirectFilter);
			jsonObject["paymentMode"] 		   		= $('#paymentType').val();
			
			if(BankPaymentOperationRequired){
				jsonObject["paymentValues"]			= $('#paymentCheckBox').val();
			} else if($("#chequeDetailPanel").length > 0 && $('#paymentType').val() == PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID){
				jsonObject.chequeNumber				= $('#chequeNo1').val();
				jsonObject.chequeDate				= $('#chequeDate1').val();
				jsonObject.bankName					= $('#bankName1').val();
			}
						
			if(validatePhonePayTransaction && Number($('#paymentType').val()) == PaymentTypeConstant.PAYMENT_TYPE_PHONE_PAY_ID) {
				jsonObject.qrCodeMapperId = $('#qrCodeMapperId').val();
			}

			if(!doneTheStuff) {
				doneTheStuff = true;
				$('#updatePaymentBtn').hide();
				
			btModalConfirm = new Backbone.BootstrapModal({
				content		: 	"Do You Want To Change LR Payment Mode ?",
				modalWidth 	: 	30,
				title		:	'Update Payment Mode',
				okText		:	'YES',
				showFooter 	: 	true,
				okCloses	:	false
			}).open();
			
			btModalConfirm.on('ok', function() {
				showLayer();
				$('#updatePaymentBtn').hide();
				getJSON(jsonObject, WEB_SERVICE_URL+'/UpdateWayBillPaymentModeWS/updateWayBillPaymentMode.do', _this.onUpdate, EXECUTE_WITHOUT_ERROR);
			
			});
			btModalConfirm.on('cancel', function() {
				doneTheStuff = false;
				$('#updatePaymentBtn').show();
			});
		}
			
		},onUpdate : function(response) {
			if (response.message != undefined) {
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				hideLayer();
				doneTheStuff = false;
			}else{
				redirectToAfterUpdate(response);
			}
		}
	});
});

/*
 * pass date object with identifier and get normal for view
 */
function date(dateObject,identifier) {
	var d = new Date(dateObject);

	if(d == 'Invalid Date' || d == 'NaN') {
		var t = dateObject.split(/[- :]/);
		d = new Date(t[0], t[1]-1, t[2], t[3], t[4], t[5]);
	}

	var day = d.getDate();
	var month = d.getMonth() + 1;
	var year = d.getFullYear();
	if (day < 10) {
		day = "0" + day;
	}
	if (month < 10) {
		month = "0" + month;
	}
	var date = day + identifier + month + identifier + year;

	return date;
}