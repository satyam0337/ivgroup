var packingTypeNameArrayForAllow	= null;

function configureAddArticle(executive) {
	if (configuration.ChargeType == 'true')
		$('#chargeType').closest("td").show();
	else
		$('#chargeType').closest("td").hide();

	if (configuration.TemporaryWght == 'true')
		$('#tempWeight').closest("td").show();
	else
		$('#tempWeight').closest("td").hide();

	if (configuration.Qty == 'true')
		$('#quantity').closest("td").show();
	else
		$('#quantity').closest("td").hide();

	if (configuration.ArticleType == 'true')
		$('#typeofPacking').closest("td").show();
	else
		$('#typeofPacking').closest("td").hide();

	if (configuration.SaidToContain == 'true')
		$('#saidToContain').closest("td").show();
	else {
		let subRegionList1 		= (configuration.subRegionIdsToShowsaidToContain).split(',');
		
		if(isValueExistInArray(subRegionList1, executive.subRegionId))
			$('#saidToContain').closest("td").show();
		else
			$('#saidToContain').closest("td").hide();
	}
	
	if (configuration.WeightWiseConsignmentAmount == 'true')
		$('#actualWtCol').show();
	else
		$('#actualWtCol').remove();

	if (configuration.QTYAmt == 'true' || accountGroupId == ACCOUNT_GROUP_ID_LMT)
		$('#qtyAmount').closest("td").show();
	else
		$('#qtyAmount').closest("td").hide();

	if (configuration.AddButton == 'true')
		$('#add').closest("td").show();
	else
		$('#add').closest("td").hide();
	
	if (configuration.VolumetricRate == 'true')
		$("#volumetricFeild").show();
	
	if (configuration.showViewAllConsignmentGoodsLink == 'true')
		$("#viewAllConsignmentGoods").show();
	
	if (configuration.routeWiseSlabConfigurationAllowed == 'true') {
		$("#articleSize").css('display','block');
		$("#totalparcelsize").css('display','block');
		$("#totalSize").css('display','block');
	}
	
	if(configuration.allowToEnterSaidToContainsWiseRemark == 'true') {
		$('#consignmentRemarkDiv').removeClass('hide');
		$('#viewConsignmentRemark').removeClass('hide');
		
		$("#viewConsignmentRemark").click(function () {
			viewConsignmentRemark();
		});	
	} else
		$('#consignmentRemarkDiv').remove();
		
	if(configuration.hideCFTValueFieldOnBookingPage == 'true')
		$('#cftOption').hide();
	
	if(isValueExistInArray((configuration.branchesToShowChargeTypeList).split(","), executive.branchId))
		$('#chargeType').closest("td").show();
}

function configureWeightAndAmount() {
	if (configuration.ActualWght == 'true')
		$('#actualWeight').closest("div").show();
	else
		$('#actualWeight').closest("div").hide();

	if (configuration.ChargedWght == 'true')
		$('#chargedWeight').closest("div").show();
	else
		$('#chargedWeight').closest("div").hide();

	if (configuration.WghtRate == 'true')
		$('#weigthFreightRate').closest("div").show();
	else
		$('#weigthFreightRate').closest("div").hide();

	if (configuration.WghtAmt == 'true')
		$('#weightAmount').closest("div").show();
	else
		$('#weightAmount').closest("div").hide();

	if (configuration.FixAmt == 'true')
		$('#fixAmount').closest("div").show();
	else
		$('#fixAmount').closest("div").hide();
		
	if(isValueExistInArray((configuration.branchesToShowActualWghtAndChargeWght).split(","), executive.branchId)) {
		$('#actualWeight').closest("div").show();
		$('#chargedWeight').closest("div").show();
	}
}

function deleteConsignments(deleteButtonId) {
	let tempArray = _.filter(cnsgnmentGoodsId, function(num){ return ((Number(num.split("_")[1])  ) == Number(deleteButtonId.split("_")[1]))}) ;
	
	let checkEmptyConsignment = tempArray.toString();
	
	if(checkEmptyConsignment.split("_")[0] != 0)
		counterForNonEmpty--;
	
	resetAmountOnDelete(deleteButtonId);  //Calling from WayBillSetReset.js
	deleteConsignmentTableRow(deleteButtonId);

	cnsgnmentGoodsId = _.filter(cnsgnmentGoodsId, function(num){ return ((Number(num.split("_")[1])  ) != Number(deleteButtonId.split("_")[1]))}) ;
	
	calculateTotalQty();
	
	if(configuration.routeWiseSlabConfigurationAllowed == 'true'){
		calculateRouteWiseSlabRates();
		calculateTotalParcelSize();
	} 

	if(configuration.AllowAddingFreeSingleArticleInConsignment == 'true')
		calcTotalOnAddArticle();
	
	next = "quantity";
	setTimeout(function(){ document.getElementById('quantity').focus(); }, 10);

	if (configuration.VolumetricWiseAddArticle == 'true' && $('#volumetric').is(':checked')) {
	} else if(!isTokenWayBill)
		resetWeight();

	getWeightTypeRates();
	if(typeof getCFTWiseRate != 'undefined') getCFTWiseRate();
	if(typeof getCBMWiseRate != 'undefined') getCBMWiseRate();
	
	if(configuration.KilometerChargeTypeWiseRate == 'true')
		getKiloMeterWiseRate();
	
	if(typeof resetAjaxCallForRates != 'undefined') resetAjaxCallForRates();
	if(typeof getFixTypeRates != 'undefined') getFixTypeRates();
	
	if(noOfArticlesAdded == 0) {
		isConsignmentExempted				= false;
		carray = null;
		setDefaultSTPaidBy(Number($('#wayBillType').val()));
		configuredChargeTypeIdWithCharge	= {};
		fixedChargeRateObj					= {};
		applicableChargeRateObj				= {};
		disableFreightCharge				= false;
	}

	if(noOfArticlesAdded == 1 && ( $('#consignmentGoodsId1').val() == "" || $('#consignmentGoodsId1').val() == undefined)) {
		isConsignmentExempted				= false;
	}
	
	if(typeof setAOCcharge != 'undefined')
		setAOCcharge();
		
	if(typeof calculateChargedWeightFromSlabWeight != 'undefined') calculateChargedWeightFromSlabWeight();
	if(typeof calculateValuationCharge != 'undefined') calculateValuationCharge();
	if(typeof setRatesOnDeclaredValue != 'undefined') setRatesOnDeclaredValue();
	if(typeof calculateRiskCoverageOnDeclaredValue != 'undefined') calculateRiskCoverageOnDeclaredValue();
		
	if(configuration.packingTypeWiseMaxArticleValidate == 'true' && isCoverPackingTypeAdded) {
		configuration.disableBookingCharges = 'false';
		applyRates(); 
		isCoverPackingTypeAdded = false;
		resetCharges();
	};
	
	addAmountToFreightOnPerArticleData();
	return true;
}

function deleteConsignmentTableRow(deleteButtonId) {
	let num 				= deleteButtonId;
	let indexVal			= Number(num.split('_')[1]);
	let typeofPackingId 	= Number($("#typeofPackingId" + indexVal).html());
	let quantity			= Number($("#quantity" + indexVal).html());
	let consignmentGoodId	= Number($("#consignmentGoodsId" + indexVal).html()); 
	
	$('#articleTableRow' + indexVal).remove();
	delete countArticleRate[typeofPackingId + '_' + consignmentGoodId];
	delete articleWiseFreightRate[typeofPackingId + '_' + consignmentGoodId];
	delete consignmentDataHM[indexVal];
	delete consignmentEWayBillExemptedObj[typeofPackingId + '_' + consignmentGoodId + '_' + indexVal];
	noOfArticlesAdded --;
	
	if(noOfArticlesAdded == 0)
		removeConsignmentTables()

	if(configuration.isPackingGroupTypeWiseChargeAllow == 'true') {
		let chargeRate	= chargesRates[rate_values[0].chargeTypeMasterId];
		
		for(const element of PackingGroupMappingArr) {
			if(element.packingTypeMasterId == typeofPackingId && element.packingGroupTypeId == rate_values[0].packingGroupTypeId)
				packingGroupMappingCounter--;
		}

		if( noOfArticlesAdded == 0 || packingGroupMappingCounter != noOfArticlesAdded)
			setValueToTextField('charge' + rate_values[0].chargeTypeMasterId, "0");
		else {
			totalConsignmentQuantity	= getTotalAddedArticleTableQuantity();
			
			if(typeof chargeRate != 'undefined')
				setValueToTextField('charge' + rate_values[0].chargeTypeMasterId, getTotalAddedArticleTableQuantity() * chargeRate.chargeMinAmount);
		}
	} else if(configuration.isPackingGroupWiseRateApplicable == 'true') {
		if(!isValueExistInArray((configuration.execludedPackingTypeIds).split(','), typeofPackingId))
			totalConsignmentQuantity -= quantity;
	} else if(configuration.calculateLoadingChargeOnFreightAmount == 'true'
		&& !isValueExistInArray((configuration.PackingTypeToAddFreeSingleArticle).split(','), typeofPackingId))
			totalConsignmentQuantity -= quantity;
	
	if(isValueExistInArray((configuration.packingTypeIdINTaxIsNotAplicable).split(','), typeofPackingId))
		notAplicablePackingTypeId	= false;

	for(let j = 0; j < quantityTypeArr.length; j++) {
		let arrId = quantityTypeArr[j].split("_")[0];

		if(arrId == indexVal)
			quantityTypeArr.splice(j, 1);
	}
	
	delete quantityWiseChargeObj[indexVal];
	
	if(calcDDChargeArr != null && calcDDChargeArr != undefined) {
		for(let k = 0; k < calcDDChargeArr.length; k++) {
			let arrId = calcDDChargeArr[k].split("_")[0];

			if(arrId == indexVal)
				calcDDChargeArr.splice(k, 1);
		}
	}
	
	for( let i = 0; i < cnsgnmentGoodsId.length; i++){ if ( cnsgnmentGoodsId[i] === consignmentGoodId) { cnsgnmentGoodsId.splice(i, 1); }}
	
	for( let i = 0; i < consigAddedtableRowsId.length; i++){ if ( consigAddedtableRowsId[i] === indexVal) { consigAddedtableRowsId.splice(i, 1); }}
	
	if (configuration.VolumetricWiseAddArticle == 'true') {
		delete artActWeightArr['actweight_' + indexVal];
		delete artChrgWeightArr['chrgweight_' + indexVal];
		delete cftWeightArr['cftWeight' + indexVal];
		delete chrgWtArr['cftWeight' + indexVal];
		delete cftFixAmountArr[ indexVal];

		calulateTotalConsigmentWeight();
	}
}

function removeConsignmentTables() {
	$("#myTBody").hide();
	$("#myTBody1").hide();
	$('#myTableTd1').switchClass('width-100per', 'width-50per');
	$('#myTableTd').switchClass('width-100per', 'width-50per');
		
	$('#myTBody tr').remove();
	$('#myTBody1 tr').remove();
	
	idNum = 0;
	consigAddedtableRowsId	= [];
}

function getTotalAddedArticleTableQuantity() {
	var qtyTot 		= 0;
	var qtyAmtTot	= 0;
	var totalLoading	= 0;
	totalQuantityOfCartoon	= 0;
	var typeofPackingId = getPackingTypeId();
	var totalBuilty = 0;
	var totalDoorPickup = 0;
	var bracnhIdsForDoorPickUpCharge20		= (configuration.branchIdsToallowDoorPickUpCharge20).split(",");
	var bracnhIdsForLrWiseBuiltyCharge10	= (configuration.branchIdsToallowLrWiseBuiltyCharge10).split(",");

	if(consigAddedtableRowsId.length > 0) {
		for(const element of consigAddedtableRowsId) {
			if($('#quantity' + element).html() > 0) {
				qtyTot 					+= parseInt($('#quantity' + element).html());
				
				if(typeofPackingId == PACKING_TYPE_CARTOON)
					totalQuantityOfCartoon 	+= parseInt($('#quantity' + element).html());
			}

			if($('#qtyAmountTotal' + element).html() > 0)
				qtyAmtTot += parseInt($('#qtyAmountTotal' + element).html());
		}
	}

	if(configuration.calculateLoadingChargeOnFreightAmount == 'true'){
		if(!isManualWayBill || configuration.ApplyRateInManual == 'true'){
			if($('#wayBillType').val() != WAYBILL_TYPE_FOC) {
				let cityIdList 			= configuration.cityWiseBranchIdForCalculateLoadingChargesOnFreight;
				let branchList			= configuration.branchIdForCalculateLoadingChargesOnFreight;
	
				if(cityIdList != 0) {
					if(($('#wayBillType').val() == WAYBILL_TYPE_PAID) || ($('#wayBillType').val() == WAYBILL_TYPE_TO_PAY)) {
						let branchIdsList 		= branchList.split(',');
						let checkBranch 		= isValueExistInArray(branchIdsList, branchId);

						let cityList 		= cityIdList.split(',');
						let checkCity 		= isValueExistInArray(cityList, branchId);

						if(checkCity) {
							if(consigAddedtableRowsId.length > 0) {
								for(const element of consigAddedtableRowsId) {
									if($('#quantity' + element).html() > 0)
										qtyTot 		= parseInt($('#quantity' + element).html());

									if($('#qtyAmountTotal' + element).html() > 0)
										qtyAmtTot 	= parseInt($('#qtyAmountTotal' + element).html());

									let tbl_amt 	= qtyAmtTot / qtyTot;
									totalLoading 	+= calcLoadingChrg(tbl_amt, qtyTot);
								}
							}

							$('#charge' + LOADING).val(totalLoading);
						} else if(checkBranch) {
							totalLoading = totalConsignmentQuantity * 10;
							$('#charge' + LOADING).val(totalLoading);
						} else {
							totalLoading = totalConsignmentQuantity * 5;
							$('#charge' + LOADING).val(totalLoading);
						}
					}
				} else {
					if(consigAddedtableRowsId.length > 0) {
						for(const element of consigAddedtableRowsId) {
							typeofPackingId	= 0;
							
							if(isValueExistInArray(bracnhIdsForLrWiseBuiltyCharge10, branchId))
								totalBuilty = 0;
							
							if($('#quantity' + element).html() > 0)
								qtyTot 		= parseInt($('#quantity' + element).html());

							if($('#qtyAmount' + element).html() > 0)
								qtyAmtTot 	= parseInt($('#qtyAmount' + element).html());
							
							if($('#typeofPackingId' + element).html() > 0)
								typeofPackingId 	= parseInt($('#typeofPackingId' + element).html());

							if(isManualWayBill && configuration.ApplyRateInManual == 'true') {
								totalLoading 	+= calculateLoadingChargeOnFreightInManual(qtyAmtTot, qtyTot, typeofPackingId);
								totalBuilty 	+= calculateBuiltyChargeInManual(qtyAmtTot, qtyTot, typeofPackingId);
							} else {
								totalLoading 	+= calculateLoadingChargeOnFreight(qtyAmtTot, qtyTot, typeofPackingId);
								totalBuilty 	+= calculateBuiltyCharge(qtyAmtTot, qtyTot, typeofPackingId);
							}	
							
							if(isValueExistInArray(bracnhIdsForDoorPickUpCharge20, branchId))
								totalDoorPickup += calculateDoorPickUpCharge(qtyAmtTot, qtyTot, typeofPackingId);
							
							loadingValue	= totalLoading;
						}
						
						$('#charge' + LOADING).val(totalLoading);
						$('#charge' + BUILTY_CHARGE).val(totalBuilty);
						
						if(isValueExistInArray(bracnhIdsForDoorPickUpCharge20, branchId))
							$('#charge' + DOOR_PICKUP).val(totalDoorPickup);
					}
				}
			}
		}
	}

	TotalQty = parseInt(qtyTot);
	return TotalQty;
}

function getTotalAddedArticleSize() {
	var articleSize 		= 0;
	
	if(consigAddedtableRowsId.length > 0) {
		for(const element of consigAddedtableRowsId) {
			if($('#quantity' + element).html() > 0 
					&& $('#lengthCol' + element).html() > 0
					&& $('#breadthCol' + element).html() > 0)
			articleSize += parseInt($('#quantity' + element).html()) * parseInt($('#lengthCol' + element).html()) * parseInt($('#breadthCol' + element).html());
		}
	}
	
	return parseInt(articleSize);
}

function lrTypeWiseBookingAmountToGroupAdmin() {
	if(configuration.AddArticleForLMT != 'true') {
		if(configuration.ShowLRTypeWiseBookingAmountToGroupAdmin == 'true') {
			let LRTypeList	= (configuration.LRTypeToShowBookingAmountToGroupAdmin).split(',');
			
			if((isValueExistInArray(LRTypeList, $('#wayBillType').val()) && executive.executiveType == EXECUTIVE_TYPE_GROUPADMIN)
			|| !isValueExistInArray(LRTypeList, $('#wayBillType').val()))
				return true;
		} else
			return true;
	}
	
	return false;
}

var noOfClmn	 = 6;
function addConsignmentTableStructure(tableId) {
	
	$("#" + tableId).show();
	
	var tableRow	= createRowInTable('', '', 'background-color: blue;');
	var Baseone 	= createColumnInRow(tableRow, '', '', '', '', 'display: none', '');
	var qtyCol	 	= createColumnInRow(tableRow, '', 'titled', '50px', '', 'color: #fff', '');
	var artType 	= createColumnInRow(tableRow, '', 'titled', '130px', '', 'color: #fff', '');
	var contains 	= createColumnInRow(tableRow, '', 'titled', '120px', '', 'color: #fff', '');
	
	if(configuration.packageConditionSelection == 'true')
		var packageConditions 	= createColumnInRow(tableRow, '', 'titled', '120px', '', 'color: #fff', '');
	
	if(configuration.goodsClassificationSelection == 'true')
		var goodsClassification = createColumnInRow(tableRow, '', 'titled', '120px', '', 'color: #fff', '');
	
	if(lrTypeWiseBookingAmountToGroupAdmin())
		var artAmt	= createColumnInRow(tableRow, '', 'titled', '80px', '', 'color: #fff', '');
	
	if (configuration.routeWiseSlabConfigurationAllowed == 'true' && noOfClmn > 6) {
		var length	 	= createColumnInRow(tableRow, '', 'titled', '130px', '', 'color: #fff', '');
		var breadth 	= createColumnInRow(tableRow, '', 'titled', '120px', '', 'color: #fff', '');
		var weight	 	= createColumnInRow(tableRow, '', 'titled', '50px', '', 'color: #fff', '');
	} else if(configuration.VolumetricWiseAddArticle == 'true' && noOfClmn > 6) {
		var cftValueCol = createColumnInRow(tableRow, '', 'titled', '130px', '', 'color: #fff', '');
		var length	 	= createColumnInRow(tableRow, '', 'titled', '130px', '', 'color: #fff', '');
		var breadth 	= createColumnInRow(tableRow, '', 'titled', '120px', '', 'color: #fff', '');
		var height	 	= createColumnInRow(tableRow, '', 'titled', '50px', '', 'color: #fff', '');
		
		if(configuration.volumetricWeightCalculationBasedOnVolumetricFactor == 'true')
			var volFactor 	= createColumnInRow(tableRow, '', 'titled', '50px', '', 'color: #fff', '');
		
		if(configuration.showVolumetricActualWeight == 'true')
			var actWeight 	= createColumnInRow(tableRow, '', 'titled', '130px', '', 'color: #fff', '');
		
		var chrgWeight 	= createColumnInRow(tableRow, '', 'titled', '120px', '', 'color: #fff', '');
	} else if(configuration.WeightWiseConsignmentAmount == 'true' && noOfClmn > 6)
		var actWeight	= createColumnInRow(tableRow, '', 'titled', '130px', '', 'color: #fff', '');
	
	if(lrTypeWiseBookingAmountToGroupAdmin())
		var total	= createColumnInRow(tableRow, '', 'titled', '120px', '', 'color:#fff', '');
	
	var deleteButton	= createColumnInRow(tableRow, '', 'titled', '50px', '', 'color: #fff', '');
	
	appendValueInTableCol(Baseone, '');
	appendValueInTableCol(qtyCol, 'Qty');
	appendValueInTableCol(artType, ''+configuration.articleFeildLebel+' Type');
	appendValueInTableCol(contains, configuration.saidToContainsLebel);
	
	if(configuration.packageConditionSelection == 'true')
		appendValueInTableCol(packageConditions, 'Package');

	if(configuration.goodsClassificationSelection == 'true')
		appendValueInTableCol(goodsClassification, 'Goods Classi');
	
	if(lrTypeWiseBookingAmountToGroupAdmin())
		appendValueInTableCol(artAmt, ''+configuration.articleFeildLebel+' Amt');
	
	if (configuration.routeWiseSlabConfigurationAllowed == 'true' && noOfClmn > 6) {
		appendValueInTableCol(length, 'Length');
		appendValueInTableCol(breadth, 'Breadth');
		appendValueInTableCol(weight, 'Weight');
	} else if(configuration.VolumetricWiseAddArticle == 'true' && noOfClmn > 6) {
		appendValueInTableCol(cftValueCol, configuration.cftRateLabel);
		appendValueInTableCol(length, 'Length');
		appendValueInTableCol(breadth, 'Breadth');
		appendValueInTableCol(height, 'Height');
		
		if(configuration.volumetricWeightCalculationBasedOnVolumetricFactor == 'true')
			appendValueInTableCol(volFactor, 'Vol. Factor');

		if(configuration.showVolumetricActualWeight == 'true')
			appendValueInTableCol(actWeight, 'Act Wght');
			
		appendValueInTableCol(chrgWeight, configuration.volumetricChargeWeightLabel);
	} else if(configuration.WeightWiseConsignmentAmount == 'true' && noOfClmn > 6)
		appendValueInTableCol(actWeight, 'Actual Wght');
	
	if(lrTypeWiseBookingAmountToGroupAdmin())
		appendValueInTableCol(total, 'Total');
	
	appendValueInTableCol(deleteButton, "<a class='button-normal' style='color:white'><i class='fa fa-arrow-up'></i></a>");
	
	appendRowInTable(tableId, tableRow);
	
	/*
	if(typeof filterCFTValueOnCFTUnit !== 'undefined'){
		filterCFTValueOnCFTUnit();
	}
	*/ 
}

function checkaddConsignmentTableStructure() {
	if(document.getElementById('myTable').rows[0] == null) 
		addConsignmentTableStructure('myTBody');
	
	if(noOfClmn <= 6) {
		if(document.getElementById('myTable1').rows[0] == null) 
			addConsignmentTableStructure('myTBody1');
		else
			$("#myTBody1").show();
	}
	
	if(noOfClmn <= 6) {
		$('#myTableTd').switchClass('width-50per', 'width-100per');
		$('#myTableTd1').switchClass('width-50per', 'width-100per');
	} else {
		$('#myTableTd').switchClass('width-100per', 'width-50per');
		$('#myTableTd1').switchClass('width-100per', 'width-50per');
	}
}

function addConsignment() {
	let response;
		
	if(noOfClmn <= 6) {
		if(isAddLeftTable('myTable','myTable1'))
			response = addConsignmentRow(null);
		else
			response = addConsignmentRow(null);
	} else
		response = addConsignmentRow(null);
		
	if(!validateWeightRateFromRateMaster())
		return false;
	
	resetArticleDetails();
	
	return response;
}

function addConsignmentRow(consignmentDetails)	{
	var zero 					= 0;
	var artActWeight			= 0;
	var artChargeWeight			= 0;
	var cftWeight				= 0;
	var goodsClassificationName	= '';
	var visibleQuantityRateAmt	= $('#visibleQuantityRateAmt').val();
	let consignmentRemark		= $('#consignmentRemark').val();
	
	if(consignmentDetails != null) {
		var typeofPackingId			= consignmentDetails.packingTypeMasterId;
		var typeofPackingVal		= consignmentDetails.packingTypeName;
		var quantity				= consignmentDetails.quantity;
		var consignmentGoodsId		= consignmentDetails.consignmentGoodsId;
		var saidToContain			= consignmentDetails.saidToContain;
		
		if(typeof saidToContain === 'undefined' || saidToContain == 'undefined' || saidToContain == 'UNDEFINED')
			saidToContain			= '';
		
		var qtyAmount				= consignmentDetails.amount;
		var consignmentDetailsId	= consignmentDetails.consignmentDetailsId;
		var goodsClassificationId	= consignmentDetails.goodsClassificationId;
	} else {
		var typeofPackingId			= getPackingTypeId();
		var consignmentDetailsId	= 0;
		
		if($('#typeofPacking option:selected').text())
			var typeofPackingVal	= $('#typeofPacking option:selected').text();
		else
			var typeofPackingVal	= $('#typeofPacking').val();
		
		var quantity			= $('#quantity').val();
		var consignmentGoodsId	= $('#consignmentGoodsId').val();
		
		var packageConditionId		= $('#packageCondition').val();
		
		if($('#saidToContainSelect').exists() && $('#saidToContainSelect').is(":visible"))
			var saidToContain		= $("#saidToContainSelect option:selected").text();
		else
			var saidToContain		= $('#saidToContain').val();
			
		if($('#packageCondition').exists() && $('#packageCondition').is(":visible")){
			var packageCondition		= $("#packageCondition option:selected").text();
		}else
			var packageCondition		= $('#packageCondition').val();
			
		var cftRate 			= $('#cftRate').val();
		var length 				= $('#articleLength').val();
		var bredth 				= $('#articleBredth').val();
		var height 				= $('#articleHeight').val();
		var volumetricFactor	= $('#volumetricFactorId').val();
		var goodsClassificationId = $('#goodsClassification').val();
		var weight 				= $('#tempWeight').val();
		var qtyAmount			= $('#qtyAmount').val();
			
		goodsClassificationName		= $("#goodsClassification option:selected").text();
		
		if($('#artActWeight').val() > 0)
			artActWeight		= $('#artActWeight').val();
		
		if($('#artChargeWeight').val() > 0)
			artChargeWeight		= $('#artChargeWeight').val();
		
		if($('#artChargeWeight').val() > 0)
			cftWeight = $('#artChargeWeight').val();
	}

	let noOfArtToAdd		= configuration.noOfConsignmentToAdd;

	if(noOfArticlesAdded >= noOfArtToAdd) {
		showMessage('info', noOfArtToAddInfoMsg(noOfArtToAdd));
		resetArticleDetails();
		return false;
	}
	
	if (configuration.validateFovChargeOnDeclareValue === 'true' || $('#wayBillType').val() === WAYBILL_TYPE_FOC) {
		const packingTypeIdsOnFov = configuration.exemptedPackingTypeIdForFOVChargeValidationOnDeclareValue.split(',');

		if (noOfArticlesAdded > 0 && consigAddedtableRowsId.length > 0) {
			for (const element of consigAddedtableRowsId) {
				const packingTypeId = parseInt($('#typeofPackingId' + element).html(), 10);

				if (packingTypeId > 0) {
					const isPackingTypeExempted = isValueExistInArray(packingTypeIdsOnFov, packingTypeId);
					const isCurrentTypeExempted = isValueExistInArray(packingTypeIdsOnFov, typeofPackingId);

					if (isPackingTypeExempted !== isCurrentTypeExempted) {
						showMessage('error', selectMixArticleMsg);
						return false;
					}
				}
			}
		}
	}

	let packingTypeIdList 		= (configuration.packingTypeIdINTaxIsNotAplicable).split(',');
	
	if(isValueExistInArray(packingTypeIdList, typeofPackingId))
		notAplicablePackingTypeId	= true;

	if(configuration.isPackingGroupTypeWiseChargeAllow == 'true') {
		let rate_valueslocal = new Array();

		for (let key in RateHm) {
			rate_valueslocal.push(RateHm[key]);
		}
		
		for(const element of PackingGroupMappingArr) {
			//PackingGroup 	Cloth	2
			if(element.packingTypeMasterId == typeofPackingId && element.packingGroupTypeId == rate_valueslocal[0].packingGroupTypeId)
				totalConsignmentQuantity += parseInt(quantity);
		}
	} else if(configuration.isPackingGroupWiseRateApplicable == 'true') {
		let checkPackingType 		= isValueExistInArray((configuration.execludedPackingTypeIds).split(','), typeofPackingId);
		
		if(!checkPackingType)
			totalConsignmentQuantity += parseInt(quantity);
	} else if(configuration.calculateLoadingChargeOnFreightAmount == 'true') {
		let checkPackingType 	= isValueExistInArray((configuration.PackingTypeToAddFreeSingleArticle).split(','), typeofPackingId);
		
		if(!checkPackingType)
			totalConsignmentQuantity += parseInt(quantity);
	} else
		totalConsignmentQuantity += parseInt(quantity);
	
	idNum ++;
	addinqtyArr(idNum);
	consigAddedtableRowsId.push(idNum);
	
	if(consignmentGoodsId > 0)
		counterForNonEmpty++
	
	cnsgnmentGoodsId.push(consignmentGoodsId + "_" + idNum);
	consignmentEWayBillExemptedObj[typeofPackingId + "_" + consignmentGoodsId + "_" + idNum]	= isConsignmentEWayBillExempted;//global variable
	
	var tableRow	= createRowInTable('articleTableRow' + idNum, '', '');
	var Baseone 	= createColumnInRow(tableRow, '', '', '', '', 'display: none', '');
	var qtyCol	 	= createColumnInRow(tableRow, "quantity" + idNum, 'titled', '50px', '', '', '');
	var artType 	= createColumnInRow(tableRow, '', 'titled', '130px', '', '', '');
	var artTypeId 	= createColumnInRow(tableRow, "typeofPackingId" + idNum, 'titled', '130px', '', 'display: none', '');
	var contains 	= createColumnInRow(tableRow, '', 'titled', '120px', '', '', '');
	
	if(configuration.packageConditionSelection == 'true') {
		var packageConditions 			= createColumnInRow(tableRow, '', 'titled', '120px', '', '', '');
		var packageConditionMasterId 	= createColumnInRow(tableRow, "packageConditionId" + idNum, 'titled', '130px', '', 'display: none', '');
	}
	
	if(configuration.goodsClassificationSelection == 'true')
		var goodsClassification 	= createColumnInRow(tableRow, '', 'titled', '120px', '', '', '');
	
	if(lrTypeWiseBookingAmountToGroupAdmin()) 
		var artAmt	= createColumnInRow(tableRow, "qtyAmount" + idNum, 'titled', '50px', '', '', '');
	else
		var artAmt	= createColumnInRow(tableRow, "qtyAmount" + idNum, 'titled', '50px', '', 'display: none', '');
	
	if (configuration.routeWiseSlabConfigurationAllowed == 'true' && noOfClmn > 6) {
		var lengthCol 		= createColumnInRow(tableRow, 'lengthCol' + idNum, 'titled', '130px', '', '', '');
		var breadthCol 		= createColumnInRow(tableRow, 'breadthCol' + idNum, 'titled', '120px', '', '', '');
		var weightCol 		= createColumnInRow(tableRow, 'weightCol' + idNum, 'titled', '50px', '', '', '');
	} else if(configuration.VolumetricWiseAddArticle == 'true' && noOfClmn > 6) {
		var cftValueCol 	= createColumnInRow(tableRow, 'cftValueCol' + idNum, 'titled', '130px', '', '', '');
		var lengthCol 		= createColumnInRow(tableRow, 'lengthCol' + idNum, 'titled', '130px', '', '', '');
		var breadthCol 		= createColumnInRow(tableRow, 'breadthCol' + idNum, 'titled', '120px', '', '', '');
		var heightCol 		= createColumnInRow(tableRow, 'heightCol' + idNum, 'titled', '50px', '', '', '');
		
		if(configuration.volumetricWeightCalculationBasedOnVolumetricFactor == 'true')
			var volFactorCol 		= createColumnInRow(tableRow, 'volFactorCol' + idNum, 'titled', '50px', '', '', '');
		
		if(configuration.showVolumetricActualWeight == 'true')
			var actWeightCol	= createColumnInRow(tableRow, '', 'titled', '130px', '', '', '');
		
		var chrgWeightCol	= createColumnInRow(tableRow, 'chrgWeightCol' + idNum, 'titled', '120px', '', '', '');
	} else if(configuration.WeightWiseConsignmentAmount == 'true' && noOfClmn > 6)
		var actWeightCol	= createColumnInRow(tableRow, '', 'titled', '130px', '', '', '');
	
	if(lrTypeWiseBookingAmountToGroupAdmin()) 
		var totalCol	= createColumnInRow(tableRow, 'qtyAmountTotal' + idNum, 'titled', '120px', '', '', '');
	else
		var totalCol	= createColumnInRow(tableRow, 'qtyAmountTotal' + idNum, 'titled', '120px', '', 'display: none', '');
	
	let deleteButton	= createColumnInRow(tableRow, 'deleteButton' + idNum, 'titled', '5%', '', '', '');
	let goodsId			= createColumnInRow(tableRow, "consignmentGoodsId" + idNum, 'titled', '5%', '', 'display: none', '');
	let goodsClassificationCol	= createColumnInRow(tableRow, "goodsClassificationId" + idNum, 'titled', '5%', '', 'display: none', '');
	let visibleQuantityRateAmtCol	= createColumnInRow(tableRow, "visibleQuantityRateAmt" + idNum, 'titled', '5%', '', 'display: none', '');
	
	artActWeightArr['actweight_' + idNum] 	= artActWeight;
	artChrgWeightArr['chrgweight_' + idNum] = artChargeWeight;
	cftWeightArr['cftWeight' + idNum] = cftWeight;
	
	if(typeof filterCFTFixAmountOnCFTUnit != 'undefined')
		cftFixAmountArr[idNum] = filterCFTFixAmountOnCFTUnit(typeofPackingId, consignmentGoodsId, cftWeight);
	
	var copyStr		= escape(typeofPackingId + '_' + artActWeight + '_' + artChargeWeight + '_'+zero+'_'+zero+'_'+zero+'_'+qtyAmount+'_'+quantity+'_'+saidToContain+'_'+consignmentGoodsId+"_"+typeofPackingVal+"_"+consignmentDetailsId+"_"+length+"_"+bredth+"_"+weight + "_" + height + "_" + goodsClassificationId + "_" + visibleQuantityRateAmt+"_" + packageConditionId).replace(/\+/g,'%2b');
	var str 		= copyStr;
	
	appendValueInTableCol(Baseone, "<input name='checkbox2' id='checkbox2' type=checkbox value='"+str+"' checked>");
	
	let consignmentObject	= {};
	
	consignmentObject.packingTypeMasterId	= typeofPackingId;
	consignmentObject.actualWeight			= artActWeight;
	consignmentObject.chargeWeight			= artChargeWeight;
	consignmentObject.amount				= qtyAmount;
	consignmentObject.quantity				= quantity;
	consignmentObject.saidToContain			= saidToContain;
	consignmentObject.consignmentGoodsId	= consignmentGoodsId;
	consignmentObject.packingTypeName		= typeofPackingVal;
	consignmentObject.consignmentDetailsId	= consignmentDetailsId;
	consignmentObject.cftUnitId				= $('#cftUnit').val();
	consignmentObject.length				= length;
	consignmentObject.breadth				= bredth;
	consignmentObject.tempWeight			= weight;
	consignmentObject.height				= height;
	consignmentObject.volumetricFactor		= volumetricFactor;
	consignmentObject.goodsClassificationId	= goodsClassificationId;
	consignmentObject.visibleRate			= visibleQuantityRateAmt;
	consignmentObject.cftWeight				= cftWeight;
	consignmentObject.remark				= consignmentRemark;
	consignmentObject.cftRate				= cftRate;
	consignmentObject.packageConditionMasterId	= packageConditionId;

	consignmentDataHM[idNum]	= consignmentObject;

	appendValueInTableCol(qtyCol, quantity);
	appendValueInTableCol(artType, typeofPackingVal);
	appendValueInTableCol(artTypeId, typeofPackingId);

	if(configuration.SaidToContain == 'true')
		appendValueInTableCol(contains, saidToContain);
	else
		appendValueInTableCol(contains, '');
		
	if(configuration.packageConditionSelection == 'true') {
		appendValueInTableCol(packageConditions, packageCondition);
		appendValueInTableCol(packageConditionMasterId, packageConditionId);
	}
		
	if(configuration.goodsClassificationSelection == 'true')
		appendValueInTableCol(goodsClassification, goodsClassificationName);
	
	appendValueInTableCol(artAmt, qtyAmount);
	
	if (configuration.routeWiseSlabConfigurationAllowed == 'true' && noOfClmn > 6) {
		appendValueInTableCol(lengthCol, length);
		appendValueInTableCol(breadthCol, bredth);
		appendValueInTableCol(weightCol, weight);
	} else if(configuration.VolumetricWiseAddArticle == 'true' && noOfClmn > 6) {
		appendValueInTableCol(cftValueCol, cftRate);
		appendValueInTableCol(lengthCol, length);
		appendValueInTableCol(breadthCol, bredth);
		appendValueInTableCol(heightCol, height);
		
		if(configuration.volumetricWeightCalculationBasedOnVolumetricFactor == 'true')
			appendValueInTableCol(volFactorCol, volumetricFactor);
		
		if(configuration.showVolumetricActualWeight == 'true')
			appendValueInTableCol(actWeightCol, artActWeight);
		
		appendValueInTableCol(chrgWeightCol, artChargeWeight);
	} else if(configuration.WeightWiseConsignmentAmount == 'true' && noOfClmn > 6)
		appendValueInTableCol(actWeightCol, artActWeight);
	
	if(configuration.showTotalAmountInConsignmentTables == 'true')
		appendValueInTableCol(totalCol, calculateChargeAmount(configuration.QtyFlavor, qtyAmount, quantity));
	else
		appendValueInTableCol(totalCol, calculateChargeAmount(configuration.QtyFlavor, qtyAmount, 0));
	
	appendValueInTableCol(deleteButton, "<a href='#' id='delete_"+idNum+"' class='delete' onclick='deleteConsignments(this.id);' style='text-decoration: none;'>Delete</a>");
	appendValueInTableCol(goodsId, consignmentGoodsId);
	appendValueInTableCol(goodsClassificationCol, goodsClassificationId);
	appendValueInTableCol(visibleQuantityRateAmtCol, visibleQuantityRateAmt);
	
	if(noOfClmn <= 6) {
		if(noOfArticlesAdded % 2 == 0) 
			appendRowInTable('myTBody', tableRow);
		else 
			appendRowInTable('myTBody1', tableRow);
	} else
		appendRowInTable('myTBody', tableRow);

	noOfArticlesAdded ++;
	calculateTotalQty();
	//resetWeight();
	
	if(configuration.routeWiseSlabConfigurationAllowed == 'true')
		calculateTotalParcelSize();

	if(configuration.AllowAddingFreeSingleArticleInConsignment == 'true')
		calcTotalOnAddArticle();
	
	if (configuration.VolumetricWiseAddArticle == 'true' && $('#volumetric').is(':checked'))
		calulateTotalConsigmentWeight();
	
	//qtyAmt is globally defined
	if(qtyAmt > 0 && consignmentGoodsId > 0)
		countArticleRate[typeofPackingId + "_" + consignmentGoodsId] = qtyAmt;
	
	if(qtyAmt > 0 && configuration.disableRateIfFoundFromDB == 'true')
		articleWiseFreightRate[typeofPackingId + "_" + consignmentGoodsId] = qtyAmt;

	if(noOfArticlesAdded == 1) {
		//Calling from Rate.js file
		getWeightTypeRates();
		if(typeof getCFTWiseRate != 'undefined') getCFTWiseRate();
		if(typeof getCBMWiseRate != 'undefined') getCBMWiseRate();
		
		if(configuration.KilometerChargeTypeWiseRate == 'true')
			getKiloMeterWiseRate();
		
		getChargeWeightByPackingTypeAndParty(typeofPackingId);
		getArticleWiseWeightDifferenceConfigByPackingType(typeofPackingId);
	};

	if(configuration.isPackingGroupTypeWiseChargeAllow == 'true') {
		packingGroupMappingCounter = checkPackingGroupMapping(typeofPackingId);
		
		if(packingGroupMappingCounter != noOfArticlesAdded)
			$('#charge' + rate_values[0].chargeTypeMasterId).val(0);
		else if(chargesRates != null) {
			let chargeRate			= chargesRates[rate_values[0].chargeTypeMasterId];
				
			if(configuration.applyOnlyPartyWiseLRLrLevelCharge	== 'false') {
				if(chargeRate != undefined)
					$('#charge' + rate_values[0].chargeTypeMasterId).val(TotalQty * chargeRate.chargeMinAmount);
			} else if(configuration.applyOnlyPartyWiseLRLrLevelCharge == 'true') {
				if(chargeRate != undefined && Number(chargeRate.corporateAccountId) > 0)
					$('#charge' + rate_values[0].chargeTypeMasterId).val(TotalQty * chargeRate.chargeMinAmount);
			}
		}
	}

	if (configuration.VolumetricWiseAddArticle == 'true' && $('#volumetric').is(':checked'))
		calculateWeigthRate();
	
	calculateAndvalidateBuiltyChgValue();
	
	applyRates();
	
	if(typeof enableInsuranceChargeForBranch != 'undefined')
		enableInsuranceChargeForBranch();
	
	changeDeclareValue();
	if(isFixedArticleSlab) enableDisableInputField('qtyAmount', 'false');
}

function checkPackingGroupMapping(typeofPackingId) {
	let rate   = RateHm;
	rate_values = new Array();

	for (let key in rate) {
		rate_values.push(rate[key]);
	}

	for(const element of PackingGroupMappingArr) {
		if(element.packingTypeMasterId == typeofPackingId && element.packingGroupTypeId == rate_values[0].packingGroupTypeId)
			packingGroupMappingCounter++;
	}
	
	return packingGroupMappingCounter;
}

function validateAddArticle() { 
	let wayBillTypeIds = [];
	
	if(configuration.skipRateValidationForManualLrTypes != undefined)
		wayBillTypeIds	 = configuration.skipRateValidationForManualLrTypes.split(',');
	
	let wayBillType 	 = $('#wayBillType').val();	
	
	if (isManualWayBill && wayBillTypeIds.includes(wayBillType))
		return true;

	if(configuration.ChargeType == 'true' && !validateInput(1, 'chargeType', 'chargeType', 'packageError',  chargeTypeErrMsg))
		return false;

	if (!validateBusinessType())
		return false;
		
	if(!validatePackageCondition()) 
		return false;
		
	if(executive.countryId == NIGERIA) {
		quantityErrMsg				= iconForErrMsg + ' Please, Enter No. of ' + configuration.articleFeildLebel + ' !';
		articleTypeErrMsg			= iconForErrMsg + ' Plaese, Select ' + configuration.articleFeildLebel + ' Type !';
		saidToContaionErrMsg		= iconForErrMsg + ' Please, Enter ' + configuration.saidToContainsLebel + ' !';
		properSaidToContaionErrMsg	= iconForErrMsg + ' Please, Select Proper ' + configuration.saidToContainsLebel + ' !';
		quantityAmountErrMsg		= iconForErrMsg + ' Please, Enter ' + configuration.articleFeildLebel + ' Amount !';
	}

	if(configuration.Qty == 'true' && !validateInput(1, 'quantity', 'quantity', 'packageError',  quantityErrMsg))
		return false;

	if(configuration.ArticleType == 'true' && $('#typeofPacking').exists()
		&& !validateInput(1, 'typeofPacking', 'typeofPacking', 'packageError',  articleTypeErrMsg))
		return false;
	
	if(configuration.ArticleType == 'true' && $('#typeofPackingId').exists()
		&& !validateInputTextFeild(1, 'typeofPackingId', 'typeofPacking', 'error', articleTypeErrMsg))
			return false;
			
	let typeofPackingId = getPackingTypeId();
	
	if(!validatedSelectedPackingTypeForToPayBooking(typeofPackingId)) return false;
			
	if(!validatedSelectedPackingTypeOnArticle(typeofPackingId)) {
		showMessage('error', 'You can only book ' + packingTypeNameArrayForAllow.join(', ') + ' for Article type !');
		$('#quantity').focus();
		return false;
	}
			
	if(validatedSelectedPackingTypeOnWeight(typeofPackingId)) {
		showMessage('error', 'You can not book ' + packingTypesNameHM[typeofPackingId] + ' for Weight type, book in Article type !');
		$('#quantity').focus();
		return false;
	}

	if(configuration.SaidToContainValidate == 'true' || configuration.validateSaidToContainFromAutoComplete == 'true') {
		if(configuration.validateSaidToContainFromAutoComplete == 'true'){
			if (configuration.SaidToContainAutocomplete == 'true') {
				let saidToContainValue = $('#saidToContain').val();
				
				if(saidToContainValue.length > 0
					&& !validateInput(1, 'consignmentGoodsId', 'saidToContain', 'packageError',  properSaidToContaionErrMsg))
					return false;
			}
		} else {
			if (configuration.SaidToContain == 'true') {
				if($('#saidToContainSelect').exists() && $('#saidToContainSelect').is(":visible")) {
					if(!validateInputTextFeild(1, 'saidToContainSelect', 'saidToContainSelect', 'error', saidToContaionErrMsg))
						return false;
				} else if(!validateInputTextFeild(1, 'saidToContain', 'saidToContain', 'error', saidToContaionErrMsg))
					return false;
			}

			if(configuration.SaidToContainAutocomplete == 'true'
				&& !validateInput(1, 'consignmentGoodsId', 'saidToContain', 'packageError',  properSaidToContaionErrMsg))
				return false;
		}
	}
	
	if(!validateSaidToContainRemark()) return false;
	
	if (!validateRateFromRateMaster()) return false;

	if (($('#wayBillType').val() == WAYBILL_TYPE_CREDIT && configuration.allowZeroAmountInTBB == 'false') || ($('#wayBillType').val() == WAYBILL_TYPE_TO_PAY && configuration.allowZeroAmountInToPay == 'false') || ($('#wayBillType').val() == WAYBILL_TYPE_PAID && configuration.allowZeroAmountInPaid == 'false')) {
		if($('#chargeType').val() == CHARGETYPE_ID_QUANTITY
			&& (configuration.QTYAmt == 'true') && configuration.AllowAddingFreeSingleArticleInConsignment == 'false'
			&& !isFixedArticleSlab
			&& !validateInput(1, 'qtyAmount', 'qtyAmount', 'packageError',  quantityAmountErrMsg))
				return false;
	}
	
	if(!minimumQtyAmnt()) return false;
	if(!validateArticleType()) return false;
	if(!validateBeforeAddArticle()) return false;
	
	if(isFreightChargeEnableBranchList && $('#typeofPacking').val() == PACKING_TYPE_GANTH
			&& $('#wayBillType').val() == WAYBILL_TYPE_CREDIT)
		return true;
	
	if(isFreightChargeEnableBranchListForTopay && $('#typeofPacking').val() == PACKING_TYPE_NAG
			&& $('#wayBillType').val() == WAYBILL_TYPE_TO_PAY)
		return true;

	if(configuration.AllowAddingFreeSingleArticleInConsignment == 'true') {
		if($('#qtyAmount').exists() && $('#qtyAmount').is(":visible")) {
			let qtyAmount 	= document.getElementById('qtyAmount');

			let packingTypeList 		= (configuration.PackingTypeToAddFreeSingleArticle).split(',');

			if(!qtyAmount.disabled && qtyAmount.value == 0) {
				let checkPackingType	= isValueExistInArray(packingTypeList, typeofPackingId);

				if(checkPackingType && totalConsignmentAmt > 0 && consignmentWithZeroAmtFound == 0) {
					if($('#quantity').val() > 1) {
						showMessage('error', '<i class="fa fa-info-circle"></i> Only one Cover is allowed free.');
						changeTextFieldColor('quantity', '', '', 'red');
						return false;
					}

					return true;
				}

				showMessage('error', quantityAmountErrMsg);
				changeTextFieldColor('qtyAmount', '', '', 'red');
				return false;
			}
		}
	}
	
	if (configuration.VolumetricWiseAddArticle == 'true' && $('#volumetric').is(':checked')) {
		if(configuration.hideCFTValueFieldOnBookingPage == 'false' && !validateCFTValue())
			return false;
		
		if(configuration.showVolumetricActualWeight == 'true' 
			&& !validateInput(1, 'artActWeight', 'artActWeight', 'packageError',  '<i class="fa fa-info-circle"></i> Enter Actual Weight !'))
			return false;
	}
	
	if(parseInt($('#chargeType').val()) == CHARGETYPE_ID_KILO_METER && distance <= 0) {
		showMessage('error', 'Please configure distance from source to destination !');
		return;
	}
	
	if(configuration.gstNumberValidationForAnyOneParty == 'true' && !validateGstNumberForOnyOneParty())
		return false;
	
	if(configuration.packingTypeWiseMaxArticleValidate == 'true' && !validatePackingTypeQty()){return false;}

	return checkMinimumQuantityAmountForPackingTypes();
}

function checkAndAddConsignment() { // Name Change from getCharges() {
	noOfClmn	= 6;
	calcDDCharge = false;
	
	if (configuration.routeWiseSlabConfigurationAllowed == 'true' || configuration.routeWiseSlabConfigurationAllowed == true)
		noOfClmn 	= noOfClmn + 3;
	else if(configuration.VolumetricWiseAddArticle == 'true' && $('#volumetric').is(':checked'))
		noOfClmn	= noOfClmn + 5;
	
	checkaddConsignmentTableStructure();
	
	if(addConsignment() == false)
		return false;
}

function addinqtyArr(idNum) {
	if($('#searchRate').exists() && $('#searchRate').val() != "")
		quantityTypeArr.push(idNum + "_" + $('#searchRate').val());
	
	if(quantityWiseChargeAmount != null && Object.keys(quantityWiseChargeAmount).length > 0)
		quantityWiseChargeObj[idNum] = quantityWiseChargeAmount;
	
	$('#searchRate').val("");
	quantityWiseChargeAmount = null;

	if($('#ddcCharge').exists() && $('#ddcCharge').val() != "")
		calcDDChargeArr.push(idNum + "_" + $('#ddcCharge').val());
	
	$('#ddcCharge').val("");
}

function changeConsignmentAmount() {
	let freightAmount = $("#charge" + FREIGHT).val();
	$('#consignmentAmount').val(freightAmount);
}

function getConsignmentAmount(jsonObject) {
	if ($('#consignmentAmount') != 0)
		jsonObject.consignmentAmount	= $('#consignmentAmount').val();
}

function calculateTotalQty() {
	TotalQty = getTotalAddedArticleTableQuantity();

	$('#totalQty').html(TotalQty);
}

function calculateTotalParcelSize(){
	TotalSize = getTotalAddedArticleSize();
	
	$('#totalSize').html(TotalSize);
}

function calcTotalOnAddArticle() {
	let packingTypeId				= 0;
	let qtyAmount					= 0;
	consignmentWithZeroAmtFound		= 0;
	let wbType					= parseInt($('#wayBillType').val());
	totalQuantityOfCartoon			= 0;
	
	let typeofPackingId = getPackingTypeId();
	
	if(isFreightChargeEnableBranchList && typeofPackingId == PACKING_TYPE_GANTH && wbType == WAYBILL_TYPE_CREDIT)
		return;

	if(isFreightChargeEnableBranchListForTopay && typeofPackingId == PACKING_TYPE_NAG && wbType == WAYBILL_TYPE_TO_PAY)
		return;

	let packingTypeList = (configuration.PackingTypeToAddFreeSingleArticle).split(',');
	let qtyAmountTotal	= 0;

	if(consigAddedtableRowsId.length > 0) {
		for(const element of consigAddedtableRowsId) {
			if($('#typeofPackingId' + element).html() > 0)
				packingTypeId 	= parseInt($('#typeofPackingId' + element).html());
			
			if($('#qtyAmountTotal' + element).html() > 0)
				qtyAmount		= parseFloat($('#qtyAmountTotal' + element).html());
				
			if(packingTypeId == PACKING_TYPE_CARTOON && $('#quantity' + element).html() > 0)
				totalQuantityOfCartoon 	+= parseInt($('#quantity' + element).html());
			
			qtyAmountTotal			+= qtyAmount;
			totalConsignmentAmt		= totalConsignmentAmt + qtyAmount;
			
			let checkPackingType	= isValueExistInArray(packingTypeList, packingTypeId);

			if(checkPackingType && qtyAmount == 0)
				consignmentWithZeroAmtFound++;
		}
	}
	
	if(isBookingDiscountAllow)
		totalConsignmentAmt = qtyAmountTotal - $('#discount').val();
	
	if(configuration.CustomAmountCalculation == 'true')
		calculateBranchWiseDiscountOnLoading(qtyAmountTotal);
}

function getTotalAddedArticleWeight() {
	let articleWeight 		= 0;
	let totalParcelWeight	= 0;
	
	if(consigAddedtableRowsId.length > 0) {
		for(const element of consigAddedtableRowsId) {
			if($('#quantity' + element).html() > 0 && $('#weightCol' + element).html() > 0)
				articleWeight += parseInt($('#quantity' + element).html()) * parseInt($('#weightCol' + element).html());
		}
	}
	
	totalParcelWeight = parseInt(articleWeight);
	return totalParcelWeight;
}

function validateConsignmentTables() {
	//Check if consignment missing
	let table_1 = document.getElementById("myTable");
	
	if(executive.countryId == NIGERIA)
		addConsignmentErrMsg	= iconForErrMsg + ' Please, Add at least one ' + configuration.articleDetailsLebel + ' !';

	if(table_1 != null) {
		if(consigAddedtableRowsId.length <= 0) {
			showMessage('error', addConsignmentErrMsg);
			changeError1('quantity','0','0');
			return false;
		} else {
			removeError('quantity');
			hideAllMessages();
		};
	}
	return true;
}

function makeChargeEditable() {
	let riskallocation 		= getValueFromInputField("riskallocation");
	let decVal 				= $('#declaredValue').val();
	let chargeRate			= null;
	let inschargeRate		= null;
	let chargeMinAmount		= 0;

	if(chargesRates != undefined) {
		chargeRate			= chargesRates[CARRIER_RISK_CHARGE];
		inschargeRate		= chargesRates[CR_INSUR_BOOKING];
	}

	if(riskallocation ==  CARRIER_RISK) {
		$('#charge' + CARRIER_RISK_CHARGE).removeAttr("readonly");

		if(chargeRate != null && chargeRate != undefined) {
			chargeMinAmount	= chargeRate.chargeMinAmount;
			
			if(configuration.CarrierRiskCompare == 'true') {
				if(decVal <= Number(configuration.CarrierRiskComparableValue))
					$('#charge' + CARRIER_RISK_CHARGE).val(configuration.defaultCarrierRiskCharge);
				else if(chargeRate.ispercent == true)
					$('#charge' + CARRIER_RISK_CHARGE).val((Math.round(chargeMinAmount * decVal) / 100));
				else
					$('#charge' + CARRIER_RISK_CHARGE).val(chargeMinAmount);
			} else
				$('#charge' + CARRIER_RISK_CHARGE).val(chargeMinAmount);
		}

		if(inschargeRate != null && inschargeRate != undefined) {
			//setValueToTextField('charge' + CR_INSUR_BOOKING,(Math.round(inschargeRate.chargeMinAmount * decVal)/100));
		}
		calculateCarrierRiskPerArticle();
		calcTotal();
	} else {
		$('#charge' + CARRIER_RISK_CHARGE).prop("readonly", "true");
		$('#charge' + CARRIER_RISK_CHARGE).val(0);
		calcTotal();
	}
}

function calculateCarrierRiskPerArticle() {
	if(configuration.calculateCarrierRiskPerArticle == 'true') {
		let branchSubregionList = (configuration.branchSubregionMappingIdsForChargeCalculation).split(",");
		
		for(const element of branchSubregionList) {
			let srcDestList 	= element.split("_");
			let sourceBranchId  = parseInt(srcDestList[0]);
			let destSubregionId = parseInt(srcDestList[1]);
			let rate 			= parseInt(srcDestList[2]);
		
			if(sourceBranchId == branchId && destSubregionId == $('#destinationSubRegionId').val() && $('#chargeType').val() == CHARGETYPE_ID_QUANTITY)
				$('#charge' + CARRIER_RISK_CHARGE).val(rate * TotalQty);
		}
	}
}

function saveSaidToContain() {
	setNextPreviousForSaidToContain();

	if(!validateInput(1, 'newSaidToConatainName', 'newSaidToConatainName', 'addNewDriverErrorDiv', saidToContaionErrMsg))
		return false;

	let newSaidToContainName = $('#newSaidToConatainName').val();

	let jsonObject					= new Object();

	jsonObject.filter				= 3;
	jsonObject.newSaidToContainName	= newSaidToContainName;

	let jsonStr = JSON.stringify(jsonObject);

	$.getJSON("Ajax.do?pageId=9&eventId=16",
			{json:jsonStr}, function(data) {
				if (!jQuery.isEmptyObject(data)) {
					if(data.saved) {
						$("#consignmentGoodsId").val(data.id);
						$("#saidToContain").val(newSaidToContainName);
						HideSaidToContainDialog();
					} else {
						alert(data.Exist);
					}
				}
			});
}

function calulateTotalConsigmentWeight() {
	if (configuration.VolumetricWiseAddArticle == 'false') 
		return;
		
	if(!$('#volumetric').is(':checked')){ 
        if (configuration.checkWeightDifference == 'true') {
            let actualWeight 	= $('#actualWeight').val();
            let chargedWeight   = $('#chargedWeight').val();
             if(actualWeight > 100 && Math.abs(Number(actualWeight) - Number(chargedWeight)) > configuration.weightDifferenceConfig) {
            	alert("Please Enter Volumetric Data !!");
            	setTimeout(function(){ $('#chargedWeight').focus(); }, 0);            	
            	return false;
      		  }
          }
        	return;
		}
		
	let artActWeight	= 0;
	let artChrgWeight	= 0;
	let actualWeight	= $('#actualWeight').val();
	let cftWeight		= 0;
	let fixAmount		= 0;
	
	for (let [key, value] of Object.entries(artActWeightArr)) {
		artActWeight	+= Number(value);
	}
	
	for (let [key, value] of Object.entries(artChrgWeightArr)) {
		artChrgWeight	+= Number(value);
	}
	
	for (let [key, value] of Object.entries(cftWeightArr)) { 
		cftWeight	+= Number(value);
	}
	
	if(typeof filterCFTFixAmountOnCFTUnit != 'undefined') {
		for (let [key, value] of Object.entries(cftFixAmountArr)) {  
			fixAmount	+= Number(value);
		}
	
		$('#fixAmount').val(Number(fixAmount.toFixed(2)));
		
		if(fixAmount > 0 && fixAmount > $('#charge' + FREIGHT).val())
			$('#charge' + FREIGHT).val(Number(fixAmount.toFixed(2)));
	}
	
	if(configuration.minChargedWeightForVolumetric == 'true' && configuration.MinChargedWeight > artChrgWeight)
		artChrgWeight = configuration.MinChargedWeight;
	
	if(configuration.showVolumetricActualWeight == 'true')
		$('#actualWeight').val(artActWeight.toFixed(2));
	
	$('#cftWeight').val(Number(cftWeight.toFixed(2)));
	
	if(configuration.volumetricAndActualWeightHigherValueInChargedWeightField == 'true') {
		if(Number(actualWeight) > Number(artChrgWeight.toFixed(2)))
			$('#chargedWeight').val(actualWeight);
		else
			$('#chargedWeight').val(artChrgWeight.toFixed(2));
	} else if(configuration.volumetricAndChgWghtHigherValueOnChargeWgtField == 'true') {
		if($('#cftWeight').exists()) {
			if(artActWeight > cftWeight)
				$('#chargedWeight').val(artActWeight);
			else
				$('#chargedWeight').val(cftWeight);
		} else if(Number(actualWeight) > Number(artChrgWeight.toFixed(2)))
			$('#chargedWeight').val(actualWeight);
		else
			$('#chargedWeight').val(artChrgWeight.toFixed(2));
	} else if(configuration.cftWeightCalcInINCH == 'true')
		calculateVolumetricChargeWeight();
	else
		$('#chargedWeight').val(artChrgWeight.toFixed(2));
}

function validateBeforeAddArticle() {
	if(configuration.CustomAmountCalculation == 'false' || $('#chargeType').val() != CHARGETYPE_ID_QUANTITY) return true;
	
	if(!checkLeastAmount()) return false;
	
	if(!isBranchListForSkipAmountValidation) {
		let wbType	= parseInt($('#wayBillType').val());
		
		if(wbType != WAYBILL_TYPE_FOC) {
			let packingTypeId		= $('#typeofPacking').val();
			let amount				= $('#qtyAmount').val();
			
			if(packingTypeId == PACKING_TYPE_CARTOON || packingTypeId == PACKING_TYPE_BANDAL) { //document.getElementById('typeofPacking').value == 25 chifBandal -- document.getElementById('typeofPacking').value == 35 Gatis Bandal -- document.getElementById('typeofPacking').value == 37 Gits Bandal -- document.getElementById('typeofPacking').value == 55 Pipe Bandal -- document.getElementById('typeofPacking').value == 72 Tyre Bundle -- document.getElementById('typeofPacking').value == 73 Wire Bundle
				let cartoonBranchId			= configuration.branchIdForCartoonPackingTypeRate.split(',');
		  		let corporateBillingPartyId = $('#billingPartyId').val();
		  		let	branchId 			 	= configuration.branchIdForConvenienceCharge.split(',');
		  		let	billingPartyId 		 	= configuration.billingPartyIdForConvenienceCharge.split(',');

		  		if(isValueExistInArray(branchId, executive.branchId) && isValueExistInArray(billingPartyId, corporateBillingPartyId) && amount < 140) {
		  			showMessage('error',  "You can not enter frieght less than Rs. 140 for this packing type !!");
					return false;
		  		} else if(isValueExistInArray(cartoonBranchId, executive.branchId) && packingTypeId == PACKING_TYPE_CARTOON && amount < 120) {
					showMessage('error',  "You can not enter frieght less than Rs. 120 for this packing type !!");
					return false;
				} else if(amount < 80) {
					showMessage('error',  "You can not enter frieght less than Rs. 80 for this packing type !!");
					return false;
				}
			}
		}
	}
	
	return true;
}

function checkLeastAmount() {
	let wbType					= parseInt($('#wayBillType').val());
	
	isFreightChargeEnableGanth					= false;
	isFreightChargeEnableBranchListForTopayNAG	= false;
	var branchArray								= new Array();
	
	if(configuration.branchesToExcludeLoadingChargeOnFreightInChargeTypeWeight != undefined)
		 branchArray 			= (configuration.branchesToExcludeLoadingChargeOnFreightInChargeTypeWeight).split(",");
	
	var branchAllowedForExcludeLoadingChargeOnFreight  	= isValueExistInArray(branchArray, executive.branchId);  
	
	if(wbType != WAYBILL_TYPE_FOC) {
		let packingTypeId		= $('#typeofPacking').val();
		let amount				= $('#qtyAmount').val();
		let branchIds140Rate	= (configuration.branchIdsToallowMinimumRate140).split(",");
		let branchIds120Rate	= (configuration.branchIdsToallowMinimumRate120).split(",");
		
		if(configuration.allowMinimumRate140 == true || configuration.allowMinimumRate140 == 'true' 
			&& packingTypeId == PACKING_TYPE_LIFFAFA
			&& packingTypeId == PACKING_TYPE_PACKET
			&& packingTypeId == PACKING_TYPE_LETTER 
			&& isValueExistInArray(branchIds140Rate, executive.branchId) 
			&& amount < 140){
				showMessage('error',  "Booking not allowed less than Rs. 140 !");
				return false;
		} 
		
		if($('#wayBillType').val() == WAYBILL_TYPE_TO_PAY || $('#wayBillType').val() == WAYBILL_TYPE_PAID) {
			if((isValueExistInArray(branchIds120Rate, executive.branchId) && amount < 120
					&& packingTypeId != PACKING_TYPE_LIFFAFA
					&& packingTypeId != PACKING_TYPE_PACKET
					&& packingTypeId != PACKING_TYPE_LETTER
					&& packingTypeId != PACKING_TYPE_MOTOR_CYCLE
					&& packingTypeId != PACKING_TYPE_SCOOTY)) {
				showMessage('error',  "Booking not allowed less than Rs. 120 !");
				return false;
			}
		}
		
		if(isBranchListForSkipAmountValidation)
			return true;
		
		if(isFreightChargeEnableBranchList && packingTypeId == PACKING_TYPE_GANTH && wbType == WAYBILL_TYPE_CREDIT) {
			isFreightChargeEnableGanth	= true;
			return true;
		}
		
		if(isFreightChargeEnableBranchListForTopay && packingTypeId == PACKING_TYPE_NAG && wbType == WAYBILL_TYPE_TO_PAY) {
			isFreightChargeEnableBranchListForTopayNAG	= true;
			return true;
		}
		
		if(packingTypeId == PACKING_TYPE_LETTER && amount < 40) {
			showMessage('error',  "Letter Booking not allowed less than Rs. 40 !");
			return false;
		} else if(packingTypeId == PACKING_TYPE_LIFFAFA && amount < 50) {
			showMessage('error',  "Liffafa Booking not allowed less than Rs. 50 !");
			return false;
		} else if(packingTypeId == PACKING_TYPE_PACKET && amount < 70) {
			showMessage('error', "Packet Booking not allowed less than Rs. 70 !");
			return false;
		} else if(packingTypeId == PACKING_TYPE_MOTOR_CYCLE && amount < 1800) {
			showMessage('error',  "Booking not allowed less than Rs. 1800 !");
			return false;
		} else if(packingTypeId == PACKING_TYPE_SCOOTY && amount < 1350) {
			showMessage('error',  "Booking not allowed less than Rs. 1350 !");
			return false;
		} else if(((packingTypeId != PACKING_TYPE_LETTER && packingTypeId != PACKING_TYPE_LIFFAFA
				&& packingTypeId != PACKING_TYPE_PACKET && packingTypeId != PACKING_TYPE_COVER_NEW) &&
				amount < 100) && !branchAllowedForExcludeLoadingChargeOnFreight) {
			if(isNewFreightChargeBranchList && packingTypeId == PACKING_TYPE_CARTOON)
				return true;

			if(isPackingTypefreightChargeBranchList && packingTypeId == PACKING_TYPE_BOOK_POLYTHIN)
				return true;

			showMessage('error',  "Booking not allowed less than Rs. 100 !");
			return false;
		}
	}
	
	return true;
}

function changeDeclareValue() {
	if(configuration.packingTypeIdsToChangeDeclareValue <= 0)
		return
	
	declareValueChanges		= true;
		
	let singleFormTypes		= document.getElementById('singleFormTypes');
	
	let prevDeclareValue	= $('#declaredValue').val();
	
	let packingTypeIdsToChangeDeclareValue	= (configuration.packingTypeIdsToChangeDeclareValue).split(',');
	
	if(consigAddedtableRowsId.length > 0) {
		for(const element of consigAddedtableRowsId) {
			if($('#typeofPackingId' + element).html() > 0)
				packingTypeId 	= parseInt($('#typeofPackingId' + element).html());
			
			if(isValueExistInArray(packingTypeIdsToChangeDeclareValue, packingTypeId)) {
				$('#declaredValue').val(0);
				declareValueChanges			= false;
				singleFormTypes.disabled  	= false;
				break;
			}
		}
	}
	
	if(declareValueChanges)
		$('#declaredValue').val(prevDeclareValue);
}

function resetConsignmentAmountOnWeight() {
	for(var i = 0; i < consigAddedtableRowsId.length; i++) {
		$('#qtyAmount' + consigAddedtableRowsId[i]).html(0);
		$('#qtyAmountTotal' + consigAddedtableRowsId[i]).html(0);
	}
}

function validatePackingTypeQty() {
	let totalPackingType		= (configuration.packingTypeIdAndMaxNoOfArticleAllowed).split(',');
	
	for(const element of totalPackingType) {
		let packingTypeId 		= element.split('_')[0];
		let maxQty 				= element.split('_')[1];
		
		if(consigAddedtableRowsId.length > 0 && isCoverPackingTypeAdded) {
			showMessage('error', 'Other Consignment Can Not  Added With Packing Type Cover/Packet !');
			return false;
		}
		
		if((Number(getPackingTypeId()) == packingTypeId)) {
			if(consigAddedtableRowsId.length > 0) {
				showMessage('error', ' Can Not Add Packing Type Cover/Packet with other Consignment !');
				return false;
			}
			
			if(Number($('#quantity').val()) > maxQty) {
				let typeofPacking	= '';
				
				if(configuration.allowPackingTypeAutocompleteWithCombobox == 'true')
					typeofPacking	= $('#typeofPacking').val();
				else
					typeofPacking	= $("#typeofPacking option:selected").text();
				
				showMessage('error', 'Qty Can Not Be More than ' + maxQty + ' For Packing Type '+ typeofPacking +' !');
				return false;
			}
			
			configuration.disableBookingCharges = 'true';
			isCoverPackingTypeAdded = true;
		}
	}
	
	return true;
}

function getPackingTypeId() {
	if($('#typeofPackingId').val() > 0)
		return $('#typeofPackingId').val();
	else if($('#typeofPacking').val() > 0)
		return $('#typeofPacking').val();
		
	return 0;
}

function validatedSelectedPackingTypeOnArticle(packingTypeId) {
	if(configuration.AllowSelectedPackingTypeOnChargeTypeArticle == undefined
		|| configuration.AllowSelectedPackingTypeOnChargeTypeArticle == 'false' 
		|| configuration.ArticleType == 'false' 
		|| $('#chargeType').val() != CHARGETYPE_ID_QUANTITY)
		return true;
	
	//WayBillSetReset.js
	if(checkPartyWisePackingRateList()) return true;

	let packingTypeList		= (configuration.AllowedPackingTypeOnChargeTypeArticle).split(',');
	
	packingTypeNameArrayForAllow	= [];
	
	for(const element of packingTypeList) {
		if(element > 0 && packingTypesNameHM[element] != undefined && packingTypesNameHM[element] != null)
			packingTypeNameArrayForAllow.push(packingTypesNameHM[element]);
	}
	
	return isValueExistInArray(packingTypeList, packingTypeId);
}

function validatedSelectedPackingTypeOnWeight(packingTypeId) {
	if(configuration.NotAllowSelectedPackingTypeOnChargeTypeWeight == 'false'
		|| $('#chargeType').val() == CHARGETYPE_ID_QUANTITY)
		return false;
		
	let packingTypeList		= (configuration.NotAllowedPackingTypeOnChargeTypeWeight).split(',');
	
	return isValueExistInArray(packingTypeList, packingTypeId);
}

function calculateVolumetricChargeWeight() {
	let chargeWeight 		= 0;
	
	if(consigAddedtableRowsId.length > 0) {
		for(const element of consigAddedtableRowsId) {
			if($('#quantity' + element).html() > 0 && $('#cftValueCol' + element).html() > 0 && $('#chrgWeightCol' + element).html() > 0)
				chargeWeight += parseInt($('#quantity' + element).html()) * parseInt($('#cftValueCol' + element).html()) * parseInt($('#chrgWeightCol' + element).html());
		}
	}
	
	$('#chargedWeight').val(chargeWeight);
}

function validateActualAndChargeWeightForPackingType() {
	if(configuration.validatePackingTypesForFixedWeight == 'false') return false;
	
	let packingTypeList = (configuration.packingTypeIdsWithWeightToValidateForFixedWeight).split(',');
	let actualWeight 	= Number($('#actualWeight').val());
	
 	if(consigAddedtableRowsId.length > 0 && packingTypeList.length > 0) {
		for(const element1 of consigAddedtableRowsId) {
			let packingTypeId	= 0;
			
			if($('#typeofPackingId' + element1).html() > 0)
				packingTypeId 	= parseInt($('#typeofPackingId' + element1).html());
			
			for(const element of packingTypeList) {
				if (packingTypeId == Number(element.split('_')[0]) && actualWeight > Number(element.split('_')[1])) {
					$('#actualWeight').val(0);
					$('#chargedWeight').val(0);
					showMessage('error', 'Actual Weight and Charge Weight cant not be greator than ' + Number(element.split('_')[1]) + ' Kg For ' + packingTypesNameHM[packingTypeId]);
					return false;
				} else if (packingTypeId == Number(element.split('_')[0])){
					$('#chargedWeight').val(actualWeight);
				}
			}
 		}
	}
	
	return true;
}

function validatedSelectedPackingTypeForToPayBooking(typeofPackingId) {
	if(configuration.dontAllowSelectedPackingTypeForToPay == undefined
		|| configuration.dontAllowSelectedPackingTypeForToPay == 'false' 
		|| $('#wayBillType').val() != WAYBILL_TYPE_TO_PAY)
		return true;
	
	let packingTypeList		= (configuration.packingTypeIdsForNotAllowedBookingInTopay).split(',');

	if(isValueExistInArray(packingTypeList, typeofPackingId)) {
		showMessage('error', 'You can not book ' + packingTypesNameHM[typeofPackingId] + ' for To Pay !');
		$('#quantity').focus();
		return false;
	}
	
	return true;
}

function removeStringFromCommaSeperatedString(list, value, separator) {
	let values = list.split(separator);
	
	for(let i = 0 ; i < values.length ; i++) {
		if(values[i] == value) {
			values.splice(i, 1);
			return values.join(separator);
		}
	}
	
	return list;
}

function validateSaidToContainRemark() {
	if(configuration.allowToEnterSaidToContainsWiseRemark == 'false' || configuration.validateRemarkForPerticularSaidToContains == 'false')
		return true;
		
	let stcListForRemarkValidate		= (configuration.saidToContainsIdsForCompalsaryRemark).split(',');
	
	let consignmentGoodsId = $('#consignmentGoodsId').val();
	
	return !(isValueExistInArray(stcListForRemarkValidate, consignmentGoodsId)
		&& !validateInput(1, 'consignmentRemark', 'consignmentRemark', 'error', 'Please add remark for selected Said to Contain !'));
}

function checkMinimumQuantityAmountForPackingTypes() {
	if(configuration.validateMinimumQuantityAmountForPackingTypes == 'false') return true;
		
	if(configuration.validateBranchWiseMinimumQuantityAmountForPackingTypes == 'true'
		&& (!isValueExistInArray((configuration.branchIdsToValidateMinimumQuantityAmountForPackingType).split(","), executive.branchId))) 
			return true;
				
	let qtyAmnt 			= $('#qtyAmount').val();
	let typeofPackingId 	= getPackingTypeId();
	let packingTypeAndRate	= (configuration.packingTypeWithMinRateToValidateMinimumQuantityAmount).split(',');
		
	for (const pair of packingTypeAndRate) {
		let [packingTypeIdd, rate] = pair.split('_');
		
		if(Number(typeofPackingId) == Number(packingTypeIdd) && Number(qtyAmnt) < Number(rate)) {
			showMessage('error', 'Entered Amount cannot be less than ' + rate + ' for the selected Packing Type !');
			$('#qtyAmount').focus();
			return false;
		}
	}
	
	return true;
}

function viewConsignmentRemark() {
	let remarkArr	= [];
	let i	= 1;
	
	for (let k in consignmentDataHM) {
		let remark = consignmentDataHM[k].remark;
		
		if(remark != undefined && remark != null && remark.length > 0) {
			remarkArr.push('( ' + i + ' ) - ' + remark);
			i++;
		}
	}
	
	if(remarkArr.length == 0)
		return;
		
	$('#consignmentRemarkDetailsPop').dialog({
		modal: true,
		title: "Remark Details",
		/*hide: "puff",
		show : "slide",*/
		height : 300,
		width : 400,
		open: function () {
			$(this).html("<div class='consignmentRemarkDetails'>" + remarkArr.join('<br>') + "</div>");
		}, buttons: {
			/*text: "Close",
			open: function() {
				$(this).addClass('okClass');
			},*/
			Ok: function () {
				$(this).dialog("close");
				$(this).dialog( "destroy" );
				$('#consignmentRemarkDetails').remove();
			}
		}
	});
}

function calculateArticleBasedCharge() {
	if(configuration.calculateExcessArtChargePerQtyAfterFixQty == 'true') {
		$('#charge' + ART_CHARGE).val(0);
		
		if($('#wayBillType').val() != WAYBILL_TYPE_FOC && $('#chargeType').val() == CHARGETYPE_ID_QUANTITY) {
			let maxQty			= parseInt(configuration.maxQuantityForExcessArticleCharge, 10);
			let baseCharge		= parseInt(configuration.baseRateForExcessArticleCharge, 10);
			let extraCharge		= parseInt(configuration.perQuantityChargeForExcessArticleCharge, 10);
			let artCharge		= 0;
			
			if(TotalQty > 0)
				artCharge		= TotalQty <= maxQty ? baseCharge : baseCharge + (TotalQty - maxQty) * extraCharge;
			
			$('#charge' + ART_CHARGE).val(artCharge);
		}
	}
}