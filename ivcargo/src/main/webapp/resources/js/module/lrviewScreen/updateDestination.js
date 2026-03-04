/**
 * @Author Anant Chaudhary	10-06-2016
 */

var destinationBranchModel			= new $.Deferred();	//
var subRegionDestinationModel		= new $.Deferred();	//
var freightUptoBranchModel			= new $.Deferred();	//
var destinationBranchWiseRateModel	= new $.Deferred();	//

var destinationWiseRateHM			= null;
var bookingCharges					= null;
var wayBillDetails					= null;
var wayBill							= null;

var jsondata						= null;
var configuration					= null;
var pincode							= 0;
var consigneeDetails				= null;
var rateApplyOnChargeType			= 0;
var isTokenLR						= false;
var groupConfig						= null;
var wayBill							= null;
var WayBillTypeConstant				= null;
var currentDestinationSuRegionId 	= 0;
var destBranch						= null;
var editDestinationWithoutChecking 	= false;
var EditLRRateConfiguration			= null;
var applyRate						= false;
var doneTheStuff 					= false;
var branchObjModel	 				= null;
var validateBookingGodownDelvryForBranches = false;
var wayBillTypeAndDestinationBranchWiseBooking = false;
var wayBillTypeAndDestinationWiseBookingPermission = false;
var doNotApplyRateAutomatically = false;

function loadPageToUpdateDestination(wayBillId) {
	showLayer();
	var jsonObject		= new Object();
	
	jsonObject.waybillId	= wayBillId;
	
	$.ajax({
		type		: 	"POST",
		url			: 	WEB_SERVICE_URL + '/updateLRDestinationWS/loadUpdateLRDestination.do',
		data		:	jsonObject,
		dataType	: 	'json',
		success		: 	function(data) {
			
			if(data.message != undefined) {
				hideLayer();
				var errorMessage = data.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				
				setTimeout(() => {
					window.close();
				}, 1500);
			}
			
			jsondata				= data;
			
			configuration			= jsondata.UpdateDestinationConfiguration;
			consigneeDetails		= jsondata.consigneeDetails;
			isTokenLR				= jsondata.isTokenLR;
			groupConfig				= jsondata.GroupConfiguration;
			groupConfiguration		= jsondata.GroupConfiguration;
			wayBill					= jsondata.wayBill;
			WayBillTypeConstant		= jsondata.WayBillTypeConstant;
			destBranch				= jsondata.destBranch;
			EditLRRateConfiguration	= jsondata.EditLRRateConfiguration
			applyRate				= EditLRRateConfiguration.ApplyRate;
			branchObjModel			= jsondata.branchObjModel;
			validateBookingGodownDelvryForBranches    	= groupConfig.validateBookingGodownDelvryForBranches;
			wayBillTypeAndDestinationBranchWiseBooking 	= groupConfig.wayBillTypeAndDestinationBranchWiseBooking;
			wayBillTypeAndDestinationWiseBookingPermission	= EditLRRateConfiguration.wayBillTypeAndDestinationWiseBookingPermission;
			doNotApplyRateAutomatically		= EditLRRateConfiguration.doNotApplyRateAutomatically;
			
			if(configuration.updateSubRegionDestinationWithBranch){
				$("#subRegionDestinationpanel").load( "/ivcargo/html/module/waybill/editDestination/subRegionDestinationPanel.html", function() {
					subRegionDestinationModel.resolve();
				});
			}
			
			$("#destinationBranchPanel").load( "/ivcargo/html/module/waybill/editDestination/destinationBranchPanel.html", function() {
				destinationBranchModel.resolve();
			});
			
			if(configuration.UpdateFreightUptoBranch) {
				$("#freightUptoBranchPanel").load( "/ivcargo/html/module/waybill/editDestination/freightUptoBranchPanel.html", function() {
					freightUptoBranchModel.resolve();
				});
			}
			
			if(applyRate) {
				$("#destinationBranchWiseRatePanel").load( "/ivcargo/html/module/waybill/editDestination/destinationBranchWiseRatePanel.html", function() {
					destinationBranchWiseRateModel.resolve();
				});
			}
			
			var loadelement 	= new Array();
			
			if(configuration.updateSubRegionDestinationWithBranch)
				loadelement.push(subRegionDestinationModel);
			
			loadelement.push(destinationBranchModel);
			
			if(configuration.UpdateFreightUptoBranch)
				loadelement.push(freightUptoBranchModel);
			
			if(applyRate)
				loadelement.push(destinationBranchWiseRateModel);
			
			// when apply load all ajax requests and done is call back function
			$.when.apply($, loadelement).done(function() {
				hideLayer();
				$('#wbDestBranchId').val(jsondata.destinationBranchId);
				$('#wbSrcBranchId').val(jsondata.sourceBranchId);
				$('#wayBillTypeId').val(jsondata.wayBill.wayBillTypeId);
				setDestinationAutocomplete('destination', wayBill.wayBillInfoBookingBranchId);
				setFreightUptoBranchAutoComplete('freightUptoBranch');
				
				if(configuration.updateSubRegionDestinationWithBranch)
					setSubRegionAutoComplete();
				
				if(applyRate && !isTokenLR)
					$('#applyRateDetails').removeClass('hide');
				
				if(configuration.allowToInsertRemark) {
					$('#updateRemark').removeClass('hide');
					if(!configuration.isRemarkMandatory) $('#remarkError').remove();
				} else
					$('#updateRemark').remove();
				
				//Calling from elementfocusnavigation.js file
				initialiseFocus();
				
				$('#currentDestinationSubRegionId').val(destBranch.subRegionId);
				
				if(configuration.updateSubRegionDestinationWithBranch)
					$('#subRegion').focus();
				else
					$('#destination').focus();
					
					
			}).fail(function() {
				console.log("Some error occured");
				hideLayer();
			});
		}
	});
}

function setSubRegionAutoComplete(){
	if (configuration.updateSubRegionDestinationWithBranch != true ) {
		$('#subRegion').prop("autocomplete","on");
		return true;
	}

	$('#subRegion').prop("autocomplete","off");
	
	$("#subRegion").autocomplete({
		source: "Ajax.do?pageId=9&eventId=13&filter=41",
		minLength: 2,
		delay: 10,
		autoFocus: true,
		select: function(event, ui) {
			$('#destinationBranchId').val(0);
			$('#destination').val('');
			if(ui.item.id != 0) {
				setSubRegion(ui.item.id, ui.item.label); // function defined in commonFunctionForCreateWayBill.js
			}
		},response: function(event, ui) {
			setLogoutIfEmpty(ui);
		}
	});
}

function setDestinationAutocomplete(eleId, srcBranchId) {
	var destSubRegionId                 = 0;
	
	if(getValueFromInputField('destSubRegionId') != null)
		destSubRegionId	= getValueFromInputField('destSubRegionId');
	
	$("#" + eleId).autocomplete({
		source: "DestinationBranchAutoCompleteForAjaxAction.do?pageId=9&eventId=27&branchType=2&isOwnBranchRequired=true&isOwnBranchWithLocationsRequired="+groupConfig.OwnBranchLocationsRequired+"&locationId="+srcBranchId+"&responseFilter=0&deliveryDestinationBy="+groupConfig.DeliveryDestinationBy+"&branchNetworkConfiguration="+groupConfig.BranchNetworkConfiguration+"&destinationSubRegionId="+destSubRegionId+"&doNotAllowSameCityBranchesInDestination="+groupConfig.doNotAllowSameCityBranchesInDestination,
		minLength: 2,
		delay: 10,
		autoFocus: true,
		select: function(event, ui) {
			if(ui.item.id != 0) {
				getDestination(ui.item.id);
			}
			
			if(configuration.calculateTaxOnSubRegion && groupConfig.subRegionIdsForOverNite != undefined && groupConfig.subRegionIdsForOverNite.length > 0) {
				var destData	 				= ui.item.id.split("_");
				var overNiteSubRegionIdList	 	= (groupConfig.subRegionIdsForOverNite).split(',');
				var checkSubRegion 				= isValueExistInArray(overNiteSubRegionIdList, Number(destData[6]));
				currentDestinationSuRegionId	= Number(destData[6]);
					
				if(checkSubRegion && wayBill.wayBillTypeId != WAYBILL_TYPE_PAID) {
					showMessage('info', 'You Are Allowed To Edit Destination For Paid LR Only !');
					$("#destination").focus();
					$("#destinationBranchId").val(0);
					return false;
				}
			}
			
			if(jsondata.showAlertAtUpdateDestination && wayBill.wayBillTypeId == WAYBILL_TYPE_TO_PAY)
				getBranchWisePrepaidAmountDetails(getDestinationBranchId(ui.item.id));

			if(wayBillTypeAndDestinationBranchWiseBooking && Number($('#destinationBranchId').val()) > 0 && !wayBillTypeAndDestinationWiseBookingPermission)
				checkWayBillTypeAndDestinationBranchWiseEditDestionation();
		},response: function(event, ui) {
			if(ui.content && ui.content.length < 1) {
				//alert('No Record Found !');
			}
		}
	});
	
}

function getDestinationBranchId(item) {
	var destData 		= (item).split("_");
	
	var destBranchId 	= parseInt(destData[0]);
	pincode				= parseInt(destData[7]);
	
	return destBranchId;
}

function getDestination(destBranchId) {
	$('#destinationBranchId').val(getDestinationBranchId(destBranchId));

	if(configuration.UpdateFreightUptoBranch && configuration.UpdateFreightUptoBranchAutocomplete)
		setSourceToAutoComplete('freightUptoBranch', "Ajax.do?pageId=9&eventId=13&filter=8&otherBranchIds="+getDestinationBranchId(destBranchId)+"&responseFilter=0");
	
	if(EditLRRateConfiguration.checkApplyRateAutomatically && !isTokenLR && !doNotApplyRateAutomatically)
		getRateToApplyInUpdateDestination();
}

function setFreightUptoBranchAutoComplete(eleId) {
	if (!configuration.UpdateFreightUptoBranchAutocomplete) {
		$('#freightUptoBranch').prop("autocomplete","on");
		return true;
	}

	$('#' + eleId).prop("autocomplete","off");

	$("#" + eleId).autocomplete({
		source: "Ajax.do?pageId=9&eventId=13&responseFilter="+configuration.FreightUptoBranchAutocompleteResponse,
		minLength: 2,
		delay: 10,
		autoFocus: true,
		select: function(event, ui) {
			if(ui.item.id != 0) {
				$('#freightUptoBranchId').val(ui.item.id.split("_")[0]);
			}
		},response: function(event, ui) {
			if(ui.content) {
				if(ui.content.length < 1) {
					//alert('No Record Found !');
				}
			}
		}
	});
}

function validateSameDestinationBranch() {
	var destinationBranchId		= $('#destinationBranchId').val();
	var wbDestBranchId 			= $('#wbDestBranchId').val();
	var wbSrcBranchId 			= $('#wbSrcBranchId').val();
	
	if(consigneeDetails.customerDetailsPincode != null)
		var wbDestBranchPincode	= consigneeDetails.customerDetailsPincode;
	
	if(groupConfig.DeliveryDestinationBy == 3) {
		if(wbDestBranchId == destinationBranchId && wbDestBranchPincode == pincode) {
			$('#destination').val('Delivery Destination');
			showMessage('info', sameDestinationBranchInfoMsg);
			return false;
		}
	} else if(wbDestBranchId == destinationBranchId) {
		resetDestinationPointData();
		$('#destination').val('Delivery Destination');
		showMessage('info', sameDestinationBranchInfoMsg);
			
		return false;
	}
	
	if(groupConfig.DeliveryDestinationBy == 3) {
		if(wbDestBranchId == destinationBranchId && wbDestBranchPincode == pincode) {
			$('#destination').val('Delivery Destination');
			showMessage('info', sameDestinationBranchInfoMsg);
			return false;
		} 
	} else if(wbSrcBranchId == destinationBranchId && !groupConfiguration.isOwnBranchRequired) {
		resetDestinationPointData();
		$('#destination').val('Delivery Destination');
		showMessage('info', sourceDestinationBranchNotBeSameInfoMsg);
			
		return false;
	}
	
	if(applyRate && !isTokenLR && $('#ApplyAutoRates').is(":checked") && freightAmount <= 0) { //freightAmount coming from editRate.js, globally defined
		alert('Rate not found !');
		return false;
	}
	
	if(configuration.calculateTaxOnSubRegion && currentDestinationSuRegionId != destBranch.subRegionId) {
		if(confirm('You are changing the destination of Other Region.Applicable Taxes and Amount will be change accordingly.'))
			editDestinationWithoutChecking = true;
		else
			return false;
	}
	
	doneTheStuff = true;
	$("#Update").addClass('hide');
	
	return confirm(updateDestinationConfirmMsg);
}

function validateSubRegion(){
	if(!validateProperSubRegionDestination(1, 'subRegion', 'subRegion'))
		return false;

	return true;
}

function ValidateFormElement() {
	if(!validateProperDestination(1, 'destinationBranchId', 'destination'))
		return false;
	
	if(!validateSameDestinationBranch()) {
		doneTheStuff = false;
		$("#Update").removeClass('hide');
		return false;
	}
	
	if(validateBookingGodownDelvryForBranches && !toValidateDeliveryAtGodown())
		return false;
	
	if(configuration.updateSubRegionDestinationWithBranch && !validateSubRegion())
		return false;
	
	if (configuration.allowToInsertRemark && configuration.isRemarkMandatory && !remark(1, 'remark'))
		return false;
	
	doneTheStuff = false;
	
	return true;
}

function resetDestinationPointData() {
	$('#destinationBranchId').val(0);
	
	if(applyRate && !isTokenLR && $('#ApplyAutoRates').is(":checked")) {//freightAmount coming from editRate.js, globally defined
		$('#destinationWiseRateDiv').switchClass('show', 'hide');
		$('#ApplyAutoRates').prop('checked', false);
	}
}

function updateDestination() {
	if(!ValidateFormElement())
		return false;

	$("#Update").addClass('hide');
	
	if(!doneTheStuff){
		doneTheStuff = true;
		var jsonObject		= new Object();
		
		var applyAutoRates				= false;
		
		jsonObject.filter				= 2;
		jsonObject.waybillId			= $('#wayBillId').val();
		jsonObject.wbDestBranchId		= $('#wbDestBranchId').val();
		jsonObject.wbSrcBranchId		= $('#wbSrcBranchId').val();
		jsonObject.destinationBranchId	= $('#destinationBranchId').val();
		jsonObject.freightUptoBranchId	= $('#freightUptoBranchId').val();
		jsonObject.wayBillTypeId		= $('#wayBillTypeId').val();
		jsonObject.STPaidBy				= $('#STPaidBy').val();
		jsonObject.redirectFilter		= $('#redirectFilter').val();
		jsonObject.rateApplyOnChargeType= rateApplyOnChargeType;
		jsonObject.remark				= $('#remark').val();
		
		if($('#ApplyAutoRates').is(":checked") && !isTokenLR) {
			applyAutoRates				= true;
			
			jsonObject.weightFreightRate	= weightFreightRate;
			
			var chargesColl = new Object(); 
			
			for ( var i = 0; i < bookingCharges.length; i++) {
				chargesColl['charge_' + bookingCharges[i].chargeTypeMasterId] = $('#wayBillCharge_' + bookingCharges[i].chargeTypeMasterId).val();
			}
			
			jsonObject.lrBookingCharges 	= JSON.stringify(chargesColl);
			jsonObject.qtyTypeWiseRateHM 	= qtyTypeWiseRateHM;
		}
		
		jsonObject.applyAutoRates		= applyAutoRates;
		
		if(consigneeDetails != null)
			jsonObject.customerDetailsId	= consigneeDetails.customerDetailsId;
		
		jsonObject.pincode							= pincode;
		jsonObject.editDestinationWithoutChecking	= editDestinationWithoutChecking;
		
		if(groupConfig.applyPartyCommissionFromPartyMaster && typeof partyIdForCommission !== 'undefined' && partyIdForCommission > 0)
			jsonObject.partyIdForCommission 		= partyIdForCommission;
			
		showLayer();
		
		$.ajax({
			type		 : 	"POST",
			url			: 	WEB_SERVICE_URL + '/updateLRDestinationWS/updateWayBillDestination.do',
			data		:	jsonObject,
			dataType	: 	'json',
			success		: 	function(data) {
				if(data.message != undefined) {
					var errorMessage = data.message;
					showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
					hideLayer();
					setTimeout(() => {
						redirectToAfterUpdate(data);
					}, 1000);
				}
				hideLayer();
			}
		});
	}
}

function checkChargeType() {
	return $('#ApplyAutoRates').is(":checked");
}

function setSubRegion(subRegionId,subRegionName) {
	$('#destSubRegionId').val(subRegionId);
	$('#subRegion').val(subRegionName);
	destSubRegionId	= subRegionId;
	
	if(destSubRegionId > 0)
		setDestinationAutocomplete('destination', wayBill.wayBillInfoBookingBranchId);
} 

function resetSubRegion() {
	if (configuration.updateSubRegionDestinationWithBranch) {
		$('#destinationBranchId').val(0);
		$('#destination').val('');
	}
}

function toValidateDeliveryAtGodown() {
	var subregionIdsForGodownDelvry				= (groupConfig.subregionIdsForGodownDelivery).split(",");
	var branchIdsForGodownDelvry				= (groupConfig.branchIdsForGodownDelivery).split(",");

	if(subregionIdsForGodownDelvry.length > 0 && branchIdsForGodownDelvry.length > 0) {
		var checkSubregionIdsForGodownDelvry 	= isValueExistInArray(subregionIdsForGodownDelvry, branchObjModel.subRegionId);
		var checkBranchIdsForGodownDelvry		= isValueExistInArray(branchIdsForGodownDelvry, destBranch.branchId);

		if(checkSubregionIdsForGodownDelvry && checkBranchIdsForGodownDelvry && wayBill.wayBillDeliveryTypeId == DELIVERY_TO_BRANCH_ID) {
			showMessage('error', "You can not change destination to " + destBranch.branchName + " if LR Booked for Godown.");
			return false;
		}
	}

	return true;
}

function getBranchWisePrepaidAmountDetails(destBranchId){
	var jsonObject		= new Object();
	jsonObject.branchId					= destBranchId;
	jsonObject.accountGroupId			= wayBill.wayBillAccountGroupId;
	jsonObject.isParentBranchDataNeeded	= true;
	jsonObject.deductBalanceFromHandlingBranchOfDestinationBranch	=	groupConfig.deductBalanceFromHandlingBranchOfDestinationBranch;

	$.ajax({
			type		: 	"POST",
			url			: 	'/ivwebservices/BranchWisePrepaidAmountWS/getBranchWisePrepaidAmountByBranchId.do',
			data		:	jsonObject,
			dataType	: 	'json',
			success		: 	function(data) {
				if(data.message != undefined){
					var errorMessage = data.message;
					showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
					hideLayer();
				} else {
					/*
					if(groupConfig.updateClosingBalanceInPrepaidAmount){
						var balance = Number(-data.rechargeAmount + data.branchLimit).toFixed(2);
					} else {
						var balance = Number(data.rechargeAmount + data.branchLimit).toFixed(2);
					}
					*/
					var balance = Number(data.rechargeAmount + data.branchLimit).toFixed(2);
					var parentBalance = 0;
					
					if(data.parentBranchRechargeAmt != undefined) 
						parentBalance = Number(data.parentBranchRechargeAmt + data.parentBranchLimit).toFixed(2);
					
				    if((Number(balance) + Number(parentBalance))  < 0)
						showMessage('error','Branch Balance Is In Negative');
				}
			}
		});
}

function checkWayBillTypeAndDestinationBranchWiseEditDestionation() {

	var jsonObject	= new Object();
	jsonObject.sourceBranchId		= jsondata.sourceBranchId;
	jsonObject.destinationBranchId	= Number($('#destinationBranchId').val());
	jsonObject.wayBillTypeId		= Number($('#wayBillTypeId').val());
	jsonObject.filter				= 7;
	
	var jsonStr	= JSON.stringify(jsonObject);
	
	$.getJSON("WayBillAjaxAction.do?pageId=3&eventId=13", {json:jsonStr}, function(data) {
		if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
			showMessage('error', iconForErrMsg + ' ' + data.errorDescription); // show message to show system processing error massage on top of the window.
			hideLayer();
		} else if(!data.flag) {
			showMessage('error', iconForErrMsg + '<b style="font-size : 20px;">You are not allow to Change destination to ' + $("#destination").val() + ' for ' + wayBill.waybillTypeName + ' LR !</b>');
			$('#destination').val('');
			$('#destinationBranchId').val('0')
			$('#destination').focus();
		}
	});	
}
