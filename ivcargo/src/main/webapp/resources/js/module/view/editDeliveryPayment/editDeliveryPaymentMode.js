var expenseDetailsList 				= null;
var chargeMasterList				= null;
var PaymentTypeConstant 			= null;
var moduleId 						= 0;
var incomeExpenseModuleId 			= 0;
var ModuleIdentifierConstant		= null;
var incomeExpenseChargeToExclude	= null;
var WayBillTypeConstant				= null;
var deliveryContactDetailsList		= new Array();
var doneTheStuff					= false;
var GeneralConfiguration			= null;

define([	
			'marionette'
			,'JsonUtility'
			,'messageUtility'
			,'/ivcargo/resources/js/generic/urlparameter.js'
	        ,'autocomplete'
	        ,'autocompleteWrapper'
	        ,'nodvalidation'
	        ,'focusnavigation'//import in require.config
	        ,'selectizewrapper'
	        ,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	        ,'/ivcargo/resources/js/module/redirectAfterUpdate.js'
	        ],function(Marionette,JsonUtility, MessageUtility, UrlParameter, AutoComplete, AutoCompleteWrapper,
		 NodValidation,ElementFocusNavigation,Selectizewrapper,BootstrapModal){
	'use strict';
	var _this = null, btModalConfirm,
	waybillId = 0,crId = 0,  paymentTypeArr = null,previousPaymentMode = 0, bankPaymentOperationRequired = false,
	isMultipleLrDelivery = false;
	return Marionette.LayoutView.extend({
		initialize : function(masterObj){
			_this = this;
			crId				= UrlParameter.getModuleNameFromParam('masterid');
		},render : function(){
			var jsonObject = new Object();
			
			jsonObject["crId"] 	= crId;
			
			getJSON(jsonObject, WEB_SERVICE_URL + '/editDeliveryPaymentWS/getWayBillDetailsByCrId.do?', _this.renderWayBillDetails, EXECUTE_WITHOUT_ERROR);
			return _this;
		},renderWayBillDetails : function(response){
			if(response.message != undefined) {
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				hideLayer();
				setTimeout(function() { 
					window.close();
				}, 1500);
				return;
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
			
			$("#mainContent").load("/ivcargo/html/module/editdeliverypayment/EditDeliveryPaymentDetails.html",
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
				
				PaymentTypeConstant				= response.PaymentTypeConstant;
				paymentTypeArr					= response.paymentTypeArr;
				moduleId						= response.moduleId;
				ModuleIdentifierConstant		= response.ModuleIdentifierConstant;
				incomeExpenseModuleId			= response.incomeExpenseModuleId;
				WayBillTypeConstant				= response.WayBillTypeConstant;
				deliveryContactDetailsList		= response.deliveryContactDetailsList;
				isMultipleLrDelivery			= response.isMultipleLrDelivery;
				
				if(paymentTypeArr && !jQuery.isEmptyObject(paymentTypeArr)) {
					for(var i=0;i<deliveryContactDetailsList.length;i++){

						if(deliveryContactDetailsList[i].wayBillTypeId == WayBillTypeConstant.WAYBILL_TYPE_CREDIT || deliveryContactDetailsList[i].wayBillTypeId == WayBillTypeConstant.WAYBILL_TYPE_PAID){
							for(var j=0;j<paymentTypeArr.length;j++){
								if(paymentTypeArr[j].paymentTypeId == PaymentTypeConstant.PAYMENT_TYPE_BILL_CREDIT_ID){
									paymentTypeArr.splice(j,1);
									break;
								}
							}
						}
					}

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
				
				previousPaymentMode		= deliveryContactDetailsList[0].deliveryContactDetailsPaymentType;
				
				$("#updateBtn").bind("click", function() {
					_this.updatePaymentMode();
				});
			});
		}, updatePaymentMode : function() {
			
			var paymentType = $('#paymentType').val();
			var remark		= $('#remarkEle').val();

			if(!validateInputTextFeild(1, 'paymentType', 'paymentType', 'error', iconForErrMsg + ' Please, Select Payment Mode !')) {
				return false;
			}

			if(!_this.validateSamePaymentType()) {
				return false;
			}
			
			if(paymentType == 4 && $('#partyEle').val() <= 0){
				showMessage('error', iconForErrMsg + ' Please, Select Billing Party !');
				return false;
			} 
			
			if(bankPaymentOperationRequired) {
				if(isValidPaymentMode(paymentType)) { //Defined in paymentTypeSelection.js
					var trCount = $("#storedPaymentDetails  tr").length;

					if(trCount == 0) {
						showMessage('error', iconForErrMsg + ' Please, Add Payment details!');
						return false;
					}	
				}
			}

			if(remark.length <= 0){
				showMessage('error', iconForErrMsg + ' Please, Enter Remark !');
				return false;
			}
			
			var jsonObject 						= new Object();

			jsonObject.crId						= crId;
			jsonObject.paymentType 		   		= $('#paymentType').val();
			jsonObject.paymentValues			= $('#paymentCheckBox').val();
			jsonObject.billingPartyId			= $('#partyEle').val();
			jsonObject.remark					= $('#remarkEle').val();
			
			if(!doneTheStuff) {
				doneTheStuff = true;
				$('#updateBtn').hide();

				btModalConfirm = new Backbone.BootstrapModal({
					content		: 	"Are you sure you want to Update Payment Mode ?",
					modalWidth 	: 	30,
					title		:	'Update Payment Mode',
					okText		:	'YES',
					showFooter 	: 	true,
					okCloses	:	false
				}).open();

				btModalConfirm.on('ok', function() {
					doneTheStuff = true;
					showLayer();

					if(isMultipleLrDelivery) {
						getJSON(jsonObject, WEB_SERVICE_URL+'/editDeliveryPaymentWS/updateDeliveryPaymentModeForMultipleLr.do', _this.onUpdate, EXECUTE_WITH_ERROR); 
					} else {
						getJSON(jsonObject, WEB_SERVICE_URL+'/editDeliveryPaymentWS/updateDeliveryPaymentMode.do', _this.onUpdate, EXECUTE_WITH_ERROR); 
					}
				});

				btModalConfirm.on('cancel', function() {
					doneTheStuff = false;
					$('#updateBtn').show();
				});
			}
			
		}, onPaymentTypeSelect : function() {
			if(!_this.validateSamePaymentType()) {
				return false;
			}
			
			if(bankPaymentOperationRequired) {
				hideShowBankPaymentTypeOptions(document.getElementById("paymentType"));
			}
			$('#storedPaymentDetails').empty();
			if($("#paymentType").val() == PaymentTypeConstant.PAYMENT_TYPE_BILL_CREDIT_ID){
				$("#billingPartyName").removeClass('hide');
				Selectizewrapper.setAutocomplete({
					url 				: 	WEB_SERVICE_URL+'/autoCompleteWS/getTBBPartyDetailsAutocomplete.do?',
					valueField			:	'corporateAccountId',
					labelField			:	'corporateAccountDisplayName',
					searchField			:	'corporateAccountDisplayName',
					elementId			:	'partyEle',
					responseObjectKey 	: 	'result',
					create				: 	false,
					maxItems			: 	1
				});
			} else{
				$("#billingPartyName").addClass('hide');
				$('#partyEle').val(0);
			}
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