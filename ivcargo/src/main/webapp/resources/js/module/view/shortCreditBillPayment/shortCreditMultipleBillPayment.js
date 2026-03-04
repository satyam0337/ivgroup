var BankPaymentOperationRequired = false,
PaymentTypeConstant,
moduleId,
paymentTypeArr,
ModuleIdentifierConstant,
GeneralConfiguration = null,
subIdsStr 		 = null,
billIdsStr 		 = null;
			
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
	let jsonObject = new Object(), corporateAccountId = 0, _this = '', billIds, doneTheStuff = false, TOKEN_KEY = null, TOKEN_VALUE = null, tokenWiseCheckingForDuplicateTransaction = true, tatotalAmountforCenterlize = 0, tatotalReceiveAmountforCenterlize = 0, tatotalBalanceAmountforCenterlize = 0,
	shortCreditCollLedgerBranchId, IsTDSInPercentAllow, TDSChargeInPercent, allowToEnterAmountInDecimal, previousDate	= null, allowBackDateEntryForStbsSettlement	= false, currentDate, txnAmount	= 0.00,
	 IsTdsAllow = false, STBSBillSettlementTdsProperty, paymentStatusArr, 
	onAccountDetailsList = null, onAccountDetailsArr	= new Array(), onAccountData = false,
	totalOnAccountBalanceAmount	= 0.0, totalBillReceivedAmount	= 0.0, totalReceivedAmount = 0.0;
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this 		= this;
			billIds 	= UrlParameter.getModuleNameFromParam('billIds');
		}, render : function() {
			jsonObject.shortCreditCollLedgerIds = billIds;	
			jsonObject.tokenWiseCheckingForDuplicateTransaction = tokenWiseCheckingForDuplicateTransaction;
			jsonObject.isMultipleBillSettlement = true;	
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/shortCreditBillPaymentWS/getSTBSBillDetailsForPayment.do?',	_this.renderSTBSBillsForPayment, EXECUTE_WITH_ERROR);
		}, renderSTBSBillsForPayment : function(response) {
			hideLayer();
			
			if(response.message != undefined) {
				hideLayer();
			}
			
			TOKEN_KEY		= response.TOKEN_KEY;
			TOKEN_VALUE		= response.TOKEN_VALUE;
			
			let loadelement = new Array();
			let baseHtml 	= new $.Deferred();
			let paymentHtml	= new $.Deferred();
			
			GeneralConfiguration					= response.GeneralConfiguration;
			ModuleIdentifierConstant				= response.ModuleIdentifierConstant;
			
			if(GeneralConfiguration != undefined)
				BankPaymentOperationRequired		= GeneralConfiguration.BankPaymentOperationRequired;
			
			moduleId 								= response.moduleId;
			previousDate							= response.previousDate;
			allowBackDateEntryForStbsSettlement		= response.allowBackDateEntryForStbsSettlement;
			currentDate								= response.currentDate;
			onAccountDetailsList					= response.onAccountDetailsList
			
			if(onAccountDetailsList != undefined && onAccountDetailsList.length > 0)
				onAccountData = true;
			
			loadelement.push(baseHtml);
			
			loadelement.push(paymentHtml);

			$("#mainContent").load("/ivcargo/html/module/shortCreditBillPayment/shortCreditMultipleBillPayment.html",function() {
				baseHtml.resolve();
			});

			$("#bankPaymentOperationPanel").load("/ivcargo/html/module/paymentTypeSelection/paymentTypeSelection.html", function() {
				paymentHtml.resolve();
			});

			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				
				$("#viewPaymentDetails").click(function() { 
					openAddedPaymentTypeModel();
				});
					
				$("#addedPayment").click(function() {
					$("#addedPaymentTypeModal").modal('hide');
				});

				setIssueBankAutocomplete();
				setAccountNoAutocomplete();

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
				paymentStatusArr				= response.paymentStatusConstants;
				STBSBillSettlementTdsProperty	= response.STBSBillSettlementTdsProperty;
				IsTdsAllow					    = STBSBillSettlementTdsProperty.IsTdsAllow;
				IsTDSInPercentAllow				= STBSBillSettlementTdsProperty.IsTDSInPercentAllow;
				TDSChargeInPercent				= STBSBillSettlementTdsProperty.TDSChargeInPercent;
				allowToEnterAmountInDecimal		= STBSBillSettlementTdsProperty.allowToEnterAmountInDecimal;
				
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

				if(!jQuery.isEmptyObject(paymentStatusArr)) {
					$("#paymentStatusForAll").append($("<option>").attr('value', 0).text('---Payment Status---'));
					
					for(const element of paymentStatusArr) {
						$("#paymentStatusForAll").append($("<option>").attr('value', element.paymentStatusId).text(element.paymentStatusName));
					}
				}
					
				setTimeout(function() {
					_this.setBillsForPayment(billList);
					
					$("#txnAmountforCenterlize").bind("blur", function() {
						_this.calctxnRecvAmountforCenterlize(this);
						_this.calculateTDSforCenterlize(this);
					});

					$("#txnAmountforCenterlize").on("input", function() {
						_this.calctxnRecvAmountforCenterlize(this);
						_this.calculateTDSforCenterlize(this);
					});
					_this.setOnAccountDetails();
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
		}, onPaymentTypeSelect	: function(_this) {
			hideShowBankPaymentTypeOptions(document.getElementById("paymentModeId"));
		}, setBillsForPayment : function(billList) {
			totalReceivedAmount = 0.0;
			_this.createBillHeader();
			billList	= _.sortBy(billList, 'shortCreditCollLedgerNumber');

			for (const element of billList) {
				let obj								= element;
				let primaryId 						= obj.shortCreditCollLedgerId;
				shortCreditCollLedgerBranchId 		= obj.executiveBranchId;
				let balAmount 						= Math.round(obj.billAmount - obj.receivedAmountInnerTbl);
				corporateAccountId 					= obj.corporateAccountId;
				tatotalAmountforCenterlize 			+= obj.billAmount
				tatotalReceiveAmountforCenterlize	+= obj.receivedAmountInnerTbl
				tatotalBalanceAmountforCenterlize 	= tatotalAmountforCenterlize - tatotalReceiveAmountforCenterlize
				totalReceivedAmount 				+= balAmount;

				setTimeout(function() {
					if(!onAccountData)
						$('#receivedAmount_' + primaryId).val(0);
					else
						$('#balanceAmount_' + primaryId).val(0);
				}, 200);
				
				let columnArray		= new Array();
				
				columnArray.push("<td style='text-align: center; vertical-align: middle; font-weight: bold; text-transform: uppercase' id='billNo_" + primaryId + "' name='billNo_" + primaryId + "' value='"+ obj.shortCreditCollLedgerNumber +"'>" + obj.shortCreditCollLedgerNumber + "</td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle; font-weight: bold; text-transform: uppercase; display: none;' id='partyId_" + primaryId + "' name='partyId_" + primaryId + "' value='"+ obj.corporateAccountId +"'>" + obj.corporateAccountId + "</td>");
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
						
				if(!onAccountData)
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" +
						"<select data-tooltip='Payment Status' style='text-align: right;height: 30px;' class='form-control selectAllPaymentMode height30px' " +
						"id='paymentStatus_" + primaryId + "' /></td>");

				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" +
						"<input data-tooltip='' disabled='disabled' style='text-align: right;height: 30px;' class='form-control height30px' type='text' " +
						"value='" + obj.billAmount + "' id='billAmount_" + primaryId + "' /></td>");

				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" +
						"<input data-tooltip='' disabled='disabled' style='text-align: right;height: 30px;' class='form-control height30px' type='text' " +
						"value='" + obj.receivedAmountInnerTbl + "' id='receivedAmountInnerTbl_" + primaryId + "' /></td>");

				if(onAccountData)
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" +
						"<input data-tooltip='Txn Amount' disabled='disabled' onkeypress='if(this.value==&#39;0&#39;)this.value=&#39;&#39;; return allowOnlyNumeric(event); ' style='text-align: right;height: 30px;' class='form-control inputAmount height30px' type='text' " +
						"value='" + balAmount + "' id='txnAmount_" + primaryId + "' /></td>");
				else
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" +
						"<input data-tooltip='Txn Amount'  onkeypress='if(this.value==&#39;0&#39;)this.value=&#39;&#39;; return allowOnlyNumeric(event); ' style='text-align: right;height: 30px;' class='form-control inputAmount height30px' type='text' " +
						"value='0' id='txnAmount_" + primaryId + "' /></td>");
						
				if(IsTdsAllow) {
					if(allowToEnterAmountInDecimal) {
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" +
							"<input data-tooltip='Tds' onkeypress='if(this.value==&#39;0&#39;)this.value=&#39;&#39;; return validateFloatKeyPress(event, this);' style='text-align: right;height: 30px;' class='form-control inputAmounts height30px' type='text' " +
							"value='0' id='tdsAmount_" + primaryId + "' /></td>");
					} else {
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" +
								"<input data-tooltip='Tds' onkeypress='if(this.value==&#39;0&#39;)this.value=&#39;&#39;; return allowOnlyNumeric(event);' style='text-align: right;height: 30px;' class='form-control inputAmounts height30px' type='text' " +
								"value='0' id='tdsAmount_" + primaryId + "' /></td>");
					}
				}
				
				if(onAccountData)
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" +
						"<input data-tooltip='' disabled='disabled' style='text-align: right;height: 30px;' class='form-control height30px' type='text' " +
						"value='" + balAmount + "' id='receivedAmount_" + primaryId + "' /></td>");
				else
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" +
						"<input data-tooltip='' disabled='disabled' style='text-align: right;height: 30px;' class='form-control height30px' type='text' " +
						"value='" + obj.receivedAmount + "' id='receivedAmount_" + primaryId + "' /></td>");
						
				columnArray.push("<td style='text-align: center; vertical-align: middle;' class='hide'>" +
						"<input data-tooltip='' disabled='disabled' style='text-align: right;height: 30px;' class='form-control  dueAmount height30px' type='number' " +
						"value='" + balAmount + "' id='dueAmount_" + primaryId + "' /></td>");

				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" +
						"<input data-tooltip='' disabled='disabled' style='text-align: right;height: 30px;' class='form-control height30px' type='number' " +
						"value='" + balAmount + "' id='balanceAmount_" + primaryId + "' /></td>");
							
				columnArray.push("<td style='text-align: center; vertical-align: middle;' class='hide'>" +
						"<input data-tooltip='' disabled='disabled' style='text-align: right;height: 30px;' class='form-control height30px' type='number' " +
						"value='" + balAmount + "' id='balanceAmount1_" + primaryId + "' /></td>");
							
				columnArray.push("<td style='text-align: center; vertical-align: middle;'  >" +
					"<input data-tooltip='Remark' style='text-align: right;height: 30px;' class='form-control height30px' type='text' " +
						"id='remark_" + primaryId + "' placeholder='Enter Remark'/></td>");
		
				$('#branchConfigTbody').append('<tr id="' + primaryId + '">' + columnArray.join(' ') + '</tr>');
					
				_this.setPaymentStatus(primaryId);
					
				$("#txnAmount_" + primaryId).bind("blur", function() {
					_this.calctxnRecvAmount(this);
					_this.calculateTDS(this);
					_this.calculateTotal();
				});
					
				$("#txnAmount_" + primaryId).bind("keyup", function() {
					_this.calctxnRecvAmount(this);
					_this.calculateTDS(this);
					_this.calculateTotal();
				});
					
				$("#tdsAmount_" + primaryId).bind("blur", function() {
					_this.calctdsRecvAmount(this);
					_this.calculateTotal()
				});
					
				$("#tdsAmount_" + primaryId).bind("keyup", function() {
					_this.calctdsRecvAmount(this);
					_this.calculateTotal()
				});

				$("#paymentStatus_" + primaryId).bind("change", function() {
					_this.setTxnAmount(this);
					_this.calculateTotal()
				});

				columnArray	= [];
			}
			
			$('#paymentStatusForAll').on('change', function() {
				let paymentTypeVal = $('#paymentStatusForAll').val(); 
				
				$('.dueAmount').each((el, index) => {
					let id	= index.id.split('_')[1];
					let dueAmts = index.value;
					$("#paymentStatus_" + id).val(paymentTypeVal)

					if (paymentTypeVal == BILL_CLEARANCE_STATUS_CLEAR_PAYMENT_ID) {
						$('#balanceAmount_' + id).val(0);   
						$('#receivedAmount_' + id).val(dueAmts);
						$('#txnAmount_' + id).val(dueAmts);  
						$('#txnAmount_' + id).prop('disabled', true);
						$('#tdsAmount_' + id).val(0);   
 						_this.calculateTotal();
					} else {
						//	$("#paymentStatus_" + id).val(1)
						$('#balanceAmount_' + id).val(dueAmts);   
						$('#receivedAmount_' + id).val(0);
						$('#txnAmount_' + id).val(0); 
						$('#txnAmount_' + id).prop('disabled', false);
						$('#tdsAmount_' + id).val(0);  
						_this.calculateTotal();
					}
				});
			});
			
			let columnArrayforCenterlize	= new Array();

			columnArrayforCenterlize.push("<td style='text-align: center; vertical-align: middle;'>" +
					"<input data-tooltip='' disabled='disabled' style='text-align: right;height: 30px;' class='form-control height30px' type='text' " +
					"value='" + tatotalAmountforCenterlize + "' id='billAmountforCenterlize' /></td>");

			columnArrayforCenterlize.push("<td style='text-align: center; vertical-align: middle;'>" +
					"<input data-tooltip='' disabled='disabled' style='text-align: right;height: 30px;' class='form-control height30px' type='text' " +
					"value='" + tatotalReceiveAmountforCenterlize + "' id='receivedAmountInnerTblforCenterlize' /></td>");

			columnArrayforCenterlize.push("<td style='text-align: center; vertical-align: middle;'>" +
					"<input data-tooltip='Txn Amount' disabled='disabled' onkeypress='if(this.value==&#39;0&#39;)this.value=&#39;&#39;; return allowOnlyNumeric(event); ' style='text-align: right;height: 30px;' class='form-control height30px' type='text' " +
					"value='0' id='txnAmountforCenterlize' /></td>");

			if(IsTdsAllow) {
				if(allowToEnterAmountInDecimal) {
					columnArrayforCenterlize.push("<td style='text-align: center; vertical-align: middle;'>" +
	    			"<input data-tooltip='Tds' disabled='disabled' onkeypress='if(this.value==&#39;0&#39;)this.value=&#39;&#39;; return validateFloatKeyPress(event, this);' style='text-align: right;height: 30px;' class='form-control height30px' type='text' " +
	    			"value='0' id='tdsAmountforCenterlize' /></td>");
				} else {
					columnArrayforCenterlize.push("<td style='text-align: center; vertical-align: middle;'>" +
					"<input data-tooltip='Tds' disabled='disabled' onkeypress='if(this.value==&#39;0&#39;)this.value=&#39;&#39;; return allowOnlyNumeric(event);' style='text-align: right;height: 30px;' class='form-control height30px' type='text' " +
					"value='0' id='tdsAmountforCenterlize' /></td>");
				}
			}

			columnArrayforCenterlize.push("<td style='text-align: center; vertical-align: middle;'>" +
				"<input data-tooltip='' disabled='disabled' style='text-align: right;height: 30px;' class='form-control height30px' type='text'   id='receivedAmountforCenterlize' /></td>");

			columnArrayforCenterlize.push("<td style='text-align: center; vertical-align: middle;'>" +
				"<input data-tooltip='' disabled='disabled' style='text-align: right;height: 30px;' class='form-control height30px' type='number' " +
				"value='' id='balanceAmountforCenterlize' /></td>");

			columnArrayforCenterlize.push("<td style='text-align: center; vertical-align: middle;' class='hide'>" +
				"<input data-tooltip='' disabled='disabled' style='text-align: right;height: 30px;' class='form-control height30px' type='number' " +
				"value='' id='balanceAmountforCenterlize1' /></td>");

			columnArrayforCenterlize.push("<td style='text-align: center; vertical-align: middle;'>" +
				"<input data-tooltip='Remark' style='text-align: right;height: 30px;' class='form-control height30px' type='text' " +
				"id='remarkforCenterlize' placeholder='Enter Remark'/></td>");

			$('#branchConfigTbodyforCenterlize').append('<tr id="">' + columnArrayforCenterlize.join(' ') + '</tr>');
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
			
			if(!onAccountData)
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

			let columnArrayforCenterlize	= new Array();

			columnArrayforCenterlize.push("<th style='text-align: center;'>Total Amt.</th>");
			columnArrayforCenterlize.push("<th style='text-align: center;'>Receive Amt.</th>");
			columnArrayforCenterlize.push("<th style='text-align: center;'>Txn Amt.</th>");

			if(IsTdsAllow)
				columnArrayforCenterlize.push("<th style='text-align: center;'>TDS Amt.</th>");

			columnArrayforCenterlize.push("<th style='text-align: center;'>Receive Amt.</th>");
			columnArrayforCenterlize.push("<th style='text-align: center;'>Balance</th>");
			columnArrayforCenterlize.push("<th style='text-align: center;'>Remark</th>");

			$('#branchConfigtablefoCenterlize thead').append('<tr class="danger">' + columnArrayforCenterlize.join(' ') + '</tr>');
		}, setPaymentStatus : function(elementId) {
			if(!jQuery.isEmptyObject(paymentStatusArr)) {
				$('#paymentStatus_' + elementId).append($("<option>").attr('value', 0).text('---Select---'));
					
				for(const element of paymentStatusArr) {
					$('#paymentStatus_' + elementId).append($("<option>").attr('value', element.paymentStatusId).text(element.paymentStatusName));
				}
			}
		}, setTxnAmount : function(obj) {
			let billId 			= obj.id;
			billId 				= billId.split("_")[1];
			let paymentStatus 	= Math.round(obj.value);
			let txnAmount 		= Math.round($('#txnAmount_' + billId).val());
			let receivedAmount 	= Math.round($('#receivedAmountInnerTbl_' + billId).val());
			let balanceAmount 	= Math.round($('#balanceAmount_' + billId).val());
			let billAmount 		= Math.round($('#billAmount_' + billId).val());
	
			if(paymentStatus == BILL_CLEARANCE_STATUS_CLEAR_PAYMENT_ID) {
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
	
			if(paymentStatus == BILL_CLEARANCE_STATUS_PARTIAL_PAYMENT_ID && txnAmount == balanceAmount) {
				showAlertMessage('error', 'Cannot select partial as amount is cleared!');
				setTimeout(() => {
					$('#paymentStatus_' + billId).val(BILL_CLEARANCE_STATUS_CLEAR_PAYMENT_ID);
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
		}, calculateTDSforCenterlize : function(obj) {
            if(!IsTdsAllow) return;
    
            let txnAmount        = Math.round($('#txnAmountforCenterlize').val());
            let totalAmt        = Math.round($("#billAmountforCenterlize").val());
            let receivedAmount     = Math.round($('#receivedAmountInnerTblforCenterlize').val());
            let actTotalAmt        = Math.round(totalAmt - receivedAmount);
            
            if(IsTDSInPercentAllow) {
                let tdsAmt        = Math.round((txnAmount * TDSChargeInPercent ) / 100);
                $('#tdsAmountforCenterlize').val(tdsAmt);
                $("#balanceAmountforCenterlize").val(actTotalAmt - txnAmount);
            }
        }, calctxnRecvAmountforCenterlize : function(obj) {
            txnAmount             = parseInt($("#txnAmountforCenterlize").val());
            let totalAmount        = Math.round($("#billAmountforCenterlize").val());
            let balanceAmount    = $("#balanceAmountforCenterlize").val()
        
            if(txnAmount == balanceAmount)
                $('#paymentTypeforCenterlize').val(PAYMENT_TYPE_STATUS_CLEAR_PAYMENT_ID);
        
            $('#receivedAmountforCenterlize').val(txnAmount);
        
            if($('#receivedAmountInnerTblforCenterlize').val() > 0) { 
                let balAmount = $("#balanceAmountforCenterlize").val();
                $("#balanceAmountforCenterlize").val(balAmount - txnAmount);
            } else
                $("#balanceAmountforCenterlize").val(totalAmount - txnAmount);
        }, calctxnRecvAmount : function(obj) {
			let billId 			= obj.id;
			billId 				= billId.split("_")[1];
			
			txnAmount 			= parseInt($("#txnAmount_" + billId).val());
			let totalAmount		= Math.round($("#billAmount_" + billId).val());
			let balanceAmount	= $("#balanceAmount1_" + billId).val()
		
			if(txnAmount == balanceAmount)
				$('#paymentStatus_' + billId).val(PAYMENT_TYPE_STATUS_CLEAR_PAYMENT_ID);
		
			$('#receivedAmount_' + billId).val(txnAmount);
		
			if($('#receivedAmountInnerTbl_' + billId).val() > 0)
				$("#balanceAmount_" + billId).val(balanceAmount - txnAmount);
			else
				$("#balanceAmount_" + billId).val(totalAmount - txnAmount);
		}, calctdsRecvAmount : function(obj) {
			let billId 			= obj.id;
			billId 				= billId.split("_")[1];
			let txnAmount		= parseInt($("#txnAmount_" + billId).val());
			let  tdsAmount		= 0;
			
			if(allowToEnterAmountInDecimal)
				tdsAmount		= $("#tdsAmount_" + billId).val();
			else
				tdsAmount		= Math.round($("#tdsAmount_" + billId).val());
			
			if (tdsAmount > txnAmount) {
				showAlertMessage('error', 'Cannot enter tds amount greater than txn Amount !');
				setTimeout(() => {
					$('#tdsAmount_' + billId).val(0);
				}, 200);
			} else {
				$('#receivedAmount_' + billId).val(txnAmount - tdsAmount);	
			}
			
		}, onSubmit : function() {
			let paymentType = $('#paymentModeId').val();

			if(paymentType == 0) {
				showAlertMessage('error','Please, Select Payment Mode !');
				setTimeout(() => {
					$('#paymentModeId').focus();
				}, 300);
				return false;
			}
				
			let rowCount 		= $('#storedPaymentDetails tr').length;
				
			if(isValidPaymentMode(paymentType) && rowCount <= 0) {
				showAlertMessage('info', 'Please, Add Payment details !');
				return false;
			}
			
			let billIdArr		= new Array();
			let tbody			= $('#branchConfigTbody')[0].childNodes;
			let billWiseArr 	= new Array();
			
			for(const element of tbody) {
				billIdArr.push(element.id);
			}

			let isBalanceLessThanZero = false;

			for(const element of billIdArr) {
				let billWiseObj 	= new Object();

				if(!onAccountData && $('#paymentStatus_' + element).val() <= 0) {
					showAlertMessage('error', 'Please, Select Payment Status !');
					$('#paymentStatus_' + element).focus();
					return false;
				}
				
				if($('#txnAmount_' + element).val() <= 0){
					showAlertMessage('error', 'Please, Enter transaction amount !');
					$('#txnAmount_' + element).focus();
					return false;
				}
			
				let totalAmt	= parseInt($("#billAmount_" + element).val());
				let receivedAmt	= parseInt($("#receivedAmountInnerTbl_" + element).val());
			
				if($('#balanceAmount_' + element).val() < 0) {
					isBalanceLessThanZero = true;
					$('#txnAmount_' + element).val(0);
					$('#txnAmount_' + element).focus();
					$('#tdsAmount_' + element).val(0);
					$("#balanceAmount_" + element).val(totalAmt - receivedAmt);
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
				billWiseObj.paymentStatus					= $('#paymentStatus_' + element).val();
				billWiseObj.billAmount						= $('#billAmount_' + element).val();
				billWiseObj.txnAmount 						= $('#txnAmount_' + element).val();
				billWiseObj.receivedAmount 					= $('#receivedAmount_' + element).val();
				billWiseObj.tdsAmount 						= $('#tdsAmount_' + element).val();
				billWiseObj.PanNumber 						= $('#panNumber_' + element).val();
				billWiseObj.TanNumber 						= $('#tanNumber_' + element).val();
				billWiseObj.balanceAmount 					= $('#balanceAmount_' + element).val();
				billWiseObj.remark 							= $('#remark_' + element).val();
				billWiseObj.corporateAccountId 				= Number($('#partyId_' + element).html());
				
				billWiseArr.push(billWiseObj);
			}
	
			if(isBalanceLessThanZero) {
				_this.calculateTotal();
				showAlertMessage('error','Cannot enter amount greater than ');
				return false;
			}
			
			if(!doneTheStuff) {
				onAccountDetailsArr	= new Array();
				let onAccountDetailsTable		= document.getElementById('onAccountDetailsTable');
				totalOnAccountBalanceAmount	= 0;
				
				if(onAccountData && typeof onAccountDetailsTable !== 'undefined') {
					totalBillReceivedAmount = $('#receivedAmountforCenterlize').val();
					let rowCount	= onAccountDetailsTable.rows.length;
					
					for(let m = 0; m < rowCount - 1; m++) {
						let chkBx = document.getElementById("onAccountCheckBoxEle_" + m);
						
						if(chkBx && chkBx.checked) {
							totalOnAccountBalanceAmount	+= Number($('#onAccountBalanceAmountEle_' + m).val());
							
							let onAccountDetailsObj	= new Object;
							
							onAccountDetailsObj.onAccountId			= Number(chkBx.value);
							onAccountDetailsObj.onAccountNumber		= document.getElementById("onAccountNumberEle_" + m).value;
							onAccountDetailsObj.balanceAmount		= Number(document.getElementById("onAccountBalanceAmountEle_" + m).value);
							onAccountDetailsObj.paymentType			= Number(document.getElementById("onAccountPaymentTypeEle_" + m).value);
							
							if(onAccountDetailsObj.paymentType != PAYMENT_TYPE_CASH_ID) {
								onAccountDetailsObj.chequeNumber	= document.getElementById("onAccountChequeNumberEle_" + m).value;
								onAccountDetailsObj.bankName		= document.getElementById("onAccountBankNameEle_" + m).value;
							}
							
							onAccountDetailsObj.totalAmount			= document.getElementById("onAccountTotalAmountEle_" + m).value;
							
							onAccountDetailsArr.push(onAccountDetailsObj);
						} 
					}

					if(onAccountDetailsArr != null && onAccountDetailsArr.length > 0) {
						if(totalBillReceivedAmount > 0 && totalBillReceivedAmount > totalOnAccountBalanceAmount) {
							showMessage('info', 'Total Bill Amount ' + totalBillReceivedAmount + ' Cannot Be More Than Total Voucher Amount ' + totalOnAccountBalanceAmount);
							return false;
						}
					} else {
						showMessage('error', 'Please Select Atleast 1 Voucher/On Account !');
						return false;
					}
				}				
				
				var onAccountPaymentValues			= new Array();

				if(onAccountDetailsArr != null && onAccountDetailsArr.length > 0) {
					if(onAccountDetailsArr[0].paymentType != PAYMENT_TYPE_CASH_ID) {
						if(typeof onAccountDetailsList !== 'undefined' && onAccountDetailsList != null && onAccountDetailsList.length > 0) {
							for (let i = 0; i <= onAccountDetailsList.length - 1; i++) {
								for (let j = 0; j <= onAccountDetailsArr.length - 1; j++) {
									if(onAccountDetailsArr[j].onAccountId == onAccountDetailsList[i].onAccountId)
										onAccountDetailsArr[j] = onAccountDetailsList[i];
								}
							}
						}
	
						let paymentType			= 0;
						let amount 				= 0;
						let chequeNumber		= null;
						let payerName			= null;
						let payeeName			= null;
						let bankAccountNumber	= null;
						let cardNo 				= null;
						let referenceNumber		= null;
						let bankName			= null;
						let chequeGivenTo		= null;
						let chequeGivenBy		= null;
						let upiId				= null;
	
						paymentType	= onAccountDetailsArr[0].paymentType;
	
						if(typeof onAccountDetailsArr[0].bankPaymentChequeNumber !== 'undefined') chequeNumber = onAccountDetailsArr[0].bankPaymentChequeNumber;
						if(typeof onAccountDetailsArr[0].payerName !== 'undefined') payerName = onAccountDetailsArr[0].payerName;
						if(typeof onAccountDetailsArr[0].payeeName !== 'undefined') payeeName = onAccountDetailsArr[0].payeeName;
						if(typeof onAccountDetailsArr[0].bankAccountNumber !== 'undefined') bankAccountNumber = onAccountDetailsArr[0].bankAccountNumber;
						if(typeof onAccountDetailsArr[0].cardNo !== 'undefined') cardNo = onAccountDetailsArr[0].cardNo;
						if(typeof onAccountDetailsArr[0].referenceNumber !== 'undefined') referenceNumber = onAccountDetailsArr[0].referenceNumber;
						if(typeof onAccountDetailsArr[0].bankName !== 'undefined') bankName = onAccountDetailsArr[0].bankName;
						if(typeof onAccountDetailsArr[0].chequeGivenTo !== 'undefined') chequeGivenTo = onAccountDetailsArr[0].chequeGivenTo;
						if(typeof onAccountDetailsArr[0].chequeGivenBy !== 'undefined') chequeGivenBy = onAccountDetailsArr[0].chequeGivenBy;
						if(typeof onAccountDetailsArr[0].upiId !== 'undefined') upiId = onAccountDetailsArr[0].upiId;
	
						if(typeof onAccountDetailsArr !== 'undefined' && onAccountDetailsArr != null && onAccountDetailsArr.length > 0) {
							for (let i = 0; i <= onAccountDetailsArr.length - 1; i++) {
								if(Number(paymentType) != Number(onAccountDetailsArr[i].paymentType)) {
									showMessage('info', 'Please Select Vouchers With Same Payment Type !');
									return false;
								}
								
								if(typeof onAccountDetailsArr[i].bankPaymentChequeNumber == 'undefined') onAccountDetailsArr[i].bankPaymentChequeNumber	= null;
								if(typeof onAccountDetailsArr[i].payerName == 'undefined') onAccountDetailsArr[i].payerName	= null;
								if(typeof onAccountDetailsArr[i].payeeName == 'undefined') onAccountDetailsArr[i].payeeName	= null;
								if(typeof onAccountDetailsArr[i].bankAccountNumber == 'undefined') onAccountDetailsArr[i].bankAccountNumber	= null;
								if(typeof onAccountDetailsArr[i].cardNo == 'undefined') onAccountDetailsArr[i].cardNo	= null;
								if(typeof onAccountDetailsArr[i].referenceNumber == 'undefined') onAccountDetailsArr[i].referenceNumber	= null;
								if(typeof onAccountDetailsArr[i].bankName == 'undefined') onAccountDetailsArr[i].bankName	= null;
								if(typeof onAccountDetailsArr[i].chequeGivenTo == 'undefined') onAccountDetailsArr[i].chequeGivenTo	= null;
								if(typeof onAccountDetailsArr[i].chequeGivenBy == 'undefined') onAccountDetailsArr[i].chequeGivenBy	= null;
								if(typeof onAccountDetailsArr[i].upiId == 'undefined') onAccountDetailsArr[i].upiId	= null;
								
								if(Number(paymentType) == Number(onAccountDetailsArr[i].paymentType)) {
									if(chequeNumber != onAccountDetailsArr[i].bankPaymentChequeNumber
										|| payerName != onAccountDetailsArr[i].payerName
										|| payeeName != onAccountDetailsArr[i].payeeName
										|| bankAccountNumber != onAccountDetailsArr[i].bankAccountNumber
										|| cardNo != onAccountDetailsArr[i].cardNo
										|| referenceNumber != onAccountDetailsArr[i].referenceNumber
										|| bankName != onAccountDetailsArr[i].bankName
										|| chequeGivenTo != onAccountDetailsArr[i].chequeGivenTo
										|| chequeGivenBy != onAccountDetailsArr[i].chequeGivenBy
										|| upiId != onAccountDetailsArr[i].upiId
									) {
										showMessage('info', 'Please Select Vouchers With Same Payment Type !');
										return false;
									}
								}
							}
						}
	
						for (let i = 0; i <= billIdArr.length - 1; i++) {
							let billId 		= billIdArr[i];
							let billno 		= $('#billNo_' + billId).val();
	
							let onAccountPaymentValuesStr	 = (i + 1) + '_' + billno + '_' + billId + '_' + onAccountDetailsArr[0].issueBankId + '_' + chequeNumber + '_' + onAccountDetailsArr[0].chequeDateStr + '_' + amount + '_' + payerName + '_' + bankAccountNumber + '_' + cardNo + '_' + referenceNumber + '_' + onAccountDetailsArr[0].mobileNumber + '_' + onAccountDetailsArr[0].bankAccountId + '_' + bankName + '_' + payeeName + '_' + onAccountDetailsArr[0].paymentType + '_' + chequeGivenTo + '_' + chequeGivenBy +'_'+ upiId;
	
							onAccountPaymentValues.push(onAccountPaymentValuesStr.split("_").join("_"))
						}
					}
				}
				
				if(billWiseArr.length > 0) {
					if (confirm("Are you sure to settle bill?")) {
						doneTheStuff = true;
						showLayer();
						
						jsonObject	= new Object();

						if(onAccountDetailsArr != null && onAccountDetailsArr.length > 0 && typeof onAccountPaymentValues !== 'undefined') {
							jsonObject.PaymentType		= onAccountDetailsArr[0].paymentType;
							jsonObject.paymentValues	= onAccountPaymentValues.join(',');
						} else
							jsonObject.paymentValues					= $('#paymentCheckBox').val();
							
						jsonObject.billWiseArr						= JSON.stringify(billWiseArr);
						jsonObject.onAccountDetailsArr				= JSON.stringify(onAccountDetailsArr);
						jsonObject.corporateAccountId				= corporateAccountId;
						jsonObject.shortCreditCollLedgerBranchId	= shortCreditCollLedgerBranchId;
						jsonObject.paymentType						= $('#paymentModeId').val();
						jsonObject.billAmount						= $('#billAmountforCenterlize').val();
						jsonObject.txnAmount 						= $('#txnAmountforCenterlize').val();
						jsonObject.receivedAmount 					= $('#receivedAmountforCenterlize').val();
						jsonObject.tdsAmount 						= $('#tdsAmountforCenterlize').val();
						jsonObject.balanceAmount 					= $('#balanceAmountforCenterlize').val();
						
						if(tokenWiseCheckingForDuplicateTransaction) {
							jsonObject.TOKEN_KEY									= TOKEN_KEY;
							jsonObject.TOKEN_VALUE									= TOKEN_VALUE;
							jsonObject.tokenWiseCheckingForDuplicateTransaction		= tokenWiseCheckingForDuplicateTransaction;	
						}
						
						if(allowBackDateEntryForStbsSettlement && $('#settlementDateDiv').exists() && $('#settlementDateDiv').is(":visible"))
							jsonObject.settlementDate				= $('#settlementDate').val();
							
						getJSON(jsonObject, WEB_SERVICE_URL	+ '/shortCreditBillPaymentWS/settleShortCreditMultiplePayment.do?',	_this.setSuccess, EXECUTE_WITHOUT_ERROR);
					} else {
						hideLayer();
						doneTheStuff = false;
					}
				}
			}
		}, setSuccess : function(response) {
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
			let subIdArray = new Array();
			let billIdArray = new Array();

			for(const element of moneyRecepiptList) {
				let createRow				= createRowInTable('', '', '');
				
				let mrNumber				= element.moneyReceiptNumber;
				let mrDate					= element.txnDateTimeString;
				let billingPartyName		= element.billingPartyName;
				let billNumber				= element.billNumber;
				let billAmt					= element.moneyReceiptTotalAmount;
				let mrPrint					= '<button id="mrPrintBtn" class="btn btn-primary" onclick="getMultiMRPrintDetailsData()">MR Print</button>';
			
				subIdArray.push(element.subId);
				billIdArray.push(element.id);

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

			subIdsStr = subIdArray.join(',');
	 		billIdsStr = billIdArray.join(',');
		}, calculateTotal : function() {
			let inputs = document.querySelectorAll('.inputAmount');
			let inputTds = document.querySelectorAll('.inputAmounts');

			let total = 0;
			let totalTds = 0;

			inputs.forEach(function(input) {
				total += parseFloat(input.value) || 0; 
			});

			inputTds.forEach(function(input) {
				totalTds += parseFloat(input.value) || 0; 
			});

			$('#txnAmountforCenterlize').val(total);
			$('#receivedAmountforCenterlize').val(total - totalTds);
			$('#balanceAmountforCenterlize').val(tatotalAmountforCenterlize - tatotalReceiveAmountforCenterlize - total);
			$('#tdsAmountforCenterlize').val(totalTds);
		}, setOnAccountDetails : function() {
			if(typeof onAccountDetailsList !== 'undefined' && onAccountDetailsList != null && onAccountDetailsList.length > 0) {
				$('#paymentMode').remove();
				$('#paymentType').remove();
				$('#onAccountDetailsHeader').removeClass('hide');
				$('#onAccountDetailsDiv').removeClass('hide');
				
				let columnArray		= new Array();
				
				for (let i = 0; i < onAccountDetailsList.length; i++) {
					let obj		= onAccountDetailsList[i];
					
					let chequeDateString 	= '--';
					let chequeNumber 		= '--';
					let bankName 			= '--';
					
					if(typeof obj.chequeDateString !== 'undefined')
						chequeDateString	= obj.chequeDateString;
					
					if(typeof obj.chequeNumber !== 'undefined')
						chequeNumber	= obj.chequeNumber;
					
					if(typeof obj.bankName !== 'undefined')
						bankName	= obj.bankName;
					
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + (i + 1) + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'><input class='form-control' type='checkbox' name='onAccountCheckBoxEle_" + i + "' style='text-transform: uppercase;' id='onAccountCheckBoxEle_" + i + "' value='"+obj.onAccountId+"' onclick='' /></td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'><b style='font-size: 14px; color: #1d7596;'>"+obj.onAccountNumber+"</b><input type='hidden' id ='onAccountNumberEle_"+i+"' value='"+obj.onAccountNumber+"'/></td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'><b style='font-size: 14px; color: #1d7596;'>"+obj.partyName+"</b><input type='hidden' id ='onAccountPartyEle_"+i+"' value='"+obj.partyName+"'/></td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'><b style='font-size: 14px; color: #1d7596;'>"+obj.totalAmount+"</b><input type='hidden' id ='onAccountTotalAmountEle_"+i+"' value='"+obj.totalAmount+"'/></td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'><b style='font-size: 14px; color: #1d7596'>"+obj.balanceAmount+"</b><input type='hidden' id ='onAccountBalanceAmountEle_"+i+"' value='"+obj.balanceAmount+"'/></td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'><b style='font-size: 14px; color: #1d7596'>"+obj.paymentTypeString+"</b><input type='hidden' id ='onAccountPaymentTypeEle_"+i+"' value='"+obj.paymentType+"'/></td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'><b style='font-size: 14px; color: #1d7596'>"+chequeDateString+"</b><input type='hidden' id ='onAccountChequeDateEle_"+i+"' value='"+chequeDateString+"'/></td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'><b style='font-size: 14px; color: #1d7596'>"+chequeNumber+"</b><input type='hidden' id ='onAccountChequeNumberEle_"+i+"' value='"+chequeNumber+"'/></td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'><b style='font-size: 14px; color: #1d7596'>"+bankName+"</b><input type='hidden' id ='onAccountBankNameEle_"+i+"' value='"+bankName+"'/></td>");
					$('#onAccountDetailsTable tbody').append('<tr id="onAccountDetails_'+ obj.onAccountId +'">' + columnArray.join(' ') + '</tr>');
					
					columnArray	= [];
				}
				$('#txnAmountforCenterlize').val(totalReceivedAmount);
				$('#receivedAmountforCenterlize').val(totalReceivedAmount);
				totalBillReceivedAmount = totalReceivedAmount;
			} else {
				$('#onAccountDetailsHeader').addClass('hide');
				$('#onAccountDetailsDiv').addClass('hide');
			}
		}
	});
});

function getMultiMRPrintDetailsData(){
	childwin = window.open("printMoneyReceipt.do?pageId=3&eventId=16&billIds="+billIdsStr+"&moduleIdentifier=96&billClearanceIds="+subIdsStr+"&differentMrPrintForParitalPayment=true",'_blank',"newwindow",config="height=500,width=700, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no");
}

function hideShowChequeDetails(billId, obj) {
	hideShowBankPaymentTypeOptions(obj); //defined in paymentTypeSelection.js
}
