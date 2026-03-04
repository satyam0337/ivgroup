/**
 *  define(['moduleURL1', 'moduleURL2'], function (module1Obj, module2Obj) {
        	module1 should consist of moduleURL1 URL and module1Obj is the Object corresponding to moduleURL1
            modules module1Obj and module2Obj are now available for use.
        });
    });
 */
define([
		'JsonUtility'
		,'messageUtility'
		,'/ivcargo/resources/js/generic/urlparameter.js'
		,'jquerylingua'
		,'language'
		,'autocompleteWrapper',//
        //constant for project name and domain urls
        //text! is used to convert the html to plain text which helps to fetch HTML through require
        //Master Template is used to get standard Layout of master pages
        ,'focusnavigation'//import in require.config
        ,PROJECT_IVUIRESOURCES+'/resources/js/module/view/lhpv/splitlhpv.js?v=1.0'
        ], function(JsonUtility, MessageUtility, UrlParameter, FilePath, Lingua, Language, JqueryComboBox, ElementFocusNavigation, SplitLhpv){

	'use strict';// this basically give strictness to this specific js 
	var myNod, blhpvId = 0, lhpvId = 0, permissionTypeId = 0, isShowCharges = false, jsonObject	= new Object(), filter = 0, _this = '', 
	amount = 0, lhpvConfiguration = null, LHPVChargeTypeConstant	= null,
	lhpvChargesHshmp = null, chargesColl = null, LHPVConstant	= null, advanceSettlementStatus	= 0, ratePerKM = 0,
	additionalAdvanceSettlementStatus	= 0, totalSplitAmount = 0, balPayableAmount = 0,
	isSplitLHPV	= false, splitLhpvArrList	= null, lhpvChargeIds = null, TOKEN_KEY = null, TOKEN_VALUE = null,	lockAdditionalAdvance = false,tdsConfiguration	= null,
	prevRefundAmount = 0, prevBalanceAmount = 0, prevAdvanceAmount = 0, prevAdditionalAdvanceAmount = 0,dieselWiseSplitAmtList = [],splitDieselArrList = null,totalDieselAmount = 0,balDieselAmount = 0,prevDieselAmount = 0, lhpv,
	redirectTo = 0;

	// to know about layout refer url:http://marionettejs.com/docs/v1.8.7/marionette.layout.html
	return Marionette.LayoutView.extend({
		initialize: function(masterObj){
			//initialize is the first function called on call new view()
			_this = this;
			lhpvId				= UrlParameter.getModuleNameFromParam('masterid');
			permissionTypeId	= UrlParameter.getModuleNameFromParam('permissionTypeId');
			isShowCharges		= UrlParameter.getModuleNameFromParam('isShowCharges');
			redirectTo			= UrlParameter.getModuleNameFromParam('redirectTo');
		}, render: function() {
			jsonObject.lhpvId			= lhpvId;
			jsonObject.permissionTypeId	= permissionTypeId;
			jsonObject.isShowCharges	= isShowCharges;
			
			getJSON(jsonObject, WEB_SERVICE_URL+'/LHPVWS/getDatatoEditLHPVLorryHireAmount.do', _this.setData, EXECUTE_WITH_ERROR);
			//initialize is the first function called on call new view()
			return _this;
		}, setData : function(data) {
			
			if(data.message != undefined) {
				hideLayer();
				var errorMessage = data.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				
				if(errorMessage.typeName == 'info') {
					setTimeout(() => {
						window.close();
					}, 2000);
				}
			}
			
			var jsonObject 	= new Object();
			var loadelement = new Array();
			var baseHtml 	= new $.Deferred();
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/editLHPV/editLhpvLorryHire.html",
					function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				
				lhpvChargesHshmp				= data.lhpvChargesHshmp;
				chargesColl						= data.chargesColl;
				lhpvConfiguration				= data.lhpvConfiguration;
				LHPVChargeTypeConstant			= data.LHPVChargeTypeConstant;
				LHPVConstant					= data.LHPVConstant;
				advanceSettlementStatus			= data.advanceSettlementStatus;
				additionalAdvanceSettlementStatus= data.additionalAdvanceSettlementStatus;
				isSplitLHPV						= data.isSplitLHPV;
				splitLhpvArrList				= data.splitLhpvArrList;
				totalSplitAmount				= data.totalSplitAmount;
				lhpvChargeIds					= data.lhpvChargeIds;
				lhpv							= data.lhpv;
				blhpvId							= lhpv.blhpvId;
				isShowCharges					= data.isShowCharges;
				filter							= data.filter;
				TOKEN_KEY						= data.TOKEN_KEY;
				TOKEN_VALUE						= data.TOKEN_VALUE;
				splitDieselArrList				= data.splitDieselArrList;
				lockAdditionalAdvance			= data.lockAdditionalAdvance;
				
				$('#lhpvNumberDetails').html('<b>Lhpv Number :- ' + data.lhpvNumber + '</b><br>');
				
				_this.setCharges();
				_this.getPreviousCharges(data);
				_this.calculateBalanceAmount();
				_this.enableDisableInputBox();
				_this.splitDieselWiseLhpvTable(splitDieselArrList);
				
				if(!isShowCharges) {
					$("#Add").bind('click', function() {
						if(lhpvConfiguration.isLhpvAdvanceExpenseBalanceNeeded) {
							if(_this.validateExpenseAmount()) {
								return;
							}
						}
						
						_this.saveLHPV();
					});
					
					if(isSplitLHPV) {
						$('#editlhpv').removeClass('hide');
						localStorage.setItem("totalSplitAmount", totalSplitAmount);
						
						$("#splitLhpvDataDetailPanel").load("/ivcargo/html/lhpv/splitLhpvDataDetail.html", function(responseTxt, statusTxt, xhr){
						    if(statusTxt == "success") {
						    	$("#editlhpv").bind('click',function() {
									if($('#charge' + LORRY_HIRE).val() <= 0) {
										showMessage('error', iconForErrMsg + ' Please Enter Lorry Hire Amount');
										changeTextFieldColor('charge' + LORRY_HIRE, '', '', 'red');
										return;
									}
									
									SplitLhpv.openSplitLhpv(data); 
									SplitLhpv.splitBranchWiseLhpvTable(splitLhpvArrList);
								});
								
								_this.disableCharges(data.chargemasterIds);
								showMessage('info', iconForInfoMsg + ' You cannot edit other charges if amount splited !');
								
								var branchAutoComplete 			= new Object();
								branchAutoComplete.url			= WEB_SERVICE_URL+'/autoCompleteWS/getBranchAutocompleteByAccountGroup.do?'
								branchAutoComplete.primary_key 	= 'branchId';
								branchAutoComplete.field 		= 'branchName';
								$("#branchEle").autocompleteCustom(branchAutoComplete);
						    }
						});
					}
					if(lhpvConfiguration.showSplitDieselWiseLhpv) {
						$('#editlhpvDiesel').removeClass('hide');
					
						$("#splitDieselDataDetailPanel").load("/ivcargo/html/lhpv/splitDieselDataDetail.html", function(responseTxt, statusTxt, xhr){
						    if(statusTxt == "success") {
						    	$("#editlhpvDiesel").bind('click',function() {
									if($('#charge' + DIESEL).val() <= 0) {
										showMessage('error', iconForErrMsg + ' Please Enter Diesel Amount');
										changeTextFieldColor('charge' + DIESEL, '', '', 'red');
										return;
									}
									$("#liter").keypress(function() {
										_this.calculateLiterAmount();
									});
									
									$("#dieselAmounts").keypress(function() {
										_this.calculateLiterAmount();
									});
									
									_this.openSplitDieselLhpv(); 
									_this.splitDieselWiseLhpvTable();
								});
								
								_this.disableChargesAmount(data.chargemasterIds);
								showMessage('info', iconForInfoMsg + ' You cannot edit other charges if amount splited !');
								
								var fuelPumpEleAutoComplete = new Object();
								fuelPumpEleAutoComplete.url = data.pumpNameMasterList;
								fuelPumpEleAutoComplete.primary_key = 'pumpNameMasterId';
								fuelPumpEleAutoComplete.field = 'name';
								$("#fuelPumpEle").autocompleteCustom(fuelPumpEleAutoComplete);
								
								$('#dieselDeductPayment').bind('click', function() {
									_this.calculateLiterAmount();
									_this.splitDieselAmount(); 
								});
								
								$(".close").click(function(){
									_this.resetTable();
									$('#dieselBalanceAmt').val(0);
									changeTextFieldColor('dieselBalanceAmt', '', '', 'black');
								});
								
								$('#saveAllDieselpaymentData').bind('click', function() {
									if(Number($("#dieselBalanceAmt").val()) > 0) {
										showMessage('error', 'Please Split Full Diesel Amount !');
										changeTextFieldColor('dieselBalanceAmt', '', '', 'red');
										return false;
									}
									_this.onSaveLHPVDieselDetails(); 
								});
						    }
						});
					}
					
					$('#allowToEdit').removeClass('hide');
					
					if(lhpvConfiguration.lhpvEditRemarkRequired)
						$('#editRemark').removeClass('hide');
					
					if(lhpvConfiguration.isAllowEditBoliWeight){
						$('#editBoliWeight').removeClass('hide');
						$('#editLhpvBoliWeight').val(Math.round(lhpv.boliWeight));
					}
				} else {
					_this.disableCharges(data.chargemasterIds);
					
					if(isSplitLHPV)
						SplitLhpv.displaySplitBranchWiseLhpvAmount(splitLhpvArrList);
					
					$('#allowToEdit').remove();
				}
				if(lhpvConfiguration.disableSpecificChargeOnEdit){
					var lhpvChargeIdsToDisable	 = lhpvConfiguration.lhpvChargeIdsToDisable;
					if(typeof lhpvChargeIdsToDisable !== 'undefined' && lhpvChargeIdsToDisable != null) {
						for (var i = 0; i < lhpvChargeIdsToDisable.length; i++) {
							var lhpvChargeMasterId		= lhpvChargeIdsToDisable[i];
							$('#charge' + lhpvChargeMasterId).attr('readonly', true);
						}
					}
				}
				
				//Calling from elementfocusnavigation.js file
				initialiseFocus();
			});
			
			hideLayer();
		}, setCharges : function() {
			var columnArray		= new Array();
			
			if(lhpvChargesHshmp) {
				for(var str in lhpvChargesHshmp) {
					var lhpvCharges				= lhpvChargesHshmp[str];
					var lhpvChargeTypeMasterId	= lhpvCharges.lhpvChargeTypeMasterId;
				
					if(lhpvCharges.identifier == LHPVChargeTypeConstant.IDENTIFIER_TYPE_LHPV) {
						var chargeAmount		= 0;

						if(chargesColl && chargesColl[lhpvChargeTypeMasterId] != null) {
							chargeAmount	= Math.round(chargesColl[lhpvChargeTypeMasterId]);
							
							if(lhpvChargeTypeMasterId == RATE_PER_KM)
								ratePerKM		= chargesColl[RATE_PER_KM];
						}

						var symbol	= '';

						if(lhpvCharges.operationType == LHPVChargeTypeConstant.OPERATION_TYPE_SUBTRACT)
							symbol	= '-';
						else if(lhpvCharges.operationType == LHPVChargeTypeConstant.OPERATION_TYPE_ADD)
							symbol	= '+';

						var displayName		= lhpvCharges.displayName;
						
						if(lhpvCharges.negativeAllowed)
							displayName		= lhpvCharges.displayName + " ( '-' sign allowed.)";

						columnArray	= [];

						columnArray.push("<td style='text-align: center; vertical-align: middle;'><b>" + displayName + "</b></td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;'><b><span style='font-weight: bold; font-size: medium;'>" + symbol + "</span></b></td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;'><input type = 'text' name = 'charge_" + lhpvChargeTypeMasterId + "' id = 'charge" + lhpvChargeTypeMasterId + "' class = 'charges form-control' value = '" + chargeAmount + "' style='text-align:right; width: 58%' maxlength = '7' onkeypress='return checkKeyPressEvent(event, " + lhpvCharges.negativeAllowed + ",this);' data-tooltip = '"+ lhpvCharges.displayName +"'/></td>");

						$('#results tbody').append('<tr>' + columnArray.join(' ') + '</tr>');
						
						$('#charge' + lhpvChargeTypeMasterId).focus(function() {
							resetTextFeild(this, 0);
						});
						
						if(lhpvChargeTypeMasterId == BALANCE_AMOUNT || lhpvChargeTypeMasterId == REFUND_AMOUNT)
							$('#charge' + lhpvChargeTypeMasterId).attr('readonly', true);
					}
				}
				
				if(lhpvConfiguration.isAllowEditBoliWeight){
					
					var columnArrs		= new Array();
					columnArrs.push("<td style='text-align: center; vertical-align: middle;'><b>BoliWieght</b></td>");
					columnArrs.push("<td style='text-align: center; vertical-align: middle;'></td>");
					columnArrs.push("<td style='text-align: center; vertical-align: middle;'><input type = 'text' name = 'editLhpvBoliWeight' id = 'editLhpvBoliWeight' class = 'charges form-control' value = '' style='text-align:right; width: 58%' maxlength = '7' onkeypress='return checkKeyPressEvent(event, " + lhpvCharges.negativeAllowed + ",this);' data-tooltip = 'BoliWeight'/></td>");
					$('#results tbody').append('<tr id="editBoliWeight" class="hide">' + columnArrs.join(' ') + '</tr>');
				}
				
				$(".charges").bind("keyup", function() {
					var elementId						= $(this).attr('id');
					var lhpvChargeTypeMasterId			= Number(elementId.split('_')[1]);

					if(lhpvConfiguration.isLhpvAdvanceExpenseBalanceNeeded) {
						if(lhpvChargeTypeMasterId == ADDITIONAL_TRUCK_ADVANCE)
							$('#charge' + ADDITIONAL_EXPENSE).val($('#charge' + ADDITIONAL_TRUCK_ADVANCE).val());
						
						if(lhpvChargeTypeMasterId == ADDITIONAL_EXPENSE)
							_this.validateExpenseAmount();
					}
					
					if(lhpvChargeTypeMasterId == LORRY_HIRE)
						localStorage.setItem("branchWiseSplitAmountStr", null);
				});
				
				$(".charges").bind("blur", function() {
					fillclearText(this, 0);
					_this.calculateBalanceAmount();
				});
			}
			
			columnArray	= [];
		}, getPreviousCharges : function() {
			if(chargesColl) {
				if(chargesColl[BALANCE_AMOUNT] != null)
					prevBalanceAmount	= Math.round(chargesColl[BALANCE_AMOUNT]);
				
				if(chargesColl[REFUND_AMOUNT] != null)
					prevRefundAmount	= Math.round(chargesColl[REFUND_AMOUNT]);
				
				if(chargesColl[ADVANCE_AMOUNT] != null)
					prevAdvanceAmount	= Math.round(chargesColl[ADVANCE_AMOUNT]);
				
				if(chargesColl[ADDITIONAL_TRUCK_ADVANCE] != null)
					prevAdditionalAdvanceAmount	= Math.round(chargesColl[ADDITIONAL_TRUCK_ADVANCE]);
				
				if(chargesColl[DIESEL] != null)
					prevDieselAmount	= Math.round(chargesColl[DIESEL]);
			}
		}, disableCharges : function(chargemasterIds) {
			if(chargemasterIds) {
				for(var i = 0; i < chargemasterIds.length; i++) {
					if(isSplitLHPV && chargemasterIds[i] == LORRY_HIRE) {}
					else
						$('#charge' + chargemasterIds[i]).attr('readonly', true);
				}
			}
		}, validateExpenseAmount : function() {
			var additionalAdvance = Number($('#charge' + ADDITIONAL_TRUCK_ADVANCE).val());
			var AdditionalExpense = Number($('#charge' + ADDITIONAL_EXPENSE).val());

			var isError = false;
			
			if(additionalAdvance != AdditionalExpense) {
				isError = true;
				showMessage('info', iconForInfoMsg + 'Expense amount Can not less or more than Previous amount !');
				$('#charge' + ADDITIONAL_EXPENSE).val(additionalAdvance);
			}
			
			return isError;
		}, calculateBalanceAmount : function() {
			
			if(!_this.checkAdvanceAmountStatus()) {
				if(lhpvConfiguration.calculateTotalOnAdvance){
					let lorryFreight	= 0;
					let margin			= 0;
					let advance			= 0;
					let commission		= 0;
					let loadingHamali	= 0;
					let other			= 0;
					let otherCharges	= 0;
					let tds				= 0;
					let gpsCharges		= 0;
					let penaltyCharges	= 0;
					let tarpulinCharges = 0;
					let extraCharges = 0;
					let overloadCharges = 0;
					let labourCharges = 0;
					let multiplePointCharges = 0;
					let heightCharges = 0;
					let additionaWtCharges = 0;
					
					if(!isNaN(parseInt($("#charge" + LORRY_HIRE).val()))) 
						lorryFreight	= parseInt($("#charge" + LORRY_HIRE).val());
					
					if(!isNaN(parseInt($("#charge" + MARGIN).val()))) 
						margin			= parseInt($("#charge" + MARGIN).val());
						
					if(!isNaN(parseInt($("#charge" + OTHER_ADDITIONAL).val()))) 
						otherCharges	= parseInt($("#charge" + OTHER_ADDITIONAL).val());
						
					if(!isNaN(parseInt($("#charge" + TDS).val())))
						tds			= parseInt($("#charge" + TDS).val());
					
					let tdsChargeInPercent	= 0;
					
					if(tdsConfiguration != undefined) {
						tdsChargeInPercent	= tdsConfiguration.TDSChargeInPercent;
						
		 				if(tdsChargeInPercent != undefined && !tdsChargeInPercent.includes(",")) {
							let tdsAmount	= lorryFreight * Number(tdsChargeInPercent) / 100;
							
							if(tds > tdsAmount && Number(tdsChargeInPercent) > 0) {
								showMessage('error', "TDS Amount " + tds + " can not be more than " + Number(tdsChargeInPercent) + "% of Lorry Hire !");
								$("#charge" + TDS).val(tdsAmount);
							}
						}
					}
	
					let incentiveAmount = lorryFreight * lhpvConfiguration.incentivePercentageValueOfLorryHire / 100;
					
					//$("#charge" + INCENTIVE_AMOUNT).val(incentiveAmount);
					
					let incentiveAmt	= 0;
					
					if (!isNaN(parseInt($("#charge" + INCENTIVE_AMOUNT).val()))) {
						incentiveAmt = parseInt($("#charge" + INCENTIVE_AMOUNT).val());
	
						if (incentiveAmt > incentiveAmount) {
							showMessage('error', "Incentive Amount " + incentiveAmt + " can not be more than " + lhpvConfiguration.incentivePercentageValueOfLorryHire + "% of Lorry Hire !");
							$("#charge" + INCENTIVE_AMOUNT).val(incentiveAmount);
							$("#charge" + INCENTIVE_AMOUNT).focus();
						}
					}
	
					if(!isNaN(parseInt($("#charge" + ADVANCE_AMOUNT).val())))
						advance			= parseInt($("#charge" + ADVANCE_AMOUNT).val());
						
					if(!isNaN(parseInt($("#charge" + COMMISSION).val())))
						commission		= parseInt($("#charge" + COMMISSION).val());
					
					if(!isNaN(parseInt($("#charge" + LOADING_HAMALI).val())))
						loadingHamali	= parseInt($("#charge" + LOADING_HAMALI).val());
					
					if(!isNaN(parseInt($("#charge" + OTHER_NEGATIVE).val())))
						other			= parseInt($("#charge" + OTHER_NEGATIVE).val());
						
					if(!isNaN(parseInt($("#charge" + GPS_CHARGES).val())))
						gpsCharges			= parseInt($("#charge" + GPS_CHARGES).val());
						
					if(!isNaN(parseInt($("#charge" + TARPULIN_CHARGES).val())))
						tarpulinCharges		= parseInt($("#charge" + TARPULIN_CHARGES).val());	
						
					if(!isNaN(parseInt($("#charge" + PENALTY_CHARGES).val())))
						penaltyCharges		= parseInt($("#charge" + PENALTY_CHARGES).val());
	
					if(!isNaN(parseInt($("#charge" + EXTRA_CHARGE).val())))
						extraCharges		= parseInt($("#charge" + EXTRA_CHARGE).val());
					
					if(!isNaN(parseInt($("#charge" + OVERLOAD_CHARGE).val())))
						overloadCharges		= parseInt($("#charge" + OVERLOAD_CHARGE).val());
					
					if(!isNaN(parseInt($("#charge" + LABOUR_CHARGE).val())))
						labourCharges		= parseInt($("#charge" + LABOUR_CHARGE).val());
					
					if(!isNaN(parseInt($("#charge" + MULTIPLE_POINT).val())))
						multiplePointCharges		= parseInt($("#charge" + MULTIPLE_POINT).val());
					
					if(!isNaN(parseInt($("#charge" + HEIGHT_CHARGE).val())))
						heightCharges		= parseInt($("#charge" + HEIGHT_CHARGE).val());
						
					if(!isNaN(parseInt($("#charge" + ADDITIONAL_WEIGHT_CHARGE).val())))
						additionaWtCharges = parseInt($("#charge" + ADDITIONAL_WEIGHT_CHARGE).val());
	
					let totalLorryHire	= Math.round(lorryFreight - margin + otherCharges + extraCharges + overloadCharges + labourCharges + multiplePointCharges + heightCharges + additionaWtCharges);
	
					$("#charge" + TOTAL_LORRY_HIRE).val(totalLorryHire);
					$("#charge" + BALANCE_ADVANCE).val(Math.round(advance - commission - loadingHamali - other));
					$("#charge" + BALANCE_AMOUNT).val(Math.round(totalLorryHire - advance - tds  - incentiveAmt  + gpsCharges + tarpulinCharges + penaltyCharges));
				} else {
					let totalAmount = _this.chargesAmountCal() - ratePerKM;
					
					if(totalAmount >= 0) {
						$('#charge' + BALANCE_AMOUNT).val(Math.abs(totalAmount));
						$('#charge' + REFUND_AMOUNT).val(0);
					} else {
						$('#charge' + BALANCE_AMOUNT).val(0);
						$('#charge' + REFUND_AMOUNT).val(Math.abs(totalAmount));
					}
				}
			}
		}, chargesAmountCal : function() {
			let chargesAmount = 0;
			
			if(lhpvChargesHshmp) {
				for(let str in lhpvChargesHshmp) {
					let lhpvCharges				= lhpvChargesHshmp[str];
					let lhpvChargeTypeMasterId	= lhpvCharges.lhpvChargeTypeMasterId;
					
					if(lhpvCharges.identifier == LHPVChargeTypeConstant.IDENTIFIER_TYPE_LHPV
							&& (lhpvChargeTypeMasterId != BALANCE_AMOUNT
							&& lhpvChargeTypeMasterId != REFUND_AMOUNT
							&& lhpvChargeTypeMasterId != RATE_PMT)) {
						
						if(lhpvCharges.operationType != LHPVChargeTypeConstant.OPERATION_TYPE_SUBTRACT) {
							if($('#charge' + lhpvChargeTypeMasterId).val() > 0)
								chargesAmount	+= parseInt($('#charge' + lhpvChargeTypeMasterId).val());
						} else if($('#charge' + lhpvChargeTypeMasterId).val() > 0)
							chargesAmount	-= parseInt($('#charge' + lhpvChargeTypeMasterId).val());
					}
				}
			}
			
			return chargesAmount;
		}, chargesAmountCalWithoutAdvance : function() {
			var chargesAmount = 0;
			
			if(lhpvChargesHshmp) {
				for(var str in lhpvChargesHshmp) {
					var lhpvCharges				= lhpvChargesHshmp[str];
					var lhpvChargeTypeMasterId	= lhpvCharges.lhpvChargeTypeMasterId;
					
					if(lhpvCharges.identifier == LHPVChargeTypeConstant.IDENTIFIER_TYPE_LHPV
							&& (lhpvChargeTypeMasterId != BALANCE_AMOUNT
							&& lhpvChargeTypeMasterId != REFUND_AMOUNT
							&& lhpvChargeTypeMasterId != ADVANCE_AMOUNT)) {
						
						if(lhpvCharges.operationType != LHPVChargeTypeConstant.OPERATION_TYPE_SUBTRACT)
							chargesAmount	+= parseInt($('#charge' + lhpvChargeTypeMasterId).val());
						else
							chargesAmount	-= parseInt($('#charge' + lhpvChargeTypeMasterId).val());
					}
				}
			}
			
			return chargesAmount;
		}, checkBalanceRefundStatus : function() {
			var blanceAmount 			= 0;
			var refundAmount 			= 0;
			
			var isError = false;
			
			if(document.getElementById('charge' + BALANCE_AMOUNT))
				blanceAmount 	= $('#charge' + BALANCE_AMOUNT).val();
			
			if(document.getElementById('charge' + REFUND_AMOUNT))
				refundAmount = $('#charge' + REFUND_AMOUNT).val();
			
			if(blhpvId > 0 && (lhpvConfiguration.editLHPVRateAfterBLHPVCreated)) {
				if(parseInt(blanceAmount) != parseInt(prevBalanceAmount)){
					isError = true;
					showMessage('info', iconForInfoMsg + 'Balance amount can not be changed !');
				}
				
				if(parseInt(refundAmount) != parseInt(prevRefundAmount)){
					isError = true;
					showMessage('info', iconForInfoMsg + 'Refund amount can not be changed !');
				}
			}
			
			if(isError)
				_this.resetChargeToPreviousCharges();

			return isError;
		} , enableDisableInputBox : function() {
			if(filter == 4) {
				$('#charge' + ADVANCE_AMOUNT).attr('readonly', false);
				$('#charge' + ADDITIONAL_TRUCK_ADVANCE).attr('readonly', false);
				$('#charge' + LORRY_HIRE).attr('readonly', false);
			} else if(filter == 6) {
				if(advanceSettlementStatus == LHPVConstant.LHPV_ADVANCE_SETTLEMENT_STATUS_DUE)
					$('#charge' + ADVANCE_AMOUNT).attr('readonly', false);

				if(additionalAdvanceSettlementStatus == LHPVConstant.LHPV_ADVANCE_SETTLEMENT_STATUS_DUE)
					$('#charge' + ADDITIONAL_TRUCK_ADVANCE).attr('readonly', false);

				$('#charge' + LORRY_HIRE).attr('readonly', true);
			} else  if(filter == 7) {
				if(advanceSettlementStatus == LHPVConstant.LHPV_ADVANCE_SETTLEMENT_STATUS_DUE)
					$('#charge' + ADVANCE_AMOUNT).attr('readonly', false);
				else
					$('#charge' + ADVANCE_AMOUNT).attr('readonly', true);

				if(additionalAdvanceSettlementStatus == LHPVConstant.LHPV_ADVANCE_SETTLEMENT_STATUS_DUE)
					$('#charge' + ADDITIONAL_TRUCK_ADVANCE).attr('readonly', false);
				else
					$('#charge' + ADDITIONAL_TRUCK_ADVANCE).attr('readonly', true);

				$('#charge' + LORRY_HIRE).attr('readonly', false);
			} else {
				$('#charge' + ADVANCE_AMOUNT).attr('readonly', true);
				$('#charge' + ADDITIONAL_TRUCK_ADVANCE).attr('readonly', false);
			}
			
			if(lhpvConfiguration.allowToEditAdditionalAdvanceAmtForGroupAdmin)
				$('#charge' + ADDITIONAL_TRUCK_ADVANCE).attr('readonly', lockAdditionalAdvance);
		}, checkAdvanceAmountStatus : function() {
			var advanceAmount 			= 0;
			var additionalAdvanceAmount = 0;
			
			var isError = false;
			
			if(document.getElementById('charge' + ADVANCE_AMOUNT))
				advanceAmount = $('#charge' + ADVANCE_AMOUNT).val();
			
			if(document.getElementById('charge' + ADDITIONAL_TRUCK_ADVANCE))
				additionalAdvanceAmount = $('#charge' + ADDITIONAL_TRUCK_ADVANCE).val();
			
			if(advanceSettlementStatus != LHPVConstant.LHPV_ADVANCE_SETTLEMENT_STATUS_DUE) {
				if(parseInt(advanceAmount) < parseInt(prevAdvanceAmount)) {
					isError = true;
					showMessage('info', iconForInfoMsg + "Advance amount Can not less than Previous amount !");
				}
			}
			
			if(additionalAdvanceSettlementStatus != LHPVConstant.LHPV_ADVANCE_SETTLEMENT_STATUS_DUE) {
				if(parseInt(additionalAdvanceAmount) < parseInt(prevAdditionalAdvanceAmount)) {
					isError = true;
					showMessage('info', iconForInfoMsg + "Additional Advance amount Can not less than Previous amount !");
				}
			}
			
			if(isError)
				_this.resetChargeToPreviousCharges();
			
			return isError;
		}, resetChargeToPreviousCharges : function() {
			var chargeAmount = 0.0;
			
			if(lhpvChargesHshmp) {
				for(var str in lhpvChargesHshmp) {
					var lhpvCharges				= lhpvChargesHshmp[str];
					var lhpvChargeTypeMasterId	= lhpvCharges.lhpvChargeTypeMasterId;
					chargeAmount				= 0;
					
					if(lhpvCharges.identifier == LHPVChargeTypeConstant.IDENTIFIER_TYPE_LHPV) {
						if(chargesColl && chargesColl[lhpvChargeTypeMasterId] != null)
							chargeAmount	= Math.round(chargesColl[lhpvChargeTypeMasterId]);
					
						$('#charge' + lhpvChargeTypeMasterId).val(chargeAmount);
					}
				}
			}
		}, resetTable : function() {
			$('#tableDieselElements tbody').empty();
			return false;
		}, onSaveLHPVDieselDetails : function() {
			//$('#balPayableAmount').val('');
			
			dieselWiseSplitAmtList	= [];
			totalDieselAmount		= 0;
			$("#tableDieselElements tbody tr").each(function () {
				var elementId		= $(this).attr('id');
				var fuelPumpId		= elementId.split('_')[1];
				
				totalDieselAmount += Number($("#dieselAmount_" + fuelPumpId).val());
				
				if($("#liter_" + fuelPumpId).exists()) {
					if(isNaN(Number($("#liter_" + fuelPumpId).val()))){
						$("#liter_" + fuelPumpId).val(0);
					}
				}
				if($("#perLiterRate_" + fuelPumpId).exists()) {
					if(isNaN(Number($("#perLiterRate_" + fuelPumpId).val()))){
						$("#perLiterRate_" + fuelPumpId).val(0);
					}
				}
				
				if($("#liter_" + fuelPumpId).exists() && $("#perLiterRate_" + fuelPumpId).exists() ) {
					dieselWiseSplitAmtList.push(Number(fuelPumpId) +  "_"  + Number($("#dieselAmount_" + fuelPumpId).val()) +"_"+ Number($("#liter_" + fuelPumpId).val()) + "_" + Number($("#perLiterRate_" + fuelPumpId).val()));
				} else {
					dieselWiseSplitAmtList.push(Number(fuelPumpId) +  "_"  + Number($("#dieselAmount_" + fuelPumpId).val()) +"_"+ Number(0) + "_" + Number(0));
				}
			})
            
            $("#splitDieselDataDetailPanel").modal('hide');
		}, validateRemark : function() {
			var remark = $('#editLhpvRemark').val();
			
			if(remark == "") {
				showMessage('error', 'Please Enter Remark');
				$('#editLhpvRemark').focus();
				return false;
			} else {
				return true;
			}
		}, saveLHPV : function() {
			var currentBalAmount  = Number($("#charge" + BALANCE_AMOUNT).val());
			var currentDieselAmount  = Number($("#charge" + DIESEL).val());
			
			if(lhpvConfiguration.lhpvEditRemarkRequired) {
				var remarkValidate = _this.validateRemark();
			
				if(!remarkValidate) {
					return false;
				}
			}
			
			if(isSplitLHPV) {
				totalSplitAmount	= localStorage.getItem("totalSplitAmount");

				if(totalSplitAmount != Number($("#charge" + LORRY_HIRE).val())) {
					showMessage('error', 'Please Split Full Lorry Hire Amount !');
					changeTextFieldColor('balPayableAmount', '', '', 'red');
					return false;
				}
			}
			
			if(lhpvConfiguration.showSplitDieselWiseLhpv){
				var totalDieselAmt = Number(totalDieselAmount);
				var dieselAmt = Number($("#charge" + DIESEL).val());
				
				 if(dieselAmt != 0 && currentDieselAmount != prevDieselAmount) {
					if(totalDieselAmt != dieselAmt){
						showMessage('error', 'Please Split Diesel Amount !');
						changeTextFieldColor('openSplitDiesel', '', '', 'red');
						return false;
					}
				}
			}
			
			if(lhpvConfiguration.lhpvAdvanceAmountChecking) {
				var totalAmount 		= 0;
				var advanceAmount 		= 0;

				totalAmount 	= _this.chargesAmountCalWithoutAdvance();

				if(document.getElementById('charge' + ADVANCE_AMOUNT)) {
					advanceAmount = document.getElementById('charge' + ADVANCE_AMOUNT).value;
				}
				
				if(parseInt(advanceAmount) > 0 && parseInt(advanceAmount) > parseInt(totalAmount)) {
					showMessage('warning', advanceAmountMTBalanaceAmtWarningMag);
					setTimeout(function(){ $('#charge' + ADVANCE_AMOUNT).focus(); }, 0);
					return false;
				};
			}
			
			if(_this.checkAdvanceAmountStatus() || _this.checkBalanceRefundStatus())
				return;
			
			if(confirm("Are you sure you want to save LHPV Amount ! ")) {
				showLayer();

				var jsonObject		= new Object();

				jsonObject.lhpvId			= lhpvId;
				jsonObject.branchWiseList	= localStorage.getItem("branchWiseSplitAmountStr");
				jsonObject.lhpvChargeIds	= lhpvChargeIds;
				jsonObject.remark			= $('#editLhpvRemark').val();
				jsonObject.TOKEN_KEY		= TOKEN_KEY;
				jsonObject.TOKEN_VALUE		= TOKEN_VALUE;
				jsonObject.dieselWiseSplitAmtList = dieselWiseSplitAmtList.join(',');
				jsonObject.currentDieselAmount = currentDieselAmount;
				jsonObject.boliWeight 		= $('#editLhpvBoliWeight').val();
				jsonObject.prevBoliWeight 	= Math.round(lhpv.boliWeight);
			
				$('#results tr').each(function(i, row) {
					$(this).find('input').each(function() {
						if($(this).val() > 0) {
							jsonObject[$(this).attr('name')] = $(this).val();
						}
					});
				});
				
				jsonObject.redirectTo	= redirectTo;
				
				getJSON(jsonObject, WEB_SERVICE_URL+'/LHPVWS/lhpvEditLorryHire.do', _this.afterSaveLhpv, EXECUTE_WITHOUT_ERROR);
			}
		}, afterSaveLhpv : function (response) {
			if(response.message != undefined) {
				hideLayer();
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
			}
			
			localStorage.removeItem("branchWiseSplitAmountStr");
			localStorage.removeItem("totalSplitAmount");
			
			hideLayer();

			setTimeout(() => {
				redirectToAfterUpdate(response);
			}, 1500);
		}, openSplitDieselLhpv : function() {
			$("#splitDieselDataDetailPanel").modal({
				backdrop : 'static',
				keyboard : false
			});
			
			setTimeout(function() {
				var lhpvDieselTotalAmount = $('#charge' + DIESEL).val();
				var balanceAmount	= lhpvDieselTotalAmount;
				if($('#charge' + DIESEL).val() > 0)
					balanceAmount	= $('#charge' + DIESEL).val();
				
				balDieselAmount	= balanceAmount - totalDieselAmount;
				$('#dieselTotalAmount').val(lhpvDieselTotalAmount);
				$('#dieselBalanceAmt').val(balDieselAmount);
			}, 500);
			if(lhpvConfiguration.showLiterAmout){
				$("#literDiv").removeClass('hide');
				$("#literHeader").removeClass('hide');
			}else{
				$("#literDiv").addClass('hide');
				$("#literHeader").addClass('hide');
			}
			if(lhpvConfiguration.showPerLiterRateAmount){
				$("#perLiterRateDiv").removeClass('hide');
				$("#perLiterRateHeader").removeClass('hide');
			}else{
				$("#perLiterRateDiv").addClass('hide');
				$("#perLiterRateHeader").addClass('hide');
			}
			
			dieselWiseSplitAmtList	= [];
		}, splitDieselWiseLhpvTable : function() {
			$('#tableDieselElements tbody').empty();
			
			totalDieselAmount	= 0;
			
			var columnArray		= new Array();
			
			if(splitDieselArrList != null && splitDieselArrList.length > 0) { 
				for(var i = 0; i < splitDieselArrList.length; i++) {
					var dieselWiseLhpvAmount = splitDieselArrList[i];
					
					
					
					var pumpName 			= dieselWiseLhpvAmount.pumpName;
					var dieselAmount 		= dieselWiseLhpvAmount.dieselAmount;
					var liter		 		= dieselWiseLhpvAmount.liter;
					var perLiterRate 		= dieselWiseLhpvAmount.perLiterRate;
					var fuelPumpId			= dieselWiseLhpvAmount.fuelPumpId;
					totalDieselAmount		+= dieselWiseLhpvAmount.dieselAmount;
					
					var columnArray		= new Array();
					
					columnArray.push("<td style='text-align: center;'>" + pumpName + "</td>");
					columnArray.push("<td style='text-align: center;'><input class='form-control' id='dieselAmount_" + fuelPumpId + "' type='text' name='dieselAmount_" + fuelPumpId + "' value='"+dieselAmount+"' onkeypress='return allowOnlyNumeric(event);'/></td>");
					if(lhpvConfiguration.showLiterAmout){
						columnArray.push("<td style='text-align: center;'><input class='form-control' id='liter_" + fuelPumpId + "' type='text' name='liter_" + fuelPumpId + "' value='"+liter+"' onkeypress='return allowOnlyNumeric(event);'/></td>");
					}
					if(lhpvConfiguration.showPerLiterRateAmount){
						columnArray.push("<td style='text-align: center;'><input class='form-control' id='perLiterRate_" + fuelPumpId + "' type='text' name='perLiterRate_" + fuelPumpId + "' value='"+perLiterRate+"' onkeypress='return allowOnlyNumeric(event);'/></td>");
					}
					columnArray.push("<td><button type='button' class='btn btn-danger' data-tooltip = 'Remove' id='removeRowElement_" + fuelPumpId + "'>Remove</button></td>");
					$('#tableDieselElements tbody').append("<tr id='row_" + fuelPumpId + "'>" + columnArray.join(' ') + "</tr>");
					
					$("#removeRowElement_" + fuelPumpId).bind("click", function() {
						var elementId			= $(this).attr('id');
						_this.showMultipleAddInDieselDetails();
						_this.deleteDieselWiseLhpvColumn(elementId.split('_')[1]);
					});

					$("#dieselAmount_" + fuelPumpId).bind("keyup", function() {
						 _this.recheckDieselAmount(this);
					});

					columnArray	= [];
				}
			}
		}, deleteDieselWiseLhpvColumn : function(fuelPumpId) {
			if(confirm("Are you sure to delete?")) {
				balPayableAmount	= balPayableAmount + Number($("#dieselAmount_" + fuelPumpId).val());
				$('#dieselBalanceAmt').val(Number($("#dieselBalanceAmt").val()) + Number($("#dieselAmount_" + fuelPumpId).val()));
				$("#row_" + fuelPumpId).remove();
			}
			
			$("#fuelPumpEle").val('');
			$("#dieselAmounts").val('');
			$("#liter").val('');
			$("#perLiterRate").val('');
		}, recheckDieselAmount : function(obj) {
			var totalDieselAmount	= 0;
			var dieselBalanceAmt	= 0;
			
			$("#tableDieselElements tbody tr").each(function () {
				var elementId		= $(this).attr('id');
				var fuelPumpId		= elementId.split('_')[1];
				
				totalDieselAmount += Number($("#dieselAmount_" + fuelPumpId).val());
            })
            
            dieselBalanceAmt	= $('#dieselTotalAmount').val() - totalDieselAmount;
            
            if(dieselBalanceAmt < 0) {
				showMessage('info', 'Amount can not be greater than ' + $('#dieselBalanceAmt').val());
				$('#dieselBalanceAmt').val(dieselBalanceAmt);
				//obj.value = 0;
				return false;
            }
            
            $('#dieselBalanceAmt').val(dieselBalanceAmt);
		}, splitDieselAmount : function() {
			var fuelPumpId = $('#fuelPumpEle_primary_key').val();
			
			if($("#row_" + fuelPumpId).exists()) {
				showMessage('error','Please enter a new Pump Name');
				return false;
			}
			
			var dieselAmount	= $("#dieselAmounts").val();
			var liter			= $("#liter").val();
			var perLiterRate	= $("#perLiterRate").val();
			
			if(dieselAmount == '' || dieselAmount == 0) {
				showMessage('error',iconForErrMsg + ' Please Enter Diesel Amount');
				changeTextFieldColor('', '', '', 'red');
				return false;
			}

			if($('#dieselBalanceAmt').val() == 0) {
				showMessage('info','Balance Amount is Zero');
				return false;
			}
			
			if(Number($('#dieselAmounts').val()) > Number($('#dieselBalanceAmt').val())) {
				showMessage('info', 'Amount can not be greater than ' + $('#dieselBalanceAmt').val());
				return false;
			}
			_this.showMultipleAddInDieselDetails();
			_this.addNewDieselAmount(fuelPumpId, dieselAmount,liter,perLiterRate);

			$("#fuelPumpEle").val('');
			$("#dieselAmounts").val('');
			$("#liter").val('');
			$("#perLiterRate").val('');

		}, addNewDieselAmount : function(fuelPumpId, dieselAmount,liter,perLiterRate) {
			var PumpName = $('#fuelPumpEle').val();
			
			var columnArray		= new Array();
			
			columnArray.push("<td style='text-align: center; text-transform: uppercase' >" + PumpName + "</td>");
			columnArray.push("<td style='text-align: center; vertical-align: middle;'><input  class='form-control' id='dieselAmount_" + fuelPumpId + "' type='text' name='dieselAmount_" + fuelPumpId + "' value='" + dieselAmount + "' onkeypress='return allowOnlyNumeric(event);' disabled/></td>");
			if(lhpvConfiguration.showLiterAmout){
				columnArray.push("<td style='text-align: center;'><input class='form-control' id='liter_" + fuelPumpId + "' type='text' name='liter_" + fuelPumpId + "' value='"+liter+"' onkeypress='return allowOnlyNumeric(event);' disabled/></td>");
			}
			if(lhpvConfiguration.showPerLiterRateAmount){
				columnArray.push("<td style='text-align: center;'><input class='form-control' id='perLiterRate_" + fuelPumpId + "' type='text' name='perLiterRate_" + fuelPumpId + "' value='"+perLiterRate+"' onkeypress='return allowOnlyNumeric(event);' disabled/></td>");
			}
			
			columnArray.push("<td><button type='button' class='btn btn-danger' data-tooltip = 'Remove' id='removeRowElement_" + fuelPumpId + "'>Remove</button></td>");
			
			$('#tableDieselElements tbody').append('<tr id="row_'+ fuelPumpId +'">' + columnArray.join(' ') + '</tr>');
			
			balDieselAmount	= balDieselAmount - Number($("#dieselAmount_" + fuelPumpId).val());
			
			$('#dieselBalanceAmt').val(Number($('#dieselBalanceAmt').val()) - Number(dieselAmount));
			
			$("#removeRowElement_" + fuelPumpId).bind('click',function() {
				var elementId			= $(this).attr('id');
				_this.showMultipleAddInDieselDetails();
				_this.deleteDieselWiseLhpvColumn(elementId.split('_')[1]);
			});
			
			$("#dieselAmount_" + fuelPumpId).bind("keyup", function() {
			    _this.recheckDieselAmount(this);
			});
			
			columnArray	= [];
		}, disableChargesAmount : function(chargemasterIds) {
			if(chargemasterIds) {
				for(var i = 0; i < chargemasterIds.length; i++) {
					if(chargemasterIds[i] == LORRY_HIRE || chargemasterIds[i] == DIESEL || advanceSettlementStatus == LHPVConstant.LHPV_ADVANCE_SETTLEMENT_STATUS_DUE || chargemasterIds[i] == LHPVChargeTypeConstant.TDS) {}
					else
						$('#charge' + chargemasterIds[i]).attr('readonly', true);
				}
			}
		}, calculateLiterAmount : function(){
			setTimeout(() => {
				liter 		  = Number($('#liter').val());
				dieselAmounts = Number($('#dieselAmounts').val());
				if(liter != '' && liter != 0 && dieselAmounts != '' && dieselAmounts != ''){
					$("#perLiterRate").val((dieselAmounts/liter).toFixed(2));
				}else{
					$("#perLiterRate").val('');
				}
			}, 100);
		}, showMultipleAddInDieselDetails : function(){
			
			if(!lhpvConfiguration.showMultipleAddInDieselDetails){
				var rowCount = $('#tableDieselElements tr').length;
				if(rowCount == 2){
					$("#dieselDeductPayment").attr("disabled", true);
				}else{
					$("#dieselDeductPayment").attr("disabled", false);
				}
			}
		}
	});
});

function checkKeyPressEvent(event, isNegativeAllowed, ele) {
	if(isNegativeAllowed) {
		return negativeChargeValid(event, ele);
	} else {
		return noNumbers(event);
	}
}

function negativeChargeValid(e, obj) {
	var keynum = e.which;
	if(obj.value.length == 0 && keynum == 45) {
		return true;
	} else {
		return	noNumbers(e);
	};
}
function allowOnlyNumeric(evt) {
	if (evt.ctrlKey == 1) {
		return true;
	} else {
		var keynum 	= null;

		if(window.event){ // IE
			keynum = evt.keyCode;
		} else if(evt.which){ // Netscape/Firefox/Opera
			keynum = evt.which;
		}

		if(keynum != null) {
			if(keynum == 13 || keynum == 8 || keynum == 45 || keynum == 47) {
				hideAllMessages();
				return true;
			} else if (keynum < 48 || keynum > 57) {
				showMessage('warning', ' Only A-Z and 0-9 allowed, No other Character Allowed !');
				return false;
			}
		}
		return true;
	}
}