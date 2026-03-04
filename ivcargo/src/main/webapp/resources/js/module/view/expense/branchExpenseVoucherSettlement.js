
var moduleId 						= 0;
var incomeExpenseModuleId 			= 0;
var ModuleIdentifierConstant		= null;
var executive;
var tdsConfiguration;
var BankPaymentOperationRequired;
var grandTotal;
var paymentTypeConstantsList;
var PaymentStatusConstants;
var grandTotalBalanceAmount;
var totalReceivedAmount;
var GeneralConfiguration;
var PaymentTypeConstant;
var doneTheStuff					= false;

define([
	'JsonUtility'
	,'messageUtility'
	,PROJECT_IVUIRESOURCES + '/resources/js/module/view/expense/branchExpenseVoucherSettlementfilepath.js'
	 ,'jquerylingua'
	 ,'autocomplete'
	 ,'autocompleteWrapper'
	 ,'language'
	 ,'nodvalidation'
	 ,'slickGridWrapper2'
	 ,PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js'
	 ,'/ivcargo/resources/js/backbone/backbone.bootstrap-modal.js'
	 ,PROJECT_IVUIRESOURCES+'/resources/js/module/view/expense/setBranchExpenseVoucherSettlementElements.js'
],function(JsonUtility, MessageUtility, FilePath, Lingua, AutoComplete, AutoCompleteWrapper,Language,NodValidation,slickGridWrapper2,UrlParameter,BootstrapModal){
	'use strict';
	var jsonObject = new Object(), myNod, masterLangObj, masterLangKeySet, gridObject,_this = '';

	return Marionette.LayoutView.extend({
		initialize : function(masterObj){
			_this = this;
		},render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/branchIncomeExpenseWS/getSettleBranchExpenseVoucherElement.do?',	_this.setSettleBranchExpenseVoucherElement, EXECUTE_WITHOUT_ERROR);
			return _this;
		},setSettleBranchExpenseVoucherElement : function(response){

			if(response.message != undefined) {
				hideLayer();
				$('#middle-border-boxshadow').addClass('hide');
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);;
				return;
			}
			console.log('response ',response)
			
			var loadelement 					= new Array();
			var baseHtml 						= new $.Deferred();
			var paymentHtml						= new $.Deferred();
			moduleId							= response.moduleId;
			incomeExpenseModuleId				= response.incomeExpenseModuleId;
			ModuleIdentifierConstant			= response.ModuleIdentifierConstant;
			BankPaymentOperationRequired		= response.BankPaymentOperationRequired;
			executive							= response.executive;
			tdsConfiguration					= response.BranchExpenseTdsProperty;
			GeneralConfiguration				= response.GeneralConfiguration;
			BankPaymentOperationRequired		= GeneralConfiguration.BankPaymentOperationRequired;
			console.log('paymentTypeArr --- 1', paymentTypeConstantsList)
			paymentTypeConstantsList			= response.paymentTypeArr;
			PaymentTypeConstant					= response.PaymentTypeConstant;
			console.log('paymentTypeArr --- 2',PaymentTypeConstant)
			PaymentStatusConstants 				= new Array();
			
			PaymentStatusConstants[1] = {'Id':1,'Value':'Due Payment'};
			PaymentStatusConstants[1] = {'Id':2,'Value':'Clear Payment'};
			PaymentStatusConstants[2] = {'Id':3,'Value':'Partial Payment'};
			PaymentStatusConstants[3] = {'Id':4,'Value':'Negotiated payment'};
			
			if(BankPaymentOperationRequired) {
				loadelement.push(paymentHtml);
			}
			
			loadelement.push(baseHtml);
			$("#mainContent").load("/ivcargo/html/module/expense/branchExpenseVoucherSettlement.html",function() {
				baseHtml.resolve();
			});
			
		
			
			if(BankPaymentOperationRequired) {
				$("#bankPaymentOperationPanel").load("/ivcargo/html/module/paymentTypeSelection/paymentTypeSelection.html",
						function() {
						paymentHtml.resolve();
				});
			}
			
			$.when.apply($, loadelement).done(function(){

				var keyObject = Object.keys(response);
				for (var i = 0; i < keyObject.length; i++) {
					if (response[keyObject[i]].show == true) {
						$("*[data-attribute="+ keyObject[i]+ "]").addClass("show");
					}
				}
				
				var elementConfiguration	= new Object();

				elementConfiguration.yearElement		= $('#yearEle');
				response.elementConfiguration			= elementConfiguration;

				masterLangObj 		= FilePath.loadLanguage();
				masterLangKeySet 	= loadLanguageWithParams(masterLangObj);
				
				console.log('paymentTypeConstantsList --- ', paymentTypeConstantsList)
				if(!jQuery.isEmptyObject(paymentTypeConstantsList)) {
					$("#paymentType").append($("<option>").attr('value', 0).text('---Select Mode---'));
					var paymentTypeArr	= paymentTypeConstantsList;

					for(var i = 1; i < paymentTypeArr.length; i++) {
						$("#paymentType").append($("<option>").attr('value', paymentTypeArr[i].paymentTypeId).text(paymentTypeArr[i].paymentTypeName));
					}
				}

				if(!jQuery.isEmptyObject(PaymentStatusConstants)) {
					$("#paymentStatus").append($("<option>").attr('value', 0).text('---Select Type---'));
					var paymentStatusArr	= PaymentStatusConstants;
					console.log('PaymentStatusConstants --- ', PaymentStatusConstants)
					for(var i = 1; i < PaymentStatusConstants.length; i++) {
						$("#paymentStatus").append($("<option>").attr('value', PaymentStatusConstants[i].Id).text(PaymentStatusConstants[i].Value));
					}
				}
				
				if(BankPaymentOperationRequired) {
					setIssueBankAutocomplete();
					setAccountNoAutocomplete();
					$('#myModal').remove();
				} else {
					$('#paymentTypeSelection').remove();
				}
				
				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});

				myNod.add({
					selector		: '#voucherNoEle',
					validate		: ['presence'],
					errorMessage	: ['Enter a Voucher Number']
				});

				hideLayer();
				$("#findBtn").click(function() {
					myNod.performCheck();
					if(myNod.areAll('valid')) {
						_this.onSubmit();								
					}
				});
				
				$("#saveBtn").click(function() {
					if(!doneTheStuff) {
						_this.settleVoucher(_this);		
					}
				});
				
				hideLayer();
				
			});
			
		}, onSubmit : function (){
			showLayer();
			var jsonObject 						= new Object();
			jsonObject["paymentVoucherNumber"] 	= $('#voucherNoEle').val();
			
			getJSON(jsonObject, WEB_SERVICE_URL+'/branchIncomeExpenseWS/getBranchExpenseVoucherDetails.do',_this.setReportData, EXECUTE_WITH_ERROR);
		}, setReportData : function (response){
			
			if(response.message != undefined) {
				hideLayer();
				$('#bottom-border-boxshadow').addClass('hide');
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);;
				return false;
			}
			console.log('response ',response)
			$('#bottom-border-boxshadow').removeClass('hide');
			response.PaymentTypeConstant = PaymentTypeConstant;
			setPaymentPanel(response);
			
			hideLayer();
		}, settleVoucher : function (response) {
			var isAllowFlag	= false;
			console.log('PaymentVoucherDetails --- ', PaymentVoucherDetails);
			console.log('primaryId --- ', primaryId);
			
			for(var i = 0; i < PaymentVoucherDetails.length; i++) {
				if(parseInt($('#receiveAmt_' + primaryId).val()) > 0) {
					if(!validateBeforeSave(document.getElementById('receiveAmt_' + primaryId))) {
						return false;
					}
					
					isAllowFlag	= true;
				} else if(parseInt($('#receiveAmt_' + primaryId).val()) < 0
						&& parseInt($('#grandTotal_' + primaryId).val()) < 0) {
				
					if(!validateBeforeSave(document.getElementById('receiveAmt_' + primaryId))) {
						return false;
					}
					
					isAllowFlag	= true;
				}
			}
			
			if(!isAllowFlag) {
				showMessage('error', 'Please Provide amount for payment');
				return false;
			}
			
			$("#UpSaveButton").addClass('hide');

			var btModalConfirm = new Backbone.BootstrapModal({
				content		: 	"Are you sure you want to clear these Expenses ?",
				modalWidth 	: 	30,
				title		:	'Voucher Payment',
				okText		:	'YES',
				showFooter 	: 	true,
				okCloses	:	true
			}).open();
			
			if(!doneTheStuff) {
				btModalConfirm.on('ok', function() {
					
					var jsonObject 		= new Object();
					var voucherData		= null;
					var branchExpenseCount = 1;
					var totalvoucherDataArr		= new Array();
					var voucherData				= new Object();
					var receiveAmt				= $('#receiveAmt_' + primaryId).val();
					var settledAmount			= $('#receivedAmt_' + primaryId).val();
					voucherData					= new Object();

					voucherData.exepenseVoucherDetailsId= primaryId;
					voucherData.voucherNumber			= $('#billNumber_' + primaryId).val();
					voucherData.grandTotal				= $('#grandTotal_' + primaryId).val();
					voucherData.amount					= receiveAmt;
					voucherData.settledAmount			= settledAmount;
					voucherData.balanceAmount			= $('#balanceAmt_' + primaryId).val();
					voucherData.paymentStatus			= $('#paymentStatus').val();
					voucherData.paymentType				= $('#paymentType').val();
					voucherData.chequeDate				= $('#chequeDate').val();
					voucherData.chequeNumber			= $('#chequeNumber').val();
					voucherData.bankName				= $('#bankName').val();
					voucherData.remark					= $('#remark_' + primaryId).val();
					voucherData.tdsAmount				= $('#tdsAmt_' + primaryId).val();
					voucherData.tdsRate					= $('#tdsRate_' + primaryId).val();
					voucherData.branchExpenseCount		= branchExpenseCount;
					var rowCount 		= $('#storedPaymentDetails tr').length;

					if(!$('#storedPaymentDetails').is(':empty') && rowCount > 0) {
						var paymentCheckBoxArr			= getAllCheckBoxSelectValue('paymentCheckBox');
						voucherData.paymentValues	= paymentCheckBoxArr.join(',');
					}
					
					if(!doneTheStuff) {
						getJSON(voucherData, WEB_SERVICE_URL + '/branchIncomeExpenseWS/saveBranchExpenseVoucher.do', _this.getResponseData, EXECUTE_WITH_ERROR);
						doneTheStuff = true;
					}
					
					showLayer();
				});
			}

			btModalConfirm.on('cancel', function() {
				$("#UpSaveButton").removeClass('hide');
				$("#DownSaveButton").removeClass('hide');
				doneTheStuff = false;
				hideLayer();
			});
		}, getResponseData : function(response) {
			
			if(response.message != undefined) {
				var errorMessage	= response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				refreshAndHidePartOfPage('bottom-border-boxshadow', 'hide');
				setTimeout(function(){ location.reload(); }, 1000);
				hideLayer();
				return;
			}
			
			hideLayer();
		}
	});
});
