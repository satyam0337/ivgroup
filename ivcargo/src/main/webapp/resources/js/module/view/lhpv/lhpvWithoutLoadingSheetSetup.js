define([ 'nodvalidation'
		,'focusnavigation']
,function(NodValidation, FocusNavigation) {
	'use strict';// this basically give strictness to this specific js
	let _this = '',
	data,
	lorryHireObject,
	charges 	= new Object(),
	subCharges 	= new Array(),
	addCharges 	= new Array(),
	manualLHPVNod,
	normalLHPVNod,
	lhpvConfiguration,
	allowedSpecialCharacters,
	allowManualLHPVWithoutCounter,
	doneTheStuff	= false,CREATE_ID = 1;
	
	return {
		getLHPVTypeSelectionDropdown : function(){
			_this = this;
			let josnObject = new Object();
			josnObject.lhpvTypeSelectionDropdown 		= '/ivcargo/html/lhpv/lhpvTypeSelections.html';
			return josnObject.lhpvTypeSelectionDropdown;

		}, getFilePathForLabel : function(configuration) {
			let josnObject = new Object();
			
			josnObject.lhpvWithoutLoadingSheet 		= '/ivcargo/resources/js/module/view/lhpv/lhpvfilepath.js';
			
			return josnObject[configuration.LHPVWithoutLS];
		}, loadLHPVTypeWiseHTML : function(value, truckEngagementSleepAllowed) {
			if (truckEngagementSleepAllowed && value == 1)
				return 'text!/ivcargo/html/lhpv/lhpvWithoutLoadingSheet.html';
			
			if ((!truckEngagementSleepAllowed && value == 1) || value == 2 || value == 3 || value == 4)
				return 'text!/ivcargo/html/lhpv/lhpvWithLoadingSheet.html';
		}, searchTruckEngagementSlip : function(response) {
			showLayer();
			data	= response;
			let tesNumberObj				= new Object();
			tesNumberObj.lorryHireNumber	= $( "#truckEngagementSlipEle" ).val();
			getJSON(tesNumberObj, WEB_SERVICE_URL + '/LorryHireWS/getLorryHireDetailsByLorryHireNumber.do?', _this.renderLHPVForCreate, EXECUTE_WITH_ERROR);
		}, renderLHPVForCreate : function(response) {
			hideLayer();
			
			if (response.message != undefined)
				return;
			
			lorryHireObject					= response.lorryHire;
			lhpvConfiguration				= data;
			allowedSpecialCharacters		= lhpvConfiguration.AllowedSpecialCharacters;
			allowManualLHPVWithoutCounter	= lhpvConfiguration.allowManualLHPVWithoutCounter
			
			$("#lhpvVehicle").text('LHPV For ' + lorryHireObject.vehicleNumber);
			$("#destinationBranchEle").val(lorryHireObject.destinationBranch);
			$("#balancePayableBranchEle").val(lorryHireObject.balancePayableAtBranch);
			$("#advancePaidByBranchEle").val(lorryHireObject.advancePaidByBranchName);
			$("#vehicleSupplierEle").val(lorryHireObject.lorrySupplierName);
			$("#vehicleTypeEle").val(lorryHireObject.vehicleType);
			
			if (lorryHireObject.paymentType != PAYMENT_TYPE_CASH_ID) {
				let paymentString	= lorryHireObject.paymentTypeString;
			
				if (lorryHireObject.chequeDate != undefined)
					paymentString += "/" + lorryHireObject.chequeDateForUser;
			
				if (lorryHireObject.chequeNumber != undefined)
					paymentString += "/" + lorryHireObject.chequeNumber;
				
				if (lorryHireObject.chequeAmount != undefined)
					paymentString += "/" + lorryHireObject.chequeAmount;
				
				if (lorryHireObject.bankName != undefined)
					paymentString += "/" + lorryHireObject.bankName;
				
				$("#paymentTypeEle").val(paymentString);
			} else
				$("#paymentTypeEle").val(lorryHireObject.paymentTypeString);
			
			let keyObject	= null;
			
			let lhpvSubChargesHshmp	= data.lhpvSubChrgHshmp;
			keyObject 			= Object.keys(lhpvSubChargesHshmp);
		
			for (const element of keyObject) {
				let chargeObject		= lhpvSubChargesHshmp[element];
				let chargeIdentifier 	= "charge" + chargeObject.lhpvChargeTypeMasterId;
				subCharges.push(chargeIdentifier);
			}
		
			let lhpvAddChargesHshmp		= data.lhpvAddChrgHshmp;
			keyObject 				= Object.keys(lhpvAddChargesHshmp);
			
			for (const element of keyObject) {
				let chargeObject		= lhpvAddChargesHshmp[element];
				let chargeIdentifier 	= "charge" + chargeObject.lhpvChargeTypeMasterId;
				addCharges.push(chargeIdentifier);
			}
		
			let lhpvChargesHshmp	= data.lhpvChargesHshmp;
			keyObject 			= Object.keys(lhpvChargesHshmp);
			
			for (const element of keyObject) {
				let chargeObject			= lhpvChargesHshmp[element];
				let chargeIdentifier 		= "charge" + chargeObject.lhpvChargeTypeMasterId;
				charges[chargeIdentifier]	= 0;
				
				let chargeDiv	= null;
				
				if (chargeObject.operationType == OPERATION_TYPE_STATIC || chargeObject.operationType == OPERATION_TYPE_NO_EFFECT_BALANCE)				
					chargeDiv	= ("<div class='row'><label class='col-xs-5'><span>" + chargeObject.displayName + "</span></label><div class='col-xs-7 validation-message'><div class='left-inner-addon'><i>&#x20B9</i><input class='form-control calculation' value='0' type='text' name='" + chargeIdentifier + "' id='" + chargeIdentifier + "' data-tooltip='" + chargeObject.displayName + "'/></div></div></div>");
				
				if (chargeObject.operationType == OPERATION_TYPE_ADD)
					chargeDiv	= ("<div class='row'><label class='col-xs-5'><span>" + chargeObject.displayName + "</span></label><div class='col-xs-7 validation-message'><div class='left-inner-addon'><i class='glyphicon glyphicon-plus'></i><input class='form-control calculation' value='0' type='text' name='" + chargeIdentifier + "' id='" + chargeIdentifier + "' data-tooltip='" + chargeObject.displayName + "'/></div></div></div>");
				
				if (chargeObject.operationType == OPERATION_TYPE_SUBTRACT)
					chargeDiv	= ("<div class='row'><label class='col-xs-5'><span>" + chargeObject.displayName + "</span></label><div class='col-xs-7 validation-message'><div class='left-inner-addon'><i class='glyphicon glyphicon-minus'></i><input class='form-control calculation' value='0' type='text' name='" + chargeIdentifier + "' id='" + chargeIdentifier + "' data-tooltip='" + chargeObject.displayName + "'/></div></div></div>");
				
				if(chargeDiv != null)
					$( "#lhpvChargesDiv" ).append( chargeDiv );
			}
			

			if(lhpvConfiguration.showOpeningKMSelection) 	
				$("#openingKM").css("display", "block");

			if (lhpvConfiguration.hideAdvanceFeildBasedOnOwnerType) {
				var hideIdArr = (lhpvConfiguration.hideAdvanceOwnerTypeIds).split(",");
				if (isValueExistInArray(hideIdArr, lorryHireObject.vehicleOwnerId)) {
					$("#charge5").closest(".row").hide();
				}
			}
	
			
			if(lhpvConfiguration.roundOffChargeAmount) {
				$("#charge" + RATE_PMT).val(Math.round(lorryHireObject.ratePerTon));
				$("#charge" + LORRY_HIRE).val(Math.round(lorryHireObject.totalLorryHireAmount));
				$("#charge" + ADVANCE_AMOUNT).val(Math.round(lorryHireObject.advanceAmount));
				$("#charge" + BALANCE_AMOUNT).val(Math.round(lorryHireObject.balanceAmount));
				
				if (lorryHireObject.tdsAmount > 0)
					$("#charge" + TDS).val(Math.round(lorryHireObject.tdsAmount));
			} else {
				$("#charge" + RATE_PMT).val(lorryHireObject.ratePerTon);
				$("#charge" + LORRY_HIRE).val(lorryHireObject.totalLorryHireAmount);
				$("#charge" + ADVANCE_AMOUNT).val(lorryHireObject.advanceAmount);
				$("#charge" + BALANCE_AMOUNT).val(lorryHireObject.balanceAmount);
				
				if (lorryHireObject.tdsAmount > 0)
					$("#charge" + TDS).val(lorryHireObject.tdsAmount);
			}
			
			$("#charge" + RATE_PMT).prop("readonly", true);
			$("#charge" + LORRY_HIRE).prop("readonly", true);
			$("#charge" + ADVANCE_AMOUNT).prop("readonly", true);
			$("#charge" + BALANCE_AMOUNT).prop("readonly", true);
			
			
			if(lhpvConfiguration.isAllowAlphnumericWithSpecialCharactersSeq) {
				$("#manualNumberEle").on('keyup', function(e) {
					_this.allowAlphaNumericAndSpecialCharacters(e, 'manualNumberEle');
				});
			}
			
			if(lhpvConfiguration.isAllowAlphaNumericOnly) {
				$("#manualNumberEle").on('keypress', function (e) {
					return _this.allowAlphaNumericOnly(e, 'manualNumberEle');
			});
			}
			
			$( ".calculation" ).bind("change", function() {
				_this.calculateTotal();
			});
			
			manualLHPVNod	= nod();
			manualLHPVNod.configure({
				parentClass		:'validation-message'
			});
			
			manualLHPVNod.add({
				selector		: '#manualNumberEle',
				validate		: 'presence',
				errorMessage	: 'Enter LHPV Number !'
			});
			
			if(lhpvConfiguration.isAllowOnlyNumeric) {
				manualLHPVNod.add({
					selector		: '#manualNumberEle',
					validate		: 'integer',
					errorMessage	: 'Enter Valid LHPV Number !'
				});
			}
			
			manualLHPVNod.add({
				selector		: '#manualDateEle',
				validate		: 'presence',
				errorMessage	: 'Select Manual LHPV Date !'
			});
			
			normalLHPVNod	= nod();
			normalLHPVNod.configure({
				parentClass		:'validation-message'
			});
			normalLHPVNod.add({
				selector		: '#materialsEle',
				validate		: 'presence',
				errorMessage	: 'Enter Materials !'
			});
			normalLHPVNod.add({
				selector		: '#remarkEle',
				validate		: 'presence',
				errorMessage	: 'Enter Remark !'
			});
			

			if(lhpvConfiguration.showOpeningKMSelection && lorryHireObject.vehicleOwnerId == OWN_VEHICLE_ID){
				normalLHPVNod.add({
					selector		: '#openingKMEle',
					validate        : 'checkForNumber:#openingKMEle',
					errorMessage	: 'Enter Oening KM !'
				});
			}

			keyObject = Object.keys(charges);
			
			for (const element of keyObject) {
				normalLHPVNod.add({
					selector		: '#' + element,
					validate		: 'presence',
					errorMessage	: 'Enter Proper Amount !'
				});
				if (element == ('charge' + UNLOADING_LHPV)) {
					normalLHPVNod.add({
						selector		: '#charge' + UNLOADING_LHPV,
						validate		: 'between-number:-99999:99999',
						errorMessage	: 'Enter Proper Amount !'
					});
				} else if (element == ('charge' + BALANCE_AMOUNT) && (!lhpvConfiguration.SwitchToRefundForNegativeBalance)) {
					normalLHPVNod.add({
						selector		: '#charge' + BALANCE_AMOUNT,
						validate		: 'between-number:0:99999',
						errorMessage	: 'Negative Value Not Allowed !'
					});
					
					$("#charge" + REFUND_AMOUNT).prop("readonly", true);
				} else {
					normalLHPVNod.add({
						selector		: '#' + element,
						validate		: 'between-number:0:999999',
						errorMessage	: 'Value Greater Than 999999 Or Less Than 0 Not Accepted  !'
					});
				}
			}
			
			$( "#saveBtn" ).bind("click", function() {
				if ($('#isManualEle').is(':checked')) {
					manualLHPVNod.performCheck();
					
					if(!manualLHPVNod.areAll('valid'))
						return;
					
					if(!_this.validateManualDateWithLorryHireDate(lorryHireObject)){
						showMessage('error','Manual LHPV Date earlier then Truck Engagement Date !');
						return;
					}
				}
				
				normalLHPVNod.performCheck();
			
				if(normalLHPVNod.areAll('valid')) {
					$("#saveBtn").addClass('hide');
					$("#saveBtn").attr("disabled", true);
					
					let jsonObject	= new Object();
					
					if (data.lhpvOperationSelection == 'true') 
						jsonObject.operationType		= $("#lhpvOperation").val();
					else
						jsonObject.operationType		= CREATE_ID;
					
					jsonObject.lhpvType					= $('#lhpvType').val();
					jsonObject.isSeqCounterPresent		= data.isSeqCounterPresent;
					
					if (data.isSeqCounterPresent || allowManualLHPVWithoutCounter) {
						jsonObject.isManualLHPV	= $('#isManualEle').is(':checked');
					
						if (jsonObject.isManualLHPV) {
							jsonObject.manualLHPVDate	= $("#manualDateEle").attr('data-date');
							jsonObject.manualLHPVNumber	= $("#manualNumberEle").val();
						}
					} else {
						jsonObject.isManualLHPV	= false;
					}
					
					jsonObject.vehicleNumberMasterId	= lorryHireObject.vehicleNumberMasterId;
					
					if(lhpvConfiguration.roundOffChargeAmount)
						jsonObject.totalAmount		= Math.round($("#charge" + BALANCE_AMOUNT).val());
					else
						jsonObject.totalAmount		= $("#charge" + BALANCE_AMOUNT).val()
					
					let keyObject = Object.keys(charges);
					
					for (const element of keyObject) {
						if(lhpvConfiguration.roundOffChargeAmount)
							jsonObject[element]		= Math.round($("#" + element).val());
						else
							jsonObject[element]		= $("#" + element).val();
					}
					
					jsonObject.balancePayableBranchId	= lorryHireObject.balancePayableAtBranchId;
					jsonObject.materials				= $("#materialsEle").val();
					jsonObject.DestinationBranchId		= lorryHireObject.destinationBranchId;
					jsonObject.paymentTypeId			= lorryHireObject.paymentType;
					
					if (lorryHireObject.paymentType != PAYMENT_TYPE_CASH_ID) {
						jsonObject.chequeDate			= lorryHireObject.chequeDateForUser;
						jsonObject.chequeNo				= lorryHireObject.chequeNumber;
						jsonObject.chequeAmount			= lorryHireObject.chequeAmount;
						jsonObject.bankName				= lorryHireObject.bankName;
					}
					
					jsonObject.remark					= $("#remarkEle").val();
					jsonObject.driverMasterId			= lorryHireObject.driverMasterId;
					jsonObject.driver2MasterId			= lorryHireObject.driver2MasterId;
					jsonObject.lorryHireId				= lorryHireObject.lorryHireId;
					
					if(lhpvConfiguration.showOpeningKMSelection)
						jsonObject.openingKM				= $("#openingKMEle").val();

					if(lhpvConfiguration.roundOffChargeAmount)
						jsonObject.tdsAmount	= Math.round($("#charge" + TDS).val());
					else
						jsonObject.tdsAmount	= $("#charge" + TDS).val();
					
					if(!doneTheStuff){
						let btModalConfirm = new Backbone.BootstrapModal({
							content		: 	"Are you sure you want to continue ?",
							modalWidth 	: 	30,
							title		:	'LHPV',
							okText		:	'YES',
							showFooter 	: 	true,
							okCloses	:	true
						}).open();

						btModalConfirm.on('ok', function() {
							if(!doneTheStuff) {
								getJSON(jsonObject, WEB_SERVICE_URL + '/LHPVWS/saveLHPV.do?', _this.onSaveLHPV, EXECUTE_WITH_ERROR);
								doneTheStuff = true;
								showLayer();
							}
						});

						btModalConfirm.on('cancel', function() {
							$("#saveBtn").removeClass('hide');
							$("#saveBtn").attr("disabled", false);
							doneTheStuff = false;
							hideLayer();
						});
				  }
				}
			});
			initialiseFocus();
			$("#createLHPVElements").css("display", "block");
		}, calculateTotal : function() {
			let chargeAmount 	= 0;
			chargeAmount 		= parseInt(0);
			
			if(!isNaN(parseInt($("#charge" + LORRY_HIRE).val())))
				chargeAmount = parseInt($("#charge" + LORRY_HIRE).val());
		
			let total	= parseInt(chargeAmount);
			
			$.each(addCharges, function( index, value ) {
				chargeAmount = parseInt(0);
				
				if(!isNaN(parseInt($("#" + value).val())))
					chargeAmount = parseInt($("#" + value).val());

				total += parseInt(chargeAmount)
			});
		
			$.each(subCharges, function( index, value ) {
				chargeAmount = parseInt(0);
				
				if(!isNaN(parseInt($("#" + value).val())))
					chargeAmount = parseInt($("#" + value).val());
				
				total -= parseInt(chargeAmount);
			});
			
			if(lhpvConfiguration.roundOffChargeAmount)
				$("#charge" + BALANCE_AMOUNT).val(Math.round(total));
			else
				$("#charge" + BALANCE_AMOUNT).val(total);
		}, onSaveLHPV : function(response) {
			hideLayer();
			
			if (response.lhpvId != undefined) {
				let MyRouter = new Marionette.AppRouter({});
				MyRouter.navigate('&modulename=lhpvAction&lhpvId='+response.lhpvId+'&lhpvNumber='+response.lhpvNumber+'&print=false',{trigger: true});
				location.reload();
			}
		}, allowAlphaNumericAndSpecialCharacters : function(evt, elementId) {
			let allowedChars 	= allowedSpecialCharacters;
			let returnType		= true;
			let specialChars	= allowedChars.split(",");

			let keynum 	= null;

			if(window.event){ // IE
				keynum = evt.keyCode || evt.charCode;
			} else if(evt.which){ // Netscape/Firefox/Opera
				keynum = evt.which;
			}

			let charStr = String.fromCharCode(keynum);
			
			if(keynum != null) {
				if(keynum == 8 || keynum == 13) {
					hideAllMessages();
					return true;
				} else if (/[a-zA-Z]/i.test(charStr) || keynum < 48 || keynum > 57 ) {
					if(/[a-zA-Z]/i.test(charStr) || isValueExistInArray(specialChars, Number(keynum))) {//calling from genericfunctions.js
						hideAllMessages();
						return true;
					} else {
						showMessage('warning', 'No other Character Allowed !');
						$('#' + elementId).val($('#' + elementId).val().substring(0, $('#' + elementId).val().length - 1));
						$('#' + elementId).focus();
						returnType = false;
					}
				}
			}
			
			return returnType;
		}, allowAlphaNumericOnly : function(evt, elementId) {

			    let key = evt.which || evt.keyCode;
			    let charStr = String.fromCharCode(key);

			    if (key === 8 || key === 13) {
			        hideAllMessages();
			        return true;
			    }

			    if (!/^[a-zA-Z0-9]$/.test(charStr)) {
			        showMessage('warning', 'Only alphanumeric characters allowed!');
			        $('#' + elementId).focus();
			        return false;
			    }

			    hideAllMessages();
			    return true;
			},validateManualDateWithLorryHireDate : function(lorryHireObject){
			let lorryHireDateTime  = lorryHireObject.lorryHireDateTimeStr;
				
			lorryHireDateTime  = lorryHireDateTime.split("-");
			lorryHireDateTime = new Date(lorryHireDateTime[2], parseInt(lorryHireDateTime[1],10) - 1, lorryHireDateTime[0]);
				
			let manualLorryHireDate = $('#manualDateEle').val();
			manualLorryHireDate = manualLorryHireDate.split("-");
			manualLorryHireDate = new Date(manualLorryHireDate[2], parseInt(manualLorryHireDate[1],10) - 1, manualLorryHireDate[0]);

			return lorryHireDateTime <= manualLorryHireDate;
		}
	};
});