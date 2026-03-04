var branchIncomeExpenseCount = 1;
var curDate;
var curId				= 3;
var date				= "date_";
var IncomeExpheadName	= "IncomeExpheadName_";
var headId				= "headId_";
var amount				= "amount_";
var remark				= "remark_";
var VoucherType			= null;
var companyId			= 0;
var groupWiseCompanyNameList	= null;
var IncomeExpenseVoucherConstant	= null;
var BranchExpenseConfiguration		= null;
var branchExpensePrintNewFlowAllow	= false;
var voucherDetailsId				= 0;
var branchIncomeVoucherDetailsId	= 0;
var paymentVoucherSequenceNumber	= "";

define(
		[
		 'JsonUtility',
		 'messageUtility',
		 '/ivcargo/resources/js/generic/urlparameter.js',
		 'jquerylingua',
		 'language',
		 'autocomplete',
	     'autocompleteWrapper',
		 'bootstrapSwitch',
		 'nodvalidation',
		 'focusnavigation',
		 PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js',
		 PROJECT_IVUIRESOURCES + '/resources/js/populateautocomplete/selectoption.js'],
		 function(JsonUtility, MessageUtility, UrlParameter, Lingua, Language, AutoComplete, AutoCompleteWrapper, BootstrapSwitch, NodValidation, FocusNavigation,
				 BootstrapModal, Selection) {
			'use strict';
			var jsonObject = new Object(), _this = null, BranchExpenseConfiguration = null,
			voucherDetailsId = 0, paymentVoucherSequenceNumber = "";
			return Marionette.LayoutView.extend({
				initialize : function(masterObj) {
					_this = this;
					voucherDetailsId				= UrlParameter.getModuleNameFromParam('voucherDetailsId');
					branchIncomeVoucherDetailsId	= UrlParameter.getModuleNameFromParam('branchIncomeVoucherDetailsId');
					paymentVoucherSequenceNumber  	= UrlParameter.getModuleNameFromParam('paymentVoucherSequenceNumber');
				}, render : function() {
					getJSON(jsonObject, WEB_SERVICE_URL	+ '/branchIncomeExpenseWS/loadBranchVoucherExpense.do?', _this.loadBranchVoucherExpenseEelements, EXECUTE_WITHOUT_ERROR);
					return _this;
				}, loadBranchVoucherExpenseEelements : function(response) {
					showLayer();

					var loadelement = new Array();
					var baseHtml 	= new $.Deferred();
					loadelement.push(baseHtml);
					
					$("#mainContent").load("/ivcargo/html/module/expense/BranchVoucher.html",
							function() {
								baseHtml.resolve();
					});
					
					$.when.apply($, loadelement).done(function() {
						hideLayer();
						//loadLanguageWithParams(FilePath.loadLanguage());
						
						groupWiseCompanyNameList		= response.groupWiseCompanyNameList;
						IncomeExpenseVoucherConstant	= response.IncomeExpenseVoucherConstant;
						BranchExpenseConfiguration		= response.BranchExpenseConfiguration;
						branchExpensePrintNewFlowAllow 	= BranchExpenseConfiguration.branchExpensePrintNewFlowAllow;
						
						_this.setCompanyName(response.groupWiseCompanyNameList, 'companyName_1');
						
						if(typeof response.previousDate != 'undefined') {
							$( function() {
								$('#date_1').val(dateWithDateFormatForCalender(new Date(),"-"));
								$('#date_1').datepicker({
									maxDate		: response.currentDate,
									minDate		: response.previousDate,
									showAnim	: "fold",
									dateFormat	: 'dd-mm-yy',
									onSelect: function (selectedDate) {
										$( "#dateForAll" ).val(selectedDate);
						            }
								});
							} );
						}
						
						$( "#date_1" ).val(response.currentDate);
						$( "#date_1" ).prop("readonly", true);
						$( "#dateForAll" ).val($( "#date_1" ).val());
						
						$("#searchBy").autocomplete({
						    source: function (request, response) {
						        $.getJSON(WEB_SERVICE_URL+'/autoCompleteWS/getDeliveryPointDestinationBranch.do?term=' + request.term + '&branchType=3&isOwnBranchRequired=true&isOwnBranchWithLocationsRequired=true', function (data) {
						            response($.map(data.branchModel, function (item) {
						                return {
						                    label			: item.branchDisplayName,
						                    value			: item.branchDisplayName,
						                    id				: item.branchId
						                };
						            }));
						        });
						    }, select: function (e, u) {
						    	$('#BranchId').val(u.item.id);
						    },
						    minLength: 2,
						    delay: 250
						});
						
						$("#IncomeExpheadName_1").autocomplete({
						    source: function (request, response) {
						        $.getJSON(WEB_SERVICE_URL+'/autoCompleteWS/getActiveIncomeExpenseHeadersList.do?term=' + request.term + '&incExpType=1&chargeType=3', function (data) {
						            response($.map(data.result, function (item) {
						                return {
						                    label		: item.chargeName,
						                    value		: item.chargeName,
						                    id			: item.incomeExpenseChargeMasterId
						                };
						            }));
						        });
						    }, select: function (e, u) {
						    	$('#headId_1').val(u.item.id);
						    	
						    	if(document.getElementById('amount_1') != null) {
						    		document.getElementById('amount_1').focus();
						    	}
						    },
						    minLength: 2,
						    delay: 100
						});
						
						if(voucherDetailsId > 0) {
							$('#datasaved').html('<b style="font-size: 16px;"> Office Expense Saved successfully ! Voucher No :</b> is <b>' + paymentVoucherSequenceNumber + '</b>&emsp;<button type="button" name="reprintBtn" id="reprintBtn" class="btn btn-success" data-tooltip="Reprint">Reprint</button><div class="row">&nbsp;</div>');
							$("#reprintBtn").bind("click", function() {
								_this.openPrintForVoucherBill(voucherDetailsId);
							});
						}
						
						if(branchIncomeVoucherDetailsId > 0) {
							$('#datasaved').html('<b style="font-size: 16px;"> Income Expense Saved successfully ! Voucher No :</b> is <b>' + paymentVoucherSequenceNumber + '</b>&emsp;<button type="button" name="reprintBtn" id="reprintBtn" class="btn btn-success" data-tooltip="Reprint">Reprint</button><div class="row">&nbsp;</div>');
							$("#reprintBtn").bind("click", function() {
								_this.printBranchIncomeVoucher(branchIncomeVoucherDetailsId);
							});
						}
						
						$("#viewAllHeadsBtn").bind("click", function() {
							window.open ('viewDetails.do?pageId=340&eventId=2&modulename=incomeExpenseHeadDetails&incExpType=3&chargeType=3','newwindow', 'config=height=500,width=650, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
						});
						
						$("#save").bind("click", function() {
							if(!validateInputTextFeild(1, 'BranchId', 'searchBy', 'error', 'Select Branch !')) {
								return false;
							}
							
							if(!validateInputTextFeild(1, 'voucherType', 'voucherType', 'error', 'Select Type !')) {
								return false;
							}
							
							if($("#voucherType").val() == IncomeExpenseVoucherConstant.INCOME_VOUCHER_ID) {
								_this.saveWayBillIncome();
							} else if($("#voucherType").val() == IncomeExpenseVoucherConstant.EXPENSE_VOUCHER_ID) {
								_this.saveWayBillExpenses();
							}
						});
					});
				}, setCompanyName : function(companyNameList, id) {
					createOptionInSelectTag(id, 0, 0, '-- Select Company --');
					
					for (var i = 0; i < companyNameList.length; i++) {
						createOptionInSelectTag(id, companyNameList[i].groupWiseCompanyNameId, companyNameList[i].groupWiseCompanyNameId, companyNameList[i].groupWiseCompanyName)
					}
				}, saveWayBillIncome : function() {
					if(!_this.validateDetails()) {
						return false;
					}
					
					$("#save").addClass('hide');

					var table 		= document.getElementById('mainTable');
					var rowCount 	= table.rows.length;
					var jsonObjectdata;

					var 			ary = [];

					for (var i = 1; i <= rowCount - 3; i++) {
						jsonObjectdata			= new Object();

						jsonObjectdata.amount					= $('#amount_'+i).val();
						jsonObjectdata.remark					= $('#remark_'+i).val();
						jsonObjectdata.headId					= $('#headId_'+i).val();
						companyId								= $('#companyName_'+i).val();
						jsonObjectdata.companyId				= $('#companyName_'+i).val();

						ary.push(jsonObjectdata);
					}
					
					if(ary.length == 0) {
						$("#save").removeClass('hide');
						showMessage('error', 'Amount Details Not Entered, Try Again !');
						return;
					}

					var jsonObject	= new Object();

					jsonObject.branchId				= $('#BranchId').val();
					jsonObject.companyId 			= companyId;
					jsonObject.branchIncomeCount	= branchIncomeExpenseCount;
					jsonObject.incomeDateForAll		= $("#dateForAll").val();
					jsonObject.branchIncomes		= JSON.stringify(ary);

					var btModalConfirm = new Backbone.BootstrapModal({
						content		: 	"Are you sure you want to save these Branch Income ?",
						modalWidth 	: 	30,
						title		:	'Branch Income',
						okText		:	'YES',
						showFooter 	: 	true,
						okCloses	:	true
					}).open();

					btModalConfirm.on('ok', function() {
						getJSON(jsonObject, WEB_SERVICE_URL + '/branchIncomeExpenseWS/insertBranchIncome.do', _this.setResponseAfterIncome, EXECUTE_WITH_ERROR);
						showLayer();
					});
					
					btModalConfirm.on('cancel', function() {
						$("#save").removeClass('hide');
						hideLayer();
					});
				}, setResponseAfterIncome : function(response) {
					var errorMessage = response.message;
					showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
					
					if (response.wayBillIncomeVoucherDetailsId != undefined) {
						var MyRouter = new Marionette.AppRouter({});
						MyRouter.navigate('&modulename=branchVoucher&branchIncomeVoucherDetailsId=' + response.wayBillIncomeVoucherDetailsId + '&paymentVoucherSequenceNumber=' + response.ReceiptVoucherSequenceNumber+'&print=true',{trigger: true});
						setTimeout(function(){ location.reload(); }, 1000);
						
						_this.printBranchIncomeVoucher(response.wayBillIncomeVoucherDetailsId);
					}
					
					hideLayer();
				}, saveWayBillExpenses : function() {
					if(!_this.validateDetails()) {
						return false;
					}
					
					$("#save").addClass('hide');
					
					var jsonObject				= new Object();
					var jsonObjectdata;
					var table 		= document.getElementById('mainTable');
					var rowCount 	= table.rows.length;

					var 			ary = [];

					for (var i = 1; i <= rowCount - 3; i++) {
						jsonObjectdata			= new Object();

						jsonObjectdata.amount					= $('#amount_'+i).val();
						jsonObjectdata.remark					= $('#remark_'+i).val();
						jsonObjectdata.headId					= $('#headId_'+i).val();

						companyId								= $('#companyName_'+i).val();
						jsonObjectdata.companyId				= $('#companyName_'+i).val();

						ary.push(jsonObjectdata);
					}

					var btModalConfirm = new Backbone.BootstrapModal({
						content		: 	"Are you sure you want to save these Branch Expense ?",
						modalWidth 	: 	30,
						title		:	'Branch Expense',
						okText		:	'YES',
						showFooter 	: 	true,
						okCloses	:	true
					}).open();

					jsonObject.branchId				= $('#BranchId').val();
					jsonObject.companyId 			= companyId;
					jsonObject.branchExpenseCount 	= branchIncomeExpenseCount;
					jsonObject.expenseDateForAll	= $("#dateForAll").val();
					jsonObject.branchExpenses		= JSON.stringify(ary);

					btModalConfirm.on('ok', function() {
						getJSON(jsonObject, WEB_SERVICE_URL + '/branchIncomeExpenseWS/insertBranchExpense.do', _this.setResponseAfterExpense, EXECUTE_WITH_ERROR);
						showLayer();
					});

					btModalConfirm.on('cancel', function() {
						$("#save").removeClass('hide');
						hideLayer();
					});
				},setResponseAfterExpense : function(response) {
					var errorMessage = response.message;
					showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
					
					if (response.exepenseVoucherDetailsId != undefined) {
						var MyRouter = new Marionette.AppRouter({});
						MyRouter.navigate('&modulename=branchVoucher&voucherDetailsId=' + response.exepenseVoucherDetailsId + '&paymentVoucherSequenceNumber=' + response.PaymentVoucherSequenceNumber+'&print=true',{trigger: true});
						setTimeout(function(){ location.reload(); }, 1000);
						
						_this.openPrintForVoucherBill(response.exepenseVoucherDetailsId);
					}
					
					hideLayer();
				}, validateDetails() {
					var table 		= document.getElementById('mainTable');
					var rowCount 	= table.rows.length;
					
					for (var i = 1; i <= rowCount - 3; i++) {
						if(!validateInputTextFeild(1, 'headId_' + i, 'IncomeExpheadName_' + i, 'error', properIncomeTypeErrMsg)) {
							return false;
						}
						
						if(!validateInputTextFeild(1, 'IncomeExpheadName_' + i, 'IncomeExpheadName_' + i, 'error', incomeTypeErrMsg)) {
							return false;
						}
						
						if(!validateInputTextFeild(1, 'amount_' + i, 'amount_' + i, 'error', 'Enter Amount')) {
							return false;
						}

						if(!validateInputTextFeild(1, 'remark_' + i, 'remark_' + i, 'error', 'Enter Remark')) {
							return false;
						}
					}

					return true;
				}, openPrintForVoucherBill : function(voucherDetailsId) {
					if(BranchExpenseConfiguration != null && BranchExpenseConfiguration.branchExpensePrintNewFlowAllow) {
						window.open('BillPrint.do?pageId=25&eventId=43&voucherDetailsId='+voucherDetailsId, 'newwindow', 'config=height=410,width=700, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
					} else {
						window.open('BranchExpensePrint.do?pageId=25&eventId=16&voucherDetailsId=' + voucherDetailsId, 'newwindow', 'config=height=610,width=1000, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
					}
				}, printBranchIncomeVoucher : function(branchIncomeVoucherDetailsId) {
					window.open('WayBillIncomePrint.do?pageId=52&eventId=9&branchIncomeVoucherDetailsId='+branchIncomeVoucherDetailsId, 'newwindow', 'config=height=410,width=700, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
				}
			});
		});

function resetHeadId() {
	$('#' + headId).val(0);
}