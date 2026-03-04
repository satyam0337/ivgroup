var BankPaymentOperationRequired = false,
 PaymentTypeConstant,
 STBSBillSettlementTdsProperty,
 IsTdsAllow,
 moduleId,
 paymentTypeArr,
 ModuleIdentifierConstant,
 shortCreditCollLedgerBranchId,
 incomeExpenseModuleId,
 IsTDSInPercentAllow,
 TDSChargeInPercent,
 BillClearanceStatusConstant,
 balanceAmnt	= 0,
 previousDate							= null,
 allowBackDateEntryForStbsSettlement	= false,
 currentDate;
var txnAmount		= 0.00;
var finalBalanceAmount	=  0;
var  GeneralConfiguration = null;
var tokenWiseCheckingForDuplicateTransaction = true;

define([  
	PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js'
	,'selectizewrapper'
	,'JsonUtility'
	,'messageUtility'
	,'autocomplete'
	,'autocompleteWrapper'
	,'nodvalidation'
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	,'/ivcargo/resources/js/validation/regexvalidation.js'
	,'focusnavigation'//import in require.config
	],function(UrlParameter, Selectizewrapper) {
	'use strict';
	let jsonObject = new Object(), corporateAccountId = 0, _this = '', billId, doneTheStuff = false, TOKEN_KEY = null, TOKEN_VALUE = null;
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this 		= this;
			billId 		= UrlParameter.getModuleNameFromParam('billId');
		}, render : function() {
			jsonObject.shortCreditCollLedgerId = billId;
			jsonObject.tokenWiseCheckingForDuplicateTransaction = tokenWiseCheckingForDuplicateTransaction;
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/shortCreditBillPaymentWS/getSTBSBillDetailsForPayment.do?',	_this.renderSTBSBillsForPayment, EXECUTE_WITH_ERROR);
		}, renderSTBSBillsForPayment : function(response) {
			hideLayer();
			if(response.message != undefined) {
				hideLayer();
				let errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
			}
			
			TOKEN_KEY		= response.TOKEN_KEY;
			TOKEN_VALUE		= response.TOKEN_VALUE;
			
			let loadelement = new Array();
			let baseHtml 	= new $.Deferred();
			let paymentHtml	= new $.Deferred();
			
			let paymentTypeArr2 = new Array();
			
			paymentTypeArr2[0] 	= {'paymentTypeId':1,'paymentTypeName':'Cash'};
			paymentTypeArr2[1] 	= {'paymentTypeId':2,'paymentTypeName':'Cheque'};
			paymentTypeArr2[2] 	= {'paymentTypeId':8,'paymentTypeName':'Online - RTGS'};
			paymentTypeArr2[3] 	= {'paymentTypeId':9,'paymentTypeName':'Online - NEFT'};

			GeneralConfiguration					= response.GeneralConfiguration;
			ModuleIdentifierConstant				= response.ModuleIdentifierConstant;
			
			if(GeneralConfiguration != undefined)
				BankPaymentOperationRequired		= GeneralConfiguration.BankPaymentOperationRequired;
			
			moduleId 								= response.moduleId;
			previousDate							= response.previousDate;
			allowBackDateEntryForStbsSettlement		= response.allowBackDateEntryForStbsSettlement;
			currentDate								= response.currentDate;
			
			loadelement.push(baseHtml);
			
			if(BankPaymentOperationRequired)
				loadelement.push(paymentHtml);

			$("#mainContent").load("/ivcargo/html/module/shortCreditBillPayment/shortCreditBillPayment.html",function() {
				baseHtml.resolve();
			});

			if(BankPaymentOperationRequired) {
				$("#bankPaymentOperationPanel").load("/ivcargo/html/module/paymentTypeSelection/paymentTypeSelection.html", function() {
					paymentHtml.resolve();
				});
			}

			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				
				if(BankPaymentOperationRequired) {
					$("#viewPaymentDetails").click(function() {
						openAddedPaymentTypeModel();
					});
					
					$("#addedPayment").click(function() {
						$("#addedPaymentTypeModal").modal('hide');
					});

					setIssueBankAutocomplete();
					setAccountNoAutocomplete();
				}

				let billList					= response.billList;
				
				if(billList == undefined) {
					$('.table-responsive').remove();
					$('#confirmPayment').remove();
					$('#viewPaymentDetails').remove();
					$('#paymentModeDiv').remove();
					return;
				}

				PaymentTypeConstant				= response.PaymentTypeConstant;
				paymentTypeArr					= response.paymentTypeArr;
				STBSBillSettlementTdsProperty	= response.STBSBillSettlementTdsProperty;
				IsTdsAllow					    = STBSBillSettlementTdsProperty.IsTdsAllow;
				IsTDSInPercentAllow				= STBSBillSettlementTdsProperty.IsTDSInPercentAllow;
				TDSChargeInPercent				= STBSBillSettlementTdsProperty.TDSChargeInPercent;
				
				if(BankPaymentOperationRequired) {
					$('#paymentModeDiv').empty();
					$('#paymentMode').removeClass('hide');
					$('#viewPaymentDetails').removeClass('hide');
					
					Selectizewrapper.setAutocomplete({
						jsonResultList	: 	paymentTypeArr,
						valueField		:	'paymentTypeId',
						labelField		:	'paymentTypeName',
						searchField		:	'paymentTypeName',
						elementId		:	'paymentModeId',
						onChange		:	_this.onPaymentTypeSelect
					});
				} else {
					$('#paymentMode').empty();
					$('#paymentModeDiv').removeClass('hide');
					
					Selectizewrapper.setAutocomplete({
						jsonResultList	: 	paymentTypeArr2,
						valueField		:	'paymentTypeId',
						labelField		:	'paymentTypeName',
						searchField		:	'paymentTypeName',
						elementId		:	'paymentModeId',
						onChange		:	_this.onPaymentTypeSelect2
					});
				}

				setTimeout(function() {
					_this.setBillsForPayment(billList);
				}, 200);
				
				if(allowBackDateEntryForStbsSettlement) {
					$('#settlementDateDiv').removeClass('hide');
					_this.backDateForAll();
				}

				hideLayer();
				
				$("#confirmPayment").click(function() {
					_this.onSubmit(_this);								
				});
			});
		}, backDateForAll : function() {
			$("#settlementDate").datepicker({
				showAnim	: "fold",
				maxDate		: new Date(currentDate),
				minDate		: previousDate,
				dateFormat	: 'dd-mm-yy',
				onSelect: function(date) {
					$("#settlementDate").datepicker('setDate', new Date(date.split("-")[2], date.split("-")[1] - 1, date.split("-")[0]));
					$("#settlementDate").trigger("blur");
				}
			});

			$('#settlementDate').val(dateWithDateFormatForCalender(currentDate,"-"));

		}, onPaymentTypeSelect2	: function(val) {
			if(val == 1 || val == ''){
				$('#chequeNumberDiv').addClass('hide');
				$('#bankNameDiv').addClass('hide');
			} else {
				$('#chequeNumberDiv').removeClass('hide');
				$('#bankNameDiv').removeClass('hide');
			}
			
		}, onPaymentTypeSelect	: function(_this) {
			hideShowBankPaymentTypeOptions(document.getElementById("paymentModeId"));
		}, setBillsForPayment : function(billList) {
			_this.createBillHeader();
			
			for (const element of billList) {
				let obj								= element;
				let primaryId 						= obj.shortCreditCollLedgerId;
				shortCreditCollLedgerBranchId 		= obj.executiveBranchId;
				let balAmount 						= Math.round(obj.billAmount - obj.receivedAmountInnerTbl);
				corporateAccountId 					= obj.corporateAccountId;
				
				setTimeout(function() {
					balanceAmnt		= Math.round(Number($('#balanceAmount_' + primaryId).val()));
					$('#receivedAmount_' + primaryId).val(0);
				}, 200);
				
				let columnArray		= new Array();
				
					columnArray.push("<td style='text-align: center; vertical-align: middle; font-weight: bold; text-transform: uppercase' id='billNo_" + primaryId + "' name='billNo_" + primaryId + "' value='"+ obj.shortCreditCollLedgerNumber +"'>" + obj.shortCreditCollLedgerNumber + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle; text-transform: uppercase' id='billDate_" + primaryId + "' name='billDate_" + primaryId + "' value='"+ obj.creationTimestampString +"'>" + obj.creationTimestampString + "</td>");

					if(IsTdsAllow) {
						if(STBSBillSettlementTdsProperty.IsPANNumberRequired) {
							columnArray.push("<td style='text-align: center; vertical-align: middle;'>" +
								"<input data-tooltip='PAN Number' onkeypress='if(this.value==&#39;0&#39;)this.value=&#39;&#39;;' style='text-align: right;height: 30px;' class='form-control height30px' type='text' " +
								"value='' id='panNumber_" + primaryId + "' maxlength='10'/></td>");	
						}
						
						if(STBSBillSettlementTdsProperty.IsTANNumberRequired) {
							columnArray.push("<td style='text-align: center; vertical-align: middle;'>" +
								"<input data-tooltip='TAN Number' onkeypress='if(this.value==&#39;0&#39;)this.value=&#39;&#39;;' style='text-align: right;height: 30px;' class='form-control height30px' type='text' " +
								"value='' id='tanNumber_" + primaryId + "' maxlength='10'/></td>");	
						}
					}
						
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" +
							"<select data-tooltip='Payment Status' style='text-align: right;height: 30px;' class='form-control height30px' " +
							"id='paymentType_" + primaryId + "' /></td>");

					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" +
							"<input data-tooltip='' disabled='disabled' style='text-align: right;height: 30px;' class='form-control height30px' type='text' " +
							"value='" + obj.billAmount + "' id='billAmount_" + primaryId + "' /></td>");

					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" +
							"<input data-tooltip='' disabled='disabled' style='text-align: right;height: 30px;' class='form-control height30px' type='text' " +
							"value='" + obj.receivedAmountInnerTbl + "' id='receivedAmountInnerTbl_" + primaryId + "' /></td>");

					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" +
							"<input data-tooltip='Txn Amount' onkeypress='if(this.value==&#39;0&#39;)this.value=&#39;&#39;; return allowOnlyNumeric(event); ' style='text-align: right;height: 30px;' class='form-control height30px' type='text' " +
							"value='0' id='txnAmount_" + primaryId + "' /></td>");

					if(IsTdsAllow) {
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" +
								"<input data-tooltip='Tds' onkeypress='if(this.value==&#39;0&#39;)this.value=&#39;&#39;; return allowOnlyNumeric(event);' style='text-align: right;height: 30px;' class='form-control height30px' type='text' " +
								"value='0' id='tdsAmount_" + primaryId + "' /></td>");
					}

					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" +
							"<input data-tooltip='' disabled='disabled' style='text-align: right;height: 30px;' class='form-control height30px' type='text' " +
							"value='" + obj.receivedAmount + "' id='receivedAmount_" + primaryId + "' /></td>");

					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" +
							"<input data-tooltip='' disabled='disabled' style='text-align: right;height: 30px;' class='form-control height30px' type='number' " +
							"value='" + balAmount + "' id='balanceAmount_" + primaryId + "' /></td>");
							
                    columnArray.push("<td style='text-align: center; vertical-align: middle;' class='hide' >" +
							"<input data-tooltip='' disabled='disabled' style='text-align: right;height: 30px;' class='form-control height30px' type='number' " +
							"value='" + balAmount + "' id='balanceAmount1_" + primaryId + "' /></td>");
							
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" +
							"<input data-tooltip='Remark' style='text-align: right;height: 30px;' class='form-control height30px' type='text' " +
							"id='remark_" + primaryId + "' placeholder='Enter Remark'/></td>");

					$('#branchConfigTbody').append('<tr id="' + primaryId + '">' + columnArray.join(' ') + '</tr>');
					
					_this.setPaymentType(primaryId);
					
					$("#txnAmount_" + primaryId).bind("blur", function() {
						_this.calctxnRecvAmount(this);
						_this.calculateTDS(this);
					});
					
					$("#txnAmount_" + primaryId).bind("keyup", function() {
						_this.calctxnRecvAmount(this);
						_this.calculateTDS(this);
					});
					
					$("#tdsAmount_" + primaryId).bind("blur", function() {
						_this.calctdsRecvAmount(this);
					});
					$("#tdsAmount_" + primaryId).bind("keyup", function() {
						_this.calctdsRecvAmount(this);
						
					});
					$("#paymentType_" + primaryId).bind("change", function() {
						_this.setTxnAmount(this);
					});

					columnArray	= [];
			}
			
			finalBalanceAmount	=  $("#balanceAmount_" + billId).val()
		}, createBillHeader : function() {
			let columnArray		= new Array();
			
			columnArray.push("<th style='text-align: center;'>Bill No</th>");
			columnArray.push("<th style='text-align: center;'>Date</th>");
			
			if(IsTdsAllow) {
				if(STBSBillSettlementTdsProperty.IsPANNumberRequired)
					columnArray.push("<th style='text-align: center;'>PAN Number</th>");
				
				if(STBSBillSettlementTdsProperty.IsTANNumberRequired)
					columnArray.push("<th style='text-align: center;'>TAN Number</th>");
			}
			
			columnArray.push("<th style='text-align: center;'>Payment Type</th>");
			columnArray.push("<th style='text-align: center;'>Total Amt.</th>");
			columnArray.push("<th style='text-align: center;'>Received Amt.</th>");
			columnArray.push("<th style='text-align: center;'>Txn Amt.</th>");
			
			if(IsTdsAllow)
				columnArray.push("<th style='text-align: center;'>TDS Amt.</th>");
				
			columnArray.push("<th style='text-align: center;'>Receive Amt.</th>");
			columnArray.push("<th style='text-align: center;'>Balance</th>");
			columnArray.push("<th style='text-align: center;'>Remark</th>");
			
			$('#branchConfigtable thead').append('<tr class="danger">' + columnArray.join(' ') + '</tr>');
		}, setPaymentType : function(elementId) {
			$('#paymentType_' + elementId).append('<option value="0" id="2" selected>--- Select ---</option>');
			$('#paymentType_' + elementId).append('<option value="2" id="2">Clear Payment</option>');
			$('#paymentType_' + elementId).append('<option value="3" id="3">Partial Payment</option>');
			$('#paymentType_' + elementId).append('<option value="4" id="4">Negotiated</option>');
		}, setTxnAmount : function(obj) {
			let billId 			= obj.id;
			billId 				= billId.split("_")[1];
			let paymentType 	= Math.round(obj.value);
			let txnAmount 		= Math.round($('#txnAmount_' + billId).val());
			let receivedAmount 	= Math.round($('#receivedAmountInnerTbl_' + billId).val());
			let balanceAmount 	= Math.round($('#balanceAmount_' + billId).val());
			let billAmount 		= Math.round($('#billAmount_' + billId).val());
	
			if(paymentType == BILL_CLEARANCE_STATUS_CLEAR_PAYMENT_ID) {
				$('#txnAmount_' + billId).val(billAmount - receivedAmount);
				$('#balanceAmount_' + billId).val(0);
				$('#txnAmount_' + billId).prop( "disabled", true);
				$('#receivedAmount_' + billId).val($('#txnAmount_' + billId).val());
				
				if(IsTdsAllow)
					_this.calculateTDS(obj);
			} else {
				$('#txnAmount_' + billId).prop( "disabled", false );
				$('#txnAmount_' + billId).val(0);
				$('#receivedAmount_' + billId).val(0);
				$('#balanceAmount_' + billId).val(billAmount - receivedAmount);
				$('#tdsAmount_' + billId).val(0);
			}
	
			if(paymentType == BILL_CLEARANCE_STATUS_PARTIAL_PAYMENT_ID && txnAmount == balanceAmount) {
				showMessage('error', 'Cannot select partial as amount is cleared!');
				setTimeout(() => {
					$('#paymentType_' + billId).val(2);
				}, 200);
				return false;
			}
		}, calculateTDS : function(obj) {
			if(!IsTdsAllow) return;
	
			let billId 			= obj.id;
			billId 				= billId.split("_")[1];
			let txnAmount		= Math.round($('#txnAmount_' + billId).val());
			let totalAmt		= Math.round($("#billAmount_" + billId).val());
			let receivedAmount 	= Math.round($('#receivedAmountInnerTbl_' + billId).val());
			let actTotalAmt		= Math.round(totalAmt - receivedAmount);
			
			if(IsTDSInPercentAllow) {
				let tdsAmt		= Math.round((txnAmount * TDSChargeInPercent ) / 100);
				$('#tdsAmount_' + billId).val(tdsAmt);
				$("#balanceAmount_" + billId).val(actTotalAmt - txnAmount);
			}
		}, calctxnRecvAmount : function(obj) {
			let billId 			= obj.id;
			billId 				= billId.split("_")[1];
			
			txnAmount 			= parseInt($("#txnAmount_" + billId).val());
			let totalAmount		= Math.round($("#billAmount_" + billId).val());
			let balanceAmount	= $("#balanceAmount1_" + billId).val()
		
			if(txnAmount == balanceAmount)
				$('#paymentType_' + billId).val(PAYMENT_TYPE_STATUS_CLEAR_PAYMENT_ID);
		
			$('#receivedAmount_' + billId).val(txnAmount);
		
			if($('#receivedAmountInnerTbl_' + billId).val() > 0) { 
				$("#balanceAmount_" + billId).val(balanceAmount - txnAmount);
			} else
				$("#balanceAmount_" + billId).val(totalAmount - txnAmount);
		}, calctdsRecvAmount : function(obj) {
			let billId 			= obj.id;
			billId 				= billId.split("_")[1];
			let txnAmount		= parseInt($("#txnAmount_" + billId).val());
			let tdsAmount		= Math.round($("#tdsAmount_" + billId).val());
		
			if (tdsAmount > txnAmount) {
				showMessage('error', 'Cannot enter tds amount greater than txn Amount !');
				setTimeout(() => {
					$('#tdsAmount_' + billId).val(0);
				}, 200);
			} else
				$('#receivedAmount_' + billId).val(txnAmount - tdsAmount);	
			
		}, onSubmit : function() {
			if(BankPaymentOperationRequired){
				let paymentType = $('#paymentModeId').val();

				if(paymentType == 0) {
					showMessage('error','Please, Select Payment Mode !');
					setTimeout(() => {
						$('#paymentModeId').focus();
					}, 300);
					return false;
				}
				
				let rowCount 		= $('#storedPaymentDetails tr').length;
				
				if(isValidPaymentMode(paymentType) && rowCount <= 0) {
					showMessage('info', 'Please, Add Payment details !');
					return false;
				}
			} else {
				let paymentType = $('#paymentModeId').val();

				if(paymentType == 0) {
					showMessage('error','Please, Select Payment Mode !');
					setTimeout(() => {
						$('#paymentModeId_wrapper').focus();
					}, 300);
					return false;
				}
				
				if(paymentType != PAYMENT_TYPE_CASH_ID) {
					if($('#chequeNumber2').val() == '' && $('#chequeNumber2').val().length <= 0){
						showMessage('error','Please enter cheque/txn number!');
						setTimeout(() => {
							$('#chequeNumber2').focus();
						}, 300);
						return false;
					}

					if($('#bankName2').val() == '' && $('#bankName2').val().length <= 0){
						showMessage('error','Please enter bank name !');
						setTimeout(() => {
							$('#bankName2').focus();
						}, 300);
						return false;
					}
				}
			}
			
			let billIdArr		= new Array();
			let tbody			= $('#branchConfigTbody')[0].childNodes;
			let billWiseArr 	= new Array();

			for(const element of tbody){
				billIdArr.push(element.id);
			}

			for(const element of billIdArr) {
				let billWiseObj 	= new Object();
				
				if($('#paymentType_' + element).val() <= 0) {
					showMessage('error', 'Please, Select Payment Type !');
					$('#paymentType_' + element).focus();
					return false;
				}
				
				if($('#txnAmount_' + element).val() <= 0){
					showMessage('error', 'Please, Enter transaction amount !');
					$('#txnAmount_' + element).focus();
					return false;
				}
			
				let totalAmt	= parseInt($("#billAmount_" + element).val());
				let receivedAmt	= parseInt($("#receivedAmountInnerTbl_" + element).val());
			
				if(txnAmount > finalBalanceAmount){
					showMessage('error','Cannot enter amount greater than ' + finalBalanceAmount + '!');
					setTimeout(() => {
						$('#txnAmount_' + element).val(0);
						$('#txnAmount_' + element).focus();
						$('#tdsAmount_' + element).val(0);
						$("#balanceAmount_" + element).val(totalAmt - receivedAmt);
					}, 200);
					return false;
				}
				
				if($('#txnAmount_' + element).val() > balanceAmnt){
					showMessage('error','Cannot enter amount greater than Balance Amount !');
					setTimeout(() => {
						$('#txnAmount_' + element).val(0);
						$('#txnAmount_' + element).focus();
						$('#tdsAmount_' + element).val(0);
						$("#balanceAmount_" + element).val(totalAmt - receivedAmt);
					}, 200);
					return false;
				}
				
				if(IsTdsAllow) {
					if(STBSBillSettlementTdsProperty.IsPANNumberMandetory && !validatePanNumber(1, 'panNumber_' + element))
						return false;
						
					if(STBSBillSettlementTdsProperty.IsTANNumberMandetory && !validateTANNumber(1, 'tanNumber_' + element))
						return false;						
				}
				
				if(!checkValidPanNum('panNumber_' + element)) return false;
				if(!validateTanNumber(1, 'tanNumber_' + element)) return false;

				billWiseObj.shortCreditCollLedgerId			= element
				billWiseObj.shortCreditCollLedgerNumber		= $('#billNo_' + element).html();
				billWiseObj.paymentType						= $('#paymentType_' + element).val();
				billWiseObj.billAmount						= $('#billAmount_' + element).val();
				billWiseObj.txnAmount 						= $('#txnAmount_' + element).val();
				billWiseObj.receivedAmount 					= $('#receivedAmount_' + element).val();
				billWiseObj.tdsAmount 						= $('#tdsAmount_' + element).val();
				billWiseObj.PanNumber 						= $('#panNumber_' + element).val();
				billWiseObj.TanNumber 						= $('#tanNumber_' + element).val();
				billWiseObj.balanceAmount 					= $('#balanceAmount_' + element).val();
				billWiseObj.remark 							= $('#remark_' + element).val();
				billWiseObj.chequeDate						= $('#chequeDate_' + element).val();
				billWiseObj.chequeNumber					= $('#chequeNumber_' + element).val();
				billWiseObj.bankName						= $('#bankName_' + element).val();
				
				billWiseArr.push(billWiseObj);
			}
			
			if(!doneTheStuff) {
				if(billWiseArr.length > 0){
					if (confirm("Are you sure to settle bill?")) {
						doneTheStuff = true;
						showLayer();
						
						jsonObject	= new Object();

						if(!BankPaymentOperationRequired){
							jsonObject.chequeNumber		= $('#chequeNumber2').val();
							jsonObject.bankName			= $('#bankName2').val();
						}

						jsonObject.billWiseArr						= JSON.stringify(billWiseArr);
						jsonObject.paymentMode						= $('#paymentModeId').val();
						jsonObject.corporateAccountId				= corporateAccountId;
						jsonObject.paymentValues					= $('#paymentCheckBox').val();
						jsonObject.shortCreditCollLedgerBranchId	= shortCreditCollLedgerBranchId;
						jsonObject.BankPaymentOperationRequired		= BankPaymentOperationRequired;
						
						if(tokenWiseCheckingForDuplicateTransaction){
							jsonObject.TOKEN_KEY									= TOKEN_KEY;
							jsonObject.TOKEN_VALUE									= TOKEN_VALUE;
							jsonObject.tokenWiseCheckingForDuplicateTransaction		= tokenWiseCheckingForDuplicateTransaction;	
						}
						
						if(allowBackDateEntryForStbsSettlement && $('#settlementDateDiv').exists() && $('#settlementDateDiv').is(":visible"))
							jsonObject.settlementDate				= $('#settlementDate').val();
							
						getJSON(jsonObject, WEB_SERVICE_URL	+ '/shortCreditBillPaymentWS/settleShortCreditPayment.do?',	_this.setSuccess, EXECUTE_WITHOUT_ERROR);
					} else {
						hideLayer();
						doneTheStuff = false;
					}
				}
			}
		}, setSuccess : function(response) {
			showMessage('success', iconForSuccessMsg + ' ' + "STBS Bill clearance process completed successfully!");
			
			if(response.moneyRecepiptList != undefined) {
				$("#top-border-boxshadow").addClass('hide');
				$("#middle-border-boxshadow").removeClass('hide');
				_this.createHeader();
				_this.setReceiptDataResult(response.moneyRecepiptList);
			} else {
				setTimeout(function() {
					window.close();
				}, 1000);
			}
			hideLayer();
		}, createHeader : function() {
			$('#headingReceipttr').empty();
	
			let createRow					= createRowInTable('', '', '');
			
			let mrNumberCol					= createColumnInRow(createRow, '', '', '', 'center', '', '');
			let mrDateCol					= createColumnInRow(createRow, '', '', '', 'center', '', '');
			let billingPartyNameCol			= createColumnInRow(createRow, '', '', '', 'center', '', '');
			let billNumberCol				= createColumnInRow(createRow, '', '', '', 'center', '', '');
			let billAmtCol					= createColumnInRow(createRow, '', '', '', 'center', '', '');
			let mrPrintCol					= createColumnInRow(createRow, '', '', '', 'center', '', '');
			
			appendValueInTableCol(mrNumberCol, '<b>MR Number</b>');
			appendValueInTableCol(mrDateCol, '<b>MR Date</b>');
			appendValueInTableCol(billingPartyNameCol, '<b>Party Name</b>');
			appendValueInTableCol(billNumberCol, '<b>Bill Number</b>');
			appendValueInTableCol(billAmtCol, '<b>Amount (&nbsp;&#x20B9;&nbsp;)</b>');
			appendValueInTableCol(mrPrintCol, '');
			
			appendRowInTable('headingReceipttr', createRow);		
		}, setReceiptDataResult : function(moneyRecepiptList) {
			removeTableRows('moneyReceiptDetailsDiv', 'tbody');

			for(const element of moneyRecepiptList) {
				let createRow				= createRowInTable('', '', '');
				
				let mrNumber				= element.moneyReceiptNumber;
				let mrDate					= element.txnDateTimeString;
				let billingPartyName		= element.billingPartyName;
				let billNumber				= element.billNumber;
				let billAmt					= element.moneyReceiptTotalAmount;
				let mrPrint					= '<button id="mrPrintBtn" class="btn btn-primary" onclick="getMRPrintDetailsData(' + element.id + ','+96+','+element.subId+');">MR Print</button>';
			
				let mrNumberCol				= createColumnInRow(createRow, '', '', '', 'center', '', '');
				let mrDateCol				= createColumnInRow(createRow, '', '', '', 'center', '', '');
				let billingPartyNameCol		= createColumnInRow(createRow, '', '', '', 'center', '', '');
				let billNumberCol			= createColumnInRow(createRow, '', '', '', 'center', '', '');
				let billAmtCol				= createColumnInRow(createRow, '', '', '', 'center', '', '');
				let mrPrintCol				= createColumnInRow(createRow, '', '', '', 'center', '', '');
				
				appendValueInTableCol(mrNumberCol, mrNumber);
				appendValueInTableCol(mrDateCol, mrDate);
				appendValueInTableCol(billingPartyNameCol, billingPartyName);
				appendValueInTableCol(billNumberCol, billNumber);
				appendValueInTableCol(billAmtCol, billAmt);
				appendValueInTableCol(mrPrintCol, mrPrint);
				
				appendRowInTable('moneyReceiptDetailsDiv', createRow);
			}
		}
	});
});

function getMRPrintDetailsData(billId, identifier, clearanceId) {
	childwin = window.open("printMoneyReceipt.do?pageId=3&eventId=16&wayBillId="+billId+"&moduleIdentifier="+identifier+"&clearanceId="+clearanceId,'_blank',"newwindow",config="height=500,width=700, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no");
}

function hideShowChequeDetails(billId, obj) {
	hideShowBankPaymentTypeOptions(obj); //defined in paymentTypeSelection.js
}
