/**
 * 
 */

//add route wise charges with multiple areas or branches in rate master. save if new update if exist.
function addRouteWiseCharge() {
	if (!routeWiseValidation()) return false;
	
	if($('#chargesApplicableForRouteWisePanel').is(':visible')
		&& !validateFieldsRouteWise($('#routeAmount').attr('id'), $('#chargesApplicableForRouteWise').attr('id')))
		return false;

	$.confirm({
		text: "Are you sure you want to save Charge ?",
		confirm: function() {
			showLayer();
			let jsonObject		= new Object();
			
			getElementDataForInsertView(jsonObject);
			
			$.ajax({
				type		: 	"POST",
				url			: 	WEB_SERVICE_URL + '/rateMasterWS/insertRouteWiseRateRates.do',
				data		:	jsonObject,
				dataType	: 	'json',
				success		: 	function(data) {
					if(data.message != undefined) {
						let errorMessage = data.message;
						showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
						$('#rateConfigured').prop("checked", $('#partyId').val() > 0);
						resetRouteWiseCharges();
						resetFieldsRouteWise($('#routeAmount').attr('id'), $('#chargesApplicableForRouteWise').attr('id'));
						hideLayer();
						return;
					} else
						$('#rateConfigured').prop("checked", false);
					
					if(rateMasterConfiguration.setFixChargeRate)
						$('#rateConfigured').prop("checked", false);
					
					hideLayer();
				}
			});
		},
		cancel: function() {
			return false;
		},
		dialogClass			: "modal-dialog modal-sm",
		position			: 'center',
		confirmButton		: 'Yes',
		cancelButton		: 'NO',
		confirmButtonClass	: 'btn-info',
		cancelButtonClass	: 'btn-danger'
	});	
}

function getElementDataForInsertView(jsonObject) {
	if(rateMasterConfiguration.setFixChargeRate)
		jsonObject["chargedFixed"]	 		= $('#isChargedFixed').prop('checked');
			
	jsonObject["branchId"]				= $('#branchId').val();
	jsonObject["corporateAccountId"]	= $('#partyId').val();
	jsonObject["chargeTypeMasterId"]	= $('#chargesDropDown2').val();
	jsonObject["bookingType"]			= $('#bookingType').val();
	jsonObject["corporateAccountIds"]	= getSelectedPartyIdsOnGstn();

	if($('#bookingType').val() == BOOKING_TYPE_FTL_ID && !rateMasterConfiguration.ShowVehicleType)
		jsonObject["vehicleTypeId"]		= 1;
	else
		jsonObject["vehicleTypeId"]		= $('#vehicleType').val();
			
	jsonObject["chargeTypeId"]			= $('#chargeType').val();
	jsonObject["billSelectionId"] 		= $('#billSelection').val();
	jsonObject["sourceCityId"] 			= $('#cityId').val();
	jsonObject["destinationCityId"] 	= $('#destinationCityId').val();
			
	if ((rateMasterConfiguration.slabWisePackingTypeWork && (getValueFromInputField('slabs') == '0-0' || getValueFromInputField('slabs') == '0'))
		|| (!rateMasterConfiguration.slabWisePackingTypeWork)) {
		jsonObject["packingGrpTypeIds"]	= getPackingGroupTypeIds();
		jsonObject["packingTypeIds"]	= getPackingTypeIds($("#articleType option:selected"));
	}

	jsonObject["consignmentGoodsId"]			= $('#consignmentGoodsId').val();
	jsonObject["slabs"]							= $('#slabs').val();
	jsonObject["rate"] 							= $('#routeAmount').val();
	jsonObject["destination"]					= $('#destination').val();
	jsonObject["categoryTypeId"]				= $('#categoryType').val();
	jsonObject["wayBillTypeId"]					= $('#wayBillType').val();
	jsonObject["ConsigneeCorporateAccountId"]	= $('#consigneePartyId').val();
	jsonObject["transportationModeId"]			= $('#transportationMode').val();
	jsonObject["cftRate"] 						= $('#cftAmount').val();
	jsonObject["chargedPercent"] 				= $("#percentChecked").is(":checked"); 
	jsonObject["applicableOn"] 					= $('#chargesApplicableForRouteWise').val(); 
	jsonObject["visibleRate"]	 				= $('#visibleAmount').val();
	jsonObject["branchServiceTypeId"]	 		= $('#branchServiceTypeId').val();
	jsonObject["deliveryToId"]	 				= $('#deliveryToId').val();
		
	let checkBoxArray	= new Array();
		
	$("input[name=multiIdCheckBox]").each( function () {
		checkBoxArray.push($(this).val());
	});

	jsonObject["destinationIds"]		= checkBoxArray.join(',');
	jsonObject["isFixedSlabAmt"] 		= $("#isFixedSlabAmt").is(":checked"); 
	jsonObject["sourceRegionId"] 		= $('#regionId').val();
	jsonObject["destinationRegionId"] 	= $('#destinationRegionId').val();

	if(typeof $('#validFromEle').val() != 'undefined' && $('#validFromEle').val() !== "")
		jsonObject["fromDate"]				= dateWithDateFormatForCalender($('#validFromEle').val(), '-');
	
	if(typeof $('#validTillEle').val() != 'undefined' && $('#validTillEle').val() !== "")
		jsonObject["toDate"]				= dateWithDateFormatForCalender($('#validTillEle').val(), '-');
}

function validateFieldsRouteWise(textBox, select2) {
	if(!validateInput(1, textBox, textBox, 'basicError', 'Please, Insert charge greater than zero !'))
		return false;
	
	return validateInput(1, select2, select2, 'basicError', 'Select Applicable on !');
}

function resetFieldsRouteWise(textBox, select2) {
	$(textBox).val("");
	$("#percentChecked").prop("checked", false);
	$(select2).val(0);
	$('#chargesApplicableForRouteWisePanel').hide();
	
	if(typeof $('#validFromEle').val() != 'undefined' && $('#validFromEle').val() !== "")
		 $('#validFromEle').val("");
      
	if(typeof $('#validTillEle').val() != 'undefined' && $('#validTillEle').val() !== "")
		  $('#validTillEle').val("");
}

function addSlabWiseRouteCharge() {
	if (!routeWiseSlabValidation()) return false;
	
	$.confirm({
		text: "Are you sure you want to save Charge ?",
		confirm: function(){
			showLayer();
			let jsonObject		= new Object();
			jsonObject["branchId"]						= $('#branchId').val();
			jsonObject["corporateAccountId"]			= $('#partyId').val();
			jsonObject["slabs"]							= $('#routeSlabs').val();
			jsonObject["destination"]					= $('#slabWiseRoutedestination').val();
			jsonObject["categoryTypeId"]				= $('#categoryType').val();
			jsonObject["slabWiseMinWeight"]				= $('#minRouteAmount').val();
			jsonObject["slabWiseIncreasedAmtPerSqft"]	= $('#extraAmtPerSqft').val();
			jsonObject["slabWiseIncreasedAmtPerKg"]		= $('#increasedAmountPerKg').val();
			
			let lrcharges 	= new Object(); 

			for (const element of charges) {
				if(jQuery.inArray(element.chargeTypeMasterId, lrLevelCharges) != -1
					&& $('#routecharge' + element.chargeTypeMasterId).val() > 0)
						lrcharges[element.chargeTypeMasterId] = $('#routecharge' + element.chargeTypeMasterId).val() + '_' + $('#chargeUnit' + element.chargeTypeMasterId).val();
			}

			jsonObject.lrcharges = JSON.stringify(lrcharges);
			
			let checkBoxArray	= new Array();
			
			$("input[name=slabWiseDestMultiIdCheckBox]").each( function () {
				checkBoxArray.push($(this).val());
			});

			jsonObject["destinationIds"]	= checkBoxArray.join(',');

			$.ajax({
				type		: 	"POST",
				url			: 	WEB_SERVICE_URL + '/rateMasterWS/insertRouteWiseSlabRates.do',
				data		:	jsonObject,
				dataType	: 	'json',
				success		: 	function(data) {
					if(data.message != undefined) {
						let errorMessage = data.message;
						showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
						resetSlabWiseRouteCharges();
						hideLayer();
						return;
					} 
					hideLayer();
				}
			});
		},
		cancel: function() {
			return false;
		},
		dialogClass			: "modal-dialog modal-sm",
		position			: 'center',
		confirmButton		: 'Yes',
		cancelButton		: 'NO',
		confirmButtonClass	: 'btn-info',
		cancelButtonClass	: 'btn-danger'
	});
	
}

function getPackingTypeIds(selected) {

	let  packingTypeIds			= [];
	
	selected.each(function () {
		if($(this).val() > 0)
			packingTypeIds.push($(this).val())
	});
	
	return packingTypeIds.join(',');
}

function getPackingGroupTypeIds() {
	let  packingGroupTypeIds	= [];
	let selected				= $("#packingGroupType option:selected");
	
	selected.each(function () {
		if($(this).val() > 0)
			packingGroupTypeIds.push($(this).val());
	});
	
	return packingGroupTypeIds.join(",");
}

function resetRouteWiseCharges() {
	$('#multiIdlist').empty();
	$('#routeAmount').val("0");
	$("#destination").trigger( "onchange" );
	setSlabWiseRateConfig();
	
	if(typeof $('#validFromEle').val() != 'undefined' && $('#validFromEle').val() !== "")
		$('#validFromEle').val("");

	if(typeof $('#validTillEle').val() != 'undefined' && $('#validTillEle').val() !== "")
		$('#validTillEle').val("");
}

function resetSlabWiseRouteCharges(){
	$('#slabWiseDestMultiIdlist').empty();
	$('#minRouteAmount').val("0");
	$('#routeSlabs').val("0");
	$('#extraAmtPerSqft').val("0");
	$('#slabWiseLoadingPerArt').val("0");
	$('#increasedAmountPerKg').val("0");
	$("#slabWisedestinationBranch").trigger( "onchange" );
}

function changeOnChargeType() {
	let chargeType		= $('#chargeType').val();
	
	if (chargeType == CHARGETYPE_ID_WEIGHT || chargeType == 0 || chargeType == CHARGETYPE_ID_FIX || chargeType == CHARGETYPE_ID_CFT || chargeType == CHARGETYPE_ID_CBM) {
		if(rateMasterConfiguration.isWeightRateOnArticleGroup) {
			if(rateMasterConfiguration.PackingGroupTypeMaster) {
				showPartOfPage('packingGroupTypeMasterPanel');
				showArticleTypePanel();
			} else
				showPartOfPage('articleTypePanel');

			changeOnPackingTypeGroup();
		} else {
			if(rateMasterConfiguration.isWeightRateOnPackingType) {
				showPartOfPage('articleTypePanel');

				if(rateMasterConfiguration.showSaidToContainPanelOnChargeTypeArticle)
					showPartOfPage('saidToContainPanel');
						
				changeOnPackingTypeGroup();
			} else {
				refreshAndHidePartOfPage('articleTypePanel', 'hide');
				refreshAndHidePartOfPage('saidToContainPanel','hide');
			
				destroyMultiselectPackingType();
				removeOption('articleType',null);
				$('#saidToContain').val("");
				$('#consignmentGoodsId').val("0")
			}
			
			if(rateMasterConfiguration.PackingGroupTypeMaster) {
				refreshAndHidePartOfPage('packingGroupTypeMasterPanel', 'hide');
				setComboBoxIndex('packingGroupType', 0)
			}
		}
	} else if (chargeType == CHARGETYPE_ID_QUANTITY) {
		if(PackingGroupTypeMaster) {
			showPartOfPage('packingGroupTypeMasterPanel');
			
			if(rateMasterConfiguration.showSpecificArticlePanelCheckBox)
				showPartOfPage('specificArticlePanel');
		} else
			showPartOfPage('articleTypePanel');

		if(rateMasterConfiguration.showSaidToContainPanelOnChargeTypeArticle)
			showPartOfPage('saidToContainPanel');
		
		changeOnPackingTypeGroup();
		
		$('#perKMRatePanel').css('display','none');
	} else if(chargeType == CHARGETYPE_ID_KILO_METER) {
		refreshAndHidePartOfPage('packingGroupTypeMasterPanel', 'hide');
		refreshAndHidePartOfPage('articleTypePanel', 'hide');
		refreshAndHidePartOfPage('saidToContainPanel','hide');
		
		destroyMultiselectPackingType();
		removeOption('articleType',null);
		$('#saidToContain').val("");
		$('#consignmentGoodsId').val("0")
	}
	
	if(rateMasterConfiguration.cftChargePanel)
		$('#cftAmountFeildPanel').css('display','block');
}

function changeOnPackingTypeGroup() {
	var packingTypeMastersArray			= null;
	var packingGroupTypeId				= $('#packingGroupType').val();
	
	if(PackingGroupTypeMaster) {
		if(packingGroupTypeId == 0)
			packingTypeMastersArray = packingType; //getting from RateMasterNew.js
		else if (packingGroupMappingObjectListHM && packingGroupMappingObjectListHM.hasOwnProperty(packingGroupTypeId))
			packingTypeMastersArray = packingGroupMappingObjectListHM[packingGroupTypeId];
		else if (packingGroupTypeId != null)
			packingTypeMastersArray = packingType; //getting from RateMasterNew.js
	} else
		packingTypeMastersArray = packingType;
	
	setArticleType(packingTypeMastersArray);
}

function setArticleType(packingTypeMastersArray) {
	removeOption('articleType', null);

	if(!jQuery.isEmptyObject(packingTypeMastersArray)) {
		for(const element of packingTypeMastersArray) {
			if(element.packingTypeMasterId)
				createOption('articleType', element.packingTypeMasterId, element.name);
			else if(element.typeOfPackingMasterId)
				createOption('articleType', element.typeOfPackingMasterId, element.packingTypeName);
		}
	}
	
	multiselectPackingType();
}

function destroyMultiselectPackingType(){
	$("#articleType").multiselect('destroy');
}

function destroyMultiselectPackingGroupType(){
	$("#packingGroupType").multiselect('destroy');
}

function multiselectPackingType(){
	destroyMultiselectPackingType();
	$('#articleType').multiselect({
		includeSelectAllOption: true,
		maxHeight: 200,
		overflowX : 'auto',
		width : 250,
		labelPadding : '0px 10px 3px 10px'
	})
}

function multiselectPackingGroupType(){
	destroyMultiselectPackingGroupType();
	$('#packingGroupType').multiselect({
		includeSelectAllOption: true,
		maxHeight: 200
	})
}


function setPackingGroupType() {
	removeOption('packingGroupType', null);

	var packingGroupTypeMasterArray = jsondata.packingGroupTypeMasterArray;

	if(packingGroupTypeMasterArray && !jQuery.isEmptyObject(packingGroupTypeMasterArray)) {
		for(const element of packingGroupTypeMasterArray) {
			createOption('packingGroupType', element.packingGroupTypeId, element.packingGroupTypeName);
		}
	}
	
	multiselectPackingGroupType();
}

function showArticleTypePanel() {
	var chargeType		= getValueFromInputField('chargeType');
	var specificArticle = document.getElementById("specificArticle");
	
    if (specificArticle.checked && chargeType == ChargeTypeConstant.CHARGETYPE_ID_QUANTITY) {
    	multiselectPackingType();
    	changeOnPackingTypeGroup();
    	showPartOfPage('articleTypePanel');
    } else {
    	specificArticle.checked	= false;
    	
    	if (chargeType == ChargeTypeConstant.CHARGETYPE_ID_WEIGHT || chargeType == 0)
    		refreshAndHidePartOfPage('specificArticlePanel', 'hide');
    	
        refreshAndHidePartOfPage('articleTypePanel', 'hide');
        destroyMultiselectPackingType();
		removeOption('articleType',null);
    }
}

function changeOnWayBillType() {
	var wayBillType	= Number($('#wayBillType').val());
	
	var wayBillTypeIds		= rateMasterConfiguration.allowPartyToPartyRateForAllLRType;

	if(wayBillTypeIds != undefined) {
		var wayBillTypeList 	= wayBillTypeIds.split(',');
		var checkWayBillType 	= isValueExistInArray(wayBillTypeList, wayBillType);
	}
	
	if(checkWayBillType)
		$('#consigneePartyName').removeClass('hide');
	else {
		$('#consigneePartyName').addClass('hide');
		$('#consigneePartyId').val(0);
		$('#consigneePartyName').val('');
	}
}

//get route wise rates to edit
function getRouteWiseCharges() {
	if(!validateMainSection(1)) return false;
	
	if(rateMasterConfiguration.validateDestinationSelectionOnEditAndViewRoutesRate) {
		if(!validateRouteDestination()) return false;
		if(!validateRouteWiseDestinationTypes()) return false;
	}

	showLayer();

	var jsonObject				= new Object();
	
	getElementDataForInsertView(jsonObject);
	
	$.ajax({
		type		: 	"POST",
		url			: 	WEB_SERVICE_URL + '/rateMasterWS/getRouteWiseCharges.do',
		data		:	jsonObject,
		dataType	: 	'json',
		success		: 	function(data) {
			if(data.message != undefined) {
				var errorMessage = data.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				hideLayer();
				return;
			} else {
				createRatesEditData(data.rateMaster);
				createJsPanel("Edit Route Wise Charges");
				setDataTableToJsPanel();
			}
			hideLayer();
		}
	});
}

function createRatesEditData(rateMaster) {
	$('#ratesEditTableTBody').empty();
	
	if(!rateMasterConfiguration.allowWayBillTypeWiseRate) {
		$('#lyTypeHeader').remove();
		$('#lyTypeFooter').remove();
	}
	
	if(!rateMasterConfiguration.allowPartyToPartyRate) {
		$('#partynameHeader').remove();
		$('#partynameFooter').remove();
	}
	
	if(!rateMasterConfiguration.transportationMode)
		$('.transportationModeHeader').remove();
	
	if(!rateMasterConfiguration.cftChargePanel) {
		$('#cftRateHeader').remove();
		$('#cftRateEditHeader').remove();
		$('#cftRateFooter').remove();
		$('#cftRateFooterOptions').remove();
	}
	
	if(!rateMasterConfiguration.showDestinationSubRegion) {
		$('#destSubRegionHeader').remove();
		$('#destSubRegionFooter').remove();
	}
	
	if(isCityWiseRates) {
		$('#routeSourceBranch').html('Src. City');
		$('#routeDestinationBranch').html('Dest. City');
	} else if(isRegionWiseRates) {
		$('#routeSourceBranch').html('Src. Region');
		$('#routeDestinationBranch').html('Dest. Region');
	}
	
	if(!rateMasterConfiguration.isSlabFeildDisplay) {
		$('.minWeightHeader').remove();
		$('.maxWeightHeader').remove();
	}
	
	if(!rateMasterConfiguration.isFixedSlabAmount)
		$('.fixedSlabHeader').remove();
	
	if(!rateMasterConfiguration.setFixChargeRate)
		$('.fixedChargeHeader').remove();
	
	if(!rateMasterConfiguration.showVisibleRate) {
		$('#visibleRateHeader').remove();
		$('#visibleEditRateHeader').remove();
		$('#visibleRateFoot').remove();
		$('#visibleEditRateFoot').remove();
	}
	
	if(!rateMasterConfiguration.ShowVehicleType)
		$('.vehicleTypeHeader').remove();
	else
		$('.bookingTypeHeader').remove();
		
	if(!rateMasterConfiguration.PackingGroupTypeMaster)
		$('.packingGroupHeader').remove();
		
	if(!rateMasterConfiguration.showSaidToContainPanelOnChargeTypeArticle)
		$('.saidToContainHeader').remove();
		
	if(!rateMasterConfiguration.showBranchServiceType)
		$('.branchServiceTypeHeader').remove();
		
	if(!rateMasterConfiguration.showDeliveryTo)
		$('.deliveryToHeader').remove();
	
	if(!rateMasterConfiguration.showRouteWiseDateSelectionForParty || $('#partyId').val() <= 0){
		$('.validFromHeader').remove();	
		$('.validTillHeader').remove();	
	}		
	//if(rateMasterConfiguration.isWeightRateOnArticleGroup)
		//$('.articleTypeHeader').remove();

	for (var i = 0; i < rateMaster.length; i++) {
		var rmId	= rateMaster[i].rateMasterId;
		var row		= createRow("tr_"+rmId, '');
		var branchServiceCol	= "";
		var deliveryToCol		= "";
		var validFromColl		= "";
		var validTillColl		= "";
		
		var col0	= createColumn(row, "td_"+rmId, '2%', 'right', '', '');

		if(rateMasterConfiguration.allowWayBillTypeWiseRate)
			var col1	= createColumn(row, "td_"+rmId, '8%', 'left', '', '');
		
		if(rateMasterConfiguration.showDestinationSubRegion)
			var destSubRegionCol	= createColumn(row, "td_"+rmId, '10%', 'left', '', '');
		
		var col3			= createColumn(row, "td_"+rmId, '10%', 'left', '', '');
		
		if(rateMasterConfiguration.allowPartyToPartyRate)
			var partyNameCol	= createColumn(row, "td_"+rmId, '10%', 'left', '', '');
		
		if(rateMasterConfiguration.isSlabFeildDisplay) {
			var col4			= createColumn(row, "td_"+rmId, '4%', 'right', '', '');
			var col5			= createColumn(row, "td_"+rmId, '4%', 'right', '', '');
		}
		
		if(rateMasterConfiguration.isFixedSlabAmount)
			var fixedSlabCol			= createColumn(row, "td_"+rmId, '4%', 'right', '', '');
		
		if(rateMasterConfiguration.setFixChargeRate)
			var fixedChargeCol			= createColumn(row, "td_"+rmId, '4%', 'right', '', '');
		
		var col6			= createColumn(row, "td_"+rmId, '8%', 'left', '', '');
		
		//if(!rateMasterConfiguration.isWeightRateOnArticleGroup)
			var col7			= createColumn(row, "td_"+rmId, '8%', 'left', '', '');
		
		if(rateMasterConfiguration.PackingGroupTypeMaster)
			var col8			= createColumn(row, "td_"+rmId, '8%', 'left', '', '');
		
		if(rateMasterConfiguration.showSaidToContainPanelOnChargeTypeArticle)
			var col9			= createColumn(row, "td_"+rmId, '8%', 'left', '', '');
		
		var col10			= createColumn(row, "td_"+rmId, '8%', 'left', '', '');
		var col11			= createColumn(row, "td_"+rmId, '8%', 'right', '', '');
		
		if(rateMasterConfiguration.transportationMode)
			var transportCol	= createColumn(row, "td_"+rmId, '8%', 'right', '', '');
		
		if(rateMasterConfiguration.showBranchServiceType)
			branchServiceCol	= createColumn(row, "td_"+rmId, '8%', 'left', '', '');
			
		if(rateMasterConfiguration.showDeliveryTo)
			 deliveryToCol		= createColumn(row, "td_"+rmId, '8%', 'left', '', '');
		
		if(rateMasterConfiguration.showRouteWiseDateSelectionForParty && $('#partyId').val() > 0){
			 validFromColl		= createColumn(row, "td_"+rmId, '8%', 'left', '', '');
			 validTillColl		= createColumn(row, "td_"+rmId, '8%', 'left', '', '');
		}
		
		var col12			= createColumn(row, "td_"+rmId, '5%',  'left', '', '');
		var col13			= createColumn(row, "td_"+rmId, '12%', 'left', '', '');
		
		if(rateMasterConfiguration.cftChargePanel) {
			var col14			= createColumn(row, "td_"+rmId, '5%',  'left', '', '');
			var col15			= createColumn(row, "td_"+rmId, '35%', 'left', '', '');
		}

		if(rateMasterConfiguration.showVisibleRate) {
			var col16			= createColumn(row, "td_"+rmId, '5%',  'left', '', '');
			var col17			= createColumn(row, "td_"+rmId, '35%', 'left', '', '');
		}
		
		col0.append(i + 1);

		if(rateMasterConfiguration.allowWayBillTypeWiseRate)
			setHtml(col1, rateMaster[i].wayBillType);
		
		if(rateMasterConfiguration.showDestinationSubRegion)
			setHtml(destSubRegionCol, rateMaster[i].destinationSubRegionName);
		
		setHtml(col3, rateMaster[i].destinationBranch);
		
		if(rateMasterConfiguration.allowPartyToPartyRate)
			setHtml(partyNameCol, rateMaster[i].consigneePartyName);
		
		if(rateMasterConfiguration.isSlabFeildDisplay) {
			setHtml(col4, rateMaster[i].minWeight);
			setHtml(col5, rateMaster[i].maxWeight);
		}
		
		if(rateMasterConfiguration.isFixedSlabAmount)
			setHtml(fixedSlabCol, rateMaster[i].isFixedSlabAmt ? 'Yes' : 'No');
		
		if(rateMasterConfiguration.setFixChargeRate)
			setHtml(fixedChargeCol, rateMaster[i].chargedFixedStr);
		
		setHtml(col6, rateMaster[i].chargeTypeName);
		
	//	if(!rateMasterConfiguration.isWeightRateOnArticleGroup)
			setHtml(col7, rateMaster[i].articleType);
		
		if(rateMasterConfiguration.PackingGroupTypeMaster)
			setHtml(col8, rateMaster[i].packingGroupTypeName);
			
		if(rateMasterConfiguration.showSaidToContainPanelOnChargeTypeArticle)
			setHtml(col9, rateMaster[i].consignmentGoodsName);
		
		if(rateMasterConfiguration.ShowVehicleType)
			setHtml(col10, rateMaster[i].vehicleType);
		else
			setHtml(col10, rateMaster[i].bookingType);
		
		setHtml(col11, rateMaster[i].chargeName);
		
		if(rateMasterConfiguration.transportationMode)
			setHtml(transportCol, rateMaster[i].transportationModeName);

		if(rateMasterConfiguration.showBranchServiceType)
			setHtml(branchServiceCol, rateMaster[i].branchServiceType);
			
		if(rateMasterConfiguration.showDeliveryTo)
			setHtml(deliveryToCol, rateMaster[i].deliveryTo);
			
		if(rateMasterConfiguration.showRouteWiseDateSelectionForParty && $('#partyId').val() > 0){
			setHtml(validFromColl, rateMaster[i].validFromStr);
			setHtml(validTillColl, rateMaster[i].validTillStr);
		}
		
		var inputAttr1		= new Object();
		var input			= null;

		inputAttr1.id			= 'rate'+rmId;
		inputAttr1.type			= 'text';
		inputAttr1.value		= rateMaster[i].rate;
		inputAttr1.name			= 'rate'+rmId;
		inputAttr1.class		= 'form-control';
		inputAttr1.style		= 'width: 100px;text-align: right;';
		inputAttr1.onkeypress	= 'return validAmount(event);if(getKeyCode(event) == 17){return false;}';
		inputAttr1.onfocus		= 'if(this.value==0)this.value='+"''"+';';
		inputAttr1.onblur		= 'clearIfNotNumeric(this,0);';
		inputAttr1.disabled		= 'true';

		input	= createInput(col12,inputAttr1);
		input.attr( {
			'data-value' : rmId
		});

		var buttonEditJS		= new Object();
		var buttonEdit			= null;

		buttonEditJS.id			= 'edit'+rmId;
		buttonEditJS.name		= 'edit'+rmId;
		buttonEditJS.value		= 'Edit';
		buttonEditJS.html		= 'Edit';
		buttonEditJS.class		= 'btn btn-warning';
		buttonEditJS.onclick	= 'editRate(this);';
		buttonEditJS.style		= 'width: 50px;';

		buttonEdit			= createButton(col13, buttonEditJS);
		buttonEdit.attr({
			'data-value' : rmId
		});

		col12.append('&emsp;');

		var buttonSaveJS		= new Object();
		var buttonSave			= null;

		buttonSaveJS.id			= 'save'+rmId;
		buttonSaveJS.name		= 'save'+rmId;
		buttonSaveJS.value		= 'Save';
		buttonSaveJS.html		= 'Save';
		buttonSaveJS.class		= 'btn btn-primary';
		buttonSaveJS.onclick	= 'updateRate(this);';
		buttonSaveJS.style		= 'width: 50px; display: none;';

		buttonSave			= createButton(col13, buttonSaveJS);
		buttonSave.attr({
			'data-value' 	: rmId,
			'data-values' 	: rateMaster[i].rateMasterIds
		});

		col13.append('&emsp;');

		var buttonDeleteJS		= new Object();
		var buttonDelete			= null;

		buttonDeleteJS.id			= 'Delete'+rmId;
		buttonDeleteJS.name			= 'Delete'+rmId;
		buttonDeleteJS.value		= 'Delete';
		buttonDeleteJS.html			= 'Delete';
		buttonDeleteJS.class		= 'btn btn-danger';
		buttonDeleteJS.onclick		= 'deleteRate(this);';
		buttonDeleteJS.style		= 'width: 60px;';

		buttonDelete			= createButton(col13, buttonDeleteJS);
		buttonDelete.attr({
			'data-value' 	: rmId,
			'data-values' 	: rateMaster[i].rateMasterIds
		});
		
		if(rateMasterConfiguration.cftChargePanel){
			
			var inputAttr2		= new Object();
			var input			= null;

			inputAttr2.id			= 'cftrate'+rmId;
			inputAttr2.type			= 'text';
			inputAttr2.value		= rateMaster[i].cftRate;
			inputAttr2.name			= 'cftrate'+rmId;
			inputAttr2.class		= 'form-control';
			inputAttr2.style		= 'width: 100px;text-align: right;';
			inputAttr2.onkeypress	= 'return validAmount(event);if(getKeyCode(event) == 17){return false;}';
			inputAttr2.onfocus		= 'if(this.value==0)this.value='+"''"+';';
			inputAttr2.onblur		= 'clearIfNotNumeric(this,0);';
			inputAttr2.disabled		= 'true';

			input	= createInput(col14,inputAttr2);
			input.attr( {
				'data-value' : rmId
			});

			var buttonEditJS1		= new Object();
			var buttonEdit			= null;

			buttonEditJS1.id		= 'cftedit'+rmId;
			buttonEditJS1.name		= 'cftedit'+rmId;
			buttonEditJS1.value		= 'Edit';
			buttonEditJS1.html		= 'Edit';
			buttonEditJS1.class		= 'btn btn-warning';
			buttonEditJS1.onclick	= 'editCftRate(this);';
			buttonEditJS1.style		= 'width: 50px;';

			buttonEdit			= createButton(col15, buttonEditJS1);
			buttonEdit.attr({
				'data-value' : rmId
			});

			col14.append('&emsp;');

			var buttonSaveJS1		= new Object();
			var buttonSave			= null;

			buttonSaveJS1.id		= 'cftsave'+rmId;
			buttonSaveJS1.name		= 'cftsave'+rmId;
			buttonSaveJS1.value		= 'Save';
			buttonSaveJS1.html		= 'Save';
			buttonSaveJS1.class		= 'btn btn-primary';
			buttonSaveJS1.onclick	= 'updateCftRate(this);';
			buttonSaveJS1.style		= 'width: 50px; display: none;';

			buttonSave			= createButton(col15, buttonSaveJS1);
			buttonSave.attr({
				'data-value' : rmId
			});

			col15.append('&emsp;');

			var buttonDeleteJS1		= new Object();
			var buttonDelete			= null;

			buttonDeleteJS1.id			= 'cftDelete'+rmId;
			buttonDeleteJS1.name		= 'cftDelete'+rmId;
			buttonDeleteJS1.value		= 'Delete';
			buttonDeleteJS1.html		= 'Delete';
			buttonDeleteJS1.class		= 'btn btn-danger';
			buttonDeleteJS1.onclick		= 'deleteCftRate(this);';
			buttonDeleteJS1.style		= 'width: 60px;';

			buttonDelete			= createButton(col15, buttonDeleteJS1);
			buttonDelete.attr({
				'data-value' : rmId
			});
		}
		
		if(rateMasterConfiguration.showVisibleRate) {
			var inputAttr3		= new Object();
			var input			= null;

			inputAttr3.id			= 'visiblerate'+rmId;
			inputAttr3.type			= 'text';
			inputAttr3.value		= rateMaster[i].visibleRate;
			inputAttr3.name			= 'visiblerate'+rmId;
			inputAttr3.class		= 'form-control';
			inputAttr3.style		= 'width: 100px;text-align: right;';
			inputAttr3.onkeypress	= 'return validAmount(event);if(getKeyCode(event) == 17){return false;}';
			inputAttr3.onfocus		= 'if(this.value==0)this.value='+"''"+';';
			inputAttr3.onblur		= 'clearIfNotNumeric(this,0);';
			inputAttr3.disabled		= 'true';

			input	= createInput(col16,inputAttr3);
			input.attr( {
				'data-value' : rmId
			});

			var buttonEditJS2		= new Object();
			var buttonEdit			= null;

			buttonEditJS2.id		= 'visiblerateedit'+rmId;
			buttonEditJS2.name		= 'visiblerateedit'+rmId;
			buttonEditJS2.value		= 'Edit';
			buttonEditJS2.html		= 'Edit';
			buttonEditJS2.class		= 'btn btn-warning';
			buttonEditJS2.onclick	= 'editVisibleRate(this);';
			buttonEditJS2.style		= 'width: 50px;';

			buttonEdit			= createButton(col17, buttonEditJS2);
			buttonEdit.attr({
				'data-value' : rmId
			});

			col16.append('&emsp;');

			var buttonSaveJS2		= new Object();
			var buttonSave			= null;

			buttonSaveJS2.id		= 'visiblesave'+rmId;
			buttonSaveJS2.name		= 'visiblesave'+rmId;
			buttonSaveJS2.value		= 'Save';
			buttonSaveJS2.html		= 'Save';
			buttonSaveJS2.class		= 'btn btn-primary';
			buttonSaveJS2.onclick	= 'updateVisibleRate(this);';
			buttonSaveJS2.style		= 'width: 50px; display: none;';

			buttonSave			= createButton(col17, buttonSaveJS2);
			buttonSave.attr({
				'data-value' : rmId
			});
		}

		$('#ratesEditTableTBody').append(row);
	}
}

function editRate(obj) {
	var rmId	= obj.getAttribute('data-value');
	$('#routewisejspanel #rate'+rmId).removeAttr('disabled');
	$('#routewisejspanel #save'+rmId).show();
	$(obj).hide();
}

function editCftRate(obj){
	var rmId	= obj.getAttribute('data-value');
	$('#routewisejspanel #cftrate'+rmId).removeAttr('disabled');
	$('#routewisejspanel #cftsave'+rmId).show();
	$(obj).hide();
}
function editVisibleRate(obj){
	var rmId	= obj.getAttribute('data-value');
	$('#routewisejspanel #visiblerate'+rmId).removeAttr('disabled');
	$('#routewisejspanel #visiblesave'+rmId).show();
	$(obj).hide();
}

function updateRate(obj) {
	var rmId		= obj.getAttribute('data-value');
	var rateValue	= $('#routewisejspanel #rate'+rmId).val();
	var rmIds		= null;
	
	if(isCityWiseRates || isRegionWiseRates)
		rmIds		= obj.getAttribute('data-values');
	
	updateRateMasterRate(rmId, rateValue, rmIds);
	$('#routewisejspanel #rate' + rmId).prop('disabled', true);
	$('#routewisejspanel #edit' + rmId).show();
	$(obj).hide();
}

function deleteRate(obj) {
	var rmId		= obj.getAttribute('data-value');
	
	var rmIds		= null;
	
	if(isCityWiseRates || isRegionWiseRates)
		rmIds		= obj.getAttribute('data-values');
		
	deleteRateMasterRate(rmId, rmIds);
	$(obj).closest("tr").remove(); // closest function find closest tag of given id.
}

function updateCftRate(obj){
	var rmId		= obj.getAttribute('data-value');
	var rateValue	= $('#routewisejspanel #cftrate'+rmId).val();
	updateRateMasterCftRate(rmId,rateValue);
	$('#routewisejspanel #cftrate'+rmId).prop('disabled', true);
	$('#routewisejspanel #cftedit'+rmId).show();
	$(obj).hide();
}

function updateRateMasterRate(rateMasterId, rate, rmIds) {
	var jsonObject				= new Object();
	
	jsonObject["rateMasterId"]		= rateMasterId;
	jsonObject["rate"]				= rate;
	jsonObject["rmIds"]				= rmIds;
	jsonObject["sourceCityId"] 		= $('#cityId').val();
	jsonObject["corporateAccountId"]= $('#partyId').val();
	jsonObject["categoryTypeId"]	= $('#categoryType').val();
	jsonObject["sourceRegionId"] 	= $('#regionId').val();

	showLayer();

	$.ajax({
		type		: 	"POST",
		url			: 	WEB_SERVICE_URL + '/rateMasterWS/updateRateMasterRate.do',
		data		:	jsonObject,
		dataType	: 	'json',
		success		: 	function(data) {
			hideLayer();
			
			if(data.message != undefined) {
				var errorMessage = data.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				return;
			}
		}
	});
}

function updateRateMasterCftRate(rateMasterId, rate){
	var jsonObject				= new Object();
	
	jsonObject["rateMasterId"]	= rateMasterId;
	jsonObject["rate"]			= rate;
	
	showLayer();

	$.ajax({
		type		: 	"POST",
		url			: 	WEB_SERVICE_URL + '/rateMasterWS/updateRateMasterCftRate.do',
		data		:	jsonObject,
		dataType	: 	'json',
		success		: 	function(data) {
			hideLayer();
			
			if(data.message != undefined) {
				var errorMessage = data.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				return;
			}
		}
	});
}

function updateVisibleRate(obj){
	var rmId		= obj.getAttribute('data-value');
	var rateValue	= $('#routewisejspanel #visiblerate'+rmId).val();
	updateRateMasterVisibleRate(rmId,rateValue);
	$('#routewisejspanel #visiblerate'+rmId).prop('disabled', true);
	$('#routewisejspanel #visiblerateedit'+rmId).show();
	$(obj).hide();
}

function updateRateMasterVisibleRate(rateMasterId, rate){
	var jsonObject				= new Object();
	
	jsonObject["rateMasterId"]	= rateMasterId;
	jsonObject["visibleRate"]	= rate;
	
	showLayer();

	$.ajax({
		type		: 	"POST",
		url			: 	WEB_SERVICE_URL + '/rateMasterWS/updateRateMasterVisibleRate.do',
		data		:	jsonObject,
		dataType	: 	'json',
		success		: 	function(data) {
			hideLayer();
			
			if(data.message != undefined) {
				var errorMessage = data.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				return;
			}
		}
	});
}
function getRouteWiseSlabRates(){

	if(!validateMainSection(0)) return false;

	showLayer();

	var jsonObject				= new Object();
	
	jsonObject["branchId"]				= $('#branchId').val();
	jsonObject["corporateAccountId"]	= $('#partyId').val();
	jsonObject["categoryTypeId"]		= $('#categoryType').val();
	
	$.ajax({
		type		: 	"POST",
		url			: 	WEB_SERVICE_URL + '/rateMasterWS/getRouteWiseSlabRates.do',
		data		:	jsonObject,
		dataType	: 	'json',
		success		: 	function(data) {
			if(data.message != undefined) {
				var errorMessage = data.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				hideLayer();
				return;
			} 
			
			var title			= 'Edit Route Wise Slab Rates';
			var mainId			= 'jsPanelMainContentForRouteWiseSlabCharges';
			var tableId			= 'routeWiseSlabRatesEditTable';
			var theadId			= 'routeWiseSlabEditTableTHead';
			var tbodyId			= 'routeWiseSlabEditTableTBody';
			var tfootId			= 'routeWiseSlabEditTableTFoot';
			var tfootRowClass	= 'tfootClass';
			
			createRouteWiseSlabRatesTHead(theadId)
			createRouteWiseSlabRatesEditData(data.rateMaster);
			createJsPanelForRateMaster(title, mainId);
			setDataTableToJsPanelForRateMaster(tableId, tbodyId, tfootId, theadId, tfootRowClass);
			
			hideLayer();
			
		}
	});
}

function createRouteWiseSlabRatesTHead(theadId){
	$('#' + theadId).empty();
	var row		= createRowInTable('', '', '');
	
	var srNoCol							= createColumnInRow(row, '', '', '', '', '', '');
	var srcBranchCol					= createColumnInRow(row, '', '', '', '', '', '');
	var destBranchCol					= createColumnInRow(row, '', '', '', '', '', '');
	var partyNameColCol					= createColumnInRow(row, '', '', '', '', '', '');
	var minWeightCol					= createColumnInRow(row, '', '', '', '', '', '');
	var maxWeightCol					= createColumnInRow(row, '', '', '', '', '', '');
	var chargeNameCol					= createColumnInRow(row, '', '', '', '', '', '');
	var rateCol							= createColumnInRow(row, '', '', '', '', '', '');
	var extraSizeAmtPerSqftCol			= createColumnInRow(row, '', '', '', '', '', '');
	var increasedWeightAmountPerKgCol	= createColumnInRow(row, '', '', '', '', '', '');
	var optionsCol						= createColumnInRow(row, '', '', '', '', '', '');
	
	appendValueInTableCol(srNoCol, '<b>Sr.</b>');
	appendValueInTableCol(srcBranchCol, '<b>Source Branch Name</b>');
	appendValueInTableCol(destBranchCol, '<b>Dest. Branch Name</b>');
	appendValueInTableCol(partyNameColCol, '<b>Party Name</b>');
	appendValueInTableCol(minWeightCol, '<b>Min</b>');
	appendValueInTableCol(maxWeightCol, '<b>Max</b>');
	appendValueInTableCol(chargeNameCol, '<b>Charge On</b>');
	appendValueInTableCol(rateCol, '<b>Fix Rate Amount</b>');
	appendValueInTableCol(extraSizeAmtPerSqftCol, '<b>Extra Size Amt / Sqft</b>');
	appendValueInTableCol(increasedWeightAmountPerKgCol, '<b>Increased Weight Amt / Sqft</b>');
	appendValueInTableCol(optionsCol, '<b>Options</b>');
	
	appendRowInTable(theadId, row);
}

function createRouteWiseSlabRatesEditData(rateMaster){
	$('#routeWiseSlabEditTableTBody').empty();

	for (var i = 0; i < rateMaster.length; i++) {
		var rmId	= rateMaster[i].routeWiseSlabMasterId;
		var row		= createRow("tr_"+rmId, '');
		
		var col0			= createColumn(row, "td_"+rmId, '10%', 'left', '', '');
		var col1			= createColumn(row, "td_"+rmId, '10%', 'left', '', '');
		var col2			= createColumn(row, "td_"+rmId, '4%', 'right', '', '');
		var partyNameCol	= createColumn(row, "td_"+rmId, '10%', 'left', '', '');
		var col3			= createColumn(row, "td_"+rmId, '4%', 'right', '', '');
		var col4			= createColumn(row, "td_"+rmId, '8%', 'left', '', '');
		var col5			= createColumn(row, "td_"+rmId, '8%', 'left', '', '');
		var col6			= createColumn(row, "td_"+rmId, '8%', 'left', '', '');
		var col7			= createColumn(row, "td_"+rmId, '8%', 'left', '', '');
		var col8			= createColumn(row, "td_"+rmId, '8%', 'left', '', '');
		var col9			= createColumn(row, "td_"+rmId, '8%', 'right', '', '');

		setHtml(col0, (i+1));
		setHtml(col1, rateMaster[i].branch);
		setHtml(col2, rateMaster[i].destinationBranch);
		setHtml(partyNameCol, rateMaster[i].corporateAccountName);
		setHtml(col3, rateMaster[i].minValue);
		setHtml(col4, rateMaster[i].maxValue);
		setHtml(col5, rateMaster[i].chargeName);

		let inputAttr1		= new Object();
		let input			= null;

		inputAttr1.id			= 'rate'+rmId;
		inputAttr1.type			= 'text';
		inputAttr1.value		= rateMaster[i].rate;
		inputAttr1.name			= 'rate'+rmId;
		inputAttr1.class		= 'form-control';
		inputAttr1.style		= 'width: 100px;text-align: right;';
		inputAttr1.onkeypress	= 'return validAmount(event);if(getKeyCode(event) == 17){return false;}';
		inputAttr1.onfocus		= 'if(this.value==0)this.value='+"''"+';';
		inputAttr1.onblur		= 'clearIfNotNumeric(this,0);';
		inputAttr1.disabled		= 'true';

		input	= createInput(col6,inputAttr1);
		input.attr( {
			'data-value' : rmId
		});
		
		let inputAttr2		= new Object();
		input			= null;

		inputAttr2.id			= 'extraAmtPerSqftrate'+rmId;
		inputAttr2.type			= 'text';
		inputAttr2.value		= rateMaster[i].extraAmtPerSqft;
		inputAttr2.name			= 'extraAmtPerSqftrate'+rmId;
		inputAttr2.class		= 'form-control';
		inputAttr2.style		= 'width: 100px;text-align: right;';
		inputAttr2.onkeypress	= 'return validAmount(event);if(getKeyCode(event) == 17){return false;}';
		inputAttr2.onfocus		= 'if(this.value==0)this.value='+"''"+';';
		inputAttr2.onblur		= 'clearIfNotNumeric(this,0);';
		inputAttr2.disabled		= 'true';

		input	= createInput(col7,inputAttr2);
		input.attr( {
			'data-value' : rmId
		});
		
		let inputAttr3		= new Object();
		input			= null;

		inputAttr3.id			= 'increasedAmountPerKg'+rmId;
		inputAttr3.type			= 'text';
		inputAttr3.value		= rateMaster[i].increasedAmountPerKg;
		inputAttr3.name			= 'increasedAmountPerKg'+rmId;
		inputAttr3.class		= 'form-control';
		inputAttr3.style		= 'width: 100px;text-align: right;';
		inputAttr3.onkeypress	= 'return validAmount(event);if(getKeyCode(event) == 17){return false;}';
		inputAttr3.onfocus		= 'if(this.value==0)this.value='+"''"+';';
		inputAttr3.onblur		= 'clearIfNotNumeric(this,0);';
		inputAttr3.disabled		= 'true';

		input	= createInput(col8,inputAttr3);
		input.attr( {
			'data-value' : rmId
		});

		let buttonEditJS		= new Object();
		let buttonEdit			= null;

		buttonEditJS.id			= 'edit'+rmId;
		buttonEditJS.name		= 'edit'+rmId;
		buttonEditJS.value		= 'Edit';
		buttonEditJS.html		= 'Edit';
		buttonEditJS.class		= 'btn btn-warning';
		buttonEditJS.onclick	= 'editRouteWiseRate(this);';
		buttonEditJS.style		= 'width: 50px;';

		buttonEdit			= createButton(col9, buttonEditJS);
		buttonEdit.attr({
			'data-value' : rmId
		});

		col9.append('&emsp;');

		let buttonSaveJS		= new Object();
		let buttonSave			= null;

		buttonSaveJS.id			= 'save'+rmId;
		buttonSaveJS.name		= 'save'+rmId;
		buttonSaveJS.value		= 'Save';
		buttonSaveJS.html		= 'Save';
		buttonSaveJS.class		= 'btn btn-primary';
		buttonSaveJS.onclick	= 'updateRouteWiseSlabRate(this);';
		buttonSaveJS.style		= 'width: 50px; display: none;';

		buttonSave			= createButton(col9, buttonSaveJS);
		buttonSave.attr({
			'data-value' : rmId
		});

		col9.append('&emsp;');

		let buttonDeleteJS		= new Object();
		let buttonDelete			= null;

		buttonDeleteJS.id			= 'Delete'+rmId;
		buttonDeleteJS.name			= 'Delete'+rmId;
		buttonDeleteJS.value		= 'Delete';
		buttonDeleteJS.html			= 'Delete';
		buttonDeleteJS.class		= 'btn btn-danger';
		buttonDeleteJS.onclick		= 'deleteRouteWiseSlabRate(this);';
		buttonDeleteJS.style		= 'width: 60px;';

		buttonDelete			= createButton(col9, buttonDeleteJS);
		buttonDelete.attr({
			'data-value' : rmId

		});

		$('#routeWiseSlabEditTableTBody').append(row);
	}
}

function editRouteWiseRate(obj) {
	let rmId	= obj.getAttribute('data-value');
	$('#routewisejspanel #rate'+rmId).removeAttr('disabled');
	$('#routewisejspanel #extraAmtPerSqftrate'+rmId).removeAttr('disabled');
	$('#routewisejspanel #increasedAmountPerKg'+rmId).removeAttr('disabled');
	$('#routewisejspanel #save'+rmId).show();
	$(obj).hide();
}

//if part rate found then Rate configured will checked
function getRouteWiseRateConfigured(partyId) {
	if(!validateMainSection(1)) return false;
	
	showLayer();
	
	let jsonObject				= new Object();
	
	jsonObject["branchId"]				= $('#branchId').val();
	jsonObject["corporateAccountId"]	= partyId;
	jsonObject["categoryTypeId"]		= $('#categoryType').val();
	jsonObject["billSelectionId"] 		= $('#billSelection').val();
	
	$.ajax({
		type		: 	"POST",
		url			: 	WEB_SERVICE_URL + '/rateMasterWS/getRouteWiseCharges.do',
		data		:	jsonObject,
		dataType	: 	'json',
		success		: 	function(data) {
			if(data.message != undefined) {
				hideLayer();
				return;
			} else {
				partyRouteWiseCharge	= data.rateMaster;
				$('#rateConfigured').prop("checked", typeof partyRouteWiseCharge != 'undefined' && partyRouteWiseCharge.length > 0);
			}
			hideLayer();
		}
	});
}

//get route wise rates to edit
function getSlabWisePartyMinimumRates() {
	if(!validateMainSection(0)) return false;
	
	let jsonObject		= new Object();
		
	jsonObject["sourceBranchId"]		= $('#branchId').val();
	jsonObject["corporateAccountId"]	= $('#partyId').val();
	jsonObject["categoryTypeId"]		= $('#categoryType').val();
	
	$.ajax({
		type		: 	"POST",
		url			: 	WEB_SERVICE_URL + '/rateMasterWS/getSlabWisePartyMinimumRates.do',
		data		:	jsonObject,
		dataType	: 	'json',
		success		: 	function(data) {
			if(data.message != undefined) {
				var errorMessage = data.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				hideLayer();
				return;
			} else {
				var title			= 'Minimum Value Config';
				var mainId			= 'jsPanelMainContentForPartyMinimum';
				var tableId			= 'partyMinimumRatesEditTable';
				var theadId			= 'partyMinimumRatesEditTableTHead';
				var tbodyId			= 'partyMinimumRatesEditTableTBody';
				var tfootId			= 'partyMinimumRatesEditTableTFoot';
				var tfootRowClass	= 'tfootClass';
							
				createMinimumPartyRatesEditData(data.rateList);
				createJsPanelForRateMaster(title, mainId);
				setDataTableToJsPanelForRateMaster(tableId, tbodyId, tfootId, theadId, tfootRowClass);
			}
			hideLayer();
		}
	});
}

function createMinimumPartyRatesEditData(rateMaster) {
	if(!rateMasterConfiguration.showDestinationInMinimumValueConfig)
		$('.minimumDestinationBranch').remove();
	
	$('#partyMinimumRatesEditTableTBody').empty();
	
	for (var i = 0; i < rateMaster.length; i++) {
		var rmId	= rateMaster[i].rateMasterId;
		var row		= createRow("tr_"+rmId, '');
		
		var col0	= createColumn(row, "td_"+rmId, '2%', 'right', '', '');
		var col1	= createColumn(row, "td_"+rmId, '10%', 'left', '', '');
		var col2	= createColumn(row, "td_"+rmId, '8%', 'left', '', '');
		
		if(rateMasterConfiguration.showDestinationInMinimumValueConfig)
			var col3	= createColumn(row, "td_"+rmId, '8%', 'left', '', '');
	
		var col4	= createColumn(row, "td_"+rmId, '8%', 'left', '', '');
		
		col0.append(i + 1);

		setHtml(col1, rateMaster[i].slabRange);
		setHtml(col2, rateMaster[i].chargeSectionName);
		
		if(rateMasterConfiguration.showDestinationInMinimumValueConfig)
			setHtml(col3, rateMaster[i].destinationBranch);
	
		setHtml(col4, rateMaster[i].rate);
		
		$('#partyMinimumRatesEditTableTBody').append(row);
	}
}
