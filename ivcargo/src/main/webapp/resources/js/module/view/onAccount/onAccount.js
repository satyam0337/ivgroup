var moduleId,
ModuleIdentifierConstant,
incomeExpenseModuleId,
PaymentTypeConstant,

configuration = new Object();
configuration.allowDecimalCharacter		= 'true';
configuration.AllowedSpecialCharacters	= '46';
var GeneralConfiguration = null;

define([ 'marionette'
		,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
		,'selectizewrapper'
		,'JsonUtility'
		 ,'messageUtility'
		 ,'/ivcargo/resources/js/generic/urlparameter.js'
		,'nodvalidation'
		 ,'focusnavigation'
		 ,'/ivcargo/resources/js/backbone/backbone.bootstrap-modal.js'
		 ,'/ivcargo/resources/js/validation/regexvalidation.js'
	], function(Marionette, Selection, Selectizewrapper) {
	'use strict';// this basically give strictness to this specific js
	let jsonObject	= new Object(), myNod, doneTheStuff = false, _this = '';
	//this is used to get the access of key in onRender because this keyword is not found in onRender function
	return Marionette.LayoutView.extend({
		initialize: function() {
			_this = this;
		}, render: function() {
			getJSON(jsonObject, WEB_SERVICE_URL + '/onAccountWS/getOnAccountElementConfiguration.do?', _this.setElements, EXECUTE_WITHOUT_ERROR);
		}, setElements : function(response) {
			GeneralConfiguration		= response.generalConfiguration;
			PaymentTypeConstant			= response.PaymentTypeConstant;
			ModuleIdentifierConstant	= response.ModuleIdentifierConstant;
			incomeExpenseModuleId		= response.incomeExpenseModuleId;
			
			let loadelement 			= new Array();
			let baseHtml 				= new $.Deferred();
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/onAccount/onAccount.html",function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				
				$('#partyConfigureLink').click(function() {
					window.open('partyMaster.do?pageId=340&eventId=1&modulename=partyMaster');
				});
				
				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});
				
				let dateOption			= new Object();
				
				dateOption.minDate		= response.minDate;
				dateOption.maxDate		= response.maxDate;
				
				$("#dateEle").SingleDatePickerCus(dateOption);
				
				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	response.paymentTypeArr,
					valueField		:	'paymentTypeId',
					labelField		:	'paymentTypeName',
					searchField		:	'paymentTypeName',
					elementId		:	'paymentType',
					onChange		:	_this.onPaymentTypeSelect
				});
				
				Selectizewrapper.setAutocomplete({
					url				: 	WEB_SERVICE_URL+'/autoCompleteWS/getOnAccountPartyDetailsAutocomplete.do?',
					valueField		:	'corporateAccountId',
					labelField		:	'corporateAccountDisplayName',
					searchField		:	'corporateAccountDisplayName',
					elementId		:	'partyNameEle',
					responseObjectKey : 'result',
					create			: 	false,
					maxItems		: 	1
				});
				
				let bankPaymentOperationModel		= new $.Deferred();
					
				$("#bankPaymentOperationPanel").load("/ivcargo/html/module/paymentTypeSelection/paymentTypeSelection.html",function() {
					bankPaymentOperationModel.resolve();
				});
					
				loadelement 	= new Array();

				loadelement.push(bankPaymentOperationModel);

				$.when.apply($, loadelement).done(function() {
					$("#viewPaymentDetails").click(function() {
						openAddedPaymentTypeModel();
					});

					$("#addedPayment").click(function() {
						$("#addedPaymentTypeModal").modal('hide');
					});
						
					setIssueBankAutocomplete();
					setAccountNoAutocomplete();
				}).fail(function() {
					console.log("Some error occured");
				});
				
				$("#amountEle").keypress(function() {
					return isNumberKeyWithDecimal(event, this.id);
				});
				
				$("#amountEle").blur(function() {
					let amount	= $("#amountEle").val();
					
					$("#amountEle").val(numberWithCommas(amount));
				});
				
				myNod.add({
					selector		: '#partyNameEle',
					validate		: 'validateAutocomplete:#partyNameEle',
					errorMessage	: 'Please Select Party !'
				});
				
				myNod.add({
					selector		: '#paymentType',
					validate		: 'validateAutocomplete:#paymentType',
					errorMessage	: 'Please Select Payment Type !'
				});
				
				myNod.add({
					selector		: '#dateEle',
					validate		: 'presence',
					errorMessage	: 'Please Select Date !'
				});
				
				hideLayer();
				
				$("#saveBtn").click(function() {
					myNod.performCheck();

					if(myNod.areAll('valid')) {
						_this.onSave(_this);								
					}
				});
			});
		}, onPaymentTypeSelect	: function(_this){
			hideShowBankPaymentTypeOptions(document.getElementById("paymentType"));
		}, onSave : function() {
			let paymentType = $('#paymentType').val();

			if(paymentType == 0) {
				showMessage('error','Please, Select Payment Type for this expense !');
				hideLayer();
				return false;
			}

			if(isValidPaymentMode(paymentType)) { //Defined in paymentTypeSelection.js
				let trCount = $("#storedPaymentDetails  tr").length;
					
				if(trCount == 0) {
					showMessage('error','Please, Add Payment details for this On Account !');
					hideLayer();
					return false;
				}	
			}
			
			jsonObject	= new Object();
			
			let finalAmount		= $('#amountEle').val();
			let totalAmount		= finalAmount.replace(/,/g, "");
			
			let partyNameSelectize 	= $('#partyNameEle').get(0).selectize;
			let currentParty 		= partyNameSelectize.getValue(); 
			let partyNameObj		= partyNameSelectize.options[ currentParty ];
			let partyName		 	= partyNameObj.corporateAccountDisplayName;
			
			jsonObject.corporateAccountId		= $('#partyNameEle').val();
			jsonObject.createDate				= $('#dateEle').val();
			jsonObject.totalAmount				= totalAmount;
			jsonObject.remark					= $('#remarkEle').val();
			jsonObject.paymentType				= $('#paymentType').val();
			jsonObject.paymentValues			= $('#paymentCheckBox').val();
			jsonObject.partyName				= partyName;
			
			if(!doneTheStuff) {
				doneTheStuff = true;
				
				let btModalConfirm = new Backbone.BootstrapModal({
					content		: 	"Are you sure you want to continue ?",
					modalWidth 	: 	30,
					title		:	'On Account',
					okText		:	'YES',
					showFooter 	: 	true,
					okCloses	:	true
				}).open();

				btModalConfirm.on('ok', function() {
					getJSON(jsonObject, WEB_SERVICE_URL	+ '/onAccountWS/saveOnAccountPartyDetails.do?',	_this.setSuccess, EXECUTE_WITHOUT_ERROR);
					doneTheStuff = true;
					showLayer();
				});

				btModalConfirm.on('cancel', function() {
					$("#saveBtn").removeClass('hide');
					$("#saveBtn").attr("disabled", false);
					doneTheStuff = false;
					hideLayer();
				});
			}
		}, setSuccess : function (response) {
			location.reload();
			hideLayer();
		}
	});
});

function numberWithCommas(x) {
	let parts = x.toString().split(".");
	parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	return parts.join(".");
}

function isNumberKeyWithDecimal(evt,id) {
	let charCode = (evt.which) ? evt.which : event.keyCode;

	if(charCode == 46) {
		let txt = document.getElementById(id).value;
		
		if(txt.indexOf(".") <= -1)
			return true;
	}

	return !(charCode > 31 && (charCode < 48 || charCode > 57));
}