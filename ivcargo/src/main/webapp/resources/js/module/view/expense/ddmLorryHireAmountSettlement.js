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
			var jsonObject = new Object(), myNod, corporateAccountId = 0,  _this = '', ddmLorryHireTdsProperty, tdsChargeList, BranchExpenseConfiguration = null, executive, isAllowToEditBill = true, btModalConfirm,
			exepenseVoucherDetailsId = 0, paymentVoucherSequenceNumber = "",allowPartialPayment = false,c = 0,doneTheStuff	= false,TOKEN_KEY = null, TOKEN_VALUE = null;
			return Marionette.LayoutView.extend({
				initialize : function(masterObj) {
					_this = this;
					exepenseVoucherDetailsId 		= UrlParameter.getModuleNameFromParam('voucherDetailsId');
					paymentVoucherSequenceNumber  	= UrlParameter.getModuleNameFromParam('paymentVoucherSequenceNumber');
				}, render : function() {
					getJSON(jsonObject, WEB_SERVICE_URL	+ '/ddmLorryHireAmountSettlementWS/loadDDMLorryHireAmount.do?', _this.renderDDMLorryHireAmountSettlementElements, EXECUTE_WITH_ERROR);
					return _this;
				}, renderDDMLorryHireAmountSettlementElements : function(response) {
					var isExpenseType	= true;
					TOKEN_KEY						= response.TOKEN_KEY;
					TOKEN_VALUE						= response.TOKEN_VALUE;
					if(response.message != undefined) {
						var errorMessage = response.message;
						showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
						_this.createLinkToInsertExpense(response.isExpenseMasterPermission);
						isExpenseType	= false;
					}

					var loadelement = new Array();
					var baseHtml 	= new $.Deferred();
					loadelement.push(baseHtml);

					$("#mainContent").load("/ivcargo/html/module/expense/DDMLorryHireAmountSettlement.html",
							function() {
						baseHtml.resolve();
					});

					$.when.apply($, loadelement).done(function() {
						setTimeout(() => {
							if(isExpenseType) $('#ddmSearchDiv').removeClass('hide');
						}, 200);
						
						refreshAndHidePartOfPage('bottom-border-boxshadow', 'hide');
						refreshAndHidePartOfPage('middle-border-boxshadow', 'hide');
						hideLayer();
						//loadLanguageWithParams(FilePath.loadLanguage());

						executive					= response.executive;

						$("#ddmNumberEle").focus();

						response.executiveTypeWiseBranch	= true;

						var elementConfiguration	= new Object();

						elementConfiguration.branchElement		= $('#branchEle');

						response.elementConfiguration	= elementConfiguration;

						Selection.setSelectionToGetData(response);

						myNod = nod();
						myNod.configure({
							parentClass:'validation-message'
						});

						myNod.add({
							selector		: '#ddmNumberEle',
							validate		: 'presence',
							errorMessage	: 'Enter DDM Number !'
						});

						myNod.add({
							selector		: '#branchEle',
							validate		: 'presence',
							errorMessage	: 'Select Branch !'
						});

						$("#findBtn").click(function() {
							myNod.performCheck();

							if(myNod.areAll('valid')) {
								_this.onFind(0);
							}
						});
						
						$("#DDMDetailsDiv").bind("click", function() {
							_this.showHideDDMDetailsDiv();
						});
						
						$("#showHideSettlementSummary").bind("click", function() {
							_this.showHideLorryHiewSummary();
						});

						if(exepenseVoucherDetailsId > 0 && paymentVoucherSequenceNumber != null) {
							$('#reprintOption').html('<b>Voucher No :</b> ' + paymentVoucherSequenceNumber + '&emsp;<button type="button" name="reprintBtn" id="reprintBtn" class="btn btn-success" data-tooltip="Reprint">Reprint</button><div class="row">&nbsp;</div>');
							_this.openPrint(exepenseVoucherDetailsId);

							$("#reprintBtn").bind("click", function() {
								_this.openPrint(exepenseVoucherDetailsId);
							});
						}
					});
				}, createLinkToInsertExpense : function (isExpenseMasterPermission) {
					var insertExpenseLinkButton	= $("<button/>", { 
						type			: 'button', 
						class			: 'form-control btn btn-primary',
						html			: 'Add Expense Type',
						onclick			: 'javascript: openWindowForInsertExpense('+ isExpenseMasterPermission +')',
						style			: 'margin-right : 20px; width : 200px;'
					});

					setTimeout(() => {
						$('#ExpenseEntryLinkId').append(insertExpenseLinkButton);
					}, 100);

					var refreshLinkButton	= $("<button/>", { 
						type			: 'button', 
						class			: 'form-control btn btn-warning',
						html			: 'Refresh',
						style			: 'margin-right : 20px; width : 200px;',
						onclick			: 'window.location.reload()'
					});

					setTimeout(() => {
						$('#ExpenseEntryLinkId').append(refreshLinkButton);
					}, 100);
				}, onFind : function(deliveryRunSheetLedgerId) {
					showLayer();
					var jsonObject = new Object();

					if(deliveryRunSheetLedgerId > 0) {
						jsonObject.deliveryRunSheetLedgerId			= deliveryRunSheetLedgerId;
					} else {
						var DDMNumber				= $('#ddmNumberEle').val();

						jsonObject.DDMNumber		= DDMNumber.replace(/\s+/g, "");
						jsonObject.branchId			= $('#branchEle_primary_key').val();
					}

					getJSON(jsonObject, WEB_SERVICE_URL + '/ddmLorryHireAmountSettlementWS/getDDMLorryHireAmountSettlementData.do', _this.setDDMDetailsData, EXECUTE_WITH_ERROR);
				},setDDMDetailsData : function(response) {
					if(response.message != undefined) {
						hideLayer();
						refreshAndHidePartOfPage('bottom-border-boxshadow', 'hide');
						refreshAndHidePartOfPage('middle-border-boxshadow', 'hide');

						return;
					}
					showPartOfPage('middle-border-boxshadow');
					$('#deliveryRunSheetLedgerDetails tbody').empty();
					_this.setDataInTable(response);
					hideLayer();
				}, setDataInTable : function(data) {
					var columnArray						= new Array();
					var deliveryRunSheetLedgerlist		= data.DeliveryRunSheetLedger;
					var ddmLorryHireSummary				= data.expenseSettlementList;
					var paymentStatusArrForSelection ; 
					var allowBackDateEntry= data.allowBackDateEntry;
					
					if(allowBackDateEntry && deliveryRunSheetLedgerlist.length > 0) {
						var creationDate = new Date(deliveryRunSheetLedgerlist[0].creationDateTimeString.split('-').reverse().join('-'));
						
						$('.settlementDateCol').removeClass('hide');
						
						$("#settlementDate").datepicker("destroy").val(dateWithDateFormatForCalender(new Date(), "-"))
							.datepicker({
								minDate: creationDate,   
								maxDate: new Date(),   
								showAnim: "fold",
								dateFormat: "dd-mm-yy"
							});
					} else {
   						$('.settlementDateCol').addClass('hide');
					}

					$('#showHideDDMDetailsButtonDiv').removeClass('hide');
					$('#deliveryRunSheetLedgerDetails tbody').empty();
					$('#ddmLoryyHireSummaryTable tbody').empty();
					$('#showHideDDMDetailsButtonDiv').removeClass('hide');
					$('#ddmLoryyHireSummaryTable tbody').empty();
					$('#ddmLoryyHireSummaryTable tfoot').empty();
					$( "#btSubmit").unbind( "click" );

					if(deliveryRunSheetLedgerlist.length == 1) {
						showPartOfPage('bottom-border-boxshadow');
						ddmLorryHireTdsProperty			= data.DDMLorryHireTdsProperty;
						tdsChargeList					= data.TDSChargeInPercent;
						BranchExpenseConfiguration		= data.BranchExpenseConfiguration;
						allowPartialPayment				= data.allowPartialPayment;
						paymentStatusArrForSelection	= data.paymentStatusArrForSelection;
					}

					if(allowPartialPayment) {
						$(".paymentStatusSelection").removeClass("hide");
						$('#paymentStatus option[value]').remove();
						$('#paymentStatus').append($("<option>").attr('value', 0).text("-- Please Select-----"));

						$(paymentStatusArrForSelection).each(function() {
							$('#paymentStatus').append($("<option>").attr('value', this.paymentStatusId).text(this.paymentStatusString));
						});
						
						$("#paymentStatus").bind("change", function() {
							_this.calculateTDSAmount(this.value);
						});
					} else {
						$(".paymentStatusSelection").remove();
					}

					for (var i = 0; i < deliveryRunSheetLedgerlist.length; i++) {
						var obj			= deliveryRunSheetLedgerlist[i];
						balanceAmount 	= obj.dueAmount;

						if(deliveryRunSheetLedgerlist.length > 1) {
							columnArray.push("<td style='text-align: center; vertical-align: middle;'><a style='cursor:pointer;' id='ddmNumber_" + obj.deliveryRunSheetLedgerId + "'><b>" + obj.deliveryRunSheetLedgerDDMNumber + "<b></a></td>");
					
						} else {
							columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.deliveryRunSheetLedgerDDMNumber + "</td>");
							$('#lorryHireAmount').val(obj.deliveryRunSheetLedgerLorryHireAmount);
							$('#balanceAmount').val(balanceAmount);
						}

						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.creationDateTimeString + "</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.deliveryRunSheetLedgerSourceBranchName + "</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.deliveryRunSheetLedgerDestinationBranchName + "</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.deliveryRunSheetLedgerVehicleNumber + "</td>");
						$('#deliveryRunSheetLedgerDetails tbody').append('<tr>' + columnArray.join(' ') + '</tr>');
						
						$("#ddmNumber_" + obj.deliveryRunSheetLedgerId).bind("click", function() {
							var elementId						= $(this).attr('id');
							var deliveryRunSheetLedgerId		= elementId.split('_')[1];
							_this.onFind(deliveryRunSheetLedgerId);
						});
						columnArray	= [];
					}

					if(typeof ddmLorryHireSummary != undefined && ddmLorryHireSummary.length > 0) {
						$('#showHideSettlementSummary').removeClass('hide');
						var receivedAmount = 0;

						for (var i = 0; i < ddmLorryHireSummary.length; i++) {
							columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + ddmLorryHireSummary[i].paymentVoucherNumber + "</td>");
							columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + ddmLorryHireSummary[i].branchName + "</td>");
							columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + ddmLorryHireSummary[i].paymentModeName + "</td>");
							columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + ddmLorryHireSummary[i].receivedAmount + "</td>");
							columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + ddmLorryHireSummary[i].expenseDateTimeString + "</td>");
							$('#ddmLoryyHireSummaryTable tbody').append('<tr>' + columnArray.join(' ') + '</tr>');

							columnArray	= [];

							receivedAmount += ddmLorryHireSummary[i].receivedAmount;
						}

						columnArray.push("<td style='text-align: center; vertical-align: middle; font:bold;'>Total</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;'></td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;'></td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>"+receivedAmount+"</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;'></td>");
						$('#ddmLoryyHireSummaryTable tfoot').append('<tr>' + columnArray.join(' ') + '</tr>');
						receivedAmount = 0;
						columnArray	= [];
					}

					if(deliveryRunSheetLedgerlist.length == 1) {
						if(ddmLorryHireTdsProperty.IsTdsAllow) {
							$('#tdsrate').append('<option value="0" selected="selected">--Select--</option>');

							if(tdsChargeList != undefined && typeof tdsChargeList != 'undefined' && tdsChargeList.length > 0) {
								for(var i = 0; i < tdsChargeList.length; i++) {
									$('#tdsrate').append('<option value="' + tdsChargeList[i] + '" id="' + tdsChargeList[i] + '">' + tdsChargeList[i] + '</option>');
								} 
							} else {
								$('.tdsrateCol').remove();
							}

							if(!ddmLorryHireTdsProperty.IsPANNumberRequired) {
								$('.panNumberCol').remove();
							}

							if(!ddmLorryHireTdsProperty.IsTANNumberRequired) {
								$('.tanNumberCol').remove();
							}
						} else {
							$('.tdsamountCol').remove();
							$('.tdsrateCol').remove();
							$('.panNumberCol').remove();
							$('.tanNumberCol').remove();
							changePageWidth('reportTable', '70%');
						}

						$("#btSubmit").bind("click", function() {
							if(_this.validateDetails()) {
								_this.settleDDMLorryHire(deliveryRunSheetLedgerlist[0].deliveryRunSheetLedgerId);
							}
						});

						$("#amount").bind("blur", function() {
							_this.validateReceiveAmount(this);
						});

						$("#amount").bind("keyup", function() {
							_this.validateReceiveAmount(this);
						});

						$("#tdsamount").bind("keyup", function() {
							_this.validateTDSAmount(this);
						});

						$("#tdsrate").bind("change", function() {
							_this.calculateTDSAmount(this.value);
						});
					}
				}, showHideDDMDetailsDiv : function() {
					$('#deliveryRunSheetLedgerDetails').toggle(1000);
				}, showHideLorryHiewSummary : function() {
					$('#ddmLoryyHireSummaryTable').toggle(1000);
				}, validateReceiveAmount : function(obj) {
					var objVal				= 0;
					var isObjValshldzero 	= false;
					var balance				= 0;

					if(obj.value.length > 0) {
						objVal = parseInt(obj.value);
					}

					if(objVal > parseInt($('#lorryHireAmount').val())) {
						showMessage('info', iconForInfoMsg + ' You can not enter greater value than ' + Number($('#lorryHireAmount').val()));
						isObjValshldzero = true;
					}

					if(Number($('#amount').val()) > balanceAmount) {
						showMessage('info', iconForInfoMsg + ' You can not enter greater value than ' + balanceAmount);
						return false;
					}

					if(!allowPartialPayment) {
						if(Number($('#amount').val()) < balanceAmount) {
							showMessage('info', iconForInfoMsg + ' You can not enter less value than ' + balanceAmount);
							return false;
						}
					}

					if(isObjValshldzero) {
						obj.value 	= 0;
						objVal 		= 0;
					}

					if(obj.value == '') {
						obj.value	= 0;
					}

					$('#balanceAmount').val(parseInt(balanceAmount) - parseInt(obj.value));
					
					if($('#balanceAmount').val() <= 0) {
						$("#paymentStatus").val(DDM_LORRYHIREAMOUNT_SETTLEMENT_STATUS_CLEAR);
					} else {
						$("#paymentStatus").val(DDM_LORRYHIREAMOUNT_SETTLEMENT_STATUS_PARTIAL);
					}

					_this.calculateTDSAmount($('#tdsrate').val());
				}, validateTDSAmount : function(obj) {
					if(obj.value > Number($('#amount').val())) {
						showMessage('info', iconForInfoMsg + ' You can not enter greater value than ' + openFontTag + Number($('#amount').val()) + closeFontTag);
						obj.value = 0;
					}
				}, calculateTDSAmount : function(tdsrate) {
					var amount		= $('#amount').val();

					if(amount > 0 && tdsrate > 0) {
						var tdsamount	= (amount * tdsrate) / 100;

						$('#tdsamount').val(tdsamount);
					}
				}, validateDetails() {
					if(allowPartialPayment) {
						if($('#paymentStatus').val() == 0) {
							$("#paymentStatus").focus();
							showMessage('error', iconForErrMsg + ' Please Select Payment Status');
							return false
						}
						
						if(Number($('#amount').val()) > balanceAmount) {
							showMessage('info', iconForInfoMsg + ' You can not enter greater value than ' + openFontTag + balanceAmount + closeFontTag);
							return false;
						}
					}
					
					if(!validateInputTextFeild(1, 'amount', 'amount', 'error', amountEnterErrMsg)) {
						return false;
					}

					if(Number($('#amount').val()) > Number($('#lorryHireAmount').val())) {
						$("#amount").css("border-color", "red");
						$("#amount").focus();
						showMessage('info', iconForInfoMsg + ' You can not enter greater value than ' + openFontTag + $('#lorryHireAmount').val() + closeFontTag);
						return false;
					}

					if(!allowPartialPayment) {
						if(Number($('#amount').val()) < Number($('#lorryHireAmount').val())) {
							$("#amount").css("border-color", "red");
							$("#amount").focus();
							showMessage('info', iconForInfoMsg + ' You can not enter less value than ' + openFontTag + $('#lorryHireAmount').val() + closeFontTag);
							return false;
						}
					}

					if(ddmLorryHireTdsProperty.IsPANNumberRequired
							&& ddmLorryHireTdsProperty.IsPANNumberMandetory) {
						if($('#tdsamount').val() > 0 && !validateInputTextFeild(1, 'panNumber', 'panNumber', 'error', panNumberErrMsg)) {
							return false;
						} else if(!validateInputTextFeild(8, 'panNumber', 'panNumber', 'info', validPanNumberErrMsg)) {
							return false;
						}
					}

					if(ddmLorryHireTdsProperty.IsTANNumberRequired
							&& ddmLorryHireTdsProperty.IsTANNumberMandetory) {
						if($('#tdsamount').val() > 0 && !validateInputTextFeild(1, 'tanNumber', 'tanNumber', 'error', tanNumberErrMsg)) {
							return false;
						} else if(!validateInputTextFeild(13, 'tanNumber', 'tanNumber', 'info', validTanNumberErrMsg)) {
							return false;
						}
					}

					if(!validateInputTextFeild(1, 'remark', 'remark', 'error', ramarkErrMsg)) {
						return false;
					}

					return true;
				}, settleDDMLorryHire : function(deliveryRunSheetLedgerId) {
					var checkBoxArray	= new Array();

					var jsonObject 				= new Object();

					var DDMNumber						= $('#ddmNumberEle').val();
					jsonObject.DDMNumber				= DDMNumber.replace(/\s+/g, "");
					jsonObject.deliveryRunSheetLedgerId	= deliveryRunSheetLedgerId;
					jsonObject.balanceAmount			= $('#balanceAmount').val();
					jsonObject.amount					= $('#amount').val();
					jsonObject.tdsOnAmount				= $('#amount').val();
					jsonObject.tdsAmount				= $('#tdsamount').val();
					jsonObject.tdsRate					= $('#tdsrate').val();
					jsonObject.PanNumber				= $('#panNumber').val();
					jsonObject.TanNumber				= $('#tanNumber').val();
					jsonObject.lorryHireAmount			= $('#lorryHireAmount').val();
					jsonObject.remark					= $('#remark').val();
					jsonObject.paymentStatus			= $('#paymentStatus').val();
					jsonObject.TOKEN_KEY				= TOKEN_KEY;
					jsonObject.TOKEN_VALUE				= TOKEN_VALUE;
					jsonObject.expenseDate 				= $('#settlementDate').val();

					$("#btSubmit").addClass('hide');
					$("#btSubmit").attr("disabled", true);
					
					if(!doneTheStuff) {
						btModalConfirm = new Backbone.BootstrapModal({
							content		: 	"Are you sure you want to Settle this Lorry Hire ?",
							modalWidth 	: 	30,
							title		:	'Settle Lorry Hire',
							okText		:	'YES',
							showFooter 	: 	true,
							okCloses	:	true
						}).open();

						btModalConfirm.on('ok', function() {
							if(!doneTheStuff) {
								getJSON(jsonObject, WEB_SERVICE_URL + '/ddmLorryHireAmountSettlementWS/settleDDMLorryHire.do', _this.responseAfterSettle, EXECUTE_WITH_ERROR);
								doneTheStuff = true;
							}
							showLayer();
						});
						
						btModalConfirm.on('cancel', function() {
							$("#btSubmit").removeClass('hide');
							$("#btSubmit").attr("disabled", false);
							doneTheStuff	= false;
							hideLayer();
						});
					}
					
				}, responseAfterSettle : function(response) {
					if(response.message != undefined) {
						var errorMessage = response.message;
						showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);

						if (response.exepenseVoucherDetailsId != undefined) {
							var MyRouter = new Marionette.AppRouter({});
							MyRouter.navigate('&modulename=ddmLorryHireAmountSettlement&voucherDetailsId=' + response.exepenseVoucherDetailsId + '&paymentVoucherSequenceNumber=' + response.PaymentVoucherSequenceNumber+'&print=true',{trigger: true});
							setTimeout(function(){ location.reload(); }, 1000);
						}

						hideLayer();
						return;
					}
				}, openPrint : function(exepenseVoucherDetailsId) {
					if(BranchExpenseConfiguration != null && BranchExpenseConfiguration.branchExpensePrintNewFlowAllow) {
						window.open('BranchExpensePrint.do?pageId=25&eventId=43&voucherDetailsId=' + exepenseVoucherDetailsId, 'newwindow', 'config=height=610,width=1000, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
					} else {
						window.open('BranchExpensePrint.do?pageId=25&eventId=16&voucherDetailsId=' + exepenseVoucherDetailsId, 'newwindow', 'config=height=610,width=1000, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
					}
				}
			});
		});

function openWindowForInsertExpense(isExpenseMasterPermission) {
	if(isExpenseMasterPermission) {
		childwin = window.open ('IncomeExpenseCharge.do?pageId=225&eventId=1', 'newwindow', config='height=400,width=1200, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
	} else {
		showMessage('info', 'You do not have permission. Please contact to Head Office to Add Expense Type !');
	}
}