/**
 * @Author Anant Chaudhary	14-04-2016
 * Seperated from WayBillSetReset.js
 */

function setSourceBranchAutoComplete() {
	
	var showOperationBranchInSourceSubregionWise = false;
	var regionIds 		= configuration.regionIdsForSourceBranchWork;
	var regionIdsArr 	= regionIds.split(",");

	showOperationBranchInSourceSubregionWise = configuration.regionWiseSourceBranchWork == 'true' && isValueExistInArray(regionIdsArr, executive.regionId);

	if (configuration.sourceBranchAutocomplete != 'true') {
		$('#sourceBranch').prop("autocomplete","on");
		return true;
	}

	$('#sourceBranch').prop("autocomplete","off");

	$("#sourceBranch").autocomplete({
		source: "Ajax.do?pageId=9&eventId=13&filter=24&branchType=2&responseFilter="+configuration.sourceBranchAutocompleteFlavour+"&showAllOperationBranchInSource="+configuration.showAllOperationBranchInSource+"&showAllDestinationBranchInSource="+configuration.showAllDestinationBranchInSource+"&showOperationBranchInSourceSubregionWise="+showOperationBranchInSourceSubregionWise,
		minLength: 2,
		delay: 10,
		autoFocus: true,
		select: function(event, ui) {
			if(ui.item.id != 0) {
				selectedSource 	= ui.item.id;
				var srcData 	= selectedSource.split("_");
				stateGSTCode 	= ui.item.StateGSTCode;

				var sourceBranchId		= parseInt(srcData[0]);
				sourceBranchStateId		= parseInt(srcData[2]);
				
				if(dispatchLedgerIdForManualLS > 0 && dispatchLedger != undefined && dispatchLedger.destinationBranchId == sourceBranchId) {
					setTimeout(function() {
						$('#sourceBranch').val(dispatchLedger.sourceBranch);
						$('#sourceBranchId').val(dispatchLedger.sourceBranchId);
					}, 100);
					
					showMessage('error', iconForErrMsg + ' Source Branch cannot be same as Dispatch Destination Branch !!');
					return;
				}

				$('#sourceBranchId').val(sourceBranchId);

				if(configuration.appendLrNumberWithBranchCode == 'true') {
					let branchCode = ui.item.branchCode;
					
					if(branchCode != null && branchCode != undefined){
						setTimeout(function() {
							$('#lrNumberManual').val(branchCode+'/');
						}, 200);
					}	
				}
				
				$('#sourceTypeOfLocation').val(ui.item.sourceLocationType);
				
				if(configuration.showExcludeCommissionOption == 'true') {
					let isAgentBranch	= ui.item.isAgentBranch;

					if(isAgentBranch != undefined && isAgentBranch) {
						$('#excludeCommissionPanel').show();
					} else {
						$('#excludeCommissionPanel').hide();
					}
				}
				
				if(configuration.consignorOrConsigneeGstRequiredForSourceBranchAgent == true || configuration.consignorOrConsigneeGstRequiredForSourceBranchAgent == 'true') {
					 isAgentBranchBoolean	= ui.item.isAgentBranch;
					if(isAgentBranchBoolean != undefined && isAgentBranchBoolean) {
						
						isAgentBranchBoolean	= ui.item.isAgentBranch;
						agentBranchId	= Number(ui.item.id.split("_")[0]);
					} else {
						isAgentBranchBoolean	= false;
						agentBranchId	= 0;
					}
				}

				getSourceBranchWiseManualLrSequence(sourceBranchId); //calling from lrSequenceCounter.js
				getAgentCommission(sourceBranchId);	//calling from rate.js
			}
		},
		response: function(event, ui) {
			setLogoutIfEmpty(ui);
		}
	});
}

function setDestinationAutoComplete() {
	var destSubRegionId	= 0;

	if(getValueFromInputField('destSubRegionId') != null)
		destSubRegionId	= getValueFromInputField('destSubRegionId');

	if (configuration.DestinationAutocomplete != 'true') {
		$('#destination').prop("autocomplete","on");
		return true;
	}

	$('#destination').prop("autocomplete","off");
	
	$("#destination").autocomplete({
		source: "DestinationBranchAutoCompleteForAjaxAction.do?pageId=9&eventId=27&branchType=2&isOwnBranchRequired="+configuration.isOwnBranchRequired+"&isOwnBranchWithLocationsRequired="+isOwnBranchLocationsRequired+"&locationId="+executive.branchId+"&responseFilter="+configuration.BookingDestinationutocompleteResponse+"&deliveryDestinationBy="+configuration.DeliveryDestinationBy+"&branchNetworkConfiguration="+configuration.BranchNetworkConfiguration+"&destinationSubRegionId="+destSubRegionId+"&doNotAllowSameCityBranchesInDestination="+configuration.doNotAllowSameCityBranchesInDestination,
		minLength: 2,
		delay: 10,
		autoFocus: true,
		select: function(event, ui) {
			if(ui.item.id != 0) {
				if(dispatchLedgerIdForManualLS > 0 && dispatchLedger != undefined && dispatchLedger.sourceBranchId == ui.item.id) {
					setTimeout(function() {
						$('#destination').val(dispatchLedger.destinationBranch);
						$('#destinationBranchId').val(dispatchLedger.destinationBranchId);
					}, 100);
					
					showMessage('error', iconForErrMsg + ' Destination Branch cannot be same as Dispatch Source Branch !!');
					return;
				}
				
				getDestinationBranchDetailsById(ui.item.id, ui.item.label);
			}	
		}, response: function(event, ui) {
			setLogoutIfEmpty(ui);
		}
	});
}

function setBillingBranchAutoComplete(){
	if (configuration.billingBranch != 'true') {
		$('#billingBranch').prop("autocomplete","on");
		return true;
	}
       		 
	$('#billingBranch').prop("autocomplete","off");

	$("#billingBranch").autocomplete({
    	source: "Ajax.do?pageId=9&eventId=13&filter=29&showOnlyPhysicalBranchOption=true&showOnlyActiveBranch=true",
		minLength: 2,
		delay: 10,
		autoFocus: true,
		select: function(event, ui) {
			if(ui.item.id != 0) {
				$('#billingBranchId').val(ui.item.id);
			}
		},
		response: function(event, ui) {
			setLogoutIfEmpty(ui);
		}
	});
	
}

function setSubRegionAutoComplete(){
	if (configuration.showSubRegionwiseDestinationBranchField != 'true') {
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
			
			if(ui.item.id != 0) {
				setSubRegion(ui.item.id, ui.item.label); // function defined in commonFunctionForCreateWayBill.js
			}
		},
		response: function(event, ui) {
			setLogoutIfEmpty(ui);
		}
	});
	
}

function setFreightUptoBranchAutoComplete() {

	if (configuration.FreightUptoBranchAutocomplete != 'true') {
		$('#freightUptoBranch').prop("autocomplete","on");
		return true;
	}

	$('#freightUptoBranch').prop("autocomplete","off");

	$("#freightUptoBranch").autocomplete({
		source: "Ajax.do?pageId=9&eventId=13&responseFilter="+configuration.BookingFreightUptoBranchAutocompleteResponse,
		minLength: 2,
		delay: 10,
		autoFocus: true,
		select: function(event, ui) {
			if(ui.item.id != 0) {
				$('#freightUptoBranchId').val(ui.item.id.split("_")[0]);
			}
		},
		response: function(event, ui) {
			setLogoutIfEmpty(ui);
		}
	});
}

function setVehicleNumberAutoComplete() {
	if (configuration.VehicleNumberAutoComplete != 'true') {
		$('#vehicleNumber').prop("autocomplete", "on");
		return true;
	}

	$('#vehicleNumber').prop("autocomplete", "off");

	if(configuration.addNewVehicleWhileBooking == 'true' || configuration.addNewVehicleWhileBooking == true) {
		vehicleType.url = WEB_SERVICE_URL + '/vehicleTypeWS/getVehicleType.do';
		vehicleType.field = 'name';
		vehicleType.primary_key = 'vehicleTypeId';
		$('#vehicleTypeEleFtl').autocompleteCustom(vehicleType);
	}
	
	$('#newVehicleNumberSubmitOnFtl').click(function() {
		saveNewVehicleDetailsFtl();
	});
	
	$("#vehicleNumber").autocomplete({
		source: "Ajax.do?pageId=9&eventId=13&filter=26&responseFilter=" +configuration.BookingVehicleNumberAutoCompleteResponse,
		minLength: 2,
		delay: 10,
		autoFocus: true,
		select: function(event, ui) {
			if (ui.item.id != 0) {
				if (configuration.VehicleType == 'true' || configuration.vehicleTypeAfterBookingType == 'true') {
					let vehicleTypeId 		= ui.item.vehicleTypeId;
					let vehicleTypeCapacity = ui.item.vehicleTypeCapacity;
					let vehicleTypeName 	= ui.item.vehicleTypeName;

					setVehicleTypeDetails(vehicleTypeId, vehicleTypeCapacity, vehicleTypeName);			//Called from WayBillSetReset.js
				}
			} else {
				if (configuration.addNewVehicleWhileBooking == 'true' || configuration.addNewVehicleWhileBooking == true) {
					setTimeout(function() {
						if (confirm("Vehicle does not exist, do you want to add?")) {
							$("#vehicleTypeEleFtl").empty();
							
							$("#addNewVehicleModalFtl").modal({
								backdrop: 'static',
								focus: this,
								keyboard: false
							});
							
							setTimeout(function() {
								$("#newVehicleNumber").focus();
							}, 600);
						}
						
						$('#newVehicleNumber').val('');
						$('#vehicleTypeEleFtl').val('');
						resetVehicleTypeOnVehicleNumber();
					}, 50);
				} else {
					setTimeout(function() {
						$('#vehicleNumber').val('');
						resetVehicleTypeOnVehicleNumber();
					}, 50);
				}
			}
		},
		response: function(event, ui) {
			setLogoutIfEmpty(ui);
		}
	});
}
		
function setConsignorNameAutoComplete() {
	if (configuration.ConsignorNameAutocomplete != 'true') {
		$('#consignorName').prop("autocomplete","on");
		return true;
	}

	$('#consignorName').prop("autocomplete","off");
	
	var setAutoForceForAutoComplete 	= true;

	if(configuration.SetAutoForceForAutoComplete == 'false')
		setAutoForceForAutoComplete	= false;
		
	var consignorAddressSuggetion		= configuration.showConsignorAddressSuggestion == 'true' || configuration.showConsignorAddressSuggestion == true;
		 
	if(configuration.fetchDataByRedisCache == true || configuration.fetchDataByRedisCache == 'true'){
		setConsignorAutoCompleteForBooking();
	}else{
		$("#consignorName").autocomplete({
			source: "PartyAutocompleteAjaxAction.do?pageId=9&eventId=18&partyType=1,3&customerType="+PartyMaster.PARTY_TYPE_CONSIGNOR+"&responseFilter="+configuration.BookingConsignorNameAutocompleteResponse+"&isBlackListPartyCheckingAllow="+configuration.isBlackListPartyCheckingAllow+"&moduleFilterForBlackListPartyChecking=1",
			minLength: 4,
			delay: 200,
			autoFocus: setAutoForceForAutoComplete,
			select: function(event, ui) {
				setPartyAutocomplete(ui, partyType, 'consigneeName');			//Called from WayBillSetReset.js
				
				if(configuration.overrideConsignorGSTNWithBillingPartyGSTNInTBB == 'true' 
					|| configuration.overrideConsignorGSTNWithBillingPartyGSTNInTBB == true){
					resetBillingParty();
				}
				
				validateConsignorNameInputOnBlur();
				
				if(consignorAddressSuggetion)
					$('#consignorAddressAutoCompleteField').hide();
				
				setNextPrevAfterConsignorName();
			}, open: function(){
				if(consignorAddressSuggetion)
					$('.ui-autocomplete').css('width', '250px'); // HERE
			}, focus: function( event, ui ) {
				if(consignorAddressSuggetion && ui.item.address != undefined)
					showLabelForConsignorAddressSuggestion( event, ui );
			}, response: function(event, ui) {
				setLogoutIfEmpty(ui);
			}
		});
	}
}

function setConsigneeNameAutoComplete() {
	if (configuration.ConsigneeNameAutocomplete != 'true') {
		$('#consigneeName').prop("autocomplete", "on");
		return true;
	}
	
	$('#consigneeName').prop("autocomplete", "off");

	var setAutoForceForAutoComplete 	= true;

	if(configuration.SetAutoForceForAutoComplete == 'false')
		setAutoForceForAutoComplete	= false;
		
	var isConsigneeAddressSuggetion = configuration.showConsigneeAddressSuggestion == 'true' || configuration.showConsigneeAddressSuggestion == true;

	if(configuration.fetchDataByRedisCache == true || configuration.fetchDataByRedisCache == 'true'){
		setConsigneeAutoCompleteForBooking();
	}else{
		$("#consigneeName").autocomplete({
			source: "PartyAutocompleteAjaxAction.do?pageId=9&eventId=18&partyType=2,3&customerType="+PartyMaster.PARTY_TYPE_CONSIGNEE+"&destinationId="+destinationBranchId+"&responseFilter="+configuration.BookingConsigneeNameAutocompleteResponse,
			minLength: 4,
			delay: 200,
			autoFocus: setAutoForceForAutoComplete,
			select: function(event, ui) {
				setPartyAutocomplete(ui, partyType, 'consigneePhn');			//Called from WayBillSetReset.js
				validateConsigneeNameInputOnBlur();
				
				if(isConsigneeAddressSuggetion)
					$('#consigneeAddressAutoCompleteField').hide();
			}, open: function() {
				if(isConsigneeAddressSuggetion)
					$('.ui-autocomplete').css('width', '250px'); // HERE
			}, focus: function(event, ui ) {
				if(isConsigneeAddressSuggetion && ui.item.address != undefined)
					showLabelForConsigneeAddressSuggestion( event, ui );
			}, response: function(event, ui) {
				setLogoutIfEmpty(ui);
			}
		});
	}

}

function setConsignorNameAutocompleteOnPanel2() {
	if (configuration.ConsignorNameAutocompleteOnPanelType2 != 'true') {
		$('#consignorName').prop("autocomplete", "on");
		return true;
	}

	$('#consignorName').prop("autocomplete", "off");

	if(configuration.fetchDataByRedisCache == true || configuration.fetchDataByRedisCache == 'true'){
		setConsignorAutoCompleteForBookingOnPanel2();
	}else{
		$("#consignorName").autocomplete({
			source: "PartyAutocompleteAjaxAction.do?pageId=9&eventId=18&partyType=1,3&customerType="+PartyMaster.PARTY_TYPE_CONSIGNOR+"&destinationId="+destinationBranchId+"&responseFilter="+configuration.BookingConsignorNameAutocompleteResponse,
			minLength: 3,
			delay: 10,
			autoFocus: true,
			select: function(event, ui) {
				setPartyAutocompleteOnPanel2(ui, partyType);			//Called from WayBillSetReset.js
			},
			response: function(event, ui) {
				setLogoutIfEmpty(ui);
			}
		});
	}
}

function setConsigneeNameAutocompleteOnPanel2() {
	if (configuration.ConsigneeNameAutocompleteOnPanelType2 != 'true') {
		$('#consigneeName').prop("autocomplete", "on");
		return true;
	}

	$('#consigneeName').prop("autocomplete", "off");

	if(configuration.fetchDataByRedisCache == true || configuration.fetchDataByRedisCache == 'true'){
		setConsigneeAutoCompleteForBookingOnPanel2();
	}else{
		$("#consigneeName").autocomplete({
			source: "PartyAutocompleteAjaxAction.do?pageId=9&eventId=18&partyType=2,3&customerType="+PartyMaster.PARTY_TYPE_CONSIGNEE+"&destinationId="+destinationBranchId+"&responseFilter="+configuration.BookingConsigneeNameAutocompleteResponse,
			minLength: 3,
			delay: 10,
			autoFocus: true,
			select: function(event, ui) {
				setPartyAutocompleteOnPanel2(ui, partyType);			//Called from WayBillSetReset.js
			},
			response: function(event, ui) {
				setLogoutIfEmpty(ui);
			}
		});		
	}
}

function setConsignorPhnAutoComplete() {
	if (configuration.ConsignorPhnAutocomplete != 'true') {
		$('#consignorPhn').prop("autocomplete","on");
		return true;
	}
	$('#consignorPhn').prop("autocomplete","off");

	if(configuration.fetchDataByRedisCache == true || configuration.fetchDataByRedisCache == 'true'){
		setConsignorPhnAutoCompleteForBooking();
	}else{
		$("#consignorPhn").autocomplete({
			source: "Ajax.do?pageId=9&eventId=18&isNumberAutocomplete=true&customerType="+PartyMaster.PARTY_TYPE_CONSIGNOR+"&destinationId="+destinationBranchId+"&responseFilter="+configuration.BookingConsignorPhnAutocompleteResponse+"&isBlackListPartyCheckingAllow="+configuration.isBlackListPartyCheckingAllow+"&moduleFilterForBlackListPartyChecking=1",
			minLength: 3,
			delay: 250,
			autoFocus: true,
			select: function(event, ui) {
				setPartyAutocomplete(ui, PartyMaster.PARTY_TYPE_CONSIGNOR, 'consignorName');		//Called from WayBillSetReset.js
			},
			response: function(event, ui) {
				setLogoutIfEmpty(ui);
			}
		});
	}
}

function setConsigneePhnAutoComplete() {
	var destinationBranchId	= 0;

	if(getValueFromInputField('destinationBranchId') != null) {
		destinationBranchId	= getValueFromInputField('destinationBranchId');
	}

	if (configuration.ConsigneePhnAutocomplete != 'true') {
		$('#consigneePhn').prop("autocomplete", "on");
		return true;
	}

	$('#consigneePhn').prop("autocomplete","off");

	if(configuration.fetchDataByRedisCache == true || configuration.fetchDataByRedisCache == 'true'){
		setConsigneePhnAutoCompleteForBooking();
	}else{
		$("#consigneePhn").autocomplete({
			source: "Ajax.do?pageId=9&eventId=18&isNumberAutocomplete=true&customerType="+PartyMaster.PARTY_TYPE_CONSIGNEE+"&destinationId="+destinationBranchId+"&responseFilter="+configuration.BookingConsigneePhnAutocompleteResponse,
			minLength: 3,
			delay: 250,
			autoFocus: true,
			select: function(event, ui) {
				setPartyAutocomplete(ui, PartyMaster.PARTY_TYPE_CONSIGNEE, 'consigneeName');		//Called from WayBillSetReset.js
			},
			response: function(event, ui) {
				setLogoutIfEmpty(ui);
			}
		});
	}
}

function setBillingPartyNameAutoComplete() {
	if (configuration.BillingPartyNameAutocomplete != 'true') {
		$('#billingPartyName').prop("autocomplete","on");
		return true;
	}

	$('#billingPartyName').prop("autocomplete","off");
	
	if(configuration.fetchDataByRedisCache == true || configuration.fetchDataByRedisCache == 'true'){
		setBillingPartyNameAutoCompleteForBooking();
	}else{
		$("#billingPartyName").autocomplete({
			source: "PartyAutocompleteAjaxAction.do?pageId=9&eventId=18&billing=4&customerType="+PartyMaster.PARTY_TYPE_CONSIGNOR+"&responseFilter="+configuration.BookingBillingPartyNameAutocompleteResponse+"&showRateConfiguredSignInPartyName="+configuration.ShowRateConfiguredSignInPartyName,
			minLength: 4,
			delay: 200,
			autoFocus: true,
			select: function(event, ui) {
				if(ui.item.id != 0) {
					if(ui.item.isPODRequired == true) {
						isPODRequiredBasedOnBillingParty = true;
						setPODRequiredFeild();
					} else {
						isPODRequiredBasedOnBillingParty = false;
						setPODRequiredFeild();
					}
					
					resetBillingPartyData();							//Called from WayBillSetReset.js

					getTBBPartyDetails(ui.item.id, TBB_BILLING);		//Called from Customer.js
					
					setTimeout(function(){
						getFlavourWiseRates(ui.item.id, PartyMaster.PARTY_TYPE_CONSIGNOR);			//Called from Rate.js
					}, 500);
				}
			},
			response: function(event, ui) {
				setLogoutIfEmpty(ui);
			}
		});
	}
}
	
function setConsignorGstnAutoComplete(){
	$('#consignoCorprGstn').prop("autocomplete","off");

	if(configuration.fetchDataByRedisCache == true || configuration.fetchDataByRedisCache == 'true'){
		setConsignorGstnAutoCompleteForBooking();
	}else{
		$("#consignoCorprGstn").autocomplete({
			source: "PartyAutocompleteAjaxAction.do?pageId=9&eventId=18&partyType=1,3&customerType="+PartyMaster.PARTY_TYPE_CONSIGNOR+"&responseFilter=3&isBlackListPartyCheckingAllow="+configuration.isBlackListPartyCheckingAllow+"&moduleFilterForBlackListPartyChecking=1&gstNumberWiseBooking="+configuration.gstNumberWiseBooking+"&isAllowNewGstNumberOnAutoSave="+configuration.isAllowNewGstNumberOnAutoSave+"&gstAutocompleteDataOnLast5CharacterOfGSTNumber="+configuration.gstAutocompleteDataOnLast5CharacterOfGSTNumber,
			minLength: 5,
			delay: 250,
			autoFocus: true,
			select: function(event, ui) {
				setPartyAutocomplete(ui, PartyMaster.PARTY_TYPE_CONSIGNOR, 'consigneeCorpGstn');			//Called from WayBillSetReset.js
			},response: function(event, ui) {
				setLogoutIfEmpty(ui);
			}
		});		
	}
	
}

function setConsigneeGstnAutoComplete(){
	
	var destinationBranchId = $('#destinationBranchId').val();
	
	$('#consigneeCorpGstn').prop("autocomplete","off");
	
	if(configuration.fetchDataByRedisCache == true || configuration.fetchDataByRedisCache == 'true'){
		setConsigneeGstnAutoCompleteForBooking();
	}else{
		$("#consigneeCorpGstn").autocomplete({
			source: "PartyAutocompleteAjaxAction.do?pageId=9&eventId=18&partyType=2,3&customerType="+PartyMaster.PARTY_TYPE_CONSIGNEE+"&destinationId="+destinationBranchId+"&responseFilter=3&gstNumberWiseBooking="+configuration.gstNumberWiseBooking+"&isAllowNewGstNumberOnAutoSave="+configuration.isAllowNewGstNumberOnAutoSave+"&gstAutocompleteDataOnLast5CharacterOfGSTNumber="+configuration.gstAutocompleteDataOnLast5CharacterOfGSTNumber,
			minLength: 5,
			delay: 250,
			autoFocus: true,
			select: function(event, ui) {
				setPartyAutocomplete(ui, PartyMaster.PARTY_TYPE_CONSIGNEE, 'consigneeName');			//Called from WayBillSetReset.js
			},response: function(event, ui) {
				setLogoutIfEmpty(ui);
			}
		});		
	}
	
}

function setSearchCollectionPersonAutoComplete() {

	if (configuration.SearchCollectionPersonAutocomplete != 'true') {
		$('#searchCollectionPerson').prop("autocomplete","on");
		return true;
	}

	$('#searchCollectionPerson').prop("autocomplete","off");

	$("#searchCollectionPerson").autocomplete({
		source: "Ajax.do?pageId=9&eventId=13&filter=13&branchId="+branchId+"&responseFilter="+configuration.BookingSearchCollectionPersonAutocompleteResponse,
		minLength: 2,
		delay: 10,
		autoFocus: true,
		select: function(event, ui) {
			if(ui.item.id != 0) {
				$("#selectedCollectionPersonId").val(ui.item.id);
			}
		},
		response: function(event, ui) {
			setLogoutIfEmpty(ui);
		}
	});
}

function setSaidToContainAutoComplete() {

	if (configuration.SaidToContainAutocomplete != 'true') {
		$('#saidToContain').prop("autocomplete","on");
		return true;
	}

	var typeofPacking	= $('#typeofPackingId').val();

	$('#saidToContain').prop("autocomplete","off");

	$("#saidToContain").autocomplete({
		source: "Ajax.do?pageId=9&eventId=13&filter=12&packingTypeId=" + typeofPacking + "&responseFilter="+configuration.BookingSaidToContainAutocompleteResponse + "&showSaidToContainByPackingType="+ configuration.showSaidToContainByPackingType,
		minLength: 2,
		delay: 250,
		autoFocus: true,
		select: function(event, ui) {
			if(ui.item.id != 0) {
				$("#consignmentGoodsId").val((ui.item.id).split("_")[0]);
				isConsignmentExempted			= (ui.item.id).split("_")[1];
				isConsignmentEWayBillExempted	= (ui.item.id).split("_")[2];
			} else {
				$("#consignmentGoodsId").val(0);
			}
		}, open: function(){
			$('.ui-autocomplete').css('width', '250px'); // HERE
		},
		response: function(event, ui) {
			setLogoutIfEmpty(ui);
		}
	});
}

function setPackingTypeAutoCompleters(){
	$("#typeofPacking").combobox({
		source: "Ajax.do?pageId=9&eventId=13&filter=27&responseFilter="+configuration.BookingSearchPackingTypeNameAutocompleteResponse,
		minLength: 2,
		delay: 10,
		autoFocus: true,
		select: function(event, ui) {
			var exists = 0 != $('#typeofPacking option[value='+ ui.item.id +']').length;

			if (exists) {
				$("#typeofPacking").val(ui.item.id);
				$("#typeofPackingId").val(ui.item.id);
			} else if ((ui.item.id) == undefined)
				ui.item.option.selected = true;
			else {
				createOption('typeofPacking', ui.item.id, ui.item.label);
				$("#typeofPacking").val(ui.item.id);
				$("#typeofPackingId").val(ui.item.id);
			}   


			if(configuration.showSaidToContainByPackingType == true || configuration.showSaidToContainByPackingType == 'true') {
				var typeofPacking	= $("#typeofPacking").val();
				
				if(configuration.SaidToContain == true || configuration.SaidToContain == 'true')
					setSourceToAutoComplete('saidToContain', "Ajax.do?pageId=9&eventId=13&filter=12&packingTypeId=" + typeofPacking + "&responseFilter="+configuration.BookingSaidToContainAutocompleteResponse + "&showSaidToContainByPackingType="+ configuration.showSaidToContainByPackingType);
				
				$("#saidToContain").val('');
				$("#consignmentGoodsId").val(0);
			} 
				 
			bindPackingTypeFunction();
		},
		response: function(event, ui) {
			setLogoutIfEmpty(ui);
		}
	});
}

function setPackingTypeAutoCompleterWithOutCombobox(){
	$('#typeofPacking').prop("autocomplete","off");

	$("#typeofPacking").autocomplete({
		source: "Ajax.do?pageId=9&eventId=13&filter=27&&responseFilter="+configuration.BookingSearchPackingTypeNameAutocompleteResponse,
		minLength: 2,
		delay: 10,
		autoFocus: true,
		select: function(event, ui) {
			if(ui.item.id != 0) {
				$("#typeofPackingId").val(ui.item.id);
				bindPackingTypeFunction();
			}
		}, open: function(){
			$('.ui-autocomplete').css('width', '250px'); // HERE
		},
		response: function(event, ui) {
			setLogoutIfEmpty(ui);
		}
	});
}

function showTooltipForPackingType() {
	if(configuration.showSelectedPackingTypeAndSaidToContainsInTooltip == true || configuration.showSelectedPackingTypeAndSaidToContainsInTooltip =='true') {
		$("#typeofPacking").on("change keydown focus", function () {
			if(this.value != '')
				showInfo(this, this.value);
			else
				showInfo(this,"Articles Type");
		});
		
		$("#saidToContain").on("change keydown focus", function () {
			if(this.value != '')
				showInfo(this, this.value);
			else
				showInfo(this, configuration.saidToContainsLebel);
		});
	}
}

function setDestinationBranchByCityAutocomplete() {
	var destinationBranchId				= 0;

	var destinationcityauto 			= Object();

	destinationcityauto.url				= 'Ajax.do?pageId=314&eventId=4&filter=1';
	destinationcityauto.field			= 'cityName';
	destinationcityauto.primary_key		= 'cityId';
	destinationcityauto.callBack		= callBackCity;

	$('#destinationCitySelectEle' ).autocompleteCustom();
	var destinationCitySelect 			= $('#destinationCitySelectEle').getInstance(); 

	var destinationBranchauto 			= Object();
	/* destinationBranchauto.url	= 'Ajax.do?pageId=314&eventId=4&filter=2&cityId='+$('#destinationCitySelectEle_primary_key').val(); */
	destinationBranchauto.field			= 'branchName';
	destinationBranchauto.primary_key	= 'branchId';
	destinationBranchauto.callBack		= callBackDestinationBranch;

	$('#destinationIdEle').autocompleteCustom(destinationBranchauto);
	var destinationBranchSelect 		= $('#destinationIdEle').getInstance();

	function callBackDestinationBranch(res) {
		destinationBranchId				= getValueFromInputField($(this).attr('id')+'_primary_key');

		getDestinationToSetConsigneeAutocomplete(destinationBranchId);
	}

	function callBackCity(res) {
		var url = 'Ajax.do?pageId=314&eventId=4&filter=2&cityId='+$('#'+$(this).attr('id')+'_primary_key').val();;
		$(destinationBranchSelect).setSourceToAutoComplete(url);
	}
}
function setCategoryType(){
	$.ajax({
		type		: "POST",
		url			: 'Ajax.do?pageId=9&eventId=13&filter=44&branchId=' + branchId,
		data		: '',
		dataType	: 'json',
		success		: function(data) {
			if(data != null)
			  getCategoryDetails(data);
		}
	})
}
function getCategoryDetails(data){
	createOption('categoryType', 0, '----Select----');
	
	for(const element of data) {
		createOption('categoryType', element.id, element.label)
	}
}

function getDestinationToSetConsigneeAutocomplete(destinationBranchId) {
	if(configuration.ConsigneeNameAutocompleteOnPanelType2 == 'true') {
		setSourceToAutoComplete('consigneeName', "PartyAutocompleteAjaxAction.do?pageId=9&eventId=18&partyType=2,3&customerType="+PartyMaster.PARTY_TYPE_CONSIGNEE+"&destinationId="+destinationBranchId+"&responseFilter="+configuration.BookingConsigneeNameAutocompleteResponse);
	}
}

function setDestinationAutocompleterForReverseEntry(){
	setSourceToAutoComplete('destination', "Ajax.do?pageId=9&eventId=13&filter=33&responseFilter="+GroupConfigurationProperties.AUTOCOMPLETE_RESPONSE_NORECORD);
}

function setSourceAutocompleterForReverseEntry(){
	if(configuration.BranchNetworkConfiguration == 'true'){
		setSourceToAutoComplete('sourceBranch', "Ajax.do?pageId=9&eventId=13&filter=34&branchId="+executive.branchId+"&responseFilter="+GroupConfigurationProperties.AUTOCOMPLETE_RESPONSE_NORECORD);
	} else {
		setSourceToAutoComplete('sourceBranch', "DestinationBranchAutoCompleteForAjaxAction.do?pageId=9&eventId=27&branchType=1&isOwnBranchRequired=false&isOwnBranchWithLocationsRequired=false&locationId="+executive.branchId+"&deliveryDestinationBy="+configuration.DeliveryDestinationBy+"&responseFilter="+GroupConfigurationProperties.AUTOCOMPLETE_RESPONSE_NORECORD);
	}
}

function setDestinationAutocompleter(){
	setSourceToAutoComplete('destination', "DestinationBranchAutoCompleteForAjaxAction.do?pageId=9&eventId=27&branchType=2&isOwnBranchRequired=false&isOwnBranchWithLocationsRequired="+isOwnBranchLocationsRequired+"&locationId="+executive.branchId+"&deliveryDestinationBy="+configuration.DeliveryDestinationBy+"&responseFilter="+configuration.BookingDestinationutocompleteResponse+"&branchNetworkConfiguration="+configuration.BranchNetworkConfiguration);
}

function setSourceAutocompleter(){
	setSourceToAutoComplete('sourceBranch', "Ajax.do?pageId=9&eventId=13&filter=24&branchType=2&responseFilter="+configuration.sourceBranchAutocompleteFlavour);
}

function setCreditorPartyNameInConsignor(){
	if (configuration.showTBBPartyNameInConsignor != 'true') {
		$('#consignorName').prop("autocomplete", "on");
		return true;
	}
	$('#consignorName').prop("autocomplete", "off");
	$('#consignorName').prop("autocomplete", "off");

	if(configuration.fetchDataByRedisCache == true || configuration.fetchDataByRedisCache == 'true'){
		setCreditorPartyNameInConsignorForBooking();
	}else{
		$("#consignorName").autocomplete({
			source: "PartyAutocompleteAjaxAction.do?pageId=9&eventId=18&billing=4&customerType="+PartyMaster.PARTY_TYPE_CONSIGNOR+"&responseFilter="+configuration.BookingBillingPartyNameAutocompleteResponse+"&showRateConfiguredSignInPartyName="+configuration.ShowRateConfiguredSignInPartyName,
			minLength: 3,
			delay: 250,
			autoFocus: true,
			select: function(event, ui) {
				if(ui.item.id != 0) {
					if(ui.item.isPODRequired == true) {
						isPODRequiredBasedOnBillingParty = true;
						setPODRequiredFeild();
					} else {
						isPODRequiredBasedOnBillingParty = false;
						setPODRequiredFeild();
					}
					resetBillingPartyData();							//Called from WayBillSetReset.js
					getFlavourWiseRates(ui.item.id, partyType);			//Called from Rate.js
					setPartyAutocomplete(ui, PartyMaster.PARTY_TYPE_CONSIGNOR, 'consignorName');		//Called from WayBillSetReset.js
				}
			},
			response: function(event, ui) {
				setLogoutIfEmpty(ui);
			}
		});
	}

}
function showLabelForConsignorAddressSuggestion(event, ui) {
	$('#consignorAddressAutoCompleteField').show();
	$("#consignorAddressAutoCompleteField").css("background-color","blanchedalmond");
	$('#consignorAddressLabel').text('Address :');
	var address = ui.item.address;
	if(address != undefined && address != null) {
		if (address.length > 60) {							
			$('#consignorAddressSpan').html((address).substring(0,60) + '..');
		} else {
			$('#consignorAddressSpan').html(address);
		}
	}
} 
function showLabelForConsigneeAddressSuggestion(event, ui) {
	$('#consigneeAddressAutoCompleteField').show();
	$("#consigneeAddressAutoCompleteField").css("background-color","blanchedalmond");
	$('#consigneeAddressLabel').text('Address :');
	var address = ui.item.address;
	if(address != undefined && address != null) {
		if (address.length > 60) {							
			$('#consigneeAddressSpan').html((address).substring(0,60) + '..');
		} else {
			$('#consigneeAddressSpan').html(address);
		}
	}
} 

$(document).click(function(){
	if(configuration.showConsigneeAddressSuggestion == 'true' ||
			configuration.showConsigneeAddressSuggestion == true){
		if($('#consignorAddressAutoCompleteField') != undefined){
			if($('#consignorAddressAutoCompleteField').css('display') != 'none' ){
				$('#consignorAddressAutoCompleteField').hide();
			}
		}
	}
});

function setSubRegion(subRegionId,subRegionName) {
	$('#destSubRegionId').val(subRegionId);
	$('#subRegion').val(subRegionName);
	//destSubRegionId	= subRegionId;

	if(subRegionId > 0) {
		if(configuration.showSubRegionwiseDestinationBranchField == 'true' && configuration.DeliveryDestinationDropdown  == 'true')
			setDestinationAutoCompleteForDropDown();
		else
			setDestinationAutoComplete();
	}	
} 
			
function setDestinationBranchComboboxAutocomplete() {	
	 var destinationauto = new Object();
	 
	destinationauto.url 			=  'Ajax.do?pageId=314&eventId=2&filter=1';
	destinationauto.field 			= 'branchName';
	destinationauto.primary_key 	= 'branchId';
	destinationauto.callBack		= getDestinationDetailsById;
	
	$("#destination").autocompleteCustom(destinationauto);
	
	function getDestinationDetailsById() {
		var id	= $('#' + $(this).attr('id') + '_primary_key').val();
		setDestinationDetails(id);
	}
	
}

function setDestinationDetails(branchId) {
	$.ajax({
		type		: "POST",
		url			: 'Ajax.do?pageId=314&eventId=2&filter=2&branchId=' + branchId,
		data		: '',
		dataType	: 'json',
		success		: function(data) {
			destBranch 					= data.branch;
			destBranchServiceTypeId 	= destBranch.branchServiceTypeId;
			getDestinationBranchDetails(data.id, data.label);
		}
	});
}

function getDestinationBranchDetailsById(id,label) {
	$.ajax({
		type		: "POST",
		url			: 'Ajax.do?pageId=314&eventId=2&filter=2&branchId=' + id.split("_")[0],
		data		: '',
		dataType	: 'json',
		success		: function(data) {
			destBranch 					= data.branch;
			destBranchServiceTypeId 	= destBranch.branchServiceTypeId;
			destSubRegion				= data.subRegion;
			setNextWayBillNumberByBranchCode();
			getDestinationBranchDetails(id, label);
		}
	});
}

function saveNewVehicleDetailsFtl() {
	let jsonObject	= new Object();
	
	jsonObject.vehicleNumber		= $("#newVehicleNumber").val();
	jsonObject.vehicleOwner			= configuration.defaultVehicleOwnerWhileSaveNewVehicle;
	jsonObject.vehicleTypeId		= $('#vehicleTypeEle_primary_key').val();
	jsonObject.routeType			= 3;
	jsonObject.vehicleAgentMasterId	= -1;
	jsonObject.registeredOwner		= "NA";
	jsonObject.moduleId		= BOOKING;

	$.ajax({
		type		: "POST",
		url			: WEB_SERVICE_URL+'/vehicleWS/saveVehicle.do',
		data		: jsonObject,
		dataType	: 'json',
		success: function(data) {
			if(data.message != undefined) {
				let errorMessage = data.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				
				if(errorMessage.type != 1)//success
					return;
			}

			if(data.vehicleNumberMasterId != undefined && data.vehicleNumberMasterId > 0) {
				$('#vehicleNumber').val(data.vehicleNumber);
				$('#selectedVehicleNumberMasterId').val(data.vehicleNumberMasterId);
				$('.modal-backdrop').hide();
				$('#addNewVehicleModalFtl').modal('hide');
				$('#vehicleNumber').focus();
				$('#vehicleNumberDiv').modal('hide'); 
			}

			if (configuration.VehicleType == 'true' || configuration.vehicleTypeAfterBookingType == 'true') {
				$('#vehicleType').focus();
				
				let vehicleTypeId		= $('#vehicleTypeEle_primary_key').val();
				let vehicleTypeCapacity	= "";
				let vehicleTypeName		= $('#vehicleTypeEleFtl').val();
	
				setVehicleTypeDetails(vehicleTypeId, vehicleTypeCapacity, vehicleTypeName);
			}
		}
	});
}

function setDestinationAutoCompleteForDropDown() {
	var destSubRegionId	= 0;

	if(getValueFromInputField('destSubRegionId') != null)
		destSubRegionId	= getValueFromInputField('destSubRegionId');

	let jsonObject = new Object();
	jsonObject.subRegionSelectEle_primary_key 	= destSubRegionId;
	jsonObject.branchType 						= "2,3";
	jsonObject.isDisplayOnlyActiveBranch 		= true;
	jsonObject.isDisplayDeActiveBranch	 		= false;
	jsonObject.displayOnlyPhysicalBranch 		= false;

	$.ajax({
		type: "POST",
		url: WEB_SERVICE_URL + '/selectOptionsWS/getSubRegionBranches.do',
		data: jsonObject,
		dataType: 'json',
		success: function(data) {
			if (data.message != undefined) {
				var errorMessage = data.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
			} else {
				setDestBranchList(data);
			}
		}
	});
}

function setDestBranchList(data) {
	let branchesList  =  data.sourceBranch.filter(function(branch) { return branch.branchId != executive.branchId;});

	removeOption('DestBranchIdEle', null);
	createOption('DestBranchIdEle', 0, '--Select Destination--');
	for(const element of branchesList) {
		createOption('DestBranchIdEle', element.branchId, element.branchName);
	}
}

function setConsignorAutoCompleteForBooking() {
	var consignorAddressSuggetion		= configuration.showConsignorAddressSuggestion == 'true' || configuration.showConsignorAddressSuggestion == true;

	$("#consignorName").autocomplete({
		 source: function (request, response) {
		       $.getJSON(WEB_SERVICE_URL + '/autoCompleteWS/getPartyDetailsAutocomplete.do?partyType=1,3&customerType='+PartyMaster.PARTY_TYPE_CONSIGNOR+'&responseFilter='+configuration.BookingConsignorNameAutocompleteResponse+'&isBlackListPartyCheckingAllow='+configuration.isBlackListPartyCheckingAllow+'&moduleFilterForBlackListPartyChecking=1&term='+request.term, function (data) {
		          if(data && data.result) {
		           response($.map(data.result, function (item) {
		               return {
		                   label			: item.corporateAccountDisplayName,
		                   value			: item.corporateAccountDisplayName,
		                   id				: item.corporateAccountId,
		                };
		            }));
		           }
		        });
		},select: function(event, ui) {
				setPartyAutocomplete(ui, partyType, 'consigneeName');			//Called from WayBillSetReset.js
				
				if(configuration.overrideConsignorGSTNWithBillingPartyGSTNInTBB == 'true' 
					|| configuration.overrideConsignorGSTNWithBillingPartyGSTNInTBB == true){
					resetBillingParty();
				}
				
				validateConsignorNameInputOnBlur();
				
				if(consignorAddressSuggetion)
					$('#consignorAddressAutoCompleteField').hide();
				
				setNextPrevAfterConsignorName();
			}, open: function(){
				if(consignorAddressSuggetion)
					$('.ui-autocomplete').css('width', '250px'); // HERE
			}, focus: function( event, ui ) {
				if(consignorAddressSuggetion && ui.item.address != undefined)
					showLabelForConsignorAddressSuggestion( event, ui );
			}, response: function(event, ui) {
				setLogoutIfEmpty(ui);
			},
			
		minLength	: 4,
		delay		: 200,
		autoFocus	: true
	});
}

function setConsigneeAutoCompleteForBooking(){
	var isConsigneeAddressSuggetion = configuration.showConsigneeAddressSuggestion == 'true' || configuration.showConsigneeAddressSuggestion == true;
	
	$("#consigneeName").autocomplete({
		 source: function (request, response) {
			 var destBranchId = $('#destinationBranchId').val();
		       $.getJSON(WEB_SERVICE_URL + '/autoCompleteWS/getPartyDetailsAutocomplete.do?partyType=2,3&customerType='+PartyMaster.PARTY_TYPE_CONSIGNEE+'&destinationBranchId='+destBranchId+'&responseFilter='+configuration.BookingConsigneeNameAutocompleteResponse+'&term='+request.term, function (data) {
		          if(data && data.result) {
		           response($.map(data.result, function (item) {
		               return {
		                   label			: item.corporateAccountDisplayName,
		                   value			: item.corporateAccountDisplayName,
		                   id				: item.corporateAccountId,
		                };
		            }));
		           }
		        });
			},select: function(event, ui) {
				setPartyAutocomplete(ui, partyType, 'consigneePhn');			//Called from WayBillSetReset.js
				validateConsigneeNameInputOnBlur();
				
				if(isConsigneeAddressSuggetion)
					$('#consigneeAddressAutoCompleteField').hide();
			}, open: function() {
				if(isConsigneeAddressSuggetion)
					$('.ui-autocomplete').css('width', '250px'); // HERE
			}, focus: function(event, ui ) {
				if(isConsigneeAddressSuggetion && ui.item.address != undefined)
					showLabelForConsigneeAddressSuggestion( event, ui );
			}, response: function(event, ui) {
				setLogoutIfEmpty(ui);
			},	
			minLength: 4,
			delay: 200,
			autoFocus: true,
	});
}

function setConsignorPhnAutoCompleteForBooking(){
	$("#consignorPhn").autocomplete({
		source: function (request, response) {
			var destBranchId = $('#destinationBranchId').val();
		       $.getJSON(WEB_SERVICE_URL + '/autoCompleteWS/getPartyDetailsAutocomplete.do?isNumberAutocomplete=true&customerType='+PartyMaster.PARTY_TYPE_CONSIGNOR+'&destinationBranchId='+destBranchId+'&responseFilter='+configuration.BookingConsignorPhnAutocompleteResponse+'&isBlackListPartyCheckingAllow='+configuration.isBlackListPartyCheckingAllow+'&moduleFilterForBlackListPartyChecking=1&term='+request.term, function (data) {
		          if(data && data.result) {
		           response($.map(data.result, function (item) {
		               return {
		                   label			: item.corporateAccountDisplayName,
		                   value			: item.corporateAccountDisplayName,
		                   id				: item.corporateAccountId,
		                };
		            }));
		           }
		        });
			},select: function(event, ui) {
				setPartyAutocomplete(ui, PartyMaster.PARTY_TYPE_CONSIGNOR, 'consignorName');		//Called from WayBillSetReset.js
			},
			response: function(event, ui) {
				setLogoutIfEmpty(ui);
			},
			minLength: 3,
			delay: 250,
			autoFocus: true,
	});
}

function setConsigneePhnAutoCompleteForBooking(){
	$("#consigneePhn").autocomplete({
		source: function (request, response) {
			var destBranchId = $('#destinationBranchId').val();
		       $.getJSON(WEB_SERVICE_URL + '/autoCompleteWS/getPartyDetailsAutocomplete.do?isNumberAutocomplete=true&customerType='+PartyMaster.PARTY_TYPE_CONSIGNEE+'&destinationBranchId='+destBranchId+'&responseFilter='+configuration.BookingConsigneePhnAutocompleteResponse+'&term='+request.term, function (data) {
		          if(data && data.result) {
		           response($.map(data.result, function (item) {
		               return {
		                   label			: item.corporateAccountDisplayName,
		                   value			: item.corporateAccountDisplayName,
		                   id				: item.corporateAccountId,
		                };
		            }));
		           }
		        });
			},select: function(event, ui) {
				setPartyAutocomplete(ui, PartyMaster.PARTY_TYPE_CONSIGNEE, 'consigneeName');		//Called from WayBillSetReset.js
			},
			response: function(event, ui) {
				setLogoutIfEmpty(ui);
			},
			minLength: 3,
			delay: 250,
			autoFocus: true,
	});	
}

function setConsignorAutoCompleteForBookingOnPanel2(){
	$("#consignorName").autocomplete({
		source: function (request, response) {
			var destBranchId = $('#destinationBranchId').val();
		       $.getJSON(WEB_SERVICE_URL + '/autoCompleteWS/getPartyDetailsAutocomplete.do?partyType=1,3&customerType='+PartyMaster.PARTY_TYPE_CONSIGNOR+'&destinationBranchId='+destBranchId+'&responseFilter='+configuration.BookingConsignorNameAutocompleteResponse+'&term='+request.term, function (data) {
		          if(data && data.result) {
		           response($.map(data.result, function (item) {
		               return {
		                   label			: item.corporateAccountDisplayName,
		                   value			: item.corporateAccountDisplayName,
		                   id				: item.corporateAccountId,
		                };
		            }));
		           }
		        });
			},select: function(event, ui) {
				setPartyAutocompleteOnPanel2(ui, partyType);			//Called from WayBillSetReset.js
			},
			response: function(event, ui) {
				setLogoutIfEmpty(ui);
			},
			minLength: 3,
			delay: 10,
			autoFocus: true
	});	
}

function setConsigneeAutoCompleteForBookingOnPanel2(){
	$("#consigneeName").autocomplete({
		source: function (request, response) {
			var destBranchId = $('#destinationBranchId').val();
		       $.getJSON(WEB_SERVICE_URL + '/autoCompleteWS/getPartyDetailsAutocomplete.do?partyType=2,3&customerType='+PartyMaster.PARTY_TYPE_CONSIGNEE+'&destinationBranchId='+destBranchId+'&responseFilter='+configuration.BookingConsigneeNameAutocompleteResponse+'&term='+request.term, function (data) {
		          if(data && data.result) {
		           response($.map(data.result, function (item) {
		               return {
		                   label			: item.corporateAccountDisplayName,
		                   value			: item.corporateAccountDisplayName,
		                   id				: item.corporateAccountId,
		                };
		            }));
		           }
		        });
			},select: function(event, ui) {
				setPartyAutocompleteOnPanel2(ui, partyType);			//Called from WayBillSetReset.js
			},response: function(event, ui) {
				setLogoutIfEmpty(ui);
			},
			minLength: 3,
			delay: 10,
			autoFocus: true,
	});	
}

function setConsignorGstnAutoCompleteForBooking() {
		$("#consignoCorprGstn").autocomplete({
			source: function (request, response) {
		       $.getJSON(WEB_SERVICE_URL + '/autoCompleteWS/getPartyDetailsAutocomplete.do?partyType=1,3&customerType='+PartyMaster.PARTY_TYPE_CONSIGNOR+'&responseFilter='+configuration.BookingConsignorGSTAutocompleteResponse+'&isBlackListPartyCheckingAllow='+configuration.isBlackListPartyCheckingAllow+'&moduleFilterForBlackListPartyChecking=1&gstNumberWiseBooking='+configuration.gstNumberWiseBooking+'&isAllowNewGstNumberOnAutoSave='+configuration.isAllowNewGstNumberOnAutoSave+'&term='+request.term+"&gstAutocompleteDataOnLast5CharacterOfGSTNumber="+configuration.gstAutocompleteDataOnLast5CharacterOfGSTNumber, function (data) {
		          if(data && data.result) {
		           response($.map(data.result, function (item) {
		               return {
		                   label			: item.corporateAccountDisplayName,
		                   value			: item.corporateAccountDisplayName,
		                   id				: item.corporateAccountId,
		                };
		            }));
		           }
		        });
			},select: function(event, ui) {
				setPartyAutocomplete(ui, PartyMaster.PARTY_TYPE_CONSIGNOR, 'consigneeCorpGstn');			//Called from WayBillSetReset.js
			},response: function(event, ui) {
				setLogoutIfEmpty(ui);
			},
			minLength: 5,
			delay: 250,
			autoFocus: true,
		});	
}

function setConsigneeGstnAutoCompleteForBooking() {
	$("#consigneeCorpGstn").autocomplete({
		source: function (request, response) {
			var destBranchId = $('#destinationBranchId').val();
		       $.getJSON(WEB_SERVICE_URL + '/autoCompleteWS/getPartyDetailsAutocomplete.do?partyType=2,3&customerType='+PartyMaster.PARTY_TYPE_CONSIGNEE+'&destinationBranchId='+destBranchId+'&responseFilter='+configuration.BookingConsigneeGSTAutocompleteResponse+'&gstNumberWiseBooking='+configuration.gstNumberWiseBooking+'&isAllowNewGstNumberOnAutoSave='+configuration.isAllowNewGstNumberOnAutoSave+'&term='+request.term+"&gstAutocompleteDataOnLast5CharacterOfGSTNumber="+configuration.gstAutocompleteDataOnLast5CharacterOfGSTNumber, function (data) {
		          if(data && data.result) {
		           response($.map(data.result, function (item) {
		               return {
		                   label			: item.corporateAccountDisplayName,
		                   value			: item.corporateAccountDisplayName,
		                   id				: item.corporateAccountId,
		                };
		            }));
		           }
		        });
			},select: function(event, ui) {
				setPartyAutocomplete(ui, PartyMaster.PARTY_TYPE_CONSIGNEE, 'consigneeName');			//Called from WayBillSetReset.js
			},response: function(event, ui) {
				setLogoutIfEmpty(ui);
			},
			minLength: 5,
			delay: 250,
			autoFocus: true,
	});
}

function setBillingPartyNameAutoCompleteForBooking(){
	$("#billingPartyName").autocomplete({
		source: function (request, response) {
		       $.getJSON(WEB_SERVICE_URL + '/autoCompleteWS/getPartyDetailsAutocomplete.do?billing=4&customerType='+PartyMaster.PARTY_TYPE_CONSIGNOR+'&responseFilter='+configuration.BookingBillingPartyNameAutocompleteResponse+'&showRateConfiguredSignInPartyName='+configuration.ShowRateConfiguredSignInPartyName+'&term='+request.term, function (data) {
		          if(data && data.result) {
		           response($.map(data.result, function (item) {
		               return {
		                   label			: item.corporateAccountDisplayName,
		                   value			: item.corporateAccountDisplayName,
		                   id				: item.corporateAccountId,
		                };
		            }));
		           }
		        });
			},select: function(event, ui) {
				if(ui.item.id != 0) {
					if(ui.item.isPODRequired == true) {
						isPODRequiredBasedOnBillingParty = true;
						setPODRequiredFeild();
					} else {
						isPODRequiredBasedOnBillingParty = false;
						setPODRequiredFeild();
					}
					
					resetBillingPartyData();							//Called from WayBillSetReset.js
	
					getTBBPartyDetails(ui.item.id, TBB_BILLING);		//Called from Customer.js
					
					setTimeout(function(){
						getFlavourWiseRates(ui.item.id, PartyMaster.PARTY_TYPE_CONSIGNOR);			//Called from Rate.js
					}, 500);
				}
			},response: function(event, ui) {
				setLogoutIfEmpty(ui);
			},
			minLength: 4,
			delay: 200,
			autoFocus: true,
	});
}

function setCreditorPartyNameInConsignorForBooking(){
	$("#consignorName").autocomplete({
		source: function (request, response) {
		       $.getJSON(WEB_SERVICE_URL + '/autoCompleteWS/getPartyDetailsAutocomplete.do?billing=4&customerType='+PartyMaster.PARTY_TYPE_CONSIGNOR+'&responseFilter='+configuration.BookingBillingPartyNameAutocompleteResponse+'&showRateConfiguredSignInPartyName='+configuration.ShowRateConfiguredSignInPartyName+'&term='+request.term, function (data) {
		          if(data && data.result) {
		           response($.map(data.result, function (item) {
		               return {
		                   label			: item.corporateAccountDisplayName,
		                   value			: item.corporateAccountDisplayName,
		                   id				: item.corporateAccountId,
		                };
		            }));
		           }
		        });
			},select: function(event, ui) {
				if(ui.item.id != 0) {
					if(ui.item.isPODRequired == true) {
						isPODRequiredBasedOnBillingParty = true;
						setPODRequiredFeild();
					} else {
						isPODRequiredBasedOnBillingParty = false;
						setPODRequiredFeild();
					}
					resetBillingPartyData();							//Called from WayBillSetReset.js
					getFlavourWiseRates(ui.item.id, partyType);			//Called from Rate.js
					setPartyAutocomplete(ui, PartyMaster.PARTY_TYPE_CONSIGNOR, 'consignorName');		//Called from WayBillSetReset.js
				}
			},response: function(event, ui) {
				setLogoutIfEmpty(ui);
			},
			minLength: 3,
			delay: 250,
			autoFocus: true,
	});
}

function setRecoveryBranchAutoComplete(){
	
	if(configuration.showRecoveryBranchForShortCredit == 'false') {
		$('#recoveryBranch').prop("autocomplete","on");
		return true;
	}

	$('#recoveryBranch').prop("autocomplete","off");

	$("#recoveryBranch").autocomplete({
		source: "Ajax.do?pageId=9&eventId=13&filter=29",
		minLength: 2,
		delay: 10,
		autoFocus: true,
		select: function(event, ui) {
			if(ui.item.id != 0) {
				$("#selectedRecoveryBranchId").val(ui.item.id);
			}
		}, response: function(event, ui) {
			setLogoutIfEmpty(ui);
		}
	});
}

function setSaidToContainAutocomplteByParty(billingPartyId) {
	if (configuration.SaidToContain == 'true' && configuration.showSaidToContainByTBBParty == 'true') {
		if (billingPartyId != 0)
			saidToContainCrediorWiseDropDown(billingPartyId);

		$("#saidToContain").val('');
		$("#consignmentGoodsId").val(0);
	}
}

function saidToContainCrediorWiseDropDown(corporateAccountId) {
	$.getJSON( WEB_SERVICE_URL + '/consignmentGoodsWS/getPartySaidToContainsMappingDetailsByPartyMasterId.do?corporateAccountId=' + corporateAccountId, function (data) {
		let goodsArray = data.consignmentGoodsListHM || [];
			
	if (goodsArray.length > 0) {

                $("#saidToContain").autocomplete({
                    source: goodsArray.map(item => ({
                        label: item.consignmentGoodsName,
                        value: item.consignmentGoodsName,
                        id: item.consignmentGoodsId
                    })),
                    minLength: 0,
                    messages: { noResults: '', results: () => '' },
                    response: (e, ui) => {
                        if (!ui.content.length) {
                            ui.content.push({
                                label: "No records found",
                                value: "No records found",
                                id: "NA"
                            });
                            showMessage('info', '<i class="fa fa-info-circle"></i> No records found, please try again.');
                        }
                    },
                    select: (e, ui) => {
                        if (ui.item.id === "NA") {
                            e.preventDefault(); 
                            return false;
                        }
                        $("#consignmentGoodsId").val(ui.item.id);
                    }
                }).focus(function () {
                    $(this).autocomplete("search", "");
                });
		} else {

			setSaidToContainAutoComplete();
			setSourceToAutoComplete('saidToContain',"Ajax.do?pageId=9&eventId=13&filter=12&responseFilter=" + configuration.BookingSaidToContainAutocompleteResponse);
		}
	});
}