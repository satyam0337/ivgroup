var moduleId = 0, incomeExpenseModuleId = 0, ModuleIdentifierConstant = null, allowManualDateForBLHPVReceive = false,
PaymentTypeConstant	= null, configuration = null, GeneralConfiguration = null,doneTheStuff = false
dieselWiseSplitAmtList = new Array();

/**
 *	define(['moduleURL1', 'moduleURL2'], function (module1Obj, module2Obj) {
			module1 should consist of moduleURL1 URL and module1Obj is the Object corresponding to moduleURL1
			modules module1Obj and module2Obj are now available for use.
		});
	});
 */
define([
		'/ivcargo/resources/js/generic/urlparameter.js'
		,'JsonUtility'
		,'messageUtility'
		,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
		//constant for project name and domain urls
		//text! is used to convert the html to plain text which helps to fetch HTML through require
		//Master Template is used to get standard Layout of master pages
		,'focusnavigation'//import in require.config
		,'autocompleteWrapper'
		,PROJECT_IVUIRESOURCES + '/resources/js/validation/regexvalidation.js'//import in require.config
		], function(UrlParameter) {

	'use strict';// this basically give strictness to this specific js 
	var blhpvId = 0, blhpvNumber = null, paymentMode = 0, bankPaymentOperationRequired = false, jsonObject	= new Object(), tdsConfiguration = null, _this = '', 
	LHPVChargeTypeConstant	= null,showLHPVApproveButton = false, expiryAllowedForLhpv = false, isAllowDebitToBranch = false,
	blhpvSequenceCounter = null, blhpvPrintFromNewFlow = false, lhpvChargesForGroup = null, lorryHireAmt = 0, lhpvRate = 0, truckCapacity = 0, truckCapacityInTon = 0, vehicleNumberMasterId = 0, lhpvIdToCreateBLHPV = 0,
	lhpvChargesHshmp = null, LHPVConstant	= null, finalAmt = 0, weighBridgeReceiptImage = null,
	branchWiseLhpvAmountId, openingKM = 0, ratePerKM = 0, totalLorryHireAmount = 0,
	lhpvBalanceAmount = 0,hamaliCharge = 0, lhpvRefundAmount = 0, TOKEN_KEY = null, TOKEN_VALUE = null,
	branchWiseLhpvAmountId = 0, openingKM = 0, ratePerKM = 0, totalLorryHireAmount = 0,
	lhpvBalanceAmount = 0, lhpvRefundAmount = 0, TOKEN_KEY = null, TOKEN_VALUE = null, isSingleBranchSplitLHPV = false, lhpvChargeGrpArr = null;

	// to know about layout refer url:http://marionettejs.com/docs/v1.8.7/marionette.layout.html
	return Marionette.LayoutView.extend({
		initialize: function(){
			//initialize is the first function called on call new view()
			blhpvId			= UrlParameter.getModuleNameFromParam('blhpvId');
			blhpvNumber		= UrlParameter.getModuleNameFromParam('blhpvNumber');
			paymentMode		= UrlParameter.getModuleNameFromParam('paymentMode');
			_this = this;
		}, render: function() {
			getJSON(jsonObject, WEB_SERVICE_URL+'/blhpvWS/loadDataForBlhpvCreation.do', _this.setData, EXECUTE_WITH_ERROR);
			//initialize is the first function called on call new view()
			return _this;
		}, setData : function(data) {
			GeneralConfiguration			= data.GeneralConfiguration;
			bankPaymentOperationRequired	= GeneralConfiguration.BankPaymentOperationRequired;
			
			let loadelement = new Array();
			let baseHtml	= new $.Deferred();
			let paymentHtml	= new $.Deferred();
			let dieselElement	=  new Array();
			loadelement.push(baseHtml);
			
			if(bankPaymentOperationRequired)
				loadelement.push(paymentHtml);
			
			$("#mainContent").load("/ivcargo/html/module/blhpv/createBlhpv.html",
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
				configuration					= data.BlhpvConfiguration;
				LHPVChargeTypeConstant			= data.LHPVChargeTypeConstant;
				PaymentTypeConstant				= data.PaymentTypeConstant;
				moduleId						= data.moduleId;
				incomeExpenseModuleId			= data.incomeExpenseModuleId;
				ModuleIdentifierConstant		= data.ModuleIdentifierConstant;
				LHPVConstant					= data.LHPVConstant;
				tdsConfiguration				= data.tdsConfiguration;
				showLHPVApproveButton			= data.showLHPVApproveButton;
				expiryAllowedForLhpv			= data.expiryAllowedForLhpv;
				lhpvChargesForGroup				= data.lhpvChargesForGroups;
				isAllowDebitToBranch			= data.isAllowDebitToBranch;
				let isSeqCounterPresent			= data.isSeqCounterPresent;
				blhpvSequenceCounter			= data.BLHPVSequenceCounter;
				blhpvPrintFromNewFlow			= configuration.BLhpvPrintFromNewFlow;
				TOKEN_KEY						= data.TOKEN_KEY;
				TOKEN_VALUE						= data.TOKEN_VALUE;
				allowManualDateForBLHPVReceive	= data.allowManualDateForBLHPVReceive;
				
				configuration.isAllowAlphnumericWithSpecialCharacters	= configuration.isAllowAlphnumericWithSpecialCharactersSeq;
				
				_this.loadCreateBlhpvPage(); 
				if(typeof createVideoLink != 'undefined') createVideoLink(data);
				
				if(configuration.showSplitDieselWiseBlhpv) {
					let dieselHtml	= new $.Deferred();
					dieselElement.push(dieselHtml);
					
					$("#splitDieselDataDetailPanel").load("/ivcargo/html/lhpv/splitDieselDataDetail.html",
							function() {
						dieselHtml.resolve();
					});

					$.when.apply($, dieselElement).done(function() {
						let fuelPumpEleAutoComplete = new Object();
						fuelPumpEleAutoComplete.url = data.pumpNameMasterList;
						fuelPumpEleAutoComplete.primary_key = 'pumpNameMasterId';
						fuelPumpEleAutoComplete.field = 'name';
						$("#fuelPumpEle").autocompleteCustom(fuelPumpEleAutoComplete);

						_this.openPopupForDiesel();
					});
				} else
					$("#openSplitDiesel").remove();
				
				if(!isSeqCounterPresent && !configuration.hideMannualBLhpvSequenceMsg)
					$('#hideMannualBLhpvSequenceMsg').html('[ BLHPV Manual Sequence not defined !! ]');
				
				if(blhpvSequenceCounter || configuration.isAllowManualBLHPVWithoutSeqCounter) {
					if(blhpvSequenceCounter != null)
						$('#range').html("[" + blhpvSequenceCounter.minRange + " - " + blhpvSequenceCounter.maxRange + "]")
						
					if(configuration.isAllowManualBLHPVWithoutSeqCounter)
						$('#hideMannualBLhpvSequenceMsg').remove();
				} else 
					$('#blhpvSequenceCounter').remove();
				
				$('#lhpvNo').focus();
				
				$( "#lhpvNo" ).keypress(function( event ) {
					if ( event.which == 13 && _this.validateLHPVNumber())
						_this.getLhpvDetailsToCreateBlhpv(0);
				});
				
				$( "#lhpvNo" ).keyup(function( event ) {
					  if ( event.which == 8 || event.which == 46)
						  _this.resetAllData();
				});
				
				$("#searchButton").bind("click", function() {
					if(_this.validateLHPVNumber())
						_this.getLhpvDetailsToCreateBlhpv(0);
				});
				
				if(bankPaymentOperationRequired) {
					$("#viewAddedPaymentDetailsCreate").click(function() {
						openAddedPaymentTypeModel();
					});
					
					$(".chequeDetails").remove();
					
					setIssueBankAutocomplete();
					setAccountNoAutocomplete();
				}
				
				if(!bankPaymentOperationRequired)
					$('#viewAddedPaymentDetailsCreate').remove();
				
				_this.setAutoCompleters(data);
				_this.showManualDate();
				
				if(blhpvId > 0) {
					$('#datasaved').html('<br><br><b style="font-size: 16px;"> BLHPV Created ! BLHPV No :</b> is <b>' + blhpvNumber + '</b>&emsp;<button type="button" name="reprintBtn" id="reprintBtn" class="btn btn-success" data-tooltip="Reprint">BLHPV Print</button>');
					
					if(paymentMode == PAYMENT_TYPE_CREDIT_ID)
						$('#shortcreditpayment').html('<span style="font-size: 14px; font-weight: bold;">BLHPV Credit Payment: </span>&nbsp;<a class="btn btn-success" href="BlhpvCreditPayment.do?pageId=340&eventId=1&modulename=blhpvCreditPayment&blhpvId='+ blhpvId +'" target="_blank">' + blhpvNumber + '</a>');
					
					$("#reprintBtn").bind("click", function() {
						_this.openPrintForBlhpv(blhpvId, configuration.isPrintDuplicate);
					});
				}
				
				//Calling from elementfocusnavigation.js file
				//initialiseFocus();
			});
			
			hideLayer();
		}, loadCreateBlhpvPage : function() {
			if(configuration.truckCommissionAmountField || configuration.commissionBranchField) {
				changeDisplayProperty('commissiondetails', 'block');
				
				if(configuration.truckCommissionAmountField)
					changeDisplayProperty('truckcommissionamountpanel', 'block');
				
				if(configuration.commissionBranchField)
					changeDisplayProperty('commissionbranchpanel', 'block');
			} else
				$('#commissiondetails').remove();

			if(configuration.isShowWeighBridgeAmountField)
				changeDisplayProperty('WeighBridgeAmountCol', 'block');
			else
				$('#WeighBridgeAmountCol').remove();
			
			if(configuration.isShowUploadWeighBillReceiptOption)
				changeDisplayProperty('UploadWeighBillReceiptCol', 'block');
			else 
				$('#UploadWeighBillReceiptCol').remove();

			$('#uploadReceipt').click(function(){
				$("#uploadReceiptModal").modal({
					backdrop: 'static',
					keyboard: false
				});
				
				$('#photo').val('');
				
				if(!validateFileTypeAndSize())
					return;
			});

			$('#viewReceipt').click(function(){
				$("#addedBlhpvReceiptModal").modal({
					backdrop: 'static',
					keyboard: false
				});
				$('#storedBlhpvReceiptDetails tr').empty();
				
				setTimeout(() => {
					if(weighBridgeReceiptImage != null) {
						$('<tr id="blhpvReceiptDataTr">').appendTo('#storedBlhpvReceiptDetails');

						if($('#photo') != undefined)
							$('<td><img src="' + weighBridgeReceiptImage + '" style="height: 200px; width: 500px;" class="zoom"/></td>').appendTo('#blhpvReceiptDataTr');
						else
							$('<td></td>').appendTo('#blhpvReceiptDataTr');

						$('</tr>').appendTo('#storedBlhpvReceiptDetails');
					}
				},500);
			});
		}, setAutoCompleters : function(data) {
			if(configuration.commissionBranchField)
				_this.setCommissionBranchAutocomplete();
			
			let paymentTypeArr	= data.paymentTypeArr;
			
			$('#paymentType').find('option').remove().end();
			$('#paymentType').append('<option value="' + 0 + '" id="' + 0 + '">-- Select --</option>');
			
			if(!jQuery.isEmptyObject(paymentTypeArr)) {
				for(const element of paymentTypeArr) {
					if(element != null)
						$('#paymentType').append('<option value="' + element.paymentTypeId + '" id="' + element.paymentTypeId + '">' + element.paymentTypeName + '</option>');
				}
			}
			
			$('#partPaymentType').find('option').remove().end();
			$('#partPaymentType').append('<option value="' + 0 + '" id="' + 0 + '">-- Select Payment Mode --</option>');
			
			if(!jQuery.isEmptyObject(paymentTypeArr)) {
				for(const element of paymentTypeArr) {
					if(element != null) {
						if(element.paymentTypeId == PAYMENT_TYPE_PART_PAYMENT_ID || element.paymentTypeId == PAYMENT_TYPE_CREDIT_ID) {
						} else
							$('#partPaymentType').append('<option value="' + element.paymentTypeId + '">' + element.paymentTypeName + '</option>');
					}
				}
			}
			
			if(isAllowDebitToBranch) {
				let branchList	= data.branchList;
				
				$('#debitToBranchRow').removeClass('hide');
				
				$('#debitToBranchSelection').find('option').remove().end();
				$('#debitToBranchSelection').append('<option value="' + 0 + '" id="' + 0 + '">-- Select Branch --</option>');
				
				for(const element of branchList) {
					if(element)
						$('#debitToBranchSelection').append('<option value="' + element.branchId + '">' + element.branchName + '</option>');
				}
			} else
				$('#debitToBranchRow').remove();
			
			$('#paymentType').change(function() {
				_this.hideShowChequeDetails(this);
				_this.changeOnPaymentType(this);
				_this.onPaymentTypeSelect(this);
			});
			
			$('#paymentType').keyup(function() {
				_this.hideShowChequeDetails(this);
			});
			
			$('#partPaymentType').change(function() {
				_this.hideShowChequeDetails(this);
			});
			
			$('#partPaymentType').keyup(function() {
				_this.hideShowChequeDetails(this);
			});
		}, setCommissionBranchAutocomplete : function() {
			let commissionBranchAutocomplete			= new Object();
			commissionBranchAutocomplete.primary_key	= 'branchId';
			commissionBranchAutocomplete.url			= WEB_SERVICE_URL+'/autoCompleteWS/getBranchAutocompleteByAccountGroup.do';
			commissionBranchAutocomplete.field			= 'branchName';
			$("#commissionBranch").autocompleteCustom(partyNameAutoComplete);
		}, showManualDate : function() {
			// For manual date Only
			if(configuration.showManualDateForBLHPVReceive || allowManualDateForBLHPVReceive){
				changeDisplayProperty('isManualBLHPVChk', 'none');
				changeDisplayProperty('manualBLHPVDateRow', 'block');
				setValueToTextField('manualBLHPVDate', getCurrentDate());
			}
			
			// For manual number only
			if(configuration.showManualNumberForBLHPVReceive){
				changeDisplayProperty('isManualBLHPVChk', 'table-cell');
				changeDisplayProperty('manualBLHPVDateRow', 'none');
			}
			
			if(!configuration.showManualDateForBLHPVReceive  && !configuration.showManualNumberForBLHPVReceive && !allowManualDateForBLHPVReceive) 
				$('#blhpvSequenceCounter').remove();
			
			$("#isManualBLHPV").bind("click", function() {
				_this.goToManualSelection();
			});
		}, hideShowChequeDetails : function(obj) {
			if(obj.value == PAYMENT_TYPE_CREDIT_ID) {
				_this.resetAndHideTDSData();
			} else if(tdsConfiguration.IsTdsAllow) {
				$('#tdsdetails').show();
				$('.tdsrow').show();
				$('.tdsRateRow').show();
				
				if(tdsConfiguration.IsPANNumberRequired)
					$('#panNumberRow').show();
					
				if(tdsConfiguration.IsTANNumberRequired)
					$('#tanNumberRow').show();
			} else
				$('#tdsdetails').remove();

			if(bankPaymentOperationRequired) {
				hideShowBankPaymentTypeOptions(obj);
			} else if(obj.value == PAYMENT_TYPE_CHEQUE_ID 
					|| obj.value == PAYMENT_TYPE_ONLINE_NEFT_ID 
					|| obj.value == PAYMENT_TYPE_ONLINE_RTGS_ID 
					|| obj.value == PAYMENT_TYPE_IMPS_ID ) {
				$(".chequeDetails").removeClass('hide');
			} else {
				$('#chequeNo').val(0);
				$('#chequeAmount').val(0);
				$('#bankName').val('');
				$(".chequeDetails").addClass('hide');
			}
		}, changeOnPaymentType : function(obj) {
			if(obj.value == PAYMENT_TYPE_PART_PAYMENT_ID) {
				changeDisplayProperty('partPaymentTypeDetails', 'block');
				changeDisplayProperty('receivedAmountRow', 'block');
				$('#receivedAmount').attr("readonly", false);
			} else {
				changeDisplayProperty('partPaymentTypeDetails', 'none');
				changeDisplayProperty('receivedAmountRow', 'none');
				$('#partPaymentType').val(0);
				$('#receivedAmount').val(0);
				$('#receivedAmount').attr("readonly", true);
			}
		}, onPaymentTypeSelect : function(obj) {
			if(isAllowDebitToBranch){
				if(obj.value == PAYMENT_TYPE_CREDIT_ID) {
					if($('#debitToBranchTable').exists() && $('#debitToBranchTable').is(":visible"))
						$('#debitToBranchTable').addClass('hide');
				} else
					$('#debitToBranchTable').removeClass('hide');
			}
		}, resetAndHideTDSData : function() {
			$('#tdsAmount').val(0);
			$('#tdsAmount').val(0);
			$('#tdsRate').val(0);
			$('#panNumber').val('');
			$('#tanNumber').val('');
			$('#panNumberRow').hide();
			$('#tdsRateRow').hide();
			$('#tanNumberRow').hide();
			$('.tdsrow').hide();
			$('#tdsdetails').hide();
		}, validateLHPVNumber : function() {
			let lhpvNo	= document.getElementById('lhpvNo');
			let str		= lhpvNo.value.replace(/\s/g, '');

			if(str.length == 0) {
				showMessage('error', "Please, Enter Number.");
				setTimeout(function(){
					if(lhpvNo) {
						lhpvNo.focus();lhpvNo.select();
					}
				},100);
				return false;
			}

			return true;
		}, getLhpvDetailsToCreateBlhpv : function(lhpvId) {
			let jsonObject		= new Object();

			jsonObject.lhpvId		= lhpvId;
			jsonObject.lhpvNumber	= ($('#lhpvNo').val()).replace(/\s/g, '');
			showLayer();
			
			getJSON(jsonObject, WEB_SERVICE_URL+'/blhpvWS/getLHPVDetailsToCreateBlhpv.do', _this.setDataToCreateBlhpv, EXECUTE_WITH_ERROR);
		}, setDataToCreateBlhpv : function(data) {
			if(data.message != undefined) {
				_this.resetAndHideTDSData();
				_this.resetAllData();
				hideLayer();
				return;
			}
			
			hideLayer();
			
			let lhpvList						= data.lhpvList;
			let lhpvExpiredWithPermission		= data.lhpvExpiredWithPermission;
			let lhpvApprovalId					= data.lhpvApprovalId;
				lhpvChargesHshmp				= data.lhpvChargesHshmp;
			let chargesColl						= data.chargesColl;
			let DeliveryRunsheetLedgerDetails	= data.DeliveryRunsheetLedgerDetails;
			let LHPVDetails						= data.LHPVDetails;
			let lhpv							= data.LHPVDetails;
			let DispatchLedgerDetails			= data.DispatchLedgerDetails;
			let previousDate					= data.previousDate;
			let currentDate						= data.currentDate;
			let noOfDays						= data.noOfDays;
			let allowBLHPV						= data.allowBLHPV;
			let tdsChargeList					= data.tdsChargeList;
			let branchWiseLhpvAmount			= data.branchWiseLhpvAmount;
			let isSplitLHPV						= data.isSplitLHPV;
			hamaliCharge						= data.hamaliCharge;
			isSingleBranchSplitLHPV				= data.isSingleBranchSplitLHPV;
			
			$( "#lsWiseButton").unbind( "click" );
			$( "#lrWiseButton").unbind( "click" );
			$( "#Save").unbind();
			
			if(lhpvList && lhpvList != null) {
				changeDisplayProperty('lhpvdetailspannel', 'none');
				changeDisplayProperty('multiplelhpvsetailspannel', 'block');
				_this.setMultipleLHPVDetails(lhpvList);
				return;
			}
			
			if((DispatchLedgerDetails != null || DeliveryRunsheetLedgerDetails != null) && LHPVDetails != null) {
				changeDisplayProperty('lhpvdetailspannel', 'block');
			} else 
				return;
			
			changeDisplayProperty('multiplelhpvsetailspannel', 'none');
			
			if(expiryAllowedForLhpv) {
				if(lhpvApprovalId == 0 && lhpvExpiredWithPermission) {
					$('#SaveTd').append('<b>Please Take a Approval From Head Office For BLHPV!</b>');
					$('#SaveTd').css({'color': 'red','text-align' : 'left'});
					$('#Save').addClass('hide');
				}
				
				if((!showLHPVApproveButton || $('#Save').is(":visible")))
					$('#ApproveTd').addClass('hide');
				
				if(showLHPVApproveButton && lhpvExpiredWithPermission && lhpvApprovalId == 0)
					$('#SaveTd').addClass('hide');
			} else {
				$('#ApproveTd').addClass('hide');
				$('#ApproveTd').remove();
			}
			
			if(chargesColl && chargesColl[LORRY_HIRE] != null)
				lorryHireAmt	= chargesColl[LORRY_HIRE];
			
			truckCapacity	= lhpv.capacity;
			
			if(truckCapacity > 0)
				lhpvRate	= (lorryHireAmt / truckCapacity);
			
			$( function() {
				$('#manualBLHPVDate').val(currentDate);
				$('#manualBLHPVDate').datepicker({
					maxDate		: currentDate,
					minDate		: previousDate,
					showAnim	: "fold",
					dateFormat	: 'dd-mm-yy'
				});
			} );
			
			if(noOfDays > 0)
				$('#backdatemessage').html('<b>Only ' + noOfDays + ' days back date allow, but you cannot select date before LHPV Creation date !</b>');
			
			$( function() {
				$('#chequeDate').val(currentDate);
				$('#chequeDate').datepicker({
					maxDate		: currentDate,
					showAnim	: "fold",
					dateFormat	: 'dd-mm-yy'
				});
			} );
			
			$("#manualBLHPVNumber").bind("blur", function() {
				_this.checkManualBlhpvNumber(this);
			});
			
			$('#lsAndDdmWiseDetails thead').empty();
			$('#lsAndDdmWiseDetails tbody').empty();
			$('#lrWiseDetailsTable thead').empty();
			$('#lrWiseDetailsTable tbody').empty();
			$('#lhpvdetails tbody').empty();
			$('#blhpvChargesTbl tbody').empty();
			
			_this.setLSWiseDetails(data);
			
			hideLayer();
			
			if(configuration.showLRWiseDetails)
				_this.setLRWiseDetails(data);
			
			_this.setLHPVDetails(data);
			
			if(!allowBLHPV && data.errorMsg) {
				$('#blhpvcreationmessage').html(data.errorMsg);
				$('#blhpvEntryDetails').addClass('hide');
				return;
			}
			
			if(isSplitLHPV && (!branchWiseLhpvAmount || branchWiseLhpvAmount == null)) {
				$('#blhpvcreationmessage').html('You can not create BLHPV of Other Branch !');
				$('#blhpvEntryDetails').addClass('hide');
				return;
			}
			
			if(isSplitLHPV) {
				changeDisplayProperty('partPaymentTypeDetails', 'block');
				changeDisplayProperty('receivedAmountRow', 'block');
				$('#paymentType').val(PAYMENT_TYPE_PART_PAYMENT_ID);
				$('#paymentType').attr("disabled", true);
			}
			
			$('#blhpvcreationmessage').empty();
			$('#blhpvEntryDetails').removeClass('hide');
			
			_this.setBLHPVChrages(data);
			
			if(tdsChargeList && tdsChargeList.length > 0) {
				$('#tdsRate').find('option').remove().end();
				$('#tdsRate').append('<option value="' + 0 + '" id="' + 0 + '">-- Select --</option>');
				
				if(!jQuery.isEmptyObject(tdsChargeList)) {
					for(const element of tdsChargeList) {
						if(element != null)
							$('#tdsRate').append('<option value="' + element + '" id="' + element + '">' + element + '</option>');
					}
				}
			} else
				$('.tdsRateRow').remove();
			
			if($('#blhpvEntryDetails').exists())
				goToPosition('blhpvEntryDetails', 500);
			
			$("#closingKM").bind("blur", function() {
				_this.setBalanceAmountOnClosingKM();
			});
			
			$("#closingKM").bind("keyup", function() {
				_this.setBalanceAmountOnClosingKM();
			});
			
			$("#weighBridgeAmount").bind("keyup", function() {
				_this.validateWeighBrideAmount();
				_this.calculateOverWeight();
			});
			
			$("#isWeighBridgeInTon").bind("click", function() {
				_this.inTonCalculate();
			});
			
			$("#tdsRate").bind("change", function() {
				_this.calculateTDSAmount();
			});
			
			$("#Approve").bind("click", function() {
				_this.approveLhpv();
			});
			
			$("#uploadWeighBill").bind("click", function() {
				$('#uploadReceiptModal').modal('hide');
			});
			
			$("#uploadReceiptBtn").bind("click", function() {
				_this.uploadReceipt();
			});
			
			$('body').on('keydown', 'input, select', function(e) {
				if (e.key === "Enter") {
					let self = $(this), form = self.parents('form:eq(0)'), focusable, next;
					focusable = form.find('input,a,select,button,textarea').filter(':visible');
					next = focusable.eq(focusable.index(this));
					if (next.length) {
						next.focus();
					} else {
						form.submit();
					}
					return false;
				}
			});
			
			$("#myForm").on("submit", function (ev) {
				  ev.preventDefault();
				  // Do AJAX stuff here
			});
			
			$("#Save").bind("click", function() {
				_this.validateForManualBLHPV();
			});
			
			initialiseFocus();
			
			if(configuration.calculateAutoBlhpvCharges) _this.setBalanceAmount();
			
			if(configuration.calculateFuelTotal)
				$("#charge" + TOTAL_FUEL).attr("readonly", true);
			
			if(branchWiseLhpvAmount && branchWiseLhpvAmount != null) {
				branchWiseLhpvAmountId	= branchWiseLhpvAmount.branchWiseLhpvAmountId;
				$('#receivedAmount').val(branchWiseLhpvAmount.payableAmount);
				$('#receivedAmount').attr("readonly", true);
			}
			
			if (configuration.showOnlinePaymentAmountInOnline)
				$("#charge" + ONLINE_COLLECTION).val(data.onlineAmount).prop("readonly", true);
		},calculateFuelTotal : function() {
			let fuelByDriver	= 0;
			let fuelByOffice	= 0;
			
			if(!isNaN($("#charge" + FUEL_BY_DRIVER).val()))
				fuelByDriver	= Number($("#charge" + FUEL_BY_DRIVER).val());
				
			if(!isNaN($("#charge" + FUEL_BY_OFFICE).val()))
				fuelByOffice	= Number($("#charge" + FUEL_BY_OFFICE).val());
			
			$("#charge" + TOTAL_FUEL).val(fuelByDriver + fuelByOffice);
		},calculateAllChargeTotal : function () {
			let totalChargesAmt	= 0;
			
			let onlineColl		= 0;
			let hamali			= Number($("#charge" + LHPVChargeTypeConstant.HAMALI_DEDUCT).val());
			let toll			= 0;
			let nashta			= 0;
			let hawaladar		= 0;
			let puncher			= 0;
			let other			= Number($("#charge" + OTHER_NEGATIVE).val());
			let fuelByDriver	= 0;
			
			if(!isNaN($("#charge" + LHPVChargeTypeConstant.TOLL_TAX).val()))
				toll			= Number($("#charge" + LHPVChargeTypeConstant.TOLL_TAX).val());
				
			if(!isNaN($("#charge" + ONLINE_COLLECTION).val()))
				onlineColl		= Number($("#charge" + ONLINE_COLLECTION).val());
				
			if(!isNaN($("#charge" + LHPVChargeTypeConstant.NASHTA).val()))
				nashta			= Number($("#charge" + LHPVChargeTypeConstant.NASHTA).val());
				
			if(!isNaN($("#charge" + LHPVChargeTypeConstant.PUNCHER).val()))
				puncher			= Number($("#charge" + LHPVChargeTypeConstant.PUNCHER).val());
				
			if(!isNaN($("#charge" + LHPVChargeTypeConstant.POLICE_CHALLANS).val()))
				hawaladar		= Number($("#charge" + LHPVChargeTypeConstant.POLICE_CHALLANS).val());

			if(!isNaN($("#charge" + FUEL_BY_DRIVER).val()))
				fuelByDriver	= Number($("#charge" + FUEL_BY_DRIVER).val());
			
			totalChargesAmt		= (hamali + nashta + hawaladar + puncher + other + fuelByDriver + toll + onlineColl);	 
			
			if(!isNaN(totalChargesAmt))
				return totalChargesAmt;
			
			return 0;
		}, setMultipleLHPVDetails : function(lhpvList) {
			$('#multiplelhpvsetails thead').empty();
			$('#multiplelhpvsetails tbody').empty();
			
			let columnArray		= new Array();
			
			if(lhpvList != null) {
				columnArray.push("<td style='text-align: center; vertical-align: middle;'><b> LHPV No. </b></td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'><b> LHPV Date. </b></td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'><b> Truck No. </b></td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'><b> Created At </b></td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'><b> Total Amount </b></td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'><b> Advance Amount </b></td>");
				
				$('#multiplelhpvsetails thead').append('<tr>' + columnArray.join(' ') + '</tr>');
				
				columnArray	= [];
				
				for(const element of lhpvList) {
					let lhpv	= element;
					
					columnArray.push("<td style='text-align: center; vertical-align: middle;'><a style='cursor:pointer;' id='lhpv_" + lhpv.lhpvId + "'>"+ lhpv.lHPVNumber +"</a></td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + lhpv.lhpvCreationDateTimeString + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>"+ lhpv.vehicleNumber +"</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>"+ lhpv.lhpvBranchName + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>"+ lhpv.totalAmount +"</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>"+ lhpv.advanceAmount +"</td>");
					
					$('#multiplelhpvsetails tbody').append('<tr>' + columnArray.join(' ') + '</tr>');
					
					columnArray	= [];
					
					$("#lhpv_" + lhpv.lhpvId).bind("click", function() {
						let elementId		= $(this).attr('id');
						let lhpvId			= elementId.split('_')[1];
						_this.getLhpvDetailsToCreateBlhpv(lhpvId);
					});
				}
			}
		} , setLSWiseDetails : function(data) {
			let DispatchLedgerDetails			= data.DispatchLedgerDetails;
			let DeliveryRunsheetLedgerDetails	= data.DeliveryRunsheetLedgerDetails;
			
			let columnArray							= new Array();
			
			if(DispatchLedgerDetails != null) {
				columnArray.push("<td style='text-align: center; vertical-align: middle;'><b>LS No.<b></td>");						
				columnArray.push("<td style='text-align: center; vertical-align: middle;'><b>LS Date</b></td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'><b>From</b></td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'><b>To</b></td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'><b>Weight</b></td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'><b>Pkgs</b></td>");
				
				if(configuration.showTurNumberColumn)
					columnArray.push("<td style='text-align: center; vertical-align: middle;'><b>TUR No.</b></td>");
				
				$('#lsAndDdmWiseDetails thead').append('<tr class = "danger">' + columnArray.join(' ') + '</tr>');
				
				columnArray	= [];

				vehicleNumberMasterId	= DispatchLedgerDetails[0].vehicleNumberMasterId;
				
				for(const element of DispatchLedgerDetails) {
					columnArray.push("<td style='text-align: center; vertical-align: middle;'><b>" + element.lsNumber + "</b></td>");						
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + element.tripDateTimeForString + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + element.sourceBranch + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + element.destinationBranch + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + Math.round(element.totalActualWeight) + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + Math.round(element.totalNoOfPackages) + "</td>");
					
					if(configuration.showTurNumberColumn)
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + element.turNumber + "</td>");
					
					$('#lsAndDdmWiseDetails tbody').append('<tr id="lsAndDdmWiseDetails_' + element.dispatchLedgerId + '">' + columnArray.join(' ') + '</tr>');
					
					columnArray	= [];
				}
			} else if(DeliveryRunsheetLedgerDetails != null) {
				columnArray.push("<td style='text-align: center; vertical-align: middle;'><b>DDM No.<b></td>");						
				columnArray.push("<td style='text-align: center; vertical-align: middle;'><b>DDM Date</b></td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'><b>From</b></td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'><b>To</b></td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'><b>Weight</b></td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'><b>Pkgs</b></td>");
				
				$('#lsAndDdmWiseDetails thead').append('<tr class = "danger">' + columnArray.join(' ') + '</tr>');
				
				columnArray	= [];
				
				vehicleNumberMasterId	= DeliveryRunsheetLedgerDetails[0].deliveryRunSheetLedgerVehicleId;
				
				for(const element of DeliveryRunsheetLedgerDetails) {
					columnArray.push("<td style='text-align: center; vertical-align: middle;'><b>" + element.deliveryRunSheetLedgerDDMNumber + "</b></td>");						
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + element.creationDateTimeString + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + element.deliveryRunSheetLedgerSourceBranchName + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + element.deliveryRunSheetLedgerDestinationBranchName + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + Math.round(element.deliveryRunSheetLedgerTotalActualWeight) + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + Math.round(element.deliveryRunSheetLedgerTotalNoOfPackages) + "</td>");
					
					$('#lsAndDdmWiseDetails tbody').append('<tr id="lsAndDdmWiseDetails_' + element.dispatchLedgerId + '">' + columnArray.join(' ') + '</tr>');
					
					columnArray	= [];
				}
			}
			
			$("#lsWiseButton").bind("click", function() {
				$("#lsAndDdmWiseDetails").toggle(1000);
			});
		}, setLRWiseDetails : function(data) {
			let bLHPVModel	= data.bLHPVModel;
			
			let columnArray		= new Array();
			
			if(bLHPVModel != null) {
				$('#lrWiseButton').removeClass('hide');
				
				columnArray.push("<td style='text-align: center; vertical-align: middle;'><b>LR No.<b></td>");						
				columnArray.push("<td style='text-align: center; vertical-align: middle;'><b>C/nor</b></td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'><b>C/nee</b></td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'><b>Act Wgt</b></td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'><b>No Of Art</b></td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'><b>Booking Total</b></td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'><b>CR Total</b></td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'><b>Grand Total</b></td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'><b>LR Type</b></td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'><b>Booking Type</b></td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'><b>LS No.</b></td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'><b>TUR No.</b></td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'><b>CR No.</b></td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'><b>Creditor Inv.</b></td>");
				
				$('#lrWiseDetailsTable thead').append('<tr class = "danger">' + columnArray.join(' ') + '</tr>');
				
				columnArray	= [];
				
				// ---- Totals ----
				let totalWeight = 0;
				let totalQuantity = 0;
				let totalBooking = 0;
				let totalDelivery = 0;
				let totalGrand = 0;
				
				for(const element of bLHPVModel) {
					let dispatchLedger	= element;
					
					columnArray.push("<td style='text-align: center; vertical-align: middle;'><b><a style='cursor:pointer;' id='wayBillId_" + dispatchLedger.wayBillId + "'>" + dispatchLedger.wayBillNo + "</a></b></td>");						
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + dispatchLedger.consignorName + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + dispatchLedger.consigneeName + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + Math.round(dispatchLedger.actualWeight) + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + dispatchLedger.quantity + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + Math.round(dispatchLedger.bookingTotal) + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + Math.round(dispatchLedger.deliveryTotal) + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + Math.round(dispatchLedger.grandTotal) + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + dispatchLedger.wayBillType + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + dispatchLedger.bookingType + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + (dispatchLedger.lsNumber != undefined ? dispatchLedger.lsNumber : "--") + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle; color: red'>" + (dispatchLedger.turNumber != undefined ? dispatchLedger.turNumber : "--") + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle; color: red'>" + (dispatchLedger.wayBillDeliveryNo != undefined ? dispatchLedger.wayBillDeliveryNo : "--") + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle; color: red'>" + (dispatchLedger.billNumber != undefined ? dispatchLedger.billNumber : "--") + "</td>");
					
					$('#lrWiseDetailsTable tbody').append('<tr id="lrWiseDetailsTable_' + dispatchLedger.dispatchLedgerId + '">' + columnArray.join(' ') + '</tr>');
					
					$("#wayBillId_" + dispatchLedger.wayBillId).bind("click", function() {
						let elementId				= $(this).attr('id');
						let wayBillId				= elementId.split('_')[1];
						let LR_SEARCH_TYPE_ID		= 1;
						
						if(wayBillId != undefined)
							window.open('SearchWayBillAction.do?pageId=5&eventId=3&wayBillId=' + wayBillId + '&NumberType=' + LR_SEARCH_TYPE_ID + '&BranchId=0');
					});
					
					// --- accumulate totals ---
					totalWeight		+= Math.round(dispatchLedger.actualWeight);
					totalQuantity	+= dispatchLedger.quantity;
					totalBooking	+= Math.round(dispatchLedger.bookingTotal);
					totalDelivery	+= Math.round(dispatchLedger.deliveryTotal);
					totalGrand		+= Math.round(dispatchLedger.grandTotal);
					
					columnArray	= [];
				}
				
				// ---- Append totals row ----
				let totalRow = [];
				totalRow.push("<td colspan='3' style='text-align:right; font-weight:bold;'>Total:</td>");
				totalRow.push("<td style='text-align:center; font-weight:bold;'>" + totalWeight + "</td>");
				totalRow.push("<td style='text-align:center; font-weight:bold;'>" + totalQuantity + "</td>");
				totalRow.push("<td style='text-align:center; font-weight:bold;'>" + totalBooking + "</td>");
				totalRow.push("<td style='text-align:center; font-weight:bold;'>" + totalDelivery + "</td>");
				totalRow.push("<td style='text-align:center; font-weight:bold;'>" + totalGrand + "</td>");
				// empty cols for remaining headers
				totalRow.push("<td colspan='6'></td>");
						
				$('#lrWiseDetailsTable tbody').append('<tr class="info">' + totalRow.join(' ') + '</tr>');
			} else
				$('#lrWiseDetailsTable').removeClass('hide');
			
			$("#lrWiseButton").bind("click", function() {
				$("#lrWiseDetailsTable").toggle(1000);
			});
		}, setLHPVDetails : function(data) {
			let lhpv			= data.LHPVDetails;
			let chargesColl		= data.chargesColl;
			
			let columnArray		= new Array();
			
			if(lhpv != null) {
				lhpvIdToCreateBLHPV		= lhpv.lhpvId;
				columnArray.push("<td style='text-align: center; vertical-align: middle;' colspan = '2' class = 'danger'><b>LHPV Details</b></td>");						
				
				$('#lhpvdetails tbody').append('<tr>' + columnArray.join(' ') + '</tr>');
				columnArray	= [];
				
				columnArray.push("<td style='text-align: center; vertical-align: middle;'><b> LHPV No. </b></td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'>"+ lhpv.lHPVNumber +"</td>");
				
				$('#lhpvdetails tbody').append('<tr>' + columnArray.join(' ') + '</tr>');
				columnArray	= [];
				
				columnArray.push("<td style='text-align: center; vertical-align: middle;'><b> Truck No. </b></td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'>"+ lhpv.vehicleNumber +"</td>");
				
				$('#lhpvdetails tbody').append('<tr>' + columnArray.join(' ') + '</tr>');
				columnArray	= [];
				
				columnArray.push("<td style='text-align: center; vertical-align: middle;'><b> Capacity </b></td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'>"+ lhpv.capacity / 1000 +" (M T)</td>");
				
				$('#lhpvdetails tbody').append('<tr>' + columnArray.join(' ') + '</tr>');
				columnArray	= [];
				
				openingKM	= lhpv.openingKM;
				
				if(openingKM > 0) {
					columnArray.push("<td style='text-align: center; vertical-align: middle;'><b> Opening KM </b></td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>"+ openingKM + "</td>");
					$('#lhpvdetails tbody').append('<tr>' + columnArray.join(' ') + '</tr>');
					columnArray	= [];
				}
				
				columnArray.push("<td style='text-align: center; vertical-align: middle;'><b> Remark </b></td>");
				columnArray.push("<td style='text-align: center; width:200px; vertical-align: middle;'><b style = 'word-wrap: break-word;word-break: break-all;white-space: normal;'>"+ lhpv.remark +"</b></td>");
				
				$('#lhpvdetails tbody').append('<tr id = "lhpvRemark" style="display: none;">' + columnArray.join(' ') + '</tr>');
				
				if(lhpvChargesHshmp) {
					ratePerKM	= 0;
					
					for(let str in lhpvChargesHshmp) {
						let lhpvCharges				= lhpvChargesHshmp[str];
						let lhpvChargeTypeMasterId	= lhpvCharges.lhpvChargeTypeMasterId;
					
						if(lhpvCharges.identifier == LHPVChargeTypeConstant.IDENTIFIER_TYPE_LHPV) {
							if(chargesColl && chargesColl[lhpvChargeTypeMasterId] != null) {
								if(lhpvChargeTypeMasterId == LHPVChargeTypeConstant.RATE_PER_KM)
									ratePerKM		= chargesColl[LHPVChargeTypeConstant.RATE_PER_KM];
								
								let symbol	= '';
								
								if(lhpvCharges.operationType == LHPVChargeTypeConstant.OPERATION_TYPE_SUBTRACT)
									symbol	= '-';
								else if(lhpvCharges.operationType == LHPVChargeTypeConstant.OPERATION_TYPE_ADD)
									symbol	= '+';
								
								columnArray	= [];
								
								columnArray.push("<td style='text-align: center; vertical-align: middle;'><b>" + lhpvCharges.displayName + "<span style='float: right; font-weight: bold; font-size: medium;'>" + symbol + "</span></b></td>");
								columnArray.push("<td style='text-align: center; vertical-align: middle;' id = 'charge_" + chargesColl[lhpvChargeTypeMasterId] +"'>" + chargesColl[lhpvChargeTypeMasterId] + "</td>");
								
								$('#lhpvdetails tbody').append('<tr>' + columnArray.join(' ') + '</tr>');
							}
						}
					}
				}
				
				columnArray	= [];
			}
			
			if (configuration.isRemarkShow)
				changeDisplayProperty('lhpvRemark', 'table-row');
		}, setBLHPVChrages : function(data) {
			let chargesColl			= data.chargesColl;
			lhpvChargeGrpArr		= data.lhvChrgesGrpArr;
			let lhpvCommisionHM		= data.lhpvCommisionHM;
			let lhpv				= data.LHPVDetails;
			
			let columnArray		= new Array();
			
			columnArray.push("<td style='text-align: center; vertical-align: middle;'><b> Lorry Hire </b></td>");
			columnArray.push("<td style='text-align: center; vertical-align: middle;'><input type='text' name='lorryHire' class = 'form-control' id='lorryHire' data-tooltip='Lorry Hire' value='"+ lorryHireAmt +"' readonly='readonly' style='text-align: right; width: 100px;' maxlength='7' onkeypress='return noNumbers(event);' /></td>");
			
			$('#blhpvChargesTbl tbody').append('<tr id="lorryHireCol" style="display: none;">' + columnArray.join(' ') + '</tr>');
			columnArray	= [];
			
			let symbol	= '';
			
			if(!configuration.isRefundAmountShow)
				symbol	= '<b style="font-size: large; float: right;">-</b>';
			
			let advanceAmount	= 0;
			
			if(chargesColl && chargesColl[LHPVChargeTypeConstant.ADVANCE_AMOUNT] != null)
				advanceAmount	= Math.round(chargesColl[LHPVChargeTypeConstant.ADVANCE_AMOUNT]);
			
			columnArray.push("<td style='text-align: center; vertical-align: middle;'><b>Advance Paid </b>" + symbol + "</td>");
			columnArray.push("<td style='text-align: center; vertical-align: middle;'><input type='text' name='advancePaid' class = 'form-control' id='advancePaid' data-tooltip='Advance Paid' value='" + advanceAmount +"' readonly='readonly' style='text-align: right; width: 100px;' maxlength=7' onkeypress='return noNumbers(event);' </td>");
			
			$('#blhpvChargesTbl tbody').append('<tr>' + columnArray.join(' ') + '</tr>');
			columnArray	= [];
			
			advanceAmount	= 0;
			
			if(chargesColl && chargesColl[LHPVChargeTypeConstant.CO_LH] != null)
				advanceAmount	= Math.round(chargesColl[LHPVChargeTypeConstant.CO_LH]);
			
			columnArray.push("<td style='text-align: center; vertical-align: middle;'><b>Co.LH</b></td>");
			columnArray.push("<td style='text-align: center; vertical-align: middle;'><input type='text' name='coLH' class = 'form-control' id='coLH' data-tooltip='Co LH' value='" + advanceAmount +"' readonly='readonly' style='text-align: right; width: 100px;' maxlength=7' onkeypress='return noNumbers(event);' </td>");
			
			$('#blhpvChargesTbl tbody').append('<tr id="coLHRow" style="display: none;">' + columnArray.join(' ') + '</tr>');
			columnArray	= [];
			
			if(lhpvChargeGrpArr) {
				for(const element of lhpvChargeGrpArr) {
					if(element.identifier == LHPVChargeTypeConstant.IDENTIFIER_TYPE_BLHPV
							&& element.lhpvChargeTypeMasterId != LHPVChargeTypeConstant.ACTUAL_BALANCE
							&& element.lhpvChargeTypeMasterId != LHPVChargeTypeConstant.ACTUAL_REFUND) {
						var balanceAmount = 0.00;
						var refundAmount = 0.00;
						
						if(chargesColl && chargesColl[LHPVChargeTypeConstant.BALANCE_AMOUNT] != null)
							balanceAmount	= Math.round(chargesColl[LHPVChargeTypeConstant.BALANCE_AMOUNT]);
						
						if(chargesColl && chargesColl[LHPVChargeTypeConstant.REFUND_AMOUNT] != null)
							refundAmount	= Math.round(chargesColl[LHPVChargeTypeConstant.REFUND_AMOUNT]);
						
						columnArray	= [];
						
						symbol	= '';
						
						if(element.operationType == LHPVChargeTypeConstant.OPERATION_TYPE_SUBTRACT)
							symbol	= "<b style='font-size: large; float: right;'> - </b>";
						else if(element.operationType == LHPVChargeTypeConstant.OPERATION_TYPE_ADD)
							symbol	= "<b style='font-size: large; float: right;'> + </b>";
						
						let amount	= 0;
						
						if(lhpvCommisionHM && lhpvCommisionHM[element.lhpvChargeTypeMasterId])
							amount	= Math.round(lhpvCommisionHM[element.lhpvChargeTypeMasterId]);
						
						columnArray.push("<td style='text-align: center; vertical-align: middle;'><b>" + element.displayName + " </b>" + symbol + "</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;'><input type='text' name='charge"+ element.lhpvChargeTypeMasterId +"' class = 'form-control' id='charge"+ element.lhpvChargeTypeMasterId +"' data-tooltip='"+element.displayName+"' value='" + amount +"' style='text-align: right; width: 100px;' maxlength=7' onkeypress='return noNumbers(event);'/> </td>");
						
						$('#blhpvChargesTbl tbody').append('<tr>' + columnArray.join(' ') + '</tr>');
						columnArray	= [];
						
						$('#charge' + element.lhpvChargeTypeMasterId).keyup(function() {
							_this.calculateBalanceAmount(balanceAmount, refundAmount);
						});
						
						$('#charge' + element.lhpvChargeTypeMasterId).blur(function() {
							fillclearText(this, 0);
							_this.calculateBalanceAmount(balanceAmount, refundAmount);
						});
						
						$('#charge' + element.lhpvChargeTypeMasterId).focus(function() {
							resetTextFeild(this, 0);
						});
					}
				}
			}
			
			let balanceAmt = 0.0;
			
			if(!configuration.isRefundAmountShow) {
				if (chargesColl && chargesColl[LHPVChargeTypeConstant.BALANCE_AMOUT] != null && chargesColl[LHPVChargeTypeConstant.CO_LH] != null)
					balanceAmt = chargesColl[LHPVChargeTypeConstant.BALANCE_AMOUNT] - Math.round(chargesColl[LHPVChargeTypeConstant.CO_LH]);
				else if(chargesColl && chargesColl[LHPVChargeTypeConstant.BALANCE_AMOUNT] != null)
					balanceAmt = chargesColl[LHPVChargeTypeConstant.BALANCE_AMOUNT];
			} else if (chargesColl && chargesColl[LHPVChargeTypeConstant.BALANCE_AMOUNT] != null)
				balanceAmt = chargesColl[LHPVChargeTypeConstant.BALANCE_AMOUNT];
			
			columnArray.push("<td style='text-align: center; vertical-align: middle;'><b>Balance</b></td>");
			columnArray.push("<td style='text-align: center; vertical-align: middle;'><input type='text' name='charge" + LHPVChargeTypeConstant.ACTUAL_BALANCE +"' class = 'form-control' id='charge" + LHPVChargeTypeConstant.ACTUAL_BALANCE +"' data-tooltip='Balance' value='" + Math.round(balanceAmt) +"' readonly='readonly' style='text-align: right; width: 100px;' maxlength=7' onkeypress='return noNumbers(event);' </td>");
			
			$('#blhpvChargesTbl tbody').append('<tr>' + columnArray.join(' ') + '</tr>');
			columnArray	= [];
			
			let refundAmt	= 0;
			
			if (chargesColl && chargesColl[LHPVChargeTypeConstant.REFUND_AMOUNT] != null)
				refundAmt = chargesColl[LHPVChargeTypeConstant.REFUND_AMOUNT];
			
			columnArray.push("<td style='text-align: center; vertical-align: middle;'><b>Refund</b></td>");
			
			if(configuration.getHamaliAmountFromBooking && hamaliCharge > 0){
				if(refundAmt - hamaliCharge > 0)
					columnArray.push("<td style='text-align: center; vertical-align: middle;'><input type='text' name='charge" + LHPVChargeTypeConstant.ACTUAL_REFUND +"' class = 'form-control' id='charge" + LHPVChargeTypeConstant.ACTUAL_REFUND +"' data-tooltip='Refund' value='" + Math.round(refundAmt - hamaliCharge) +"' readonly='readonly' style='text-align: right; width: 100px;' maxlength=7' onkeypress='return noNumbers(event);' </td>");
				else {
					columnArray.push("<td style='text-align: center; vertical-align: middle;'><input type='text' name='charge" + LHPVChargeTypeConstant.ACTUAL_REFUND +"' class = 'form-control' id='charge" + LHPVChargeTypeConstant.ACTUAL_REFUND +"' data-tooltip='Refund' value='" + 0 +"' readonly='readonly' style='text-align: right; width: 100px;' maxlength=7' onkeypress='return noNumbers(event);' </td>");;
					$("#charge" + LHPVChargeTypeConstant.ACTUAL_BALANCE).val(Math.round(Math.abs(refundAmt - hamaliCharge)));
				}
			} else
				columnArray.push("<td style='text-align: center; vertical-align: middle;'><input type='text' name='charge" + LHPVChargeTypeConstant.ACTUAL_REFUND +"' class = 'form-control' id='charge" + LHPVChargeTypeConstant.ACTUAL_REFUND +"' data-tooltip='Refund' value='" + Math.round(refundAmt) +"' readonly='readonly' style='text-align: right; width: 100px;' maxlength=7' onkeypress='return noNumbers(event);' </td>");
			
			$('#blhpvChargesTbl tbody').append('<tr id= "charge_' + LHPVChargeTypeConstant.ACTUAL_REFUND + '" style="display: none;">' + columnArray.join(' ') + '</tr>');
			columnArray	= [];
			
			$('#charge ' + LHPVChargeTypeConstant.BALANCE_AMOUNT).keyup(function() {
				_this.checkBalanceAmount(this);
			});
			
			if (configuration.isLorryHireTotalShow || (configuration.showClosingKMField && lhpv.lorryHireMode == LHPVConstant.LORRY_HIRE_MODE_KM_WISE))
				changeDisplayProperty('lorryHireCol', 'table-row');
			
			if (configuration.isRefundAmountShow)
				changeDisplayProperty('charge_' + LHPVChargeTypeConstant.ACTUAL_REFUND, 'table-row');

			if (configuration.isCompanyLorryHireShow)
				changeDisplayProperty('coLHRow', 'table-row');
			
			if(configuration.getHamaliAmountFromBooking){
				if(hamaliCharge > 0){
					$("#charge" + LHPVChargeTypeConstant.HAMALI_DEDUCT).val(hamaliCharge);
					$("#charge" + LHPVChargeTypeConstant.HAMALI_DEDUCT).attr("readonly", true);
				} else
					$("#charge" + LHPVChargeTypeConstant.HAMALI_DEDUCT).attr("readonly", false);
			} 
			
			if(configuration.showClosingKMField && lhpv.lorryHireMode == LHPVConstant.LORRY_HIRE_MODE_KM_WISE)
				$('#closingKMDiv').removeClass('hide');
				
		}, resetAllData : function() {
			$('#closingKMDiv').addClass('hide');
			$('#photo').val('');
			changeDisplayProperty('lhpvdetailspannel', 'none');
			lhpvRate = 0;
			$('#remark').val('');
			$('#closingKM').val(0);
			$('#paymentMadeTo').val('');
			$('#bankName').val('');
			$('#chequeAmount').val(0);
			$('#receivedAmount').val(0);
			$('#commissionAmount').val(0);
			$('#chequeNo').val('');
			$('#manualBLHPVNumber').val('');
			$('#weighBridgeAmount').val(0);
			$('#tdsAmount').val(0);
			$('#panNumber').val('');
			$('#tanNumber').val('');
			$('#paymentType').val(0);
			$('#partPaymentType').val(0);
			$(".chequeDetails").addClass('hide');
			changeDisplayProperty('partPaymentTypeDetails', 'none');
			changeDisplayProperty('receivedAmountRow', 'none');
			branchWiseLhpvAmountId = 0;
			$('#receivedAmount').attr("readonly", false);
		}, chargesAmountCal : function() {
			let chargesAmount = 0;
			
			if(lhpvChargeGrpArr) {
				for(const lhpvCharges of lhpvChargeGrpArr) {
					if(lhpvCharges.identifier == LHPVChargeTypeConstant.IDENTIFIER_TYPE_BLHPV
							&& lhpvCharges.lhpvChargeTypeMasterId != LHPVChargeTypeConstant.ACTUAL_BALANCE
							&& lhpvCharges.lhpvChargeTypeMasterId != LHPVChargeTypeConstant.ACTUAL_REFUND) {
						if(lhpvCharges.operationType == LHPVChargeTypeConstant.OPERATION_TYPE_ADD) {
							if(!isNaN($('#charge' + lhpvCharges.lhpvChargeTypeMasterId).val()))
								chargesAmount	 += Number($('#charge' + lhpvCharges.lhpvChargeTypeMasterId).val());
						} else if(lhpvCharges.operationType == LHPVChargeTypeConstant.OPERATION_TYPE_SUBTRACT &&
								!isNaN($('#charge' + lhpvCharges.lhpvChargeTypeMasterId).val())) {
								chargesAmount	 -= Number($('#charge' + lhpvCharges.lhpvChargeTypeMasterId).val());
						}
					}
				}
			}
			
			if(!isNaN(chargesAmount))
				return chargesAmount;

			return 0;
		}, calculateBalanceAmount : function(balanceAmount, refundAmount) {
			if(configuration.calculateFuelTotal)
				_this.calculateFuelTotal();
			
			if(configuration.calculateAllChargeTotal) {
				let totalCharges = _this.calculateAllChargeTotal();
				let advanceAmt	 = Number($('#advancePaid').val());
				
				if(advanceAmt < totalCharges) {
					$("#charge" + ACTUAL_BALANCE).val(totalCharges - advanceAmt);
					$("#charge" + ACTUAL_REFUND).val(0);
				} else {
					$("#charge" + ACTUAL_BALANCE).val(0);
					$("#charge" + ACTUAL_REFUND).val(advanceAmt - totalCharges );
				}
			} else {
				let finalAmount	= _this.chargesAmountCal();
				
				if(!configuration.isRefundAmountShow && document.getElementById('coLH') != null)
					finalAmount = finalAmount - Number($('#coLH').val());
				
				if(refundAmount > 0)
					finalAmount = finalAmount - parseInt(refundAmount,10);
				else
					finalAmount = finalAmount + parseInt(balanceAmount,10);
				
				finalAmt = finalAmount;
				
				if(finalAmount >= 0) {
					$("#charge" + ACTUAL_BALANCE).val(Math.abs(finalAmount));
					
					if(configuration.isRefundAmountShow)
						$("#charge" + ACTUAL_REFUND).val(0);
				} else {
					$("#charge" + ACTUAL_BALANCE).val(0);
					$("#charge" + ACTUAL_REFUND).val(Math.abs(finalAmount));
				}
				
				if(configuration.showClosingKMField && Number($('#closingKM').val()) > 0)
					_this.setBalanceAmountOnClosingKM();
			}
		}, goToManualSelection : function() {
			if(isCheckBoxChecked('isManualBLHPV')) {
				changeDisplayProperty('manualBLHPVNumberCol', 'table-cell');
				
				if(configuration.showManualDateForBLHPVReceive)
					changeDisplayProperty('manualBLHPVDateRow', 'table-cell');
				
				document.getElementById("manualBLHPVNumber").focus();
			} else {
				changeDisplayProperty('manualBLHPVNumberCol', 'none');
				changeDisplayProperty('manualBLHPVDateRow', 'none');
				changeDisplayProperty('msgbox', 'none');
				$('#manualBLHPVNumber').val('');
			}
			
			if(allowManualDateForBLHPVReceive)
				changeDisplayProperty('manualBLHPVDateRow', 'table-cell');
		}, checkManualBlhpvNumber : function(obj) {
			let reg = /\s/g; //Match any white space including space, tab, form-feed, etc. 
			let str = obj.value.replace(reg, '');

			if(obj.value && str.length > 0) {
				let maxRange = 0;
				let minRange = 0;

				if(blhpvSequenceCounter && !configuration.isAllowManualBLHPVWithoutSeqCounter) {
					maxRange = blhpvSequenceCounter.maxRange;
					minRange = blhpvSequenceCounter.minRange;
				}
				
				if((parseInt(obj.value) >= minRange && parseInt(obj.value) <= maxRange) || configuration.isAllowManualBLHPVWithoutSeqCounter) {
					if(!configuration.isAllowManualBLHPVWithoutSeqCounter) {
						if(parseInt(obj.value) < minRange || parseInt(obj.value) > maxRange) {
							showMessage('info', manualBLHPVWithinRangeInfoMsg);
							$('#manualBLHPVNumber').val('');
							changeTextFieldColorWithoutFocus('manualBLHPVNumber', '', '', 'red');
							return false;
						}
					}
					
					let jsonObject		= new Object();
					showLayer();
					
					jsonObject.blhpvNumber	= obj.value;

					$.ajax({
						type		:	"POST",
						url			:	WEB_SERVICE_URL + '/blhpvWS/checkDuplicateManualBLHPVNo.do',
						data		:	jsonObject,
						dataType	:	'json',
						success		:	function(data) {
							if(data.message) {
								$('#manualBLHPVNumber').val('');
								$('#manualBLHPVNumber').focus();
							}
							
							$("#msgbox").html('');
							
							hideLayer();
						}
					});
				} else {
					$("#msgbox").fadeTo(200, 0.1, function() { 
						$(this).html('BLHPV Number not in Range !').addClass('messageboxerror').fadeTo(900,1);
						$('#manualBLHPVNumber').val('');
						$('#manualBLHPVNumber').focus();
					});
				};
			}else {
				$("#msgbox").html('').removeClass();
			};
		}, uploadReceipt : function() {
			if(!validateInputTextFeild(1, 'photo', 'photo', 'error', 'Select Photo !')) {
				return;
			}
			
			let $inputs = $('#weighBillImageRow :input');
			//this will iterate all elements and will set the name as key and value of Element as value in jsonObject
			$inputs.each(function (index) {
				if($(this).val() != "") {
					if (this.files && this.files[0]) {
						let FR	= new FileReader();

						FR.addEventListener("load", function(e) {
							weighBridgeReceiptImage = e.target.result;
						}); 

						FR.readAsDataURL(this.files[0]);
					}
				}
			});
		}, validateWeighBrideAmount : function() {
			return !(configuration.isWeighBridgeAmountFieldMandatory
				&& !validateInputTextFeild(1, 'weighBridgeAmount', 'weighBridgeAmount', 'error', 'Please Enter Valid Kanta Weight !'));
		}, calculateOverWeight : function() {
			let overWeight			= 0.00;
			let overWeightToFixed	= 0.00;
			let weighBridgeAmount	= 0.00;
			let weighBridgeDiff		= 0.00;
			
			if(!validateWeighBrideAmount())
				return false;
			
			if($('#isWeighBridgeInTon').prop('checked'))
				$('#weighBridge').val(Number($('#weighBridgeAmount').val()) * 1000);
			else
				$('#weighBridge').val($('#weighBridgeAmount').val());
			
			weighBridgeAmount	= $('#weighBridgeAmount').val();
			
			if(truckCapacityInTon > 0 && weighBridgeAmount > 0 && truckCapacityInTon < weighBridgeAmount)
				weighBridgeDiff		= Number(weighBridgeAmount) - Number(truckCapacityInTon);
			
			if($('#isWeighBridgeInTon').prop('checked'))
				weighBridgeDiff		= weighBridgeDiff * 1000;
			
			if(weighBridgeDiff > 0) {
				overWeight			= Number(lhpvRate) * Number(weighBridgeDiff);
				overWeightToFixed	= overWeight.toFixed(2);
			}
			
			$('#charge' + LHPVChargeTypeConstant.OVER_WEIGHT).val(overWeightToFixed);
		}, inTonCalculate : function() {
			if($('#isWeighBridgeInTon').prop('checked')) {
				$('#weighBridgeAmount').val(Number($('#weighBridgeAmount').val()) / 1000);
				truckCapacityInTon	= truckCapacity / 1000;
			} else {
				$('#weighBridgeAmount').val(Number($('#weighBridgeAmount').val()) * 1000);
				truckCapacityInTon	= truckCapacity;
			}
			_this.calculateOverWeight();
		}, checkBalanceAmount : function(obj) {
			let enteredBalAmt = parseInt(obj.value);

			if(enteredBalAmt < 0)
				alert("You can not enter Balance Amount less then 0 !");
		}, validatePartialPaymentAmount : function() {
			let paymentType			= Number($('#paymentType').val());

			if(paymentType == PAYMENT_TYPE_PART_PAYMENT_ID) {
				let grandTotal			= Number($('#charge' + LHPVChargeTypeConstant.ACTUAL_BALANCE).val());
				let refundAmount		= Number($('#charge' + LHPVChargeTypeConstant.ACTUAL_REFUND).val());
				let receivedAmount		= Number($('#receivedAmount').val());

				if(!validateInputTextFeild(1, 'partPaymentType', 'partPaymentType', 'error', paymentTypeErrMsg))
					return false;

				if(!validateInputTextFeild(1, 'receivedAmount', 'receivedAmount', 'error', receivedAmountErrMsg))
					return false;
				
				let amountToBeReceived	= 0
				
				if(grandTotal > 0)
					amountToBeReceived	= grandTotal;
				else if(refundAmount > 0)
					amountToBeReceived	= refundAmount;

				if(receivedAmount >= amountToBeReceived) {
					showMessage('warning', otherPaymentTypeOnReceivedAmountWarningMsg(amountToBeReceived)); //message comming from VariableForErrorMsg.js file
					
					$('#paymentType').val(0);
					$('#partPaymentType').val(0);
					$('#receivedAmount').val(0);
					changeTextFieldColor('paymentType', '', '', 'red');
					return false;
				} else {
					hideAllMessages();
					changeTextFieldColor('paymentType', '', '', 'green');
				}
			}

			return true;
		}, validateForPaymentTypeCheque : function() {
			if(!validatePaymentType(1, 'paymentType')) //function calling from CommonFunctionForInputFieldValidation.js file
				return false;
			
			if(bankPaymentOperationRequired) {
				if(Number($('#paymentType').val()) != PAYMENT_TYPE_CASH_ID && Number($('#paymentType').val()) != PAYMENT_TYPE_CREDIT_ID) {
					if(Number($('#paymentType').val()) == PAYMENT_TYPE_PART_PAYMENT_ID) {
						if(Number($('#partPaymentType').val()) != PAYMENT_TYPE_CASH_ID
							&& !_this.validateChequeDetails())
								return false;
					} else if(!_this.validateChequeDetails())
						return false;
				}
			} else if(Number($('#paymentType').val()) == PAYMENT_TYPE_CHEQUE_ID 
					|| Number($('#paymentType').val()) == PAYMENT_TYPE_ONLINE_NEFT_ID 
					|| Number($('#paymentType').val()) == PAYMENT_TYPE_ONLINE_RTGS_ID
					|| Number($('#paymentType').val()) == PAYMENT_TYPE_IMPS_ID) {
				if(!_this.validateChequeDetails())
					return false;
			} else if(Number($('#paymentType').val()) == PAYMENT_TYPE_PART_PAYMENT_ID) {
				if(Number($('#partPaymentType').val()) == PAYMENT_TYPE_CHEQUE_ID
					|| Number($('#partPaymentType').val()) == PAYMENT_TYPE_ONLINE_NEFT_ID 
					|| Number($('#partPaymentType').val()) == PAYMENT_TYPE_ONLINE_RTGS_ID
					|| Number($('#partPaymentType').val()) == PAYMENT_TYPE_IMPS_ID) {
					if(!_this.validateChequeDetails())
						return false;
				}
			}
			
			if(!_this.validatePaymentModeToName())
				return false;
			
			if(tdsConfiguration.IsPANNumberRequired
					|| tdsConfiguration.IsTANNumberRequired) {

				if($("#tdsAmount").val() > 0) {
					if(tdsConfiguration.IsPANNumberRequired) {
						if(!validateInputTextFeild(1, 'panNumber', 'panNumber', 'error', panNumberErrMsg)
						|| !validateInputTextFeild(8, 'panNumber', 'panNumber', 'error', validPanNumberErrMsg))
							return false;
					}

					if(tdsConfiguration.IsTANNumberRequired) {
						if(!validateInputTextFeild(1, 'tanNumber', 'tanNumber', 'error', tanNumberErrMsg)
						|| !validateInputTextFeild(13, 'tanNumber', 'tanNumber', 'error', validTanNumberErrMsg))
							return false;
					}
				}
			}

			return true;
		}, validatePaymentModeToName : function() {
			let paymentMadeTo = document.getElementById('paymentMadeTo');
			
			let nameStr = paymentMadeTo.value.replace(/\s/g, '');
			
			if(nameStr.length <= 0 || nameStr == 'PaymentMadeTo') {
				showMessage('error', paymentModeToNameErrMsg);
				toogleElement('error','block');
				changeError1('paymentMadeTo','0','0');
				return false;
			} else {
				removeError('paymentMadeTo');
				toogleElement('error','none');
			}
				
			return true;
		}, validateChequeDetails : function() {
			//function calling from CommonFunctionForInputFieldValidation.js file
			if(bankPaymentOperationRequired) {
				if($('#storedPaymentDetails').html() == '') {
					showMessage('error', 'Please, Add Payment Details !');
					return false;
				}
			} else {
				if(!validateChequeDate(1, 'chequeDate'))
					return false;

				if(!validateChequeNumber(1, 'chequeNo'))
					return false;

				if(!validateChequeAmount(1, 'chequeAmount'))
					return false;

				if(!validateBankName(1, 'bankName'))
					return false;
			}
			
			return true;
		}, validateForManualBLHPV : function() {
			if(_this.validateForPaymentTypeCheque()) {
				let isManualBLHPV = $('#isManualBLHPV').is(':checked');

				if(isManualBLHPV || (configuration.showManualDateForBLHPVReceive)) {
					let manualBLHPVNumber		= $('#manualBLHPVNumber').val();
					let manualBLHPVDate			= $('#manualBLHPVDate').val();
					let manualBLHPVNumberVal	= parseInt(manualBLHPVNumber, 10);
				
					if(isManualBLHPV && !validateInputTextFeild(1, 'manualBLHPVNumber', 'manualBLHPVNumber', 'error', manualblhpvNumerErrMsg))
						return false;
					
					if(manualBLHPVDate.length <= 0 || manualBLHPVDate == 'BLHPV Date') {
						showAlertMessage('error', manualblhpvDateErrMsg);
						toogleElement('error','block');
						changeTextFieldColorWithoutFocus('manualBLHPVDate', '', '', 'red');
						return false;
					} else if(!isValidDate(manualBLHPVDate)) {
						showAlertMessage('error', validDateErrMsg);
						toogleElement('error','block');
						changeError1('manualBLHPVDate','0','0');
						return false;
					}
					
					if(isManualBLHPV) {
						if(blhpvSequenceCounter && !configuration.isAllowManualBLHPVWithoutSeqCounter) {
							var maxRange = blhpvSequenceCounter.maxRange;
							var minRange = blhpvSequenceCounter.minRange;
						}
						
						if(manualBLHPVNumberVal >= minRange && manualBLHPVNumberVal <= maxRange || configuration.isAllowManualBLHPVWithoutSeqCounter) {
							toogleElement('error','none');
							removeError('manualBLHPVNumber');
						} else {
							showAlertMessage('info', manualBLHPVWithinRangeInfoMsg);
							toogleElement('error','block');
							changeTextFieldColorWithoutFocus('manualBLHPVNumber', '', '', 'red');
							return false;
						}
					}
				}
				
				if (configuration.allowToReceiveAmountAsPartial) {
					if(!_this.validatePartialPaymentAmount()) {return false;}
				}
				
				if(configuration.isUploadWeighBillReceiptMandatory && weighBridgeReceiptImage == null) {
					showAlertMessage('error', 'Please Upload Weigh Bridge Receipt !');
					return false;
				}
				
				if(!_this.validateWeighBrideAmount())
					return;
				
				if(configuration.showClosingKMField && ratePerKM > 0 && !_this.validateClosingKM())
					return;
				
				if(configuration.showSplitDieselWiseBlhpv) {
					let totalDieselWiseSplitAmt = 0;
					
					for(const element of dieselWiseSplitAmtList) {
						totalDieselWiseSplitAmt	 += element.dieselAmount
					}
					
					if($('#charge'+LHPVChargeTypeConstant.DIESEL).val() > 0 && (totalDieselWiseSplitAmt != $('#charge'+LHPVChargeTypeConstant.DIESEL).val())){
						$('#tableDieselElements tbody').empty();
						dieselWiseSplitAmtList = new Array();
						$("#dieselDeductPayment").attr("disabled", false);
						showAlertMessage('error', 'Please Split Diesel Amount');
						changeTextFieldColor('openSplitDiesel', '', '', 'red');
						return false;
					}
				}
				
				let advanceAmount	= configuration.advanceAmount;

				if(configuration.advanceAmountValidation && Number($("#advancePaid").val()) > advanceAmount 
						&& Number($("#paymentType").val()) == PAYMENT_TYPE_CASH_ID) {
					showAlertMessage('error', 'You Can Not Enter Above ' + advanceAmount +', Cash Allowed Last ' + advanceAmount);
					return false;
				}
				
				_this.createBLHPVFun();
			}
		}, validateClosingKM : function() {
			let closingKM		= Number($('#closingKM').val());
			
			if(!validateInputTextFeild(1, 'closingKM', 'closingKM', 'error', 'Closing KM Cannot Be Less Than Opening KM '+ Number(openingKM)))
				return false;

			if(Number(closingKM) <= Number(openingKM)) {
				showAlertMessage('error', 'Closing KM Cannot Be Less Than Opening KM '+ Number(openingKM));
				return false;
			}
			
			return true;
		}, setBalanceAmount : function() {
			let balanceAmount = 0;
			let refundAmount  = 0;

			if($('#charge' + LHPVChargeTypeConstant.ACTUAL_REFUND).val() > 0)
				refundAmount	= Number($('#charge' + LHPVChargeTypeConstant.ACTUAL_REFUND).val());

			if($('#charge' + LHPVChargeTypeConstant.ACTUAL_BALANCE).val() > 0)
				balanceAmount	= Number($('#charge' + LHPVChargeTypeConstant.ACTUAL_BALANCE).val());

			_this.calculateBalanceAmount(balanceAmount, refundAmount);
		}, setBalanceAmountOnClosingKM : function() {
			if(ratePerKM == 0)
				return false;
			
			let closingKM				= Number($('#closingKM').val());
			let lhpvAdvanceAmount		= Number($('#advancePaid').val());
			let balanceAmount			= 0;
			let refundAmount			= 0;
				totalLorryHireAmount	= 0;
				lhpvBalanceAmount		= 0;
				lhpvRefundAmount		= 0;
			let prevBalanceAmount		= 0;
			let prevRefundAmount		= 0;

			if(closingKM > 0)
				totalLorryHireAmount = Number(closingKM - openingKM) * Number(ratePerKM);

			if(lhpvAdvanceAmount > 0) {
				if(Number(totalLorryHireAmount) > Number(lhpvAdvanceAmount))
					balanceAmount	= Number(totalLorryHireAmount) - Number(lhpvAdvanceAmount);
				else
					refundAmount	= Number(lhpvAdvanceAmount) - Number(totalLorryHireAmount);
			} else {
				balanceAmount	= totalLorryHireAmount;
				refundAmount	= 0;
			}
			
			lhpvBalanceAmount		= balanceAmount;
			lhpvRefundAmount		= refundAmount;
			
			$('#lorryHire').val(totalLorryHireAmount);
			
			if(Number(totalLorryHireAmount) == Number(lhpvAdvanceAmount)) {
				$('#charge' + LHPVChargeTypeConstant.ACTUAL_BALANCE).val(balanceAmount);
				$('#charge' + LHPVChargeTypeConstant.ACTUAL_REFUND).val(refundAmount);
			}
			
			prevBalanceAmount	= Number($('#charge' + LHPVChargeTypeConstant.ACTUAL_BALANCE).val());
			prevRefundAmount	= Number($('#charge' + LHPVChargeTypeConstant.ACTUAL_REFUND).val());
			
			if(finalAmt == 0) {
				prevBalanceAmount	= 0;
				prevRefundAmount	= 0;
			}
			
			if(refundAmount > 0) {
				balanceAmount	= 0;
				
				if(refundAmount > prevBalanceAmount) {
					if(finalAmt > 0)
						refundAmount = Number(refundAmount) - Number(prevBalanceAmount); //prevBalanceAmount
					else if(finalAmt == 0)
						refundAmount = refundAmount;
					else
						refundAmount = Number(refundAmount) + Number(Math.abs(finalAmt));
				} else
					balanceAmount = Number(prevBalanceAmount) - Number(refundAmount);
			} else {
				refundAmount	= 0;
				
				if(finalAmt > 0)
					balanceAmount = Number(balanceAmount) + Number(finalAmt); //prevBalanceAmount
				else if(finalAmt == 0)
					balanceAmount = balanceAmount;
				else if(Number(Math.abs(finalAmt)) > Number(balanceAmount)) {
					refundAmount = Number(Math.abs(finalAmt)) - Number(balanceAmount);
					balanceAmount = 0;
				} else
					balanceAmount = Number(balanceAmount) - Number(Math.abs(finalAmt));
			}
			
			if(refundAmount == finalAmt)
				refundAmount = 0;
			
			if(balanceAmount == finalAmt)
				balanceAmount = 0;
			
			if(balanceAmount == 0 && refundAmount == 0) {
				if(Number($('#charge' + ACTUAL_BALANCE).val()) > 0 && Number($('#charge' + ACTUAL_BALANCE).val()) == finalAmt)
					$('#charge' + ACTUAL_BALANCE).val(0);
				
				if(Number($('#charge' + ACTUAL_REFUND).val()) > 0 && Number($('#charge' + ACTUAL_REFUND).val()) == finalAmt)
					$('#charge' + ACTUAL_REFUND).val(0);
			}
			
			if(balanceAmount > 0) {
				$('#charge' + ACTUAL_BALANCE).val(balanceAmount);
				$('#charge' + ACTUAL_REFUND).val(0);
			} else if(refundAmount > 0) {
				$('#charge' + ACTUAL_REFUND).val(refundAmount);
				$('#charge' + ACTUAL_BALANCE).val(0);
			}
		}, calculateTDSAmount : function() {
			let amount		= 0;
			let tdsamount	= 0;
			
			if($('#charge' + ACTUAL_REFUND) != null && $('#charge' + ACTUAL_REFUND) != undefined)
				amount	= $('#charge' + ACTUAL_REFUND).val();
			
			if($('#charge' + ACTUAL_BALANCE) != null && $('#charge' + ACTUAL_BALANCE) != undefined)
				amount	= $('#charge' + ACTUAL_BALANCE).val();
			
			let tdsrate		= $('#tdsRate').val();
			
			if(amount > 0 && tdsrate > 0)
				tdsamount	= (amount * tdsrate) / 100;
			
			if($('#chequeAmount').val() > 0)
				tdsamount	= $('#chequeAmount').val();
			
			$('#tdsAmount').val(tdsamount);
		}, approveLhpv : function() {
			let jsonObject		= new Object();
			showLayer();
			
			jsonObject.lhpvId			= lhpvIdToCreateBLHPV;

			$.ajax({
				type		:	"POST",
				url			:	WEB_SERVICE_URL + '/LHPVWS/approveLhpv.do',
				data		:	jsonObject,
				dataType	:	'json',
				success		:	function(data) {
					if(data.id > 0) {
						hideLayer();
						$('#Approve').addClass('hide');
						$('#SaveTd').addClass('hide');
						$('#paymentType').focus();
					}
					
					hideLayer();
				}
			});
		}, createBLHPVFun : function() {
			let jsonObject	= new Object();
			
			jsonObject.lhpvId					= lhpvIdToCreateBLHPV;
			jsonObject.lhpvNumber				= $('#lhpvNo').val();
			jsonObject.manualBLHPVDate			= $('#manualBLHPVDate').val();
			jsonObject.weighBridgeReceiptImage	= weighBridgeReceiptImage;
			jsonObject.manualBLHPVNumber		= $('#manualBLHPVNumber').val();
			jsonObject.isManualBLHPV			= $('#isManualBLHPV').is(':checked');
			jsonObject.paymentType				= $('#paymentType').val();
			jsonObject.chequeDate				= $('#chequeDate').val();
			jsonObject.paymentMadeTo			= $('#paymentMadeTo').val();
			jsonObject.chequeNumber				= $('#chequeNo').val();
			jsonObject.chequeAmount				= $('#chequeAmount').val();
			jsonObject.bankName					= $('#bankName').val();
			jsonObject.weighBridge				= $('#weighBridge').val();
			jsonObject.debitToBranchId			= $('#debitToBranchSelection').val();
			jsonObject.remark					= $('#remark').val();
			jsonObject.receivedAmount			= $('#receivedAmount').val();
			jsonObject.partPaymentType			= $('#partPaymentType').val();
			jsonObject.tdsAmount				= $('#tdsAmount').val();
			jsonObject.tdsRate					= $('#tdsRate').val();
			jsonObject.panNumber				= $('#panNumber').val();
			jsonObject.tanNumber				= $('#tanNumber').val();
			jsonObject.commissionBranchId		= $('#commissionBranch_primary_key').val();
			jsonObject.commissionAmount			= $('#commissionAmount').val();
			jsonObject.vehicleNumberMasterId	= vehicleNumberMasterId;
			jsonObject.paymentValues			= $('#paymentCheckBox').val();
			jsonObject.TOKEN_KEY				= TOKEN_KEY;
			jsonObject.TOKEN_VALUE				= TOKEN_VALUE;
			jsonObject.branchWiseLhpvAmountId	= branchWiseLhpvAmountId;
			jsonObject.isSingleBranchSplitLHPV	= isSingleBranchSplitLHPV;
			jsonObject.closingKM				= $('#closingKM').val();
			jsonObject.advancePaid				= $('#advancePaid').val();
			jsonObject.dieselWiseSplitAmtList	= JSON.stringify(dieselWiseSplitAmtList);
			
			if(!jQuery.isEmptyObject(lhpvChargesForGroup)) {
				for(const element of lhpvChargesForGroup) {
					if(element != null)
						jsonObject['charge' + element.lhpvChargeTypeMasterId]	= $('#charge' + element.lhpvChargeTypeMasterId).val();
				}
			}
			
			jsonObject["lhpvCharge" + LHPVChargeTypeConstant.LORRY_HIRE]				= totalLorryHireAmount;
			jsonObject["lhpvCharge" + LHPVChargeTypeConstant.BALANCE_AMOUNT]			= lhpvBalanceAmount;
			jsonObject["lhpvCharge" + LHPVChargeTypeConstant.REFUND_AMOUNT]				= lhpvRefundAmount;
			
			let btModalConfirm = new Backbone.BootstrapModal({
				content		:	"Do You want to create BLHPV ?",
				modalWidth	:	30,
				title		:	'BLHPV',
				okText		:	'YES',
				showFooter	:	true,
				okCloses	:	true
			});
			
			if(!doneTheStuff) {
				btModalConfirm.open();
				doneTheStuff = true;
			}

			btModalConfirm.on('ok', function() {
				if(configuration.createBlhpvWithReceiveAndDelivery)
					getJSON(jsonObject, WEB_SERVICE_URL + '/blhpvWS/createBLHPVWithReceiveAndDelivery.do?', _this.onSaveBLHPVPaymentDetails, EXECUTE_WITH_ERROR);
				else
					getJSON(jsonObject, WEB_SERVICE_URL + '/blhpvWS/createBLHPV.do?', _this.onSaveBLHPVPaymentDetails, EXECUTE_WITH_ERROR);
				
				doneTheStuff = false;
				showLayer();
			});
			
			btModalConfirm.on('cancel', function() {
				doneTheStuff = false;
				hideLayer();
			});
		}, resetTable : function(){
			$('#tableDieselElements tbody').empty();
			return false;
		}, onSaveBLHPVPaymentDetails : function(data) {
			if(data.message != undefined) {
				TOKEN_KEY	= data.TOKEN_KEY;
				TOKEN_VALUE	= data.TOKEN_VALUE;
				hideLayer();
				
				if(data.message.type != 1)//1 for success
					return;
			}
			
			blhpvId		= data.blhpvId;
			blhpvNumber	= data.blhpvNumber;
			paymentMode	= data.paymentMode;
			
			if (blhpvId != undefined) {
				let MyRouter = new Marionette.AppRouter({});
				MyRouter.navigate('&blhpvId=' + blhpvId + '&blhpvNumber=' + blhpvNumber +'&paymentMode=' + paymentMode, {trigger: true});
				
				setTimeout(function(){ 
					location.reload(); 
				}, 1000);
				
				_this.openPrintForBlhpv(blhpvId, false);
				
			}
		}, openPrintForBlhpv : function(blhpvId,isRePrint) {
			if(blhpvPrintFromNewFlow)
				window.open('BLHPVPrint.do?pageId=48&eventId=11&blhpvId='+blhpvId, 'newwindow', 'config=height=410,width=700, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
			else
				window.open('BLHPVPrint.do?pageId=48&eventId=6&blhpvId='+blhpvId+'&isRePrint='+isRePrint, 'newwindow', 'config=height=410,width=700, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
		}, openPopupForDiesel : function(){
			$(".close").click(function(){
				_this.resetTable();
				$('#dieselBalanceAmt').val(0);
				changeTextFieldColor('dieselBalanceAmt', '', '', 'black');
			});
			
			$("#openSplitDiesel").click(function() {
				if($('#charge' + LHPVChargeTypeConstant.DIESEL).val() > 0) {
					_this.openSplitDiesel();
				} else {
					showAlertMessage('error', 'Please Enter Diesel	Amount');
					changeTextFieldColor('charge' + LHPVChargeTypeConstant.DIESEL, '', '', 'red');
					return false;
				}
			});
				
			$("#liter").keypress(function() {
				_this.calculateLiterAmount();
			});
				
			$("#dieselAmounts").keypress(function() {
				_this.calculateLiterAmount();
			});
				
			$("#dieselDeductPayment").click(function() {
				_this.calculateLiterAmount();
				_this.splitDieselAmount();
			});
				
			$("#saveAllDieselpaymentData").click(function() {
				if(Number($("#dieselBalanceAmt").val()) > 0) {
					showAlertMessage('error', 'Please Split Full Diesel Amount !');
					changeTextFieldColor('dieselBalanceAmt', '', '', 'red');
					return false;
				}

				_this.onSaveDieselPaymentDetails();
			});
		},openSplitDiesel : function() {
			$("#splitDieselDataDetailPanel").modal({
				backdrop : 'static',
				keyboard : false
			});

			setTimeout(function() {
				let dieselTotalAmount	= $('#charge' + LHPVChargeTypeConstant.DIESEL).val();
				let dieselBalanceAmount	= dieselTotalAmount;

				if($('#charge' + LHPVChargeTypeConstant.DIESEL).val() > 0)
					dieselBalanceAmount	= $('#charge' + LHPVChargeTypeConstant.DIESEL).val();
					
				$('#dieselTotalAmount').val(dieselTotalAmount);
				$('#dieselBalanceAmt').val(dieselBalanceAmount);
			}, 200);

			if(configuration.showLiterAmout) {
				$("#literDiv").removeClass('hide');
				$("#literHeader").removeClass('hide');
			} else {
				$("#literDiv").addClass('hide');
				$("#literHeader").addClass('hide');
			}
			
			if(configuration.showPerLiterRateAmount) {
				$("#perLiterRateDiv").removeClass('hide');
				$("#perLiterRateHeader").removeClass('hide');
			} else {
				$("#perLiterRateDiv").addClass('hide');
				$("#perLiterRateHeader").addClass('hide');
			}
		}, splitDieselAmount : function() {
			let fuelPumpId = $('#fuelPumpEle_primary_key').val();
			
			if($("#row_" + fuelPumpId).exists()) {
				showAlertMessage('error','Please enter a new Pump');
				return false;
			}
			
			let amount	= $("#dieselAmounts").val();
			
			if(amount == '' || amount == 0) {
				showAlertMessage('error', 'Please Enter Amount');
				changeTextFieldColor('', '', '', 'red');
				return false;
			}
			
			if(fuelPumpId == '' || fuelPumpId == 0) {
				showAlertMessage('error', 'Please Enter Pump Name');
				changeTextFieldColor('', '', '', 'red');
				return false;
			}
			
			if($('#dieselBalanceAmt').val() == 0) {
				showAlertMessage('info', 'Balance Amount is Zero');
				return false;
			}
			
			if(Number($('#dieselAmounts').val()) > Number($('#dieselBalanceAmt').val())) {
				showAlertMessage('info', 'Amount can not be greater than ' + $('#dieselBalanceAmt').val());
				return false;
			}
			
			if(!configuration.showMultipleAddInDieselDetails){
				let rowCount = $('#tableDieselElements tr').length;
				
				$("#dieselDeductPayment").attr("disabled", rowCount == 2);
			}
			
			_this.createDieselAmountTable(fuelPumpId, amount);

			$("#fuelPumpEle").val('');
			$("#dieselAmounts").val('');
			$("#liter").val('');
			$("#perLiterRate").val('');
		}, createDieselAmountTable : function(fuelPumpId, amount) {
			let pumpName		= $('#fuelPumpEle').val();
			let liter			= $('#liter').val();
			let perLiterRate	= $('#perLiterRate').val();
			
			let columnArray		= new Array();
			
			columnArray.push("<td style='text-align: center;'>" + pumpName + "</td>");
			columnArray.push("<td style='text-align: center;' id = 'amount_" + fuelPumpId + "'>" + amount + "</td>");
			
			if(configuration.showLiterAmout) {
				if(liter != '' && typeof liter !== 'undefined')
					columnArray.push("<td style='text-align: center;' id = 'liter_" + fuelPumpId + "'>" + liter + "</td>");
				else
					columnArray.push("<td style='text-align: center;'>" + "--" + "</td>");
			}
			
			if(configuration.showPerLiterRateAmount) {
				if(perLiterRate != '' && typeof perLiterRate !== 'undefined')
					columnArray.push("<td style='text-align: center;' id = 'perLiterRate_" + fuelPumpId + "'>" + perLiterRate + "</td>");
				else
					columnArray.push("<td style='text-align: center;'>" + "--" + "</td>");
			}

			columnArray.push("<td><button type='button' class='btn btn-danger' data-tooltip = 'remove' id='removeRowElement_" + fuelPumpId + "'>Remove</button></td>");
			
			$('#tableDieselElements tbody').append("<tr id='row_" + fuelPumpId + "'>" + columnArray.join(' ') + "</tr>");
			
			$('#dieselBalanceAmt').val(Number($('#dieselBalanceAmt').val()) - Number(amount));

			$("#removeRowElement_" + fuelPumpId).bind("click", function() {
				let elementId		= $(this).attr('id');
				let fuelPumpId		= elementId.split('_')[1];
					
				if(!configuration.showMultipleAddInDieselDetails){
					let rowCount = $('#tableDieselElements tr').length;
						
					$("#dieselDeductPayment").attr("disabled", rowCount == 2);
				}
					
				_this.deletePumpWiseRow(fuelPumpId);
			});
		}, deletePumpWiseRow : function(fuelPumpId) {
			if(confirm("Are you sure to delete?")) {
				$('#dieselBalanceAmt').val(Number($("#dieselBalanceAmt").val()) + Number($("#amount_" + fuelPumpId).html()));
				$("#row_" + fuelPumpId).remove();
			}

			if($('#tableDieselElements tbody tr').length <= 0 && lhpvChargesForGroup) {
				for(const element of lhpvChargesForGroup) {
					if(element != LHPVChargeTypeConstant.ACTUAL_BALANCE)
						$('#charge' + element).attr('readonly', false);
				}
			}
		}, onSaveDieselPaymentDetails : function() {
			if(lhpvChargesForGroup) {
				for(const element of lhpvChargesForGroup) {
					if(element == LHPVChargeTypeConstant.DIESEL)
						$('#charge' + element).attr('readonly', false);
				}
			}
			
			$("#tableDieselElements tbody tr").each(function () {
				let elementId		= $(this).attr('id');
				let fuelPumpId		= elementId.split('_')[1];
				
				let splitDiesel				= new Object();

				splitDiesel.fuelPumpId		= Number(fuelPumpId);
				splitDiesel.dieselAmount	= Number($("#amount_" + fuelPumpId).html());
				splitDiesel.liter			= Number($("#liter_" + fuelPumpId).html());
				splitDiesel.perLiterRate	= Number($("#perLiterRate_" + fuelPumpId).html());
				dieselWiseSplitAmtList.push(splitDiesel);
			})
			
			$("#splitDieselDataDetailPanel").modal('hide');
		}, calculateLiterAmount : function(){
			setTimeout(() => {
				let liter		  = Number($('#liter').val());
				let dieselAmounts = Number($('#dieselAmounts').val());
				
				if(liter != '' && liter != 0 && dieselAmounts != '' && dieselAmounts != '')
					$("#perLiterRate").val((dieselAmounts / liter).toFixed(2));
				else
					$("#perLiterRate").val('');
			}, 100);
		}
	});
});